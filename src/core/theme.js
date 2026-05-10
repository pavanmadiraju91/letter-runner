// Theme detection and reactive palette switching
// Detects system prefers-color-scheme, emits THEME_CHANGE, provides getPalette()

import { events } from './events.js';
import { PALETTE_DARK, PALETTE_LIGHT, COLORS } from '../config.js';

let currentTheme = 'dark';
let mql = null;

export function initTheme() {
  mql = window.matchMedia('(prefers-color-scheme: dark)');
  currentTheme = mql.matches ? 'dark' : 'light';
  applyTheme();
  mql.addEventListener('change', (e) => {
    currentTheme = e.matches ? 'dark' : 'light';
    applyTheme();
    events.emit('THEME_CHANGE', { theme: currentTheme });
  });
}

function applyTheme() {
  document.body.style.background = currentTheme === 'dark' ? COLORS.BG : COLORS.BG_LIGHT;
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) meta.content = currentTheme;
}

export function getTheme() {
  return currentTheme;
}

export function getPalette() {
  return currentTheme === 'dark' ? PALETTE_DARK : PALETTE_LIGHT;
}

export function getBG() {
  return currentTheme === 'dark' ? COLORS.BG : COLORS.BG_LIGHT;
}
