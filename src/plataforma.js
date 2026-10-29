// A HORA DO SILÊNCIO — Plataforma e acessibilidade.
// Qualidade de imagem (automática), resolução dinâmica, opções de conforto e acessibilidade,
// pausa ao perder o foco, controle (gamepad), controles de toque, salvamento leve, compartilhamento.
// Ligado ao motor por poucos ganchos em jogo.js (PLAT.antes / PLAT.depois / PLAT.instalar ...).

import { instalarPlat2 } from './plataforma2.js';
import { instalarPlat3 } from './plataforma3.js';
import { instalarPlat4 } from './plataforma4.js';

const KEY = 'hora-silencio-plat';
const AUTO_KEY = 'hora-silencio-v3-auto';
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const robo = !!navigator.webdriver;
const menosMovimento = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const toqueNativo = !!(window.matchMedia && matchMedia('(pointer:coarse)').matches && !matchMedia('(pointer:fine)').matches);

const PADRAO = {
  qual: null, brilho: 1.1, fov: 72, resDin: true, lim30: false, fps: false,
  invY: false, agachar: 'alternar', padSens: 1, vibrar: true,
  bob: true, tremor: menosMovimento ? .4 : 1, tunel: true, clarao: menosMovimento,
  fone: true, mono: false, legSom: false, indic: false,
  legTam: 'm', legCaixa: false, mira: 'normal', calibrado: false,
  // lote 2
  acoes: 'segurar', soltar: 'mouse', padZona: .18, setas: true,
  tqTam: 'm', tqOpac: .85, tqCanhoto: false, tqSens: 1,
  dalt: 'nao', avisoVisual: false, vibMundo: true, menuLeve: true,
  // lote 3
  giroTec: false, giroVel: 1, mouseCru: true, arrastar: false, cheiaJogo: true, giro: false, giroSens: 1, sacudir: true, tqLimpo: false, ritmo: '1', clipe: false, plateiaModo: 'atrapalha'
};
const ler = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
const O = { ...PADRAO, ...ler() };
const salvar = () => { try { localStorage.setItem(KEY, JSON.stringify(O)); } catch (e) {} };

const QUAL = {
  alta:  { nome: 'Alta',  pr: 1.5,  sombra: 1024, chuva: 1,   grao: .05, nevoa: 1 },
  media: { nome: 'Média', pr: 1,    sombra: 512,  chuva: .6,  grao: .08, nevoa: 1.06 },
  baixa: { nome: 'Baixa', pr: .75,  sombra: 0,    chuva: .35, grao: .12, nevoa: 1.15 },
  // lote 3: metade da resolução com pixels grandes de propósito (cara de fita velha), para PC muito fraco
  minima: { nome: 'Mínima', pr: .5, sombra: 0,    chuva: .15, grao: .14, nevoa: 1.3 }
};
const Q = () => QUAL[O.qual] || QUAL.alta;

let C = null;              // contexto do motor
let graca = 0;             // segundo de retorno suave depois da pausa
let pulsoV = 0, hbFase = 0;
let relogio = 0; const fila = [];
let toque = false, padAtivo = false, padAtual = null;
let vidaAnt = 100;
let grupoAnt = null;
let estavaAgarrada = false, coracaoT = 0, procAnt = null, procPulso = 0;
let P3 = { antes: () => 1, depois() {}, toqueFrame() {}, mapa() {}, opcoes() {}, pular: () => false, foto: false, semTrava: () => false, travaOpcoes: () => null, poolInfo: () => '', setCorte() {}, pulsoVisual() {}, montarToque() {}, fecharOpcoes() {} };
let corte = 0, corteT = 0; // escada de cortes quando a resolução já está no mínimo
let P2 = { fecharLapide() {}, abrirLapide() {}, morreu() {}, frame() {}, mapa() {}, opcoes() {} }; // trocado em instalar() pelo módulo do lote 2
let P4 = { frame() {}, mapa() {}, aoFim() {} }; // lote 4: segredos e easter eggs
let prAtual = 1, tetoPR = 1;
let fogAplicada = -1;
let ultimoQuadro = 0;
// medição de quadros reais (independe do frame() do motor)
let mediaMs = 16, amostras = 0, medT0 = 0, lentoT = 0, rapidoT = 0, avisouPesado = false, detectou = false;

// =====================================================================
// QUALIDADE E DESEMPENHO
// =====================================================================
function aplicarQual() {
  if (!C) return;
  const q = Q(), { renderer, flash, chuvaGeo, NCH } = C;
  tetoPR = Math.min(devicePixelRatio || 1, q.pr);
  prAtual = tetoPR; renderer.setPixelRatio(prAtual);
  flash.castShadow = q.sombra > 0;
  if (q.sombra && flash.shadow.mapSize.x !== q.sombra) {
    if (flash.shadow.map) { flash.shadow.map.dispose(); flash.shadow.map = null; }
    flash.shadow.mapSize.set(q.sombra, q.sombra);
  }
  chuvaGeo.setDrawRange(0, Math.floor(NCH * q.chuva));
  fogAplicada = -1;
  aplicarCorte();
}
// cortes em ordem fixa (um por vez): menos chuva, menos luzes reais, sem sombra da lanterna
function aplicarCorte() {
  if (!C) return; const q = Q();
  C.chuvaGeo.setDrawRange(0, Math.floor(C.NCH * q.chuva * (corte >= 1 ? .5 : 1)));
  P3.setCorte(corte);
  C.flash.castShadow = q.sombra > 0 && corte < 3;
}
// o que o navegador conta do aparelho: memória, núcleos e o modo "economia de dados"
function aparelho() {
  const mem = navigator.deviceMemory || 8, nuc = navigator.hardwareConcurrency || 8, con = navigator.connection;
  if (mem <= 2 || nuc <= 2 || (con && con.saveData)) return 'fraco';
  if (mem <= 4 || nuc <= 4) return 'medio';
  return 'bom';
}
function medir(now) {
  requestAnimationFrame(medir);
  if (!medT0) { medT0 = now; return; }
  const ms = now - medT0; medT0 = now;
  if (ms > 250 || document.hidden) return; // aba escondida ou travada de propósito
  mediaMs += (ms - mediaMs) * .08; amostras++;
  if (!C) return;
  // primeira vez: decide sozinho a qualidade olhando os 3 primeiros segundos
  if (!detectou && O.qual == null && amostras > 180) {
    detectou = true;
    const hw = aparelho();
    O.qual = mediaMs > 28 || hw === 'fraco' ? 'baixa' : toque || hw === 'medio' ? 'media' : 'alta'; salvar(); aplicarQual(); syncOpcoes();
    if (O.qual === 'baixa') aviso('Seu computador é mais modesto: ativei a qualidade Baixa (dá para mudar em Opções).');
  }
  if (!O.resDin) return;
  // na caçada e na Procissão a fluidez vem antes da nitidez: o alvo sobe para perto de 45 quadros
  const caca = (C.M && C.M.ativo && C.M.state === 'caca') || C.PROC.fase === 'passando';
  const dtS = ms / 1000, alvoLento = O.lim30 ? 40 : caca ? 23 : 33, alvoRapido = O.lim30 ? 35 : 18;
  if (mediaMs > alvoLento) { lentoT += dtS; rapidoT = 0; } else if (mediaMs < alvoRapido) { rapidoT += dtS; lentoT = 0; } else { lentoT = Math.max(0, lentoT - dtS); rapidoT = Math.max(0, rapidoT - dtS); }
  if (lentoT > 2 && prAtual > .6) { prAtual = Math.max(.6, +(prAtual - .1).toFixed(2)); C.renderer.setPixelRatio(prAtual); lentoT = 0; }
  else if (rapidoT > 5 && prAtual < tetoPR && corte === 0) { prAtual = Math.min(tetoPR, +(prAtual + .1).toFixed(2)); C.renderer.setPixelRatio(prAtual); rapidoT = 0; }
  if (!avisouPesado && lentoT > 1.5 && prAtual <= .6 && O.qual !== 'baixa' && O.qual !== 'minima' && C.mode === 'jogo') { avisouPesado = true; C.toast('A imagem está pesada. Em Desempenho, experimente Qualidade Baixa.'); }
  if (!avisouPesado && O.qual === 'baixa' && C.mode === 'jogo' && corte >= 3 && mediaMs > alvoLento) { avisouPesado = true; C.toast('Ainda pesado. Em Desempenho, a qualidade Mínima (fita velha) roda em quase qualquer computador.'); }
  const piso = Math.min(.6, tetoPR);
  if (prAtual <= piso + .001 && mediaMs > alvoLento) { corteT += dtS; if (corteT > 3 && corte < 3) { corte++; corteT = 0; aplicarCorte(); } }
  else if (mediaMs < alvoRapido && corte > 0) { corteT -= dtS; if (corteT < -10) { corte--; corteT = 0; aplicarCorte(); } }
  else corteT = 0;
}

// =====================================================================
// AGENDADOR NO RELÓGIO DO JOGO (não dispara na pausa nem depois de morrer)
// =====================================================================
function agenda(fn, seg) { fila.push({ t: relogio + seg, fn }); }
function rodarAgenda(dt) {
  relogio += dt;
  for (let i = fila.length - 1; i >= 0; i--) if (fila[i].t <= relogio) { const f = fila.splice(i, 1)[0]; try { f.fn(); } catch (e) { console.warn(e); } }
}

// =====================================================================
// SOM: pausa sem cortar o clima, retorno suave, mono
// =====================================================================
function volume(alvo, tempo = .35) {
  const m = C && C.master, ac = C && C.AC; if (!m || !ac) return;
  const t = ac.currentTime; m.gain.cancelScheduledValues(t); m.gain.setValueAtTime(m.gain.value, t); m.gain.setTargetAtTime(alvo, t, tempo / 3);
}
function aplicarMono() {
  const ac = C && C.AC; if (!ac) return;
  try { ac.destination.channelCount = O.mono ? 1 : Math.min(2, ac.destination.maxChannelCount || 2); ac.destination.channelInterpretation = 'speakers'; } catch (e) {}
}
let monoFeito = false;

