/**
 * DEVICE NORMALIZATION UTILITIES
 * Normalizes device names and types across different platforms
 */

// Known device name mappings for normalization
const DEVICE_NAME_MAP: Record<string, string> = {
  // Amazfit devices
  'amazfit_gtr_2': 'Amazfit GTR 2',
  'amazfit_gtr_3': 'Amazfit GTR 3',
  'amazfit_gtr_4': 'Amazfit GTR 4',
  'amazfit_bip': 'Amazfit Bip',
  'amazfit_bip_u': 'Amazfit Bip U',
  'amazfit_gts': 'Amazfit GTS',
  'amazfit_gts_2': 'Amazfit GTS 2',
  'amazfit_gts_3': 'Amazfit GTS 3',
  'amazfit_gts_4': 'Amazfit GTS 4',
  'amazfit_t_rex': 'Amazfit T-Rex',
  'amazfit_t_rex_2': 'Amazfit T-Rex 2',
  'amazfit_balance': 'Amazfit Balance',
  
  // Samsung devices
  'galaxy_watch': 'Samsung Galaxy Watch',
  'galaxy_watch_4': 'Samsung Galaxy Watch 4',
  'galaxy_watch_5': 'Samsung Galaxy Watch 5',
  'galaxy_watch_6': 'Samsung Galaxy Watch 6',
  'galaxy_fit': 'Samsung Galaxy Fit',
  'galaxy_fit_2': 'Samsung Galaxy Fit 2',
  
  // Fitbit devices
  'fitbit_versa': 'Fitbit Versa',
  'fitbit_versa_2': 'Fitbit Versa 2',
  'fitbit_versa_3': 'Fitbit Versa 3',
  'fitbit_versa_4': 'Fitbit Versa 4',
  'fitbit_sense': 'Fitbit Sense',
  'fitbit_sense_2': 'Fitbit Sense 2',
  'fitbit_charge': 'Fitbit Charge',
  'fitbit_charge_5': 'Fitbit Charge 5',
  'fitbit_charge_6': 'Fitbit Charge 6',
  'fitbit_inspire': 'Fitbit Inspire',
  'fitbit_inspire_3': 'Fitbit Inspire 3',
  'fitbit_luxe': 'Fitbit Luxe',
  
  // Garmin devices
  'garmin_fenix': 'Garmin Fenix',
  'garmin_fenix_7': 'Garmin Fenix 7',
  'garmin_forerunner': 'Garmin Forerunner',
  'garmin_forerunner_255': 'Garmin Forerunner 255',
  'garmin_forerunner_265': 'Garmin Forerunner 265',
  'garmin_forerunner_955': 'Garmin Forerunner 955',
  'garmin_venu': 'Garmin Venu',
  'garmin_venu_2': 'Garmin Venu 2',
  'garmin_venu_3': 'Garmin Venu 3',
  'garmin_vivoactive': 'Garmin Vivoactive',
  'garmin_vivoactive_5': 'Garmin Vivoactive 5',
  'garmin_vivosmart': 'Garmin Vivosmart',
  
  // Google/Pixel devices
  'pixel_watch': 'Google Pixel Watch',
  'pixel_watch_2': 'Google Pixel Watch 2',
  
  // Xiaomi devices
  'mi_band': 'Xiaomi Mi Band',
  'mi_band_7': 'Xiaomi Mi Band 7',
  'mi_band_8': 'Xiaomi Mi Band 8',
  'xiaomi_watch': 'Xiaomi Watch',
  
  // Huawei devices
  'huawei_watch': 'Huawei Watch',
  'huawei_watch_gt': 'Huawei Watch GT',
  'huawei_watch_gt_3': 'Huawei Watch GT 3',
  'huawei_watch_gt_4': 'Huawei Watch GT 4',
  'huawei_band': 'Huawei Band',
  
  // Apple devices (though typically use HealthKit, not Health Connect)
  'apple_watch': 'Apple Watch',
};

// Device type detection patterns
const DEVICE_TYPE_PATTERNS: { pattern: RegExp; type: string }[] = [
  { pattern: /watch|venu|fenix|forerunner|vivoactive|sense|versa/i, type: 'watch' },
  { pattern: /band|fit|inspire|vivosmart|luxe|charge/i, type: 'band' },
  { pattern: /scale|weight/i, type: 'scale' },
  { pattern: /phone|pixel|galaxy|iphone/i, type: 'phone' },
  { pattern: /blood pressure|bp|sphygmo/i, type: 'blood_pressure_monitor' },
  { pattern: /thermo|temperature/i, type: 'thermometer' },
  { pattern: /glucose|cgm/i, type: 'glucose_monitor' },
];

// Source app name mappings
const SOURCE_APP_MAP: Record<string, string> = {
  'com.huami.watch.hmwatchmanager': 'Zepp',
  'com.huami.midong': 'Zepp Life',
  'com.zepp.android': 'Zepp',
  'com.google.android.apps.fitness': 'Google Fit',
  'com.fitbit.FitbitMobile': 'Fitbit',
  'com.garmin.android.apps.connectmobile': 'Garmin Connect',
  'com.samsung.android.wear.shealth': 'Samsung Health',
  'com.samsung.android.app.watchmanager': 'Galaxy Wearable',
  'com.xiaomi.wearable': 'Xiaomi Wear',
  'com.huawei.health': 'Huawei Health',
  'com.apple.Health': 'Apple Health',
};

