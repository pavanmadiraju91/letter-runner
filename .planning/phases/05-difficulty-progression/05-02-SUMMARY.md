---
phase: 05-difficulty-progression
plan: 02
subsystem: gameplay-mechanics
tags: [difficulty, spawner, game-loop, dynamic-scaling]
dependency-graph:
  requires: ["05-01"]
  provides: ["dynamic-difficulty-wiring", "speed-scaling-per-level", "tall-obstacles"]
  affects: ["06-01", "07-01"]
tech-stack:
  added: []
  patterns: ["params-object-passing", "per-frame-difficulty-query"]
key-files:
  created: []
  modified:
    - src/systems/spawner.js
    - src/main.js
decisions:
  - id: "D-0502-1"
    decision: "difficultyParams object passed to spawner (not individual scalars)"
    rationale: "Single object pass is cleaner and extensible for future params"
  - id: "D-0502-2"
    decision: "getDifficultyParams() called each frame in update()"
    rationale: "Level can change mid-frame via LEVEL_UP event; fresh params ensure instant response"
  - id: "D-0502-3"
    decision: "Tall obstacles use 40% random chance when tallObstacles=true"
    rationale: "Variety without making every obstacle tall; keeps gameplay interesting"
metrics:
  duration: "~59 seconds"
  completed: "2026-05-09"
---

# Phase 05 Plan 02: Spawner & Main Loop Difficulty Wiring Summary

**Dynamic difficulty params wired into spawner and game loop for per-level speed/spawn/height scaling**

## What Was Done

### Task 1: Refactor spawner to accept dynamic difficulty parameters
- Changed `updateSpawner` signature from `(spawner, dt, scrollSpeed, groundY)` to `(spawner, dt, difficultyParams, groundY)`
- Replaced `GAME.SPAWN_INTERVAL` with `difficultyParams.spawnInterval`
- Replaced `GAME.MAX_OBSTACLES` with `difficultyParams.maxObstacles`
- Obstacle speed now set from `difficultyParams.scrollSpeed`
- Added tall obstacle logic: 40% chance of 1.5x height when `difficultyParams.tallObstacles` is true
- Kept MIN_OBSTACLE_GAP guard (display concern, not difficulty)
- Left letter uniqueness logic untouched (modified separately by plan 05-03)
- Commit: `8e42f2f`

### Task 2: Wire difficulty system into main.js game loop
- Added imports for `createDifficulty`, `resetDifficulty`, `getDifficultyParams`
- Called `createDifficulty()` and `resetDifficulty()` during initialization
- `update(dt)` now calls `getDifficultyParams()` each frame, passing params to ground and spawner
- Ground scroll speed matches obstacle speed (visual consistency guaranteed)
- `restartGame()` calls `resetDifficulty()` to return to level 1
- Commit: `fbb34aa`

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| D-0502-1 | difficultyParams object passed to spawner (not individual scalars) | Single object pass is cleaner and extensible for future params |
| D-0502-2 | getDifficultyParams() called each frame in update() | Level can change mid-frame; fresh params ensure instant response |
| D-0502-3 | Tall obstacles use 40% random chance when tallObstacles=true | Variety without making every obstacle tall |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. `npx vite build` succeeds with no errors
2. Level 1: scrollSpeed=140, maxObstacles=1, spawnInterval=2.5 (from TIERS[0])
3. After 10 destroys: LEVEL_UP emits, params jump to scrollSpeed=180, maxObstacles=2
4. Level 4+: tallObstacles=true, 40% of new obstacles get 1.5x height
5. Ground and obstacles scroll at same speed (both use params.scrollSpeed)
6. Restart resets difficulty to level 1 defaults
7. MAX_OBSTACLES_CAP=4 enforced in difficulty params

## Next Phase Readiness

- Plan 05-03 (letter uniqueness guarantees) can run/has run in parallel - no conflicts
- Phase 6 (Screens & Flow) can proceed; difficulty system is fully integrated
- No blockers or concerns
