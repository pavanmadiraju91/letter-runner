---
phase: 13-multi-letter-combos
plan: "02"
subsystem: input-matching
tags: [combo, matcher, state-machine, event-payload]
dependency-graph:
  requires: ["13-01"]
  provides: ["combo-input-handling", "enriched-OBSTACLE_DESTROYED-payload"]
  affects: ["13-03"]
tech-stack:
  added: []
  patterns: ["priority-partitioned matching", "sequential progress tracking"]
key-files:
  created: []
  modified:
    - src/systems/matcher.js
decisions:
  - id: "combo-priority"
    choice: "Combo obstacles checked before singles in danger zone"
    rationale: "Combos are time-sensitive (multiple keys needed) and limited to 1 on screen"
  - id: "wrong-key-semantics"
    choice: "Wrong key only resets combo if no single-letter match exists"
    rationale: "Prevents false resets when player correctly types a single-letter obstacle"
metrics:
  duration: "41s"
  completed: "2026-05-10"
---

# Phase 13 Plan 02: Combo Input Matching Summary

**One-liner:** Priority-partitioned matcher with sequential combo progress, combo-first checking, and enriched event payloads for downstream scoring.

## What Was Done

### Task 1: Combo-aware sequential input matching (7fd5f8b)

Rewrote the KEY_PRESS handler in `src/systems/matcher.js` to support both single-letter and multi-letter combo obstacles:

**Algorithm:**
1. Partition active obstacles in danger zone into combo vs singles (reverse iteration preserves rightmost priority for singles)
2. If a combo is in zone, check its next expected letter first
3. On match: advance progress. If complete, emit OBSTACLE_DESTROYED with combo payload
4. On non-match: check if any single-letter obstacle matches (destroy it if so). Only reset combo progress if truly no match exists
5. If no combo in zone: standard single-letter matching (unchanged behavior)

**Event payload enrichments:**
- `OBSTACLE_DESTROYED`: now includes `{ letter, x, y, isCombo, comboSize }`
- `WRONG_KEY`: now includes `{ key, comboReset }` flag

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- `node -c src/systems/matcher.js` - passes (no syntax errors)
- `isCombo`, `progress`, `comboSize` all present in logic paths
- Both `OBSTACLE_DESTROYED` and `WRONG_KEY` emitted with enriched payloads
- Priority logic confirmed: combo checked first, single-letter still works alongside
- Existing score.js handler (`events.on('OBSTACLE_DESTROYED', () => {...})`) remains backward-compatible since it ignores the payload

## Next Phase Readiness

Phase 13-03 (combo rendering and score multiplier) can now:
- Read `isCombo` and `comboSize` from OBSTACLE_DESTROYED payload in score.js
- Read `obs.progress` and `obs.letters` for rendering partial completion state
- Use `comboReset` flag from WRONG_KEY for potential visual feedback
