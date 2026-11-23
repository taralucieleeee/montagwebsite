// Bilder finden – egal ob .jpg, .jpeg, .png oder .webp.
// Im HTML steht z. B. images/home/1.jpg. Liegt dort stattdessen 1.png oder 1.webp,
// wird automatisch diese Datei genommen. Gibt es gar kein Bild, erscheint ein grauer
// Platzhalter mit dem Dateinamen – so sieht man sofort, welches Bild noch fehlt.
(() => {
  const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

  function placeholder(img, name) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <rect width="100%" height="100%" fill="#d4d4d4"/>
      <text x="50%" y="50%" fill="#737373" font-family="sans-serif" font-size="32"
        text-anchor="middle" dominant-baseline="middle">${name}</text></svg>`;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function handle(img) {
    if (img.dataset.resolved) return;
    const original = img.dataset.original || img.getAttribute('src');
    if (!original || original.startsWith('data:')) return;
    img.dataset.original = original;

    // nächste Endung ausprobieren
    const base = original.replace(/\.[a-z0-9]+$/i, '');
    const tried = (img.dataset.tried || '').split(',').filter(Boolean);
    const current = (img.getAttribute('src').match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase();
    if (current && !tried.includes(current)) tried.push(current);
    const next = EXTENSIONS.find(ext => !tried.includes(ext));
    img.dataset.tried = tried.join(',');

    if (next) {
      img.src = `${base}.${next}`;
    } else {
      img.dataset.resolved = 'missing';
      placeholder(img, original.replace(/\.[a-z0-9]+$/i, '') + '  (.jpg / .png / .webp)');
    }
  }

  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => handle(img));
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) handle(img);
  });
})();
