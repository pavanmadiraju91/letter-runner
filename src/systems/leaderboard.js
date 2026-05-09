const STORAGE_KEY = 'letter-runner-lb';

const DEFAULT_BOARD = [
  { initials: 'AAA', score: 5000 },
  { initials: 'BBB', score: 4200 },
  { initials: 'CCC', score: 3500 },
  { initials: 'DDD', score: 2800 },
  { initials: 'EEE', score: 2200 },
  { initials: 'FFF', score: 1800 },
  { initials: 'GGG', score: 1400 },
  { initials: 'HHH', score: 1000 },
  { initials: 'III', score: 700 },
  { initials: 'JJJ', score: 400 },
];

let board = loadBoard();

/**
 * Load leaderboard from localStorage, falling back to default.
 */
function loadBoard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [...DEFAULT_BOARD];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [...DEFAULT_BOARD];
    return parsed;
  } catch {
    return [...DEFAULT_BOARD];
  }
}

/**
 * Save current board to localStorage.
 */
function saveBoard() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

/**
 * Get the current leaderboard (sorted descending by score, top 10).
 * @returns {Array<{initials: string, score: number}>}
 */
export function getLeaderboard() {
  return board.slice(0, 10);
}

/**
 * Check if a score qualifies for the top 10 leaderboard.
 * @param {number} score
 * @returns {boolean}
 */
export function qualifiesForLeaderboard(score) {
  if (board.length < 10) return true;
  return score > board[board.length - 1].score;
}

/**
 * Insert a score into the leaderboard.
 * Sorts descending, trims to 10 entries, and persists to localStorage.
 * @param {string} initials - 3-character initials (will be uppercased and trimmed)
 * @param {number} score
 * @returns {number} 1-based rank where the score was inserted
 */
export function insertScore(initials, score) {
  const entry = {
    initials: initials.toUpperCase().slice(0, 3),
    score
  };
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  board = board.slice(0, 10);
  saveBoard();

  // Find rank (1-based)
  const rank = board.indexOf(entry) + 1;
  return rank;
}
