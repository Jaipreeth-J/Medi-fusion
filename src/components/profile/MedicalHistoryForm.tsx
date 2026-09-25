import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Pill, AlertTriangle, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Profile } from '@/hooks/useProfile';

const formSchema = z.object({
  medical_conditions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  medications: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface MedicalHistoryFormProps {
  profile: Profile | null;
  onSubmit: (data: Partial<Profile>) => Promise<boolean | undefined>;
  isOnboarding?: boolean;
}

export function MedicalHistoryForm({ profile, onSubmit, isOnboarding }: MedicalHistoryFormProps) {
  const [conditionInput, setConditionInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');
  const [medicationInput, setMedicationInput] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medical_conditions: profile?.medical_conditions || [],
      allergies: profile?.allergies || [],
      medications: profile?.medications || [],
    },
  });

  const handleSubmit = async (values: FormValues) => {
    await onSubmit(values);
  };

  const addItem = (field: keyof FormValues, value: string, setter: (v: string) => void) => {
    if (!value.trim()) return;
    const current = form.getValues(field) || [];
    if (!current.includes(value.trim())) {
      form.setValue(field, [...current, value.trim()]);
    }
    setter('');
  };

  const removeItem = (field: keyof FormValues, index: number) => {
    const current = form.getValues(field) || [];
    form.setValue(field, current.filter((_, i) => i !== index));
  };

  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Medical Conditions */}
        <FormField
          control={form.control}
          name="medical_conditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-primary" />
                Medical Conditions
              </FormLabel>
              <FormDescription>
                Add any diagnosed conditions (e.g., diabetes, hypertension)
              </FormDescription>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="Type a condition..."
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('medical_conditions', conditionInput, setConditionInput);
                      }
                    }}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => addItem('medical_conditions', conditionInput, setConditionInput)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {field.value?.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="gap-1 pr-1">
                    {condition}
                    <button
                      type="button"
                      onClick={() => removeItem('medical_conditions', index)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </FormItem>
          )}
        />

        {/* Allergies */}
        <FormField
          control={form.control}
          name="allergies"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Allergies
              </FormLabel>
              <FormDescription>
                Add any known allergies (food, medication, environmental)
              </FormDescription>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="Type an allergy..."
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('allergies', allergyInput, setAllergyInput);
                      }
                    }}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => addItem('allergies', allergyInput, setAllergyInput)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {field.value?.map((allergy, index) => (
                  <Badge key={index} variant="outline" className="gap-1 border-warning pr-1 text-warning">
                    {allergy}
                    <button
                      type="button"
                      onClick={() => removeItem('allergies', index)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </FormItem>
          )}
        />

        {/* Medications */}
        <FormField
          control={form.control}
          name="medications"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-info" />
                Current Medications
              </FormLabel>
              <FormDescription>
                List medications you're currently taking
              </FormDescription>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    placeholder="Type a medication..."
                    value={medicationInput}
                    onChange={(e) => setMedicationInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addItem('medications', medicationInput, setMedicationInput);
                      }
                    }}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => addItem('medications', medicationInput, setMedicationInput)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {field.value?.map((medication, index) => (
                  <Badge key={index} variant="outline" className="gap-1 border-info pr-1 text-info">
                    {medication}
                    <button
                      type="button"
                      onClick={() => removeItem('medications', index)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </FormItem>
          )}
        />

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
          <Stethoscope className="h-5 w-5 text-primary" />
          Medical History
        </CardTitle>
        <CardDescription>Your health conditions, allergies, and medications</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
