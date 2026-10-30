// PROGRESSÃO — LOTE 5 (monstros: comportamento, variação por noite, contra-jogo, perseguição)
// Temperamento do Inspetor sorteado pela semente de cada noite (muda o que ele ouve, a velocidade e a ronda),
// bestiário vivo que se preenche ao presenciar cada comportamento, contador de "vezes que ele te ouviu",
// modo Caçada Limpa (ele ouve longe e não recua), variações de morte por comportamento, conquistas de
// contra-jogo e o epílogo da noite toda em silêncio. Tudo passivo e à prova de erro (não trava o jogo nem o QA).
// Ligado por src/progressao.js (PG); o texto mora em src/progressao-lote5-roteiro.js.
import './progressao-lote5-roteiro.js';

const K = 'hora-silencio-l5';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const TX = () => (window.ROTEIRO.progressao || {}).lote5 || {};
let C = null, A = null;
const mem = () => { try { return A.ls.get(K, {}) || {}; } catch (e) { return {}; } };
const mudar = fn => { const m = mem(); fn(m); A.ls.set(K, m); return m; };
const unlocked = () => { try { return Object.keys((A.stats() || {}).finais || {}).length > 0; } catch (e) { return false; } };
const conq = id => { try { A.conquista(id); } catch (e) {} };

// ---------------------------------------------------------------- temperamento por noite
const TEMPS = ['farejador', 'ouvinte', 'guardiao'];
function tempId(S) {
  if (!S || !S.semente) return 'ouvinte';
  const s = String(S.semente); let n = 0;
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0;
  return TEMPS[n % 3];
}
// chave de cache para PG.dif (muda quando muda o humor, o modo ou o sangue para o farejador)
function difKey(S) {
  try { if (!S) return ''; const t = tempId(S); return t[0] + ((S.modo && S.modo.cacada) ? 'C' : '') + ((t === 'farejador' && (S.capDano || 0) > 0) ? 'B' : ''); } catch (e) { return ''; }
}
// altera a dificuldade efetiva do Inspetor conforme o humor da noite e o modo Caçada
function difMod(v, S) {
  try {
    if (!S || !v) return;
    const t = tempId(S), pes = S.dif === 'pesadelo' ? 1.08 : 1;
    if (t === 'farejador') { v.ouvido *= 1.06 * pes; if ((S.capDano || 0) > 0) { v.vel *= 1.12; v.ouvido *= 1.1; } }
    else if (t === 'ouvinte') { v.ouvido *= 1.22 * pes; v.aviso = Math.max(2, v.aviso - 1); }
    else if (t === 'guardiao') { v.vel *= 1.05 * pes; if (v.intervalo) v.intervalo *= 0.84; }
    if (S.modo && S.modo.cacada) { v.ouvido *= 1.3; if (v.intervalo) v.intervalo *= 0.68; v.vel *= 1.05; }
  } catch (e) {}
}

// ---------------------------------------------------------------- estado da noite (reinicia a cada semente)
let N = null, _mdiag = '', _mtemp = null;
function night() {
  const S = C && C.S; if (!S) return null;
  if (!N || N.sem !== S.semente) {
    N = { sem: S.semente, temp: tempId(S), ouviu: 0, estAnt: null, recuou: false, usouEsconderijo: false, favContagem: {}, compassao: new Set(), humorAvisado: false, cacadaT: 0, cap: null, _htipo: null, _danoAnt: S.capDano || 0, _cham: (S.chamIgn || 0) + (S.chamResp || 0) };
    try { S.modo = S.modo || {}; S.modo.cacada = !!(C.OPT.l5cacada && unlocked()); } catch (e) {}
  }
  return N;
}
function capN() {
  const n = night(); const S = C && C.S; if (!n || !S) return null;
  if (!n.cap || n.cap.ch !== S.chapter) n.cap = { ch: S.chapter, luzPerto: false, sangrouPerto: false, salasFrias: new Set(), salaAnt: null, ouviu: 0 };
  return n.cap;
}
function favOf(obj) { let best = null, n = -1; for (const k in obj) if (obj[k] > n) { n = obj[k]; best = k; } return best; }

