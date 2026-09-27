import { AlertTriangle, Info, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface SafetyDisclaimerProps {
  variant?: 'default' | 'compact' | 'emergency';
  className?: string;
}

export function SafetyDisclaimer({ variant = 'default', className }: SafetyDisclaimerProps) {
  if (variant === 'emergency') {
    return (
      <div className={cn('emergency-alert', className)}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-destructive" />
          <div>
            <h4 className="font-semibold text-destructive">Emergency Detected</h4>
            <p className="mt-1 text-sm text-destructive/80">
              If you are experiencing a medical emergency, please call 911 or your local emergency services immediately.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground', className)}>
        <Info className="h-3 w-3 flex-shrink-0" />
        <span>AI assistant for education only. Not medical advice.</span>
      </div>
    );
  }

  return (
    <Alert className={cn('border-primary/20 bg-primary/5', className)}>
      <Shield className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary">Medical Disclaimer</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        Medifusion is an AI health assistant for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. 
        Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
      </AlertDescription>
    </Alert>
  );
}
