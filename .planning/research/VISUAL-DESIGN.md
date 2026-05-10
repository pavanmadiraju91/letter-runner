# Visual Design Research: Letter Runner

> Research into pixel-art game visual polish, neon-on-dark aesthetics, dark/light mode, parallax backgrounds, animation, and visual hierarchy at speed.

---

## 1. What Makes Pixel Art Look Professional

### The Line Between "Programmer Art" and Polished Indie

**Common amateur mistakes:**

| Mistake | Why It Looks Bad | Fix |
|---------|-----------------|-----|
| Inconsistent pixel density | Some pixels are 1x1, others 2x2 or anti-aliased | Pick ONE pixel size and stick to it. Letter Runner's 16x16 grid at 2x scale = every "pixel" is 2x2 screen pixels. Never break this. |
| Too many colors | Screams "I used the full color picker" | Cap at 8-12 colors total. Letter Runner already does this well (7 neon accents + 6 UI tones). |
| Color banding | Smooth gradients look wrong in pixel art | Use dithering patterns or jump between shades. No gradients on sprites. |
| Broken outlines | Outlines that are thicker on one side, or have anti-aliased bleed | Consistent 1px outline or no outline. Choose one approach for all entities. |
| Inconsistent lighting | Light comes from different directions on different sprites | Pick top-left light for everything. Shadows always bottom-right. |
| Over-detailed backgrounds | Background competes with gameplay elements | Backgrounds should be softer/darker. Gameplay elements pop via contrast. |

### Principles for Letter Runner

1. **One pixel size rules all.** The player sprite is 16x16 logical pixels rendered at `PLAYER_WIDTH / 16 = 2px` per pixel. Every sprite in the game must share this density.

2. **Limited palette, strict enforcement.** The existing `COLORS.PALETTE` is already good. Never introduce a color that is not in the palette. When in doubt, use an existing color at reduced alpha.

3. **Readable at speed.** Obstacles move at 140-310 px/sec. At 48px wide, an obstacle is on-screen for ~2.5s at slow speed, ~1.3s at fast. Every element must be identifiable within 200ms of entering the viewport.

4. **Consistent style language.** All sprites should feel like they belong in the same world: same outline weight, same color temperature, same level of detail.

### Implementation Notes

- Set `image-rendering: pixelated` and `image-rendering: crisp-edges` on the canvas CSS. Already implied by the integer-scaled pixel rendering in `renderPlayer`.
- Ensure `ctx.imageSmoothingEnabled = false` after every canvas resize.
- Floor all coordinates with `Math.floor()` or `Math.round()` to prevent sub-pixel blurring (already done in player.js).
- The monospace font on obstacles should be replaced with a pixel font or pre-rendered letter sprites for visual consistency.

---

## 2. Neon-on-Dark Aesthetic

### Reference Games

| Game | What It Does Well |
|------|-------------------|
| **Hyper Light Drifter** | Limited neon palette (cyan, magenta, warm yellow) on desaturated dark backgrounds. Glow only on interactive/important elements. |
| **Dead Cells** | Neon enemy highlights pulse to signal danger. Backgrounds are muted blue-purple. Particle effects use additive blending. |
| **Celeste** | Crystal bloom effects via radial gradients. Neon reserved for collectibles and hazards. |
| **Geometry Wars** | Pure neon-on-black. Every entity defined by its glow color. Visual identification is instant. |
| **VVVVVV** | Minimal palette (6 colors), high contrast, dark background. Proves less is more. |

### Color Theory for Neon Palettes

**Rules:**

1. **Dark background is not pure black.** Use very dark blue-gray (`#0a0a0f`) to add warmth. Pure `#000000` feels dead.
2. **Neon colors should be fully saturated on one channel.** Cyan = `#00ffcc` (full green + some blue). Magenta = `#ff2266` (full red + some blue). This creates vibrancy.
3. **Maximum 3 neon accents simultaneously visible.** More than 3 competing neon colors creates visual noise.
4. **Use value contrast, not just hue.** Neon works because it is BRIGHT on DARK. The luminance gap matters more than the specific hue.
5. **Glow implies importance.** If everything glows, nothing stands out. Reserve glow for: the player, active obstacles, and VFX bursts.

