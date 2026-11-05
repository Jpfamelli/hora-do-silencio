// PROGRESSÃO — LOTE 5, 2ª rodada (monstros): modos de rejogo (Vigília, Perseguição, Caçador Único),
// memória do Inspetor entre noites (ronda onde te pegou, seu canto favorito), placar de contra-jogos,
// recordes de bravura (tempo colada, caçada sem esconderijo, fôlego), acervo das noites por humor,
// a carta do Davi na terceira morte no mesmo lugar e conquistas novas de contra-jogo.
// Ligado por src/progressao-lote5.js (que repassa C/A, como o L4b faz com o L4). Tudo passivo e à prova de erro.
import './progressao-lote5b-roteiro.js';

const K = 'hora-silencio-l5b';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const TX = () => (window.ROTEIRO.progressao || {}).lote5b || {};
let C = null, A = null;
const mem = () => { try { return A.ls.get(K, {}) || {}; } catch (e) { return {}; } };
const mudar = fn => { try { const m = mem(); fn(m); A.ls.set(K, m); return m; } catch (e) { return {}; } };
const unlocked = () => { try { return Object.keys((A.stats() || {}).finais || {}).length > 0; } catch (e) { return false; } };
const conq = id => { try { A.conquista(id); } catch (e) {} };
const nomeJog = () => { try { const n = A.ls.get('hora-silencio-nome', ''); return typeof n === 'string' ? n.trim().slice(0, 16) : ''; } catch (e) { return ''; } };

// ---------------------------------------------------------------- modos
const MODOS = ['l5vigilia', 'l5persegue', 'l5unico'];
function modoOn(id) { try { return !!(C.OPT[id] && unlocked()); } catch (e) { return false; } }
function syncModos(S) { try { S.modo = S.modo || {}; S.modo.vigilia = modoOn('l5vigilia'); S.modo.persegue = modoOn('l5persegue'); S.modo.unico = modoOn('l5unico'); } catch (e) {} }
function difKey(S) { try { if (!S) return ''; return 'b' + (S.modo && S.modo.vigilia ? 'V' : '') + (S.modo && S.modo.persegue ? 'P' : '') + (S.modo && S.modo.unico ? 'U' : ''); } catch (e) { return ''; } }
function difMod(v, S) {
  try {
    if (!S || !v || !S.modo) return;
    if (S.modo.vigilia) { v.ouvido *= 1.05; }
    if (S.modo.persegue) { v.vel *= 1.14; if (v.intervalo) v.intervalo *= 0.6; v.ouvido *= 1.08; }
    if (S.modo.unico) { v.ouvido *= 1.25; v.vel *= 1.06; if (v.intervalo) v.intervalo *= 0.72; v.aviso = Math.max(2, (v.aviso || 6) - 1); }
  } catch (e) {}
}

// ---------------------------------------------------------------- estado da noite
let NB = null, _ppos = null, _lastDano = 0;
function night() {
  const S = C && C.S; if (!S) return null;
  if (!NB || NB.sem !== S.semente) {
    NB = {
      sem: S.semente, defesas: new Set(), coladoT: 0, coladoMax: 0, cacadaLivreT: 0, cacadaLivreMax: 0, folegoT: 0, folegoMax: 0,
      pcegoT: 0, pcegoFeito: false, nervos: 0, fakeAtivo: false, fakeImovel: false, fakeDano: 0,
      prendePertoT: 0, nomeFeito: false, estAnt: null, cap: null, _gar: S.garrafasUsadas || 0, favCont: {}, _htipo: null
    };
  }
  return NB;
}
function capB() {
  const n = night(), S = C && C.S; if (!n || !S) return null;
  if (!n.cap || n.cap.ch !== S.chapter) {
    n.cap = { ch: S.chapter, caca: 0, forte: 0, usouArmario: false, usouEsconderijo: false, acordouNicho: false, sinoBase: null, sinoBote: false, iniT: S.capT || 0 };
  }
  // avisos de abertura (uma vez por tentativa: início de capítulo ou renascimento no checkpoint)
  const tentKey = S.chapter + ':' + (S.capMortes || 0);
  if (n._tentKey !== tentKey && (S.capT || 0) < 6) {
    n._tentKey = tentKey;
    try {
      const mp = mem().mortePonto;
      if (mp && mp.cap === S.chapter) C.toast(TX().memoria.rondaMorte);
      else {
        const fav = mem().favTipoAbuso;
        if (fav && S.chapter >= 1) { const tx = TX().memoria, nome = fav === 'cama' ? tx.tipoCama : fav === 'nicho' ? tx.tipoEstatua : tx.tipoArmario; setTimeout(() => { try { if (C.S === S && !S.dead) C.sub('lia', tx.cantoFavorito.replace('{tipo}', nome)); } catch (e) {} }, 2200); }
      }
      if ((S.modo && S.modo.unico) && S.chapter >= 1 && !(mp && mp.cap === S.chapter)) C.toast(TX().memoria.aprendeu);
    } catch (e) {}
  }
  return n.cap;
}

