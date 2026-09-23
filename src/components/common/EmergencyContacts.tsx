/**
 * INDIAN EMERGENCY CONTACTS COMPONENT
 * One-tap call buttons for Indian emergency services
 */

import { Phone, Siren, Shield, Flame, Heart, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface EmergencyContact {
  name: string;
  number: string;
  icon: React.ReactNode;
  color: string;
}

export const INDIA_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { name: 'Ambulance', number: '108', icon: <Siren className="h-4 w-4" />, color: 'bg-red-600 hover:bg-red-700 text-white' },
  { name: 'Ambulance', number: '102', icon: <Siren className="h-4 w-4" />, color: 'bg-red-500 hover:bg-red-600 text-white' },
  { name: 'Police', number: '100', icon: <Shield className="h-4 w-4" />, color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { name: 'Fire', number: '101', icon: <Flame className="h-4 w-4" />, color: 'bg-orange-600 hover:bg-orange-700 text-white' },
  { name: 'Women Helpline', number: '1091', icon: <Heart className="h-4 w-4" />, color: 'bg-pink-600 hover:bg-pink-700 text-white' },
  { name: 'Mental Health', number: '9152987821', icon: <Brain className="h-4 w-4" />, color: 'bg-purple-600 hover:bg-purple-700 text-white' },
];

interface EmergencyContactButtonProps {
  contact: EmergencyContact;
  compact?: boolean;
}

export function EmergencyContactButton({ contact, compact = false }: EmergencyContactButtonProps) {
  return (
    <Button
      asChild
      size={compact ? 'sm' : 'default'}
      className={`${contact.color} gap-2 ${compact ? 'text-xs px-2 py-1 h-auto' : ''}`}
    >
      <a href={`tel:${contact.number}`}>
        {contact.icon}
        {compact ? contact.number : `${contact.name} – ${contact.number}`}
      </a>
    </Button>
  );
}

interface EmergencyContactsGridProps {
  compact?: boolean;
  title?: string;
  showCard?: boolean;
}

export function EmergencyContactsGrid({ compact = false, title = '🚨 Emergency Contacts (India)', showCard = true }: EmergencyContactsGridProps) {
  const content = (
    <div className={`grid ${compact ? 'grid-cols-3 gap-1.5' : 'grid-cols-2 gap-2'}`}>
      {INDIA_EMERGENCY_CONTACTS.map((contact) => (
        <EmergencyContactButton
          key={contact.number}
          contact={contact}
          compact={compact}
        />
      ))}
    </div>
  );

  if (!showCard) return content;

  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
          <Phone className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        {content}
      </CardContent>
    </Card>
  );
}