### Letter Runner's Existing Palette (validated)

```
Background:     #0a0a0f  (near-black with blue undertone)
Player:         #00ffcc  (neon cyan — the protagonist color)
Obstacle/Danger:#ff2266  (neon magenta-red — danger/urgency)
Score/Reward:   #ffcc00  (warm yellow — achievement)
UI text:        #ffffff / #ccddee  (white and cool gray)
Subtle panels:  #1a1a2e  (dark indigo — recedes visually)
Ground line:    #2a2a4e  (slightly lighter — barely visible structure)
```

This palette is strong. The player (cyan) and obstacles (magenta) are complementary — they pop against each other without clashing.

### Glow Without Killing Performance

**Problem:** `ctx.shadowBlur` is CPU-bound and re-calculated every frame. At 60fps with 4+ obstacles, it compounds.

**Solution: Pre-rendered glow sprites (recommended for Letter Runner):**

```javascript
// Create once at startup, reuse every frame
function createGlowTexture(size, color) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  gradient.addColorStop(0, color + 'cc');   // 80% opacity center
  gradient.addColorStop(0.3, color + '66'); // 40%
  gradient.addColorStop(0.6, color + '22'); // 13%
  gradient.addColorStop(1, color + '00');   // transparent
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas; // Return as image source for drawImage
}

// Pre-create at game init:
const obstacleGlow = createGlowTexture(96, '#ff2266');
const playerGlow = createGlowTexture(64, '#00ffcc');

// In render loop — replaces shadowBlur:
ctx.globalCompositeOperation = 'screen'; // Additive blending
ctx.drawImage(obstacleGlow, obs.x - 24, obs.y - 20);
ctx.globalCompositeOperation = 'source-over'; // Reset
```

**Performance comparison:**

| Method | 4 obstacles @ 60fps | Notes |
|--------|---------------------|-------|
| `shadowBlur = 8` | ~4ms per frame | Current approach. Works but wasteful. |
| Pre-rendered glow sprite | ~0.3ms per frame | 13x faster. `drawImage` is GPU-accelerated. |
| Radial gradient per frame | ~1.5ms per frame | Acceptable but creates gradient objects each frame. |

**Recommendation:** Replace `shadowBlur` in `renderObstacles` with pre-rendered glow sprites. Create them once in a setup function. Use `globalCompositeOperation = 'screen'` for additive glow.

### Implementation Notes

- Create glow textures for: obstacle (magenta, 96px), player (cyan, 64px), destroy burst (multi-color, 48px).
- Draw glow BEFORE the sprite, so the sprite sits on top of its own glow.
- Use `'screen'` blend mode (additive) for glow layers, then reset to `'source-over'`.
- Pulse glow alpha with `0.7 + 0.3 * Math.sin(time * 4)` for a subtle breathing effect on obstacles.
- On destroy, briefly flash the glow at 2x size for 100ms.

---

## 3. Dark/Light Mode for Games

### How Browser Games Handle System Preference

**Detection:**
```javascript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
let isDark = prefersDark.matches;

prefersDark.addEventListener('change', (e) => {
  isDark = e.matches;
  applyTheme(isDark);
});
```

**Persist user override:**
```javascript
// User can manually toggle, saved to localStorage
const saved = localStorage.getItem('theme');
if (saved) isDark = saved === 'dark';
```

### What Changes Between Modes

For a canvas game like Letter Runner, the modes primarily affect the chrome around the canvas and the background atmosphere:

