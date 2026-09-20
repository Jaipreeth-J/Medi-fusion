import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { startOfWeek, endOfWeek, subWeeks, format, eachDayOfInterval, parseISO } from 'date-fns';

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_score: number;
  stress_level: number | null;
  anxiety_level: number | null;
  energy_level: number | null;
  sleep_quality: number | null;
  activities: string[] | null;
  triggers: string[] | null;
  journal_entry: string | null;
  gratitude_notes: string[] | null;
  recorded_at: string;
  created_at: string;
}

export interface MoodFormData {
  mood_score: number;
  stress_level?: number;
  anxiety_level?: number;
  energy_level?: number;
  sleep_quality?: number;
  activities?: string[];
  triggers?: string[];
  journal_entry?: string;
  gratitude_notes?: string[];
}

interface WeeklyMoodData {
  day: string;
  date: string;
  mood: number | null;
  stress: number | null;
  anxiety: number | null;
  energy: number | null;
}

export function useMood() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading: loading } = useQuery({
    queryKey: ['mood-entries', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('recorded_at', thirtyDaysAgo.toISOString())
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return (data || []) as MoodEntry[];
    },
    enabled: !!user?.id,
  });

  const addEntryMutation = useMutation({
    mutationFn: async (formData: MoodFormData) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood_score: formData.mood_score,
          stress_level: formData.stress_level || null,
          anxiety_level: formData.anxiety_level || null,
          energy_level: formData.energy_level || null,
          sleep_quality: formData.sleep_quality || null,
          activities: formData.activities || null,
          triggers: formData.triggers || null,
          journal_entry: formData.journal_entry || null,
          gratitude_notes: formData.gratitude_notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MoodEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-entries'] });
      toast.success('Your mood entry has been saved');
    },
    onError: (error) => {
      console.error('Error adding mood entry:', error);
      toast.error('Failed to save mood entry');
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-entries'] });
      toast.success('Mood entry has been removed');
    },
    onError: (error) => {
      console.error('Error deleting mood entry:', error);
      toast.error('Failed to delete entry');
    },
  });

  const addEntry = async (formData: MoodFormData) => {
    try {
      return await addEntryMutation.mutateAsync(formData);
    } catch {
      return undefined;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await deleteEntryMutation.mutateAsync(id);
    } catch {
      // handled by onError
    }
  };

  // Get weekly data for charts
  const getWeeklyData = (weeksAgo: number = 0): WeeklyMoodData[] => {
    const now = new Date();
    const targetWeek = subWeeks(now, weeksAgo);
    const weekStart = startOfWeek(targetWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(targetWeek, { weekStartsOn: 1 });

    const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return daysInWeek.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayEntries = entries.filter(e =>
        format(parseISO(e.recorded_at), 'yyyy-MM-dd') === dayStr
      );

      const avgMood = dayEntries.length > 0
        ? dayEntries.reduce((sum, e) => sum + e.mood_score, 0) / dayEntries.length
        : null;
      const avgStress = dayEntries.filter(e => e.stress_level !== null).length > 0
        ? dayEntries.filter(e => e.stress_level !== null).reduce((sum, e) => sum + (e.stress_level || 0), 0) / dayEntries.filter(e => e.stress_level !== null).length
        : null;
      const avgAnxiety = dayEntries.filter(e => e.anxiety_level !== null).length > 0
        ? dayEntries.filter(e => e.anxiety_level !== null).reduce((sum, e) => sum + (e.anxiety_level || 0), 0) / dayEntries.filter(e => e.anxiety_level !== null).length
        : null;
      const avgEnergy = dayEntries.filter(e => e.energy_level !== null).length > 0
        ? dayEntries.filter(e => e.energy_level !== null).reduce((sum, e) => sum + (e.energy_level || 0), 0) / dayEntries.filter(e => e.energy_level !== null).length
        : null;

      return {
        day: format(day, 'EEE'),
        date: format(day, 'MMM d'),
        mood: avgMood ? Math.round(avgMood * 10) / 10 : null,
        stress: avgStress ? Math.round(avgStress * 10) / 10 : null,
        anxiety: avgAnxiety ? Math.round(avgAnxiety * 10) / 10 : null,
        energy: avgEnergy ? Math.round(avgEnergy * 10) / 10 : null,
      };
    });
  };

  // Get statistics
  const getStats = () => {
    if (entries.length === 0) return null;

    const avgMood = entries.reduce((sum, e) => sum + e.mood_score, 0) / entries.length;
    const stressEntries = entries.filter(e => e.stress_level !== null);
    const avgStress = stressEntries.length > 0
      ? stressEntries.reduce((sum, e) => sum + (e.stress_level || 0), 0) / stressEntries.length
      : null;
    const anxietyEntries = entries.filter(e => e.anxiety_level !== null);
    const avgAnxiety = anxietyEntries.length > 0
      ? anxietyEntries.reduce((sum, e) => sum + (e.anxiety_level || 0), 0) / anxietyEntries.length
      : null;

    const activityCounts: Record<string, number> = {};
    entries.forEach(e => {
      e.activities?.forEach(activity => {
        activityCounts[activity] = (activityCounts[activity] || 0) + 1;
      });
    });
    const topActivities = Object.entries(activityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([activity]) => activity);

    return {
      avgMood: Math.round(avgMood * 10) / 10,
      avgStress: avgStress ? Math.round(avgStress * 10) / 10 : null,
      avgAnxiety: avgAnxiety ? Math.round(avgAnxiety * 10) / 10 : null,
      totalEntries: entries.length,
      topActivities,
    };
  };

  const getTodayEntry = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return entries.find(e => format(parseISO(e.recorded_at), 'yyyy-MM-dd') === today);
  };

  return {
    entries,
    loading,
    adding: addEntryMutation.isPending,
    addEntry,
    deleteEntry,
    getWeeklyData,
    getStats,
    getTodayEntry,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['mood-entries'] }),
  };
}
