# Architecture: Letter Runner (Canvas + JS Endless Runner)

## System Overview

The game is composed of eight major systems, each with a single responsibility:

| System | Responsibility |
|--------|---------------|
| **Game Loop** | Drives the update/render cycle at 60fps using `requestAnimationFrame` |
| **Renderer** | Draws all visual elements to the Canvas context |
| **Input Handler** | Captures keyboard events, normalizes them, queues actions |
| **Entity Manager** | Creates, tracks, and removes game objects (player, obstacles) |
| **Physics/Collision** | Moves entities, detects AABB collisions between player and obstacles |
| **Scoring & Progression** | Tracks score, level, manages difficulty scaling |
| **Audio** | Plays sound effects and background music via Web Audio API |
| **Particles** | Spawns and updates visual effects (letter destruction, trail) |
| **UI/HUD** | Renders score, level, and overlay screens (menu, game-over) |

---

## Game Loop Architecture

```
┌─────────────────────────────────────────────────────┐
│                  requestAnimationFrame               │
└──────────────────────────┬──────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Calculate  │
                    │  deltaTime  │
                    └──────┬──────┘
                           │
              ┌────────────▼────────────┐
              │     UPDATE PHASE        │
              │                         │
              │  1. Input.poll()        │
              │  2. Entities.update(dt) │
              │  3. Physics.step(dt)    │
              │  4. Collision.check()   │
              │  5. Scoring.update()    │
              │  6. Particles.update(dt)│
              │  7. Audio.update()      │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │     RENDER PHASE        │
              │                         │
              │  1. Clear canvas        │
              │  2. Draw background     │
              │  3. Draw entities       │
              │  4. Draw particles      │
              │  5. Draw HUD            │
              └────────────┬────────────┘
                           │
                    ┌──────▼──────┐
                    │   Schedule  │
                    │  next frame │
                    └─────────────┘
```

### Timing Strategy

- Use `requestAnimationFrame` for the loop.
- Calculate `deltaTime` as `(currentTimestamp - lastTimestamp) / 1000` (seconds).
- Cap deltaTime at `1/30` to prevent spiral-of-death on tab-switch.
- All movement/physics use `speed * deltaTime` for frame-rate independence.

---

## Component Communication

Systems communicate through a shared **Game State** object and an **Event Bus** (pub/sub). No system calls another system directly.

```
┌──────────┐     events      ┌──────────────┐
│  Input   │ ───────────────▶│  Event Bus   │
└──────────┘                  └──────┬───────┘
                                     │ dispatches to subscribers
         ┌───────────────────────────┼───────────────────────┐
         │                           │                       │
         ▼                           ▼                       ▼
┌──────────────┐         ┌──────────────────┐      ┌──────────────┐
│   Entities   │         │     Scoring      │      │    Audio     │
└──────────────┘         └──────────────────┘      └──────────────┘
```

### Event Bus Events

| Event | Payload | Producers | Consumers |
|-------|---------|-----------|-----------|
| `KEY_PRESS` | `{ key: string }` | Input | Entities |
| `OBSTACLE_DESTROYED` | `{ letter, x, y }` | Collision | Scoring, Audio, Particles |
| `PLAYER_HIT` | `{ obstacle }` | Collision | Game State, Audio, Particles |
| `LEVEL_UP` | `{ newLevel, speed }` | Scoring | Entities, Audio, UI |
| `GAME_OVER` | `{ finalScore }` | Game State | UI, Audio |
| `GAME_START` | `{}` | UI | Game State, Entities, Scoring |

### Shared Game State

```javascript
const gameState = {
  status: 'menu' | 'playing' | 'gameOver',
  score: 0,
  level: 1,
  speed: 200,          // pixels per second (base obstacle speed)
  destroyCount: 0,     // resets each level
  destroysPerLevel: 10,
  maxObstacles: 4,
  player: { x, y, width, height, sprite },
  obstacles: [],       // active obstacle entities
  particles: [],       // active particle effects
};
```

