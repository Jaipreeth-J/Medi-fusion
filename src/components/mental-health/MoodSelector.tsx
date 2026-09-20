import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MOOD_OPTIONS } from '@/lib/constants';

interface MoodSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-foreground">
        How are you feeling right now?
      </label>
      
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {MOOD_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          
          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl border-2 transition-all",
                isSelected 
                  ? "border-primary bg-primary/10 shadow-md" 
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl sm:text-3xl">{option.emoji}</span>
              <span className={cn(
                "text-xs font-medium text-center leading-tight",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}>
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>Very Low</span>
        <span>Excellent</span>
      </div>
    </div>
  );
}
