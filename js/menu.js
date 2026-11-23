// Menü rechts (about / artists / contact / collab)
// - Maus darüber: der Punkt wird fett (nur CSS, siehe .menu-toggle)
// - Klick: rosa Band öffnet sich, Inhalt dahinter wird unscharf
// - Erneuter Klick, Esc oder Klick daneben schließt es; Klick auf einen anderen Punkt wechselt
(() => {
  const items = [...document.querySelectorAll('.menu-item')];
  const content = document.getElementById('content');
  let current = null;

  // Punkte mit data-fill (z. B. collab): rosa Band reicht bis zum unteren Fensterrand
  function fill() {
    items.forEach(item => (item.style.minHeight = ''));
    if (current?.hasAttribute('data-fill')) {
      current.style.minHeight = `${window.innerHeight - current.getBoundingClientRect().top}px`;
    }
  }
  addEventListener('resize', fill);

  // Handy: Menü sitzt als Zeile unter der Kopfzeile. Beide bleiben beim Scrollen oben stehen
  // (Kopfzeile ist sticky, die Menüzeile hängt direkt darunter).
  const menu = document.getElementById('menu');
  const header = document.querySelector('header');
  const mobile = matchMedia('(width < 48rem)');
  function place() {
    if (!mobile.matches) { menu.style.top = ''; return; }
    const top = Math.max(0, header.getBoundingClientRect().bottom);
    menu.style.top = `${top}px`;
    document.documentElement.style.setProperty('--menu-top', `${top}px`);
  }
  function measure() {
    if (!current) document.documentElement.style.setProperty('--menu-h', `${menu.offsetHeight}px`);
    place();
  }
  measure();
  document.fonts?.ready.then(measure);
  addEventListener('resize', measure);
  addEventListener('scroll', place, { passive: true });

  function close() {
    items.forEach(item => {
      item.classList.remove('is-open');
      item.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
      item.querySelector('.menu-panel').hidden = true;
      item.style.minHeight = '';
    });
    content.classList.remove('blur-md', 'pointer-events-none');
    current = null;
  }

  function open(item) {
    close();
    item.classList.add('is-open');
    item.querySelector('.menu-toggle').setAttribute('aria-expanded', 'true');
    item.querySelector('.menu-panel').hidden = false;
    content.classList.add('blur-md', 'pointer-events-none');
    current = item;
    fill();
  }

  items.forEach(item => {
    item.querySelector('.menu-toggle').addEventListener('click', e => {
      e.stopPropagation();
      current === item ? close() : open(item);
    });
    // Klicks im Band selbst schließen es nicht
    item.addEventListener('click', e => e.stopPropagation());
  });

  document.addEventListener('click', close);
  document.addEventListener('keydown', e => e.key === 'Escape' && close());
})();