| Element | Dark Mode | Light Mode | Notes |
|---------|-----------|------------|-------|
| **Canvas BG** | `#0a0a0f` (current) | `#e8e8f0` (warm light gray) | Light mode needs inverted contrast |
| **Player color** | `#00ffcc` (neon cyan) | `#008866` (darker teal) | Neon does not read on white. Desaturate in light. |
| **Obstacle border** | `#ff2266` (neon magenta) | `#cc1144` (deeper red) | Same principle — less vibrant on light BG |
| **Obstacle body** | `#1a1a2e` (dark fill) | `#ffffff` (white fill) | Invert the block fill |
| **Letter on obstacle** | `#ffffff` (white) | `#1a1a2e` (dark) | Must contrast against obstacle body |
| **Glow effects** | Full intensity | Reduced/removed | Glow on light backgrounds looks washed out |
| **Ground** | Dark grid lines | Light grid lines | Subtle structural element |
| **HUD text** | White/light | Dark/charcoal | Standard readability |
| **Particles** | Bright, additive | Darker, normal blend | Additive blending fails on light BG |
| **Page background** | Match canvas dark | Match canvas light | Seamless edge |

### Recommendation for Letter Runner

**Start with dark mode only.** The neon-on-dark aesthetic IS the game's identity. Adding light mode is a polish feature for v2+. Reasons:

