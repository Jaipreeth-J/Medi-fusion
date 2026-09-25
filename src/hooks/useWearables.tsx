/**
 * WEARABLES HOOK
 * Manages wearable device connections, OAuth, and data syncing
 * Includes token refresh, error handling, timeout protection, and Health Connect native reads
 */

import { useState, useCallback, useEffect } from 'react';
import { isRateLimited } from '@/lib/rateLimitHandler';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { WearableProvider, DataType, getProviderById } from '@/lib/wearableProviders';
import {
  isHealthConnectAvailable,
  requestHealthConnectPermissions,
  readHealthConnectData,
} from '@/lib/healthConnect';

export interface WearableConnection {
  id: string;
  user_id: string;
  provider: WearableProvider;
  provider_user_id: string | null;
  device_info: Record<string, unknown> | null;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WearableSyncLog {
  id: string;
  user_id: string;
  connection_id: string;
  sync_type: 'manual' | 'automatic' | 'background';
  status: 'pending' | 'success' | 'failed' | 'partial';
  data_types: DataType[];
  records_synced: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface SyncedVitals {
  heart_rate?: number;
  spo2?: number;
  steps?: number;
  calories?: number;
  sleep_hours?: number;
  stress_level?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  weight_kg?: number;
  temperature_celsius?: number;
  recorded_at: string;
  source: WearableProvider;
  device_name?: string | null;
  device_type?: string | null;
  source_app?: string | null;
  health_platform?: string | null;
  sync_source_chain?: { chain: string[] } | null;
}

const SYNC_TIMEOUT = 30000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Sync timed out. Please try again.')), ms)
    ),
  ]);
}

