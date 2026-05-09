# PITFALLS.md — Browser Canvas Endless Runner

> Common mistakes that kill browser-based Canvas game projects like Letter Runner.
> Each pitfall includes warning signs, prevention strategies, and phase relevance.

---

## Performance Pitfalls

### P1: Allocating Objects Inside the Game Loop

**What goes wrong:** Creating new objects (arrays, vectors, particle objects) every frame triggers garbage collection pauses. GC can stall the main thread for 5-30ms, causing visible frame drops at 60fps (where the budget is 16.6ms).

**Warning signs:**
- Chrome DevTools Performance tab shows yellow "Minor GC" bars during gameplay
- Stutters appear after 20-30 seconds of play (heap fills up)
- Frame time spikes in a sawtooth pattern

**Prevention strategy:**
- Pre-allocate object pools for particles, obstacles, and projectiles at game init
- Reuse objects by resetting properties instead of `new`-ing
- Never use `Array.map()`, `Array.filter()`, or spread operators inside `update()` or `draw()`
- Use typed arrays (`Float32Array`) for particle positions if pool exceeds 100 items

**Phase:** Core engine/architecture phase. Must be designed in from day one.

---

### P2: Redrawing the Entire Canvas Every Frame

**What goes wrong:** Calling `clearRect(0, 0, width, height)` followed by redrawing every element (background, ground, all obstacles, UI) even when most haven't changed. For 15+ obstacles with letters rendered as text, this becomes expensive.

**Warning signs:**
- `ctx.fillText()` appears in profiler hot path
- Frame time increases linearly with obstacle count
- Mobile/integrated GPU struggles even with simple scenes

**Prevention strategy:**
- Layer canvases: static background on one canvas, game objects on another, UI on a third
- Only clear and redraw the regions that changed (dirty rectangles) for UI layer
- Cache letter glyphs to offscreen canvases — `fillText` is expensive per-call
- Pre-render obstacle sprites to `OffscreenCanvas` or hidden canvases at load time

**Phase:** Rendering system phase. Must decide canvas layering before building game objects.

---

### P3: Using `setInterval` or Uncapped `requestAnimationFrame`

**What goes wrong:** `setInterval(tick, 16)` drifts and doesn't sync with the display refresh. Uncapped `requestAnimationFrame` without delta-time makes game speed hardware-dependent.

**Warning signs:**
- Game runs faster on 144Hz monitors
- Slow machines see slow-motion gameplay instead of frame drops
- Speed feels different between Chrome and Firefox

**Prevention strategy:**
```javascript
let lastTime = 0;
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50ms
  lastTime = timestamp;
  update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}
```
- Cap delta-time to prevent "spiral of death" when tab is backgrounded
- All movement = `speed * dt`, never raw pixel increments per frame
- Test with Chrome DevTools CPU throttling at 4x and 6x

**Phase:** Core game loop phase. Foundational — everything else depends on this.

---

### P4: Canvas Resolution vs CSS Size Mismatch (Blurry Text)

**What goes wrong:** Setting canvas size via CSS without matching the `width`/`height` attributes causes stretched/blurry rendering. Letter obstacles (the core mechanic) become unreadable.

**Warning signs:**
- Text looks fuzzy on Retina/HiDPI displays
- Lines appear anti-aliased when they shouldn't
- Canvas looks fine on one machine, blurry on another

**Prevention strategy:**
```javascript
const dpr = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * dpr;
canvas.height = canvas.clientHeight * dpr;
ctx.scale(dpr, dpr);
```
- Set this on init AND on window resize
- All game logic uses CSS pixel coordinates, only the canvas buffer is scaled
- Test on a Retina display early

**Phase:** Canvas setup phase. Do this immediately when creating the rendering system.

---

### P5: Particle System Without Hard Limits

**What goes wrong:** Spawning particles on every obstacle destruction without a pool cap. At high difficulty (multiple rapid destructions), hundreds of particles accumulate, each needing position updates and draw calls.

**Warning signs:**
- Frame rate drops specifically during rapid obstacle destruction sequences
- Particle count climbs without bound during intense play
- Late-game performance is worse than early-game

