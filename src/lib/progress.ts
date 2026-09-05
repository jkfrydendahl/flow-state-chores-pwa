export type Mode = "minimal" | "photoshoot" | "tidy";
export type Progress = {
  version: 1; selected: Mode;
  session: { room: string; mode: Mode; status: "active" | "paused" } | null;
  completed: { room: string; mode: Mode; at: string } | null;
};
export const storageKey = "flow-state-chores.progress.v1";
export const initialProgress: Progress = { version: 1, selected: "minimal", session: null, completed: null };
const isMode = (value: unknown): value is Mode => ["minimal", "photoshoot", "tidy"].includes(value as string);
// Records from the kitchen-only prototype had no room field.
const readRoom = (value: unknown): string | null => value === undefined ? "Kitchen" : typeof value === "string" && value.trim() ? value : null;
// Browser storage may be cleared, corrupted or from a future version.
export function readProgress(raw: string | null): Progress {
  if (!raw) return { ...initialProgress };
  try {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !isMode(value.selected)) return { ...initialProgress };
    const session = value.session && readRoom(value.session.room) && isMode(value.session.mode) && ["active", "paused"].includes(value.session.status)
      ? { room: readRoom(value.session.room)!, mode: value.session.mode, status: value.session.status } : null;
    const completed = value.completed && readRoom(value.completed.room) && isMode(value.completed.mode) && typeof value.completed.at === "string" && Number.isFinite(Date.parse(value.completed.at))
      ? { room: readRoom(value.completed.room)!, mode: value.completed.mode, at: value.completed.at } : null;
    return { version: 1, selected: session?.mode ?? value.selected, session, completed };
  } catch { return { ...initialProgress }; }
}
export type Action = { type: "select"; mode: Mode } | { type: "start"; room: string } | { type: "pause" } | { type: "resume" } | { type: "leave" } | { type: "complete"; at: string };
export function transition(state: Progress, action: Action): Progress {
  switch (action.type) {
    case "select": return state.session ? state : { ...state, selected: action.mode };
    case "start": return state.session ? state : { ...state, session: { room: action.room, mode: state.selected, status: "active" } };
    case "pause": return state.session ? { ...state, session: { ...state.session, status: "paused" } } : state;
    case "resume": return state.session ? { ...state, session: { ...state.session, status: "active" } } : state;
    case "leave": return { ...state, session: null };
    case "complete": return state.session ? { ...state, session: null, completed: { room: state.session.room, mode: state.session.mode, at: action.at } } : state;
  }
}
