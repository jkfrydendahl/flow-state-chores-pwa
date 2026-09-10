"use client";
import { useEffect, useRef, useState } from "react";
import { modeOrder } from "../src/content/kitchen";
import { rooms, roomOrder } from "../src/content/rooms";
import { roomQuests } from "../src/content/quests";
import { initialProgress, readProgress, storageKey, transition, currentMode, type Action, type Progress } from "../src/lib/progress";
import { remaining } from "../src/lib/engagement";
import { useTimerFeedback } from "../src/hooks/useTimerFeedback";
import { appVersion } from "../src/lib/version";

export default function Chores() {
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [now, setNow] = useState(0);
  const [ready, setReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [choosingRoom, setChoosingRoom] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const interacted = useRef(false);
  useEffect(() => {
    try { setProgress(readProgress(localStorage.getItem(storageKey))); }
    catch { setStorageWarning(true); }
    setReady(true);
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").then(() => navigator.serviceWorker.ready)
        .then(() => setOfflineReady(true)).catch(() => setOfflineReady(false));
    }
  }, []);
  const room = progress.room;
  const active = progress.activeRoom !== null;
  const session = progress.sessions[room];
  const mode = currentMode(progress);
  const quest = roomQuests[room][mode];
  const done = progress.lastCompleted;
  const timer = active ? session?.timer : undefined;
  const milliseconds = timer ? remaining(timer, now || Date.now()) : 0;
  const feedback = useTimerFeedback(Boolean(timer && milliseconds > 0 && progress.engagement.keepAwake));
  const chimeGuard = useRef<string | null>(null);
  useEffect(() => {
    if (!timer || milliseconds > 0 || timer.notified || document.visibilityState !== "visible") return;
    const key = `${room}:${timer.endsAt}`;
    if (chimeGuard.current === key) return;
    chimeGuard.current = key;
    feedback.playChime();
    const next = transition(progress, { type: "timer-notified" });
    setProgress(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { setStorageWarning(true); }
  }, [timer, milliseconds, room, progress, feedback.playChime]);
  const seconds = Math.ceil(milliseconds / 1000);
  const timerText = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  useEffect(() => {
    if (!timer) return;
    const tick = () => setNow(Date.now());
    tick();
    const interval = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => { window.clearInterval(interval); document.removeEventListener("visibilitychange", tick); };
  }, [timer]);
  useEffect(() => { if (interacted.current && !choosingRoom) title.current?.focus(); }, [active, finished, room, choosingRoom]);
  function act(action: Action) {
    if (action.type === "start" || action.type === "resume") {
      if (action.type === "resume" ? session?.timer : progress.engagement.timer) feedback.enableChime();
      chimeGuard.current = null;
    }
    interacted.current = true;
    setNow(Date.now());
    const next = transition(progress, action);
    setProgress(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setStorageWarning(false); }
    catch { setStorageWarning(true); }
    if (action.type === "complete" || action.type === "already-done") setFinished(true);
    if (action.type === "room") setChoosingRoom(false);
  }
  const wakeControl = <label className="timer-option wake-option">
    <input type="checkbox" checked={progress.engagement.keepAwake} onChange={e => act({ type: "engagement", key: "keepAwake", value: e.target.checked })} />
    <span><strong>Keep screen awake during the challenge</strong><span className="mode-description">Remembered across rooms. Ends when the timer ends or you pause.</span></span>
  </label>;
  const timerControl = <label className="timer-option">
    <input type="checkbox" checked={progress.engagement.timer} onChange={e => act({ type: "engagement", key: "timer", value: e.target.checked })} />
    <span><strong>Five-minute Challenge</strong><span className="mode-description">Give it five minutes. A gentle chime marks the end; you don’t need to finish the room.</span></span>
  </label>;
  const date = (at: string) => new Date(at).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  return <main className="shell">
    <header className="brand"><span className="brand-mark" aria-hidden="true">f.</span><span>Flow State Chores</span></header>
    {storageWarning && <p className="notice" role="status">Progress can’t be saved on this device right now. You can keep going, but this session may be lost when you close the app.</p>}
    {!ready ? <p role="status">Opening your quests…</p> : finished && done ? (
      <section aria-labelledby="finished-title" className="finish">
        <div className="finish-mark" aria-hidden="true">✓</div><p className="eyebrow">{rooms[done.room].name} · {roomQuests[done.room][done.mode].name}</p>
        <h1 id="finished-title" ref={title} tabIndex={-1}>Quest complete.</h1>
        <p className="intro">You’ve reached the finish line.</p>
        <button className="quiet" onClick={() => setFinished(false)}>Back to rooms</button>
      </section>
    ) : active ? (
      <section aria-labelledby="quest-title">
        <p className="eyebrow">{rooms[room].name}</p><h1 id="quest-title" ref={title} tabIndex={-1}>{quest.name}</h1>
        <div className="entry"><p className="eyebrow">Start here</p><p>{quest.entry}</p></div>
        {timer && <div className="start-timer">
          {milliseconds > 0 ? <>
            <div className="timer-row"><h2>Five-minute Challenge</h2>{!progress.engagement.hideTimer && <span className="timer-digits" role="timer" aria-label="Time remaining" aria-live="off">{timerText}</span>}</div>
            <p className="boundary">Just a starting stretch. Your finish line stays the same.</p>
            {progress.engagement.keepAwake && <p className="boundary" role="status">{feedback.wakeStatus === "active" ? "Keeping the screen awake." : feedback.wakeStatus === "unavailable" ? "Your browser couldn’t keep the screen awake. It may lock as usual." : "Requesting screen awake…"}</p>}
            {!feedback.soundReady && <button className="quiet" onClick={feedback.enableChime}>Enable chime</button>}
            <button className="quiet" onClick={() => act({ type: "engagement", key: "hideTimer", value: !progress.engagement.hideTimer })}>{progress.engagement.hideTimer ? "Show timer" : "Hide timer"}</button>
            <button className="quiet timer-remove" onClick={() => act({ type: "continue" })}>Continue without timer</button>
          </> : <>
            <div role="status"><h2>Five minutes are up.</h2><p>Keep going if it feels right, or pause here.</p></div>
            <div className="actions"><button className="secondary" onClick={() => act({ type: "continue" })}>Continue</button><button className="secondary" onClick={() => act({ type: "pause" })}>Pause</button></div>
          </>}
        </div>}
        <ol className="stages" aria-label="Your route">{quest.stages.map((stage, index) => <li key={stage.title}><span className="stage-number" aria-hidden="true">{index + 1}</span><span>{stage.title}</span></li>)}</ol>
        <details className="nudge" key={`${room}-${mode}`}><summary>Need a nudge?</summary>
          {quest.stages.map(stage => <div className="guidance" key={stage.title}><h2>{stage.title}</h2><p>{stage.guidance}</p><p className="feedback">{stage.feedback}</p></div>)}
          {mode === "tidy" && <details className="sub-details"><summary>Photoshoot route</summary>{roomQuests[room].photoshoot.stages.map(stage => <div className="guidance" key={stage.title}><h2>{stage.title}</h2><p>{stage.guidance}</p></div>)}</details>}
        </details>
        <div className="victory"><h2>Your finish line</h2><p>{rooms[room].victory[mode]}</p></div>
        <p className="boundary">{quest.boundary}</p>
        <div className="actions"><button className="primary" onClick={() => act({ type: "complete", at: new Date().toISOString() })}>Done</button><button className="secondary" onClick={() => act({ type: "pause" })}>Pause</button></div>
      </section>
    ) : (
      <section aria-labelledby="room-title">
        <p className="eyebrow">{session ? "A quest to come back to" : room === progress.queue[0] ? "Your suggested room" : "Your choice"}</p>
        <h1 id="room-title" ref={title} tabIndex={-1}>{rooms[room].name}</h1>
        <button className="quiet room-toggle" aria-expanded={choosingRoom} aria-controls="room-picker" onClick={() => setChoosingRoom(!choosingRoom)}>{choosingRoom ? "Close room list" : "Different room"}</button>
        {choosingRoom && <div className="room-picker" id="room-picker" role="group" aria-label="Choose a room">{roomOrder.map(id => <button className={`room-option ${id === room ? "chosen" : ""}`} key={id} aria-pressed={id === room} onClick={() => act({ type: "room", room: id })}><span>{rooms[id].name}</span><span className="room-status">{progress.sessions[id] ? "Paused" : id === progress.queue[0] ? "Suggested" : ""}</span></button>)}</div>}
        {session ? <div className="paused-card">
          <h2>{quest.name} · Paused</h2><p>Continue where you left off. Skip what you’ve already done.</p>
          <ol className="stages" aria-label="Your saved route">{quest.stages.map((stage, index) => <li key={stage.title}><span className="stage-number" aria-hidden="true">{index + 1}</span><span>{stage.title}</span></li>)}</ol>
          {wakeControl}
          <button className="primary wide" onClick={() => act({ type: "resume" })}>Resume {quest.name}</button>
          <button className="quiet" onClick={() => act({ type: "leave" })}>Leave unfinished and choose again</button>
        </div> : <>
          <fieldset className="modes"><legend>What fits today?</legend>{modeOrder.map(id => <label className={`mode ${progress.selected === id ? "selected" : ""}`} key={id}><input type="radio" name="mode" value={id} checked={progress.selected === id} onChange={() => act({ type: "select", mode: id })} /><span><strong>{roomQuests[room][id].name}</strong><span className="mode-description">{roomQuests[room][id].description}</span></span></label>)}</fieldset>
          <div className="victory preview"><h2>Your finish line</h2><p>{rooms[room].victory[mode]}</p></div>
          {timerControl}
          {wakeControl}
          <button className="primary wide" onClick={() => act({ type: "start" })}>Start {quest.name}</button>
        </>}
        <div className="secondary-actions"><button className="quiet" onClick={() => act({ type: "already-done", at: new Date().toISOString() })}>Already done</button><button className="quiet" onClick={() => act({ type: "skip" })}>Skip for now</button></div>
        <p className="boundary">Already done records {quest.name} for {rooms[room].name}. Skipping keeps paused work.</p>
        {done && <p className="completion-note" role="status">Last completed: {rooms[done.room].name} · {roomQuests[done.room][done.mode].name} · {date(done.at)}</p>}
      </section>
    )}
    <footer><span>One room. A clear finish.</span><details><summary>About this app</summary><p>Version {appVersion}</p><p>Progress stays on this device. Clearing browser data removes it; it does not sync to other devices.</p><p>The suggested room stays until you complete it, mark it done or skip it. There are no overdue quests. Choose any room when something else needs attention.</p><p>{offlineReady ? "Ready to use offline." : "Open online to prepare offline use."}</p><p>To install, use your browser’s install option. On iPhone, open in Safari and choose Share → Add to Home Screen.</p></details></footer>
    <noscript>This app needs JavaScript to remember your mode and quest. Enable it in your browser to start.</noscript>
  </main>;
}
