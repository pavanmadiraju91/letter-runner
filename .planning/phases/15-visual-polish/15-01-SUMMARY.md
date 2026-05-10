---
phase: 15-visual-polish
plan: 01
subsystem: rendering
tags: [sprite-animation, parallax, canvas, pixel-art]
dependency_graph:
  requires: [14-audio]
  provides: [animated-player-sprite, parallax-background, player-vertical-bob]
  affects: [15-02, 16-theme]
tech_stack:
  added: []
  patterns: [sprite-sheet-animation, parallax-tiling, Image-onload-guard]
key_files:
  created:
    - src/entities/background.js
  modified:
    - src/entities/player.js
    - src/config.js
    - src/main.js
decisions:
  - id: VIS-SPRITE
    choice: "Use Image().complete guard for graceful loading (no preload gate)"
    reason: "Simplest approach; sprite loads fast, first few frames just blank"
  - id: VIS-BG-SCALE
    choice: "Scale bg-dark.png to canvas height, tile horizontally"
    reason: "Handles any canvas aspect ratio without distortion"
metrics:
  duration: ~55s
  completed: 2026-05-10
---

# Phase 15 Plan 01: Sprite Animation and Parallax Background Summary

**One-liner:** 8-frame cat sprite sheet animation with 1px vertical bob and parallax desert background scrolling at 10% game speed.

## What Was Done

### Task 1: Animated player sprite with vertical bob
- Replaced the 16x16 SPRITE/SPRITE_COLORS pixel array with `cat-run.png` sprite sheet
- Added `PLAYER` config section: 8 frames, 100ms per frame, 1px bob amplitude, 12 rad/s bob speed
- `createPlayer()` now includes `frameIndex`, `frameTimer`, `bobTimer` fields
- New `updatePlayer(player, dt)` export advances frame and bob timers
- `renderPlayer()` uses `ctx.drawImage()` to slice correct frame from sheet
- Graceful fallback: renders nothing while image loads (no crash)
- Old programmatic pixel drawing code completely removed

### Task 2: Parallax background with tiled bg-dark.png
- Created `src/entities/background.js` with three exports: createBackground, updateBackground, renderBackground
- Background image tiles horizontally, scaled to fill canvas height
- Scrolls at 10% of game scroll speed creating parallax depth
- Integrated into main.js: background created, updated each frame, rendered behind ground/obstacles
- `updatePlayer()` called each frame in main.js game loop

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

1. `player.js` contains `drawImage`, zero references to `SPRITE` array
2. `background.js` exports `createBackground`, `updateBackground`, `renderBackground`
3. `main.js` calls all three: `renderBackground`, `updateBackground`, `updatePlayer`
4. Visual verification: animated cat sprite with bob, parallax desert background

## Commits

| Hash | Message |
|------|---------|
| ffdcce7 | feat(15-01): animated cat sprite with vertical bob |
| cabebd8 | feat(15-01): parallax background with tiled bg-dark.png |

## Next Phase Readiness

- Player sprite animation and background parallax are live
- Phase 15-02 (glow effects / screen-blend sprites) can proceed
- No blockers or concerns introduced
