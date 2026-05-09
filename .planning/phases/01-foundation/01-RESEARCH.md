# Phase 1: Foundation - Research

**Researched:** 2026-05-09
**Domain:** Vite 6 + Canvas game loop + Event bus
**Confidence:** HIGH

## Summary

Phase 1 establishes the project scaffolding (Vite 6 vanilla JS), a 60fps game loop with delta-time, DPR-aware canvas rendering for pixel art, and an event bus for decoupled system communication.

All technologies are well-established with clear patterns. Vite 6 works out-of-the-box for vanilla JS with `index.html` as entry point. The game loop uses `requestAnimationFrame` with delta-time in seconds and a max-dt cap. The DPR canvas setup for pixel art uses integer scaling with `imageSmoothingEnabled = false`. The event bus is a simple pub/sub singleton (~40 lines).

**Primary recommendation:** Scaffold with `npm create vite@latest -- --template vanilla`, add the game loop + event bus + DPR canvas as three focused modules in `src/core/`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vite | ^6.3 | Dev server + build tool | Zero-config for vanilla JS, instant HMR, sub-50ms rebuilds |
| Node.js | >=22.12 | Runtime for tooling | Required by Vite 6.3+ |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | - | - | Phase 1 has zero runtime dependencies |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vite | Raw `<script type="module">` | Works for dev but no HMR, no production build, no asset hashing |

**Installation:**
```bash
npm create vite@latest letter-runner -- --template vanilla
cd letter-runner
npm install
```

## Architecture Patterns

### Recommended Project Structure (Phase 1 only)
```
letter-runner/
├── index.html              # Entry point - canvas element + script
├── vite.config.js          # Minimal Vite config
├── package.json
├── src/
│   ├── main.js             # Bootstrap: create canvas, start loop
│   ├── core/
│   │   ├── canvas.js       # DPR-aware canvas setup + resize handler
│   │   ├── game-loop.js    # requestAnimationFrame loop with delta-time
│   │   └── events.js       # Event bus (pub/sub singleton)
│   └── config.js           # Constants (colors, target FPS, etc.)
└── public/                 # Static assets (favicon, etc.)
```

### Pattern 1: Vite 6 Configuration for Canvas Game

**What:** Minimal vite.config.js — Vite needs almost nothing for a vanilla JS game.
**When to use:** Always — this is the project config.

```js
// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',               // Relative paths for static hosting (GitHub Pages)
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsInlineLimit: 4096 // Inline small assets as base64
  },
  server: {
    port: 3000
  }
});
```

**Key point:** Vite 6 uses `index.html` in project root as the entry point. It resolves `<script type="module" src="/src/main.js">` automatically. No special plugin needed.

### Pattern 2: Game Loop with Delta-Time

**What:** Fixed-cap variable timestep game loop.
**When to use:** This is THE game loop pattern for this project.

```js
// src/core/game-loop.js
const MAX_DT = 1 / 30; // Cap at ~33ms to prevent spiral-of-death on tab switch

let lastTime = 0;
let running = false;
let updateFn = null;
let renderFn = null;

function tick(currentTime) {
  if (!running) return;

  // Convert to seconds, cap to prevent huge jumps
  const dt = Math.min((currentTime - lastTime) / 1000, MAX_DT);
  lastTime = currentTime;

  updateFn(dt);
  renderFn();

  requestAnimationFrame(tick);
}

export function startLoop(update, render) {
  updateFn = update;
  renderFn = render;
  running = true;
  lastTime = performance.now();
  requestAnimationFrame(tick);
}

export function stopLoop() {
  running = false;
}
```

**Why this pattern:**
- `dt` in seconds makes physics intuitive: `position += speed * dt` where speed is px/sec
- `MAX_DT` cap prevents objects teleporting through walls after tab-switch
- Separate `update(dt)` and `render()` — update uses time, render reads state
- No fixed-timestep accumulator needed (no networked physics, no replays)

### Pattern 3: DPR-Aware Canvas for Pixel Art (Full Viewport)

**What:** Canvas fills the viewport, renders crisply on retina, suitable for pixel art.
**When to use:** Canvas initialization and window resize.

```js
// src/core/canvas.js
let canvas, ctx;
let width, height; // Logical (CSS) dimensions in pixels

export function initCanvas() {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  return { canvas, ctx };
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;

  // Physical pixels = logical * DPR
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // CSS size stays at logical viewport size
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  // Scale context so draw calls use logical (CSS) coordinates
  ctx.scale(dpr, dpr);

  // Pixel art: disable anti-aliasing
  ctx.imageSmoothingEnabled = false;
}

export function getCtx() { return ctx; }
export function getWidth() { return width; }
export function getHeight() { return height; }
```

