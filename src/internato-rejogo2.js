// INTERNATO — REJOGABILIDADE II (Lote 6, segunda leva)
// Desafios, variações por semente, conquistas, recordes e segredos que só aparecem na segunda jogada,
// no térreo (Capítulos I e II) e no andar dos dormitórios (Capítulo III).
// Complementa src/internato-rejogo.js; ganchos chamados por terreo()/superior() em mapas.js (juntar).
// Tudo procedural (canvas, caixas, som do motor). Nenhum colisor novo perto de portas; nada obriga a voltar;
// os objetivos continuam nos mesmos lugares e com os mesmos rótulos (T.tudo() segue valendo).

const LS = 'hora-silencio-l6b';
const LS_OLD = 'hora-silencio-l6';
const CONQ = 'hora-silencio-v2-conq';
const lerJ = k => { try { return JSON.parse(localStorage.getItem(k) || '{}') || {}; } catch (e) { return {}; } };
const ler = () => lerJ(LS);
const lerOld = () => lerJ(LS_OLD);
const mexer = fn => { const o = ler(); try { fn(o); localStorage.setItem(LS, JSON.stringify(o)); } catch (e) {} return o; };
const nFinais = () => { const c = lerJ(CONQ); return ['final_comum', 'final_silencio', 'final_verdadeiro'].filter(k => c[k]).length; };
const agora = () => (window.__l6bHora ? new Date(window.__l6bHora) : new Date());
const dois = n => ('0' + n).slice(-2);

function rngDe(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

export const conquistas = [
  { id: 'l6b_307', nome: 'Três e Sete', desc: 'Esteja no internato quando o relógio de verdade marcar 03:07.', secreta: true },
  { id: 'l6b_licao', nome: 'Lição Feita', desc: 'Resolva a lição de casa escrita na lousa.' },
  { id: 'l6b_silencio', nome: 'Silêncio de Recepção', desc: 'Toque a campainha e aguente 60 segundos sem correr.' },
  { id: 'l6b_erros', nome: 'Sete Erros', desc: 'Aponte o quadro que mudou de lugar na rejogada.', secreta: true },
  { id: 'l6b_corredor', nome: 'Corredor Sem Fim', desc: 'Atravesse a porta do fundo do corredor leste quatro vezes.', secreta: true },
  { id: 'l6b_proibida', nome: 'Fita Zebrada', desc: 'Entre na sala interditada e leve a polaroide.' },
  { id: 'l6b_fantasma', nome: 'Sala 13', desc: 'Entre no cômodo que só existe no escuro.', secreta: true },
  { id: 'l6b_loira', nome: 'Chamar Três Vezes', desc: 'Chame por ela diante dos espelhos do banheiro.', secreta: true },
  { id: 'l6b_dobrada', nome: 'Casa Dobrada', desc: 'Termine o Capítulo I com o corredor oeste livre e com a estante caída.' },
  { id: 'l6b_dado', nome: 'Dado de Osso', desc: 'Jogue o dado de osso do Tomé.' },
  { id: 'l6b_ouvido', nome: 'Ouvido Atento', desc: 'Ache a cama onde alguém respira de verdade.', secreta: true },
  { id: 'l6b_luzes', nome: 'Pisca-pisca', desc: 'Decifre o código das luzes do corredor oeste.' }
];
(function registrar() {
  try { const R = window.ROTEIRO; if (R && R.conquistas) for (const c of conquistas) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c); } catch (e) {}
})();

// nota dinâmica (secreta: não entra na conta de lore do jogo)
function nota(id, titulo, texto) {
  try {
    const R = window.ROTEIRO; const n = R.notas.find(x => x.id === id);
    if (n) { n.titulo = titulo; n.texto = texto; } else R.notas.push({ id, secreta: true, titulo, texto });
  } catch (e) {}
}

// ---------------------------------------------------------------- base comum
function base(A, S, mapa) {
  const { THREE, MAT } = A;
  const seedStr = (S.semente || 'SEMCOD') + '|' + (S.dif || 'normal') + '|b';
  const ng = nFinais() > 0 || !!S.replay;
  const rnd = salt => rngDe(seedStr + '|' + mapa + '|' + salt)();
  const esc = (salt, n) => Math.floor(rnd(salt) * n);
  const P = A.P;
  const dist = (x, z) => Math.hypot(P.pos.x - x, P.pos.z - z);
  const sala = () => { const r = A.roomAt(P.pos.x, P.pos.z); return r ? r.id : null; };
  const som = (k, ...a) => { try { A.SFX[k](...a); } catch (e) {} };
  const avisados = new Set();
  const tick = fn => A.W.tick.push(dt => { try { fn(dt); } catch (e) { if (!avisados.has(fn)) { avisados.add(fn); console.warn('l6b', e && e.message); } } });
  const F = (nome, fn) => { try { fn(); } catch (e) { console.warn('l6b ' + nome, e && e.message); } };
  const _v = new THREE.Vector3(), _f = new THREE.Vector3();
  const olhando = (x, y, z, cos = .85, alc = 10) => {
    _v.set(x, y, z).sub(A.camera.position); const d = _v.length(); if (d > alc || d < .01) return false;
    A.camera.getWorldDirection(_f); return _f.dot(_v.multiplyScalar(1 / d)) > cos;
  };
  const placa = (linhas, x, y, z, w, h, ry, opts) => {
    const m = A.plano(w, h, new THREE.MeshStandardMaterial({ map: A.textoTex(linhas, opts), roughness: .9, transparent: true }), x, y, z, ry);
    m.userData.leitura = { t: linhas.map(l => l.t ?? l).join(' · ') };
    return m;
  };
  // painel vivo: canvas que pode ser redesenhado (relógio, monitores, rosto)
  const painel = (w, h, draw) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
    const redraw = () => { draw(g, w, h); tex.needsUpdate = true; };
    redraw(); return { tex, redraw };
  };
  const acao = (obj, label, act, extra) => A.interact(obj, typeof label === 'function' ? label : () => label, act, extra);
  const lia = t => A.sub('lia', t);
  const silhueta = (x, z, s = 1) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); const m = new THREE.MeshBasicMaterial({ color: 0x040404 });
    const corpo = new THREE.Mesh(new THREE.CylinderGeometry(.16 * s, .22 * s, 1.1 * s, 8), m); corpo.position.y = .65 * s; g.add(corpo);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.13 * s, 8, 6), m); cab.position.y = 1.35 * s; g.add(cab);
    A.W.grupo.add(g); return g;
  };
  // pilha ganha de graça (sem item no chão)
  const darPilha = () => { S.inv.pilhas++; A.toast('Pilhas guardadas. R para trocar.'); som('pegar'); };
  const darKit = () => { S.inv.kits++; A.toast('Curativo guardado. H para usar.'); som('pegar'); };
  return { seedStr, ng, rnd, esc, dist, sala, som, tick, F, olhando, placa, painel, acao, lia, silhueta, darPilha, darKit, P };
}

