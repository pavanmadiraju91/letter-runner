import { getPalette } from '../core/theme.js';
import { GAME, SPEED } from '../config.js';
import { getCurrentSpeed } from '../systems/difficulty.js';

const STAR_COUNT = 40;
const stars = [];
let initialized = false;

// City skyline uses a long non-repeating sequence via seeded noise
const CITY_LENGTH = 200;
const cityHeights = [];

// Speed lines for high velocity effect
const MAX_SPEED_LINES = 12;
const speedLines = [];

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

  // Pre-allocate speed lines
  for (let i = 0; i < MAX_SPEED_LINES; i++) {
    speedLines.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight * 0.6 + canvasHeight * 0.1, // avoid top HUD and bottom ground
      length: 30 + Math.random() * 60,
      speed: 400 + Math.random() * 300,
    });
  }
}

export function createBackground() {
  return { offset: 0 };
}

export function updateBackground(bg, dt, scrollSpeed) {
  bg.offset += scrollSpeed * 0.1 * dt;

  // Update speed lines position
  const speed = getCurrentSpeed();
  const speedRatio = (speed - SPEED.BASE_SPEED) / (SPEED.MAX_SPEED - SPEED.BASE_SPEED);
  if (speedRatio > 0.7) {
    for (let i = 0; i < speedLines.length; i++) {
      speedLines[i].x -= speedLines[i].speed * dt;
      if (speedLines[i].x + speedLines[i].length < 0) {
        // Reset to right edge
        speedLines[i].x = 800 + Math.random() * 200; // offscreen right
        speedLines[i].y = Math.random() * 400 + 40;
      }
    }
  }
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

  // Speed lines at high velocity (>70% of max speed)
  const speed = getCurrentSpeed();
  const speedRatio = (speed - SPEED.BASE_SPEED) / (SPEED.MAX_SPEED - SPEED.BASE_SPEED);
  if (speedRatio > 0.7) {
    // Number of visible lines scales from 0 to MAX_SPEED_LINES as speed approaches max
    const intensity = (speedRatio - 0.7) / 0.3; // 0.0 to 1.0
    const visibleCount = Math.floor(intensity * MAX_SPEED_LINES);
    ctx.strokeStyle = palette.CYAN || '#00ffcc';
    ctx.lineWidth = 1;
    ctx.globalAlpha = intensity * 0.25; // subtle, max 25% opacity
    for (let i = 0; i < visibleCount; i++) {
      const line = speedLines[i];
      if (line.x < canvasWidth && line.x + line.length > 0) {
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x + line.length, line.y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
}
