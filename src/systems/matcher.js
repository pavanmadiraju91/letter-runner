import { GAME } from '../config.js';
import { getWidth } from '../core/canvas.js';
import { events } from '../core/events.js';

/**
 * Initialize letter matcher — listens for KEY_PRESS events and checks
 * whether a matching obstacle is inside the danger zone.
 * Destroys the closest matching obstacle (rightmost first).
 */
export function initMatcher(obstaclePool) {
  events.on('KEY_PRESS', ({ key }) => {
    const dangerLeft = getWidth() * GAME.DANGER_ZONE_START;
    const dangerRight = getWidth();
    const active = obstaclePool.getActive();

    // Iterate in reverse — rightmost (closest to player) takes priority
    for (let i = active.length - 1; i >= 0; i--) {
      const obs = active[i];
      if (obs.letter === key && obs.x >= dangerLeft && obs.x <= dangerRight) {
        events.emit('OBSTACLE_DESTROYED', { letter: obs.letter, x: obs.x, y: obs.y });
        obstaclePool.release(obs);
        return;
      }
    }
  });
}
