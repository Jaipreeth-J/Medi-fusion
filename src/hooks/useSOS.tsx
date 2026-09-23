import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface EmergencyContact {
  id: string;
  user_id: string;
  contact_name: string;
  phone_number: string;
  relationship: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SOSPreferences {
  id: string;
  user_id: string;
  send_to_emergency_services: boolean;
  send_to_contacts: boolean;
}

export function useSOS() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [preferences, setPreferences] = useState<SOSPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [contactsRes, prefsRes] = await Promise.all([
        supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('sos_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (contactsRes.error) throw contactsRes.error;
      setContacts((contactsRes.data as unknown as EmergencyContact[]) || []);

      if (prefsRes.error) throw prefsRes.error;
      if (prefsRes.data) {
        setPreferences(prefsRes.data as unknown as SOSPreferences);
      } else {
        // Create default preferences
        const { data, error } = await supabase
          .from('sos_preferences')
          .insert({ user_id: user.id })
          .select()
          .single();
        if (!error && data) setPreferences(data as unknown as SOSPreferences);
      }
    } catch (e) {
      console.error('Error fetching SOS data:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addContact = async (name: string, phone: string, relationship?: string) => {
    if (!user) return null;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          contact_name: name.trim(),
          phone_number: phone.trim(),
          relationship: relationship?.trim() || null,
        })
        .select()
        .single();
      if (error) throw error;
      setContacts(prev => [...prev, data as unknown as EmergencyContact]);
      toast({ title: 'Contact added', description: `${name} has been added as an emergency contact.` });
      return data;
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to add contact.', variant: 'destructive' });
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateContact = async (id: string, updates: Partial<Pick<EmergencyContact, 'contact_name' | 'phone_number' | 'relationship' | 'is_active'>>) => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      toast({ title: 'Contact updated' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to update contact.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const deleteContact = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      setContacts(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Contact removed' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to remove contact.', variant: 'destructive' });
    }
  };

  const updatePreferences = async (updates: Partial<Pick<SOSPreferences, 'send_to_emergency_services' | 'send_to_contacts'>>) => {
    if (!user || !preferences) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sos_preferences')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      if (error) throw error;
      setPreferences(prev => prev ? { ...prev, ...updates } : prev);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to update preferences.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return {
    contacts: contacts.filter(c => c.is_active),
    allContacts: contacts,
    preferences,
    loading,
    saving,
    addContact,
    updateContact,
    deleteContact,
    updatePreferences,
    refetch: fetchData,
  };
}
