// PROGRESSÃO — LOTE 4 (terceira rodada de segredos e easter eggs)
// Novos códigos do título (NÉVOA, FRIO, BRASA, TROCADA, MANHÃ, SETE, FAÍSCA, GIRASSOL), três modos de luz
// extras, quatro lanternas cosméticas novas, abas novas do painel Segredos (Pertences, Placar, Recordes,
// Raras, Lendas), carta do gato Faísca e do diretor Albano, linha do retrato da turma no título, ocorrências
// e lendas com gatilho, selos de fim de capítulo/morte/final e conquistas novas. Tudo passivo e à prova de
// erro (não trava o jogo nem o QA). Ligado por src/progressao-lote4.js, que repassa C/A e seus ajudantes.
import './progressao-lote4c-roteiro.js';

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const $ = s => document.querySelector(s);
const TX = () => (window.ROTEIRO.progressao || {}).lote4c || {};
const LORE = { estrada: ['f5', 'n1'], terreo: ['f1', 'p1', 'n2', 'n3', 'n4', 'n5'], superior: ['f2', 'p2', 'p3', 'n6', 'n7', 'n8'], tuneis: ['f3', 'f4', 'p4', 'n9', 'n10'], cemiterio: ['n11', 'n12'] };
const CAPS = ['estrada', 'terreo', 'terreo', 'superior', 'tuneis', 'cemiterio'];

let C = null, A = null, G = null;
const K = 'hora-silencio-l4c';
const mem = () => { try { return A.ls.get(K, {}) || {}; } catch (e) { return {}; } };
const mudar = fn => { const m = mem(); fn(m); try { A.ls.set(K, m); } catch (e) {} return m; };
const codes = () => mem().codes || {};
const temCode = id => !!codes()[id];
const ac = () => { try { return A.acervo() || {}; } catch (e) { return {}; } };
const st = () => { try { return A.stats() || {}; } catch (e) { return {}; } };
const conq = id => { try { A.conquista(id); } catch (e) {} };
const emJogo = () => C && C.mode === 'jogo' && !C.ui && C.S && !C.S.dead && !C.S.fim;
const salvar = () => { try { C.salvarOpt(); } catch (e) {} };
function nomeJogador() { try { return (JSON.parse(localStorage.getItem('hora-silencio-nome') || '""') || '').trim().toUpperCase() || 'LIA'; } catch (e) { return 'LIA'; } }

// ------------------------------------------------------------------ CSS (overlays novos + painel)
function css() {
  if ($('#l4c-css')) return;
  const s = document.createElement('style'); s.id = 'l4c-css';
  s.textContent = `[hidden]{display:none!important}
#l4c-veu{position:fixed;inset:0;pointer-events:none;z-index:9}
#l4c-veu.nevoa{background:radial-gradient(circle at 50% 40%,transparent 18%,rgba(150,160,168,.26) 70%,rgba(120,130,138,.4) 100%);animation:l4cnev 11s ease-in-out infinite alternate}
#l4c-veu.frio{background:linear-gradient(rgba(70,100,140,.16),rgba(40,70,120,.22));mix-blend-mode:screen;box-shadow:inset 0 0 26vh 7vh rgba(30,60,110,.3)}
#l4c-veu.brasa{background:radial-gradient(circle at 50% 118%,rgba(180,70,24,.4),rgba(60,24,10,.12) 58%,transparent);animation:l4cbra 2.4s ease-in-out infinite alternate}
@keyframes l4cnev{from{opacity:.78;transform:translateY(0)}to{opacity:1;transform:translateY(-1.4%)}}
@keyframes l4cbra{from{opacity:.72}to{opacity:1}}
@media (prefers-reduced-motion:reduce){#l4c-veu.nevoa,#l4c-veu.brasa{animation:none}}
.l4c-lata{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.l4c-slot{width:110px;text-align:center;padding:12px 6px;border:1px solid #3a3228;background:#14110d}.l4c-slot.off{opacity:.4}
.l4c-slot .ic{font-size:28px;line-height:1;color:#c9a75a}.l4c-slot .nm{font-family:"Special Elite",monospace;font-size:12px;color:#cfc3a6;margin-top:6px}
.l4c-fli{font-family:"Special Elite",monospace;color:#cfc3a6;line-height:2;max-width:320px;margin:0 auto}
.l4c-fli .ln{display:flex;justify-content:space-between;border-bottom:1px solid #1f1b16;padding:2px 0}
.l4c-fli .ln.voce{color:#c9a75a}.l4c-fli .ln.ganhou{color:#d8b24a}
.l4c-rec{display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-top:1px solid #1f1b16;color:#cfc3a6}
.l4c-rec .rk{font-family:"IM Fell English SC",Georgia,serif;font-size:20px;color:#c9a75a;margin-left:10px}.l4c-rec .rk.s{color:#d8b24a}.l4c-rec .rk.off{color:#4a4336}
.l4c-rec .tp{font-size:12px;color:#857a63}
.l4c-occ{padding:6px 0;border-top:1px solid #1f1b16;color:#cfc3a6}.l4c-occ.off{color:#6d6452}.l4c-occ .m{float:right;color:#c9a75a}
.l4c-lenda{padding:7px 0;border-top:1px solid #1f1b16;color:#cfc3a6}.l4c-lenda .v{float:right;color:#b0362a;font-size:12px;letter-spacing:.1em}.l4c-lenda.off{color:#6d6452}`;
  document.head.appendChild(s);
}

