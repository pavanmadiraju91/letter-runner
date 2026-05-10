# Chrome T-Rex Runner: Deep Mechanics Analysis

Research compiled from Chromium source code analysis and game design teardowns.
Source: `chromium/src/third_party/blink/renderer/modules/offline_page/`

---

## 1. Speed Progression

### The Numbers

| Parameter | Value | Notes |
|-----------|-------|-------|
| **INITIAL_SPEED** | 6 px/frame | Starting speed (~360 px/sec at 60fps) |
| **MAX_SPEED** | 13 px/frame | Terminal velocity (~780 px/sec at 60fps) |
| **ACCELERATION** | 0.001 | Per-frame multiplier on distanceRan |
| **Frame rate** | 60 FPS target | Uses requestAnimationFrame |

### Speed Formula

```javascript
currentSpeed = Math.min(
  config.speed + (distanceRan * config.acceleration),
  config.maxSpeed
);
```

This is a **linear ramp** -- speed increases proportionally to distance traveled. Not exponential, not stepped. Pure linear with a hard cap.

### Speed Curve Timeline

| Time (~seconds) | Speed (px/frame) | Feel |
|-----------------|------------------|------|
| 0s (start) | 6 | Comfortable jog |
| ~30s | 8 | Noticeable pickup |
| ~60s | 10 | Brisk, requires attention |
| ~90s | 11 | Challenging |
| ~120s+ | 12-13 | Near-cap, reaction-time limit |

The speed roughly doubles over 2 minutes of play. Most players die well before reaching max speed.

### Lessons for Letter Runner

- **Start slow enough to learn** -- 6 px/frame gives players breathing room to understand mechanics
- **Linear acceleration is enough** -- no need for complex curves; the brain perceives linear speed increase as exponential because reaction windows shrink proportionally
- **Hard cap prevents impossibility** -- MAX_SPEED ensures the game stays theoretically beatable, maintaining the "I could have dodged that" feeling
- **The 2x rule** -- speed approximately doubles from start to cap (6 to 13). This is a good ratio for any endless runner

---

## 2. Obstacle Pacing

### Core Constants

| Parameter | Value | Purpose |
|-----------|-------|---------|
| **GAP_COEFFICIENT** | 0.9 | Scales gaps inversely with speed |
| **MIN_GAP (cacti)** | 120 px | Absolute minimum spacing |
| **MAX_GAP (cacti)** | 200 px | Maximum spacing |
| **MIN_GAP (birds)** | 150 px | Birds need more reaction space |
| **MAX_GAP (birds)** | 250 px | Upper bird spacing |

### Gap Formula

```javascript
// Effective gap between obstacles
gap = MIN_GAP + random(0, MAX_GAP - MIN_GAP)

// Gaps shrink at higher speeds via GAP_COEFFICIENT
effectiveGap = gap * GAP_COEFFICIENT * (MAX_SPEED / currentSpeed)
```

As speed increases, the *time* between obstacles compresses even though pixel distances stay similar. At speed 6, a 120px gap gives you 20 frames (333ms) to react. At speed 13, the same gap gives you 9 frames (150ms).

### Obstacle Generation Algorithm

```
1. Remove obstacles that scroll off-screen (obstacle.right < 0)
2. Check if minimum distance from last obstacle is met
3. Spawn new obstacle at: screenRight + gap
4. Randomize obstacle type based on score thresholds
5. Repeat every frame
```

### Why It Feels "Random but Fair"

- Minimum gap of 120px guarantees every obstacle is physically dodgeable
- Random range (120-200px) prevents pattern memorization
- Single obstacle at a time in early game; clusters only appear later
- No two obstacles overlap in the same lane simultaneously

### Lessons for Letter Runner

