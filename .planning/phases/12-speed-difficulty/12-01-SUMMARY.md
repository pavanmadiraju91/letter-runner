---
phase: 12-speed-difficulty
plan: 01
subsystem: difficulty
tags: [speed, acceleration, fairness, warmup]

dependency_graph:
  requires: [05-difficulty-progression]
  provides: [continuous-speed-system, warmup-gate, dynamic-gap]
  affects: [12-02, 13-multi-letter]

tech_stack:
  added: []
  patterns: [linear-acceleration, time-based-difficulty, reaction-time-fairness]

key_files:
  created: []
  modified: [src/config.js, src/systems/difficulty.js, src/systems/spawner.js, src/main.js]

decisions:
  - id: speed-model
    choice: "Linear acceleration 140->280 px/s over ~70s with hard cap"
    reason: "Chrome dino model — smooth, predictable, flow-state inducing"
  - id: warmup-gate
    choice: "2-second obstacle-free grace period at run start"
    reason: "Players need time to orient before first challenge"
  - id: dynamic-gap
    choice: "Min gap = max(120px, speed*0.2 + 48px) — guarantees 200ms reaction"
    reason: "Fair at all speeds; floor prevents overly tight spawns at low speed"
  - id: speed-decoupled-from-tiers
    choice: "Speed is time-based; multiplier/maxObstacles/tallObstacles remain tier-based"
    reason: "Eliminates jarring speed jumps while preserving level progression rewards"

metrics:
  duration: "<1 min"
  completed: "2026-05-10"
---

# Phase 12 Plan 01: Continuous Speed Acceleration Summary

**One-liner:** Chrome dino-style linear speed ramp (140-280 px/s over 70s) with 2s warmup gate and dynamic fairness gap.

## What Was Done

### Task 1: Add SPEED config and rewrite difficulty.js
- Added `SPEED` config section with BASE_SPEED(140), MAX_SPEED(280), ACCELERATION(2.0), WARMUP_TIME(2.0), MIN_REACTION_MS(200)
- Rewrote difficulty.js: `tickSpeed(dt)` tracks elapsed time, `getCurrentSpeed()` returns linear interpolation
- `getMinGap(speed)` guarantees 200ms minimum reaction time with 120px floor
- `isWarmupComplete()` gates obstacle spawning
- `getDifficultyParams()` overrides scrollSpeed with continuous speed; preserves tier-based multiplier/maxObstacles/tallObstacles
- DEV console.table now shows time-based speed curve instead of tier table
- Commit: `2e4130d`

### Task 2: Wire main.js and spawner.js
- `main.js` imports and calls `tickSpeed(dt)` each frame before `getDifficultyParams()`
- `spawner.js` imports `isWarmupComplete`, `getMinGap`, `getCurrentSpeed`
- Early return in `updateSpawner()` blocks all spawns during warmup
- Gap check uses `getMinGap(getCurrentSpeed())` instead of fixed `GAME.MIN_OBSTACLE_GAP`
- Obstacle speed set to `getCurrentSpeed()` at spawn time (no mid-flight acceleration)
- Commit: `dce016d`

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. Build passes cleanly (28 modules, no errors)
2. Warmup gate: `isWarmupComplete()` returns false for first 2 seconds
3. Speed formula: 140 + 2.0 * t, capped at 280 (reaches cap at t=70s)
4. Gap formula: max(120, speed * 0.2 + 48) - at 280 px/s = 104px, floored to 120px
5. Level-up emission preserved in `createDifficulty()` event handler
6. `resetDifficulty()` resets elapsedTime to 0 alongside destroyCount/currentLevel

## Decisions Made

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Speed model | Linear 140->280 over 70s | Chrome dino proven model; smooth, no jarring jumps |
| Warmup | 2s grace period | Orientation time before challenge |
| Gap formula | max(120px, speed*0.2+48px) | 200ms guaranteed reaction at any speed |
| Tier decoupling | Speed=time, features=tiers | Best of both: smooth speed + reward milestones |

## Next Phase Readiness

- Phase 12-02 (spawn pacing) can build on this: spawner already respects dynamic gap
- Phase 13 (multi-letter combos) unaffected: speed system is orthogonal to input matching
- `getCurrentSpeed()` and `getMinGap()` are clean public APIs for future systems
