/**
 * HEALTH INSIGHTS CARD
 * AI-generated weekly health insights
 */

import { useState } from 'react';
import { Sparkles, RefreshCw, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHealthInsights } from '@/hooks/useHealthInsights';
import { format, parseISO } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { SafetyDisclaimer } from '@/components/common/SafetyDisclaimer';

export function HealthInsightsCard() {
  const { latestWeeklyInsight, isLoading, isGenerating, generateInsights, shouldGenerateNew } = useHealthInsights();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerate = async () => {
    await generateInsights();
    setIsExpanded(true);
  };

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Weekly Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-primary/20 overflow-hidden">
      <CardHeader className="pb-2 px-3 pt-3 sm:px-6 sm:pt-6">
        <div className="space-y-2">
          {/* Title row */}
          <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-health">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span>Weekly Health Insights</span>
          </CardTitle>

          {/* Controls row — always below title on mobile */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {latestWeeklyInsight && (
                <span>Generated {format(parseISO(latestWeeklyInsight.created_at), 'MMM d')}</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {latestWeeklyInsight && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs h-7 px-2"
                >
                  {isExpanded ? (
                    <><ChevronUp className="h-3 w-3 mr-1" />Less</>
                  ) : (
                    <><ChevronDown className="h-3 w-3 mr-1" />More</>
                  )}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-xs h-7 px-2"
              >
                <RefreshCw className={cn("h-3 w-3 mr-1", isGenerating && "animate-spin")} />
                {isGenerating ? 'Wait…' : latestWeeklyInsight ? 'Refresh' : 'Generate'}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {latestWeeklyInsight ? (
          <div className="space-y-3">
            {/* Preview or full content */}
            <div
              className={cn(
                'prose prose-sm dark:prose-invert max-w-none',
                !isExpanded && 'line-clamp-4'
              )}
            >
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h3 className="text-base font-semibold mt-4 first:mt-0">{children}</h3>,
                  h2: ({ children }) => <h4 className="text-sm font-semibold mt-3">{children}</h4>,
                  p: ({ children }) => <p className="text-sm text-foreground/90 my-2">{children}</p>,
                  ul: ({ children }) => <ul className="text-sm my-2 space-y-1">{children}</ul>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                }}
              >
                {latestWeeklyInsight.summary}
              </ReactMarkdown>
            </div>

            {!isExpanded && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-xs p-0 h-auto text-primary"
              >
                Read full insights →
              </Button>
            )}

            {isExpanded && (
              <SafetyDisclaimer variant="compact" className="mt-4" />
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-medium mb-1">Get Personalized Health Insights</h3>
            <p className="text-xs text-muted-foreground mb-4 max-w-md mx-auto">
              Our AI will analyze your vitals, symptoms, and mood data from the past week to provide personalized wellness recommendations.
            </p>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Insights...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Weekly Insights
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
