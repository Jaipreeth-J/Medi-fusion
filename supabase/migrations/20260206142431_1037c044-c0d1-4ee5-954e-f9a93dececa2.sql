-- Create table for wearable device connections
CREATE TABLE public.wearable_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL, -- 'google_fit', 'fitbit', 'garmin', 'health_connect'
  provider_user_id TEXT, -- User ID from the provider
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scopes TEXT[],
  device_info JSONB, -- Device model, manufacturer, etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Create table for wearable sync history/logs
CREATE TABLE public.wearable_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  connection_id UUID REFERENCES public.wearable_connections(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'automatic', 'background'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed', 'partial'
  data_types TEXT[], -- ['heart_rate', 'spo2', 'steps', 'calories', 'sleep', 'stress']
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for wearable_connections
CREATE POLICY "Users can view own wearable connections"
  ON public.wearable_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wearable connections"
  ON public.wearable_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wearable connections"
  ON public.wearable_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wearable connections"
  ON public.wearable_connections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for wearable_sync_logs
CREATE POLICY "Users can view own sync logs"
  ON public.wearable_sync_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync logs"
  ON public.wearable_sync_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updating updated_at
CREATE TRIGGER update_wearable_connections_updated_at
  BEFORE UPDATE ON public.wearable_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();