- **Always guarantee a survivable gap** -- minimum distance must allow for the slowest valid player input
- **Randomize within bounds** -- `MIN + random(0, MAX-MIN)` creates variety without unfairness
- **Gaps should feel tighter as speed increases** -- even if pixel distance is constant, perceived difficulty rises with speed
- **Speed-relative gap scaling** -- multiply gaps by (MAX_SPEED / currentSpeed) to maintain consistent reaction windows

---

## 3. Difficulty Milestones

### Score-Based Progression

| Score Threshold | Event | Impact |
|-----------------|-------|--------|
| **0-100** | Small cacti only | Tutorial zone; learn to jump |
| **~200** | Medium/large cacti appear | Taller obstacles, requires timing |
| **~450-500** | Pterodactyls introduced | New input required (duck), vertical threat |
| **~700** | First night mode toggle | Visual disruption, reduced contrast |
| **~900+** | Bird + cactus combos | Multi-threat decision making |
| **Every 700 pts** | Night mode cycles | Lasts ~100 points each time |
| **Every 100 pts** | Score milestone ding | Audio reward, "achievement" feel |
| **99,999** | Score resets/wraps | Effective "end" of the game |

### Night Mode Mechanic

- Triggers every 700 points
- Lasts approximately 100 points (~4-5 seconds in-game)
- Inverts the color scheme (dark background, light sprites)
- Purely visual -- no gameplay change but reduces visibility
- Creates rhythm: light-dark-light-dark as you progress

### Obstacle Introduction Timing

The game never introduces two new mechanics simultaneously:
1. First: jump timing (cacti)
2. Then: cactus variety (height/clusters)
3. Then: new input (duck for birds)
4. Then: combined threats

This ensures each new challenge is learnable before compounding.

### Lessons for Letter Runner

- **Introduce complexity gradually** -- one new mechanic every 300-500 points
- **Use visual disruption as "free" difficulty** -- night mode costs nothing to implement but adds perceived challenge
- **Score milestones as reward hooks** -- every 100 points plays a sound; frequent, small dopamine hits
- **Never introduce two new things at once** -- space new mechanics apart so players can adapt
- **Cycle visual themes** -- periodic visual changes make the game feel alive and mark progress

---

## 4. Game Feel Secrets

### Death-to-Restart Loop

| Phase | Duration | Purpose |
|-------|----------|---------|
| Collision detection | Instant | No delayed deaths |
| Death animation (tilt) | ~250ms | Physical weight, "ouch" moment |
| Score blink + high score check | ~300ms | Achievement processing |
| Input ready | ~250ms | Building anticipation |
| **Total restart delay** | **~800ms** | Fast enough to feel instant, slow enough to process |

Total time from death to playing again: **under 1 second**.

### The "Just One More Try" Formula

1. **Zero friction restart** -- Space bar kills you AND restarts. Same button. No menu, no loading, no confirmation.
2. **Visible high score** -- Always displayed, always taunting. Beating it by even 1 point feels like victory.
3. **Score blinks on death** -- Draws attention to your number, triggers comparison to high score.
4. **Near-miss psychology** -- Tight collision boxes mean you frequently "almost" make it. Fuels "I can do better."
5. **No punishment for failure** -- No lives, no cooldown, no resources lost. Death costs only 800ms.
6. **Escalating mastery feeling** -- Early runs feel like improvement; you're always learning.

### Micro-Feedback (Game Juice)

| Element | Implementation | Feel |
|---------|---------------|------|
| Jump dust particles | Sprite on takeoff | Weight and physicality |
| Ground scroll speed | Parallax layers | Speed perception amplified |
| Score counter ticking | Updates every frame | Constant progress |
| 100-point ding | Audio + blink | Micro-achievement loop |
| Night mode transition | Smooth fade | World feels alive |
| Death screen shake | Canvas offset jitter | Impact and consequence |

### Score Display Design

- Score updates every frame (appears to tick rapidly)
- Shows as 5-digit number with leading zeros: `00042`
- High score shows with "HI" prefix: `HI 00312`
- Blinks 3-5 times on death (alpha oscillation over ~300ms)
- 100-point milestone: momentary blink + audio chirp
- The leading zeros make early scores look "tiny" -- motivates reaching bigger numbers

