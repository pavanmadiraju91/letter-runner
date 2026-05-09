---
phase: 02-movement-input
plan: 02
subsystem: obstacle-pipeline
tags: [object-pool, spawner, obstacle, entity, recycling]
dependency-graph:
  requires: ["02-01"]
  provides: ["obstacle-pool", "obstacle-entity", "spawner-system", "OBSTACLE_MISSED-event"]
  affects: ["02-03", "03-01", "03-02"]
tech-stack:
  added: []
  patterns: ["object-pooling", "factory-function", "timer-based-spawning", "reverse-iteration-cleanup"]
key-files:
  created:
    - src/systems/pool.js
    - src/entities/obstacle.js
    - src/systems/spawner.js
  modified:
    - src/main.js
decisions:
  - id: "D-0202-1"
    decision: "Object pool uses splice for release (max 4 active, O(n) trivial)"
  - id: "D-0202-2"
    decision: "Letter uniqueness via Set of active letters with 26-attempt random selection"
  - id: "D-0202-3"
    decision: "Obstacles render after ground but before player (correct z-order)"
metrics:
  duration: "~45 seconds"
  completed: "2026-05-09"
---

# Phase 02 Plan 02: Obstacle Spawner Summary

**One-liner:** Generic object pool with timer-based obstacle spawning, unique letter assignment, and automatic off-screen recycling.

## What Was Built

### Task 1: Generic Object Pool (`src/systems/pool.js`)
- `createPool(factory, initialSize)` pre-allocates 20 obstacle objects
- Five methods: `acquire`, `release`, `getActive`, `releaseAll`, `stats`
- Zero runtime allocation during gameplay — all objects recycled
- Factory pattern means no `new` keyword anywhere

### Task 2: Obstacle Entity + Spawner System
**`src/entities/obstacle.js`:**
- `createObstacleFactory()` returns factory for plain obstacle objects
- `updateObstacles(pool, dt)` scrolls all active obstacles left
- `cleanupOffscreen(pool)` releases off-screen obstacles (reverse iteration), emits `OBSTACLE_MISSED`
- `renderObstacles(ctx, obstacles)` draws neon pink (#ff2266) rectangles with centered white bold 24px monospace letters

**`src/systems/spawner.js`:**
- `createSpawner(pool)` creates timer state tied to pool
- `updateSpawner(spawner, dt, scrollSpeed, groundY)` spawns on interval with guards:
  - MAX_OBSTACLES cap (4)
  - MIN_OBSTACLE_GAP spacing (120px)
  - Unique letter selection via Set + random sampling

### Wiring (`src/main.js`)
- Pool created with 20 pre-allocated obstacles
- Spawner created tied to pool
- Update loop: spawner -> obstacles -> cleanup (correct order)
- Render order: ground -> obstacles -> player (correct z-order)

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- Vite build passes with 0 errors (13 modules transformed)
- All exported functions verified via grep
- `OBSTACLE_MISSED` event present for Phase 3 life system
- MIN_OBSTACLE_GAP guard confirmed in spawner
- Render order verified: ground < obstacles < player

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| D-0202-1 | Pool uses splice for release | Max 4 active items makes O(n) splice trivial vs swap-remove complexity |
| D-0202-2 | Letter uniqueness via Set + random | Simple, correct for max 4 simultaneous obstacles out of 26 letters |
| D-0202-3 | Obstacles between ground and player | Correct visual z-ordering for gameplay readability |

## Commit History

| Commit | Message |
|--------|---------|
| 85dd8d5 | feat(02-02): add generic object pool system |
| 2a5d0db | feat(02-02): add obstacle entity and spawner system |
| d4e683c | feat(02-02): wire obstacle pipeline into game loop |

## Next Phase Readiness

- Pool and spawner are fully functional and integrated
- `OBSTACLE_MISSED` event ready for Phase 3 life system to subscribe
- Obstacle `active` flag can be used by future collision detection
- Pool `releaseAll()` ready for game reset flow
