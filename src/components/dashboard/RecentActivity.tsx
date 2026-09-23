/**
 * RECENT ACTIVITY
 * Timeline of recent health tracking activities
 */

import { memo } from 'react';
import { Activity, Heart, Stethoscope, Brain, Image, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVitals } from '@/hooks/useVitals';
import { useSymptoms } from '@/hooks/useSymptoms';
import { useMood } from '@/hooks/useMood';
import { useMedicalImages } from '@/hooks/useMedicalImages';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'vital' | 'symptom' | 'mood' | 'image';
  title: string;
  subtitle?: string;
  timestamp: string;
  icon: typeof Heart;
  color: string;
}

export const RecentActivity = memo(function RecentActivity() {
  const { vitals } = useVitals(7);
  const { symptoms } = useSymptoms();
  const { entries: moodEntries } = useMood();
  const { images } = useMedicalImages();

  // Combine and sort activities
  const activities: ActivityItem[] = [
    ...vitals.slice(0, 5).map((v) => ({
      id: v.id,
      type: 'vital' as const,
      title: 'Vitals Recorded',
      subtitle: [
        v.heart_rate && `HR: ${v.heart_rate}`,
        v.blood_pressure_systolic && `BP: ${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}`,
      ]
        .filter(Boolean)
        .join(', ') || 'Vitals logged',
      timestamp: v.recorded_at,
      icon: Heart,
      color: 'bg-rose-500/10 text-rose-500',
    })),
    ...symptoms.slice(0, 5).map((s) => ({
      id: s.id,
      type: 'symptom' as const,
      title: s.symptom_name,
      subtitle: `Severity: ${s.severity}/10`,
      timestamp: s.started_at,
      icon: Stethoscope,
      color: 'bg-amber-500/10 text-amber-500',
    })),
    ...moodEntries.slice(0, 5).map((m) => ({
      id: m.id,
      type: 'mood' as const,
      title: 'Mood Logged',
      subtitle: `Score: ${m.mood_score}/10`,
      timestamp: m.recorded_at,
      icon: Brain,
      color: 'bg-violet-500/10 text-violet-500',
    })),
    ...images.slice(0, 3).map((i) => ({
      id: i.id,
      type: 'image' as const,
      title: 'Image Uploaded',
      subtitle: i.image_type || 'Medical image',
      timestamp: i.created_at,
      icon: Image,
      color: 'bg-cyan-500/10 text-cyan-500',
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatTimestamp = (timestamp: string) => {
    const date = parseISO(timestamp);
    if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  const recentActivities = activities.slice(0, 6);

  if (recentActivities.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-sm text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-xs mt-1">Start tracking to see your activity here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-start gap-3"
            >
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', activity.color)}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                {activity.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{activity.subtitle}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTimestamp(activity.timestamp)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
