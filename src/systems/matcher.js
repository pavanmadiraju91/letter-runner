import { GAME } from '../config.js';
import { getWidth } from '../core/canvas.js';
import { events } from '../core/events.js';

/**
 * Initialize letter matcher — listens for KEY_PRESS events and checks
 * whether a matching obstacle is inside the danger zone.
 * Destroys the closest matching obstacle (rightmost first).
 * Emits WRONG_KEY if obstacles exist in zone but none match.
 */
export function initMatcher(obstaclePool) {
  events.on('KEY_PRESS', ({ key }) => {
    const dangerLeft = getWidth() * GAME.DANGER_ZONE_START;
    const dangerRight = getWidth();
    const active = obstaclePool.getActive();

    let hasObstaclesInZone = false;

    // Iterate in reverse — rightmost (closest to player) takes priority
    for (let i = active.length - 1; i >= 0; i--) {
      const obs = active[i];
      if (obs.x >= dangerLeft && obs.x <= dangerRight) {
        hasObstaclesInZone = true;
        if (obs.letter === key) {
          events.emit('OBSTACLE_DESTROYED', { letter: obs.letter, x: obs.x, y: obs.y });
          obstaclePool.release(obs);
          return;
        }
      }
    }

    // No match found — emit WRONG_KEY only if there were targets in the zone
    if (hasObstaclesInZone) {
      events.emit('WRONG_KEY', { key });
    }
  });
}
