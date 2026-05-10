# Letter Runner 🐱⌨️

A fast-paced typing game set in space. Destroy approaching letters by typing them before they reach your cat. As you level up, letters get faster, combos appear, and the challenge intensifies.

**[▶ Play Now](https://pavanmadiraju91.github.io/letter-runner/)**

![Letter Runner](https://img.shields.io/badge/game-live-00ffcc?style=for-the-badge)

## How to Play

- **Type the letter/number** you see floating towards your cat
- **Case matters** — `a` and `A` are different (Shift + key for uppercase)
- **Combos** appear at higher levels — type the sequence left-to-right
- **Wrong key** = red flash + input lock penalty at level 4+
- **Lose a life** = drop one level + speed reduction (fight back!)
- **3 lives** — lose them all and it's game over

### Controls

| Key | Action |
|-----|--------|
| Any letter/number | Destroy matching obstacle |
| Tab | Toggle music on/off |
| Any key on Game Over | Restart |

### Mobile

Tap the screen to start — virtual keyboard opens automatically.

## Features

- 🌌 Space theme with nebula background and glowing energy beam
- 🐱 Animated pixel-art cat character
- 🎵 Background music track ("Tension Pixels") with Tab toggle
- ⚡ Chrome dino-inspired speed progression (linear ramp, hard cap)
- 🔤 Case-sensitive letters + numbers + multi-letter combos
- 💥 Screen shake, combo streaks, rising audio pitch, speed lines
- 🎯 Death slow-mo (hitstop) for dramatic game-over moments
- 📱 Mobile support with virtual keyboard
- 🏆 Personal best saved locally

## Tech Stack

- HTML5 Canvas + vanilla JavaScript (no frameworks)
- Vite 6 for dev server and build
- Web Audio API (procedural SFX + MP3 music)
- Zero runtime dependencies
- ~33KB JS bundle

## Development

```bash
# Install
npm install

# Dev server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Contributing

Contributions welcome! Here's how:

1. **Fork** this repo
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/letter-runner.git`
3. **Install**: `npm install`
4. **Run**: `npm run dev` → open http://localhost:3000
5. **Make changes** — the game is vanilla JS, no framework to learn
6. **Test** in browser — verify gameplay feels right
7. **Commit** with descriptive messages
8. **Push** and open a **Pull Request**

### Project Structure

```
src/
├── main.js              # Game bootstrap and loop wiring
├── config.js            # All game constants (speed, difficulty, colors)
├── core/
│   ├── canvas.js        # DPR-aware canvas setup
│   ├── events.js        # Pub/sub event bus
│   ├── game-loop.js     # requestAnimationFrame with delta-time
│   ├── state.js         # Game state machine (Menu/Playing/GameOver)
│   └── theme.js         # Dark mode (forced)
├── entities/
│   ├── player.js        # Cat sprite animation
│   ├── obstacle.js      # Letter rendering + effects
│   ├── ground.js        # Ground line positioning
│   └── background.js    # Space background (stars, nebula, speed lines)
├── systems/
│   ├── audio.js         # Web Audio API (SFX + music)
│   ├── combo.js         # Streak tracking
│   ├── difficulty.js    # Speed progression + level system
│   ├── fps-monitor.js   # Performance tracking
│   ├── hud.js           # Score/level/hearts display
│   ├── input.js         # Keyboard + mobile input
│   ├── level-announce.js # Level-up overlay
│   ├── lives.js         # Life system
│   ├── matcher.js       # Letter matching logic
│   ├── particles.js     # Particle effects
│   ├── pool.js          # Object pooling
│   ├── score.js         # Scoring system
│   ├── spawner.js       # Obstacle spawning
│   ├── storage.js       # localStorage persistence
│   └── vfx.js           # Screen shake, flashes
└── screens/
    ├── start.js         # Title screen
    └── game-over.js     # Game over screen
```

### Ideas for Contributions

- **New obstacle types** — different shapes, behaviors
- **Power-ups** — slow time, extra life, score multiplier
- **Themes** — different color palettes, backgrounds
- **Sound packs** — alternative SFX/music
- **Accessibility** — screen reader support, colorblind modes
- **Difficulty modes** — easy/normal/hard presets
- **Stats** — WPM tracking, accuracy, per-key heatmap
- **Daily challenge** — seeded random for shared competition

## License

MIT — do whatever you want with it.

## Credits

- Cat sprites: [Free Cat Character Animations](https://www.gameart2d.com/)
- Music: "Tension Pixels"
- Built with ☕ and Claude Code
