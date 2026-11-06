// PROGRESSÃO — LOTE 6, 2ª rodada (rejogabilidade): Calor da Casa (1 a 10), Dádivas da Noite entre capítulos com
// preço escrito, Trato vermelho, combinações secretas, apostas, estilo da Lia (epítetos e desafio pessoal),
// estrelas por capítulo, temperatura do medo, necrológio, relíquia herdada, Hora Zero, calendário de velas,
// tarefas do dia e da semana, maldição do mês, Cera de vela e Altar, sementes lendárias e favoritas, alvo de
// tempo do amigo e recordes por categoria. Ligado por src/progressao.js (L7); texto em progressao-lote7-roteiro.js.
// Tudo passivo e à prova de erro: sem escolha do jogador, o jogo se comporta como antes (Calor 1, nenhuma carta).
import './progressao-lote7-roteiro.js';

const K = 'hora-silencio-l7';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const TX = () => (window.ROTEIRO.progressao || {}).lote7 || {};
const ROM = ['Prólogo', 'Capítulo I', 'Capítulo II', 'Capítulo III', 'Capítulo IV', 'Capítulo V'];
const DIFL = { facil: 'F', normal: 'N', pesadelo: 'P' };
let C = null, A = null;
const mem = () => { try { return A.ls.get(K, {}) || {}; } catch (e) { return {}; } };
const mudar = fn => { const m = mem(); try { fn(m); } catch (e) {} try { A.ls.set(K, m); } catch (e) {} return m; };
const conq = id => { try { A.conquista(id); } catch (e) {} };
const stats = () => { try { return A.stats() || {}; } catch (e) { return {}; } };
const finaisTotal = () => { try { return Object.values(stats().finais || {}).reduce((a, b) => a + (b || 0), 0); } catch (e) { return 0; } };
const algumFinal = () => finaisTotal() > 0;
const fmtC = s => { try { return A.fmtC(s); } catch (e) { return Math.round(s) + 's'; } };
const num = n => (n || 0).toLocaleString('pt-BR');
const pad = n => String(n).padStart(2, '0');
const chaveDia = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hoje = () => chaveDia(new Date());
const segunda = () => { const x = new Date(); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return chaveDia(x); };
function fnv(str) { let h = 0x811c9dc5; str = String(str); for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; }
function mkrng(seed) { let a = fnv(seed) || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function embaralha(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const lstr = (t, o) => String(t || '').replace(/\{(\w+)\}/g, (_, k) => (o && o[k] != null ? o[k] : ''));

// ---------------------------------------------------------------- estilo
function css() {
  if ($('#l7-css')) return;
  const s = document.createElement('style'); s.id = 'l7-css';
  s.textContent = `[hidden]{display:none!important}
#l7-faixa{text-align:center;color:#9a8f73;font-family:"Special Elite",monospace;font-size:13px;margin:4px 0 0;letter-spacing:.04em}
#l7-faixa b{color:#c9a75a}#l7-falta{text-align:center;color:#857a63;font-style:italic;font-size:13px;margin:2px 0 0}
#l7-fc{margin:12px auto 4px;max-width:920px;text-align:center}
#l7-fc h4{font-family:"IM Fell English SC",Georgia,serif;letter-spacing:.14em;font-weight:normal;color:#9a8f73;margin:8px 0 6px;font-size:14px}
.l7-linha{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.l7-carta{flex:1 1 200px;max-width:290px;text-align:left;background:#0d0b09;border:1px solid #3a3226;color:#cfc3a6;padding:9px 11px;cursor:pointer;font:inherit;font-size:14px;line-height:1.35}
.l7-carta b{display:block;color:#e9dfc8;font-weight:normal;letter-spacing:.05em;margin-bottom:3px}
.l7-carta i{display:block;font-style:normal}.l7-carta .g{color:#9bbf8a}.l7-carta .p{color:#c98a7a}
.l7-carta.trato{border-color:#8a2a22;background:#150a09}.l7-carta.trato b{color:#e9a89a}
.l7-carta.on{outline:2px solid #c9a75a}.l7-carta[disabled]{opacity:.45;cursor:default}.l7-carta.on[disabled]{opacity:1}
.l7-msg{color:#9a8f73;font-size:13px;margin:6px 0;min-height:1em}
#l7-alvo{position:fixed;top:8px;right:12px;z-index:30;font-family:"Special Elite",monospace;font-size:13px;color:#cfc3a6;background:rgba(0,0,0,.45);padding:3px 8px;pointer-events:none}
#l7-alvo.atras{color:#d98a7a}#l7-alvo.frente{color:#9bbf8a}
#l7-rec{position:fixed;top:8px;left:12px;z-index:30;font-family:"Special Elite",monospace;font-size:14px;color:#e8d8c0;letter-spacing:.08em;pointer-events:none;text-shadow:0 0 2px #000}
#l7-rec i{color:#d33;font-style:normal;animation:l7blink 1s steps(2) infinite}@keyframes l7blink{50%{opacity:0}}
.l7-hz #bars,.l7-hz #inv-mini,.l7-hz #obj,.l7-hz #crono,.l7-hz #cron{display:none!important}
.l7-est{letter-spacing:.25em;color:#c9a75a;font-size:17px}.l7-est .off{color:#3a3226}
.l7-giz{font-family:"Special Elite",monospace;color:#cfc3a6;font-size:13px;line-height:1.5}
.l7-rel{margin:10px auto;max-width:920px;text-align:center}
.l7-ep{text-align:center;margin:10px 0;color:#cfc3a6}.l7-ep b{color:#c9a75a;font-size:19px;font-weight:normal;letter-spacing:.06em}`;
  document.head.appendChild(s);
}

// ---------------------------------------------------------------- estado da noite (S.l7, vai junto no checkpoint)
function nova() {
  return { dad: [], trato: null, tratoCap: -1, mal: [], rel: null, calor: 1, mes: 0, hz: 0, castigo: -1, aposta: null, ev: {}, c: novoC(), t: { tot: 0, corre: 0, agacha: 0, esc: 0, parado: 0, luz: 0, escuro: 0, dano: 0, garr: 0 },
    perto: 0, bingo: [], bingoLin: 0, bingoCheio: 0, pts: 0, cera: 0, apostasOk: 0, extraPend: null, morteCap: {}, morteCorrendo: 0, combos: {}, tratosOk: 0, dadN: 0, marcada: 0, dp: null, alvo: null, imp: 0, primeira: false, _cap: 0, _h: 100, _f: false };
}
function novoC() { return { esc: 0, escSeq: 0, corre: 0, agach: 0, parado: 0, paradoEscuro: 0, luz: 0, escuro: 0, fear: 0, t: 0, ouviu: 0, perto: 0, toggles: 0, usouEsc: false, garrT: -99 }; }
const est = S => (S.l7 && S.l7.dad ? S.l7 : (S.l7 = nova()));

// ---------------------------------------------------------------- efeitos (Calor, Dádivas, relíquia, aposta quebrada)
const NEUTRO = () => ({ ruido: 1, ouvido: 1, vel: 1, pilha: 1, dano: 1, intervalo: 1, aviso: 0 });
function juntar(o, ef) { if (!ef) return; for (const k in ef) { if (k === 'aviso') o.aviso += ef.aviso; else o[k] = (o[k] || 1) * ef[k]; } }
function cartaPorId(id) { const T = TX(); return [].concat(T.cartas || [], T.bloqueadas || [], T.tratos || [], T.maldicoes || [], T.reliquias || []).find(x => x.id === id); }
function efCalor(n) { const e = NEUTRO(); if (n > 1) { const k = n - 1; e.ouvido = 1 + .04 * k; e.pilha = 1 + .03 * k; e.vel = 1 + .015 * k; e.intervalo = Math.max(.6, 1 - .03 * k); if (n >= 4) e.aviso = -(.3 * (n - 3)); } return e; }
function combosAtivos(L) { return (TX().combos || []).filter(c => (L.dad || []).includes(c.a) && (L.dad || []).includes(c.b)); }
function difKey(S) {
  const L = S && S.l7; if (!L || !L.dad) return '';
  return [L.dad.join('.'), L.trato || '', (L.mal || []).join('.'), L.rel || '', L.calor || 1, L.mes || 0, L.castigo === S.chapter ? 1 : 0, (L.imp && S.chapter <= 1) ? 1 : 0, L.marcada === 66 ? 1 : 0].join(',');
}
let cache = { k: null, v: null };
function agg(S) {
  const k = difKey(S); if (cache.k === k && cache.v) return cache.v;
  const o = NEUTRO(), L = S && S.l7;
  if (L && L.dad) {
    for (const id of L.dad) juntar(o, (cartaPorId(id) || {}).ef);
    for (const cb of combosAtivos(L)) juntar(o, cb.ef);
    if (L.trato) juntar(o, (cartaPorId(L.trato) || {}).ef);
    for (const id of L.mal || []) juntar(o, (cartaPorId(id) || {}).ef);
    if (L.rel) juntar(o, (cartaPorId(L.rel) || {}).ef);
    juntar(o, efCalor(L.calor || 1));
    if (L.mes) { const m = (TX().meses || [])[L.mes - 1]; juntar(o, m && m.ef); }
    if (L.castigo === S.chapter) juntar(o, { ouvido: 1.1 });
    if (L.imp && S.chapter <= 1) juntar(o, { ouvido: 1.08 });
    if (L.marcada === 66) juntar(o, { ouvido: 1.1 });
  }
  cache = { k, v: o }; return o;
}
function difMod(v, S) {
  try {
    if (!S || !S.l7) return; const e = agg(S);
    v.ouvido *= e.ouvido; v.vel *= e.vel; v.pilha *= e.pilha; v.dano = (v.dano || 1) * e.dano; v.intervalo = (v.intervalo || 1) * e.intervalo;
    if (e.aviso) v.aviso = Math.max(1.5, (v.aviso || 7) + e.aviso);
  } catch (err) {}
}
function ruidoMul() { try { const S = C && C.S; if (!S || !S.l7) return 1; return agg(S).ruido; } catch (e) { return 1; } }

// ---------------------------------------------------------------- Cera, patentes, estrelas (leituras)
function cera(n, motivo) { if (!n) return; mudar(m => { m.cera = (m.cera || 0) + n; m.ceraTotal = (m.ceraTotal || 0) + n; }); try { const L = est(C.S); L.cera = (L.cera || 0) + n; } catch (e) {} if ((mem().ceraTotal || 0) >= 100) conq('l7_cera100'); }
function totalEstrelas(m) { let n = 0; for (const id in (m.est || {})) for (const k in m.est[id]) if (m.est[id][k]) n++; return n; }
function pontosCasa() {
  const m = mem(); let cq = 0; try { cq = Object.keys(A.ls.get(C.KEYS.CONQ_KEY, {}) || {}).length; } catch (e) {}
  return (m.noites || 0) + 4 * finaisTotal() + Math.floor(cq / 2) + totalEstrelas(m);
}
function patenteIdx() { const p = pontosCasa(), lim = TX().patenteLim || [0]; let i = 0; for (let k = 0; k < lim.length; k++) if (p >= lim[k]) i = k; return i; }
function checarPatente() { try { const i = patenteIdx(); if (i >= 5) conq('l7_patente6'); if (i >= 11) conq('l7_patente12'); } catch (e) {} }
function baralho() { const T = TX(), m = mem(), desb = m.desbloq || {}; return { total: (T.cartas || []).length + (T.bloqueadas || []).length, tem: (T.cartas || []).length + (T.bloqueadas || []).filter(c => desb[c.id]).length }; }
function checaDesbloqueios() {
  try {
    const m = mem(), cq = A.ls.get(C.KEYS.CONQ_KEY, {}) || {}, sg = stats();
    const ok = { sangue_frio: (sg.l6perto || 0) >= 10, maos_limpas: !!(cq.sem_garrafa), pulmao_ferro: (sg.capsS || 0) >= 1, herdeira: algumFinal() };
    let mudou = false; const desb = { ...(m.desbloq || {}) };
    for (const id in ok) if (ok[id] && !desb[id]) { desb[id] = 1; mudou = true; }
    if (mudou) mudar(mm => { mm.desbloq = desb; });
    return mudou;
  } catch (e) { return false; }
}
function maxCalor() { return Math.min(10, 1 + finaisTotal()); }
function sequenciaDias(m) { let n = 0; const d = new Date(); const dias = m.dias || {}; if (!dias[chaveDia(d)]) d.setDate(d.getDate() - 1); while (dias[chaveDia(d)]) { n++; d.setDate(d.getDate() - 1); } return n; }

// ---------------------------------------------------------------- bingo da noite e tarefas do dia
function bingoDaSemente(sem) { const it = (TX().bingo || {}).itens || []; return embaralha(it.map(x => x.ev), mkrng('bingo' + sem)).slice(0, 9); }
function tarefasHoje() { const t = TX().tarefasDia || []; return embaralha(t, mkrng('tarefas' + hoje())).slice(0, 3); }
function missoesSemana() { const t = TX().semana || []; return embaralha(t, mkrng('semana' + segunda())).slice(0, 3); }
const LINHAS = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
let fila = [], filaT = 4;
function aviso(txt, lia) { fila.push({ txt, lia }); }
function ev(S, k) {
  const L = est(S); if (L.ev[k]) return; L.ev[k] = 1;
  try {
    // bingo
    const b = L.bingo || [], marc = b.map(e => !!L.ev[e]);
    const lin = LINHAS.filter(l => l.every(i => marc[i])).length;
    if (lin > (L.bingoLin || 0)) { L.bingoLin = lin; L.pts += 300; cera(10); conq('l7_bingo'); aviso((TX().bingo || {}).linha); }
    if (marc.length === 9 && marc.every(x => x) && !L.bingoCheio) { L.bingoCheio = 1; L.pts += 1000; conq('l7_bingo_cheio'); aviso((TX().bingo || {}).cheia); }
    // tarefas do dia
    const h = hoje(), tf = tarefasHoje(), m = mem(), feitas = ((m.tarefas || {})[h]) || [];
    const novas = tf.filter(t => t.ev === k && !feitas.includes(t.id));
    if (novas.length) {
      mudar(mm => { mm.tarefas = { [h]: Array.from(new Set([...(((mm.tarefas || {})[h]) || []), ...novas.map(t => t.id)])) }; });
      const tot = (((mem().tarefas || {})[h]) || []).length;
      aviso('Tarefa do dia cumprida: ' + novas[0].nome + ` (${tot}/3)`);
      if (tot >= 3 && !(mem().tarefasPagas || {})[h]) { mudar(mm => { mm.tarefasPagas = { [h]: 1 }; mm.diasTarefas = (mm.diasTarefas || 0) + 1; }); cera(20); conq('l7_tarefas'); aviso('As três tarefas do dia estão feitas: +20 de Cera.'); }
    }
  } catch (e) {}
}

// ---------------------------------------------------------------- título
function injetar() {
  try {
    const menu = $('#title .menu');
    if (menu && !$('#b-l7')) {
      const b = document.createElement('button'); b.className = 'btn'; b.id = 'b-l7'; b.textContent = TX().botao || 'A Casa'; b.onclick = () => openHub('calor');
      const ref = $('#b-rejogo') || $('#b-stats') || $('#b-caps'); if (ref) ref.insertAdjacentElement('afterend', b); else menu.appendChild(b);
    }
    if (menu && !$('#l7-faixa')) {
      const f = document.createElement('div'); f.id = 'l7-faixa'; f.hidden = true; const g = document.createElement('div'); g.id = 'l7-falta'; g.hidden = true;
      const ref = $('#l6-faixa') || $('#title .opts') || menu; ref.insertAdjacentElement(ref.id === 'l6-faixa' ? 'afterend' : 'beforebegin', f); f.insertAdjacentElement('afterend', g);
    }
  } catch (e) {}
}
function tituloAtivo(m) { const a = (TX().altar || []).find(x => x.id === m.altarUsa); return a ? a.nome : ''; }
function titulo() {
  try {
    injetar(); css();
    document.body.classList.remove('l7-hz'); recHud(false); alvoHud(null);
    fila = []; checaDesbloqueios(); checarPatente();
    const T = TX(), m = mem(), el = $('#l7-faixa'), fl = $('#l7-falta');
    if (el) {
      const p = [], i = patenteIdx(), tt = tituloAtivo(m);
      p.push(`<b>${esc((T.patentes || [])[i] || '')}</b>${tt ? ' · ' + esc(tt) : ''}`);
      if (algumFinal()) p.push(`Calor <b>${Math.min(((m.calor || {}).sel || 1), maxCalor())}</b>/${maxCalor()}`);
      const sr = (m.serie || 0); if (sr > 0) p.push(`série <b>${sr}</b>`);
      const dv = sequenciaDias(m); if (dv > 1) p.push(`${dv} velas seguidas`);
      if (m.cera) p.push(`Cera <b>${m.cera}</b>`);
      if (m.rel) { const r = cartaPorId(m.rel); if (r) p.push(`${esc((T.relTxt || {}).mala || 'Na mala')}: <b>${esc(r.nome)}</b>`); }
      if (m.hz && m.hz.sel && finaisTotal() >= 3) p.push('<b>Hora Zero</b>');
      el.innerHTML = p.join(' · '); el.hidden = !p.length;
    }
    if (fl) {
      let tx = '';
      if (m.ultimo) { const d = Math.floor((Date.now() - m.ultimo) / 864e5); const cd = T.calendario || {}; if (d >= 14) tx = lstr(cd.falta14, { d }); else if (d >= 3) tx = lstr(cd.falta, { d }) + ' ' + (cd.volta || ''); }
      fl.textContent = tx; fl.hidden = !tx;
    }
  } catch (e) {}
}
function tecla() { return false; }

// ---------------------------------------------------------------- novo jogo
function novoJogo(S) {
  try {
    css();
    const m0 = mem(), T = TX(), L = S.l7 = nova();
    const fin = finaisTotal(), max = Math.min(10, 1 + fin);
    L.calor = Math.min(((m0.calor || {}).sel || 1), max); L.maxIni = max;
    const n = (m0.noites || 0) + 1; L.noite = n; L.marcada = [7, 13, 31, 66].includes(n) ? n : 0;
    L.primeira = (stats().partidas || 0) <= 1;
    L.hz = (m0.hz && m0.hz.sel && fin >= 3) ? 1 : 0;
    L.mes = m0.mesOn ? new Date().getMonth() + 1 : 0;
    L.rel = m0.rel || null; L.dp = m0.dpAceito || null; L.bingo = bingoDaSemente(S.semente);
    if (m0.ultimo) { const d = Math.floor((Date.now() - m0.ultimo) / 864e5); L.dias = d; if (d >= 14) L.imp = 1; }
    if (m0.alvoPend && S.semente === m0.alvoPend.sem) L.alvo = m0.alvoPend;
    const extra = { pilhas: 0, kits: 0 };
    if (L.rel) { const r = cartaPorId(L.rel); if (r && r.extra) { extra.pilhas += r.extra.pilhas || 0; extra.kits += r.extra.kits || 0; } conq('l7_herdeira'); }
    if (L.imp) extra.pilhas += 1;
    L.extraPend = (extra.pilhas || extra.kits) ? extra : null;
    if (L.hz) S.modo = { ...(S.modo || {}), umaVida: true };
    const d = new Date(), datas = {};
    for (const x of T.datas || []) { if (x.id === 'sexta13' ? (d.getDay() === 5 && d.getDate() === 13) : (d.getDate() === x.dia && d.getMonth() + 1 === x.mes)) datas[x.id] = 1; }
    mudar(m => {
      m.noites = n; m.ultimo = Date.now(); m.dias = m.dias || {}; m.dias[hoje()] = 1;
      const ks = Object.keys(m.dias).sort(); while (ks.length > 90) delete m.dias[ks.shift()];
      m.rel = null; m.dpAceito = null; if (m.alvoPend && S.semente === m.alvoPend.sem) m.alvoPend = null;
      m.datas = m.datas || {}; for (const id in datas) { if (!m.datas[id]) aviso('Data especial: ' + ((T.datas || []).find(x => x.id === id) || {}).nome); m.datas[id] = 1; }
      if (L.primeira && !m.primeiraData) m.primeiraData = hoje();
    });
    const m1 = mem();
    if ((T.datas || []).length && (T.datas || []).every(x => (m1.datas || {})[x.id])) conq('l7_datas');
    const sq = sequenciaDias(m1); if (sq >= 7) conq('l7_vela7'); if (Object.keys(m1.dias || {}).length >= 30) conq('l7_vela30');
    if (L.marcada && T.noitesMarcadas) aviso(T.noitesMarcadas[L.marcada], true);
    if (L.hz) aviso('Hora Zero: uma vida, nenhuma barra, uma maldição a cada capítulo.');
    if (L.alvo) aviso(lstr((T.alvo || {}).hud, { n: L.alvo.nome, t: fmtC(L.alvo.seg) }));
    if (L.imp) aviso(lstr((T.calendario || {}).falta14, { d: L.dias }), true);
    if (L.dp) { const dp = Object.values(T.desafiosPessoais || {}).find(x => x.id === L.dp); if (dp) aviso('Desafio pessoal: ' + dp.nome + '. ' + dp.desc); }
    fila.timer = 5;
  } catch (e) {}
}

// ---------------------------------------------------------------- tick (leve)
function recHud(on, S) {
  let el = $('#l7-rec');
  if (!on) { if (el) el.hidden = true; return; }
  if (!el) { el = document.createElement('div'); el.id = 'l7-rec'; document.body.appendChild(el); }
  el.hidden = false; const t = Math.floor(S.tempo || 0); el.innerHTML = `<i>●</i> REC ${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`;
}
function alvoHud(S) {
  let el = $('#l7-alvo');
  if (!S || !S.l7 || !S.l7.alvo) { if (el) el.hidden = true; return; }
  const al = S.l7.alvo;
  if (!el) { el = document.createElement('div'); el.id = 'l7-alvo'; document.body.appendChild(el); }
  let f = 0; try { const cap = window.ROTEIRO.capitulos[S.chapter]; const feitos = cap.objetivos.filter(o => S.done[o.id]).length; f = (S.chapter + feitos / cap.objetivos.length) / window.ROTEIRO.capitulos.length; } catch (e) {}
  const esperado = al.seg * f, dif = (S.tempo || 0) - esperado, ahead = dif <= 0;
  el.hidden = false; el.className = ahead ? 'frente' : 'atras';
  el.textContent = `${lstr((TX().alvo || {}).hud, { n: al.nome, t: fmtC(al.seg) })} · ${ahead ? '−' : '+'}${fmtC(Math.abs(dif))}`;
}
const ATENTO = ['investiga', 'alerta', 'caca', 'bote', 'agarra'];
function tick(dt) {
  try {
    const S = C.S, P = C.P, M = C.M; if (!S || C.mode !== 'jogo') return;
    const L = est(S);
    if (L._cap !== S.chapter) { L._cap = S.chapter; L.c = novoC(); }
    const c = L.c, t = L.t;
    t.tot += dt; c.t += dt;
    if (P.sprinting) { t.corre += dt; c.corre += dt; }
    if (P.crouch) { t.agacha += dt; c.agach += dt; }
    if (S.hidden) { t.esc += dt; c.esc += dt; c.escSeq += dt; c.usouEsc = true; } else c.escSeq = 0;
    const parado = (P.noiseR || 0) === 0 && !S.hidden;
    if (parado) { t.parado += dt; c.parado += dt; if (!S.flashOn) c.paradoEscuro += dt; }
    if (S.flashOn) { t.luz += dt; c.luz += dt; }
    if (!S.flashOn && P.room && !P.room.fora) { t.escuro += dt; c.escuro += dt; }
    if (!!S.flashOn !== L._f) { L._f = !!S.flashOn; c.toggles++; }
    c.fear += (S.fear || 0) * dt;
    if ((S.health || 100) < L._h - .01) t.dano += L._h - S.health; L._h = S.health == null ? 100 : S.health;
    if ((S.garrafasUsadas || 0) > t.garr) { t.garr = S.garrafasUsadas; c.garrT = S.tempo; }
    if (M && M.ativo && !S.dead) {
      if (ATENTO.includes(M.state)) c.ouviu += dt;
      if (!S.hidden) { const d = M.pos.distanceTo(P.pos); if (d < 1.6) L._cc = true; else if (L._cc && d > 4) { L._cc = false; L.perto++; c.perto++; semanaAdd('perto', 1); ev(S, 'perto'); } } else L._cc = false;
    } else L._cc = false;
    // eventos do bingo e das tarefas
    if (S.hidden) ev(S, 'esc'); if (t.garr > 0) ev(S, 'garr'); if (t.agacha >= 20) ev(S, 'agach'); if (t.corre >= 15) ev(S, 'corre'); if (t.parado >= 30) ev(S, 'parada');
    if ((S.kitsUsados || 0) > 0) ev(S, 'kit'); if (S.flashOn) ev(S, 'luz'); if (t.escuro >= 60) ev(S, 'escuro'); if (S.chapter >= 2) ev(S, 'cap2');
    if ((S.capLore || 0) > 0) ev(S, 'lore'); if ((S.chamResp || 0) > 0) ev(S, 'chamResp'); if ((S.chamIgn || 0) > 0) ev(S, 'chamIgn'); if (t.dano > 0) ev(S, 'dano');
    // vergonhas
    if (c.paradoEscuro >= 180) conq('l7_v_escuro'); if (c.toggles >= 20) conq('l7_v_pisca'); if (c.escSeq >= 90) conq('l7_v_armario');
    // extras iniciais (pilha da herança, boas-vindas)
    if (L.extraPend && S.inv) { S.inv.pilhas = (S.inv.pilhas || 0) + (L.extraPend.pilhas || 0); S.inv.kits = (S.inv.kits || 0) + (L.extraPend.kits || 0); L.extraPend = null; try { C.toast('Uma coisa a mais no porta-malas.'); } catch (e) {} }
    // modos visuais e marcas de noite
    if (L.hz) document.body.classList.add('l7-hz');
    if (L.marcada === 13) recHud(true, S); else recHud(false);
    alvoHud(S);
    if (L.marcada === 7 && S.chapter >= 1 && !L.sete) { L.sete = 1; try { C.SFX.badaladas(7); } catch (e) {} }
    // dívida do Inspetor
    if (!L.cobrou && S.chapter >= 1 && c.t > 6 && (mem().divida || 0) >= 10) { L.cobrou = 1; try { C.sub('inspetor', (TX().divida || {}).fala); } catch (e) {} }
    // avisos em fila
    fila.timer = (fila.timer == null ? 4 : fila.timer) - dt;
    if (fila.length && fila.timer <= 0 && !S.dead) { const f = fila.shift(); fila.timer = 5.5; try { f.lia ? C.sub('lia', f.txt) : C.toast(f.txt); } catch (e) {} }
  } catch (e) {}
}

// ---------------------------------------------------------------- semana
function semanaAdd(chave, n) {
  try {
    const seg = segunda(); let feitoAgora = false;
    mudar(m => {
      if (!m.sem || m.sem.w !== seg) m.sem = { w: seg, v: {}, pago: false };
      m.sem.v[chave] = (m.sem.v[chave] || 0) + n;
      if (!m.sem.pago && missoesSemana().every(x => (m.sem.v[x.id === 'perto' ? 'perto' : x.id] || 0) >= x.alvo)) { m.sem.pago = true; feitoAgora = true; }
    });
    if (feitoAgora) { cera(60); conq('l7_semana'); aviso('As três missões da semana estão cumpridas: +60 de Cera.'); }
  } catch (e) {}
}

// ---------------------------------------------------------------- fim de capítulo
function medoFaixa(c, S) {
  const ct = Math.max(30, c.t), score = (c.fear / ct) * .8 + 100 * (c.escuro / ct) * .25 + c.perto * 6 + (S.capVisto || 0) * 3 + (S.capMortes || 0) * 5;
  return score < 12 ? 0 : score < 25 ? 1 : score < 40 ? 2 : score < 60 ? 3 : 4;
}
function fecharCap(S, cap, r, ultimo) {
  const T = TX(), L = est(S), c = L.c, linhas = [], m0 = mem(), mt = r.meta || { s: 8 };
  const ouroMin = mt.s * .72, minEf = (r.tEf != null ? r.tEf : S.capT) / 60;
  // estrelas
  const ganhas = { t: 1, d: !!(r.selos || {}).intocada, l: (S.capLuzT || 0) < 5, e: !c.usouEsc, o: minEf < ouroMin };
  const antes = (m0.est || {})[cap.id] || {}, novas = [];
  const nomes = (T.estrelas || {}).nomes || [], ks = ['t', 'd', 'l', 'e', 'o'];
  ks.forEach((k, i) => { if (ganhas[k] && !antes[k]) novas.push(nomes[i]); });
  const apos = {}; ks.forEach(k => { apos[k] = !!(antes[k] || ganhas[k]); });
  const sNoite = ks.filter(k => ganhas[k]).length;
  mudar(m => {
    m.est = m.est || {}; m.est[cap.id] = apos;
    m.top3 = m.top3 || {}; const lst = (m.top3[cap.id] || []).concat([Math.round(S.capT)]).sort((a, b) => a - b).slice(0, 3); m.top3[cap.id] = lst;
    m.medo = m.medo || {}; const f0 = medoFaixa(c, S); m.medo[cap.id] = Math.max(m.medo[cap.id] || 0, f0);
    m.ouv = m.ouv || {}; m.ouv[cap.id] = m.ouv[cap.id] == null ? Math.round(c.ouviu) : Math.min(m.ouv[cap.id], Math.round(c.ouviu));
  });
  const m1 = mem(), te = totalEstrelas(m1);
  const estr = ks.map(k => (ganhas[k] ? '★' : '☆')).join('');
  linhas.push(`${esc(lstr((T.estrelas || {}).acendeu, { s: estr, n: sNoite }))}${novas.length ? ' · ' + esc(lstr((T.estrelas || {}).nova, { n: novas.join(', ') })) : ''}`);
  if (te >= 10) conq('l7_estrelas10'); if (te >= 30) conq('l7_estrelas30'); if (ks.every(k => ganhas[k])) conq('l7_cinco_estrelas');
  // três melhores
  const lst = (m1.top3 || {})[cap.id] || [];
  if (lst.length > 1) linhas.push(esc(lstr((T.top3 || {}).linha, { l: lst.map(x => fmtC(x)).join(' · ') })));
  // temperatura do medo
  const fx = medoFaixa(c, S), fn = ((T.medo || {}).faixas || [])[fx];
  linhas.push(lstr((T.medo || {}).linha, { f: esc(fn) }));
  if (fx === 4) conq('l7_pavor'); if (fx === 0 && cap.id !== 'prologo' && S.chapter >= 1) conq('l7_gelo');
  // quanto tempo ele ficou atento
  if (S.chapter >= 1 && c.t > 30) {
    const o = Math.round(c.ouviu), tag = o === 0 ? (T.ouvida || {}).zerou : o < 5 ? (T.ouvida || {}).bronze : '';
    linhas.push(esc(lstr((T.ouvida || {}).linha, { t: o, m: tag || 'sem selo' })));
    if (o === 0) conq('l7_surda');
  }
  // aposta feita no capítulo anterior
  if (L.aposta && L.aposta.cap === S.chapter) {
    const ap = (T.apostas || []).find(x => x.id === L.aposta.id) || {};
    const ok = { sem_esconder: !c.usouEsc, sem_morrer: !(S.capMortes || 0), sem_dano: (S.capDano || 0) === 0, tempo: !!(r.selos || {}).rapida, sem_garrafa: !(S.capGarrafas || 0), pouca_luz: (S.capLuzT || 0) < 60 }[L.aposta.id];
    if (ok) {
      L.apostasOk++; L.pts += 600; cera(15); mudar(m => { m.apostasOk = (m.apostasOk || 0) + 1; });
      linhas.push(`<b class="ouro">${esc(lstr((T.apostasTxt || {}).cumpriu, { n: ap.nome }))}</b>`); if ((mem().apostasOk || 0) >= 3) conq('l7_aposta');
    } else { L.castigo = S.chapter + 1; conq('l7_aposta_perdida'); linhas.push(esc(lstr((T.apostasTxt || {}).perdeu, { n: ap.nome }))); }
    L.aposta = null;
  }
  // Trato vermelho
  if (L.trato && S.chapter === L.tratoCap) {
    if (!(S.capMortes || 0)) { L.tratosOk++; L.pts += 1500; cera(30); conq('l7_trato'); linhas.push(`<b class="ouro">${esc((T.cartasTxt || {}).tratoCumprido)}</b>`); }
    else linhas.push(esc((T.cartasTxt || {}).tratoFim));
    L.trato = null;
  }
  // dívida do Inspetor
  if (L.cobrou && (mem().divida || 0) >= 10 && !(S.capVisto || 0)) { mudar(m => { m.divida = 0; }); conq('l7_divida'); linhas.push(esc((T.divida || {}).quitada)); }
  // Selo da Primeira Vez
  if (L.primeira && S.chapter === 0 && !S.mortes) conq('l7_primeira_vez');
  // Cera, semana e recordes por categoria de capítulo
  cera(8 + (r.letra === 'S' ? 6 : r.letra === 'A' ? 3 : 0));
  semanaAdd('caps_total', 1); if (!(S.capGarrafas || 0)) semanaAdd('caps_sem_garrafa', 1); if ((S.capDano || 0) === 0) semanaAdd('caps_sem_dano', 1); if (!c.usouEsc) semanaAdd('caps_sem_esconder', 1); if (minEf < ouroMin) semanaAdd('caps_ouro', 1);
  checaDesbloqueios();
  if (ultimo) return linhas;
  // Hora Zero: maldição sorteada; senão, abre a escolha de Dádivas e apostas
  if (L.hz) {
    const livre = (T.maldicoes || []).filter(x => !(L.mal || []).includes(x.id)), q = livre[Math.floor(mkrng(S.semente + 'hz' + S.chapter)() * livre.length)];
    if (q) { L.mal.push(q.id); linhas.push(`<b>${esc(T.malTitulo)}</b>: ${esc(q.nome)} — ${esc(q.preco)}`); }
    montarFc(S, cap, true);
  } else montarFc(S, cap, false);
  return linhas;
}
function fimCap(c, r) {
  try { const S = C.S; if (!S) return []; return fecharCap(S, c, r, false); } catch (e) { return []; }
}

// ---------------------------------------------------------------- escolhas entre capítulos (Dádivas, Trato, apostas)
let ofe = null;
function sorteioCartas(S) {
  const T = TX(), L = est(S), m = mem(), desb = m.desbloq || {}, r = mkrng(S.semente + 'dad' + S.chapter);
  const pool = (T.cartas || []).concat((T.bloqueadas || []).filter(x => desb[x.id])).filter(x => !(L.dad || []).includes(x.id));
  const tres = embaralha(pool, r).slice(0, 3);
  if (algumFinal() && S.chapter >= 1 && tres.length === 3 && r() < .6) { const tr = (T.tratos || []); const t = tr[Math.floor(r() * tr.length)]; if (t) tres[2] = { ...t, trato: true }; }
  return tres;
}
function montarFc(S, cap, hz) {
  try {
    const T = TX(), L = est(S); let box = $('#l7-fc');
    if (!box) { box = document.createElement('div'); box.id = 'l7-fc'; const ref = $('#fc-gancho'); if (!ref) return; ref.insertAdjacentElement('beforebegin', box); box.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) clique(b.dataset.k, +b.dataset.i); }); }
    ofe = null; box.innerHTML = '';
    if (hz) { box.hidden = true; return; }
    box.hidden = false;
    const cartas = S.chapter <= 4 ? sorteioCartas(S) : [];
    const rA = mkrng(S.semente + 'apo' + S.chapter), apostas = embaralha(T.apostas || [], rA).slice(0, 3);
    ofe = { ativo: cartas.length > 0, cartas, apostas, pC: false, pA: false, cap: S.chapter };
    const ct = T.cartasTxt || {};
    let h = '';
    if (cartas.length) {
      h += `<h4>${esc(ct.titulo)}</h4><div class="l7-linha">${cartas.map((x, i) => `<button class="l7-carta${x.trato ? ' trato' : ''}" data-k="c" data-i="${i}"><b>${i + 1} · ${esc(x.trato ? ct.vermelha + ': ' : '')}${esc(x.nome)}</b><i class="g">+ ${esc(x.ganho)}</i><i class="p">− ${esc(x.preco)}</i></button>`).join('')}</div>`;
      h += `<div class="l7-msg" id="l7-msg">${esc(ct.dica)}</div>`;
      h += `<h4>${esc(ct.aposta)}</h4><div class="l7-linha">${apostas.map((x, i) => `<button class="l7-carta" data-k="a" data-i="${i}"><b>${i + 4} · ${esc(x.nome)}</b><i>${esc(x.desc)}</i></button>`).join('')}</div>`;
    }
    h += `<div class="l7-linha" style="margin-top:8px"><button class="btn" data-k="fav" data-i="0">★ F · ${esc((T.sementesTxt || {}).fav)}</button></div>`;
    box.innerHTML = h;
  } catch (e) {}
}
function msg(t) { const el = $('#l7-msg'); if (el) el.textContent = t || ''; }
function clique(k, i) {
  try {
    const S = C.S; if (!S) return;
    if (k === 'fav') return favoritar(S);
    if (!ofe) return;
    if (k === 'c') escolherCarta(S, i);
    else if (k === 'a') escolherAposta(S, i);
    else if (k === 'n') escolherCarta(S, -1);
  } catch (e) {}
}
function travar(sel, on) { const box = $('#l7-fc'); if (!box) return; box.querySelectorAll(sel).forEach((b, i) => { b.disabled = true; if (on != null && +b.dataset.i === on) b.classList.add('on'); }); }
function depoisDasEscolhas() { try { if (ofe && ofe.pC && (ofe.pA || !ofe.apostas.length)) setTimeout(() => { try { C.pularFimCap && C.pularFimCap(); } catch (e) {} }, 1400); } catch (e) {} }
function escolherCarta(S, i) {
  if (!ofe || ofe.pC) return; const T = TX(), ct = T.cartasTxt || {}, L = est(S);
  ofe.pC = true;
  if (i < 0 || !ofe.cartas[i]) { travar('[data-k=c]', null); msg(ct.recusou); cera(15); mudar(m => { m.recusas = (m.recusas || 0) + 1; }); depoisDasEscolhas(); return; }
  const x = ofe.cartas[i]; travar('[data-k=c]', i);
  if (x.trato) { L.trato = x.id; L.tratoCap = S.chapter + 1; mudar(m => { m.tratos = (m.tratos || 0) + 1; }); msg(lstr(ct.trato, { n: x.nome })); if ((mem().tratos || 0) >= 3) conq('l7_tres_tratos'); }
  else {
    L.dad.push(x.id); L.dadN++;
    let extra = ''; if (L.dad.length > 5) { const velha = cartaPorId(L.dad.shift()); extra = ' ' + lstr(ct.cheia, { n: velha ? velha.nome : '' }); }
    msg(lstr(ct.aceitou, { n: x.nome }) + extra); conq('l7_dadiva1'); if (L.dad.length >= 5) conq('l7_dadiva5');
    mudar(m => { m.vistas = m.vistas || {}; m.vistas[x.id] = (m.vistas[x.id] || 0) + 1; });
    for (const cb of combosAtivos(L)) if (!L.combos[cb.id]) { L.combos[cb.id] = 1; mudar(m => { m.combos = m.combos || {}; m.combos[cb.id] = 1; }); conq('l7_combo'); aviso(lstr(ct.combo, { n: cb.nome + ' — ' + cb.desc })); if (Object.keys(mem().combos || {}).length >= 3) conq('l7_combo3'); }
  }
  if (x.extra && S.inv) { S.inv.pilhas = (S.inv.pilhas || 0) + (x.extra.pilhas || 0); S.inv.kits = (S.inv.kits || 0) + (x.extra.kits || 0); }
  try { C.SFX.pegar(); } catch (e) {}
  depoisDasEscolhas();
}
function escolherAposta(S, i) {
  if (!ofe || ofe.pA || !ofe.apostas[i]) return; const L = est(S); ofe.pA = true;
  L.aposta = { id: ofe.apostas[i].id, cap: ofe.cap + 1 };
  const box = $('#l7-fc'); if (box) box.querySelectorAll('[data-k=a]').forEach(b => { b.disabled = true; if (+b.dataset.i === i) b.classList.add('on'); });
  try { C.SFX.pegar(); } catch (e) {} depoisDasEscolhas();
}
function favoritar(S) {
  try {
    const T = TX(); mudar(m => { m.fav = m.fav || []; if (!m.fav.some(f => f.sem === S.semente)) m.fav.unshift({ sem: S.semente, dif: S.dif, nota: `${ROM[S.chapter] || ''} · ${hoje()}` }); m.fav = m.fav.slice(0, 12); });
    C.toast((T.sementesTxt || {}).favGuardada);
  } catch (e) {}
}
addEventListener('keydown', e => {
  try {
    const box = $('#l7-fc'), fc = $('#fimcap'); if (!box || !fc || fc.hidden || box.hidden || !ofe) { if (box && fc && !fc.hidden && e.code === 'KeyF' && C && C.S) { e.stopImmediatePropagation(); favoritar(C.S); } return; }
    const m = /^(?:Digit|Numpad)([0-6])$/.exec(e.code);
    if (m) { e.stopImmediatePropagation(); e.preventDefault(); const n = +m[1]; if (n === 0) clique('n', 0); else if (n <= 3) clique('c', n - 1); else clique('a', n - 4); }
    else if (e.code === 'KeyF' && C && C.S) { e.stopImmediatePropagation(); favoritar(C.S); }
  } catch (err) {}
}, true);
function espera() { try { if (ofe && ofe.ativo && !navigator.webdriver) return 24000; } catch (e) {} return 6400; }

