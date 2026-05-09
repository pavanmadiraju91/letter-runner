---
phase: 08-particles-juice
plan: 01
subsystem: particles
tags: [particles, fps-monitor, performance, pool]
dependency_graph:
  requires: [01-02, 02-02]
  provides: [particle-system, fps-monitor, performance-gate]
  affects: [08-02, 08-03, 08-04]
tech_stack:
  added: []
  patterns: [ring-buffer-fps, pooled-particles, performance-gate]
key_files:
  created:
    - src/systems/fps-monitor.js
    - src/systems/particles.js
  modified:
    - src/config.js
    - src/main.js
decisions:
  - id: D-0801-1
    summary: Ring buffer size 10 for FPS averaging (responsive but smooth)
  - id: D-0801-2
    summary: Particle gravity at 400 px/s^2 for natural downward arc
  - id: D-0801-3
    summary: Pool pre-allocates 40 (10 buffer over 30 max) to avoid runtime alloc
metrics:
  duration: 88s
  completed: 2026-05-09
---

# Phase 08 Plan 01: Particle Infrastructure Summary

**One-liner:** Pooled particle system (30 cap) with ring-buffer FPS monitor gating spawns below 30fps

## What Was Done

### Task 1: FPS Monitor Module
- Created `src/systems/fps-monitor.js` with ring-buffer rolling average
- 10-sample ring buffer stores dt values per frame
- `isFPSLow()` computes average FPS and returns true when below 30
- Module-level closure pattern consistent with lives/score/difficulty

### Task 2: Particle System with Pool and Performance Cap
- Added `PARTICLES` config section to `src/config.js` (MAX_ACTIVE: 30, POOL_SIZE: 40, MIN_FPS: 30)
- Created `src/systems/particles.js` using generic `createPool` from pool.js
- `canSpawnParticles()` gates on both pool capacity (VFX-09) and FPS threshold (VFX-10)
- `spawnParticles()` emits particles with random angle, speed, size, lifetime
- `updateParticles()` applies velocity, gravity (400 px/s^2), lifetime decay, and auto-releases dead particles
- `renderParticles()` draws colored squares with alpha fade using single ctx.save/restore

### Task 3: Wire into Game Loop
- `updateFPS(dt)` called at top of update (runs in ALL states for accurate monitoring)
- `updateParticles(dt)` called after level-announce during PLAYING state
- `renderParticles(ctx)` renders after level-announce, before game-over overlay
- Initialization: `createFPSMonitor()` and `createParticleSystem()` at startup

## Decisions Made

| ID | Decision | Rationale |
|----|----------|-----------|
| D-0801-1 | Ring buffer size 10 for FPS averaging | Responsive to drops without jitter from single-frame spikes |
| D-0801-2 | Particle gravity 400 px/s^2 | Natural downward arc without overly fast fall |
| D-0801-3 | Pool pre-allocates 40 (10 buffer over 30 max) | Avoids runtime allocation while not over-allocating memory |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- Build: passes (67ms, no errors)
- MAX_ACTIVE=30 in config: confirmed
- isFPSLow used in particles.js: confirmed
- updateFPS wired in main.js: confirmed
- No visual changes (expected - spawn triggers come in 08-02 and 08-03)

## Next Phase Readiness

Plan 08-02 and 08-03 can now:
- Import `canSpawnParticles` and `spawnParticles` from particles.js
- Wire event handlers (OBSTACLE_DESTROYED, WRONG_KEY, etc.) to emit particles
- All infrastructure is in place; no blockers

## Commits

| Hash | Message |
|------|---------|
| bbb7a1c | feat(08-01): add FPS monitor module with ring-buffer rolling average |
| ee8f3f1 | feat(08-01): add particle system with pool and performance cap |
| 5f30602 | feat(08-01): wire FPS monitor and particle system into game loop |
