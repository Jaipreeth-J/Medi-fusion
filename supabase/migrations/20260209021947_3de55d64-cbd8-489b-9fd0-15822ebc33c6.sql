-- Add device source attribution columns to vitals table
ALTER TABLE public.vitals 
ADD COLUMN IF NOT EXISTS device_name text,
ADD COLUMN IF NOT EXISTS device_type text,
ADD COLUMN IF NOT EXISTS source_app text,
ADD COLUMN IF NOT EXISTS health_platform text,
ADD COLUMN IF NOT EXISTS sync_timestamp timestamp with time zone,
ADD COLUMN IF NOT EXISTS sync_source_chain jsonb;

-- Add index for deduplication queries (timestamp + metric hash + device)
CREATE INDEX IF NOT EXISTS idx_vitals_dedup 
ON public.vitals (user_id, recorded_at, device_name, health_platform);

-- Add comment for documentation
COMMENT ON COLUMN public.vitals.device_name IS 'Original device name (e.g., Amazfit GTR 2)';
COMMENT ON COLUMN public.vitals.device_type IS 'Device category: watch, band, phone, scale, etc.';
COMMENT ON COLUMN public.vitals.source_app IS 'App that collected data (e.g., Zepp, Fitbit)';
COMMENT ON COLUMN public.vitals.health_platform IS 'Health platform used for sync (e.g., Health Connect, Google Fit)';
COMMENT ON COLUMN public.vitals.sync_timestamp IS 'When the sync operation occurred';
COMMENT ON COLUMN public.vitals.sync_source_chain IS 'Full sync chain as JSON: {chain: ["Device", "App", "Platform", "MediFusion"]}';