// ---------------------------------------------------------------- morte
function morte(quem) {
  try {
    const S = C.S, P = C.P; if (!S) return; const L = est(S), T = TX();
    let key = quem;
    if (quem === 'inspetor') key = S.flags && S.flags.sino ? 'inspetor_fuga' : S.hidden ? 'inspetor_escondida' : P.sprinting ? 'inspetor_correndo' : P.naAgua ? 'inspetor_agua' : P.crouch ? 'inspetor_agachada' : (P.noiseR || 0) < .1 ? 'inspetor_parada' : 'inspetor_andando';
    else if (quem === 'ana') key = S.flashOn ? 'ana_luz' : 'ana_escuro';
    else key = S.chapter === 2 ? 'procissao_cap2' : 'procissao_fora';
    const d = new Date(), sexta13 = d.getDay() === 5 && d.getDate() === 13;
    mudar(m => { m.necro = m.necro || {}; m.necro[key] = (m.necro[key] || 0) + 1; if (sexta13) m.necro.qualquer_noite_13 = (m.necro.qualquer_noite_13 || 0) + 1; m.divida = (m.divida || 0) + 1; m.serie = 0; });
    const ficha = Object.keys(mem().necro || {}).length; if (ficha >= 5) conq('l7_necro5'); if (ficha >= (T.necro || {}).fichas.length) conq('l7_necro');
    L.morteCap[S.chapter] = (L.morteCap[S.chapter] || 0) + 1;
    if (S.chapter === 0 && (S.capT || 0) < 10) conq('l7_v_prologo');
    if (quem === 'ana' && L.morteCap[S.chapter] >= 3) conq('l7_v_ana3');
    if (L.c && (S.tempo - L.c.garrT) < 5) conq('l7_v_garrafa');
    if (key === 'inspetor_correndo') { L.morteCorrendo++; if (L.morteCorrendo >= 3) conq('l7_v_correndo'); }
  } catch (e) {}
}

