import { getPalette } from '../core/theme.js';
import { GAME } from '../config.js';

const STAR_COUNT = 40;
const stars = [];
let initialized = false;

// City skyline uses a long non-repeating sequence via seeded noise
const CITY_LENGTH = 200;
const cityHeights = [];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function init(canvasWidth, canvasHeight) {
  if (initialized) return;
  initialized = true;

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvasWidth * 3,
      y: Math.random() * canvasHeight * 0.7,
      size: Math.random() < 0.2 ? 2 : 1,
      speed: 0.005 + Math.random() * 0.015
    });
  }

  const rng = seededRandom(42);
  for (let i = 0; i < CITY_LENGTH; i++) {
    const base = 10 + rng() * 35;
    const tall = rng() < 0.15 ? base + 20 + rng() * 30 : base;
    cityHeights.push(Math.round(tall));
  }
}

export function createBackground() {
  return { offset: 0 };
}

export function updateBackground(bg, dt, scrollSpeed) {
  bg.offset += scrollSpeed * 0.1 * dt;
}

export function renderBackground(ctx, bg, canvasWidth, canvasHeight) {
  const palette = getPalette();
  const groundY = canvasHeight - GAME.GROUND_HEIGHT;

  init(canvasWidth, canvasHeight);

  // Deep dark background
  ctx.fillStyle = palette.BG;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Subtle stars (very slow parallax)
  ctx.fillStyle = palette.DIM || '#333';
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const x = ((s.x - bg.offset * s.speed) % (canvasWidth * 3) + canvasWidth * 3) % (canvasWidth * 3);
    if (x < canvasWidth) {
      ctx.fillRect(Math.round(x), Math.round(s.y), s.size, s.size);
    }
  }
  ctx.globalAlpha = 1;

  // City skyline (long non-repeating sequence, very subtle)
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = palette.CYAN || '#00ffcc';
  const segW = 40;
  const totalCityWidth = CITY_LENGTH * segW;
  const cityScrollOffset = (bg.offset * 0.2) % totalCityWidth;
  const startSeg = Math.floor(cityScrollOffset / segW);
  const pixelOffset = cityScrollOffset % segW;

  for (let screenX = -pixelOffset, i = 0; screenX < canvasWidth; screenX += segW, i++) {
    const idx = (startSeg + i) % CITY_LENGTH;
    const h = cityHeights[idx];
    ctx.fillRect(Math.round(screenX), groundY - h, segW - 2, h);
  }
  ctx.globalAlpha = 1;

  // THE GROUND LINE — single glowing cyan line
  ctx.save();
  ctx.strokeStyle = palette.CYAN || '#00ffcc';
  ctx.lineWidth = 2;
  ctx.shadowColor = palette.CYAN || '#00ffcc';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvasWidth, groundY);
  ctx.stroke();
  ctx.restore();

  // Subtle zone below the line
  ctx.fillStyle = palette.GROUND_BASE || palette.BG;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(0, groundY + 1, canvasWidth, GAME.GROUND_HEIGHT);
  ctx.globalAlpha = 1;
}