// ---------------------------------------------------------------- bestiário
function compKey(ent, id) { return ent + '/' + id; }
function marcarComp(ent, id) {
  if (!id) return;
  const key = compKey(ent, id), m = mem(), best = m.best || {};
  if (best[key]) return;
  const primeiraFicha = !Object.keys(best).some(k => k.indexOf(ent + '/') === 0);
  mudar(x => { x.best = x.best || {}; x.best[key] = Date.now(); });
  try { C.toast(primeiraFicha ? TX().bestiario.novaFicha : TX().bestiario.novo); } catch (e) {}
  try { if (C.SFX && C.SFX.papel) C.SFX.papel(); } catch (e) {}
  checkBest(); try { atualizarBotoes(); } catch (e) {}
}
function checkBest() {
  try { const a = mem().best || {}, T = TX().bestiario; if ((T.entidades || []).every(e => e.comps.every(c => a[compKey(e.id, c.id)]))) conq('l5_bestiario'); } catch (e) {}
}
const ESTADO_COMP = { caca: 'caca', alerta: 'caca', bote: 'bote', agarra: 'bote', emboscada: 'emboscada', fareja: 'fareja', escuta: 'escuta', vasculha: 'vasculha', reza: 'reza' };

// ---------------------------------------------------------------- tick (por quadro)
function tick(dt) {
  try {
    const S = C.S, M = C.M, P = C.P;
    if (!S || C.mode !== 'jogo' || S.dead || S.fim) return;
    const n = night(); if (!n) return;
    const cp = capN();
    // humor percebido: uma fala por noite, depois que a cena de abertura assentou
    if (!n.humorAvisado && (S.capT || 0) > 6) {
      n.humorAvisado = true;
      const T = TX().temperamentos[n.temp];
      if (T) { try { C.toast(TX().tempAviso.replace('{nome}', T.nome)); } catch (e) {} try { if (C.SFX && C.SFX.sinoLonge) C.SFX.sinoLonge(); } catch (e) {} setTimeout(() => { try { if (C.S === S && !S.dead) C.sub('lia', T.lia); } catch (e) {} }, 1500); }
    }
    // Inspetor: contador "te ouviu", comportamentos, falsa partida
    const st = M && M.ativo ? M.state : null;
    if (M && M.ativo) {
      const forte = (st === 'alerta' || st === 'caca');
      const forteAnt = (n.estAnt === 'alerta' || n.estAnt === 'caca');
      if (forte && !forteAnt) { n.ouviu++; if (cp) cp.ouviu++; }
      const comp = ESTADO_COMP[st]; if (comp) marcarComp('inspetor', comp);
      if (M.recuo > 0) n.recuou = true;
      if (st === 'caca' && n.recuou) marcarComp('inspetor', 'falsa');
      // modo Caçada: tempo sobrevivido
      if (S.modo && S.modo.cacada) { n.cacadaT += dt; if (n.cacadaT >= 300) conq('l5_cacada'); }
      // luz acesa perto dele (Boa Noite, Moacir)
      if (cp && S.flashOn && M.pos.distanceTo(P.pos) < 5) cp.luzPerto = true;
      // sangrou perto dele (Sem Rastro)
      if (cp && (S.capDano || 0) > (n._danoAnt || 0)) { if (M.pos.distanceTo(P.pos) < 15) cp.sangrouPerto = true; n._danoAnt = S.capDano; }
      else if ((S.capDano || 0) > (n._danoAnt || 0)) n._danoAnt = S.capDano;
      // Pela Hora: cap II, cruzar salas com ele parado
      if (S.chapter === 2 && M.recuo > 0 && P.room && cp) { if (cp.salaAnt !== P.room) { cp.salaAnt = P.room; cp.salasFrias.add(P.room); if (cp.salasFrias.size >= 3) conq('l5_pela_hora'); } }
    }
    n.estAnt = st;
    // esconderijo usado e favorito
    if (S.hidden) { n.usouEsconderijo = true; const tp = S.hidden.tipo || 'armario'; if (n._htipo !== tp) { n._htipo = tp; n.favContagem[tp] = (n.favContagem[tp] || 0) + 1; deNovoAqui(tp); } }
    else n._htipo = null;
    // outras entidades
    if (C.PROC && C.PROC.fase) marcarComp('procissao', C.PROC.fase === 'passando' ? 'marcha' : 'aviso');
    if (S.done && S.done.ana) { marcarComp('ana', 'dez'); if (!S.flashOn) marcarComp('ana', 'escuro'); }
    const chAgora = (S.chamIgn || 0) + (S.chamResp || 0);
    if (chAgora > (n._cham || 0)) { n._cham = chAgora; marcarComp('chamado', 'voz'); }
    // Boa Noite, Todos: três gestos de compaixão numa noite
    detectCompassao(n);
  } catch (e) {}
}
function deNovoAqui(tp) {
  try { const n = N; if (!n || n._deNovo) return; const fav = mem().favAnt; if (fav && fav === tp && (C.S.capT || 0) < 160) { n._deNovo = true; C.sub('inspetor', TX().memoria.deNovoAqui); } } catch (e) {}
}
function detectCompassao(n) {
  try {
    const S = C.S, cq = S.conqNoite || [];
    if (cq.indexOf('volte_cama') >= 0) n.compassao.add('dormir');
    if (cq.indexOf('ms4_luiz') >= 0) n.compassao.add('ombro');
    for (const k in S.flags) if (k.indexOf('ms_bn') >= 0) { n.compassao.add('boanoite'); break; }
    if (n.compassao.size >= 3) conq('l5_boanoite_todos');
  } catch (e) {}
}

