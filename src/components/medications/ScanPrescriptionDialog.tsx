/**
 * SCAN PRESCRIPTION DIALOG
 * Upload or capture a prescription image, extract medications via AI, review & save
 */

import { useState, useRef, useCallback } from 'react';
import { isRateLimited } from '@/lib/rateLimitHandler';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanLine,
  Camera,
  Upload,
  Loader2,
  AlertTriangle,
  Check,
  X,
  Pencil,
  Trash2,
  ImageIcon,
  FileWarning,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useMedications, type MedicationFormData } from '@/hooks/useMedications';
import { toast } from 'sonner';
import { format } from 'date-fns';

const DOSAGE_UNITS = ['mg', 'mcg', 'g', 'ml', 'units', 'tablets', 'capsules', 'drops', 'puffs'];
const FREQUENCIES: { value: string; label: string }[] = [
  { value: 'once_daily', label: 'Once daily' },
  { value: 'twice_daily', label: 'Twice daily' },
  { value: 'three_times_daily', label: '3 times daily' },
  { value: 'four_times_daily', label: '4 times daily' },
  { value: 'every_other_day', label: 'Every other day' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'as_needed', label: 'As needed' },
  { value: 'custom', label: 'Custom' },
];

interface ExtractedMedication {
  name: string;
  dosage: string;
  dosage_unit: string;
  frequency: string;
  duration?: string;
  notes?: string;
  _editing?: boolean;
}

type Step = 'upload' | 'scanning' | 'review' | 'saving';

interface ScanPrescriptionDialogProps {
  trigger?: React.ReactNode;
  existingMedicationNames?: string[];
}

