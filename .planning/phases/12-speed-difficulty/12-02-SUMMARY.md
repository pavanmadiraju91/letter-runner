---
phase: 12-speed-difficulty
plan: 02
subsystem: difficulty
tags: [spawn-interval, engagement-curve, tuning, config-cleanup]

dependency_graph:
  requires: [12-01]
  provides: [continuous-spawn-pacing, engagement-curve-dump, clean-tier-config]
  affects: [13-multi-letter]

tech_stack:
  added: []
  patterns: [inverse-proportional-spawn, time-based-density]

key_files:
  created: []
  modified: [src/config.js, src/systems/difficulty.js]

decisions:
  - id: spawn-formula
    choice: "spawnInterval = BASE_SPAWN_INTERVAL * (BASE_SPEED / currentSpeed), floor 0.8s"
    reason: "Inversely proportional to speed gives natural density ramp without discrete jumps"
  - id: tier-simplification
    choice: "TIERS reduced to {maxObstacles, multiplier, tallObstacles} only"
    reason: "Speed and spawn are time-based; tiers now gate complexity features only"
  - id: constants-validated
    choice: "BASE=140, MAX=280, ACCEL=2.0 unchanged; added BASE_SPAWN=2.5, MIN_SPAWN=0.8"
    reason: "Curve analysis confirms 30-60s engagement window matches Chrome dino feel"

metrics:
  duration: "~2 min"
  completed: "2026-05-10"
---

# Phase 12 Plan 02: Spawn Pacing & Engagement Tuning Summary

**One-liner:** Spawn interval derived inversely from speed (2.5s->1.25s), tier config cleaned to complexity-only gates, dev curve dump validates 30-60s engagement window.

## What Was Done

### Task 1: Derive spawn interval from speed, clean up tier config
- Added `SPEED.BASE_SPAWN_INTERVAL: 2.5` and `SPEED.MIN_SPAWN_INTERVAL: 0.8` to config
- `getDifficultyParams()` now computes `spawnInterval = max(0.8, 2.5 * (140 / speed))`
- Removed `scrollSpeed` and `spawnInterval` from all TIERS entries (complexity gates only now)
- Removed dead config: `LOG_SPEED_FACTOR`, `LOG_SPAWN_FACTOR`, `DIFFICULTY.MIN_SPAWN_INTERVAL`
- Overflow logarithmic scaling simplified to multiplier-only (speed/spawn are time-based)
- Commit: `07e72ff`

### Task 2: Dev-mode engagement curve dump
- Replaced old level-based console.table with 12-point time-based speed curve
- Columns: time_s, speed_px_s, spawn_interval_s, danger_zone_ms, difficulty label
- Uses `getWidth() * 0.3 / speed * 1000` for danger zone calculation
- Validated engagement profile: easy 0-20s, medium 20-40s, hard 40-60s, CAPPED 70s+
- Commit: `6b5af30`

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. DEV console.log and console.table present in createDifficulty()
2. Speed at t=0: 140, t=35: 210, t=70: 280 (capped) - confirmed
3. Spawn interval at t=0: 2.50s, at t=70: 1.25s - confirmed
4. No `scrollSpeed` anywhere in config.js - confirmed
5. `multiplier` and `tallObstacles` still gate by level in TIERS - confirmed
6. Build passes cleanly (28 modules, no errors)

## Decisions Made

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| Spawn formula | Inversely proportional to speed with 0.8s floor | Smooth density ramp, never overwhelming |
| Tier simplification | Complexity gates only (no speed/spawn) | Clean separation: time drives difficulty, destroys drive features |
| Constants | Kept ACCEL=2.0, added BASE_SPAWN=2.5, MIN_SPAWN=0.8 | Curve analysis validates 30-60s peak challenge window |

## Engagement Curve (validated)

| Time | Speed | Spawn | Danger Zone | Phase |
|------|-------|-------|-------------|-------|
| 0s | 140 px/s | 2.50s | 1714ms | easy |
| 20s | 180 px/s | 1.94s | 1333ms | medium |
| 40s | 220 px/s | 1.59s | 1091ms | hard |
| 60s | 260 px/s | 1.35s | 923ms | hard |
| 70s | 280 px/s | 1.25s | 857ms | CAPPED |

## Next Phase Readiness

- Phase 12 complete: speed and spawn are fully continuous, engagement tuned
- Phase 13 (multi-letter combos) can build freely - speed system is orthogonal
- All public APIs stable: `getCurrentSpeed()`, `getMinGap()`, `getDifficultyParams()`