**Critical CSS for pixel art:**
```css
canvas {
  display: block;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
}
```

**Key decisions:**
- Full viewport (`window.innerWidth/innerHeight`) because the game fills the screen
- `ctx.scale(dpr, dpr)` so all draw calls use CSS pixels (no manual DPR math everywhere)
- `imageSmoothingEnabled = false` + CSS `image-rendering: pixelated` for crisp pixel art
- Must re-apply `ctx.scale()` and `imageSmoothingEnabled` after every resize (canvas reset)
- All sprite positions should use `Math.floor()` for pixel-perfect alignment

### Pattern 4: Event Bus (Lightweight Pub/Sub)

**What:** Singleton event bus for decoupled system communication.
**When to use:** All inter-system communication.

```js
// src/core/events.js
const listeners = new Map();

export const events = {
  on(event, callback) {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    listeners.get(event).push(callback);
    // Return unsubscribe function
    return () => this.off(event, callback);
  },

  off(event, callback) {
    const cbs = listeners.get(event);
    if (cbs) {
      const idx = cbs.indexOf(callback);
      if (idx !== -1) cbs.splice(idx, 1);
    }
  },

  emit(event, data) {
    const cbs = listeners.get(event);
    if (cbs) {
      for (let i = 0; i < cbs.length; i++) {
        cbs[i](data);
      }
    }
  },

  clear() {
    listeners.clear();
  }
};
```

**Why this minimal design:**
- No priority system needed (game loop controls call order)
- No async emit needed (all events are synchronous within a frame)
- No `once()` needed yet (add later if useful)
- Array iteration with index (not `forEach`) — avoids allocation per emit
- Return unsubscribe function for cleanup
- ~30 lines, zero dependencies

**Events to define in Phase 1 (for testing the bus):**
| Event | Payload | Purpose |
|-------|---------|---------|
| `CANVAS_READY` | `{ width, height }` | Canvas initialized |
| `CANVAS_RESIZE` | `{ width, height }` | Viewport resized |
| `LOOP_START` | `{}` | Game loop started |
| `LOOP_STOP` | `{}` | Game loop stopped |

### Anti-Patterns to Avoid
- **Class-heavy architecture:** Don't use ES6 classes for the event bus or game loop. Plain module exports with closures are simpler and more performant for this scale.
- **`setInterval` for game loop:** Never. Only `requestAnimationFrame` syncs with display refresh.
- **Storing DPR at init time:** Always read `devicePixelRatio` fresh on resize — user can move window between monitors.
- **Forgetting to re-apply canvas state after resize:** Setting `canvas.width` resets ALL context state (transforms, smoothing, etc.). Must reapply after resize.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Build tooling | Custom script bundler | Vite | HMR, asset hashing, production builds for free |
| Timestamp handling | Manual `Date.now()` | `requestAnimationFrame` timestamp + `performance.now()` | Higher precision, synced to display |

**Key insight:** This phase intentionally hand-rolls the game loop, canvas setup, and event bus because they're trivial (<50 lines each) and having them as plain modules with zero abstraction makes debugging simpler. No libraries needed.

## Common Pitfalls

### Pitfall 1: Canvas Blurry on Retina
**What goes wrong:** Canvas looks blurry/fuzzy on high-DPI screens.
**Why it happens:** Canvas physical size equals CSS size (1:1 pixels on a 2x or 3x screen).
**How to avoid:** Multiply `canvas.width/height` by `devicePixelRatio`, keep CSS size at viewport dimensions, call `ctx.scale(dpr, dpr)`.
**Warning signs:** Text and shapes look soft/blurred when you zoom in.

### Pitfall 2: Spiral of Death on Tab Switch
**What goes wrong:** After switching back to the game tab, everything jumps/teleports.
**Why it happens:** `requestAnimationFrame` pauses while tab is hidden. First frame back has huge delta (e.g., 30 seconds).
**How to avoid:** Cap `dt` at `1/30` (never process more than 33ms per frame).
**Warning signs:** Objects skip across screen after alt-tabbing.

### Pitfall 3: Canvas State Reset on Resize
**What goes wrong:** After window resize, canvas draws incorrectly (wrong scale, smoothing re-enabled).
**Why it happens:** Setting `canvas.width` or `canvas.height` resets the entire 2D context state.
**How to avoid:** Always reapply `ctx.scale(dpr, dpr)` and `ctx.imageSmoothingEnabled = false` after any dimension change.
**Warning signs:** Graphics suddenly blurry or wrong size after resize.

### Pitfall 4: Sub-pixel Rendering for Pixel Art
**What goes wrong:** Pixel art sprites look misaligned or have seams.
**Why it happens:** Drawing at fractional coordinates (e.g., `x = 10.5`).
**How to avoid:** Always `Math.floor()` sprite positions before drawing. Keep all game coordinates as integers when possible.
**Warning signs:** Shimmering/flickering pixels, visible gaps between tiles.

