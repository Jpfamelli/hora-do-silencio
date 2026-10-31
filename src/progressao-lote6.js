// PROGRESSÃO — LOTE 6 (rejogabilidade): conquistas de maestria, Regras da Casa empilháveis, Noite do Dia,
// semente por palavra, pontuação da noite, Hall da Fama, Quadro de Recordes com medalhas e soma dos melhores,
// Caça aos Finais, comparação com o código de um amigo, faixa de capítulos limpos e "o que mudou esta noite".
// Ligado por src/progressao.js (PG); todo o texto mora em src/progressao-lote6-roteiro.js. Tudo passivo e à
// prova de erro: nada trava o jogo nem o QA, e as regras só valem quando o jogador as liga (padrão: desligadas).
import './progressao-lote6-roteiro.js';

const K = 'hora-silencio-l6';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const TX = () => (window.ROTEIRO.progressao || {}).lote6 || {};
const ROM = ['Prólogo', 'Capítulo I', 'Capítulo II', 'Capítulo III', 'Capítulo IV', 'Capítulo V'];
let C = null, A = null;
const mem = () => { try { return A.ls.get(K, {}) || {}; } catch (e) { return {}; } };
const mudar = fn => { const m = mem(); try { fn(m); } catch (e) {} A.ls.set(K, m); return m; };
const conq = id => { try { A.conquista(id); } catch (e) {} };
const stats = () => { try { return A.stats() || {}; } catch (e) { return {}; } };
const algumFinal = () => { try { return Object.keys(stats().finais || {}).length > 0; } catch (e) { return false; } };
const fmt = s => { try { return A.fmt(s); } catch (e) { return Math.round(s) + 's'; } };
const fmtC = s => { try { return A.fmtC(s); } catch (e) { return Math.round(s) + 's'; } };
const regrasDef = () => (TX().regras || []);
const num = n => (n || 0).toLocaleString('pt-BR');

// ---------------------------------------------------------------- estilo
function css() {
  if ($('#l6-css')) return;
  const s = document.createElement('style'); s.id = 'l6-css';
  s.textContent = `[hidden]{display:none!important}
#l6-faixa{text-align:center;color:#9a8f73;font-family:"Special Elite",monospace;font-size:13px;margin:6px 0 0;letter-spacing:.04em}
#l6-faixa b{color:#c9a75a}
.l6-abas{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:14px}.l6-abas .btn{font-size:15px;padding:4px 10px}.l6-abas .btn.on{color:#c9a75a}
.l6-aviso{text-align:center;color:#857a63;font-style:italic;margin:-4px 0 14px;font-size:14px}
.l6-regra{display:block;padding:8px 2px;border-top:1px solid #1f1b16;cursor:pointer}
.l6-regra.off{opacity:.5}.l6-regra small{color:#857a63;display:block;margin-left:24px}
.l6-regra .m{float:right;color:#b0362a;font-size:12px;letter-spacing:.08em}
.l6-mult{text-align:center;color:#c9a75a;font-family:"Special Elite",monospace;margin:12px 0 2px}
.l6-lin{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-top:1px solid #1f1b16;color:#cfc3a6}
.l6-lin b{color:#e9dfc8;font-weight:normal}.l6-lin .v{color:#c9a75a;font-family:"Special Elite",monospace}
.l6-med{display:inline-block;width:13px;text-align:center}.l6-med.ouro{color:#e7c75a}.l6-med.prata{color:#cdd3d8}.l6-med.bronze{color:#c08a4e}
.l6-fim{padding:7px 0;border-top:1px solid #1f1b16;color:#cfc3a6}.l6-fim.off{color:#6d6452;font-style:italic}.l6-fim .nm{color:#c9a75a}
.l6-pts{text-align:center;font-family:"Special Elite",monospace;color:#c9a75a;font-size:17px;margin:4px 0}
.l6-dia{text-align:center;margin:8px 0}.l6-dia .btn{margin:4px}
#l6-giz{margin:8px 4px}`;
  document.head.appendChild(s);
}

// ---------------------------------------------------------------- semente do dia / palavra
function hojeChave() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function hojeSemente() {
  const d = new Date(), n = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  let s = (n >>> 0).toString(36).toUpperCase(); while (s.length < 4) s = '0' + s; return s.slice(0, 7);
}
function palavraSemente(txt) {
  const t = String(txt || '').toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 7);
  return t.length >= 4 ? t : null;
}
function fnv(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; }
function sementeAleatoria() { const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 5; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }
// regra sorteada de forma determinística pela data (a mesma para todo mundo hoje)
function regraDoDia() { try { const d = regrasDef(); if (!d.length) return null; return d[fnv('rd' + hojeChave()) % d.length]; } catch (e) { return null; } }
function ehTematica(sem) { try { return (TX().temaSementes || []).includes(String(sem || '').toUpperCase()); } catch (e) { return false; } }
let pendenteSurpresa = null; // regras sorteadas para a próxima Noite Surpresa, consumidas em novoJogo

