import { GAME } from '../config.js';

let lastTime = 0;
let running = false;
let updateFn = null;
let renderFn = null;

function tick(currentTime) {
  if (!running) return;

  const dt = Math.min((currentTime - lastTime) / 1000, GAME.MAX_DT);
  lastTime = currentTime;

  updateFn(dt);
  renderFn();

  requestAnimationFrame(tick);
}

export function startLoop(update, render) {
  updateFn = update;
  renderFn = render;
  running = true;
  lastTime = performance.now();
  requestAnimationFrame(tick);
}

export function stopLoop() {
  running = false;
}
