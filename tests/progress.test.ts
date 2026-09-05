import test from "node:test";
import assert from "node:assert/strict";
import { initialProgress, readProgress, transition } from "../src/lib/progress.ts";
test("pause and reload retain the quest; completion ends it without escalation", () => {
  let state = transition(initialProgress, { type: "select", mode: "photoshoot" });
  state = transition(state, { type: "start", room: "Kitchen" });
  state = transition(state, { type: "pause" });
  state = readProgress(JSON.stringify(state));
  assert.deepEqual(state.session, { room: "Kitchen", mode: "photoshoot", status: "paused" });
  state = transition(state, { type: "resume" });
  state = transition(state, { type: "complete", at: "2026-09-05T12:00:00Z" });
  assert.equal(state.session, null);
  assert.equal(state.selected, "photoshoot");
  assert.deepEqual(readProgress(JSON.stringify(state)).completed, { room: "Kitchen", mode: "photoshoot", at: "2026-09-05T12:00:00Z" });
});
test("an active or paused quest cannot be accidentally replaced", () => {
  const active = transition(initialProgress, { type: "start", room: "Kitchen" });
  assert.deepEqual(transition(active, { type: "select", mode: "tidy" }), active);
  const paused = transition(active, { type: "pause" });
  assert.deepEqual(transition(paused, { type: "start", room: "Kitchen" }), paused);
});
test("corrupted or incompatible storage falls back safely", () => {
  for (const raw of [null, "broken", "null", "[]", '{"version":2}', '{"version":1,"selected":"unknown"}']) assert.deepEqual(readProgress(raw), initialProgress);
  const state = readProgress(JSON.stringify({ version: 1, selected: "minimal", session: { mode: "unknown", status: "active" }, completed: { mode: "tidy", at: "invalid" } }));
  assert.equal(state.session, null);
  assert.equal(state.completed, null);
});
test("leaving a quest allows a lighter mode without recording completion", () => {
  const started = transition(transition(initialProgress, { type: "select", mode: "tidy" }), { type: "start", room: "Kitchen" });
  const left = transition(transition(started, { type: "pause" }), { type: "leave" });
  assert.equal(left.completed, null);
  assert.equal(transition(left, { type: "select", mode: "minimal" }).selected, "minimal");
});

test("existing kitchen-only records keep their session and completion", () => {
  const legacy = readProgress(JSON.stringify({ version: 1, selected: "photoshoot", session: { mode: "photoshoot", status: "paused" }, completed: { mode: "minimal", at: "2026-09-05T12:00:00Z" } }));
  assert.deepEqual(legacy.session, { room: "Kitchen", mode: "photoshoot", status: "paused" });
  assert.equal(legacy.completed?.room, "Kitchen");
  assert.equal(legacy.completed?.mode, "minimal");
});
test("completion records the actual quest room across pause and reload", () => {
  let state = transition(initialProgress, { type: "start", room: "Bathroom" });
  state = readProgress(JSON.stringify(transition(state, { type: "pause" })));
  state = transition(state, { type: "resume" });
  state = transition(state, { type: "complete", at: "2026-09-05T12:00:00Z" });
  assert.equal(readProgress(JSON.stringify(state)).completed?.room, "Bathroom");
});
