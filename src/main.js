import { initCanvas, getCtx, getWidth, getHeight } from './core/canvas.js';
import { startLoop } from './core/game-loop.js';
import { events } from './core/events.js';
import { initTheme, getPalette, getBG } from './core/theme.js';
import { createStateMachine, getState, STATES, requestRestart, requestStart } from './core/state.js';
import { GAME } from './config.js';
import { createPlayer, resetPlayer, updatePlayer, renderPlayer } from './entities/player.js';
import { createBackground, updateBackground, renderBackground } from './entities/background.js';
import { createGround, updateGround, renderGround } from './entities/ground.js';
import { createObstacleFactory, updateObstacles, cleanupOffscreen, renderObstacles } from './entities/obstacle.js';
import { createPool } from './systems/pool.js';
import { createSpawner, updateSpawner } from './systems/spawner.js';
import { initInput } from './systems/input.js';
import { initMatcher } from './systems/matcher.js';
import { createLives, resetLives } from './systems/lives.js';
import { createScore, resetScore, updateScore, getScore } from './systems/score.js';
import { createCombo, resetCombo } from './systems/combo.js';
import { createHUD, renderHUD } from './systems/hud.js';
import { createFPSMonitor, updateFPS } from './systems/fps-monitor.js';
import { createParticleSystem, updateParticles, renderParticles } from './systems/particles.js';
import { createVFX, updateVFX, getPlayerFlash, getScreenFlash, getScreenShake } from './systems/vfx.js';
import { createAudioSystem, isMusicPlaying } from './systems/audio.js';
import { createDifficulty, resetDifficulty, getDifficultyParams, tickSpeed } from './systems/difficulty.js';
import { createLevelAnnounce, updateLevelAnnounce, renderLevelAnnounce } from './systems/level-announce.js';
import { renderStartScreen } from './screens/start.js';
import { createGameOverScreen, updateGameOverScreen, renderGameOverScreen } from './screens/game-over.js';
import { getPersonalBest, setPersonalBest } from './systems/storage.js';

// Hitstop (death slow-mo) state
let hitstopTimer = 0;
const HITSTOP_DURATION = 0.08; // 80ms freeze on final death

initCanvas();
initTheme();
events.emit('CANVAS_READY', { width: getWidth(), height: getHeight() });

createStateMachine();
createLives();
resetLives();
createScore();
resetScore();
createCombo();
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
const background = createBackground();
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
    // Trigger hitstop freeze on death
    hitstopTimer = HITSTOP_DURATION;
  }
});

// Restart game: reset lives, clear obstacles, reset spawner, flip state
function restartGame() {
  resetLives();
  resetScore();
  resetCombo();
  resetDifficulty();
  hitstopTimer = 0;
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

  // Death hitstop: freeze everything for HITSTOP_DURATION after final death
  if (hitstopTimer > 0) {
    hitstopTimer -= dt;
    return; // Skip all updates — frame stays frozen
  }

  if (getState() === STATES.GAME_OVER) {
    updateGameOverScreen(dt);
    return;
  }
  if (getState() !== STATES.PLAYING) return;

  tickSpeed(dt);
  const params = getDifficultyParams();
  updateBackground(background, dt, params.scrollSpeed);
  updatePlayer(player, dt);
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

  // VFX-07: Apply screen shake offset
  const shake = getScreenShake();
  ctx.save();
  ctx.translate(shake.x, shake.y);

  ctx.fillStyle = getBG();
  ctx.fillRect(0, 0, w, h);
  renderBackground(ctx, background, w, h);

  renderGround(ctx, ground, w, h);
  renderObstacles(ctx, obstaclePool.getActive());
  renderPlayer(ctx, player);
  renderHUD(ctx, w);
  // Music toggle hint (bottom-right, dim) — dynamic based on state
  ctx.save();
  ctx.font = '10px \'Courier New\', monospace';
  ctx.fillStyle = getPalette().DIM;
  ctx.textAlign = 'right';
  const musicHint = isMusicPlaying() ? '[Tab] Music Off' : '[Tab] Music On';
  ctx.fillText(musicHint, w - 8, getHeight() - 8);
  ctx.restore();
  renderLevelAnnounce(ctx, w, h);
  renderParticles(ctx);

  // VFX-06: Red screen flash on life lost
  const flash = getScreenFlash();
  if (flash.active) {
    ctx.save();
    ctx.globalAlpha = flash.alpha * 0.3; // max 30% opacity — noticeable but not blinding
    ctx.fillStyle = getPalette().MAGENTA;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Restore from shake transform
  ctx.restore();

  // Game Over screen (rendered outside shake so it's stable, suppressed during hitstop)
  if (getState() === STATES.GAME_OVER && hitstopTimer <= 0) {
    renderGameOverScreen(ctx, w, h);
  }
}

startLoop(update, render);
events.emit('LOOP_START', {});

console.log('[Letter Runner] Game loop started');
