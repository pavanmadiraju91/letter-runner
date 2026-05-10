// Parallax background — tiles bg-dark.png horizontally, scrolls at 10% of game speed

const bgImage = new Image();
bgImage.src = './bg-dark.png';

export function createBackground() {
  return { offset: 0 };
}

export function updateBackground(bg, dt, scrollSpeed) {
  bg.offset = (bg.offset + scrollSpeed * 0.1 * dt) % (bgImage.width || 1);
}

export function renderBackground(ctx, bg, canvasWidth, canvasHeight) {
  if (!bgImage.complete || !bgImage.width) return;

  const imgW = bgImage.width;
  const imgH = bgImage.height;
  // Scale to fill canvas height
  const scale = canvasHeight / imgH;
  const drawW = imgW * scale;
  const startX = -(bg.offset * scale) % drawW;

  for (let x = startX; x < canvasWidth; x += drawW) {
    ctx.drawImage(bgImage, x, 0, drawW, canvasHeight);
  }
}
