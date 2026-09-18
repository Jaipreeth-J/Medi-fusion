/**
 * VITAL CHART COMPONENT
 * Reusable chart component for displaying vital trends
 */

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  date: string;
  value: number;
  device_name?: string | null;
  health_platform?: string | null;
  source_app?: string | null;
}

interface VitalChartProps {
  title: string;
  data: ChartDataPoint[];
  color?: string;
  unit?: string;
  normalRange?: { min: number; max: number };
  height?: number;
  className?: string;
  gradientId?: string;
}

export function VitalChart({
  title,
  data,
  color = 'hsl(var(--primary))',
  unit = '',
  normalRange,
  height = 200,
  className,
  gradientId,
}: VitalChartProps) {
  const chartId = gradientId || title.toLowerCase().replace(/\s/g, '-');

  // Calculate domain with padding
  const domain = useMemo(() => {
    if (data.length === 0) return [0, 100];
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1 || 10;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [data]);

  if (data.length === 0) {
    return (
      <Card className={cn('border-border/50', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            <p className="text-sm">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={`gradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis
              domain={domain}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}${unit}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload as ChartDataPoint;
                const sourceName = data.device_name || data.source_app || data.health_platform;
                
                return (
                  <div className="rounded-lg border bg-card p-3 shadow-lg">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-lg font-bold text-primary">
                      {payload[0].value} {unit}
                    </p>
                    {sourceName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        from {sourceName}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            {normalRange && (
              <>
                <ReferenceLine
                  y={normalRange.min}
                  stroke="hsl(var(--success))"
                  strokeDasharray="5 5"
                  opacity={0.5}
                />
                <ReferenceLine
                  y={normalRange.max}
                  stroke="hsl(var(--success))"
                  strokeDasharray="5 5"
                  opacity={0.5}
                />
              </>
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${chartId})`}
              dot={{ fill: color, strokeWidth: 0, r: 3 }}
              activeDot={{ fill: color, strokeWidth: 2, stroke: 'white', r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
