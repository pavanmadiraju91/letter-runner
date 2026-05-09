import { GAME, COLORS } from '../config.js';

// 16x16 pixel-art sprite: side-view running humanoid
// 0 = transparent, 1 = PLAYER_PRIMARY (cyan), 2 = PLAYER_SECONDARY (dark), 3 = PLAYER_EYE (white)
const SPRITE = [
  // Row 0-2: head top
  [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  // Row 3: head with eye
  [0,0,0,0,0,1,1,1,3,3,1,0,0,0,0,0],
  // Row 4: head bottom
  [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
  // Row 5: neck
  [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
  // Row 6-7: shoulders + arm back
  [0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0],
  [0,0,1,1,0,0,1,1,1,0,0,1,1,0,0,0],
  // Row 8-9: torso + arms mid-stride
  [0,0,0,0,0,0,1,1,1,0,0,0,1,0,0,0],
  [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
  // Row 10: torso bottom / hips
  [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
  // Row 11: upper legs
  [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],
  // Row 12: mid legs (stride)
  [0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0],
  // Row 13: lower legs
  [0,0,0,0,1,1,0,0,0,0,1,0,0,0,0,0],
  // Row 14: ankles
  [0,0,0,0,2,2,0,0,0,0,2,2,0,0,0,0],
  // Row 15: feet/shoes
  [0,0,0,2,2,2,0,0,0,0,2,2,2,0,0,0],
];

const SPRITE_COLORS = [
  null, // 0 = transparent
  COLORS.PALETTE.PLAYER_PRIMARY,
  COLORS.PALETTE.PLAYER_SECONDARY,
  COLORS.PALETTE.PLAYER_EYE,
];

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
  const pixelW = player.width / 16;
  const pixelH = player.height / 16;
  const baseX = player.x;
  const baseY = player.y;

  for (let row = 0; row < 16; row++) {
    const rowData = SPRITE[row];
    for (let col = 0; col < 16; col++) {
      const val = rowData[col];
      if (val === 0) continue;
      ctx.fillStyle = SPRITE_COLORS[val];
      ctx.fillRect(
        Math.floor(baseX + col * pixelW),
        Math.floor(baseY + row * pixelH),
        Math.ceil(pixelW),
        Math.ceil(pixelH)
      );
    }
  }
}
