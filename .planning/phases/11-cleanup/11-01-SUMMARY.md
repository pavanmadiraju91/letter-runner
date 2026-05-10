---
phase: 11-cleanup
plan: 01
subsystem: screens
tags: [leaderboard, game-over, cleanup, simplification]
dependency-graph:
  requires: []
  provides: [simplified-game-over, no-leaderboard]
  affects: [12-speed-difficulty, 15-visual-polish]
tech-stack:
  added: []
  patterns: []
key-files:
  created: []
  modified: [src/screens/game-over.js, src/main.js]
  deleted: [src/systems/leaderboard.js]
decisions:
  - id: dec-1101-01
    summary: "Remove leaderboard entirely rather than refactoring"
    rationale: "Leaderboard was mock data; personal best stored separately in storage.js"
metrics:
  duration: "<1 min"
  completed: 2026-05-10
---

# Phase 11 Plan 01: Remove Leaderboard and Simplify Game-Over Summary

**One-liner:** Deleted leaderboard module and stripped name-entry flow from game-over screen, leaving clean score/PB/delta/restart display.

## What Was Done

### Task 1: Delete leaderboard module and strip references

- Deleted `src/systems/leaderboard.js` (83 lines of localStorage leaderboard logic)
- Rewrote `src/screens/game-over.js`:
  - Removed all leaderboard imports (`getLeaderboard`, `qualifiesForLeaderboard`, `insertScore`)
  - Removed `phase` state machine (`display` / `name-entry` / `done`)
  - Removed `initials` tracking and `onNameEntryKey` listener
  - Removed `isReadyToRestart()` export
  - Removed leaderboard table rendering (TOP 10 display)
  - Removed name entry UI (underscores, cursor blink, ENTER prompt)
  - Kept: dark overlay, GAME OVER title with glow, score display, personal best, delta, blinking play-again prompt
- Updated `src/main.js`:
  - Removed `isReadyToRestart` import
  - Changed GAME_OVER key handler to restart immediately (no gating)

**Net change:** -211 lines removed, +13 lines added (3 files changed, 1 deleted)

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. `ls src/systems/leaderboard.js` - file does not exist (deleted)
2. `grep -r "leaderboard" src/` - zero matches
3. `grep -r "initials|nameEntry|name-entry|isReadyToRestart" src/` - zero matches
4. `npx vite build` - passes cleanly (28 modules, 18KB gzipped)

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| dec-1101-01 | Remove leaderboard entirely | Was mock data; personal best already persisted separately via storage.js |

## Commits

| Hash | Message |
|------|---------|
| 601baf2 | feat(11-01): remove leaderboard and simplify game-over screen |

## Next Phase Readiness

- Game-over screen is now minimal and ready for visual polish (Phase 15)
- No blockers for Phase 12 (Speed & Difficulty)
- Personal best persistence via `storage.js` remains intact
