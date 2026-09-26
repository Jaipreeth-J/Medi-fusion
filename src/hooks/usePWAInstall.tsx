import { useState, useEffect, useCallback } from 'react';

// BeforeInstallPromptEvent interface for TypeScript
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export type Platform = 'android' | 'ios' | 'desktop' | 'unknown';
export type InstallState = 'idle' | 'available' | 'installed' | 'unsupported';

export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installState, setInstallState] = useState<InstallState>('idle');
  const [platform, setPlatform] = useState<Platform>('unknown');

  // Detect platform
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid;

    if (isIOS) {
      setPlatform('ios');
      // iOS Safari doesn't support beforeinstallprompt, but PWA can still be installed
      setInstallState('available');
    } else if (isAndroid) {
      setPlatform('android');
    } else if (!isMobile) {
      setPlatform('desktop');
    }
  }, []);

  // Check if already installed
  useEffect(() => {
    const checkInstalled = () => {
      // Check if running in standalone mode (installed PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (navigator as any).standalone === true;
      
      if (isStandalone || isIOSStandalone) {
        setInstallState('installed');
      }
    };

    checkInstalled();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkInstalled);
    
    return () => mediaQuery.removeEventListener('change', checkInstalled);
  }, []);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setInstallState('available');
    };

    const handleAppInstalled = () => {
      setInstallState('installed');
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger install prompt
  const triggerInstall = useCallback(async () => {
    if (!installPrompt) {
      return { success: false, reason: 'no-prompt' };
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setInstallState('installed');
        setInstallPrompt(null);
        return { success: true, outcome };
      }
      
      return { success: false, outcome };
    } catch (error) {
      console.error('Install prompt error:', error);
      return { success: false, reason: 'error' };
    }
  }, [installPrompt]);

  // Check if installation is available
  const canInstall = installState === 'available' && (platform !== 'ios' ? !!installPrompt : true);

  return {
    platform,
    installState,
    canInstall,
    triggerInstall,
    isInstalled: installState === 'installed',
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isDesktop: platform === 'desktop',
  };
}
