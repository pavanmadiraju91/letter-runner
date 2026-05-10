import { getPalette, getBG } from '../core/theme.js';
import { getPersonalBest } from '../systems/storage.js';
import { isMusicPlaying } from '../systems/audio.js';
import { isTouchDevice } from '../systems/input.js';

const catSprite = new Image();
catSprite.src = './cat-run.png';

let startTime = 0;
let initialized = false;

// Scanline data (pre-computed for performance)
const SCANLINE_GAP = 4;

// Decorative particles — small dots that drift slowly
const particles = [];
const PARTICLE_COUNT = 30;

function initParticles(w, h) {
  particles.length = 0;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 8,
      vy: -5 - Math.random() * 15,
      size: 1 + Math.random() * 2,
      alpha: 0.1 + Math.random() * 0.3,
      color: Math.random() < 0.5 ? '#00ffcc' : (Math.random() < 0.5 ? '#ff2266' : '#ffcc00')
    });
  }
}

export function renderStartScreen(ctx, width, height) {
  const P = getPalette();
  const now = Date.now();

  if (!initialized) {
    startTime = now;
    initParticles(width, height);
    initialized = true;
  }

  const elapsed = (now - startTime) / 1000; // seconds since screen opened

  // Background
  ctx.fillStyle = getBG();
  ctx.fillRect(0, 0, width, height);

  // --- Drifting particles ---
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;
    if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    ctx.globalAlpha = p.alpha * (0.5 + 0.5 * Math.sin(now * 0.003 + i));
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // --- Horizontal accent line (left-biased, not centered) ---
  const lineY = height * 0.44;
  const lineReveal = Math.min(1, elapsed * 0.8);
  ctx.save();
  ctx.strokeStyle = P.CYAN;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.4 * lineReveal;
  ctx.beginPath();
  ctx.moveTo(width * 0.05, lineY);
  ctx.lineTo(width * 0.05 + (width * 0.9) * lineReveal, lineY);
  ctx.stroke();
  ctx.restore();

  // --- Title: Character-by-character reveal with staggered glow ---
  const title = 'LETTER RUNNER';
  const titleY = height * 0.28;
  const charDelay = 0.06; // seconds between each char appearing
  const titleFont = Math.min(64, width * 0.055);

  ctx.save();
  ctx.font = `bold ${titleFont}px 'Arial Black', sans-serif`;
  ctx.textBaseline = 'middle';

  // Measure total width for left-aligned positioning
  const totalWidth = ctx.measureText(title).width;
  const startX = (width - totalWidth) / 2;

  let xCursor = startX;
  for (let i = 0; i < title.length; i++) {
    const charElapsed = elapsed - i * charDelay;
    if (charElapsed < 0) break;

    const charAlpha = Math.min(1, charElapsed * 3);
    const glowIntensity = Math.max(0, 1 - charElapsed * 2); // brief flash then settles

    ctx.save();
    ctx.globalAlpha = charAlpha;

    // Glow layer (intense on reveal, then subtle)
    ctx.shadowColor = P.CYAN;
    ctx.shadowBlur = 8 + glowIntensity * 30;
    ctx.fillStyle = P.WHITE;
    ctx.textAlign = 'left';
    ctx.fillText(title[i], xCursor, titleY);

    // Second pass for extra glow on reveal
    if (glowIntensity > 0.1) {
      ctx.shadowBlur = glowIntensity * 50;
      ctx.fillText(title[i], xCursor, titleY);
    }
    ctx.restore();

    xCursor += ctx.measureText(title[i]).width;
  }
  ctx.restore();

  // --- Subtitle (appears after title is done) ---
  const subtitleDelay = title.length * charDelay + 0.3;
  const subtitleAlpha = Math.min(1, Math.max(0, (elapsed - subtitleDelay) * 2));
  if (subtitleAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = subtitleAlpha;
    ctx.font = "16px 'Courier New', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = P.MID;
    ctx.letterSpacing = '3px';
    ctx.fillText('T Y P E   T O   S U R V I V E', width / 2, titleY + titleFont * 0.7);
    ctx.restore();
  }

  // --- Cat sprite with glow halo (appears after subtitle) ---
  const catDelay = subtitleDelay + 0.5;
  const catAlpha = Math.min(1, Math.max(0, (elapsed - catDelay) * 2));
  const catY = height * 0.54;
  if (catAlpha > 0 && catSprite.complete && catSprite.naturalWidth > 0) {
    const frameCount = 10;
    const frameW = catSprite.width / frameCount;
    const frameH = catSprite.height;
    const frameIdx = Math.floor((now * 0.005) % frameCount);
    const srcX = frameIdx * frameW;
    const drawSize = 72;
    const dx = width / 2 - drawSize / 2;
    const dy = catY - drawSize / 2;

    // Glow halo behind cat
    ctx.save();
    ctx.globalAlpha = catAlpha * 0.2;
    ctx.shadowColor = P.CYAN;
    ctx.shadowBlur = 25;
    ctx.fillStyle = P.CYAN;
    ctx.beginPath();
    ctx.arc(width / 2, catY, drawSize * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Cat sprite
    ctx.save();
    ctx.globalAlpha = catAlpha;
    ctx.drawImage(catSprite, srcX, 0, frameW, frameH, dx, dy, drawSize, drawSize);
    ctx.restore();
  }

  // --- "Press any key" prompt (appears last, with breathing pulse) ---
  const promptDelay = catDelay + 0.6;
  const promptBase = Math.min(1, Math.max(0, (elapsed - promptDelay) * 2));
  if (promptBase > 0) {
    const breathe = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(now * 0.004));
    ctx.save();
    ctx.globalAlpha = promptBase * breathe;
    ctx.font = "bold 18px 'Courier New', monospace";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = P.WHITE;
    ctx.shadowColor = P.CYAN;
    ctx.shadowBlur = 6;
    ctx.fillText(isTouchDevice ? '[ TAP TO START ]' : '[ PRESS ANY KEY ]', width / 2, height * 0.70);
    ctx.restore();
  }

  // --- Bottom info bar (personal best + music + repo) ---
  const infoAlpha = Math.min(1, Math.max(0, (elapsed - promptDelay - 0.3) * 2));
  if (infoAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = infoAlpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Personal best
    const best = getPersonalBest();
    ctx.font = "bold 14px 'Courier New', monospace";
    ctx.fillStyle = P.BEST_TEXT;
    ctx.fillText(best > 0 ? `HIGH SCORE: ${best}` : '', width / 2, height * 0.82);

    // Music hint
    ctx.font = "12px 'Courier New', monospace";
    ctx.fillStyle = P.LIGHT;
    ctx.fillText(isMusicPlaying() ? '[Tab] Music Off' : '[Tab] Music On', width / 2, height * 0.89);

    ctx.restore();
  }

  // --- Subtle scanlines overlay (very faint) ---
  ctx.save();
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = '#000000';
  for (let y = 0; y < height; y += SCANLINE_GAP) {
    ctx.fillRect(0, y, width, 1);
  }
  ctx.restore();
}
