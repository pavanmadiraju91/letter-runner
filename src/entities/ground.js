import { GAME } from '../config.js';

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
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, ground.y, canvasWidth, ground.height);

  // Draw scroll indicators (dashes) to show movement
  ctx.fillStyle = '#2a2a4e';
  const startX = -ground.offset;
  for (let x = startX; x < canvasWidth; x += ground.tileWidth) {
    ctx.fillRect(x, ground.y + 4, 32, 2);
  }
}
