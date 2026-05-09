/**
 * Generic object pool — pre-allocates objects to prevent runtime allocation.
 * @param {Function} factory - Returns a new plain object
 * @param {number} initialSize - Number of objects to pre-allocate
 */
export function createPool(factory, initialSize = 20) {
  const available = [];
  const active = [];

  // Pre-allocate
  for (let i = 0; i < initialSize; i++) {
    available.push(factory());
  }

  return {
    acquire() {
      const obj = available.length > 0 ? available.pop() : factory();
      active.push(obj);
      return obj;
    },

    release(obj) {
      const idx = active.indexOf(obj);
      if (idx !== -1) {
        active.splice(idx, 1);
        available.push(obj);
      }
    },

    getActive() {
      return active;
    },

    releaseAll() {
      while (active.length > 0) {
        available.push(active.pop());
      }
    },

    stats() {
      return { active: active.length, available: available.length };
    }
  };
}
