/**
 * SYMPTOMS TRACKER PAGE
 * Track, view, and analyze symptoms with AI assistance
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, TrendingUp, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AddSymptomDialog } from '@/components/symptoms/AddSymptomDialog';
import { SymptomCard } from '@/components/symptoms/SymptomCard';
import { SymptomSummary } from '@/components/symptoms/SymptomSummary';
import { SafetyDisclaimer } from '@/components/common/SafetyDisclaimer';
import { MetricCard } from '@/components/common/MetricCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useSymptoms } from '@/hooks/useSymptoms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Symptoms() {
  const [activeTab, setActiveTab] = useState('active');
  const {
    symptoms,
    activeSymptoms,
    resolvedSymptoms,
    isLoading,
    addSymptom,
    resolveSymptom,
    deleteSymptom,
    getStats,
  } = useSymptoms();

  const stats = getStats();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div
        className="flex h-full flex-col overflow-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.header
          className="flex flex-col gap-4 border-b border-border/50 bg-card/50 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between"
          variants={itemVariants}
        >
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
              <Stethoscope className="h-6 w-6 text-primary" />
              Symptom Tracker
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Log and track your symptoms over time
            </p>
          </div>
          <AddSymptomDialog
            onSubmit={(data) => addSymptom.mutate(data)}
            isLoading={addSymptom.isPending}
          />
        </motion.header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <motion.div className="space-y-6" variants={containerVariants}>
            {/* Stats Cards */}
            <motion.section variants={itemVariants}>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <MetricCard
                  title="Total Logged"
                  value={stats.totalSymptoms}
                  icon={<Stethoscope className="h-5 w-5" />}
                />
                <MetricCard
                  title="Active"
                  value={stats.activeCount}
                  icon={<AlertCircle className="h-5 w-5" />}
                  status={stats.activeCount > 5 ? 'warning' : 'normal'}
                />
                <MetricCard
                  title="Resolved"
                  value={stats.resolvedCount}
                  icon={<CheckCircle className="h-5 w-5" />}
                  status="normal"
                />
                <MetricCard
                  title="Avg Severity"
                  value={stats.avgSeverity.toFixed(1)}
                  unit="/10"
                  icon={<Activity className="h-5 w-5" />}
                  status={stats.avgSeverity > 7 ? 'critical' : stats.avgSeverity > 5 ? 'warning' : 'normal'}
                />
              </div>
            </motion.section>

            {/* Most Common Symptoms */}
            {stats.mostCommon.length > 0 && (
              <motion.section variants={itemVariants}>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Most Common Symptoms
                </h2>
                <div className="flex flex-wrap gap-2">
                  {stats.mostCommon.map(([symptom, count]) => (
                    <Badge
                      key={symptom}
                      variant="secondary"
                      className="text-sm"
                    >
                      {symptom}
                      <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-xs">
                        {count}
                      </span>
                    </Badge>
                  ))}
                </div>
              </motion.section>
            )}

            {/* AI Summary */}
            <motion.section variants={itemVariants}>
              <SymptomSummary symptoms={activeSymptoms} />
            </motion.section>

            {/* Symptom List */}
            <motion.section variants={itemVariants}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="active" className="gap-2">
                    Active
                    {stats.activeCount > 0 && (
                      <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5">
                        {stats.activeCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="gap-2">
                    Resolved
                    {stats.resolvedCount > 0 && (
                      <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5">
                        {stats.resolvedCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {activeSymptoms.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-success/50" />
                        <p>No active symptoms</p>
                        <p className="text-sm">Click "Log Symptom" to track new symptoms</p>
                      </motion.div>
                    ) : (
                      activeSymptoms.map((symptom) => (
                        <SymptomCard
                          key={symptom.id}
                          symptom={symptom}
                          onResolve={(id) => resolveSymptom.mutate(id)}
                          onDelete={(id) => deleteSymptom.mutate(id)}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="resolved" className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {resolvedSymptoms.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No resolved symptoms yet</p>
                      </motion.div>
                    ) : (
                      resolvedSymptoms.map((symptom) => (
                        <SymptomCard
                          key={symptom.id}
                          symptom={symptom}
                          onDelete={(id) => deleteSymptom.mutate(id)}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="all" className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {symptoms.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No symptoms logged yet</p>
                        <p className="text-sm">Start tracking your health journey</p>
                      </motion.div>
                    ) : (
                      symptoms.map((symptom) => (
                        <SymptomCard
                          key={symptom.id}
                          symptom={symptom}
                          onResolve={!symptom.resolved_at ? (id) => resolveSymptom.mutate(id) : undefined}
                          onDelete={(id) => deleteSymptom.mutate(id)}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </TabsContent>
              </Tabs>
            </motion.section>

            {/* Safety Disclaimer */}
            <motion.section variants={itemVariants}>
              <SafetyDisclaimer variant="compact" />
            </motion.section>
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
