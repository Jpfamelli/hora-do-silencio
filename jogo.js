// A HORA DO SILÊNCIO v2 — motor (Three.js). Mapas e conteúdo em mapas.js, texto em roteiro.js.
import * as THREE from 'three';
import { MAPAS } from './mapas.js';

const R = window.ROTEIRO;
const $ = s => document.querySelector(s);
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const pick = arr => arr[Math.random() * arr.length | 0];
const SAVE_KEY = 'hora-silencio-v3';
const CAPS_KEY = 'hora-silencio-v3-caps';
const CONQ_KEY = 'hora-silencio-v2-conq';
const OPT_KEY = 'hora-silencio-opt';

if (matchMedia('(pointer:coarse)').matches && !matchMedia('(pointer:fine)').matches) $('#aviso-mobile').hidden = false;

const DIFS = {
  facil:    { nome: 'Fácil',    vel: .85, ouvido: .75, dano: .65, pilha: .7, aviso: 9, intervalo: 1.4 },
  normal:   { nome: 'Normal',   vel: 1,   ouvido: 1,   dano: 1,   pilha: 1,  aviso: 7, intervalo: 1 },
  pesadelo: { nome: 'Pesadelo', vel: 1.15, ouvido: 1.35, dano: 9, pilha: 1.3, aviso: 5, intervalo: .7 }
};
const OPT = { sens: 1, vol: .8 };
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
Object.assign(OPT, lsGet(OPT_KEY, {}));

// =====================================================================
// RENDER
// =====================================================================
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020304);
scene.fog = new THREE.FogExp2(0x04060a, 0.07);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.05, 160);
camera.rotation.order = 'YXZ';
scene.add(camera);
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });

const hemi = new THREE.HemisphereLight(0x6f7fa6, 0x141416, .7);
scene.add(hemi);
const moon = new THREE.DirectionalLight(0x9aaad8, .9);
moon.position.set(-20, 30, 30);
scene.add(moon);
let luzBase = 1, ambFora = { hemi: .7, moon: .9, fog: .045 }, ambDentro = { hemi: .1, moon: .05, fog: .095 };

const flash = new THREE.SpotLight(0xfff0d2, 30, 22, 0.4, 0.5, 0.9);
flash.position.set(0.22, -0.18, 0);
flash.castShadow = true;
flash.shadow.mapSize.set(1024, 1024);
flash.shadow.camera.near = 0.1; flash.shadow.camera.far = 22;
flash.shadow.bias = -0.0006;
camera.add(flash);
flash.target.position.set(0, -0.15, -5);
camera.add(flash.target);
const flashFill = new THREE.PointLight(0xffe2b8, .6, 3, 2);
camera.add(flashFill);

// =====================================================================
// TEXTURAS
// =====================================================================
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function speckle(g, w, h, n, cols, smin, smax, alpha) {
  for (let i = 0; i < n; i++) { g.globalAlpha = alpha * Math.random(); g.fillStyle = cols[i % cols.length]; const s = rand(smin, smax); g.fillRect(Math.random() * w, Math.random() * h, s, s); }
  g.globalAlpha = 1;
}
function stains(g, w, h, n, col, rmin = 18, rmax = 80) {
  for (let i = 0; i < n; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = rand(rmin, rmax);
    const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
}
function textoTex(linhas, { w = 512, h = 256, fundo = '#211c16', cor = '#9b8a62', fonte = 'Georgia', tam = 40, manchas = 6 } = {}) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = fundo; g.fillRect(0, 0, w, h);
    g.fillStyle = cor; g.textAlign = 'center';
    linhas.forEach((l, i) => { g.font = `${l.estilo || ''} ${l.tam || tam}px ${l.fonte || fonte}`; g.fillText(l.t ?? l, w / 2, (l.y ?? (h / (linhas.length + 1)) * (i + 1)) + 10); });
    stains(g, w, h, manchas, 'rgba(0,0,0,.55)');
  });
}
const TX = {
  reboco: canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#6a6151'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 3500, ['#4a4338', '#7d7462', '#3a342b'], 1, 4, .5);
    stains(g, w, h, 10, 'rgba(38,30,18,.55)');
    g.strokeStyle = 'rgba(28,22,14,.4)';
    for (let i = 0; i < 18; i++) { const x = Math.random() * w; g.lineWidth = rand(1, 3); g.beginPath(); g.moveTo(x, 0); g.lineTo(x + rand(-3, 3), rand(30, 160)); g.stroke(); }
    g.fillStyle = 'rgba(48,52,40,.65)'; g.fillRect(0, h * .66, w, h * .34);
    g.fillStyle = 'rgba(18,14,10,.7)'; g.fillRect(0, h * .66, w, 4);
  }),
  azulejo: canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#8a9690'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = `hsl(150,6%,${rand(48, 58)}%)`; g.fillRect(x * 32 + 1, y * 32 + 1, 30, 30); }
    stains(g, w, h, 12, 'rgba(60,40,20,.55)'); speckle(g, w, h, 1500, ['#333', '#9a9'], 1, 2, .4);
    g.fillStyle = 'rgba(30,20,10,.6)'; g.fillRect(0, h * .7, w, h * .3);
  }),
  tijolo: canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#2a2420'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 21) for (let x = (y / 21) % 2 ? -26 : 0; x < w; x += 52) { g.fillStyle = `hsl(14,${rand(20, 35)}%,${rand(18, 28)}%)`; g.fillRect(x + 2, y + 2, 48, 17); }
    stains(g, w, h, 10, 'rgba(10,20,10,.6)'); speckle(g, w, h, 2000, ['#111', '#544'], 1, 3, .4);
  }),
  pedra: canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#4b4a46'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? -32 : 0; x < w; x += 64) { g.fillStyle = `hsl(40,4%,${rand(22, 34)}%)`; g.fillRect(x + 2, y + 2, 60, 28); }
    speckle(g, w, h, 2000, ['#222', '#666'], 1, 3, .4); stains(g, w, h, 7, 'rgba(10,20,10,.55)');
  }),
  madeira: canvasTex(256, 256, (g, w, h) => {
    for (let i = 0; i < 8; i++) {
      g.fillStyle = `hsl(28,${rand(25, 35)}%,${rand(14, 22)}%)`; g.fillRect(0, i * 32, w, 32);
      g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, i * 32, w, 2); g.fillRect(rand(0, w), i * 32, 2, 32);
      g.strokeStyle = 'rgba(0,0,0,.15)';
      for (let k = 0; k < 6; k++) { g.beginPath(); const yy = i * 32 + rand(4, 28); g.moveTo(0, yy); g.bezierCurveTo(w * .3, yy + rand(-4, 4), w * .6, yy + rand(-4, 4), w, yy); g.stroke(); }
    }
    stains(g, w, h, 5, 'rgba(0,0,0,.45)');
  }),
  ladrilho: canvasTex(256, 256, (g, w, h) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#5c5850' : '#2b2925'; g.fillRect(x * 32, y * 32, 32, 32); }
    g.strokeStyle = 'rgba(0,0,0,.5)'; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); }
    speckle(g, w, h, 2500, ['#111', '#777'], 1, 3, .35); stains(g, w, h, 8, 'rgba(30,20,10,.55)');
  }),
  concreto: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#3c3b38'; g.fillRect(0, 0, w, h); speckle(g, w, h, 5000, ['#2a2a28', '#55534e', '#1c1c1b'], 1, 3, .5); stains(g, w, h, 10, 'rgba(15,18,12,.6)'); }),
  grama: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#141910'; g.fillRect(0, 0, w, h); speckle(g, w, h, 6000, ['#1f2817', '#0c0f08', '#2a2a1a', '#30301f'], 1, 4, .7); }),
  terra: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#2a2018'; g.fillRect(0, 0, w, h); speckle(g, w, h, 6000, ['#1a140e', '#3a2c20', '#14100c'], 1, 4, .7); stains(g, w, h, 8, 'rgba(0,0,0,.4)'); }),
  asfalto: canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#1c1c1e'; g.fillRect(0, 0, w, h); speckle(g, w, h, 6000, ['#2a2a2c', '#111', '#333'], 1, 3, .6);
    g.fillStyle = 'rgba(200,180,90,.55)'; for (let y = 0; y < h; y += 64) g.fillRect(w / 2 - 3, y, 6, 36);
    stains(g, w, h, 6, 'rgba(0,0,0,.5)');
  }),
  telhado: canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#1e1513'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, y, w, 2); } speckle(g, w, h, 900, ['#2e201c', '#0d0908'], 1, 3, .6); }),
  papel: canvasTex(128, 160, (g, w, h) => { g.fillStyle = '#cdbf9f'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(40,30,20,.55)'; for (let y = 22; y < h - 14; y += 9) g.fillRect(12, y, rand(60, 104), 2); stains(g, w, h, 3, 'rgba(90,60,20,.35)'); }),
  relogio: canvasTex(128, 128, (g) => {
    g.fillStyle = '#b8ab8a'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = '#211'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#211'; g.font = '14px Georgia'; g.textAlign = 'center';
    for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; g.fillText(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][i - 1], 64 + Math.sin(a) * 46, 69 - Math.cos(a) * 46); }
    g.lineWidth = 4; g.beginPath(); g.moveTo(64, 64); g.lineTo(34, 64); g.stroke(); g.lineWidth = 2; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 18); g.stroke();
  }),
  kit: canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#d7d2c6'; g.fillRect(0, 0, w, h); g.fillStyle = '#8e1b14'; g.fillRect(26, 12, 12, 40); g.fillRect(12, 26, 40, 12); }),
  rabisco: canvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(25,8,6,.85)'; g.lineWidth = 3;
    for (let i = 0; i < 40; i++) { const x = rand(10, w - 10), y = rand(10, h - 10); g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x, y + 8); g.moveTo(x - 5, y - 3); g.lineTo(x + 5, y - 3); g.stroke(); }
    g.font = 'bold 30px Georgia'; g.fillStyle = 'rgba(30,6,4,.9)'; g.fillText('SILÊNCIO', 40, 140);
  }),
  lousa: canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#1d2a22'; g.fillRect(0, 0, w, h); stains(g, w, h, 10, 'rgba(200,200,200,.06)', 30, 120);
    g.fillStyle = 'rgba(220,220,210,.75)'; g.font = '28px Georgia';
    for (let i = 0; i < 6; i++) g.fillText('Eu não vou falar depois das nove.', 26, 44 + i * 36);
  }),
  agua: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#0d1612'; g.fillRect(0, 0, w, h); stains(g, w, h, 30, 'rgba(60,80,60,.25)', 8, 40); speckle(g, w, h, 600, ['#2a3a2a', '#000'], 1, 3, .5); }),
  lencol: canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#a49e8e'; g.fillRect(0, 0, w, h); stains(g, w, h, 6, 'rgba(90,70,40,.4)', 6, 30); stains(g, w, h, 2, 'rgba(80,10,10,.35)', 4, 14); })
};
for (const k in TX) TX[k].name = k;
function texMat(key, rx = 1, ry = 1, extra = {}) {
  const t = TX[key].clone(); t.needsUpdate = true; t.repeat.set(rx, ry); t.userData = { clone: true };
  return new THREE.MeshStandardMaterial({ map: t, roughness: .95, metalness: 0, ...extra });
}
const comp = m => { m.userData.compartilhado = true; return m; };
const MAT = {
  porta: comp(texMat('madeira', 1, 1, { color: 0x8a7a66 })),
  madeiraEsc: comp(new THREE.MeshStandardMaterial({ color: 0x2a1d14, roughness: .9 })),
  madeira: comp(texMat('madeira', 1, 1)),
  metal: comp(new THREE.MeshStandardMaterial({ color: 0x444a4c, roughness: .55, metalness: .6 })),
  metalVerde: comp(new THREE.MeshStandardMaterial({ color: 0x2e3a33, roughness: .6, metalness: .5 })),
  ferrugem: comp(new THREE.MeshStandardMaterial({ color: 0x4a2c1c, roughness: .8, metalness: .4 })),
  colchao: comp(new THREE.MeshStandardMaterial({ color: 0x7c7462, roughness: 1 })),
  lencol: comp(new THREE.MeshStandardMaterial({ map: TX.lencol, roughness: 1, side: THREE.DoubleSide })),
  branco: comp(new THREE.MeshStandardMaterial({ color: 0xb8b2a4, roughness: .7 })),
  preto: comp(new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 1 })),
  tecido: comp(new THREE.MeshStandardMaterial({ color: 0x3b1714, roughness: 1 })),
  vidro: comp(new THREE.MeshStandardMaterial({ color: 0x111820, roughness: .1, metalness: .2, transparent: true, opacity: .5 })),
  papel: comp(new THREE.MeshStandardMaterial({ map: TX.papel, roughness: 1, emissive: 0x2a2418, emissiveIntensity: .7, side: THREE.DoubleSide })),
  telhado: comp(texMat('telhado', 6, 6)),
  carro: comp(new THREE.MeshStandardMaterial({ color: 0x3a3f36, roughness: .4, metalness: .6 })),
  pneu: comp(new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .9 })),
  arvore: comp(new THREE.MeshStandardMaterial({ color: 0x0b110a, roughness: 1 })),
  tronco: comp(new THREE.MeshStandardMaterial({ color: 0x19120d, roughness: 1 })),
  vela: comp(new THREE.MeshStandardMaterial({ color: 0xe8dcc0, emissive: 0xffb050, emissiveIntensity: .3 })),
  bronze: comp(new THREE.MeshStandardMaterial({ color: 0x6a5226, roughness: .35, metalness: .9 })),
  pedraLap: comp(new THREE.MeshStandardMaterial({ color: 0x55534c, roughness: .95 })),
  pele: comp(new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: .7 })),
  sombra: comp(new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .92 }))
};

// =====================================================================
// MUNDO (recriado a cada mapa)
// =====================================================================
const W = { grupo: null, colliders: [], solid: [], inter: [], doors: [], lockers: [], items: [], lampadas: [], salas: [], links: [], gatilhos: [], tick: [], spots: {}, agua: [], mapa: null, def: null };
const T = 0.1, DW = 1.6, DH = 2.3;

function limparMundo() {
  if (W.grupo) {
    scene.remove(W.grupo);
    W.grupo.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) for (const m of [].concat(o.material)) if (!m.userData.compartilhado) { if (m.map && m.map.userData && m.map.userData.clone) m.map.dispose(); m.dispose(); }
    });
  }
  W.grupo = new THREE.Group(); scene.add(W.grupo);
  for (const k of ['colliders', 'solid', 'inter', 'doors', 'lockers', 'items', 'lampadas', 'salas', 'links', 'gatilhos', 'tick', 'agua']) W[k] = [];
  W.spots = {};
}
function addCollider(minX, maxX, minZ, maxZ) { const c = { minX, maxX, minZ, maxZ, on: true }; W.colliders.push(c); return c; }
function box(w, h, d, mat, x, y, z, parent = W.grupo, shadow = true) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m;
}
function cyl(rt, rb, h, mat, x, y, z, seg = 10, parent = W.grupo) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
function prop(w, h, d, mat, x, y, z) { const m = box(w, h, d, mat, x, y, z); addCollider(x - w / 2, x + w / 2, z - d / 2, z + d / 2); W.solid.push(m); return m; }
function plano(w, h, mat, x, y, z, ry = 0, parent = W.grupo) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; parent.add(m); return m; }

// Parede ao longo de uma linha, com cortes (vãos de porta)
function parede(x1, z1, x2, z2, { h = 3.2, tex = 'reboco', cortes = [], cor, esp = T } = {}) {
  const horiz = Math.abs(z1 - z2) < 1e-6;
  const a = horiz ? Math.min(x1, x2) : Math.min(z1, z2), b = horiz ? Math.max(x1, x2) : Math.max(z1, z2);
  const fixed = horiz ? z1 : x1;
  const pieces = []; let cur = a;
  for (const c of [...cortes].sort((p, q) => p.c - q.c)) {
    const s = c.c - c.l / 2, e = c.c + c.l / 2;
    if (s > cur) pieces.push([cur, s]);
    pieces.push([s, e, c.alto || DH]); cur = e;
  }
  if (cur < b) pieces.push([cur, b]);
  for (const [s, e, lintel] of pieces) {
    const len = e - s; if (len < .001) continue;
    const mid = (s + e) / 2, ph = lintel ? h - lintel : h, py = lintel ? lintel + ph / 2 : h / 2;
    if (ph <= .01) continue;
    const mat = texMat(tex, Math.max(.5, len / 3), lintel ? ph / h : h / 3.2, cor ? { color: cor } : {});
    if (lintel) mat.map.offset.y = lintel / h;
    const m = horiz ? box(len, ph, esp, mat, mid, py, fixed) : box(esp, ph, len, mat, fixed, py, mid);
    W.solid.push(m);
    if (!lintel) horiz ? addCollider(s, e, fixed - esp / 2, fixed + esp / 2) : addCollider(fixed - esp / 2, fixed + esp / 2, s, e);
  }
}
function piso(x0, x1, z0, z1, tex, rep = 3, y = 0.001) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), texMat(tex, (x1 - x0) / rep, (z1 - z0) / rep));
  m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true; W.grupo.add(m); return m;
}
function teto(x0, x1, z0, z1, h = 3.2) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), texMat('reboco', (x1 - x0) / 4, (z1 - z0) / 4, { color: 0x4a463e }));
  m.rotation.x = Math.PI / 2; m.position.set((x0 + x1) / 2, h, (z0 + z1) / 2); m.receiveShadow = true; W.grupo.add(m);
  box(x1 - x0 + .25, .3, z1 - z0 + .25, MAT.telhado, (x0 + x1) / 2, h + .16, (z0 + z1) / 2, W.grupo, false);
}

// Salas: cada sala interna faz piso, teto e 4 paredes recuadas (sem z-fighting com a vizinha)
function construirSalas(salas, portas) {
  for (const r of salas) {
    r.h = r.h || 3.2; W.salas.push(r); W.spots[r.id] = { chao: [], mesa: [], cama: [], prateleira: [], parede: [] };
    if (r.fora) continue;
    piso(r.x0, r.x1, r.z0, r.z1, r.piso || 'madeira', r.piso === 'pedra' ? 2.5 : 3);
    if (!r.semTeto) teto(r.x0, r.x1, r.z0, r.z1, r.h);
    const doEdge = (eixo, coord, lo, hi) => portas.filter(p => (p.a === r.id || p.b === r.id) && p.eixo === eixo && Math.abs((eixo === 'x' ? p.z : p.x) - coord) < .01 && (eixo === 'x' ? p.x : p.z) > lo && (eixo === 'x' ? p.x : p.z) < hi)
      .map(p => ({ c: eixo === 'x' ? p.x : p.z, l: p.largura || DW, alto: p.alto || (p.tipo === 'aberta' ? Math.min(r.h - .2, 2.8) : DH) }));
    const o = { h: r.h, tex: r.parede || 'reboco', cor: r.corParede };
    parede(r.x0, r.z0 + T / 2, r.x1, r.z0 + T / 2, { ...o, cortes: doEdge('x', r.z0, r.x0, r.x1) });
    parede(r.x0, r.z1 - T / 2, r.x1, r.z1 - T / 2, { ...o, cortes: doEdge('x', r.z1, r.x0, r.x1) });
    parede(r.x0 + T / 2, r.z0, r.x0 + T / 2, r.z1, { ...o, cortes: doEdge('z', r.x0, r.z0, r.z1) });
    parede(r.x1 - T / 2, r.z0, r.x1 - T / 2, r.z1, { ...o, cortes: doEdge('z', r.x1, r.z0, r.z1) });
    if (r.agua) agua(r.x0, r.x1, r.z0, r.z1);
  }
  for (const p of portas) {
    const d = p.tipo !== 'aberta' ? porta(p) : null;
    W.links.push({ a: p.a, b: p.b, x: p.x, z: p.z, eixo: p.eixo, door: d });
  }
  // mobília logo aqui: os mapas usam spot() em seguida
  for (const r of salas) if (!r.fora && r.tipo) mobiliar(r);
}
function agua(x0, x1, z0, z1) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshStandardMaterial({ map: TX.agua, color: 0x6a7a70, roughness: .15, metalness: .3, transparent: true, opacity: .82 }));
  m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, .42, (z0 + z1) / 2); m.receiveShadow = true; W.grupo.add(m);
  W.agua.push(m);
}
function roomAt(x, z) {
  for (const r of W.salas) if (!r.fora && x >= r.x0 - .02 && x <= r.x1 + .02 && z >= r.z0 - .02 && z <= r.z1 + .02) return r;
  for (const r of W.salas) if (r.fora && x >= r.x0 && x <= r.x1 && z >= r.z0 && z <= r.z1) return r;
  return W.salas.find(r => r.fora) || W.salas[0];
}
const SALA = id => W.salas.find(r => r.id === id);

// --- Interações
function interact(obj, label, act, extra = {}) {
  const it = { obj, label, act, on: () => true, ...extra };
  obj.traverse(o => { o.userData.it = it; });
  W.inter.push(it); return it;
}
function cap(s) { return s[0].toUpperCase() + s.slice(1); }
function porta(p) {
  const pivot = new THREE.Group();
  const lw = p.largura || DW;
  if (p.eixo === 'x') pivot.position.set(p.x - lw / 2, 0, p.z); else pivot.position.set(p.x, 0, p.z - lw / 2);
  W.grupo.add(pivot);
  const pw = lw - .06, grade = p.tipo === 'grade';
  if (grade) {
    for (let i = 0; i < 8; i++) { const off = .1 + i * (pw - .2) / 7; cyl(.02, .02, DH - .1, MAT.ferrugem, p.eixo === 'x' ? off : 0, DH / 2, p.eixo === 'x' ? 0 : off, 6, pivot); }
    for (const y of [DH - .1, .3]) box(p.eixo === 'x' ? pw : .05, .06, p.eixo === 'x' ? .05 : pw, MAT.ferrugem, p.eixo === 'x' ? pw / 2 : 0, y, p.eixo === 'x' ? 0 : pw / 2, pivot);
    box(.1, .14, .06, MAT.bronze, p.eixo === 'x' ? pw - .15 : .05, 1.1, p.eixo === 'x' ? .05 : pw - .15, pivot);
  } else {
    p.eixo === 'x' ? box(pw, DH - .04, .07, MAT.porta, lw / 2, DH / 2, 0, pivot) : box(.07, DH - .04, pw, MAT.porta, 0, DH / 2, lw / 2, pivot);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(.045, 8, 6), MAT.bronze);
    if (p.eixo === 'x') knob.position.set(lw - .2, 1.0, .07); else knob.position.set(.07, 1.0, lw - .2);
    pivot.add(knob);
  }
  const col = p.eixo === 'x' ? addCollider(p.x - lw / 2, p.x + lw / 2, p.z - .06, p.z + .06) : addCollider(p.x - .06, p.x + .06, p.z - lw / 2, p.z + lw / 2);
  const d = { id: p.id, pivot, col, open: false, ang: 0, target: 0, trava: p.trava, msg: p.msg || 'Trancada.', nome: p.nome || 'porta', x: p.x, z: p.z, eixo: p.eixo, grade, aoAbrir: p.aoAbrir };
  W.doors.push(d);
  const it = interact(pivot, () => (d.trava && d.trava()) ? `${cap(d.nome)} — ${typeof d.msg === 'function' ? d.msg() : d.msg}` : `<b>E</b>${d.open ? 'Fechar' : 'Abrir'} ${d.nome}`,
    () => { if (d.trava && d.trava()) { SFX.trancado(); emitNoise(d.x, d.z, 3); if (p.aoTentar) p.aoTentar(); return; } setDoor(d, !d.open); if (d.open && d.aoAbrir) d.aoAbrir(); });
  if (p.hold) { it.hold = p.hold; it.ruido = p.ruidoHold || 8; it.som = 'forcar'; it.pode = () => !(d.trava && d.trava()) && !d.open; const lb = it.label; it.label = () => (!d.open && !(d.trava && d.trava())) ? `<b>E</b>${p.holdTexto || 'Forçar a ' + d.nome}` : lb(); }
  const k = `${W.mapa}:${d.id}`;
  if (S.doorsOpen[k]) { d.open = true; d.target = d.ang = -Math.PI * .56; pivot.rotation.y = d.ang; col.on = false; }
  return d;
}
function setDoor(d, open, silent) {
  d.open = open; d.target = open ? -Math.PI * .56 : 0; d.col.on = !open;
  S.doorsOpen[`${W.mapa}:${d.id}`] = open;
  if (!silent) { SFX.rangido(d.x, 1.2, d.z); emitNoise(d.x, d.z, open ? 4.5 : 5.5); }
}
const DOOR = id => W.doors.find(d => d.id === id);

function armario(x, z, face) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(face[0], face[1]); W.grupo.add(g);
  const corpo = box(.9, 2.05, .62, MAT.metalVerde, 0, 1.025, 0, g);
  box(.86, 1.95, .03, MAT.metalVerde, 0, 1.03, .32, g);
  for (let i = 0; i < 6; i++) box(.5, .025, .02, MAT.preto, 0, 1.6 + i * .06, .34, g, false);
  Math.abs(face[0]) > .5 ? addCollider(x - .31, x + .31, z - .45, z + .45) : addCollider(x - .45, x + .45, z - .31, z + .31);
  const L = { g, x, z, face, tipo: 'armario' };
  W.lockers.push(L); W.solid.push(corpo);
  interact(g, () => S.hidden === L ? '<b>E</b>Sair do armário' : '<b>E</b>Esconder no armário', () => S.hidden === L ? sairEsconderijo() : entrarEsconderijo(L));
  return L;
}
function cama(x, z, ao = 'x', spotSala) { // cama comprida no eixo "ao"
  const L = ao === 'x' ? 2 : .9, C = ao === 'x' ? .9 : 2;
  const g = new THREE.Group(); g.position.set(x, 0, z); W.grupo.add(g);
  const estrutura = box(L, .12, C, MAT.ferrugem, 0, .42, 0, g);
  for (const [dx, dz] of [[-L / 2 + .05, -C / 2 + .05], [L / 2 - .05, -C / 2 + .05], [-L / 2 + .05, C / 2 - .05], [L / 2 - .05, C / 2 - .05]]) box(.05, .42, .05, MAT.ferrugem, dx, .21, dz, g);
  box(L - .1, .14, C - .05, MAT.colchao, 0, .55, 0, g);
  box(ao === 'x' ? L * .6 : C * .95, .04, ao === 'x' ? C * .95 : L * .6, MAT.lencol, ao === 'x' ? .3 : 0, .64, ao === 'x' ? 0 : .3, g);
  if (ao === 'x') box(.06, .9, C, MAT.ferrugem, -L / 2, .45, 0, g); else box(L, .9, .06, MAT.ferrugem, 0, .45, -C / 2, g);
  addCollider(x - L / 2, x + L / 2, z - C / 2, z + C / 2); W.solid.push(estrutura);
  const H = { g, x, z, face: ao === 'x' ? [0, 1] : [1, 0], tipo: 'cama', ao };
  W.lockers.push(H);
  interact(g, () => S.hidden === H ? '<b>E</b>Sair de baixo da cama' : '<b>E</b>Esconder embaixo da cama', () => S.hidden === H ? sairEsconderijo() : entrarEsconderijo(H));
  if (spotSala) W.spots[spotSala].cama.push({ x: x + (ao === 'x' ? -.3 : 0), y: .63, z: z + (ao === 'x' ? 0 : -.3) });
  return H;
}
function lampada(x, z, h = 3.2, alcance = 8, cor = 0xffc98a, base = 6) {
  box(.01, .5, .01, MAT.preto, x, h - .25, z, W.grupo, false);
  const bulbo = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshStandardMaterial({ color: 0x332e25, emissive: 0xffc070, emissiveIntensity: 0 }));
  bulbo.position.set(x, h - .55, z); W.grupo.add(bulbo);
  const luz = new THREE.PointLight(cor, 0, alcance, 1.2); luz.position.set(x, h - .65, z); W.grupo.add(luz);
  const L = { x, z, luz, bulbo, base, alcance, flick: Math.random() * 10, sempre: false, ligada: false };
  W.lampadas.push(L); return L;
}
function vela(x, y, z) {
  cyl(.03, .03, .25, MAT.vela, x, y + .125, z, 8);
  const l = new THREE.PointLight(0xff9a40, 1.2, 4.5, 1.8); l.position.set(x, y + .4, z); W.grupo.add(l);
  W.tick.push(() => { l.intensity = 1.1 + Math.random() * .4; });
}
function gatilho(id, x0, x1, z0, z1, fn, once = true) { W.gatilhos.push({ id, x0, x1, z0, z1, fn, once }); }

