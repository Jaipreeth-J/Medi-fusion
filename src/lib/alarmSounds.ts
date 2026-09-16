/**
 * ALARM SOUND LIBRARY
 * Multiple alarm tones generated via Web Audio API
 * Stored preferences in localStorage
 */

export type AlarmTone = 'classic' | 'gentle' | 'urgent' | 'chime' | 'pulse';

export interface AlarmSettings {
  tone: AlarmTone;
  volume: number; // 0-100
}

const STORAGE_KEY = 'medifusion-alarm-settings';

export const ALARM_TONES: { id: AlarmTone; label: string; description: string }[] = [
  { id: 'classic', label: 'Classic', description: 'Standard medical beep pattern' },
  { id: 'gentle', label: 'Gentle', description: 'Soft ascending chime' },
  { id: 'urgent', label: 'Urgent', description: 'Fast-paced alert' },
  { id: 'chime', label: 'Chime', description: 'Melodic bell tone' },
  { id: 'pulse', label: 'Pulse', description: 'Rhythmic heartbeat-like pulse' },
];

export function getAlarmSettings(): AlarmSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { tone: 'classic', volume: 70 };
}

export function saveAlarmSettings(settings: AlarmSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function createTone(
  ctx: AudioContext,
  frequencies: number[],
  beepDuration: number,
  gap: number,
  waveform: OscillatorType,
  volume: number,
) {
  const now = ctx.currentTime;
  const gain = volume / 100;

  frequencies.forEach((freq, i) => {
    const startTime = now + i * (beepDuration + gap);
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, startTime);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gain * 0.5, startTime + 0.02);
    gainNode.gain.setValueAtTime(gain * 0.5, startTime + beepDuration - 0.02);
    gainNode.gain.linearRampToValueAtTime(0, startTime + beepDuration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + beepDuration);
  });
}

const TONE_CONFIGS: Record<AlarmTone, { freqs: number[]; beepDuration: number; gap: number; waveform: OscillatorType }> = {
  classic: {
    freqs: [880, 880, 880, 1100, 880, 880, 880, 1100],
    beepDuration: 0.15,
    gap: 0.1,
    waveform: 'sine',
  },
  gentle: {
    freqs: [523, 659, 784, 1047, 784, 659],
    beepDuration: 0.25,
    gap: 0.08,
    waveform: 'sine',
  },
  urgent: {
    freqs: [1000, 800, 1000, 800, 1000, 800, 1200, 1200],
    beepDuration: 0.1,
    gap: 0.05,
    waveform: 'square',
  },
  chime: {
    freqs: [1047, 1319, 1568, 2093, 1568, 1319, 1047],
    beepDuration: 0.3,
    gap: 0.05,
    waveform: 'sine',
  },
  pulse: {
    freqs: [220, 220, 220, 330, 220, 220, 220, 330],
    beepDuration: 0.2,
    gap: 0.15,
    waveform: 'triangle',
  },
};

export function playAlarmTone(tone?: AlarmTone, volume?: number) {
  const settings = getAlarmSettings();
  const selectedTone = tone ?? settings.tone;
  const selectedVolume = volume ?? settings.volume;

  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const config = TONE_CONFIGS[selectedTone];
    createTone(ctx, config.freqs, config.beepDuration, config.gap, config.waveform, selectedVolume);

    const totalDuration = config.freqs.length * (config.beepDuration + config.gap) + 1;
    setTimeout(() => ctx.close(), totalDuration * 1000);
  } catch (e) {
    console.warn('Could not play alarm:', e);
  }
}
