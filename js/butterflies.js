// Shop: Rosa Nachtfalter flattern über die Fläche und reagieren auf den Mauszeiger.
// - schlagen mit den Flügeln (CSS, siehe .butterfly in input.css)
// - fliegen eine zufällige, leicht torkelnde Bahn und drehen am Rand um
// - Maus weiter weg: neugierig, sie fliegen langsam hin
// - Maus zu nah: sie schrecken auf, flattern schneller und flüchten → so umkreisen sie den Zeiger
(() => {
  const COUNT = 2;            // wie viele Falter
  const SPEED = [60, 95];     // normales Tempo in px/s (min, max)
  const CURIOUS = 650;        // ab diesem Abstand zur Maus werden sie neugierig (px)
  const SCARE = 260;          // ab diesem Abstand schrecken sie auf und fliehen (px)
  const BURST = 3.2;          // so viel schneller fliegen sie beim Aufschrecken

  const board = document.getElementById('board');
  if (!board || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Falter-Bild in drei Teilen: linker Flügel, rechter Flügel, Körper (bleibt ruhig in der Mitte)
  const PARTS = 'images/deko/butterfly/';

  const flies = Array.from({ length: COUNT }, () => {
    const el = document.createElement('div');
    el.className = 'butterfly';
    el.innerHTML = `
      <img class="wing wing-l" src="${PARTS}wing-left.png" alt="" draggable="false" />
      <img class="wing wing-r" src="${PARTS}wing-right.png" alt="" draggable="false" />
      <img class="body" src="${PARTS}body.png" alt="" draggable="false" />`;
    const flap = 0.18 + Math.random() * 0.1; // jeder flattert in eigenem Takt
    el.style.setProperty('--flap', `${flap}s`);
    board.append(el);
    const r = board.getBoundingClientRect();
    return {
      el, flap,
      x: r.width * (0.15 + Math.random() * 0.7),
      y: r.height * (0.15 + Math.random() * 0.7),
      angle: Math.random() * Math.PI * 2,
      turn: 0,
      speed: SPEED[0] + Math.random() * (SPEED[1] - SPEED[0]),
      boost: 1,       // aktueller Tempo-Faktor (geht nach dem Schreck langsam zurück)
      scared: false,
      phase: Math.random() * 10
    };
  });

  let mouse = null;
  board.addEventListener('pointermove', e => {
    const r = board.getBoundingClientRect();
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
  });
  board.addEventListener('pointerleave', () => (mouse = null));

  // Richtung sanft zu einem Zielwinkel drehen
  const steer = (f, target, strength, dt) => {
    f.angle += Math.sin(target - f.angle) * strength * dt;
  };

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const W = board.clientWidth, H = board.clientHeight, margin = 80;

    for (const f of flies) {
      // zufälliges, weiches Kurven
      f.turn += (Math.random() - 0.5) * 6 * dt;
      f.turn *= 0.96;
      f.angle += f.turn * dt * 3;

      // am Rand sanft zurück zur Mitte lenken
      if (f.x < margin || f.x > W - margin || f.y < margin || f.y > H - margin) {
        steer(f, Math.atan2(H / 2 - f.y, W / 2 - f.x), 2.5, dt);
      }

      // auf die Maus reagieren
      let scared = false;
      if (mouse) {
        const dx = f.x - mouse.x, dy = f.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < SCARE) {
          scared = true;
          steer(f, Math.atan2(dy, dx), 9, dt);              // weg von der Maus
          f.boost = Math.max(f.boost, BURST * (1 - d / SCARE) + 1);
        } else if (d < CURIOUS) {
          steer(f, Math.atan2(-dy, -dx), 1.4, dt);          // neugierig hin
        }
      }
      f.boost += (1 - f.boost) * Math.min(1, dt * 1.5);      // beruhigt sich wieder

      // beim Aufschrecken schneller flattern
      if (scared !== f.scared) {
        f.scared = scared;
        f.el.style.setProperty('--flap', `${scared ? f.flap * 0.45 : f.flap}s`);
      }

      f.phase += dt;
      const flutter = 1 + Math.sin(f.phase * 9) * 0.35; // Falter fliegen ruckelig
      const v = f.speed * f.boost * flutter;
      f.x += Math.cos(f.angle) * v * dt;
      f.y += Math.sin(f.angle) * v * dt + Math.sin(f.phase * 5) * 12 * dt;
      f.x = Math.min(Math.max(f.x, 0), W);
      f.y = Math.min(Math.max(f.y, 0), H);

      // Kopf zeigt in Flugrichtung (Grafik schaut nach oben → +90°)
      f.el.style.transform = `translate(${f.x}px, ${f.y}px) translate(-50%, -50%) rotate(${f.angle + Math.PI / 2}rad)`;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
