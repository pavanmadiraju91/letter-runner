import { GAME } from '../config.js';
import { getWidth } from '../core/canvas.js';

/**
 * Create a spawner state object tied to an obstacle pool.
 */
export function createSpawner(pool) {
  return {
    pool,
    timer: 0
  };
}

/**
 * Timer-based obstacle spawning with letter uniqueness and gap enforcement.
 */
export function updateSpawner(spawner, dt, scrollSpeed, groundY) {
  spawner.timer += dt;

  if (spawner.timer < GAME.SPAWN_INTERVAL) {
    return;
  }

  spawner.timer = 0;

  const active = spawner.pool.getActive();

  // Guard: respect max obstacles cap
  if (active.length >= GAME.MAX_OBSTACLES) {
    return;
  }

  // Guard: ensure minimum gap from right edge
  const screenWidth = getWidth();
  for (let i = 0; i < active.length; i++) {
    if (screenWidth - active[i].x < GAME.MIN_OBSTACLE_GAP) {
      return;
    }
  }

  // Pick a unique letter not already on screen
  const usedLetters = new Set();
  for (let i = 0; i < active.length; i++) {
    usedLetters.add(active[i].letter);
  }

  let letter = '';
  for (let attempt = 0; attempt < 26; attempt++) {
    const candidate = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    if (!usedLetters.has(candidate)) {
      letter = candidate;
      break;
    }
  }

  // If somehow all 26 are on screen (impossible with MAX_OBSTACLES=4), bail
  if (!letter) {
    return;
  }

  // Acquire from pool and configure
  const obs = spawner.pool.acquire();
  obs.x = screenWidth + 10;
  obs.y = groundY - GAME.OBSTACLE_HEIGHT;
  obs.letter = letter;
  obs.speed = scrollSpeed;
  obs.active = true;
}