// ---------------------------------------------------------------- estilo + botões do título
function css() {
  if ($('#l5-css')) return;
  const s = document.createElement('style'); s.id = 'l5-css';
  s.textContent = `[hidden]{display:none!important}
.l5-ficha{border:1px solid #3a3228;background:#14110d;padding:12px 14px;margin:0 0 12px;text-align:left}
.l5-ficha h3{font-family:"IM Fell English SC",Georgia,serif;font-weight:normal;font-size:20px;color:#c9a75a;margin:0 0 4px}
.l5-ficha .l5-peg{float:right;font-size:12px;color:#b0362a;font-family:"Special Elite",monospace;letter-spacing:.06em}
.l5-resumo{color:#a89a7c;font-style:italic;margin:0 0 10px;font-size:14px}
.l5-temp{color:#c9a75a}
.l5-comp{padding:7px 0;border-top:1px solid #1f1b16;color:#cfc3a6}
.l5-comp b{color:#e9dfc8;font-family:"Special Elite",monospace;font-size:14px}
.l5-comp small{color:#857a63;line-height:1.6}
.l5-comp.off b{color:#6d6452}.l5-comp.off small{color:#4f4942}
.l5-modo label{display:block;padding:9px 0;border-top:1px solid #1f1b16;cursor:pointer}.l5-modo label.off{opacity:.5}
.l5-modo small{color:#857a63}`;
  document.head.appendChild(s);
}
function bestProg() {
  const T = TX().bestiario, a = mem().best || {}; let total = 0, vis = 0, fichas = 0;
  (T.entidades || []).forEach(e => { let ev = 0; e.comps.forEach(c => { total++; if (a[compKey(e.id, c.id)]) { vis++; ev++; } }); if (e.comps.length && ev === e.comps.length) fichas++; });
  return { total, vis, fichas, nent: (T.entidades || []).length };
}
function l5Conq() { try { const cq = A.ls.get(C.KEYS.CONQ_KEY, {}) || {}, ids = TX().conquistas || []; return { feitas: ids.filter(c => cq[c.id]).length, total: ids.length }; } catch (e) { return { feitas: 0, total: 0 }; } }
function atualizarBotoes() { try { const b = $('#b-l5-best'); if (b) { const p = bestProg(); b.textContent = (p.total && p.vis >= p.total) ? 'Bestiário ★' : `Bestiário (${p.vis}/${p.total})`; } } catch (e) {} }
function botoes() {
  if (!$('#b-stats')) return;
  if (!$('#b-l5-best')) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'b-l5-best'; b.textContent = 'Bestiário'; ($('#b-l4') || $('#b-stats')).insertAdjacentElement('afterend', b); b.onclick = painelBestiario; }
  if (!$('#b-l5-rejogo')) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'b-l5-rejogo'; b.textContent = 'Rejogo'; ($('#b-l5-best') || $('#b-stats')).insertAdjacentElement('afterend', b); b.onclick = painelRejogo; }
  atualizarBotoes();
}

