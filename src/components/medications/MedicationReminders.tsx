/**
 * MEDICATION REMINDERS
 * Shows upcoming medication reminders
 */

import { useMemo } from 'react';
import { Bell, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMedications } from '@/hooks/useMedications';

export function MedicationReminders() {
  const { activeMedications, todayLogs, logMedicationTaken, wasTakenToday } = useMedications();

  // Get all scheduled doses for today with their status
  const todaySchedule = useMemo(() => {
    const schedule: {
      time: string;
      medication: typeof activeMedications[0];
      taken: boolean;
    }[] = [];

    activeMedications.forEach(med => {
      med.schedule_times.forEach(time => {
        schedule.push({
          time,
          medication: med,
          taken: wasTakenToday(med.id, time),
        });
      });
    });

    // Sort by time
    schedule.sort((a, b) => a.time.localeCompare(b.time));
    
    return schedule;
  }, [activeMedications, wasTakenToday]);

  // Get current time to highlight upcoming doses
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Find next upcoming dose
  const nextDose = todaySchedule.find(s => !s.taken && s.time >= currentTime);

  // Stats
  const totalDoses = todaySchedule.length;
  const takenDoses = todaySchedule.filter(s => s.taken).length;
  const remainingDoses = totalDoses - takenDoses;

  if (todaySchedule.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">
            No scheduled medications for today
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Today's Schedule
          </CardTitle>
          <Badge variant="outline">
            {takenDoses}/{totalDoses} taken
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Progress Bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(takenDoses / totalDoses) * 100}%` }}
          />
        </div>

        {/* Next Up */}
        {nextDose && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-primary font-medium mb-1">NEXT UP</p>
                <p className="font-medium">{nextDose.medication.medication_name}</p>
                <p className="text-sm text-muted-foreground">
                  {nextDose.medication.dosage} {nextDose.medication.dosage_unit} at {nextDose.time}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => logMedicationTaken.mutate({
                  medicationId: nextDose.medication.id,
                  scheduledTime: nextDose.time,
                })}
                disabled={logMedicationTaken.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Take Now
              </Button>
            </div>
          </div>
        )}

        {/* Schedule List */}
        <div className="space-y-2">
          {todaySchedule.map((item, index) => {
            const isPast = item.time < currentTime;
            const isCurrent = item.time === nextDose?.time && item.medication.id === nextDose?.medication.id;
            
            return (
              <div 
                key={`${item.medication.id}-${item.time}-${index}`}
                className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${
                  item.taken 
                    ? 'bg-green-500/10' 
                    : isCurrent 
                      ? 'bg-primary/5 border border-primary/20' 
                      : isPast 
                        ? 'bg-destructive/5' 
                        : 'bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${
                    item.taken 
                      ? 'bg-green-500/20 text-green-600' 
                      : isPast && !item.taken
                        ? 'bg-destructive/20 text-destructive'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.taken ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${item.taken ? 'text-green-600' : ''}`}>
                      {item.medication.medication_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.medication.dosage} {item.medication.dosage_unit} • {item.time}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  {item.taken ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Taken
                    </Badge>
                  ) : isPast ? (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                      Missed
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => logMedicationTaken.mutate({
                        medicationId: item.medication.id,
                        scheduledTime: item.time,
                      })}
                      disabled={logMedicationTaken.isPending}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      Take Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
