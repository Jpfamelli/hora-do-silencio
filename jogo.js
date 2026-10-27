// A HORA DO SILÊNCIO v2 — motor (Three.js). Mapas e conteúdo em mapas.js, texto em roteiro.js.
import * as THREE from 'three';
import { MAPAS } from './mapas.js';
import { instalarHistoria, fmtFala, fmtNota, escrever, revelar } from './src/historia.js';

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
    const it = interact(g, () => fitaTocando ? (fitaTocando.id === fid ? '<b>E</b>Parar a fita (faz um clique)' : 'Outra fita está tocando...') : `<b>E</b>${S.fitas[fid] ? 'Ouvir de novo' : 'Ouvir'}: ${f.titulo}`, () => { if (fitaTocando && fitaTocando.id === fid) pararFita(); else tocarFita(fid); });
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
const loreBase = () => [...R.notas, ...R.paginas, ...R.fitas].filter(x => !x.secreta);
const totalLore = () => loreBase().length;
const loreAchado = () => loreBase().filter(x => (x.linhas ? S.fitas : S.notes)[x.id]).length;
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
  if (ui === 'dialogo') { if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') avancarDialogo(); return; }
  if (ui === 'nota') { if (e.code === 'KeyE' || e.code === 'Escape') fecharNota(); else if (e.code === 'KeyV') virarRegras(); return; }
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
  const att = salaAdj(roomAt(M.pos.x, M.pos.z), roomAt(x, z)) ? 1 : .5;
  if (d < r * att * D().ouvido) {
    if (doJogador && S.hidden && d < 2.6) M.achou = true;
    if (M.state !== 'caca' || garrafa) { M.state = 'investiga'; M.searchT = 0; planejar(M, x, z); falaInspetor(); if (garrafa) M.alvoGarrafa = 4; }
    else planejar(M, x, z);
  }
}
function falaInspetor(perdeu) {
  if (M.falaT > 0) return; M.falaT = rand(8, 14);
  const ent = R.entidades.inspetor, extra = (!perdeu && ent.porCapitulo && ent.porCapitulo[S.chapter]) || [], t = pick([...(perdeu ? ent.falas_perdeu : ent.falas_caca), ...extra]);
  sub('inspetor', t); SFX.voz(M.pos);
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
  const ouvido = P.noiseR * att * D().ouvido * (M.state === 'caca' ? 1.6 : 1);
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
      ANA.contaT = 1.1; const c = R.entidades.ana.contagem[Math.min(9, ANA.conta)];
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
  PROC.fase = 'aviso'; PROC.t = D().aviso; SFX.estatica(D().aviso + 1); SFX.canto(D().aviso + 3);
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
      const ini = longe.length ? pick(longe) : pick(salas.filter(r => r !== P.room)) || P.room;
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
  PROC.fase = null; PROC.g.visible = false; PROC.luz.intensity = 0; PROC.acertou = false; SFX.pararCanto();
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
      const MT = (R.mortes && R.mortes[quem]) || {};
      $('#dt-tit').textContent = MT.titulos ? pick(MT.titulos) : quem === 'inspetor' ? 'ELE TE ENCONTROU' : quem === 'ana' ? 'ELA CONTOU ATÉ DEZ' : 'FORA DA CAMA';
      $('#death-frase').textContent = MT.frases ? pick(MT.frases) : '';
      const dicasMapa = (R.dicas_morte.porMapa && R.dicas_morte.porMapa[W.mapa]) || [];
      $('#death-dica').textContent = pick([...(R.dicas_morte[quem] || R.dicas_morte.inspetor), ...(quem === 'inspetor' ? dicasMapa : [])]);
      $('#death-conta').textContent = [S.mortes > 1 && R.mortes ? R.mortes.voltou.replace('{n}', S.mortes - 1) : '', S.dif === 'pesadelo' && R.mortes ? R.mortes.pesadelo : ''].filter(Boolean).join(' · ');
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
  const recado = H.fimCapitulo(S, rk);
  $('#fc-stats').innerHTML += '<br><span style="opacity:.7">S: sem dano, rápida e sem ser perseguida</span>';
  $('#fimcap').hidden = false;
  escrever($('#fc-gancho'), c.gancho || '');
  $('#fc-recado').textContent = recado ? `Gravador da Lia: ${recado}` : '';
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
    else if (P.room === chamadoArmadilha.sala) { const s = chamadoArmadilha.sala; chamadoArmadilha = null; H.respondeu(); if (M.ativo) { const [x, z] = pontoEm(s, 1); M.pos.set(x, 0, z); M.state = 'caca'; M.cool = 1.2; planejar(M, P.pos.x, P.pos.z); SFX.susto(); sub('inspetor', 'Achei.'); } }
  }
  for (const f of W.tick) f(dt);
}
function chamado() {
  const viz = W.links.filter(l => l.a === P.room.id || l.b === P.room.id).map(l => SALA(l.a === P.room.id ? l.b : l.a)).filter(r => !r.fora);
  if (!viz.length) return;
  const s = pick(viz); const [x, z] = pontoEm(s, 1);
  SFX.chamadoVoz(x, z); { const v = H.vozChamado(); sub(v.quem, v.texto); }
  if (!S.flags.chamado1) { S.flags.chamado1 = true; setTimeout(() => falar('chamado_regra'), 2600); }
  chamadoArmadilha = { sala: s, t: 14 };
}

