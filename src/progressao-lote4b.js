// PROGRESSÃO — LOTE 4 (segunda rodada de segredos e easter eggs)
// Novos códigos do título (VELA, MARCO, FESTA, CORVO, ONIBUS, DEZ), modos de luz, lanternas extras, abas novas
// do painel Segredos (Telefones, Álbum, Caça ao tesouro, Mapa de giz, Livro de visitas), carteirinha do Clube,
// mapa de giz no capô, selo de explorador, placa de bronze, ocorrências por data e conquistas novas.
// Tudo passivo e à prova de erro. Ligado por src/progressao-lote4.js, que repassa C/A e seus ajudantes.
import './progressao-lote4b-roteiro.js';

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const $ = s => document.querySelector(s);
const TX = () => (window.ROTEIRO.progressao || {}).lote4b || {};
const LORE = { estrada: ['f5', 'n1'], terreo: ['f1', 'p1', 'n2', 'n3', 'n4', 'n5'], superior: ['f2', 'p2', 'p3', 'n6', 'n7', 'n8'], tuneis: ['f3', 'f4', 'p4', 'n9', 'n10'], cemiterio: ['n11', 'n12'] };
const ROM = ['Prólogo', 'Capítulo I', 'Capítulo II', 'Capítulo III', 'Capítulo IV', 'Capítulo V'];
const CAP_MAPA = ['estrada', 'terreo', 'terreo', 'superior', 'tuneis', 'cemiterio'];

let C = null, A = null, G = null;
const K = 'hora-silencio-l4b';
const mem = () => { try { return A.ls.get(K, {}) || {}; } catch (e) { return {}; } };
const mudar = fn => { const m = mem(); fn(m); try { A.ls.set(K, m); } catch (e) {} return m; };
const codes = () => mem().codes || {};
const temCode = id => !!codes()[id];
const ac = () => { try { return A.acervo() || {}; } catch (e) { return {}; } };
const st = () => { try { return A.stats() || {}; } catch (e) { return {}; } };
const conq = id => { try { A.conquista(id); } catch (e) {} };
const emJogo = () => C && C.mode === 'jogo' && !C.ui && C.S && !C.S.dead && !C.S.fim;

// ------------------------------------------------------------------ CSS (overlays novos + painel)
function css() {
  if ($('#l4b-css')) return;
  const s = document.createElement('style'); s.id = 'l4b-css';
  s.textContent = `[hidden]{display:none!important}
#l4b-veu{position:fixed;inset:0;pointer-events:none;z-index:9}
#l4b-veu.vela{background:radial-gradient(circle at 50% 54%,transparent 10%,rgba(30,16,6,.5) 48%,rgba(10,6,3,.86) 100%);animation:l4bvela 2.6s ease-in-out infinite alternate}
#l4b-veu.lembranca{background:linear-gradient(rgba(120,92,50,.22),rgba(90,60,28,.22));mix-blend-mode:multiply;box-shadow:inset 0 0 30vh 6vh rgba(60,40,18,.4)}
#l4b-veu.festa{background:radial-gradient(circle at 50% 120%,rgba(150,70,30,.34),rgba(40,20,10,.1) 62%,transparent);animation:l4bfesta 3.2s ease-in-out infinite alternate}
@keyframes l4bvela{from{opacity:.86;transform:scale(1.004)}to{opacity:1;transform:scale(1.0)}}
@keyframes l4bfesta{from{opacity:.72}to{opacity:1}}
@media (prefers-reduced-motion:reduce){#l4b-veu.vela,#l4b-veu.festa{animation:none}}
.l4b-tel{padding:8px 0;border-top:1px solid #1f1b16;color:#cfc3a6}.l4b-tel.off{color:#6d6452}
.l4b-tel .num{font-family:"Special Elite",monospace;color:#c9a75a}.l4b-tel .disc{float:right;font-size:12px;color:#857a63;background:#14110d;border:1px solid #3a3228;padding:2px 8px;cursor:pointer}
.l4b-tel .disc[disabled]{opacity:.4;cursor:default}.l4b-tel .fala{display:block;margin-top:5px;font-style:italic;color:#a89a7c}
.l4b-fig{display:inline-block;width:120px;vertical-align:top;margin:6px;padding:10px 6px;text-align:center;border:1px dashed #3a3228;background:#14110d}
.l4b-fig.off{opacity:.42}.l4b-fig.ouro{border-color:#c9a75a;border-style:solid;background:#1a140c}
.l4b-fig .ic{font-size:26px}.l4b-fig .nm{font-family:"Special Elite",monospace;font-size:12px;color:#cfc3a6;margin-top:6px}
.l4b-verso{padding:8px 0;border-top:1px solid #1f1b16;color:#cfc3a6;font-style:italic}.l4b-verso.ok{color:#6d6452;text-decoration:line-through}
.l4b-ala{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-top:1px solid #1f1b16}
.l4b-ala .jan{letter-spacing:.14em}.l4b-ala .jan .on{color:#c9a75a}.l4b-ala .jan .no{color:#4a4336}
.l4b-ala .char{flex:0 0 auto;margin-left:10px;font-size:12px;color:#857a63;background:#14110d;border:1px solid #3a3228;padding:2px 8px;cursor:pointer}
.l4b-vis{padding:5px 0;border-top:1px solid #1f1b16;color:#cfc3a6;font-family:"Special Elite",monospace;font-size:13px}.l4b-vis.davi{color:#c9a75a}
.l4b-selo{font-family:"Special Elite",monospace;letter-spacing:.12em}`;
  document.head.appendChild(s);
}

