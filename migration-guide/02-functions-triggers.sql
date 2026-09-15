-- ============================================================
-- Database Functions & Triggers
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON public.medications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON public.emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wearable_connections_updated_at BEFORE UPDATE ON public.wearable_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sos_preferences_updated_at BEFORE UPDATE ON public.sos_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_push_subscriptions_updated_at BEFORE UPDATE ON public.push_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_user_id uuid,
    p_function_name text,
    p_max_requests integer DEFAULT 10,
    p_window_seconds integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_window_start timestamptz;
    v_current_count int;
BEGIN
    v_window_start := date_trunc('minute', now());
    IF p_window_seconds != 60 THEN
        v_window_start := to_timestamp(
            floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
        );
    END IF;

    INSERT INTO public.rate_limits (user_id, function_name, window_start, request_count)
    VALUES (p_user_id, p_function_name, v_window_start, 1)
    ON CONFLICT (user_id, function_name, window_start)
    DO UPDATE SET request_count = rate_limits.request_count + 1
    RETURNING request_count INTO v_current_count;

    IF random() < 0.01 THEN
        DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 hour';
    END IF;

    RETURN v_current_count <= p_max_requests;
END;
$$;
