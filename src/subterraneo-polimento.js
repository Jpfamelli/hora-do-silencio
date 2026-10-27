// POLIMENTO DO SUBTERRÂNEO — Lote 3: túneis (Cap. IV), cemitério e capela (Cap. V)
// Toque e controle (vibração, textos com o nome do botão), acessibilidade (sem estroboscópio, legendas de som),
// desempenho em máquina fraca, sensação (poeira, terra, respingos, trancos) e dois lugares novos:
// o duto dos ratos (túneis) e a mureta de pedras soltas (cemitério).
// Ganchos: tuneis()/cemiterio() em mapas.js criam FX = efeitos(A) e devolvem SUBP.tuneis(...)/SUBP.cemiterio(...).
import { juntar } from './internato.js';

// ---------------------------------------------------------------------
// preferências do jogador (lidas das opções da interface e da plataforma)
// ---------------------------------------------------------------------
const ler = k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
let cacheT = -1e9, cache = null;
export function prefs() {
  const agora = performance.now();
  if (cache && agora - cacheT < 1000) return cache;
  cacheT = agora;
  const o = ler('hora-silencio-opt'), p = (window.__plat && window.__plat.O) || ler('hora-silencio-plat'), b = document.body ? document.body.classList : { contains: () => false };
  cache = {
    toque: b.contains('toque'),
    semFlash: b.contains('sem-flash') || !!+o.vFlash,
    agachar: o.agachar === 'segurar' ? 'segurar' : 'alternar',
    baixa: p.qual === 'baixa',
    vib: p.vibrar !== false && p.vibMundo !== false
  };
  return cache;
}
export const baixa = () => prefs().baixa;
// troca as teclas pelos botões de toque quando o jogo está no celular
export function tecla(t) {
  if (!prefs().toque) return t;
  return t.replace(/\(C\)/g, '(botão Agachar)').replace(/\(G\)/g, '(botão Garrafa)').replace(/\bG para jogar/g, 'Toque em Garrafa para jogar')
    .replace(/\(ESPAÇO\)/g, '(botão Prender fôlego)').replace(/\(E\)/g, '(botão Usar)').replace(/\(F\)/g, '(botão Lanterna)').replace(/\bsegure E\b/g, 'segure Usar');
}
// a lanterna "falha": no normal pisca apagando; com Reduzir flashes, só escurece suave (sem estroboscópio)
export function falha(A, chance, dim = .25) {
  if (prefs().semFlash) { A.flash.intensity *= Math.max(dim, 1 - chance * 1.6); return; }
  if (Math.random() < chance) A.flash.intensity = 0;
}

// ---------------------------------------------------------------------
// legendas de som próprias (aparecem na legenda de sons da interface)
// ---------------------------------------------------------------------
const LEG = {
  l3Canta: { t: 'o cano canta uma nota limpa', imp: 1, cd: 2, cat: 'h', pos: a => a[0] },
  l3Estouro: { t: 'um cano estoura, água jorrando', imp: 1, cd: 2, cat: 'p', pos: a => a[0] },
  l3Range: { t: 'a válvula range alto', imp: 0, cd: 3, cat: 'p', pos: a => a[0] },
  l3Borbulha: { t: 'respiração borbulhando debaixo d\'água', imp: 1, cd: 6, cat: 'p', pos: a => a[0] },
  l3Levanta: { t: 'algo grande se levanta da água', imp: 1, cd: 3, cat: 'p', pos: a => a[0] },
  l3Terra: { t: 'a terra cede', imp: 1, cd: 3, cat: 'p', pos: a => a[0] },
  l3Ralo: { t: 'a água desce pelos ralos, gorgolejando', imp: 0, cd: 5, cat: 'h' },
  l3Pinga: { t: 'água pingando', imp: 0, cd: 9, pos: a => a[0] },
  l3Ratos: { t: 'ratos guinchando e correndo', imp: 1, cd: 3, cat: 'p', pos: a => a[0] },
  l3RatosLeve: { t: 'unhas pequenas arranhando no escuro', imp: 0, cd: 8, pos: a => a[0] },
  l3Pedras: { t: 'pedras desabando com estrondo', imp: 1, cd: 3, cat: 'p', pos: a => a[0] },
  l3Grilos: { t: 'os grilos se calam de repente', imp: 1, cd: 12, cat: 'p' },
  l3GrilosVoltam: { t: 'os grilos voltam a cantar', imp: 0, cd: 12 },
  l3Arranha: { t: 'alguém grande raspa a boca do duto', imp: 1, cd: 4, cat: 'p', pos: a => a[0] }
};
function legendas(A) { try { const d = A.legendas; if (d) for (const [k, v] of Object.entries(LEG)) if (!d[k]) d[k] = v; } catch (e) {} }
const legenda = (A, k, pos) => { try { A.SFX[k](pos ? { x: pos.x, y: pos.y ?? 1, z: pos.z } : null); } catch (e) {} };

// ---------------------------------------------------------------------
// efeitos por carga de mapa: partículas (um desenho só), vibração, tranco, sons novos
// ---------------------------------------------------------------------
export function efeitos(A) {
  const { THREE } = A;
  legendas(A);
  const N = baixa() ? 90 : 180;
  const pos = new Float32Array(N * 3), cor = new Float32Array(N * 4);
  const parts = [];
  for (let i = 0; i < N; i++) { parts.push({ vivo: false, x: 0, y: -99, z: 0, vx: 0, vy: 0, vz: 0, t: 0, dur: 1, g: 0, ar: 0, r: 1, gg: 1, b: 1, a: 1 }); pos[i * 3 + 1] = -99; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(cor, 4));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: .055, vertexColors: true, transparent: true, depthWrite: false, sizeAttenuation: true }));
  pts.frustumCulled = false; pts.renderOrder = 4; A.W.grupo.add(pts);
  let k = 0, vivos = 0;
  const TIPOS = {
    poeira: { c: [.55, .5, .43], g: .9, ar: 1.4, v: .5, up: .1, dur: [1.4, 2.6] },
    terra: { c: [.3, .22, .14], g: 9, ar: .3, v: 1.3, up: 2.6, dur: [.6, 1.1] },
    agua: { c: [.72, .82, .78], g: 9, ar: .2, v: 1.6, up: 2.2, dur: [.5, .9] },
    fumaca: { c: [.5, .5, .5], g: -.35, ar: .8, v: .12, up: .25, dur: [1.6, 2.8] },
    ouro: { c: [1, .78, .42], g: -.25, ar: .5, v: .5, up: .4, dur: [1.2, 2.2] },
    pedra: { c: [.42, .4, .36], g: 9.5, ar: .1, v: 2.2, up: 1.8, dur: [.8, 1.3] }
  };
  const FX = {
    prefs,
    emitir(tipo, x, y, z, n = 10, espalha = .2) {
      const T = TIPOS[tipo] || TIPOS.poeira;
      if (baixa()) n = Math.ceil(n / 2);
      if (Math.hypot(x - A.P.pos.x, z - A.P.pos.z) > 40) return;
      for (let i = 0; i < n; i++) {
        const p = parts[k]; k = (k + 1) % N; if (!p.vivo) vivos++;
        const a = Math.random() * 6.283, v = T.v * (.3 + Math.random() * .7);
        Object.assign(p, { vivo: true, x: x + (Math.random() - .5) * 2 * espalha, y: y + (Math.random() - .5) * espalha * .5, z: z + (Math.random() - .5) * 2 * espalha,
          vx: Math.cos(a) * v, vy: T.up * (.4 + Math.random() * .6), vz: Math.sin(a) * v, t: 0, dur: T.dur[0] + Math.random() * (T.dur[1] - T.dur[0]), g: T.g, ar: T.ar,
          r: T.c[0] * (.85 + Math.random() * .3), gg: T.c[1] * (.85 + Math.random() * .3), b: T.c[2] * (.85 + Math.random() * .3) });
      }
    },
    // vibração do celular (toque) e do controle; respeita a opção "Vibração" e "vibração do mundo"
    vib(ms = 120, forte = .5) {
      const P = prefs(); if (!P.vib || window.__teste) return;
      try { if (P.toque && navigator.vibrate) navigator.vibrate(Math.round(ms)); } catch (e) {}
      try { for (const g of (navigator.getGamepads ? navigator.getGamepads() : [])) if (g && g.vibrationActuator && g.vibrationActuator.playEffect) g.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: Math.min(1, forte), weakMagnitude: Math.min(1, forte * .7) }).catch(() => {}); } catch (e) {}
    },
    tranco(f = .06) { A.P.shake = Math.max(A.P.shake || 0, f); },
    som: sonsP(A)
  };
  A.W.tick.push(dt => {
    if (!vivos) return;
    vivos = 0;
    for (let i = 0; i < N; i++) {
      const p = parts[i]; if (!p.vivo) continue;
      p.t += dt; if (p.t >= p.dur || p.y < -1) { p.vivo = false; pos[i * 3 + 1] = -99; cor[i * 4 + 3] = 0; continue; }
      vivos++;
      const dr = Math.max(0, 1 - p.ar * dt); p.vx *= dr; p.vz *= dr; p.vy -= p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; if (p.y < .01 && p.g > 0) { p.y = .01; p.vx *= .5; p.vz *= .5; p.vy = 0; }
      pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
      const kk = p.t / p.dur, al = Math.min(1, kk * 8) * (1 - kk);
      cor[i * 4] = p.r; cor[i * 4 + 1] = p.gg; cor[i * 4 + 2] = p.b; cor[i * 4 + 3] = al * .9;
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true;
  });
  return FX;
}

