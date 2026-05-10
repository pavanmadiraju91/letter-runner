export const PALETTE_DARK = {
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
};

export const PALETTE_LIGHT = {
  // Muted accents for light backgrounds
  CYAN: '#009988',
  MAGENTA: '#cc2255',
  YELLOW: '#cc9900',
  GREEN: '#008855',
  BLUE: '#2255cc',
  PURPLE: '#7733bb',
  ORANGE: '#cc6633',

  // UI tones (inverted for light mode)
  WHITE: '#1a1a2e',
  LIGHT: '#2a2a3e',
  MID: '#556677',
  DIM: '#99aabb',
  DARK: '#e8e8f0',
  DARKER: '#f0f0f8',
  PANEL: 'rgba(255, 255, 255, 0.9)',

  // Entity-specific
  PLAYER_PRIMARY: '#009988',
  PLAYER_SECONDARY: '#006655',
  PLAYER_EYE: '#1a1a2e',
  OBSTACLE_BODY: '#e0e0ee',
  OBSTACLE_BORDER: '#cc2255',
  OBSTACLE_LETTER: '#1a1a2e',
  OBSTACLE_GLOW: '#cc2255',
  GROUND_BASE: '#d8d8e8',
  GROUND_LINE: '#c0c0d0',
  HEART_FULL: '#cc2255',
  HEART_EMPTY: '#d0d0dd',
  SCORE_TEXT: '#1a1a2e',
  LEVEL_TEXT: '#009988',
  BEST_TEXT: '#cc9900',
};

export const COLORS = {
  BG: '#0a0a0f',
  BG_LIGHT: '#f4f4fa',
  DEBUG_TEXT: '#3a3a4a',

  // Backward-compatible reference (dark palette is default for existing consumers)
  PALETTE: PALETTE_DARK,
};

export const SCORE = {
  DESTROY_POINTS: 10,
  SURVIVAL_RATE: 1  // +1 point per second
};

export const DIFFICULTY = {
  DESTROYS_PER_LEVEL: 10,       // DIFF-01: new level every 10 destroys
  MAX_OBSTACLES_CAP: 4,         // DIFF-06: absolute max on screen

  // Tier definitions: complexity gates only (speed is time-based via SPEED config)
  // Each tier: { maxObstacles, multiplier, tallObstacles }
  TIERS: [
    { maxObstacles: 1, multiplier: 1, tallObstacles: false },
    { maxObstacles: 2, multiplier: 1.5, tallObstacles: false },
    { maxObstacles: 2, multiplier: 1.5, tallObstacles: false },
    { maxObstacles: 2, multiplier: 2, tallObstacles: true },
    { maxObstacles: 2, multiplier: 2, tallObstacles: true },
    { maxObstacles: 3, multiplier: 3, tallObstacles: true },
  ],

  // Logarithmic scaling for levels beyond tier table (DIFF-09)
  // Beyond TIERS.length, multiplier scales logarithmically
  LOG_MULT_FACTOR: 0.5,
};

export const PARTICLES = {
  MAX_ACTIVE: 30,        // VFX-09: hard cap on simultaneous particles
  POOL_SIZE: 40,         // pre-allocate slightly more than max
  MIN_FPS: 30,           // VFX-10: skip particle spawning below this threshold
};

export const AUDIO = {
  MASTER_VOLUME: 0.4,
  SFX_VOLUME: 0.5,
  MUSIC_VOLUME: 0.15,
  MUSIC_FILE: './Tension Pixels.mp3',
  POP: { freq: 880, duration: 0.08, type: 'sine' },
  THUD: { freq: 120, duration: 0.2, type: 'sine' },
  GAME_OVER: { startFreq: 440, endFreq: 110, duration: 0.6, type: 'sawtooth' },
  LEVEL_UP: { notes: [523, 659, 784, 1047], noteDuration: 0.1, type: 'square' },
};

export const SPEED = {
  BASE_SPEED: 140,          // px/s at run start — 240px danger zone in 1.7s
  MAX_SPEED: 280,           // px/s hard cap (2x base) — danger zone in 0.85s
  ACCELERATION: 2.0,        // px/s gained per second of play
  WARMUP_TIME: 2.0,         // seconds before first obstacle may spawn
  MIN_REACTION_MS: 200,     // ms guaranteed reaction time for gap calculation
  BASE_SPAWN_INTERVAL: 2.5, // seconds between spawns at BASE_SPEED
  MIN_SPAWN_INTERVAL: 0.8,  // floor — never spawn faster than this
};

export const COMBO = {
  MIN_LEVEL_2LETTER: 4,       // COMBO-01: 2-letter combos appear at level 4+
  MIN_LEVEL_3LETTER: 7,       // COMBO-02: 3-letter combos appear at level 7+
  SPAWN_CHANCE_2LETTER: 0.30, // 30% chance a spawn becomes a 2-letter combo
  SPAWN_CHANCE_3LETTER: 0.25, // 25% chance (of remaining 70%) becomes 3-letter
  WIDTH_PER_LETTER: 44,       // each letter cell is 44px wide
  MULTIPLIER_2LETTER: 2.5,    // COMBO-07: scoring multiplier for 2-letter
  MULTIPLIER_3LETTER: 4.0,    // COMBO-07: scoring multiplier for 3-letter
  MAX_ON_SCREEN: 1,           // COMBO-08: only 1 combo obstacle at a time
};

export const OBSTACLE_VFX = {
  GLOW_PULSE_SPEED: 0.01,    // radians per ms for danger pulse
  GLOW_MIN_ALPHA: 0.4,       // minimum glow brightness
  GLOW_RANGE: 0.4,           // alpha oscillation range
  GLOW_PADDING: 3,           // px padding around obstacle for glow rect
  LETTER_FONT_SIZE: 26,      // px
  LETTER_OUTLINE_WIDTH: 3,   // px dark outline
};

export const PLAYER = {
  FRAME_COUNT: 10,
  FRAME_DURATION: 0.08,  // seconds per frame (12.5 FPS animation)
  BOB_AMPLITUDE: 2,      // 2px vertical bob
  BOB_SPEED: 12,         // radians/sec for bob cycle
};

export const GAME = {
  TARGET_FPS: 60,
  MAX_DT: 1 / 30,
  SCROLL_SPEED: 200,
  SPAWN_INTERVAL: 2.0,
  MIN_OBSTACLE_GAP: 120,
  MAX_OBSTACLES: 4,
  OBSTACLE_WIDTH: 52,
  OBSTACLE_HEIGHT: 56,
  PLAYER_WIDTH: 80,
  PLAYER_HEIGHT: 80,
  GROUND_HEIGHT: 60,
  PLAYER_X_PERCENT: 0.12,
  DANGER_ZONE_START: 0.3,
  STARTING_LIVES: 3,
  WRONG_KEY_DELAY: 0.3,
  WRONG_KEY_PENALTY_LEVEL: 4
};
