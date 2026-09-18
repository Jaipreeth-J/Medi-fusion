/**
 * BLOOD PRESSURE CHART COMPONENT
 * Displays systolic and diastolic blood pressure trends
 */

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { VITAL_RANGES } from '@/lib/constants';

interface BloodPressureDataPoint {
  date: string;
  systolic: number;
  diastolic: number;
  device_name?: string | null;
  health_platform?: string | null;
  source_app?: string | null;
}

interface BloodPressureChartProps {
  data: BloodPressureDataPoint[];
  height?: number;
  className?: string;
}

export function BloodPressureChart({
  data,
  height = 250,
  className,
}: BloodPressureChartProps) {
  // Calculate domain with padding
  const domain = useMemo(() => {
    if (data.length === 0) return [40, 180];
    const systolicValues = data.map((d) => d.systolic);
    const diastolicValues = data.map((d) => d.diastolic);
    const min = Math.min(...diastolicValues);
    const max = Math.max(...systolicValues);
    const padding = 20;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [data]);

  if (data.length === 0) {
    return (
      <Card className={cn('border-border/50', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Blood Pressure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center text-muted-foreground"
            style={{ height }}
          >
            <p className="text-sm">No blood pressure data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Blood Pressure
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
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
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const dataPoint = payload[0].payload as BloodPressureDataPoint;
                const sourceName = dataPoint.device_name || dataPoint.source_app || dataPoint.health_platform;
                
                return (
                  <div className="rounded-lg border bg-card p-3 shadow-lg">
                    <p className="text-sm font-medium">{label}</p>
                    <div className="space-y-1 mt-1">
                      <p className="text-sm">
                        <span className="text-destructive font-medium">Systolic:</span>{' '}
                        {dataPoint.systolic} mmHg
                      </p>
                      <p className="text-sm">
                        <span className="text-info font-medium">Diastolic:</span>{' '}
                        {dataPoint.diastolic} mmHg
                      </p>
                    </div>
                    {sourceName && (
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                        from {sourceName}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (value === 'systolic' ? 'Systolic' : 'Diastolic')}
            />
            {/* Normal range reference lines */}
            <ReferenceLine
              y={VITAL_RANGES.bloodPressureSystolic.normal.max}
              stroke="hsl(var(--warning))"
              strokeDasharray="5 5"
              opacity={0.5}
              label={{ value: '120', position: 'right', fontSize: 10, fill: 'hsl(var(--warning))' }}
            />
            <ReferenceLine
              y={VITAL_RANGES.bloodPressureDiastolic.normal.max}
              stroke="hsl(var(--info))"
              strokeDasharray="5 5"
              opacity={0.5}
              label={{ value: '80', position: 'right', fontSize: 10, fill: 'hsl(var(--info))' }}
            />
            <Line
              type="monotone"
              dataKey="systolic"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, stroke: 'white', r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="diastolic"
              stroke="hsl(var(--info))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--info))', strokeWidth: 0, r: 3 }}
              activeDot={{ fill: 'hsl(var(--info))', strokeWidth: 2, stroke: 'white', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
