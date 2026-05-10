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
      isCombo: false
    };
  };
}

/**
 * Move all active obstacles left by their speed * dt.
 */
export function updateObstacles(pool, dt) {
  const active = pool.getActive();
  for (let i = 0; i < active.length; i++) {
    active[i].x -= active[i].speed * dt;
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
 * Render a combo obstacle with per-letter visual state.
 * Each letter cell shows: green (completed), pulsing yellow (next target), red (pending).
 * Uses screen-blend glow in danger zone (VIS-04) and 26px bold outlined letters (VIS-05).
 */
function renderComboObstacle(ctx, obs) {
  const P = getPalette();
  const x = Math.round(obs.x);
  const y = Math.round(obs.y);
  const w = obs.width;
  const h = obs.height;
  const cellWidth = COMBO.WIDTH_PER_LETTER;
  const inDanger = isInDangerZone(obs);

  // Screen-blend glow (replaces shadowBlur) -- VIS-04
  if (inDanger) {
    // Pulsing glow intensity when in danger zone -- VIS-03
    const pulse = OBSTACLE_VFX.GLOW_MIN_ALPHA +
      OBSTACLE_VFX.GLOW_RANGE * Math.sin(Date.now() * OBSTACLE_VFX.GLOW_PULSE_SPEED);
    const pad = OBSTACLE_VFX.GLOW_PADDING;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = pulse;
    ctx.fillStyle = P.OBSTACLE_GLOW;
    ctx.fillRect(x - pad, y - pad, w + pad * 2, h + pad * 2);
    ctx.restore();
  }

  // Body fill (full width)
  ctx.fillStyle = P.OBSTACLE_BODY;
  ctx.fillRect(x, y, w, h);

  // Neon border (2px inset)
  ctx.strokeStyle = P.OBSTACLE_BORDER;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

  // Render each letter cell
  const fontSize = OBSTACLE_VFX.LETTER_FONT_SIZE;
  const outlineWidth = OBSTACLE_VFX.LETTER_OUTLINE_WIDTH;

  for (let i = 0; i < obs.letters.length; i++) {
    const cellX = x + i * cellWidth;

    // Determine letter color based on progress
    let color;
    if (i < obs.progress) {
      // Completed -- green
      color = P.GREEN;
    } else if (i === obs.progress) {
      // Next target -- pulsing yellow
      const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.008);
      color = P.YELLOW;
      ctx.globalAlpha = pulse;
    } else {
      // Pending -- red
      color = P.MAGENTA;
    }

    // Vertical separator between cells (skip first)
    if (i > 0) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = P.DIM;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cellX, y + 4);
      ctx.lineTo(cellX, y + h - 4);
      ctx.stroke();
    }

    // Draw letter centered in cell -- VIS-05: bold 26px with dark outline
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Dark outline (stroke first, then fill)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = outlineWidth;
    ctx.strokeText(obs.letters[i], cellX + cellWidth / 2, y + h / 2);
    ctx.fillStyle = color;
    ctx.fillText(obs.letters[i], cellX + cellWidth / 2, y + h / 2);

    // Reset alpha after pulsing letter
    ctx.globalAlpha = 1;
  }
}

/**
 * Render a single-letter obstacle -- neon-styled block with screen-blend glow,
 * danger-zone pulse, and large outlined letter.
 */
function renderSingleObstacle(ctx, obs) {
  const P = getPalette();
  const x = Math.round(obs.x);
  const y = Math.round(obs.y);
  const w = obs.width;
  const h = obs.height;
  const inDanger = isInDangerZone(obs);

  // Screen-blend glow (replaces shadowBlur) -- VIS-04
  if (inDanger) {
    // Pulsing glow intensity when in danger zone -- VIS-03
    const pulse = OBSTACLE_VFX.GLOW_MIN_ALPHA +
      OBSTACLE_VFX.GLOW_RANGE * Math.sin(Date.now() * OBSTACLE_VFX.GLOW_PULSE_SPEED);
    const pad = OBSTACLE_VFX.GLOW_PADDING;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = pulse;
    ctx.fillStyle = P.OBSTACLE_GLOW;
    ctx.fillRect(x - pad, y - pad, w + pad * 2, h + pad * 2);
    ctx.restore();
  }

  // Body fill (semi-transparent to let background show through)
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = P.OBSTACLE_BODY;
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 1;

  // Neon border (2px) — the primary visual element
  ctx.save();
  ctx.strokeStyle = P.OBSTACLE_BORDER;
  ctx.lineWidth = 2;
  ctx.shadowColor = P.OBSTACLE_BORDER;
  ctx.shadowBlur = 6;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  ctx.restore();

  // Letter -- VIS-05: 26px bold with dark outline for readability
  const fontSize = OBSTACLE_VFX.LETTER_FONT_SIZE;
  const outlineWidth = OBSTACLE_VFX.LETTER_OUTLINE_WIDTH;
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Dark outline (stroke first, then fill)
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = outlineWidth;
  ctx.strokeText(obs.letter, x + w / 2, y + h / 2);
  ctx.fillStyle = P.OBSTACLE_LETTER;
  ctx.fillText(obs.letter, x + w / 2, y + h / 2);
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
