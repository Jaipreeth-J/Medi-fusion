/**
 * ADD VITAL DIALOG
 * Modal for recording new vital measurements
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Activity, Heart, Droplets, Thermometer, Moon, Footprints, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { VitalInput } from '@/hooks/useVitals';

interface AddVitalDialogProps {
  onSubmit: (data: VitalInput) => void;
  isLoading?: boolean;
}

export function AddVitalDialog({ onSubmit, isLoading }: AddVitalDialogProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<VitalInput>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      recorded_at: date.toISOString(),
    });
    setOpen(false);
    setFormData({});
    setDate(new Date());
  };

  const handleInputChange = (field: keyof VitalInput, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setFormData((prev) => ({ ...prev, [field]: numValue }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Record Vitals
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Record Vitals
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Date & Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Heart Rate */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-destructive" />
                Heart Rate
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="72"
                  min="30"
                  max="250"
                  onChange={(e) => handleInputChange('heart_rate', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  bpm
                </span>
              </div>
            </div>

            {/* Blood Pressure Systolic */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-warning" />
                BP Systolic
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="120"
                  min="60"
                  max="250"
                  onChange={(e) => handleInputChange('blood_pressure_systolic', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  mmHg
                </span>
              </div>
            </div>

            {/* Blood Pressure Diastolic */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-info" />
                BP Diastolic
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="80"
                  min="40"
                  max="150"
                  onChange={(e) => handleInputChange('blood_pressure_diastolic', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  mmHg
                </span>
              </div>
            </div>

            {/* Blood Sugar */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-primary" />
                Blood Sugar
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="100"
                  min="20"
                  max="600"
                  step="0.1"
                  onChange={(e) => handleInputChange('blood_sugar', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  mg/dL
                </span>
              </div>
            </div>

            {/* SpO2 */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-success" />
                Oxygen (SpO2)
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="98"
                  min="70"
                  max="100"
                  onChange={(e) => handleInputChange('spo2', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </div>

            {/* Temperature */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                Temperature
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="36.6"
                  min="34"
                  max="42"
                  step="0.1"
                  onChange={(e) => handleInputChange('temperature_celsius', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  °C
                </span>
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-purple-500" />
                Weight
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="70"
                  min="20"
                  max="300"
                  step="0.1"
                  onChange={(e) => handleInputChange('weight_kg', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  kg
                </span>
              </div>
            </div>

            {/* Sleep Hours */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-indigo-500" />
                Sleep
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="8"
                  min="0"
                  max="24"
                  step="0.5"
                  onChange={(e) => handleInputChange('sleep_hours', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  hours
                </span>
              </div>
            </div>

            {/* Activity Minutes */}
            <div className="col-span-2 space-y-2">
              <Label className="flex items-center gap-2">
                <Footprints className="h-4 w-4 text-green-500" />
                Activity
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="30"
                  min="0"
                  max="1440"
                  onChange={(e) => handleInputChange('activity_minutes', e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  minutes
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              placeholder="Any additional notes about your vitals..."
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Recording...' : 'Record Vitals'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