// ---------------------------------------------------------------- tick
function tick(dt) {
  try {
    const S = C.S, M = C.M, P = C.P; if (!S || C.mode !== 'jogo' || S.dead || S.fim) return;
    const n = night(); if (!n) return; const cp = capB();
    // Vigília: ele nunca recua
    try { if (S.modo && S.modo.vigilia && M) { M.recuo = 0; if (M.tensao > 0) M.tensao *= 0.6; } } catch (e) {}
    // Perseguição: tempo aguentado
    if (S.modo && S.modo.persegue) { n.persegueT = (n.persegueT || 0) + dt; if (n.persegueT >= 180) conq('l5b_persegue'); }
    // velocidade da jogadora (imobilidade)
    let vel = 0; if (_ppos && P && P.pos) vel = Math.hypot(P.pos.x - _ppos.x, P.pos.z - _ppos.z) / Math.max(dt, 1 / 120);
    _ppos = P && P.pos ? { x: P.pos.x, z: P.pos.z } : _ppos;
    const dM = (M && M.ativo && P && P.pos) ? M.pos.distanceTo(P.pos) : 999;
    const st = M && M.ativo ? M.state : null;
    const caca = st === 'caca' || st === 'bote' || st === 'agarra';
    const forte = caca || st === 'alerta';
    if (caca && n.estAnt !== 'caca' && n.estAnt !== 'bote' && n.estAnt !== 'agarra') {
      cp.caca++;
      try { const nx = -30, nz = -18; if (S.chapter === 4 && P && P.pos && Math.hypot(P.pos.x - nx, P.pos.z - nz) < 8) cp.acordouNicho = true; } catch (e) {}
    }
    if (forte) cp.forte++;
    // contra-jogos
    if (S.hidden) { n.defesas.add('esconder'); cp.usouEsconderijo = true; const tp = S.hidden.tipo || 'armario'; if (tp === 'armario') cp.usouArmario = true; if (n._htipo !== tp) { n._htipo = tp; n.favCont[tp] = (n.favCont[tp] || 0) + 1; } } else n._htipo = null;
    if (P && P.prende && M && M.ativo) n.defesas.add('folego');
    if (P && P.estatua >= 1) n.defesas.add('estatua');
    if (M && M.ativo && !S.flashOn && dM < 11) n.defesas.add('escuro');
    if (P && P.crouch && M && M.ativo && dM < 9) n.defesas.add('agachar');
    const garAgora = S.garrafasUsadas || 0; if (garAgora > (n._gar || 0)) { n._gar = garAgora; n.defesas.add('garrafa'); }
    if (contaDefesas() >= (TX().contra.lista || []).length) { conq('l5b_contra_jogos'); registraDefesas(contaDefesas()); }
    // colada nele sem morrer
    if (S.hidden && M && M.ativo && dM < 2.3) { n.coladoT += dt; if (n.coladoT > n.coladoMax) n.coladoMax = n.coladoT; if (n.coladoT >= 10) conq('l5b_colada'); }
    else if (!S.hidden || dM > 3.5) n.coladoT = 0;
    // caçada sobrevivida sem esconderijo
    if (caca && !S.hidden) { if ((S.capDano || 0) > _lastDano) n.cacadaLivreT = 0; n.cacadaLivreT += dt; if (n.cacadaLivreT > n.cacadaLivreMax) n.cacadaLivreMax = n.cacadaLivreT; }
    else n.cacadaLivreT = 0;
    // fôlego numa caçada
    if (P && P.prende && caca) { n.folegoT += dt; if (n.folegoT > n.folegoMax) n.folegoMax = n.folegoT; } else n.folegoT = 0;
    _lastDano = S.capDano || 0;
    // ponto cego (colada atrás do cego)
    if (M && M.ativo && dM < 6 && !S.hidden) {
      const fwx = Math.sin(M.yaw || 0), fwz = Math.cos(M.yaw || 0), vx = (P.pos.x - M.pos.x) / (dM || 1), vz = (P.pos.z - M.pos.z) / (dM || 1);
      if (fwx * vx + fwz * vz < -0.3) { n.pcegoT += dt; n.defesas.add('pontocego'); if (vel > 0.6 && n.pcegoT >= 3 && !n.pcegoFeito) { n.pcegoFeito = true; conq('l5b_pelas_costas'); } }
      else n.pcegoT = Math.max(0, n.pcegoT - dt * 2);
    } else n.pcegoT = Math.max(0, n.pcegoT - dt * 2);
    // falsa partida: ficar imóvel e enganar (nervos de aço)
    const fake = !!(M && M.ativo && M.recuo > 0 && caca);
    if (fake && !n.fakeAtivo) { n.fakeAtivo = true; n.fakeImovel = true; n.fakeDano = S.capDano || 0; }
    if (n.fakeAtivo) { if (vel > 0.6) n.fakeImovel = false; if (!fake) { if (n.fakeImovel && (S.capDano || 0) <= n.fakeDano && !S.dead) { n.nervos++; if (n.nervos >= 3) conq('l5b_nervos'); } n.fakeAtivo = false; } }
    // ele sabe meu nome: imóvel até ele desistir
    if (caca && dM < 4 && P && P.prende) n.prendePertoT += dt; else if (!caca) { if (n.prendePertoT >= 2.5 && (S.capDano || 0) <= _lastDano && nomeJog() && !n.nomeFeito && n.estAnt && (n.estAnt === 'caca' || n.estAnt === 'bote')) { n.nomeFeito = true; conq('l5b_sabe_nome'); try { C.sub('inspetor', (nomeJog() + '...')); } catch (e) {} } n.prendePertoT = 0; }
    // sino (Cap V): a última badalada
    if (S.chapter === 5) { if (S.flags && S.flags.sino) { if (cp.sinoBase == null) cp.sinoBase = S.capDano || 0; if ((S.capDano || 0) > cp.sinoBase) cp.sinoBote = true; } }
    n.estAnt = st;
  } catch (e) {}
}
function contaDefesas() { try { return night().defesas.size; } catch (e) { return 0; } }
function registraDefesas(n) { try { mudar(m => { m.defesasMax = Math.max(m.defesasMax || 0, n); }); } catch (e) {} }

