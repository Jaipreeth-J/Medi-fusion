/**
 * SYNCED VITALS DISPLAY
 * Dashboard grid showing latest synced vitals from wearables with device attribution
 */

import { Heart, Activity, Footprints, Flame, Moon, Brain, Thermometer, Scale, Wind } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MetricCard } from '@/components/common/MetricCard';
import { DeviceSourceBadge, DeviceSourceInfo } from '@/components/common/DeviceSourceBadge';
import { SyncedVitals } from '@/hooks/useWearables';
import { getProviderName } from '@/lib/wearableProviders';
import { format } from 'date-fns';

interface SyncedVitalsDisplayProps {
  vitals: SyncedVitals | null;
  isLoading?: boolean;
}

export function SyncedVitalsDisplay({ vitals, isLoading }: SyncedVitalsDisplayProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Latest Synced Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!vitals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Latest Synced Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No vitals synced yet</p>
            <p className="text-sm mt-1">Connect a wearable and sync to see your data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      title: 'Heart Rate',
      value: vitals.heart_rate,
      unit: 'bpm',
      icon: <Heart className="h-5 w-5" />,
      show: vitals.heart_rate !== undefined,
    },
    {
      title: 'SpO2',
      value: vitals.spo2,
      unit: '%',
      icon: <Wind className="h-5 w-5" />,
      show: vitals.spo2 !== undefined,
    },
    {
      title: 'Steps',
      value: vitals.steps?.toLocaleString(),
      unit: 'steps',
      icon: <Footprints className="h-5 w-5" />,
      show: vitals.steps !== undefined,
    },
    {
      title: 'Calories',
      value: vitals.calories?.toLocaleString(),
      unit: 'kcal',
      icon: <Flame className="h-5 w-5" />,
      show: vitals.calories !== undefined,
    },
    {
      title: 'Sleep',
      value: vitals.sleep_hours?.toFixed(1),
      unit: 'hrs',
      icon: <Moon className="h-5 w-5" />,
      show: vitals.sleep_hours !== undefined,
    },
    {
      title: 'Stress Level',
      value: vitals.stress_level,
      unit: '/100',
      icon: <Brain className="h-5 w-5" />,
      show: vitals.stress_level !== undefined,
    },
    {
      title: 'Weight',
      value: vitals.weight_kg?.toFixed(1),
      unit: 'kg',
      icon: <Scale className="h-5 w-5" />,
      show: vitals.weight_kg !== undefined,
    },
    {
      title: 'Temperature',
      value: vitals.temperature_celsius?.toFixed(1),
      unit: '°C',
      icon: <Thermometer className="h-5 w-5" />,
      show: vitals.temperature_celsius !== undefined,
    },
  ].filter(m => m.show);

  // Build device source info for the badge
  const deviceSourceInfo: DeviceSourceInfo = {
    device_name: vitals.device_name ?? null,
    device_type: vitals.device_type ?? null,
    source_app: vitals.source_app ?? null,
    health_platform: vitals.health_platform ?? null,
    sync_source_chain: vitals.sync_source_chain ?? null,
  };

  // Determine if we have device info or just provider
  const hasDeviceInfo = vitals.device_name || vitals.source_app || vitals.health_platform;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Latest Synced Vitals</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {hasDeviceInfo ? (
              <DeviceSourceBadge source={deviceSourceInfo} variant="default" />
            ) : (
              <Badge variant="outline" className="text-xs">
                {getProviderName(vitals.source)}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {format(new Date(vitals.recorded_at), 'MMM d, h:mm a')}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value ?? '--'}
              unit={metric.unit}
              icon={metric.icon}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