// sons novos (mesmo AudioContext do motor)
function sonsP(A) {
  const au = A.audio, ok = () => au && au.AC && au.AC.state !== 'closed' && !window.__teste;
  const p3 = (p, y = .4) => p ? { x: p.x, y: p.y ?? y, z: p.z } : null;
  return {
    gorgolejo(pos, dur = 3, vol = .3) { // ralo engolindo a água
      if (!ok()) return; const t0 = au.AC.currentTime;
      const g = au.saida(p3(pos, .2), .7); const f = au.burst(t0, dur, 'lowpass', 520, 2, g); f.frequency.linearRampToValueAtTime(260, t0 + dur); au.env(g, t0, .3, vol, dur * .8);
      for (let i = 0; i < 9; i++) { const t = t0 + Math.random() * dur * .85, g2 = au.saida(p3(pos, .2), .5); const o = au.osc('sine', 180 + Math.random() * 260, t, .12, g2); o.frequency.exponentialRampToValueAtTime(420 + Math.random() * 300, t + .1); au.env(g2, t, .005, vol * .7, .1); }
    },
    plic(pos, agua = true) { // uma gota caindo do teto
      if (!ok()) return; const t = au.AC.currentTime, g = au.saida(p3(pos, .3), .9);
      const o = au.osc('sine', agua ? 1100 : 2400, t, .14, g); o.frequency.exponentialRampToValueAtTime(agua ? 2100 : 1600, t + .07); au.env(g, t, .002, agua ? .09 : .05, .12);
    },
    guinchos(pos, n = 7, vol = .35) { // ratos espantados
      if (!ok()) return; const t0 = au.AC.currentTime;
      for (let i = 0; i < n; i++) { const t = t0 + i * (.05 + Math.random() * .18), g = au.saida(p3(pos, .2), .4); const f0 = 2600 + Math.random() * 1800; const o = au.osc(Math.random() < .5 ? 'sawtooth' : 'square', f0, t, .2, g); o.frequency.linearRampToValueAtTime(f0 * (1.15 + Math.random() * .3), t + .06); o.frequency.linearRampToValueAtTime(f0 * .8, t + .18); au.env(g, t, .006, vol * .22, .17); }
      for (let i = 0; i < 6; i++) { const t = t0 + i * .11, g = au.saida(p3(pos, .1), .3); au.burst(t, .07, 'highpass', 3800, .8, g); au.env(g, t, .003, vol * .5, .06); }
    },
    chiadinho(pos, vol = .08) { // um rato só, quieto
      if (!ok()) return; const t = au.AC.currentTime, g = au.saida(p3(pos, .1), .4); const o = au.osc('sine', 3400 + Math.random() * 900, t, .09, g); o.frequency.linearRampToValueAtTime(4200, t + .05); au.env(g, t, .004, vol, .08);
      const g2 = au.saida(p3(pos, .1), .3); au.burst(t + .1, .18, 'highpass', 4200, .6, g2); au.env(g2, t + .1, .01, vol * .7, .16);
    },
    desabar(pos, vol = .9) { // pedras caindo umas sobre as outras
      if (!ok()) return; const t0 = au.AC.currentTime;
      const g = au.saida(p3(pos, .5), .8); au.burst(t0, 1.6, 'lowpass', 340, .8, g, 0); au.env(g, t0, .01, vol, 1.5);
      for (let i = 0; i < 12; i++) { const t = t0 + .05 + Math.random() * 1.1, g2 = au.saida(p3(pos, .3), .6); au.burst(t, .09, 'bandpass', 500 + Math.random() * 900, 2, g2, 0); au.env(g2, t, .002, vol * .45, .09); const g3 = au.saida(p3(pos, .3), .4); au.osc('sine', 60 + Math.random() * 40, t, .15, g3); au.env(g3, t, .002, vol * .5, .14); }
    },
    pedrinha(pos) { if (!ok()) return; const t = au.AC.currentTime, g = au.saida(p3(pos, .6), .5); au.burst(t, .06, 'bandpass', 900 + Math.random() * 700, 3, g, 0); au.env(g, t, .002, .18, .06); },
    grilo(pos, vol = .05) { // três trinados curtos
      if (!ok()) return; const t0 = au.AC.currentTime, f = 4300 + Math.random() * 500;
      for (let i = 0; i < 3; i++) { const t = t0 + i * .07, g = au.saida(p3(pos, .2), .5); au.osc('sine', f, t, .05, g); au.env(g, t, .004, vol, .04); }
    },
    rangeFerro(pos, dur = 1.6, vol = .25) { // porta pesada abrindo devagar
      if (!ok()) return; const t = au.AC.currentTime, g = au.saida(p3(pos, 1), .5);
      const f = au.burst(t, dur, 'bandpass', 700, 12, g); f.frequency.linearRampToValueAtTime(380, t + dur); au.env(g, t, .15, vol, dur * .85);
    }
  };
}

// utilidades
const _v = { x: 0, y: 0, z: 0 };
function olhando(A, x, y, z, cos = .85, alc = 6) {
  const c = A.camera.position, dx = x - c.x, dy = y - c.y, dz = z - c.z, d = Math.hypot(dx, dy, dz);
  if (d > alc || d < .01) return false;
  const f = A.camera.getWorldDirection(A._l3v || (A._l3v = new A.THREE.Vector3()));
  return (f.x * dx + f.y * dy + f.z * dz) / d > cos;
}
const segurando = it => { const J = window.__jogo, h = document.getElementById('hold'); return !!(J && J.alvo === it && h && !h.hidden); };
const noMapa = (A, id) => A.W.mapa === id && !A.S.dead;
function cssUmaVez() {
  if (document.getElementById('css-l3sub')) return;
  const st = document.createElement('style'); st.id = 'css-l3sub';
  st.textContent = '#tq-agachar.l3-dica{box-shadow:0 0 0 2px #cfe3d4,0 0 16px rgba(207,227,212,.8);animation:l3pulso 1s ease-in-out infinite}' +
    '@keyframes l3pulso{50%{box-shadow:0 0 0 2px #cfe3d4,0 0 4px rgba(207,227,212,.2)}}' +
    '#fx-folego.l3-pouco b{background:#d8705e!important;animation:l3ar .5s steps(2) infinite}#fx-folego.l3-pouco{color:#f0b8a8!important}' +
    '@keyframes l3ar{50%{opacity:.35}}body.sem-flash #fx-folego.l3-pouco b{animation:none}' +
    'body.toque #fx-folego{top:38%!important;font-size:19px!important;width:260px!important;margin-left:-130px!important}body.toque #fx-folego i{width:240px!important}' +
    '#fx-gotas{background:radial-gradient(circle at 18% 30%,rgba(210,230,220,.22) 0 9px,transparent 12px),radial-gradient(circle at 72% 22%,rgba(210,230,220,.18) 0 6px,transparent 9px),radial-gradient(circle at 60% 70%,rgba(210,230,220,.2) 0 11px,transparent 15px),radial-gradient(circle at 34% 80%,rgba(210,230,220,.16) 0 5px,transparent 8px),radial-gradient(circle at 88% 58%,rgba(210,230,220,.2) 0 8px,transparent 11px),radial-gradient(ellipse at center,rgba(40,70,60,.25),transparent 70%)}' +
    '#l3-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}';
  document.head.appendChild(st);
}
// aviso para leitor de tela (avisos importantes do lugar, sem poluir a tela)
function anunciar(t) {
  let el = document.getElementById('l3-sr');
  if (!el) { el = document.createElement('div'); el.id = 'l3-sr'; el.setAttribute('aria-live', 'polite'); el.setAttribute('role', 'status'); document.body.appendChild(el); }
  el.textContent = ''; setTimeout(() => { el.textContent = t; }, 30);
}
function dicaToque(on) { const b = document.getElementById('tq-agachar'); if (b) b.classList.toggle('l3-dica', !!on && prefs().toque); }

