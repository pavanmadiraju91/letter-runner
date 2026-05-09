import { events } from '../core/events.js';
import { getState, STATES } from '../core/state.js';
import { getScore } from '../systems/score.js';
import { getPersonalBest } from '../systems/storage.js';
import { getLeaderboard, qualifiesForLeaderboard, insertScore } from '../systems/leaderboard.js';

let phase = 'display'; // 'display' | 'name-entry' | 'done'
let initials = '';
let finalScore = 0;
let personalBest = 0;
let qualifies = false;
let flashTimer = 0;
let playerRank = -1; // rank after insertion (1-based), -1 if not inserted

/**
 * Keydown handler for name entry (captures Backspace, Enter, and letters).
 * Attached only during game-over name-entry phase.
 */
function onNameEntryKey(e) {
  if (getState() !== STATES.GAME_OVER || phase !== 'name-entry') return;

  const key = e.key;

  if (key === 'Backspace') {
    e.preventDefault();
    initials = initials.slice(0, -1);
    return;
  }

  if (key === 'Enter' && initials.length === 3) {
    e.preventDefault();
    playerRank = insertScore(initials, finalScore);
    phase = 'done';
    return;
  }

  // Single letter A-Z
  if (key.length === 1 && key.match(/[a-zA-Z]/)) {
    if (initials.length < 3) {
      initials += key.toUpperCase();
    }
  }
}

/**
 * Initialize the game over screen system.
 * Subscribes to STATE_CHANGE and KEY_PRESS events.
 */
export function createGameOverScreen() {
  // Listen for game-over state transition
  events.on('STATE_CHANGE', ({ state }) => {
    if (state === STATES.GAME_OVER) {
      finalScore = getScore();
      personalBest = getPersonalBest();
      qualifies = qualifiesForLeaderboard(finalScore);
      phase = qualifies ? 'name-entry' : 'done';
      initials = '';
      flashTimer = 0;
      playerRank = -1;

      if (qualifies) {
        window.addEventListener('keydown', onNameEntryKey);
      }
    }

    // Clean up name entry listener when leaving game-over
    if (state === STATES.PLAYING) {
      window.removeEventListener('keydown', onNameEntryKey);
    }
  });
}

/**
 * Returns whether the game-over screen is ready for restart
 * (name entry complete or not qualifying).
 * @returns {boolean}
 */
export function isReadyToRestart() {
  return phase === 'done';
}

/**
 * Update game over screen (advance flash timer).
 * @param {number} dt - delta time in seconds
 */
export function updateGameOverScreen(dt) {
  flashTimer += dt;
}

/**
 * Render the full game over screen.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width - canvas width
 * @param {number} height - canvas height
 */
export function renderGameOverScreen(ctx, width, height) {
  ctx.save();

  // Dark overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // GAME OVER title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px monospace';
  ctx.fillText('GAME OVER', width / 2, height * 0.15);

  // Final score
  ctx.font = 'bold 28px monospace';
  ctx.fillText('SCORE: ' + finalScore, width / 2, height * 0.25);

  // Personal best and delta
  ctx.font = '18px monospace';
  ctx.fillStyle = '#ffcc00';
  ctx.fillText('BEST: ' + personalBest, width / 2, height * 0.32);

  const delta = finalScore - personalBest;
  if (delta > 0) {
    ctx.fillStyle = '#00ff88';
    ctx.fillText('+' + delta + ' NEW BEST!', width / 2, height * 0.37);
  } else {
    ctx.fillStyle = '#ff4466';
    ctx.fillText(String(delta), width / 2, height * 0.37);
  }

  // Leaderboard
  const board = getLeaderboard();
  ctx.fillStyle = '#aaaaaa';
  ctx.font = '16px monospace';
  ctx.fillText('TOP 10', width / 2, height * 0.43);

  const startY = height * 0.48;
  const rowHeight = 20;

  for (let i = 0; i < board.length; i++) {
    const entry = board[i];
    const y = startY + i * rowHeight;
    const rank = String(i + 1).padStart(2, ' ');

    // Highlight player's new entry
    if (playerRank > 0 && i === playerRank - 1) {
      ctx.fillStyle = '#00ffcc';
    } else {
      ctx.fillStyle = '#cccccc';
    }

    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    const lineX = width / 2 - 100;
    ctx.fillText(rank + '.', lineX, y);
    ctx.textAlign = 'center';
    ctx.fillText(entry.initials, width / 2 - 30, y);
    ctx.textAlign = 'right';
    ctx.fillText(String(entry.score), width / 2 + 100, y);
  }

  ctx.textAlign = 'center';

  // Name entry or play again
  if (phase === 'name-entry') {
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.fillText('ENTER YOUR INITIALS', width / 2, height * 0.86);

    // Draw initials with underscores and cursor blink
    const blink = Math.floor(flashTimer * 2) % 2 === 0;
    let display = '';
    for (let i = 0; i < 3; i++) {
      if (i < initials.length) {
        display += initials[i] + ' ';
      } else if (i === initials.length && blink) {
        display += '_ ';
      } else {
        display += '_ ';
      }
    }
    ctx.font = 'bold 24px monospace';
    ctx.fillText(display.trim(), width / 2, height * 0.91);

    ctx.fillStyle = '#888888';
    ctx.font = '12px monospace';
    ctx.fillText('(ENTER to confirm)', width / 2, height * 0.95);
  } else if (phase === 'done') {
    const show = Math.floor(flashTimer * 2) % 2 === 0;
    if (show) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px monospace';
      ctx.fillText('Press any key to play again', width / 2, height * 0.90);
    }
  }

  ctx.restore();
}
