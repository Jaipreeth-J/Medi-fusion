import { useRef, useState } from 'react';
import { format, differenceInYears } from 'date-fns';
import { User, Camera, Mail, Calendar, Ruler, Scale, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/hooks/useProfile';

interface ProfileHeaderProps {
  profile: Profile | null;
  onAvatarUpdated?: (url: string) => void;
}

export function ProfileHeader({ profile, onAvatarUpdated }: ProfileHeaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.slice(0, 2).toUpperCase() || 'U';
  };

  const getAge = () => {
    if (!profile?.date_of_birth) return null;
    return differenceInYears(new Date(), new Date(profile.date_of_birth));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a JPG, PNG, or WebP image.', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload an image under 5MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${user.id}/avatar.${ext}`;

      // Upload to storage (upsert to replace existing)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`; // cache bust

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onAvatarUpdated?.(avatarUrl);
      toast({ title: 'Avatar updated', description: 'Your profile photo has been changed.' });
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast({ title: 'Upload failed', description: 'Could not upload your photo. Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const age = getAge();

  return (
    <Card className="overflow-hidden">
      <div className="h-16 sm:h-24 bg-gradient-health" />
      <CardContent className="relative pt-0 pb-3 px-3 sm:pb-4 sm:px-6">
        <div className="-mt-8 sm:-mt-12 flex flex-col items-center gap-2 sm:flex-row sm:items-end sm:gap-6">
          <div className="relative shrink-0">
            <Avatar className="h-16 w-16 sm:h-24 sm:w-24 border-[3px] sm:border-4 border-background shadow-lg">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-health text-lg sm:text-2xl font-bold text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              size="icon"
              variant="secondary"
              className="absolute -bottom-1 -right-1 h-6 w-6 sm:h-8 sm:w-8 rounded-full shadow-md"
              onClick={handleAvatarClick}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              ) : (
                <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left sm:pb-1">
            <h2 className="text-lg sm:text-2xl font-bold truncate">
              {profile?.full_name || 'Welcome!'}
            </h2>
            <p className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-muted-foreground sm:justify-start truncate">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{user?.email}</span>
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-1 sm:justify-end sm:pb-2 sm:gap-2">
            {age && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {age} yrs
              </Badge>
            )}
            {profile?.blood_type && (
              <Badge variant="outline" className="gap-1 border-destructive text-destructive text-xs">
                🩸 {profile.blood_type}
              </Badge>
            )}
            {profile?.height_cm != null && profile.height_cm > 0 && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Ruler className="h-3 w-3" />
                {profile.height_cm}cm
              </Badge>
            )}
            {profile?.weight_kg != null && profile.weight_kg > 0 && (
              <Badge variant="secondary" className="gap-1 text-xs">
                <Scale className="h-3 w-3" />
                {profile.weight_kg}kg
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
