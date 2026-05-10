import { events } from '../core/events.js';
import { AUDIO } from '../config.js';

let audioCtx = null;
let masterGain = null;
let sfxGain = null;
let musicGain = null;
let audioReady = false;
let musicEnabled = false;

// MP3 music state
let musicBuffer = null;
let musicSource = null;

/**
 * Load the background music MP3 into an AudioBuffer.
 */
async function loadMusic() {
  try {
    const response = await fetch(AUDIO.MUSIC_FILE);
    const arrayBuffer = await response.arrayBuffer();
    musicBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } catch (e) {
    // Silently fail — music is optional, SFX still work
    console.warn('Failed to load music:', e);
  }
}

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

      // Pre-load the music track
      loadMusic();
    }).catch(() => {
      // Safari may reject resume() silently — ignore to prevent unhandled rejection
    });

    window.removeEventListener('keydown', initAudio);
  };

  window.addEventListener('keydown', initAudio);

  // M-key toggles background music
  window.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
      toggleMusic();
    }
  });

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
  try { osc.stop(audioCtx.currentTime + AUDIO.POP.duration); } catch (_) { /* Safari: already stopped */ }
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
  try { osc.stop(audioCtx.currentTime + AUDIO.THUD.duration); } catch (_) { /* Safari: already stopped */ }
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
  try { osc.stop(audioCtx.currentTime + AUDIO.GAME_OVER.duration); } catch (_) { /* Safari: already stopped */ }
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
    try { osc.stop(startTime + noteDuration); } catch (_) { /* Safari: already stopped */ }
  }
}

/**
 * Start the background music loop (internal).
 * Plays the decoded MP3 buffer via BufferSourceNode with loop enabled.
 */
function startMusic() {
  if (!audioReady || !musicBuffer || musicSource) return;

  musicSource = audioCtx.createBufferSource();
  musicSource.buffer = musicBuffer;
  musicSource.loop = true;
  musicSource.connect(musicGain);
  musicSource.start(0);
}

/**
 * Stop the background music loop (internal).
 */
function stopMusic() {
  if (musicSource) {
    try { musicSource.stop(); } catch (_) { /* already stopped */ }
    musicSource.disconnect();
    musicSource = null;
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
