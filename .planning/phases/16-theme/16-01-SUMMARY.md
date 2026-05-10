---
phase: 16-theme
plan: 01
subsystem: rendering
tags: [theme, color-scheme, palette, dark-mode, light-mode]
dependency_graph:
  requires: [15-visual-polish]
  provides: [theme-detection, dual-palette, reactive-theme-switching]
  affects: [16-02, 16-03]
tech_stack:
  added: []
  patterns: [matchMedia-listener, reactive-theme-events, palette-accessor]
key_files:
  created:
    - src/core/theme.js
  modified:
    - src/config.js
    - src/entities/background.js
    - index.html
    - src/main.js
decisions:
  - id: theme-backward-compat
    choice: "Keep COLORS.PALETTE as reference to PALETTE_DARK for backward compatibility"
    reason: "Dozens of files import COLORS.PALETTE — breaking them is outside this plan's scope"
metrics:
  duration: 85s
  completed: 2026-05-10
---

# Phase 16 Plan 01: Theme Detection and Dual Palettes Summary

**One-liner:** System prefers-color-scheme detection with reactive PALETTE_DARK/PALETTE_LIGHT switching via matchMedia listener and event bus

## What Was Done

### Task 1: Theme module and dual palettes
- Created `src/core/theme.js` with `initTheme()`, `getTheme()`, `getPalette()`, `getBG()`
- Extracted existing COLORS.PALETTE into standalone `PALETTE_DARK` export (byte-identical values)
- Defined `PALETTE_LIGHT` with muted accents appropriate for light backgrounds
- Added `BG_LIGHT: '#f4f4fa'` to COLORS object
- Kept `COLORS.PALETTE` as backward-compatible reference to `PALETTE_DARK`

### Task 2: Theme-aware background and HTML
- Rewrote `src/entities/background.js` to preload both bg-dark.png and bg-light.png
- Background rendering uses `getTheme()` to select correct image
- Listens for `THEME_CHANGE` event to reset parallax offset (avoids jarring mid-tile jump)
- Updated `index.html` color-scheme meta to "dark light"
- Added CSS `@media (prefers-color-scheme: light)` fallback for pre-JS body background
- Wired `initTheme()` in `main.js` and replaced hardcoded `COLORS.BG` with `getBG()`

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| PALETTE backward compat | COLORS.PALETTE references PALETTE_DARK | 15+ files use COLORS.PALETTE.X — migrating them is a separate concern (Rule 3 deviation) |
| initTheme placement | Called immediately after initCanvas in main.js | Body must exist for style manipulation; canvas must be ready |
| getBG in render loop | Use getBG() instead of COLORS.BG for canvas fill | Ensures canvas background matches theme reactively |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Kept COLORS.PALETTE as backward-compatible reference**
- **Found during:** Task 1
- **Issue:** Plan says "Remove the nested PALETTE key from COLORS object" but 15+ files reference COLORS.PALETTE.X and would break
- **Fix:** Kept COLORS.PALETTE pointing to PALETTE_DARK — zero regression for existing consumers
- **Files modified:** src/config.js

**2. [Rule 2 - Missing Critical] Wired initTheme() and getBG() in main.js**
- **Found during:** Task 2
- **Issue:** Plan only mentions background.js and index.html changes, but theme system needs initialization and the main render loop uses hardcoded COLORS.BG
- **Fix:** Added initTheme() call and getBG() usage in main.js
- **Files modified:** src/main.js

## Commits

| Hash | Message |
|------|---------|
| 0d4d92e | feat(16-01): add theme detection module and dual palettes |
| 5e0deea | feat(16-01): theme-aware background, HTML, and main.js wiring |

## Verification Results

- initTheme() detects system preference via matchMedia
- getPalette() returns PALETTE_DARK in dark mode, PALETTE_LIGHT in light mode
- THEME_CHANGE event fires on system preference change
- Background system preloads both images and switches per theme
- PALETTE_DARK values are identical to original COLORS.PALETTE
- HTML has correct color-scheme meta and CSS media query fallback
- No import errors — backward compatibility maintained

## Next Phase Readiness

Ready for 16-02 (migrating existing COLORS.PALETTE consumers to getPalette()). All infrastructure in place:
- getPalette() returns correct palette for active theme
- THEME_CHANGE event available for any component needing reactive updates
- Background and body already react to theme changes
