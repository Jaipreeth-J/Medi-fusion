/**
 * MEDICATION REMINDER BANNER
 * In-app notification for medication reminders with Take Now, Snooze, and Dismiss.
 * Renders as a fixed banner at the top of the viewport.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pill, X, Clock, CheckCircle2, AlarmClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMedicationReminders, ActiveReminder } from '@/hooks/useMedicationReminders';
import { cn } from '@/lib/utils';

const SNOOZE_OPTIONS = [
  { label: '5 min', minutes: 5 },
  { label: '10 min', minutes: 10 },
  { label: '30 min', minutes: 30 },
];

function ReminderCard({ reminder, onDismiss, onSnooze, onTakeNow }: {
  reminder: ActiveReminder;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onTakeNow: () => void;
}) {
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="relative w-full max-w-md rounded-xl border border-primary/20 bg-card shadow-lg overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-1 bg-primary" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <Pill className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wide">Medication Reminder</p>
              <p className="font-semibold text-foreground">{reminder.medicationName}</p>
              <p className="text-sm text-muted-foreground">
                {reminder.dosage} {reminder.dosageUnit} · Scheduled at {reminder.scheduledTime}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            aria-label="Dismiss reminder"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onTakeNow}
            className="flex-1 gap-1.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            Take Now
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
            className="gap-1.5"
          >
            <AlarmClock className="h-4 w-4" />
            Snooze
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="text-muted-foreground"
          >
            Dismiss
          </Button>
        </div>

        {/* Snooze Options */}
        <AnimatePresence>
          {showSnoozeOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 pt-3 mt-3 border-t border-border">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="flex flex-wrap gap-2">
                  {SNOOZE_OPTIONS.map((opt) => (
                    <Button
                      key={opt.minutes}
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs"
                      onClick={() => {
                        onSnooze(opt.minutes);
                        setShowSnoozeOptions(false);
                      }}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function MedicationReminderBanner() {
  const { activeReminders, dismissReminder, snoozeReminder, markTaken } = useMedicationReminders();

  if (activeReminders.length === 0) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4 pt-2 lg:top-2 lg:left-64 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {activeReminders.map((reminder) => (
          <div key={reminder.id} className="pointer-events-auto">
            <ReminderCard
              reminder={reminder}
              onDismiss={() => dismissReminder(reminder.id)}
              onSnooze={(minutes) => snoozeReminder(reminder.id, minutes)}
              onTakeNow={() => markTaken(reminder.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
