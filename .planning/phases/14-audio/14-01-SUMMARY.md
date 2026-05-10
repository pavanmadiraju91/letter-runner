---
phase: 14-audio
plan: 01
subsystem: audio
tags: [web-audio-api, mp3, background-music, buffer-source]
dependency-graph:
  requires: []
  provides: [mp3-background-music, music-toggle]
  affects: []
tech-stack:
  added: []
  patterns: [fetch-decode-buffersource, loop-playback]
key-files:
  created:
    - public/Tension Pixels.mp3
  modified:
    - src/systems/audio.js
    - src/config.js
decisions:
  - id: AUD-MP3-01
    decision: "Use fetch + decodeAudioData + BufferSourceNode for MP3 playback"
    reason: "Standard Web Audio API pattern, no library needed, supports loop"
  - id: AUD-MP3-02
    decision: "Pre-load music on AudioContext init, not on toggle"
    reason: "Avoids latency on first M-key press"
metrics:
  duration: ~45s
  completed: 2026-05-10
---

# Phase 14 Plan 01: MP3 Background Music Summary

**One-liner:** Replace procedural oscillator music with Tension Pixels.mp3 via fetch/decodeAudioData/BufferSourceNode at 15% volume, looped, M-key toggled.

## What Was Done

### Task 1: Replace procedural music with MP3 playback

- Removed the sawtooth oscillator + lowpass filter music code (startMusic/stopMusic used `createOscillator` with biquad filter)
- Added `MUSIC_FILE: './Tension Pixels.mp3'` to AUDIO config
- Removed the now-unused `MUSIC: { baseFreq, filterFreq }` config entry
- Implemented `loadMusic()` async function: fetch -> arrayBuffer -> decodeAudioData
- Rewrote `startMusic()` to create a BufferSourceNode with `loop = true`
- Rewrote `stopMusic()` to stop and disconnect the BufferSourceNode
- `toggleMusic()` unchanged in interface (sets musicGain, calls start/stop)
- Music pre-loaded during AudioContext initialization
- All 4 SFX functions (playPop, playThud, playGameOver, playLevelUp) left completely untouched

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

| Check | Result |
|-------|--------|
| `grep MUSIC_FILE src/config.js` | PASS |
| `grep MUSIC_VOLUME.*0.15 src/config.js` | PASS |
| `grep decodeAudioData src/systems/audio.js` | PASS |
| `grep "loop = true" src/systems/audio.js` | PASS |
| No sawtooth in audio.js | PASS (0 occurrences) |
| `npx vite build` | PASS (156ms, 28 modules) |

## Commits

| Hash | Message |
|------|---------|
| 4a9ba58 | feat(14-01): replace procedural music with MP3 track playback |

## Next Phase Readiness

- Audio phase complete (single plan)
- No blockers for Phase 15 (Visual Polish)
