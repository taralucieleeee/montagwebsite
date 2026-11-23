// Shop: Im Hintergrund liegt eine Zeichnung, die vorher jemand auf der Homepage hinterlassen hat
// (zuletzt abgeschickte aus diesem Browser). Gibt es noch keine, die Blume aus Figma
// (images/deko/drawings/flower.svg). Groß und mittig, unter Stickern und „COMING SOON“.
(() => {
  const board = document.getElementById('board');
  const Brush = window.MontagBrush;
  if (!board) return;

  const strokes = Brush?.latest();

  // Noch keine Zeichnung: Figma-Blume als Bild
  if (!strokes) {
    const img = document.createElement('img');
    img.src = 'images/deko/drawings/flower.svg';
    img.alt = '';
    img.className = 'pointer-events-none absolute inset-0 h-full w-full object-contain select-none';
    board.prepend(img); // ganz nach hinten
    return;
  }

  // Gemerkte Zeichnung mit dem rosa Pinsel groß neu malen
  const bg = document.createElement('canvas');
  bg.className = 'pointer-events-none absolute';
  bg.setAttribute('role', 'img');
  bg.setAttribute('aria-label', 'A drawing someone left behind');
  board.prepend(bg);

  function render() {
    const W = board.clientWidth, H = board.clientHeight;
    // Seitenverhältnis der Zeichenfläche beibehalten, Fläche ausfüllen, mittig
    const w = Math.max(W, H * Brush.ASPECT), h = w / Brush.ASPECT;
    Object.assign(bg.style, { left: `${(W - w) / 2}px`, top: `${(H - h) / 2}px`, width: `${w}px`, height: `${h}px` });
    const dpr = window.devicePixelRatio || 1;
    bg.width = Math.round(w * dpr);
    bg.height = Math.round(h * dpr);
    // Pinselstärke wie auf der Homepage-Zeichenfläche (34,2 % der Fensterbreite)
    const brushSize = window.innerWidth * 0.342 * dpr;
    Brush.drawAll(bg.getContext('2d'), strokes, bg.width, bg.height, brushSize);
  }

  render();
  let t;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(render, 120); });
})();
