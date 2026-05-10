# Research: Phase 2 — Movement & Input

**Date:** 2026-05-09
**Phase Goal:** Player runs on scrolling ground, lettered obstacles approach, correct keypress destroys them.
**Requirements:** LOOP-01, LOOP-02, LOOP-03, LOOP-04, TECH-07, TECH-11

---

## 1. Object Pooling Pattern

Object pooling avoids GC pauses by pre-allocating entities and reusing them instead of creating/destroying.

### Pattern

```javascript
// src/systems/pool.js
export function createPool(factory, initialSize = 20) {
  const pool = [];
  const active = [];

  // Pre-allocate
  for (let i = 0; i < initialSize; i++) {
    pool.push(factory());
  }

  return {
    acquire() {
      const obj = pool.length > 0 ? pool.pop() : factory();
      active.push(obj);
      return obj;
    },

    release(obj) {
      const idx = active.indexOf(obj);
      if (idx !== -1) {
        active.splice(idx, 1);
        pool.push(obj);
      }
    },

    getActive() {
      return active;
    },

    releaseAll() {
      while (active.length > 0) {
        pool.push(active.pop());
      }
    },

    stats() {
      return { active: active.length, available: pool.length };
    }
  };
}
```

### Obstacle Factory

```javascript
function createObstacle() {
  return {
    x: 0,
    y: 0,
    width: 48,
    height: 56,
    letter: '',
    speed: 0,
    active: false
  };
}
```

### Usage in Spawner

```javascript
const obstacle = pool.acquire();
obstacle.x = screenWidth + 10;
obstacle.y = groundY - obstacle.height;
obstacle.letter = pickLetter();
obstacle.speed = currentSpeed;
obstacle.active = true;
```

### Design Decisions
- Pre-allocate 20 obstacles (DIFF-06 says max 4 on screen, but we over-allocate to avoid ever needing runtime allocation).
- `active` array is the iteration target for update/render loops.
- Use `splice` for release (small array, max 4 active — negligible cost).
- No `new` keyword during gameplay — all allocation happens at init.

---

## 2. Side-Scrolling Ground Plane

### Approach: Simple Repeating Tile Scroll (No Parallax for Phase 2)

Parallax is Phase 7 polish. For now, a single ground band scrolls to sell the "running" illusion.

```javascript
// src/entities/ground.js
export function createGround(config) {
  return {
    offset: 0,            // pixels scrolled
    speed: config.scrollSpeed,
    tileWidth: 64,        // width of one repeating unit
    y: 0,                 // computed from canvas height
    height: 40            // ground band height
  };
}

export function updateGround(ground, dt) {
  ground.offset = (ground.offset + ground.speed * dt) % ground.tileWidth;
}

export function renderGround(ctx, ground, canvasWidth, canvasHeight) {
  ground.y = canvasHeight - ground.height;
  ctx.fillStyle = '#1a1a2e';  // placeholder dark ground

  // Draw ground band
  ctx.fillRect(0, ground.y, canvasWidth, ground.height);

  // Draw scroll indicators (dashes or marks to show movement)
  ctx.fillStyle = '#2a2a4e';
  const startX = -ground.offset;
  for (let x = startX; x < canvasWidth; x += ground.tileWidth) {
    ctx.fillRect(x, ground.y + 4, 32, 2);
  }
}
```

### Key Points
- Ground scrolls left at same speed as obstacles (they share `scrollSpeed`).
- Modulo wrap keeps offset bounded — no overflow over long play sessions.
- Ground Y is computed from canvas height (responsive).
- Player stands on `canvasHeight - groundHeight - playerHeight`.

---

## 3. Keyboard Input Handling

### Requirements
- TECH-07: `keydown` events, normalize to uppercase.
- Only letter keys A-Z are meaningful (ignore modifiers, function keys, etc.).
- Prevent key repeat (holding a key should not spam matches).

### Pattern

