/**
 * MEDICATIONS PAGE
 * Medication tracking with reminders and drug interaction warnings
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Pill, AlertTriangle, Calendar, Activity } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMedications, type InteractionAnalysis } from '@/hooks/useMedications';
import { AddMedicationDialog } from '@/components/medications/AddMedicationDialog';
import { ScanPrescriptionDialog } from '@/components/medications/ScanPrescriptionDialog';
import { MedicationCard } from '@/components/medications/MedicationCard';
import { DrugInteractionCard } from '@/components/medications/DrugInteractionCard';
import { MedicationReminders } from '@/components/medications/MedicationReminders';
import { NotificationSettings } from '@/components/medications/NotificationSettings';
import { MedicationAdherenceChart } from '@/components/medications/MedicationAdherenceChart';
import { EmergencyContactsGrid } from '@/components/common/EmergencyContacts';

export default function Medications() {
  const { 
    medications, 
    activeMedications, 
    isLoading, 
    checkInteractions,
    isCheckingInteractions 
  } = useMedications();
  
  const [interactionAnalysis, setInteractionAnalysis] = useState<InteractionAnalysis | null>(null);
  const [prevMedCount, setPrevMedCount] = useState<number | null>(null);
  const isCheckingRef = useRef(false);

  // Check interactions on first load and when medication count changes (add/deactivate)
  useEffect(() => {
    if (isLoading || activeMedications.length < 2) return;
    if (isCheckingRef.current) return;
    
    const isFirstLoad = prevMedCount === null;
    const countChanged = prevMedCount !== null && prevMedCount !== activeMedications.length;
    
    if (isFirstLoad || countChanged) {
      setPrevMedCount(activeMedications.length);
      handleCheckInteractions();
    }
  }, [activeMedications.length, isLoading]);

  const handleCheckInteractions = async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;
    try {
      const result = await checkInteractions();
      setInteractionAnalysis(result);
    } finally {
      isCheckingRef.current = false;
    }
  };

  const inactiveMedications = medications.filter(m => !m.is_active);

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-4 py-5 space-y-6 sm:px-6 sm:py-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-health shadow-glow">
              <Pill className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Medications
              </h1>
              <p className="text-muted-foreground text-sm">
                Track medications and check for interactions
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <ScanPrescriptionDialog />
            <AddMedicationDialog />
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          <Card className="border shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Pill className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeMedications.length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inactiveMedications.length}</p>
                  <p className="text-xs text-muted-foreground">Inactive</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  interactionAnalysis?.overallSeverity === 'major' || 
                  interactionAnalysis?.overallSeverity === 'contraindicated'
                    ? 'bg-destructive/10'
                    : interactionAnalysis?.overallSeverity === 'moderate'
                      ? 'bg-yellow-500/10'
                      : 'bg-green-500/10'
                }`}>
                  <AlertTriangle className={`h-5 w-5 ${
                    interactionAnalysis?.overallSeverity === 'major' || 
                    interactionAnalysis?.overallSeverity === 'contraindicated'
                      ? 'text-destructive'
                      : interactionAnalysis?.overallSeverity === 'moderate'
                        ? 'text-yellow-600'
                        : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {interactionAnalysis?.interactions.filter(i => i.severity !== 'none').length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Interactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <Calendar className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {activeMedications.reduce((acc, m) => acc + m.times_per_day, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Daily Doses</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Drug Interaction Warning */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DrugInteractionCard
            analysis={interactionAnalysis}
            isLoading={isCheckingInteractions}
            onRefresh={handleCheckInteractions}
            medicationCount={activeMedications.length}
          />
          {interactionAnalysis && 
            (interactionAnalysis.overallSeverity === 'major' || 
             interactionAnalysis.overallSeverity === 'contraindicated') && (
            <div className="mt-3">
              <EmergencyContactsGrid compact title="🚨 Contact Emergency Services if Needed" />
            </div>
          )}
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="schedule" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
              <TabsTrigger value="active">Active ({activeMedications.length})</TabsTrigger>
              <TabsTrigger value="inactive">Inactive ({inactiveMedications.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-4">
              <NotificationSettings />
              <MedicationAdherenceChart />
              <MedicationReminders />
            </TabsContent>

            <TabsContent value="active" className="space-y-4 pt-2">
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>
              ) : activeMedications.length === 0 ? (
                <Card className="py-12">
                  <CardContent className="text-center">
                    <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-muted mb-4">
                      <Pill className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">No Active Medications</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                      Add your medications to track them and get interaction warnings.
                    </p>
                    <AddMedicationDialog />
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {activeMedications.map((medication) => (
                    <MedicationCard key={medication.id} medication={medication} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="inactive" className="space-y-4 pt-2">
              {isLoading ? (
                <Skeleton className="h-32 w-full rounded-lg" />
              ) : inactiveMedications.length === 0 ? (
                <Card className="py-8">
                  <CardContent className="text-center text-muted-foreground">
                    No inactive medications
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {inactiveMedications.map((medication) => (
                    <MedicationCard key={medication.id} medication={medication} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AppLayout>
  );
}
