# Multi-Letter Sequence Obstacles - Research & Implementation Plan

## Summary

This document covers the design and implementation of 2-3 letter combo obstacles for Letter Runner. Research draws from Typing of the Dead, ZType, Epistory, TypeRacer, and reaction-time studies (Hick's Law). Includes specific integration recommendations for our event bus, object pool, and Canvas rendering architecture.

---

## 1. Input Buffering

### Problem
Single-key obstacles need one `KEY_PRESS` event. Multi-letter combos require tracking a sequence of presses in order, within a time window, while the obstacle is still in the danger zone.

### Recommended Approach: Sequential State Machine (No Queue)

Do NOT use a general input queue. Instead, each multi-letter obstacle maintains its own **progress index** tracking how many letters have been typed correctly so far. On each `KEY_PRESS`, the matcher checks the *next expected letter* for the frontmost combo obstacle.

**Why not a full queue/buffer?**
- Letter Runner's danger zone is narrow; obstacles transit in ~2-3 seconds
- A buffer adds latency and complexity for minimal gain at 2-3 letter sequences
- ZType and Typing of the Dead both use immediate letter-by-letter matching, not buffering

**Time Window**
- No explicit timeout per letter -- the obstacle's travel across the danger zone IS the time window
- A 2-letter combo at scroll speed 250px/s across a ~200px danger zone gives ~0.8s total
- If the player doesn't complete the sequence before the obstacle exits, it counts as OBSTACLE_MISSED

**Implementation in `matcher.js`:**
```javascript
events.on('KEY_PRESS', ({ key }) => {
  const dangerLeft = getWidth() * GAME.DANGER_ZONE_START;
  const dangerRight = getWidth();
  const active = obstaclePool.getActive();

  for (let i = active.length - 1; i >= 0; i--) {
    const obs = active[i];
    if (obs.x >= dangerLeft && obs.x <= dangerRight) {
      // Multi-letter: check next expected letter
      const nextLetter = obs.letters[obs.progress];
      if (nextLetter === key) {
        obs.progress++;
        events.emit('COMBO_PROGRESS', { obstacle: obs, progress: obs.progress });
        if (obs.progress >= obs.letters.length) {
          events.emit('OBSTACLE_DESTROYED', { letter: obs.letters.join(''), x: obs.x, y: obs.y, combo: true });
          obstaclePool.release(obs);
        }
        return; // Consume the keypress
      } else if (obs.progress > 0) {
        // Wrong key mid-sequence: RESET progress (penalty)
        obs.progress = 0;
        events.emit('COMBO_RESET', { obstacle: obs, wrongKey: key });
        events.emit('WRONG_KEY', { key });
        return;
      }
      // If progress === 0 and doesn't match first letter, fall through to check other obstacles
    }
  }
});
```

### Key Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Queue vs immediate | Immediate matching | Simpler; obstacle position is the natural timeout |
| Explicit time window | No (use obstacle travel) | Avoids timer complexity; feels natural |
| Key repeat | Already handled (`e.repeat` guard in input.js) | No change needed |
| Input lock during combo | No | Player should keep typing fast; lock would feel punitive |

---

## 2. Visual Display

### Recommendation: Single Wider Block with Individual Letter Cells

Use ONE obstacle entity with a wider hitbox, subdivided visually into letter cells. This approach:
- Keeps collision/pool logic simple (one entity = one pool object)
- Shows clear left-to-right typing order
- Allows per-letter state coloring

**Why NOT separate chained blocks?**
- Separate entities complicate pool management and gap logic
- A "train" of blocks moving together is really just one wider block with internal divisions
- Single entity simplifies the danger-zone check (one x position)

### Visual Design (Canvas Rendering)

```
+---+---+---+
| A | B | C |   <- 3-letter combo (width = 3 * LETTER_CELL_WIDTH)
+---+---+---+
 [done][next][pending]
```

**Color States:**
| State | Color | Effect |
|-------|-------|--------|
| Pending (untyped) | OBSTACLE_BORDER (#ff2266) border, OBSTACLE_BODY fill | Standard neon look |
| Next (current target) | YELLOW (#ffcc00) border, pulsing glow | Draw player attention |
| Completed | GREEN (#00ff88) fill, reduced glow | Satisfying confirmation |

**Rendering approach in `renderObstacles`:**
```javascript
function renderComboObstacle(ctx, obs) {
  const cellW = GAME.OBSTACLE_WIDTH; // reuse single-letter width per cell
  const totalW = obs.letters.length * cellW;
  const x = Math.round(obs.x);
  const y = Math.round(obs.y);
  const h = obs.height;

  for (let i = 0; i < obs.letters.length; i++) {
    const cellX = x + i * cellW;
    const isCompleted = i < obs.progress;
    const isNext = i === obs.progress;

    // Cell background
    ctx.fillStyle = isCompleted ? COLORS.PALETTE.GREEN : COLORS.PALETTE.OBSTACLE_BODY;
    ctx.fillRect(cellX, y, cellW, h);

    // Cell border
    ctx.strokeStyle = isNext ? COLORS.PALETTE.YELLOW : 
                     isCompleted ? COLORS.PALETTE.GREEN : COLORS.PALETTE.OBSTACLE_BORDER;
    ctx.lineWidth = isNext ? 3 : 2;
    ctx.strokeRect(cellX + 1, y + 1, cellW - 2, h - 2);

    // Glow for next letter
    if (isNext) {
      ctx.shadowColor = COLORS.PALETTE.YELLOW;
      ctx.shadowBlur = 12;
    }

    // Letter text
    ctx.fillStyle = isCompleted ? COLORS.PALETTE.DARK : COLORS.PALETTE.OBSTACLE_LETTER;
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obs.letters[i], cellX + cellW / 2, y + h / 2);

    ctx.shadowBlur = 0;
  }
}
```

### Games Reference
- **ZType**: Words displayed as text labels above approaching ships; letters disappear as typed
- **Typing of the Dead**: Word box above zombies; letters cross out as typed
- **Epistory**: Words float above enemies; typed portion changes color

Our approach (individual cells in a block) is best for a side-scrolling runner because it:
1. Maintains the block-obstacle visual language already established
2. Shows clear spatial progress (left-to-right matches the typing direction)
3. Works within the existing obstacle rendering pipeline

---

## 3. Partial Completion Feedback

### Visual Feedback
- Completed letters turn GREEN with reduced opacity/glow
- Current (next) letter pulses YELLOW with enhanced glow (shadowBlur oscillating 8-16 on a sine wave)
- Remaining letters stay in standard RED/magenta style

### Audio Feedback
- Each correct letter in a combo: Play a rising-pitch "tick" (short sine, freq increasing per step)
  - Letter 1: 660Hz, Letter 2: 880Hz, Letter 3: 1047Hz
- Full combo completion: Play the existing POP sound + bonus sparkle
- Wrong mid-sequence: Play THUD (existing) + visual shake on the obstacle

### Wrong Key Mid-Sequence: Reset with Penalty

**Decision: Full reset of combo progress.**

Rationale from research:
- TypeRacer requires backspace correction (too slow for action game)
- ZType ignores wrong keys (too lenient)
- Typing of the Dead lets wrong keys delay but not damage
- **Our approach**: Reset progress to 0 + emit WRONG_KEY (triggers input lock at level 4+)

This creates meaningful penalty:
1. Player loses time (must re-type from start)
2. Wrong-key penalty lock triggers (0.3s at level 4+)
3. Obstacle continues moving, reducing remaining time

### Event Flow
```
KEY_PRESS {key: 'A'} -> matches obs.letters[0]='A' -> progress=1 -> COMBO_PROGRESS
KEY_PRESS {key: 'B'} -> matches obs.letters[1]='B' -> progress=2 -> COMBO_PROGRESS
KEY_PRESS {key: 'X'} -> doesn't match obs.letters[2]='C' -> progress=0 -> COMBO_RESET + WRONG_KEY
```

---

## 4. Difficulty Calibration

### Research Data: Reaction Time per Sequence Length

Based on Hick's Law studies and typing reaction-time research (Salthouse 1984, Gentner 1983):

| Sequence Length | Avg RT (casual typist) | Multiplier vs Single | Effective Difficulty |
|----------------|------------------------|---------------------|---------------------|
| 1 letter | 250-350ms | 1.0x | Baseline |
| 2 letters | 400-550ms | ~1.7x | Moderate jump |
| 3 letters | 550-750ms | ~2.3x | Significant |

### Time Budget Calculation for Letter Runner

At level 5 (scrollSpeed=280px/s), danger zone spans ~200px:
- Transit time through zone: 200/280 = ~0.71s
- Single letter: 0.3s reaction = comfortable (0.4s margin)
- 2 letters: 0.5s needed = tight (0.2s margin)
- 3 letters: 0.7s needed = almost no margin at this speed

**Compensation mechanisms to keep combos fair:**
1. **Wider danger zone for combos**: Extend DANGER_ZONE_START from 0.3 to 0.2 for multi-letter obstacles (gives 30% more time)
2. **Speed reduction**: Combo obstacles move 15-20% slower than single-letter obstacles at the same level
3. **Score multiplier**: 2-letter = 2.5x points, 3-letter = 4x points (risk/reward)
4. **Spawn spacing**: Combos get 1.5x the minimum gap to adjacent obstacles

### Recommended Config Values
```javascript
export const COMBO = {
  // When combos become available
  MIN_LEVEL_2LETTER: 4,        // Introduce 2-letter at level 4
  MIN_LEVEL_3LETTER: 7,        // Introduce 3-letter at level 7

  // Spawn probability (when eligible)
  SPAWN_CHANCE_2LETTER: 0.25,  // 25% chance a spawn is 2-letter
  SPAWN_CHANCE_3LETTER: 0.15,  // 15% chance (at eligible levels)

  // Compensation
  SPEED_PENALTY: 0.80,         // Combos move at 80% of normal speed
  DANGER_ZONE_EXTEND: 0.15,    // Widen zone by 15% for combos
  GAP_MULTIPLIER: 1.5,         // 1.5x min gap after a combo spawns

  // Scoring
  SCORE_MULT_2LETTER: 2.5,
  SCORE_MULT_3LETTER: 4.0,

  // Reset penalty
  RESET_FLASH_DURATION: 0.2,   // Visual shake duration on reset
};
```

---

## 5. Spawn Rules

### When to Spawn Combos

**Level-gated with probability ramp:**

| Level | Single Letters | 2-Letter Combos | 3-Letter Combos |
|-------|---------------|-----------------|-----------------|
| 1-3 | 100% | 0% | 0% |
| 4-5 | 75% | 25% | 0% |
| 6 | 65% | 30% | 5% |
| 7+ | 55% | 30% | 15% |

### Spawn Logic Integration with `spawner.js`

```javascript
function pickObstacleType(level) {
  if (level >= COMBO.MIN_LEVEL_3LETTER && Math.random() < COMBO.SPAWN_CHANCE_3LETTER) {
    return 3;
  }
  if (level >= COMBO.MIN_LEVEL_2LETTER && Math.random() < COMBO.SPAWN_CHANCE_2LETTER) {
    return 2;
  }
  return 1;
}
```

### Guard Rules
1. **Max one combo on screen at a time** (early levels 4-6) -- avoids overwhelming new players
2. **Never spawn combo immediately after another combo** -- enforced via `lastSpawnWasCombo` flag
3. **Letter uniqueness**: All letters across ALL active obstacles must be unique (existing rule preserved). A 2-letter combo "AB" consumes both A and B from the available pool.
4. **No repeated letters within a combo** (e.g., no "AA" or "ABA")
5. **Adjacent keys preferred at introduction**: First combos use spatially close keys (e.g., "FG", "JK") for ergonomic ease

### Letter Selection for Combos
```javascript
function pickComboLetters(count, usedLetters) {
  const letters = [];
  for (let i = 0; i < count; i++) {
    let letter;
    for (let attempt = 0; attempt < 26; attempt++) {
      const candidate = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      if (!usedLetters.has(candidate) && !letters.includes(candidate)) {
        letter = candidate;
        break;
      }
    }
    if (!letter) return null; // Not enough letters available
    letters.push(letter);
    usedLetters.add(letter);
  }
  return letters;
}
```

---

## 6. Examples from Games

### Typing of the Dead (1999/2013)
- Words displayed in boxes above zombies
- Letter-by-letter: each correct key "shoots" one letter off the word
- Wrong keys don't damage directly but waste time (zombie advances)
- Proximity-based difficulty: closer enemies = shorter words
- Multiple targets visible simultaneously; player picks which to focus on

### ZType (ztype.org)
- Words stream from center outward like Space Invaders
- Each letter typed removes it from the word; word shrinks visually
- Wrong letters are simply ignored (no penalty besides time)
- Smooth transition: early waves are single letters, later waves are full words
- Multiple simultaneous targets; first typed letter "locks on" to matching word

### Epistory: Typing Chronicles
- Words appear above enemies approaching from all directions
- Color-coded by element type (fire/ice/wind)
- Increasing word length per enemy tier: 3-letter, 5-letter, 8-letter
- Separate typing difficulty setting independent of game speed
- Mana/reward scales with word length (incentivizes harder targets)

### Key Takeaway for Letter Runner
ZType's "lock-on" model is closest to our needs:
- First letter match selects which obstacle you're attacking
- Subsequent letters must match in order
- Visual feedback per letter typed
- Wrong keys don't punish until mid-sequence

However, since Letter Runner obstacles approach from the right in a single lane, we simplify: **always target the rightmost (frontmost) obstacle first** -- no lock-on ambiguity needed.

---

## 7. UX Patterns

### Typing Order: Strictly Left-to-Right (Sequential)

**Decision: Enforce left-to-right order.**

Rationale:
- Typing of the Dead, ZType, TypeRacer all enforce sequential order
- Allowing any-order would eliminate the "sequence planning" skill
- Left-to-right matches natural reading direction and established typing game conventions
- Simplifies implementation (single progress index)

### What Typing of the Dead Does
- Strictly sequential (must type in displayed order)
- Backspace to correct mistakes (we use reset instead -- faster for action context)
- No skipping letters
- Visual progress: typed letters cross out, remaining stay bright

### Visual Scanning Pattern
Research shows players in typing games read 1-2 characters ahead. For 2-3 letter combos:
- Show all letters simultaneously (no reveal-one-at-a-time)
- Highlight the NEXT letter prominently (yellow pulse)
- Dim completed letters but keep them visible (confirms progress, reduces confusion)

### Transition Introduction (Teaching Moment)
When the player first encounters a 2-letter combo:
- Brief "COMBO!" flash above the obstacle (using existing level-announce pattern)
- Slightly slower approach speed on the FIRST combo encountered
- After 3 successful combos, spawn at normal speed

---

## 8. Implementation Plan for Letter Runner

### Entity Changes (obstacle.js)

Extend the obstacle object factory:
```javascript
export function createObstacleFactory() {
  return function () {
    return {
      x: 0,
      y: 0,
      width: GAME.OBSTACLE_WIDTH,   // will be dynamically set for combos
      height: GAME.OBSTACLE_HEIGHT,
      letter: '',                    // kept for backward compat (single-letter)
      letters: [],                   // NEW: array of letters for combo
      progress: 0,                   // NEW: how many letters typed
      speed: 0,
      active: false,
      isCombo: false,                // NEW: flag for rendering path
    };
  };
}
```

### Pool Compatibility
The existing `createPool` works unchanged. Combo obstacles are the same objects with additional fields. The pool `acquire`/`release` cycle resets all fields in the spawner.

### Matcher Changes (matcher.js)
Replace current simple `obs.letter === key` check with:
```javascript
if (obs.isCombo) {
  const nextLetter = obs.letters[obs.progress];
  if (nextLetter === key) {
    obs.progress++;
    events.emit('COMBO_PROGRESS', { id: obs, progress: obs.progress, total: obs.letters.length });
    if (obs.progress >= obs.letters.length) {
      events.emit('OBSTACLE_DESTROYED', { letter: obs.letters.join(''), x: obs.x, y: obs.y, combo: true });
      obstaclePool.release(obs);
    }
    return;
  } else if (obs.progress > 0) {
    obs.progress = 0;
    events.emit('COMBO_RESET', { x: obs.x, y: obs.y });
    events.emit('WRONG_KEY', { key });
    return;
  }
} else {
  // Existing single-letter logic
  if (obs.letter === key) { ... }
}
```

### Spawner Changes (spawner.js)
After letter selection:
```javascript
const comboLength = pickObstacleType(currentLevel);
const obs = spawner.pool.acquire();
obs.x = screenWidth + 10;

if (comboLength > 1) {
  const letters = pickComboLetters(comboLength, usedLetters);
  if (!letters) { spawner.pool.release(obs); return; } // Not enough unique letters
  obs.letters = letters;
  obs.letter = letters[0]; // backward compat for danger-zone first-letter matching
  obs.progress = 0;
  obs.isCombo = true;
  obs.width = comboLength * GAME.OBSTACLE_WIDTH;
  obs.speed = difficultyParams.scrollSpeed * COMBO.SPEED_PENALTY;
} else {
  obs.letters = [letter];
  obs.letter = letter;
  obs.progress = 0;
  obs.isCombo = false;
  obs.width = GAME.OBSTACLE_WIDTH;
  obs.speed = difficultyParams.scrollSpeed;
}
```

### Renderer Changes (obstacle.js -> renderObstacles)
Branch on `obs.isCombo`:
```javascript
export function renderObstacles(ctx, obstacles) {
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    if (obs.isCombo) {
      renderComboObstacle(ctx, obs);
    } else {
      renderSingleObstacle(ctx, obs);
    }
  }
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}
```

### New Events
| Event | Payload | Purpose |
|-------|---------|---------|
| `COMBO_PROGRESS` | `{ obstacle, progress, total }` | Trigger per-letter SFX, VFX |
| `COMBO_RESET` | `{ x, y }` | Trigger shake VFX, error SFX |
| `COMBO_INTRODUCED` | `{ level }` | Trigger tutorial flash (first time only) |

### Config Addition (config.js)
```javascript
export const COMBO = {
  MIN_LEVEL_2LETTER: 4,
  MIN_LEVEL_3LETTER: 7,
  SPAWN_CHANCE_2LETTER: 0.25,
  SPAWN_CHANCE_3LETTER: 0.15,
  SPEED_PENALTY: 0.80,
  DANGER_ZONE_EXTEND: 0.15,
  GAP_MULTIPLIER: 1.5,
  SCORE_MULT_2LETTER: 2.5,
  SCORE_MULT_3LETTER: 4.0,
  RESET_FLASH_DURATION: 0.2,
  MAX_COMBOS_ON_SCREEN: 1,      // Only 1 combo visible at levels 4-6
  MAX_COMBOS_ON_SCREEN_HIGH: 2, // Allow 2 at level 7+
};
```

---

## 9. Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Combos too hard at introduction | 20% speed reduction + extended danger zone |
| Pool object size increase | Minimal (2 extra fields: `letters[]`, `progress`). No allocation change. |
| Visual clutter with wide obstacles | Cap at 3 letters max; single combo on screen at first |
| Breaks uniqueness rule (many letters consumed) | 3-letter combo + 1 single = 4 letters used (out of 26). No collision risk with MAX_OBSTACLES=4. |
| Input lock + combo = frustrating | Input lock (0.3s) only on WRONG_KEY; correct progress keys don't lock |
| Performance (wider obstacles, more draw calls) | Negligible -- just 2-3x fillRect per combo vs single. Under 30 active objects at all times. |

---

## 10. Testing Strategy

1. **Unit test matcher**: Verify combo progress increments correctly, resets on wrong key, emits correct events
2. **Integration test spawner**: Verify combos only spawn at correct levels, respect uniqueness
3. **Playtest calibration**: Record completion rates at each level; target 70-80% success rate for combos
4. **Edge cases**:
   - Two single-letter obstacles where one's letter matches a combo's first letter
   - Combo obstacle exits danger zone mid-sequence (should count as MISSED)
   - All 26 letters exhausted (impossible with max 4 obstacles * 3 letters = 12, but guard anyway)

---

## References

- Hick's Law: RT = a + b * log2(n) -- Hick (1952), Salthouse (1984)
- Typing reaction studies: Single keystroke ~250ms, bigram ~400-500ms (Gentner 1983)
- ZType (ztype.org) -- word-based shooting with lock-on mechanic
- Typing of the Dead (Sega, 1999) -- word sequences over zombies, sequential typing
- Epistory: Typing Chronicles -- progressive word length per enemy tier
- TypeRacer (typeracer.com) -- competitive sequential typing with error correction
- Nanotale -- mana rewards scale with word length (letters squared)
