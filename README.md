# Deepwork — Vite + React + TypeScript

Quick start:

```bash
yarn install
yarn dev
# build
yarn build
# preview production build
yarn preview
```

Scripts:

- `dev` — run Vite dev server
- `build` — build production files
- `preview` — preview production build

Features

- Deep work counter: a focused-work timer with a default session length of 1 hour. Start/pause/reset without leaving or refreshing the app.
- Rest counter: a rest/break timer with a default length of 15 minutes.
- Session tracking: view how much time you've spent in deep work across sessions (visual summary like the example image).
- Settings popup: a `settings` button opens a modal where you can change the default deep work and rest durations.
- Smooth modern UI/UX: polished, responsive UI with smooth transitions and real-time updates so everything works without full-page refreshes.
- Accessible controls: keyboard- and screen-reader-friendly buttons and clear visual states for running/paused sessions.

Design notes

- The app follows a minimal, modern aesthetic as in the provided example image: large readable timer, clear primary action, and a compact visual history grid for deep-work sessions.
- All timers update live in the browser (no manual refresh required) and persist session totals while the app is open.