// =====================================================================
// LEGENDAS DE SONS E INDICADOR VISUAL
// =====================================================================
function direcao(x, z) {
  const cam = C.camera.position, yaw = C.P.yaw;
  let rel = Math.atan2(x - cam.x, z - cam.z) - Math.atan2(-Math.sin(yaw), -Math.cos(yaw));
  rel = Math.atan2(Math.sin(rel), Math.cos(rel));
  return -rel; // ângulo na tela, horário a partir de "à frente"
}
function nomeDir(a) { const g = Math.abs(a); return g < Math.PI / 4 ? 'à frente ↑' : g > Math.PI * .75 ? 'atrás ↓' : a > 0 ? 'à direita →' : 'à esquerda ←'; }
const ultimaLeg = {};
let sinoN = 0, sinoUlt = -9;
// aviso visual de sons fortes: a borda da tela pulsa do lado de onde veio o som
function borda(pos, forca) {
  if (!O.avisoVisual || !C || C.mode === 'titulo') return;
  const el = $('#pl-borda'); if (!el) return;
  let lado = 'todo';
  if (pos && pos.x !== undefined) { const a = direcao(pos.x, pos.z), g = Math.abs(a); lado = g < Math.PI / 4 ? 'cima' : g > Math.PI * .75 ? 'baixo' : a > 0 ? 'dir' : 'esq'; }
  el.className = ''; void el.offsetWidth; el.className = 'b-' + lado; el.style.setProperty('--f', clamp(forca, .15, 1).toFixed(2));
}
// vibração dos avisos do mundo (sino, luzes da Procissão, coração com ele perto)
function vibrarMundo(forte, fraco, ms) { if (O.vibMundo) vibrar(forte, fraco, ms); }
function legenda(id, texto, pos, intervalo = 2.5) {
  if (!O.legSom || !C || C.mode === 'titulo') return;
  const agora = performance.now() / 1000; if (ultimaLeg[id] && agora - ultimaLeg[id] < intervalo) return; ultimaLeg[id] = agora;
  const el = $('#legsom'); if (!el) return;
  const d = document.createElement('div');
  let dist = '';
  if (pos && pos.x !== undefined) { const dd = Math.hypot(pos.x - C.P.pos.x, pos.z - C.P.pos.z); dist = (dd < 4 ? ' — perto' : dd > 12 ? ' — longe' : '') ; texto += ' ' + nomeDir(direcao(pos.x, pos.z)) + dist; }
  d.textContent = '[' + texto + ']'; el.appendChild(d);
  while (el.children.length > 3) el.firstChild.remove();
  setTimeout(() => { d.style.opacity = 0; setTimeout(() => d.remove(), 600); }, 2600);
}
function embrulharSons() {
  const S = C.SOM;
  const emb = (k, fn) => { const o = S[k]; if (typeof o !== 'function') return; S[k] = (...a) => { try { fn(...a); } catch (e) {} return o(...a); }; };
  emb('passoMonstro', (pos, vol) => { if (pos && vol >= .6) { legenda('passos', 'passos pesados', pos, 3); if (vol >= .85) borda(pos, .5); } });
  emb('risada', (x, z) => { legenda('risada', 'risada de menina', { x, z }, 3); borda({ x, z }, .6); });
  emb('chamadoVoz', (x, z) => { legenda('chamado', 'alguém chama “Lia...”', { x, z }, 2); borda({ x, z }, .5); });
  emb('rangido', (x, y, z) => legenda('rangido', 'porta rangendo', { x, z }, 3));
  emb('vidro', (x, z) => { legenda('vidro', 'vidro quebrando', x !== undefined ? { x, z } : null, 1); borda(x !== undefined ? { x, z } : null, .8); });
  emb('trovao', () => { legenda('trovao', 'trovão', null, 5); borda(null, .25); });
  emb('sino', () => {
    // conta as badaladas da mesma série (as nove da Hora)
    const ag = performance.now() / 1000; sinoN = ag - sinoUlt < 4.5 ? sinoN + 1 : 1; sinoUlt = ag;
    ultimaLeg.sino = 0; legenda('sino', 'o sino bate' + (sinoN > 1 ? ` — ${sinoN}ª vez` : ''), null, 0);
    borda(null, .7); vibrarMundo(.55, .35, 220);
  });
  emb('canto', () => legenda('canto', 'um canto distante se aproxima', null, 6));
  emb('estatica', () => { legenda('estatica', 'chiado de rádio', null, 4); vibrarMundo(.15, .4, 120); });
  emb('contagem', pos => legenda('contagem', 'uma menina conta', pos, 4));
  emb('grito', () => { legenda('grito', 'grito', null, 1); borda(null, 1); });
  emb('pancada', (x, z) => { legenda('pancada', 'pancada', { x, z }, 2); borda({ x, z }, .8); vibrarMundo(.5, .2, 120); });
  emb('gerador', on => { if (on) legenda('gerador', 'o gerador ronca', null, 8); });
}
function atualizarIndicadores() {
  const box = $('#indic'); if (!box) return;
  const ligado = O.indic && C.mode === 'jogo' && !C.ui && C.S && !C.S.dead;
  box.hidden = !ligado; if (!ligado) return;
  const ents = [];
  // com paleta de daltonismo, os arcos usam pares que não se confundem
  const pal = O.dalt === 'tritan' ? ['#ff3b5c', '#e6e6e6', '#38d6c8', '#ff9fd0'] : O.dalt !== 'nao' ? ['#ff4fd8', '#4fa3ff', '#e6e6e6', '#ffd84a'] : ['#c0392b', '#b38b6d', '#a9b6c9', '#e0c070'];
  if (C.M.ativo) ents.push([C.M.pos, 14, C.M.state === 'caca' ? pal[0] : pal[1]]);
  if (C.ANA.ativa) ents.push([C.ANA.pos, 10, pal[2]]);
  if (C.PROC.fase === 'passando') ents.push([C.PROC.pos, 12, pal[3]]);
  const els = box.children;
  for (let i = 0; i < els.length; i++) {
    const e = ents[i], el = els[i];
    if (!e) { el.style.opacity = 0; continue; }
    const [pos, alc, cor] = e, d = Math.hypot(pos.x - C.P.pos.x, pos.z - C.P.pos.z);
    if (d > alc) { el.style.opacity = 0; continue; }
    el.style.opacity = (1 - d / alc) * .9;
    el.style.borderTopColor = cor;
    el.style.borderTopStyle = O.dalt !== 'nao' && i === 0 && C.M.state === 'caca' ? 'dashed' : 'solid'; // caçando: tracejado, lido pela forma
    el.style.transform = `rotate(${(direcao(pos.x, pos.z) * 180 / Math.PI).toFixed(1)}deg)`;
  }
}

// =====================================================================
// SALVAMENTO LEVE (contra o F5)
// =====================================================================
let autoT = 0, calmaT = 0, assinatura = '';
function seguroParaSalvar() {
  const S = C.S;
  if (!S || C.mode !== 'jogo' || C.ui || S.dead || S.fim || S.hidden) return false;
  if (C.PROC.fase || C.ANA.ativa || (C.M.ativo && C.M.state !== 'patrulha')) return false;
  if (!$('#fimcap').hidden || !$('#fita-ind').hidden || calmaT < 12) return false;
  return true;
}
function salvarAuto() {
  if (!seguroParaSalvar()) return false;
  const S = C.S, P = C.P;
  try {
    const snap = JSON.parse(JSON.stringify({ ...S, pos: [P.pos.x, P.pos.z], yaw: P.yaw, mapa: C.W.mapa, hidden: null, dead: false, fim: false, _check: undefined }));
    localStorage.setItem(AUTO_KEY, JSON.stringify({ t: Date.now(), snap }));
    return true;
  } catch (e) { return false; }
}
function autoValido() {
  let a, cp; try { a = JSON.parse(localStorage.getItem(AUTO_KEY)); cp = JSON.parse(localStorage.getItem(C.SAVE_KEY)); } catch (e) { return null; }
  if (!a || !a.snap || !cp) return null;
  if (a.snap.chapter !== cp.chapter || a.snap.mapa !== cp.mapa || (a.snap.tempo || 0) < (cp.tempo || 0) + 10) return null;
  return { auto: a.snap, cp };
}
function apagarAuto() { try { localStorage.removeItem(AUTO_KEY); } catch (e) {} }
function atualizarContinuar() {
  const b = $('#b-cont'); if (!b) return;
  b.textContent = !b.hidden && autoValido() ? 'Continuar de onde parou' : 'Continuar';
}
function vigiarCalma(dt) {
  const S = C.S; if (!S) return;
  const sig = Object.keys(S.done).length + '|' + Object.keys(S.flags).length + '|' + Object.keys(S.picked).length + '|' + S.chapter + '|' + C.W.mapa;
  if (sig !== assinatura) { assinatura = sig; calmaT = 0; } else calmaT += dt;
  autoT += dt;
  if (autoT >= 30) { if (salvarAuto()) autoT = 0; else autoT = 25; }
}

