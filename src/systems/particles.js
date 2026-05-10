/**
 * Particle system — pooled particle effects with performance safeguards.
 * - VFX-09: Hard cap of MAX_ACTIVE particles
 * - VFX-10: Skips spawning when FPS < 30
 */

import { createPool } from './pool.js';
import { isFPSLow } from './fps-monitor.js';
import { PARTICLES } from '../config.js';

let pool = null;

/** Factory for particle objects */
function particleFactory() {
  return { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, color: '#ffffff', size: 2 };
}

/**
 * Initialize the particle pool (call once at startup).
 */
export function createParticleSystem() {
  pool = createPool(particleFactory, PARTICLES.POOL_SIZE);
}

/**
 * Performance gate: returns true if new particles can be spawned.
 * Returns false if pool is at capacity OR if framerate is too low.
 */
export function canSpawnParticles() {
  if (!pool) return false;
  if (pool.stats().active >= PARTICLES.MAX_ACTIVE) return false;
  if (isFPSLow()) return false;
  return true;
}

/**
 * Spawn particles at (x, y) with given config.
 * @param {number} x - Spawn x position
 * @param {number} y - Spawn y position
 * @param {number} count - Desired number of particles
 * @param {object} config - { color, minSpeed, maxSpeed, minSize, maxSize, minLife, maxLife }
 */
export function spawnParticles(x, y, count, config) {
  if (!pool) return;

  const { color, minSpeed, maxSpeed, minSize, maxSize, minLife, maxLife } = config;
  const available = PARTICLES.MAX_ACTIVE - pool.stats().active;
  const toSpawn = Math.min(count, available);

  for (let i = 0; i < toSpawn; i++) {
    const p = pool.acquire();
    const angle = Math.random() * Math.PI * 2;
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
    p.x = x;
    p.y = y;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.life = minLife + Math.random() * (maxLife - minLife);
    p.maxLife = p.life;
    p.color = color;
    p.size = minSize + Math.random() * (maxSize - minSize);
  }
}

/**
 * Update all active particles. Applies velocity, gravity, and lifetime decay.
 * Releases dead particles back to pool.
 * @param {number} dt - Delta time in seconds
 */
export function updateParticles(dt) {
  if (!pool) return;

  const active = pool.getActive();
  for (let i = active.length - 1; i >= 0; i--) {
    const p = active[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 400 * dt; // gravity for natural arc
    p.life -= dt;

    if (p.life <= 0) {
      pool.release(p);
    }
  }
}

/**
 * Render all active particles as glowing circles with alpha fade.
 * @param {CanvasRenderingContext2D} ctx
 */
export function renderParticles(ctx) {
  if (!pool) return;

  const active = pool.getActive();
  if (active.length === 0) return;

  ctx.save();
  for (let i = 0; i < active.length; i++) {
    const p = active[i];
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = p.size * 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.restore();
}
