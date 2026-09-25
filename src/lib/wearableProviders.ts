/**
 * WEARABLE PROVIDERS CONFIGURATION
 * Modular configuration for all supported wearable platforms
 * Add new providers here to extend support
 */

export type WearableProvider = 
  | 'google_fit'
  | 'fitbit'
  | 'garmin'
  | 'health_connect'
  | 'apple_health';

export interface ProviderConfig {
  id: WearableProvider;
  name: string;
  icon: string;
  description: string;
  color: string;
  supportedDataTypes: DataType[];
  oauthScopes: string[];
  authUrl: string;
  tokenUrl: string;
  apiBaseUrl: string;
  /** Platforms where this provider is available */
  platforms: ('web' | 'android' | 'ios')[];
  /** Whether this provider uses native SDK instead of OAuth */
  isNative: boolean;
}

export type DataType = 
  | 'heart_rate'
  | 'spo2'
  | 'steps'
  | 'calories'
  | 'sleep'
  | 'stress'
  | 'blood_pressure'
  | 'weight'
  | 'temperature';

export const DATA_TYPE_LABELS: Record<DataType, string> = {
  heart_rate: 'Heart Rate',
  spo2: 'Blood Oxygen (SpO2)',
  steps: 'Steps',
  calories: 'Calories Burned',
  sleep: 'Sleep',
  stress: 'Stress Level',
  blood_pressure: 'Blood Pressure',
  weight: 'Weight',
  temperature: 'Body Temperature',
};

export const DATA_TYPE_UNITS: Record<DataType, string> = {
  heart_rate: 'bpm',
  spo2: '%',
  steps: 'steps',
  calories: 'kcal',
  sleep: 'hrs',
  stress: 'level',
  blood_pressure: 'mmHg',
  weight: 'kg',
  temperature: '°C',
};

export const WEARABLE_PROVIDERS: ProviderConfig[] = [
  {
    id: 'google_fit',
    name: 'Google Fit',
    icon: '🏃',
    description: 'Sync with Google Fit, Amazfit, Wear OS watches',
    color: 'hsl(var(--success))',
    supportedDataTypes: ['heart_rate', 'spo2', 'steps', 'calories', 'sleep', 'weight'],
    oauthScopes: [
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.oxygen_saturation.read',
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.sleep.read',
      'https://www.googleapis.com/auth/fitness.body.read',
    ],
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    apiBaseUrl: 'https://www.googleapis.com/fitness/v1/users/me',
    platforms: ['web', 'android'],
    isNative: false,
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    icon: '💪',
    description: 'Sync with Fitbit watches and trackers',
    color: 'hsl(142 76% 36%)',
    supportedDataTypes: ['heart_rate', 'spo2', 'steps', 'calories', 'sleep', 'stress', 'weight'],
    oauthScopes: [
      'heartrate',
      'oxygen_saturation',
      'activity',
      'sleep',
      'weight',
    ],
    authUrl: 'https://www.fitbit.com/oauth2/authorize',
    tokenUrl: 'https://api.fitbit.com/oauth2/token',
    apiBaseUrl: 'https://api.fitbit.com/1/user/-',
    platforms: ['web', 'android', 'ios'],
    isNative: false,
  },
  {
    id: 'garmin',
    name: 'Garmin',
    icon: '⌚',
    description: 'Sync with Garmin watches and devices',
    color: 'hsl(210 100% 45%)',
    supportedDataTypes: ['heart_rate', 'spo2', 'steps', 'calories', 'sleep', 'stress'],
    oauthScopes: [],
    authUrl: 'https://connect.garmin.com/oauthConfirm',
    tokenUrl: 'https://connectapi.garmin.com/oauth-service/oauth/access_token',
    apiBaseUrl: 'https://apis.garmin.com/wellness-api/rest',
    platforms: ['web', 'android', 'ios'],
    isNative: false,
  },
  {
    id: 'health_connect',
    name: 'Health Connect',
    icon: '❤️',
    description: 'Android Health Connect (Samsung, Pixel, Amazfit)',
    color: 'hsl(340 82% 52%)',
    supportedDataTypes: ['heart_rate', 'spo2', 'steps', 'calories', 'sleep', 'blood_pressure', 'weight', 'temperature'],
    oauthScopes: [],
    authUrl: '',
    tokenUrl: '',
    apiBaseUrl: '',
    platforms: ['android'],
    isNative: true,
  },
  {
    id: 'apple_health',
    name: 'Apple Watch',
    icon: '🍎',
    description: 'Sync with Apple Watch via HealthKit',
    color: 'hsl(0 0% 20%)',
    supportedDataTypes: ['heart_rate', 'spo2', 'steps', 'calories', 'sleep', 'blood_pressure', 'weight', 'temperature'],
    oauthScopes: [],
    authUrl: '',
    tokenUrl: '',
    apiBaseUrl: '',
    platforms: ['ios'],
    isNative: true,
  },
];

/** Detect current platform */
export function getCurrentPlatform(): 'web' | 'android' | 'ios' {
  const ua = navigator.userAgent.toLowerCase();
  // Check for Capacitor native
  if ((window as any).Capacitor?.isNativePlatform?.()) {
    return (window as any).Capacitor.getPlatform?.() === 'ios' ? 'ios' : 'android';
  }
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'web';
}

/** Get providers available on current platform */
export function getAvailableProviders(): ProviderConfig[] {
  const platform = getCurrentPlatform();
  return WEARABLE_PROVIDERS.filter(p => p.platforms.includes(platform));
}

export function getProviderById(id: WearableProvider): ProviderConfig | undefined {
  return WEARABLE_PROVIDERS.find(p => p.id === id);
}

export function getProviderName(id: WearableProvider): string {
  return getProviderById(id)?.name ?? id;
}
