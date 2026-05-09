# Roadmap: Letter Runner

## Overview

Letter Runner goes from empty repo to shippable game across 10 phases. The build order follows research guidance: establish the core loop with placeholder graphics first so gameplay feel can be tuned immediately, then layer scoring and progression, then polish with visuals and audio, and finally harden for deployment. Each phase delivers a playable (or verifiable) increment.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Project scaffolding, game loop, canvas rendering infrastructure
- [x] **Phase 2: Movement & Input** - Player runs, obstacles scroll, keyboard destroys them
- [x] **Phase 3: Lives & Game State** - Life system, game over, state machine, restart
- [x] **Phase 4: Scoring & HUD** - Points, multipliers, survival bonus, heads-up display
- [x] **Phase 5: Difficulty Progression** - Level system, speed ramp, obstacle count scaling
- [x] **Phase 6: Screens & Flow** - Start screen, game over screen, leaderboard UI, name entry
- [x] **Phase 7: Visual Style** - Pixel-art aesthetic, sprites, neon colour palette
- [x] **Phase 8: Particle Effects & Juice** - Destroy particles, flashes, level-up overlay
- [x] **Phase 9: Audio** - Sound effects, background music, autoplay policy handling
- [ ] **Phase 10: Performance & Deployment** - Cross-browser, responsive scaling, optimization, deploy

## Phase Details

### Phase 1: Foundation

**Goal:** A blank canvas renders at 60fps with a proper game loop, event bus, and project structure ready to receive game entities.
**Depends on:** None (first phase)
**Requirements:** TECH-01, TECH-02, TECH-12
**Success Criteria** (what must be TRUE):
1. Opening index.html in a browser shows a full-viewport dark canvas
2. The game loop runs at 60fps with delta-time available to all update calls
3. Canvas renders crisply on retina displays (DPR-aware scaling)
4. An event bus exists and can publish/subscribe messages between decoupled modules

**Plans:** 2 plans

Plans:
- [ ] 01-01-PLAN.md — Project scaffolding, Vite config, index.html with dark canvas
- [ ] 01-02-PLAN.md — Game loop, event bus, DPR-aware canvas, main.js wiring

---

### Phase 2: Movement & Input

**Goal:** A player character runs across a scrolling ground while letter-bearing obstacles approach from the right, and pressing the correct key destroys them.
**Depends on:** Phase 1
**Requirements:** LOOP-01, LOOP-02, LOOP-03, LOOP-04, TECH-07, TECH-11
**Success Criteria** (what must be TRUE):
1. A player rectangle runs automatically on a side-scrolling ground plane
2. Rectangular obstacles scroll from the right edge, each displaying a visible uppercase letter
3. Pressing the matching key while the obstacle is in the danger zone removes it from the screen
4. Pressing a non-matching key has no visible effect
5. Object pooling is used for obstacles (no garbage collection hitches during play)

**Plans:** 3 plans

Plans:
- [ ] 02-01-PLAN.md — Player entity, ground plane, and scrolling
- [ ] 02-02-PLAN.md — Obstacle spawner with letter assignment and object pooling
- [ ] 02-03-PLAN.md — Keyboard input handler and letter-matching collision

---

### Phase 3: Lives & Game State

**Goal:** The game has a complete play cycle: start playing, lose lives when obstacles pass, trigger game over when all lives are spent, and restart with one key press.
**Depends on:** Phase 2
**Requirements:** LOOP-06, LOOP-07, LOOP-08, LOOP-10, LOOP-11, TECH-09, UI-13
**Success Criteria** (what must be TRUE):
1. An obstacle crossing the player's X position without being destroyed costs one life
2. Losing all 3 lives triggers a Game Over state that stops gameplay
3. Pressing a key on the Game Over state restarts the run in under 1 second
4. Wrong key presses have no penalty at levels 1-3 but introduce input delay at level 4+
5. Switching browser tabs pauses the game; returning resumes it