// quanto o jogador já viu do que a casa esconde (conquistas + finais + acervo)
function completude() {
  try {
    const R = window.ROTEIRO, cq = (() => { try { return A.ls.get(C.KEYS.CONQ_KEY, {}) || {}; } catch (e) { return {}; } })();
    const nq = (R.conquistas || []).filter(x => cq[x.id]).length, tq = (R.conquistas || []).length || 1;
    const nf = Object.keys((stats().finais) || {}).length, tf = 3;
    const nl = C.loreAchado ? C.loreAchado() : 0, tl = C.totalLore ? (C.totalLore() || 1) : 1;
    const pct = Math.round(100 * ((nq / tq) + (Math.min(nf, tf) / tf) + (nl / tl)) / 3);
    return { pct: Math.max(0, Math.min(100, pct)), nq, tq, nf, tf, nl, tl };
  } catch (e) { return { pct: 0, nq: 0, tq: 1, nf: 0, tf: 3, nl: 0, tl: 1 }; }
}
function checarPlatina() {
  try { const c = completude(); if (c.pct >= 100 && c.nq >= c.tq && c.nf >= c.tf && c.nl >= c.tl) conq('l6_platina'); } catch (e) {}
}

// ---------------------------------------------------------------- regras da casa
function regrasLigadas() { try { return (C.OPT.l6regras || []).filter(id => regrasDef().some(r => r.id === id)); } catch (e) { return []; } }
function multAtivo(S) {
  const regs = (S ? (S.l6regras || []) : regrasLigadas());
  let m = 1; for (const id of regs) { const r = regrasDef().find(x => x.id === id); if (r) m += r.mult; }
  try { m += .12 * ((S ? (S.mods || []) : (C.OPT.mods || [])).length); } catch (e) {}
  return Math.round(m * 100) / 100;
}
// gancho do PG.dif: endurece a dificuldade efetiva conforme as regras ligadas na noite
function difMod(v, S) {
  try {
    const regs = (S && S.l6regras) || [];
    if (regs.includes('passo')) v.vel *= 1.12;
    if (regs.includes('morcego')) v.ouvido *= 1.5;
    if (regs.includes('pilhaseca')) v.pilha *= 2.2;
    if (regs.includes('subito')) v.aviso = Math.max(1.5, (v.aviso || 7) - 4);
    if (regs.includes('implacavel')) { v.intervalo = (v.intervalo || 1) * .6; v.vel *= 1.03; }
    if (regs.includes('carne')) v.dano = (v.dano || 1) * 1.6;
  } catch (e) {}
}

// ---------------------------------------------------------------- pontuação da noite
const RKPTS = { S: 400, A: 250, B: 120, C: 40 };
function pontos(S) {
  try {
    let base = 0; for (const id in (S.ranks || {})) base += RKPTS[S.ranks[id]] || 0;
    base += (C.loreAchado ? C.loreAchado() : 0) * 120;
    if (S.completo) base += 1500;
    base -= (S.mortes || 0) * 300;
    base += Math.max(0, Math.round((5400 - (S.tempo || 0)) * 2));
    base += Math.max(0, Math.round((2 - (S.l6_ruidoMed || 0)) * 300));
    return Math.max(0, Math.round(base * multAtivo(S)));
  } catch (e) { return 0; }
}

// ---------------------------------------------------------------- trackers por noite
function initRun(S) {
  if (!S) return;
  S.l6_luz = 0; S.l6_caca = false; S.l6_dano = false; S.l6_intoc = 0; S.l6_desN = {};
  S.l6_ruido = 0; S.l6_streak = S.l6_streak || 0; S._l6cc = false; S._l6cap = S.chapter;
  S.l6_esc = false;
}
let C_PERTO_T = 0;
function registraPerto() {
  const s = A.somaStat(x => { x.l6perto = (x.l6perto || 0) + 1; });
  const n = s.l6perto || 0;
  if (n >= 10) conq('l6_perto10'); if (n >= 30) conq('l6_perto30'); if (n >= 60) conq('l6_perto60');
}