// =====================================================================
// CONTROLE (GAMEPAD)
// =====================================================================
const B = { A: 0, B: 1, X: 2, Y: 3, LB: 4, RB: 5, LT: 6, RT: 7, SEL: 8, START: 9, L3: 10, R3: 11, CIMA: 12, BAIXO: 13, ESQ: 14, DIR: 15 };
let antesB = [], padSet = {}, eixoNav = 0;
const fake = code => ({ code, preventDefault() {} });
function vibrar(forte, fraco, ms) {
  if (!O.vibrar) return;
  const g = padAtual;
  try { if (padAtivo && g && g.vibrationActuator && g.vibrationActuator.playEffect) g.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: forte, weakMagnitude: fraco }).catch(() => {}); } catch (e) {}
  try { if (toque && navigator.vibrate) navigator.vibrate(ms); else if (toque) P3.pulsoVisual(ms, forte); } catch (e) {}
}
function setPad(on) { if (padAtivo === on) return; padAtivo = on; document.body.classList.toggle('pad', on); }
function olhar(dx, dy) { // radianos
  const P = C.P, S = C.S;
  const sm = P.sensMul || 1; // jogabilidade (lote 3): mais fino escondida/mirando e atrito sobre o que dá para usar
  P.yaw -= dx * sm; P.pitch = clamp(P.pitch - dy * sm * (C.OPT.invY ? -1 : 1), -1.45, 1.45);
  if (S && S.hidden) { const cama = S.hidden.tipo === 'cama', base = Math.atan2(-S.hidden.face[0], -S.hidden.face[1]); let d = P.yaw - base; d = Math.atan2(Math.sin(d), Math.cos(d)); P.yaw = base + clamp(d, cama ? -1.1 : -.75, cama ? 1.1 : .75); P.pitch = clamp(P.pitch, cama ? -.45 : -.35, cama ? .22 : .35); } // embaixo da cama: os mesmos limites do mouse
}
function pad(dt) {
  if (!navigator.getGamepads) return;
  let g = null; try { for (const x of navigator.getGamepads()) if (x && x.connected) { g = x; break; } } catch (e) { return; }
  padAtual = g; if (!g) return;
  const b = i => !!(g.buttons[i] && (g.buttons[i].pressed || g.buttons[i].value > .5));
  const novo = i => b(i) && !antesB[i];
  const zm = clamp(+O.padZona || .18, .05, .4);
  const ax = i => { const v = g.axes[i] || 0; return Math.abs(v) < zm ? 0 : (v - Math.sign(v) * zm) / (1 - zm); };
  const usado = g.buttons.some((x, i) => b(i)) || g.axes.some(v => Math.abs(v) > .3);
  if (usado) setPad(true);
  if (!padAtivo) { antesB = g.buttons.map((x, i) => b(i)); return; }
  const S = C.S, ui = C.ui, mode = C.mode, keys = C.keys;
  const emJogo = mode === 'jogo' && !ui && S && !S.dead && !S.fim;
  const k = { KeyW: false, KeyS: false, KeyA: false, KeyD: false };
  if (!emJogo) soltarTodosPad(); // trocar de tela nunca deixa um botão "preso"
  if ($('#portal') && !$('#portal').hidden) { if (novo(B.A) || novo(B.START)) fecharPortal(); }
  else if (mode === 'cena') { if (novo(B.A) || novo(B.START)) C.onKey(fake('Enter')); }
  else if (emJogo) {
    const lx = ax(0), ly = ax(1);
    k.KeyW = ly < -.3; k.KeyS = ly > .3; k.KeyA = lx < -.3; k.KeyD = lx > .3;
    // o analógico anda em qualquer direção e na velocidade de quanto se empurra (pouco = devagar e quieto)
    const lp = Math.min(1, Math.hypot(lx, ly)); if (lp > .05) C.P.mover = { x: lx, y: ly, l: lp, de: 'pad' }; else if (C.P.mover && C.P.mover.de === 'pad') C.P.mover = null;
    // cada botão vira uma tecla de verdade (aperta e solta): segurar e "alternar" das Opções funcionam igual ao teclado
    const agarrada = C.M && C.M.state === 'agarra';
    if (agarrada) { if (novo(B.A)) puxar(200); segurarBotao('KeyE', false); } else segurarBotao('KeyE', b(B.A));
    segurarBotao('ShiftLeft', b(B.RT) || b(B.L3));
    segurarBotao('Space', b(B.RB));
    segurarBotao('AltLeft', b(B.LT));
    segurarBotao('KeyC', b(B.B));
    segurarBotao('KeyF', b(B.X));
    segurarBotao('Tab', b(B.Y) || b(B.SEL));
    segurarBotao('KeyG', b(B.LB));
    segurarBotao('KeyR', b(B.CIMA));
    segurarBotao('KeyH', b(B.BAIXO));
    segurarBotao('KeyQ', b(B.R3));
    if (S.hidden) { segurarBotao('KeyZ', b(B.ESQ)); segurarBotao('KeyX', b(B.DIR)); segurarBotao('KeyO', false); }
    else { segurarBotao('KeyZ', false); segurarBotao('KeyX', false); segurarBotao('KeyO', b(B.ESQ)); segurarBotao('KeyV', b(B.DIR)); }
    if (novo(B.START)) { soltarTodosPad(); C.unlock(); C.abrirPausa(); }
    const rx = ax(2), ry = ax(3), s = 2.8 * O.padSens * dt;
    if (agarrada) puxar((Math.abs(rx - (antesB.rx || 0)) + Math.abs(ry - (antesB.ry || 0))) * 350); // sacudir o analógico também solta
    if (rx || ry) olhar(rx * Math.abs(rx) * s, ry * Math.abs(ry) * s * .75);
    antesB.rx = rx; antesB.ry = ry;
  } else {
    // na nota: X lê em voz alta, Y vira a folha das regras
    if (ui === 'nota') { if (novo(B.X)) C.onKey(fake('KeyL')); if (novo(B.Y)) C.onKey(fake('KeyV')); }
    // menus: direcional ou analógico navega, A confirma, B volta
    const ly = ax(1), lx = ax(0);
    let nav = 0; if (novo(B.CIMA)) nav = -1; if (novo(B.BAIXO)) nav = 1;
    const ev = ly < -.6 ? -1 : ly > .6 ? 1 : 0; if (ev && ev !== eixoNav) nav = ev; eixoNav = ev;
    if (nav) focar(nav);
    let lado = 0; if (novo(B.ESQ) || (lx < -.6 && !(antesB.lx < -.6))) lado = -1; if (novo(B.DIR) || (lx > .6 && !(antesB.lx > .6))) lado = 1;
    if (lado) ajustar(lado);
    if (novo(B.A)) confirmar();
    if (novo(B.B) || (novo(B.START) && ui === 'pausa')) voltar();
    antesB.lx = lx;
  }
  for (const key in k) { if (k[key]) keys[key] = true; else if (padSet[key]) keys[key] = false; padSet[key] = k[key]; }
  const lxs = antesB.lx, rxs = antesB.rx, rys = antesB.ry; antesB = g.buttons.map((x, i) => b(i)); antesB.lx = lxs; antesB.rx = rxs; antesB.ry = rys;
}
// teclas "de verdade" disparadas pelo controle e pelo toque: o motor recebe o mesmo aperta/solta do teclado
const segPad = {};
function apertarTecla(code) { try { dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true, cancelable: true })); } catch (e) { C.keys[code] = true; C.onKey(fake(code)); } }
function soltarTecla(code) { try { dispatchEvent(new KeyboardEvent('keyup', { code, key: code, bubbles: true, cancelable: true })); } catch (e) { C.keys[code] = false; } }
function segurarBotao(code, on) {
  if (on && !segPad[code]) { segPad[code] = true; apertarTecla(code); }
  else if (!on && segPad[code]) { segPad[code] = false; soltarTecla(code); }
}
function soltarTodosPad() { for (const c in segPad) if (segPad[c]) segurarBotao(c, false); }
// agarrão: cada aperto (E, A, toque em Usar) ou sacudida enche a mesma barra de soltura do mouse
function puxar(v) { const AG = C && C.AG; if (!AG || !C.M || C.M.state !== 'agarra' || !(v > 0)) return; AG.sacode += v; mostrarSoltura(); }
function mostrarSoltura() {
  const AG = C.AG, el = $('#pl-soltar'); if (!el || !AG) return;
  const k = clamp(AG.sacode / 1400, 0, 1); el.hidden = false; el.firstChild.style.width = (k * 100).toFixed(0) + '%';
}
function dicaAgarrao() {
  const t = toque ? 'Toque em Usar sem parar (ou arraste o dedo) para se soltar!' : padAtivo ? 'Aperte A sem parar (ou sacuda o analógico) para se soltar!' : O.soltar === 'tecla' ? 'Aperte E sem parar para se soltar!' : 'Sacuda o mouse para se soltar!';
  C.toast(t);
}
const TELAS = ['#lapide', '#portal', '#calibra', '#plat-opcoes', '#opcoes', '#keypad', '#note', '#painel', '#pause', '#death', '#escolha', '#ending', '#diario', '#title', '#aviso-mobile'];
function telaAtual() { for (const s of TELAS) { const el = $(s); if (el && !el.hidden && el.getClientRects().length) return el; } return null; }
function focaveis() { const t = telaAtual(); if (!t) return []; return [...t.querySelectorAll('button, input, select')].filter(el => !el.disabled && el.getClientRects().length && !el.closest('[hidden]')); }
function focar(d) {
  const l = focaveis(); if (!l.length) return;
  const i = l.indexOf(document.activeElement);
  const n = i < 0 ? (d > 0 ? 0 : l.length - 1) : (i + d + l.length) % l.length;
  l[n].focus(); if (l[n].scrollIntoView) l[n].scrollIntoView({ block: 'nearest' });
}
function ajustar(d) {
  const el = document.activeElement; if (!el) return;
  if (el.type === 'range') { const st = +el.step || 1; el.value = clamp(+el.value + d * st, +el.min, +el.max); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
  else if (el.tagName === 'SELECT') { el.selectedIndex = clamp(el.selectedIndex + d, 0, el.options.length - 1); el.dispatchEvent(new Event('change', { bubbles: true })); }
  else if (el.closest && el.closest('#diario nav')) focar(d);
}
function confirmar() {
  const el = document.activeElement, ui = C.ui;
  if (ui === 'dialogo') { C.onKey(fake('KeyE')); return; }
  if (ui === 'nota') { C.onKey(fake('Escape')); return; }
  if (el && el !== document.body && focaveis().includes(el)) { el.click(); return; }
  focar(1);
}
function voltar() {
  const ui = C.ui;
  if ($('#lapide') && !$('#lapide').hidden) { P2.fecharLapide(); return; }
  if (!$('#plat-opcoes').hidden) { fecharOpcoes(); return; }
  if (!$('#calibra').hidden) { $('#cal-ok').click(); return; }
  if (!$('#painel').hidden) { $('#pn-voltar').click(); return; }
  if (ui === 'pausa') { C.fecharPausa(); return; }
  if (ui === 'diario' || ui === 'nota' || ui === 'teclado') { C.onKey(fake('Escape')); return; }
  if (ui === 'dialogo') C.onKey(fake('KeyE'));
}

// =====================================================================
// TOQUE (celular e tablet)
// =====================================================================
let stick = null, olho = null;
function ativarToque() {
  if (toque) return;
  toque = true; document.body.classList.add('toque');
  if (O.qual == null) { O.qual = 'media'; salvar(); aplicarQual(); }
  montarToque();
}
function telaCheia() {
  const d = document.documentElement;
  try { if (!document.fullscreenElement && d.requestFullscreen) { const p = d.requestFullscreen({ navigationUI: 'hide' }); if (p && p.then) p.then(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }).catch(() => {}); } else if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
}
function montarToque() {
  if ($('#toque')) return;
  const el = document.createElement('div'); el.id = 'toque'; el.hidden = true;
  el.innerHTML = `<div id="tq-zona-andar"><div id="tq-base"><i id="tq-pino"></i></div></div><div id="tq-zona-olhar"></div>
  <div id="tq-bts">
    <button data-k="KeyE" class="tq-grande" id="tq-usar">Usar</button>
    <button data-k="KeyC" id="tq-agachar">Agachar</button><button data-k="KeyF" id="tq-lanterna">Lanterna</button>
    <button data-k="Space" id="tq-folego">Prender fôlego</button><button data-k="KeyG" id="tq-garrafa">Garrafa</button>
    <button data-k="KeyR" id="tq-pilha">Pilha</button><button data-k="KeyH" id="tq-curativo">Curativo</button>
    <button data-k="KeyQ" id="tq-atras">Olhar atrás</button>
  </div>
  <div id="tq-espiar"><button data-k="KeyZ">◂ Espiar</button><button data-k="KeyX">Espiar ▸</button></div>
  <div id="tq-topo"><button data-k="KeyO">Objetivo</button><button data-k="Tab">Diário</button><button data-acao="pausa">Pausa</button></div>`;
  document.body.appendChild(el);
  el.querySelectorAll('#toque button').forEach(bt => {
    const k = bt.dataset.k;
    // cada botão aperta e solta a tecla de verdade: segurar (pilha, curativo, garrafa) e "alternar" das Opções funcionam como no teclado
    const ini = e => { e.preventDefault(); e.stopPropagation(); bt.classList.add('on'); vibrar(0, .2, 12);
      if (bt.dataset.acao === 'pausa') { C.abrirPausa(); return; }
      if (k === 'KeyE' && C.M && C.M.state === 'agarra') { puxar(200); return; }
      apertarTecla(k); };
    const fim = e => { e.preventDefault(); bt.classList.remove('on'); if (k && !bt.dataset.acao) soltarTecla(k); };
    bt.addEventListener('touchstart', ini, { passive: false }); bt.addEventListener('touchend', fim, { passive: false }); bt.addEventListener('touchcancel', fim, { passive: false });
    bt.addEventListener('contextmenu', e => e.preventDefault());
  });
  aplicarToqueOpcoes(); P3.montarToque(el);
  const zA = $('#tq-zona-andar'), zO = $('#tq-zona-olhar'), base = $('#tq-base'), pino = $('#tq-pino');
  zA.addEventListener('touchstart', e => { e.preventDefault(); const t = e.changedTouches[0]; stick = { id: t.identifier, x: t.clientX, y: t.clientY, dx: 0, dy: 0 }; base.style.left = t.clientX + 'px'; base.style.top = t.clientY + 'px'; base.classList.add('on'); }, { passive: false });
  zO.addEventListener('touchstart', e => { e.preventDefault(); const t = e.changedTouches[0]; olho = { id: t.identifier, x: t.clientX, y: t.clientY }; }, { passive: false });
  addEventListener('touchmove', e => {
    for (const t of e.changedTouches) {
      if (stick && t.identifier === stick.id) { const R = 52; let dx = t.clientX - stick.x, dy = t.clientY - stick.y; const l = Math.hypot(dx, dy); if (l > R) { dx = dx / l * R; dy = dy / l * R; } stick.dx = dx / R; stick.dy = dy / R; stick.l = Math.min(1, l / R); pino.style.transform = `translate(${dx}px,${dy}px)`; }
      if (olho && t.identifier === olho.id) {
        const dx = t.clientX - olho.x, dy = t.clientY - olho.y, k = .0042 * (+O.tqSens || 1);
        if (C.M && C.M.state === 'agarra') puxar((Math.abs(dx) + Math.abs(dy)) * 1.5); // arrastar o dedo também solta do agarrão
        olhar(dx * k, dy * k); olho.x = t.clientX; olho.y = t.clientY;
      }
    }
  }, { passive: true });
  const solta = e => { for (const t of e.changedTouches) { if (stick && t.identifier === stick.id) { stick = null; if (C.P.mover && C.P.mover.de === 'toque') C.P.mover = null; pino.style.transform = ''; base.classList.remove('on'); for (const k of ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'ShiftLeft', 'AltLeft']) C.keys[k] = false; } if (olho && t.identifier === olho.id) olho = null; } };
  addEventListener('touchend', solta); addEventListener('touchcancel', solta);
}
function toqueFrame(dt) {
  if (!toque) return;
  const el = $('#toque'); if (!el) return;
  const S = C.S, mostra = C.mode === 'jogo' && !C.ui && S && !S.dead && !S.fim;
  if (el.hidden === mostra) el.hidden = !mostra;
  if (stick && mostra) {
    const k = C.keys, l = stick.l || 0; k.KeyW = stick.dy < -.15; k.KeyS = stick.dy > .15; k.KeyA = stick.dx < -.15; k.KeyD = stick.dx > .15; k.ShiftLeft = l > .96 && stick.dy < -.5;
    // direção contínua: nada de 8 direções travadas; a velocidade e o barulho crescem com o quanto se empurra
    C.P.mover = l > .08 ? { x: stick.dx, y: stick.dy, l, de: 'toque' } : null;
    k.AltLeft = l > .3 && l < .62; // empurrar pouco o analógico anda devagar, quase sem barulho
    $('#tq-base').classList.toggle('devagar', !!k.AltLeft);
  }
  document.body.classList.toggle('jogando', !!mostra);
  P3.toqueFrame(dt || .016, mostra);
  if (!mostra) return;
  // botões contam o estado: Usar acende quando há algo, Agachar e Lanterna mostram se estão ligados, itens mostram quantos sobram
  const pr = $('#prompt'), inv = S.inv || {};
  const liga = (id, on) => { const b = document.getElementById(id); if (b) b.classList.toggle('ativo', !!on); };
  liga('tq-usar', pr && pr.innerHTML !== '' || S.hidden); liga('tq-agachar', C.P.crouch); liga('tq-lanterna', S.flashOn);
  const conta = (id, nome, n) => { const b = document.getElementById(id); if (!b) return; const t = n > 0 ? `${nome} ${n}` : nome; if (b.textContent !== t) b.textContent = t; b.classList.toggle('vazio', !(n > 0)); };
  conta('tq-garrafa', 'Garrafa', inv.garrafas | 0); conta('tq-pilha', 'Pilha', inv.pilhas | 0); conta('tq-curativo', 'Curativo', inv.kits | 0);
  const lf = document.getElementById('tq-lanterna'); if (lf) lf.classList.toggle('vazio', !inv.lanterna);
  const esp = $('#tq-espiar'); if (esp && esp.hidden === !!S.hidden) esp.hidden = !S.hidden;
}
function aplicarToqueOpcoes() {
  const el = $('#toque'); if (!el) return;
  el.dataset.tam = O.tqTam; el.style.setProperty('--tq-op', clamp(+O.tqOpac || .85, .25, 1));
  el.classList.toggle('canhoto', !!O.tqCanhoto); document.body.classList.toggle('tq-canhoto', !!O.tqCanhoto);
}

