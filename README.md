# Flow State Chores

A device-only household PWA. Choose a room and **Minimal plain**, **Photoshoot**, or **Tidy whitie**, start with one concrete action, and stop at the victory condition.

## How it works

- Eight areas: Kitchen, Living room, Bathroom, Bedroom, Bryggers, Entrance, Kids' rooms and Carport, each with three modes.
- Room selection and a quest screen, with optional route guidance and a quiet completion acknowledgment.
- One suggested room stays put until handled. Completion, **Already done** and **Skip for now** move that room to the end of the rotation. **Different room** changes your choice without changing the queue. There are no date resets, overdue tasks or accumulated debt.
- **Already done** records the displayed mode for the selected room. It does not imply that deeper modes are complete.
- Each room can keep one paused quest. Pause to choose another room, then return and resume. Leaving a quest unfinished clears only that room's paused quest and does not record completion.
- The last-used mode is remembered. A paused room retains its own mode.
- No scores, streaks, notifications or automatically started follow-on quests.
- Victory conditions live in `src/content/rooms.ts`; practical guidance lives separately in `src/content/quests.ts` and `src/content/kitchen.ts`.
- English interface. The three mode names are preserved exactly.

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

Work remains on `codex/kitchen-prototype` until v1 is ready. Repository changes do not merge the PR, create a Vercel project or deploy the app.

## Local state and offline behavior

The versioned localStorage record stores the selected room and mode, rotation queue, room-specific sessions, and the latest completion timestamp for each room/mode, plus the last overall completion. Existing kitchen-only records migrate automatically, including records created before room names were stored. The original storage key is retained for compatibility. Reloading restores the active quest or the room-selection screen with saved paused work.

Invalid data falls back safely. If storage is blocked or full, the app remains usable and shows a warning. Data does not sync across devices and may be lost when browser data is cleared. Separate tabs are not live-synchronized; use one app window per device.

The post-build script precaches the app and its runtime assets. Each build has its own cache. Updates wait until existing app tabs close so cleaning is not interrupted by a reload. Reopen after closing app windows/tabs to activate an already-downloaded update. Offline availability depends on the browser retaining the cache.

## App version

The version shown under **About this app** is defined in `src/lib/version.ts` using `YY.M.D.N` without leading zeroes (for example, `26.9.6.1`). Increment N for additional releases on the same date, or start at 1 on a new release date. It is source-controlled rather than calculated from the current date or a page load, so an offline copy reports the version it actually contains. This display version is separate from the npm package's semantic version.

## Verification

Automated progress checks cover legacy migration, independent paused rooms, full rotation, skipping, manual selection, mode-specific completions and recovery from malformed storage. The production build checks all room content and TypeScript.

For phone checks: choose rooms and modes; expand guidance; pause two rooms and reload; resume one; finish or mark already done; skip a suggestion; install and reopen offline. The completion screen should name the completed room even after the rotation advances. No phone or browser visual testing is implied by a successful build.

## Optional engagement

Expand **Make it engaging** before starting a quest. The five-minute start and the relevant room/mode challenge are independently optional and off by default. Choices are remembered on the device. Minimal plain gets a known-home rhythm, Photoshoot gets a concrete first visible win, and Tidy whitie gets a section-by-section route challenge.

The timer starts with the quest. Hide its digits or continue without it at any time. Pausing freezes its remaining time; resuming continues that same timer. Active timers use a saved deadline so reloads and background throttling do not restart five minutes. At expiry, the app offers Continue or Pause without marking anything complete. Continue dismisses the timer for this quest. Completion still requires the existing victory condition.

There is no alarm or background notification: if the phone is locked, the prompt appears when the app is active again. Browser retention of local data is still required. A timer already started with a paused quest keeps its own remaining time; the timer preference applies to new quests.