// ---------------------------------------------------------------- título: botão Rejogo + faixa de limpos
function injetar() {
  try {
    const menu = $('#title .menu');
    if (menu && !$('#b-rejogo')) {
      const b = document.createElement('button'); b.className = 'btn'; b.id = 'b-rejogo'; b.textContent = (TX().hub || {}).titulo || 'Rejogo';
      b.onclick = () => openHub('rejogo');
      (($('#b-stats') || $('#b-caps')) || menu).insertAdjacentElement ? (($('#b-stats') || $('#b-caps')).insertAdjacentElement('afterend', b)) : menu.appendChild(b);
    }
    if (menu && !$('#l6-faixa')) { const d = document.createElement('div'); d.id = 'l6-faixa'; d.hidden = true; const opts = $('#title .opts'); (opts || menu).insertAdjacentElement('beforebegin', d); }
  } catch (e) {}
}
function titulo() {
  try {
    injetar();
    checarPlatina();
    const el = $('#l6-faixa'), f = TX().faixa || {}, rec = mem().faixaRec || 0, cp = completude();
    if (el) {
      if (rec > 0) { el.innerHTML = `${esc(f.recorde || 'recorde')}: <b>${rec}</b> ${esc(f.limpos || 'capítulos limpos seguidos')}`; el.hidden = false; }
      else if (cp.pct > 0) { const C6 = TX().completude || {}; el.innerHTML = `${esc(C6.label || 'você já viu')} <b>${cp.pct}%</b> ${esc(C6.de || 'do que a casa esconde')}`; el.hidden = false; }
      else el.hidden = true;
    }
  } catch (e) {}
}
function tecla() { return false; }

// ---------------------------------------------------------------- novo jogo
function novoJogo(S) {
  try {
    S.l6regras = algumFinal() ? regrasLigadas().slice() : [];
    // Noite Surpresa: consome as regras sorteadas uma vez
    if (pendenteSurpresa) { S.l6_surpresa = true; if (algumFinal()) S.l6regras = pendenteSurpresa.slice(); pendenteSurpresa = null; }
    S.l6_diaria = S.semente === hojeSemente();
    // Noite do Dia: aplica a regra de hoje por cima (mesma para todo mundo)
    if (S.l6_diaria && algumFinal()) { const rd = regraDoDia(); if (rd && !S.l6regras.includes(rd.id)) S.l6regras = S.l6regras.concat([rd.id]); }
    S.l6_tematica = ehTematica(S.semente);
    initRun(S);
  } catch (e) {}
}

// ---------------------------------------------------------------- tick (leve)
function tick(dt) {
  try {
    const S = C.S, P = C.P, M = C.M; if (!S || C.mode !== 'jogo') return;
    if (S.l6_luz == null) initRun(S);
    if (S._l6cap !== S.chapter) { S._l6cap = S.chapter; S.l6_esc = false; }
    if (S.flashOn) S.l6_luz += dt;
    if (S.hidden) S.l6_esc = true;
    if (M && M.ativo && M.state === 'caca') S.l6_caca = true;
    if ((S.capDano || 0) > 0) S.l6_dano = true;
    S.l6_ruido = (S.l6_ruido || 0) + (P.noiseR || 0) * dt;
    // escapadas rente ao Inspetor
    if (M && M.ativo && !S.dead && !S.hidden) {
      const d = M.pos.distanceTo(P.pos);
      if (d < 1.6) S._l6cc = true;
      else if (S._l6cc && d > 4) { S._l6cc = false; registraPerto(); }
    } else S._l6cc = false;
  } catch (e) {}
}

// ---------------------------------------------------------------- fim de capítulo
function fimCap(c, r) {
  const linhas = [];
  try {
    const S = C.S; if (!S) return linhas;
    const idx = ROM.indexOf(ROM[S.chapter]); // chapter atual
    const cap = S.chapter;
    const mt = r.meta || { s: 8 }, ouro = mt.s * 0.72, minEf = (r.tEf || S.capT) / 60;
    // conquistas por capítulo
    if (cap >= 1 && (S.l6_luz || 0) < 3) conq('l6_sem_luz');
    if (cap >= 1 && !S.l6_esc) conq('l6_sem_esconder');
    if (r.nivelRuido === 'Barulhenta' && !(S.capMortes || 0)) conq('l6_barulhenta');
    if ((r.ruido || 9) < 1) conq('l6_mudez');
    if (minEf < ouro) conq('l6_ouro');
    if (r.letra === 'S' && (r.selos || {}).intocada && !(S.capMortes || 0)) conq('l6_impecavel');
    // rank SS: o degrau dourado acima do S
    const ss = r.letra === 'S' && (r.selos || {}).intocada && !(S.capMortes || 0) && !(S.capVisto || 0) && minEf < ouro;
    if (ss) conq('l6_ss');
    if (cap === 0 && (r.tEf || S.capT) < 120) conq('l6_prologo_veloz');
    // acumuladores da noite
    if ((r.selos || {}).intocada) { S.l6_intoc = (S.l6_intoc || 0) + 1; if (S.l6_intoc >= 1) conq('l6_intocada1'); if (S.l6_intoc >= 3) conq('l6_intocada3'); }
    if (desafioFeito(S, c.id)) S.l6_desN[c.id] = 1;
    // faixa de capítulos limpos seguidos
    if (!(S.capMortes || 0)) { S.l6_streak = (S.l6_streak || 0) + 1; const rec = mem().faixaRec || 0; if (S.l6_streak > rec) mudar(m => { m.faixaRec = S.l6_streak; }); if (S.l6_streak >= 3) conq('l6_streak3'); if (S.l6_streak >= 5) conq('l6_streak5'); }
    else S.l6_streak = 0;
    // capítulo sem esconderijo nenhum nesta noite (alimenta "Tudo Numa Noite")
    if (cap >= 1 && !S.l6_esc) S.l6_semEscAlgum = true;
    // medalha de tempo do capítulo + rank SS
    if (ss) linhas.push(`rank <b class="ouro">SS</b> — a marca de ouro deste capítulo`);
    const med = medalhaTempo(minEf, mt);
    if (med) linhas.push(`${TX().medalhasTempo ? 'medalha de tempo' : 'medalha'}: <b class="ouro">${med}</b> (ouro abaixo de ${(mt.s * .72).toFixed(1)} min)`);
  } catch (e) {}
  return linhas;
}
function desafioFeito(S, id) { try { return A.desafioOk ? A.desafioOk(S, id) : false; } catch (e) { return false; } }
function medalhaTempo(min, mt) { const s = mt.s || 8; if (min < s * .72) return 'ouro'; if (min < s) return 'prata'; if (min < (mt.a || s * 1.6)) return 'bronze'; return null; }