// =====================================================================
// PAUSA, FOCO E ATALHOS PERIGOSOS
// =====================================================================
function limparTeclas() { if (!C) return; C.P.mover = null; for (const c in segPad) segPad[c] = false; trava = null; for (const k in C.keys) C.keys[k] = false; C.P.sprinting = false; if (stick) stick = null; }

// ---- "Ações longas: tocar para começar e parar": forçar porta, cadeado, válvulas, cavar, sino, curativo, sacudir a lanterna
// O tempo e o barulho são os mesmos; só some o esforço de manter a tecla apertada.
let trava = null; // { code, visto }
function travaPode(code) {
  const P = C.P;
  if (code === 'KeyE') { const pr = $('#prompt'); return !!(pr && pr.querySelector('.dur')); }
  if (code === 'KeyH') return P.curaT > 0;
  if (code === 'KeyR') return P.sacudirT > 0;
  return false;
}
function soltarTrava() { if (!trava) return; const c = trava.code; trava = null; if (C && !segPad[c]) C.keys[c] = false; }
function travaFrame() {
  if (!trava) return;
  if (!emJogoAtivo() || O.acoes !== 'tocar') { soltarTrava(); return; }
  const h = $('#hold'), vis = !!(h && !h.hidden);
  if (trava.code === 'KeyE') {
    if (vis) trava.visto = true;
    trava.idade = (trava.idade || 0) + 1;
    // terminou (o arco sumiu), saiu de perto ou o alvo mudou: solta sozinho
    if ((trava.visto && !vis) || (!vis && !travaPode('KeyE') && trava.idade > 2)) { soltarTrava(); return; }
  } else if (!travaPode(trava.code)) { soltarTrava(); return; }
  C.keys[trava.code] = true;
}
function travaTecla(e) {
  if (O.acoes !== 'tocar' || !emJogoAtivo() || !['KeyE', 'KeyH', 'KeyR'].includes(e.code)) return;
  if (trava && trava.code === e.code) { soltarTrava(); C.keys[e.code] = false; return; }
  if (travaPode(e.code)) {
    trava = { code: e.code, visto: false, idade: 0 };
    if (!dicaTravaDada) { dicaTravaDada = true; C.toast('Ação longa em andamento: aperte ' + (e.code === 'KeyE' ? (padAtivo ? 'A' : 'E') : e.code === 'KeyH' ? 'H' : 'R') + ' de novo para parar.'); }
  }
}
let dicaTravaDada = false;
// setas também andam durante o jogo (jogar com uma mão ou num teclado diferente)
const SETAS = { ArrowUp: 'KeyW', ArrowDown: 'KeyS', ArrowLeft: 'KeyA', ArrowRight: 'KeyD' };
const setaOn = {};
function emJogoAtivo() { const S = C && C.S; return C && C.mode === 'jogo' && !C.ui && S && !S.dead && !S.fim; }
let tituloBase = document.title;
function tituloAba() {
  const S = C.S;
  let t = tituloBase;
  if (window.__emergencia) t = 'Trabalho de Ciências - O Ciclo da Água';
  else if (document.hidden && C.mode === 'jogo' && S && !S.fim) t = 'Lia... volte.';
  else if (C.ui === 'pausa') t = 'Pausa · ' + tituloBase;
  else if (C.mode === 'jogo' && S && C.R.capitulos[S.chapter]) t = C.R.capitulos[S.chapter].titulo.split(' — ')[0] + ' · ' + tituloBase;
  if (document.title !== t) document.title = t;
}
function instalarFoco() {
  // captura (antes do motor): lápide aberta, agarrão com "apertar E" e setas andando
  addEventListener('keydown', e => {
    const lp = $('#lapide');
    if (lp && !lp.hidden) { e.stopImmediatePropagation(); if (e.code === 'Escape' || e.code === 'Backspace') { e.preventDefault(); P2.fecharLapide(); } else if (e.code.startsWith('Arrow') || e.code === 'Enter' || e.code === 'Space') { if (e.code.startsWith('Arrow')) { e.preventDefault(); focar(e.code === 'ArrowUp' || e.code === 'ArrowLeft' ? -1 : 1); } } return; }
    if (C.M && C.M.state === 'agarra' && e.code === 'KeyE' && emJogoAtivo() && (O.soltar === 'tecla' || !e.isTrusted)) {
      e.stopImmediatePropagation(); e.preventDefault(); if (!e.repeat) puxar(200); return;
    }
    if (C.ui === 'morte' && e.code === 'KeyL' && !$('#death').hidden && !e.repeat) { e.stopImmediatePropagation(); P2.abrirLapide('morte'); return; }
    if (O.setas && SETAS[e.code] && emJogoAtivo()) { e.preventDefault(); setaOn[e.code] = true; C.keys[SETAS[e.code]] = true; }
  }, true);
  addEventListener('keyup', e => { if (SETAS[e.code] && setaOn[e.code]) { setaOn[e.code] = false; C.keys[SETAS[e.code]] = false; } });
  document.addEventListener('visibilitychange', () => {
    limparTeclas();
    if (document.hidden) {
      if (emJogoAtivo()) C.abrirPausa();
      if (C.mode !== 'titulo') volume(0, .2);
      salvarAuto();
    } else if (C.ui !== 'pausa' && C.ui !== 'morte') volume(C.OPT.vol, .8);
    tituloAba();
  });
  document.addEventListener('pointerlockchange', () => { if (!document.pointerLockElement) limparTeclas(); });
  addEventListener('beforeunload', e => {
    if (robo || window.__teste || C.mode !== 'jogo' || !C.S || C.S.fim) return;
    salvarAuto();
    e.preventDefault(); e.returnValue = '';
  });
  addEventListener('contextmenu', e => { if (C.mode !== 'titulo') e.preventDefault(); });
  addEventListener('keydown', e => {
    if (e.isTrusted && padAtivo && !e.code.startsWith('Arrow')) setPad(false);
    if (!e.repeat) travaTecla(e);
    if (e.code !== 'Escape' && e.code !== 'KeyP' && !e.ctrlKey && !e.metaKey && e.code !== 'Tab' && !e.code.startsWith('Arrow')) return;
    // atalhos do navegador que tiram o jogador do jogo sem querer (Ctrl+W não pode ser bloqueado; por isso o agachar saiu do Ctrl)
    if ((e.ctrlKey || e.metaKey) && C.mode === 'jogo' && /^Key[SDFPUHJOGRE]$/.test(e.code)) e.preventDefault();
    if (e.code.startsWith('Arrow') && telaAtual() && (C.mode !== 'jogo' || C.ui)) { if (e.code === 'ArrowUp' || e.code === 'ArrowDown') { const el = document.activeElement; if (!(el && (el.tagName === 'SELECT' || el.type === 'range'))) { e.preventDefault(); focar(e.code === 'ArrowUp' ? -1 : 1); } } return; }
    if (e.repeat) return;
    if (C.ui === 'pausa' && $('#plat-opcoes').hidden && (!$('#opcoes') || $('#opcoes').hidden) && (e.code === 'KeyP' || e.code === 'Escape')) { e.preventDefault(); C.fecharPausa(); }
    else if (!$('#plat-opcoes').hidden && e.code === 'Escape') fecharOpcoes();
    else if (e.code === 'KeyP' && emJogoAtivo()) { C.unlock(); C.abrirPausa(); }
  });
  addEventListener('mousemove', e => { if (padAtivo && (Math.abs(e.movementX) + Math.abs(e.movementY) > 4)) setPad(false); });
  addEventListener('touchstart', () => { setPad(false); if (!toque) ativarToque(); }, { passive: true, capture: true });
  addEventListener('gamepadconnected', e => { setPad(true); C.toast('Controle conectado. A interage, B agacha, X lanterna, Y diário, START pausa.'); aviso('Controle conectado: use o direcional e A para escolher.'); });
  addEventListener('gamepaddisconnected', () => { setPad(false); limparTeclas(); if (emJogoAtivo()) C.abrirPausa(); });
  // telas: som e foco ao abrir/fechar
  const obs = (sel, fn) => { const el = $(sel); if (el) new MutationObserver(() => fn(!el.hidden)).observe(el, { attributes: true, attributeFilter: ['hidden'] }); };
  obs('#pause', on => {
    if (on) { volume(C.OPT.vol * .22, .4); limparTeclas(); setTimeout(() => { if (padAtivo || document.activeElement === document.body) $('#p-voltar').focus(); }, 30); }
    else if (C.mode === 'jogo' && !document.hidden) { graca = 1; volume(C.OPT.vol, 1); }
    tituloAba();
  });
  obs('#death', on => { if (on) { volume(C.OPT.vol * .3, 1.5); setTimeout(() => { if (padAtivo) $('#dt-retry').focus(); }, 30); } else { volume(C.OPT.vol, .6); graca = 1; } });
  obs('#ending', on => { if (on) { apagarAuto(); prepararFinal(); } });
  obs('#title', on => { if (on) { atualizarContinuar(); limparTeclas(); } });
}