export function useWearables() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [latestVitals, setLatestVitals] = useState<SyncedVitals | null>(null);

  // Load latest vitals from DB on mount
  useEffect(() => {
    if (!user?.id) return;
    supabase.from('vitals')
      .select('*')
      .eq('user_id', user.id)
      .not('health_platform', 'is', null)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          const v = data[0];
          setLatestVitals({
            heart_rate: v.heart_rate ?? undefined,
            spo2: v.spo2 ?? undefined,
            sleep_hours: v.sleep_hours ?? undefined,
            weight_kg: v.weight_kg ? Number(v.weight_kg) : undefined,
            temperature_celsius: v.temperature_celsius ? Number(v.temperature_celsius) : undefined,
            blood_pressure_systolic: v.blood_pressure_systolic ?? undefined,
            blood_pressure_diastolic: v.blood_pressure_diastolic ?? undefined,
            recorded_at: v.recorded_at,
            source: (v.health_platform?.toLowerCase().replace(/\s/g, '_') || 'google_fit') as WearableProvider,
            device_name: v.device_name,
            device_type: v.device_type,
            source_app: v.source_app,
            health_platform: v.health_platform,
            sync_source_chain: v.sync_source_chain as { chain: string[] } | null,
          });
        }
      });
  }, [user?.id]);

  const { data: connections = [], isLoading: connectionsLoading, error: connectionsError } = useQuery({
    queryKey: ['wearable-connections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('wearable_connections').select('id, user_id, provider, provider_user_id, token_expires_at, device_info, is_active, last_sync_at, created_at, updated_at, scopes')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data as WearableConnection[];
    },
    enabled: !!user?.id,
  });

  const { data: syncLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['wearable-sync-logs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('wearable_sync_logs').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      return data as WearableSyncLog[];
    },
    enabled: !!user?.id,
  });

  const connectWearable = useMutation({
    mutationFn: async (provider: WearableProvider) => {
      if (!user?.id) throw new Error('Not authenticated');

      const providerConfig = getProviderById(provider);

      if (providerConfig?.isNative) {
        // For Health Connect, request permissions first
        if (provider === 'health_connect') {
          const available = await isHealthConnectAvailable();
          if (!available) {
            throw new Error('Health Connect is not available on this device. Please install the Health Connect app from Google Play.');
          }
          const granted = await requestHealthConnectPermissions();
          if (!granted) {
            throw new Error('Health Connect permissions were not granted. Please allow access to sync health data.');
          }
        }

        const { data, error } = await supabase
          .from('wearable_connections')
          .upsert({
            user_id: user.id,
            provider,
            is_active: true,
            device_info: { platform: providerConfig.platforms[0], type: provider },
          }, { onConflict: 'user_id,provider' })
          .select().single();
        if (error) throw error;
        return data;
      }

      const { data, error } = await supabase.functions.invoke('wearable-oauth', {
        body: {
          provider,
          action: 'initiate',
          redirect_uri: `${window.location.origin}/wearables/callback`,
        },
      });
      if (error) {
        if (isRateLimited({ error })) return null;
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.authUrl) {
        sessionStorage.setItem('wearable_oauth_provider', provider);
        window.location.href = data.authUrl;
        return null;
      }
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['wearable-connections'] });
        toast.success('Wearable connected successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to connect wearable');
      console.error('Connect wearable error:', error);
    },
  });

  const disconnectWearable = useMutation({
    mutationFn: async (connectionId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('wearable_connections').delete()
        .eq('id', connectionId).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wearable-connections'] });
      toast.success('Wearable disconnected');
    },
    onError: () => toast.error('Failed to disconnect wearable'),
  });

  const syncWearable = useMutation({
    mutationFn: async ({
      connectionId, dataTypes, symptoms, nativeVitals, nativeDeviceInfo,
    }: {
      connectionId: string;
      dataTypes: DataType[];
      symptoms?: string;
      nativeVitals?: Record<string, any>;
      nativeDeviceInfo?: Record<string, any>;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // For Health Connect, read data natively first
      let vitalsToSync = nativeVitals;
      let deviceInfoToSync = nativeDeviceInfo;
      
      const connection = connections.find(c => c.id === connectionId);
      if (connection?.provider === 'health_connect' && !nativeVitals) {
        const hcData = await readHealthConnectData();
        vitalsToSync = hcData.vitals;
        deviceInfoToSync = hcData.deviceInfo;
      }
      
      const syncPromise = supabase.functions.invoke('wearable-sync', {
        body: {
          connectionId,
          dataTypes,
          symptoms,
          nativeVitals: vitalsToSync,
          nativeDeviceInfo: deviceInfoToSync,
        },
      });

      const { data, error } = await withTimeout(syncPromise, SYNC_TIMEOUT);
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data as { vitals: SyncedVitals; recordsSynced: number; isDuplicate?: boolean };
    },
    onSuccess: (data) => {
      // Immediately update local state so UI reflects new data
      if (data.vitals) {
        setLatestVitals(data.vitals);
      }
      // Then invalidate queries to refresh from DB
      queryClient.invalidateQueries({ queryKey: ['wearable-connections'] });
      queryClient.invalidateQueries({ queryKey: ['wearable-sync-logs'] });
      queryClient.invalidateQueries({ queryKey: ['vitals'] });
      if (data.isDuplicate) {
        toast.info('Data already synced — no duplicate records created');
      } else {
        toast.success(`Synced ${data.recordsSynced} records successfully`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sync wearable data');
      console.error('Sync error:', error);
    },
  });

  const handleOAuthCallback = useMutation({
    mutationFn: async ({ code, state }: { code: string; state: string }) => {
      const provider = sessionStorage.getItem('wearable_oauth_provider') as WearableProvider;
      if (!provider) throw new Error('No provider found in session');
      const { data, error } = await supabase.functions.invoke('wearable-oauth', {
        body: {
          provider, action: 'callback', code, state,
          redirect_uri: `${window.location.origin}/wearables/callback`,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      sessionStorage.removeItem('wearable_oauth_provider');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wearable-connections'] });
      toast.success('Wearable connected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'OAuth authentication failed');
    },
  });

  const activeConnections = connections.filter(c => c.is_active);

  const isProviderConnected = (provider: WearableProvider): boolean =>
    connections.some(c => c.provider === provider && c.is_active);

  const getConnectionByProvider = useCallback((provider: WearableProvider): WearableConnection | undefined =>
    connections.find(c => c.provider === provider), [connections]);

  return {
    connections, activeConnections, syncLogs, latestVitals,
    isLoading: connectionsLoading || logsLoading,
    connectionsError,
    connectWearable, disconnectWearable, syncWearable, handleOAuthCallback,
    isProviderConnected, getConnectionByProvider,
  };
}