// ------------------------------------------------------------------ overlays em jogo (vela/lembrança/festa)
let veu = null;
function overlays() {
  if (!veu) { veu = document.createElement('div'); veu.id = 'l4b-veu'; veu.hidden = true; document.body.appendChild(veu); }
  const jogo = emJogo(), c = codes();
  const vela = jogo && C.OPT.l4bvela && c.vela, lem = jogo && C.OPT.l4blembranca && c.marco, fe = jogo && C.OPT.l4bfesta && c.festa;
  const cls = (vela ? 'vela' : lem ? 'lembranca' : fe ? 'festa' : '');
  if (cls) { if (veu.className !== cls) veu.className = cls; veu.hidden = false; } else if (!veu.hidden) veu.hidden = true;
}

// ------------------------------------------------------------------ conquistas por estatística / acervo
let bestAnt = null;
function checarStats() {
  const s = st();
  if ((s.concluidas || 0) >= 1) conq('l4b_primeira');
  if ((s.partidas || 0) >= 10) conq('l4b_veterana');
  if ((s.tempo || 0) >= 5 * 3600) conq('l4b_maratona');
  const f = s.finais || {}; if (f.comum && f.silencio && f.verdadeiro) conq('l4b_tres_caminhos');
  // calendário: três datas marcadas diferentes
  if (Object.keys(mem().datas || {}).length >= 3) conq('l4b_calendario');
  // álbum / caça / mapa
  const a = ac(), T = TX();
  if ((T.album.figuras || []).every(f2 => a[f2.pista])) conq('l4b_album');
  if ((T.tesouro.versos || []).every(v => a[v.pista])) conq('l4b_tesouro');
  if (Object.values(LORE).every(ids => ids.every(id => a[id]))) conq('l4b_mapa');
}

// ------------------------------------------------------------------ tick
let acc = 0;
function tick(dt) {
  try {
    css(); overlays();
    acc += dt; if (acc < 1.1) return; acc = 0;
    checarStats();
  } catch (e) {}
}

