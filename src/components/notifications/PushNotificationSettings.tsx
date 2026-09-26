import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellOff, CheckCircle2, AlertCircle, Pill, Loader2, Volume2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  type AlarmTone,
  ALARM_TONES,
  getAlarmSettings,
  saveAlarmSettings,
  playAlarmTone,
} from '@/lib/alarmSounds';

export function PushNotificationSettings() {
  const {
    permission,
    isSupported,
    isLoading,
    isSubscribed,
    subscribe,
    unsubscribe,
    sendLocalNotification,
  } = usePushNotifications();
  const { toast } = useToast();
  const [testingReminder, setTestingReminder] = useState(false);

  // Alarm settings state
  const [alarmSettings, setAlarmSettings] = useState(getAlarmSettings);

  const handleToneChange = (tone: AlarmTone) => {
    const updated = { ...alarmSettings, tone };
    setAlarmSettings(updated);
    saveAlarmSettings(updated);
    // Preview the tone
    playAlarmTone(tone, updated.volume);
  };

  const handleVolumeChange = (value: number[]) => {
    const updated = { ...alarmSettings, volume: value[0] };
    setAlarmSettings(updated);
    saveAlarmSettings(updated);
  };

  const handleVolumeCommit = (value: number[]) => {
    // Play a short preview after user finishes dragging
    playAlarmTone(alarmSettings.tone, value[0]);
  };

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  };

  const sendTestNotification = async () => {
    await sendLocalNotification('Test Notification', {
      body: 'Push notifications are working correctly!',
      tag: 'test-notification',
    });
  };

  const triggerMedicationReminder = async () => {
    setTestingReminder(true);
    try {
      // Play the alarm sound immediately for testing
      playAlarmTone();

      const { data, error } = await supabase.functions.invoke('send-medication-reminders', {
        body: { test: true },
      });

      if (error) throw error;

      const sent = data?.sent ?? 0;

      if (sent > 0) {
        toast({
          title: '✅ Reminder sent!',
          description: `${sent} notification(s) dispatched. Check your device.`,
        });
      } else {
        await sendLocalNotification('💊 Medication Reminder (Test)', {
          body: 'This is a test medication reminder with sound & vibration.',
          tag: 'medication-test-reminder',
          requireInteraction: true,
          vibrate: [300, 100, 300, 100, 400, 100, 300],
          silent: false,
        } as NotificationOptions);
        toast({
          title: 'Test reminder sent',
          description: data?.message || 'No medications due right now — sent a local test notification instead.',
        });
      }
    } catch (err: any) {
      console.error('Reminder test error:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to trigger reminder',
        variant: 'destructive',
      });
    } finally {
      setTestingReminder(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-5 w-5 text-primary" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive medication reminders and health alerts even when the app is closed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission status */}
        <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center gap-2">
            {permission === 'granted' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : permission === 'denied' ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <Bell className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">
              {permission === 'granted' && 'Notifications enabled'}
              {permission === 'denied' && 'Notifications blocked'}
              {permission === 'default' && 'Notifications not set'}
            </span>
          </div>
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading || permission === 'denied'}
          />
        </div>

        {permission === 'denied' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            <p className="font-medium">Notifications are blocked</p>
            <p className="mt-1 text-xs text-muted-foreground">
              To enable notifications, update your browser settings for this site.
            </p>
          </motion.div>
        )}

        {/* Alarm Tone & Volume Settings — always visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 rounded-lg border border-border/50 bg-secondary/30 p-4"
        >
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Music className="h-4 w-4 text-primary" />
            Alarm Sound Settings
          </h4>

          {/* Tone Selector */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Alarm Tone</label>
            <Select value={alarmSettings.tone} onValueChange={(v) => handleToneChange(v as AlarmTone)}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {ALARM_TONES.map((tone) => (
                  <SelectItem key={tone.id} value={tone.id}>
                    <div className="flex flex-col">
                      <span className="text-sm">{tone.label}</span>
                      <span className="text-[10px] text-muted-foreground">{tone.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Volume Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5" />
                Volume
              </label>
              <span className="text-xs font-medium tabular-nums">{alarmSettings.volume}%</span>
            </div>
            <Slider
              value={[alarmSettings.volume]}
              onValueChange={handleVolumeChange}
              onValueCommit={handleVolumeCommit}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground/50">
              <span>Silent</span>
              <span>Max</span>
            </div>
          </div>

          {/* Preview Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => playAlarmTone()}
            className="w-full gap-2"
          >
            <Volume2 className="h-3.5 w-3.5" />
            Preview Alarm Sound
          </Button>
        </motion.div>

        {isSubscribed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={sendTestNotification}
              className="w-full"
            >
              Send Test Notification
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={triggerMedicationReminder}
              disabled={testingReminder}
              className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/10"
            >
              {testingReminder ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Pill className="h-3.5 w-3.5" />
              )}
              Test Medication Reminder
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              Triggers the reminder system. If no meds are due, sends a local test push.
            </p>
          </motion.div>
        )}

        {/* Features list */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium text-muted-foreground">You'll receive notifications for:</p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              Medication reminders at scheduled times
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              Critical health alerts and warnings
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              Weekly health summary reports
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