// Health platform normalization
const HEALTH_PLATFORM_MAP: Record<string, string> = {
  'health_connect': 'Health Connect',
  'healthconnect': 'Health Connect',
  'google_fit': 'Google Fit',
  'googlefit': 'Google Fit',
  'fitbit': 'Fitbit',
  'garmin': 'Garmin Connect',
  'samsung_health': 'Samsung Health',
  'apple_health': 'Apple Health',
  'healthkit': 'Apple Health',
};

export interface NormalizedDeviceInfo {
  device_name: string | null;
  device_type: string | null;
  source_app: string | null;
  health_platform: string;
  sync_source_chain: { chain: string[] };
}

/**
 * Normalize a device name to a consistent format
 */
export function normalizeDeviceName(rawName: string | null | undefined): string | null {
  if (!rawName) return null;
  
  // Convert to lowercase and replace spaces/special chars with underscores for lookup
  const normalizedKey = rawName.toLowerCase().replace(/[\s-]+/g, '_');
  
  // Check direct mapping first
  if (DEVICE_NAME_MAP[normalizedKey]) {
    return DEVICE_NAME_MAP[normalizedKey];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(DEVICE_NAME_MAP)) {
    if (normalizedKey.includes(key) || key.includes(normalizedKey)) {
      return value;
    }
  }
  
  // If no mapping found, clean up the raw name
  return rawName
    .split(/[\s_-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Detect device type from device name
 */
export function detectDeviceType(deviceName: string | null | undefined): string | null {
  if (!deviceName) return null;
  
  for (const { pattern, type } of DEVICE_TYPE_PATTERNS) {
    if (pattern.test(deviceName)) {
      return type;
    }
  }
  
  return 'unknown';
}

/**
 * Normalize source app package name to friendly name
 */
export function normalizeSourceApp(rawApp: string | null | undefined): string | null {
  if (!rawApp) return null;
  
  // Check direct mapping
  if (SOURCE_APP_MAP[rawApp]) {
    return SOURCE_APP_MAP[rawApp];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(SOURCE_APP_MAP)) {
    if (rawApp.includes(key) || key.includes(rawApp)) {
      return value;
    }
  }
  
  // Extract app name from package name if no mapping found
  const parts = rawApp.split('.');
  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1];
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  }
  
  return rawApp;
}

/**
 * Normalize health platform name
 */
export function normalizeHealthPlatform(rawPlatform: string | null | undefined): string {
  if (!rawPlatform) return 'Unknown';
  
  const normalizedKey = rawPlatform.toLowerCase().replace(/[\s-]+/g, '_');
  
  return HEALTH_PLATFORM_MAP[normalizedKey] || rawPlatform;
}

/**
 * Build complete sync chain from device info
 */
export function buildSyncChain(info: {
  device_name?: string | null;
  source_app?: string | null;
  health_platform?: string | null;
}): string[] {
  const chain: string[] = [];
  
  if (info.device_name) {
    chain.push(info.device_name);
  }
  
  if (info.source_app && info.source_app !== info.device_name) {
    chain.push(info.source_app);
  }
  
  if (info.health_platform && info.health_platform !== info.source_app) {
    chain.push(info.health_platform);
  }
  
  chain.push('MediFusion');
  
  return chain;
}

/**
 * Process raw device metadata from API and normalize it
 */
export function normalizeDeviceMetadata(rawMetadata: {
  device_name?: string | null;
  device_type?: string | null;
  source_app?: string | null;
  health_platform?: string | null;
  data_source?: string | null;
}): NormalizedDeviceInfo {
  const device_name = normalizeDeviceName(rawMetadata.device_name);
  const device_type = rawMetadata.device_type || detectDeviceType(device_name || rawMetadata.device_name);
  const source_app = normalizeSourceApp(rawMetadata.source_app);
  const health_platform = normalizeHealthPlatform(rawMetadata.health_platform || rawMetadata.data_source);
  
  const sync_source_chain = {
    chain: buildSyncChain({ device_name, source_app, health_platform })
  };
  
  return {
    device_name,
    device_type,
    source_app,
    health_platform,
    sync_source_chain,
  };
}

/**
 * Check if two vital records are duplicates based on timestamp, device, and metrics
 */
export function isDuplicateVital(
  existing: { recorded_at: string; device_name: string | null; health_platform: string | null },
  incoming: { recorded_at: string; device_name: string | null; health_platform: string | null }
): boolean {
  // Same timestamp (within 1 minute tolerance)
  const existingTime = new Date(existing.recorded_at).getTime();
  const incomingTime = new Date(incoming.recorded_at).getTime();
  const timeDiff = Math.abs(existingTime - incomingTime);
  
  if (timeDiff > 60000) return false; // More than 1 minute apart
  
  // Same device and platform
  if (existing.device_name !== incoming.device_name) return false;
  if (existing.health_platform !== incoming.health_platform) return false;
  
  return true;
}
