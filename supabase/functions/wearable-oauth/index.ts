/**
 * WEARABLE OAUTH EDGE FUNCTION
 * Handles OAuth initiation, callback, and token refresh for wearable providers
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface OAuthRequest {
  provider: string;
  action: 'initiate' | 'callback' | 'refresh';
  redirect_uri: string;
  code?: string;
  state?: string;
}

const PROVIDERS: Record<string, {
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  getClientId: () => string | undefined;
  getClientSecret: () => string | undefined;
}> = {
  google_fit: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: [
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.oxygen_saturation.read',
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.sleep.read',
      'https://www.googleapis.com/auth/fitness.body.read',
    ],
    getClientId: () => Deno.env.get('GOOGLE_FIT_CLIENT_ID'),
    getClientSecret: () => Deno.env.get('GOOGLE_FIT_CLIENT_SECRET'),
  },
  fitbit: {
    authUrl: 'https://www.fitbit.com/oauth2/authorize',
    tokenUrl: 'https://api.fitbit.com/oauth2/token',
    scopes: ['heartrate', 'oxygen_saturation', 'activity', 'sleep', 'weight'],
    getClientId: () => Deno.env.get('FITBIT_CLIENT_ID'),
    getClientSecret: () => Deno.env.get('FITBIT_CLIENT_SECRET'),
  },
  garmin: {
    authUrl: 'https://connect.garmin.com/oauthConfirm',
    tokenUrl: 'https://connectapi.garmin.com/oauth-service/oauth/access_token',
    scopes: [],
    getClientId: () => Deno.env.get('GARMIN_CONSUMER_KEY'),
    getClientSecret: () => Deno.env.get('GARMIN_CONSUMER_SECRET'),
  },
};

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function refreshAccessToken(
  provider: string,
  refreshToken: string,
  clientId: string,
  clientSecret: string,
  tokenUrl: string,
): Promise<{ access_token: string; expires_in?: number; refresh_token?: string } | null> {
  try {
    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(provider === 'fitbit' && {
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        }),
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });
    if (!res.ok) {
      console.error('Token refresh failed:', await res.text());
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error('Token refresh error:', e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization');

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || '' } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Rate limit check (20 req/min) ──
    const adminClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: allowed } = await adminClient.rpc('check_rate_limit', { p_user_id: user.id, p_function_name: 'wearable-oauth', p_max_requests: 20, p_window_seconds: 60 });
    if (allowed === false) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body: OAuthRequest = await req.json();
    const { provider, action, redirect_uri, code, state } = body;

    // Native providers don't use OAuth
    if (provider === 'health_connect' || provider === 'apple_health') {
      return new Response(
        JSON.stringify({ message: 'This provider uses native SDK. No OAuth required.', native: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const providerConfig = PROVIDERS[provider];
    if (!providerConfig) {
      return new Response(
        JSON.stringify({ error: 'Invalid provider' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientId = providerConfig.getClientId();
    const clientSecret = providerConfig.getClientSecret();

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify({ error: `${provider} credentials not configured. Please set up the API keys.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── TOKEN REFRESH ──
    if (action === 'refresh') {
      const { data: conn } = await supabase
        .from('wearable_connections').select('id, user_id, provider')
        .eq('user_id', user.id).eq('provider', provider).single();

      if (!conn) {
        return new Response(
          JSON.stringify({ error: 'Connection not found.' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Securely fetch refresh token using service role adminClient
      const { data: tokenRecord } = await adminClient
        .from('wearable_tokens')
        .select('refresh_token')
        .eq('connection_id', conn.id)
        .maybeSingle();

      if (!tokenRecord?.refresh_token) {
        return new Response(
          JSON.stringify({ error: 'No refresh token available. Please reconnect.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokens = await refreshAccessToken(provider, tokenRecord.refresh_token, clientId, clientSecret, providerConfig.tokenUrl);
      if (!tokens) {
        // Mark connection as inactive so user knows to reconnect
        await supabase.from('wearable_connections')
          .update({ is_active: false }).eq('id', conn.id);
        return new Response(
          JSON.stringify({ error: 'Token refresh failed. Please reconnect your account.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const expiresAt = tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null;

      // Update public connection metadata
      await supabase.from('wearable_connections').update({
        token_expires_at: expiresAt,
        is_active: true,
      }).eq('id', conn.id);

      // Securely store updated tokens in wearable_tokens table
      await adminClient.from('wearable_tokens').upsert({
        connection_id: conn.id,
        user_id: user.id,
        access_token: tokens.access_token,
        ...(tokens.refresh_token && { refresh_token: tokens.refresh_token }),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'connection_id' });

      // Return status only, never leak tokens to the client
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── INITIATE ──
    if (action === 'initiate') {
      const oauthState = generateState();

      await supabase.from('wearable_connections').upsert({
        user_id: user.id,
        provider,
        device_info: { oauth_state: oauthState, initiated_at: new Date().toISOString() },
        is_active: false,
      }, { onConflict: 'user_id,provider' });

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri,
        response_type: 'code',
        scope: providerConfig.scopes.join(' '),
        state: oauthState,
        access_type: 'offline',
        prompt: 'consent',
      });

      return new Response(
        JSON.stringify({ authUrl: `${providerConfig.authUrl}?${params.toString()}`, state: oauthState }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── CALLBACK ──
    if (action === 'callback') {
      if (!code || !state) {
        return new Response(
          JSON.stringify({ error: 'Authorization code and state are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // CSRF verification: check state matches what was stored during initiation
      const { data: conn } = await supabase
        .from('wearable_connections')
        .select('device_info')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .single();

      const storedState = (conn?.device_info as Record<string, unknown>)?.oauth_state;
      if (!storedState || storedState !== state) {
        return new Response(
          JSON.stringify({ error: 'Invalid OAuth state. Possible CSRF attack. Please try again.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokenResponse = await fetch(providerConfig.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(provider === 'fitbit' && {
            Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
          }),
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri,
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('Token exchange failed:', error);
        return new Response(
          JSON.stringify({ error: 'Token exchange failed. Please try again.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokens = await tokenResponse.json();
      const expiresAt = tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null;

      // Update connection metadata in wearable_connections (no sensitive tokens stored here)
      const { data, error } = await supabase
        .from('wearable_connections')
        .update({
          token_expires_at: expiresAt,
          provider_user_id: tokens.user_id || null,
          is_active: true,
          device_info: { connected_at: new Date().toISOString(), scope: tokens.scope },
        })
        .eq('user_id', user.id)
        .eq('provider', provider)
        .select('id, user_id, provider, provider_user_id, token_expires_at, device_info, is_active, created_at, updated_at')
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Failed to save connection' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Securely store access & refresh tokens in wearable_tokens via adminClient
      const { error: tokenError } = await adminClient.from('wearable_tokens').upsert({
        connection_id: data.id,
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'connection_id' });

      if (tokenError) {
        console.error('Failed to store wearable tokens securely:', tokenError);
      }

      return new Response(
        JSON.stringify({ success: true, connection: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('OAuth error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
