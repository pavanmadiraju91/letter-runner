# Features Research: Browser-Based Endless Runner / Typing Game

> Context: Letter Runner — endless runner where obstacles carry letters, press matching key to destroy. Desktop-first, no install, targets casual players and competitive typists.

---

## Table Stakes

These are non-negotiable. Without them, players close the tab within 30 seconds.

| Feature | Complexity | Notes |
|---------|-----------|-------|
| **Instant playability** | Low | Zero loading screens, no signup wall. Click/press key to start. |
| **Responsive controls** | Low | Sub-50ms input-to-action feedback. Typing games live or die here. |
| **Clear death/failure state** | Low | Player must immediately understand why they died. |
| **Score display** | Low | Current score always visible. Session high score shown on death. |
| **Restart with one action** | Low | Press any key or click to restart. No menus between attempts. |
| **Progressive difficulty** | Medium | Speed/complexity ramps over time. Flat difficulty = boring in 60s. |
| **Basic audio feedback** | Low | Key hit sound, death sound, ambient loop. Can be muted. |
| **Pause functionality** | Low | Tab-away or Escape pauses. Browser games MUST handle focus loss. |
| **Performance on mid-range hardware** | Medium | Consistent 60fps on 3-year-old laptops. No frame drops during gameplay. |
| **Visual clarity** | Medium | Letters must be instantly readable at speed. Contrast, size, font choice matter enormously. |
| **Mobile-aware messaging** | Low | If someone opens on mobile, show "desktop only" gracefully — don't break. |

---

## Differentiators

These separate forgettable games from ones players bookmark, share, and return to.