**Plans:** 3 plans

Plans:
- [ ] 03-01-PLAN.md — Life system: OBSTACLE_MISSED decrements lives, GAME_OVER on zero
- [ ] 03-02-PLAN.md — State machine (Playing/GameOver) with restart logic in main.js
- [ ] 03-03-PLAN.md — Wrong-key penalty (level 4+) and visibility-change pause

---

### Phase 4: Scoring & HUD

**Goal:** Players see their score increasing in real time via a heads-up display showing score, level, and lives.
**Depends on:** Phase 3
**Requirements:** LOOP-05, LOOP-09, UI-05, UI-06, UI-07
**Success Criteria** (what must be TRUE):
1. Destroying an obstacle awards visible points (+10 x level multiplier)
2. Score increases by +1 per second of survival while playing
3. HUD displays current score (top-left), level (top-center), and lives as heart icons (top-right)
4. HUD updates in real time without causing layout shifts or flickering

**Plans:** 2 plans

Plans:
- [ ] 04-01-PLAN.md — Score system (destroy points + survival bonus + reset)
- [ ] 04-02-PLAN.md — HUD renderer (score top-left, level top-center, hearts top-right)

---

### Phase 5: Difficulty Progression

**Goal:** The game gets progressively harder as the player destroys obstacles, with scroll speed, spawn rate, obstacle count, and multiplier all escalating across defined level tiers.
**Depends on:** Phase 4
**Requirements:** DIFF-01, DIFF-02, DIFF-03, DIFF-04, DIFF-05, DIFF-06, DIFF-07, DIFF-08, DIFF-09
**Success Criteria** (what must be TRUE):
1. A new level triggers every 10 obstacles destroyed (not spawned)
2. Level 1 feels slow and approachable (1 obstacle, slow scroll, x1 multiplier)
3. By level 4+, multiple obstacles appear simultaneously with faster scroll speed
4. All visible obstacles always have unique letters (no repeats on screen)
5. Difficulty curve feels logarithmic (noticeable early jumps, gentler increases at high levels)

**Plans:** 3 plans

Plans:
- [ ] 05-01-PLAN.md — Config-driven difficulty tiers and level-up emission system
- [ ] 05-02-PLAN.md — Wire dynamic difficulty into spawner and main game loop
- [ ] 05-03-PLAN.md — Unique letter enforcement hardening and logarithmic curve validation

---

### Phase 6: Screens & Flow

**Goal:** The game has a complete screen flow: an inviting start screen with personal best, a detailed game over screen with leaderboard and name entry, and seamless transitions between all states.
**Depends on:** Phase 5
**Requirements:** UI-01, UI-02, UI-03, UI-04, UI-08, UI-09, UI-10, UI-11, UI-12, TECH-08
**Success Criteria** (what must be TRUE):
1. Start screen shows a logo, "Press any key to start" prompt, and personal best score
2. Game Over screen shows final score, personal best, delta, and a mocked top-10 leaderboard
3. If score is in top 10, player can enter 3-character initials
4. Personal best persists across browser sessions (localStorage)
5. Level-up announcement appears as large centered text that fades out

**Plans:** 3 plans

Plans:
- [ ] 06-01-PLAN.md — MENU state, localStorage persistence, start screen with personal best
- [ ] 06-02-PLAN.md — Level-up announcement overlay with timed fade
- [ ] 06-03-PLAN.md — Game Over screen with leaderboard and name entry

---

### Phase 7: Visual Style

**Goal:** The game looks like a cohesive pixel-art product with neon-on-dark palette, a character sprite, and styled obstacle blocks replacing placeholder rectangles.
**Depends on:** Phase 6
**Requirements:** VFX-01, VFX-02, VFX-03
**Success Criteria** (what must be TRUE):
1. The game uses a consistent neon-on-dark colour palette throughout all screens
2. The player character is a 16x16 pixel sprite (not a plain rectangle)
3. Obstacles appear as chunky styled blocks with letters in a contrasting colour
4. The overall aesthetic reads as intentional pixel art, not programmer art

