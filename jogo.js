// A HORA DO SILÊNCIO v2 — motor (Three.js). Mapas e conteúdo em mapas.js, texto em roteiro.js.
import * as THREE from 'three';
import { MAPAS } from './mapas.js';
import { instalarHistoria, fmtFala, fmtNota, escrever, revelar } from './src/historia.js';
import { criarSustos } from './src/sustos.js';
import { instalarVisual } from './src/visual.js';
import { instalarMundoVisual } from './src/visual-mundo.js';
import * as JG from './src/jogabilidade.js';
import { criarMundoJogavel } from './src/jogabilidade-mundo.js';
import { criarPolimento } from './src/jogabilidade-polimento.js';
import { criarInterface } from './src/interface.js';
import { PG } from './src/progressao.js';
import { PLAT } from './src/plataforma.js';
import { criarMonstrosLore } from './src/monstros-lore.js';
import { criarMonstrosPolimento } from './src/monstros-polimento.js';
import { instalarAudioMundo } from './src/audio-mundo.js';
import { instalarAudioPlataforma } from './src/audio-plataforma.js';

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
  pesadelo: { nome: 'Pesadelo', vel: 1.15, ouvido: 1.35, dano: 9, danoPor: { inspetor: 1.5, ana: 1.2, procissao: 1.05 }, pilha: 1.3, aviso: 5, intervalo: .7 }
};
const OPT = { sens: 1, vol: .8, agachar: 0, correr: 0, resp: 0, mic: 0 };
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
Object.assign(OPT, lsGet(OPT_KEY, {}));

// =====================================================================
// RENDER
// =====================================================================
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: PLAT.antialias(), powerPreference: 'high-performance' });
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
    // infiltração escorrendo do teto e mofo subindo do rodapé
    for (let i = 0; i < 7; i++) { const x = rand(0, w), ww = rand(6, 22), hh = rand(40, 150); const gr = g.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, 'rgba(30,26,14,.55)'); gr.addColorStop(1, 'rgba(30,26,14,0)'); g.fillStyle = gr; g.fillRect(x, 0, ww, hh); }
    stains(g, w, h, 6, 'rgba(20,34,18,.5)', 10, 34); for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${rand(10, 30) | 0},${rand(30, 48) | 0},${rand(14, 26) | 0},${rand(.2, .6)})`; g.fillRect(rand(0, w), h - Math.pow(Math.random(), 2) * h * .45, rand(1, 3), rand(1, 3)); }
    g.strokeStyle = 'rgba(10,8,6,.55)'; g.lineWidth = 1; for (let i = 0; i < 3; i++) { let x = rand(0, w), y = rand(0, h * .6); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += rand(-10, 10); y += rand(4, 14); g.lineTo(x, y); } g.stroke(); }
  }),
  azulejo: canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#8a9690'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = `hsl(150,6%,${rand(48, 58)}%)`; g.fillRect(x * 32 + 1, y * 32 + 1, 30, 30); }
    stains(g, w, h, 12, 'rgba(60,40,20,.55)'); speckle(g, w, h, 1500, ['#333', '#9a9'], 1, 2, .4);
    g.fillStyle = 'rgba(30,20,10,.6)'; g.fillRect(0, h * .7, w, h * .3);
    for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(40,36,30,.95)'; g.fillRect((rand(0, 8) | 0) * 32 + 1, (rand(0, 6) | 0) * 32 + 1, 30, 30); }
    g.strokeStyle = 'rgba(20,16,12,.7)'; for (let i = 0; i < 4; i++) { let x = rand(0, w), y = rand(0, h); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += rand(-16, 16); y += rand(-16, 16); g.lineTo(x, y); } g.stroke(); }
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
    g.strokeStyle = 'rgba(150,120,90,.18)'; for (let i = 0; i < 14; i++) { const x = rand(0, w), y = rand(0, h); g.lineWidth = rand(.5, 1.5); g.beginPath(); g.moveTo(x, y); g.lineTo(x + rand(-40, 40), y + rand(-6, 6)); g.stroke(); }
  }),
  ladrilho: canvasTex(256, 256, (g, w, h) => {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#5c5850' : '#2b2925'; g.fillRect(x * 32, y * 32, 32, 32); }
    g.strokeStyle = 'rgba(0,0,0,.5)'; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); }
    speckle(g, w, h, 2500, ['#111', '#777'], 1, 3, .35); stains(g, w, h, 8, 'rgba(30,20,10,.55)');
  }),
  concreto: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#3c3b38'; g.fillRect(0, 0, w, h); speckle(g, w, h, 5000, ['#2a2a28', '#55534e', '#1c1c1b'], 1, 3, .5); stains(g, w, h, 10, 'rgba(15,18,12,.6)'); for (let i = 0; i < 9; i++) { const x = rand(0, w), hh = rand(30, 200), gr = g.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, 'rgba(12,16,10,.6)'); gr.addColorStop(1, 'rgba(12,16,10,0)'); g.fillStyle = gr; g.fillRect(x, 0, rand(3, 9), hh); } }),
  grama: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#141910'; g.fillRect(0, 0, w, h); speckle(g, w, h, 6000, ['#1f2817', '#0c0f08', '#2a2a1a', '#30301f'], 1, 4, .7); }),
  terra: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#2a2018'; g.fillRect(0, 0, w, h); speckle(g, w, h, 6000, ['#1a140e', '#3a2c20', '#14100c'], 1, 4, .7); stains(g, w, h, 8, 'rgba(0,0,0,.4)'); }),
  asfalto: canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#1c1c1e'; g.fillRect(0, 0, w, h); speckle(g, w, h, 6000, ['#2a2a2c', '#111', '#333'], 1, 3, .6);
    g.fillStyle = 'rgba(200,180,90,.55)'; for (let y = 0; y < h; y += 64) g.fillRect(w / 2 - 3, y, 6, 36);
    stains(g, w, h, 6, 'rgba(0,0,0,.5)');
  }),
  telhado: canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#1e1513'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, y, w, 2); } speckle(g, w, h, 900, ['#2e201c', '#0d0908'], 1, 3, .6); }),
  papel: canvasTex(128, 160, (g, w, h) => { g.fillStyle = '#cdbf9f'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(40,30,20,.55)'; for (let y = 22; y < h - 14; y += 9) g.fillRect(12, y, rand(60, 104), 2); stains(g, w, h, 3, 'rgba(90,60,20,.35)'); g.fillStyle = 'rgba(60,45,25,.25)'; g.fillRect(0, h / 2 - 1, w, 2); g.fillRect(w / 2 - 1, 0, 1, h); g.fillStyle = 'rgba(255,250,230,.15)'; g.fillRect(0, h / 2 + 1, w, 1); }),
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
    g.fillStyle = 'rgba(160,40,30,.55)'; g.font = 'italic 34px Georgia'; g.save(); g.translate(330, 236); g.rotate(-.08); g.fillText('ELE OUVE.', 0, 0); g.restore();
  }),
  agua: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#0d1612'; g.fillRect(0, 0, w, h); stains(g, w, h, 30, 'rgba(60,80,60,.25)', 8, 40); speckle(g, w, h, 600, ['#2a3a2a', '#000'], 1, 3, .5); }),
  armario: canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = '#2e3a33'; g.fillRect(0, 0, w, h); speckle(g, w, h, 1800, ['#25302a', '#3c4a42', '#1a201c'], 1, 3, .5);
    for (let i = 0; i < 16; i++) { g.fillStyle = `rgba(${rand(70, 100) | 0},${rand(40, 52) | 0},20,${rand(.3, .7)})`; const x = rand(0, w), y = rand(0, h); g.beginPath(); g.ellipse(x, y, rand(2, 9), rand(2, 16), 0, 0, 7); g.fill(); }
    const gr = g.createLinearGradient(0, h * .8, 0, h); gr.addColorStop(0, 'rgba(70,40,18,0)'); gr.addColorStop(1, 'rgba(70,40,18,.75)'); g.fillStyle = gr; g.fillRect(0, h * .8, w, h * .2);
    g.fillStyle = 'rgba(200,190,160,.5)'; g.font = 'bold 22px Georgia'; g.textAlign = 'center'; g.fillText(String(rand(1, 40) | 0), w / 2, 34); g.strokeStyle = 'rgba(20,10,8,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2 - 18, 20); g.lineTo(w / 2 + 18, 30); g.stroke();
  }),
  lencol: canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#a49e8e'; g.fillRect(0, 0, w, h); stains(g, w, h, 6, 'rgba(90,70,40,.4)', 6, 30); stains(g, w, h, 2, 'rgba(80,10,10,.35)', 4, 14); })
};
for (const k in TX) TX[k].name = k;
const BUMP = { reboco: 1.2, tijolo: 2.2, pedra: 2.2, azulejo: 1, ladrilho: 1, concreto: 1.4, madeira: .8, terra: 1.5 };
function texMat(key, rx = 1, ry = 1, extra = {}) {
  const t = TX[key].clone(); t.needsUpdate = true; t.repeat.set(rx, ry); t.userData = { clone: true };
  const relevo = BUMP[key]; // relevo barato: a própria textura vira mapa de altura e a lanterna revela rachaduras e juntas
  return new THREE.MeshStandardMaterial({ map: t, roughness: .95, metalness: 0, ...(relevo ? { bumpMap: t, bumpScale: relevo } : {}), ...extra });
}
const comp = m => { m.userData.compartilhado = true; return m; };
const MAT = {
  porta: comp(texMat('madeira', 1, 1, { color: 0x8a7a66 })),
  madeiraEsc: comp(new THREE.MeshStandardMaterial({ color: 0x2a1d14, roughness: .9 })),
  madeira: comp(texMat('madeira', 1, 1)),
  metal: comp(new THREE.MeshStandardMaterial({ color: 0x444a4c, roughness: .55, metalness: .6 })),
  metalVerde: comp(new THREE.MeshStandardMaterial({ map: TX.armario, color: 0xb8c4bc, roughness: .6, metalness: .45 })),
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
  const it = interact(pivot, () => (d.trava && d.trava()) ? `${cap(d.nome)} — ${typeof d.msg === 'function' ? d.msg() : d.msg}` : rotuloPorta(d),
    () => { if (d.trava && d.trava()) { SFX.trancado(); emitNoise(d.x, d.z, 3); if (p.aoTentar) p.aoTentar(); return; } portaJogador(d); if (!d.open) d.fechadaEm = perf; aoPortaJogador(d); if (d.open && d.aoAbrir) d.aoAbrir(); });
  it.porta = d;
  if (p.hold) { it.hold = p.hold; it.ruido = p.ruidoHold || 8; it.som = 'forcar'; it.pode = () => !(d.trava && d.trava()) && !d.open; const lb = it.label; it.label = () => (!d.open && !(d.trava && d.trava())) ? `<b>E</b>${p.holdTexto || 'Forçar a ' + d.nome}` : lb(); }
  const k = `${W.mapa}:${d.id}`;
  if (S.doorsOpen[k]) { d.open = true; d.target = d.ang = -Math.PI * .56; pivot.rotation.y = d.ang; col.on = false; }
  return d;
}
function setDoor(d, open, silent) {
  if (!open && d.arrombada) return; // arrombada pelo Inspetor: fica aberta e torta até o fim do capítulo
  d.open = open; d.target = open ? -Math.PI * .56 : 0; d.col.on = !open; d.fresta = 0; d.vel = 7; d.quique = 0;
  S.doorsOpen[`${W.mapa}:${d.id}`] = open;
  if (!silent) { SFX.rangido(d.x, 1.2, d.z, 1, 'sfx', true); emitNoise(d.x, d.z, (open ? 4.5 : 5.5) * (P.devagar ? .6 : P.sprinting ? 1.3 : 1)); }
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
  interact(g, () => S.hidden === L ? '<b>E</b>Sair do armário · segure: em silêncio' : '<b>E</b>Esconder no armário' + dicaEntrar(), () => S.hidden === L ? sairEsconderijo() : SUST.armarioOcupado(L) || entrarEsconderijo(L));
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
  interact(g, () => S.hidden === H ? '<b>E</b>Sair de baixo da cama · segure: em silêncio' : '<b>E</b>Esconder embaixo da cama' + dicaEntrar(), () => S.hidden === H ? sairEsconderijo() : entrarEsconderijo(H));
  if (spotSala) W.spots[spotSala].cama.push({ x: x + (ao === 'x' ? -.3 : 0), y: .63, z: z + (ao === 'x' ? 0 : -.3) });
  return H;
}
function lampada(x, z, h = 3.2, alcance = 8, cor = 0xffc98a, base = 6) {
  box(.01, .5, .01, MAT.preto, x, h - .25, z, W.grupo, false);
  const bulbo = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshStandardMaterial({ color: 0x332e25, emissive: 0xffc070, emissiveIntensity: 0 }));
  bulbo.position.set(x, h - .55, z); W.grupo.add(bulbo);
  const luz = new THREE.PointLight(cor, 0, alcance, 1.2); luz.position.set(x, h - .65, z); W.grupo.add(luz);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_HALO, color: cor, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.set(.85, .85, 1); halo.position.copy(bulbo.position); W.grupo.add(halo);
  const L = { x, z, luz, bulbo, halo, base, alcance, flick: Math.random() * 10, sempre: false, ligada: false };
  W.lampadas.push(L); return L;
}
function vela(x, y, z) {
  cyl(.03, .03, .25, MAT.vela, x, y + .125, z, 8);
  const chama = new THREE.Mesh(new THREE.SphereGeometry(.016, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffc060 })); chama.scale.y = 2.4; chama.position.set(x, y + .29, z); W.grupo.add(chama);
  const l = new THREE.PointLight(0xff9a40, 1.2, 4.5, 1.8); l.position.set(x, y + .4, z); W.grupo.add(l); l.userData.vela = true;
  const ph = Math.random() * 10; VM.vela(x, y, z, l, chama); // cera e fumaça (src/visual-mundo.js)
  W.tick.push(() => { // chama tremula suave (sem pisca-pisca a cada quadro) e às vezes engasga; apagada (sustos), some
    if (l.userData.apagada) { l.intensity = 0; chama.visible = false; return; }
    const t = perf * 6 + ph, n = Math.sin(t) * .5 + Math.sin(t * 2.3 + 1) * .3 + Math.sin(t * 5.1) * .2;
    l.intensity = 1.25 + n * .22 - (Math.sin(t * .37) > .97 ? .5 : 0); chama.scale.set(1, 2.4 + n * .6, 1); chama.position.x = x + Math.sin(t * 1.7) * .003;
  });
  return l;
}
function gatilho(id, x0, x1, z0, z1, fn, once = true) { W.gatilhos.push({ id, x0, x1, z0, z1, fn, once }); }

// --- Itens
const TX_HALO = canvasTex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,230,190,.9)'); gr.addColorStop(.25, 'rgba(255,200,140,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const glow = (mat, c = 0x302010, i = .7) => { const m = mat.clone(); m.emissive = new THREE.Color(c); m.emissiveIntensity = i; m.userData = {}; return m; };
const ROLOS = []; // rolos dos gravadores (giram enquanto a fita toca)
const MK = {
  lanterna() { const g = new THREE.Group(); const c = cyl(.04, .05, .28, glow(MAT.metal, 0x332a1a, .6), 0, .05, 0, 10, g); c.rotation.z = Math.PI / 2; const lente = cyl(.053, .053, .02, new THREE.MeshStandardMaterial({ color: 0xfff2c0, emissive: 0xffe0a0, emissiveIntensity: .9, roughness: .1 }), .145, .05, 0, 12, g); lente.rotation.z = Math.PI / 2; box(.06, .025, .03, MAT.preto, -.02, .1, 0, g); return g; },
  pilha() { const g = new THREE.Group(); const c = cyl(.03, .03, .11, new THREE.MeshStandardMaterial({ color: 0xb08a2a, emissive: 0x4a3510, emissiveIntensity: .8, metalness: .5, roughness: .4 }), 0, .03, 0, 8, g); c.rotation.z = Math.PI / 2; const faixa = cyl(.031, .031, .035, MAT.preto, -.03, .03, 0, 8, g); faixa.rotation.z = Math.PI / 2; const polo = cyl(.012, .012, .014, MAT.metal, .062, .03, 0, 6, g); polo.rotation.z = Math.PI / 2; return g; },
  kit() { const g = new THREE.Group(); box(.32, .14, .22, new THREE.MeshStandardMaterial({ map: TX.kit, emissive: 0x2a2020, emissiveIntensity: .5 }), 0, .07, 0, g); box(.12, .025, .03, MAT.preto, 0, .155, 0, g); for (const s of [-1, 1]) box(.02, .04, .02, MAT.metal, s * .17, .07, .1, g); return g; },
  galao() { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: 0x7a1a12, emissive: 0x2a0805, emissiveIntensity: .7, roughness: .5 }); box(.3, .4, .18, m, 0, .2, 0, g); cyl(.03, .03, .1, MAT.preto, .08, .44, 0, 6, g); box(.14, .035, .04, m, -.05, .42, 0, g); for (const s of [-1, 1]) box(.27, .02, .005, MAT.preto, 0, .2 + s * .08, .092, g, false); return g; },
  fusivel() { const g = new THREE.Group(); const c = cyl(.035, .035, .16, new THREE.MeshStandardMaterial({ color: 0x9fb7c0, emissive: 0x203038, emissiveIntensity: 1, transparent: true, opacity: .85 }), 0, .04, 0, 8, g); c.rotation.z = Math.PI / 2; for (const s of [-1, 1]) { const t = cyl(.038, .038, .03, MAT.bronze, s * .08, .04, 0, 8, g); t.rotation.z = Math.PI / 2; } const fio = cyl(.004, .004, .14, new THREE.MeshBasicMaterial({ color: 0xffd080 }), 0, .04, 0, 4, g); fio.rotation.z = Math.PI / 2; return g; },
  nota() { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.PlaneGeometry(.24, .3), MAT.papel); m.rotation.x = -Math.PI / 2; m.rotation.z = rand(-.5, .5); m.position.y = .006; g.add(m); return g; },
  notaParede() { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.PlaneGeometry(.3, .38), MAT.papel)); return g; },
  pagina() { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.PlaneGeometry(.2, .26), glow(MAT.papel, 0x403420, 1.1)); m.rotation.x = -Math.PI / 2; m.rotation.z = rand(-.6, .6); m.position.y = .006; g.add(m); return g; },
  garrafa() { const g = new THREE.Group(); cyl(.04, .045, .22, new THREE.MeshStandardMaterial({ color: 0x1a3a20, roughness: .15, metalness: .2, emissive: 0x08140a, emissiveIntensity: .8, transparent: true, opacity: .9 }), 0, .11, 0, 8, g); cyl(.015, .02, .08, MAT.preto, 0, .26, 0, 6, g); cyl(.046, .046, .07, new THREE.MeshStandardMaterial({ color: 0x9a8a62, roughness: 1, emissive: 0x1a1408, emissiveIntensity: .6 }), 0, .1, 0, 8, g); return g; },
  chave() { const g = new THREE.Group(); const m = glow(MAT.bronze, 0x403010, .9); const arg = new THREE.Mesh(new THREE.TorusGeometry(.026, .007, 5, 12), m); arg.rotation.x = Math.PI / 2; arg.position.y = .006; g.add(arg); box(.12, .01, .02, m, .08, .006, 0, g); box(.015, .01, .025, m, .125, .006, .015, g); box(.012, .01, .018, m, .1, .006, .013, g); return g; },
  engrenagem() { const g = new THREE.Group(); const m = glow(MAT.bronze, 0x403010, 1); const t = new THREE.Mesh(new THREE.TorusGeometry(.05, .018, 6, 12), m); t.rotation.x = Math.PI / 2; t.position.y = .02; g.add(t); for (let i = 0; i < 8; i++) box(.025, .02, .025, m, Math.cos(i / 8 * 6.28) * .07, .02, Math.sin(i / 8 * 6.28) * .07, g); return g; },
  gravador() { const g = new THREE.Group(); box(.34, .1, .2, new THREE.MeshStandardMaterial({ color: 0x2a2a2c, roughness: .5, metalness: .3, emissive: 0x100c08, emissiveIntensity: .5 }), 0, .05, 0, g); box(.14, .01, .08, MAT.preto, -.05, .105, 0, g); box(.02, .02, .02, new THREE.MeshStandardMaterial({ emissive: 0xff2010, emissiveIntensity: 1 }), .13, .1, .07, g);
    const fita = new THREE.MeshStandardMaterial({ color: 0x5a4a36, roughness: .7, emissive: 0x140e08, emissiveIntensity: .6 });
    for (const x of [-.09, -.01]) { const r = new THREE.Group(); r.position.set(x, .114, 0); g.add(r); cyl(.028, .028, .012, fita, 0, 0, 0, 10, r); box(.05, .014, .006, MAT.preto, 0, .002, 0, r, false); ROLOS.push({ r, mapa: W.mapa }); }
    for (let i = 0; i < 3; i++) box(.025, .015, .02, MAT.metal, .07 + i * .03, .105, -.05, g, false);
    return g; },
  carrinho() { const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: 0x1d4a7a, emissive: 0x0a1a30, emissiveIntensity: .9, roughness: .4 }); box(.26, .08, .12, m, 0, .06, 0, g); box(.13, .07, .11, m, -.02, .13, 0, g); for (const [x, z] of [[-.08, -.065], [.08, -.065], [-.08, .065], [.08, .065]]) { const r = cyl(.025, .025, .02, MAT.preto, x, .025, z, 8, g); r.rotation.x = Math.PI / 2; } box(.1, .05, .115, MAT.vidro, -.02, .135, 0, g, false); return g; },
  boneca() { const g = new THREE.Group(); const p = new THREE.MeshStandardMaterial({ color: 0xc9b29a, emissive: 0x302018, emissiveIntensity: .7 }); const v = new THREE.MeshStandardMaterial({ color: 0x7a2030, emissive: 0x200810, emissiveIntensity: .7 }); cyl(.05, .09, .2, v, 0, .1, 0, 8, g); const h = new THREE.Mesh(new THREE.SphereGeometry(.055, 10, 8), p); h.position.y = .25; g.add(h); for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.009, 6, 4), MAT.preto); o.position.set(s * .02, .262, .05); g.add(o); } const cab = new THREE.Mesh(new THREE.SphereGeometry(.06, 10, 6, 0, Math.PI * 2, 0, 1.7), new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 1, emissive: 0x0a0604, emissiveIntensity: .6 })); cab.position.set(0, .255, -.008); g.add(cab); return g; },
  caderno() { const g = new THREE.Group(); box(.18, .03, .24, new THREE.MeshStandardMaterial({ color: 0x2d4a2a, emissive: 0x0c180b, emissiveIntensity: .9 }), 0, .015, 0, g); box(.17, .02, .005, new THREE.MeshStandardMaterial({ color: 0xcdbf9f, emissive: 0x2a2418, emissiveIntensity: .7 }), .002, .015, .119, g, false); box(.01, .032, .24, MAT.preto, -.088, .015, 0, g, false); return g; }
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
    S.picked[key] = true; JP.pegou(mesh, it.label()); mesh.visible = false; SFX.pegar(); emitNoise(pos.x, pos.z, 2.5);
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
    const it = interact(g, () => fitaTocando ? (fitaTocando.id === fid ? `<b>E</b>${S.fitas[fid] ? 'Parar a fita<small style="opacity:.6"> · segure: avançar (chiado alto)</small>' : fitaPausada ? 'Continuar a fita' : 'Pausar a fita'}` : 'O gravador está tocando...') : `<b>E</b>${S.fitas[fid] ? 'Ouvir de novo' : 'Ouvir'}: ${f.titulo}`, () => tocarFita(fid));
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
    for (let k = 0; k < n; k++) { const z = r.z0 + d * (k + .5) / n; mesaSimples(cx, z, w * .65, 1.1, .82, sp.mesa); for (const zb of [z - .85, z + .85]) if (!W.links.some(l => Math.abs(l.z - zb) < 1.25 && Math.abs(l.x - cx) < w * .33 + .8)) prop(w * .65, .45, .3, MAT.madeiraEsc, cx, .22, zb); } // banco na frente da porta não
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
    for (let i = 0; i < Math.min(3, Math.floor((w - 1) / 1.6)); i++) { let x = r.x0 + 1.2 + i * 1.6; while (W.links.some(l => Math.hypot(l.x - x, l.z - r.z1) < 1.3) && x < r.x1 - 1) x += .8; prop(.6, .85, .45, MAT.branco, x, .42, r.z1 - .35); sp.mesa.push({ x, y: .86, z: r.z1 - .4 }); plano(.5, .7, new THREE.MeshStandardMaterial({ color: 0x223, roughness: .05, metalness: .9 }), x, 1.6, r.z1 - .12, Math.PI); }
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
    // a mesa ficava na frente da porta do quarto da Irmã Celeste e não deixava entrar: vai para o canto livre
    const mz = W.links.some(l => Math.hypot(l.x - (r.x1 - 1.2), l.z - cz) < 1.8) ? r.z0 + 2.3 : cz;
    cama(r.x0 + 1.15, cz, 'x', r.id); mesaSimples(r.x1 - 1.2, mz, 1.2, .7, .8, sp.mesa, MAT.madeiraEsc);
    estante(cx, r.z0 + .3, 'x', 2, sp.prateleira, 1);
    for (let i = 0; i < 3; i++) vela(r.x1 - .9 + i * .2, .8, mz + .25);
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
    nichoNoTunel(r);
  }
}

// =====================================================================
// ESTADO
// =====================================================================
let S;
function perm3() { const a = [1, 2, 3]; for (let i = 2; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
function novoEstado(dif) {
  return PG.novo({
    dif, chapter: 0, done: {}, picked: {}, flags: {}, notes: {}, fitas: {}, visited: {}, doorsOpen: {},
    inv: { lanterna: false, galao: false, fusiveis: 0, pilhas: 0, kits: 0, garrafas: 0, engrenagens: 0, chaves: {}, reliquias: 0, pa: false },
    placed: 0, valv: [], tumulos: {},
    code: [1 + (Math.random() * 9 | 0), Math.random() * 10 | 0, 1 + (Math.random() * 9 | 0), Math.random() * 10 | 0],
    quadro: [1 + (Math.random() * 9 | 0), Math.random() * 10 | 0, Math.random() * 10 | 0],
    ordem: perm3(),
    health: 100, stamina: 100, ar: 100, battery: 55, fear: 0, flashOn: false,
    mapa: 'estrada', pos: [0, 0], yaw: 0, hidden: null,
    mortes: 0, tempo: 0, capT: 0, capDano: 0, capVisto: 0,
    timers: { procissao: 9999, ana: 9999, chamado: 9999 }
  });
}
// dificuldade: base + amuletos (progressão), "trecho mais leve" da tela de morte (interface) e a ajuda invisível depois de várias mortes (jogabilidade)
const D = () => {
  let b = PG.dif(S, DIFS);
  if (S.flags && S.flags.alivio === S.chapter) b = { ...b, vel: b.vel * .9, ouvido: b.ouvido * .9 };
  if (+OPT.avisoCedo && S && S.dif !== 'pesadelo') b = { ...b, aviso: b.aviso + 2 }; // avisos antecipados (acessibilidade): a Procissão avisa mais cedo
  const a = ajudaOculta(); return a ? { ...b, vel: b.vel * a.vel, ouvido: b.ouvido * a.ouvido, aviso: b.aviso + a.aviso } : b;
};
const loreBase = () => [...R.notas, ...R.paginas, ...R.fitas].filter(x => !x.secreta);
const totalLore = () => loreBase().length;
const loreAchado = () => loreBase().filter(x => (x.linhas ? S.fitas : S.notes)[x.id]).length;
const codTxt = s => s.replace(/\{d(\d)\}/g, (_, i) => S.code[i - 1]).replace(/\{q\}/g, S.quadro.join('')).replace(/\{v\}/g, S.ordem.join(' - '));

// =====================================================================
// JOGADOR
// =====================================================================
const P = { pos: new THREE.Vector3(), yaw: 0, pitch: 0, h: 1.62, bob: 0, stepAcc: 0, noiseR: 0, crouch: false, sprinting: false, shake: 0, room: null, naAgua: false, bloqueado: false,
  vx: 0, vz: 0, hv: 0, camK: 1, camDe: new THREE.Vector3(), giro: 0, sensMul: 1, eBuf: 0, alvoAnt: null, alvoAntEm: -99, trombaCd: 0, tropecoT: 0, tropecoEm: -99, yawAnt: 0, sentada: false, paradoT: 0, pilhaT: 0, agachadaT: 0, rollLado: 0, sombra: 0,
  devagar: false, prende: false, semAr: false, pulso: 0, ofegoT: 0, ofegoRuidoT: 0, corridaT: 0, olhar: 0, incl: 0, baixar: 0, curaT: 0, mirarG: 0, saidaT: 0, portaT: 0, portaIt: null, sacudirT: 0, correrTrava: false, arTrava: false, espiar: 0, causaRuido: null, causaRuidoEm: -99 };
const keys = {};
let locked = false, mode = 'titulo', ui = null, alvo = null, perf = 0;
JG.montarHUD();
for (const c of JG.TXT.conquistas) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
addEventListener('keydown', e => { if (JP.bloqueia(e)) return; if (e.code === 'Tab' || e.code === 'Space' || e.code === 'AltLeft' || e.code === 'AltRight') e.preventDefault(); keys[e.code] = true; if (!e.repeat) onKey(e); });
addEventListener('keyup', e => { keys[e.code] = false; if (e.code === 'AltLeft' || e.code === 'AltRight') e.preventDefault(); onKeyUp(e); UIX.soltou(e); });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; P.mirarG = 0; });
addEventListener('mousedown', e => { if (e.button === 1) { keys.Mouse1 = true; e.preventDefault(); } });
addEventListener('mouseup', e => { if (e.button === 1) keys.Mouse1 = false; });
// Ctrl+W e F5 no meio da fuga: o navegador pergunta antes de fechar a aba
addEventListener('beforeunload', e => { if (mode === 'jogo' && S && !S.dead && !S.fim && !window.__teste) { e.preventDefault(); e.returnValue = ''; } });
// trocar de aba (ou o celular tocar) pausa o jogo e o som
document.addEventListener('visibilitychange', () => {
  if (window.__teste || !AC) return;
  if (document.hidden) { if (mode === 'jogo' && !ui && S && !S.dead && !S.fim) abrirPausa(); try { AC.suspend(); } catch (e) {} }
  else if (ui !== 'pausa') { try { AC.resume(); } catch (e) {} }
});
addEventListener('mousemove', e => {
  if (!locked || mode !== 'jogo' || ui || !S || S.dead || P.bloqueado) return;
  const k = .0022 * OPT.sens * (P.sensMul || 1); // mais fino escondida e mirando a garrafa; atrito sobre o que dá para usar (src/jogabilidade-polimento.js)
  P.yaw -= e.movementX * k; P.pitch = clamp(P.pitch - e.movementY * k * (OPT.invY ? -1 : 1), -1.45, 1.45);
  if (S.hidden) {
    const cama = S.hidden.tipo === 'cama', base = Math.atan2(-S.hidden.face[0], -S.hidden.face[1]); let d = P.yaw - base; d = Math.atan2(Math.sin(d), Math.cos(d));
    P.yaw = base + clamp(d, cama ? -1.1 : -.75, cama ? 1.1 : .75); P.pitch = clamp(P.pitch, cama ? -.45 : -.35, cama ? .22 : .35);
  }
});
document.addEventListener('pointerlockchange', () => {
  const tinha = locked; locked = document.pointerLockElement === canvas;
  // só pausa quando o mouse estava preso e se soltou (um pedido recusado pelo navegador não reabre a pausa)
  if (tinha && !locked && mode === 'jogo' && !ui && S && !S.dead && !S.fim && !window.__teste) abrirPausa(); // no kit de teste o Chrome sem tela solta o mouse sozinho
});
canvas.addEventListener('click', () => { if ((mode === 'jogo' || mode === 'cena') && !ui) lockPointer(); });
$('#clique').addEventListener('click', () => lockPointer());
function lockPointer() { if (PLAT.semTrava && PLAT.semTrava()) return; try { const op = PLAT.travaOpcoes && PLAT.travaOpcoes(); const p = op ? canvas.requestPointerLock(op) : canvas.requestPointerLock(); if (p && p.catch) p.catch(() => { if (op) { try { const q = canvas.requestPointerLock(); if (q && q.catch) q.catch(() => {}); } catch (e2) {} } }); } catch (e) {} }
const unlock = () => { if (document.pointerLockElement) document.exitPointerLock(); };

// opções de controle (agachar/correr/respirar segurando ou alternando) e o microfone
let micPedido = false;
JG.montarOpcoes(OPT, (k, v) => { setOpt(k, v); if (k === 'mic') { micPedido = false; if (!+v) JG.desligarMic(); } });

function onKey(e) {
  if (UIX.tecla(e)) return;
  if (mode === 'cena') { if (e.code === 'Escape' || e.code === 'Enter' || e.code === 'Space') pularCena(); else if (W.def.cena && W.def.cena.tecla) W.def.cena.tecla(e.code); return; }
  if (ui === 'dialogo') { if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') avancarDialogo(); return; }
  if (ui === 'nota') { if (e.code === 'KeyE' || e.code === 'Escape' || e.code === 'Enter') fecharNota(); else if (e.code === 'KeyV') virarRegras(); else if (e.code === 'KeyL') lerVoz(); return; }
  if (ui === 'diario') { if (e.code === 'Tab' || e.code === 'Escape' || e.code === 'KeyJ') fecharDiario(); else trocarAba(e); return; }
  if (ui === 'teclado') { tecladoKey(e); return; }
  if (ui === 'morte') { if ((e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') && !$('#death').hidden) $('#dt-retry').click(); return; }
  if (mode !== 'jogo' || ui || !S || S.dead) return;
  if (JM.tecla(e)) return; // T fone, B rádio
  if (e.code !== 'KeyQ' && e.code !== 'KeyZ' && e.code !== 'KeyX') silencioT = 0;
  switch (e.code) {
    case 'KeyE':
      if (S.hidden) { P.saidaT = .001; break; }
    {
      let a = alvo;
      // a mira escapou do esconderijo por um instante no meio da fuga: o E ainda vale
      if (!a && P.alvoAnt && perf - P.alvoAntEm < .12 && S.dif !== 'pesadelo' && ehEsconderijo(P.alvoAnt) && P.alvoAnt.on()) a = P.alvoAnt;
      if (a && a.porta && !a.hold && !(a.porta.trava && a.porta.trava())) { P.portaT = .001; P.portaIt = a; P.portaFecha = a.porta.open || a.porta.fresta > 0; P.portaA0 = a.porta.ang; P.portaMexeu = false; break; }
      if (a && !a.hold) a.act();
      else if (!a && !entrarMaisPerto() && S.dif !== 'pesadelo') P.eBuf = .15; // E apertado um instante cedo demais: vale quando o esconderijo entrar na mira
    }
      break;
    case 'KeyF':
      if (!S.inv.lanterna) break;
      if (P.pilhaT > 0) { toast('Trocando a pilha...'); break; }
      if (SUST.bater()) break;
      if (falhaT > 0) { falhaT = Math.max(0, falhaT - 1.3); SFX.clique(); SFX.trancado(); emitNoise(P.pos.x, P.pos.z, 2, true); P.shake = Math.max(P.shake, .03); if (falhaT <= 0) toast('A luz voltou.'); break; }
      if (S.battery <= 0) { toast(S.inv.pilhas ? `Sem pilha. ${JP.t('KeyR')} para trocar.` : `Sem pilha. Segure ${JP.t('KeyR')} para sacudir a lanterna.`); SFX.clique(); break; }
      if (perf - ultimoF < .45 && S.battery < 25 && consertoT <= 0) { consertoT = 20; toast('Você bateu na lanterna. A luz firmou por um tempo.'); emitNoise(P.pos.x, P.pos.z, 4, true); SFX.trancado(); }
      ultimoF = perf;
      S.flashOn = !S.flashOn; SFX.interruptor(S.flashOn); emitNoise(P.pos.x, P.pos.z, 1.2); SUST.aoLanterna(); break;
    case 'KeyV': { const c = chamadoArmadilha; SUST.responder(); if (c && !chamadoArmadilha) H.respondeu(); } break;
    case 'KeyR': if (S.inv.lanterna && S.inv.pilhas <= 0 && S.battery < 15) P.sacudirT = .001; else trocarPilha(); break;
    case 'KeyH': iniciarCurativo(); break;
    case 'KeyG': if (!S.hidden && S.inv.garrafas > 0) P.mirarG = .001; else jogarGarrafa(); break;
    case 'Tab': case 'KeyJ': abrirDiario(); break;
    case 'KeyC': if (!S.hidden) { if (P.sentada) { levantar(); break; } P.crouch = OPT.agachar === 'segurar' ? true : !P.crouch; if (P.crouch) dicaAgachar(); } break;
    case 'ShiftLeft': case 'ShiftRight': if (OPT.correr) P.correrTrava = !P.correrTrava; break;
    case 'Space': if (OPT.resp) P.arTrava = !P.arTrava; break;
  }
}
function onKeyUp(e) {
  if (!S) return;
  if (e.code === 'KeyC' && OPT.agachar === 'segurar') P.crouch = false;
  if (e.code === 'KeyG' && P.mirarG > 0) { P.mirarG = 0; mira.visible = false; if (mode === 'jogo' && !ui && !S.dead) jogarGarrafa(); }
}
function dicaAgachar() { if (S.flags.dicaAgachar) return; S.flags.dicaAgachar = true; toast(JP.t('Alt') === 'ALT' ? 'Agachada, quase não se ouve. Segure ALT para andar devagar em pé. (Não use Ctrl: o navegador fecha a aba.)' : `Agachada, quase não se ouve. Em pé, use ${JP.t('Alt')} para andar devagar.`); }
// trocar a pilha leva tempo: a luz apaga, a pilha velha cai e quica no chão (barulho pequeno) e a nova entra com um clique
let flashBoost = 0;
function trocarPilha() {
  if (!S.inv.lanterna || P.pilhaT > 0) return;
  if (S.inv.pilhas <= 0) { toast(S.battery < 15 ? `Sem pilhas. Segure ${JP.t('KeyR')} para sacudir a lanterna.` : 'Você não tem pilhas.'); return; }
  if (S.battery > 85) { toast('A pilha ainda está boa.'); return; }
  P.pilhaT = .001; P.pilhaCaiu = false; S.flashOn = false; SFX.clique();
  if (!S.flags.dicaPilhaTempo) { S.flags.dicaPilhaTempo = true; toast('Trocar a pilha leva um segundo no escuro. Escolha bem a hora.'); }
}
function updatePilha(dt) {
  if (!(P.pilhaT > 0)) return;
  P.pilhaT += dt; S.flashOn = false; mostrarHold(P.pilhaT / 1.2);
  if (!P.pilhaCaiu && P.pilhaT > .45) { P.pilhaCaiu = true; if (!S.hidden) JP.soltarPilha(MK.pilha()); else { JP.som.tilintar(undefined, 0, 0, .6); emitNoise(P.pos.x, P.pos.z, 1.5, true); } }
  if (P.pilhaT >= 1.2) {
    P.pilhaT = 0; S.inv.pilhas--; S.battery = 100; S.flashOn = true; flashBoost = 1; SFX.pilha(); toast('Pilha nova.'); renderInvMini();
    JP.vibrar(.2, .4, 60);
  }
}
// curativo leva tempo: segure H parada
function iniciarCurativo() {
  if (S.inv.kits <= 0) { toast('Você não tem curativos.'); return; }
  if (S.health >= 100) { toast('Você não está ferida.'); return; }
  P.curaT = .001; SFX.papel(); emitNoise(P.pos.x, P.pos.z, 3, true);
  if (!S.flags.dicaCura) { S.flags.dicaCura = true; toast(`Segure ${JP.t('KeyH')} parada para fazer o curativo.`); }
}
function usarKit() { S.inv.kits--; PG.kit(); S.health = Math.min(100, S.health + 50); SFX.pegar(); toast('Melhor assim.'); renderInvMini(); }
function updateCura(dt, moving) {
  if (P.curaT <= 0) return;
  if (!keys.KeyH || moving) { P.curaT = 0; toast('Você parou o curativo.'); return; }
  P.curaT += dt; mostrarHold(P.curaT / 2.5);
  if (P.curaT >= 2.5) { P.curaT = 0; usarKit(); }
}
// sacudir a lanterna sem pilha: um pouco de luz em troca de barulho
let sacudidaEm = -99;
function updateSacudir(dt) {
  if (P.sacudirT <= 0) return;
  if (!keys.KeyR) { P.sacudirT = 0; return; }
  P.sacudirT += dt; P.shake = Math.max(P.shake, .012); mostrarHold(P.sacudirT);
  if (P.sacudirT >= 1) {
    P.sacudirT = 0; SFX.trancado(); SFX.trancado(); emitNoise(P.pos.x, P.pos.z, 3, true);
    if (perf - sacudidaEm < 40) { toast('A lanterna não responde. Espere um pouco.'); return; }
    sacudidaEm = perf; S.battery = Math.min(100, S.battery + 8); S.flashOn = true; SFX.clique(); toast('Você sacudiu a lanterna. Um fio de luz voltou.');
  }
}
// garrafa: toque arremessa, segurar G mostra o arco
const garrafasVoando = [], cacos = [], ondas = [], _rcG = new THREE.Raycaster(), _rcV = new THREE.Raycaster(), _vV = new THREE.Vector3(), _vF = new THREE.Vector3(), _vA = new THREE.Vector3(), _vU = new THREE.Vector3();
const _dirG = new THREE.Vector3(), _fimG = new THREE.Vector3(), _iniG = new THREE.Vector3(), _centroTela = { x: 0, y: 0 };
// mirar a garrafa não cria vetores novos a cada quadro (menos travadinhas em notebook fraco)
function alvoGarrafa(fim = new THREE.Vector3()) {
  const rc = _rcG; rc.setFromCamera(_centroTela, camera); rc.far = 16;
  const hits = rc.intersectObjects(W.solid, false);
  const dir = _dirG; camera.getWorldDirection(dir);
  if (hits.length) fim.copy(hits[0].point).addScaledVector(dir, -.25); else fim.copy(camera.position).addScaledVector(dir, 14);
  if (fim.y < 0) { const t = (camera.position.y - .05) / Math.max(.01, -dir.y); fim.copy(camera.position).addScaledVector(dir, Math.min(14, t)); }
  fim.y = Math.max(.05, fim.y);
  return { fim, perto: Math.hypot(fim.x - P.pos.x, fim.z - P.pos.z) < 3 };
}
// onde a garrafa cai muda o barulho: madeira quica antes de quebrar, pedra estoura alto, tapete abafa, terra engole
function superficie(x, z) {
  const r = roomAt(x, z);
  if (r && r.agua && !S.flags.aguaBaixa) return { tipo: 'agua', r: 7, cor: 0x8fb4c0 };
  const p = r && r.piso || (r && r.fora ? 'grama' : 'concreto');
  if (p === 'terra' || p === 'grama') return { tipo: 'terra', r: 7, cor: 0x9a8a5a };
  if (p === 'tapete') return { tipo: 'tapete', r: 10, cor: 0xc8b48a };
  if (p === 'madeira') return { tipo: 'madeira', r: 17, cor: 0xe9dfc8 };
  return { tipo: 'pedra', r: 17, cor: 0xf4ead2 };
}
function jogarGarrafa() {
  if (S.hidden) return;
  if (S.inv.garrafas <= 0) { toast('Sem garrafas para jogar.'); return; }
  S.inv.garrafas--; PG.garrafa(); renderInvMini();
  const { fim } = alvoGarrafa();
  const m = MK.garrafa(); m.position.copy(camera.position); W.grupo.add(m);
  garrafasVoando.push({ m, ini: camera.position.clone(), fim, t: 0, dur: clamp(fim.distanceTo(camera.position) / 14, .2, .9), grupo: W.grupo });
  SFX.arremesso();
}
const mira = new THREE.Group(); mira.visible = false; scene.add(mira);
const miraLinha = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 20 }, () => new THREE.Vector3())), new THREE.LineBasicMaterial({ color: 0xe9dfc8, transparent: true, opacity: .35, depthWrite: false }));
const miraAlvo = new THREE.Mesh(new THREE.RingGeometry(.2, .26, 24), new THREE.MeshBasicMaterial({ color: 0xe9dfc8, transparent: true, opacity: .5, side: THREE.DoubleSide, depthWrite: false }));
miraAlvo.rotation.x = -Math.PI / 2; mira.add(miraLinha, miraAlvo); miraLinha.frustumCulled = false;
function updateMira(dt) {
  if (!(P.mirarG > 0) || S.hidden) { mira.visible = false; return; }
  P.mirarG += dt;
  if (P.mirarG < .3 || S.dif === 'pesadelo') { mira.visible = false; return; }
  const { fim, perto } = alvoGarrafa(_fimG), ini = _iniG.copy(camera.position); ini.y -= .15;
  const sup = superficie(fim.x, fim.z);
  const pos = miraLinha.geometry.attributes.position;
  for (let i = 0; i < 20; i++) { const k = i / 19, x = lerp(ini.x, fim.x, k), z = lerp(ini.z, fim.z, k), y = lerp(ini.y, fim.y, k) + Math.sin(k * Math.PI) * 1.2; pos.setXYZ(i, x, y, z); }
  pos.needsUpdate = true;
  // o anel mostra a superfície e o tamanho do barulho que a garrafa vai fazer lá
  miraAlvo.position.set(fim.x, .04, fim.z); miraAlvo.scale.setScalar(clamp(sup.r / 12, .6, 1.5)); miraAlvo.material.opacity = sup.tipo === 'terra' ? .3 : .5;
  miraAlvo.material.color.set(perto ? 0xc0392b : sup.cor); miraLinha.material.color.set(perto ? 0xc0392b : 0xe9dfc8);
  mira.visible = true;
}
function updateGarrafas(dt) {
  for (let i = garrafasVoando.length - 1; i >= 0; i--) {
    const g = garrafasVoando[i]; g.t += dt / g.dur;
    if (g.grupo !== W.grupo) { garrafasVoando.splice(i, 1); continue; }
    g.m.position.lerpVectors(g.ini, g.fim, Math.min(1, g.t)); g.m.position.y += Math.sin(Math.min(1, g.t) * Math.PI) * 1.2; g.m.rotation.x += dt * 12;
    if (g.t >= 1) {
      W.grupo.remove(g.m); garrafasVoando.splice(i, 1);
      if (SUST.garrafaVolta(g.fim)) continue;
      const sup = superficie(g.fim.x, g.fim.z);
      const antes = M.ativo ? M.state : null;
      if (sup.tipo === 'agua') { SFX.passo(1, 'pedra', false, true); criarOnda(g.fim.x, g.fim.z); emitNoise(g.fim.x, g.fim.z, 7, false, true); }
      else if (sup.tipo === 'terra') { JP.som.terra(g.fim.x, g.fim.z); emitNoise(g.fim.x, g.fim.z, 7, false, true); if (!S.flags.dicaGarrafaTerra) { S.flags.dicaGarrafaTerra = true; toast('Na terra a garrafa não quebra. Quase não faz barulho.'); } }
      else if (sup.tipo === 'madeira') { // quica uma vez na madeira (tinido) e só então estoura, meio metro adiante
        JP.som.quique(g.fim.x, g.fim.z); emitNoise(g.fim.x, g.fim.z, 5, false, true);
        const p = g.fim.clone(), dx = g.fim.x - g.ini.x, dz = g.fim.z - g.ini.z, l = Math.hypot(dx, dz) || 1; p.x += dx / l * .5; p.z += dz / l * .5; collide(p, .15);
        quiques.push({ p, t: .3, grupo: W.grupo }); continue;
      }
      else quebrarGarrafa(g.fim, sup.tipo === 'tapete' ? 10 : 17);
      if (antes !== null && M.state === 'investiga' && M.alvoGarrafa) conquista('garrafa');
    }
  }
  for (let i = quiques.length - 1; i >= 0; i--) {
    const q = quiques[i]; q.t -= dt;
    if (q.grupo !== W.grupo) { quiques.splice(i, 1); continue; }
    if (q.t > 0) continue;
    quiques.splice(i, 1); const antes = M.ativo ? M.state : null;
    quebrarGarrafa(q.p, 17);
    if (antes !== null && M.state === 'investiga' && M.alvoGarrafa) conquista('garrafa');
  }
}
const quiques = [];
// os cacos da garrafa ficam no chão por dez minutos: você pode criar o seu próprio campo minado
function quebrarGarrafa(p, r) { SFX.vidro(p.x, p.z); emitNoise(p.x, p.z, r, false, true); criarCacos(p.x, p.z, 600); }
// cacos de vidro no chão: quem pisa faz barulho (agachada não)
const MAT_CACO = new THREE.MeshStandardMaterial({ color: 0x9fb4a8, roughness: .08, metalness: .8, emissive: 0x0c1410, emissiveIntensity: .7 });
MAT_CACO.userData.compartilhado = true;
const GEO_CACO = new THREE.BoxGeometry(1, .006, 1); // uma geometria só para todos os cacos (antes eram nove por monte)
function criarCacos(x, z, vida = 60) {
  const g = new THREE.Group(); g.position.set(x, .012, z);
  for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(GEO_CACO, MAT_CACO); m.scale.set(rand(.03, .09), 1, rand(.02, .06)); m.position.set(rand(-.3, .3), 0, rand(-.3, .3)); m.rotation.y = rand(0, 6.28); g.add(m); }
  W.grupo.add(g); cacos.push({ g, x, z, t: vida, coolP: 0, coolM: 0, grupo: W.grupo, garrafa: vida !== Infinity });
}
function updateCacos(dt) {
  // os cacos brilham no feixe da lanterna
  MAT_CACO.emissiveIntensity = S.flashOn ? .8 + .7 * Math.abs(Math.sin(perf * 5.3)) * Math.abs(Math.sin(perf * 2.1)) : .7;
  for (let i = cacos.length - 1; i >= 0; i--) {
    const c = cacos[i]; c.t -= dt; c.coolP -= dt; c.coolM -= dt;
    if (c.grupo !== W.grupo || c.t <= 0) { if (c.grupo === W.grupo) W.grupo.remove(c.g); cacos.splice(i, 1); continue; }
    if (c.t < 3) c.g.scale.setScalar(Math.max(.01, c.t / 3));
    if (!S.hidden && c.coolP <= 0 && P.noiseR > 0 && !P.crouch && Math.hypot(P.pos.x - c.x, P.pos.z - c.z) < .5) {
      c.coolP = 1.5; SFX.vidro(c.x, c.z); emitNoise(c.x, c.z, P.devagar ? 4 : 8, true); marcarCausa('cacos');
      if (!S.flags.dicaCacos) { S.flags.dicaCacos = true; toast('Vidro no chão. Agachada, você passa por cima sem barulho.'); }
    }
    if (M.ativo && c.coolM <= 0 && Math.hypot(M.pos.x - c.x, M.pos.z - c.z) < .6) { c.coolM = 6; M.wait = Math.max(M.wait, 1.6); SFX.vidro(c.x, c.z); SFX.voz(M.pos); if (c.garrafa) conquista('cacos'); }
  }
}
// ondas na água a cada passo
const GEO_ONDA = new THREE.RingGeometry(.12, .16, 18); // geometria compartilhada pelas ondas
function criarOnda(x, z) { const m = new THREE.Mesh(GEO_ONDA, new THREE.MeshBasicMaterial({ color: 0xbfd0c8, transparent: true, opacity: .45, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, .435, z); W.grupo.add(m); ondas.push({ m, t: 0, grupo: W.grupo }); }
function updateOndas(dt) {
  for (let i = ondas.length - 1; i >= 0; i--) {
    const o = ondas[i]; o.t += dt;
    if (o.grupo !== W.grupo || o.t > .9) { if (o.grupo === W.grupo) W.grupo.remove(o.m); o.m.material.dispose(); ondas.splice(i, 1); continue; }
    o.m.scale.setScalar(1 + o.t * 7); o.m.material.opacity = .45 * (1 - o.t / .9);
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

// --- Respiração: fôlego próprio (S.ar), separado da corrida, e um pulso que mostra quando você vai soltar o ar
const segurandoAr = () => OPT.resp ? P.arTrava : !!keys.Space;
function marcarCausa(c) { P.causaRuido = c; P.causaRuidoEm = perf; }
function updateRespiracao(dt, perto, dM) {
  const gasto = S.dif === 'facil' ? 10 : S.dif === 'pesadelo' ? 18 : 15;
  if (S.ar === undefined) S.ar = 100;
  if (P.semAr && !segurandoAr() && S.ar > 25) P.semAr = false;
  const prendia = P.prende;
  P.prende = segurandoAr() && !P.semAr && S.ar > 0;
  if (P.prende) {
    S.ar = Math.max(0, S.ar - gasto * dt);
    if (S.ar <= 0) { P.prende = false; P.semAr = true; P.arTrava = false; emitNoise(P.pos.x, P.pos.z, 6, true); marcarCausa('respirou'); SFX.ofego(); toast('Você puxou o ar alto demais!'); P.pulso = 30; }
  } else {
    if (prendia && !P.semAr) { if (S.ar < 10) { emitNoise(P.pos.x, P.pos.z, 6, true); marcarCausa('respirou'); SFX.ofego(); } else if (S.ar < 30) { emitNoise(P.pos.x, P.pos.z, 1.5, true); SFX.ofego(); } }
    S.ar = Math.min(100, S.ar + (S.hidden ? 9 : 22) * dt);
  }
  const fator = (S.dif === 'facil' ? .7 : S.dif === 'pesadelo' ? 1.3 : 1) * (Math.abs(P.espiar) > .3 ? 1.4 : 1);
  if (perto && !P.prende) P.pulso += Math.max(0, 5.5 - dM) * 9 * fator * dt;
  else P.pulso -= (P.prende ? 22 : 12) * dt;
  P.pulso = clamp(P.pulso, 0, 100);
  if (P.pulso >= 100) { P.pulso = 35; emitNoise(P.pos.x, P.pos.z, 2.3, true); marcarCausa('respirou'); SFX.ofego(); toast('[você soltou o ar]'); }
}
function hudRespiracao(perto, dM) {
  const br = $('#breath'); br.hidden = !perto;
  const fx = $('#fx-prende'); if (fx) fx.style.opacity = P.prende ? .85 : P.ofegoT > 0 ? .45 : 0;
  if (!perto) return;
  $('#b-breath').style.setProperty('--v', S.ar + '%');
  const bp = $('#b-pulso'); if (bp) bp.style.setProperty('--v', P.pulso + '%');
  const be = $('#b-estagio'); if (be) be.textContent = (teste ? '[ele parou na porta] · ' : '') + (dM < 2 ? 'ele está do seu lado' : dM < 3.6 ? 'ele está perto' : 'ele está no quarto') + (S.ar < 25 ? ' · [seu peito queima]' : '');
  br.classList.toggle('queima', S.ar < 25);
}
let holdProprio = false;
function mostrarHold(k) { holdProprio = true; $('#hold').hidden = false; $('#hold-arc').style.strokeDashoffset = 138.2 * (1 - clamp(k, 0, 1)); }
// --- Portas com peso: o jeito de andar decide o barulho. Devagar (ALT) ou agachada, ela gira lenta e quase muda;
// correndo, escancara, bate na parede e chama ele. Segurar E abre (ou fecha) aos poucos; soltar no meio deixa uma fresta.
const ABERTA = -Math.PI * .56;
function passoPorta() { return (P.sprinting || perf - correuEm < .35) ? 'correndo' : (P.devagar || P.crouch || keys.AltLeft || keys.AltRight) ? 'devagar' : 'normal'; }
function rotuloPorta(d) {
  const modo = passoPorta(), r = modo === 'devagar' ? 1 : modo === 'correndo' ? 10 : d.fresta ? 2.5 : 5;
  const acao = d.open ? 'Fechar' : d.fresta ? 'Abrir de vez' : 'Abrir';
  const seg = d.open ? 'fechar em silêncio' : d.fresta ? 'encostar sem barulho' : 'abrir devagar';
  return `<b>E</b>${acao} ${d.nome}<small style="opacity:.6"> · tocar: rápido · segurar: ${seg}${modo === 'correndo' ? ' · correndo, ela bate' : ''}</small><span class="onda" title="barulho que a porta vai fazer">${r >= 9 ? '((·))' : r >= 4 ? '(·)' : '·'}</span>`;
}
function portaJogador(d) {
  const modo = passoPorta(), abrir = !d.open, fresta = d.fresta > 0;
  const kc = 'cara:' + (d.id || d.x + ',' + d.z), naCara = !abrir && M.ativo && M.state === 'caca' && !S.flags.sino && Math.hypot(M.pos.x - d.x, M.pos.z - d.z) < 3 && !((M.portaCd && M.portaCd[kc]) > 0);
  if (modo === 'devagar') {
    setDoor(d, abrir, true); d.vel = 2.4; SFX.rangido(d.x, 1.2, d.z, .16); emitNoise(d.x, d.z, 1);
  } else if (modo === 'correndo') {
    setDoor(d, abrir, true); d.vel = 18; d.quique = .5;
    SFX.rangido(d.x, 1.2, d.z, 1.2); SFX.pancada(d.x, d.z); SFX.portaBate(); emitNoise(d.x, d.z, (abrir ? 4.5 : 5.5) * 2); marcarCausa('porta');
    P.shake = Math.max(P.shake, .07); JP.vibrar(.6, .3, 140);
    if (naCara) M.wait = Math.max(M.wait, 2.8); // batida com força na cara dele: fica tonto por mais tempo
    if (!S.flags.dicaPortaBate) { S.flags.dicaPortaBate = true; toast(`Correndo, a porta bate na parede e ele ouve. Com ${JP.t('Alt')} ela abre devagar.`); }
  } else if (fresta && abrir) { setDoor(d, true, true); d.vel = 5; SFX.rangido(d.x, 1.2, d.z, .45); emitNoise(d.x, d.z, 2.5); } // já entreaberta: empurrar faz menos barulho
  else setDoor(d, abrir);
}
function deixarFresta(d, k) { d.open = false; d.col.on = true; d.fresta = k; d.vel = 9; d.target = ABERTA * k; S.doorsOpen[`${W.mapa}:${d.id}`] = false; }
function updatePorta(dt) {
  if (P.portaT <= 0) return;
  const it = P.portaIt, d = it && it.porta;
  // correção: a porta girando saía da mira e cancelava o "segurar"; agora vale enquanto você estiver perto dela
  if (!d || S.hidden || Math.hypot(d.x - P.pos.x, d.z - P.pos.z) > 2.6 || (d.trava && d.trava())) { P.portaT = 0; return; }
  if (keys.KeyE) {
    P.portaT += dt; if (P.portaT <= .3) return;
    const k = clamp((P.portaT - .3) / 1.1, 0, 1); mostrarHold(k);
    if (!P.portaMexeu) { P.portaMexeu = true; SFX.rangido(d.x, 1.2, d.z, .1); }
    d.vel = 9; d.target = P.portaFecha ? P.portaA0 * (1 - k) : ABERTA * k; // a folha acompanha o tempo segurado
    if (k >= 1) {
      P.portaT = 0; P.portaMexeu = false;
      setDoor(d, !P.portaFecha, true); d.vel = 9; SFX.rangido(d.x, 1.2, d.z, .2); emitNoise(d.x, d.z, 1);
      if (!d.open) d.fechadaEm = perf; else if (d.aoAbrir) d.aoAbrir();
      if (!S.flags.dicaPorta) { S.flags.dicaPorta = true; toast('Devagar, quase sem barulho.'); }
    }
  } else {
    const t = P.portaT; P.portaT = 0; P.portaMexeu = false;
    if (t < .3) { it.act(); return; }
    // soltou no meio: a porta fica entreaberta, dá para espiar (e ouvir) pela fresta, mas não passar
    const k = clamp((t - .3) / 1.1, 0, 1), frac = P.portaFecha ? (P.portaA0 / ABERTA) * (1 - k) : k;
    if (frac < .06) { setDoor(d, false, true); d.fechadaEm = perf; return; }
    deixarFresta(d, Math.min(1, frac)); emitNoise(d.x, d.z, .6);
    if (!S.flags.dicaFresta) { S.flags.dicaFresta = true; toast('A porta ficou entreaberta. Dá para espiar pela fresta, mas não para passar.'); }
  }
}

// --- O corpo da Lia: peso ao andar, trombadas, tropeços, joelho, sentar para respirar, tábuas que rangem
const _antes = new THREE.Vector3(), _camAlvo = new THREE.Vector3(), _vIncl = new THREE.Vector3();
const suave = k => k * k * (3 - 2 * k);
const ehEsconderijo = it => !!it && W.lockers.some(L => L.g === it.obj);
function dicaEntrar() { return M.ativo && !S.hidden ? `<small style="opacity:.6"> · com ${JP.t('Alt')} ou agachada: sem barulho</small>` : ''; }
function trombar() {
  P.trombaCd = 1.5; P.vx *= -.15; P.vz *= -.15;
  if (P.olhar > 1.2 && S.dif !== 'facil') { tropecar('costas'); return; } // correndo olhando para trás: o tombo vem
  P.shake = Math.max(P.shake, .08); JP.som.baque(P.pos.x, P.pos.z); SFX.trombou(); SFX.ofego(); emitNoise(P.pos.x, P.pos.z, 4, true); marcarCausa('trombou'); JP.vibrar(.5, .3, 120);
  S.stamina = Math.max(0, S.stamina - 10);
  if (!S.flags.dicaTromba) { S.flags.dicaTromba = true; toast('Correndo às cegas, você bate nas coisas. E ele ouve.'); }
}
function tropecar(por) {
  if (perf - P.tropecoEm < 20 || S.dif === 'facil') return;
  P.tropecoEm = perf; P.tropecoT = .8; P.vx *= .2; P.vz *= .2; P.correrTrava = false;
  P.shake = Math.max(P.shake, .1); JP.som.baque(P.pos.x, P.pos.z); SFX.tropecou(); SFX.ofego(); emitNoise(P.pos.x, P.pos.z, 6, true); marcarCausa('tropecou'); JP.vibrar(.8, .5, 260);
  S.stamina = Math.max(0, S.stamina - 20);
  if (!S.flags.dicaTropeco) { S.flags.dicaTropeco = true; toast(por === 'costas' ? 'Correndo de costas, você tropeçou. Olhe para onde corre.' : 'No pânico, as pernas falham. Virar de repente correndo derruba.'); }
}
function joelho() {
  const t = P.agachadaT; P.agachadaT = 0;
  if (keys.AltLeft || keys.AltRight || S.hidden || t < 20) return; // levantar devagar (ALT) nunca estala
  const chance = S.dif === 'pesadelo' ? 1 / 6 : S.dif === 'facil' ? 0 : 1 / 20;
  if (Math.random() >= chance) return;
  JP.som.joelho(); SFX.joelho(); emitNoise(P.pos.x, P.pos.z, S.dif === 'pesadelo' ? 4 : 2, true); marcarCausa('joelho');
  if (!S.flags.dicaJoelho) { S.flags.dicaJoelho = true; setTimeout(() => subPequeno('lia', `Meu joelho... Da próxima vez levanto devagar, com ${JP.t('Alt')}.`), 400); }
}
function levantar() { if (!P.sentada) return; P.sentada = false; P.paradoT = 0; JP.som.tecido(1); }
function updateSentar(dt, moving) {
  const pode = !moving && P.room && P.room.seguro && !S.flags.sino && !ameacaAtiva() && !P.crouch && P.curaT <= 0 && !P.prende && W.mapa !== 'estrada' && !P.bloqueado;
  if (!pode) { P.paradoT = 0; levantar(); return; }
  P.paradoT += dt;
  if (!P.sentada && P.paradoT > 40) { P.sentada = true; JP.som.tecido(1.2); if (!S.flags.dicaSentar) { S.flags.dicaSentar = true; toast('A Lia se senta no chão um pouco. O medo passa mais rápido. Ande para levantar.'); } }
  if (P.sentada) S.fear = Math.max(0, S.fear - 5 * dt);
}
// tábuas que rangem: sempre nos mesmos lugares de cada sala de madeira, com uma mancha um pouco mais escura que a lanterna mostra
const tabuas = []; tabuas.grupo = null;
const MAT_TABUA = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .32, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }); MAT_TABUA.userData.compartilhado = true;
const GEO_TABUA = new THREE.PlaneGeometry(.95, .17);
function semente(s) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 2147483647; return h || 1; }
function criarTabuas() {
  if (tabuas.grupo === W.grupo) return;
  tabuas.length = 0; tabuas.grupo = W.grupo;
  if (!W.def || !W.def.inspetor || W.mapa === 'estrada') return;
  for (const r of W.salas) {
    if (r.fora || r.piso !== 'madeira' || r.x1 - r.x0 < 3 || r.z1 - r.z0 < 3) continue;
    let sd = semente(W.mapa + r.id); const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const n = 2 + Math.floor(rnd() * 3);
    for (let k = 0, feitas = 0; k < 12 && feitas < n; k++) {
      const x = lerp(r.x0 + .9, r.x1 - .9, rnd()), z = lerp(r.z0 + .9, r.z1 - .9, rnd()), giro = rnd() < .5;
      if (W.links.some(l => Math.hypot(l.x - x, l.z - z) < 1.6) || W.colliders.some(c => c.on && x > c.minX - .4 && x < c.maxX + .4 && z > c.minZ - .4 && z < c.maxZ + .4)) continue;
      const m = new THREE.Mesh(GEO_TABUA, MAT_TABUA); m.rotation.set(-Math.PI / 2, 0, giro ? Math.PI / 2 : 0); m.position.set(x, .008, z); W.grupo.add(m);
      tabuas.push({ x, z, cd: -99 }); feitas++;
    }
  }
}
function pisarTabua() {
  for (const t of tabuas) {
    if (Math.abs(t.x - P.pos.x) > .5 || Math.abs(t.z - P.pos.z) > .5 || perf - t.cd < 1.2) continue;
    t.cd = perf; const leve = P.crouch || P.devagar;
    SFX.rangido(t.x, .1, t.z, leve ? .22 : .7); SFX.tabua(); emitNoise(t.x, t.z, leve ? 2 : P.sprinting ? 8 : 5, true); marcarCausa('tabua');
    if (!S.flags.dicaTabua) { S.flags.dicaTabua = true; toast('A tábua rangeu. As manchas mais escuras no chão denunciam as soltas.'); }
    return;
  }
}

function updatePlayer(dt) {
  holdProprio = false;
  if (alvo) { P.alvoAnt = alvo; P.alvoAntEm = perf; }
  // E apertado um instante antes de o esconderijo (ou o item) entrar na mira ainda vale
  if (P.eBuf > 0) { P.eBuf -= dt; if (alvo && !alvo.hold && !alvo.porta && !S.hidden && (ehEsconderijo(alvo) || W.items.some(i => i.it === alvo))) { P.eBuf = 0; alvo.act(); } }
  updatePilha(dt);
  if (S.hidden) {
    const L = S.hidden;
    P.espiar = lerp(P.espiar, (keys.KeyX ? 1 : 0) - (keys.KeyZ ? 1 : 0), Math.min(1, dt * 8));
    const ex = Math.cos(P.yaw) * P.espiar * .08, ez = -Math.sin(P.yaw) * P.espiar * .08;
    if (L.tipo === 'cama') { P.pos.set(L.x, 0, L.z); _camAlvo.set(L.x + L.face[0] * .25 + ex, .26, L.z + L.face[1] * .25 + ez); }
    else if (L.tipo === 'nicho') { P.pos.set(L.x - L.face[0] * .1, 0, L.z - L.face[1] * .1); _camAlvo.set(L.x + L.face[0] * .18 + ex, .62, L.z + L.face[1] * .18 + ez); }
    else { P.pos.set(L.x - L.face[0] * .05, 0, L.z - L.face[1] * .05); _camAlvo.set(P.pos.x + ex, 1.55, P.pos.z + ez); }
    // entrar tem gesto: a câmera vai até o esconderijo e gira para a fresta enquanto a porta fecha
    if (P.camK < 1) { P.camK = Math.min(1, P.camK + dt / .45); camera.position.lerpVectors(P.camDe, _camAlvo, suave(P.camK)); } else camera.position.copy(_camAlvo);
    $('#fx-locker').style.opacity = 1 - Math.abs(P.espiar) * .3;
    P.noiseR = 0; P.sprinting = false;
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99, perto = dM < 5.5;
    // a fresta escurece quando ele para bem na frente e cobre a luz
    const naFrente = M.ativo && dM < 2.2 && ((M.pos.x - L.x) * L.face[0] + (M.pos.z - L.z) * L.face[1]) > .2;
    P.sombra = lerp(P.sombra, naFrente ? 1 : 0, Math.min(1, dt * 4));
    updateRespiracao(dt, perto, dM); updateTeste(dt); updateCura(dt, false);
    if (P.prende && perto && dM < 2.6) conquista('folego');
    S.stamina = Math.min(100, S.stamina + 14 * dt);
    M.ansiedade = clamp((P.pulso || 0) / 100, 0, 1); // os "nervos" do HUD são o pulso escondida
    hudRespiracao(perto, dM);
    const giro = P.giro * (1 - suave(P.camK));
    if (P.saidaT > 0) {
      if (keys.KeyE) { P.saidaT += dt; if (P.saidaT > .35) mostrarHold((P.saidaT - .35) / 1.15); if (P.saidaT >= 1.5) { P.saidaT = 0; sairEsconderijo('silencioso'); camera.rotation.set(P.pitch, P.yaw, 0); return; } }
      else { const t = P.saidaT; P.saidaT = 0; if (t < .35) { sairEsconderijo(keys.AltLeft || keys.AltRight ? 'silencioso' : undefined); camera.rotation.set(P.pitch, P.yaw, 0); return; } } // com ALT segurado, o toque também sai em silêncio
    }
    camera.rotation.set(P.pitch, P.yaw + giro, 0);
    return;
  }
  P.sombra = 0;
  if (P.bloqueado) { P.camK = 1; P.vx = P.vz = 0; $('#breath').hidden = true; camera.position.set(P.pos.x, P.h, P.pos.z); camera.rotation.set(P.pitch, P.yaw, 0); return; }
  const an = P.mover && P.mover.l > .05 ? P.mover : null; // analógico do toque e do controle (src/plataforma3.js): direção contínua
  const fw = an ? -an.y : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0), st = an ? an.x : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  const anK = an ? Math.min(1, .4 + .6 * an.l / .9) : 1;
  const moving = fw || st;
  const fuga = S.flags.sino;
  P.naAgua = !!(P.room && P.room.agua && !S.flags.aguaBaixa);
  const inclAlvo = (keys.KeyX ? 1 : 0) - (keys.KeyZ ? 1 : 0);
  P.devagar = !!(keys.AltLeft || keys.AltRight || keys.Mouse1) && !P.crouch;
  const querCorrer = OPT.correr ? P.correrTrava : !!(keys.ShiftLeft || keys.ShiftRight);
  P.sprinting = querCorrer && moving && fw > 0 && S.stamina > 1 && P.ofegoT <= 0 && P.curaT <= 0 && !inclAlvo && P.tropecoT <= 0;
  if (OPT.correr && P.correrTrava && (!moving || fw <= 0 || S.stamina <= 1)) P.correrTrava = false;
  if (P.sprinting) { P.crouch = false; P.devagar = false; correuEm = perf; S.capCorreu = true; }
  let spd = P.crouch ? 1.4 : P.sprinting ? 5.4 : P.devagar ? 1.9 : 2.8;
  if (P.naAgua) spd *= .72;
  if (W.def.velMul) spd *= W.def.velMul();
  if (S.health < 35) spd *= .85;
  if (Math.abs(P.incl) > .3) spd *= .55;
  if (P.ofegoT > 0) spd *= .9;
  if (P.tropecoT > 0) spd *= .3;
  if (P.sprinting) S.stamina = Math.max(0, S.stamina - (fuga ? 8 : 21) * dt);
  else S.stamina = Math.min(100, S.stamina + (moving ? 8 : 14) * dt);
  // correr até zerar o fôlego cobra caro: ela ofega alto por alguns segundos
  if (P.sprinting && S.stamina <= 1 && !fuga) { P.ofegoT = 4; P.ofegoRuidoT = 0; if (!S.flags.dicaOfego) { S.flags.dicaOfego = true; toast('Sem fôlego. Ela ofega alto por alguns segundos, e ele pode ouvir.'); } }
  if (P.ofegoT > 0) { P.ofegoT -= dt; P.ofegoRuidoT -= dt; if (P.ofegoRuidoT <= 0) { P.ofegoRuidoT = 1.1; SFX.ofego(); emitNoise(P.pos.x, P.pos.z, 4.5, true); marcarCausa('correu'); } }
  // correr durante a Hora ecoa pelo prédio inteiro
  if (P.sprinting && !fuga && S.chapter >= 2 && S.chapter <= 4 && M.ativo && !P.room.fora) {
    P.corridaT += dt;
    if (P.corridaT >= 4) { P.corridaT = 0; emitNoise(P.pos.x, P.pos.z, 30, true); marcarCausa('correu'); if (!S.flags.dicaEco) { S.flags.dicaEco = true; toast('Seus passos ecoam pelo prédio inteiro.'); } }
  } else P.corridaT = 0;
  const sy = Math.sin(P.yaw), cy = Math.cos(P.yaw);
  const vx = -sy * fw + cy * st, vz = -cy * fw - sy * st, len = Math.hypot(vx, vz) || 1;
  // o corpo tem peso: acelera e freia em cerca de 0,12 s; correndo, a curva derrapa um pouco
  const kv = Math.min(1, dt * (P.sprinting ? 6 : 11));
  P.vx = lerp(P.vx, moving ? vx / len * spd * anK : 0, kv); P.vz = lerp(P.vz, moving ? vz / len * spd * anK : 0, kv); // anK: analógico do toque/controle (src/plataforma3.js)
  if (!moving && Math.hypot(P.vx, P.vz) < .05) P.vx = P.vz = 0;
  _antes.copy(P.pos);
  P.pos.x += P.vx * dt; P.pos.z += P.vz * dt;
  collide(P.pos, .33);
  const vel = Math.hypot(P.vx, P.vz), andou = Math.hypot(P.pos.x - _antes.x, P.pos.z - _antes.z);
  // trombar correndo numa parede, mesa ou batente: baque, tranco e um gemido (olhando para trás, ela tropeça)
  P.trombaCd -= dt;
  if (P.sprinting && vel > 3 && vel * dt - andou > vel * dt * .6 && P.trombaCd <= 0) trombar();
  // pânico: correndo apavorada e virando a câmera de repente, as pernas podem falhar
  const giroV = Math.abs(Math.atan2(Math.sin(P.yaw - P.yawAnt), Math.cos(P.yaw - P.yawAnt))) / Math.max(dt, 1e-3); P.yawAnt = P.yaw;
  if (P.sprinting && S.fear > 85 && giroV > 5 && Math.random() < dt * 3) tropecar('panico');
  P.noiseR = !moving ? 0 : (P.crouch ? 1.4 : P.sprinting ? 20 : P.devagar ? 3 : 6.5) * (P.naAgua ? 1.6 : 1);
  if (W.def.ruidoMul) P.noiseR *= W.def.ruidoMul();
  P.noiseR *= anK;
  const moved = Math.min(andou, vel * dt);
  // o som do passo cai exatamente quando a cabeça desce no balanço
  P.bob += moved * (P.sprinting ? 2 : 2.9);
  const fase = Math.floor(P.bob * 2 / Math.PI);
  if (P.faseAnt === undefined) P.faseAnt = fase;
  if (fase !== P.faseAnt) { P.faseAnt = fase; if (moving) { SFX.passo(P.sprinting ? 1 : P.crouch ? .25 : P.devagar ? .33 : .55, P.room.piso || 'grama', !!P.room.fora, P.naAgua); SUST.aoPasso(); if (P.naAgua) criarOnda(P.pos.x, P.pos.z); pisarTabua(); } }
  // prender a respiração também fora do esconderijo (parada, com ele perto)
  const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99, perto = !moving && dM < 4;
  updateRespiracao(dt, perto, dM);
  hudRespiracao(perto || (P.prende && dM < 6), dM);
  updateCura(dt, moving); updateSacudir(dt); updatePorta(dt);
  // agachar com corpo: curva com uma leve passada do ponto, farfalhar de roupa e, às vezes, o joelho
  if (P.crouch) P.agachadaT += dt;
  if (P.crouch !== P.crouchAnt) { if (P.crouchAnt !== undefined) { JP.som.tecido(P.crouch ? .8 : 1); if (!P.crouch) joelho(); } P.crouchAnt = P.crouch; }
  updateSentar(dt, moving);
  P.tropecoT = Math.max(0, P.tropecoT - dt);
  const hAlvo = (P.sentada ? .72 : P.crouch ? .95 : 1.62) - (P.tropecoT > 0 ? .5 * Math.min(1, P.tropecoT / .3) : 0), dh = Math.min(dt, .05);
  P.hv += ((hAlvo - P.h) * 120 - P.hv * 17) * dh; P.h += P.hv * dh;
  // inclinar (Z/X), olhar para trás (Q) e baixar a cabeça no curativo
  P.incl = lerp(P.incl, P.sprinting ? 0 : inclAlvo, Math.min(1, dt * 8));
  P.olhar = lerp(P.olhar, keys.KeyQ && P.curaT <= 0 ? Math.PI * .95 : 0, Math.min(1, dt * 9));
  P.baixar = lerp(P.baixar, P.curaT > 0 ? .6 : P.pilhaT > 0 ? .25 : 0, Math.min(1, dt * 4));
  let hx = P.pos.x, hz = P.pos.z;
  if (Math.abs(P.incl) > .01) { const c = _vIncl.set(P.pos.x + cy * P.incl * .35, 0, P.pos.z - sy * P.incl * .35); collide(c, .15); hx = c.x; hz = c.z; }
  // balanço: mais desigual mancando com pouca vida; parada, a respiração mexe a cabeça (mais forte sem fôlego)
  const manca = S.health < 35 && moving ? (P.faseAnt % 2 ? 1.6 : .55) : 1;
  const bobY = (Math.abs(Math.sin(P.bob * 2)) * 2 - 1) * (moving ? (P.sprinting ? .055 : .03) : 0) * manca;
  const folego = (100 - S.stamina) / 100, resp = moving ? 0 : Math.sin(perf * (1.5 + folego * 2.6)) * (.004 + folego * .012) * (P.prende ? .2 : 1);
  P.rollLado = lerp(P.rollLado, moving ? -st * (P.sprinting ? .018 : .01) : 0, Math.min(1, dt * 6)); // inclina de leve para o lado em que anda
  const firme = P.prende ? .3 : 1; // prender o ar firma o corpo contra o tremor do medo
  const sh = P.shake + (S.fear > 70 ? (S.fear - 70) / 30 * .015 * firme : 0);
  camera.position.set(hx + rand(-sh, sh), P.h + bobY + resp + rand(-sh, sh) - (P.naAgua ? .12 : 0) - Math.abs(P.incl) * .04, hz + rand(-sh, sh));
  // sair do esconderijo também tem gesto: a câmera desliza para fora em vez de pular
  if (P.camK < 1) { P.camK = Math.min(1, P.camK + dt / .35); _camAlvo.copy(camera.position); camera.position.lerpVectors(P.camDe, _camAlvo, suave(P.camK)); }
  camera.rotation.set(P.pitch - P.baixar, P.yaw + P.olhar, Math.sin(P.bob * 2) * (moving ? .006 : 0) * manca + (S.fear > 85 ? Math.sin(perf * 1.3) * .02 * firme : 0) - P.incl * .12 + P.rollLado + clamp(P.hv * .006, -.035, .035) + (P.tropecoT > 0 ? Math.sin(P.tropecoT * 9) * .06 : 0));
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
// Lanterna: piscadas por tempo (iguais em 60 ou 144 Hz), estalo de aviso, falha roteirizada e conserto na batida
let flashPisca = false, piscaRaj = 0, piscaProx = 3, flashVis = 0;
let flashFalhaLonga = false, flickT = 1, flickDur = 0, flickIni = 0, falhaT = 0, consertoT = 0, ultimoF = -9, avisoPisca = false;
function updateLanterna(dt) {
  if (!S.inv.lanterna) S.flashOn = false;
  if (S.flashOn) { S.battery = Math.max(0, S.battery - .55 * D().pilha * dt); if (S.battery <= 0) { S.flashOn = false; toast(S.inv.pilhas ? 'A lanterna apagou. R para trocar a pilha.' : 'A lanterna apagou. Segure R para sacudir.'); SFX.clique(); } }
  const low = S.battery < 18;
  consertoT = Math.max(0, consertoT - dt);
  if (S.chapter === 3 && ANA.ativa && ANA.conta >= 3 && S.flashOn && !S.flags.falhaLanterna) { S.flags.falhaLanterna = true; falhaT = 4; SFX.clique(); toast('A lanterna falhou! Aperte F para bater nela.'); }
  falhaT = Math.max(0, falhaT - dt);
  const proc = PROC.fase === 'aviso';
  flickT -= dt;
  if (flickDur > 0) flickDur -= dt;
  else if (flickT <= 0) {
    if (S.flashOn && (proc || (low && consertoT <= 0) || Math.random() < .04)) { flickDur = proc ? rand(.05, .25) : low ? rand(.08, .32) : rand(.04, .09); flickIni = flickDur; }
    flickT = proc ? rand(.08, .3) : low ? rand(.35, 1.2) : rand(3, 9); avisoPisca = false;
  }
  if (low && S.flashOn && consertoT <= 0 && !avisoPisca && flickDur <= 0 && flickT < .5) { avisoPisca = true; SFX.clique(); }
  flashPisca = S.flashOn && (flickDur > 0 || falhaT > 0);
  if (S.flashOn && SUST.lanternaFalha()) flashPisca = true;
  flashFalhaLonga = S.flashOn && (falhaT > 0 || (flickDur > 0 && flickIni > .2 && flickIni - flickDur > .2));
  const fraca = low && consertoT <= 0;
  const alvoI = S.flashOn && !flashPisca ? 30 * (fraca ? .5 : 1) : 0;
  // reduzir flashes: em vez de apagar e acender, a luz escurece e volta devagar
  flashVis = OPT.vFlash ? lerp(flashVis, S.flashOn ? 30 * (fraca ? .5 : 1) * (flashPisca ? .45 : 1) : 0, Math.min(1, dt * 5)) : alvoI;
  // pilha nova: a luz volta com um clarão forte uma vez (suave com "reduzir flashes")
  flashBoost = Math.max(0, flashBoost - dt * 2.5);
  flash.intensity = flashVis * (1 + flashBoost * (OPT.vFlash ? .3 : .9));
  flashFill.intensity = flash.intensity / 50;
  const bp = $('#b-pilha'); if (bp) bp.classList.toggle('fraca', S.inv.lanterna && low);
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
  if (df > 0) df *= JM.medoMul(); // fone no ouvido e o terço da Celeste
  S.fear = clamp(S.fear + df * dt, 0, 100);
  if (S.fear > 80 && Math.random() < dt * .22) alucinacao();
}
function alucinacao() {
  if (SUST.alucinacao()) return;
  const t = Math.random();
  if (t < .35) SFX.sussurros(1.5);
  else if (t < .65) SFX.passoMonstro({ x: P.pos.x + rand(-5, 5), z: P.pos.z + rand(-5, 5) }, .35);
  else if (t < .85) SFX.risada(P.pos.x + rand(-6, 6), P.pos.z + rand(-6, 6));
  else SFX.estalo({ x: P.pos.x + rand(-4, 4), z: P.pos.z + rand(-4, 4) });
}

// Esconderijos
let teste = null; // o Inspetor parado na porta do seu esconderijo: prenda a respiração até ele desistir
function updateTeste(dt) {
  if (!teste) return;
  if (!S.hidden || !M.ativo || S.dead) { teste = null; return; }
  teste.t -= dt; teste.graca -= dt;
  const d = M.pos.distanceTo(P.pos);
  if (d < 1.9) M.wait = Math.max(M.wait, .25);
  if (teste.graca <= 0 && d < 2.6 && !P.prende) { M.achou = true; marcarCausa('entrou'); teste = null; return; }
  if (teste.t <= 0) { teste = null; sub('inspetor', 'Volte para a cama.'); M.recuo = 12; M.searchT = 0; patrulhar(); conquista('volte_cama'); }
}
function entrarEsconderijo(L) {
  const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;
  // o jeito de entrar faz diferença: devagar (ALT) ou agachada é metade do barulho; correndo, a porta do armário bate
  const jeito = (P.devagar || P.crouch || keys.AltLeft || keys.AltRight) ? .5 : (P.sprinting || perf - correuEm < .4) ? 1.8 : 1;
  if (L.tipo === 'cama') { SFX.arrastar(); emitNoise(L.x, L.z, 2.5 * jeito); $('#fx-cama').hidden = false; }
  else { SFX.armario(); if (jeito > 1 && L.tipo === 'armario') { SFX.pancada(L.x, L.z); P.shake = Math.max(P.shake, .05); } emitNoise(L.x, L.z, (L.tipo === 'nicho' ? 2.5 : 3.5) * jeito); $('#fx-locker').hidden = false; }
  P.camDe.copy(camera.position); P.camK = 0; const yaw0 = P.yaw;
  if (M.ativo && M.state === 'caca' && dM < 4 && salaAdj(roomAt(M.pos.x, M.pos.z), P.room) && !(JM.protegido(L, 3) && dM > 1.6)) {
    teste = { t: rand(4, 6), graca: S.dif === 'pesadelo' ? .4 : 1 };
    M.state = 'procura'; M.searchT = teste.t + 3; planejar(M, L.x + L.face[0] * 1.1, L.z + L.face[1] * 1.1);
    toast(`Ele ouviu você entrar. Prenda a respiração (${JP.t('Space')}) e não solte!`);
  }
  checarEntradaEsconderijo(L); // ele aprende os seus armários favoritos
  S.hidden = L; P.crouch = false; P.pulso = Math.min(P.pulso, 40); P.espiar = 0; P.incl = 0; P.olhar = 0; P.saidaT = 0;
  P.yaw = Math.atan2(-L.face[0], -L.face[1]); P.pitch = L.tipo === 'cama' ? -.1 : 0;
  P.giro = Math.atan2(Math.sin(yaw0 - P.yaw), Math.cos(yaw0 - P.yaw)); P.vx = P.vz = 0; P.sentada = false; P.crouchAnt = false; P.agachadaT = 0; P.eBuf = 0;
  if (!S.flags.dicaEspiar) { S.flags.dicaEspiar = true; setTimeout(() => toast(`${JP.t('ZX')} espiam pela fresta. Toque ${JP.t('KeyE')} para sair rápido; segure ${JP.t('KeyE')} (ou use ${JP.t('Alt')}) para sair em silêncio.`), 900); }
  SUST.aoEsconder(L); JM.aoEsconder(L);
}
function sairEsconderijo(modo) {
  const L = S.hidden; if (!L) return;
  if (modo === true) PG.escondidaAntes(); // correção: "forcado" não existia mais depois do merge e sair do esconderijo quebrava o jogo
  SUST.aoSair(L);
  S.hidden = null; teste = null; $('#fx-locker').hidden = true; $('#fx-locker').style.opacity = ''; $('#fx-cama').hidden = true; $('#breath').hidden = true;
  P.camDe.copy(camera.position); P.camK = 0; P.giro = 0; P.sombra = 0;
  const off = L.tipo === 'cama' ? 1.0 : .85;
  const a = new THREE.Vector3(L.x + L.face[0] * off, 0, L.z + L.face[1] * off), b = new THREE.Vector3(L.x - L.face[0] * off, 0, L.z - L.face[1] * off);
  const livre = v => { const c = v.clone(); collide(c, .33); return c.distanceTo(v) < .05; };
  P.pos.copy(livre(a) || L.tipo !== 'cama' ? a : livre(b) ? b : a); collide(P.pos, .33);
  if (modo === true) return;
  if (modo === 'silencioso') { L.tipo === 'cama' ? SFX.arrastar() : SFX.rangido(L.x, 1, L.z, .2); emitNoise(L.x, L.z, .8); return; }
  L.tipo === 'cama' ? SFX.arrastar() : SFX.armario();
  emitNoise(L.x, L.z, M.ativo && M.pos.distanceTo(P.pos) < 4 ? 6 : 3);
}
// nicho na parede dos túneis (bueiro largo): o único esconderijo no meio da água
function nicho(x, z, face) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(face[0], face[1]); W.grupo.add(g);
  const boca = cyl(.55, .55, .5, MAT.ferrugem, 0, .6, -.1, 12, g); boca.rotation.x = Math.PI / 2;
  const fundo = cyl(.5, .5, .05, MAT.preto, 0, .6, -.34, 12, g); fundo.rotation.x = Math.PI / 2;
  for (let i = 0; i < 5; i++) box(.025, 1, .025, MAT.ferrugem, -.4 + i * .2, .6, .16, g, false);
  Math.abs(face[0]) > .5 ? addCollider(x - .3, x + .3, z - .55, z + .55) : addCollider(x - .55, x + .55, z - .3, z + .3);
  const L = { g, x, z, face, tipo: 'nicho' };
  W.lockers.push(L); W.solid.push(boca);
  interact(g, () => S.hidden === L ? '<b>E</b>Sair do bueiro · segure: em silêncio' : '<b>E</b>Esconder no bueiro' + dicaEntrar(), () => S.hidden === L ? sairEsconderijo() : entrarEsconderijo(L));
  return L;
}
function nichoNoTunel(r) {
  const w = r.x1 - r.x0, d = r.z1 - r.z0, L = Math.max(w, d);
  if (L < 9) return;
  const livre = (x, z) => !W.links.some(l => Math.hypot(l.x - x, l.z - z) < 1.8);
  const cands = d > w ? [[r.x0 + .4, (r.z0 + r.z1) / 2, [1, 0]], [r.x1 - .4, (r.z0 + r.z1) / 2, [-1, 0]]] : [[(r.x0 + r.x1) / 2, r.z0 + .4, [0, 1]], [(r.x0 + r.x1) / 2, r.z1 - .4, [0, -1]]];
  for (const [x, z, f] of cands) if (livre(x, z)) { nicho(x, z, f); return; }
}
// apertar E perto de um esconderijo, mesmo olhando torto, entra nele (Fácil e Normal)
function entrarMaisPerto() {
  if (S.dif === 'pesadelo' || S.hidden) return;
  let melhor = null, md = 1.4;
  for (const L of W.lockers) { const d = Math.hypot(L.x - P.pos.x, L.z - P.pos.z); if (d < md && roomAt(L.x + L.face[0] * .8, L.z + L.face[1] * .8) === P.room) { md = d; melhor = L; } }
  if (melhor) { entrarEsconderijo(melhor); return true; }
  return false;
}
// mira assistida: se o centro da tela não pega nada, procura o interativo mais perto do centro num cone pequeno
const _vc = new THREE.Vector3(), _fw = new THREE.Vector3(), _bx = new THREE.Box3(), rayCone = new THREE.Raycaster();
function alvoPorCone(vis) {
  camera.getWorldDirection(_fw); let melhor = null, mAng = .17;
  for (const it of vis) {
    if (!it._c) { _bx.setFromObject(it.obj); if (_bx.isEmpty()) continue; it._c = _bx.getCenter(new THREE.Vector3()); }
    _vc.copy(it._c).sub(camera.position); const d = _vc.length(); if (d > 2.4 || d < .05) continue;
    const ang = Math.acos(clamp(_fw.dot(_vc.normalize()), -1, 1)); if (ang >= mAng) continue;
    rayCone.set(camera.position, _vc); rayCone.far = d;
    const h = rayCone.intersectObjects(W.solid, false)[0];
    if (h && h.distance < d - .45) { let o = h.object; while (o && o.userData.it !== it) o = o.parent; if (!o) continue; }
    mAng = ang; melhor = it;
  }
  return melhor;
}
// o Inspetor avisa antes de agarrar: para, levanta os braços, estala, e só então dá o bote
const _rcP = new THREE.Raycaster(), _oP = new THREE.Vector3(), _dP = new THREE.Vector3(); // reaproveitados: o teste do bote roda todo quadro perto dele
function paredeEntre(a, b) { const o = _oP.set(a.x, 1.2, a.z), v = _dP.set(b.x - a.x, 0, b.z - a.z), l = v.length(); if (l < .35) return false; _rcP.set(o, v.normalize()); _rcP.near = .05; _rcP.far = l - .25; return _rcP.intersectObjects(W.solid, false).length > 0; }
function boteInspetor(dt, d, ra) {
  if (S.hidden || (P.room.seguro && !S.flags.sino)) { M.bote = null; return; }
  if (!M.bote) {
    if (d < (M.state === 'caca' ? 2.1 : 1.05) && (ra === P.room || salaAdj(ra, P.room)) && !paredeEntre(M.pos, P.pos)) {
      M.bote = { t: S.dif === 'pesadelo' ? .35 : S.dif === 'facil' ? .65 : .5 };
      M.wait = Math.max(M.wait, M.bote.t + .05); SFX.estalo(M.pos, 1.4); SFX.voz(M.pos); M.boteEm = perf;
    }
    return;
  }
  M.bote.t -= dt;
  if (M.bote.t > 0) return;
  M.bote = null;
  const dx = P.pos.x - M.pos.x, dz = P.pos.z - M.pos.z, l = Math.hypot(dx, dz) || 1, passo = Math.min(1.3, Math.max(0, l - .5));
  M.pos.x += dx / l * passo; M.pos.z += dz / l * passo; collide(M.pos, .3);
  const d2 = M.pos.distanceTo(P.pos), r2 = roomAt(M.pos.x, M.pos.z);
  if (d2 < 1.25 && (r2 === P.room || salaAdj(r2, P.room))) atacar('inspetor');
  else { M.wait = 1; M.cool = Math.max(M.cool, .6); SFX.pancada(M.pos.x, M.pos.z); if (d2 < 2.4) { conquista('esquiva'); JP.porUmFio(); } }
}

// --- Checkpoint por objetivo, ajuda invisível, retorno justo depois de morrer
let saveDevido = 0, mortesNoPonto = 0, congelarT = 0, progAnt = -1, chamadoEm = -99, correuEm = -99;
const MARCOS = ['gerador', 'procissao', 'chave_escada', 'caixinha', 'ana', 'fita_celeste', 'cofre', 'tumulos', 'sino', 'marco'];
function agendarSave(id) { if (S.dif === 'pesadelo' && !MARCOS.includes(id)) return; saveDevido = 1.5; }
function podeSalvar() { return mode === 'jogo' && !S.dead && !S.fim && !S.hidden && !PROC.fase && !ANA.ativa && !teste && !(M.ativo && M.state === 'caca' && M.pos.distanceTo(P.pos) < 12); }
function marcosParciais() { const n = S.valv.length + Object.keys(S.tumulos).length; if (progAnt >= 0 && n > progAnt) agendarSave('marco'); progAnt = n; }
function ajudaOculta() {
  if (!S || S.dif === 'pesadelo') return null;
  const f = S.dif === 'facil', n = mortesNoPonto;
  if (n < (f ? 2 : 3)) return null;
  const forte = n >= (f ? 4 : 5);
  return { vel: forte ? .86 : .92, ouvido: forte ? .8 : .9, aviso: forte ? 3 : 2 };
}
function afastarInspetor() {
  if (!M.ativo || S.flags.sino) return;
  const ra = roomAt(M.pos.x, M.pos.z);
  if (distSalas(ra, P.room) < 3) {
    const salas = salasAlcancaveis(P.pos, { semFora: !W.def.inspetorFora }).filter(r => r !== P.room && !r.seguro);
    const longe = salas.sort((a, b) => distSalas(b, P.room) - distSalas(a, P.room))[0];
    if (longe) { const [x, z] = pontoEm(longe); M.pos.set(x, 0, z); }
  }
  M.cool = 8; M.recuo = 12; M.state = 'patrulha'; M.bote = null; M.achou = false; patrulhar();
}
const congelado = dt => { if (congelarT > 0) { congelarT -= dt; return true; } return false; };
// Cofre e quadro não param o mundo (só no Fácil); no Pesadelo, notas e diário também não
const mundoVivo = () => mode === 'jogo' && S && !S.dead && !S.fim && ((ui === 'teclado' && S.dif !== 'facil') || ((ui === 'nota' || ui === 'diario') && S.dif === 'pesadelo'));
function abafar(on) { if (master) master.gain.value = lerp(master.gain.value, OPT.vol * (on ? .45 : 1) * JM.volMundo(), .2); }
function causaContexto(quem) {
  if (quem === 'procissao') return 'fora';
  if (quem === 'ana') return !S.flashOn ? 'semLuz' : flashFalhaLonga || falhaT > 0 ? 'piscou' : 'costas';
  if (perf - chamadoEm < 20) return 'chamado';
  if (P.causaRuido && perf - P.causaRuidoEm < 6) return P.causaRuido;
  if (P.sprinting || perf - correuEm < 3) return 'correu';
  if (P.naAgua) return 'agua';
  if (M.boteEm && perf - M.boteEm < 2) return 'bote';
  return 'perto';
}
function dicaMorte(quem, ctx) {
  const dc = R.entidades.dicas_ctx || {}, dicasMapa = (R.dicas_morte.porMapa && R.dicas_morte.porMapa[W.mapa]) || [];
  const el = $('#death-dica');
  // a interface já escreveu uma dica pela causa que ela viu; a causa exata do motor (agarrão, bote, cacos...) tem prioridade
  const base = (ctx && (dc[ctx] || JG.TXT.dicas[ctx])) || el.textContent || pick([...(R.dicas_morte[quem] || R.dicas_morte.inspetor), ...(quem === 'inspetor' ? dicasMapa : [])]);
  if (mortesNoPonto >= 3) el.innerHTML = `<span class="dica-forte">${base}</span><span class="seca">${pick(JG.TXT.secas)}</span>`;
  else el.textContent = base;
  // o mini-mapa da morte é o da interface (#death-mapa), com o rastro de quem te pegou
}
// replay dos últimos 4 segundos (mostrado na tela de morte)
const replayBuf = []; let replayT = 0, ruidoQuadro = 0;
let escuroT = 0, cegoT = 0, flashAntes = false, acost = 0, silencioT = 0, foraProcT = 0;
function prepararJogador() {
  P.incl = P.olhar = P.baixar = P.espiar = 0; P.curaT = P.mirarG = P.saidaT = P.portaT = P.sacudirT = P.ofegoT = 0; P.pulso = 0; P.semAr = false; P.prende = false;
  P.vx = P.vz = P.hv = 0; P.camK = 1; P.giro = 0; P.tropecoT = 0; P.sentada = false; P.paradoT = 0; P.pilhaT = 0; P.eBuf = 0; P.alvoAnt = null; P.agachadaT = 0; P.crouchAnt = P.crouch; P.rollLado = 0; P.sombra = 0; P.sensMul = 1; flashBoost = 0;
  JP.mapa();
  teste = null; mira.visible = false; replayBuf.length = 0; escuroT = 0; cegoT = 0; acost = 0; silencioT = 0; foraProcT = 0; falhaT = 0;
  renderer.toneMappingExposure = +OPT.brilho || 1.1;
  // vidro e entulho no chão dos corredores: olhar onde pisa vale a pena
  if (W.def && W.def.inspetor && W.mapa !== 'estrada') for (const r of W.salas) {
    if (r.fora || !['corredor', 'tunel', 'hall'].includes(r.tipo) || Math.random() > .55) continue;
    for (let k = 0; k < 6; k++) { const [x, z] = pontoEm(r, .9); if (W.links.some(l => Math.hypot(l.x - x, l.z - z) < 1.8) || Math.hypot(x - P.pos.x, z - P.pos.z) < 3) continue; criarCacos(x, z, Infinity); break; }
  }
  criarTabuas();
}
function updateJogabilidade(dt) {
  abafar(false);
  updateMira(dt); updateCacos(dt); updateOndas(dt);
  // olhos que se acostumam ao escuro; acender a lanterna ofusca por um instante
  const escuro = !S.flashOn && !P.room.fora && !naLuz(P.pos);
  escuroT = escuro ? escuroT + dt : Math.max(0, escuroT - dt * 6);
  if (S.flashOn && !flashAntes && acost > .4) cegoT = .55 * acost;
  flashAntes = S.flashOn;
  acost = clamp((escuroT - 5) / 8, 0, 1); cegoT = Math.max(0, cegoT - dt);
  if (acost >= 1) conquista('olhos');
  renderer.toneMappingExposure = ((+OPT.brilho || 1.1) + acost * .55 + cegoT * 2.2) * (1 - .55 * P.sombra); // escondida, ele na frente da fresta cobre a luz
  scene.fog.density *= 1 - .15 * acost; hemi.intensity += acost * .05;
  // anel de ruído na mira, postura no HUD
  ruidoQuadro = Math.max(0, ruidoQuadro - dt * 12);
  const rr = Math.max(P.noiseR, ruidoQuadro);
  let alto = false;
  if (M.ativo && rr > 0) { const att = salaAdj(roomAt(M.pos.x, M.pos.z), P.room) ? 1 : .45; alto = rr * att * D().ouvido * (M.state === 'caca' ? 1.6 : 1) > M.pos.distanceTo(P.pos); }
  // o anel de ruído agora é o da interface (UIX), com opção nas Opções
  JP.update(dt);
  JG.postura(S.hidden ? (P.prende ? 'escondida · prendendo o ar' : 'escondida') : P.tropecoT > 0 ? 'caída' : P.pilhaT > 0 ? 'trocando a pilha' : P.sentada ? 'sentada' : P.curaT > 0 ? 'fazendo curativo' : P.prende ? 'prendendo o ar' : P.ofegoT > 0 ? 'ofegante' : P.sprinting ? 'correndo' : P.crouch ? 'agachada' : P.devagar ? 'devagar' : Math.abs(P.incl) > .3 ? 'espiando' : '');
  // checkpoint silencioso depois de cada objetivo
  if (saveDevido > 0) { saveDevido -= dt; if (saveDevido <= 0) { if (trocandoCap) saveDevido = 0; else if (podeSalvar()) { salvarCheckpoint(); JG.mostrarSalvo(); } else saveDevido = 1; } }
  // replay
  replayT -= dt;
  if (replayT <= 0 && M.ativo) { replayT = .1; replayBuf.push({ px: P.pos.x, pz: P.pos.z, mx: M.pos.x, mz: M.pos.z, ruido: rr }); if (replayBuf.length > 40) replayBuf.shift(); }
  // dicas de controle no momento certo
  if (M.ativo && M.state === 'caca' && !S.flags.dicaQ && !S.hidden) { S.flags.dicaQ = true; setTimeout(() => toast('Segure Q para olhar para trás enquanto foge.'), 1500); }
  // a Procissão do Cap. II espera você entrar
  if (S.chapter === 2 && !S.done.procissao && P.room.fora && W.def.procissao && W.def.procissao()) { foraProcT += dt; if (foraProcT > 45) { foraProcT = -999; toast('Lá dentro, o rádio chia. A Hora está esperando você.'); } }
  // segredo: um minuto de silêncio total, no escuro, dentro do internato
  if (!S.hidden && !P.room.fora && !S.flashOn && P.noiseR === 0 && !M.bote && W.mapa !== 'estrada') { silencioT += dt; if (silencioT >= 60 && !S.flags.regraZero) { S.flags.regraZero = true; SFX.sussurros(2.5); sub('ana', 'Você é boa na Hora do Silêncio.'); conquista('regra_zero'); } }
  else silencioT = 0;
  // ele te escuta de verdade
  if (OPT.mic && AC && !micPedido) { micPedido = true; JG.ligarMic(AC).then(ok => { if (!ok) { toast('O navegador não liberou o microfone.'); setOpt('mic', 0); } else toast('Ele agora ouve a sua voz.'); }); }
  if (OPT.mic) { const v = JG.lerMic(dt); if (v > 0 && !(MP && MP.mic(v))) { emitNoise(P.pos.x, P.pos.z, v, true); marcarCausa('voz'); } } // escondida, ele primeiro vira o rosto (1 s de chance)
}

// =====================================================================
// ENTIDADES
// =====================================================================
let MP = null; // Lote 3: polimento das entidades (src/monstros-polimento.js), criado lá embaixo junto do ML
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
// Quanto do som passa de uma sala para outra: porta fechada abafa, sala distante quase não deixa passar
function atenuacao(a, b) {
  if (!a || !b) return .5;
  if (a === b) return 1;
  let fechada = false;
  for (const l of W.links) if ((l.a === a.id && l.b === b.id) || (l.b === a.id && l.a === b.id)) { if (!l.door || l.door.open) return 1; fechada = true; }
  if (fechada) return .35;
  return distSalas(a, b) > 2 ? .3 : .5;
}
const centroSala = r => new THREE.Vector3((r.x0 + r.x1) / 2, 0, (r.z0 + r.z1) / 2);
function andar(ent, dt, speed, abrePortas = true) {
  if (!ent.path.length) return true;
  const t = ent.path[0];
  if (abrePortas && t.link && t.link.door && !t.link.door.open && Math.hypot(t.x - ent.pos.x, t.z - ent.pos.z) < 1.5) {
    if (ent === M) { portaInspetor(t.link.door); return false; }
    setDoor(t.link.door, true); SFX.pancada(t.link.door.x, t.link.door.z); ent.wait = .6; return false;
  }
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
  const v = _vV.set(pos.x, altura, pos.z).sub(camera.position), dist = v.length();
  if (dist > alcance) return false;
  const fw = _vF; camera.getWorldDirection(fw);
  v.normalize();
  if (fw.dot(v) < Math.cos(.55)) return false;
  const rc = _rcV; rc.set(camera.position, v); rc.near = .1; rc.far = Math.max(.2, dist - .3);
  return rc.intersectObjects(W.solid, false).length === 0;
}
// Linha livre entre dois pontos (sem móvel/parede sólida no meio)
const _llO = new THREE.Vector3(), _llV = new THREE.Vector3(), _llR = new THREE.Raycaster();
function linhaLivre(a, b, y = 1) {
  const o = _llO.set(a.x, y, a.z), v = _llV.set(b.x, y, b.z).sub(o), dist = v.length();
  if (dist < .2) return true;
  const rc = _llR; rc.set(o, v.normalize()); rc.near = .05; rc.far = dist;
  return rc.intersectObjects(W.solid, false).length === 0;
}
const prendendo = () => !!S.hidden && !!P.prende; // o ar agora é o S.ar da respiração (jogabilidade)
const mortesCap = { cap: -1, n: 0 };
const ajudaCap = () => !!ajudaOculta(); // a mesma ajuda invisível de D(): ouvido, velocidade e aviso já vêm de lá

// --- Sons novos das entidades (procedurais, ficam aqui para não mexer no SOM de todo mundo)
const AMBX = {};
const SOMX = {
  estalo(pos, vol = .6, duplo) { // estalo de língua: mais abafado de longe, duplo quando ele vira para você
    const t = AC.currentTime, g = saida({ x: pos.x, y: 3, z: pos.z }, .5), lp = AC.createBiquadFilter(); lp.type = 'lowpass';
    lp.frequency.value = lerp(5200, 800, clamp(Math.hypot(pos.x - P.pos.x, pos.z - P.pos.z) / 24, 0, 1)); lp.connect(g);
    const n = duplo ? 4 : 2; for (let i = 0; i < n; i++) burst(t + i * .07 + (i >= 2 ? .16 : 0), .03, 'bandpass', 2600, 8, lp);
    g.gain.setValueAtTime(0, t); g.gain.setValueAtTime(.7 * vol, t + .001); g.gain.exponentialRampToValueAtTime(.0001, t + (duplo ? .45 : .2));
  },
  cantarola(pos) { // a melodia da caixinha da Ana, mais lenta, grave e desafinada, em boca fechada
    if (AMBX.cant) return;
    const t = AC.currentTime, g = saida({ x: pos.x, y: 2.8, z: pos.z }, .6), f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 380; f.Q.value = 2; f.connect(g);
    const o = AC.createOscillator(); o.type = 'triangle'; const notas = [659, 784, 659, 523, 587, 494, 523, 440].map(n => n / 4);
    notas.forEach((n, i) => o.frequency.setValueAtTime(n * rand(.96, 1.04), t + i * .62));
    const vib = AC.createOscillator(); vib.frequency.value = 5.5; const vg = AC.createGain(); vg.gain.value = 3; vib.connect(vg); vg.connect(o.frequency);
    const fim = notas.length * .62;
    o.connect(f); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.16, t + .3); g.gain.setValueAtTime(.16, t + fim - .5); g.gain.exponentialRampToValueAtTime(.0001, t + fim);
    o.start(t); vib.start(t); o.stop(t + fim + .1); vib.stop(t + fim + .1);
    AMBX.cant = { o, vib, g, ate: t + fim }; o.onended = () => { if (AMBX.cant && AMBX.cant.o === o) AMBX.cant = null; };
  },
  cortaCantiga() { // ele ouviu algo: a cantiga para no meio da frase
    const c = AMBX.cant; if (!c) return false; AMBX.cant = null;
    const t = AC.currentTime; if (t > c.ate - .2) return false;
    c.g.gain.cancelScheduledValues(t); c.g.gain.setValueAtTime(Math.max(.0002, c.g.gain.value), t); c.g.gain.linearRampToValueAtTime(.0001, t + .04);
    try { c.o.stop(t + .05); c.vib.stop(t + .05); } catch (e) {} return true;
  },
  fungada(pos) { const t = AC.currentTime; for (const k of [0, .16]) { const g = saida({ x: pos.x, y: 2.8, z: pos.z }, .4); const f = burst(t + k, .12, 'bandpass', 1500, 2, g); f.frequency.linearRampToValueAtTime(2600, t + k + .12); env(g, t + k, .02, .3, .1); } },
  respiraRasgada(pos) {
    const t = AC.currentTime, g = saida({ x: pos.x, y: 2.8, z: pos.z }, .5); burst(t, .55, 'bandpass', 850, 1.6, g); env(g, t, .08, .45, .45);
    const g2 = saida({ x: pos.x, y: 2.8, z: pos.z }, .3), o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.linearRampToValueAtTime(55, t + .5);
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240; o.connect(lp); lp.connect(g2); env(g2, t, .06, .2, .45); o.start(t); o.stop(t + .6);
  },
  inspira(pos) { const t = AC.currentTime, g = saida({ x: pos.x, y: 1.6, z: pos.z }, .3); const f = burst(t, 1.5, 'bandpass', 500, 1.5, g); f.frequency.linearRampToValueAtTime(2200, t + 1.4); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.55, t + 1.2); g.gain.exponentialRampToValueAtTime(.0001, t + 1.5); },
  macaneta(x, z) { const t = AC.currentTime; for (const k of [0, .22, .5]) { const g = saida({ x, y: 1, z }, .3); burst(t + k, .05, 'bandpass', 3200, 6, g); env(g, t + k, .002, .35, .05); } },
  armarioBate(L) { const t = AC.currentTime, p = { x: L.x, y: 1.2, z: L.z }; const g = saida(p, .7); burst(t, .5, 'bandpass', 480, 2, g, 0); env(g, t, .003, 1.4, .45); const g2 = saida(p, .5); const o = AC.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(70, t + .4); o.connect(g2); env(g2, t, .003, .25, .4); o.start(t); o.stop(t + .5); },
  batida(x, z, vol = 1) { const t = AC.currentTime, g = saida({ x, y: 1.2, z }, .5); burst(t, .14, 'lowpass', 380, 1, g, 0); env(g, t, .002, .9 * vol, .12); },
  corrente(pos) { const t = AC.currentTime; for (let i = 0; i < 3; i++) { const g = saida({ x: pos.x, y: .1, z: pos.z }, .4); osc('triangle', rand(1600, 3200), t + i * .06, .25, g); env(g, t + i * .06, .001, .07, .18); } },
  passosLonge(pos, dir) { // passos que se afastam (às vezes é mentira)
    for (let i = 0; i < 6; i++) { const t = AC.currentTime + i * .55, p = { x: pos.x + dir.x * i * 1.4, y: .3, z: pos.z + dir.z * i * 1.4 }; const g = saida(p, .5); const o = AC.createOscillator(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(30, t + .25); o.connect(g); env(g, t, .01, .8 * (1 - i / 7), .3); o.start(t); o.stop(t + .4); }
  },
  passoCima(pos) { for (let i = 0; i < 4; i++) { const t = AC.currentTime + i * .7, g = saida({ x: pos.x + rand(-3, 3), y: 4.5, z: pos.z + rand(-3, 3) }, .6); const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 160; lp.connect(g); const o = AC.createOscillator(); o.frequency.setValueAtTime(60, t); o.frequency.exponentialRampToValueAtTime(28, t + .3); o.connect(lp); env(g, t, .01, .9, .35); o.start(t); o.stop(t + .45); } },
  unhas(pos) { const t = AC.currentTime, s = ruido(), f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 2600; const g = saida({ x: pos.x, y: 1.4, z: pos.z }, .4); const tr = AC.createOscillator(); tr.frequency.value = 13; const tg = AC.createGain(); tg.gain.value = .08; tr.connect(tg); tg.connect(g.gain); s.connect(f); f.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.12, t + .2); g.gain.linearRampToValueAtTime(.0001, t + 1.4); s.start(t); tr.start(t); s.stop(t + 1.5); tr.stop(t + 1.5); },
  agarrao() { const t = AC.currentTime, g = saida(null, .4); burst(t, .3, 'lowpass', 220, 1, g, 0); env(g, t, .002, 1.6, .25); SOM.grito('inspetor'); const g2 = saida(null, .2); burst(t + .05, .9, 'bandpass', 900, 3, g2); env(g2, t + .05, .05, .4, .8); },
  boteChiado(pos) { const t = AC.currentTime, g = saida({ x: pos.x, y: 2.8, z: pos.z }, .3); const f = burst(t, .35, 'highpass', 2200, 1, g); f.frequency.linearRampToValueAtTime(5000, t + .3); env(g, t, .25, .7, .1); },
  respiracaoNuca() { // sopro de criança colado na sua nuca
    const fw = new THREE.Vector3(); camera.getWorldDirection(fw); const p = { x: camera.position.x - fw.x * .35, y: camera.position.y, z: camera.position.z - fw.z * .35 };
    const t = AC.currentTime; for (const k of [0, .6]) { const g = saida(p, .05); burst(t + k, .45, 'bandpass', 1400, 1.2, g); env(g, t + k, .12, .5, .3); }
  },
  pesDescalcos(pos, molhado) { const t = AC.currentTime, g = saida({ x: pos.x, y: .1, z: pos.z }, .3); burst(t, .05, molhado ? 'bandpass' : 'highpass', molhado ? 900 : 1800, 1.5, g); env(g, t, .002, molhado ? .3 : .16, .04); },
  anaHum(on, pos) { // a melodia da caixinha cantarolada, cortada seco quando a luz sai dela
    if (on && !AMBX.hum) { const o = AC.createOscillator(); o.type = 'sine'; const g = saida(pos, .6); g.gain.value = .07; o.connect(g); const t = AC.currentTime; const notas = [659, 784, 659, 523, 587, 494, 523, 440]; for (let i = 0; i < 40; i++) o.frequency.setValueAtTime(notas[i % 8] * .995, t + i * .5); o.start(t); o.stop(t + 20); AMBX.hum = { o, g }; }
    else if (!on && AMBX.hum) { const t = AC.currentTime; AMBX.hum.g.gain.cancelScheduledValues(t); AMBX.hum.g.gain.setValueAtTime(0, t); try { AMBX.hum.o.stop(t + .01); } catch (e) {} AMBX.hum = null; }
  },
  passinhos(pos) { for (let i = 0; i < 6; i++) for (let k = 0; k < 3; k++) { const t = AC.currentTime + i * .36 + k * .015, g = saida({ x: pos.x + rand(-1, 1), y: .1, z: pos.z + rand(-1, 1) }, .7); burst(t, .05, 'highpass', 1500, 1, g); env(g, t, .002, .35, .05); } },
  sussurroSilencio(pos, vol = 1) { const t = AC.currentTime; [[0, 2600, .5], [.5, 1900, .35], [.85, 3200, .45]].forEach(([k, f, d]) => { const g = saida({ x: pos.x, y: 1, z: pos.z }, .7); burst(t + k, d, 'bandpass', f, 4, g); env(g, t + k, .08, .18 * vol, d * .8); }); },
  faisca(x, z) { const t = AC.currentTime; for (let i = 0; i < 9; i++) { const g = saida({ x, y: 2.6, z }, .3), k = rand(0, .45); burst(t + k, .02, 'highpass', 4000, 1, g); env(g, t + k, .001, .4, .02); } },
  vozFalsa(x, z, quem) { // a voz chama do jeito errado: a sua própria, ou a de quem não pode estar aqui
    const t = AC.currentTime, fs = quem === 'mae' ? [[0, 247], [.45, 220], [.9, 196]] : [[0, 440], [.3, 392]];
    for (const [k, f] of fs) { const g = saida({ x, y: 1.5, z }, .9); const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(f, t + k); o.frequency.linearRampToValueAtTime(f * .9, t + k + .4); const fl = AC.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = quem === 'mae' ? 700 : 1300; fl.Q.value = 3; o.connect(fl); fl.connect(g); env(g, t + k, .08, .11, .5); o.start(t + k); o.stop(t + k + .7); }
  },
  tropeco(pos) { const t = AC.currentTime, g = saida({ x: pos.x, y: .4, z: pos.z }, .6); burst(t, .6, 'lowpass', 260, 1, g, 0); env(g, t, .003, 1.4, .5); SOMX.respiraRasgada(pos); },
  portaLonge(x, z) { const t = AC.currentTime, g = saida({ x, y: 1, z }, .9); const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180; lp.connect(g); burst(t, .7, 'lowpass', 300, 1, lp, 0); env(g, t, .003, 1.2, .6); },
  arrastoAr(pos) { const t = AC.currentTime, g = saida({ x: pos.x, y: 1.4, z: pos.z }, .2); const f = burst(t, .3, 'bandpass', 600, 1, g); f.frequency.linearRampToValueAtTime(2400, t + .25); env(g, t, .03, .6, .25); }
};
const SX = new Proxy({}, { get: (t, k) => (...a) => { if (!AC) return; try { UIX.som('x_' + k, a); } catch (e) {} try { return SOMX[k] && SOMX[k](...a); } catch (e) { console.warn(e); } } }); // Lote 3: os sons das entidades também ganham legenda
// Silêncio repentino: abafa o mundo inteiro por um instante
function abafarMundo(nivel, dur) {
  if (!AC || !master) return;
  const t = AC.currentTime, g = master.gain; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(OPT.vol * nivel, t + .06); g.setValueAtTime(OPT.vol * nivel, t + dur); g.linearRampToValueAtTime(OPT.vol, t + dur + .3);
}
function abafarDrone(dur) { if (!AC || !AMB.drone) return; const t = AC.currentTime, g = AMB.drone.gain; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(.004, t + .1); g.setValueAtTime(.004, t + dur); g.linearRampToValueAtTime(.05, t + dur + 1); }

// Personagens extras das legendas: a voz que imita a Lia vem com a cor do Inspetor
if (R.personagens) {
  R.personagens.liaFalsa = R.personagens.liaFalsa || { nome: (R.personagens.lia || {}).nome || 'Lia', cor: (R.personagens.inspetor || {}).cor || '#c0392b' };
  R.personagens.mae = R.personagens.mae || { nome: 'Mãe', cor: (R.personagens.inspetor || {}).cor || '#c0392b' };
  R.personagens.crianca = R.personagens.crianca || { nome: 'Criança', cor: '#b98a8a' };
}

// Camada de tela dos sustos de esconderijo (sombra na fresta, olhos vermelhos, camisola)
const FXM = document.createElement('div'); FXM.className = 'fx'; FXM.id = 'fx-monstro'; FXM.style.cssText = 'opacity:0;transition:opacity .3s';
{ const lk = $('#fx-locker'); if (lk) lk.before(FXM); else document.body.appendChild(FXM); }
const FXM_BG = {
  sombra: 'radial-gradient(ellipse 22% 42% at 50% 42%, rgba(0,0,0,.97), rgba(0,0,0,.6) 55%, rgba(0,0,0,0) 80%)',
  olhos: [[34, 40], [44, 46], [55, 38], [64, 47], [27, 52], [72, 52], [50, 55]].map(([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,50,20,.95) 0 .25vw, rgba(255,30,10,0) .7vw), radial-gradient(circle at ${x + 2.2}% ${y}%, rgba(255,50,20,.95) 0 .25vw, rgba(255,30,10,0) .7vw)`).join(',') + ', rgba(20,0,0,.35)',
  camisola: 'linear-gradient(90deg, transparent 36%, rgba(168,162,148,.42) 44% 56%, transparent 64%)'
};
let fxmAtual = '';
function updateFxMonstro() {
  let tipo = '';
  if (S.hidden && !S.dead) {
    if (M.ativo && (M.state === 'fareja' || M.state === 'vasculha')) tipo = 'sombra';
    else if (PROC.olhos > 0) tipo = 'olhos';
    else if (ANA.ativa && !ANA.script && ANA.pos.distanceTo(new THREE.Vector3(S.hidden.x, 0, S.hidden.z)) < 1.9) tipo = 'camisola';
  }
  if (tipo !== fxmAtual) { fxmAtual = tipo; if (tipo) FXM.style.background = FXM_BG[tipo]; FXM.style.opacity = tipo ? 1 : 0; }
}
// Barra de "nervos" no esconderijo
{ const br = $('#breath'); if (br) { const w = document.createElement('div'); w.id = 'b-ansia-w'; w.style.cssText = 'margin-top:10px;font-size:14px;color:#d9a79f'; w.innerHTML = 'Nervos<i id="b-ansia"></i>'; br.appendChild(w); const st = document.createElement('style'); st.textContent = '#b-ansia::after{background:#c0392b!important}'; document.head.appendChild(st); } }
// Mãos do Inspetor presas à câmera durante o agarrão
const MAOS = new THREE.Group(); MAOS.visible = false; camera.add(MAOS);
{ const pele = new THREE.MeshStandardMaterial({ color: 0x4a4038, roughness: .55 }); for (const s of [-1, 1]) { const m = new THREE.Group(); m.position.set(s * .3, -.08, -.5); m.rotation.z = s * .55; MAOS.add(m); box(.13, .09, .04, pele, 0, -.06, 0, m, false); for (let i = 0; i < 4; i++) { const f = box(.022, .36, .022, pele, (i - 1.5) * .042, .14, 0, m, false); f.rotation.x = -.35; f.rotation.z = (i - 1.5) * .08; } } }
const AG = { t: 0, dur: 1.5, sacode: 0, prev: false };
addEventListener('mousemove', e => { if (M.state === 'agarra') AG.sacode += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0); });
// Tremor de armários e portas
const tremores = [];
function tremer(obj, dur = .5, forca = .04) { if (obj) tremores.push({ obj, t: dur, forca, base: obj.rotation.z }); }
function updateTremores(dt) { for (let i = tremores.length - 1; i >= 0; i--) { const r = tremores[i]; r.t -= dt; r.obj.rotation.z = r.t > 0 ? r.base + rand(-r.forca, r.forca) : r.base; if (r.t <= 0) tremores.splice(i, 1); } }
// Decalques no chão (giz da Ana, pegadas molhadas)
const TX_GIZ = canvasTex(128, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(235,230,215,.85)'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.arc(64, 30, 14, 0, Math.PI * 2); g.moveTo(64, 44); g.lineTo(64, 86); g.moveTo(40, 58); g.lineTo(88, 58); g.moveTo(64, 86); g.lineTo(46, 116); g.moveTo(64, 86); g.lineTo(82, 116); g.stroke(); g.beginPath(); g.moveTo(56, 26); g.lineTo(60, 30); g.moveTo(72, 26); g.lineTo(68, 30); g.moveTo(56, 36); g.quadraticCurveTo(64, 30, 72, 36); g.stroke(); g.font = 'bold 22px Georgia'; g.fillStyle = 'rgba(235,230,215,.7)'; g.fillText(String(1 + (Math.random() * 9 | 0)), 98, 30); });
const TX_PEGADA = canvasTex(64, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(30,40,45,.85)'; g.beginPath(); g.ellipse(32, 78, 14, 34, 0, 0, Math.PI * 2); g.fill(); for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(18 + i * 7, 34 - Math.abs(i - 1.5) * 3, 4, 0, Math.PI * 2); g.fill(); } });
TX_GIZ.wrapS = TX_GIZ.wrapT = TX_PEGADA.wrapS = TX_PEGADA.wrapT = THREE.ClampToEdgeWrapping;
const MAT_GIZ = new THREE.MeshBasicMaterial({ map: TX_GIZ, transparent: true, depthWrite: false }); MAT_GIZ.userData.compartilhado = true;
function decal(mat, x, z, w, h, ry = 0, opac) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), opac !== undefined ? mat.clone() : mat); m.rotation.set(-Math.PI / 2, 0, ry); m.position.set(x, .015, z);
  if (opac !== undefined) { m.material.opacity = opac; m.material.userData.compartilhado = false; }
  W.grupo.add(m); return m;
}
const MAT_PEGADA = new THREE.MeshBasicMaterial({ map: TX_PEGADA, transparent: true, depthWrite: false, opacity: .6 }); MAT_PEGADA.userData.compartilhado = true;

// --- O INSPETOR
function modeloInspetor() {
  const g = new THREE.Group(); g.rotation.order = 'YXZ';
  const pele = new THREE.MeshStandardMaterial({ color: 0x4a4038, roughness: .55 });
  const casaco = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: .95 });
  const faixa = new THREE.MeshStandardMaterial({ color: 0xbcae94, roughness: 1, emissive: 0x8a7c62, emissiveIntensity: 0 });
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
  const boca = box(.06, .22, .03, MAT.preto, 0, -.06, .14, cabeca, false);
  cabeca.rotation.z = .45;
  const armL = new THREE.Group(), armR = new THREE.Group(); armL.position.set(-.38, 3.2, 0); armR.position.set(.38, 3.2, 0);
  const maos = [];
  for (const [a, s] of [[armL, -1], [armR, 1]]) {
    cyl(.045, .03, 1.95, casaco, 0, -.97, 0, 6, a);
    const mao = new THREE.Group(); mao.position.y = -1.98; a.add(mao); maos.push(mao);
    for (let i = 0; i < 4; i++) { const f = box(.016, .42, .016, pele, (i - 1.5) * .028, -.2, 0, mao); f.rotation.x = .25; }
    a.rotation.z = s * .07;
  }
  g.add(legL, legR, armL, armR);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.scale.setScalar(.8);
  return { g, cabeca, armL, armR, legL, legR, faixa, boca, maos };
}
const MON = modeloInspetor(); scene.add(MON.g); MON.g.visible = false;
// O vulto: uma silhueta dele que some quando a luz encosta
const VULTO = modeloInspetor(); VULTO.g.traverse(o => { if (o.isMesh) { o.material = MAT.sombra; o.castShadow = false; } }); VULTO.g.visible = false; scene.add(VULTO.g);
const M = { pos: new THREE.Vector3(), ativo: false, state: 'patrulha', path: [], wait: 0, searchT: 0, replan: 0, yaw: 0, cool: 0, falaT: 0, stepT: 0, anim: 0, furia: 0, clickT: 0, tensao: 0, recuo: 0, diretorT: 20, achou: false, alvoGarrafa: 0,
  ultimo: null, alertaT: 0, cacaT: 0, boteT: 0, boteAgachou: false, boteIni: false, alvoL: null, farejaT: 0, farejaCd: 0, vasculhaT: 0, certo: false, acao: null, emboscadaT: 0, emboscadaClique: false, conferir: 0, conferirSala: null,
  garrafas: [], ignoraGarrafa: 0, calorT: 0, calorCd: 0, quaseT: 0, olhar: null, olharT: 0, hbT: 1, ansiedade: 0, porta: null, socos: 0, tropecoT: 15, somT: 2, escutaT: 0, escutaCd: 3, chamadoT: 0, favCheck: false, ultimaFala: '', correnteT: 0, ofegoT: 3, cacos: [], cacosGrupo: null, flashes: [], caidoT: 0, portaCd: {} };
function ativarInspetor(x, z, estado = 'patrulha') {
  M.ativo = true; MON.g.visible = true; M.pos.set(x, 0, z); M.cool = 3; M.state = estado; M.path = []; M.tensao = 0; M.recuo = 0; M.wait = 0;
  M.achou = false; M.certo = false; M.acao = null; M.ansiedade = 0; M.ultimo = null; M.cacaT = 0; M.chamadoT = 0; M.olharT = 0;
  if (estado === 'patrulha') patrulhar();
}
function desativarInspetor() {
  if (M.state === 'agarra') { P.bloqueado = AG.prev; MAOS.visible = false; $('#fx-red').style.transition = 'opacity .6s'; $('#fx-red').style.opacity = 0; } // o agarrão interrompido não deixa a tela vermelha presa
  M.ativo = false; MON.g.visible = false; M.path = []; M.acao = null; if (M.state !== 'patrulha') M.state = 'patrulha';
}
function patrulhar() {
  const salas = salasAlcancaveis(M.pos, { semFora: !W.def.inspetorFora }).filter(r => !r.seguro);
  if (!salas.length) return;
  let r;
  const pressao = .3 + S.chapter * .07;
  if (M.recuo > 0) r = salas.reduce((a, b) => distSalas(b, P.room) > distSalas(a, P.room) ? b : a, salas[0]);
  else if (Math.random() < pressao && salas.includes(P.room)) r = P.room;
  else {
    // ele aprende as suas rotas: salas por onde você passa mais pesam mais no sorteio
    const rotas = S.flags.rotas || {}, pesos = salas.map(s => 1 + Math.min(4, (rotas[W.mapa + ':' + s.id] || 0) * .5));
    let x = Math.random() * pesos.reduce((a, b) => a + b, 0); r = salas[salas.length - 1];
    for (let i = 0; i < salas.length; i++) { x -= pesos[i]; if (x <= 0) { r = salas[i]; break; } }
  }
  const [x, z] = pontoEm(r);
  M.state = 'patrulha'; M.acao = null; planejar(M, x, z);
}
function emitNoise(x, z, r, doJogador, garrafa) {
  VIS.ruido(x, z, r);
  UIX.ruido(x, z, r);
  if (S && Math.hypot(x - P.pos.x, z - P.pos.z) < 1.6) ruidoQuadro = Math.max(ruidoQuadro, r);
  if (!M.ativo || S.dead || !W.salas.length) return;
  if (MP) MP.ruido(x, z, r, doJogador, garrafa);
  const d = Math.hypot(M.pos.x - x, M.pos.z - z);
  if (!garrafa) r *= mascaraSom(x, z); // trovão e chuva forte cobrem o barulho
  const att = atenuacao(roomAt(M.pos.x, M.pos.z), roomAt(x, z));
  const alcance = r * att * D().ouvido;
  const ocupado = ['alerta', 'bote', 'agarra', 'fareja', 'vasculha'].includes(M.state);
  if (d < alcance) {
    if (garrafa) {
      M.garrafas = M.garrafas.filter(t => S.tempo - t < 90); M.garrafas.push(S.tempo);
      if (M.ignoraGarrafa > 0 || M.garrafas.length >= 3) { // cansou do truque: só vira a cabeça e vem ver de onde a garrafa saiu
        if (M.ignoraGarrafa <= 0) { M.ignoraGarrafa = 45; M.falaT = 0; falaInspetor(false, 'truque'); }
        M.olhar = new THREE.Vector3(x, 0, z); M.olharT = 1.2;
        if (!ocupado && M.state !== 'caca' && !S.hidden) { M.state = 'investiga'; M.searchT = 0; M.acao = null; M.ultimo = P.pos.clone(); planejar(M, P.pos.x, P.pos.z); }
        return;
      }
    }
    const tipo = garrafa ? 'vidro' : W.doors.some(dd => dd.x === x && dd.z === z) ? 'porta' : doJogador && S.hidden ? 'respira' : null;
    if (doJogador && S.hidden && d < 2.6 && !JM.protegido(S.hidden, r)) M.achou = true;
    if (ocupado) return;
    // em plena caçada, colado em você, a garrafa só faz ele virar a cabeça
    if (garrafa && M.state === 'caca' && M.pos.distanceTo(P.pos) < 5) { M.olhar = new THREE.Vector3(x, 0, z); M.olharT = .6; return; }
    M.ultimo = new THREE.Vector3(x, 0, z); M.acao = null;
    const e0 = M.state;
    if (M.state !== 'caca' || garrafa) { M.state = 'investiga'; M.searchT = 0; planejar(M, x, z); falaInspetor(false, tipo); if (garrafa) M.alvoGarrafa = 4; }
    if (doJogador && !garrafa && MP) MP.ouviu(e0, tipo);
    else planejar(M, x, z);
  } else if (d < alcance * 1.4 && !ocupado && M.state !== 'caca') quase(x, z);
}
// Quase ouviu: para, vira a cabeça na direção e estala duas vezes
function quase(x, z) {
  if (M.quaseT > 0) return;
  M.quaseT = 4; M.olhar = new THREE.Vector3(x, 0, z); M.olharT = 1.5; SX.estalo(M.pos, .9, true); if (MP) MP.quase();
  if (M.state === 'patrulha' || M.state === 'procura') M.wait = Math.max(M.wait, 1.3);
}
function falaInspetor(perdeu, tipo) {
  if (M.falaT > 0) return; M.falaT = rand(8, 14);
  const esp = ML.falaExtra(perdeu, tipo); if (esp) { M.ultimaFala = esp; sub('inspetor', esp); SFX.voz(M.pos, esp); return; } // falas de memória e de quem ele reconhece (src/monstros-lore.js)
  const ent = R.entidades.inspetor, ctx = tipo && ent.falas_tipo && ent.falas_tipo[tipo];
  const extra = (!perdeu && ent.porCapitulo && ent.porCapitulo[S.chapter]) || [];
  const lista = ctx && (Math.random() < .8 || !(perdeu ? ent.falas_perdeu : ent.falas_caca)) ? ctx : [...(perdeu ? ent.falas_perdeu : ent.falas_caca), ...extra];
  let t = pick(lista); for (let i = 0; i < 4 && t === M.ultimaFala && lista.length > 1; i++) t = pick(lista);
  if (tipo === 'luz') S.flags.falouLuz = true;
  M.ultimaFala = t; sub('inspetor', t); SFX.voz(M.pos, t);
}
function tipoPasso() { return P.sprinting ? 'corrida' : P.naAgua ? 'agua' : (S.flags.energia && !S.flags.falouLuz) ? 'luz' : null; }
function pisoMult() {
  if (!P.room) return 1;
  if (P.naAgua && P.crouch) return .55; // agachada na água: quase sem barulho
  return { madeira: 1.25, concreto: 1, tapete: .6, grama: .9, terra: .9 }[P.room.piso] || 1;
}
function iniciarAlerta() {
  if (['caca', 'alerta', 'bote', 'agarra'].includes(M.state)) return;
  M.acao = null;
  if (S.flags.sino || M.furia > 0) { entrarCaca(); return; }
  M.state = 'alerta'; M.path = []; M.alertaT = (S.dif === 'pesadelo' ? .4 : S.dif === 'facil' ? 1 : .7);
  M.olhar = P.pos.clone(); M.olharT = M.alertaT + .3;
  SX.estalo(M.pos, 1.5, true); abafarMundo(.18, M.alertaT);
}
function entrarCaca() {
  M.state = 'caca'; M.cacaT = 0; SUST.stinger(M.pos.distanceTo(P.pos));
  const tp = tipoPasso(); if (tp === 'luz') S.flags.falouLuz = true;
  M.falaT = 0; falaInspetor(false, tp); S.capVisto++;
  planejar(M, P.pos.x, P.pos.z); M.replan = .35;
}
function iniciarBote() {
  M.state = 'bote'; M.path = []; M.boteT = S.flags.sino ? .3 : S.dif === 'pesadelo' ? .2 : S.dif === 'facil' ? .5 : .35;
  M.boteIni = P.crouch; M.boteAgachou = false; M.yaw = Math.atan2(P.pos.x - M.pos.x, P.pos.z - M.pos.z);
  SX.boteChiado(M.pos); SX.estalo(M.pos, 1.4); P.shake = Math.max(P.shake, .04);
}
function agarrar() {
  M.state = 'agarra'; M.path = []; M.acao = null; AG.t = 0; AG.dur = 1.5; AG.sacode = 0; AG.prev = P.bloqueado; P.bloqueado = true; MAOS.visible = true;
  SX.agarrao(); JP.agarrao(); P.shake = .2; S.fear = 100; $('#fx-red').style.transition = 'none'; $('#fx-red').style.opacity = .8;
  if (!S.flags.dicaAgarrao) { S.flags.dicaAgarrao = true; toast(JP.t('KeyE') === 'Usar' ? 'Arraste o dedo de um lado para o outro para se soltar!' : JP.t('KeyE') === 'A' ? 'Sacuda o analógico para se soltar!' : 'Sacuda o mouse para se soltar!'); }
}
function arranhao() {
  const dano = 15 * (S.dif === 'pesadelo' ? 2 : D().dano); S.health -= dano; S.capDano += dano; P.shake = .12; SFX.ofego();
  $('#fx-red').style.transition = 'none'; $('#fx-red').style.opacity = .55; setTimeout(() => { $('#fx-red').style.transition = 'opacity 1.5s'; $('#fx-red').style.opacity = 0; }, 60);
  if (S.health <= 0) { S.causaCtx = 'bote'; morrer('inspetor'); } else toast('As unhas rasparam o seu braço.');
}
function abrirEsconderijo() {
  const L = S.hidden; if (!L) return;
  if (ML.protegido(L)) { ML.poupou(L); desistirDoEsconderijo(); return; } // armários que ele não abre (o do castigo, o do terceiro menino)
  SX.armarioBate(L); tremer(L.g, .3, .08); S.causaCtx = 'escondida';
  sairEsconderijo(true); agarrar();
}
function iniciarFareja(L, favorito) {
  M.state = 'fareja'; M.farejaT = 3; M.alvoL = L; M.path = []; M.acao = null; M.farejaCd = 25;
  M.yaw = Math.atan2(L.x - M.pos.x, L.z - M.pos.z); SX.inspira(M.pos);
  if (favorito) { M.falaT = 0; falaInspetor(false, 'favorito'); }
}
function iniciarVasculha() {
  M.state = 'vasculha'; M.vasculhaT = 4.2; M.alvoL = S.hidden; M.path = []; M.acao = null; M.batidas = 0;
  M.yaw = Math.atan2(S.hidden.x - M.pos.x, S.hidden.z - M.pos.z);
}
function desistirDoEsconderijo() {
  conquista('folego'); M.achou = false; M.certo = false; M.falaT = 0; falaInspetor(true);
  M.state = 'procura'; M.searchT = 3; M.farejaCd = 25; M.wait = .8;
  const viz = salasAlcancaveis(M.pos, { semFora: !W.def.inspetorFora }).filter(r => r !== P.room && !r.seguro);
  if (viz.length) { const [x, z] = pontoEm(pick(viz)); planejar(M, x, z); }
}
// Armário que ele vai vistoriar: o favorito da jogadora ou um qualquer da sala, que ele abre com estrondo
function frenteDe(L, m = .95) { return [L.x + L.face[0] * m, L.z + L.face[1] * m]; }
function escolherAcaoProcura(ra) {
  const uso = S.flags.escUso || {};
  if (!M.favCheck) {
    M.favCheck = true;
    const fav = W.lockers.find((L, i) => (uso[W.mapa + ':' + i] || 0) >= 3 && !JM.nuncaAbre(L) && Math.hypot(L.x - M.pos.x, L.z - M.pos.z) < 12 && salaAdj(roomAt(L.x, L.z), ra));
    if (fav) { const [x, z] = frenteDe(fav); if (planejar(M, x, z)) { M.acao = { tipo: 'favorito', L: fav }; return true; } }
  }
  if (Math.random() < .35) {
    const arms = W.lockers.filter(L => L !== S.hidden && !JM.nuncaAbre(L) && roomAt(L.x, L.z) === ra && Math.hypot(L.x - M.pos.x, L.z - M.pos.z) < 9);
    if (arms.length) { const L = pick(arms); const [x, z] = frenteDe(L); planejar(M, x, z); M.acao = { tipo: 'bater', L }; return true; }
  }
  if (Math.random() < .25 && M.escutaCd <= 0) { escutar(rand(1.5, 2.5)); return true; }
  return false;
}
function executarAcao() {
  const a = M.acao; M.acao = null; if (!a) return;
  M.yaw = Math.atan2(a.L.x - M.pos.x, a.L.z - M.pos.z);
  if (a.tipo === 'favorito' && S.hidden === a.L) { iniciarFareja(a.L, true); return; }
  SX.armarioBate(a.L); tremer(a.L.g, .45, .06); M.wait = rand(1.4, 2.2);
  if (S.hidden && Math.hypot(S.hidden.x - a.L.x, S.hidden.z - a.L.z) < 2) { P.shake = Math.max(P.shake, .06); S.fear = Math.min(100, S.fear + 18); }
}
function escutar(dur) { // para, inclina a cabeça e fica mudo ouvindo
  M.escutaVolta = M.state === 'escuta' ? 'procura' : (M.state || 'procura'); if (M.escutaVolta === 'caca' || M.escutaVolta === 'investiga') M.escutaVolta = 'procura';
  M.state = 'escuta'; M.escutaT = dur; M.escutaCd = rand(5, 8); M.path = [];
  if (M.ultimo) { M.olhar = M.ultimo.clone(); M.olharT = dur; }
}
function fimProcura(ra) {
  const mesma = S.hidden && roomAt(S.hidden.x, S.hidden.z) === ra;
  if (S.chapter >= 2 && !S.flags.sino && Math.random() < .25) { // finge que vai embora e fica parado, mudo, esperando
    M.state = 'emboscada'; M.emboscadaT = rand(6, 10); M.emboscadaClique = false; M.path = [];
    const dir = new THREE.Vector3(M.pos.x - P.pos.x, 0, M.pos.z - P.pos.z).normalize(); SX.passosLonge(M.pos, dir);
    return;
  }
  if (mesma && Math.random() < .3) { // sai da sala, espera em silêncio e volta de repente
    const viz = W.links.filter(l => (l.a === ra.id || l.b === ra.id) && (!l.door || l.door.open)).map(l => SALA(l.a === ra.id ? l.b : l.a)).filter(r => !r.seguro && (!r.fora || W.def.inspetorFora));
    if (viz.length) { const [x, z] = pontoEm(pick(viz)); planejar(M, x, z); M.state = 'conferir'; M.conferir = 1; M.conferirSala = ra; return; }
  }
  patrulhar();
}
function portaInspetor(dr) {
  const k = dr.id || (dr.x + ',' + dr.z);
  if (M.state === 'caca' && !S.flags.sino) { // na caçada ele esmurra a porta antes de arrombar
    if (M.porta !== dr) { M.porta = dr; M.socos = 0; }
    if (M.socos < 3 && !(dr.ml3Cara > 0 && MP)) { // a porta que já bateu na cara dele, ele arromba de primeira
      M.socos++; SFX.pancada(dr.x, dr.z); dr.ang += rand(-.08, .08); M.wait = .55; tremer(dr.pivot, .25, .03);
      const dp = Math.hypot(dr.x - P.pos.x, dr.z - P.pos.z); if (dp < 7) { P.shake = Math.max(P.shake, .03 + M.socos * .02); if (MP) MP.vib(.25 + M.socos * .15, .3, 90); }
      return;
    }
    M.porta = null;
    if (MP) MP.arrombar(dr); else { setDoor(dr, true, true); SFX.pancada(dr.x, dr.z); SX.armarioBate({ x: dr.x, z: dr.z }); M.wait = .25; }
  } else { // fora da caçada ele gira a maçaneta devagar e entra quase sem barulho
    if (M.portaCd[k] > 0) return;
    M.portaCd[k] = 1.1; SX.macaneta(dr.x, dr.z); M.wait = 1;
    setTimeout(() => { if (!dr.open) { setDoor(dr, true, true); SFX.rangido(dr.x, 1.2, dr.z, .45); } }, 900);
  }
}
// Porta fechada na cara dele durante a caçada
function aoPortaJogador(d) {
  if (!M.ativo || d.open || M.state !== 'caca' || S.flags.sino) return;
  if (Math.hypot(M.pos.x - d.x, M.pos.z - d.z) > 3) return;
  const k = 'cara:' + (d.id || d.x + ',' + d.z);
  if ((M.portaCd[k] || 0) > 0) return;
  M.portaCd[k] = 20; M.wait = Math.max(M.wait, 1.5); SFX.pancada(d.x, d.z); setTimeout(() => SFX.pancada(d.x, d.z), 260); SX.respiraRasgada(M.pos); toast('A porta bateu na cara dele.'); conquista('porta_cara');
  d.ml3Cara = (d.ml3Cara || 0) + 1; if (MP) MP.cara(); // ele não esquece: da próxima vez, arromba essa porta de primeira
}
function checarEntradaEsconderijo(L) {
  const uso = S.flags.escUso || (S.flags.escUso = {}), k = W.mapa + ':' + W.lockers.indexOf(L);
  uso[k] = (uso[k] || 0) + 1;
  if (uso[k] === 3) setTimeout(() => subPequeno('lia', 'Ele já sabe desse armário. Preciso variar.'), 700);
  if (!teste && M.ativo && ['caca', 'alerta', 'bote'].includes(M.state)) { // na caçada perto, quem decide é o teste da porta (prender o ar)
    const d = M.pos.distanceTo(P.pos);
    if (d < 1.6) { toast('Ele está perto demais! Ele ouviu você entrar.'); M.achou = true; M.certo = true; }
    else if (d < 4 && !JM.protegido(L, 3)) { toast('Ele ouviu a porta. Prenda a respiração (ESPAÇO)!'); M.achou = true; M.certo = false; }
    if (M.achou) { M.state = 'investiga'; M.acao = null; const [x, z] = frenteDe(L, 1.1); planejar(M, x, z); }
  }
}
// No esconderijo: os nervos sobem quando ele está perto; quando enchem, você ofega alto
function ansiedadeEsconderijo(dt, perto) {
  if (!perto) { M.ansiedade = Math.max(0, M.ansiedade - dt * .3); return; }
  const d = M.pos.distanceTo(P.pos);
  M.ansiedade += dt * ((1 - clamp(d / 5.5, 0, 1)) * .35 + S.fear / 100 * .12) * (S.dif === 'facil' ? .7 : 1);
  if (M.ansiedade >= 1) { M.ansiedade = .45; SFX.ofego(); ANA.escondT = 0; emitNoise(P.pos.x, P.pos.z, 2.3, true); if (!S.flags.dicaNervos) { S.flags.dicaNervos = true; toast('Os nervos venceram. Segure ESPAÇO antes da barra encher.'); } }
}
function inicioRecuo() { // ele vai embora, e dá para ouvir
  const salas = salasAlcancaveis(M.pos, { semFora: !W.def.inspetorFora });
  const longe = salas.reduce((a, b) => distSalas(b, P.room) > distSalas(a, P.room) ? b : a, salas[0] || P.room);
  if (longe) { const c = centroSala(longe); SX.portaLonge(c.x, c.z); }
  SX.passosLonge(M.pos, new THREE.Vector3(M.pos.x - P.pos.x, 0, M.pos.z - P.pos.z).normalize());
}
function fimRecuo() { // um estalo seco perto de uma porta da sala vizinha: ele voltou
  const l = W.links.find(l => l.a === P.room.id || l.b === P.room.id);
  if (l) SX.estalo({ x: l.x, z: l.z }, 1.1);
}
function estourarLampada(L) {
  L.estourou = true; L.base = 0; L.luz.intensity = 0; L.bulbo.material.emissive.setHex(0x000000);
  SFX.vidro(L.x, L.z); SX.faisca(L.x, L.z);
  { const dl = Math.hypot(L.x - P.pos.x, L.z - P.pos.z); if (dl < 5) { P.shake = Math.max(P.shake, .05 * (1 - dl / 5)); if (MP) MP.vib(.3, .5, 90); } }
  const fl = new THREE.PointLight(0xbfe0ff, 9, 6, 1.5); fl.position.set(L.x, 2.4, L.z); W.grupo.add(fl); M.flashes.push({ l: fl, t: .25 });
  for (let i = 0; i < 7; i++) { const c = box(rand(.03, .07), .006, rand(.03, .06), MAT.vidro, L.x + rand(-.6, .6), .012, L.z + rand(-.6, .6), W.grupo, false); c.rotation.y = rand(0, 3); }
  M.cacos.push({ x: L.x, z: L.z, cd: 0 });
}
function updateLampadasECacos(dt) {
  if (M.cacosGrupo !== W.grupo) { M.cacosGrupo = W.grupo; M.cacos = []; M.flashes = []; }
  for (let i = M.flashes.length - 1; i >= 0; i--) { const f = M.flashes[i]; f.t -= dt; f.l.intensity = Math.max(0, f.t * 36 * Math.random()); if (f.t <= 0) { W.grupo.remove(f.l); M.flashes.splice(i, 1); } }
  for (const c of M.cacos) { c.cd -= dt; if (c.cd <= 0 && !S.hidden && P.noiseR > 0 && !P.crouch && Math.hypot(P.pos.x - c.x, P.pos.z - c.z) < .8) { c.cd = 1.5; SFX.vidro(c.x, c.z); emitNoise(c.x, c.z, 5, true); } }
  if (M.ativo && M.state === 'caca') for (const L of W.lampadas) {
    if (!L.ligada || L.estourou) continue;
    const dl = Math.hypot(L.x - M.pos.x, L.z - M.pos.z);
    if (dl < 1.5 && !L.checada) { L.checada = true; if (Math.random() < .25) estourarLampada(L); } else if (dl > 3) L.checada = false;
  }
}
const _vInsA = new THREE.Vector3(), _vInsB = new THREE.Vector3(), _vAnaA = new THREE.Vector3(), _vProcA = new THREE.Vector3();
function updateInspetor(dt) {
  updateTremores(dt);
  updateLampadasECacos(dt);
  const hb = $('#b-ansia'); if (hb) hb.style.setProperty('--v', (M.ansiedade * 100).toFixed(0) + '%');
  if (!M.ativo) return;
  M.cool = Math.max(0, M.cool - dt); M.falaT = Math.max(0, M.falaT - dt); M.alvoGarrafa = Math.max(0, M.alvoGarrafa - dt);
  M.ignoraGarrafa = Math.max(0, M.ignoraGarrafa - dt); M.quaseT = Math.max(0, M.quaseT - dt); M.olharT = Math.max(0, M.olharT - dt); M.calorCd = Math.max(0, M.calorCd - dt);
  M.farejaCd = Math.max(0, M.farejaCd - dt); M.escutaCd = Math.max(0, M.escutaCd - dt);
  for (const k in M.portaCd) M.portaCd[k] -= dt;
  const recuoAntes = M.recuo; M.recuo = Math.max(0, M.recuo - dt); if (recuoAntes > 0 && M.recuo <= 0) fimRecuo();
  const d = M.pos.distanceTo(P.pos), ra = roomAt(M.pos.x, M.pos.z);
  const att = atenuacao(ra, P.room);
  const fuga = S.flags.sino;
  const cb = MP ? MP.cerebro(dt) : dt; // na qualidade Baixa, ouvido e caminho a 15 Hz (o movimento continua por quadro)
  if (M.furia > 0) M.furia -= dt;
  const ocupado = ['alerta', 'bote', 'agarra', 'fareja', 'vasculha'].includes(M.state);
  // Diretor de tensão: depois de muita pressão ele recua um pouco, e dá para ouvir ele indo embora
  M.tensao = clamp(M.tensao + (d < 10 ? (14 - d) * dt * 1.1 : -dt * 2), 0, 100);
  if (M.tensao >= 100 && !fuga && M.furia <= 0 && M.state !== 'caca' && !ocupado) { M.recuo = rand(12, 18) * D().intervalo; M.tensao = 0; patrulhar(); inicioRecuo(); }
  if (M.recuo > 0 && Math.random() < dt * .12) { const r = salasAlcancaveis(P.pos).find(s => distSalas(s, P.room) === 2); if (r) { const [x, z] = pontoEm(r); SFX.passoMonstro({ x, z }, .35); } }
  M.diretorT -= dt;
  if (M.diretorT <= 0 && M.state === 'patrulha' && M.recuo <= 0) {
    M.diretorT = rand(18, 32) * D().intervalo;
    if (d > 22) { const viz = [P.room, ...W.links.filter(l => (l.a === P.room.id || l.b === P.room.id) && !(l.door && l.door.trava && l.door.trava())).map(l => SALA(l.a === P.room.id ? l.b : l.a))].filter(r => (!r.fora || W.def.inspetorFora) && !r.seguro); const r = pick(viz); if (r) { const [x, z] = pontoEm(r); planejar(M, x, z); } }
  }
  // Rotas da jogadora (ele aprende por onde você passa)
  if (P.room && P.room !== M.ultSalaJog) { M.ultSalaJog = P.room; const rt = S.flags.rotas || (S.flags.rotas = {}), k = W.mapa + ':' + P.room.id; rt[k] = (rt[k] || 0) + 1; }
  // Audição (submersa na água dos túneis, ela não é ouvida; trovão e chuva mascaram os passos)
  const ajuda = 1; // a ajuda invisível já está em D().ouvido
  const ouvido = P.noiseR * pisoMult() * att * D().ouvido * ajuda * JM.ouvidoMul() * (M.state === 'caca' ? 1.6 : M.state === 'escuta' ? 1.5 : M.state === 'reza' ? .5 : 1) * mascaraSom(P.pos.x, P.pos.z);
  const submersa = !!(W.def.submersa && W.def.submersa());
  const ouve = !S.hidden && !submersa && !(P.room.seguro && !fuga) && (fuga || M.furia > 0 || (P.noiseR > 0 && d < ouvido));
  if (cb && ouve && !(M.alvoGarrafa && d > 4) && !ocupado) {
    M.ultimo = P.pos.clone();
    if (M.state !== 'caca') {
      const e0 = M.state;
      if (d < 11 || fuga || M.furia > 0 || M.state === 'escuta' || M.state === 'emboscada') iniciarAlerta();
      else { if (M.state !== 'investiga') falaInspetor(false, tipoPasso()); M.state = 'investiga'; M.acao = null; }
      if (MP) MP.ouviu(e0, tipoPasso());
    }
    if (M.state === 'caca' || M.state === 'investiga') { M.replan -= cb; if (M.replan <= 0) { planejar(M, P.pos.x, P.pos.z); M.replan = .35; } }
    M.searchT = 0;
  } else if (cb && !ouve && !S.hidden && !submersa && P.noiseR > 0 && d < ouvido * 1.4 && !ocupado && M.state !== 'caca') quase(P.pos.x, P.pos.z);
  if (!S.flags.avist && d < 14 && salaAdj(ra, P.room)) { S.flags.avist = true; SUST.avistamento(); falar('primeiro_avistamento'); }
  // A lanterna esquenta: luz no rosto dele, de perto, por muito tempo, chama atenção
  if (!cb) { /* quadro sem cérebro: o calor da lanterna fica como estava */ }
  else if (!S.hidden && S.flashOn && !flashPisca && d < 3.5 && !ocupado && M.state !== 'caca' && visivel(M.pos, 2.7, 4)) {
    M.calorT += cb;
    if (M.calorT > 1.5 && M.calorCd <= 0) { M.calorT = 0; M.calorCd = 20; M.olhar = P.pos.clone(); M.olharT = 1.5; M.state = 'investiga'; M.acao = null; M.ultimo = P.pos.clone(); planejar(M, P.pos.x, P.pos.z); M.falaT = 0; falaInspetor(false, 'calor'); if (!S.flags.dicaCalor) { S.flags.dicaCalor = true; setTimeout(() => subPequeno('lia', 'Ele sentiu o calor da lanterna no rosto.'), 1800); } }
  } else M.calorT = Math.max(0, M.calorT - cb);
  // Medo no talo: ela ofega alto (fora do esconderijo)
  if (!S.hidden && S.fear > 85) { M.ofegoT -= dt; if (M.ofegoT <= 0) { M.ofegoT = 3; SFX.ofego(); emitNoise(P.pos.x, P.pos.z, 2.5, true); } } else M.ofegoT = Math.max(M.ofegoT, 1);
  // Esconderijo: o coração denuncia, prender o ar acalma, ele fareja quem passa perto
  if (S.hidden) {
    if (prendendo()) { S.fear = Math.max(0, S.fear - 6 * dt); M.ansiedade = Math.max(0, M.ansiedade - dt * .5); }
    if (S.fear > 85 && d < 3 && S.dif !== 'facil') { M.hbT -= dt; if (M.hbT <= 0) { M.hbT = 60 / lerp(55, 150, S.fear / 100); emitNoise(P.pos.x, P.pos.z, 1.6, true); if (!S.flags.dicaCoracao) { S.flags.dicaCoracao = true; subPequeno('lia', 'Ele ouve meu coração. Preciso me acalmar.'); } } }
    const dl = Math.hypot(M.pos.x - S.hidden.x, M.pos.z - S.hidden.z);
    if (!M.achou && !ocupado && M.farejaCd <= 0 && M.state !== 'caca' && dl < 1.8 && !JM.protegido(S.hidden)) iniciarFareja(S.hidden);
  }
  // Estados parados
  if (M.state === 'alerta') { M.alertaT -= dt; if (M.alertaT <= 0) { if (S.hidden) { M.state = 'investiga'; if (M.ultimo) planejar(M, M.ultimo.x, M.ultimo.z); } else entrarCaca(); } }
  else if (M.state === 'escuta') { M.escutaT -= dt; if (M.escutaT <= 0) M.state = M.escutaVolta || 'procura'; }
  else if (M.state === 'emboscada') { M.emboscadaT -= dt; if (M.emboscadaT <= 0) { M.falaT = 0; if (!S.hidden && d < 9) falaInspetor(false, 'volta'); patrulhar(); } }
  else if (M.state === 'bote') {
    M.boteT -= dt; if (P.crouch && !M.boteIni) M.boteAgachou = true;
    if (M.boteT <= 0) {
      const dir = new THREE.Vector3(P.pos.x - M.pos.x, 0, P.pos.z - M.pos.z); if (dir.length() > .01) { dir.normalize(); M.pos.addScaledVector(dir, .5); collide(M.pos, .3); }
      const d2 = M.pos.distanceTo(P.pos);
      if (S.hidden || (P.room.seguro && !fuga)) { M.state = 'procura'; M.searchT = 3; }
      else if (d2 < 1.6) {
        if (M.boteAgachou && P.noiseR === 0 && M.cacaT < 2.5 && !fuga) { M.state = 'procura'; M.searchT = 4; M.cool = 2.5; SX.arrastoAr(M.pos); toast('A mão dele passou por cima da sua cabeça.'); conquista('esquiva'); JP.porUmFio(); }
        else agarrar();
      } else if (d2 < 2.4) { M.state = 'caca'; M.cool = 1.2; arranhao(); planejar(M, P.pos.x, P.pos.z); }
      else { M.state = 'caca'; M.cool = .6; planejar(M, P.pos.x, P.pos.z); }
    }
  }
  else if (M.state === 'agarra') {
    AG.t += dt;
    if (S.dead) { MAOS.visible = false; P.bloqueado = AG.prev; M.state = 'procura'; $('#fx-red').style.transition = 'opacity 1.5s'; $('#fx-red').style.opacity = 0; }
    else {
      const head = MON.cabeca.getWorldPosition(_vInsA);
      const ty = Math.atan2(-(head.x - camera.position.x), -(head.z - camera.position.z)), tp = Math.atan2(head.y - camera.position.y, Math.hypot(head.x - camera.position.x, head.z - camera.position.z));
      let dy = ty - P.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); P.yaw += dy * Math.min(1, dt * 10); P.pitch = lerp(P.pitch, clamp(tp, -1.2, 1.2), Math.min(1, dt * 10));
      MAOS.position.set(rand(-.01, .01), Math.sin(AG.t * 30) * .01, -Math.min(.12, AG.t * .3)); P.shake = Math.max(P.shake, .05);
      if (AG.t >= AG.dur) { MAOS.visible = false; P.bloqueado = AG.prev; const solto = AG.sacode > 1400; if (!solto && !S.causaCtx) S.causaCtx = 'agarrao'; atacar('inspetor', solto); if (solto && !S.dead) toast('Você se soltou! Corre!'); }
    }
  }
  else if (M.state === 'fareja') {
    M.farejaT -= dt;
    if (!S.hidden || S.hidden !== M.alvoL) { M.state = 'procura'; M.searchT = 3; }
    else if (M.farejaT < 1.5 && !prendendo()) abrirEsconderijo();
    else if (M.farejaT <= 0) desistirDoEsconderijo();
  }
  else if (M.state === 'vasculha') {
    const t0 = M.vasculhaT; M.vasculhaT -= dt;
    for (const tb of [3.8, 3.2, 2.6]) if (t0 > tb && M.vasculhaT <= tb && S.hidden) { SX.batida(S.hidden.x, S.hidden.z, 1); tremer(S.hidden.g, .2, .05); P.shake = Math.max(P.shake, .04); }
    if (!S.hidden || S.hidden !== M.alvoL) { M.state = 'procura'; M.searchT = 3; M.achou = false; }
    else if (M.certo && M.vasculhaT < 2) abrirEsconderijo();
    else if (M.vasculhaT < 2.2 && !prendendo()) abrirEsconderijo();
    else if (M.vasculhaT <= 0) desistirDoEsconderijo();
  }
  if (M.chamadoT > 0) { M.chamadoT -= dt; if (M.chamadoT <= 0 && !S.hidden && M.state === 'investiga') iniciarAlerta(); }
  if (M.state === 'caca') M.cacaT += dt;
  // Movimento
  const aguaAqui = ra.agua && !S.flags.aguaBaixa;
  const base = { patrulha: 1.9, investiga: 3.0, procura: 1.6, caca: 4.6, conferir: M.conferir === 2 ? 3.2 : 2 }[M.state] || 1.8;
  const esc = 1 + Math.max(0, S.chapter - 2) * .083;
  const fugaVel = d > 9 ? 5.6 : d < 3 ? 4.2 : 4.9; // na fuga ele fica colado nas suas costas, sem ser impossível
  const speed = (fuga && M.state === 'caca' ? fugaVel : fuga ? 4.9 : base * esc) * D().vel * (aguaAqui ? .85 : 1);
  const parado = ['alerta', 'bote', 'agarra', 'escuta', 'emboscada', 'fareja', 'vasculha', 'reza'].includes(M.state);
  if (fuga && M.state === 'caca') { M.tropecoT -= dt; if (M.tropecoT <= 0 && d > 3) { M.tropecoT = rand(13, 17); M.wait = 2; M.caidoT = 2; SX.tropeco(M.pos); } }
  M.caidoT = Math.max(0, M.caidoT - dt);
  if (M.wait > 0) M.wait -= dt;
  else if (parado || (MP && MP.portaGraca())) { /* parado, ouvindo (ou segurado na porta que você acabou de abrir) */ }
  else if (M.path.length) {
    andar(M, dt, speed);
    M.stepT -= speed * dt;
    if (M.stepT <= 0) { M.stepT = 1.05; SFX.passoMonstro(M.pos, M.state === 'caca' ? 1 : .6, aguaAqui); }
    if (S.chapter === 3) { M.correnteT -= speed * dt; if (M.correnteT <= 0) { M.correnteT = .8; SX.corrente(M.pos); } }
  } else {
    if (M.acao) executarAcao();
    else if (M.state === 'caca' || M.state === 'investiga') { M.state = 'procura'; M.searchT = rand(5, 8); M.favCheck = false; falaInspetor(true); if (M.escutaCd <= 0) escutar(rand(2, 3.5)); }
    else if (M.state === 'conferir') {
      if (M.conferir === 1) { M.conferir = 2; M.wait = 4; const [x, z] = pontoEm(M.conferirSala); planejar(M, x, z); }
      else { M.conferir = 0; M.state = 'procura'; M.searchT = 4; SX.estalo(M.pos, 1.3, true); M.falaT = 0; falaInspetor(false, 'volta'); }
    }
    else if (M.state === 'procura') { if (!escolherAcaoProcura(ra)) { const [x, z] = pontoEm(ra); planejar(M, x, z); M.wait = rand(.8, 2); } }
    else { M.wait = rand(1.2, 3.5); patrulhar(); }
  }
  // A procura agora acaba de verdade (antes o tempo só corria na chegada de cada ponto)
  if (M.state === 'procura' && !M.acao) { M.searchT -= dt; if (M.searchT <= 0) fimProcura(ra); }
  // Assinatura sonora por estado: dá para saber o que ele está fazendo só de ouvir
  M.clickT -= dt; M.somT -= dt;
  const mudo = ['alerta', 'escuta', 'emboscada', 'fareja', 'vasculha', 'agarra', 'bote', 'reza'].includes(M.state) || (M.state === 'conferir' && M.wait > 0);
  if (M.state === 'emboscada' && M.emboscadaT < 1 && !M.emboscadaClique) { M.emboscadaClique = true; SX.estalo(M.pos, .9); }
  if (!mudo && M.clickT <= 0) { M.clickT = { caca: .45, procura: .55, investiga: 1 }[M.state] || 1.8; SX.estalo(M.pos, (M.state === 'caca' ? 1 : .6) * (M.recuo > 0 ? .35 : 1)); }
  if (!mudo && M.somT <= 0) {
    if (M.state === 'caca') { SX.respiraRasgada(M.pos); M.somT = .9; }
    else if (M.state === 'investiga') { SX.fungada(M.pos); M.somT = rand(1.2, 2); }
    else if (M.state === 'patrulha' && M.recuo <= 0) { SX.cantarola(M.pos); M.somT = rand(6, 10); }
    else M.somT = 1.5;
  }
  if (!S.dead && M.cool <= 0 && !S.hidden && !submersa && !(P.room.seguro && !fuga) && !['bote', 'agarra', 'fareja', 'vasculha', 'alerta'].includes(M.state) && d < (M.state === 'caca' ? 2.3 : 1.2) && !(MP && MP.portaGraca())) iniciarBote();
  if (!S.dead && M.cool <= 0 && S.hidden && M.achou && d < 2.4 && !['vasculha', 'agarra', 'fareja'].includes(M.state)) iniciarVasculha();
  if (!S.hidden || d > 4) { M.achou = false; M.certo = false; }
  // Corpo
  let gx = M.pos.x, gz = M.pos.z;
  if ((M.state === 'fareja' || M.state === 'vasculha') && M.alvoL) { const vx = M.alvoL.x - M.pos.x, vz = M.alvoL.z - M.pos.z, l = Math.hypot(vx, vz) || 1; gx += vx / l * .3; gz += vz / l * .3; }
  MON.g.position.set(gx, 0, gz); MON.g.rotation.y = M.yaw;
  const lean = M.caidoT > 0 ? .9 : M.state === 'caca' ? (S.chapter >= 5 ? .35 : .14) : (M.state === 'fareja' || M.state === 'vasculha') ? .32 : M.state === 'bote' ? -.12 : 0;
  MON.g.rotation.x = lerp(MON.g.rotation.x, lean, Math.min(1, dt * 6));
  const sw = Math.sin(M.anim), caca = M.state === 'caca' ? -.6 : 0;
  MON.legL.rotation.x = sw * .5; MON.legR.rotation.x = -sw * .5;
  const bracoAlto = M.state === 'bote' || M.state === 'agarra' ? -1.5 : M.state === 'vasculha' ? -.9 : null;
  if (bracoAlto !== null) { MON.armL.rotation.x = lerp(MON.armL.rotation.x, bracoAlto, Math.min(1, dt * 14)); MON.armR.rotation.x = lerp(MON.armR.rotation.x, bracoAlto, Math.min(1, dt * 14)); }
  else { MON.armL.rotation.x = -sw * .3 + caca; MON.armR.rotation.x = sw * .3 + caca; }
  MON.g.position.y = Math.abs(Math.cos(M.anim)) * .05 - (aguaAqui ? .3 : 0);
  // dedos se abrem quando ele escuta ou fareja
  const abre = M.state === 'escuta' || M.state === 'fareja' || M.state === 'emboscada';
  for (const mao of MON.maos) mao.children.forEach((f, i) => { f.rotation.z = lerp(f.rotation.z, abre ? (i - 1.5) * .35 : 0, Math.min(1, dt * 5)); });
  // cabeça
  let cz = .45 + Math.sin(perf * 7) * (M.state === 'procura' ? .25 : .03) + (Math.random() < .015 ? rand(-.5, .5) : 0), cy = M.state === 'procura' ? Math.sin(perf * 1.7) * .9 : 0, rapido = 6;
  if (M.state === 'escuta' || M.state === 'emboscada') cz = 1.15;
  if (M.state === 'fareja' || M.state === 'vasculha') cz = 1.0;
  if (M.olharT > 0 && M.olhar) { let a = Math.atan2(M.olhar.x - M.pos.x, M.olhar.z - M.pos.z) - M.yaw; a = Math.atan2(Math.sin(a), Math.cos(a)); cy = clamp(a, -1.5, 1.5); rapido = 22; }
  MON.cabeca.rotation.z = lerp(MON.cabeca.rotation.z, cz, Math.min(1, dt * rapido)); MON.cabeca.rotation.y = lerp(MON.cabeca.rotation.y, cy, Math.min(1, dt * rapido));
  MON.boca.scale.y = lerp(MON.boca.scale.y, ['caca', 'bote', 'agarra'].includes(M.state) ? 1.9 + Math.sin(perf * 20) * .2 : 1, Math.min(1, dt * 8));
  // a venda pega a luz da lanterna: a primeira coisa que se vê no escuro
  let brilho = 0;
  if (S.flashOn && !flashPisca && d < 14) { const head = MON.cabeca.getWorldPosition(_vInsA); const fw = camera.getWorldDirection(_vInsB); const dot = fw.dot(head.sub(camera.position).normalize()); brilho = clamp((dot - .9) / .1, 0, 1) * (1 - d / 14) * 1.4; }
  MON.faixa.emissiveIntensity = lerp(MON.faixa.emissiveIntensity, brilho, Math.min(1, dt * 10));
}

// --- A MENINA QUE CONTA
function modeloAna() {
  const g = new THREE.Group();
  const camisola = new THREE.MeshStandardMaterial({ color: 0xa8a294, roughness: 1 });
  const pele = new THREE.MeshStandardMaterial({ color: 0x9a948a, roughness: .7 });
  const cabelo = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: .9, side: THREE.DoubleSide });
  cyl(.12, .3, .85, camisola, 0, .45, 0, 10, g);
  cyl(.13, .12, .3, camisola, 0, 1.0, 0, 10, g);
  const cabG = new THREE.Group(); cabG.position.y = 1.27; g.add(cabG);
  const cab = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 10), pele); cabG.add(cab);
  const cab2 = new THREE.Mesh(new THREE.CylinderGeometry(.13, .19, .6, 12, 1, true), cabelo); cab2.position.y = -.15; cabG.add(cab2);
  box(.2, .32, .02, cabelo, 0, -.07, .12, cabG, false);
  const olhoMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.011, 6, 6), olhoMat); o.position.set(s * .036, .012, .134); cabG.add(o); }
  const bracos = [];
  for (const s of [-1, 1]) { const a = new THREE.Group(); a.position.set(s * .17, 1.05, 0); a.rotation.z = s * .1; g.add(a); cyl(.025, .02, .55, pele, 0, -.27, 0, 6, a); bracos.push(a); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData = { cabG, bracos, olhoMat };
  return g;
}
const ANA_G = modeloAna(); scene.add(ANA_G); ANA_G.visible = false;
const ANA = { pos: new THREE.Vector3(), ativa: false, path: [], yaw: 0, anim: 0, vida: 0, conta: 0, contaT: 0, vista: false, script: false, cool: 0,
  pose: 0, headY: 0, encaraT: 0, falhaT: 0, piscaCd: 0, olhoT: 0, passoAcc: 0, gizT: 0, giz: 0, gizGrupo: null, teto: false, tetoT: 0, escondT: 0, abrirT: 0, pegos: 0, portaAlvo: null, portaT: 0 };
// Poses: cada vez que ela sai da sua vista, volta diferente
const POSES_ANA = [
  { cx: 0, cy: 0, cz: 0, braco: 0, corpo: 0, y: 0 },
  { cx: 0, cy: 0, cz: 1.45, braco: 0, corpo: 0, y: 0 },      // cabeça deitada no ombro
  { cx: 0, cy: 0, cz: .2, braco: -1.5, corpo: 0, y: 0 },     // braços estendidos para você
  { cx: 0, cy: 2.7, cz: .15, braco: 0, corpo: Math.PI, y: 0 }, // de costas, olhando por cima do ombro
  { cx: .35, cy: 0, cz: .3, braco: -.5, corpo: 0, y: -.34 },  // ajoelhada
  { cx: .75, cy: 0, cz: 0, braco: 0, corpo: 0, y: 0 }          // cabeça baixa
];
function spawnAna(sala, script = false) {
  if (PROC.fase && !script) return false; // ameaças não se empilham
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
    ANA.pos.set(x, 0, z); ANA.ativa = true; ANA_G.visible = true; ANA.vida = script ? 24 : rand(28, 40); ANA.conta = 0; ANA.contaT = 1; ANA.script = script; ANA.path = []; ANA.cool = 1.5; ANA.graca = 0; ANA.toques = 0;
    ANA.pose = 0; ANA.headY = 0; ANA.encaraT = 0; ANA.falhaT = 0; ANA.escondT = 0; ANA.abrirT = 0; ANA.pegos = 0; ANA.portaAlvo = null; ANA.gizT = 0;
    ANA.teto = !script && !alvoSala.fora && Math.random() < .25; ANA.tetoT = 0; // às vezes ela espera grudada no teto
    SFX.risada(x, z); return true;
  }
  return false;
}
function anaAvancar(m) { // chega mais perto de uma vez, sem nunca encostar
  const v = new THREE.Vector3(P.pos.x - ANA.pos.x, 0, P.pos.z - ANA.pos.z), l = v.length();
  if (l < 1.6) return;
  const n = ANA.pos.clone().addScaledVector(v.normalize(), Math.min(m, l - 1.4)); collide(n, .25);
  if (roomAt(n.x, n.z) === roomAt(ANA.pos.x, ANA.pos.z) || salaAdj(roomAt(n.x, n.z), roomAt(ANA.pos.x, ANA.pos.z))) ANA.pos.copy(n);
}
// No DEZ ela aparece atrás de você, mas nunca dentro da parede nem do outro lado de uma porta
function anaAtras() {
  const fw = new THREE.Vector3(); camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
  const lado = new THREE.Vector3(-fw.z, 0, fw.x);
  const ofs = [[-2.2, 0], [-1.8, .9], [-1.8, -.9], [-1.5, 0], [0, 1.7], [0, -1.7]];
  for (const [f, s] of ofs) {
    const c = new THREE.Vector3(P.pos.x + fw.x * f + lado.x * s, 0, P.pos.z + fw.z * f + lado.z * s), c2 = c.clone(); collide(c2, .25);
    if (c2.distanceTo(c) > .15 || roomAt(c.x, c.z) !== P.room || !linhaLivre(P.pos, c)) continue;
    ANA.pos.copy(c); return true;
  }
  return false;
}
function portaParaAna() { // porta fechada entre ela e você: ela espera do outro lado
  const ra = roomAt(ANA.pos.x, ANA.pos.z), dr = distSalas(ra, P.room);
  for (const l of W.links) {
    if (!(l.a === ra.id || l.b === ra.id) || !l.door || l.door.open) continue;
    const outra = SALA(l.a === ra.id ? l.b : l.a); if (!outra || distSalas(outra, P.room) >= dr) continue;
    const c = centroSala(ra), v = new THREE.Vector3(c.x - l.x, 0, c.z - l.z).normalize();
    return { l, door: l.door, x: l.x + v.x * .75, z: l.z + v.z * .75 };
  }
  return null;
}
function updateAna(dt) {
  if (!ANA.ativa) return;
  ANA.vida -= dt; ANA.cool = Math.max(0, ANA.cool - dt); ANA.piscaCd = Math.max(0, ANA.piscaCd - dt);
  const d = ANA.pos.distanceTo(P.pos);
  if (ANA.falhaT > 0) { ANA.falhaT -= dt; flash.intensity = 0; flashFill.intensity = 0; }
  const luzLanterna = S.flashOn && !flashPisca && ANA.falhaT <= 0 && d < 16 && !VIS.vermelha(); // lote 4: a luz do papel vermelho não vale para ela
  const iluminada = luzLanterna || naLuz(ANA.pos);
  const naVista = !S.hidden && visivel(ANA.pos, ANA.teto ? 2.3 : 1.0, 18);
  const antes = ANA.vista;
  ANA.vista = naVista && iluminada;
  if (ANA.vista) S.flags.anaVista = true;
  if (ANA.vista && !antes) { let p = ANA.pose; for (let i = 0; i < 4 && p === ANA.pose; i++) p = Math.random() * POSES_ANA.length | 0; ANA.pose = p; }
  if (iluminada && naVista) ANA.olhoT = .5; else ANA.olhoT = Math.max(0, ANA.olhoT - dt);
  ANA_G.userData.olhoMat.color.setHex(ANA.olhoT > 0 ? 0xd6e6ff : 0x000000);
  if (ANA.vida <= 0) { despawnAna(); return; }
  // Encarar a menina cobra: gasta pilha, ela cantarola, e depois de muito tempo a lanterna falha
  if (ANA.vista && luzLanterna) { ANA.encaraT += dt; S.battery = Math.max(0, S.battery - .55 * 1.5 * D().pilha * dt); } else ANA.encaraT = 0;
  if (ANA.encaraT > 6 && !AMBX.hum) SX.anaHum(true, { x: ANA.pos.x, y: 1.2, z: ANA.pos.z });
  if (AMBX.hum && !ANA.vista) SX.anaHum(false);
  if (ANA.encaraT > 8 && !ML.anaOlhada()) { ANA.encaraT = 0; ANA.falhaT = .6; SFX.clique(); SX.anaHum(false); anaAvancar(2); ANA.pose = 5; }
  // Pilha fraca: cada piscada da lanterna deixa ela andar
  if (naVista && S.flashOn && flashPisca && S.battery < 18 && ANA.piscaCd <= 0 && !ANA.teto) { ANA.piscaCd = .45; anaAvancar(.8); ANA.pose = Math.random() * POSES_ANA.length | 0; }
  const ra = roomAt(ANA.pos.x, ANA.pos.z), aguaAqui = ra.agua && !S.flags.aguaBaixa;
  const antesPos = _vAnaA.copy(ANA.pos);
  if (ANA.teto) { // presa no teto: só desce quando você não está olhando
    if (!ANA.vista) ANA.tetoT += dt;
    if (!ANA.vista && (ANA.tetoT > 4 || Math.hypot(ANA.pos.x - P.pos.x, ANA.pos.z - P.pos.z) < 3)) { ANA.teto = false; SFX.pancada(ANA.pos.x, ANA.pos.z); ANA.conta = Math.max(ANA.conta, 4); }
  } else if (S.hidden && !ANA.script) { // escondida? ela vem até a porta e conta baixinho do lado de fora
    const L = S.hidden, [fx, fz] = frenteDe(L, 1.1);
    ANA.escondT += dt;
    if (!ANA.path.length || Math.random() < dt) planejar(ANA, fx, fz, { evitaFechadas: true });
    andar(ANA, dt, 1.6 * D().vel, false);
    if (ANA.escondT > 12 && M.ansiedade < .5) ANA.vida = Math.min(ANA.vida, 1.5); // calma de verdade: ela cansa e vai embora
    if (ANA.abrirT > 0) { ANA.abrirT -= dt; if (ANA.abrirT <= 0 && S.hidden) { S.causaCtx = 'ana_armario'; SX.armarioBate(S.hidden); sairEsconderijo(true); atacar('ana', true); despawnAna(true); return; } }
    else {
      ANA.contaT -= dt;
      if (ANA.contaT <= 0) {
        ANA.contaT = 1.9 * (ajudaCap() ? 1.2 : 1);
        SFX.contagem(ANA.pos, Math.min(9, ANA.conta)); if (ANA.conta >= 7) subPequeno('ana', R.entidades.ana.contagem[Math.min(9, ANA.conta)]);
        ANA.conta++; if (MP) MP.conta(ANA.conta - 1, d);
        if (ANA.conta >= 10) {
          ANA.conta = 0;
          if (S.flashOn && Math.hypot(ANA.pos.x - L.x, ANA.pos.z - L.z) < 2.2) { SFX.risada(ANA.pos.x, ANA.pos.z); subPequeno('ana', 'Tá claro aí dentro... não vale.'); ANA.vida -= 10; anaRecuar(2.2); }
          else if (Math.hypot(ANA.pos.x - L.x, ANA.pos.z - L.z) < 2.2) { for (let i = 0; i < 3; i++) setTimeout(() => SX.batida(L.x, L.z, .6), i * 380); tremer(L.g, 1.1, .03); ANA.abrirT = 1.4; }
        }
      }
    }
  } else if (!ANA.vista) {
    const pertoEscuro = naVista && d < 2.2; // perto e no escuro: ela não para, se arrasta devagar
    if (!ANA.path.length || Math.random() < dt * 2) {
      const ok = planejar(ANA, P.pos.x, P.pos.z, { evitaFechadas: true });
      ANA.portaAlvo = ok ? null : portaParaAna();
      if (ANA.portaAlvo) planejar(ANA, ANA.portaAlvo.x, ANA.portaAlvo.z);
    }
    andar(ANA, dt, (pertoEscuro ? .6 : 3.4) * D().vel, false);
    const naPorta = ANA.portaAlvo && Math.hypot(ANA.pos.x - ANA.portaAlvo.x, ANA.pos.z - ANA.portaAlvo.z) < .9 && !ANA.portaAlvo.door.open;
    if (naPorta) { ANA.portaT -= dt; if (ANA.portaT <= 0) { ANA.portaT = rand(.25, .6); ANA.portaAlvo.door.ang += rand(-.04, .04); if (Math.random() < .3) SX.macaneta(ANA.portaAlvo.door.x, ANA.portaAlvo.door.z); } }
    ANA.contaT -= dt;
    if (ANA.contaT <= 0) {
      // ela conta mais rápido quando está perto, quando você corre e quando a sua luz está fraca ou apagada
      let iv = lerp(.55, 1.4, clamp((d - 4) / 8, 0, 1));
      iv *= P.sprinting ? .6 : P.crouch ? 1.3 : 1;
      iv *= !S.flashOn ? .8 : S.battery < 18 ? .85 : 1;
      if (naPorta) iv = .6;
      if (ajudaCap()) iv *= 1.2;
      ANA.contaT = clamp(iv, .45, 1.6);
      const n = Math.min(9, ANA.conta), c = R.entidades.ana.contagem[n];
      let vozPos = ANA.pos;
      if (n >= 7 && d < 10) { const fw = new THREE.Vector3(); camera.getWorldDirection(fw); vozPos = { x: P.pos.x - fw.x * .6, z: P.pos.z - fw.z * .6 }; } // oito e nove: atrás da sua cabeça
      if (n === 7) abafarDrone(2.5);
      SFX.contagem(vozPos, n); if (ANA.conta % 3 === 0 || ANA.conta >= 7) subPequeno('ana', c);
      if (n >= 7 && d < 10) SFX.contagem(vozPos, n); // mais alto e mais perto nos últimos números
      ANA.conta++; if (MP) MP.conta(n, d); // a contagem também na mão (controle e celular)
      if (ANA.conta === 9 && d < 10 && !naPorta) SUST.nove(); // o nove: respiração atrás e um vulto azul no canto do olho
      if (ANA.conta >= 10) {
        if (naPorta) { // porta entre vocês: no DEZ a maçaneta gira e a porta abre uma fresta; da segunda vez, abre
          const dr = ANA.portaAlvo.door; ANA.conta = 4;
          if (!dr.fresta) { dr.fresta = true; dr.target = -.22; SFX.rangido(dr.x, 1.2, dr.z, .8); subPequeno('ana', 'Tô vendo você pela fresta...'); if (MP) MP.fresta(dr); }
          else { dr.fresta = false; setDoor(dr, true); ANA.portaAlvo = null; }
        } else if (d < 10) {
          if (anaAtras()) { ANA.conta = 0; ANA.cool = S.dif === 'pesadelo' ? .6 : S.dif === 'facil' ? 1.1 : .8; SFX.susto(); SX.respiracaoNuca(); P.shake = Math.max(P.shake, .06); ANA.pose = Math.random() * POSES_ANA.length | 0; if (MP) MP.dez(true); }
          else { ANA.conta = 5; SUST.dez(); if (MP) MP.dez(false); } // sem lugar logo atrás: o DEZ de src/sustos.js (atrás em outro ponto da sala, silêncio longo ou a voz grave); se falhar, recomeça do cinco
        } else ANA.conta = 6; // longe demais: chega mais perto e recomeça do seis
      }
    }
    // passinhos descalços e, de vez em quando, um desenho de giz onde ela passou
    ANA.passoAcc += ANA.pos.distanceTo(antesPos);
    if (ANA.passoAcc > .32) { ANA.passoAcc = 0; SX.pesDescalcos(ANA.pos, aguaAqui); }
    if (ANA.gizGrupo !== W.grupo) { ANA.gizGrupo = W.grupo; ANA.giz = 0; }
    ANA.gizT += dt;
    if (ANA.gizT > 7 && ANA.giz < 8 && !ra.fora && !aguaAqui) { ANA.gizT = 0; ANA.giz++; decal(MAT_GIZ, ANA.pos.x + rand(-.3, .3), ANA.pos.z + rand(-.3, .3), .7, .7, rand(0, 6.28)); }
  }
  ANA_G.position.copy(ANA.pos);
  if (!ANA.vista) ANA.yaw = Math.atan2(P.pos.x - ANA.pos.x, P.pos.z - ANA.pos.z);
  const pose = POSES_ANA[ANA.pose] || POSES_ANA[0], U = ANA_G.userData;
  // a cabeça continua seguindo você mesmo com o corpo parado, até girar demais
  if (ANA.vista) { let a = Math.atan2(P.pos.x - ANA.pos.x, P.pos.z - ANA.pos.z) - (ANA.yaw + pose.corpo) - pose.cy; a = Math.atan2(Math.sin(a), Math.cos(a)); ANA.headY += clamp(clamp(a, -2.8, 2.8) - ANA.headY, -.4 * dt, .4 * dt); }
  else ANA.headY = lerp(ANA.headY, 0, Math.min(1, dt * 3));
  const tilt = ANA.encaraT > 6 ? Math.min(.9, (ANA.encaraT - 6) * .35) : 0;
  U.cabG.rotation.set(pose.cx, pose.cy + ANA.headY, pose.cz + tilt);
  for (const b of U.bracos) b.rotation.x = pose.braco;
  if (ANA.teto) { ANA_G.rotation.set(Math.PI, ANA.yaw, 0); ANA_G.position.y = 3.05; }
  else { ANA_G.rotation.set(0, ANA.yaw + pose.corpo, 0); ANA_G.position.y = (aguaAqui ? -.2 : 0) + pose.y; }
  if (!S.dead && !S.hidden && d < .95 && ANA.cool <= 0 && !ANA.teto) {
    if (S.battery < 18 && S.inv.lanterna) S.causaCtx = 'pilha';
    if (ANA.script) { atacar('ana', true); const r = SALA(W.def.anaSalaScript) || P.room; const [x, z] = pontoEm(r, 1); ANA.pos.set(x, 0, z); ANA.pegos++; if (ANA.pegos <= 2) ANA.vida = Math.min(24, ANA.vida + 6); ANA.cool = 2; ANA.conta = 0; }
    else { atacar('ana'); despawnAna(true); }
  }
}
function anaRecuar(m) { const v = new THREE.Vector3(ANA.pos.x - P.pos.x, 0, ANA.pos.z - P.pos.z).normalize(); const n = ANA.pos.clone().addScaledVector(v, m); collide(n, .25); if (roomAt(n.x, n.z) === roomAt(ANA.pos.x, ANA.pos.z)) ANA.pos.copy(n); ANA.path = []; }
function despawnAna(silencioso) {
  if (!ANA.ativa) return;
  ANA.ativa = false; ANA_G.visible = false; ANA.teto = false; SX.anaHum(false);
  if (!silencioso) SFX.risada(ANA.pos.x, ANA.pos.z);
  const eraScript = ANA.script; ANA.script = false;
  if (eraScript && !silencioso && W.def.anaFim) W.def.anaFim();
}

// --- A PROCISSÃO
const PROC = { fase: null, t: 0, path: [], pos: new THREE.Vector3(), g: null, luz: null, filhos: [], chamas: [], abertas: [], fechar: [], pegadas: [], rastro: [], trilha: [], grupoRef: null, olhos: 0, pausa: 0, adiada: 0 };
(function () {
  const g = new THREE.Group();
  const chamaMat = new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false });
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Group();
    cyl(.1, .22, .9, MAT.sombra, 0, .45, 0, 8, s); const c = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), MAT.sombra); c.position.y = 1.05; s.add(c);
    const olho = new THREE.Mesh(new THREE.SphereGeometry(.015, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff3010 })); olho.position.set(-.04, 1.07, .11); s.add(olho); const o2 = olho.clone(); o2.position.x = .04; s.add(o2);
    cyl(.014, .014, .16, MAT.vela, .12, .74, .14, 6, s); // cada criança leva uma vela
    const ch = new THREE.Mesh(new THREE.SphereGeometry(.024, 6, 6), chamaMat); ch.scale.y = 1.8; ch.position.set(.12, .86, .14); s.add(ch); PROC.chamas.push(ch);
    s.position.set((i % 3 - 1) * .5, 0, Math.floor(i / 3) * .9 - .9); s.userData.f = Math.random() * 6; s.userData.base = s.position.clone(); g.add(s); PROC.filhos.push(s);
  }
  PROC.g = g; g.visible = false; scene.add(g);
  PROC.luz = new THREE.PointLight(0xff7a2a, 0, 9, 1.5); PROC.luz.position.y = 1.4; g.add(PROC.luz);
  // a criança que fica para trás depois que a fila passa
  const r = new THREE.Group(); cyl(.1, .22, .9, MAT.sombra, 0, .45, 0, 8, r); const rc = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), MAT.sombra); rc.position.y = 1.05; r.add(rc);
  r.visible = false; scene.add(r); PROC.retG = r;
})();
function iniciarProcissao() {
  if (PROC.fase || S.dead || !W.def.procissao || P.room.fora) return;
  if (ui || fitaTocando) { S.timers.procissao = 6; return; } // nunca começa com fita, nota ou diálogo aberto
  if (P.room.seguro) { S.timers.procissao = 8; return; }
  // ameaças não se empilham: com a Ana solta ou ele caçando perto, a Procissão espera
  if (ANA.ativa || (M.ativo && M.state === 'caca' && M.pos.distanceTo(P.pos) < 12)) { S.timers.procissao = 15; return; }
  if (SUST.procFalsa()) return; // às vezes é só o aviso: as luzes piscam e nada vem
  const salas = salasAlcancaveis(P.pos, { semFora: true });
  const longe3 = salas.filter(r => distSalas(r, P.room) >= 3), longe2 = salas.filter(r => distSalas(r, P.room) >= 2);
  PROC.ini = longe3.length ? pick(longe3) : longe2.length ? pick(longe2) : pick(salas.filter(r => r !== P.room)) || P.room;
  const aviso = D().aviso;
  PROC.fase = 'aviso'; PROC.t = aviso;
  // rota prevista: as lâmpadas do caminho piscam em vermelho e pegadas molhadas vão aparecendo
  const e = { pos: centroSala(PROC.ini), path: [] }; planejar(e, P.pos.x, P.pos.z);
  PROC.rota = new Set([PROC.ini.id]); for (const w of e.path) if (w.link) { PROC.rota.add(w.link.a); PROC.rota.add(w.link.b); }
  for (const L of W.lampadas) { L.corOrig = L.luz.color.getHex(); L.naRota = PROC.rota.has(roomAt(L.x, L.z).id); }
  PROC.previsto = []; let ant = e.pos.clone();
  for (const w of e.path) { const seg = w.distanceTo(ant), n = Math.floor(seg / 1.2); for (let k = 1; k <= n; k++) { const p = ant.clone().lerp(w, k / Math.max(1, n)); p.yaw = Math.atan2(w.x - ant.x, w.z - ant.z); PROC.previsto.push(p); } ant = w.clone(); }
  if (PROC.previsto.length > 2) PROC.previsto.length -= 2; // não marca o seu próprio lugar
  PROC.pegIdx = 0;
  // sempre dá tempo de chegar a um esconderijo
  const livre = W.lockers.reduce((m, L) => Math.min(m, Math.hypot(L.x - P.pos.x, L.z - P.pos.z)), 99) * 1.25;
  if (livre < 90 && livre / 2.8 > aviso) { PROC.t += Math.min(5, livre / 2.8 - aviso + 1); setTimeout(() => subPequeno('lia', 'Um armário, uma cama... qualquer coisa. Rápido!'), 1500); }
  SFX.estatica(PROC.t + 1); SFX.canto(PROC.t + 3); SX.passinhos(e.pos); SX.sussurroSilencio(e.pos, 1.4);
  PROC.cantoT = 2;
  if (!S.flags.procAviso) { S.flags.procAviso = true; falar('procissao_aviso'); }
  toast('As luzes estão piscando...');
  // sempre existe saída: o esconderijo livre mais perto range, e se ele estiver longe você ganha tempo
  let perto = null, dp = 1e9;
  for (const L of W.lockers) { const dd = Math.hypot(L.x - P.pos.x, L.z - P.pos.z); if (dd < dp) { dp = dd; perto = L; } }
  if (perto) { if (S.dif !== 'pesadelo') setTimeout(() => SFX.rangido(perto.x, 1, perto.z, .8), 900); if (dp > D().aviso * 2.4) PROC.t += Math.min(5, (dp - D().aviso * 2.4) / 3); }
}
function abafarCanto(dur) { if (!AC || !AMB.canto) return; const t = AC.currentTime, g = AMB.canto.g.gain; g.cancelScheduledValues(t); g.setValueAtTime(Math.max(.0002, g.value), t); g.exponentialRampToValueAtTime(.003, t + .3); g.setValueAtTime(.003, t + dur); g.exponentialRampToValueAtTime(.12, t + dur + .8); }
function posProcissao(dt) { // o que fica depois que ela passa: portas batendo, sussurros, pegadas, a criança para trás
  if (PROC.grupoRef !== W.grupo) { PROC.grupoRef = W.grupo; PROC.fechar = []; PROC.pegadas = []; PROC.rastro = []; PROC.retG.visible = false; PROC.ret = null; }
  for (let i = PROC.fechar.length - 1; i >= 0; i--) { const f = PROC.fechar[i]; f.t -= dt; if (f.t <= 0) { PROC.fechar.splice(i, 1); if (f.d.open && !PROC.fase) { setDoor(f.d, false, true); SFX.pancada(f.d.x, f.d.z); } } }
  for (let i = PROC.rastro.length - 1; i >= 0; i--) { const r = PROC.rastro[i]; r.t -= dt; if (r.t <= 0) { PROC.rastro.splice(i, 1); SX.sussurroSilencio(r.p, r.v); } }
  for (let i = PROC.pegadas.length - 1; i >= 0; i--) { const p = PROC.pegadas[i]; if (p.t === undefined) continue; p.t -= dt; p.m.material.opacity = clamp(p.t / 8, 0, .6); if (p.t <= 0) { W.grupo.remove(p.m); p.m.geometry.dispose(); p.m.material.dispose(); PROC.pegadas.splice(i, 1); } }
  const R2 = PROC.ret;
  if (R2) {
    R2.t -= dt; const dd = Math.hypot(P.pos.x - R2.x, P.pos.z - R2.z);
    if (S.flashOn && !flashPisca && visivel({ x: R2.x, z: R2.z }, 1, 14)) { PROC.retG.visible = false; PROC.ret = null; SFX.risada(R2.x, R2.z); SX.pesDescalcos({ x: R2.x, z: R2.z }); }
    else if (dd < 2 && !R2.falou) { R2.falou = true; SX.sussurroSilencio({ x: R2.x, z: R2.z }, .7); subPequeno('crianca', 'Você tá fora da cama.'); }
    else if (R2.t <= 0) { PROC.retG.visible = false; PROC.ret = null; }
  }
  PROC.olhos = Math.max(0, PROC.olhos - dt);
}
function updateProcissao(dt) {
  posProcissao(dt);
  updateFxMonstro();
  if (MP) MP.tick(dt); // Lote 3: corpo, legendas, vibração, sombra e replay das entidades (depois do Inspetor e da Ana neste quadro)
  if (!PROC.fase) return;
  PROC.t -= dt;
  if (PROC.fase === 'aviso') {
    // as lâmpadas da rota piscam em vermelho, em pulsos de 80 a 250 ms (com "reduzir flashes", sobem e descem devagar)
    for (const L of W.lampadas) {
      L.pT = (L.pT || 0) - dt;
      if (L.pT <= 0) { L.pT = OPT.vFlash ? .5 : rand(.08, .25); L.pOn = Math.random() < (L.naRota ? .45 : .1); }
      if (L.naRota) L.luz.color.setHex(0xff3010);
      const ai = L.pOn ? L.base * (L.naRota ? rand(.8, 1.6) : .35) : 0, ae = L.pOn ? (L.naRota ? 2.5 : .8) : 0;
      if (OPT.vFlash) { const k = Math.min(1, dt * 4); L.luz.intensity = lerp(L.luz.intensity, ai, k); L.bulbo.material.emissiveIntensity = lerp(L.bulbo.material.emissiveIntensity, ae, k); }
      else { L.luz.intensity = ai; L.bulbo.material.emissiveIntensity = ae; }
    }
    const tot = D().aviso, prog = clamp(1 - PROC.t / tot, 0, 1);
    while (PROC.previsto && PROC.pegIdx < PROC.previsto.length * prog) { const p = PROC.previsto[PROC.pegIdx++]; const tam = [.7, .85, 1, 1.15][PROC.pegIdx % 4]; PROC.pegadas.push({ m: decal(MAT_PEGADA, p.x + (PROC.pegIdx % 2 ? .12 : -.12) * tam, p.z, .2 * tam, .4 * tam, (p.yaw || 0) + Math.PI, .6) }); } // pés de crianças de vários tamanhos
    PROC.cantoT -= dt; if (PROC.cantoT <= 0) { PROC.cantoT = 2.4; SX.sussurroSilencio(centroSala(PROC.ini), 1.2); } // o canto já vem de onde eles vão sair
    P.shake = Math.max(P.shake, .012); SUST.procAviso(dt);
    if (PROC.t <= 0) {
      const ini = PROC.ini && W.salas.includes(PROC.ini) ? PROC.ini : P.room;
      const e1 = { pos: centroSala(ini), path: [] };
      planejar(e1, P.pos.x, P.pos.z);
      const salas = salasAlcancaveis(P.pos, { semFora: true }), longe = salas.filter(r => distSalas(r, P.room) >= 2);
      const outras = longe.filter(r => r !== ini);
      const fim = outras.length ? pick(outras) : ini;
      PROC.fim = fim;
      const e2 = { pos: P.pos.clone(), path: [] };
      planejar(e2, (fim.x0 + fim.x1) / 2, (fim.z0 + fim.z1) / 2);
      PROC.path = [...e1.path, ...e2.path];
      PROC.trilha = PROC.path.map(v => v.clone());
      PROC.abertas = []; PROC.atraida = false; PROC.parouAqui = false; PROC.pausou = false; PROC.pausa = 0;
      PROC.pausaIdx = Math.random() < .4 ? Math.floor(PROC.path.length * rand(.3, .6)) : -1; // às vezes param no meio do caminho
      PROC.pos.copy(e1.pos); PROC.fase = 'passando'; PROC.t = 16; PROC.g.visible = true; PROC.luz.intensity = 5;
      for (const s of PROC.filhos) { s.rotation.y = 0; s.position.copy(s.userData.base); }
      SFX.procissao();
    }
  } else {
    const ent = PROC.ent || (PROC.ent = { yaw: 0, anim: 0 });
    ent.pos = PROC.pos; ent.path = PROC.path;
    const dP = PROC.pos.distanceTo(P.pos);
    // escondida perto do caminho: uma vez por jogo, a fila para na frente do seu esconderijo
    if (S.hidden && dP < 2.6 && !S.flags.procParou && !PROC.parouAqui) { S.flags.procParou = true; PROC.parouAqui = true; PROC.pausa = 3; PROC.olhos = 3; abafarCanto(3); P.shake = .05; if (S.hidden.tipo === 'cama') { const s = PROC.filhos[4]; s.position.y = -.55; } }
    if (!PROC.pausou && PROC.pausaIdx >= 0 && PROC.path.length <= PROC.pausaIdx && PROC.pausa <= 0) { PROC.pausou = true; PROC.pausa = 3; abafarCanto(3); }
    if (PROC.pausa > 0) {
      PROC.pausa -= dt; PROC.t += dt;
      for (const s of PROC.filhos) { const w = s.getWorldPosition(_vProcA); const a = Math.atan2(P.pos.x - w.x, P.pos.z - w.z) - PROC.g.rotation.y; s.rotation.y = lerp(s.rotation.y, a, Math.min(1, dt * 4)); }
      if (PROC.pausa <= 0) for (const s of PROC.filhos) { s.rotation.y = 0; s.position.copy(s.userData.base); }
    } else {
      // as portas abrem uma a uma, com estrondo, na hora em que a fila chega
      const prox = PROC.path.find(v => v.link);
      if (prox && prox.link.door && !prox.link.door.open && !(prox.link.door.trava && prox.link.door.trava()) && prox.distanceTo(PROC.pos) < 2.6) { const dr = prox.link.door; setDoor(dr, true, true); SFX.pancada(dr.x, dr.z); PROC.abertas.push(dr); }
      for (let k = 0; k < 2; k++) andar(ent, dt / 2, 12, false);
    }
    // a luz chama a atenção deles, até vazando pela fresta do armário
    if (!PROC.atraida && S.flashOn && !flashPisca && dP < 7 && linhaLivre(PROC.pos, P.pos) && PROC.fim) {
      PROC.atraida = true;
      const a = { pos: PROC.pos.clone(), path: [] }; planejar(a, P.pos.x, P.pos.z);
      const b = { pos: P.pos.clone(), path: [] }; planejar(b, (PROC.fim.x0 + PROC.fim.x1) / 2, (PROC.fim.z0 + PROC.fim.z1) / 2);
      PROC.path = [...a.path, ...b.path]; PROC.t = Math.max(PROC.t, 8);
      if (!S.flags.procLuz) { S.flags.procLuz = true; setTimeout(() => subPequeno('lia', 'A luz... eles viram a luz.'), 600); }
    }
    PROC.g.position.copy(PROC.pos); PROC.g.rotation.y = ent.yaw;
    PROC.g.children.forEach(s => { if (s.isGroup && PROC.pausa <= 0) s.position.y = Math.abs(Math.sin(perf * 14 + s.userData.f)) * .1; });
    for (const c of PROC.chamas) { c.scale.set(rand(.8, 1.2), rand(1.5, 2.2), 1); }
    PROC.luz.intensity = rand(3.6, 5.6); PROC.luz.color.setHex(Math.random() < .5 ? 0xff7a2a : 0xff6420);
    SFX.procissaoPos(PROC.pos);
    const luzVaza = S.hidden && S.flashOn && !flashPisca;
    if (dP < 2.2 && (!S.hidden || luzVaza) && !S.dead && !PROC.acertou) { PROC.acertou = true; if (luzVaza) { S.causaCtx = 'proc_luz'; sairEsconderijo(true); } atacar('procissao'); }
    if (!PROC.path.length || PROC.t <= 0) acabarProcissao();
  }
}
function acabarProcissao() {
  PROC.fase = null; PROC.ini = null; PROC.g.visible = false; PROC.luz.intensity = 0; PROC.acertou = false; PROC.pausa = 0; SFX.pararCanto();
  for (const L of W.lampadas) if (L.corOrig !== undefined) { L.luz.color.setHex(L.corOrig); L.naRota = false; }
  syncLuzes();
  // as portas que ela abriu batem de volta, da mais perto para a mais longe
  PROC.fechar = PROC.abertas.sort((a, b) => Math.hypot(a.x - P.pos.x, a.z - P.pos.z) - Math.hypot(b.x - P.pos.x, b.z - P.pos.z)).map((d, i) => ({ d, t: 2 + i * .8 }));
  PROC.abertas = [];
  // sussurros que vão sumindo pelo caminho e pegadas que secam em 30 s
  const tr = PROC.trilha || [];
  if (tr.length) PROC.rastro = [.3, .6, .9].map((f, i) => ({ p: tr[Math.min(tr.length - 1, Math.floor(tr.length * f))], t: 1.5 + i * 1.6, v: 1 - i * .3 }));
  for (const p of PROC.pegadas) if (p.t === undefined) p.t = 30;
  // uma das crianças fica para trás, de costas
  if (tr.length > 3 && !S.dead && Math.random() < .6) {
    const p = tr[Math.floor(tr.length * rand(.55, .85))];
    if (p && roomAt(p.x, p.z) !== P.room) { PROC.ret = { x: p.x, z: p.z, t: 20 }; PROC.retG.position.set(p.x, 0, p.z); PROC.retG.rotation.y = Math.atan2(p.x - P.pos.x, p.z - P.pos.z); PROC.retG.visible = true; }
  }
  if (!S.dead && !S.done.procissao && R.capitulos[S.chapter].objetivos.some(o => o.id === 'procissao')) { objDone('procissao'); falar('procissao_passou'); conquista('procissao'); }
  S.timers.procissao = rand(100, 160) * D().intervalo;
}

// --- Sustos de ambiente (o diretor de sustos): ele está longe, mas você não sabe
const VUL = { ativo: false, t: 0, cd: 30, cimaT: 40, unhaT: 50, fitaPos: null, fitaT: 0 };
function sustosAmbiente(dt) {
  const longe = !M.ativo || M.pos.distanceTo(P.pos) > 18;
  if (P.room.fora) VUL.cd = Math.max(VUL.cd, 5);
  VUL.cd -= dt; VUL.cimaT -= dt; VUL.unhaT -= dt;
  if (W.mapa === 'terreo' && longe && VUL.cimaT <= 0) { VUL.cimaT = rand(35, 60); SX.passoCima(P.pos); }
  if (longe && !P.room.fora && S.fear > 25 && VUL.unhaT <= 0) {
    VUL.unhaT = rand(45, 80); const r = P.room;
    const op = [[r.x0, P.pos.z], [r.x1, P.pos.z], [P.pos.x, r.z0], [P.pos.x, r.z1]].sort((a, b) => Math.hypot(a[0] - P.pos.x, a[1] - P.pos.z) - Math.hypot(b[0] - P.pos.x, b[1] - P.pos.z))[0];
    SX.unhas({ x: op[0], z: op[1] });
  }
  // o vulto dele parado no fundo do corredor, que some quando a luz encosta
  if (!VUL.ativo && VUL.cd <= 0 && S.fear > 50 && longe && !P.room.fora && !S.hidden && Math.random() < dt * .08) {
    const fw = new THREE.Vector3(); camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
    const ang = (Math.random() < .5 ? 1 : -1) * .75, dir = fw.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
    for (const dist of [12, 10, 8]) {
      const p = P.pos.clone().addScaledVector(dir, dist), r = roomAt(p.x, p.z);
      if (r.fora || !linhaLivre(P.pos, p, 1.5)) continue;
      VULTO.g.position.set(p.x, 0, p.z); VULTO.g.rotation.y = Math.atan2(P.pos.x - p.x, P.pos.z - p.z); VULTO.g.visible = true; VUL.ativo = true; VUL.t = 6; VUL.cd = rand(45, 75); break;
    }
    if (!VUL.ativo) VUL.cd = 8;
  }
  if (VUL.ativo) {
    VUL.t -= dt; const vp = VULTO.g.position;
    if (S.flashOn && !flashPisca && visivel(vp, 2.2, 20)) { VULTO.g.visible = false; VUL.ativo = false; SX.estalo(vp, 1); S.fear = Math.min(100, S.fear + 15); }
    else if (VUL.t <= 0 || Math.hypot(vp.x - P.pos.x, vp.z - P.pos.z) < 5 || P.room.fora) { VULTO.g.visible = false; VUL.ativo = false; }
  }
  if (VULTO.g.visible && VULTO.mapa !== W.mapa) { VULTO.mapa = W.mapa; VULTO.g.visible = false; VUL.ativo = false; }
  VULTO.mapa = W.mapa;
  // a fita tocando vira isca: o gravador faz barulho enquanto toca
  if (fitaTocando) { if (!VUL.fitaPos) { VUL.fitaPos = P.pos.clone(); VUL.fitaT = 2; } VUL.fitaT -= dt; if (VUL.fitaT <= 0) { VUL.fitaT = 2; emitNoise(VUL.fitaPos.x, VUL.fitaPos.z, 3); } }
  else VUL.fitaPos = null;
}

// --- Ataque e morte
const DANO = { inspetor: 60, ana: 55, procissao: 90 };
function atacar(quem, leve) {
  if (S.dead) return;
  if (ui === 'teclado') fecharTeclado(); else if (ui === 'nota') fecharNota(); else if (ui === 'diario') fecharDiario();
  S.causaCtx = S.causaCtx || causaContexto(quem); P.curaT = 0; P.mirarG = 0; teste = null;
  if (quem === 'inspetor') { M.cool = 7; M.state = 'procura'; M.searchT = 3; M.path = []; M.wait = 2.5; M.recuo = 15; M.acao = null; M.achou = false; M.certo = false; M.bote = null; }
  UIX.golpe(quem); SUST.golpe(quem); JP.golpe(quem); // hit-stop e som abafado (src/sustos-plataforma.js, src/jogabilidade-polimento.js)
  SFX.grito(quem); P.shake = .25;
  $('#fx-red').style.transition = 'none'; $('#fx-red').style.opacity = OPT.vFlash ? .45 : 1;
  setTimeout(() => { $('#fx-red').style.transition = 'opacity 2.5s'; $('#fx-red').style.opacity = 0; }, 80);
  // no Pesadelo cada entidade tem o seu dano (correndo, o golpe dele mata); a brincadeira da Ana e escapar do agarrão nunca matam
  const mult = (D().danoPor && D().danoPor[quem]) || D().dano;
  let dano = Math.min(100, DANO[quem] * mult * (leve ? .6 : 1) * (quem === 'inspetor' && D().danoPor && P.sprinting ? 1.3 : 1));
  if (leve) dano = Math.min(dano, S.health * .7);
  S.health -= dano; S.capDano += dano; S.fear = 100; PG.dano(quem);
  if (S.health <= 0) { morrer(quem); return; }
  S.causaCtx = null;
  toast(quem === 'inspetor' ? 'Ele te largou. Fuja e se esconda.' : quem === 'ana' ? 'Mãos geladas. Ela sumiu... por enquanto.' : 'Eles passaram por dentro de você. Ainda está viva. Por pouco.');
  if (quem === 'inspetor') { const dx = P.pos.x - M.pos.x, dz = P.pos.z - M.pos.z, l = Math.hypot(dx, dz) || 1; P.pos.x += dx / l * 1.2; P.pos.z += dz / l * 1.2; collide(P.pos, .33); }
}
function morrer(quem) {
  S.dead = true; S.mortes++; S.causa = quem; SUST.morte(quem); PG.morte(quem); PLAT.aoMorrer(quem); if (MP) MP.morte(quem); JP.aoMorrer(mortesNoPonto + 1); mortesNoPonto++; saveDevido = 0;
  const rapido = mortesNoPonto >= 2;
  if (mortesCap.cap !== S.chapter) { mortesCap.cap = S.chapter; mortesCap.n = 0; } mortesCap.n++;
  const ctx = S.causaCtx; S.causaCtx = null;
  if (M.state === 'agarra') { MAOS.visible = false; P.bloqueado = AG.prev; }
  SX.anaHum(false); FXM.style.opacity = 0; fxmAtual = '';
  const head = new THREE.Vector3();
  if (quem === 'inspetor') MON.cabeca.getWorldPosition(head); else if (quem === 'ana') head.set(ANA.pos.x, 1.2, ANA.pos.z); else head.copy(PROC.pos).setY(1);
  const t0 = performance.now(), yaw0 = P.yaw, pitch0 = P.pitch;
  const ty = Math.atan2(-(head.x - camera.position.x), -(head.z - camera.position.z));
  const tp = Math.atan2(head.y - camera.position.y, Math.hypot(head.x - camera.position.x, head.z - camera.position.z));
  (function anim() { const k = Math.min(1, (performance.now() - t0) / 400); let dy = ty - yaw0; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); camera.rotation.set(lerp(pitch0, tp, k), yaw0 + dy * k, rand(-.03, .03)); if (k < 1 && S.dead) requestAnimationFrame(anim); })();
  VIS.morte(quem);
  setTimeout(() => {
    $('#fx-black').style.opacity = 1;
    setTimeout(() => {
      unlock(); ui = 'morte'; $('#death').hidden = false; $('#hud').hidden = true; SFX.pararCanto(); SFX.chiadoFita(false); fitaTocando = null; $('#fita-ind').hidden = true;
      const MT = (R.mortes && R.mortes[quem]) || {};
      $('#dt-tit').textContent = MT.titulos ? pick(MT.titulos) : quem === 'inspetor' ? 'ELE TE ENCONTROU' : quem === 'ana' ? 'ELA CONTOU ATÉ DEZ' : 'FORA DA CAMA';
      $('#death-frase').textContent = ML.fraseMorte(quem) || (MT.frases ? pick(MT.frases) : '');
      UIX.morte(quem); // o que aconteceu, mini-mapa, mortes no capítulo
      dicaMorte(quem, ctx); // dica pela causa exata, quando houver
      PG.telaMorte(quem); // contagem, objetivos que faltavam, penalidade e o modo Uma Vida
      $('#dt-diag').hidden = true; $('#death-info').hidden = true; // a causa e a contagem já aparecem acima
      $('#death-conta').textContent = [S.mortes > 1 && R.mortes ? R.mortes.voltou.replace('{n}', S.mortes - 1) : '', S.dif === 'pesadelo' && R.mortes ? R.mortes.pesadelo : ''].filter(Boolean).join(' · ');
    }, rapido ? 500 : 700);
  }, (rapido ? 700 : 950) + SUST.atrasoMorte(rapido)); // a lanterna cai e rola antes do corte (src/sustos-plataforma.js)
}

// =====================================================================
// HISTÓRIA / OBJETIVOS
// =====================================================================
function objDone(id) { if (S.done[id]) return; S.done[id] = true; SFX.objetivo(); UIX.objetivo(id); renderObj(); agendarSave(id); PG.objetivo(id); checarCapitulo(); }
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
  marcosParciais();
  renderObj();
}
let trocandoCap = false;
function checarCapitulo() {
  const c = R.capitulos[S.chapter];
  if (!c.objetivos.every(o => S.done[o.id]) || trocandoCap) return;
  if (S.chapter >= R.capitulos.length - 1) return;
  trocandoCap = true;
  // o fim do capítulo é seguro: ele recua e a Ana some
  M.recuo = Math.max(M.recuo, 10); if (ANA.ativa && !ANA.script) despawnAna(true);
  clearTimeout(capTO); capTO = setTimeout(() => fimDeCapitulo(), 1800);
}
let capTO = null;
function rank() { return PG.rank(); } // metas por capítulo, selos e bônus: src/progressao.js
function fimDeCapitulo() {
  if (S.dead) { trocandoCap = false; return; }
  const c = R.capitulos[S.chapter];
  if (S.capDano === 0 && S.chapter > 0) conquista('intocada');
  if (!S.capCorreu && S.chapter > 0) conquista('gato');
  if (S.chapter === 0) conquista('prologo');
  if (S.chapter === 3 && !S.flags.tocada_ana_3) conquista('nao_pisquei');
  if (S.chapter === 1 && S.capLuzT < 60) conquista('olhos_gato');
  if (S.chapter === 1 && S.capT < 360 && S.capDano === 0) conquista('pressa');
  $('#fc-cap').textContent = c.titulo + ' — concluído';
  const rk = rank(), ant = { ...(lsGet(CAPS_KEY, {})[c.id] || {}) }; // recorde anterior (a progressão grava o novo)
  const recado = H.fimCapitulo(S, rk);
  $('#fimcap').hidden = false;
  $('#fc-recado').textContent = recado ? `Gravador da Lia: ${recado}` : '';
  if (!ui) ui = 'fimcap'; // o mundo congela atrás do cartão
  UIX.fimCap(c, rk, ant); // gancho datilografado, cor do rank, 'E para seguir'
  PG.fimCap(c); $('#fc-crit').innerHTML = ''; // rank carimbado, selos, boletim, recorde e o que faltou para o S
  SFX.sinoLonge(); SUST.fimCap();
  let seguiu = false;
  const seguir = () => {
    if (seguiu) return; seguiu = true; clearTimeout(seguirTO); pularFimCap = () => {};
    $('#fimcap').hidden = true;
    if (ui === 'fimcap') ui = null;
    if (S.dead) { trocandoCap = false; return; }
    S.chapter++; S.capT = 0; S.capDano = 0; S.capVisto = 0; S.capCorreu = false; PG.zerarCap(); trocandoCap = false;
    cartaoCapitulo();
    if (W.def.inicioCapitulo) W.def.inicioCapitulo(S.chapter);
    VM.capitulo(S.chapter);
    if (W.def.inspetor && W.def.inspetor() && !M.ativo) { const t = { ...S.timers }; agendarEntidades(); Object.assign(S.timers, t); }
    syncWorld(); renderObj(); progresso();
    salvarCheckpoint(true);
  };
  pularFimCap = seguir;
  const seguirTO = capTO = setTimeout(seguir, 6400); // morrer ou reiniciar cancela (clearTimeout(capTO))
}
let pularFimCap = () => {};

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
  prepararJogador();
  if (def.entrar) def.entrar(S.chapter);
  JM.mapa(id); // lote 2: marcas, rádio, sineta, vitrola, velas... (src/jogabilidade-mundo.js)
  if (salvar) salvarCheckpoint();
  renderObj(); renderInvMini();
  SUST.novoMapa(id);
  ML.novoMapa(id);
  VIS.mapa(); VM.mapa();
}
function syncLuzes() {
  const ligada = W.def && W.def.energia ? W.def.energia() : false;
  for (const L of W.lampadas) { const on = (L.sempre || ligada) && !L.estourada; L.ligada = on; L.luz.intensity = on ? L.base : 0; L.bulbo.material.emissiveIntensity = on ? 2 : 0; }
}
function syncWorld() {
  for (const it of W.items) it.mesh.visible = !S.picked[it.key] && (!it.cond || it.cond());
  syncLuzes();
  if (W.def && W.def.sync) W.def.sync();
}
function salvarCheckpoint(inicioCap) {
  PG.salvando(inicioCap);
  S.pos = [P.pos.x, P.pos.z]; S.yaw = P.yaw; S.mapa = W.mapa;
  const snap = JSON.parse(JSON.stringify({ ...S, hidden: null, dead: false, fim: false, _check: undefined }));
  S._check = snap; mortesNoPonto = 0; saveDevido = 0;
  lsSet(SAVE_KEY, snap);
  UIX.salvou(inicioCap);
  if (inicioCap) { const caps = lsGet(CAPS_KEY, {}); const c = R.capitulos[S.chapter]; caps[c.id] = { ...(caps[c.id] || {}), snap }; lsSet(CAPS_KEY, caps); }
}
function carregarSnap(snap) {
  const mortes = S ? S.mortes : 0, tempo = S ? S.tempo : 0, antes = PG.antesCarregar();
  S = JSON.parse(JSON.stringify(snap)); S._check = snap;
  S.chapter = Math.max(0, Math.min(R.capitulos.length - 1, S.chapter | 0));
  S.mortes = Math.max(mortes, S.mortes || 0); S.tempo = Math.max(tempo, S.tempo || 0);
  S.health = Math.max(S.health, 60); S.fear = 0; S.stamina = 100; S.ar = 100; S.dead = false; S.fim = false; S.hidden = null;
  clearTimeout(capTO); $('#fimcap').hidden = true; if (ui === 'fimcap') ui = null; fitaPausada = false;
  PG.depoisCarregar(antes);
  trocandoCap = false; fitaTocando = null; $('#fita-ind').hidden = true; SFX.chiadoFita(false); subQ = []; subT = 0; $('#sub').innerHTML = '';
  chamadoArmadilha = null; if (AMB.tensao) AMB.tensao.gain.value = 0; PLAT.aoCarregar();
  carregarMapa(S.mapa, { x: S.pos[0], z: S.pos[1], yaw: S.yaw }, { salvar: false });
  // o mapa já agendou as entidades ao entrar: não empurrar a Procissão do Cap. II (25 s) para depois de 70-120 s
  const tm = { ...S.timers };
  agendarEntidades();
  for (const k of ['procissao', 'ana', 'chamado']) if (tm[k] < S.timers[k] && tm[k] < 40) S.timers[k] = tm[k];
  afastarInspetor(); congelarT = .6; progAnt = -1; marcosParciais();
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
// Orquestrador: uma ameaça grande por vez, para o medo ter pico e respiro
function ameacaAtiva() { return !!(PROC.fase || ANA.ativa || chamadoArmadilha || (M.ativo && ["caca", "alerta", "bote", "agarra"].includes(M.state))); }
function updateEventos(dt) {
  const TT = S.timers;
  sustosAmbiente(dt);
  if (W.def.procissao && W.def.procissao() && !PROC.fase) { TT.procissao -= dt; if (TT.procissao <= 0) { if (P.room.fora) TT.procissao = 10; else if (ameacaAtiva() && PROC.adiada < 2) { PROC.adiada++; TT.procissao = 12; } else { PROC.adiada = 0; iniciarProcissao(); } } }
  if (W.def.ana && W.def.ana() && !ANA.ativa) { TT.ana -= dt; if (TT.ana <= 0) { if (ameacaAtiva()) TT.ana = 10; else if (!spawnAna()) TT.ana = 8; else TT.ana = rand(60, 110) * D().intervalo; } }
  if (W.def.chamado && W.def.chamado()) { TT.chamado -= dt; if (TT.chamado <= 0) { if (ameacaAtiva()) TT.chamado = 15; else { TT.chamado = rand(120, 200) * D().intervalo; chamado(); } } }
  if (chamadoArmadilha) {
    chamadoArmadilha.t -= dt;
    if (chamadoArmadilha.t <= 0) { chamadoExpirou(chamadoArmadilha.sala); chamadoArmadilha = null; PG.chamado(false); }
    else if (P.room === chamadoArmadilha.sala) { const s = chamadoArmadilha.sala; chamadoArmadilha = null; chamadoEm = perf; H.respondeu(); PG.chamado(true); chamadoBote(s); }
  }
  SUST.update(dt);
  for (const f of W.tick) f(dt);
}
// Caiu na armadilha: a porta bate, a voz vira a dele e ele vem da sala vizinha (com 2 s para você reagir)
function chamadoBote(s) {
  const c = centroSala(s); SFX.pancada(c.x, c.z); sub("inspetor", "Achei."); SFX.voz(c);
  if (!M.ativo) return;
  const viz = W.links.filter(l => (l.a === s.id || l.b === s.id) && !(l.door && l.door.trava && l.door.trava())).map(l => SALA(l.a === s.id ? l.b : l.a)).filter(r => r && !r.seguro && (!r.fora || W.def.inspetorFora));
  let best = null, bd = -1;
  for (const r of viz) { const [x, z] = pontoEm(r, 1); const dd = Math.hypot(x - P.pos.x, z - P.pos.z); if (dd > bd) { bd = dd; best = [x, z]; } }
  if (best && bd >= 5) M.pos.set(best[0], 0, best[1]);
  M.state = "investiga"; M.acao = null; M.path = []; planejar(M, P.pos.x, P.pos.z); M.cool = 2; M.chamadoT = 2; M.ultimo = P.pos.clone(); M.wait = 0;
  SFX.passoMonstro(M.pos, 1); setTimeout(() => SFX.passoMonstro(M.pos, 1), 450); SUST.armadilha(); if (MP) MP.armadilha();
}
// Respeitou a regra cinco: ele bate na porta daquela sala, do outro lado, e sussurra
function chamadoExpirou(s) {
  const l = W.links.find(l => (l.a === s.id || l.b === s.id) && l.door) || W.links.find(l => l.a === s.id || l.b === s.id);
  const p = l ? { x: l.x, z: l.z } : centroSala(s);
  SX.batida(p.x, p.z, 1); setTimeout(() => SX.batida(p.x, p.z, 1), 420); setTimeout(() => SX.batida(p.x, p.z, .7), 840);
  setTimeout(() => subPequeno("inspetor", "Quase..."), 1300); if (MP) MP.alivio(); // respeitou a regra cinco: a Lia solta o ar
}
function chamado() {
  const viz = W.links.filter(l => (l.a === P.room.id || l.b === P.room.id) && !(l.door && l.door.trava && l.door.trava())).map(l => SALA(l.a === P.room.id ? l.b : l.a)).filter(r => !r.fora);
  if (!viz.length) return;
  const s = pick(viz); const [x, z] = pontoEm(s, 1);
  S.flags.chamados = (S.flags.chamados || 0) + 1;
  const C = R.entidades.chamado || {}; const v = H.vozChamado(); let quem = v.quem, texto = v.texto, voz = "davi";
  if (S.flags.chamados > 1) { // da segunda vez em diante a voz às vezes muda: a mãe, ou a sua própria
    const r = Math.random();
    if (!S.flags.chamadoMae && C.mae && r < .15) { S.flags.chamadoMae = true; quem = "mae"; texto = C.mae; voz = "mae"; }
    else if (C.lia && r < .4) { quem = "liaFalsa"; texto = pick(C.lia); voz = "lia"; }
  }
  if (voz === "davi") SFX.chamadoVoz(x, z); else SX.vozFalsa(x, z, voz);
  sub(quem, texto);
  if (!S.flags.chamado1) { S.flags.chamado1 = true; PLAT.agenda(() => { if (!S.dead) falar("chamado_regra"); }, 2.6); }
  chamadoArmadilha = { sala: s, t: 14 };
  // quem chama é ele: o Inspetor começa a andar até aquela sala, e os passos vão ficando mais altos
  if (M.ativo && M.state !== 'caca') { M.state = 'investiga'; M.searchT = 0; planejar(M, x, z); }
}

// =====================================================================
// FITAS, NOTAS, DIÁLOGOS
// =====================================================================
let fitaTocando = null, fitaFila = [], fitaT = 0, fitaPausada = false, fitaPos = null;
function pararFita() {
  if (!fitaTocando) return;
  fitaTocando = null; fitaFila = []; fitaPausada = false; $('#fita-ind').hidden = true; SFX.chiadoFita(false); SFX.fitaClique(); emitNoise(P.pos.x, P.pos.z, 4);
  subQ = subQ.filter(x => !x.prioridade); toast('Você parou a fita no meio.');
}
function tocarFita(fid) {
  if (fitaTocando) {
    if (fitaTocando.id !== fid) return;
    // E de novo no gravador: fita já ouvida para; fita nova pausa e continua
    if (S.fitas[fid]) { if (JM.segurarFita()) return; pararFitaOuvida(); return; }
    fitaPausada = !fitaPausada; SFX.fitaClique(); SFX.chiadoFita(!fitaPausada);
    $('#fita-ind').textContent = fitaTocando.titulo + (fitaPausada ? ' (pausada)' : ''); return;
  }
  const f = R.fitas.find(x => x.id === fid);
  fitaTocando = f; fitaFila = f.linhas.map(l => ({ ...l, texto: codTxt(l.texto) })); fitaT = .8; fitaPausada = false; fitaPos = P.pos.clone();
  $('#fita-ind').textContent = `${f.titulo} · 0/${f.linhas.length}`; $('#fita-ind').hidden = false;
  SFX.fitaClique(); SFX.chiadoFita(true);
  emitNoise(P.pos.x, P.pos.z, 7);
}
function pararFitaOuvida() { fitaFila = []; fitaT = 0; fitaPausada = false; SFX.fitaClique(); }
function updateFita(dt) {
  if (!fitaTocando || fitaPausada) return;
  fitaT -= dt * (JM.avancando ? 3 : 1); // fita já ouvida: segurar E avança, com chiado alto
  if (JM.avancando && fitaPos && Math.random() < dt * 2) { SFX.estatica(.3, { x: fitaPos.x, y: 1, z: fitaPos.z }); emitNoise(fitaPos.x, fitaPos.z, 8); marcarCausa('fita'); }
  if (fitaT <= 0) {
    const l = fitaFila.shift();
    if (!l) { const id = fitaTocando.id; fitaTocando = null; $('#fita-ind').hidden = true; SFX.chiadoFita(false); SFX.fitaClique(); const primeira = !S.fitas[id]; S.fitas[id] = true; H.fitaFim(id); if (primeira) { PG.lore(id); toast('Fita registrada no diário (TAB).'); if (W.def.fitaOuvida) W.def.fitaOuvida(id); progresso(); } return; }
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
  abrirNotaUI(n.titulo, codTxt(n.texto), id, true);
  notaAtual = id; if (id === 'regras' && R.regras.dicaVerso) $('#note small').textContent = 'clique ou E para fechar · ' + R.regras.dicaVerso;
  if (primeira) { PG.lore(id); progresso(); if (W.def.notaLida) W.def.notaLida(id); }
}
let prevUi = null;
function abrirNotaUI(titulo, texto, id, doMundo) { ui = 'nota'; notaAtual = null; $('#note').hidden = false; $('#note h2').textContent = titulo; $('#note p').innerHTML = fmtNota(texto); $('#note small').textContent = 'clique, E ou ESC para fechar · L lê em voz alta'; UIX.papel(id || null, !!doMundo); unlock(); }
function lerVoz() {
  try {
    const ss = window.speechSynthesis; if (!ss) return toast('Seu navegador não lê em voz alta.');
    if (ss.speaking) { ss.cancel(); return; }
    const tit = $('#note h2').textContent, u = new SpeechSynthesisUtterance(tit + '. ' + $('#note p').textContent);
    u.lang = 'pt-BR'; u.rate = .9; const crianca = /Davi|página|Ana/i.test(tit); u.pitch = crianca ? 1.3 : .7;
    const v = ss.getVoices().find(x => /pt(-|_)BR/i.test(x.lang)); if (v) u.voice = v;
    ss.speak(u);
  } catch (e) {}
}
function fecharNota() { try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} $('#note').hidden = true; ui = prevUi || null; prevUi = null; if (ui === 'diario') $('#diario').hidden = false; else lockPointer(); }
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
    // o progresso fica guardado: dá para soltar, se esconder e voltar (perde um pouco; os túmulos guardam tudo)
    if (segurando.it !== alvo) { segurando = { it: alvo, t: alvo.guarda ? alvo.progresso || 0 : (alvo._prog || 0) * alvo.hold, ruidoT: 0 }; if (!alvo.guarda && alvo._prog && !S.flags.dicaProg) { S.flags.dicaProg = true; toast('O progresso ficou guardado.'); } }
    segurando.t += dt; segurando.ruidoT -= dt; if (alvo.guarda) { alvo.progresso = segurando.t; alvo.seguradoT = perf; }
    if (segurando.ruidoT <= 0) { segurando.ruidoT = .6; if (alvo.ruido) emitNoise(P.pos.x, P.pos.z, alvo.ruido, true); if (alvo.som) SFX[alvo.som](); }
    const k = Math.min(1, segurando.t / alvo.hold);
    $('#hold').hidden = false; arc.style.strokeDashoffset = 138.2 * (1 - k);
    if (k >= 1) { const it = alvo; it.progresso = 0; it._prog = 0; segurando = { it: null, t: 0, ruidoT: 0 }; $('#hold').hidden = true; keys.KeyE = false; it.act(); }
  } else {
    if (segurando.it && segurando.it.hold && !segurando.it.guarda) segurando.it._prog = Math.max(0, segurando.t / segurando.it.hold - .15);
    segurando = { it: null, t: 0, ruidoT: 0 }; if (!holdProprio) $('#hold').hidden = true;
  }
}

// =====================================================================
// API PARA OS MAPAS
// =====================================================================
const API = {
  THREE, MAT, TX, MK, ITENS, R, rand, pick, perf: () => perf,
  box, cyl, prop, plano, parede, piso, teto, construirSalas, porta, armario, cama, lampada, vela, gatilho, interact, item, spot, mesaSimples, estante, textoTex, texMat, canvasTex,
  addCollider, SALA, DOOR, setDoor, roomAt, W, P, M, ANA, ativarInspetor, desativarInspetor, spawnAna, despawnAna, iniciarProcissao, planejar,
  get sustos() { return SUST; },
  objDone, progresso, falar, sub, toast, dialogo, lerNota, tocarFita, emitNoise, fade, cartao, conquista, syncWorld, syncLuzes, carregarMapa, salvarCheckpoint, agendarEntidades,
  SFX: new Proxy({}, { get: (t, k) => (...a) => SFX[k](...a) }), abrirTeclado: (...a) => abrirTeclado(...a), final: (...a) => final(...a), escolhaFinal: () => escolhaFinal(), codTxt, D, camera, scene,
  get S() { return S; }, get mode() { return mode; }
};
Object.defineProperty(API, 'raioI', { get: () => raioI }); // brilho do relâmpago, lido pela capela (src/subterraneo-lore.js)
Object.defineProperty(API, 'legendas', { get: () => UIX.som.def }); // legendas de som próprias dos mapas (src/estrada-polimento.js, src/subterraneo-polimento.js)
Object.assign(API, { MON, flash, audio: { get AC() { return AC; }, saida: (...a) => saida(...a), osc: (...a) => osc(...a), burst: (...a) => burst(...a), env: (...a) => env(...a) } }); // usados pelos mapas subterrâneos (src/subterraneo.js)

// =====================================================================
// CENA DE ABERTURA (carro)
// =====================================================================
let cena = null;
// gancho de áudio para os mapas criarem sons próprios (ex.: buzina, orelhão, zumbido) com o mesmo AudioContext
// serve aos dois jeitos: A.audio() (estrada) e A.audio.AC / A.audio.osc(...) (subterrâneo)
API.audio = Object.assign(() => AC ? { AC, master, reverb, saida, env, osc, burst, ruido } : null, { saida: (...a) => saida(...a), osc: (...a) => osc(...a), burst: (...a) => burst(...a), env: (...a) => env(...a) });
Object.defineProperty(API.audio, 'AC', { get: () => AC });
function dicaPular(on) {
  let d = $('#cena-pular');
  if (!d) { d = document.createElement('div'); d.id = 'cena-pular'; d.textContent = 'ENTER pula a cena'; d.style.cssText = 'position:fixed;right:28px;bottom:calc(11% + 14px);font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:#d8cba8;opacity:.6;pointer-events:none;z-index:40;text-shadow:0 0 6px #000'; document.body.appendChild(d); }
  d.hidden = !on;
  const bc = document.body.classList; d.textContent = bc.contains('toque') ? 'toque em Pular abertura' : bc.contains('pad') ? 'START pula a cena' : 'ENTER pula a cena';
  // as falas da abertura (rádio, fita) moram no #sub, que fica dentro do HUD: na cena mostra só as legendas
  if (!$('#css-cena')) { const st = document.createElement('style'); st.id = 'css-cena'; st.textContent = '#hud.so-sub>:not(#sub):not(#legsom){display:none!important}'; document.head.appendChild(st); }
  $('#hud').classList.toggle('so-sub', on); if (on) $('#hud').hidden = false;
}
function iniciarCena() {
  mode = 'cena'; $('#fx-cine').hidden = false; dicaPular(true);
  cena = { t: 0, fim: 30, falas: R.abertura.slice(), cartoes: R.intro.slice(), cartaoT: 0 };
  const lembra = PG.falaAbertura(); if (lembra) { cena.falas.push(lembra); cena.fim = lembra.t + 5; } // o rádio lembra como foi a última noite
  if (W.def.cena) W.def.cena.iniciar();
  SFX.motor(true);
}
function updateCena(dt) {
  cena.t += dt;
  if (W.def.cena) W.def.cena.update(cena.t, dt);
  if (cena.falas.length && cena.t >= cena.falas[0].t) { const f = cena.falas.shift(); sub(f.quem, f.texto, true); }
  cena.cartaoT -= dt;
  if (cena.cartaoT <= 0 && cena.cartoes.length && cena.t < 24) { cartao(cena.cartoes.shift(), 4.2); cena.cartaoT = 5; }
  updateSub(dt);
  if (cena.t >= cena.fim) pularCena();
}
function pularCena() {
  if (!cena) return;
  cena = null; $('#fx-cine').hidden = true; dicaPular(false); SFX.motor(false); $('#cartao').style.opacity = 0;
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
let AUDM = null; // src/audio-mundo.js: hino, alto-falantes, rádios, ecos de 1979, chaves do Inspetor, Hora do Silêncio
let AUDP = null; // src/audio-plataforma.js: menus que soam, som que cai, fone que sai, chão solto, batidas nos armários
const AUD = { sils: [], trovaoIni: 0, trovaoAte: 0, coracaoN: 0, hbT: 0, resp: 0, prendia: false, ultStinger: [], stingerT: -99, dezAte: 0, estPrev: null, anaPrev: null, procT: 0, evT: 28, cacaT: 0, cacaSemi: 0, posCacaT: 0, percT: 0, pulsoT: 0, lampT: 0, ocT: 0, flashPrev: false, tiqueT: 0, avisouCoracao: false, cordaT: -9, cordaN: 0, sala: null, zumbidoAte: 0, pausado: false, erroAvisado: false,
  vozes: [], limVoz: 24, zumbidoIni: 0, zumbidoFim: 0, clusterOn: false, calmaT: 0, calmaAlvo: 300, pausaT: 0, pe: 1, crouchPrev: false, corriaPrev: false, agarraPrev: false, mortoPrev: false, grupoPrev: null };
for (const [k, v] of Object.entries({ vAmb: 1, vSfx: 1, vEnt: 1, vVoz: 1, mono: 0, noturno: 0, falada: 0 })) if (OPT[k] === undefined) OPT[k] = v;
// Lote 3: volumes de sustos e de menus, faixa dinâmica, proteção dos ouvidos, perfil de alto-falante, conforto
if (OPT.faixa === undefined) OPT.faixa = OPT.noturno ? 'noite' : 'cinema'; // quem usava "Som noturno" continua com ele
if (OPT.tiqueMira === undefined) OPT.tiqueMira = OPT.legSom === 'todos' ? 1 : 0;
for (const [k, v] of Object.entries({ vSusto: 1, vMenu: .7, protege: 1, sustoSuave: 0, semZumbido: 0, tiqueMira: 0, saidaSom: (window.matchMedia && matchMedia('(pointer:coarse)').matches && !matchMedia('(pointer:fine)').matches) ? 'celular' : 'normal' })) if (OPT[k] === undefined) OPT[k] = v;
const qualBaixa = () => { try { return !!(window.__plat && window.__plat.O.qual === 'baixa'); } catch (e) { return false; } };
const alvoAtual = () => alvo;
const SFX = new Proxy({}, { get: (t, k) => (...a) => { if (!AC) return; try { UIX.som(k, a); } catch (e) {} try { return SOM[k] && SOM[k](...a); } catch (e) { console.warn(e); } } });
const depois = (ms, fn) => setTimeout(() => { try { if (AC) fn(); } catch (e) { console.warn(e); } }, ms);
function gerarIR(seg, curva) {
  const n = Math.max(1, AC.sampleRate * seg | 0), ir = AC.createBuffer(2, n, AC.sampleRate);
  for (let c = 0; c < 2; c++) { const ch = ir.getChannelData(c); for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, curva); }
  return ir;
}
// Faixa dinâmica: Cinema (picos livres), Noite (gritos contidos, sussurros sobem), Fone baixo (tudo nivelado)
const FAIXAS = { cinema: [-24, 30, 12, .003, .25, 1], noite: [-46, 12, 16, .003, .4, 2.3], baixo: [-52, 6, 9, .002, .3, 3.3] };
function aplicarNoturno() {
  if (!AC) return;
  OPT.noturno = OPT.faixa !== 'cinema' ? 1 : 0;
  const c = AUD.cmp, [th, kn, ra, at, re, mk] = FAIXAS[OPT.faixa] || FAIXAS.cinema;
  c.threshold.value = th; c.knee.value = kn; c.ratio.value = ra; c.attack.value = at; c.release.value = re;
  AUD.makeup.gain.value = mk;
  aplicarPerfil();
}
// Proteção dos ouvidos (limitador final), sustos menos altos e perfil de alto-falante
function aplicarPerfil() {
  if (!AC || !AUD.lim) return;
  const L = AUD.lim, pr = !!OPT.protege, t = AC.currentTime;
  L.threshold.value = pr ? -6 : 0; L.knee.value = 0; L.ratio.value = pr ? 20 : 1; L.attack.value = .001; L.release.value = .2;
  const sv = !!OPT.sustoSuave, c = AUD.sustoCmp;
  c.threshold.value = sv ? -30 : 0; c.knee.value = sv ? 6 : 0; c.ratio.value = sv ? 8 : 1; c.attack.value = sv ? .04 : .003; c.release.value = .3;
  AUD.sustoLp.frequency.setTargetAtTime(sv ? 3000 : 20000, t, .05);
  const pf = OPT.saidaSom || 'normal';
  AUD.hp.frequency.setTargetAtTime(pf === 'celular' ? 180 : pf === 'notebook' ? 110 : 10, t, .05);
  AUD.pk.gain.setTargetAtTime(pf === 'celular' ? 4.5 : pf === 'notebook' ? 2 : 0, t, .05);
  AUD.exc.gain.setTargetAtTime(pf === 'notebook' ? .38 : pf === 'celular' ? .24 : 0, t, .05);
  aplicarVolumes();
}
function aplicarVolumes() {
  if (!AC) return;
  const t = AC.currentTime;
  const caixinha = OPT.saidaSom === 'celular' || OPT.saidaSom === 'notebook';
  for (const [k, v] of [['amb', 'vAmb'], ['mus', 'vAmb'], ['ent', 'vEnt'], ['voz', 'vVoz'], ['sfx', 'vSfx'], ['corpo', 'vSfx'], ['susto', 'vSusto'], ['menu', 'vMenu']]) {
    if (!BUS[k]) continue;
    const alvo = (OPT[v] ?? 1) * (k === 'ent' ? (AUD.entK ?? 1) : 1) * (k === 'amb' && caixinha ? .7 : 1);
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
  master.connect(AUD.corte); AUD.corte.connect(AUD.mono); AUD.mono.connect(AUD.cmp); AUD.cmp.connect(AUD.makeup);
  // perfil de alto-falante: corta o grave que a caixinha não toca, realça a presença e gera harmônicos do grave
  AUD.hp = AC.createBiquadFilter(); AUD.hp.type = 'highpass'; AUD.hp.frequency.value = 10; AUD.hp.Q.value = .7;
  AUD.pk = AC.createBiquadFilter(); AUD.pk.type = 'peaking'; AUD.pk.frequency.value = 2500; AUD.pk.Q.value = .8; AUD.pk.gain.value = 0;
  const exLp = AC.createBiquadFilter(); exLp.type = 'lowpass'; exLp.frequency.value = 150; const exWs = AC.createWaveShaper(); exWs.curve = curvaDist(7); const exHp = AC.createBiquadFilter(); exHp.type = 'highpass'; exHp.frequency.value = 190;
  AUD.exc = AC.createGain(); AUD.exc.gain.value = 0;
  AUD.entrada = AC.createGain(); // fade ao trocar de mapa
  AUD.lim = AC.createDynamicsCompressor(); // "Proteger os ouvidos"
  AUD.makeup.connect(AUD.hp); AUD.hp.connect(AUD.pk); AUD.pk.connect(AUD.entrada);
  AUD.makeup.connect(exLp); exLp.connect(exWs); exWs.connect(exHp); exHp.connect(AUD.exc); AUD.exc.connect(AUD.entrada);
  AUD.entrada.connect(AUD.lim); AUD.lim.connect(AC.destination);
  // barramento dos sustos: compressor e filtro próprios ("Sustos menos altos")
  AUD.sustoCmp = AC.createDynamicsCompressor(); AUD.sustoLp = AC.createBiquadFilter(); AUD.sustoLp.type = 'lowpass'; AUD.sustoLp.frequency.value = 20000; AUD.sustoLp.Q.value = .5;
  AUD.sustoCmp.connect(AUD.sustoLp);
  // iOS: um quadro de silêncio no primeiro toque destrava a saída
  try { const b = AC.createBuffer(1, 1, AC.sampleRate), s0 = AC.createBufferSource(); s0.buffer = b; s0.connect(AC.destination); s0.start(); } catch (e) {}
  AUD.limVoz = qualBaixa() ? 14 : 24;
  AUD.abafa = AC.createBiquadFilter(); AUD.abafa.type = 'lowpass'; AUD.abafa.frequency.value = 20000; AUD.abafa.Q.value = .5;
  AUD.mundo = AC.createGain(); AUD.mundo.connect(AUD.abafa); AUD.abafa.connect(master);
  AUD.sustoLp.connect(AUD.mundo);
  AUD.madeira = AC.createDelay(.2); AUD.madeira.delayTime.value = .021;
  const mfb = AC.createGain(); mfb.gain.value = .38; const mlp = AC.createBiquadFilter(); mlp.type = 'lowpass'; mlp.frequency.value = 1400;
  AUD.madeiraG = AC.createGain(); AUD.madeiraG.gain.value = 0;
  AUD.mundo.connect(AUD.madeiraG); AUD.madeiraG.connect(AUD.madeira); AUD.madeira.connect(mlp); mlp.connect(mfb); mfb.connect(AUD.madeira); mlp.connect(AUD.abafa);
  AUD.vacuo = AC.createGain(); AUD.vacuo.connect(AUD.mundo);
  ruidoBuf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
  const d = ruidoBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  AUD.revIn = AC.createGain(); const ret = AC.createGain(); ret.gain.value = .45; ret.connect(AUD.vacuo);
  AUD.rev = {};
  const leve = qualBaixa() ? .5 : 1; // notebook fraco: caudas de eco mais curtas, convolução mais barata
  for (const [k, seg, curva] of [['p', .6, 3], ['g', 2.8, 2.4], ['t', 4, 1.8]]) {
    const s = AC.createGain(); s.gain.value = k === 'p' ? 1 : 0; const cv = AC.createConvolver(); cv.buffer = gerarIR(k === 'p' ? seg : seg * leve, curva);
    AUD.revIn.connect(s); s.connect(cv); cv.connect(ret); AUD.rev[k] = s;
    if (k === 't') { const dl = AC.createDelay(1); dl.delayTime.value = .18; const fb = AC.createGain(); fb.gain.value = .3; cv.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(ret); }
  }
  reverb = AUD.revIn;
  for (const [k, destino, v] of [['amb', AUD.vacuo, 'vAmb'], ['ent', AUD.vacuo, 'vEnt'], ['voz', AUD.vacuo, 'vVoz'], ['sfx', AUD.mundo, 'vSfx'], ['mus', AUD.mundo, 'vAmb'], ['corpo', master, 'vSfx'], ['susto', AUD.sustoCmp, 'vSusto'], ['menu', master, 'vMenu']]) {
    BUS[k] = AC.createGain(); BUS[k].gain.value = OPT[v] ?? 1; BUS[k].connect(destino);
    BUS[k + 'R'] = AC.createGain(); BUS[k + 'R'].gain.value = OPT[v]; BUS[k + 'R'].connect(AUD.revIn);
  }
  aplicarNoturno();
  SOM.ambiente(); SOM.musica(); SOM.corpo(); SOM.lampadas(); SOM.lanterna();
}
function ruido(loop) { const s = AC.createBufferSource(); s.buffer = ruidoBuf; s.loop = !!loop; return s; }
function novoPanner(ref = 2, roll = 1.2) { const p = AC.createPanner(); p.panningModel = (OPT.mono || !PLAT.fone() || OPT.saidaSom === 'celular' || OPT.saidaSom === 'notebook') ? 'equalpower' : 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = PLAT.fone() ? ref * 1.3 : ref; p.rolloffFactor = roll; return p; }
function posPanner(p, pos) { p.positionX.value = pos.x; p.positionY.value = pos.y ?? 1.5; p.positionZ.value = pos.z; }
// Oclusão: quanto do som atravessa paredes e portas até a sala da jogadora
function oclusao(pos) {
  if (!P.room || !W.salas || !W.salas.length) return null;
  const r = roomAt(pos.x, pos.z);
  if (!r || r === P.room || (r.fora && P.room.fora)) return null;
  const n = distSalas(r, P.room);
  if (n <= 1) {
    const l = W.links.find(l => (l.a === r.id && l.b === P.room.id) || (l.b === r.id && l.a === P.room.id));
    if (l && l.door) { const ab = Math.abs(l.door.ang || 0); return ab > 1.2 ? { f: 9000, g: .95 } : ab > .12 ? { f: 2000, g: .7 } : { f: 600, g: .4 }; }
    return salaAdj(r, P.room) ? { f: 6000, g: .9 } : { f: 900, g: .5 };
  }
  if (n === 2) return { f: 550, g: .42 };
  return { f: 380, g: .3 };
}
// Teto de sons ao mesmo tempo: ambiente sai primeiro, efeitos só no aperto; perigo, vozes, corpo, sustos e menus nunca
function vozLivre(bus) {
  const t = AC.currentTime, v = AUD.vozes;
  while (v.length && v[0] < t - .9) v.shift();
  if (bus === 'amb' && v.length >= AUD.limVoz) return false;
  if (bus === 'sfx' && v.length >= AUD.limVoz * 1.6) return false;
  v.push(t); return true;
}
function saida(pos, wet = .3, bus) {
  bus = BUS[bus] ? bus : 'sfx';
  const g = AC.createGain(); let node = g, oc = null;
  if (!vozLivre(bus)) return g; // descartado: ninguém puxa este nó, então ele não custa nada
  if (pos && bus === 'amb' && Math.hypot(pos.x - P.pos.x, pos.z - P.pos.z) > 32) return g; // ambiente longe demais nem começa
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
  let w = null; if (wet) { w = AC.createGain(); w.gain.value = wet; og.connect(w); w.connect(BUS[bus + 'R']); }
  const F = { g, p, f, og, w, bus, longe: false, gen: 0, pos: { x: pos.x, y: pos.y ?? 1.5, z: pos.z } }; posPanner(p, F.pos); FONTES.add(F); atualizarOclusao(F, true); return F;
}
function moverFonte(F, pos) { F.pos.x = pos.x; F.pos.z = pos.z; if (pos.y !== undefined) F.pos.y = pos.y; posPanner(F.p, F.pos); }
function atualizarOclusao(F, ja) {
  const t = AC.currentTime, d = Math.hypot(F.pos.x - P.pos.x, F.pos.z - P.pos.z);
  // muito longe (mais de 36 m): a fonte sai do mixer e para de custar processamento; volta com fade ao chegar perto
  if (!ja && F.bus && !F.longe && d > 36) { F.longe = true; const gen = ++F.gen; F.og.gain.setTargetAtTime(0, t, .15); depois(700, () => { if (F.longe && F.gen === gen) try { F.og.disconnect(); } catch (e) {} }); return; }
  if (F.longe) { if (d > 32) return; F.longe = false; F.gen++; try { F.og.disconnect(); } catch (e) {} F.og.connect(BUS[F.bus]); if (F.w) F.og.connect(F.w); F.og.gain.setValueAtTime(0, t); }
  const oc = oclusao(F.pos); F.f.frequency.setTargetAtTime(oc ? oc.f : 20000, t, ja ? .001 : .15); F.og.gain.setTargetAtTime(oc ? oc.g : 1, t, ja ? .001 : .15);
}
function env(g, t0, a, peak, dec) { g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + dec); }
function osc(tipo, f, t, dur, g) { const o = AC.createOscillator(); o.type = tipo; o.frequency.value = f; o.connect(g); o.onended = () => o.disconnect(); o.start(t); o.stop(t + dur); return o; }
function burst(t, dur, filtro, freq, q, g, off = Math.random()) { const s = ruido(), f = AC.createBiquadFilter(); f.type = filtro; f.frequency.value = freq; f.Q.value = q; s.connect(f); f.connect(g); s.onended = () => { s.disconnect(); f.disconnect(); }; s.start(t, off); s.stop(t + dur); return f; }
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
    for (const f of [110, 116.5, 155, 233, 247]) { const g = saida(null, .6, 'susto'); const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .78, t + 1.8); o.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.09, t + .05); g.gain.exponentialRampToValueAtTime(.0001, t + 2); o.start(t); o.stop(t + 2.1); }
    const g = saida(null, .8, 'susto'); burst(t, 1, 'highpass', 200, 1, g); env(g, t, .01, .35, .9);
  },
  t => { // piano grave com cauda longa
    for (const [f, a] of [[55, 1], [58.3, .7], [61.7, .6], [110.2, .5], [165.5, .3], [221, .2]]) { const g = saida(null, 1.2, 'susto'); osc('triangle', f, t, 4.5, g); env(g, t, .004, .16 * a, 4); }
  },
  t => { // metal raspado ressonante
    const g = saida(null, .9, 'susto'); for (const f of [1230, 1870, 2650]) { const s = ruido(), bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(f, t); bp.frequency.linearRampToValueAtTime(f * .9, t + 2); bp.Q.value = 30; s.connect(bp); bp.connect(g); s.start(t, Math.random()); s.stop(t + 2.2); }
    env(g, t, .02, 2.2, 2); const g2 = saida(null, .5, 'susto'); const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(300, t); o.frequency.linearRampToValueAtTime(180, t + 1); o.connect(g2); env(g2, t, .01, .05, 1); o.start(t); o.stop(t + 1.1);
  },
  t => { // sopro ao contrário, crescente, cortado seco
    const g = saida(null, .4, 'susto'); burst(t, 1, 'bandpass', 900, .7, g); const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(140, t + .9); o.connect(g);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.55, t + .9); g.gain.setValueAtTime(0, t + .91); o.start(t); o.stop(t + .95);
    depois(900, () => SOM.impacto(1.2));
  },
  t => { // coro distorcido
    const ws = AC.createWaveShaper(); ws.curve = curvaDist(8); const g = saida(null, .9, 'susto'); ws.connect(g);
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
    // a chuva vem em ondas: uma camada de gotas grossas que cresce e some devagar
    const rg = ruido(true), rgf = AC.createBiquadFilter(); rgf.type = 'bandpass'; rgf.frequency.value = 4800; rgf.Q.value = .6; const rgg = AC.createGain(); rgg.gain.value = 0;
    rg.connect(rgf); rgf.connect(rgg); rgg.connect(cg); rg.start(t, .7);
    const rgl = AC.createOscillator(); rgl.frequency.value = .045; const rgla = AC.createGain(); rgla.gain.value = .45; rgl.connect(rgla); rgla.connect(rgg.gain); rgl.start(t);
    const v = ruido(true), vb = AC.createBiquadFilter(); vb.type = 'bandpass'; vb.frequency.value = 400; vb.Q.value = 2;
    const vg = AC.createGain(); vg.gain.value = .04; v.connect(vb); vb.connect(vg); vg.connect(BUS.amb); v.start(); AMB.vento = vg; AMB.ventoF = vb;
    const vl = AC.createOscillator(); vl.frequency.value = .11; const vlg = AC.createGain(); vlg.gain.value = 220; vl.connect(vlg); vlg.connect(vb.frequency); vl.start();
    const goteira = () => {
      try {
        if (AC && mode === 'jogo' && P.room && !P.room.fora && !(AUDM && AUDM.ambK() < .5) && (W.mapa === 'tuneis' || P.room.agua || Math.random() < .3)) {
          const t2 = AC.currentTime, pos = { x: P.pos.x + rand(-6, 6), y: 2, z: P.pos.z + rand(-6, 6) }, poca = W.mapa === 'tuneis' || (P.room.agua && S && !S.flags.aguaBaixa);
          for (const [k, esc] of poca && Math.random() < .5 ? [[0, 1], [.11, .5]] : [[0, 1]]) { const g = saida(pos, .6, 'amb'); const o = AC.createOscillator(), f0 = rand(900, 1500) * (poca ? .7 : 1); o.frequency.setValueAtTime(f0, t2 + k); o.frequency.exponentialRampToValueAtTime(f0 * .33, t2 + k + .08); o.connect(g); env(g, t2 + k, .002, .05 * esc, .1); o.start(t2 + k); o.stop(t2 + k + .15); }
        }
      } catch (e) {}
      setTimeout(goteira, (W.mapa === 'tuneis' ? rand(700, 2600) : rand(1500, 5000)) * (qualBaixa() ? 1.6 : 1));
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
    // medo alto: um cluster agudo que bate devagar (entra acima de 78 de medo e só sai abaixo de 55)
    const clg = AC.createGain(); clg.gain.value = 0; clg.connect(BUS.amb);
    for (const fr of [1760, 1812, 1866, 1975]) { const o = AC.createOscillator(); o.frequency.value = fr; o.detune.value = rand(-12, 12); o.connect(clg); o.start(t); }
    AMB.cluster = clg;
  },
  corpo() {
    const s = ruido(true), f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 1.2; const g = AC.createGain(); g.gain.value = 0; s.connect(f); f.connect(g); g.connect(BUS.corpo); s.start();
    AMB.resp = { g, f };
    const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.value = 330; const of = AC.createBiquadFilter(); of.type = 'bandpass'; of.frequency.value = 900; of.Q.value = 3; const og = AC.createGain(); og.gain.value = 0; o.connect(of); of.connect(og); og.connect(BUS.corpo); o.start();
    AMB.choro = { g: og, o };
    // chiado no peito com a vida baixa
    const cs = ruido(true), cf = AC.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 2600; cf.Q.value = 9; const cg = AC.createGain(); cg.gain.value = 0; cs.connect(cf); cf.connect(cg); cg.connect(BUS.corpo); cs.start(0, .3);
    AMB.chiado = cg;
    // fôlego no fim: a garganta aperta (um "mm" tremido de quem não aguenta mais)
    const ao = AC.createOscillator(); ao.type = 'triangle'; ao.frequency.value = 150; const af = AC.createBiquadFilter(); af.type = 'bandpass'; af.frequency.value = 480; af.Q.value = 4; const ag = AC.createGain(); ag.gain.value = 0;
    const at = AC.createOscillator(); at.frequency.value = 7; const atg = AC.createGain(); atg.gain.value = 12; at.connect(atg); atg.connect(ao.frequency); ao.connect(af); af.connect(ag); ag.connect(BUS.corpo); ao.start(); at.start();
    AMB.aperto = ag;
    // pânico: o sangue batendo nos ouvidos
    const ss = ruido(true), sf = AC.createBiquadFilter(); sf.type = 'lowpass'; sf.frequency.value = 160; const sg = AC.createGain(); sg.gain.value = 0; ss.connect(sf); sf.connect(sg); sg.connect(BUS.corpo); ss.start(0, 1.1);
    AMB.sangue = sg;
  },
  lampadas() {
    AMB.lamp = [];
    for (let i = 0, n = qualBaixa() ? 2 : 3; i < n; i++) {
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
    const t = AC.currentTime, g = saida(null, .5, 'susto'), o = AC.createOscillator(); o.frequency.setValueAtTime(60, t); o.frequency.exponentialRampToValueAtTime(28, t + .8); o.connect(g); env(g, t, .004, .6 * v, .8); o.start(t); o.stop(t + .9);
    const g2 = saida(null, .5, 'susto'); burst(t, .5, 'lowpass', 220, 1, g2, 0); env(g2, t, .003, .7 * v, .45);
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
    if (AUDM) vol *= AUDM.passoK();
    piso = pisoDe(P.room, piso);
    // cada pé de um lado: o passo alterna um pouco entre a esquerda e a direita
    AUD.pe = -AUD.pe;
    const t = AC.currentTime, g = saida(null, fora ? .05 : .25), tom = rand(.88, 1.12) * (AUD.pe > 0 ? 1.03 : .97);
    let pe = g; try { if (!OPT.mono) { pe = AC.createStereoPanner(); pe.pan.value = AUD.pe * .14; pe.connect(g); } } catch (e) { pe = g; }
    // vida baixa: gemido curto correndo, e abaixo de 20 a perna ferida arrasta
    if (S && !S.dead && S.health < 40 && vol >= 1 && Math.random() < .35) SOM.gemido();
    if (S && !S.dead && S.health < 20 && AUD.pe > 0 && vol > .3) { const ga = saida(null, .15); const fa = burst(t + .16, .32, 'lowpass', 420, 1, ga); fa.frequency.linearRampToValueAtTime(260, t + .45); env(ga, t + .16, .08, .1 * vol + .03, .26); if (!window.__teste) emitNoise(P.pos.x, P.pos.z, 1.6); }
    if (agua) { burst(t, .25, 'bandpass', 700 * tom, 1.5, pe); env(g, t, .02, .35 * vol + .08, .22); const g2 = saida(null, .2); burst(t + .12, .15, 'highpass', 2500, 1, g2); env(g2, t + .12, .01, .06 * vol + .02, .12); return; }
    if (piso === 'terra') { burst(t, .16, 'lowpass', 380 * tom, .7, pe); env(g, t, .01, .3 * vol + .04, .14); const g2 = saida(null, 0); burst(t + .05, .12, 'bandpass', 1300, 1.2, g2); env(g2, t + .05, .02, .05 * vol + .01, .1); return; }
    const freq = { madeira: 520, concreto: 1200, ladrilho: 1700, pedra: 950, asfalto: 1100, grama: 700 }[piso] || 900;
    burst(t, .12, fora || piso === 'grama' ? 'bandpass' : 'lowpass', freq * tom, piso === 'ladrilho' ? 2 : 1, pe);
    env(g, t, .005, (.25 * vol + .03) * (vol < .3 ? .6 : 1), piso === 'ladrilho' ? .06 : .09);
    if (piso === 'ladrilho' && vol > .3) { const g3 = saida(null, .3); burst(t, .03, 'highpass', 3200, 1, g3); env(g3, t, .001, .08 * vol, .03); }
    if (fora && piso !== 'asfalto') { const g4 = saida(null, 0); burst(t + .02, .15, 'highpass', 3500, .7, g4); env(g4, t + .02, .02, .05 * vol, .12); }
    if (vol >= 1) { const g5 = saida(null, 0); burst(t, .2, 'highpass', 2200, .5, g5); env(g5, t, .04, .035, .15); }
    if (piso === 'madeira' && Math.random() < (vol >= 1 ? .2 : .12)) SOM.rangido(P.pos.x, .1, P.pos.z, .3);
  },
  passoMonstro(pos, vol, agua) {
    const t = AC.currentTime, p = { x: pos.x, y: .3, z: pos.z }, r = W.salas && W.salas.length ? roomAt(pos.x, pos.z) : null;
    const piso = agua ? 'agua' : r ? pisoDe(r, r.piso || (r.fora ? 'grama' : 'madeira')) : 'madeira', tom = rand(.92, 1.08);
    const d = Math.hypot(pos.x - P.pos.x, pos.z - P.pos.z), tunel = W.mapa === 'tuneis';
    SFX.chaves(pos, M.ativo ? M.state : 'patrulha', vol);
    const g = saida(p, .5, 'ent'); const o = AC.createOscillator(); o.frequency.setValueAtTime(70 * tom, t); o.frequency.exponentialRampToValueAtTime(30, t + .25); o.connect(g); env(g, t, .01, .9 * vol, .3); o.start(t); o.stop(t + .4);
    const cor = { terra: ['lowpass', 220, .6, .3], agua: ['bandpass', 600, .9, .35], madeira: ['lowpass', 380, .6, .22], ladrilho: ['bandpass', 1500, .45, .08], concreto: ['bandpass', 1000, .5, .12], pedra: ['lowpass', 700, .6, .18], asfalto: ['bandpass', 900, .4, .1], grama: ['lowpass', 250, .5, .25] }[piso] || ['lowpass', 400, .6, .2];
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
  rangido(x, y, z, vol = 1, bus = 'sfx', porta) {
    const sd = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;
    // porta aberta devagar (ALT) range baixo e longo, quase mudo; aberta correndo range alto, curto, e bate
    const dv = porta && P.devagar, co = porta && P.sprinting, dur = dv ? 1.6 : co ? .4 : .7, tomP = dv ? .7 : co ? 1.25 : 1; vol *= dv ? .35 : co ? 1.4 : 1;
    if (co) { const tb = AC.currentTime + .32, gb = saida({ x, y, z }, .6, bus); burst(tb, .2, 'lowpass', 260, 1, gb, 0); env(gb, tb, .003, .9, .18); }
    const t = AC.currentTime, o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime((120 + sd * 120 + rand(-15, 15)) * tomP, t); o.frequency.linearRampToValueAtTime((55 + sd * 60) * tomP, t + dur);
    const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700 + sd * 500; f.Q.value = 12;
    const tr = AC.createOscillator(); tr.frequency.value = 16 + sd * 16; const trg = AC.createGain(); trg.gain.value = .5; tr.connect(trg);
    const g = saida({ x, y, z }, .4, bus); trg.connect(g.gain); o.connect(f); f.connect(g); env(g, t, dv ? .2 : .05, .35 * vol, dur); o.start(t); tr.start(t); o.stop(t + dur + .2); tr.stop(t + dur + .2);
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
    SOM.caneta(1.4);
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
  zumbidoOuvido(forca = 1) {
    const t = AC.currentTime;
    if (!OPT.semZumbido) { const g = saida(null, 0, 'corpo'); osc('sine', rand(6000, 7600), t, 4.2, g); env(g, t, .05, .016 * forca, 4); }
    AUD.zumbidoAte = t + 2.2 * forca; AUD.zumbidoIni = t; AUD.zumbidoFim = t + 3.6 * forca; AUD.mundo.gain.cancelScheduledValues(t); AUD.mundo.gain.setValueAtTime(OPT.semZumbido ? .5 : .25, t);
  },
  grito(quem) {
    const t = AC.currentTime, ana = quem === 'ana', base = ana ? [900, 1200, 1500] : quem === 'procissao' ? [330, 392, 466] : [220, 300, 450];
    for (const f of base) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .55, t + 1.1); const lfo = AC.createOscillator(); lfo.frequency.value = ana ? 38 : 26; const lg = AC.createGain(); lg.gain.value = f * .08; lfo.connect(lg); lg.connect(o.frequency); const g = saida(null, .7, 'susto'); o.connect(g); env(g, t, .02, .22, 1.2); o.start(t); lfo.start(t); o.stop(t + 1.3); lfo.stop(t + 1.3); }
    const g = saida(null, .6, 'susto'); burst(t, 1.2, 'bandpass', ana ? 2400 : 1500, 1, g); env(g, t, .01, .6, 1);
    if (!ana) { const ws = AC.createWaveShaper(); ws.curve = curvaDist(20); const g2 = saida(null, .5, 'susto'); ws.connect(g2); const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(55, t); o.frequency.linearRampToValueAtTime(40, t + 1); o.connect(ws); env(g2, t, .02, .08, 1); o.start(t); o.stop(t + 1.1); }
    SOM.impacto(.9); SOM.silencio(.8, .15, true); depois(250, () => SOM.zumbidoOuvido());
  },
  sino(vol = 1, pos = { x: 0, y: 4, z: -60 }, desafina = 1) {
    const t = AC.currentTime, base = 196 * desafina;
    if (vol >= .9) SOM.silencio(6, .04, true);
    if (pos && vol >= .45 && Math.hypot(pos.x - P.pos.x, pos.z - P.pos.z) < 5) depois(180, () => SOM.zumbidoOuvido(.8));
    for (const [m, a] of [[.5, .4], [1, 1], [1.19, .5], [1.5, .45], [2, .5], [2.5, .3], [2.67, .25], [3.0, .2], [4.17, .12]]) { const g = saida(pos, .9); osc('sine', base * m * (desafina < 1 ? rand(.997, 1.003) : 1), t, 8, g); env(g, t, .004, .35 * a * vol, 7 / m); }
  },
  sinoLonge() { SOM.sino(.3, null); },
  badaladas(n = 9) {
    SOM.silencio(1.8 + n * 2.2, .25);
    for (let i = 0; i < n; i++) depois(1800 + i * 2200, () => { if (!(S && S.dead) && ui !== 'morte') SOM.sino(.45 * (i === n - 1 ? 1.25 : 1), null, 1 - i * .005); });
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
    if (AUDM) return AUDM.caixinha(x, z); // o hino do internato (src/audio-mundo.js)
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
  // ---- Lote 3: corpo da Lia
  gemido() { if (SOM._gm && AC.currentTime - SOM._gm < 2.5) return; SOM._gm = AC.currentTime; const t = AC.currentTime, o = silaba(t, null, rand(250, 290), 'e', .16, .03, 'corpo', 0); o.frequency.linearRampToValueAtTime(200, t + .16); },
  suspiroLia() {
    const t = AC.currentTime, g = saida(null, .1, 'corpo'), f = burst(t, 1.4, 'bandpass', 1100, 1.1, g); f.frequency.linearRampToValueAtTime(700, t + 1.3);
    g.gain.setValueAtTime(.0001, t); for (let i = 0; i < 9; i++) g.gain.setValueAtTime((.12 + Math.random() * .08) * (1 - i / 10), t + .1 + i * .13); g.gain.exponentialRampToValueAtTime(.0001, t + 1.45);
  },
  inspirar() { const t = AC.currentTime, g = saida(null, .1, 'corpo'), f = burst(t, .28, 'bandpass', 1500, 1.3, g); f.frequency.linearRampToValueAtTime(2100, t + .25); env(g, t, .05, .12, .2); },
  agachar(desce) { const t = AC.currentTime, g = saida(null, .1); const f = burst(t, .3, 'bandpass', desce ? 1800 : 2300, .9, g); f.frequency.linearRampToValueAtTime(desce ? 1100 : 2800, t + .28); env(g, t, .04, .05, .24); if (desce && Math.random() < .5) { const g2 = saida(null, 0); burst(t + .2, .02, 'bandpass', 2600, 6, g2); env(g2, t + .2, .001, .03, .02); } },
  agarrao() {
    const t = AC.currentTime, g = saida(null, .2, 'corpo'); burst(t, .25, 'bandpass', 900, .8, g); env(g, t, .005, .4, .2);
    const o = silaba(t + .05, null, 420, 'a', .3, .06, 'corpo', 0); o.frequency.linearRampToValueAtTime(330, t + .35);
    const g2 = saida(null, 0, 'corpo'); burst(t + .32, .4, 'lowpass', 700, 1, g2); env(g2, t + .32, .02, .2, .35);
  },
  ultimoBatimento() { SOM.coracao(.7); depois(900, () => SOM.coracao(.4)); depois(2600, () => SOM.coracao(.15)); },
  // ---- Lote 3: interface que soa como o mundo
  interruptor(liga) {
    const t = AC.currentTime;
    for (const [k, fq, v] of liga ? [[0, 2600, .22], [.055, 1200, .14]] : [[0, 1700, .2], [.05, 2900, .1]]) { const g = saida(null, 0); burst(t + k, .03, 'bandpass', fq, 3, g); env(g, t + k, .001, v, .03); }
    const g = saida(null, 0);
    if (liga) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 120; const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 3; o.connect(bp); bp.connect(g); g.gain.setValueAtTime(0, t + .05); for (let i = 0; i < 5; i++) g.gain.setValueAtTime(Math.random() * .01, t + .05 + i * .012); g.gain.setValueAtTime(0, t + .12); o.start(t + .05); o.stop(t + .14); }
    else { osc('sine', 5200, t + .12, .3, g); env(g, t + .12, .002, .006, .28); }
  },
  pilha() {
    const t = AC.currentTime;
    for (const [k, fq, v] of [[0, 900, .2], [.18, 3000, .12], [.42, 1500, .28], [.5, 700, .2]]) { const g = saida(null, .1); burst(t + k, .04, 'bandpass', fq, 4, g); env(g, t + k, .001, v, .04); }
    const g = saida(null, .1), o = AC.createOscillator(); o.frequency.setValueAtTime(1900, t + .2); o.frequency.exponentialRampToValueAtTime(600, t + .32); o.connect(g); env(g, t + .2, .002, .02, .12); o.start(t + .2); o.stop(t + .35);
  },
  caderno(abre) {
    const t = AC.currentTime, g = saida(null, .1);
    if (abre) { const f = burst(t, .35, 'highpass', 1800, .6, g); f.frequency.linearRampToValueAtTime(3000, t + .3); env(g, t, .03, .12, .3); const g2 = saida(null, .1); burst(t + .3, .05, 'lowpass', 500, 1, g2); env(g2, t + .3, .002, .2, .05); }
    else { burst(t, .08, 'lowpass', 400, 1, g, 0); env(g, t, .002, .35, .07); const g2 = saida(null, .1); burst(t, .1, 'highpass', 2500, .7, g2); env(g2, t, .002, .06, .08); }
  },
  pagina() { const t = AC.currentTime, g = saida(null, .05); const f = burst(t, .22, 'highpass', 2600, .6, g); f.frequency.linearRampToValueAtTime(4200, t + .2); env(g, t, .02, .09, .18); },
  dobrar() { const t = AC.currentTime; for (const k of [0, .12]) { const g = saida(null, .05); burst(t + k, .1, 'bandpass', k ? 3400 : 2200, 1.2, g); env(g, t + k, .01, .08, .08); } },
  caneta(atraso = 0) { const t = AC.currentTime + atraso; for (let i = 0; i < 4; i++) { const k = i * .09 + rand(0, .03), g = saida(null, .05, 'mus'); const f = burst(t + k, .07, 'bandpass', rand(3200, 4200), 5, g); f.frequency.linearRampToValueAtTime(rand(2600, 3600), t + k + .06); env(g, t + k, .01, .025, .06); } },
  pausaTum(abre) {
    const t = AC.currentTime, g = saida(null, 0, 'menu');
    if (abre) { const o = AC.createOscillator(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(38, t + .3); o.connect(g); env(g, t, .004, .35, .3); o.start(t); o.stop(t + .4); SOM.mRebobina(); }
    else if (AC.currentTime - (AUD.menuT ?? -9) > .3) SOM.mPlay();
  },
  // ---- Lote 3: menus como um toca-fitas velho
  mTecla() { const t = AC.currentTime, g = saida(null, 0, 'menu'); burst(t, .018, 'bandpass', rand(2400, 2900), 6, g); env(g, t, .001, .05, .015); },
  mPlay() { const t = AC.currentTime; for (const [k, fq, v] of [[0, 1300, .2], [.045, 600, .25]]) { const g = saida(null, 0, 'menu'); burst(t + k, .04, 'bandpass', fq, 3, g); env(g, t + k, .001, v, .035); } const g = saida(null, 0, 'menu'), o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(80, t + .07); o.frequency.linearRampToValueAtTime(130, t + .25); const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 450; o.connect(lp); lp.connect(g); env(g, t + .07, .04, .025, .18); o.start(t + .07); o.stop(t + .3); },
  mRebobina() { const t = AC.currentTime, g = saida(null, 0, 'menu'), o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(380, t); o.frequency.exponentialRampToValueAtTime(1500, t + .12); const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 1.5; o.connect(bp); bp.connect(g); env(g, t, .01, .03, .11); o.start(t); o.stop(t + .14); const g2 = saida(null, 0, 'menu'); burst(t + .12, .03, 'bandpass', 1800, 4, g2); env(g2, t + .12, .001, .12, .03); },
  mPot(v = .5) { const t = AC.currentTime, g = saida(null, 0, 'menu'); burst(t, .012, 'bandpass', 1800 + v * 1600, 8, g); env(g, t, .001, .035, .01); },
  mInterruptor(on) { const t = AC.currentTime, g = saida(null, 0, 'menu'); burst(t, .03, 'bandpass', on ? 2100 : 1500, 4, g); env(g, t, .001, .14, .03); const g2 = saida(null, 0, 'menu'); osc('square', on ? 160 : 110, t, .03, g2); env(g2, t, .001, .015, .025); },
  mCatraca() { const t = AC.currentTime; for (let i = 0; i < 3; i++) { const g = saida(null, 0, 'menu'); burst(t + i * .035, .01, 'highpass', 3600, 2, g); env(g, t + i * .035, .001, .05, .01); } },
  mBaque() { const t = AC.currentTime, g = saida(null, 0, 'menu'); burst(t, .09, 'lowpass', 240, 1, g, 0); env(g, t, .003, .3, .08); },
  mSussurro(lado) {
    const t = AC.currentTime, g = saida(null, 0, 'menu'); let sp = g; try { sp = AC.createStereoPanner(); sp.pan.setValueAtTime(-lado * .9, t); sp.pan.linearRampToValueAtTime(lado * .9, t + .55); sp.connect(g); } catch (e) { sp = g; }
    const s = ruido(), f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = rand(2400, 3400); f.Q.value = 3; s.connect(f); f.connect(sp);
    g.gain.setValueAtTime(0, t); for (let i = 0; i < 5; i++) g.gain.setValueAtTime(Math.random() < .7 ? rand(.008, .02) : 0, t + i * .11); g.gain.setValueAtTime(0, t + .58); s.start(t, Math.random()); s.stop(t + .6);
  },
  tiqueMira(pos) { const t = AC.currentTime, g = saida(pos, 0, 'menu'); osc('sine', 330, t, .08, g); env(g, t, .002, .05, .07); },
  amostra(k) { // ao arrastar o volume, você ouve aquele som no volume novo
    const t = AC.currentTime;
    if (k === 'vAmb') { const g = saida(null, .2, 'amb'); burst(t, .5, 'lowpass', 2600, .6, g); env(g, t, .08, .12, .4); }
    else if (k === 'vEnt') { const g = saida(null, .3, 'ent'), o = AC.createOscillator(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(32, t + .25); o.connect(g); env(g, t, .01, .5, .3); o.start(t); o.stop(t + .35); }
    else if (k === 'vVoz') silaba(t, null, 300, 'a', .25, .08, 'voz', .3);
    else if (k === 'vSfx') SOM.clique();
    else if (k === 'vSusto') { const g = saida(null, .3, 'susto'); burst(t, .3, 'lowpass', 220, 1, g, 0); env(g, t, .003, .35, .28); }
    else if (k === 'vMenu') SOM.mTecla();
  },
  testeFone() { // a Ana testa o seu fone: esquerda, direita, atrás
    const fw = new THREE.Vector3(); camera.getWorldDirection(fw); fw.y = 0; if (fw.lengthSq() < .01) fw.set(0, 0, -1); fw.normalize();
    const dir = new THREE.Vector3(-fw.z, 0, fw.x), c = camera.position;
    const pontos = [[-1.4, 0, 'o'], [1.4, 0, 'i'], [0, -1.6, 'a']];
    pontos.forEach(([lx, lz, vg], i) => depois(i * 1100, () => {
      const pos = { x: c.x + dir.x * lx + fw.x * lz, y: c.y, z: c.z + dir.z * lx + fw.z * lz }, t = AC.currentTime;
      const g = saida(pos, .1, 'menu'); const s = ruido(), bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = VOGAL[vg][1]; bp.Q.value = 4; s.connect(bp); bp.connect(g); env(g, t, .04, .09, .4); s.start(t, Math.random()); s.stop(t + .5);
      silaba(t + .05, pos, 520, vg, .3, .03, 'menu', 0);
    }));
  },
  // ---- Lote 3: o mundo em volta
  tocArmario(pos, colado) {
    const t = AC.currentTime;
    for (const k of [0, .19]) {
      if (colado) { const g = saida(null, 0, 'corpo'); burst(t + k, .12, 'lowpass', 300, 1, g, 0); env(g, t + k, .002, .9, .1); const g2 = saida(null, 0, 'corpo'); burst(t + k, .04, 'bandpass', 900, 3, g2); env(g2, t + k, .001, .35, .04); }
      else { const g = saida({ x: pos.x, y: 1.2, z: pos.z }, .3, 'ent'); burst(t + k, .07, 'bandpass', 650, 3, g); env(g, t + k, .002, .25, .06); }
    }
  },
  portaLonge(pos) { const t = AC.currentTime, g = saida({ x: pos.x, y: 1.2, z: pos.z }, .9, 'sfx'); burst(t, .4, 'lowpass', 260, 1, g, 0); env(g, t, .004, .7, .35); },
  passoLonge(pos) { const t = AC.currentTime, g = saida({ x: pos.x, y: .3, z: pos.z }, .6, 'ent'), o = AC.createOscillator(); o.frequency.setValueAtTime(64, t); o.frequency.exponentialRampToValueAtTime(30, t + .25); o.connect(g); env(g, t, .01, .6, .3); o.start(t); o.stop(t + .4); },
  tabua(pos, vol, piso) {
    const t = AC.currentTime;
    if (piso === 'ladrilho') { for (const k of [0, .07]) { const g = saida({ x: pos.x, y: .05, z: pos.z }, .5, 'sfx'); burst(t + k, .05, 'bandpass', k ? 1300 : 2100, 4, g); env(g, t + k, .001, .45 * vol, .05); } return; }
    { const o = AC.createOscillator(), f = AC.createBiquadFilter(), g0 = saida({ x: pos.x, y: .05, z: pos.z }, .4, 'sfx'); o.type = 'sawtooth'; o.frequency.setValueAtTime(rand(150, 190), t); o.frequency.linearRampToValueAtTime(rand(70, 95), t + .45); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 11; o.connect(f); f.connect(g0); env(g0, t, .03, .5 * vol, .45); o.start(t); o.stop(t + .55); }
    const g = saida({ x: pos.x, y: .05, z: pos.z }, .4, 'sfx'); burst(t, .08, 'lowpass', 600, 1, g, 0); env(g, t, .002, .3 * vol, .07);
  },
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
// O chão de verdade debaixo dos pés: sala sem piso marcado é madeira (como o desenho dela); fora, no cemitério, é terra
function pisoDe(r, piso) {
  if (!r) return piso || 'madeira';
  if (r.piso) return r.piso;
  if (r.fora) return W.mapa === 'cemiterio' ? 'terra' : (piso || 'grama');
  return 'madeira';
}
function perfilSala(r) {
  if (!r) return 'p';
  if (r.acustica === 'tunel' || (W.mapa === 'tuneis' && !r.acustica && r.tipo === 'tunel')) return 't';
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
  const fw = _vA.set(0, 0, -1).applyQuaternion(camera.quaternion), up = _vU.set(0, 1, 0).applyQuaternion(camera.quaternion);
  if (L.positionX) { L.positionX.value = p.x; L.positionY.value = p.y; L.positionZ.value = p.z; L.forwardX.value = fw.x; L.forwardY.value = fw.y; L.forwardZ.value = fw.z; L.upX.value = up.x; L.upY.value = up.y; L.upZ.value = up.z; }
  else { L.setPosition(p.x, p.y, p.z); L.setOrientation(fw.x, fw.y, fw.z, up.x, up.y, up.z); }
  const fora = !!(P.room && P.room.fora), subsolo = W.mapa === 'tuneis', jogando = mode === 'jogo' && S && !S.dead;
  if (W.grupo !== AUD.grupoPrev) {
    AUD.grupoPrev = W.grupo;
    AUD.entrada.gain.cancelScheduledValues(now); AUD.entrada.gain.setValueAtTime(0, now); AUD.entrada.gain.linearRampToValueAtTime(1, now + 1.2);
    AUD.sils = []; AUD.zumbidoAte = AUD.zumbidoFim = 0; AUD.posCacaT = 0; AUD.coracaoN = 0; AUD.calmaT = 0; AUD.clusterOn = false; AUD.mortoPrev = false;
    AUD.corte.gain.cancelScheduledValues(now); AUD.corte.gain.setValueAtTime(1, now);
  }
  AUD.limVoz = qualBaixa() ? 14 : 24;
  // Ambiente: chuva abafada dentro, quase sumida debaixo da terra, mais forte no telhado do andar de cima
  const dM0 = S && M.ativo ? Math.hypot(M.pos.x - P.pos.x, M.pos.z - P.pos.z) : 99;
  const duck = jogando && dM0 < 10 ? 1 - .45 * (1 - dM0 / 10) : 1; // o mundo abaixa quando ele chega perto
  const ambM = (AUDM && mode === 'jogo' ? AUDM.ambiente(dt) : 1) * duck; // Hora do Silêncio e salas de lore
  AMB.chuva.gain.value = ambM < .05 ? 0 : lerp(AMB.chuva.gain.value, (subsolo ? .012 : fora ? .14 : W.mapa === 'superior' ? .05 : .03) * ambM, dt * 2);
  AMB.chuvaF.frequency.value = lerp(AMB.chuvaF.frequency.value, subsolo ? 300 : fora ? 3000 : 500, dt * 2);
  const rajada = .5 + .5 * Math.sin(perf * .23) * Math.sin(perf * .61);
  AMB.vento.gain.value = ambM < .05 ? 0 : lerp(AMB.vento.gain.value, (subsolo ? .012 : fora ? .03 + .07 * rajada : .02) * ambM, dt * 1.5);
  if (!S) return;
  const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99, dA = ANA.ativa ? ANA.pos.distanceTo(P.pos) : 99, est = M.ativo ? M.state : null;
  const prende = !!(S.hidden && keys.Space && S.stamina > 0 && jogando);
  // --- Reverb pela sala onde você está
  if (P.room && AUD.sala !== P.room) { AUD.sala = P.room; const k = perfilSala(P.room); for (const [c, s] of Object.entries(AUD.rev)) s.gain.setTargetAtTime(k === 'fora' ? (c === 'p' ? .3 : 0) : c === k ? 1 : 0, now, .5); }
  // --- Oclusão das fontes contínuas
  AUD.ocT -= dt; if (AUD.ocT <= 0) { AUD.ocT = W.doors.some(d => Math.abs(d.ang - d.target) > .04) ? .06 : .3; for (const F of FONTES) atualizarOclusao(F); }
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
  const bote = est === 'alerta' || est === 'bote';
  if (bote) lPulso = lCordas = lCaca = lZ = 0; // o vazio avisa: a música some antes de ele atacar
  if (!jogando) lPulso = lCordas = lCaca = lZ = 0;
  // medo alto: o cluster agudo entra e sai com folga, nunca piscando
  if (!AUD.clusterOn && S.fear > 78 && jogando) AUD.clusterOn = true; else if (AUD.clusterOn && (S.fear < 55 || !jogando)) AUD.clusterOn = false;
  AMB.cluster.gain.setTargetAtTime(AUD.clusterOn && !bote ? .0035 : 0, now, AUD.clusterOn ? 1.5 : 2.5);
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
    if ((AUD.estPrev === 'procura' || AUD.estPrev === 'investiga') && est === 'patrulha' && dM < 25 && jogando) { SOM.alivio(); if (AUD.estPrev === 'procura') depois(700, () => { if (S && !S.dead) SOM.suspiroLia(); }); }
    AUD.estPrev = est;
  }
  // --- Vácuo: o silêncio que avisa
  let vac = 1;
  for (const w of AUD.sils) if (now < w.ate) vac = Math.min(vac, w.nivel);
  if (fitaTocando) vac = Math.min(vac, .35);
  if (ANA.ativa && !ANA.vista && ANA.conta >= 7 && dA < 12) vac = Math.min(vac, .18);
  if (PROC.fase === 'aviso' && PROC.t < 1.6) vac = Math.min(vac, .06);
  if (prende) vac = Math.min(vac, .45);
  if (bote && jogando) vac = Math.min(vac, .2);
  if (!S.dead) { const cur = AUD.vacuo.gain.value; AUD.vacuo.gain.setTargetAtTime(vac, now, vac < cur ? .17 : .6); }
  // --- Abafar: armário, cama, medo extremo, ferida, morte
  let corte = 20000;
  if (S.hidden) corte = S.hidden.tipo === 'cama' ? 2000 : 1200;
  else if (S.fear > 90) corte = 2600;
  if (S.health < 30) corte = Math.min(corte, 3200);
  if (prende) corte = Math.min(corte, 380 + 820 * clamp(S.stamina / 100, 0, 1)); // o mundo some aos poucos; quanto menos ar, mais longe
  if (now < AUD.zumbidoFim) { const k = clamp((now - AUD.zumbidoIni) / Math.max(.1, AUD.zumbidoFim - AUD.zumbidoIni), 0, 1); corte = Math.min(corte, 650 + 19350 * k * k); }
  if (S.dead) corte = 500;
  AUD.abafa.frequency.setTargetAtTime(corte, now, prende ? .25 : .1);
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
    SOM.coracao((.35 + .65 * n) * (S.hidden ? 1.4 : 1) * (prende ? 1.3 : 1) * (AUDM ? AUDM.coracaoK() : 1));
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
  AMB.chiado.gain.setTargetAtTime(jogando && S.health < 40 && !prende ? amp * ciclo * ciclo * (.5 + (40 - S.health) / 40) : 0, now, .05);
  AMB.aperto.gain.setTargetAtTime(prende && S.stamina < 25 ? .007 * (1 - S.stamina / 25) * (.6 + Math.random() * .4) : 0, now, .08);
  const hbF = AUD.hbT > 0 ? Math.pow(clamp(AUD.hbT * 3, 0, 1), 2) : 0;
  AMB.sangue.gain.setTargetAtTime(jogando && AUD.coracaoN > .6 ? .05 * (AUD.coracaoN - .6) / .4 * (.4 + hbF) : 0, now, .06);
  // movimentos do corpo: agachar farfalha, começar a correr puxa o ar, o agarrão arranca um grito abafado
  if (jogando && P.crouch !== AUD.crouchPrev) SOM.agachar(P.crouch);
  AUD.crouchPrev = P.crouch;
  if (jogando && P.sprinting && !AUD.corriaPrev) SOM.inspirar();
  AUD.corriaPrev = !!P.sprinting;
  const agarra = M.ativo && M.state === 'agarra';
  if (agarra && !AUD.agarraPrev) SOM.agarrao();
  AUD.agarraPrev = agarra;
  if (S.dead && !AUD.mortoPrev) SOM.ultimoBatimento();
  AUD.mortoPrev = !!S.dead;
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
    const perto = [];
    if (jogando && P.room) for (const Lp of W.lampadas) { if (!Lp.ligada || Lp.luz.intensity <= .5) continue; const dx = Lp.x - P.pos.x, dz = Lp.z - P.pos.z, d2 = dx * dx + dz * dz; if (d2 < 81 && salaAdj(roomAt(Lp.x, Lp.z), P.room)) { Lp._d2 = d2; perto.push(Lp); } }
    perto.sort((a, b) => a._d2 - b._d2); perto.length = Math.min(perto.length, AMB.lamp.length);
    AMB.lamp.forEach((v, i) => {
      const Lp = perto[i];
      if (!Lp) { v.g.gain.setTargetAtTime(0, now, .2); return; }
      posPanner(v.p, { x: Lp.x, y: 2.6, z: Lp.z });
      const mal = (M.ativo && Math.hypot(M.pos.x - Lp.x, M.pos.z - Lp.z) < 6) || PROC.fase;
      v.o.detune.setTargetAtTime(mal ? rand(-90, 90) : 0, now, .1);
      v.g.gain.setTargetAtTime(Lp.luz.intensity < Lp.base * .3 ? 0 : (mal ? rand(.004, .02) : .008) * ambM, now, .1);
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
  // --- Silêncio que ensina: depois de muito tempo calmo, tudo para por alguns segundos (e às vezes uma porta bate longe)
  if (jogando && perigo < .05 && !PROC.fase && !ANA.ativa && !fitaTocando) AUD.calmaT += dt; else AUD.calmaT = Math.max(0, AUD.calmaT - dt * 4);
  if (AUD.calmaT > AUD.calmaAlvo && !window.__teste) {
    AUD.calmaT = 0; AUD.calmaAlvo = rand(240, 420); const dur = rand(6, 10); SOM.silencio(dur, .04);
    if (Math.random() < .3) depois(rand(2000, (dur - 1) * 1000), () => { const a = rand(0, 6.28); if (mode === 'jogo' && S && !S.dead) SOM.portaLonge({ x: P.pos.x + Math.cos(a) * 22, z: P.pos.z + Math.sin(a) * 22 }); });
  }
  // --- Tique na mira: um toque grave quando a mira acha algo que se usa pela primeira vez
  const av = alvoAtual();
  if (OPT.tiqueMira && jogando && av && av !== AUD.alvoPrev && av.obj && !av._tiq) { av._tiq = true; const wp = av.obj.getWorldPosition(new THREE.Vector3()); SOM.tiqueMira({ x: wp.x, y: wp.y, z: wp.z }); }
  AUD.alvoPrev = av;
  if (AUDP) AUDP.tick(dt, { dM, est, jogando });
  // drone respira com o perigo
  AMB.drone.gain.setTargetAtTime((.03 + .03 * AUD.coracaoN) * ambM, now, ambM < .05 ? .02 : 1);
  // --- o mundo e a história pelo som (src/audio-mundo.js)
  if (AUDM) AUDM.tick(dt);
}
// Pausa e diário abafam o mundo; menu silencia o que é contínuo; aba escondida suspende o áudio
setInterval(() => {
  try {
    if (!AC) return;
    const pausado = ui === 'pausa' || ui === 'diario', parado = pausado || !(mode === 'jogo' || mode === 'cena') || (S && S.fim);
    if (pausado !== AUD.pausado) { AUD.pausado = pausado; const t = AC.currentTime; AUD.abafa.frequency.setTargetAtTime(pausado ? 650 : 20000, t, .08); AUD.mundo.gain.setTargetAtTime(pausado ? .5 : 1, t, .15); if (ui === 'pausa' || (!pausado && AUD.uiPrev === 'pausa')) SOM.pausaTum(pausado); if (ui === 'diario') SOM.caderno(true); else if (AUD.uiPrev === 'diario' && !pausado) SOM.caderno(false); AUD.pausaT = 0; }
    if (AUD.uiPrev === 'nota' && ui !== 'nota') SOM.dobrar();
    if (ui === 'diario' && abaDiario !== AUD.abaPrev && AUD.abaPrev) SOM.pagina();
    AUD.abaPrev = ui === 'diario' ? abaDiario : null;
    // no Pesadelo o diário não é lugar seguro: abrir o caderno faz barulho
    if (ui === 'diario' && AUD.uiPrev !== 'diario' && S && S.dif === 'pesadelo' && !S.dead && !window.__teste) emitNoise(P.pos.x, P.pos.z, 4);
    AUD.uiPrev = ui;
    // na pausa, de vez em quando, um passo dele bem longe, do lado onde ele está de verdade
    if (ui === 'pausa' && M.ativo && S && !S.dead) { AUD.pausaT += .15; if (AUD.pausaT >= 40) { AUD.pausaT = 0; SOM.passoLonge(M.pos); } }
    if (parado) silenciarContinuos();
  } catch (e) {}
}, 150);
document.addEventListener('visibilitychange', () => { try { if (!AC) return; if (document.hidden) AC.suspend(); else AC.resume(); } catch (e) {} });
for (const ev of ['pointerdown', 'keydown', 'touchend', 'click']) addEventListener(ev, () => { try { if (AC && AC.state !== 'running' && AC.state !== 'closed' && !document.hidden) AC.resume(); } catch (e) {} });
// Opções de som (volumes separados, mono, som noturno, voz falada)
(function opcoesSom() {
  const campos = [['vAmb', 'Ambiente e música'], ['vEnt', 'Criaturas'], ['vSfx', 'Efeitos'], ['vVoz', 'Vozes e fitas'], ['vSusto', 'Sustos'], ['vMenu', 'Sons dos menus']];
  const chk = [['protege', 'Proteger os ouvidos (limita os picos)'], ['sustoSuave', 'Sustos menos altos'], ['semZumbido', 'Sem zumbido no ouvido'], ['tiqueMira', 'Tique ao mirar em algo usável'], ['mono', 'Áudio mono'], ['falada', 'Voz falada do Inspetor']];
  const sels = [['faixa', 'Faixa de som', [['cinema', 'Cinema (picos livres)'], ['noite', 'Noite (gritos contidos)'], ['baixo', 'Fone baixo (tudo nivelado)']]], ['saidaSom', 'Tocando em', [['normal', 'Fone ou caixa de som'], ['notebook', 'Alto-falante do notebook'], ['celular', 'Alto-falante do celular']]]];
  const pct = k => Math.round((OPT[k] ?? 1) * 100) + '%';
  const html = p => campos.map(([k, n]) => `<label>${n} <input type="range" id="${p}-${k}" min="0" max="1.5" step="0.05" aria-label="Volume: ${n}"><output id="${p}-${k}-v">${pct(k)}</output></label>`).join('')
    + sels.map(([k, n, ops]) => `<label>${n} <select id="${p}-${k}">${ops.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>`).join('')
    + chk.map(([k, n]) => `<label><input type="checkbox" id="${p}-${k}"> ${n}</label>`).join('')
    + `<button type="button" class="btn" id="${p}-testeFone">Testar fone</button><button type="button" class="btn" id="${p}-somPadrao">Som padrão</button><small class="som-dica" id="${p}-somDica"></small>`;
  const DICA = { cinema: 'Cinema: o susto vem com tudo. Melhor de fone, volume médio.', noite: 'Noite: gritos e sino contidos, sussurros e passos sobem. Para não acordar a casa.', baixo: 'Fone baixo: tudo nivelado para ouvir os passos dele com o volume baixinho. O medo é maior de fone.' };
  const PADRAO_SOM = { vAmb: 1, vEnt: 1, vSfx: 1, vVoz: 1, vSusto: 1, vMenu: .7, faixa: 'cinema', protege: 1, sustoSuave: 0, semZumbido: 0, mono: 0, falada: 0 };
  const st = document.createElement('style');
  st.textContent = '.som-grade output{min-width:3.2em;text-align:right;opacity:.7}.som-grade select{background:#151110;color:inherit;border:1px solid #4a3d33;font:inherit}.som-dica{flex-basis:100%;opacity:.65;font-size:12px}.som-extra{margin-top:10px;font-family:"IM Fell English SC",serif;font-size:14px;letter-spacing:.08em;color:var(--fraco,#888);width:100%;text-align:center}.som-extra summary{cursor:pointer;list-style:none}.som-extra summary::-webkit-details-marker{display:none}.som-extra summary::before{content:"+ "}.som-extra[open] summary::before{content:"− "}.som-grade{display:flex;flex-wrap:wrap;gap:10px 22px;justify-content:center;margin-top:10px}.som-grade label{display:flex;align-items:center;gap:8px}';
  document.head.appendChild(st);
  for (const [p, sel, tit] of [['o', '#title .opts', 'Som'], ['p', '#pause .set', 'Mais opções de som']]) {
    const alvo = $(sel); if (!alvo) continue;
    const d = document.createElement('details'); d.className = 'som-extra'; d.innerHTML = `<summary>${tit}</summary><div class="som-grade">${html(p)}</div>`; alvo.appendChild(d);
  }
  const setSom = (k, v) => {
    OPT[k] = typeof v === 'string' && isNaN(+v) ? v : +v; lsSet(OPT_KEY, OPT);
    for (const p of ['o', 'p']) {
      const el = $(`#${p}-${k}`); if (!el) continue; if (el.type === 'checkbox') el.checked = !!OPT[k]; else el.value = OPT[k];
      const out = $(`#${p}-${k}-v`); if (out) out.textContent = pct(k);
      const dc = $(`#${p}-somDica`); if (dc) dc.textContent = DICA[OPT.faixa] || '';
    }
    if (!AC) return;
    if (k === 'faixa') aplicarNoturno(); else if (k === 'protege' || k === 'sustoSuave' || k === 'saidaSom') aplicarPerfil(); else aplicarVolumes();
    if (k === 'falada' && !OPT.falada && window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {}
  };
  for (const p of ['o', 'p']) {
    for (const [k] of campos) { const el = $(`#${p}-${k}`); if (el) { el.value = OPT[k]; el.oninput = e => setSom(k, e.target.value); } }
    for (const [k] of chk) { const el = $(`#${p}-${k}`); if (el) { el.checked = !!OPT[k]; el.onchange = e => setSom(k, e.target.checked ? 1 : 0); } }
    for (const [k] of sels) { const el = $(`#${p}-${k}`); if (el) { el.value = OPT[k]; el.onchange = e => setSom(k, e.target.value); } }
    const dc = $(`#${p}-somDica`); if (dc) dc.textContent = DICA[OPT.faixa] || '';
    const tf = $(`#${p}-testeFone`); if (tf) tf.onclick = () => { iniciarAudio(); SFX.testeFone(); toast('A Ana fala da esquerda, da direita e de trás de você. Se não for assim, ligue ou desligue "Estou de fone" em Desempenho.'); };
    const sp = $(`#${p}-somPadrao`); if (sp) sp.onclick = () => { for (const [k, v] of Object.entries(PADRAO_SOM)) setSom(k, v); };
  }
})();

// =====================================================================
// CHUVA, RELÂMPAGO, LUZES
// =====================================================================
const NCH = 1800, NRES = 160;
const chuvaGeo = new THREE.BufferGeometry(), chuvaPos = new Float32Array(NCH * 6), chuvaVel = new Float32Array(NCH);
for (let i = 0; i < NCH; i++) { const x = rand(-20, 20), y = rand(0, 14), z = rand(-20, 20); chuvaVel[i] = rand(13, 18); chuvaPos.set([x, y, z, x, y + .34, z], i * 6); }
chuvaGeo.setAttribute('position', new THREE.BufferAttribute(chuvaPos, 3));
const chuvaMat = new THREE.LineBasicMaterial({ color: 0x8a96aa, transparent: true, opacity: .3, depthWrite: false });
const chuva = new THREE.LineSegments(chuvaGeo, chuvaMat); // riscos, não pontos
chuva.frustumCulled = false; scene.add(chuva);
const resGeo = new THREE.BufferGeometry(), resPos = new Float32Array(NRES * 3).fill(-99), resVida = new Float32Array(NRES);
resGeo.setAttribute('position', new THREE.BufferAttribute(resPos, 3));
const respingos = new THREE.Points(resGeo, new THREE.PointsMaterial({ color: 0x9aa6b8, size: .05, transparent: true, opacity: .45, depthWrite: false }));
respingos.frustumCulled = false; scene.add(respingos);
const CEU0 = new THREE.Color(0x020304), CEU1 = new THREE.Color(0x3a4868), NEV0 = new THREE.Color(0x04060a), NEV1 = new THREE.Color(0x26304a);
let raioT = 8, raioI = 0, raioSeq = [], raioClock = 9, vento = 0, ventoAtual = 0, ventoT = 0, resI = 0;
function novoRaio() { // 1 a 3 clarões seguidos; com "reduzir flashes", um só, fraco e com subida lenta
  raioClock = 0; raioSeq = [];
  if (OPT.vFlash) return;
  let t = 0; const n = 1 + (Math.random() * 3 | 0);
  for (let i = 0; i < n; i++) { raioSeq.push({ t, i: i === 0 ? rand(.7, 1) : rand(.4, 1) }); t += rand(.07, .22); }
}
function updateClima(dt) {
  const fora = !!(P.room && P.room.fora);
  chuva.visible = respingos.visible = fora;
  if (fora) {
    ventoT -= dt; if (ventoT <= 0) { ventoT = rand(2, 6); vento = rand(-3.5, 3.5); } // rajadas de vento inclinam a chuva
    ventoAtual = lerp(ventoAtual, vento, Math.min(1, dt * .8));
    chuva.position.set(camera.position.x, 0, camera.position.z); respingos.position.copy(chuva.position);
    const a = chuvaPos, r = resPos;
    for (let i = 0; i < NCH; i++) {
      const o = i * 6; a[o + 1] -= chuvaVel[i] * dt; a[o] += ventoAtual * dt;
      if (a[o + 1] < 0) {
        if (Math.random() < .35) { const k = resI++ % NRES; r[k * 3] = a[o]; r[k * 3 + 1] = .03; r[k * 3 + 2] = a[o + 2]; resVida[k] = .12; }
        a[o + 1] = 14; a[o] = rand(-20, 20); a[o + 2] = rand(-20, 20);
      }
      a[o + 3] = a[o] - ventoAtual * .022; a[o + 4] = a[o + 1] + .34; a[o + 5] = a[o + 2];
    }
    for (let k = 0; k < NRES; k++) if (resVida[k] > 0) { resVida[k] -= dt; r[k * 3 + 1] += dt * .4; if (resVida[k] <= 0) r[k * 3 + 1] = -99; }
    chuvaGeo.attributes.position.needsUpdate = true; resGeo.attributes.position.needsUpdate = true;
  }
  raioT -= dt;
  if (raioT <= 0 && W.mapa !== 'tuneis') { raioT = rand(14, 38); novoRaio(); SFX.trovao(); SUST.aoRaio(); if (S && P.room && !P.room.fora) S.fear = Math.min(100, S.fear + 4); }
  raioClock += dt;
  if (OPT.vFlash) raioI = raioClock < .3 ? .35 * raioClock / .3 : raioClock < 3 ? .35 * Math.exp(-(raioClock - .3) * 3) : 0;
  else { raioI = 0; for (const p of raioSeq) if (raioClock >= p.t) raioI = Math.max(raioI, p.i * Math.exp(-(raioClock - p.t) * 9)); if (raioClock > 3) raioSeq = []; }
  const semCeu = W.mapa === 'tuneis', fl = semCeu ? 0 : raioI * PLAT.clarao();
  luzBase = lerp(luzBase, fora ? 1 : 0, Math.min(1, dt * 2));
  moon.intensity = lerp(ambDentro.moon, ambFora.moon, luzBase) + fl * 3;
  hemi.intensity = lerp(ambDentro.hemi, ambFora.hemi, luzBase) + fl * .7;
  scene.fog.density = lerp(ambDentro.fog, ambFora.fog, luzBase);
  // o clarão tinge o céu e a névoa de azul e faz a chuva brilhar
  scene.background.copy(CEU0).lerp(CEU1, fl * .7 * luzBase); scene.fog.color.copy(NEV0).lerp(NEV1, fl * .8 * luzBase);
  chuvaMat.opacity = .3 + fl * .5;
  const perto = M.ativo ? M.pos : null;
  if (!PROC.fase) for (const L of W.lampadas) {
    if (!L.ligada) continue;
    const inter = perto && Math.hypot(L.x - perto.x, L.z - perto.z) < 6; // perto do Inspetor a fiação falha mais
    L.flick -= dt * (inter ? 4 : 1);
    if (L.flick < 0) { L.flick = OPT.vFlash ? rand(.6, 4) : rand(.05, 4); const off = Math.random() < (inter ? .55 : .3); L.alvoI = off ? L.base * .08 : L.base * rand(.75, 1.05); L.alvoE = off ? .2 : 2; if (!OPT.vFlash) { L.luz.intensity = L.alvoI; L.bulbo.material.emissiveIntensity = L.alvoE; } }
    if (OPT.vFlash && L.alvoI !== undefined) { const k = Math.min(1, dt * 4); L.luz.intensity = lerp(L.luz.intensity, L.alvoI, k); L.bulbo.material.emissiveIntensity = lerp(L.bulbo.material.emissiveIntensity, L.alvoE, k); }
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
  if (!alvo && !S.hidden) alvo = alvoPorCone(vis);
  if (S.hidden) alvo = W.inter.find(i => i.obj === S.hidden.g);
  let html = alvo ? alvo.label() : '';
  if (alvo && alvo.hold && html.startsWith('<b>E</b>')) html = html.replace('<b>E</b>', '<b>segure E</b>') + `<span class="dur">${alvo.hold}s</span>`;
  if (alvo && alvo.ruido && html.includes('<b>')) html += `<span class="onda" title="faz barulho">${alvo.ruido >= 20 ? '(((·)))' : alvo.ruido >= 9 ? '((·))' : '(·)'}</span>`;
  const pr = $('#prompt');
  if (pr.innerHTML !== html) { pr.innerHTML = html; if (alvo !== alvoAnt) { pr.classList.remove('in'); void pr.offsetWidth; pr.classList.add('in'); } }
  alvoAnt = alvo;
  const cr = $('#cross').classList; cr.toggle('alvo', !!alvo); cr.toggle('apagada', !alvo && !S.flashOn && !S.hidden && !(P.room && P.room.fora));
}
let alvoAnt = null;
function renderObj() {
  if (!S) return;
  const c = R.capitulos[S.chapter];
  $('#obj-cap').textContent = c.titulo;
  let liberado = true; const t = performance.now();
  if (objAnim.cap !== S.chapter) objAnim = { cap: S.chapter, feito: {}, visto: {}, ate: {} };
  const html = c.objetivos.map(o => {
    const feito = S.done[o.id], cls = feito ? 'ok' : liberado ? '' : 'futuro'; if (!feito) liberado = false;
    if (feito && objAnim.visto[o.id] && !objAnim.feito[o.id]) objAnim.ate[o.id] = ['risca', t + 1500];
    if (!feito && cls === '' && objAnim.iniciado && !objAnim.visto[o.id]) objAnim.ate[o.id] = ['escreve', t + 1700];
    if (cls !== 'futuro') objAnim.visto[o.id] = true; objAnim.feito[o.id] = !!feito;
    const an = objAnim.ate[o.id] && objAnim.ate[o.id][1] > t ? ' ' + objAnim.ate[o.id][0] : '';
    return `<li class="${cls}${an}">${o.texto.replace('{n}', contagem(o.id) ?? 0)}</li>`;
  }).join('');
  objAnim.iniciado = true;
  if (html !== objHtml) { $('#obj-list').innerHTML = html; objHtml = html; }
}
let objAnim = {}, objHtml = '';
function renderInvMini() {
  if (!S) return;
  const p = [];
  if (S.inv.pilhas) p.push(`Pilhas <em>${S.inv.pilhas}</em><kbd>R</kbd>`);
  if (S.inv.kits) p.push(`Curativos <em>${S.inv.kits}</em><kbd>H</kbd>`);
  if (S.inv.garrafas) p.push(`Garrafas <em>${S.inv.garrafas}</em><kbd>G</kbd>`);
  if (S.inv.reliquias) p.push(`Objetos <em>${S.inv.reliquias}</em>`);
  if (S.flags.l2radio) p.push('Rádio do Joaquim<kbd>B</kbd>');
  if (S.flags.l2terco) p.push('Terço da Irmã Celeste');
  $('#inv-mini').innerHTML = p.join('<br>');
}
let filtroAtual = '';
function updateHUD() {
  $('#b-vida').style.setProperty('--v', S.health + '%');
  $('#b-folego').style.setProperty('--v', S.stamina + '%');
  $('#b-pilha').style.setProperty('--v', S.battery + '%');
  $('#bars').style.opacity = S.inv.lanterna ? 1 : .3;
  VIS.hud(); // vinheta, desfoque e filtros de medo (src/visual.js)
  $('#b-vida').parentElement.classList.toggle('baixo', S.health < 35);
  $('#b-folego').parentElement.classList.toggle('vazio', S.stamina < 5);
  $('#b-pilha').parentElement.classList.toggle('fraca', S.inv.lanterna && S.battery < 18);
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
  const p = R.personagens[f.quem] || { nome: f.quem, cor: '#fff' }, txt = codTxt(f.texto);
  el.className = f.quem === 'inspetor' ? 'grave' : /^\((eco|longe|bem baixinho|do escuro)/.test(f.texto) ? 'eco' : '';
  el.innerHTML = `<span class="quem" style="color:${p.cor}">${UIX.nomeFalante(f.quem, p)}</span><span style="color:${p.cor}">${fmtFala(txt)}</span>`;
  if (!f.curta) UIX.fala(f.quem, txt);
  subT = f.curta ? 1.2 : 2.4 + f.texto.length * (OPT.legTempo === 'longo' ? .085 : .055);
}
function updateSub(dt) { if (subT > 0) { subT -= dt; if (subT <= 0) proxSub(); } }
let toastT;
let toastUlt = '', toastQuando = 0;
function toast(t) { const agora = performance.now(); if (t === toastUlt && agora - toastQuando < 3000) return; toastUlt = t; toastQuando = agora; const el = $('#toast'); el.textContent = t; el.style.opacity = 1; clearTimeout(toastT); UIX.historico('nota', t); toastT = setTimeout(() => el.style.opacity = 0, Math.max(2800, t.length * 65) * (OPT.legTempo === 'longo' ? 1.6 : 1)); }
function cartaoCapitulo() { const el = $('#chapter'), c = R.capitulos[S.chapter]; el.textContent = c.titulo; if (c.epigrafe) { const s = document.createElement('small'); s.textContent = c.epigrafe; el.appendChild(s); } el.style.opacity = 1; setTimeout(() => el.style.opacity = 0, c.epigrafe ? 4200 : 3400); }
let cartaoTO;
function cartao(t, dur = 4) { const el = $('#cartao'); el.textContent = t; el.style.opacity = 1; clearTimeout(cartaoTO); cartaoTO = setTimeout(() => el.style.opacity = 0, dur * 1000); }
function fade(on, cb, ms = 650) { $('#fx-black').style.opacity = on ? 1 : 0; if (cb) setTimeout(cb, ms); }
let conqTO;
function conquista(id) { PG.conquista(id); } // fila, secretas e som: src/progressao.js

// Diário
let abaDiario = 'obj';
function abrirDiario() { if (JP.travado()) { JP.agoraNao(); return; } ui = 'diario'; $('#diario').hidden = false; unlock(); renderDiario(); UIX.marcasAbas(); if (S.dif === 'pesadelo') $('#d-pane').insertAdjacentHTML('afterbegin', '<div class="tarja-tempo">o tempo não para</div>'); }
const ABAS = ['obj', 'regras', 'inv', 'notas', 'tempo', 'pessoas', 'pistas', 'mapa', 'ouvido'];
function irAba(id) { abaDiario = id; document.querySelectorAll('#diario nav .btn').forEach(x => x.classList.toggle('on', x.dataset.tab === id)); renderDiario(); }
function trocarAba(e) {
  const i = ABAS.indexOf(abaDiario), m = /^Digit([1-9])$/.exec(e.code);
  if (m) irAba(ABAS[+m[1] - 1]);
  else if (e.code === 'ArrowRight' || e.code === 'KeyD') irAba(ABAS[(i + 1) % ABAS.length]);
  else if (e.code === 'ArrowLeft' || e.code === 'KeyA') irAba(ABAS[(i - 1 + ABAS.length) % ABAS.length]);
}
function fecharDiario() { $('#diario').hidden = true; ui = null; lockPointer(); }
$('#d-fechar').onclick = fecharDiario;
document.querySelectorAll('#diario nav .btn').forEach(b => b.onclick = () => irAba(b.dataset.tab));
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
    if (S.fitas.f1 || S.flags.atendeu || S.flags.pista_q) h += `<h3>Quadro de chaves${S.fitas.f1 ? '' : S.flags.atendeu ? ' (a voz no orelhão)' : ''}</h3><div class="digits">${S.quadro.join('')}</div>`;
    if (S.fitas.f2 || S.flags.pista_v) h += `<h3>Ordem das válvulas</h3><div class="digits">${S.ordem.join('-')}</div>`;
    el.innerHTML = h;
  } else if (abaDiario === 'regras') {
    let h = S.flags.regras ? `<div class="paper" style="transform:none;width:100%;max-height:none"><h2>${R.regras.titulo}</h2><p>${R.regras.texto}</p>${S.flags.verso ? `<p style="margin-top:14px">${fmtNota(R.regras.verso)}</p>` : ''}</div>` : '<p style="color:var(--fraco)">Você ainda não tem as regras.</p>';
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
    if (I.fusiveis && !S.flags.energia) L.push(['Caixa de fusíveis reserva', 'quadro da casa de máquinas']);
    if (I.engrenagens && !S.done.caixinha) L.push(['Engrenagem da caixinha', 'caixinha de música, na sala de brinquedos']);
    if (I.pa) L.push(['Pá', 'para cavar']);
    for (const v of Object.values(I.chaves)) if (v) L.push([v, 'chave']);
    if (I.reliquias) L.push([`Objetos das crianças ×${I.reliquias}`, 'levar ao altar']);
    el.innerHTML = L.length ? L.map(([a, b]) => `<div style="padding:8px 0;border-bottom:1px solid #2c2720">${a} <span style="color:var(--fraco);font-style:italic"> · ${b}</span></div>`).join('') : '<p style="color:var(--fraco)">Bolsos vazios.</p>';
  } else if (abaDiario === 'notas') {
    const lista = [...R.notas.map(n => ({ ...n, tipo: 'n' })), ...R.paginas.map(n => ({ ...n, tipo: 'n' })), ...R.fitas.map(f => ({ ...f, tipo: 'f' }))].filter(n => !n.secreta || (n.tipo === 'f' ? S.fitas[n.id] : S.notes[n.id]));
    el.innerHTML = `<p style="color:var(--fraco);margin-bottom:12px">${loreAchado()} de ${totalLore()} encontradas ${loreAchado() >= totalLore() ? '· tudo descoberto' : '· o que abre o fim não está no papel: está no que você faz'}</p><div class="notas">` +
      lista.map(n => { const tem = n.tipo === 'f' ? S.fitas[n.id] : S.notes[n.id], onde = tem && n.tipo !== 'f' ? UIX.ondeNota(n.id) : ''; return `<div class="nota ${tem ? (n.tipo === 'f' ? 'k7' : 'recorte') : 'x'}" data-id="${n.id}" data-t="${n.tipo}">${tem ? (n.secreta ? '✦ ' : '') + (n.tipo === 'f' ? '▶ ' : '') + n.titulo : '???'}${onde ? `<small>${onde}</small>` : ''}</div>`; }).join('') + '</div>' + UIX.renderParedes();
    el.querySelectorAll('.nota:not(.x)').forEach(d => d.onclick = () => {
      prevUi = 'diario'; $('#diario').hidden = true;
      if (d.dataset.t === 'f') { const f = R.fitas.find(x => x.id === d.dataset.id); abrirNotaUI(f.titulo, f.linhas.map(l => `${(R.personagens[l.quem] || {}).nome}: ${codTxt(l.texto)}`).join('\n\n'), 'fita'); }
      else { const n = R.notas.find(x => x.id === d.dataset.id) || R.paginas.find(x => x.id === d.dataset.id); abrirNotaUI(n.titulo, codTxt(n.texto), n.id); }
    });
  } else if (abaDiario === 'tempo') UIX.renderTempo(el);
  else if (abaDiario === 'pessoas') UIX.renderPessoas(el);
  else if (abaDiario === 'pistas') UIX.renderPistas(el);
  else if (abaDiario === 'ouvido') UIX.renderOuvido(el);
  else {
    const salas = W.salas; if (!salas.length) return;
    const marca = UIX.salaMarcada();
    const minX = Math.min(...salas.map(r => r.x0)), maxX = Math.max(...salas.map(r => r.x1)), minZ = Math.min(...salas.map(r => r.z0)), maxZ = Math.max(...salas.map(r => r.z1));
    const k = Math.min(900 / (maxX - minX), 560 / (maxZ - minZ));
    const sx = x => (x - minX) * k + 10, sz = z => (maxZ - z) * k + 10;
    let s = `<h3>${W.def.nome}</h3><svg viewBox="0 0 ${(maxX - minX) * k + 20} ${(maxZ - minZ) * k + 20}" preserveAspectRatio="xMidYMid meet">`;
    for (const r of salas) {
      const vis = S.visited[`${W.mapa}:${r.id}`] || r.fora, aqui = P.room === r;
      s += `<rect x="${sx(r.x0)}" y="${sz(r.z1)}" width="${(r.x1 - r.x0) * k}" height="${(r.z1 - r.z0) * k}" fill="${aqui ? '#3a1f18' : PG.salaDica(r) ? '#2e2614' : vis ? (r.fora ? '#0d100c' : '#1d1a15') : '#0a0908'}" stroke="${PG.salaDica(r) ? '#c9a75a' : vis ? '#857a63' : '#2a2620'}" stroke-width="1.5"/>`;
      const mk = UIX.marcaMapa(r); if (mk) { s += `<rect x="${sx(r.x0)}" y="${sz(r.z1)}" width="${(r.x1 - r.x0) * k}" height="${(r.z1 - r.z0) * k}" fill="transparent"><title>${mk.titulo}</title></rect>`; if (mk.notas) s += `<text x="${sx(r.x0) + 5}" y="${sz(r.z1) + 15}" fill="#c9a75a" font-size="13">✎</text>`; }
      if ((vis || PG.salaDica(r)) && r.nome) s += `<text x="${sx((r.x0 + r.x1) / 2)}" y="${sz((r.z0 + r.z1) / 2) + 5}" fill="#cfc3a6" font-size="${Math.max(10, Math.min(15, (r.x1 - r.x0) * k / 7))}" text-anchor="middle" font-family="IM Fell English SC">${r.nome}</text>`;
      if (marca === r.id) { const cx = sx((r.x0 + r.x1) / 2), cz = sz((r.z0 + r.z1) / 2) - 14; s += `<path d="M${cx - 7} ${cz - 7}L${cx + 7} ${cz + 7}M${cx + 7} ${cz - 7}L${cx - 7} ${cz + 7}" stroke="#c0392b" stroke-width="3"/>`; }
    }
    s += `<circle cx="${sx(P.pos.x)}" cy="${sz(P.pos.z)}" r="6" fill="#c0392b"/><text x="${sx(P.pos.x) + 10}" y="${sz(P.pos.z) + 4}" fill="#c0392b" font-size="12" font-family="Special Elite">você</text></svg>`;
    s += `<p style="color:var(--fraco);font-size:13px;font-family:'Special Elite'">salas visitadas aparecem com nome · ✎ onde você achou papéis · passe o mouse numa sala para lembrar o que ela era em 1979${marca ? ' · X marca onde a Lia acha que precisa ir' : ''}</p>`;
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
  if (mundoVivo()) emitNoise(P.pos.x, P.pos.z, k === 'OK' ? 4 : 3, true); // cada bipe do teclado se ouve no corredor
  for (const b of kg.children) if (b.textContent === k) { b.classList.add('aperta'); setTimeout(() => b.classList.remove('aperta'), 120); }
  const n = teclado.codigo.length;
  if (k === '←') digitado = digitado.slice(0, -1);
  else if (k === 'OK') {
    if (digitado === teclado.codigo) { const ok = teclado.ok; fecharTeclado(); ok(); return; }
    if (H.codigo($('#k-tit').textContent, digitado)) { digitado = ''; if (teclado) $('#k-disp').textContent = '_'.repeat(n); return; }
    $('#keypad').classList.add('erro'); setTimeout(() => $('#keypad').classList.remove('erro'), 450); SFX.trancado(); if (mundoVivo()) emitNoise(P.pos.x, P.pos.z, 10, true); if (teclado.erro) teclado.erro(); digitado = '';
  } else if (digitado.length < n) digitado += k;
  $('#k-disp').textContent = (digitado + '_'.repeat(n)).slice(0, n);
}

// Pausa / menus
function abrirPausa() { ui = 'pausa'; $('#pause').hidden = false; SUST.aoPausar(); UIX.pausa(); }
function fecharPausa() { $('#pause').hidden = true; ui = null; lockPointer(); try { if (AC) AC.resume(); } catch (e) {} congelarT = .8; $('#fx-black').style.opacity = .6; setTimeout(() => { if (!S || !S.dead) $('#fx-black').style.opacity = 0; }, 80); }
$('#p-voltar').onclick = fecharPausa;
$('#p-check').onclick = () => { $('#pause').hidden = true; ui = null; carregarSnap(S._check || lsGet(SAVE_KEY)); lockPointer(); };
$('#p-menu').onclick = () => UIX.confirmar(`Voltar ao menu? O progresso depois do último ponto salvo (há ${UIX.mmss(Math.max(0, S.tempo - UIX.ultSaveTempo))}) se perde.`, () => voltarMenu(), 'Voltar ao menu', 'Continuar jogando');
$('#p-cap').onclick = () => {
  const snap = (lsGet(CAPS_KEY, {})[R.capitulos[S.chapter].id] || {}).snap;
  if (!snap) return toast('Este capítulo ainda não tem um começo salvo.');
  UIX.confirmar('Recomeçar o capítulo do início?', () => { ui = null; carregarSnap(snap); $('#hud').hidden = false; lockPointer(); cartaoCapitulo(); renderObj(); }, 'Recomeçar', 'Cancelar');
};
function setOpt(k, v) { OPT[k] = +v; if (k === 'vol' && master) master.gain.value = OPT.vol; lsSet(OPT_KEY, OPT); for (const p of ['#o-', '#p-']) { const el = $(p + k); if (el) el.value = v; } }
for (const p of ['o', 'p']) { $(`#${p}-sens`).value = OPT.sens; $(`#${p}-vol`).value = OPT.vol; $(`#${p}-sens`).oninput = e => setOpt('sens', e.target.value); $(`#${p}-vol`).oninput = e => setOpt('vol', e.target.value); }
$('#dt-retry').onclick = () => { if (!S || !S.dead) return; $('#death').hidden = true; ui = null; $('#fx-black').style.opacity = 0; $('#hud').hidden = false; carregarSnap(S._check || lsGet(SAVE_KEY)); lockPointer(); };
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
  $('#pn-lista').innerHTML = R.conquistas.map(x => { const tem = c[x.id], esconde = (x.secreta || x.segredo) && !tem; return `<div class="it ${tem ? '' : 'x'}"><div><b>${esconde ? '???' : x.nome}</b><br><small>${esconde ? 'Um segredo do internato. Procure.' : x.desc}</small></div><span class="rank">${tem ? '✦' : ''}</span></div>`; }).join('');
  $('#title').hidden = true; $('#painel').hidden = false;
};

// Final
function final(tipo) {
  if (S.fim) return; S.fim = true;
  const F = R.finais[tipo];
  desativarInspetor(); despawnAna(true);
  conquista('final_' + tipo); if (S.dif === 'pesadelo') conquista('pesadelo'); H.aoFinal(tipo);
  PG.final(tipo);
  $('#fx-black').style.opacity = 1; SFX.pararCanto();
  if (F.antes) setTimeout(() => cartao(F.antes.texto, 3), 300);
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  setTimeout(() => {
    unlock(); ui = 'final'; $('#hud').hidden = true; $('#escolha').hidden = true; $('#ending').hidden = false;
    $('#e-tit').textContent = F.titulo; revelar($('#e-txt'), H.textoFinal(tipo, F));
    const min = Math.floor(S.tempo / 60), seg = Math.floor(S.tempo % 60);
    $('#e-stats').innerHTML = `tempo total ${min}min ${String(seg).padStart(2, '0')}s · notas, páginas e fitas ${loreAchado()}/${totalLore()} · encontrada ${S.mortes}x · ${D().nome}<br>${H.statsFinal(tipo)}`;
    PG.telaFinal(tipo); UIX.telaFinal(tipo);
    SFX.sino(.5, null); SFX.temaFinal(tipo);
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
$('#b-novo').onclick = () => UIX.antesDeNovoJogo(novoJogo);
function novoJogo() {
  iniciarAudio();
  S = novoEstado($('#o-dif').value); mortesNoPonto = 0;
  PG.novoJogo(S);
  carregarMapa('estrada', 'carro'); H.aoComecar(S);
  salvarCheckpoint(true);
  $('#title').hidden = true;
  iniciarCena();
}
$('#b-cont').onclick = () => {
  iniciarAudio(); S = null;
  try { carregarSnap(lsGet(SAVE_KEY)); } catch (e) { console.warn('save inválido', e); try { localStorage.removeItem(SAVE_KEY); } catch (e2) {} voltarMenu(); $('#t-memoria').textContent = 'O save estava estragado e foi descartado. Use o menu Capítulos.'; return; }
  $('#o-dif').value = S.dif; entrarJogo();
};
function entrarJogo() {
  mode = 'jogo'; ui = null; $('#title').hidden = true; $('#hud').hidden = false; $('#fx-black').style.opacity = 0;
  lockPointer(); cartaoCapitulo(); renderObj();
}
function voltarMenu() {
  clearTimeout(capTO); trocandoCap = false; $('#fimcap').hidden = true; mortesNoPonto = 0; mira.visible = false;
  mode = 'titulo'; ui = null; $('#hud').hidden = true; $('#title').hidden = false; $('#fx-black').style.opacity = 0; $('#clique').hidden = true;
  $('#b-cont').hidden = !temSave();
  desativarInspetor(); despawnAna(true); PROC.fase = null; PROC.g.visible = false; SFX.pararCanto(); SFX.chiadoFita(false); SFX.gerador(false); fitaTocando = null; $('#fita-ind').hidden = true;
  $('#fx-locker').hidden = true; $('#fx-cama').hidden = true; canvas.style.filter = ''; filtroAtual = '';
  unlock(); carregarTitulo(); UIX.atualizarTitulo();
}
function carregarTitulo() { S = novoEstado('normal'); carregarMapa('estrada', 'titulo', { salvar: false }); H.titulo(); PG.titulo(); }
const H = instalarHistoria({ R, MAPAS, API, lsGet, lsSet, CONQ_KEY, P, M, ANA, PROC, W, SFX, falar, sub, toast, cartao, conquista, emitNoise, iniciarAudio, fecharTeclado, tocarFita, syncWorld, dicaExterna: true, get S() { return S; }, get mode() { return mode; }, get ui() { return ui; }, get AC() { return AC; } });

const UIX = criarInterface({
  get S() { return S; }, P, M, ANA, PROC, W, OPT, DIFS, R, camera, renderer, keys, SFX, CAPS_KEY, SAVE_KEY, scene, get AC() { return AC; }, get master() { return master; },
  get mode() { return mode; }, get ui() { return ui; }, get fita() { return fitaTocando && !fitaPausada ? fitaTocando : null; }, loreAchado, totalLore,
  D: () => D(), salaAdj, roomAt, emitNoise, toast, sub, conquista, lsGet, lsSet,
  salvarOpt: () => lsSet(OPT_KEY, OPT), setOpt, retry: () => $('#dt-retry').click(), fecharPausa, pularFimCap: () => pularFimCap()
});

// =====================================================================
// LOOP
// =====================================================================
const SUST = criarSustos({
  THREE, R, $, rand, pick, clamp, lerp, camera, scene, W, P, M, MON, ANA, ANA_G, PROC, keys, MAT, MK, AMB, OPT, D,
  get S() { return S; }, get AC() { return AC; }, get master() { return master; }, get perf() { return perf; }, get chamado() { return chamadoArmadilha; },
  limparChamado: () => { chamadoArmadilha = null; }, raio: () => { raioT = 0; },
  saida, env, osc, burst, ruido, SFX, box, cyl, plano, interact, gatilho, SALA, DOOR, setDoor, roomAt, visivel, naLuz, emitNoise, collide, pontoEm, planejar, patrulhar,
  sub, falar, toast, fade, entrarEsconderijo, sairEsconderijo, syncLuzes, despawnAna, renderInvMini,
  conquista, flash, get ui() { return ui; }, get mode() { return mode; } // lote 3 (src/sustos-plataforma.js)
});
// Monstros e IA, lote 2: lore viva das entidades (chaves, apito, armários dele, Procissão com rosto, Davi, Joaquim, Albano)
const ML = criarMonstrosLore({
  THREE, R, $, rand, pick, clamp, lerp, camera, scene, W, P, M, MON, VULTO, ANA, ANA_G, PROC, MAT, OPT, D, SX, SFX,
  get S() { return S; }, get AC() { return AC; }, get perf() { return perf; }, get flashPisca() { return flashPisca; }, get ui() { return ui; },
  saida, env, osc, burst, ruido, silaba, box, cyl, plano, canvasTex, textoTex, interact, setDoor, roomAt, SALA, visivel, linhaLivre, naLuz, salaAdj, distSalas, centroSala, pontoEm, planejar, patrulhar, collide,
  modeloInspetor, acabarProcissao, abrirNotaUI, sub, subPequeno, toast, falar, emitNoise, renderInvMini, despawnAna
});
// Monstros e IA, lote 3: polimento e plataforma das entidades (sensação, acessibilidade, toque, desempenho, replay)
MP = criarMonstrosPolimento({
  THREE, R, rand, pick, clamp, lerp, camera, scene, W, P, M, MON, VULTO, ANA, ANA_G, PROC, MAT, OPT, UIX, SOMX, SX, SFX, AG, flash,
  get S() { return S; }, get AC() { return AC; }, get perf() { return perf; }, get ui() { return ui; }, get mode() { return mode; },
  saida, env, osc, burst, box, canvasTex, roomAt, visivel, setDoor, tremer, emitNoise, marcarCausa, patrulhar, prendendo, sub, subPequeno, toast, conquista
});
const JM = criarMundoJogavel({
  THREE, W, P, M, PROC, ANA, keys, R, MAT, OPT, SFX, SX, camera,
  get S() { return S; }, get AC() { return AC; }, get perf() { return perf; }, get alvo() { return alvo; }, get mode() { return mode; }, get ui() { return ui; }, get digitado() { return digitado; },
  audio: { saida: (...a) => saida(...a), osc: (...a) => osc(...a), burst: (...a) => burst(...a), env: (...a) => env(...a), ruido: (...a) => ruido(...a) },
  interact, box, cyl, plano, vela, textoTex, canvasTex, addCollider, roomAt, SALA, salaAdj, distSalas, planejar, emitNoise, codTxt, renderInvMini,
  toast, sub, subPequeno, falar, conquista, abrirNotaUI, abrirTeclado, fecharTeclado, fade, carregarMapa, pararFitaOuvida, marcarCausa
});
// Jogabilidade, lote 3: polimento, sensação e acessibilidade (src/jogabilidade-polimento.js)
const JP = criarPolimento({ THREE, P, M, ANA, PROC, W, OPT, keys, camera, scene, SFX, texHalo: TX_HALO, legendas: UIX.som.def, semMouse: () => PLAT.semMouse(), abafarMundo, emitNoise, toast,
  A: { saida: (...a) => saida(...a), osc: (...a) => osc(...a), burst: (...a) => burst(...a), env: (...a) => env(...a) },
  get S() { return S; }, get AC() { return AC; }, get perf() { return perf; }, get alvo() { return alvo; }, get mode() { return mode; }, get ui() { return ui; } });
const VIS = instalarVisual({ THREE, scene, camera, renderer, canvas, flash, flashFill, MON, ANA, ANA_G, PROC, M, P, W, MAT, OPT, OPT_KEY, lsSet, R, ROLOS, keys, roomAt, visivel, collide, salasAlcancaveis, distSalas, D, MAOS, MAT_CACO, chuvaMat, chuvaGeo, SFX, sub, toast, conquista, interact, item, MK, legendas: UIX.som.def, get alvo() { return alvo; },
  get S() { return S; }, get mode() { return mode; }, get ui() { return ui; }, get flashPisca() { return flashPisca; }, get hbT() { return AUD.hbT; }, get raioI() { return raioI; }, get fita() { return fitaTocando; }, get perf() { return perf; } });
const VM = instalarMundoVisual({ THREE, scene, camera, renderer, flash, hemi, moon, W, P, M, ANA, ANA_G, PROC, MON, MAT, MK, OPT, R, TX, chuvaMat, respingos, interact, sub, SFX, DOOR, collide, raio: () => { raioT = 0; },
  get S() { return S; }, get perf() { return perf; }, get raioI() { return raioI; }, get raioClock() { return raioClock; } }); // mundo e história pela luz (src/visual-mundo.js)
PG.ligar({
  get S() { return S; }, setS: v => { S = v; }, get ui() { return ui; }, get mode() { return mode; },
  KEYS: { SAVE_KEY, CAPS_KEY, CONQ_KEY, OPT_KEY }, OPT, salvarOpt: () => lsSet(OPT_KEY, OPT), saveExterno: true, dicaExterna: true, ajudaExterna: true,
  P, M, ANA, PROC, W, MON, SFX, D, toast, sub, loreAchado, totalLore, salvarCheckpoint, carregarSnap, entrarJogo, iniciarAudio, emitNoise,
  recomecarCap: () => { // Lote 3: reinício na hora (segurar BACKSPACE / SELECT / três dedos), sem tela de morte nem menu
    const snap = (lsGet(CAPS_KEY, {})[R.capitulos[S.chapter].id] || {}).snap; if (!snap || trocandoCap) return false;
    if (ui === 'diario') fecharDiario();
    clearTimeout(capTO); $('#pause').hidden = true; $('#death').hidden = true; ui = null; mortesNoPonto = 0; $('#fx-black').style.opacity = 0;
    carregarSnap(snap); $('#hud').hidden = false; lockPointer(); cartaoCapitulo(); renderObj(); return true;
  }
});
AUDM = instalarAudioMundo({
  get AC() { return AC; }, get S() { return S; }, get mode() { return mode; }, get ui() { return ui; }, get perf() { return perf; }, get fita() { return fitaTocando; },
  SOM, SFX, BUS, AUD, AMB, VOGAL, FONTES, THREE, MAT, P, M, ANA, PROC, W, keys, camera, legendas: UIX.som.def,
  saida, env, osc, burst, ruido, curvaDist, fonteFixa, moverFonte, box, cyl, interact, emitNoise, sub, subPequeno, toast, rand, pick, clamp
});
AUDP = instalarAudioPlataforma({
  get AC() { return AC; }, get S() { return S; }, get mode() { return mode; }, get ui() { return ui; },
  SOM, OPT, AUD, W, P, M, THREE, emitNoise, toast, abrirPausa, legendas: UIX.som.def
});
carregarTitulo();
const grain = $('#fx-grain').getContext('2d'), grainImg = grain.createImageData(160, 90);
let last = performance.now(), grainT = 0;
function loop(now) { requestAnimationFrame(loop); if (PLAT.pular(now)) return; const dt = Math.min(.05, (now - last) / 1000); last = now; frame(dt); }
function frame(dt) {
  { const r = PLAT.antes(Math.min(.05, dt)); dt = Math.min(VIS.tempo(r), SUST.escala(r), JP.tempo(r)); } // congelamentos curtos do golpe e câmera lenta do "por um fio" (src/visual-polimento.js, src/sustos-plataforma.js, src/jogabilidade-polimento.js): cada um corre sobre o dt real e vale o mais forte
  perf += dt;
  const jogando = mode === 'jogo' && !ui && S && !S.dead && !S.fim;
  const ativo = jogando && (locked || window.__teste || PLAT.semMouse());
  $('#clique').hidden = !(jogando && !locked && !window.__teste && !PLAT.semMouse());
  if (mode === 'titulo') {
    const t = perf * .05, sp = W.def.spawns.titulo;
    camera.position.set(sp.x + Math.sin(t) * 2, 1.7, sp.z + Math.cos(t * .7)); camera.rotation.set(.03, (sp.yaw || 0) + Math.sin(t * .6) * .2, 0);
    flash.intensity = 0; flashFill.intensity = 0; P.pos.set(camera.position.x, 0, camera.position.z); P.room = roomAt(P.pos.x, P.pos.z);
    updateClima(dt); for (const f of W.tick) f(dt);
  } else if (mode === 'cena') {
    updateCena(dt); updateClima(dt); updateAudio(dt);
  } else if (ativo) {
    S.tempo += dt; S.capT += dt; PG.tick(dt);
    updatePlayer(dt); updateLanterna(dt); updateFear(dt);
    { const dm = dt * JP.ritmo(); if (!congelado(dm)) { updateInspetor(dm); updateAna(dm); updateProcissao(dm); ML.tick(dm); } updateEventos(dm); } updateGarrafas(dt); // ritmo do mundo (acessibilidade): a Lia não fica mais lenta
    updateClima(dt); updateJogabilidade(dt); updateAlvo(); JM.update(dt); updateSegurar(dt); updateFita(dt); updateHUD(); updateSub(dt); updateAudio(dt); H.tick(dt);
  } else if (mundoVivo()) { // cofre, quadro (e no Pesadelo notas e diário): o mundo continua, com o som abafado
    S.tempo += dt; S.capT += dt; P.noiseR = 0; abafar(true);
    updateLanterna(dt); updateFear(dt);
    { const dm = dt * JP.ritmo(); if (!congelado(dm)) { updateInspetor(dm); updateAna(dm); updateProcissao(dm); ML.tick(dm); } updateEventos(dm); } updateGarrafas(dt); // ritmo do mundo (acessibilidade): a Lia não fica mais lenta
    updateClima(dt); updateFita(dt); updateHUD(); updateSub(dt); updateAudio(dt);
  } else if (mode === 'jogo' && S && S.dead) updateAudio(dt);
  UIX.frame(dt, ativo);
  for (const d of W.doors) { d.ang = lerp(d.ang, d.target, Math.min(1, dt * (d.vel || 7))); d.pivot.rotation.y = d.ang + (d.qOff || 0); } // velocidade conforme o passo e quique no batente
  grainT -= dt;
  if (grainT <= 0) { grainT = PLAT.grao(); const d = grainImg.data; for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } grain.putImageData(grainImg, 0, 0); }
  VIS.update(dt, ativo); VM.update(dt, ativo);
  PLAT.depois(dt, ativo);
  const cortados = cortarNevoa(); renderer.render(scene, camera); for (const o of cortados) o.layers.enable(0); VM.depois(); VIS.depois(); // VIS.depois: a mão da Lia por cima
}
// Revisão do lote 2: o lote 2 quase dobrou os objetos de cada mapa. Dentro de casa e nos túneis, o que está além da
// névoa (sobra menos de 0,4% da cor, invisível de qualquer jeito) sai só deste desenho. Ao ar livre nada muda: no
// clarão do relâmpago o céu fica mais claro que a névoa e as silhuetas distantes precisam continuar lá.
const _cortados = [], _cortV = new THREE.Vector3();
function cortarNevoa() {
  _cortados.length = 0;
  if (!W.grupo || !scene.fog || luzBase > .02 || mode === 'titulo') return _cortados;
  const lim = 2.4 / Math.max(.01, scene.fog.density);
  W.grupo.traverseVisible(o => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || !o.frustumCulled || (o.material && o.material.fog === false)) return;
    const g = o.geometry; if (!g) return; if (!g.boundingSphere) g.computeBoundingSphere();
    const e = o.matrixWorld.elements, k = Math.sqrt(Math.max(e[0] * e[0] + e[1] * e[1] + e[2] * e[2], e[4] * e[4] + e[5] * e[5] + e[6] * e[6], e[8] * e[8] + e[9] * e[9] + e[10] * e[10]));
    _cortV.copy(g.boundingSphere.center).applyMatrix4(o.matrixWorld);
    if (_cortV.distanceTo(camera.position) - g.boundingSphere.radius * k > lim) { o.layers.disable(0); _cortados.push(o); }
  });
  return _cortados;
}
requestAnimationFrame(loop);

PLAT.instalar({ THREE, renderer, scene, camera, flash, chuva, chuvaGeo, NCH, P, M, ANA, PROC, W, keys, OPT, SOM, AMB, R, AG, conquista, lsGet, lsSet, SAVE_KEY, CAPS_KEY, CONQ_KEY, onKey, toast, abrirPausa, fecharPausa, entrarJogo, carregarSnap, iniciarAudio, lockPointer, unlock, roomAt, setOpt, entrarMaisPerto, SFX, get chamado() { return chamadoArmadilha; }, get alvo() { return alvo; }, get S() { return S; }, get ui() { return ui; }, get mode() { return mode; }, get locked() { return locked; }, get AC() { return AC; }, get master() { return master; } });
window.__jogo = { get S() { return S; }, P, M, ANA, PROC, W, frame, carregarMapa, objDone, iniciarProcissao, spawnAna, ativarInspetor, camera, renderer, scene, hemi, moon, salvarCheckpoint, carregarSnap, lerNota, tocarFita, pularCena, roomAt, get ui() { return ui; }, get mode() { return mode; }, get alvo() { return alvo; }, keys, onKey, novoEstado: d => { S = novoEstado(d); return S; } };
