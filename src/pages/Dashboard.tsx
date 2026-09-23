/**
 * UNIFIED HEALTH DASHBOARD
 * Central hub showing overview of all health modules with AI insights
 */

import { motion } from 'framer-motion';
import { LayoutDashboard, Calendar } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HealthInsightsCard } from '@/components/dashboard/HealthInsightsCard';
import { VitalsOverview } from '@/components/dashboard/VitalsOverview';
import { SymptomsOverview } from '@/components/dashboard/SymptomsOverview';
import { MoodOverview } from '@/components/dashboard/MoodOverview';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';
import { MedicationAdherenceChart } from '@/components/medications/MedicationAdherenceChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-4 py-5 space-y-5 sm:px-6 sm:py-6 sm:space-y-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-health shadow-glow">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                {greeting()}, {displayName}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Here's your health overview for today
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QuickActions />
        </motion.div>

        {/* Onboarding Checklist — shown to new users only */}
        <OnboardingChecklist />

        {/* AI Insights Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HealthInsightsCard />
        </motion.div>

        {/* Main Grid — responsive: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <VitalsOverview />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SymptomsOverview />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="sm:col-span-2 lg:col-span-1"
          >
            <MoodOverview />
          </motion.div>
        </div>

        {/* Medication Adherence */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <MedicationAdherenceChart />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <RecentActivity />
        </motion.div>
      </div>
    </AppLayout>
  );
}
