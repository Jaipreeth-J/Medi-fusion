/**
 * SYNC DATA DIALOG
 * Modal for selecting data types and syncing wearable data
 */

import { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { WearableConnection } from '@/hooks/useWearables';
import { 
  DataType, 
  DATA_TYPE_LABELS, 
  getProviderById 
} from '@/lib/wearableProviders';

interface SyncDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: WearableConnection | null;
  onSync: (dataTypes: DataType[], symptoms?: string) => void;
  isSyncing: boolean;
}

export function SyncDataDialog({
  open,
  onOpenChange,
  connection,
  onSync,
  isSyncing,
}: SyncDataDialogProps) {
  const [selectedTypes, setSelectedTypes] = useState<DataType[]>([
    'heart_rate',
    'spo2',
    'steps',
    'calories',
    'sleep',
  ]);
  const [symptoms, setSymptoms] = useState('');

  if (!connection) return null;

  const provider = getProviderById(connection.provider);
  if (!provider) return null;

  const handleToggleType = (type: DataType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSync = () => {
    onSync(selectedTypes, symptoms || undefined);
  };

  const handleSelectAll = () => {
    setSelectedTypes([...provider.supportedDataTypes]);
  };

  const handleDeselectAll = () => {
    setSelectedTypes([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{provider.icon}</span>
            Sync from {provider.name}
          </DialogTitle>
          <DialogDescription>
            Select the data types you want to sync and optionally add symptoms.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Data type selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Data Types</Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleSelectAll}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleDeselectAll}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {provider.supportedDataTypes.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => handleToggleType(type)}
                  />
                  <span className="text-sm">{DATA_TYPE_LABELS[type]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional symptoms input */}
          <div className="space-y-2">
            <Label htmlFor="symptoms">
              Symptoms (optional)
            </Label>
            <Textarea
              id="symptoms"
              placeholder="e.g., headache, fatigue, dizziness..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Adding symptoms helps correlate your vitals with how you're feeling.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSyncing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSync}
            disabled={selectedTypes.length === 0 || isSyncing}
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
