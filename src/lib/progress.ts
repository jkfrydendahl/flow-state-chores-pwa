export type Mode = "minimal" | "photoshoot" | "tidy";
export type Progress = {
  version: 1; selected: Mode;
  session: { mode: Mode; status: "active" | "paused" } | null;
  completed: { mode: Mode; at: string } | null;
};
export const storageKey = "flow-state-chores.progress.v1";
export const initialProgress: Progress = { version: 1, selected: "minimal", session: null, completed: null };
const isMode = (value: unknown): value is Mode => ["minimal", "photoshoot", "tidy"].includes(value as string);
// Browser storage may be cleared, corrupted or from a future version.
export function readProgress(raw: string | null): Progress {
  if (!raw) return { ...initialProgress };
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !isMode(value.selected)) return { ...initialProgress };
    const session = value.session && isMode(value.session.mode) && ["active", "paused"].includes(value.session.status)
      ? { mode: value.session.mode, status: value.session.status } : null;
    const completed = value.completed && isMode(value.completed.mode) && typeof value.completed.at === "string" && Number.isFinite(Date.parse(value.completed.at))
      ? { mode: value.completed.mode, at: value.completed.at } : null;
    return { version: 1, selected: session?.mode ?? value.selected, session, completed };
  } catch { return { ...initialProgress }; }
}
export type Action = { type: "select"; mode: Mode } | { type: "start" } | { type: "pause" } | { type: "resume" } | { type: "leave" } | { type: "complete"; at: string };
export function transition(state: Progress, action: Action): Progress {
  switch (action.type) {
    case "select": return state.session ? state : { ...state, selected: action.mode };
    case "start": return state.session ? state : { ...state, session: { mode: state.selected, status: "active" } };
    case "pause": return state.session ? { ...state, session: { ...state.session, status: "paused" } } : state;
    case "resume": return state.session ? { ...state, session: { ...state.session, status: "active" } } : state;
    case "leave": return { ...state, session: null };
    case "complete": return state.session ? { ...state, session: null, completed: { mode: state.session.mode, at: action.at } } : state;
  }
}