// --- Itens
const glow = (mat, c = 0x302010, i = .7) => { const m = mat.clone(); m.emissive = new THREE.Color(c); m.emissiveIntensity = i; m.userData = {}; return m; };
const MK = {
  lanterna() { const g = new THREE.Group(); const c = cyl(.04, .05, .28, glow(MAT.metal, 0x332a1a, .6), 0, .05, 0, 10, g); c.rotation.z = Math.PI / 2; return g; },
  pilha() { const g = new THREE.Group(); const c = cyl(.03, .03, .11, new THREE.MeshStandardMaterial({ color: 0xb08a2a, emissive: 0x4a3510, emissiveIntensity: .8, metalness: .5, roughness: .4 }), 0, .03, 0, 8, g); c.rotation.z = Math.PI / 2; return g; },
  kit() { const g = new THREE.Group(); box(.32, .14, .22, new THREE.MeshStandardMaterial({ map: TX.kit, emissive: 0x2a2020, emissiveIntensity: .5 }), 0, .07, 0, g); return g; },
  galao() { const g = new THREE.Group(); box(.3, .4, .18, new THREE.MeshStandardMaterial({ color: 0x7a1a12, emissive: 0x2a0805, emissiveIntensity: .7, roughness: .5 }), 0, .2, 0, g); cyl(.03, .03, .1, MAT.preto, .08, .44, 0, 6, g); return g; },
  fusivel() { const g = new THREE.Group(); const c = cyl(.035, .035, .16, new THREE.MeshStandardMaterial({ color: 0x9fb7c0, emissive: 0x203038, emissiveIntensity: 1, transparent: true, opacity: .85 }), 0, .04, 0, 8, g); c.rotation.z = Math.PI / 2; return g; },
  nota() { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.PlaneGeometry(.24, .3), MAT.papel); m.rotation.x = -Math.PI / 2; m.rotation.z = rand(-.5, .5); m.position.y = .006; g.add(m); return g; },
  notaParede() { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.PlaneGeometry(.3, .38), MAT.papel)); return g; },
  pagina() { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.PlaneGeometry(.2, .26), glow(MAT.papel, 0x403420, 1.1)); m.rotation.x = -Math.PI / 2; m.rotation.z = rand(-.6, .6); m.position.y = .006; g.add(m); return g; },
  garrafa() { const g = new THREE.Group(); cyl(.04, .045, .22, new THREE.MeshStandardMaterial({ color: 0x1a3a20, roughness: .15, metalness: .2, emissive: 0x08140a, emissiveIntensity: .8, transparent: true, opacity: .9 }), 0, .11, 0, 8, g); cyl(.015, .02, .08, MAT.preto, 0, .26, 0, 6, g); return g; },
  chave() { const g = new THREE.Group(); const m = glow(MAT.bronze, 0x403010, .9); cyl(.03, .03, .01, m, 0, .006, 0, 10, g); box(.12, .01, .02, m, .08, .006, 0, g); return g; },
  engrenagem() { const g = new THREE.Group(); const m = glow(MAT.bronze, 0x403010, 1); const t = new THREE.Mesh(new THREE.TorusGeometry(.05, .018, 6, 12), m); t.rotation.x = Math.PI / 2; t.position.y = .02; g.add(t); for (let i = 0; i < 8; i++) box(.025, .02, .025, m, Math.cos(i / 8 * 6.28) * .07, .02, Math.sin(i / 8 * 6.28) * .07, g); return g; },
  gravador() { const g = new THREE.Group(); box(.34, .1, .2, new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: .5, metalness: .3, emissive: 0x100c08, emissiveIntensity: .5 }), 0, .05, 0, g); box(.14, .01, .08, MAT.preto, -.05, .105, 0, g); box(.02, .02, .02, new THREE.MeshStandardMaterial({ emissive: 0xff2010, emissiveIntensity: 1 }), .13, .1, .07, g); return g; },
  carrinho() { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: 0x1d4a7a, emissive: 0x0a1a30, emissiveIntensity: .9, roughness: .4 }); box(.26, .08, .12, m, 0, .06, 0, g); box(.13, .07, .11, m, -.02, .13, 0, g); return g; },
  boneca() { const g = new THREE.Group(); const p = new THREE.MeshStandardMaterial({ color: 0xc9b29a, emissive: 0x302018, emissiveIntensity: .7 }); const v = new THREE.MeshStandardMaterial({ color: 0x7a2030, emissive: 0x200810, emissiveIntensity: .7 }); cyl(.05, .09, .2, v, 0, .1, 0, 8, g); const h = new THREE.Mesh(new THREE.SphereGeometry(.055, 10, 8), p); h.position.y = .25; g.add(h); return g; },
  caderno() { const g = new THREE.Group(); box(.18, .03, .24, new THREE.MeshStandardMaterial({ color: 0x2d4a2a, emissive: 0x0c180b, emissiveIntensity: .9 }), 0, .015, 0, g); return g; }
};
function spot(sala, tipo, i = 0) {
  const l = W.spots[sala] && W.spots[sala][tipo];
  if (!l || !l.length) { console.warn('spot faltando', sala, tipo, i); const r = SALA(sala); return { x: (r.x0 + r.x1) / 2, y: 0, z: (r.z0 + r.z1) / 2 }; }
  return l[i % l.length];
}
function item(id, pos, mesh, label, onPick, cond) {
  const key = `${W.mapa}:${id}`;
  mesh.position.set(pos.x, pos.y, pos.z); W.grupo.add(mesh);
  mesh.traverse(o => { if (o.isMesh) o.castShadow = true; });
  const it = interact(mesh, typeof label === 'function' ? label : () => `<b>E</b>${label}`, () => {
    S.picked[key] = true; mesh.visible = false; SFX.pegar(); emitNoise(pos.x, pos.z, 2.5);
    onPick && onPick(); syncWorld(); renderInvMini();
  });
  it.on = () => mesh.visible;
  W.items.push({ key, mesh, cond, it });
  mesh.visible = !S.picked[key] && (!cond || cond());
  return it;
}
const ITENS = {
  pilha: (id, p) => item(id, p, MK.pilha(), 'Pegar pilhas', () => { S.inv.pilhas++; toast('Pilhas guardadas. R para trocar.'); }),
  kit: (id, p) => item(id, p, MK.kit(), 'Pegar curativo', () => { S.inv.kits++; toast('Curativo guardado. H para usar.'); }),
  garrafa: (id, p) => item(id, p, MK.garrafa(), 'Pegar garrafa vazia', () => { S.inv.garrafas++; if (!S.flags.dicaGarrafa) { S.flags.dicaGarrafa = true; toast('G joga a garrafa longe. O barulho atrai o Inspetor para lá.'); } }),
  nota: (nid, p, parede) => {
    const n = R.notas.find(x => x.id === nid) || R.paginas.find(x => x.id === nid);
    const it = item('nota_' + nid, p, parede ? MK.notaParede() : (nid[0] === 'p' ? MK.pagina() : MK.nota()), () => `<b>E</b>Ler: ${n.titulo}${S.notes[nid] ? ' (lida)' : ''}`, null);
    it.act = () => lerNota(nid); it.on = () => it.obj.visible;
    return it;
  },
  gravador: (fid, p, cond) => {
    const f = R.fitas.find(x => x.id === fid);
    const g = MK.gravador(); g.position.set(p.x, p.y, p.z); W.grupo.add(g);
    const it = interact(g, () => fitaTocando ? 'O gravador está tocando...' : `<b>E</b>${S.fitas[fid] ? 'Ouvir de novo' : 'Ouvir'}: ${f.titulo}`, () => tocarFita(fid));
    if (cond) { it.on = cond; W.tick.push(() => { g.visible = cond(); }); }
    return it;
  }
};

// =====================================================================
// MOBÍLIA AUTOMÁTICA (gera "spots" seguros para itens: nada flutua nem fica dentro de móvel)
// =====================================================================
function cantos(r, inset = .7) { return [[r.x0 + inset, r.z0 + inset], [r.x1 - inset, r.z0 + inset], [r.x0 + inset, r.z1 - inset], [r.x1 - inset, r.z1 - inset]]; }
function mesaSimples(x, z, w, d, h, sp, mat = MAT.madeira) {
  prop(w, .06, d, mat, x, h - .03, z);
  for (const [dx, dz] of [[-w / 2 + .06, -d / 2 + .06], [w / 2 - .06, -d / 2 + .06], [-w / 2 + .06, d / 2 - .06], [w / 2 - .06, d / 2 - .06]]) box(.06, h - .06, .06, MAT.madeiraEsc, x + dx, (h - .06) / 2, z + dz);
  if (sp) sp.push({ x: x - w * .25, y: h, z }, { x: x + w * .25, y: h, z });
}
function estante(x, z, ao, len, sp, frente = 1) { // encostada na parede; "frente" = lado aberto (+1/-1)
  const w = ao === 'x' ? len : .4, d = ao === 'x' ? .4 : len;
  prop(w, 2.1, d, MAT.madeiraEsc, x, 1.05, z);
  const fx = ao === 'x' ? 0 : .21 * frente, fz = ao === 'x' ? .21 * frente : 0;
  for (let i = 0; i < 4; i++) box(ao === 'x' ? len : .06, .04, ao === 'x' ? .06 : len, MAT.madeira, x + fx, .3 + i * .5, z + fz, W.grupo, false);
  for (let i = 0; i < len * 3; i++) {
    const p = (i + .5) / (len * 3) - .5;
    if (Math.random() < .5) box(ao === 'x' ? .07 : .12, rand(.18, .32), ao === 'x' ? .12 : .07, new THREE.MeshStandardMaterial({ color: pick([0x3a1a14, 0x1a2a1a, 0x2a2410, 0x50402a]) }), ao === 'x' ? x + p * len : x + fx * 1.05, .45 + (i % 3) * .5 + .14, ao === 'x' ? z + fz * 1.05 : z + p * len, W.grupo, false);
  }
  if (sp) for (let k = 0; k < 3; k++) sp.push({ x: ao === 'x' ? x - len / 3 + k * len / 3 : x + .27 * frente, y: (k % 2) ? 1.32 : .82, z: ao === 'x' ? z + .27 * frente : z - len / 3 + k * len / 3 });
}
function mobiliar(r) {
  const sp = W.spots[r.id], cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2, w = r.x1 - r.x0, d = r.z1 - r.z0;
  for (const [x, z] of cantos(r, .9)) sp.chao.push({ x, y: .02, z });
  const t = r.tipo;
  const lamp = (al = 8, cor) => { if (!r.semLuz) lampada(cx, cz, r.h, al, cor); };
  if (t === 'dorm') {
    const ao = w > d ? 'z' : 'x';
    const n = Math.max(3, Math.floor((ao === 'z' ? w : d) / 2.3));
    for (let i = 0; i < n; i++) {
      const p = (i + .5) / n;
      if (ao === 'x') cama(r.x0 + 1.15, r.z0 + .3 + p * (d - .6), 'x', r.id); else cama(r.x0 + .3 + p * (w - .6), r.z0 + 1.15, 'z', r.id);
    }
    if (ao === 'x') armario(r.x1 - .45, r.z0 + .8, [-1, 0]); else armario(r.x1 - .8, r.z1 - .45, [0, -1]);
    lamp(7.5, 0xd8c8a0);
  } else if (t === 'aula') {
    for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) { const x = r.x0 + w * (.22 + i * .2), z = r.z0 + d * (.3 + k * .35); mesaSimples(x, z, 1, .6, .72, k === 0 ? sp.mesa : null); prop(.4, .45, .4, MAT.madeiraEsc, x, .23, z + .6); }
    mesaSimples(r.x0 + w * .85, cz, 1.2, .8, .78, sp.mesa);
    const lousa = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(4, d * .6), 1.4), new THREE.MeshStandardMaterial({ map: TX.lousa, roughness: .9 })); lousa.position.set(r.x1 - .12, 1.7, cz); lousa.rotation.y = -Math.PI / 2; W.grupo.add(lousa);
    lamp(9);
  } else if (t === 'refeitorio') {
    const n = Math.max(2, Math.floor(d / 4));
    for (let k = 0; k < n; k++) { const z = r.z0 + d * (k + .5) / n; mesaSimples(cx, z, w * .65, 1.1, .82, sp.mesa); prop(w * .65, .45, .3, MAT.madeiraEsc, cx, .22, z - .85); prop(w * .65, .45, .3, MAT.madeiraEsc, cx, .22, z + .85); }
    lamp(10);
  } else if (t === 'cozinha') {
    prop(w * .55, .95, .7, MAT.metal, cx, .48, r.z0 + .45); sp.mesa.push({ x: cx - w * .18, y: .96, z: r.z0 + .5 }, { x: cx + w * .18, y: .96, z: r.z0 + .5 });
    estante(r.x0 + .3, cz + .5, 'z', Math.min(3, d - 3), sp.prateleira, 1);
    mesaSimples(cx + .5, cz + .8, 2.2, 1, .9, sp.mesa, MAT.madeiraEsc);
    armario(r.x1 - .45, r.z1 - 1.4, [-1, 0]);
    lamp(8);
  } else if (t === 'despensa') {
    estante(r.x0 + .3, cz, 'z', d - 2.4, sp.prateleira, 1); estante(r.x1 - .3, cz, 'z', d - 2.4, sp.prateleira, -1);
    for (let i = 0; i < 3; i++) { const h = .5 + i * .1, z = r.z0 + 1.2 + i * (d - 2.4) / 2; prop(.6, h, .6, MAT.madeiraEsc, cx, h / 2, z); sp.mesa.push({ x: cx, y: h, z }); }
    lamp(6, 0xffb070);
  } else if (t === 'lavanderia') {
    for (let i = 0; i < 3; i++) prop(1, .9, .7, MAT.branco, r.x0 + 1.2 + i * 1.4, .45, r.z0 + .45);
    sp.mesa.push({ x: r.x0 + 1.2, y: .9, z: r.z0 + .5 }, { x: r.x0 + 4, y: .9, z: r.z0 + .5 });
    for (let k = 0; k < 2; k++) {
      const z = r.z0 + d * (.45 + k * .25); box(w - 1.4, .01, .01, MAT.preto, cx, 2.3, z, W.grupo, false);
      for (let i = 0; i < 3; i++) {
        const lc = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.5), MAT.lencol); lc.position.set(r.x0 + 1.5 + i * (w - 3) / 2, 1.55, z); lc.castShadow = true; W.grupo.add(lc);
        const fase = Math.random() * 6; W.tick.push(() => { lc.rotation.x = Math.sin(perf * .9 + fase) * .12; });
      }
    }
    mesaSimples(r.x1 - 1.2, r.z1 - 1, 1.6, .8, .85, sp.mesa); armario(r.x1 - .45, r.z0 + 1, [-1, 0]);
    lamp(8);
  } else if (t === 'banheiro') {
    const n = Math.max(1, Math.floor((w - 2) / 1.4));
    for (let i = 0; i < n; i++) { const x = r.x0 + 1 + i * 1.4; prop(.06, 2, 1.3, MAT.metalVerde, x + .65, 1, r.z0 + .75); box(.4, .4, .5, MAT.branco, x, .2, r.z0 + .4); }
    for (let i = 0; i < Math.min(3, Math.floor((w - 1) / 1.6)); i++) { const x = r.x0 + 1.2 + i * 1.6; prop(.6, .85, .45, MAT.branco, x, .42, r.z1 - .35); sp.mesa.push({ x, y: .86, z: r.z1 - .4 }); plano(.5, .7, new THREE.MeshStandardMaterial({ color: 0x223, roughness: .05, metalness: .9 }), x, 1.6, r.z1 - .12, Math.PI); }
    lamp(7, 0xd0e0d8);
  } else if (t === 'diretoria') {
    mesaSimples(cx, cz, 2.2, 1.1, .82, sp.mesa, MAT.madeiraEsc);
    prop(.6, 1, .6, MAT.tecido, cx, .5, cz - 1.1);
    estante(cx, r.z0 + .3, 'x', Math.min(3, w - 3), sp.prateleira, 1);
    armario(r.x0 + .45, r.z1 - 1.2, [1, 0]);
    lamp(8, 0xffd9a0);
  } else if (t === 'enfermaria') {
    const n = Math.max(2, Math.floor(w / 2.4));
    for (let i = 0; i < n; i++) cama(r.x0 + 1 + i * (w - 2) / Math.max(1, n - 1), r.z0 + 1.15, 'z', r.id);
    estante(r.x1 - .3, cz + 1, 'z', Math.min(2.6, d - 4), sp.prateleira, -1);
    mesaSimples(r.x0 + 1.5, r.z1 - 1, 1.4, .7, .85, sp.mesa, MAT.branco);
    lamp(8, 0xd8e8e0);
  } else if (t === 'biblioteca') {
    for (let i = 0; i < Math.floor((w - 3) / 2.6); i++) estante(r.x0 + 1.8 + i * 2.6, cz - .8, 'z', d * .45, sp.prateleira, 1);
    mesaSimples(cx, r.z1 - 1.2, 2.4, 1, .8, sp.mesa);
    lamp(8);
  } else if (t === 'rouparia') {
    estante(r.x0 + .3, cz, 'z', d - 2, sp.prateleira, 1); estante(r.x1 - .3, cz, 'z', d - 2, sp.prateleira, -1);
    for (let i = 0; i < 2; i++) { const z = r.z0 + 1.6 + i * 2.6; prop(.6, .5, .6, MAT.lencol, cx, .25, z); sp.mesa.push({ x: cx, y: .5, z }); }
    lamp(6);
  } else if (t === 'brinquedos') {
    mesaSimples(cx, cz, 1.6, 1, .55, sp.mesa);
    for (let i = 0; i < 4; i++) box(.3, .3, .3, MAT.madeiraEsc, cx + Math.cos(i * 1.57) * 1.2, .15, cz + Math.sin(i * 1.57) * 1);
    const cav = new THREE.Group(); cav.position.set(r.x1 - 1.5, 0, r.z0 + 1.5); W.grupo.add(cav);
    box(.9, .3, .25, MAT.tecido, 0, .7, 0, cav); box(.2, .4, .2, MAT.tecido, .45, .95, 0, cav); box(1, .05, .3, MAT.madeiraEsc, 0, .05, 0, cav);
    addCollider(r.x1 - 2, r.x1 - 1, r.z0 + 1.35, r.z0 + 1.65);
    W.tick.push(() => { cav.rotation.z = Math.sin(perf * 1.3) * (S.flags.cavalinho ? .25 : .03); });
    box(.08, .02, Math.min(4, d * .6), MAT.madeiraEsc, r.x0 + .3, 1.15, cz, W.grupo, false);
    for (let i = 0; i < 5; i++) { const b = MK.boneca(); b.position.set(r.x0 + .32, 1.16, cz - 1.5 + i * .7); W.grupo.add(b); }
    lamp(8, 0xffd0a0);
  } else if (t === 'quarto') {
    cama(r.x0 + 1.15, cz, 'x', r.id); mesaSimples(r.x1 - 1.2, cz, 1.2, .7, .8, sp.mesa, MAT.madeiraEsc);
    estante(cx, r.z0 + .3, 'x', 2, sp.prateleira, 1);
    for (let i = 0; i < 3; i++) vela(r.x1 - .9 + i * .2, .8, cz + .25);
    lamp(6);
  } else if (t === 'maquinas' || t === 'deposito') {
    for (let i = 0; i < 4; i++) { const h = .5 + (i % 3) * .2; const x = r.x0 + 1 + (i % 2) * 1.2, z = r.z0 + 1 + Math.floor(i / 2) * 1.3; prop(.8, h, .8, MAT.madeiraEsc, x, h / 2, z); sp.mesa.push({ x, y: h, z }); }
    for (let i = 0; i < 3; i++) cyl(.07, .07, d, MAT.ferrugem, r.x1 - .4, r.h - .3 - i * .18, cz, 6).rotation.x = Math.PI / 2;
    lamp(7, 0xffb070);
  } else if (t === 'corredor') {
    const comprido = d > w ? 'z' : 'x', L = comprido === 'z' ? d : w, n = Math.max(1, Math.floor(L / 8));
    for (let i = 0; i < n; i++) { const p = (i + .5) / n; if (comprido === 'z') lampada(cx, r.z0 + p * d, r.h, 7.5, 0xe8d8b0); else lampada(r.x0 + p * w, cz, r.h, 7.5, 0xe8d8b0); }
  } else if (t === 'hall') {
    lamp(10);
  } else if (t === 'tunel') {
    const comprido = d > w ? 'z' : 'x';
    for (let i = 0; i < 2; i++) { const c = cyl(.1, .1, comprido === 'z' ? d : w, MAT.ferrugem, comprido === 'z' ? r.x0 + .3 : cx, 2.4 - i * .3, comprido === 'z' ? cz : r.z0 + .3, 6); c.rotation[comprido === 'z' ? 'x' : 'z'] = Math.PI / 2; }
    sp.chao.length = 0;
    for (const [x, z] of cantos(r, .6)) sp.chao.push({ x, y: .03, z });
    if (!r.semLuz && Math.random() < .5) lamp(7, 0xc8d8a0);
  }
}