// ---------------------------------------------------------------- painel Bestiário
function painelBestiario() {
  const T = TX().bestiario, a = mem().best || {}, causas = (A.stats() || {}).causas || {};
  let total = 0, vistos = 0; (T.entidades || []).forEach(e => e.comps.forEach(c => { total++; if (a[compKey(e.id, c.id)]) vistos++; }));
  const pct = total ? Math.round(vistos / total * 100) : 0;
  const curTemp = (C.S && C.mode === 'jogo') ? tempId(C.S) : null;
  let h = `<p class="pn-resumo">${esc(vistos >= total && total ? T.completo : T.aviso)}<span class="barra"><i style="width:${pct}%"></i></span> ${vistos}/${total}</p>`;
  h += (T.entidades || []).map(e => {
    const seen = e.comps.some(c => a[compKey(e.id, c.id)]), peg = causas[e.id] || 0;
    const linhas = e.comps.map(c => a[compKey(e.id, c.id)]
      ? `<div class="l5-comp"><b>${esc(c.nome)}</b><br><small>${esc(c.dica)}</small></div>`
      : `<div class="l5-comp off"><b>???</b><br><small>${esc(T.ocultoLinha)}</small></div>`).join('');
    const sub = (e.id === 'inspetor' && curTemp && TX().temperamentos[curTemp]) ? ` <span class="l5-temp">${esc(TX().temperamentos[curTemp].bestiario)}</span>` : '';
    return `<div class="l5-ficha"><h3>${seen ? esc(e.nome) : '???'}${peg ? `<span class="l5-peg">${esc(T.pegou.replace('{n}', peg))}</span>` : ''}</h3><p class="l5-resumo">${seen ? esc(e.resumo) : '—'}${sub}</p>${linhas}</div>`;
  }).join('');
  const pr = bestProg();
  h += `<p class="l5-resumo" style="text-align:center">${esc((T.fichas || '{n}/{t}').replace('{n}', pr.fichas).replace('{t}', pr.nent))}</p>`;
  A.abrirPainel('Bestiário', h);
}

// ---------------------------------------------------------------- painel Rejogo (modo Caçada)
function painelRejogo() {
  const T = TX().modo, un = unlocked(), on = !!C.OPT.l5cacada, best = mem().placarCacada || 0;
  let h = `<p class="pn-resumo">${esc(T.aviso)}</p>`;
  h += `<div class="l5-modo"><label class="${un ? '' : 'off'}"><input type="checkbox" id="l5-cacada" ${on ? 'checked' : ''} ${un ? '' : 'disabled'}> ${esc(T.nome)} — <small>${un ? esc(T.desc) : esc(T.trancado)}</small></label></div>`;
  h += `<p class="l5-resumo" style="text-align:center;margin-top:12px">${best ? esc(T.placar.replace('{t}', A.fmtC(best))) : esc(T.placarVazio)}</p>`;
  const lc = l5Conq(); if (T.conq) h += `<p class="l5-resumo" style="text-align:center">${esc(T.conq.replace('{n}', lc.feitas).replace('{t}', lc.total))}</p>`;
  A.abrirPainel(T.titulo, h);
  const cb = $('#l5-cacada'); if (cb) cb.onchange = () => { C.OPT.l5cacada = cb.checked; try { C.salvarOpt(); } catch (e) {} try { C.toast(cb.checked ? TX().modo.ligar : TX().modo.desligar); } catch (e) {} };
}

