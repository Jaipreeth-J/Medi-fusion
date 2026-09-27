import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Activity } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

export function SplashScreen({ onComplete, minDuration = 2000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, minDuration / 50);

    // Hide splash after minimum duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, minDuration);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [minDuration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute rounded-full bg-primary/10"
                style={{
                  width: `${100 + i * 50}px`,
                  height: `${100 + i * 50}px`,
                  left: `${10 + i * 15}%`,
                  top: `${20 + i * 10}%`,
                }}
              />
            ))}
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Animated logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                duration: 0.8,
              }}
              className="relative mb-8"
            >
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 rounded-full border-2 border-dashed border-primary/30"
              />
              
              {/* Inner glow */}
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(20, 184, 166, 0.3)",
                    "0 0 60px rgba(20, 184, 166, 0.6)",
                    "0 0 20px rgba(20, 184, 166, 0.3)",
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/80"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Heart className="h-14 w-14 text-primary-foreground" />
                </motion.div>
              </motion.div>

              {/* Pulse rings */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.6,
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 rounded-3xl border-2 border-primary"
                />
              ))}
            </motion.div>

            {/* App name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-2 font-display text-4xl font-bold tracking-tight"
            >
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Medifusion
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8 text-sm text-muted-foreground"
            >
              AI-Powered Health Assistant
            </motion.p>

            {/* Heartbeat animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-8 flex items-center gap-2"
            >
              <Activity className="h-5 w-5 text-primary" />
              <svg width="120" height="40" viewBox="0 0 120 40">
                <motion.path
                  d="M0,20 L20,20 L25,10 L30,30 L35,15 L40,25 L45,20 L60,20 L65,5 L70,35 L75,20 L80,20 L85,12 L90,28 L95,20 L120,20"
                  fill="none"
                  className="stroke-primary"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </svg>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "200px" }}
              transition={{ delay: 0.8 }}
              className="relative h-1.5 overflow-hidden rounded-full bg-primary/20"
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary to-primary/70"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </motion.div>

            {/* Loading text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 text-xs text-muted-foreground"
            >
              {progress < 30 && "Initializing..."}
              {progress >= 30 && progress < 60 && "Loading your health data..."}
              {progress >= 60 && progress < 90 && "Preparing dashboard..."}
              {progress >= 90 && "Ready!"}
            </motion.p>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 text-center"
          >
            <p className="text-xs text-muted-foreground">
              Your health, intelligently monitored
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
