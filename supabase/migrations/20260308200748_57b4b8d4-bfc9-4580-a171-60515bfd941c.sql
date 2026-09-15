
-- Rate limits table for tracking API usage per user per function
CREATE TABLE public.rate_limits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    function_name text NOT NULL,
    window_start timestamptz NOT NULL DEFAULT now(),
    request_count int NOT NULL DEFAULT 1,
    UNIQUE (user_id, function_name, window_start)
);

-- Index for fast lookups
CREATE INDEX idx_rate_limits_lookup ON public.rate_limits (user_id, function_name, window_start);

-- Auto-cleanup: delete records older than 1 hour
CREATE INDEX idx_rate_limits_cleanup ON public.rate_limits (window_start);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No direct client access - only via service role in edge functions
-- No RLS policies needed since we use service role key

-- Atomic rate limit check function
-- Returns true if request is allowed, false if rate limited
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_user_id uuid,
    p_function_name text,
    p_max_requests int DEFAULT 10,
    p_window_seconds int DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_window_start timestamptz;
    v_current_count int;
BEGIN
    -- Calculate the start of the current time window
    v_window_start := date_trunc('minute', now());
    
    -- If window is not 60 seconds, use a custom bucket
    IF p_window_seconds != 60 THEN
        v_window_start := to_timestamp(
            floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
        );
    END IF;
    
    -- Try to insert or increment atomically
    INSERT INTO public.rate_limits (user_id, function_name, window_start, request_count)
    VALUES (p_user_id, p_function_name, v_window_start, 1)
    ON CONFLICT (user_id, function_name, window_start)
    DO UPDATE SET request_count = rate_limits.request_count + 1
    RETURNING request_count INTO v_current_count;
    
    -- Clean up old entries (older than 1 hour) periodically
    IF random() < 0.01 THEN
        DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 hour';
    END IF;
    
    -- Return whether the request is within the limit
    RETURN v_current_count <= p_max_requests;
END;
$$;
