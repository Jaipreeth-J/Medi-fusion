/**
 * ASSESSMENT CARD COMPONENT
 * Displays a single clinical assessment with expandable details
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  Activity, 
  MessageSquare, 
  FileText,
  Clock,
  Shield,
  AlertCircle,
  Trash2,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import type { Assessment } from '@/hooks/useAssessmentHistory';

interface AssessmentCardProps {
  assessment: Assessment;
  onDelete?: (assessment: Assessment) => void;
}

const typeConfig = {
  weekly_insight: {
    icon: Activity,
    label: 'Weekly Insight',
    color: 'bg-primary/15 text-primary dark:bg-primary/20',
  },
  chat_assessment: {
    icon: MessageSquare,
    label: 'Chat Assessment',
    color: 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  },
  symptom_analysis: {
    icon: FileText,
    label: 'Symptom Analysis',
    color: 'bg-purple-500/15 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  },
  image_analysis: {
    icon: FileText,
    label: 'Image Analysis',
    color: 'bg-green-500/15 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  },
};

const riskConfig = {
  low: {
    icon: Shield,
    label: 'Low Risk',
    color: 'bg-green-500/15 text-green-700 border-green-300 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/30',
  },
  moderate: {
    icon: AlertCircle,
    label: 'Moderate Risk',
    color: 'bg-yellow-500/15 text-yellow-700 border-yellow-300 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/30',
  },
  high: {
    icon: AlertTriangle,
    label: 'High Risk',
    color: 'bg-destructive/15 text-destructive border-destructive/30 dark:bg-destructive/20 dark:text-red-400 dark:border-destructive/40',
  },
};

export function AssessmentCard({ assessment, onDelete }: AssessmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const typeInfo = typeConfig[assessment.type];
  const TypeIcon = typeInfo.icon;
  const riskInfo = assessment.riskLevel ? riskConfig[assessment.riskLevel] : null;
  const RiskIcon = riskInfo?.icon;

  // Strip HTML tags and markdown for clean text preview
  const cleanContent = assessment.content
    .replace(/<[^>]*>/g, ' ')  // strip HTML tags
    .replace(/[#*_`]/g, '')     // strip markdown
    .replace(/\s+/g, ' ')       // normalize whitespace
    .trim();
  const previewContent = cleanContent.slice(0, 300) + (cleanContent.length > 300 ? '...' : '');

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${assessment.isEmergency ? 'border-destructive/50 bg-destructive/5' : ''}`}>
      <CardHeader className="p-3.5 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${typeInfo.color}`}>
              <TypeIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-medium truncate">
                {assessment.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{format(new Date(assessment.createdAt), 'MMM d, yyyy h:mm a')}</span>
              </div>
            </div>
          </div>
          
          {/* Delete button */}
          <div className="shrink-0">
            {onDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      onDelete(assessment);
                      setConfirmDelete(false);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setConfirmDelete(false)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )
            )}
          </div>
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {assessment.isEmergency && (
            <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive border border-destructive/20">
              <AlertTriangle className="h-3 w-3" />
              Emergency
            </span>
          )}
          {riskInfo && RiskIcon && (
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border ${riskInfo.color}`}>
              <RiskIcon className="h-3 w-3" />
              {riskInfo.label}
            </span>
          )}
          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${typeInfo.color}`}>
            {typeInfo.label}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-3.5 sm:p-5 pt-0">
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="prose prose-sm max-w-none dark:prose-invert"
            >
              <ReactMarkdown
                components={{
                  h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                  p: ({ children }) => <p className="mb-2 text-sm leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                }}
              >
                {assessment.content}
              </ReactMarkdown>
              
              {/* Metadata */}
              {assessment.metadata && (
                <div className="mt-4 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    {assessment.metadata.periodStart && assessment.metadata.periodEnd && (
                      <span>
                        Period: {format(new Date(assessment.metadata.periodStart as string), 'MMM d')} - {format(new Date(assessment.metadata.periodEnd as string), 'MMM d, yyyy')}
                      </span>
                    )}
                    {assessment.metadata.dataSources && (
                      <span className="ml-3">
                        Sources: {(assessment.metadata.dataSources as string[]).join(', ')}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground line-clamp-3"
            >
              {previewContent}
            </motion.div>
          )}
        </AnimatePresence>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 w-full text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show More
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
