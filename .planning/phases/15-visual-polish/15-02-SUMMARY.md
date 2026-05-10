---
phase: 15-visual-polish
plan: 02
subsystem: rendering
tags: [canvas, glow, performance, readability, danger-zone]
completed: 2026-05-10
duration: 107s

dependency_graph:
  requires: [13-03]
  provides: [screen-blend-glow, danger-zone-pulse, outlined-letters]
  affects: [16-theme]

tech_stack:
  added: []
  patterns: [globalCompositeOperation-lighter, sin-wave-alpha-pulse, strokeText-outline]

key_files:
  created: []
  modified:
    - src/entities/obstacle.js
    - src/config.js

decisions:
  - id: VIS-04
    choice: "globalCompositeOperation='lighter' for screen-blend glow"
    reason: "Eliminates expensive shadowBlur GPU compositing; lighter operation is hardware-accelerated"
  - id: VIS-03
    choice: "sin-wave alpha modulation at 0.01 rad/ms for danger zone pulse"
    reason: "Smooth pulsing visual that draws attention without being jarring"
  - id: VIS-05
    choice: "26px bold monospace with 3px black strokeText outline"
    reason: "Readable at max speed (280px/s); outline prevents blending into glow"

metrics:
  tasks_completed: 1
  tasks_total: 1
  commits: 1
---

# Phase 15 Plan 02: Obstacle Glow & Readability Summary

**Screen-blend glow replaces shadowBlur; danger-zone sin-wave pulse; 26px bold outlined letters**

## What Was Done

### Task 1: Replace shadowBlur with screen-blend glow and add danger-zone pulse

Rewrote the obstacle rendering pipeline in `src/entities/obstacle.js`:

1. **Removed all `ctx.shadowBlur` and `ctx.shadowColor` calls** from both `renderSingleObstacle` and `renderComboObstacle` functions, plus the final shadow reset in `renderObstacles`.

2. **Added `isInDangerZone()` helper** that checks if `obs.x <= getWidth() * GAME.DANGER_ZONE_START` (left 30% of canvas).

3. **Screen-blend glow (VIS-04):** When obstacle enters danger zone, a `globalCompositeOperation = 'lighter'` rect is drawn around it with pulsing alpha. This is GPU-friendly compared to shadowBlur.

4. **Danger-zone pulse (VIS-03):** Alpha oscillates via `GLOW_MIN_ALPHA + GLOW_RANGE * Math.sin(Date.now() * GLOW_PULSE_SPEED)`, creating a visible pulsing warning effect.

5. **Letter readability (VIS-05):** Font increased to 26px bold monospace. Added `ctx.strokeText` with 3px black outline drawn before `ctx.fillText` for contrast at any speed.

6. **Config extraction:** Added `OBSTACLE_VFX` config object to `src/config.js` for tunable parameters (pulse speed, alpha range, padding, font size, outline width).

Applied same pattern to both single-letter and combo obstacle renderers.

## Deviations from Plan

None -- plan executed exactly as written.

## Commits

| Hash | Message |
|------|---------|
| ea7b6fd | feat(15-02): replace shadowBlur with screen-blend glow and danger-zone pulse |

## Verification Results

| Check | Result |
|-------|--------|
| `grep -c "ctx.shadowBlur" obstacle.js` | 0 (PASS) |
| `grep "globalCompositeOperation" obstacle.js` | 'lighter' x2 (PASS) |
| `grep "strokeText" obstacle.js` | Present x2 (PASS) |
| `grep "LETTER_FONT_SIZE" obstacle.js` | Present (26px via config) (PASS) |

## Next Phase Readiness

- Phase 16 (Theme) will need to consider how screen-blend glow interacts with light mode
- The `COLORS.PALETTE.OBSTACLE_GLOW` color (#ff2266) may need a light-mode variant
- No blockers for any other phase
