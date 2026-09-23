/**
 * SOS SETTINGS CARD
 * Manage emergency contacts and SOS preferences
 */

import { useState } from 'react';
import { Siren, Plus, Trash2, Pencil, Phone, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSOS } from '@/hooks/useSOS';

export function SOSSettingsCard() {
  const { allContacts, preferences, saving, addContact, updateContact, deleteContact, updatePreferences, loading } = useSOS();
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');

  const resetForm = () => {
    setName('');
    setPhone('');
    setRelationship('');
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!name.trim() || !phone.trim()) return;
    const result = await addContact(name, phone, relationship);
    if (result) {
      setAddOpen(false);
      resetForm();
    }
  };

  const handleEdit = (contact: typeof allContacts[0]) => {
    setEditingId(contact.id);
    setName(contact.contact_name);
    setPhone(contact.phone_number);
    setRelationship(contact.relationship || '');
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingId || !name.trim() || !phone.trim()) return;
    await updateContact(editingId, {
      contact_name: name.trim(),
      phone_number: phone.trim(),
      relationship: relationship.trim() || null,
    });
    setEditOpen(false);
    resetForm();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Siren className="h-5 w-5" />
          SOS Emergency Settings
        </CardTitle>
        <CardDescription>
          Configure who receives your SOS alerts and manage emergency contacts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preferences */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Alert Recipients</h4>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Siren className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Emergency Services</p>
                <p className="text-xs text-muted-foreground">Ambulance 108/102, Police 100</p>
              </div>
            </div>
            <Switch
              checked={preferences?.send_to_emergency_services ?? true}
              onCheckedChange={(v) => updatePreferences({ send_to_emergency_services: v })}
              disabled={saving}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Emergency Contacts</p>
                <p className="text-xs text-muted-foreground">Family & friends you add below</p>
              </div>
            </div>
            <Switch
              checked={preferences?.send_to_contacts ?? true}
              onCheckedChange={(v) => updatePreferences({ send_to_contacts: v })}
              disabled={saving}
            />
          </div>
        </div>

        {/* Emergency Contacts List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Emergency Contacts ({allContacts.length})</h4>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1">
                  <Plus className="h-4 w-4" /> Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Emergency Contact</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label htmlFor="contact-name">Name *</Label>
                    <Input
                      id="contact-name"
                      placeholder="e.g. Mom, Dr. Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-phone">Phone Number *</Label>
                    <Input
                      id="contact-phone"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1"
                      type="tel"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-rel">Relationship (optional)</Label>
                    <Input
                      id="contact-rel"
                      placeholder="e.g. Mother, Friend, Doctor"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd} disabled={!name.trim() || !phone.trim() || saving}>
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Add Contact
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {allContacts.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No emergency contacts added yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Add family or friends who should be alerted during SOS.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allContacts.map((contact) => (
                <div key={contact.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{contact.contact_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {contact.phone_number}
                        {contact.relationship && ` · ${contact.relationship}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(contact)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Contact</AlertDialogTitle>
                          <AlertDialogDescription>
                            Remove {contact.contact_name} from your emergency contacts?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteContact(contact.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Contact Dialog */}
        <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Emergency Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone Number *</Label>
                <Input id="edit-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" type="tel" />
              </div>
              <div>
                <Label htmlFor="edit-rel">Relationship (optional)</Label>
                <Input id="edit-rel" value={relationship} onChange={(e) => setRelationship(e.target.value)} className="mt-1" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => { setEditOpen(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={!name.trim() || !phone.trim() || saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
