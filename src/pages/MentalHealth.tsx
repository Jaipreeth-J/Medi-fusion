import { AppLayout } from '@/components/layout/AppLayout';
import { Phone, Brain as BrainIcon, HeartHandshake } from 'lucide-react';
import { SafetyDisclaimer } from '@/components/common/SafetyDisclaimer';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AddMoodDialog } from '@/components/mental-health/AddMoodDialog';
import { WeeklyMoodChart } from '@/components/mental-health/WeeklyMoodChart';
import { MoodStatsCards } from '@/components/mental-health/MoodStatsCards';
import { MoodEntryCard } from '@/components/mental-health/MoodEntryCard';
import { useMood } from '@/hooks/useMood';
import { Brain, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MentalHealth() {
  const { entries, loading, deleteEntry } = useMood();

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl px-4 py-5 space-y-6 sm:px-6 sm:py-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              Mental Health
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your mood, manage stress, and practice gratitude
            </p>
          </div>
          <AddMoodDialog />
        </div>

        <SafetyDisclaimer variant="compact" />


        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MoodStatsCards />
            </div>

            {/* Weekly Chart */}
            <WeeklyMoodChart />

            {/* Tips Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Heart className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Self-Care Reminder</h3>
                    <p className="text-sm text-muted-foreground">
                      Taking time to check in with yourself is an important step in maintaining 
                      mental wellness. Remember that it's okay to have difficult days.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl p-6 border border-accent/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-6 w-6 text-accent mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Gratitude Practice</h3>
                    <p className="text-sm text-muted-foreground">
                      Studies show that practicing gratitude can improve mood and life satisfaction. 
                      Try noting three things you're grateful for each day.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Entries */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
              {entries.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No entries yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start tracking your mood to see your mental health journey.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {entries.slice(0, 6).map((entry) => (
                    <MoodEntryCard 
                      key={entry.id} 
                      entry={entry} 
                      onDelete={deleteEntry}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Mental Health Helplines (India) */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mt-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-primary" />
            🧠 Mental Health Helplines (India)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="tel:18002662345"
              className="flex items-center gap-3 p-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              <HeartHandshake className="h-5 w-5 shrink-0" />
              <div>
                <div className="font-medium text-sm">Vandrevala Foundation</div>
                <div className="text-xs opacity-90">1860-2662-345 · 24/7</div>
              </div>
            </a>
            <a
              href="tel:9152987821"
              className="flex items-center gap-3 p-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
            >
              <BrainIcon className="h-5 w-5 shrink-0" />
              <div>
                <div className="font-medium text-sm">iCall (TISS)</div>
                <div className="text-xs opacity-90">9152987821 · 24/7</div>
              </div>
            </a>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            If you're in crisis, please reach out. These helplines are free, confidential, and available 24/7.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
