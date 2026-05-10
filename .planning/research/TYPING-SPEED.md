# Typing Speed Research for Letter Runner

> Research compiled: 2026-05-10
> Sources: Perplexity AI (aggregating TypeRacer, MonkeyType, Keybr, academic HCI research, large-scale keystroke datasets)

---

## 1. WPM Distributions by Skill Level

### Percentile Table (Global Adult Population)

| WPM Range | Percentile | Classification | Typical User |
|-----------|-----------|----------------|--------------|
| 0-25 | Bottom 10% | Beginner / Hunt-and-peck | Rarely use computers |
| 25-40 | 25th | Below Average | Casual users |
| 40-52 | 50th (Median) | Average | Most adults, everyday typing |
| 52-65 | 75th | Above Average | Solid office/school typists |
| 65-80 | 90th | Fast | Efficient professionals |
| 80-100 | 95th | Very Fast | Skilled typists (journalists, devs) |
| 100-120 | 99th | Professional | Data entry, transcriptionists |
| 120-160 | Top 0.5% | Elite | Competitive typists |
| 160-200+ | Top 0.01% | World-class | Tournament winners |

### By Profession

| Group | Average WPM | Range |
|-------|-------------|-------|
| General Population | 40 | 35-45 |
| Office Workers | 50 | 45-60 |
| Software Developers | 60 | 50-70 |
| Writers / Journalists | 75 | 60-90 |
| Transcriptionists | 85 | 70-100+ |
| Competitive Typists | 120 | 100-160 |
| World Record Holders | 200+ | 200-250+ |

### By Age Group

| Age | Average WPM | Notes |
|-----|-------------|-------|
| 6-11 | 10-20 | Learning phase |
| 12-17 | 40-55 | Digital natives, high variability |
| 18-30 | 50-60 | Peak performance window |
| 31-50 | 45-55 | Stable, experience aids accuracy |
| 50+ | 40-50 | Slight decline, accuracy holds |

### Recommendations for Letter Runner

- **Easy mode target**: 30-45 WPM (serves bottom 50% of players)
- **Normal mode target**: 50-70 WPM (serves 50th-90th percentile)
- **Hard mode target**: 80-120 WPM (serves top 10% typists)
- **Insane/Expert mode**: 120-150 WPM (serves competitive typists only)
- **Most players will be 40-70 WPM** -- this is your design sweet spot

---

## 2. Characters Per Second (CPS) Conversion

### Formula

```
CPS = (WPM x 5) / 60
```

Standard: 1 "word" = 5 characters (including spaces). This is universal across all typing tests.

### Conversion Table

| WPM | CPM | CPS | ms per character |
|-----|-----|-----|-----------------|
| 20 | 100 | 1.67 | 600 ms |
| 30 | 150 | 2.50 | 400 ms |
| 40 | 200 | 3.33 | 300 ms |
| 50 | 250 | 4.17 | 240 ms |
| 60 | 300 | 5.00 | 200 ms |
| 70 | 350 | 5.83 | 171 ms |
| 80 | 400 | 6.67 | 150 ms |
| 90 | 450 | 7.50 | 133 ms |
| 100 | 500 | 8.33 | 120 ms |
| 120 | 600 | 10.00 | 100 ms |
| 150 | 750 | 12.50 | 80 ms |
| 200 | 1000 | 16.67 | 60 ms |

### Recommendations for Letter Runner

- **Game tick rate**: Since we deal in individual keystrokes, CPS is the primary metric
- **Minimum time between required inputs**: Never go below 80ms (150 WPM equivalent) -- this is physically near-impossible to sustain
- **Comfortable sustained pace**: 200-300ms between inputs (40-50 WPM)
- **Challenging pace**: 120-150ms between inputs (80-100 WPM)
- **Frame-based timing**: At 60fps, one frame = 16.67ms. A 200ms window = 12 frames. A 100ms window = 6 frames.

---

## 3. Reaction Time: Seeing a Letter to Pressing a Key

### Baseline Reaction Times (Visual Stimulus to Keypress)

