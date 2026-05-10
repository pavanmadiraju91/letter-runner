# Roadmap: Letter Runner

## Overview

Letter Runner goes from empty repo to shippable game across 10 phases. The build order follows research guidance: establish the core loop with placeholder graphics first so gameplay feel can be tuned immediately, then layer scoring and progression, then polish with visuals and audio, and finally harden for deployment. Each phase delivers a playable (or verifiable) increment.

## Milestones

- v1.0 MVP - Phases 1-10 (shipped 2026-05-09)
- v1.1 Polish & Depth - Phases 11-16 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-10) - SHIPPED 2026-05-09</summary>

- [x] **Phase 1: Foundation** - Project scaffolding, game loop, canvas rendering infrastructure
- [x] **Phase 2: Movement & Input** - Player runs, obstacles scroll, keyboard destroys them
- [x] **Phase 3: Lives & Game State** - Life system, game over, state machine, restart
- [x] **Phase 4: Scoring & HUD** - Points, multipliers, survival bonus, heads-up display
- [x] **Phase 5: Difficulty Progression** - Level system, speed ramp, obstacle count scaling
- [x] **Phase 6: Screens & Flow** - Start screen, game over screen, leaderboard UI, name entry
- [x] **Phase 7: Visual Style** - Pixel-art aesthetic, sprites, neon colour palette
- [x] **Phase 8: Particle Effects & Juice** - Destroy particles, flashes, level-up overlay
- [x] **Phase 9: Audio** - Sound effects, background music, autoplay policy handling
- [x] **Phase 10: Performance & Deployment** - Cross-browser, responsive scaling, optimization, deploy

</details>

### v1.1 Polish & Depth

- [x] **Phase 11: Cleanup** - Remove leaderboard UI, name entry, and module to simplify game-over flow
- [x] **Phase 12: Speed & Difficulty** - Chrome dino-style speed progression with typing-research calibration
- [x] **Phase 13: Multi-Letter Combos** - 2-3 letter sequence obstacles at higher levels
- [x] **Phase 14: Audio** - MP3 background track replacing procedural oscillator music
- [x] **Phase 15: Visual Polish** - Player animation, parallax background, glow performance, letter readability
- [ ] **Phase 16: Theme** - System-aware dark/light mode with reactive switching

## Phase Details

### Phase 11: Cleanup
**Goal:** The game-over screen is simplified to score, personal best, delta, and play-again prompt with all leaderboard code removed.
**Depends on:** Phase 10 (v1.0 complete)
**Requirements:** REM-01, REM-02, REM-03, REM-04
**Success Criteria** (what must be TRUE):
1. Game-over screen shows final score, personal best, score delta, and "Play again" prompt only
2. No name entry prompt or initials input appears anywhere in the game flow
3. The leaderboard.js module is deleted and no imports reference it
4. Game-over to restart flow works identically to before (same key restarts)

**Plans:** TBD

Plans:
- [ ] 11-01: Remove leaderboard module and game-over simplification

---

### Phase 12: Speed & Difficulty
**Goal:** Speed progression feels like Chrome dino game: linear ramp from comfortable to challenging, with a hard cap that keeps the game theoretically beatable.
**Depends on:** Phase 11
**Requirements:** SPD-01, SPD-02, SPD-03, SPD-04, SPD-05, SPD-06, SPD-07
**Success Criteria** (what must be TRUE):
1. Speed starts slow enough that a 40 WPM typist (300ms reaction) can comfortably destroy obstacles
2. Speed caps at approximately 2x starting speed, requiring ~150ms reaction time at peak
3. First obstacle does not appear until 2 seconds into a run (warm-up grace period)
4. Minimum gap between obstacles always allows a physically possible reaction (never unfair deaths)
5. Most player deaths occur in the 30-60 second engagement window

**Plans:** 2 plans

Plans:
- [ ] 12-01-PLAN.md — Continuous speed formula, warm-up gate, and dynamic gap fairness
- [ ] 12-02-PLAN.md — Spawn interval derivation, config cleanup, and engagement tuning

---

