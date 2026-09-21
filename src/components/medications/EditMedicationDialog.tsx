/**
 * EDIT MEDICATION DIALOG
 * Form for editing an existing medication
 */

import { useState, useEffect } from 'react';
import { Pill, X, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useMedications, type Medication, type MedicationFormData } from '@/hooks/useMedications';

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

interface EditMedicationDialogProps {
  medication: Medication;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMedicationDialog({ medication, open, onOpenChange }: EditMedicationDialogProps) {
  const { updateMedication } = useMedications();
  const [customTime, setCustomTime] = useState('');
  const [dosageError, setDosageError] = useState('');

  const [formData, setFormData] = useState<MedicationFormData>({
    medication_name: medication.medication_name,
    dosage: medication.dosage,
    dosage_unit: medication.dosage_unit,
    frequency: medication.frequency,
    times_per_day: medication.times_per_day,
    schedule_times: medication.schedule_times || [],
    instructions: medication.instructions || undefined,
    purpose: medication.purpose || undefined,
    prescribing_doctor: medication.prescribing_doctor || undefined,
    pharmacy: medication.pharmacy || undefined,
    start_date: medication.start_date,
    end_date: medication.end_date || undefined,
    refill_reminder_days: medication.refill_reminder_days || undefined,
    quantity_remaining: medication.quantity_remaining || undefined,
  });

  // Reset form when medication changes
  useEffect(() => {
    if (open) {
      setFormData({
        medication_name: medication.medication_name,
        dosage: medication.dosage,
        dosage_unit: medication.dosage_unit,
        frequency: medication.frequency,
        times_per_day: medication.times_per_day,
        schedule_times: medication.schedule_times || [],
        instructions: medication.instructions || undefined,
        purpose: medication.purpose || undefined,
        prescribing_doctor: medication.prescribing_doctor || undefined,
        pharmacy: medication.pharmacy || undefined,
        start_date: medication.start_date,
        end_date: medication.end_date || undefined,
        refill_reminder_days: medication.refill_reminder_days || undefined,
        quantity_remaining: medication.quantity_remaining || undefined,
      });
      setDosageError('');
      setCustomTime('');
    }
  }, [open, medication]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medication_name || !formData.dosage) return;

    const dosageNum = Number(formData.dosage);
    if (isNaN(dosageNum) || dosageNum <= 0) {
      setDosageError('Dosage must be a positive value.');
      return;
    }
    setDosageError('');

    await updateMedication.mutateAsync({
      id: medication.id,
      medication_name: formData.medication_name,
      dosage: formData.dosage,
      dosage_unit: formData.dosage_unit,
      frequency: formData.frequency,
      times_per_day: formData.times_per_day,
      schedule_times: formData.schedule_times,
      instructions: formData.instructions || null,
      purpose: formData.purpose || null,
      prescribing_doctor: formData.prescribing_doctor || null,
      pharmacy: formData.pharmacy || null,
      start_date: formData.start_date,
      end_date: formData.end_date || null,
      refill_reminder_days: formData.refill_reminder_days ?? null,
      quantity_remaining: formData.quantity_remaining ?? null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Medication
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Medication Name */}
          <div className="space-y-2">
            <Label htmlFor="edit_medication_name">Medication Name *</Label>
            <Input
              id="edit_medication_name"
              placeholder="e.g., Lisinopril, Metformin"
              value={formData.medication_name}
              onChange={(e) => setFormData(prev => ({ ...prev, medication_name: e.target.value }))}
              required
            />
          </div>

          {/* Dosage */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit_dosage">Dosage *</Label>
              <Input
                id="edit_dosage"
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
              <Label htmlFor="edit_dosage_unit">Unit</Label>
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
            <Label>Frequency</Label>
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
            <Label htmlFor="edit_purpose">Purpose</Label>
            <Input
              id="edit_purpose"
              placeholder="e.g., Blood pressure, Diabetes"
              value={formData.purpose || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="edit_instructions">Special Instructions</Label>
            <Textarea
              id="edit_instructions"
              placeholder="e.g., Take with food, Avoid grapefruit"
              value={formData.instructions || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit_start_date">Start Date</Label>
              <Input
                id="edit_start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_end_date">End Date (optional)</Label>
              <Input
                id="edit_end_date"
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value || undefined }))}
              />
            </div>
          </div>

          {/* Prescriber & Pharmacy */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit_prescribing_doctor">Prescriber</Label>
              <Input
                id="edit_prescribing_doctor"
                placeholder="Dr. Smith"
                value={formData.prescribing_doctor || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, prescribing_doctor: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_pharmacy">Pharmacy</Label>
              <Input
                id="edit_pharmacy"
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
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMedication.isPending}
              className="flex-1"
            >
              {updateMedication.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
