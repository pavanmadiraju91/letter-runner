import { GAME, COLORS, COMBO } from '../config.js';
import { events } from '../core/events.js';

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
 * Release obstacles that have scrolled off the left edge.
 * Iterates in reverse since release modifies the active array.
 */
export function cleanupOffscreen(pool) {
  const active = pool.getActive();
  for (let i = active.length - 1; i >= 0; i--) {
    const obs = active[i];
    if (obs.x + obs.width < 0) {
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
 */
function renderComboObstacle(ctx, obs) {
  const x = Math.round(obs.x);
  const y = Math.round(obs.y);
  const w = obs.width;
  const h = obs.height;
  const cellWidth = COMBO.WIDTH_PER_LETTER;

  // Neon glow effect
  ctx.shadowColor = COLORS.PALETTE.OBSTACLE_GLOW;
  ctx.shadowBlur = 8;

  // Body fill (full width)
  ctx.fillStyle = COLORS.PALETTE.OBSTACLE_BODY;
  ctx.fillRect(x, y, w, h);

  // Neon border (2px inset)
  ctx.strokeStyle = COLORS.PALETTE.OBSTACLE_BORDER;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

  // Reset shadow before text
  ctx.shadowBlur = 0;

  // Render each letter cell
  for (let i = 0; i < obs.letters.length; i++) {
    const cellX = x + i * cellWidth;

    // Determine letter color based on progress
    let color;
    if (i < obs.progress) {
      // Completed — green
      color = COLORS.PALETTE.GREEN;
    } else if (i === obs.progress) {
      // Next target — pulsing yellow
      const pulse = 0.7 + 0.3 * Math.sin(Date.now() * 0.008);
      color = COLORS.PALETTE.YELLOW;
      ctx.globalAlpha = pulse;
    } else {
      // Pending — red
      color = COLORS.PALETTE.MAGENTA;
    }

    // Vertical separator between cells (skip first)
    if (i > 0) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = COLORS.PALETTE.DIM;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cellX, y + 4);
      ctx.lineTo(cellX, y + h - 4);
      ctx.stroke();
    }

    // Draw letter centered in cell
    ctx.fillStyle = color;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obs.letters[i], cellX + cellWidth / 2, y + h / 2);

    // Reset alpha after pulsing letter
    ctx.globalAlpha = 1;
  }

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Render a single-letter obstacle — neon-styled block with glow, border, and centered letter.
 */
function renderSingleObstacle(ctx, obs) {
  const x = Math.round(obs.x);
  const y = Math.round(obs.y);
  const w = obs.width;
  const h = obs.height;

  // Neon glow effect
  ctx.shadowColor = COLORS.PALETTE.OBSTACLE_GLOW;
  ctx.shadowBlur = 8;

  // Body fill
  ctx.fillStyle = COLORS.PALETTE.OBSTACLE_BODY;
  ctx.fillRect(x, y, w, h);

  // Neon border (2px inset)
  ctx.strokeStyle = COLORS.PALETTE.OBSTACLE_BORDER;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

  // Reset shadow before text
  ctx.shadowBlur = 0;

  // Centered letter
  ctx.fillStyle = COLORS.PALETTE.OBSTACLE_LETTER;
  ctx.font = 'bold 22px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(obs.letter, x + w / 2, y + h / 2);
}

/**
 * Render all obstacles — dispatches to combo or single rendering.
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

  // Ensure shadow is fully reset after loop
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}
