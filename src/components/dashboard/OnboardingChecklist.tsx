/**
 * ONBOARDING CHECKLIST
 * Shown to new users on the dashboard. Dismissed via localStorage and hidden once all steps are done.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useVitals } from '@/hooks/useVitals';

const STORAGE_KEY = 'medifusion_onboarding_dismissed';

interface Step {
  id: string;
  label: string;
  description: string;
  href: string;
  check: boolean;
}

export function OnboardingChecklist() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const { user } = useAuth();
  const { profile } = useProfile();
  const { vitals } = useVitals(90);

  const steps: Step[] = [
    {
      id: 'profile',
      label: 'Complete your profile',
      description: 'Add your name and health information',
      href: '/profile',
      check: !!(profile?.full_name && profile.full_name.trim().length > 0),
    },
    {
      id: 'vitals',
      label: 'Log your first vital',
      description: 'Record heart rate, blood pressure, or any metric',
      href: '/vitals',
      check: vitals.length > 0,
    },
    {
      id: 'chat',
      label: 'Try the AI health chat',
      description: 'Ask your AI health companion a question',
      href: '/chat',
      check: false, // no reliable client-side check; cleared when dismissed
    },
  ];

  const completedCount = steps.filter((s) => s.check).length;
  const allDone = completedCount === steps.length;

  // Auto-dismiss when all steps are complete
  useEffect(() => {
    if (allDone) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setTimeout(() => setDismissed(true), 1500);
    }
  }, [allDone]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  };

  if (dismissed || !user) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 overflow-hidden">
          <CardHeader className="pb-2 px-4 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-health">
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                Getting Started
                <span className="ml-1 text-xs text-muted-foreground font-normal">
                  {completedCount}/{steps.length} done
                </span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground"
                onClick={handleDismiss}
                aria-label="Dismiss onboarding checklist"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-health"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / steps.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </CardHeader>

          <CardContent className="px-4 pb-4">
            <div className="space-y-2.5">
              {steps.map((step) => (
                <Link
                  key={step.id}
                  to={step.href}
                  className={cn(
                    'flex items-start gap-3 rounded-lg p-2.5 transition-colors',
                    step.check
                      ? 'opacity-60 cursor-default pointer-events-none'
                      : 'hover:bg-primary/5 cursor-pointer'
                  )}
                >
                  {step.check ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0">
                    <p className={cn('text-sm font-medium', step.check && 'line-through text-muted-foreground')}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