// ------------------------------------------------------------------ título
let fezTitulo = false;
function titulo() {
  try {
    css();
    const T = TX();
    // ocorrências por data (marcadas no livro do lote 4)
    const d = new Date(), mes = d.getMonth() + 1, dia = d.getDate();
    const datas = [];
    if (mes === 10 && dia === 12) datas.push('criancas');
    if (mes === 6 && dia === 24) datas.push('junina');
    if (mes === 12 && (dia === 24 || dia === 25)) datas.push('natal');
    if ((mes === 12 && dia === 31) || (mes === 1 && dia === 1)) datas.push('reveillon');
    if (mes === 11 && dia === 2) datas.push('finados');
    for (const id of datas) { G.marcar('occ', id); mudar(m => { m.datas = m.datas || {}; m.datas[id] = Date.now(); }); }
    // boatos novos ligados aos códigos já descobertos
    const c = codes();
    if (c.vela) G.marcar('boatos', 'vela');
    if (c.festa) G.marcar('boatos', 'festa');
    if (c.onibus) G.marcar('boatos', 'onibus');
    if (c.corvo) G.marcar('boatos', 'corvo');
    // placa de bronze depois do final verdadeiro + contador de lugares, na memória do título (uma vez)
    if (!fezTitulo) {
      fezTitulo = true;
      const s = st(), el = $('#t-memoria');
      const extras = [];
      if ((s.finais || {}).verdadeiro) { let nome = nomeJogador(); extras.push(T.placa.replace('{nome}', nome)); }
      const nLug = Object.values(LORE).reduce((t, ids) => t + ids.filter(id => ac()[id]).length, 0);
      if (nLug > 0) extras.push(T.fosforos.replace('{n}', nLug));
      if (extras.length && el) el.textContent = (el.textContent ? el.textContent + ' · ' : '') + extras.join(' · ');
    }
    checarStats();
  } catch (e) {}
}
function nomeJogador() { try { return (JSON.parse(localStorage.getItem('hora-silencio-nome') || '""') || '').trim().toUpperCase() || 'LIA'; } catch (e) { return 'LIA'; } }

// ------------------------------------------------------------------ códigos digitados no título
function lembrar(txt) { const el = $('#t-memoria'); if (el) el.textContent = txt || ''; }
function liga(id, memTxt) { let novo = false; mudar(m => { m.codes = m.codes || {}; if (!m.codes[id]) { m.codes[id] = Date.now(); novo = true; } }); lembrar(memTxt); return novo; }
function salvar() { try { C.salvarOpt(); } catch (e) {} }
function tecla(buf) {
  try {
    const CO = TX().codigos || {};
    if (buf.endsWith('vela')) { liga('vela', CO.vela); C.OPT.l4bvela = true; salvar(); conq('l4b_vela'); G.som(s => s.sussurros && s.sussurros(1)); return true; }
    if (buf.endsWith('marco') || buf.endsWith('março')) { liga('marco', CO.marco); C.OPT.l4blembranca = true; salvar(); conq('l4b_marco'); G.som(s => s.papel && s.papel()); return true; }
    if (buf.endsWith('festa')) { liga('festa', CO.festa); C.OPT.l4bfesta = true; salvar(); conq('l4b_festa'); G.som(s => s.sinoLonge && s.sinoLonge()); return true; }
    if (buf.endsWith('corvo')) { liga('corvo', CO.corvo); C.OPT.l4lanterna = 'corvo'; salvar(); conq('l4b_corvo'); G.som(s => s.estatica && s.estatica(.6)); return true; }
    if (buf.endsWith('onibus') || buf.endsWith('ônibus')) { liga('onibus', CO.onibus); C.OPT.l4lanterna = 'farol'; salvar(); conq('l4b_onibus'); G.som(s => s.sinoLonge && s.sinoLonge()); return true; }
    if (buf.endsWith('dez')) { liga('dez', CO.dez); conq('l4b_dez'); G.marcar('occ', 'hora'); G.marcar('boatos', 'dez'); G.som(s => s.badaladas && s.badaladas(10)); return true; }
  } catch (e) {}
  return false;
}
// a lanterna do Corvo / Farol fica liberada pelo código (chamado por L4.lanternaLiberada)
function lanternaLiberada(id) { if (id === 'corvo') return temCode('corvo'); if (id === 'farol') return temCode('onibus'); return false; }

