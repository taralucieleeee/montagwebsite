// Gemeinsamer rosa Sprühpinsel + Speicher für Zeichnungen.
// Wird von der Zeichenfläche (draw.js) und vom Shop-Hintergrund (shop-drawing.js) benutzt.
//
// Eine Zeichnung = Liste von Strichen, jeder Strich = Liste von Punkten {x, y} von 0 bis 1
// (relativ zur Zeichenfläche). Seitenverhältnis der Zeichenfläche: ASPECT.
//
// Speicher: Zeichnungen landen im Browser (localStorage) der Person, die sie malt.
// Für „andere sehen meine Zeichnung“ später hier einen Online-Speicher anbinden
// (save → hochladen, latest → herunterladen).
window.MontagBrush = (() => {
  const BRUSH = { color: 'rgba(249, 168, 196, 0.8)', width: 0.04, blur: 0.03 }; // relativ zur Bezugsbreite
  const ASPECT = 684 / 567; // Breite / Höhe der Zeichenfläche
  const KEY = 'montag-drawings';
  const MAX = 10; // so viele Zeichnungen werden gemerkt

  // Pinsel-Einstellungen setzen; size = Bezugsbreite in Geräte-Pixeln (Strichstärke, Weichheit)
  function setup(c, size) {
    c.strokeStyle = BRUSH.color;
    c.lineWidth = size * BRUSH.width;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.shadowColor = BRUSH.color;
    c.shadowBlur = size * BRUSH.blur;
    c.filter = `blur(${Math.max(1, size * 0.004)}px)`;
  }

  // ein Stück Strich (beim Live-Malen)
  function segment(c, from, to, size) {
    setup(c, size);
    c.beginPath();
    c.moveTo(from.x, from.y);
    c.lineTo(to.x, to.y);
    c.stroke();
  }

  // ganze Zeichnung auf eine Fläche malen, jeder Strich in einem weichen Zug
  function drawAll(c, strokes, width, height, size) {
    setup(c, size);
    for (const line of strokes) {
      if (!line.length) continue;
      const pts = line.map(p => ({ x: p.x * width, y: p.y * height }));
      c.beginPath();
      c.moveTo(pts[0].x, pts[0].y);
      if (pts.length === 1) c.lineTo(pts[0].x + 0.1, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2, my = (pts[i].y + pts[i + 1].y) / 2;
        c.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      const end = pts[pts.length - 1];
      c.lineTo(end.x, end.y);
      c.stroke();
    }
  }

  // ── Speicher ──
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }
  function save(strokes) {
    // Punkte auf 3 Nachkommastellen kürzen, damit es klein bleibt
    const compact = strokes.map(l => l.map(p => ({ x: +p.x.toFixed(3), y: +p.y.toFixed(3) })));
    const all = [...load(), { strokes: compact, at: Date.now() }].slice(-MAX);
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* Speicher voll/aus – egal */ }
  }
  function latest() {
    const all = load();
    return all.length ? all[all.length - 1].strokes : null;
  }

  return { BRUSH, ASPECT, segment, drawAll, save, latest };
})();