// ---------------------------------------------------------------- morte
let _mdiag = '';
function morte(quem) {
  try {
    const S = C.S, M = C.M, D = TX().diag; let d = '';
    if (S.modo && S.modo.vigilia) d = D.vigilia;
    else if (S.modo && S.modo.persegue) d = D.persegue;
    const room = S.chapter + '|' + ((C.P && C.P.room && C.P.room.id) || '?');
    const m = mudar(x => { x.mortesSala = x.mortesSala || {}; x.mortesSala[room] = (x.mortesSala[room] || 0) + 1; x.mortePonto = { cap: S.chapter, room: (C.P && C.P.room && C.P.room.id) || null }; });
    const nmort = (m.mortesSala || {})[room] || 0;
    if (nmort >= 2 && mem().mortePonto && mem().mortePonto.cap === S.chapter) d = (d ? d + ' ' : '') + D.rondaMorte;
    _mdiag = d; _mdaviN = nmort;
  } catch (e) {}
}
let _mdaviN = 0;
function telaMorte() {
  try {
    const el = $('#dt-diag'); if (!el) return; const T = TX(); const bits = [];
    if (_mdiag) bits.push('<small style="color:#857a63">' + esc(_mdiag) + '</small>');
    if (_mdaviN >= 3) { const linhas = T.davi.linhas || []; const l = linhas[Math.min(_mdaviN - 3, linhas.length - 1)]; if (l) bits.push('<small style="color:#9a7b4a;font-style:italic">' + esc(l) + '</small>'); }
    if (bits.length) el.innerHTML = (el.innerHTML ? el.innerHTML + '<br>' : '') + bits.join('<br>');
  } catch (e) {}
}

