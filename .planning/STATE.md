# Project State: Letter Runner

## Current Status

**Active milestone:** v1.1 Polish & Depth
**Active phase:** Phase 15 (Visual Polish) — in progress
**Last action:** Completed 15-01-PLAN.md (Sprite Animation & Parallax)
**Last updated:** 2026-05-10

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-10)

**Core value:** The game must feel immediately fun
**Current focus:** v1.1 — polish, multi-letter combos, speed research, visual upgrade

## Phase Progress

| Phase | Status |
|-------|--------|
| 11. Cleanup | Complete (1/1 plans) |
| 12. Speed & Difficulty | Complete (2/2 plans) |
| 13. Multi-Letter Combos | Complete (3/3 plans) |
| 14. Audio | Complete (1/1 plans) |
| 15. Visual Polish | In progress (1/2 plans) |
| 16. Theme | Not started |

Progress: [████████░░░░░░░] 53% (8/15 plans)

## Performance Metrics

**v1.0 Velocity:**
- Total plans completed: 24
- Average duration: ~50 seconds
- Total execution time: ~20 minutes

**v1.1 Velocity:**
- Plans completed: 8
- Average duration: ~60 seconds
- Total execution time: <9 min

## Accumulated Context

### Decisions

- Vanilla JS + Canvas (no frameworks)
- Event bus architecture (pub/sub)
- Object pooling for obstacles and particles
- Background music: MP3 via fetch/decodeAudioData/BufferSourceNode, loop=true, 15% vol (Phase 14)
- GitHub Pages deployment via Actions
- Chrome dino speed model: linear acceleration with hard cap at 2x (Phase 12)
- Speed decoupled from tiers: time-based speed, destroy-based features (Phase 12)
- Dynamic gap: max(120px, speed*0.2+48px) guarantees 200ms reaction (Phase 12)
- 2-second warmup gate before first obstacle spawns (Phase 12)
- Spawn interval inversely proportional to speed: 2.5*(140/speed), floor 0.8s (Phase 12)
- TIERS simplified to complexity gates only (maxObstacles, multiplier, tallObstacles) (Phase 12)
- Multi-letter combos: sequential state machine, no input queue (Phase 13)
- Combo field coexistence: legacy `letter` for singles, `letters[]` for combos (Phase 13)
- Combo fallback: if not enough unique letters, gracefully degrade to single-letter (Phase 13)
- Combo priority: combo obstacles checked before singles in danger zone (Phase 13)
- Wrong-key semantics: only resets combo if no single-letter match exists (Phase 13)
- Combo render dispatch: separate renderSingleObstacle + renderComboObstacle paths (Phase 13)
- Glow: replace shadowBlur with screen-blend pre-rendered sprites (Phase 15)
- Sprite loading: Image().complete guard, no preload gate needed (Phase 15)
- Background parallax: scale to canvas height, tile horizontally at 10% speed (Phase 15)
- Leaderboard removed entirely — personal best via storage.js is sufficient (Phase 11)

### Pending Todos

None.

### Blockers/Concerns

- MP3 track (1.7MB) will push total assets above 500KB — acceptable for v1.1
- System dark/light detection needs testing across browsers (Phase 16)
- Light mode glow effects require different rendering approach (Phase 16)

## Context for Next Session

- v1.0 complete: 10 phases, 51 requirements, all verified
- v1.1 roadmap: 6 phases (11-16), 36 requirements, 15 plans
- Phase 11 complete: leaderboard removed, game-over simplified
- Phase 12 complete: continuous speed (140->280), warmup gate, dynamic gap, spawn pacing
- Phase 13 complete: combo config, factory, input matching, rendering, scoring
- Phase 14 complete: MP3 background music replaces procedural oscillator
- Phase 15 in progress: 15-01 done (sprite animation + parallax), 15-02 next (glow effects)
- Next step: 15-02-PLAN.md (glow/screen-blend sprites)

Last session: 2026-05-10T08:41:07Z
Stopped at: Completed 15-01-PLAN.md
Resume file: None
