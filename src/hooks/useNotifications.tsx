/**
 * USE NOTIFICATIONS HOOK
 * Manages browser push notifications with vibration and sound support
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
  vibrate?: boolean;
  playSound?: boolean;
}

interface UseNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission | 'unsupported';
  isEnabled: boolean;
  requestPermission: () => Promise<boolean>;
  sendNotification: (options: NotificationOptions) => void;
  scheduleNotification: (options: NotificationOptions, delayMs: number) => number;
  cancelScheduledNotification: (timerId: number) => void;
}

const NOTIFICATION_ICON = '/pwa-192x192.png';

// Generate a short beep sound using Web Audio API
function playAlertSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Play 3 short beeps
    const playBeep = (startTime: number, frequency: number) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    };

    const now = audioCtx.currentTime;
    playBeep(now, 880);       // A5
    playBeep(now + 0.4, 988); // B5
    playBeep(now + 0.8, 1047); // C6
  } catch (e) {
    console.warn('Could not play alert sound:', e);
  }
}

// Trigger vibration pattern for medication reminder
function vibrateAlert() {
  if ('vibrate' in navigator) {
    // Pattern: vibrate 200ms, pause 100ms, vibrate 200ms, pause 100ms, vibrate 300ms
    navigator.vibrate([200, 100, 200, 100, 300]);
  }
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  
  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  const isEnabled = permission === 'granted';

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Notifications not supported', {
        description: 'Your browser does not support notifications.',
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      toast.error('Notifications blocked', {
        description: 'Please enable notifications in your browser settings.',
      });
      setPermission('denied');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('Notifications enabled', {
          description: 'You will receive medication reminders with sound and vibration.',
        });
        return true;
      } else if (result === 'denied') {
        toast.error('Notifications denied', {
          description: 'You can enable them later in browser settings.',
        });
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      toast.error('Failed to enable notifications');
      return false;
    }
  }, [isSupported]);

  const sendNotification = useCallback((options: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Cannot send notification: not supported or not permitted');
      return;
    }

    // Play sound alert
    if (options.playSound !== false) {
      playAlertSound();
    }

    // Trigger vibration
    if (options.vibrate !== false) {
      vibrateAlert();
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || NOTIFICATION_ICON,
        tag: options.tag,
        requireInteraction: options.requireInteraction ?? true,
        data: options.data,
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        if (options.data?.type === 'medication_reminder') {
          window.location.href = '/medications';
        }
      };

      // Auto-close after 30 seconds for persistent reminders
      if (!options.requireInteraction) {
        setTimeout(() => notification.close(), 10000);
      } else {
        // Even persistent reminders close after 30s
        setTimeout(() => notification.close(), 30000);
      }

      // Note: In-app reminder banners are handled by MedicationReminderBanner component
      // No duplicate toast needed here
    } catch (error) {
      console.error('Failed to send notification:', error);
      // Fallback to toast only
      toast.info(options.title, { description: options.body, duration: 15000 });
    }
  }, [isSupported, permission]);

  const scheduleNotification = useCallback((options: NotificationOptions, delayMs: number): number => {
    const timerId = window.setTimeout(() => {
      sendNotification(options);
    }, delayMs);
    
    return timerId;
  }, [sendNotification]);

  const cancelScheduledNotification = useCallback((timerId: number) => {
    window.clearTimeout(timerId);
  }, []);

  return {
    isSupported,
    permission,
    isEnabled,
    requestPermission,
    sendNotification,
    scheduleNotification,
    cancelScheduledNotification,
  };
}