// =====================================================================
// OPÇÕES
// =====================================================================
const LINHAS = [
  ['Imagem'],
  ['qual', 'Qualidade', 'sel', [['alta', 'Alta'], ['media', 'Média'], ['baixa', 'Baixa (notebook fraco)'], ['minima', 'Mínima (fita velha, PC muito fraco)']]],
  ['resDin', 'Resolução automática', 'chk'],
  ['lim30', 'Limitar a 30 quadros (esquenta menos)', 'chk'],
  ['fps', 'Mostrar quadros por segundo', 'chk'],
  ['menuLeve', 'Menus leves (desenha menos na pausa)', 'chk'],
  ['Controles'],
  ['acoes', 'Ações longas (forçar, cavar, sino...)', 'sel', [['segurar', 'Segurar a tecla'], ['tocar', 'Tocar para começar e parar']]],
  ['soltar', 'Soltar do agarrão', 'sel', [['mouse', 'Sacudir o mouse'], ['tecla', 'Apertar E várias vezes']]],
  ['setas', 'Setas também andam', 'chk'],
  ['giroTec', 'Girar a câmera pelo teclado (J L, I K)', 'chk'],
  ['giroVel', 'Velocidade do giro pelo teclado', 'rng', [.4, 2.5, .1]],
  ['mouseCru', 'Mouse cru (sem a aceleração do sistema)', 'chk'],
  ['arrastar', 'Modo arrastar (olhar sem prender o mouse)', 'chk'],
  ['cheiaJogo', 'Tela cheia ao começar a jogar', 'chk'],
  ['padSens', 'Sensibilidade do controle', 'rng', [.4, 2.5, .1]],
  ['padZona', 'Zona morta do analógico', 'rng', [.05, .4, .01]],
  ['vibrar', 'Vibração', 'chk'],
  ['vibMundo', 'Vibrar nos avisos (sino, luzes, coração)', 'chk'],
  ['Toque (celular)'],
  ['tqTam', 'Tamanho dos botões', 'sel', [['p', 'Pequenos'], ['m', 'Médios'], ['g', 'Grandes']]],
  ['tqOpac', 'Opacidade dos botões', 'rng', [.25, 1, .05]],
  ['tqSens', 'Sensibilidade do dedo', 'rng', [.4, 2.5, .1]],
  ['tqCanhoto', 'Canhoto (troca os lados)', 'chk'],
  ['tqLimpo', 'Tela limpa: os botões só acendem quando servem', 'chk'],
  ['giro', 'Mirar inclinando o celular (giroscópio)', 'chk'],
  ['giroSens', 'Sensibilidade do giroscópio', 'rng', [.3, 2.5, .1]],
  ['sacudir', 'Sacudir o celular: lanterna sem pilha e agarrão', 'chk'],
  ['Conforto'],
  ['bob', 'Balanço da câmera ao andar', 'chk'],
  ['tremor', 'Tremor da câmera', 'rng', [0, 1, .1]],
  ['Acessibilidade'],
  ['dalt', 'Daltonismo (cores das luzes)', 'sel', [['nao', 'Desligado'], ['protan', 'Protan (vermelho)'], ['deutan', 'Deutan (verde)'], ['tritan', 'Tritan (azul)']]],
  ['avisoVisual', 'Aviso visual de sons fortes (borda da tela)', 'chk'],
  ['ritmo', 'Velocidade do jogo (reflexo mais lento)', 'sel', [['1', '100% (normal)'], ['0.9', '90%'], ['0.8', '80%']]],
  ['Gravação'],
  ['clipe', 'Gravador de sustos: guarda os últimos segundos (F8 salva)', 'chk'],
  ['Som'],
  ['fone', 'Estou de fone (som 3D)', 'chk'],
  ['mono', 'Som mono (um ouvido só)', 'chk'],
  ['indic', 'Indicador visual de perigo', 'chk']
];
function montarOpcoes() {
  const el = document.createElement('div'); el.id = 'plat-opcoes'; el.className = 'screen painel'; el.hidden = true;
  let h = '<div class="wrap"><h2>Desempenho e conforto</h2><div class="op-grade">';
  for (const [id, nome, tipo, arg] of LINHAS) {
    if (!nome) { h += `<h3>${id}</h3>`; continue; }
    if (tipo === 'chk') h += `<label class="op"><span>${nome}</span><input type="checkbox" data-op="${id}"></label>`;
    else if (tipo === 'rng') h += `<label class="op"><span>${nome} <em data-val="${id}"></em></span><input type="range" data-op="${id}" min="${arg[0]}" max="${arg[1]}" step="${arg[2]}"></label>`;
    else h += `<label class="op"><span>${nome}</span><select data-op="${id}">${arg.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</select></label>`;
  }
  h += `</div><div class="op-bts"><button class="btn" id="pop-cheia">Tela cheia</button><button class="btn" id="pop-calibrar">Testar imagem e som</button><button class="btn" id="pop-padrao">Restaurar padrão</button><button class="btn" id="pop-voltar">Voltar</button></div>
  <div class="op-ajuda">Teclado: WASD ou setas andar · SHIFT correr · ALT devagar · C agachar · E interagir · F lanterna · R pilha · H curativo · G garrafa · ESPAÇO prender a respiração · Q olhar atrás · TAB diário · P ou ESC pausa<br>Controle: analógico esquerdo anda · direito olha · RT correr · LT devagar · A interagir (segure) · B agachar · X lanterna · Y diário · LB garrafa (segure: mirar) · RB prender a respiração · R3 olhar atrás · ↑ pilha (segure: sacudir) · ↓ curativo (segure) · ← objetivo · → responder · escondida: ← → espiam · na nota: X lê em voz alta, Y vira a folha · START pausa</div></div>`;
  el.innerHTML = h; document.body.appendChild(el);
  el.querySelectorAll('[data-op]').forEach(inp => {
    const id = inp.dataset.op;
    const muda = () => { O[id] = inp.type === 'checkbox' ? inp.checked : inp.type === 'range' ? +inp.value : inp.value; salvar(); aplicarOpcoes(id); };
    inp.addEventListener(inp.type === 'range' ? 'input' : 'change', muda);
  });
  $('#pop-voltar').onclick = fecharOpcoes;
  $('#pop-cheia').onclick = telaCheia;
  $('#pop-calibrar').onclick = () => { fecharOpcoes(); abrirCalibra(null); };
  $('#pop-padrao').onclick = () => { const q = O.qual, cal = O.calibrado, tut = O.tqTut, fo = O.fotos; Object.assign(O, PADRAO, { qual: q, calibrado: cal, tqTut: tut, fotos: fo, teclas: {} }); salvar(); aplicarOpcoes(); syncOpcoes(); };
}
let opDe = null;
function abrirOpcoes() {
  opDe = !$('#title').hidden ? 'titulo' : 'pausa';
  if (opDe === 'titulo') $('#title').hidden = true; else $('#pause').hidden = true;
  syncOpcoes(); $('#plat-opcoes').hidden = false;
  setTimeout(() => { const f = focaveis(); if (padAtivo && f[0]) f[0].focus(); }, 30);
}
function fecharOpcoes() {
  $('#plat-opcoes').hidden = true; P3.fecharOpcoes();
  if (opDe === 'titulo' && C.mode === 'titulo') $('#title').hidden = false;
  else if (C.ui === 'pausa') $('#pause').hidden = false;
  opDe = null;
}
function syncOpcoes() {
  document.querySelectorAll('#plat-opcoes [data-op]').forEach(inp => { const v = O[inp.dataset.op]; if (inp.type === 'checkbox') inp.checked = !!v; else inp.value = v == null ? 'alta' : v; });
  document.querySelectorAll('#plat-opcoes [data-val]').forEach(e => { const id = e.dataset.val, v = O[id]; e.textContent = id === 'fov' ? v + '°' : id === 'tremor' || id === 'tqOpac' || id === 'padZona' ? Math.round(v * 100) + '%' : (+v).toFixed(2).replace(/\.?0+$/, '') + (id === 'padSens' || id === 'tqSens' || id === 'giroVel' || id === 'giroSens' ? 'x' : ''); });
}
function aplicarOpcoes(id) {
  const b = document.body;
  if (C) {
    if (!id || id === 'qual' || id === 'resDin') aplicarQual();
    if (!id || id === 'mono') aplicarMono();
    if (!id || id === 'dalt') P2.opcoes(id);
    if (!id || id === 'acoes') soltarTrava();
    if (!id || id === 'qual') { corte = 0; corteT = 0; aplicarCorte(); }
    P3.opcoes(id);
  }
  if (!id || id.startsWith('tq')) aplicarToqueOpcoes();
  const f = $('#fps'); if (f) f.hidden = !O.fps;
  syncOpcoes();
}