// ---------------------------------------------------------------- morte
function morte() { try { if (C.S) C.S.l6_streak = 0; } catch (e) {} }

// ---------------------------------------------------------------- final
function final(tipo) {
  try {
    const S = C.S; if (!S) return;
    // ruído médio da noite
    S.l6_ruidoMed = S.tempo > 1 ? (S.l6_ruido || 0) / S.tempo : 0;
    const R = window.ROTEIRO, caps = R.capitulos, todosS = caps.every(c => (S.ranks || {})[c.id] === 'S');
    const regs = S.l6regras || [];
    // desafios secretos da noite (Noite Cheia): último capítulo não tem fimCap
    try { if (desafioFeito(S, caps[S.chapter].id)) S.l6_desN[caps[S.chapter].id] = 1; } catch (e) {}
    try { const uc = caps[S.chapter], r = A.calcRank(C.S); if ((r.selos || {}).intocada) S.l6_intoc = (S.l6_intoc || 0) + 1; } catch (e) {}
    const desN = Object.keys(S.l6_desN || {}).length;
    if (S.completo) {
      if (desN >= 6) conq('l6_noite_cheia');
      if (!S.l6_caca) conq('l6_nunca_ouvida');
      if ((S.l6_luz || 0) < 20) conq('l6_primeira_hora');
      if ((S.l6_intoc || 0) >= 3) conq('l6_intocada3');
      if ((S.l6_intoc || 0) >= 6 || !S.l6_dano) conq('l6_intocada6');
      if (S.dif === 'pesadelo' && !(S.mortes || 0) && !S.l6_dano) conq('l6_hora_perfeita');
      if (todosS && !(S.mortes || 0) && tipo === 'verdadeiro') conq('l6_noite_perfeita');
      if ((S.tempo || 1e9) < 2400) conq('l6_sub40');
      if ((S.tempo || 1e9) < 1800) conq('l6_sub30');
      if ((S.tempo || 1e9) < 1200) conq('l6_sub20');
      if (!(S.mortes || 0)) conq('l6_sem_morte');
      if (S.l6_surpresa) conq('l6_surpresa');
      if (S.l6_tematica) conq('l6_tematica');
      // "Tudo Numa Noite": o combo de maestria numa só campanha
      if (tipo === 'verdadeiro' && !S.l6_caca && S.l6_semEscAlgum && !(S.mortes || 0)) conq('l6_tudo_numa_noite');
      if (regs.length >= 1) conq('l6_regra');
      if (regs.length >= 3) conq('l6_tres_pesos');
      if (regs.length >= 5) conq('l6_mao_cheia');
      if (regs.length >= regrasDef().length && regrasDef().length) conq('l6_casa_cheia');
    }
    // pontuação e recordes
    const pt = pontos(S); S.l6_pontos = pt;
    if (pt > 40000) conq('l6_pontos'); if (pt > 80000) conq('l6_lenda');
    mudar(m => {
      m.pontos = m.pontos || {}; const dkey = S.dif || 'normal';
      if (!m.pontos[dkey] || pt > m.pontos[dkey]) m.pontos[dkey] = pt;
      if (S.completo) {
        m.ruidoMin = (m.ruidoMin == null || S.l6_ruidoMed < m.ruidoMin) ? S.l6_ruidoMed : m.ruidoMin;
        m.mortesMin = (m.mortesMin == null || (S.mortes || 0) < m.mortesMin) ? (S.mortes || 0) : m.mortesMin;
        m.hall = (m.hall || []).concat([{ t: S.tempo || 0, dif: dkey, final: tipo, data: hojeChave(), pts: pt }]).sort((a, b) => a.t - b.t).slice(0, 5);
        if (todosS && !(S.mortes || 0) && tipo === 'verdadeiro') m.noitePerfeita = hojeChave();
      }
      // Noite do Dia
      if (S.l6_diaria && S.completo) {
        m.dia = m.dia || { datas: {}, jogados: {} };
        const hoje = hojeChave();
        if (!m.dia.datas[hoje] || (S.tempo || 0) < m.dia.datas[hoje]) m.dia.datas[hoje] = S.tempo || 0;
        m.dia.jogados[hoje] = 1;
      }
    });
    if (S.l6_diaria && S.completo) { conq('l6_diaria'); if (Object.keys((mem().dia || {}).jogados || {}).length >= 3) conq('l6_ofensiva'); }
    const sg = stats();
    if ((sg.partidas || 0) >= 10) conq('l6_veterana');
    if ((sg.partidas || 0) >= 25) conq('l6_insone');
    checarPlatina();
  } catch (e) {}
}

