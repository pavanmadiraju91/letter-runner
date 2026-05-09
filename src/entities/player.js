import { GAME } from '../config.js';

export function createPlayer() {
  return {
    x: 0,
    y: 0,
    width: GAME.PLAYER_WIDTH,
    height: GAME.PLAYER_HEIGHT,
    frameIndex: 0,
    frameTimer: 0
  };
}

export function resetPlayer(player, canvasWidth, canvasHeight, groundHeight) {
  player.x = canvasWidth * GAME.PLAYER_X_PERCENT;
  player.y = canvasHeight - groundHeight - player.height;
}

export function renderPlayer(ctx, player) {
  ctx.fillStyle = '#00ff88';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}