// ---------------------------------------------------------------- título
function titulo() {
  try {
    css(); botoes(); atualizarBotoes();
    const el = $('#t-memoria'), m = mem();
    if (el && !el.dataset.l5) {
      el.dataset.l5 = '1'; const bits = [];
      const ut = m.ultimoTemp, T = ut && TX().temperamentos[ut];
      if (T) bits.push(TX().memoria.temperamento.replace('{nome}', T.nome));
      if (m.melhorOuviu === 0 && TX().memoria.radioSilencio) bits.push(TX().memoria.radioSilencio);
      if (bits.length) el.textContent = (el.textContent ? el.textContent + ' · ' : '') + bits.join(' · ');
    }
  } catch (e) {}
}

// ---------------------------------------------------------------- morte
function morte(quem) {
  try {
    const S = C.S, M = C.M, n = night(), D = TX().diagnostico; let d = '';
    const st = M ? M.state : null;
    if (quem === 'inspetor') {
      if (st === 'emboscada') d = D.emboscada;
      else if (st === 'fareja') d = D.fareja;
      else if (st === 'reza') d = D.reza;
      else if (st === 'vasculha') d = D.vasculha;
      else if (n && n.recuou && st === 'caca') d = D.falsa;
    }
    _mdiag = d; _mtemp = n ? n.temp : null;
    recordCacada();
  } catch (e) {}
}
function telaMorte() {
  try {
    const el = $('#dt-diag'); if (!el) return;
    const T = TX(), n = night(); const bits = [];
    let extra = ''; if (_mdiag) extra += _mdiag; if (_mtemp && T.diagnostico[_mtemp]) extra += T.diagnostico[_mtemp];
    if (extra) bits.push('<small style="color:#857a63">' + esc(extra) + '</small>');
    if (n) bits.push('<small style="color:#6d6452">' + esc(n.ouviu ? T.ouviu.morte.replace('{n}', n.ouviu) : T.ouviu.morteZero) + '</small>');
    if (bits.length) el.innerHTML = (el.innerHTML ? el.innerHTML + '<br>' : '') + bits.join('<br>');
  } catch (e) {}
}

// ---------------------------------------------------------------- pausa
function pausa() {
  try {
    const S = C.S; if (!S) return '';
    const T = TX(), n = night(), partes = [], tp = T.temperamentos[tempId(S)];
    if (tp) partes.push('humor: ' + tp.nome);
    if (n) partes.push(n.ouviu ? T.ouviu.pausa.replace('{n}', n.ouviu) : T.ouviu.pausaZero);
    if (S.modo && S.modo.cacada) partes.push('Caçada Limpa');
    let out = partes.length ? '<br>' + esc(partes.join(' · ')) : '';
    const dicas = T.pausa || []; if (dicas.length) out += '<br>' + esc(dicas[Math.abs((S.capMortes || 0) + (S.chapter || 0)) % dicas.length]);
    return out;
  } catch (e) { return ''; }
}
function difExtra() { try { return ' ' + (TX().difLinha || ''); } catch (e) { return ''; } }

// ---------------------------------------------------------------- fim de capítulo
function fimCap(c, r) {
  const out = [];
  try {
    const S = C.S, n = night();
    if (n) { const m = mudar(x => { x.humores = x.humores || {}; x.humores[n.temp] = true; x.ultimoTemp = n.temp; }); if (TEMPS.every(t => m.humores[t])) conq('l5_humores'); }
    const cp = n && n.cap && n.cap.ch === S.chapter ? n.cap : null;
    if (S.chapter >= 1 && (S.capLuzT || 0) <= 0 && (S.capT || 0) > 45) { conq('l5_noite_cega'); out.push('Capítulo inteiro sem acender a lanterna.'); }
    if (S.chapter >= 1 && (S.capCorreu || 0) < 0.5 && cp && !cp.luzPerto && (S.capT || 0) > 45) conq('l5_boanoite_moacir');
    if (S.chapter >= 1 && cp && !cp.sangrouPerto && (S.capT || 0) > 45) { conq('l5_sem_rastro'); out.push('Sem deixar rastro de sangue para ele.'); }
    if (S.chapter === 1 && S.modo && S.modo.cacada) conq('l5_zelador_cego');
    // capítulo mudo: ele nunca te ouviu neste capítulo
    if (cp) { if (!cp.ouviu && (S.capT || 0) > 45) { conq('l5_cap_mudo'); out.push(TX().ouviu.capMudo); } else if (cp.ouviu) out.push(TX().ouviu.capOuviu.replace('{n}', cp.ouviu)); }
    if (n) { const T = TX().temperamentos[n.temp]; if (T) out.push(TX().diagnostico.humorFim.replace('{nome}', T.nome)); }
    if (S.modo && S.modo.cacada && n && TX().modo.tempoCap) out.push(TX().modo.tempoCap.replace('{t}', A.fmtC(Math.floor(n.cacadaT || 0))));
  } catch (e) {}
  return out;
}

