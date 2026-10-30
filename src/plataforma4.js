// A HORA DO SILÊNCIO — Lote 4: segredos e easter eggs (plataforma e acessibilidade).
// Tudo cosmético, opcional e guardado: nada muda para quem não procura, e nada roda no QA (navigator.webdriver).
// Ligado por uma linha em plataforma.js: instalarPlat4(C, bag). Coisa pesada (galeria, sala de testes, visita de 1978)
// vem em src/plataforma4-extra.js carregado só quando precisa (import() no ocioso), para não pesar a abertura.

import { instalarPlat4b } from './plataforma4b.js';

const $ = s => document.querySelector(s);
const K_SEG = 'hora-silencio-seg';        // marcadores/segredos já vistos (não é save)
const STATS_KEY = 'hora-silencio-stats';  // só leitura: finais vistos

// conquistas secretas deste lote (registradas em memória, sem tocar no roteiro.js)
const CONQ4 = [
  { id: 's4_bastidores', nome: 'Bastidores', desc: 'Entre na sala de testes que não deveria existir.', secreta: true, dica: 'Uma placa de obra fala de um porão.' },
  { id: 's4_galeria', nome: 'Visitação', desc: 'Abra a galeria escondida nos créditos.', secreta: true, dica: 'Algumas letras dos créditos estão mais fortes.' },
  { id: 's4_por_baixo', nome: 'Por Baixo do Papel', desc: 'Leia o que está escrito nas entranhas da casa.', secreta: true, dica: 'Quem abre o código-fonte acha uma pista.' },
  { id: 's4_ao_vivo', nome: 'Ao Vivo', desc: 'Esteja jogando exatamente às nove da noite.', secreta: true, dica: 'A Hora é a Hora, no relógio de verdade.' },
  { id: 's4_matando_aula', nome: 'Matando Aula', desc: 'Abra o jogo num dia de semana, de manhã.', secreta: true, dica: 'Você não deveria estar em outro lugar?' },
  { id: 's4_lua_cheia', nome: 'Lua Cheia no São Lázaro', desc: 'Jogue numa noite de lua cheia de verdade.', secreta: true, dica: 'Olhe para o céu lá fora.' },
  { id: 's4_tecla_errada', nome: 'Tecla Errada', desc: 'Aperte a tecla que ninguém aperta.', secreta: true, dica: 'Tem tecla que trava o tempo.' },
  { id: 's4_lupa', nome: 'Lupa', desc: 'Dê zoom para ler o que estava pequeno demais.', secreta: true, dica: 'Chegue mais perto da tela.' },
  { id: 's4_correio', nome: 'Correio Interno', desc: 'Receba o recado de giz de um amigo.', secreta: true, dica: 'Abra o link que te mandaram.' },
  { id: 's4_outro_lado', nome: 'Do Outro Lado do Controle', desc: 'Sinta quem bate de dentro do controle.', secreta: true, dica: 'Segure os dois gatilhos no título.' },
  { id: 's4_lado_de_ca', nome: 'Do Lado de Cá', desc: 'Vire o aparelho de cabeça para baixo.', secreta: true, dica: 'Ela quer te ver de outro ângulo.' },
  { id: 's4_festa', nome: 'Luz de Festa', desc: 'Ligue a lanterna que muda de cor.', secreta: true, dica: 'Uma revista velha ensina o código.' },
  { id: 's4_arqueologia', nome: 'Arqueologia', desc: 'Visite a primeira versão do internato.', secreta: true, dica: 'Tem uma caixa escrita "v1".' },
  { id: 's4_soltar', nome: 'Obrigado por me Soltar', desc: 'Solte o que o Davi deixou guardado em você.', secreta: true, dica: 'Ele escreveu algo no armazenamento do navegador.' }
];

