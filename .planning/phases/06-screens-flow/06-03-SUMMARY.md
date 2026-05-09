---
phase: 06-screens-flow
plan: 03
subsystem: screens
tags: [game-over, leaderboard, name-entry, canvas-ui]
dependency-graph:
  requires: ["06-01"]
  provides: ["game-over-screen", "leaderboard-module", "name-entry-system"]
  affects: ["07-visual-style", "08-particles"]
tech-stack:
  added: []
  patterns: ["module-level-state", "event-driven-ui-phase", "keydown-listener-scoping"]
key-files:
  created:
    - src/systems/leaderboard.js
    - src/screens/game-over.js
  modified:
    - src/main.js
decisions:
  - id: "D-0603-1"
    desc: "Separate keydown listener for name entry (not extending core input.js)"
  - id: "D-0603-2"
    desc: "Phase-based game-over screen ('display'|'name-entry'|'done') controls flow"
  - id: "D-0603-3"
    desc: "isReadyToRestart() export gates KEY_PRESS to prevent restart during name entry"
metrics:
  duration: "~1.5 minutes"
  completed: "2026-05-09"
---

# Phase 6 Plan 3: Game Over Screen Summary

**One-liner:** Full game-over screen with score/PB delta, mocked top-10 leaderboard with localStorage persistence, and 3-char name entry gating restart.

## What Was Done

### Task 1: Leaderboard data module
- Created `src/systems/leaderboard.js` with hardcoded default top-10 board
- `getLeaderboard()` returns sorted descending top 10
- `qualifiesForLeaderboard(score)` checks if score exceeds rank 10
- `insertScore(initials, score)` adds entry, sorts, trims to 10, persists to localStorage
- All localStorage access wrapped in try/catch for private browsing compatibility

### Task 2: Game Over screen with name entry and main.js wiring
- Created `src/screens/game-over.js` with full canvas rendering:
  - Dark overlay (85% black)
  - "GAME OVER" title, final score, personal best with delta (+green/-red)
  - Top-10 leaderboard with rank numbers, initials, scores
  - Player's entry highlighted in cyan when inserted
  - Name entry mode: 3-char initials with cursor blink, Backspace/Enter support
  - "Press any key to play again" blink after name entry completes
- Modified `src/main.js`:
  - Imported and initialized game-over screen
  - Replaced inline game-over overlay with `renderGameOverScreen()` call
  - Added `updateGameOverScreen(dt)` in GAME_OVER state
  - Gated restart on `isReadyToRestart()` to block restart during name entry
- Name entry uses separate `window.addEventListener('keydown', ...)` to capture Backspace/Enter (core input.js only emits KEY_PRESS for A-Z)

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| D-0603-1 | Separate keydown listener for name entry | Core input.js only handles A-Z; extending it would couple game input to UI-specific keys |
| D-0603-2 | Phase-based screen flow ('display'/'name-entry'/'done') | Clean state machine within game-over screen, each phase has distinct rendering and input handling |
| D-0603-3 | isReadyToRestart() gates KEY_PRESS restart | Prevents accidental restart when typing initials; only allows restart after name entry completes |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Input system only handles A-Z keys**
- **Found during:** Task 2
- **Issue:** Core input.js emits KEY_PRESS only for A-Z single-letter keys; name entry needs Backspace and Enter
- **Fix:** Added dedicated keydown listener in game-over.js, scoped to name-entry phase, attached/detached on state transitions
- **Files modified:** src/screens/game-over.js
- **Commit:** 87ae81c

## Verification

1. Build passes cleanly (`npx vite build --mode development` - 0 errors)
2. Game-over triggers dark overlay with title, score, personal best, delta
3. Leaderboard module exports 3 functions (verified via grep)
4. Name entry phase blocks restart via `isReadyToRestart()` gate
5. All localStorage operations wrapped in try/catch

## Next Phase Readiness

- Game over screen complete with full flow
- Phase 6 (Screens & Flow) is now fully complete (3/3 plans done)
- Ready for Phase 7 (Visual Style) - game-over screen can receive visual polish
