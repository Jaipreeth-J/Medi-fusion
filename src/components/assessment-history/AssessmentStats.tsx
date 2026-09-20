/**
 * ASSESSMENT STATISTICS COMPONENT
 * Shows overview stats for assessment history
 */

import { 
  Activity, 
  MessageSquare, 
  AlertTriangle, 
  Shield, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AssessmentStatsProps {
  stats: {
    total: number;
    weeklyInsights: number;
    chatAssessments: number;
    emergencies: number;
    highRisk: number;
    moderateRisk: number;
    lowRisk: number;
  };
}

export function AssessmentStats({ stats }: AssessmentStatsProps) {
  const statItems = [
    {
      label: 'Total Assessments',
      value: stats.total,
      icon: FileText,
      color: 'text-foreground',
      bgColor: 'bg-muted',
    },
    {
      label: 'Weekly Insights',
      value: stats.weeklyInsights,
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Chat Assessments',
      value: stats.chatAssessments,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Low Risk',
      value: stats.lowRisk,
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Moderate Risk',
      value: stats.moderateRisk,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'High Risk',
      value: stats.highRisk,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="border shadow-sm">
            <CardContent className="p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bgColor}`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
