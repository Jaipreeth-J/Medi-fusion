-- =============================================
-- MEDIFUSION DATABASE SCHEMA
-- A comprehensive health assistant application
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USER PROFILES TABLE
-- Stores user health profile information
-- =============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    blood_type TEXT CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown')),
    medical_conditions TEXT[], -- Array of known conditions
    allergies TEXT[], -- Array of allergies
    medications TEXT[], -- Current medications
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 2. VITALS TRACKING TABLE
-- Records vital signs over time
-- =============================================
CREATE TABLE public.vitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    heart_rate INTEGER CHECK (heart_rate > 0 AND heart_rate < 300),
    blood_pressure_systolic INTEGER CHECK (blood_pressure_systolic > 0 AND blood_pressure_systolic < 300),
    blood_pressure_diastolic INTEGER CHECK (blood_pressure_diastolic > 0 AND blood_pressure_diastolic < 200),
    blood_sugar NUMERIC(5,1), -- mg/dL
    spo2 INTEGER CHECK (spo2 >= 0 AND spo2 <= 100),
    weight_kg NUMERIC(5,2),
    temperature_celsius NUMERIC(4,1),
    sleep_hours NUMERIC(4,2),
    activity_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 3. SYMPTOMS TRACKING TABLE
-- Records symptoms with severity and duration
-- =============================================
CREATE TABLE public.symptoms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symptom_name TEXT NOT NULL,
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
    duration_hours INTEGER,
    frequency TEXT CHECK (frequency IN ('once', 'occasionally', 'frequently', 'constantly')),
    body_location TEXT,
    description TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 4. MENTAL HEALTH / MOOD TRACKING TABLE
-- Daily mood and mental wellness tracking
-- =============================================
CREATE TABLE public.mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    anxiety_level INTEGER CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
    journal_entry TEXT,
    gratitude_notes TEXT[],
    activities TEXT[], -- What activities user did that day
    triggers TEXT[], -- What triggered mood changes
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 5. CHAT CONVERSATIONS TABLE
-- Stores AI health chat conversations
-- =============================================
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT DEFAULT 'New Conversation',
    summary TEXT,
    is_emergency BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 6. CHAT MESSAGES TABLE
-- Individual messages in conversations
-- =============================================
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    is_emergency_response BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 7. MEDICAL IMAGES TABLE
-- Stores references to uploaded medical images
-- =============================================
CREATE TABLE public.medical_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes INTEGER,
    image_type TEXT CHECK (image_type IN ('xray', 'mri', 'ct_scan', 'lab_report', 'prescription', 'other')),
    body_part TEXT,
    description TEXT,
    ai_summary TEXT,
    analyzed_at TIMESTAMPTZ,
    linked_conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 8. HEALTH INSIGHTS TABLE
-- AI-generated periodic health summaries
-- =============================================
CREATE TABLE public.health_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('daily', 'weekly', 'monthly', 'alert')),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    recommendations TEXT[],
    data_sources TEXT[], -- Which data was analyzed
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX idx_vitals_user_recorded ON public.vitals(user_id, recorded_at DESC);
CREATE INDEX idx_symptoms_user ON public.symptoms(user_id, started_at DESC);
CREATE INDEX idx_mood_user_recorded ON public.mood_entries(user_id, recorded_at DESC);
CREATE INDEX idx_conversations_user ON public.conversations(user_id, updated_at DESC);
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id, created_at);
CREATE INDEX idx_medical_images_user ON public.medical_images(user_id, created_at DESC);
CREATE INDEX idx_health_insights_user ON public.health_insights(user_id, created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- Users can only access their own data
-- =============================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Vitals RLS
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vitals" ON public.vitals
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own vitals" ON public.vitals
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own vitals" ON public.vitals
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete own vitals" ON public.vitals
    FOR DELETE USING (auth.uid() = user_id);

-- Symptoms RLS
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptoms" ON public.symptoms
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own symptoms" ON public.symptoms
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own symptoms" ON public.symptoms
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete own symptoms" ON public.symptoms
    FOR DELETE USING (auth.uid() = user_id);

-- Mood Entries RLS
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mood entries" ON public.mood_entries
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own mood entries" ON public.mood_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own mood entries" ON public.mood_entries
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete own mood entries" ON public.mood_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Conversations RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own conversations" ON public.conversations
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete own conversations" ON public.conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Chat Messages RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages" ON public.chat_messages
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Medical Images RLS
ALTER TABLE public.medical_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own medical images" ON public.medical_images
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own medical images" ON public.medical_images
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update own medical images" ON public.medical_images
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete own medical images" ON public.medical_images
    FOR DELETE USING (auth.uid() = user_id);

-- Health Insights RLS
ALTER TABLE public.health_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health insights" ON public.health_insights
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert own health insights" ON public.health_insights
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- TRIGGERS for updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- STORAGE BUCKET for medical images
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-images', 'medical-images', false);

-- Storage policies for medical images
CREATE POLICY "Users can view own medical images storage"
ON storage.objects FOR SELECT
USING (bucket_id = 'medical-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own medical images storage"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'medical-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own medical images storage"
ON storage.objects FOR DELETE
USING (bucket_id = 'medical-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();