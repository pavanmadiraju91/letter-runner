import { events } from '../core/events.js';
import { getScore } from '../systems/score.js';
import { getLives } from '../systems/lives.js';
import { GAME } from '../config.js';
import { getPalette } from '../core/theme.js';

let currentLevel = 1;

/**
 * Initialize HUD system.
 * Subscribes to LEVEL_UP and GAME_RESTART events.
 */
export function createHUD() {
  events.on('LEVEL_UP', (payload) => {
    currentLevel = payload.level;
  });
  events.on('GAME_RESTART', () => {
    currentLevel = 1;
  });
}

/**
 * Draw a heart shape at (x, y) with given size and fill color.
 */
function drawHeart(ctx, x, y, size, color) {
  const s = size / 2;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.4);
  // Left arc
  ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.4);
  // Bottom-left to tip
  ctx.bezierCurveTo(x - s, y + s * 0.9, x, y + s * 1.2, x, y + s * 1.5);
  // Bottom-right from tip
  ctx.bezierCurveTo(x, y + s * 1.2, x + s, y + s * 0.9, x + s, y + s * 0.4);
  // Right arc
  ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.4);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Render the HUD: score (top-left), level (top-center), lives (top-right).
 * Call after entity rendering but before overlays.
 */
export function renderHUD(ctx, canvasWidth) {
  const palette = getPalette();
  ctx.save();

  // Score — top-left
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = palette.SCORE_TEXT;
  ctx.fillText('SCORE ' + getScore(), 16, 12);

  // Level — top-center
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.LEVEL_TEXT;
  ctx.fillText('LV ' + currentLevel, canvasWidth / 2, 12);

  // Lives — top-right as heart icons
  const heartSize = 14;
  const spacing = 22;
  const startX = canvasWidth - 16;
  const heartY = 10;
  const totalLives = GAME.STARTING_LIVES;
  const remaining = getLives();

  for (let i = 0; i < totalLives; i++) {
    const hx = startX - (i * spacing);
    const color = i < remaining ? palette.HEART_FULL : palette.HEART_EMPTY;
    drawHeart(ctx, hx, heartY, heartSize, color);
  }

  ctx.restore();
}