```javascript
// src/systems/input.js
import { events } from '../core/events.js';

const pressed = new Set();  // currently held keys (for repeat prevention)

function handleKeyDown(e) {
  // Ignore repeat events (key held down)
  if (e.repeat) return;

  // Normalize to uppercase letter
  const key = e.key.toUpperCase();

  // Only process single letters A-Z
  if (key.length === 1 && key >= 'A' && key <= 'Z') {
    if (!pressed.has(key)) {
      pressed.add(key);
      events.emit('KEY_PRESS', { key });
    }
  }
}

function handleKeyUp(e) {
  const key = e.key.toUpperCase();
  pressed.delete(key);
}

export function initInput() {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
}

export function destroyInput() {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
}
```

### Design Decisions
- **`keydown` not `keyup`:** Responsive feel — action fires the instant the key goes down.
- **`e.repeat` guard:** Prevents held keys from spamming. One press = one action.
- **Set-based tracking:** Prevents edge cases where keydown fires without matching keyup (tab switch, etc.).
- **No `preventDefault()`:** Avoid breaking browser shortcuts (Ctrl+R, etc.). Only letter keys are captured.
- **Emit immediately:** No buffering/polling needed. The event bus delivers to the obstacle matcher synchronously within the same frame if the listener is registered.
- **Normalization:** `e.key.toUpperCase()` handles both cases regardless of Caps Lock state.

---

## 4. Danger Zone Collision Detection

### Concept

The "danger zone" is an X-range on screen where the player's keypress can match obstacles. Defined as the right portion of the screen (per LOOP-04: "right half of screen").

```
|                    |          DANGER ZONE          |
|   safe (passed)    |==============================|
0              dangerLeft                        screenWidth
```

### Implementation

```javascript
// In config.js
export const GAME = {
  // ...existing
  DANGER_ZONE_START: 0.3,  // 30% from left edge (player is around 10-15%)
  DANGER_ZONE_END: 1.0,    // right edge of screen
};
```

```javascript
// src/systems/matcher.js
import { events } from '../core/events.js';
import { GAME } from '../config.js';
import { getWidth } from '../core/canvas.js';

export function initMatcher(obstaclePool) {
  events.on('KEY_PRESS', ({ key }) => {
    const screenWidth = getWidth();
    const dangerLeft = screenWidth * GAME.DANGER_ZONE_START;
    const dangerRight = screenWidth * GAME.DANGER_ZONE_END;
    const obstacles = obstaclePool.getActive();

    // Find the first obstacle in the danger zone matching this key
    // Iterate right-to-left (closest to player first)
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      if (obs.letter === key && obs.x >= dangerLeft && obs.x <= dangerRight) {
        // Match found — destroy it
        events.emit('OBSTACLE_DESTROYED', {
          letter: obs.letter,
          x: obs.x,
          y: obs.y
        });
        obstaclePool.release(obs);
        return; // Only destroy one per keypress
      }
    }
    // No match — do nothing (LOOP-10: no penalty at levels 1-3)
  });
}
```

### Key Points
- Simple X-range check (no AABB needed for matching — obstacle just needs to be within the horizontal zone).
- Match the **closest** obstacle to the player when multiple share the same letter (iterate from end).
- Only one obstacle destroyed per keypress.
- The danger zone starts well ahead of the player so letters are readable before they arrive.
- Zone tuning: start at 30% gives ~70% of screen as valid typing area. Adjustable in config.

---

## 5. Entity Pattern — Plain Objects (Not Classes)

Per the architecture doc, entities are plain objects. This keeps them poolable, serializable, and avoids prototype chain overhead.

### Player Entity

```javascript
// src/entities/player.js
import { getWidth, getHeight } from '../core/canvas.js';

export function createPlayer() {
  return {
    x: 0,
    y: 0,
    width: 32,
    height: 32,
    // Animation state for future sprite work
    frameIndex: 0,
    frameTimer: 0
  };
}

export function resetPlayer(player, canvasWidth, canvasHeight, groundHeight) {
  player.x = canvasWidth * 0.12;  // 12% from left
  player.y = canvasHeight - groundHeight - player.height;
}

export function renderPlayer(ctx, player) {
  // Phase 2: simple colored rectangle
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}
```

