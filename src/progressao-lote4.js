// PROGRESSÃO — LOTE 4 (segredos e easter eggs)
// Códigos digitados no título, modos escondidos (espelhada, fumaça, sem luz), lanternas cosméticas, painel
// "Segredos" com prateleira de achados, cartas das entidades, mural de boatos, parede das Lias, livro das
// ocorrências raras e a chamada de 1979; bilhete da noite passada, lápide do amigo pelo código de desafio,
// contador de medos na morte e conquistas novas. Tudo passivo e à prova de erro (não trava o jogo nem o QA).
// Ligado por src/progressao.js (PG); o texto mora em src/progressao-lote4-roteiro.js.
import './progressao-lote4-roteiro.js';
import { L4B } from './progressao-lote4b.js'; // segunda rodada de segredos (códigos, telefones, álbum, caça, mapa, visitas...)

const K = 'hora-silencio-l4';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const TX = () => (window.ROTEIRO.progressao || {}).lote4 || {};
const ROM = ['Prólogo', 'Capítulo I', 'Capítulo II', 'Capítulo III', 'Capítulo IV', 'Capítulo V'];
let C = null, A = null;
const mem = () => { try { return A.ls.get(K, {}) || {}; } catch (e) { return {}; } };
const mudar = fn => { const m = mem(); fn(m); A.ls.set(K, m); return m; };
const som = fn => { try { C.iniciarAudio(); fn(C.SFX); } catch (e) {} };
const noTitulo = () => C && C.mode === 'titulo' && !$('#title').hidden && $('#painel').hidden;
const emJogo = () => C && C.mode === 'jogo' && !C.ui && C.S && !C.S.dead && !C.S.fim;
const conq = id => { try { A.conquista(id); } catch (e) {} };
const cq = () => { try { return A.ls.get(C.KEYS.CONQ_KEY, {}) || {}; } catch (e) { return {}; } };
const ac = () => { try { return A.acervo() || {}; } catch (e) { return {}; } };
const st = () => { try { return A.stats() || {}; } catch (e) { return {}; } };
const vezes = n => n === 1 ? 'vez' : 'vezes';

// ---------------------------------------------------------------- estilo (overlays e painel)
function css() {
  if ($('#l4-css')) return;
  const s = document.createElement('style'); s.id = 'l4-css';
  s.textContent = `[hidden]{display:none!important}
#l4-tint{position:fixed;inset:0;pointer-events:none;z-index:8}
#l4-veu{position:fixed;inset:0;pointer-events:none;z-index:9}
#l4-veu.fumaca{background:radial-gradient(circle at 50% 120%,rgba(60,40,22,.42),rgba(20,14,8,.16) 60%,transparent);animation:l4fum 14s ease-in-out infinite alternate}
#l4-veu.escuro{background:rgba(0,0,0,.30);box-shadow:inset 0 0 36vh 10vh rgba(0,0,0,.72)}
#l4-veu.fumaca.escuro{background:rgba(0,0,0,.26)}
@keyframes l4fum{from{opacity:.75;transform:translateY(0)}to{opacity:1;transform:translateY(-2%)}}
@media (prefers-reduced-motion:reduce){#l4-veu.fumaca{animation:none}}
body.l4-espelho #c{transform:scaleX(-1)}
.l4-tabs{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:14px}.l4-tabs .btn{font-size:15px;padding:4px 10px}.l4-tabs .btn.on{color:#c9a75a}
.l4-aviso{text-align:center;color:#857a63;font-style:italic;margin:-4px 0 14px;font-size:14px}
.l4-carta{display:inline-block;width:150px;vertical-align:top;margin:6px;padding:10px;border:1px solid #3a3228;background:#14110d}
.l4-carta.off{opacity:.45;filter:grayscale(1)}.l4-carta h4{font-family:"IM Fell English SC",Georgia,serif;font-weight:normal;font-size:18px;color:#c9a75a;margin:0 0 6px}
.l4-carta .n{font-family:"Special Elite",monospace;font-size:13px;color:#cfc3a6;line-height:1.7}.l4-carta .f{font-size:12px;color:#a89a7c;font-style:italic;margin-top:6px;border-top:1px solid #1f1b16;padding-top:5px}
.l4-prat{display:flex;flex-wrap:wrap;gap:12px;justify-content:center}
.l4-obj{width:120px;text-align:center;padding:10px 6px;border-bottom:2px solid #3a3228}.l4-obj.off{opacity:.4}
.l4-obj .ic{font-size:30px;line-height:1}.l4-obj .nm{font-family:"Special Elite",monospace;font-size:12px;color:#cfc3a6;margin-top:6px}.l4-obj .fr{font-size:11px;color:#857a63;font-style:italic;margin-top:4px}
.l4-giz{font-family:"Special Elite",monospace;color:#e9dfc8;line-height:2.1;word-break:break-word}
.l4-boato{padding:7px 0;border-top:1px solid #1f1b16;color:#cfc3a6}.l4-boato .v{float:right;color:#b0362a;font-size:12px;letter-spacing:.1em}.l4-boato.off{color:#6d6452}
.l4-occ{padding:6px 0;border-top:1px solid #1f1b16;color:#cfc3a6}.l4-occ.off{color:#6d6452}.l4-occ .m{float:right;color:#c9a75a}
.l4-lant label,.l4-modo label{display:block;padding:8px 0;border-top:1px solid #1f1b16;cursor:pointer}.l4-lant label.off,.l4-modo label.off{opacity:.5}
.l4-lant .sw{display:inline-block;width:14px;height:14px;border-radius:50%;vertical-align:middle;margin-right:8px;border:1px solid #000}
.l4-lant small,.l4-modo small{color:#857a63}
.l4-cham{padding:6px 0;border-top:1px solid #1f1b16;color:#cfc3a6}.l4-cham.off{color:#6d6452}`;
  document.head.appendChild(s);
}

