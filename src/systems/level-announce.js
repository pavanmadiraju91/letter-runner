import { events } from '../core/events.js';

let active = false;
let timer = 0;
let level = 0;
const DURATION = 1.5;

/**
 * Initialize the level announcement system.
 * Subscribes to LEVEL_UP to trigger announcement overlay.
 * Subscribes to GAME_RESTART to cancel any in-progress announcement.
 */
export function createLevelAnnounce() {
  events.on('LEVEL_UP', (payload) => {
    active = true;
    timer = DURATION;
    level = payload.level;
  });

  events.on('GAME_RESTART', () => {
    active = false;
    timer = 0;
  });
}

/**
 * Update announcement timer. Deactivates when timer expires.
 * @param {number} dt - Delta time in seconds
 */
export function updateLevelAnnounce(dt) {
  if (!active) return;
  timer -= dt;
  if (timer <= 0) {
    active = false;
  }
}

/**
 * Render the level-up announcement overlay.
 * Displays "LEVEL X" centered with fading alpha and glow effect.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export function renderLevelAnnounce(ctx, width, height) {
  if (!active) return;

  // Calculate alpha with quadratic ease-out (snappier fade)
  let alpha = timer / DURATION;
  alpha = alpha * alpha;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#00ffcc';
  ctx.shadowBlur = 20;
  ctx.font = 'bold 64px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LEVEL ' + level, width / 2, height / 2);
  ctx.restore();
}