### Why Plain Objects
- Pool-friendly: `acquire()` returns the same object shape every time.
- No constructor overhead or prototype lookup.
- Easy to reset: just assign properties.
- Fits the "config-driven" philosophy — all magic numbers in config.js.

---

## 6. Rendering Text on Moving Obstacles

### Challenge
Text must be readable at scroll speeds of 200-400+ px/s. Key considerations:
- Font must be large enough to read in motion.
- High contrast between letter color and obstacle background.
- No sub-pixel blur (integer coordinates).

### Pattern

```javascript
// src/entities/obstacle.js — render function
export function renderObstacle(ctx, obstacle) {
  // Draw obstacle body
  ctx.fillStyle = '#ff2266';  // neon pink placeholder
  ctx.fillRect(
    Math.round(obstacle.x),
    Math.round(obstacle.y),
    obstacle.width,
    obstacle.height
  );

  // Draw letter centered on obstacle
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    obstacle.letter,
    Math.round(obstacle.x + obstacle.width / 2),
    Math.round(obstacle.y + obstacle.height / 2)
  );
}
```

### Readability Techniques
1. **`Math.round()` on positions** — Prevents sub-pixel rendering that causes blurry text at speed.
2. **Bold monospace font** — Maximum legibility at small sizes; monospace keeps letter width predictable.
3. **High contrast** — White text on dark/neon obstacle. Passes WCAG AAA.
4. **Font size 24px minimum** — Readable at a glance during fast scroll. May increase to 28px during tuning.
5. **`textAlign: 'center'` + `textBaseline: 'middle'`** — Letter always centered regardless of character width (W vs I).
6. **No text shadow/stroke for Phase 2** — Keep it simple; add glow effects in Phase 7.

### Performance Note
`fillText` is cheap for single characters. No need to pre-render to offscreen canvas unless profiling shows issues (unlikely with max 4 obstacles).

---

## 7. Spawn Timing & Spacing

### Strategy: Timer-Based with Minimum Spacing

```javascript
// src/systems/spawner.js
import { createPool } from './pool.js';
import { GAME } from '../config.js';
import { getWidth, getHeight } from '../core/canvas.js';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function createSpawner(pool, config) {
  return {
    pool,
    timer: 0,
    interval: config.spawnInterval,  // seconds between spawns
    minGap: config.minObstacleGap,   // minimum px between obstacles
  };
}

export function updateSpawner(spawner, dt, scrollSpeed, activeObstacles, groundY) {
  spawner.timer += dt;

  if (spawner.timer >= spawner.interval) {
    spawner.timer = 0;

    // Guard: don't exceed max on-screen obstacles
    if (activeObstacles.length >= GAME.MAX_OBSTACLES) return;

    // Guard: minimum gap from last spawned obstacle
    const screenWidth = getWidth();
    const lastObs = activeObstacles[activeObstacles.length - 1];
    if (lastObs && (screenWidth - lastObs.x) < spawner.minGap) return;

    // Pick a letter not currently on screen
    const usedLetters = new Set(activeObstacles.map(o => o.letter));
    let letter;
    let attempts = 0;
    do {
      letter = LETTERS[Math.floor(Math.random() * 26)];
      attempts++;
    } while (usedLetters.has(letter) && attempts < 26);

    // Spawn
    const obs = spawner.pool.acquire();
    obs.x = screenWidth + 10;
    obs.y = groundY - obs.height;
    obs.letter = letter;
    obs.speed = scrollSpeed;
    obs.active = true;
  }
}
```

### Config Values (Phase 2 defaults — Level 1)

```javascript
// Additions to config.js GAME object
export const GAME = {
  // ...existing
  SCROLL_SPEED: 200,         // px/s base speed
  SPAWN_INTERVAL: 2.0,       // seconds between obstacles at level 1
  MIN_OBSTACLE_GAP: 120,     // minimum px gap between obstacle right edges
  MAX_OBSTACLES: 4,          // hard cap on simultaneous on-screen obstacles
  OBSTACLE_WIDTH: 48,
  OBSTACLE_HEIGHT: 56,
  PLAYER_WIDTH: 32,
  PLAYER_HEIGHT: 32,
  GROUND_HEIGHT: 40,
  PLAYER_X_PERCENT: 0.12,    // player sits at 12% from left
  DANGER_ZONE_START: 0.3,    // danger zone starts at 30% from left
};
```

