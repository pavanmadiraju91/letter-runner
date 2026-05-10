import { GAME } from '../config.js';
import { getWidth } from '../core/canvas.js';
import { events } from '../core/events.js';

/**
 * Initialize letter matcher — listens for KEY_PRESS events and checks
 * whether a matching obstacle is inside the danger zone.
 *
 * Supports both single-letter and multi-letter combo obstacles:
 * - Single-letter: destroyed immediately on matching key press.
 * - Combo: letters typed left-to-right in sequence. Progress advances on
 *   correct key, resets to 0 on wrong key. Full sequence destroys obstacle.
 *
 * Priority: combo obstacles are checked first (only 1 on screen, time-sensitive).
 * When a combo is in zone, typing a single-letter that matches another obstacle
 * still destroys that single — it does NOT reset the combo.
 */
export function initMatcher(obstaclePool) {
  events.on('KEY_PRESS', ({ key }) => {
    const dangerLeft = getWidth() * GAME.DANGER_ZONE_START;
    const dangerRight = getWidth();
    const active = obstaclePool.getActive();

    let comboInZone = null;
    const singlesInZone = [];

    // Partition active obstacles in the danger zone into combo vs singles
    for (let i = active.length - 1; i >= 0; i--) {
      const obs = active[i];
      if (obs.x >= dangerLeft && obs.x <= dangerRight) {
        if (obs.isCombo) {
          comboInZone = obs;
        } else {
          singlesInZone.push(obs);
        }
      }
    }

    const hasObstaclesInZone = comboInZone !== null || singlesInZone.length > 0;

    // --- Priority pass: combo obstacle ---
    if (comboInZone) {
      const nextLetter = comboInZone.letters[comboInZone.progress];

      if (nextLetter === key) {
        // Correct next letter in combo sequence
        comboInZone.progress++;

        if (comboInZone.progress === comboInZone.letters.length) {
          // Combo complete — destroy
          events.emit('OBSTACLE_DESTROYED', {
            letter: comboInZone.letters.join(''),
            x: comboInZone.x,
            y: comboInZone.y,
            isCombo: true,
            comboSize: comboInZone.letters.length
          });
          obstaclePool.release(comboInZone);
        }
        // Key consumed (either partial advance or full destroy)
        return;
      }

      // Key does NOT match combo's next letter.
      // Check if it matches any single-letter obstacle in zone instead.
      for (let i = 0; i < singlesInZone.length; i++) {
        const obs = singlesInZone[i];
        if (obs.letter === key) {
          events.emit('OBSTACLE_DESTROYED', {
            letter: obs.letter,
            x: obs.x,
            y: obs.y,
            isCombo: false,
            comboSize: 1
          });
          obstaclePool.release(obs);
          return;
        }
      }

      // No single matched either — wrong key resets combo progress
      comboInZone.progress = 0;
      events.emit('WRONG_KEY', { key, comboReset: true, targetObs: comboInZone });
      return;
    }

    // --- No combo in zone: standard single-letter matching ---
    // singlesInZone is already sorted rightmost-first (iterated in reverse above)
    for (let i = 0; i < singlesInZone.length; i++) {
      const obs = singlesInZone[i];
      if (obs.letter === key) {
        events.emit('OBSTACLE_DESTROYED', {
          letter: obs.letter,
          x: obs.x,
          y: obs.y,
          isCombo: false,
          comboSize: 1
        });
        obstaclePool.release(obs);
        return;
      }
    }

    // No match found — emit WRONG_KEY only if there were targets in the zone
    if (hasObstaclesInZone) {
      // Target the closest obstacle (rightmost in danger zone = first in singlesInZone)
      const targetObs = singlesInZone.length > 0 ? singlesInZone[0] : null;
      events.emit('WRONG_KEY', { key, comboReset: false, targetObs });
    }
  });
}
