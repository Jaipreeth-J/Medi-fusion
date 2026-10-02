-- ============================================================
-- Row Level Security Policies
-- ============================================================

-- Helper: enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_preferences ENABLE ROW LEVEL SECURITY;

-- ==================== PROFILES ====================
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- ==================== MEDICATIONS ====================
CREATE POLICY "Users can view own medications" ON public.medications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medications" ON public.medications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medications" ON public.medications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medications" ON public.medications FOR DELETE USING (auth.uid() = user_id);

-- ==================== MEDICATION_LOGS ====================
CREATE POLICY "Users can view own medication logs" ON public.medication_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medication logs" ON public.medication_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medication logs" ON public.medication_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medication logs" ON public.medication_logs FOR DELETE USING (auth.uid() = user_id);

-- ==================== VITALS ====================
CREATE POLICY "Users can view own vitals" ON public.vitals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vitals" ON public.vitals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vitals" ON public.vitals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vitals" ON public.vitals FOR DELETE USING (auth.uid() = user_id);

-- ==================== SYMPTOMS ====================
CREATE POLICY "Users can view own symptoms" ON public.symptoms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own symptoms" ON public.symptoms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own symptoms" ON public.symptoms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own symptoms" ON public.symptoms FOR DELETE USING (auth.uid() = user_id);

-- ==================== MOOD_ENTRIES ====================
CREATE POLICY "Users can view own mood entries" ON public.mood_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own mood entries" ON public.mood_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own mood entries" ON public.mood_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own mood entries" ON public.mood_entries FOR DELETE USING (auth.uid() = user_id);

-- ==================== CONVERSATIONS ====================
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- ==================== CHAT_MESSAGES ====================
CREATE POLICY "Users can view own chat messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own chat messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- ==================== EMERGENCY_CONTACTS ====================
CREATE POLICY "Users can view own emergency contacts" ON public.emergency_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emergency contacts" ON public.emergency_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own emergency contacts" ON public.emergency_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own emergency contacts" ON public.emergency_contacts FOR DELETE USING (auth.uid() = user_id);

-- ==================== MEDICAL_IMAGES ====================
CREATE POLICY "Users can view own medical images" ON public.medical_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medical images" ON public.medical_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own medical images" ON public.medical_images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own medical images" ON public.medical_images FOR DELETE USING (auth.uid() = user_id);

-- ==================== DRUG_INTERACTIONS ====================
CREATE POLICY "Users can view own drug interactions" ON public.drug_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own drug interactions" ON public.drug_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own drug interactions" ON public.drug_interactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own drug interactions" ON public.drug_interactions FOR DELETE USING (auth.uid() = user_id);

-- ==================== HEALTH_INSIGHTS ====================
CREATE POLICY "Users can view own health insights" ON public.health_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health insights" ON public.health_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health insights" ON public.health_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own health insights" ON public.health_insights FOR DELETE USING (auth.uid() = user_id);

-- ==================== WEARABLE_CONNECTIONS ====================
CREATE POLICY "Users can view own wearable connections" ON public.wearable_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wearable connections" ON public.wearable_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wearable connections" ON public.wearable_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wearable connections" ON public.wearable_connections FOR DELETE USING (auth.uid() = user_id);

-- ==================== WEARABLE_TOKENS ====================
-- Sensitive OAuth tokens are restricted exclusively to backend service_role
ALTER TABLE public.wearable_tokens ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.wearable_tokens FROM anon, authenticated;
-- No client policies created: all client reads/writes are denied by default

-- ==================== WEARABLE_SYNC_LOGS ====================
CREATE POLICY "Users can view own sync logs" ON public.wearable_sync_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sync logs" ON public.wearable_sync_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sync logs" ON public.wearable_sync_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sync logs" ON public.wearable_sync_logs FOR DELETE USING (auth.uid() = user_id);

-- ==================== PUSH_SUBSCRIPTIONS ====================
CREATE POLICY "Users can view own push subscriptions" ON public.push_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own push subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own push subscriptions" ON public.push_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own push subscriptions" ON public.push_subscriptions FOR DELETE USING (auth.uid() = user_id);

-- ==================== SOS_PREFERENCES ====================
CREATE POLICY "Users can view own SOS preferences" ON public.sos_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own SOS preferences" ON public.sos_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own SOS preferences" ON public.sos_preferences FOR UPDATE USING (auth.uid() = user_id);

-- ==================== STORAGE ====================
-- Create buckets in Supabase Dashboard > Storage:
-- 1. "medical-images" (private)
-- 2. "avatars" (public)
