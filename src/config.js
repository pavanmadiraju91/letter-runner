export const COLORS = {
  BG: '#0a0a0f',
  DEBUG_TEXT: '#3a3a4a',

  PALETTE: {
    // Neon accents
    CYAN: '#00ffcc',
    MAGENTA: '#ff2266',
    YELLOW: '#ffcc00',
    GREEN: '#00ff88',
    BLUE: '#4488ff',
    PURPLE: '#aa44ff',
    ORANGE: '#ff8844',

    // UI tones
    WHITE: '#ffffff',
    LIGHT: '#ccddee',
    MID: '#667788',
    DIM: '#334455',
    DARK: '#1a1a2e',
    DARKER: '#12121f',
    PANEL: 'rgba(0, 0, 0, 0.85)',

    // Entity-specific
    PLAYER_PRIMARY: '#00ffcc',
    PLAYER_SECONDARY: '#008866',
    PLAYER_EYE: '#ffffff',
    OBSTACLE_BODY: '#1a1a2e',
    OBSTACLE_BORDER: '#ff2266',
    OBSTACLE_LETTER: '#ffffff',
    OBSTACLE_GLOW: '#ff2266',
    GROUND_BASE: '#1a1a2e',
    GROUND_LINE: '#2a2a4e',
    HEART_FULL: '#ff3366',
    HEART_EMPTY: '#2a2a3a',
    SCORE_TEXT: '#ffffff',
    LEVEL_TEXT: '#00ffcc',
    BEST_TEXT: '#ffcc00',
  }
};

export const SCORE = {
  DESTROY_POINTS: 10,
  SURVIVAL_RATE: 1  // +1 point per second
};

export const DIFFICULTY = {
  DESTROYS_PER_LEVEL: 10,       // DIFF-01: new level every 10 destroys
  MAX_OBSTACLES_CAP: 4,         // DIFF-06: absolute max on screen

  // Tier definitions (DIFF-02 through DIFF-05)
  // Each tier: { scrollSpeed, spawnInterval, maxObstacles, multiplier, tallObstacles }
  TIERS: [
    // Level 1 (index 0): slow, approachable
    { scrollSpeed: 140, spawnInterval: 2.5, maxObstacles: 1, multiplier: 1, tallObstacles: false },
    // Level 2 (index 1): medium
    { scrollSpeed: 180, spawnInterval: 2.0, maxObstacles: 2, multiplier: 1.5, tallObstacles: false },
    // Level 3 (index 2): medium+
    { scrollSpeed: 210, spawnInterval: 1.7, maxObstacles: 2, multiplier: 1.5, tallObstacles: false },
    // Level 4 (index 3): fast, tall obstacles introduced
    { scrollSpeed: 250, spawnInterval: 1.4, maxObstacles: 2, multiplier: 2, tallObstacles: true },
    // Level 5 (index 4): fast+
    { scrollSpeed: 280, spawnInterval: 1.2, maxObstacles: 2, multiplier: 2, tallObstacles: true },
    // Level 6+ (index 5): very fast — used as base for logarithmic scaling beyond
    { scrollSpeed: 310, spawnInterval: 1.0, maxObstacles: 3, multiplier: 3, tallObstacles: true },
  ],

  // Logarithmic scaling for levels beyond tier table (DIFF-09)
  // Beyond TIERS.length, values scale logarithmically:
  //   scrollSpeed += LOG_SPEED_FACTOR * ln(level - TIERS.length + 1)
  //   spawnInterval -= LOG_SPAWN_FACTOR * ln(level - TIERS.length + 1)  (min 0.6)
  //   multiplier += LOG_MULT_FACTOR * ln(level - TIERS.length + 1)
  LOG_SPEED_FACTOR: 20,
  LOG_SPAWN_FACTOR: 0.08,
  LOG_MULT_FACTOR: 0.5,
  MIN_SPAWN_INTERVAL: 0.6,
};

export const PARTICLES = {
  MAX_ACTIVE: 30,        // VFX-09: hard cap on simultaneous particles
  POOL_SIZE: 40,         // pre-allocate slightly more than max
  MIN_FPS: 30,           // VFX-10: skip particle spawning below this threshold
};

export const GAME = {
  TARGET_FPS: 60,
  MAX_DT: 1 / 30,
  SCROLL_SPEED: 200,
  SPAWN_INTERVAL: 2.0,
  MIN_OBSTACLE_GAP: 120,
  MAX_OBSTACLES: 4,
  OBSTACLE_WIDTH: 48,
  OBSTACLE_HEIGHT: 56,
  PLAYER_WIDTH: 32,
  PLAYER_HEIGHT: 32,
  GROUND_HEIGHT: 40,
  PLAYER_X_PERCENT: 0.12,
  DANGER_ZONE_START: 0.3,
  STARTING_LIVES: 3,
  WRONG_KEY_DELAY: 0.3,
  WRONG_KEY_PENALTY_LEVEL: 4
};