// ---------------------------------------------------------------- tela final: pontos, giz, o que mudou
function telaFinal(tipo) {
  try {
    const S = C.S, el = $('#e-stats'); if (!el || !S) return;
    const P = TX(), pt = S.l6_pontos != null ? S.l6_pontos : pontos(S);
    const rec = (mem().pontos || {})[S.dif || 'normal'] || 0;
    let extra = `<br><span class="l6-pts">${esc((P.pontos || {}).nome || 'Pontos da noite')}: ${num(pt)}</span>`;
    if (rec && pt >= rec) extra += ' <b class="ouro">novo recorde!</b>';
    else if (rec) extra += ` <small>(recorde ${num(rec)})</small>`;
    if ((S.l6regras || []).length) extra += `<br><small>regras ligadas: ${S.l6regras.map(id => esc((regrasDef().find(r => r.id === id) || {}).nome)).filter(Boolean).join(', ')} · multiplicador ${multAtivo(S)}×</small>`;
    extra += mudouTxt(S);
    if (S.completo) extra += checklistTxt(S, tipo);
    el.innerHTML += extra;
    // botão copiar em giz
    const g = P.giz || {}; const area = $('#escolha') ? null : el;
    if (!$('#l6-giz')) {
      const b = document.createElement('button'); b.className = 'btn'; b.id = 'l6-giz'; b.textContent = g.botao || 'Copiar em giz';
      b.onclick = () => copiarGiz(S, b, g);
      const ref = $('#e-copiar'); if (ref) ref.insertAdjacentElement('afterend', b); else el.insertAdjacentElement('afterend', b);
    }
  } catch (e) {}
}
function checklistTxt(S, tipo) {
  try {
    const K = TX().checklist || {};
    const itens = [
      [K.final || 'final verdadeiro', tipo === 'verdadeiro'],
      [K.ouvida || 'nunca caçada', !S.l6_caca],
      [K.esconder || 'um capítulo sem esconderijo', !!S.l6_semEscAlgum],
      [K.morte || 'sem morrer', !(S.mortes || 0)]
    ];
    const marca = itens.map(([t, ok]) => `${ok ? '✓' : '·'} ${esc(t)}`).join(' · ');
    return `<br><small>${esc(K.titulo || 'Tudo numa noite')}: ${marca}</small>`;
  } catch (e) { return ''; }
}
function mudouTxt(S) {
  try {
    const M = TX().mudou || {}; if (!S.quadro || !S.ordem || !S.code) return '';
    return `<br><small>${esc(M.titulo || 'O que mudou esta noite')}: ${esc(M.quadro || 'quadro')} ${S.quadro.join('-')} · ${esc(M.valvulas || 'válvulas')} ${S.ordem.join('-')} · ${esc(M.cofre || 'cofre')} ${S.code.join('')}</small>`;
  } catch (e) { return ''; }
}
function copiarGiz(S, b, g) {
  try {
    const R = window.ROTEIRO, caps = R.capitulos;
    const linha = caps.map(c => { const r = (S.ranks || {})[c.id]; return r === 'S' ? '🅢' : r ? r : '·'; }).join(' ');
    const segr = `${C.loreAchado ? C.loreAchado() : 0}/${C.totalLore ? C.totalLore() : 0}`;
    const nome = (() => { try { return C.D().nome; } catch (e) { return ''; } })();
    const cod = (() => { try { return A.codigoDesafio ? A.codigoDesafio(S) : (S.semente || '—'); } catch (e) { return S.semente || '—'; } })();
    const txt = `A Hora do Silêncio — ${nome}\n⏱ ${fmtC(S.tempo || 0)}   ☠ ${S.mortes || 0}\n${linha}\n🔦 lore ${segr}   ✦ ${num(S.l6_pontos != null ? S.l6_pontos : pontos(S))} pts\nsemente ${cod}\n${location.href.split('#')[0]}`;
    const ok = () => { b.textContent = g.copiado || 'Copiado!'; setTimeout(() => b.textContent = g.botao || 'Copiar em giz', 1800); };
    try { navigator.clipboard.writeText(txt).then(ok, () => fb()); } catch (e) { fb(); }
    function fb() { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); ok(); } catch (e) {} t.remove(); }
  } catch (e) {}
}

