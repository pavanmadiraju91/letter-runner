import { events } from '../core/events.js';
import { GAME } from '../config.js';

const pressed = new Set();

let inputLocked = false;
let currentLevel = 1;
let onKeyDown;
let onKeyUp;

/**
 * Initialize keyboard input — emits KEY_PRESS for A-Z keys.
 * Does not call preventDefault to avoid breaking browser shortcuts.
 * Handles wrong-key penalty delay at level 4+ and LEVEL_UP tracking.
 */
export function initInput() {
  onKeyDown = (e) => {
    if (e.repeat) return;
    if (inputLocked) return;

    const key = e.key.toUpperCase();
    if (key.length === 1 && key >= 'A' && key <= 'Z') {
      pressed.add(key);
      events.emit('KEY_PRESS', { key });
    }
  };

  onKeyUp = (e) => {
    const key = e.key.toUpperCase();
    pressed.delete(key);
  };

  // Wrong-key penalty: lock input briefly at level 4+
  events.on('WRONG_KEY', () => {
    if (currentLevel < GAME.WRONG_KEY_PENALTY_LEVEL) return;
    inputLocked = true;
    setTimeout(() => {
      inputLocked = false;
    }, GAME.WRONG_KEY_DELAY * 1000);
  });

  // Track level changes from Phase 5 difficulty system
  events.on('LEVEL_UP', (data) => {
    currentLevel = data.level;
  });

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

/**
 * Reset input state (called on game restart).
 */
export function resetInput() {
  inputLocked = false;
  currentLevel = 1;
}

/**
 * Remove keyboard listeners (for cleanup/testing).
 */
export function destroyInput() {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  pressed.clear();
}