// =====================================================================
// TÚNEIS
// =====================================================================
// salas e passagens novas (entram na lista de tuneis() antes de construir): o duto baixo entre a câmara oeste e o depósito
export const DUTO = { x: -27, z0: -30, z1: -24, larg: 1.4, alto: 1.02 }; // x livre do acampamento (câmara oeste) e entre as camas do depósito
export const salasTuneis = () => [{ id: 'duto', nome: 'Duto de ventilação', x0: DUTO.x - 1, x1: DUTO.x + 1, z0: DUTO.z0, z1: DUTO.z1, piso: 'concreto', parede: 'tijolo', h: 1.2, semLuz: true }];
export const portasTuneis = () => [
  { id: 'dutoV', a: 'v1', b: 'duto', x: DUTO.x, z: DUTO.z1, eixo: 'x', tipo: 'aberta', largura: DUTO.larg, alto: DUTO.alto },
  { id: 'dutoD', a: 'duto', b: 'dep', x: DUTO.x, z: DUTO.z0, eixo: 'x', tipo: 'aberta', largura: DUTO.larg, alto: DUTO.alto }
];
// a soleira alta da boca do duto (câmara oeste): ali agachar não afunda na água
export const naSoleira = p => Math.abs(p.x - DUTO.x) < DUTO.larg / 2 + .5 && p.z < DUTO.z1 + 1.4 && p.z > DUTO.z1 - .5;
// o duto não entra no mapa de caminhos: ele não cabe lá dentro, a Procissão e a Menina não passam por ele
export function soltarDuto(A) { const L = A.W.links; for (let i = L.length - 1; i >= 0; i--) if (L[i].a === 'duto' || L[i].b === 'duto') L.splice(i, 1); }

