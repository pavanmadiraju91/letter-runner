import { initCanvas, getCtx, getWidth, getHeight } from './core/canvas.js';
import { startLoop } from './core/game-loop.js';
import { events } from './core/events.js';
import { createStateMachine, getState, STATES, requestRestart, requestStart } from './core/state.js';
import { COLORS, GAME } from './config.js';
import { createPlayer, resetPlayer, renderPlayer } from './entities/player.js';
import { createGround, updateGround, renderGround } from './entities/ground.js';
import { createObstacleFactory, updateObstacles, cleanupOffscreen, renderObstacles } from './entities/obstacle.js';
import { createPool } from './systems/pool.js';
import { createSpawner, updateSpawner } from './systems/spawner.js';
import { initInput } from './systems/input.js';
import { initMatcher } from './systems/matcher.js';
import { createLives, resetLives } from './systems/lives.js';
import { createScore, resetScore, updateScore, getScore } from './systems/score.js';
import { createHUD, renderHUD } from './systems/hud.js';
import { createFPSMonitor, updateFPS } from './systems/fps-monitor.js';
import { createParticleSystem, updateParticles, renderParticles } from './systems/particles.js';
import { createVFX, updateVFX, getPlayerFlash, getScreenFlash } from './systems/vfx.js';
import { createAudioSystem } from './systems/audio.js';
import { createDifficulty, resetDifficulty, getDifficultyParams } from './systems/difficulty.js';
import { createLevelAnnounce, updateLevelAnnounce, renderLevelAnnounce } from './systems/level-announce.js';
import { renderStartScreen } from './screens/start.js';
import { createGameOverScreen, updateGameOverScreen, renderGameOverScreen } from './screens/game-over.js';
import { getPersonalBest, setPersonalBest } from './systems/storage.js';

initCanvas();
events.emit('CANVAS_READY', { width: getWidth(), height: getHeight() });

createStateMachine();
createLives();
resetLives();
createScore();
resetScore();
createDifficulty();
resetDifficulty();
createLevelAnnounce();
createGameOverScreen();
createHUD();
createFPSMonitor();
createParticleSystem();
createVFX();
createAudioSystem();

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

// Save personal best when game ends
events.on('STATE_CHANGE', ({ state }) => {
  if (state === STATES.GAME_OVER) {
    setPersonalBest(getScore());
  }
});

// Restart game: reset lives, clear obstacles, reset spawner, flip state
function restartGame() {
  resetLives();
  resetScore();
  resetDifficulty();
  obstaclePool.getActive().slice().forEach(o => obstaclePool.release(o));
  spawner.timer = 0;
  requestRestart();
}

// Key press handling for state transitions
events.on('KEY_PRESS', () => {
  const state = getState();
  if (state === STATES.MENU) {
    requestStart();
  } else if (state === STATES.GAME_OVER) {
    restartGame();
  }
});

function update(dt) {
  updateFPS(dt);

  if (getState() === STATES.GAME_OVER) {
    updateGameOverScreen(dt);
    return;
  }
  if (getState() !== STATES.PLAYING) return;

  const params = getDifficultyParams();
  updateGround(ground, dt, params.scrollSpeed);
  const groundY = getHeight() - GAME.GROUND_HEIGHT;
  updateSpawner(spawner, dt, params, groundY);
  updateObstacles(obstaclePool, dt);
  cleanupOffscreen(obstaclePool);
  updateScore(dt);
  updateLevelAnnounce(dt);
  updateParticles(dt);
  updateVFX(dt);
}

function render() {
  const ctx = getCtx();
  const w = getWidth();
  const h = getHeight();

  // Start screen
  if (getState() === STATES.MENU) {
    renderStartScreen(ctx, w, h);
    return;
  }

  ctx.fillStyle = COLORS.BG;
  ctx.fillRect(0, 0, w, h);

  renderGround(ctx, ground, w, h);
  renderObstacles(ctx, obstaclePool.getActive());
  renderPlayer(ctx, player);
  // VFX-05: white flash overlay on correct key press
  if (getPlayerFlash()) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = COLORS.PALETTE.WHITE;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.restore();
  }
  renderHUD(ctx, w);
  // Music toggle hint (bottom-right, dim)
  ctx.save();
  ctx.font = '10px monospace';
  ctx.fillStyle = COLORS.PALETTE.DIM;
  ctx.textAlign = 'right';
  ctx.fillText('[M] Music', w - 8, getHeight() - 8);
  ctx.restore();
  renderLevelAnnounce(ctx, w, h);
  renderParticles(ctx);

  // VFX-06: Red screen flash on life lost
  const flash = getScreenFlash();
  if (flash.active) {
    ctx.save();
    ctx.globalAlpha = flash.alpha * 0.3; // max 30% opacity — noticeable but not blinding
    ctx.fillStyle = COLORS.PALETTE.MAGENTA;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Game Over screen
  if (getState() === STATES.GAME_OVER) {
    renderGameOverScreen(ctx, w, h);
  }
}

startLoop(update, render);
events.emit('LOOP_START', {});

console.log('[Letter Runner] Game loop started');
