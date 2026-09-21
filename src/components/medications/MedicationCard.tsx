/**
 * MEDICATION CARD
 * Displays a single medication with all schedule times and edit/delete actions
 */

import { useState } from 'react';
import { 
  Pill, 
  Clock, 
  CheckCircle2, 
  MoreVertical, 
  Trash2, 
  Pause, 
  Play,
  Pencil,
  User,
  Building
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import type { Medication } from '@/hooks/useMedications';
import { useMedications } from '@/hooks/useMedications';
import { EditMedicationDialog } from './EditMedicationDialog';

interface MedicationCardProps {
  medication: Medication;
}

const frequencyLabels: Record<string, string> = {
  once_daily: 'Once daily',
  twice_daily: 'Twice daily',
  three_times_daily: '3x daily',
  four_times_daily: '4x daily',
  every_other_day: 'Every other day',
  weekly: 'Weekly',
  as_needed: 'As needed',
  custom: 'Custom',
};

export function MedicationCard({ medication }: MedicationCardProps) {
  const { logMedicationTaken, updateMedication, deleteMedication, wasTakenToday } = useMedications();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleTakeMedication = async (scheduledTime?: string) => {
    await logMedicationTaken.mutateAsync({
      medicationId: medication.id,
      scheduledTime,
    });
  };

  const handleToggleActive = async () => {
    await updateMedication.mutateAsync({
      id: medication.id,
      is_active: !medication.is_active,
    });
  };

  const handleDelete = async () => {
    await deleteMedication.mutateAsync(medication.id);
    setShowDeleteDialog(false);
  };

  const allDosesTakenToday = medication.schedule_times.length === 0 || 
    medication.schedule_times.every(time => wasTakenToday(medication.id, time));

  return (
    <>
      <Card className={`transition-all h-full flex flex-col overflow-hidden ${!medication.is_active ? 'opacity-60' : ''}`}>
        <CardContent className="p-5 sm:p-6 flex flex-col flex-1 gap-0">
          {/* Header: name + menu */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                medication.is_active ? 'bg-primary/10' : 'bg-muted'
              }`}>
                <Pill className={`h-4 w-4 ${medication.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-sm leading-tight truncate">{medication.medication_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {medication.dosage} {medication.dosage_unit}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleActive}>
                  {medication.is_active ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Mark Inactive
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Mark Active
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <Badge variant="outline" className="text-xs">
              {frequencyLabels[medication.frequency] || medication.frequency}
            </Badge>
            {!medication.is_active && (
              <Badge variant="secondary" className="text-xs">Inactive</Badge>
            )}
            {allDosesTakenToday && medication.is_active && medication.schedule_times.length > 0 && (
              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                All taken
              </Badge>
            )}
          </div>

          {medication.purpose && (
            <p className="text-xs text-muted-foreground mb-1">For: {medication.purpose}</p>
          )}

          {medication.instructions && (
            <p className="text-xs text-amber-600 mb-2 italic">⚠️ {medication.instructions}</p>
          )}

          {/* Schedule Times as chips */}
          {medication.schedule_times.length > 0 && medication.is_active && (
            <div className="mt-auto pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
                <Clock className="h-3 w-3" />
                Daily Schedule
              </p>
              <div className="flex flex-wrap gap-1.5">
                {medication.schedule_times.map((time) => {
                  const taken = wasTakenToday(medication.id, time);
                  return (
                    <Badge
                      key={time}
                      variant="outline"
                      className={`text-xs py-1 ${
                        taken
                          ? 'bg-green-500/10 text-green-600 border-green-200'
                          : 'bg-muted/50 text-foreground border-border'
                      }`}
                    >
                      {taken && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {time}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* As needed */}
          {medication.frequency === 'as_needed' && medication.is_active && (
            <div className="mt-auto pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1 w-full"
                onClick={() => handleTakeMedication()}
                disabled={logMedicationTaken.isPending}
              >
                <CheckCircle2 className="h-3 w-3" />
                Log as Taken
              </Button>
            </div>
          )}

          {/* Metadata */}
          {(medication.prescribing_doctor || medication.pharmacy || medication.last_taken_at) && (
            <div className="flex flex-wrap gap-2 mt-2 pt-2 text-xs text-muted-foreground">
              {medication.prescribing_doctor && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {medication.prescribing_doctor}
                </span>
              )}
              {medication.pharmacy && (
                <span className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {medication.pharmacy}
                </span>
              )}
              {medication.last_taken_at && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {formatDistanceToNow(new Date(medication.last_taken_at), { addSuffix: true })}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <EditMedicationDialog
        medication={medication}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medication?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {medication.medication_name}? 
              This will also remove all tracking history for this medication.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
