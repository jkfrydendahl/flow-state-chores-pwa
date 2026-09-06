"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function useTimerFeedback(keepAwake: boolean) {
  const audio = useRef<AudioContext | null>(null);
  const [soundReady, setSoundReady] = useState(false);
  const [wakeStatus, setWakeStatus] = useState<"off" | "active" | "unavailable">("off");
  // Called directly by Start/Resume (or Enable chime), never by an autoplay effect.
  const enableChime = useCallback(() => {
    try {
      const Audio = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Audio) return;
      const context = audio.current ?? new Audio();
      audio.current = context;
      void context.resume().then(() => setSoundReady(context.state === "running")).catch(() => setSoundReady(false));
    } catch { setSoundReady(false); }
  }, []);
  const playChime = useCallback(() => {
    const context = audio.current;
    if (!context || context.state !== "running") { setSoundReady(false); return; }
    try {
      const start = context.currentTime;
      // One soft, short two-tone bell. No external audio asset or network needed.
      for (const [frequency, offset] of [[660, 0], [880, 0.18]]) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start + offset);
        gain.gain.linearRampToValueAtTime(0.07, start + offset + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, start + offset + 0.7);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(start + offset); oscillator.stop(start + offset + 0.75);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      }
    } catch { setSoundReady(false); }
  }, []);
  useEffect(() => () => { void audio.current?.close().catch(() => {}); audio.current = null; }, []);

  useEffect(() => {
    if (!keepAwake) { setWakeStatus("off"); return; }
    if (!("wakeLock" in navigator)) { setWakeStatus("unavailable"); return; }
    let disposed = false;
    let pending = false;
    let lock: WakeLockSentinel | null = null;
    async function request() {
      if (disposed || pending || lock || document.visibilityState !== "visible") return;
      pending = true;
      try {
        const acquired = await navigator.wakeLock.request("screen");
        if (disposed || document.visibilityState !== "visible") { await acquired.release(); return; }
        lock = acquired; setWakeStatus("active");
        acquired.addEventListener("release", () => {
          if (lock === acquired) lock = null;
          if (!disposed) setWakeStatus("unavailable");
        });
      } catch { if (!disposed) setWakeStatus("unavailable"); }
      finally { pending = false; }
    }
    function visibilityChanged() {
      if (document.visibilityState === "visible") { void request(); }
      else { const old = lock; lock = null; void old?.release().catch(() => {}); }
    }
    void request();
    document.addEventListener("visibilitychange", visibilityChanged);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", visibilityChanged);
      void lock?.release().catch(() => {});
    };
  }, [keepAwake]);
  return { enableChime, playChime, soundReady, wakeStatus };
}
