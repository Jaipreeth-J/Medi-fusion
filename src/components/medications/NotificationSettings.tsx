/**
 * NOTIFICATION SETTINGS CARD
 * UI for enabling/disabling medication reminders
 */

import { Bell, BellOff, BellRing, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useMedicationReminders } from '@/hooks/useMedicationReminders';
import { cn } from '@/lib/utils';

export function NotificationSettings() {
  const {
    isEnabled,
    enableReminders,
    disableReminders,
    scheduledReminders,
    notificationsSupported,
    notificationPermission,
  } = useMedicationReminders();

  if (!notificationsSupported) {
    return (
      <Card className="border-warning/30 bg-warning/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertCircle className="h-5 w-5 text-warning" />
            Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your browser doesn't support push notifications. Try using Chrome, Firefox, or Edge for the best experience.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleToggle = async () => {
    if (isEnabled) {
      disableReminders();
    } else {
      await enableReminders();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <BellRing className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <BellOff className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-base">Medication Reminders</CardTitle>
              <CardDescription className="text-xs">
                Get notified when it's time to take your medications
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleToggle}
            aria-label="Toggle medication reminders"
          />
        </div>
      </CardHeader>
      
      {isEnabled && scheduledReminders.length > 0 && (
        <CardContent className="pt-0">
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Upcoming reminders today:
            </p>
            <div className="flex flex-wrap gap-2">
              {scheduledReminders.slice(0, 5).map((reminder, idx) => (
                <Badge key={idx} variant="outline" className="gap-1 text-xs">
                  <Bell className="h-3 w-3" />
                  {reminder.medicationName} at {reminder.scheduledTime}
                </Badge>
              ))}
              {scheduledReminders.length > 5 && (
                <Badge variant="secondary" className="text-xs">
                  +{scheduledReminders.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      )}

      {notificationPermission === 'denied' && (
        <CardContent className="pt-0">
          <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
            <p className="font-medium">Notifications are blocked</p>
            <p className="mt-1 text-destructive/80">
              Please enable notifications in your browser settings to receive medication reminders.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
