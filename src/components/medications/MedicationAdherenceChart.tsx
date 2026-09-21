/**
 * MEDICATION ADHERENCE CHART
 * Shows daily/weekly medication take rates from medication_logs
 */

import { useState, useMemo, forwardRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid as RechartCartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Wrap CartesianGrid to suppress forwardRef warning
const CartesianGrid = forwardRef<SVGElement, React.ComponentProps<typeof RechartCartesianGrid>>((props, _ref) => (
  <RechartCartesianGrid {...props} />
));
import { TrendingUp, Calendar, Pill } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMedications } from '@/hooks/useMedications';
import { format, subDays, startOfDay, eachDayOfInterval, startOfWeek, endOfWeek, eachWeekOfInterval, subWeeks } from 'date-fns';

type ViewMode = 'daily' | 'weekly';

export function MedicationAdherenceChart() {
  const { user } = useAuth();
  const { activeMedications } = useMedications();
  const [view, setView] = useState<ViewMode>('daily');

  // Fetch logs for the past 30 days
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['medication-logs-adherence', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const since = subDays(new Date(), 30);
      const { data, error } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('taken_at', since.toISOString())
        .order('taken_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate expected daily doses
  const expectedDailyDoses = useMemo(() => {
    return activeMedications.reduce((sum, med) => sum + (med.schedule_times?.length || med.times_per_day || 1), 0);
  }, [activeMedications]);

  // Daily chart data (last 7 days)
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.taken_at);
        return logDate >= dayStart && logDate < dayEnd && log.status === 'taken';
      });

      const taken = dayLogs.length;
      const rate = expectedDailyDoses > 0 ? Math.min(Math.round((taken / expectedDailyDoses) * 100), 100) : 0;

      return {
        label: format(day, 'EEE'),
        fullLabel: format(day, 'MMM d'),
        taken,
        expected: expectedDailyDoses,
        rate,
      };
    });
  }, [logs, expectedDailyDoses]);

  // Weekly chart data (last 4 weeks)
  const weeklyData = useMemo(() => {
    const weeks = eachWeekOfInterval({
      start: subWeeks(new Date(), 3),
      end: new Date(),
    }, { weekStartsOn: 1 });

    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd > new Date() ? new Date() : weekEnd });

      const weekLogs = logs.filter(log => {
        const logDate = new Date(log.taken_at);
        return logDate >= weekStart && logDate <= weekEnd && log.status === 'taken';
      });

      const taken = weekLogs.length;
      const expected = expectedDailyDoses * daysInWeek.length;
      const rate = expected > 0 ? Math.min(Math.round((taken / expected) * 100), 100) : 0;

      return {
        label: `${format(weekStart, 'MMM d')}`,
        fullLabel: `${format(weekStart, 'MMM d')} – ${format(weekEnd, 'MMM d')}`,
        taken,
        expected,
        rate,
      };
    });
  }, [logs, expectedDailyDoses]);

  const chartData = view === 'daily' ? dailyData : weeklyData;

  // Overall adherence rate
  const overallRate = useMemo(() => {
    const totalTaken = chartData.reduce((s, d) => s + d.taken, 0);
    const totalExpected = chartData.reduce((s, d) => s + d.expected, 0);
    return totalExpected > 0 ? Math.round((totalTaken / totalExpected) * 100) : 0;
  }, [chartData]);

  const getRateColor = (rate: number) => {
    if (rate >= 80) return 'hsl(var(--primary))';
    if (rate >= 50) return 'hsl(45 93% 47%)';
    return 'hsl(var(--destructive))';
  };

  const getRateBadgeVariant = (rate: number): 'default' | 'secondary' | 'destructive' => {
    if (rate >= 80) return 'default';
    if (rate >= 50) return 'secondary';
    return 'destructive';
  };

  if (activeMedications.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Medication Adherence
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Track how consistently you take your medications
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getRateBadgeVariant(overallRate)} className="text-xs">
              {overallRate}% overall
            </Badge>
            <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
              <TabsList className="h-8">
                <TabsTrigger value="daily" className="text-xs px-2.5 h-6">Daily</TabsTrigger>
                <TabsTrigger value="weekly" className="text-xs px-2.5 h-6">Weekly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-48 animate-pulse rounded-lg bg-muted" />
        ) : (
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
                        <p className="font-medium">{d.fullLabel}</p>
                        <p className="text-muted-foreground">{d.taken}/{d.expected} doses taken</p>
                        <p className="font-semibold" style={{ color: getRateColor(d.rate) }}>{d.rate}% adherence</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={getRateColor(entry.rate)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> ≥80%
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'hsl(45 93% 47%)' }} /> 50-79%
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-sm bg-destructive" /> &lt;50%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
