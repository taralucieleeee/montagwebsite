// Projektseiten: Nur die Bilder in der Mitte scrollen, die Seitenspalten bleiben stehen.
// 1) Höhe der Kopfzeile als CSS-Variable --header-h, damit die festen Spalten genau darunter sitzen
// 2) Höhe des rosa Titelstreifens als --title-h (Handy: back-Zeile klebt darunter)
// 3) Senkrechten Titel so verkleinern, dass er komplett in den rosa Streifen passt
(() => {
  const header = document.getElementById('site-header');
  const title = document.querySelector('.project-title');
  const desktop = matchMedia('(min-width: 48rem)');

  function update() {
    document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
    const strip = document.querySelector('.mobile-title');
    if (strip) document.documentElement.style.setProperty('--title-h', `${strip.offsetHeight}px`);

    if (!title) return;
    title.style.fontSize = ''; // zurück auf den Wert aus dem CSS
    if (!desktop.matches) return;
    const aside = title.parentElement;
    const cs = getComputedStyle(aside);
    const room = aside.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 16;
    const length = title.scrollHeight; // bei senkrechter Schrift = Länge des Titels
    if (length > room) {
      const size = parseFloat(getComputedStyle(title).fontSize);
      title.style.fontSize = `${Math.floor(size * (room / length))}px`;
    }
  }

  update();
  document.fonts?.ready.then(update);
  new ResizeObserver(update).observe(header);
  addEventListener('resize', update);
})();