// =====================================================================
// FITAS, NOTAS, DIÁLOGOS
// =====================================================================
let fitaTocando = null, fitaFila = [], fitaT = 0, fitaPos = null;
function pararFita() {
  if (!fitaTocando) return;
  fitaTocando = null; fitaFila = []; $('#fita-ind').hidden = true; SFX.chiadoFita(false); SFX.fitaClique(); emitNoise(P.pos.x, P.pos.z, 4);
  subQ = subQ.filter(x => !x.prioridade); toast('Você parou a fita no meio.');
}
function tocarFita(fid) {
  if (fitaTocando) return;
  const f = R.fitas.find(x => x.id === fid);
  fitaTocando = f; fitaFila = f.linhas.map(l => ({ ...l, texto: codTxt(l.texto) })); fitaT = .8; fitaPos = P.pos.clone();
  $('#fita-ind').textContent = `${f.titulo} · 0/${f.linhas.length}`; $('#fita-ind').hidden = false;
  SFX.fitaClique(); SFX.chiadoFita(true);
  emitNoise(P.pos.x, P.pos.z, 7);
}
function updateFita(dt) {
  if (!fitaTocando) return;
  fitaT -= dt;
  if (fitaT <= 0) {
    const l = fitaFila.shift();
    if (!l) { const id = fitaTocando.id; fitaTocando = null; $('#fita-ind').hidden = true; SFX.chiadoFita(false); SFX.fitaClique(); const primeira = !S.fitas[id]; S.fitas[id] = true; H.fitaFim(id); if (primeira) { toast('Fita registrada no diário (TAB).'); if (W.def.fitaOuvida) W.def.fitaOuvida(id); progresso(); } return; }
    sub(l.quem, l.texto, true); fitaT = 2.6 + l.texto.length * .058;
    const n = fitaTocando.linhas.length; $('#fita-ind').textContent = `${fitaTocando.titulo} · ${n - fitaFila.length}/${n}`;
    if (fitaPos) emitNoise(fitaPos.x, fitaPos.z, 4);
    if (fitaTocando.id === 'f3' && M.ativo && !S.flags.moacirEscutou && M.pos.distanceTo(fitaPos || P.pos) < 18) { S.flags.moacirEscutou = true; M.wait = 6; M.path = []; M.state = 'procura'; M.searchT = 8; falar('moacir_escuta'); }
  }
}
let notaAtual = null;
function virarRegras() {
  if (notaAtual !== 'regras' || !R.regras.verso) return;
  notaAtual = 'regras-verso'; S.flags.verso = true; SFX.papel(); conquista('verso');
  $('#note h2').textContent = R.regras.titulo + ' (verso)'; $('#note p').innerHTML = fmtNota(R.regras.verso); $('#note small').textContent = 'clique ou E para fechar';
}
$('#note').addEventListener('contextmenu', e => { e.preventDefault(); virarRegras(); });
function lerNota(id) {
  const n = id === 'regras' ? R.regras : (R.notas.find(x => x.id === id) || R.paginas.find(x => x.id === id));
  const primeira = id !== 'regras' && !S.notes[id];
  if (id !== 'regras') S.notes[id] = true;
  SFX.papel();
  abrirNotaUI(n.titulo, codTxt(n.texto));
  notaAtual = id; if (id === 'regras' && R.regras.dicaVerso) $('#note small').textContent = 'clique ou E para fechar · ' + R.regras.dicaVerso;
  if (primeira) { progresso(); if (W.def.notaLida) W.def.notaLida(id); }
}
let prevUi = null;
function abrirNotaUI(titulo, texto) { ui = 'nota'; notaAtual = null; $('#note').hidden = false; $('#note h2').textContent = titulo; $('#note p').innerHTML = fmtNota(texto); $('#note small').textContent = 'clique, E ou ESC para fechar'; unlock(); }
function fecharNota() { $('#note').hidden = true; ui = prevUi || null; prevUi = null; if (ui === 'diario') $('#diario').hidden = false; else lockPointer(); }
$('#note').addEventListener('click', fecharNota);