export function tuneis(A, S, def, ctx) {
  const { THREE, MAT, box, cyl } = A, FX = ctx.FX, P0 = prefs();
  cssUmaVez();
  const X = {};
  const ticks = []; A.W.tick.push(dt => { for (const f of ticks) try { f(dt); } catch (e) { console.warn('subterrâneo (lote 3)', e); } });

  // ---------- desempenho: brinquedos do fundo e partes paradas não recalculam matriz todo quadro
  if (ctx.brinq) { ctx.brinq.updateMatrixWorld(true); ctx.brinq.traverse(o => { o.matrixAutoUpdate = false; }); }
  // máquina fraca: as lâmpadas de emergência da porta de ferro e da escotilha viram só brilho (menos luzes na cena)
  if (P0.baixa && ctx.emerg) for (const i of [3, 4]) { const L = ctx.emerg[i]; if (L && L.luz.parent) { L.luz.parent.remove(L.luz); L.semLuz = true; } }
  // ondas e bolhas muito longe da Lia não são criadas (ninguém vê, o notebook agradece)
  if (ctx.O && !ctx.O._l3) { const c = ctx.O.criar.bind(ctx.O); ctx.O.criar = (x, y, z, ...r) => { if (Math.hypot(x - A.P.pos.x, z - A.P.pos.z) > (baixa() ? 22 : 32)) return; c(x, y, z, ...r); }; ctx.O._l3 = true; }
  if (ctx.B && !ctx.B._l3) { const e = ctx.B.emitir.bind(ctx.B); ctx.B.emitir = (x, y, z, ...r) => { if (Math.hypot(x - A.P.pos.x, z - A.P.pos.z) > (baixa() ? 18 : 28)) return; e(x, y, z, ...r); }; ctx.B._l3 = true; }

  // ---------- legendas para os sons da água (antes só se ouvia)
  const som = ctx.som;
  if (som && !som._l3) {
    som._l3 = true;
    const emb = (nome, chave, pIdx = 0) => { const f = som[nome]; if (!f) return; som[nome] = function (...a) { legenda(A, chave, a[pIdx] || null); return f.apply(this, a); }; };
    emb('nota', 'l3Canta', 1); emb('dissonante', 'l3Estouro', 0); emb('respiraAgua', 'l3Borbulha', 0); emb('escorrer', 'l3Levanta', 0); emb('rangido', 'l3Range', 0);
  }

  // ---------- válvulas: a roda acelera, a placa acende, o encaixe dá tranco e a água escoa pelos ralos
  let nValv = S.valv.length, jatoVis = false, baixou = !!S.flags.aguaBaixa;
  const ralos = [[0, -18], [0, -36], [-30, -18], [30, -18], [0, -48], [15, -36]];
  ticks.push(dt => {
    const t = A.perf();
    for (const V of ctx.valvIts || []) {
      const kk = Math.min(1, (V.it.progresso || 0) / V.it.hold), seg = t - (V.it.seguradoT ?? -9) < .08;
      if (seg) { V.giro.rotation.z -= dt * 2.6 * kk; V.l3t = (V.l3t || 0) - dt; if (V.l3t <= 0) { V.l3t = .5; FX.vib(40 + kk * 60, .15 + kk * .35); if (kk > .5) FX.emitir('agua', V.pos.x, 1.15, V.pos.z, 2, .1); } }
      if (V.placa) { const alvo = S.flags.aguaBaixa || S.valv.includes(V.n) ? 1.4 : .6 + kk * 1.6 + (olhando(A, V.pos.x, 1.9, V.pos.z, .9, 5) && S.flashOn ? .5 : 0); V.placa.material.emissiveIntensity += (alvo - V.placa.material.emissiveIntensity) * Math.min(1, dt * 6); }
    }
    if (S.valv.length > nValv) {
      nValv = S.valv.length; const v = (ctx.valvIts || []).find(V => V.n === S.valv[nValv - 1]);
      FX.tranco(.07); FX.vib(nValv >= 3 ? 420 : 160, nValv >= 3 ? .8 : .45);
      if (v) FX.emitir('agua', v.pos.x, 1.3, v.pos.z, 10, .15);
      const nv = ctx.nivel ? ctx.nivel() : .3;
      for (const [x, z] of ralos) { ctx.O && ctx.O.criar(x, nv, z, 2.6, .5, 2.4); ctx.B && ctx.B.emitir(x, nv, z, 6, .4); }
      FX.som.gorgolejo({ x: A.P.pos.x, y: .2, z: A.P.pos.z - 3 }, nValv >= 3 ? 5 : 2.6, nValv >= 3 ? .4 : .25); legenda(A, 'l3Ralo');
    }
    const jv = !!(ctx.jato && ctx.jato.visible);
    if (jv && !jatoVis) { FX.vib(380, .9); FX.tranco(.1); const j = ctx.jato.position; FX.emitir('agua', j.x, 1.2, j.z, 18, .2); }
    if (jv && Math.random() < dt * 6) { const j = ctx.jato.position; FX.emitir('agua', j.x, ctx.nivel ? ctx.nivel() + .05 : .4, j.z, 2, .15); }
    jatoVis = jv;
    if (S.flags.aguaBaixa && !baixou) { baixou = true; setTimeout(() => { if (noMapa(A, 'tuneis')) anunciar('A água baixou. A porta de ferro do túnel norte pode abrir.'); }, 2000); }
  });

  // ---------- água: barra de fôlego clara, câmera que afunda suave, gotas na tela ao subir
  const telaF = ctx.telaFolego, barra = ctx.barraFolego;
  const telaG = (() => { let d = document.getElementById('fx-gotas'); if (!d) { d = document.createElement('div'); d.id = 'fx-gotas'; d.className = 'fx'; d.style.cssText = 'opacity:0;pointer-events:none;transition:opacity 1.6s ease-out'; const ref = document.getElementById('fx-vignette'); if (ref && ref.parentNode) ref.parentNode.insertBefore(d, ref); else document.body.appendChild(d); } return d; })();
  let estavaSub = false, gotasT = 0;
  const textoSubir = () => { const P = prefs(); return P.toque ? 'Debaixo d\'água — toque em Agachar para subir' : P.agachar === 'segurar' ? 'Debaixo d\'água — solte C para subir' : 'Debaixo d\'água — aperte C de novo para subir'; };
  ticks.push(dt => {
    const sub = ctx.sub; if (!sub || !telaF) return;
    if (sub.on && !estavaSub) { const sp = telaF.firstChild; if (sp && sp.nodeType === 3) sp.textContent = textoSubir(); anunciar('Debaixo d\'água. O ar está acabando.'); FX.vib(60, .2); }
    if (!sub.on && estavaSub) { gotasT = 1.4; telaG.style.transition = 'none'; telaG.style.opacity = .9; void telaG.offsetWidth; telaG.style.transition = 'opacity 1.6s ease-out'; ctx.O && ctx.O.criar(A.P.pos.x, ctx.nivel(), A.P.pos.z, 1.8, .45, 1.4); FX.emitir('agua', A.P.pos.x, ctx.nivel() + .1, A.P.pos.z, 8, .2); }
    if (gotasT > 0) { gotasT -= dt; if (gotasT <= 0) telaG.style.opacity = 0; }
    if (!noMapa(A, 'tuneis') || A.mode !== 'jogo') telaG.style.opacity = 0;
    estavaSub = sub.on;
    X.subT = sub.on ? (X.subT || 0) + dt : 0;
    if (X.subT > 2.5 && !S.flags.l3dicaFolego) { S.flags.l3dicaFolego = true; A.toast(tecla('Parada e prendendo o fôlego (ESPAÇO), o ar dura mais.')); }
    telaF.classList.toggle('l3-pouco', !!sub.on && S.stamina < 30);
    if (sub.on && barra) barra.style.width = Math.max(0, Math.min(100, S.stamina)) + '%';
  });

  // ---------- gotas pingando do teto: anéis e um "plic" perto da Lia, de vez em quando
  let pingaT = 3 + Math.random() * 4;
  ticks.push(dt => {
    const P = A.P; if (!P.room || P.room.fora) return;
    pingaT -= dt; if (pingaT > 0) return; pingaT = 2.5 + Math.random() * 5;
    const a = Math.random() * 6.283, r = 2.5 + Math.random() * 5, R = P.room;
    const x = Math.max(R.x0 + .4, Math.min(R.x1 - .4, P.pos.x + Math.cos(a) * r)), z = Math.max(R.z0 + .4, Math.min(R.z1 - .4, P.pos.z + Math.sin(a) * r));
    const agua = !!(R.agua && !S.flags.aguaBaixa), y = agua && ctx.nivel ? ctx.nivel() : .02;
    FX.emitir('agua', x, R.h - .1, z, 1, .02); setTimeout(() => { if (!noMapa(A, 'tuneis')) return; if (agua && ctx.O) ctx.O.criar(x, y, z, .5, .3, 1.1); FX.som.plic({ x, y, z }, agua); legenda(A, 'l3Pinga', { x, z }); }, 380);
  });

  // ---------- trancos e vibração nos sustos (o tornozelo, ele emergindo, o apagão)
  let maoAnt = false, emergAnt = false, apagAnt = !!S.flags.apagao;
  ticks.push(() => {
    const m = !!(ctx.mao && ctx.mao.ativa);
    if (m && !maoAnt) { const g = ctx.mao.g.position; FX.emitir('agua', g.x, (ctx.nivel ? ctx.nivel() : .4) + .05, g.z, 10, .15); ctx.O && ctx.O.criar(g.x, ctx.nivel(), g.z, 1.6, .5, 1.3); FX.vib(90, .3); }
    maoAnt = m;
    const e = !!(ctx.emergir && ctx.emergir());
    if (e && !emergAnt) { const M = A.M.pos, nv = ctx.nivel ? ctx.nivel() : .4; for (let i = 0; i < 3; i++) setTimeout(() => { if (noMapa(A, 'tuneis') && ctx.O) ctx.O.criar(M.x, nv, M.z, 3 + i * 1.5, .55 - i * .12, 2.2 + i * .4); }, i * 260); FX.emitir('agua', M.x, nv + .4, M.z, 22, .5); FX.vib(500, 1); FX.tranco(.14); }
    emergAnt = e;
    const ap = !!S.flags.apagao; if (ap && !apagAnt) { FX.vib(260, .7); anunciar('As luzes apagaram. Ele está vindo pela única saída.'); } apagAnt = ap;
  });
  // agarrão no tornozelo: tranco e vibração forte
  let lentoAnt = 0;
  ticks.push(() => { const l = ctx.lento ? ctx.lento() : 0; if (l > lentoAnt + 1) { FX.vib(320, .9); FX.tranco(.12); } lentoAnt = l; });

  // ---------- reduzir flashes: no apagão as lâmpadas de emergência pulsam devagar em vez de piscar
  ticks.push(() => {
    if (!prefs().semFlash || !ctx.emerg) return;
    const t = A.perf();
    for (const L of ctx.emerg) if (L.on && L.rapido) { const v = .55 + .45 * Math.sin(t * 2.2 + L.fase); L.luz.intensity = L.base * v; L.bulbo.material.emissiveIntensity = .3 + 2.2 * v; }
  });
  // máquina fraca: a lâmpada sem luz dinâmica brilha mais forte no bulbo para continuar marcando o lugar
  if (P0.baixa) ticks.push(() => { for (const L of ctx.emerg || []) if (L.semLuz && L.on) L.bulbo.material.emissiveIntensity = Math.min(4, L.bulbo.material.emissiveIntensity * 1.4); });

  // ---------- cofre: o disco gira e a porta pesada abre devagar, rangendo
  let cofreAnt = !!S.flags.cofre;
  if (ctx.disco) for (const y of [-.03, .03]) box(.012, .012, .035, MAT.metal, .052, y, 0, ctx.disco, false); // marcas no disco para ver o giro
  ticks.push(dt => {
    const cp = ctx.cofrePorta; if (!cp) return;
    if (S.flags.cofre && !cofreAnt) { cofreAnt = true; X.cofreT = 0; FX.som.rangeFerro({ x: 7, y: .6, z: -60 }, 1.8, .3); FX.vib(200, .5); FX.emitir('poeira', 7, 1.1, -59.5, 14, .35); }
    if (X.cofreT != null) {
      X.cofreT += dt; const k = Math.min(1, X.cofreT / 1.8), e = k * k * (3 - 2 * k);
      cp.rotation.y = -1.7 * e; if (ctx.disco) ctx.disco.rotation.y = -X.cofreT * 9 * (1 - k);
      if (k >= 1) X.cofreT = null;
    }
  });

  // ---------- escotilha: enquanto sobe, a escada treme e cai poeira do teto
  ticks.push(dt => {
    const it = ctx.itEsc, e = ctx.esc2; if (!it || !e) return;
    if (segurando(it)) { e.position.x = 31.6 + (Math.random() - .5) * .02; X.escT = (X.escT || 0) - dt; if (X.escT <= 0) { X.escT = .35; FX.emitir('poeira', 31.4, 2.6, -36, 4, .3); FX.vib(50, .25); FX.som.pedrinha({ x: 31.4, y: 2.4, z: -36 }); } }
    else if (e.position.x !== 31.6) e.position.x = 31.6;
  });

  // ---------- o duto dos ratos (entre a válvula 1 e o depósito, só agachada)
  dutoRatos(A, S, X, ticks, FX);

  // ---------- botão Agachar do toque pisca quando ajuda (água funda com ele perto, boca do duto)
  ticks.push(() => {
    if (!prefs().toque) return;
    const P = A.P, dM = A.M.ativo ? A.M.pos.distanceTo(P.pos) : 99;
    const agua = P.naAgua && !S.flags.aguaBaixa && !P.crouch && dM < 9 && !S.hidden;
    dicaToque(agua || X.pertoDuto);
  });

  // ---------- regras de velocidade e barulho do duto (somadas às do mapa)
  const vel0 = def.velMul, rui0 = def.ruidoMul;
  def.velMul = () => (vel0 ? vel0() : 1) * (X.noDuto ? (A.P.sprinting ? .35 : .9) : 1);
  def.ruidoMul = () => (rui0 ? rui0() : 1) * (X.noDuto ? .8 : 1);
  X.entrar = () => { dicaToque(false); };
  return juntar(def, X);
}

