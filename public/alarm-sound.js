/**
 * Generates a medication alarm tone using Web Audio API.
 * Call playMedicationAlarm() to play the sound.
 * This file is loaded by both the main app and can be referenced by the SW.
 */

function createMedicationAlarm(audioContext) {
  const duration = 2.5;
  const now = audioContext.currentTime;

  // Create a sequence of beeps (medical alarm pattern)
  const frequencies = [880, 880, 880, 1100, 880, 880, 880, 1100];
  const beepDuration = 0.15;
  const gap = 0.1;

  frequencies.forEach((freq, i) => {
    const startTime = now + i * (beepDuration + gap);

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, startTime);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
    gainNode.gain.setValueAtTime(0.4, startTime + beepDuration - 0.02);
    gainNode.gain.linearRampToValueAtTime(0, startTime + beepDuration);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + beepDuration);
  });

  return duration;
}

// Expose globally for use in the app
if (typeof window !== 'undefined') {
  window.playMedicationAlarm = function () {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      createMedicationAlarm(ctx);
      // Close context after sound finishes
      setTimeout(() => ctx.close(), 3000);
      return true;
    } catch (e) {
      console.warn('Could not play alarm sound:', e);
      return false;
    }
  };
}
