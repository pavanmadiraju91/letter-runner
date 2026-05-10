/**
 * Combo Streak System
 * Tracks consecutive obstacle destroys without misses.
 * Emits COMBO_UPDATE events with streak count and multiplier.
 */

import { events } from '../core/events.js';

const STREAK_MULTIPLIERS = [
  { streak: 20, multiplier: 10 },
  { streak: 10, multiplier: 5 },
  { streak: 5, multiplier: 3 },
  { streak: 3, multiplier: 2 },
];

let streak = 0;
let multiplier = 1;

/**
 * Get the multiplier for a given streak count.
 * @param {number} count
 * @returns {number}
 */
function getMultiplierForStreak(count) {
  for (let i = 0; i < STREAK_MULTIPLIERS.length; i++) {
    if (count >= STREAK_MULTIPLIERS[i].streak) {
      return STREAK_MULTIPLIERS[i].multiplier;
    }
  }
  return 1;
}

/**
 * Initialize the combo system.
 * Subscribes to OBSTACLE_DESTROYED and OBSTACLE_MISSED events.
 */
export function createCombo() {
  events.on('OBSTACLE_DESTROYED', () => {
    streak++;
    multiplier = getMultiplierForStreak(streak);
    events.emit('COMBO_UPDATE', { streak, multiplier });
  });

  events.on('OBSTACLE_MISSED', () => {
    streak = 0;
    multiplier = 1;
    events.emit('COMBO_UPDATE', { streak, multiplier });
  });

  events.on('GAME_RESTART', () => {
    resetCombo();
  });
}

/**
 * Reset combo state.
 */
export function resetCombo() {
  streak = 0;
  multiplier = 1;
}

/**
 * Get current streak count.
 * @returns {number}
 */
export function getStreak() {
  return streak;
}

/**
 * Get current combo multiplier.
 * @returns {number}
 */
export function getComboMultiplier() {
  return multiplier;
}