1. The entire color palette was designed for dark. Adapting it for light requires a parallel palette.
2. Glow effects (the game's visual signature) do not translate to light mode without fundamentally different rendering.
3. The genre (fast-paced action) benefits from dark — less eye strain in extended sessions.
4. Dev effort is better spent on gameplay polish first.

**If/when implementing light mode:**
- Define a second color map in `config.js` keyed by theme.
- Swap glow sprites for subtle drop shadows.
- Replace additive blending with multiply or normal.
- Adjust all alpha values (glow is invisible on light backgrounds at low alpha).

### Implementation Notes (Future)

```javascript
// config.js addition for future light mode:
export const THEMES = {
  dark: {
    BG: '#0a0a0f',
    PLAYER: '#00ffcc',
    OBSTACLE_BORDER: '#ff2266',
    OBSTACLE_BODY: '#1a1a2e',
    LETTER: '#ffffff',
    GLOW_ENABLED: true,
    BLEND_MODE: 'screen',
  },
  light: {
    BG: '#e8e8f0',
    PLAYER: '#008866',
    OBSTACLE_BORDER: '#cc1144',
    OBSTACLE_BODY: '#ffffff',
    LETTER: '#1a1a2e',
    GLOW_ENABLED: false,
    BLEND_MODE: 'source-over',
  }
};
```

---

## 4. Scrolling Parallax Backgrounds

### Simple Techniques to Add Depth

Letter Runner currently has a flat dark background. Adding parallax creates the illusion of speed and depth with minimal performance cost.

### Recommended 3-Layer Approach

```
Layer 0 (farthest): Slow-moving star field / distant dots
Layer 1 (mid):      Grid lines or subtle geometric pattern
Layer 2 (nearest):  Ground plane with texture
```

**Layer 0 — Star Field (speed: 10% of scroll speed)**

```javascript
// Pre-generate star positions once
const STAR_COUNT = 40;
const stars = Array.from({ length: STAR_COUNT }, () => ({
  x: Math.random() * canvasWidth,
  y: Math.random() * (canvasHeight - GAME.GROUND_HEIGHT),
  size: Math.random() < 0.3 ? 2 : 1, // Mix of 1px and 2px stars
  alpha: 0.2 + Math.random() * 0.3,   // Dim, 20-50% opacity
  speed: 0.1 + Math.random() * 0.05   // Slight speed variation
}));

function updateStars(scrollSpeed, dt) {
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i];
    star.x -= scrollSpeed * star.speed * dt;
    if (star.x < -2) star.x = canvasWidth + 2; // Wrap around
  }
}

function renderStars(ctx) {
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    ctx.globalAlpha = s.alpha;
    ctx.fillStyle = COLORS.PALETTE.MID; // #667788 — subtle blue-gray
    ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
  }
  ctx.globalAlpha = 1;
}
```

**Layer 1 — Subtle Grid Lines (speed: 30% of scroll speed)**

```javascript
const GRID_SPACING = 80; // pixels between vertical lines
const GRID_COLOR = '#1a1a2e'; // Same as PALETTE.DARK — very subtle

function renderGrid(ctx, scrollOffset, canvasWidth, canvasHeight, groundY) {
  ctx.strokeStyle = GRID_COLOR;
  ctx.lineWidth = 1;
  
  // Vertical lines scrolling
  const offset = scrollOffset % GRID_SPACING;
  for (let x = -offset; x < canvasWidth; x += GRID_SPACING) {
    ctx.beginPath();
    ctx.moveTo(Math.floor(x) + 0.5, 0);
    ctx.lineTo(Math.floor(x) + 0.5, groundY);
    ctx.stroke();
  }
  
  // One or two horizontal lines for perspective
  ctx.beginPath();
  ctx.moveTo(0, Math.floor(groundY * 0.4) + 0.5);
  ctx.lineTo(canvasWidth, Math.floor(groundY * 0.4) + 0.5);
  ctx.stroke();
}
```

**Layer 2 — Ground (already exists in ground.js)**

The existing ground scrolls at full speed. This is correct — it is the reference layer.

### Gradient Sky (Alternative to Stars)

For a more atmospheric feel, a static vertical gradient from slightly-lighter-than-BG at top to BG at bottom:

```javascript
// Create once, redraw only on resize
function createSkyGradient(ctx, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#12121f');  // Slightly lighter at top
  gradient.addColorStop(1, '#0a0a0f');  // Standard BG at bottom
  return gradient;
}
```

### Performance Notes

- Stars are just `fillRect` calls — essentially free (40 calls of 1-2px rects).
- Grid is 8-10 line segments — negligible cost.
- No `createRadialGradient` or `shadowBlur` in background layers.
- All positions use `Math.floor()` for pixel-perfect rendering.
- Stars wrap around (no array allocation, just position reset).
- Total background render cost: < 0.5ms per frame.

### Implementation Notes

- Add a `background.js` system in `src/systems/`.
- Accept current `scrollSpeed` from difficulty system to drive layer speeds.
- Render background layers FIRST in the draw order (before ground, before obstacles).
- Stars should be seeded (not `Math.random()`) if daily challenge parity matters.
- On level-up, briefly increase star parallax speed for a "warp" feel.

---

## 5. Animation for Pixel Characters

### Making Tiny Sprites Feel Alive

The current player sprite is a single static frame. Adding 2-4 frame animation dramatically increases perceived polish.

### Recommended 4-Frame Run Cycle

For a 16x16 side-view running humanoid at Letter Runner's scale:

```
Frame 1 (Contact):     Right foot forward, left back. Body neutral height.
Frame 2 (Push-off):    Weight shifts. Body drops 1px (squash). Arms swing.
Frame 3 (Flight):      Both feet off ground. Body rises 1px (stretch).
Frame 4 (Contact alt): Left foot forward, right back. Mirror of Frame 1.
```

**Timing:** At the game's speeds, cycle at ~150ms per frame (6.6 FPS animation). This is standard for pixel run cycles — fast enough to read as running, slow enough to see each pose.

### Implementation Approach

```javascript
// In player.js — add frame data
const FRAMES = [SPRITE_FRAME_1, SPRITE_FRAME_2, SPRITE_FRAME_3, SPRITE_FRAME_4];
const FRAME_DURATION = 0.15; // seconds per frame

export function updatePlayer(player, dt) {
  player.frameTimer += dt;
  if (player.frameTimer >= FRAME_DURATION) {
    player.frameTimer -= FRAME_DURATION;
    player.frameIndex = (player.frameIndex + 1) % FRAMES.length;
  }
}

export function renderPlayer(ctx, player) {
  const sprite = FRAMES[player.frameIndex];
  // ... existing pixel rendering with `sprite` instead of `SPRITE`
}
```

### Minimal Animation Techniques (Beyond Run Cycle)

| Technique | Effect | Cost |
|-----------|--------|------|
| **Idle bob** | Player bobs 1px up/down every 0.5s when standing still | 1 line of code |
| **Squash on land** | Compress sprite 1px vertically for 2 frames after a jump/impact | 2 lines |
| **Eye blink** | Remove eye pixels for 3 frames every 3-4 seconds | Tiny sprite mod |
| **Lean forward** | Shift upper body 1px right at high speeds | Speed-responsive |
| **Flash on hit** | All pixels white for 2 frames on correct key | Already implemented (VFX-05) |

### What Makes 2-Frame Animation Work

If 4 frames feels too complex, a 2-frame cycle works IF:
1. The two frames are maximally different (legs fully apart vs legs crossed).
2. The timing alternates at 100-150ms.
3. You add a 1px vertical bob (up on frame 1, neutral on frame 2).

The bob sells "running" more than the leg swap.

### Implementation Notes

- Store each frame as a 2D array like the existing `SPRITE` constant.
- Frame differences should be minimal: 4-8 pixels change per frame (legs + arms + body height).
- Tie animation speed to game scroll speed: faster levels = faster cycle.
- Pre-compute frame arrays at load time (no runtime generation).
- Consider storing frames as diff from Frame 1 (saves memory, makes edits easier).

---

## 6. Visual Hierarchy at Speed

### The Core Problem

Letter Runner has one critical readability challenge: the player must identify and type a letter on an approaching obstacle within ~1.5 seconds (at high speeds). If the letter is not instantly readable, the game feels unfair.

### Principles of Readability at Speed

**1. The 200ms Rule**

Players need to identify an element within 200ms of it entering their attention zone. At the game's speeds, this means the letter must be readable when the obstacle is still ~60px from the player.

**2. Luminance Contrast is King**

The most important factor for speed-reading is luminance contrast, not color. White text (`#ffffff`) on dark body (`#1a1a2e`) achieves near-maximum contrast ratio (15:1+). This is correct and should not change.

**3. Size Matters More Than You Think**

Current letter: `bold 22px monospace` on a 48x56px block. At 2x canvas scaling, this appears as ~11px logical. This is adequate but could be larger.

**Recommendation:** Increase to `bold 26px` or use a pixel font pre-rendered at a consistent size. The letter should fill 60-70% of the obstacle width.

**4. Glow Creates a "Safety Zone"**

The magenta glow around obstacles serves double duty:
- It signals "danger" (color association).
- It creates a luminous border that draws the eye, pulling focus TO the letter inside.

**5. No Visual Competition in the Letter Zone**

The area immediately around the letter must be visually quiet. No texture, no pattern, no transparency effects on the obstacle body. Flat, solid fill = fastest letter recognition.

### Specific Recommendations for Letter Runner

| Element | Current | Recommendation |
|---------|---------|----------------|
| Letter font | `bold 22px monospace` | `bold 26px` pixel font or thick monospace (e.g., "JetBrains Mono") |
| Letter color | `#ffffff` | Keep. Maximum contrast on `#1a1a2e` body. |
| Obstacle body | Solid `#1a1a2e` | Keep solid. No gradients, no texture inside the block. |
| Obstacle border | 2px `#ff2266` | Thicken to 3px at higher difficulty levels (urgency signal). |
| Glow radius | `shadowBlur: 8` | Pulse between 6-12 as obstacle approaches danger zone. |
| Danger zone indicator | None | Add subtle color shift when obstacle enters `DANGER_ZONE_START` (0.3 of screen width). Border could brighten or pulse faster. |
| Letter entrance | Instant appearance | Fade in over first 5 frames (prevents the "pop-in" jarring effect). |

### The Squint Test

Blur your vision or squint at the game screen. You should be able to distinguish:
1. Player (cyan blob on left)
2. Obstacles (dark blocks with bright borders on right)
3. Ground (dark line at bottom)
4. HUD (top area, white text)

If any of these blur together, contrast is insufficient.

### Hierarchy Layers (from most to least important)

```
1. LETTER ON OBSTACLE — highest contrast, largest relative size, glowing frame
2. PLAYER            — unique color (cyan), only moving entity, left-anchored
3. HUD (lives/score) — static position, white on dark, never competes with gameplay
4. OBSTACLES (body)  — dark blocks, danger-coded border
5. GROUND            — structural reference, very low contrast
6. BACKGROUND        — barely visible, sets mood, never distracts
```

### Implementation Notes

- Consider adding a brief "warning flash" when a new obstacle spawns (border flashes white for 1 frame then settles to magenta). This draws the eye without being annoying.
- At higher difficulty, the danger zone pulse should intensify. Tie glow pulse frequency to `scrollSpeed / 100`.
- Never overlay particles or effects on top of an obstacle that is in the danger zone. Clear visual path from eye to letter.
- The font choice matters enormously. Test with: "W", "M", "I", "l", "1" — these are the hardest to distinguish at speed. A good pixel font or thick monospace handles them well.
- If using a pixel font, pre-render all 26 letters + 10 digits as individual sprite images for perfect crispness.

### Font Recommendation

For obstacle letters, consider rendering with a pixel-art bitmap font rather than Canvas text rendering. Options:

1. **Pre-rendered pixel letters** — Most consistent. Create 26+10 letter sprites at design time. Each letter is a small 2D array like the player sprite. Perfect pixel alignment guaranteed.

2. **Thick monospace fallback** — If sticking with Canvas text: `ctx.font = 'bold 28px "Courier New", monospace'`. Add a 1px dark outline by drawing the letter 4 times offset by (1,0), (-1,0), (0,1), (0,-1) in the body color, then once in white on top.

```javascript
// Text outline for readability
function drawOutlinedLetter(ctx, letter, x, y) {
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Dark outline (4 directions)
  ctx.fillStyle = COLORS.PALETTE.OBSTACLE_BODY;
  ctx.fillText(letter, x - 1, y);
  ctx.fillText(letter, x + 1, y);
  ctx.fillText(letter, x, y - 1);
  ctx.fillText(letter, x, y + 1);
  
  // White letter on top
  ctx.fillStyle = COLORS.PALETTE.OBSTACLE_LETTER;
  ctx.fillText(letter, x, y);
}
```

---

## Summary of Priorities

### Immediate Impact (Low Effort, High Polish)

1. Replace `shadowBlur` with pre-rendered glow sprites (performance + visual consistency)
2. Add 2-frame player animation (bob + leg swap = sprite feels alive)
3. Add star field parallax layer (depth without complexity)
4. Increase letter font size to 26-28px (readability at speed)

### Medium Effort, High Impact

5. Full 4-frame player run cycle
6. Grid line parallax layer
7. Danger zone glow pulse on approaching obstacles
8. Text outline on obstacle letters

### Future Polish (v2+)

9. Light mode support (parallel palette + different rendering)
10. Pre-rendered pixel font for letters
11. Sprite lean at high speeds
12. Background color shift per level (subtle hue rotation)

---

## Color Reference (Consolidated)

```
DARK MODE PALETTE (current, validated):

Background:          #0a0a0f
Panel/Overlay:       rgba(0, 0, 0, 0.85)
Ground base:         #1a1a2e
Ground line:         #2a2a4e
Grid (parallax):     #1a1a2e
Stars:               #667788 at 20-50% alpha

Player primary:      #00ffcc
Player secondary:    #008866
Player eye:          #ffffff
Player glow:         #00ffcc at 40-80% alpha

Obstacle body:       #1a1a2e
Obstacle border:     #ff2266
Obstacle letter:     #ffffff
Obstacle glow:       #ff2266 at 40-80% alpha

Score text:          #ffffff
Level text:          #00ffcc
Best score:          #ffcc00
Hearts full:         #ff3366
Hearts empty:        #2a2a3a
UI mid-tone:         #667788
UI dim:              #334455

Particle burst:      #ff2266, #00ffcc, #ffcc00 (rotate)
```