// =====================================================================
// ESTADO
// =====================================================================
let S;
function perm3() { const a = [1, 2, 3]; for (let i = 2; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
function novoEstado(dif) {
  return {
    dif, chapter: 0, done: {}, picked: {}, flags: {}, notes: {}, fitas: {}, visited: {}, doorsOpen: {},
    inv: { lanterna: false, galao: false, fusiveis: 0, pilhas: 0, kits: 0, garrafas: 0, engrenagens: 0, chaves: {}, reliquias: 0, pa: false },
    placed: 0, valv: [], tumulos: {},
    code: [1 + (Math.random() * 9 | 0), Math.random() * 10 | 0, 1 + (Math.random() * 9 | 0), Math.random() * 10 | 0],
    quadro: [1 + (Math.random() * 9 | 0), Math.random() * 10 | 0, Math.random() * 10 | 0],
    ordem: perm3(),
    health: 100, stamina: 100, battery: 55, fear: 0, flashOn: false,
    mapa: 'estrada', pos: [0, 0], yaw: 0, hidden: null,
    mortes: 0, tempo: 0, capT: 0, capDano: 0, capVisto: 0,
    timers: { procissao: 9999, ana: 9999, chamado: 9999 }
  };
}
const D = () => DIFS[S.dif] || DIFS.normal;
const totalLore = () => R.notas.length + R.paginas.length + R.fitas.length;
const loreAchado = () => Object.keys(S.notes).length + Object.keys(S.fitas).length;
const codTxt = s => s.replace(/\{d(\d)\}/g, (_, i) => S.code[i - 1]).replace(/\{q\}/g, S.quadro.join('')).replace(/\{v\}/g, S.ordem.join(' - '));

// =====================================================================
// JOGADOR
// =====================================================================
const P = { pos: new THREE.Vector3(), yaw: 0, pitch: 0, h: 1.62, bob: 0, stepAcc: 0, noiseR: 0, crouch: false, sprinting: false, shake: 0, room: null, naAgua: false, bloqueado: false };
const keys = {};
let locked = false, mode = 'titulo', ui = null, alvo = null, perf = 0;
addEventListener('keydown', e => { if (e.code === 'Tab' || e.code === 'Space') e.preventDefault(); keys[e.code] = true; if (!e.repeat) onKey(e); });
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
addEventListener('mousemove', e => {
  if (!locked || mode !== 'jogo' || ui || !S || S.dead || P.bloqueado) return;
  const k = .0022 * OPT.sens;
  P.yaw -= e.movementX * k; P.pitch = clamp(P.pitch - e.movementY * k, -1.45, 1.45);
  if (S.hidden) { const base = Math.atan2(-S.hidden.face[0], -S.hidden.face[1]); let d = P.yaw - base; d = Math.atan2(Math.sin(d), Math.cos(d)); P.yaw = base + clamp(d, -.75, .75); P.pitch = clamp(P.pitch, -.35, .35); }
});
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  if (!locked && mode === 'jogo' && !ui && S && !S.dead && !S.fim) abrirPausa();
});
canvas.addEventListener('click', () => { if ((mode === 'jogo' || mode === 'cena') && !ui) lockPointer(); });
$('#clique').addEventListener('click', () => lockPointer());
function lockPointer() { try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
const unlock = () => { if (document.pointerLockElement) document.exitPointerLock(); };

function onKey(e) {
  if (mode === 'cena') { if (e.code === 'Escape' || e.code === 'Enter') pularCena(); return; }
  if (ui === 'dialogo') { if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') proxDialogo(); return; }
  if (ui === 'nota') { if (e.code === 'KeyE' || e.code === 'Escape') fecharNota(); return; }
  if (ui === 'diario') { if (e.code === 'Tab' || e.code === 'Escape' || e.code === 'KeyJ') fecharDiario(); return; }
  if (ui === 'teclado') { tecladoKey(e); return; }
  if (mode !== 'jogo' || ui || !S || S.dead) return;
  switch (e.code) {
    case 'KeyE': if (alvo && !alvo.hold) alvo.act(); break;
    case 'KeyF':
      if (!S.inv.lanterna) break;
      if (S.battery <= 0) { toast('Sem pilha. R para trocar.'); SFX.clique(); break; }
      S.flashOn = !S.flashOn; SFX.clique(); emitNoise(P.pos.x, P.pos.z, 1.2); break;
    case 'KeyR': trocarPilha(); break;
    case 'KeyH': usarKit(); break;
    case 'KeyG': jogarGarrafa(); break;
    case 'Tab': case 'KeyJ': abrirDiario(); break;
    case 'KeyC': case 'ControlLeft': if (!S.hidden) P.crouch = !P.crouch; break;
  }
}
function trocarPilha() {
  if (!S.inv.lanterna) return;
  if (S.inv.pilhas <= 0) { toast('Você não tem pilhas.'); return; }
  if (S.battery > 85) { toast('A pilha ainda está boa.'); return; }
  S.inv.pilhas--; S.battery = 100; S.flashOn = true; SFX.clique(); SFX.pegar(); toast('Pilha nova.'); renderInvMini();
}
function usarKit() {
  if (S.inv.kits <= 0) { toast('Você não tem curativos.'); return; }
  if (S.health >= 100) { toast('Você não está ferida.'); return; }
  S.inv.kits--; S.health = Math.min(100, S.health + 50); SFX.pegar(); toast('Melhor assim.'); renderInvMini();
}
const garrafasVoando = [];
function jogarGarrafa() {
  if (S.hidden) return;
  if (S.inv.garrafas <= 0) { toast('Sem garrafas para jogar.'); return; }
  S.inv.garrafas--; renderInvMini();
  const rc = new THREE.Raycaster(); rc.setFromCamera({ x: 0, y: 0 }, camera); rc.far = 16;
  const hits = rc.intersectObjects(W.solid, false);
  const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
  let fim = hits.length ? hits[0].point.clone().addScaledVector(dir, -.25) : camera.position.clone().addScaledVector(dir, 14);
  if (fim.y < 0) { const t = (camera.position.y - .05) / Math.max(.01, -dir.y); fim = camera.position.clone().addScaledVector(dir, Math.min(14, t)); }
  fim.y = Math.max(.05, fim.y);
  const m = MK.garrafa(); m.position.copy(camera.position); W.grupo.add(m);
  garrafasVoando.push({ m, ini: camera.position.clone(), fim, t: 0, dur: clamp(fim.distanceTo(camera.position) / 14, .2, .9) });
  SFX.arremesso();
}
function updateGarrafas(dt) {
  for (let i = garrafasVoando.length - 1; i >= 0; i--) {
    const g = garrafasVoando[i]; g.t += dt / g.dur;
    g.m.position.lerpVectors(g.ini, g.fim, Math.min(1, g.t)); g.m.position.y += Math.sin(Math.min(1, g.t) * Math.PI) * 1.2; g.m.rotation.x += dt * 12;
    if (g.t >= 1) {
      W.grupo.remove(g.m); garrafasVoando.splice(i, 1);
      SFX.vidro(g.fim.x, g.fim.z);
      const antes = M.ativo ? M.state : null;
      emitNoise(g.fim.x, g.fim.z, 17, false, true);
      if (antes !== null && M.state === 'investiga' && M.alvoGarrafa) conquista('garrafa');
    }
  }
}

function collide(p, r) {
  for (let k = 0; k < 3; k++) for (const c of W.colliders) {
    if (!c.on) continue;
    const cx = clamp(p.x, c.minX, c.maxX), cz = clamp(p.z, c.minZ, c.maxZ);
    const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
    if (d2 < r * r) {
      if (d2 > 1e-8) { const d = Math.sqrt(d2); p.x += dx / d * (r - d); p.z += dz / d * (r - d); }
      else { const l = p.x - c.minX, rr = c.maxX - p.x, t = p.z - c.minZ, b = c.maxZ - p.z, m = Math.min(l, rr, t, b); if (m === l) p.x = c.minX - r; else if (m === rr) p.x = c.maxX + r; else if (m === t) p.z = c.minZ - r; else p.z = c.maxZ + r; }
    }
  }
}

function updatePlayer(dt) {
  if (S.hidden) {
    const L = S.hidden;
    if (L.tipo === 'cama') { P.pos.set(L.x, 0, L.z); camera.position.set(L.x + L.face[0] * .25, .26, L.z + L.face[1] * .25); }
    else { P.pos.set(L.x - L.face[0] * .05, 0, L.z - L.face[1] * .05); camera.position.set(P.pos.x, 1.55, P.pos.z); }
    P.noiseR = 0; P.sprinting = false;
    const perto = M.ativo && M.pos.distanceTo(P.pos) < 5.5;
    $('#breath').hidden = !perto;
    const prende = !!keys.Space && S.stamina > 0;
    if (prende) { S.stamina = Math.max(0, S.stamina - 15 * dt); if (perto && M.pos.distanceTo(P.pos) < 2.6) conquista('folego'); if (S.stamina <= 0) { emitNoise(P.pos.x, P.pos.z, 6, true); SFX.ofego(); toast('Você puxou o ar alto demais!'); } }
    else { S.stamina = Math.min(100, S.stamina + 9 * dt); if (perto && Math.random() < dt * 1.4) emitNoise(P.pos.x, P.pos.z, 2.3, true); }
    $('#b-breath').style.setProperty('--v', S.stamina + '%');
    camera.rotation.set(P.pitch, P.yaw, 0);
    return;
  }
  $('#breath').hidden = true;
  if (P.bloqueado) { camera.position.set(P.pos.x, P.h, P.pos.z); camera.rotation.set(P.pitch, P.yaw, 0); return; }
  const fw = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), st = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  const moving = fw || st;
  const fuga = S.flags.sino;
  P.naAgua = !!(P.room && P.room.agua && !S.flags.aguaBaixa);
  P.sprinting = !!(keys.ShiftLeft || keys.ShiftRight) && moving && fw > 0 && S.stamina > 1;
  if (P.sprinting && P.crouch) P.crouch = false;
  let spd = P.crouch ? 1.4 : P.sprinting ? 5.4 : 2.8;
  if (P.naAgua) spd *= .72;
  if (S.health < 35) spd *= .85;
  if (P.sprinting) S.stamina = Math.max(0, S.stamina - (fuga ? 8 : 21) * dt);
  else S.stamina = Math.min(100, S.stamina + (moving ? 8 : 14) * dt);
  if (S.stamina < 2 && (keys.ShiftLeft || keys.ShiftRight) && moving) SFX.ofego();
  const sy = Math.sin(P.yaw), cy = Math.cos(P.yaw);
  const vx = -sy * fw + cy * st, vz = -cy * fw - sy * st, len = Math.hypot(vx, vz) || 1;
  if (moving) { P.pos.x += vx / len * spd * dt; P.pos.z += vz / len * spd * dt; }
  collide(P.pos, .33);
  P.noiseR = !moving ? 0 : (P.crouch ? 1.4 : P.sprinting ? 20 : 6.5) * (P.naAgua ? 1.6 : 1);
  const moved = moving ? spd * dt : 0;
  P.stepAcc += moved;
  const passo = P.sprinting ? .78 : P.crouch ? .55 : .62;
  if (P.stepAcc > passo) { P.stepAcc = 0; SFX.passo(P.sprinting ? 1 : P.crouch ? .25 : .55, P.room.piso || 'grama', !!P.room.fora, P.naAgua); }
  P.bob += moved * (P.sprinting ? 2.4 : 2.9);
  P.h = lerp(P.h, P.crouch ? .95 : 1.62, Math.min(1, dt * 9));
  const bobY = Math.sin(P.bob * 2) * (moving ? (P.sprinting ? .055 : .03) : 0);
  const sh = P.shake + (S.fear > 70 ? (S.fear - 70) / 30 * .015 : 0);
  camera.position.set(P.pos.x + rand(-sh, sh), P.h + bobY + rand(-sh, sh) - (P.naAgua ? .12 : 0), P.pos.z + rand(-sh, sh));
  camera.rotation.set(P.pitch, P.yaw, Math.sin(P.bob) * (moving ? .006 : 0) + (S.fear > 85 ? Math.sin(perf * 1.3) * .02 : 0));
  P.shake = Math.max(0, P.shake - dt * .6);
  const r = roomAt(P.pos.x, P.pos.z);
  if (r !== P.room) { P.room = r; S.visited[`${W.mapa}:${r.id}`] = true; if (W.def.entrouSala) W.def.entrouSala(r); }
  for (const g of W.gatilhos) {
    const chave = 'g_' + W.mapa + g.id;
    if (g.once && S.flags[chave]) continue;
    if (P.pos.x >= g.x0 && P.pos.x <= g.x1 && P.pos.z >= g.z0 && P.pos.z <= g.z1) { if (g.once) S.flags[chave] = true; if (!g.dentro) g.fn(); g.dentro = true; } else g.dentro = false;
  }
}
function naLuz(p) {
  for (const L of W.lampadas) if (L.luz.intensity > 1 && Math.hypot(p.x - L.x, p.z - L.z) < L.alcance * .4) return true;
  return false;
}
let flashPisca = false;
function updateLanterna(dt) {
  if (!S.inv.lanterna) S.flashOn = false;
  if (S.flashOn) { S.battery = Math.max(0, S.battery - .55 * D().pilha * dt); if (S.battery <= 0) { S.flashOn = false; toast('A lanterna apagou.'); SFX.clique(); } }
  const low = S.battery < 18;
  const procFlick = PROC.fase === 'aviso' && Math.random() < .35;
  flashPisca = S.flashOn && (procFlick || (low ? Math.random() < .14 : Math.random() < .004));
  flash.intensity = S.flashOn && !flashPisca ? 30 * (low ? .5 : 1) : 0;
  flashFill.intensity = S.flashOn && !flashPisca ? .6 : 0;
}
function updateFear(dt) {
  const dentro = !P.room.fora, luz = naLuz(P.pos);
  let df = 0;
  if (dentro && !S.flashOn && !luz) df += 4.5;
  if (luz) df -= 4; else if (S.flashOn) df -= 1;
  if (P.room.fora && !W.def.cemiterio) df -= 1.5;
  if (M.ativo) { const d = M.pos.distanceTo(P.pos); if (d < 14) df += (14 - d) * (M.state === 'caca' ? 3 : 1.6); }
  if (ANA.ativa) { const d = ANA.pos.distanceTo(P.pos); if (d < 10) df += (10 - d) * 2; }
  if (PROC.fase) df += 12;
  if (S.hidden) df += 1;
  S.fear = clamp(S.fear + df * dt, 0, 100);
  if (S.fear > 80 && Math.random() < dt * .22) alucinacao();
}
function alucinacao() {
  const t = Math.random();
  if (t < .35) SFX.sussurros(1.5);
  else if (t < .65) SFX.passoMonstro({ x: P.pos.x + rand(-5, 5), z: P.pos.z + rand(-5, 5) }, .35);
  else if (t < .85) SFX.risada(P.pos.x + rand(-6, 6), P.pos.z + rand(-6, 6));
  else SFX.estalo({ x: P.pos.x + rand(-4, 4), z: P.pos.z + rand(-4, 4) });
}

// Esconderijos
function entrarEsconderijo(L) {
  if (M.ativo && M.state === 'caca' && M.pos.distanceTo(P.pos) < 4) { toast('Ele está perto demais! Ele ouviu você entrar.'); M.achou = true; }
  S.hidden = L; P.crouch = false;
  P.yaw = Math.atan2(-L.face[0], -L.face[1]); P.pitch = 0;
  if (L.tipo === 'cama') { SFX.arrastar(); emitNoise(L.x, L.z, 2.5); $('#fx-cama').hidden = false; }
  else { SFX.armario(); emitNoise(L.x, L.z, 3.5); $('#fx-locker').hidden = false; }
}
function sairEsconderijo(forcado) {
  const L = S.hidden; if (!L) return;
  S.hidden = null; $('#fx-locker').hidden = true; $('#fx-cama').hidden = true; $('#breath').hidden = true;
  const off = L.tipo === 'cama' ? 1.0 : .85;
  const a = new THREE.Vector3(L.x + L.face[0] * off, 0, L.z + L.face[1] * off), b = new THREE.Vector3(L.x - L.face[0] * off, 0, L.z - L.face[1] * off);
  const livre = v => { const c = v.clone(); collide(c, .33); return c.distanceTo(v) < .05; };
  P.pos.copy(livre(a) || L.tipo !== 'cama' ? a : livre(b) ? b : a); collide(P.pos, .33);
  if (!forcado) { L.tipo === 'cama' ? SFX.arrastar() : SFX.armario(); emitNoise(L.x, L.z, 3); }
}

// =====================================================================
// ENTIDADES
// =====================================================================
function planejar(ent, tx, tz, { evitaFechadas = false } = {}) {
  const ra = roomAt(ent.pos.x, ent.pos.z), rb = roomAt(tx, tz);
  ent.path = [];
  if (ra === rb) { ent.path.push(new THREE.Vector3(tx, 0, tz)); return true; }
  const ok = l => { const d = l.door; if (d && d.trava && d.trava()) return false; if (evitaFechadas && d && !d.open) return false; return true; };
  const prev = { [ra.id]: null }, q = [ra.id];
  while (q.length) {
    const cur = q.shift(); if (cur === rb.id) break;
    for (const l of W.links) {
      if (!ok(l)) continue;
      const nx = l.a === cur ? l.b : l.b === cur ? l.a : null;
      if (!nx || nx in prev) continue;
      prev[nx] = { from: cur, l }; q.push(nx);
    }
  }
  if (!(rb.id in prev)) return false;
  const chain = []; let c = rb.id;
  while (prev[c]) { chain.unshift(prev[c]); c = prev[c].from; }
  for (const { from, l } of chain) {
    const fr = SALA(from), cxf = (fr.x0 + fr.x1) / 2, czf = (fr.z0 + fr.z1) / 2;
    let a, b;
    if (l.eixo === 'x') { const s = Math.sign(czf - l.z) || 1; a = new THREE.Vector3(l.x, 0, l.z + s * .9); b = new THREE.Vector3(l.x, 0, l.z - s * .9); }
    else { const s = Math.sign(cxf - l.x) || 1; a = new THREE.Vector3(l.x + s * .9, 0, l.z); b = new THREE.Vector3(l.x - s * .9, 0, l.z); }
    a.link = l; b.porta = true; ent.path.push(a, b);
  }
  ent.path.push(new THREE.Vector3(tx, 0, tz));
  return true;
}
function salasAlcancaveis(desde, opts = {}) {
  const ini = roomAt(desde.x, desde.z).id, vis = new Set([ini]), q = [ini];
  while (q.length) { const c = q.shift(); for (const l of W.links) { if (l.door && l.door.trava && l.door.trava()) continue; const n = l.a === c ? l.b : l.b === c ? l.a : null; if (n && !vis.has(n) && (!opts.semFora || !SALA(n).fora)) { vis.add(n); q.push(n); } } }
  return [...vis].map(SALA);
}
function pontoEm(r, m = 1.3) { return [rand(r.x0 + Math.min(m, (r.x1 - r.x0) / 2 - .2), r.x1 - Math.min(m, (r.x1 - r.x0) / 2 - .2)), rand(r.z0 + Math.min(m, (r.z1 - r.z0) / 2 - .2), r.z1 - Math.min(m, (r.z1 - r.z0) / 2 - .2))]; }
function distSalas(a, b) {
  const prev = { [a.id]: 0 }, q = [a.id];
  while (q.length) { const c = q.shift(); if (c === b.id) return prev[c]; for (const l of W.links) { const n = l.a === c ? l.b : l.b === c ? l.a : null; if (n && !(n in prev)) { prev[n] = prev[c] + 1; q.push(n); } } }
  return 99;
}
function salaAdj(a, b) { if (a === b) return true; return W.links.some(l => ((l.a === a.id && l.b === b.id) || (l.b === a.id && l.a === b.id)) && (!l.door || l.door.open)); }
function andar(ent, dt, speed, abrePortas = true) {
  if (!ent.path.length) return true;
  const t = ent.path[0];
  if (abrePortas && t.link && t.link.door && !t.link.door.open && Math.hypot(t.x - ent.pos.x, t.z - ent.pos.z) < 1.5) { setDoor(t.link.door, true); SFX.pancada(t.link.door.x, t.link.door.z); ent.wait = .6; return false; }
  const dx = t.x - ent.pos.x, dz = t.z - ent.pos.z, dist = Math.hypot(dx, dz);
  if (dist < .3) { ent.path.shift(); return !ent.path.length; }
  const st = Math.min(dist, speed * dt);
  ent.pos.x += dx / dist * st; ent.pos.z += dz / dist * st;
  if (!t.link && !t.porta) collide(ent.pos, .3);
  const ty = Math.atan2(dx, dz); let dy = ty - (ent.yaw || 0); dy = Math.atan2(Math.sin(dy), Math.cos(dy)); ent.yaw = (ent.yaw || 0) + dy * Math.min(1, dt * 6);
  ent.anim = (ent.anim || 0) + st * 2.2;
  ent.stuckT = (ent.stuckT || 0) + dt;
  if (ent.stuckT > 1.2) { if (ent.lastPos && ent.lastPos.distanceTo(ent.pos) < .25) ent.path.shift(); ent.lastPos = ent.pos.clone(); ent.stuckT = 0; }
  return false;
}
function visivel(pos, altura = 1.2, alcance = 18) {
  const alvoV = new THREE.Vector3(pos.x, altura, pos.z);
  const v = alvoV.clone().sub(camera.position), dist = v.length();
  if (dist > alcance) return false;
  const fw = new THREE.Vector3(); camera.getWorldDirection(fw);
  if (fw.dot(v.clone().normalize()) < Math.cos(.55)) return false;
  const rc = new THREE.Raycaster(camera.position, v.clone().normalize(), .1, Math.max(.2, dist - .3));
  return rc.intersectObjects(W.solid, false).length === 0;
}

// --- O INSPETOR
function modeloInspetor() {
  const g = new THREE.Group();
  const pele = new THREE.MeshStandardMaterial({ color: 0x4a4038, roughness: .55 });
  const casaco = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: .95 });
  const faixa = new THREE.MeshStandardMaterial({ color: 0xbcae94, roughness: 1 });
  const sangue = new THREE.MeshStandardMaterial({ color: 0x3a0806, roughness: .6 });
  const legL = new THREE.Group(), legR = new THREE.Group(); legL.position.set(-.15, 1.45, 0); legR.position.set(.15, 1.45, 0);
  for (const l of [legL, legR]) { cyl(.07, .04, 1.45, casaco, 0, -.72, 0, 6, l); box(.12, .06, .34, casaco, 0, -1.43, .07, l); }
  cyl(.22, .42, 1.6, casaco, 0, 2.15, 0, 9, g);
  cyl(.32, .22, .4, casaco, 0, 3.1, 0, 9, g);
  for (let i = 0; i < 4; i++) cyl(.012, .012, .3, MAT.bronze, 0, 2.2 + i * .25, .27 - i * .01, 4, g).rotation.x = Math.PI / 2;
  cyl(.05, .07, .5, pele, 0, 3.4, .04, 6, g);
  const cabeca = new THREE.Group(); cabeca.position.set(0, 3.62, .06); g.add(cabeca);
  const cr = new THREE.Mesh(new THREE.SphereGeometry(.16, 14, 10), pele); cr.scale.set(.82, 1.55, .95); cr.position.y = .12; cabeca.add(cr);
  const venda = new THREE.Mesh(new THREE.CylinderGeometry(.14, .145, .1, 14), faixa); venda.position.y = .17; cabeca.add(venda);
  for (const s of [-1, 1]) box(.03, .1, .01, sangue, s * .05, .1, .14, cabeca, false);
  box(.06, .22, .03, MAT.preto, 0, -.06, .14, cabeca, false);
  cabeca.rotation.z = .45;
  const armL = new THREE.Group(), armR = new THREE.Group(); armL.position.set(-.38, 3.2, 0); armR.position.set(.38, 3.2, 0);
  for (const [a, s] of [[armL, -1], [armR, 1]]) {
    cyl(.045, .03, 1.95, casaco, 0, -.97, 0, 6, a);
    const mao = new THREE.Group(); mao.position.y = -1.98; a.add(mao);
    for (let i = 0; i < 4; i++) { const f = box(.016, .42, .016, pele, (i - 1.5) * .028, -.2, 0, mao); f.rotation.x = .25; }
    a.rotation.z = s * .07;
  }
  g.add(legL, legR, armL, armR);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.scale.setScalar(.8);
  return { g, cabeca, armL, armR, legL, legR };
}
const MON = modeloInspetor(); scene.add(MON.g); MON.g.visible = false;
const M = { pos: new THREE.Vector3(), ativo: false, state: 'patrulha', path: [], wait: 0, searchT: 0, replan: 0, yaw: 0, cool: 0, falaT: 0, stepT: 0, anim: 0, furia: 0, clickT: 0, tensao: 0, recuo: 0, diretorT: 20, achou: false, alvoGarrafa: 0 };
function ativarInspetor(x, z, estado = 'patrulha') {
  M.ativo = true; MON.g.visible = true; M.pos.set(x, 0, z); M.cool = 3; M.state = estado; M.path = []; M.tensao = 0; M.recuo = 0; M.wait = 0;
  if (estado === 'patrulha') patrulhar();
}
function desativarInspetor() { M.ativo = false; MON.g.visible = false; M.path = []; }
function patrulhar() {
  const salas = salasAlcancaveis(M.pos, { semFora: !W.def.inspetorFora }).filter(r => !r.seguro);
  if (!salas.length) return;
  let r;
  const pressao = .3 + S.chapter * .07;
  if (M.recuo > 0) r = salas.reduce((a, b) => distSalas(b, P.room) > distSalas(a, P.room) ? b : a, salas[0]);
  else if (Math.random() < pressao && salas.includes(P.room)) r = P.room;
  else r = pick(salas);
  const [x, z] = pontoEm(r);
  M.state = 'patrulha'; planejar(M, x, z);
}
function emitNoise(x, z, r, doJogador, garrafa) {
  if (!M.ativo || S.dead || !W.salas.length) return;
  const d = Math.hypot(M.pos.x - x, M.pos.z - z);
  if (!garrafa) r *= mascaraSom(x, z);
  const att = salaAdj(roomAt(M.pos.x, M.pos.z), roomAt(x, z)) ? 1 : .5;
  if (d < r * att * D().ouvido) {
    if (doJogador && S.hidden && d < 2.6) M.achou = true;
    if (M.state !== 'caca' || garrafa) { M.state = 'investiga'; M.searchT = 0; planejar(M, x, z); falaInspetor(); if (garrafa) M.alvoGarrafa = 4; }
    else planejar(M, x, z);
  }
}
function falaInspetor(perdeu) {
  if (M.falaT > 0) return; M.falaT = rand(8, 14);
  const ent = R.entidades.inspetor, t = pick(perdeu ? ent.falas_perdeu : ent.falas_caca);
  sub('inspetor', t); SFX.voz(M.pos, t);
}
function updateInspetor(dt) {
  if (!M.ativo) return;
  M.cool = Math.max(0, M.cool - dt); M.falaT = Math.max(0, M.falaT - dt); M.recuo = Math.max(0, M.recuo - dt); M.alvoGarrafa = Math.max(0, M.alvoGarrafa - dt);
  const d = M.pos.distanceTo(P.pos), ra = roomAt(M.pos.x, M.pos.z);
  const att = salaAdj(ra, P.room) ? 1 : .45;
  const fuga = S.flags.sino;
  if (M.furia > 0) M.furia -= dt;
  // Diretor de tensão (inspirado em Alien: Isolation): depois de muita pressão, ele recua um tempo
  M.tensao = clamp(M.tensao + (d < 10 ? (14 - d) * dt * 1.1 : -dt * 2), 0, 100);
  if (M.tensao >= 100 && !fuga && M.furia <= 0 && M.state !== 'caca') { M.recuo = rand(25, 40) * D().intervalo; M.tensao = 0; patrulhar(); }
  M.diretorT -= dt;
  if (M.diretorT <= 0 && M.state === 'patrulha' && M.recuo <= 0) {
    M.diretorT = rand(18, 32) * D().intervalo;
    if (d > 22) { const viz = [P.room, ...W.links.filter(l => (l.a === P.room.id || l.b === P.room.id) && !(l.door && l.door.trava && l.door.trava())).map(l => SALA(l.a === P.room.id ? l.b : l.a))].filter(r => (!r.fora || W.def.inspetorFora) && !r.seguro); const r = pick(viz); if (r) { const [x, z] = pontoEm(r); planejar(M, x, z); } }
  }
  const ouvido = P.noiseR * att * D().ouvido * (M.state === 'caca' ? 1.6 : 1) * mascaraSom(P.pos.x, P.pos.z);
  const ouve = !S.hidden && !(P.room.seguro && !fuga) && (fuga || M.furia > 0 || (P.noiseR > 0 && d < ouvido));
  if (ouve && !M.alvoGarrafa) {
    if (M.state !== 'caca') {
      if (d < 11 || fuga || M.furia > 0) { M.state = 'caca'; SFX.susto(); falaInspetor(); S.capVisto++; }
      else M.state = 'investiga';
    }
    M.replan -= dt;
    if (M.replan <= 0) { planejar(M, P.pos.x, P.pos.z); M.replan = .35; }
    M.searchT = 0;
  }
  if (!S.flags.avist && d < 14 && salaAdj(ra, P.room)) { S.flags.avist = true; SFX.susto(); falar('primeiro_avistamento'); }
  const aguaAqui = ra.agua && !S.flags.aguaBaixa;
  const base = { patrulha: 1.9, investiga: 3.0, procura: 1.6, caca: 4.6 }[M.state] || 1.8;
  const esc = 1 + Math.max(0, S.chapter - 2) * .083;
  const speed = (fuga ? 4.9 : base * esc) * D().vel * (aguaAqui ? .85 : 1);
  if (M.wait > 0) M.wait -= dt;
  else if (M.path.length) {
    andar(M, dt, speed);
    M.stepT -= speed * dt;
    if (M.stepT <= 0) { M.stepT = 1.05; SFX.passoMonstro(M.pos, M.state === 'caca' ? 1 : .6, aguaAqui); }
  } else {
    if (M.state === 'caca' || M.state === 'investiga') { M.state = 'procura'; M.searchT = rand(5, 8); falaInspetor(true); }
    if (M.state === 'procura') {
      M.searchT -= dt;
      if (M.searchT <= 0) patrulhar();
      else { const [x, z] = pontoEm(ra); planejar(M, x, z); M.wait = rand(.8, 2); }
    } else { M.wait = rand(1.2, 3.5); patrulhar(); }
  }
  M.clickT -= dt;
  if (M.clickT <= 0) { M.clickT = M.state === 'caca' ? .55 : M.state === 'procura' ? .8 : 1.5; SFX.estalo(M.pos, M.state === 'caca' ? 1 : .6); }
  if (!S.dead && M.cool <= 0) {
    if (!S.hidden && d < 1.2 && !(P.room.seguro && !fuga)) atacar('inspetor');
    else if (S.hidden && M.achou && d < 2.4) { sairEsconderijo(true); atacar('inspetor'); }
  }
  if (!S.hidden || d > 4) M.achou = false;
  MON.g.position.copy(M.pos); MON.g.rotation.y = M.yaw;
  const sw = Math.sin(M.anim), caca = M.state === 'caca' ? -.6 : 0;
  MON.legL.rotation.x = sw * .5; MON.legR.rotation.x = -sw * .5;
  MON.armL.rotation.x = -sw * .3 + caca; MON.armR.rotation.x = sw * .3 + caca;
  MON.g.position.y = Math.abs(Math.cos(M.anim)) * .05 - (aguaAqui ? .3 : 0);
  MON.cabeca.rotation.z = .45 + Math.sin(perf * 7) * (M.state === 'procura' ? .25 : .03) + (Math.random() < .015 ? rand(-.5, .5) : 0);
  MON.cabeca.rotation.y = M.state === 'procura' ? Math.sin(perf * 1.7) * .9 : 0;
}