| Scenario | Mean RT | SD | Notes |
|----------|---------|----|----- |
| Simple RT (1 target) | 190-250ms | ~20ms | Press any key when you see anything |
| 2-Choice RT | 350-370ms | ~19ms | Press correct key for stimulus |
| 4-Choice RT | 400-500ms | -- | More choices = slower (Hick's Law) |
| 26-Choice RT (full keyboard) | 500-700ms | -- | Estimated for untrained typists |
| Trained typist (known context) | 100-150ms | -- | Habitual motor response, minimal decision |

### Hick's Law: RT Increases Logarithmically with Choices

```
RT = K + log2(N) * constant
```

Where N = number of possible stimuli. Each doubling of choices adds ~50-60ms.

| Number of Possible Letters | Added Decision Time | Total Estimated RT |
|---------------------------|--------------------|--------------------|
| 1 (known, just timing) | 0ms | 150-200ms |
| 2 | +50-100ms | 250-350ms |
| 4 | +100-150ms | 300-400ms |
| 8 | +150-200ms | 350-450ms |
| 26 (full alphabet) | +200-300ms | 400-550ms |

### Key Insight: Typing RT vs. Game RT

In normal typing, the next letter is **predictable** (language patterns, muscle memory). In a game showing random letters, players face:
- Full 26-choice reaction time (400-550ms for first keypress)
- Reduced prediction ability (no linguistic context)
- Visual search time (finding the letter on screen)

This means: **random single-letter games are 2-3x harder than equivalent WPM in a typing test.**

### Recommendations for Letter Runner

- **Minimum display time for a new random letter**: 400-500ms for average players to react
- **With preview/warning**: Can reduce to 250-350ms if players can see what is coming
- **Grace period after letter appears**: At least 300ms before penalizing
- **Prediction helps**: If letters form words or patterns, reaction drops dramatically (150-200ms)
- **Difficulty lever**: Reducing the number of possible letters (e.g., only ASDF row) dramatically reduces reaction time

---

## 4. Sustained vs. Burst Typing Performance

### Burst Performance

- **Definition**: 10-20 second maximum-effort typing intervals
- **Speed**: Typists can hit 20-40% above their sustained speed in bursts
- **Example**: A 80 WPM sustained typist can burst to 100-110 WPM for 10-15 seconds
- **Recovery needed**: 60-90 seconds between bursts for full recovery

### Sustained Performance Degradation

| Duration | Performance vs Peak | Notes |
|----------|-------------------|-------|
| 0-1 min | 100% | Peak performance window |
| 1-5 min | 95-98% | Minimal degradation |
| 5-10 min | 90-95% | First noticeable fatigue |
| 10-15 min | 85-90% | Significant for amateurs |
| 15-30 min | 75-85% | Pros sustain 80%; amateurs drop 25% |
| 30+ min | 70-80% | Only trained typists maintain |

### Fatigue Curve Shape

```
Performance
100% |****
 95% |    ****
 90% |        ***
 85% |           ****
 80% |               ********
 75% |                       ****
     +-----|-----|-----|-----|-----> Time (minutes)
     0     5    10    15    20
```

### Factors Causing Degradation

1. **Finger flexor muscle fatigue** (physical)
2. **Mental micro-hesitations** increase at higher speeds
3. **Error accumulation** -- errors break flow, causing cascading slowdowns
4. **Attention fatigue** -- focus degrades after 5-10 minutes of intense effort
5. **Stress/frustration** from failing adds 4-5ms to keystroke latency

### Recommendations for Letter Runner

- **Session length**: Design core gameplay loops around 1-3 minute rounds (within peak performance window)
- **Escalation curve**: Increase difficulty within a round over 60-90 seconds, not longer
- **Rest between rounds**: Offer natural pauses (score screens, upgrades) every 1-2 minutes
- **Burst rewards**: Give bonus points for short (5-10s) high-speed bursts rather than requiring sustained speed
- **Fatigue awareness**: If a game session exceeds 10 minutes, slightly reduce difficulty to compensate for natural fatigue
- **"Second wind" design**: After a rest phase, players can burst again -- build gameplay rhythm around this

---

## 5. How Typing Tests Calibrate Difficulty

### MonkeyType

| Feature | How It Works |
|---------|-------------|
| Difficulty Modes | Normal (errors highlighted) / Expert (fails on wrong word submission) / Master (fails on ANY wrong keypress) |
| Time Variants | 15s, 30s, 60s, 120s -- shorter = more burst-friendly |
| Adaptive Thresholds | Min Speed, Min Accuracy, Min Burst -- auto-fail if below |
| Pace Caret | Ghost cursor at target/average/PB speed -- race yourself |
| Practice Mode | Retries missed/slow words specifically |
| Engagement | Customizable themes, stats tracking, personal bests, games (Z-Type) |

### TypeRacer

| Feature | How It Works |
|---------|-------------|
| Skill Matching | Pairs racers of similar WPM -- dynamic lobby calibration |
| Real Text | Quotes with punctuation/capitalization (harder than random words) |
| Visual Competition | Car advances based on speed -- direct rivalry, ghost replays |
| Error Handling | Must correct errors before advancing (punishes but doesn't fail) |
| Engagement | Real-time leaderboard, seasonal rankings, social features |

### Keybr

| Feature | How It Works |
|---------|-------------|
| Per-Key Tracking | Tracks speed/errors for each individual key |
| Algorithmic Adaptation | 80% of test content = your weakest letters/bigrams |
| Progressive Unlock | Starts with subset of keys, adds more as mastery improves |
| Micro-Drills | Short focused repetitions, not overwhelm |
| Engagement | Visual heatmaps, steady WPM climb, clear progress |

### Common Engagement Patterns Across All

1. **Immediate feedback** -- live WPM counter, accuracy %, visual progress
2. **Personal bests** -- beat your own score, track improvement over time
3. **Short sessions** -- 15-60 second tests are most popular (low commitment)
4. **Visible progress** -- graphs, streaks, level-ups
5. **Customization** -- choose difficulty, themes, word sets
6. **Social proof** -- leaderboards, percentile rankings ("you're faster than 80% of users")
7. **Adaptive difficulty** -- harder when you're doing well, easier when struggling

### Recommendations for Letter Runner

- **Steal the Pace Caret**: Show a ghost/shadow of target pace so players feel the pressure
- **Steal Keybr's adaptation**: Track which letters/sequences the player struggles with, increase their frequency
- **Steal MonkeyType's modes**: Offer Normal (forgiving) and Master (one-mistake-fail) modes
- **Keep sessions short**: 30-90 second rounds are the engagement sweet spot
- **Show percentile**: "You're faster than X% of players" is extremely motivating
- **Progressive difficulty within a round**: Start easy, ramp up -- never start at max difficulty
- **Error handling matters**: Decide between "errors slow you down" vs "errors kill you" -- the choice defines game feel

---

## 6. Multi-Key Sequences vs. Single Keys

### Inter-Key Stroke Intervals (IKSI)

The time between pressing one key and the next varies dramatically based on the key pair:

| Bigram Type | Avg Inter-Key Interval | Examples | Why |
|-------------|----------------------|----------|-----|
| Alternate hands | 80-120ms | "th", "an", "or" | Parallel preparation |
| Same hand, different finger | 120-180ms | "er", "we", "io" | Sequential but nearby |
| Same finger (different key) | 150-250ms | "ed", "nu", "my" | Must lift and reposition |
| Same key repeated | 100-150ms | "ll", "ss", "ee" | Simple repeat motion |
| Cross-row reach | 150-250ms+ | "xv", "qp", "zl" | Awkward biomechanics |

### Overhead Per Additional Character in a Sequence

| Sequence Length | Total Time (60 WPM typist) | Per-Character Overhead | Notes |
|----------------|---------------------------|----------------------|-------|
| 1 character | 400-550ms (reaction only) | -- | Pure reaction time dominates |
| 2 characters | 500-700ms | +100-150ms for 2nd char | After first key, next comes faster |
| 3 characters | 650-900ms | +100-150ms per additional | Pipelining effect kicks in |
| 4+ characters | Linear growth ~150ms each | ~150ms per char | Sustained typing speed takes over |

### Key Insight: First Character is Special

The **first character** in any sequence takes 400-550ms (full reaction time). Subsequent characters take only 100-200ms each because:
- Motor planning happens in parallel with execution
- Muscle memory kicks in for common sequences
- The decision is already made; only execution remains

For **random** letters (no linguistic context), subsequent characters still take 200-350ms because there is no prediction pipeline.

### Common vs. Rare Bigrams (Speed Impact)

| Category | Examples | Relative Speed |
|----------|----------|---------------|
| Top 10 English bigrams | th, he, in, er, an, re, on, at, en, nd | Fastest (80-120ms IKSI) |
| Common but slower | qu, wh, sh, ch | Medium (120-180ms) |
| Rare / awkward | xv, zq, jx, vb | Slowest (200-300ms+) |

### Recommendations for Letter Runner

- **First letter penalty**: Always give extra time (300-400ms) for the first input in any sequence
- **Subsequent letters**: Can be faster (100-200ms apart) once the player is "in flow"
- **Use common bigrams for easy mode**: "th", "er", "in" -- players type these 2x faster
- **Use rare bigrams for hard mode**: "xv", "qz", "jk" -- these are physically slow
- **Alternate-hand sequences are easier**: Design easy levels with alternating-hand patterns
- **Same-finger sequences are hard**: "ed" then "c" (all left middle finger) is brutal
- **Word-based is easier than random**: If letters form words, players can pipeline; random forces individual reactions

---

## 7. Speed Ceiling Recommendations for Letter Runner

### What Existing Games Do

| Game | Max Effective WPM | How Ceiling Feels |
|------|-------------------|-------------------|
| ZType | ~100-120 WPM | Overwhelm via quantity, not speed |
| Epistory Arena | ~100-150 WPM | Precision-focused, fair |
| Typing of the Dead | ~110 WPM | Arcade intensity |
| TypeRacer | Unlimited (PvP) | Matched to opponent |
| Western Press | ~120+ WPM | Short burst duels |

### Recommended Speed Ceilings for Letter Runner

Based on all research data:

| Difficulty Tier | Max Required CPS | Equivalent WPM | ms Between Inputs | Target Audience |
|----------------|-----------------|----------------|-------------------|-----------------|
| Tutorial | 1.5 CPS | 18 WPM | 667ms | First-time players |
| Easy | 2.5-3.5 CPS | 30-42 WPM | 400-286ms | Casual gamers |
| Normal | 4.0-5.5 CPS | 48-66 WPM | 250-182ms | Average typists |
| Hard | 6.0-8.0 CPS | 72-96 WPM | 167-125ms | Good typists |
| Expert | 8.5-10.0 CPS | 102-120 WPM | 118-100ms | Competitive typists |
| Insane (bonus) | 10-12.5 CPS | 120-150 WPM | 100-80ms | Elite only |

### Critical Design Rules

1. **Never require below 80ms sustained** -- physically impossible for 99.9% of players
2. **100ms sustained is the practical hard ceiling** -- only elite competitive typists (top 0.1%) can maintain this
3. **150ms (80 WPM) is "hard but fair"** -- a good typist can do this; most players cannot
4. **200ms (60 WPM) is the "flow state" sweet spot** -- challenging but achievable for engaged players
5. **300ms (40 WPM) should feel comfortable** -- this is average human typing speed

### Accounting for Random Letters vs. Normal Typing

Since Letter Runner likely uses random/semi-random letters (not full words), apply a **1.5-2x difficulty multiplier** compared to normal typing:

| Normal Typing WPM | Equivalent Random-Letter CPS | Effective ms per input |
|-------------------|------------------------------|----------------------|
| 60 WPM (comfortable) | ~3.5 CPS (not 5.0) | ~286ms |
| 80 WPM (fast) | ~4.5 CPS (not 6.7) | ~222ms |
| 100 WPM (very fast) | ~5.5 CPS (not 8.3) | ~182ms |

**Why**: Without word context, players lose prediction ability. Each keystroke requires full choice-reaction (400-550ms initial, 200-300ms subsequent) rather than pipelined motor execution.

### Final Recommendation: The Speed Curve

```
Required CPS
12  |                                          * (INSANE - unreachable wall)
10  |                                    ******
 8  |                              ******
 6  |                       ******
 5  |                 ******
 4  |           ******
 3  |     ******
 2  |*****
    +---|---|---|---|---|---|---|---|---|---> Time in round (seconds)
    0  10  20  30  40  50  60  70  80  90

Recommended ramp: Start at 2 CPS, reach player's skill ceiling by 60-90 seconds
```

**Design the curve so:**
- First 10 seconds: Very easy (warm-up, build confidence)
- 10-30 seconds: Steady ramp to player's comfortable speed
- 30-60 seconds: Push 10-20% beyond comfort (flow state / challenge)
- 60-90 seconds: Hit the ceiling (this is where most players fail)
- 90+ seconds: Only reachable by skilled players; maintain ceiling, add complexity instead of raw speed

---

## Summary: Key Numbers for Implementation

| Parameter | Value | Use |
|-----------|-------|-----|
| Average player speed | 3.3-4.2 CPS (40-50 WPM) | Normal difficulty target |
| Minimum reaction time (random letter) | 400-550ms | Grace period for first input |
| Subsequent input window (comfortable) | 200-300ms | Normal mode timing |
| Subsequent input window (hard) | 120-160ms | Hard mode timing |
| Absolute speed floor | 80ms | Never go faster than this |
| Optimal round length | 60-90 seconds | Peak engagement before fatigue |
| Fatigue degradation | ~5% per 5 minutes | Soften difficulty after 5+ min |
| Random-letter penalty | 1.5-2x slower than WPM test | Adjust all WPM targets down |
| First-char vs subsequent | 2-3x slower | Build in extra time for first input |
