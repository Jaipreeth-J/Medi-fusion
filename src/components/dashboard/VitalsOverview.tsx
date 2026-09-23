/**
 * VITALS OVERVIEW
 * Mini summary of recent vitals for the dashboard
 */

import { memo } from 'react';
import { Heart, Activity, Droplets, Wind, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useVitals } from '@/hooks/useVitals';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const VitalsOverview = memo(function VitalsOverview() {
  const { getSummary, isLoading } = useVitals(7);
  const summary = getSummary();

  const vitals = [
    {
      label: 'Heart Rate',
      value: summary.heartRate.value,
      unit: 'bpm',
      trend: summary.heartRate.trend,
      icon: Heart,
      color: 'text-rose-500',
    },
    {
      label: 'Blood Pressure',
      value: summary.bloodPressureSystolic.value && summary.bloodPressureDiastolic.value
        ? `${summary.bloodPressureSystolic.value}/${summary.bloodPressureDiastolic.value}`
        : null,
      unit: 'mmHg',
      trend: summary.bloodPressureSystolic.trend,
      icon: Activity,
      color: 'text-blue-500',
    },
    {
      label: 'Blood Sugar',
      value: summary.bloodSugar.value,
      unit: 'mg/dL',
      trend: summary.bloodSugar.trend,
      icon: Droplets,
      color: 'text-amber-500',
    },
    {
      label: 'SpO2',
      value: summary.spo2.value,
      unit: '%',
      trend: summary.spo2.trend,
      icon: Wind,
      color: 'text-cyan-500',
    },
  ];

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="h-3 w-3 text-success" />;
    if (trend === 'down') return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Vitals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = vitals.some(v => v.value !== null);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Vitals
          </CardTitle>
          <Link to="/vitals">
            <Button variant="ghost" size="sm" className="text-xs">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="grid grid-cols-2 gap-3">
            {vitals.map((vital) => (
              <div
                key={vital.label}
                className="rounded-lg border border-border/50 bg-card p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <vital.icon className={cn('h-3.5 w-3.5', vital.color)} />
                  <span className="text-xs text-muted-foreground">{vital.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-semibold">
                    {vital.value ?? '--'}
                  </span>
                  <span className="text-xs text-muted-foreground">{vital.unit}</span>
                  {vital.value && <TrendIcon trend={vital.trend} />}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <p>No vitals recorded this week</p>
            <Link to="/vitals">
              <Button variant="outline" size="sm" className="mt-3">
                Add Vitals
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
