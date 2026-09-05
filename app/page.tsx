"use client";
import { useEffect, useRef, useState } from "react";
import { modeOrder, quests, victoryConditions } from "../src/content/kitchen";
import { initialProgress, readProgress, storageKey, transition, type Action, type Progress } from "../src/lib/progress";
import { appVersion } from "../src/lib/version";

export default function Kitchen() {
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [ready, setReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const [finished, setFinished] = useState(false);
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
  const active = progress.session?.status === "active";
  const paused = progress.session?.status === "paused";
  const mode = progress.session?.mode ?? progress.selected;
  const quest = quests[mode];
  useEffect(() => { if (interacted.current) title.current?.focus(); }, [active, paused, finished]);
  function act(action: Action) {
    interacted.current = true;
    const next = transition(progress, action);
    setProgress(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setStorageWarning(false); }
    catch { setStorageWarning(true); }
    if (action.type === "complete") setFinished(true);
  }
  return <main className="shell">
    <header className="brand"><span className="brand-mark" aria-hidden="true">f.</span><span>Flow State</span></header>
    {storageWarning && <p className="notice" role="status">Progress can’t be saved on this device right now. You can keep going, but this session may be lost when you close the app.</p>}
    {!ready ? <p role="status">Opening your kitchen…</p> : finished ? (
      <section aria-labelledby="finished-title" className="finish">
        <div className="finish-mark" aria-hidden="true">✓</div><p className="eyebrow">Kitchen · {quest.name}</p>
        <h1 id="finished-title" ref={title} tabIndex={-1}>That’s enough.<br />You’re done.</h1>
        <p className="intro">The quest is complete. Leave the rest for another time.</p>
        <button className="quiet" onClick={() => setFinished(false)}>Back to kitchen</button>
      </section>
    ) : active ? (
      <section aria-labelledby="quest-title">
        <p className="eyebrow">Kitchen</p><h1 id="quest-title" ref={title} tabIndex={-1}>{quest.name}</h1>
        <div className="entry"><p className="eyebrow">Start here</p><p>{quest.entry}</p></div>
        <ol className="stages" aria-label="Your route">{quest.stages.map((stage, index) => <li key={stage.title}><span className="stage-number" aria-hidden="true">{index + 1}</span><span>{stage.title}</span></li>)}</ol>
        <details className="nudge" key={mode}><summary>Need a nudge?</summary>
          {quest.stages.map(stage => <div className="guidance" key={stage.title}><h2>{stage.title}</h2><p>{stage.guidance}</p><p className="feedback">{stage.feedback}</p></div>)}
          {mode === "tidy" && <details className="sub-details"><summary>Photoshoot route</summary>{quests.photoshoot.stages.map(stage => <div className="guidance" key={stage.title}><h2>{stage.title}</h2><p>{stage.guidance}</p></div>)}</details>}
        </details>
        <div className="victory"><h2>Your finish line</h2><p>{victoryConditions[mode]}</p></div>
        <p className="boundary">{quest.boundary}</p>
        <div className="actions"><button className="primary" onClick={() => act({ type: "complete", at: new Date().toISOString() })}>Done</button><button className="secondary" onClick={() => act({ type: "pause" })}>Pause</button></div>
      </section>
    ) : paused ? (
      <section aria-labelledby="paused-title">
        <p className="eyebrow">Kitchen · {quest.name}</p><h1 id="paused-title" ref={title} tabIndex={-1}>Right where<br />you left it.</h1>
        <p className="intro">Your quest is paused. Continue when it suits you.</p>
        <ol className="stages" aria-label="Your route">{quest.stages.map((stage, index) => <li key={stage.title}><span className="stage-number" aria-hidden="true">{index + 1}</span><span>{stage.title}</span></li>)}</ol>
        <button className="primary wide" onClick={() => act({ type: "resume" })}>Resume {quest.name}</button><p className="boundary">Skip what you’ve already done.</p>
        <button className="quiet" onClick={() => act({ type: "leave" })}>Leave unfinished and choose again</button>
      </section>
    ) : (
      <section aria-labelledby="kitchen-title">
        <p className="eyebrow">An easy place to start</p><h1 id="kitchen-title" ref={title} tabIndex={-1}>Kitchen</h1>
        <fieldset className="modes"><legend>What fits today?</legend>{modeOrder.map(id => <label className={`mode ${progress.selected === id ? "selected" : ""}`} key={id}><input type="radio" name="mode" value={id} checked={progress.selected === id} onChange={() => act({ type: "select", mode: id })} /><span><strong>{quests[id].name}</strong><span className="mode-description">{quests[id].description}</span></span></label>)}</fieldset>
        <div className="victory preview"><h2>Your finish line</h2><p>{victoryConditions[progress.selected]}</p></div>
        {progress.completed && <p className="completion-note" role="status">Last completed: {progress.completed.room} · {quests[progress.completed.mode].name} · {new Date(progress.completed.at).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</p>}
        <button className="primary wide" onClick={() => act({ type: "start", room: "Kitchen" })}>Start {quest.name}</button>
      </section>
    )}
    <footer><span>One room. A clear finish.</span><details><summary>About this app</summary><p>Version {appVersion}</p><p>Progress stays on this device. Clearing browser data removes it; it does not sync to other devices.</p><p>{offlineReady ? "Ready to use offline." : "Open online to prepare offline use."}</p><p>To install, use your browser’s install option. On iPhone, open in Safari and choose Share → Add to Home Screen.</p></details></footer>
    <noscript>This app needs JavaScript to remember your mode and quest. Enable it in your browser to start.</noscript>
  </main>;
}