// ---------------------------------------------------------------- final
function epiteto(S, L) {
  const t = L.t, tot = Math.max(60, t.tot), p = k => t[k] / tot, T = TX();
  let id = 'que_volta';
  if ((S.tempo || 1e9) < 2400) id = 'relampago';
  else if ((S.mortes || 0) >= 10) id = 'teimosa';
  else if (p('esc') >= .18) id = 'toupeira';
  else if (p('corre') >= .12) id = 'corredora';
  else if (p('agacha') >= .35) id = 'gata';
  else if (p('parado') >= .35) id = 'estatua';
  else if (t.garr >= 8) id = 'ilusionista';
  else if (p('luz') >= .7) id = 'vagalume';
  else if (p('luz') < .12) id = 'cega';
  else if (p('corre') < .02) id = 'sombra';
  else if (t.dano < 8 && !(S.mortes || 0)) id = 'cirurgia';
  return { id, p: { corre: p('corre'), agacha: p('agacha'), esc: p('esc'), parado: p('parado'), luz: p('luz') } };
}
function desafioOk(id, S, L) {
  const t = L.t, tot = Math.max(60, t.tot);
  switch (id) {
    case 'semcorrer': return t.corre / tot < .03; case 'semagachar': return t.agacha / tot < .03; case 'semesconder': return t.esc === 0;
    case 'semparar': return t.parado / tot < .12; case 'semgarrafa': return t.garr === 0; case 'pouca_luz': return t.luz / tot < .25;
    case 'luz_certa': return t.luz / tot > .5; case 'semmorte': return !(S.mortes || 0); case 'rapido': return (S.tempo || 1e9) < 2700;
  } return false;
}
function final(tipo) {
  try {
    const S = C.S; if (!S) return; const L = est(S), T = TX();
    // o capítulo V não tem tela de fim: fecha estrelas, aposta e Trato aqui
    try { const cap = window.ROTEIRO.capitulos[S.chapter], r = A.calcRank(S); fecharCap(S, cap, r, true); } catch (e) {}
    if (!S.completo) return;
    const ep = epiteto(S, L); L.ep = ep;
    const dif = S.dif || 'normal', ds = DIFL[dif] || 'N';
    // pontos da casa
    const base = S.l6_pontos != null ? S.l6_pontos : 0, calor = L.calor || 1;
    let extra = L.pts + Math.round(base * .08 * (calor - 1));
    if (L.hz) extra += Math.round(base * 1.0);
    L.extra = extra; L.total = base + extra;
    mudar(m => {
      // estilo
      m.estilo = m.estilo || {}; m.estilo[ep.id] = (m.estilo[ep.id] || 0) + 1;
      m.epSeq = (m.ultimoEp === ep.id) ? (m.epSeq || 1) + 1 : 1; m.ultimoEp = ep.id;
      m.retrato = { ep: ep.id, p: ep.p, tempo: Math.round(S.tempo || 0), mortes: S.mortes || 0, data: hoje() };
      m.dpProposta = (T.desafiosPessoais || {})[ep.id] || null;
      // série de noites
      m.serie = (S.mortes || 0) ? 0 : (m.serie || 0) + 1; m.serieRec = Math.max(m.serieRec || 0, m.serie);
      // videoteca
      m.vhs = m.vhs || {}; m.vhs[tipo + ':' + dif] = 1;
      // categorias
      m.cat = m.cat || {}; const tt = Math.round(S.tempo || 0), put = k => { if (!m.cat[k] || tt < m.cat[k]) m.cat[k] = tt; };
      put('qualquer'); if (tipo === 'verdadeiro') put('verdadeiro'); if (L.t.dano < 1) put('sem_dano'); if (L.t.luz / Math.max(60, L.t.tot) < .1) put('sem_luz'); if (L.t.esc === 0) put('sem_esconder');
      m.melhorCasa = Math.max(m.melhorCasa || 0, L.total);
      if (L.hz) { m.hz = m.hz || {}; m.hz.best = Math.max(m.hz.best || 0, L.total); m.hz.vitorias = (m.hz.vitorias || 0) + 1; }
      if (L.mes) { m.meses = m.meses || {}; m.meses[`${new Date().getFullYear()}-${pad(L.mes)}`] = 1; }
      if (L.calor >= 1) { m.calorVenceu = Math.max(m.calorVenceu || 0, L.calor); }
      m.epDiversos = Object.keys(m.estilo).length;
    });
    // desafio pessoal
    if (L.dp) {
      const ok = desafioOk(L.dp, S, L), dpd = Object.values(T.desafiosPessoais || {}).find(x => x.id === L.dp) || {};
      L.dpRes = { ok, nome: dpd.nome };
      if (ok) { mudar(m => { m.dpFeitos = m.dpFeitos || {}; m.dpFeitos[L.dp] = 1; m.titulosPessoais = m.titulosPessoais || {}; m.titulosPessoais[L.dp] = dpd.nome; }); cera(40); if (Object.keys(mem().dpFeitos || {}).length >= 3) conq('l7_versatil'); }
    }
    const m2 = mem();
    if ((m2.epSeq || 0) >= 5) conq('l7_previsivel'); if ((m2.epDiversos || 0) >= 6) conq('l7_epiteto6');
    if ((m2.serie || 0) >= 3) conq('l7_serie3'); if ((m2.serie || 0) >= 5) conq('l7_serie5'); if ((m2.serie || 0) >= 10) conq('l7_serie10');
    if (L.calor >= 3) conq('l7_calor3'); if (L.calor >= 5) conq('l7_calor5'); if (L.calor >= 10) conq('l7_calor10');
    if (!L.dadN) conq('l7_sem_dadiva');
    if (L.hz) conq('l7_hora_zero'); if (L.mes) conq('l7_mes'); if (L.pts >= 300 && L.bingoLin) conq('l7_bingo');
    if (L.marcada) conq({ 7: 'l7_noite7', 13: 'l7_noite13', 31: 'l7_noite31', 66: 'l7_noite66' }[L.marcada]);
    if ((T.sementes || []).some(x => x.id === S.semente)) conq('l7_lendaria');
    if (!(L.t.dano > 0) && true) conq('l7_cat_sem_dano');
    const vh = m2.vhs || {}; if (['comum', 'silencio', 'verdadeiro'].every(tp => ['facil', 'normal', 'pesadelo'].filter(d => vh[tp + ':' + d]).length >= 2)) conq('l7_vhs');
    // Cera da noite e Calor liberado
    cera(40 + calor * 8 + (L.hz ? 60 : 0));
    const max = Math.min(10, 1 + finaisTotal()); if (max > (L.maxIni || 1)) L.liberou = max;
    // alvo do amigo
    if (L.alvo) { const venceu = (S.tempo || 0) < L.alvo.seg; L.alvoRes = { venceu, dif: Math.abs((S.tempo || 0) - L.alvo.seg) }; if (venceu) conq('l7_alvo'); }
    checaDesbloqueios(); checarPatente();
  } catch (e) {}
}

