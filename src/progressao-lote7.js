// PROGRESSÃO — LOTE 7 (som e atmosfera): desafios sonoros (Só a Casa, Só pelo Som, Rádio Mudo, Noite Muda),
// ruído e silêncio como nota (selos, Pé de Pluma, Sombra, audiograma, fita da noite em .wav), caderno de sons
// que se preenche sozinho, sete silêncios, grade da rádio, teste de fones, ajuda auditiva que se adapta,
// espectrograma da fita 2 e conquistas de ouvido. Ligado por src/progressao.js (L7); texto em
// src/progressao-lote7-roteiro.js. Tudo passivo e à prova de erro: nada trava o jogo nem o QA.
import './progressao-lote7-roteiro.js';

const K = 'hora-silencio-l7';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const TX = () => (window.ROTEIRO.progressao || {}).lote7 || {};
const QA = () => { try { return !!navigator.webdriver || !!window.__teste; } catch (e) { return false; } };
let C = null, A = null, MEM = null, sujo = false, replaying = false;
const mem = () => { if (!MEM) { try { MEM = A.ls.get(K, {}) || {}; } catch (e) { MEM = {}; } } return MEM; };
const salvar = () => { try { A.ls.set(K, mem()); sujo = false; } catch (e) {} };
const mudar = fn => { const m = mem(); try { fn(m); } catch (e) {} salvar(); return m; };
const conq = id => { try { A.conquista(id); } catch (e) {} };
const stats = () => { try { return A.stats() || {}; } catch (e) { return {}; } };
const algumFinal = () => { try { return Object.keys(stats().finais || {}).length > 0; } catch (e) { return false; } };
const fmtC = s => { try { return A.fmtC(s); } catch (e) { return Math.round(s) + 's'; } };
const mmss = s => { s = Math.max(0, Math.round(s)); return s >= 60 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s` : `${s} s`; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const cap1 = s => { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); };

// ---------------------------------------------------------------- estilo
function css() {
  if ($('#l7-css')) return;
  const s = document.createElement('style'); s.id = 'l7-css';
  s.textContent = `[hidden]{display:none!important}
.l7-abas{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:14px}.l7-abas .btn{font-size:15px;padding:4px 10px}.l7-abas .btn.on{color:#c9a75a}
.l7-aviso{text-align:center;color:#857a63;font-style:italic;margin:-4px 0 14px;font-size:14px}
.l7-lin{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 0;border-top:1px solid #1f1b16;color:#cfc3a6}
.l7-lin b{color:#e9dfc8;font-weight:normal}.l7-lin .v{color:#c9a75a;font-family:"Special Elite",monospace;text-align:right}
.l7-som{padding:8px 0;border-top:1px solid #1f1b16;color:#cfc3a6}.l7-som .nm{color:#e9dfc8}.l7-som small{display:block;color:#857a63;margin-top:2px}.l7-som .rr{color:#c9a75a;font-size:11px;letter-spacing:.08em;margin-left:6px}
.l7-som.off{color:#6d6452;font-style:italic}
.l7-barra{height:4px;background:#1f1b16;margin:4px 0 12px}.l7-barra i{display:block;height:100%;background:#c9a75a}
.l7-modo{display:block;padding:8px 2px;border-top:1px solid #1f1b16;cursor:pointer}.l7-modo.off{opacity:.55}.l7-modo small{color:#857a63;display:block;margin-left:24px}
.l7-sel{text-align:center;margin:10px 0}.l7-sel .btn{margin:3px;font-size:15px;padding:4px 10px}.l7-sel .btn.on{color:#c9a75a}
#l7-termo{position:fixed;left:0;right:0;bottom:0;height:18vh;pointer-events:none;z-index:20;opacity:0;background:linear-gradient(to top,rgba(120,170,210,.35),rgba(120,170,210,0));transition:opacity .8s}
#l7-vinheta{position:fixed;inset:0;pointer-events:none;z-index:21;opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 15%,rgba(0,0,0,.94) 85%);transition:opacity 1.2s}
body.l7-cego #obj,body.l7-cego #bars,body.l7-cego #inv-mini,body.l7-cego #cron,body.l7-cego #crono,body.l7-cego #split,body.l7-cego #ruido,body.l7-cego #somdir,body.l7-cego #m-faro,body.l7-cego #m-vinheta,body.l7-cego #m-pulso,body.l7-cego #m-bussola,body.l7-cego #m-postura,body.l7-cego #m-ouvido,body.l7-cego #m-narina,body.l7-cego #m-contador,body.l7-cego #legsom,body.l7-cego #fita-ind,body.l7-cego #placa-sala{visibility:hidden!important}
#l7-pena{display:inline-block;margin:6px 8px;color:#9a8f73;cursor:pointer;font-size:22px;user-select:none;transition:color .2s,transform .2s}#l7-pena:hover{color:#c9a75a}#l7-pena.toca{color:#e7c75a;transform:scale(1.25)}
#l7-fones-oferta{text-align:center;color:#b9ad90;font-family:"Special Elite",monospace;font-size:14px;margin:8px 0}#l7-fones-oferta .btn{font-size:14px;padding:3px 10px;margin:0 3px}
#l7-audio{margin:10px auto;max-width:660px;text-align:center}#l7-audio canvas{width:100%;max-width:640px;background:#0c0a08;border:1px solid #2a241c}#l7-audio .btn{margin:4px}
.l7-cv{display:block;margin:8px auto;max-width:100%;background:#0c0a08;border:1px solid #2a241c;cursor:pointer}`;
  document.head.appendChild(s);
}

// ---------------------------------------------------------------- áudio próprio (teste de fones, fita 2, pena, estação secreta)
let AC7 = null;
function ac7() {
  try {
    if (!AC7) { const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return null; AC7 = new Ctx(); }
    if (AC7.state === 'suspended') AC7.resume();
    return AC7;
  } catch (e) { return null; }
}
function volume() { try { return clamp((C.OPT && C.OPT.vol != null ? C.OPT.vol : .8), 0, 1); } catch (e) { return .8; } }
function tom(ac, t, f, dur, vol, pan, tipo) {
  const o = ac.createOscillator(), g = ac.createGain(); o.type = tipo || 'sine'; o.frequency.value = f;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * volume(), t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  let sai = g; try { const p = ac.createStereoPanner(); p.pan.value = pan || 0; g.connect(p); sai = p; } catch (e) {}
  o.connect(g); sai.connect(ac.destination); o.start(t); o.stop(t + dur + .05); return g;
}
function ruidoBuf(ac, seg) { const n = Math.floor(ac.sampleRate * seg), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; return b; }

// ---------------------------------------------------------------- estado da noite
function L(S) {
  if (!S) return null;
  if (!S.l7) S.l7 = { t: 0, acc: 0, mx: 0, serie: [], ouviu: [], area: 0, loud: 0, alto: 0, sil: 0, silCap: 0, loudCap: 0, altoCap: 0, virou: 0, virouCap: 0, plumas: 0, gatos: 0, ruidoRec: 9, estForte: false, cap: S.chapter, novos: 0 };
  return S.l7;
}
const modos = S => (S && S.l7modos) || [];
const temModo = (S, id) => modos(S).includes(id);
const modoDef = id => (TX().modos || []).find(m => m.id === id);
function modoAberto(id) { const d = modoDef(id); return !!d && (d.abre === 'sempre' || algumFinal()); }
function modosLigados() { try { return (C.OPT.l7modos || []).filter(modoAberto); } catch (e) { return []; } }

// ---------------------------------------------------------------- ganchos do motor (window.__L7)
const RADIO_IDS = () => (((TX().radio || {}).grade) || []).map(x => x.id);
const SIL_IDS = () => (((TX().silencios || {}).lista) || []).map(x => x.id);
const lastArgs = {};
const keysDown = {}; let ultQ = -99, ultSuss = -99, tollT0 = -99, tollPos = null, tollQuebrou = false, tollRuido = false;
const defs = () => { try { return window.__L7defs || {}; } catch (e) { return {}; } };
function mudoPara(def) {
  try {
    const S = C && C.S; if (!S || C.mode !== 'jogo') return false;
    const m = modos(S); if (!m.length) return false;
    if (m.includes('pelosom')) return true;
    const cat = def && def.cat;
    if (m.includes('radiomudo') && (cat === 'p' || cat === 'dele' || (def && (def.pos || def.insp)))) return true;
    if ((m.includes('acasa') || m.includes('noitemuda')) && (cat === 'p' || cat === 'dele')) return true;
  } catch (e) {}
  return false;
}
function semMusica() { try { const S = C && C.S; return !!S && C.mode === 'jogo' && (temModo(S, 'acasa') || temModo(S, 'radiomudo') || temModo(S, 'noitemuda')); } catch (e) { return false; } }
function semBussola() { try { const S = C && C.S; return !!S && (temModo(S, 'radiomudo') || temModo(S, 'pelosom')); } catch (e) { return false; } }
function horaMul() { try { const S = C && C.S; return S && temModo(S, 'noitemuda') ? 2 : 1; } catch (e) { return 1; } }
function ajudaNivel(S) { try { if (QA() || !S || S.dif === 'pesadelo' || modos(S).includes('radiomudo') || modos(S).includes('pelosom')) return 0; return clamp((mem().ajuda == null ? 100 : mem().ajuda), 0, 100) / 100; } catch (e) { return 0; } }
function cdMul() { try { return 1 - .4 * ajudaNivel(C.S); } catch (e) { return 1; } }

function angPara(pos, alvo) { // ângulo (graus) entre para onde a Lia olha e a direção do alvo; 0 = de frente
  const dx = alvo.x - pos.x, dz = alvo.z - pos.z, sy = Math.sin(C.P.yaw), cy = Math.cos(C.P.yaw);
  const fw = -dx * sy - dz * cy, rt = dx * cy - dz * sy; return Math.abs(Math.atan2(rt, fw) * 180 / Math.PI);
}
const yawHist = [];
function somHook(k, a, D) {
  try {
    if (!C || replaying || C.mode !== 'jogo') return;
    const def = D && D[k]; if (!def) return;
    const S = C.S; if (!S) return;
    if (a && a.length) lastArgs[k] = a;
    const l = L(S);
    // ---- eventos que alimentam conquistas e silêncios
    if (k === 'sussurros') ultSuss = l.t;
    if (k === 'badaladas') { tollT0 = l.t; tollPos = C.P.pos.clone(); tollQuebrou = false; }
    if (k === 'horaSilencio') silencio('hora');
    if (k === 'passoMonstro') orelha(S, l);
    // ---- caderno de sons
    registrar(k, def, S);
    // ---- grade da rádio
    if (RADIO_IDS().includes(k)) radio(k);
  } catch (e) {}
}
window.__L7 = { som: somHook, mudo: mudoPara, semMusica, semBussola, horaMul, cdMul };

// ---------------------------------------------------------------- caderno de sons
function nomeSala() { try { const r = C.P.room; return r && (r.nome || r.id) || ''; } catch (e) { return ''; } }
function nomeMapa() { try { return C.W.mapa || ''; } catch (e) { return ''; } }
function ehRaro(k, def) { return !!(def && def.cat === 's') || (TX().raros || []).includes(k); }
function totalSons() { try { return Object.keys(defs()).filter(k => defs()[k] && defs()[k].t).length; } catch (e) { return 0; } }
function registrar(k, def, S) {
  const m = mem(); m.sons = m.sons || {};
  const s = m.sons[k];
  if (s) { s.n = (s.n || 1) + 1; sujo = true; return; }
  m.sons[k] = { n: 1, sala: nomeSala(), mapa: nomeMapa(), cap: S.chapter, t: Date.now() }; sujo = true; salvar();
  const l = L(S); if (l) l.novos++;
  const T = TX().sons || {};
  const raro = ehRaro(k, def);
  const n = Object.keys(m.sons).length;
  try { if (!QA() && (n <= 8 || raro)) C.toast((raro ? T.novoRaro : T.novo).replace('{n}', def.t)); } catch (e) {}
  checarSons();
}
function checarSons() {
  const m = mem(), n = Object.keys(m.sons || {}).length;
  if (n >= 25) conq('l7_caderno_25'); if (n >= 60) conq('l7_dicionario'); if (n >= 150) conq('l7_ouvido_absoluto');
  const raros = Object.keys(m.sons || {}).filter(k => ehRaro(k, defs()[k])).length;
  if (raros >= 5) conq('l7_ouvido_cao');
}

// ---------------------------------------------------------------- silêncios e grade da rádio
function silencio(id) {
  const m = mem(); m.sil = m.sil || {}; if (m.sil[id]) return;
  m.sil[id] = Date.now(); salvar();
  const d = ((TX().silencios || {}).lista || []).find(x => x.id === id);
  try { if (d && !QA()) { C.toast('Silêncio no caderno: ' + d.nome.replace(/^O silêncio /, 'o silêncio ')); setTimeout(() => { try { if (C.S && C.mode === 'jogo' && !C.S.dead) C.sub('lia', d.lia); } catch (e) {} }, 1200); } } catch (e) {}
  if (SIL_IDS().every(x => m.sil[x])) { conq('l7_orelha_fina'); try { C.toast('Um filtro de áudio novo foi liberado nas Opções de som, no título.'); } catch (e) {} }
}
function radio(k) {
  const m = mem(); m.radio = m.radio || {}; if (m.radio[k]) return;
  m.radio[k] = Date.now(); salvar();
  const d = ((TX().radio || {}).grade || []).find(x => x.id === k);
  try { if (d && !QA()) C.toast('Dial: ' + d.freq + ', ' + d.nome); } catch (e) {}
  if (RADIO_IDS().every(x => m.radio[x])) { conq('l7_grade_radio'); try { C.toast('O dial está completo. Há uma oitava estação, que não está no dial.'); } catch (e) {} }
}

// ---------------------------------------------------------------- conquistas de ouvido
function orelha(S, l) {
  const M = C.M, P = C.P; if (!M || !M.ativo || S.hidden || S.dead) return;
  if (l.t - (l.orelhaT || -99) < 4) return; l.orelhaT = l.t;
  const d = M.pos.distanceTo(P.pos); if (d < 5 || d > 30) return;
  const ant = yawHist.length ? yawHist[0] : null;
  const agora = angPara(P.pos, M.pos);
  if (ant != null && ant > 55 && agora < 30) {
    l.virou++; l.virouCap++;
    if (l.virouCap >= 8 && !l.virouAviso) { l.virouAviso = true; conq('l7_orelha_absoluta'); }
  }
}
function tickOuvido(S, l, dt) {
  const P = C.P, M = C.M, ANA = C.ANA;
  const mov = Math.hypot(P.pos.x - (l.px == null ? P.pos.x : l.px), P.pos.z - (l.pz == null ? P.pos.z : l.pz)); l.px = P.pos.x; l.pz = P.pos.z;
  // histórico de olhar (2 s atrás) para a Orelha Absoluta
  l.yt = (l.yt || 0) + dt; if (l.yt >= .5) { l.yt = 0; if (M && M.ativo) yawHist.push(angPara(P.pos, M.pos)); else yawHist.push(0); while (yawHist.length > 4) yawHist.shift(); }
  const quieto = (P.noiseR || 0) <= .5 && !P.sprinting;
  l.qT = quieto ? (l.qT || 0) + dt : 0;
  // parada total: Goteira Inteira (60 s sem sair do lugar)
  if (mov < .003) l.paradaT = (l.paradaT || 0) + dt; else l.paradaT = 0;
  if (l.paradaT >= 60 && !l.goteira) { l.goteira = true; conq('l7_goteira'); try { C.sub('lia', TX().frases.goteira); } catch (e) {} }
  // sessenta segundos de silêncio com o Inspetor solto
  const sala = P.room && P.room.id;
  if (quieto && !S.flashOn && M && M.ativo && sala && sala === l.salaSil) l.silT = (l.silT || 0) + dt; else { l.silT = 0; l.salaSil = sala; }
  l.termo = (quieto && !S.flashOn) ? Math.min(60, (l.termo || 0) + dt) : Math.max(0, (l.termo || 0) - dt * 3);
  if ((l.silT || 0) >= 60 && !l.sessenta) { l.sessenta = true; conq('l7_60s'); try { C.sub('lia', TX().frases.sessenta); } catch (e) {} }
  // corredor longo sem som
  const r = P.room;
  if (r && r.id === l.salaCorr) {
    if (mov > .001 && (P.noiseR || 0) <= 1.6) l.corr = (l.corr || 0) + mov;
    else if ((P.noiseR || 0) > 1.6) l.corr = 0;
  } else { l.salaCorr = r && r.id; l.corr = 0; }
  try { if (r && l.corr >= 10 && Math.max(Math.abs((r.x1 || 0) - (r.x0 || 0)), Math.abs((r.z1 || 0) - (r.z0 || 0))) >= 12 && !l.corrOk) { l.corrOk = true; conq('l7_silencio_total'); C.sub('lia', TX().frases.silTotal); } } catch (e) {}
  // nove badaladas sem se mexer
  if (tollT0 > -90) {
    if (mov > .004 || (P.noiseR || 0) > .5) tollQuebrou = true;
    if (l.t - tollT0 > 24) { if (!tollQuebrou) { conq('l7_cantor_calado'); try { C.sub('lia', TX().frases.cantor); } catch (e) {} } tollT0 = -99; }
  }
  // olhar para trás depois do sussurro
  if (ultSuss > -90 && l.t - ultQ >= 0 && ultQ >= ultSuss && l.t - ultSuss < 6 && ultQ - ultSuss < 4.5) { conq('l7_tinha_alguem'); try { C.sub('lia', TX().frases.tinha); } catch (e) {} ultSuss = -99; }
  // Ouvido de Gato: esconder-se antes de vê-lo, só pelo som dele chegando
  const esc = !!S.hidden;
  if (esc && !l.escPrev && M && M.ativo) {
    const d = M.pos.distanceTo(P.pos), antD = l.dAnt != null ? l.dAnt : d;
    if (d > 5 && d < 20 && (antD - d) > .6 && !['caca', 'alerta', 'bote', 'agarra'].includes(M.state) && angPara(P.pos, M.pos) > 80) { l.gatos++; if (l.gatos >= 3 && !l.gatoOk) { l.gatoOk = true; conq('l7_ouvido_gato'); try { C.sub('lia', TX().frases.gato); } catch (e) {} } }
  }
  l.escPrev = esc;
  l.dt2 = (l.dt2 || 0) + dt; if (l.dt2 >= 1.5) { l.dt2 = 0; l.dAnt = M && M.ativo ? M.pos.distanceTo(P.pos) : null; }
  // silêncios do caderno
  const hid = S.hidden;
  const sil = [];
  if (M && M.ativo && !hid && ['escuta', 'procura', 'investiga'].includes(M.state) && M.pos.distanceTo(P.pos) < 12 && l.qT >= 3) sil.push('inspetor');
  if (hid && hid.tipo !== 'cama' && l.qT >= 4) sil.push('armario');
  if (hid && hid.tipo === 'cama' && l.qT >= 4) sil.push('cama');
  if (!hid && P.room && P.room.seguro && l.qT >= 4) sil.push('refugio');
  if (ANA && ANA.ativa && !ANA.vista && ANA.conta >= 7 && ANA.pos && ANA.pos.distanceTo(P.pos) < 12 && l.qT >= 2) sil.push('ana');
  if (hid && keysDown.Space && S.stamina > 0) sil.push('folego');
  for (const id of sil) silencio(id);
  // Silêncio Absoluto: a casa prende o ar (60 s de silêncio) sem nenhum barulho alto na noite
  if (S.flags && S.flags.regraZero && !l.absoluto) { l.absoluto = true; if ((l.alto || 0) < .5) { conq('l7_silencio_absoluto'); try { C.sub('davi', TX().frases.silAbsolutoDavi); } catch (e) {} } }
}

// ---------------------------------------------------------------- novo jogo e tick
function novoJogo(S) {
  try {
    S.l7modos = modosLigados().slice(); S.l7 = null; L(S); ultQ = -99; ultSuss = -99; tollT0 = -99; yawHist.length = 0;
    if ((C.OPT.l7modos || []).length && !S.l7modos.length) try { C.toast(TX().modosTxt.travado); } catch (e) {}
  } catch (e) {}
}
function difKey(S) { try { return '|' + modos(S).join() + ajudaNivel(S).toFixed(1); } catch (e) { return ''; } }
function difMod(v, S) {
  try {
    const aj = ajudaNivel(S); if (aj > 0) v.aviso = (v.aviso || 7) + 3 * aj;
    if (temModo(S, 'acasa')) v.intervalo = (v.intervalo || 1) / 1.2;
    if (temModo(S, 'radiomudo')) v.aviso = Math.max(1.5, (v.aviso || 7) - 2);
  } catch (e) {}
}
let flush = 0;
function tick(dt) {
  try {
    const S = C.S, P = C.P; if (!S || C.mode !== 'jogo') return;
    const l = L(S);
    if (l.cap !== S.chapter) { l.cap = S.chapter; l.silCap = 0; l.loudCap = 0; l.altoCap = 0; l.virouCap = 0; l.virouAviso = false; l.corr = 0; }
    l.t += dt;
    const n = P.noiseR || 0;
    l.acc += dt; l.mx = Math.max(l.mx, n); l.area += n * dt;
    if (l.acc >= 1) { if (l.serie.length < 7200) l.serie.push(Math.round(Math.min(24, l.mx) * 10) / 10); l.acc = 0; l.mx = 0; }
    if (n > 3) { l.loud += dt; l.loudCap += dt; l.ruidoRec = 0; } else { l.sil += dt; l.silCap += dt; l.ruidoRec += dt; }
    if (n >= 12) { l.alto += dt; l.altoCap += dt; }
    // "ele te ouviu": entra em investigação/alerta/caça logo depois de você fazer barulho
    const M = C.M, st = M && M.ativo ? M.state : null, forte = st === 'investiga' || st === 'alerta' || st === 'caca';
    if (forte && !l.estForte && l.ruidoRec < 2.5) { if (l.ouviu.length < 300) l.ouviu.push(Math.round(l.t)); }
    l.estForte = forte;
    // medo extra dos desafios (sustos mais pesados)
    const mult = temModo(S, 'radiomudo') ? 2 : temModo(S, 'acasa') ? 1.2 : 1;
    if (mult > 1 && S.fear != null) { const ant = S._l7fear; if (ant != null && S.fear > ant) S.fear = Math.min(100, S.fear + (S.fear - ant) * (mult - 1)); S._l7fear = S.fear; }
    tickOuvido(S, l, dt);
    atmosfera(S, l);
    aplicarFiltro();
    flush += dt; if (flush > 20) { flush = 0; if (sujo) salvar(); }
  } catch (e) {}
}
const EL = { v: null, t: null };
function atmosfera(S, l) {
  try {
    const cego = temModo(S, 'pelosom');
    if (document.body.classList.contains('l7-cego') !== cego) document.body.classList.toggle('l7-cego', cego);
    let v = EL.v; if (cego && !v) { v = EL.v = document.createElement('div'); v.id = 'l7-vinheta'; document.body.appendChild(v); }
    if (v) v.style.opacity = cego ? '1' : '0';
    let t = EL.t; const quer = mem().termometro !== false && !cego;
    if (quer && !t) { t = EL.t = document.createElement('div'); t.id = 'l7-termo'; document.body.appendChild(t); }
    if (t) { const o = quer ? (Math.round(clamp((l.termo || 0) / 60, 0, 1) * 55) / 100).toString() : '0'; if (t.style.opacity !== o) t.style.opacity = o; }
  } catch (e) {}
}
function limparAtmosfera() { try { document.body.classList.remove('l7-cego'); const v = $('#l7-vinheta'), t = $('#l7-termo'); if (v) v.style.opacity = '0'; if (t) t.style.opacity = '0'; } catch (e) {} }

// ---------------------------------------------------------------- filtro de áudio cosmético
const F7 = { nome: 'nenhum', node: null, hp: null };
function aplicarFiltro() {
  try {
    const m = mem(), AC = C.AC, AUD = C.AUD; if (!AC || !AUD || !AUD.mono || !AUD.cmp) return;
    let f = m.filtro || 'nenhum'; if (!SIL_IDS().every(x => (m.sil || {})[x])) f = 'nenhum';
    if (f === F7.nome) return;
    if (!F7.node) {
      if (f === 'nenhum') return;
      F7.hp = AC.createBiquadFilter(); F7.node = AC.createBiquadFilter();
      AUD.mono.disconnect(AUD.cmp); AUD.mono.connect(F7.hp); F7.hp.connect(F7.node); F7.node.connect(AUD.cmp);
    }
    const hp = F7.hp, nd = F7.node;
    hp.type = 'highpass'; hp.frequency.value = f === 'gaveta' ? 300 : 10; hp.Q.value = .7;
    if (f === 'gaveta') { nd.type = 'lowpass'; nd.frequency.value = 4200; }
    else if (f === 'poco') { nd.type = 'lowpass'; nd.frequency.value = 1800; }
    else if (f === 'agulha') { nd.type = 'highshelf'; nd.frequency.value = 3000; nd.gain.value = 6; }
    else { nd.type = 'lowpass'; nd.frequency.value = 22000; }
    F7.nome = f;
  } catch (e) {}
}

// ---------------------------------------------------------------- ruído, silêncio e selos
const FAIXAS = [['ouro', .25], ['prata', .45], ['bronze', .65]];
function selo(l, tempo) { const r = tempo > 20 ? l.loud / tempo : 1; for (const [n, lim] of FAIXAS) if (r <= lim) return n; return null; }
function fimCap(c, r) {
  const linhas = [], T = TX();
  try {
    const S = C.S, l = L(S); if (!S || !l) return linhas;
    const capT = Math.max(1, S.capT || 1), cap = S.chapter, RT = T.ruido || {};
    const loudP = Math.round(100 * l.loudCap / capT), silP = Math.round(100 * l.silCap / capT);
    linhas.push(RT.cap.replace('{t}', mmss(l.loudCap)).replace('{p}', loudP));
    linhas.push(RT.silencio.replace('{s}', Math.round(l.silCap)).replace('{p}', silP));
    // recorde do capítulo
    const m = mem(); m.recs = m.recs || {}; const rc = m.recs[c.id] || {};
    if (rc.sil != null && rc.sil > silP) linhas.push(RT.recorde.replace('{p}', rc.sil));
    if (rc.sil == null || silP > rc.sil) rc.sil = silP;
    if (rc.loud == null || loudP < rc.loud) rc.loud = loudP; m.recs[c.id] = rc;
    // Sombra e Pé de Pluma
    if (silP >= 40 && capT > 60) { conq('l7_sombra'); linhas.push(`<b class="ouro">${esc(RT.sombra)}</b>`); }
    if (loudP <= 30 && capT > 90) {
      l.plumas++; m.plumas = (m.plumas || 0) + 1; conq('l7_pe_pluma'); linhas.push(`<b class="ouro">${esc(RT.pluma)}</b>`);
      if (l.plumas >= 3) conq('l7_pluma_ouro');
    }
    if (l.ouviu.length) linhas.push(RT.ouviram.replace('{n}', l.ouviu.length));
    if (l.virouCap > 0) linhas.push(RT.orelha.replace('{n}', l.virouCap));
    if (l.virouCap >= 8) linhas.push(`<i>${esc(RT.orelhaFrase)}</i>`);
    // só de ouvido: lanterna acesa em menos de 20% do capítulo
    if (cap >= 1 && capT >= 120 && (S.capLuzT || 0) / capT <= .2) conq('l7_so_de_ouvido');
    // desafios sonoros
    const md = modos(S);
    if (md.length) {
      m.feitos = m.feitos || {}; for (const id of md) m.feitos[id] = 1;
      if (md.includes('acasa') && cap === 3) conq('l7_orelha_nua');
      if (md.includes('pelosom')) conq('l7_olhos_fechados');
      if (md.includes('radiomudo')) conq('l7_radio_mudo');
      if (md.includes('noitemuda') && cap === 2) conq('l7_noite_muda');
      if (['acasa', 'pelosom', 'radiomudo', 'noitemuda'].every(x => m.feitos[x])) conq('l7_quatro_modos');
    }
    // ajuda auditiva: cai a cada dez capítulos sem morrer
    if (!(S.capMortes || 0)) { m.limpos = (m.limpos || 0) + 1; if (m.limpos >= 10) { m.limpos = 0; baixaAjuda(10); } }
    salvar();
  } catch (e) {}
  return linhas;
}
function baixaAjuda(pts) {
  const m = mem(); if (m.ajudaTrava) return;
  const ant = m.ajuda == null ? 100 : m.ajuda; m.ajuda = Math.max(0, ant - pts);
  if (m.ajuda === 0 && ant > 0) conq('l7_sem_rodinhas');
}
function morte() { try { const S = C.S; if (S && S.l7) { S.l7.termo = 0; S.l7.corr = 0; S.l7.silT = 0; } } catch (e) {} }

// ---------------------------------------------------------------- final
function final(tipo) {
  try {
    const S = C.S, l = L(S); if (!S || !l) return;
    const m = mem(), tempo = Math.max(1, S.tempo || l.t || 1), s = selo(l, tempo);
    S.l7_selo = s;
    if (S.completo) {
      if (l.alto < 20) conq('l7_noite_calada');
      if (s === 'ouro') conq('l7_furtiva_ouro');
      m.melhorRuido = (m.melhorRuido == null || l.area < m.melhorRuido) ? l.area : m.melhorRuido;
      if (temModo(S, 'radiomudo')) m.recRadio = (m.recRadio == null || S.tempo < m.recRadio) ? S.tempo : m.recRadio;
      if (temModo(S, 'noitemuda')) m.recMuda = (m.recMuda == null || S.tempo < m.recMuda) ? S.tempo : m.recMuda;
      baixaAjuda(10);
    }
    // guarda a série (reduzida) da última noite para o audiograma
    const ser = l.serie, passo = Math.max(1, Math.ceil(ser.length / 700)), red = [];
    for (let i = 0; i < ser.length; i += passo) { let mx = 0; for (let j = i; j < Math.min(ser.length, i + passo); j++) mx = Math.max(mx, ser[j]); red.push(mx); }
    m.ultima = { serie: red, passo, ouviu: l.ouviu.slice(), tempo: Math.round(tempo), loud: Math.round(l.loud), sil: Math.round(l.sil), area: Math.round(l.area), selo: s, semente: S.semente || '', modos: modos(S).slice(), fear: S.fear || 0 };
    salvar();
  } catch (e) {}
}
function telaFinal() {
  try {
    const S = C.S, l = L(S), el = $('#e-stats'); if (!el || !S || !l) return;
    const T = TX(), RT = T.ruido || {}, tempo = Math.max(1, S.tempo || l.t || 1), p = Math.round(100 * l.loud / tempo);
    let x = `<br><small>${esc(RT.noite.replace('{t}', mmss(l.loud)).replace('{p}', p))}${S.l7_selo ? ` · selo <b class="ouro">${esc(T.selosRuido[S.l7_selo])}</b> de furtividade` : ''}</small>`;
    x += `<br><small>${esc(RT.silencio.replace('{s}', Math.round(l.sil)).replace('{p}', Math.round(100 * l.sil / tempo)))} · ${esc(RT.area.replace('{a}', Math.round(l.area)))}</small>`;
    if (l.ouviu.length) x += `<br><small>${esc(RT.ouviram.replace('{n}', l.ouviu.length))}</small>`;
    if (l.novos) x += `<br><small>sons novos no caderno nesta noite: ${l.novos}</small>`;
    if (temModo(S, 'pelosom')) x += `<br><span class="l7-selo" style="color:#c9a75a">${esc(cap1(T.modosTxt.selo))}</span>`;
    el.innerHTML += x;
    if (!$('#l7-audio')) {
      const box = document.createElement('div'); box.id = 'l7-audio';
      box.innerHTML = '<canvas width="640" height="180" id="l7-cv"></canvas><div><button class="btn" id="l7-baixar">' + esc(T.noite.baixar) + '</button><button class="btn" id="l7-fita">' + esc(T.noite.fita) + '</button></div>';
      el.insertAdjacentElement('afterend', box);
    }
    // a cada final redesenha o gráfico da noite que acabou de terminar
    const u = mem().ultima; if (u) audiograma($('#l7-cv'), u);
    $('#l7-baixar').onclick = () => baixarAudiograma($('#l7-cv'), S.semente);
    $('#l7-fita').onclick = ev => gravarFita(mem().ultima, ev.target);
  } catch (e) {}
}

// ---------------------------------------------------------------- audiograma (canvas) e fita da noite (.wav)
function audiograma(cv, u) {
  try {
    if (!cv || !u) return; const g = cv.getContext('2d'), W = cv.width, H = cv.height, pad = 22, ser = u.serie || [], n = Math.max(1, ser.length);
    g.fillStyle = '#0c0a08'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#2a241c'; g.lineWidth = 1; for (let i = 0; i <= 4; i++) { const y = pad + (H - pad * 2) * i / 4; g.beginPath(); g.moveTo(pad, y); g.lineTo(W - 8, y); g.stroke(); }
    const X = i => pad + (W - pad - 8) * i / Math.max(1, n - 1), Y = v => H - pad - (H - pad * 2) * clamp(v / 24, 0, 1);
    // silêncio total (faixas de 15 s ou mais com zero)
    let run = 0; g.fillStyle = '#6fa06a';
    for (let i = 0; i <= n; i++) { if (i < n && ser[i] <= .01) run++; else { if (run * (u.passo || 1) >= 15) { const c = i - run / 2; g.beginPath(); g.arc(X(c), H - pad + 8, 3, 0, 7); g.fill(); } run = 0; } }
    g.beginPath(); g.moveTo(X(0), Y(0)); for (let i = 0; i < n; i++) g.lineTo(X(i), Y(ser[i])); g.lineTo(X(n - 1), Y(0)); g.closePath(); g.fillStyle = 'rgba(201,167,90,.28)'; g.fill();
    g.beginPath(); for (let i = 0; i < n; i++) { if (i) g.lineTo(X(i), Y(ser[i])); else g.moveTo(X(i), Y(ser[i])); } g.strokeStyle = '#c9a75a'; g.lineWidth = 1.5; g.stroke();
    // o Inspetor te ouviu
    g.strokeStyle = '#b0362a'; g.lineWidth = 2; for (const t of (u.ouviu || [])) { const i = t / (u.passo || 1), x = X(Math.min(n - 1, i)); g.beginPath(); g.moveTo(x, pad); g.lineTo(x, H - pad); g.stroke(); }
    g.fillStyle = '#857a63'; g.font = '11px monospace'; g.fillText('A Hora do Silêncio · audiograma' + (u.semente ? ' · ' + u.semente : ''), pad, 14); g.fillText(mmss(u.tempo || 0), W - 70, H - 6); g.fillText('0', 4, H - pad + 3); g.fillText('alto', 2, pad + 8);
  } catch (e) {}
}
function baixarAudiograma(cv, nome) {
  try {
    cv.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'audiograma-' + (nome || 'noite') + '.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); conq('l7_audiograma'); }, 'image/png');
  } catch (e) {}
}
function wavBytes(buf) {
  const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate, out = new DataView(new ArrayBuffer(44 + n * ch * 2));
  const w = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); out.setUint32(4, 36 + n * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true); out.setUint32(24, sr, true); out.setUint32(28, sr * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * ch * 2, true);
  const d = []; for (let c = 0; c < ch; c++) d.push(buf.getChannelData(c));
  let o = 44; for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const v = clamp(d[c][i], -1, 1); out.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
  return out.buffer;
}
async function gravarFita(u, btn) {
  const T = TX().noite || {};
  try {
    const Off = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!Off) throw 0;
    if (btn) btn.textContent = T.gravando;
    const sr = 22050, dur = 20, oac = new Off(2, sr * dur, sr);
    const ser = (u && u.serie && u.serie.length) ? u.serie.slice(-dur) : [], fear = clamp(((u && u.fear) || 40) / 100, .1, 1);
    // chuva (ruído filtrado, constante)
    const rb = oac.createBuffer(1, sr * 4, sr), rd = rb.getChannelData(0); for (let i = 0; i < rd.length; i++) rd[i] = Math.random() * 2 - 1;
    const chuva = oac.createBufferSource(); chuva.buffer = rb; chuva.loop = true; const cf = oac.createBiquadFilter(); cf.type = 'bandpass'; cf.frequency.value = 3200; cf.Q.value = .5; const cg = oac.createGain(); cg.gain.value = .05; chuva.connect(cf); cf.connect(cg); cg.connect(oac.destination); chuva.start(0);
    // passos: densidade e força seguem o ruído de cada segundo da noite
    const passo = (t, v, pan) => { const s = oac.createBufferSource(); s.buffer = rb; const f = oac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260 + v * 55; const g = oac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05 + clamp(v / 20, 0, 1) * .4, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + .13); let sai = g; try { const p = oac.createStereoPanner(); p.pan.value = pan; g.connect(p); sai = p; } catch (e) {} s.connect(f); f.connect(g); sai.connect(oac.destination); s.start(t, Math.random() * 3, .15); };
    for (let i = 0; i < dur; i++) { const v = ser.length ? (ser[ser.length - dur + i] != null ? ser[ser.length - dur + i] : (ser[i] || 0)) : (i % 5 < 3 ? 6.5 : 0); if (v < 1) continue; const cad = v > 14 ? .3 : v > 4 ? .5 : .8; for (let t = i; t < i + 1; t += cad) passo(t, v, ((i * 7) % 5 - 2) / 6); }
    // batimento: quanto mais medo, mais rápido
    const bpm = 55 + fear * 80; for (let t = .3; t < dur; t += 60 / bpm) { for (const [dt0, a] of [[0, .5], [.17, .32]]) { const o = oac.createOscillator(), g = oac.createGain(); o.frequency.setValueAtTime(70, t + dt0); o.frequency.exponentialRampToValueAtTime(40, t + dt0 + .12); g.gain.setValueAtTime(0, t + dt0); g.gain.linearRampToValueAtTime(a * (.5 + fear * .5), t + dt0 + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dt0 + .14); o.connect(g); g.connect(oac.destination); o.start(t + dt0); o.stop(t + dt0 + .16); } }
    // o susto aos 16 s: golpe grave, ruído e um guincho que cai
    const ts = 16, sb = oac.createBufferSource(); sb.buffer = rb; const sg = oac.createGain(); sg.gain.setValueAtTime(0, ts); sg.gain.linearRampToValueAtTime(.7, ts + .01); sg.gain.exponentialRampToValueAtTime(.0001, ts + 1.4); sb.connect(sg); sg.connect(oac.destination); sb.start(ts, 0, 1.5);
    const so = oac.createOscillator(), sog = oac.createGain(); so.type = 'sawtooth'; so.frequency.setValueAtTime(1500, ts); so.frequency.exponentialRampToValueAtTime(180, ts + 1.2); sog.gain.setValueAtTime(0, ts); sog.gain.linearRampToValueAtTime(.25, ts + .02); sog.gain.exponentialRampToValueAtTime(.0001, ts + 1.3); so.connect(sog); sog.connect(oac.destination); so.start(ts); so.stop(ts + 1.4);
    const kk = oac.createOscillator(), kg = oac.createGain(); kk.frequency.setValueAtTime(90, ts); kk.frequency.exponentialRampToValueAtTime(30, ts + .5); kg.gain.setValueAtTime(.9, ts); kg.gain.exponentialRampToValueAtTime(.0001, ts + .6); kk.connect(kg); kg.connect(oac.destination); kk.start(ts); kk.stop(ts + .7);
    const buf = await oac.startRendering();
    const blob = new Blob([wavBytes(buf)], { type: 'audio/wav' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'fita-da-noite-' + ((u && u.semente) || 'silencio') + '.wav'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 6000);
    conq('l7_fita_noite'); if (btn) { btn.textContent = T.gravada; setTimeout(() => { btn.textContent = T.fita; }, 2500); }
  } catch (e) { console.warn('[L7] fita da noite', e); if (btn) { btn.textContent = T.erro || 'erro'; setTimeout(() => { btn.textContent = T.fita; }, 2500); } }
}

// ---------------------------------------------------------------- pausa e estatísticas
function pausa() {
  try {
    const S = C.S; if (!S) return ''; const l = L(S), T = TX().pausa || {}; let out = '';
    if (modos(S).length) out += '<br>' + esc(T.modos.replace('{m}', modos(S).map(id => (modoDef(id) || {}).nome).filter(Boolean).join(', ')));
    const aj = Math.round(ajudaNivel(S) * 100); if (aj > 0) out += '<br>' + esc(T.ajuda.replace('{a}', aj));
    if (l && l.t > 30) out += `<br>barulho na noite: ${esc(mmss(l.loud))} · silêncio: ${esc(mmss(l.sil))}`;
    return out;
  } catch (e) { return ''; }
}
function statsLinhas() {
  try {
    const m = mem(), T = TX().stats || {}, tot = totalSons(), s = Object.keys(m.sons || {}).length;
    const out = [[T.sons, `${s}${tot ? '/' + tot : ''}`], [T.silencios, `${Object.keys(m.sil || {}).length}/7`], [T.radio, `${Object.keys(m.radio || {}).length}/7`], [T.ajuda, (m.ajuda == null ? 100 : m.ajuda) + '%'], [T.plumas, m.plumas || 0], [T.galeria, m.galeria || 0]];
    if (m.recRadio != null) out.push([TX().modosTxt.recorde, fmtC(m.recRadio)]);
    if (m.recMuda != null) out.push([TX().modosTxt.placar, fmtC(m.recMuda)]);
    return out;
  } catch (e) { return []; }
}

// ---------------------------------------------------------------- título: botão, pena, oferta de fones
function injetar() {
  try {
    const menu = $('#title .menu');
    if (menu && !$('#b-l7-sons')) {
      const b = document.createElement('button'); b.className = 'btn'; b.id = 'b-l7-sons'; b.textContent = (TX().hub || {}).titulo || 'Sons e silêncios'; b.onclick = () => openHub('caderno');
      const ref = $('#b-l6-mortes') || $('#b-stats') || $('#b-caps'); if (ref && ref.insertAdjacentElement) ref.insertAdjacentElement('afterend', b); else menu.appendChild(b);
    }
    if (menu && !$('#l7-pena')) {
      const p = document.createElement('span'); p.id = 'l7-pena'; p.hidden = true; p.textContent = '❧'; p.onclick = penaToca; menu.insertAdjacentElement('afterend', p);
    }
    if (menu && !$('#l7-fones-oferta')) { const o = document.createElement('div'); o.id = 'l7-fones-oferta'; o.hidden = true; const ref = $('#t-memoria'); (ref || menu).insertAdjacentElement(ref ? 'afterend' : 'beforebegin', o); }
  } catch (e) {}
}
function penaToca() {
  try {
    const m = mem(), p = $('#l7-pena'); m.penaN = (m.penaN || 0) + 1; salvar();
    try { C.iniciarAudio(); } catch (e) {}
    const ac = ac7(); if (ac) { const t = ac.currentTime, f = 520 * Math.pow(2, ((m.penaN * 2) % 12) / 12); tom(ac, t, f, 1.6, .12, 0, 'sine'); tom(ac, t + .02, f * 2.01, 1.2, .05, 0, 'sine'); tom(ac, t + .04, f * 3, .8, .02, 0, 'sine'); }
    if (p) { p.classList.add('toca'); setTimeout(() => p.classList.remove('toca'), 300); }
    if (m.penaN >= 7) conq('l7_pena');
  } catch (e) {}
}
function titulo() {
  try {
    injetar(); limparAtmosfera(); aplicarFiltro();
    const m = mem(), p = $('#l7-pena');
    if (p) { p.hidden = !(m.plumas > 0 || m.penaN > 0); p.title = (TX().pena.dica || 'Pé de Pluma') + (m.plumas ? ' × ' + m.plumas : ''); }
    const o = $('#l7-fones-oferta');
    if (o) {
      if (!QA() && !m.fones && !m.fonesRecusou && (!$('#painel') || $('#painel').hidden)) {
        const T = TX().fones; o.hidden = false;
        o.innerHTML = `${esc(T.oferta)} <button class="btn" id="l7-f-sim">${esc(T.testar)}</button><button class="btn" id="l7-f-nao">${esc(T.agora)}</button>`;
        $('#l7-f-sim').onclick = () => { o.hidden = true; testeFones(); };
        $('#l7-f-nao').onclick = () => { o.hidden = true; mudar(x => { x.fonesRecusou = true; }); };
      } else o.hidden = true;
    }
  } catch (e) {}
}
function tecla() { return false; }

// ---------------------------------------------------------------- teste de fones
function testeFones() {
  try {
    const T = TX().fones; try { C.iniciarAudio(); } catch (e) {}
    const ac = ac7(); if (!ac) { C.toast(T.semAudio); return; }
    const t0 = ac.currentTime + .3;
    for (let i = 0; i < 3; i++) tom(ac, t0 + i * .5, 660, .22, .35, -1, 'sine');
    for (let i = 0; i < 3; i++) tom(ac, t0 + 1.8 + i * .5, 880, .22, .35, 1, 'sine');
    // sussurro de um ouvido ao outro
    const wb = ruidoBuf(ac, 3), ws = ac.createBufferSource(); ws.buffer = wb; const wf = ac.createBiquadFilter(); wf.type = 'bandpass'; wf.frequency.value = 1900; wf.Q.value = 3; const wg = ac.createGain(); const wp = ac.createStereoPanner();
    wg.gain.setValueAtTime(0, t0 + 3.6); for (let i = 0; i < 12; i++) { wg.gain.linearRampToValueAtTime(.28 * volume() + .01, t0 + 3.6 + i * .24 + .08); wg.gain.linearRampToValueAtTime(.02 * volume(), t0 + 3.6 + i * .24 + .2); }
    wg.gain.linearRampToValueAtTime(0, t0 + 6.6); wp.pan.setValueAtTime(-1, t0 + 3.6); wp.pan.linearRampToValueAtTime(1, t0 + 6.4); ws.connect(wf); wf.connect(wg); wg.connect(wp); wp.connect(ac.destination); ws.start(t0 + 3.6); ws.stop(t0 + 6.7);
    // pulso que sobe
    const po = ac.createOscillator(), pg = ac.createGain(); po.type = 'sine'; po.frequency.setValueAtTime(110, t0 + 6.8); po.frequency.exponentialRampToValueAtTime(520, t0 + 8.4); pg.gain.setValueAtTime(0, t0 + 6.8); pg.gain.linearRampToValueAtTime(.4 * volume(), t0 + 8.2); pg.gain.linearRampToValueAtTime(0, t0 + 8.5); po.connect(pg); pg.connect(ac.destination); po.start(t0 + 6.8); po.stop(t0 + 8.6);
    // vindo de trás (HRTF)
    try {
      const pn = ac.createPanner(); pn.panningModel = 'HRTF'; pn.setPosition ? pn.setPosition(0, 0, 3) : (pn.positionZ.value = 3);
      for (let i = 0; i < 4; i++) { const t = t0 + 8.7 + i * .45, s = ac.createBufferSource(); s.buffer = wb; const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500; const g = ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5 * volume(), t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + .2); s.connect(f); f.connect(g); g.connect(pn); s.start(t, i * .3, .25); }
      pn.connect(ac.destination);
    } catch (e) {}
    // painel guiado
    const caixa = document.createElement('div'); caixa.id = 'l7-teste'; caixa.style.cssText = 'position:fixed;inset:0;z-index:60;background:rgba(8,6,4,.94);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#e9dfc8;font-family:"Special Elite",monospace;text-align:center;padding:20px';
    document.body.appendChild(caixa);
    const marcos = [0, 1.8, 3.6, 6.8, 8.7];
    caixa.innerHTML = `<h2 style="margin-bottom:14px">${esc(T.titulo)}</h2><p id="l7-t-p" style="min-height:3em">${esc(T.passos[0])}</p>`;
    marcos.forEach((s, i) => setTimeout(() => { const p = $('#l7-t-p'); if (p) p.textContent = T.passos[i]; }, (.3 + s) * 1000));
    setTimeout(() => perguntasFones(caixa), 11200);
  } catch (e) {}
}
function perguntasFones(caixa) {
  try {
    const T = TX().fones, r = { e: null, d: null };
    const q = (txt, id, prox) => { caixa.innerHTML = `<h2 style="margin-bottom:14px">${esc(T.titulo)}</h2><p>${esc(txt)}</p><div class="l7-sel"><button class="btn" id="l7-sim">${esc(T.sim)}</button><button class="btn" id="l7-nao">${esc(T.nao)}</button></div>`; $('#l7-sim').onclick = () => { r[id] = true; prox(); }; $('#l7-nao').onclick = () => { r[id] = false; prox(); }; };
    const vol = () => {
      caixa.innerHTML = `<h2 style="margin-bottom:14px">${esc(T.titulo)}</h2><p>${esc(T.volume)}</p><div class="l7-sel"><button class="btn" data-v="-1">${esc(T.baixo)}</button><button class="btn" data-v="0">${esc(T.bom)}</button><button class="btn" data-v="1">${esc(T.alto)}</button></div>`;
      caixa.querySelectorAll('[data-v]').forEach(b => b.onclick = () => {
        try { const d = Number(b.dataset.v), v0 = C.OPT.vol != null ? C.OPT.vol : .8; C.OPT.vol = d < 0 ? clamp(v0 + .15, .2, 1) : d > 0 ? clamp(v0 - .15, .2, 1) : v0; const sl = $('#o-vol'); if (sl) { sl.value = C.OPT.vol; sl.dispatchEvent(new Event('input', { bubbles: true })); } C.salvarOpt(); } catch (e) {}
        const falhou = !r.e || !r.d;
        if (falhou) { caixa.innerHTML = `<h2 style="margin-bottom:14px">${esc(T.titulo)}</h2><p>${esc(T.monoOferta)}</p><div class="l7-sel"><button class="btn" id="l7-mono-s">${esc(T.sim)}</button><button class="btn" id="l7-mono-n">${esc(T.nao)}</button></div>`; $('#l7-mono-s').onclick = () => { try { C.OPT.mono = 1; C.salvarOpt(); if (C.AUD && C.AUD.mono) C.AUD.mono.channelCount = 1; C.toast(T.monoLigado); } catch (e) {} fim(); }; $('#l7-mono-n').onclick = fim; }
        else fim();
      });
    };
    const fim = () => { mudar(m => { m.fones = { ok: !!(r.e && r.d), e: r.e, d: r.d, ts: Date.now() }; }); if (r.e && r.d) conq('l7_fones'); caixa.remove(); try { C.toast(T.pronto); } catch (e) {} };
    q(T.perguntaE, 'e', () => q(T.perguntaD, 'd', vol));
  } catch (e) { try { $('#l7-teste').remove(); } catch (x) {} }
}

// ---------------------------------------------------------------- painel Sons e silêncios
function openHub(aba) {
  try {
    const T = TX(), hub = T.hub || {};
    const barra = `<div class="l7-abas">${(hub.abas || []).map(([k, n]) => `<button class="btn ${k === aba ? 'on' : ''}" data-aba="${k}">${esc(n)}</button>`).join('')}</div><p class="l7-aviso">${esc(hub.aviso || '')}</p>`;
    A.abrirPainel(hub.titulo || 'Sons e silêncios', barra + corpo(aba));
    $('#pn-lista').querySelectorAll('[data-aba]').forEach(x => x.onclick = () => openHub(x.dataset.aba));
    ligarCorpo(aba);
  } catch (e) {}
}
function corpo(aba) {
  if (aba === 'silencios') return abaSilencios();
  if (aba === 'radio') return abaRadio();
  if (aba === 'desafios') return abaDesafios();
  if (aba === 'fones') return abaFones();
  if (aba === 'noite') return abaNoite();
  if (aba === 'fita') return abaFita();
  return abaCaderno();
}
let filtroCat = 'todos';
function abaCaderno() {
  const T = TX().sons || {}, m = mem(), D = defs(), ks = Object.keys(m.sons || {}).filter(k => D[k]);
  const tot = totalSons(), n = ks.length, raros = ks.filter(k => ehRaro(k, D[k])).length;
  if (!n) return `<p class="l7-aviso">${esc(T.vazio)}</p>`;
  let h = `<div class="l7-lin"><b>${esc(T.progresso.replace('{a}', n).replace('{t}', tot || n))}</b><span class="v">${esc(T.raros.replace('{a}', raros))}</span></div><div class="l7-barra"><i style="width:${tot ? Math.round(100 * n / tot) : 100}%"></i></div>`;
  const cats = [['todos', T.sempre], ['p', T.perigo], ['h', T.historia], ['s', T.segredo], ['eu', T.eu], ['', T.outros]];
  h += `<div class="l7-sel">${cats.map(([k, nm]) => `<button class="btn ${filtroCat === k ? 'on' : ''}" data-cat="${k}">${esc(nm)}</button>`).join('')}</div>`;
  const lista = ks.filter(k => filtroCat === 'todos' || (D[k].cat || '') === filtroCat || (filtroCat === '' && !['p', 'h', 's', 'eu'].includes(D[k].cat))).sort((a, b) => (m.sons[a].t || 0) - (m.sons[b].t || 0));
  h += lista.map(k => {
    const s = m.sons[k], d = D[k];
    const L2 = (TX().lore || {})[k] || (T.ensinaCat || {})[d.cat || ''] || (T.ensinaCat || {})[''];
    return `<div class="l7-som"><span class="nm">${esc(cap1(d.t))}</span>${ehRaro(k, d) ? '<span class="rr">RARO</span>' : ''} <button class="btn" data-ouvir="${esc(k)}" style="float:right;font-size:13px;padding:2px 8px">${esc(T.ouvir)}</button><small>${esc(L2)}</small><small>${esc(T.onde)} ${esc(s.sala || '—')} · ${esc(T.vezes.replace('{n}', s.n || 1))}</small></div>`;
  }).join('');
  return h;
}
function abaSilencios() {
  const T = TX().silencios || {}, m = mem(), sil = m.sil || {}, n = Object.keys(sil).length;
  let h = `<p class="l7-aviso">${esc(T.aviso)}</p><div class="l7-lin"><b>${esc(T.titulo)}</b><span class="v">${n}/7</span></div>`;
  h += (T.lista || []).map(d => sil[d.id] ? `<div class="l7-som"><span class="nm">${esc(d.nome)}</span><small>“${esc(d.lia)}”</small></div>` : `<div class="l7-som off"><span class="nm">???</span><small>${esc(d.onde)}</small></div>`).join('');
  if (n >= 7) {
    h += `<div class="l7-lin"><b>${esc(T.filtroTitulo)}</b></div><div class="l7-sel">${(T.filtros || []).map(([k, nm]) => `<button class="btn ${(m.filtro || 'nenhum') === k ? 'on' : ''}" data-filtro="${k}">${esc(nm)}</button>`).join('')}</div>`;
  } else h += `<p class="l7-aviso">${esc(T.filtroTrava)}</p>`;
  return h;
}
function abaRadio() {
  const T = TX().radio || {}, m = mem(), rd = m.radio || {}, ok = RADIO_IDS().every(x => rd[x]);
  let h = `<p class="l7-aviso">${esc(T.aviso)}</p>`;
  h += (T.grade || []).map(g => rd[g.id] ? `<div class="l7-lin"><b>${esc(g.freq)} · ${esc(g.nome)}</b><span class="v">${esc(g.hora)}</span></div>` : `<div class="l7-lin"><b style="color:#6d6452">${esc(g.freq)} · ???</b><span class="v">—</span></div>`).join('');
  if (ok) { const f = T.final; h += `<div class="l7-lin"><b>${esc(f.freq)} · ${esc(f.nome)}</b><span class="v">${esc(f.hora)}</span></div><div class="l7-sel"><button class="btn" id="l7-final">${esc(f.botao)}</button></div><p class="l7-aviso" id="l7-final-txt">${m.radioFinal ? esc(f.texto) : ''}</p>`; }
  else h += `<div class="l7-lin"><b style="color:#6d6452">${esc(T.trancada)}</b><span class="v">—</span></div>`;
  return h;
}
function abaDesafios() {
  const T = TX(), D = T.desafios || {}, sel = modosLigados(), tt = T.termometro || {}, m = mem();
  let h = `<p class="l7-aviso">${esc(D.aviso)}</p>`;
  h += (T.modos || []).map(d => { const ab = modoAberto(d.id), on = sel.includes(d.id); return `<label class="l7-modo ${on ? '' : 'off'}"><input type="checkbox" data-modo="${d.id}" ${on ? 'checked' : ''} ${ab ? '' : 'disabled'}> <b>${esc(d.nome)}</b> <small>${esc(ab ? d.desc : T.modosTxt.travado)}</small></label>`; }).join('');
  h += `<label class="l7-modo"><input type="checkbox" id="l7-termo-cb" ${m.termometro === false ? '' : 'checked'}> <b>${esc(tt.label)}</b></label>`;
  const rec = []; if (m.recRadio != null) rec.push(`${T.modosTxt.recorde}: ${fmtC(m.recRadio)}`); if (m.recMuda != null) rec.push(`${T.modosTxt.placar}: ${fmtC(m.recMuda)}`);
  if (rec.length) h += `<p class="l7-aviso">${esc(rec.join(' · '))}</p>`;
  return h;
}
function abaFones() {
  const T = TX().fones || {}, H = T.ajuda || {}, m = mem(), aj = m.ajuda == null ? 100 : m.ajuda;
  let h = `<div class="l7-sel"><button class="btn" id="l7-f-testar">${esc(T.testar)}</button></div>`;
  if (m.fones) h += `<p class="l7-aviso">último teste: esquerdo ${m.fones.e ? 'ouvido' : 'não ouvido'} · direito ${m.fones.d ? 'ouvido' : 'não ouvido'}</p>`;
  h += `<div class="l7-lin"><b>${esc(H.titulo)}</b><span class="v">${aj}%</span></div><div class="l7-barra"><i style="width:${aj}%"></i></div><p class="l7-aviso">${esc(H.desc)}</p>`;
  h += `<label class="l7-modo"><input type="checkbox" id="l7-trava" ${m.ajudaTrava ? 'checked' : ''}> <b>${esc(H.travar)}</b></label><div class="l7-sel"><button class="btn" id="l7-zerar">${esc(H.zerar)}</button></div>`;
  return h;
}
function abaNoite() {
  const T = TX().noite || {}, u = mem().ultima;
  if (!u) return `<p class="l7-aviso">${esc(T.vazio)}</p>`;
  return `<canvas class="l7-cv" id="l7-cv2" width="640" height="180"></canvas><p class="l7-aviso">${esc(T.legenda)}</p><div class="l7-lin"><b>barulho</b><span class="v">${esc(mmss(u.loud))}</span></div><div class="l7-lin"><b>silêncio</b><span class="v">${esc(mmss(u.sil))}</span></div><div class="l7-lin"><b>te ouviu</b><span class="v">${(u.ouviu || []).length}x</span></div><div class="l7-lin"><b>selo de furtividade</b><span class="v">${esc(u.selo ? TX().selosRuido[u.selo] : '—')}</span></div><div class="l7-sel"><button class="btn" id="l7-baixar2">${esc(T.baixar)}</button><button class="btn" id="l7-fita2">${esc(T.fita)}</button></div>`;
}
function abaFita() {
  const T = TX().fita || {}, ac = (() => { try { return A.acervo() || {}; } catch (e) { return {}; } })();
  const tem = !!ac.f2 || !!(C.S && C.S.fitas && C.S.fitas.f2);
  if (!tem) return `<p class="l7-aviso">${esc(T.sem)}</p>`;
  return `<p class="l7-aviso">${esc(T.dica)}</p><canvas class="l7-cv" id="l7-esp" width="360" height="180"></canvas><div class="l7-sel"><button class="btn" id="l7-esp-ouvir">${esc(T.ouvir)}</button></div><p class="l7-aviso" id="l7-esp-txt">${mem().espectro ? esc(T.revelado) : ''}</p>`;
}
function ligarCorpo(aba) {
  try {
    const L7 = $('#pn-lista');
    if (aba === 'caderno' || aba == null) {
      L7.querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { filtroCat = b.dataset.cat; openHub('caderno'); });
      L7.querySelectorAll('[data-ouvir]').forEach(b => b.onclick = () => ouvirDeNovo(b.dataset.ouvir));
    }
    if (aba === 'silencios') L7.querySelectorAll('[data-filtro]').forEach(b => b.onclick = () => { mudar(m => { m.filtro = b.dataset.filtro; }); aplicarFiltro(); openHub('silencios'); });
    if (aba === 'radio') { const b = $('#l7-final'); if (b) b.onclick = estacaoFinal; }
    if (aba === 'desafios') {
      L7.querySelectorAll('[data-modo]').forEach(cb => cb.onchange = () => { C.OPT.l7modos = [...L7.querySelectorAll('[data-modo]:checked')].map(x => x.dataset.modo); try { C.salvarOpt(); } catch (e) {} openHub('desafios'); });
      const t = $('#l7-termo-cb'); if (t) t.onchange = () => mudar(m => { m.termometro = t.checked; });
    }
    if (aba === 'fones') {
      const b = $('#l7-f-testar'); if (b) b.onclick = testeFones;
      const t = $('#l7-trava'); if (t) t.onchange = () => mudar(m => { m.ajudaTrava = t.checked; });
      const z = $('#l7-zerar'); if (z) z.onclick = () => { mudar(m => { const ant = m.ajuda == null ? 100 : m.ajuda; m.ajuda = 0; if (ant > 0) conq('l7_sem_rodinhas'); }); openHub('fones'); };
    }
    if (aba === 'noite') {
      const u = mem().ultima; audiograma($('#l7-cv2'), u);
      const b = $('#l7-baixar2'); if (b) b.onclick = () => baixarAudiograma($('#l7-cv2'), u && u.semente);
      const f = $('#l7-fita2'); if (f) f.onclick = ev => gravarFita(u, ev.target);
    }
    if (aba === 'fita') { const cv = $('#l7-esp'); if (cv) espectro(cv); }
  } catch (e) {}
}
function ouvirDeNovo(k) {
  try {
    try { C.iniciarAudio(); } catch (e) {}
    replaying = true;
    try { const P = C.P, a = lastArgs[k] || [{ x: P.pos.x, y: 1.5, z: P.pos.z - 3 }]; C.SFX[k](...a); } catch (e) {}
    replaying = false;
    const m = mem(); m.galeria = (m.galeria || 0) + 1; salvar(); if (m.galeria >= 10) conq('l7_sala_som');
    if (!m.avisouReplay) { m.avisouReplay = true; salvar(); try { C.toast(TX().sons.semReplay); } catch (e) {} }
  } catch (e) { replaying = false; }
}
function estacaoFinal() {
  try {
    const f = (TX().radio || {}).final, ac = ac7(); const el = $('#l7-final-txt');
    if (ac) { const t = ac.currentTime + .1; tom(ac, t, 880, .8, .05, -.3, 'triangle'); tom(ac, t + .3, 1320, .8, .04, .3, 'triangle'); const b = ac.createBufferSource(); b.buffer = ruidoBuf(ac, 2); const bf = ac.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 2400; bf.Q.value = 6; const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.12 * volume(), t + .3); g.gain.linearRampToValueAtTime(.0001, t + 1.8); b.connect(bf); bf.connect(g); g.connect(ac.destination); b.start(t); b.stop(t + 2); }
    if (el) el.textContent = f.texto; mudar(m => { m.radioFinal = true; }); conq('l7_estacao_final');
  } catch (e) {}
}
// ---------------------------------------------------------------- espectrograma da fita 2
function mascaraRosto() {
  const o = document.createElement('canvas'); o.width = 90; o.height = 45; const g = o.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, 90, 45); g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 2;
  g.beginPath(); g.ellipse(45, 22, 17, 20, 0, 0, 7); g.stroke();
  g.beginPath(); g.arc(38, 17, 2.6, 0, 7); g.fill(); g.beginPath(); g.arc(52, 17, 2.6, 0, 7); g.fill();
  g.beginPath(); g.moveTo(45, 19); g.lineTo(43, 27); g.lineTo(46, 27); g.stroke();
  g.beginPath(); g.moveTo(39, 33); g.lineTo(51, 33); g.stroke();
  g.font = 'bold 7px monospace'; g.fillText('1979', 66, 42);
  const d = g.getImageData(0, 0, 90, 45).data, m = []; for (let y = 0; y < 45; y++) { const row = []; for (let x = 0; x < 90; x++) row.push(d[(y * 90 + x) * 4] / 255); m.push(row); }
  return m;
}
function espectro(cv) {
  try {
    const g = cv.getContext('2d'), mask = mascaraRosto(), W = cv.width, H = cv.height; let rev = !!mem().espectro, sem = 7;
    const rnd = () => { sem = (sem * 1664525 + 1013904223) >>> 0; return sem / 4294967296; };
    const ruido = []; for (let y = 0; y < 45; y++) { const r = []; for (let x = 0; x < 90; x++) r.push(rnd()); ruido.push(r); }
    const desenha = () => {
      g.fillStyle = '#0c0a08'; g.fillRect(0, 0, W, H); const cw = W / 90, ch = H / 45;
      for (let y = 0; y < 45; y++) for (let x = 0; x < 90; x++) { const v = ruido[y][x] * .42 + mask[y][x] * (rev ? .85 : .1); if (v < .05) continue; g.fillStyle = `rgba(201,${150 + Math.round(v * 80)},${70 + Math.round(v * 60)},${clamp(v, 0, 1)})`; g.fillRect(x * cw, y * ch, cw + .5, ch + .5); }
      g.fillStyle = '#857a63'; g.font = '10px monospace'; g.fillText('Hz', 3, 11); g.fillText('tempo →', W - 56, H - 4);
    };
    desenha();
    cv.onclick = ev => {
      const r = cv.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      if (x > .3 && x < .72 && y > .08 && y < .92 && !rev) { rev = true; desenha(); mudar(m => { m.espectro = Date.now(); }); conq('l7_espectro'); const t = $('#l7-esp-txt'); if (t) t.textContent = TX().fita.revelado + ' ' + TX().fita.nota; try { C.toast(TX().fita.nota); } catch (e) {} }
    };
    const ob = $('#l7-esp-ouvir'); if (ob) ob.onclick = () => {
      const ac = ac7(); if (!ac) return; const dur = 4, t0 = ac.currentTime + .1, N = 45, passos = 120;
      for (let i = 0; i < 28; i++) {
        const row = Math.floor(44 - i * 44 / 27), o = ac.createOscillator(), gg = ac.createGain(); o.frequency.value = 180 * Math.pow(1.12, i); o.type = 'sine';
        const curva = new Float32Array(passos); for (let s = 0; s < passos; s++) { const col = Math.floor(s / passos * 90); curva[s] = (mask[row][col] * (rev ? 1 : .15) + ruido[row][col] * .25) * .03 * volume(); }
        gg.gain.setValueCurveAtTime(curva, t0, dur); o.connect(gg); gg.connect(ac.destination); o.start(t0); o.stop(t0 + dur + .1);
      }
    };
  } catch (e) {}
}

// ---------------------------------------------------------------- teclas
function observarTeclas() {
  addEventListener('keydown', e => {
    try { keysDown[e.code] = true; if (e.code === 'KeyQ' && C && C.S && C.S.l7) ultQ = C.S.l7.t; } catch (x) {}
  });
  addEventListener('keyup', e => { try { keysDown[e.code] = false; } catch (x) {} });
}

// ---------------------------------------------------------------- API
export const L7 = {
  ligar(ctx, api) { C = ctx; A = api; try { css(); observarTeclas(); } catch (e) {} },
  titulo, tecla, novoJogo, tick, difMod, difKey, fimCap, morte, final, telaFinal, pausa, statsLinhas,
  teste: { gravarFita, wavBytes }
};
