# Research Summary: Letter Runner

> Decision-support synthesis of stack, features, architecture, and pitfalls research.

---

## Stack Decision

We are building Letter Runner with **Vanilla JavaScript (ES2022+) on HTML5 Canvas 2D**, bundled by **Vite 6.x**, with **Web Audio API** for sound and **Vitest** for testing. This stack keeps the total JS bundle under 50KB, eliminates framework overhead, provides sub-50ms rebuild HMR during development, and deploys as a static site to GitHub Pages. No game framework (Phaser/Pixi), no TypeScript, no UI framework — the game's scope (~2000 LOC, single developer) does not justify the build complexity they introduce.

---

## Table Stakes

- Instant playability — zero loading screens, no signup, press-key-to-start
- Sub-50ms input-to-action feedback (typing games live or die on responsiveness)
- Clear death/failure state with immediate restart (one-key, <1s death-to-play)
- Score always visible; session high score shown on death
- Progressive difficulty ramp (speed, spawn rate, obstacle count increase independently)
- Basic audio feedback (hit, miss, ambient) with mute option
- Pause on focus loss / Escape key (browser games must handle tab-away)
- Consistent 60fps on 3-year-old laptops
- Letters instantly readable at speed (contrast, size, font choice)
- Graceful "desktop only" message on mobile

---

## Key Differentiators

- **Combo system** with streak multiplier and escalating visual/audio feedback
- **Difficulty modes** tied to typing skill (home row, common words, symbols+numbers)
- **Daily challenge** with shared seed — creates social competition ("beat today's run?")
- **Word/phrase mode** — obstacles spell words, adding a cognitive reading+typing layer
- **Shareable score cards** — one-click generated image for social sharing
- **Typing accuracy stats** — post-run WPM, most-missed keys, accuracy % appeals to improvement-driven players

---

## Architecture Highlights

- **Event bus (pub/sub)** decouples all systems — no system imports another; adding features (particles, audio, screen shake) only requires subscribing to events
- **Delta-time movement** from day one — all speeds in px/sec multiplied by dt; frame-rate independent on 60Hz and 144Hz monitors
- **Strict update/render separation** — `update(dt)` mutates state, `draw(ctx)` reads state; enables headless testing and replay systems
- **Object pooling** for particles and obstacles — pre-allocated, recycled via property reset; avoids GC pauses during gameplay
- **Config-driven difficulty** — all tuning values (base speed, spawn interval, multipliers, caps) live in a single `config.js`; balancing requires zero code changes
- **Canvas DPR scaling** on init and resize — handles Retina, fractional Windows scaling, and monitor-drag scenarios
- **Three-state machine** (Menu, Playing, GameOver) with explicit transitions and full reset on restart

---

## Top Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **GC pauses from per-frame allocations** | Frame drops after 20-30s of play | Object pools for obstacles/particles; no `map()`/`filter()`/spread in update loop |
| **Input feeling "mushy" or dropped** | Players abandon a typing game that misses keypresses | Process input same-frame (not next-frame buffer); guard `event.repeat`; listen on `document` |
| **Impossible spawn configurations** | Unfair deaths destroy trust | Enforce min gap between obstacles, cap simultaneous count at 3-4, validate reaction time > 300ms |
| **Safari audio silence on first load** | Desktop-first means many Safari users | Resume `AudioContext` on first user gesture; verify `audioCtx.state` before any play call |
| **Linear difficulty = boring then impossible** | Player churn at 60s | Logarithmic/piecewise speed curve; breathing room after level-ups; independent speed/spawn/count tuning |

---

## Build Order Implications

Research converges on a clear three-wave build sequence:

1. **Wave 1 — Core Loop (playable prototype):** Config, Event Bus, Game Loop with delta-time, basic renderer (rectangles), player entity, input handler, obstacle spawner, collision detection, letter matching. Milestone: rectangles on screen, keyboard destroys them, game over on collision.

2. **Wave 2 — Scoring & Progression:** Score system, HUD, difficulty progression, combo system. Milestone: score goes up, game gets harder, combos feel rewarding.

3. **Wave 3 — Polish & Juice:** Sprites replacing rectangles, particles, audio, UI screens (menu/game-over), background scrolling, screen shake, death slow-mo. Milestone: looks and sounds like a finished game.

**Critical early decisions that cannot be retrofitted:**
- Frame-rate independence (delta-time) — must be foundational
- Seeded RNG — needed if daily challenges are planned
- Event system — polish features hook into events, not game logic
- Object pooling — architecture-level, not afterthought
- Canvas DPR scaling — set up with the first canvas creation

---

## Open Questions Resolved

| Question | Answer from Research |
|----------|---------------------|
| Do we need a game framework? | No. <500 lines of canvas code covers our mechanics. Frameworks add 200-500KB for features we don't use. |
| TypeScript or JavaScript? | JavaScript with JSDoc. TS build complexity unjustified for <2000 LOC / solo dev. |
| How to handle audio autoplay? | Create `AudioContext` early, call `resume()` on first `keydown` event. |
| Backend needed for v1? | No. `localStorage` for personal bests. Leaderboard is post-launch (Cloudflare Worker). |
| How to prevent frame-rate dependent speed? | All movement = `speed * dt`; cap dt at 1/30 to prevent spiral-of-death on tab-switch. |
| Sprite format? | Single PNG atlas per category + JSON hash metadata. Integer scaling only. `image-rendering: pixelated`. |
| What deployment? | GitHub Pages via GitHub Actions. Zero cost, sufficient CDN for <500KB static game. |
| Mobile support? | Explicitly deferred. Show graceful "desktop only" message. |
