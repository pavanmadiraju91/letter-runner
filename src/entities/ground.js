import { GAME, COLORS } from '../config.js';

export function createGround() {
  return {
    offset: 0,
    tileWidth: 64,
    y: 0,
    height: GAME.GROUND_HEIGHT
  };
}

export function updateGround(ground, dt, scrollSpeed) {
  ground.offset = (ground.offset + scrollSpeed * dt) % ground.tileWidth;
}

export function renderGround(ctx, ground, canvasWidth, canvasHeight) {
  ground.y = canvasHeight - ground.height;

  // Draw ground band
  ctx.fillStyle = COLORS.PALETTE.GROUND_BASE;
  ctx.fillRect(0, ground.y, canvasWidth, ground.height);

  // Draw scroll indicators (dashes) to show movement
  ctx.fillStyle = COLORS.PALETTE.GROUND_LINE;
  const startX = -ground.offset;
  for (let x = startX; x < canvasWidth; x += ground.tileWidth) {
    ctx.fillRect(x, ground.y + 4, 32, 2);
  }

  // Neon horizon line at top edge of ground
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = COLORS.PALETTE.CYAN;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, ground.y);
  ctx.lineTo(canvasWidth, ground.y);
  ctx.stroke();
  ctx.restore();
}
