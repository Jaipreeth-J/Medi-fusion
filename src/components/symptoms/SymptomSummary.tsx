/**
 * SYMPTOM SUMMARY COMPONENT
 * AI-generated summary of user symptoms
 */

import { useState } from 'react';
import { isRateLimited } from '@/lib/rateLimitHandler';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Symptom } from '@/hooks/useSymptoms';
import { cn } from '@/lib/utils';
import { sanitizeAI } from '@/lib/sanitize';
import { toast } from 'sonner';

interface SymptomSummaryProps {
  symptoms: Symptom[];
  className?: string;
}

export function SymptomSummary({ symptoms, className }: SymptomSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async () => {
    if (symptoms.length === 0) {
      toast.info('Log some symptoms first to generate a summary');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('symptom-summary', {
        body: {
          symptoms: symptoms.map((s) => ({
            symptom_name: s.symptom_name,
            severity: s.severity,
            duration_hours: s.duration_hours,
            frequency: s.frequency,
            body_location: s.body_location,
            description: s.description,
            started_at: s.started_at,
          })),
        },
      });

      if (fnError) {
        if (isRateLimited({ error: fnError })) return;
        throw fnError;
      }

      if (data?.error) {
        if (data.error.includes('Rate limit')) {
          setError('AI rate limit reached. Please try again in a moment.');
        } else if (data.error.includes('credits')) {
          setError('AI credits exhausted. Please add credits to continue.');
        } else {
          setError(data.error);
        }
        return;
      }

      setSummary(data?.summary || 'Unable to generate summary.');
    } catch (err) {
      console.error('Error generating summary:', err);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn('border-border/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Symptom Summary
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={generateSummary}
            disabled={isLoading || symptoms.length === 0}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {summary ? 'Refresh' : 'Generate'}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!summary && !error && !isLoading && (
          <div className="text-center py-6 text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Click "Generate" to get an AI-powered summary of your symptoms.
            </p>
            <p className="text-xs mt-1 text-muted-foreground/70">
              This summary is for educational purposes only.
            </p>
          </div>
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-8"
          >
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing your symptoms...</p>
            </div>
          </motion.div>
        )}

        {summary && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-sm dark:prose-invert max-w-none"
          >
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {summary.split('\n').map((line, i) => {
                // Handle bold text
                const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // Handle italic disclaimer
                const finalLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
                
                return (
                  <p
                    key={i}
                    className={cn(
                      'my-1',
                      line.startsWith('---') && 'border-t border-border/50 pt-2 mt-3',
                      line.startsWith('*⚕️') && 'text-xs text-muted-foreground italic'
                    )}
                    dangerouslySetInnerHTML={{ __html: sanitizeAI(finalLine) }}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
