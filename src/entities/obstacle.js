import { GAME, COMBO, OBSTACLE_VFX } from '../config.js';
import { getWidth } from '../core/canvas.js';
import { events } from '../core/events.js';
import { getPalette } from '../core/theme.js';

/**
 * Determine if an obstacle is within the danger zone (left 30% of canvas).
 */
function isInDangerZone(obs) {
  return obs.x <= getWidth() * GAME.DANGER_ZONE_START;
}

/**
 * Factory function for obstacle objects.
 * Returns a factory that creates plain obstacle objects (no `new` keyword).
 */
export function createObstacleFactory() {
  return function () {
    return {
      x: 0,
      y: 0,
      width: GAME.OBSTACLE_WIDTH,
      height: GAME.OBSTACLE_HEIGHT,
      letter: '',
      speed: 0,
      active: false,
      // Combo fields
      letters: [],
      progress: 0,
      isCombo: false,
      // Visual variation
      fontScale: 1.0,
      // Wrong key flash
      wrongFlashTimer: 0
    };
  };
}

/**
 * Initialize obstacle visual effects — subscribes to WRONG_KEY event
 * to trigger subtle red flash on ALL obstacles in the danger zone.
 */
let activePoolRef = null;

export function initObstacleEffects(pool) {
  activePoolRef = pool;
  events.on('WRONG_KEY', () => {
    if (!activePoolRef) return;
    const active = activePoolRef.getActive();
    for (let i = 0; i < active.length; i++) {
      if (isInDangerZone(active[i])) {
        active[i].wrongFlashTimer = 0.15;
      }
    }
  });
}

/**
 * Move all active obstacles left by their speed * dt.
 * Also decrement wrongFlashTimer for the wrong-key visual feedback.
 */
export function updateObstacles(pool, dt) {
  const active = pool.getActive();
  for (let i = 0; i < active.length; i++) {
    active[i].x -= active[i].speed * dt;
    if (active[i].wrongFlashTimer > 0) {
      active[i].wrongFlashTimer -= dt;
    }
  }
}

/**
 * Release obstacles that have passed the player's X position.
 * This is where the "miss" happens — the obstacle got past you.
 */
export function cleanupOffscreen(pool) {
  const active = pool.getActive();
  const playerRight = getWidth() * GAME.PLAYER_X_PERCENT + GAME.PLAYER_WIDTH;
  for (let i = active.length - 1; i >= 0; i--) {
    const obs = active[i];
    if (obs.x + obs.width < playerRight) {
      obs.active = false;
      events.emit('OBSTACLE_MISSED', {
        letter: obs.letter,
        letters: obs.letters,
        isCombo: obs.isCombo
      });
      pool.release(obs);
    }
  }
}

/**
 * Render a combo obstacle as floating glowing letters connected like a constellation.
 * No box/border — just letters with glow and connecting lines.
 * When wrongFlashTimer > 0, applies subtle red tint and micro-jitter.
 */
