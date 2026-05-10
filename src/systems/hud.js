import { events } from '../core/events.js';
import { getScore } from '../systems/score.js';
import { getLives } from '../systems/lives.js';
import { getStreak, getComboMultiplier } from '../systems/combo.js';
import { GAME } from '../config.js';
import { getPalette } from '../core/theme.js';

let currentLevel = 1;
let comboPulseTimer = 0;
let scoreMilestoneFlash = 0; // timestamp of last milestone flash

/**
 * Initialize HUD system.
 * Subscribes to LEVEL_UP, GAME_RESTART, and COMBO_UPDATE events.
 */
export function createHUD() {
  events.on('LEVEL_UP', (payload) => {
    currentLevel = payload.level;
  });
  events.on('GAME_RESTART', () => {
    currentLevel = 1;
    comboPulseTimer = 0;
    scoreMilestoneFlash = 0;
  });
  events.on('COMBO_UPDATE', ({ streak }) => {
    if (streak >= 3) {
      comboPulseTimer = performance.now();
    }
  });
  events.on('SCORE_MILESTONE', () => {
    scoreMilestoneFlash = performance.now();
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

  // Score — top-left (with milestone flash)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 20px monospace';
  const milestoneAge = (performance.now() - scoreMilestoneFlash) / 1000;
  if (scoreMilestoneFlash > 0 && milestoneAge < 0.3) {
    // Brief white flash that fades to normal score color over 300ms
    const flashAlpha = 1 - (milestoneAge / 0.3);
    ctx.fillStyle = palette.WHITE;
    ctx.globalAlpha = flashAlpha;
    ctx.fillText('SCORE ' + getScore(), 16, 12);
    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.SCORE_TEXT;
    ctx.fillText('SCORE ' + getScore(), 16, 12);
  } else {
    ctx.fillStyle = palette.SCORE_TEXT;
    ctx.fillText('SCORE ' + getScore(), 16, 12);
  }

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

  // Combo streak display (only when streak >= 3)
  const streak = getStreak();
  if (streak >= 3) {
    const comboMult = getComboMultiplier();
    const elapsed = (performance.now() - comboPulseTimer) / 1000;
    // Pulsing size: oscillates between 1.0 and 1.3
    const pulse = 1.0 + 0.3 * Math.abs(Math.sin(elapsed * 6));
    const baseFontSize = 24;
    const fontSize = Math.round(baseFontSize * pulse);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.fillStyle = palette.YELLOW;
    ctx.fillText(`x${comboMult}`, canvasWidth / 2, 36);

    // Streak count below multiplier
    ctx.font = '12px monospace';
    ctx.fillStyle = palette.DIM;
    ctx.fillText(`${streak} streak`, canvasWidth / 2, 36 + fontSize + 2);
  }

  ctx.restore();
}
