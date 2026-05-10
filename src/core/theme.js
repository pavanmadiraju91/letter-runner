import { events } from './events.js';
import { PALETTE_DARK, COLORS } from '../config.js';

let currentTheme = 'dark';

export function initTheme() {
  currentTheme = 'dark';
  document.body.style.background = COLORS.BG;
}

export function getTheme() {
  return 'dark';
}

export function getPalette() {
  return PALETTE_DARK;
}

export function getBG() {
  return COLORS.BG;
}
