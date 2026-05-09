# Letter Runner

## What This Is

A browser-based endless runner game where obstacles carry letters and players destroy them by pressing the matching key. Combines the instant-pickup appeal of the Chrome dino game with the satisfying feedback of typing practice. Desktop-first, runs in a single browser tab with no install.

## Core Value

The game must feel immediately fun: start instantly, see letters clearly, press keys satisfyingly, and feel the difficulty rising in a way that challenges without frustrating.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Player character runs automatically left-to-right on a side-scrolling ground plane
- [ ] Obstacles scroll from right edge, each displaying a single uppercase letter (A–Z)
- [ ] Pressing the matching key while obstacle is in the danger zone destroys it with particle effects
- [ ] 3-life system — obstacle crossing player position costs a life, all lives lost ends the run
- [ ] Scoring: +10 × level multiplier per destroyed obstacle, +1/sec survival bonus
- [ ] Difficulty scales every 10 destroyed obstacles (speed, spawn rate, multiplier, obstacle count)
- [ ] Wrong key press introduces a small delay penalty at level 4+
- [ ] Up to 4 simultaneous on-screen obstacles (unique letters, no repeats among visible)
- [ ] Start screen with "Press any key to start", personal best, and placeholder global score
- [ ] HUD: score (top-left), level (top-center), lives as hearts (top-right), level-up announcement
- [ ] Game Over screen: final score, personal best, delta, leaderboard UI (mocked), share button, play again
- [ ] Leaderboard UI shows top 10 with initials and score (local mock data for now)
- [ ] Name entry (3-char initials) on game over if score is in top 10
- [ ] Share button copies score text snippet to clipboard
- [ ] Personal best stored in localStorage
- [ ] Pixel-art aesthetic with neon-on-dark colour palette
- [ ] Correct key: obstacle shatters into particles + brief white flash
- [ ] Life lost: screen red-flash ~200ms, life icon dims
- [ ] Level up: full-screen overlay text fade in/out
- [ ] Audio: correct key pop, obstacle pass thud, game over descending tone
- [ ] Optional lo-fi background loop, muted by default
- [ ] 60fps target on mid-range laptop
- [ ] All assets under 500KB total
- [ ] Playable within 2s of page load on 10Mbps connection
- [ ] Works in Chrome, Firefox, Safari, Edge (latest 2 versions)
- [ ] Minimum viewport 800×400px with responsive canvas scaling
- [ ] Deployable as static files to GitHub Pages or Netlify

### Out of Scope

- Mobile / touch support — desktop keyboard game, mobile adds complexity with no clear gain for v1
- Multiplayer or co-op — single-player is the core experience
- Power-ups or special abilities — keep the loop pure (type to destroy)
- Multiple character skins — defer to post-launch
- Multi-letter / word obstacles — single keys only for v1
- Offline / PWA mode — unnecessary for a web game with no account
- Real leaderboard backend — mock the UI, build backend post-launch
- Daily challenge mode — v1.1 feature per PRD

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
*Last updated: 2026-05-09 after initialization*