// ------------------------------------------------------------------ overlays em jogo (névoa / frio / brasa)
let veu = null;
function overlays() {
  if (!veu) { veu = document.createElement('div'); veu.id = 'l4c-veu'; veu.hidden = true; document.body.appendChild(veu); }
  const jogo = emJogo(), c = codes();
  const nev = jogo && C.OPT.l4cnevoa && c.nevoa, fri = jogo && C.OPT.l4cfrio && c.frio, bra = jogo && C.OPT.l4cbrasa && c.brasa;
  const cls = nev ? 'nevoa' : fri ? 'frio' : bra ? 'brasa' : '';
  if (cls) { if (veu.className !== cls) veu.className = cls; veu.hidden = false; } else if (!veu.hidden) veu.hidden = true;
}

// a lanterna de giz/brasa/sino/rato fica liberada por estatística / código (chamado por L4.lanternaLiberada)
function lanternaLiberada(id) {
  try {
    if (id === 'brasa') return temCode('brasa');
    if (id === 'sino') return temCode('sino') || !!(st().finais || {}).verdadeiro;
    if (id === 'rato') return Object.keys(ac()).length >= 15;
    if (id === 'giz') { const cq = A.ls.get(C.KEYS.CONQ_KEY, {}) || {}; return !!(cq.l4b_explorador || cq.l4c_recordes); }
  } catch (e) {}
  return false;
}

// ------------------------------------------------------------------ gatilhos (ocorrências raras e lendas)
function temRara(id) { return !!((mem().raras || {})[id]); }
function marcarRara(id) { let novo = false; mudar(m => { m.raras = m.raras || {}; if (!m.raras[id]) { m.raras[id] = Date.now(); novo = true; } }); if (novo && contaRaras() >= (TX().raras.lista || []).length) conq('l4c_raras'); return novo; }
function contaRaras() { return Object.keys(mem().raras || {}).length; }
function temLenda(id) { return !!((mem().lendas || {})[id]); }
function marcarLenda(id) { let novo = false; mudar(m => { m.lendas = m.lendas || {}; if (!m.lendas[id]) { m.lendas[id] = Date.now(); novo = true; } }); if (Object.keys(mem().lendas || {}).length >= (TX().lendas.lista || []).length) conq('l4c_lendas'); return novo; }

function checarLendas() {
  try {
    const c = codes(), q = A.ls.get(C.KEYS.CONQ_KEY, {}) || {};
    if (c.faisca) marcarLenda('gato');
    if (c.girassol) marcarLenda('girassol');
    if (c.brasa) marcarLenda('brasa');
    if (c.sete || temRara('sete_relampagos')) marcarLenda('sete');
    if (q.l4c_manha || (st().capsSAll)) marcarLenda('manha');
    // retrato: quanto mais lore no acervo, mais rostos se lembram
    if (Object.keys(ac()).length >= 6) marcarLenda('retrato');
  } catch (e) {}
}

