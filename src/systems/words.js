import { WORDS, getWordConfig } from '../config.js';
import { getLevel } from './difficulty.js';
import { isTouchDevice } from './input.js';

const SHORT_WORDS = [
  'cat', 'run', 'jump', 'fly', 'zip', 'pop', 'zap', 'win', 'hit', 'aim',
  'dash', 'fast', 'glow', 'beam', 'star', 'moon', 'fire', 'bolt', 'spin',
  'flip', 'buzz', 'warp', 'zoom', 'neon', 'void', 'dark', 'nova', 'orb',
  'hex', 'ion', 'arc', 'jet', 'lab', 'bit', 'ram', 'cpu', 'net', 'key',
  'tap', 'code', 'hack', 'ping', 'data', 'byte', 'loop', 'node', 'sync',
  'flux', 'grid', 'core', 'chip', 'link', 'port', 'disk', 'wave', 'tone',
  'bass', 'drum', 'drop', 'flow', 'rush', 'fury', 'rage', 'calm', 'cool',
  'burn', 'grit', 'edge', 'apex', 'peak', 'rise', 'fall', 'dusk', 'dawn',
  'haze', 'mist', 'dust', 'ash', 'fog', 'ice', 'gem', 'rock', 'sand',
  'reef', 'tide', 'surf', 'wind', 'gust', 'bolt', 'jolt', 'spark', 'amp'
];

const MEDIUM_WORDS = [
  'space', 'laser', 'orbit', 'comet', 'solar', 'lunar', 'steel', 'power',
  'turbo', 'hyper', 'blaze', 'flame', 'storm', 'swift', 'speed', 'force',
  'crash', 'blast', 'pulse', 'surge', 'drift', 'glide', 'shift', 'phase',
  'cyber', 'pixel', 'voxel', 'robot', 'mecha', 'titan', 'omega', 'alpha',
  'delta', 'sigma', 'gamma', 'prime', 'ultra', 'super', 'mega', 'giga',
  'light', 'night', 'shadow', 'ghost', 'frost', 'spark', 'flash', 'blitz',
  'quake', 'smash', 'strike', 'combo', 'chain', 'bonus', 'score', 'level',
  'arena', 'quest', 'grind', 'loot', 'spawn', 'dodge', 'block', 'parry',
  'input', 'debug', 'stack', 'array', 'class', 'float', 'const', 'yield',
  'async', 'fetch', 'parse', 'build', 'merge', 'patch', 'trunk', 'shell'
];

const LONG_WORDS = [
  'rocket', 'galaxy', 'cosmic', 'nebula', 'photon', 'quasar', 'pulsar',
  'plasma', 'proton', 'fusion', 'meteor', 'saturn', 'jupiter', 'stellar',
  'eclipse', 'horizon', 'gravity', 'quantum', 'energy', 'engine', 'turbo',
  'voltage', 'circuit', 'digital', 'analog', 'binary', 'matrix', 'system',
  'module', 'kernel', 'thread', 'socket', 'server', 'render', 'shader',
  'vortex', 'inferno', 'typhoon', 'thunder', 'blizzard', 'cyclone',
  'phoenix', 'dragon', 'falcon', 'raptor', 'hunter', 'ranger', 'knight',
  'arcade', 'retro', 'legacy', 'gaming', 'player', 'master', 'expert',
  'stealth', 'cipher', 'decode', 'unlock', 'breach', 'launch', 'deploy',
  'sprint', 'turbo', 'nitro', 'blazer', 'streak', 'frenzy', 'mayhem',
  'cosmic', 'astral', 'zenith', 'vertex', 'prism', 'crystal', 'obsidian'
];

/**
 * Get a random word appropriate for the current level.
 * L7-9: short words (3-4 chars)
 * L10-12: medium words (4-6 chars)
 * L13+: long words (5-8 chars)
 * Higher levels mix in longer words with increasing probability.
 */
export function getRandomWord(level) {
  if (level === undefined) level = getLevel();
  const cfg = getWordConfig();

  if (level >= cfg.MIN_LEVEL_LONG_WORD) {
    const roll = Math.random();
    if (roll < 0.5) return pickFrom(LONG_WORDS);
    if (roll < 0.8) return pickFrom(MEDIUM_WORDS);
    return pickFrom(SHORT_WORDS);
  }

  if (level >= cfg.MIN_LEVEL_MEDIUM_WORD) {
    const roll = Math.random();
    if (roll < 0.6) return pickFrom(MEDIUM_WORDS);
    return pickFrom(SHORT_WORDS);
  }

  return pickFrom(SHORT_WORDS);
}

/**
 * Check if word spawns are enabled for the current level.
 */
export function canSpawnWords(level) {
  if (level === undefined) level = getLevel();
  const cfg = getWordConfig();
  return level >= cfg.MIN_LEVEL_SHORT_WORD;
}

export function getWordSpawnChance() {
  return getWordConfig().SPAWN_CHANCE_WORD;
}

function pickFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}