let dialogoFila = [], dialogoCb = null;
function dialogo(linhas, cb) { dialogoFila = linhas.slice(); dialogoCb = cb; ui = 'dialogo'; $('#dialogo').hidden = false; proxDialogo(); }
function proxDialogo() {
  const l = dialogoFila.shift();
  if (!l) { $('#dialogo').hidden = true; ui = null; const cb = dialogoCb; dialogoCb = null; cb && cb(); return; }
  const p = R.personagens[l.quem] || { nome: l.quem, cor: '#fff' };
  $('#dialogo .quem').textContent = p.nome; $('#dialogo .quem').style.color = p.cor;
  const txt = codTxt(l.texto), el = $('#dialogo .txt'); let i = 0; el.textContent = ''; clearInterval(dialogoDig);
  dialogoDig = setInterval(() => { i += 2; el.textContent = txt.slice(0, i); if (i >= txt.length) { clearInterval(dialogoDig); dialogoDig = null; } }, 22);
  dialogoTxt = txt; SFX.clique();
}
let dialogoDig = null, dialogoTxt = '';
function avancarDialogo() { if (dialogoDig) { clearInterval(dialogoDig); dialogoDig = null; $('#dialogo .txt').textContent = dialogoTxt; return; } proxDialogo(); }
$('#dialogo').addEventListener('click', avancarDialogo);

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
let AC = null, master, reverb, ruidoBuf;
const AMB = {};
const SFX = new Proxy({}, { get: (t, k) => (...a) => { if (!AC) return; try { return SOM[k] && SOM[k](...a); } catch (e) { console.warn(e); } } });
function iniciarAudio() {
  if (AC) { AC.resume(); return; }
  AC = new (window.AudioContext || window.webkitAudioContext)();
  master = AC.createGain(); master.gain.value = OPT.vol;
  const cmp = AC.createDynamicsCompressor(); master.connect(cmp); cmp.connect(AC.destination);
  ruidoBuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
  const d = ruidoBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const ir = AC.createBuffer(2, AC.sampleRate * 2.6, AC.sampleRate);
  for (let c = 0; c < 2; c++) { const ch = ir.getChannelData(c); for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / ch.length, 2.6); }
  reverb = AC.createConvolver(); reverb.buffer = ir; const rv = AC.createGain(); rv.gain.value = .4; reverb.connect(rv); rv.connect(master);
  SOM.ambiente();
}
function ruido(loop) { const s = AC.createBufferSource(); s.buffer = ruidoBuf; s.loop = !!loop; return s; }
function saida(pos, wet = .3) {
  const g = AC.createGain(); let node = g;
  if (pos) { const p = AC.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 2; p.rolloffFactor = 1.2; p.positionX.value = pos.x; p.positionY.value = pos.y ?? 1.5; p.positionZ.value = pos.z; g.connect(p); node = p; }
  node.connect(master);
  if (wet) { const w = AC.createGain(); w.gain.value = wet; node.connect(w); w.connect(reverb); }
  return g;
}
function env(g, t0, a, peak, dec) { g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + dec); }
function osc(tipo, f, t, dur, g) { const o = AC.createOscillator(); o.type = tipo; o.frequency.value = f; o.connect(g); o.start(t); o.stop(t + dur); return o; }
function burst(t, dur, filtro, freq, q, g, off = Math.random()) { const s = ruido(), f = AC.createBiquadFilter(); f.type = filtro; f.frequency.value = freq; f.Q.value = q; s.connect(f); f.connect(g); s.start(t, off); s.stop(t + dur); return f; }
const SOM = {
  ambiente() {
    const t = AC.currentTime;
    const dg = AC.createGain(); dg.gain.value = .05; const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180;
    for (const f of [41, 41.6, 61.8]) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(lp); o.start(t); }
    lp.connect(dg); dg.connect(master); AMB.drone = dg;
    const lfo = AC.createOscillator(); lfo.frequency.value = .07; const lg = AC.createGain(); lg.gain.value = 80; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    const ch = ruido(true), bp = AC.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = 2800;
    const cg = AC.createGain(); cg.gain.value = .12; ch.connect(bp); bp.connect(cg); cg.connect(master); ch.start(); AMB.chuva = cg; AMB.chuvaF = bp;
    const v = ruido(true), vb = AC.createBiquadFilter(); vb.type = 'bandpass'; vb.frequency.value = 400; vb.Q.value = 2;
    const vg = AC.createGain(); vg.gain.value = .04; v.connect(vb); vb.connect(vg); vg.connect(master); v.start();
    const vl = AC.createOscillator(); vl.frequency.value = .11; const vlg = AC.createGain(); vlg.gain.value = 220; vl.connect(vlg); vlg.connect(vb.frequency); vl.start();
    const tg = AC.createGain(); tg.gain.value = 0; const tf = AC.createBiquadFilter(); tf.type = 'bandpass'; tf.frequency.value = 900; tf.Q.value = 6;
    for (const f of [220, 233, 311]) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(tf); o.start(); }
    tf.connect(tg); tg.connect(master); AMB.tensao = tg;
    const goteira = () => { if (mode === 'jogo' && P.room && !P.room.fora && (W.mapa === 'tuneis' || Math.random() < .3)) { const t2 = AC.currentTime; const g = saida({ x: P.pos.x + rand(-6, 6), y: 2, z: P.pos.z + rand(-6, 6) }, .6); const o = AC.createOscillator(); o.frequency.setValueAtTime(rand(900, 1500), t2); o.frequency.exponentialRampToValueAtTime(rand(300, 500), t2 + .08); o.connect(g); env(g, t2, .002, .05, .1); o.start(t2); o.stop(t2 + .15); } setTimeout(goteira, rand(1500, 5000)); };
    goteira();
  },
  passo(vol, piso, fora, agua) {
    const t = AC.currentTime, g = saida(null, fora ? .05 : .25);
    if (agua) { burst(t, .25, 'bandpass', 700, 1.5, g); env(g, t, .02, .35 * vol + .08, .22); return; }
    burst(t, .12, fora ? 'bandpass' : 'lowpass', fora ? 900 : piso === 'madeira' ? 520 : piso === 'concreto' ? 1200 : 900, 1, g);
    env(g, t, .005, .25 * vol + .03, .09);
    if (piso === 'madeira' && Math.random() < .12) SOM.rangido(P.pos.x, .1, P.pos.z, .3);
  },
  passoMonstro(pos, vol, agua) {
    const t = AC.currentTime, p = { x: pos.x, y: .3, z: pos.z };
    const g = saida(p, .5); const o = AC.createOscillator(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(30, t + .25); o.connect(g); env(g, t, .01, .9 * vol, .3); o.start(t); o.stop(t + .4);
    const g2 = saida(p, .4); burst(t, .3, agua ? 'bandpass' : 'lowpass', agua ? 600 : 400, 1, g2); env(g2, t, .005, (agua ? .9 : .6) * vol, agua ? .35 : .2);
  },
  estalo(pos, vol = .6) {
    const t = AC.currentTime, g = saida({ x: pos.x, y: 3, z: pos.z }, .5);
    for (let i = 0; i < 2; i++) burst(t + i * .07, .03, 'bandpass', 2600, 8, g);
    g.gain.setValueAtTime(0, t); g.gain.setValueAtTime(.7 * vol, t + .001); g.gain.exponentialRampToValueAtTime(.0001, t + .2);
  },
  rangido(x, y, z, vol = 1) {
    const t = AC.currentTime, o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(rand(140, 220), t); o.frequency.linearRampToValueAtTime(rand(60, 110), t + .7);
    const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 12;
    const tr = AC.createOscillator(); tr.frequency.value = rand(18, 30); const trg = AC.createGain(); trg.gain.value = .5; tr.connect(trg);
    const g = saida({ x, y, z }, .4); trg.connect(g.gain); o.connect(f); f.connect(g); env(g, t, .05, .35 * vol, .7); o.start(t); tr.start(t); o.stop(t + .9); tr.stop(t + .9);
  },
  pancada(x, z) { const t = AC.currentTime, g = saida({ x, y: 1, z }, .8); burst(t, .8, 'lowpass', 300, 1, g, 0); env(g, t, .003, 1.6, .6); },
  trancado() { const t = AC.currentTime; for (let i = 0; i < 3; i++) { const g = saida(null, .2); burst(t + i * .09, .08, 'bandpass', 2400, 4, g); env(g, t + i * .09, .002, .3, .05); } },
  pegar() { const t = AC.currentTime, g = saida(null, .3), o = AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(780, t + .12); o.connect(g); env(g, t, .01, .07, .3); o.start(t); o.stop(t + .4); },
  papel() { const t = AC.currentTime, g = saida(null, .1); burst(t, .3, 'highpass', 2500, .5, g); env(g, t, .02, .15, .25); },
  clique() { const t = AC.currentTime, g = saida(null, 0); burst(t, .05, 'highpass', 3000, 1, g); env(g, t, .001, .25, .03); },
  objetivo() { const t = AC.currentTime; for (const [i, f] of [[0, 196], [1, 293.7]]) { const g = saida(null, .6); osc('sine', f, t + i * .25, 1.8, g); env(g, t + i * .25, .05, .08, 1.6); } },
  vidro(x, z) { const t = AC.currentTime, p = x !== undefined ? { x, y: .5, z } : null; for (let i = 0; i < 8; i++) { const g = saida(p, .4); osc('sine', rand(2500, 6500), t + i * .03, .3, g); env(g, t + i * .03, .001, .08, .2); } const g = saida(p, .5); burst(t, .3, 'highpass', 1800, 1, g); env(g, t, .002, .5, .25); },
  arremesso() { const t = AC.currentTime, g = saida(null, 0); burst(t, .25, 'bandpass', 600, 1, g); env(g, t, .05, .12, .15); },
  armario() { const t = AC.currentTime, g = saida(null, .3); burst(t, .3, 'bandpass', 700, 3, g); env(g, t, .005, .5, .25); SOM.rangido(P.pos.x, 1, P.pos.z, .4); },
  arrastar() { const t = AC.currentTime, g = saida(null, .2); burst(t, .5, 'lowpass', 500, 1, g); env(g, t, .08, .3, .35); },
  ofego() { if (SOM._of && AC.currentTime - SOM._of < 1.2) return; SOM._of = AC.currentTime; const t = AC.currentTime, g = saida(null, .1); burst(t, .8, 'bandpass', 1300, 1, g); env(g, t, .15, .25, .5); },
  coracao() { const t = AC.currentTime; for (const k of [0, .17]) { const g = saida(null, 0); const o = AC.createOscillator(); o.frequency.setValueAtTime(58, t + k); o.frequency.exponentialRampToValueAtTime(35, t + k + .14); o.connect(g); env(g, t + k, .01, k ? .35 : .5, .16); o.start(t + k); o.stop(t + k + .25); } },
  susto() {
    const t = AC.currentTime;
    for (const f of [110, 116.5, 155, 233, 247]) { const g = saida(null, .6); const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 1.06, t + 1.4); o.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.09, t + .06); g.gain.exponentialRampToValueAtTime(.0001, t + 1.8); o.start(t); o.stop(t + 2); }
    const g = saida(null, .8); burst(t, 1, 'highpass', 200, 1, g); env(g, t, .01, .35, .9);
  },
  grito(quem) {
    const t = AC.currentTime, base = quem === 'ana' ? [900, 1200, 1500] : [300, 420, 610];
    for (const f of base) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .55, t + 1.1); const lfo = AC.createOscillator(); lfo.frequency.value = 38; const lg = AC.createGain(); lg.gain.value = f * .08; lfo.connect(lg); lg.connect(o.frequency); const g = saida(null, .7); o.connect(g); env(g, t, .02, .22, 1.2); o.start(t); lfo.start(t); o.stop(t + 1.3); lfo.stop(t + 1.3); }
    const g = saida(null, .6); burst(t, 1.2, 'bandpass', 1800, 1, g); env(g, t, .01, .6, 1);
  },
  sino(vol = 1, pos = { x: 0, y: 4, z: -60 }) {
    const t = AC.currentTime, base = 196;
    for (const [m, a] of [[.5, .4], [1, 1], [1.19, .5], [1.5, .45], [2, .5], [2.5, .3], [2.67, .25], [3.0, .2], [4.17, .12]]) { const g = saida(pos, .9); osc('sine', base * m, t, 8, g); env(g, t, .004, .35 * a * vol, 7 / m); }
  },
  sinoLonge() { SOM.sino(.3, null); },
  badaladas(n = 9) { for (let i = 0; i < n; i++) setTimeout(() => SOM.sino(.45, null), i * 2200); },
  estatica(dur = 2, pos) {
    const t = AC.currentTime, s = ruido(true), f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = .8;
    const g = saida(pos || null, .2); s.connect(f); f.connect(g);
    g.gain.setValueAtTime(0, t); for (let i = 0; i < dur * 20; i++) g.gain.setValueAtTime(Math.random() * .22, t + i / 20);
    g.gain.setValueAtTime(0, t + dur); s.start(t); s.stop(t + dur + .1);
  },
  sussurros(dur = 2) {
    const t = AC.currentTime;
    for (let k = 0; k < 3; k++) {
      const s = ruido(true), f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = rand(1800, 3500); f.Q.value = 6;
      const lfo = AC.createOscillator(); lfo.frequency.value = rand(4, 9); const lg = AC.createGain(); lg.gain.value = .05;
      const g = saida({ x: P.pos.x + rand(-3, 3), y: 1.6, z: P.pos.z + rand(-3, 3) }, .5); g.gain.value = 0;
      lfo.connect(lg); lg.connect(g.gain); s.connect(f); f.connect(g); s.start(t + k * .3); lfo.start(t + k * .3); s.stop(t + dur + k * .3); lfo.stop(t + dur + k * .3);
    }
  },
  risada(x, z) { const t = AC.currentTime; for (let i = 0; i < 5; i++) { const g = saida({ x, y: 1, z }, .9); const o = AC.createOscillator(); o.type = 'triangle'; const f0 = rand(620, 760); o.frequency.setValueAtTime(f0, t + i * .14); o.frequency.exponentialRampToValueAtTime(f0 * .7, t + i * .14 + .1); o.connect(g); env(g, t + i * .14, .01, .05, .1); o.start(t + i * .14); o.stop(t + i * .14 + .15); } },
  contagem(pos, n) {
    const t = AC.currentTime, g = saida({ x: pos.x, y: 1.1, z: pos.z }, .8);
    const notas = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319];
    osc('sine', notas[n % 10], t, 1, g); env(g, t, .003, .09 + n * .012, .8);
    const g2 = saida({ x: pos.x, y: 1.1, z: pos.z }, .5); burst(t, .3, 'bandpass', 3000, 5, g2); env(g2, t, .05, .06, .2);
  },
  caixinha(x, z) {
    const notas = [659, 784, 659, 523, 587, 494, 523, 440, 0, 659, 784, 880, 784, 659, 587, 523]; const t = AC.currentTime;
    notas.forEach((f, i) => { if (!f) return; const g = saida({ x, y: 1, z }, .7); const at = t + i * .42 * (1 + i * .03); osc('sine', f * .995 + Math.random() * 3, at, 1.6, g); env(g, at, .002, .08, 1.2); });
  },
  chamadoVoz(x, z) {
    const t = AC.currentTime;
    for (const [k, f] of [[0, 330], [.35, 262]]) { const g = saida({ x, y: 1.4, z }, .9); const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(f, t + k); o.frequency.linearRampToValueAtTime(f * .92, t + k + .4); const fl = AC.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = 900; fl.Q.value = 3; o.connect(fl); fl.connect(g); env(g, t + k, .08, .12, .5); o.start(t + k); o.stop(t + k + .7); }
  },
  canto(dur) {
    if (AMB.canto) return;
    const t = AC.currentTime, g = AC.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + dur * .8);
    g.connect(master); const rv = AC.createGain(); rv.gain.value = .6; g.connect(rv); rv.connect(reverb);
    const nodes = [];
    for (const f of [146.8, 174.6, 220, 293.7]) {
      const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * rand(.995, 1.005);
      const f1 = AC.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 700; f1.Q.value = 5;
      const lfo = AC.createOscillator(); lfo.frequency.value = rand(.3, .6); const lg = AC.createGain(); lg.gain.value = 250; lfo.connect(lg); lg.connect(f1.frequency);
      o.connect(f1); f1.connect(g); o.start(t); lfo.start(t); nodes.push(o, lfo);
    }
    AMB.canto = { g, nodes };
  },
  pararCanto() { if (!AMB.canto) return; const { g, nodes } = AMB.canto; const t = AC.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(Math.max(.0002, g.gain.value), t); g.gain.exponentialRampToValueAtTime(.0001, t + 1.5); nodes.forEach(n => n.stop(t + 1.6)); AMB.canto = null; },
  procissao() { const t = AC.currentTime, g = saida(null, .8); burst(t, 1.5, 'lowpass', 500, 1, g, 0); env(g, t, .05, .9, 1.4); SOM.susto(); },
  procissaoPos(pos) { if (Math.random() < .25) { const t = AC.currentTime, g = saida({ x: pos.x, y: .2, z: pos.z }, .3); burst(t, .08, 'lowpass', 600, 1, g); env(g, t, .003, .5, .07); } },
  gerador(on, pos) {
    if (on && !AMB.ger) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 48; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260; const g = saida(pos, .1); g.gain.value = .5; o.connect(f); f.connect(g); o.start(); AMB.ger = { o, g }; }
    else if (!on && AMB.ger) { AMB.ger.o.stop(); AMB.ger = null; }
  },
  motor(on) {
    if (on && !AMB.motor) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 38; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 160; const g = AC.createGain(); g.gain.value = .16; o.connect(f); f.connect(g); g.connect(master); o.start(); AMB.motor = { o, g }; }
    else if (!on && AMB.motor) { const t = AC.currentTime; AMB.motor.g.gain.setValueAtTime(.16, t); AMB.motor.g.gain.exponentialRampToValueAtTime(.0001, t + .8); AMB.motor.o.stop(t + .9); AMB.motor = null; }
  },
  freada() { const t = AC.currentTime, g = saida(null, .2); const f = burst(t, 1.6, 'bandpass', 2600, 6, g); f.frequency.linearRampToValueAtTime(1400, t + 1.5); env(g, t, .05, .5, 1.4); },
  orelhao(pos) { const t = AC.currentTime; for (let r = 0; r < 3; r++) { const g = saida(pos, .3); for (const f of [440, 480]) osc('sine', f, t + r * 3, 1.2, g); g.gain.setValueAtTime(0, t + r * 3); for (let i = 0; i < 24; i++) g.gain.setValueAtTime(i % 2 ? 0 : .06, t + r * 3 + i * .05); g.gain.setValueAtTime(0, t + r * 3 + 1.2); } },
  cavar() { const t = AC.currentTime, g = saida(null, .2); burst(t, .3, 'lowpass', 700, 1, g); env(g, t, .01, .5, .25); },
  valvula(pos) { SOM.rangido(pos ? pos.x : P.pos.x, 1, pos ? pos.z : P.pos.z, 1); const t = AC.currentTime, g = saida(pos || null, .6); const o = AC.createOscillator(); o.type = 'square'; o.frequency.value = 55; o.connect(g); env(g, t, .02, .15, .5); o.start(t); o.stop(t + .6); },
  cano(pos) { const t = AC.currentTime; for (let i = 0; i < 4; i++) { const g = saida(pos || null, .8); osc('triangle', rand(80, 160), t + i * .18, .5, g); env(g, t + i * .18, .003, .5, .4); } },
  forcar() { const t = AC.currentTime, g = saida(null, .4); burst(t, .25, 'lowpass', 400, 1, g); env(g, t, .01, .5, .2); SOM.rangido(P.pos.x, 1, P.pos.z, .6); },
  fitaClique() { const t = AC.currentTime, g = saida(null, .1); burst(t, .06, 'bandpass', 1500, 3, g); env(g, t, .001, .5, .05); },
  chiadoFita(on) {
    if (on && !AMB.fita) { const s = ruido(true), f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 3500; const g = AC.createGain(); g.gain.value = .025; s.connect(f); f.connect(g); g.connect(master); s.start(); AMB.fita = s; }
    else if (!on && AMB.fita) { AMB.fita.stop(); AMB.fita = null; }
  },
  trovao() { const t = AC.currentTime + rand(.4, 1.8), g = saida(null, .7); burst(t, 3.6, 'lowpass', 220, 1, g, 0); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(P.room && P.room.fora ? 1.4 : .5, t + .15); g.gain.exponentialRampToValueAtTime(.0001, t + 3.5); },
  voz(pos) { const t = AC.currentTime, o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 62; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 300; f.Q.value = 3; const lfo = AC.createOscillator(); lfo.frequency.value = 11; const lg = AC.createGain(); lg.gain.value = 18; lfo.connect(lg); lg.connect(o.frequency); const g = saida({ x: pos.x, y: 2.8, z: pos.z }, .6); o.connect(f); f.connect(g); env(g, t, .2, .55, 1.6); o.start(t); lfo.start(t); o.stop(t + 2); lfo.stop(t + 2); }
};
let hbT = 0;
function updateAudio(dt) {
  if (!AC) return;
  const L = AC.listener, p = camera.position;
  const fw = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion), up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
  if (L.positionX) { L.positionX.value = p.x; L.positionY.value = p.y; L.positionZ.value = p.z; L.forwardX.value = fw.x; L.forwardY.value = fw.y; L.forwardZ.value = fw.z; L.upX.value = up.x; L.upY.value = up.y; L.upZ.value = up.z; }
  else { L.setPosition(p.x, p.y, p.z); L.setOrientation(fw.x, fw.y, fw.z, up.x, up.y, up.z); }
  const fora = P.room && P.room.fora, sub = W.mapa === 'tuneis';
  AMB.chuva.gain.value = lerp(AMB.chuva.gain.value, sub ? 0 : fora ? .14 : .03, dt * 2);
  AMB.chuvaF.frequency.value = lerp(AMB.chuvaF.frequency.value, fora ? 3000 : 500, dt * 2);
  const tens = (M.ativo && M.state === 'caca') || PROC.fase ? .05 : (M.ativo && M.pos.distanceTo(P.pos) < 10) || ANA.ativa ? .02 : 0;
  AMB.tensao.gain.value = lerp(AMB.tensao.gain.value, tens, dt * 1.5);
  hbT -= dt;
  if (S && S.fear > 30 && hbT <= 0) { SOM.coracao(); hbT = 60 / lerp(55, 150, S.fear / 100); }
}

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
function falar(chave) { let arr = R.falas[chave]; if (arr && Array.isArray(arr[0])) arr = pick(arr); if (!arr) return; for (const f of arr) subQ.push(f); if (subT <= 0) proxSub(); }
function sub(quem, texto, prioridade) {
  if (prioridade) { subQ.unshift({ quem, texto, prioridade: true }); proxSub(); }
  else { subQ.unshift({ quem, texto }); if (!subAtual || !subAtual.prioridade) proxSub(); }
}
function subPequeno(quem, texto) { if (subAtual && subAtual.prioridade) return; subQ.unshift({ quem, texto, curta: true }); proxSub(); }
function proxSub() {
  const f = subQ.shift(), el = $('#sub'); subAtual = f || null;
  if (!f) { el.innerHTML = ''; subT = 0; return; }
  const p = R.personagens[f.quem] || { nome: f.quem, cor: '#fff' };
  el.className = f.quem === 'inspetor' ? 'grave' : /^\((eco|longe|bem baixinho|do escuro)/.test(f.texto) ? 'eco' : '';
  el.innerHTML = `<span class="quem" style="color:${p.cor}">${p.nome}</span><span style="color:${p.cor}">${fmtFala(codTxt(f.texto))}</span>`;
  subT = f.curta ? 1.2 : 2.4 + f.texto.length * .055;
}
function updateSub(dt) { if (subT > 0) { subT -= dt; if (subT <= 0) proxSub(); } }
let toastT;
function toast(t) { const el = $('#toast'); el.textContent = t; el.style.opacity = 1; clearTimeout(toastT); toastT = setTimeout(() => el.style.opacity = 0, Math.max(2800, t.length * 65)); }
function cartaoCapitulo() { const el = $('#chapter'), c = R.capitulos[S.chapter]; el.textContent = c.titulo; if (c.epigrafe) { const s = document.createElement('small'); s.textContent = c.epigrafe; el.appendChild(s); } el.style.opacity = 1; setTimeout(() => el.style.opacity = 0, c.epigrafe ? 4200 : 3400); }
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
    if (S.fitas.f1 || S.flags.atendeu) h += `<h3>Quadro de chaves${S.fitas.f1 ? '' : ' (a voz no orelhão)'}</h3><div class="digits">${S.quadro.join('')}</div>`;
    if (S.fitas.f2) h += `<h3>Ordem das válvulas</h3><div class="digits">${S.ordem.join('-')}</div>`;
    el.innerHTML = h;
  } else if (abaDiario === 'regras') {
    let h = S.flags.regras ? `<div class="paper" style="transform:none;width:100%;max-height:none"><h2>${R.regras.titulo}</h2><p>${R.regras.texto}</p>${S.flags.verso ? `<p style="margin-top:14px">${fmtNota(R.regras.verso)}</p>` : ''}</div>` : '<p style="color:var(--fraco)">Você ainda não tem as regras.</p>';
    h += '<h3>O que você já viu</h3>';
    const best = [];
    if (S.flags.avist) best.push(['O Inspetor', 'Cego. Caça pelo som e estala a língua para se localizar: dá para ouvir onde ele está. Garrafas (G) o distraem. Escondida, prenda a respiração (ESPAÇO).']);
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
    const lista = [...R.notas.map(n => ({ ...n, tipo: 'n' })), ...R.paginas.map(n => ({ ...n, tipo: 'n' })), ...R.fitas.map(f => ({ ...f, tipo: 'f' }))].filter(n => !n.secreta || (n.tipo === 'f' ? S.fitas[n.id] : S.notes[n.id]));
    el.innerHTML = `<p style="color:var(--fraco);margin-bottom:12px">${loreAchado()} de ${totalLore()} encontradas ${loreAchado() >= totalLore() ? '· tudo descoberto' : '· o que abre o fim não está no papel: está no que você faz'}</p><div class="notas">` +
      lista.map(n => { const tem = n.tipo === 'f' ? S.fitas[n.id] : S.notes[n.id]; return `<div class="nota ${tem ? '' : 'x'}" data-id="${n.id}" data-t="${n.tipo}">${tem ? (n.secreta ? '✦ ' : '') + (n.tipo === 'f' ? '▶ ' : '') + n.titulo : '???'}</div>`; }).join('') + '</div>';
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
    if (H.codigo($('#k-tit').textContent, digitado)) { digitado = ''; if (teclado) $('#k-disp').textContent = '_'.repeat(n); return; }
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
  $('#pn-lista').innerHTML = R.conquistas.map(x => { const tem = c[x.id], esconde = x.secreta && !tem; return `<div class="it ${tem ? '' : 'x'}"><div><b>${esconde ? '???' : x.nome}</b><br><small>${esconde ? 'Um segredo do internato.' : x.desc}</small></div><span class="rank">${tem ? '✦' : ''}</span></div>`; }).join('');
  $('#title').hidden = true; $('#painel').hidden = false;
};

