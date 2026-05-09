# STACK.md — Letter Runner

> Browser-based endless runner / typing game. Vanilla Canvas + JS, pixel-art aesthetic, 60fps target, <500KB total assets, desktop-first with keyboard input.

---

## Recommended Stack

| Layer | Choice | Version | Rationale |
|-------|--------|---------|-----------|
| Language | Vanilla JavaScript (ES2022+) | N/A | No transpilation overhead, native module support, keeps bundle minimal. TypeScript adds build complexity without proportional benefit for a <2000 LOC game. |
| Rendering | HTML5 Canvas 2D API | Native | Direct pixel control, no abstraction overhead, perfect for pixel-art at integer scaling. No WebGL needed for 2D sprite blitting. |
| Module format | ES Modules | Native | Browser-native `import/export`, tree-shakeable, no runtime loader needed. |
| Package manager | npm | 10.x | Ships with Node, no additional install. Lock file ensures reproducibility. |

---

## Build Tools

### Vite 6.x (Primary)

```
npm create vite@latest letter-runner -- --template vanilla
```

| Feature | Why |
|---------|-----|
| Dev server with HMR | Instant feedback on game logic changes without full reload |
| esbuild-powered transforms | Sub-50ms rebuilds during development |
| Rollup production builds | Optimal tree-shaking and chunk splitting |
| Native asset imports | `import sprite from './assets/player.png'` with hashing |
| Zero-config for vanilla JS | No framework plugins needed |

**Version:** Vite 6.3+ (requires Node 20.19+ or 22.12+)

**vite.config.js:**
```js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // relative paths for static hosting
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsInlineLimit: 4096, // inline assets < 4KB as base64
    rollupOptions: {
      output: {
        manualChunks: undefined // single bundle for game code
      }
    }
  },
  server: {
    port: 3000
  }
});
```

**Why not esbuild alone?** Vite wraps esbuild with proper HMR, asset pipeline, and HTML entry handling. Raw esbuild requires manual HTML serving and lacks HMR — significant friction for iterative game development.

**Why not Webpack?** 10-100x slower cold starts, complex configuration, unnecessary for a single-page game with no framework.

---

## Asset Pipeline

### Sprites (Pixel Art)

| Tool | Purpose | Notes |
|------|---------|-------|
| **Aseprite** ($20, one-time) | Sprite creation & animation | Industry standard for pixel art. Export as PNG sprite sheets with JSON atlas data. |
| **Free alternative: Piskel** (browser-based) | Lightweight sprite editor | If Aseprite unavailable. Exports sprite sheets directly. |

**Sprite sheet format:**
- Single PNG atlas per entity category (player, obstacles, UI)
- JSON hash atlas metadata (frame coordinates, dimensions)
- Target: 256x256 or 512x512 max per sheet (well within WebGL1 4096 limit)
- Integer scaling only (1x, 2x, 3x) — never fractional for pixel art
- `image-rendering: pixelated` CSS on canvas

**Optimization pipeline:**
```
Aseprite export (PNG) → optipng/pngquant CLI → Vite asset import
```

Install: `npm i -D vite-plugin-image-optimizer` or use CLI:
```bash
# pngquant for lossy (60-80% size reduction, imperceptible on pixel art)
pngquant --quality=80-100 --speed 1 --strip *.png
```

### Fonts

| Choice | Rationale |
|--------|-----------|
| **Bitmap font (PNG spritesheet)** | Pixel-perfect rendering, no font loading delay, no FOUT. Draw via canvas `drawImage()` from glyph atlas. |
| Fallback: system `monospace` via `fillText()` | For debug overlays only |

**Do NOT use web fonts** (Google Fonts, custom .woff2) — they add network requests, FOUT flicker, and canvas `fillText()` with custom fonts requires async font loading detection.

### Audio Files

| Format | Use Case | Rationale |
|--------|----------|-----------|
| **OGG Vorbis (.ogg)** | All audio | Best compression-to-quality for web games. ~10KB per short SFX. |
| **MP3 (.mp3)** | Fallback only | Safari <15.4 fallback. Slightly larger. |
| **WAV (.wav)** | Source files only | Never ship WAV — 10-50x larger. |

