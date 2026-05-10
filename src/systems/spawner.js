import { GAME, COMBO } from '../config.js';
import { getWidth } from '../core/canvas.js';
import { isWarmupComplete, getMinGap, getCurrentSpeed, getLevel } from './difficulty.js';
import { isTouchDevice } from './input.js';

const LETTERS_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LETTERS_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const CHARACTER_POOL = LETTERS_UPPER + DIGITS;
const POOL_SIZE = CHARACTER_POOL.length; // 36 characters

/**
 * Get the character pool based on device type and current level.
 * Mobile eases in complexity:
 *   Levels 1-4: uppercase only (26 chars)
 *   Levels 5-7: uppercase + lowercase (52 chars)
 *   Levels 8+:  uppercase + lowercase + digits (62 chars)
 * Desktop: full pool (A-Z + 0-9) from the start.
 */
function getCharacterPool() {
  if (!isTouchDevice) {
    return CHARACTER_POOL; // desktop: uppercase + digits (case randomized later)
  }
  const level = getLevel();
  if (level >= 8) {
    return LETTERS_UPPER + LETTERS_LOWER + DIGITS;
  }
  if (level >= 5) {
    return LETTERS_UPPER + LETTERS_LOWER;
  }
  return LETTERS_UPPER;
}

/**
 * Randomize case for a character: letters get 50/50 upper/lower,
 * digits stay as-is.
 * On mobile at early levels (< 5), always returns uppercase.
 */
function randomizeCase(ch) {
  if (isTouchDevice && getLevel() < 5) {
    return ch.toUpperCase();
  }
  if (ch >= 'A' && ch <= 'Z') {
    return Math.random() < 0.5 ? ch.toLowerCase() : ch;
  }
  return ch; // digits unchanged
}

/**
 * Get font scale range based on device.
 * Mobile uses a narrower range (0.8-1.4) to avoid tiny/huge text on small screens.
 */
function getRandomFontScale() {
  if (isTouchDevice) {
    return 0.8 + Math.random() * 0.6; // 0.8 to 1.4
  }
  return 0.6 + Math.random() * 1.6; // 0.6 to 2.2 (desktop)
}

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
  // Enforce warm-up: no obstacles until WARMUP_TIME has elapsed
  if (!isWarmupComplete()) return;

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

  // Guard: ensure minimum gap from right edge (dynamic based on current speed)
  const screenWidth = getWidth();
  for (let i = 0; i < active.length; i++) {
    if (screenWidth - active[i].x < getMinGap(getCurrentSpeed())) {
      return;
    }
  }

  // DIFF-07/DIFF-08: All visible obstacles must have unique letters.
  // Collect ALL used letters across single and combo obstacles.
  const usedLetters = new Set();
  for (let i = 0; i < active.length; i++) {
    const obs = active[i];
    if (obs.isCombo && obs.letters.length > 0) {
      for (let j = 0; j < obs.letters.length; j++) {
        usedLetters.add(obs.letters[j]);
      }
    } else if (obs.letter) {
      usedLetters.add(obs.letter);
    }
  }

  // Determine if this spawn should be a combo obstacle
  const level = getLevel();
  const activeComboCount = active.filter(o => o.isCombo).length;
  let comboSize = 0; // 0 = single, 2 = 2-letter, 3 = 3-letter, 4 = 4-letter

  if (activeComboCount < COMBO.MAX_ON_SCREEN) {
    if (level >= COMBO.MIN_LEVEL_4LETTER && Math.random() < COMBO.SPAWN_CHANCE_4LETTER) {
      comboSize = 4;
    } else if (level >= COMBO.MIN_LEVEL_3LETTER && Math.random() < COMBO.SPAWN_CHANCE_3LETTER) {
      comboSize = 3;
    } else if (level >= COMBO.MIN_LEVEL_2LETTER && Math.random() < COMBO.SPAWN_CHANCE_2LETTER) {
      comboSize = 2;
    }
  }

  // Get current character pool (device/level-aware)
  const pool_chars = getCharacterPool();
  const poolLen = pool_chars.length;

  // Check if enough characters are available for the combo size
  const availableCount = poolLen - usedLetters.size;
  if (comboSize > 0 && availableCount < comboSize) {
    comboSize = availableCount >= 1 ? 0 : 0; // Fall back to single or skip
  }

  // Pick letters
  if (comboSize > 0) {
    // Combo spawn: pick N unique characters
    const comboLetters = [];
    for (let n = 0; n < comboSize; n++) {
      let picked = '';
      for (let attempt = 0; attempt < poolLen; attempt++) {
        const candidate = pool_chars[Math.floor(Math.random() * poolLen)];
        if (!usedLetters.has(candidate)) {
          picked = candidate;
          usedLetters.add(candidate); // Prevent duplicates within the combo
          break;
        }
      }
      // Deterministic fallback
      if (!picked) {
        for (let i = 0; i < poolLen; i++) {
          const c = pool_chars[i];
          if (!usedLetters.has(c)) {
            picked = c;
            usedLetters.add(c);
            break;
          }
        }
      }
      if (!picked) {
        // Not enough characters available, abort combo — fall back to single
        comboSize = 0;
        break;
      }
      comboLetters.push(randomizeCase(picked));
    }

    if (comboSize > 0) {
      // Acquire from pool and configure as combo
      const obs = spawner.pool.acquire();
      obs.x = screenWidth + 10;

      const isTall = difficultyParams.tallObstacles && Math.random() < 0.4;
      obs.height = isTall ? GAME.OBSTACLE_HEIGHT * 1.5 : GAME.OBSTACLE_HEIGHT;
      // Combo obstacles stay closer to ground (0-30px offset) for readability
      obs.y = groundY - obs.height - Math.random() * 30;

      obs.letter = '';
      obs.letters = comboLetters;
      obs.progress = 0;
      obs.isCombo = true;
      obs.width = COMBO.WIDTH_PER_LETTER * comboSize;
      obs.speed = getCurrentSpeed();
      obs.fontScale = getRandomFontScale();
      obs.active = true;
      return;
    }
  }

  // Single-letter spawn (default path)
  let letter = '';
  for (let attempt = 0; attempt < poolLen; attempt++) {
    const candidate = pool_chars[Math.floor(Math.random() * poolLen)];
    if (!usedLetters.has(candidate)) {
      letter = candidate;
      break;
    }
  }

  // Deterministic fallback
  if (!letter) {
    for (let i = 0; i < poolLen; i++) {
      const c = pool_chars[i];
      if (!usedLetters.has(c)) {
        letter = c;
        break;
      }
    }
  }

  // Absolute last resort: all 36 characters in use (impossible with MAX_OBSTACLES=4)
  if (!letter) {
    return;
  }

  // Acquire from pool and configure as single-letter obstacle
  const obs = spawner.pool.acquire();
  obs.x = screenWidth + 10;

  const isTall = difficultyParams.tallObstacles && Math.random() < 0.4;
  obs.height = isTall ? GAME.OBSTACLE_HEIGHT * 1.5 : GAME.OBSTACLE_HEIGHT;
  // Single obstacles float at varying heights (0-80px above ground)
  obs.y = groundY - obs.height - Math.random() * 80;

  obs.letter = randomizeCase(letter);
  obs.letters = [];
  obs.progress = 0;
  obs.isCombo = false;
  obs.width = GAME.OBSTACLE_WIDTH;
  obs.speed = getCurrentSpeed();
  obs.fontScale = getRandomFontScale();
  obs.active = true;
}
