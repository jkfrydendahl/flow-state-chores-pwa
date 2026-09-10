# Flow State Chores

A lightweight household cleaning PWA, deployed on Vercel from `main`. Progress stays on the device. Choose a room and **Minimal plain**, **Photoshoot**, or **Tidy whitie**, start with one concrete action, and stop at the victory condition.

## How it works

- Eight areas: Kitchen, Living room, Bathroom, Bedroom, Bryggers, Entrance, Kids' rooms and Carport, each with three modes.
- Room selection and a quest screen, with optional route guidance and a quiet completion acknowledgment.
- One suggested room stays put until handled. Completion, **Already done** and **Skip for now** move that room to the end of the rotation. **Different room** changes your choice without changing the queue. There are no date resets, overdue tasks or accumulated debt.
- **Already done** records the displayed mode for the selected room. It does not imply that deeper modes are complete.
- Each room can keep one paused quest. Pause to choose another room, then return and resume. Leaving a quest unfinished clears only that room's paused quest and does not record completion.
- The last-used mode is remembered. A paused room retains its own mode.
- No scores, streaks, push notifications or automatically started follow-on quests.
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

## Vercel deployment

The production app is connected to this repository's `main` branch. Changes pushed to `main` trigger a Vercel deployment.

For a new deployment:

1. Import this GitHub repository, use the repository root, and select `main` as the production branch.
2. Use Node.js 22 or newer. `vercel.json` sets Framework Preset to **Other** (`framework: null`), Build Command to `npm run build`, and Output Directory to `out`.
3. Deploy the static export, including the generated service worker. No environment variables, database, app accounts or cron jobs are required.
4. Open online. Under **About this app**, wait for **Ready to use offline** before relying on it without a connection.
5. Install with the browser's install option, or Safari's **Share → Add to Home Screen** on iPhone.

The original prototype branch has been merged into `main`. The Next.js framework preset should not be combined with the `out` output directory: it can cause a missing `out/routes-manifest.json` error by looking for server build metadata in the static export.

## Local state and offline behavior

The versioned localStorage record stores the selected room and mode, rotation queue, room-specific sessions, and the latest completion timestamp for each room/mode, plus the last overall completion. Existing kitchen-only records migrate automatically, including records created before room names were stored. The original storage key is retained for compatibility. Reloading restores the active quest or the room-selection screen with saved paused work.

Invalid data falls back safely. If storage is blocked or full, the app remains usable and shows a warning. Data does not sync across devices and may be lost when browser data is cleared. Separate tabs are not live-synchronized; use one app window per device.

The post-build script precaches the app and its runtime assets, including CSS. The cache identifier is derived from the complete static export, so style changes also produce a new cache. Updates wait until existing app windows and tabs close so cleaning is not interrupted by a reload. Offline availability depends on the browser retaining the cache.

To pick up a deployed update:

1. Open the app online and leave it open briefly to download the new version.
2. Fully close the installed app and any browser tabs showing it.
3. Reopen and check the version under **About this app**.

A successful deployment does not immediately replace an already-open offline copy. Clearing browser data is not needed for normal updates and would remove saved progress.

## App version

The version shown under **About this app** is defined in `src/lib/version.ts` using `YY.M.D.N` without leading zeroes (for example, `26.9.10.1`). Increment N for additional releases on the same date, or start at 1 on a new release date. It is source-controlled rather than calculated from the current date or a page load, so an offline copy reports the version it actually contains. This display version is separate from the npm package's semantic version.

## Verification

Automated checks cover legacy migration, independent paused rooms, room rotation, mode-specific completions, malformed storage, timer deadlines, pause/resume, remembered preferences and expiry acknowledgment. The production build runs TypeScript checks and generates the static export and offline cache.

For phone checks: choose rooms and modes; expand guidance; pause two rooms and reload; resume one; finish or mark already done; skip a suggestion; install and reopen offline. The completion screen should name the completed room even after the rotation advances. Phone use has confirmed the app, offline use and screen-awake behavior work on the tested device; the compact mobile layout and spacing have also been reviewed. The chime was not audible in that test and remains a known minor limitation. A successful build alone does not verify behavior on every phone.

## Optional Five-minute Challenge

The **Five-minute Challenge** checkbox is directly on the room-selection screen, above Start. It is off by default and remembers your preference on this device.

The timer starts with the quest. Hide its digits or continue without it at any time. Pausing freezes its remaining time; resuming continues that same timer. Active timers use a saved deadline so reloads and background throttling do not restart five minutes. At expiry, the app offers Continue or Pause without marking anything complete. Continue dismisses the timer for this quest. Completion still requires the existing victory condition.

There is no background notification: if the phone is locked, the prompt appears when the app is active again. Browser retention of local data is still required. A timer already started with a paused quest keeps its own remaining time; the timer preference applies to new quests.

## Chime and screen awake

A single gentle two-tone chime marks timer expiry while the app is visible. Start/Resume unlocks browser audio; after a reload the app may show Enable chime for a fresh user interaction. Volume, silent mode and browser audio policies still apply. An expiry is acknowledged in saved timer state so reloads or resuming an expired timer do not repeatedly chime.

The single Keep screen awake during the challenge checkbox sits below the timer choice and is remembered across rooms. It is off by default for existing and new users. The app requests a screen wake lock only while a timer is running, and releases it on pause, expiry, completion, timer dismissal or navigation away. It tries to reacquire when returning to the visible app. The device can deny or release a wake lock (for example in low-power mode); the app shows a status if unavailable. This does not enable locked-screen/background alarms. Support still depends on the device and browser; the chime is optional feedback, not a guaranteed alarm.
