import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { useMood } from '@/hooks/useMood';
import { format, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

export function WeeklyMoodChart() {
  const { getWeeklyData } = useMood();
  const [weeksAgo, setWeeksAgo] = useState(0);
  
  const data = getWeeklyData(weeksAgo);
  const hasData = data.some(d => d.mood !== null);
  
  const weekStart = startOfWeek(subWeeks(new Date(), weeksAgo), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(subWeeks(new Date(), weeksAgo), { weekStartsOn: 1 });
  const weekLabel = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Mood Trends
            </CardTitle>
            <CardDescription>{weekLabel}</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeeksAgo(w => w + 1)}
              disabled={weeksAgo >= 4}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setWeeksAgo(w => w - 1)}
              disabled={weeksAgo <= 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>No mood data for this week. Start logging to see trends!</p>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="day" 
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 10]} 
                  ticks={[0, 2, 4, 6, 8, 10]}
                  className="text-xs fill-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-medium mb-2">{label}</p>
                        {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
                          entry.value !== null && (
                            <p key={index} className="text-sm" style={{ color: entry.color }}>
                              {entry.name}: {entry.value}/10
                            </p>
                          )
                        ))}
                      </div>
                    );
                  }}
                />
                <ReferenceLine 
                  y={5} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  opacity={0.5}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  name="Mood"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="energy"
                  name="Energy"
                  stroke="hsl(var(--info))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--info))', strokeWidth: 2, r: 3 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  name="Stress"
                  stroke="hsl(var(--warning))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--warning))', strokeWidth: 2, r: 3 }}
                  strokeDasharray="5 5"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Mood</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-info" />
            <span className="text-muted-foreground">Energy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-warning" style={{ borderStyle: 'dashed' }} />
            <span className="text-muted-foreground">Stress</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
