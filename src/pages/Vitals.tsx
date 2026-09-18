/**
 * VITALS DASHBOARD PAGE
 * Comprehensive view of user health vitals with charts and trends
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Calendar, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { VitalChart } from '@/components/vitals/VitalChart';
import { BloodPressureChart } from '@/components/vitals/BloodPressureChart';
import { VitalsSummaryCards } from '@/components/vitals/VitalsSummaryCards';
import { AddVitalDialog } from '@/components/vitals/AddVitalDialog';
import { SafetyDisclaimer } from '@/components/common/SafetyDisclaimer';
import { useVitals } from '@/hooks/useVitals';
import { VITAL_RANGES } from '@/lib/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export default function Vitals() {
  const [timeRange, setTimeRange] = useState<number>(30);
  const {
    isLoading,
    addVital,
    getSummary,
    heartRateData,
    bloodPressureData,
    bloodSugarData,
    spo2Data,
    weightData,
    temperatureData,
    sleepData,
    activityData,
  } = useVitals(timeRange);

  const summary = getSummary();

  // Skeleton layout — same structure as real page to prevent layout shift
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-full flex-col overflow-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
          {/* Header skeleton */}
          <div className="flex flex-col gap-4 border-b border-border/50 bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-7 w-48 animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="flex gap-3">
              <div className="h-9 w-36 animate-pulse rounded-md bg-muted" />
              <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
          {/* Summary cards skeleton */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
          {/* Chart skeletons */}
          <div className="mt-6 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
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
              <Activity className="h-6 w-6 text-primary" />
              Vitals Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track and monitor your health metrics over time
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Time Range Selector */}
            <Select
              value={timeRange.toString()}
              onValueChange={(v) => setTimeRange(parseInt(v))}
            >
              <SelectTrigger className="w-[140px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            {/* Add Vital Button */}
            <AddVitalDialog
              onSubmit={(data) => addVital.mutate(data)}
              isLoading={addVital.isPending}
            />
          </div>
        </motion.header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <motion.div className="space-y-6" variants={containerVariants}>
            {/* Summary Cards */}
            <motion.section variants={itemVariants}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <TrendingUp className="h-5 w-5 text-primary" />
                Current Readings
              </h2>
              <VitalsSummaryCards summary={summary} />
            </motion.section>

            {/* Charts Section */}
            <motion.section variants={itemVariants}>
              <Tabs defaultValue="cardiovascular" className="w-full">
                <TabsList className="mb-4 w-full justify-start">
                  <TabsTrigger value="cardiovascular">Cardiovascular</TabsTrigger>
                  <TabsTrigger value="metabolic">Metabolic</TabsTrigger>
                  <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
                </TabsList>

                {/* Cardiovascular Tab */}
                <TabsContent value="cardiovascular" className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <VitalChart
                      title="Heart Rate"
                      data={heartRateData}
                      color="hsl(var(--destructive))"
                      unit=" bpm"
                      normalRange={VITAL_RANGES.heartRate.normal}
                      height={250}
                    />
                    <BloodPressureChart data={bloodPressureData} height={250} />
                  </div>
                  <VitalChart
                    title="Oxygen Saturation (SpO2)"
                    data={spo2Data}
                    color="hsl(var(--success))"
                    unit="%"
                    normalRange={VITAL_RANGES.spo2.normal}
                    height={200}
                  />
                </TabsContent>

                {/* Metabolic Tab */}
                <TabsContent value="metabolic" className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <VitalChart
                      title="Blood Sugar (Fasting)"
                      data={bloodSugarData}
                      color="hsl(var(--primary))"
                      unit=" mg/dL"
                      normalRange={VITAL_RANGES.bloodSugar.normal}
                      height={250}
                    />
                    <VitalChart
                      title="Weight"
                      data={weightData}
                      color="hsl(var(--accent))"
                      unit=" kg"
                      height={250}
                    />
                  </div>
                  <VitalChart
                    title="Temperature"
                    data={temperatureData}
                    color="hsl(var(--warning))"
                    unit="°C"
                    normalRange={VITAL_RANGES.temperature.normal}
                    height={200}
                  />
                </TabsContent>

                {/* Lifestyle Tab */}
                <TabsContent value="lifestyle" className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <VitalChart
                      title="Sleep Duration"
                      data={sleepData}
                      color="hsl(var(--info))"
                      unit=" hrs"
                      normalRange={{ min: 7, max: 9 }}
                      height={250}
                    />
                    <VitalChart
                      title="Activity"
                      data={activityData}
                      color="hsl(var(--success))"
                      unit=" min"
                      normalRange={{ min: 30, max: 120 }}
                      height={250}
                    />
                  </div>
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
