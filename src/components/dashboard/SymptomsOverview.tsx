/**
 * SYMPTOMS OVERVIEW
 * Mini summary of active symptoms for the dashboard
 */

import { memo } from 'react';
import { Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSymptoms } from '@/hooks/useSymptoms';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const SymptomsOverview = memo(function SymptomsOverview() {
  const { activeSymptoms, resolvedSymptoms, isLoading, getStats } = useSymptoms();
  const stats = getStats();

  const getSeverityColor = (severity: number) => {
    if (severity >= 7) return 'bg-destructive/10 text-destructive border-destructive/30';
    if (severity >= 4) return 'bg-warning/10 text-warning border-warning/30';
    return 'bg-success/10 text-success border-success/30';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            Symptoms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            Symptoms
          </CardTitle>
          <Link to="/symptoms">
            <Button variant="ghost" size="sm" className="text-xs">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats row */}
        <div className="flex gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-sm">
            <AlertCircle className="h-3.5 w-3.5 text-warning" />
            <span className="font-medium">{stats.activeCount}</span>
            <span className="text-muted-foreground">active</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            <span className="font-medium">{stats.resolvedCount}</span>
            <span className="text-muted-foreground">resolved</span>
          </div>
        </div>

        {activeSymptoms.length > 0 ? (
          <div className="space-y-2">
            {activeSymptoms.slice(0, 3).map((symptom) => (
              <div
                key={symptom.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-card px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{symptom.symptom_name}</span>
                  {symptom.body_location && (
                    <span className="text-xs text-muted-foreground">
                      ({symptom.body_location})
                    </span>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn('text-xs', getSeverityColor(symptom.severity))}
                >
                  {symptom.severity}/10
                </Badge>
              </div>
            ))}
            {activeSymptoms.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{activeSymptoms.length - 3} more symptoms
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <p>No active symptoms</p>
            <Link to="/symptoms">
              <Button variant="outline" size="sm" className="mt-3">
                Log Symptom
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