### Spacing Logic
- **Timer-based:** Simple countdown. When it hits zero, attempt a spawn.
- **Gap guard:** If the last obstacle hasn't moved far enough from the right edge, skip this spawn cycle. Prevents clustering.
- **Max cap:** Never exceed 4 on screen (DIFF-06).
- **Unique letters:** Loop until an unused letter is found (max 26 attempts — guaranteed to find one since max 4 obstacles < 26 letters).

### Obstacle Lifecycle

```
spawn at x = screenWidth + 10
     │
     ▼ moves left at scrollSpeed * dt
     │
     ├── Player presses matching key while in danger zone → DESTROYED (release to pool)
     │
     └── x + width < 0 → OFF-SCREEN (release to pool, Phase 3 adds life loss)
```

---

## 8. Integration Plan

### New Files to Create

| File | Purpose |
|------|---------|
| `src/systems/pool.js` | Generic object pool factory |
| `src/systems/input.js` | Keyboard listener, emits KEY_PRESS |
| `src/systems/spawner.js` | Timer-based obstacle spawning |
| `src/systems/matcher.js` | Matches KEY_PRESS to obstacle in danger zone |
| `src/entities/player.js` | Player factory + render |
| `src/entities/obstacle.js` | Obstacle factory + render |
| `src/entities/ground.js` | Ground plane scroll + render |

### Modifications to Existing Files

| File | Change |
|------|--------|
| `src/config.js` | Add GAME constants (speeds, sizes, zones) |
| `src/main.js` | Wire up all new systems in update/render |

### Update/Render Order in main.js

```javascript
function update(dt) {
  updateGround(ground, dt);
  updateSpawner(spawner, dt, GAME.SCROLL_SPEED, obstaclePool.getActive(), groundY);
  updateObstacles(obstaclePool, dt);  // move all active obstacles left
  cleanupOffscreen(obstaclePool);     // release obstacles that left the screen
}

function render() {
  const ctx = getCtx();
  ctx.fillStyle = COLORS.BG;
  ctx.fillRect(0, 0, getWidth(), getHeight());

  renderGround(ctx, ground, getWidth(), getHeight());
  renderPlayer(ctx, player);
  renderObstacles(ctx, obstaclePool.getActive());
}
```

### Event Flow for Phase 2

```
keydown → input.js → events.emit('KEY_PRESS', {key})
                          │
                          ▼
              matcher.js listener
                          │
                ┌─────────┴──────────┐
                │ obstacle in zone   │ no match → nothing
                │ with matching key  │
                └────────┬───────────┘
                         │
              events.emit('OBSTACLE_DESTROYED')
                         │
                         ▼
              obstaclePool.release(obs)
```

---

## 9. Open Questions for Planner

1. **Should the player have a run animation in Phase 2?** Recommendation: No. Use static rectangle. Animation comes in Phase 7 with sprites.
2. **Should off-screen obstacles cost a life in Phase 2?** Recommendation: No. Just release them. Life system is Phase 3.
3. **Debug visualization for danger zone?** Recommendation: Yes, draw a faint vertical line at danger zone start during development. Remove or gate behind a debug flag.
4. **Should we emit OBSTACLE_MISSED when one goes off-screen?** Recommendation: Yes — Phase 3 will subscribe to it for life loss. Emit it now, just don't handle it yet.

---

## 10. Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Object pool splice is O(n) | Max 4 active obstacles — n is trivially small |
| Key repeat fires despite guard | `e.repeat` check + Set tracking covers all browsers |
| Text unreadable at high speeds | Math.round positions + bold 24px font + high contrast |
| Spawner can cluster obstacles | Min gap guard + max cap prevent this |
| Memory leak if release is missed | `cleanupOffscreen` sweep every frame catches orphans |
| DPR affects text rendering | Already handled by canvas.js scale — text sizes are in logical pixels |

---

*Research complete. Ready for plan creation.*
