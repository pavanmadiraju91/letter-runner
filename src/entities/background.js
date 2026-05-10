// Parallax background — tiles bg image horizontally, scrolls at 10% of game speed
// Theme-aware: switches between bg-dark.png and bg-light.png

import { getTheme } from '../core/theme.js';
import { events } from '../core/events.js';

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
  const img = getCurrentBg();
  if (!img.complete || !img.width) return;

  const imgW = img.width;
  const imgH = img.height;
  // Scale to fill canvas height
  const scale = canvasHeight / imgH;
  const drawW = imgW * scale;
  const startX = -(bg.offset * scale) % drawW;

  for (let x = startX; x < canvasWidth; x += drawW) {
    ctx.drawImage(img, x, 0, drawW, canvasHeight);
  }
}
