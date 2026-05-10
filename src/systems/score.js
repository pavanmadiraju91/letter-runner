import { events } from '../core/events.js';
import { SCORE, COMBO, WORDS } from '../config.js';

let score = 0;
let currentLevel = 1;
let streakMultiplier = 1;

/**
 * Initialize the score system.
 * Subscribes to events:
 * - OBSTACLE_DESTROYED: awards destroy points scaled by level and streak
 * - COMBO_UPDATE: tracks current streak multiplier
 * - GAME_RESTART: resets score
 * - LEVEL_UP: updates current level multiplier (Phase 5)
 */
export function createScore() {
  events.on('OBSTACLE_DESTROYED', (payload) => {
    let comboMultiplier = 1;
    if (payload && payload.isCombo && payload.comboSize) {
      if (payload.isWord) {
        if (payload.comboSize >= 6) {
          comboMultiplier = WORDS.MULTIPLIER_LONG_WORD;
        } else if (payload.comboSize >= 4) {
          comboMultiplier = WORDS.MULTIPLIER_MEDIUM_WORD;
        } else {
          comboMultiplier = WORDS.MULTIPLIER_SHORT_WORD;
        }
      } else if (payload.comboSize >= 4) {
        comboMultiplier = COMBO.MULTIPLIER_4LETTER;
      } else if (payload.comboSize === 3) {
        comboMultiplier = COMBO.MULTIPLIER_3LETTER;
      } else if (payload.comboSize === 2) {
        comboMultiplier = COMBO.MULTIPLIER_2LETTER;
      }
    }
    score += SCORE.DESTROY_POINTS * currentLevel * comboMultiplier * streakMultiplier;
  });

  events.on('COMBO_UPDATE', ({ multiplier }) => {
    streakMultiplier = multiplier;
  });

  events.on('GAME_RESTART', () => {
    resetScore();
  });

  events.on('LEVEL_UP', (payload) => {
    if (payload && payload.level) {
      currentLevel = payload.level;
    }
  });
}

/**
 * Reset score to 0 and level to 1.
 * Called at game start and on restart.
 */
export function resetScore() {
  score = 0;
  currentLevel = 1;
  streakMultiplier = 1;
}

/**
 * Accumulate survival bonus each frame.
 * Called from update loop only when state is PLAYING.
 * @param {number} dt - delta time in seconds
 */
export function updateScore(dt) {
  score += SCORE.SURVIVAL_RATE * dt;
}

/**
 * Return current score as integer (floors fractional survival bonus).
 */
export function getScore() {
  return Math.floor(score);
}
