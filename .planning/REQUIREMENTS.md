# Requirements: Letter Runner

**Defined:** 2026-05-09
**Core Value:** The game must feel immediately fun — start instantly, see letters clearly, press keys satisfyingly, and feel difficulty rising in a way that challenges without frustrating.

## v1 Requirements

### Core Loop

- [ ] **LOOP-01**: Player character runs automatically left-to-right on a side-scrolling ground plane
- [ ] **LOOP-02**: Obstacles scroll toward player from right edge at speed determined by current level
- [ ] **LOOP-03**: Each obstacle displays a single uppercase letter (A–Z) clearly visible before reaching danger zone
- [ ] **LOOP-04**: Player presses matching key while obstacle is in danger zone (right half of screen) to destroy it
- [ ] **LOOP-05**: Destroyed obstacle awards +10 × current level multiplier points
- [ ] **LOOP-06**: Obstacle crossing player's X position without being destroyed costs one life
- [ ] **LOOP-07**: Player starts with 3 lives; losing all 3 triggers Game Over
- [ ] **LOOP-08**: No way to gain extra lives mid-run
- [ ] **LOOP-09**: Survival bonus of +1 point per second of active play
- [ ] **LOOP-10**: Wrong key press has no effect (no penalty, no feedback) at levels 1–3
- [ ] **LOOP-11**: Wrong key press introduces a small input delay penalty at level 4+

### Difficulty Progression

- [ ] **DIFF-01**: New level reached every 10 obstacles destroyed (not spawned)
- [ ] **DIFF-02**: Level 1: slow scroll, 1 obstacle at a time, ×1 multiplier
- [ ] **DIFF-03**: Levels 2–3: medium scroll, 1–2 obstacles, ×1.5 multiplier
- [ ] **DIFF-04**: Levels 4–5: fast scroll, 2 obstacles, ×2 multiplier, tall obstacles introduced
- [ ] **DIFF-05**: Level 6+: very fast scroll, 2–3 obstacles, ×3+ multiplier, obstacles at 2 heights
- [ ] **DIFF-06**: Up to 4 simultaneous on-screen obstacles maximum
- [ ] **DIFF-07**: All visible obstacles have unique letters (no repeats among on-screen obstacles)
- [ ] **DIFF-08**: Letter selection is random with no repeats among currently visible obstacles
- [ ] **DIFF-09**: Difficulty curve follows logarithmic progression (not linear) per research recommendation

### Screens & UI

- [ ] **UI-01**: Start screen with game logo and tagline
- [ ] **UI-02**: Start screen shows "Press any key to start" prompt
- [ ] **UI-03**: Start screen displays current personal best (from localStorage)
- [ ] **UI-04**: Start screen displays top global score placeholder
- [ ] **UI-05**: In-game HUD: score (top-left)
- [ ] **UI-06**: In-game HUD: current level (top-center)
- [ ] **UI-07**: In-game HUD: lives as heart icons (top-right)
- [ ] **UI-08**: Level-up announcement: large centered text fades out in ~1.5s
- [ ] **UI-09**: Game Over screen: final score, personal best, and delta from personal best
- [ ] **UI-10**: Game Over screen: leaderboard showing top 10 with initials and score (mocked data)
- [ ] **UI-11**: Game Over screen: name entry (3-character initials) if score is in top 10
- [ ] **UI-12**: Game Over screen: "Play again" CTA
- [ ] **UI-13**: Death-to-play restart under 1 second (one key press to restart)

### Visual Style & Effects

- [ ] **VFX-01**: Pixel-art aesthetic with neon-on-dark colour palette
- [ ] **VFX-02**: Player character as 16×16 pixel sprite
- [ ] **VFX-03**: Obstacles as chunky rectangular blocks with letter in contrasting colour
- [ ] **VFX-04**: Correct key: obstacle shatters into particle fragments
- [ ] **VFX-05**: Correct key: brief white flash on the player character
- [ ] **VFX-06**: Life lost: screen red-flash for ~200ms
- [ ] **VFX-07**: Life lost: life heart icon dims
- [ ] **VFX-08**: Level up: full-screen overlay text fades in/out
- [ ] **VFX-09**: Particle system capped at 30 active particles
- [ ] **VFX-10**: Skip particle effects if frame rate drops below 30fps

### Audio

- [ ] **AUD-01**: Correct key press: short satisfying "pop" sound
- [ ] **AUD-02**: Obstacle passes player: lower "thud" sound
- [ ] **AUD-03**: Game over: descending tone
- [ ] **AUD-04**: Optional lo-fi background loop, muted by default
- [ ] **AUD-05**: Audio respects browser autoplay policy (resume AudioContext on first user interaction)
- [ ] **AUD-06**: Level-up: optional upbeat jingle

### Technical

