# Flow State Chores

A device-only kitchen PWA. Choose **Minimal plain**, **Photoshoot**, or **Tidy whitie**, start with one concrete action, and stop at the original victory condition.

## Scope

- Kitchen only until reviewed. Start screen, quest screen, quiet completion acknowledgment and resumable pause.
- Optional guidance; no checkboxes, scores, streaks, timers, notifications or automatic follow-on quests.
- Kitchen victory conditions live in `src/content/kitchen.ts`, separate from route guidance.
- English prototype matching the agreed copy. Mode names preserved exactly.

## Development

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run typecheck
```

The production build is a static Next.js export in `out/`. Serve that folder with a static HTTP server to test production; `next start` does not serve static exports. Service workers register only in production and need HTTPS (or localhost).

## Vercel, when ready

1. Import this GitHub repository into Vercel.
2. Use Node.js 22 or newer. `vercel.json` supplies the build command and `out` output directory.
3. Deploy. No environment variables, database, accounts or cron jobs are required.
4. Open online. Under **About this app**, wait for **Ready to use offline** before relying on it without a connection.
5. Install with the browser's install option, or Safari's **Share → Add to Home Screen** on iPhone.

This repository setup does not create a Vercel project or deploy anything.

## Local state and offline behavior

Versioned localStorage stores the selected mode, active/paused quest and last completion with its mode. Reloading resumes the active screen; an explicitly paused quest offers Resume. Invalid data falls back safely. If storage is blocked or full, the app remains usable and shows a warning. Data does not sync across devices and may be lost when browser data is cleared. Separate tabs are not live-synchronized.

The post-build script precaches the complete export, including hashed JavaScript and CSS. Each build has its own cache. Updates wait until existing app tabs close so cleaning is not interrupted by a reload. Reopen after closing app windows/tabs to activate an already-downloaded update. Offline availability depends on the browser retaining the cache.

## Prototype review

The app version shown under **About this app** is defined in `src/lib/version.ts` using `YY.M.D.N` (for example, `26.9.5.1`). Update it for each release: increment N for additional releases on the same date, or start at 1 on a new release date. It is source-controlled rather than calculated from the current date or a page load, so an offline copy reports the version it actually contains. This display version is separate from the npm package's semantic version.

On a phone: start each mode; expand guidance; pause and reload; resume; finish; reload after finishing; install and reopen offline. Check that the exact victory conditions are readable and nothing forces extra cleaning. The temporary container in Photoshoot remains a proposed method to review, not a change to its victory condition.

Room rotation is deferred until kitchen review. Completion of one mode must never imply completion of deeper modes.