**Budget breakdown (target <500KB total):**
- Background loop: ~80-120KB (OGG, 30s loop)
- Key press SFX (5 variations): ~5KB each = 25KB
- Destroy SFX: ~8KB
- Game over jingle: ~15KB
- Total audio: ~170KB

---

## Audio

### Web Audio API (Native — no library)

**Architecture:**
```
AudioContext (single instance)
  └─ masterGain (global volume)
      ├─ musicGain → BufferSource (BGM loop)
      └─ sfxGain → BufferSource (per-play, pooled)
```

**Key implementation decisions:**

1. **Single AudioContext** — created on first user interaction (keyboard press to start game). Required by autoplay policy.

2. **Preload all SFX as AudioBuffers** — decode on init, instant playback via `BufferSourceNode.start()`. Total SFX <200KB fits in memory trivially.

3. **Node cleanup** — disconnect and dereference `BufferSourceNode` on `ended` event to prevent memory leaks during long sessions.

4. **No library needed** — Web Audio API is sufficient for:
  - Looping background music (`source.loop = true`)
  - Pitch variation on repeated SFX (`source.playbackRate.value`)
  - Volume ducking during events
  - Stereo panning (optional)

5. **Autoplay unlock pattern:**
```js
document.addEventListener('keydown', () => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
}, { once: true });
```

**Why not Howler.js?** Adds 10KB+ for features we don't need (spatial audio, sprites). Web Audio API directly covers our use case with zero dependencies.

**Why not standardized-audio-context?** Only needed for Safari <15.4 quirks. Our desktop-first target (Chrome/Firefox/Safari 16+) has full Web Audio support.

---

## Testing

### Strategy: Separate Logic from Rendering

```
Unit Tests (80%)          → Game state, collision, scoring, input mapping
Integration Tests (15%)   → Game loop timing, state transitions
Visual Regression (5%)    → Screenshot comparison (optional, CI only)
```

### Tools

| Tool | Version | Purpose |
|------|---------|---------|
| **Vitest** | 3.x | Unit & integration tests. Fast, ESM-native, Vite-compatible. |
| **Playwright** | 1.50+ | E2E / visual regression (screenshot comparison of canvas output) |
| **c8 / v8** | built into Vitest | Code coverage |

**vitest.config.js:**
```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // provides canvas mock
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov']
    }
  }
});
```

**Testing approach:**

1. **Game logic is pure functions** — collision detection, letter matching, score calculation, speed curves. Test with Vitest directly. No canvas mocking needed.

2. **Canvas rendering tests** — mock the 2D context with `vi.fn()` stubs. Verify `drawImage()` called with correct coordinates. Do NOT pixel-test unit renders.

3. **Integration tests** — run game loop for N frames in jsdom, assert state transitions (start, playing, game-over).

4. **Visual regression (CI only)** — Playwright screenshots of canvas at known game states. Compare against golden images with `toHaveScreenshot({ maxDiffPixels: 50 })`.

---

## Deployment

### GitHub Pages (Primary) or Netlify (Alternative)

| Aspect | GitHub Pages | Netlify |
|--------|-------------|---------|
| Cost | Free | Free tier |
| Custom domain | Yes (CNAME) | Yes |
| HTTPS | Automatic | Automatic |
| Deploy trigger | Push to `gh-pages` branch or `/docs` | Push to any branch |
| Build step | GitHub Actions | Built-in or CI |
| CDN | GitHub's CDN | Netlify Edge |

**Recommended: GitHub Pages via GitHub Actions**

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

**Performance headers (Netlify `_headers` or equivalent):**
```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: public, max-age=0, must-revalidate
```

**Why not Vercel?** Overkill — serverless functions, edge middleware not needed. GitHub Pages is zero-config for static sites and the repo is already on GitHub.

---

## What NOT to Use

