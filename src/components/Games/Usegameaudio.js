// ============================================================================
// useGameAudio.js
// ----------------------------------------------------------------------------
// Synthesizes every game sound live with the Web Audio API — no audio files,
// so sound "packs" are just data (see SOUND_PACKS in gamesFallback.js) and
// switching one is instant. Safe to call play() rapidly; failures (e.g. no
// AudioContext support) are swallowed since sound is a non-critical layer.
// ============================================================================
import { useRef, useCallback, useEffect } from "react";
import { SOUND_PACKS } from "./Gamefallback";

export default function useGameAudio({ packId = "arcade", volume = 0.7, enabled = true } = {}) {
  const ctxRef = useRef(null);
  const packRef = useRef(SOUND_PACKS.find((p) => p.id === packId) || SOUND_PACKS[0]);
  const volRef = useRef(volume);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    packRef.current = SOUND_PACKS.find((p) => p.id === packId) || SOUND_PACKS[0];
  }, [packId]);
  useEffect(() => {
    volRef.current = volume;
  }, [volume]);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const ensureCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    if (ctxRef.current?.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(
    (eventName) => {
      if (!enabledRef.current) return;
      const ctx = ensureCtx();
      if (!ctx) return;
      const def = packRef.current?.events?.[eventName];
      if (!def) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = def.type;
        osc.frequency.setValueAtTime(def.freq, ctx.currentTime);
        if (def.slide) {
          osc.frequency.linearRampToValueAtTime(
            Math.max(40, def.freq + def.slide),
            ctx.currentTime + def.dur,
          );
        }
        gain.gain.setValueAtTime(Math.max(0.0001, def.gain * volRef.current), ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + def.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + def.dur + 0.02);
      } catch {
        /* audio is a nice-to-have; never let it break gameplay */
      }
    },
    [ensureCtx],
  );

  return { play, unlock: ensureCtx };
}