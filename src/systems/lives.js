import { events } from '../core/events.js';
import { GAME } from '../config.js';

let lives = 0;

/**
 * Initialize the lives system.
 * Subscribes to OBSTACLE_MISSED — each miss decrements lives,
 * emits LIFE_LOST, and emits GAME_OVER when lives reach zero.
 */
export function createLives() {
  events.on('OBSTACLE_MISSED', () => {
    lives -= 1;
    events.emit('LIFE_LOST', { remaining: lives });
    if (lives <= 0) {
      events.emit('GAME_OVER', {});
    }
  });
}

/**
 * Reset lives to STARTING_LIVES.
 * Called at game start and on restart.
 */
export function resetLives() {
  lives = GAME.STARTING_LIVES;
}

/**
 * Return current life count (for HUD rendering).
 */
export function getLives() {
  return lives;
}