| Technology | Why NOT |
|------------|---------|
| **Phaser / PixiJS / game frameworks** | Adds 200-500KB+ to bundle. Our game mechanics (sprite blitting, collision boxes, keyboard input) need <500 lines of canvas code. Frameworks solve problems we don't have (physics engines, tilemaps, scene graphs). |
| **TypeScript** | Build complexity (tsconfig, type declarations for canvas) outweighs benefit for a <2000 LOC game with one developer. Adds compile step. Use JSDoc `@param` comments instead for IDE intellisense. |
| **React / Vue / any UI framework** | DOM overhead, virtual DOM diffing is meaningless for canvas rendering. HUD elements (score, lives) render faster via `fillText()` than DOM manipulation. |
| **Webpack** | 10-100x slower than Vite/esbuild. Complex configuration. No benefit over Vite for this project size. |
| **Howler.js / Tone.js** | Unnecessary abstraction. Web Audio API handles our needs (play buffer, loop, volume) in ~80 lines. |
| **SASS / CSS preprocessors** | Game renders to canvas. Only CSS needed: canvas sizing + body background. One vanilla CSS file suffices. |
| **Firebase / Supabase** | No backend needed. High scores can use `localStorage`. If leaderboard needed later, add a simple Cloudflare Worker. |
| **Jest** | Slower than Vitest, poor ESM support, heavier configuration. Vitest is the 2025 standard for Vite projects. |
| **Parcel** | Slower than Vite, less ecosystem support in 2025, auto-detection magic causes unexpected behavior with canvas asset imports. |
| **Web Components** | No component hierarchy needed. Game is one canvas element + minimal DOM for start screen. |

---

## Confidence Levels

| Recommendation | Confidence | Notes |
|----------------|------------|-------|
| Vite 6.x as build tool | **HIGH** | Industry standard for vanilla JS in 2025. Fastest DX, zero-config. |
| Vanilla Canvas 2D (no framework) | **HIGH** | Proven for simple 2D games. Keeps bundle under 50KB JS. |
| ES2022+ modules, no TypeScript | **HIGH** | Appropriate for project scope. TypeScript becomes worthwhile at >5000 LOC or multiple developers. |
| Web Audio API (no library) | **HIGH** | Native API covers all requirements. Well-documented, universal browser support. |
| OGG Vorbis for audio | **HIGH** | Best size/quality ratio. Universal support in 2025 desktop browsers. |
| Vitest 3.x for testing | **HIGH** | Fastest test runner, native Vite integration, ESM-first. |
| Playwright for visual regression | **MEDIUM** | Useful for CI but may be overkill for solo dev. Add when visual bugs become a concern. |
| GitHub Pages deployment | **HIGH** | Zero cost, automatic from repo, sufficient CDN for a game under 500KB. |
| Aseprite for pixel art | **HIGH** | Industry standard. Worth the $20. Piskel is acceptable free alternative. |
| PNG sprite atlas (not individual files) | **HIGH** | Fewer HTTP requests, better caching, standard practice for web games. |
| Bitmap font over web fonts | **MEDIUM** | Better for pixel-art aesthetic and performance. Adds implementation effort vs. `fillText()` with system font. Recommend implementing bitmap font only if custom pixel font is part of the art direction. |
| No backend / localStorage only | **HIGH** | Appropriate for MVP. Leaderboard is a post-launch feature. |

---

## Version Summary

| Package | Version (as of May 2025) | Lock to |
|---------|--------------------------|---------|
| Node.js | 22.x LTS | `>=22.12` |
| Vite | 6.3.x | `^6.3` |
| Vitest | 3.1.x | `^3.1` |
| Playwright | 1.50.x | `^1.50` |
| pngquant | 3.0.x (CLI) | latest |
| optipng | 0.7.x (CLI) | latest |

---

## Project Structure (Recommended)

```
letter-runner/
├── index.html              # Single entry point
├── vite.config.js          # Build configuration
├── package.json
├── src/
│   ├── main.js             # Entry: canvas setup, game loop init
│   ├── game.js             # Game state machine
│   ├── player.js           # Player entity
│   ├── obstacles.js        # Obstacle spawning & letter assignment
│   ├── input.js            # Keyboard handler
│   ├── renderer.js         # All canvas draw calls
│   ├── audio.js            # Web Audio manager
│   ├── collision.js        # AABB collision detection
│   └── config.js           # Constants (speeds, sizes, colors)
├── assets/
│   ├── sprites/            # PNG sprite sheets + JSON atlas
│   ├── audio/              # OGG files
│   └── fonts/              # Bitmap font atlas (if used)
├── tests/
│   ├── collision.test.js
│   ├── game.test.js
│   └── e2e/
│       └── gameplay.spec.js  # Playwright visual tests
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages deployment
└── dist/                   # Build output (git-ignored)
```
