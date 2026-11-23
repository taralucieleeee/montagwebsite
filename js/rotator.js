// Kopfzeile: Der Satz nach „Montag Kollektiv“ wechselt – harter Schnitt, ohne Animation.
// Alle Sätze liegen übereinander im selben Feld, darum ist die Box immer so lang wie der längste Satz.
// Sätze stehen im HTML in data-rotate, getrennt mit |
(() => {
  const HOLD = 3000; // ms, wie lange ein Satz stehen bleibt

  document.querySelectorAll('[data-rotate]').forEach(el => {
    const phrases = el.dataset.rotate.split('|').map(p => p.trim()).filter(Boolean);
    if (phrases.length < 2) return;

    // Screenreader lesen nur den ersten Satz
    const label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = phrases[0];
    el.before(label);
    el.setAttribute('aria-hidden', 'true');

    const layers = phrases.map((p, i) => {
      const span = document.createElement('span');
      span.textContent = p;
      if (i !== 0) span.style.visibility = 'hidden'; // unsichtbar, hält aber die Breite
      return span;
    });
    el.replaceChildren(...layers);

    let index = 0;
    setInterval(() => {
      if (document.hidden) return;
      layers[index].style.visibility = 'hidden';
      index = (index + 1) % phrases.length;
      layers[index].style.visibility = 'visible';
    }, HOLD);
  });
})();