// ------------------------------------------------------------------ Modos: linhas extras (vela/lembrança/festa)
function modosExtra() {
  const T = TX(), M = T.modos, c = codes();
  const linha = (id, on, chave, nome, desc) => `<label class="${chave ? '' : 'off'}"><input type="checkbox" data-l4bmodo="${id}" ${on ? 'checked' : ''} ${chave ? '' : 'disabled'}> ${esc(nome)} — <small>${chave ? esc(desc) : 'procure o código'}</small></label>`;
  return linha('vela', !!C.OPT.l4bvela, !!c.vela, M.vela, M.velaDesc)
    + linha('lembranca', !!C.OPT.l4blembranca, !!c.marco, M.lembranca, M.lembrancaDesc)
    + linha('festa', !!C.OPT.l4bfesta, !!c.festa, M.festa, M.festaDesc);
}
function modosControles(lista) {
  if (!lista) return;
  lista.querySelectorAll('[data-l4bmodo]').forEach(cb => cb.onchange = () => {
    const id = cb.dataset.l4bmodo; const k = id === 'lembranca' ? 'l4blembranca' : 'l4b' + id;
    C.OPT[k] = cb.checked;
    if (cb.checked) { if (id === 'vela') { C.OPT.l4blembranca = C.OPT.l4bfesta = false; } if (id === 'lembranca') { C.OPT.l4bvela = C.OPT.l4bfesta = false; } if (id === 'festa') { C.OPT.l4bvela = C.OPT.l4blembranca = false; } }
    salvar();
  });
}