function dutoRatos(A, S, X, ticks, FX) {
  const { THREE, MAT, box, cyl } = A, D = DUTO, P0 = prefs();
  const bocaV = { x: D.x, z: D.z1 }, bocaD = { x: D.x, z: D.z0 };
  // molduras de ferro nas duas bocas, soleira de concreto segurando a água, grade torta caída e plaquinha
  const ferr = MAT.ferrugem;
  for (const b of [bocaV, bocaD]) {
    const s = b === bocaV ? 1 : -1;
    box(.06, D.alto, .06, ferr, b.x - D.larg / 2 - .03, D.alto / 2, b.z + s * .06, A.W.grupo, false); box(.06, D.alto, .06, ferr, b.x + D.larg / 2 + .03, D.alto / 2, b.z + s * .06, A.W.grupo, false);
    box(D.larg + .12, .06, .06, ferr, b.x, D.alto + .03, b.z + s * .06, A.W.grupo, false);
  }
  box(D.larg, .5, .22, A.texMat ? A.texMat('pedra', .4, .2) : MAT.metal, bocaV.x, .25, bocaV.z + .1, A.W.grupo, false);
  const grade = new THREE.Group(); grade.position.set(D.x - 1.45, .52, D.z0 - .14); grade.rotation.set(.22, 0, .06); A.W.grupo.add(grade);
  for (let i = 0; i < 7; i++) box(.02, 1, .02, ferr, -.6 + i * .2, 0, 0, grade, false); for (const y of [-.48, .48]) box(1.3, .03, .03, ferr, 0, y, 0, grade, false);
  const placaTex = A.textoTex([{ t: 'VENTILAÇÃO', tam: 30, estilo: 'bold', y: 44 }, { t: 'ALA VELHA — 1931', tam: 18, y: 80 }], { w: 256, h: 112, fundo: '#2a2a24', cor: '#b8b098', manchas: 3 });
  const pl = A.plano(.5, .22, new THREE.MeshStandardMaterial({ map: placaTex, roughness: .9, emissive: 0x0c0c0a }), D.x, D.alto + .3, D.z1 + .06, 0);
  const aviso = () => prefs().toque ? 'botão Agachar' : 'C';
  A.interact(pl, () => `Duto de ventilação: baixo, só passa agachada (${aviso()}). Corta caminho até o depósito.`, () => {});
  A.interact(grade, () => 'A grade do duto, arrancada e torta. Marcas de dentinhos no ferro.', () => {});
  // colisores das bocas: em pé, a Lia não passa
  const cols = [bocaV, bocaD].map(b => { const c = A.addCollider(b.x - D.larg / 2, b.x + D.larg / 2, b.z - .22, b.z + .22); c.on = false; return { c, b }; });
  // os ratos
  const nR = P0.baixa ? 4 : 7;
  const pele = new THREE.MeshStandardMaterial({ color: 0x2a221c, roughness: 1 }), rabo = new THREE.MeshStandardMaterial({ color: 0x5a4a44, roughness: .8 });
  const olho = new THREE.MeshBasicMaterial({ color: 0xff6a3a });
  const corpoG = new THREE.SphereGeometry(.07, 6, 4), raboG = new THREE.CylinderGeometry(.006, .012, .22, 4), olhoG = new THREE.BoxGeometry(.05, .012, .012);
  const ratos = [];
  const grupo = new THREE.Group(); A.W.grupo.add(grupo);
  const lugar = r => { r.hx = D.x + (Math.random() - .5) * 1.2; r.hz = D.z0 + 1.6 + Math.random() * (D.z1 - D.z0 - 3.2); r.g.position.set(r.hx, .05, r.hz); r.g.rotation.y = Math.random() * 6.28; r.g.visible = true; r.estado = 'quieto'; };
  for (let i = 0; i < nR; i++) {
    const g = new THREE.Group(); grupo.add(g);
    const c = new THREE.Mesh(corpoG, pele); c.scale.set(1, .7, 1.9); g.add(c);
    const rb = new THREE.Mesh(raboG, rabo); rb.rotation.x = Math.PI / 2 - .2; rb.position.set(0, -.02, -.22); g.add(rb);
    const o = new THREE.Mesh(olhoG, olho); o.position.set(0, .03, .12); g.add(o);
    const r = { g, rb, estado: 'quieto', vx: 0, vz: 0, tw: Math.random() * 3 };
    lugar(r); ratos.push(r);
  }
  let luzT = 0, avisouLuz = false, fugiram = false, voltaT = 0, chiT = 2, bateuT = 0, falouDentro = false, saiuQuieta = false, dentroT = 0, empurraT = 0;
  const espantar = (motivo) => {
    if (fugiram) return; fugiram = true; voltaT = 80;
    const P = A.P, c = { x: D.x, y: .3, z: (D.z0 + D.z1) / 2 };
    FX.som.guinchos(c, 9, .5); legenda(A, 'l3Ratos', c);
    for (const b of [bocaV, bocaD]) A.emitNoise(b.x, b.z, 24);
    const passaPorEla = A.P.room && A.P.room.id === 'duto';
    for (const r of ratos) {
      // metade corre para cada boca; os do lado dela passam por cima dela
      const alvo = r.hz > P.pos.z ? bocaV : bocaD, dz = alvo.z - r.g.position.z;
      r.estado = 'fuga'; r.vz = Math.sign(dz || 1) * (3.2 + Math.random() * 1.6); r.vx = (Math.random() - .5) * .6; r.alvo = alvo;
      r.g.rotation.y = r.vz > 0 ? 0 : Math.PI;
    }
    FX.emitir('poeira', D.x, .3, P.pos.z, 10, .4);
    if (passaPorEla || Math.hypot(P.pos.x - D.x, P.pos.z - (D.z0 + D.z1) / 2) < 5) { S.fear = Math.min(100, S.fear + 22); FX.tranco(.1); FX.vib(260, .6); }
    S.flags.l3ratosVezes = (S.flags.l3ratosVezes || 0) + 1;
    setTimeout(() => { if (noMapa(A, 'tuneis')) A.sub('lia', motivo === 'luz' ? 'A luz! Burra... todo mundo lá embaixo ouviu isso.' : 'Correr aqui dentro foi a pior ideia. Ele ouviu. Ele ouviu!'); }, 900);
    A.toast(tecla(motivo === 'luz' ? 'Os ratos fugiram da luz guinchando. O barulho correu pelos túneis.' : 'Os ratos dispararam guinchando. O barulho correu pelos túneis.'));
  };
  X.noDuto = false; X.pertoDuto = false;
  ticks.push(dt => {
    const P = A.P, M = A.M, dentro = !!(P.room && P.room.id === 'duto');
    X.noDuto = dentro;
    const dB = Math.min(Math.hypot(P.pos.x - bocaV.x, P.pos.z - bocaV.z), Math.hypot(P.pos.x - bocaD.x, P.pos.z - bocaD.z));
    // em pé não passa pela boca; lá dentro ela fica agachada
    for (const { c, b } of cols) c.on = !P.crouch && !dentro && Math.hypot(P.pos.x - b.x, P.pos.z - b.z) < 2.5;
    if (dentro && !P.crouch && !S.hidden) { if (P.sprinting && !fugiram) espantar('correu'); P.crouch = true; }
    if (dentro) { P.h = Math.min(P.h, 1); if (A.camera.position.y > 1) A.camera.position.y = 1; } // a cabeça não atravessa o teto baixo
    X.pertoDuto = !dentro && dB < 2.2 && !P.crouch;
    bateuT -= dt;
    if (X.pertoDuto && dB < 1 && bateuT <= 0) { bateuT = 9; A.toast(tecla('Baixo demais para passar em pé. Agache (C) para entrar no duto.')); }
    if (dentro && !falouDentro) { falouDentro = true; setTimeout(() => { if (noMapa(A, 'tuneis') && !fugiram) A.sub('lia', 'Tem bicho aqui dentro. Devagar. Sem luz. Sem pressa.'); }, 600); }
    if (dentro) dentroT += dt;
    if (!dentro && dentroT > 2 && !fugiram && !saiuQuieta) { saiuQuieta = true; setTimeout(() => { if (noMapa(A, 'tuneis')) A.sub('lia', 'Passei. Eles nem se mexeram.'); }, 500); }
    // ele não cabe no duto: fica raspando a boca
    if (M.ativo) {
      const rm = A.roomAt(M.pos.x, M.pos.z);
      if (rm && rm.id === 'duto') { const b = M.pos.z > (D.z0 + D.z1) / 2 ? bocaV : bocaD, s = b === bocaV ? 1 : -1; M.pos.set(b.x, 0, b.z + s * 1.1); M.path = []; M.wait = Math.max(M.wait || 0, 2.5); }
      if (dentro) for (const b of [bocaV, bocaD]) if (Math.hypot(M.pos.x - b.x, M.pos.z - b.z) < 1.6 && !(X.arranhaT > 0)) { X.arranhaT = 6; M.wait = Math.max(M.wait || 0, 2.2); legenda(A, 'l3Arranha', b); A.SFX.estalo({ x: b.x, z: b.z }, .8); FX.emitir('poeira', b.x, .9, b.z, 6, .4); FX.vib(140, .5); S.fear = Math.min(100, S.fear + 10); }
      if (X.arranhaT > 0) X.arranhaT -= dt;
    }
    // ratos: só desenha perto (o resto do mapa não paga por eles)
    const perto = Math.hypot(P.pos.x - D.x, P.pos.z - (D.z0 + D.z1) / 2) < 14;
    grupo.visible = perto;
    if (!perto && !fugiram) return;
    if (fugiram) {
      for (const r of ratos) if (r.estado === 'fuga') {
        r.g.position.x += r.vx * dt; r.g.position.z += r.vz * dt; r.g.position.y = .05 + Math.abs(Math.sin(A.perf() * 30 + r.tw)) * .02;
        r.rb.rotation.z = Math.sin(A.perf() * 25 + r.tw) * .5;
        if (Math.abs(r.g.position.z - r.alvo.z) > 4 && Math.sign(r.g.position.z - r.alvo.z) === Math.sign(r.vz)) { r.estado = 'longe'; r.g.visible = false; }
      }
      voltaT -= dt;
      if (voltaT <= 0 && !dentro && dB > 8) { fugiram = false; luzT = 0; for (const r of ratos) lugar(r); }
      return;
    }
    // quietos: viram a cabeça, mexem o rabo, chiam baixinho
    for (const r of ratos) {
      r.tw -= dt; if (r.tw <= 0) { r.tw = .4 + Math.random() * 2.2; r.g.rotation.y += (Math.random() - .5) * 1.2; }
      r.rb.rotation.z = Math.sin(A.perf() * 3 + r.hx * 9) * .25;
      // abrem caminho devagar quando ela chega perto agachada e sem luz
      const d = Math.hypot(P.pos.x - r.g.position.x, P.pos.z - r.g.position.z);
      if (d < .7) { const lado = r.g.position.x >= P.pos.x ? 1 : -1; r.g.position.x = Math.max(D.x - .75, Math.min(D.x + .75, r.g.position.x + lado * dt * .9)); empurraT -= dt; if (empurraT <= 0) { empurraT = 1.4; FX.som.chiadinho(r.g.position, .07); } }
    }
    chiT -= dt; if (chiT <= 0) { chiT = 2.5 + Math.random() * 4; const r = ratos[Math.random() * ratos.length | 0]; FX.som.chiadinho(r.g.position, .05); legenda(A, 'l3RatosLeve', r.g.position); }
    // luz neles: um aviso e, se insistir, eles disparam
    let naLuz = false;
    if (S.flashOn && A.flash.intensity > 1.2) for (const r of ratos) { const p = r.g.position; if (Math.hypot(P.pos.x - p.x, P.pos.z - p.z) < 3.4 && olhando(A, p.x, p.y, p.z, .82, 3.6)) { naLuz = true; break; } }
    if (naLuz) { luzT += dt; if (!avisouLuz) { avisouLuz = true; A.sub('lia', 'Olhinhos. Dezenas de olhinhos... apaga a luz, apaga a luz.'); if (prefs().toque) A.toast('Toque em Lanterna para apagar a luz.'); else A.toast('F apaga a lanterna.'); } if (luzT > 1.1) espantar('luz'); }
    else luzT = Math.max(0, luzT - dt * .5);
  });
}

