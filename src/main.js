const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(dpr, dpr);
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

resize();
window.addEventListener('resize', resize);
