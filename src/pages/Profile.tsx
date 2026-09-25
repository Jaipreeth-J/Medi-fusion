import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Pill, Stethoscope, User } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { PersonalInfoForm } from '@/components/profile/PersonalInfoForm';
import { MedicalHistoryForm } from '@/components/profile/MedicalHistoryForm';
import { EmergencyContactForm } from '@/components/profile/EmergencyContactForm';
import { OnboardingDialog } from '@/components/profile/OnboardingDialog';
import { SOSSettingsCard } from '@/components/sos/SOSSettingsCard';
import { PushNotificationSettings } from '@/components/notifications/PushNotificationSettings';
import { LinkedAccountsCard } from '@/components/profile/LinkedAccountsCard';
import { useProfile } from '@/hooks/useProfile';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Profile() {
  const { profile, loading, updateProfile, completeOnboarding, skipOnboarding, refetch } = useProfile();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && profile && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [loading, profile]);

  const handleOnboardingComplete = async (data: Parameters<typeof completeOnboarding>[0]) => {
    const success = await completeOnboarding(data);
    if (success) {
      setShowOnboarding(false);
    }
    return success;
  };

  const handleSkipOnboarding = async () => {
    await skipOnboarding();
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-full min-h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <OnboardingDialog
        open={showOnboarding}
        profile={profile}
        onComplete={handleOnboardingComplete}
        onSkip={handleSkipOnboarding}
      />

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ProfileHeader profile={profile} onAvatarUpdated={() => refetch()} />
          </motion.div>

          {/* Profile incomplete reminder */}
          {profile && !profile.full_name && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="flex items-center gap-3 py-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Complete your profile</p>
                    <p className="text-xs text-muted-foreground">
                      Fill in your details for better health insights and personalized recommendations.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Summary Cards */}
          {profile && ((profile.medical_conditions?.length ?? 0) > 0 || (profile.allergies?.length ?? 0) > 0 || (profile.medications?.length ?? 0) > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Health Summary
                  </CardTitle>
                  <CardDescription>
                    Quick overview of your medical information
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-3">
                  {/* Medical Conditions */}
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Stethoscope className="h-4 w-4 text-primary" />
                      Conditions
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {profile.medical_conditions?.length ? (
                        profile.medical_conditions.map((condition, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {condition}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">None listed</span>
                      )}
                    </div>
                  </div>

                  {/* Allergies */}
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      Allergies
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {profile.allergies?.length ? (
                        profile.allergies.map((allergy, i) => (
                          <Badge key={i} variant="outline" className="border-warning text-xs text-warning">
                            {allergy}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">None listed</span>
                      )}
                    </div>
                  </div>

                  {/* Medications */}
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Pill className="h-4 w-4 text-info" />
                      Medications
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {profile.medications?.length ? (
                        profile.medications.map((medication, i) => (
                          <Badge key={i} variant="outline" className="border-info text-xs text-info">
                            {medication}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">None listed</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Forms Grid */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <PersonalInfoForm profile={profile} onSubmit={updateProfile} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <EmergencyContactForm profile={profile} onSubmit={updateProfile} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <PushNotificationSettings />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <LinkedAccountsCard />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <MedicalHistoryForm profile={profile} onSubmit={updateProfile} />
          </motion.div>

          {/* SOS Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <SOSSettingsCard />
          </motion.div>

          {/* Privacy Notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/20">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Your Privacy Matters</p>
                  <p className="text-sm text-muted-foreground">
                    All your health data is encrypted and stored securely. We never share your personal
                    information with third parties without your explicit consent.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
