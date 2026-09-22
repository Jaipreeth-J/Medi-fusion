/**
 * SMART EMERGENCY ACTION CARD
 * Context-aware emergency response UI with interactive action buttons.
 * Fully responsive — buttons stack vertically on small screens.
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Siren,
  Hospital,
  Shield,
  HeartPulse,
  Loader2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useSOS } from '@/hooks/useSOS';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export type EmergencyType = 'medical' | 'safety' | 'mental_health';

interface SmartEmergencyCardProps {
  type?: EmergencyType;
  riskSummary?: string;
}

export function SmartEmergencyCard({
  type = 'medical',
  riskSummary,
}: SmartEmergencyCardProps) {
  const [locationShared, setLocationShared] = useState(false);
  const [locating, setLocating] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const { contacts } = useSOS();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'User';

  const handleShareLocation = useCallback(() => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast({ title: 'Location unavailable', description: 'Your device does not support geolocation.', variant: 'destructive' });
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const url = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
        navigator.clipboard.writeText(url).then(() => {
          toast({ title: '📍 Location copied', description: 'Google Maps link copied to clipboard. You can now share it.' });
        }).catch(() => {
          toast({ title: 'Location found', description: url });
        });
        setLocationShared(true);
        setLocating(false);
        // Reset after 3s so button is reusable
        setTimeout(() => setLocationShared(false), 3000);
      },
      () => {
        toast({ title: 'Location error', description: 'Could not get your location. Check permissions.', variant: 'destructive' });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [toast, userName]);

  const handleActivateSOS = useCallback(() => {
    if (contacts.length === 0) {
      toast({ title: 'No contacts', description: 'Add emergency contacts in Profile → SOS Settings first.', variant: 'destructive' });
      return;
    }
    setSosTriggered(true);
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const message = `🚨 SOS EMERGENCY ALERT\n\nI need help urgently.\nName: ${userName}\n🕐 Time: ${timestamp}\n\nSent from MediFusion Health App.`;
    const phones = contacts.map(c => c.phone_number).join(',');
    window.open(`sms:${phones}?body=${encodeURIComponent(message)}`, '_blank');
    toast({ title: '🚨 SOS Activated', description: `Alert sent to ${contacts.length} contact(s).` });
  }, [contacts, userName, toast]);

  const handleNearbyHospitals = useCallback(() => {
    if (!navigator.geolocation) {
      window.open('https://maps.google.com/maps?q=hospitals+near+me', '_blank');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.open(`https://maps.google.com/maps?q=hospitals+near+${pos.coords.latitude},${pos.coords.longitude}`, '_blank');
      },
      () => {
        window.open('https://maps.google.com/maps?q=hospitals+near+me', '_blank');
      },
      { timeout: 5000 }
    );
  }, []);

  const primaryActions: Record<EmergencyType, { label: string; phone: string; icon: React.ReactNode; color: string }> = {
    medical: { label: 'Ambulance (108)', phone: '108', icon: <Siren className="h-4 w-4 shrink-0" />, color: 'bg-red-600 hover:bg-red-700 text-white' },
    safety: { label: 'Police (100)', phone: '100', icon: <Shield className="h-4 w-4 shrink-0" />, color: 'bg-blue-600 hover:bg-blue-700 text-white' },
    mental_health: { label: 'Helpline', phone: '9152987821', icon: <HeartPulse className="h-4 w-4 shrink-0" />, color: 'bg-violet-600 hover:bg-violet-700 text-white' },
  };

  const primary = primaryActions[type];

  const secondaryNumbers: Record<EmergencyType, Array<{ label: string; phone: string; icon: React.ReactNode }>> = {
    medical: [
      { label: 'Ambulance 102', phone: '102', icon: <Phone className="h-3.5 w-3.5 shrink-0" /> },
      { label: 'Police 100', phone: '100', icon: <Shield className="h-3.5 w-3.5 shrink-0" /> },
    ],
    mental_health: [
      { label: 'Vandrevala Foundation', phone: '18602662345', icon: <Phone className="h-3.5 w-3.5 shrink-0" /> },
      { label: 'Ambulance 108', phone: '108', icon: <Siren className="h-3.5 w-3.5 shrink-0" /> },
    ],
    safety: [
      { label: 'Women Helpline', phone: '1091', icon: <Phone className="h-3.5 w-3.5 shrink-0" /> },
      { label: 'Ambulance 108', phone: '108', icon: <Siren className="h-3.5 w-3.5 shrink-0" /> },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="chat-emergency-card rounded-xl border border-destructive/30 bg-destructive/5 p-3 space-y-2.5 w-full min-w-0 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/15">
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-destructive leading-tight">🚨 Critical Health Alert</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug break-words">
            {riskSummary || 'Potentially dangerous symptoms detected. Take immediate action.'}
          </p>
        </div>
      </div>

      {/* Action Buttons — 2-col grid always */}
      <div className="grid grid-cols-2 gap-1.5">
        <Button
          asChild
          className={`gap-1.5 ${primary.color} w-full min-h-[40px] px-2`}
          size="sm"
        >
          <a href={`tel:${primary.phone}`} className="flex items-center justify-center text-center">
            {primary.icon}
            <span className="text-[11px] font-medium truncate">{primary.label}</span>
          </a>
        </Button>

        <Button
          onClick={handleActivateSOS}
          variant={sosTriggered ? 'secondary' : 'outline'}
          size="sm"
          className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive hover:text-white w-full min-h-[40px] px-2"
          disabled={sosTriggered}
        >
          {sosTriggered ? <Check className="h-4 w-4 shrink-0" /> : <Siren className="h-4 w-4 shrink-0" />}
          <span className="text-[11px] font-medium truncate">{sosTriggered ? 'SOS Sent' : 'Activate SOS'}</span>
        </Button>

        <Button
          onClick={handleShareLocation}
          variant={locationShared ? 'secondary' : 'outline'}
          size="sm"
          className="gap-1.5 w-full min-h-[40px] px-2"
          disabled={locating}
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : locationShared ? <Check className="h-4 w-4 text-primary shrink-0" /> : <MapPin className="h-4 w-4 shrink-0" />}
          <span className="text-[11px] font-medium truncate">{locationShared ? 'Shared' : 'Share Location'}</span>
        </Button>

        <Button
          onClick={handleNearbyHospitals}
          variant="outline"
          size="sm"
          className="gap-1.5 w-full min-h-[40px] px-2"
        >
          <Hospital className="h-4 w-4 shrink-0" />
          <span className="text-[11px] font-medium truncate">Hospitals</span>
        </Button>
      </div>

      {/* Secondary actions */}
      <div className="grid grid-cols-2 gap-1">
        {secondaryNumbers[type].map((item) => (
          <Button
            key={item.phone}
            asChild
            variant="ghost"
            size="sm"
            className="w-full text-[11px] gap-1 text-muted-foreground min-h-[36px] justify-center px-1"
          >
            <a href={`tel:${item.phone}`} className="flex items-center">
              {item.icon}
              <span className="truncate">{item.label}</span>
            </a>
          </Button>
        ))}
      </div>
    </motion.div>
  );
}
