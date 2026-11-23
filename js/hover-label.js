// Beim Hovern über ein Projekt folgt ein Kasten mit dem Namen (data-title) dem Mauszeiger.
// Die untere linke Ecke des Kastens sitzt am Zeiger.
(() => {
  const label = document.getElementById('hover-label');
  if (!label || !matchMedia('(hover: hover)').matches) return; // nicht auf Touch-Geräten

  document.querySelectorAll('.project').forEach(project => {
    project.addEventListener('pointerenter', () => {
      label.textContent = project.dataset.title || '';
      label.classList.add('block');
      label.classList.remove('hidden');
    });
    project.addEventListener('pointermove', e => {
      label.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translateY(-100%)`;
    });
    project.addEventListener('pointerleave', () => {
      label.classList.add('hidden');
      label.classList.remove('block');
    });
  });
})();
