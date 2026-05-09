# Project State: Letter Runner

## Current Status

**Active phase:** 10-performance-deployment (Phase 10 of 10)
**Last action:** Completed 09-02-PLAN.md (Event wiring and music toggle - Phase 9 complete)
**Last updated:** 2026-05-10

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-09)

**Core value:** The game must feel immediately fun
**Current focus:** Phase 9 COMPLETE. All audio wired. Ready for Phase 10 (Performance & Deployment).

## Phase Progress

| Phase | Name | Status | Plans |
|-------|------|--------|-------|
| 1 | Foundation | ● Complete | 2/2 |
| 2 | Movement & Input | ● Complete | 3/3 |
| 3 | Lives & Game State | ● Complete | 3/3 |
| 4 | Scoring & HUD | ● Complete | 2/2 |
| 5 | Difficulty Progression | ● Complete | 3/3 |
| 6 | Screens & Flow | ● Complete | 3/3 |
| 7 | Visual Style | ◐ In Progress | 2/3 |
| 8 | Particle Effects & Juice | ◐ In Progress | 2/3 |
| 9 | Audio | ● Complete | 2/2 |
| 10 | Performance & Deployment | ○ Pending | 0/4 |

Progress: ██████████████████████░░░░░░░░░░ 22/30 (73%)

## Performance Metrics

**Velocity:**
- Total plans completed: 22
- Average duration: ~50 seconds
- Total execution time: ~18 minutes

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
- [D-0602-1] Quadratic ease-out for alpha fade (alpha*alpha) gives snappier visual feel
- [D-0602-2] Glow effect via canvas shadowColor/shadowBlur for visual interest without complexity
- [D-0602-3] Render after HUD but before Game Over overlay for correct z-ordering
- [D-0601-1] MENU state as initial (game no longer auto-starts)
- [D-0601-2] localStorage wrapped in try/catch for private browsing compat
- [D-0601-3] Personal best saved on STATE_CHANGE to GAME_OVER (event-driven)
- [D-0603-1] Separate keydown listener for name entry (not extending core input.js)
- [D-0603-2] Phase-based game-over screen ('display'|'name-entry'|'done') controls flow
- [D-0603-3] isReadyToRestart() export gates KEY_PRESS to prevent restart during name entry
- [D-0701-1] Pixel sprite stored as 16x16 2D array with colour indices (0=transparent, 1-3=palette)
- [D-0701-2] Shadow reset to transparent after obstacle loop to prevent glow bleed
- [D-0701-3] Math.ceil for pixel size ensures no sub-pixel gaps in sprite rendering
- [D-0702-1] Start title uses cyan glow (shadowBlur 15) for neon pop
- [D-0702-2] Game-over title uses magenta glow for dramatic contrast against cyan start
- [D-0702-3] Ground horizon line drawn at 30% opacity cyan for subtle neon edge
- [D-0801-1] Ring buffer size 10 for FPS averaging (responsive but smooth)
- [D-0801-2] Particle gravity at 400 px/s^2 for natural downward arc
- [D-0801-3] Pool pre-allocates 40 (10 buffer over 30 max) to avoid runtime alloc
- [D-0802-1] Spawn 3 batches of 3 particles (9 total) with different colors for variety
- [D-0802-2] Player flash uses 60% alpha white rect overlay (simple, effective for pixel art)
- [D-0802-3] Flash duration 100ms — short enough to feel snappy, long enough to notice
- [D-0803-1] Listen to LIFE_LOST (not OBSTACLE_MISSED) for screen flash — semantically correct damage signal
- [D-0803-2] 30% max opacity magenta overlay — noticeable but not blinding
- [D-0803-3] Timer reset (assign) not accumulate — prevents flicker on rapid hits
- [D-0901-1] AudioContext created on first keydown (not on load) for autoplay policy compliance
- [D-0901-2] Music muted by default, toggle-on design
- [D-0901-3] Gain node chain: master -> sfx/music (separate volume control per channel)
- [D-0902-1] Consolidated STATE_CHANGE listener handles both playGameOver and stopMusic
- [D-0902-2] M-key listener is separate from audio-resume keydown (not merged)
- [D-0902-3] HUD hint uses DIM palette color for unobtrusive visibility

### Pending Todos

None.

### Blockers/Concerns

None.

## Context for Next Session

- Phase 9 COMPLETE - all audio wired to game events
- src/systems/audio.js: OBSTACLE_DESTROYED->playPop, LIFE_LOST->playThud, LEVEL_UP->playLevelUp, STATE_CHANGE(game_over)->playGameOver+stopMusic
- M-key toggles music, "[M] Music" HUD hint in bottom-right
- All 6 AUD requirements satisfied (AUD-01 through AUD-06)
- Zero audio files — 100% procedural Web Audio API synthesis
- Build: 20.04kB / 7.23kB gzipped (29 modules)
- Next: Phase 10 (Performance & Deployment)

## Session Continuity

Last session: 2026-05-09T22:25:34Z
Stopped at: Completed 09-02-PLAN.md (Phase 9 complete)
Resume file: None
