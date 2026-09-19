/**
 * SYMPTOMS HOOK
 * Fetches and manages user symptom data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Symptom {
  id: string;
  user_id: string;
  symptom_name: string;
  severity: number;
  duration_hours: number | null;
  frequency: 'once' | 'occasionally' | 'frequently' | 'constantly' | null;
  body_location: string | null;
  description: string | null;
  started_at: string;
  resolved_at: string | null;
  created_at: string;
}

export interface SymptomInput {
  symptom_name: string;
  severity: number;
  duration_hours?: number | null;
  frequency?: 'once' | 'occasionally' | 'frequently' | 'constantly' | null;
  body_location?: string | null;
  description?: string | null;
  started_at?: string;
}

export function useSymptoms() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all symptoms
  const { data: symptoms = [], isLoading, error } = useQuery({
    queryKey: ['symptoms', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data as Symptom[];
    },
    enabled: !!user?.id,
  });

  // Get active (unresolved) symptoms
  const activeSymptoms = symptoms.filter((s) => !s.resolved_at);
  
  // Get resolved symptoms
  const resolvedSymptoms = symptoms.filter((s) => s.resolved_at);

  // Add new symptom
  const addSymptom = useMutation({
    mutationFn: async (input: SymptomInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('symptoms')
        .insert({
          user_id: user.id,
          ...input,
          started_at: input.started_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      toast.success('Symptom logged successfully');
    },
    onError: (error) => {
      toast.error('Failed to log symptom');
      console.error('Error adding symptom:', error);
    },
  });

  // Update symptom
  const updateSymptom = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Symptom> & { id: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('symptoms')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      toast.success('Symptom updated');
    },
    onError: (error) => {
      toast.error('Failed to update symptom');
      console.error('Error updating symptom:', error);
    },
  });

  // Mark symptom as resolved
  const resolveSymptom = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('symptoms')
        .update({ resolved_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      toast.success('Symptom marked as resolved');
    },
    onError: (error) => {
      toast.error('Failed to resolve symptom');
      console.error('Error resolving symptom:', error);
    },
  });

  // Delete symptom
  const deleteSymptom = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('symptoms')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['symptoms'] });
      toast.success('Symptom deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete symptom');
      console.error('Error deleting symptom:', error);
    },
  });

  // Get symptom statistics
  const getStats = () => {
    const totalSymptoms = symptoms.length;
    const activeCount = activeSymptoms.length;
    const resolvedCount = resolvedSymptoms.length;
    
    // Most common symptoms
    const symptomCounts = symptoms.reduce((acc, s) => {
      acc[s.symptom_name] = (acc[s.symptom_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommon = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Average severity
    const avgSeverity = symptoms.length > 0
      ? symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length
      : 0;

    return {
      totalSymptoms,
      activeCount,
      resolvedCount,
      mostCommon,
      avgSeverity,
    };
  };

  return {
    symptoms,
    activeSymptoms,
    resolvedSymptoms,
    isLoading,
    error,
    addSymptom,
    updateSymptom,
    resolveSymptom,
    deleteSymptom,
    getStats,
  };
}
