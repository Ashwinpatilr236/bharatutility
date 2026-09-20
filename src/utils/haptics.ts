/**
 * Subtle Native Mobile Haptic and Audio Click Synthesizer
 * Provides tactile feel on mobile button clicks without external audio assets.
 */

let audioCtx: AudioContext | null = null;

export const triggerHapticFeedback = (type: 'light' | 'medium' | 'success' = 'light') => {
  // 1. Hardware vibration if supported
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      if (type === 'light') {
        navigator.vibrate(8);
      } else if (type === 'medium') {
        navigator.vibrate(15);
      } else if (type === 'success') {
        navigator.vibrate([10, 30, 15]);
      }
    } catch {}
  }

  // 2. Ultra-subtle Web Audio synthesized soft pop (optional / non-intrusive)
  try {
    const isSoundEnabled = typeof window !== 'undefined' && localStorage.getItem('bu_touch_sound') === 'true';
    if (!isSoundEnabled) return;

    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (audioCtx && audioCtx.state === 'running') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'success' ? 580 : 380, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    }
  } catch {}
};
