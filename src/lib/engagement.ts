export const fiveMinutes = 5 * 60 * 1000;
export type StartTimer = { remainingMs: number; endsAt: number | null };
export type Engagement = { timer: boolean; challenge: boolean; hideTimer: boolean };
export const quietDefaults: Engagement = { timer: false, challenge: false, hideTimer: false };
export const remaining = (timer: StartTimer, now: number) => Math.max(0, Math.min(fiveMinutes, timer.endsAt === null ? timer.remainingMs : timer.endsAt - now));
export const startTimer = (now: number): StartTimer => ({ remainingMs: fiveMinutes, endsAt: now + fiveMinutes });
export const pauseTimer = (timer: StartTimer, now: number): StartTimer => ({ remainingMs: remaining(timer, now), endsAt: null });
export const resumeTimer = (timer: StartTimer, now: number): StartTimer => ({ remainingMs: timer.remainingMs, endsAt: now + timer.remainingMs });
export function readTimer(value: unknown): StartTimer | undefined {
  if (!value || typeof value !== "object") return;
  const t = value as StartTimer;
  if (!Number.isFinite(t.remainingMs) || t.remainingMs < 0 || t.remainingMs > fiveMinutes) return;
  if (t.endsAt !== null && (!Number.isFinite(t.endsAt) || t.endsAt < 0)) return;
  return { remainingMs: t.remainingMs, endsAt: t.endsAt };
}
