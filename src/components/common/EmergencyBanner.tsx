import { motion } from 'framer-motion';
import { AlertTriangle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmergencyContactsGrid, INDIA_EMERGENCY_CONTACTS, EmergencyContactButton } from '@/components/common/EmergencyContacts';

interface EmergencyBannerProps {
  onDismiss?: () => void;
}

export function EmergencyBanner({ onDismiss }: EmergencyBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border-2 border-destructive bg-destructive/10 p-4 shadow-emergency"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
          <AlertTriangle className="h-5 w-5" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-display text-lg font-bold text-destructive">
            🚨 Emergency – Your Safety is Important
          </h3>
          <p className="mt-1 text-sm text-foreground/80">
            If you're experiencing a medical or mental health emergency, please call for help immediately.
          </p>
          
          <div className="mt-3">
            <EmergencyContactsGrid compact showCard={false} />
          </div>
        </div>
        
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground shrink-0"
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        )}
      </div>
    </motion.div>
  );
}
