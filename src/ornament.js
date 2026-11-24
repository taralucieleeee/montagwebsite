/*
  3D-Weihnachtskugel ganz oben auf der Homepage (Ankündigung Montag Market).
  Das Plakat (images/event/…jpg) wird zweimal rundherum auf die Kugel gelegt.
  Die Kugel dreht sich beim Scrollen und schwingt leicht an ihrem Faden.

  Quelle: src/ornament.js  →  wird mit `npm run build:ornament` zu js/ornament.js gebündelt.
  Neues Plakat? Einfach die Bilddatei in index.html (data-poster am #ornament) austauschen.
*/
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const host = document.getElementById('ornament');
if (host) init(host);

function init(host) {
  const canvas = document.createElement('canvas');
  canvas.className = 'absolute inset-0 block h-full w-full';
  canvas.setAttribute('aria-hidden', 'true');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return; // kein WebGL → das Plakatbild (Fallback in index.html) bleibt sichtbar
  }
  host.appendChild(canvas);
  host.classList.add('has-3d');

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 5.6);

  /* ── Aufhängung: alles hängt an einem Punkt oben, damit es pendeln kann ── */
  const pivot = new THREE.Group();
  scene.add(pivot);

  const ornament = new THREE.Group();
  pivot.add(ornament);

  // Chrom-Kugel mit Plakat-Schrift: Hintergrund = Spiegel-Chrom, Schrift = matte Farbe
  const aniso = renderer.capabilities.getMaxAnisotropy();
  const { color, surface } = makeTextures(host.dataset.poster, () => render());
  color.anisotropy = surface.anisotropy = aniso;
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(1, 128, 96),
    new THREE.MeshPhysicalMaterial({
      map: color,
      metalness: 1,
      metalnessMap: surface,   // blau: Chrom (1) / Schrift (0)
      roughness: 1,
      roughnessMap: surface,   // grün: Chrom glatt / Schrift leicht matt
      envMapIntensity: 1.15,
    })
  );
  ornament.add(ball);

  // Kappe + Öse (silbern)
  const silver = new THREE.MeshStandardMaterial({ color: 0xd9d9d9, metalness: 1, roughness: 0.28 });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.23, 0.2, 48), silver);
  cap.position.y = 1.02;
  ornament.add(cap);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.018, 12, 48), silver);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.93;
  ornament.add(rim);
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 12, 32), silver);
  loop.position.y = 1.19;
  ornament.add(loop);

  // Faden (dunkelgrau wie die Schrift) – reicht bis über den oberen Rand
  const thread = new THREE.Mesh(
    new THREE.CylinderGeometry(0.006, 0.006, 6, 8),
    new THREE.MeshBasicMaterial({ color: 0x3d3d3d })
  );
  thread.position.y = 1.26 + 3;
  ornament.add(thread);

  scene.add(new THREE.AmbientLight(0xffffff, 0.35));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(-3, 4, 5);
  scene.add(key);

  /* ── Größe ── */
  let topY = 2; // sichtbarer oberer Rand (Weltkoordinaten)
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Kugel soll ~70 % der Höhe füllen, aber nie breiter als ~80 % der Breite sein
    const visibleH = 2.95, visibleW = 2.6;
    const halfH = Math.max(visibleH, visibleW / camera.aspect) / 2;
    camera.position.z = halfH / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.updateProjectionMatrix();
    topY = halfH;
    pivot.position.y = topY;           // Aufhängepunkt = oberer Rand
    ornament.position.y = -topY - 0.12; // Kugel etwas unter der Mitte
    render();
  }

  /* ── Bewegung ── */
  let spin = 0;          // aktueller Drehwinkel
  const start = -0.1;    // Startdrehung, damit die Schrift vorne steht
  const t0 = performance.now();
  let visible = true, frame = 0;

  function render() {
    renderer.render(scene, camera);
  }

  function tick(now) {
    frame = 0;
    const target = start + scrollY * 0.006;
    spin += (target - spin) * 0.12;
    ball.rotation.y = spin;
    const t = (now - t0) / 1000;
    if (!reduceMotion) {
      pivot.rotation.z = Math.sin(t * 1.1) * 0.025 + Math.sin(t * 0.43) * 0.01;
      pivot.rotation.x = Math.sin(t * 0.8 + 1) * 0.02;
    }
    render();
    if (visible && (!reduceMotion || Math.abs(target - spin) > 0.001)) frame = requestAnimationFrame(tick);
  }
  function wake() {
    if (visible && !frame) frame = requestAnimationFrame(tick);
  }

  spin = start + scrollY * 0.006;
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; wake(); }).observe(host);
  addEventListener('scroll', wake, { passive: true });
  resize();
  wake();
}

/* Plakat zweimal (vorne + hinten) auf eine 2:1-Kugeltextur setzen.
   color   = Farben (Hintergrund silbrig-weiß → wird zu Chrom)
   surface = Oberfläche: wo Schrift ist, wird die Kugel matt und nicht-metallisch */
function makeTextures(src, onLoad) {
  const W = 4096, H = 2048;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);
  const s = document.createElement('canvas');
  s.width = W; s.height = H;
  const sctx = s.getContext('2d');
  sctx.fillStyle = 'rgb(0,10,255)';  // Chrom: Rauheit ~0.04, Metall 1
  sctx.fillRect(0, 0, W, H);

  const color = new THREE.CanvasTexture(c);
  color.colorSpace = THREE.SRGBColorSpace;
  const surface = new THREE.CanvasTexture(s);
  surface.colorSpace = THREE.NoColorSpace;

  const img = new Image();
  img.onload = () => {
    const w = W * 0.36;                       // Plakat bedeckt gut ein Drittel des Umfangs
    const h = Math.round(w * (img.naturalHeight / img.naturalWidth));
    const y = Math.round((H - h) / 2);
    for (const u of [0.25, 0.75]) ctx.drawImage(img, W * u - w / 2, y, w, h);

    // Schrift-Maske aus dem Plakat: je weiter vom Weiß entfernt, desto mehr „Farbe“ statt Chrom
    const px = ctx.getImageData(0, y, W, h);
    const out = sctx.getImageData(0, y, W, h);
    const a = px.data, o = out.data;
    for (let i = 0; i < a.length; i += 4) {
      const ink = Math.min(1, (255 - Math.min(a[i], a[i + 1], a[i + 2])) / 60);
      o[i + 1] = 10 + ink * 100;      // Rauheit: Chrom 0.04 → Schrift 0.43
      o[i + 2] = 255 * (1 - ink);     // Metall:  Chrom 1    → Schrift 0
      // graue Schrift etwas dunkler, damit sie auf dem Chrom gut lesbar ist (Rosa bleibt)
      if (a[i + 1] - a[i + 2] > -8 && a[i] - a[i + 1] < 25) {
        const v = 255 - ink * (255 - 30);
        a[i] = a[i + 1] = a[i + 2] = v;
      }
    }
    sctx.putImageData(out, 0, y);
    ctx.putImageData(px, 0, y);
    color.needsUpdate = surface.needsUpdate = true;
    onLoad();
  };
  img.src = src;
  return { color, surface };
}
