---
phase: 13-multi-letter-combos
plan: 03
subsystem: rendering-scoring
tags: [canvas, combo, multiplier, visual-state]
dependency_graph:
  requires: ["13-01"]
  provides: ["combo-rendering", "combo-scoring"]
  affects: ["13-02"]
tech_stack:
  added: []
  patterns: ["per-letter-state-rendering", "event-payload-multipliers"]
key_files:
  created: []
  modified:
    - src/entities/obstacle.js
    - src/systems/score.js
decisions:
  - id: "combo-render-dispatch"
    choice: "Split renderObstacles into renderSingleObstacle + renderComboObstacle dispatch"
    reason: "Clean separation of rendering paths, single-letter code completely unchanged"
metrics:
  duration: "58s"
  completed: "2026-05-10"
---

# Phase 13 Plan 03: Combo Rendering & Scoring Summary

Combo obstacles render as multi-cell blocks with green/yellow(pulsing)/red per-letter states; scoring applies 2.5x/4x multipliers from COMBO config via OBSTACLE_DESTROYED payload.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Render combo obstacles with per-letter visual state | d3bdb49 | Added renderComboObstacle with color states and cell separators |
| 2 | Update scoring to apply combo multipliers | 41061a4 | OBSTACLE_DESTROYED handler reads payload.comboSize for multiplier |

## Changes Made

### src/entities/obstacle.js
- Imported COMBO config for WIDTH_PER_LETTER constant
- Added `renderComboObstacle(ctx, obs)` function:
  - Draws wider body with same neon glow/border style as singles
  - Iterates letters[] with per-cell color: GREEN (done), pulsing YELLOW (next), MAGENTA (pending)
  - Vertical DIM separators between cells
  - Alpha pulsing via `0.7 + 0.3 * Math.sin(Date.now() * 0.008)` for urgency
- Refactored `renderObstacles` to dispatch on `obs.isCombo`
- Extracted single-letter rendering into `renderSingleObstacle` (identical logic, no behavior change)

### src/systems/score.js
- Imported COMBO config for MULTIPLIER_2LETTER and MULTIPLIER_3LETTER
- Modified OBSTACLE_DESTROYED handler to accept payload parameter
- Applies 2.5x multiplier when `payload.comboSize === 2`
- Applies 4x multiplier when `payload.comboSize === 3`
- Backward compatible: no payload or non-combo events score at 1x

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. Both files pass `node -c` syntax check
2. renderComboObstacle function present with GREEN/YELLOW/MAGENTA color states
3. Single-letter rendering extracted but logic is byte-for-byte identical
4. Score system correctly dispatches on comboSize for multiplier selection
5. Pulsing alpha animation on next-target letter (i === progress)

## Next Phase Readiness

- Plan 13-02 (combo input/state machine in matcher.js) will emit OBSTACLE_DESTROYED with `{ isCombo: true, comboSize: N }` payload
- This scoring handler is ready to receive those events
- Rendering is ready to display progress as matcher advances obs.progress
