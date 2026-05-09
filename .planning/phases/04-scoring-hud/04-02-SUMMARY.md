---
phase: 04-scoring-hud
plan: 02
subsystem: hud
tags: [canvas, hud, rendering, ui]
completed: 2026-05-09
duration: ~1 minute

dependency_graph:
  requires: [03-01, 04-01]
  provides: [hud-rendering, visual-feedback]
  affects: [05-difficulty, 06-screens, 08-juice]

tech_stack:
  added: []
  patterns: [canvas-save-restore, bezier-heart-paths, event-driven-state-sync]

key_files:
  created:
    - src/systems/hud.js
  modified:
    - src/main.js

decisions:
  - id: D-0402-1
    decision: "Hearts drawn with bezier curves (two arcs) at 14px size, spaced 22px apart"
  - id: D-0402-2
    decision: "HUD uses ctx.save/restore to avoid polluting canvas state for other renderers"
  - id: D-0402-3
    decision: "Level state synced via LEVEL_UP event (future-proof for Phase 5)"

metrics:
  tasks_completed: 2
  tasks_total: 2
  commits: 2
  duration: "~1 minute"
---

# Phase 04 Plan 02: HUD Renderer Summary

**One-liner:** Canvas HUD rendering score/level/hearts with bezier-curve heart icons and event-driven level tracking

## What Was Built

### Task 1: HUD Renderer Module (src/systems/hud.js)
- `createHUD()` — subscribes to LEVEL_UP and GAME_RESTART events for level tracking
- `renderHUD(ctx, canvasWidth)` — renders three HUD elements every frame:
  - Score (top-left): white monospace "SCORE N" text
  - Level (top-center): white monospace "LV N" text
  - Lives (top-right): heart icons using bezier curve paths
- Hearts rendered filled (#ff3366 neon pink-red) for remaining lives, empty (#2a2a3a dark grey) for lost lives
- Uses ctx.save()/restore() to avoid polluting canvas state

### Task 2: Main.js Integration
- Imported createHUD/renderHUD
- createHUD() called during initialization
- renderHUD(ctx, w) placed after entity rendering, before Game Over overlay
- Correct z-order: game world -> HUD -> overlay

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created score.js stub for parallel plan dependency**
- **Found during:** Task 1
- **Issue:** Plan 04-01 (score system) runs in parallel and hadn't created src/systems/score.js yet. HUD imports getScore() from it.
- **Fix:** Created minimal stub exporting getScore() that returns 0. 04-01 will overwrite with full implementation.
- **Files modified:** src/systems/score.js
- **Commit:** 06902c5

## Commits

| # | Hash | Message |
|---|------|---------|
| 1 | 06902c5 | feat(04-02): add HUD renderer module |
| 2 | 20dcb14 | feat(04-02): wire HUD into main.js render function |

## Verification Results

All checks pass:
- Build completes without errors (vite build)
- renderHUD called in main.js (2 references: import + call)
- getLives used in hud.js (2 references: import + call)
- getScore used in hud.js (2 references: import + call)
- No state.js import in hud.js (no circular deps)
- Correct render order: HUD (line 73) before Game Over overlay (line 76)

## Next Phase Readiness

- Phase 5 (Difficulty): LEVEL_UP event subscription ready — currentLevel updates automatically
- Phase 6 (Screens): HUD renders unconditionally; screen overlays render after it
- Phase 8 (Juice): Heart animation hooks possible via drawHeart function
