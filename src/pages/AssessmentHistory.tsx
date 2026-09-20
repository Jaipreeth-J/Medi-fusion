/**
 * CLINICAL ASSESSMENT HISTORY PAGE
 * View past AI analyses and track how assessments have changed over time
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { History, FileText, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssessmentHistory } from '@/hooks/useAssessmentHistory';
import { AssessmentCard } from '@/components/assessment-history/AssessmentCard';
import { AssessmentStats } from '@/components/assessment-history/AssessmentStats';
import { 
  AssessmentFilters, 
  type AssessmentTypeFilter, 
  type RiskLevelFilter 
} from '@/components/assessment-history/AssessmentFilters';

export default function AssessmentHistory() {
  const { assessments, groupedByMonth, stats, isLoading, deleteAssessment } = useAssessmentHistory();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<AssessmentTypeFilter>('all');
  const [riskFilter, setRiskFilter] = useState<RiskLevelFilter>('all');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);

  const hasActiveFilters = 
    searchQuery !== '' || 
    typeFilter !== 'all' || 
    riskFilter !== 'all' || 
    showEmergencyOnly;

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setRiskFilter('all');
    setShowEmergencyOnly(false);
  };

  // Apply filters
  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          assessment.title.toLowerCase().includes(query) ||
          assessment.content.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && assessment.type !== typeFilter) {
        return false;
      }

      // Risk filter
      if (riskFilter !== 'all' && assessment.riskLevel !== riskFilter) {
        return false;
      }

      // Emergency filter
      if (showEmergencyOnly && !assessment.isEmergency) {
        return false;
      }

      return true;
    });
  }, [assessments, searchQuery, typeFilter, riskFilter, showEmergencyOnly]);

  // Group filtered assessments by month
  const filteredGroupedByMonth = useMemo(() => {
    return filteredAssessments.reduce((groups, assessment) => {
      const date = new Date(assessment.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(assessment);
      
      return groups;
    }, {} as Record<string, typeof filteredAssessments>);
  }, [filteredAssessments]);

  const sortedMonths = Object.keys(filteredGroupedByMonth).sort((a, b) => b.localeCompare(a));

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-3 py-4 space-y-6 sm:px-4 sm:py-5 lg:px-6 overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-health shadow-glow">
            <History className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Clinical Assessment History
            </h1>
            <p className="text-muted-foreground text-sm">
              View past AI analyses and track health trends over time
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AssessmentStats stats={stats} />
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-5 pb-4 sm:pt-6">
              <AssessmentFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                typeFilter={typeFilter}
                onTypeChange={setTypeFilter}
                riskFilter={riskFilter}
                onRiskChange={setRiskFilter}
                showEmergencyOnly={showEmergencyOnly}
                onEmergencyToggle={() => setShowEmergencyOnly(!showEmergencyOnly)}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Assessment List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : filteredAssessments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="py-12">
              <CardContent className="text-center">
                <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-muted mb-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No Assessments Found</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  {hasActiveFilters 
                    ? "No assessments match your current filters. Try adjusting your search criteria."
                    : "Start tracking your health by using the AI chat or generating weekly insights from the dashboard."}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {sortedMonths.map((monthKey, index) => {
              const monthAssessments = filteredGroupedByMonth[monthKey];
              const [year, month] = monthKey.split('-');
              const monthDate = new Date(parseInt(year), parseInt(month) - 1);
              
              return (
                <motion.div
                  key={monthKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  {/* Month Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>{format(monthDate, 'MMMM yyyy')}</span>
                    </div>
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">
                      {monthAssessments.length} assessment{monthAssessments.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {/* Assessments Grid */}
                  <div className="space-y-4">
                    {monthAssessments.map((assessment) => (
                      <AssessmentCard
                        key={assessment.id}
                        assessment={assessment}
                        onDelete={(a) => deleteAssessment.mutate(a)}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
