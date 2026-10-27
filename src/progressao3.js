// PROGRESSÃO — LOTE 3 (polimento e plataforma)
// Reinício instantâneo do capítulo (BACKSPACE / SELECT / três dedos), morte rápida no modo corrida, foto do último
// instante, polaroides da noite no menu Capítulos, rota gravada, contador de 100%, tempo real ao lado do tempo de jogo,
// Noite da Semana, corrida limpa ou com ajuda, modo Ouvido do Inspetor, filtros de rejogo, segredos do título,
// conquistas novas, fósforos para as charadas e o pulo da cadeira.
// Ligado por src/progressao.js (PG); o texto mora em src/progressao3-roteiro.js.
import './progressao3-roteiro.js';

const K = 'hora-silencio-l3', FOTOS_K = 'hora-silencio-l3-fotos', ROTAS_K = 'hora-silencio-l3-rotas', MUNDO_K = 'hora-silencio-mundo';
const $ = s => document.querySelector(s);
const TX = () => window.ROTEIRO.progressao.lote3;
const R = () => window.ROTEIRO;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ROM = ['Prólogo', 'I', 'II', 'III', 'IV', 'V'];
let C = null, A = null;
const mem = () => A.ls.get(K, {}) || {};
const mudar = fn => { const m = mem(); fn(m); A.ls.set(K, m); return m; };
const som = fn => { try { C.iniciarAudio(); fn(C.SFX); } catch (e) {} };
const noTitulo = () => C && C.mode === 'titulo' && !$('#title').hidden && $('#painel').hidden;
const jogoAtivo = () => { const S = C && C.S; return C && C.mode === 'jogo' && !C.ui && S && !S.dead && !S.fim; };
const corrida = () => { const S = C.S; return !!(C.OPT.crono || C.OPT.cron || (S && S.modo && S.modo.crono)); };
const mmss = s => { s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(s % 60).padStart(2, '0'); };
const hoje1994 = () => { const d = new Date(); return `${String(d.getDate()).padStart(2, '0')} ${['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][d.getMonth()]} 1994`; };
const horaNoite = t => { const s = 20 * 3600 + 47 * 60 + Math.floor(t || 0); return `${String(Math.floor(s / 3600) % 24).padStart(2, '0')}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
const algumFinal = () => Object.keys(A.stats().finais || {}).length > 0;

// ---------------------------------------------------------------- a noite atual (vive enquanto a página está aberta)
let N = null;
function noite() {
  const S = C.S; if (!S) return null;
  if (!N || N.sem !== S.semente) N = { sem: S.semente, t0: (S.flags && S.flags._t0) || 0, pulos: 0, qual: {}, reinicios: 0, motivos: new Set(), seq: 0, continuada: !(S.flags && S.flags._t0) };
  return N;
}

// ---------------------------------------------------------------- estilo
function css() {
  if ($('#p3-css')) return;
  const st = document.createElement('style'); st.id = 'p3-css';
  st.textContent = `[hidden]{display:none!important}
#p3-anel{position:fixed;left:50%;top:50%;width:84px;height:84px;margin:-42px;pointer-events:none;z-index:40;text-align:center}
#p3-anel svg{width:84px;height:84px;transform:rotate(-90deg)}#p3-anel circle{fill:none;stroke-width:4}#p3-anel .f{stroke:rgba(255,255,255,.12)}#p3-anel .v{stroke:#c9a75a;stroke-dasharray:163.4;stroke-dashoffset:163.4;filter:drop-shadow(0 0 6px #8e1b14)}
#p3-anel span{position:absolute;left:50%;top:94px;transform:translateX(-50%);white-space:nowrap;font-family:"Special Elite",monospace;font-size:14px;color:#e9dfc8;text-shadow:0 0 8px #000}
#conq{position:fixed;z-index:60;cursor:pointer;pointer-events:auto}#conq:not(.on){pointer-events:none}#conq .p3-n{float:right;margin-left:12px;color:#857a63;font-size:12px}
@media (prefers-reduced-motion:reduce){#conq{transition:none!important;transform:none!important}#fc-rank.carimbo{animation:none!important}#fc-selos .selo.on{animation:none!important}}
#fc-selos .selo.on{animation:p3selo .45s both}#fc-selos .selo:nth-child(2){animation-delay:.25s}#fc-selos .selo:nth-child(3){animation-delay:.5s}#fc-selos .selo:nth-child(4){animation-delay:.75s}
@keyframes p3selo{from{opacity:0;transform:scale(1.6)}to{opacity:1;transform:none}}
.p3-conta{font-family:"Special Elite",monospace;font-size:20px;color:#e9dfc8}
.p3-pts{display:inline-block;width:120px;height:5px;background:rgba(255,255,255,.1);vertical-align:middle;margin:0 6px;position:relative}.p3-pts i{position:absolute;inset:0;width:var(--v);background:#c9a75a}
.p3-r-S{color:#e8c46a!important;text-shadow:0 0 12px rgba(232,196,106,.45)}.p3-r-A{color:#cfc3a6!important}.p3-r-B{color:#a89a7c!important}.p3-r-C{color:#7d6f5a!important}
.p3-pes{font-size:14px;color:#b0362a;vertical-align:super;margin-left:2px}
.p3-pola{flex:none;width:96px;margin:0 14px 0 0;padding:5px 5px 18px;background:#e6dfcf;box-shadow:0 2px 10px #000;transform:rotate(var(--r,0deg));position:relative}
.p3-pola img{display:block;width:86px;height:58px;object-fit:cover;background:#111;filter:sepia(.35) contrast(1.05)}
.p3-pola figcaption{position:absolute;left:0;right:0;bottom:2px;text-align:center;font-family:"Special Elite",monospace;font-size:9px;color:#2c4a8a;transform:rotate(-2deg)}
.lista .it.p3-com-pola{justify-content:flex-start}.lista .it.p3-com-pola>div:nth-child(2){flex:1}
.p3-tabs{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin-bottom:12px}.p3-tabs .btn{font-size:15px;padding:4px 10px}.p3-tabs .btn.on{color:#c9a75a}
.p3-nova{font-family:"Special Elite",monospace;font-size:11px;color:#000;background:#c9a75a;padding:0 5px;margin-left:8px;vertical-align:middle;letter-spacing:.05em}
.p3-fos{cursor:pointer;position:relative;overflow:hidden}.p3-fos::after{content:"";position:absolute;left:0;bottom:0;height:3px;width:var(--k,0%);background:#e07b2a;transition:width .1s}
.p3-cem{border:1px solid #3a3228;padding:12px 16px;margin-bottom:12px;background:#0e0c0a}.p3-cem h3{font-family:"IM Fell English SC",Georgia,serif;font-weight:normal;font-size:24px;letter-spacing:.08em;color:#c9a75a}
.p3-cem .barra{display:block;height:6px;background:rgba(255,255,255,.08);margin:8px 0 10px}.p3-cem .barra i{display:block;height:100%;background:#c9a75a}
.p3-cem details{border-top:1px solid #1f1b16;padding:5px 0}.p3-cem summary{cursor:pointer;font-size:16px;color:#cfc3a6}.p3-cem summary small{color:#857a63}.p3-cem .p3-l{font-size:14px;color:#a89a7c;padding:4px 0 2px 16px;line-height:1.5}
.p3-falta{color:#6d6452}
#p3-filtro,#p3-ouvido{position:fixed;inset:0;pointer-events:none}
#p3-ouvido{background:#000;opacity:.96}
#p3-filtro.fita{backdrop-filter:sepia(.45) saturate(.65) contrast(1.12) brightness(1.05);-webkit-backdrop-filter:sepia(.45) saturate(.65) contrast(1.12);background:repeating-linear-gradient(180deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px)}
#p3-filtro.vigia{backdrop-filter:grayscale(1) sepia(1) hue-rotate(55deg) saturate(2.6) brightness(1.35) contrast(1.25);-webkit-backdrop-filter:grayscale(1) sepia(1) hue-rotate(55deg) saturate(2.6) brightness(1.35);background:repeating-linear-gradient(180deg,rgba(0,40,0,.25) 0 2px,transparent 2px 4px)}
#p3-filtro.negativo{backdrop-filter:invert(1) hue-rotate(180deg) contrast(1.1);-webkit-backdrop-filter:invert(1) hue-rotate(180deg)}
#p3-filtro .p3-track{position:absolute;left:0;right:0;height:9vh;top:110%;background:linear-gradient(180deg,transparent,rgba(255,255,255,.08) 40%,rgba(0,0,0,.35) 60%,transparent);display:none}
#p3-filtro.fita .p3-track{display:block;animation:p3track 20s linear infinite}
@keyframes p3track{0%,88%{top:110%}100%{top:-12%}}
#p3-filtro .p3-data{position:absolute;right:4vw;bottom:5vh;font-family:"Special Elite",monospace;font-size:22px;color:#f0a83a;text-shadow:0 0 6px rgba(240,140,30,.7);letter-spacing:.08em}
#p3-filtro .p3-play{position:absolute;left:4vw;top:5vh;font-family:"Special Elite",monospace;font-size:22px;color:#e9e4d6;text-shadow:0 0 6px #000}
#p3-filtro.vigia .p3-data,#p3-filtro.vigia .p3-play{color:#bff5b0;text-shadow:0 0 6px rgba(120,255,120,.6)}
#p3-filtro.vigia .p3-play b{color:#ff4b3a;animation:pisca 1s infinite;font-weight:normal}
#p3-filtro.negativo .p3-data,#p3-filtro.negativo .p3-play{display:none}
#p3-mao{position:fixed;inset:0;pointer-events:none;z-index:45;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 1.5s}#p3-mao.on{opacity:1;transition:opacity .08s}
#p3-orelhao{display:block;margin:10px auto 0;font-family:"Special Elite",monospace;font-size:15px;color:#c9a75a;background:none;border:1px dashed #5d4a2a;padding:6px 12px;cursor:pointer;animation:pisca 1.2s infinite}
#p3-pct{font-size:14px;color:#857a63;font-style:italic;margin-top:4px;min-height:1em}
#p3-giz{position:absolute;left:3vw;bottom:9vh;width:220px;height:140px;opacity:.5;pointer-events:none}
#title.p3-avesso h1,#title.p3-avesso .sub{transform:rotate(180deg)}#title.p3-espelho{transform:scaleX(-1)}
#title h1.p3-placa{color:#b9a27a;text-shadow:0 0 30px #5a2a08,0 0 8px #8a4a14;letter-spacing:.2em}
#p3-ficha{display:none}
@media print{body.p3-imprimir>*{display:none!important}body.p3-imprimir #p3-ficha{display:block!important;color:#000;background:#fff;font-family:Georgia,serif;padding:30px;position:static}
#p3-ficha h1{font-size:20px;letter-spacing:.1em;border-bottom:2px solid #000;padding-bottom:6px}#p3-ficha .l{border-bottom:1px solid #000;padding:14px 0 4px;font-size:15px}#p3-ficha .f{float:right;width:3cm;height:4cm;border:1px solid #000;text-align:center;font-size:11px;padding-top:1.6cm}
#p3-ficha .c{display:inline-block;margin-top:30px;border:4px double #a00;color:#a00;padding:8px 18px;font-size:22px;transform:rotate(-8deg);letter-spacing:.12em}#p3-ficha .r{margin-top:40px;font-style:italic;font-size:13px}}
.p3-ov{position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.93);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px}
.p3-ov canvas{max-width:94vw;max-height:74vh;border:1px solid #3a3228;background:#060504}
.p3-leg{font-family:"Special Elite",monospace;font-size:13px;color:#a89a7c;display:flex;gap:16px;flex-wrap:wrap;justify-content:center}.p3-leg i{display:inline-block;width:14px;height:4px;margin-right:5px;vertical-align:middle}
#death.p3-rapida #dt-retry{color:#fff;border:1px solid #7a6236}
@media (pointer:coarse){.painel .btn,.p3-tabs .btn{min-height:44px;padding:10px 16px}.pgm-abas .btn{min-height:44px}.lista .it{padding:14px 16px}}`;
  document.head.appendChild(st);
}

// ---------------------------------------------------------------- captura do canvas (logo depois do desenho)
// O WebGL apaga o quadro depois de mostrado; um requestAnimationFrame pedido de dentro do frame roda depois do
// próximo desenho do motor, ainda com a imagem no buffer.
function capturar(w, h, cb) {
  if (window.__teste) return cb(null);
  requestAnimationFrame(() => {
    try {
      const src = document.getElementById('c'); if (!src || !src.width) return cb(null);
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
      const ar = w / h, sw = Math.min(src.width, src.height * ar), sh = sw / ar;
      g.drawImage(src, (src.width - sw) / 2, (src.height - sh) / 2, sw, sh, 0, 0, w, h);
      const px = g.getImageData(0, 0, w, h).data; let soma = 0;
      for (let i = 0; i < px.length; i += 160) soma += px[i] + px[i + 1] + px[i + 2];
      cb(soma > 40 ? cv : null);
    } catch (e) { cb(null); }
  });
}

// ---------------------------------------------------------------- reinício instantâneo
let segura = null, armado = 0, anelEl = null;
function podeReiniciar(fonte) {
  const S = C.S; if (!S || C.mode !== 'jogo' || S.fim || (S.modo && S.modo.umaVida)) return false;
  const a = document.activeElement; if (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return false;
  return C.ui == null || C.ui === 'morte' || (fonte === 'pad' && C.ui === 'diario');
}
function anel(k) {
  if (!anelEl) {
    anelEl = document.createElement('div'); anelEl.id = 'p3-anel'; anelEl.hidden = true;
    anelEl.innerHTML = '<svg viewBox="0 0 60 60"><circle class="f" cx="30" cy="30" r="26"/><circle class="v" cx="30" cy="30" r="26"/></svg><span></span>';
    document.body.appendChild(anelEl);
  }
  if (k == null) { anelEl.hidden = true; return; }
  anelEl.hidden = false;
  anelEl.querySelector('.v').style.strokeDashoffset = (163.4 * (1 - Math.min(1, k))).toFixed(1);
  anelEl.querySelector('span').textContent = TX().reinicio.segurando;
}
function soltar() { segura = null; anel(null); }
function completarReinicio() {
  const T = TX().reinicio;
  if (!corrida() && performance.now() > armado) { armado = performance.now() + 4000; C.toast(T.confirmar); return; }
  armado = 0;
  P3.zerando = true;
  let ok = false; try { ok = !!(C.recomecarCap && C.recomecarCap()); } catch (e) { console.warn('reinício', e); }
  P3.zerando = false;
  if (!ok) { C.toast(T.semSnap); return; }
  const n = noite(); if (n) { n.reinicios++; n.seq = 0; }
  const m = mudar(x => { x.reinicios = (x.reinicios || 0) + 1; });
  if (m.reinicios >= 20) A.conquista('outra_vez');
  C.toast(T.feito);
}
function holdTick() {
  if (!C) return;
  const now = performance.now();
  // SELECT do controle
  let pad = false;
  try { if (navigator.getGamepads) for (const g of navigator.getGamepads()) if (g && g.connected && g.buttons[8] && g.buttons[8].pressed) pad = true; } catch (e) {}
  if (pad && !segura && podeReiniciar('pad')) segura = { fonte: 'pad', t0: now };
  if (segura && segura.fonte === 'pad' && !pad) soltar();
  if (!segura) return;
  if (!podeReiniciar(segura.fonte)) { soltar(); return; }
  const dur = segura.fonte === 'toque' ? 1500 : 1000, k = (now - segura.t0) / dur;
  if (now - segura.t0 > 180) anel(k);
  if (k >= 1) { soltar(); completarReinicio(); }
}

// ---------------------------------------------------------------- segredos do título
const ANA_CONTA = [];
let tituloOrig = null;
function lembrar(txt) { const el = $('#t-memoria'); if (el) el.textContent = txt; }
function segredo(id) { const m = mudar(x => { x.seg = x.seg || {}; x.seg[id] = Date.now(); }); if (['davi', 'ana', 'ano'].every(k => m.seg[k])) A.conquista('nomes_ditos'); }
function tecla(buf) {
  const T = TX().titulo;
  if (buf.endsWith('davi')) { som(s => { s.fitaClique(); s.sussurros(3); }); lembrar(T.davi); segredo('davi'); return true; }
  if (buf.endsWith('ana') && !ANA_CONTA.length) {
    segredo('ana'); const sub = $('#t-sub'), antes = sub.textContent;
    T.ana.forEach((n, i) => ANA_CONTA.push(setTimeout(() => { sub.textContent = n; som(s => i === 9 ? s.susto() : s.tique()); if (i === 9) { $('#title').classList.add('p3-espelho'); lembrar(T.anaFim); setTimeout(() => { $('#title').classList.remove('p3-espelho'); sub.textContent = antes; ANA_CONTA.length = 0; }, 5000); } }, i * 750)));
    return true;
  }
  if (buf.endsWith('1979')) {
    segredo('ano'); const h1 = $('#t-titulo'); if (tituloOrig == null) tituloOrig = h1.innerHTML;
    h1.innerHTML = T.ano; h1.classList.add('p3-placa'); lembrar(T.anoMem); som(s => s.estatica(1.2));
    setTimeout(() => { h1.innerHTML = tituloOrig; h1.classList.remove('p3-placa'); }, 8000);
    return true;
  }
  if (buf.endsWith('orelhao')) { orelhao(); return true; }
  if (buf.endsWith('moacir')) {
    mudar(x => { x.ouvido = true; }); som(s => { s.silencio(2.5, .02); s.estalo({ x: C.P.pos.x + 1.5, y: 1.6, z: C.P.pos.z }, .7); });
    lembrar(TX().titulo.moacir); extrasTitulo(); return true;
  }
  return false;
}
let orelhaoTO = null;
function orelhao() {
  const T = TX().titulo; if ($('#p3-orelhao')) return;
  const b = document.createElement('button'); b.id = 'p3-orelhao'; b.textContent = T.orelhaoTocando;
  ($('#t-memoria') || $('#t-sub')).insertAdjacentElement('afterend', b);
  let n = 0; const tocar = () => { som(s => s.orelhao({ x: C.P.pos.x + 3, y: 1.2, z: C.P.pos.z - 2 })); if (++n < 6 && $('#p3-orelhao')) orelhaoTO = setTimeout(tocar, 2600); else if ($('#p3-orelhao')) b.remove(); };
  tocar();
  b.onclick = () => {
    clearTimeout(orelhaoTO); b.remove();
    let nome = ''; try { nome = JSON.parse(localStorage.getItem('hora-silencio-nome') || '""'); } catch (e) {}
    nome = String(nome || '').trim() || T.orelhaoSemNome;
    const ult = A.ls.get('hora-silencio-ultima', null), fin = A.stats().finais || {};
    const tipo = fin.verdadeiro ? 'verdadeiro' : fin.silencio ? 'silencio' : fin.comum ? 'comum' : 'nenhum';
    som(s => { s.estatica(2.5); s.clique(); });
    const fala = T.orelhao[ult && ult.tipo === 'final' && T.orelhao[ult.final] ? ult.final : tipo].replace('{nome}', nome); lembrar(fala);
    setTimeout(() => { const el = $('#t-memoria'); if (!el || el.textContent !== fala) return; som(s => { for (let i = 0; i < 3; i++) setTimeout(() => { try { s.tique(); } catch (e) {} }, i * 420); }); el.textContent += ' ' + T.orelhaoFim; }, 6500);
    A.conquista('cobrar');
  };
}
// três teclas juntas: 1, 9 e 7
const apertadas = new Set(); let comboT = 0;
function comboTick() {
  if (!noTitulo()) { comboT = 0; return; }
  const tem = d => apertadas.has('Digit' + d) || apertadas.has('Numpad' + d);
  if (tem(1) && tem(9) && tem(7)) {
    if (!comboT) comboT = performance.now();
    else if (performance.now() - comboT > 1500 && !mem().negativo) {
      mudar(x => { x.negativo = true; }); som(s => { s.sino(.4); s.estatica(1); }); lembrar(TX().titulo.negativo); A.conquista('negativo'); extrasTitulo();
      try { const g = navigator.getGamepads && [...navigator.getGamepads()].find(x => x && x.vibrationActuator); if (g) g.vibrationActuator.playEffect('dual-rumble', { duration: 300, strongMagnitude: .6 }); } catch (e) {}
    }
  } else comboT = 0;
}
// parado no título: a visita do portão
let ultimaMexida = performance.now(), visita = 0, subVisita = null;
function mexeu() {
  ultimaMexida = performance.now();
  if (visita && visita < 4) { const sub = $('#t-sub'); if (subVisita != null && sub) sub.textContent = subVisita; lembrar(TX().titulo.visitaSome); }
  visita = 0;
}
function visitaTick() {
  if (!noTitulo() || window.__teste || document.hidden) { if (!noTitulo()) { ultimaMexida = performance.now(); visita = 0; } return; }
  const t = (performance.now() - ultimaMexida) / 1000, T = TX().titulo, sub = $('#t-sub');
  if (visita === 0 && t > 60) { visita = 1; subVisita = sub.textContent; sub.textContent = T.visita[0]; som(s => s.portaoVento && s.portaoVento()); }
  else if (visita === 1 && t > 95) { visita = 2; sub.textContent = T.visita[1]; som(s => s.passo(.4, 'terra', true)); }
  else if (visita === 2 && t > 120) {
    visita = 4; sub.textContent = T.visita[2]; mao(); som(s => { s.impacto(.5); s.coracao(1); });
    A.conquista('visita'); setTimeout(() => { if (subVisita != null) sub.textContent = subVisita; visita = 0; ultimaMexida = performance.now(); }, 7000);
  }
}
function mao() {
  let el = $('#p3-mao');
  if (!el) {
    el = document.createElement('div'); el.id = 'p3-mao';
    const cv = document.createElement('canvas'); cv.width = 260; cv.height = 320; const g = cv.getContext('2d');
    g.fillStyle = 'rgba(28,20,16,.78)'; g.filter = 'blur(2px)';
    const oval = (x, y, rx, ry, a) => { g.beginPath(); g.ellipse(x, y, rx, ry, a, 0, Math.PI * 2); g.fill(); };
    oval(130, 210, 62, 74, 0); oval(62, 160, 15, 44, -.5); oval(98, 92, 14, 52, -.12); oval(132, 80, 14, 58, 0); oval(165, 92, 13, 52, .12); oval(194, 120, 11, 42, .3);
    g.filter = 'none'; for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * .25})`; g.fillRect(40 + Math.random() * 190, 30 + Math.random() * 270, 2, 2); }
    el.appendChild(cv); document.body.appendChild(el);
  }
  el.classList.add('on'); setTimeout(() => el.classList.remove('on'), 4500);
}
// celular de cabeça para baixo
let avessoT = 0, avesso = false;
function orientacao(e) {
  if (!C || e.beta == null) return;
  const virado = Math.abs(e.beta) > 150;
  if (!noTitulo()) { avessoT = 0; return; }
  if (virado && !avesso) {
    if (!avessoT) avessoT = performance.now();
    else if (performance.now() - avessoT > 2000) {
      avesso = true; const T = TX().titulo, h1 = $('#t-titulo'); if (tituloOrig == null) tituloOrig = h1.innerHTML;
      h1.innerHTML = T.avessoTitulo; $('#title').classList.add('p3-avesso'); $('#t-sub').dataset.p3 = $('#t-sub').textContent; $('#t-sub').textContent = T.avessoSub;
      som(s => s.sussurros(1.5)); A.conquista('avesso'); segredo('avesso');
    }
  } else if (!virado) {
    avessoT = 0;
    if (avesso && Math.abs(e.beta) < 110) { avesso = false; $('#t-titulo').innerHTML = tituloOrig; $('#title').classList.remove('p3-avesso'); if ($('#t-sub').dataset.p3) $('#t-sub').textContent = $('#t-sub').dataset.p3; som(s => s.sinoLonge()); }
  }
}
// favicon: com a aba escondida no meio da noite, o sino vira um olho
let iconeOrig = null, olhoTO = null;
function iconeOlho(aberto) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 32; const g = cv.getContext('2d');
  g.fillStyle = '#050505'; g.fillRect(0, 0, 32, 32);
  if (aberto) { g.fillStyle = '#d9ccae'; g.beginPath(); g.ellipse(16, 16, 14, 8, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#8e1b14'; g.beginPath(); g.arc(16, 16, 5.5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(16, 16, 2.4, 0, Math.PI * 2); g.fill(); }
  else { g.strokeStyle = '#d9ccae'; g.lineWidth = 2; g.beginPath(); g.moveTo(3, 16); g.quadraticCurveTo(16, 22, 29, 16); g.stroke(); }
  return cv.toDataURL('image/png');
}
function icone(href) { const l = document.querySelector('link[rel="icon"]'); if (!l) return; if (iconeOrig == null) iconeOrig = { href: l.getAttribute('href'), type: l.getAttribute('type') }; l.setAttribute('type', href ? 'image/png' : iconeOrig.type); l.setAttribute('href', href || iconeOrig.href); }
let escondidaT = 0, abandonoPend = false;
function visibilidade() {
  if (document.hidden) {
    escondidaT = Date.now();
    if (C.mode === 'jogo' && C.S && !C.S.fim) { let ab = true; const piscar = () => { icone(iconeOlho(ab)); ab = !ab; olhoTO = setTimeout(piscar, ab ? 3200 : 260); }; piscar(); }
  } else {
    clearTimeout(olhoTO); if (iconeOrig) icone(null);
    if (escondidaT && C.mode === 'jogo' && C.S && !C.S.fim && Date.now() - escondidaT > 180000) abandonoPend = true;
    escondidaT = 0;
  }
}
// duas abas
let viuOcupada = false;
function abas() {
  try {
    const bc = new BroadcastChannel('hora-silencio-abas');
    bc.onmessage = e => {
      if (e.data === 'ola' && C.mode === 'jogo' && C.S && !C.S.fim) { bc.postMessage('ocupada'); som(s => s.sinoLonge()); }
      else if (e.data === 'ocupada' && !viuOcupada) { viuOcupada = true; const sub = $('#t-sub'); if (sub) sub.textContent = TX().titulo.duasAbas; A.conquista('duas_lias'); }
    };
    bc.postMessage('ola');
  } catch (e) {}
}
// console do navegador
function consoleSecreto() {
  const T = TX().console;
  try { console.log('%c' + T.bilhete, 'font-family:"Special Elite",Courier,monospace;font-size:15px;color:#2a2119;background:#d9ccae;padding:10px 14px;border-left:6px solid #8e1b14'); } catch (e) {}
  window.ouvir = () => { som(s => { s.fitaClique(); s.chiadoFita(true); setTimeout(() => { try { s.chiadoFita(false); s.fitaClique(); } catch (e) {} }, 5000); s.sussurros(3); }); A.conquista('outro_lado'); segredo('console'); return T.ouvir; };
}
// imprimir no título: a ficha de matrícula
function ficha() {
  let el = $('#p3-ficha'); const F = TX().ficha;
  if (!el) { el = document.createElement('div'); el.id = 'p3-ficha'; document.body.appendChild(el); }
  let nome = ''; try { nome = JSON.parse(localStorage.getItem('hora-silencio-nome') || '""'); } catch (e) {}
  el.innerHTML = `<div class="f">foto 3x4</div><h1>${F.titulo}</h1><p>${F.ano}</p>` + F.campos.map((c, i) => `<div class="l">${c}: ${i === 0 ? esc(nome || '________________') : i === 4 ? F.obs : ''}</div>`).join('') + `<div class="c">${F.carimbo}</div><p class="r">${F.rodape}</p>`;
}
function antesImprimir() { if (C && C.mode === 'titulo') { ficha(); document.body.classList.add('p3-imprimir'); } }
function depoisImprimir() { if (document.body.classList.contains('p3-imprimir')) { document.body.classList.remove('p3-imprimir'); A.conquista('vaga'); segredo('ficha'); } }

// ---------------------------------------------------------------- polaroides e rota
const fotos = () => A.ls.get(FOTOS_K, {}) || {};
let fotoCap = -1, fotoT = 0, fotoTem = true;
function fotoTick(dt) {
  const S = C.S; if (window.__teste || S.replay) return;
  const c = R().capitulos[S.chapter]; if (!c) return;
  if (fotoCap !== S.chapter) { fotoCap = S.chapter; fotoT = 0; fotoTem = !!fotos()[c.id]; } // lê o localStorage uma vez por capítulo, não a cada quadro
  if (fotoT < 0 || fotoTem) return;
  if ((fotoT += dt) < 4 || S.hidden || C.ui) return;
  fotoT = -1;
  capturar(320, 180, cv => {
    if (!cv) { fotoT = 2; return; }
    try { const f = fotos(); f[c.id] = { img: cv.toDataURL('image/jpeg', .6), t: Date.now() }; A.ls.set(FOTOS_K, f); fotoTem = true; } catch (e) {}
  });
}
let queimada = null;
function polaroideQueimada() {
  if (queimada) return queimada;
  const cv = document.createElement('canvas'); cv.width = 172; cv.height = 116; const g = cv.getContext('2d');
  g.fillStyle = '#0a0806'; g.fillRect(0, 0, 172, 116);
  const gr = g.createRadialGradient(86, 58, 10, 86, 58, 100); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.6, 'rgba(90,40,10,.35)'); gr.addColorStop(1, 'rgba(160,80,20,.8)');
  g.fillStyle = gr; g.fillRect(0, 0, 172, 116);
  for (let i = 0; i < 60; i++) { g.fillStyle = `rgba(${200 + Math.random() * 55},${90 + Math.random() * 60},20,${Math.random() * .3})`; g.fillRect(Math.random() * 172, Math.random() < .5 ? Math.random() * 12 : 104 + Math.random() * 12, 3, 2); }
  return (queimada = cv.toDataURL('image/png'));
}
function pola(c, i, ok) {
  const f = fotos()[c.id], rot = ((i * 37) % 7) - 3;
  if (!ok) return `<figure class="p3-pola" style="--r:${rot}deg;filter:brightness(.6)"><img src="${polaroideQueimada()}" alt=""><figcaption>???</figcaption></figure>`;
  if (!f) return '';
  const d = new Date(f.t), data = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`;
  return `<figure class="p3-pola" style="--r:${rot}deg"><img src="${f.img}" alt="foto do ${esc(c.titulo)}"><figcaption>${data}</figcaption></figure>`;
}
// trilha da noite: posição e estado a cada segundo (andando, parada, escondida, perseguida)
let trilha = [], trilhaCap = -1, trilhaT = 0, trilhaAnt = null;
function trilhaTick(dt) {
  const S = C.S, P = C.P, M = C.M;
  if (trilhaCap !== S.chapter) { trilha = []; trilhaCap = S.chapter; trilhaAnt = null; }
  if ((trilhaT -= dt) > 0 || trilha.length > 4500) return;
  trilhaT = 1;
  const x = Math.round(P.pos.x * 10), z = Math.round(P.pos.z * 10);
  const parada = trilhaAnt && Math.hypot(x - trilhaAnt[0], z - trilhaAnt[1]) < 4;
  const e = S.hidden ? 2 : M && M.ativo && M.state === 'caca' ? 3 : parada ? 1 : 0;
  trilha.push(x, z, e); trilhaAnt = [x, z];
}
function gravarRota(c) {
  const S = C.S, W = C.W; if (S.replay || trilha.length < 9 || !W || !W.salas) return;
  const salas = W.salas.filter(r => !r.fora).map(r => [Math.round(r.x0), Math.round(r.z0), Math.round(r.x1), Math.round(r.z1)]);
  let rec = null; try { const m = JSON.parse(localStorage.getItem(MUNDO_K) || '{}'); const r = (m.rastro || {})[c.id]; if (r && r.mapa === W.mapa) rec = r.pts; } catch (e) {}
  try { const rs = A.ls.get(ROTAS_K, {}) || {}; rs[c.id] = { mapa: W.mapa, salas, pts: trilha.slice(), rec, t: Math.round(S.capT) }; A.ls.set(ROTAS_K, rs); } catch (e) {}
}
function verRota(cid) {
  const r = (A.ls.get(ROTAS_K, {}) || {})[cid]; if (!r) return;
  const cv = document.createElement('canvas'); cv.width = 900; cv.height = 600; const g = cv.getContext('2d');
  let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9;
  const inc = (x, z) => { x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); };
  for (const s of r.salas) { inc(s[0], s[1]); inc(s[2], s[3]); }
  for (let i = 0; i < r.pts.length; i += 3) inc(r.pts[i] / 10, r.pts[i + 1] / 10);
  const k = Math.min(860 / Math.max(1, x1 - x0), 560 / Math.max(1, z1 - z0)), ox = (900 - (x1 - x0) * k) / 2, oz = (600 - (z1 - z0) * k) / 2;
  const X = x => ox + (x - x0) * k, Z = z => oz + (z - z0) * k;
  g.fillStyle = '#060504'; g.fillRect(0, 0, 900, 600);
  for (const s of r.salas) { g.fillStyle = '#14110d'; g.strokeStyle = '#3a3228'; g.lineWidth = 1.5; g.fillRect(X(s[0]), Z(s[1]), (s[2] - s[0]) * k, (s[3] - s[1]) * k); g.strokeRect(X(s[0]), Z(s[1]), (s[2] - s[0]) * k, (s[3] - s[1]) * k); }
  if (r.rec && r.rec.length > 3) { g.setLineDash([4, 6]); g.strokeStyle = 'rgba(207,195,166,.55)'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i < r.rec.length; i += 2) { const px = X(r.rec[i] / 10), pz = Z(r.rec[i + 1] / 10); i ? g.lineTo(px, pz) : g.moveTo(px, pz); } g.stroke(); g.setLineDash([]); }
  const COR = ['#6fa35a', '#c9a75a', '#b0362a', '#e0603a'];
  g.lineWidth = 3.5; g.lineCap = 'round';
  for (let i = 3; i < r.pts.length; i += 3) { g.strokeStyle = COR[r.pts[i + 2]] || COR[0]; g.beginPath(); g.moveTo(X(r.pts[i - 3] / 10), Z(r.pts[i - 2] / 10)); g.lineTo(X(r.pts[i] / 10), Z(r.pts[i + 1] / 10)); g.stroke(); }
  g.fillStyle = '#e9dfc8'; g.beginPath(); g.arc(X(r.pts[0] / 10), Z(r.pts[1] / 10), 6, 0, 7); g.fill();
  const ov = document.createElement('div'); ov.className = 'p3-ov';
  ov.innerHTML = `<div style="font-family:'IM Fell English SC';font-size:24px;letter-spacing:.1em">Rota da última vez · ${mmss(r.t)}</div>`;
  ov.appendChild(cv);
  const leg = document.createElement('div'); leg.className = 'p3-leg';
  leg.innerHTML = `<span><i style="background:${COR[0]}"></i>andando</span><span><i style="background:${COR[1]}"></i>parada</span><span><i style="background:${COR[2]}"></i>escondida</span><span><i style="background:${COR[3]}"></i>perseguida</span>${r.rec ? '<span><i style="background:repeating-linear-gradient(90deg,#cfc3a6 0 3px,transparent 3px 6px)"></i>rota do recorde</span>' : ''}`;
  ov.appendChild(leg);
  const b = document.createElement('button'); b.className = 'btn'; b.textContent = 'Fechar'; b.onclick = () => ov.remove(); ov.appendChild(b);
  ov.addEventListener('keydown', e => { if (e.code === 'Escape') { e.stopPropagation(); ov.remove(); } });
  document.body.appendChild(ov); b.focus();
}

// ---------------------------------------------------------------- foto do último instante
let instante = null;
function capturarMorte(quem) {
  instante = null;
  const S = C.S, cap = (R().capitulos[S.chapter] || {}).titulo || '', t = S.tempo;
  setTimeout(() => capturar(640, 360, cv => {
    if (!cv) return;
    const g = cv.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < 360; y += 3) g.fillRect(0, y, 640, 1);
    g.font = '22px "Special Elite", monospace'; g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 4;
    g.fillStyle = '#e9e4d6'; g.fillText('PLAY ▶', 22, 36);
    g.fillStyle = '#f0a83a'; g.fillText(hoje1994(), 22, 336); g.fillText(horaNoite(t), 640 - 150, 336);
    g.font = '14px "Special Elite", monospace'; g.fillStyle = '#cfc3a6'; g.fillText(cap.toUpperCase(), 640 - 22 - g.measureText(cap.toUpperCase()).width, 36);
    instante = cv;
    const b = $('#p3-instante'); if (b) b.hidden = false;
  }), 380);
}
function salvarInstante() {
  if (!instante) return;
  try { const l = document.createElement('a'); l.href = instante.toDataURL('image/png'); l.download = 'ultimo-instante-hora-do-silencio.png'; document.body.appendChild(l); l.click(); l.remove(); } catch (e) { return; }
  const b = $('#p3-instante'); if (b) { b.textContent = TX().morte.instanteOk; setTimeout(() => b.textContent = TX().morte.instante, 1800); }
  A.conquista('ultimo_instante');
}

// ---------------------------------------------------------------- modo Ouvido do Inspetor e filtros
let ouvidoEl = null, filtroEl = null, pulso = 0, estaloT = 0, estaloPronto = 0, passoT = 0, mAnt = null;
function ouvidoTick(dt) {
  const S = C.S, on = !!(S && S.modo && S.modo.ouvido) && C.mode === 'jogo' && !S.fim;
  if (!ouvidoEl) { ouvidoEl = document.createElement('div'); ouvidoEl.id = 'p3-ouvido'; ouvidoEl.hidden = true; $('#c').insertAdjacentElement('afterend', ouvidoEl); }
  if (ouvidoEl.hidden === on) ouvidoEl.hidden = !on;
  if (!on) return;
  const P = C.P, M = C.M;
  pulso = Math.max(pulso * Math.exp(-dt * 2.6), Math.min(1, (P.noiseR || 0) / 10) * .75);
  if (M && M.ativo) {
    const d = M.pos.distanceTo(P.pos), mov = mAnt ? Math.hypot(M.pos.x - mAnt.x, M.pos.z - mAnt.z) : 0; mAnt = { x: M.pos.x, z: M.pos.z };
    if ((passoT -= dt) <= 0 && mov > .01 && d < 22) { passoT = .55; pulso = Math.max(pulso, .5 * (1 - d / 22)); }
  }
  if (estaloT > 0) { estaloT -= dt; pulso = Math.max(pulso, .9); }
  ouvidoEl.style.opacity = (.965 - pulso * .62).toFixed(3);
}
function estalo() {
  const S = C.S; if (!jogoAtivo() || !(S.modo && S.modo.ouvido) || performance.now() < estaloPronto) return;
  estaloT = .4; estaloPronto = performance.now() + 900; som(s => s.clique());
  try { C.emitNoise && C.emitNoise(C.P.pos.x, C.P.pos.z, 7, true); } catch (e) {}
}
function filtroTick() {
  const f = C.OPT.filtro && C.OPT.filtro !== 'nada' && C.mode !== 'titulo' && filtroLiberado(C.OPT.filtro) ? C.OPT.filtro : '';
  if (!filtroEl) {
    if (!f) return;
    filtroEl = document.createElement('div'); filtroEl.id = 'p3-filtro'; filtroEl.innerHTML = '<div class="p3-track"></div><div class="p3-play"></div><div class="p3-data"></div>';
    (ouvidoEl || $('#c')).insertAdjacentElement('afterend', filtroEl);
  }
  filtroEl.hidden = !f; if (!f) return;
  if (filtroEl.className !== f) filtroEl.className = f;
  const S = C.S, t = S ? S.tempo : 0;
  filtroEl.querySelector('.p3-play').innerHTML = f === 'vigia' ? '<b>●</b> REC · CAM 03' : 'PLAY ▶';
  filtroEl.querySelector('.p3-data').textContent = f === 'vigia' ? `14/03/1979 ${horaNoite(t)}` : `14 MAR 1979  ${horaNoite(t).slice(0, 5)}`;
}
function filtroLiberado(f) { return f === 'negativo' ? !!mem().negativo : (f === 'fita' || f === 'vigia') ? algumFinal() : false; }

// ---------------------------------------------------------------- título: botões e extras
function semanaId(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), dia = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dia); const ano = t.getUTCFullYear();
  const sem = Math.ceil(((t - Date.UTC(ano, 0, 1)) / 864e5 + 1) / 7);
  return { ano, sem, id: ano + '-' + sem };
}
function sementeSemana(w) { let h = 2166136261; for (const ch of 'sao-lazaro-semana-' + w.id) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return ((h % 2176782334) + 1).toString(36).toUpperCase().padStart(6, '0'); }
let semanaPend = 0;
function extrasTitulo() {
  const ex = $('#t-extras'); if (!ex) return;
  if (!$('#l-ouvido')) {
    const l = document.createElement('label'); l.id = 'l-ouvido'; l.title = 'A tela fica quase preta: você só vê o que faz barulho. N estala os dedos.';
    l.innerHTML = '<input type="checkbox" id="o-ouvido"> Ouvido do Inspetor'; ex.appendChild(l);
    const cb = l.querySelector('input'); cb.checked = !!C.OPT.ouvido; cb.onchange = () => { C.OPT.ouvido = cb.checked; C.salvarOpt(); };
  }
  $('#l-ouvido').hidden = !mem().ouvido;
  if (!$('#l-filtro')) {
    const F = TX().filtros, l = document.createElement('label'); l.id = 'l-filtro'; l.title = 'Filtro de imagem para rejogar (pesa um pouco em computador fraco)';
    l.innerHTML = `Filtro <select id="o-filtro">${Object.entries(F).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select>`; ex.appendChild(l);
    const sel = l.querySelector('select'); sel.value = C.OPT.filtro || 'nada'; sel.onchange = () => { C.OPT.filtro = sel.value; C.salvarOpt(); };
  }
  const sel = $('#o-filtro'); for (const o of sel.options) o.hidden = o.value !== 'nada' && !filtroLiberado(o.value);
  $('#l-filtro').hidden = ![...sel.options].some(o => o.value !== 'nada' && !o.hidden);
  if (sel.selectedOptions[0] && sel.selectedOptions[0].hidden) sel.value = 'nada';
  if (!$('#l-relogio') && $('#o-crono')) {
    const l = document.createElement('label'); l.id = 'l-relogio'; l.title = 'Qual relógio aparece grande no cronômetro do HUD';
    l.innerHTML = 'Relógio <select id="o-relogio"><option value="jogo">tempo de jogo</option><option value="real">tempo real</option></select>';
    ($('#l-cat') || $('#o-crono').closest('label')).insertAdjacentElement('afterend', l);
    const s2 = l.querySelector('select'); s2.value = C.OPT.relogio || 'jogo'; s2.onchange = () => { C.OPT.relogio = s2.value; C.salvarOpt(); };
    const at = () => { l.hidden = !$('#o-crono').checked; }; $('#o-crono').addEventListener('change', at); at();
  }
}
function botaoSemana() {
  let b = $('#b-semana');
  if (!b && $('#b-novo')) {
    b = document.createElement('button'); b.className = 'btn'; b.id = 'b-semana'; b.textContent = 'Noite da Semana';
    $('#b-novo').insertAdjacentElement('afterend', b);
    b.onclick = () => {
      const w = semanaId(), inp = $('#o-desafio'); if (!inp) return;
      inp.value = sementeSemana(w) + '-N'; semanaPend = performance.now();
      $('#b-novo').click();
    };
  }
  if (!b) return;
  const w = semanaId(), rec = (mem().semana || {})[w.id], T = TX().titulo;
  b.title = T.semana.replace('{s}', w.sem) + (rec ? T.semanaRec.replace('{t}', mmss(rec)) : '');
  if (location.hash === '#semana') b.style.color = '#c9a75a';
}
function cemPct() {
  const Rr = R(), cq = A.ls.get(C.KEYS.CONQ_KEY, {}) || {}, ac = A.acervo(), caps = A.ls.get(C.KEYS.CAPS_KEY, {}) || {}, st = A.stats(), PE = TX().pesos;
  const conqs = Rr.conquistas.filter(x => x.id !== 'internato_inteiro'), lore = [...Rr.notas, ...Rr.paginas, ...Rr.fitas];
  const LP = (Rr.progressao.mundo || {}).lugaresPecas || {}, LN = (Rr.progressao.mundo || {}).lugaresNomes || {};
  const finais = ['comum', 'silencio', 'verdadeiro'], SEL = [['intocada', 'Intocada'], ['rapida', 'Rápida'], ['invisivel', 'Invisível'], ['silenciosa', 'Silenciosa']];
  const info = id => (Rr.progressao.capitulos || {})[id] || {};
  const partes = [
    { k: 'conquistas', nome: 'Conquistas', tem: conqs.filter(x => cq[x.id]).length, tot: conqs.length,
      lista: conqs.map(x => cq[x.id] ? esc(x.nome) : x.secreta ? '<span class="p3-falta">???</span>' : `<span class="p3-falta">${esc(x.nome)}</span>`).join(' · ') },
    { k: 'acervo', nome: 'Notas, páginas e fitas', tem: lore.filter(x => ac[x.id]).length, tot: lore.length,
      lista: Object.entries(LP).map(([m, ids]) => { const t = ids.filter(id => ac[id]).length; return `${esc(LN[m] || m)}: ${t}/${ids.length}${t < ids.length ? ' <span class="p3-falta">· ainda tem algo aqui</span>' : ' ✦'}`; }).join('<br>') },
    { k: 'ranks', nome: 'Capítulos em S', tem: Rr.capitulos.filter(c => (caps[c.id] || {}).rank === 'S').length, tot: Rr.capitulos.length,
      lista: Rr.capitulos.map((c, i) => `${ROM[i]}: ${(caps[c.id] || {}).rank || '<span class="p3-falta">???</span>'}`).join(' · ') },
    { k: 'desafios', nome: 'Desafios secretos', tem: Rr.capitulos.filter(c => (caps[c.id] || {}).desafio).length, tot: Rr.capitulos.length,
      lista: Rr.capitulos.map((c, i) => `${ROM[i]}: ${(caps[c.id] || {}).desafio ? esc((info(c.id).desafio || {}).nome || 'cumprido') : '<span class="p3-falta">???</span>'}`).join(' · ') },
    { k: 'finais', nome: 'Finais', tem: finais.filter(f => (st.finais || {})[f]).length, tot: finais.length,
      lista: finais.map(f => (st.finais || {})[f] ? esc(((Rr.finais[f] || {}).titulo || f).replace('FINAL: ', '')) : '<span class="p3-falta">???</span>').join(' · ') },
    { k: 'selos', nome: 'Selos de capítulo', tem: Rr.capitulos.reduce((n, c) => n + SEL.filter(([s]) => ((caps[c.id] || {}).selos || {})[s]).length, 0), tot: Rr.capitulos.length * 4,
      lista: Rr.capitulos.map((c, i) => `${ROM[i]}: ${SEL.map(([s, n]) => ((caps[c.id] || {}).selos || {})[s] ? n : '<span class="p3-falta">—</span>').join(' ')}`).join('<br>') }
  ];
  let pct = 0; for (const p of partes) pct += (PE[p.k] || 0) * (p.tot ? p.tem / p.tot : 0);
  pct = Math.floor(pct * 10) / 10;
  if (pct >= 100) A.conquista('internato_inteiro');
  return { pct, partes };
}
function giz() {
  if ($('#p3-giz') || !$('#title')) return;
  const cv = document.createElement('canvas'); cv.id = 'p3-giz'; cv.width = 220; cv.height = 140; const g = cv.getContext('2d');
  g.strokeStyle = 'rgba(235,230,215,.85)'; g.lineWidth = 2.2; g.lineCap = 'round';
  const tr = (pts) => { g.beginPath(); pts.forEach(([x, y], i) => { x += Math.random() * 1.6 - .8; y += Math.random() * 1.6 - .8; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.stroke(); };
  const boneco = (x, alto) => { const h = alto ? 0 : 16; g.beginPath(); g.arc(x, 30 + h, alto ? 12 : 10, 0, 7); g.stroke(); tr([[x, 42 + h], [x, 90]]); tr([[x, 90], [x - 12, 124]]); tr([[x, 90], [x + 12, 124]]); return 56 + h; };
  const y1 = boneco(70, true), y2 = boneco(150, false);
  tr([[70, y1], [50, y1 + 26]]); tr([[150, y2], [170, y2 + 24]]); tr([[70, y1], [110, y1 + 14], [150, y2]]);
  g.font = '13px "Special Elite", monospace'; g.fillStyle = 'rgba(235,230,215,.7)'; g.fillText('LIA', 58, 138); g.fillText('DAVI', 136, 138);
  $('#title').appendChild(cv);
}
let foraTxt = null, foraMostrou = false;
function titulo() {
  if (!C) return;
  css(); botaoSemana(); extrasTitulo();
  const T = TX().titulo, sub = $('#t-sub');
  if (navigator.onLine === false) { sub.textContent = T.semSinal; A.conquista('linha_cortada'); }
  if (foraTxt && !foraMostrou) { foraMostrou = true; const el = $('#t-memoria'); if (el) el.textContent = foraTxt + (el.textContent ? ' · ' + el.textContent : ''); }
  let pe = $('#p3-pct');
  if (!pe && $('#t-memoria')) { pe = document.createElement('div'); pe.id = 'p3-pct'; $('#t-memoria').insertAdjacentElement('afterend', pe); }
  const st = A.stats();
  if (pe) {
    if ((st.partidas || 0) >= 1) { const c = cemPct(), f = mem().fosforos || 0; pe.textContent = `${String(c.pct).replace('.', ',')}% do internato${f ? ` · ${f} ${f === 1 ? 'fósforo' : 'fósforos'}` : ''}`; if (c.pct >= 100) pe.textContent += ' · ' + T.cem; }
    else pe.textContent = '';
  }
  if ((A.ls.get(C.KEYS.CONQ_KEY, {}) || {}).internato_inteiro) giz();
  if (location.hash === '#semana') { const w = semanaId(); const el = $('#t-memoria'); if (el && !el.textContent.includes('Semana')) el.textContent = T.semana.replace('{s}', w.sem); }
}
function difExtra(dif) {
  const u = mem().ultima; if (!u || dif !== 'normal' || u.dif !== 'normal' || (u.mortes || 0) < 12) return '';
  return ' ' + TX().titulo.dificil.replace('{n}', u.mortes);
}

// ---------------------------------------------------------------- conquistas (painel)
function riscar(id) {
  const m = mem(); if ((m.fosforos || 0) <= 0) { C.toast && C.toast('Sem fósforos. Termine um capítulo para ganhar um.'); return false; }
  mudar(x => { x.fosforos = (x.fosforos || 0) - 1; x.charadas = x.charadas || {}; x.charadas[id] = true; });
  som(s => { s.estalo({ x: C.P.pos.x, y: 1.5, z: C.P.pos.z }, .4); }); return true;
}
let filtroConq = 'todas';
function painelConquistas(f) {
  if (f) filtroConq = f;
  const Rr = R(), c = A.ls.get(C.KEYS.CONQ_KEY, {}) || {}, n = Rr.conquistas.filter(x => c[x.id]).length, m = mem();
  const pct = Math.round(n / Rr.conquistas.length * 100), visto = m.conqVisto || 0, fos = m.fosforos || 0, ch = m.charadas || {};
  const data = t => { try { return new Date(t).toLocaleDateString('pt-BR'); } catch (e) { return ''; } };
  const abas = [['todas', 'Todas'], ['feitas', 'Destravadas'], ['faltam', 'Faltando'], ['secretas', 'Secretas']];
  const filtra = x => filtroConq === 'feitas' ? c[x.id] : filtroConq === 'faltam' ? !c[x.id] : filtroConq === 'secretas' ? x.secreta : true;
  const novas = Rr.conquistas.filter(x => typeof c[x.id] === 'number' && c[x.id] > visto).length;
  let h = `<p class="pn-resumo">${n} de ${Rr.conquistas.length} · ${pct}%${novas ? ` · ${novas} nova${novas > 1 ? 's' : ''}` : ''} · ${fos} ${fos === 1 ? 'fósforo' : 'fósforos'}<span class="barra"><i style="width:${pct}%"></i></span></p>`;
  h += `<div class="p3-tabs">${abas.map(([k, nm]) => `<button class="btn ${k === filtroConq ? 'on' : ''}" data-cf="${k}">${nm}</button>`).join('')}</div>`;
  h += Rr.conquistas.filter(filtra).map(x => {
    const tem = c[x.id], nova = typeof tem === 'number' && tem > visto ? '<span class="p3-nova">NOVA</span>' : '';
    if (!tem && x.secreta) {
      if (x.charada) return ch[x.id]
        ? `<div class="it x"><div><b>???</b><br><small>conquista secreta · charada: “${esc(x.charada)}”</small></div><span class="rank"></span></div>`
        : `<div class="it x p3-fos" data-fosforo="${x.id}" title="Segure para riscar um fósforo"><div><b>???</b><br><small>conquista secreta · segure para riscar um fósforo e ler a charada (${fos})</small></div><span class="rank">🜂</span></div>`;
      return `<div class="it x"><div><b>???</b><br><small>conquista secreta · “${x.dica || '...'}”</small></div><span class="rank"></span></div>`;
    }
    return `<div class="it ${tem ? '' : 'x'}"><div><b>${x.nome}</b>${x.secreta ? ' <small>(secreta)</small>' : ''}${nova}<br><small>${x.desc}${tem && typeof tem === 'number' ? ` · em ${data(tem)}` : ''}</small></div><span class="rank">${tem ? '✦' : ''}</span></div>`;
  }).join('') || '<p class="pn-resumo">Nada aqui ainda.</p>';
  A.abrirPainel(`Conquistas ${n}/${Rr.conquistas.length}`, h);
  mudar(x => { x.conqVisto = Date.now(); });
  const L = $('#pn-lista');
  L.querySelectorAll('[data-cf]').forEach(b => b.onclick = () => { painelConquistas(b.dataset.cf); const nb = $(`#pn-lista [data-cf="${b.dataset.cf}"]`); if (nb) nb.focus(); });
  L.querySelectorAll('[data-fosforo]').forEach(el => {
    let t0 = 0, raf = 0;
    const parar = () => { t0 = 0; cancelAnimationFrame(raf); el.style.setProperty('--k', '0%'); };
    const passo = () => { if (!t0) return; const k = (performance.now() - t0) / 1200; el.style.setProperty('--k', Math.min(100, k * 100) + '%'); if (k >= 1) { parar(); if (riscar(el.dataset.fosforo)) painelConquistas(); } else raf = requestAnimationFrame(passo); };
    el.addEventListener('pointerdown', e => { e.preventDefault(); t0 = performance.now(); passo(); });
    el.addEventListener('pointerup', parar); el.addEventListener('pointerleave', parar); el.addEventListener('pointercancel', parar);
  });
}

// ---------------------------------------------------------------- estatísticas (topo e extras)
function statsTopo() {
  const { pct, partes } = cemPct(), PE = TX().pesos;
  return `<div class="p3-cem"><h3>O internato inteiro: ${String(pct).replace('.', ',')}%</h3><span class="barra"><i style="width:${Math.min(100, pct)}%"></i></span>` +
    partes.map(p => `<details><summary>${p.nome} ${p.tem}/${p.tot} <small>· vale ${PE[p.k]}%</small></summary><div class="p3-l">${p.lista}</div></details>`).join('') + '</div>';
}
function statsLinhas() {
  const s = A.stats(), m = mem(), np = s.partidas || 0, L = [];
  if (np) {
    L.push(['Tempo médio por noite', A.fmt(((s.tempo || 0)) / np)]);
    L.push(['Mortes por noite (média)', ((s.mortes || 0) / np).toFixed(1).replace('.', ',')]);
    L.push(['Noites levadas até um final', `${Math.round((s.concluidas || 0) / np * 100)}%`]);
  }
  const dias = m.dias || [];
  if (dias.length) L.push(['Dias diferentes em que você voltou', dias.length]);
  if (m.reinicios) L.push(['Capítulos recomeçados na hora (BACKSPACE)', m.reinicios]);
  if (m.pulos) L.push(['Pulos da cadeira', m.pulos]);
  const fs = Object.keys(fotos()).length; if (fs) L.push(['Polaroides da sua noite', `${fs}/${R().capitulos.length}`]);
  const ss = Object.values(m.semana || {}); if (ss.length) L.push(['Noites da Semana terminadas', ss.length]);
  return L;
}
function depoisStats(L) {
  const lista = $('#pn-lista'); if (!lista || $('#p3-copiar-stats')) return;
  const b = document.createElement('button'); b.className = 'btn'; b.id = 'p3-copiar-stats'; b.textContent = 'Copiar estatísticas';
  const wrap = document.createElement('div'); wrap.style.textAlign = 'center'; wrap.style.marginTop = '12px'; wrap.appendChild(b); lista.appendChild(wrap);
  b.onclick = async () => {
    const { pct } = cemPct();
    const txt = `A Hora do Silêncio · ${String(pct).replace('.', ',')}% do internato\n` + L.map(([a, v]) => `${String(a).trim()}: ${String(v).replace(/<[^>]+>/g, '')}`).join('\n') + `\n${location.href.split('#')[0].split('?')[0]}`;
    let ok = false; try { await navigator.clipboard.writeText(txt); ok = true; } catch (e) { try { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); ok = document.execCommand('copy'); t.remove(); } catch (e2) {} }
    b.textContent = ok ? 'Copiado!' : 'Não deu para copiar'; setTimeout(() => b.textContent = 'Copiar estatísticas', 1800);
  };
}

// ---------------------------------------------------------------- capítulo atual (selos secretos e conquistas de jeito de jogar)
let cap = null, fsT = 0, fearAnt = 0, sustoT = -1e9, sustoQual = '', sustoAcc = 0, sustoContou = true, pausaIni = 0, volAvisou = false;
function capState() { const S = C.S; if (!cap || cap.ch !== S.chapter || cap.sem !== S.semente) cap = { ch: S.chapter, sem: S.semente, som: false, cego: true, toque: false, ouvido: !!(S.modo && S.modo.ouvido) }; return cap; }
function ondeSusto() { const M = C.M, ANA = C.ANA, PROC = C.PROC; return M && M.ativo && M.state === 'caca' ? 'o Inspetor' : ANA && ANA.ativa ? 'a Ana' : PROC && PROC.fase ? 'a Procissão' : 'o escuro'; }
function mouseSusto(e) {
  if (sustoContou || performance.now() - sustoT > 450) return;
  sustoAcc += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
  if (sustoAcc > 320) {
    sustoContou = true; const n = noite(); if (!n) return;
    n.pulos++; n.qual[sustoQual] = (n.qual[sustoQual] || 0) + 1;
    mudar(x => { x.pulos = (x.pulos || 0) + 1; });
    if (n.pulos >= 10) A.conquista('coracao_boca');
  }
}

// ---------------------------------------------------------------- API
export const P3 = {
  zerando: false,
  ligar(ctx, aux) {
    C = ctx; A = aux;
    const RR = R();
    for (const x of TX().conquistas) if (!RR.conquistas.some(y => y.id === x.id)) RR.conquistas.push(x);
    css();
    // avisos de conquista também no título e nos menus, clicáveis e lidos por leitor de tela
    const cq = $('#conq'); if (cq) { document.body.appendChild(cq); cq.setAttribute('role', 'status'); cq.setAttribute('aria-live', 'polite'); cq.addEventListener('click', () => cq.classList.remove('on')); }
    addEventListener('keydown', e => {
      apertadas.add(e.code); mexeu();
      if (e.code === 'Backspace' && !e.repeat && !segura && podeReiniciar('tecla')) { segura = { fonte: 'tecla', t0: performance.now() }; if (C.ui === 'morte') e.preventDefault(); }
      if (e.code === 'KeyN' && !e.repeat) estalo();
    });
    addEventListener('keyup', e => { apertadas.delete(e.code); if (e.code === 'Backspace' && segura && segura.fonte === 'tecla') soltar(); });
    addEventListener('blur', () => { apertadas.clear(); if (segura && segura.fonte === 'tecla') soltar(); });
    addEventListener('pointermove', e => { mexeu(); mouseSusto(e); }, { passive: true });
    addEventListener('wheel', mexeu, { passive: true });
    addEventListener('touchstart', e => {
      mexeu();
      if (C.mode === 'jogo' && C.S) capState().toque = true;
      if (e.touches.length >= 3 && !segura && podeReiniciar('toque')) { const t = e.touches[0]; segura = { fonte: 'toque', t0: performance.now(), x: t.clientX, y: t.clientY }; }
    }, { passive: true, capture: true });
    addEventListener('touchmove', e => { if (segura && segura.fonte === 'toque') { const t = e.touches[0]; if (!t || Math.hypot(t.clientX - segura.x, t.clientY - segura.y) > 40) soltar(); } }, { passive: true });
    addEventListener('touchend', e => { if (segura && segura.fonte === 'toque' && e.touches.length < 3) soltar(); }, { passive: true });
    addEventListener('deviceorientation', orientacao);
    addEventListener('beforeprint', antesImprimir); addEventListener('afterprint', depoisImprimir);
    document.addEventListener('visibilitychange', visibilidade);
    const bc = $('#b-cont'); if (bc) bc.addEventListener('click', () => setTimeout(() => { const n = C.S && noite(); if (n) { n.motivos.add('cont'); n.continuada = true; } }, 0));
    const dl = $('#dt-leve'); if (dl) dl.addEventListener('click', () => setTimeout(() => { const n = C.S && noite(); if (n) n.motivos.add('leve'); }, 0));
    setInterval(() => { try { holdTick(); comboTick(); } catch (e) {} }, 50);
    setInterval(() => {
      try {
        visitaTick();
        // pausa longa: nove minutos
        if (C.mode === 'jogo' && C.ui === 'pausa') { if (!pausaIni) pausaIni = Date.now(); }
        else if (pausaIni) { const d = Date.now() - pausaIni; pausaIni = 0; if (d >= 540000 && C.mode === 'jogo' && !mem().nove) { mudar(x => { x.nove = true; }); setTimeout(() => { const T = TX().jogo; C.toast(T.nove); C.sub('lia', T.noveLia); som(s => s.sussurros(2)); A.conquista('nove_min'); }, 900); } }
        filtroTick();
      } catch (e) {}
    }, 250);
    // dias fora
    const m = mem(), agora = Date.now();
    if (m.visita && agora - m.visita > 864e5 && !window.__teste) {
      const d = Math.floor((agora - m.visita) / 864e5), T = TX().titulo;
      foraTxt = d >= 30 ? T.foraLonge.replace('{d}', d).replace('{data}', new Date(m.visita).toLocaleDateString('pt-BR')) : T.fora.replace('{d}', d).replace('{dias}', d === 1 ? 'dia' : 'dias').replace('{n}', Math.floor((agora - m.visita) / 1000).toLocaleString('pt-BR'));
    }
    mudar(x => { x.visita = agora; });
    setInterval(() => mudar(x => { x.visita = Date.now(); }), 60000);
    abas(); consoleSecreto();
  },
  tecla,
  titulo,
  difExtra,
  painelConquistas,
  statsTopo, statsLinhas, depoisStats,
  novoJogo(S) {
    S.flags._t0 = Date.now();
    N = null; const n = noite(); n.continuada = false;
    const inp = $('#o-desafio');
    if (semanaPend && performance.now() - semanaPend < 60000 && inp && inp.value === sementeSemana(semanaId()) + '-N') { S.flags._semana = semanaId().id; inp.value = ''; }
    semanaPend = 0;
    S.modo = S.modo || {}; S.modo.ouvido = !!(mem().ouvido && C.OPT.ouvido);
    const hoje = new Date().toISOString().slice(0, 10);
    mudar(x => { x.dias = [...new Set([...(x.dias || []), hoje])].slice(-400); });
    if (S.modo.ouvido) setTimeout(() => { if (C.S === S) C.toast(TX().jogo.ouvidoAviso); }, 9000);
  },
  aoRejogar(S) { S.modo.ouvido = !!(mem().ouvido && C.OPT.ouvido); const n = noite(); if (n) n.motivos.add('replay'); },
  tick(dt) {
    const S = C.S; if (!S) return;
    const n = noite(), cs = capState();
    if (C.OPT.vol > 0) cs.som = true;
    else if (!volAvisou) { volAvisou = true; C.toast(TX().jogo.volumeZero); }
    if (!(C.OPT.hudMin && C.OPT.legSom === 'nao' && C.OPT.ruido === 'nao')) cs.cego = false;
    if (!(S.modo && S.modo.ouvido)) cs.ouvido = false;
    if (S.flags.alivio != null) n.motivos.add('leve');
    if (document.fullscreenElement) { fsT += dt; if (fsT >= 1200) A.conquista('escuro_quarto'); } else fsT = 0;
    // susto: o medo saltou de uma vez
    const f = S.fear || 0; if (f - fearAnt > 30) { sustoT = performance.now(); sustoQual = ondeSusto(); sustoAcc = 0; sustoContou = false; } fearAnt = f;
    if (abandonoPend) { abandonoPend = false; if (!n.abandono) { n.abandono = true; const T = TX().jogo; C.toast(T.abandono); setTimeout(() => { if (C.S === S) { C.sub('lia', T.abandonoLia); som(s => s.sussurros(2)); } }, 1800); A.conquista('abandono'); } }
    try { fotoTick(dt); trilhaTick(dt); ouvidoTick(dt); } catch (e) { console.warn('progressão/lote3', e); }
  },
  // HUD do cronômetro: tempo real em destaque, se escolhido
  relogioReal() { const n = C.S && noite(); return C.OPT.relogio === 'real' && n && n.t0 && !n.continuada ? (Date.now() - n.t0) / 1000 : null; },
  salvando() { const n = C.S && noite(); if (n) n.seq = 0; },
  depoisCarregar() { if (P3.zerando) { P3.zerando = false; return true; } return false; },
  morte(quem) {
    const S = C.S, n = noite(); if (!n) return;
    n.seq++;
    if (S.dif !== 'pesadelo' && n.seq >= (S.dif === 'facil' ? 2 : 3)) n.motivos.add('ajuda');
    mudar(x => { x.ultima = { sem: S.semente, mortes: S.mortes, dif: S.dif }; });
    capturarMorte(quem);
  },
  telaMorte() {
    const S = C.S, n = noite(), T = TX().morte, d = $('#death'); if (!n || !d) return;
    const rapida = corrida() && n.seq >= 3 && !(S.modo && S.modo.umaVida);
    d.classList.toggle('p3-rapida', rapida);
    const st = $('#dt-stats'), extra = [];
    if (n.seq >= 2) extra.push(T.mesmoPonto.replace('{n}', n.seq));
    if (rapida) extra.push(T.rapida);
    if (st && extra.length) st.innerHTML += `<br><small>${extra.join(' · ')}</small>`;
    let b = $('#p3-instante');
    if (!b && $('#dt-menu')) { b = document.createElement('button'); b.className = 'btn'; b.id = 'p3-instante'; b.textContent = T.instante; $('#dt-menu').insertAdjacentElement('beforebegin', b); b.onclick = salvarInstante; }
    if (b) { b.hidden = !instante; b.textContent = T.instante; }
    if (rapida) setTimeout(() => { const r = $('#dt-retry'); if (r && !r.hidden && !d.hidden) r.focus(); }, 30);
  },
  pausa() {
    const S = C.S; if (!S) return '';
    const c = R().capitulos[S.chapter], LP = (R().progressao.mundo || {}).lugaresPecas || {}, ids = LP[c.mapa] || [], ac = A.acervo();
    const tem = ids.filter(id => (S.notes || {})[id] || (S.fitas || {})[id] || ac[id]).length, n = noite(), out = [];
    if (ids.length) out.push(`neste lugar: ${tem} de ${ids.length} lembranças`);
    try { out.push(`se o capítulo acabasse agora: rank ${A.calcRank(S).letra}`); } catch (e) {}
    if (n && n.t0 && !n.continuada) out.push(`tempo real ${mmss((Date.now() - n.t0) / 1000)}`);
    if (n && n.reinicios) out.push(`${n.reinicios} ${n.reinicios === 1 ? 'reinício' : 'reinícios'}`);
    if (S.modo && S.modo.ouvido) out.push('Ouvido do Inspetor');
    if (S.flags._semana) out.push('Noite da Semana');
    let h = '<br>' + out.join(' · ');
    if (corrida() && !(S.modo && S.modo.umaVida)) h += `<br><small>${TX().reinicio.dicaPausa}</small>`;
    return h;
  },
  // fim de capítulo: pontos, contagem do tempo, selos secretos, conquistas de jeito de jogar, fósforo, rota
  fimCap(c, r) {
    const S = C.S, T = TX().fimCap, cs = capState(), n = noite(), L = [];
    const pts = Math.max(0, r.pts), partes = (r.partes || []).filter(([, v]) => v).map(([k, v]) => `${k} ${v > 0 ? '+' : '−'}${Math.abs(v)}`).join(' · ');
    L.push(`<span class="p3-conta" data-s="${Math.round(S.capT)}">00:00</span> · ${T.pontos.replace('{p}', Math.min(pts, 6))}<span class="p3-pts"><i style="--v:${Math.min(100, pts / 6 * 100)}%"></i></span><small>${partes}</small>`);
    const sec = [];
    if (S.chapter === 0 && S.capT < 150) { A.conquista('antes_hora'); sec.push(T.antesHora); }
    if (S.capT > 90 && (S.capLuzT || 0) < S.capT * .2) { A.conquista('olhos_moacir'); sec.push(T.olhosMoacir); }
    if (cs.cego && S.capT > 60) { A.conquista('as_cegas'); sec.push(T.asCegas); }
    if (cs.ouvido && S.capT > 30) { A.conquista('ouvido'); sec.push(T.ouvido); mudar(x => { (x.ouvidoCaps = x.ouvidoCaps || {})[c.id] = true; }); }
    if (!cs.som && S.capT > 30) A.conquista('silencio_abs');
    if (S.chapter === 3 && cs.toque) A.conquista('mao_firme');
    if (S.dif === 'pesadelo') mudar(x => { x.pes = x.pes || {}; const a = x.pes[c.id]; if (!a || 'CBAS'.indexOf(r.letra) > 'CBAS'.indexOf(a)) x.pes[c.id] = r.letra; });
    L.push(...sec);
    if (n && n.pulos) { const q = Object.entries(n.qual).sort((a, b) => b[1] - a[1])[0]; L.push(T.pulos.replace('{n}', n.pulos).replace('{vezes}', n.pulos === 1 ? 'vez' : 'vezes').replace('{qual}', q ? ` (quem mais pegou você: ${q[0]})` : '')); }
    mudar(x => { x.fosforos = (x.fosforos || 0) + 1; });
    gravarRota(c);
    L.push(`<small>${T.fosforo}${trilha.length > 9 && !S.replay ? ' · ' + T.rota : ''}</small>`);
    // juice: o tempo conta até o valor e cada selo aceso estala
    setTimeout(() => {
      const el = document.querySelector('#fc-falta .p3-conta'); if (!el) return;
      const alvo = +el.dataset.s, t0 = performance.now();
      const passo = () => { const k = Math.min(1, (performance.now() - t0) / 900); el.textContent = mmss(alvo * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(passo); };
      passo();
      document.querySelectorAll('#fc-selos .selo.on').forEach((s, i) => setTimeout(() => som(x => x.papel()), 250 * i + 120));
    }, 30);
    return L;
  },
  final(tipo) {
    const S = C.S, n = noite();
    P3._final = null; if (!n) return;
    if (S.replay) n.motivos.add('replay');
    const real = n.t0 && !n.continuada ? (Date.now() - n.t0) / 1000 : null;
    const limpa = S.completo && !n.motivos.size;
    if (limpa && S.dif !== 'facil') A.conquista('sem_rede');
    let semana = null;
    if (S.flags._semana && S.completo) {
      const ant = (mem().semana || {})[S.flags._semana], novo = !ant || S.tempo < ant;
      if (novo) mudar(x => { (x.semana = x.semana || {})[S.flags._semana] = Math.round(S.tempo); });
      semana = { ant, novo }; A.conquista('semana');
    }
    mudar(x => { x.ultima = { sem: S.semente, mortes: S.mortes, dif: S.dif, final: tipo }; });
    P3._final = { real, limpa, semana };
  },
  telaFinal() {
    const S = C.S, F = P3._final, n = noite(), T = TX().final; if (!F || !n) return;
    const L = [];
    L.push(F.real != null ? T.tempos.replace('{j}', mmss(S.tempo)).replace('{r}', mmss(F.real)).replace('{p}', mmss(Math.max(0, F.real - S.tempo))) : T.continuada.replace('{j}', mmss(S.tempo)));
    L.push(F.limpa ? `<b class="ouro">${T.limpa}</b>` : `${T.ajuda}: ${[...n.motivos].map(k => T.motivos[k] || k).join(', ') || 'noite incompleta'}`);
    if (n.pulos) L.push(TX().fimCap.pulos.replace('{n}', n.pulos).replace('{vezes}', n.pulos === 1 ? 'vez' : 'vezes').replace('{qual}', ''));
    if (F.semana) { const w = semanaId(); L.push(T.semana.replace('{s}', w.sem).replace('{t}', mmss(S.tempo)).replace('{rec}', F.semana.novo ? (F.semana.ant ? ` · novo recorde, ${Math.round(F.semana.ant - S.tempo)}s mais rápida` : ' · primeiro tempo da semana') : ` · seu recorde ${mmss(F.semana.ant)}`)); }
    $('#e-stats').innerHTML += '<br>' + L.join('<br>');
    let b = $('#p3-semana');
    if (!b && $('#e-menu')) { b = document.createElement('button'); b.className = 'btn'; b.id = 'p3-semana'; $('#e-menu').insertAdjacentElement('beforebegin', b); }
    if (b) {
      b.hidden = !S.flags._semana; b.textContent = T.copiarSemana;
      b.onclick = async () => {
        const w = semanaId(), txt = `Noite da Semana ${w.sem} de A Hora do Silêncio: fiz ${mmss(S.tempo)}. Bata até domingo.\n${location.origin + location.pathname}#semana`;
        let ok = false; try { await navigator.clipboard.writeText(txt); ok = true; } catch (e) {}
        b.textContent = ok ? 'Copiado!' : 'Não deu para copiar'; setTimeout(() => b.textContent = T.copiarSemana, 1800);
      };
    }
  },
  copiar() {
    const S = C.S, F = P3._final, n = noite(); if (!S || !n) return '';
    const out = [];
    if (F && F.real != null) out.push(`tempo real ${mmss(F.real)}`);
    if (F) out.push(F.limpa ? 'corrida limpa' : 'corrida com ajuda');
    if (n.pulos) out.push(`pulei ${n.pulos}x da cadeira`);
    if (S.flags._semana) out.push(`Noite da Semana ${semanaId().sem}`);
    return out.length ? ' · ' + out.join(' · ') : '';
  },
  // menu Capítulos
  pola,
  verRota,
  temRota: cid => !!(A.ls.get(ROTAS_K, {}) || {})[cid],
  pes: cid => { const p = (mem().pes || {})[cid]; return p ? `<span class="p3-pes" title="melhor rank no Pesadelo: ${p}">†${p}</span>` : ''; },
  ouvidoCap: cid => !!(mem().ouvidoCaps || {})[cid],
  somaMelhores() {
    const caps = A.ls.get(C.KEYS.CAPS_KEY, {}) || {}, ts = R().capitulos.map(c => (caps[c.id] || {}).tempo).filter(t => t && t < 1e9);
    return ts.length === R().capitulos.length ? ` · soma dos melhores capítulos ${mmss(ts.reduce((a, b) => a + b, 0))}` : '';
  }
};
