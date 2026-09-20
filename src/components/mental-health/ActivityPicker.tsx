import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const SUGGESTED_ACTIVITIES = [
  { label: "Exercise", emoji: "🏃" },
  { label: "Meditation", emoji: "🧘" },
  { label: "Reading", emoji: "📚" },
  { label: "Work", emoji: "💼" },
  { label: "Socializing", emoji: "👥" },
  { label: "Nature walk", emoji: "🌳" },
  { label: "Music", emoji: "🎵" },
  { label: "Gaming", emoji: "🎮" },
  { label: "Cooking", emoji: "🍳" },
  { label: "Creative work", emoji: "🎨" },
  { label: "Rest", emoji: "😴" },
  { label: "Family time", emoji: "👨‍👩‍👧" },
];

interface ActivityPickerProps {
  selected: string[];
  onChange: (activities: string[]) => void;
  label?: string;
}

export function ActivityPicker({ selected, onChange, label = "Activities" }: ActivityPickerProps) {
  const [customActivity, setCustomActivity] = useState('');

  const toggleActivity = (activity: string) => {
    if (selected.includes(activity)) {
      onChange(selected.filter(a => a !== activity));
    } else {
      onChange([...selected, activity]);
    }
  };

  const addCustomActivity = () => {
    const trimmed = customActivity.trim();
    if (trimmed && !selected.includes(trimmed)) {
      onChange([...selected, trimmed]);
      setCustomActivity('');
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">{label}</label>
      
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_ACTIVITIES.map((activity) => {
          const isSelected = selected.includes(activity.label);
          return (
            <Badge
              key={activity.label}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all hover:scale-105",
                isSelected && "bg-primary text-primary-foreground"
              )}
              onClick={() => toggleActivity(activity.label)}
            >
              <span className="mr-1">{activity.emoji}</span>
              {activity.label}
              {isSelected && <X className="ml-1 h-3 w-3" />}
            </Badge>
          );
        })}
      </div>
      
      <div className="flex gap-2">
        <Input
          placeholder="Add custom activity..."
          value={customActivity}
          onChange={(e) => setCustomActivity(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomActivity())}
          className="flex-1"
        />
        <Button 
          type="button" 
          size="icon" 
          variant="outline"
          onClick={addCustomActivity}
          disabled={!customActivity.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {selected.filter(a => !SUGGESTED_ACTIVITIES.map(s => s.label).includes(a)).length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selected
            .filter(a => !SUGGESTED_ACTIVITIES.map(s => s.label).includes(a))
            .map(activity => (
              <Badge 
                key={activity} 
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleActivity(activity)}
              >
                {activity}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}
