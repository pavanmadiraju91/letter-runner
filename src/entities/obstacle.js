import { GAME } from '../config.js';
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
      active: false
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
      events.emit('OBSTACLE_MISSED', { letter: obs.letter });
      pool.release(obs);
    }
  }
}

/**
 * Render all obstacles — neon pink body with centered white letter.
 */
export function renderObstacles(ctx, obstacles) {
  ctx.fillStyle = '#ff2266';
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    ctx.fillRect(Math.round(obs.x), Math.round(obs.y), obs.width, obs.height);
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    ctx.fillText(
      obs.letter,
      Math.round(obs.x + obs.width / 2),
      Math.round(obs.y + obs.height / 2)
    );
  }
}
