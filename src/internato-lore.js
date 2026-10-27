// INTERNATO — LORE (Lote 2): lugares que contam a história sozinhos.
// loreTerreo() e loreSuperior() são chamados por terreo() e superior() em mapas.js e devolvem ganchos
// { sync, entrar, inicioCapitulo, entrouSala, fitaOuvida, anaFim } que juntar() encadeia com os do mapa.
// Tudo procedural: texturas em canvas, som com o AudioContext do motor (A.audio()).

// Memórias do internato: leituras opcionais que contam a história (contador próprio, não mexe no diário)
const MEM_T = ['visitas', 'honra', 'correio', 'planta', 'chamadaQ', 'fuligem', 'santo', 'ponto', 'galeria', 'sombras', 'chamada', 'castigo', 'folclore', 'atril', 'fichario', 'reporter', 'carimbo', 'lugar38', 'chamadaRef', 'canecas', 'altDespensa', 'retidas', 'exemplar', 'maquina', 'maquete', 'regua', 'prontuario', 'pranchetaAna', 'uniforme23', 'lencois', 'mochila', 'espelhos', 'manutencao', 'bilheteJ', 'radioM', 'banco', 'raiox', 'copo', 'descarga', 'amarelinha'];
const MEM_S = ['desenhos', 'malas', 'sapateira', 'espelhoP', 'maoJ', 'armDavi', 'cartasDavi', 'camaAna', 'velas', 'uniformes', 'placar', 'teatro', 'casinha', 'bestiario', 'risquinhos', 'cabana', 'cartaCeleste', 'malaCeleste', 'ninho', 'arranhoes', 'varal', 'lata'];
const MEM_TOTAL = MEM_T.length + MEM_S.length;

// Frases riscadas por dentro dos armários (sorteadas sem repetir na partida)
const INSCRICOES = [
  'conta até cem que ele passa', 'mãe vem no natal', 'T.R. — 4 horas', 'ele cheira a cera de assoalho',
  'não respira quando ele encosta na porta', 'ele passa às 9 e 20', 'eu não falei. eu não falei.', 'A.L.P. — 1 2 3 4 5 6 7 8 9 10',
  'ROSA, 1964 — tô com medo', 'se ele parar, conta de cabeça', 'B., 1975 — 6 horas', 'Deus, faz ele ficar surdo',
  'quem ler isso: não chora', 'D.M. — a Lia vem me buscar', 'J., 1958 — tem grampo no chão, a porta abre', 'amanhã o sino'
];

