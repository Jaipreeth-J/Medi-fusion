/**
 * MEDICATIONS HOOK
 * Manages medication tracking, logging, and interaction checking
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { isRateLimited } from '@/lib/rateLimitHandler';

export interface Medication {
  id: string;
  user_id: string;
  medication_name: string;
  dosage: string;
  dosage_unit: string;
  frequency: string;
  times_per_day: number;
  schedule_times: string[];
  instructions: string | null;
  purpose: string | null;
  prescribing_doctor: string | null;
  pharmacy: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  refill_reminder_days: number | null;
  quantity_remaining: number | null;
  last_taken_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicationLog {
  id: string;
  user_id: string;
  medication_id: string;
  taken_at: string;
  scheduled_time: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface DrugInteraction {
  medications: string[];
  severity: 'none' | 'minor' | 'moderate' | 'major' | 'contraindicated';
  mechanism: string;
  effects: string;
  recommendation: string;
}

export interface InteractionAnalysis {
  overallSeverity: 'none' | 'minor' | 'moderate' | 'major' | 'contraindicated' | 'unknown';
  summary: string;
  interactions: DrugInteraction[];
  generalWarnings: string[];
  monitoringAdvice: string[];
  disclaimer: string;
  analyzedAt: string;
}

export interface MedicationFormData {
  medication_name: string;
  dosage: string;
  dosage_unit: string;
  frequency: string;
  times_per_day: number;
  schedule_times: string[];
  instructions?: string;
  purpose?: string;
  prescribing_doctor?: string;
  pharmacy?: string;
  start_date: string;
  end_date?: string;
  refill_reminder_days?: number;
  quantity_remaining?: number;
}

export function useMedications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);

  // Fetch all medications
  const { data: medications = [], isLoading } = useQuery({
    queryKey: ['medications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('is_active', { ascending: false })
        .order('medication_name', { ascending: true });

      if (error) throw error;
      return data as Medication[];
    },
    enabled: !!user?.id,
  });

  // Get active medications
  const activeMedications = medications.filter(m => m.is_active);

  // Fetch medication logs for today
  const { data: todayLogs = [] } = useQuery({
    queryKey: ['medication-logs-today', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('taken_at', today.toISOString())
        .order('taken_at', { ascending: false });

      if (error) throw error;
      return data as MedicationLog[];
    },
    enabled: !!user?.id,
  });

  // Add medication
  const addMedication = useMutation({
    mutationFn: async (data: MedicationFormData) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: newMed, error } = await supabase
        .from('medications')
        .insert({
          user_id: user.id,
          ...data,
        })
        .select()
        .single();

      if (error) throw error;
      return newMed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      toast.success('Medication added successfully');
    },
    onError: (error) => {
      console.error('Error adding medication:', error);
      toast.error('Failed to add medication');
    },
  });

  // Update medication
  const updateMedication = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Medication> & { id: string }) => {
      const { data: updated, error } = await supabase
        .from('medications')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      toast.success('Medication updated');
    },
    onError: (error) => {
      console.error('Error updating medication:', error);
      toast.error('Failed to update medication');
    },
  });

  // Delete medication
  const deleteMedication = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      toast.success('Medication removed');
    },
    onError: (error) => {
      console.error('Error deleting medication:', error);
      toast.error('Failed to remove medication');
    },
  });

  // Log medication taken
  const logMedicationTaken = useMutation({
    mutationFn: async ({ 
      medicationId, 
      scheduledTime, 
      notes 
    }: { 
      medicationId: string; 
      scheduledTime?: string; 
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('medication_logs')
        .insert({
          user_id: user.id,
          medication_id: medicationId,
          scheduled_time: scheduledTime,
          notes,
          status: 'taken',
        })
        .select()
        .single();

      if (error) throw error;

      // Update last_taken_at on medication
      await supabase
        .from('medications')
        .update({ last_taken_at: new Date().toISOString() })
        .eq('id', medicationId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medication-logs-today'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      toast.success('Medication logged');
    },
    onError: (error) => {
      console.error('Error logging medication:', error);
      toast.error('Failed to log medication');
    },
  });

  // Check drug interactions
  const checkInteractions = useCallback(async (): Promise<InteractionAnalysis | null> => {
    if (activeMedications.length < 2) {
      return null;
    }

    setIsCheckingInteractions(true);
    try {
      const response = await supabase.functions.invoke('check-drug-interactions', {
        body: { medications: activeMedications },
      });

      if (response.error) {
        if (isRateLimited(response)) return null;
        throw response.error;
      }
      return response.data as InteractionAnalysis;
    } catch (error) {
      console.error('Error checking interactions:', error);
      toast.error('Failed to check drug interactions');
      return null;
    } finally {
      setIsCheckingInteractions(false);
    }
  }, [activeMedications]);

  // Get medications due at a specific time
  const getMedicationsDue = useCallback((time: string) => {
    return activeMedications.filter(med => 
      med.schedule_times?.includes(time)
    );
  }, [activeMedications]);

  // Check if medication was taken today at scheduled time
  const wasTakenToday = useCallback((medicationId: string, scheduledTime?: string) => {
    return todayLogs.some(log => 
      log.medication_id === medicationId && 
      (!scheduledTime || log.scheduled_time === scheduledTime)
    );
  }, [todayLogs]);

  return {
    medications,
    activeMedications,
    todayLogs,
    isLoading,
    isCheckingInteractions,
    addMedication,
    updateMedication,
    deleteMedication,
    logMedicationTaken,
    checkInteractions,
    getMedicationsDue,
    wasTakenToday,
  };
}
