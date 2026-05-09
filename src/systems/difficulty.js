import { events } from '../core/events.js';
import { DIFFICULTY } from '../config.js';

let destroyCount = 0;
let currentLevel = 1;

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

  // DIFF-09: Development-mode difficulty curve dump for tuning verification
  if (import.meta.env.DEV) {
    console.table(
      Array.from({ length: 10 }, (_, i) => {
        const level = i + 1;
        const saved = currentLevel;
        currentLevel = level;
        const p = getDifficultyParams();
        currentLevel = saved;
        return {
          level,
          scrollSpeed: Math.round(p.scrollSpeed),
          spawnInterval: p.spawnInterval.toFixed(2),
          maxObstacles: p.maxObstacles,
          multiplier: p.multiplier.toFixed(1),
          tallObstacles: p.tallObstacles
        };
      })
    );
  }
}

/**
 * Reset difficulty to initial state.
 * Does NOT emit LEVEL_UP (fresh game starts at implicit level 1).
 */
export function resetDifficulty() {
  destroyCount = 0;
  currentLevel = 1;
}

/**
 * Get current difficulty parameters based on level.
 * For levels within TIERS, returns tier directly.
 * For levels beyond TIERS, applies logarithmic scaling from last tier.
 * @returns {{ scrollSpeed: number, spawnInterval: number, maxObstacles: number, multiplier: number, tallObstacles: boolean }}
 */
export function getDifficultyParams() {
  if (currentLevel <= DIFFICULTY.TIERS.length) {
    return { ...DIFFICULTY.TIERS[currentLevel - 1] };
  }

  // Logarithmic scaling beyond tier table
  const baseTier = DIFFICULTY.TIERS[DIFFICULTY.TIERS.length - 1];
  const overflow = currentLevel - DIFFICULTY.TIERS.length;
  const logFactor = Math.log(overflow + 1);

  return {
    scrollSpeed: baseTier.scrollSpeed + DIFFICULTY.LOG_SPEED_FACTOR * logFactor,
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

/**
 * Get current level number.
 * @returns {number}
 */
export function getLevel() {
  return currentLevel;
}
