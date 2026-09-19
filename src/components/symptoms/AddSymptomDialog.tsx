/**
 * ADD SYMPTOM DIALOG
 * Modal for logging new symptoms with voice input support
 */

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Stethoscope } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { COMMON_SYMPTOMS } from '@/lib/constants';
import { SymptomInput } from '@/hooks/useSymptoms';
import { SeveritySlider } from './SeveritySlider';
import { BodyLocationPicker } from './BodyLocationPicker';
import { Badge } from '@/components/ui/badge';
import { VoiceInputButton } from '@/components/common/VoiceInputButton';
import { useVoiceInput } from '@/hooks/useVoiceInput';

interface AddSymptomDialogProps {
  onSubmit: (data: SymptomInput) => void;
  isLoading?: boolean;
}

export function AddSymptomDialog({ onSubmit, isLoading }: AddSymptomDialogProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [symptomName, setSymptomName] = useState('');
  const [customSymptom, setCustomSymptom] = useState('');
  const [severity, setSeverity] = useState(5);
  const [durationHours, setDurationHours] = useState<string>('');
  const [frequency, setFrequency] = useState<'once' | 'occasionally' | 'frequently' | 'constantly' | ''>('');
  const [bodyLocation, setBodyLocation] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  // Voice input for custom symptom
  const handleCustomSymptomVoice = useCallback((text: string) => {
    setCustomSymptom(text);
  }, []);

  const {
    isListening: isListeningSymptom,
    isSupported: isSymptomVoiceSupported,
    toggleListening: toggleSymptomListening,
    resetTranscript: resetSymptomTranscript,
  } = useVoiceInput({
    onTranscript: handleCustomSymptomVoice,
  });

  // Voice input for description
  const handleDescriptionVoice = useCallback((text: string) => {
    setDescription(text);
  }, []);

  const {
    isListening: isListeningDescription,
    isSupported: isDescriptionVoiceSupported,
    toggleListening: toggleDescriptionListening,
    resetTranscript: resetDescriptionTranscript,
  } = useVoiceInput({
    onTranscript: handleDescriptionVoice,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalSymptomName = symptomName === 'custom' ? customSymptom : symptomName;
    
    if (!finalSymptomName.trim()) {
      return;
    }

    onSubmit({
      symptom_name: finalSymptomName.trim(),
      severity,
      duration_hours: durationHours ? parseInt(durationHours) : null,
      frequency: frequency || null,
      body_location: bodyLocation,
      description: description.trim() || null,
      started_at: date.toISOString(),
    });
    
    // Reset form
    setOpen(false);
    setSymptomName('');
    setCustomSymptom('');
    setSeverity(5);
    setDurationHours('');
    setFrequency('');
    setBodyLocation(null);
    setDescription('');
    setDate(new Date());
  };

  const handleQuickSelect = (symptom: string) => {
    setSymptomName(symptom);
    setCustomSymptom('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Log Symptom
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            Log New Symptom
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Select Symptoms */}
          <div className="space-y-2">
            <Label>Common Symptoms (quick select)</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.slice(0, 12).map((symptom) => (
                <Badge
                  key={symptom}
                  variant={symptomName === symptom ? 'default' : 'outline'}
                  className="cursor-pointer transition-colors hover:bg-primary/20"
                  onClick={() => handleQuickSelect(symptom)}
                >
                  {symptom}
                </Badge>
              ))}
              <Badge
                variant={symptomName === 'custom' ? 'default' : 'outline'}
                className="cursor-pointer transition-colors hover:bg-primary/20"
                onClick={() => setSymptomName('custom')}
              >
                + Other
              </Badge>
            </div>
          </div>

          {/* Custom Symptom Input */}
          {symptomName === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="customSymptom">Describe your symptom</Label>
              <div className="flex gap-2">
                <Input
                  id="customSymptom"
                  placeholder={isListeningSymptom ? "Speak now..." : "e.g., Sharp pain in lower left abdomen"}
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  required
                  className="flex-1"
                />
                <VoiceInputButton
                  isListening={isListeningSymptom}
                  isSupported={isSymptomVoiceSupported}
                  onClick={() => {
                    if (!isListeningSymptom) {
                      resetSymptomTranscript();
                    }
                    toggleSymptomListening();
                  }}
                />
              </div>
            </div>
          )}

          {/* Selected Symptom Display */}
          {symptomName && symptomName !== 'custom' && (
            <div className="rounded-lg bg-primary/10 p-3">
              <p className="text-sm font-medium">
                Selected: <span className="text-primary">{symptomName}</span>
              </p>
            </div>
          )}

          {/* Severity Slider */}
          <SeveritySlider value={severity} onChange={setSeverity} />

          {/* Body Location */}
          <div className="space-y-2">
            <Label>Body Location</Label>
            <BodyLocationPicker value={bodyLocation} onChange={setBodyLocation} />
          </div>

          {/* Duration and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 2"
                min="0"
                max="720"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={frequency}
                onValueChange={(v) => setFrequency(v as typeof frequency)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How often?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Just once</SelectItem>
                  <SelectItem value="occasionally">Occasionally</SelectItem>
                  <SelectItem value="frequently">Frequently</SelectItem>
                  <SelectItem value="constantly">Constantly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>When did it start?</Label>
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

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Additional Notes</Label>
              <VoiceInputButton
                isListening={isListeningDescription}
                isSupported={isDescriptionVoiceSupported}
                onClick={() => {
                  if (!isListeningDescription) {
                    resetDescriptionTranscript();
                  }
                  toggleDescriptionListening();
                }}
                size="sm"
                variant="ghost"
              />
            </div>
            <Textarea
              id="description"
              placeholder={isListeningDescription ? "Speak now..." : "Describe your symptom in more detail... What triggers it? What helps?"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || (!symptomName || (symptomName === 'custom' && !customSymptom.trim()))}
          >
            {isLoading ? 'Logging...' : 'Log Symptom'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