### Pitfall 5: First Frame Delta Spike
**What goes wrong:** First frame has `dt = NaN` or a huge value.
**Why it happens:** `lastTime` starts at 0, first `requestAnimationFrame` timestamp is wall-clock milliseconds.
**How to avoid:** Set `lastTime = performance.now()` before starting the loop, or skip the first frame's dt.
**Warning signs:** Objects start in wrong position on game start.

## Code Examples

### Complete index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Letter Runner</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; background: #0a0a0f; }
    canvas {
      display: block;
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
    }
  </style>
</head>
<body>
  <canvas id="game"></canvas>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

### Complete main.js (Phase 1 Bootstrap)
```js
// src/main.js
import { initCanvas, getCtx, getWidth, getHeight } from './core/canvas.js';
import { startLoop } from './core/game-loop.js';
import { events } from './core/events.js';

// Initialize canvas (DPR-aware, full viewport)
const { canvas, ctx } = initCanvas();
events.emit('CANVAS_READY', { width: getWidth(), height: getHeight() });

// Game update: nothing yet in Phase 1
function update(dt) {
  // Future: entity updates, physics, input polling
}

// Game render: dark background to prove canvas works
function render() {
  const ctx = getCtx();
  const w = getWidth();
  const h = getHeight();

  // Clear with dark background
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, w, h);

  // Debug: show FPS (remove later)
  ctx.fillStyle = '#3a3a4a';
  ctx.font = '12px monospace';
  ctx.fillText(`${w}x${h} @${devicePixelRatio}x`, 8, 20);
}

// Start the loop
startLoop(update, render);
events.emit('LOOP_START', {});
```

### Verifying 60fps (Dev Console Check)
```js
// Temporary - paste in console to verify loop performance
let frames = 0;
const start = performance.now();
const counter = setInterval(() => {
  const elapsed = (performance.now() - start) / 1000;
  console.log(`FPS: ${(frames / elapsed).toFixed(1)}`);
}, 2000);
// In game-loop.js tick(): window.__frameCount = (window.__frameCount || 0) + 1;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `setInterval(render, 16)` | `requestAnimationFrame` | 2012+ | Syncs with vsync, pauses in background tabs |
| `Date.now()` for timing | `performance.now()` / rAF timestamp | 2015+ | Microsecond precision, monotonic clock |
| Canvas 1:1 pixels | DPR-aware scaling | 2014+ (retina Macs) | Crisp on all devices |
| Manual `<script>` tags | Vite + ES modules | 2021+ | HMR, tree-shaking, asset hashing |

**Deprecated/outdated:**
- `webkitRequestAnimationFrame`: All browsers use unprefixed since 2015
- `mozImageSmoothingEnabled`: Use standard `imageSmoothingEnabled`

## Open Questions

1. **Full viewport vs. fixed game resolution?**
   - What we know: The PRD says "full-viewport dark canvas" but pixel art games often use a fixed logical resolution (e.g., 320x180) scaled up
   - Recommendation: Phase 1 uses full viewport. Phase 2+ can add a fixed game-world resolution with letterboxing if the art direction requires it. The DPR setup works either way.

2. **Object pooling integration with event bus?**
   - What we know: STATE.md mentions "object pooling from day one"
   - Recommendation: Object pool is not needed in Phase 1 (no entities yet). Define the pool interface in Phase 2 when obstacles are added. The event bus is independent of pooling.

## Sources

### Primary (HIGH confidence)
- Context7 `/websites/v6_vite_dev` — Vite 6 configuration, project structure, index.html entry point
- MDN `requestAnimationFrame` — Timestamp behavior, tab visibility
- MDN Canvas API — `devicePixelRatio`, `imageSmoothingEnabled`

### Secondary (MEDIUM confidence)
- web.dev/articles/canvas-hidipi — DPR canvas pattern (Google, well-maintained)
- developer.mozilla.org/en-US/docs/Games/Techniques/Crisp_pixel_art_look — Pixel art canvas

### Tertiary (LOW confidence)
- Perplexity aggregated results — Game loop patterns, event bus patterns (verified against MDN)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Vite 6 is verified via Context7, vanilla JS needs no libraries
- Architecture: HIGH — Game loop and DPR canvas are decades-old patterns with clear best practices
- Pitfalls: HIGH — Well-documented gotchas (DPR reset, tab-switch dt spike, sub-pixel)
- Event bus: HIGH — Trivial implementation, pattern is universal

**Research date:** 2026-05-09
**Valid until:** 2026-08-09 (stable domain, patterns don't change)
