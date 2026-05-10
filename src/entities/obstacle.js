import { GAME, COLORS } from '../config.js';
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
 * Render all obstacles — neon-styled blocks with glow, border, and centered letter.
 */
export function renderObstacles(ctx, obstacles) {
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
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

  // Ensure shadow is fully reset after loop
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}