// ---------------------------------------------------------------- final
function recordCacada() { try { const n = N; if (!n || !n.cacadaT) return; mudar(x => { x.placarCacada = Math.max(x.placarCacada || 0, Math.floor(n.cacadaT)); }); } catch (e) {} }
function appendEpilogo() {
  try { const box = $('#e-txt'); if (!box) return; const sp = document.createElement('span'); sp.className = 'par'; sp.textContent = '\n\n' + TX().silencioTotal.epilogo; sp.style.animationDelay = (box.querySelectorAll('.par').length * 1.4) + 's'; box.appendChild(sp); } catch (e) {}
}
function final(tipo) {
  try {
    const S = C.S, n = night(); if (!n) return;
    recordCacada();
    mudar(x => { x.ultimoTemp = n.temp; });
    if (S.completo) {
      mudar(x => { x.melhorOuviu = (x.melhorOuviu == null) ? n.ouviu : Math.min(x.melhorOuviu, n.ouviu); });
      if (S.modo && S.modo.cacada) conq('l5_surda');
      const el = $('#e-stats'); if (el) el.innerHTML += '<br>' + esc(n.ouviu ? TX().ouviu.morte.replace('{n}', n.ouviu) : TX().ouviu.morteZero);
      if (n.ouviu === 0) { conq('l5_silencio_total'); if (el) el.innerHTML += '<br>' + esc(TX().silencioTotal.stat); appendEpilogo(); }
      if (!n.usouEsconderijo) conq('l5_nunca_cama');
      const favAnt = mem().favAnt; if (favAnt && !n.favContagem[favAnt]) conq('l5_variou');
    }
    const fav = favOf(n.favContagem); if (fav) mudar(x => { x.favAnt = fav; });
  } catch (e) {}
}

// ---------------------------------------------------------------- linhas de estatística
function statsLinhas() {
  try {
    const T = TX().bestiario, a = mem().best || {}; let total = 0, vis = 0;
    (T.entidades || []).forEach(e => e.comps.forEach(c => { total++; if (a[compKey(e.id, c.id)]) vis++; }));
    const hum = mem().humores || {}, nh = TEMPS.filter(t => hum[t]).length;
    const out = [['Comportamentos no bestiário', `${vis}/${total}`], ['Humores do Inspetor enfrentados', `${nh}/3`]];
    const best = mem().placarCacada || 0; if (best) out.push(['Mais tempo na Caçada Limpa', A.fmtC(best)]);
    const ms = mem().melhorOuviu; if (ms != null) out.push(['Noite com menos vezes ouvida', ms]);
    const lc = l5Conq(); out.push(['Conquistas de monstro', `${lc.feitas}/${lc.total}`]);
    return out;
  } catch (e) { return []; }
}

// ---------------------------------------------------------------- API
export const L5 = {
  ligar(ctx, api) { C = ctx; A = api; try { css(); } catch (e) {} try { const R = window.ROTEIRO; for (const c of (TX().conquistas || [])) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c); } catch (e) {} },
  difKey, difMod,
  novoJogo(S) { try { S.modo = S.modo || {}; S.modo.cacada = !!(C.OPT.l5cacada && unlocked()); } catch (e) {} },
  tick, titulo, morte, telaMorte, pausa, fimCap, final, statsLinhas, difExtra
};
