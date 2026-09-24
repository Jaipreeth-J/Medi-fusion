/**
 * EXPORT DIALOG COMPONENT
 * Modal for exporting health data in various formats
 */

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useVitals } from '@/hooks/useVitals';
import { useSymptoms } from '@/hooks/useSymptoms';
import { useMood } from '@/hooks/useMood';
import { useProfile } from '@/hooks/useProfile';
import {
  exportVitalsToCSV,
  exportSymptomsToCSV,
  exportMoodToCSV,
  exportHealthReportPDF,
} from '@/lib/exportUtils';

interface ExportDialogProps {
  trigger?: React.ReactNode;
}

export function ExportDialog({ trigger }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
  const [selectedData, setSelectedData] = useState({
    vitals: true,
    symptoms: true,
    mood: true,
    profile: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();
  const { vitals } = useVitals();
  const { symptoms } = useSymptoms();
  const { entries: moodEntries } = useMood();
  const { profile } = useProfile();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (format === 'pdf') {
        exportHealthReportPDF({
          profile: selectedData.profile ? profile : null,
          vitals: selectedData.vitals ? vitals : [],
          symptoms: selectedData.symptoms ? symptoms : [],
          moodEntries: selectedData.mood ? moodEntries : [],
        });
        toast({
          title: 'PDF Report Generated',
          description: 'Your health report has been downloaded.',
        });
      } else {
        // CSV exports - export each selected type separately
        if (selectedData.vitals && vitals.length > 0) {
          exportVitalsToCSV(vitals);
        }
        if (selectedData.symptoms && symptoms.length > 0) {
          exportSymptomsToCSV(symptoms);
        }
        if (selectedData.mood && moodEntries.length > 0) {
          exportMoodToCSV(moodEntries);
        }
        toast({
          title: 'CSV Files Generated',
          description: 'Your health data has been exported.',
        });
      }
      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const toggleDataSelection = (key: keyof typeof selectedData) => {
    setSelectedData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hasAnySelection = Object.values(selectedData).some(Boolean);
  const hasAnyData = vitals.length > 0 || symptoms.length > 0 || moodEntries.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Health Records
          </DialogTitle>
          <DialogDescription>
            Download your health data to share with healthcare providers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as 'pdf' | 'csv')}>
              <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2 cursor-pointer flex-1">
                  <FileText className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="font-medium">PDF Report</p>
                    <p className="text-xs text-muted-foreground">
                      Comprehensive formatted report for healthcare providers
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer flex-1">
                  <FileSpreadsheet className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">CSV Spreadsheet</p>
                    <p className="text-xs text-muted-foreground">
                      Raw data files for analysis or import
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Data Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Include Data</Label>
            <div className="space-y-2">
              {format === 'pdf' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="profile"
                    checked={selectedData.profile}
                    onCheckedChange={() => toggleDataSelection('profile')}
                  />
                  <Label htmlFor="profile" className="flex items-center gap-2 cursor-pointer">
                    Profile & Medical History
                    {profile?.full_name && (
                      <Check className="h-3 w-3 text-green-500" />
                    )}
                  </Label>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vitals"
                  checked={selectedData.vitals}
                  onCheckedChange={() => toggleDataSelection('vitals')}
                />
                <Label htmlFor="vitals" className="flex items-center gap-2 cursor-pointer">
                  Vital Signs
                  <span className="text-xs text-muted-foreground">
                    ({vitals.length} records)
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="symptoms"
                  checked={selectedData.symptoms}
                  onCheckedChange={() => toggleDataSelection('symptoms')}
                />
                <Label htmlFor="symptoms" className="flex items-center gap-2 cursor-pointer">
                  Symptoms
                  <span className="text-xs text-muted-foreground">
                    ({symptoms.length} records)
                  </span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mood"
                  checked={selectedData.mood}
                  onCheckedChange={() => toggleDataSelection('mood')}
                />
                <Label htmlFor="mood" className="flex items-center gap-2 cursor-pointer">
                  Mental Health
                  <span className="text-xs text-muted-foreground">
                    ({moodEntries.length} records)
                  </span>
                </Label>
              </div>
            </div>
          </div>

          {!hasAnyData && (
            <p className="text-sm text-muted-foreground text-center py-2">
              No health data available to export. Start tracking to generate reports.
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={!hasAnySelection || !hasAnyData || isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
