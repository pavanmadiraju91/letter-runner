import { initCanvas, getCtx, getWidth, getHeight } from './core/canvas.js';
import { startLoop } from './core/game-loop.js';
import { events } from './core/events.js';
import { COLORS, GAME } from './config.js';
import { createPlayer, resetPlayer, renderPlayer } from './entities/player.js';
import { createGround, updateGround, renderGround } from './entities/ground.js';
import { createObstacleFactory, updateObstacles, cleanupOffscreen, renderObstacles } from './entities/obstacle.js';
import { createPool } from './systems/pool.js';
import { createSpawner, updateSpawner } from './systems/spawner.js';
import { initInput } from './systems/input.js';
import { initMatcher } from './systems/matcher.js';

initCanvas();
events.emit('CANVAS_READY', { width: getWidth(), height: getHeight() });

const ground = createGround();
const player = createPlayer();
const obstaclePool = createPool(createObstacleFactory(), 20);
const spawner = createSpawner(obstaclePool);

resetPlayer(player, getWidth(), getHeight(), GAME.GROUND_HEIGHT);
initInput();
initMatcher(obstaclePool);

events.on('CANVAS_RESIZE', ({ width, height }) => {
  resetPlayer(player, width, height, GAME.GROUND_HEIGHT);
});

function update(dt) {
  updateGround(ground, dt, GAME.SCROLL_SPEED);
  const groundY = getHeight() - GAME.GROUND_HEIGHT;
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
}

startLoop(update, render);
events.emit('LOOP_START', {});

console.log('[Letter Runner] Game loop started');
