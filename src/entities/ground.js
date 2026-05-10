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
}
