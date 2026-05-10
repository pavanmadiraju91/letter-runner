# Requirements: Letter Runner v1.1

**Defined:** 2026-05-10
**Core Value:** The game must feel immediately fun — start instantly, see letters clearly, press keys satisfyingly, and feel difficulty rising in a way that challenges without frustrating.
**Milestone:** v1.1 Polish & Depth

## v1.1 Requirements

### Removal

- [ ] **REM-01**: Remove leaderboard UI from game-over screen
- [ ] **REM-02**: Remove name entry (3-char initials) from game-over flow
- [ ] **REM-03**: Remove leaderboard.js module and all references
- [ ] **REM-04**: Game-over screen shows only: final score, personal best, delta, "Play again" prompt

### Multi-Letter Combos

- [ ] **COMBO-01**: At level 4+, some obstacles display 2-letter sequences (e.g., "XY")
- [ ] **COMBO-02**: At level 7+, some obstacles display 3-letter sequences (e.g., "ABC")
- [ ] **COMBO-03**: Combo obstacles are wider blocks with individual letter cells
- [ ] **COMBO-04**: Letters in combo must be typed left-to-right in sequence
- [ ] **COMBO-05**: Completed letters highlight green, next target pulses yellow, pending shows red
- [ ] **COMBO-06**: Wrong key mid-sequence resets progress to 0 and triggers wrong-key penalty
- [ ] **COMBO-07**: Combo scoring: 2.5x multiplier for 2-letter, 4x for 3-letter
- [ ] **COMBO-08**: Max 1 combo obstacle on screen at a time
- [ ] **COMBO-09**: All letters across all obstacles (single + combo) remain globally unique

### Speed & Difficulty

- [ ] **SPD-01**: Speed progression follows Chrome dino pattern: linear acceleration with hard cap at 2x starting speed
- [ ] **SPD-02**: Starting obstacle speed calibrated for 300ms+ reaction time (comfortable for average typists)
- [ ] **SPD-03**: Max speed requires ~150ms reaction time (challenging for good typists, not impossible)
- [ ] **SPD-04**: Speed increase is 0.001 per pixel traveled (Chrome dino coefficient)
- [ ] **SPD-05**: Minimum gap between obstacles guarantees fairness (physically possible to react)
- [ ] **SPD-06**: First obstacle doesn't appear until 2 seconds into a run (Chrome dino warm-up)
- [ ] **SPD-07**: Target peak engagement window: 30-60 seconds per run before most deaths

### Audio

- [ ] **MUS-01**: Background music plays "Tension Pixels.mp3" from public/ folder
- [ ] **MUS-02**: Music volume is low (15-20% of max) so it's not annoying
- [ ] **MUS-03**: Music is muted by default, toggle with M key (same as before)
- [ ] **MUS-04**: Music loops seamlessly
- [ ] **MUS-05**: Remove procedural oscillator background music (replaced by MP3)

### Visual Polish

- [ ] **VIS-01**: Player sprite has 2-4 frame run animation cycle
- [ ] **VIS-02**: Parallax background (distant stars at 10% speed, grid lines at 30%)
- [ ] **VIS-03**: Obstacle letters pulse/glow when entering danger zone
- [ ] **VIS-04**: Replace shadowBlur glow with screen-blend technique (performance)
- [ ] **VIS-05**: Increase letter font to 26-28px bold with dark outline for readability at speed
- [ ] **VIS-06**: 1px vertical bob on player sprite during run cycle

### Theme

- [ ] **THM-01**: Detect system color scheme preference (prefers-color-scheme)
- [ ] **THM-02**: Dark mode: keep existing neon-on-dark palette
- [ ] **THM-03**: Light mode: alternate palette — dark text on light background, muted neon accents
- [ ] **THM-04**: Theme switches reactively if system preference changes mid-session
- [ ] **THM-05**: All screens (start, game-over, HUD) adapt to current theme

## Future Requirements

### Deferred to v2.0

- **SOCL-01**: Share button copies score text snippet to clipboard
- **SOCL-02**: Real leaderboard backend
- **SOCL-03**: Daily challenge mode (same letter seed for all players)
- **POL-01**: Multiple character skins
- **POL-02**: Screen shake on damage
- **POL-03**: Post-run typing stats (WPM, accuracy)
- **WORD-01**: Real word obstacles (not just random combos)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real leaderboard backend | Removed for simplicity — local PB is sufficient |
| Mobile / touch | Desktop keyboard game |
| Word obstacles (real words) | Only short random combos for v1.1 |
| Combo length > 3 | Diminishing returns, too hard to read at speed |
| Music selection / multiple tracks | One track is enough for v1.1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REM-01 | — | Pending |
| REM-02 | — | Pending |
| REM-03 | — | Pending |
| REM-04 | — | Pending |
| COMBO-01 | — | Pending |
| COMBO-02 | — | Pending |
| COMBO-03 | — | Pending |
| COMBO-04 | — | Pending |
| COMBO-05 | — | Pending |
| COMBO-06 | — | Pending |
| COMBO-07 | — | Pending |
| COMBO-08 | — | Pending |
| COMBO-09 | — | Pending |
| SPD-01 | — | Pending |
| SPD-02 | — | Pending |
| SPD-03 | — | Pending |
| SPD-04 | — | Pending |
| SPD-05 | — | Pending |
| SPD-06 | — | Pending |
| SPD-07 | — | Pending |
| MUS-01 | — | Pending |
| MUS-02 | — | Pending |
| MUS-03 | — | Pending |
| MUS-04 | — | Pending |
| MUS-05 | — | Pending |
| VIS-01 | — | Pending |
| VIS-02 | — | Pending |
| VIS-03 | — | Pending |
| VIS-04 | — | Pending |
| VIS-05 | — | Pending |
| VIS-06 | — | Pending |
| THM-01 | — | Pending |
| THM-02 | — | Pending |
| THM-03 | — | Pending |
| THM-04 | — | Pending |
| THM-05 | — | Pending |

**Coverage:**
- v1.1 requirements: 36 total
- Mapped to phases: 0
- Unmapped: 36 ⚠️

---
*Requirements defined: 2026-05-10*
*Last updated: 2026-05-10 after milestone v1.1 initialization*
