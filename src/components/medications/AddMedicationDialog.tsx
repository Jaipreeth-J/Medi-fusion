/**
 * ADD MEDICATION DIALOG
 * Form for adding new medications to track
 */

import { useState } from 'react';
import { Plus, Pill, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMedications, type MedicationFormData } from '@/hooks/useMedications';
import { format } from 'date-fns';

const DOSAGE_UNITS = ['mg', 'mcg', 'g', 'ml', 'units', 'tablets', 'capsules', 'drops', 'puffs'];
const FREQUENCIES = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'three_times_daily', label: 'Three times daily' },
  { value: 'four_times_daily', label: 'Four times daily' },
  { value: 'every_other_day', label: 'Every other day' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As needed (PRN)' },
  { value: 'custom', label: 'Custom schedule' },
];

const COMMON_TIMES = ['06:00', '08:00', '12:00', '14:00', '18:00', '20:00', '22:00'];

interface AddMedicationDialogProps {
  trigger?: React.ReactNode;
}

export function AddMedicationDialog({ trigger }: AddMedicationDialogProps) {
  const { addMedication } = useMedications();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<MedicationFormData>({
    medication_name: '',
    dosage: '',
    dosage_unit: 'mg',
    frequency: 'once_daily',
    times_per_day: 1,
    schedule_times: ['08:00'],
    start_date: format(new Date(), 'yyyy-MM-dd'),
  });
  const [customTime, setCustomTime] = useState('');

  const handleFrequencyChange = (frequency: string) => {
    let timesPerDay = 1;
    let scheduleTimes = ['08:00'];

    switch (frequency) {
      case 'twice_daily':
        timesPerDay = 2;
        scheduleTimes = ['08:00', '20:00'];
        break;
      case 'three_times_daily':
        timesPerDay = 3;
        scheduleTimes = ['08:00', '14:00', '20:00'];
        break;
      case 'four_times_daily':
        timesPerDay = 4;
        scheduleTimes = ['08:00', '12:00', '18:00', '22:00'];
        break;
      case 'as_needed':
        timesPerDay = 0;
        scheduleTimes = [];
        break;
    }

    setFormData(prev => ({
      ...prev,
      frequency,
      times_per_day: timesPerDay,
      schedule_times: scheduleTimes,
    }));
  };

  const addScheduleTime = (time: string) => {
    if (time && !formData.schedule_times.includes(time)) {
      setFormData(prev => ({
        ...prev,
        schedule_times: [...prev.schedule_times, time].sort(),
        times_per_day: prev.schedule_times.length + 1,
      }));
      setCustomTime('');
    }
  };

  const removeScheduleTime = (time: string) => {
    setFormData(prev => ({
      ...prev,
      schedule_times: prev.schedule_times.filter(t => t !== time),
      times_per_day: Math.max(0, prev.times_per_day - 1),
    }));
  };

  const [dosageError, setDosageError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.medication_name || !formData.dosage) {
      return;
    }

    // Validate dosage is a positive number
    const dosageNum = Number(formData.dosage);
    if (isNaN(dosageNum) || dosageNum <= 0) {
      setDosageError('Dosage must be a positive value.');
      return;
    }
    setDosageError('');

    await addMedication.mutateAsync(formData);
    setOpen(false);
    setFormData({
      medication_name: '',
      dosage: '',
      dosage_unit: 'mg',
      frequency: 'once_daily',
      times_per_day: 1,
      schedule_times: ['08:00'],
      start_date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Medication
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Add Medication
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Medication Name */}
          <div className="space-y-2">
            <Label htmlFor="medication_name">Medication Name *</Label>
            <Input
              id="medication_name"
              placeholder="e.g., Lisinopril, Metformin"
              value={formData.medication_name}
              onChange={(e) => setFormData(prev => ({ ...prev, medication_name: e.target.value }))}
              required
            />
          </div>

          {/* Dosage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage *</Label>
              <Input
                id="dosage"
                type="number"
                step="any"
                min="0.01"
                placeholder="e.g., 10"
                value={formData.dosage}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, dosage: e.target.value }));
                  setDosageError('');
                }}
                required
                className={dosageError ? 'border-destructive' : ''}
              />
              {dosageError && (
                <p className="text-xs text-destructive mt-1">{dosageError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosage_unit">Unit</Label>
              <Select
                value={formData.dosage_unit}
                onValueChange={(value) => setFormData(prev => ({ ...prev, dosage_unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOSAGE_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={handleFrequencyChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Schedule Times */}
          {formData.frequency !== 'as_needed' && (
            <div className="space-y-2">
              <Label>Schedule Times</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.schedule_times.map((time) => (
                  <Badge key={time} variant="secondary" className="gap-1">
                    {time}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeScheduleTime(time)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => addScheduleTime(customTime)}
                >
                  Add Time
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {COMMON_TIMES.filter(t => !formData.schedule_times.includes(t)).slice(0, 4).map((time) => (
                  <Badge 
                    key={time} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => addScheduleTime(time)}
                  >
                    + {time}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Purpose */}
          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose (what is it for?)</Label>
            <Input
              id="purpose"
              placeholder="e.g., Blood pressure, Diabetes"
              value={formData.purpose || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="e.g., Take with food, Avoid grapefruit"
              value={formData.instructions || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (optional)</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value || undefined }))}
              />
            </div>
          </div>

          {/* Prescriber & Pharmacy */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="prescribing_doctor">Prescriber</Label>
              <Input
                id="prescribing_doctor"
                placeholder="Dr. Smith"
                value={formData.prescribing_doctor || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, prescribing_doctor: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pharmacy">Pharmacy</Label>
              <Input
                id="pharmacy"
                placeholder="CVS, Walgreens..."
                value={formData.pharmacy || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, pharmacy: e.target.value }))}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addMedication.isPending}
              className="flex-1"
            >
              {addMedication.isPending ? 'Adding...' : 'Add Medication'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
