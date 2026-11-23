// Zeichenfläche am Ende der Homepage: weicher rosa Sprühpinsel (siehe brush.js).
// Pfeil-Button „hinterlässt“ die Zeichnung: Sie wird groß zum Hintergrund des Abschnitts,
// wird gemerkt (taucht danach im Shop-Hintergrund auf) und die Fläche ist wieder leer.
// Hinweis: Gemerkt wird nur im Browser der Besucher*innen – für echtes
// „for the next one“ (andere sehen sie) braucht es einen Speicher-Dienst.
(() => {
  const canvas = document.getElementById('draw-canvas');
  const send = document.getElementById('draw-send');
  const Brush = window.MontagBrush;
  if (!canvas || !Brush) return;
  const ctx = canvas.getContext('2d');

  let drawing = false;
  let last = null;
  let dirty = false;
  let strokes = []; // alle Striche als Punktlisten (0–1 relativ zur Fläche)

  // Canvas scharf auf Retina-Displays, passt sich der Größe an
  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    if (dirty) Brush.drawAll(ctx, strokes, canvas.width, canvas.height, canvas.width);
  }
  new ResizeObserver(resize).observe(canvas);

  function point(e) {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (canvas.width / r.width), y: (e.clientY - r.top) * (canvas.height / r.height) };
  }
  const norm = p => ({ x: p.x / canvas.width, y: p.y / canvas.height });

  canvas.addEventListener('pointerdown', e => {
    drawing = true;
    dirty = true;
    canvas.setPointerCapture(e.pointerId);
    last = point(e);
    Brush.segment(ctx, last, last, canvas.width);
    strokes.push([norm(last)]);
  });
  canvas.addEventListener('pointermove', e => {
    if (!drawing) return;
    const p = point(e);
    Brush.segment(ctx, last, p, canvas.width);
    strokes[strokes.length - 1].push(norm(p));
    last = p;
  });
  ['pointerup', 'pointercancel'].forEach(t => canvas.addEventListener(t, () => (drawing = false)));

  // ── Abschicken: Zeichnung wird groß zum Hintergrund des ganzen Abschnitts ──
  // Sie liegt über den gefallenen Bildern, aber unter Überschrift, Zeichenfläche und Texten,
  // und wächst beim Abschicken aus der Zeichenfläche heraus.
  const section = canvas.closest('section');
  let background = null;

  // Größe so wählen, dass die Zeichnung den Abschnitt ausfüllt, Mitte = Mitte der Zeichenfläche
  function layout(el) {
    const s = section.getBoundingClientRect();
    const c = canvas.getBoundingClientRect();
    const scale = Math.max(s.width / c.width, s.height / c.height);
    const w = c.width * scale, h = c.height * scale;
    const cx = c.left - s.left + c.width / 2, cy = c.top - s.top + c.height / 2;
    Object.assign(el.style, { left: `${cx - w / 2}px`, top: `${cy - h / 2}px`, width: `${w}px`, height: `${h}px` });
    return scale;
  }
  addEventListener('resize', () => background && layout(background));

  send.addEventListener('click', () => {
    if (!dirty) return;

    // Striche groß neu zeichnen – mit derselben Pinselstärke wie auf der Zeichenfläche,
    // damit die Linien fein bleiben statt aufgeblasen dick zu werden
    const big = document.createElement('canvas');
    big.className = 'drawing-background';
    big.setAttribute('role', 'img');
    big.setAttribute('aria-label', 'A drawing someone left behind');
    section.append(big);
    const scale = layout(big);
    const dpr = window.devicePixelRatio || 1;
    big.width = Math.round(parseFloat(big.style.width) * dpr);
    big.height = Math.round(parseFloat(big.style.height) * dpr);
    Brush.drawAll(big.getContext('2d'), strokes, big.width, big.height, canvas.getBoundingClientRect().width * dpr);

    // merken – erscheint danach im Shop als Hintergrund
    Brush.save(strokes);

    // aus der Zeichenfläche heraus groß werden
    big.animate(
      [{ transform: `scale(${1 / scale})`, opacity: 0.9 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 1100, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    );
    // vorherige Zeichnung ausblenden
    if (background) {
      const old = background;
      old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, fill: 'forwards' }).finished.then(() => old.remove());
    }
    background = big;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes = [];
    dirty = false;
  });
})();