// ---------------------------------------------------------------- desenhos de criança (Moacir)
const FRASES_MOACIR = [
  'Uma casa torta, com uma janela só. Alguém desenhou fumaça sem chaminé.',
  'Um sino enorme. Embaixo, bem pequeno: "ele toca sozinho".',
  'Uma porta sem maçaneta. O lápis apertou tanto que furou o papel.',
  'Um homem muito alto, sem rosto. Um chaveiro enorme na cintura.',
  'Um menino dentro de um armário. Do lado de fora, o homem alto, de costas.',
  'Três crianças de mãos dadas. Uma delas foi riscada com força.',
  'Fogo. Muito fogo. As crianças desenhadas pequenas, longe da porta.',
  'Uma cama com um volume embaixo do lençol. Dá para ver que respira.',
  'Chaves. Muitas. Uma delas pintada de vermelho.',
  'Uma escada que sobe sem chegar a lugar nenhum.',
  'Um relógio parado em três e sete.',
  'Uma menina com uma lanterna. Tem o meu nome embaixo. Escrito errado, mas é o meu.'
];
function desenhoMoacir(i) {
  return (g, w, h) => {
    g.fillStyle = '#d8cdb0'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(90,70,40,${Math.random() * .08})`; g.fillRect(Math.random() * w, Math.random() * h, 20, 1); }
    g.strokeStyle = '#3a3a52'; g.fillStyle = '#3a3a52'; g.lineWidth = 3; g.lineCap = 'round';
    const L = (a, b, c, d) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); };
    const C = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.stroke(); };
    const pessoa = (x, y, s = 1, rosto = true) => { if (rosto) C(x, y - 34 * s, 9 * s); else { g.beginPath(); g.arc(x, y - 34 * s, 9 * s, 0, 6.2832); g.fill(); } L(x, y - 25 * s, x, y + 10 * s); L(x - 14 * s, y - 10 * s, x + 14 * s, y - 10 * s); L(x, y + 10 * s, x - 10 * s, y + 32 * s); L(x, y + 10 * s, x + 10 * s, y + 32 * s); };
    switch (i) {
      case 0: L(40, 150, 40, 90); L(40, 90, 90, 50); L(90, 50, 140, 90); L(140, 90, 140, 150); L(40, 150, 140, 150); g.strokeRect(75, 105, 28, 45); break;
      case 1: C(90, 95, 42); L(48, 95, 132, 95); L(90, 53, 90, 30); C(90, 142, 8); break;
      case 2: g.strokeRect(55, 30, 70, 125); L(60, 35, 120, 150); break;
      case 3: pessoa(90, 100, 1.6, false); for (let k = 0; k < 5; k++) C(110 + k * 6, 115, 4); break;
      case 4: g.strokeRect(40, 30, 70, 130); L(75, 30, 75, 160); pessoa(58, 112, .5); pessoa(140, 100, 1.2, false); break;
      case 5: pessoa(45, 105, .8); pessoa(90, 105, .8); pessoa(135, 105, .8); L(45, 95, 90, 95); L(90, 95, 135, 95); L(25, 60, 65, 150); break;
      case 6: g.strokeStyle = '#8a3a1a'; for (let k = 0; k < 6; k++) { L(30 + k * 22, 160, 40 + k * 22, 90 - (k % 3) * 20); L(40 + k * 22, 90 - (k % 3) * 20, 50 + k * 22, 160); } break;
      case 7: g.strokeRect(30, 100, 120, 40); L(30, 140, 30, 160); L(150, 140, 150, 160); g.beginPath(); g.ellipse(95, 90, 35, 15, 0, 0, 6.2832); g.stroke(); break;
      case 8: for (let k = 0; k < 4; k++) { C(40 + k * 35, 70 + (k % 2) * 40, 12); L(40 + k * 35, 82 + (k % 2) * 40, 40 + k * 35, 130); } g.strokeStyle = '#a02020'; C(75, 110, 14); break;
      case 9: for (let k = 0; k < 7; k++) { L(30 + k * 20, 160 - k * 18, 50 + k * 20, 160 - k * 18); L(50 + k * 20, 160 - k * 18, 50 + k * 20, 142 - k * 18); } break;
      case 10: C(90, 90, 48); L(90, 90, 90, 55); L(90, 90, 105, 100); for (let k = 0; k < 12; k++) { const a = k / 12 * 6.2832; L(90 + Math.sin(a) * 40, 90 - Math.cos(a) * 40, 90 + Math.sin(a) * 46, 90 - Math.cos(a) * 46); } break;
      default: pessoa(60, 105, 1); L(75, 95, 110, 85); g.strokeStyle = '#a0902a'; L(110, 85, 160, 60); L(110, 85, 160, 110); L(110, 85, 165, 85);
    }
    g.fillStyle = 'rgba(60,40,30,.8)'; g.font = '12px Georgia'; g.textAlign = 'right'; g.fillText('M. ' + (i + 1), w - 8, h - 8);
  };
}

// ---------------------------------------------------------------- goteiras (poças que aumentam o ruído) e acústica por sala
function goteiras(A, S, B, pts, n, chave) {
  const { THREE } = A;
  const ordem = pts.map((p, i) => [p, B.rnd(chave + i)]).sort((a, b) => a[1] - b[1]).slice(0, n).map(x => x[0]);
  const mat = new THREE.MeshStandardMaterial({ color: 0x07100c, roughness: .04, metalness: .6, transparent: true, opacity: .62 });
  const pocas = ordem.map(p => { const m = A.plano(1.3, 1.0, mat, p[0], .025, p[1], 0); m.rotation.x = -Math.PI / 2; return { x: p[0], z: p[1], t: 1 + Math.random() * 3 }; });
  let dentro = -1;
  B.tick(dt => {
    for (const q of pocas) { q.t -= dt; if (q.t <= 0) { q.t = 2.5 + Math.random() * 3; if (B.dist(q.x, q.z) < 13) B.som('gota', { x: q.x, y: 2.5, z: q.z }); } }
    const k = pocas.findIndex(q => Math.abs(B.P.pos.x - q.x) < .75 && Math.abs(B.P.pos.z - q.z) < .6);
    if (k >= 0 && k !== dentro) { B.som('gota', { x: pocas[k].x, y: .1, z: pocas[k].z }); B.som('tabua', { x: pocas[k].x, z: pocas[k].z }, .5, 'ladrilho'); }
    dentro = k;
  });
  return () => (dentro >= 0 ? 1.7 : 1);
}
function acustica(A, S, B, ecos, abaf, chave) {
  const { THREE, MAT } = A;
  const e = ecos[B.esc(chave + 'e', ecos.length)];
  const rest = abaf.filter(x => x !== e); const a = rest[B.esc(chave + 'a', rest.length)];
  const centro = id => { const r = A.SALA(id); return r ? [(r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2, r] : null; };
  const ce = centro(e), ca = centro(a);
  if (ce) { const m = A.plano(2.4, 2.4, new THREE.MeshStandardMaterial({ color: 0xb8c4bf, roughness: .2, metalness: .3, transparent: true, opacity: .45 }), ce[0], .024, ce[1], 0); m.rotation.x = -Math.PI / 2; } // piso de azulejo claro no meio do eco
  if (ca) { const m = A.plano(2.6, 1.7, new THREE.MeshStandardMaterial({ color: 0x4a1a1a, roughness: 1 }), ca[0], .026, ca[1], 0); m.rotation.x = -Math.PI / 2; } // tapete que abafa
  let ant = null;
  B.tick(() => {
    const s = B.sala(); if (s === ant) return; ant = s;
    if (s === e && ce) B.som('gota', { x: ce[0], y: 1, z: ce[1] });
    if (s === a && ca) B.som('papel');
  });
  return () => { const s = B.sala(); return s === e ? 2 : s === a ? .5 : 1; };
}

// ---------------------------------------------------------------- A casa envelhece (mofo a cada 5 noites)
function mofo(A, B, noites, pts) {
  const { THREE } = A;
  const k = Math.min(pts.length, Math.floor(noites / 5) * 3); if (k <= 0) return;
  const tex = A.canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(24,34,18,.75)'); gr.addColorStop(.6, 'rgba(30,40,22,.38)'); gr.addColorStop(1, 'rgba(30,40,22,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  for (let i = 0; i < k; i++) { const p = pts[i]; A.plano(1.6, 1.4, mat, p[0], p[1], p[2], p[3]); }
}

// =====================================================================
// TÉRREO — Capítulos I e II
// =====================================================================
export function rejogo2Terreo(A, S, ctx = {}) {
  const { THREE, MAT, box, cyl, SFX } = A;
  const B = base(A, S, 'terreo');
  const { F, tick, som, lia, placa, painel, acao, dist, sala } = B;
  const grupo = A.W.grupo, P = A.P;
  const old = lerOld(), L = ler();
  const noites = Math.max(1, (old.noites || 0) + (S.flags._l6noite ? 0 : 1));
  const dia = agora();
  const salasLat = ['biblio', 'lavand', 'banh']; // salas laterais fora do caminho
  const ord = salasLat.map((id, i) => [id, B.rnd('lat' + i)]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
  const [salaEvento, salaProibida, salaEmperrada] = ord;
  const portaCorr = { biblio: { x: -27, z: -10.12, ry: Math.PI }, lavand: { x: 11, z: -13.88, ry: 0 }, banh: { x: 20, z: -13.88, ry: 0 } };
  const visitadas = new Set();
  const estanteOn = B.esc('estante', 2) === 1;
  const mulFns = [];
  const X = {};

  // [1-3] relógio de pêndulo do hall com a hora de verdade do computador
  F('relogio', () => {
    const pn = painel(256, 384, (g, w, h) => {
      const d = agora(), hh = d.getHours(), mm = d.getMinutes(), ss = d.getSeconds();
      g.fillStyle = '#1a120b'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3b2a1a'; g.lineWidth = 10; g.strokeRect(6, 6, w - 12, h - 12);
      const cx = w / 2, cy = h * .32, r = w * .36;
      g.fillStyle = '#cdbf9f'; g.beginPath(); g.arc(cx, cy, r, 0, 6.2832); g.fill(); g.strokeStyle = '#2a2016'; g.lineWidth = 4; g.stroke();
      for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832; g.beginPath(); g.moveTo(cx + Math.sin(a) * r * .84, cy - Math.cos(a) * r * .84); g.lineTo(cx + Math.sin(a) * r * .95, cy - Math.cos(a) * r * .95); g.stroke(); }
      const mao = (ang, len, larg, cor) => { g.strokeStyle = cor; g.lineWidth = larg; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(ang) * len, cy - Math.cos(ang) * len); g.stroke(); };
      mao(((hh % 12) + mm / 60) / 12 * 6.2832, r * .5, 8, '#1a1008'); mao((mm + ss / 60) / 60 * 6.2832, r * .78, 5, '#1a1008'); mao(ss / 60 * 6.2832, r * .85, 2, '#8a1a12');
      g.fillStyle = '#9b8a62'; g.font = 'bold 38px Georgia'; g.textAlign = 'center'; g.fillText(`${dois(hh)}:${dois(mm)}`, cx, h * .66);
      g.strokeStyle = '#6b5a2f'; g.lineWidth = 3; const px = cx + Math.sin(ss * 3.14159) * 18; g.beginPath(); g.moveTo(cx, h * .7); g.lineTo(px, h * .9); g.stroke(); g.fillStyle = '#6b5a2f'; g.beginPath(); g.arc(px, h * .92, 14, 0, 6.2832); g.fill();
    });
    const m = A.plano(.8, 1.2, new THREE.MeshStandardMaterial({ map: pn.tex, roughness: .8 }), .2, 1.9, -13.86, 0);
    m.userData.leitura = { t: 'Relógio de pêndulo da recepção' };
    let t = 0;
    tick(dt => {
      t -= dt; if (t > 0) return; t = 1; if (dist(0, -10) < 24) pn.redraw();
      const d = agora(), hh = d.getHours(), mm = d.getMinutes();
      // [2] meia-noite: batida a mais e um bilhete
      if (hh === 0 && mm < 10 && !S.flags.l6b_meia && dist(0, -9) < 16) {
        S.flags.l6b_meia = true; som('sino', .55, { x: 0, y: 3, z: -13 }, .94);
        nota('l6b_meia', 'Bilhete debaixo do relógio', 'Meia-noite. O relógio bate uma vez a mais, e quem joga a essa hora ele escuta melhor.\n\nNão corra enquanto o pêndulo estiver parado.\n— D.');
        setTimeout(() => A.toast('O relógio bateu uma vez a mais. Há um bilhete preso debaixo dele.'), 1200);
        setTimeout(() => A.sub('davi', 'zero hora. ele escuta melhor agora. nao corre.'), 3200);
      }
      // [3] 03:07 de verdade
      if (hh === 3 && mm === 7 && !S.flags.l6b_307) {
        S.flags.l6b_307 = true; A.conquista('l6b_307'); som('sino', .7, { x: 0, y: 3, z: -13 }, .9);
        setTimeout(() => lia('São três e sete. Aqui. De verdade. A hora que o relógio parou na foto.'), 1500);
      }
    });
  });

  // [4] lousa que conta o que você fez; [5-7] lição de casa com gaveta
  F('lousa', () => {
    let escondeu = L.esc2 || 0, corr = L.correu || 0;
    const rel = painel(384, 192, (g, w, h) => {
      g.fillStyle = '#101510'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(220,230,210,.12)'; for (let i = 0; i < 5; i++) g.fillRect(0, 20 + i * 38, w, 3);
      g.fillStyle = '#cfd8c0'; g.textAlign = 'left'; g.font = 'italic 22px Georgia'; g.fillText('Relatório da aluna Lia', 22, 34);
      g.font = '19px Georgia';
      const mortes = (old.mortesTerreo || 0) + (old.mortesSuperior || 0);
      [`escondeu-se ${escondeu} vezes`, `correu por ${corr | 0} segundos`, `deixou a Ana contar até ${Math.min(10, mortes) || 'nada ainda'}`, `${noites}ª noite no internato`].forEach((t, i) => g.fillText(t, 22, 72 + i * 30));
      g.font = 'italic 14px Georgia'; g.fillStyle = 'rgba(207,216,192,.55)'; g.fillText('— conferido pelo Inspetor', 22, h - 14);
    });
    const m = A.plano(2.6, 1.3, new THREE.MeshStandardMaterial({ map: rel.tex, roughness: .9 }), -17.2, 1.7, -9.88, 0);
    m.userData.leitura = { t: 'Lousa: relatório macabro da aluna Lia' };
    let hAnt = null, t = 0, flush = 0;
    tick(dt => {
      if (S.hidden && !hAnt) { escondeu++; mexer(o => { o.esc2 = (o.esc2 || 0) + 1; }); } hAnt = S.hidden;
      if (P.sprinting) { corr += dt; flush += dt; if (flush > 8) { flush = 0; const v = corr; mexer(o => { o.correu = v; }); } }
      t -= dt; if (t <= 0) { t = 1.5; if (dist(-17, -9) < 12) rel.redraw(); }
    });
    // lição de casa: conta sorteada entre 24
    const idx = B.esc('licao', 24), a = 3 + (idx * 5) % 7, b = 2 + (idx * 3) % 8, tp = idx % 6;
    const [txt, resp] = tp === 0 ? [`${a} × ${b} = ?`, a * b] : tp === 1 ? [`${a * b} ÷ ${b} = ?`, a] : tp === 2 ? [`${a * b} − ${a} = ?`, a * b - a] : tp === 3 ? [`metade de ${(a + b) * 2}`, a + b] : tp === 4 ? [`${a}, ${a + b}, ${a + 2 * b}, ?`, a + 3 * b] : [`dobro de ${a + b} = ?`, (a + b) * 2];
    const lic = placa([{ t: 'LIÇÃO DE CASA', tam: 22, estilo: 'bold' }, { t: txt, tam: 34 }, { t: 'gaveta embaixo da lousa', tam: 13, estilo: 'italic' }], -9.2, 1.6, -9.88, 2.0, 1.1, 0, { fundo: '#101510', cor: '#cfd8c0', manchas: 2 });
    const gav = box(.8, .3, .5, MAT.madeiraEsc, -9.2, .85, -9.7, grupo, false);
    let erros = 0;
    const resolvida = () => !!S.flags.l6b_licao;
    const quebrada = () => erros >= 3 || !!S.flags.l6b_giz;
    acao(lic, () => resolvida() ? 'A gaveta da lousa está aberta e vazia.' : quebrada() ? 'O giz quebrou. A lição ficou sem resposta.' : '<b>E</b>Resolver a lição de casa da lousa', () => {
      if (resolvida() || quebrada()) return;
      A.abrirTeclado('LIÇÃO DE CASA', String(resp), () => {
        S.flags.l6b_licao = true; mexer(o => { o.licoes = (o.licoes || 0) + 1; }); A.conquista('l6b_licao'); som('pegar');
        if (B.rnd('gaveta') < .5) B.darPilha(); else B.darKit(); // [7] a gaveta dá uma pilha ou um curativo
        lia('Certo. A gaveta soltou sozinha. Uma coisa útil lá dentro.'); gav.position.z = -9.45;
      }, () => {
        erros++; som('trancado');
        if (erros >= 3) { S.flags.l6b_giz = true; som('estalo', -9, -9); som('vidro', -9, -9); A.emitNoise(-9.2, -9, 9); A.toast('O giz quebra no quadro. Alto demais.'); } // [6] errou três vezes: o giz quebra com barulho
      });
    });
    if (resolvida()) gav.position.z = -9.45;
  });

  // [8-9] mesa posta no refeitório: um prato por noite jogada e um vazio por morte
  F('pratos', () => {
    const mesa = new THREE.Group(); grupo.add(mesa);
    box(5.4, .08, .8, MAT.madeiraEsc, -20.6, .78, -15.7, mesa, false);
    const n = Math.min(12, noites), vazios = Math.min(6, (old.mortesTerreo || 0) + (old.mortesSuperior || 0));
    const claro = new THREE.MeshStandardMaterial({ color: 0xcfc6b0, roughness: .5 }), escuro = new THREE.MeshStandardMaterial({ color: 0x1b1712, roughness: .7 });
    for (let i = 0; i < n + vazios; i++) {
      const vazio = i >= n, x = -22.9 + i * .38;
      cyl(.13, .12, .02, vazio ? escuro : claro, x, .83, -15.7, 12, mesa);
      const col = box(.02, .012, .1, MAT.metal, x + .1, .84, -15.7, mesa, false); col.rotation.y = vazio ? 0 : 1.2; // colher virada
    }
    mesa.children.forEach(c => { c.userData.leitura = { t: `Mesa posta: ${n} pratos, um por noite. ${vazios ? vazios + ' vazios.' : ''}` }; });
  });

  // [10-12, 78] vitrine de troféus: medalhas por capítulo, placa da aluna, canecas por final e selos
  F('vitrine', () => {
    const g0 = new THREE.Group(); g0.position.set(5.5, 0, -8.3); grupo.add(g0);
    box(.35, 1.5, 1.9, MAT.madeiraEsc, 0, 1.45, 0, g0, false);
    const vidro = new THREE.Mesh(new THREE.BoxGeometry(.04, 1.3, 1.7), new THREE.MeshStandardMaterial({ color: 0x9ab8b0, transparent: true, opacity: .16, roughness: .05 })); vidro.position.set(-.18, 1.45, 0); g0.add(vidro);
    const tempos = [old.recI, old.recII, old.recIII];
    const cores = [0xd4af37, 0xc0c0c0, 0xcd7f32], morta = 0x3a3630;
    tempos.forEach((t, i) => {
      const cor = t == null ? morta : t < 300 ? cores[0] : t < 480 ? cores[1] : cores[2];
      const med = cyl(.1, .1, .02, new THREE.MeshStandardMaterial({ color: cor, metalness: .7, roughness: .35, emissive: t == null ? 0 : 0x201808, emissiveIntensity: .6 }), -.16, 1.95, -.6 + i * .3, 14, g0); med.rotation.z = Math.PI / 2;
      cyl(.012, .012, .12, MAT.preto, -.16, 2.07, -.6 + i * .3, 5, g0);
    });
    const total = tempos.every(t => t != null) ? tempos.reduce((s, t) => s + t, 0) : null;
    const pl = placa([{ t: 'ALUNA LIA', tam: 26, estilo: 'bold' }, { t: total == null ? 'sem tempo ainda' : `${Math.floor(total / 60)}:${dois(total % 60)}`, tam: 30 }], 5.3, 1.55, -8.3, .9, .5, -Math.PI / 2, { fundo: '#241b10', cor: '#d4b86a', manchas: 2 });
    const fin = nFinais();
    for (let i = 0; i < 3; i++) { // canecas: uma por final alcançado
      const tem = i < fin, mat = new THREE.MeshStandardMaterial({ color: tem ? 0xb09a68 : 0x2a2620, metalness: tem ? .6 : .1, roughness: .5 });
      cyl(.06, .05, .1, mat, -.12, 1.17, -.6 + i * .3, 10, g0); const al = new THREE.Mesh(new THREE.TorusGeometry(.03, .008, 5, 8), mat); al.position.set(-.12, 1.17, -.54 + i * .3); g0.add(al);
    }
    const selos = Math.min(7, L.selos || 0);
    for (let i = 0; i < selos; i++) cyl(.025, .025, .006, new THREE.MeshStandardMaterial({ color: 0xd4af37, emissive: 0x302000, emissiveIntensity: .8 }), -.17, .93, -.75 + i * .12, 6, g0).rotation.z = Math.PI / 2;
    g0.traverse(o => { o.userData.leitura = { t: 'Vitrine de troféus da escola' }; });
    acao(g0, '<b>E</b>Olhar a vitrine de troféus', () => {
      const nom = ['I', 'II', 'III'].map((r, i) => tempos[i] == null ? null : `${r}: ${tempos[i] | 0}s`).filter(Boolean).join(' · ');
      lia(nom ? `Meus tempos aqui: ${nom}. ${fin ? fin + ' caneca(s) acesa(s).' : 'Nenhuma caneca ainda.'} ${selos ? selos + ' selo(s) de atenção.' : ''}` : 'Medalhas apagadas. Elas só acendem quando eu termino um capítulo.');
    });
  });

  // [13-14] os desenhos de Moacir, um por noite jogada (o décimo segundo mostra a Lia)
  F('moacir', () => {
    const xs = [-8.4, -10.4, -16, -18, -20, -22, -24, -25.4, -29, -30.6, -32, -33.4];
    const n = Math.min(12, noites);
    for (let i = 0; i < n; i++) {
      const pn = painel(180, 180, desenhoMoacir(i));
      const m = A.plano(.46, .46, new THREE.MeshBasicMaterial({ map: pn.tex }), xs[i], 1.45 + (i % 2) * .12, -10.07, Math.PI); m.rotation.z = (B.rnd('mz' + i) - .5) * .1;
      m.material.color.setScalar(.55);
      m.userData.leitura = { t: 'Desenho de criança, a lápis' };
      acao(m, `<b>E</b>Olhar o desenho ${i + 1} de 12`, () => { lia(FRASES_MOACIR[i]); if (i === 11) A.conquista('l6_moacir'); });
    }
    if (n > (L.desenhos || 0)) { mexer(o => { o.desenhos = n; }); setTimeout(() => A.toast(`Um desenho novo na parede do corredor oeste (${n} de 12).`), 4200); }
  });

  // [15-19] o corredor que se repete: porta do fundo do corredor leste, só depois do primeiro final
  F('repete', () => {
    if (!B.ng) return;
    const porta = box(.12, 2.0, 1.0, MAT.madeiraEsc, 33.9, 1.0, -12, grupo, false);
    box(.05, .14, .06, MAT.bronze, 33.82, 1.0, -11.65, grupo, false);
    let volta = S.flags.l6b_volta || 0, pendR = false;
    // retratos (faces → de costas na 2ª passagem)
    const retr = [14, 17, 23, 32].map((x, i) => {
      const rosto = A.canvasTex(96, 128, (g, w, h) => { g.fillStyle = '#17120c'; g.fillRect(0, 0, w, h); g.fillStyle = '#9b8a62'; g.beginPath(); g.ellipse(48, 56, 22, 28, 0, 0, 6.2832); g.fill(); g.fillStyle = '#17120c'; g.fillRect(36, 50, 7, 5); g.fillRect(54, 50, 7, 5); g.fillRect(40, 72, 16, 3); g.fillStyle = '#9b8a62'; g.fillRect(24, 100, 48, 28); });
      const costas = A.canvasTex(96, 128, (g, w, h) => { g.fillStyle = '#17120c'; g.fillRect(0, 0, w, h); g.fillStyle = '#1e1a14'; g.beginPath(); g.ellipse(48, 56, 24, 30, 0, 0, 6.2832); g.fill(); g.strokeStyle = '#33291c'; g.lineWidth = 2; for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(34 + k * 4, 34); g.lineTo(30 + k * 6, 84); g.stroke(); } g.fillStyle = '#2a2318'; g.fillRect(24, 100, 48, 28); });
      const m = A.plano(.5, .66, new THREE.MeshBasicMaterial({ map: rosto }), x, 1.5, -13.94, 0); m.material.color.setScalar(.6);
      m.userData = { ...m.userData, rosto, costas };
      return m;
    });
    // portas que sangram (3ª passagem em diante) e relógio que anda para trás
    const sangue = A.canvasTex(64, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(120,10,10,.85)'); gr.addColorStop(1, 'rgba(120,10,10,0)'); g.fillStyle = gr; for (let k = 0; k < 6; k++) g.fillRect(6 + k * 9, 0, 3 + (k % 3), 50 + (k * 37) % 70); });
    const sang = [[8, -10.06, Math.PI], [26, -10.06, Math.PI], [11, -13.94, 0], [20, -13.94, 0], [29, -13.94, 0]].map(p => { const m = A.plano(.9, 2, new THREE.MeshBasicMaterial({ map: sangue, transparent: true, depthWrite: false }), p[0], 1.1, p[1], p[2]); m.visible = false; return m; });
    const rev = painel(256, 256, (g, w, h) => {
      const d = agora(), hh = d.getHours(), mm = d.getMinutes(), ss = d.getSeconds();
      g.fillStyle = '#1a120b'; g.fillRect(0, 0, w, h); g.fillStyle = '#cdbf9f'; g.beginPath(); g.arc(128, 128, 100, 0, 6.2832); g.fill();
      const mao = (ang, len, larg, cor) => { g.strokeStyle = cor; g.lineWidth = larg; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 - Math.sin(ang) * len, 128 - Math.cos(ang) * len); g.stroke(); };
      mao(((hh % 12) + mm / 60) / 12 * 6.2832, 50, 8, '#1a1008'); mao((mm + ss / 60) / 60 * 6.2832, 78, 5, '#1a1008'); mao(ss / 60 * 6.2832, 88, 2, '#8a1a12');
      g.fillStyle = '#1a1008'; g.font = 'bold 20px Georgia'; g.textAlign = 'center'; for (let i = 1; i <= 12; i++) { const a = -i / 12 * 6.2832; g.fillText(i, 128 + Math.sin(a) * 78, 136 - Math.cos(a) * 78); }
    });
    const relRev = A.plano(.7, .7, new THREE.MeshBasicMaterial({ map: rev.tex }), 16, 1.9, -13.93, 0); relRev.visible = false;
    const aplicar = () => {
      retr.forEach(m => { m.material.map = volta >= 1 ? m.userData.costas : m.userData.rosto; m.material.needsUpdate = true; });
      sang.forEach(m => { m.visible = volta >= 2; }); relRev.visible = volta >= 2;
    };
    aplicar();
    let t = 0; tick(dt => { if (!relRev.visible) return; t -= dt; if (t <= 0) { t = 1; if (dist(16, -12) < 20) rev.redraw(); } });
    const usada = () => !!S.flags.l6b_notaCorr;
    acao(porta, () => usada() ? 'A porta do fundo está vazia. Só um corredor, e uma nota na parede.' : '<b>E</b>Abrir a porta do fundo do corredor', () => {
      if (usada()) return;
      if (volta >= 3) {
        S.flags.l6b_notaCorr = true; som('rangido', 33.9, 1.2, -12, 1);
        nota('l6b_corredor', 'Nota na porta do fundo', 'Se você chegou até aqui, contou as voltas. A porta do fundo nunca levou a lugar nenhum. Era só para ver quem voltava.\n\nQuem volta é quem fica.\n— D.');
        A.conquista('l6b_corredor'); setTimeout(() => A.lerNota('l6b_corredor'), 600); return;
      }
      if (pendR) return; pendR = true; som('rangido', 33.9, 1.2, -12, .9);
      A.fade(true, () => {
        pendR = false; volta++; S.flags.l6b_volta = volta; P.pos.set(9, P.pos.y, -12); P.yaw = -Math.PI / 2; P.vx = P.vz = 0; aplicar(); A.fade(false);
        if (volta === 1) lia('Igual. O mesmo corredor... Os retratos agora estão de costas?');
        else if (volta === 2) lia('As portas estão sangrando. E o relógio anda para trás.');
        else { lia('De novo. Quatro portas, uma só voltada para mim.'); }
      }, 450);
    });
  });

  // [20-24] a sala-evento da noite (biblioteca, lavanderia ou banheiros) e [25-27] a sala interditada
  F('evento', () => {
    const r = A.SALA(salaEvento); if (!r) return;
    const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
    const tipo = B.esc('evtipo', 3); // 0 dança, 1 sombras sentadas, 2 brasas
    const sil = [], luz = B.esc('evtipo', 3) === 2 ? new THREE.PointLight(0xff7a2a, 0, 7, 1.6) : null; if (luz) { luz.position.set(cx, 1.2, cz); grupo.add(luz); }
    if (tipo === 0) for (let i = 0; i < 4; i++) { const s = B.silhueta(cx, cz, .9); s.visible = false; sil.push(s); }
    if (tipo === 1) for (let i = 0; i < 6; i++) { const s = B.silhueta(r.x0 + 1.8 + (i % 3) * 2.2, r.z0 + 2 + Math.floor(i / 3) * 3.2, .65); s.visible = false; sil.push(s); }
    const brasas = []; if (tipo === 2) for (let i = 0; i < 7; i++) { const m = A.plano(.3, .3, new THREE.MeshBasicMaterial({ color: 0xff5a1a, transparent: true, opacity: .8 }), cx + (B.rnd('br' + i) - .5) * 4, .03, cz + (B.rnd('bz' + i) - .5) * 3, 0); m.rotation.x = -Math.PI / 2; m.visible = false; brasas.push(m); }
    let ativo = false, feito = !!S.flags.l6b_evFim, tt = 0, calmo = 0, ruidoT = 0;
    const mensagens = ['A música de uma caixinha sobe do nada. Quatro vultos giram devagar em volta do centro.', 'As carteiras estão ocupadas. Seis vultos sentados, todos de frente para a porta.', 'O cheiro de fumaça vem antes. Brasas no chão, sem fogo, e o ar fica quente.'];
    tick(dt => {
      const dentro = sala() === salaEvento;
      if (!ativo && !feito && dentro) { ativo = true; tt = 0; calmo = 0; ruidoT = 3; sil.forEach(s => { s.visible = true; }); brasas.forEach(m => { m.visible = true; }); A.toast(mensagens[tipo]); if (tipo === 0) som('caixinha', cx, cz); }
      if (!ativo) return;
      tt += dt;
      if (tipo === 0) sil.forEach((s, i) => { const a = tt * .9 + i * 1.57; s.position.set(cx + Math.cos(a) * 1.3, 0, cz + Math.sin(a) * 1.3); s.rotation.y = -a; });
      if (tipo === 1) sil.forEach(s => { s.rotation.y = Math.atan2(P.pos.x - s.position.x, P.pos.z - s.position.z); });
      if (tipo === 2 && luz) { luz.intensity = 1.3 + Math.random() * .8; ruidoT -= dt; if (ruidoT <= 0) { ruidoT = 1.6; som('estalo', cx, cz); } }
      if (dentro) { if (P.sprinting) { ruidoT -= dt; if (ruidoT <= 0) { ruidoT = 3; A.emitNoise(P.pos.x, P.pos.z, 12); } calmo = 0; } else calmo += dt; }
      if (tt >= 26 || (!dentro && tt > 3)) {
        ativo = false; feito = true; S.flags.l6b_evFim = true; sil.forEach(s => { s.visible = false; }); brasas.forEach(m => { m.visible = false; }); if (luz) luz.intensity = 0;
        if (calmo >= 14) { if (B.rnd('evprem') < .5) B.darPilha(); else B.darKit(); lia('Fiquei quieta até acabar. Ele não me viu. Acho que o quarto também gostou.'); } // [24] ficar quieto rende uma dádiva
        else A.toast('Acabou. Nada ganho — dá para ficar mais quieta da próxima vez.');
      }
    });
  });

  F('proibida', () => {
    const r = A.SALA(salaProibida), pc = portaCorr[salaProibida]; if (!r || !pc) return;
    const fita = A.canvasTex(256, 32, (g, w, h) => { g.fillStyle = '#d8b820'; g.fillRect(0, 0, w, h); g.fillStyle = '#111'; for (let i = -2; i < 12; i++) { g.beginPath(); g.moveTo(i * 28, h); g.lineTo(i * 28 + 14, h); g.lineTo(i * 28 + 30, 0); g.lineTo(i * 28 + 16, 0); g.fill(); } });
    const mat = new THREE.MeshBasicMaterial({ map: fita, side: THREE.DoubleSide });
    const f1 = A.plano(1.15, .14, mat, pc.x, 1.0, pc.z, pc.ry), f2 = A.plano(1.15, .14, mat, pc.x, 1.4, pc.z, pc.ry); f1.rotation.z = .12; f2.rotation.z = -.1;
    f1.userData.leitura = { t: 'Fita de interdição: NÃO ENTRE' };
    const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
    let entrou = !!S.flags.l6b_prib;
    nota('l6b_polaroide', 'Polaroide da sala interditada', 'Uma fotografia instantânea: o internato visto de cima, sem nenhuma porta na fachada.\n\nNo verso, a lápis: "a saída verdadeira não é a da frente. É a que ele nunca fechou."');
    const sp0 = A.spot(salaProibida, 'mesa', 0);
    const mp = A.item('l6b_polaroide', sp0, A.MK.nota(), 'Pegar a polaroide da sala interditada', () => {
      A.conquista('l6b_proibida'); mexer(o => { o.polaroide = 1; }); setTimeout(() => A.lerNota('l6b_polaroide'), 400);
    });
    A.ITENS.pilha('l6b_prib_pilha', A.spot(salaProibida, 'mesa', 1 + B.esc('pribp', 3)));
    tick(() => {
      if (entrou || sala() !== salaProibida) return;
      entrou = true; S.flags.l6b_prib = true; A.emitNoise(cx, cz, 14); som('pancada', cx, cz);
      lia('Eu passei por baixo da fita. Isso fez barulho... ele vai ficar sabendo.'); // [27] entrar chama a atenção dele
    });
  });

  // [28-29, 36-37] porta lateral emperrada (arranhões na madeira) e a casa que lembra o que você arrombou
  F('emperrada', () => {
    const id = salaEmperrada, d = A.DOOR(id), pc = portaCorr[id]; if (!d || !pc) return;
    const memoria = (L.arromb || {})[id];
    const trava = () => !S.flags['l6b_forc_' + id] && !memoria;
    d.trava = trava; d.msg = 'Emperrada. Arranhões fundos na madeira, de dentro para fora.';
    if (memoria) { A.setDoor(d, true, true); d.arrombada = true; A.plano(.9, .6, new THREE.MeshStandardMaterial({ color: 0x24201a, transparent: true, opacity: .5 }), pc.x, .02, pc.z + (pc.ry === 0 ? .6 : -.6), 0).rotation.x = -Math.PI / 2; }
    else {
      A.plano(.5, .7, new THREE.MeshStandardMaterial({ map: A.TX.rabisco, transparent: true, opacity: .7 }), pc.x + .32, 1.1, pc.z + (pc.ry === 0 ? .03 : -.03), pc.ry);
      const it = A.W.inter.find(i => i.porta === d);
      if (it) {
        const lb0 = it.label, act0 = it.act;
        it.hold = 4; it.ruido = 10; it.som = 'forcar'; it.pode = () => trava();
        it.label = () => trava() ? '<b>E</b>Arrombar a porta emperrada' : lb0();
        it.act = () => {
          if (trava()) {
            S.flags['l6b_forc_' + id] = true; it.hold = 0; d.arrombada = true; mexer(o => { o.arromb = o.arromb || {}; o.arromb[id] = 1; });
            A.setDoor(d, true); A.emitNoise(d.x, d.z, 12); A.toast('A porta cede com um estalo. A casa vai lembrar disso.'); return;
          }
          act0();
        };
      }
    }
  });

  // [30-31] estante caída no corredor oeste, por semente: dá para empurrar (barulho) ou contornar pelo refeitório
  F('estante', () => {
    if (!estanteOn) return;
    const g = new THREE.Group(); g.position.set(-21, 0, -12); grupo.add(g);
    const corpo = box(.8, 1.1, 3.4, MAT.madeiraEsc, 0, .55, 0, g, false); corpo.rotation.z = .08;
    for (let i = 0; i < 6; i++) { const l = box(.3, .06, .22, MAT.madeira, .5 + (i % 3) * .3, .03, -1.4 + i * .5, g, false); l.rotation.y = B.rnd('es' + i) * 2; }
    const col = A.addCollider(-21.45, -20.55, -14, -10);
    g.traverse(o => { o.userData.leitura = { t: 'Estante caída atravessada no corredor' }; });
    let movida = !!S.flags.l6b_estante;
    const abrir = () => { col.on = false; g.position.set(-21, 0, -13.2); g.scale.z = .45; };
    if (movida) abrir();
    acao(g, () => movida ? 'A estante foi empurrada para a parede.' : '<b>E</b>Empurrar a estante caída<small style="opacity:.6"> · ou dê a volta pelo refeitório</small>', () => {
      if (movida) return; movida = true; S.flags.l6b_estante = true; abrir(); A.emitNoise(-21, -12, 13); lia('Pesada. E fez um barulho enorme.');
    }, { hold: 3, ruido: 12, som: 'arrastar', pode: () => !movida });
    setTimeout(() => { if (!movida && !S.flags.l6b_estanteFala) { S.flags.l6b_estanteFala = true; lia('Essa estante caída... isso não estava aí.'); } }, 6000);
  });

  // [32-33] poças de goteira + [34-35] acústica das salas
  F('goteiras', () => { mulFns.push(goteiras(A, S, B, [[-12, -12], [-24, -12], [-3, -6], [12, -12], [24, -12], [-18, -20], [12, -20], [-30, -20]], 3, 'poca')); });
  F('acustica', () => { mulFns.push(acustica(A, S, B, ['refeit', 'lavand', 'banh', 'enferm'], ['aula', 'biblio', 'diret', 'hall'], 'ac')); });

  // [38-40] monitores de vigilância na diretoria (com atraso de 2 s e a Lia de costas)
  F('monitores', () => {
    const nomes = ['RECEPÇÃO', 'CORR. OESTE', 'REFEITÓRIO', 'CORR. LESTE'], ids = ['hall', 'cw', 'refeit', 'ce'];
    const est = ids.map(() => ({ ino: false, lia: false })); let tt = 0, tH = 0, tD = 0, tL = 0, liaId = null; const hist = [];
    const M = A.M, grp = new THREE.Group(); grupo.add(grp);
    const pains = ids.map((id, k) => {
      const pn = painel(160, 120, (g, w, h) => {
        const e = est[k]; g.fillStyle = '#0b130d'; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(150,220,160,${Math.random() * .15})`; g.fillRect(Math.random() * w, Math.random() * h, 14 + Math.random() * 30, 1); }
        g.strokeStyle = 'rgba(120,200,140,.4)'; g.strokeRect(10, 22, w - 20, h - 34);
        g.fillStyle = 'rgba(140,230,160,.85)'; g.font = '11px monospace'; g.fillText('CAM 0' + (k + 1) + ' ' + nomes[k], 8, 14);
        if (e.ino) { g.fillStyle = 'rgba(215,255,220,.92)'; g.fillRect(w * .5 - 7, h * .38, 14, 46); g.beginPath(); g.arc(w * .5, h * .32, 10, 0, 6.2832); g.fill(); g.fillRect(w * .5 + 10, h * .5, 3, 14); }
        if (e.lia) { g.fillStyle = 'rgba(170,220,180,.5)'; g.fillRect(w * .28 - 6, h * .46, 12, 34); g.beginPath(); g.arc(w * .28, h * .4, 8, 0, 6.2832); g.fill(); g.fillRect(w * .28 - 8, h * .4, 3, 26); g.fillRect(w * .28 + 5, h * .4, 3, 26); }
        if (Math.floor(tt * 2) % 2) { g.fillStyle = '#d33'; g.beginPath(); g.arc(w - 14, 12, 3, 0, 6.2832); g.fill(); }
      });
      const x = 12 + k * .72;
      box(.62, .5, .4, MAT.preto, x, 1.6, -9.75, grp, false);
      const tela = A.plano(.5, .38, new THREE.MeshBasicMaterial({ map: pn.tex }), x, 1.62, -9.54, 0, grp);
      return pn;
    });
    grp.traverse(o => { o.userData.leitura = { t: 'Monitores de vigilância (imagem com atraso)' }; });
    acao(grp, '<b>E</b>Olhar os monitores de vigilância', () => {
      let ref = null; for (const h of hist) if (h.t <= tt - 2) ref = h;
      const idx = ref ? ids.indexOf(ref.id) : -1;
      lia(idx >= 0 ? `Ele estava ${['na recepção', 'no corredor oeste', 'no refeitório', 'no corredor leste'][idx]}, dois segundos atrás. A imagem sempre chega atrasada.` : 'Nenhum vulto nas quatro câmeras. Ou ele está onde elas não olham.');
      if (est.some(e => e.lia)) setTimeout(() => lia('Espera. Aquela de costas, de cabelo comprido, em um corredor onde eu nunca estive... sou eu?'), 3500);
    });
    tick(dt => {
      tt += dt; tH -= dt; tD -= dt; tL -= dt;
      if (tH <= 0) { tH = .5; const r = M && M.ativo ? A.roomAt(M.pos.x, M.pos.z) : null; hist.push({ t: tt, id: r ? r.id : null }); while (hist.length > 14) hist.shift(); }
      if (tL <= 0) { tL = 14; const novas = ids.filter(id => !visitadas.has(id)); liaId = novas.length && Math.random() < .35 ? novas[Math.floor(Math.random() * novas.length)] : null; }
      if (tD > 0 || dist(12.8, -9) > 16) return; tD = .25;
      let ref = null; for (const h of hist) if (h.t <= tt - 2) ref = h; // [39] atraso de 2 segundos
      ids.forEach((id, k) => { est[k].ino = !!ref && ref.id === id; est[k].lia = liaId === id; pains[k].redraw(); });
    });
  });

  // marca salas visitadas (usado pelos monitores e pelos sustos de repetição)
  tick(() => { const s = sala(); if (s) visitadas.add(s); });

  // [41-43] armário abençoado do térreo, o cuco da recepção que aponta o lado e o cheiro de lavanda
  F('bencao', () => {
    const arms = A.W.lockers.filter(l => l.tipo === 'armario').sort((a, b) => a.x - b.x);
    if (!arms.length) return;
    const Lb = arms[B.esc('benc', arms.length)]; X.bencao = Lb;
    const it = A.W.inter.find(i => i.obj === Lb.g);
    if (it) { const lb = it.label; it.label = () => lb() + '<small style="opacity:.6"> · cheiro de lavanda</small>'; }
    const pts = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xb08aff, size: .05, transparent: true, opacity: .6, depthWrite: false }));
    const N = 14, arr = new Float32Array(N * 3), fase = Array.from({ length: N }, () => Math.random());
    pts.geometry.setAttribute('position', new THREE.BufferAttribute(arr, 3)); pts.frustumCulled = false; grupo.add(pts);
    let tt = 0;
    tick(dt => {
      tt += dt; for (let i = 0; i < N; i++) { const f = (fase[i] + tt * .08) % 1; arr[i * 3] = Lb.x + Math.sin(fase[i] * 40 + tt * .5) * .4 + Lb.face[0] * .6; arr[i * 3 + 1] = .3 + f * 1.8; arr[i * 3 + 2] = Lb.z + Math.cos(fase[i] * 30 + tt * .4) * .4 + Lb.face[1] * .6; }
      pts.geometry.attributes.position.needsUpdate = true;
      if (S.hidden === Lb) { S.fear = Math.max(0, S.fear - 8 * dt); if (A.M.achou) A.M.achou = false; } // a respiração fica estável aqui dentro
    });
    // cuco: ponteiro para o lado do armário (esquerda = oeste)
    const seta = Lb.x < 0 ? '←' : '→';
    placa([{ t: 'CUCO', tam: 22, estilo: 'bold' }, { t: seta, tam: 64, estilo: 'bold' }, { t: 'ele canta para um lado só', tam: 12, estilo: 'italic' }], -1.4, 2.5, -13.86, .55, .6, 0, { fundo: '#1c140c', cor: '#b79a62', manchas: 3 });
  });

  // [44-45] dado de osso do Tomé: seis resultados, em duas salas fora do caminho
  F('dado', () => {
    const alvos = ['aula', 'biblio', 'lavand', 'banh', 'refeit'].map((id, i) => [id, B.rnd('dd' + i)]).sort((a, b) => a[1] - b[1]).slice(0, 2).map(x => x[0]);
    alvos.forEach((id, k) => {
      const pos = A.spot(id, 'mesa', 2 + k);
      const d = box(.08, .08, .08, new THREE.MeshStandardMaterial({ color: 0xe8e0c8, roughness: .6 }), pos.x, pos.y + .04, pos.z, grupo, false); d.rotation.set(.4, B.rnd('dr' + k) * 3, .3);
      for (const [px, py] of [[.041, .02], [.041, -.02], [-.041, 0]]) box(.004, .012, .012, MAT.preto, px, py, 0, d, false);
      d.userData.leitura = { t: 'Dado de osso' };
      const usado = () => !!S.flags['l6b_dado' + k];
      d.visible = !usado();
      const it = acao(d, '<b>E</b>Jogar o dado de osso do Tomé', () => {
        if (usado()) return; S.flags['l6b_dado' + k] = true; d.visible = false; A.conquista('l6b_dado'); som('papel');
        const r = 1 + Math.floor(Math.random() * 6);
        if (r === 1) { B.darPilha(); lia('Um. Uma pilha cai de dentro do dado oco.'); }
        else if (r === 2) { B.darKit(); lia('Dois. Um curativo estava colado embaixo dele.'); }
        else if (r === 3) { S.fear = 0; lia('Três. Um silêncio bom. Respirei fundo e o medo baixou.'); }
        else if (r === 4) { A.emitNoise(P.pos.x, P.pos.z, 18); som('pancada', P.pos.x, P.pos.z); lia('Quatro. O dado bateu em algo de metal. Ecoou na casa toda.'); }
        else if (r === 5) { const ligada = S.flashOn; if (ligada) { S.flashOn = false; som('interruptor'); setTimeout(() => { if (!S.flashOn && S.inv.lanterna) { S.flashOn = true; som('interruptor'); } }, 3000); } lia('Cinco. A lanterna apagou sozinha. Três segundos de nada.'); }
        else { A.emitNoise(P.pos.x, P.pos.z, 30); som('sussurros', 2); lia('Seis. O dado girou sem parar. Em algum lugar, passos mudaram de direção.'); }
      });
      it.on = () => d.visible;
    });
  });

  // [46-49] a Loira do Banheiro: três chamados diante dos espelhos, de luz apagada
  F('loira', () => {
    const r = A.SALA('banh'); if (!r) return;
    let seq = 0;
    const res = B.rnd('loira') < .5 ? 'ajuda' : 'castigo'; // sorteado pela semente da noite
    const ant = L.loiraUlt;
    for (let i = 0; i < 3; i++) {
      const x = 17.5 + i * 2.5;
      box(.7, .16, .5, MAT.branco, x, .85, -25.7, grupo, false);
      const esp = A.plano(.62, .8, new THREE.MeshStandardMaterial({ color: 0x0a0f0c, metalness: .9, roughness: .08 }), x, 1.5, -25.93, 0);
      esp.userData.leitura = { t: 'Espelho do banheiro' };
      acao(esp, () => S.flags.l6b_loira === S.chapter ? 'O espelho está só um espelho.' : S.flashOn ? 'O espelho está claro demais. Ela só aparece no escuro.' : `<b>E</b>Chamar por ela (${seq + 1}/3)`, () => {
        if (S.flags.l6b_loira === S.chapter || S.flashOn) return;
        if (seq !== i) { seq = 0; if (i !== 0) { lia('Perdi a conta. Começo de novo.'); return; } }
        seq = i + 1; som('gota', { x, y: 1, z: -25.5 });
        if (seq < 3) return;
        seq = 0; S.flags.l6b_loira = S.chapter; A.conquista('l6b_loira'); mexer(o => { o.loiraUlt = res; });
        const igual = ant === res ? ' De novo o mesmo resultado da última vez.' : '';
        if (res === 'ajuda') {
          const ra = A.M.ativo ? A.roomAt(A.M.pos.x, A.M.pos.z) : null;
          som('sussurros', 1); setTimeout(() => lia(ra ? `Um sussurro no meu ouvido: "ele está ${ra.nome.toLowerCase().startsWith('corredor') ? 'no ' : 'na '}${ra.nome.toLowerCase()}".${igual}` : 'Um sussurro no meu ouvido: "ele ainda dorme".' + igual), 900);
        } else {
          S.fear = Math.min(100, S.fear + 28); som('risada', x, -24); A.emitNoise(x, -22, 10);
          setTimeout(() => lia('Algodão molhado caiu da torneira. Alguém loiro, só de relance, no vidro.' + igual), 800);
        }
      });
    }
  });

  // [50-52] regra pregada na porta da despensa
  F('regra', () => {
    const regras = [{ t: 'NÃO ACENDA A LUZ', k: 'luz' }, { t: 'NÃO FECHE A PORTA', k: 'porta' }, { t: 'NÃO CORRA AQUI', k: 'correr' }, { t: 'NÃO OLHE PARA TRÁS', k: 'olhar' }];
    const rg = regras[B.esc('regra', 4)];
    const papel = placa([{ t: 'REGRA DA DESPENSA', tam: 14, estilo: 'bold' }, { t: rg.t, tam: 26, estilo: 'bold' }], -31.6, 1.55, -25.9, .8, .6, 0, { fundo: '#d6c9a6', cor: '#3a1410', manchas: 3 });
    acao(papel, '<b>E</b>Ler o papel pregado na porta', () => lia(`"${rg.t.charAt(0) + rg.t.slice(1).toLowerCase()}." Escrito à mão, com pressa. Obedecer custa pouco. Ou será que não?`));
    const pos = A.spot('despensa', 'prateleira', 3 + B.esc('regrap', 3));
    A.item('l6b_regra_pilha', pos, A.MK.pilha(), 'Pegar as pilhas escondidas atrás das latas', () => { A.toast('Pilhas guardadas. R para trocar.'); S.inv.pilhas++; }, () => !!S.flags.l6b_regraOk);
    let ok = 0, quebrou = !!S.flags.l6b_regraQuebrada, d = null;
    tick(dt => {
      if (sala() !== 'despensa') { ok = 0; d = null; return; }
      d = d || A.DOOR('despensa');
      const viola = rg.k === 'luz' ? !!S.flashOn : rg.k === 'correr' ? !!P.sprinting : rg.k === 'olhar' ? P.olhar > 1.5 : (d && !d.open && ok > 1.5);
      if (viola && !quebrou && !S.flags.l6b_regraOk) {
        quebrou = true; S.flags.l6b_regraQuebrada = true; A.emitNoise(-29, -30, 14); S.fear = Math.min(100, S.fear + 10);
        A.toast('Você quebrou a regra do papel. Ele ouviu.'); return;
      }
      if (quebrou) return;
      ok += dt;
      if (ok >= 7 && !S.flags.l6b_regraOk) { S.flags.l6b_regraOk = true; A.syncWorld(); lia('Obedeci a regra do papel. Tem um maço de pilhas atrás das latas.'); }
    });
  });

  // [53-55] jogo dos sete erros na rejogada: um dos quadros do corredor oeste mudou
  F('erros', () => {
    if (!B.ng) return;
    const certo = B.esc('erro', 4), xs = [-9.5, -19, -22, -31];
    xs.forEach((x, i) => {
      const quadro = new THREE.Group(); quadro.position.set(x, 1.6, -13.93); grupo.add(quadro);
      box(.62, .48, .04, MAT.madeiraEsc, 0, 0, 0, quadro, false);
      const img = A.plano(.52, .38, new THREE.MeshBasicMaterial({ map: A.canvasTex(104, 76, (g, w, h) => { g.fillStyle = '#2a2a24'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a4a3c'; g.fillRect(8, 40, w - 16, 28); g.fillStyle = '#8a8a70'; g.beginPath(); g.arc(30 + i * 12, 22, 9, 0, 6.2832); g.fill(); if (i === certo) { g.fillStyle = '#111'; g.fillRect(70, 30, 6, 12); g.fillRect(80, 30, 6, 12); } }) }), 0, 0, .023, 0, quadro); img.material.color.setScalar(.6);
      if (i === certo) quadro.rotation.z = .13;
      quadro.traverse(o => { o.userData.leitura = { t: 'Quadro da parede' }; });
      acao(quadro, () => S.flags.l6b_erroOk ? 'O quadro que mudou já foi apontado.' : '<b>E</b>Apontar o que está diferente', () => {
        if (S.flags.l6b_erroOk) return;
        if (i === certo) {
          S.flags.l6b_erroOk = true; mexer(o => { o.selos = (o.selos || 0) + 1; }); A.conquista('l6b_erros'); B.darPilha(); lia('Era esse. Está torto, e tem dois olhos novos na gravura. Ganhei um selo de atenção.'); // [54]
        } else { som('pancada', x, -13); A.emitNoise(x, -12, 11); A.toast('Esse não mudou. A pancada ecoou no corredor.'); } // [55]
      });
    });
  });

  // [56] placas de sala trocadas na rejogada (Lia comenta)
  F('placas', () => {
    if (!B.ng || noites < 3) return;
    const a = A.DOOR('aula'), b = A.DOOR('biblio'); if (!a || !b) return;
    const t = a.nome; a.nome = b.nome; b.nome = t;
    let falou = false;
    tick(() => { if (!falou && (sala() === 'aula' || sala() === 'biblio')) { falou = true; lia('A placa da porta dizia outra sala. Isso não era assim.'); } });
  });

  // [57-59] campainha da recepção: desafio do silêncio (60 s sem correr)
  F('campainha', () => {
    const g0 = new THREE.Group(); g0.position.set(1.0, 1.17, -4.1); grupo.add(g0);
    cyl(.07, .09, .03, MAT.bronze, 0, .015, 0, 12, g0); const cup = new THREE.Mesh(new THREE.SphereGeometry(.06, 10, 6, 0, 6.2832, 0, 1.4), MAT.bronze); cup.position.y = .03; g0.add(cup);
    cyl(.012, .012, .03, MAT.metal, 0, .1, 0, 6, g0);
    g0.traverse(o => { o.userData.leitura = { t: 'Campainha da recepção' }; });
    let t = 0, ativo = false, aviso = 60;
    const vencidos = () => ler().silencios || 0;
    acao(g0, () => ativo ? 'Campainha: o silêncio está valendo' : `<b>E</b>Tocar a campainha: desafio de 60 s sem correr${vencidos() ? ' (' + vencidos() + ' vencidos)' : ''}`, () => {
      if (ativo || S.flags.l6b_camp) return;
      ativo = true; t = 0; aviso = 60; S.flags.l6b_camp = true; som('sino', .12, { x: 1, y: 1.2, z: -4 }, 1.4); A.toast('Plim. Silêncio de recepção: 60 segundos sem correr.');
    });
    tick(dt => {
      if (!ativo) return; t += dt;
      if (P.sprinting) { ativo = false; A.emitNoise(1, -4, 16); som('sino', .4, { x: 1, y: 1.2, z: -4 }, .9); A.toast('Você correu. A campainha tocou sozinha, bem alto.'); return; } // [58]
      const falta = 60 - Math.floor(t); if (falta <= 40 && aviso > 40) { aviso = 40; A.toast('Quarenta segundos.'); } if (falta <= 20 && aviso > 20) { aviso = 20; A.toast('Vinte segundos.'); }
      if (t >= 60) { ativo = false; const o = mexer(x => { x.silencios = (x.silencios || 0) + 1; }); A.conquista('l6b_silencio'); B.darPilha(); A.toast(`Silêncio vencido (${o.silencios}ª vez). A campainha agradece.`); } // [59]
    });
  });

  // [60] placas em braile nas portas laterais e a tabela na biblioteca
  F('braile', () => {
    const celas = { trava: [1, 0, 0, 1, 1, 0], fita: [1, 1, 0, 0, 1, 0], festa: [1, 0, 0, 1, 0, 1] };
    const cela = (g, ox, oy, pontos) => { for (let i = 0; i < 6; i++) { const cx = ox + (i < 3 ? 0 : 22), cy = oy + (i % 3) * 22; g.beginPath(); g.arc(cx, cy, 6, 0, 6.2832); if (pontos[i]) { g.fillStyle = '#d8cca8'; g.fill(); } else { g.strokeStyle = 'rgba(216,204,168,.18)'; g.stroke(); } } };
    const chavePor = { [salaEmperrada]: 'trava', [salaProibida]: 'fita', [salaEvento]: 'festa' };
    for (const id of salasLat) {
      const pc = portaCorr[id], c = celas[chavePor[id]];
      const tex = A.canvasTex(96, 96, (g, w, h) => { g.fillStyle = '#1c1812'; g.fillRect(0, 0, w, h); cela(g, 32, 18, c); });
      const m = A.plano(.22, .22, new THREE.MeshStandardMaterial({ map: tex, roughness: .8 }), pc.x - .75, 1.25, pc.z + (pc.ry === 0 ? .02 : -.02), pc.ry);
      m.userData.leitura = { t: 'Placa em braile ao lado da porta' };
      acao(m, '<b>E</b>Passar os dedos nos pontos', () => lia('Seis pontos em relevo. Deve ter uma tabela por aqui para ler isso. A biblioteca, talvez.'));
    }
    const tab = A.canvasTex(256, 192, (g, w, h) => {
      g.fillStyle = '#1a150f'; g.fillRect(0, 0, w, h); g.fillStyle = '#b7a67c'; g.font = 'bold 18px Georgia'; g.textAlign = 'left'; g.fillText('ALFABETO DO ZELADOR', 16, 24);
      [['trava', 'emperrada hoje'], ['fita', 'interditada hoje'], ['festa', 'acontece hoje']].forEach(([k, t], i) => { cela(g, 40, 64 + i * 46 - 12, celas[k]); g.font = '17px Georgia'; g.fillStyle = '#b7a67c'; g.fillText('= ' + t, 100, 64 + i * 46 + 6); });
    });
    const pb = A.SALA('biblio');
    const t = A.plano(1.1, .83, new THREE.MeshStandardMaterial({ map: tab, roughness: .9 }), -33.9 + .02, 1.5, -5, Math.PI / 2);
    t.userData.leitura = { t: 'Tabela braile do zelador' };
    acao(t, '<b>E</b>Ler a tabela do zelador', () => lia(`Os pontos das portas laterais dizem qual está emperrada, qual está interditada e onde algo acontece hoje. Um alfabeto de ${pb ? 'biblioteca' : 'zelador'}.`));
  });

  // [61-63] pisca-pisca do corredor oeste soletra o código de uma gaveta trancada
  F('luzes', () => {
    const cod = [1 + B.esc('mc0', 4), 1 + B.esc('mc1', 4), 1 + B.esc('mc2', 4)];
    const mat = new THREE.MeshStandardMaterial({ color: 0x000, emissive: 0xffe6b0, emissiveIntensity: .05 });
    box(.5, .06, .18, mat, -22, 2.9, -12, grupo, false);
    const seg = []; cod.forEach(n => { for (let k = 0; k < n; k++) seg.push([1, .3], [0, .3]); seg.push([0, 1.2]); }); seg.push([0, 2.2]);
    const total = seg.reduce((a, x) => a + x[1], 0); let tc = 0;
    tick(dt => { tc = (tc + dt) % total; let a = tc, on = 0; for (const [v, d] of seg) { if (a < d) { on = v; break; } a -= d; } mat.emissiveIntensity = (S.flags.energia ? .9 : .3) * on + .04; });
    const gav = box(.3, .55, .7, MAT.metalVerde, -33.65, 1.15, -12.2, grupo, false);
    gav.userData.leitura = { t: 'Gaveta metálica trancada' };
    const aberta = () => !!S.flags.l6b_gavetaLuz;
    acao(gav, () => aberta() ? 'A gaveta metálica está aberta e vazia.' : '<b>E</b>Abrir a gaveta trancada com segredo', () => {
      if (aberta()) return;
      A.abrirTeclado('GAVETA DO ZELADOR', cod.join(''), () => {
        S.flags.l6b_gavetaLuz = true; A.conquista('l6b_luzes'); B.darKit(); lia('Três piscadas, depois duas, depois uma. Era um código. Tinha um curativo.');
      }, () => som('trancado'));
    });
  });

  // [64-65] rosto a mais na foto da turma (noites sorteadas): encarar por 4 s apaga a luz
  F('rosto', () => {
    if (B.esc('rosto', 3) !== 0) return;
    let olho = 0;
    const pn = painel(128, 128, (g, w, h) => {
      g.fillStyle = '#0c0907'; g.fillRect(0, 0, w, h); g.fillStyle = '#b6a889'; g.beginPath(); g.ellipse(64, 64, 34, 44, 0, 0, 6.2832); g.fill();
      g.fillStyle = '#0c0907'; g.fillRect(48, 54, 12, 8); g.fillRect(70, 54, 12, 8); g.fillStyle = '#f0eadc'; const dx = Math.sin(olho * 2) * 3; g.fillRect(51 + dx, 56, 5, 4); g.fillRect(73 + dx, 56, 5, 4); g.fillStyle = '#0c0907'; g.fillRect(52, 84, 26, 3);
    });
    const m = A.plano(.34, .34, new THREE.MeshBasicMaterial({ map: pn.tex }), 4.55, 1.45, -13.82, 0); m.material.color.setScalar(.7);
    m.userData.leitura = { t: 'Um rosto a mais na foto da turma' };
    let enc = 0, tt = 0, cd = 0;
    tick(dt => {
      tt += dt; olho = tt; if (Math.floor(tt * 3) !== Math.floor((tt - dt) * 3) && dist(4.5, -13) < 12) pn.redraw();
      cd -= dt; if (cd > 0) return;
      if (B.olhando(4.55, 1.45, -13.82, .93, 6)) enc += dt; else enc = Math.max(0, enc - dt * 2);
      if (enc >= 4 && S.flags.energia && !S.flags.sg4_apagao) {
        enc = 0; cd = 30; S.flags.sg4_apagao = true; A.syncLuzes(); som('interruptor'); som('sussurros', 1);
        setTimeout(() => { S.flags.sg4_apagao = false; A.syncLuzes(); }, 2000);
        lia('Os olhos dele mexeram. E a luz foi embora...');
      }
    });
  });

  // [66] fichário da secretaria: a matrícula está num cartaz da recepção, e muda por semente
  F('ficha', () => {
    const mat = 100 + B.esc('mat', 900);
    placa([{ t: 'ALUNOS DO MÊS', tam: 18, estilo: 'bold' }, { t: 'matrícula nº ' + mat, tam: 28 }, { t: 'Ordem · Fé · Silêncio', tam: 12, estilo: 'italic' }], 5.9, 1.7, -2.4, .9, .75, -Math.PI / 2, { fundo: '#d6c9a6', cor: '#2a1c10', manchas: 4 });
    nota('l6b_ficha', 'Ficha de matrícula', `Matrícula nº ${mat}: Lia M. — admitida em 1979, curso noturno.\n\n(à margem, em outra letra) "Esta aluna nunca saiu. Ver caderno 13."`);
    const f = box(.5, 1.0, .5, MAT.metalVerde, 17.6, .5, -8.4, grupo, false);
    f.userData.leitura = { t: 'Fichário da secretaria' };
    acao(f, () => S.flags.l6b_fichaOk ? 'O fichário está aberto.' : '<b>E</b>Abrir o fichário da secretaria', () => {
      if (S.flags.l6b_fichaOk) return;
      A.abrirTeclado('FICHÁRIO · MATRÍCULA', String(mat), () => { S.flags.l6b_fichaOk = true; B.darPilha(); som('papel'); setTimeout(() => A.lerNota('l6b_ficha'), 500); }, () => som('trancado'));
    });
  });

  // [74] livro de visitas com as datas das suas últimas noites
  F('visitas', () => {
    if (!S.flags._l6bvis) { S.flags._l6bvis = true; mexer(o => { o.visitas = [...(o.visitas || []), `${dois(dia.getDate())}/${dois(dia.getMonth() + 1)} às ${dois(dia.getHours())}:${dois(dia.getMinutes())}`].slice(-6); }); }
    const v = ler().visitas || [];
    nota('l6b_visitas', 'Livro de visitas', 'LIVRO DE VISITAS · SÃO LÁZARO\n\n' + v.map((t, i) => `${i + 1}. L. — ${t}`).join('\n') + '\n\n(a última linha ainda está úmida)');
    const l = box(.32, .05, .24, MAT.madeiraEsc, -1.0, 1.17, -4.15, grupo, false); l.rotation.y = .2;
    l.userData.leitura = { t: 'Livro de visitas da recepção' };
    acao(l, '<b>E</b>Ler o livro de visitas', () => A.lerNota('l6b_visitas'));
  });

  // [68] a casa envelhece (mofo a cada 5 noites) e [69] a foto virada para a parede na 20ª
  F('envelhece', () => {
    mofo(A, B, noites, [[-12, 2, -13.93, 0], [12, 2.1, -13.93, 0], [-28, 1.8, -10.07, Math.PI], [26, 1.9, -10.07, Math.PI], [-20, 2, -13.93, 0], [20, 2, -10.07, Math.PI], [-5.93, 1.5, -6, Math.PI / 2], [5.93, 1.5, -10, -Math.PI / 2], [-32, 1.9, -13.93, 0], [31, 2, -13.93, 0], [-9, 2, -10.07, Math.PI], [-14, 1.6, -9.92, 0]]);
    if (noites >= 20) { const m = A.plano(1.14, 1.04, new THREE.MeshStandardMaterial({ color: 0x15110c, roughness: 1 }), 4.3, 1.7, -13.82, 0); m.userData.leitura = { t: 'A foto da turma, virada para a parede' }; }
  });

  // [70-71] bilhete do dia par/ímpar com susto calado
  F('dia', () => {
    const par = dia.getDate() % 2 === 0, id = par ? 'lavand' : 'biblio';
    nota('l6b_dia', par ? 'Bilhete de dia par' : 'Bilhete de dia ímpar', par ? 'Dias pares, a ala leste respira mais alto. Quem passa pela lavanderia ouve os lençóis contarem até dez.\n— J.' : 'Dias ímpares, a ala oeste lembra de tudo. Os livros da biblioteca guardam o nome de quem passa.\n— J.');
    const p = A.spot(id, 'mesa', 3 + B.esc('dia', 2));
    A.item('l6b_dia', p, A.MK.nota(), par ? 'Pegar o bilhete de dia par' : 'Pegar o bilhete de dia ímpar', () => {
      setTimeout(() => A.lerNota('l6b_dia'), 300); setTimeout(() => { som('sussurros', 1); som('passosTeto'); }, 3200);
    });
  });

  // [72-73] noites de São João: fogueira baixa e bandeirinhas no pátio
  F('sao_joao', () => {
    if (!(dia.getMonth() === 5 && dia.getDate() >= 20 && dia.getDate() <= 28)) return;
    const cores = [0xc83030, 0xe0b020, 0x3070c0, 0x30a050];
    for (let i = 0; i < 14; i++) { const x = -12 + i * 1.85; const b = new THREE.Mesh(new THREE.ConeGeometry(.16, .3, 3), new THREE.MeshBasicMaterial({ color: cores[i % 4] })); b.position.set(x, 3.0 - Math.sin(i / 13 * 3.14) * .5, 7); b.rotation.z = Math.PI; grupo.add(b); }
    const fogo = new THREE.Mesh(new THREE.ConeGeometry(.35, .8, 7), new THREE.MeshBasicMaterial({ color: 0xff7a20, transparent: true, opacity: .85 })); fogo.position.set(0, .4, 6); grupo.add(fogo);
    for (let i = 0; i < 5; i++) { const t = cyl(.05, .05, .9, MAT.tronco, Math.cos(i * 1.26) * .4, .25, 6 + Math.sin(i * 1.26) * .4, 5, grupo); t.rotation.z = Math.cos(i * 1.26) * .6; t.rotation.x = Math.sin(i * 1.26) * .6; }
    const luz = new THREE.PointLight(0xff8a30, 1.6, 9, 1.6); luz.position.set(0, 1.0, 6); grupo.add(luz);
    tick(() => { fogo.scale.y = .8 + Math.random() * .5; luz.intensity = 1.2 + Math.random() * .8; });
    acao(fogo, () => S.flags.l6b_pulou ? 'A fogueira baixa crepita.' : '<b>E</b>Pular a fogueira baixa', () => {
      if (S.flags.l6b_pulou) return; S.flags.l6b_pulou = true; B.darPilha(); lia('Pulei. Alguém, em algum lugar, bateu palmas e sumiu quando virei.');
    });
    setTimeout(() => A.toast('É noite de São João. Uma fogueira baixa arde no pátio, e uma sanfona toca de longe.'), 2500);
  });

  // [77] relógio parado na hora real da sua última morte
  F('hora_morte', () => {
    const hm = L.horaMorte;
    if (!hm) return;
    placa([{ t: hm, tam: 38, estilo: 'bold' }, { t: 'parou quando você parou', tam: 13, estilo: 'italic' }], -2.1, 2.05, -13.88, .7, .55, 0, { fundo: '#120e09', cor: '#a89868' });
  });

  X.ruidoMul = () => mulFns.reduce((m, f) => m * f(), 1);

  // [67] a Lia comenta a noite de volta; [75-76] Casa Dobrada e relatos de morte
  let mortesAnt = -1, contaMortes = true;
  X.entrar = function (cap) {
    if (!X._ruido && X.def) { // encadeia o ruído das poças e da acústica no mapa
      X._ruido = true; const o = X.def.ruidoMul; X.def.ruidoMul = () => (o ? o() : 1) * X.ruidoMul();
    }
    if (mortesAnt < 0) mortesAnt = S.mortes || 0;
    if ((S.mortes || 0) > mortesAnt) { mortesAnt = S.mortes; mexer(o => { o.horaMorte = `${dois(dia.getHours())}:${dois(dia.getMinutes())}`; }); }
    if (cap === 1 && !S.flags._l6bFala) {
      S.flags._l6bFala = true;
      const falas = { 2: 'De novo aqui. Mesma porta, mesma casa. Só que não é a mesma.', 3: 'Terceira vez no internato. Eu já sei onde ele pisa. Ou achava.', 5: 'Cinco noites. Parece que a casa me reconhece.', 7: 'Sete. As paredes têm mais rabiscos meus do que dele.', 10: 'Dez noites. Não vou contar a Ana.', 13: 'Treze... esse número não me larga.' };
      if (falas[noites]) setTimeout(() => lia(falas[noites]), 6500);
    }
  };
  X.sync = function () {
    if (S.flags.energia && !S.flags._l6bVer) { // Casa Dobrada: as duas versões do corredor oeste
      S.flags._l6bVer = true;
      const o = mexer(x => { x.vers = x.vers || {}; x.vers[estanteOn ? 'estante' : 'livre'] = 1; });
      if (o.vers.estante && o.vers.livre) A.conquista('l6b_dobrada');
    }
  };
  return X;
}

// =====================================================================
// SUPERIOR — Capítulo III (dormitórios)
// =====================================================================
export function rejogo2Superior(A, S, ctx = {}) {
  const { THREE, MAT, box, cyl } = A;
  const B = base(A, S, 'superior');
  const { F, tick, som, lia, placa, painel, acao, dist, sala } = B;
  const grupo = A.W.grupo, P = A.P;
  const old = lerOld(), L = ler();
  const noites = Math.max(1, old.noites || 0);
  const mulFns = [];
  const X = {};
  const camas = A.W.lockers.filter(l => l.tipo === 'cama').sort((a, b) => (a.z - b.z) || (a.x - b.x));
  const NOMES = ['Davi', 'Tomé', 'Joaquim', 'Luiz', 'Moacir'];
  // uma cama de referência por dormitório, com plaqueta de nome e número
  const dorms = ['dormA', 'dormB', 'dormC', 'dormD', 'dormE'];
  const camasDe = id => camas.filter(c => { const r = A.roomAt(c.x, c.z); return r && r.id === id; });
  const marcadas = dorms.map((id, k) => { const l = camasDe(id); return l.length ? l[B.esc('cama' + k, l.length)] : null; });
  const ordemNomes = NOMES.map((n, i) => [n, B.rnd('nm' + i)]).sort((a, b) => a[1] - b[1]).map(x => x[0]);
  const iRiscado = B.esc('riscado', 5);
  const bIntocada = marcadas[iRiscado] || null;
  const iIntocada = bIntocada ? camas.indexOf(bIntocada) : -1;
  // volumes de travesseiro: uma cama de quatro dormitórios (a que respira é uma delas)
  const donos = dorms.map((id, k) => k).filter(k => k !== iRiscado && marcadas[k]);
  const volCamas = donos.map(k => { const l = camasDe(dorms[k]).filter(c => c !== bIntocada && c !== marcadas[k]); return l.length ? l[B.esc('vol' + k, l.length)] : marcadas[k]; });
  const iReal = volCamas.length ? B.esc('respira', volCamas.length) : -1;

  // [79-81] lista de chamada viva: o nome riscado é a cama intocada, que acalma quem se esconde nela
  F('chamada', () => {
    if (!bIntocada) return;
    const riscado = iRiscado;
    const tex = A.canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = '#1d1810'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8d2bc'; g.font = 'bold 22px Georgia'; g.textAlign = 'left'; g.fillText('CHAMADA', 20, 34);
      g.font = '24px "Special Elite",Georgia';
      ordemNomes.forEach((n, i) => { const y = 74 + i * 32; g.fillText(n, 28, y); if (i === riscado) { g.strokeStyle = '#d8d2bc'; g.lineWidth = 3; g.beginPath(); g.moveTo(22, y - 8); g.lineTo(130, y - 9); g.stroke(); } });
    });
    const m = A.plano(.8, .8, new THREE.MeshStandardMaterial({ map: tex, roughness: .9 }), 2.87, 1.55, -16, -Math.PI / 2);
    m.userData.leitura = { t: 'Lista de chamada do dormitório' };
    acao(m, '<b>E</b>Ler a chamada de giz', () => lia(`Um nome riscado: ${ordemNomes[riscado]}. A plaqueta da cama dele está num dos dormitórios. Dizem que o Inspetor nunca mexe ali.`));
    const Lb = bIntocada; X.bencao = Lb;
    const it = A.W.inter.find(i => i.obj === Lb.g);
    if (it) { const lb = it.label; it.label = () => lb() + '<small style="opacity:.6"> · cheiro de lavanda</small>'; }
    const pts = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xb08aff, size: .05, transparent: true, opacity: .55, depthWrite: false }));
    const N = 12, arr = new Float32Array(N * 3), fase = Array.from({ length: N }, () => Math.random());
    pts.geometry.setAttribute('position', new THREE.BufferAttribute(arr, 3)); pts.frustumCulled = false; grupo.add(pts);
    let tt = 0;
    tick(dt => {
      tt += dt; for (let i = 0; i < N; i++) { const f = (fase[i] + tt * .08) % 1; arr[i * 3] = Lb.x + Math.sin(fase[i] * 40 + tt * .5) * .5; arr[i * 3 + 1] = .6 + f * 1.4; arr[i * 3 + 2] = Lb.z + Math.cos(fase[i] * 30 + tt * .4) * .5; }
      pts.geometry.attributes.position.needsUpdate = true;
      if (S.hidden === Lb) { S.fear = Math.max(0, S.fear - 8 * dt); if (A.M.achou) A.M.achou = false; }
    });
  });

  // [82-84] a cama onde alguém respira de verdade (e os volumes de travesseiro que se desfazem)
  F('respira', () => {
    if (iReal < 0) return;
    const vols = [];
    volCamas.forEach((c, i) => {
      const v = box(.5, .2, .9, MAT.lencol, c.x + (c.ao === 'x' ? -.2 : 0), .78, c.z + (c.ao === 'x' ? 0 : -.1), grupo, false); v.userData.leitura = { t: 'Um volume sob o lençol' };
      v.userData.verdadeiro = i === iReal; v.userData.cama = c; vols.push(v);
      if (S.flags['l6b_vol' + i]) v.visible = false;
      acao(v, '<b>E</b>Levantar o lençol do volume', () => {
        if (S.flags['l6b_vol' + i]) return; S.flags['l6b_vol' + i] = true; v.visible = false;
        if (i === iReal) {
          A.conquista('l6b_ouvido'); mexer(o => { o.ouvido = (o.ouvido || 0) + 1; });
          if (B.rnd('travesseiro') < .5) B.darPilha(); else B.darKit();
          lia('Uma criança de verdade, dormindo de olhos abertos. Sorriu. Deixou algo embaixo do travesseiro.'); // [83]
        } else { som('estalo', c.x, c.z); som('pancada', c.x, c.z); A.emitNoise(c.x, c.z, 13); A.toast('O volume se desfez com um estalo seco. Era só travesseiro. Ele ouviu.'); } // [84]
      }).on = () => v.visible;
    });
    let tt = 0, ts = 0;
    tick(dt => {
      tt += dt; ts -= dt;
      const real = vols[iReal]; if (!real) return;
      if (real.visible) real.scale.y = 1 + Math.sin(tt * 1.7) * .12;
      const c = volCamas[iReal];
      if (real.visible) {
        const d = dist(c.x, c.z);
        if (P.sprinting && d < 3) { real.visible = false; S.flags['l6b_vol' + iReal] = true; A.toast('A cama ficou só um lençol vazio. Passos demais.'); return; }
        if (ts <= 0 && d < 5.5) { ts = 3.6; som('sussurros', 1); }
      }
    });
  });

  // [85] números pintados nas camas, embaralhados na rejogada
  F('numeros', () => {
    const nums = [1, 2, 3, 4, 5];
    if (B.ng) for (let i = nums.length - 1; i > 0; i--) { const j = B.esc('num' + i, i + 1); [nums[i], nums[j]] = [nums[j], nums[i]]; }
    marcadas.forEach((c, k) => { if (!c) return; placa([{ t: String(nums[k]), tam: 64, estilo: 'bold' }, { t: ordemNomes[k], tam: 26 }], c.x + (c.ao === 'x' ? -1.05 : 0), 1.0, c.z + (c.ao === 'x' ? 0 : -1.05), .4, .4, c.ao === 'x' ? Math.PI / 2 : 0, { fundo: '#1a150f', cor: '#c9bda0', manchas: 2 }); });
  });

  // [86-88] sala 13: só existe se você atravessar o corredor 10 s no escuro e em silêncio
  F('sala13', () => {
    const OX = 60, OZ = -30;
    const porta = box(.08, 2.1, .9, new THREE.MeshStandardMaterial({ color: 0x2a2018, emissive: 0x6a5a30, emissiveIntensity: .0 }), -2.92, 1.05, -39.5, grupo, false);
    porta.visible = false;
    const sala3 = new THREE.Group(); grupo.add(sala3);
    box(6, .1, 6, MAT.madeiraEsc, OX, -.05, OZ, sala3, false);
    box(6, .1, 6, MAT.madeiraEsc, OX, 3.05, OZ, sala3, false);
    for (const [w, d, x, z] of [[6, .2, OX, OZ - 3], [6, .2, OX, OZ + 3], [.2, 6, OX - 3, OZ], [.2, 6, OX + 3, OZ]]) box(w, 3, d, MAT.madeira, x, 1.5, z, sala3, false);
    A.addCollider(OX - 3.1, OX - 2.9, OZ - 3, OZ + 3); A.addCollider(OX + 2.9, OX + 3.1, OZ - 3, OZ + 3); A.addCollider(OX - 3, OX + 3, OZ - 3.1, OZ - 2.9); A.addCollider(OX - 3, OX + 3, OZ + 2.9, OZ + 3.1);
    box(1.6, .5, 2.2, MAT.colchao, OX - 1.5, .3, OZ - 1.5, sala3, false);
    const cad = new THREE.Group(); cad.position.set(OX + 1.6, 0, OZ + 1.2); sala3.add(cad);
    box(.6, .06, .6, MAT.madeiraEsc, 0, .45, 0, cad, false); box(.6, .7, .05, MAT.madeiraEsc, 0, .85, -.28, cad, false); for (const s of [-1, 1]) box(.04, .45, .5, MAT.madeira, s * .28, .2, 0, cad, false);
    const luz = new THREE.PointLight(0xffd8a0, 1.0, 9, 1.8); luz.position.set(OX, 2.4, OZ); sala3.add(luz);
    const fotos = [['Turma de 1979', 'Todos sorriem. Um menino está cortado da foto.'], ['O refeitório', 'Dez pratos postos. Um tem o meu nome.'], ['A escada', 'Alguém sobe. Não dá para ver o rosto.'], ['Sala 13', 'Esta mesma sala. Com uma menina sentada na cama.']];
    fotos.forEach(([titulo, frase], i) => {
      const tex = A.canvasTex(128, 96, (g, w, h) => { g.fillStyle = '#d6cdb2'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a342a'; g.fillRect(8, 8, w - 16, h - 28); g.fillStyle = '#6a6252'; g.beginPath(); g.arc(30 + i * 20, 40, 10, 0, 6.2832); g.fill(); g.fillRect(25 + i * 20, 48, 10, 24); g.fillStyle = '#1a1710'; g.font = '11px Georgia'; g.textAlign = 'center'; g.fillText(titulo, w / 2, h - 7); });
      const m = A.plano(.8, .6, new THREE.MeshStandardMaterial({ map: tex, roughness: .9 }), OX - 2.88, 1.6, OZ - 1.6 + i * 1.1, Math.PI / 2, sala3);
      acao(m, `<b>E</b>Olhar a fotografia: ${titulo}`, () => lia(frase));
    });
    const sair = box(.08, 2.1, .9, MAT.madeiraEsc, OX + 2.88, 1.05, OZ, sala3, false);
    acao(sair, '<b>E</b>Sair da sala 13', () => A.fade(true, () => { P.pos.set(0, P.pos.y, -39.5); P.yaw = Math.PI / 2; P.vx = P.vz = 0; A.fade(false); }, 450));
    sala3.visible = true; // as paredes ficam longe do mapa (invisíveis para quem não entra)
    const revelada = () => !!S.flags.l6b_porta13;
    let silencio = S.flags.l6b_s13 || 0, tt = 0;
    acao(porta, '<b>E</b>Abrir a porta sem número', () => {
      if (!revelada()) return;
      som('rangido', -2.9, 1.2, -39.5, .8); A.fade(true, () => { P.pos.set(OX - 2.2, P.pos.y, OZ + 2); P.yaw = -Math.PI / 2; P.vx = P.vz = 0; A.fade(false); if (!S.flags.l6b_dentro13) { S.flags.l6b_dentro13 = true; A.conquista('l6b_fantasma'); setTimeout(() => lia('Fotografias do internato. Esta sala não está em nenhuma planta. Cômodo fantasma.'), 800); } }, 450);
    }).on = () => porta.visible;
    tick(dt => {
      tt += dt; cad.rotation.x = Math.sin(tt * 1.1) * .08;
      if (revelada()) { porta.material.emissiveIntensity = .4 + Math.sin(tt * 2) * .15; return; }
      if (sala() === 'corr' && !S.flashOn && !P.sprinting) {
        silencio += dt; S.flags.l6b_s13 = silencio;
        if (silencio >= 10) { S.flags.l6b_porta13 = true; porta.visible = true; som('sussurros', 1); A.toast('Uma luz fraca sob uma porta sem número, na parede do corredor.'); mexer(o => { o.sala13 = 1; }); }
      } else if (P.sprinting || S.flashOn) silencio = Math.max(0, silencio - dt * 2);
    });
    if (revelada()) porta.visible = true;
    porta.userData.leitura = { t: 'Porta sem número, com luz fraca' };
  });

  // [89-92] o corredor que não acaba (rejogada): atravessar com a lanterna acesa devolve ao começo; apagar a lanterna dá a saída
  F('infinito', () => {
    if (!B.ng || B.esc('inf', 3) === 0) return; // em uma noite de cada três o corredor se comporta
    let loops = S.flags.l6b_loops || 0, zAnt = P.pos.z, pend = false;
    const detalhes = [];
    const mk = (i, fn) => { const g = new THREE.Group(); grupo.add(g); fn(g); g.visible = false; detalhes[i] = g; };
    mk(0, g => { const m = A.plano(.7, .9, new THREE.MeshBasicMaterial({ color: 0x151008 }), -2.9, 1.7, -22, Math.PI / 2, g); const r = A.plano(.3, .3, new THREE.MeshBasicMaterial({ color: 0xb6a889 }), -2.89, 1.8, -22, Math.PI / 2, g); }); // um retrato novo
    mk(1, g => { const p = box(.06, 2, .9, MAT.madeiraEsc, 2.5, 1.0, -34, g, false); p.rotation.y = -.9; p.position.x = 2.2; }); // uma porta entreaberta
    mk(2, g => { for (let i = 0; i < 5; i++) A.plano(.4, .4, new THREE.MeshBasicMaterial({ color: 0x050403 }), -2.9, 1.3 + (i % 2) * .5, -42 + i * 1.2, Math.PI / 2, g); }); // marcas de mãos de criança
    const aplicar = () => detalhes.forEach((g, i) => { g.visible = loops > i; });
    aplicar();
    nota('l6b_infinito', 'Bilhete preso no último quadro', 'Você apagou a lanterna ou contou até três. Funciona dos dois jeitos.\n\nO corredor só se repete para quem tem medo de olhar no escuro.\n— D.');
    tick(() => {
      const z = P.pos.z, x = P.pos.x;
      if (pend) { zAnt = z; return; }
      if (sala() === 'corr' && S.flashOn && zAnt > -30 && z <= -30 && Math.abs(x) < 3 && loops < 3) {
        loops++; pend = true; S.flags.l6b_loops = loops; som('sussurros', 2);
        A.fade(true, () => { pend = false; P.pos.set(x, P.pos.y, -6); P.yaw = 0; P.vx = P.vz = 0; aplicar(); A.fade(false); if (loops === 1) lia('Voltei ao começo do corredor... e tem um retrato novo na parede. Talvez atravessar sem a lanterna?'); else if (loops === 2) lia('Uma porta entreaberta que não estava aí. O corredor me devolve, de lanterna acesa.'); else { lia('Três vezes. A lanterna dá medo a ele. Vou apagar e seguir só pelo som.'); setTimeout(() => A.lerNota('l6b_infinito'), 3200); } }, 400);
        zAnt = -6; return;
      }
      if (loops >= 3 && !S.flags.l6b_infFim && z < -40) { S.flags.l6b_infFim = true; A.toast('O corredor aceita você. A terceira volta termina aqui.'); }
      zAnt = z;
    });
  });

  // [93-94] ala interditada com fita zebrada: dentro, um curativo e a risada da Ana atrás da parede
  F('interditada', () => {
    const cand = [['dormA', -2.9, -8, Math.PI / 2], ['dormB', -2.9, -20, Math.PI / 2], ['dormD', 2.9, -19.14, -Math.PI / 2]];
    const c = cand[B.esc('interd', 3)], r = A.SALA(c[0]); if (!r) return;
    const fita = A.canvasTex(256, 32, (g, w, h) => { g.fillStyle = '#d8b820'; g.fillRect(0, 0, w, h); g.fillStyle = '#111'; for (let i = -2; i < 12; i++) { g.beginPath(); g.moveTo(i * 28, h); g.lineTo(i * 28 + 14, h); g.lineTo(i * 28 + 30, 0); g.lineTo(i * 28 + 16, 0); g.fill(); } });
    const mat = new THREE.MeshBasicMaterial({ map: fita, side: THREE.DoubleSide });
    const f1 = A.plano(1.15, .14, mat, c[1], 1.0, c[2], c[3]), f2 = A.plano(1.15, .14, mat, c[1], 1.45, c[2], c[3]); f1.rotation.z = .1; f2.rotation.z = -.12;
    f1.userData.leitura = { t: 'Fita de interdição: NÃO ENTRE' };
    A.ITENS.kit('l6b_int_kit', A.spot(c[0], 'mesa', 2));
    let entrou = !!S.flags.l6b_interd;
    tick(() => {
      if (entrou || sala() !== c[0]) return; entrou = true; S.flags.l6b_interd = true;
      A.emitNoise((r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2, 12); setTimeout(() => som('risada', c[1] < 0 ? r.x0 - 1 : r.x1 + 1, (r.z0 + r.z1) / 2), 1500);
      lia('Passei pela fita. Atrás da parede, alguém riu baixinho. Acho que a Ana mora por aqui.');
    });
  });

  // poças e acústica também no andar de cima
  F('goteiras', () => { mulFns.push(goteiras(A, S, B, [[0, -10], [0, -22], [0, -34], [0, -46], [-8, -31], [8, -31], [8, -5], [-8, -53]], 3, 'poca')); });
  F('acustica', () => { mulFns.push(acustica(A, S, B, ['banhS', 'sotao', 'roup', 'dormC'], ['dormA', 'dormB', 'dormD', 'brinq'], 'ac')); });

  // [97-99] tabuleiro de sessão no quarto da Celeste: três perguntas, respostas verdadeiras, medo como preço
  F('tabuleiro', () => {
    const p = A.spot('celeste', 'mesa', 3);
    const g0 = new THREE.Group(); g0.position.set(p.x, p.y + .02, p.z); grupo.add(g0);
    const tex = A.canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#2a1c10'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8c89a'; g.font = '22px Georgia'; g.textAlign = 'center'; g.fillText('SIM            NÃO', w / 2, 40); g.font = '18px Georgia'; g.fillText('A B C D E F G H I J K L M', w / 2, 90); g.fillText('N O P Q R S T U V W X Y Z', w / 2, 118); g.fillText('ADEUS', w / 2, 148); });
    const tab = new THREE.Mesh(new THREE.BoxGeometry(.55, .02, .34), new THREE.MeshStandardMaterial({ map: tex })); tab.position.y = .01; g0.add(tab);
    const plaq = cyl(.035, .035, .01, MAT.bronze, 0, .03, 0, 8, g0);
    let alvoX = 0, alvoZ = 0;
    tick(dt => { plaq.position.x += (alvoX - plaq.position.x) * Math.min(1, dt * 2.2); plaq.position.z += (alvoZ - plaq.position.z) * Math.min(1, dt * 2.2); });
    const perguntas = [
      ['onde ele está?', () => { const r = A.M.ativo ? A.roomAt(A.M.pos.x, A.M.pos.z) : null; return r ? `A plaqueta soletra: ${r.nome.toUpperCase()}.` : 'A plaqueta vai ao NÃO: ele dorme.'; }],
      ['qual cama é segura?', () => bIntocada ? `A plaqueta pára no ${ordemNomes[iRiscado].toUpperCase()}: a cama dele nunca foi desfeita.` : 'A plaqueta vai ao NÃO.'],
      ['o que falta?', () => S.inv.engrenagens < 3 ? 'A plaqueta soletra: ENGRENAGEM. NO FUNDO DO CORREDOR.' : !S.done.caixinha ? 'A plaqueta soletra: DAR CORDA.' : !S.inv.chaves.porao ? 'A plaqueta soletra: CHAVE. AQUI.' : 'A plaqueta soletra: DESCER.']
    ];
    perguntas.forEach(([q, resp], i) => {
      const f = cyl(.03, .03, .012, MAT.bronze, -.18 + i * .18, .03, .2, 8, g0);
      f.userData.leitura = { t: 'Tabuleiro de sessão' };
      acao(f, () => S.flags['l6b_tab' + i] ? 'A plaqueta já respondeu a essa.' : `<b>E</b>Perguntar à tábua: ${q}`, () => {
        if (S.flags['l6b_tab' + i]) return; S.flags['l6b_tab' + i] = true;
        alvoX = (B.rnd('tx' + i) - .5) * .4; alvoZ = (B.rnd('tz' + i) - .5) * .2;
        S.fear = Math.min(100, S.fear + 14); som('sussurros', 2); A.emitNoise(p.x, p.z, 11); // cada pergunta custa medo e chama o Chamado
        setTimeout(() => lia(resp()), 1800);
      });
    });
  });

  // [100-101] varal de lençóis na rouparia: tira a visão, roça no tecido, e às vezes tem alguém do outro lado
  F('varal', () => {
    const mat = new THREE.MeshStandardMaterial({ color: 0xcfc8b8, roughness: 1, transparent: true, opacity: .78, side: THREE.DoubleSide });
    const folhas = [5.2, 7.4, 9.6].map((x, i) => { const m = A.plano(2.8, 1.5, mat, x, 1.55, -7, Math.PI / 2); m.userData.fase = i; return m; });
    box(.03, .03, 4, MAT.metal, 5.2, 2.35, -7, grupo, false); box(.03, .03, 4, MAT.metal, 7.4, 2.35, -7, grupo, false); box(.03, .03, 4, MAT.metal, 9.6, 2.35, -7, grupo, false);
    const sil = B.silhueta(7.4, -7.9, 1); sil.visible = false;
    let tt = 0, dentro = -1, vezes = 0, silT = 0;
    tick(dt => {
      tt += dt; folhas.forEach((m, i) => { m.rotation.y = Math.PI / 2 + Math.sin(tt * 1.3 + i) * .06; });
      const k = folhas.findIndex(m => Math.abs(P.pos.x - m.position.x) < .5 && P.pos.z < -5.6 && P.pos.z > -8.4);
      if (k >= 0 && k !== dentro) { som('papel'); som('arrastar'); }
      dentro = k;
      if (sala() === 'roup') {
        if (silT <= 0 && vezes < 2 && Math.random() < dt * .08) { silT = 5; vezes++; sil.visible = true; sil.position.set(7.4, 0, -7.8); } // [101] uma silhueta do outro lado
        if (silT > 0) { silT -= dt; sil.position.z = -7.8 - (5 - silT) * .3; if (silT <= 0) sil.visible = false; }
      } else { sil.visible = false; silT = 0; }
    });
  });

  // [102] placas dos dormitórios trocadas na rejogada
  F('placas', () => {
    if (!B.ng || noites < 3) return;
    const a = A.DOOR('dA'), b = A.DOOR('dB'), c = A.DOOR('dC'), d = A.DOOR('dD'); if (!a || !b || !c || !d) return;
    [[a, c], [b, d]].forEach(([p, q]) => { const t = p.nome; p.nome = q.nome; q.nome = t; });
    let falou = false; tick(() => { if (!falou && ['dormA', 'dormB', 'dormC', 'dormD'].includes(sala())) { falou = true; lia('A placa na porta diz outro dormitório. Isso não era assim.'); } });
  });

  // a casa envelhece também aqui em cima
  F('envelhece', () => {
    mofo(A, B, noites, [[-2.93, 1.9, -12, Math.PI / 2], [2.93, 2.1, -28, -Math.PI / 2], [-2.93, 1.7, -44, Math.PI / 2], [2.93, 1.8, -52, -Math.PI / 2], [-2.93, 2, -18, Math.PI / 2], [2.93, 1.9, -8, -Math.PI / 2]]);
  });

  X.ruidoMul = () => mulFns.reduce((m, f) => m * f(), 1);
  X.entrar = function () {
    if (!X._ruido && X.def) { X._ruido = true; const o = X.def.ruidoMul; X.def.ruidoMul = () => (o ? o() : 1) * X.ruidoMul(); }
  };
  return X;
}
