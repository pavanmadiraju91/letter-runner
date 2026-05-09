---
phase: 05-difficulty-progression
plan: 01
subsystem: difficulty
tags: [difficulty, progression, levels, config]
dependency_graph:
  requires: [04-01, 04-02]
  provides: [difficulty-system, tier-config, level-tracking, LEVEL_UP-event]
  affects: [05-02, 05-03]
tech_stack:
  added: []
  patterns: [logarithmic-scaling, tier-table-lookup, module-closure-state]
key_files:
  created: [src/systems/difficulty.js]
  modified: [src/config.js]
decisions:
  - id: D-0501-1
    desc: "Module-level closure for difficulty state (consistent with lives/score pattern)"
  - id: D-0501-2
    desc: "TIERS array indexed by level-1 for direct lookup; overflow uses log scaling"
  - id: D-0501-3
    desc: "getDifficultyParams() returns shallow copy to prevent mutation of tier objects"
metrics:
  duration: 49s
  completed: 2026-05-09
---

# Phase 05 Plan 01: Difficulty Tier Config & Level System Summary

**Config-driven 6-tier difficulty table with logarithmic scaling beyond level 6, plus difficulty.js system emitting LEVEL_UP every 10 destroys**

## Tasks Completed

| # | Task | Commit | Key Changes |
|---|------|--------|-------------|
| 1 | Add DIFFICULTY config with tier definitions | 10d36d8 | src/config.js: DIFFICULTY export with 6 tiers, log constants |
| 2 | Create difficulty.js system | 767c52c | src/systems/difficulty.js: createDifficulty, resetDifficulty, getDifficultyParams, getLevel |

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| D-0501-1 | Module-level closure for difficulty state | Consistent with lives.js, score.js pattern |
| D-0501-2 | TIERS array indexed by level-1 for direct lookup | O(1) tier resolution for levels 1-6 |
| D-0501-3 | getDifficultyParams() returns shallow copy | Prevents external mutation of tier config objects |

## Implementation Notes

### Tier Table
- Level 1: scrollSpeed=140, spawnInterval=2.5s, maxObstacles=1, multiplier=1x
- Level 2: scrollSpeed=180, spawnInterval=2.0s, maxObstacles=2, multiplier=1.5x
- Level 3: scrollSpeed=210, spawnInterval=1.7s, maxObstacles=2, multiplier=1.5x
- Level 4: scrollSpeed=250, spawnInterval=1.4s, maxObstacles=2, multiplier=2x, tallObstacles
- Level 5: scrollSpeed=280, spawnInterval=1.2s, maxObstacles=2, multiplier=2x, tallObstacles
- Level 6: scrollSpeed=310, spawnInterval=1.0s, maxObstacles=3, multiplier=3x, tallObstacles

### Logarithmic Scaling (Level 7+)
Uses `ln(overflow + 1)` for smooth, diminishing returns:
- Level 7: scrollSpeed=323.86, multiplier=3.35
- Level 10: scrollSpeed=340.97, multiplier=3.80

### Event Flow
```
OBSTACLE_DESTROYED -> difficulty.js increments destroyCount
  -> every 10 destroys: emit LEVEL_UP { level, scrollSpeed, spawnInterval, maxObstacles, multiplier, tallObstacles }
    -> score.js updates currentLevel (already wired)
    -> input.js updates currentLevel (already wired)
```

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- vite build: passes without errors
- DIFFICULTY.TIERS.length === 6
- Exports: createDifficulty, resetDifficulty, getDifficultyParams, getLevel
- LEVEL_UP payload shape confirmed: { level, scrollSpeed, spawnInterval, maxObstacles, multiplier, tallObstacles }
- Level 1 params match spec exactly
- Level 4 params match spec (tallObstacles=true)
- Level 7 logarithmic scaling verified (323.86 speed, 3.35 multiplier)

## Next Phase Readiness

Plan 05-02 (spawner integration) can now:
- Import getDifficultyParams() for spawn interval and maxObstacles
- Listen to LEVEL_UP for scrollSpeed updates
- Use tallObstacles flag for obstacle height variation

No blockers or concerns.