// ---------------------------------------------------------------- pausa
function pausa() {
  try {
    const S = C.S; if (!S) return '';
    const regs = S.l6regras || []; let out = '';
    if (regs.length) out += `<br>regras da casa: ${regs.map(id => esc((regrasDef().find(r => r.id === id) || {}).nome)).filter(Boolean).join(', ')} · ${multAtivo(S)}× no placar`;
    if (S.l6_diaria) out += '<br>Noite do Dia';
    if (S.l6_surpresa) out += '<br>Noite Surpresa';
    if (S.l6_tematica) out += '<br>semente marcada';
    return out;
  } catch (e) { return ''; }
}

// ---------------------------------------------------------------- estatísticas (linhas extras)
function statsLinhas() {
  try {
    const m = mem(), s = stats(), P = TX();
    const best = m.pontos ? Math.max(0, ...Object.values(m.pontos)) : 0;
    const L = [], cp = completude();
    L.push(['Quanto da casa você já viu', cp.pct + '%']);
    L.push(['Escapadas rente ao Inspetor', s.l6perto || 0]);
    L.push(['Melhor placar de uma noite', best ? num(best) : '—']);
    L.push(['Capítulos limpos seguidos (recorde)', m.faixaRec || 0]);
    if (m.ruidoMin != null) L.push(['Noite mais silenciosa (ruído médio)', (m.ruidoMin).toFixed(1)]);
    return L;
  } catch (e) { return []; }
}