// =====================================================================
// CEMITÉRIO E CAPELA
// =====================================================================
export function cemiterio(A, S, def, ctx) {
  const FX = ctx.FX, P0 = prefs();
  cssUmaVez();
  const X = {};
  const ticks = []; A.W.tick.push(dt => { for (const f of ticks) try { f(dt); } catch (e) { console.warn('cemitério (lote 3)', e); } });

  // ---------- desempenho em máquina fraca: uma camada de neblina, as quatro velas do altar dividem uma luz só
  if (P0.baixa) {
    if (ctx.neblina && ctx.neblina[1]) ctx.neblina[1].m.visible = false;
    (ctx.velasAltar || []).forEach((v, i) => { if (i === 0) { v.luz.position.x = 0; v.luz.distance = 6.5; } else if (v.luz.parent) v.luz.parent.remove(v.luz); });
  }
  if (ctx.arvoresMesh) for (const m of ctx.arvoresMesh) { m.updateMatrix(); m.matrixAutoUpdate = false; }
  const som = ctx.som;
  if (som && !som._l3) { som._l3 = true; const f = som.terra; if (f) som.terra = function (pos, ...r) { legenda(A, 'l3Terra', pos); FX.emitir('terra', pos.x, .1, pos.z, 16, .4); FX.vib(300, .7); return f.call(this, pos, ...r); }; }

  // ---------- cavar: torrões voando, tranco a cada pazada, o objeto sobe brilhando e a vela solta fumaça
  const brilho = new A.THREE.Mesh(new A.THREE.SphereGeometry(.09, 10, 8), new A.THREE.MeshBasicMaterial({ color: 0xffd8a0, transparent: true, opacity: 0, depthWrite: false, blending: A.THREE.AdditiveBlending }));
  brilho.visible = false; A.W.grupo.add(brilho);
  let brilhoT = 0;
  const cavados = new Set(Object.keys(S.tumulos));
  ticks.push(dt => {
    const t = A.perf();
    for (const [id, { it, L }] of Object.entries(ctx.itsTum || {})) {
      if (t - (it.seguradoT ?? -9) < .08 && !S.tumulos[id]) {
        X['cv' + id] = (X['cv' + id] || 0) - dt;
        if (X['cv' + id] <= 0) { X['cv' + id] = .55; const p = L.monte.getWorldPosition(new A.THREE.Vector3()); FX.emitir('terra', p.x, .2, p.z, 7, .25); FX.tranco(.035); FX.vib(35, .3); }
      }
      if (S.tumulos[id] && !cavados.has(id)) {
        cavados.add(id); const p = L.monte.getWorldPosition(new A.THREE.Vector3());
        brilho.position.set(p.x, .2, p.z); brilho.visible = true; brilhoT = 1.4; FX.emitir('ouro', p.x, .3, p.z, 12, .2); FX.vib(180, .5);
        const v = ctx.velasTum && ctx.velasTum[id]; if (v) { const c = v.chama.position; for (let i = 0; i < 4; i++) setTimeout(() => { if (noMapa(A, 'cemiterio')) FX.emitir('fumaca', c.x, c.y + .05, c.z, 3, .02); }, i * 350); }
        const n = Object.keys(S.tumulos).length; anunciar(`Túmulo cavado. ${n} de 3.`);
      }
    }
    if (brilhoT > 0) { brilhoT -= dt; const k = 1 - brilhoT / 1.4; brilho.position.y = .2 + k * .9; brilho.material.opacity = Math.sin(k * Math.PI) * .9; brilho.scale.setScalar(1 + k * .6); if (brilhoT <= 0) brilho.visible = false; }
  });
  // o rótulo dos túmulos conta quantos já foram (sem mudar o começo do texto)
  for (const [id, { it }] of Object.entries(ctx.itsTum || {})) { const lb = it.label; it.label = () => { const s = lb(); const n = Object.keys(S.tumulos).length; return S.inv.pa && !S.tumulos[id] && n > 0 ? s + `<small style="opacity:.7"> · ${n}/3 cavados</small>` : s; }; }

  // ---------- altar, sino, obelisco e a porta: poeira, brilho e vibração
  let colocados = S.placed || 0, sinoSinal = 0, obelCaiu = false, capelaFechou = !!S.done.capela;
  ticks.push(() => {
    if ((S.placed || 0) > colocados) { colocados = S.placed; FX.emitir('ouro', 0, 1.3, -65.8, 18, .6); FX.vib(220, .5); FX.tranco(.04); }
    const sp = ctx.sinoP;
    if (sp) { const s = Math.sign(Math.round(sp.rotation.x * 10)); if (s && s !== sinoSinal && Math.abs(sp.rotation.x) > .25) { FX.emitir('poeira', 4.8 + (Math.random() - .5), 5.6, -64 + (Math.random() - .5), 8, .9); if (S.flags.sino) FX.vib(140, .45); } if (s) sinoSinal = s; }
    const ob = ctx.obel;
    if (ob && !obelCaiu && ob.rotation.z <= -Math.PI / 2 + .02) { obelCaiu = true; for (let i = 0; i < 5; i++) FX.emitir('poeira', -2.6 + i * 1.1, .4, -22, 10, .5); FX.emitir('pedra', -.4, .5, -22, 12, .6); FX.vib(520, 1); FX.tranco(.18); }
    if (S.done.capela && !capelaFechou) { capelaFechou = true; FX.emitir('poeira', 0, 2.3, -48.3, 18, .8); FX.vib(220, .6); }
  });

  // ---------- grilos: cantam no cemitério e se calam quando ele está perto (o silêncio avisa)
  let griloT = 1, calados = false;
  ticks.push(dt => {
    const P = A.P, M = A.M;
    if (!P.room || P.room.id !== 'cem' || S.flags.sino) return;
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99, perigo = dM < 20;
    if (perigo && !calados) { calados = true; legenda(A, 'l3Grilos'); }
    else if (!perigo && calados && dM > 26) { calados = false; legenda(A, 'l3GrilosVoltam'); }
    if (calados) return;
    griloT -= dt; if (griloT > 0) return; griloT = .5 + Math.random() * 1.1;
    const a = Math.random() * 6.283, r = 6 + Math.random() * 10;
    FX.som.grilo({ x: P.pos.x + Math.cos(a) * r, y: .1, z: P.pos.z + Math.sin(a) * r }, .035 + Math.random() * .03);
  });

  // ---------- a mureta de pedras soltas em volta do túmulo mais longe da entrada
  mureta(A, S, X, ticks, FX, ctx);

  X.entrar = () => {};
  return juntar(def, X);
}

