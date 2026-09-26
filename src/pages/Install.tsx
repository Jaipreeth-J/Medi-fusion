import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Smartphone,
  Wifi,
  WifiOff,
  Zap,
  Shield,
  Bell,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { InstallButton } from '@/components/install/InstallButton';
import { IOSInstallInstructions } from '@/components/install/IOSInstallInstructions';

const features = [
  {
    icon: WifiOff,
    title: 'Works Offline',
    description: 'Access your health data even without internet',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Instant loading with app-like performance',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Get medication reminders and health alerts',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your health data stays on your device',
  },
];

export default function Install() {
  const navigate = useNavigate();
  const { isInstalled, isIOS, platform, canInstall, triggerInstall } = usePWAInstall();

  const handleInstall = async () => {
    if (!isIOS) {
      await triggerInstall();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-health">
              <Heart className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Medifusion</span>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-health shadow-glow"
          >
            <Heart className="h-12 w-12 text-primary-foreground" />
          </motion.div>
          
          <h1 className="font-display text-3xl font-bold mb-3">
            Install Medifusion
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Get the full app experience with offline access, faster loading, and home screen access
          </p>
        </motion.div>

        {/* Install Status */}
        {isInstalled ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-primary/30 bg-primary/5 mb-8">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Already Installed!</h2>
                <p className="text-muted-foreground text-sm mb-4">
                  Medifusion is already installed on your device. You can find it on your home screen.
                </p>
                <Button onClick={() => navigate('/')} variant="outline">
                  Open Dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Platform-specific install section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Smartphone className="h-5 w-5 text-primary" />
                    {isIOS ? 'Install on iOS' : 'Install Now'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isIOS ? (
                    <IOSInstallInstructions />
                  ) : canInstall ? (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Click the button below to install Medifusion on your {platform === 'android' ? 'Android device' : 'computer'}
                      </p>
                      <InstallButton variant="hero" onInstallClick={handleInstall} />
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Your browser supports PWA installation. Try using the browser menu to install Medifusion.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Look for "Install app" or "Add to Home Screen" in your browser's menu
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-4 text-center">Why Install?</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Card className="h-full border-border/50 bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{feature.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Platform Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-muted-foreground">
            Detected platform: <span className="font-medium text-foreground capitalize">{platform}</span>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
