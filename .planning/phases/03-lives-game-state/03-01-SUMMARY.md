---
phase: 03-lives-game-state
plan: 01
subsystem: gameplay-mechanics
tags: [lives, game-over, event-bus, state]
dependency_graph:
  requires: [02-02, 02-03]
  provides: [lives-system, game-over-event, life-lost-event]
  affects: [03-02, 04-01, 06-01]
tech_stack:
  added: []
  patterns: [event-driven-state, module-level-closure]
key_files:
  created:
    - src/systems/lives.js
  modified:
    - src/config.js
decisions:
  - id: D-0301-1
    description: "Module-level closure for lives state (consistent with other systems)"
  - id: D-0301-2
    description: "GAME_OVER emitted with empty payload (state machine will own context)"
metrics:
  duration: 29s
  completed: 2026-05-09
---

# Phase 03 Plan 01: Lives System Summary

**Event-driven life counter using module closure, emitting LIFE_LOST and GAME_OVER on obstacle misses**

## What Was Done

### Task 1: Add STARTING_LIVES to config
- Added `STARTING_LIVES: 3` to the `GAME` object in `src/config.js`
- Single source of truth for initial life count
- Commit: `e8ec11b`

### Task 2: Create lives system module
- Created `src/systems/lives.js` with three exported functions:
  - `createLives()` — subscribes to OBSTACLE_MISSED, decrements on each event
  - `resetLives()` — sets lives to GAME.STARTING_LIVES
  - `getLives()` — returns current count for HUD
- On each miss: emits `LIFE_LOST` with `{ remaining }` payload
- When lives hit zero: emits `GAME_OVER` with empty payload
- No mechanism to increase lives (LOOP-08 constraint honored)
- Commit: `1334d21`

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| D-0301-1 | Module-level closure for lives state | Consistent with input.js and matcher.js patterns; no class needed |
| D-0301-2 | GAME_OVER emitted with empty payload | State machine (Plan 02) will own full game-over context |

## Deviations from Plan

None - plan executed exactly as written.

## Event Flow

```
obstacle exits left edge
  -> OBSTACLE_MISSED (from obstacle.js)
    -> lives.js handler
      -> lives -= 1
      -> emit LIFE_LOST { remaining }
      -> if lives <= 0: emit GAME_OVER {}
```

## Integration Points

- **Consumed by (future):** State machine (03-02) listens to GAME_OVER
- **Consumed by (future):** HUD (04-01) calls getLives() for display
- **Called from (future):** Game restart flow calls resetLives()

## Next Phase Readiness

- GAME_OVER event ready for state machine (Plan 03-02)
- getLives() API ready for HUD rendering (Phase 4)
- No blockers identified
