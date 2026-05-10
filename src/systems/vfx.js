/**
 * VFX event handlers — wires game events to visual effects.
 * - VFX-04: Obstacle shatter particles (multi-colored burst on destroy)
 * - VFX-05: Player white flash on correct key press (~100ms)
 * - VFX-06: Screen red flash on life lost (~200ms fade)
 * - VFX-07: Screen shake on obstacle destroy
 */

import { events } from '../core/events.js';
import { canSpawnParticles, spawnParticles } from './particles.js';
import { getPalette } from '../core/theme.js';

const FLASH_DURATION = 0.1; // 100ms white flash
const SCREEN_FLASH_DURATION = 0.2; // 200ms red flash (VFX-06)
const SHAKE_DURATION = 0.1; // 100ms screen shake
const SHAKE_INTENSITY_SINGLE = 2; // px for single letter destroy
const SHAKE_INTENSITY_COMBO = 4; // px for combo destroy

let playerFlashTimer = 0;
let screenFlashTimer = 0;
let shakeTimer = 0;
let shakeIntensity = 0;

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
 * Words get a bigger burst (more particles, higher speed).
 */
function spawnDestroyParticles(x, y, isWord, comboSize) {
  if (!canSpawnParticles()) return;

  const P = getPalette();

  if (isWord) {
    const colors = [P.CYAN, P.BLUE, P.GREEN, P.WHITE];
    const particlesPerColor = Math.min(4, Math.ceil(comboSize / 2));
    for (let i = 0; i < colors.length; i++) {
      spawnParticles(x, y, particlesPerColor, {
        minSpeed: 120,
        maxSpeed: 320,
        minSize: 2,
        maxSize: 6,
        minLife: 0.4,
        maxLife: 1.0,
        color: colors[i],
      });
    }
  } else {
    const colors = [P.MAGENTA, P.CYAN, P.YELLOW];
    for (let i = 0; i < colors.length; i++) {
      spawnParticles(x, y, 3, {
        ...SHATTER_CONFIG,
        color: colors[i],
      });
    }
  }
}

/**
 * Initialize VFX system — subscribe to game events.
 */
export function createVFX() {
  events.on('OBSTACLE_DESTROYED', ({ x, y, isCombo, isWord, comboSize }) => {
    spawnDestroyParticles(x, y, !!isWord, comboSize || 1);
    playerFlashTimer = FLASH_DURATION;
    shakeTimer = SHAKE_DURATION;
    shakeIntensity = isWord ? SHAKE_INTENSITY_COMBO + 2 :
      (isCombo && comboSize > 1) ? SHAKE_INTENSITY_COMBO : SHAKE_INTENSITY_SINGLE;
  });

  events.on('WORD_LETTER_TYPED', ({ x, y }) => {
    if (!canSpawnParticles()) return;
    const P = getPalette();
    spawnParticles(x, y, 4, {
      minSpeed: 60,
      maxSpeed: 160,
      minSize: 1,
      maxSize: 3,
      minLife: 0.2,
      maxLife: 0.5,
      color: P.CYAN,
    });
  });

  // VFX-06: Red screen flash on life lost
  events.on('LIFE_LOST', () => {
    screenFlashTimer = SCREEN_FLASH_DURATION;
  });

  events.on('GAME_RESTART', () => {
    playerFlashTimer = 0;
    screenFlashTimer = 0;
    shakeTimer = 0;
    shakeIntensity = 0;
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
  if (shakeTimer > 0) {
    shakeTimer = Math.max(0, shakeTimer - dt);
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

/**
 * Get current screen shake offset (VFX-07).
 * Returns { x, y } offset in pixels to apply to rendering context.
 * Decays to 0 over SHAKE_DURATION.
 */
export function getScreenShake() {
  if (shakeTimer <= 0) return { x: 0, y: 0 };
  const progress = shakeTimer / SHAKE_DURATION; // 1.0 -> 0.0
  const currentIntensity = shakeIntensity * progress;
  return {
    x: (Math.random() * 2 - 1) * currentIntensity,
    y: (Math.random() * 2 - 1) * currentIntensity
  };
}
