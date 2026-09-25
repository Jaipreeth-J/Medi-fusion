import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, User, Stethoscope, Phone, ChevronRight, ChevronLeft, Sparkles, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { PersonalInfoForm } from './PersonalInfoForm';
import { MedicalHistoryForm } from './MedicalHistoryForm';
import { EmergencyContactForm } from './EmergencyContactForm';
import type { Profile, ProfileUpdate } from '@/hooks/useProfile';

interface OnboardingDialogProps {
  open: boolean;
  profile: Profile | null;
  onComplete: (data: ProfileUpdate) => Promise<boolean>;
  onSkip?: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Medifusion',
    icon: Heart,
    description: 'Your AI-powered health companion',
  },
  {
    id: 'personal',
    title: 'Personal Information',
    icon: User,
    description: 'Help us personalize your experience',
  },
  {
    id: 'medical',
    title: 'Medical History',
    icon: Stethoscope,
    description: 'Share your health background',
  },
  {
    id: 'emergency',
    title: 'Emergency Contact',
    icon: Phone,
    description: 'Who should we contact if needed?',
  },
];

export function OnboardingDialog({ open, profile, onComplete, onSkip }: OnboardingDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ProfileUpdate>({});

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const step = STEPS[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  const handleStepSubmit = async (data: ProfileUpdate) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    if (currentStep === STEPS.length - 1) {
      await onComplete(updatedData);
    } else {
      handleNext();
    }
    return true;
  };

  const renderStepContent = () => {
    switch (step.id) {
      case 'welcome':
        return (
          <div className="space-y-6 py-4 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-health shadow-glow"
            >
              <Sparkles className="h-12 w-12 text-primary-foreground" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Your Health, Your Data, Your Control</h3>
              <p className="text-muted-foreground">
                Medifusion helps you track your health journey with AI-powered insights.
                Let's set up your profile in a few quick steps.
              </p>
            </div>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Personalized Experience</p>
                  <p className="text-sm text-muted-foreground">Tailored to your health profile</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                  <Stethoscope className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="font-medium">Smart Health Tracking</p>
                  <p className="text-sm text-muted-foreground">Vitals, symptoms, and mood</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-info/20">
                  <Heart className="h-4 w-4 text-info" />
                </div>
                <div>
                  <p className="font-medium">Privacy First</p>
                  <p className="text-sm text-muted-foreground">Your data stays secure</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Button onClick={handleNext} className="w-full bg-gradient-health">
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="w-full text-muted-foreground hover:text-foreground"
              >
                <SkipForward className="mr-2 h-4 w-4" />
                Skip for Now
              </Button>
            </div>
          </div>
        );

      case 'personal':
        return (
          <PersonalInfoForm
            profile={{ ...profile, ...formData } as Profile}
            onSubmit={handleStepSubmit}
            isOnboarding
          />
        );

      case 'medical':
        return (
          <MedicalHistoryForm
            profile={{ ...profile, ...formData } as Profile}
            onSubmit={handleStepSubmit}
            isOnboarding
          />
        );

      case 'emergency':
        return (
          <EmergencyContactForm
            profile={{ ...profile, ...formData } as Profile}
            onSubmit={handleStepSubmit}
            isOnboarding
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg [&>button]:hidden">
        <DialogHeader>
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {STEPS.length}
              </p>
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <SkipForward className="mr-1 h-3 w-3" />
                  Skip for Now
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-health">
              <Icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle>{step.title}</DialogTitle>
              <DialogDescription>{step.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {currentStep > 0 && currentStep < STEPS.length - 1 && (
          <Button variant="ghost" onClick={handleBack} className="mt-2">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
