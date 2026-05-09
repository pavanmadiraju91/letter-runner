import { COLORS } from '../config.js';
import { getPersonalBest } from '../systems/storage.js';

/**
 * Render the start/menu screen.
 * Shows game logo, tagline, blinking "press any key" prompt, and personal best.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width - canvas width
 * @param {number} height - canvas height
 */
export function renderStartScreen(ctx, width, height) {
  // Background
  ctx.fillStyle = COLORS.BG;
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px monospace';
  ctx.fillText('LETTER RUNNER', width / 2, height * 0.3);

  // Tagline
  ctx.fillStyle = '#888888';
  ctx.font = '18px monospace';
  ctx.fillText('Type to survive', width / 2, height * 0.3 + 40);

  // Blinking prompt (toggles every 600ms)
  if (Math.floor(Date.now() / 600) % 2 === 0) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px monospace';
    ctx.fillText('Press any key to start', width / 2, height * 0.65);
  }

  // Personal best
  const best = getPersonalBest();
  ctx.fillStyle = '#ffcc00';
  ctx.font = '16px monospace';
  ctx.fillText(best > 0 ? `BEST: ${best}` : 'BEST: ---', width / 2, height * 0.8);
}
