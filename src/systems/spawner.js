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
 * @param {object} spawner - spawner state from createSpawner()
 * @param {number} dt - delta time
 * @param {object} difficultyParams - { scrollSpeed, spawnInterval, maxObstacles, multiplier, tallObstacles }
 * @param {number} groundY - ground Y position
 */
export function updateSpawner(spawner, dt, difficultyParams, groundY) {
  spawner.timer += dt;

  if (spawner.timer < difficultyParams.spawnInterval) {
    return;
  }

  spawner.timer = 0;

  const active = spawner.pool.getActive();

  // Guard: respect max obstacles cap
  if (active.length >= difficultyParams.maxObstacles) {
    return;
  }

  // Guard: ensure minimum gap from right edge
  const screenWidth = getWidth();
  for (let i = 0; i < active.length; i++) {
    if (screenWidth - active[i].x < GAME.MIN_OBSTACLE_GAP) {
      return;
    }
  }

  // DIFF-07/DIFF-08: All visible obstacles must have unique letters.
  // We collect all active obstacle letters, then pick randomly from remaining.
  // With MAX_OBSTACLES_CAP=4, we always have 22+ available letters — collision impossible.
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

  // If random didn't find one (theoretically impossible with cap=4),
  // iterate deterministically as final safety net
  if (!letter) {
    for (let code = 65; code <= 90; code++) {
      const c = String.fromCharCode(code);
      if (!usedLetters.has(c)) {
        letter = c;
        break;
      }
    }
  }

  // Absolute last resort: all 26 letters in use (impossible with MAX_OBSTACLES=4)
  if (!letter) {
    return;
  }

  // Acquire from pool and configure
  const obs = spawner.pool.acquire();
  obs.x = screenWidth + 10;

  const isTall = difficultyParams.tallObstacles && Math.random() < 0.4;
  obs.height = isTall ? GAME.OBSTACLE_HEIGHT * 1.5 : GAME.OBSTACLE_HEIGHT;
  obs.y = groundY - obs.height;

  obs.letter = letter;
  obs.speed = difficultyParams.scrollSpeed;
  obs.active = true;
}
