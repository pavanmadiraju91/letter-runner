/**
 * VFX event handlers — wires game events to visual effects.
 * - VFX-04: Obstacle shatter particles (multi-colored burst on destroy)
 * - VFX-05: Player white flash on correct key press (~100ms)
 * - VFX-06: Screen red flash on life lost (~200ms fade)
 */

import { events } from '../core/events.js';
import { canSpawnParticles, spawnParticles } from './particles.js';
import { getPalette } from '../core/theme.js';

const FLASH_DURATION = 0.1; // 100ms white flash
const SCREEN_FLASH_DURATION = 0.2; // 200ms red flash (VFX-06)

let playerFlashTimer = 0;
let screenFlashTimer = 0;

const SHATTER_CONFIG = {
  minSpeed: 80,
  maxSpeed: 200,
  minSize: 2,
  maxSize: 5,
  minLife: 0.3,
  maxLife: 0.8,
};

/**
 * Spawn multi-colored shatter particles at obstacle position.
 * Spawns 3 particles per color (9 total requested, capped by pool).
 */
function spawnDestroyParticles(x, y) {
  if (!canSpawnParticles()) return;

  const P = getPalette();
  const colors = [P.MAGENTA, P.CYAN, P.YELLOW];
  for (let i = 0; i < colors.length; i++) {
    spawnParticles(x, y, 3, {
      ...SHATTER_CONFIG,
      color: colors[i],
    });
  }
}

/**
 * Initialize VFX system — subscribe to game events.
 */
export function createVFX() {
  events.on('OBSTACLE_DESTROYED', ({ x, y }) => {
    spawnDestroyParticles(x, y);
    playerFlashTimer = FLASH_DURATION;
  });

  // VFX-06: Red screen flash on life lost
  events.on('LIFE_LOST', () => {
    screenFlashTimer = SCREEN_FLASH_DURATION;
  });

  events.on('GAME_RESTART', () => {
    playerFlashTimer = 0;
    screenFlashTimer = 0;
  });
}

/**
 * Update VFX timers.
 * @param {number} dt - Delta time in seconds
 */
export function updateVFX(dt) {
  if (playerFlashTimer > 0) {
    playerFlashTimer -= dt;
    if (playerFlashTimer < 0) playerFlashTimer = 0;
  }
  if (screenFlashTimer > 0) {
    screenFlashTimer = Math.max(0, screenFlashTimer - dt);
  }
}

/**
 * Returns true if the player flash effect is active.
 * @returns {boolean}
 */
export function getPlayerFlash() {
  return playerFlashTimer > 0;
}

/**
 * Get current screen flash state (VFX-06).
 * Returns { active, alpha } where alpha fades from 1.0 to 0.0 over duration.
 */
export function getScreenFlash() {
  return {
    active: screenFlashTimer > 0,
    alpha: screenFlashTimer / SCREEN_FLASH_DURATION
  };
}