export function instalarPlat4(C, bag) {
  const O = bag.O, salvar = bag.salvar, robo = bag.robo;
  const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const seg = lsGet(K_SEG, {}), guardaSeg = () => lsSet(K_SEG, seg);
  const sfx = n => { try { return C.SFX && C.SFX[n] && C.SFX[n](); } catch (e) {} };
  const conq = id => { try { C.conquista(id); } catch (e) {} };
  const noTitulo = () => C.mode === 'titulo' && $('#title') && !$('#title').hidden;
  const vibrar = bag.vibrar || (() => {});
  const _hash0 = (() => { try { return location.hash || ''; } catch (e) { return ''; } })(); // capturado antes de lerHash() limpar

  // registra as conquistas deste lote (sem editar roteiro.js)
  try {
    const R = window.ROTEIRO; if (R && R.conquistas) {
      const tem = new Set(R.conquistas.map(c => c.id));
      for (const c of CONQ4) if (!tem.has(c.id)) R.conquistas.push(c);
    }
  } catch (e) {}

  // CSS do lote
  try { if (!$('#s4-css')) { const l = document.createElement('link'); l.id = 's4-css'; l.rel = 'stylesheet'; l.href = 'src/plataforma4.css'; document.head.appendChild(l); } } catch (e) {}

  // carrega o módulo pesado só quando precisar (e preload no ocioso)
  let _extra = null, _extraP = null;
  const extra = () => _extraP || (_extraP = import('./plataforma4-extra.js').then(m => (_extra = m.criarExtra(C, { sfx, conq, seg, guardaSeg, noTitulo, vibrar }))));
  const sub = t => { try { const el = $('#t-sub'); if (!el) return; el.dataset.s4 = el.dataset.s4 || el.textContent; el.textContent = t; el.classList.add('segredo'); clearTimeout(sub._to); sub._to = setTimeout(() => { el.textContent = el.dataset.s4 || ''; el.classList.remove('segredo'); }, 6500); } catch (e) {} };

  // ------------------------------------------------------------------ CONSOLE (segredos que circulam em fórum)
  const asc = s => '\n' + s + '\n';
  const NOMES37 = 'DAVI ANA TOMÉ CELESTE MOACIR ALBANO JOAQUIM LUIZ'.split(' ');
  window.__segredos = {
    ajuda() { console.log('%cA HORA DO SILÊNCIO', 'color:#8e1b14;font:bold 16px monospace'); console.log('comandos: lia() davi() regras() quem() luz() ouvir() cofre()'); return 'ninguém ajudou a gente. — D.'; },
    help() { return this.ajuda(); },
    lia() { try { if (C.camera) C.camera.rotation.y += Math.PI; } catch (e) {} try { if (C.S && !C.S.dead && C.toast) C.toast('Quem tá aí?'); } catch (e) {} return asc('  FICHA DE MATRÍCULA — 1979\n  Lia ______ · irmã de Davi ______\n  "vai buscar o irmão", dizem.'); },
    davi() { conq('s4_por_baixo'); return asc('  não conta pra ninguém.\n  cofre: 14 03 79'); },
    cofre() { return '14-03-79 (mas você tem que achar no escuro).'; },
    regras() { const r = (window.ROTEIRO && window.ROTEIRO.regras) || []; return asc(r.map((x, i) => '  ' + (i + 1) + '. ' + (typeof x === 'string' ? x : x.t || '')).join('\n') + '\n  7. ' + 'quem conta não é ouvido.'); },
    quem() { return asc('  ' + NOMES37.join('  ') + '  ______'); },
    luz() { try { const S = C.S; if (S) { S.flashOn = false; setTimeout(() => { S.flashOn = true; }, 1000); } } catch (e) {} return 'não.'; },
    ouvir() { sfx('sussurros'); return '...tá ouvindo?'; }
  };
  if (!robo) { try { console.log('%cvocê veio bisbilhotar? digite __segredos.ajuda()', 'color:#555;font:12px monospace'); } catch (e) {} }

  // ------------------------------------------------------------------ MARCADORES NO ENDEREÇO (#...): dá para mandar a um amigo
  function lerHash() {
    let h = ''; try { h = (location.hash || '').replace(/^#/, '').toLowerCase(); } catch (e) {}
    if (!h) return;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    aplicarMarcador(h);
  }
  function selo(txt) { try { seg.selos = seg.selos || {}; seg.selos[txt] = 1; guardaSeg(); } catch (e) {} }
  function aplicarMarcador(h) {
    if (robo) return;
    switch (h) {
      case 'davi': sub('Lia... escreve meu nome na areia pra eu não sumir. — D.'); sfx('sinoLonge'); selo('davi'); break;
      case 'ana': sub('agora você tá do lado de cá.'); document.documentElement.classList.add('s4-ana'); sfx('sussurros'); selo('ana'); break;
      case '1979': case 'cinzas': fxCinzas(); selo('1979'); break;
      case '14031979': fxCinzas(); sub('14 de março. era pra ser festa.'); selo('aniv'); break;
      case 'silencio': try { C.SOM && (C.SOM.mudoSegredo = true); } catch (e) {} sub('(o título ficou mudo)'); selo('silencio'); break;
      case 'breu': document.documentElement.classList.add('s4-breu'); sub('a luz do prédio todo apagou.'); selo('breu'); break;
      case 'espelho': document.documentElement.classList.add('s4-espelho'); sub('tudo trocado de lado.'); selo('espelho'); break;
      case 'apito': sfx('apito') || sfx('clique'); sub('(um apito, longe)'); selo('apito'); break;
      case 'chuva': fxChuva(); selo('chuva'); break;
      case 'festa': ligarFesta(); break;
      case 'porao': case 'bastidores': extra().then(e => e && e.salaDeTestes()); break;
      case '1978': extra().then(e => e && e.visita1978()); break;
      case 'presente': extra().then(e => e && e.galeria()); break;
      default: break;
    }
  }

  // cinzas caindo (cosmético no título) — cor já usada no jogo (fuligem)
  function fxCinzas() {
    if ($('#s4-fx')) return;
    const c = document.createElement('canvas'); c.id = 's4-fx'; document.body.appendChild(c);
    const g = c.getContext('2d'); const res = () => { c.width = innerWidth; c.height = innerHeight; }; res(); addEventListener('resize', res);
    const flocos = Array.from({ length: 70 }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, v: 8 + Math.random() * 22, r: 1 + Math.random() * 2, w: (Math.random() - .5) * 10 }));
    let on = true; (function t() { if (!on) return; requestAnimationFrame(t); g.clearRect(0, 0, c.width, c.height); g.fillStyle = 'rgba(190,180,165,.5)'; for (const f of flocos) { f.y += f.v / 60; f.x += Math.sin(f.y / 40) * f.w / 60; if (f.y > c.height) { f.y = -4; f.x = Math.random() * c.width; } g.beginPath(); g.arc(f.x, f.y, f.r, 0, 7); g.fill(); } })();
    setTimeout(() => { on = false; c.remove(); }, 30000);
  }
  function fxChuva() {
    if ($('#s4-fx')) return;
    const c = document.createElement('canvas'); c.id = 's4-fx'; document.body.appendChild(c);
    const g = c.getContext('2d'); const res = () => { c.width = innerWidth; c.height = innerHeight; }; res(); addEventListener('resize', res);
    const gotas = Array.from({ length: 220 }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, v: 400 + Math.random() * 500, l: 10 + Math.random() * 14 }));
    let on = true; (function t() { if (!on) return; requestAnimationFrame(t); g.clearRect(0, 0, c.width, c.height); g.strokeStyle = 'rgba(170,185,200,.35)'; g.lineWidth = 1; for (const d of gotas) { d.y += d.v / 60; if (d.y > c.height) { d.y = -d.l; d.x = Math.random() * c.width; } g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(d.x - 2, d.y + d.l); g.stroke(); } })();
    setTimeout(() => { on = false; c.remove(); }, 25000);
  }

  // lanterna de festa (cosmético) — luz que muda de cor devagar atrás do sino
  function ligarFesta() {
    if (seg.festa) { sub('A lanterna de festa já está guardada no bolso.'); }
    seg.festa = 1; guardaSeg(); conq('s4_festa');
    let el = $('#s4-festa'); if (!el) { el = document.createElement('div'); el.id = 's4-festa'; document.body.appendChild(el); }
    let on = true, h = 0; (function t() { if (!on) return; requestAnimationFrame(t); h = (h + .3) % 360; document.documentElement.style.setProperty('--s4h', h); })();
    sub('Lanterna de Festa ligada. Pura bobagem de cor. (só no título)');
    setTimeout(() => { on = false; if (el) el.remove(); }, 20000);
  }

  // ------------------------------------------------------------------ CÓDIGOS DIGITADOS NOVOS (físicos e via giz)
  // escuta os mesmos eventos de teclado do título; soma à lógica que já existe (SILENCIO, DAVI, NOVE, MOACIR, nomes...)
  let buf = '';
  function onTeclaTitulo(e) {
    if (robo) return; if (!noTitulo()) { buf = ''; return; }
    const m = /^Key([A-Z])$/.exec(e.code); if (!m) return;
    buf = (buf + m[1]).slice(-16);
    if (buf.endsWith('PORAO') || buf.endsWith('BASTIDORES')) { buf = ''; extra().then(x => x && x.salaDeTestes()); }
    else if (buf.endsWith('PRESENTE')) { buf = ''; extra().then(x => x && x.galeria()); }
    else if (buf.endsWith('FESTA')) { buf = ''; ligarFesta(); }
    else if (buf.endsWith('ENTRANHAS')) { buf = ''; conq('s4_por_baixo'); sub('Seu Joaquim: "quem lê as entranhas da casa merece um aviso: não fica pra última badalada."'); sfx('sinoLonge'); }
    else if (buf.endsWith('ARQUEOLOGIA') || buf.endsWith('V1')) { buf = ''; abrirV1(); }
  }
  addEventListener('keydown', onTeclaTitulo, false);

  function abrirV1() {
    conq('s4_arqueologia');
    const a = document.createElement('a'); a.href = 'v1/'; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = 'v1 — não usar (abre a primeira versão do internato)';
    a.style.cssText = 'position:fixed;left:50%;top:62%;transform:translateX(-50%);z-index:30;color:#8a7f68;font:13px "Special Elite",monospace;text-decoration:underline';
    $('#title') && $('#title').appendChild(a); setTimeout(() => a.remove(), 12000);
    sub('"aqui era tudo diferente." — um bilhete numa caixa de papelão');
  }

  // ------------------------------------------------------------------ TECLADO DE GIZ (controle, toque, baixa mobilidade)
  const GIZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').concat(['⌫', 'OK']);
  let gizEl = null, gizIx = 0;
  function abrirGiz() {
    if (gizEl || !noTitulo()) return; gizIx = 0;
    gizEl = document.createElement('div'); gizEl.id = 's4-giz'; if (O.gizGrande) gizEl.classList.add('s4-giz-grande');
    gizEl.innerHTML = '<h3>escreva no giz</h3><div class="s4-mostra"></div><div class="s4-grade"></div><div class="s4-dica">setas / analógico / toque para escolher · confirmar com OK · ESC fecha</div>';
    const grade = gizEl.querySelector('.s4-grade');
    GIZ.forEach((ch, i) => { const b = document.createElement('button'); b.textContent = ch; b.dataset.i = i; b.onclick = () => { gizIx = i; gizPressa(); }; grade.appendChild(b); });
    document.body.appendChild(gizEl); gizFoco();
    sfx('clique');
  }
  function gizFoco() { if (!gizEl) return; gizEl.querySelectorAll('button').forEach((b, i) => b.classList.toggle('s4-foco', i === gizIx)); }
  function gizPressa() {
    const ch = GIZ[gizIx]; sfx('clique');
    if (ch === 'OK') { fecharGiz(); return; }
    if (ch === '⌫') { buf = buf.slice(0, -1); } else { dispatchEvent(new KeyboardEvent('keydown', { code: 'Key' + ch, key: ch, bubbles: true })); }
    const mo = gizEl && gizEl.querySelector('.s4-mostra'); if (mo) mo.textContent = (mo.textContent + (ch === '⌫' ? '' : ch)).slice(-16);
    if (ch === '⌫' && mo) mo.textContent = mo.textContent.slice(0, -1);
  }
  function fecharGiz() { if (gizEl) { gizEl.remove(); gizEl = null; } }
  function gizNav(dx, dy) { if (!gizEl) return; const col = 7; let x = gizIx % col, y = (gizIx / col) | 0; x = (x + dx + col) % col; const linhas = Math.ceil(GIZ.length / col); y = (y + dy + linhas) % linhas; gizIx = Math.min(GIZ.length - 1, y * col + x); gizFoco(); }
  addEventListener('keydown', e => {
    if (!gizEl) return; e.preventDefault();
    if (e.key === 'Escape') fecharGiz();
    else if (e.key === 'ArrowLeft') gizNav(-1, 0); else if (e.key === 'ArrowRight') gizNav(1, 0);
    else if (e.key === 'ArrowUp') gizNav(0, -1); else if (e.key === 'ArrowDown') gizNav(0, 1);
    else if (e.key === 'Enter' || e.key === ' ') gizPressa();
  }, true);
  // abre o teclado de giz segurando o rádio-relógio/título por 2 s (toque) — e dá para abrir pelo controle (ver pad)
  let pressT = 0, pressTimer = null;
  if (!robo) {
    const alvoPress = () => $('#t-titulo') || $('#title');
    addEventListener('pointerdown', e => { if (!noTitulo() || gizEl) return; pressTimer = setTimeout(abrirGiz, 2000); }, true);
    addEventListener('pointerup', () => { clearTimeout(pressTimer); }, true);
    addEventListener('pointercancel', () => { clearTimeout(pressTimer); }, true);
  }

  // ------------------------------------------------------------------ CONTROLE no título: abre o giz, e os gatilhos batem de dentro
  let padLoop = 0, trigT = 0, lbrbAnt = false;
  function pollPad() {
    padLoop = requestAnimationFrame(pollPad);
    if (robo || !noTitulo()) { trigT = 0; return; }
    let gp = null; try { gp = (navigator.getGamepads && navigator.getGamepads()[0]) || null; } catch (e) {}
    if (!gp || !gp.connected) { trigT = 0; return; }
    const b = gp.buttons || [];
    const lbrb = b[4] && b[4].pressed && b[5] && b[5].pressed;
    if (lbrb && !lbrbAnt && !gizEl) abrirGiz();
    lbrbAnt = lbrb;
    const trig = b[6] && b[6].pressed && b[7] && b[7].pressed;
    if (trig) { trigT += 1 / 60; if (trigT < 9) { if (((trigT * 3) | 0) !== (((trigT - 1 / 60) * 3) | 0)) vibrar(.5, .4, 90); } else if (!seg.outroLado) { seg.outroLado = 1; guardaSeg(); conq('s4_outro_lado'); sub('tem alguém batendo de dentro do controle.'); vibrar(1, 1, 120); setTimeout(() => vibrar(1, 1, 120), 200); setTimeout(() => vibrar(1, 1, 120), 400); setTimeout(() => vibrar(1, 1, 500), 650); } }
    else trigT = 0;
  }
  if (!robo) pollPad();

  // ------------------------------------------------------------------ GIROSCÓPIO (celular): título de cabeça para baixo
  if (!robo && window.DeviceOrientationEvent) {
    let baixoT = 0, ult = performance.now();
    addEventListener('deviceorientation', e => {
      if (!noTitulo() || e.beta == null) return; const now = performance.now(), dt = (now - ult) / 1000; ult = now;
      if (Math.abs(Math.abs(e.beta) - 180) < 28) { baixoT += dt; if (baixoT > 3 && !document.documentElement.classList.contains('s4-virado')) { document.documentElement.classList.add('s4-virado'); document.documentElement.style.setProperty('transition', 'transform .6s'); document.documentElement.style.transform = 'rotate(180deg)'; sub('agora você tá do lado de cá.'); sfx('sussurros'); conq('s4_lado_de_ca'); } }
      else { baixoT = 0; if (document.documentElement.classList.contains('s4-virado')) { document.documentElement.classList.remove('s4-virado'); document.documentElement.style.transform = ''; } }
    });
  }

  // ------------------------------------------------------------------ TECLAS ESCONDIDAS no jogo
  const emJogo = () => C.mode === 'jogo' && C.S && !C.S.dead;
  if (!robo) addEventListener('keydown', e => {
    // Caps Lock é grito
    try { if (e.getModifierState && e.getModifierState('CapsLock') && emJogo() && !seg.caps) { seg.caps = 1; guardaSeg(); C.toast && C.toast('[para de gritar comigo]'); } } catch (er) {}
    // Scroll Lock / Insert: a tecla que ninguém aperta trava o tempo
    if ((e.code === 'ScrollLock' || e.code === 'Insert') && emJogo()) {
      if (C.S && C.S._s4trava) return; if (C.S) C.S._s4trava = 1;
      const o = document.createElement('div'); o.style.cssText = 'position:fixed;inset:0;z-index:95;background:#000'; document.body.appendChild(o);
      try { if (C.master && C.AC) { C.master.gain.setValueAtTime(C.master.gain.value, C.AC.currentTime); C.master.gain.linearRampToValueAtTime(0, C.AC.currentTime + .05); } } catch (er) {}
      setTimeout(() => { o.remove(); try { if (C.master && C.AC) C.master.gain.linearRampToValueAtTime(1, C.AC.currentTime + .3); } catch (er) {} C.toast && C.toast('[alguém empurrou você]'); conq('s4_tecla_errada'); }, 2000);
    }
  });

  // copiar uma nota deixa um recado a mais
  if (!robo) document.addEventListener('copy', e => {
    try {
      const vis = ($('#nota') && !$('#nota').hidden) || ($('#dialogo') && !$('#dialogo').hidden);
      const sel = String(getSelection() || ''); if (!vis || sel.length < 8) return;
      e.clipboardData.setData('text/plain', sel + '\n\n(eu vi o que você copiou. — A.)'); e.preventDefault();
    } catch (er) {}
  });

  // zoom do navegador revela a letra miúda
  if (!robo) { let dprAnt = devicePixelRatio || 1; addEventListener('resize', () => { const d = devicePixelRatio || 1; if (d > dprAnt + .15 && !seg.lupa) { seg.lupa = 1; guardaSeg(); conq('s4_lupa'); (C.toast || sub)('você chegou mais perto. ele também.'); } dprAnt = d; }); }

  // tela cheia no Capítulo III: a Ana sussurra
  if (!robo) document.addEventListener('fullscreenchange', () => { try { if (document.fullscreenElement && C.S && C.S.chapter === 3 && !C.S.dead) C.toast && C.toast('agora não tem pra onde ir.'); } catch (er) {} });

  // ------------------------------------------------------------------ RELÓGIO DE VERDADE e FASE DA LUA
  function faseLua(d) { // 0 nova … 0.5 cheia … 1 nova
    const lp = 2551443, nova = Date.UTC(1970, 0, 7, 20, 35, 0) / 1000, ph = ((d.getTime() / 1000) - nova) % lp; return (ph < 0 ? ph + lp : ph) / lp;
  }
  function relogioReal() {
    if (robo) return;
    const ver = () => {
      const d = new Date(), hh = d.getHours(), mm = d.getMinutes(), dia = d.getDay();
      const hoje = d.toDateString();
      if (hh === 21 && mm === 0 && seg.aoVivo !== hoje) { seg.aoVivo = hoje; guardaSeg(); sfx('badaladas'); (emJogo() ? C.toast : sub)('21:00 — a Hora chegou lá fora também.'); conq('s4_ao_vivo'); }
      if (hh === 21 && mm === 4 && seg.t2104 !== hoje) { seg.t2104 = hoje; guardaSeg(); sfx('sussurros'); (emJogo() ? C.toast : sub)('21h04 — "eu só falei..." — Tomé R.'); }
      if (noTitulo() && dia >= 1 && dia <= 5 && hh >= 7 && hh < 12 && seg.aula !== hoje) { seg.aula = hoje; guardaSeg(); sub('Você não deveria estar na aula, Lia?'); conq('s4_matando_aula'); }
      if (noTitulo()) { const f = faseLua(d); if (Math.abs(f - .5) < .035 && !document.documentElement.classList.contains('s4-lua')) { document.documentElement.classList.add('s4-lua'); luaCheia(); conq('s4_lua_cheia'); } }
    };
    ver(); setInterval(ver, 20000);
  }
  function luaCheia() {
    const c = document.createElement('canvas'); c.width = c.height = 120; c.id = 's4-lua'; c.style.cssText = 'position:fixed;left:50%;top:12%;transform:translateX(-50%);z-index:4;opacity:.7;pointer-events:none';
    const g = c.getContext('2d'); const gr = g.createRadialGradient(54, 54, 8, 60, 60, 56); gr.addColorStop(0, '#f2eede'); gr.addColorStop(1, 'rgba(210,205,190,.05)'); g.fillStyle = gr; g.beginPath(); g.arc(60, 60, 54, 0, 7); g.fill();
    g.fillStyle = 'rgba(150,145,130,.35)'; [[46, 50, 9], [74, 44, 6], [64, 74, 11], [44, 72, 5]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); });
    $('#title') && $('#title').appendChild(c);
  }

  // ------------------------------------------------------------------ CARTA no armazenamento do navegador (davi_bilhete)
  function cartaDavi() {
    if (robo) return;
    try {
      const posto = localStorage.getItem('davi_bilhete_posto');
      const carta = localStorage.getItem('davi_bilhete');
      if (posto && !carta) { conq('s4_soltar'); sub('Obrigado por me soltar.'); return; }
      if (!posto) { localStorage.setItem('davi_bilhete', 'Lia, se você achou isto, é porque foi fuçar onde não devia — igual eu. Apaga esta chave e recarrega. Deixa eu ir. — D.'); localStorage.setItem('davi_bilhete_posto', '1'); }
    } catch (e) {}
  }

  // ------------------------------------------------------------------ FAVICON RACHADO depois do final verdadeiro
  function faviconFinal() {
    try {
      const st = lsGet(STATS_KEY, {}); if (!(st.finais && st.finais.verdadeiro)) return;
      const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
      g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, 64, 64);
      g.strokeStyle = '#b8ad90'; g.lineWidth = 3; g.beginPath(); g.moveTo(32, 10); g.lineTo(18, 46); g.lineTo(46, 46); g.closePath(); g.stroke(); // sino
      g.strokeStyle = '#8e1b14'; g.lineWidth = 2; g.beginPath(); g.moveTo(32, 14); g.lineTo(28, 30); g.lineTo(34, 40); g.lineTo(30, 48); g.stroke(); // rachadura
      const url = c.toDataURL('image/png'); let link = document.querySelector("link[rel='icon']"); if (link) link.href = url;
      document.title = 'A Hora do Silêncio — acabou?';
    } catch (e) {}
  }

  // ------------------------------------------------------------------ LINK DE DESAFIO com nome e recado do amigo
  function filtra(s) { return String(s || '').replace(/[^A-Za-zÀ-ÿ0-9 .!?]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40); }
  function lerRecadoDoLink() {
    if (robo || !noTitulo()) return;
    let de = '', r = ''; try { const p = new URLSearchParams(location.search); de = filtra(p.get('de')); r = filtra(p.get('r')); } catch (e) {}
    if (!de && !r) return;
    const el = document.createElement('div'); el.id = 's4-recado';
    el.innerHTML = (r ? r.toUpperCase().replace(/</g, '') : 'ESTEVE AQUI') + '<small>— ' + (de ? de.toUpperCase().slice(0, 16) : 'alguém') + '</small>';
    $('#title') && $('#title').appendChild(el); conq('s4_correio');
    if (de) sub(de + ' te desafiou.');
  }
  // botão "Desafiar com recado" no fim do capítulo/jogo
  function montarRecado() {
    const menu = $('#e-menu'); if (!menu || $('#s4-rec-btn')) return;
    const b = document.createElement('button'); b.className = 'btn'; b.id = 's4-rec-btn'; b.textContent = 'Desafiar com recado';
    menu.before(b);
    b.onclick = () => {
      const nome = filtra(prompt('Seu nome (até 16 letras):', '') || '').slice(0, 16);
      const rec = filtra(prompt('Um recado de giz para o amigo (até 40 letras):', '') || '');
      let url = location.origin + location.pathname;
      const q = []; if (nome) q.push('de=' + encodeURIComponent(nome)); if (rec) q.push('r=' + encodeURIComponent(rec));
      try { const ex = window.__plat && window.__plat.textoResultado && window.__plat.textoResultado(); if (ex && ex.url) { const d = new URL(ex.url); if (d.searchParams.get('desafio')) q.unshift('desafio=' + d.searchParams.get('desafio')); } } catch (e) {}
      if (q.length) url += '?' + q.join('&');
      bag.copiar ? bag.copiar(url).then(ok => bag.feedback && bag.feedback(b, ok ? 'Link com recado copiado.' : url)) : prompt('Copie o link:', url);
    };
  }

  // ------------------------------------------------------------------ MODO STREAMER e acessibilidade dos segredos (tela Desempenho)
  function aplicarStream() {
    document.body.classList.toggle('s4-stream', !!O.stream);
    document.body.classList.toggle('s4-stream-topo', !!O.streamTopo);
    let wc = $('#s4-webcam'); if (O.stream && O.streamArea) { if (!wc) { wc = document.createElement('div'); wc.id = 's4-webcam'; document.body.appendChild(wc); } } else if (wc) wc.remove();
  }
  function montarOpcoes() {
    const wrap = $('#plat-opcoes .wrap') || $('#plat-opcoes'); if (!wrap || $('#s4-opc')) return;
    const fs = document.createElement('fieldset'); fs.id = 's4-opc';
    const row = (key, label, dica) => `<label><input type="checkbox" data-k="${key}"> ${label}</label>${dica ? '<small>' + dica + '</small>' : ''}`;
    fs.innerHTML = '<legend>Segredos e acessibilidade</legend>' +
      row('stream', 'Modo Streamer', 'Esconde seu nome (vira LIA), legendas maiores, canto da webcam livre.') +
      row('streamTopo', 'Legendas no topo', 'Para não ficar atrás da câmera.') +
      row('streamArea', 'Mostrar área da webcam', 'Um retângulo no canto para não cobrir o jogo.') +
      row('gizGrande', 'Teclado de giz grande', 'Letras maiores para achar os códigos no controle ou no toque.') +
      row('semFlashSeg', 'Segredos sem flashes', 'Tira os piscas dos easter eggs (respeita quem é sensível).');
    wrap.appendChild(fs);
    fs.querySelectorAll('input[data-k]').forEach(inp => { const k = inp.dataset.k; inp.checked = !!O[k]; inp.onchange = () => { O[k] = inp.checked; salvar(); aplicarStream(); }; });
  }

  // ------------------------------------------------------------------ início
  lerHash(); relogioReal(); cartaDavi(); faviconFinal(); montarOpcoes(); aplicarStream();
  // tenta ler recado do link e montar botões já, e de novo quando o título aparecer
  lerRecadoDoLink();
  // pista do porão no título
  if (!robo && $('#title') && !$('#s4-pista')) { const p = document.createElement('div'); p.id = 's4-pista'; p.textContent = 'obra — acesso ao PORÃO restrito'; $('#title').appendChild(p); }
  // preload do módulo pesado quando a máquina estiver ociosa
  if (!robo) { const ric = window.requestIdleCallback || (f => setTimeout(f, 2500)); ric(() => extra()); }

  // 2ª rodada do lote 4 (mais segredos/acessibilidade), ligada aqui por uma linha
  let P4B = { frame() {}, mapa() {}, aoFim() {} };
  try { P4B = instalarPlat4b(C, { O, salvar, vibrar, copiar: bag.copiar, feedback: bag.feedback, robo, hash0: _hash0, sub, sfx, conq, noTitulo, emJogo }) || P4B; } catch (e) {}

  // API para o motor/qa
  let recadoFeito = false;
  return {
    frame(dt, ativo) { /* leve: quando a tela de fim aparece, monta o botão de recado uma vez */
      if (!recadoFeito) { try { if ($('#e-menu')) { montarRecado(); recadoFeito = true; } } catch (e) {} }
      try { P4B.frame(dt, ativo); } catch (e) {}
    },
    mapa() { recadoFeito = false; try { P4B.mapa(); } catch (e) {} },
    aoFim() { montarRecado(); lerRecadoDoLink(); try { P4B.aoFim(); } catch (e) {} },
    abrirGiz, aplicarMarcador, ligarFesta,
    // para o kit de teste (T.segredos)
    _teste: { CONQ4, temConq: () => CONQ4.every(c => (window.ROTEIRO.conquistas || []).some(x => x.id === c.id)), temConsole: () => !!(window.__segredos && typeof window.__segredos.davi === 'function'), faseLua, filtra, gizCodigos: GIZ }
  };
}
