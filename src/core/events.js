const listeners = new Map();

export const events = {
  on(event, callback) {
    if (!listeners.has(event)) {
      listeners.set(event, []);
    }
    listeners.get(event).push(callback);
    return () => this.off(event, callback);
  },

  off(event, callback) {
    const cbs = listeners.get(event);
    if (cbs) {
      const idx = cbs.indexOf(callback);
      if (idx !== -1) cbs.splice(idx, 1);
    }
  },

  emit(event, data) {
    const cbs = listeners.get(event);
    if (cbs) {
      for (let i = 0; i < cbs.length; i++) {
        cbs[i](data);
      }
    }
  },

  clear() {
    listeners.clear();
  }
};
