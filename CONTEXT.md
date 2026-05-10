# Letter Runner — Milestone Context Document

**Last updated:** 2026-05-10
**Repo:** https://github.com/pavanmadiraju91/letter-runner
**Live:** https://pavanmadiraju91.github.io/letter-runner/
**Git identity:** Pavan Madiraju (pavanmadiraju91@users.noreply.github.com) — personal account, NOT LeanIX

---

## What This Is

A browser-based endless runner typing game. A pixel-art cat runs in space on a glowing cyan energy beam. Neon-colored letters/numbers float toward the cat — type them to destroy them before they reach you. Miss 3 and it's game over.

## Current State (v1.1 complete + polish iteration)

### What's Built
- 10 phases of v1.0 (foundation through deployment)
- 6 phases of v1.1 (cleanup, speed, combos, audio, visuals, theme)
- Several rounds of live-testing and polish fixes

### Tech Stack
- Vanilla JS + HTML5 Canvas (no frameworks)
- Vite 6.4 for dev/build
- Web Audio API (procedural SFX + MP3 background track)
- ~34KB JS bundle + 1.7MB music
- GitHub Pages deployment via Actions

---

## Architecture

```
src/
├── main.js              — Game bootstrap, state wiring, render loop
├── config.js            — ALL game constants + getSpeedConfig() + getGroundHeight()
├── core/
│   ├── canvas.js        — DPR-aware, uses visualViewport for mobile keyboard
│   ├── events.js        — Pub/sub event bus
│   ├── game-loop.js     — rAF with delta-time, startLoop/stopLoop/resumeLoop
│   ├── state.js         — State machine (MENU/PLAYING/GAME_OVER)
│   └── theme.js         — Forced dark mode (light mode removed)
├── entities/
│   ├── player.js        — Cat sprite animation (10 frames from cat-run.png)
│   ├── obstacle.js      — Floating glowing letters, wrong-key flash, combo rendering
│   ├── ground.js        — Just Y positioning (no rendering — bg handles visuals)
│   └── background.js    — Space: nebulae, stars, ground line, speed lines
├── systems/
│   ├── audio.js         — Web Audio: SFX (pop/thud/game-over/level-up/ding) + MP3 music
│   ├── combo.js         — Streak counter (x2 at 3, x3 at 5, x5 at 10, x10 at 20)
│   ├── difficulty.js    — Continuous speed (time-based), level tiers, penalizeSpeed on LIFE_LOST
│   ├── fps-monitor.js   — Ring-buffer FPS for performance gating
│   ├── hud.js           — Score/level/hearts/combo display
│   ├── input.js         — Keyboard + mobile virtual keyboard, wrong-key penalty lock
│   ├── level-announce.js— "LEVEL X" overlay with fade
│   ├── lives.js         — 3 lives, LIFE_LOST/GAME_OVER events
│   ├── matcher.js       — Danger zone matching, combo sequential input
│   ├── particles.js     — Pooled particles (30 max, FPS-gated)
│   ├── pool.js          — Generic object pool
│   ├── score.js         — Points + survival bonus + combo multiplier
│   ├── spawner.js       — Timer-based spawn, character pool, level-gated progression
│   ├── storage.js       — localStorage personal best
│   └── vfx.js           — Screen shake, screen flash, hitstop
└── screens/
    ├── start.js         — Retrofuturist title screen (char reveal, particles, scanlines)
    └── game-over.js     — Glitch effect, chromatic aberration, staggered reveal
```

---

## Key Design Decisions

### Gameplay
- **Speed model:** Chrome dino-inspired linear acceleration with hard cap (desktop: 240→450 px/s over ~70s, mobile: 100→220 px/s)
- **Level progression:** 5 destroys per level (fast — feels rewarding), 12 explicit tiers
- **Combo streaks:** x2 at 3 kills, x3 at 5, x5 at 10, x10 at 20. Rising audio pitch per consecutive destroy
- **Punishment on miss:** Lose a life + drop one level + speed penalty (30% elapsed time reduction). Triple punishment = strong "one more try" motivation
- **Multi-letter combos:** 2-letter at L4+, 3-letter at L7+, 4-letter at L10+. Sequential typing, wrong mid-combo resets progress
- **Obstacle miss detection:** Triggers when obstacle fully passes player's RIGHT edge (not screen edge)

