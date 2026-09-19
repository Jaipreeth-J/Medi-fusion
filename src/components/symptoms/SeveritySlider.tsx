/**
 * SEVERITY SLIDER COMPONENT
 * Visual slider for rating symptom severity 1-10
 */

import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

interface SeveritySliderProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const severityLabels = [
  { range: [1, 2], label: 'Mild', color: 'bg-success' },
  { range: [3, 4], label: 'Moderate', color: 'bg-info' },
  { range: [5, 6], label: 'Uncomfortable', color: 'bg-warning' },
  { range: [7, 8], label: 'Severe', color: 'bg-orange-500' },
  { range: [9, 10], label: 'Very Severe', color: 'bg-destructive' },
];

function getSeverityInfo(value: number) {
  return severityLabels.find(
    (s) => value >= s.range[0] && value <= s.range[1]
  ) || severityLabels[0];
}

export function SeveritySlider({ value, onChange, className }: SeveritySliderProps) {
  const severityInfo = getSeverityInfo(value);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Severity
        </span>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium text-white',
              severityInfo.color
            )}
          >
            {severityInfo.label}
          </span>
          <span className="font-display text-lg font-bold">{value}/10</span>
        </div>
      </div>

      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={10}
        step={1}
        className="w-full"
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Mild</span>
        <span>Moderate</span>
        <span>Severe</span>
      </div>
    </div>
  );
}