// ------------------------------------------------------------------ medos estendidos (colecionadora)
const MEDOS7 = ['inspetor', 'ana', 'procissao', 'fuga', 'breu', 'queda', 'dez'];
function marcarMedo(id) { if (!MEDOS7.includes(id)) return; let novo = false; mudar(m => { m.medos7 = m.medos7 || {}; if (!m.medos7[id]) { m.medos7[id] = Date.now(); novo = true; } }); if (Object.keys(mem().medos7 || {}).length >= 7) conq('l4c_colecionadora'); return novo; }
function contaMedos() { return Object.keys(mem().medos7 || {}).length; }

// ------------------------------------------------------------------ tick
let acc = 0, relampagos = 0, relampagoSemente = null;
function tick(dt) {
  try {
    css(); overlays();
    // conta relâmpagos da noite (sete relâmpagos = ocorrência rara)
    try {
      const S = C.S;
      if (S) {
        if (relampagoSemente !== S.semente) { relampagoSemente = S.semente; relampagos = 0; }
        const fl = (C.VM && C.VM.flashAtivo) || (C.S && C.S._relampago);
        if (fl && !tick._fl) { relampagos++; if (relampagos >= 7) { if (marcarRara('sete_relampagos')) {} } }
        tick._fl = !!fl;
      }
    } catch (e) {}
    acc += dt; if (acc < 1.1) return; acc = 0;
    checarRecordes(); checarLendas(); checarChamada();
  } catch (e) {}
}

// ------------------------------------------------------------------ recordes / rank S em tudo
function capsRanks() { try { return A.ls.get(C.KEYS.CAPS_KEY, {}) || {}; } catch (e) { return {}; } }
function checarRecordes() {
  try {
    const caps = capsRanks(), ids = window.ROTEIRO.capitulos.map(c => c.id);
    const todosS = ids.length && ids.every(id => (caps[id] || {}).rank === 'S');
    if (todosS) { conq('l4c_recordes'); mudar(m => { m.capsSAll = true; }); }
  } catch (e) {}
}

// ------------------------------------------------------------------ título
let fezTitulo = false;
function titulo() {
  try {
    css();
    const d = new Date(), h = d.getHours(), mi = d.getMinutes();
    if (h === 3) marcarRara('madrugada');
    if (h === 0 && mi === 0) marcarRara('meia_noite');
    checarLendas(); checarRecordes();
    if (!fezTitulo) {
      fezTitulo = true;
      const nLore = Object.keys(ac()).length, el = $('#t-memoria');
      if (nLore > 0 && el) { const txt = TX().retrato.replace('{n}', Math.min(nLore, 37)); el.textContent = (el.textContent ? el.textContent + ' · ' : '') + txt; }
    }
  } catch (e) {}
}

