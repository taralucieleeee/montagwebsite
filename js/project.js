// Projektseite: Editionen umschalten (Bilder + Infos).
// Die Adresse merkt sich die Edition (montag-market.html#edition-2).
(() => {
  const tabs = [...document.querySelectorAll('.edition-tab')];
  const blocks = [...document.querySelectorAll('.edition')];
  if (!tabs.length) return;

  function show(n) {
    tabs.forEach(t => t.classList.toggle('is-active', t.dataset.edition === n));
    blocks.forEach(b => (b.hidden = b.dataset.edition !== n));
    document.querySelectorAll('main, section').forEach(el => el.scrollTo?.(0, 0));
  }

  tabs.forEach(t =>
    t.addEventListener('click', () => {
      show(t.dataset.edition);
      history.replaceState(null, '', `#edition-${t.dataset.edition}`);
    })
  );

  const fromHash = location.hash.match(/^#edition-(\d+)$/)?.[1];
  show(tabs.some(t => t.dataset.edition === fromHash) ? fromHash : tabs[0].dataset.edition);
})();
