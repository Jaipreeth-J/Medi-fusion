/**
 * VITALS HOOK
 * Fetches and manages user vitals data with trend calculations
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';

export interface Vital {
  id: string;
  user_id: string;
  recorded_at: string;
  heart_rate: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  blood_sugar: number | null;
  spo2: number | null;
  weight_kg: number | null;
  temperature_celsius: number | null;
  sleep_hours: number | null;
  activity_minutes: number | null;
  notes: string | null;
  created_at: string;
  // Device source attribution
  device_name: string | null;
  device_type: string | null;
  source_app: string | null;
  health_platform: string | null;
  sync_timestamp: string | null;
  sync_source_chain: { chain: string[] } | null;
}

export interface VitalInput {
  heart_rate?: number | null;
  blood_pressure_systolic?: number | null;
  blood_pressure_diastolic?: number | null;
  blood_sugar?: number | null;
  spo2?: number | null;
  weight_kg?: number | null;
  temperature_celsius?: number | null;
  sleep_hours?: number | null;
  activity_minutes?: number | null;
  notes?: string | null;
  recorded_at?: string;
}

// Helper to calculate trend
export function calculateTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
  const diff = current - previous;
  const percentChange = (diff / previous) * 100;
  if (percentChange > 2) return 'up';
  if (percentChange < -2) return 'down';
  return 'stable';
}

// Format data for charts with device source info
export function formatChartData(vitals: Vital[], field: keyof Vital) {
  return vitals
    .filter((v) => v[field] != null)
    .map((v) => ({
      date: format(new Date(v.recorded_at), 'MMM dd'),
      fullDate: v.recorded_at,
      value: v[field] as number,
      // Include device source info for tooltips
      device_name: v.device_name,
      device_type: v.device_type,
      source_app: v.source_app,
      health_platform: v.health_platform,
      sync_source_chain: v.sync_source_chain,
    }))
    .reverse();
}

// Format blood pressure for charts (combined) with device source
export function formatBloodPressureData(vitals: Vital[]) {
  return vitals
    .filter((v) => v.blood_pressure_systolic != null && v.blood_pressure_diastolic != null)
    .map((v) => ({
      date: format(new Date(v.recorded_at), 'MMM dd'),
      fullDate: v.recorded_at,
      systolic: v.blood_pressure_systolic as number,
      diastolic: v.blood_pressure_diastolic as number,
      // Include device source info for tooltips
      device_name: v.device_name,
      device_type: v.device_type,
      source_app: v.source_app,
      health_platform: v.health_platform,
      sync_source_chain: v.sync_source_chain,
    }))
    .reverse();
}

export function useVitals(days: number = 30) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const startDate = subDays(new Date(), days);

  const { data: vitals = [], isLoading, error } = useQuery({
    queryKey: ['vitals', user?.id, days],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data as Vital[];
    },
    enabled: !!user?.id,
  });

  const addVital = useMutation({
    mutationFn: async (input: VitalInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('vitals')
        .insert({
          user_id: user.id,
          ...input,
          recorded_at: input.recorded_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals'] });
      toast.success('Vitals recorded successfully');
    },
    onError: (error) => {
      toast.error('Failed to record vitals');
      console.error('Error adding vital:', error);
    },
  });

  // Calculate latest values and trends
  const getLatestMetric = (field: keyof Vital) => {
    const withData = vitals.filter((v) => v[field] != null);
    if (withData.length === 0) return { value: null, trend: 'stable' as const, previous: null };

    const latest = withData[0][field] as number;
    const previous = withData.length > 1 ? (withData[1][field] as number) : latest;

    return {
      value: latest,
      previous,
      trend: calculateTrend(latest, previous),
    };
  };

  // Get summary statistics
  const getSummary = () => {
    return {
      heartRate: getLatestMetric('heart_rate'),
      bloodPressureSystolic: getLatestMetric('blood_pressure_systolic'),
      bloodPressureDiastolic: getLatestMetric('blood_pressure_diastolic'),
      bloodSugar: getLatestMetric('blood_sugar'),
      spo2: getLatestMetric('spo2'),
      weight: getLatestMetric('weight_kg'),
      temperature: getLatestMetric('temperature_celsius'),
      sleep: getLatestMetric('sleep_hours'),
      activity: getLatestMetric('activity_minutes'),
    };
  };

  // Memoize chart data — only recompute when vitals array changes
  const heartRateData = useMemo(() => formatChartData(vitals, 'heart_rate'), [vitals]);
  const bloodPressureData = useMemo(() => formatBloodPressureData(vitals), [vitals]);
  const bloodSugarData = useMemo(() => formatChartData(vitals, 'blood_sugar'), [vitals]);
  const spo2Data = useMemo(() => formatChartData(vitals, 'spo2'), [vitals]);
  const weightData = useMemo(() => formatChartData(vitals, 'weight_kg'), [vitals]);
  const temperatureData = useMemo(() => formatChartData(vitals, 'temperature_celsius'), [vitals]);
  const sleepData = useMemo(() => formatChartData(vitals, 'sleep_hours'), [vitals]);
  const activityData = useMemo(() => formatChartData(vitals, 'activity_minutes'), [vitals]);

  return {
    vitals,
    isLoading,
    error,
    addVital,
    getLatestMetric,
    getSummary,
    // Chart data formatters
    heartRateData,
    bloodPressureData,
    bloodSugarData,
    spo2Data,
    weightData,
    temperatureData,
    sleepData,
    activityData,
  };
}