**Prevention strategy:**
- Hard cap at 30 particles total (as spec'd) — pool, don't spawn
- When pool is exhausted, recycle the oldest particle
- Particles should be simple (position + velocity + alpha) — no complex state
- Batch particle rendering: single `beginPath()` with multiple `arc()` calls, one `fill()`

**Phase:** Effects/juice phase. Enforce the cap in the pool design, not as an afterthought.

---

## Input Handling Pitfalls

### I1: Using `keypress` Instead of `keydown`

**What goes wrong:** `keypress` is deprecated, doesn't fire for modifier keys, and has inconsistent behavior. Some letters won't register. `keydown` with `event.key` is correct.

**Warning signs:**
- Some keys don't register on Firefox
- `keypress` doesn't fire at all in some scenarios
- Arrow keys or special keys don't work

**Prevention strategy:**
- Use `keydown` for press detection, `keyup` for release
- Compare `event.key` (not `event.keyCode` which is deprecated)
- Normalize to lowercase: `event.key.toLowerCase()`
- Prevent default for game keys to stop page scrolling

**Phase:** Input system phase. Get this right before building any gameplay.

---

### I2: Input Lag from Processing Events in the Wrong Frame

**What goes wrong:** Queuing keydown events and only processing them on the next `requestAnimationFrame` tick adds up to 16ms of perceived latency. For a fast-paced runner where you type letters to destroy obstacles, this kills responsiveness.

**Warning signs:**
- Input feels "mushy" compared to a raw event listener demo
- Players report the game "missed" their keypress
- At high speeds, valid inputs get dropped

**Prevention strategy:**
- Process input in an event-driven manner: on `keydown`, immediately mark the keystroke as pending
- In the very next `update()`, check pending keystrokes FIRST, before movement
- Never buffer more than one frame of input — if the key was pressed between frames, it's valid
- Consider processing input matches (letter collision) immediately in the event handler, with visual confirmation deferred to next draw

**Phase:** Input system + collision detection phase.

---

### I3: Key Repeat Flooding

**What goes wrong:** Holding a key fires `keydown` repeatedly (OS key repeat). For letter-matching, one keypress should match one obstacle. Without dedup, a held key destroys multiple obstacles instantly.

**Warning signs:**
- Holding a key rapidly destroys all matching obstacles
- `event.repeat === true` events are being processed

**Prevention strategy:**
```javascript
document.addEventListener('keydown', (e) => {
  if (e.repeat) return; // Ignore OS key repeat
  handleKeypress(e.key);
});
```
- Always check `event.repeat` and bail early
- Track pressed-key state if you need held-key mechanics (you don't for letter matching)

**Phase:** Input system phase.

---

### I4: Focus Loss Silently Breaking Input

**What goes wrong:** If the canvas or document loses focus (user clicks browser chrome, ad overlay, dev tools), keydown events stop firing. Player mashes keys with no response.

**Warning signs:**
- Input stops working "randomly" during testing
- Works fine until you click something outside the game area
- Mobile keyboards dismiss unexpectedly (if touch support added later)

**Prevention strategy:**
- Listen on `document`, not on the canvas element
- On `blur` event, pause the game immediately and show a "Click to Resume" overlay
- On `visibilitychange`, pause if `document.hidden === true`
- Never let the game run without focus — it wastes resources and confuses players

**Phase:** Game state management phase (pause/resume system).

---

## Game Feel Pitfalls

### G1: Linear Difficulty Progression

**What goes wrong:** Increasing speed by a constant amount per second/level. Early game is boringly slow, then difficulty spikes become overwhelming without a skill-appropriate ramp.

**Warning signs:**
- Playtesters describe the game as "boring then impossible"
- Score distribution is bimodal (either very low or very high)
- No "flow state" — game never feels appropriately challenging

**Prevention strategy:**
- Use a logarithmic or piecewise curve for speed increases
- Increase spawn rate, obstacle count, AND speed independently — don't couple them
- Define difficulty "tiers" with specific unlock conditions
- Provide breathing room after difficulty bumps (e.g., 3 seconds at new level before next increase)
- Playtest at minute 1, minute 3, and minute 5 — all should feel "challenging but fair"

**Phase:** Difficulty/progression system phase. Requires tunable constants, not hardcoded values.

---

### G2: No Feedback on Successful Input

**What goes wrong:** Player presses the correct letter, obstacle disappears, but there's no satisfying response. The game feels like typing into a void. Players disengage.

**Warning signs:**
- Playtesters say "I'm not sure if that worked"
- Game feels mechanical and lifeless
- Players don't report satisfaction from correct matches

**Prevention strategy:**
- On correct match: particle burst + screen shake (2-3px, 50ms) + score popup + sound
- On wrong key: brief red flash or buzz sound (not punishing, just acknowledging)
- Combo counter with visual escalation (bigger effects for streaks)
- All feedback must be < 1 frame to trigger (the tick after input, not the tick after that)

**Phase:** Juice/effects phase. But plan the hooks (event system) during architecture.

---

### G3: Obstacles Spawning in Impossible Configurations

**What goes wrong:** Random spawning without constraint checking creates scenarios where obstacles overlap, letters are unreadable, or required typing speed exceeds human capability.

**Warning signs:**
- Two obstacles with the same letter overlap visually
- Required inputs-per-second exceeds 8-10 (human typing burst limit)
- Players physically cannot type fast enough at high difficulty

**Prevention strategy:**
- Minimum spacing between obstacles (at least `letterWidth * 2` gap)
- Never spawn two identical letters simultaneously
- Calculate required reaction time: `distance / speed > 0.3s` (minimum human reaction)
- At max difficulty, cap simultaneous obstacles at 3-4
- Validate spawn configurations against a "humanly possible" heuristic

**Phase:** Spawning system phase. Must be designed with constraints from the start.

---

### G4: Camera/Scroll Judder

**What goes wrong:** Scrolling the world by integer pixels causes visible micro-stuttering. At non-integer speeds (e.g., 3.7 px/frame), alternating between 3px and 4px movement creates judder.

**Warning signs:**
- Background scrolling looks "shaky" or "vibrating"
- Judder is worse at certain speeds
- Looks fine at exactly 1x, 2x, 4x speeds but broken at others

**Prevention strategy:**
- Use sub-pixel positioning for all movement (Canvas supports fractional coordinates)
- Apply `ctx.imageSmoothingEnabled = true` for background scrolling
- If using tile-based backgrounds, round only the tile-draw position, not the scroll offset
- Consider rendering at native resolution and letting the GPU interpolate

**Phase:** Rendering/scrolling system phase.

---

## Audio Pitfalls

### A1: Web Audio API Autoplay Policy Blocking All Sound

**What goes wrong:** All modern browsers require a user gesture (click/tap/keypress) before `AudioContext` can produce sound. Creating an `AudioContext` at page load results in a suspended context. All `play()` calls silently fail.

**Warning signs:**
- Sound works in development (where you've already clicked the page) but not on first load
- `audioContext.state === 'suspended'` in console
- No errors thrown — just silence

**Prevention strategy:**
```javascript
// Create context early, resume on first interaction
const audioCtx = new AudioContext();
document.addEventListener('keydown', () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
}, { once: true });
```
- Resume the AudioContext on the FIRST user interaction (the "Start Game" click or first keypress)
- Check `audioCtx.state` and show a "Click to enable audio" prompt if needed
- Never assume audio is playing — always verify state

**Phase:** Audio system phase. Must handle this before any sound implementation.

---

### A2: Creating New Audio Nodes Per Sound Effect

**What goes wrong:** Creating a new `OscillatorNode` or `BufferSourceNode` for every sound effect (every letter match, every particle). This allocates memory and can cause audio glitches at high frequency.

**Warning signs:**
- Audio crackles or pops during rapid sequences
- Memory usage climbs during gameplay
- Sounds cut each other off or layer into distortion

**Prevention strategy:**
- Pre-decode all audio buffers at load time (`decodeAudioData`)
- For short SFX: create `BufferSourceNode` per play (they're lightweight and designed for this)
- For rapid-fire effects: use a sound pool (3-4 pre-created nodes) and round-robin
- Set `GainNode` for volume control — don't create gain nodes per sound
- Limit concurrent SFX (max 8 simultaneous sounds)

**Phase:** Audio system phase.

---

### A3: Audio Timing Drift from `setTimeout`

**What goes wrong:** Scheduling audio events with `setTimeout` introduces jitter (10-50ms variance). Musical/rhythmic sound effects will sound "drunk."

**Warning signs:**
- Sound effects don't sync with visual events
- Background music has subtle timing inconsistencies
- Effects sound fine individually but wrong in rapid succession

**Prevention strategy:**
- Use `audioContext.currentTime` for scheduling, not `setTimeout`
- Schedule sounds slightly ahead: `source.start(audioCtx.currentTime + 0.01)`
- For immediate SFX (letter match), `source.start(0)` is fine — precision matters more for sequences

**Phase:** Audio system phase.

---

## Cross-Browser Pitfalls

### B1: Safari's Keyboard Event Differences

**What goes wrong:** Safari on macOS handles `event.key` slightly differently for some keys. More critically, Safari throttles `requestAnimationFrame` to 30fps when the page is in a background tab, and may power-throttle even foreground animations.

**Warning signs:**
- Game runs at 30fps on Safari for no apparent reason
- Key values differ between Safari and Chrome for special characters
- `performance.now()` precision is reduced in Safari (rounded to 1ms for Spectre mitigations)

**Prevention strategy:**
- Test on Safari early and continuously — not just before launch
- Don't rely on sub-millisecond timing from `performance.now()`
- Handle `visibilitychange` to pause when backgrounded (Safari is aggressive about throttling)
- Use `event.key` not `event.code` for letter matching (avoids keyboard layout issues)

**Phase:** Core game loop + input system phases. Test cross-browser from the start.

---

### B2: Firefox's Canvas Rendering Path Differences

**What goes wrong:** Firefox uses a different rendering backend (Skia vs Chrome's) and may anti-alias differently. Text rendering especially can differ — letter shapes won't be pixel-identical.

**Warning signs:**
- Text position/size differs by 1-2 pixels between browsers
- Canvas text baseline behaves differently
- `measureText()` returns slightly different widths

**Prevention strategy:**
- Use `textBaseline = 'middle'` and `textAlign = 'center'` for consistent positioning
- Don't rely on exact pixel measurements from `measureText()` for collision detection — add padding
- Test font loading: use the CSS Font Loading API to ensure fonts are ready before rendering
- Avoid exotic canvas operations that may not be GPU-accelerated in all browsers

**Phase:** Rendering system phase.

---

### B3: High-DPI Handling Varies Across Platforms

**What goes wrong:** `devicePixelRatio` is 1 on most Windows laptops, 2 on Mac Retina, and fractional (1.25, 1.5) on many Windows machines with scaling. Games that only handle 1x and 2x look wrong on fractional DPR.

**Warning signs:**
- Game looks blurry on some Windows machines
- Hit detection is offset by the DPR scaling factor
- Mouse/touch coordinates don't match visual positions

**Prevention strategy:**
- Always multiply canvas dimensions by `devicePixelRatio`
- Divide input coordinates by DPR for hit testing
- Handle `window.matchMedia('(resolution: ...)')` changes (user drags window between monitors)
- Test with Chrome DevTools device emulation at DPR 1.5

**Phase:** Canvas setup phase.

---

### B4: `OffscreenCanvas` Support is Not Universal

**What goes wrong:** `OffscreenCanvas` (for off-main-thread rendering or efficient caching) isn't supported in all Safari versions. Using it without a fallback breaks the game.

**Warning signs:**
- `OffscreenCanvas is not defined` error in Safari < 16.4
- Game works in Chrome but blank canvas in Safari

**Prevention strategy:**
- Feature-detect: `if (typeof OffscreenCanvas !== 'undefined')`
- Fallback to a hidden `<canvas>` element for sprite caching
- Don't use `OffscreenCanvas` in a Worker for this project — the complexity isn't worth it for a 2D runner

**Phase:** Rendering system phase. Decide caching strategy with fallbacks.

---

## Architecture Pitfalls

### A1: God-Object Game Loop

**What goes wrong:** All game logic in one monolithic `update()` function. Spawning, collision, scoring, difficulty, particles, audio — all interleaved. Impossible to tune or debug individual systems.

**Warning signs:**
- `update()` exceeds 200 lines
- Changing spawn logic breaks particle effects
- Can't disable one system for testing without commenting out code

**Prevention strategy:**
- Separate systems: `InputSystem`, `SpawnSystem`, `PhysicsSystem`, `ParticleSystem`, `AudioSystem`, `ScoreSystem`
- Each system has its own `update(dt)` and `draw(ctx)`
- Systems communicate via events or a shared state object, not direct references
- Order of system updates is explicit and documented

**Phase:** Architecture/core engine phase. Must be the first thing built.

---

### A2: Tight Coupling Between Game State and Rendering

**What goes wrong:** Game objects directly call `ctx.fillRect()` in their update logic. Can't run the game headless for testing, can't change rendering approach, can't add visual effects without modifying game logic.

**Warning signs:**
- Canvas context (`ctx`) is passed into collision detection functions
- Can't unit test game logic without mocking the canvas
- Adding screen shake requires changing 10 files

**Prevention strategy:**
- Strict separation: `update(dt)` modifies state, `draw(ctx)` reads state and renders
- Game objects store position/size/state — they never call canvas methods
- A renderer reads the game state and draws it
- This enables: headless testing, replay systems, debug overlays

**Phase:** Architecture phase.

---

### A3: No Central Event/Message Bus

**What goes wrong:** Systems call each other directly. Input calls collision, collision calls particles, particles call audio. Circular dependencies emerge. Adding a new reaction to "obstacle destroyed" requires modifying the collision code.

**Warning signs:**
- Adding a screen shake to destruction requires editing collision code
- Systems import each other
- Can't add new features without modifying existing code

**Prevention strategy:**
```javascript
// Simple event emitter
const events = {
  listeners: {},
  on(event, fn) { (this.listeners[event] ||= []).push(fn); },
  emit(event, data) { (this.listeners[event] || []).forEach(fn => fn(data)); }
};

// Usage
events.emit('obstacleDestroyed', { x, y, letter });
// ParticleSystem listens, AudioSystem listens, ScoreSystem listens — independently
```
- Keep it simple — no need for a full ECS for a 2D runner
- Events: `obstacleDestroyed`, `letterMatched`, `letterMissed`, `difficultyIncreased`, `gameOver`

**Phase:** Architecture phase.

---

### A4: Hardcoded Magic Numbers Throughout

**What goes wrong:** Speed values, spawn rates, particle counts, difficulty multipliers scattered as literals. Tuning requires find-and-replace across files. Impossible to balance gameplay.

**Warning signs:**
- Values like `5`, `0.3`, `120` appear in game logic without explanation
- Changing difficulty requires modifying 6 different files
- Playtesters say "a little faster" and it takes 30 minutes to adjust

**Prevention strategy:**
```javascript
// config.js — single source of truth
export const CONFIG = {
  player: { speed: 5, jumpForce: -12 },
  spawning: { minGap: 200, maxObstacles: 5, baseRate: 1.5 },
  difficulty: { speedMultiplier: 0.02, spawnRateMultiplier: 0.01 },
  particles: { maxCount: 30, lifetime: 0.8 },
  audio: { maxConcurrent: 8, masterVolume: 0.7 },
};
```
- All tunable values in one config file
- Consider a debug panel (dat.gui or custom) for runtime tweaking during development
- Log the config at game start for bug reports

**Phase:** Architecture phase. Establish immediately.

---

## Prevention Checklist

Quick reference — verify these during each development phase:

| # | Check | When |
|---|-------|------|
| 1 | Delta-time game loop with frame cap | Core engine phase |
| 2 | Canvas DPR scaling + resize handler | Canvas setup |
| 3 | Object pools for particles and obstacles | Architecture phase |
| 4 | `keydown` with `event.repeat` guard | Input system |
| 5 | Input processed same-frame, not next-frame | Input system |
| 6 | `document` focus/blur pauses game | State management |
| 7 | AudioContext resumed on user gesture | Audio phase |
| 8 | Systems separated (update vs draw) | Architecture |
| 9 | Event bus for cross-system communication | Architecture |
| 10 | All tuning values in central config | Architecture |
| 11 | Spawn validation (min gap, max concurrent, humanly possible) | Spawning system |
| 12 | Feedback on every input (correct AND incorrect) | Juice phase |
| 13 | Safari tested from first playable build | Every phase |
| 14 | Performance profiled with 4x CPU throttle | Every phase |
| 15 | Particle hard cap enforced in pool, not spawn logic | Effects phase |

---

## Phase Priority Map

**Must be right from day one (architecture phase):**
- Delta-time loop (P3)
- Object pooling (P1)
- System separation (A1, A2)
- Event bus (A3)
- Config centralization (A4)
- Canvas DPR setup (P4)

**Must be right when building the feature:**
- Input handling (I1-I4) — when building input system
- Spawn constraints (G3) — when building spawn system
- Audio context resume (A1) — when adding first sound
- Particle cap (P5) — when building particle system

**Must be verified continuously:**
- Cross-browser testing (B1-B4) — every sprint
- Performance profiling (P2, P3) — every sprint
- Game feel / difficulty curve (G1, G2, G4) — every playtest session