---

## Data Flow

### Per-Frame Flow (Playing State)

```
Keyboard Event
     │
     ▼
Input Handler (buffers key)
     │
     ▼
Game Loop calls Input.poll() → returns buffered key or null
     │
     ▼
Entity Manager: checks if key matches any obstacle's letter
     │
     ├── MATCH → emit OBSTACLE_DESTROYED
     │              │
     │              ├─▶ Scoring: score++, destroyCount++
     │              │     └─▶ if destroyCount >= 10 → emit LEVEL_UP
     │              ├─▶ Particles: spawn explosion at obstacle position
     │              └─▶ Audio: play destroy sound
     │
     └── NO MATCH → no action (or play miss sound)
     │
     ▼
Physics: move obstacles leftward at current speed * dt
     │
     ▼
Collision: check if any obstacle overlaps player hitbox
     │
     ├── COLLISION → emit PLAYER_HIT → Game State sets status = 'gameOver'
     │
     └── NO COLLISION → continue
     │
     ▼
Renderer: draw everything from current state
```

### Obstacle Lifecycle

```
Spawner (timer-based) → creates obstacle at right edge
     │
     ▼
Obstacle moves left each frame (speed * dt)
     │
     ├── Destroyed by key press → remove, spawn particles
     ├── Hits player → game over
     └── Exits left edge → remove (player missed it; optional penalty)
```

---

## File Structure

```
game/
├── index.html              # Canvas element, load scripts
├── css/
│   └── style.css           # Minimal full-screen canvas styling
├── src/
│   ├── main.js             # Entry point, bootstraps game
│   ├── game.js             # Game loop, state machine
│   ├── config.js           # Constants (speeds, sizes, colors, levels)
│   ├── events.js           # Event bus (pub/sub)
│   ├── input.js            # Keyboard input handler
│   ├── renderer.js         # Canvas drawing utilities
│   ├── entities/
│   │   ├── player.js       # Player entity (position, sprite, hitbox)
│   │   └── obstacle.js     # Obstacle entity (letter, position, speed)
│   ├── systems/
│   │   ├── spawner.js      # Obstacle spawning logic & timing
│   │   ├── physics.js      # Movement updates
│   │   ├── collision.js    # AABB collision detection
│   │   ├── scoring.js      # Score tracking, level progression
│   │   ├── particles.js    # Particle system (creation, update, draw)
│   │   └── audio.js        # Sound effect playback
│   ├── ui/
│   │   ├── hud.js          # In-game score/level display
│   │   └── screens.js      # Menu, game-over overlays
│   └── utils/
│       ├── math.js         # Random range, lerp, clamp
│       └── sprite.js       # Sprite loading and drawing helper
├── assets/
│   ├── sprites/            # PNG sprite sheets (player, obstacles)
│   ├── sounds/             # WAV/MP3 sound effects
│   └── fonts/              # Pixel font (optional)
└── .planning/              # GSD planning files
```

### Module Pattern

Use ES modules (`type="module"` in script tag). Each file exports a single system or utility. No bundler needed for development; optionally add one for production.

---

## Build Order

Systems have dependencies. Build in this order to get a playable game as early as possible:

### Wave 1: Core Loop (Minimum Viable Game)

| Order | System | Rationale |
|-------|--------|-----------|
| 1 | **Config** | Constants everything else references |
| 2 | **Event Bus** | Communication backbone; trivial to implement |
| 3 | **Game Loop + State Machine** | Skeleton that drives everything; can render an empty canvas |
| 4 | **Renderer (basic)** | Draw rectangles for player/obstacles (sprites later) |
| 5 | **Player Entity** | Static rectangle on screen |
| 6 | **Input Handler** | Capture keyboard, verify with console.log |
| 7 | **Obstacle Entity + Spawner** | Rectangles moving left with random letters |
| 8 | **Collision Detection** | Detect overlap between obstacle and player |
| 9 | **Letter Matching** | Key press destroys matching obstacle |