// ---------------------------------------------------------------- painel Rejogo (hub)
function openHub(aba) {
  try {
    const P = TX(), hub = P.hub || {};
    const barra = `<div class="l6-abas">${(hub.abas || []).map(([k, n]) => `<button class="btn ${k === aba ? 'on' : ''}" data-aba="${k}">${esc(n)}</button>`).join('')}</div><p class="l6-aviso">${esc(hub.aviso || '')}</p>`;
    A.abrirPainel(hub.titulo || 'Rejogo', barra + corpo(aba));
    $('#pn-lista').querySelectorAll('[data-aba]').forEach(x => x.onclick = () => openHub(x.dataset.aba));
    ligarCorpo(aba);
  } catch (e) {}
}
function corpo(aba) {
  if (aba === 'regras') return abaRegras();
  if (aba === 'recordes') return abaRecordes();
  if (aba === 'hall') return abaHall();
  if (aba === 'finais') return abaFinais();
  if (aba === 'amigo') return abaAmigo();
  return abaModos();
}
function abaModos() {
  const P = TX(), D = P.diaria || {}, W = P.palavra || {}, SU = P.surpresa || {}, C6 = P.completude || {}, m = mem();
  const hoje = hojeChave(), best = ((m.dia || {}).datas || {})[hoje];
  const jog = Object.keys((m.dia || {}).jogados || {}).length, cp = completude(), rd = regraDoDia();
  // medidor honesto de "quanto você ainda não viu"
  let h = `<div class="l6-dia"><b style="color:#c9a75a">${cp.pct >= 100 ? esc(C6.pronto || 'Você viu tudo.') : esc(C6.titulo || 'A casa ainda esconde')}</b><br><small>${esc(C6.label || 'você já viu')} <b style="color:#c9a75a">${cp.pct}%</b> · ${esc(C6.conq || 'conquistas')} ${cp.nq}/${cp.tq} · ${esc(C6.fin || 'finais')} ${cp.nf}/${cp.tf} · ${esc(C6.lore || 'acervo')} ${cp.nl}/${cp.tl}</small></div>`;
  h += `<div class="l6-dia"><b style="color:#c9a75a">${esc(D.titulo || 'Noite do Dia')}</b><br><small>${esc(D.desc || '')}${rd && algumFinal() ? ` · ${esc(P.regraDoDia || 'regra de hoje')}: ${esc(rd.nome)}` : ''}</small><br><button class="btn" id="l6-jogar-dia">${esc(D.jogar || 'Jogar a Noite do Dia')}</button>`;
  h += `<br><small>${esc(D.melhor || 'seu melhor de hoje')}: ${best != null ? fmtC(best) : '—'} · ${jog} ${esc(D.ofensiva || 'dias seguidos')}</small></div>`;
  h += `<div class="l6-dia"><b style="color:#c9a75a">${esc(SU.titulo || 'Noite Surpresa')}</b><br><small>${esc(SU.desc || '')}</small><br><button class="btn" id="l6-surpresa">${esc(SU.jogar || 'Deixar a casa escolher')}</button></div>`;
  h += `<div class="l6-lin"><b>${esc(W.label || 'Semente por palavra')}</b></div><p class="l6-aviso">${esc(W.dica || '')}</p>`;
  h += `<div style="text-align:center"><input type="text" id="l6-palavra" maxlength="7" placeholder="palavra" spellcheck="false" autocomplete="off" style="font-family:'Special Elite',monospace;text-transform:uppercase"> <button class="btn" id="l6-jogar-palavra">${esc(W.jogar || 'Jogar essa semente')}</button></div>`;
  return h;
}
function abaRegras() {
  const P = TX(), T = P.regrasTxt || {}, sel = regrasLigadas();
  if (!algumFinal()) return `<p class="l6-aviso">${esc(T.liberar || 'As Regras da Casa abrem depois do seu primeiro final.')}</p>`;
  let h = regrasDef().map(r => `<label class="l6-regra ${sel.includes(r.id) ? '' : 'off'}"><input type="checkbox" data-regra="${r.id}" ${sel.includes(r.id) ? 'checked' : ''}> <b>${esc(r.nome)}</b><span class="m">×${(1 + r.mult).toFixed(2)}</span><small>${esc(r.desc)}</small></label>`).join('');
  h += `<div class="l6-mult">${esc(T.label || 'Multiplicador de placar')}: ${multAtivo(null)}×</div>`;
  h += `<div style="text-align:center;margin:6px 0"><button class="btn" id="l6-sortear">${esc((P.sortear || {}).label || 'Sortear regras')}</button></div>`;
  h += `<p class="l6-aviso">${esc(sel.length ? '' : (T.nenhuma || ''))}</p>`;
  return h;
}
function abaRecordes() {
  const P = TX(), T = P.recordes || {}, m = mem(), caps = window.ROTEIRO.capitulos;
  const capRec = (() => { try { return A.ls.get(C.KEYS.CAPS_KEY, {}); } catch (e) { return {}; } })();
  let h = '', soma = 0, temSoma = true;
  h += caps.map((c, i) => {
    const d = capRec[c.id] || {}, mt = (A.meta ? A.meta(c.id) : { s: 8, a: 13 });
    if (d.tempo && d.tempo < 1e9) { soma += d.tempo; const med = medalhaTempo(d.tempo / 60, mt); return `<div class="l6-lin"><b>${esc(ROM[i])}</b><span class="v">${fmt(d.tempo)} ${med ? `<span class="l6-med ${med}">${med === 'ouro' ? '◆' : med === 'prata' ? '●' : '▲'}</span>` : ''} · ${d.rank || '–'}</span></div>`; }
    temSoma = false; return `<div class="l6-lin off"><b>${esc(ROM[i])}</b><span class="v">—</span></div>`;
  }).join('');
  if (temSoma) h += `<div class="l6-lin"><b>${esc(T.somaMelhores || 'corrida teórica perfeita')}</b><span class="v">${fmt(soma)}</span></div>`;
  if (m.ruidoMin != null) h += `<div class="l6-lin"><b>${esc(T.menorRuido || 'noite mais silenciosa')}</b><span class="v">${m.ruidoMin.toFixed(1)}</span></div>`;
  if (m.mortesMin != null) h += `<div class="l6-lin"><b>${esc(T.menosMortes || 'noite com menos mortes')}</b><span class="v">${m.mortesMin}</span></div>`;
  if (m.noitePerfeita) h += `<div class="l6-lin"><b>${esc(T.noitePerfeita || 'última Noite Perfeita')}</b><span class="v">${esc(m.noitePerfeita)}</span></div>`;
  if (m.pontos) for (const k in m.pontos) h += `<div class="l6-lin"><b>melhor placar (${esc(k)})</b><span class="v">${num(m.pontos[k])}</span></div>`;
  return h || `<p class="l6-aviso">${esc(T.vazio || 'Jogue para começar a encher o quadro.')}</p>`;
}
function abaHall() {
  const P = TX(), T = P.hall || {}, m = mem(), hall = m.hall || [];
  if (!hall.length) return `<p class="l6-aviso">${esc(T.vazio || 'As cinco melhores noites aparecem aqui.')}</p>`;
  return hall.map((e, i) => `<div class="l6-lin"><b>${i + 1}. ${fmtC(e.t)}</b><span class="v">${esc(e.dif)} · ${esc((e.final || '').replace('verdadeiro', 'a verdade').replace('silencio', 'o silêncio').replace('comum', 'o portão'))} · ${num(e.pts || 0)} pts · ${esc(e.data || '')}</span></div>`).join('');
}
function abaFinais() {
  const P = TX(), T = P.finais || {}, s = stats(), vistos = s.finais || {};
  return (T.lista || []).map(f => {
    const ok = !!vistos[f.id];
    return `<div class="l6-fim ${ok ? '' : 'off'}"><span class="nm">${ok ? esc(f.nome) : '???'}</span> — ${ok ? esc(T.visto || 'visto') : esc(T.oculto || 'A Hora guarda outro fim aqui.')}${ok ? '' : `<br><small>${esc(f.dica)}</small>`}</div>`;
  }).join('');
}
function abaAmigo() {
  const P = TX(), T = P.amigo || {};
  return `<p class="l6-aviso">${esc(T.dica || '')}</p><div style="text-align:center"><input type="text" id="l6-amigo" maxlength="14" placeholder="código" spellcheck="false" autocomplete="off" style="font-family:'Special Elite',monospace;text-transform:uppercase"> <button class="btn" id="l6-amigo-ok">Montar noite</button></div><div id="l6-amigo-res" class="l6-aviso"></div>`;
}
function ligarCorpo(aba) {
  try {
    if (aba === 'rejogo' || aba == null) {
      const bd = $('#l6-jogar-dia'); if (bd) bd.onclick = () => { setDesafio(hojeSemente()); fechar(); };
      const bp = $('#l6-jogar-palavra'); if (bp) bp.onclick = () => { const s = palavraSemente(($('#l6-palavra') || {}).value); if (s) { setDesafio(s); fechar(); } };
      const bs = $('#l6-surpresa'); if (bs) bs.onclick = () => {
        // a casa escolhe: semente nova + 1 a 3 regras sorteadas (consumidas na próxima noite)
        const d = regrasDef().slice(); pendenteSurpresa = [];
        if (algumFinal()) { const n = 1 + Math.floor(Math.random() * 3); for (let i = 0; i < n && d.length; i++) pendenteSurpresa.push(d.splice(Math.floor(Math.random() * d.length), 1)[0].id); }
        setDesafio(sementeAleatoria()); fechar();
      };
    }
    if (aba === 'regras') {
      $('#pn-lista').querySelectorAll('[data-regra]').forEach(cb => cb.onchange = () => {
        C.OPT.l6regras = [...$('#pn-lista').querySelectorAll('[data-regra]:checked')].map(x => x.dataset.regra);
        try { C.salvarOpt(); } catch (e) {} openHub('regras');
      });
      const bso = $('#l6-sortear'); if (bso) bso.onclick = () => {
        const d = regrasDef().slice(), out = []; const n = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n && d.length; i++) out.push(d.splice(Math.floor(Math.random() * d.length), 1)[0].id);
        C.OPT.l6regras = out; try { C.salvarOpt(); } catch (e) {} openHub('regras');
      };
    }
    if (aba === 'amigo') { const b = $('#l6-amigo-ok'); if (b) b.onclick = () => montarAmigo(); }
  } catch (e) {}
}
function setDesafio(sem) { try { const inp = $('#o-desafio'); if (inp) { inp.value = sem; try { C.toast && C.toast('Semente pronta: toque em Novo jogo.'); } catch (e) {} } } catch (e) {} }
function fechar() { try { $('#pn-voltar') && $('#pn-voltar').click(); } catch (e) {} }
function montarAmigo() {
  try {
    const T = TX().amigo || {}, inp = $('#l6-amigo'), res = $('#l6-amigo-res');
    const cod = A.lerCodigo ? A.lerCodigo(inp && inp.value) : null;
    if (!cod) { if (res) res.textContent = T.invalido || 'Esse código não faz sentido.'; return; }
    const dinp = $('#o-desafio'); if (dinp) dinp.value = (inp.value || '').trim().toUpperCase();
    if (res) res.innerHTML = `${esc(T.montou || 'Noite montada.')}<br><small>dificuldade ${esc(cod.dif)}${cod.mods && cod.mods.length ? ' · amuletos ' + cod.mods.length : ''}</small>`;
  } catch (e) {}
}

// ---------------------------------------------------------------- API
export const L6 = {
  ligar(ctx, api) { C = ctx; A = api; try { css(); } catch (e) {} },
  titulo, tecla, novoJogo, tick, difMod, fimCap, morte, final, telaFinal, pausa, statsLinhas
};