function mureta(A, S, X, ticks, FX, ctx) {
  const { THREE, MAT, box } = A, imp = ctx.importantes || {};
  const sx = 24, sz = 6; // a escada do mausoléu
  // o túmulo mais longe da entrada (o "terceiro" de quem vai em ordem), longe do caminho central e sem nada em volta
  const cand = Object.entries(imp).map(([id, L]) => ({ id, L, x: L.g.position.x, z: L.g.position.z })).filter(c => Math.abs(c.x) >= 6 && c.z > -44 && c.z < 8)
    .sort((a, b) => Math.hypot(b.x - sx, b.z - sz) - Math.hypot(a.x - sx, a.z - sz));
  const HX = 1.5, Z0 = -.95, Z1 = 2.35, ALT = .95, ESP = .3;
  const livre = c => {
    const x0 = c.x - HX - .5, x1 = c.x + HX + .5, z0 = c.z + Z0 - .5, z1 = c.z + Z1 + .5;
    for (const k of A.W.colliders) { if (!k.on) continue; const cx = (k.minX + k.maxX) / 2, cz = (k.minZ + k.maxZ) / 2; if (Math.abs(cx - c.x) < .5 && Math.abs(cz - c.z) < .3) continue; if (k.maxX > x0 && k.minX < x1 && k.maxZ > z0 && k.minZ < z1) return false; }
    return !(c.x - HX < -28 || c.x + HX > 28);
  };
  const T = cand.find(livre); if (!T) return;
  const it0 = ctx.itsTum && ctx.itsTum[T.id]; if (!it0) return;
  const cx = T.x, z0 = T.z + Z0, z1 = T.z + Z1;
  // lado das pedras soltas: o que olha para a entrada; o portãozinho fica do lado oposto
  const lados = [{ n: 'x0', nx: -1, nz: 0 }, { n: 'x1', nx: 1, nz: 0 }, { n: 'z0', nx: 0, nz: -1 }, { n: 'z1', nx: 0, nz: 1 }];
  const dir = { x: sx - cx, z: sz - (z0 + z1) / 2 }, dl = Math.hypot(dir.x, dir.z) || 1;
  lados.sort((a, b) => (b.nx * dir.x + b.nz * dir.z) - (a.nx * dir.x + a.nz * dir.z));
  const solto = lados[0].n, portao = lados[3].n;
  void dl;
  const pedra = A.texMat ? A.texMat('pedra', .6, .3) : MAT.pedraLap;
  const seg = { x0: [cx - HX, z0, cx - HX, z1], x1: [cx + HX, z0, cx + HX, z1], z0: [cx - HX, z0, cx + HX, z0], z1: [cx - HX, z1, cx + HX, z1] };
  const blocos = [];
  let colSolto = null, cSolto = null;
  for (const n of ['x0', 'x1', 'z0', 'z1']) {
    const [ax, az, bx, bz] = seg[n], hor = az === bz, len = hor ? Math.abs(bx - ax) : Math.abs(bz - az), mx = (ax + bx) / 2, mz = (az + bz) / 2;
    if (n === portao) { // dois pedaços com a abertura de 1,2 m no meio e um portãozinho de ferro aberto
      const lp = (len - 1.2) / 2;
      for (const s of [-1, 1]) { const px = hor ? mx + s * (.6 + lp / 2) : mx, pz = hor ? mz : mz + s * (.6 + lp / 2); box(hor ? lp : ESP, ALT, hor ? ESP : lp, pedra, px, ALT / 2, pz); A.addCollider(px - (hor ? lp / 2 : ESP / 2), px + (hor ? lp / 2 : ESP / 2), pz - (hor ? ESP / 2 : lp / 2), pz + (hor ? ESP / 2 : lp / 2)); }
      const pg = new THREE.Group(); pg.position.set(hor ? mx - .6 : mx, 0, hor ? mz : mz - .6); pg.rotation.y = hor ? -1.2 : -Math.PI / 2 - 1.2; A.W.grupo.add(pg);
      for (let i = 0; i < 6; i++) box(.02, .8, .02, MAT.ferrugem, .1 + i * .2, .45, 0, pg, false); for (const y of [.12, .82]) box(1.1, .03, .03, MAT.ferrugem, .55, y, 0, pg, false);
      A.interact(pg, () => 'Um portãozinho de ferro, aberto. É por aqui que se entra no jazigo.', () => {});
      continue;
    }
    if (n === solto) { // feito de blocos soltos que caem
      const nb = 5;
      for (let i = 0; i < nb; i++) for (let j = 0; j < 2; j++) {
        const k = (i + .5) / nb - .5, w = len / nb - .04, h = ALT / 2 - .02;
        const m = box(hor ? w : ESP, h, hor ? ESP : w, pedra, hor ? mx + k * len : mx, h / 2 + j * ALT / 2 + .01, hor ? mz : mz + k * len);
        m.rotation.y = (Math.random() - .5) * .08; blocos.push({ m, j, vy: 0, vx: 0, vz: 0, rx: 0, rz: 0 });
      }
      colSolto = A.addCollider(Math.min(ax, bx) - (hor ? 0 : ESP / 2), Math.max(ax, bx) + (hor ? 0 : ESP / 2), Math.min(az, bz) - (hor ? ESP / 2 : 0), Math.max(az, bz) + (hor ? ESP / 2 : 0));
      cSolto = { x: mx, z: mz, nx: lados[0].nx, nz: lados[0].nz };
      continue;
    }
    box(hor ? len + ESP : ESP, ALT, hor ? ESP : len + ESP, pedra, mx, ALT / 2, mz);
    A.addCollider(mx - (hor ? (len + ESP) / 2 : ESP / 2), mx + (hor ? (len + ESP) / 2 : ESP / 2), mz - (hor ? ESP / 2 : (len + ESP) / 2), mz + (hor ? ESP / 2 : (len + ESP) / 2));
  }
  // musgo e uma placa de família apagada na mureta
  box(.5, .18, .02, MAT.pedraLap || pedra, cSolto.x + cSolto.nx * .17, ALT - .25, cSolto.z + cSolto.nz * .17, A.W.grupo, false);
  const dentro = () => { const P = A.P.pos; return P.x > cx - HX && P.x < cx + HX && P.z > z0 && P.z < z1; };
  // de fora da mureta não alcança a cova: o rótulo continua dizendo o que é e onde entrar
  const it = it0.it, lb = it.label, pode = it.pode;
  it.pode = () => pode() && (dentro() || !!S.flags.l3muroCaiu);
  it.label = () => { const s = lb(); if (!S.inv.pa || S.tumulos[T.id] || dentro() || S.flags.l3muroCaiu) return s; return s.replace('<b>E</b>', '').replace(/\s*\((segure|\d+%)[^)]*\)/, '') + '<small style="opacity:.75"> — de dentro do jazigo: entre pelo portãozinho ou derrube as pedras soltas</small>'; };
  // derrubar: segurar E 2 s; o estrondo atrai ele na hora
  const alvoG = new THREE.Group(); A.W.grupo.add(alvoG); for (const b of blocos) { alvoG.attach ? alvoG.attach(b.m) : alvoG.add(b.m); }
  let caiu = !!S.flags.l3muroCaiu, queda = caiu ? 9 : -1, pedrT = 0;
  const derrubar = (instante) => {
    colSolto.on = false;
    for (const b of blocos) { b.vx = cSolto.nx * (1 + Math.random() * 1.6) + (Math.random() - .5) * .6; b.vz = cSolto.nz * (1 + Math.random() * 1.6) + (Math.random() - .5) * .6; b.vy = b.j ? 1.5 + Math.random() : .5 + Math.random() * .6; b.rx = (Math.random() - .5) * 6; b.rz = (Math.random() - .5) * 6; }
    if (instante) { for (const b of blocos) { b.m.position.x += b.vx * .6; b.m.position.z += b.vz * .6; b.m.position.y = .12; b.m.rotation.set(b.rx * .3, b.m.rotation.y, b.rz * .3); } return; }
    queda = 0;
  };
  if (caiu) derrubar(true);
  const itM = A.interact(alvoG, () => {
    if (S.flags.l3muroCaiu) return 'A mureta caída. Caminho aberto até a cova.';
    const k = Math.min(1, (itM.progresso || 0) / itM.hold);
    return `<b>E</b>Empurrar as pedras soltas da mureta ${k > .02 ? `(${Math.round(k * 100)}%)` : '(segure; atalho, mas faz um estrondo)'}`;
  }, () => {
    if (S.flags.l3muroCaiu) return;
    S.flags.l3muroCaiu = true; caiu = true; derrubar(false);
    const p = { x: cSolto.x, y: .4, z: cSolto.z };
    FX.som.desabar(p, .9); legenda(A, 'l3Pedras', p); FX.vib(600, 1); FX.tranco(.22); S.fear = Math.min(100, S.fear + 25);
    for (let i = 0; i < 4; i++) FX.emitir('poeira', cSolto.x + (Math.random() - .5) * 2.4 * Math.abs(cSolto.nz), .5, cSolto.z + (Math.random() - .5) * 2.4 * Math.abs(cSolto.nx), 12, .6);
    FX.emitir('pedra', p.x, .6, p.z, 14, .8);
    A.emitNoise(p.x, p.z, 60);
    const M = A.M;
    if (!S.flags.sino && S.chapter >= 5) {
      if (!M.ativo) A.ativarInspetor(0, -46, 'investiga');
      M.state = 'investiga'; M.searchT = 0; M.wait = 0; M.cool = 1.2; A.planejar(M, p.x + cSolto.nx * 1.5, p.z + cSolto.nz * 1.5);
    }
    anunciar('A mureta desabou. Ele ouviu e está vindo.');
    setTimeout(() => { if (noMapa(A, 'cemiterio')) A.sub('lia', 'Que barulho... ele ouviu. Cava rápido, Lia. Cava rápido!'); }, 700);
    A.toast('O atalho custou caro: ele está vindo direto para cá.');
  });
  itM.hold = 2; itM.guarda = true; itM.som = null; itM.ruido = 3; itM.pode = () => !S.flags.l3muroCaiu;
  ticks.push(dt => {
    const t = A.perf();
    if (!caiu && t - (itM.seguradoT ?? -9) < .08) { pedrT -= dt; const k = Math.min(1, (itM.progresso || 0) / itM.hold); for (const b of blocos) if (b.j) b.m.position.y = ALT * .75 + .01 + (Math.random() - .5) * .02 * k; if (pedrT <= 0) { pedrT = .3; FX.som.pedrinha({ x: cSolto.x, y: .8, z: cSolto.z }); FX.emitir('poeira', cSolto.x, .9, cSolto.z, 3, .8); FX.vib(40 + k * 80, .2 + k * .4); } }
    else if (!caiu && itM.progresso > 0 && t - (itM.seguradoT ?? -9) > .5) itM.progresso = Math.max(0, itM.progresso - dt * .3);
    if (queda >= 0 && queda < 2) {
      queda += dt;
      for (const b of blocos) {
        if (b.m.position.y <= .12 && b.vy <= 0) { b.vx *= .85; b.vz *= .85; b.rx *= .8; b.rz *= .8; b.m.position.y = .12; }
        else b.vy -= 9.8 * dt;
        b.m.position.x += b.vx * dt; b.m.position.z += b.vz * dt; b.m.position.y = Math.max(.12, b.m.position.y + b.vy * dt);
        b.m.rotation.x += b.rx * dt; b.m.rotation.z += b.rz * dt;
      }
    }
    // ele não fica preso do lado de fora da mureta: pula por cima com um baque
    const M = A.M; if (!M.ativo) return;
    const fora = !(M.pos.x > cx - HX && M.pos.x < cx + HX && M.pos.z > z0 && M.pos.z < z1), perto = M.pos.x > cx - HX - 1.2 && M.pos.x < cx + HX + 1.2 && M.pos.z > z0 - 1.2 && M.pos.z < z1 + 1.2;
    if (dentro() && fora && perto && ['caca', 'investiga', 'procura', 'alerta'].includes(M.state)) {
      X.preso = (X.preso || 0) + dt;
      if (X.preso > 1.6) { X.preso = 0; M.pos.set(Math.max(cx - HX + .45, Math.min(cx + HX - .45, M.pos.x)), 0, Math.max(z0 + .45, Math.min(z1 - .45, M.pos.z))); M.path = []; A.SFX.pancada(M.pos.x, M.pos.z); FX.emitir('poeira', M.pos.x, .3, M.pos.z, 12, .5); FX.vib(300, .8); FX.tranco(.12); }
    } else X.preso = 0;
  });
  X.jazigo = { x: cx, z0, z1, id: T.id };
}
