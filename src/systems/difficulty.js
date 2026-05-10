import { events } from '../core/events.js';
import { getWidth } from '../core/canvas.js';
import { DIFFICULTY, SPEED, GAME } from '../config.js';

let destroyCount = 0;
let currentLevel = 1;
let elapsedTime = 0;

/**
 * Initialize the difficulty system.
 * Subscribes to events:
 * - OBSTACLE_DESTROYED: tracks destroys, emits LEVEL_UP every DESTROYS_PER_LEVEL
 * - LIFE_LOST: penalizes speed (drops elapsed time by 30%) and drops one level (min 1)
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

  events.on('LIFE_LOST', () => {
    penalizeSpeed();
    // Drop one level (minimum level 1)
    if (currentLevel > 1) {
      currentLevel--;
      destroyCount = Math.max(0, destroyCount - DIFFICULTY.DESTROYS_PER_LEVEL);
      events.emit('LEVEL_DOWN', { level: currentLevel });
    }
  });

  events.on('GAME_RESTART', () => {
    resetDifficulty();
  });

  // Development-mode speed curve dump for engagement tuning
  if (import.meta.env.DEV) {
    console.log('%c[Speed Curve]', 'color: #00ffcc; font-weight: bold');
    console.table(
      [0, 5, 10, 15, 20, 30, 40, 50, 60, 70, 80, 90].map(t => {
        const speed = Math.min(SPEED.BASE_SPEED + SPEED.ACCELERATION * t, SPEED.MAX_SPEED);
        const spawnInt = Math.max(
          SPEED.MIN_SPAWN_INTERVAL,
          SPEED.BASE_SPAWN_INTERVAL * (SPEED.BASE_SPEED / speed)
        );
        const dangerZoneMs = Math.round((getWidth() * 0.3) / speed * 1000);
        return {
          time_s: t,
          speed_px_s: Math.round(speed),
          spawn_interval_s: spawnInt.toFixed(2),
          danger_zone_ms: dangerZoneMs,
          difficulty: speed >= SPEED.MAX_SPEED ? 'CAPPED' :
                     t < 20 ? 'easy' : t < 40 ? 'medium' : 'hard'
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
 * Penalize speed on life lost: reduces elapsed time by 30%.
 * This effectively drops the current speed back, making the game feel slower
 * as punishment for losing a life. Speed will ramp back up naturally.
 */
export function penalizeSpeed() {
  elapsedTime *= 0.7; // 30% reduction
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
 * Speed and spawn interval are continuous (time-based); other params remain tier-based.
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
      maxObstacles: Math.min(
        DIFFICULTY.MAX_OBSTACLES_CAP,
        baseTier.maxObstacles + (overflow >= 3 ? 1 : 0)
      ),
      multiplier: baseTier.multiplier + DIFFICULTY.LOG_MULT_FACTOR * logFactor,
      tallObstacles: true,
    };
  }

  // Speed is continuous (time-based)
  const speed = getCurrentSpeed();
  tierParams.scrollSpeed = speed;

  // Spawn interval derived from speed: inversely proportional
  // At BASE_SPEED (140): 2.5s. At MAX_SPEED (280): 1.25s. Floor at 0.8s.
  tierParams.spawnInterval = Math.max(
    SPEED.MIN_SPAWN_INTERVAL,
    SPEED.BASE_SPAWN_INTERVAL * (SPEED.BASE_SPEED / speed)
  );

  return tierParams;
}

/**
 * Get current level number.
 * @returns {number}
 */
export function getLevel() {
  return currentLevel;
}
