import { events } from '../core/events.js';
import { STATES } from '../core/state.js';
import { getScore } from '../systems/score.js';
import { getPersonalBest } from '../systems/storage.js';
import { getPalette } from '../core/theme.js';
import { isMusicPlaying } from '../systems/audio.js';

let finalScore = 0;
let personalBest = 0;
let isNewBest = false;
let elapsedTime = 0;

// Load cat sprite for game over display
const catSprite = new Image();
catSprite.src = './cat-run.png';

/**
 * Initialize the game over screen system.
 * Subscribes to STATE_CHANGE events.
 */
export function createGameOverScreen() {
  events.on('STATE_CHANGE', ({ state }) => {
    if (state === STATES.GAME_OVER) {
      finalScore = getScore();
      const prevBest = getPersonalBest();
      // Check BEFORE storage updates (storage.js may update best on same event)
      isNewBest = finalScore > prevBest;
      personalBest = isNewBest ? finalScore : prevBest;
      elapsedTime = 0;
    }
  });
}

/**
 * Update game over screen (advance timer for animations).
 * @param {number} dt - delta time in seconds
 */
export function updateGameOverScreen(dt) {
  elapsedTime += dt;
}

/**
 * Render the full game over screen with polished indie game aesthetics.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width - canvas width
 * @param {number} height - canvas height
 */
export function renderGameOverScreen(ctx, width, height) {
  const P = getPalette();
  ctx.save();

  // Dark semi-transparent overlay
  ctx.fillStyle = P.PANEL;
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // --- "GAME OVER" title with magenta/red glow ---
  const titleY = height * 0.20;
  ctx.save();
  ctx.font = "bold 48px 'Arial Black', 'Courier New', monospace";
  ctx.fillStyle = P.MAGENTA;
  ctx.shadowColor = P.MAGENTA;
  ctx.shadowBlur = 15;
  ctx.fillText('GAME OVER', width / 2, titleY);
  // Double-draw for stronger glow
  ctx.shadowBlur = 30;
  ctx.fillText('GAME OVER', width / 2, titleY);
  ctx.restore();

  // --- Score section at 40% ---
  const scoreY = height * 0.40;
  ctx.save();
  ctx.font = "bold 36px 'Arial Black', 'Courier New', monospace";
  ctx.fillStyle = P.WHITE;
  ctx.shadowColor = P.WHITE;
  ctx.shadowBlur = 4;
  ctx.fillText('SCORE: ' + finalScore, width / 2, scoreY);
  ctx.restore();

  // --- Personal best below score ---
  ctx.save();
  ctx.font = "bold 20px 'Courier New', monospace";
  ctx.fillStyle = P.BEST_TEXT;
  ctx.fillText('BEST: ' + personalBest, width / 2, scoreY + 40);
  ctx.restore();

  // --- Delta indicator ---
  const deltaY = scoreY + 68;
  const delta = finalScore - personalBest;
  if (isNewBest) {
    // NEW BEST! pulsing in gold
    const pulse = 0.6 + 0.4 * Math.sin(elapsedTime * 6);
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.fillStyle = P.BEST_TEXT;
    ctx.shadowColor = P.BEST_TEXT;
    ctx.shadowBlur = 8;
    ctx.fillText('NEW BEST!', width / 2, deltaY);
    ctx.restore();
  } else if (delta < 0) {
    ctx.save();
    ctx.font = "16px 'Courier New', monospace";
    ctx.fillStyle = P.MAGENTA;
    ctx.fillText(String(delta), width / 2, deltaY);
    ctx.restore();
  }

  // --- Cat sprite (idle/dead look — use frame 0, slightly darkened) ---
  const catY = height * 0.58;
  if (catSprite.complete && catSprite.naturalWidth > 0) {
    const frameCount = 10;
    const frameW = catSprite.width / frameCount;
    const frameH = catSprite.height;
    const drawSize = 64;
    ctx.save();
    ctx.globalAlpha = 0.6; // Darker/dimmer to suggest defeat
    ctx.drawImage(
      catSprite,
      0, 0, frameW, frameH, // frame 0 (idle/static)
      width / 2 - drawSize / 2, catY - drawSize / 2,
      drawSize, drawSize
    );
    ctx.restore();
  }

  // --- "Press any key to play again" with opacity pulse ---
  const promptY = height * 0.72;
  const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(elapsedTime * 4));
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.font = "18px 'Courier New', monospace";
  ctx.fillStyle = P.WHITE;
  ctx.fillText('Press any key to play again', width / 2, promptY);
  ctx.restore();

  // --- Music hint at bottom ---
  ctx.save();
  ctx.font = "11px 'Courier New', monospace";
  ctx.fillStyle = P.DIM;
  const musicHint = isMusicPlaying() ? '[Tab] Music Off' : '[Tab] Music On';
  ctx.fillText(musicHint, width / 2, height * 0.90);
  ctx.restore();

  ctx.restore();
}
