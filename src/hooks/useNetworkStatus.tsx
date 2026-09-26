/**
 * NETWORK STATUS HOOK
 * Properly detects online/offline state without false positives on refresh.
 * Only shows offline after confirmed network failure, not during page load.
 */

import { useState, useEffect, useCallback } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    if (wasOffline) {
      setWasOffline(false);
    }
  }, [wasOffline]);

  const handleOffline = useCallback(() => {
    // Double-check with navigator.onLine before declaring offline
    if (!navigator.onLine) {
      setIsOnline(false);
      setWasOffline(true);
    }
  }, []);

  useEffect(() => {
    // Set initial state but don't show offline banner on mount
    // Only trust navigator.onLine after a brief stabilization period
    const stabilize = setTimeout(() => {
      if (!navigator.onLine) {
        setIsOnline(false);
        setWasOffline(true);
      }
    }, 1500);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(stabilize);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline };
}