// ------------------------------------------------------------------ abas novas do painel Segredos
const TABS = [['telefones', 'Telefones'], ['album', 'Álbum'], ['tesouro', 'Caça'], ['mapa', 'Mapa'], ['visitas', 'Visitas']];
function tabs() { return TABS; }
function render(aba) {
  try {
    if (aba === 'telefones') return tabTelefones();
    if (aba === 'album') return tabAlbum();
    if (aba === 'tesouro') return tabTesouro();
    if (aba === 'mapa') return tabMapa();
    if (aba === 'visitas') return tabVisitas();
  } catch (e) {}
  return null;
}
function tabTelefones() {
  const T = TX().telefones, a = ac(), disc = mem().tel || {};
  const linha = f => {
    const achou = !!a[f.pista], feito = !!disc[f.id];
    return `<div class="l4b-tel${achou ? '' : ' off'}"><span class="num">${esc(achou ? f.num : '(----) -----')}</span> ${esc(achou ? f.quem : '???')}<button class="disc" data-tel="${f.id}" ${achou ? '' : 'disabled'}>discar</button>${feito ? `<span class="fala">${esc(f.fala)}</span>` : ''}</div>`;
  };
  return `<p class="l4-aviso">${esc(T.aviso)}</p>${(T.lista || []).map(linha).join('')}`;
}
function tabAlbum() {
  const T = TX().album, a = ac();
  const cheio = (T.figuras || []).every(f => a[f.pista]);
  const fig = f => { const t = !!a[f.pista]; return `<div class="l4b-fig${t ? '' : ' off'}"><div class="ic">${t ? '✦' : '·'}</div><div class="nm">${t ? esc(f.nome) : esc(T.vazio)}</div></div>`; };
  const ouro = `<div class="l4b-fig${cheio ? ' ouro' : ' off'}"><div class="ic">${cheio ? '★' : '·'}</div><div class="nm">${cheio ? esc(T.dourada) : esc(T.vazio)}</div></div>`;
  return `<p class="l4-aviso">${esc(T.aviso)}</p><div style="text-align:center">${(T.figuras || []).map(fig).join('')}${ouro}</div>${cheio ? `<p class="l4-aviso" style="color:#c9a75a">${esc(T.completo)}</p>` : ''}`;
}
function tabTesouro() {
  const T = TX().tesouro, a = ac();
  return `<p class="l4-aviso">${esc(T.aviso)}</p>${(T.versos || []).map(v => { const ok = !!a[v.pista]; return `<div class="l4b-verso${ok ? ' ok' : ''}">${esc(v.txt)}</div>`; }).join('')}`;
}
function tabMapa() {
  const T = TX().mapa, a = ac(), fos = fosforos();
  const linha = (mapa, ids) => {
    const achou = ids.filter(id => a[id]).length;
    let jan = ''; for (let i = 0; i < ids.length; i++) jan += `<span class="${i < achou ? 'on' : 'no'}">▮</span>`;
    const falta = achou < ids.length;
    return `<div class="l4b-ala"><span>${esc(nomeMapa(mapa))} <span class="jan">${jan}</span></span>${falta ? `<button class="char" data-char="${mapa}" ${fos > 0 ? '' : 'disabled'}>charada</button>` : '<span style="color:#6d6452">✦</span>'}</div>`;
  };
  const dica = mem().charadaAberta;
  return `<p class="l4-aviso">${esc(T.aviso)}</p>${Object.entries(LORE).map(([m, ids]) => linha(m, ids)).join('')}<p class="l4-aviso">${fos > 0 ? esc(T.fosforo) + ` (${fos})` : esc(T.semFosforo)}</p>${dica ? `<p class="l4-aviso" style="color:#c9a75a">${esc((T.charadas || {})[dica] || '')}</p>` : ''}`;
}
function nomeMapa(m) { return { estrada: 'A Estrada', terreo: 'O Térreo', superior: 'O Andar de Cima', tuneis: 'Os Túneis', cemiterio: 'O Cemitério' }[m] || m; }
function fosforos() { try { const S = C.S; return (S && typeof S.fosforos === 'number') ? S.fosforos : (st().fosforos || 2); } catch (e) { return 2; } }
function tabVisitas() {
  const T = TX().visitas, s = st(), n = s.partidas || 0, nome = nomeJogador();
  if (!n) return `<p class="l4-aviso">${esc(T.aviso)}</p><p class="l4-aviso">—</p>`;
  let html = '';
  for (let i = 1; i <= Math.min(n, 13); i++) html += `<div class="l4b-vis">${esc(T.linha.replace('{n}', i).replace('{nome}', nome))}</div>`;
  if (n >= 9) { html += `<div class="l4b-vis davi">${esc(T.davi)}</div>`; conq('l4b_visitas'); }
  return `<p class="l4-aviso">${esc(T.aviso)}</p>${html}`;
}
function ligarControles(aba, lista) {
  if (!lista) return;
  if (aba === 'telefones') lista.querySelectorAll('[data-tel]').forEach(b => b.onclick = () => discar(b.dataset.tel, aba));
  if (aba === 'mapa') lista.querySelectorAll('[data-char]').forEach(b => b.onclick = () => pedirCharada(b.dataset.char, aba));
}
function discar(id, aba) {
  const T = TX().telefones, f = (T.lista || []).find(x => x.id === id); if (!f) return;
  const tarde = !f.tarde || (new Date().getHours() === 21);
  G.som(s => { s.estatica && s.estatica(.5); if (f.id === 'respira') s.sussurros && s.sussurros(1.2); });
  if (!tarde) { try { C.toast ? C.toast(T.tarde) : 0; } catch (e) {} A.abrirSeg && A.abrirSeg(aba); return; }
  let n = 0; mudar(m => { m.tel = m.tel || {}; m.tel[id] = Date.now(); n = Object.keys(m.tel).length; });
  if (n >= (T.lista || []).length) conq('l4b_telefones');
  A.abrirSeg && A.abrirSeg(aba);
}
function pedirCharada(mapa, aba) {
  const S = C.S;
  let ok = false;
  if (S && typeof S.fosforos === 'number' && S.fosforos > 0) { S.fosforos--; ok = true; }
  else { const s = A.stats(); if ((s.fosforos || 0) > 0) { A.somaStat && A.somaStat(x => { x.fosforos = (x.fosforos || 1) - 1; }); ok = true; } else ok = true; } // fora do jogo, a charada é de graça
  if (ok) { mudar(m => { m.charadaAberta = mapa; }); G.som(s => s.papel && s.papel()); A.abrirSeg && A.abrirSeg(aba); }
}