export function ScanPrescriptionDialog({ trigger, existingMedicationNames = [] }: ScanPrescriptionDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [medications, setMedications] = useState<ExtractedMedication[]>([]);
  const [confidence, setConfidence] = useState<string>('high');
  const [error, setError] = useState<string | null>(null);
  const [savingCount, setSavingCount] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { addMedication, medications: existingMeds } = useMedications();

  const existingNames = existingMedicationNames.length > 0
    ? existingMedicationNames
    : existingMeds.filter(m => m.is_active).map(m => m.medication_name.toLowerCase());

  const reset = () => {
    setStep('upload');
    setImagePreview(null);
    setImageBase64(null);
    setMedications([]);
    setConfidence('high');
    setError(null);
    setSavingCount(0);
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB.');
      return;
    }

    setImageMimeType(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      // Extract base64 portion
      const base64 = result.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);

    // Reset file input
    e.target.value = '';
  }, []);

  const handleScan = async () => {
    if (!imageBase64) return;

    setStep('scanning');
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('scan-prescription', {
        body: { imageBase64, mimeType: imageMimeType },
      });

      if (fnError) {
        if (isRateLimited({ error: fnError })) { setStep('upload'); return; }
        throw fnError;
      }

      if (data.error) {
        setError(data.error);
        setStep('upload');
        return;
      }

      const extracted: ExtractedMedication[] = (data.medications || []).map((m: any) => ({
        name: m.name || '',
        dosage: m.dosage || '',
        dosage_unit: m.dosage_unit || 'mg',
        frequency: m.frequency || 'once_daily',
        duration: m.duration || '',
        notes: m.notes || '',
      }));

      if (extracted.length === 0) {
        setError('No medications could be detected in the image. Please try a clearer photo.');
        setStep('upload');
        return;
      }

      setMedications(extracted);
      setConfidence(data.confidence || 'medium');
      setStep('review');
    } catch (err) {
      console.error('Scan error:', err);
      setError('Failed to scan the prescription. Please try again.');
      setStep('upload');
    }
  };

  const updateMedication = (index: number, field: keyof ExtractedMedication, value: string) => {
    setMedications(prev =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const removeMedication = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  const isDuplicate = (name: string) => {
    return existingNames.some(
      existing => existing === name.toLowerCase() || existing.includes(name.toLowerCase())
    );
  };

  const getTimesPerDay = (freq: string): number => {
    switch (freq) {
      case 'twice_daily': return 2;
      case 'three_times_daily': return 3;
      case 'four_times_daily': return 4;
      case 'as_needed': return 0;
      default: return 1;
    }
  };

  const getScheduleTimes = (freq: string): string[] => {
    switch (freq) {
      case 'twice_daily': return ['08:00', '20:00'];
      case 'three_times_daily': return ['08:00', '14:00', '20:00'];
      case 'four_times_daily': return ['08:00', '12:00', '18:00', '22:00'];
      case 'as_needed': return [];
      default: return ['08:00'];
    }
  };

  const handleSaveAll = async () => {
    // Validate
    const invalid = medications.find(m => {
      const dosageNum = Number(m.dosage);
      return !m.name.trim() || isNaN(dosageNum) || dosageNum <= 0;
    });
    if (invalid) {
      toast.error(`"${invalid.name || 'Unknown'}" has invalid data. Fix name and dosage before saving.`);
      return;
    }

    setStep('saving');
    let saved = 0;

    for (const med of medications) {
      try {
        const formData: MedicationFormData = {
          medication_name: med.name.trim(),
          dosage: med.dosage,
          dosage_unit: med.dosage_unit,
          frequency: med.frequency,
          times_per_day: getTimesPerDay(med.frequency),
          schedule_times: getScheduleTimes(med.frequency),
          start_date: format(new Date(), 'yyyy-MM-dd'),
          instructions: med.notes || undefined,
        };

        await addMedication.mutateAsync(formData);
        saved++;
        setSavingCount(saved);
      } catch (err) {
        console.error(`Failed to save ${med.name}:`, err);
      }
    }

    if (saved === medications.length) {
      toast.success(`${saved} medication${saved > 1 ? 's' : ''} added from prescription!`);
    } else {
      toast.warning(`${saved} of ${medications.length} medications saved. Some may have failed.`);
    }

    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <ScanLine className="h-4 w-4" />
            Scan Prescription
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-primary" />
            Scan Prescription
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-destructive font-medium">{error}</p>
                    <p className="text-muted-foreground text-xs mt-1">Tips: Use good lighting, keep camera steady, ensure text is visible.</p>
                  </div>
                </div>
              )}

              {imagePreview ? (
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden border border-border bg-muted aspect-video flex items-center justify-center">
                    {imageMimeType === 'application/pdf' ? (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <FileWarning className="h-10 w-10" />
                        <p className="text-sm">PDF selected</p>
                      </div>
                    ) : (
                      <img src={imagePreview} alt="Prescription preview" className="max-h-full max-w-full object-contain" />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => { setImagePreview(null); setImageBase64(null); }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <Button onClick={handleScan} className="w-full gap-2 bg-gradient-health">
                    <ScanLine className="h-4 w-4" />
                    Extract Medications
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Upload Photo</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">JPG, PNG, PDF</p>
                    </div>
                  </button>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Camera className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Take Photo</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Use camera</p>
                    </div>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />

              <p className="text-[11px] text-muted-foreground text-center">
                Your prescription image is processed securely and not stored unless you choose to save the extracted data.
              </p>
            </motion.div>
          )}

          {/* STEP 2: Scanning */}
          {step === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="relative mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-health">
                  <ScanLine className="h-8 w-8 text-primary-foreground" />
                </div>
                <Loader2 className="absolute -top-1 -right-1 h-6 w-6 animate-spin text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold">Scanning Prescription</h3>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
                AI is reading your prescription and extracting medication details...
              </p>
            </motion.div>
          )}

          {/* STEP 3: Review */}
          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Confidence badge */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {medications.length} medication{medications.length !== 1 ? 's' : ''} detected
                </p>
                <Badge
                  variant={confidence === 'high' ? 'default' : confidence === 'medium' ? 'secondary' : 'destructive'}
                  className="gap-1 text-xs"
                >
                  {confidence === 'high' && <Check className="h-3 w-3" />}
                  {confidence === 'low' && <AlertTriangle className="h-3 w-3" />}
                  {confidence} confidence
                </Badge>
              </div>

              {confidence === 'low' && (
                <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-muted-foreground">
                  <AlertTriangle className="inline h-3.5 w-3.5 text-warning mr-1" />
                  Prescription text was difficult to read. Please confirm all medication details below.
                </div>
              )}

              {/* Medication cards */}
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {medications.map((med, index) => {
                  const duplicate = isDuplicate(med.name);
                  return (
                    <Card key={index} className={duplicate ? 'border-warning/50' : ''}>
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <Label className="text-[11px] text-muted-foreground">Medication Name</Label>
                            <Input
                              value={med.name}
                              onChange={(e) => updateMedication(index, 'name', e.target.value)}
                              className="h-8 text-sm font-medium"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 mt-4 text-destructive hover:bg-destructive/10 flex-shrink-0"
                            onClick={() => removeMedication(index)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        {duplicate && (
                          <p className="text-[11px] text-warning flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            This medication may already be in your list
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[11px] text-muted-foreground">Dosage</Label>
                            <Input
                              type="number"
                              min="0.01"
                              step="any"
                              value={med.dosage}
                              onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-[11px] text-muted-foreground">Unit</Label>
                            <Select
                              value={med.dosage_unit}
                              onValueChange={(v) => updateMedication(index, 'dosage_unit', v)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DOSAGE_UNITS.map(u => (
                                  <SelectItem key={u} value={u}>{u}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[11px] text-muted-foreground">Frequency</Label>
                            <Select
                              value={med.frequency}
                              onValueChange={(v) => updateMedication(index, 'frequency', v)}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FREQUENCIES.map(f => (
                                  <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-[11px] text-muted-foreground">Duration</Label>
                            <Input
                              value={med.duration || ''}
                              onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                              placeholder="e.g. 5 days"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>

                        {med.notes && (
                          <div>
                            <Label className="text-[11px] text-muted-foreground">Notes</Label>
                            <Input
                              value={med.notes}
                              onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={() => { setStep('upload'); setMedications([]); }} className="flex-1">
                  Rescan
                </Button>
                <Button
                  onClick={handleSaveAll}
                  disabled={medications.length === 0}
                  className="flex-1 bg-gradient-health gap-2"
                >
                  <Check className="h-4 w-4" />
                  Save All ({medications.length})
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Saving */}
          {step === 'saving' && (
            <motion.div
              key="saving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <h3 className="font-display text-lg font-semibold">Saving Medications</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {savingCount} of {medications.length} saved...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
