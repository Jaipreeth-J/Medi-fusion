/**
 * BODY LOCATION PICKER
 * Visual picker for selecting symptom body location
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MapPin, Check } from 'lucide-react';

interface BodyLocationPickerProps {
  value: string | null;
  onChange: (value: string) => void;
  className?: string;
}

const bodyLocations = [
  { id: 'head', label: 'Head', emoji: '🧠' },
  { id: 'face', label: 'Face', emoji: '😊' },
  { id: 'eyes', label: 'Eyes', emoji: '👁️' },
  { id: 'ears', label: 'Ears', emoji: '👂' },
  { id: 'nose', label: 'Nose', emoji: '👃' },
  { id: 'throat', label: 'Throat', emoji: '🗣️' },
  { id: 'neck', label: 'Neck', emoji: '🦒' },
  { id: 'chest', label: 'Chest', emoji: '🫁' },
  { id: 'heart', label: 'Heart Area', emoji: '❤️' },
  { id: 'upper_back', label: 'Upper Back', emoji: '🔙' },
  { id: 'lower_back', label: 'Lower Back', emoji: '⬇️' },
  { id: 'abdomen', label: 'Abdomen', emoji: '🤰' },
  { id: 'stomach', label: 'Stomach', emoji: '😖' },
  { id: 'shoulder_left', label: 'Left Shoulder', emoji: '💪' },
  { id: 'shoulder_right', label: 'Right Shoulder', emoji: '💪' },
  { id: 'arm_left', label: 'Left Arm', emoji: '🦾' },
  { id: 'arm_right', label: 'Right Arm', emoji: '🦾' },
  { id: 'hand_left', label: 'Left Hand', emoji: '🤚' },
  { id: 'hand_right', label: 'Right Hand', emoji: '✋' },
  { id: 'hip_left', label: 'Left Hip', emoji: '🦴' },
  { id: 'hip_right', label: 'Right Hip', emoji: '🦴' },
  { id: 'leg_left', label: 'Left Leg', emoji: '🦵' },
  { id: 'leg_right', label: 'Right Leg', emoji: '🦵' },
  { id: 'knee_left', label: 'Left Knee', emoji: '🦿' },
  { id: 'knee_right', label: 'Right Knee', emoji: '🦿' },
  { id: 'foot_left', label: 'Left Foot', emoji: '🦶' },
  { id: 'foot_right', label: 'Right Foot', emoji: '🦶' },
  { id: 'skin', label: 'Skin (General)', emoji: '🖐️' },
  { id: 'whole_body', label: 'Whole Body', emoji: '🧍' },
  { id: 'other', label: 'Other', emoji: '❓' },
];

export function BodyLocationPicker({ value, onChange, className }: BodyLocationPickerProps) {
  const [open, setOpen] = useState(false);
  const selectedLocation = bodyLocations.find((l) => l.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-start', className)}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {selectedLocation ? (
            <span className="flex items-center gap-2">
              <span>{selectedLocation.emoji}</span>
              <span>{selectedLocation.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Select body location...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="max-h-[300px] overflow-y-auto p-2">
          <div className="grid grid-cols-2 gap-1">
            {bodyLocations.map((location) => (
              <button
                key={location.id}
                onClick={() => {
                  onChange(location.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                  value === location.id && 'bg-primary/10 text-primary'
                )}
              >
                <span>{location.emoji}</span>
                <span className="flex-1 truncate">{location.label}</span>
                {value === location.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Export for use in display
export function getBodyLocationLabel(id: string | null): string {
  if (!id) return 'Not specified';
  const location = bodyLocations.find((l) => l.id === id);
  return location ? `${location.emoji} ${location.label}` : id;
}
