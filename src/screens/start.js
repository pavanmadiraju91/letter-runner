import { getPalette, getBG } from '../core/theme.js';
import { getPersonalBest } from '../systems/storage.js';

/**
 * Render the start/menu screen.
 * Shows game logo, tagline, blinking "press any key" prompt, and personal best.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width - canvas width
 * @param {number} height - canvas height
 */
export function renderStartScreen(ctx, width, height) {
  const palette = getPalette();

  // Background
  ctx.fillStyle = getBG();
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Title with neon cyan glow
  ctx.fillStyle = palette.CYAN;
  ctx.shadowColor = palette.CYAN;
  ctx.shadowBlur = 15;
  ctx.font = 'bold 42px \'Courier New\', monospace';
  ctx.fillText('LETTER RUNNER', width / 2, height * 0.3);
  ctx.shadowBlur = 0;

  // Tagline
  ctx.fillStyle = palette.MID;
  ctx.font = '18px \'Courier New\', monospace';
  ctx.fillText('Type to survive', width / 2, height * 0.3 + 40);

  // Blinking prompt (toggles every 600ms)
  if (Math.floor(Date.now() / 600) % 2 === 0) {
    ctx.fillStyle = palette.WHITE;
    ctx.font = '20px \'Courier New\', monospace';
    ctx.fillText('Press any key to start', width / 2, height * 0.65);
  }

  // Personal best
  const best = getPersonalBest();
  ctx.fillStyle = palette.BEST_TEXT;
  ctx.font = '16px \'Courier New\', monospace';
  ctx.fillText(best > 0 ? `BEST: ${best}` : 'BEST: ---', width / 2, height * 0.8);
}