// ---------------------------------------------------------------- fim de capítulo
function fimCap(c, r) {
  const out = [];
  try {
    const S = C.S, n = night(), cp = n && n.cap && n.cap.ch === S.chapter ? n.cap : null, T = TX();
    const dur = (S.capT || 0) > 45;
    // noites por humor (conta por capítulo sobrevivido)
    try { const h = (window.ROTEIRO.progressao.lote5 && tempoHumor()); if (h && S.chapter >= 1) { const m = mudar(x => { x.noites = x.noites || {}; x.noites[h] = (x.noites[h] || 0) + 1; }); if (['farejador', 'ouvinte', 'guardiao'].every(t => (m.noites[t] || 0) >= 3)) conq('l5b_noites'); } } catch (e) {}
    if (cp) {
      if (cp.caca === 0 && dur && S.chapter >= 1) { conq('l5b_fantasma'); out.push(T.fim.semPio); }
      if (cp.forte === 0 && dur && S.chapter >= 1) conq('l5b_sem_pio');
      if (!cp.usouArmario && cp.usouEsconderijo && dur && S.chapter >= 1) { conq('l5b_so_camas'); out.push(T.fim.semArmario); }
      if (S.chapter === 4 && !cp.acordouNicho) { conq('l5b_ninar'); out.push(T.fim.ninar); }
      if (S.chapter === 4 && !(S.flags && S.flags.l5_iscaLargou)) { conq('l5b_sem_isca'); out.push(T.fim.semIsca); }
      if (n.pcegoFeito) out.push(T.fim.pontoCego);
    }
    if (S.modo && S.modo.vigilia && S.chapter >= 1 && dur) { conq('l5b_vigilia'); out.push(T.fim.vigilia); }
    if (n && n.coladoMax >= 6) out.push(T.fim.colado.replace('{t}', A.fmtC(Math.floor(n.coladoMax))));
    // capítulos vencidos em cada modo da caça
    if (S.chapter >= 1 && dur && S.modo) { const w = []; if (S.modo.vigilia) w.push('vigilia'); if (S.modo.persegue) w.push('persegue'); if (S.modo.unico) w.push('unico'); if (w.length) mudar(m => { m.modoWins = m.modoWins || {}; w.forEach(k => m.modoWins[k] = (m.modoWins[k] || 0) + 1); }); }
    gravarRecordes(n);
  } catch (e) {}
  return out;
}
function tempoHumor() { try { const S = C.S; if (!S || !S.semente) return null; const s = String(S.semente); let x = 0; for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0; return ['farejador', 'ouvinte', 'guardiao'][x % 3]; } catch (e) { return null; } }
function gravarRecordes(n) {
  try { if (!n) return; mudar(m => { m.recColado = Math.max(m.recColado || 0, Math.floor(n.coladoMax || 0)); m.recCacada = Math.max(m.recCacada || 0, Math.floor(n.cacadaLivreMax || 0)); m.recFolego = Math.max(m.recFolego || 0, Math.floor(n.folegoMax || 0)); if (n.persegueT) m.recPersegue = Math.max(m.recPersegue || 0, Math.floor(n.persegueT)); }); } catch (e) {}
}

// ---------------------------------------------------------------- final
function final(tipo) {
  try {
    const S = C.S, n = night(); if (!n) return; gravarRecordes(n);
    const cp = n.cap && n.cap.ch === 5 ? n.cap : null;
    if (S.chapter === 5 && cp && S.flags && S.flags.sino && !cp.sinoBote && S.completo) conq('l5b_ultima_badalada');
    if (S.completo && S.modo && S.modo.unico) conq('l5b_unico');
    // resumo da noite na tela de final: defesas usadas e tempo colada
    try { const el = $('#e-stats'); if (el && S.completo) { const T = TX(), def = contaDefesas(), tot = (T.contra.lista || []).length; el.innerHTML += '<br>' + esc((def >= tot ? T.contra.completoNoite : T.contra.noite.replace('{n}', def).replace('{t}', tot))); if (n.coladoMax >= 4) el.innerHTML += '<br>' + esc(T.fim.colado.replace('{t}', A.fmtC(Math.floor(n.coladoMax)))); } } catch (e) {}
    // seu canto favorito: guarda o tipo mais repetido da noite (se abusou dele)
    try { let bt = null, bn = 0; for (const k in n.favCont) if (n.favCont[k] > bn) { bn = n.favCont[k]; bt = k; } mudar(m => { m.favTipoAbuso = (bt && bn >= 3) ? bt : null; }); } catch (e) {}
  } catch (e) {}
}

