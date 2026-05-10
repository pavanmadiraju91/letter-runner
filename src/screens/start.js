import { getPalette, getBG } from '../core/theme.js';
import { getPersonalBest } from '../systems/storage.js';
import { isMusicPlaying } from '../systems/audio.js';

// Floating background letters for ambience
const floatingLetters = [];
const LETTER_COUNT = 6;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function initFloatingLetters(width, height) {
  floatingLetters.length = 0;
  for (let i = 0; i < LETTER_COUNT; i++) {
    floatingLetters.push({
      char: ALPHABET[Math.floor(Math.random() * 26)],
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 15 + Math.random() * 20, // slow upward drift
      size: 14 + Math.random() * 12,
      alpha: 0.08 + Math.random() * 0.12
    });
  }
}

let lettersInitialized = false;

// Load cat sprite for start screen display
const catSprite = new Image();
catSprite.src = './cat-run.png';

/**
 * Render the start/menu screen.
 * Polished indie game landing: neon glow, floating letters, cat sprite, pulsing prompt.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width - canvas width
 * @param {number} height - canvas height
 */
export function renderStartScreen(ctx, width, height) {
  const P = getPalette();

  // Initialize floating letters once (or on resize)
  if (!lettersInitialized) {
    initFloatingLetters(width, height);
    lettersInitialized = true;
  }

  // Background (space bg rendered behind by main.js, but fill as fallback)
  ctx.fillStyle = getBG();
  ctx.fillRect(0, 0, width, height);

  // --- Floating background letters (decorative bubbles) ---
  const now = Date.now();
  for (let i = 0; i < floatingLetters.length; i++) {
    const fl = floatingLetters[i];
    // Drift upward, wrap around
    fl.y -= fl.speed * 0.016; // ~1 frame at 60fps
    if (fl.y < -30) {
      fl.y = height + 20;
      fl.x = Math.random() * width;
      fl.char = ALPHABET[Math.floor(Math.random() * 26)];
    }
    // Gentle horizontal sway
    const sway = Math.sin(now * 0.001 + i * 1.7) * 8;

    ctx.save();
    ctx.globalAlpha = fl.alpha;
    ctx.font = `${Math.round(fl.size)}px 'Arial Black', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = P.CYAN;
    ctx.fillText(fl.char, fl.x + sway, fl.y);
    ctx.restore();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // --- Title "LETTER RUNNER" ---
  const titleY = height * 0.3;
  ctx.save();
  ctx.font = "bold 56px 'Arial Black', 'Courier New', monospace";
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = P.CYAN;
  ctx.shadowBlur = 20;
  ctx.fillText('LETTER RUNNER', width / 2, titleY);
  // Double-draw for intense glow
  ctx.shadowBlur = 40;
  ctx.fillText('LETTER RUNNER', width / 2, titleY);
  ctx.restore();

  // --- Subtitle "Type to survive" ---
  ctx.save();
  ctx.font = "18px 'Courier New', monospace";
  ctx.fillStyle = P.MID;
  ctx.fillText('Type to survive', width / 2, titleY + 38);
  ctx.restore();

  // --- Cat sprite (static run frame in center) ---
  const catY = height * 0.5;
  if (catSprite.complete && catSprite.naturalWidth > 0) {
    const frameCount = 10;
    const frameW = catSprite.width / frameCount;
    const frameH = catSprite.height;
    // Use frame 2 for a nice pose
    const frameIdx = Math.floor((now * 0.004) % frameCount);
    const srcX = frameIdx * frameW;
    const drawSize = 80;
    ctx.drawImage(
      catSprite,
      srcX, 0, frameW, frameH,
      width / 2 - drawSize / 2, catY - drawSize / 2,
      drawSize, drawSize
    );
  }

  // --- "Press any key to start" with opacity pulse ---
  const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(now * 0.004));
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.font = "20px 'Courier New', monospace";
  ctx.fillStyle = P.WHITE;
  ctx.fillText('Press any key to start', width / 2, height * 0.66);
  ctx.restore();

  // --- Personal best in gold ---
  const best = getPersonalBest();
  ctx.save();
  ctx.font = "bold 16px 'Courier New', monospace";
  ctx.fillStyle = P.BEST_TEXT;
  ctx.fillText(best > 0 ? `BEST: ${best}` : 'BEST: ---', width / 2, height * 0.80);
  ctx.restore();

  // --- Music hint at bottom center (visible) ---
  ctx.save();
  ctx.font = "14px 'Courier New', monospace";
  ctx.fillStyle = P.MID;
  const musicHint = isMusicPlaying() ? '[Tab] Music Off' : '[Tab] Music On';
  ctx.fillText(musicHint, width / 2, height * 0.89);
  ctx.restore();

  // --- GitHub repo link ---
  ctx.save();
  ctx.font = "11px 'Courier New', monospace";
  ctx.fillStyle = P.DIM;
  ctx.fillText('github.com/pavanmadiraju91/letter-runner', width / 2, height * 0.95);
  ctx.restore();
}
