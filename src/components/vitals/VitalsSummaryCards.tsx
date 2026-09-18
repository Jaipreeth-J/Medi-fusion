/**
 * VITALS SUMMARY CARDS
 * Grid of MetricCards showing latest vital readings
 */

import { Heart, Activity, Droplets, Thermometer, Moon, Footprints, Scale, Wind } from 'lucide-react';
import { MetricCard } from '@/components/common/MetricCard';
import { VITAL_RANGES } from '@/lib/constants';

interface VitalSummary {
  value: number | null;
  previous: number | null;
  trend: 'up' | 'down' | 'stable';
}

interface VitalsSummaryCardsProps {
  summary: {
    heartRate: VitalSummary;
    bloodPressureSystolic: VitalSummary;
    bloodPressureDiastolic: VitalSummary;
    bloodSugar: VitalSummary;
    spo2: VitalSummary;
    weight: VitalSummary;
    temperature: VitalSummary;
    sleep: VitalSummary;
    activity: VitalSummary;
  };
}

function getStatus(value: number | null, range: { normal: { min: number; max: number }; warning: { min: number; max: number } }): 'normal' | 'warning' | 'critical' {
  if (value === null) return 'normal';
  if (value >= range.normal.min && value <= range.normal.max) return 'normal';
  if (value >= range.warning.min && value <= range.warning.max) return 'warning';
  return 'critical';
}

function getTrendValue(current: number | null, previous: number | null): string | undefined {
  if (current === null || previous === null) return undefined;
  const diff = current - previous;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)}`;
}

export function VitalsSummaryCards({ summary }: VitalsSummaryCardsProps) {
  const vitals = [
    {
      title: 'Heart Rate',
      data: summary.heartRate,
      unit: 'bpm',
      icon: <Heart className="h-5 w-5" />,
      range: VITAL_RANGES.heartRate,
    },
    {
      title: 'Blood Pressure',
      data: summary.bloodPressureSystolic,
      diastolic: summary.bloodPressureDiastolic,
      unit: 'mmHg',
      icon: <Activity className="h-5 w-5" />,
      range: VITAL_RANGES.bloodPressureSystolic,
      formatValue: (sys: number | null, dia: number | null) => 
        sys !== null && dia !== null ? `${sys}/${dia}` : '--',
    },
    {
      title: 'Blood Sugar',
      data: summary.bloodSugar,
      unit: 'mg/dL',
      icon: <Droplets className="h-5 w-5" />,
      range: VITAL_RANGES.bloodSugar,
    },
    {
      title: 'SpO2',
      data: summary.spo2,
      unit: '%',
      icon: <Wind className="h-5 w-5" />,
      range: VITAL_RANGES.spo2,
    },
    {
      title: 'Temperature',
      data: summary.temperature,
      unit: '°C',
      icon: <Thermometer className="h-5 w-5" />,
      range: VITAL_RANGES.temperature,
    },
    {
      title: 'Weight',
      data: summary.weight,
      unit: 'kg',
      icon: <Scale className="h-5 w-5" />,
      // Weight doesn't have strict normal ranges
      range: { normal: { min: 0, max: 999 }, warning: { min: 0, max: 999 } },
    },
    {
      title: 'Sleep',
      data: summary.sleep,
      unit: 'hrs',
      icon: <Moon className="h-5 w-5" />,
      range: { normal: { min: 7, max: 9 }, warning: { min: 5, max: 10 } },
    },
    {
      title: 'Activity',
      data: summary.activity,
      unit: 'min',
      icon: <Footprints className="h-5 w-5" />,
      range: { normal: { min: 30, max: 999 }, warning: { min: 15, max: 999 } },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {vitals.map((vital) => {
        const isBloodPressure = vital.title === 'Blood Pressure';
        const displayValue = isBloodPressure && vital.formatValue
          ? vital.formatValue(vital.data.value, vital.diastolic?.value ?? null)
          : vital.data.value?.toFixed(vital.title === 'Temperature' ? 1 : 0) ?? '--';

        return (
          <MetricCard
            key={vital.title}
            title={vital.title}
            value={displayValue}
            unit={vital.unit}
            icon={vital.icon}
            trend={vital.data.value !== null ? vital.data.trend : undefined}
            trendValue={getTrendValue(vital.data.value, vital.data.previous)}
            status={getStatus(vital.data.value, vital.range)}
          />
        );
      })}
    </div>
  );
}