### Desktop vs Mobile
| | Desktop | Mobile |
|--|---------|--------|
| Speed | 240 base, 450 cap | 100 base, 220 cap |
| Characters L1-3 | Uppercase + digits, case-random | Lowercase only |
| Characters L4-7 | Same | Case-sensitive (add uppercase) |
| Characters L8+ | Same | Same (no digits until L12) |
| Digits | From L1 | L12+ only (extreme) |
| Font scale | 0.6x-2.2x | 0.8x-1.4x |
| Input | keydown events | Hidden input + virtual keyboard |
| Ground height | 140px max | Responsive (15% of height) |

### Visuals
- **Space theme:** Deep dark, nebula blobs, colored twinkling stars, NO city skyline
- **Obstacles:** Floating glowing letters (no boxes/rectangles). Just text with shadowBlur glow
- **Danger zone:** Letters glow more intensely (increased shadowBlur pulse), NO filled circle behind
- **Wrong key:** All danger-zone letters flash red + 2px jitter for 150ms
- **Font:** 'Arial Black' for obstacles (max legibility), 'Courier New' for HUD/screens
- **Cat:** 10-frame run animation from cat-run.png, 80x80 render, 2px vertical bob
- **Ground:** Single glowing cyan line (energy beam in space)
- **Screens:** Retrofuturist arcade terminal — char-by-char title reveal, scanlines, chromatic aberration on death

### Audio
- **Background:** "Tension Pixels.mp3" — ON by default, Tab to toggle
- **SFX:** Procedural Web Audio — pop (correct), thud (miss), descending tone (game over), ascending arpeggio (level up), ding (100pts)
- **Rising pitch:** Each consecutive destroy raises pop by a semitone (resets on miss)
- **AudioContext:** Created/resumed on first keypress (autoplay policy)

### Juice Features
1. Screen shake on destroy (2px single, 4px combo)
2. Combo streak HUD with pulsing text
3. Rising audio pitch on streak
4. Speed lines at 70%+ of max speed
5. 100-point milestone dings
6. Death slow-mo (80ms hitstop before game-over)

---

## What Works Well
- The neon floating letters in space look distinctive (not generic)
- Combo streaks + rising pitch create addictive rhythm
- Level-down + speed-drop on miss is punishing but motivating
- Fast level progression (5 destroys) makes you feel like you're getting somewhere
- Start screen char-by-char reveal feels premium
- Game-over glitch effect is dramatic

## What Needs Work / Known Issues
- Mobile keyboard UX is still awkward (keyboard covers game area, visualViewport resize helps but isn't perfect)
- The cat sprite is small relative to the letters (intentional but may confuse new players)
- No tutorial/onboarding — game teaches itself but "type the letters" isn't immediately obvious
- Spawn interval at start might be too long (2.5-3s between obstacles feels slow)
- The `getGroundHeight()` responsive function may cause obstacle Y-position jumps on resize
- Personal best in localStorage can show stale huge numbers from testing
- No way to reset high score from the UI

## Files to Note
- `public/cat-run.png` — 10-frame sprite sheet (320x32)
- `public/cat-idle.png` — idle animation (unused currently)
- `public/Tension Pixels.mp3` — background music track
- `.github/workflows/deploy.yml` — GitHub Pages auto-deploy on push
- `.planning/` — full GSD planning artifacts (research, roadmap, state, plans, summaries)

## How to Continue
1. `cd /Users/I529118/Documents/Repos/game`
2. `npm run dev` → http://localhost:3001 (port 3000 may be in use)
3. Git: `git config user.name` should show "Pavan Madiraju"
4. Push: `git push origin main` → auto-deploys to GitHub Pages in ~20s
5. Test mobile: Playwright with `page.setViewportSize({ width: 390, height: 844 })`

## What Was Planned but Not Done
- Stitch MCP for visual inspiration (kept timing out, used screenshots instead)
- Frontend-design skill for in-game HUD redesign (only applied to screens)
- Near-miss "CLOSE!" flash
- Personal best approach indicator
- Session attempt counter
- Full light mode (removed — dark only now)
