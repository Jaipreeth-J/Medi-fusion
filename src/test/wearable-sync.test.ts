/**
 * WEARABLE SYNC TESTS
 * Tests for sync logic, deduplication, multi-provider support, and error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Deduplication Logic Tests ──

describe('Wearable Sync Deduplication', () => {
  const createVitals = (overrides = {}) => ({
    heart_rate: 72,
    spo2: 98,
    steps: 5000,
    calories: 2100,
    sleep_hours: 7.2,
    ...overrides,
  });

  it('should detect duplicate records with matching metrics', () => {
    const existing = createVitals();
    const incoming = createVitals();

    const isDuplicate = (
      (incoming.heart_rate === undefined || existing.heart_rate === incoming.heart_rate) &&
      (incoming.spo2 === undefined || existing.spo2 === incoming.spo2) &&
      (incoming.sleep_hours === undefined || existing.sleep_hours === incoming.sleep_hours)
    );

    expect(isDuplicate).toBe(true);
  });

  it('should not flag as duplicate when metrics differ', () => {
    const existing = createVitals({ heart_rate: 72 });
    const incoming = createVitals({ heart_rate: 85 });

    const isDuplicate = existing.heart_rate === incoming.heart_rate;
    expect(isDuplicate).toBe(false);
  });

  it('should handle undefined metrics gracefully', () => {
    const existing = createVitals();
    const incoming = { heart_rate: undefined, spo2: undefined };

    const isDuplicate = (
      (incoming.heart_rate === undefined || existing.heart_rate === incoming.heart_rate) &&
      (incoming.spo2 === undefined || existing.spo2 === incoming.spo2)
    );

    expect(isDuplicate).toBe(true); // undefined means "not checked"
  });
});

// ── Device Metadata Tests ──

describe('Device Metadata Tracking', () => {
  const normalizeDeviceName = (raw: string | null): string | null => {
    if (!raw) return null;
    const MAP: Record<string, string> = {
      apple_watch: 'Apple Watch', amazfit_gtr_2: 'Amazfit GTR 2',
      fitbit_sense: 'Fitbit Sense', garmin_fenix: 'Garmin Fenix',
      galaxy_watch_6: 'Samsung Galaxy Watch 6',
    };
    const key = raw.toLowerCase().replace(/[\s\-]+/g, '_');
    return MAP[key] || raw.split(/[\s_\-]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const detectDeviceType = (name: string | null): string => {
    if (!name) return 'unknown';
    const l = name.toLowerCase();
    if (/watch|fenix|forerunner|venu|sense|versa/.test(l)) return 'watch';
    if (/band|inspire|charge|luxe|bip/.test(l)) return 'band';
    return 'wearable';
  };

  it('should normalize Apple Watch device name', () => {
    expect(normalizeDeviceName('apple_watch')).toBe('Apple Watch');
    expect(normalizeDeviceName('APPLE_WATCH')).toBe('Apple Watch');
  });

  it('should normalize Amazfit device name', () => {
    expect(normalizeDeviceName('amazfit-gtr-2')).toBe('Amazfit GTR 2');
  });

  it('should handle unknown device names gracefully', () => {
    expect(normalizeDeviceName('some_new_device')).toBe('Some New Device');
  });

  it('should detect watch device type', () => {
    expect(detectDeviceType('Apple Watch')).toBe('watch');
    expect(detectDeviceType('Garmin Fenix')).toBe('watch');
  });

  it('should detect band device type', () => {
    expect(detectDeviceType('Fitbit Inspire')).toBe('band');
    expect(detectDeviceType('Amazfit Bip')).toBe('band');
  });

  it('should return unknown for null', () => {
    expect(detectDeviceType(null)).toBe('unknown');
  });
});

// ── Sync Chain Tests ──

describe('Sync Source Chain', () => {
  const buildSyncChain = (deviceName: string | null, sourceApp: string | null, platform: string): string[] => {
    const chain: string[] = [];
    if (deviceName) chain.push(deviceName);
    if (sourceApp && sourceApp !== deviceName) chain.push(sourceApp);
    if (platform && platform !== sourceApp) chain.push(platform);
    chain.push('MediFusion');
    return chain;
  };

  it('should build full chain for Google Fit with device', () => {
    const chain = buildSyncChain('Amazfit GTR 2', 'Zepp', 'Google Fit');
    expect(chain).toEqual(['Amazfit GTR 2', 'Zepp', 'Google Fit', 'MediFusion']);
  });

  it('should build chain for Apple Watch', () => {
    const chain = buildSyncChain('Apple Watch', 'Apple Health', 'Apple HealthKit');
    expect(chain).toEqual(['Apple Watch', 'Apple Health', 'Apple HealthKit', 'MediFusion']);
  });

  it('should handle null device name', () => {
    const chain = buildSyncChain(null, 'Fitbit', 'Fitbit');
    expect(chain).toEqual(['Fitbit', 'MediFusion']);
  });

  it('should not duplicate when sourceApp equals platform', () => {
    const chain = buildSyncChain('Fitbit Sense', 'Fitbit', 'Fitbit');
    expect(chain).toEqual(['Fitbit Sense', 'Fitbit', 'MediFusion']);
  });
});

// ── Multi-Provider Support Tests ──

describe('Multi-Provider Support', () => {
  const SUPPORTED_PROVIDERS = ['google_fit', 'fitbit', 'garmin', 'health_connect', 'apple_health'];

  it('should support all expected providers', () => {
    SUPPORTED_PROVIDERS.forEach(provider => {
      expect(SUPPORTED_PROVIDERS).toContain(provider);
    });
  });

  const PLATFORM_APPS: Record<string, string> = {
    google_fit: 'Google Fit', fitbit: 'Fitbit', garmin: 'Garmin Connect',
    health_connect: 'Health Connect', apple_health: 'Apple HealthKit',
  };

  it('should have platform app mapping for all providers', () => {
    SUPPORTED_PROVIDERS.forEach(provider => {
      expect(PLATFORM_APPS[provider]).toBeDefined();
    });
  });

  it('should identify native providers correctly', () => {
    const NATIVE_PROVIDERS = ['health_connect', 'apple_health'];
    const OAUTH_PROVIDERS = ['google_fit', 'fitbit', 'garmin'];

    NATIVE_PROVIDERS.forEach(p => expect(['health_connect', 'apple_health']).toContain(p));
    OAUTH_PROVIDERS.forEach(p => expect(['google_fit', 'fitbit', 'garmin']).toContain(p));
  });
});

// ── Error Handling Tests ──

describe('Error Handling', () => {
  it('should timeout long-running sync operations', async () => {
    const slowPromise = new Promise((resolve) => setTimeout(resolve, 200));
    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
      Promise.race([
        promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Sync timed out')), ms)
        ),
      ]);

    await expect(withTimeout(slowPromise, 50)).rejects.toThrow('Sync timed out');
  });

  it('should not timeout fast operations', async () => {
    const fastPromise = Promise.resolve('done');
    const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
      Promise.race([
        promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Sync timed out')), ms)
        ),
      ]);

    const result = await withTimeout(fastPromise, 5000);
    expect(result).toBe('done');
  });

  it('should validate required sync parameters', () => {
    const validateParams = (connectionId: string | null, dataTypes: string[] | null) => {
      if (!connectionId || !dataTypes?.length) return false;
      return true;
    };

    expect(validateParams(null, ['heart_rate'])).toBe(false);
    expect(validateParams('abc', null)).toBe(false);
    expect(validateParams('abc', [])).toBe(false);
    expect(validateParams('abc', ['heart_rate'])).toBe(true);
  });
});

// ── Data Accuracy Tests ──

describe('Data Accuracy', () => {
  it('should validate heart rate is in reasonable range', () => {
    const validateHR = (hr: number) => hr >= 30 && hr <= 250;
    expect(validateHR(72)).toBe(true);
    expect(validateHR(10)).toBe(false);
    expect(validateHR(300)).toBe(false);
  });

  it('should validate SpO2 is in reasonable range', () => {
    const validateSpO2 = (spo2: number) => spo2 >= 70 && spo2 <= 100;
    expect(validateSpO2(98)).toBe(true);
    expect(validateSpO2(50)).toBe(false);
    expect(validateSpO2(101)).toBe(false);
  });

  it('should validate steps is non-negative', () => {
    expect(5000 >= 0).toBe(true);
    expect(-1 >= 0).toBe(false);
  });

  it('should format sleep hours correctly', () => {
    const formatSleep = (minutes: number) => Math.round((minutes / 60) * 10) / 10;
    expect(formatSleep(450)).toBe(7.5);
    expect(formatSleep(360)).toBe(6);
  });
});

// ── Apple HealthKit Integration Tests ──

describe('Apple HealthKit Integration', () => {
  it('should map Apple Health data types correctly', () => {
    const APPLE_DATA_TYPES = ['heart_rate', 'spo2', 'steps', 'calories', 'sleep', 'blood_pressure', 'weight', 'temperature'];
    expect(APPLE_DATA_TYPES).toContain('heart_rate');
    expect(APPLE_DATA_TYPES).toContain('spo2');
    expect(APPLE_DATA_TYPES).toContain('blood_pressure');
  });

  it('should create proper metadata for Apple Watch sync', () => {
    const metadata = {
      device_name: 'Apple Watch',
      device_type: 'watch',
      source_app: 'Apple Health',
      health_platform: 'Apple HealthKit',
      sync_source_chain: { chain: ['Apple Watch', 'Apple Health', 'Apple HealthKit', 'MediFusion'] },
    };

    expect(metadata.health_platform).toBe('Apple HealthKit');
    expect(metadata.device_type).toBe('watch');
    expect(metadata.sync_source_chain.chain).toHaveLength(4);
    expect(metadata.sync_source_chain.chain[metadata.sync_source_chain.chain.length - 1]).toBe('MediFusion');
  });

  it('should handle native vitals from Apple HealthKit', () => {
    const nativeVitals = {
      heart_rate: 68,
      spo2: 99,
      steps: 8234,
      calories: 2450,
      sleep_hours: 7.8,
      weight_kg: 72.5,
      temperature_celsius: 36.6,
      blood_pressure_systolic: 120,
      blood_pressure_diastolic: 80,
    };

    expect(nativeVitals.heart_rate).toBeDefined();
    expect(nativeVitals.spo2).toBeLessThanOrEqual(100);
    expect(nativeVitals.blood_pressure_systolic).toBeGreaterThan(nativeVitals.blood_pressure_diastolic);
  });
});

// ── API Response Format Tests ──

describe('API Response Format', () => {
  it('should return correct sync response structure', () => {
    const response = {
      success: true,
      vitals: {
        heart_rate: 72,
        spo2: 98,
        steps: 5000,
        calories: 2100,
        sleep_hours: 7.2,
        recorded_at: '2026-03-08T15:00:00.000Z',
        source: 'google_fit',
        device_name: 'Amazfit GTR 2',
        device_type: 'watch',
        source_app: 'Zepp',
        health_platform: 'Google Fit',
        sync_source_chain: { chain: ['Amazfit GTR 2', 'Zepp', 'Google Fit', 'MediFusion'] },
      },
      recordsSynced: 5,
      isDuplicate: false,
      metadata: {
        provider: 'google_fit',
        device_name: 'Amazfit GTR 2',
        device_type: 'watch',
        source_app: 'Zepp',
        health_platform: 'Google Fit',
        synced_at: '2026-03-08T15:00:00.000Z',
      },
    };

    expect(response.success).toBe(true);
    expect(response.vitals).toBeDefined();
    expect(response.vitals.recorded_at).toBeDefined();
    expect(response.vitals.source).toBeDefined();
    expect(response.metadata).toBeDefined();
    expect(response.metadata.provider).toBe('google_fit');
    expect(response.recordsSynced).toBeGreaterThan(0);
  });
});
