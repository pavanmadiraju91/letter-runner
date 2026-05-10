import { events } from '../core/events.js';
import { STATES } from '../core/state.js';
import { getScore } from '../systems/score.js';
import { getPersonalBest } from '../systems/storage.js';
import { COLORS } from '../config.js';

let finalScore = 0;
let personalBest = 0;
let flashTimer = 0;

/**
 * Initialize the game over screen system.
 * Subscribes to STATE_CHANGE events.
 */
export function createGameOverScreen() {
  events.on('STATE_CHANGE', ({ state }) => {
    if (state === STATES.GAME_OVER) {
      finalScore = getScore();
      personalBest = getPersonalBest();
      flashTimer = 0;
    }
  });
}

/**
 * Update game over screen (advance flash timer).
 * @param {number} dt - delta time in seconds
 */
export function updateGameOverScreen(dt) {
  flashTimer += dt;
}

/**
 * Render the full game over screen.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width - canvas width
 * @param {number} height - canvas height
 */
export function renderGameOverScreen(ctx, width, height) {
  ctx.save();

  // Dark overlay
  ctx.fillStyle = COLORS.PALETTE.PANEL;
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // GAME OVER title with magenta glow
  ctx.fillStyle = COLORS.PALETTE.MAGENTA;
  ctx.shadowColor = COLORS.PALETTE.MAGENTA;
  ctx.shadowBlur = 15;
  ctx.font = 'bold 36px monospace';
  ctx.fillText('GAME OVER', width / 2, height * 0.15);
  ctx.shadowBlur = 0;

  // Final score
  ctx.fillStyle = COLORS.PALETTE.WHITE;
  ctx.font = 'bold 28px monospace';
  ctx.fillText('SCORE: ' + finalScore, width / 2, height * 0.35);

  // Personal best and delta
  ctx.font = '18px monospace';
  ctx.fillStyle = COLORS.PALETTE.BEST_TEXT;
  ctx.fillText('BEST: ' + personalBest, width / 2, height * 0.45);

  const delta = finalScore - personalBest;
  if (delta > 0) {
    ctx.fillStyle = COLORS.PALETTE.GREEN;
    ctx.fillText('+' + delta + ' NEW BEST!', width / 2, height * 0.52);
  } else if (delta < 0) {
    ctx.fillStyle = COLORS.PALETTE.MAGENTA;
    ctx.fillText(String(delta), width / 2, height * 0.52);
  }

  // Play again prompt (blinking)
  const show = Math.floor(flashTimer * 2) % 2 === 0;
  if (show) {
    ctx.fillStyle = COLORS.PALETTE.WHITE;
    ctx.font = '18px monospace';
    ctx.fillText('Press any key to play again', width / 2, height * 0.75);
  }

  ctx.restore();
}
