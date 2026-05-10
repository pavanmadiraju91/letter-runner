import { events } from '../core/events.js';
import { STATES } from '../core/state.js';
import { getScore } from '../systems/score.js';
import { getPersonalBest } from '../systems/storage.js';
import { getPalette } from '../core/theme.js';
import { isMusicPlaying } from '../systems/audio.js';
import { isTouchDevice } from '../systems/input.js';

let finalScore = 0;
let personalBest = 0;
let isNewBest = false;
let elapsedTime = 0;

const catSprite = new Image();
catSprite.src = './cat-run.png';

const SCANLINE_GAP = 4;

export function createGameOverScreen() {
  events.on('STATE_CHANGE', ({ state }) => {
    if (state === STATES.GAME_OVER) {
      finalScore = getScore();
      const prevBest = getPersonalBest();
      isNewBest = finalScore > prevBest;
      personalBest = isNewBest ? finalScore : prevBest;
      elapsedTime = 0;
    }
  });
}

export function updateGameOverScreen(dt) {
  elapsedTime += dt;
}

export function renderGameOverScreen(ctx, width, height) {
  const P = getPalette();
  const now = Date.now();
  ctx.save();

  // --- Responsive font sizes ---
  const titleSize = Math.min(48, width * 0.11);
  const scoreSize = Math.min(48, width * 0.1);
  const scoreLabelSize = Math.min(12, width * 0.03);
  const bestSize = Math.min(20, width * 0.05);
  const bestLabelSize = Math.min(16, width * 0.04);
  const retrySize = Math.min(16, width * 0.04);
  const infoSize = Math.min(11, width * 0.028);

  // --- Overlay: fade in from transparent ---
  const overlayAlpha = Math.min(0.88, elapsedTime * 3);
  ctx.fillStyle = '#000000';
  ctx.globalAlpha = overlayAlpha;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;

  // --- Glitch bars (brief, dramatic, first 0.5s only) ---
  if (elapsedTime < 0.5) {
    const glitchIntensity = 1 - elapsedTime * 2;
    ctx.save();
    ctx.globalAlpha = glitchIntensity * 0.6;
    for (let i = 0; i < 5; i++) {
      const barY = Math.random() * height;
      const barH = 2 + Math.random() * 6;
      const offsetX = (Math.random() - 0.5) * 20;
      ctx.fillStyle = Math.random() < 0.5 ? P.MAGENTA : P.CYAN;
      ctx.fillRect(offsetX, barY, width, barH);
    }
    ctx.restore();
  }

  // --- "GAME OVER" with glitch offset on reveal ---
  const titleReveal = Math.min(1, elapsedTime * 4);
  const titleY = height * 0.22;
  const titleText = 'GAME OVER';

  // Chromatic aberration effect (first 0.8s)
  const aberration = Math.max(0, (0.8 - elapsedTime) * 4);
  if (aberration > 0) {
    ctx.save();
    ctx.globalAlpha = titleReveal * 0.3;
    ctx.font = `bold ${titleSize}px 'Arial Black', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Red channel offset
    ctx.fillStyle = '#ff0000';
    ctx.fillText(titleText, width / 2 - aberration, titleY);
    // Blue channel offset
    ctx.fillStyle = '#0066ff';
    ctx.fillText(titleText, width / 2 + aberration, titleY + aberration * 0.5);
    ctx.restore();
  }

  // Main title
  ctx.save();
  ctx.globalAlpha = titleReveal;
  ctx.font = `bold ${titleSize}px 'Arial Black', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = P.MAGENTA;
  ctx.shadowColor = P.MAGENTA;
  ctx.shadowBlur = 15 + Math.sin(now * 0.008) * 5;
  ctx.fillText(titleText, width / 2, titleY);
  ctx.shadowBlur = 30;
  ctx.fillText(titleText, width / 2, titleY);
  ctx.restore();

  // --- Horizontal accent line under title ---
  if (titleReveal >= 1) {
    const lineAlpha = Math.min(1, (elapsedTime - 0.25) * 3);
    ctx.save();
    ctx.globalAlpha = lineAlpha * 0.4;
    ctx.strokeStyle = P.MAGENTA;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const lineW = width * 0.3;
    ctx.moveTo(width / 2 - lineW / 2, titleY + titleSize * 0.6);
    ctx.lineTo(width / 2 + lineW / 2, titleY + titleSize * 0.6);
    ctx.stroke();
    ctx.restore();
  }

  // --- Score (large, centered, reveals after title) ---
  const scoreDelay = 0.4;
  const scoreAlpha = Math.min(1, Math.max(0, (elapsedTime - scoreDelay) * 3));
  const scoreY = height * 0.42;

  if (scoreAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = scoreAlpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Score number (big, white, glowing)
    ctx.font = `bold ${scoreSize}px 'Arial Black', sans-serif`;
    ctx.fillStyle = P.WHITE;
    ctx.shadowColor = P.WHITE;
    ctx.shadowBlur = 6;
    ctx.fillText(String(finalScore), width / 2, scoreY);
    ctx.restore();

    // Label above score
    ctx.save();
    ctx.globalAlpha = scoreAlpha * 0.6;
    ctx.font = `${scoreLabelSize}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = P.MID;
    ctx.fillText('SCORE', width / 2, scoreY - scoreSize * 0.7);
    ctx.restore();
  }

  // --- Personal best / NEW BEST! ---
  const bestDelay = 0.7;
  const bestAlpha = Math.min(1, Math.max(0, (elapsedTime - bestDelay) * 3));
  const bestY = scoreY + Math.min(60, height * 0.08);

  if (bestAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = bestAlpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (isNewBest) {
      const pulse = 0.6 + 0.4 * Math.sin(elapsedTime * 8);
      ctx.globalAlpha = bestAlpha * pulse;
      ctx.font = `bold ${bestSize}px 'Courier New', monospace`;
      ctx.fillStyle = P.BEST_TEXT;
      ctx.shadowColor = P.BEST_TEXT;
      ctx.shadowBlur = 12;
      ctx.fillText('★ NEW HIGH SCORE ★', width / 2, bestY);
    } else {
      ctx.font = `${bestLabelSize}px 'Courier New', monospace`;
      ctx.fillStyle = P.BEST_TEXT;
      ctx.fillText(`BEST: ${personalBest}`, width / 2, bestY);
    }
    ctx.restore();
  }

  // --- Cat sprite (fallen/static, slight tilt) ---
  const catDelay = 0.9;
  const catAlpha = Math.min(0.5, Math.max(0, (elapsedTime - catDelay) * 2));
  const catY = height * 0.62;
  if (catAlpha > 0 && catSprite.complete && catSprite.naturalWidth > 0) {
    const frameCount = 10;
    const frameW = catSprite.width / frameCount;
    const frameH = catSprite.height;
    const drawSize = Math.min(56, width * 0.14);
    ctx.save();
    ctx.globalAlpha = catAlpha;
    ctx.translate(width / 2, catY);
    ctx.rotate(0.15); // slight tilt — fallen
    ctx.drawImage(catSprite, 0, 0, frameW, frameH, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    ctx.restore();
  }

  // --- Retry prompt ---
  const retryDelay = 1.2;
  const retryBase = Math.min(1, Math.max(0, (elapsedTime - retryDelay) * 2));
  if (retryBase > 0) {
    const breathe = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(now * 0.004));
    ctx.save();
    ctx.globalAlpha = retryBase * breathe;
    ctx.font = `bold ${retrySize}px 'Courier New', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = P.WHITE;
    ctx.fillText(isTouchDevice ? '[ TAP TO RETRY ]' : '[ PRESS ANY KEY TO RETRY ]', width / 2, height * 0.76);
    ctx.restore();
  }

  // --- Bottom info ---
  const infoAlpha = Math.min(1, Math.max(0, (elapsedTime - 1.5) * 2));
  if (infoAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = infoAlpha * 0.7;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `${infoSize}px 'Courier New', monospace`;
    ctx.fillStyle = P.LIGHT;
    ctx.fillText(isMusicPlaying() ? '[Tab] Music Off' : '[Tab] Music On', width / 2, height * 0.88);

    ctx.restore();
  }

  // --- Scanlines (very subtle) ---
  ctx.save();
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = '#000000';
  for (let y = 0; y < height; y += SCANLINE_GAP) {
    ctx.fillRect(0, y, width, 1);
  }
  ctx.restore();

  ctx.restore();
}
