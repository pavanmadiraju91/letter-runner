---
phase: 02-movement-input
plan: 03
subsystem: input
tags: [keyboard, event-bus, matching, danger-zone]
dependency-graph:
  requires: ["02-01", "02-02"]
  provides: ["keyboard-input", "letter-matching", "phase2-integration"]
  affects: ["03-01", "04-01", "08-01"]
tech-stack:
  added: []
  patterns: ["event-driven-input", "danger-zone-collision"]
key-files:
  created:
    - src/systems/input.js
    - src/systems/matcher.js
  modified:
    - src/main.js
decisions:
  - id: "D-0203-1"
    description: "No preventDefault on keydown — preserves browser shortcuts (Ctrl+R, etc.)"
  - id: "D-0203-2"
    description: "Matcher iterates obstacles in reverse for rightmost-first priority (closest to player)"
  - id: "D-0203-3"
    description: "Pressed Set tracks held keys at module level for repeat prevention"
metrics:
  duration: "47s"
  completed: "2026-05-09"
---

# Phase 2 Plan 3: Input & Matching Summary

**One-liner:** Keyboard input with repeat guard emitting KEY_PRESS, danger zone matcher destroying obstacles on correct letter press.

## What Was Built

### src/systems/input.js
- `initInput()` registers keydown/keyup listeners on window
- `destroyInput()` removes listeners and clears pressed Set (for testing/cleanup)
- Repeat guard via `e.repeat` check prevents held-key spam
- Only A-Z characters trigger KEY_PRESS events (normalized to uppercase)
- Module-level `pressed` Set tracks currently held keys

### src/systems/matcher.js
- `initMatcher(obstaclePool)` subscribes to KEY_PRESS events
- Computes danger zone: from `DANGER_ZONE_START` (30% of screen width) to right edge
- Iterates active obstacles in reverse (rightmost first for tie-breaking)
- On match: emits OBSTACLE_DESTROYED with letter/position data, releases obstacle from pool
- No match: silently ignores (no penalty in Phase 2)

### src/main.js (rewritten)
- Imports all Phase 2 modules: player, ground, pool, obstacle, spawner, input, matcher
- Uses `GAME.GROUND_HEIGHT` constant for player reset (instead of ground.height reference)
- Removed debug dimension text overlay
- Full update/render pipeline integrated

## Commits

| # | Hash | Message |
|---|------|---------|
| 1 | 475fa37 | feat(02-03): add keyboard input and letter matcher systems |
| 2 | f466249 | feat(02-03): wire full Phase 2 integration in main.js |

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| D-0203-1 | No preventDefault on keydown | Preserves browser shortcuts, game only needs letter keys |
| D-0203-2 | Reverse iteration for matcher | Rightmost obstacle is closest to player, better UX |
| D-0203-3 | Module-level pressed Set | Simple repeat prevention without relying solely on e.repeat |

## Integration Points

- **KEY_PRESS event** flows: input.js -> event bus -> matcher.js
- **OBSTACLE_DESTROYED event** flows: matcher.js -> event bus -> (Phase 4 scoring, Phase 8 particles)
- **Pool.release()** called by matcher to recycle destroyed obstacles immediately

## Next Phase Readiness

Phase 2 is now COMPLETE. All systems are integrated:
- Player visible on scrolling ground
- Obstacles spawn with unique letters from right edge
- Keyboard input destroys matching obstacles in danger zone
- Object pool recycles obstacles efficiently

Ready for Phase 3 (Lives & Game State) which will:
- Listen to OBSTACLE_MISSED events for life loss
- Listen to OBSTACLE_DESTROYED events for scoring
- Add game-over state management