- [ ] **TECH-01**: Built with HTML5 Canvas + vanilla JavaScript (no frameworks)
- [ ] **TECH-02**: Game loop runs at 60fps using requestAnimationFrame with delta-time
- [ ] **TECH-03**: All assets (sprites, fonts, audio) under 500KB total uncompressed
- [ ] **TECH-04**: Playable within 2 seconds of page load on 10Mbps connection
- [ ] **TECH-05**: Works in Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] **TECH-06**: Minimum viewport 800×400px with responsive canvas scaling
- [ ] **TECH-07**: Keyboard input via keydown events, normalise to uppercase
- [ ] **TECH-08**: Personal best stored in localStorage
- [ ] **TECH-09**: Game pauses when browser tab/window loses focus
- [ ] **TECH-10**: Deployable as static files to GitHub Pages or Netlify
- [ ] **TECH-11**: Object pooling for obstacles and particles (no GC during gameplay)
- [ ] **TECH-12**: DPR-aware canvas rendering (crisp on retina displays)

## v2 Requirements

### Social & Sharing

- **SOCL-01**: Share button copies score text snippet to clipboard
- **SOCL-02**: Real leaderboard backend (Firebase or KV store)
- **SOCL-03**: Global leaderboard — top 100 entries retained
- **SOCL-04**: Daily challenge mode (same letter seed for all players)

### Polish

- **POL-01**: Multiple character skins
- **POL-02**: Screen shake on damage (subtle)
- **POL-03**: Combo system with escalating visual feedback
- **POL-04**: Post-run typing stats (WPM, accuracy)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile / touch support | Desktop keyboard game — touch adds complexity with no v1 gain |
| Multiplayer / co-op | Single-player is the core experience |
| Power-ups / abilities | Keep the loop pure: type to destroy |
| Multi-letter / word obstacles | Single keys only for v1, words add complexity to input handling |
| Offline / PWA mode | Unnecessary for a web game with no account |
| Account system / login | localStorage is sufficient for v1 |
| Tutorial / onboarding flow | Game teaches itself in <10 seconds (research confirms) |
| Monetization | Not relevant for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LOOP-01 | 2 | Complete |
| LOOP-02 | 2 | Complete |
| LOOP-03 | 2 | Complete |
| LOOP-04 | 2 | Complete |
| LOOP-05 | 4 | Pending |
| LOOP-06 | 3 | Pending |
| LOOP-07 | 3 | Pending |
| LOOP-08 | 3 | Pending |
| LOOP-09 | 4 | Pending |
| LOOP-10 | 3 | Pending |
| LOOP-11 | 3 | Pending |
| DIFF-01 | 5 | Pending |
| DIFF-02 | 5 | Pending |
| DIFF-03 | 5 | Pending |
| DIFF-04 | 5 | Pending |
| DIFF-05 | 5 | Pending |
| DIFF-06 | 5 | Pending |
| DIFF-07 | 5 | Pending |
| DIFF-08 | 5 | Pending |
| DIFF-09 | 5 | Pending |
| UI-01 | 6 | Pending |
| UI-02 | 6 | Pending |
| UI-03 | 6 | Pending |
| UI-04 | 6 | Pending |
| UI-05 | 4 | Pending |
| UI-06 | 4 | Pending |
| UI-07 | 4 | Pending |
| UI-08 | 6 | Pending |
| UI-09 | 6 | Pending |
| UI-10 | 6 | Pending |
| UI-11 | 6 | Pending |
| UI-12 | 6 | Pending |
| UI-13 | 3 | Pending |
| VFX-01 | 7 | Pending |
| VFX-02 | 7 | Pending |
| VFX-03 | 7 | Pending |
| VFX-04 | 8 | Pending |
| VFX-05 | 8 | Pending |
| VFX-06 | 8 | Pending |
| VFX-07 | 8 | Pending |
| VFX-08 | 8 | Pending |
| VFX-09 | 8 | Pending |
| VFX-10 | 8 | Pending |
| AUD-01 | 9 | Pending |
| AUD-02 | 9 | Pending |
| AUD-03 | 9 | Pending |
| AUD-04 | 9 | Pending |
| AUD-05 | 9 | Pending |
| AUD-06 | 9 | Pending |
| TECH-01 | 1 | Complete |
| TECH-02 | 1 | Complete |
| TECH-03 | 10 | Pending |
| TECH-04 | 10 | Pending |
| TECH-05 | 10 | Pending |
| TECH-06 | 10 | Pending |
| TECH-07 | 2 | Complete |
| TECH-08 | 6 | Pending |
| TECH-09 | 3 | Pending |
| TECH-10 | 10 | Pending |
| TECH-11 | 2 | Complete |
| TECH-12 | 1 | Complete |

**Coverage:**
- v1 requirements: 51 total
- Mapped to phases: 51
- Unmapped: 0

---
*Requirements defined: 2026-05-09*
*Last updated: 2026-05-09 — phases assigned during roadmap creation*
