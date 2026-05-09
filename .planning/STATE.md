# Project State: Letter Runner

## Current Status

**Active phase:** 05-difficulty-progression (Phase 5 of 10)
**Last action:** Completed 05-03-PLAN.md (Letter Uniqueness & Curve Validation)
**Last updated:** 2026-05-09

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-09)

**Core value:** The game must feel immediately fun
**Current focus:** Phase 5 COMPLETE - difficulty progression fully implemented and validated

## Phase Progress

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Foundation | ● Complete | 2/2 |
| 2 | Movement & Input | ● Complete | 3/3 |
| 3 | Lives & Game State | ● Complete | 3/3 |
| 4 | Scoring & HUD | ● Complete | 2/2 |
| 5 | Difficulty Progression | ● Complete | 3/3 |
| 6 | Screens & Flow | ○ Pending | 0/5 |
| 7 | Visual Style | ○ Pending | 0/3 |
| 8 | Particle Effects & Juice | ○ Pending | 0/4 |
| 9 | Audio | ○ Pending | 0/3 |
| 10 | Performance & Deployment | ○ Pending | 0/4 |

Progress: █████████████░░░░░░░░░░░░░░░░░░░ 13/32 (41%)

## Performance Metrics

**Velocity:**
- Total plans completed: 13
- Average duration: ~45 seconds
- Total execution time: ~9.5 minutes

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
- [D-0401-1] Module-level closure for score state (consistent with lives.js)
- [D-0401-2] Score caller-gated by PLAYING state (no state.js import in score.js)
- [D-0401-3] getScore() returns Math.floor() for integer display value
- [D-0402-1] Hearts drawn with bezier curves (two arcs) at 14px size, spaced 22px apart
- [D-0402-2] HUD uses ctx.save/restore to avoid polluting canvas state for other renderers
- [D-0402-3] Level state synced via LEVEL_UP event (future-proof for Phase 5)
- [D-0501-1] Module-level closure for difficulty state (consistent with lives/score pattern)
- [D-0501-2] TIERS array indexed by level-1 for direct lookup; overflow uses log scaling
- [D-0501-3] getDifficultyParams() returns shallow copy to prevent mutation of tier objects
- [D-0502-1] difficultyParams object passed to spawner (not individual scalars)
- [D-0502-2] getDifficultyParams() called each frame in update() for instant level response
- [D-0502-3] Tall obstacles use 40% random chance when tallObstacles=true
- [D-0503-1] Task 1 letter hardening already included in 05-02 commit (parallel execution merged)
- [D-0503-2] Dev-mode curve dump uses currentLevel mutation with save/restore for accurate simulation
- [D-0503-3] Logarithmic constants verified correct: LOG_SPEED_FACTOR=20, LOG_SPAWN_FACTOR=0.08, LOG_MULT_FACTOR=0.5

### Pending Todos

None.

### Blockers/Concerns

None.

## Context for Next Session

- Phase 5 COMPLETE: all 3 plans delivered (config, wiring, validation)
- Difficulty system: config.js TIERS -> difficulty.js getDifficultyParams() -> spawner.js/main.js
- Unique letter guarantee: random-first + deterministic-fallback (DIFF-07/08)
- Logarithmic curve verified: L1-L6 tier jumps, L7+ log flattening (DIFF-09)
- Dev console.table shows full 10-level curve on game start
- Tall obstacles (1.5x height) appear 40% at level 4+ (DIFF-10)
- maxObstacles caps at 4 at level 9+ (DIFF-06)
- Next: Phase 6 (Screens & Flow) — start screen, game over screen, transitions

## Session Continuity

Last session: 2026-05-09T21:50:25Z
Stopped at: Completed 05-03-PLAN.md (Phase 5 complete)
Resume file: None