// ------------------------------------------------------------------ códigos digitados no título
function lembrar(txt) { const el = $('#t-memoria'); if (el) el.textContent = txt || ''; }
function liga(id, memTxt) { let novo = false; mudar(m => { m.codes = m.codes || {}; if (!m.codes[id]) { m.codes[id] = Date.now(); novo = true; } }); lembrar(memTxt); return novo; }
function tecla(buf) {
  try {
    const CO = TX().codigos || {};
    if (buf.endsWith('nevoa') || buf.endsWith('névoa')) { liga('nevoa', CO.nevoa); C.OPT.l4cnevoa = true; C.OPT.l4cfrio = C.OPT.l4cbrasa = false; salvar(); conq('l4c_nevoa'); G.som(s => s.vento ? s.vento() : (s.sussurros && s.sussurros(1.4))); return true; }
    if (buf.endsWith('frio')) { liga('frio', CO.frio); C.OPT.l4cfrio = true; C.OPT.l4cnevoa = C.OPT.l4cbrasa = false; salvar(); conq('l4c_frio'); G.som(s => s.sussurros && s.sussurros(1.2)); return true; }
    if (buf.endsWith('brasa')) { liga('brasa', CO.brasa); C.OPT.l4cbrasa = true; C.OPT.l4cnevoa = C.OPT.l4cfrio = false; C.OPT.l4lanterna = 'brasa'; salvar(); conq('l4c_brasa'); G.som(s => s.estatica && s.estatica(.7)); marcarLenda('brasa'); return true; }
    if (buf.endsWith('trocada')) { liga('trocada', CO.trocada); conq('l4c_trocada'); G.som(s => s.sinoLonge && s.sinoLonge()); return true; }
    if (buf.endsWith('manha') || buf.endsWith('manhã')) { liga('manha', CO.manha); conq('l4c_manha'); marcarLenda('manha'); G.som(s => s.papel && s.papel()); return true; }
    if (buf.endsWith('sete')) { liga('sete', CO.sete); conq('l4c_sete'); marcarLenda('sete'); G.som(s => s.badaladas ? s.badaladas(7) : (s.sinoLonge && s.sinoLonge())); return true; }
    if (buf.endsWith('faisca') || buf.endsWith('faísca')) { liga('faisca', CO.faisca); conq('l4c_faisca'); G.marcar('cartas', 'faisca'); marcarLenda('gato'); G.som(s => s.sussurros && s.sussurros(.8)); return true; }
    if (buf.endsWith('girassol')) { liga('girassol', CO.girassol); conq('l4c_girassol'); marcarLenda('girassol'); G.som(s => s.papel && s.papel()); return true; }
    if (buf.endsWith('sino')) { liga('sino', CO.sino); C.OPT.l4lanterna = 'sino'; salvar(); conq('l4c_sino'); G.som(s => s.sinoLonge && s.sinoLonge()); return true; }
  } catch (e) {}
  return false;
}
// Chamada Inteira: todos os nomes de 1979 já foram digitados (a Chamada mora na memória do lote 4)
function checarChamada() {
  try {
    const fichas = ((window.ROTEIRO.progressao.lote4 || {}).chamada || {}).fichas || {};
    const feitos = (A.ls.get('hora-silencio-l4', {}) || {}).chamada || {};
    const nomes = Object.keys(fichas);
    if (nomes.length && nomes.every(k => feitos[k])) conq('l4c_chamada_inteira');
  } catch (e) {}
}

// ------------------------------------------------------------------ Modos: linhas extras (névoa/frio/brasa)
function modosExtra() {
  const M = TX().modos, c = codes();
  const linha = (id, on, chave, nome, desc) => `<label class="${chave ? '' : 'off'}"><input type="checkbox" data-l4cmodo="${id}" ${on ? 'checked' : ''} ${chave ? '' : 'disabled'}> ${esc(nome)} — <small>${chave ? esc(desc) : 'procure o código'}</small></label>`;
  return linha('nevoa', !!C.OPT.l4cnevoa, !!c.nevoa, M.nevoa, M.nevoaDesc)
    + linha('frio', !!C.OPT.l4cfrio, !!c.frio, M.frio, M.frioDesc)
    + linha('brasa', !!C.OPT.l4cbrasa, !!c.brasa, M.brasa, M.brasaDesc);
}
function modosControles(lista) {
  if (!lista) return;
  lista.querySelectorAll('[data-l4cmodo]').forEach(cb => cb.onchange = () => {
    const id = cb.dataset.l4cmodo, k = 'l4c' + id;
    C.OPT[k] = cb.checked;
    if (cb.checked) { ['nevoa', 'frio', 'brasa'].forEach(o => { if (o !== id) C.OPT['l4c' + o] = false; }); }
    salvar();
  });
}

