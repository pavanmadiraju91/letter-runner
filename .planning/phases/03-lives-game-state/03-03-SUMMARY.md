---
phase: 03-lives-game-state
plan: 03
subsystem: input
tags: [input, penalty, visibility, pause, game-loop]

# Dependency graph
requires:
  - phase: 03-01
    provides: "Lives system and GAME_OVER event"
  - phase: 02-03
    provides: "Input system (KEY_PRESS) and matcher (danger zone logic)"
provides:
  - "Wrong-key detection (WRONG_KEY event) from matcher"
  - "Input penalty delay system (level-gated)"
  - "Visibility-change pause/resume (TECH-09)"
  - "resumeLoop() export from game-loop"
  - "resetInput() for game restart"
affects: ["05-difficulty-progression", "06-screens-flow", "04-scoring-hud"]

# Tech tracking
tech-stack:
  added: []
  patterns: ["event-driven state tracking (gameState via STATE_CHANGE)", "level-gated penalty system"]

key-files:
  created: []
  modified: ["src/systems/input.js", "src/systems/matcher.js", "src/core/game-loop.js", "src/config.js"]

key-decisions:
  - "D-0303-1: Track game state via STATE_CHANGE events rather than importing state.js directly (avoids circular deps and parallel plan conflicts)"
  - "D-0303-2: WRONG_KEY only emits when obstacles exist in danger zone (prevents false penalties on empty screen)"
  - "D-0303-3: resumeLoop() reuses stored updateFn/renderFn so input.js needs no access to main.js refs"

patterns-established:
  - "Level-gated mechanics: check currentLevel against config threshold before applying"
  - "Event-based state tracking: subscribe to STATE_CHANGE to know game state without direct import"

# Metrics
duration: 2min
completed: 2026-05-09
---

# Phase 3 Plan 03: Wrong-Key Penalty & Focus Pause Summary

**Level-gated wrong-key input delay (300ms at level 4+) and tab-visibility pause/resume with game-over guard**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-09T21:33:15Z
- **Completed:** 2026-05-09T21:34:50Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Wrong-key detection in matcher emits WRONG_KEY only when valid targets exist in danger zone
- Input penalty system locks keyboard for 300ms at level 4+ (zero penalty at levels 1-3)
- Game automatically pauses on tab blur and resumes on focus (unless game-over)
- resumeLoop() export enables clean pause/resume without needing update/render refs

## Task Commits

Each task was committed atomically:

1. **Task 1: Add wrong-key detection to matcher and penalty delay to input** - `5250cf1` (feat)
2. **Task 2: Add visibility-change pause/resume** - `2966da2` (feat)

## Files Created/Modified
- `src/config.js` - Added WRONG_KEY_DELAY (0.3) and WRONG_KEY_PENALTY_LEVEL (4)
- `src/systems/matcher.js` - Emits WRONG_KEY event when no match found but obstacles in zone
- `src/systems/input.js` - Wrong-key penalty delay, visibility pause/resume, level tracking, resetInput()
- `src/core/game-loop.js` - Added resumeLoop() export for pause/resume without start params

## Decisions Made
- [D-0303-1] Tracked game state via STATE_CHANGE events rather than importing state.js directly. This avoids: (a) circular dependency, (b) conflict with parallel plan 03-02 that creates state.js.
- [D-0303-2] WRONG_KEY only fires when obstacles exist in danger zone. Pressing keys on an empty screen has no penalty (fair gameplay).
- [D-0303-3] resumeLoop() reuses already-stored updateFn/renderFn from startLoop(). This means input.js can resume without accessing main.js's update/render references.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used event-based state tracking instead of direct state.js import**
- **Found during:** Task 2 (visibility-change pause/resume)
- **Issue:** Plan specified "import getState and STATES from state.js" but state.js doesn't exist yet (created by parallel plan 03-02)
- **Fix:** Subscribe to STATE_CHANGE events and track gameState locally. Default to 'playing' so the system works before state machine exists.
- **Files modified:** src/systems/input.js
- **Verification:** Build passes, resume logic correctly checks gameState === 'playing'
- **Committed in:** 2966da2 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Essential fix for parallel execution. Same behavior, no scope creep.

## Issues Encountered
None - both tasks executed cleanly after the state.js import was resolved.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- WRONG_KEY event ready for Phase 8 (particle effects on wrong key)
- LEVEL_UP subscription ready for Phase 5 (difficulty progression)
- resetInput() ready for restart flow in main.js (plan 03-02)
- GAME_PAUSED/GAME_RESUMED events available for HUD display (Phase 4)
- resumeLoop() available for any system needing to restart the loop

---
*Phase: 03-lives-game-state*
*Completed: 2026-05-09*
