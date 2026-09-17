import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Activity, Brain } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5">
        <div className="relative flex w-full flex-col justify-between bg-gradient-hero p-12 text-primary-foreground">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-20 right-20 h-60 w-60 rounded-full bg-white/20 blur-3xl" />
          </div>

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Medifusion</h1>
              <p className="text-sm opacity-80">AI Health Assistant</p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-display text-4xl font-bold leading-tight xl:text-5xl">
                Your Personal
                <br />
                Health Companion
              </h2>
              <p className="mt-4 max-w-md text-lg opacity-90">
                Track your vitals, monitor symptoms, and get AI-powered health insights—all in one place.
              </p>
            </motion.div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Activity, label: 'Vitals Tracking' },
                { icon: Brain, label: 'Mental Health' },
                { icon: Shield, label: 'Secure & Private' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="rounded-xl bg-white/10 p-4 backdrop-blur"
                >
                  <item.icon className="mb-2 h-6 w-6" />
                  <p className="text-sm font-medium">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="relative z-10">
            <p className="text-xs opacity-70">
              Medifusion is an educational health assistant. It does not provide medical diagnoses or treatment recommendations.
              Always consult healthcare professionals for medical advice.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex w-full items-center justify-center bg-background p-6 lg:w-1/2 xl:w-2/5">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-health shadow-glow">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Medifusion</h1>
              <p className="text-sm text-muted-foreground">AI Health Assistant</p>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
