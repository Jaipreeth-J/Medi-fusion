/**
 * MOOD OVERVIEW
 * Mini summary of mood and mental health for the dashboard
 */

import { memo } from 'react';
import { Brain, Smile, Frown, Meh, TrendingUp, TrendingDown, Minus, Zap, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMood } from '@/hooks/useMood';
import { Link } from 'react-router-dom';
import { MOOD_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

export const MoodOverview = memo(function MoodOverview() {
  const { entries, loading, getStats, getWeeklyData, getTodayEntry } = useMood();
  const stats = getStats();
  const weeklyData = getWeeklyData(0);
  const todayEntry = getTodayEntry();

  const getMoodEmoji = (score: number) => {
    const option = MOOD_OPTIONS.find(m => m.value === score);
    return option?.emoji || '😐';
  };

  const getMoodLabel = (score: number) => {
    const option = MOOD_OPTIONS.find(m => m.value === score);
    return option?.label || 'Unknown';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Mental Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const hasData = entries.length > 0;

  // Prepare chart data (only show days with data)
  const chartData = weeklyData.map(d => ({
    ...d,
    mood: d.mood || 0,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Mental Health
          </CardTitle>
          <Link to="/mental-health">
            <Button variant="ghost" size="sm" className="text-xs">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-4">
            {/* Today's mood */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Today's Mood</p>
                {todayEntry ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMoodEmoji(todayEntry.mood_score)}</span>
                    <span className="text-sm font-medium">{getMoodLabel(todayEntry.mood_score)}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not logged yet</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">30-Day Avg</p>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-semibold">{stats?.avgMood || '--'}</span>
                  <span className="text-xs text-muted-foreground">/10</span>
                </div>
              </div>
            </div>

            {/* Mini chart */}
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" hide />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background px-2 py-1 text-xs shadow-sm">
                            <p className="font-medium">{data.date}</p>
                            <p className="text-muted-foreground">
                              Mood: {data.mood ? data.mood.toFixed(1) : 'No data'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="mood"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#moodGradient)"
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick stats */}
            <div className="flex gap-4 text-xs">
              {stats?.avgStress && (
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3 text-warning" />
                  <span className="text-muted-foreground">Stress:</span>
                  <span className="font-medium">{stats.avgStress}</span>
                </div>
              )}
              {stats?.avgAnxiety && (
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span className="text-muted-foreground">Anxiety:</span>
                  <span className="font-medium">{stats.avgAnxiety}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <p>No mood entries yet</p>
            <Link to="/mental-health">
              <Button variant="outline" size="sm" className="mt-3">
                Log Mood
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
