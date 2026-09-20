import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface LevelSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  lowLabel?: string;
  highLabel?: string;
  icon?: React.ReactNode;
  colorScheme?: 'stress' | 'energy' | 'sleep' | 'anxiety';
}

const colorSchemes = {
  stress: {
    low: 'text-success',
    high: 'text-destructive',
    track: 'bg-gradient-to-r from-success/20 via-warning/20 to-destructive/20',
  },
  anxiety: {
    low: 'text-success',
    high: 'text-destructive',
    track: 'bg-gradient-to-r from-success/20 via-warning/20 to-destructive/20',
  },
  energy: {
    low: 'text-muted-foreground',
    high: 'text-primary',
    track: 'bg-gradient-to-r from-muted via-primary/30 to-primary/50',
  },
  sleep: {
    low: 'text-destructive',
    high: 'text-success',
    track: 'bg-gradient-to-r from-destructive/20 via-warning/20 to-success/20',
  },
};

export function LevelSlider({ 
  label, 
  value, 
  onChange, 
  lowLabel = "Low", 
  highLabel = "High",
  icon,
  colorScheme = 'stress'
}: LevelSliderProps) {
  const colors = colorSchemes[colorScheme];
  
  const getValueLabel = () => {
    if (value <= 2) return lowLabel;
    if (value <= 4) return "Mild";
    if (value <= 6) return "Moderate";
    if (value <= 8) return "High";
    return highLabel;
  };

  const getValueColor = () => {
    if (colorScheme === 'energy' || colorScheme === 'sleep') {
      if (value <= 3) return 'text-destructive';
      if (value <= 6) return 'text-warning';
      return 'text-success';
    }
    // stress/anxiety - inverse
    if (value <= 3) return 'text-success';
    if (value <= 6) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <label className="text-sm font-medium text-foreground">{label}</label>
        </div>
        <span className={cn("text-sm font-semibold", getValueColor())}>
          {value}/10 - {getValueLabel()}
        </span>
      </div>
      
      <div className={cn("rounded-full p-1", colors.track)}>
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={1}
          max={10}
          step={1}
          className="cursor-pointer"
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span className={colors.low}>{lowLabel}</span>
        <span className={colors.high}>{highLabel}</span>
      </div>
    </div>
  );
}
