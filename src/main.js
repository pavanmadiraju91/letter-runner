import { initCanvas, getCtx, getWidth, getHeight } from './core/canvas.js';
import { startLoop } from './core/game-loop.js';
import { events } from './core/events.js';
import { COLORS, GAME } from './config.js';
import { createPlayer, resetPlayer, renderPlayer } from './entities/player.js';
import { createGround, updateGround, renderGround } from './entities/ground.js';
import { createPool } from './systems/pool.js';
import { createObstacleFactory, updateObstacles, cleanupOffscreen, renderObstacles } from './entities/obstacle.js';
import { createSpawner, updateSpawner } from './systems/spawner.js';

initCanvas();
events.emit('CANVAS_READY', { width: getWidth(), height: getHeight() });

const player = createPlayer();
const ground = createGround();
const obstaclePool = createPool(createObstacleFactory(), 20);
const spawner = createSpawner(obstaclePool);

resetPlayer(player, getWidth(), getHeight(), ground.height);

events.on('CANVAS_RESIZE', ({ width, height }) => {
  resetPlayer(player, width, height, ground.height);
});

function update(dt) {
  updateGround(ground, dt, GAME.SCROLL_SPEED);
  const groundY = getHeight() - ground.height;
  updateSpawner(spawner, dt, GAME.SCROLL_SPEED, groundY);
  updateObstacles(obstaclePool, dt);
  cleanupOffscreen(obstaclePool);
}

function render() {
  const ctx = getCtx();
  const w = getWidth();
  const h = getHeight();

  ctx.fillStyle = COLORS.BG;
  ctx.fillRect(0, 0, w, h);

  renderGround(ctx, ground, w, h);
  renderObstacles(ctx, obstaclePool.getActive());
  renderPlayer(ctx, player);

  ctx.fillStyle = COLORS.DEBUG_TEXT;
  ctx.font = '12px monospace';
  ctx.fillText(`${w}x${h} @${window.devicePixelRatio}x`, 8, 20);
}

startLoop(update, render);
events.emit('LOOP_START', {});

console.log('[Letter Runner] Game loop started');