// =====================================================================
// CALIBRAGEM: brilho e fone (primeiro jogo)
// =====================================================================
function montarCalibra() {
  const el = document.createElement('div'); el.id = 'calibra'; el.className = 'screen'; el.hidden = true;
  el.innerHTML = `<h2>Antes de entrar</h2>
  <p>Apague a luz. Ajuste o brilho até o sino da <b>direita</b> quase sumir no escuro.</p>
  <canvas id="cal-sinos" width="420" height="140"></canvas>
  <label class="op">Brilho <input type="range" id="cal-brilho" min=".7" max="1.6" step=".05"></label>
  <p>Este jogo se joga pelo ouvido. Coloque o fone e toque o teste: o estalo tem que dar a volta na sua cabeça.</p>
  <div><button class="btn" id="cal-som">Tocar o teste de som</button></div>
  <label class="op">Volume <input type="range" id="cal-vol" min="0" max="1" step="0.05"></label>
  <label class="op"><input type="checkbox" id="cal-fone"> Estou de fone</label>
  <button class="btn" id="cal-ok">Estou pronta</button>`;
  document.body.appendChild(el);
  $('#cal-brilho').oninput = e => { C.OPT.brilho = +e.target.value; C.renderer.toneMappingExposure = C.OPT.brilho; if (C.salvarOpt) C.salvarOpt(); desenharSinos(); };
  $('#cal-vol').oninput = e => C.setOpt('vol', e.target.value);
  $('#cal-fone').onchange = e => { O.fone = e.target.checked; salvar(); syncOpcoes(); };
  $('#cal-som').onclick = testeSom;
}
let calCb = null;
function abrirCalibra(cb) {
  calCb = cb; $('#title').hidden = true;
  $('#cal-brilho').value = +C.OPT.brilho || 1.1; $('#cal-vol').value = C.OPT.vol; $('#cal-fone').checked = !!O.fone;
  $('#calibra').hidden = false; desenharSinos();
  $('#cal-ok').onclick = () => { $('#calibra').hidden = true; O.calibrado = true; salvar(); const f = calCb; calCb = null; if (f) f(); else if (C.mode === 'titulo') $('#title').hidden = false; };
  setTimeout(() => { if (padAtivo) $('#cal-brilho').focus(); }, 30);
}
function desenharSinos() {
  const cv = $('#cal-sinos'); if (!cv) return; const g = cv.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height);
  // o canvas 2D não passa pelo tone mapping: aproxima o efeito do brilho com o mesmo fator
  const k = (+C.OPT.brilho || 1.1) / 1.1;
  [[70, 42], [210, 24], [350, 12]].forEach(([x, tom]) => {
    const c = Math.round(clamp(tom * k * k, 0, 255)); g.fillStyle = `rgb(${c},${c},${Math.round(c * .95)})`;
    g.beginPath(); g.moveTo(x - 34, 112); g.quadraticCurveTo(x - 30, 30, x, 26); g.quadraticCurveTo(x + 30, 30, x + 34, 112); g.closePath(); g.fill();
    g.fillRect(x - 40, 110, 80, 7); g.beginPath(); g.arc(x, 124, 7, 0, 7); g.fill(); g.fillRect(x - 3, 14, 6, 14);
  });
}
function testeSom() {
  C.iniciarAudio(); const ac = C.AC; if (!ac) return;
  const L = ac.listener, lx = L.positionX ? L.positionX.value : 0, ly = L.positionY ? L.positionY.value : 1.6, lz = L.positionZ ? L.positionZ.value : 0;
  const fx = L.forwardX ? L.forwardX.value : 0, fz = L.forwardZ ? L.forwardZ.value : -1, base = Math.atan2(fx, fz);
  const t0 = ac.currentTime + .1;
  for (let i = 0; i <= 16; i++) {
    const a = base + i / 16 * Math.PI * 2, t = t0 + i * .16;
    const p = ac.createPanner(); p.panningModel = O.fone ? 'HRTF' : 'equalpower'; p.refDistance = 1;
    p.positionX.value = lx + Math.sin(a) * 1.5; p.positionY.value = ly; p.positionZ.value = lz + Math.cos(a) * 1.5;
    const g = ac.createGain(), o = ac.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(1800, t); o.frequency.exponentialRampToValueAtTime(400, t + .03);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.5, t + .002); g.gain.exponentialRampToValueAtTime(.0001, t + .05);
    o.connect(g); g.connect(p); p.connect(C.master); o.onended = () => { o.disconnect(); g.disconnect(); p.disconnect(); };
    o.start(t); o.stop(t + .06);
  }
}

// =====================================================================
// PORTAL DO TÍTULO (libera o áudio com um clique e cria clima no menu)
// =====================================================================
function montarPortal() {
  const el = document.createElement('div'); el.id = 'portal'; el.className = 'screen';
  el.innerHTML = `<div class="pt-fone">use fones · apague a luz</div><div class="pt-entrar">Clique para ouvir a chuva</div><small>ou aperte qualquer tecla</small>`;
  document.body.appendChild(el);
  el.addEventListener('click', fecharPortal);
  addEventListener('keydown', function k(e) { if (!el.hidden && C.mode === 'titulo') { e.preventDefault(); fecharPortal(); } }, true);
}
function fecharPortal() { const el = $('#portal'); if (!el || el.hidden) return; el.hidden = true; C.iniciarAudio(); aplicarMono();
  // atalho "Continuar a noite" do aplicativo instalado
  if (/[?&]continuar=1/.test(location.search) && !$('#b-cont').hidden) { setTimeout(() => $('#b-cont').click(), 60); return; }
  setTimeout(() => { if (padAtivo || toque) { const b = $('#b-cont').hidden ? $('#b-novo') : $('#b-cont'); b.focus(); } }, 30); }

