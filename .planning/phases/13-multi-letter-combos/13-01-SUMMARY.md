---
phase: 13-multi-letter-combos
plan: 01
subsystem: gameplay
tags: [combo, obstacles, spawner, difficulty]
completed: 2026-05-10
duration: 80s

dependency_graph:
  requires: [12-01, 12-02]
  provides: [combo-obstacle-data-model, combo-spawn-logic]
  affects: [13-02, 13-03]

tech_stack:
  added: []
  patterns: [multi-letter-state-machine-fields, level-gated-feature-unlocking]

key_files:
  created: []
  modified:
    - src/config.js
    - src/entities/obstacle.js
    - src/systems/spawner.js

decisions:
  - id: combo-field-coexistence
    choice: "Keep legacy `letter` field for single obstacles; combos use `letters[]` array with `letter=''`"
    reason: "Backward compatibility with existing collision/input systems until Phase 13-02 wires up combo input"
  - id: combo-size-fallback
    choice: "If not enough unique letters available for combo, fall back to single-letter spawn"
    reason: "Graceful degradation without blocking spawn entirely"
---

# Phase 13 Plan 01: Combo Config & Obstacle Factory Summary

**One-liner:** COMBO config constants and obstacle factory combo fields (isCombo, letters[], progress) with level-gated spawner logic (2-letter at L4+, 3-letter at L7+, max-1 on screen, globally unique letters).

## What Was Done

### Task 1: Add COMBO config and extend obstacle factory
- Added `COMBO` export to `src/config.js` with level gates (4/7), spawn chances (30%/25%), width per letter (44px), scoring multipliers (2.5x/4x), max on screen (1)
- Extended obstacle factory in `src/entities/obstacle.js` with `isCombo: false`, `letters: []`, `progress: 0` fields
- Updated `OBSTACLE_MISSED` event emission to include `letters` and `isCombo` for downstream systems

### Task 2: Update spawner for level-gated combo spawning
- Refactored `usedLetters` collection to iterate both single (`obs.letter`) and combo (`obs.letters[]`) obstacles
- Added level-gated combo decision: check `getLevel()` against COMBO thresholds
- Enforced max-1 combo on screen via `activeComboCount < COMBO.MAX_ON_SCREEN`
- Combo letter picking: one-at-a-time with immediate addition to `usedLetters` set for internal uniqueness
- Single-letter path explicitly resets combo fields (`isCombo=false`, `letters=[]`, `progress=0`, `width=OBSTACLE_WIDTH`)

## Deviations from Plan

None - plan executed exactly as written.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| abc862c | feat | Add COMBO config and extend obstacle factory with combo fields |
| 91d2860 | feat | Update spawner for level-gated combo spawning with uniqueness |

## Verification Results

- All three files pass `node -c` syntax check
- COMBO config exports confirmed with correct level gates and constants
- Obstacle factory confirmed with isCombo, letters[], progress fields
- Spawner imports getLevel and COMBO, gates on level thresholds
- No changes to pool.js or difficulty.js (unchanged as specified)

## Next Phase Readiness

Phase 13-02 (combo input handling / state machine) can proceed:
- Obstacle objects now carry combo state (isCombo, letters, progress)
- Spawner produces correctly configured combo obstacles at appropriate levels
- OBSTACLE_MISSED event includes full combo data for scoring/lives systems
