/**
 * VFX event handlers — wires game events to visual effects.
 * - VFX-04: Obstacle shatter particles (multi-colored burst on destroy)
 * - VFX-05: Player white flash on correct key press (~100ms)
 */

import { events } from '../core/events.js';
import { canSpawnParticles, spawnParticles } from './particles.js';
import { COLORS } from '../config.js';

const FLASH_DURATION = 0.1; // 100ms white flash

let playerFlashTimer = 0;

const SHATTER_COLORS = [
  COLORS.PALETTE.MAGENTA,
  COLORS.PALETTE.CYAN,
  COLORS.PALETTE.YELLOW,
];

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

  for (let i = 0; i < SHATTER_COLORS.length; i++) {
    spawnParticles(x, y, 3, {
      ...SHATTER_CONFIG,
      color: SHATTER_COLORS[i],
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

  events.on('GAME_RESTART', () => {
    playerFlashTimer = 0;
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
}

/**
 * Returns true if the player flash effect is active.
 * @returns {boolean}
 */
export function getPlayerFlash() {
  return playerFlashTimer > 0;
}
