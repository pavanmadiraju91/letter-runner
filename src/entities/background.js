import { getPalette } from '../core/theme.js';
import { GAME, SPEED, getGroundHeight } from '../config.js';
import { getCurrentSpeed } from '../systems/difficulty.js';

const STAR_COUNT = 60;
const COLORED_STAR_COUNT = 30;
const stars = [];
const coloredStars = [];

// Nebula blobs (large semi-transparent gradient circles)
const nebulae = [];

// Speed lines for high velocity effect
const MAX_SPEED_LINES = 12;
const speedLines = [];

let initialized = false;

function init(canvasWidth, canvasHeight) {
  if (initialized) return;
  initialized = true;

  // Regular white stars
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvasWidth * 3,
      y: Math.random() * canvasHeight * 0.7,
      size: Math.random() < 0.2 ? 2 : 1,
      speed: 0.005 + Math.random() * 0.015
    });
  }

  // Colored stars (vivid blue, purple, red)
  const starColors = [
    'rgba(120, 170, 255, 0.8)',  // blue
    'rgba(200, 120, 255, 0.7)',  // purple
    'rgba(255, 120, 140, 0.7)',  // red
    'rgba(100, 220, 255, 0.7)',  // cyan-blue
    'rgba(220, 100, 255, 0.7)',  // violet
    'rgba(255, 200, 100, 0.6)',  // warm gold
  ];
  for (let i = 0; i < COLORED_STAR_COUNT; i++) {
    coloredStars.push({
      x: Math.random() * canvasWidth * 3,
      y: Math.random() * canvasHeight * 0.7,
      size: Math.random() < 0.3 ? 2 : 1.5,
      speed: 0.003 + Math.random() * 0.012,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      twinkleOffset: Math.random() * Math.PI * 2
    });
  }

  // Nebula blobs — visible, richly saturated gradient circles
  nebulae.push(
    { x: canvasWidth * 0.2, y: canvasHeight * 0.3, radius: 140, color: 'rgba(140, 50, 220, 1)', alpha: 0.08, speed: 0.002 },
    { x: canvasWidth * 0.7, y: canvasHeight * 0.5, radius: 170, color: 'rgba(30, 60, 180, 1)', alpha: 0.09, speed: 0.001 },
    { x: canvasWidth * 0.5, y: canvasHeight * 0.15, radius: 120, color: 'rgba(120, 30, 200, 1)', alpha: 0.07, speed: 0.003 },
    { x: canvasWidth * 0.9, y: canvasHeight * 0.4, radius: 100, color: 'rgba(60, 30, 160, 1)', alpha: 0.06, speed: 0.0015 }
  );

  // Pre-allocate speed lines
  for (let i = 0; i < MAX_SPEED_LINES; i++) {
    speedLines.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight * 0.6 + canvasHeight * 0.1,
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
  const groundY = canvasHeight - getGroundHeight(canvasHeight);

  init(canvasWidth, canvasHeight);

  // Deep dark background with subtle vertical gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  bgGrad.addColorStop(0, '#080810');
  bgGrad.addColorStop(0.6, '#0a0a14');
  bgGrad.addColorStop(1, '#0e0e1c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Nebula blobs — visible large gradient circles with slow parallax
  for (let i = 0; i < nebulae.length; i++) {
    const neb = nebulae[i];
    const nx = ((neb.x - bg.offset * neb.speed) % (canvasWidth + neb.radius * 2) + canvasWidth + neb.radius * 2) % (canvasWidth + neb.radius * 2) - neb.radius;
    ctx.save();
    ctx.globalAlpha = neb.alpha;
    const grad = ctx.createRadialGradient(nx, neb.y, 0, nx, neb.y, neb.radius);
    grad.addColorStop(0, neb.color);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(nx, neb.y, neb.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Regular white stars (very slow parallax)
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.6;
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const x = ((s.x - bg.offset * s.speed) % (canvasWidth * 3) + canvasWidth * 3) % (canvasWidth * 3);
    if (x < canvasWidth) {
      ctx.fillRect(Math.round(x), Math.round(s.y), s.size, s.size);
    }
  }
  ctx.globalAlpha = 1;

  // Colored stars with subtle twinkle
  const now = Date.now() * 0.001;
  for (let i = 0; i < coloredStars.length; i++) {
    const s = coloredStars[i];
    const x = ((s.x - bg.offset * s.speed) % (canvasWidth * 3) + canvasWidth * 3) % (canvasWidth * 3);
    if (x < canvasWidth) {
      const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(now * 1.5 + s.twinkleOffset));
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = s.color;
      ctx.fillRect(Math.round(x), Math.round(s.y), s.size, s.size);
    }
  }
  ctx.globalAlpha = 1;

  // THE GROUND LINE — single glowing cyan line (energy beam in space)
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
  ctx.fillRect(0, groundY + 1, canvasWidth, getGroundHeight(canvasHeight));
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
