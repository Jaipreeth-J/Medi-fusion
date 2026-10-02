-- ============================================================
-- MediFusion Full Database Schema for External Supabase Project
-- Run this in your Supabase SQL Editor (in order)
-- ============================================================

-- 1. PROFILES
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    full_name text,
    gender text,
    date_of_birth date,
    blood_type text,
    height_cm numeric,
    weight_kg numeric,
    medical_conditions text[],
    allergies text[],
    medications text[],
    emergency_contact_name text,
    emergency_contact_phone text,
    avatar_url text,
    onboarding_completed boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. MEDICATIONS
CREATE TABLE public.medications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    medication_name text NOT NULL,
    dosage text NOT NULL,
    dosage_unit text NOT NULL DEFAULT 'mg',
    frequency text NOT NULL,
    times_per_day integer NOT NULL DEFAULT 1,
    schedule_times text[] DEFAULT '{}'::text[],
    instructions text,
    purpose text,
    prescribing_doctor text,
    pharmacy text,
    start_date date NOT NULL DEFAULT CURRENT_DATE,
    end_date date,
    is_active boolean NOT NULL DEFAULT true,
    quantity_remaining integer,
    refill_reminder_days integer DEFAULT 7,
    last_taken_at timestamptz,
    last_notified_times jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. MEDICATION_LOGS
CREATE TABLE public.medication_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    medication_id uuid NOT NULL REFERENCES public.medications(id),
    taken_at timestamptz NOT NULL DEFAULT now(),
    scheduled_time text,
    status text NOT NULL DEFAULT 'taken',
    notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. VITALS
CREATE TABLE public.vitals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    heart_rate integer,
    blood_pressure_systolic integer,
    blood_pressure_diastolic integer,
    blood_sugar numeric,
    spo2 integer,
    weight_kg numeric,
    temperature_celsius numeric,
    sleep_hours numeric,
    activity_minutes integer,
    notes text,
    device_name text,
    device_type text,
    source_app text,
    health_platform text,
    sync_timestamp timestamptz,
    sync_source_chain jsonb,
    recorded_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. SYMPTOMS
CREATE TABLE public.symptoms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    symptom_name text NOT NULL,
    severity integer NOT NULL,
    frequency text,
    body_location text,
    description text,
    duration_hours integer,
    started_at timestamptz NOT NULL DEFAULT now(),
    resolved_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. MOOD_ENTRIES
CREATE TABLE public.mood_entries (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    mood_score integer NOT NULL,
    stress_level integer,
    anxiety_level integer,
    energy_level integer,
    sleep_quality integer,
    journal_entry text,
    gratitude_notes text[],
    activities text[],
    triggers text[],
    recorded_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. CONVERSATIONS
CREATE TABLE public.conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text DEFAULT 'New Conversation',
    summary text,
    is_emergency boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. CHAT_MESSAGES
CREATE TABLE public.chat_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid NOT NULL REFERENCES public.conversations(id),
    user_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    is_emergency_response boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. EMERGENCY_CONTACTS
CREATE TABLE public.emergency_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    contact_name text NOT NULL,
    phone_number text NOT NULL,
    relationship text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 10. MEDICAL_IMAGES
CREATE TABLE public.medical_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_type text NOT NULL,
    file_size_bytes integer,
    image_type text,
    body_part text,
    description text,
    ai_summary text,
    analyzed_at timestamptz,
    linked_conversation_id uuid REFERENCES public.conversations(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 11. DRUG_INTERACTIONS
CREATE TABLE public.drug_interactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    medication_ids text[] NOT NULL,
    interaction_summary text NOT NULL,
    severity text NOT NULL,
    recommendations text[],
    analyzed_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 12. HEALTH_INSIGHTS
CREATE TABLE public.health_insights (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    insight_type text NOT NULL,
    title text NOT NULL,
    summary text NOT NULL,
    recommendations text[],
    data_sources text[],
    period_start timestamptz,
    period_end timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 13. WEARABLE_CONNECTIONS (Client-facing connection metadata, no sensitive tokens)
CREATE TABLE public.wearable_connections (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    provider text NOT NULL,
    provider_user_id text,
    token_expires_at timestamptz,
    scopes text[],
    device_info jsonb,
    is_active boolean NOT NULL DEFAULT true,
    last_sync_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 13b. WEARABLE_TOKENS (Secure, backend service-role only; never client accessible)
CREATE TABLE public.wearable_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id uuid NOT NULL REFERENCES public.wearable_connections(id) ON DELETE CASCADE UNIQUE,
    user_id uuid NOT NULL,
    access_token text,
    refresh_token text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 14. WEARABLE_SYNC_LOGS
CREATE TABLE public.wearable_sync_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    connection_id uuid REFERENCES public.wearable_connections(id),
    sync_type text NOT NULL DEFAULT 'manual',
    status text NOT NULL DEFAULT 'pending',
    data_types text[],
    records_synced integer DEFAULT 0,
    error_message text,
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 15. PUSH_SUBSCRIPTIONS
CREATE TABLE public.push_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    endpoint text NOT NULL,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 16. SOS_PREFERENCES
CREATE TABLE public.sos_preferences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    send_to_emergency_services boolean NOT NULL DEFAULT true,
    send_to_contacts boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 17. RATE_LIMITS
CREATE TABLE public.rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    function_name text NOT NULL,
    window_start timestamptz NOT NULL DEFAULT now(),
    request_count integer NOT NULL DEFAULT 1,
    UNIQUE (user_id, function_name, window_start)
);
