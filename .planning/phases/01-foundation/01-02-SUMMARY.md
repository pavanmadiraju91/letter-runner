# Phase 01 Plan 02: Game Loop and Event Bus Summary

## One-liner
60fps game loop with delta-time, DPR-aware canvas, and pub/sub event bus wired in main.js bootstrap.

## What Was Done

### Task 1: Event Bus and DPR-aware Canvas Modules
- Created `src/core/events.js` - lightweight pub/sub with on/off/emit/clear
- Created `src/core/canvas.js` - DPR-aware canvas init with automatic resize handling
- Canvas emits `CANVAS_RESIZE` event through event bus on window resize
- Commit: `717a1f4`

### Task 2: Game Loop and Main.js Wiring
- Created `src/core/game-loop.js` - requestAnimationFrame loop with delta-time clamped to MAX_DT
- Replaced `src/main.js` with full bootstrap wiring all core modules
- Debug overlay shows viewport dimensions and DPR multiplier
- Commit: `e2b688c`

## Verification

- Dev server starts and serves index.html with module imports
- All ES module imports resolve correctly via Vite
- Canvas module exports: initCanvas, getCtx, getWidth, getHeight
- Game loop exports: startLoop, stopLoop
- Event bus exports: events (singleton with on/off/emit/clear)
- main.js imports from all three core modules and bootstraps the game

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| D-0102-1 | Event bus uses Map for listener storage | O(1) event name lookup, clean iteration |
| D-0102-2 | Delta-time clamped to GAME.MAX_DT (1/30s) | Prevents spiral of death on tab-away |
| D-0102-3 | Canvas ctx.imageSmoothingEnabled = false | Crisp pixel rendering for game graphics |

## Key Files

### Created
- `src/core/events.js` - Pub/sub event bus singleton
- `src/core/canvas.js` - DPR-aware canvas with resize handling
- `src/core/game-loop.js` - requestAnimationFrame loop with delta-time

### Modified
- `src/main.js` - Full rewrite as application bootstrap

## Architecture Notes

### Module Dependency Graph
```
main.js
  ├── core/canvas.js → core/events.js
  ├── core/game-loop.js → config.js
  ├── core/events.js
  └── config.js
```

### Event Flow
1. `initCanvas()` called, sets up resize listener
2. `CANVAS_READY` emitted with initial dimensions
3. `startLoop(update, render)` begins rAF loop
4. `LOOP_START` emitted to signal game is running
5. On window resize: canvas rescales, emits `CANVAS_RESIZE`

## Next Phase Readiness

Phase 1 (Foundation) is now complete. Ready for Phase 2 (Movement & Input):
- Game loop provides delta-time for frame-independent movement
- Event bus ready for input system to publish key events
- Canvas module provides dimensions for bounds checking
- No blockers identified

## Metrics

- **Started:** 2026-05-09T21:04:01Z
- **Completed:** 2026-05-09T21:04:35Z
- **Duration:** ~34 seconds
- **Tasks:** 2/2
- **Commits:** 2 (task commits) + 1 (docs)
