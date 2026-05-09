# Project State: Letter Runner

## Current Status

**Active phase:** 04-scoring-hud (Phase 4 of 10)
**Last action:** Completed 04-02-PLAN.md (HUD Renderer)
**Last updated:** 2026-05-09

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-09)

**Core value:** The game must feel immediately fun
**Current focus:** Phase 4 in progress - HUD renderer delivered (04-02), score system pending (04-01)

## Phase Progress

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Foundation | ● Complete | 2/2 |
| 2 | Movement & Input | ● Complete | 3/3 |
| 3 | Lives & Game State | ● Complete | 3/3 |
| 4 | Scoring & HUD | ◐ In Progress | 1/2 |
| 5 | Difficulty Progression | ○ Pending | 0/3 |
| 6 | Screens & Flow | ○ Pending | 0/5 |
| 7 | Visual Style | ○ Pending | 0/3 |
| 8 | Particle Effects & Juice | ○ Pending | 0/4 |
| 9 | Audio | ○ Pending | 0/3 |
| 10 | Performance & Deployment | ○ Pending | 0/4 |

Progress: █████████░░░░░░░░░░░░░░░░░░░░░░░░ 9/32 (28%)

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: ~45 seconds
- Total execution time: ~7 minutes

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Vanilla JS + Canvas (no frameworks) per research recommendation
- Vite 6.x for bundling with HMR during dev
- Event bus architecture for decoupled systems
- Object pooling from day one (not retrofit)
- [D-0101-1] Vite 6.4.2 with es2022 target and relative base path
- [D-0102-1] Event bus uses Map for listener storage (O(1) lookup)
- [D-0102-2] Delta-time clamped to MAX_DT (1/30s) to prevent spiral of death
- [D-0102-3] Canvas imageSmoothingEnabled=false for crisp pixel rendering
- [D-0201-1] Plain object pattern for entities (no classes)
- [D-0201-2] Ground uses modulo wrap on offset to prevent float overflow
- [D-0201-3] Player resets position on CANVAS_RESIZE event
- [D-0202-1] Object pool uses splice for release (max 4 active, O(n) trivial)
- [D-0202-2] Letter uniqueness via Set of active letters with 26-attempt random selection
- [D-0202-3] Obstacles render after ground but before player (correct z-order)
- [D-0203-1] No preventDefault on keydown — preserves browser shortcuts
- [D-0203-2] Matcher iterates obstacles in reverse for rightmost-first priority
- [D-0203-3] Pressed Set tracks held keys at module level for repeat prevention
- [D-0301-1] Module-level closure for lives state (consistent with other systems)
- [D-0301-2] GAME_OVER emitted with empty payload (state machine will own context)
- [D-0302-1] Module-level closure for state (consistent with lives, input systems)
- [D-0302-2] No MENU state yet — deferred to Phase 6 (Screens & Flow)
- [D-0302-3] Restart is pure state reset (no reload) for instant feedback
- [D-0303-1] Track game state via STATE_CHANGE events rather than importing state.js directly (avoids circular deps)
- [D-0303-2] WRONG_KEY only emits when obstacles exist in danger zone (prevents false penalties)
- [D-0303-3] resumeLoop() reuses stored updateFn/renderFn so input.js needs no main.js refs
- [D-0402-1] Hearts drawn with bezier curves (two arcs) at 14px size, spaced 22px apart
- [D-0402-2] HUD uses ctx.save/restore to avoid polluting canvas state for other renderers
- [D-0402-3] Level state synced via LEVEL_UP event (future-proof for Phase 5)

### Pending Todos

None.

### Blockers/Concerns

None.

## Context for Next Session

- Phase 4 IN PROGRESS: 04-02 (HUD) complete, 04-01 (Score) pending/parallel
- HUD renders: score top-left, "LV 1" top-center, heart icons top-right
- renderHUD(ctx, w) called after entities, before Game Over overlay
- createHUD() subscribes to LEVEL_UP (Phase 5) and GAME_RESTART events
- Hearts: bezier curve paths, #ff3366 filled, #2a2a3a empty
- Score.js stub created for build — 04-01 will replace with full implementation
- Next step: Complete 04-01 (Score System) to finish Phase 4

## Session Continuity

Last session: 2026-05-09T21:40:09Z
Stopped at: Completed 04-02-PLAN.md
Resume file: None