// ---------------------------------------------------------------- tela final
function telaFinal(tipo) {
  try {
    const S = C.S, el = $('#e-stats'), L = S && S.l7; if (!el || !S || !L || !S.completo || !L.ep) return;
    const T = TX(), E = T.estiloTxt || {}, ep = (T.epitetos || []).find(x => x.id === L.ep.id) || {}, p = L.ep.p;
    let h = `<div class="l7-ep"><b>${esc(ep.nome)}</b><br><small>${esc(ep.frase)}</small><br><small class="l7-giz">${esc(E.correu)} ${Math.round(p.corre * 100)}% · ${esc(E.agachou)} ${Math.round(p.agacha * 100)}% · ${esc(E.escondeu)} ${Math.round(p.esc * 100)}% · ${esc(E.parou)} ${Math.round(p.parado * 100)}% · ${esc(E.luz)} ${Math.round(p.luz * 100)}%</small></div>`;
    const m = mem();
    if ((m.epSeq || 0) >= 5) h += `<small>${esc(E.repetiu)}</small><br>`;
    if (L.dpRes) h += `<small>${esc(lstr(L.dpRes.ok ? E.cumprido : E.falhou, { n: L.dpRes.nome }))}</small><br>`;
    if (L.dad.length) h += `<small>${esc((T.cartasTxt || {}).titulo)}: ${L.dad.map(id => esc((cartaPorId(id) || {}).nome)).join(', ')}</small><br>`;
    h += `<small>Calor ${L.calor}${L.hz ? ' · ' + esc((T.horaZero || {}).nome) : ''} · bônus da casa ${L.extra >= 0 ? '+' : ''}${num(L.extra)} → <b>${num(L.total)}</b> ${esc(L.hz ? (T.horaZero || {}).pontos : 'pontos com a casa')} · Cera +${L.cera || 0} (saldo ${m.cera || 0})</small>`;
    if (L.liberou) h += `<br><small><b class="ouro">${esc(lstr((T.calor || {}).liberado, { n: L.liberou }))}</b></small>`;
    if (L.alvoRes) h += `<br><small><b class="ouro">${esc(lstr(L.alvoRes.venceu ? (T.alvo || {}).venceu : (T.alvo || {}).perdeu, { n: L.alvo.nome, d: fmtC(L.alvoRes.dif) }))}</b></small>`;
    el.innerHTML += '<br>' + h;
    if (L.hz) { const sp = document.createElement('span'); sp.className = 'par'; sp.textContent = '\n\n' + (T.horaZero || {}).final; try { sp.style.animationDelay = ($('#e-txt').querySelectorAll('.par').length * 1.4) + 's'; $('#e-txt').appendChild(sp); } catch (e) {} }
    // herança da Lia + código de alvo
    let box = $('#l7-rel'); if (!box) { box = document.createElement('div'); box.id = 'l7-rel'; box.className = 'l7-rel'; el.insertAdjacentElement('afterend', box); }
    const rt = T.relTxt || {}, r = mkrng(S.semente + 'rel' + (m.noites || 0)), quatro = embaralha(T.reliquias || [], r).slice(0, 4);
    box.innerHTML = `<h4 style="font-weight:normal;letter-spacing:.14em;color:#9a8f73;font-size:14px">${esc(rt.titulo)}</h4><div class="l7-msg" id="l7-relmsg">${esc(rt.dica)}</div><div class="l7-linha">${quatro.map(x => `<button class="l7-carta" data-r="${x.id}"><b>${esc(x.nome)}</b><i class="g">+ ${esc(x.ganho)}</i><i class="p">− ${esc(x.preco)}</i></button>`).join('')}</div><div class="l7-linha" style="margin-top:8px"><button class="btn" data-alvo="1">${esc((T.alvo || {}).devolver)}</button></div>`;
    box.hidden = false;
    box.onclick = e => {
      const b = e.target.closest('[data-r]');
      if (b) { const x = cartaPorId(b.dataset.r); mudar(mm => { mm.rel = b.dataset.r; }); box.querySelectorAll('[data-r]').forEach(z => { z.disabled = true; if (z === b) z.classList.add('on'); }); const mm = $('#l7-relmsg'); if (mm && x) mm.textContent = lstr(rt.levou, { n: x.nome }); return; }
      if (e.target.closest('[data-alvo]')) devolver(S, e.target.closest('[data-alvo]'));
    };
  } catch (e) {}
}
function nomeAmigo() { const n = String(mem().nome || 'LIA').toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 12); return n || 'LIA'; }
function codigoAlvo(S) { return `ALVO:${S.semente}:${DIFL[S.dif] || 'N'}:${Math.round(S.tempo || 0)}:${nomeAmigo()}`; }
function copiar(txt, b, ok) {
  const feito = () => { if (b) { const o = b.textContent; b.textContent = ok; setTimeout(() => { b.textContent = o; }, 1800); } };
  try { navigator.clipboard.writeText(txt).then(feito, fb); } catch (e) { fb(); }
  function fb() { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); feito(); } catch (e) {} t.remove(); }
}
function devolver(S, b) { try { copiar(codigoAlvo(S), b, (TX().alvo || {}).copiado); conq('l7_alvo_devolvido'); } catch (e) {} }

