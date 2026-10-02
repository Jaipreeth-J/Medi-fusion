-- Migration: Secure Wearable Tokens
-- Purpose: Move access_token and refresh_token away from client-readable wearable_connections
--          into a dedicated, service-role-only wearable_tokens table.

-- 1. Create secure wearable_tokens table
CREATE TABLE IF NOT EXISTS public.wearable_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  connection_id UUID NOT NULL REFERENCES public.wearable_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT wearable_tokens_connection_id_key UNIQUE (connection_id)
);

-- 2. Migrate existing tokens if any exist in wearable_connections
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'wearable_connections' 
      AND column_name = 'access_token'
  ) THEN
    INSERT INTO public.wearable_tokens (connection_id, user_id, access_token, refresh_token, created_at, updated_at)
    SELECT id, user_id, access_token, refresh_token, created_at, updated_at
    FROM public.wearable_connections
    WHERE access_token IS NOT NULL OR refresh_token IS NOT NULL
    ON CONFLICT (connection_id) DO UPDATE SET
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      updated_at = EXCLUDED.updated_at;

    -- Drop token columns from the client-queryable wearable_connections table
    ALTER TABLE public.wearable_connections DROP COLUMN IF EXISTS access_token;
    ALTER TABLE public.wearable_connections DROP COLUMN IF EXISTS refresh_token;
  END IF;
END $$;

-- 3. Enable Row Level Security (RLS) on wearable_tokens
ALTER TABLE public.wearable_tokens ENABLE ROW LEVEL SECURITY;

-- 4. Do NOT create any policies for authenticated or anon roles.
-- Explicitly revoke permissions from anon and authenticated roles so client tokens cannot access it.
REVOKE ALL ON public.wearable_tokens FROM anon, authenticated;

-- 5. Create trigger for updated_at on wearable_tokens
DROP TRIGGER IF EXISTS update_wearable_tokens_updated_at ON public.wearable_tokens;
CREATE TRIGGER update_wearable_tokens_updated_at
  BEFORE UPDATE ON public.wearable_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
