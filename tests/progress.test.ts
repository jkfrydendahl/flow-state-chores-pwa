import test from "node:test";
import assert from "node:assert/strict";
import { initialProgress, readProgress, transition } from "../src/lib/progress.ts";
import { roomOrder } from "../src/content/rooms.ts";
const at = "2026-09-05T12:00:00Z";

test("pause and reload retain multiple room quests independently", () => {
  let state = transition(initialProgress(), { type: "select", mode: "photoshoot" });
  state = transition(transition(state, { type: "start" }), { type: "pause" });
  state = transition(state, { type: "room", room: "bathroom" });
  state = transition(state, { type: "select", mode: "tidy" });
  state = transition(transition(state, { type: "start" }), { type: "pause" });
  state = readProgress(JSON.stringify(state));
  assert.deepEqual(state.sessions.kitchen, { mode: "photoshoot", status: "paused" });
  assert.deepEqual(state.sessions.bathroom, { mode: "tidy", status: "paused" });
  state = transition(state, { type: "room", room: "kitchen" });
  state = transition(state, { type: "resume" });
  state = readProgress(JSON.stringify(state));
  assert.equal(state.activeRoom, "kitchen");
  state = transition(state, { type: "complete", at });
  assert.deepEqual(state.lastCompleted, { room: "kitchen", mode: "photoshoot", at });
  assert.equal(state.sessions.kitchen, undefined);
  assert.equal(state.sessions.bathroom?.status, "paused");
  assert.equal(state.activeRoom, null);
});

test("a full rotation stays unique, advances on handling, and never starts a quest", () => {
  let state = initialProgress();
  for (const room of roomOrder) {
    assert.equal(state.room, room);
    state = transition(state, { type: "already-done", at });
    assert.equal(state.activeRoom, null);
    assert.equal(new Set(state.queue).size, roomOrder.length);
  }
  assert.deepEqual(state.queue, roomOrder);
  assert.equal(state.room, "kitchen");
});

test("skipping preserves paused work without creating a completion", () => {
  let state = transition(transition(initialProgress(), { type: "start" }), { type: "pause" });
  state = transition(state, { type: "skip" });
  assert.equal(state.room, "living-room");
  assert.equal(state.sessions.kitchen?.status, "paused");
  assert.equal(state.lastCompleted, null);
  assert.deepEqual(state.completions, {});
});

test("selecting another room does not alter the suggestion or create debt on reload", () => {
  let state = transition(initialProgress(), { type: "room", room: "carport" });
  state = readProgress(JSON.stringify(state));
  assert.equal(state.room, "carport");
  assert.deepEqual(state.queue, roomOrder);
  state = transition(state, { type: "already-done", at });
  assert.equal(state.room, "kitchen");
  assert.equal(state.lastCompleted?.room, "carport");
});

test("completion records only the selected mode and preserves earlier modes", () => {
  let state = transition(initialProgress(), { type: "already-done", at });
  assert.deepEqual(state.completions.kitchen, { minimal: at });
  state = transition(state, { type: "room", room: "kitchen" });
  state = transition(state, { type: "select", mode: "photoshoot" });
  state = transition(state, { type: "already-done", at });
  assert.deepEqual(state.completions.kitchen, { minimal: at, photoshoot: at });
  assert.equal(Object.hasOwn(state.completions.kitchen!, "tidy"), false);
});

test("active quests cannot be replaced, skipped or marked done from the room screen", () => {
  const state = transition(initialProgress(), { type: "start" });
  assert.deepEqual(transition(state, { type: "room", room: "bedroom" }), state);
  assert.deepEqual(transition(state, { type: "select", mode: "tidy" }), state);
  assert.deepEqual(transition(state, { type: "skip" }), state);
  assert.deepEqual(transition(state, { type: "already-done", at }), state);
});

test("leaving an unfinished quest permits a lighter mode without marking completion", () => {
  let state = transition(initialProgress(), { type: "select", mode: "tidy" });
  state = transition(transition(state, { type: "start" }), { type: "pause" });
  state = transition(state, { type: "leave" });
  state = transition(state, { type: "select", mode: "minimal" });
  assert.equal(state.selected, "minimal");
  assert.deepEqual(state.sessions, {});
  assert.equal(state.lastCompleted, null);
});

test("both kitchen prototype formats migrate without losing saved work", () => {
  for (const roomFields of [{}, { room: "Kitchen" }]) {
    const state = readProgress(JSON.stringify({ version: 1, selected: "photoshoot", session: { ...roomFields, mode: "photoshoot", status: "paused" }, completed: { ...roomFields, mode: "minimal", at } }));
    assert.equal(state.version, 2);
    assert.equal(state.room, "kitchen");
    assert.deepEqual(state.sessions.kitchen, { mode: "photoshoot", status: "paused" });
    assert.deepEqual(state.lastCompleted, { room: "kitchen", mode: "minimal", at });
    assert.deepEqual(state.completions.kitchen, { minimal: at });
    assert.deepEqual(readProgress(JSON.stringify(state)), state);
  }
  const active = readProgress(JSON.stringify({ version: 1, selected: "tidy", session: { mode: "tidy", status: "active" } }));
  assert.equal(active.activeRoom, "kitchen");
});

test("corrupt storage recovers safely and repairs incomplete or duplicated queues", () => {
  for (const raw of [null, "broken", "null", "[]", '{"version":99}']) assert.deepEqual(readProgress(raw), initialProgress());
  const state = readProgress(JSON.stringify({ version: 2, selected: "unknown", room: "unknown", queue: ["carport", "carport", "unknown"], sessions: { kitchen: { mode: "unknown", status: "active" } }, activeRoom: "kitchen", completions: { kitchen: { minimal: "invalid" } } }));
  assert.equal(state.selected, "minimal");
  assert.equal(state.room, "carport");
  assert.equal(state.activeRoom, null);
  assert.equal(state.queue.length, roomOrder.length);
  assert.equal(new Set(state.queue).size, roomOrder.length);
  assert.deepEqual(state.completions, {});
});