// ---------------------------------------------------------------- pausa / difExtra / stats
function pausa() {
  try {
    const S = C.S; if (!S) return ''; const T = TX(), partes = [], n = night();
    const ativos = MODOS.filter(id => S.modo && S.modo[id.replace('l5', '')]);
    const nm = []; if (S.modo) { if (S.modo.vigilia) nm.push('Vigília'); if (S.modo.persegue) nm.push('Perseguição'); if (S.modo.unico) nm.push('Caçador Único'); }
    if (nm.length) partes.push(nm.join(' · '));
    if (n) partes.push((T.contra.noite || '').replace('{n}', contaDefesas()).replace('{t}', (T.contra.lista || []).length));
    let out = partes.length ? '<br>' + esc(partes.join(' · ')) : '';
    const dicas = T.pausa || []; if (dicas.length) out += '<br>' + esc(dicas[Math.abs((S.capMortes || 0) + (S.chapter || 0) + 1) % dicas.length]);
    return out;
  } catch (e) { return ''; }
}
function difExtra() { try { const S = C.S, nm = []; if (S && S.modo) { if (S.modo.vigilia) nm.push('Vigília'); if (S.modo.persegue) nm.push('Perseguição'); if (S.modo.unico) nm.push('Caçador Único'); } return nm.length ? ' (' + nm.join(', ') + ')' : ''; } catch (e) { return ''; } }
function statsLinhas() {
  try {
    const m = mem(), T = TX(), out = [];
    if (m.defesasMax) out.push(['Mais defesas numa noite', `${m.defesasMax}/${(T.contra.lista || []).length}`]);
    if (m.recColado) out.push(['Mais tempo colada nele', A.fmtC(m.recColado)]);
    if (m.recCacada) out.push(['Maior caçada sem se esconder', A.fmtC(m.recCacada)]);
    if (m.recPersegue) out.push(['Mais tempo na Perseguição', A.fmtC(m.recPersegue)]);
    if (m.recFolego) out.push(['Mais tempo prendendo o ar na caça', A.fmtC(m.recFolego)]);
    const no = m.noites || {}, nn = ['farejador', 'ouvinte', 'guardiao'].reduce((s, t) => s + ((no[t] || 0) >= 3 ? 1 : 0), 0);
    out.push(['Humores dominados (3 noites)', `${nn}/3`]);
    const w = m.modoWins || {}; if (w.vigilia || w.persegue || w.unico) out.push(['Capítulos na Vigília / Perseguição / Único', `${w.vigilia || 0} / ${w.persegue || 0} / ${w.unico || 0}`]);
    return out;
  } catch (e) { return []; }
}

// ---------------------------------------------------------------- lápide compartilhável
function copiar() {
  try {
    const S = C.S, T = TX().lapide, causas = {}; // quem mais te pegou NESTA noite
    const base = (A.stats() || {}).causas || {};
    // aproxima "desta noite" pela diferença não é guardada; usa a entidade com mais mortes acumuladas como troféu
    let best = null, nb = -1; for (const k in base) if (base[k] > nb) { nb = base[k]; best = k; }
    if (best && nb > 0 && T.icones[best]) { const nomes = { inspetor: 'Inspetor', ana: 'a Menina', procissao: 'a Procissão', chamado: 'o Chamado' }; return (T.pegou || '').replace('{icone}', T.icones[best]).replace('{nome}', nomes[best] || best).replace('{n}', nb); }
    return '';
  } catch (e) { return ''; }
}