**Milestone: Playable prototype** - rectangles, keyboard destroys obstacles, game over on collision.

### Wave 2: Scoring & Progression

| Order | System | Rationale |
|-------|--------|-----------|
| 10 | **Scoring** | Track score, display it |
| 11 | **HUD** | Render score/level on canvas |
| 12 | **Difficulty Progression** | Speed increases, more obstacles per level |

**Milestone: Full game loop** - score goes up, game gets harder.

### Wave 3: Polish & Juice

| Order | System | Rationale |
|-------|--------|-----------|
| 13 | **Sprites** | Replace rectangles with pixel art |
| 14 | **Particles** | Explosion on destroy, trail effects |
| 15 | **Audio** | Sound effects for destroy, hit, level-up |
| 16 | **UI Screens** | Menu screen, game-over with restart |
| 17 | **Background** | Scrolling parallax or static pixel-art background |

**Milestone: Polished game** - looks and sounds good, complete flow.

### Dependency Graph

```
Config ──▶ Everything
Event Bus ──▶ Everything
Game Loop ──▶ All systems (calls their update/render)
Renderer ──▶ Entities, Particles, UI
Input ──▶ Entity Manager (letter matching)
Spawner ──▶ Obstacle Entity, Config (timing/difficulty)
Collision ──▶ Entities (reads positions)
Scoring ──▶ Config (destroysPerLevel), Events (OBSTACLE_DESTROYED)
Particles ──▶ Events (OBSTACLE_DESTROYED), Renderer
Audio ──▶ Events (various triggers)
UI ──▶ Game State, Events (GAME_OVER, GAME_START)
```

---

## State Management

The game has three states managed by a simple state machine in `game.js`:

```
┌────────┐   GAME_START   ┌─────────┐   PLAYER_HIT   ┌───────────┐
│  MENU  │ ──────────────▶│ PLAYING │ ──────────────▶ │ GAME_OVER │
└────────┘                 └─────────┘                 └───────────┘
     ▲                                                       │
     └───────────────────── GAME_START ──────────────────────┘
```

### State Behavior

| State | Update | Render | Input |
|-------|--------|--------|-------|
| **Menu** | Nothing (or animate title) | Menu screen | Any key or click starts game |
| **Playing** | All systems active | Game world + HUD | Letter keys destroy obstacles |
| **Game Over** | Nothing (particles finish) | Game-over overlay + final score | Any key/click returns to menu |

### State Transitions

```javascript
// In game.js
function transition(newState) {
  gameState.status = newState;
  events.emit(`STATE_${newState.toUpperCase()}`);
  
  if (newState === 'playing') {
    resetGameState();   // score=0, level=1, clear obstacles
  }
}
```

### Reset Strategy

On `GAME_START`:
- Clear all obstacles and particles
- Reset score, level, destroyCount to initial values
- Reset speed to base value from config
- Reposition player

---

## Key Design Decisions

1. **No framework** - Vanilla JS + Canvas 2D context. Keeps bundle size zero and removes abstraction overhead for a simple game.

2. **Event-driven communication** - Systems never import each other. The event bus decouples everything, making systems easy to add/remove/test independently.

3. **Delta-time movement** - All speeds are in pixels-per-second, multiplied by dt. Works correctly at any frame rate.

4. **Config-driven difficulty** - All tuning values (base speed, speed increment per level, spawn interval, max obstacles) live in `config.js`. Balancing requires zero code changes.

5. **Entity-as-plain-object** - No class hierarchy. Obstacles and particles are simple `{ x, y, width, height, letter, speed }` objects. Avoids over-engineering for a small game.

6. **AABB collision only** - All hitboxes are rectangles. Pixel-perfect collision is unnecessary for chunky 16x16 sprites.

7. **Immediate-mode rendering** - Clear and redraw every frame. No retained scene graph. Simple and sufficient for under 100 draw calls per frame.
