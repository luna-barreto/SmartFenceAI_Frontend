import { Platform, Vibration } from "react-native";

// ── Web: genera un beep de alarma con la Web Audio API ────────────────────────
function beepWeb(frecuencia = 880, duracionMs = 200, veces = 3) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    let t = ctx.currentTime;
    for (let i = 0; i < veces; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frecuencia;
      osc.type = "square";
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duracionMs / 1000);
      osc.start(t);
      osc.stop(t + duracionMs / 1000);
      t += (duracionMs / 1000) + 0.08;
    }
  } catch { /* AudioContext no disponible */ }
}

// ── Nativo: vibración como señal de alarma (sin expo-av) ─────────────────────
function beepNativo() {
  try {
    // 3 pulsos cortos: vibrar 200ms, pausa 100ms, repetir
    Vibration.vibrate([0, 200, 100, 200, 100, 200]);
  } catch { /* vibración no disponible */ }
}

/**
 * Reproduce una alarma corta (3 beeps) cuando un animal sale de la cerca.
 * · Web: Web Audio API, sin dependencias.
 * · Nativo: vibración del dispositivo (3 pulsos cortos).
 */
export function sonarAlarma() {
  if (Platform.OS === "web") {
    beepWeb(880, 200, 3);
  } else {
    beepNativo();
  }
}