**Plans:** 2 plans

Plans:
- [ ] 07-01-PLAN.md — Neon palette definition, player pixel sprite, obstacle neon styling
- [ ] 07-02-PLAN.md — Apply palette to all screens, HUD, ground, and overlays

---

### Phase 8: Particle Effects & Juice

**Goal:** Destroying obstacles, losing lives, and leveling up all produce satisfying visual feedback that makes the game feel alive and responsive.
**Depends on:** Phase 7
**Requirements:** VFX-04, VFX-05, VFX-06, VFX-07, VFX-08, VFX-09, VFX-10
**Success Criteria** (what must be TRUE):
1. Destroying an obstacle produces a burst of particle fragments
2. The player flashes white briefly on a correct key press
3. Losing a life causes a red screen flash and dims the corresponding heart icon
4. Level-up triggers a full-screen overlay text that fades in and out
5. Particle count never exceeds 30 active particles; effects are skipped if FPS drops below 30

**Plans:** 3 plans

Plans:
- [ ] 08-01-PLAN.md — Particle system with object pooling, FPS monitor, and performance cap
- [ ] 08-02-PLAN.md — Destroy effects (shatter particles + player white flash)
- [ ] 08-03-PLAN.md — Damage effects (red screen flash + heart dim verification)

---

### Phase 9: Audio

**Goal:** The game has satisfying audio feedback for all key actions plus an optional background music loop, all respecting browser autoplay policies.
**Depends on:** Phase 8
**Requirements:** AUD-01, AUD-02, AUD-03, AUD-04, AUD-05, AUD-06
**Success Criteria** (what must be TRUE):
1. Pressing a correct key plays a short satisfying "pop" sound
2. An obstacle passing the player plays a "thud" sound
3. Game Over plays a descending tone
4. An optional lo-fi background loop can be toggled, muted by default
5. Audio works on first interaction in all browsers (AudioContext resumed on user gesture)

**Plans:** 2 plans

Plans:
- [ ] 09-01-PLAN.md — Web Audio API infrastructure, procedural synthesis, autoplay policy handling, background music
- [ ] 09-02-PLAN.md — Wire sound effects to game events and add M-key music toggle

---

### Phase 10: Performance & Deployment

**Goal:** The game loads fast, runs smoothly across all target browsers, scales to different viewports, and is deployed as a static site.
**Depends on:** Phase 9
**Requirements:** TECH-03, TECH-04, TECH-05, TECH-06, TECH-10
**Success Criteria** (what must be TRUE):
1. Total assets are under 500KB uncompressed
2. Game is playable within 2 seconds of page load on a 10Mbps connection
3. Game works correctly in Chrome, Firefox, Safari, and Edge (latest 2 versions)
4. Canvas scales responsively with minimum viewport 800x400px
5. Game is deployed and accessible via a public URL (GitHub Pages or Netlify)

**Plans:** TBD

Plans:
- [ ] 10-01: Asset budget audit and optimization
- [ ] 10-02: Cross-browser testing and compatibility fixes
- [ ] 10-03: Responsive canvas scaling
- [ ] 10-04: Static deployment pipeline (GitHub Pages)

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 1. Foundation | 2/2 | ✓ Complete | 2026-05-09 |
| 2. Movement & Input | 0/3 | Planned | - |
| 3. Lives & Game State | 0/3 | Not started | - |
| 4. Scoring & HUD | 0/2 | Not started | - |
| 5. Difficulty Progression | 0/3 | Not started | - |
| 6. Screens & Flow | 0/3 | Not started | - |
| 7. Visual Style | 0/3 | Not started | - |
| 8. Particle Effects & Juice | 0/4 | Not started | - |
| 9. Audio | 0/3 | Not started | - |
| 10. Performance & Deployment | 0/4 | Not started | - |
