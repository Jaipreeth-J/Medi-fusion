import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-destructive-foreground text-sm font-medium"
        >
          <WifiOff className="h-4 w-4" />
          <span>You're offline. Some features may be unavailable.</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-2 flex items-center gap-1 rounded-md bg-destructive-foreground/20 px-2 py-0.5 text-xs hover:bg-destructive-foreground/30 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
