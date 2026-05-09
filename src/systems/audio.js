import { events } from '../core/events.js';
import { AUDIO } from '../config.js';

let audioCtx = null;
let masterGain = null;
let sfxGain = null;
let musicGain = null;
let audioReady = false;
let musicEnabled = false;
let musicOsc = null;
let musicFilter = null;

/**
 * Initialize the audio system.
 * Registers a one-time keydown listener to create and resume AudioContext
 * (browser autoplay policy compliance — AUD-05).
 * Music starts muted by default (AUD-04).
 */
export function createAudioSystem() {
  const initAudio = () => {
    if (audioReady) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume().then(() => {
      // Master gain
      masterGain = audioCtx.createGain();
      masterGain.gain.value = AUDIO.MASTER_VOLUME;
      masterGain.connect(audioCtx.destination);

      // SFX gain
      sfxGain = audioCtx.createGain();
      sfxGain.gain.value = AUDIO.SFX_VOLUME;
      sfxGain.connect(masterGain);

      // Music gain (muted by default)
      musicGain = audioCtx.createGain();
      musicGain.gain.value = 0;
      musicGain.connect(masterGain);

      audioReady = true;
    });

    window.removeEventListener('keydown', initAudio);
  };

  window.addEventListener('keydown', initAudio);

  // Wire sound effects to game events
  events.on('OBSTACLE_DESTROYED', () => { playPop(); });
  events.on('LIFE_LOST', () => { playThud(); });
  events.on('LEVEL_UP', () => { playLevelUp(); });

  // Consolidated STATE_CHANGE listener: game-over sound + music control
  events.on('STATE_CHANGE', ({ state }) => {
    if (state === 'game_over') {
      playGameOver();
      stopMusic();
    } else if (state === 'playing' && musicEnabled) {
      startMusic();
    }
  });
}

/**
 * Play a short pop sound (AUD-01).
 * Used for correct letter matches / obstacle destroyed.
 */
export function playPop() {
  if (!audioReady) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = AUDIO.POP.type;
  osc.frequency.value = AUDIO.POP.freq;

  gain.gain.setValueAtTime(1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + AUDIO.POP.duration);

  osc.connect(gain);
  gain.connect(sfxGain);

  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + AUDIO.POP.duration);
}

/**
 * Play a low thud sound (AUD-02).
 * Used for wrong key / obstacle missed.
 */
export function playThud() {
  if (!audioReady) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = AUDIO.THUD.type;
  osc.frequency.value = AUDIO.THUD.freq;

  gain.gain.setValueAtTime(1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + AUDIO.THUD.duration);

  osc.connect(gain);
  gain.connect(sfxGain);

  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + AUDIO.THUD.duration);
}

/**
 * Play a descending game-over sound (AUD-03).
 * Sawtooth sweep from 440Hz down to 110Hz.
 */
export function playGameOver() {
  if (!audioReady) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = AUDIO.GAME_OVER.type;
  osc.frequency.setValueAtTime(AUDIO.GAME_OVER.startFreq, audioCtx.currentTime);
  osc.frequency.linearRampToValueAtTime(AUDIO.GAME_OVER.endFreq, audioCtx.currentTime + AUDIO.GAME_OVER.duration);

  gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + AUDIO.GAME_OVER.duration);

  osc.connect(gain);
  gain.connect(sfxGain);

  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + AUDIO.GAME_OVER.duration);
}

/**
 * Play a level-up arpeggio (AUD-06).
 * 4 ascending square-wave notes: C5, E5, G5, C6.
 */
export function playLevelUp() {
  if (!audioReady) return;

  const { notes, noteDuration, type } = AUDIO.LEVEL_UP;

  for (let i = 0; i < notes.length; i++) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.value = notes[i];

    const startTime = audioCtx.currentTime + i * noteDuration;
    gain.gain.setValueAtTime(0.6, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration * 0.9);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(startTime);
    osc.stop(startTime + noteDuration);
  }
}

/**
 * Start the background music loop (internal).
 * Low-frequency sawtooth through a lowpass filter.
 */
function startMusic() {
  if (!audioReady || musicOsc) return;

  musicOsc = audioCtx.createOscillator();
  musicFilter = audioCtx.createBiquadFilter();

  musicOsc.type = 'sawtooth';
  musicOsc.frequency.value = AUDIO.MUSIC.baseFreq;

  musicFilter.type = 'lowpass';
  musicFilter.frequency.value = AUDIO.MUSIC.filterFreq;

  musicOsc.connect(musicFilter);
  musicFilter.connect(musicGain);

  musicOsc.start(audioCtx.currentTime);
}

/**
 * Stop the background music loop (internal).
 */
function stopMusic() {
  if (musicOsc) {
    musicOsc.stop(audioCtx.currentTime);
    musicOsc.disconnect();
    musicFilter.disconnect();
    musicOsc = null;
    musicFilter = null;
  }
}

/**
 * Toggle background music on/off (AUD-04).
 * Music is muted by default.
 */
export function toggleMusic() {
  if (!audioReady) return;

  musicEnabled = !musicEnabled;

  if (musicEnabled) {
    musicGain.gain.value = AUDIO.MUSIC_VOLUME;
    startMusic();
  } else {
    musicGain.gain.value = 0;
    stopMusic();
  }
}

/**
 * Returns whether music is currently enabled.
 */
export function isMusicPlaying() {
  return musicEnabled;
}
