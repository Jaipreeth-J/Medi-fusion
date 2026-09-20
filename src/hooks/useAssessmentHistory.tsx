/**
 * ASSESSMENT HISTORY HOOK
 * Fetches past AI clinical assessments from health insights and chat conversations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Assessment {
  id: string;
  type: 'weekly_insight' | 'chat_assessment' | 'symptom_analysis' | 'image_analysis';
  title: string;
  content: string;
  riskLevel?: 'low' | 'moderate' | 'high' | null;
  isEmergency: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export function useAssessmentHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['assessment-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch health insights
      const { data: insights, error: insightsError } = await supabase
        .from('health_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (insightsError) throw insightsError;

      // Fetch chat conversations with AI responses
      const { data: conversations, error: convoError } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          summary,
          is_emergency,
          created_at,
          updated_at,
          chat_messages (
            id,
            content,
            role,
            is_emergency_response,
            metadata,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(50);

      if (convoError) throw convoError;

      // Transform health insights to assessments
      const insightAssessments: Assessment[] = (insights || []).map((insight) => ({
        id: insight.id,
        type: 'weekly_insight' as const,
        title: insight.title,
        content: insight.summary,
        riskLevel: extractRiskLevel(insight.summary),
        isEmergency: false,
        createdAt: insight.created_at,
        metadata: {
          periodStart: insight.period_start,
          periodEnd: insight.period_end,
          dataSources: insight.data_sources,
          recommendations: insight.recommendations,
        },
      }));

      // Transform chat conversations to assessments (only those with AI clinical responses)
      const chatAssessments: Assessment[] = [];
      
      for (const convo of conversations || []) {
        const aiMessages = convo.chat_messages?.filter(
          (msg: { role: string; content: string }) => 
            msg.role === 'assistant' && 
            (msg.content.includes('Clinical Summary') || 
             msg.content.includes('Risk Level') ||
             msg.content.includes('Possible Medical Conditions') ||
             msg.content.includes('EMERGENCY'))
        ) || [];

        for (const msg of aiMessages) {
          chatAssessments.push({
            id: msg.id,
            type: 'chat_assessment' as const,
            title: convo.title || 'Clinical Assessment',
            content: msg.content,
            riskLevel: extractRiskLevel(msg.content),
            isEmergency: msg.is_emergency_response || convo.is_emergency || false,
            createdAt: msg.created_at,
            metadata: {
              conversationId: convo.id,
              conversationSummary: convo.summary,
            },
          });
        }
      }

      // Combine and sort by date
      const allAssessments = [...insightAssessments, ...chatAssessments];
      allAssessments.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return allAssessments;
    },
    enabled: !!user?.id,
  });

  // Group assessments by month
  const groupedByMonth = assessments.reduce((groups, assessment) => {
    const date = new Date(assessment.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(assessment);
    
    return groups;
  }, {} as Record<string, Assessment[]>);

  // Statistics
  const stats = {
    total: assessments.length,
    weeklyInsights: assessments.filter(a => a.type === 'weekly_insight').length,
    chatAssessments: assessments.filter(a => a.type === 'chat_assessment').length,
    emergencies: assessments.filter(a => a.isEmergency).length,
    highRisk: assessments.filter(a => a.riskLevel === 'high').length,
    moderateRisk: assessments.filter(a => a.riskLevel === 'moderate').length,
    lowRisk: assessments.filter(a => a.riskLevel === 'low').length,
  };

  // Delete an assessment
  const deleteAssessment = useMutation({
    mutationFn: async (assessment: Assessment) => {
      if (!user?.id) throw new Error('Not authenticated');

      if (assessment.type === 'weekly_insight') {
        const { error } = await supabase
          .from('health_insights')
          .delete()
          .eq('id', assessment.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else if (assessment.type === 'chat_assessment') {
        // Delete the specific chat message
        const { error } = await supabase
          .from('chat_messages')
          .delete()
          .eq('id', assessment.id)
          .eq('user_id', user.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment-history'] });
      queryClient.invalidateQueries({ queryKey: ['health-insights'] });
      toast.success('Assessment deleted');
    },
    onError: (error) => {
      console.error('Error deleting assessment:', error);
      toast.error('Failed to delete assessment');
    },
  });

  return {
    assessments,
    groupedByMonth,
    stats,
    isLoading,
    deleteAssessment,
  };
}

// Helper to extract risk level from AI response content
function extractRiskLevel(content: string): 'low' | 'moderate' | 'high' | null {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('risk level') || lowerContent.includes('⚠️ risk')) {
    if (lowerContent.includes('high') || lowerContent.includes('urgent') || lowerContent.includes('emergency')) {
      return 'high';
    }
    if (lowerContent.includes('moderate') || lowerContent.includes('medium')) {
      return 'moderate';
    }
    if (lowerContent.includes('low') || lowerContent.includes('minimal')) {
      return 'low';
    }
  }
  
  // Check for concerning patterns even without explicit risk level
  if (lowerContent.includes('emergency') || lowerContent.includes('immediate medical')) {
    return 'high';
  }
  
  return null;
}
