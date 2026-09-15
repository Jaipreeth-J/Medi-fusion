-- Create medications table for tracking user medications
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  dosage_unit TEXT NOT NULL DEFAULT 'mg',
  frequency TEXT NOT NULL,
  times_per_day INTEGER NOT NULL DEFAULT 1,
  schedule_times TEXT[] DEFAULT '{}',
  instructions TEXT,
  purpose TEXT,
  prescribing_doctor TEXT,
  pharmacy TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  refill_reminder_days INTEGER DEFAULT 7,
  quantity_remaining INTEGER,
  last_taken_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medication_logs table for tracking when medications are taken
CREATE TABLE public.medication_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  scheduled_time TEXT,
  status TEXT NOT NULL DEFAULT 'taken',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create drug_interactions table for caching AI-analyzed interactions
CREATE TABLE public.drug_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  medication_ids UUID[] NOT NULL,
  interaction_summary TEXT NOT NULL,
  severity TEXT NOT NULL,
  recommendations TEXT[],
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_interactions ENABLE ROW LEVEL SECURITY;

-- Medications policies
CREATE POLICY "Users can view own medications" 
ON public.medications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications" 
ON public.medications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications" 
ON public.medications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications" 
ON public.medications FOR DELETE 
USING (auth.uid() = user_id);

-- Medication logs policies
CREATE POLICY "Users can view own medication logs" 
ON public.medication_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medication logs" 
ON public.medication_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medication logs" 
ON public.medication_logs FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medication logs" 
ON public.medication_logs FOR DELETE 
USING (auth.uid() = user_id);

-- Drug interactions policies
CREATE POLICY "Users can view own drug interactions" 
ON public.drug_interactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drug interactions" 
ON public.drug_interactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own drug interactions" 
ON public.drug_interactions FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at on medications
CREATE TRIGGER update_medications_updated_at
BEFORE UPDATE ON public.medications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();