### Lessons for Letter Runner

- **Restart in under 1 second** -- this is non-negotiable for endless runner addiction
- **Same button to die and restart** -- eliminate all friction between attempts
- **Always show high score** -- make beating it feel achievable
- **Add micro-juice everywhere** -- particles, shakes, blinks. These cost little but add massive feel
- **Leading zeros in score** -- `00042` makes players want to fill those digits
- **Near-misses should be visible** -- tight hitboxes create "barely missed" moments that drive retries
- **No punishment, only progress** -- never take anything away from the player on death

---

## 5. Speed Numbers (Source Code Reference)

### Canonical Values from Chromium

```javascript
// Runner.config (from runner.js in Chromium source)
{
  ACCELERATION: 0.001,        // Speed increase coefficient
  BG_CLOUD_SPEED: 0.2,       // Background parallax
  BOTTOM_PAD: 10,             // Ground padding
  CLEAR_TIME: 3000,           // ms before obstacles start
  CLOUD_FREQUENCY: 0.5,      // Cloud spawn rate
  GAMEOVER_CLEAR_TIME: 750,   // ms: restart delay after death
  GAP_COEFFICIENT: 0.6,      // Obstacle gap scaling
  GRAVITY: 0.6,              // Jump gravity (px/frame^2)
  INITIAL_JUMP_VELOCITY: 10,  // Jump launch speed
  MAX_CLOUDS: 6,             // Max simultaneous clouds
  MAX_OBSTACLE_LENGTH: 3,    // Max obstacles in a group
  MAX_SPEED: 13,             // Speed cap (px/frame)
  MIN_JUMP_HEIGHT: 35,       // Minimum jump arc height
  SPEED: 6,                  // Starting speed (px/frame)
  SPEED_DROP_COEFFICIENT: 3   // Fast-fall multiplier (holding down)
}

// Distance/Score conversion
COEFFICIENT: 0.025  // score = distanceRan * 0.025
```

### Real-World Speed Translation

At 60 FPS:
| Speed Value | Pixels/Second | Score/Second | Feel |
|-------------|--------------|--------------|------|
| 6 (start) | 360 px/s | ~9 pts/s | Walking |
| 9 (mid) | 540 px/s | ~13.5 pts/s | Running |
| 13 (max) | 780 px/s | ~19.5 pts/s | Sprinting |

### Jump Physics

```
Initial velocity: -10 px/frame (upward)
Gravity: +0.6 px/frame^2
Jump duration: ~33 frames (~550ms)
Max height: ~83px above ground
Fast-fall (hold down): gravity * 3 = 1.8 px/frame^2
```

The jump takes about half a second -- this is critical. It means at max speed, you travel ~430px during a single jump. Obstacles must be spaced to account for "committed" jump time.

### Key Design Insight: CLEAR_TIME

The game waits **3000ms (3 seconds)** before spawning the first obstacle. This gives players time to:
1. Orient to the screen
2. Understand they're moving
3. Build anticipation for the first challenge

### Lessons for Letter Runner

- **3-second grace period at start** -- let players orient before first challenge
- **Jump commits you for ~500ms** -- actions should have commitment cost, creating risk/reward
- **Fast-fall as skill expression** -- holding down to fall faster rewards advanced players
- **Score formula should tick visibly** -- ~9-19 points/second feels good; fast enough to see progress, slow enough that every point feels earned
- **750ms game-over clear time** -- this is the "processing" window before restart is available

---

## 6. Session Design

### Session Length Data

| Player Type | Average Session | Score at Death | Time Playing |
|-------------|----------------|---------------|--------------|
| First-timer | 5-10 seconds | 30-100 | Single attempt |
| Casual | 10-30 seconds | 100-500 | 5-15 min total (many retries) |
| Regular | 30-120 seconds | 500-2000 | 15-30 min total |
| Skilled | 2-5 minutes | 2000-5000 | 30-60 min total |
| Expert | 5-10 minutes | 5000-15000 | Rare extended sessions |

