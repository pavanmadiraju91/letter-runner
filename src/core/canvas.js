import { events } from './events.js';

let canvas, ctx;
let width, height;

export function initCanvas() {
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  return { canvas, ctx };
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  ctx.scale(dpr, dpr);
  ctx.imageSmoothingEnabled = false;
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;

  events.emit('CANVAS_RESIZE', { width, height });
}

export function getCtx() { return ctx; }
export function getWidth() { return width; }
export function getHeight() { return height; }
