/**
 * DRUG INTERACTION WARNING CARD
 * Interactive, visually rich drug interaction display
 */

import { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  AlertCircle, 
  XCircle, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Pill,
  ArrowRight,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import type { InteractionAnalysis, DrugInteraction } from '@/hooks/useMedications';

interface DrugInteractionCardProps {
  analysis: InteractionAnalysis | null;
  isLoading: boolean;
  onRefresh: () => void;
  medicationCount: number;
}

const severityConfig = {
  none: {
    icon: ShieldCheck,
    label: 'No Interactions',
    color: 'text-green-600',
    badgeClass: 'bg-green-500/10 text-green-600 border-green-200',
    bgColor: '',
    progressColor: 10,
  },
  minor: {
    icon: AlertCircle,
    label: 'Minor',
    color: 'text-blue-600',
    badgeClass: 'bg-blue-500/10 text-blue-600 border-blue-200',
    bgColor: '',
    progressColor: 30,
  },
  moderate: {
    icon: AlertTriangle,
    label: 'Moderate',
    color: 'text-yellow-600',
    badgeClass: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    progressColor: 60,
  },
  major: {
    icon: XCircle,
    label: 'Major',
    color: 'text-orange-600',
    badgeClass: 'bg-orange-500/10 text-orange-600 border-orange-200',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    progressColor: 85,
  },
  contraindicated: {
    icon: XCircle,
    label: 'Contraindicated',
    color: 'text-destructive',
    badgeClass: 'bg-destructive/10 text-destructive border-destructive/30',
    bgColor: 'bg-destructive/5',
    progressColor: 100,
  },
  unknown: {
    icon: AlertCircle,
    label: 'Unknown',
    color: 'text-muted-foreground',
    badgeClass: 'bg-muted text-muted-foreground border-border',
    bgColor: '',
    progressColor: 0,
  },
};

function InteractionItem({ interaction, index }: { interaction: DrugInteraction; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[interaction.severity];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border bg-card overflow-hidden"
    >
      <button 
        className="flex items-center justify-between gap-3 w-full p-4 text-left hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.badgeClass}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm">{interaction.medications[0]}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="font-medium text-sm">{interaction.medications[1]}</span>
            </div>
            <Badge variant="outline" className={`mt-1 text-[10px] ${config.badgeClass}`}>
              {config.label}
            </Badge>
          </div>
        </div>
        <div className="shrink-0">
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-3">
              <Separator />
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="font-medium text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Mechanism</p>
                  <p className="text-sm leading-relaxed">{interaction.mechanism}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="font-medium text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Effects</p>
                  <p className="text-sm leading-relaxed">{interaction.effects}</p>
                </div>
                <div className="rounded-lg bg-primary/5 p-3 border border-primary/10">
                  <p className="font-medium text-[10px] uppercase tracking-wider text-primary mb-1">Recommendation</p>
                  <p className="text-sm leading-relaxed">{interaction.recommendation}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function DrugInteractionCard({ 
  analysis, 
  isLoading, 
  onRefresh,
  medicationCount 
}: DrugInteractionCardProps) {
  const [showAll, setShowAll] = useState(false);

  if (medicationCount < 2) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-muted mb-3">
            <Stethoscope className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-medium mb-1">Drug Interaction Checker</p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Add at least 2 active medications to analyze potential drug interactions
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Analyzing Interactions...</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Checking {medicationCount} medications</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Check Drug Interactions</p>
                <p className="text-xs text-muted-foreground">
                  Analyze {medicationCount} medications for potential interactions
                </p>
              </div>
            </div>
            <Button onClick={onRefresh} size="sm" className="gap-1.5 shrink-0">
              <RefreshCw className="h-3.5 w-3.5" />
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const config = severityConfig[analysis.overallSeverity];
  const Icon = config.icon;
  const significantInteractions = analysis.interactions.filter(
    i => i.severity !== 'none'
  );
  const displayInteractions = showAll 
    ? significantInteractions 
    : significantInteractions.slice(0, 3);

  return (
    <Card className={config.bgColor}>
      <CardHeader className="p-5 sm:p-6 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.badgeClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{severityConfig[analysis.overallSeverity].label === 'No Interactions' ? 'No Interactions Found' : 'Interaction Alert'}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {significantInteractions.length} interaction{significantInteractions.length !== 1 ? 's' : ''} detected
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="gap-1.5 shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Re-check
          </Button>
        </div>

        {/* Severity bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>Severity Level</span>
            <Badge variant="outline" className={`text-[10px] ${config.badgeClass}`}>
              {config.label}
            </Badge>
          </div>
          <Progress 
            value={config.progressColor} 
            className="h-2" 
          />
        </div>
      </CardHeader>
      
      <CardContent className="p-5 sm:p-6 pt-0 space-y-4">
        {/* Summary */}
        <div className="flex gap-2 items-start rounded-lg bg-muted/50 p-3">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm leading-relaxed">{analysis.summary}</p>
        </div>

        {/* Interaction list */}
        {significantInteractions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Interactions ({significantInteractions.length})
            </p>
            {displayInteractions.map((interaction, index) => (
              <InteractionItem key={index} interaction={interaction} index={index} />
            ))}
            
            {significantInteractions.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full text-muted-foreground"
              >
                {showAll 
                  ? 'Show Less' 
                  : `Show ${significantInteractions.length - 3} more`
                }
                {showAll ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </Button>
            )}
          </div>
        )}

        {/* Warnings */}
        {analysis.generalWarnings.length > 0 && (
          <div className="rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-500/5 p-4">
            <p className="font-medium text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              General Warnings
            </p>
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              {analysis.generalWarnings.map((warning, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-yellow-600 shrink-0">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Monitoring */}
        {analysis.monitoringAdvice.length > 0 && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="font-medium text-sm mb-2 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              Monitoring Advice
            </p>
            <ul className="text-sm space-y-1.5 text-muted-foreground">
              {analysis.monitoringAdvice.map((advice, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary shrink-0">•</span>
                  {advice}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator />
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {analysis.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
}