// Final
function final(tipo) {
  if (S.fim) return; S.fim = true;
  const F = R.finais[tipo];
  desativarInspetor(); despawnAna(true);
  conquista('final_' + tipo); if (S.dif === 'pesadelo') conquista('pesadelo'); H.aoFinal(tipo);
  $('#fx-black').style.opacity = 1; SFX.pararCanto();
  if (F.antes) setTimeout(() => cartao(F.antes.texto, 3), 300);
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  setTimeout(() => {
    unlock(); ui = 'final'; $('#hud').hidden = true; $('#escolha').hidden = true; $('#ending').hidden = false;
    $('#e-tit').textContent = F.titulo; revelar($('#e-txt'), H.textoFinal(tipo, F));
    const min = Math.floor(S.tempo / 60), seg = Math.floor(S.tempo % 60);
    $('#e-stats').innerHTML = `tempo total ${min}min ${String(seg).padStart(2, '0')}s · notas, páginas e fitas ${loreAchado()}/${totalLore()} · encontrada ${S.mortes}x · ${D().nome}<br>${H.statsFinal(tipo)}`;
    SFX.sino(.5, null);
  }, F.antes ? 3600 : 1600);
}
function escolhaFinal() {
  if (S.fim) return;
  if (!H.finalLiberado()) return final('comum');
  if (R.escolha) { $('#escolha h2').textContent = R.escolha.titulo; $('#escolha p').textContent = R.escolha.texto; $('#es-ir').textContent = R.escolha.ir; $('#es-voltar').textContent = R.escolha.voltar; }
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
  carregarMapa('estrada', 'carro'); H.aoComecar(S);
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
function carregarTitulo() { S = novoEstado('normal'); carregarMapa('estrada', 'titulo', { salvar: false }); H.titulo(); }
const H = instalarHistoria({ R, MAPAS, API, lsGet, lsSet, CONQ_KEY, P, M, ANA, PROC, W, SFX, falar, sub, toast, cartao, conquista, emitNoise, iniciarAudio, fecharTeclado, tocarFita, syncWorld, get S() { return S; }, get mode() { return mode; } });

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
    updateClima(dt); updateAlvo(); updateSegurar(dt); updateFita(dt); updateHUD(); updateSub(dt); updateAudio(dt); H.tick(dt);
  } else if (mode === 'jogo' && S && S.dead) updateAudio(dt);
  for (const d of W.doors) { d.ang = lerp(d.ang, d.target, Math.min(1, dt * 7)); d.pivot.rotation.y = d.ang; }
  grainT -= dt;
  if (grainT <= 0) { grainT = .05; const d = grainImg.data; for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } grain.putImageData(grainImg, 0, 0); }
  renderer.render(scene, camera);
}
requestAnimationFrame(loop);

window.__jogo = { get S() { return S; }, P, M, ANA, PROC, W, frame, carregarMapa, objDone, iniciarProcissao, spawnAna, ativarInspetor, camera, renderer, scene, hemi, moon, salvarCheckpoint, carregarSnap, lerNota, tocarFita, pularCena, roomAt, get ui() { return ui; }, get mode() { return mode; }, get alvo() { return alvo; }, keys, onKey, novoEstado: d => { S = novoEstado(d); return S; } };