function renderComboObstacle(ctx, obs) {
  const P = getPalette();
  let x = Math.round(obs.x);
  const y = Math.round(obs.y);
  const h = obs.height;
  const cellWidth = COMBO.WIDTH_PER_LETTER;
  const inDanger = isInDangerZone(obs);
  const fontScale = obs.fontScale || 1.0;
  const fontSize = Math.round(OBSTACLE_VFX.LETTER_FONT_SIZE * fontScale);

  // Wrong key: subtle jitter
  const wrongFlash = obs.wrongFlashTimer > 0;
  if (wrongFlash) {
    x += Math.sin(Date.now() * 0.05) * 2;
  }

  // Draw connecting dots/line between letters (constellation effect)
  ctx.save();
  ctx.strokeStyle = P.DIM || '#334455';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4;
  ctx.setLineDash([3, 4]);
  if (obs.letters.length > 1) {
    ctx.beginPath();
    const firstCenterX = x + cellWidth / 2;
    const centerY = y + h / 2;
    ctx.moveTo(firstCenterX, centerY);
    for (let i = 1; i < obs.letters.length; i++) {
      const cx = x + i * cellWidth + cellWidth / 2;
      ctx.lineTo(cx, centerY);
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();

  // Render each letter with glow
  for (let i = 0; i < obs.letters.length; i++) {
    const cellX = x + i * cellWidth;
    const centerX = cellX + cellWidth / 2;
    const centerY = y + h / 2;

    // Determine letter color based on progress
    let color;
    let glowColor;
    if (i < obs.progress) {
      // Completed — green
      color = P.GREEN;
      glowColor = P.GREEN;
    } else if (i === obs.progress) {
      // Next target — pulsing yellow
      const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.008);
      color = P.YELLOW;
      glowColor = P.YELLOW;
      ctx.globalAlpha = pulse;
    } else {
      // Pending — magenta
      color = P.MAGENTA;
      glowColor = P.MAGENTA;
    }

    // Danger zone: stronger glow on the letter (no circle)
    const dangerGlow = inDanger
      ? 6 + 4 * Math.sin(Date.now() * OBSTACLE_VFX.GLOW_PULSE_SPEED)
      : 0;

    // Letter glow
    ctx.save();
    ctx.font = `bold ${fontSize}px 'Arial Black', 'Arial', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (wrongFlash) {
      ctx.shadowColor = '#ff3333';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#ff6666';
    } else {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10 + dangerGlow;
      ctx.fillStyle = color;
    }

    ctx.fillText(obs.letters[i], centerX, centerY);
    ctx.shadowBlur = wrongFlash ? 6 : (5 + dangerGlow * 0.5);
    ctx.fillText(obs.letters[i], centerX, centerY);
    ctx.restore();

    // Reset alpha after pulsing letter
    ctx.globalAlpha = 1;
  }

  // Small dots at each letter position for constellation effect
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = P.DIM || '#334455';
  for (let i = 0; i < obs.letters.length; i++) {
    const cx = x + i * cellWidth + cellWidth / 2;
    ctx.beginPath();
    ctx.arc(cx, y + h / 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Render a single-letter obstacle as a floating glowing letter in space.
 * No box/border — just the letter with glow effect.
 * When wrongFlashTimer > 0, applies subtle red tint and micro-jitter.
 */
function renderSingleObstacle(ctx, obs) {
  const P = getPalette();
  let x = Math.round(obs.x);
  const y = Math.round(obs.y);
  const w = obs.width;
  const h = obs.height;
  const inDanger = isInDangerZone(obs);
  const fontScale = obs.fontScale || 1.0;
  const fontSize = Math.round(OBSTACLE_VFX.LETTER_FONT_SIZE * fontScale);

  // Wrong key: subtle jitter
  const wrongFlash = obs.wrongFlashTimer > 0;
  if (wrongFlash) {
    x += Math.sin(Date.now() * 0.05) * 2;
  }

  const centerX = x + w / 2;
  const centerY = y + h / 2;

  // Danger zone: letter glows more intensely (no circle, just stronger shadow on the letter itself)
  const dangerGlow = inDanger
    ? 6 + 4 * Math.sin(Date.now() * OBSTACLE_VFX.GLOW_PULSE_SPEED)
    : 0;

  // Letter with glow — the primary and only visual
  ctx.save();
  ctx.font = `bold ${fontSize}px 'Arial Black', 'Arial', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (wrongFlash) {
    // Wrong key: red glow, slightly brighter
    ctx.shadowColor = '#ff3333';
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#ff6666';
  } else {
    ctx.shadowColor = P.OBSTACLE_GLOW || P.MAGENTA;
    ctx.shadowBlur = 12 + dangerGlow;
    ctx.fillStyle = P.OBSTACLE_LETTER;
  }

  ctx.fillText(obs.letter, centerX, centerY);
  // Double-draw for stronger glow
  ctx.shadowBlur = wrongFlash ? 8 : (6 + dangerGlow * 0.5);
  ctx.fillText(obs.letter, centerX, centerY);
  ctx.restore();
}

/**
 * Render all obstacles -- dispatches to combo or single rendering.
 */
export function renderObstacles(ctx, obstacles) {
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    if (obs.isCombo) {
      renderComboObstacle(ctx, obs);
    } else {
      renderSingleObstacle(ctx, obs);
    }
  }
}
