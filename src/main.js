import { initCanvas, getCtx, getWidth, getHeight } from './core/canvas.js';
import { startLoop } from './core/game-loop.js';
import { events } from './core/events.js';
import { createStateMachine, getState, STATES, requestRestart } from './core/state.js';
import { COLORS, GAME } from './config.js';
import { createPlayer, resetPlayer, renderPlayer } from './entities/player.js';
import { createGround, updateGround, renderGround } from './entities/ground.js';
import { createObstacleFactory, updateObstacles, cleanupOffscreen, renderObstacles } from './entities/obstacle.js';
import { createPool } from './systems/pool.js';
import { createSpawner, updateSpawner } from './systems/spawner.js';
import { initInput } from './systems/input.js';
import { initMatcher } from './systems/matcher.js';
import { createLives, resetLives } from './systems/lives.js';
import { createScore, resetScore, updateScore } from './systems/score.js';
import { createHUD, renderHUD } from './systems/hud.js';

initCanvas();
events.emit('CANVAS_READY', { width: getWidth(), height: getHeight() });

createStateMachine();
createLives();
resetLives();
createScore();
resetScore();
createHUD();

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

// Restart game: reset lives, clear obstacles, reset spawner, flip state
function restartGame() {
  resetLives();
  resetScore();
  obstaclePool.getActive().slice().forEach(o => obstaclePool.release(o));
  spawner.timer = 0;
  requestRestart();
}

// Any keypress during GameOver triggers restart
events.on('KEY_PRESS', () => {
  if (getState() === STATES.GAME_OVER) {
    restartGame();
  }
});

function update(dt) {
  if (getState() !== STATES.PLAYING) return;

  updateGround(ground, dt, GAME.SCROLL_SPEED);
  const groundY = getHeight() - GAME.GROUND_HEIGHT;
  updateSpawner(spawner, dt, GAME.SCROLL_SPEED, groundY);
  updateObstacles(obstaclePool, dt);
  cleanupOffscreen(obstaclePool);
  updateScore(dt);
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
  renderHUD(ctx, w);

  // Game Over overlay
  if (getState() === STATES.GAME_OVER) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', w / 2, h / 2 - 20);

    ctx.font = '18px monospace';
    ctx.fillText('Press any key to restart', w / 2, h / 2 + 20);
  }
}

startLoop(update, render);
events.emit('LOOP_START', {});

console.log('[Letter Runner] Game loop started');