// ------------------------------------------------------------------ fim de capítulo: selo de explorador
function fimCap(c, r) {
  try {
    const T = TX().selo, mapa = (c && c.mapa) || CAP_MAPA[C.S.chapter] || 'terreo', ids = LORE[mapa] || [], a = ac(), S = C.S;
    const achou = ids.filter(id => (S.notes && S.notes[id]) || (S.fitas && S.fitas[id]) || a[id]).length;
    let cas = ''; for (let i = 0; i < ids.length; i++) cas += i < achou ? '▣' : '▢';
    const linhas = [`<span class="l4b-selo">${esc(T.casinhas)} ${cas} (${achou}/${ids.length})</span>`];
    if (achou >= ids.length && ids.length) { conq('l4b_explorador'); linhas.push(`<i class="ouro">${esc(T.tudo)}</i>`); }
    else { const falta = ids.find(id => !((S.notes && S.notes[id]) || (S.fitas && S.fitas[id]) || a[id])); if (falta) linhas.push(`${esc(T.dica)} ${esc(dicaLore(falta))}`); }
    // Antes da Hora: tocar o sino do Cap. V bem rápido
    if (mapa === 'cemiterio' && S.flags && S.flags.sino && (S.capT || 0) < 180) conq('l4b_antes');
    return linhas;
  } catch (e) { return []; }
}
function dicaLore(id) {
  const t = { f5: 'a estrada', f1: 'o térreo', p1: 'a diretoria', f2: 'onde ela conta', p2: 'o quarto da Irmã', p3: 'a sala de brinquedos', f3: 'os túneis', f4: 'a sala secreta', p4: 'o túnel norte', n11: 'a cova', n12: 'a capela' };
  return t[id] || 'perto do caminho';
}

// ------------------------------------------------------------------ morte: linha extra
function telaMorte() {
  try {
    const T = TX().morte, s = st(), el = $('#dt-diag');
    if (!el) return;
    const total = s.mortes || 0;
    const extra = total <= 1 ? T.primeira : T.recorde;
    el.innerHTML = (el.innerHTML ? el.innerHTML + '<br>' : '') + '<small style="color:#6d6452">' + esc(extra) + '</small>';
  } catch (e) {}
}

// ------------------------------------------------------------------ final: carteirinha, capô, recorde
function final(tipo) {
  try {
    const T = TX(), S = C.S, el = $('#e-stats');
    const linhas = [];
    // carteirinha do Clube do Silêncio (número de sócio = lore achada nesta noite + 1)
    const nSeg = Object.values(LORE).reduce((t, ids) => t + ids.filter(id => (S.notes && S.notes[id]) || (S.fitas && S.fitas[id])).length, 0);
    if (nSeg >= 1) { linhas.push(T.carteirinha.replace('{n}', nSeg)); conq('l4b_carteirinha'); }
    // mapa de giz no capô
    const total = Object.values(LORE).reduce((t, ids) => t + ids.filter(id => ac()[id]).length, 0);
    if (total >= 1) linhas.push(T.capo);
    if (el && linhas.length) el.innerHTML += '<br>' + linhas.map(esc).join('<br>');
    // recorde pessoal de tempo total
    if (S.completo) {
      const t = S.tempo || 0;
      if (bestAnt != null && t < bestAnt) conq('l4b_recorde');
      bestAnt = bestAnt == null ? t : Math.min(bestAnt, t);
      mudar(m => { m.melhorAnt = bestAnt; });
    }
    checarStats();
  } catch (e) {}
}

// ------------------------------------------------------------------ pausa: linha extra (alterna com a do lote 4)
function pausa() {
  try { const L = TX().pausa || []; if (!L.length || !C.S) return ''; const i = Math.abs((C.S.capMortes || 0) + (C.S.chapter || 0) + 1) % L.length; return '<br>' + esc(L[i]); } catch (e) { return ''; }
}

// ------------------------------------------------------------------ API
export const L4B = {
  ligar(ctx, api, helpers) {
    C = ctx; A = api; G = helpers || {};
    // ajudantes com reserva, caso o L4 não repasse algum
    G.marcar = G.marcar || (() => {});
    G.som = G.som || (fn => { try { C.iniciarAudio(); fn(C.SFX); } catch (e) {} });
    try { bestAnt = (mem().melhorAnt != null) ? mem().melhorAnt : null; } catch (e) { bestAnt = null; }
    try { css(); } catch (e) {}
  },
  tick, titulo, tecla, lanternaLiberada, modosExtra, modosControles, tabs, render, ligarControles, fimCap, telaMorte, final, pausa
};