// ------------------------------------------------------------------ abas novas do painel Segredos
const TABS = [['pertences', 'Pertences'], ['placar', 'Placar'], ['recordes', 'Recordes'], ['raras', 'Raras'], ['lendas', 'Lendas']];
function tabs() { return TABS; }
function render(aba) {
  try {
    if (aba === 'pertences') return tabPertences();
    if (aba === 'placar') return tabPlacar();
    if (aba === 'recordes') return tabRecordes();
    if (aba === 'raras') return tabRaras();
    if (aba === 'lendas') return tabLendas();
  } catch (e) {}
  return null;
}
function tabPertences() {
  const T = TX().pertences, a = ac(), cheio = (T.lista || []).every(p => a[p.pista]);
  const slot = p => { const t = !!a[p.pista]; return `<div class="l4c-slot${t ? '' : ' off'}"><div class="ic">${t ? esc(p.ic) : '·'}</div><div class="nm">${t ? esc(p.nome) : esc(T.vazio)}</div></div>`; };
  if (cheio) conq('l4c_lata');
  return `<p class="l4-aviso">${esc(T.aviso)}</p><div class="l4c-lata">${(T.lista || []).map(slot).join('')}</div>${cheio ? `<p class="l4-aviso" style="color:#c9a75a">${esc(T.completo)}</p>` : ''}`;
}
function tabPlacar() {
  const T = TX().placar, s = st();
  const best = (mem().placarBest != null) ? mem().placarBest : 0;
  const nome = (nomeJogador().slice(0, 3) || 'VOC');
  let linhas = (T.base || []).map(([n, p]) => ({ n, p }));
  linhas.push({ n: nome, p: best, voce: true });
  linhas.sort((a, b) => b.p - a.p);
  const bateu = best > 6;
  if (bateu) conq('l4c_placar');
  const html = linhas.map(l => {
    if (l.voce && bateu) return `<div class="ln ganhou"><span>${esc(T.ganhou)}</span><span>${l.p}</span></div>`;
    return `<div class="ln${l.voce ? ' voce' : ''}"><span>${esc(l.n)}</span><span>${l.p}</span></div>`;
  }).join('');
  return `<p class="l4-aviso">${esc(T.aviso)}</p><div class="l4c-fli">${html}</div><p class="l4-aviso">${esc(T.nota)}</p>`;
}
function tabRecordes() {
  const T = TX().recordes, caps = capsRanks(), nomes = T.capNomes || [];
  const ids = window.ROTEIRO.capitulos.map(c => c.id);
  let allS = true;
  const linhas = ids.map((id, i) => {
    const c = caps[id] || {}, rk = c.rank;
    if (rk !== 'S') allS = false;
    const tp = (typeof c.tempo === 'number' && c.tempo < 1e8) ? A.fmtC(c.tempo) : '—';
    return `<div class="l4c-rec"><span>${esc(nomes[i] || id)} <span class="tp">${rk ? esc(tp) : esc(T.semRank)}</span></span><span class="rk ${rk === 'S' ? 's' : rk ? '' : 'off'}">${rk || '·'}</span></div>`;
  }).join('');
  return `<p class="l4-aviso">${esc(T.aviso)}</p>${linhas}<p class="l4-aviso">${allS ? esc(T.tudoS) : esc(T.rodape)}</p>`;
}
function tabRaras() {
  const T = TX().raras, n = contaRaras(), tot = (T.lista || []).length;
  return `<p class="l4-aviso">${esc(T.aviso)} (${n}/${tot})</p>${(T.lista || []).map(o => { const t = temRara(o.id); return `<div class="l4c-occ${t ? '' : ' off'}">${t ? esc(o.txt) : '???'}${t ? '<span class="m">✦</span>' : ''}</div>`; }).join('')}`;
}
function tabLendas() {
  const T = TX().lendas;
  return `<p class="l4-aviso">${esc(T.aviso)}</p>${(T.lista || []).map(b => { const t = temLenda(b.id); return `<div class="l4c-lenda${t ? '' : ' off'}">${esc(b.txt)}${t ? `<span class="v">${esc(T.vivido)}</span>` : ''}</div>`; }).join('')}`;
}
function ligarControles(aba, lista) { /* as abas do L4C são só de leitura; nada a ligar */ }

// ------------------------------------------------------------------ fim de capítulo: raras por capítulo + lanterna de giz
let capMedoUltimo = null;
function fimCap(c, r) {
  const linhas = [];
  try {
    const S = C.S;
    // sem acender a lanterna o capítulo inteiro
    if ((S.capLuzT || 0) < 0.5) marcarRara('sem_luz');
    // sem correr uma vez sequer
    if ((S.capCorreu || 0) < 0.5) marcarRara('sem_correr');
    // cinco peças de acervo na noite
    if ((S.capLore || 0) >= 5 || (S.loreNoite || 0) >= 5) marcarRara('cinco_noite');
    // três mortes e passou
    if ((S.capMortes || 0) >= 3) marcarRara('tres_mortes');
    // corrida limpa (sem dano, sem morte)
    if ((S.capDano || 0) === 0 && (S.capMortes || 0) === 0) marcarRara('corrida_limpa');
    // terminou o capítulo com um modo de luz novo ligado
    const c = codes();
    if ((C.OPT.l4cnevoa && c.nevoa) || (C.OPT.l4cfrio && c.frio) || (C.OPT.l4cbrasa && c.brasa)) conq('l4c_luz_estranha');
    // selo de explorador libera a lanterna de giz (aviso discreto)
    const q = A.ls.get(C.KEYS.CONQ_KEY, {}) || {};
    if (q.l4b_explorador && C.OPT.l4lanterna !== 'giz') linhas.push('<i>Lanterna de giz liberada nos Segredos.</i>');
    checarRecordes();
  } catch (e) {}
  return linhas;
}

