import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Profile } from '@/hooks/useProfile';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

const currentYear = new Date().getFullYear();

const formSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  dob_day: z.string().optional().nullable(),
  dob_month: z.string().optional().nullable(),
  dob_year: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  height_cm: z.coerce.number().min(50).max(300).optional().nullable(),
  weight_kg: z.coerce.number().min(10).max(500).optional().nullable(),
  blood_type: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface PersonalInfoFormProps {
  profile: Profile | null;
  onSubmit: (data: Partial<Profile>) => Promise<boolean | undefined>;
  isOnboarding?: boolean;
}

function parseDOB(dob: string | null): { day: string; month: string; year: string } {
  if (!dob) return { day: '', month: '', year: '' };
  const d = new Date(dob);
  if (isNaN(d.getTime())) return { day: '', month: '', year: '' };
  return {
    day: String(d.getDate()),
    month: String(d.getMonth() + 1),
    year: String(d.getFullYear()),
  };
}

export function PersonalInfoForm({ profile, onSubmit, isOnboarding }: PersonalInfoFormProps) {
  const dobParts = parseDOB(profile?.date_of_birth || null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      dob_day: dobParts.day || null,
      dob_month: dobParts.month || null,
      dob_year: dobParts.year || null,
      gender: profile?.gender || null,
      height_cm: profile?.height_cm ? Number(profile.height_cm) : null,
      weight_kg: profile?.weight_kg ? Number(profile.weight_kg) : null,
      blood_type: profile?.blood_type || null,
    },
  });

  const watchMonth = form.watch('dob_month');
  const watchYear = form.watch('dob_year');

  const maxDays = watchMonth && watchYear
    ? getDaysInMonth(Number(watchMonth), Number(watchYear))
    : 31;

  const handleSubmit = async (values: FormValues) => {
    let dateOfBirth: string | null = null;
    if (values.dob_day && values.dob_month && values.dob_year) {
      const d = new Date(
        Number(values.dob_year),
        Number(values.dob_month) - 1,
        Number(values.dob_day)
      );
      if (!isNaN(d.getTime()) && d <= new Date()) {
        dateOfBirth = format(d, 'yyyy-MM-dd');
      }
    }

    await onSubmit({
      full_name: values.full_name,
      date_of_birth: dateOfBirth,
      gender: values.gender,
      height_cm: values.height_cm,
      weight_kg: values.weight_kg,
      blood_type: values.blood_type,
    });
  };

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date of Birth — Day / Month / Year dropdowns */}
        <div className="space-y-2">
          <FormLabel>Date of Birth</FormLabel>
          <div className="grid grid-cols-3 gap-2">
            <FormField
              control={form.control}
              name="dob_day"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob_month"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {MONTHS.map((m, i) => (
                        <SelectItem key={m} value={String(i + 1)}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob_year"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i).map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {GENDERS.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="height_cm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height (cm)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="175"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="weight_kg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="70"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="blood_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BLOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full bg-gradient-health">
          {isOnboarding ? 'Continue' : 'Save Changes'}
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
          <User className="h-5 w-5 text-primary" />
          Personal Information
        </CardTitle>
        <CardDescription>Your basic profile information</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