// ---------- utilidades
function nomeJogador() {
  try { const r = localStorage.getItem('hora-silencio-nome'); if (!r) return ''; let v = r; try { v = JSON.parse(r); } catch (e) {} return typeof v === 'string' ? v.trim().slice(0, 16) : ''; } catch (e) { return ''; }
}
function hoje() { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)}`; }

function base(A, S) {
  const { THREE } = A;
  const agenda = [];
  const depois = (t, f) => agenda.push({ t, f });
  const _v = new THREE.Vector3(), _f = new THREE.Vector3();
  const olhando = (x, y, z, cos = .8, alcance = 16) => {
    _v.set(x, y, z).sub(A.camera.position); const d = _v.length(); if (d > alcance || d < .01) return false;
    A.camera.getWorldDirection(_f); return _f.dot(_v.multiplyScalar(1 / d)) > cos;
  };
  const dist = (x, z) => Math.hypot(A.P.pos.x - x, A.P.pos.z - z);
  const tex = (w, h, draw) => { const t = A.canvasTex(w, h, draw); t.userData = { clone: true }; return t; };
  const sala = () => (A.P.room && A.P.room.id) || '';
  const medo = n => { S.fear = Math.min(100, S.fear + n); };
  // memórias: contador próprio
  const mem = id => {
    const m = S.flags.memorias || (S.flags.memorias = {});
    if (m[id]) return; m[id] = true;
    const n = Object.keys(m).length;
    A.toast(`Memória do internato ${n}/${MEM_TOTAL}`);
    if (n === 12) depois(4, () => A.sub('lia', 'Cada parede daqui guarda uma criança. Eu tô lendo um cemitério.'));
    if (n >= MEM_TOTAL) depois(4, () => { A.sub('lia', 'Agora eu sei o nome de todos eles. Ninguém mais vai esquecer.'); S.inv.kits++; A.toast('Todas as memórias do internato. Você encontrou um curativo esquecido.'); });
  };
  // leitura com E: abre um diálogo e marca a memória
  const ler = (obj, rotulo, linhas, opts = {}) => {
    const chave = 'lido_' + (opts.mem || rotulo);
    return A.interact(obj, () => {
      const r = typeof rotulo === 'function' ? rotulo() : rotulo;
      return `<b>E</b>${r}${S.flags[chave] && !opts.semLido ? '<small style="opacity:.6"> (lido)</small>' : ''}`;
    }, () => {
      if (opts.cond && !opts.cond()) return;
      const ls = typeof linhas === 'function' ? linhas() : linhas;
      if (!ls || !ls.length) return;
      const primeira = !S.flags[chave]; S.flags[chave] = true;
      if (opts.som !== false) A.SFX.papel();
      if (opts.ruido) A.emitNoise(A.P.pos.x, A.P.pos.z, opts.ruido);
      A.dialogo(ls, () => { if (opts.mem) mem(opts.mem); if (opts.aoLer) opts.aoLer(primeira); });
    }, opts.cond ? { on: opts.cond } : {});
  };
  const decal = (t, w, h, x, y, z, ry = 0, extra = {}) => A.plano(w, h, new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: .95, depthWrite: false, ...extra }), x, y, z, ry);
  // clarão do relâmpago (o motor não expõe o raio: medimos o salto da luz do céu)
  let hb = null, raio = 0;
  A.W.tick.push(dt => {
    for (let i = agenda.length - 1; i >= 0; i--) { agenda[i].t -= dt; if (agenda[i].t <= 0) { const f = agenda[i].f; agenda.splice(i, 1); try { f(); } catch (e) { console.warn(e); } } }
    const J = window.__jogo; if (!J || !J.hemi) return;
    const h = J.hemi.intensity; if (hb === null) hb = h;
    raio = h - hb > .12 ? h - hb : 0;
    hb += (h - hb) * Math.min(1, dt * (h > hb ? .6 : 3));
  });
  // escuro de verdade: lanterna apagada e você parada (para a tinta de relógio aparecer)
  let ult = null, paradaT = 0;
  A.W.tick.push(dt => {
    const p = A.P.pos; const mov = ult ? Math.hypot(p.x - ult.x, p.z - ult.z) : 0; ult = { x: p.x, z: p.z };
    if (!S.flashOn && mov < dt * .4) paradaT += dt; else paradaT = 0;
  });
  return { depois, olhando, dist, tex, sala, medo, mem, ler, decal, raio: () => raio, parada: () => paradaT };
}

// ---------- sons procedurais pequenos (gota, apito, campainha, tilintar, raspar)
function sons(A) {
  const au = () => { try { return A.audio(); } catch (e) { return null; } };
  const tom = (pos, tipo, f0, f1, dur, pico, wet = .3) => {
    const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(pos ? { x: pos.x, y: pos.y ?? 1.2, z: pos.z } : null, wet);
    const o = a.AC.createOscillator(); o.type = tipo; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    o.connect(g); a.env(g, t, .004, pico, dur); o.start(t); o.stop(t + dur + .05); o.onended = () => o.disconnect();
  };
  return {
    gota: p => tom(p, 'sine', 1600, 480, .09, .09),
    apito: (p, k) => { tom(p, 'sine', 2300 + k * 150, 2600 + k * 200, 1.1, .03 + k * .02, .2); tom(p, 'triangle', 4700, 5100, 1.1, .01 + k * .006, .2); },
    campainha: p => { const a = au(); if (!a) return; const t = a.AC.currentTime; for (let i = 0; i < 26; i++) { const g = a.saida({ x: p.x, y: 2.6, z: p.z }, .45); const o = a.AC.createOscillator(); o.type = 'square'; o.frequency.value = 980; o.connect(g); a.env(g, t + i * .05, .003, .045, .035); o.start(t + i * .05); o.stop(t + i * .05 + .05); o.onended = () => o.disconnect(); } },
    tilintar: p => { for (const [f, d] of [[2400, .35], [3150, .3], [3720, .25]]) tom(p, 'sine', f, f * .98, d, .05); },
    raspar: p => { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(p ? { x: p.x, y: .8, z: p.z } : null, .2); a.burst(t, .22, 'bandpass', 2200, 3, g); a.env(g, t, .02, .08, .2); },
    tecla: p => { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida({ x: p.x, y: .9, z: p.z }, .2); a.burst(t, .04, 'highpass', 3000, 1, g); a.env(g, t, .002, .18, .04); },
    colher: p => tom(p, 'sine', 3300, 3100, .18, .03, .4)
  };
}

// ---------- texturas
function manchar(g, w, h, n = 6, cor = 'rgba(0,0,0,.35)') {
  for (let i = 0; i < n; i++) { const x = Math.random() * w, y = Math.random() * h, r = 20 + Math.random() * 70; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, cor); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
}
function escrever(g, linhas, { x = 24, y = 40, lh = 28, fonte = '20px Georgia', cor = '#2a2018', alinhar = 'left', tremor = .02 } = {}) {
  g.fillStyle = cor; g.textAlign = alinhar;
  linhas.forEach((l, i) => { const o = typeof l === 'string' ? { t: l } : l; g.save(); g.translate(x + (Math.random() - .5) * 3, y + i * lh); g.rotate((Math.random() - .5) * tremor); g.font = o.fonte || fonte; if (o.cor) g.fillStyle = o.cor; g.fillText(o.t, 0, 0); g.restore(); g.fillStyle = cor; });
}
function papelTex(U, w, h, linhas, opts = {}) {
  return U.tex(w, h, (g) => { g.fillStyle = opts.fundo || '#cbbd98'; g.fillRect(0, 0, w, h); manchar(g, w, h, 5, 'rgba(90,60,20,.25)'); escrever(g, linhas, opts); if (opts.depois) opts.depois(g, w, h); });
}
function giz(U, w, h, desenhar, fundo = null) {
  return U.tex(w, h, (g) => { if (fundo) { g.fillStyle = fundo; g.fillRect(0, 0, w, h); } else g.clearRect(0, 0, w, h); g.lineCap = 'round'; g.lineJoin = 'round'; desenhar(g, w, h); });
}
function boneco(g, x, y, s, cor, { alto = false, olhos = true, vela = false } = {}) { // figura de criança em giz de cera
  g.strokeStyle = cor; g.lineWidth = 4 * s;
  const a = alto ? 2.1 : 1;
  g.beginPath(); g.arc(x, y - 52 * s * a, 10 * s, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(x, y - 42 * s * a); g.lineTo(x, y - 14 * s * a); g.moveTo(x, y - 36 * s * a); g.lineTo(x - 14 * s, y - 24 * s * a); g.moveTo(x, y - 36 * s * a); g.lineTo(x + 14 * s, y - 24 * s * a);
  g.moveTo(x, y - 14 * s * a); g.lineTo(x - 9 * s, y); g.moveTo(x, y - 14 * s * a); g.lineTo(x + 9 * s, y); g.stroke();
  if (olhos) { g.fillStyle = cor; g.fillRect(x - 5 * s, y - 55 * s * a, 3 * s, 3 * s); g.fillRect(x + 2 * s, y - 55 * s * a, 3 * s, 3 * s); }
  else { g.lineWidth = 3 * s; g.beginPath(); g.moveTo(x - 8 * s, y - 54 * s * a); g.lineTo(x + 8 * s, y - 54 * s * a); g.stroke(); }
  if (vela) { g.fillStyle = '#f0c040'; g.beginPath(); g.moveTo(x + 14 * s, y - 24 * s * a); g.lineTo(x + 40 * s, y - 36 * s * a); g.lineTo(x + 40 * s, y - 12 * s * a); g.closePath(); g.globalAlpha = .5; g.fill(); g.globalAlpha = 1; }
}
function tracinhos(g, x0, y0, w, h, n, cor = 'rgba(210,210,200,.7)', grupo = 5) {
  g.strokeStyle = cor; g.lineWidth = 2;
  let x = x0, y = y0;
  for (let i = 0; i < n; i++) {
    const k = i % grupo;
    if (k === grupo - 1 && grupo === 5) { g.beginPath(); g.moveTo(x - 26, y + 18); g.lineTo(x + 2, y + 2); g.stroke(); }
    else { g.beginPath(); g.moveTo(x + (Math.random() - .5) * 2, y); g.lineTo(x + (Math.random() - .5) * 3, y + 20); g.stroke(); }
    x += k === grupo - 1 ? 16 : 7;
    if (x > x0 + w) { x = x0; y += 28; if (y > y0 + h) break; }
  }
}

// ---------- tinta que só aparece no escuro (lanterna apagada e você parada)
function tintaRelogio(A, S, U) {
  const { THREE } = A;
  const lista = [];
  let avisou = !!S.flags.dicaTintaRel;
  const nova = (t, w, h, x, y, z, ry = 0, rx = 0) => {
    const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, color: 0x9dffb0, depthWrite: false, blending: THREE.AdditiveBlending });
    const p = A.plano(w, h, m, x, y, z, ry); if (rx) p.rotation.x = rx; p.visible = false; lista.push({ p, m, x, y, z }); return p;
  };
  A.W.tick.push(dt => {
    const alvo = U.parada() > 2 && !S.flashOn ? 1 : 0;
    for (const L of lista) {
      const perto = U.dist(L.x, L.z) < 9;
      const a = perto ? alvo : 0;
      L.m.opacity += (a * .85 - L.m.opacity) * Math.min(1, dt * (a ? .7 : 4));
      L.p.visible = L.m.opacity > .01;
      if (!avisou && L.m.opacity > .4 && U.olhando(L.x, L.y, L.z, .7, 9)) { avisou = S.flags.dicaTintaRel = true; A.sub('lia', '(bem baixinho) Tinta de ponteiro de relógio... As crianças escreviam com isso. Só aparece no escuro.'); }
    }
  });
  return nova;
}
function texTinta(U, linhas, { w = 512, h = 256, tam = 44, maos = 0 } = {}) {
  return U.tex(w, h, (g) => {
    g.clearRect(0, 0, w, h); g.fillStyle = '#fff'; g.textAlign = 'center';
    linhas.forEach((l, i) => { g.save(); g.translate(w / 2, (h / (linhas.length + 1)) * (i + 1) + tam * .35); g.rotate((Math.random() - .5) * .1); g.font = `bold ${tam}px Georgia`; g.fillText(l, 0, 0); g.restore(); });
    for (let i = 0; i < maos; i++) { const x = 30 + Math.random() * (w - 60), y = 30 + Math.random() * (h - 60), s = .7 + Math.random() * .4; g.beginPath(); g.ellipse(x, y, 13 * s, 16 * s, 0, 0, 7); g.fill(); for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x - 12 * s + k * 6 * s, y - 20 * s - (k === 0 ? -8 * s : Math.abs(k - 2.2) * -2 * s), 2.6 * s, 7 * s, (k - 2) * .2, 0, 7); g.fill(); } }
  });
}

// ---------- setas de giz do Davi: caveirinha + D no rodapé, só sob a lanterna, apontando o objetivo atual
function setasDavi(A, S, U, rotas, alvo) {
  const { THREE } = A;
  const mk = dir => U.tex(128, 64, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(150,190,235,.95)'; g.fillStyle = 'rgba(150,190,235,.95)'; g.lineWidth = 4; g.lineCap = 'round';
    g.save(); if (dir < 0) { g.translate(w, 0); g.scale(-1, 1); }
    g.beginPath(); g.moveTo(14, 34); g.lineTo(96, 34); g.moveTo(96, 34); g.lineTo(80, 22); g.moveTo(96, 34); g.lineTo(80, 46); g.stroke();
    g.beginPath(); g.arc(106, 22, 8, 0, 7); g.stroke(); g.fillRect(102, 20, 3, 3); g.fillRect(108, 20, 3, 3);
    g.restore(); g.font = 'bold 20px Georgia'; g.textAlign = 'center'; g.fillText('D', dir < 0 ? 104 : 24, 58);
  });
  const tD = mk(1), tE = mk(-1);
  const setas = [];
  for (const [k, lista] of Object.entries(rotas)) for (const [x, z, ry, dx, dz] of lista) {
    const lx = Math.cos(ry), lz = -Math.sin(ry); // eixo +x do plano no mundo
    const m = new THREE.MeshStandardMaterial({ map: (dx * lx + dz * lz) >= 0 ? tD : tE, transparent: true, opacity: 0, depthWrite: false, roughness: 1, emissive: 0x203040, emissiveIntensity: .4 });
    const p = A.plano(.42, .21, m, x, .22, z, ry); p.visible = false;
    setas.push({ k, p, m, x, z });
  }
  A.W.tick.push(dt => {
    const a = alvo();
    for (const s of setas) {
      const ok = s.k === a && S.flashOn && U.dist(s.x, s.z) < 4.2 && U.olhando(s.x, .22, s.z, .55, 4.5);
      s.m.opacity += ((ok ? .9 : 0) - s.m.opacity) * Math.min(1, dt * (ok ? 3 : 1.2));
      s.p.visible = s.m.opacity > .02;
      if (ok && s.m.opacity > .6 && !S.flags.dicaSetaDavi) { S.flags.dicaSetaDavi = true; A.sub('lia', 'Uma caveirinha de pirata e um D... O código que a gente usava no quintal. Ele marcou o caminho pra mim.'); }
    }
  });
}

// ---------- inscrições por dentro dos armários (as duas plantas)
function inscricoesArmarios(A, S, U, especiais) {
  const { THREE } = A;
  const feitos = new Map();
  const ins = S.flags.insc || (S.flags.insc = {});
  const usadas = S.flags.inscUsadas || (S.flags.inscUsadas = []);
  const chave = L => `${A.W.mapa}:${Math.round(L.x * 10)}:${Math.round(L.z * 10)}`;
  const esp = L => especiais.find(e => Math.hypot(e.x - L.x, e.z - L.z) < .3);
  const texDe = (frase, riscos, antigo) => U.tex(256, 320, (g, w, h) => {
    g.fillStyle = antigo ? '#3a3a2a' : '#2e3b30'; g.fillRect(0, 0, w, h); manchar(g, w, h, 6, 'rgba(0,0,0,.4)');
    tracinhos(g, 26, 30, 200, antigo ? 200 : 90, riscos, 'rgba(200,200,185,.55)');
    g.fillStyle = 'rgba(225,222,205,.85)'; g.font = antigo ? 'bold 26px Georgia' : 'italic 22px Georgia'; g.textAlign = 'center';
    const pal = frase.split(' '), ls = []; let l = '';
    for (const p of pal) { if ((l + ' ' + p).length > 16) { ls.push(l); l = p; } else l = l ? l + ' ' + p : p; } if (l) ls.push(l);
    ls.forEach((t, i) => { g.save(); g.translate(w / 2, (antigo ? 250 : 170) + i * 28); g.rotate((Math.random() - .5) * .08); g.fillText(t, 0, 0); g.restore(); });
    g.strokeStyle = 'rgba(30,20,15,.6)'; g.lineWidth = 1; for (let i = 0; i < 30; i++) { const x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - .5) * 30, y + Math.random() * 12); g.stroke(); }
  });
  let lidas = Object.keys(ins).length, hidT = 0, hidL = null;
  A.W.tick.push(dt => {
    const L = S.hidden;
    if (!L || L.tipo !== 'armario') { hidL = null; hidT = 0; return; }
    if (hidL !== L) { hidL = L; hidT = 0; }
    hidT += dt;
    if (!feitos.has(L)) {
      const k = chave(L), e = esp(L);
      let frase = e ? e.frase : ins[k];
      if (!frase) { const livres = INSCRICOES.filter(f => !usadas.includes(f)); frase = livres.length ? livres[Math.floor(Math.random() * livres.length)] : INSCRICOES[Math.floor(Math.random() * INSCRICOES.length)]; }
      const m = A.plano(.78, .98, new THREE.MeshStandardMaterial({ map: texDe(frase, e ? 160 : 12 + Math.floor(Math.random() * 30), !!e), roughness: .9 }), 0, 1.5, .29, Math.PI, L.g);
      feitos.set(L, { k, frase, e, m });
    }
    const f = feitos.get(L);
    if (S.flashOn && hidT > .9 && !ins[f.k]) {
      ins[f.k] = f.frase; if (!usadas.includes(f.frase)) usadas.push(f.frase); lidas++;
      A.sub('lia', `(baixinho) Riscado por dentro da porta: “${f.frase}”.`);
      if (lidas === 6) U.depois(5, () => A.sub('lia', '(baixinho) Quarenta anos de crianças trancadas aqui dentro. E ninguém ouviu nenhuma.'));
    }
    if (f.e && f.e.aoFicar && hidT > 3 && !S.flags['inscE_' + f.k]) { S.flags['inscE_' + f.k] = true; f.e.aoFicar(); }
  });
}

// =====================================================================
// TÉRREO
// =====================================================================
export function loreTerreo(A, S, ctx = {}) {
  const { THREE, MAT, box, cyl, plano, interact, SFX } = A;
  const U = base(A, S), SOM = sons(A), H = {}, W = A.W;
  const M = A.M;
  const tinta = tintaRelogio(A, S, U);
  const nome = () => nomeJogador() || 'Lia Moraes';
  const PROC = () => (window.__jogo && window.__jogo.PROC) || {};

  // ---- RECEPÇÃO
  // livro de visitas no balcão (a última linha já tem a sua assinatura)
  const livroV = new THREE.Group(); livroV.position.set(2.1, 1.165, -4.05); W.grupo.add(livroV);
  const tLivroV = papelTex(U, 256, 160, ['Visitas — 1977 a 1979', 'Sra. Prado — negada', 'Família Moraes — 18/03/78', 'Sra. Moraes — negada', '...', ''], { fonte: '15px Georgia', y: 26, lh: 22, x: 14 });
  const pl = plano(.42, .28, new THREE.MeshStandardMaterial({ map: tLivroV, roughness: .9 }), 0, .012, 0, 0, livroV); pl.rotation.x = -Math.PI / 2;
  box(.44, .02, .3, MAT.madeiraEsc, 0, .004, 0, livroV, false);
  let visitasLidas = 0;
  U.ler(livroV, 'Ler o livro de visitas', () => {
    visitasLidas++;
    const n = nome();
    const ls = [
      { quem: 'lia', texto: '“Sra. Prado, mãe da aluna Ana — visita negada.” Três vezes. Depois a letra da mãe some.' },
      { quem: 'lia', texto: '“Família Moraes — 18/03/1978.” E embaixo, numa letra torta de criança: “Lia, 12 anos”. Eu.' },
      { quem: 'lia', texto: '“Sra. Moraes — mãe do aluno Davi — visita negada.” Todo ano. De 1979 a 1993. A letra cada vez mais tremida.' },
      { quem: 'lia', texto: `A última linha tá molhada: “${n} — 21h03 — motivo: buscar meu irmão.”` },
      { quem: 'lia', texto: n === 'Lia Moraes' ? 'Essa é a minha letra. Eu não assinei isso.' : 'Esse nome... Quem escreveu sabia que você vinha.' }
    ];
    if (visitasLidas >= 2) ls.push({ quem: 'lia', texto: 'Tem uma linha nova embaixo da minha. A mesma tinta fresca: “Joaquim B. — 1994 — motivo: fechar o portão”.' });
    return ls;
  }, { mem: 'visitas', semLido: true });
  // cesto de correspondência retida
  const cesto = new THREE.Group(); cesto.position.set(-.95, 1.165, -3.9); W.grupo.add(cesto);
  box(.36, .14, .26, new THREE.MeshStandardMaterial({ color: 0x6a4a28, roughness: 1 }), 0, .07, 0, cesto);
  for (let i = 0; i < 4; i++) { const c = plano(.2, .13, MAT.papel, -.08 + i * .05, .15, (i - 1.5) * .03, 0, cesto); c.rotation.x = -1.2 + i * .1; }
  U.ler(cesto, 'Mexer no cesto “CORRESPONDÊNCIA RETIDA PELA DIREÇÃO”', [
    { quem: 'lia', texto: 'Cartas que nunca saíram daqui. Uma da mãe da Ana: “Filha, mamãe vem buscar no Natal. Juro.”' },
    { quem: 'lia', texto: 'E uma com a minha letra de criança. 1978. “Davi, me desculpa. Eu não aguentei ficar quieta.”' },
    { quem: 'lia', texto: 'Eles seguravam até as nossas desculpas.' }
  ], { mem: 'correio' });
  // quadro de honra da Hora (parede oeste)
  const tHonra = U.tex(384, 320, (g, w, h) => {
    g.fillStyle = '#3a2614'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a6a30'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
    g.fillStyle = '#d8b860'; g.font = 'bold 18px Georgia'; g.textAlign = 'center'; g.fillText('ALUNO EXEMPLAR DA HORA DO SILÊNCIO', w / 2, 34);
    const anos = [1931, 1936, 1941, 1946, 1952, 1958, 1964, 1970, 1975, 1978];
    anos.forEach((a, i) => { const x = 28 + (i % 2) * 172, y = 54 + Math.floor(i / 2) * 44; g.fillStyle = '#b08a3a'; g.fillRect(x, y, 156, 32); g.fillStyle = '#2a1a0a'; g.font = '12px Georgia'; g.fillText(a === 1952 ? '1952 — Moacir Duarte' : `${a} — ${['J. Lemos', 'A. Furtado', 'R. Sá', 'P. Cunha', '', 'L. Antunes', 'C. Braga', 'O. Rios', 'F. Melo', 'S. Paiva'][i]}`, x + 78, y + 14); if (a === 1952) g.fillText('“nunca falou depois das nove”', x + 78, y + 27); });
    g.strokeStyle = '#b08a3a'; g.setLineDash([4, 4]); g.strokeRect(116, 278, 156, 30); g.setLineDash([]); g.fillStyle = '#8a6a30'; g.font = 'italic 12px Georgia'; g.fillText('1979 —', 194, 297);
  });
  const honra = plano(1.15, .96, new THREE.MeshStandardMaterial({ map: tHonra, roughness: .7 }), -5.87, 1.85, -6.6, Math.PI / 2);
  U.ler(honra, 'Ler o quadro de honra', [
    { quem: 'lia', texto: '“Aluno exemplar da Hora do Silêncio.” Uma plaquinha por ano.' },
    { quem: 'lia', texto: '1952: Moacir Duarte. “Nunca falou depois das nove.” Ele ganhou um prêmio por ficar calado.' },
    { quem: 'lia', texto: 'A de 1979 tá vazia. Só um prego torto.' }
  ], { mem: 'honra' });
  // planta do prédio emoldurada (parede leste) — o Davi marcou o caminho
  const planta = (q38) => U.tex(384, 280, (g, w, h) => {
    g.fillStyle = '#d6cba8'; g.fillRect(0, 0, w, h); manchar(g, w, h, 4, 'rgba(110,80,30,.25)'); g.strokeStyle = '#3a2a1a'; g.lineWidth = 2;
    const rx = x => 14 + (x + 34) / 68 * (w - 28), rz = z => 20 + (-z) / 34 * (h - 60);
    for (const [n, x0, x1, z0, z1] of [['Recepção', -6, 6, -14, 0], ['Aula', -20, -6, -10, 0], ['Biblioteca', -34, -20, -10, 0], ['Refeitório', -24, -6, -26, -14], ['Cozinha', -34, -24, -26, -14], ['Despensa', -34, -24, -34, -26], ['Diretoria', 6, 18, -10, 0], ['Enfermaria', 18, 34, -10, 0], ['Lavand.', 6, 16, -26, -14], ['Banh.', 16, 24, -26, -14], ['Máquinas', 24, 34, -26, -14], ['', -34, 34, -14, -10]]) {
      g.strokeRect(rx(x0), rz(z1), rx(x1) - rx(x0), rz(z0) - rz(z1)); g.fillStyle = '#3a2a1a'; g.font = '11px Georgia'; g.textAlign = 'center'; if (n) g.fillText(n, (rx(x0) + rx(x1)) / 2, (rz(z0) + rz(z1)) / 2 + 4);
    }
    g.fillStyle = '#3a2a1a'; g.font = 'bold 14px Georgia'; g.fillText('INTERNATO SÃO LÁZARO — TÉRREO', w / 2, h - 14);
    g.strokeStyle = 'rgba(30,30,90,.85)'; g.lineWidth = 3;
    for (const [x, z] of [[-29, -30], [26, -5]]) { g.beginPath(); g.moveTo(rx(x) - 9, rz(z) - 9); g.lineTo(rx(x) + 9, rz(z) + 9); g.moveTo(rx(x) + 9, rz(z) - 9); g.lineTo(rx(x) - 9, rz(z) + 9); g.stroke(); }
    g.fillStyle = 'rgba(30,30,90,.8)'; g.font = 'italic 11px Georgia'; g.fillText('gasolina', rx(-29), rz(-30) + 20); g.fillText('fusível', rx(26), rz(-5) + 20); g.fillText('D.', rx(29) + 30, rz(-20));
    g.strokeStyle = 'rgba(90,20,20,.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(rx(-20), rz(-31)); g.lineTo(rx(-6), rz(-33)); g.stroke();
    if (q38) { g.strokeStyle = 'rgba(60,50,40,.8)'; g.lineWidth = 1.5; g.setLineDash([3, 3]); g.strokeRect(rx(8), rz(-12.6), rx(16) - rx(8), 12); g.setLineDash([]); g.fillStyle = 'rgba(60,50,40,.9)'; g.font = 'italic 11px Georgia'; g.fillText('quarto 38', rx(12), rz(-12.6) + 10); }
  });
  const tPlanta = planta(false); let tPlanta38 = null;
  const quadroPlanta = plano(1.1, .8, new THREE.MeshStandardMaterial({ map: tPlanta, roughness: .8 }), 5.87, 1.75, -2.6, -Math.PI / 2);
  box(.03, .86, 1.16, MAT.madeiraEsc, 5.92, 1.75, -2.6, W.grupo, false);
  U.ler(quadroPlanta, 'Olhar a planta do prédio emoldurada', () => {
    const ls = [{ quem: 'lia', texto: 'A planta do térreo. Alguém riscou a lápis azul: um X na despensa, “gasolina”. Outro na enfermaria, “fusível”.' }, { quem: 'lia', texto: 'E um “D.” do lado da casa de máquinas. O Davi deixou o caminho pronto.' }];
    if (S.done.procissao) ls.push({ quem: 'lia', texto: 'Tem uma sala nova desenhada a lápis, no meio do corredor leste. “Quarto 38.” Esse prédio só tem 37 alunos.' });
    return ls;
  }, { mem: 'planta', semLido: true });
  // quadro de chamada com 37 plaquinhas (as três viradas desviram com a história)
  const tChamada = (vir) => U.tex(384, 280, (g, w, h) => {
    g.fillStyle = '#4a3220'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8c89a'; g.font = 'bold 15px Georgia'; g.textAlign = 'center'; g.fillText('CHAMADA DA NOITE', w / 2, 22);
    for (let i = 0; i < 37; i++) {
      const x = 14 + (i % 7) * 52, y = 34 + Math.floor(i / 7) * 40, esp = { 8: 'TOMÉ', 17: 'ANA', 26: 'DAVI' }[i];
      g.fillStyle = '#7a5a30'; g.beginPath(); g.arc(x + 23, y + 2, 2, 0, 7); g.fill();
      if (esp && !vir.includes(esp)) { g.fillStyle = '#2a1a0e'; g.fillRect(x, y + 6, 46, 24); }
      else { g.fillStyle = esp ? '#efe0b0' : '#c8b88a'; g.fillRect(x, y + 6, 46, 24); g.fillStyle = '#2a1a0e'; g.font = esp ? 'bold 10px Georgia' : '9px Georgia'; g.fillText(esp || ['ALVES', 'BRAGA', 'CUNHA', 'DIAS', 'ELIAS', 'FARIA', 'GOMES', 'HORTA', 'IVO', 'JACÓ', 'LEMOS', 'MELO'][i % 12], x + 23, y + 22); }
    }
  });
  const chamadaVir = () => { const v = []; if (S.chapter >= 2) v.push('TOMÉ'); if (S.chapter >= 3) v.push('ANA'); if (S.chapter >= 5) v.push('DAVI'); return v.join(','); };
  let chamadaK = null; const mChamada = new THREE.MeshStandardMaterial({ map: tChamada([]), roughness: .8 });
  const quadroChamada = plano(1.4, 1.02, mChamada, 3.6, 1.8, -.12, Math.PI);
  const syncChamada = () => { const k = chamadaVir(); if (k !== chamadaK) { chamadaK = k; mChamada.map = tChamada(k ? k.split(',') : []); mChamada.needsUpdate = true; } };
  U.ler(quadroChamada, 'Olhar o quadro de chamada', () => {
    const k = chamadaVir();
    return [{ quem: 'lia', texto: 'Trinta e sete plaquinhas com nome, penduradas em prego. Três viradas pra parede.' },
      k ? { quem: 'lia', texto: `Uma desvirou sozinha. ${k.split(',').join(', ')}. Como se alguém tivesse respondido “presente”.` } : { quem: 'lia', texto: 'Não tenho coragem de desvirar.' }];
  }, { mem: 'chamadaQ', semLido: true });
  // capa de chuva do Seu Joaquim, pingando (some depois do gerador)
  box(.05, .05, .14, MAT.ferrugem, 1.55, 1.95, -.16, W.grupo, false);
  const capa = new THREE.Group(); capa.position.set(1.55, 1.38, -.24); W.grupo.add(capa);
  box(.5, 1.0, .12, new THREE.MeshStandardMaterial({ color: 0x8a7a2a, roughness: .35, metalness: .1 }), 0, 0, 0, capa); box(.22, .2, .14, new THREE.MeshStandardMaterial({ color: 0x7a6a24, roughness: .4 }), 0, .55, 0, capa);
  const poca = plano(.8, .55, new THREE.MeshStandardMaterial({ color: 0x0c1012, roughness: .05, metalness: .6, transparent: true, opacity: .8, depthWrite: false }), 1.55, .004, -.5); poca.rotation.x = -Math.PI / 2;
  interact(capa, () => S.flags.energia ? '' : 'Uma capa de chuva amarela, ainda pingando. Na gola: “J. BARBOSA”.', () => {});
  let gotaT = 0;
  W.tick.push(dt => {
    capa.visible = !S.flags.energia;
    if (!capa.visible) return;
    gotaT -= dt; if (gotaT <= 0) { gotaT = .7 + Math.random() * .6; if (U.dist(1.55, -.4) < 6) SOM.gota({ x: 1.55, y: .1, z: -.45 }); }
  });
  // fuligem da escada: degraus de cima chamuscados e mãos na parede
  const tFul = U.tex(256, 128, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 16; i++) { const x = Math.random() * w, y = Math.random() * h, r = 14 + Math.random() * 50; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(8,6,4,.8)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } });
  for (let i = 5; i < 8; i++) { const m = plano(2.5, .42, new THREE.MeshStandardMaterial({ map: tFul, transparent: true, depthWrite: false, roughness: 1 }), -3.1, .2 + i * .3 + .004, -9.6 - i * .45); m.rotation.x = -Math.PI / 2; }
  const tMaos = U.tex(256, 384, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 10; i++) { const x = Math.random() * w, y = Math.random() * h * .7, r = 30 + Math.random() * 60; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(10,8,6,.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    const mao = (x, y, s, a) => { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = 'rgba(6,5,4,.85)'; g.beginPath(); g.ellipse(0, 0, 14 * s, 17 * s, 0, 0, 7); g.fill(); for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(-10 * s + k * 7 * s, -24 * s, 3 * s, 9 * s, 0, 0, 7); g.fill(); } g.beginPath(); g.ellipse(16 * s, -4 * s, 3 * s, 8 * s, -.8, 0, 7); g.fill(); g.restore(); };
    for (let i = 0; i < 6; i++) mao(40 + i * 34, 300 - i * 46, .7, (Math.random() - .5) * .4);
    mao(150, 330, 1.6, .2);
  });
  const fuligem = plano(1.3, 1.95, new THREE.MeshStandardMaterial({ map: tMaos, transparent: true, depthWrite: false, roughness: 1 }), -5.87, 1.45, -10.2, Math.PI / 2);
  U.ler(fuligem, 'Olhar as marcas de fuligem na parede', [
    { quem: 'lia', texto: 'Mãozinhas pretas subindo a parede, até o patamar. E uma mão de homem, grande, mais embaixo.' },
    { quem: 'lia', texto: 'Seu Joaquim. “O fogo pegou a escada antes.” Ele tentou subir por aqui.' }
  ], { mem: 'fuligem' });
  // São Lázaro de gesso: a cabeça acompanha o Inspetor; depois da Procissão, chora
  box(.5, .05, .32, MAT.madeiraEsc, -5.75, 1.38, -3.2, W.grupo, false);
  const gesso = new THREE.MeshStandardMaterial({ color: 0xb8b0a0, roughness: .8 });
  cyl(.09, .13, .5, gesso, -5.74, 1.66, -3.2, 10);
  const cabSanto = new THREE.Group(); cabSanto.position.set(-5.74, 1.98, -3.2); W.grupo.add(cabSanto);
  const cabM = new THREE.Mesh(new THREE.SphereGeometry(.075, 10, 8), gesso); cabSanto.add(cabM);
  for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.012, 5, 4), MAT.preto); o.position.set(s * .026, .01, .066); cabSanto.add(o); }
  const lagrima = box(.01, .07, .005, new THREE.MeshStandardMaterial({ color: 0x1a0805, roughness: .2 }), .026, -.04, .07, cabSanto, false); lagrima.visible = false;
  for (const s of [-1, 1]) { box(.12, .06, .05, gesso, -5.72, 1.44, -3.2 + s * .1, W.grupo, false); box(.04, .05, .04, gesso, -5.66, 1.49, -3.2 + s * .13, W.grupo, false); }
  const santoBase = new THREE.Group(); santoBase.position.set(-5.74, 1.6, -3.2); W.grupo.add(santoBase); box(.3, .5, .3, new THREE.MeshBasicMaterial({ visible: false }), 0, 0, 0, santoBase, false);
  U.ler(santoBase, 'Olhar o santo de gesso no nicho', () => [
    { quem: 'lia', texto: 'São Lázaro, com os dois cachorrinhos nos pés. O padroeiro do prédio.' },
    { quem: 'lia', texto: M.ativo ? 'A cabeça dele tá virada... pra onde aquele homem tá andando. Ela vira junto.' : 'A cabeça tá virada pra parede. Como se tivesse vergonha.' },
    ...(S.done.procissao ? [{ quem: 'lia', texto: 'Escorreu alguma coisa escura do olho dele. Gesso não chora.' }] : [])
  ], { mem: 'santo', semLido: true });
  W.tick.push(dt => {
    lagrima.visible = !!S.done.procissao;
    const alvoY = M.ativo ? Math.atan2(M.pos.x - cabSanto.position.x, M.pos.z - cabSanto.position.z) : Math.PI * 1.5;
    let d = alvoY - cabSanto.rotation.y; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2;
    cabSanto.rotation.y += d * Math.min(1, dt * .8);
  });

  // ---- ALTO-FALANTES do diretor (recepção, refeitório, corredores)
  const falantes = [[0, 2.65, -13.86, 0], [-19, 2.65, -14.12, Math.PI], [13, 2.65, -10.12, Math.PI], [-24, 2.65, -10.12, Math.PI]];
  const matFal = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: .6 }), matTela = new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: 1 });
  for (const [x, y, z, ry] of falantes) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; W.grupo.add(g); box(.36, .3, .14, matFal, 0, 0, .07, g, false); cyl(.1, .1, .02, matTela, 0, 0, .145, 12, g).rotation.x = Math.PI / 2; }
  const falMaisPerto = () => { let m = falantes[0], dm = 1e9; for (const f of falantes) { const d = U.dist(f[0], f[2]); if (d < dm) { dm = d; m = f; } } return { x: m[0], y: m[1], z: m[2] }; };
  const anuncio = (texto, dur = 3) => { const p = falMaisPerto(); SFX.estatica(dur, p); U.depois(.6, () => A.sub('diretor', `(alto-falante) ${texto}`)); };
  let procPrev = null;
  W.tick.push(() => {
    const f = PROC().fase;
    if (f === 'aviso' && procPrev !== 'aviso' && S.flags.energia) { const p = falMaisPerto(); SFX.estatica(4, p); U.depois(.8, () => A.sub('voz', '(alto-falante, crianças, distorcido) ♪ Silêncio, silêncio, que Deus está ouvindo... ♪')); }
    procPrev = f;
  });
  let chamouLia = false;

  // ---- CORREDOR OESTE: galeria dos Inspetores de Disciplina
  const retrato = (ano, nivel, vazio, lia) => U.tex(160, 200, (g, w, h) => {
    g.fillStyle = '#2a1c10'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a5a24'; g.lineWidth = 9; g.strokeRect(4, 4, w - 8, h - 8);
    if (!vazio || lia) {
      g.fillStyle = lia ? 'rgba(90,70,50,.6)' : '#3a3026'; g.beginPath(); g.ellipse(80, 190, 60, 70, 0, 0, 7); g.fill();
      g.fillStyle = lia ? 'rgba(160,130,110,.5)' : '#8a7a66'; g.beginPath(); g.ellipse(80, 84, 32, 42, 0, 0, 7); g.fill();
      if (lia) { g.fillStyle = 'rgba(40,24,14,.8)'; g.beginPath(); g.ellipse(80, 66, 40, 34, 0, Math.PI, 0); g.fill(); g.fillRect(40, 66, 14, 60); g.fillRect(106, 66, 14, 60); }
      else {
        g.fillStyle = '#100a06';
        if (nivel === 0) { g.fillRect(62, 76, 12, 5); g.fillRect(86, 76, 12, 5); }
        if (nivel === 1) { g.fillRect(58, 72, 18, 10); g.fillRect(84, 72, 18, 10); }
        if (nivel === 2) { g.fillRect(54, 72, 52, 12); }
        if (nivel >= 3) { g.fillRect(46, 68, 68, 20); g.fillRect(40, 72, 8, 6); g.fillRect(112, 72, 8, 6); }
        g.fillStyle = '#000'; g.globalAlpha = .9; g.fillRect(50, 70, 60, 16); g.globalAlpha = 1;
      }
    }
    g.fillStyle = '#c8a860'; g.font = 'italic 13px Georgia'; g.textAlign = 'center'; g.fillText(vazio ? '1994 —' : `Inspetor · ${ano}`, w / 2, h - 14);
  });
  const galeria = [[1931, 0], [1940, 1], [1952, 2], [1963, 3], [1971, 4]].map(([ano, n], i) => plano(.72, .9, new THREE.MeshStandardMaterial({ map: retrato(ano, n), roughness: .6 }), -26.6 + i * 1.4, 1.85, -13.88));
  const tVazio = retrato(0, 0, true, false), tVazioLia = retrato(0, 0, true, true);
  const mVazio = new THREE.MeshStandardMaterial({ map: tVazio, roughness: .6 });
  const vazio = plano(.72, .9, mVazio, -26.6 + 5 * 1.4, 1.85, -13.88);
  const placaGal = plano(1.6, .2, new THREE.MeshStandardMaterial({ map: papelTex(U, 320, 40, ['INSPETORES DE DISCIPLINA — 1923 · 1979'], { fundo: '#7a5a24', cor: '#1a1008', fonte: 'bold 16px Georgia', alinhar: 'center', x: 160, y: 26 }), roughness: .5 }), -23.1, 2.5, -13.88);
  U.ler(placaGal, 'Ler a placa da galeria', [
    { quem: 'lia', texto: 'Inspetores de disciplina. Cinco retratos. Em cada um, os olhos estão mais tapados: sombra, óculos escuros, uma faixa, uma venda.' },
    { quem: 'lia', texto: 'Não começou com ele. O cargo cega quem senta nele.' }
  ], { mem: 'galeria' });
  for (const r of [...galeria, vazio]) U.ler(r, 'Olhar o retrato', () => [{ quem: 'lia', texto: r === vazio ? (S.done.procissao ? 'A moldura vazia... agora tem um borrão. Cabelo comprido, preso. Igual o meu.' : 'Uma moldura vazia. Na plaquinha: “1994 —”.') : r === galeria[4] ? 'O último. 1971. O mesmo queixo daquele homem. Moacir.' : 'Mais um homem de olho tapado.' }], { mem: 'galeria', semLido: true });
  let galViu = false;
  W.tick.push(() => {
    if (S.done.procissao && mVazio.map !== tVazioLia) { mVazio.map = tVazioLia; mVazio.needsUpdate = true; }
    if (!galViu && U.sala() === 'cw' && U.olhando(-23.1, 1.85, -13.88, .9, 6)) { galViu = true; U.depois(1.2, () => A.sub('lia', '(baixinho) Todos eles... todos de olho fechado.')); }
  });

  // ---- CORREDOR LESTE: nove sombras queimadas na parede (somem quando a Procissão passa)
  const tSombras = U.tex(1024, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, 'rgba(30,20,10,.45)'); gr.addColorStop(1, 'rgba(30,20,10,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) {
      const x = 60 + i * 112, a = .78 + Math.random() * .3, y = h - 6;
      g.fillStyle = 'rgba(8,6,4,.88)';
      g.beginPath(); g.ellipse(x, y - 196 * a, 18, 22, 0, 0, 7); g.fill();
      g.beginPath(); g.moveTo(x - 26, y - 170 * a); g.lineTo(x + 26, y - 170 * a); g.lineTo(x + 20, y - 80 * a); g.lineTo(x + 14, y); g.lineTo(x + 2, y); g.lineTo(x, y - 60 * a); g.lineTo(x - 2, y); g.lineTo(x - 14, y); g.lineTo(x - 20, y - 80 * a); g.closePath(); g.fill();
      if (i < 8) { g.beginPath(); g.moveTo(x + 24, y - 150 * a); g.lineTo(x + 70, y - 140 * a); g.lineWidth = 8; g.strokeStyle = 'rgba(8,6,4,.85)'; g.stroke(); }
    }
  });
  const sombras = plano(6, 1.5, new THREE.MeshStandardMaterial({ map: tSombras, transparent: true, depthWrite: false, roughness: 1 }), 21.7, .76, -10.12, Math.PI);
  let sombrasPrev = true, sombrasLit = false;
  U.ler(sombras, 'Olhar as sombras na parede', [
    { quem: 'lia', texto: 'Nove crianças em fila, de mão dada. Não é tinta. É fuligem. O fogo carimbou elas na parede.' },
    { quem: 'lia', texto: 'Ficaram aqui paradas esperando alguém abrir a porta.' }
  ], { mem: 'sombras' });
  W.tick.push(() => {
    const vis = !PROC().fase;
    if (vis !== sombrasPrev) { sombrasPrev = vis; sombras.visible = vis; if (!vis && U.sala() === 'ce') A.sub('lia', '(bem baixinho) As sombras... saíram da parede.'); }
    if (!sombrasLit && vis && S.flashOn && U.olhando(21.7, .9, -10.12, .85, 7)) { sombrasLit = true; SFX.arfar(); U.medo(8); }
  });
  // relógio de ponto do Moacir, na entrada da casa de máquinas
  const ponto = new THREE.Group(); ponto.position.set(31.3, 1.45, -13.9); W.grupo.add(ponto);
  box(.36, .5, .14, new THREE.MeshStandardMaterial({ color: 0x4a4a44, roughness: .5, metalness: .4 }), 0, 0, .07, ponto);
  plano(.22, .22, new THREE.MeshStandardMaterial({ map: (ctx.texRelogio && ctx.texRelogio(9, 0)) || null, color: 0xc8c0a0 }), 0, .1, .145, 0, ponto);
  plano(.08, .2, MAT.papel, .12, -.16, .15, 0, ponto);
  U.ler(ponto, 'Ler o cartão do relógio de ponto', [
    { quem: 'lia', texto: 'Um cartão de ponto. “M. DUARTE — INSPETOR”.' },
    { quem: 'lia', texto: 'Um carimbo por noite: 21h00. Toda noite de 1979... até 1994. A tinta fica cada vez mais fresca.' },
    { quem: 'lia', texto: 'O de hoje ainda tá molhado. Ele ainda bate o ponto.' }
  ], { mem: 'ponto', som: false, aoLer: () => SFX.clique() });

  // ---- SETAS DO DAVI (rodapé, só sob a lanterna)
  setasDavi(A, S, U, {
    despensa: [[-5.88, -8.4, Math.PI / 2, 0, -1], [-9.5, -10.12, Math.PI, -1, 0], [-22, -10.12, Math.PI, -1, 0], [-27.8, -13.88, 0, -1, 0], [-33.88, -21, Math.PI / 2, 0, -1]],
    enferm: [[5.88, -9.4, -Math.PI / 2, 0, -1], [12, -10.12, Math.PI, 1, 0], [-9.5, -13.88, 0, 1, 0], [-24.3, -21.5, -Math.PI / 2, 0, 1]],
    maq: [[24.6, -10.12, Math.PI, 1, 0], [22, -13.88, 0, 1, 0], [27.4, -13.88, 0, 1, 0], [5.88, -9.4, -Math.PI / 2, 0, -1], [12, -13.88, 0, 1, 0]],
    diret: [[5.88, -9.4, -Math.PI / 2, 0, -1], [10.2, -10.12, Math.PI, -1, 0], [-5.4, -.12, Math.PI, 1, 0]],
    quadro: [[10.2, -13.88, 0, -1, 0], [1, -13.86, 0, 1, 0], [13.2, -.12, Math.PI, -1, 0]],
    escada: [[-.6, -13.86, 0, -1, 0], [5.88, -9.4, -Math.PI / 2, 0, 1]]
  }, () => {
    if (S.chapter === 1) return !S.inv.galao ? 'despensa' : S.inv.fusiveis < 3 ? 'enferm' : !S.flags.energia ? 'maq' : '';
    if (S.chapter === 2) return !S.fitas.f1 ? 'diret' : !S.inv.chaves.escada ? 'quadro' : 'escada';
    return '';
  });

  // ---- TINTA DE RELÓGIO (só no escuro)
  tinta(texTinta(U, ['NÃO RESPONDE'], { tam: 54 }), 1.4, .7, -5.87, 1.0, -1.4, Math.PI / 2);
  tinta(texTinta(U, ['ELE OUVE', 'O CORAÇÃO']), 1.6, .8, -17, 1.3, -10.12, Math.PI);
  tinta(texTinta(U, ['CONTA OS ESTALOS'], { tam: 40 }), 1.5, .6, 14.2, 1.3, -10.12, Math.PI);
  tinta(texTinta(U, ['SOCORRO'], { tam: 60, maos: 9 }), 2.2, 1.1, 6.12, 1.2, -18.5, Math.PI / 2);
  tinta(texTinta(U, ['A ANA É BOA', 'OLHA PRA ELA'], { tam: 36 }), 1.4, .7, -16.5, 1.25, -9.88, 0);
  tinta(texTinta(U, ['ELE NÃO ENXERGA.', 'ELE ESCUTA.'], { tam: 34 }), 1.5, .75, 17.88, 1.2, -8.2, -Math.PI / 2);
  tinta(texTinta(U, [''], { tam: 10, maos: 14 }), 2.4, 1.2, 33.88, 1.0, -16.2, -Math.PI / 2);

  // ---- SALA DE AULA
  // diário de classe de 1979 na mesa da professora: o 38º nome é o seu
  const diario = new THREE.Group(); diario.position.set(-8.1, .785, -4.68); W.grupo.add(diario);
  const tDiario = papelTex(U, 256, 160, ['Diário de classe — 4ª série — 1979', 'Prado, Ana L.  P P P P F F F F', 'Moraes, Davi    P P P P F F F F', 'Ribeiro, Tomé   P P P P F F F F', '...', { t: '38. ' + nome() + ' — 14/03/1994', cor: '#7a1408' }], { fonte: '13px Georgia', y: 24, lh: 24, x: 12 });
  const pd = plano(.36, .24, new THREE.MeshStandardMaterial({ map: tDiario, roughness: .9 }), 0, .01, 0, Math.PI, diario); pd.rotation.x = -Math.PI / 2;
  U.ler(diario, 'Ler o diário de classe', () => [
    { quem: 'lia', texto: 'A chamada de 1979. Trinta e sete nomes. Três com “F” de falta, em vermelho, a partir de 15 de março.' },
    { quem: 'lia', texto: `E um nome a mais no fim, com tinta fresca: “38. ${nome()} — matriculada em 14/03/1994”.` },
    { quem: 'lia', texto: 'Matriculada. Hoje.' }
  ], { mem: 'chamada' });
  // a chamada falada ao entrar na sala
  let chamadaFala = null;
  const responder = e => {
    if (!chamadaFala || e.code !== 'KeyV' || chamadaFala.respondeu) return;
    chamadaFala.respondeu = true;
    A.sub('lia', '...Presente.', true); A.emitNoise(A.P.pos.x, A.P.pos.z, 20);
    if (M.ativo && M.state !== 'caca') { M.state = 'investiga'; A.planejar(M, A.P.pos.x, A.P.pos.z); }
    U.depois(1.6, () => A.sub('voz', '(eco, muito perto) Presença confirmada. Depois das nove, aluna.'));
  };
  window.__loreResponder = responder;
  if (!window.__loreResponderOn) { window.__loreResponderOn = true; addEventListener('keydown', e => { try { window.__loreResponder && window.__loreResponder(e); } catch (er) {} }); }
  W.tick.push(dt => { if (chamadaFala) { chamadaFala.t -= dt; if (chamadaFala.t <= 0) { if (!chamadaFala.respondeu) A.sub('voz', '(eco) ...Ausente.'); chamadaFala = null; } } });
  const fazerChamada = () => {
    const seq = [['(eco) Alves.', 'presente'], ['(eco) Braga.', 'presente'], ['(eco) Ana Luísa Prado.', null], ['(eco) Davi Moraes.', null], ['(eco) Tomé Ribeiro.', null], [`(eco) ...${nome()}.`, 'lia']];
    seq.forEach(([n, r], i) => U.depois(1 + i * 2.6, () => {
      A.sub('voz', n); SFX.estatica(.6, { x: -8, y: 1.6, z: -5 });
      if (r === 'presente') U.depois(1.1, () => A.sub('voz', '(eco, crianças) presente.'));
      if (r === 'lia') { chamadaFala = { t: 4.5, respondeu: false }; if (!S.flags.dicaChamadaAula) { S.flags.dicaChamadaAula = true; A.toast('V responde. Ficar calada também é uma resposta.'); } }
    }));
  };
  // caderno de castigo do Davi
  const cad = A.MK.caderno(); cad.position.set(-14.12, .725, -6.85); cad.rotation.y = .3; W.grupo.add(cad);
  U.ler(cad, 'Ler o caderno de castigo', [
    { quem: 'lia', texto: '“Eu não vou falar depois das nove.” Copiado cem vezes. A letra do Davi.' },
    { quem: 'lia', texto: 'No meio da página a frase começa a mudar. “Eu não vou... eu vou... eu vou tocar o sino.”' },
    { quem: 'lia', texto: '“Eu vou tocar o sino. Eu vou tocar o sino. Eu vou tocar o sino.” Até o fim da folha.' }
  ], { mem: 'castigo', aoLer: p => { if (p) { SFX.rangido(-11.3, .5, -7, .7); A.emitNoise(-11.3, -7, 4); U.depois(.5, () => A.sub('lia', 'A carteira do lado se mexeu sozinha.')); } } });
  // mural de folclore da 4ª série
  const tMural = U.tex(512, 280, (g, w, h) => {
    g.fillStyle = '#d9c8a0'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a2a10'; g.font = 'bold 22px Georgia'; g.textAlign = 'center'; g.fillText('LENDAS DO BRASIL — 4ª SÉRIE — 1979', w / 2, 30);
    const cs = ['#a02020', '#205aa0', '#208040', '#2a2a2a'];
    for (let i = 0; i < 4; i++) { const x = 70 + i * 124; boneco(g, x, 220, 1, cs[i], { alto: i === 3, olhos: i !== 3 }); }
    g.font = '14px Georgia'; g.fillStyle = '#3a2010'; ['o saci', 'a mula', 'o curupira', 'O HOMEM DO SACO'].forEach((t, i) => g.fillText(t, 70 + i * 124, 250));
    g.fillStyle = '#7a1408'; g.font = 'italic 13px Georgia'; g.fillText('= SEU MOACIR. ele não vê mas escuta até a gente pensar', w / 2 + 40, 272);
  });
  const mural = plano(2.3, 1.26, new THREE.MeshStandardMaterial({ map: tMural, roughness: .95 }), -19.87, 1.75, -5, Math.PI / 2);
  U.ler(mural, 'Olhar o mural de lendas da 4ª série', [
    { quem: 'lia', texto: '“Lendas do Brasil.” O saci, a mula sem cabeça, o curupira...' },
    { quem: 'lia', texto: 'E um homem alto com um saco, os olhos riscados. “O Homem do Saco = Seu Moacir.”' },
    { quem: 'lia', texto: 'Eles transformaram ele em lenda. Era o único jeito de conseguir falar dele.' }
  ], { mem: 'folclore' });
  // brincadeira do copo
  const tab = new THREE.Group(); tab.position.set(-11.32, .725, -3.5); W.grupo.add(tab);
  const tTab = U.tex(256, 160, (g, w, h) => { g.fillStyle = '#e4d6b4'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a1a10'; g.font = 'bold 15px Georgia'; g.textAlign = 'center'; const ab = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; for (let i = 0; i < 26; i++) g.fillText(ab[i], 18 + (i % 13) * 17.5, 60 + Math.floor(i / 13) * 30); g.fillText('SIM', 40, 26); g.fillText('NÃO', 216, 26); g.font = '13px Georgia'; for (let i = 0; i < 10; i++) g.fillText(String(i), 40 + i * 19, 140); });
  const ptab = plano(.62, .4, new THREE.MeshStandardMaterial({ map: tTab, roughness: .9 }), 0, .005, 0, 0, tab); ptab.rotation.x = -Math.PI / 2;
  const copo = cyl(.035, .028, .07, MAT.vidro || new THREE.MeshStandardMaterial({ color: 0xaaccbb, transparent: true, opacity: .5 }), 0, .04, 0, 10, tab);
  let copoN = 0, soletrando = false;
  interact(tab, () => copoN >= 3 ? 'Cacos de vidro em cima do alfabeto.' : soletrando ? 'O copo está andando...' : '<b>E</b>Pôr o dedo no copo', () => {
    if (copoN >= 3 || soletrando) return;
    copoN++;
    if (copoN === 3) {
      copo.visible = false; SFX.vidro(-11.32, -3.5); A.emitNoise(-11.32, -3.5, 16); A.P.shake = .08; U.medo(20);
      A.sub('lia', 'O copo voou da minha mão! Ele ouviu isso. Ele ouviu, com certeza.', true); U.mem('copo'); return;
    }
    let resp;
    if (copoN === 1) resp = M.ativo ? A.roomAt(M.pos.x, M.pos.z).nome.toUpperCase() : 'ELE DORME';
    else resp = S.inv.chaves.escada ? 'ELE OUVE O COPO' : 'NÃO SOBE AINDA';
    soletrando = true; A.emitNoise(-11.32, -3.5, 3);
    const letras = resp.replace(/\s+/g, ' ').split(''); let txt = '';
    letras.forEach((c, i) => U.depois(.5 + i * .42, () => {
      txt += c; SOM.raspar({ x: -11.32, z: -3.5 }); copo.position.set((Math.random() - .5) * .45, .04, (Math.random() - .5) * .25);
      A.sub('lia', `(o copo soletra) ${txt}`);
      if (i === letras.length - 1) { soletrando = false; copo.position.set(0, .04, 0); U.depois(1.6, () => A.sub('lia', copoN === 1 ? (M.ativo ? 'É onde ele tá. Agora.' : 'Ele ainda não acordou...') : 'Eu devia parar com isso.')); }
    }));
  });

  // ---- BIBLIOTECA
  const atril = new THREE.Group(); atril.position.set(-27.05, .805, -1.5); W.grupo.add(atril);
  const tAtril = papelTex(U, 256, 160, ['CHAMADA — 1979', '13/03  P P P', '14/03  P P P', '15/03  P P P', '...', { t: `${hoje()}/1994  P P P`, cor: '#5a0a04' }], { fonte: '15px Georgia', y: 24, lh: 24, x: 16 });
  box(.46, .04, .32, MAT.madeiraEsc, 0, .02, 0, atril, false);
  const pa = plano(.42, .28, new THREE.MeshStandardMaterial({ map: tAtril, roughness: .9 }), 0, .045, 0, 0, atril); pa.rotation.x = -Math.PI / 2 + .25;
  U.ler(atril, 'Folhear o livro de chamada', [
    { quem: 'lia', texto: 'As presenças param no dia 14 de março de 1979. Depois devia estar em branco.' },
    { quem: 'lia', texto: 'Mas três nomes continuam marcados “presente”, com tinta fresca. Um dia por linha. Quinze anos de linhas.' },
    { quem: 'lia', texto: 'A última é de hoje. Eles ainda vêm pra aula.' }
  ], { mem: 'atril', aoLer: p => { if (p) for (let i = 0; i < 6; i++) U.depois(i * .25, () => SFX.papel()); } });
  // fichário de alunos
  const fich = A.prop(.7, 1.05, .45, new THREE.MeshStandardMaterial({ color: 0x5a5a52, roughness: .5, metalness: .5 }), -30.6, .525, -.38);
  for (let i = 0; i < 3; i++) box(.6, .02, .02, MAT.metal, -30.6, .25 + i * .32, -.6, W.grupo, false);
  U.ler(fich, 'Abrir o fichário de alunos', [
    { quem: 'lia', texto: 'A ficha do Davi. Uma foto 3x4: um menino de franja. “Motivo da internação: comportamento — fala demais.”' },
    { quem: 'lia', texto: '“Responsável: mãe. Irmã: Lia.” Atrás dela, uma ficha amarela de 1947.' },
    { quem: 'lia', texto: '“Moacir Duarte, 9 anos. Órfão. Motivo: chora à noite.”' },
    { quem: 'lia', texto: 'Dois motivos. A mesma Hora.' }
  ], { mem: 'fichario', som: false, ruido: 6, aoLer: () => SFX.rangido(-30.6, .6, -.6, .6) });
  // o que sobrou do repórter de 1983
  const rep = new THREE.Group(); rep.position.set(-21.4, .02, -8.5); rep.rotation.y = .7; W.grupo.add(rep);
  box(.24, .07, .14, new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: .5, metalness: .4 }), 0, .035, 0, rep);
  const lv = A.MK.lanterna(); lv.position.set(.3, 0, .1); lv.rotation.y = 2; rep.add(lv);
  let repTocando = false;
  interact(rep, () => repTocando ? 'O gravadorzinho chia...' : `<b>E</b>Apertar o play do gravador do repórter${S.flags.lido_reporter ? '<small style="opacity:.6"> (ouvido)</small>' : ''}`, () => {
    if (repTocando) return; repTocando = true; S.flags.lido_reporter = true; SFX.fitaClique();
    const ls = [['radio', '(gravação, 1983) Paulo Vieira, Jornal da Serra. Estou dentro do São Lázaro. Ninguém entra aqui desde 79.'], ['radio', '(gravação) Os corredores estão intactos. Parece que as crianças saíram ontem.'], ['voz', '(gravação, ao fundo) ...Seu nome é Paulo, não é?'], ['radio', '(gravação) Sim? Quem tá aí?'], ['radio', '(gravação) ...']];
    ls.forEach(([q, t], i) => U.depois(.6 + i * 3.4, () => { A.sub(q, t); SFX.estatica(1, { x: -21.4, y: .3, z: -8.5 }); }));
    U.depois(.6 + 4 * 3.4 + 1, () => { SFX.grito && SFX.grito('reporter'); SFX.estatica(2, { x: -21.4, y: .3, z: -8.5 }); A.emitNoise(-21.4, -8.5, 10); U.medo(15); });
    U.depois(.6 + 5 * 3.4 + 2, () => { repTocando = false; A.sub('lia', 'Ele respondeu. Ele respondeu quando chamaram o nome dele.'); U.mem('reporter'); });
  });
  // livro com o carimbo de devolução de hoje
  const lCarimbo = new THREE.Group(); lCarimbo.position.set(-26.0, .805, -.95); lCarimbo.rotation.y = -.4; W.grupo.add(lCarimbo);
  box(.2, .04, .27, new THREE.MeshStandardMaterial({ color: 0x2a3a5a, roughness: .7 }), 0, .02, 0, lCarimbo);
  U.ler(lCarimbo, 'Abrir o livro esquecido na mesa', [
    { quem: 'lia', texto: '“A Ilha do Tesouro.” O cartão de empréstimo tem carimbos até 14 de março de 1979.' },
    { quem: 'lia', texto: `E um carimbo novo, de devolução: ${hoje()}/1994. Em nome de “D. Moraes”.` },
    { quem: 'lia', texto: 'Ele adorava pirata. Ele devolveu hoje.' }
  ], { mem: 'carimbo' });

  // ---- REFEITÓRIO
  // o lugar 38: prato servido, quente, com plaquinha "LIA"
  const lugar = new THREE.Group(); lugar.position.set(-9.55, .82, -20); W.grupo.add(lugar);
  cyl(.13, .11, .02, new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: .4 }), 0, .01, 0, 12, lugar);
  cyl(.1, .1, .01, new THREE.MeshStandardMaterial({ color: 0x5a2a12, roughness: .2 }), 0, .022, 0, 12, lugar);
  const placaL = plano(.14, .07, new THREE.MeshStandardMaterial({ map: papelTex(U, 128, 64, ['LIA'], { fonte: 'bold 34px Georgia', alinhar: 'center', x: 64, y: 44, fundo: '#efe2c0' }) }), .2, .05, 0, -Math.PI / 2, lugar);
  placaL.rotation.x = -.2;
  const vapor = [];
  const tVapor = U.tex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(230,230,230,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  for (let i = 0; i < 5; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tVapor, transparent: true, depthWrite: false, opacity: .3 })); s.scale.set(.12, .12, 1); s.userData.f = i / 5; lugar.add(s); vapor.push(s); }
  W.tick.push(dt => { for (const s of vapor) { s.userData.f = (s.userData.f + dt * .35) % 1; const f = s.userData.f; s.position.set(Math.sin(f * 6 + s.id) * .03, .05 + f * .45, Math.cos(f * 5) * .03); s.material.opacity = .32 * (1 - f); s.scale.setScalar(.08 + f * .16); } });
  U.ler(lugar, 'Ler a plaquinha do lugar na ponta da mesa', [
    { quem: 'lia', texto: 'Trinta e sete lugares cobertos de pó. Esse aqui não. Tem sopa. Quente.' },
    { quem: 'lia', texto: 'A plaquinha diz “LIA”.' }
  ], { mem: 'lugar38', aoLer: p => { if (!p) return; for (let i = 0; i < 6; i++) U.depois(.8 + i * .9, () => SOM.colher({ x: -19.6, y: .9, z: -24.25 })); U.depois(5.2, () => { SFX.arrastar(); A.sub('lia', 'Alguém tá comendo. Na outra ponta. Devagar.'); U.medo(12); }); } });
  // chamada de 17/03/1979 no quadro do refeitório
  const tChamRef = papelTex(U, 256, 220, ['Chamada — almoço — 17/03/79', 'Alves  P   Braga  P   Cunha  P', 'Dias  P   Elias  P   Faria  P', '... (34 presentes)', { t: 'Prado, Ana L.   F', cor: '#9a1008' }, { t: 'Moraes, Davi    F', cor: '#9a1008' }, { t: 'Ribeiro, Tomé   F', cor: '#9a1008' }, { t: '38. Lia M.', cor: '#555', fonte: 'italic 16px Georgia' }], { fonte: '14px Georgia', y: 26, lh: 25, x: 14, fundo: '#1e2a22', cor: '#d8d8c8' });
  const chamRef = plano(1.1, .94, new THREE.MeshStandardMaterial({ map: tChamRef, roughness: .9 }), -10.6, 1.7, -14.12, Math.PI);
  U.ler(chamRef, 'Ler o quadro de chamada do almoço', [
    { quem: 'lia', texto: 'Dezessete de março de 1979. Trinta e quatro presentes. Ana, Davi e Tomé com falta, em vermelho.' },
    { quem: 'lia', texto: 'E no fim, a lápis, com outra letra: “38. Lia M.”' },
    { quem: 'lia', texto: '...Eu nunca estudei aqui. Estudei?' }
  ], { mem: 'chamadaRef' });
  // embaixo da mesa: "LIA VEM", e as 37 colheres no escuro
  const tLV = U.tex(256, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(220,210,180,.8)'; g.lineWidth = 2; g.font = 'bold 34px Georgia'; g.textAlign = 'center'; g.strokeText('LIA VEM', w / 2, 44); });
  const liaVem = plano(.7, .18, new THREE.MeshStandardMaterial({ map: tLV, transparent: true, depthWrite: false, roughness: 1 }), -12.2, .26, -22.99, 0);
  let colherT = 0;
  W.tick.push(dt => {
    const dentro = A.P.pos.x > -13.4 && A.P.pos.x < -11 && A.P.pos.z > -22.95 && A.P.pos.z < -21.9;
    if (dentro && A.P.crouch && !S.flashOn && !S.flags.colheres) { colherT += dt; if (colherT > 2) { S.flags.colheres = true; for (let i = 0; i < 37; i++) U.depois(i * .07 + Math.random() * .3, () => SOM.colher({ x: -20 + Math.random() * 11, y: .9, z: -26 + Math.random() * 12 })); U.depois(3.4, () => { SFX.sussurros(1.5); A.sub('voz', '(muitas crianças, bem baixinho) Shhhhhh...'); U.medo(25); }); } }
    else colherT = 0;
    if (dentro && A.P.crouch && !S.flags.dicaLiaVem) { S.flags.dicaLiaVem = true; A.sub('lia', '(baixinho) “LIA VEM.” Riscado no banco. No lugar do Davi.'); }
  });
  // ecos de 1979 no clarão do relâmpago (uma vez por sala)
  const ecoGrupo = (sala, pontos, alt = .9) => {
    const g = new THREE.Group(); g.visible = false; W.grupo.add(g);
    const tS = U.tex(64, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(200,210,230,.55)'; c.beginPath(); c.ellipse(32, 26, 13, 15, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(14, 46); c.lineTo(50, 46); c.lineTo(46, 128); c.lineTo(18, 128); c.closePath(); c.fill(); });
    for (const [x, z] of pontos) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.position.set(x, alt, z); s.scale.set(.5, 1, 1); g.add(s); }
    let usado = !!S.flags['eco_' + sala], vis = 0;
    W.tick.push(dt => {
      if (usado && vis <= 0) { g.visible = false; return; }
      if (vis > 0) { vis -= dt; g.visible = vis > 0; if (vis <= 0) U.depois(.4, () => A.sub('lia', '(bem baixinho) ...tinha gente sentada. No clarão. Tinha.')); return; }
      if (U.sala() === sala && U.raio() > .15) { usado = S.flags['eco_' + sala] = true; vis = .35; U.medo(15); }
    });
  };
  ecoGrupo('refeit', [[-19, -23.1], [-16.5, -23.1], [-14, -24.9], [-11.5, -23.1], [-18, -19.1], [-13, -20.9], [-10.5, -19.1], [-17, -16.9], [-12, -15.1]], .85);
  ecoGrupo('aula', [[-16.9, -6.4], [-14.1, -6.4], [-11.3, -6.4], [-16.9, -2.9], [-14.1, -2.9]], .9);

  // ---- COZINHA
  // a chaleira que apita no fogão apagado
  const chal = new THREE.Group(); chal.position.set(-29.3, .96, -25.6); W.grupo.add(chal);
  const mChal = new THREE.MeshStandardMaterial({ color: 0x6a6a64, roughness: .3, metalness: .6 });
  cyl(.1, .12, .14, mChal, 0, .07, 0, 12, chal); const bico = cyl(.015, .025, .14, mChal, .12, .1, 0, 6, chal); bico.rotation.z = -1;
  box(.14, .02, .02, MAT.preto, 0, .2, 0, chal);
  let apito = null;
  interact(chal, () => apito ? '<b>E</b>Tirar a chaleira do fogo' : S.flags.chaleira ? 'A chaleira. Ainda morna.' : 'Uma chaleira no fogão apagado.', () => {
    if (!apito) return; apito = null; S.flags.chaleira = true; chal.position.x += .3;
    S.health = Math.max(1, S.health - 5); A.P.shake = .05; SFX.ofego();
    A.sub('lia', 'Ai! Tá quente. Tá quente de verdade.', true);
  });
  W.tick.push(dt => {
    if (!apito) return; apito.t += dt; apito.som -= dt;
    if (apito.som <= 0) { apito.som = 1.1; const k = Math.min(1, apito.t / 10); SOM.apito({ x: -29.3, y: 1.1, z: -25.6 }, k); A.emitNoise(-29.3, -25.6, 5 + k * 4); }
    if (apito.t > 22) { apito = null; A.sub('lia', '(baixinho) Parou sozinha...'); }
  });
  // rádio de válvula: a mesma noite de 1979, cada vez mais adiante
  const radio = new THREE.Group(); radio.position.set(-26.4, .96, -25.6); W.grupo.add(radio);
  box(.36, .24, .18, new THREE.MeshStandardMaterial({ color: 0x5a3418, roughness: .5 }), 0, .12, 0, radio); plano(.22, .12, new THREE.MeshStandardMaterial({ color: 0xc8a860, emissive: 0x402a08, emissiveIntensity: .6 }), 0, .14, .092, 0, radio);
  let radioOn = true, radioT = 4, radioI = 0;
  const NOVELA = [['radio', '(rádio, 1979) ...e agora, o capítulo final de “Coração de Pedra”.'], ['radio', '(rádio, voz de mulher) Ninguém sai desta casa depois das nove, Eduardo! Ninguém!'], ['radio', '(rádio, voz de homem) Então que o silêncio seja o nosso castigo.'], ['radio', '(rádio) ...órgão... chiado...']];
  const NOVE = [['radio', '(rádio, 1979) São nove horas em ponto. Rádio Serra, a voz da estrada velha.'], ['radio', '(rádio) Notícia urgente: moradores relatam fumaça na direção do Internato São Lázaro.'], ['radio', '(rádio) ...os bombeiros não conseguem passar pela estrada velha...'], ['radio', '(rádio) ...e um sino. Os moradores dizem que um sino está tocando sozinho.']];
  interact(radio, () => `<b>E</b>${radioOn ? 'Desligar' : 'Ligar'} o rádio de válvula`, () => { radioOn = !radioOn; SFX.clique(); A.emitNoise(-26.4, -25.6, 3); if (!radioOn) SFX.estatica(.3, { x: -26.4, y: 1.1, z: -25.6 }); });
  W.tick.push(dt => {
    if (!radioOn || U.sala() !== 'cozinha') return;
    radioT -= dt; if (radioT > 0) return; radioT = 8;
    const lista = S.chapter >= 2 ? NOVE : NOVELA; const [q, t] = lista[radioI % lista.length]; radioI++;
    SFX.estatica(1.4, { x: -26.4, y: 1.1, z: -25.6 }); A.sub(q, t);
    if (S.chapter >= 2 && t.includes('nove horas')) U.depois(1.5, () => SFX.sino(.25, { x: -40, y: 6, z: -60 }));
  });
  // as canecas viradas para a parede
  box(1.7, .04, .2, MAT.madeiraEsc, -26.3, 1.5, -14.25, W.grupo, false);
  const canecas = [];
  const mCan = new THREE.MeshStandardMaterial({ color: 0xd8d0b8, roughness: .5 });
  for (let i = 0; i < 9; i++) { const c = new THREE.Group(); c.position.set(-27.0 + i * .17, 1.57, -14.25); W.grupo.add(c); cyl(.04, .035, .1, mCan, 0, 0, 0, 8, c); box(.012, .05, .03, mCan, 0, 0, i >= 3 && i <= 5 ? .045 : -.045, c, false); canecas.push(c); }
  const can38 = new THREE.Group(); can38.position.set(-25.55, 1.57, -14.3); can38.visible = false; W.grupo.add(can38);
  cyl(.035, .03, .085, new THREE.MeshStandardMaterial({ color: 0xc84a4a, roughness: .5 }), 0, 0, 0, 8, can38);
  const prat = new THREE.Group(); prat.position.set(-26.3, 1.57, -14.25); W.grupo.add(prat); box(1.7, .2, .22, new THREE.MeshBasicMaterial({ visible: false }), 0, 0, 0, prat, false);
  interact(prat, () => S.flags.canecas ? 'ANA, TOMÉ, DAVI. E uma caneca pequena: LIA, com um coração.' : '<b>E</b>Desvirar as três canecas viradas pra parede', () => {
    if (S.flags.canecas) return; S.flags.canecas = true;
    for (const c of canecas.slice(3, 6)) c.rotation.y = Math.PI; can38.visible = true;
    SOM.tilintar({ x: -26.3, y: 1.6, z: -14.3 }); A.emitNoise(-26.3, -14.3, 6);
    A.dialogo([{ quem: 'lia', texto: 'Têm nome pintado. ANA. TOMÉ. DAVI.' }, { quem: 'lia', texto: 'Atrás delas, escondida, uma caneca nova, de criança. “LIA”, com um coração torto.' }, { quem: 'lia', texto: 'Ele fez pra quando eu voltasse.' }], () => U.mem('canecas'));
  });

  // ---- DESPENSA: marcas de altura no batente
  const tAlt = (lia) => U.tex(64, 320, (g, w, h) => {
    g.fillStyle = '#7a6a50'; g.fillRect(0, 0, w, h); manchar(g, w, h, 3, 'rgba(0,0,0,.3)'); g.strokeStyle = '#2a1e12'; g.fillStyle = '#2a1e12'; g.lineWidth = 2; g.font = '10px Georgia'; g.textAlign = 'left';
    for (const [t, y] of [['M.D. 1951', 70], ['Davi 78', 150], ['Davi 77', 172], ['Davi 76', 196], ['Tomé 79', 182], ['Ana 79', 210]]) { g.beginPath(); g.moveTo(4, y); g.lineTo(30, y); g.stroke(); g.fillText(t, 4, y - 3); }
    if (lia) { g.strokeStyle = '#8a1a10'; g.fillStyle = '#8a1a10'; g.beginPath(); g.moveTo(4, 40); g.lineTo(34, 40); g.stroke(); g.fillText('LIA 94', 4, 37); }
  });
  const alt1 = plano(.18, .9 * 1.75, new THREE.MeshStandardMaterial({ map: tAlt(false), roughness: .9 }), -31.95, .9 * 1.75 / 2 + .05, -26.12, Math.PI);
  U.ler(alt1, 'Olhar os risquinhos no batente', [
    { quem: 'lia', texto: 'Marcas de altura, a lápis. Como a mãe fazia na porta da cozinha lá de casa.' },
    { quem: 'lia', texto: '“Davi 76”, “Davi 77”, “Davi 78”. E depois nada.' },
    { quem: 'lia', texto: 'A mais antiga, lá em cima: “M.D. 1951”. Ele cresceu aqui também.' }
  ], { mem: 'altDespensa' });

  // ---- DIRETORIA
  // brasa de cigarro atrás da mesa (some quando a lanterna chega)
  const brasa = new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 5), new THREE.MeshBasicMaterial({ color: 0xff5a10 })); brasa.position.set(12.1, 1.32, -6.35); brasa.visible = false; W.grupo.add(brasa);
  const luzBrasa = new THREE.PointLight(0xff4a10, 0, 1.6, 2); luzBrasa.position.copy(brasa.position); W.grupo.add(luzBrasa);
  let brasaOn = false;
  W.tick.push(dt => {
    if (!brasaOn) return;
    const k = .6 + .4 * Math.max(0, Math.sin(A.perf() * 1.3)) ** 6;
    luzBrasa.intensity = k * .9; brasa.scale.setScalar(.8 + k * .6);
    if ((S.flashOn && U.olhando(12.1, 1.3, -6.35, .93, 9)) || U.dist(12.1, -6.35) < 1.6) { brasaOn = false; brasa.visible = false; luzBrasa.intensity = 0; SFX.suspiro({ x: 12.1, y: 1.3, z: -6.35 }); U.medo(14); U.depois(.8, () => A.sub('lia', 'Tinha alguém fumando ali. Sentado. Esperando.')); }
  });
  // cinzeiro com o cigarro ainda soltando fumaça
  const cinz = new THREE.Group(); cinz.position.set(12.95, .82, -5.32); W.grupo.add(cinz);
  cyl(.07, .06, .025, MAT.vidro || mCan, 0, .012, 0, 10, cinz); box(.06, .01, .01, new THREE.MeshStandardMaterial({ color: 0xe8e0d0 }), .03, .03, 0, cinz, false);
  const fumaca = [];
  for (let i = 0; i < 4; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tVapor, transparent: true, depthWrite: false, opacity: .2, color: 0xb0b0b8 })); s.userData.f = i / 4; cinz.add(s); fumaca.push(s); }
  W.tick.push(dt => { for (const s of fumaca) { s.userData.f = (s.userData.f + dt * .22) % 1; const f = s.userData.f; s.position.set(.05 + Math.sin(f * 7) * .04, .05 + f * .55, Math.sin(f * 4) * .03); s.material.opacity = .22 * (1 - f); s.scale.setScalar(.04 + f * .2); } });
  interact(cinz, () => 'Um cigarro no cinzeiro. Ainda queimando.', () => {});
  // caixa de cartas retidas
  const cx = new THREE.Group(); cx.position.set(10.95, .82, -4.72); W.grupo.add(cx);
  box(.3, .1, .2, new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: .8 }), 0, .05, 0, cx); plano(.24, .15, new THREE.MeshStandardMaterial({ map: papelTex(U, 128, 80, ['RETIDA'], { fonte: 'bold 28px Georgia', cor: '#8a1008', alinhar: 'center', x: 64, y: 50 }) }), 0, .102, 0, 0, cx).rotation.x = -Math.PI / 2;
  U.ler(cx, 'Abrir a caixa de cartas “RETIDA — HORA DO SILÊNCIO”', [
    { quem: 'lia', texto: 'Cartas das crianças pros pais. Todas carimbadas: RETIDA.' },
    { quem: 'lia', texto: 'Uma do Tomé, com um carrinho azul desenhado: “Pai, aqui a gente não pode nem chorar.”' },
    { quem: 'lia', texto: 'Uma do Davi. Pra mim. “Se a vó deixar, vem me buscar no meu aniversário. Ou no seu. Tanto faz.”' },
    { quem: 'lia', texto: 'E uma de 1951, letra de menino: “Mãe, o diretor me tranca no armário. Moacir.”' }
  ], { mem: 'retidas' });
  // quadro "Aluno Exemplar do Mês" com as bocas riscadas
  const tEx = U.tex(384, 256, (g, w, h) => {
    g.fillStyle = '#2a1c10'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8c080'; g.font = 'bold 17px Georgia'; g.textAlign = 'center'; g.fillText('ALUNO EXEMPLAR DO MÊS', w / 2, 24);
    for (let i = 0; i < 18; i++) { const x = 22 + (i % 6) * 58, y = 40 + Math.floor(i / 6) * 70; g.fillStyle = '#8a7a64'; g.fillRect(x, y, 44, 54); g.fillStyle = '#4a3a2a'; g.beginPath(); g.ellipse(x + 22, y + 22, 12, 15, 0, 0, 7); g.fill(); g.fillStyle = '#050302'; g.fillRect(x + 10, y + 30, 24, 7); g.fillStyle = '#c8b080'; g.font = '9px Georgia'; g.fillText(i === 0 ? 'M. Duarte 49' : String(1950 + Math.floor(i * 1.6)), x + 22, y + 66); }
  });
  const exemplar = plano(1.15, .77, new THREE.MeshStandardMaterial({ map: tEx, roughness: .7 }), 17.88, 1.85, -7.4, -Math.PI / 2);
  U.ler(exemplar, 'Olhar o quadro “Aluno Exemplar do Mês”', [
    { quem: 'lia', texto: 'Fotos de crianças, de 1949 a 1979. Todas com a boca riscada a carvão.' },
    { quem: 'lia', texto: 'A primeira: “M. Duarte, 1949”. Exemplar era quem ficava calado.' }
  ], { mem: 'exemplar' });
  // máquina de escrever que escreve quando você dá as costas
  const FRASE_MAQ = 'Excelencia, o silencio salva as almas. As tres criancas constarao como fugitivas. A IRMA DELE ESTA AQUI.';
  const maq = new THREE.Group(); maq.position.set(12.05, .82, -4.68); W.grupo.add(maq);
  box(.36, .1, .26, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .4, metalness: .5 }), 0, .05, 0, maq); box(.32, .03, .12, MAT.preto, 0, .1, .05, maq, false);
  const mFolha = new THREE.MeshStandardMaterial({ map: null, color: 0xe8e0c8, roughness: .9, side: THREE.DoubleSide });
  const folha = plano(.22, .26, mFolha, 0, .24, -.08, 0, maq); folha.rotation.x = -.25;
  let maqN = S.flags.maqN || 0, maqFora = 0, maqTexK = -1;
  const texMaq = n => U.tex(176, 208, (g, w, h) => { g.fillStyle = '#e8e0c8'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1410'; g.font = '11px Courier New'; const s = FRASE_MAQ.slice(0, n); const ls = []; for (let i = 0; i < s.length; i += 22) ls.push(s.slice(i, i + 22)); ls.forEach((l, i) => g.fillText(l, 8, 18 + i * 14)); });
  const syncMaq = () => { const k = Math.floor(maqN / 3); if (k !== maqTexK) { maqTexK = k; mFolha.map = texMaq(maqN); mFolha.needsUpdate = true; } };
  syncMaq();
  W.tick.push(dt => {
    if (U.sala() !== 'diret' || maqN >= FRASE_MAQ.length) return;
    if (!U.olhando(12.05, .95, -4.68, .5, 12)) { maqFora += dt; if (maqFora > .35) { maqFora = 0; maqN++; S.flags.maqN = maqN; SOM.tecla({ x: 12.05, z: -4.68 }); syncMaq(); if (maqN === FRASE_MAQ.length) { SFX.clique(); U.depois(.3, () => SFX.clique()); } } }
    else maqFora = 0;
  });
  U.ler(maq, 'Ler a folha da máquina de escrever', () => {
    const s = FRASE_MAQ.slice(0, maqN);
    if (maqN < 10) return [{ quem: 'lia', texto: 'Uma folha em branco na máquina. Quase em branco.' }];
    return [{ quem: 'lia', texto: `“${s}${maqN < FRASE_MAQ.length ? '...' : ''}”` }, { quem: 'lia', texto: maqN >= FRASE_MAQ.length ? 'Ela escreve sozinha quando eu viro de costas. E sabe que eu tô aqui.' : 'Ela escreve quando eu viro de costas.' }];
  }, { mem: 'maquina', semLido: true });
  // telefone da diretoria (Cap. II, depois da fita 1)
  const telD = new THREE.Group(); telD.position.set(10.98, .82, -5.35); W.grupo.add(telD);
  box(.24, .09, .19, new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: .3 }), 0, .045, 0, telD); const foneD = cyl(.028, .028, .24, MAT.preto, 0, .12, -.02, 8, telD); foneD.rotation.z = Math.PI / 2;
  let telTocando = 0, telTocT = 0, telVezes = 0;
  interact(telD, () => telTocando > 0 ? '<b>E</b>Atender o telefone da diretoria' : 'Um telefone de baquelite.', () => {
    if (telTocando <= 0) return; telTocando = 0; S.flags.telDiret = 2; SFX.clique(); foneD.position.y = .2;
    A.sub('diretor', '(no telefone, como se fosse 1979) Moacir? Tranca a capela. Por fora.');
    U.depois(4, () => A.sub('diretor', '(no telefone) Ninguém sai antes do sino. Ninguém.'));
    U.depois(8, () => { SFX.suspiro({ x: 10.98, y: 1, z: -5.35 }); A.sub('lia', 'Ele mandou trancar as crianças. Ele mandou.'); foneD.position.y = .12; });
  });
  W.tick.push(dt => {
    if (telTocando <= 0) {
      if (S.flags.telDiret === 1 && telVezes < 3 && M.ativo && M.pos.distanceTo(A.P.pos) < 12 && U.sala() === 'diret') { telVezes++; telTocando = 8; telTocT = 0; }
      return;
    }
    telTocando -= dt; telTocT -= dt;
    if (telTocT <= 0) { telTocT = 2.4; SFX.orelhao({ x: 10.98, y: 1, z: -5.35 }); A.emitNoise(10.98, -5.35, 10); }
  });
  // maquete do internato: o bonequinho preto anda junto com ele
  const maqt = new THREE.Group(); maqt.position.set(15.7, 0, -8.6); W.grupo.add(maqt);
  A.prop(.9, .78, .7, MAT.madeiraEsc, 15.7, .39, -8.6);
  const esc = .0125, mBloco = new THREE.MeshStandardMaterial({ color: 0x9a8a6a, roughness: .9 });
  for (const r of W.salas) { if (r.fora) continue; const w = (r.x1 - r.x0) * esc, d = (r.z1 - r.z0) * esc; box(w * .94, .025, d * .94, mBloco, ((r.x0 + r.x1) / 2) * esc, .79, ((r.z0 + r.z1) / 2 + 13) * esc, maqt, false); }
  const pinM = cyl(.008, .008, .07, new THREE.MeshBasicMaterial({ color: 0x050505 }), 0, .84, 0, 6, maqt);
  const pinL = cyl(.006, .006, .035, new THREE.MeshBasicMaterial({ color: 0xd8c8a0 }), 0, .82, 0, 6, maqt);
  let maqOlhar = 0;
  W.tick.push(dt => {
    pinM.visible = M.ativo;
    if (M.ativo) pinM.position.set(M.pos.x * esc, .84, (M.pos.z + 13) * esc);
    pinL.position.set(A.P.pos.x * esc, .82, (A.P.pos.z + 13) * esc);
    if (U.sala() === 'diret' && M.ativo && U.olhando(15.7, .8, -8.6, .93, 2.6)) {
      maqOlhar += dt;
      if (maqOlhar > 3 && !S.flags.maqueteVirou) {
        S.flags.maqueteVirou = true; pinM.rotation.z = .5; SFX.estalo(M.pos, .7); U.medo(18);
        A.sub('lia', 'O bonequinho preto... virou pra mim. Na maquete.', true);
        if (M.state !== 'caca') { M.state = 'investiga'; A.planejar(M, A.P.pos.x, A.P.pos.z); }
      }
    } else maqOlhar = 0;
  });
  U.ler(maqt, 'Olhar a maquete do internato', () => [
    { quem: 'lia', texto: 'Uma maquete de madeira do prédio. Um bonequinho de chumbo branco onde eu tô.' },
    { quem: 'lia', texto: M.ativo ? 'E um bonequinho preto, alto. Ele anda sozinho pela maquete. É ele. É onde ele tá.' : 'Tem um furo onde devia ter outro boneco. Um maior.' }
  ], { mem: 'maquete', semLido: true });

  // ---- ENFERMARIA
  // régua de crescimento no batente: Davi para em 1979, e alguém mede você
  const tRegua = (lia) => U.tex(96, 400, (g, w, h) => {
    g.fillStyle = '#d8d0b8'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a2a1a'; g.font = '9px Georgia';
    for (let i = 0; i <= 20; i++) { const y = h - i * (h / 20); g.fillRect(0, y, i % 5 ? 10 : 20, 1); if (i % 5 === 0) g.fillText((i / 10).toFixed(1) + 'm', 22, y + 3); }
    g.strokeStyle = '#2a1a10'; g.lineWidth = 2; g.font = '10px Georgia';
    for (const [t, m] of [['MOACIR 51', 1.05], ['DAVI 75', 1.18], ['DAVI 77', 1.3], ['DAVI 79 1,41', 1.41], ['ANA 79', 1.22], ['TOMÉ 79', 1.29]]) { const y = h - m / 2 * h; g.beginPath(); g.moveTo(40, y); g.lineTo(90, y); g.stroke(); g.fillText(t, 36, y - 3); }
    if (lia) { g.strokeStyle = '#7a0a04'; g.fillStyle = '#7a0a04'; const y = h - 1.62 / 2 * h; g.lineWidth = 3; g.beginPath(); g.moveTo(30, y); g.lineTo(94, y); g.stroke(); g.font = 'bold 11px Georgia'; g.fillText('LIA — 1994', 32, y - 4); for (let i = 0; i < 3; i++) g.fillRect(40 + i * 18, y, 2, 10 + i * 6); }
  });
  const mRegua = new THREE.MeshStandardMaterial({ map: tRegua(false), roughness: .9 });
  const regua = plano(.24, 2, mRegua, 25.15, 1.0, -9.88, 0);
  const syncRegua = () => { const v = !!S.inv.fusiveis || !!S.flags.energia; if (v && !mRegua.userData.lia) { mRegua.userData.lia = true; mRegua.map = tRegua(true); mRegua.needsUpdate = true; } };
  U.ler(regua, () => mRegua.userData.lia ? 'Alguém mediu você' : 'Olhar a régua de crescimento no batente', () => mRegua.userData.lia ? [
    { quem: 'lia', texto: 'Tem um risco novo. Bem acima de todos. Ainda pingando: “LIA — 1994”.' },
    { quem: 'lia', texto: 'É exatamente a minha altura. Alguém me mediu. Agora.' }
  ] : [
    { quem: 'lia', texto: 'Uma régua de crescimento pintada no batente, com risquinhos e nomes.' },
    { quem: 'lia', texto: 'O do Davi para em 1979: um metro e quarenta e um. O mais baixo e mais antigo, quase apagado: “MOACIR 51”.' },
    { quem: 'lia', texto: 'Ele era desse tamanho.' }
  ], { mem: 'regua', semLido: true, aoLer: () => { if (mRegua.userData.lia && !S.flags.reguaLia) { S.flags.reguaLia = true; U.medo(15); SFX.sussurros(1); } } });
  // prontuário do Moacir criança e prancheta da Ana, pendurados nas camas
  const prancheta = (x, z, linhas) => { const g = new THREE.Group(); g.position.set(x, .78, z); W.grupo.add(g); box(.22, .3, .015, MAT.madeiraEsc, 0, 0, 0, g); plano(.19, .25, new THREE.MeshStandardMaterial({ map: papelTex(U, 128, 168, linhas, { fonte: '10px Georgia', y: 18, lh: 15, x: 8 }), roughness: .9 }), 0, -.01, .009, 0, g); return g; };
  const pr1 = prancheta(33, -7.8, ['Moacir D., 13 anos', '1951', 'armário: 14 horas', 'por ordem do diretor', 'queixa: não enxerga', 'o olho esquerdo']);
  U.ler(pr1, 'Ler o prontuário pendurado na última cama', () => [
    { quem: 'lia', texto: '“Moacir D., 13 anos, 1951. Trancado catorze horas no armário, por ordem do diretor.”' },
    { quem: 'lia', texto: '“Queixa: não enxerga direito com o olho esquerdo.”' },
    { quem: 'lia', texto: S.notes && S.notes.n4 ? 'A ficha médica de 1979 diz que ele perdeu a vista dos dois olhos. Começou aqui. Com ele criança.' : 'Começou aqui. Com ele criança.' }
  ], { mem: 'prontuario' });
  const pr2 = prancheta(19, -7.8, ['Ana L. P., 9 anos', 'não dorme no escuro.', 'A mãe pediu luz', 'acesa. Negado. — A.', '', 'conta até dez pra', 'não ter medo. — C.']);
  U.ler(pr2, 'Ler a prancheta da primeira cama', [
    { quem: 'lia', texto: '“Ana L. P., 9 anos. Não dorme no escuro. A mãe pediu luz acesa. Negado.” Assinado: A. Albano.' },
    { quem: 'lia', texto: 'Embaixo, com a letra da Irmã Celeste: “Ela conta até dez pra não ter medo.”' }
  ], { mem: 'pranchetaAna', aoLer: () => { S.flags.leuAnaEscuro = true; } });
  // radiografia de mão na janela: no relâmpago a mão aparece fechada, depois aberta
  const tRx = (fechada) => U.tex(128, 160, (g, w, h) => {
    g.fillStyle = '#0a1418'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(200,230,240,.85)'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(64, 150); g.lineTo(64, 96); g.stroke(); g.beginPath(); g.ellipse(64, 92, 22, 18, 0, 0, 7); g.stroke();
    for (let i = 0; i < 4; i++) { const x = 46 + i * 12; g.beginPath(); g.moveTo(x, 80); if (fechada) g.lineTo(x + 2, 70); else g.lineTo(x - 4 + i * 3, 26 + Math.abs(i - 1.5) * 8); g.stroke(); }
    g.beginPath(); g.moveTo(86, 96); g.lineTo(fechada ? 76 : 104, fechada ? 84 : 66); g.stroke();
    g.fillStyle = '#c8d8d0'; g.font = '9px Georgia'; g.fillText('T. Ribeiro — dedos', 8, 12);
  });
  const rxA = tRx(false), rxF = tRx(true), mRx = new THREE.MeshStandardMaterial({ map: rxA, roughness: .3, emissive: 0x203038, emissiveIntensity: .2 });
  const rx = plano(.4, .5, mRx, 29.6, 1.75, -.14, Math.PI);
  let rxFase = 0, rxRaio = false;
  W.tick.push(() => { const r = U.raio() > .15; if (r && !rxRaio && U.sala() === 'enferm') { rxFase++; mRx.map = rxFase % 2 ? rxF : rxA; mRx.needsUpdate = true; mRx.emissiveIntensity = 1.4; } else if (!r && rxRaio) mRx.emissiveIntensity = .2; rxRaio = r; });
  U.ler(rx, 'Olhar a radiografia presa na janela', [
    { quem: 'lia', texto: 'Uma radiografia de mão pequena. “T. Ribeiro — dedos.” O Tomé.' },
    { quem: 'lia', texto: 'No armário de remédio, vidros com rótulo à mão: “calmante — Hora”, “xarope — choro”.' },
    { quem: 'lia', texto: 'Até o remédio aqui era pra calar.' }
  ], { mem: 'raiox' });

  // ---- LAVANDERIA
  // uniforme 23 pingando num balde; ao voltar, dobrado no chão
  const uni = plano(.5, .72, new THREE.MeshStandardMaterial({ map: papelTex(U, 128, 184, [{ t: '23', fonte: 'bold 50px Georgia', cor: '#2a2a5a' }, { t: 'Davi M.', fonte: 'italic 16px Georgia', cor: '#7a1a1a' }], { fundo: '#9aa0a8', x: 40, y: 96, lh: 44 }), roughness: .6, side: THREE.DoubleSide }), 7.4, 1.5, -14.4, Math.PI);
  box(.05, .05, .12, MAT.ferrugem, 7.4, 1.9, -14.2, W.grupo, false);
  const balde = cyl(.15, .12, .25, MAT.metal, 7.4, .125, -14.5, 10);
  const dobrado = box(.34, .06, .24, new THREE.MeshStandardMaterial({ color: 0x9aa0a8, roughness: .7 }), 7.9, .03, -15.3); dobrado.visible = false;
  let uniGotaT = 0, uniViu = false;
  W.tick.push(dt => {
    if (S.flags.uniDobrado) { uni.visible = false; dobrado.visible = true; return; }
    if (U.sala() === 'lavand') { if (U.olhando(7.4, 1.5, -14.4, .85, 8)) uniViu = true; uniGotaT -= dt; if (uniGotaT <= 0) { uniGotaT = .55; SOM.gota({ x: 7.4, y: .3, z: -14.5 }); } }
    else if (uniViu) S.flags.uniDobrado = true;
  });
  U.ler(uni, 'Olhar o uniforme pingando', [
    { quem: 'lia', texto: 'Uniforme número 23. Encharcado. Na etiqueta, bordado em ponto-cruz: “Davi M.”' },
    { quem: 'lia', texto: 'A mãe bordava assim. Igualzinho.' }
  ], { mem: 'uniforme23', cond: () => !S.flags.uniDobrado, semCond: '' });
  interact(dobrado, () => 'O uniforme 23, dobrado no chão. Seco.', () => {});
  // pilha de lençóis bordados
  const len = new THREE.Group(); len.position.set(14.6, .86, -15.05); W.grupo.add(len);
  for (let i = 0; i < 4; i++) box(.5, .05, .36, MAT.lencol, (Math.random() - .5) * .03, .025 + i * .05, 0, len);
  plano(.18, .06, new THREE.MeshStandardMaterial({ map: papelTex(U, 96, 32, ['LIA M.'], { fundo: '#e0dccf', cor: '#7a1414', fonte: 'italic bold 18px Georgia', x: 48, y: 22, alinhar: 'center' }) }), 0, .202, .05, 0, len).rotation.x = -Math.PI / 2;
  let lenV = 0;
  U.ler(len, 'Olhar os lençóis bordados', () => { lenV++; return lenV < 2 ? [{ quem: 'lia', texto: 'Lençóis com o nome de cada aluno bordado à mão. O de cima: “LIA M.”' }, { quem: 'lia', texto: 'Eu nunca dormi aqui.' }] : [{ quem: 'lia', texto: `O bordado tem uma data agora. ${hoje()}/1994. Ponto por ponto. Linha ainda solta.` }]; }, { mem: 'lencois', semLido: true });
  // mochila de quem entrou em 1988
  const moch = new THREE.Group(); moch.position.set(6.55, 0, -23.6); moch.rotation.y = 1.2; W.grupo.add(moch);
  box(.32, .4, .18, new THREE.MeshStandardMaterial({ color: 0x2a3a6a, roughness: .9 }), 0, .2, 0, moch); box(.1, .06, .03, MAT.preto, .08, .3, .1, moch, false);
  let mochT = false;
  interact(moch, () => mochT ? 'O walkman chia...' : `<b>E</b>Apertar o play do walkman da mochila${S.flags.lido_mochila ? '<small style="opacity:.6"> (ouvido)</small>' : ''}`, () => {
    if (mochT) return; mochT = true; S.flags.lido_mochila = true; SFX.fitaClique();
    const ls = [['voz', '(walkman, 1988, risadas) Grava aí, Zé. Dizem que se ficar aqui até as nove...'], ['voz', '(walkman) ...as crianças aparecem. Que medo, hein?'], ['radio', '(walkman) ♪ dong... dong... dong... ♪'], ['voz', '(walkman, sussurro) ...responde, Zé.'], ['voz', '(walkman) Zé? ZÉ?']];
    ls.forEach(([q, t], i) => U.depois(.5 + i * 3, () => { A.sub(q, t); SFX.estatica(.7, { x: 6.55, y: .3, z: -23.6 }); }));
    U.depois(.5 + 5 * 3, () => { mochT = false; A.sub('lia', 'Não foi só em 79. Quem entra hoje, a Hora pega também.'); U.mem('mochila'); });
  });

  // ---- BANHEIROS: espelhos cobertos, a criança no reflexo e a lenda da descarga
  const mLencolEsp = new THREE.MeshStandardMaterial({ color: 0xcfc8b8, roughness: 1, side: THREE.DoubleSide });
  for (const x of [17.2, 20.4]) plano(.62, .9, mLencolEsp, x, 1.55, -14.07, Math.PI);
  const caido = plano(.7, .5, mLencolEsp, 18.8, .01, -14.6); caido.rotation.x = -Math.PI / 2;
  const avisoEsp = plano(.5, .16, new THREE.MeshStandardMaterial({ map: papelTex(U, 160, 48, ['Aluno não se olha. — A.'], { fonte: 'italic 15px Georgia', x: 80, y: 30, alinhar: 'center' }) }), 18.8, 2.05, -14.06, Math.PI);
  U.ler(avisoEsp, 'Ler o aviso acima dos espelhos', [
    { quem: 'lia', texto: '“Aluno não se olha.” Ordem do diretor. Os espelhos estão cobertos com lençol preso com fita.' },
    { quem: 'lia', texto: 'Menos um. O lençol desse caiu no chão.' }
  ], { mem: 'espelhos' });
  const crianca = plano(.34, .62, new THREE.MeshBasicMaterial({ map: U.tex(64, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(10,10,12,.92)'; g.beginPath(); g.ellipse(32, 30, 15, 18, 0, 0, 7); g.fill(); g.fillRect(14, 50, 36, 78); g.fillStyle = 'rgba(220,220,220,.9)'; g.fillRect(24, 28, 4, 3); g.fillRect(36, 28, 4, 3); }), transparent: true, depthWrite: false }), 18.8, 1.5, -14.06, Math.PI);
  crianca.visible = false; let criancaT = 0;
  W.tick.push(dt => {
    if (criancaT > 0) { criancaT -= dt; if (criancaT <= 0) crianca.visible = false; return; }
    if (!S.flags.espCrianca && U.sala() === 'banh' && Math.abs(A.P.pos.x - 18.8) < .6 && A.P.pos.z > -16.5 && U.olhando(18.8, 1.5, -14.06, .9, 3.5)) { S.flags.espCrianca = true; crianca.visible = true; criancaT = .14; SFX.susto(); U.medo(22); U.depois(.6, () => A.sub('lia', 'Tinha uma criança no lugar do meu reflexo.')); }
  });
  const privada = new THREE.Group(); privada.position.set(17, .45, -25.65); W.grupo.add(privada); box(.42, .06, .5, new THREE.MeshBasicMaterial({ visible: false }), 0, 0, 0, privada, false);
  const tPich = U.tex(256, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(40,30,30,.9)'; g.font = 'bold 22px Georgia'; g.textAlign = 'center'; g.fillText('NÃO DÁ DESCARGA 3 VEZES', w / 2, 40); });
  A.plano(.9, .22, new THREE.MeshStandardMaterial({ map: tPich, transparent: true, depthWrite: false }), 17.4, 1.5, -25.88, 0);
  let descargas = 0;
  interact(privada, () => S.flags.descarga3 ? 'Só água parada.' : '<b>E</b>Dar descarga', () => {
    if (S.flags.descarga3) return;
    descargas++; SFX.cano({ x: 17, y: .6, z: -25.6 }); A.emitNoise(17, -25.6, 9);
    if (descargas === 3) {
      S.flags.descarga3 = true; U.medo(25);
      U.depois(1.8, () => { SFX.risada(A.P.pos.x - .6, A.P.pos.z + .4); A.sub('ana', '(atrás de você, com a voz entupida) ...três vezes. Você contou certo.'); });
      U.depois(4.5, () => { S.inv.kits++; S.inv.pilhas++; A.toast('Na pia, alguém deixou um curativo e uma pilha. E um chumaço de algodão.'); U.mem('descarga'); });
    } else if (descargas === 1) A.toast('A descarga ruge pelos canos do prédio inteiro.');
  });

  // ---- CASA DE MÁQUINAS
  const caderno = plano(.36, .48, new THREE.MeshStandardMaterial({ map: papelTex(U, 160, 214, ['Manutenção — J.B.', 'Troquei a corda do', 'sino de novo. O menino', 'Davi pede. Diz que é', 'pra segurar o homem.', '', 'Gerador faz barulho', 'demais. NUNCA ligar', 'depois das nove.'], { fonte: '12px Georgia', y: 22, lh: 21, x: 10 }), roughness: .9 }), 33.87, 1.5, -17.4, -Math.PI / 2);
  U.ler(caderno, 'Ler o caderno de manutenção preso na parede', [
    { quem: 'joaquim', texto: '(a letra tremida do Seu Joaquim) “Troquei a corda do sino de novo. O menino Davi pede. Diz que é pra segurar o homem.”' },
    { quem: 'joaquim', texto: '“Gerador faz barulho demais. Nunca ligar depois das nove.”' },
    { quem: 'lia', texto: 'São quase nove.' }
  ], { mem: 'manutencao' });
  const bil = new THREE.Group(); bil.position.set(25.0, .9, -23.7); W.grupo.add(bil);
  const lvJ = A.MK.lanterna(); lvJ.rotation.y = 1; bil.add(lvJ); const pb = plano(.16, .12, MAT.papel, -.15, .006, .05, 0, bil); pb.rotation.x = -Math.PI / 2;
  U.ler(bil, 'Ler o bilhete ao lado da lanterna velha', [
    { quem: 'joaquim', texto: '“Gasolina na despensa. Fusível reserva na enfermaria. Não liga depois das nove. — J.”' },
    { quem: 'lia', texto: 'Ele chegou antes de mim. Hoje.' }
  ], { mem: 'bilheteJ' });
  // o radinho de pilha do Moacir
  const cad2 = new THREE.Group(); cad2.position.set(25.3, 0, -20.6); W.grupo.add(cad2);
  box(.45, .05, .45, new THREE.MeshStandardMaterial({ color: 0x8a7a4a, roughness: 1 }), 0, .45, 0, cad2); box(.45, .5, .05, new THREE.MeshStandardMaterial({ color: 0x8a7a4a, roughness: 1 }), 0, .72, -.2, cad2);
  for (const [dx, dz] of [[-.2, -.2], [.2, -.2], [-.2, .2], [.2, .2]]) box(.04, .45, .04, MAT.madeiraEsc, dx, .22, dz, cad2, false);
  A.addCollider(25.05, 25.55, -20.85, -20.35);
  const radinho = box(.2, .12, .07, new THREE.MeshStandardMaterial({ color: 0x8a1a14, roughness: .5 }), 0, .53, .05, cad2);
  let futebol = 0, futT = 0, futEsperou = false;
  interact(radinho, () => futebol > 0 ? '<b>E</b>Desligar o radinho' : '<b>E</b>Ligar o radinho de pilha', () => {
    if (futebol > 0) { futebol = 0; SFX.clique(); return; }
    futebol = 22; futT = 0; futEsperou = false; SFX.clique(); U.mem('radioM');
    if (!S.flags.dicaRadinho) { S.flags.dicaRadinho = true; U.depois(1.5, () => A.sub('lia', 'O rádio dele. Do tempo que ele ainda enxergava o jogo.')); }
  });
  const NARR = ['(rádio, 1979, chiado) ...vai pela esquerda, cruza... É GOOOOL!', '(rádio) ...a torcida canta no estádio lotado...', '(rádio) ...falta perigosa, a barreira se arma...', '(rádio) ...e o juiz apita, final do primeiro tempo...'];
  W.tick.push(dt => {
    if (futebol <= 0) return;
    futebol -= dt; futT -= dt;
    if (futT <= 0) { futT = 4; SFX.estatica(1.6, { x: 25.3, y: .6, z: -20.6 }); A.emitNoise(25.3, -20.6, 14); if (U.dist(25.3, -20.6) < 14) A.sub('radio', NARR[Math.floor(Math.random() * NARR.length)]); }
    if (!futEsperou && M.ativo && M.pos.distanceTo(new THREE.Vector3(25.3, 0, -20.6)) < 3) { futEsperou = true; M.wait = 6; M.path = []; M.state = 'procura'; M.searchT = 8; A.sub('lia', '(baixinho) Ele parou... tá ouvindo o jogo.'); }
    if (futebol <= 0) SFX.clique();
  });
  // campainha elétrica da escola (com energia): o prédio tem rotina, e o barulho chama ele
  const campainhas = [[-20, -10.2], [20, -10.2]];
  for (const [x, z] of campainhas) { cyl(.09, .09, .05, MAT.metal, x, 2.75, z + .04, 10).rotation.x = Math.PI / 2; }
  let campT = 70;
  W.tick.push(dt => {
    if (!S.flags.energia || S.chapter < 1) return;
    campT -= dt; if (campT > 0) return; campT = 85 + Math.random() * 30;
    const [x, z] = campainhas[Math.random() < .5 ? 0 : 1]; SOM.campainha({ x, z }); A.emitNoise(x, z, 18);
    if (!S.flags.dicaCampainha) { S.flags.dicaCampainha = true; U.depois(1.6, () => A.sub('lia', 'A campainha do recreio... o barulho vai chamar ele pro corredor. Pra longe de mim.')); }
  });

  // ---- PÁTIO: banco de visitas, amarelinha, o balanço
  const banco = new THREE.Group(); banco.position.set(-8.5, 0, 4.5); banco.rotation.y = Math.PI / 2; W.grupo.add(banco);
  box(1.6, .06, .42, MAT.madeiraEsc, 0, .46, 0, banco); box(1.6, .4, .06, MAT.madeiraEsc, 0, .74, -.2, banco);
  for (const s of [-1, 1]) box(.08, .46, .4, MAT.ferrugem, s * .7, .23, 0, banco);
  A.addCollider(-8.8, -8.2, 3.7, 5.3);
  plano(.5, .18, new THREE.MeshStandardMaterial({ map: papelTex(U, 192, 64, ['VISITAS:', '1º DOMINGO DO MÊS'], { fundo: '#d8d0b0', fonte: 'bold 16px Georgia', alinhar: 'center', x: 96, y: 26, lh: 22 }) }), 0, .9, -.17, 0, banco);
  U.ler(banco, 'Sentar no banco de visitas', [
    { quem: 'lia', texto: '“L + D”, riscado na madeira. Com canivete. Fui eu.' },
    { quem: 'lia', texto: '(eco, voz de menina) Davi, para de chorar. Eu volto no outro domingo.' },
    { quem: 'lia', texto: 'Eu não voltei.' }
  ], { mem: 'banco', som: false, aoLer: p => { if (p) { SFX.sussurros(1); S.fear = Math.max(0, S.fear - 20); } } });
  // amarelinha de 1 a 10
  const tAma = U.tex(128, 512, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(230,230,220,.75)'; g.lineWidth = 4; g.fillStyle = 'rgba(230,230,220,.75)'; g.font = 'bold 28px Georgia'; g.textAlign = 'center'; for (let i = 0; i < 10; i++) { const y = h - (i + 1) * 50; g.strokeRect(14, y, 100, 48); g.fillText(i === 9 ? 'DEZ' : String(i + 1), 64, y + 34); } });
  const ama = plano(.8, 4, new THREE.MeshStandardMaterial({ map: tAma, transparent: true, depthWrite: false, roughness: .2, metalness: .2 }), -3.6, .006, 7.2); ama.rotation.x = -Math.PI / 2;
  let amaN = 0;
  for (let i = 0; i < 10; i++) {
    const z = 9.2 - i * .4 - .2;
    A.gatilho('amarelinha' + i, -4, -3.2, z - .2, z + .2, () => {
      if (S.flags.amarelinha) return;
      if (i === amaN) { amaN++; if (amaN < 10) { if (amaN >= 3) A.sub('ana', `(longe, contando junto) ...${['um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'][amaN - 1]}...`); } else { S.flags.amarelinha = true; anaJanela(); } }
      else amaN = i === 0 ? 1 : 0;
    }, false);
  }
  const tMenina = U.tex(64, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(200,200,210,.75)'; g.beginPath(); g.ellipse(32, 26, 13, 15, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(40,30,30,.85)'; g.fillRect(19, 14, 26, 8); g.fillStyle = 'rgba(200,200,210,.75)'; g.beginPath(); g.moveTo(16, 44); g.lineTo(48, 44); g.lineTo(54, 128); g.lineTo(10, 128); g.closePath(); g.fill(); g.fillStyle = '#000'; g.fillRect(25, 25, 4, 4); g.fillRect(36, 25, 4, 4); });
  const menina = plano(.55, 1.1, new THREE.MeshBasicMaterial({ map: tMenina, transparent: true, depthWrite: false }), -1.55, 4.1, -.97); menina.visible = false;
  const anaJanela = () => { SFX.risada(-1.2, -1); U.depois(.4, () => { menina.visible = true; U.medo(18); A.sub('ana', '(lá de cima) ...DEZ. Você sabe brincar.'); }); U.depois(1.6, () => { menina.visible = false; U.mem('amarelinha'); }); };
  // o balanço para quando a lanterna bate nele
  if (ctx.balanco) { const b = ctx.balanco; let lit = 0; W.tick.push(dt => { lit = S.flashOn && U.olhando(6.5, 1.6, 6, .94, 14) ? Math.min(1, lit + dt * 2) : Math.max(0, lit - dt * .5); b.userData.parado = lit; if (lit > .9 && !S.flags.balancoParou) { S.flags.balancoParou = true; A.sub('lia', 'Ele parou. Quando a luz bateu, ele parou.'); } }); }

  // ---- INSCRIÇÕES DOS ARMÁRIOS (térreo): o armário do fim do corredor oeste é do Moacir menino
  inscricoesArmarios(A, S, U, [
    { x: -33.4, z: -12, frase: 'M.D. 1947 — não chora, Moacir', aoFicar: () => A.sub('lia', '(baixinho) M.D.... Moacir Duarte. Ele também ficava aqui dentro.') }
  ]);

  // ---- GANCHOS
  H.entrouSala = r => {
    if (r.id === 'aula' && S.chapter >= 1 && !S.flags.chamadaAula) { S.flags.chamadaAula = true; U.depois(1.2, fazerChamada); }
    if (r.id === 'cozinha' && S.chapter >= 1 && !S.flags.chaleira && !apito && !S.flags.chaleiraApitou) { S.flags.chaleiraApitou = true; U.depois(1.5, () => { apito = { t: 0, som: 0 }; }); }
    if (r.id === 'diret' && !S.flags.brasaVista) { S.flags.brasaVista = true; brasaOn = true; brasa.visible = true; }
    if ((r.id === 'ce' || r.id === 'cw') && S.chapter === 2 && S.flags.energia && !chamouLia && !S.flags.chamouDiret && S.capT > 40) { chamouLia = S.flags.chamouDiret = true; anuncio('Aluna Lia Moraes. Apresente-se à diretoria.', 3.5); }
  };
  H.inicioCapitulo = cap => { if (cap === 2) U.depois(1.2, () => anuncio('Vinte e uma horas. Todos para a cama.')); syncChamada(); };
  H.fitaOuvida = id => { if (id === 'f1' && S.chapter >= 2 && !S.flags.telDiret) { S.flags.telDiret = 1; U.depois(6, () => { telVezes++; telTocando = 8; telTocT = 0; }); } };
  let enerPrev = !!S.flags.energia;
  W.tick.push(() => {
    if (S.flags.energia && !enerPrev) U.depois(5, () => { for (const f of falantes) SFX.estatica(2, { x: f[0], y: f[1], z: f[2] }); U.depois(1, () => A.sub('diretor', '(alto-falante, gravação velha) Atenção, alunos. A Hora do Silêncio começa em cinco minutos.')); });
    enerPrev = !!S.flags.energia;
    if (S.done.procissao && !tPlanta38) { tPlanta38 = planta(true); quadroPlanta.material.map = tPlanta38; quadroPlanta.material.needsUpdate = true; }
  });
  H.sync = () => { syncChamada(); syncRegua(); if (S.flags.canecas) { for (const c of canecas.slice(3, 6)) c.rotation.y = Math.PI; can38.visible = true; } if (S.flags.chaleira) chal.position.x = -29; if (S.flags.descarga3) descargas = 3; if (S.flags.amarelinha) amaN = 10; };
  return H;
}

// =====================================================================
// ANDAR DE CIMA — DORMITÓRIOS
// =====================================================================
export function loreSuperior(A, S, ctx = {}) {
  const { THREE, MAT, box, cyl, plano, interact, SFX } = A;
  const U = base(A, S), SOM = sons(A), H = {}, W = A.W;
  const M = A.M, ANA = A.ANA;
  const tinta = tintaRelogio(A, S, U);

  // ---- CORREDOR: a noite do incêndio em seis desenhos de giz de cera, na altura de uma criança
  const cenas = [
    (g) => { g.strokeStyle = '#c8a020'; g.lineWidth = 5; g.beginPath(); g.moveTo(90, 30); g.lineTo(60, 110); g.lineTo(120, 110); g.closePath(); g.stroke(); g.beginPath(); g.arc(90, 118, 8, 0, 7); g.stroke(); g.fillStyle = '#3a2a1a'; g.font = 'bold 16px Comic Sans MS, Georgia'; g.fillText('O SINO', 150, 70); },
    (g) => { boneco(g, 60, 128, 1, '#205aa0'); boneco(g, 110, 128, 1, '#a02060'); boneco(g, 160, 128, 1, '#208040'); g.strokeStyle = '#3a2a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(74, 100); g.lineTo(96, 100); g.moveTo(124, 100); g.lineTo(146, 100); g.stroke(); },
    (g) => { boneco(g, 110, 140, 1.1, '#111', { alto: true, olhos: false }); g.fillStyle = '#7a1408'; g.font = 'bold 14px Georgia'; g.fillText('ELE NÃO VÊ', 20, 30); },
    (g) => { g.strokeStyle = '#6a4a2a'; g.lineWidth = 5; g.strokeRect(60, 40, 110, 90); g.beginPath(); g.moveTo(60, 40); g.lineTo(115, 10); g.lineTo(170, 40); g.stroke(); g.lineWidth = 9; g.strokeStyle = '#333'; g.beginPath(); g.moveTo(40, 90); g.lineTo(190, 90); g.stroke(); g.fillStyle = '#3a2a1a'; g.font = 'bold 13px Georgia'; g.fillText('TRANCADA', 75, 150); },
    (g) => { for (let i = 0; i < 9; i++) { g.fillStyle = ['#e04010', '#f08020', '#f0c020'][i % 3]; g.beginPath(); g.moveTo(30 + i * 20, 150); g.quadraticCurveTo(20 + i * 20, 60 + (i % 3) * 20, 40 + i * 20, 30 + (i % 2) * 30); g.quadraticCurveTo(50 + i * 20, 90, 50 + i * 20, 150); g.fill(); } },
    (g, lia) => { g.fillStyle = '#5a8ac8'; g.fillRect(0, 0, 220, 60); boneco(g, 60, 70, .8, '#205aa0'); boneco(g, 110, 70, .8, '#a02060'); boneco(g, 160, 70, .8, '#208040'); if (lia) boneco(g, 110, 160, 1, '#c8b080', { vela: true }); }
  ];
  const texCena = (i, lia) => giz(U, 220, 170, g => cenas[i](g, lia), '#e8dcc0');
  const zs = [-4.5, -11, -17, -24.5, -27.5, -45];
  const desenhos = zs.map((z, i) => plano(.6, .46, new THREE.MeshStandardMaterial({ map: texCena(i, false), roughness: 1 }), -2.875, 1.0, z, Math.PI / 2));
  const mUlt = desenhos[5].material; let ultLia = false;
  desenhos.forEach((d, i) => U.ler(d, 'Olhar o desenho de giz de cera', () => [[
    { quem: 'lia', texto: 'Um sino, desenhado com força. O papel até rasgou.' }], [{ quem: 'lia', texto: 'Três crianças de mão dada. Azul, rosa, verde. Davi, Ana, Tomé.' }], [{ quem: 'lia', texto: 'Um homem alto, comprido demais. No lugar dos olhos, um risco.' }], [{ quem: 'lia', texto: 'A capela. Com uma tranca enorme do lado de fora.' }], [{ quem: 'lia', texto: 'Fogo. Só fogo.' }],
    [{ quem: 'lia', texto: ultLia ? 'As três crianças no céu... e embaixo, uma moça de lanterna. Isso não tava aqui antes.' : 'As três crianças no céu, azul.' }, ...(i === 5 ? [{ quem: 'lia', texto: 'Seis desenhos. A noite inteira, contada por quem não podia falar.' }] : [])]][i], { mem: 'desenhos', semLido: true }));
  // desenho da Ana que mostra onde você está (redesenha quando sai da vista)
  const mAnaD = new THREE.MeshStandardMaterial({ map: giz(U, 220, 170, g => { g.fillStyle = '#3a2a1a'; g.font = 'bold 15px Georgia'; g.fillText('A MOÇA', 70, 90); }, '#e8dcc0'), roughness: 1 });
  const anaD = plano(.6, .46, mAnaD, 2.875, 1.05, -7, -Math.PI / 2);
  let anaDN = 0, anaDFora = 0;
  W.tick.push(dt => {
    if (anaDN >= 3 || S.chapter < 3) return;
    if (U.olhando(2.875, 1.05, -7, .7, 14)) { anaDFora = 0; return; }
    anaDFora += dt;
    if (anaDFora > 2 && U.sala() !== 'corr' && U.sala() !== 'patamar' && U.sala()) {
      anaDFora = 0; anaDN++; const nomeSala = A.P.room.nome.toUpperCase(), n = anaDN;
      mAnaD.map = giz(U, 220, 170, g => { g.strokeStyle = '#6a4a2a'; g.lineWidth = 3; g.strokeRect(10, 10, 200, 150); g.fillStyle = '#3a2a1a'; g.font = 'bold 13px Georgia'; g.fillText(nomeSala, 18, 30); if (n === 3) { g.strokeStyle = '#2a4a2a'; g.lineWidth = 4; g.strokeRect(90, 40, 50, 110); boneco(g, 115, 140, .8, '#c8b080', { vela: true }); boneco(g, 175, 150, 1, '#111', { alto: true, olhos: false }); } else { boneco(g, 80, 150, .9, '#c8b080', { vela: true }); boneco(g, 130, 150, 1, '#111', { alto: true, olhos: false }); } }, '#e8dcc0');
      mAnaD.needsUpdate = true;
    }
  });
  U.ler(anaD, 'Olhar o desenho de giz de cera na parede', () => anaDN === 0 ? [{ quem: 'lia', texto: '“A moça.” Só isso, escrito com giz de cera.' }] : [{ quem: 'lia', texto: anaDN >= 3 ? 'A moça dentro de um armário... e o homem alto do lado de fora. Ela desenha o que vai acontecer.' : 'Ela desenhou a sala onde eu tava agora há pouco. Eu, de lanterna. E uma coisa alta logo atrás.' }], { mem: 'desenhos', semLido: true });
  // varal de desenhos que pioram ano a ano
  box(5.8, .01, .01, MAT.preto, 0, 2.38, -5.6, W.grupo, false);
  const varalT = [
    g => { g.fillStyle = '#f0c020'; g.beginPath(); g.arc(50, 40, 22, 0, 7); g.fill(); g.strokeStyle = '#a03010'; g.lineWidth = 4; g.strokeRect(100, 80, 70, 60); g.beginPath(); g.moveTo(95, 80); g.lineTo(135, 45); g.lineTo(175, 80); g.stroke(); g.fillStyle = '#333'; g.font = '14px Georgia'; g.fillText('1976', 10, 160); },
    g => { boneco(g, 70, 150, 1, '#222'); boneco(g, 140, 150, 1, '#222'); g.fillStyle = '#fff'; g.fillRect(58, 70, 24, 10); g.fillRect(128, 70, 24, 10); g.fillStyle = '#333'; g.font = '14px Georgia'; g.fillText('1977 irmãs', 10, 20); },
    g => { for (let i = 0; i < 4; i++) { g.strokeStyle = '#3a6a3a'; g.lineWidth = 4; g.strokeRect(20 + i * 48, 40, 40, 110); } g.fillStyle = '#333'; g.font = '14px Georgia'; g.fillText('1978', 10, 20); },
    g => { boneco(g, 110, 160, 1.15, '#111', { alto: true, olhos: false }); g.fillStyle = '#333'; g.font = '14px Georgia'; g.fillText('1979', 10, 20); g.font = 'italic 15px Georgia'; g.fillStyle = '#7a1a5a'; g.fillText('Lia', 170, 160); }
  ];
  const varal = varalT.map((f, i) => { const p = plano(.42, .34, new THREE.MeshStandardMaterial({ map: giz(U, 220, 170, f, '#ece2c8'), roughness: 1, side: THREE.DoubleSide }), -2.1 + i * 1.4, 2.16, -5.6, 0); p.rotation.z = (Math.random() - .5) * .15; return p; });
  const tVaral = { t: 0 }; W.tick.push(dt => { tVaral.t += dt; varal.forEach((p, i) => { p.rotation.x = Math.sin(tVaral.t * .9 + i) * .08; }); });
  for (const p of varal) U.ler(p, 'Olhar os desenhos pendurados no varal', [
    { quem: 'lia', texto: '1976: sol e casinha. 1977: as freiras. 1978: os armários. 1979: um homem alto sem olhos, em todos.' },
    { quem: 'lia', texto: 'O de 1979 tá assinado “Lia”. Com letra de criança.' },
    { quem: 'lia', texto: 'Eu nunca desenhei isso. Eu acho que nunca desenhei isso.' }
  ], { mem: 'varal' });

  // ---- PATAMAR: malas de 17/03, sapateira, espelho, fuligem, tábuas queimadas
  const malas = new THREE.Group(); malas.position.set(-3.9, 0, 3.4); W.grupo.add(malas);
  const mPap = new THREE.MeshStandardMaterial({ color: 0x7a5a38, roughness: .9 });
  box(.7, .25, .45, mPap, 0, .125, 0, malas); box(.6, .22, .4, mPap, .05, .36, -.02, malas); box(.62, .2, .42, new THREE.MeshStandardMaterial({ color: 0x6a4a2e, roughness: .9 }), 0, .1, .6, malas);
  const meia = box(.12, .02, .06, new THREE.MeshStandardMaterial({ color: 0xe8b8c8, roughness: 1 }), 0, .21, .6, malas, false);
  A.addCollider(-4.35, -3.45, 3.1, 4.1);
  U.ler(malas, 'Olhar as malas empilhadas', [
    { quem: 'lia', texto: 'Malas de papelão com etiqueta de nome. “Transferência — 17/03/1979.” A viagem que ninguém fez.' },
    { quem: 'lia', texto: 'A do Davi tá aberta. Dentro, uma meia só. Pequena, de menina. Bordado: “L.M.”' },
    { quem: 'lia', texto: 'Minha meia. Ele ia levar a minha meia.' }
  ], { mem: 'malas' });
  const sap = new THREE.Group(); sap.position.set(4.3, 0, 3.6); W.grupo.add(sap);
  box(.45, .9, 1.2, MAT.madeiraEsc, 0, .45, 0, sap); A.addCollider(4.05, 4.55, 3, 4.2);
  for (let i = 0; i < 6; i++) box(.12, .06, .2, MAT.preto, -.2, .25 + Math.floor(i / 3) * .35, -.35 + (i % 3) * .35, sap, false);
  U.ler(sap, 'Olhar a sapateira', [
    { quem: 'lia', texto: 'Dezenas de sapatinhos. Todos com um guizo pregado no calcanhar. Muitos arrancados, com o couro rasgado.' },
    { quem: 'lia', texto: 'Um papel colado por dentro: “Guizo obrigatório na Hora. Ordem do Inspetor.”' },
    { quem: 'lia', texto: 'Era assim que ele achava eles. Antes de não precisar mais.' }
  ], { mem: 'sapateira', som: false, aoLer: () => SOM.tilintar({ x: 4.3, y: .6, z: 3.6 }) });
  // espelho do patamar: o Davi ao lado da Lia
  const mEsp = new THREE.MeshStandardMaterial({ color: 0x4a5a5a, roughness: .08, metalness: .9 });
  const espelho = plano(.9, 1.6, mEsp, -4.88, 1.5, .3, Math.PI / 2);
  box(.04, 1.7, 1.0, MAT.madeiraEsc, -4.92, 1.5, .3, W.grupo, false);
  const daviRef = plano(.4, .95, new THREE.MeshBasicMaterial({ map: U.tex(64, 160, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(150,170,180,.75)'; g.beginPath(); g.ellipse(32, 26, 13, 16, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(30,25,20,.9)'; g.fillRect(18, 12, 28, 9); g.fillStyle = 'rgba(150,170,180,.75)'; g.fillRect(16, 46, 32, 114); }), transparent: true, depthWrite: false }), -4.86, 1.05, .05, Math.PI / 2);
  daviRef.visible = false; let espOlhar = 0, daviT = 0;
  W.tick.push(dt => {
    if (daviT > 0) { daviT -= dt; if (daviT <= 0) { daviRef.visible = false; U.depois(.5, () => A.sub('lia', 'Tinha um menino do meu lado. No espelho. Da altura do meu ombro.')); } return; }
    if (S.flags.daviEspelho || U.sala() !== 'patamar') return;
    if (U.olhando(-4.88, 1.5, .3, .9, 4.5)) { espOlhar += dt; if (espOlhar > 1.1) { S.flags.daviEspelho = true; daviRef.visible = true; daviT = .5; U.medo(15); SFX.sussurros(.8); U.mem('espelhoP'); } } else espOlhar = 0;
  });
  // fuligem do incêndio e a mão do Joaquim no corrimão
  const tFul = U.tex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 18; i++) { const x = Math.random() * w, y = h - Math.random() * h * .9, r = 20 + Math.random() * 70; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(8,6,4,.8)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } });
  U.decal(tFul, 3, 2.6, 4.88, 1.6, .8, -Math.PI / 2); U.decal(tFul, 2.4, 2.6, -4.88, 1.6, 4.4, Math.PI / 2);
  const mCarv = new THREE.MeshStandardMaterial({ color: 0x0e0b08, roughness: 1 });
  const corrimao = box(.07, .07, 1.8, mCarv, 1.45, .95, 4.7, W.grupo, false);
  for (let i = 0; i < 3; i++) box(.05, .9, .05, mCarv, 1.45, .45, 3.95 + i * .75, W.grupo, false);
  const maoJ = plano(.2, .26, new THREE.MeshStandardMaterial({ map: U.tex(64, 80, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(4,3,2,.92)'; g.beginPath(); g.ellipse(32, 50, 18, 22, 0, 0, 7); g.fill(); for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(18 + k * 9, 18, 4, 12, 0, 0, 7); g.fill(); } }), transparent: true, depthWrite: false }), 1.41, 1.02, 4.4, -Math.PI / 2);
  U.ler(corrimao, 'Olhar o corrimão carbonizado', [
    { quem: 'lia', texto: 'O corrimão tá carvão puro. Tem a marca de uma mão grande, de adulto, fundida na madeira.' },
    { quem: 'lia', texto: 'Ele chegou até aqui. O fogo não deixou ele passar.' }
  ], { mem: 'maoJ', aoLer: p => { if (p) U.depois(.4, () => { SFX.estalo({ x: 1.4, z: 4.5 }, .6); }); } });
  void maoJ;
  // tábuas queimadas no meio do patamar: estalam (vá pela beirada ou agachada)
  const tTab = U.tex(256, 128, (g, w, h) => { g.fillStyle = 'rgba(20,14,8,.85)'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(i * 44, 0); g.lineTo(i * 44 + 6, h); g.stroke(); } manchar(g, w, h, 6, 'rgba(60,30,10,.5)'); });
  const tabuas = plano(2.6, 1.3, new THREE.MeshStandardMaterial({ map: tTab, transparent: true, roughness: 1, depthWrite: false }), 0, .005, .9); tabuas.rotation.x = -Math.PI / 2;
  A.gatilho('tabuasQueimadas', -1.3, 1.3, .25, 1.55, () => {
    if (A.P.crouch) { SFX.estalo({ x: A.P.pos.x, z: A.P.pos.z }, .25); return; }
    SFX.rangido(A.P.pos.x, .1, A.P.pos.z, 1.1); A.emitNoise(A.P.pos.x, A.P.pos.z, S.chapter >= 3 ? 8 : 3);
    if (!S.flags.dicaTabuas) { S.flags.dicaTabuas = true; A.toast('Tábuas queimadas estalam alto. Vá pela beirada, ou agachada (C).'); }
  }, false);

  // ---- DORMITÓRIO A: armário do Davi, a caixa de sapato, as estrelas do teto
  const armD = new THREE.Group(); armD.position.set(-8.2, 0, -13.68); W.grupo.add(armD);
  box(.5, 1.3, .4, new THREE.MeshStandardMaterial({ color: 0x3a4a3a, roughness: .6, metalness: .3 }), 0, .65, 0, armD);
  plano(.3, .07, new THREE.MeshStandardMaterial({ map: papelTex(U, 128, 32, ['DAVI M.'], { fundo: '#d8cca8', fonte: 'bold 18px Georgia', alinhar: 'center', x: 64, y: 24 }) }), 0, 1.15, .202, 0, armD);
  A.addCollider(-8.45, -7.95, -13.9, -13.46);
  U.ler(armD, 'Abrir o armário de aluno com fita crepe “DAVI M.”', [
    { quem: 'lia', texto: 'O uniforme dobrado. Uma foto minha, criança, presa com chiclete na porta.' },
    { quem: 'lia', texto: 'E um estojo de fita cassete vazio. Escrito a caneta: “PARA LIA — NÃO OUVIR ANTES DAS 9”.' },
    { quem: 'lia', texto: 'Era isso que tava dentro da fita que chegou lá em casa. Ele mandou. Ele conseguiu mandar.' }
  ], { mem: 'armDavi', som: false, ruido: 4, aoLer: () => SFX.rangido(-8.2, 1, -13.5, .5) });
  const caixaS = new THREE.Group(); caixaS.position.set(-10.55, 0, -4.85); caixaS.rotation.y = .4; W.grupo.add(caixaS);
  box(.32, .12, .2, new THREE.MeshStandardMaterial({ color: 0xb8a070, roughness: .9 }), 0, .06, 0, caixaS);
  U.ler(caixaS, 'Abrir a caixa de sapato embaixo da cama', [
    { quem: 'lia', texto: 'Figurinhas, uma bolinha de gude e três cartas pra mim. Nunca mandadas.' },
    { quem: 'davi', texto: '“Lia, hoje teve bolo de fubá. O Tomé me deu o pedaço dele.”' },
    { quem: 'davi', texto: '“Lia, o homem passou do lado da minha cama. Eu não respirei. Eu conto até cem igual você ensinou.”' },
    { quem: 'davi', texto: '“Lia, amanhã a gente toca o sino. Se der errado, não fica brava. Você não tem culpa.”' },
    { quem: 'lia', texto: '...Tenho sim.' }
  ], { mem: 'cartasDavi', aoLer: () => { S.flags.leuCartasDavi = true; } });
  // estrelas fosforescentes no teto: um sino e o primeiro número do Davi
  const cod0 = S.code && S.code[0] !== undefined ? S.code[0] : 7;
  const tEst = U.tex(512, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = '#fff';
    const est = (x, y, r) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); };
    for (let i = 0; i < 26; i++) { const t = i / 26 * Math.PI; est(256 + Math.cos(t) * 110 * (i % 2 ? 1 : .9), 220 - Math.sin(t) * 140, 9); }
    for (let i = 0; i < 9; i++) est(146 + i * 27.5, 230, 9);
    est(256, 262, 14);
    g.font = 'bold 120px Georgia'; g.textAlign = 'center'; g.fillText(String(cod0), 256, 430);
    for (let i = 0; i < 20; i++) est(Math.random() * w, Math.random() * h, 3 + Math.random() * 3);
  });
  tinta(tEst, 3.6, 3.6, -8, 3.16, -8, 0, Math.PI / 2);
  // ecos do relâmpago: crianças sentadas nas camas
  {
    const g = new THREE.Group(); g.visible = false; W.grupo.add(g);
    const tS = U.tex(64, 96, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(200,210,230,.55)'; c.beginPath(); c.ellipse(32, 22, 12, 14, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(16, 40); c.lineTo(48, 40); c.lineTo(52, 96); c.lineTo(12, 96); c.closePath(); c.fill(); });
    for (const z of [-12.56, -10.28, -8.0, -3.44]) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.position.set(-11.6, 1.0, z); s.scale.set(.42, .64, 1); g.add(s); }
    let vis = 0;
    W.tick.push(dt => { if (vis > 0) { vis -= dt; if (vis <= 0) { g.visible = false; U.depois(.4, () => A.sub('lia', '(bem baixinho) Eles tavam sentados nas camas. Todos olhando pra mim.')); } return; } if (!S.flags.eco_dormA && U.sala() === 'dormA' && U.raio() > .15) { S.flags.eco_dormA = true; g.visible = true; vis = .35; U.medo(15); } });
  }

  // ---- DORMITÓRIO B: o telefone de lata para o Dormitório A (o Tomé sabe onde ele está)
  const lata = new THREE.Group(); lata.position.set(-6.5, .55, -14.18); W.grupo.add(lata);
  const lataC = cyl(.045, .045, .1, MAT.metal, 0, 0, -.05, 10, lata); lataC.rotation.x = Math.PI / 2; box(.004, .004, .4, MAT.lencol, 0, 0, .1, lata, false);
  interact(lata, () => S.flags['lata' + S.chapter] ? 'O copo de lata. Agora só chia.' : A.P.crouch ? '<b>E</b>Encostar o ouvido no copo de lata' : 'Um copo de lata preso num barbante que atravessa a parede. Agache (C) para alcançar.', () => {
    if (S.flags['lata' + S.chapter] || !A.P.crouch) return;
    S.flags['lata' + S.chapter] = true; SFX.clique();
    const onde = M.ativo ? A.roomAt(M.pos.x, M.pos.z) : null;
    const perto = M.ativo && M.pos.distanceTo(A.P.pos) < 8;
    U.depois(1.2, () => A.sub('tome', '(pelo barbante, sussurrando) Tá me ouvindo? ...psiu.'));
    U.depois(4, () => A.sub('tome', !M.ativo ? '(pelo barbante) Ele ainda não subiu. Mas vai.' : perto ? '(pelo barbante) Ele tá AQUI. Do teu lado da parede. Não mexe.' : `(pelo barbante) Ele tá no ${onde.nome.toLowerCase()} agora. Vai pelo outro lado.`));
    U.depois(8, () => { A.sub('lia', 'O barbante não vai a lugar nenhum. Acaba na parede.'); U.mem('lata'); });
  });

  // ---- DORMITÓRIO D: a cama da Ana
  const tConta = U.tex(512, 448, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(40,36,30,.7)'; g.font = '13px Georgia';
    for (let y = 18; y < h - 30; y += 15) { let s = ''; while (s.length < 80) s += '1 2 3 4 5 6 7 8 9 10  '; g.fillText(s, (y % 30) - 10, y); }
    g.fillStyle = '#9a0a04'; g.font = 'bold 60px Georgia'; g.fillText('10', 360, 420);
    for (let i = 0; i < 5; i++) g.fillRect(372 + i * 12, 420, 3, 10 + Math.random() * 26);
    g.fillStyle = 'rgba(60,20,20,.85)'; g.font = 'italic 22px Georgia'; g.fillText('EU TÔ OLHANDO', 30, 420);
  });
  const contaAna = plano(1.9, 1.66, new THREE.MeshStandardMaterial({ map: tConta, transparent: true, roughness: 1, depthWrite: false }), 3.12, 1.35, -15.72, Math.PI / 2);
  const bonecasAna = [[4.65, -16.05], [4.95, -15.42], [5.0, -15.95]].map(([x, z]) => { const b = A.MK.boneca(); b.position.set(x, .63, z); b.rotation.y = Math.atan2(3 - x, -19.14 - z); W.grupo.add(b); return b; });
  U.ler(contaAna, 'Olhar a parede atrás da cama', [
    { quem: 'lia', texto: '“1 2 3 4 5 6 7 8 9 10.” Milhares de vezes, a lápis, na altura de uma criança deitada.' },
    { quem: 'lia', texto: 'O último dez tá em vermelho. Fresco. Escorrendo.' },
    { quem: 'lia', texto: 'As bonecas em volta da cama estão todas viradas pra porta. Vigiando. Ela nunca fechava o olho.' }
  ], { mem: 'camaAna' });
  void bonecasAna;
  const lataV = new THREE.Group(); lataV.position.set(5.4, 0, -15.25); W.grupo.add(lataV);
  cyl(.1, .1, .12, new THREE.MeshStandardMaterial({ color: 0x8a3a2a, roughness: .5, metalness: .4 }), 0, .06, 0, 12, lataV);
  for (let i = 0; i < 4; i++) cyl(.012, .012, .06 + i * .01, MAT.vela, -.04 + i * .025, .13, (i % 2) * .02, 6, lataV);
  U.ler(lataV, 'Abrir a lata de biscoito', [
    { quem: 'lia', texto: 'Tocos de vela. Dezenas. Juntados um por um. “PRA NÃO TER ESCURO”, escrito na tampa.' },
    { quem: 'lia', texto: '...O fogo começou nas velas. Foi o que disseram.' },
    { quem: 'lia', texto: 'Ela só tinha medo do escuro.' }
  ], { mem: 'velas' });

  // ---- ROUPARIA: o armário do castigo e os uniformes molhados
  const castigo = A.armario(10.5, -11.55, [0, 1]);
  plano(.42, .14, new THREE.MeshStandardMaterial({ map: papelTex(U, 160, 52, ['CASTIGO'], { fundo: '#2a2a22', cor: '#c8c0a0', fonte: 'bold 26px Georgia', alinhar: 'center', x: 80, y: 36 }) }), 0, 1.86, .345, 0, castigo.g);
  A.vela(10.5, 2.06, -11.55);
  const rack = box(2.4, .03, .03, MAT.ferrugem, 7.5, 2.0, -2.35, W.grupo, false); void rack;
  const mUni = (n, c) => new THREE.MeshStandardMaterial({ map: papelTex(U, 96, 160, [{ t: n, fonte: 'bold 14px Georgia', cor: c }], { fundo: '#8a929a', x: 10, y: 140 }), roughness: .5, side: THREE.DoubleSide });
  const unis = [['DAVI M.', '#2a2a6a', 6.8], ['ANA L. P.', '#6a2a4a', 7.5], ['TOMÉ R.', '#2a5a3a', 8.2]].map(([n, c, x]) => plano(.45, .78, mUni(n, c), x, 1.55, -2.38, Math.PI));
  const pocaR = plano(1.8, .7, new THREE.MeshStandardMaterial({ color: 0x0c1012, roughness: .05, metalness: .6, transparent: true, opacity: .75, depthWrite: false }), 7.5, .004, -2.8); pocaR.rotation.x = -Math.PI / 2;
  const pegR = new THREE.Group(); pegR.visible = false; W.grupo.add(pegR);
  const tPeg = U.tex(64, 96, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(14,20,18,.85)'; g.beginPath(); g.ellipse(32, 58, 12, 22, 0, 0, 7); g.fill(); for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(21 + i * 6, 27 - Math.abs(i - 2) * 2.4, 3.4, 4.4, 0, 0, 7); g.fill(); } });
  const mPeg = new THREE.MeshStandardMaterial({ map: tPeg, transparent: true, roughness: .1, metalness: .35, depthWrite: false });
  for (let i = 0; i < 7; i++) { const m = plano(.11, .17, mPeg, 6.8 - i * .4, .004, -2.95 + (i % 2) * .14, 0, pegR); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.PI / 2; }
  let uniViu = false, uniFora = 0;
  W.tick.push(dt => {
    if (S.flags.uniSumiu) { unis[0].visible = false; pegR.visible = true; return; }
    if (U.sala() !== 'roup') return;
    if (U.olhando(7.5, 1.55, -2.38, .8, 8)) { uniViu = true; uniFora = 0; }
    else if (uniViu) { uniFora += dt; if (uniFora > 2.5) { S.flags.uniSumiu = true; SFX.arrastar(); U.medo(10); } }
  });
  U.ler(unis[1], 'Olhar os uniformes pingando', () => S.flags.uniSumiu ? [
    { quem: 'lia', texto: 'Um cabide vazio. O do Davi. E pegadas molhadas, pequenas, saindo pela porta.' }
  ] : [
    { quem: 'lia', texto: 'Três uniformes encharcados. DAVI M., ANA L. P., TOMÉ R. A poça embaixo cresce.' },
    { quem: 'lia', texto: 'Água de túnel. Eles vêm de lá. Toda noite.' }
  ], { mem: 'uniformes', semLido: true });

  // ---- SALA DE BRINQUEDOS
  // placar da brincadeira: QUEM EU ACHEI
  const placar = lia => giz(U, 384, 256, g => {
    g.fillStyle = 'rgba(230,230,220,.85)'; g.strokeStyle = 'rgba(230,230,220,.85)'; g.lineWidth = 3; g.font = 'bold 24px Georgia'; g.fillText('QUEM EU ACHEI', 90, 34);
    g.font = '20px Georgia'; [['TOMÉ', 4], ['DAVI', 2], ['IRMÃ CELESTE', 1], ['SEU MOACIR', 0], ['LIA', lia ? 1 : 0]].forEach(([n, k], i) => { const y = 72 + i * 38; g.fillText(n, 30, y); for (let j = 0; j < k; j++) { g.beginPath(); g.moveTo(230 + j * 14, y - 18); g.lineTo(230 + j * 14, y + 2); g.stroke(); } if (n === 'SEU MOACIR') { g.beginPath(); g.ellipse(100, y - 7, 90, 18, 0, 0, 7); g.stroke(); } });
  }, '#1e2a22');
  const mPlacar = new THREE.MeshStandardMaterial({ map: placar(false), roughness: .9 });
  const placarM = plano(1.6, 1.07, mPlacar, 14.88, 1.55, -28.2, -Math.PI / 2);
  U.ler(placarM, 'Ler o placar de giz na parede', () => [
    { quem: 'lia', texto: '“Quem eu achei.” Tomé, quatro risquinhos. Davi, dois. Irmã Celeste, um.' },
    { quem: 'lia', texto: 'O nome do Seu Moacir sem risquinho nenhum. Só um círculo em volta. Ele ela nunca achou. Ou nunca quis.' },
    { quem: 'lia', texto: S.done.ana ? 'E embaixo: “LIA”. Com um risquinho novo.' : 'E embaixo: “LIA”. Vazio. Ainda.' }
  ], { mem: 'placar', semLido: true });
  // bestiário de giz de cera
  const tBest = giz(U, 540, 150, g => {
    boneco(g, 70, 130, 1, '#222', { alto: true, olhos: false }); g.strokeStyle = '#222'; g.lineWidth = 4; g.beginPath(); g.ellipse(52, 20, 8, 14, 0, 0, 7); g.ellipse(88, 20, 8, 14, 0, 0, 7); g.stroke();
    g.fillStyle = '#7a1408'; g.font = 'bold 16px Georgia'; g.fillText('ELE OUVE', 110, 140);
    boneco(g, 270, 130, 1, '#a02060'); g.fillStyle = '#fff'; g.beginPath(); g.arc(264, 76, 7, 0, 7); g.arc(278, 76, 7, 0, 7); g.fill(); g.fillStyle = '#000'; g.fillRect(262, 74, 4, 4); g.fillRect(276, 74, 4, 4); g.fillStyle = '#7a1408'; g.fillText('OLHA PRA ELA', 300, 140);
    g.strokeStyle = '#6a4a2a'; g.lineWidth = 4; g.strokeRect(420, 90, 100, 20); g.fillStyle = '#333'; g.fillRect(440, 112, 60, 10); g.fillStyle = '#7a1408'; g.fillText('ESCONDE NA CAMA', 400, 80);
  }, '#ece2c8');
  const best = plano(1.8, .5, new THREE.MeshStandardMaterial({ map: tBest, roughness: 1 }), 3.12, 1.0, -27.3, Math.PI / 2);
  U.ler(best, 'Olhar os desenhos pregados com tachinha', [
    { quem: 'lia', texto: 'Um homem alto de orelha enorme: “ELE OUVE”. Uma menina de olho gigante: “OLHA PRA ELA”.' },
    { quem: 'lia', texto: 'E uma fila de crianças embaixo de uma cama: “ESCONDE NA CAMA”.' },
    { quem: 'lia', texto: 'Eles ensinavam uns aos outros. Com giz de cera.' }
  ], { mem: 'bestiario' });
  // parede de risquinhos de dez em dez
  const tRisq = U.tex(512, 256, (g, w, h) => { g.clearRect(0, 0, w, h); tracinhos(g, 10, 10, 490, 230, 900, 'rgba(230,230,220,.75)', 10); });
  const risq = plano(2.6, 1.3, new THREE.MeshStandardMaterial({ map: tRisq, transparent: true, depthWrite: false, roughness: 1 }), 10.8, 1.35, -37.88, 0);
  U.ler(risq, 'Olhar a parede cheia de risquinhos', [
    { quem: 'lia', texto: 'Risquinhos de giz, de dez em dez. Não de cinco. De dez.' },
    { quem: 'lia', texto: 'Ela conta de dez em dez. São dias. Quinze anos de dias.' }
  ], { mem: 'risquinhos' });
  // teatrinho de fantoches que reencena a noite quando você vira as costas
  const teatro = new THREE.Group(); teatro.position.set(7.2, 0, -37.55); W.grupo.add(teatro);
  const mT = new THREE.MeshStandardMaterial({ color: 0x6a2a1a, roughness: .7 });
  box(1.6, .9, .3, mT, 0, .45, 0, teatro); for (const s of [-1, 1]) box(.12, 1.0, .3, mT, s * .74, 1.4, 0, teatro); box(1.6, .2, .3, mT, 0, 1.95, 0, teatro);
  const cortina = box(.3, .9, .02, new THREE.MeshStandardMaterial({ color: 0x8a1a24, roughness: .9 }), .55, 1.4, .1, teatro, false);
  A.addCollider(6.4, 8.0, -37.75, -37.35);
  const fant = (cor, alto) => { const g = new THREE.Group(); teatro.add(g); const m = new THREE.MeshStandardMaterial({ color: cor, roughness: .9 }); cyl(.04, .06, alto ? .32 : .18, m, 0, alto ? .16 : .09, 0, 8, g); const c = new THREE.Mesh(new THREE.SphereGeometry(alto ? .05 : .045, 8, 6), new THREE.MeshStandardMaterial({ color: 0xc8b090 })); c.position.y = alto ? .37 : .22; g.add(c); if (alto) box(.11, .02, .01, MAT.preto, 0, .37, .05, g, false); return g; };
  const fAlto = fant(0x111111, true), fFreira = fant(0x1a1a2a, false), fC = [fant(0x205aa0), fant(0xa02060), fant(0x208040)];
  const quadros = [
    () => { fC.forEach((f, i) => { f.position.set(-.4 + i * .16, .9, .05); f.rotation.set(0, 0, 0); }); fFreira.position.set(.3, .9, .05); fFreira.rotation.set(0, 0, 0); fAlto.position.set(.55, .9, 0); fAlto.rotation.set(0, Math.PI, 0); },
    () => { fC.forEach((f, i) => { f.position.set(-.6 + i * .1, .9, .05); f.rotation.set(0, -1.2, 0); }); fFreira.position.set(.1, .92, .05); fFreira.rotation.set(0, 0, Math.PI / 2); fAlto.position.set(.4, .9, 0); fAlto.rotation.set(0, -1, 0); },
    () => { fC.forEach((f, i) => { f.position.set(-.55 + i * .1, .9, .05); f.rotation.set(0, 0, 0); }); fFreira.position.set(.1, .92, .05); fFreira.rotation.set(0, 0, Math.PI / 2); fAlto.position.set(0, .9, .08); fAlto.rotation.set(0, 0, 0); }
  ];
  let tq = 0, tqFora = 0, tqViu = false; quadros[0]();
  W.tick.push(dt => {
    if (U.sala() !== 'brinq' || tq >= 2) { if (tq >= 2 && U.sala() === 'brinq') { const yaw = Math.atan2(A.P.pos.x - teatro.position.x, A.P.pos.z - teatro.position.z); fAlto.rotation.y += (yaw - fAlto.rotation.y) * .05; } return; }
    if (U.olhando(7.2, 1.2, -37.55, .7, 12)) { tqViu = true; tqFora = 0; }
    else if (tqViu) { tqFora += dt; if (tqFora > 1.2) { tqFora = 0; tqViu = false; tq++; quadros[tq](); cortina.position.x = tq === 1 ? .6 : .62; SFX.arrastar(); if (tq === 2) { U.medo(16); U.depois(.3, () => SFX.risada(7.2, -37)); } } }
  });
  U.ler(teatro, 'Olhar o teatrinho de fantoches', () => [[
    { quem: 'lia', texto: 'Um teatrinho. Três crianças de pano, uma freira, e um fantoche alto de olhos costurados, de costas.' }], [{ quem: 'lia', texto: 'Mudaram de lugar. As crianças correndo pra esquerda. A freira caída.' }], [{ quem: 'lia', texto: 'As crianças pararam. E o alto... tá virado pra mim. Ele segue eu.' }]][tq], { mem: 'teatro', semLido: true });
  // casinha de bonecas = maquete do andar, com o Inspetor e a Ana em tempo real
  const casa = new THREE.Group(); casa.position.set(11.2, 0, -24.45); W.grupo.add(casa);
  A.prop(1.45, .55, .62, MAT.madeiraEsc, 11.2, .275, -24.45);
  const es = .02, mPiso = new THREE.MeshStandardMaterial({ color: 0xb8a078, roughness: .9 });
  const mapa = (wx, wz) => [(-26 - wz) * es, (wx - 1) * es]; // eixo longo do andar vira o comprimento da casinha
  for (const r of W.salas) { const [a0, b0] = mapa(r.x0, r.z0), [a1, b1] = mapa(r.x1, r.z1); box(Math.abs(a1 - a0) * .92, .02, Math.abs(b1 - b0) * .92, mPiso, (a0 + a1) / 2, .56, (b0 + b1) / 2, casa, false); }
  const dM = cyl(.01, .01, .09, new THREE.MeshBasicMaterial({ color: 0x050505 }), 0, .62, 0, 6, casa);
  const dAna = cyl(.009, .009, .05, new THREE.MeshBasicMaterial({ color: 0xd890a8 }), 0, .6, 0, 6, casa);
  const dLia = cyl(.008, .008, .045, new THREE.MeshBasicMaterial({ color: 0xe8d8b0 }), 0, .6, 0, 6, casa);
  W.tick.push(() => {
    dM.visible = M.ativo; if (M.ativo) { const [a, b] = mapa(M.pos.x, M.pos.z); dM.position.set(a, .62, b); }
    dAna.visible = !!ANA.ativa; if (ANA.ativa) { const [a, b] = mapa(ANA.pos.x, ANA.pos.z); dAna.position.set(a, .6, b); }
    const [a, b] = mapa(A.P.pos.x, A.P.pos.z); dLia.position.set(a, .6, b);
  });
  U.ler(casa, 'Olhar a casinha de bonecas', () => [
    { quem: 'lia', texto: 'Uma casinha de bonecas. É este andar. O corredor, os dormitórios, a rouparia...' },
    { quem: 'lia', texto: M.ativo || ANA.ativa ? 'Os bonecos se mexem sozinhos. O alto e preto... a menina... Eles tão onde eles tão. Agora.' : 'Uma bonequinha clara, de lanterna, no lugar onde eu tô. E espaço pra mais dois.' }
  ], { mem: 'casinha', semLido: true });

  // ---- DORMITÓRIO E: a cabana de lençol da Ana
  const cab = new THREE.Group(); cab.position.set(10.7, 0, -41.3); W.grupo.add(cab);
  const mLen = new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: 1, side: THREE.DoubleSide });
  for (const s of [-1, 1]) { const p = plano(1.3, 1.0, mLen, s * .28, .45, 0, 0, cab); p.rotation.order = 'ZYX'; p.rotation.y = Math.PI / 2; p.rotation.z = s * .55; }
  box(.04, 1.0, .04, MAT.madeiraEsc, 0, .5, -.6, cab, false); box(.04, 1.0, .04, MAT.madeiraEsc, 0, .5, .6, cab, false);
  A.addCollider(10.15, 11.25, -41.95, -40.65);
  const luzCab = new THREE.PointLight(0xffd890, .7, 2.6, 2); luzCab.position.set(10.7, .25, -41.3); W.grupo.add(luzCab);
  U.ler(cab, 'Espiar dentro da cabana de lençol', () => S.done.ana ? [
    { quem: 'lia', texto: 'A lanterninha apagou. A lista tá lá dentro, no chão. O meu nome agora tá riscado.' },
    { quem: 'lia', texto: 'Ela me achou. Pra ela, isso é o fim da brincadeira. Pra mim não.' }
  ] : [
    { quem: 'lia', texto: 'Uma cabana de lençol entre as camas. Uma lanterninha de pilha acesa lá dentro.' },
    { quem: 'lia', texto: '“QUEM EU JÁ ACHEI.” Nomes riscados, um embaixo do outro. Desde 1931.' },
    { quem: 'lia', texto: 'O último ainda sem risco é o meu.' }
  ], { mem: 'cabana', semLido: true });

  // ---- QUARTO DA IRMÃ CELESTE
  const carta = new THREE.Group(); carta.position.set(-4.55, .805, -52.78); carta.rotation.y = .3; W.grupo.add(carta);
  plano(.2, .12, new THREE.MeshStandardMaterial({ map: papelTex(U, 128, 80, ['Família Moraes', { t: 'DEVOLVIDO —', cor: '#8a1008', fonte: 'bold 12px Georgia' }, { t: 'RECUSADO PELO', cor: '#8a1008', fonte: 'bold 12px Georgia' }, { t: 'DESTINATÁRIO', cor: '#8a1008', fonte: 'bold 12px Georgia' }], { fonte: '12px Georgia', y: 18, lh: 16, x: 8, fundo: '#e0d4b0' }) }), 0, .005, 0, 0, carta).rotation.x = -Math.PI / 2;
  U.ler(carta, 'Ler o envelope devolvido', [
    { quem: 'lia', texto: 'Um envelope pra minha mãe. Carimbado: “DEVOLVIDO — RECUSADO PELO DESTINATÁRIO”.' },
    { quem: 'celeste', texto: '“Senhora Moraes, venha buscar o Davi antes de março. Por favor. Aqui ele não está seguro.”' },
    { quem: 'lia', texto: '...' },
    { quem: 'lia', texto: 'Ela sabia. A mãe sabia.' }
  ], { mem: 'cartaCeleste' });
  const malaC = new THREE.Group(); malaC.position.set(-11.0, 0, -52.25); malaC.rotation.y = .15; W.grupo.add(malaC);
  box(.55, .2, .35, new THREE.MeshStandardMaterial({ color: 0x4a2a14, roughness: .6 }), 0, .1, 0, malaC);
  U.ler(malaC, 'Puxar a mala de couro de baixo da cama', [
    { quem: 'lia', texto: 'Uma mala pronta. Três passagens de ônibus: 15 de março de 1979, seis da manhã.' },
    { quem: 'lia', texto: 'E três crachás com nome. Davi. Ana. Tomé.' },
    { quem: 'lia', texto: 'Ela ia levar eles embora. Na manhã seguinte.' }
  ], { mem: 'malaCeleste', som: false, aoLer: () => SFX.arrastar() });
  // a Irmã Celeste ajoelhada, rezando (some na lanterna)
  const freira = new THREE.Group(); freira.position.set(-10.3, 0, -53.7); freira.rotation.y = -Math.PI / 2; freira.visible = false; W.grupo.add(freira);
  const mHab = new THREE.MeshStandardMaterial({ color: 0x0e0e14, roughness: 1 });
  cyl(.2, .34, .7, mHab, 0, .35, 0, 10, freira); cyl(.12, .2, .45, mHab, 0, .9, -.05, 10, freira);
  const vel = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), mHab); vel.position.set(0, 1.2, -.05); vel.scale.set(1, 1.15, 1); freira.add(vel);
  box(.24, .05, .02, new THREE.MeshStandardMaterial({ color: 0xe8e8e0 }), 0, 1.12, .07, freira, false);
  let freiraT = -1, contas = 0;
  W.tick.push(dt => {
    if (freiraT < 0) return;
    freiraT += dt; contas -= dt;
    if (contas <= 0) { contas = 1.3; SFX.tique(); }
    const lit = S.flashOn && U.olhando(-10.3, .9, -53.7, .94, 7);
    if (lit || U.dist(-10.3, -53.7) < 1.5 || freiraT > 40) { freiraT = -1; freira.visible = false; SFX.vidro(-10.3, -53.7); U.medo(18); U.depois(.7, () => A.sub('lia', 'Tinha uma freira ajoelhada ali. E o terço dela... caiu no chão.')); }
  });
  let rezaT = 0;
  W.tick.push(dt => {
    if (S.flags.rezaCeleste || U.sala() !== 'celeste') { rezaT = 0; return; }
    if (U.parada() > 1 && !S.flashOn) { rezaT += dt; if (rezaT > 4) { S.flags.rezaCeleste = true; A.sub('celeste', '(do escuro, bem baixinho) ...e protege a Ana do escuro. E o Davi do sino. E o Tomé de tudo. Amém.'); U.depois(5, () => A.sub('lia', 'Ela ainda reza por eles.')); } }
    else rezaT = 0;
  });

  // ---- DEPÓSITO: o ninho do Davi e o monta-cargas
  const ninho = new THREE.Group(); ninho.position.set(7.6, 0, -57.2); W.grupo.add(ninho);
  const cob = plano(1.3, .9, new THREE.MeshStandardMaterial({ color: 0x5a3a3a, roughness: 1, side: THREE.DoubleSide }), 0, .02, 0, 0, ninho); cob.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 14; i++) { const e = plano(.16, .1, new THREE.MeshStandardMaterial({ color: 0xd8c898, roughness: 1 }), -.4 + (i % 7) * .13, .03 + Math.floor(i / 7) * .005, -.15 + Math.floor(i / 7) * .3, 0, ninho); e.rotation.x = -Math.PI / 2; e.rotation.z = Math.random(); }
  box(.14, .05, .09, MAT.preto, .45, .045, .2, ninho, false);
  U.ler(ninho, 'Mexer no cobertor velho no canto', [
    { quem: 'lia', texto: 'Um ninho. Um cobertor, um gravadorzinho de criança e dezenas de envelopes amarelados.' },
    { quem: 'lia', texto: 'Todos endereçados a “LIA MORAES”. Um selo por ano. 1979, 1980, 1981... 1993. Todos devolvidos.' },
    { quem: 'lia', texto: 'O de 1994 não tá aqui. Esse chegou.' },
    { quem: 'lia', texto: 'Ele tentou todo ano.' }
  ], { mem: 'ninho' });
  const tArr = U.tex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(210,200,180,.75)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { const x = 20 + Math.random() * 216, y = 60 + Math.random() * 180; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - .5) * 8, y + 18 + Math.random() * 20); g.stroke(); } g.font = 'bold 34px Georgia'; g.textAlign = 'center'; g.strokeText('MOACIR', 128, 46); });
  const arranhoes = plano(1.3, 1.3, new THREE.MeshStandardMaterial({ map: tArr, transparent: true, depthWrite: false, roughness: 1 }), 11.6, 1.3, -56.94, 0);
  U.ler(arranhoes, 'Olhar os arranhões dentro do monta-cargas', [
    { quem: 'lia', texto: 'Marcas de unha por dentro da caixa. E um nome, riscado a prego: MOACIR.' },
    { quem: 'lia', texto: 'Desciam ele por aqui também. De castigo. Pro escuro.' }
  ], { mem: 'arranhoes' });
  A.gatilho('pocoPlano', 8.5, 13, -58, -53.5, () => {
    if (!S.inv.chaves.porao || S.flags.pocoPlano) return; S.flags.pocoPlano = true;
    const ls = ['(do poço, crianças cochichando) ...a Irmã Celeste vai abrir a escotilha...', '(do poço) ...a gente desce pela água...', '(do poço) ...e ninguém responde. Ninguém. Nem se chamar pelo nome.'];
    ls.forEach((t, i) => U.depois(.5 + i * 3, () => { A.sub('voz', t); SFX.sussurros(1.2); }));
  });

  // ---- TINTA DE RELÓGIO (só no escuro)
  tinta(texTinta(U, ['OLHA PRA ELA', 'COM LUZ'], { tam: 40 }), 1.4, .7, -2.88, 1.3, -33, Math.PI / 2);
  tinta(texTinta(U, ['NÃO RESPONDE.', 'NEM SE FOR', 'O SEU NOME.'], { tam: 32 }), 1.4, .9, 2.88, 1.3, -41.5, -Math.PI / 2);
  tinta(texTinta(U, [''], { tam: 10, maos: 18 }), 2.6, 1.3, -12.88, 1.1, -42, Math.PI / 2);
  tinta(texTinta(U, ['A ANA É BOA.', 'ELA SÓ QUER', 'QUE OLHEM PRA ELA'], { tam: 30 }), 1.6, .9, 12.88, 1.4, -44, -Math.PI / 2);
  tinta(texTinta(U, ['O POÇO DESCE', 'ATÉ A ÁGUA'], { tam: 36 }), 1.4, .7, 3.12, 1.3, -52, Math.PI / 2);

  // ---- INSCRIÇÕES DOS ARMÁRIOS (andar de cima): o armário do castigo da rouparia
  inscricoesArmarios(A, S, U, [
    { x: 10.5, z: -11.55, frase: 'MOACIR, 9 ANOS, 1947', aoFicar: () => { A.sub('tome', '(bem baixinho, de dentro da parede) ...tem mais alguém no armário com a gente.'); U.medo(20); } }
  ]);

  // ---- GANCHOS
  H.entrouSala = r => {
    if (r.id === 'celeste' && !S.flags.freiraVista) { S.flags.freiraVista = true; freira.visible = true; freiraT = 0; }
  };
  const syncSup = () => {
    if (S.done.ana) {
      if (!ultLia) { ultLia = true; mUlt.map = texCena(5, true); mUlt.needsUpdate = true; }
      if (!mPlacar.userData.lia) { mPlacar.userData.lia = true; mPlacar.map = placar(true); mPlacar.needsUpdate = true; }
      luzCab.intensity = 0;
    }
    if (S.flags.uniSumiu) { unis[0].visible = false; pegR.visible = true; }
  };
  H.anaFim = () => syncSup();
  H.sync = syncSup;
  return H;
}