// --- A MENINA QUE CONTA
function modeloAna() {
  const g = new THREE.Group();
  const camisola = new THREE.MeshStandardMaterial({ color: 0xa8a294, roughness: 1 });
  const pele = new THREE.MeshStandardMaterial({ color: 0x9a948a, roughness: .7 });
  const cabelo = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: .9, side: THREE.DoubleSide });
  cyl(.12, .3, .85, camisola, 0, .45, 0, 10, g);
  cyl(.13, .12, .3, camisola, 0, 1.0, 0, 10, g);
  const cab = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 10), pele); cab.position.y = 1.27; g.add(cab);
  const cab2 = new THREE.Mesh(new THREE.CylinderGeometry(.13, .19, .6, 12, 1, true), cabelo); cab2.position.y = 1.12; g.add(cab2);
  box(.2, .32, .02, cabelo, 0, 1.2, .12, g, false);
  for (const s of [-1, 1]) { const b = cyl(.025, .02, .55, pele, s * .17, .78, 0, 6, g); b.rotation.z = s * .1; }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
const ANA_G = modeloAna(); scene.add(ANA_G); ANA_G.visible = false;
const ANA = { pos: new THREE.Vector3(), ativa: false, path: [], yaw: 0, anim: 0, vida: 0, conta: 0, contaT: 0, vista: false, script: false, cool: 0 };
function spawnAna(sala, script = false) {
  let alvoSala = sala;
  if (!alvoSala) {
    const viz = W.links.filter(l => (l.a === P.room.id || l.b === P.room.id) && (!l.door || l.door.open)).map(l => SALA(l.a === P.room.id ? l.b : l.a)).filter(r => !r.fora || W.def.anaFora);
    if (!viz.length) return false;
    alvoSala = pick(viz);
  }
  for (let tent = 0; tent < 10; tent++) {
    const [x, z] = pontoEm(alvoSala, 1);
    if (!script && visivel({ x, z }, 1, 30)) continue;
    if (Math.hypot(x - P.pos.x, z - P.pos.z) < 4.5) continue;
    ANA.pos.set(x, 0, z); ANA.ativa = true; ANA_G.visible = true; ANA.vida = script ? 24 : rand(28, 40); ANA.conta = 0; ANA.contaT = 1; ANA.script = script; ANA.path = []; ANA.cool = 1.5;
    SFX.risada(x, z); return true;
  }
  return false;
}
function updateAna(dt) {
  if (!ANA.ativa) return;
  ANA.vida -= dt; ANA.cool = Math.max(0, ANA.cool - dt);
  const d = ANA.pos.distanceTo(P.pos);
  const iluminada = (S.flashOn && !flashPisca && d < 16) || naLuz(ANA.pos) || d < 2.2;
  ANA.vista = !S.hidden && iluminada && visivel(ANA.pos, 1.0, 18);
  if (ANA.vista) S.flags.anaVista = true;
  if (ANA.vida <= 0) { despawnAna(); return; }
  if (S.hidden && !ANA.script) ANA.vida = Math.min(ANA.vida, 3);
  if (!ANA.vista) {
    if (!ANA.path.length || Math.random() < dt * 2) planejar(ANA, P.pos.x, P.pos.z, { evitaFechadas: true });
    andar(ANA, dt, 3.4 * D().vel, false);
    ANA.contaT -= dt;
    if (ANA.contaT <= 0) {
      ANA.contaT = clamp(.55 + (d - 4) * .085, .55, 1.4); const c = R.entidades.ana.contagem[Math.min(9, ANA.conta)];
      SFX.contagem(ANA.pos, ANA.conta); if (ANA.conta % 3 === 0 || ANA.conta >= 8) subPequeno('ana', c);
      ANA.conta++;
      if (ANA.conta >= 10 && d < 10) {
        const fw = new THREE.Vector3(); camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
        ANA.pos.set(P.pos.x - fw.x * 1.4, 0, P.pos.z - fw.z * 1.4); collide(ANA.pos, .25); ANA.conta = 0; SFX.susto();
      }
    }
  }
  ANA_G.position.copy(ANA.pos);
  if (!ANA.vista) ANA.yaw = Math.atan2(P.pos.x - ANA.pos.x, P.pos.z - ANA.pos.z);
  ANA_G.rotation.y = ANA.yaw;
  ANA_G.position.y = roomAt(ANA.pos.x, ANA.pos.z).agua && !S.flags.aguaBaixa ? -.2 : 0;
  if (!S.dead && !S.hidden && d < .95 && ANA.cool <= 0) {
    if (ANA.script) { atacar('ana', true); const r = SALA(W.def.anaSalaScript) || P.room; const [x, z] = pontoEm(r, 1); ANA.pos.set(x, 0, z); ANA.vida = 24; ANA.cool = 2; ANA.conta = 0; }
    else { atacar('ana'); despawnAna(true); }
  }
}
function despawnAna(silencioso) {
  if (!ANA.ativa) return;
  ANA.ativa = false; ANA_G.visible = false;
  if (!silencioso) SFX.risada(ANA.pos.x, ANA.pos.z);
  const eraScript = ANA.script; ANA.script = false;
  if (eraScript && !silencioso && W.def.anaFim) W.def.anaFim();
}

// --- A PROCISSÃO
const PROC = { fase: null, t: 0, path: [], pos: new THREE.Vector3(), g: null, luz: null };
(function () {
  const g = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Group();
    cyl(.1, .22, .9, MAT.sombra, 0, .45, 0, 8, s); const c = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), MAT.sombra); c.position.y = 1.05; s.add(c);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(.015, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff3010 })); olho.position.set(-.04, 1.07, .11); s.add(olho); const o2 = olho.clone(); o2.position.x = .04; s.add(o2);
    s.position.set((i % 3 - 1) * .5, 0, Math.floor(i / 3) * .9 - .9); s.userData.f = Math.random() * 6; g.add(s);
  }
  PROC.g = g; g.visible = false; scene.add(g);
  PROC.luz = new THREE.PointLight(0xff2a10, 0, 9, 1.5); PROC.luz.position.y = 1.4; g.add(PROC.luz);
})();
function iniciarProcissao() {
  if (PROC.fase || S.dead || !W.def.procissao || P.room.fora) return;
  PROC.fase = 'aviso'; PROC.t = D().aviso; { const sl = salasAlcancaveis(P.pos, { semFora: true }), lg = sl.filter(r => distSalas(r, P.room) >= 2); PROC.ini = lg.length ? pick(lg) : null; } SFX.estatica(D().aviso + 1); SFX.canto(D().aviso + 3);
  if (!S.flags.procAviso) { S.flags.procAviso = true; falar('procissao_aviso'); }
  toast('As luzes estão piscando...');
}
function updateProcissao(dt) {
  if (!PROC.fase) return;
  PROC.t -= dt;
  if (PROC.fase === 'aviso') {
    for (const L of W.lampadas) { const on = Math.random() < .3; L.luz.intensity = on ? L.base * rand(.6, 1.4) : 0; L.bulbo.material.emissiveIntensity = on ? 2 : 0; }
    P.shake = Math.max(P.shake, .012);
    if (PROC.t <= 0) {
      const salas = salasAlcancaveis(P.pos, { semFora: true });
      const longe = salas.filter(r => distSalas(r, P.room) >= 2);
      const ini = PROC.ini && longe.includes(PROC.ini) ? PROC.ini : longe.length ? pick(longe) : pick(salas.filter(r => r !== P.room)) || P.room;
      const e1 = { pos: new THREE.Vector3((ini.x0 + ini.x1) / 2, 0, (ini.z0 + ini.z1) / 2), path: [] };
      planejar(e1, P.pos.x, P.pos.z);
      const outras = longe.filter(r => r !== ini);
      const fim = outras.length ? pick(outras) : ini;
      const e2 = { pos: P.pos.clone(), path: [] };
      planejar(e2, (fim.x0 + fim.x1) / 2, (fim.z0 + fim.z1) / 2);
      PROC.path = [...e1.path, ...e2.path];
      for (const w of PROC.path) if (w.link && w.link.door && !w.link.door.open) setDoor(w.link.door, true, true);
      PROC.pos.copy(e1.pos); PROC.fase = 'passando'; PROC.t = 16; PROC.g.visible = true; PROC.luz.intensity = 5;
      SFX.procissao();
    }
  } else {
    const ent = PROC.ent || (PROC.ent = { yaw: 0, anim: 0 });
    ent.pos = PROC.pos; ent.path = PROC.path;
    for (let k = 0; k < 2; k++) andar(ent, dt / 2, 12, false);
    PROC.g.position.copy(PROC.pos); PROC.g.rotation.y = ent.yaw;
    PROC.g.children.forEach(s => { if (s.isGroup) s.position.y = Math.abs(Math.sin(perf * 14 + s.userData.f)) * .1; });
    SFX.procissaoPos(PROC.pos);
    if (PROC.pos.distanceTo(P.pos) < 2.2 && !S.hidden && !S.dead && !PROC.acertou) { PROC.acertou = true; atacar('procissao'); }
    if (!PROC.path.length || PROC.t <= 0) acabarProcissao();
  }
}
function acabarProcissao() {
  PROC.fase = null; PROC.ini = null; PROC.g.visible = false; PROC.luz.intensity = 0; PROC.acertou = false; SFX.pararCanto();
  syncLuzes();
  if (!S.dead && !S.done.procissao && R.capitulos[S.chapter].objetivos.some(o => o.id === 'procissao')) { objDone('procissao'); falar('procissao_passou'); conquista('procissao'); }
  S.timers.procissao = rand(100, 160) * D().intervalo;
}

// --- Ataque e morte
const DANO = { inspetor: 60, ana: 55, procissao: 90 };
function atacar(quem, leve) {
  if (S.dead) return;
  if (quem === 'inspetor') { M.cool = 7; M.state = 'procura'; M.searchT = 3; M.path = []; M.wait = 2.5; M.recuo = 15; }
  SFX.grito(quem); P.shake = .25;
  $('#fx-red').style.transition = 'none'; $('#fx-red').style.opacity = 1;
  setTimeout(() => { $('#fx-red').style.transition = 'opacity 2.5s'; $('#fx-red').style.opacity = 0; }, 80);
  const dano = Math.min(100, DANO[quem] * D().dano * (leve ? .6 : 1));
  S.health -= dano; S.capDano += dano; S.fear = 100;
  if (S.health <= 0) { morrer(quem); return; }
  toast(quem === 'inspetor' ? 'Ele te largou. Fuja e se esconda.' : quem === 'ana' ? 'Mãos geladas. Ela sumiu... por enquanto.' : 'Eles passaram por dentro de você. Ainda está viva. Por pouco.');
  if (quem === 'inspetor') { const dx = P.pos.x - M.pos.x, dz = P.pos.z - M.pos.z, l = Math.hypot(dx, dz) || 1; P.pos.x += dx / l * 1.2; P.pos.z += dz / l * 1.2; collide(P.pos, .33); }
}
function morrer(quem) {
  S.dead = true; S.mortes++; S.causa = quem;
  const head = new THREE.Vector3();
  if (quem === 'inspetor') MON.cabeca.getWorldPosition(head); else if (quem === 'ana') head.set(ANA.pos.x, 1.2, ANA.pos.z); else head.copy(PROC.pos).setY(1);
  const t0 = performance.now(), yaw0 = P.yaw, pitch0 = P.pitch;
  const ty = Math.atan2(-(head.x - camera.position.x), -(head.z - camera.position.z));
  const tp = Math.atan2(head.y - camera.position.y, Math.hypot(head.x - camera.position.x, head.z - camera.position.z));
  (function anim() { const k = Math.min(1, (performance.now() - t0) / 400); let dy = ty - yaw0; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); camera.rotation.set(lerp(pitch0, tp, k), yaw0 + dy * k, rand(-.03, .03)); if (k < 1 && S.dead) requestAnimationFrame(anim); })();
  setTimeout(() => {
    $('#fx-black').style.opacity = 1;
    setTimeout(() => {
      unlock(); ui = 'morte'; $('#death').hidden = false; $('#hud').hidden = true; SFX.pararCanto(); SFX.chiadoFita(false); fitaTocando = null; $('#fita-ind').hidden = true;
      $('#dt-tit').textContent = quem === 'inspetor' ? 'ELE TE ENCONTROU' : quem === 'ana' ? 'ELA CONTOU ATÉ DEZ' : 'FORA DA CAMA';
      $('#death-dica').textContent = pick(R.dicas_morte[quem] || R.dicas_morte.inspetor);
    }, 900);
  }, 1200);
}

// =====================================================================
// HISTÓRIA / OBJETIVOS
// =====================================================================
function objDone(id) { if (S.done[id]) return; S.done[id] = true; SFX.objetivo(); renderObj(); checarCapitulo(); }
function contagem(id) {
  return { fusiveis: S.inv.fusiveis, engrenagens: S.inv.engrenagens, paginas: R.paginas.filter(p => S.notes[p.id]).length, valvulas: S.valv.length, tumulos: Object.keys(S.tumulos).length, altar: S.placed }[id];
}
function progresso() {
  const alvoN = { fusiveis: 3, engrenagens: 3, paginas: 4, valvulas: 3, tumulos: 3, altar: 3 };
  const c = R.capitulos[S.chapter];
  for (const o of c.objetivos) if (alvoN[o.id] && contagem(o.id) >= alvoN[o.id] && !S.done[o.id]) {
    objDone(o.id);
    if (o.id === 'paginas') falar('paginas_ok');
    if (o.id === 'tumulos') falar('tumulos_ok');
    if (o.id === 'altar') falar('altar_ok');
  }
  if (!S.flags.paginasOk && R.paginas.every(p => S.notes[p.id])) { S.flags.paginasOk = true; if (!c.objetivos.some(o => o.id === 'paginas')) falar('paginas_ok'); }
  if (loreAchado() >= totalLore()) conquista('arqueologa');
  renderObj();
}
let trocandoCap = false;
function checarCapitulo() {
  const c = R.capitulos[S.chapter];
  if (!c.objetivos.every(o => S.done[o.id]) || trocandoCap) return;
  if (S.chapter >= R.capitulos.length - 1) return;
  trocandoCap = true;
  setTimeout(() => fimDeCapitulo(), 1800);
}
function rank() {
  const t = S.capT / 60, dano = S.capDano;
  const pts = (dano === 0 ? 3 : dano < 60 ? 2 : dano < 120 ? 1 : 0) + (t < 8 ? 2 : t < 13 ? 1 : 0) + (S.capVisto <= 1 ? 1 : 0);
  return pts >= 5 ? 'S' : pts >= 4 ? 'A' : pts >= 2 ? 'B' : 'C';
}
function fimDeCapitulo() {
  if (S.dead) { trocandoCap = false; return; }
  const c = R.capitulos[S.chapter], rk = rank();
  if (S.capDano === 0 && S.chapter > 0) conquista('intocada');
  if (S.chapter === 0) conquista('prologo');
  const caps = lsGet(CAPS_KEY, {}), ant = caps[c.id] || {}, ordem = 'CBAS';
  caps[c.id] = { ...ant, rank: !ant.rank || ordem.indexOf(rk) > ordem.indexOf(ant.rank) ? rk : ant.rank, tempo: Math.min(ant.tempo || 1e9, S.capT) };
  lsSet(CAPS_KEY, caps);
  $('#fc-cap').textContent = c.titulo + ' — concluído';
  $('#fc-rank').textContent = rk;
  const min = Math.floor(S.capT / 60), seg = Math.floor(S.capT % 60);
  $('#fc-stats').innerHTML = `tempo ${min}min ${String(seg).padStart(2, '0')}s · dano sofrido ${Math.round(S.capDano)} · vezes perseguida ${S.capVisto}<br>notas, páginas e fitas ${loreAchado()}/${totalLore()}`;
  $('#fc-gancho').textContent = c.gancho || '';
  $('#fimcap').hidden = false;
  SFX.sinoLonge();
  setTimeout(() => {
    $('#fimcap').hidden = true;
    S.chapter++; S.capT = 0; S.capDano = 0; S.capVisto = 0; trocandoCap = false;
    cartaoCapitulo();
    if (W.def.inicioCapitulo) W.def.inicioCapitulo(S.chapter);
    if (W.def.inspetor && W.def.inspetor() && !M.ativo) { const t = { ...S.timers }; agendarEntidades(); Object.assign(S.timers, t); }
    syncWorld(); renderObj(); progresso();
    salvarCheckpoint(true);
  }, 5200);
}

// =====================================================================
// MAPAS
// =====================================================================
function carregarMapa(id, spawn, { salvar = true } = {}) {
  limparMundo();
  W.mapa = id; S.mapa = id;
  desativarInspetor(); despawnAna(true); PROC.fase = null; PROC.g.visible = false; PROC.luz.intensity = 0; SFX.pararCanto(); SFX.gerador(false);
  const def = MAPAS[id](API, S);
  W.def = def;
  if (def.depois) def.depois();
  const sp = typeof spawn === 'object' ? spawn : def.spawns[spawn || 'inicio'];
  P.pos.set(sp.x, 0, sp.z); P.yaw = sp.yaw || 0; P.pitch = 0; P.crouch = false; P.room = roomAt(sp.x, sp.z);
  S.hidden = null; $('#fx-locker').hidden = true; $('#fx-cama').hidden = true;
  ambFora = def.fora || { hemi: .7, moon: .9, fog: .045 }; ambDentro = def.dentro || { hemi: .1, moon: .05, fog: .095 };
  luzBase = P.room.fora ? 1 : 0;
  syncWorld();
  if (def.entrar) def.entrar(S.chapter);
  if (salvar) salvarCheckpoint();
  renderObj(); renderInvMini();
}
function syncLuzes() {
  const ligada = W.def && W.def.energia ? W.def.energia() : false;
  for (const L of W.lampadas) { const on = L.sempre || ligada; L.ligada = on; L.luz.intensity = on ? L.base : 0; L.bulbo.material.emissiveIntensity = on ? 2 : 0; }
}
function syncWorld() {
  for (const it of W.items) it.mesh.visible = !S.picked[it.key] && (!it.cond || it.cond());
  syncLuzes();
  if (W.def && W.def.sync) W.def.sync();
}
function salvarCheckpoint(inicioCap) {
  S.pos = [P.pos.x, P.pos.z]; S.yaw = P.yaw; S.mapa = W.mapa;
  const snap = JSON.parse(JSON.stringify({ ...S, hidden: null, dead: false, fim: false, _check: undefined }));
  S._check = snap;
  lsSet(SAVE_KEY, snap);
  if (inicioCap) { const caps = lsGet(CAPS_KEY, {}); const c = R.capitulos[S.chapter]; caps[c.id] = { ...(caps[c.id] || {}), snap }; lsSet(CAPS_KEY, caps); }
}
function carregarSnap(snap) {
  const mortes = S ? S.mortes : 0, tempo = S ? S.tempo : 0;
  S = JSON.parse(JSON.stringify(snap)); S._check = snap;
  S.chapter = Math.max(0, Math.min(R.capitulos.length - 1, S.chapter | 0));
  S.mortes = Math.max(mortes, S.mortes || 0); S.tempo = Math.max(tempo, S.tempo || 0);
  S.health = Math.max(S.health, 60); S.fear = 0; S.stamina = 100; S.dead = false; S.fim = false; S.hidden = null;
  trocandoCap = false; fitaTocando = null; $('#fita-ind').hidden = true; SFX.chiadoFita(false); subQ = []; subT = 0; $('#sub').innerHTML = '';
  carregarMapa(S.mapa, { x: S.pos[0], z: S.pos[1], yaw: S.yaw }, { salvar: false });
  agendarEntidades();
}
function agendarEntidades() {
  const iv = D().intervalo;
  S.timers.procissao = rand(70, 120) * iv; S.timers.ana = rand(40, 80) * iv; S.timers.chamado = rand(90, 160) * iv;
  if (W.def.inspetor && W.def.inspetor() && !M.ativo) {
    const salas = salasAlcancaveis(P.pos, { semFora: !W.def.inspetorFora }).filter(r => r !== P.room && !r.seguro);
    const longe = salas.sort((a, b) => distSalas(b, P.room) - distSalas(a, P.room))[0];
    if (longe) { const [x, z] = pontoEm(longe); ativarInspetor(x, z); M.cool = 6; }
  }
}
let chamadoArmadilha = null;
function updateEventos(dt) {
  const TT = S.timers;
  if (W.def.procissao && W.def.procissao() && !PROC.fase) { TT.procissao -= dt; if (TT.procissao <= 0) { if (P.room.fora) TT.procissao = 10; else iniciarProcissao(); } }
  if (W.def.ana && W.def.ana() && !ANA.ativa) { TT.ana -= dt; if (TT.ana <= 0) { if (!spawnAna()) TT.ana = 8; else TT.ana = rand(60, 110) * D().intervalo; } }
  if (W.def.chamado && W.def.chamado()) { TT.chamado -= dt; if (TT.chamado <= 0) { TT.chamado = rand(120, 200) * D().intervalo; chamado(); } }
  if (chamadoArmadilha) {
    chamadoArmadilha.t -= dt;
    if (chamadoArmadilha.t <= 0) chamadoArmadilha = null;
    else if (P.room === chamadoArmadilha.sala) { const s = chamadoArmadilha.sala; chamadoArmadilha = null; if (M.ativo) { const [x, z] = pontoEm(s, 1); M.pos.set(x, 0, z); M.state = 'caca'; M.cool = 1.2; planejar(M, P.pos.x, P.pos.z); SFX.susto(); sub('inspetor', 'Achei.'); } }
  }
  for (const f of W.tick) f(dt);
}
function chamado() {
  const viz = W.links.filter(l => l.a === P.room.id || l.b === P.room.id).map(l => SALA(l.a === P.room.id ? l.b : l.a)).filter(r => !r.fora);
  if (!viz.length) return;
  const s = pick(viz); const [x, z] = pontoEm(s, 1);
  SFX.chamadoVoz(x, z); sub('davi', R.falas.chamado[0].texto);
  if (!S.flags.chamado1) { S.flags.chamado1 = true; setTimeout(() => falar('chamado_regra'), 2600); }
  chamadoArmadilha = { sala: s, t: 14 };
}

// =====================================================================
// FITAS, NOTAS, DIÁLOGOS
// =====================================================================
let fitaTocando = null, fitaFila = [], fitaT = 0;
function tocarFita(fid) {
  if (fitaTocando) return;
  const f = R.fitas.find(x => x.id === fid);
  fitaTocando = f; fitaFila = f.linhas.map(l => ({ ...l, texto: codTxt(l.texto) })); fitaT = .8;
  $('#fita-ind').textContent = f.titulo; $('#fita-ind').hidden = false;
  SFX.fitaClique(); SFX.chiadoFita(true);
  emitNoise(P.pos.x, P.pos.z, 7);
}
function updateFita(dt) {
  if (!fitaTocando) return;
  fitaT -= dt;
  if (fitaT <= 0) {
    const l = fitaFila.shift();
    if (!l) { const id = fitaTocando.id; fitaTocando = null; $('#fita-ind').hidden = true; SFX.chiadoFita(false); SFX.fitaClique(); const primeira = !S.fitas[id]; S.fitas[id] = true; if (primeira) { toast('Fita registrada no diário (TAB).'); if (W.def.fitaOuvida) W.def.fitaOuvida(id); progresso(); } return; }
    sub(l.quem, l.texto, true); fitaT = 2.6 + l.texto.length * .058;
  }
}
function lerNota(id) {
  const n = id === 'regras' ? R.regras : (R.notas.find(x => x.id === id) || R.paginas.find(x => x.id === id));
  const primeira = id !== 'regras' && !S.notes[id];
  if (id !== 'regras') S.notes[id] = true;
  SFX.papel();
  abrirNotaUI(n.titulo, codTxt(n.texto));
  if (primeira) { progresso(); if (W.def.notaLida) W.def.notaLida(id); }
}
let prevUi = null;
function abrirNotaUI(titulo, texto) { ui = 'nota'; $('#note').hidden = false; $('#note h2').textContent = titulo; $('#note p').textContent = texto; unlock(); }
function fecharNota() { $('#note').hidden = true; ui = prevUi || null; prevUi = null; if (ui === 'diario') $('#diario').hidden = false; else lockPointer(); }
$('#note').addEventListener('click', fecharNota);

let dialogoFila = [], dialogoCb = null;
function dialogo(linhas, cb) { dialogoFila = linhas.slice(); dialogoCb = cb; ui = 'dialogo'; $('#dialogo').hidden = false; proxDialogo(); }
function proxDialogo() {
  const l = dialogoFila.shift();
  if (!l) { $('#dialogo').hidden = true; ui = null; const cb = dialogoCb; dialogoCb = null; cb && cb(); return; }
  const p = R.personagens[l.quem] || { nome: l.quem, cor: '#fff' };
  $('#dialogo .quem').textContent = p.nome; $('#dialogo .quem').style.color = p.cor; $('#dialogo .txt').textContent = codTxt(l.texto);
  SFX.clique();
}
$('#dialogo').addEventListener('click', proxDialogo);

// Interação "segurar E"
let segurando = { it: null, t: 0, ruidoT: 0 };
function updateSegurar(dt) {
  const arc = $('#hold-arc');
  if (alvo && alvo.hold && keys.KeyE && !(alvo.pode && !alvo.pode())) {
    if (segurando.it !== alvo) segurando = { it: alvo, t: 0, ruidoT: 0 };
    segurando.t += dt; segurando.ruidoT -= dt;
    if (segurando.ruidoT <= 0) { segurando.ruidoT = .6; if (alvo.ruido) emitNoise(P.pos.x, P.pos.z, alvo.ruido); if (alvo.som) SFX[alvo.som](); }
    const k = Math.min(1, segurando.t / alvo.hold);
    $('#hold').hidden = false; arc.style.strokeDashoffset = 138.2 * (1 - k);
    if (k >= 1) { const it = alvo; segurando = { it: null, t: 0, ruidoT: 0 }; $('#hold').hidden = true; keys.KeyE = false; it.act(); }
  } else { segurando = { it: null, t: 0, ruidoT: 0 }; $('#hold').hidden = true; }
}

// =====================================================================
// API PARA OS MAPAS
// =====================================================================
const API = {
  THREE, MAT, TX, MK, ITENS, R, rand, pick, perf: () => perf,
  box, cyl, prop, plano, parede, piso, teto, construirSalas, porta, armario, cama, lampada, vela, gatilho, interact, item, spot, mesaSimples, estante, textoTex, texMat, canvasTex,
  addCollider, SALA, DOOR, setDoor, roomAt, W, P, M, ANA, ativarInspetor, desativarInspetor, spawnAna, despawnAna, iniciarProcissao, planejar,
  objDone, progresso, falar, sub, toast, dialogo, lerNota, tocarFita, emitNoise, fade, cartao, conquista, syncWorld, syncLuzes, carregarMapa, salvarCheckpoint, agendarEntidades,
  SFX: new Proxy({}, { get: (t, k) => (...a) => SFX[k](...a) }), abrirTeclado: (...a) => abrirTeclado(...a), final: (...a) => final(...a), escolhaFinal: () => escolhaFinal(), codTxt, D, camera, scene,
  get S() { return S; }, get mode() { return mode; }
};

