import { getTheme, getPalette } from '../core/theme.js';
import { events } from '../core/events.js';
import { GAME } from '../config.js';

const bgDark = new Image();
bgDark.src = './bg-dark.png';
const bgLight = new Image();
bgLight.src = './bg-light.png';

function getCurrentBg() {
  return getTheme() === 'dark' ? bgDark : bgLight;
}

export function createBackground() {
  const bg = { offset: 0 };
  events.on('THEME_CHANGE', () => { bg.offset = 0; });
  return bg;
}

export function updateBackground(bg, dt, scrollSpeed) {
  const img = getCurrentBg();
  bg.offset = (bg.offset + scrollSpeed * 0.1 * dt) % (img.width || 1);
}

export function renderBackground(ctx, bg, canvasWidth, canvasHeight) {
  const palette = getPalette();
  const groundY = canvasHeight - GAME.GROUND_HEIGHT;

  // Fill entire canvas with ground color first
  ctx.fillStyle = palette.BG;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw background image in the SKY zone only (above ground line)
  const img = getCurrentBg();
  if (img.complete && img.width) {
    const imgW = img.width;
    const imgH = img.height;
    // Scale image to fill sky area height, crop bottom (ground detail) from image
    const skyHeight = groundY;
    // Use top 75% of the image (sky, mountains, clouds) — skip bottom terrain
    const srcH = imgH * 0.75;
    const scale = skyHeight / srcH;
    const drawW = imgW * scale;
    const startX = -(bg.offset * scale) % drawW;

    for (let x = startX; x < canvasWidth; x += drawW) {
      ctx.drawImage(img, 0, 0, imgW, srcH, x, 0, drawW, skyHeight);
    }
  }

  // Draw clean ground zone
  ctx.fillStyle = palette.GROUND_BASE || palette.BG;
  ctx.fillRect(0, groundY, canvasWidth, GAME.GROUND_HEIGHT);

  // Ground line (horizon)
  ctx.strokeStyle = palette.GROUND_LINE || palette.DIM;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvasWidth, groundY);
  ctx.stroke();

  // Simple scrolling texture dots on ground
  ctx.fillStyle = palette.DIM || '#3a3a4a';
  const dotSpacing = 80;
  const offsetX = -(bg.offset * 0.3) % dotSpacing;
  for (let x = offsetX; x < canvasWidth; x += dotSpacing) {
    ctx.fillRect(Math.round(x), groundY + 12, 2, 2);
    ctx.fillRect(Math.round(x + 30), groundY + 24, 3, 2);
  }
}
