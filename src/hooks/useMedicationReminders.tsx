/**
 * USE MEDICATION REMINDERS HOOK
 * Manages scheduled notifications for medication doses.
 * Tracks dismissed/snoozed state to prevent infinite re-triggering.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useNotifications } from './useNotifications';
import { useMedications, Medication } from './useMedications';
import { playAlarmTone } from '@/lib/alarmSounds';
import { toast } from 'sonner';

export interface ActiveReminder {
  id: string; // `${medicationId}_${scheduledTime}`
  medicationId: string;
  medicationName: string;
  dosage: string;
  dosageUnit: string;
  scheduledTime: string;
  triggeredAt: number; // timestamp when the reminder fired
}

export interface ScheduledReminder {
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  timerId: number;
}

interface UseMedicationRemindersReturn {
  isEnabled: boolean;
  enableReminders: () => Promise<boolean>;
  disableReminders: () => void;
  scheduledReminders: ScheduledReminder[];
  activeReminders: ActiveReminder[];
  dismissReminder: (reminderId: string) => void;
  snoozeReminder: (reminderId: string, minutes: number) => void;
  markTaken: (reminderId: string) => void;
  notificationsSupported: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
}

const REMINDERS_ENABLED_KEY = 'medifusion_reminders_enabled';
const DISMISSED_KEY = 'medifusion_dismissed_reminders';

// Get today's date string for scoping dismissed state
function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

// Load dismissed reminder IDs for today
function loadDismissed(): Set<string> {
  try {
    const stored = JSON.parse(localStorage.getItem(DISMISSED_KEY) || '{}');
    const today = getTodayKey();
    // Clean old days
    if (stored._date !== today) {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify({ _date: today }));
      return new Set();
    }
    return new Set(stored.ids || []);
  } catch {
    return new Set();
  }
}

function saveDismissed(ids: Set<string>) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify({
    _date: getTodayKey(),
    ids: Array.from(ids),
  }));
}

function getNextOccurrence(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const scheduled = new Date();
  scheduled.setHours(hours, minutes, 0, 0);
  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }
  return scheduled;
}

function getDelayUntil(scheduledTime: Date): number {
  return Math.max(0, scheduledTime.getTime() - Date.now());
}

export function useMedicationReminders(): UseMedicationRemindersReturn {
  const { activeMedications, logMedicationTaken, wasTakenToday } = useMedications();
  const {
    isSupported,
    permission,
    isEnabled: notificationsEnabled,
    requestPermission,
    scheduleNotification,
    cancelScheduledNotification,
  } = useNotifications();

  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(REMINDERS_ENABLED_KEY) === 'true';
  });

  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);
  const [activeReminders, setActiveReminders] = useState<ActiveReminder[]>([]);
  const dismissedRef = useRef<Set<string>>(loadDismissed());
  const scheduledTimersRef = useRef<Map<string, number>>(new Map());
  const isSchedulingRef = useRef(false);

  // Dismiss a reminder — removes from UI and prevents re-trigger today
  const dismissReminder = useCallback((reminderId: string) => {
    dismissedRef.current.add(reminderId);
    saveDismissed(dismissedRef.current);
    setActiveReminders(prev => prev.filter(r => r.id !== reminderId));
  }, []);

  // Snooze — dismiss now, schedule a new reminder after `minutes`
  const snoozeReminder = useCallback((reminderId: string, minutes: number) => {
    const reminder = activeReminders.find(r => r.id === reminderId) ||
      // If not in active list, try to find in medications
      null;

    // Remove from active UI immediately
    setActiveReminders(prev => prev.filter(r => r.id !== reminderId));

    if (!reminder) return;

    const snoozeKey = `${reminderId}_snooze_${Date.now()}`;
    const delayMs = minutes * 60 * 1000;

    const timerId = window.setTimeout(() => {
      // When snooze fires, check it hasn't been dismissed again
      if (!dismissedRef.current.has(reminderId)) {
        // Play alarm sound when snooze fires
        playAlarmTone();

        setActiveReminders(prev => {
          // Prevent duplicates
          if (prev.some(r => r.id === reminderId)) return prev;
          return [...prev, { ...reminder, triggeredAt: Date.now() }];
        });
      }
    }, delayMs);

    scheduledTimersRef.current.set(snoozeKey, timerId);

    toast.info(`Snoozed for ${minutes} minutes`, {
      description: `${reminder.medicationName} reminder will appear again.`,
      duration: 3000,
    });
  }, [activeReminders]);

  // Mark medication as taken and dismiss
  const markTaken = useCallback((reminderId: string) => {
    const reminder = activeReminders.find(r => r.id === reminderId);
    if (reminder) {
      logMedicationTaken.mutate({
        medicationId: reminder.medicationId,
        scheduledTime: reminder.scheduledTime,
      });
    }
    dismissReminder(reminderId);
  }, [activeReminders, logMedicationTaken, dismissReminder]);

  // Fire a reminder — add to active list + show browser notification
  const fireReminder = useCallback((medication: Medication, time: string) => {
    const reminderId = `${medication.id}_${time}`;

    // Don't fire if dismissed or already active or already taken
    if (dismissedRef.current.has(reminderId)) return;

    setActiveReminders(prev => {
      if (prev.some(r => r.id === reminderId)) return prev;
      return [...prev, {
        id: reminderId,
        medicationId: medication.id,
        medicationName: medication.medication_name,
        dosage: medication.dosage,
        dosageUnit: medication.dosage_unit,
        scheduledTime: time,
        triggeredAt: Date.now(),
      }];
    });
  }, []);

  // Clear all scheduled timers
  const clearAllTimers = useCallback(() => {
    scheduledTimersRef.current.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    scheduledTimersRef.current.clear();
    setScheduledReminders([]);
  }, []);

  // Schedule reminders for a single medication
  const scheduleRemindersForMedication = useCallback((medication: Medication) => {
    if (!medication.schedule_times || medication.schedule_times.length === 0) return;

    medication.schedule_times.forEach((time) => {
      const reminderKey = `${medication.id}_${time}`;

      // Don't schedule if already scheduled or dismissed
      if (scheduledTimersRef.current.has(reminderKey)) return;
      if (dismissedRef.current.has(reminderKey)) return;

      const nextOccurrence = getNextOccurrence(time);
      const delay = getDelayUntil(nextOccurrence);

      // Only schedule within 24 hours
      if (delay > 24 * 60 * 60 * 1000) return;

      const timerId = window.setTimeout(() => {
        fireReminder(medication, time);

        // Play alarm sound
        playAlarmTone();

        // Also send browser notification as backup
        try {
          if (permission === 'granted') {
            const notification = new Notification('💊 Medication Reminder', {
              body: `Time to take ${medication.medication_name} (${medication.dosage}${medication.dosage_unit})`,
              icon: '/pwa-192x192.png',
              tag: `medication_${medication.id}`,
              requireInteraction: true,
            });
            notification.onclick = () => {
              window.focus();
              notification.close();
            };
            setTimeout(() => notification.close(), 30000);
          }
        } catch (e) {
          console.warn('Browser notification failed:', e);
        }
      }, delay);

      scheduledTimersRef.current.set(reminderKey, timerId);

      setScheduledReminders(prev => {
        if (prev.some(r => r.medicationId === medication.id && r.scheduledTime === time)) return prev;
        return [...prev, {
          medicationId: medication.id,
          medicationName: medication.medication_name,
          scheduledTime: time,
          timerId,
        }];
      });
    });
  }, [fireReminder, permission]);

  // Enable
  const enableReminders = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Notifications not supported');
      return false;
    }
    const granted = await requestPermission();
    if (!granted) return false;

    setIsEnabled(true);
    localStorage.setItem(REMINDERS_ENABLED_KEY, 'true');
    activeMedications.forEach(scheduleRemindersForMedication);

    toast.success('Medication reminders enabled', {
      description: `${activeMedications.length} medication(s) scheduled.`,
    });
    return true;
  }, [isSupported, requestPermission, activeMedications, scheduleRemindersForMedication]);

  // Disable
  const disableReminders = useCallback(() => {
    clearAllTimers();
    setActiveReminders([]);
    setIsEnabled(false);
    localStorage.setItem(REMINDERS_ENABLED_KEY, 'false');
    toast.info('Medication reminders disabled');
  }, [clearAllTimers]);

  // Schedule when medications change — but only once per cycle
  useEffect(() => {
    if (!isEnabled || !notificationsEnabled) {
      clearAllTimers();
      return;
    }

    // Prevent overlapping schedule calls
    if (isSchedulingRef.current) return;
    isSchedulingRef.current = true;

    clearAllTimers();
    activeMedications.forEach(scheduleRemindersForMedication);

    // Reset the guard after a tick
    setTimeout(() => { isSchedulingRef.current = false; }, 100);

    return () => { clearAllTimers(); };
  }, [isEnabled, notificationsEnabled, activeMedications.length]);

  // Hourly refresh for day changes — use a stable interval
  useEffect(() => {
    if (!isEnabled || !notificationsEnabled) return;

    const intervalId = setInterval(() => {
      // Reset dismissed set on new day
      const currentDismissed = loadDismissed();
      dismissedRef.current = currentDismissed;

      clearAllTimers();
      activeMedications.forEach(scheduleRemindersForMedication);
    }, 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isEnabled, notificationsEnabled]);

  return {
    isEnabled,
    enableReminders,
    disableReminders,
    scheduledReminders,
    activeReminders,
    dismissReminder,
    snoozeReminder,
    markTaken,
    notificationsSupported: isSupported,
    notificationPermission: permission,
  };
}
