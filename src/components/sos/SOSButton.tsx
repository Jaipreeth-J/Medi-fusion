/**
 * SOS EMERGENCY BUTTON - Header Integrated Version
 * Non-intrusive placement in header with confirmation modal
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Phone, MapPin, Users, Siren, Loader2, MessageCircle, Check, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSOS } from '@/hooks/useSOS';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const COUNTDOWN_SECONDS = 10;
const LONG_PRESS_DURATION = 2000; // 2 seconds for long press

interface LocationData {
  lat: number;
  lng: number;
  mapsUrl: string;
}

interface SOSButtonProps {
  variant?: 'header' | 'floating';
  className?: string;
}

export function SOSButton({ variant = 'header', className }: SOSButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locating, setLocating] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [longPressProgress, setLongPressProgress] = useState(0);
  const [isLongPressing, setIsLongPressing] = useState(false);
  
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const longPressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressStartRef = useRef<number>(0);

  const { contacts, preferences } = useSOS();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  // Get GPS location
  const getLocation = useCallback(() => {
    setLocating(true);
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          mapsUrl: `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`,
        });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Play alarm sound
  const playAlarm = useCallback(() => {
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const playTone = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };
      for (let i = 0; i < 8; i++) {
        playTone(880, i * 0.3, 0.15);
        playTone(660, i * 0.3 + 0.15, 0.15);
      }
    } catch (e) {
      console.error('Audio error:', e);
    }
  }, []);

  // Vibrate device
  const vibrateDevice = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate([300, 100, 300, 100, 500, 100, 300, 100, 300]);
    }
  }, []);

  // Generate alert message
  const generateMessage = useCallback(() => {
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    let msg = `🚨 SOS EMERGENCY ALERT\n\nI may need help.\nName: ${userName}\n`;
    if (location) {
      msg += `\n📍 My current location:\n${location.mapsUrl}\n`;
    }
    msg += `\n🕐 Time: ${timestamp}\n\nSent from MediFusion safety system.`;
    return msg;
  }, [userName, location]);

  // Long press handlers
  const startLongPress = () => {
    setIsLongPressing(true);
    longPressStartRef.current = Date.now();
    
    longPressRef.current = setInterval(() => {
      const elapsed = Date.now() - longPressStartRef.current;
      const progress = Math.min((elapsed / LONG_PRESS_DURATION) * 100, 100);
      setLongPressProgress(progress);
      
      if (elapsed >= LONG_PRESS_DURATION) {
        endLongPress();
        openConfirmDialog();
      }
    }, 50);
  };

  const endLongPress = () => {
    setIsLongPressing(false);
    setLongPressProgress(0);
    if (longPressRef.current) {
      clearInterval(longPressRef.current);
      longPressRef.current = null;
    }
  };

  // Open confirmation dialog
  const openConfirmDialog = () => {
    setShowConfirm(true);
    setCountdown(COUNTDOWN_SECONDS);
    setTriggered(false);
    setAlertSent(false);
    setIsTriggering(false);
    getLocation();
  };

  // Start SOS countdown
  const startCountdown = () => {
    setIsTriggering(true);
    setCountdown(COUNTDOWN_SECONDS);
  };

  // Cancel SOS
  const cancelSOS = () => {
    setIsTriggering(false);
    setShowConfirm(false);
    setCountdown(COUNTDOWN_SECONDS);
    setTriggered(false);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
  };

  // Countdown effect
  useEffect(() => {
    if (!isTriggering || !showConfirm) return;

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          triggerSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isTriggering, showConfirm]);

  // Helper to open URLs
  const openExternal = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Format phone for WhatsApp
  const formatWhatsAppPhone = (phone: string): string => {
    const clean = phone.replace(/[^0-9+]/g, '');
    if (clean.startsWith('+')) return clean.slice(1);
    if (clean.startsWith('0')) return '91' + clean.slice(1);
    if (clean.length === 10) return '91' + clean;
    return clean;
  };

  // Trigger SOS
  const triggerSOS = async () => {
    if (alertSent) return;
    setAlertSent(true);
    setIsTriggering(false);
    setTriggered(true);
    playAlarm();
    vibrateDevice();

    const message = generateMessage();

    if (preferences?.send_to_contacts && contacts.length > 0) {
      const phones = contacts.map(c => c.phone_number).join(',');
      openExternal(`sms:${phones}?body=${encodeURIComponent(message)}`);

      contacts.forEach((c, i) => {
        setTimeout(() => {
          const waPhone = formatWhatsAppPhone(c.phone_number);
          openExternal(`https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`);
        }, 1500 + i * 1200);
      });
    }

    toast({
      title: '🚨 SOS Alert Triggered',
      description: `SMS & WhatsApp opened for ${contacts.length} contact(s).`,
    });
  };

  // Send WhatsApp to a specific contact
  const sendWhatsApp = (phone: string) => {
    const message = generateMessage();
    const waPhone = formatWhatsAppPhone(phone);
    openExternal(`https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`);
  };

  // Progress for countdown ring
  const progress = ((COUNTDOWN_SECONDS - countdown) / COUNTDOWN_SECONDS) * 100;

  return (
    <>
      {/* Header SOS Button */}
      <div className={cn("relative", className)}>
        <motion.button
          onMouseDown={startLongPress}
          onMouseUp={endLongPress}
          onMouseLeave={endLongPress}
          onTouchStart={startLongPress}
          onTouchEnd={endLongPress}
          onClick={openConfirmDialog}
          className={cn(
            "relative flex items-center justify-center rounded-full transition-all duration-200",
            "bg-destructive/10 hover:bg-destructive/20 text-destructive",
            "h-9 w-9 lg:h-10 lg:w-10",
            "focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2",
            isLongPressing && "scale-110"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="SOS Emergency Button - Hold for 2 seconds or tap to open"
        >
          {/* Long press progress ring */}
          {isLongPressing && (
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20" cy="20" r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-destructive/30"
              />
              <circle
                cx="20" cy="20" r="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-destructive transition-all"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - longPressProgress / 100)}`}
                strokeLinecap="round"
              />
            </svg>
          )}
          <ShieldAlert className="h-5 w-5 lg:h-5 lg:w-5" />
        </motion.button>
        
        {/* Tooltip */}
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden lg:block">
          SOS Emergency
        </span>
      </div>

      {/* Emergency Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={(open) => !open && cancelSOS()}>
        <DialogContent className="max-w-md border-destructive/30 p-0 gap-0">
          {/* Header */}
          <DialogHeader className="bg-destructive/10 border-b border-destructive/20 px-6 py-4">
            <DialogTitle className="flex items-center justify-center gap-2 text-destructive">
              <Siren className="h-5 w-5" />
              Are you in an emergency?
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5">
            <AnimatePresence mode="wait">
              {!isTriggering && !triggered ? (
                // Initial confirmation screen
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  <p className="text-center text-sm text-muted-foreground">
                    Choose an action below. This will alert your emergency contacts and may dial emergency services.
                  </p>

                  {/* Location Status */}
                  <div className="flex items-center justify-center gap-2 text-sm">
                    {locating ? (
                      <><Loader2 className="h-4 w-4 animate-spin text-primary" /> Getting location...</>
                    ) : location ? (
                      <><MapPin className="h-4 w-4 text-green-500" /> Location acquired</>
                    ) : (
                      <><MapPin className="h-4 w-4 text-muted-foreground" /> Location unavailable</>
                    )}
                  </div>

                  {/* Quick action buttons */}
                  <div className="space-y-3">
                    {preferences?.send_to_emergency_services && (
                      <Button
                        asChild
                        className="w-full bg-red-600 hover:bg-red-700 text-white gap-2 h-12"
                      >
                        <a href="tel:108">
                          <Phone className="h-5 w-5" />
                          Call Emergency Services (108)
                        </a>
                      </Button>
                    )}
                    
                    <Button
                      onClick={startCountdown}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2 h-12"
                      disabled={!preferences?.send_to_contacts || contacts.length === 0}
                    >
                      <Siren className="h-5 w-5" />
                      Send SOS Alert to Contacts
                    </Button>

                    <Button
                      onClick={cancelSOS}
                      variant="outline"
                      className="w-full h-12"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Cancel
                    </Button>
                  </div>

                  {/* Recipients summary */}
                  {preferences?.send_to_contacts && contacts.length > 0 && (
                    <div className="rounded-lg bg-muted/50 p-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{contacts.length} emergency contact{contacts.length > 1 ? 's' : ''} will be notified</span>
                      </div>
                    </div>
                  )}

                  {(!preferences?.send_to_contacts || contacts.length === 0) && (
                    <p className="text-xs text-center text-muted-foreground">
                      No emergency contacts configured. Go to Profile → SOS Settings.
                    </p>
                  )}
                </motion.div>
              ) : !triggered ? (
                // Countdown screen
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Countdown Ring */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative flex h-28 w-28 items-center justify-center">
                      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 112 112">
                        <circle cx="56" cy="56" r="50" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
                        <circle
                          cx="56" cy="56" r="50" fill="none"
                          stroke="currentColor" strokeWidth="4"
                          className="text-destructive transition-all duration-1000"
                          strokeDasharray={`${2 * Math.PI * 50}`}
                          strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-4xl font-bold text-destructive">{countdown}</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Sending alert in <strong>{countdown}</strong> seconds
                    </p>
                  </div>

                  {/* Warning */}
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-center">
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Alert will be sent via SMS & WhatsApp to your emergency contacts.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={triggerSOS}
                      className="bg-red-600 hover:bg-red-700 text-white gap-2 h-11"
                    >
                      <Siren className="h-4 w-4" />
                      Send Now
                    </Button>
                    <Button
                      onClick={cancelSOS}
                      variant="outline"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-2 h-11"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : (
                // Triggered/Success screen
                <motion.div
                  key="triggered"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-5"
                >
                  {/* Success Confirmation */}
                  <div className="text-center space-y-2">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                      <Check className="h-7 w-7 text-destructive" />
                    </div>
                    <h3 className="text-lg font-bold text-destructive">SOS Alert Sent!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your emergency alert has been triggered.
                    </p>
                  </div>

                  {/* Location */}
                  {location && (
                    <div className="rounded-lg bg-muted/50 p-3 text-sm">
                      <a
                        href={location.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary underline"
                      >
                        <MapPin className="h-4 w-4" />
                        View your location on Google Maps
                      </a>
                    </div>
                  )}

                  {/* Emergency call buttons */}
                  {preferences?.send_to_emergency_services && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">📞 Call Emergency Services:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button asChild size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs">
                          <a href="tel:108">🚑 Ambulance 108</a>
                        </Button>
                        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                          <a href="tel:100">🛡️ Police 100</a>
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Contact list */}
                  {preferences?.send_to_contacts && contacts.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Your Contacts:</p>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {contacts.map((c) => (
                          <div key={c.id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                            <span className="text-sm truncate">{c.contact_name}</span>
                            <div className="flex gap-1.5">
                              <Button asChild size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <a href={`tel:${c.phone_number}`}>
                                  <Phone className="h-3.5 w-3.5 text-primary" />
                                </a>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 w-7 p-0"
                                onClick={() => sendWhatsApp(c.phone_number)}
                              >
                                <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button onClick={cancelSOS} variant="outline" className="w-full">
                    Close
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
