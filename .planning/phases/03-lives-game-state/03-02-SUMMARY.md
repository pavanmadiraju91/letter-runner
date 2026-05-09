---
phase: 03-lives-game-state
plan: 02
subsystem: game-state
tags: [state-machine, game-loop, restart, canvas]

# Dependency graph
requires:
  - phase: 03-lives-game-state/01
    provides: "GAME_OVER event emitted when lives reach zero"
  - phase: 02-movement-input
    provides: "KEY_PRESS event from input system, obstacle pool, spawner"
provides:
  - "State machine with PLAYING/GAME_OVER states and event-driven transitions"
  - "Instant game restart on any keypress during GameOver"
  - "Game Over overlay rendering (dark overlay + text)"
  - "STATE_CHANGE event for other systems to react to state transitions"
affects: [04-scoring-hud, 06-screens-flow]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Event-driven state machine with guard clauses", "Update loop gated by state check"]

key-files:
  created: [src/core/state.js]
  modified: [src/main.js]

key-decisions:
  - "D-0302-1: Module-level closure for state (consistent with lives, input systems)"
  - "D-0302-2: No MENU state yet — deferred to Phase 6 (Screens & Flow)"
  - "D-0302-3: Restart is pure state reset (no reload) for instant feedback"

patterns-established:
  - "State guard at top of update(): if (getState() !== STATES.PLAYING) return"
  - "requestRestart() as action emitter — decouples input from state transition"

# Metrics
duration: 1min
completed: 2026-05-09
---

# Phase 3 Plan 2: Game State Machine Summary

**Minimal state machine (Playing/GameOver) with event-driven transitions and instant keypress restart**

## Performance

- **Duration:** ~1 min
- **Started:** 2026-05-09T21:33:17Z
- **Completed:** 2026-05-09T21:34:11Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- State machine cleanly separates Playing from GameOver with transition guards
- Update loop freezes during GameOver (obstacles stop, render continues for overlay)
- Any keypress during GameOver triggers instant restart (lives reset, obstacles cleared, spawner reset)
- Game Over overlay with semi-transparent dark background and centered text

## Task Commits

Each task was committed atomically:

1. **Task 1: Create state machine module** - `5a65c9b` (feat)
2. **Task 2: Wire state machine into main.js with restart logic** - `4dcc7e4` (feat)

## Files Created/Modified
- `src/core/state.js` - State machine with STATES enum, createStateMachine, getState, requestRestart
- `src/main.js` - Imports state/lives systems, guards update loop, adds restart logic and GameOver overlay

## Decisions Made
- [D-0302-1] Module-level closure for state variable (consistent pattern with lives.js, input.js)
- [D-0302-2] No MENU state — game starts directly in PLAYING; menu deferred to Phase 6
- [D-0302-3] Restart is pure state reset (resetLives + clear pool + timer=0 + requestRestart) — no page reload, satisfies UI-13 under 1 second requirement

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- STATE_CHANGE event available for HUD to react (Phase 4 scoring)
- getState() available for any system to check current state
- Phase 6 can extend STATES with MENU, PAUSED etc. by adding to the enum and new event subscriptions
- Lives + state machine complete — Phase 3 Plan 3 (wrong-key penalty) can proceed

---
*Phase: 03-lives-game-state*
*Completed: 2026-05-09*