// ---------------------------------------------------------------- painéis e botões do título
function css() {
  if ($('#l5b-css')) return;
  const s = document.createElement('style'); s.id = 'l5b-css';
  s.textContent = `[hidden]{display:none!important}
.l5b-row{padding:9px 0;border-top:1px solid #1f1b16;text-align:left;color:#cfc3a6}
.l5b-row b{color:#e9dfc8;font-family:"Special Elite",monospace;font-size:14px}
.l5b-row small{color:#857a63;line-height:1.55}
.l5b-row.off{opacity:.5}
.l5b-modo label{display:block;padding:10px 0;border-top:1px solid #1f1b16;cursor:pointer}.l5b-modo label.off{opacity:.5;cursor:default}
.l5b-sel{float:right;color:#c9a75a;font-family:"Special Elite",monospace;font-size:12px}`;
  document.head.appendChild(s);
}
function botoes() {
  try {
    if (!$('#b-stats')) return; css();
    const ancora = $('#b-l5-rejogo') || $('#b-l5-best') || $('#b-stats');
    if (!$('#b-l5b-modos')) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'b-l5b-modos'; b.textContent = 'Modos da caça'; ancora.insertAdjacentElement('afterend', b); b.onclick = painelModos; }
    if (!$('#b-l5b-noites')) { const b = document.createElement('button'); b.className = 'btn'; b.id = 'b-l5b-noites'; b.textContent = 'Noites e defesas'; ($('#b-l5b-modos') || ancora).insertAdjacentElement('afterend', b); b.onclick = painelNoites; }
  } catch (e) {}
}
function painelModos() {
  const T = TX().modos, un = unlocked();
  let h = `<p class="pn-resumo">${esc(T.aviso)}</p><div class="l5b-modo">`;
  h += (T.lista || []).map(mo => {
    const on = !!C.OPT[mo.id];
    return `<label class="${un ? '' : 'off'}"><input type="checkbox" data-modo="${mo.id}" ${on ? 'checked' : ''} ${un ? '' : 'disabled'}> <b>${esc(mo.nome)}</b> — <small>${un ? esc(mo.desc) : esc(T.trancado)}</small></label>`;
  }).join('') + '</div>';
  const m = mem(); if (m.recPersegue) h += `<p class="pn-resumo" style="text-align:center;margin-top:10px">${esc(T.recordePerseguicao.replace('{t}', A.fmtC(m.recPersegue)))}</p>`;
  else h += `<p class="pn-resumo" style="text-align:center;margin-top:10px">${esc(T.semRecorde)}</p>`;
  A.abrirPainel(T.titulo, h);
  $('#pn-lista').querySelectorAll('[data-modo]').forEach(cb => cb.onchange = () => {
    C.OPT[cb.dataset.modo] = cb.checked; try { C.salvarOpt(); } catch (e) {}
    const mo = (T.lista || []).find(x => x.id === cb.dataset.modo);
    try { C.toast(cb.checked && mo ? mo.liga : T.desliga); } catch (e) {}
  });
}
function painelNoites() {
  const T = TX(), m = mem(), no = m.noites || {}, LN = TX().noites, def = m.defesasMax || 0, tot = (T.contra.lista || []).length;
  let h = `<p class="pn-resumo">${esc(LN.aviso)}</p>`;
  h += ['farejador', 'ouvinte', 'guardiao'].map(t => {
    const q = no[t] || 0, nome = LN[t] || t;
    return `<div class="l5b-row ${q ? '' : 'off'}"><b>${esc(LN.selo.replace('{nome}', nome))}</b><span class="l5b-sel">${q ? esc(LN.contagem.replace('{n}', q)) : esc(LN.nenhuma)}</span></div>`;
  }).join('');
  h += `<p class="pn-resumo" style="margin-top:14px">${esc(T.contra.aviso)}</p>`;
  h += `<div class="l5b-row"><b>${esc((T.contra.recorde || '').replace('{n}', def).replace('{t}', tot))}</b></div>`;
  h += (T.contra.lista || []).map(c => `<div class="l5b-row"><b>${esc(c.nome)}</b><br><small>${esc(c.dica)}</small></div>`).join('');
  const R = T.recordes;
  h += `<p class="pn-resumo" style="margin-top:14px">Recordes de bravura</p>`;
  h += `<div class="l5b-row"><b>${esc(R.colado)}</b><span class="l5b-sel">${m.recColado ? A.fmtC(m.recColado) : esc(R.coladoVazio)}</span></div>`;
  h += `<div class="l5b-row"><b>${esc(R.cacada)}</b><span class="l5b-sel">${m.recCacada ? A.fmtC(m.recCacada) : esc(R.coladoVazio)}</span></div>`;
  h += `<div class="l5b-row"><b>${esc(R.folego)}</b><span class="l5b-sel">${m.recFolego ? A.fmtC(m.recFolego) : esc(R.coladoVazio)}</span></div>`;
  A.abrirPainel(LN.titulo, h);
}
function titulo() {
  try {
    css(); botoes();
    const el = $('#t-memoria'), m = mem();
    if (el && !el.dataset.l5b) {
      el.dataset.l5b = '1'; const bits = [];
      if (m.mortePonto && TX().titulo.ronda) bits.push(TX().titulo.ronda);
      if (m.defesasMax >= 4 && TX().titulo.defesas) bits.push(TX().titulo.defesas.replace('{n}', m.defesasMax));
      if (bits.length) el.textContent = (el.textContent ? el.textContent + ' · ' : '') + bits.join(' · ');
    }
  } catch (e) {}
}

// ---------------------------------------------------------------- API
export const L5B = {
  ligar(ctx, api) { C = ctx; A = api; try { css(); } catch (e) {} try { const R = window.ROTEIRO; for (const c of (TX().conquistas || [])) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c); } catch (e) {} },
  difKey, difMod,
  novoJogo(S) { syncModos(S); },
  tick, morte, telaMorte, fimCap, final, pausa, difExtra, statsLinhas, titulo, copiar
};