// =====================================================================
// CENA DE ABERTURA (carro)
// =====================================================================
let cena = null;
function iniciarCena() {
  mode = 'cena'; $('#fx-cine').hidden = false; $('#hud').hidden = true;
  cena = { t: 0, fim: 34, falas: R.abertura.slice(), cartoes: R.intro.slice(), cartaoT: 0 };
  if (W.def.cena) W.def.cena.iniciar();
  SFX.motor(true);
}
function updateCena(dt) {
  cena.t += dt;
  if (W.def.cena) W.def.cena.update(cena.t, dt);
  if (cena.falas.length && cena.t >= cena.falas[0].t) { const f = cena.falas.shift(); sub(f.quem, f.texto, true); }
  cena.cartaoT -= dt;
  if (cena.cartaoT <= 0 && cena.cartoes.length && cena.t < 28) { cartao(cena.cartoes.shift(), 4.6); cena.cartaoT = 5.4; }
  updateSub(dt);
  if (cena.t >= cena.fim) pularCena();
}
function pularCena() {
  if (!cena) return;
  cena = null; $('#fx-cine').hidden = true; SFX.motor(false); $('#cartao').style.opacity = 0;
  if (W.def.cena) W.def.cena.fim();
  mode = 'jogo'; $('#hud').hidden = false; subQ = []; subT = 0; $('#sub').innerHTML = '';
  cartaoCapitulo(); renderObj();
  lockPointer();
  setTimeout(() => falar('inicio'), 1800);
}