// ------------------------------------------------------------------ morte: colecionadora de medos + sala
function morte(quem) {
  try {
    const S = C.S, flags = (S && S.flags) || {};
    let id = quem;
    if (flags.sino) id = 'fuga';
    else if (S && S._dezMorte) id = 'dez';
    else if (S && (S.causaQueda || flags.queda)) id = 'queda';
    else if (S && !S.flashOn && quem === 'inspetor' && (S.capLuzT || 0) < 0.5) id = 'breu';
    marcarMedo(id);
    capMedoUltimo = id;
  } catch (e) {}
}
function telaMorte() {
  try {
    const T = TX().morte, n = contaMedos(), el = $('#dt-diag');
    if (!el) return;
    const txt = n >= 7 ? T.todas : T.nova.replace('{n}', n).replace('{t}', 7);
    el.innerHTML = (el.innerHTML ? el.innerHTML + '<br>' : '') + '<small style="color:#6d6452">' + esc(txt) + '</small>';
    // morreu mais de uma vez no mesmo capítulo: a Lia reconhece o lugar
    if (C.S && (C.S.capMortes || 0) >= 1) el.innerHTML += '<br><small style="color:#6d6452">' + esc(T.sala) + '</small>';
  } catch (e) {}
}

// ------------------------------------------------------------------ final: lata, corrida, manhã; placar
function final(tipo) {
  try {
    const T = TX().final, S = C.S, el = $('#e-stats'), linhas = [];
    const a = ac(), P = TX().pertences;
    // guarda o recorde do placar (peças de acervo achadas nesta noite)
    const nNoite = Object.values(LORE).reduce((t, ids) => t + ids.filter(id => (S.notes && S.notes[id]) || (S.fitas && S.fitas[id])).length, 0);
    const antes = mem().placarBest || 0;
    mudar(m => { m.placarBest = Math.max(m.placarBest || 0, nNoite); });
    if (nNoite > antes && nNoite > 0) linhas.push(T.melhorNoite);
    if (nNoite > 6) conq('l4c_placar');
    // a lata do Davi
    const nLata = (P.lista || []).filter(p => a[p.pista]).length;
    if (nLata >= 6) { linhas.push(T.lataCheia); conq('l4c_lata'); }
    else if (nLata >= 1) linhas.push(T.lata.replace('{n}', nLata));
    // Capítulo V num fôlego só (final rápido)
    if (S.completo && (S.capT || 1e9) < 180 && S.chapter === 5) linhas.push(T.rapida);
    // rank S em tudo → a manhã
    checarRecordes();
    if (mem().capsSAll) linhas.push(T.manha);
    if (el && linhas.length) el.innerHTML += '<br>' + linhas.map(esc).join('<br>');
  } catch (e) {}
}

// ------------------------------------------------------------------ pausa: linha extra (alterna com lote 4 / 4b)
function pausa() {
  try { const L = TX().pausa || []; if (!L.length || !C.S) return ''; const i = Math.abs((C.S.capMortes || 0) + (C.S.chapter || 0) + 2) % L.length; return '<br>' + esc(L[i]); } catch (e) { return ''; }
}

// ------------------------------------------------------------------ API
export const L4C = {
  ligar(ctx, api, helpers) {
    C = ctx; A = api; G = helpers || {};
    G.marcar = G.marcar || (() => {});
    G.tem = G.tem || (() => false);
    G.som = G.som || (fn => { try { C.iniciarAudio(); fn(C.SFX); } catch (e) {} });
    try { css(); } catch (e) {}
  },
  tick, titulo, tecla, lanternaLiberada, modosExtra, modosControles, tabs, render, ligarControles, fimCap, morte, telaMorte, final, pausa
};
