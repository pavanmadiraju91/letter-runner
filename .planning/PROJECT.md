# Letter Runner

## What This Is

A browser-based endless runner game where obstacles carry letters and players destroy them by pressing the matching key. Combines the instant-pickup appeal of the Chrome dino game with the satisfying feedback of typing practice. Desktop-first, runs in a single browser tab with no install.

## Core Value

The game must feel immediately fun: start instantly, see letters clearly, press keys satisfyingly, and feel the difficulty rising in a way that challenges without frustrating.

## Current Milestone: v1.1 Polish & Depth

**Goal:** Make the game feel like a polished Chrome dino-quality experience with deeper typing challenge, better visuals, real music, and system-aware theming.

**Target features:**
- Remove leaderboard (simplify game-over flow)
- Multi-letter combos at higher levels (XY, ABC — short sequences)
- Research-driven speed scaling (Chrome dino pacing + typing test data)
- MP3 background track ("Tension Pixels") at low volume
- Improved pixel-art visuals (front-end design quality)
- Dark/light mode respecting system preference
- Live-tested difficulty feel

## Requirements

### Validated

- ✓ Player runs on scrolling ground, letter obstacles destroyed by keypress — v1.0
- ✓ 3-life system with game over and instant restart — v1.0
- ✓ Scoring with level multiplier and survival bonus — v1.0
- ✓ 6-tier difficulty progression with logarithmic scaling — v1.0
- ✓ Start screen, game-over screen, personal best persistence — v1.0
- ✓ Pixel-art neon aesthetic with particle effects — v1.0
- ✓ Procedural audio feedback (pop, thud, game-over, level-up) — v1.0
- ✓ Cross-browser, responsive, deployed to GitHub Pages — v1.0

### Active

- [ ] Remove leaderboard UI and name entry from game-over screen
- [ ] Multi-letter combo obstacles (2-3 chars) appear at higher levels
- [ ] Speed scaling informed by Chrome dino game research + typing test data
- [ ] Background music: "Tension Pixels.mp3" at low volume, toggle with M key
- [ ] Improved pixel-art visuals (higher quality sprites, effects, environment)
- [ ] Dark/light mode: detect system preference, neon palette for dark, alternate for light
- [ ] Difficulty tested live and tuned for satisfying feel

### Out of Scope

- Real leaderboard backend — removed entirely for simplicity
- Share button — deferred
- Daily challenge mode — deferred
- Word obstacles (real words) — only short random combos for now
- Mobile support — still desktop only

### Out of Scope

- Mobile / touch support — desktop keyboard game, mobile adds complexity with no clear gain
- Multiplayer or co-op — single-player is the core experience
- Power-ups or special abilities — keep the loop pure (type to destroy)
- Multiple character skins — defer to post v1.1
- Offline / PWA mode — unnecessary for a web game with no account
- Real leaderboard backend — removed for simplicity
- Daily challenge mode — deferred to v2.0

## Context

- Inspired by Chrome's no-internet dinosaur game but with a typing mechanic
- Target audience: casual players looking for quick sessions, plus competitive typists chasing scores
- Expected session length: 3–5 minutes
- The game subtly improves keyboard fluency over time — dual purpose (fun + skill building)
- Pixel-art style with 16×16 player sprite (humanoid or creature TBD)
- Obstacles are chunky rectangular blocks with contrasting letter colour

## Constraints

- **Tech stack**: HTML5 Canvas + vanilla JavaScript — no frameworks, no Phaser
- **Assets budget**: Under 500KB total (sprites, fonts, audio)
- **Load time**: Playable in under 2 seconds on 10Mbps
- **Performance**: 60fps, cap particles at 30, skip effects if framerate drops below 30fps
- **Browser support**: Chrome, Firefox, Safari, Edge — latest 2 versions each
- **Hosting**: Static files only (GitHub Pages or Netlify compatible)
- **No server-side code**: All gameplay logic client-side, leaderboard mocked locally

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vanilla Canvas + JS over Phaser | Lighter weight, no dependencies, full control, fits static hosting constraint | — Pending |
| Wrong-key delay at level 4+ | Raises stakes without punishing beginners; accessible early, challenging late | — Pending |
| Max 4 simultaneous obstacles | Visually intense at high levels but manageable; pushes typing speed ceiling | — Pending |
| Leaderboard mocked (no backend) | Ship the game first, validate fun before investing in infrastructure | — Pending |
| Static hosting (GH Pages / Netlify) | Zero cost, simple deploy, matches no-server constraint | — Pending |

---
*Last updated: 2026-05-10 after milestone v1.1 initialization*