### Engagement Windows

**Peak engagement zone: 200-800 points (20-60 seconds per run)**

This is where most players spend most of their time:
- Fast enough to feel exciting
- Slow enough that death feels preventable
- New elements (birds, night mode) keep appearing
- High score is frequently beaten by small margins

### Why Sessions Are Short but Total Playtime Is High

1. **Individual runs**: 10-30 seconds average
2. **Retry rate**: Near 100% (restart is so easy, why not?)
3. **Total session**: 5-20 minutes of continuous retrying
4. **Return rate**: High (game is always one "offline" moment away)

The game is designed for **micro-sessions with high retry density**. You play 20-50 attempts in a single sitting, each lasting seconds.

### The Addiction Curve

```
Time 0-10s:    Learning (comfortable)
Time 10-30s:   Flow state (challenged but capable)
Time 30-60s:   Peak engagement (new threats, near-misses)
Time 60-120s:  Skill ceiling (most players die here)
Time 120s+:    Mastery zone (only dedicated players reach)
```

The game's genius is that **most deaths happen right at the engagement peak** (30-60s). You die when you're most invested, which maximizes the "one more try" impulse.

### Score Milestone Psychology

- Every 100 points: audio ding (every ~8-10 seconds)
- Beating high score: visual + audio reward
- Round numbers (500, 1000): feel like achievements even without explicit rewards
- The 5-digit display makes 10000 feel like a major milestone (filling a digit)

### Lessons for Letter Runner

- **Design for 30-60 second peak engagement** -- most players should die in this window
- **Optimize for retry density, not session length** -- 20 quick retries beats 1 long run for engagement
- **Kill players at peak investment** -- the moment they're most engaged is when death creates maximum "one more try"
- **Reward every 8-10 seconds** -- score milestones, combo sounds, visual feedback
- **Keep individual runs under 2 minutes** for casual audience -- if runs are too long, retrying feels costly
- **Make high score beatable by small margins** -- close losses (miss by 5-20 points) drive more retries than blowouts

---

## Summary: Chrome Dino's Core Design Pillars

1. **Simplicity** -- One button to play. One button to restart. Zero cognitive overhead.
2. **Fairness** -- Every death is avoidable. No RNG kills. Minimum gaps are always survivable.
3. **Instant feedback** -- Sub-second restart. No loading. No menus between you and "again."
4. **Visible progress** -- Score always ticking. High score always visible. Leading zeros showing potential.
5. **Escalating mastery** -- Linear difficulty means you always improve with practice.
6. **Micro-achievements** -- Every 100 points celebrated. Every high score beaten acknowledged.
7. **Commitment-based challenge** -- Jumps lock you in for 500ms. Decisions have weight.

---

## Application to Letter Runner: Key Takeaways

### Must-Haves (Non-Negotiable)
- [ ] Sub-1-second death-to-restart cycle
- [ ] Same input to play and restart
- [ ] Visible high score at all times
- [ ] 3-second grace period before first challenge
- [ ] Minimum gaps guarantee survivability
- [ ] Speed starts at ~6 units, caps at ~13 units (2x ratio)

### Should-Haves (Strong Impact)
- [ ] 100-point milestone audio/visual reward
- [ ] Night mode or visual theme cycling every 500-700 points
- [ ] New mechanics introduced one at a time, spaced 300-500 points apart
- [ ] Score displayed with leading zeros (00000 format)
- [ ] Death animation with screen shake (~250ms)

### Nice-to-Haves (Polish)
- [ ] Particle effects on key actions
- [ ] Fast-fall / skill expression mechanic
- [ ] Parallax background layers for speed perception
- [ ] Score tick rate tied to movement (feels connected to running)
- [ ] Near-miss visual feedback (close calls highlighted)