// ---------------------------------------------------------------- pausa e estatísticas
function pausa() {
  try {
    const S = C.S; if (!S) return ''; const L = est(S), T = TX(); let o = '';
    o += `<br>Calor ${L.calor} · ${esc(((T.calor || {}).nomes || [])[L.calor - 1])}`;
    if (L.hz) o += ' · Hora Zero';
    const nomes = (L.dad || []).map(id => (cartaPorId(id) || {}).nome).filter(Boolean);
    if (nomes.length) o += `<br>${esc((T.cartasTxt || {}).titulo)}: ${nomes.map(esc).join(', ')}`;
    for (const cb of combosAtivos(L)) o += `<br>combinação: ${esc(cb.nome)}`;
    if (L.trato) o += `<br>Trato: ${esc((cartaPorId(L.trato) || {}).nome)} (some quando o capítulo acabar)`;
    for (const id of L.mal || []) o += `<br>maldição: ${esc((cartaPorId(id) || {}).nome)}`;
    if (L.rel) o += `<br>na mala: ${esc((cartaPorId(L.rel) || {}).nome)}`;
    if (L.aposta) o += `<br>${esc((T.apostasTxt || {}).ativa)}: ${esc(((T.apostas || []).find(x => x.id === L.aposta.id) || {}).nome)}`;
    if (L.mes) o += `<br>${esc(((T.meses || [])[L.mes - 1] || {}).nome)}`;
    // bingo
    const it = (T.bingo || {}).itens || [], b = L.bingo || [];
    if (b.length) { const lin = [0, 3, 6].map(i => b.slice(i, i + 3).map(k => `${L.ev[k] ? '☑' : '☐'} ${esc((it.find(x => x.ev === k) || {}).nome)}`).join(' · ')); o += `<br><small>${esc((T.bingo || {}).titulo)}:<br>${lin.join('<br>')}</small>`; }
    const tf = tarefasHoje(), fe = ((mem().tarefas || {})[hoje()]) || [];
    o += `<br><small>tarefas do dia: ${tf.map(t => `${fe.includes(t.id) ? '☑' : '☐'} ${esc(t.nome)}`).join(' · ')}</small>`;
    o += `<br><small>${esc((T.patentes || [])[patenteIdx()])}</small>`;
    return o;
  } catch (e) { return ''; }
}
function statsLinhas() {
  try {
    const m = mem(), T = TX(), L = [];
    L.push(['Patente do internato', (T.patentes || [])[patenteIdx()] || '—']);
    L.push(['Calor da Casa liberado', `${maxCalor()}/10`]);
    L.push(['Estrelas acesas no céu dos capítulos', `${totalEstrelas(m)}/30`]);
    L.push(['Causas de morte no necrológio', `${Object.keys(m.necro || {}).length}/${((T.necro || {}).fichas || []).length}`]);
    L.push(['Cera de vela', m.cera || 0]);
    L.push(['Cartas no baralho', (() => { const b = baralho(); return `${b.tem}/${b.total}`; })()]);
    L.push(['Noites seguidas sem morrer (recorde)', m.serieRec || 0]);
    L.push(['Dívida do Inspetor', `${m.divida || 0}/10`]);
    return L;
  } catch (e) { return []; }
}

