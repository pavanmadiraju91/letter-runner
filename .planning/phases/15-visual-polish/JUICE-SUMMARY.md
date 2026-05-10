# Game Juice Features Summary

**Completed:** 2026-05-10
**Duration:** Single session
**Tasks:** 6/6

## One-liner

Six game juice features: screen shake, combo streaks with HUD, rising pitch, speed lines, milestone dings, and death hitstop.

## Features Implemented

### 1. Screen Shake on Obstacle Destroy (`3c260c7`)
- Added `shakeTimer` and `shakeIntensity` tracking in `vfx.js`
- 2px shake for single letter destroys, 4px for combo obstacles
- Applied via `ctx.translate()` in render loop with linear decay over 100ms
- Game-over screen rendered outside shake transform for stability

### 2. Combo Streak System with HUD Display (`75e688a`)
- New `src/systems/combo.js` module tracks consecutive destroys
- Multiplier tiers: streak 3=x2, 5=x3, 10=x5, 20=x10
- Emits `COMBO_UPDATE` event consumed by score, audio, and HUD
- Score system applies streak multiplier on top of level and combo-size multipliers
- HUD displays pulsing yellow multiplier text (oscillating size) when streak >= 3

### 3. Rising Audio Pitch on Streak (`e4d43a9`)
- `playPop()` now accepts optional pitch parameter
- Base pitch 440Hz, each streak step multiplies by semitone (1.0595)
- Capped at 12 semitones (one octave) to stay musical
- Resets to base on streak break (COMBO_UPDATE with streak=0)

### 4. Speed Lines at High Velocity (`818728e`)
- When speed > 70% of max, horizontal speed lines appear
- 12 pre-allocated lines with varying lengths (30-90px) and speeds
- Lines are 1px semi-transparent cyan, max 25% opacity at top speed
- Count scales linearly from 0 to 12 as speed ratio goes 0.7 to 1.0
- Lines wrap around when scrolling offscreen left

### 5. 100-Point Milestone Dings (`bd01d1c`)
- `checkMilestone()` detects 100-point boundary crossings
- `playDing()` plays triangle wave at 1320Hz (E6) for 150ms — distinctly higher than pop
- Emits `SCORE_MILESTONE` event for visual feedback
- HUD score text briefly flashes white (fades over 300ms)
- Milestone counter resets on game restart

### 6. Death Slow-Mo Hitstop (`8b6bbb4`)
- On `STATE_CHANGE` to GAME_OVER, sets 80ms hitstop timer
- During hitstop: all game updates frozen, last frame stays rendered
- Game-over overlay suppressed until hitstop expires
- Creates dramatic weight/pause on the final death moment
- Timer cleared on restart

## Files Modified

| File | Changes |
|------|---------|
| `src/systems/vfx.js` | Screen shake state + getScreenShake export |
| `src/systems/combo.js` | **NEW** — streak tracking module |
| `src/systems/score.js` | Streak multiplier integration |
| `src/systems/audio.js` | Rising pitch, milestone ding, getScore import |
| `src/systems/hud.js` | Combo display, milestone flash |
| `src/entities/background.js` | Speed lines rendering |
| `src/main.js` | Shake transform, hitstop, combo wiring |

## Architecture Notes

- All features are event-driven — no tight coupling between systems
- Combo system is decoupled: emits COMBO_UPDATE, consumers decide how to react
- No config.js changes needed (COMBO section already existed for spawn-combo)
- Streak multiplier stacks multiplicatively: `basePoints * levelMult * comboSizeMult * streakMult`
- Speed lines use pre-allocated array to avoid GC pressure during gameplay

## Commits

| Hash | Message |
|------|---------|
| `3c260c7` | feat: add screen shake on obstacle destroy |
| `75e688a` | feat: add combo streak system with HUD display |
| `e4d43a9` | feat: add rising audio pitch on streak |
| `818728e` | feat: add speed lines at high velocity |
| `bd01d1c` | feat: add 100-point milestone dings |
| `8b6bbb4` | feat: add death slow-mo hitstop |

## Deviations from Plan

None — plan executed exactly as written.
