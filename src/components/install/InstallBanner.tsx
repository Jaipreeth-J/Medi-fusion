import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useNavigate } from 'react-router-dom';

export function InstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { canInstall, isInstalled, triggerInstall, isIOS } = usePWAInstall();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show banner after a delay if install is available
    const timer = setTimeout(() => {
      if (canInstall && !isInstalled) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [canInstall, isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  const handleInstall = async () => {
    if (isIOS) {
      navigate('/install');
    } else {
      await triggerInstall();
    }
    handleDismiss();
  };

  if (isDismissed || isInstalled || !canInstall) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:max-w-md"
        >
          <div className="rounded-xl border border-border bg-card p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-health">
                <Smartphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">Install Medifusion</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add to home screen for quick access and offline support
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleInstall} className="gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    Install
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleDismiss}>
                    Not now
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
