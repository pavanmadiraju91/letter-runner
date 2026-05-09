import { events } from '../core/events.js';

const pressed = new Set();

let onKeyDown;
let onKeyUp;

/**
 * Initialize keyboard input — emits KEY_PRESS for A-Z keys.
 * Does not call preventDefault to avoid breaking browser shortcuts.
 */
export function initInput() {
  onKeyDown = (e) => {
    if (e.repeat) return;

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

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

/**
 * Remove keyboard listeners (for cleanup/testing).
 */
export function destroyInput() {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  pressed.clear();
}
