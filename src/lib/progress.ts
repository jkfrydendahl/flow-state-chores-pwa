import { rooms, roomOrder, type Room } from "../content/rooms.ts";
export type Mode = "minimal" | "photoshoot" | "tidy";
export type Session = { mode: Mode; status: "active" | "paused" };
export type Completion = { room: Room; mode: Mode; at: string };
export type Progress = {
  version: 2; selected: Mode; room: Room; queue: Room[];
  activeRoom: Room | null;
  sessions: Partial<Record<Room, Session>>;
  completions: Partial<Record<Room, Partial<Record<Mode, string>>>>;
  lastCompleted: Completion | null;
};
// Retain the original key so existing installations can migrate in place.
export const storageKey = "flow-state-chores.progress.v1";
export function initialProgress(): Progress {
  return { version: 2, selected: "minimal", room: "kitchen", queue: [...roomOrder], activeRoom: null, sessions: {}, completions: {}, lastCompleted: null };
}
export const isRoom = (v: unknown): v is Room => typeof v === "string" && Object.hasOwn(rooms, v);
const isMode = (v: unknown): v is Mode => v === "minimal" || v === "photoshoot" || v === "tidy";
const isDate = (v: unknown): v is string => typeof v === "string" && Number.isFinite(Date.parse(v));
const object = (v: unknown): Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v) ? v as Record<string, unknown> : {};
const legacyRoom = (v: unknown): Room | undefined => v === undefined ? "kitchen" : roomOrder.find(id => id === v || rooms[id].name === v);
export const currentMode = (state: Progress): Mode => state.sessions[state.room]?.mode ?? state.selected;

export function readProgress(raw: string | null): Progress {
  const state = initialProgress();
  if (!raw) return state;
  try {
    const value = object(JSON.parse(raw));
    if (value.version === 1) {
      if (!isMode(value.selected)) return state;
      state.selected = value.selected;
      const session = object(value.session);
      const room = legacyRoom(session.room);
      if (room && isMode(session.mode) && (session.status === "active" || session.status === "paused")) {
        state.room = room;
        state.selected = session.mode;
        state.sessions[room] = { mode: session.mode, status: session.status };
        state.activeRoom = session.status === "active" ? room : null;
      }
      const done = object(value.completed);
      const doneRoom = legacyRoom(done.room);
      if (doneRoom && isMode(done.mode) && isDate(done.at)) {
        state.lastCompleted = { room: doneRoom, mode: done.mode, at: done.at };
        state.completions[doneRoom] = { [done.mode]: done.at };
        state.queue = [...state.queue.filter(id => id !== doneRoom), doneRoom];
        if (!Object.keys(state.sessions).length) state.room = state.queue[0];
      }
      return state;
    }
    if (value.version !== 2) return state;
    if (isMode(value.selected)) state.selected = value.selected;
    const queue = Array.isArray(value.queue) ? value.queue.filter(isRoom) : [];
    state.queue = [...new Set([...queue, ...roomOrder])];
    state.room = isRoom(value.room) ? value.room : state.queue[0];
    for (const room of roomOrder) {
      const session = object(object(value.sessions)[room]);
      if (isMode(session.mode) && (session.status === "paused" || session.status === "active")) {
        state.sessions[room] = { mode: session.mode, status: "paused" };
      }
      const completed = object(object(value.completions)[room]);
      for (const mode of ["minimal", "photoshoot", "tidy"] as const) {
        if (isDate(completed[mode])) state.completions[room] = { ...state.completions[room], [mode]: completed[mode] };
      }
    }
    if (isRoom(value.activeRoom) && state.sessions[value.activeRoom]) {
      state.activeRoom = value.activeRoom;
      state.room = value.activeRoom;
      state.sessions[value.activeRoom] = { ...state.sessions[value.activeRoom]!, status: "active" };
    }
    const done = object(value.lastCompleted);
    if (isRoom(done.room) && isMode(done.mode) && isDate(done.at)) state.lastCompleted = { room: done.room, mode: done.mode, at: done.at };
    return state;
  } catch { return state; }
}
export type Action =
  | { type: "select"; mode: Mode } | { type: "room"; room: Room }
  | { type: "start" } | { type: "pause" } | { type: "resume" } | { type: "leave" }
  | { type: "skip" } | { type: "already-done"; at: string } | { type: "complete"; at: string };
function finish(state: Progress, room: Room, mode: Mode, at: string): Progress {
  const sessions = { ...state.sessions };
  delete sessions[room];
  const queue = [...state.queue.filter(id => id !== room), room];
  return { ...state, room: queue[0], queue, activeRoom: null, sessions,
    completions: { ...state.completions, [room]: { ...state.completions[room], [mode]: at } },
    lastCompleted: { room, mode, at } };
}
export function transition(state: Progress, action: Action): Progress {
  const room = state.room;
  const session = state.sessions[room];
  switch (action.type) {
    case "select": return state.activeRoom || session ? state : { ...state, selected: action.mode };
    case "room": return state.activeRoom ? state : { ...state, room: action.room };
    case "start": return state.activeRoom || session ? state : { ...state, activeRoom: room, sessions: { ...state.sessions, [room]: { mode: state.selected, status: "active" } } };
    case "pause": {
      if (!state.activeRoom) return state;
      const active = state.activeRoom;
      return { ...state, room: active, activeRoom: null, sessions: { ...state.sessions, [active]: { ...state.sessions[active]!, status: "paused" } } };
    }
    case "resume": return state.activeRoom || !session ? state : { ...state, activeRoom: room, selected: session.mode, sessions: { ...state.sessions, [room]: { ...session, status: "active" } } };
    case "leave": {
      if (state.activeRoom) return state;
      const sessions = { ...state.sessions }; delete sessions[room];
      return { ...state, sessions };
    }
    case "skip": {
      if (state.activeRoom) return state;
      const queue = [...state.queue.filter(id => id !== room), room];
      return { ...state, queue, room: queue[0] };
    }
    case "already-done": return state.activeRoom ? state : finish(state, room, currentMode(state), action.at);
    case "complete": return state.activeRoom ? finish(state, state.activeRoom, state.sessions[state.activeRoom]!.mode, action.at) : state;
  }
}
