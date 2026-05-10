import { getPalette } from '../core/theme.js';
import { GAME, SPEED } from '../config.js';
import { getCurrentSpeed } from '../systems/difficulty.js';

const STAR_COUNT = 40;
const COLORED_STAR_COUNT = 15;
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

  // Colored stars (faint blue, purple, red)
  const starColors = [
    'rgba(100, 150, 255, 0.6)',  // faint blue
    'rgba(180, 100, 255, 0.5)',  // faint purple
    'rgba(255, 100, 120, 0.5)',  // faint red
    'rgba(80, 200, 255, 0.5)',   // faint cyan-blue
    'rgba(200, 80, 255, 0.4)',   // faint violet
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

  // Nebula blobs — very faint, large colored circles
  nebulae.push(
    { x: canvasWidth * 0.2, y: canvasHeight * 0.3, radius: 120, color: 'rgba(100, 40, 180, 1)', alpha: 0.03, speed: 0.002 },
    { x: canvasWidth * 0.7, y: canvasHeight * 0.5, radius: 150, color: 'rgba(20, 40, 140, 1)', alpha: 0.04, speed: 0.001 },
    { x: canvasWidth * 0.5, y: canvasHeight * 0.15, radius: 100, color: 'rgba(80, 20, 160, 1)', alpha: 0.025, speed: 0.003 }
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
  const groundY = canvasHeight - GAME.GROUND_HEIGHT;

  init(canvasWidth, canvasHeight);

  // Deep dark background
  ctx.fillStyle = palette.BG || '#0a0a0f';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Nebula blobs — very faint large gradient circles with slow parallax
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
