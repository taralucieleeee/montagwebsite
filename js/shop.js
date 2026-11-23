// Shop: Wunsch eingeben → wird zum rosa Sticker → per Ziehen irgendwo ablegen.
// Hinweis: Die Wünsche bleiben nur im Browser der Besucher*innen (keine Speicherung auf einem Server).
(() => {
  const board = document.getElementById('board');
  const form = document.getElementById('wish-form');
  const input = document.getElementById('wish');
  const hint = document.getElementById('wish-hint');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    const sticker = document.createElement('span');
    sticker.className = 'sticker is-draggable';
    sticker.textContent = text.toUpperCase();
    // Startet dort, wo das Eingabefeld war (unten links)
    const box = form.getBoundingClientRect();
    const area = board.getBoundingClientRect();
    board.append(sticker);
    const stickerTop = box.top - area.top + (box.height - sticker.offsetHeight) / 2;
    place(sticker, box.left - area.left, stickerTop);

    form.hidden = true;
    hint.classList.remove('hidden');
    // Hinweis direkt über den Sticker setzen, mit Abstand (0.7 × Stickerhöhe)
    hint.style.bottom = `${area.height - stickerTop + sticker.offsetHeight * 0.7}px`;
    makeDraggable(sticker);
  });

  // Sticker an Pixelposition (linke obere Ecke) setzen
  function place(el, left, top) {
    el.style.setProperty('--x', `${left + el.offsetWidth / 2}px`);
    el.style.setProperty('--y', `${top + el.offsetHeight / 2}px`);
  }

  function makeDraggable(el) {
    let dx = 0, dy = 0, dragging = false;

    el.addEventListener('pointerdown', e => {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      const r = el.getBoundingClientRect();
      dx = e.clientX - r.left;
      dy = e.clientY - r.top;
      el.classList.add('is-dragging');
    });

    el.addEventListener('pointermove', e => {
      if (!dragging) return;
      const area = board.getBoundingClientRect();
      const left = Math.min(Math.max(e.clientX - dx - area.left, 0), area.width - el.offsetWidth);
      const top = Math.min(Math.max(e.clientY - dy - area.top, 0), area.height - el.offsetHeight);
      place(el, left, top);
    });

    el.addEventListener('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('is-dragging');
      // Abgelegt: Hinweis weg, Feld wieder frei für den nächsten Wunsch
      hint.classList.add('hidden');
      form.reset();
      form.hidden = false;
    });
  }
})();
