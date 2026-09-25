import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Phone, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Profile } from '@/hooks/useProfile';

const formSchema = z.object({
  emergency_contact_name: z.string().max(100).optional().nullable(),
  emergency_contact_phone: z.string().max(20).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface EmergencyContactFormProps {
  profile: Profile | null;
  onSubmit: (data: Partial<Profile>) => Promise<boolean | undefined>;
  isOnboarding?: boolean;
}

export function EmergencyContactForm({ profile, onSubmit, isOnboarding }: EmergencyContactFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emergency_contact_name: profile?.emergency_contact_name || '',
      emergency_contact_phone: profile?.emergency_contact_phone || '',
    },
  });

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values);
  };

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
          <p className="text-sm text-warning-foreground">
            <strong>Important:</strong> This information may be displayed during detected health emergencies.
          </p>
        </div>

        <FormField
          control={form.control}
          name="emergency_contact_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                Contact Name
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="John Doe"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Name of your emergency contact person
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emergency_contact_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Phone Number
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Phone number to call in case of emergency
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-gradient-health">
          {isOnboarding ? 'Complete Setup' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );

  if (isOnboarding) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Emergency Contact
        </CardTitle>
        <CardDescription>Who should we contact in case of emergency?</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
