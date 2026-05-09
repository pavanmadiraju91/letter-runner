import { events } from './events.js';

export const STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  GAME_OVER: 'game_over'
};

let currentState = STATES.MENU;

/**
 * Initialize the state machine.
 * Subscribes to GAME_START, GAME_OVER, and GAME_RESTART events to manage transitions.
 */
export function createStateMachine() {
  events.on('GAME_START', () => {
    if (currentState !== STATES.MENU) return;
    currentState = STATES.PLAYING;
    events.emit('STATE_CHANGE', { state: STATES.PLAYING });
  });

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
 * Request game start from MENU. Emits GAME_START event.
 * Should be called by input handler during Menu state.
 */
export function requestStart() {
  events.emit('GAME_START', {});
}

/**
 * Request a game restart. Emits GAME_RESTART event.
 * Should be called by input handler during GameOver state.
 */
export function requestRestart() {
  events.emit('GAME_RESTART', {});
}
