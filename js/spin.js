// Bilder mit data-spin drehen sich beim Scrollen (z. B. der runde Radar-Sticker auf der Startseite).
// data-spin = Grad pro gescrolltem Pixel (Standard 0.25). Negativ = andersherum.
(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const items = [...document.querySelectorAll('[data-spin]')];
  if (!items.length) return;
  let ticking = false;
  function update() {
    ticking = false;
    items.forEach(el => {
      const speed = parseFloat(el.dataset.spin) || 0.25;
      el.style.transform = `rotate(${scrollY * speed}deg)`;
    });
  }
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