// ---------------------------------------------------------------- overlays em jogo
let tintEl = null, veuEl = null;
function hexA(h, a) { const n = parseInt(h.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
function lanternaLiberada(id) {
  const q = cq(), a = ac(), c = mem().codes || {};
  switch (id) {
    case 'padrao': return true;
    case 'davi': return !!c.recreio;
    case 'tome': return !!q.fio_criancas;
    case 'celeste': return !!a.f2;
    case 'joaquim': return !!q.ouve_casa;
    case 'lampiao': return !!c.lampiao;
    case 'vermelha': return !!q.internato_inteiro;
  }
  return L4B.lanternaLiberada(id);
}
function corLanterna() {
  const id = C.OPT.l4lanterna || 'padrao';
  if (!lanternaLiberada(id)) return null;
  const L = (TX().lanternas.lista || []).find(x => x.id === id);
  return L ? L.cor : null;
}
function overlaysTick() {
  const jogo = emJogo();
  // lanterna cosmética
  if (!tintEl) { tintEl = document.createElement('div'); tintEl.id = 'l4-tint'; tintEl.hidden = true; ($('#c') || document.body).insertAdjacentElement('afterend', tintEl); }
  const cor = jogo ? corLanterna() : null;
  if (cor) { const bg = `radial-gradient(circle at 50% 47%,${hexA(cor, 0)} 34%,${hexA(cor, .16)} 100%)`; if (tintEl._bg !== bg) { tintEl.style.background = bg; tintEl._bg = bg; } tintEl.hidden = false; }
  else if (!tintEl.hidden) tintEl.hidden = true;
  // véu de modo (fumaça / sem luz)
  if (!veuEl) { veuEl = document.createElement('div'); veuEl.id = 'l4-veu'; veuEl.hidden = true; (tintEl || $('#c') || document.body).insertAdjacentElement('afterend', veuEl); }
  const c = mem().codes || {};
  const fum = jogo && C.OPT.l4fumaca && c.fogo, dark = jogo && C.OPT.l4escuro && c.escuro;
  const cls = (fum ? 'fumaca ' : '') + (dark ? 'escuro' : '');
  if (cls.trim()) { if (veuEl.className !== cls.trim()) veuEl.className = cls.trim(); veuEl.hidden = false; } else if (!veuEl.hidden) veuEl.hidden = true;
  // Noite Espelhada (vira o render pelo CSS)
  const esp = jogo && C.OPT.l4espelho && (mem().codes || {}).acorda;
  document.body.classList.toggle('l4-espelho', !!esp);
  if (esp) espUsada = true;
}

// ---------------------------------------------------------------- marcadores (boatos, ocorrências, cartas)
let espUsada = false, mexeuNoite = false, noiteSem = null, loreInicio = 0, darkT = 0;
function marcar(grupo, id) { let novo = false; mudar(m => { m[grupo] = m[grupo] || {}; if (!m[grupo][id]) { m[grupo][id] = Date.now(); novo = true; } }); return novo; }
function tem(grupo, id) { return !!((mem()[grupo] || {})[id]); }
function conta(grupo) { return Object.keys(mem()[grupo] || {}).length; }

function recalcBoatos() {
  const q = cq(), a = ac();
  if (tem('occ', 'hora')) marcar('boatos', 'dez');
  if (tem('cartas', 'inspetor')) marcar('boatos', 'janta');
  if (a.n9) marcar('boatos', 'andar');
  if (q.quarta_crianca) marcar('boatos', 'quarta');
  if (espUsada || tem('occ', 'espelhada')) marcar('boatos', 'espelho');
  if (tem('occ', 'cheia')) marcar('boatos', 'cheia');
  if ((TX().boatos.lista || []).every(b => tem('boatos', b.id))) conq('l4_boatos');
}
function cartasBase() { return (TX().cartas.lista || []).map(c => c.id); }
function recalcCartas() {
  const S = C.S;
  if (S) {
    if ((S.capVisto || 0) >= 1) marcar('cartas', 'inspetor');
    if (S.done && S.done.ana) marcar('cartas', 'ana');
    if (S.procTipo) marcar('cartas', 'procissao');
    if ((S.chamIgn || 0) >= 1) marcar('cartas', 'chamado');
    if (C.PROC && C.PROC.fase) marcar('cartas', 'coruja');
    if (darkT > 8) marcar('cartas', 'breu');
  }
  const q = cq(), a = ac();
  if (a.n4) marcar('cartas', 'moacir');
  if (q.fio_diario) marcar('cartas', 'davi');
  if (cartasBase().every(id => tem('cartas', id))) conq('l4_cartas');
}
const PRAT = [
  { id: 'f4', ic: '🎞', nm: 'a última fita', fr: '“é a voz dele.”' },
  { id: 'f6', ic: '🚗', nm: 'carrinho azul', fr: '“era do Tomé.”' },
  { id: 'n13', ic: '✎', nm: 'o desenho', fr: '“pro meu aniversário.”' },
  { id: 'p4', ic: '📄', nm: 'página molhada', fr: '“ele escreveu embaixo d’água.”' },
  { id: 'n11', ic: '⬚', nm: 'a pedra corrigida', fr: '“alguém arrumou a data.”' },
  { id: 'f3', ic: '📼', nm: 'a voz dele', fr: '“o homem que caça gravou.”' }
];
function recalcPrateleira() { if (PRAT.every(p => ac()[p.id])) conq('l4_prateleira'); }

// ---------------------------------------------------------------- tick
let acc = 0;
function tick(dt) {
  try { L4B.tick(dt); } catch (e) {}
  try {
    if (C.S && !C.S.flashOn && emJogo()) darkT += dt; // tempo no breu
    overlaysTick();
    acc += dt; if (acc < 1) return; acc = 0;
    const s = st();
    // Hora Cheia: nove horas somadas dentro do internato
    if ((s.tempo || 0) >= 9 * 3600) { if (marcar('occ', 'cheia')) { conq('l4_hora_cheia'); } }
    // Doze: o Inspetor te pegou doze vezes
    if (((s.causas || {}).inspetor || 0) >= 12) conq('l4_doze');
    // Trinta e Sete
    if ((s.mortes || 0) >= 37) conq('l4_trinta7');
    // Quem Procura Acha: 20 peças do acervo
    if (Object.keys(ac()).length >= 20) conq('l4_procura');
    // Não Mexi em Nada: segredo achado nesta noite?
    const S = C.S;
    if (S) {
      if (noiteSem !== S.semente) { noiteSem = S.semente; mexeuNoite = false; loreInicio = Object.keys(ac()).length; darkT = 0; }
      if (Object.keys(ac()).length > loreInicio) mexeuNoite = true;
    }
    recalcCartas(); recalcBoatos(); recalcPrateleira();
  } catch (e) {}
}

// ---------------------------------------------------------------- título
let bilheteMostrado = false;
function titulo() {
  try {
    css();
    const T = TX();
    // ocorrência: jogo exatamente às 21h
    if (new Date().getHours() === 21) marcar('occ', 'hora');
    // Noite 13 (treze noites): usa partidas como contagem de noites
    if ((st().partidas || 0) >= 13) { if (marcar('occ', 'treze_noites')) conq('l4_treze'); }
    // botão Segredos
    botaoSegredos();
    // bilhete da noite passada na cortiça
    if (!bilheteMostrado && (st().partidas || 0) >= 1) {
      bilheteMostrado = true;
      const ult = A.ls.get('hora-silencio-ultima', null);
      if (ult && ult.tipo === 'morte') {
        const cap = ROM[ult.cap] || 'algum lugar', s = st(), B = T.bilhetes || {};
        let txt = B.geral.replace('{cap}', cap);
        const quem = ult.quem;
        if (quem === 'inspetor') { const n = (s.causas || {}).inspetor || 1; txt = B.inspetor.replace('{n}', n).replace('{vezes}', vezes(n)).replace('{cap}', cap); }
        else if (quem === 'ana') txt = B.ana.replace('{cap}', cap);
        else if (quem === 'procissao') txt = B.procissao.replace('{cap}', cap);
        const el = $('#t-memoria'); if (el) el.textContent = (el.textContent ? el.textContent + ' · ' : '') + B.inicio + ' “' + txt + '”';
      }
    }
    // lápide do amigo: código de desafio colado no campo
    const inp = $('#o-desafio');
    if (inp && !inp._l4) { inp._l4 = true; inp.addEventListener('input', () => { try { const cod = A.lerCodigo ? A.lerCodigo(inp.value) : null; if (cod) { const el = $('#t-memoria'); if (el && !el.dataset.l4lap) { el.dataset.l4lap = '1'; el.textContent = TX().lapideAmigo; } } } catch (e) {} }); }
    recalcBoatos();
  } catch (e) {}
  try { L4B.titulo(); } catch (e) {}
}
function botaoSegredos() {
  if ($('#b-l4') || !$('#b-stats')) return;
  const b = document.createElement('button'); b.className = 'btn'; b.id = 'b-l4'; b.textContent = 'Segredos';
  $('#b-stats').insertAdjacentElement('afterend', b);
  b.onclick = () => abrirSeg('prateleira');
}

// ---------------------------------------------------------------- painel Segredos (abas)
const ABAS = [['prateleira', 'Prateleira'], ['cartas', 'Cartas'], ['boatos', 'Boatos'], ['parede', 'Todas Voltam'], ['ocorrencias', 'Ocorrências'], ['chamada', 'Chamada'], ['lanternas', 'Lanternas'], ['modos', 'Modos']];
function todasAbas() { let extra = []; try { extra = L4B.tabs() || []; } catch (e) {} return ABAS.concat(extra); }
function abrirSeg(aba) {
  const abas = todasAbas();
  const barra = `<div class="l4-tabs">${abas.map(([k, n]) => `<button class="btn${k === aba ? ' on' : ''}" data-aba="${k}">${n}</button>`).join('')}</div>`;
  let corpo = '';
  try {
    const fn = { prateleira: tabPrateleira, cartas: tabCartas, boatos: tabBoatos, parede: tabParede, ocorrencias: tabOcorrencias, chamada: tabChamada, lanternas: tabLanternas, modos: tabModos }[aba];
    corpo = fn ? fn() : (L4B.render(aba) || tabPrateleira());
  } catch (e) { corpo = '<p class="l4-aviso">—</p>'; }
  A.abrirPainel('Segredos', barra + corpo);
  $('#pn-lista').querySelectorAll('[data-aba]').forEach(x => x.onclick = () => abrirSeg(x.dataset.aba));
  ligarControles(aba);
}
function tabPrateleira() {
  const a = ac();
  return `<p class="l4-aviso">O que a casa deixou cair. O que falta é só poeira.</p><div class="l4-prat">${PRAT.map(p => { const t = !!a[p.id]; return `<div class="l4-obj${t ? '' : ' off'}"><div class="ic">${t ? p.ic : '·'}</div><div class="nm">${t ? esc(p.nm) : '???'}</div>${t ? `<div class="fr">${esc(p.fr)}</div>` : ''}</div>`; }).join('')}</div>`;
}
function tabCartas() {
  const T = TX().cartas, carta = c => { const t = tem('cartas', c.id); return `<div class="l4-carta${t ? '' : ' off'}"><h4>${t ? esc(c.nome) : '???'}</h4><div class="n">Audição ${c.a}<br>Visão ${c.v}<br>Velocidade ${c.ve}</div>${t ? `<div class="f">${esc(c.fraco)}</div>` : `<div class="f">sobreviva a ela</div>`}</div>`; };
  const sec = (T.secretas || []).map(c => { const t = tem('cartas', c.id); return `<div class="l4-carta${t ? '' : ' off'}"><h4>${t ? esc(c.nome) : '???'}</h4><div class="n">${t ? `Audição ${c.a}<br>Visão ${c.v}<br>Velocidade ${c.ve}` : '— — —'}</div><div class="f">${t ? esc(c.fraco) : esc(c.como)}</div></div>`; }).join('');
  return `<p class="l4-aviso">${esc(T.aviso)}</p><div style="text-align:center">${(T.lista || []).map(carta).join('')}${sec}</div>`;
}
function tabBoatos() {
  const T = TX().boatos;
  return `<p class="l4-aviso">${esc(T.aviso)}</p>${(T.lista || []).map(b => { const t = tem('boatos', b.id); return `<div class="l4-boato${t ? '' : ' off'}">${esc(b.txt)}${t ? `<span class="v">${esc(T.vivido)}</span>` : ''}</div>`; }).join('')}`;
}
function tabParede() {
  const T = TX().parede, s = st(), m = s.mortes || 0, ca = s.causas || {};
  if (!m) return `<p class="l4-aviso">${esc(T.vazio)}</p>`;
  let nome = 'LIA'; try { nome = (JSON.parse(localStorage.getItem('hora-silencio-nome') || '""') || '').trim().toUpperCase() || 'LIA'; } catch (e) {}
  let riscos = ''; for (let i = 0; i < Math.min(m, 60); i++) riscos += (i && i % 5 === 0 ? '  ' : ' ') + (i % 5 === 4 ? '╱' : '│');
  const linha37 = m >= 37 ? `<p class="l4-aviso" style="color:#c9a75a">${esc(T.trinta7.replace('{nome}', nome))}</p>` : '';
  return `<p class="l4-aviso">${esc(T.texto)}</p><div class="l4-giz">${riscos}</div><p class="l4-aviso">${m} ${vezes(m)} · ${esc(T.inspetor)} ${ca.inspetor || 0} · ${esc(T.ana)} ${ca.ana || 0} · ${esc(T.procissao)} ${ca.procissao || 0}</p>${linha37}`;
}
function tabOcorrencias() {
  const T = TX().ocorrencias, n = (T.lista || []).filter(o => tem('occ', o.id)).length;
  return `<p class="l4-aviso">${esc(T.aviso)} (${n}/${(T.lista || []).length})</p>${(T.lista || []).map(o => { const t = tem('occ', o.id); return `<div class="l4-occ${t ? '' : ' off'}">${t ? esc(o.txt) : '???'}${t ? '<span class="m">✦</span>' : ''}</div>`; }).join('')}`;
}
function tabChamada() {
  const T = TX().chamada, feitos = mem().chamada || {};
  const nomes = Object.keys(T.fichas || {});
  const n = nomes.filter(k => feitos[k]).length;
  return `<p class="l4-aviso">${esc(T.aviso)} (${n}/${nomes.length})</p>${nomes.map(k => { const t = !!feitos[k]; return `<div class="l4-cham${t ? '' : ' off'}">${t ? esc(T.fichas[k]) : '· · ·'}</div>`; }).join('')}`;
}
function tabLanternas() {
  const T = TX().lanternas, cur = C.OPT.l4lanterna || 'padrao';
  return `<p class="l4-aviso">${esc(T.aviso)}</p><div class="l4-lant">${(T.lista || []).map(L => { const lib = lanternaLiberada(L.id); return `<label class="${lib ? '' : 'off'}"><input type="radio" name="l4lant" value="${L.id}" ${cur === L.id ? 'checked' : ''} ${lib ? '' : 'disabled'}> <span class="sw" style="background:${L.cor || '#cfc3a6'}"></span>${esc(L.nome)} — <small>${lib ? esc(L.desc) : esc(L.como || 'ainda não liberada')}</small></label>`; }).join('')}</div>`;
}
function tabModos() {
  const T = TX().modos, c = mem().codes || {};
  const linha = (id, on, chave, nome, desc) => `<label class="${chave ? '' : 'off'}"><input type="checkbox" data-modo="${id}" ${on ? 'checked' : ''} ${chave ? '' : 'disabled'}> ${esc(nome)} — <small>${chave ? esc(desc) : esc(T.trancado)}</small></label>`;
  let extra = ''; try { extra = L4B.modosExtra() || ''; } catch (e) {}
  return `<p class="l4-aviso">${esc(T.aviso)}</p><div class="l4-modo">
    ${linha('espelho', !!C.OPT.l4espelho, !!c.acorda, T.espelhada, T.espelhadaDesc)}
    ${linha('fumaca', !!C.OPT.l4fumaca, !!c.fogo, T.fumaca, T.fumacaDesc)}
    ${linha('escuro', !!C.OPT.l4escuro, !!c.escuro, T.escuro, T.escuroDesc)}
    ${extra}
  </div>`;
}
function ligarControles(aba) {
  const lista = $('#pn-lista'); if (!lista) return;
  if (aba === 'lanternas') lista.querySelectorAll('input[name="l4lant"]').forEach(r => r.onchange = () => { if (r.checked) { C.OPT.l4lanterna = r.value; try { C.salvarOpt(); } catch (e) {} } });
  if (aba === 'modos') { lista.querySelectorAll('[data-modo]').forEach(cb => cb.onchange = () => { C.OPT['l4' + cb.dataset.modo] = cb.checked; try { C.salvarOpt(); } catch (e) {} }); try { L4B.modosControles(lista); } catch (e) {} }
  try { L4B.ligarControles(aba, lista); } catch (e) {}
}

// ---------------------------------------------------------------- códigos digitados no título
function lembrar(txt) { const el = $('#t-memoria'); if (el) el.textContent = txt || ''; }
function codigo(id, memTxt, extra) {
  let novo = false; mudar(m => { m.codes = m.codes || {}; if (!m.codes[id]) { m.codes[id] = Date.now(); novo = true; } });
  lembrar(memTxt); try { extra && extra(novo); } catch (e) {}
}
function tecla(buf) {
  try {
    const T = TX(), CO = T.codigos || {};
    if (buf.endsWith('acorda')) { codigo('acorda', CO.acorda); som(s => s.sinoLonge()); conq('l4_acorda'); C.OPT.l4espelho = true; try { C.salvarOpt(); } catch (e) {} return true; }
    if (buf.endsWith('lampiao') || buf.endsWith('lampião')) { codigo('lampiao', CO.lampiao); som(s => s.papel && s.papel()); conq('l4_lampiao'); C.OPT.l4lanterna = 'lampiao'; try { C.salvarOpt(); } catch (e) {} return true; }
    if (buf.endsWith('recreio')) { codigo('recreio', CO.recreio); som(s => s.papel && s.papel()); conq('l4_recreio'); C.OPT.l4lanterna = 'davi'; try { C.salvarOpt(); } catch (e) {} return true; }
    if (buf.endsWith('fogo')) { codigo('fogo', CO.fogo); som(s => s.estatica && s.estatica(1)); conq('l4_fogo'); C.OPT.l4fumaca = true; try { C.salvarOpt(); } catch (e) {} return true; }
    if (buf.endsWith('escuro')) { codigo('escuro', CO.escuro); som(s => s.silencio && s.silencio(2, .02)); conq('l4_escuro'); C.OPT.l4escuro = true; try { C.salvarOpt(); } catch (e) {} return true; }
    if (buf.endsWith('avesso')) { lembrar(CO.avesso); $('#title').classList.toggle('l4-flip'); conq('l4_avesso4'); som(s => s.sussurros && s.sussurros(1.5)); return true; }
    if (buf.endsWith('ail')) { lembrar(CO.ail); $('#title').classList.toggle('p3-espelho'); conq('l4_espelho'); som(s => s.sinoLonge && s.sinoLonge()); return true; }
    // nomes da chamada de 1979
    const fichas = (T.chamada || {}).fichas || {};
    for (const nome in fichas) {
      if (buf.endsWith(nome)) {
        let n = 0; mudar(m => { m.chamada = m.chamada || {}; m.chamada[nome] = Date.now(); n = Object.keys(m.chamada).length; });
        lembrar(fichas[nome]); som(s => s.papel && s.papel());
        if (n >= 10) conq('l4_chamada');
        return true;
      }
    }
    if (L4B.tecla(buf)) return true;
  } catch (e) {}
  return false;
}
// o título também espelha de cabeça para baixo com o AVESSO
function cssAvesso() { if ($('#l4-flip-css')) return; const s = document.createElement('style'); s.id = 'l4-flip-css'; s.textContent = '#title.l4-flip h1,#title.l4-flip .sub{transform:rotate(180deg)}'; document.head.appendChild(s); }

// ---------------------------------------------------------------- morte: contador de medos
const MEDOS = ['inspetor', 'ana', 'procissao', 'fuga'];
function morte(quem) {
  try {
    const S = C.S, id = (S && S.flags && S.flags.sino) ? 'fuga' : quem;
    if (MEDOS.includes(id)) { marcar('medos', id); if (MEDOS.every(x => tem('medos', x))) conq('l4_medos'); }
  } catch (e) {}
}
function telaMorte() {
  try {
    const T = TX().medos, n = conta('medos'), tot = MEDOS.length, el = $('#dt-diag');
    if (el) { const extra = n >= tot ? T.todas : T.titulo.replace('{n}', n).replace('{t}', tot); el.innerHTML = (el.innerHTML ? el.innerHTML + '<br>' : '') + '<small style="color:#857a63">' + esc(extra) + '</small>'; }
  } catch (e) {}
  try { L4B.telaMorte(); } catch (e) {}
}

// ---------------------------------------------------------------- fim de capítulo / final
function fimCap(c, r) {
  let linhas = [];
  try { if (espUsada) marcar('occ', 'espelhada'); } catch (e) {}
  try { linhas = L4B.fimCap(c, r) || []; } catch (e) {}
  return linhas;
}
function final(tipo) {
  try {
    if (espUsada) { marcar('occ', 'espelhada'); recalcBoatos(); }
    if (!mexeuNoite) { conq('l4_nao_mexi'); const el = $('#e-stats'); if (el) el.innerHTML += '<br>' + esc(TX().naoMexi); }
  } catch (e) {}
  try { L4B.final(tipo); } catch (e) {}
}

// ---------------------------------------------------------------- API
export const L4 = {
  ligar(ctx, api) { C = ctx; A = api; try { css(); cssAvesso(); } catch (e) {} try { L4B.ligar(ctx, Object.assign({}, api, { abrirSeg }), { marcar, tem, conta, som }); } catch (e) {} },
  tick, titulo, tecla, morte, telaMorte, fimCap, final,
  pausa() { try { let base = ''; const L = TX().pausa || []; if (L.length && C.S) { const i = Math.abs((C.S.capMortes || 0) + (C.S.chapter || 0)) % L.length; base = '<br>' + esc(L[i]); } let extra = ''; try { extra = L4B.pausa() || ''; } catch (e) {} return base + extra; } catch (e) { return ''; } }
};
