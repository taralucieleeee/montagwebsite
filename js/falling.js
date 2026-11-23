// Ende der Homepage: Die Projektbilder von oben fallen in den Footer – mit echter Physik (Matter.js).
// - Startet, sobald der Abschnitt ins Bild scrollt
// - Bilder lassen sich mit der Maus greifen und werfen; kurzer Klick öffnet das Projekt
// - Abgeschickte Zeichnungen fallen mit dazu (window.montagFalling.add)
(() => {
  const section = document.getElementById('leave');
  const layer = document.getElementById('falling-layer');
  if (!section || !layer || !window.Matter) return;

  const { Engine, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Query, Events } = Matter;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const engine = Engine.create({ gravity: { y: 1.1 } });
  const runner = Runner.create();
  const items = []; // { body, el, w, h, href }
  let walls = [];
  let started = false;
  let running = false;

  // ── Wände & Boden passend zur Abschnittsgröße ──
  function buildWalls() {
    Composite.remove(engine.world, walls);
    const W = section.clientWidth, H = section.clientHeight, T = 400;
    walls = [
      Bodies.rectangle(W / 2, H + T / 2, W * 3, T, { isStatic: true }),   // Boden
      Bodies.rectangle(-T / 2, H / 2 - H, T, H * 4, { isStatic: true }),  // links
      Bodies.rectangle(W + T / 2, H / 2 - H, T, H * 4, { isStatic: true }) // rechts
    ];
    Composite.add(engine.world, walls);
  }

  // ── Ein Bild als Physik-Körper hinzufügen ──
  function add({ src, w, h, href = null, alt = '', x, y, angle, className = '' }) {
    const W = section.clientWidth;
    // Auf kleinen Bildschirmen nicht größer als 45 % der Breite
    const scale = Math.min(1, (W * 0.45) / w);
    w *= scale; h *= scale;

    const el = document.createElement(href ? 'a' : 'div');
    if (href) el.href = href;
    el.className = `falling-item ${className}`.trim();
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.draggable = false;
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.draggable = false;
    el.append(img);
    layer.append(el);

    const body = Bodies.rectangle(
      x ?? w / 2 + Math.random() * (W - w),
      y ?? -h - Math.random() * 400,
      w, h,
      { angle: angle ?? (Math.random() - 0.5) * 1.2, restitution: 0.15, friction: 0.7, frictionAir: 0.012, density: 0.002 }
    );
    Composite.add(engine.world, body);
    items.push({ body, el, w, h, href });
    if (started && !running) start();
    return body;
  }

  // ── DOM an die Physik koppeln ──
  function render() {
    for (const { body, el, w, h } of items) {
      el.style.transform = `translate(${body.position.x - w / 2}px, ${body.position.y - h / 2}px) rotate(${body.angle}rad)`;
    }
  }
  Events.on(engine, 'afterUpdate', render);

  function start() { if (!running) { Runner.run(runner, engine); running = true; } }
  function stop() { if (running) { Runner.stop(runner); running = false; } }

  // ── Projektbilder aus dem Raster oben übernehmen ──
  function spawnProjects() {
    const W = section.clientWidth;
    // bei vielen Projekten nur eine zufällige Auswahl fallen lassen, sonst wird der Footer voll
    const FALL_COUNT = 10;
    const projects = [...document.querySelectorAll('#content main .project')]
      .sort(() => Math.random() - 0.5).slice(0, FALL_COUNT);
    // zufällige Reihenfolge der Spalten, damit der Haufen jedes Mal anders aussieht
    const slots = projects.map((_, i) => i).sort(() => Math.random() - 0.5);
    projects.forEach((project, i) => {
      const box = project.getBoundingClientRect();
      // kleiner als im Raster: die längere Seite höchstens 17 % der Breite (Handy: 45 %)
      const max = W * (W < 768 ? 0.45 : 0.17);
      const k = Math.min(1, max / Math.max(box.width, box.height));
      const r = { width: box.width * k, height: box.height * k };
      const media = project.querySelector('img, video');
      // Video: das Standbild (poster) fällt mit
      const src = media.tagName === 'VIDEO' ? media.poster : (media.currentSrc || media.src);
      // über die ganze Breite verteilt, gestaffelt nacheinander
      const target = W * (0.08 + 0.84 * ((slots[i] + 0.5) / projects.length)) + (Math.random() - 0.5) * 80;
      const x = Math.min(Math.max(target, r.width / 2), W - r.width / 2);
      add({ src, alt: media.getAttribute('alt') || media.getAttribute('aria-label') || '', w: r.width, h: r.height, href: project.getAttribute('href'), x, y: -r.height - i * 350 });
    });
  }

  // ── Maus: greifen, werfen, klicken ──
  function setupMouse() {
    if (!finePointer) return; // auf Touch-Geräten nur zuschauen, damit Scrollen frei bleibt
    const mouse = Mouse.create(section);
    mouse.element.removeEventListener('wheel', mouse.mousewheel); // Scrollen nicht blockieren
    const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, render: { visible: false } } });
    Composite.add(engine.world, mc);

    // Zeichenfläche & Button sollen keine Bilder dahinter greifen
    ['draw-canvas', 'draw-send'].forEach(id => {
      const el = document.getElementById(id);
      el?.addEventListener('mousedown', e => e.stopPropagation());
    });

    let down = null;
    section.addEventListener('mousedown', e => (down = { x: e.clientX, y: e.clientY }));
    section.addEventListener('mouseup', e => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 5) return;
      const hit = Query.point(items.map(i => i.body), mouse.position)[0];
      const item = items.find(i => i.body === hit);
      if (item?.href) location.href = item.href;
    });
    // Links nicht direkt auslösen – das macht der Klick-Check oben
    layer.addEventListener('click', e => e.preventDefault());

    section.addEventListener('mousemove', () => {
      const over = Query.point(items.map(i => i.body), mouse.position).length > 0;
      section.style.cursor = mc.body ? 'grabbing' : over ? 'grab' : '';
    });
  }

  // ── Los geht's, sobald der Abschnitt sichtbar wird ──
  function begin() {
    started = true;
    buildWalls();
    spawnProjects();
    if (reduceMotion) {
      // Ohne Animation: Physik im Hintergrund durchrechnen, Endzustand zeigen
      for (let i = 0; i < 900; i++) Engine.update(engine, 1000 / 60);
      render();
      return;
    }
    start();
  }

  // Erst fallen lassen, wenn man ganz unten angekommen ist
  function atBottom() {
    return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  }
  function checkBottom() {
    if (!started && atBottom()) {
      begin();
      removeEventListener('scroll', checkBottom);
    }
  }
  addEventListener('scroll', checkBottom, { passive: true });
  checkBottom(); // falls die Seite schon unten geöffnet wird

  // Physik pausieren, solange der Abschnitt nicht zu sehen ist
  new IntersectionObserver(entries => {
    if (started && !reduceMotion) entries[0].isIntersecting ? start() : stop();
  }).observe(section);

  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => started && buildWalls(), 150);
  });

  setupMouse();
  window.montagFalling = { add };
})();
