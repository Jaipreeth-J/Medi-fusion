/**
 * SYMPTOM CARD COMPONENT
 * Displays individual symptom with actions
 */

import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Clock, MapPin, Check, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { Symptom } from '@/hooks/useSymptoms';
import { getBodyLocationLabel } from './BodyLocationPicker';

interface SymptomCardProps {
  symptom: Symptom;
  onResolve?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

function getSeverityColor(severity: number): string {
  if (severity <= 2) return 'bg-success';
  if (severity <= 4) return 'bg-info';
  if (severity <= 6) return 'bg-warning';
  if (severity <= 8) return 'bg-orange-500';
  return 'bg-destructive';
}

function getSeverityLabel(severity: number): string {
  if (severity <= 2) return 'Mild';
  if (severity <= 4) return 'Moderate';
  if (severity <= 6) return 'Uncomfortable';
  if (severity <= 8) return 'Severe';
  return 'Very Severe';
}

function getFrequencyLabel(frequency: string | null): string {
  const labels: Record<string, string> = {
    once: 'Once',
    occasionally: 'Occasionally',
    frequently: 'Frequently',
    constantly: 'Constantly',
  };
  return frequency ? labels[frequency] || frequency : '';
}

export function SymptomCard({ symptom, onResolve, onDelete, className }: SymptomCardProps) {
  const isResolved = !!symptom.resolved_at;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card
        className={cn(
          'border-border/50 transition-all',
          isResolved && 'opacity-60',
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Severity Indicator */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full text-white font-bold',
                  getSeverityColor(symptom.severity)
                )}
              >
                {symptom.severity}
              </div>
              <span className="mt-1 text-xs text-muted-foreground">
                {getSeverityLabel(symptom.severity)}
              </span>
            </div>

            {/* Symptom Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">
                    {symptom.symptom_name}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(symptom.started_at), 'MMM dd, yyyy')}
                    </span>
                    {symptom.body_location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {getBodyLocationLabel(symptom.body_location)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                {isResolved ? (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                    <Check className="mr-1 h-3 w-3" />
                    Resolved
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-2 flex flex-wrap gap-2">
                {symptom.duration_hours && (
                  <Badge variant="secondary" className="text-xs">
                    {symptom.duration_hours}h duration
                  </Badge>
                )}
                {symptom.frequency && (
                  <Badge variant="secondary" className="text-xs">
                    {getFrequencyLabel(symptom.frequency)}
                  </Badge>
                )}
              </div>

              {/* Description */}
              {symptom.description && (
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {symptom.description}
                </p>
              )}

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                {!isResolved && onResolve && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-success hover:bg-success/10"
                    onClick={() => onResolve(symptom.id)}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Mark Resolved
                  </Button>
                )}
                
                {onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Symptom</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this symptom entry? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(symptom.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
