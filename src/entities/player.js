import { GAME, PLAYER } from '../config.js';

// Load sprite sheet (8-frame horizontal strip)
const spriteSheet = new Image();
spriteSheet.src = './cat-run.png';

export function createPlayer() {
  return {
    x: 0,
    y: 0,
    width: GAME.PLAYER_WIDTH,
    height: GAME.PLAYER_HEIGHT,
    frameIndex: 0,
    frameTimer: 0,
    bobTimer: 0
  };
}

export function resetPlayer(player, canvasWidth, canvasHeight, groundHeight) {
  player.x = canvasWidth * GAME.PLAYER_X_PERCENT;
  player.y = canvasHeight - groundHeight - player.height;
}

export function updatePlayer(player, dt) {
  // Advance frame timer
  player.frameTimer += dt;
  if (player.frameTimer >= PLAYER.FRAME_DURATION) {
    player.frameTimer -= PLAYER.FRAME_DURATION;
    player.frameIndex = (player.frameIndex + 1) % PLAYER.FRAME_COUNT;
  }
  // Advance bob timer
  player.bobTimer += dt;
}

export function renderPlayer(ctx, player) {
  if (!spriteSheet.complete) return;

  const frameW = spriteSheet.width / PLAYER.FRAME_COUNT;
  const frameH = spriteSheet.height;
  const srcX = player.frameIndex * frameW;
  const bobY = Math.sin(player.bobTimer * PLAYER.BOB_SPEED) * PLAYER.BOB_AMPLITUDE;
  const dx = Math.round(player.x);
  const dy = Math.round(player.y + bobY);

  // Neon border frame around player (like Stitch reference)
  ctx.save();
  ctx.strokeStyle = '#00ffcc';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#00ffcc';
  ctx.shadowBlur = 4;
  ctx.strokeRect(dx - 2, dy - 2, player.width + 4, player.height + 4);
  ctx.restore();

  // Draw sprite
  ctx.drawImage(
    spriteSheet,
    srcX, 0, frameW, frameH,
    dx, dy,
    player.width, player.height
  );
}