// =====================================================================
// COMPARTILHAR: resultado, desafio, aviso no celular
// =====================================================================
function textoResultado() {
  const S = C.S, R = C.R; let caps = {}; try { caps = JSON.parse(localStorage.getItem(C.CAPS_KEY)) || {}; } catch (e) {}
  const ranks = R.capitulos.map(c => (caps[c.id] && caps[c.id].rank) || '-');
  const linhaRanks = R.capitulos.map((c, i) => c.titulo.split(' — ')[0].replace('Prólogo', 'P') + ' ' + ranks[i]).join(' · ');
  const lore = Object.keys(S.notes || {}).length + Object.keys(S.fitas || {}).length, tot = R.notas.length + R.paginas.length + R.fitas.length;
  const min = Math.round((S.tempo || 0) / 60), tit = ($('#e-tit') && $('#e-tit').textContent) || '';
  const cod = ranks.map(r => /[SABC]/.test(r) ? r : 'C').join('') + '-' + (S.mortes || 0).toString(36) + '-' + Math.round(S.tempo || 0).toString(36);
  const url = location.origin + location.pathname + '?desafio=' + cod;
  return { url, texto: `A HORA DO SILÊNCIO — sobrevivi.\nFinal: ${tit}\nCapítulos: ${linhaRanks}\nMortes: ${S.mortes || 0} · Tempo: ${min} min · Segredos: ${lore}/${tot}\nConsegue melhor? Jogue de fone, no escuro.` };
}
async function copiar(t) {
  try { await navigator.clipboard.writeText(t); return true; } catch (e) {}
  try { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); const ok = document.execCommand('copy'); a.remove(); return ok; } catch (e) { return false; }
}
function feedback(bt, txt) { const o = bt.dataset.orig || bt.textContent; bt.dataset.orig = o; bt.textContent = txt; setTimeout(() => bt.textContent = o, 2200); }
function prepararFinal() {
  // o "Copiar resultado" já vem na página (o da progressão cuida dele); antes isso escondia o "Desafiar um amigo"
  if ($('#e-desafio')) return;
  const menu = $('#e-menu'); if (!menu) return;
  if (!$('#e-copiar')) {
    const a = document.createElement('button'); a.className = 'btn'; a.id = 'e-copiar'; a.textContent = 'Copiar resultado'; menu.before(a);
    a.onclick = async () => { const r = textoResultado(); feedback(a, await copiar(r.texto + '\n' + r.url) ? 'Copiado. Cole onde quiser.' : 'Não deu para copiar.'); };
  }
  const b = document.createElement('button'); b.className = 'btn'; b.id = 'e-desafio'; b.textContent = 'Desafiar um amigo';
  const l = document.createElement('button'); l.className = 'btn'; l.id = 'e-lapide'; l.textContent = 'Guardar lápide';
  menu.before(b, l); l.onclick = () => P2.abrirLapide('final');
  try { P4.aoFim(); } catch (e) {}
  b.onclick = async () => {
    const r = textoResultado();
    if (navigator.share) { try { await navigator.share({ title: 'A Hora do Silêncio', text: r.texto, url: r.url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    feedback(b, await copiar(r.texto + '\n' + r.url) ? 'Link do desafio copiado.' : 'Não deu para copiar.');
  };
}
function lerDesafio() {
  let d = null; try { d = new URLSearchParams(location.search).get('desafio'); } catch (e) {}
  if (!d || !/^[SABC]{1,8}-[0-9a-z]{1,4}-[0-9a-z]{1,6}$/.test(d)) return;
  const [rk, m, t] = d.split('-'), mortes = parseInt(m, 36), min = Math.round(parseInt(t, 36) / 60);
  const el = document.createElement('div'); el.id = 'desafio';
  el.textContent = `Alguém te desafiou: terminou com ${rk.split('').join(' ')} nos capítulos, ${mortes} ${mortes === 1 ? 'morte' : 'mortes'}, em ${min} min. Consegue melhor?`;
  $('#title').appendChild(el);
}
function avisoCelular() {
  const av = $('#aviso-mobile'); if (!av) return;
  av.innerHTML = `<div><p>A Hora do Silêncio é melhor no computador, com teclado, mouse e fone.</p><p>Dá para jogar no celular deitado, com controles de toque.</p>
  <button class="btn" id="am-jogar">Jogar com toque</button><button class="btn" id="am-link">Mandar o link para mim</button><small id="am-ok"></small></div>`;
  $('#am-jogar').onclick = () => { av.hidden = true; ativarToque(); telaCheia(); };
  $('#am-link').onclick = async () => {
    const url = location.origin + location.pathname;
    if (navigator.share) { try { await navigator.share({ title: 'A Hora do Silêncio', text: 'Jogar no computador, de fone e no escuro:', url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    $('#am-ok').textContent = await copiar(url) ? 'Link copiado. Mande para você mesmo.' : url;
  };
  const at = $('#aviso-toque'); if (at) { at.textContent = 'No celular: controles de toque na tela (deite o aparelho). Melhor ainda no computador, de fone.'; at.style.color = ''; }
}
// bateria fraca: sugere o modo leve (sem mudar nada sozinho)
function bateria() {
  if (robo || !navigator.getBattery) return;
  navigator.getBattery().then(bt => {
    let avisou = false;
    const ver = () => { if (avisou || bt.charging || bt.level > .2) return; if (O.qual === 'baixa' && O.lim30) return; avisou = true; const t = 'Bateria fraca: em Desempenho, Qualidade Baixa e "Limitar a 30 quadros" fazem ela durar mais.'; if (C.mode === 'jogo') C.toast(t); else aviso(t); };
    ver(); bt.addEventListener('levelchange', ver); bt.addEventListener('chargingchange', ver);
  }).catch(() => {});
}
function aviso(t) { const el = $('#t-aviso'); if (!el) return; el.textContent = t; el.hidden = false; clearTimeout(aviso.to); aviso.to = setTimeout(() => el.hidden = true, 7000); }

// =====================================================================
// API PARA O MOTOR
// =====================================================================
export const PLAT = {
  antialias: () => !['baixa', 'minima'].includes(O.qual || (toqueNativo ? 'media' : aparelho() === 'fraco' ? 'baixa' : 'alta')),
  invY: () => C && C.OPT.invY ? -1 : 1,
  fone: () => !!O.fone,
  clarao: () => C && +C.OPT.vFlash ? .35 : 1,
  pulso: () => pulsoV,
  grao: () => Q().grao,
  semMouse: () => toque || padAtivo || P3.semTrava(),
  semTrava: () => P3.semTrava(),
  travaOpcoes: () => P3.travaOpcoes(),
  pular(now) {
    // nos menus parados (pausa, diário, nota, morte, opções) o jogo desenha só 20 quadros por segundo: o notebook esfria
    if (P3.pular()) return true; // a janela da plateia não desenha o jogo
    let alvo = O.lim30 ? 30 : 0;
    if (O.menuLeve && C && !robo && !window.__teste && (['pausa', 'diario', 'nota', 'teclado', 'morte'].includes(C.ui) || !$('#plat-opcoes').hidden) && !P3.foto) alvo = 48;
    if (!alvo) return false; if (now - ultimoQuadro < alvo) return true; ultimoQuadro = now; return false;
  },
  agenda,
  aoMorrer() {
    fila.length = 0; limparTeclas(); vibrar(1, 1, 700);
    // a dica da morte pelo agarrão fala do jeito de se soltar que você está usando
    try { const dc = C.R.entidades.dicas_ctx; if (dc) dc.agarrao = toque ? 'Quando ele te agarrar, toque em Usar sem parar (ou arraste o dedo pela tela) para se soltar.' : padAtivo ? 'Quando ele te agarrar, aperte A sem parar ou sacuda o analógico direito para se soltar.' : O.soltar === 'tecla' ? 'Quando ele te agarrar, aperte E sem parar para se soltar.' : 'Quando ele te agarrar, sacuda o mouse com força para se soltar. (Em Desempenho > Controles dá para trocar por apertar E.)'; } catch (e) {}
    P2.morreu();
  },
  aoCarregar() { fila.length = 0; graca = 0; limparTeclas(); calmaT = 0; },
  antes(dt) {
    if (!C) return dt;
    pad(dt); toqueFrame(dt); travaFrame();
    // agarrão: dica do jeito certo de se soltar e a barra de soltura
    const agarrado = C.M && C.M.state === 'agarra' && emJogoAtivo();
    if (agarrado && !estavaAgarrada) { setTimeout(dicaAgarrao, 0); vibrar(1, .8, 500); }
    if (agarrado) mostrarSoltura(); else { const sb = $('#pl-soltar'); if (sb && !sb.hidden) sb.hidden = true; }
    estavaAgarrada = agarrado;
    let k = P3.antes(dt);
    if (graca > 0) { k = Math.max(.15, 1 - graca); graca -= dt; }
    if (emJogoAtivo()) rodarAgenda(dt * k);
    return dt * k;
  },
  depois(dt, ativo) {
    if (!C) return;
    const { camera, P, S, scene } = C;
    // câmera: balanço e tremor conforme as opções
    if (ativo && S && !S.hidden && !P.bloqueado && (!O.bob || O.tremor !== 1)) {
      const kk = C.keys, moving = kk.KeyW || kk.KeyS || kk.KeyA || kk.KeyD;
      const bobY = Math.sin(P.bob * 2) * (moving ? (P.sprinting ? .055 : .03) : 0), baseY = P.h - (P.naAgua ? .12 : 0);
      const shY = camera.position.y - baseY - bobY;
      camera.position.x = P.pos.x + (camera.position.x - P.pos.x) * O.tremor;
      camera.position.z = P.pos.z + (camera.position.z - P.pos.z) * O.tremor;
      camera.position.y = baseY + (O.bob ? bobY : 0) + shY * O.tremor;
      if (!O.bob) camera.rotation.z = S.fear > 85 ? camera.rotation.z * O.tremor : 0;
      else camera.rotation.z *= O.tremor;
    }
    // vinheta pulsando junto com o coração
    if (ativo && S && S.fear > 60) {
      const bpm = 55 + 95 * S.fear / 100, f0 = hbFase; hbFase = (hbFase + dt * bpm / 60) % 1;
      const p = Math.pow(Math.max(0, Math.sin(hbFase * Math.PI * 2)), 6);
      pulsoV = p * .14 * (S.fear - 60) / 40;
      if (hbFase < f0 && S.fear > 70) vibrar(.25 * (S.fear - 60) / 40, .1, 70);
    } else pulsoV = Math.max(0, pulsoV - dt);
    // dano: vibração
    if (S) { if (S.health < vidaAnt - 4 && !S.dead) vibrar(.9, .6, 380); vidaAnt = S.health; }
    // avisos do mundo na vibração: coração com o Inspetor a menos de 5 m, pulso duplo quando as luzes piscam (Procissão)
    if (ativo && S && !S.dead) {
      const dM = C.M.ativo ? Math.hypot(C.M.pos.x - C.P.pos.x, C.M.pos.z - C.P.pos.z) : 99;
      coracaoT -= dt;
      if (dM < 5 && coracaoT <= 0 && !(S.fear > 70)) { coracaoT = .55 + dM * .12; vibrarMundo(.18 + (5 - dM) * .05, .08, 60); setTimeout(() => vibrarMundo(.12, .05, 50), 160); }
      const pf = C.PROC.fase;
      if (pf === 'aviso' && procAnt !== 'aviso') { procPulso = 0; }
      if (pf === 'aviso') { procPulso -= dt; if (procPulso <= 0) { procPulso = 1.6; vibrarMundo(.6, .3, 90); setTimeout(() => vibrarMundo(.6, .3, 90), 200); borda(null, .45); } }
      procAnt = pf;
    }
    // névoa um pouco mais densa no modo leve (esconde a distância)
    if (Q().nevoa !== 1 && scene.fog && scene.fog.density !== fogAplicada) { scene.fog.density *= Q().nevoa; fogAplicada = scene.fog.density; }
    if (C.AC && !monoFeito) { monoFeito = true; aplicarMono(); }
    if (ativo) vigiarCalma(dt);
    atualizarIndicadores();
    const cs = $('#tq-pular'); if (cs) cs.hidden = C.mode !== 'cena';
    PLAT._fpsT = (PLAT._fpsT || 0) - dt;
    if (O.fps && PLAT._fpsT <= 0) { PLAT._fpsT = .5; const f = $('#fps'); if (f) f.textContent = Math.round(1000 / mediaMs) + ' qps · ' + mediaMs.toFixed(1) + ' ms · ' + prAtual.toFixed(2) + 'x · ' + Q().nome + (C.renderer.info ? ' · ' + C.renderer.info.render.calls + ' desenhos · ' + C.renderer.info.memory.geometries + ' geom. · ' + C.renderer.info.memory.textures + ' text.' : '') + (P3.poolInfo() ? ' · ' + P3.poolInfo() : '') + (corte ? ' · corte ' + corte + '/3' : ''); }
    if (C.W.grupo !== grupoAnt) { grupoAnt = C.W.grupo; P2.mapa(); P3.mapa(); try { P4.mapa(); } catch (e) {} }
    P3.depois(dt, ativo);
    P2.frame(dt, ativo);
    try { P4.frame(dt, ativo); } catch (e) {}
    PLAT._tabT = (PLAT._tabT || 0) - dt; if (PLAT._tabT <= 0) { PLAT._tabT = .5; tituloAba(); }
  },
  instalar(ctx) {
    C = ctx;
    const ld = $('#carregando'); if (ld) { ld.classList.add('saindo'); setTimeout(() => ld.remove(), 700); }
    // acessibilidade dos textos
    const aria = (s, a, v) => { const e = $(s); if (e) e.setAttribute(a, v); };
    aria('#sub', 'aria-live', 'polite'); aria('#toast', 'role', 'status'); aria('#dialogo', 'aria-live', 'polite'); aria('#c', 'aria-label', 'Visão do jogo');
    // elementos novos do HUD
    const hud = $('#hud');
    if (hud) {
      if (!$('#legsom')) { const ls = document.createElement('div'); ls.id = 'legsom'; ls.setAttribute('aria-live', 'polite'); hud.appendChild(ls); }
      const ind = document.createElement('div'); ind.id = 'indic'; ind.innerHTML = '<i></i><i></i><i></i>'; hud.appendChild(ind);
    }
    const fps = document.createElement('div'); fps.id = 'fps'; fps.hidden = true; document.body.appendChild(fps);
    const pul = document.createElement('button'); pul.id = 'tq-pular'; pul.className = 'btn'; pul.hidden = true; pul.textContent = 'Pular abertura ▸'; pul.title = 'Enter ou ESC';
    pul.onclick = () => C.onKey(fake('Enter')); document.body.appendChild(pul);
    const tav = document.createElement('div'); tav.id = 't-aviso'; tav.hidden = true; $('#title').appendChild(tav);
    const perdido = document.createElement('div'); perdido.id = 'perdido'; perdido.className = 'screen'; perdido.hidden = true;
    perdido.innerHTML = '<p>A placa de vídeo piscou e a imagem se perdeu.</p><button class="btn" id="pd-rec">Recarregar</button><small>Seu progresso foi salvo.</small>';
    document.body.appendChild(perdido); $('#pd-rec').onclick = () => location.reload();
    C.renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); salvarAuto(); perdido.hidden = false; });
    C.renderer.domElement.addEventListener('webglcontextrestored', () => { perdido.hidden = true; aplicarQual(); });
    // botões de opções no título e na pausa
    const bo = document.createElement('button'); bo.className = 'btn'; bo.id = 'b-opcoes'; bo.textContent = 'Desempenho'; $('#b-conq').after(bo); bo.onclick = abrirOpcoes;
    const po = document.createElement('button'); po.className = 'btn'; po.id = 'p-opcoes'; po.textContent = 'Desempenho'; $('#p-menu').before(po); po.onclick = abrirOpcoes;
    const aj = $('#pause .ajuda'); if (aj && !/P ou ESC/.test(aj.textContent)) aj.insertAdjacentText('beforeend', ' · P ou ESC volta ao jogo');
    const ctrl = document.querySelectorAll('#title .ctrl'); if (ctrl.length) ctrl[ctrl.length - 1].textContent += ' · P pausa · funciona com controle';
    montarOpcoes(); montarCalibra();
    // primeiro "Novo jogo": tela de brilho e fone
    $('#b-novo').addEventListener('click', e => {
      apagarAuto();
      // a calibragem do primeiro jogo é a de src/visual.js; esta fica em Desempenho > Testar imagem e som
    }, true);
    // "Continuar de onde parou" (salvamento leve mais recente que o checkpoint)
    $('#b-cont').addEventListener('click', e => {
      const a = autoValido(); if (!a) return;
      e.stopImmediatePropagation();
      C.iniciarAudio(); C.carregarSnap(a.auto); C.S._check = a.cp; $('#o-dif').value = C.S.dif; C.entrarJogo();
    }, true);
    // lote 2: aviso visual de sons, barra de soltura do agarrão, lápide, daltonismo, segredos de data
    const bd = document.createElement('div'); bd.id = 'pl-borda'; document.body.appendChild(bd);
    const sl = document.createElement('div'); sl.id = 'pl-soltar'; sl.hidden = true; sl.innerHTML = '<i></i><span>solte-se</span>'; document.body.appendChild(sl);
    P2 = instalarPlat2(C, { O, salvar, vibrar, aviso, copiar, feedback, focaveis, get padAtivo() { return padAtivo; }, get toque() { return toque; }, robo, qual: () => O.qual || 'alta' });
    P3 = instalarPlat3(C, { O, salvar, vibrar, aviso, copiar, feedback, olhar, puxar, apertarTecla, soltarTecla, volume, aplicarQual, aplicarOpcoes, syncOpcoes, emJogoAtivo, robo, qual: () => O.qual || 'alta', get toque() { return toque; }, get padAtivo() { return padAtivo; }, get stick() { return stick; } });
    P3.montarOpcoes($('#plat-opcoes .wrap'));
    try { P4 = instalarPlat4(C, { O, salvar, vibrar, copiar, feedback, robo, get padAtivo() { return padAtivo; }, get toque() { return toque; }, qual: () => O.qual || 'alta' }); } catch (e) {}
    if (P3.plateia) { const pt = $('#portal'); if (pt) pt.hidden = true; }
    const dm = $('#dt-menu'); if (dm) { const lb = document.createElement('button'); lb.className = 'btn'; lb.id = 'dt-lapide'; lb.textContent = 'Guardar lápide'; dm.before(lb); lb.onclick = () => P2.abrirLapide('morte'); }
    const tcl = $('#death .teclas'); if (tcl && !/lápide/.test(tcl.textContent)) tcl.textContent += ' · L guarda a lápide';
    embrulharSons(); instalarFoco(); aplicarOpcoes(); avisoCelular(); lerDesafio(); atualizarContinuar();
    bateria();
    if (O.qual) aplicarQual(); else { tetoPR = Math.min(devicePixelRatio || 1, 1.5); prAtual = tetoPR; }
    if (toqueNativo) ativarToque();
    if (!robo) montarPortal();
    addEventListener('resize', () => { const t = Math.min(devicePixelRatio || 1, Q().pr); if (t !== tetoPR) { tetoPR = t; prAtual = Math.min(prAtual, t); C.renderer.setPixelRatio(prAtual); } });
    requestAnimationFrame(medir);
    if ('serviceWorker' in navigator && !robo && location.protocol !== 'file:') { const reg = () => navigator.serviceWorker.register('sw.js').catch(() => {}); if (document.readyState === 'complete') reg(); else addEventListener('load', reg); }
    window.__plat = { O, aplicarOpcoes, salvarAuto, autoValido, textoResultado, agenda, fila, pad, limparTeclas, get graca() { return graca; }, get prAtual() { return prAtual; }, simularOculto() { if (emJogoAtivo()) C.abrirPausa(); volume(0, .2); }, forcarCalma() { calmaT = 99; }, semPad() { setPad(false); }, get P2() { return P2; }, get trava() { return trava; }, travaFrame, puxar, soltarTodosPad, segPad, get AG() { return C.AG; }, get P3() { return P3; }, get corte() { return corte; } };
  }
};
