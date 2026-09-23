/**
 * HEALTH INSIGHTS HOOK
 * Manages AI-generated health insights and weekly summaries
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { isRateLimited } from '@/lib/rateLimitHandler';
import { subDays } from 'date-fns';

export interface HealthInsight {
  id: string;
  user_id: string;
  insight_type: string;
  title: string;
  summary: string;
  recommendations: string[] | null;
  data_sources: string[] | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export function useHealthInsights() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch stored insights
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['health-insights', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('health_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as HealthInsight[];
    },
    enabled: !!user?.id,
  });

  // Get the latest weekly insight
  const latestWeeklyInsight = insights.find(i => i.insight_type === 'weekly');

  // Generate new insights
  const generateInsights = useCallback(async () => {
    if (!user?.id) return null;

    setIsGenerating(true);
    try {
      // Fetch recent health data
      const weekAgo = subDays(new Date(), 7);

      const [vitalsRes, symptomsRes, moodRes, profileRes] = await Promise.all([
        supabase
          .from('vitals')
          .select('*')
          .eq('user_id', user.id)
          .gte('recorded_at', weekAgo.toISOString())
          .order('recorded_at', { ascending: false }),
        supabase
          .from('symptoms')
          .select('*')
          .eq('user_id', user.id)
          .gte('started_at', weekAgo.toISOString())
          .order('started_at', { ascending: false }),
        supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .gte('recorded_at', weekAgo.toISOString())
          .order('recorded_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      // Call the edge function
      const response = await supabase.functions.invoke('generate-health-insights', {
        body: {
          vitals: vitalsRes.data || [],
          symptoms: symptomsRes.data || [],
          moodEntries: moodRes.data || [],
          profile: profileRes.data,
        },
      });

      if (response.error) {
        if (isRateLimited(response)) return;
        throw response.error;
      }

      const { content, generatedAt } = response.data;

      // Store the insight
      const { data: savedInsight, error: saveError } = await supabase
        .from('health_insights')
        .insert({
          user_id: user.id,
          insight_type: 'weekly',
          title: 'Weekly Health Summary',
          summary: content,
          data_sources: ['vitals', 'symptoms', 'mood_entries'],
          period_start: weekAgo.toISOString(),
          period_end: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['health-insights'] });

      toast.success('Health insights generated!');
      return savedInsight;
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [user?.id, queryClient]);

  // Check if we should suggest generating new insights
  const shouldGenerateNew = useCallback(() => {
    if (!latestWeeklyInsight) return true;
    
    const lastGenerated = new Date(latestWeeklyInsight.created_at);
    const daysSinceLastGenerated = (Date.now() - lastGenerated.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceLastGenerated >= 7;
  }, [latestWeeklyInsight]);

  return {
    insights,
    latestWeeklyInsight,
    isLoading,
    isGenerating,
    generateInsights,
    shouldGenerateNew,
  };
}
