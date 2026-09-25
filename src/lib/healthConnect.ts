/**
 * HEALTH CONNECT BRIDGE
 * Native Android Health Connect integration via Capacitor
 * Reads health data and sends it through the existing wearable sync pipeline
 */

import { Capacitor } from '@capacitor/core';

export interface HealthConnectVitals {
  heart_rate?: number;
  spo2?: number;
  steps?: number;
  calories?: number;
  sleep_hours?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  weight_kg?: number;
  temperature_celsius?: number;
}

export interface HealthConnectDeviceInfo {
  platform: 'android';
  type: 'health_connect';
  device_name: string;
  source_app: string;
  health_platform: 'Health Connect';
}

// Lazy-load the plugin to avoid errors on non-native platforms
async function getPlugin() {
  const mod = await import('capacitor-health-connect');
  return mod.HealthConnect;
}

/**
 * Check if Health Connect is available on this device
 */
export async function isHealthConnectAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    return false;
  }
  try {
    const HC = await getPlugin();
    const result = await HC.checkAvailability();
    return result.availability === 'Available';
  } catch (e) {
    console.warn('Health Connect not available:', e);
    return false;
  }
}

/**
 * Request Health Connect permissions for reading health data
 */
export async function requestHealthConnectPermissions(): Promise<boolean> {
  try {
    const HC = await getPlugin();
    await HC.requestHealthPermissions({
      read: [
        'HeartRate' as any,
        'OxygenSaturation' as any,
        'Steps' as any,
        'ActiveCaloriesBurned' as any,
        'SleepSession' as any,
        'BloodPressure' as any,
        'Weight' as any,
        'BodyTemperature' as any,
      ],
      write: [],
    });
    return true;
  } catch (e) {
    console.error('Failed to request Health Connect permissions:', e);
    return false;
  }
}

/**
 * Read the latest health data from Health Connect (last 24 hours)
 */
export async function readHealthConnectData(): Promise<{
  vitals: HealthConnectVitals;
  deviceInfo: HealthConnectDeviceInfo;
}> {
  const HC = await getPlugin();

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const vitals: HealthConnectVitals = {};

  // Helper to safely read records
  async function readSafe(type: string): Promise<any[]> {
    try {
      const result = await HC.readRecords({
        type: type as any,
        timeRangeFilter: {
          type: 'between',
          startTime: oneDayAgo,
          endTime: now,
        },
      });
      return (result as any).records || [];
    } catch (e) {
      console.warn(`HC: ${type} read failed`, e);
      return [];
    }
  }

  // Heart Rate
  const hrRecords = await readSafe('HeartRate');
  if (hrRecords.length > 0) {
    const last = hrRecords[hrRecords.length - 1];
    if (last.samples?.length > 0) {
      vitals.heart_rate = last.samples[last.samples.length - 1].beatsPerMinute;
    }
  }

  // SpO2
  const spo2Records = await readSafe('OxygenSaturation');
  if (spo2Records.length > 0) {
    const last = spo2Records[spo2Records.length - 1];
    vitals.spo2 = Math.round((last.percentage ?? 0) * 100) / 100;
  }

  // Steps (sum all)
  const stepsRecords = await readSafe('Steps');
  if (stepsRecords.length > 0) {
    vitals.steps = stepsRecords.reduce((sum: number, r: any) => sum + (r.count || 0), 0);
  }

  // Calories (sum all)
  const calRecords = await readSafe('ActiveCaloriesBurned');
  if (calRecords.length > 0) {
    vitals.calories = Math.round(
      calRecords.reduce((sum: number, r: any) => sum + (r.energy?.inKilocalories || 0), 0)
    );
  }

  // Sleep
  const sleepRecords = await readSafe('SleepSession');
  if (sleepRecords.length > 0) {
    const last = sleepRecords[sleepRecords.length - 1];
    const start = new Date(last.startTime);
    const end = new Date(last.endTime);
    vitals.sleep_hours = Math.round(((end.getTime() - start.getTime()) / (1000 * 60 * 60)) * 10) / 10;
  }

  // Blood Pressure
  const bpRecords = await readSafe('BloodPressure');
  if (bpRecords.length > 0) {
    const last = bpRecords[bpRecords.length - 1];
    vitals.blood_pressure_systolic = Math.round(last.systolic?.inMillimetersOfMercury || 0);
    vitals.blood_pressure_diastolic = Math.round(last.diastolic?.inMillimetersOfMercury || 0);
  }

  // Weight
  const weightRecords = await readSafe('Weight');
  if (weightRecords.length > 0) {
    const last = weightRecords[weightRecords.length - 1];
    vitals.weight_kg = Math.round((last.weight?.inKilograms || 0) * 10) / 10;
  }

  // Temperature
  const tempRecords = await readSafe('BodyTemperature');
  if (tempRecords.length > 0) {
    const last = tempRecords[tempRecords.length - 1];
    vitals.temperature_celsius = Math.round((last.temperature?.inCelsius || 0) * 10) / 10;
  }

  return {
    vitals,
    deviceInfo: {
      platform: 'android',
      type: 'health_connect',
      device_name: 'Android Device',
      source_app: 'Health Connect',
      health_platform: 'Health Connect',
    },
  };
}
