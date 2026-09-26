import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, Monitor, Apple, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { cn } from '@/lib/utils';

interface InstallButtonProps {
  variant?: 'default' | 'hero' | 'compact';
  className?: string;
  showPlatformIcon?: boolean;
  onInstallClick?: () => void;
}

export function InstallButton({ 
  variant = 'default', 
  className,
  showPlatformIcon = true,
  onInstallClick,
}: InstallButtonProps) {
  const { platform, canInstall, triggerInstall, isInstalled, isIOS } = usePWAInstall();

  const handleClick = async () => {
    if (isIOS) {
      // For iOS, redirect to install page with instructions
      onInstallClick?.();
      return;
    }
    
    await triggerInstall();
    onInstallClick?.();
  };

  // Get platform-specific icon
  const PlatformIcon = () => {
    if (isInstalled) return <CheckCircle2 className="h-4 w-4" />;
    switch (platform) {
      case 'ios':
        return <Apple className="h-4 w-4" />;
      case 'android':
        return <Smartphone className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  // Get button text based on state
  const getButtonText = () => {
    if (isInstalled) return 'Installed';
    if (isIOS) return 'Install App';
    if (!canInstall) return 'Open in Browser';
    return 'Install Medifusion';
  };

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={handleClick}
          disabled={isInstalled}
          size="sm"
          variant={isInstalled ? 'secondary' : 'default'}
          className={cn('gap-2', className)}
        >
          {showPlatformIcon && <PlatformIcon />}
          {getButtonText()}
        </Button>
      </motion.div>
    );
  }

  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={className}
      >
        <Button
          onClick={handleClick}
          disabled={isInstalled}
          size="lg"
          className={cn(
            'gap-3 px-8 py-6 text-lg font-semibold shadow-lg',
            isInstalled 
              ? 'bg-secondary text-secondary-foreground' 
              : 'bg-gradient-health hover:opacity-90 transition-opacity'
          )}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={isInstalled ? 'installed' : 'install'}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-3"
            >
              <PlatformIcon />
              {getButtonText()}
            </motion.span>
          </AnimatePresence>
        </Button>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Button
        onClick={handleClick}
        disabled={isInstalled}
        variant={isInstalled ? 'secondary' : 'default'}
        className={cn('gap-2', className)}
      >
        {showPlatformIcon && <PlatformIcon />}
        {getButtonText()}
      </Button>
    </motion.div>
  );
}
