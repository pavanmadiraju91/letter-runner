const STORAGE_KEY = 'letter-runner-pb';

/**
 * Get personal best score from localStorage.
 * Returns 0 if absent, NaN, or localStorage unavailable.
 */
export function getPersonalBest() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return 0;
    const parsed = parseInt(raw, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
}

/**
 * Save personal best score to localStorage.
 * Only writes if score exceeds current best.
 * @param {number} score - new score to compare
 * @returns {boolean} true if personal best was updated
 */
export function setPersonalBest(score) {
  try {
    const current = getPersonalBest();
    if (score > current) {
      localStorage.setItem(STORAGE_KEY, String(score));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