### Phase 13: Multi-Letter Combos
**Goal:** Players encounter multi-letter sequence obstacles at higher levels that reward fast sequential typing with bonus points.
**Depends on:** Phase 12
**Requirements:** COMBO-01, COMBO-02, COMBO-03, COMBO-04, COMBO-05, COMBO-06, COMBO-07, COMBO-08, COMBO-09
**Success Criteria** (what must be TRUE):
1. At level 4+, wider obstacles with 2-letter sequences appear and must be typed left-to-right
2. At level 7+, 3-letter combo obstacles appear with the same sequential typing requirement
3. Each letter in a combo shows distinct visual state (green=done, yellow=next, red=pending)
4. Typing a wrong key mid-combo resets progress to zero and triggers the wrong-key penalty
5. Combo scoring awards 2.5x for 2-letter and 4x for 3-letter completions

**Plans:** 3 plans

Plans:
- [ ] 13-01-PLAN.md — Combo obstacle entity, spawner integration, and uniqueness rules
- [ ] 13-02-PLAN.md — Matcher logic for sequential combo input and reset penalty
- [ ] 13-03-PLAN.md — Combo rendering with per-letter visual state and scoring

---

### Phase 14: Audio
**Goal:** The game plays a real MP3 background track at low volume, replacing the procedural oscillator music.
**Depends on:** Phase 11
**Requirements:** MUS-01, MUS-02, MUS-03, MUS-04, MUS-05
**Success Criteria** (what must be TRUE):
1. "Tension Pixels.mp3" plays as background music from the public/ folder
2. Music volume is low (15-20%) and does not overpower sound effects
3. Music is muted by default and toggling M key starts/stops it
4. Music loops seamlessly without audible gaps or pops
5. The old procedural oscillator background music code is removed

**Plans:** TBD

Plans:
- [ ] 14-01: MP3 audio integration, volume, loop, and M-key toggle
- [ ] 14-02: Remove procedural oscillator background music

---

### Phase 15: Visual Polish
**Goal:** The game looks and feels significantly more polished with animated player sprite, layered parallax background, performant glow effects, and better letter readability.
**Depends on:** Phase 12
**Requirements:** VIS-01, VIS-02, VIS-03, VIS-04, VIS-05, VIS-06
**Success Criteria** (what must be TRUE):
1. Player sprite has a visible multi-frame run animation cycle (not static)
2. Background has parallax depth: distant stars move slowly, grid lines move at medium speed
3. Obstacle letters pulse/glow when entering the danger zone, drawing the player's eye
4. Glow effects use screen-blend technique instead of shadowBlur (no performance regression)
5. Letters on obstacles are 26-28px bold with dark outline, readable at maximum speed

**Plans:** 2 plans

Plans:
- [ ] 15-01-PLAN.md — Animated cat sprite with vertical bob + parallax background
- [ ] 15-02-PLAN.md — Screen-blend glow, danger-zone pulse, and letter readability

---

### Phase 16: Theme
**Goal:** The game respects the user's system color scheme preference with a full dark/light mode that adapts reactively.
**Depends on:** Phase 15
**Requirements:** THM-01, THM-02, THM-03, THM-04, THM-05
**Success Criteria** (what must be TRUE):
1. Game detects system prefers-color-scheme and applies the matching palette on load
2. Dark mode retains the existing neon-on-dark palette unchanged
3. Light mode uses an alternate palette with dark text on light background and muted accents
4. Changing system preference mid-session switches the theme reactively without restart
5. All screens (start, gameplay HUD, game-over) correctly adapt to the current theme

**Plans:** TBD

Plans:
- [ ] 16-01: Theme detection, palette abstraction, and reactive switching
- [ ] 16-02: Light mode palette design and full-screen adaptation

---

## Progress

**Execution Order:**
Phases execute in numeric order: 11 -> 12 -> 13 -> 14 -> 15 -> 16
(Phase 14 may run in parallel with 12/13 as it is independent)

| Phase | Plans Complete | Status | Completed |
|-------|---------------|--------|-----------|
| 11. Cleanup | 0/1 | Not started | - |
| 12. Speed & Difficulty | 0/2 | Not started | - |
| 13. Multi-Letter Combos | 0/3 | Not started | - |
| 14. Audio | 0/2 | Not started | - |
| 15. Visual Polish | 0/4 | Not started | - |
| 16. Theme | 0/2 | Not started | - |
