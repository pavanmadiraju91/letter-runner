/**
 * Rolling FPS monitor — tracks frame rate using a ring buffer.
 * Used as a performance gate: when FPS drops below threshold, particle spawning is skipped.
 */

const SAMPLE_SIZE = 10;
const LOW_FPS_THRESHOLD = 30;

let buffer = null;
let index = 0;
let filled = 0;

/**
 * Initialize the FPS monitor (module-level closure, consistent with lives/score pattern).
 */
export function createFPSMonitor() {
  buffer = new Float32Array(SAMPLE_SIZE);
  index = 0;
  filled = 0;
}

/**
 * Called each frame with delta-time. Stores dt in ring buffer.
 * @param {number} dt - Delta time in seconds
 */
export function updateFPS(dt) {
  if (!buffer) return;
  buffer[index] = dt;
  index = (index + 1) % SAMPLE_SIZE;
  if (filled < SAMPLE_SIZE) filled++;
}

/**
 * Returns true if rolling average FPS is below LOW_FPS_THRESHOLD (30).
 * Used by particle system to gate spawning.
 */
export function isFPSLow() {
  if (!buffer || filled === 0) return false;

  let sum = 0;
  for (let i = 0; i < filled; i++) {
    sum += buffer[i];
  }
  const avgDt = sum / filled;
  const avgFps = 1 / avgDt;

  return avgFps < LOW_FPS_THRESHOLD;
}