| Feature | Complexity | Why It Works |
|---------|-----------|--------------|
| **Word/phrase mode** | Medium | Instead of random letters, obstacles spell words. Adds cognitive layer — you're reading AND typing. |
| **Difficulty modes tied to typing skill** | Medium | Easy (home row), Medium (common words), Hard (symbols + numbers). Self-selection increases engagement. |
| **Daily challenge / seed** | Medium | Same sequence for all players each day. Creates shared experience and competition. "Did you beat today's run?" |
| **Ghost runs** | High | See a translucent replay of your best run (or a friend's). Powerful motivator. |
| **Combo system** | Low-Medium | Consecutive correct hits multiply score. Visible combo counter with satisfying visual escalation. |
| **Speed zones / tempo changes** | Medium | Sections where game speeds up/slows dramatically. Creates rhythm and narrative within a run. |
| **Themed visual environments** | Medium-High | Background/art shifts every N points. Forest, city, space. Gives sense of journey. |
| **Shareable results** | Low-Medium | "I scored 12,847 on Letter Runner" with a generated image card. One-click share to clipboard/Twitter. |
| **Typing accuracy stats** | Medium | Post-run breakdown: WPM during run, most-missed keys, accuracy %. Appeals to typing-improvement crowd. |
| **Unlockable cosmetics** | Medium | Character skins, trail effects, obstacle themes earned through play. Zero pay-to-win. |

---

## Anti-Features

Deliberately avoid these for v1. They add complexity disproportionate to value, or actively hurt the experience.

| Anti-Feature | Why Avoid |
|-------------|-----------|
| **User accounts / login** | Adds friction before first play. Use localStorage for persistence. Accounts can come later if needed. |
| **Multiplayer / real-time PvP** | Massive infrastructure complexity. Focus on async competition (leaderboards) first. |
| **Level editor** | Endless runner doesn't need authored levels. The algorithm IS the content. |
| **Tutorial / onboarding flow** | The game should teach through play in the first 5 seconds. If you need a tutorial, the design failed. |
| **Monetization systems** | Ads, IAP, premium currency — all poison trust for a v1. Build audience first. |
| **Story / narrative** | Endless runners don't need plot. The "story" is the escalating challenge. |
| **Complex upgrade trees** | RPG-style progression systems fragment the player base and require extensive balancing. |
| **Offline/PWA support** | Nice eventually but adds service worker complexity. v1 assumes connectivity. |
| **Cross-device sync** | Requires accounts (see above). localStorage is fine for v1. |
| **Accessibility beyond basics** | Full screen-reader support for a real-time typing game is an unsolved design problem. Start with colorblind mode and clear fonts. |

---

## Retention Mechanics

What makes players open the game again tomorrow.

### Short-term (within a session)
- **"One more try" loop** — Death-to-play in under 1 second. Remove all friction.
- **Near-miss feedback** — Show how close you were to beating your high score. "3 points away!"
- **Combo streaks** — Losing a 47-hit combo hurts. Players retry to protect the streak.
- **Skill ceiling visibility** — Show that better players score dramatically higher. Aspiration drives practice.

### Medium-term (across days)
- **Personal bests** — Persistent high score that's always visible. "Can I beat yesterday?"
- **Daily challenges** — Fresh seed each day. Time-limited creates urgency.
- **Stats over time** — "Your average WPM has improved 12% this week."
- **Unlockable milestones** — Reach 5,000 points to unlock new visual theme. Clear, achievable goals.

### Long-term (across weeks/months)
- **Leaderboards** — Global and friends. Even anonymous leaderboards with initials (arcade-style) work.
- **Seasonal events** — Monthly special modes or themed challenges.
- **Sharing / social proof** — Players who share attract new players who compete with them.

### Complexity estimates for retention features
| Mechanic | Complexity | Dependency |
|----------|-----------|------------|
| One-more-try loop | Low | Core game loop |
| Near-miss feedback | Low | Score system |
| Combo system | Low-Medium | Core game loop |
| Personal bests (localStorage) | Low | Score system |
| Daily challenge seed | Medium | Core game loop, date-based RNG |
| Stats tracking | Medium | Score system, localStorage |
| Unlockable milestones | Medium | Score system, asset pipeline |
| Leaderboard (anonymous) | Medium-High | Backend service |
| Shareable results | Low-Medium | Score system, canvas/image gen |

---

## Polish Features

Small investments that disproportionately improve perceived quality.

| Feature | Complexity | Impact |
|---------|-----------|--------|
| **Screen shake on hit** | Trivial | Makes every keypress feel powerful |
| **Particle effects on destroy** | Low | Letters exploding into fragments = satisfying |
| **Speed lines / motion blur** | Low | Communicates velocity without UI |
| **Score pop-up numbers** | Trivial | "+10" floating up from destroyed obstacle |
| **Subtle camera zoom at high speed** | Low | Increases tension as difficulty ramps |
| **Key press visual echo** | Trivial | Brief highlight showing which key was pressed |
| **Death slow-motion** | Low | 200ms slow-mo before death screen. Dramatic. |
| **Streak sound escalation** | Low | Audio pitch rises with combo. Musical feedback. |
| **High score celebration** | Low | Confetti/flash when beating personal best mid-run |
| **Smooth difficulty curve** | Medium | No sudden jumps. Player should never feel cheated. |
| **Predictable hitboxes** | Low | Slightly generous collision = feels fair. Slightly strict = feels unfair. |
| **Frame-rate independent physics** | Medium | Game plays identically at 60fps and 144fps. Delta-time movement. |
| **Preloaded assets** | Low | All sprites/sounds loaded before first frame. No pop-in. |
| **Favicon update with score** | Trivial | Tab shows current score. Players leave tab open. |

---

## Feature Dependencies

Build order matters. This graph shows what blocks what.

```
Core Game Loop (movement, collision, input)
├── Score System
│   ├── Personal Bests (localStorage)
│   ├── Combo System
│   │   └── Streak Sound Escalation
│   ├── Near-miss Feedback
│   ├── Shareable Results
│   └── Leaderboard (requires backend)
├── Progressive Difficulty
│   ├── Speed Zones
│   ├── Difficulty Modes
│   └── Daily Challenge (needs seeded RNG)
├── Audio System
│   ├── Hit/Miss Sounds
│   ├── Music Loop
│   └── Streak Escalation
├── Visual Polish
│   ├── Particles
│   ├── Screen Shake
│   ├── Death Slow-mo
│   └── Themed Environments (requires asset pipeline)
├── Word/Phrase Mode (requires letter sequencing logic)
└── Stats/Analytics
    ├── Per-run Stats
    ├── Historical Tracking
    └── Unlockable Milestones
```

### Critical Path for v1
1. Core game loop (input, movement, collision)
2. Score system + personal bests
3. Progressive difficulty
4. Audio feedback (basic)
5. Visual polish (particles, shake, speed lines)
6. Combo system
7. Restart loop optimization (death-to-play < 1s)
8. Difficulty modes

### Can Be Added Post-Launch Without Refactoring
- Daily challenges (just needs seeded RNG layer)
- Shareable results (screenshot/canvas generation)
- Themed environments (asset swap, no logic change)
- Stats tracking (instrument existing score events)
- Leaderboard (separate backend, API call on death)

### Requires Early Architectural Decisions
- **Frame-rate independence** — Must be in from day one. Retrofitting delta-time is painful.
- **Seeded RNG** — If daily challenges are planned, RNG must be seedable from the start.
- **Event system** — Polish features (particles, sounds, shake) should react to game events, not be hardcoded into game logic.
- **Asset loading strategy** — Decide spritesheet vs individual images early. Affects all visual work.

---

## Summary: Recommended v1 Scope

**Build these (table stakes + key differentiators):**
- Instant-play loop with one-key restart
- Progressive difficulty with clear visual/audio ramps
- Combo system with streak feedback
- Personal best tracking (localStorage)
- 2-3 difficulty modes (letter sets)
- Basic audio (hit, miss, ambient)
- Polish: particles, shake, speed lines, death slow-mo
- Shareable score card

**Plan architecture for (build in v1.1-v1.2):**
- Daily challenges
- Word/phrase mode
- Stats breakdown
- Leaderboard
- Unlockable cosmetics

**Explicitly defer (v2+):**
- Accounts/login
- Multiplayer
- Mobile support
- Monetization
