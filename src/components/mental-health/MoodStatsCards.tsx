import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smile, Flame, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { useMood } from '@/hooks/useMood';
import { MOOD_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function MoodStatsCards() {
  const { getStats, entries, getTodayEntry } = useMood();
  const stats = getStats();
  const todayEntry = getTodayEntry();

  const getMoodEmoji = (score: number) => {
    const option = MOOD_OPTIONS.find(m => m.value === Math.round(score));
    return option?.emoji || '😐';
  };

  const getMoodLabel = (score: number) => {
    const option = MOOD_OPTIONS.find(m => m.value === Math.round(score));
    return option?.label || 'Neutral';
  };

  const getLevelStatus = (value: number | null, inverse: boolean = false) => {
    if (value === null) return { color: 'text-muted-foreground', label: 'N/A' };
    if (inverse) {
      if (value <= 3) return { color: 'text-success', label: 'Low' };
      if (value <= 6) return { color: 'text-warning', label: 'Moderate' };
      return { color: 'text-destructive', label: 'High' };
    }
    if (value <= 3) return { color: 'text-destructive', label: 'Low' };
    if (value <= 6) return { color: 'text-warning', label: 'Moderate' };
    return { color: 'text-success', label: 'Good' };
  };

  if (!stats) {
    return (
      <Card className="col-span-full">
        <CardContent className="py-12 text-center">
          <Smile className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No mood data yet</h3>
          <p className="text-muted-foreground">
            Start logging your mood to see statistics and trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stressStatus = getLevelStatus(stats.avgStress, true);
  const anxietyStatus = getLevelStatus(stats.avgAnxiety, true);

  return (
    <>
      {/* Today's Mood */}
      <Card className={cn(
        "border-2",
        todayEntry ? "border-primary/30 bg-primary/5" : "border-dashed"
      )}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayEntry ? (
            <div className="flex items-center gap-3">
              <span className="text-4xl">{getMoodEmoji(todayEntry.mood_score)}</span>
              <div>
                <p className="font-semibold text-lg">{getMoodLabel(todayEntry.mood_score)}</p>
                <p className="text-sm text-muted-foreground">Logged today</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-muted-foreground text-sm">No entry yet</p>
              <p className="text-xs text-muted-foreground mt-1">Log how you're feeling!</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Average Mood */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            30-Day Average
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getMoodEmoji(stats.avgMood)}</span>
            <div>
              <p className="font-semibold text-2xl">{stats.avgMood}</p>
              <p className="text-sm text-muted-foreground">{getMoodLabel(stats.avgMood)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Stress Level */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Avg Stress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold", stressStatus.color)}>
              {stats.avgStress ?? 'N/A'}
            </span>
            {stats.avgStress && <span className="text-muted-foreground">/10</span>}
          </div>
          <p className={cn("text-sm", stressStatus.color)}>{stressStatus.label}</p>
        </CardContent>
      </Card>
      
      {/* Anxiety Level */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Avg Anxiety
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold", anxietyStatus.color)}>
              {stats.avgAnxiety ?? 'N/A'}
            </span>
            {stats.avgAnxiety && <span className="text-muted-foreground">/10</span>}
          </div>
          <p className={cn("text-sm", anxietyStatus.color)}>{anxietyStatus.label}</p>
        </CardContent>
      </Card>
    </>
  );
}
