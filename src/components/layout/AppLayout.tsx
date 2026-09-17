import { ReactNode, useState } from 'react';
import { MedicationReminderBanner } from '@/components/medications/MedicationReminderBanner';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  LayoutDashboard,
  Activity,
  Stethoscope,
  Brain,
  Image,
  User,
  Menu,
  X,
  LogOut,
  Shield,
  Heart,
  Pill,
  History,
  Watch,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { InstallButton } from '@/components/install/InstallButton';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { SOSButton } from '@/components/sos/SOSButton';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/chat', label: 'Chat', icon: MessageCircle },
  { path: '/vitals', label: 'Vitals', icon: Activity },
  { path: '/symptoms', label: 'Symptoms', icon: Stethoscope },
  { path: '/mental-health', label: 'Mental Health', icon: Brain },
  { path: '/medications', label: 'Medications', icon: Pill },
  { path: '/wearables', label: 'Wearables', icon: Watch },
  { path: '/images', label: 'Medical Images', icon: Image },
  { path: '/history', label: 'Assessment History', icon: History },
  { path: '/profile', label: 'Profile', icon: User },
];

// Bottom nav: show the 5 most important items on mobile
const bottomNavItems = [
  { path: '/', label: 'Home', icon: LayoutDashboard },
  { path: '/vitals', label: 'Vitals', icon: Activity },
  { path: '/chat', label: 'Chat', icon: MessageCircle },
  { path: '/medications', label: 'Meds', icon: Pill },
  { path: '/profile', label: 'Profile', icon: User },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { canInstall, isInstalled } = usePWAInstall();

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="flex h-full flex-col">
          {/* Logo + SOS */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-health shadow-glow">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold text-sidebar-foreground">
                  Medifusion
                </h1>
                <p className="text-xs text-muted-foreground">Health Assistant</p>
              </div>
            </div>
            {/* Desktop SOS Button */}
            <SOSButton />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-soft'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4 space-y-2">
            <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Your data is private & secure</span>
            </div>
            {canInstall && !isInstalled && (
              <Link
                to="/install"
                className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                <Download className="h-4 w-4" />
                Install App
              </Link>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-health">
            <Heart className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-base font-bold">Medifusion</span>
        </div>
        <div className="flex items-center gap-2">
          {/* SOS Button in header */}
          <SOSButton />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed inset-x-0 top-14 z-40 max-h-[calc(100vh-3.5rem-var(--bottom-nav-height))] overflow-y-auto border-b border-border bg-card p-4 lg:hidden"
            >
              <nav className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium transition-all touch-target',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-secondary'
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              {canInstall && !isInstalled && (
                <Link
                  to="/install"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-3 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-3 text-sm font-medium text-primary"
                >
                  <Download className="h-4 w-4" />
                  Install App
                </Link>
              )}
              <Button
                variant="ghost"
                className="mt-2 w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Medication Reminder Banners */}
      <MedicationReminderBanner />

      {/* Main Content */}
      <main className="min-h-screen pt-14 pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom,0px))] lg:pl-64 lg:pt-0 lg:pb-0">
        <div className="h-full w-full">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex h-[var(--bottom-nav-height)] items-center justify-around px-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors min-w-[3.5rem]',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