// ---------------------------------------------------------------- painel A Casa
function openHub(aba) {
  try {
    const T = TX(), hub = T.hub || {};
    const barra = `<div class="l6-abas">${(hub.abas || []).map(([k, n]) => `<button class="btn ${k === aba ? 'on' : ''}" data-act="aba" data-v="${k}">${esc(n)}</button>`).join('')}</div><p class="l6-aviso">${esc(hub.aviso || '')}</p>`;
    A.abrirPainel(hub.titulo || 'A Casa', barra + corpo(aba));
    const pl = $('#pn-lista'); pl.onclick = e => { const b = e.target.closest('[data-act]'); if (b) agir(b.dataset.act, b.dataset.v, b, aba); };
  } catch (e) {}
}
function corpo(aba) {
  try {
    switch (aba) {
      case 'calor': return abaCalor(); case 'dadivas': return abaDadivas(); case 'estrelas': return abaEstrelas(); case 'estilo': return abaEstilo();
      case 'mortes': return abaMortes(); case 'sementes': return abaSementes(); case 'calendario': return abaCalendario(); case 'altar': return abaAltar(); default: return abaModos();
    }
  } catch (e) { return ''; }
}
function linhaPainel(a, b) { return `<div class="l6-lin"><b>${a}</b><span class="v">${b}</span></div>`; }
function abaCalor() {
  const T = TX(), Ct = T.calor || {}, m = mem(), max = maxCalor(), sel = Math.min((m.calor || {}).sel || 1, max), venc = m.calorVenceu || 0;
  let h = `<p class="l6-aviso">${esc(Ct.desc)}</p>`;
  for (let n = 1; n <= 10; n++) {
    const bloq = n > max, e = efCalor(n), rs = [];
    if (n > 1) { rs.push(`ouvido +${Math.round((e.ouvido - 1) * 100)}%`, `pilha +${Math.round((e.pilha - 1) * 100)}%`, `Inspetor +${Math.round((e.vel - 1) * 1000) / 10}%`); if (e.aviso) rs.push(`aviso ${e.aviso.toFixed(1).replace('.', ',')} s`); rs.push(`aparições +${Math.round((1 - e.intervalo) * 100)}%`); }
    h += `<label class="l6-regra ${n === sel ? '' : 'off'}" ${bloq ? '' : `data-act="calor" data-v="${n}"`}><b>${n} · ${bloq ? '???' : esc((Ct.nomes || [])[n - 1])}</b>${n <= venc ? ' <span class="m" style="color:#c9a75a">venceu</span>' : n === sel ? ' <span class="m">escolhido</span>' : ''}<small>${bloq ? 'Veja mais um final para abrir este degrau.' : esc((Ct.frases || [])[n - 1]) + (rs.length ? ' · ' + rs.join(' · ') : '')}</small></label>`;
  }
  h += `<div class="l6-mult">${esc(Ct.recompensa)}: +${sel * 8 + 40} de Cera</div><div style="text-align:center"><button class="btn" data-act="calor-sorteio">${esc(Ct.sortear)}</button></div>`;
  return h;
}
function abaDadivas() {
  const T = TX(), m = mem(), desb = m.desbloq || {}, b = baralho();
  let h = `<div class="l6-dia"><b style="color:#c9a75a">cartas: ${b.tem} de ${b.total}</b><br><small>As Dádivas aparecem na tela de fim de capítulo. Quatro cartas só entram no baralho depois de um feito.</small></div>`;
  h += (T.cartas || []).map(x => `<div class="l6-fim"><span class="nm">${esc(x.nome)}</span>${(m.vistas || {})[x.id] ? ` <small>(aceita ${(m.vistas || {})[x.id]}×)</small>` : ''}<br><small>+ ${esc(x.ganho)} · − ${esc(x.preco)}</small></div>`).join('');
  h += (T.bloqueadas || []).map(x => desb[x.id] ? `<div class="l6-fim"><span class="nm">${esc(x.nome)}</span> <small>(desbloqueada)</small><br><small>+ ${esc(x.ganho)} · − ${esc(x.preco)}</small></div>` : `<div class="l6-fim off">??? <small>${esc(x.dica)}</small></div>`).join('');
  h += (T.tratos || []).map(x => algumFinal() ? `<div class="l6-fim"><span class="nm" style="color:#e9a89a">${esc((T.cartasTxt || {}).vermelha)}: ${esc(x.nome)}</span><br><small>+ ${esc(x.ganho)} · − ${esc(x.preco)}</small></div>` : '').join('');
  const cf = m.combos || {};
  h += `<div class="l6-lin"><b>Combinações descobertas</b><span class="v">${Object.keys(cf).length}/${(T.combos || []).length}</span></div>`;
  h += (T.combos || []).map(c => cf[c.id] ? `<div class="l6-fim"><span class="nm">${esc(c.nome)}</span> — ${esc(c.desc)}</div>` : `<div class="l6-fim off">???</div>`).join('');
  return h;
}
function abaEstrelas() {
  const T = TX(), m = mem(), E = T.estrelas || {}; const caps = window.ROTEIRO.capitulos;
  let h = `<p class="l6-aviso">${esc(E.aviso)} (${totalEstrelas(m)}/30)</p>`;
  h += caps.map((c, i) => {
    const e = (m.est || {})[c.id] || {}, ks = ['t', 'd', 'l', 'e', 'o'], falta = ks.map((k, j) => e[k] ? '' : (E.nomes || [])[j]).filter(Boolean);
    const t3 = ((m.top3 || {})[c.id] || []).map(x => fmtC(x)).join(' · ');
    const medo = (m.medo || {})[c.id], ouv = (m.ouv || {})[c.id];
    return `<div class="l6-fim"><b>${esc(ROM[i])}</b> <span class="l7-est">${ks.map(k => e[k] ? '★' : '<span class="off">☆</span>').join('')}</span><br><small>${falta.length ? 'falta: ' + esc(falta.join(' · ')) : 'completo'}${t3 ? ' · melhores: ' + t3 : ''}${medo != null ? ' · medo máximo: ' + esc(((T.medo || {}).faixas || [])[medo]) : ''}${ouv != null ? ' · menos atento: ' + ouv + 's' : ''}</small></div>`;
  }).join('');
  return h;
}
function abaEstilo() {
  const T = TX(), E = T.estiloTxt || {}, m = mem(), r = m.retrato;
  let h = `<div class="l6-dia"><b style="color:#c9a75a">${esc((T.patentes || [])[patenteIdx()])}</b><br><small>pontos da casa ${pontosCasa()} · próxima patente: ${esc((T.patentes || [])[patenteIdx() + 1] || '—')} em ${(T.patenteLim || [])[patenteIdx() + 1] || '—'}</small></div>`;
  if (!r) return h + `<p class="l6-aviso">${esc(E.vazio)}</p>`;
  const ep = (T.epitetos || []).find(x => x.id === r.ep) || {};
  h += `<div class="l7-ep"><b>${esc(ep.nome)}</b><br><small>${esc(ep.frase)}</small><br><small class="l7-giz">${esc(E.correu)} ${Math.round(r.p.corre * 100)}% · ${esc(E.agachou)} ${Math.round(r.p.agacha * 100)}% · ${esc(E.escondeu)} ${Math.round(r.p.esc * 100)}% · ${esc(E.parou)} ${Math.round(r.p.parado * 100)}% · ${esc(E.luz)} ${Math.round(r.p.luz * 100)}%</small></div>`;
  if (m.dpProposta) h += `<div class="l6-dia"><b style="color:#c9a75a">${esc(E.proposta)}: ${esc(m.dpProposta.nome)}</b><br><small>${esc(m.dpProposta.desc)}</small><br>${m.dpAceito === m.dpProposta.id ? `<small>${esc(E.aceito)}.</small>` : `<button class="btn" data-act="dp">${esc(E.aceitar)}</button>`}</div>`;
  h += (T.epitetos || []).map(x => `<div class="l6-lin"><b>${esc(x.nome)}</b><span class="v">${(m.estilo || {})[x.id] || 0}×</span></div>`).join('');
  const pf = m.titulosPessoais || {}; if (Object.keys(pf).length) h += `<p class="l6-aviso">títulos pessoais: ${Object.values(pf).map(esc).join(' · ')}</p>`;
  return h;
}
function abaMortes() {
  const T = TX(), N = T.necro || {}, m = mem(), nec = m.necro || {};
  let h = `<p class="l6-aviso">${esc(N.aviso)} (${Object.keys(nec).length}/${(N.fichas || []).length}) · ${esc(lstr((T.divida || {}).linha, { n: m.divida || 0 }))}</p>`;
  h += (N.fichas || []).map(f => nec[f.id] ? `<div class="l6-fim"><span class="nm">${esc(f.nome)}</span> <small>(${nec[f.id]}×)</small><br><small><i>${esc(f.epi)}</i></small></div>` : `<div class="l6-fim off">??? — ${esc(N.vazio)}</div>`).join('');
  return h;
}
function abaSementes() {
  const T = TX(), S2 = T.sementesTxt || {}, m = mem(), fav = m.fav || [];
  let h = `<p class="l6-aviso">${esc(S2.aviso)}</p>`;
  h += (T.sementes || []).map(s => `<div class="l6-fim"><span class="nm">${esc(s.nome)}</span> <small>(${esc(s.id)})</small><br><small>${esc(s.desc)}</small><br><button class="btn" data-act="sem-jogar" data-v="${esc(s.id)}">${esc(S2.jogar)}</button> <button class="btn" data-act="sem-copiar" data-v="${esc(s.id)}">${esc(S2.copiar)}</button></div>`).join('');
  h += `<div class="l6-lin"><b>${esc(S2.favoritas)}</b></div>`;
  h += fav.length ? fav.map((f, i) => `<div class="l6-fim"><span class="nm">${esc(f.sem)}</span> <small>${esc(f.nota)}</small><br><button class="btn" data-act="sem-jogar" data-v="${esc(f.sem)}">${esc(S2.jogar)}</button> <button class="btn" data-act="sem-copiar" data-v="${esc(f.sem)}">${esc(S2.copiar)}</button> <button class="btn" data-act="fav-del" data-v="${i}">tirar</button></div>`).join('') : `<p class="l6-aviso">${esc(S2.vazio)}</p>`;
  return h;
}
function abaCalendario() {
  const T = TX(), Cd = T.calendario || {}, m = mem(), dias = m.dias || {};
  let h = '', velas = '', n30 = 0;
  for (let i = 29; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const on = !!dias[chaveDia(d)]; if (on) n30++; velas += on ? '🕯' : '·'; }
  h += `<div class="l6-dia"><b style="color:#c9a75a">${esc(Cd.titulo)}</b><br><span class="l7-giz">${velas}</span><br><small>${n30} ${esc(Cd.velas)} · ${sequenciaDias(m)} ${esc(Cd.serie)} · ${m.noites || 0} ${esc(Cd.noites)} · ${m.serie || 0} ${esc(Cd.serieNoites)} (${esc(Cd.serieRec)}: ${m.serieRec || 0})</small></div>`;
  const tf = tarefasHoje(), fe = ((m.tarefas || {})[hoje()]) || [];
  h += `<div class="l6-lin"><b>Tarefas do dia</b><span class="v">${fe.length}/3</span></div>` + tf.map(t => `<div class="l6-fim ${fe.includes(t.id) ? '' : 'off'}">${fe.includes(t.id) ? '☑' : '☐'} ${esc(t.nome)}</div>`).join('');
  const sem = m.sem && m.sem.w === segunda() ? m.sem : { v: {} };
  h += `<div class="l6-lin"><b>Missões da semana</b><span class="v">${sem.pago ? 'cumpridas' : 'em andamento'}</span></div>` + missoesSemana().map(x => { const v = Math.min(x.alvo, sem.v[x.id] || 0); return `<div class="l6-fim ${v >= x.alvo ? '' : 'off'}">${v >= x.alvo ? '☑' : '☐'} ${esc(x.nome)} <small>(${v}/${x.alvo})</small></div>`; }).join('');
  const dm = (T.meses || [])[new Date().getMonth()] || {};
  h += `<div class="l6-lin"><b>${esc((T.mesTxt || {}).label)}</b><span class="v">${esc(dm.nome)}</span></div><label class="l6-regra ${m.mesOn ? '' : 'off'}" data-act="mes"><input type="checkbox" ${m.mesOn ? 'checked' : ''} disabled> ${esc((T.mesTxt || {}).ligar)}<small>${esc(dm.desc)}</small></label><small class="l6-aviso">${esc((T.mesTxt || {}).selo)}: ${Object.keys(m.meses || {}).length}/12</small>`;
  h += `<div class="l6-lin"><b>Datas especiais da Serra</b><span class="v">${Object.keys(m.datas || {}).length}/${(T.datas || []).length}</span></div>` + (T.datas || []).map(x => `<div class="l6-fim ${(m.datas || {})[x.id] ? '' : 'off'}">${(m.datas || {})[x.id] ? '✓ ' + esc(x.nome) : '??? <small>' + esc(x.dica) + '</small>'}</div>`).join('');
  return h;
}
function abaAltar() {
  const T = TX(), Ce = T.cera || {}, m = mem(), tem = m.altar || {};
  let h = `<p class="l6-aviso">${esc(Ce.aviso)}</p><div class="l6-mult">${esc(Ce.nome)}: ${m.cera || 0}</div>`;
  h += (T.altar || []).map(x => `<div class="l6-fim ${tem[x.id] ? '' : 'off'}"><span class="nm">${esc(x.nome)}</span> <small>${tem[x.id] ? '' : x.preco + ' de Cera'}</small> ${tem[x.id] ? (m.altarUsa === x.id ? `<small>${esc(Ce.ativo)}</small>` : `<button class="btn" data-act="altar-usar" data-v="${x.id}">${esc(Ce.usar)}</button>`) : `<button class="btn" data-act="altar-comprar" data-v="${x.id}">${esc(Ce.comprar)}</button>`}</div>`).join('');
  return h;
}
function abaModos() {
  const T = TX(), m = mem(), hz = T.horaZero || {}, Al = T.alvo || {}, Ct = T.categorias || {}, fin = finaisTotal();
  let h = `<div class="l6-dia"><b style="color:#c9a75a">${esc(hz.nome)}</b><br><small>${esc(hz.desc)}</small><br>`;
  h += fin >= 3 ? `<button class="btn" data-act="hz">${(m.hz && m.hz.sel) ? 'Desligar' : 'Ligar'} a ${esc(hz.nome)}</button><br><small>${esc(hz.recorde)}: ${num((m.hz || {}).best || 0)} · vitórias ${(m.hz || {}).vitorias || 0}</small>` : `<small>${esc(hz.bloqueada)} (${fin}/3)</small>`;
  h += `</div><div class="l6-dia"><b style="color:#c9a75a">${esc(Al.titulo)}</b><br><small>${esc(Al.aviso)}</small><br><input type="text" id="l7-nome" maxlength="12" placeholder="${esc(Al.nome)}" value="${esc(m.nome || '')}" spellcheck="false" autocomplete="off" style="font-family:'Special Elite',monospace;text-transform:uppercase;width:130px"> <input type="text" id="l7-alvo-cod" maxlength="40" placeholder="ALVO:..." spellcheck="false" autocomplete="off" style="font-family:'Special Elite',monospace;text-transform:uppercase"> <button class="btn" data-act="alvo">Montar alvo</button><div id="l7-alvo-res" class="l6-aviso"></div></div>`;
  h += `<div class="l6-lin"><b>${esc(Ct.titulo)}</b></div>` + Object.keys(Ct.nomes || {}).map(k => linhaPainel(esc(Ct.nomes[k]), (m.cat || {})[k] ? fmtC(m.cat[k]) : '—')).join('');
  const vh = m.vhs || {}, fs = ['comum', 'silencio', 'verdadeiro'], ds = ['facil', 'normal', 'pesadelo'];
  h += `<div class="l6-lin"><b>${esc((T.vhs || {}).titulo)}</b></div><p class="l6-aviso">${esc((T.vhs || {}).aviso)}</p>` + fs.map(f => `<div class="l6-fim">${esc(f.replace('comum', 'o portão').replace('silencio', 'o silêncio').replace('verdadeiro', 'a verdade'))}: ${ds.map(d => (vh[f + ':' + d] ? '▣ ' : '□ ') + d).join(' · ')}</div>`).join('');
  return h;
}
function setDesafio(sem) { try { const inp = $('#o-desafio'); if (inp) { inp.value = sem; try { C.toast && C.toast('Semente pronta: toque em Novo jogo.'); } catch (e) {} } } catch (e) {} }
function fechar() { try { $('#pn-voltar') && $('#pn-voltar').click(); } catch (e) {} }
function agir(a, v, b, aba) {
  try {
    const T = TX();
    if (a === 'aba') return openHub(v);
    if (a === 'calor') { if (+v <= maxCalor()) mudar(m => { m.calor = { sel: +v }; }); return openHub('calor'); }
    if (a === 'calor-sorteio') { const n = 1 + Math.floor(Math.random() * maxCalor()); mudar(m => { m.calor = { sel: n }; }); setDesafio(Math.random().toString(36).slice(2, 8).toUpperCase().replace(/[^0-9A-Z]/g, 'X').padEnd(5, 'K')); return openHub('calor'); }
    if (a === 'dp') { const p = mem().dpProposta; if (p) mudar(m => { m.dpAceito = p.id; }); return openHub('estilo'); }
    if (a === 'sem-jogar') { setDesafio(v); return fechar(); }
    if (a === 'sem-copiar') return copiar(v, b, (T.alvo || {}).copiado);
    if (a === 'fav-del') { mudar(m => { (m.fav || []).splice(+v, 1); }); return openHub('sementes'); }
    if (a === 'mes') { mudar(m => { m.mesOn = !m.mesOn; }); return openHub('calendario'); }
    if (a === 'altar-comprar') { const x = (T.altar || []).find(z => z.id === v), m = mem(); if (x && (m.cera || 0) >= x.preco && !(m.altar || {})[v]) { mudar(mm => { mm.cera -= x.preco; mm.altar = mm.altar || {}; mm.altar[v] = 1; mm.altarUsa = v; }); conq('l7_altar'); } return openHub('altar'); }
    if (a === 'altar-usar') { mudar(m => { m.altarUsa = v; }); return openHub('altar'); }
    if (a === 'hz') { mudar(m => { m.hz = m.hz || {}; m.hz.sel = !m.hz.sel; }); return openHub('modos'); }
    if (a === 'alvo') return montarAlvo();
  } catch (e) {}
}
function montarAlvo() {
  try {
    const Al = TX().alvo || {}, nm = $('#l7-nome'), inp = $('#l7-alvo-cod'), res = $('#l7-alvo-res');
    if (nm && nm.value.trim()) mudar(m => { m.nome = nm.value.trim().toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 12); });
    const mm = /^ALVO:([0-9A-Z]{4,7}):([FNP]):(\d{2,5}):([0-9A-Z]{1,12})$/.exec(String((inp && inp.value) || '').trim().toUpperCase());
    if (!mm) { if (res) res.textContent = Al.invalido; return; }
    const al = { sem: mm[1], dif: mm[2], seg: +mm[3], nome: mm[4] };
    mudar(m => { m.alvoPend = al; });
    const di = $('#o-desafio'); if (di) di.value = `${al.sem}-${al.dif}`;
    if (res) res.textContent = lstr(Al.montou, { n: al.nome, t: fmtC(al.seg) });
  } catch (e) {}
}

// ---------------------------------------------------------------- API
export const L7 = {
  ligar(ctx, api) { C = ctx; A = api; try { css(); } catch (e) {} },
  titulo, tecla, novoJogo, tick, difMod, difKey, ruidoMul, espera, fimCap, morte, final, telaFinal, pausa, statsLinhas
};
