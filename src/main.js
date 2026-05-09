import { initCanvas, getCtx, getWidth, getHeight } from './core/canvas.js';
import { startLoop } from './core/game-loop.js';
import { events } from './core/events.js';
import { COLORS } from './config.js';

initCanvas();
events.emit('CANVAS_READY', { width: getWidth(), height: getHeight() });

function update(dt) {
  // Future: entity updates, physics, input polling
}

function render() {
  const ctx = getCtx();
  const w = getWidth();
  const h = getHeight();

  ctx.fillStyle = COLORS.BG;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = COLORS.DEBUG_TEXT;
  ctx.font = '12px monospace';
  ctx.fillText(`${w}x${h} @${window.devicePixelRatio}x`, 8, 20);
}

startLoop(update, render);
events.emit('LOOP_START', {});

console.log('[Letter Runner] Game loop started');
