import { events } from '../core/events.js';
import { DIFFICULTY, SPEED, GAME } from '../config.js';

let destroyCount = 0;
let currentLevel = 1;
let elapsedTime = 0;

/**
 * Initialize the difficulty system.
 * Subscribes to events:
 * - OBSTACLE_DESTROYED: tracks destroys, emits LEVEL_UP every DESTROYS_PER_LEVEL
 * - GAME_RESTART: resets difficulty to level 1
 */
export function createDifficulty() {
  events.on('OBSTACLE_DESTROYED', () => {
    destroyCount++;
    const newLevel = Math.floor(destroyCount / DIFFICULTY.DESTROYS_PER_LEVEL) + 1;
    if (newLevel > currentLevel) {
      currentLevel = newLevel;
      events.emit('LEVEL_UP', { level: currentLevel, ...getDifficultyParams() });
    }
  });

  events.on('GAME_RESTART', () => {
    resetDifficulty();
  });

  // Development-mode difficulty curve dump for tuning verification
  if (import.meta.env.DEV) {
    console.table(
      Array.from({ length: 8 }, (_, i) => {
        const seconds = i * 10;
        const speed = Math.min(SPEED.BASE_SPEED + SPEED.ACCELERATION * seconds, SPEED.MAX_SPEED);
        const gap = getMinGap(speed);
        return {
          seconds,
          speed: Math.round(speed),
          minGap: Math.round(gap),
          level: Math.floor(i * 10 / 7) + 1  // rough estimate: ~7s per level at 10 destroys
        };
      })
    );
  }
}

/**
 * Tick elapsed time for speed calculation. Called each frame from main.js.
 * @param {number} dt - delta time in seconds
 */
export function tickSpeed(dt) {
  elapsedTime += dt;
}

/**
 * Get current speed based on elapsed time.
 * Linear acceleration from BASE_SPEED to MAX_SPEED.
 * @returns {number} current speed in px/s
 */
export function getCurrentSpeed() {
  return Math.min(SPEED.BASE_SPEED + SPEED.ACCELERATION * elapsedTime, SPEED.MAX_SPEED);
}

/**
 * Get minimum gap between obstacles to guarantee fair reaction time.
 * Ensures player always has at least MIN_REACTION_MS to react.
 * Floor of OBSTACLE_WIDTH * 2.5 (120px) to prevent overly tight gaps.
 * @param {number} currentSpeed - current speed in px/s
 * @returns {number} minimum gap in pixels
 */
export function getMinGap(currentSpeed) {
  const reactionGap = currentSpeed * (SPEED.MIN_REACTION_MS / 1000) + GAME.OBSTACLE_WIDTH;
  return Math.max(GAME.OBSTACLE_WIDTH * 2.5, reactionGap);
}

/**
 * Check if warmup period is complete (obstacles may spawn after this).
 * @returns {boolean}
 */
export function isWarmupComplete() {
  return elapsedTime >= SPEED.WARMUP_TIME;
}

/**
 * Reset difficulty to initial state.
 * Does NOT emit LEVEL_UP (fresh game starts at implicit level 1).
 */
export function resetDifficulty() {
  destroyCount = 0;
  currentLevel = 1;
  elapsedTime = 0;
}

/**
 * Get current difficulty parameters based on level.
 * Speed is now continuous (time-based); other params remain tier-based.
 * @returns {{ scrollSpeed: number, spawnInterval: number, maxObstacles: number, multiplier: number, tallObstacles: boolean }}
 */
export function getDifficultyParams() {
  let tierParams;

  if (currentLevel <= DIFFICULTY.TIERS.length) {
    tierParams = { ...DIFFICULTY.TIERS[currentLevel - 1] };
  } else {
    // Logarithmic scaling beyond tier table
    const baseTier = DIFFICULTY.TIERS[DIFFICULTY.TIERS.length - 1];
    const overflow = currentLevel - DIFFICULTY.TIERS.length;
    const logFactor = Math.log(overflow + 1);

    tierParams = {
      scrollSpeed: baseTier.scrollSpeed,
      spawnInterval: Math.max(
        DIFFICULTY.MIN_SPAWN_INTERVAL,
        baseTier.spawnInterval - DIFFICULTY.LOG_SPAWN_FACTOR * logFactor
      ),
      maxObstacles: Math.min(
        DIFFICULTY.MAX_OBSTACLES_CAP,
        baseTier.maxObstacles + (overflow >= 3 ? 1 : 0)
      ),
      multiplier: baseTier.multiplier + DIFFICULTY.LOG_MULT_FACTOR * logFactor,
      tallObstacles: true,
    };
  }

  // Override speed with continuous time-based speed
  tierParams.scrollSpeed = getCurrentSpeed();
  return tierParams;
}

/**
 * Get current level number.
 * @returns {number}
 */
export function getLevel() {
  return currentLevel;
}
