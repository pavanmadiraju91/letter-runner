import { events } from '../core/events.js';
import { GAME } from '../config.js';
import { stopLoop, resumeLoop } from '../core/game-loop.js';

const pressed = new Set();

let inputLocked = false;
let currentLevel = 1;
let gameState = 'playing'; // tracks state via STATE_CHANGE events
let onKeyDown;
let onKeyUp;
let onVisibilityChange;

/**
 * Initialize keyboard input — emits KEY_PRESS for A-Z keys.
 * Does not call preventDefault to avoid breaking browser shortcuts.
 * Handles wrong-key penalty delay at level 4+ and LEVEL_UP tracking.
 * Pauses game on tab blur, resumes on tab focus (unless game over).
 */
export function initInput() {
  onKeyDown = (e) => {
    if (e.repeat) return;
    if (inputLocked) return;

    const key = e.key.toUpperCase();
    if (key.length === 1 && ((key >= 'A' && key <= 'Z') || (key >= '0' && key <= '9'))) {
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

  // Track game state changes from state machine (Phase 3 plan 02)
  events.on('STATE_CHANGE', (data) => {
    gameState = data.state;
  });

  // Pause/resume on visibility change (TECH-09)
  onVisibilityChange = () => {
    if (document.hidden) {
      stopLoop();
      events.emit('GAME_PAUSED', {});
    } else {
      // Only resume if game is in playing state (don't resurrect game-over)
      if (gameState === 'playing') {
        resumeLoop();
        events.emit('GAME_RESUMED', {});
      }
    }
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

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
 * Remove keyboard and visibility listeners (for cleanup/testing).
 */
export function destroyInput() {
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('keyup', onKeyUp);
  document.removeEventListener('visibilitychange', onVisibilityChange);
  pressed.clear();
}