// =====================================================================
// ÁUDIO PROCEDURAL
// =====================================================================
// Cadeia: fontes -> barramentos (amb/ent/voz passam pelo "vácuo"; sfx e mus não) -> mundo (abafável) -> master
//         corpo (coração/respiração) vai direto ao master: escondida, você ouve o próprio corpo sem filtro.
//         master -> corte (DEZ da Ana) -> mono -> compressor -> makeup -> saída
let AC = null, master, reverb, ruidoBuf;
const AMB = {};
const BUS = {};
const FONTES = new Set();
const AUD = { sils: [], trovaoIni: 0, trovaoAte: 0, coracaoN: 0, hbT: 0, resp: 0, prendia: false, ultStinger: [], stingerT: -99, dezAte: 0, estPrev: null, anaPrev: null, procT: 0, evT: 28, cacaT: 0, cacaSemi: 0, posCacaT: 0, percT: 0, pulsoT: 0, lampT: 0, ocT: 0, flashPrev: false, tiqueT: 0, avisouCoracao: false, cordaT: -9, cordaN: 0, sala: null, zumbidoAte: 0, pausado: false, erroAvisado: false };
for (const [k, v] of Object.entries({ vAmb: 1, vSfx: 1, vEnt: 1, vVoz: 1, mono: 0, noturno: 0, falada: 0 })) if (OPT[k] === undefined) OPT[k] = v;
const SFX = new Proxy({}, { get: (t, k) => (...a) => { if (!AC) return; try { return SOM[k] && SOM[k](...a); } catch (e) { console.warn(e); } } });
const depois = (ms, fn) => setTimeout(() => { try { if (AC) fn(); } catch (e) { console.warn(e); } }, ms);
function gerarIR(seg, curva) {
  const n = Math.max(1, AC.sampleRate * seg | 0), ir = AC.createBuffer(2, n, AC.sampleRate);
  for (let c = 0; c < 2; c++) { const ch = ir.getChannelData(c); for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, curva); }
  return ir;
}
function aplicarNoturno() {
  if (!AC) return;
  const c = AUD.cmp, n = !!OPT.noturno;
  c.threshold.value = n ? -46 : -24; c.knee.value = n ? 12 : 30; c.ratio.value = n ? 16 : 12; c.attack.value = .003; c.release.value = n ? .4 : .25;
  AUD.makeup.gain.value = n ? 2.3 : 1;
}
function aplicarVolumes() {
  if (!AC) return;
  const t = AC.currentTime;
  for (const [k, v] of [['amb', 'vAmb'], ['mus', 'vAmb'], ['ent', 'vEnt'], ['voz', 'vVoz'], ['sfx', 'vSfx'], ['corpo', 'vSfx']]) {
    const alvo = OPT[v] * (k === 'ent' ? (AUD.entK ?? 1) : 1);
    BUS[k].gain.setTargetAtTime(alvo, t, .05); BUS[k + 'R'].gain.setTargetAtTime(alvo, t, .05);
  }
  AUD.mono.channelCount = OPT.mono ? 1 : 2;
}
function iniciarAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  AC = new (window.AudioContext || window.webkitAudioContext)();
  master = AC.createGain(); master.gain.value = OPT.vol;
  AUD.corte = AC.createGain();
  AUD.mono = AC.createGain(); AUD.mono.channelCountMode = 'explicit'; AUD.mono.channelInterpretation = 'speakers'; AUD.mono.channelCount = OPT.mono ? 1 : 2;
  AUD.cmp = AC.createDynamicsCompressor(); AUD.makeup = AC.createGain();
  master.connect(AUD.corte); AUD.corte.connect(AUD.mono); AUD.mono.connect(AUD.cmp); AUD.cmp.connect(AUD.makeup); AUD.makeup.connect(AC.destination);
  aplicarNoturno();
  AUD.abafa = AC.createBiquadFilter(); AUD.abafa.type = 'lowpass'; AUD.abafa.frequency.value = 20000; AUD.abafa.Q.value = .5;
  AUD.mundo = AC.createGain(); AUD.mundo.connect(AUD.abafa); AUD.abafa.connect(master);
  AUD.madeira = AC.createDelay(.2); AUD.madeira.delayTime.value = .021;
  const mfb = AC.createGain(); mfb.gain.value = .38; const mlp = AC.createBiquadFilter(); mlp.type = 'lowpass'; mlp.frequency.value = 1400;
  AUD.madeiraG = AC.createGain(); AUD.madeiraG.gain.value = 0;
  AUD.mundo.connect(AUD.madeiraG); AUD.madeiraG.connect(AUD.madeira); AUD.madeira.connect(mlp); mlp.connect(mfb); mfb.connect(AUD.madeira); mlp.connect(AUD.abafa);
  AUD.vacuo = AC.createGain(); AUD.vacuo.connect(AUD.mundo);
  ruidoBuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
  const d = ruidoBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  AUD.revIn = AC.createGain(); const ret = AC.createGain(); ret.gain.value = .45; ret.connect(AUD.vacuo);
  AUD.rev = {};
  for (const [k, seg, curva] of [['p', .6, 3], ['g', 2.8, 2.4], ['t', 4, 1.8]]) {
    const s = AC.createGain(); s.gain.value = k === 'p' ? 1 : 0; const cv = AC.createConvolver(); cv.buffer = gerarIR(seg, curva);
    AUD.revIn.connect(s); s.connect(cv); cv.connect(ret); AUD.rev[k] = s;
    if (k === 't') { const dl = AC.createDelay(1); dl.delayTime.value = .18; const fb = AC.createGain(); fb.gain.value = .3; cv.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(ret); }
  }
  reverb = AUD.revIn;
  for (const [k, destino, v] of [['amb', AUD.vacuo, 'vAmb'], ['ent', AUD.vacuo, 'vEnt'], ['voz', AUD.vacuo, 'vVoz'], ['sfx', AUD.mundo, 'vSfx'], ['mus', AUD.mundo, 'vAmb'], ['corpo', master, 'vSfx']]) {
    BUS[k] = AC.createGain(); BUS[k].gain.value = OPT[v]; BUS[k].connect(destino);
    BUS[k + 'R'] = AC.createGain(); BUS[k + 'R'].gain.value = OPT[v]; BUS[k + 'R'].connect(AUD.revIn);
  }
  SOM.ambiente(); SOM.musica(); SOM.corpo(); SOM.lampadas(); SOM.lanterna();
}
function ruido(loop) { const s = AC.createBufferSource(); s.buffer = ruidoBuf; s.loop = !!loop; return s; }
function novoPanner(ref = 2, roll = 1.2) { const p = AC.createPanner(); p.panningModel = OPT.mono ? 'equalpower' : 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = ref; p.rolloffFactor = roll; return p; }
function posPanner(p, pos) { p.positionX.value = pos.x; p.positionY.value = pos.y ?? 1.5; p.positionZ.value = pos.z; }
// Oclusão: quanto do som atravessa paredes e portas até a sala da jogadora
function oclusao(pos) {
  if (!P.room || !W.salas || !W.salas.length) return null;
  const r = roomAt(pos.x, pos.z);
  if (!r || r === P.room || (r.fora && P.room.fora)) return null;
  const n = distSalas(r, P.room);
  if (n <= 1) return salaAdj(r, P.room) ? { f: 3000, g: .85 } : { f: 900, g: .5 };
  if (n === 2) return { f: 550, g: .42 };
  return { f: 380, g: .3 };
}
function saida(pos, wet = .3, bus) {
  bus = BUS[bus] ? bus : 'sfx';
  const g = AC.createGain(); let node = g, oc = null;
  if (pos) {
    const p = novoPanner(); posPanner(p, pos); g.connect(p); node = p;
    oc = oclusao(pos);
    if (oc) { const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = oc.f; f.Q.value = .4; const og = AC.createGain(); og.gain.value = oc.g; node.connect(f); f.connect(og); node = og; }
  }
  node.connect(BUS[bus]);
  if (wet) { const w = AC.createGain(); w.gain.value = wet * (oc ? 1.4 : 1); node.connect(w); w.connect(BUS[bus + 'R']); }
  return g;
}
// Fonte contínua com posição e oclusão atualizadas (gerador, canto, lâmpadas)
function fonteFixa(pos, bus = 'amb', wet = .2) {
  const g = AC.createGain(), p = novoPanner(2.5, 1.1), f = AC.createBiquadFilter(), og = AC.createGain();
  f.type = 'lowpass'; f.frequency.value = 20000; f.Q.value = .4;
  g.connect(p); p.connect(f); f.connect(og); og.connect(BUS[bus]);
  if (wet) { const w = AC.createGain(); w.gain.value = wet; og.connect(w); w.connect(BUS[bus + 'R']); }
  const F = { g, p, f, og, pos: { x: pos.x, y: pos.y ?? 1.5, z: pos.z } }; posPanner(p, F.pos); FONTES.add(F); atualizarOclusao(F, true); return F;
}
function moverFonte(F, pos) { F.pos.x = pos.x; F.pos.z = pos.z; if (pos.y !== undefined) F.pos.y = pos.y; posPanner(F.p, F.pos); }
function atualizarOclusao(F, ja) { const oc = oclusao(F.pos), t = AC.currentTime; F.f.frequency.setTargetAtTime(oc ? oc.f : 20000, t, ja ? .001 : .15); F.og.gain.setTargetAtTime(oc ? oc.g : 1, t, ja ? .001 : .15); }
function env(g, t0, a, peak, dec) { g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + dec); }
function osc(tipo, f, t, dur, g) { const o = AC.createOscillator(); o.type = tipo; o.frequency.value = f; o.connect(g); o.start(t); o.stop(t + dur); return o; }
function burst(t, dur, filtro, freq, q, g, off = Math.random()) { const s = ruido(), f = AC.createBiquadFilter(); f.type = filtro; f.frequency.value = freq; f.Q.value = q; s.connect(f); f.connect(g); s.start(t, off); s.stop(t + dur); return f; }
function curvaDist(k) { const n = 1024, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return c; }
// Vozes formantes: vogal -> [f1, f2]
const VOGAL = { a: [800, 1200], e: [500, 1800], i: [300, 2300], o: [500, 900], u: [320, 800] };
function silaba(t, pos, f0, vogal, dur, peak, bus = 'voz', wet = .5) {
  const g = saida(pos, wet, bus), o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0 * .93, t + dur);
  const [f1, f2] = VOGAL[vogal] || VOGAL.a;
  for (const [ff, a] of [[f1, 1], [f2, .55]]) { const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = 6; const bg = AC.createGain(); bg.gain.value = a; o.connect(bp); bp.connect(bg); bg.connect(g); }
  const s = ruido(), sf = AC.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = f2; sf.Q.value = 2; const sg = AC.createGain(); sg.gain.value = .35; s.connect(sf); sf.connect(sg); sg.connect(g); s.start(t, Math.random()); s.stop(t + dur + .1);
  env(g, t, .06, peak, dur); o.start(t); o.stop(t + dur + .15);
  return o;
}
const STINGERS = [
  t => { // cordas em cluster que despencam
    for (const f of [110, 116.5, 155, 233, 247]) { const g = saida(null, .6, 'mus'); const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .78, t + 1.8); o.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.09, t + .05); g.gain.exponentialRampToValueAtTime(.0001, t + 2); o.start(t); o.stop(t + 2.1); }
    const g = saida(null, .8, 'mus'); burst(t, 1, 'highpass', 200, 1, g); env(g, t, .01, .35, .9);
  },
  t => { // piano grave com cauda longa
    for (const [f, a] of [[55, 1], [58.3, .7], [61.7, .6], [110.2, .5], [165.5, .3], [221, .2]]) { const g = saida(null, 1.2, 'mus'); osc('triangle', f, t, 4.5, g); env(g, t, .004, .16 * a, 4); }
  },
  t => { // metal raspado ressonante
    const g = saida(null, .9, 'mus'); for (const f of [1230, 1870, 2650]) { const s = ruido(), bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(f, t); bp.frequency.linearRampToValueAtTime(f * .9, t + 2); bp.Q.value = 30; s.connect(bp); bp.connect(g); s.start(t, Math.random()); s.stop(t + 2.2); }
    env(g, t, .02, 2.2, 2); const g2 = saida(null, .5, 'mus'); const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(300, t); o.frequency.linearRampToValueAtTime(180, t + 1); o.connect(g2); env(g2, t, .01, .05, 1); o.start(t); o.stop(t + 1.1);
  },
  t => { // sopro ao contrário, crescente, cortado seco
    const g = saida(null, .4, 'mus'); burst(t, 1, 'bandpass', 900, .7, g); const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(140, t + .9); o.connect(g);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.55, t + .9); g.gain.setValueAtTime(0, t + .91); o.start(t); o.stop(t + .95);
    depois(900, () => SOM.impacto(1.2));
  },
  t => { // coro distorcido
    const ws = AC.createWaveShaper(); ws.curve = curvaDist(8); const g = saida(null, .9, 'mus'); ws.connect(g);
    for (const f of [196, 207.6, 233, 277.2]) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 1.04, t + 1.6); const lfo = AC.createOscillator(); lfo.frequency.value = rand(5, 8); const lg = AC.createGain(); lg.gain.value = f * .03; lfo.connect(lg); lg.connect(o.frequency); const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 750; bp.Q.value = 3; o.connect(bp); bp.connect(ws); o.start(t); lfo.start(t); o.stop(t + 1.9); lfo.stop(t + 1.9); }
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .08); g.gain.exponentialRampToValueAtTime(.0001, t + 1.8);
  }
];
const SOM = {
  ambiente() {
    const t = AC.currentTime;
    const dg = AC.createGain(); dg.gain.value = .04; const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180;
    for (const f of [41, 41.6, 61.8]) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(lp); o.start(t); }
    lp.connect(dg); dg.connect(BUS.amb); AMB.drone = dg;
    const lfo = AC.createOscillator(); lfo.frequency.value = .07; const lg = AC.createGain(); lg.gain.value = 80; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    const ch = ruido(true), bp = AC.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = 2800;
    const cg = AC.createGain(); cg.gain.value = .12; ch.connect(bp); bp.connect(cg); cg.connect(BUS.amb); ch.start(); AMB.chuva = cg; AMB.chuvaF = bp;
    const v = ruido(true), vb = AC.createBiquadFilter(); vb.type = 'bandpass'; vb.frequency.value = 400; vb.Q.value = 2;
    const vg = AC.createGain(); vg.gain.value = .04; v.connect(vb); vb.connect(vg); vg.connect(BUS.amb); v.start(); AMB.vento = vg; AMB.ventoF = vb;
    const vl = AC.createOscillator(); vl.frequency.value = .11; const vlg = AC.createGain(); vlg.gain.value = 220; vl.connect(vlg); vlg.connect(vb.frequency); vl.start();
    const goteira = () => {
      try {
        if (AC && mode === 'jogo' && P.room && !P.room.fora && (W.mapa === 'tuneis' || P.room.agua || Math.random() < .3)) {
          const t2 = AC.currentTime, pos = { x: P.pos.x + rand(-6, 6), y: 2, z: P.pos.z + rand(-6, 6) }, poca = W.mapa === 'tuneis' || (P.room.agua && S && !S.flags.aguaBaixa);
          for (const [k, esc] of poca && Math.random() < .5 ? [[0, 1], [.11, .5]] : [[0, 1]]) { const g = saida(pos, .6, 'amb'); const o = AC.createOscillator(), f0 = rand(900, 1500) * (poca ? .7 : 1); o.frequency.setValueAtTime(f0, t2 + k); o.frequency.exponentialRampToValueAtTime(f0 * .33, t2 + k + .08); o.connect(g); env(g, t2 + k, .002, .05 * esc, .1); o.start(t2 + k); o.stop(t2 + k + .15); }
        }
      } catch (e) {}
      setTimeout(goteira, W.mapa === 'tuneis' ? rand(700, 2600) : rand(1500, 5000));
    };
    goteira();
  },
  musica() {
    const t = AC.currentTime;
    const cg = AC.createGain(); cg.gain.value = 0; const cf = AC.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 1100; cf.Q.value = 1.5;
    const trem = AC.createGain(); trem.gain.value = .5; const tl = AC.createOscillator(); tl.frequency.value = 9; const tlg = AC.createGain(); tlg.gain.value = .5; tl.connect(tlg); tlg.connect(trem.gain); tl.start(t);
    for (const f of [220, 233.1, 246.9, 329.6]) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = rand(-8, 8); o.connect(cf); o.start(t); }
    cf.connect(trem); trem.connect(cg); cg.connect(BUS.amb); AMB.cordas = cg;
    const kg = AC.createGain(); kg.gain.value = 0; const kf = AC.createBiquadFilter(); kf.type = 'lowpass'; kf.frequency.value = 320;
    AMB.cacaOsc = [55, 58].map(f => { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(kf); o.start(t); return o; });
    kf.connect(kg); kg.connect(BUS.amb); AMB.caca = kg;
    const vg = AC.createGain(); vg.gain.value = 0; const vo = AC.createOscillator(); vo.type = 'sawtooth'; vo.frequency.value = 880; const vf = AC.createBiquadFilter(); vf.type = 'bandpass'; vf.frequency.value = 2400; vf.Q.value = 4;
    const vib = AC.createOscillator(); vib.frequency.value = 6; const vibg = AC.createGain(); vibg.gain.value = 9; vib.connect(vibg); vibg.connect(vo.frequency); vo.connect(vf); vf.connect(vg); vg.connect(BUS.amb); vo.start(t); vib.start(t);
    AMB.violino = vg; AMB.violinoO = vo;
    const zg = AC.createGain(); zg.gain.value = 0; const zo = AC.createOscillator(); zo.frequency.value = 2960; zo.connect(zg); zg.connect(BUS.amb); zo.start(t); AMB.zumbido = zg;
  },
  corpo() {
    const s = ruido(true), f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 1.2; const g = AC.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(BUS.corpo); s.start();
    AMB.resp = { g, f };
    const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.value = 330; const of = AC.createBiquadFilter(); of.type = 'bandpass'; of.frequency.value = 900; of.Q.value = 3; const og = AC.createGain(); og.gain.value = 0; o.connect(of); of.connect(og); og.connect(BUS.corpo); o.start();
    AMB.choro = { g: og, o };
  },
  lampadas() {
    AMB.lamp = [];
    for (let i = 0; i < 3; i++) {
      const p = novoPanner(1, 1.6), g = AC.createGain(); g.gain.value = 0; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 240; f.Q.value = 2;
      const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 60; o.connect(f); f.connect(g); g.connect(p); p.connect(BUS.amb); o.start();
      AMB.lamp.push({ p, g, o });
    }
  },
  lanterna() {
    const o = AC.createOscillator(); o.frequency.value = 120; const o2 = AC.createOscillator(); o2.frequency.value = 240; const g = AC.createGain(); g.gain.value = 0; const g2 = AC.createGain(); g2.gain.value = .4;
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(BUS.sfx); o.start(); o2.start(); AMB.flash = { g, o };
  },
  silencio(dur = 1.5, nivel = .1, seco) {
    const t = AC.currentTime;
    AUD.sils = AUD.sils.filter(w => w.ate > t); AUD.sils.push({ ate: t + dur, nivel });
    if (seco) { AUD.vacuo.gain.cancelScheduledValues(t); AUD.vacuo.gain.setValueAtTime(nivel, t); }
  },
  vacuo(dur = 1.5) { SOM.silencio(dur, .08); },
  impacto(v = 1) {
    const t = AC.currentTime, g = saida(null, .5, 'mus'), o = AC.createOscillator(); o.frequency.setValueAtTime(60, t); o.frequency.exponentialRampToValueAtTime(28, t + .8); o.connect(g); env(g, t, .004, .6 * v, .8); o.start(t); o.stop(t + .9);
    const g2 = saida(null, .5, 'mus'); burst(t, .5, 'lowpass', 220, 1, g2, 0); env(g2, t, .003, .7 * v, .45);
  },
  stinger(tipo) {
    const t = AC.currentTime;
    if (tipo === undefined && t - AUD.stingerT < 12) { SOM.impacto(.55); SOM.silencio(.4, .25, true); return; }
    AUD.stingerT = t;
    let k = tipo;
    if (k === undefined || !STINGERS[k]) { const op = STINGERS.map((_, i) => i).filter(i => !AUD.ultStinger.includes(i)); k = pick(op); }
    AUD.ultStinger.push(k); if (AUD.ultStinger.length > 2) AUD.ultStinger.shift();
    SOM.silencio(1.4, .12, true);
    SOM.impacto(1); STINGERS[k](t);
  },
  passo(vol, piso, fora, agua) {
    const t = AC.currentTime, g = saida(null, fora ? .05 : .25), tom = rand(.88, 1.12);
    if (agua) { burst(t, .25, 'bandpass', 700 * tom, 1.5, g); env(g, t, .02, .35 * vol + .08, .22); const g2 = saida(null, .2); burst(t + .12, .15, 'highpass', 2500, 1, g2); env(g2, t + .12, .01, .06 * vol + .02, .12); return; }
    const freq = { madeira: 520, concreto: 1200, ladrilho: 1700, pedra: 950, asfalto: 1100, grama: 700 }[piso] || 900;
    burst(t, .12, fora || piso === 'grama' ? 'bandpass' : 'lowpass', freq * tom, piso === 'ladrilho' ? 2 : 1, g);
    env(g, t, .005, (.25 * vol + .03) * (vol < .3 ? .6 : 1), piso === 'ladrilho' ? .06 : .09);
    if (piso === 'ladrilho' && vol > .3) { const g3 = saida(null, .3); burst(t, .03, 'highpass', 3200, 1, g3); env(g3, t, .001, .08 * vol, .03); }
    if (fora && piso !== 'asfalto') { const g4 = saida(null, 0); burst(t + .02, .15, 'highpass', 3500, .7, g4); env(g4, t + .02, .02, .05 * vol, .12); }
    if (vol >= 1) { const g5 = saida(null, 0); burst(t, .2, 'highpass', 2200, .5, g5); env(g5, t, .04, .035, .15); }
    if (piso === 'madeira' && Math.random() < (vol >= 1 ? .2 : .12)) SOM.rangido(P.pos.x, .1, P.pos.z, .3);
  },
  passoMonstro(pos, vol, agua) {
    const t = AC.currentTime, p = { x: pos.x, y: .3, z: pos.z }, r = W.salas && W.salas.length ? roomAt(pos.x, pos.z) : null;
    const piso = agua ? 'agua' : r ? (r.piso || (r.fora ? 'grama' : 'madeira')) : 'madeira', tom = rand(.92, 1.08);
    const d = Math.hypot(pos.x - P.pos.x, pos.z - P.pos.z), tunel = W.mapa === 'tuneis';
    const g = saida(p, .5, 'ent'); const o = AC.createOscillator(); o.frequency.setValueAtTime(70 * tom, t); o.frequency.exponentialRampToValueAtTime(30, t + .25); o.connect(g); env(g, t, .01, .9 * vol, .3); o.start(t); o.stop(t + .4);
    const cor = { agua: ['bandpass', 600, .9, .35], madeira: ['lowpass', 380, .6, .22], ladrilho: ['bandpass', 1500, .45, .08], concreto: ['bandpass', 1000, .5, .12], pedra: ['lowpass', 700, .6, .18], asfalto: ['bandpass', 900, .4, .1], grama: ['lowpass', 250, .5, .25] }[piso] || ['lowpass', 400, .6, .2];
    const g2 = saida(p, piso === 'pedra' ? .8 : .4, 'ent'); burst(t, .3, cor[0], cor[1] * tom, 1, g2); env(g2, t, .005, cor[2] * vol, cor[3]);
    if (piso === 'madeira' && Math.random() < .3) SOM.rangido(pos.x, .2, pos.z, .5 * vol, 'ent');
    if (piso === 'ladrilho') { const g3 = saida(p, .4, 'ent'); burst(t, .03, 'highpass', 3000, 1, g3); env(g3, t, .001, .2 * vol, .03); }
    if (d < 8) { const g4 = saida(p, 0, 'ent'); const sb = AC.createOscillator(); sb.frequency.setValueAtTime(52, t); sb.frequency.exponentialRampToValueAtTime(38, t + .3); sb.connect(g4); env(g4, t, .01, .8 * vol * (1 - d / 8), .3); sb.start(t); sb.stop(t + .4); }
    if (tunel) { const g5 = saida(p, .6, 'ent'); burst(t + .12, .2, 'lowpass', 500, 1, g5); env(g5, t + .12, .01, .25 * vol, .2); }
    if (vol < 1 && !agua && Math.random() < .4) { const g6 = saida(p, .3, 'ent'); const f = burst(t + .35, .4, 'bandpass', 600, 1.5, g6); f.frequency.linearRampToValueAtTime(350, t + .75); env(g6, t + .35, .1, .12 * vol, .3); }
  },
  estalo(pos, vol = .6, estado) {
    estado = estado || (M.ativo && pos === M.pos ? M.state : 'patrulha');
    const t = AC.currentTime, g = saida({ x: pos.x, y: 3, z: pos.z }, .5, 'ent');
    const padrao = { patrulha: [[0, 1800]], investiga: [[0, 2200], [.09, 2200]], procura: [[0, 2000], [.08, 2400], [.16, 2800]], caca: [[0, 3200], [.06, 3300], [.12, 3200], [.18, 3400]] }[estado] || [[0, 1800]];
    for (const [k, f] of padrao) burst(t + k, .03, 'bandpass', f, 8, g);
    const fim = padrao[padrao.length - 1][0] + .2;
    g.gain.setValueAtTime(0, t); g.gain.setValueAtTime(.7 * vol, t + .001); if (fim - .2 > .002) g.gain.setValueAtTime(.7 * vol, t + fim - .2); g.gain.exponentialRampToValueAtTime(.0001, t + fim);
  },
  rangido(x, y, z, vol = 1, bus = 'sfx') {
    const sd = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
    const t = AC.currentTime, o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(120 + sd * 120 + rand(-15, 15), t); o.frequency.linearRampToValueAtTime(55 + sd * 60, t + .7);
    const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700 + sd * 500; f.Q.value = 12;
    const tr = AC.createOscillator(); tr.frequency.value = 16 + sd * 16; const trg = AC.createGain(); trg.gain.value = .5; tr.connect(trg);
    const g = saida({ x, y, z }, .4, bus); trg.connect(g.gain); o.connect(f); f.connect(g); env(g, t, .05, .35 * vol, .7); o.start(t); tr.start(t); o.stop(t + .9); tr.stop(t + .9);
  },
  pancada(x, z) {
    const t = AC.currentTime, p = { x, y: 1, z }, g = saida(p, .8, 'ent'); burst(t, .8, 'lowpass', 300, 1, g, 0); env(g, t, .003, 1.6, .6);
    const g2 = saida(p, .5, 'ent'); burst(t, .08, 'highpass', 1800, .8, g2); env(g2, t, .001, .4, .08);
    for (let i = 1; i < 4; i++) { const g3 = saida(p, .3, 'ent'); burst(t + i * .07 + rand(0, .03), .05, 'bandpass', rand(1500, 2600), 6, g3); env(g3, t + i * .07, .002, .12 / i, .05); }
  },
  trancado() {
    const t = AC.currentTime;
    for (let i = 0; i < 4; i++) { const g = saida(null, .2); burst(t + i * .085, .07, 'bandpass', rand(2100, 2700), 5, g); env(g, t + i * .085, .002, .28, .05); }
    const g = saida(null, .2), o = AC.createOscillator(); o.frequency.setValueAtTime(140, t + .36); o.frequency.exponentialRampToValueAtTime(80, t + .45); o.connect(g); env(g, t + .36, .003, .25, .1); o.start(t + .36); o.stop(t + .5);
  },
  pegar() {
    const t = AC.currentTime, g = saida(null, .3), o = AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(440, t); o.frequency.exponentialRampToValueAtTime(660, t + .1); o.connect(g); env(g, t, .01, .05, .25); o.start(t); o.stop(t + .35);
    const g2 = saida(null, .1); burst(t, .18, 'bandpass', 1800, .8, g2); env(g2, t, .03, .08, .14);
  },
  papel() { const t = AC.currentTime, g = saida(null, .1); burst(t, .3, 'highpass', 2500, .5, g); env(g, t, .02, .15, .25); const g2 = saida(null, .1); burst(t + .18, .15, 'highpass', 3500, .5, g2); env(g2, t + .18, .01, .07, .12); },
  clique() { const t = AC.currentTime, g = saida(null, 0); burst(t, .05, 'highpass', 3000, 1, g); env(g, t, .001, .25, .03); const g2 = saida(null, 0); burst(t + .04, .03, 'bandpass', 1400, 3, g2); env(g2, t + .04, .001, .12, .03); },
  tique() { const t = AC.currentTime, g = saida(null, 0); burst(t, .02, 'highpass', 4500, 1, g); env(g, t, .001, .09, .02); const g2 = saida(null, 0); osc('square', 100, t, .05, g2); env(g2, t, .002, .012, .04); },
  objetivo() {
    const t = AC.currentTime;
    for (const [i, f] of [[0, 146.8], [1, 174.6], [2, 220]]) { const g = saida(null, .6, 'mus'); osc('sine', f, t + i * .18, 2, g); env(g, t + i * .18, .05, .06, 1.7); }
    const g = saida(null, 1, 'mus'); osc('sine', 587.3, t + .5, 2.5, g); osc('sine', 587.3 * 2.76, t + .5, 1.2, g); env(g, t + .5, .003, .025, 2.2);
  },
  vidro(x, z) {
    const t = AC.currentTime, p = x !== undefined ? { x, y: .5, z } : null;
    for (let i = 0; i < 8; i++) { const g = saida(p, .4); osc('sine', rand(2500, 6500), t + i * .03, .3, g); env(g, t + i * .03, .001, .08, .2); }
    const g = saida(p, .5); burst(t, .3, 'highpass', 1800, 1, g); env(g, t, .002, .5, .25);
    for (const k of [.16, .29, .41]) { const g2 = saida(p, .4); osc('sine', rand(3000, 7000), t + k, .15, g2); env(g2, t + k, .001, .03, .1); }
  },
  arremesso() {
    const t = AC.currentTime, g = saida(null, 0); const f = burst(t, .35, 'bandpass', 400, 1.2, g); f.frequency.exponentialRampToValueAtTime(1400, t + .3); env(g, t, .05, .12, .25);
    const g2 = saida(null, 0), o = AC.createOscillator(); o.frequency.setValueAtTime(1300, t); o.frequency.exponentialRampToValueAtTime(800, t + .35); o.connect(g2); env(g2, t, .05, .008, .3); o.start(t); o.stop(t + .4);
  },
  armario() {
    const t = AC.currentTime, g = saida(null, .3); burst(t, .3, 'bandpass', 700, 3, g); env(g, t, .005, .5, .25); SOM.rangido(P.pos.x, 1, P.pos.z, .4);
    const g2 = saida(null, .2), o = AC.createOscillator(); o.frequency.setValueAtTime(320, t + .28); o.frequency.exponentialRampToValueAtTime(160, t + .33); o.connect(g2); env(g2, t + .28, .002, .18, .06); o.start(t + .28); o.stop(t + .4);
  },
  arrastar() {
    const t = AC.currentTime, g = saida(null, .2); burst(t, .5, 'lowpass', 500, 1, g); env(g, t, .08, .3, .35);
    for (let i = 0; i < 3; i++) { const k = .1 + i * .13 + rand(0, .05), g2 = saida(null, .2), o = AC.createOscillator(), f0 = rand(1800, 2600); o.frequency.setValueAtTime(f0, t + k); o.frequency.exponentialRampToValueAtTime(f0 * .7, t + k + .12); o.connect(g2); env(g2, t + k, .005, .012, .12); o.start(t + k); o.stop(t + k + .15); }
  },
  ofego() { if (SOM._of && AC.currentTime - SOM._of < 1.2) return; SOM._of = AC.currentTime; const t = AC.currentTime, g = saida(null, .1, 'corpo'); burst(t, .8, 'bandpass', rand(1100, 1500), 1, g); env(g, t, .15, .25, .5); const g2 = saida(null, .1, 'corpo'); burst(t + .55, .5, 'bandpass', 900, 1, g2); env(g2, t + .55, .05, .12, .4); },
  arfar() { const t = AC.currentTime, g = saida(null, .1, 'corpo'); const f = burst(t, .45, 'bandpass', 1300, 1.2, g); f.frequency.linearRampToValueAtTime(1900, t + .35); env(g, t, .04, .3, .35); const g2 = saida(null, .1, 'corpo'); burst(t + .4, .8, 'bandpass', 850, 1, g2); env(g2, t + .4, .05, .14, .7); },
  coracao(vol = 1) { const t = AC.currentTime; for (const k of [0, .17]) { const g = saida(null, 0, 'corpo'); const o = AC.createOscillator(); o.frequency.setValueAtTime(58, t + k); o.frequency.exponentialRampToValueAtTime(35, t + k + .14); o.connect(g); env(g, t + k, .01, (k ? .35 : .5) * vol, .16); o.start(t + k); o.stop(t + k + .25); } },
  susto(tipo) {
    const agora = AC.currentTime;
    if (agora < AUD.dezAte) { depois((AUD.dezAte - agora) * 1000, () => SOM.stinger(tipo)); return; }
    SOM.stinger(tipo);
  },
  zumbidoOuvido() {
    const t = AC.currentTime, g = saida(null, 0, 'corpo'); osc('sine', rand(3900, 4500), t, 3.2, g); env(g, t, .05, .02, 3);
    AUD.zumbidoAte = t + 2.2; AUD.mundo.gain.cancelScheduledValues(t); AUD.mundo.gain.setValueAtTime(.25, t);
  },
  grito(quem) {
    const t = AC.currentTime, ana = quem === 'ana', base = ana ? [900, 1200, 1500] : quem === 'procissao' ? [330, 392, 466] : [220, 300, 450];
    for (const f of base) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .55, t + 1.1); const lfo = AC.createOscillator(); lfo.frequency.value = ana ? 38 : 26; const lg = AC.createGain(); lg.gain.value = f * .08; lfo.connect(lg); lg.connect(o.frequency); const g = saida(null, .7, 'mus'); o.connect(g); env(g, t, .02, .22, 1.2); o.start(t); lfo.start(t); o.stop(t + 1.3); lfo.stop(t + 1.3); }
    const g = saida(null, .6, 'mus'); burst(t, 1.2, 'bandpass', ana ? 2400 : 1500, 1, g); env(g, t, .01, .6, 1);
    if (!ana) { const ws = AC.createWaveShaper(); ws.curve = curvaDist(20); const g2 = saida(null, .5, 'mus'); ws.connect(g2); const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(55, t); o.frequency.linearRampToValueAtTime(40, t + 1); o.connect(ws); env(g2, t, .02, .08, 1); o.start(t); o.stop(t + 1.1); }
    SOM.impacto(.9); SOM.silencio(.8, .15, true); depois(250, () => SOM.zumbidoOuvido());
  },
  sino(vol = 1, pos = { x: 0, y: 4, z: -60 }, desafina = 1) {
    const t = AC.currentTime, base = 196 * desafina;
    if (vol >= .9) SOM.silencio(6, .04, true);
    for (const [m, a] of [[.5, .4], [1, 1], [1.19, .5], [1.5, .45], [2, .5], [2.5, .3], [2.67, .25], [3.0, .2], [4.17, .12]]) { const g = saida(pos, .9); osc('sine', base * m * (desafina < 1 ? rand(.997, 1.003) : 1), t, 8, g); env(g, t, .004, .35 * a * vol, 7 / m); }
  },
  sinoLonge() { SOM.sino(.3, null); },
  badaladas(n = 9) {
    SOM.silencio(1.8 + n * 2.2, .25);
    for (let i = 0; i < n; i++) depois(1800 + i * 2200, () => SOM.sino(.45 * (i === n - 1 ? 1.25 : 1), null, 1 - i * .005));
  },
  estatica(dur = 2, pos) {
    const t = AC.currentTime, s = ruido(true), f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = .8;
    const g = saida(pos || null, .2); s.connect(f); f.connect(g);
    g.gain.setValueAtTime(0, t); for (let i = 0; i < dur * 20; i++) g.gain.setValueAtTime(Math.random() * .22, t + i / 20);
    g.gain.setValueAtTime(0, t + dur); s.start(t); s.stop(t + dur + .1);
    const g2 = saida(pos || null, .2), o = AC.createOscillator(); o.frequency.setValueAtTime(rand(1800, 3200), t); for (let i = 1; i < 6; i++) o.frequency.linearRampToValueAtTime(rand(1800, 3200), t + dur * i / 6); o.connect(g2);
    g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(.012, t + .2); g2.gain.setValueAtTime(.012, t + dur - .1); g2.gain.linearRampToValueAtTime(0, t + dur); o.start(t); o.stop(t + dur + .1);
  },
  sussurros(dur = 2) {
    const t = AC.currentTime;
    for (let k = 0; k < 3; k++) {
      const s = ruido(true), f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = rand(1800, 3500); f.Q.value = 6;
      const g = AC.createGain(); g.gain.value = 0; const p = novoPanner(1, 1);
      const a0 = rand(0, Math.PI * 2), a1 = a0 + rand(-2, 2), r0 = rand(1.2, 3);
      p.positionY.value = 1.6; p.positionX.setValueAtTime(P.pos.x + Math.cos(a0) * r0, t); p.positionZ.setValueAtTime(P.pos.z + Math.sin(a0) * r0, t);
      p.positionX.linearRampToValueAtTime(P.pos.x + Math.cos(a1) * r0, t + dur); p.positionZ.linearRampToValueAtTime(P.pos.z + Math.sin(a1) * r0, t + dur);
      for (let i = 0; i < dur * 8; i++) g.gain.setValueAtTime(Math.random() < .6 ? rand(.02, .07) : 0, t + k * .3 + i / 8);
      g.gain.setValueAtTime(0, t + k * .3 + dur);
      s.connect(f); f.connect(g); g.connect(p); p.connect(BUS.amb); const w = AC.createGain(); w.gain.value = .5; p.connect(w); w.connect(BUS.ambR);
      s.start(t + k * .3); s.stop(t + dur + k * .3 + .05);
    }
  },
  risada(x, z) {
    const t = AC.currentTime, n = 4 + (Math.random() * 3 | 0);
    for (let i = 0; i < n; i++) { const at = t + i * rand(.12, .16), f0 = rand(620, 780) * (1 - i * .02); const o = silaba(at, { x, y: 1, z }, f0, i % 2 ? 'i' : 'e', .1, .05, 'ent', .9); o.type = 'triangle'; }
    const g = saida({ x, y: 1, z }, .9, 'ent'); burst(t, n * .14, 'bandpass', 2600, 2, g); env(g, t, .02, .03, n * .13);
  },
  anaPasso(pos) { const t = AC.currentTime, g = saida({ x: pos.x, y: .1, z: pos.z }, .3, 'ent'); burst(t, .05, 'bandpass', rand(1500, 2100), 1.5, g); env(g, t, .003, .1, .05); },
  contagem(pos, n) {
    const t = AC.currentTime, d = Math.hypot(pos.x - P.pos.x, pos.z - P.pos.z), perto = clamp(1 - (d - 2) / 8, 0, 1);
    const notas = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319];
    const canto = 1 - perto * .8;
    if (n < 9) { const g = saida({ x: pos.x, y: 1.1, z: pos.z }, .8, 'ent'); osc('sine', notas[n % 10], t, 1, g); env(g, t, .003, (.09 + n * .012) * canto, .8); }
    const g2 = saida({ x: pos.x, y: 1.1, z: pos.z }, .5, 'ent'); burst(t, .3, 'bandpass', 3000, 5, g2); env(g2, t, .05, .06 * (.5 + perto), .2);
    if (n >= 6) {
      const fw = new THREE.Vector3(); camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
      const dir = n >= 8 ? { x: -fw.x, z: -fw.z } : { x: (pos.x - P.pos.x) / (d || 1), z: (pos.z - P.pos.z) / (d || 1) };
      const ouvido = { x: camera.position.x + dir.x * .9, y: camera.position.y, z: camera.position.z + dir.z * .9 };
      const g3 = AC.createGain(), p3 = novoPanner(.5, 1); posPanner(p3, ouvido); g3.connect(p3); p3.connect(BUS.corpo);
      for (const [k, fr] of [[0, 3200], [.16, 2600]]) { const s = ruido(), bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = fr; bp.Q.value = 4; s.connect(bp); bp.connect(g3); s.start(t + k, Math.random()); s.stop(t + k + .18); }
      env(g3, t, .03, .05 + .025 * (n - 6) + .04 * perto, .32);
    }
    if (n >= 9 && d < 10) {
      const t0 = t + .38; AUD.corte.gain.cancelScheduledValues(t); AUD.corte.gain.setValueAtTime(1, t0); AUD.corte.gain.linearRampToValueAtTime(0, t0 + .02); AUD.corte.gain.setValueAtTime(0, t0 + .3); AUD.corte.gain.linearRampToValueAtTime(1, t0 + .32);
      AUD.dezAte = t0 + .3;
    }
  },
  caixinha(x, z) {
    const notas = [659, 784, 659, 523, 587, 494, 523, 440, 0, 659, 784, 880, 784, 659, 587, 523, 466]; const t = AC.currentTime + .7;
    for (let i = 0; i < 8; i++) { const g = saida({ x, y: 1, z }, .3); burst(t - .7 + i * .08, .015, 'highpass', 3500, 2, g); env(g, t - .7 + i * .08, .001, .1, .015); }
    SOM.silencio(10, .2);
    notas.forEach((f, i) => { if (!f) return; const g = saida({ x, y: 1, z }, .7); const at = t + i * .42 * (1 + i * .03); osc('sine', f * (i === 16 ? .97 : .995) + Math.random() * 3, at, 1.6, g); env(g, at, .002, .08, i === 16 ? 2.4 : 1.2); });
  },
  chamadoVoz(x, z) {
    let t = AC.currentTime; const p = { x, y: 1.4, z }, falso = S && (S.mortes >= 3 || S.dif === 'pesadelo') && Math.random() < .35;
    if (S && S.chapter >= 4 && Math.random() < .6) { const g = saida(p, .4); burst(t, .05, 'highpass', 3000, 1, g); env(g, t, .001, .2, .03); const g2 = saida({ x, y: .1, z }, .4); burst(t + .35, .12, 'lowpass', 900, 1, g2); env(g2, t + .35, .005, .2, .09); t += .8; }
    silaba(t, p, 330, 'i', .35, .12, 'voz', .9);
    const o = silaba(t + .38, p, falso ? 140 : 262, 'a', .5, .12, 'voz', .9);
    if (falso) { o.frequency.linearRampToValueAtTime(70, t + .9); const ws = AC.createWaveShaper(); ws.curve = curvaDist(15); const g = saida(p, .6, 'ent'); ws.connect(g); const o2 = AC.createOscillator(); o2.type = 'sawtooth'; o2.frequency.setValueAtTime(70, t + .5); o2.frequency.linearRampToValueAtTime(48, t + 1); o2.connect(ws); env(g, t + .5, .1, .06, .5); o2.start(t + .5); o2.stop(t + 1.1); }
  },
  canto(dur) {
    if (AMB.canto) return;
    const t = AC.currentTime, ini = PROC.ini ? { x: (PROC.ini.x0 + PROC.ini.x1) / 2, y: 1.2, z: (PROC.ini.z0 + PROC.ini.z1) / 2 } : { x: P.pos.x + 6, y: 1.2, z: P.pos.z };
    const F = fonteFixa(ini, 'amb', .6), g = AC.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16, t + dur * .8); g.connect(F.g);
    const nodes = [];
    for (const f of [146.8, 174.6, 220, 293.7]) {
      const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * rand(.995, 1.005);
      const f1 = AC.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 700; f1.Q.value = 5;
      const lfo = AC.createOscillator(); lfo.frequency.value = rand(.3, .6); const lg = AC.createGain(); lg.gain.value = 250; lfo.connect(lg); lg.connect(f1.frequency);
      o.connect(f1); f1.connect(g); o.start(t); lfo.start(t); nodes.push(o, lfo);
    }
    const eg = AC.createGain(); eg.gain.value = 0; eg.connect(g);
    for (const f of [155.6, 207.7, 311.1]) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 4; o.connect(bp); bp.connect(eg); o.start(t); nodes.push(o); }
    const semPos = AC.createGain(); semPos.gain.value = .25; g.connect(semPos); semPos.connect(BUS.amb);
    AMB.canto = { g, nodes, F, extra: eg };
  },
  pararCanto() { if (!AMB.canto) return; const { g, nodes, F } = AMB.canto; const t = AC.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(.0002, g.gain.value), t); g.gain.exponentialRampToValueAtTime(.0001, t + 1.5); nodes.forEach(n => n.stop(t + 1.6)); depois(1800, () => FONTES.delete(F)); AMB.canto = null; },
  procissao() { const t = AC.currentTime, g = saida(null, .8, 'mus'); burst(t, 1.5, 'lowpass', 500, 1, g, 0); env(g, t, .05, .9, 1.4); SOM.susto(); },
  procissaoPos(pos) {
    const t = AC.currentTime; if (t < AUD.procT) return; AUD.procT = t + rand(.09, .15);
    const i = Math.random() * 9 | 0, g = saida({ x: pos.x + (i % 3 - 1) * .5, y: .1, z: pos.z + (i / 3 | 0) * .9 - .9 }, .3, 'ent');
    burst(t, .07, 'bandpass', rand(500, 800), 1.2, g); env(g, t, .003, .35, .06);
  },
  gerador(on, pos) {
    if (on && !AMB.ger) {
      const t = AC.currentTime; pos = pos || { x: P.pos.x, y: 1, z: P.pos.z };
      const F = fonteFixa(pos, 'amb', .1);
      const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(18, t); o.frequency.linearRampToValueAtTime(48, t + 2.2);
      const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; o.connect(lp);
      const am = AC.createGain(); am.gain.value = .6; const lfo = AC.createOscillator(); lfo.frequency.setValueAtTime(4, t); lfo.frequency.linearRampToValueAtTime(12.5, t + 2.2); const lg = AC.createGain(); lg.gain.value = .4; lfo.connect(lg); lg.connect(am.gain); lp.connect(am);
      const n = ruido(true), nf = AC.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 900; nf.Q.value = 1; const ng = AC.createGain(); ng.gain.value = .08; n.connect(nf); nf.connect(ng); ng.connect(am);
      am.connect(F.g);
      const G = F.g.gain; G.setValueAtTime(.0001, t); G.linearRampToValueAtTime(.4, t + .1); G.linearRampToValueAtTime(.05, t + .4); G.linearRampToValueAtTime(.5, t + .6); G.linearRampToValueAtTime(.08, t + .9); G.linearRampToValueAtTime(.55, t + 1.3); G.linearRampToValueAtTime(.5, t + 2);
      o.start(t); lfo.start(t); n.start(t);
      AMB.ger = { o, lfo, n, F, pos: { x: pos.x, z: pos.z } };
    } else if (!on && AMB.ger) {
      const t = AC.currentTime, G = AMB.ger; G.F.g.gain.cancelScheduledValues(t); G.F.g.gain.setTargetAtTime(0, t, .3); G.o.frequency.setTargetAtTime(20, t, .5);
      for (const x of [G.o, G.lfo, G.n]) x.stop(t + 1.8); depois(2000, () => FONTES.delete(G.F)); AMB.ger = null;
    }
  },
  motor(on) {
    if (on && !AMB.motor) {
      const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 38; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 160; const g = AC.createGain(); g.gain.value = .16;
      const rpm = AC.createOscillator(); rpm.frequency.value = .3; const rg = AC.createGain(); rg.gain.value = 3; rpm.connect(rg); rg.connect(o.frequency);
      const bat = AC.createOscillator(); bat.frequency.value = 25; const bg = AC.createGain(); bg.gain.value = .04; bat.connect(bg); bg.connect(g.gain);
      o.connect(f); f.connect(g); g.connect(BUS.amb); o.start(); rpm.start(); bat.start(); AMB.motor = { o, g, extra: [rpm, bat] };
    } else if (!on && AMB.motor) { const t = AC.currentTime; AMB.motor.g.gain.cancelScheduledValues(t); AMB.motor.g.gain.setValueAtTime(.16, t); AMB.motor.g.gain.exponentialRampToValueAtTime(.0001, t + .8); AMB.motor.o.frequency.linearRampToValueAtTime(22, t + .8); for (const x of [AMB.motor.o, ...AMB.motor.extra]) x.stop(t + .9); AMB.motor = null; }
  },
  freada() {
    const t = AC.currentTime, g = saida(null, .2); const f = burst(t, 1.6, 'bandpass', 2600, 6, g); f.frequency.linearRampToValueAtTime(1400, t + 1.5); env(g, t, .05, .5, 1.4);
    const g2 = saida(null, .2); const f2 = burst(t, 1.5, 'bandpass', 5200, 8, g2); f2.frequency.linearRampToValueAtTime(2800, t + 1.4); env(g2, t, .05, .15, 1.3);
    const g3 = saida(null, .4); burst(t + 1.45, .3, 'lowpass', 250, 1, g3, 0); env(g3, t + 1.45, .005, .6, .3);
  },
  orelhao(pos) {
    const t = AC.currentTime;
    for (let r = 0; r < 3; r++) { const g = saida(pos, .3); for (const f of [920, 1380, 2210]) osc('sine', f, t + r * 3, 1.2, g); g.gain.setValueAtTime(0, t + r * 3); for (let i = 0; i < 24; i++) g.gain.setValueAtTime(i % 2 ? .005 : .04, t + r * 3 + i * .05); g.gain.setValueAtTime(0, t + r * 3 + 1.2); }
  },
  cavar() {
    const t = AC.currentTime, g = saida(null, .2); burst(t, .3, 'lowpass', rand(550, 800), 1, g); env(g, t, .01, .5, .25);
    const g2 = saida(null, .2); burst(t, .12, 'highpass', 2500, .7, g2); env(g2, t, .005, .12, .1);
    for (let i = 0; i < 3; i++) { const k = .2 + rand(0, .25), g3 = saida(null, .2); burst(t + k, .02, 'bandpass', rand(1800, 3000), 5, g3); env(g3, t + k, .001, .06, .02); }
  },
  corda() {
    const t = AC.currentTime, g = saida(null, .3); const f = burst(t, .5, 'bandpass', rand(300, 900), 2, g); f.frequency.linearRampToValueAtTime(rand(300, 600), t + .5); env(g, t, .08, .35, .4);
    SOM.rangido(P.pos.x, 3, P.pos.z, .7);
    if (t - AUD.cordaT > 1.5) AUD.cordaN = 0; AUD.cordaT = t; AUD.cordaN++;
    if (AUD.cordaN % 2 === 0) SOM.sino(Math.min(.7, .1 + AUD.cordaN * .1), { x: P.pos.x, y: 6, z: P.pos.z });
  },
  valvula(pos) {
    SOM.rangido(pos ? pos.x : P.pos.x, 1, pos ? pos.z : P.pos.z, 1); const t = AC.currentTime, g = saida(pos || null, .6); const o = AC.createOscillator(); o.type = 'square'; o.frequency.value = 55; o.connect(g); env(g, t, .02, .15, .5); o.start(t); o.stop(t + .6);
    const g2 = saida(pos || null, .5); const f = burst(t, .5, 'bandpass', 3200, 12, g2); f.frequency.linearRampToValueAtTime(2400, t + .5); env(g2, t, .05, .1, .4);
    const g3 = saida(pos || null, .6); burst(t + .2, .6, 'lowpass', 900, 1, g3); env(g3, t + .2, .1, .12, .45);
  },
  cano(pos) {
    const t = AC.currentTime;
    for (let i = 0; i < 4; i++) { const g = saida(pos || null, .8); osc('triangle', rand(80, 160), t + i * .18, .5, g); osc('sine', rand(600, 900), t + i * .18, .4, g); env(g, t + i * .18, .003, .5, .4); }
    const g = saida(pos || null, .7); burst(t + .3, 1.6, 'lowpass', 700, 1, g); env(g, t + .3, .3, .25, 1.2);
  },
  forcar() { const t = AC.currentTime, g = saida(null, .4); burst(t, .25, 'lowpass', 400, 1, g); env(g, t, .01, .5, .2); SOM.rangido(P.pos.x, 1, P.pos.z, .6); if (Math.random() < .4) { const g2 = saida(null, .4); burst(t + .15, .05, 'highpass', 2000, 1, g2); env(g2, t + .15, .001, .25, .05); } },
  fitaClique() {
    const t = AC.currentTime;
    for (const [k, f, v] of [[0, 1500, .5], [.07, 900, .35]]) { const g = saida(null, .1); burst(t + k, .05, 'bandpass', f, 3, g); env(g, t + k, .001, v, .04); }
    const g = saida(null, 0); const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(90, t + .1); o.frequency.linearRampToValueAtTime(140, t + .35); const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; o.connect(lp); lp.connect(g); env(g, t + .1, .05, .03, .25); o.start(t + .1); o.stop(t + .45);
  },
  chiadoFita(on) {
    if (on && !AMB.fita) {
      const t = AC.currentTime, nodes = [];
      const s = ruido(true), f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3500; const g = AC.createGain(); g.gain.value = .025; s.connect(f); f.connect(g); g.connect(BUS.voz); s.start(); nodes.push(s);
      const wow = AC.createOscillator(); wow.frequency.value = .6; const wg = AC.createGain(); wg.gain.value = 600; wow.connect(wg); wg.connect(f.frequency); wow.start(); nodes.push(wow);
      const hum = AC.createOscillator(); hum.frequency.value = 50; const hg = AC.createGain(); hg.gain.value = .006; hum.connect(hg); hg.connect(BUS.voz); hum.start(); nodes.push(hum);
      const m = ruido(true), mb = AC.createBiquadFilter(); mb.type = 'bandpass'; mb.frequency.value = 700; mb.Q.value = 3; const mh = AC.createBiquadFilter(); mh.type = 'highpass'; mh.frequency.value = 300; const ml = AC.createBiquadFilter(); ml.type = 'lowpass'; ml.frequency.value = 3400;
      const mg = AC.createGain(); mg.gain.value = 0; const sil = AC.createOscillator(); sil.frequency.value = 4.3; const sg = AC.createGain(); sg.gain.value = .012; sil.connect(sg); sg.connect(mg.gain); const fr = AC.createOscillator(); fr.frequency.value = 1.7; const fg = AC.createGain(); fg.gain.value = 300; fr.connect(fg); fg.connect(mb.frequency);
      m.connect(mb); mb.connect(mh); mh.connect(ml); ml.connect(mg); mg.connect(BUS.voz); m.start(t); sil.start(t); fr.start(t); nodes.push(m, sil, fr);
      AMB.fita = { nodes, stop: () => nodes.forEach(n => n.stop()) };
    } else if (!on && AMB.fita) {
      AMB.fita.stop(); AMB.fita = null;
      if (M.ativo && S && !S.dead && M.pos.distanceTo(P.pos) < 15) depois(1200, () => { if (M.ativo && !S.dead) SOM.estalo(M.pos, 1); });
    }
  },
  trovao() {
    const fora = !!(P.room && P.room.fora), t = AC.currentTime + rand(.4, 1.8);
    AUD.trovaoIni = t; AUD.trovaoAte = t + 3.5;
    const g = saida(null, .7, 'amb'); burst(t, 3.6, 'lowpass', fora ? 260 : 140, 1, g, 0); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(fora ? 1.4 : .45, t + .15); g.gain.exponentialRampToValueAtTime(.0001, t + 3.5);
    const g2 = saida(null, .7, 'amb'); burst(t + 1.1, 2, 'lowpass', fora ? 180 : 110, 1, g2, 0); g2.gain.setValueAtTime(.0001, t + 1.1); g2.gain.exponentialRampToValueAtTime(fora ? .7 : .25, t + 1.4); g2.gain.exponentialRampToValueAtTime(.0001, t + 3.1);
    if (fora && Math.random() < .6) { const g3 = saida(null, .5, 'amb'); burst(t - .05, .25, 'highpass', 1200, .7, g3); env(g3, t - .05, .002, .45, .3); }
  },
  voz(pos, texto) {
    const t = AC.currentTime, d = Math.hypot(pos.x - P.pos.x, pos.z - P.pos.z), p = { x: pos.x, y: 2.8, z: pos.z };
    let falou = false;
    if (texto && OPT.falada && window.speechSynthesis && window.SpeechSynthesisUtterance) {
      try { const v = speechSynthesis.getVoices().find(v => /^pt[-_]BR/i.test(v.lang)); if (v) { const u = new SpeechSynthesisUtterance(texto); u.voice = v; u.lang = 'pt-BR'; u.pitch = .1; u.rate = .6; u.volume = clamp(OPT.vol * OPT.vVoz * (1.2 - d / 20), .05, 1); speechSynthesis.cancel(); speechSynthesis.speak(u); falou = true; } } catch (e) {}
    }
    const k = falou ? .4 : 1;
    for (const [f0, ff, q] of [[62, 300, 3], [93, 820, 5]]) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f0; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = ff; f.Q.value = q; const lfo = AC.createOscillator(); lfo.frequency.value = 11; const lg = AC.createGain(); lg.gain.value = f0 * .28; lfo.connect(lg); lg.connect(o.frequency); const g = saida(p, .6, 'voz'); o.connect(f); f.connect(g); env(g, t, .2, .55 * k * (f0 > 80 ? .4 : 1), 1.6); o.start(t); lfo.start(t); o.stop(t + 2); lfo.stop(t + 2); }
    const g = saida(p, .4, 'voz'); burst(t, 1.8, 'bandpass', 1400, 1.5, g); env(g, t, .2, .08 * k, 1.5);
  },
  suspiro(pos) {
    const t = AC.currentTime, p = { x: pos.x, y: 2.8, z: pos.z }, g = saida(p, .6, 'voz'); const f = burst(t, 1.9, 'lowpass', 900, 1, g, 0); f.frequency.linearRampToValueAtTime(400, t + 1.8); env(g, t, .4, .25, 1.5);
    const g2 = saida(p, .6, 'voz'), o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(58, t); o.frequency.linearRampToValueAtTime(44, t + 1.8); const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300; o.connect(lp); lp.connect(g2); env(g2, t, .5, .2, 1.4); o.start(t); o.stop(t + 2);
  },
  alivio() { const t = AC.currentTime; for (const [i, f] of [[0, 220], [1, 277.2], [2, 329.6]]) { const g = saida(null, .8, 'mus'); osc('sine', f, t + i * .12, 4.5, g); g.gain.setValueAtTime(.0001, t + i * .12); g.gain.exponentialRampToValueAtTime(.018, t + i * .12 + 1); g.gain.exponentialRampToValueAtTime(.0001, t + 4.4); } },
  pulso(v) { const t = AC.currentTime, g = saida(null, .2, 'amb'), o = AC.createOscillator(); o.frequency.setValueAtTime(48, t); o.frequency.exponentialRampToValueAtTime(36, t + .5); o.connect(g); env(g, t, .02, .3 * v, .55); o.start(t); o.stop(t + .65); },
  metal(v = 1) { const t = AC.currentTime, g = saida(null, .5, 'amb'); burst(t, .12, 'bandpass', rand(2000, 3500), 15, g); env(g, t, .001, .5 * v, .12); const g2 = saida(null, .3, 'amb'); osc('triangle', rand(90, 120), t, .2, g2); env(g2, t, .002, .15 * v, .15); },
  passosTeto() { const t = AC.currentTime, x0 = P.pos.x + rand(-4, 4), z0 = P.pos.z + rand(-4, 4), a = rand(0, 6.28), n = 4 + (Math.random() * 3 | 0); for (let i = 0; i < n; i++) { const pos = { x: x0 + Math.cos(a) * i * .7, y: 5.5, z: z0 + Math.sin(a) * i * .7 }, k = i * .62, g = saida(pos, .3, 'amb'); burst(t + k, .25, 'lowpass', 230, 1, g); env(g, t + k, .01, .5, .22); } depois(n * 300, () => SOM.rangido(x0, 5.5, z0, .25, 'amb')); },
  batidasChao() { const t = AC.currentTime, x = P.pos.x + rand(-3, 3), z = P.pos.z + rand(-3, 3); for (let i = 0; i < 3; i++) { const g = saida({ x, y: -2, z }, .4, 'amb'); burst(t + i * .45, .3, 'lowpass', 180, 1, g, 0); env(g, t + i * .45, .005, .7, .25); } },
  tremor() { const t = AC.currentTime, g = saida(null, .5, 'amb'), o = AC.createOscillator(); o.frequency.value = 28; o.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.35, t + .8); g.gain.exponentialRampToValueAtTime(.0001, t + 3.2); o.start(t); o.stop(t + 3.3); const g2 = saida(null, .4, 'amb'); burst(t, 3, 'lowpass', 120, 1, g2, 0); env(g2, t, .8, .4, 2.2); for (let i = 0; i < 6; i++) { const k = 1 + rand(0, 2), g3 = saida({ x: P.pos.x + rand(-3, 3), y: 2.5, z: P.pos.z + rand(-3, 3) }, .4, 'amb'); burst(t + k, .02, 'bandpass', rand(2000, 4000), 4, g3); env(g3, t + k, .001, .08, .02); } P.shake = Math.max(P.shake, .012); },
  predio() { const x = P.pos.x + rand(-7, 7), z = P.pos.z + rand(-7, 7), t = AC.currentTime; if (Math.random() < .5) SOM.rangido(x, 2.6, z, .35, 'amb'); else { const g = saida({ x, y: 2.6, z }, .5, 'amb'); burst(t, .05, 'bandpass', 1100, 4, g); env(g, t, .001, .3, .05); } },
  rato() { const t = AC.currentTime, x0 = P.pos.x + rand(-5, 5), z0 = P.pos.z + rand(-5, 5), dx = rand(-1, 1), dz = rand(-1, 1); for (let i = 0; i < 8; i++) { const g = saida({ x: x0 + dx * i * .4, y: .05, z: z0 + dz * i * .4 }, .2, 'amb'); burst(t + i * .07, .02, 'highpass', 3500, 1, g); env(g, t + i * .07, .001, .06, .02); } for (const k of [.2, .5]) { const g = saida({ x: x0, y: .1, z: z0 }, .3, 'amb'), o = AC.createOscillator(); o.frequency.setValueAtTime(3800, t + k); o.frequency.linearRampToValueAtTime(4600, t + k + .06); o.connect(g); env(g, t + k, .005, .015, .07); o.start(t + k); o.stop(t + k + .1); } },
  portaoVento() { const a = rand(0, 6.28), x = P.pos.x + Math.cos(a) * 18, z = P.pos.z + Math.sin(a) * 18; SOM.rangido(x, 1.5, z, .5, 'amb'); depois(800, () => { const t = AC.currentTime, g = saida({ x, y: 1.5, z }, .6, 'amb'); osc('triangle', 210, t, .4, g); osc('triangle', 317, t, .4, g); env(g, t, .002, .1, .35); }); }
};
// O que o barulho ao redor esconde: trovão (todo mundo) e o ronco do gerador (perto dele)
function mascaraSom(x, z) {
  let k = 1;
  if (AC && AC.currentTime > AUD.trovaoIni && AC.currentTime < AUD.trovaoAte) k *= .3;
  if (AMB.ger && Math.hypot(x - AMB.ger.pos.x, z - AMB.ger.pos.z) < 8) k *= .5;
  return k;
}
function silenciarContinuos() {
  const t = AC.currentTime;
  for (const n of [AMB.resp && AMB.resp.g, AMB.choro && AMB.choro.g, AMB.flash && AMB.flash.g, AMB.cordas, AMB.caca, AMB.violino, AMB.zumbido, ...(AMB.lamp || []).map(l => l.g)]) if (n) n.gain.setTargetAtTime(0, t, .1);
}
function perfilSala(r) {
  if (!r) return 'p';
  if (W.mapa === 'tuneis' || r.acustica === 'tunel') return 't';
  if (r.acustica) return r.acustica === 'grande' ? 'g' : 'p';
  if (r.fora) return 'fora';
  const lx = r.x1 - r.x0, lz = r.z1 - r.z0, area = lx * lz, longo = Math.max(lx, lz) / Math.max(1, Math.min(lx, lz));
  return area > 60 || (r.h || 3) > 4.5 || longo > 3.5 ? 'g' : 'p';
}
function updateAudio(dt) {
  if (!AC) return;
  try { updateAudioCore(dt); } catch (e) { if (!AUD.erroAvisado) { AUD.erroAvisado = true; console.warn('áudio', e); } }
}
function updateAudioCore(dt) {
  const L = AC.listener, p = camera.position, now = AC.currentTime;
  const fw = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion), up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  if (L.positionX) { L.positionX.value = p.x; L.positionY.value = p.y; L.positionZ.value = p.z; L.forwardX.value = fw.x; L.forwardY.value = fw.y; L.forwardZ.value = fw.z; L.upX.value = up.x; L.upY.value = up.y; L.upZ.value = up.z; }
  else { L.setPosition(p.x, p.y, p.z); L.setOrientation(fw.x, fw.y, fw.z, up.x, up.y, up.z); }
  const fora = !!(P.room && P.room.fora), subsolo = W.mapa === 'tuneis', jogando = mode === 'jogo' && S && !S.dead;
  // Ambiente: chuva abafada dentro, quase sumida debaixo da terra, mais forte no telhado do andar de cima
  AMB.chuva.gain.value = lerp(AMB.chuva.gain.value, subsolo ? .012 : fora ? .14 : W.mapa === 'superior' ? .05 : .03, dt * 2);
  AMB.chuvaF.frequency.value = lerp(AMB.chuvaF.frequency.value, subsolo ? 300 : fora ? 3000 : 500, dt * 2);
  const rajada = .5 + .5 * Math.sin(perf * .23) * Math.sin(perf * .61);
  AMB.vento.gain.value = lerp(AMB.vento.gain.value, subsolo ? .012 : fora ? .03 + .07 * rajada : .02, dt * 1.5);
  if (!S) return;
  const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99, dA = ANA.ativa ? ANA.pos.distanceTo(P.pos) : 99, est = M.ativo ? M.state : null;
  const prende = !!(S.hidden && keys.Space && S.stamina > 0 && jogando);
  // --- Reverb pela sala onde você está
  if (P.room && AUD.sala !== P.room) { AUD.sala = P.room; const k = perfilSala(P.room); for (const [c, s] of Object.entries(AUD.rev)) s.gain.setTargetAtTime(k === 'fora' ? (c === 'p' ? .3 : 0) : c === k ? 1 : 0, now, .5); }
  // --- Oclusão das fontes contínuas
  AUD.ocT -= dt; if (AUD.ocT <= 0) { AUD.ocT = .3; for (const F of FONTES) atualizarOclusao(F); }
  // --- Música por estado do Inspetor
  let lPulso = 0, lCordas = 0, lCaca = 0, lZ = 0;
  if (est === 'caca') { lCaca = .6 + .4 * clamp(1 - dM / 20, 0, 1); AUD.posCacaT = 4; }
  else if (est === 'investiga') lCordas = dM < 22 ? 1 : .4;
  else if (est === 'procura') { lCordas = dM < 18 ? .6 : .25; lZ = dM < 18 ? 1 : .3; }
  if (M.ativo && dM < 14) lPulso = clamp(1.3 - dM / 14, 0, 1);
  AUD.posCacaT -= dt;
  if (AUD.posCacaT > 0 && est !== 'caca') { lPulso = 1; lCordas = 0; lZ = 0; }
  if (PROC.fase) lCordas = Math.max(lCordas, .5);
  if (ANA.ativa) lZ = Math.max(lZ, .6 * clamp(1 - dA / 12, 0, 1));
  if (!jogando) lPulso = lCordas = lCaca = lZ = 0;
  AMB.cordas.gain.setTargetAtTime(lCordas * .022, now, .5); AMB.caca.gain.setTargetAtTime(lCaca * .07, now, .5);
  AMB.violino.gain.setTargetAtTime(lCaca * .01, now, .5); AMB.zumbido.gain.setTargetAtTime(lZ * .0035, now, .5);
  if (est === 'caca') {
    AUD.cacaT += dt; if (AUD.cacaT > 3 && AUD.cacaSemi < 6) { AUD.cacaT = 0; AUD.cacaSemi++; for (const o of AMB.cacaOsc) o.detune.setTargetAtTime(AUD.cacaSemi * 100, now, .3); AMB.violinoO.frequency.setTargetAtTime(880 * Math.pow(2, AUD.cacaSemi / 12) * rand(.98, 1.02), now, .8); }
    AUD.percT -= dt; if (AUD.percT <= 0) { AUD.percT = clamp(.3 + dM * .06, .3, 1.1); SOM.metal(.6 + .4 * clamp(1 - dM / 15, 0, 1)); }
  } else if (AUD.cacaSemi) { AUD.cacaSemi = 0; AUD.cacaT = 0; for (const o of AMB.cacaOsc) o.detune.setTargetAtTime(-300, now, 1.2); AMB.violinoO.frequency.setTargetAtTime(660, now, 1); }
  AUD.pulsoT -= dt; if (lPulso > .05 && AUD.pulsoT <= 0) { AUD.pulsoT = dM < 6 ? 1.2 : 2; SOM.pulso(lPulso); }
  // Mudanças de estado: suspiro quando ele perde a pista, acorde de alívio quando desiste
  if (est !== AUD.estPrev) {
    if (AUD.estPrev === 'caca' && est === 'procura') SOM.suspiro(M.pos);
    if ((AUD.estPrev === 'procura' || AUD.estPrev === 'investiga') && est === 'patrulha' && dM < 25 && jogando) SOM.alivio();
    AUD.estPrev = est;
  }
  // --- Vácuo: o silêncio que avisa
  let vac = 1;
  for (const w of AUD.sils) if (now < w.ate) vac = Math.min(vac, w.nivel);
  if (fitaTocando) vac = Math.min(vac, .35);
  if (ANA.ativa && !ANA.vista && ANA.conta >= 7 && dA < 12) vac = Math.min(vac, .18);
  if (PROC.fase === 'aviso' && PROC.t < 1.6) vac = Math.min(vac, .06);
  if (prende) vac = Math.min(vac, .45);
  if (!S.dead) { const cur = AUD.vacuo.gain.value; AUD.vacuo.gain.setTargetAtTime(vac, now, vac < cur ? .17 : .6); }
  // --- Abafar: armário, cama, medo extremo, ferida, morte
  let corte = 20000;
  if (S.hidden) corte = S.hidden.tipo === 'cama' ? 2000 : 1200;
  else if (S.fear > 90) corte = 2600;
  if (S.health < 30) corte = Math.min(corte, 3200);
  if (S.dead) corte = 500;
  AUD.abafa.frequency.setTargetAtTime(corte, now, .1);
  AUD.madeiraG.gain.setTargetAtTime(S.hidden && S.hidden.tipo !== 'cama' ? .3 : 0, now, .1);
  AUD.mundo.gain.setTargetAtTime(S.dead ? .15 : now < AUD.zumbidoAte ? .3 : 1, now, S.dead ? 1 : .8);
  // --- Gerador: perto dele você some, mas fica surda para ele
  const entK = AMB.ger && Math.hypot(P.pos.x - AMB.ger.pos.x, P.pos.z - AMB.ger.pos.z) < 8 ? .4 : 1;
  if (entK !== AUD.entK) { AUD.entK = entK; aplicarVolumes(); }
  // --- Coração: só quando importa, pela distância real do perigo
  let perigo = 0;
  if (M.ativo) perigo = Math.max(perigo, clamp(1 - dM / 14, 0, 1) * (est === 'caca' ? 1 : .8), est === 'caca' ? .55 : 0);
  if (ANA.ativa) perigo = Math.max(perigo, clamp(1 - dA / 9, 0, 1));
  if (PROC.fase) perigo = Math.max(perigo, PROC.fase === 'passando' ? 1 : .6);
  perigo = Math.max(perigo, clamp((S.fear - 70) / 30, 0, 1) * .6);
  if (!jogando) perigo = 0;
  AUD.coracaoN = perigo > AUD.coracaoN ? lerp(AUD.coracaoN, perigo, Math.min(1, dt * 2.5)) : Math.max(perigo, AUD.coracaoN - dt / 6);
  AUD.hbT -= dt;
  if (AUD.coracaoN > .06 && AUD.hbT <= 0 && jogando) {
    const n = AUD.coracaoN; AUD.hbT = 60 / (60 + 95 * n);
    SOM.coracao((.35 + .65 * n) * (S.hidden ? 1.4 : 1) * (prende ? 1.3 : 1));
    if (S.hidden && S.fear > 88 && M.ativo && dM < 1.8 && !prende) { if (!AUD.avisouCoracao) { AUD.avisouCoracao = true; sub('inspetor', 'Eu ouço o seu coração.'); } else emitNoise(P.pos.x, P.pos.z, 1.4, true); }
  }
  // --- Respiração da Lia
  const esforco = clamp((60 - S.stamina) / 60, 0, 1);
  AUD.resp += dt * (.22 + S.fear / 100 * .55 + esforco * .7) * Math.PI * 2;
  const ciclo = Math.sin(AUD.resp), insp = ciclo > 0;
  let amp = (.004 + S.fear / 100 * .02 + esforco * .03) * (S.hidden ? 1.4 : 1);
  if (S.fear > 80) amp *= 1 + Math.sin(perf * 44) * .35;
  AMB.resp.g.gain.setTargetAtTime(prende || !jogando ? 0 : amp * ciclo * ciclo, now, prende ? .01 : .04);
  AMB.resp.f.frequency.setTargetAtTime(insp ? 1500 : 950, now, .08);
  AMB.choro.g.gain.setTargetAtTime(jogando && S.health < 30 && !prende && !insp ? .005 * ciclo * ciclo : 0, now, .05);
  AMB.choro.o.frequency.setTargetAtTime(300 + Math.sin(perf * 9) * 25, now, .05);
  if (AUD.prendia && !prende && S.hidden && jogando) { SOM.arfar(); if (M.ativo && dM < 3) emitNoise(P.pos.x, P.pos.z, 1.5, true); }
  AUD.prendia = prende;
  if (prende) S.fear = Math.max(0, S.fear - 5 * dt);
  // --- Lanterna: zumbido baixo e o tique quando falha
  const acesa = jogando && S.flashOn && !flashPisca;
  AMB.flash.g.gain.setTargetAtTime(acesa ? .0025 * (S.battery < 18 ? .4 + Math.random() : 1) : 0, now, .02);
  if (jogando && S.flashOn && flashPisca && !AUD.flashPrev && now > AUD.tiqueT) { AUD.tiqueT = now + .08; SOM.tique(); }
  AUD.flashPrev = flashPisca;
  // --- Lâmpadas que zumbem (e desafinam perto dele)
  AUD.lampT -= dt;
  if (AUD.lampT <= 0) {
    AUD.lampT = .4;
    const perto = jogando && P.room ? W.lampadas.filter(Lp => Lp.ligada && Lp.luz.intensity > .5 && Math.hypot(Lp.x - P.pos.x, Lp.z - P.pos.z) < 9 && salaAdj(roomAt(Lp.x, Lp.z), P.room)).sort((a, b) => Math.hypot(a.x - P.pos.x, a.z - P.pos.z) - Math.hypot(b.x - P.pos.x, b.z - P.pos.z)).slice(0, 3) : [];
    AMB.lamp.forEach((v, i) => {
      const Lp = perto[i];
      if (!Lp) { v.g.gain.setTargetAtTime(0, now, .2); return; }
      posPanner(v.p, { x: Lp.x, y: 2.6, z: Lp.z });
      const mal = (M.ativo && Math.hypot(M.pos.x - Lp.x, M.pos.z - Lp.z) < 6) || PROC.fase;
      v.o.detune.setTargetAtTime(mal ? rand(-90, 90) : 0, now, .1);
      v.g.gain.setTargetAtTime(Lp.luz.intensity < Lp.base * .3 ? 0 : (mal ? rand(.004, .02) : .008), now, .1);
    });
  }
  // --- Canto da Procissão vem de onde ela vai nascer, e depois anda com ela
  if (AMB.canto) {
    const alvo = PROC.fase === 'passando' ? PROC.pos : PROC.ini ? { x: (PROC.ini.x0 + PROC.ini.x1) / 2, z: (PROC.ini.z0 + PROC.ini.z1) / 2 } : null;
    if (alvo) moverFonte(AMB.canto.F, { x: alvo.x, y: 1.2, z: alvo.z });
    AMB.canto.extra.gain.setTargetAtTime(PROC.fase === 'passando' ? .5 : 0, now, .4);
  }
  // --- Passinhos da Ana quando ninguém está olhando
  if (ANA.ativa && !ANA.vista) { if (!AUD.anaPrev) AUD.anaPrev = ANA.pos.clone(); if (ANA.pos.distanceTo(AUD.anaPrev) > .55) { AUD.anaPrev.copy(ANA.pos); if (dA < 10 && jogando) SOM.anaPasso(ANA.pos); } } else AUD.anaPrev = null;
  // --- O prédio respira: sons raros nas calmarias
  AUD.evT -= dt;
  if (AUD.evT <= 0 && jogando && P.room) {
    AUD.evT = rand(30, 65);
    if (!(M.ativo && dM < 16) && !PROC.fase && !ANA.ativa) {
      const m = W.mapa;
      if (fora) SOM.portaoVento();
      else if (m === 'terreo' && Math.random() < .5) SOM.passosTeto();
      else if (m === 'superior' && Math.random() < .5) SOM.batidasChao();
      else if (m === 'tuneis' && Math.random() < .5) SOM.tremor();
      else if (Math.random() < .5) SOM.rato(); else SOM.predio();
    }
  }
  // drone respira com o perigo
  AMB.drone.gain.setTargetAtTime(.03 + .03 * AUD.coracaoN, now, 1);
}
// Pausa e diário abafam o mundo; menu silencia o que é contínuo; aba escondida suspende o áudio
setInterval(() => {
  try {
    if (!AC) return;
    const pausado = ui === 'pausa' || ui === 'diario', parado = pausado || !(mode === 'jogo' || mode === 'cena') || (S && S.fim);
    if (pausado !== AUD.pausado) { AUD.pausado = pausado; const t = AC.currentTime; AUD.abafa.frequency.setTargetAtTime(pausado ? 650 : 20000, t, .08); AUD.mundo.gain.setTargetAtTime(pausado ? .5 : 1, t, .15); }
    if (parado) silenciarContinuos();
  } catch (e) {}
}, 150);
document.addEventListener('visibilitychange', () => { try { if (!AC) return; if (document.hidden) AC.suspend(); else AC.resume(); } catch (e) {} });
for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { try { if (AC && AC.state === 'suspended' && !document.hidden) AC.resume(); } catch (e) {} });
// Opções de som (volumes separados, mono, som noturno, voz falada)
(function opcoesSom() {
  const campos = [['vAmb', 'Ambiente e música'], ['vEnt', 'Criaturas'], ['vSfx', 'Efeitos'], ['vVoz', 'Vozes e fitas']];
  const chk = [['mono', 'Áudio mono'], ['noturno', 'Som noturno'], ['falada', 'Voz falada do Inspetor']];
  const html = p => campos.map(([k, n]) => `<label>${n} <input type="range" id="${p}-${k}" min="0" max="1.5" step="0.05"></label>`).join('') + chk.map(([k, n]) => `<label><input type="checkbox" id="${p}-${k}"> ${n}</label>`).join('');
  const st = document.createElement('style');
  st.textContent = '.som-extra{margin-top:10px;font-family:"IM Fell English SC",serif;font-size:14px;letter-spacing:.08em;color:var(--fraco,#888);width:100%;text-align:center}.som-extra summary{cursor:pointer;list-style:none}.som-extra summary::-webkit-details-marker{display:none}.som-extra summary::before{content:"+ "}.som-extra[open] summary::before{content:"− "}.som-grade{display:flex;flex-wrap:wrap;gap:10px 22px;justify-content:center;margin-top:10px}.som-grade label{display:flex;align-items:center;gap:8px}';
  document.head.appendChild(st);
  for (const [p, sel, tit] of [['o', '#title .opts', 'Som'], ['p', '#pause .set', 'Mais opções de som']]) {
    const alvo = $(sel); if (!alvo) continue;
    const d = document.createElement('details'); d.className = 'som-extra'; d.innerHTML = `<summary>${tit}</summary><div class="som-grade">${html(p)}</div>`; alvo.appendChild(d);
  }
  const setSom = (k, v) => {
    OPT[k] = +v; lsSet(OPT_KEY, OPT);
    for (const p of ['o', 'p']) { const el = $(`#${p}-${k}`); if (!el) continue; if (el.type === 'checkbox') el.checked = !!OPT[k]; else el.value = OPT[k]; }
    if (!AC) return;
    if (k === 'noturno') aplicarNoturno(); else aplicarVolumes();
    if (k === 'falada' && !OPT.falada && window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {}
  };
  for (const p of ['o', 'p']) {
    for (const [k] of campos) { const el = $(`#${p}-${k}`); if (el) { el.value = OPT[k]; el.oninput = e => setSom(k, e.target.value); } }
    for (const [k] of chk) { const el = $(`#${p}-${k}`); if (el) { el.checked = !!OPT[k]; el.onchange = e => setSom(k, e.target.checked ? 1 : 0); } }
  }
})();

// =====================================================================
// CHUVA, RELÂMPAGO, LUZES
// =====================================================================
const NCH = 2200;
const chuvaGeo = new THREE.BufferGeometry(), chuvaPos = new Float32Array(NCH * 3);
for (let i = 0; i < NCH; i++) { chuvaPos[i * 3] = rand(-20, 20); chuvaPos[i * 3 + 1] = rand(0, 14); chuvaPos[i * 3 + 2] = rand(-20, 20); }
chuvaGeo.setAttribute('position', new THREE.BufferAttribute(chuvaPos, 3));
const chuva = new THREE.Points(chuvaGeo, new THREE.PointsMaterial({ color: 0x8a96aa, size: .045, transparent: true, opacity: .55, depthWrite: false }));
chuva.frustumCulled = false; scene.add(chuva);
let raioT = 8, raioI = 0;
function updateClima(dt) {
  const fora = !!(P.room && P.room.fora);
  chuva.visible = fora;
  if (fora) {
    chuva.position.set(camera.position.x, 0, camera.position.z);
    const a = chuvaGeo.attributes.position.array;
    for (let i = 0; i < NCH; i++) { a[i * 3 + 1] -= 15 * dt; if (a[i * 3 + 1] < 0) a[i * 3 + 1] = 14; }
    chuvaGeo.attributes.position.needsUpdate = true;
  }
  raioT -= dt;
  if (raioT <= 0 && W.mapa !== 'tuneis') { raioT = rand(14, 38); raioI = 1; SFX.trovao(); if (S && P.room && !P.room.fora) S.fear = Math.min(100, S.fear + 4); }
  raioI = Math.max(0, raioI - dt * 2.4);
  const fl = raioI > 0 && Math.random() < .7 ? raioI : 0, semCeu = W.mapa === 'tuneis';
  luzBase = lerp(luzBase, fora ? 1 : 0, Math.min(1, dt * 2));
  moon.intensity = lerp(ambDentro.moon, ambFora.moon, luzBase) + (semCeu ? 0 : fl * 3);
  hemi.intensity = lerp(ambDentro.hemi, ambFora.hemi, luzBase) + (semCeu ? 0 : fl * .7);
  scene.fog.density = lerp(ambDentro.fog, ambFora.fog, luzBase);
  if (!PROC.fase) for (const L of W.lampadas) {
    if (!L.ligada) continue;
    L.flick -= dt;
    if (L.flick < 0) { L.flick = rand(.05, 4); const off = Math.random() < .3; L.luz.intensity = off ? L.base * .08 : L.base * rand(.75, 1.05); L.bulbo.material.emissiveIntensity = off ? .2 : 2; }
  }
}

// =====================================================================
// HUD / UI
// =====================================================================
const ray = new THREE.Raycaster(); ray.far = 2.6;
function updateAlvo() {
  ray.setFromCamera({ x: 0, y: 0 }, camera);
  const vis = W.inter.filter(i => i.obj.visible && i.on());
  const hits = ray.intersectObjects([...W.solid, ...vis.map(i => i.obj)], true);
  alvo = null;
  for (const h of hits) { let o = h.object; while (o && !o.userData.it) o = o.parent; if (o && o.userData.it && vis.includes(o.userData.it)) alvo = o.userData.it; break; }
  if (S.hidden) alvo = W.inter.find(i => i.obj === S.hidden.g);
  let html = alvo ? alvo.label() : '';
  if (alvo && alvo.hold && html.startsWith('<b>E</b>')) html = html.replace('<b>E</b>', '<b>segure E</b>');
  if ($('#prompt').innerHTML !== html) $('#prompt').innerHTML = html;
}
function renderObj() {
  if (!S) return;
  const c = R.capitulos[S.chapter];
  $('#obj-cap').textContent = c.titulo;
  let liberado = true;
  $('#obj-list').innerHTML = c.objetivos.map(o => {
    const feito = S.done[o.id], cls = feito ? 'ok' : liberado ? '' : 'futuro'; if (!feito) liberado = false;
    return `<li class="${cls}">${o.texto.replace('{n}', contagem(o.id) ?? 0)}</li>`;
  }).join('');
}
function renderInvMini() {
  if (!S) return;
  const p = [];
  if (S.inv.pilhas) p.push(`Pilhas <em>${S.inv.pilhas}</em>`);
  if (S.inv.kits) p.push(`Curativos <em>${S.inv.kits}</em>`);
  if (S.inv.garrafas) p.push(`Garrafas <em>${S.inv.garrafas}</em>`);
  if (S.inv.reliquias) p.push(`Objetos <em>${S.inv.reliquias}</em>`);
  $('#inv-mini').innerHTML = p.join('<br>');
}
let filtroAtual = '';
function updateHUD() {
  $('#b-vida').style.setProperty('--v', S.health + '%');
  $('#b-folego').style.setProperty('--v', S.stamina + '%');
  $('#b-pilha').style.setProperty('--v', S.battery + '%');
  $('#bars').style.opacity = S.inv.lanterna ? 1 : .3;
  $('#fx-vignette').style.opacity = Math.min(1, .6 + S.fear / 100 * .4 + (S.health < 40 ? .2 : 0));
  const blur = S.fear > 75 ? ((S.fear - 75) / 25 * 1.6).toFixed(1) : 0;
  const filt = `blur(${blur}px) saturate(${(1 - S.fear / 160).toFixed(2)})` + (S.health < 35 ? ' sepia(.4) hue-rotate(-20deg)' : '');
  if (filtroAtual !== filt) { canvas.style.filter = filt; filtroAtual = filt; }
}
let subQ = [], subT = 0, subAtual = null;
function falar(chave) { const arr = R.falas[chave]; if (!arr) return; for (const f of arr) subQ.push(f); if (subT <= 0) proxSub(); }
function sub(quem, texto, prioridade) {
  if (prioridade) { subQ.unshift({ quem, texto, prioridade: true }); proxSub(); }
  else { subQ.unshift({ quem, texto }); if (!subAtual || !subAtual.prioridade) proxSub(); }
}
function subPequeno(quem, texto) { if (subAtual && subAtual.prioridade) return; subQ.unshift({ quem, texto, curta: true }); proxSub(); }
function proxSub() {
  const f = subQ.shift(), el = $('#sub'); subAtual = f || null;
  if (!f) { el.innerHTML = ''; subT = 0; return; }
  const p = R.personagens[f.quem] || { nome: f.quem, cor: '#fff' };
  el.innerHTML = `<span class="quem" style="color:${p.cor}">${p.nome}</span><span style="color:${p.cor}">${codTxt(f.texto)}</span>`;
  subT = f.curta ? 1.2 : 2.4 + f.texto.length * .055;
}
function updateSub(dt) { if (subT > 0) { subT -= dt; if (subT <= 0) proxSub(); } }
let toastT;
function toast(t) { const el = $('#toast'); el.textContent = t; el.style.opacity = 1; clearTimeout(toastT); toastT = setTimeout(() => el.style.opacity = 0, 2800); }
function cartaoCapitulo() { const el = $('#chapter'); el.textContent = R.capitulos[S.chapter].titulo; el.style.opacity = 1; setTimeout(() => el.style.opacity = 0, 3400); }
let cartaoTO;
function cartao(t, dur = 4) { const el = $('#cartao'); el.textContent = t; el.style.opacity = 1; clearTimeout(cartaoTO); cartaoTO = setTimeout(() => el.style.opacity = 0, dur * 1000); }
function fade(on, cb, ms = 650) { $('#fx-black').style.opacity = on ? 1 : 0; if (cb) setTimeout(cb, ms); }
let conqTO;
function conquista(id) {
  const c = lsGet(CONQ_KEY, {}); if (c[id]) return;
  const def = R.conquistas.find(x => x.id === id); if (!def) return;
  c[id] = Date.now(); lsSet(CONQ_KEY, c);
  const el = $('#conq'); el.innerHTML = `Conquista: ${def.nome}<small>${def.desc}</small>`; el.classList.add('on');
  clearTimeout(conqTO); conqTO = setTimeout(() => el.classList.remove('on'), 4200);
}

// Diário
let abaDiario = 'obj';
function abrirDiario() { ui = 'diario'; $('#diario').hidden = false; unlock(); renderDiario(); }
function fecharDiario() { $('#diario').hidden = true; ui = null; lockPointer(); }
$('#d-fechar').onclick = fecharDiario;
document.querySelectorAll('#diario nav .btn').forEach(b => b.onclick = () => { abaDiario = b.dataset.tab; document.querySelectorAll('#diario nav .btn').forEach(x => x.classList.toggle('on', x === b)); renderDiario(); });
function renderDiario() {
  const el = $('#d-pane');
  if (abaDiario === 'obj') {
    let h = '';
    R.capitulos.forEach((c, i) => {
      if (i > S.chapter) return;
      let liberado = true;
      h += `<h3>${c.titulo}</h3><ul style="list-style:none">` + c.objetivos.map(o => { const f = S.done[o.id]; if (!f && !liberado) return ''; if (!f) liberado = false; return `<li style="opacity:${f ? .45 : 1}">${f ? '✕' : '◇'} ${o.texto.replace(/\s*\(\{n\}\/\d\)/, '')}</li>`; }).join('') + '</ul>';
    });
    if (R.paginas.some(p => S.notes[p.id])) { const dg = ['p1', 'p2', 'p3', 'p4'].map((id, i) => S.notes[id] ? S.code[i] : '_').join(''); h += `<h3>Números do diário do Davi</h3><div class="digits">${dg}</div>`; }
    if (S.fitas.f1) h += `<h3>Quadro de chaves</h3><div class="digits">${S.quadro.join('')}</div>`;
    if (S.fitas.f2) h += `<h3>Ordem das válvulas</h3><div class="digits">${S.ordem.join('-')}</div>`;
    el.innerHTML = h;
  } else if (abaDiario === 'regras') {
    let h = S.flags.regras ? `<div class="paper" style="transform:none;width:100%;max-height:none"><h2>${R.regras.titulo}</h2><p>${R.regras.texto}</p></div>` : '<p style="color:var(--fraco)">Você ainda não tem as regras.</p>';
    h += '<h3>O que você já viu</h3>';
    const best = [];
    if (S.flags.avist) best.push(['O Inspetor', 'Cego. Caça pelo som e estala a língua para se localizar: dá para ouvir onde ele está. Aprenda os estalos: um clique grave, patrulha; dois, desconfiado; três subindo, procurando; rajada aguda, caçando você. Passos abafados vêm de trás de porta ou parede. Trovões e o ronco do gerador encobrem o seu barulho. Garrafas (G) o distraem. Escondida, prenda a respiração (ESPAÇO).']);
    if (S.flags.procAviso) best.push(['A Procissão', 'Luzes piscando e rádio chiando avisam. Entre num armário ou embaixo de uma cama antes que eles passem.']);
    if (S.flags.anaVista) best.push(['A Menina Que Conta', 'Só se mexe quando você não está olhando para ela com luz. Quando a lanterna pisca, ela avança. Não abre portas fechadas.']);
    if (S.flags.chamado1) best.push(['O Chamado', 'Alguém chama seu nome de uma sala vizinha. Não vá até lá.']);
    h += best.length ? best.map(([a, b]) => `<div style="padding:8px 0;border-bottom:1px solid #2c2720"><b style="font-family:'IM Fell English SC';font-weight:normal">${a}</b><br><span style="color:var(--fraco);font-style:italic">${b}</span></div>`).join('') : '<p style="color:var(--fraco)">Nada. Ainda.</p>';
    el.innerHTML = h;
  } else if (abaDiario === 'inv') {
    const I = S.inv, L = [];
    if (I.lanterna) L.push(['Lanterna', `pilha em ${Math.round(S.battery)}%`]);
    if (I.pilhas) L.push([`Pilhas ×${I.pilhas}`, 'R para trocar']);
    if (I.kits) L.push([`Curativos ×${I.kits}`, 'H para usar']);
    if (I.garrafas) L.push([`Garrafas ×${I.garrafas}`, 'G para jogar e distrair']);
    if (I.galao && !S.flags.energia) L.push(['Galão de gasolina', 'para o gerador']);
    if (I.fusiveis && !S.flags.energia) L.push([`Fusíveis ×${I.fusiveis}`, 'quadro da casa de máquinas']);
    if (I.engrenagens && !S.done.caixinha) L.push([`Engrenagens ×${I.engrenagens}`, 'caixinha de música']);
    if (I.pa) L.push(['Pá', 'para cavar']);
    for (const v of Object.values(I.chaves)) if (v) L.push([v, 'chave']);
    if (I.reliquias) L.push([`Objetos das crianças ×${I.reliquias}`, 'levar ao altar']);
    el.innerHTML = L.length ? L.map(([a, b]) => `<div style="padding:8px 0;border-bottom:1px solid #2c2720">${a} <span style="color:var(--fraco);font-style:italic"> · ${b}</span></div>`).join('') : '<p style="color:var(--fraco)">Bolsos vazios.</p>';
  } else if (abaDiario === 'notas') {
    const lista = [...R.notas.map(n => ({ ...n, tipo: 'n' })), ...R.paginas.map(n => ({ ...n, tipo: 'n' })), ...R.fitas.map(f => ({ ...f, tipo: 'f' }))];
    el.innerHTML = `<p style="color:var(--fraco);margin-bottom:12px">${loreAchado()} de ${totalLore()} encontradas ${loreAchado() >= totalLore() ? '· tudo descoberto' : '· ache tudo para destravar uma escolha no final'}</p><div class="notas">` +
      lista.map(n => { const tem = n.tipo === 'f' ? S.fitas[n.id] : S.notes[n.id]; return `<div class="nota ${tem ? '' : 'x'}" data-id="${n.id}" data-t="${n.tipo}">${tem ? (n.tipo === 'f' ? '▶ ' : '') + n.titulo : '???'}</div>`; }).join('') + '</div>';
    el.querySelectorAll('.nota:not(.x)').forEach(d => d.onclick = () => {
      prevUi = 'diario'; $('#diario').hidden = true;
      if (d.dataset.t === 'f') { const f = R.fitas.find(x => x.id === d.dataset.id); abrirNotaUI(f.titulo, f.linhas.map(l => `${(R.personagens[l.quem] || {}).nome}: ${codTxt(l.texto)}`).join('\n\n')); }
      else { const n = R.notas.find(x => x.id === d.dataset.id) || R.paginas.find(x => x.id === d.dataset.id); abrirNotaUI(n.titulo, codTxt(n.texto)); }
    });
  } else {
    const salas = W.salas; if (!salas.length) return;
    const minX = Math.min(...salas.map(r => r.x0)), maxX = Math.max(...salas.map(r => r.x1)), minZ = Math.min(...salas.map(r => r.z0)), maxZ = Math.max(...salas.map(r => r.z1));
    const k = Math.min(900 / (maxX - minX), 560 / (maxZ - minZ));
    const sx = x => (x - minX) * k + 10, sz = z => (maxZ - z) * k + 10;
    let s = `<h3>${W.def.nome}</h3><svg viewBox="0 0 ${(maxX - minX) * k + 20} ${(maxZ - minZ) * k + 20}" preserveAspectRatio="xMidYMid meet">`;
    for (const r of salas) {
      const vis = S.visited[`${W.mapa}:${r.id}`] || r.fora, aqui = P.room === r;
      s += `<rect x="${sx(r.x0)}" y="${sz(r.z1)}" width="${(r.x1 - r.x0) * k}" height="${(r.z1 - r.z0) * k}" fill="${aqui ? '#3a1f18' : vis ? (r.fora ? '#0d100c' : '#1d1a15') : '#0a0908'}" stroke="${vis ? '#857a63' : '#2a2620'}" stroke-width="1.5"/>`;
      if (vis && r.nome) s += `<text x="${sx((r.x0 + r.x1) / 2)}" y="${sz((r.z0 + r.z1) / 2) + 5}" fill="#cfc3a6" font-size="${Math.max(10, Math.min(15, (r.x1 - r.x0) * k / 7))}" text-anchor="middle" font-family="IM Fell English SC">${r.nome}</text>`;
    }
    s += `<circle cx="${sx(P.pos.x)}" cy="${sz(P.pos.z)}" r="6" fill="#c0392b"/></svg>`;
    el.innerHTML = s;
  }
}

// Teclado
let teclado = null, digitado = '';
const kg = $('#k-grid');
[1, 2, 3, 4, 5, 6, 7, 8, 9, '←', 0, 'OK'].forEach(k => { const b = document.createElement('button'); b.textContent = k; b.onclick = () => tecla(String(k)); kg.appendChild(b); });
function abrirTeclado(titulo, codigo, ok, erro) { teclado = { codigo: String(codigo), ok, erro }; ui = 'teclado'; digitado = ''; $('#k-tit').textContent = titulo; $('#k-disp').textContent = '_'.repeat(teclado.codigo.length); $('#keypad').hidden = false; unlock(); }
function fecharTeclado() { $('#keypad').hidden = true; ui = null; teclado = null; lockPointer(); }
$('#k-sair').onclick = fecharTeclado;
function tecladoKey(e) {
  if (e.code === 'Escape') return fecharTeclado();
  if (/^(Digit|Numpad)\d$/.test(e.code)) tecla(e.code.slice(-1));
  if (e.code === 'Backspace') tecla('←');
  if (e.code === 'Enter' || e.code === 'NumpadEnter') tecla('OK');
}
function tecla(k) {
  if (!teclado) return;
  SFX.clique();
  const n = teclado.codigo.length;
  if (k === '←') digitado = digitado.slice(0, -1);
  else if (k === 'OK') {
    if (digitado === teclado.codigo) { const ok = teclado.ok; fecharTeclado(); ok(); return; }
    $('#keypad').classList.add('erro'); setTimeout(() => $('#keypad').classList.remove('erro'), 450); SFX.trancado(); if (teclado.erro) teclado.erro(); digitado = '';
  } else if (digitado.length < n) digitado += k;
  $('#k-disp').textContent = (digitado + '_'.repeat(n)).slice(0, n);
}

// Pausa / menus
function abrirPausa() { ui = 'pausa'; $('#pause').hidden = false; }
function fecharPausa() { $('#pause').hidden = true; ui = null; lockPointer(); }
$('#p-voltar').onclick = fecharPausa;
$('#p-check').onclick = () => { $('#pause').hidden = true; ui = null; carregarSnap(S._check || lsGet(SAVE_KEY)); lockPointer(); };
$('#p-menu').onclick = () => { $('#pause').hidden = true; voltarMenu(); };
function setOpt(k, v) { OPT[k] = +v; if (k === 'vol' && master) master.gain.value = OPT.vol; lsSet(OPT_KEY, OPT); for (const p of ['#o-', '#p-']) { const el = $(p + k); if (el) el.value = v; } }
for (const p of ['o', 'p']) { $(`#${p}-sens`).value = OPT.sens; $(`#${p}-vol`).value = OPT.vol; $(`#${p}-sens`).oninput = e => setOpt('sens', e.target.value); $(`#${p}-vol`).oninput = e => setOpt('vol', e.target.value); }
$('#dt-retry').onclick = () => { $('#death').hidden = true; ui = null; $('#fx-black').style.opacity = 0; $('#hud').hidden = false; carregarSnap(S._check || lsGet(SAVE_KEY)); lockPointer(); };
$('#dt-menu').onclick = () => { $('#death').hidden = true; voltarMenu(); };
$('#e-menu').onclick = () => { $('#ending').hidden = true; voltarMenu(); };
$('#pn-voltar').onclick = () => { $('#painel').hidden = true; $('#title').hidden = false; };
$('#b-caps').onclick = () => {
  const caps = lsGet(CAPS_KEY, {});
  $('#pn-tit').textContent = 'Capítulos';
  $('#pn-lista').innerHTML = R.capitulos.map(c => { const d = caps[c.id], ok = d && d.snap; return `<div class="it ${ok ? '' : 'x'}"><div><b>${c.titulo}</b><br><small>${d && d.tempo ? `melhor tempo ${Math.floor(d.tempo / 60)}min ${String(Math.floor(d.tempo % 60)).padStart(2, '0')}s` : ok ? 'liberado' : 'bloqueado'}</small></div><div style="display:flex;align-items:center;gap:12px"><span class="rank">${(d && d.rank) || ''}</span>${ok ? `<button class="btn" data-cap="${c.id}">Jogar</button>` : ''}</div></div>`; }).join('');
  $('#pn-lista').querySelectorAll('[data-cap]').forEach(b => b.onclick = () => { iniciarAudio(); const snap = caps[b.dataset.cap].snap; S = null; $('#painel').hidden = true; carregarSnap(snap); entrarJogo(); });
  $('#title').hidden = true; $('#painel').hidden = false;
};
$('#b-conq').onclick = () => {
  const c = lsGet(CONQ_KEY, {});
  $('#pn-tit').textContent = `Conquistas ${R.conquistas.filter(x => c[x.id]).length}/${R.conquistas.length}`;
  $('#pn-lista').innerHTML = R.conquistas.map(x => `<div class="it ${c[x.id] ? '' : 'x'}"><div><b>${x.nome}</b><br><small>${x.desc}</small></div><span class="rank">${c[x.id] ? '✦' : ''}</span></div>`).join('');
  $('#title').hidden = true; $('#painel').hidden = false;
};

// Final
function final(tipo) {
  if (S.fim) return; S.fim = true;
  const F = R.finais[tipo];
  desativarInspetor(); despawnAna(true);
  conquista('final_' + tipo); if (S.dif === 'pesadelo') conquista('pesadelo');
  $('#fx-black').style.opacity = 1; SFX.pararCanto();
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  setTimeout(() => {
    unlock(); ui = 'final'; $('#hud').hidden = true; $('#escolha').hidden = true; $('#ending').hidden = false;
    $('#e-tit').textContent = F.titulo; $('#e-txt').textContent = F.texto;
    const min = Math.floor(S.tempo / 60), seg = Math.floor(S.tempo % 60);
    $('#e-stats').innerHTML = `tempo total ${min}min ${String(seg).padStart(2, '0')}s · notas, páginas e fitas ${loreAchado()}/${totalLore()} · encontrada ${S.mortes}x · ${D().nome}<br>Existem 3 finais.`;
    SFX.sino(.5, null);
  }, 1600);
}
function escolhaFinal() {
  if (S.fim) return;
  if (loreAchado() < totalLore()) return final('comum');
  ui = 'escolha'; unlock(); desativarInspetor(); despawnAna(true); $('#escolha').hidden = false;
}
$('#es-ir').onclick = () => { $('#escolha').hidden = true; ui = null; final('silencio'); };
$('#es-voltar').onclick = () => { $('#escolha').hidden = true; ui = null; final('verdadeiro'); };

// Título
$('#t-sub').textContent = R.subtitulo;
$('#rot-ver').textContent = R.versao;
function temSave() { return !!lsGet(SAVE_KEY, null); }
$('#b-cont').hidden = !temSave();
$('#b-novo').onclick = () => {
  iniciarAudio();
  S = novoEstado($('#o-dif').value);
  carregarMapa('estrada', 'carro');
  salvarCheckpoint(true);
  $('#title').hidden = true;
  iniciarCena();
};
$('#b-cont').onclick = () => { iniciarAudio(); S = null; carregarSnap(lsGet(SAVE_KEY)); $('#o-dif').value = S.dif; entrarJogo(); };
function entrarJogo() {
  mode = 'jogo'; ui = null; $('#title').hidden = true; $('#hud').hidden = false; $('#fx-black').style.opacity = 0;
  lockPointer(); cartaoCapitulo(); renderObj();
}
function voltarMenu() {
  mode = 'titulo'; ui = null; $('#hud').hidden = true; $('#title').hidden = false; $('#fx-black').style.opacity = 0; $('#clique').hidden = true;
  $('#b-cont').hidden = !temSave();
  desativarInspetor(); despawnAna(true); PROC.fase = null; PROC.g.visible = false; SFX.pararCanto(); SFX.chiadoFita(false); SFX.gerador(false); fitaTocando = null; $('#fita-ind').hidden = true;
  $('#fx-locker').hidden = true; $('#fx-cama').hidden = true; canvas.style.filter = ''; filtroAtual = '';
  unlock(); carregarTitulo();
}
function carregarTitulo() { S = novoEstado('normal'); carregarMapa('estrada', 'titulo', { salvar: false }); }

// =====================================================================
// LOOP
// =====================================================================
carregarTitulo();
const grain = $('#fx-grain').getContext('2d'), grainImg = grain.createImageData(160, 90);
let last = performance.now(), grainT = 0;
function loop(now) { requestAnimationFrame(loop); const dt = Math.min(.05, (now - last) / 1000); last = now; frame(dt); }
function frame(dt) {
  perf += dt;
  const jogando = mode === 'jogo' && !ui && S && !S.dead && !S.fim;
  const ativo = jogando && (locked || window.__teste);
  $('#clique').hidden = !(jogando && !locked && !window.__teste);
  if (mode === 'titulo') {
    const t = perf * .05, sp = W.def.spawns.titulo;
    camera.position.set(sp.x + Math.sin(t) * 2, 1.7, sp.z + Math.cos(t * .7)); camera.rotation.set(.03, (sp.yaw || 0) + Math.sin(t * .6) * .2, 0);
    flash.intensity = 0; flashFill.intensity = 0; P.pos.set(camera.position.x, 0, camera.position.z); P.room = roomAt(P.pos.x, P.pos.z);
    updateClima(dt); for (const f of W.tick) f(dt);
  } else if (mode === 'cena') {
    updateCena(dt); updateClima(dt); updateAudio(dt);
  } else if (ativo) {
    S.tempo += dt; S.capT += dt;
    updatePlayer(dt); updateLanterna(dt); updateFear(dt);
    updateInspetor(dt); updateAna(dt); updateProcissao(dt); updateEventos(dt); updateGarrafas(dt);
    updateClima(dt); updateAlvo(); updateSegurar(dt); updateFita(dt); updateHUD(); updateSub(dt); updateAudio(dt);
  } else if (mode === 'jogo' && S && S.dead) updateAudio(dt);
  for (const d of W.doors) { d.ang = lerp(d.ang, d.target, Math.min(1, dt * 7)); d.pivot.rotation.y = d.ang; }
  grainT -= dt;
  if (grainT <= 0) { grainT = .05; const d = grainImg.data; for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } grain.putImageData(grainImg, 0, 0); }
  renderer.render(scene, camera);
}
requestAnimationFrame(loop);

window.__jogo = { get S() { return S; }, P, M, ANA, PROC, W, frame, carregarMapa, objDone, iniciarProcissao, spawnAna, ativarInspetor, camera, renderer, scene, hemi, moon, salvarCheckpoint, carregarSnap, lerNota, tocarFita, pularCena, roomAt, get ui() { return ui; }, get mode() { return mode; }, get alvo() { return alvo; }, keys, onKey, novoEstado: d => { S = novoEstado(d); return S; } };
