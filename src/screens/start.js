import { getPalette, getBG } from '../core/theme.js';
import { getPersonalBest } from '../systems/storage.js';
import { isMusicPlaying } from '../systems/audio.js';

/**
 * Render the start/menu screen.
 * Shows game logo, tagline, pulsing "press any key" prompt, instructions, and personal best.
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

  // Title "LETTER RUNNER" — large, bold, with strong glow
  ctx.save();
  ctx.fillStyle = palette.CYAN;
  ctx.shadowColor = palette.CYAN;
  ctx.shadowBlur = 25;
  ctx.font = 'bold 54px \'Courier New\', monospace';
  ctx.fillText('LETTER RUNNER', width / 2, height * 0.25);
  // Double-draw for stronger glow
  ctx.shadowBlur = 12;
  ctx.fillText('LETTER RUNNER', width / 2, height * 0.25);
  ctx.restore();

  // Subtitle "Type to survive"
  ctx.fillStyle = palette.MID;
  ctx.font = '18px \'Courier New\', monospace';
  ctx.fillText('Type to survive', width / 2, height * 0.25 + 45);

  // Instruction text (dim)
  ctx.fillStyle = palette.DIM;
  ctx.font = '13px \'Courier New\', monospace';
  ctx.fillText('Type the letters before they reach you', width / 2, height * 0.48);

  // Pulsing "Press any key to start" — smooth opacity oscillation
  const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(Date.now() * 0.004));
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = palette.WHITE;
  ctx.font = '20px \'Courier New\', monospace';
  ctx.fillText('Press any key to start', width / 2, height * 0.62);
  ctx.restore();

  // Personal best
  const best = getPersonalBest();
  ctx.fillStyle = palette.BEST_TEXT;
  ctx.font = '16px \'Courier New\', monospace';
  ctx.fillText(best > 0 ? `BEST: ${best}` : 'BEST: ---', width / 2, height * 0.76);

  // Music hint on start screen
  ctx.fillStyle = palette.DIM;
  ctx.font = '11px \'Courier New\', monospace';
  const musicHint = isMusicPlaying() ? '[Tab] Music Off' : '[Tab] Music On';
  ctx.fillText(musicHint, width / 2, height * 0.88);
}
