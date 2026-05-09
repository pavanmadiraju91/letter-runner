import { events } from './events.js';

export const STATES = {
  PLAYING: 'playing',
  GAME_OVER: 'game_over'
};

let currentState = STATES.PLAYING;

/**
 * Initialize the state machine.
 * Subscribes to GAME_OVER and GAME_RESTART events to manage transitions.
 */
export function createStateMachine() {
  events.on('GAME_OVER', () => {
    if (currentState === STATES.GAME_OVER) return;
    currentState = STATES.GAME_OVER;
    events.emit('STATE_CHANGE', { state: STATES.GAME_OVER });
  });

  events.on('GAME_RESTART', () => {
    if (currentState === STATES.PLAYING) return;
    currentState = STATES.PLAYING;
    events.emit('STATE_CHANGE', { state: STATES.PLAYING });
  });
}

/**
 * Return current game state.
 */
export function getState() {
  return currentState;
}

/**
 * Request a game restart. Emits GAME_RESTART event.
 * Should be called by input handler during GameOver state.
 */
export function requestRestart() {
  events.emit('GAME_RESTART', {});
}
