// INTERFACE — lote 3: polimento e plataforma. Sons e animações dos menus, pausa com foto, morte que entra aos poucos,
// curva do medo e medidor de pulo no fim do capítulo, título com lanterna e giz, acessibilidade (leitura fácil, escala,
// narração, ARIA), ajustes para toque e controle, indicador de dano, ícone da aba que vive.
// Criado por src/interface.js (criarPolimento(C, U)); todos os ganchos são chamados por lá.
export function criarPolimento(C, U) {
  const $ = s => document.querySelector(s);
  const R = C.R, OPT = C.OPT;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rel = () => performance.now() / 1000;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const UI_KEY = 'hora-silencio-ui3';
  const mem = (() => { try { return JSON.parse(localStorage.getItem(UI_KEY)) || {}; } catch (e) { return {}; } })();
  const gravar = () => { try { localStorage.setItem(UI_KEY, JSON.stringify(mem)); } catch (e) {} };
  const sistemaMenosMov = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const menosMov = () => OPT.menosMov === 'sim' || (OPT.menosMov === 'auto' && sistemaMenosMov);
  const toque = () => document.body.classList.contains('toque');
  const BASE_MIN = [20 * 60 + 31, 20 * 60 + 47, 21 * 60, 21 * 60 + 18, 21 * 60 + 36, 21 * 60 + 52];
  const horaJogo = S => { const m = (BASE_MIN[S.chapter] || 21 * 60) + Math.floor((S.capT || 0) / 20); return `${Math.floor(m / 60) % 24}h${String(m % 60).padStart(2, '0')}`; };
  const contador = s => `${String(Math.floor(s / 60)).padStart(3, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const sala = () => (C.P.room && C.P.room.nome) || '';

  // conquistas secretas novas
  for (const c of [
    { id: 'segredo_esperando', nome: 'Ela Estava Esperando', desc: 'Deixe a tela de título parada até ela aparecer cinco vezes.', segredo: true },
    { id: 'segredo_moacir', nome: 'Ele Ouviu o Nome', desc: 'Diga o nome do Inspetor na tela de título.', segredo: true },
    { id: 'segredo_foto', nome: 'Revelação', desc: 'Repare no que a foto da pausa mostra quando você demora.', segredo: true }
  ]) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);

  // ------------------------------------------------------------ OPÇÕES NOVAS
  const PAD3 = { sonsMenu: true, leituraFacil: false, uiEsc: 1, legPos: 'baixo', narrar: false, menosMov: 'auto', bpm: false, avisoVisto: false, dano: true };
  for (const k in PAD3) { if (OPT[k] === undefined) OPT[k] = PAD3[k]; U.PAD[k] = PAD3[k]; }
  U.GRUPOS.push(['Conforto e acessibilidade', [
    { k: 'leituraFacil', nome: 'Letra fácil de ler (dislexia)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'uiEsc', nome: 'Tamanho da interface', tipo: 'range', min: .8, max: 1.5, step: .05 },
    { k: 'legPos', nome: 'Posição das legendas', tipo: 'sel', ops: [['baixo', 'Embaixo'], ['alto', 'No alto']] },
    { k: 'narrar', nome: 'Ler os menus em voz alta', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'sonsMenu', nome: 'Sons dos menus', tipo: 'sel', ops: [[true, 'Sim'], [false, 'Não']] },
    { k: 'menosMov', nome: 'Menos movimento nos menus', tipo: 'sel', ops: [['auto', 'Como o sistema'], ['sim', 'Sim'], ['nao', 'Não']] },
    { k: 'dano', nome: 'Mancha do lado de onde veio o golpe', tipo: 'sel', ops: [[true, 'Sim'], [false, 'Não']] },
    { k: 'bpm', nome: 'Batimento da Lia no canto (para lives)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] }
  ]]);
  function aplicar() {
    const b = document.body.classList;
    b.toggle('leitura-facil', !!OPT.leituraFacil); b.toggle('leg-alto', OPT.legPos === 'alto'); b.toggle('menos-mov', menosMov());
    document.documentElement.style.setProperty('--ui-esc', clamp(+OPT.uiEsc || 1, .8, 1.5));
    if (!OPT.narrar) try { speechSynthesis.cancel(); } catch (e) {}
  }

  // ------------------------------------------------------------ SONS DOS MENUS (procedural, no volume geral)
  let ruidoBuf = null;
  function audio() { const AC = C.AC; if (!AC || !C.master || AC.state !== 'running') return null; if (!ruidoBuf) { ruidoBuf = AC.createBuffer(1, AC.sampleRate * .7, AC.sampleRate); const d = ruidoBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return AC; }
  function ruido(AC, t, dur, tipo, f, q, vol, destino, f2) {
    const s = AC.createBufferSource(); s.buffer = ruidoBuf; const fl = AC.createBiquadFilter(); fl.type = tipo; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q;
    const g = AC.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + Math.min(.004, dur / 4)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(destino || C.master); s.start(t, Math.random() * .3); s.stop(t + dur + .02);
  }
  function tonal(AC, t, dur, f, f2, vol, tipo = 'sine') {
    const o = AC.createOscillator(); o.type = tipo; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = AC.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(C.master); o.start(t); o.stop(t + dur + .02);
  }
  let catracaT = 0;
  function tocar(tipo, arg) {
    if (!OPT.sonsMenu && /^(foco|ok|volta|catraca|troca|elastico|corte)$/.test(tipo)) return;
    const AC = audio(); if (!AC) return; const t = AC.currentTime;
    try {
      if (tipo === 'foco') ruido(AC, t, .028, 'bandpass', 2200 + Math.random() * 1400, 6, .05); // tique de máquina de escrever, altura sorteada
      else if (tipo === 'ok') { tonal(AC, t, .09, 150, 70, .12); ruido(AC, t, .03, 'highpass', 1800, 1, .05); } // carimbo
      else if (tipo === 'volta') { ruido(AC, t, .16, 'highpass', 2600, .5, .045); ruido(AC, t + .1, .09, 'highpass', 3600, .5, .03); } // papel
      else if (tipo === 'catraca') { if (t - catracaT < .06) return; catracaT = t; ruido(AC, t, .014, 'bandpass', 1300, 8, .05); }
      else if (tipo === 'troca') ruido(AC, t, .02, 'bandpass', 900, 4, .06); // interruptor velho
      else if (tipo === 'elastico') tonal(AC, t, .07, 260, 90, .07, 'triangle');
      else if (tipo === 'corte') ruido(AC, t, .14, 'bandpass', 4200, 1.2, .035, null, 1500);
      else if (tipo === 'rebobina') { ruido(AC, t, .65, 'bandpass', 3200, 2, .06, null, 500); tonal(AC, t, .6, 900, 220, .02, 'sawtooth'); }
      else if (tipo === 'tique') tonal(AC, t, .045, arg || 600, 0, .05, 'triangle');
      else if (tipo === 'pronto') { tonal(AC, t, .12, 880, 0, .05, 'triangle'); ruido(AC, t, .2, 'highpass', 3000, .7, .03); }
      else if (tipo === 'estalo') { const p = AC.createStereoPanner ? AC.createStereoPanner() : null; if (p) { p.pan.value = clamp(arg || 0, -1, 1); p.connect(C.master); } ruido(AC, t, .018, 'bandpass', 1500, 5, .14, p); ruido(AC, t + .03, .012, 'bandpass', 2100, 5, .08, p); }
      else if (tipo === 'grave') tonal(AC, t, .5, 62, 48, .14);
    } catch (e) {}
  }

  // ------------------------------------------------------------ ELEMENTOS NOVOS
  const hud = $('#hud');
  const novo = (tag, id, pai, html = '', cls) => { const e = document.createElement(tag); if (id) e.id = id; if (cls) e.className = cls; e.innerHTML = html; (pai || document.body).appendChild(e); return e; };
  const corte = novo('div', 'corte', document.body); corte.setAttribute('aria-hidden', 'true');
  const anuncio = novo('div', 'anuncio', document.body); anuncio.setAttribute('aria-live', 'assertive'); anuncio.className = 'so-leitor';
  const dano = novo('div', 'dano', hud); dano.hidden = true;
  const anelAna = novo('div', 'conta-ana', hud, Array.from({ length: 10 }, (_, i) => `<i style="transform:rotate(${i * 36}deg)"></i>`).join('')); anelAna.hidden = true;
  const objNovo = novo('div', 'obj-novo', hud, '<small>agora</small><span></span>'); objNovo.hidden = true;
  const splitMira = novo('div', 'split-mira', hud); splitMira.hidden = true;
  const bpm = novo('div', 'bpm', hud, '<i>♥</i><span></span>'); bpm.hidden = true;
  const voo = novo('div', 'inv-voo', hud); voo.hidden = true;
  // título: giz revelado pela lanterna do cursor, a menina que espera, descrição do botão
  const tit = $('#title');
  const GIZ = [['ELA CONTA ATÉ DEZ', 6, 18, -8], ['NÃO RESPONDA', 78, 14, 6], ['ANA · 7 ANOS', 9, 72, 4], ['TOMÉ', 86, 66, -12], ['DAVI ESTEVE AQUI', 70, 86, -3], ['|||| |||| ||||', 14, 44, 2], ['volte para a cama', 80, 40, 9], ['9', 4, 90, 0], ['QUEM ABRIU A MINHA GAVETA', 30, 94, -1], ['14/03/79', 90, 92, -6], ['NOVE BADALADAS', 40, 6, 3], ['LIA', 52, 60, -14]];
  const giz = novo('div', 't-giz', tit, GIZ.map(([t, x, y, r]) => `<span style="left:${x}%;top:${y}%;transform:translate(-50%,-50%) rotate(${r}deg)">${t}</span>`).join(''));
  giz.setAttribute('aria-hidden', 'true'); tit.insertBefore(giz, tit.firstChild);
  const vulto = novo('div', 't-vulto', tit, '<svg viewBox="0 0 60 160"><ellipse cx="30" cy="22" rx="13" ry="16" fill="#0b0a09"/><path d="M14 40 Q30 30 46 40 L52 150 Q30 158 8 150 Z" fill="#0b0a09"/><circle cx="25" cy="22" r="1.4" fill="#d8cfb8"/><circle cx="35" cy="22" r="1.4" fill="#d8cfb8"/></svg>'); vulto.hidden = true; vulto.setAttribute('aria-hidden', 'true');
  const tDesc = novo('div', 't-desc', null, ''); $('#title .menu').insertAdjacentElement('afterend', tDesc);
  const DESC_BOT = { 'b-cont': 'volta ao último ponto salvo', 'b-novo': 'começa a noite do portão do carro', 'b-caps': 'jogue de novo qualquer capítulo já liberado', 'b-conq': 'o que você já fez, e os segredos que faltam', 'b-fitas': 'as fitas que você já ouviu', 'b-opc': 'imagem, legendas, controles, conforto', 'b-stats': 'quantas vezes ele te achou', 'b-como': 'as quatro regras do internato numa folha só' };
  // título e pausa: "Como jogar"
  const bComo = document.createElement('button'); bComo.className = 'btn'; bComo.id = 'b-como'; bComo.textContent = 'Como jogar'; $('#b-opc').insertAdjacentElement('beforebegin', bComo);
  const pComo = document.createElement('button'); pComo.className = 'btn'; pComo.id = 'p-como'; pComo.textContent = 'Como jogar'; $('#p-opc').insertAdjacentElement('beforebegin', pComo);
  const como = novo('div', 'comojogar', document.body, '', 'screen'); como.hidden = true;
  // pausa: foto instantânea e contador de fita
  const polar = novo('figure', 'p-foto', $('#pause'), '<canvas width="240" height="150"></canvas><figcaption></figcaption>'); polar.hidden = true;
  const pFita = novo('div', 'p-fita', $('#pause'));
  // morte: contador de fita e o "quase"
  const dtFita = novo('div', 'dt-fita', $('#death')); $('#death').insertBefore(dtFita, $('#death').firstChild);
  const dtQuase = novo('div', 'dt-quase', null); $('#death-causa').insertAdjacentElement('afterend', dtQuase);
  // fim de capítulo: curva do coração, pulos e momentos marcados
  const fcMedo = novo('div', 'fc-medo', null, '<canvas width="460" height="96"></canvas><div class="frase"></div><div class="pulos"></div><div class="marcas"></div>');
  $('#fc-gancho').insertAdjacentElement('beforebegin', fcMedo);
  const fcSelo = novo('div', 'fc-ninguem', null, 'NINGUÉM TE OUVIU'); fcSelo.hidden = true; $('#fc-rank').insertAdjacentElement('afterend', fcSelo);
  // opções: busca e prévia das legendas
  const busca = document.createElement('input'); busca.type = 'search'; busca.id = 'op-busca'; busca.placeholder = 'procurar ajuste... (ex.: flash, legenda, mira)'; busca.setAttribute('aria-label', 'Procurar ajuste'); busca.autocomplete = 'off'; busca.spellcheck = false;
  $('#opcoes h2').insertAdjacentElement('afterend', busca);

  // ------------------------------------------------------------ ARIA
  const NOMES_TELA = { pause: 'Pausa', death: 'Você morreu', opcoes: 'Opções', diario: 'Diário', keypad: 'Teclado numérico', fimcap: 'Fim de capítulo', ending: 'Final', confirma: 'Confirmação', painel: 'Painel', note: 'Nota', comojogar: 'Como jogar', escolha: 'O portão', brilho: 'Ajuste o brilho' };
  for (const [id, nome] of Object.entries(NOMES_TELA)) { const el = $('#' + id); if (!el) continue; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', nome); }
  const nav = $('#diario nav'); nav.setAttribute('role', 'tablist'); nav.querySelectorAll('.btn').forEach(b => { b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', b.classList.contains('on') ? 'true' : 'false'); });
  $('#d-pane').setAttribute('role', 'tabpanel');
  $('#t-titulo').setAttribute('aria-label', 'A Hora do Silêncio');
  function anunciar(t) { anuncio.textContent = ''; setTimeout(() => { anuncio.textContent = t; }, 40); }

  // ------------------------------------------------------------ NARRAÇÃO DOS MENUS
  function falarMenu(t) { if (!OPT.narrar || !t || !window.speechSynthesis) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = 'pt-BR'; u.rate = 1.1; const v = speechSynthesis.getVoices().find(x => /^pt/i.test(x.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) {} }
  function rotulo(el) {
    if (!el) return '';
    const lab = el.closest('label');
    if (el.tagName === 'SELECT') return `${lab ? lab.firstChild.textContent.trim() : ''}, ${el.options[el.selectedIndex] ? el.options[el.selectedIndex].text : ''}`;
    if (el.type === 'range') return `${lab ? (lab.querySelector('span') || lab.firstChild).textContent.trim() : ''}, ${String(el.value).replace('.', ' vírgula ')}`;
    return el.getAttribute('aria-label') || el.textContent.trim();
  }

  // ------------------------------------------------------------ FOCO NOS MENUS: chama, som, narração, descrição
  let focoT = 0, focosRapidos = 0;
  document.addEventListener('focusin', e => {
    const el = e.target; if (!el || !el.closest || !el.closest('.screen')) return;
    const r = rel(); focosRapidos = r - focoT < .12 ? focosRapidos + 1 : 0; focoT = r;
    if (el.classList.contains('btn')) {
      tocar('foco');
      if (focosRapidos >= 3) { el.classList.add('apaga'); setTimeout(() => el.classList.remove('apaga'), 500); } // navegar rápido demais apaga a chama
    } else tocar('troca');
    falarMenu(rotulo(el));
    if (el.closest('#title')) { tDesc.textContent = DESC_BOT[el.id] || ''; luzFoco(el); }
    // opções abertas pela pausa: mexer no brilho ou no campo de visão deixa o painel transparente para ver o jogo atrás
    const k = el.dataset && el.dataset.k; document.body.classList.toggle('op-previa', !!(k && /^(brilho|fov)$/.test(k) && opcPelaPausa()));
  });
  document.addEventListener('mouseover', e => { const b = e.target.closest && e.target.closest('#title .menu .btn'); if (b) tDesc.textContent = DESC_BOT[b.id] || ''; });
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('.screen .btn'); if (!b || b.closest('#diario nav')) return;
    if (/voltar|fechar|sair|^n[aã]o$|cancelar/i.test(b.textContent.trim()) || /voltar|fechar|sair/.test(b.id)) tocar('volta'); else tocar('ok');
  }, true);
  document.addEventListener('input', e => { const el = e.target; if (el.type === 'range') { tocar('catraca'); el.setAttribute('aria-valuetext', String(el.value).replace('.', ',')); if (el === document.activeElement) falarMenu(String(el.value).replace('.', ' vírgula ')); } }, true);
  document.addEventListener('change', e => { if (e.target.tagName === 'SELECT') { tocar('troca'); if (e.target === document.activeElement) falarMenu(rotulo(e.target)); } }, true);
  // roda do mouse sobre um controle deslizante muda o valor
  document.addEventListener('wheel', e => {
    const el = e.target; if (!el || el.type !== 'range' || !el.closest('.screen')) return;
    e.preventDefault(); const st = +el.step || .1, v = clamp(+el.value + (e.deltaY < 0 ? st : -st), +el.min, +el.max);
    el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
  }, { passive: false });
  const opcPelaPausa = () => !!(C.S && C.mode === 'jogo' && !$('#opcoes').hidden);

  // ------------------------------------------------------------ TELAS QUE ABREM E FECHAM
  let pausaAberta = 0, fantasmaFeito = false;
  function cortar() { if (menosMov() || window.__teste) return; corte.className = ''; void corte.offsetWidth; corte.className = OPT.vFlash ? 'fade' : 'fita'; tocar('corte'); }
  function mostrou(el) {
    const id = el.id;
    if (id === 'pause') { cortar(); fotoPausa(); }
    else if (id === 'diario') try { C.SFX.papel(); } catch (e) {}
    else if (id === 'note') try { C.SFX.papel(); } catch (e) {}
    else if (id === 'title') { if (!menosMov() && !window.__teste) { tit.classList.remove('liga'); void tit.offsetWidth; tit.classList.add('liga'); } ocioso = 0; vultoVisto = false; }
    else if (id === 'opcoes' || id === 'painel' || id === 'comojogar') cortar();
    else if (id === 'death') morteAbriu();
    else if (id === 'ending') finalAbriu();
    else if (id === 'fimcap') fcAbriu();
  }
  function escondeu(el) {
    if (el.id === 'diario') tocar('elastico');
    if (el.id === 'pause') { polar.hidden = true; document.body.classList.remove('pausado'); }
    if (el.id === 'opcoes') document.body.classList.remove('op-previa');
  }
  const obs = new MutationObserver(ms => { for (const m of ms) { const el = m.target; if (m.attributeName !== 'hidden') continue; if (el.hidden) escondeu(el); else mostrou(el); } });
  const observar = () => document.querySelectorAll('.screen').forEach(s => { if (!s.__pl) { s.__pl = true; obs.observe(s, { attributes: true, attributeFilter: ['hidden'] }); } });
  observar();
  // abas do diário: página virando, som de papel, aria-selected
  new MutationObserver(() => {
    const on = nav.querySelector('.btn.on'); nav.querySelectorAll('.btn').forEach(b => b.setAttribute('aria-selected', b === on ? 'true' : 'false'));
    if (on && on !== nav.__on) { if (nav.__on) { const p = $('#d-pane'); p.classList.remove('vira'); void p.offsetWidth; if (!menosMov()) p.classList.add('vira'); try { C.SFX.papel(); } catch (e) {} } nav.__on = on; }
  }).observe(nav, { attributes: true, subtree: true, attributeFilter: ['class'] });
  // diário no toque: deslizar para o lado troca a aba
  let swX = null;
  $('#diario').addEventListener('touchstart', e => { swX = e.changedTouches[0].clientX; }, { passive: true });
  $('#diario').addEventListener('touchend', e => { if (swX === null) return; const dx = e.changedTouches[0].clientX - swX; swX = null; if (Math.abs(dx) > 70 && window.__jogo) window.__jogo.onKey({ code: dx < 0 ? 'ArrowRight' : 'ArrowLeft', preventDefault() {} }); }, { passive: true });
  // cofre no toque: erro vibra
  new MutationObserver(() => { if ($('#keypad').classList.contains('erro') && toque()) try { navigator.vibrate && navigator.vibrate([40, 30, 40]); } catch (e) {} }).observe($('#keypad'), { attributes: true, attributeFilter: ['class'] });
  // fim de capítulo no toque: tocar na tela segue
  addEventListener('pointerup', e => { if (e.pointerType === 'touch' && !$('#fimcap').hidden && rel() - U.fimCapT() > 1.5) C.pularFimCap(); });

  // ------------------------------------------------------------ PAUSA: foto instantânea, contador, o que aparece se demorar
  function fotoPausa() {
    const S = C.S; pausaAberta = rel(); document.body.classList.add('pausado');
    if (!S || !C.scene || window.__teste) { polar.hidden = true; pFita.textContent = ''; return; }
    pFita.innerHTML = `<b>PAUSA ▌▌</b> ${contador(S.tempo)}`;
    try {
      C.renderer.render(C.scene, C.camera);
      const cv = polar.querySelector('canvas'), g = cv.getContext('2d'), src = C.renderer.domElement;
      const k = Math.max(cv.width / src.width, cv.height / src.height), w = src.width * k, h = src.height * k;
      g.filter = 'sepia(.55) contrast(1.15) brightness(1.25)'; g.drawImage(src, (cv.width - w) / 2, (cv.height - h) / 2, w, h); g.filter = 'none';
      g.fillStyle = 'rgba(255,240,200,.05)'; for (let i = 0; i < 120; i++) g.fillRect(Math.random() * cv.width, Math.random() * cv.height, 1, 1);
      polar.querySelector('figcaption').textContent = `${horaJogo(S)}${sala() ? ', ' + sala().toLowerCase() : ''}`;
      polar.classList.remove('fantasma'); polar.hidden = false; polar.style.setProperty('--r', (Math.random() * 6 - 3).toFixed(1) + 'deg');
    } catch (e) { polar.hidden = true; }
  }
  function fantasmaPausa() { // uma vez por noite, depois de 40 s parada na pausa: uma figura pequena no escuro da foto
    const S = C.S; if (fantasmaFeito || !S || polar.hidden || (S.flags && S.flags.ui3foto)) return;
    fantasmaFeito = true; S.flags.ui3foto = true;
    const cv = polar.querySelector('canvas'), g = cv.getContext('2d'), x = 30 + Math.random() * (cv.width - 60), y = cv.height * .45;
    g.fillStyle = 'rgba(12,10,8,.85)'; g.beginPath(); g.ellipse(x, y, 5, 6.5, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(x - 7, y + 6); g.lineTo(x + 7, y + 6); g.lineTo(x + 9, y + 34); g.lineTo(x - 9, y + 34); g.fill();
    g.fillStyle = 'rgba(230,220,200,.75)'; g.fillRect(x - 2.5, y - 1, 1.2, 1.2); g.fillRect(x + 1.5, y - 1, 1.2, 1.2);
    polar.classList.add('fantasma'); polar.__fx = x / cv.width;
  }
  polar.addEventListener('mousemove', () => {
    if (!polar.classList.contains('fantasma')) return;
    polar.classList.remove('fantasma'); fotoLimpa();
    const info = $('#p-info'); if (info) info.insertAdjacentHTML('beforeend', '<br><em class="lembra">Ela está contando.</em>');
    C.conquista('segredo_foto');
  });
  function fotoLimpa() { try { C.renderer.render(C.scene, C.camera); const cv = polar.querySelector('canvas'), g = cv.getContext('2d'), src = C.renderer.domElement, k = Math.max(cv.width / src.width, cv.height / src.height); g.filter = 'sepia(.55) contrast(1.15) brightness(1.25)'; g.drawImage(src, (cv.width - src.width * k) / 2, (cv.height - src.height * k) / 2, src.width * k, src.height * k); g.filter = 'none'; } catch (e) {} }

  // ------------------------------------------------------------ COMO JOGAR
  let comoVolta = null;
  const DESENHO = {
    ouve: '<svg viewBox="0 0 80 60"><path d="M10 50 Q20 20 30 50" stroke="#cfc3a6" fill="none" stroke-width="2"/><circle cx="20" cy="18" r="6" fill="none" stroke="#cfc3a6" stroke-width="2"/><path d="M48 30a10 10 0 0 1 0 0M45 22q8 8 0 16M52 16q14 14 0 28M59 10q20 20 0 40" stroke="#8e1b14" fill="none" stroke-width="2"/></svg>',
    anda: '<svg viewBox="0 0 80 60"><path d="M6 30 L30 18 L30 42 Z" fill="#d8c27a" opacity=".7"/><circle cx="58" cy="20" r="6" fill="none" stroke="#cfc3a6" stroke-width="2"/><path d="M52 52 L58 28 L64 52" stroke="#cfc3a6" fill="none" stroke-width="2"/><path d="M40 8 L44 14 M70 8 L66 14" stroke="#8e1b14" stroke-width="2"/></svg>',
    luzes: '<svg viewBox="0 0 80 60"><circle cx="18" cy="16" r="7" fill="#d8c27a" opacity=".3"/><circle cx="40" cy="16" r="7" fill="#d8c27a"/><circle cx="62" cy="16" r="7" fill="#d8c27a" opacity=".2"/><rect x="28" y="30" width="24" height="26" fill="none" stroke="#cfc3a6" stroke-width="2"/><path d="M33 36h14M33 40h14" stroke="#cfc3a6"/></svg>',
    chama: '<svg viewBox="0 0 80 60"><text x="10" y="26" fill="#cfc3a6" font-size="14" font-family="IM Fell English" font-style="italic">"Lia..."</text><path d="M20 44 L60 44" stroke="#cfc3a6" stroke-width="2"/><path d="M30 36 L50 52 M50 36 L30 52" stroke="#8e1b14" stroke-width="3"/></svg>'
  };
  function montarComo() {
    const pad = document.body.classList.contains('pad'), tq = toque();
    const T = tq ? { andar: 'círculo da esquerda', usar: 'botão Usar', agachar: 'botão Agachar', ar: 'botão Fôlego', luz: 'botão Lanterna' }
      : pad ? { andar: 'analógico esquerdo', usar: 'A', agachar: 'B', ar: 'RB', luz: 'Y' }
      : { andar: 'WASD', usar: 'E', agachar: 'C', ar: 'ESPAÇO', luz: 'F' };
    como.innerHTML = `<div class="paper como-folha"><h2>Como sobreviver a esta noite</h2>
      <div class="regra">${DESENHO.ouve}<p><b>Ele ouve.</b> O Inspetor é cego e caça pelo barulho. Ande agachada (${T.agachar}), não corra perto dele, e escondida segure ${T.ar} para prender o ar.</p></div>
      <div class="regra">${DESENHO.anda}<p><b>Ela anda quando você não vê.</b> A Menina só se mexe no escuro ou pelas suas costas. Luz nela (${T.luz}) e ande de costas.</p></div>
      <div class="regra">${DESENHO.luzes}<p><b>As luzes piscam: esconda-se.</b> Quando a luz falha e o rádio chia, a Procissão vem. Armário ou cama (${T.usar}), já.</p></div>
      <div class="regra">${DESENHO.chama}<p><b>O chamado: não vá.</b> Se alguém chamar seu nome da sala ao lado, não é quem você pensa.</p></div>
      <small class="como-teclas">${tq || pad ? '' : 'WASD andar · SHIFT correr · ALT devagar · C agachar · ESPAÇO prender o ar · Z/X espiar · Q olhar atrás · E usar · F lanterna · R pilha · H curativo · G garrafa · TAB diário · O objetivo · F8 marca o momento'}</small>
      <div style="text-align:center;margin-top:12px"><button class="btn" id="cj-voltar">Voltar${tq ? '' : ' (ESC)'}</button></div></div>`;
    $('#cj-voltar').onclick = fecharComo;
  }
  function abrirComo(de) { comoVolta = de; montarComo(); $(de).hidden = true; como.hidden = false; U.focar('#comojogar'); }
  function fecharComo() { if (como.hidden) return; como.hidden = true; if (comoVolta) $(comoVolta).hidden = false; U.focar(comoVolta); comoVolta = null; }
  bComo.onclick = () => abrirComo('#title'); pComo.onclick = () => abrirComo('#pause');
  observar();

  // ------------------------------------------------------------ OPÇÕES: busca, prévia das legendas, marca do que mudou
  function opcoes(box) {
    busca.value = '';
    for (const lab of box.querySelectorAll('label.op')) { const el = lab.querySelector('[data-k]'); if (!el) continue; const k = el.dataset.k; if (k in U.PAD && String(U.PAD[k]) !== String(OPT[k])) lab.classList.add('mudou'); }
    const legH = [...box.querySelectorAll('h3')].find(h => h.textContent === 'Legendas');
    if (legH) { let ult = legH.nextElementSibling; while (ult && ult.nextElementSibling && ult.nextElementSibling.tagName !== 'H3') ult = ult.nextElementSibling; const pv = document.createElement('div'); pv.id = 'op-previa-leg'; (ult || legH).insertAdjacentElement('afterend', pv); previaLeg(); }
    box.querySelectorAll('[data-k]').forEach(el => { el.addEventListener('change', () => { const lab = el.closest('label.op'), k = el.dataset.k; if (lab) lab.classList.toggle('mudou', k in U.PAD && String(U.PAD[k]) !== String(OPT[k])); previaLeg(); }); if (el.type === 'range') el.setAttribute('aria-valuetext', String(el.value).replace('.', ',')); });
  }
  function previaLeg() {
    const pv = $('#op-previa-leg'); if (!pv) return;
    const d = R.personagens.davi || { nome: 'Davi', cor: '#9fc3d8' }, simb = OPT.somSimb ? '▲ ' : '';
    pv.innerHTML = `<small>prévia</small><div class="pv-som">${simb}[passos pesados atrás de você, perto]</div><div class="pv-fala"><span class="quem" style="color:${d.cor}">${OPT.contraste ? '△ ' : ''}${esc(d.nome)}</span><span style="color:${d.cor}">Lia... eu ainda tô aqui embaixo.</span></div>`;
  }
  busca.addEventListener('input', () => {
    const q = busca.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''), box = $('#op-grupos');
    let h3 = null, vis = 0;
    const fechar = () => { if (h3) h3.hidden = !vis; };
    for (const el of box.children) {
      if (el.tagName === 'H3') { fechar(); h3 = el; vis = 0; continue; }
      if (!el.classList.contains('op')) continue;
      const ok = !q || el.textContent.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q); el.hidden = !ok; if (ok) vis++;
    }
    fechar();
  });

  // ------------------------------------------------------------ AVISO DE CONTEÚDO E FOTOSSENSIBILIDADE (uma vez)
  let avisoAberto = false;
  function aviso(cb) {
    if (OPT.avisoVisto || window.__teste) return cb();
    const el = $('#confirma');
    $('#cf-txt').innerHTML = 'Este caderno fala de crianças que morreram, de fogo e de sangue. Há sustos altos, relâmpagos e luzes piscando.<br><small>Dá para mudar tudo depois em Opções.</small>';
    $('#cf-sim').textContent = 'Entrar'; $('#cf-nao').textContent = 'Reduzir flashes e entrar';
    avisoAberto = true;
    const fim = reduz => { if (el.hidden) return; el.hidden = true; avisoAberto = false; OPT.avisoVisto = true; if (reduz) OPT.vFlash = 1; C.salvarOpt(); U.aplicar(); cb(); };
    $('#cf-sim').onclick = () => fim(false); $('#cf-nao').onclick = () => fim(true);
    el.hidden = false; el.classList.add('aviso');
    setTimeout(() => { el.classList.remove('aviso'); (sistemaMenosMov ? $('#cf-nao') : $('#cf-sim')).focus(); }, 40);
  }

  // ------------------------------------------------------------ TÍTULO: lanterna do cursor, giz, quem espera, segredo do nome
  let mx = innerWidth / 2, my = innerHeight / 2, lx = mx, ly = my, ocioso = 0, ultMov = 0, vultoVisto = false, estaticaFeita = false, moacirT = 0;
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY; ultMov = rel();
    if (C.mode === 'titulo') { if (vulto.classList.contains('on')) { vulto.classList.remove('on'); setTimeout(() => { vulto.hidden = true; }, vulto.classList.contains('fica') ? 160 : 40); } ocioso = 0; estaticaFeita = false; giz.classList.remove('falha'); }
  }, { passive: true });
  function luzFoco(el) { if (rel() - ultMov < 1.5) return; const r = el.getBoundingClientRect(); mx = r.left + r.width / 2; my = r.top + r.height / 2; }
  function titulo(dt) {
    if (tit.hidden) return;
    lx = lerp(lx, mx, Math.min(1, dt * 7)); ly = lerp(ly, my, Math.min(1, dt * 7));
    giz.style.setProperty('--mx', lx.toFixed(0) + 'px'); giz.style.setProperty('--my', ly.toFixed(0) + 'px');
    ocioso += dt;
    if (ocioso > 20) giz.classList.add('falha'); // parado demais, a luz falha
    if (ocioso > 45 && !estaticaFeita) { estaticaFeita = true; try { C.SFX.estatica(1.4); } catch (e) {} const rr = $('#radiorel'); if (rr) { rr.classList.add('sint'); setTimeout(() => rr.classList.remove('sint'), 1600); } }
    if (ocioso > 90 && !vultoVisto) {
      vultoVisto = true; vulto.hidden = false; void vulto.offsetWidth; vulto.classList.add('on');
      mem.esperou = (mem.esperou || 0) + 1; gravar();
      if (mem.esperou >= 5) { vulto.classList.add('fica'); C.conquista('segredo_esperando'); }
    }
    if (moacirT > 0) { moacirT -= dt; if (moacirT <= 0) { tit.classList.remove('sem-cursor'); const rr = $('#radiorel'); if (rr) rr.classList.remove('apagado'); U.subTitulo('Volte para a cama.'); } }
  }
  function teclaTitulo(digitado) {
    if (moacirT > 0) tocar('estalo', mx < innerWidth / 2 ? .85 : -.85); // cada tecla, um estalo do lado oposto ao do mouse
    if (!digitado.endsWith('MOACIR')) return false;
    moacirT = 20; tit.classList.add('sem-cursor'); const rr = $('#radiorel'); if (rr) rr.classList.add('apagado');
    tocar('estalo', mx < innerWidth / 2 ? .85 : -.85); C.conquista('segredo_moacir'); U.subTitulo('...');
    return true;
  }
  function atualizarTitulo() {
    const sv = C.lsGet(C.SAVE_KEY, null), el = $('#t-save'); if (!sv || !R.capitulos[sv.chapter]) return;
    const c = R.capitulos[sv.chapter], o = c.objetivos.find(x => !(sv.done || {})[x.id]);
    let linha = o ? `<span class="falta">faltava: ${esc(o.texto.replace(/\s*\(\{n\}\/\d\)/, '').replace('{n}', ''))}</span>` : '';
    if (mem.salvoEm) { const h = (Date.now() - mem.salvoEm) / 3600000; linha += `<span class="quando">${h < 1 ? 'salvo há pouco' : h < 24 ? `salvo há ${Math.floor(h)} h` : `salvo há ${Math.floor(h / 24)} dia${h >= 48 ? 's' : ''}`}</span>`; }
    if (linha) el.innerHTML = esc(el.textContent) + '<br>' + linha;
  }
  // continuar depois de muito tempo longe: a Lia lembra onde estava
  $('#b-cont').addEventListener('click', () => {
    const longe = mem.salvoEm && Date.now() - mem.salvoEm > 12 * 3600000; if (!longe) return;
    setTimeout(() => { const S = C.S; if (!S || C.mode !== 'jogo') return; const o = U.objAtual(), lb = U.lembranca(); C.toast(`Da última vez: ${R.capitulos[S.chapter].titulo}.${o ? ' Agora: ' + o.texto.replace(/\s*\(\{n\}\/\d\)/, '') + '.' : ''}${lb ? ' ' + lb.charAt(0).toUpperCase() + lb.slice(1) + '.' : ''}`); }, 4200);
  });

  // ------------------------------------------------------------ MORTE
  let morteInfo = null;
  function morte(quem) {
    const S = C.S, P = C.P, W = C.W; if (!S) return;
    marcarCurva('✕');
    let q = '';
    if (quem !== 'ana' && W.lockers && W.lockers.length) {
      let md = 1e9; for (const L of W.lockers) { const d = Math.hypot(L.x - P.pos.x, L.z - P.pos.z); if (d < md) md = d; }
      if (md < 16) q = md < 1.2 ? 'Você estava encostada num esconderijo.' : `O esconderijo mais perto estava a ${md.toFixed(1).replace('.', ',')} m.`;
    } else if (quem === 'ana' && C.W.doors && C.W.doors.length) {
      let md = 1e9; for (const d of C.W.doors) { try { const p = d.pivot.getWorldPosition ? d.pivot.getWorldPosition(new C.camera.position.constructor()) : null; if (!p) continue; const dd = Math.hypot(p.x - P.pos.x, p.z - P.pos.z); if (dd < md) md = dd; } catch (e) {} }
      if (md < 14) q = `A porta mais perto estava a ${md.toFixed(1).replace('.', ',')} m. Ela não abre portas.`;
    }
    dtQuase.textContent = q; dtQuase.hidden = !q;
    dtFita.innerHTML = `<span>■ STOP</span> ${contador(S.tempo)}`;
    morteInfo = { quem };
  }
  function morteAbriu() {
    const d = $('#death'); d.classList.remove('entra'); void d.offsetWidth; if (!menosMov()) d.classList.add('entra');
    setTimeout(() => desenharMapaAos(), 0);
  }
  function desenharMapaAos() { // o mini mapa da morte se desenha da esquerda para a direita
    const cv = $('#death-mapa'); if (cv.hidden || menosMov()) return;
    cv.classList.remove('revela'); void cv.offsetWidth; cv.classList.add('revela');
  }
  $('#dt-retry').addEventListener('click', () => { // tentar de novo rebobina a fita
    if (!C.S || !C.S.dead) return; tocar('rebobina');
    if (menosMov() || window.__teste) return;
    corte.className = ''; void corte.offsetWidth; corte.className = OPT.vFlash ? 'fade' : 'rebobina';
  }, true);

  // ------------------------------------------------------------ CURVA DO MEDO, PULOS E MOMENTOS MARCADOS
  let curva = [], curvaCap = -1, curvaT = 0, pulos = [], marcas = [], medoHist = [], janelaPulo = 0, somaMouse = 0, pulosTotal = [];
  addEventListener('mousemove', e => { if (janelaPulo > 0) somaMouse += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0); }, { passive: true });
  function quemAgora() { const M = C.M; return M.ativo && M.state === 'caca' ? '◆' : C.ANA.ativa ? '○' : C.PROC.fase ? '△' : M.ativo && M.pos.distanceTo(C.P.pos) < 8 ? '◇' : ''; }
  function marcarCurva(s) { if (curva.length) curva[curva.length - 1].x = s; }
  function curvaFrame(dt) {
    const S = C.S; if (S.chapter !== curvaCap) { curvaCap = S.chapter; curva = []; pulos = []; marcas = marcas.filter(m => m.cap === S.chapter); }
    curvaT -= dt; if (curvaT <= 0) { curvaT = 2; curva.push({ f: S.fear, s: sala(), q: quemAgora(), h: horaJogo(S) }); if (curva.length > 600) curva.splice(0, curva.length - 600); }
    // medidor de pulo: o medo dispara (susto) e, nos 400 ms seguintes, o mouse dá um tranco
    medoHist.push([rel(), S.fear]); while (medoHist.length && medoHist[0][0] < rel() - .5) medoHist.shift();
    if (janelaPulo <= 0 && medoHist.length && S.fear - medoHist[0][1] >= 18) { janelaPulo = .4; somaMouse = 0; }
    if (janelaPulo > 0) { janelaPulo -= dt; if (janelaPulo <= 0 && somaMouse > 600) { pulos.push({ s: sala(), v: somaMouse }); pulosTotal.push({ s: sala(), v: somaMouse }); } }
  }
  function desenharCurva() {
    const cv = fcMedo.querySelector('canvas'), g = cv.getContext('2d'), W = cv.width, H = cv.height;
    g.clearRect(0, 0, W, H);
    if (curva.length < 3) { fcMedo.hidden = true; return; }
    fcMedo.hidden = false;
    g.fillStyle = '#030a05'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(60,160,90,.12)'; g.lineWidth = 1; for (let x = 0; x < W; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y < H; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    const n = curva.length, sx = i => 6 + i / (n - 1) * (W - 12), sy = f => H - 10 - f / 100 * (H - 22);
    g.strokeStyle = '#5fd17f'; g.lineWidth = 1.6; g.shadowColor = '#5fd17f'; g.shadowBlur = 6; g.beginPath();
    curva.forEach((p, i) => { const x = sx(i), y = sy(p.f); if (!i) g.moveTo(x, y); else { const bate = p.f > 55 ? (p.f - 55) / 45 * 14 : 0; g.lineTo(x - 2, y); if (bate) { g.lineTo(x - 1, y - bate); g.lineTo(x, y + bate * .5); } g.lineTo(x, y); } });
    g.stroke(); g.shadowBlur = 0;
    let pico = 0; curva.forEach((p, i) => { if (p.f > curva[pico].f) pico = i; });
    g.font = '13px "Special Elite", monospace'; g.textAlign = 'center';
    curva.forEach((p, i) => {
      if (p.x) { g.fillStyle = '#d0584a'; g.fillText('✕', sx(i), sy(p.f) - 6); }
      else if (p.q && (i === pico || (p.f > 70 && i % 4 === 0))) { g.fillStyle = '#c9a75a'; g.fillText(p.q, sx(i), Math.max(12, sy(p.f) - 6)); }
    });
    const pk = curva[pico];
    fcMedo.querySelector('.frase').textContent = pk.f > 60 ? `Seu coração quase parou${pk.s ? ' em ' + pk.s.toLowerCase() : ''}, às ${pk.h}.` : 'Uma noite quase calma. Quase.';
    cv.setAttribute('aria-label', 'Curva do medo no capítulo. ' + fcMedo.querySelector('.frase').textContent); cv.setAttribute('role', 'img');
  }
  const textoPulos = lista => { if (!lista.length) return ''; const m = lista.reduce((a, b) => b.v > a.v ? b : a); return `Você pulou ${lista.length} ${lista.length === 1 ? 'vez' : 'vezes'}.${m.s ? ' O maior foi em ' + m.s.toLowerCase() + '.' : ''}`; };
  function fcAbriu() {
    desenharCurva();
    fcMedo.querySelector('.pulos').textContent = textoPulos(pulos);
    const S = C.S, ms = marcas.filter(m => m.cap === (S ? S.chapter : -1) || m.cap === curvaCap);
    fcMedo.querySelector('.marcas').innerHTML = ms.length ? '<b>momentos marcados (F8)</b>' + ms.map(m => `<div>${m.real} · ${m.hora}${m.sala ? ' · ' + esc(m.sala) : ''}${m.ev ? ' — ' + m.ev : ''}</div>`).join('') : '';
  }
  function finalAbriu() {
    let el = $('#e-pulos'); if (!el) { el = document.createElement('div'); el.id = 'e-pulos'; el.className = 'stats'; $('#e-stats').insertAdjacentElement('afterend', el); }
    el.textContent = textoPulos(pulosTotal);
  }
  const inicioSessao = rel();
  function marcarMomento() {
    const S = C.S, M = C.M, s = Math.floor(rel() - inicioSessao);
    const real = `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    const ev = M.ativo && M.state === 'caca' ? 'ele caçava você' : M.ativo && M.pos.distanceTo(C.P.pos) < 6 ? 'o Inspetor estava a poucos metros' : C.ANA.ativa ? 'a Menina estava perto' : C.PROC.fase ? 'a Procissão' : S.hidden ? 'escondida' : '';
    marcas.push({ cap: S.chapter, real, hora: horaJogo(S), sala: sala(), ev }); if (marcas.length > 30) marcas.shift();
    C.toast(`Momento marcado · ${real}`);
  }

  // ------------------------------------------------------------ FIM DE CAPÍTULO: pontos que sobem, carimbo, selo
  function fimCap(c, rk) {
    const S = C.S, bs = [...$('#fc-crit').querySelectorAll('b')];
    const alvos = bs.map(b => +b.textContent.replace(/\D/g, '') || 0); bs.forEach(b => { b.textContent = '+0'; });
    let i = 0, n = 0;
    const passo = () => { if (i >= bs.length || $('#fimcap').hidden) return; if (n < alvos[i]) { n++; bs[i].textContent = '+' + n; tocar('catraca'); setTimeout(passo, 160); } else { i++; n = 0; setTimeout(passo, 220); } };
    setTimeout(passo, 300);
    setTimeout(() => { if ($('#fimcap').hidden) return; if (!menosMov()) { const f = $('#fimcap'); f.classList.remove('tranco'); void f.offsetWidth; f.classList.add('tranco'); } if (rk === 'S') try { C.SFX.sino(.35, null); } catch (e) {} else tocar('ok'); }, 520);
    fcSelo.hidden = !(S && S.capVisto === 0);
  }

  // ------------------------------------------------------------ OBJETIVOS: o novo aparece no meio, anúncio para leitor de tela, parcial na mira
  function objetivo(id) {
    const S = C.S; if (!S) return;
    setTimeout(() => {
      const o = U.objAtual(); if (!o || C.mode !== 'jogo') return;
      const t = o.texto.replace(/\s*\(\{n\}\/\d\)/, '').replace('{n}', '');
      anunciar('Novo objetivo: ' + t);
      const M = C.M; if ((M.ativo && (M.state === 'caca' || M.state === 'investiga')) || C.PROC.fase) return;
      objNovo.querySelector('span').textContent = t; objNovo.hidden = false; objNovo.classList.remove('on'); void objNovo.offsetWidth; objNovo.classList.add('on');
      clearTimeout(objNovo.__to); objNovo.__to = setTimeout(() => { objNovo.hidden = true; }, 2300);
      tocar('grave');
    }, 450);
    // parcial grande embaixo da mira (cronômetro ligado), menos com perigo a menos de 8 m
    const sp = $('#split'), M = C.M;
    if (OPT.cron && !sp.hidden && !(M.ativo && M.pos.distanceTo(C.P.pos) < 8)) {
      splitMira.textContent = sp.textContent; splitMira.className = sp.className; splitMira.hidden = false; tocar('tique', 1400);
      clearTimeout(splitMira.__to); splitMira.__to = setTimeout(() => { splitMira.hidden = true; }, 1200);
    }
  }
  function salvou() { mem.salvoEm = Date.now(); gravar(); }

  // ------------------------------------------------------------ CONTAGEM DA MENINA EM ANEL, SETA DE QUEM FALA
  let contaT = 0;
  function som(k, a) {
    if (k !== 'contagem' || !OPT.olhoAna || C.mode !== 'jogo' || !C.S || C.S.dead) return;
    const n = clamp((a && a[1]) | 0, 0, 9);
    anelAna.querySelectorAll('i').forEach((t, i) => t.classList.toggle('on', i <= n));
    anelAna.classList.toggle('dez', n >= 9); anelAna.hidden = false; contaT = n >= 9 ? 1 : 3;
  }
  const ENT = { inspetor: () => C.M.ativo && C.M.pos, moacir: () => C.M.ativo && C.M.pos, ana: () => C.ANA.ativa && C.ANA.pos };
  function fala(quem) {
    const f = ENT[quem], pos = f && f(); if (!pos || !C.P.pos) return;
    const dr = U.direcao(pos); if (Math.abs(dr.a) < 35 && dr.d > 2) return;
    const q = $('#sub .quem'); if (!q) return;
    const s = document.createElement('span'); s.className = 'seta-fala';
    s.textContent = `${Math.abs(dr.a) > 140 ? '▾' : dr.a > 0 ? '▸' : '◂'} ${dr.d < 4 ? 'perto' : dr.d > 14 ? 'longe' : ''}`.trim();
    s.setAttribute('aria-label', dr.txt); q.appendChild(s);
  }

  // ------------------------------------------------------------ ÍCONE DA ABA QUE VIVE
  const favCv = document.createElement('canvas'); favCv.width = favCv.height = 32;
  let favEstado = '', favT = 0, favLink = document.querySelector('link[rel=icon]');
  function favicon(dt) {
    favT -= dt; if (favT > 0) return; favT = .5;
    const S = C.S, M = C.M;
    const e = document.hidden && C.mode === 'jogo' ? 'oculta' : C.ui === 'pausa' ? 'pausa' : C.mode !== 'jogo' || !S ? 'titulo' : M.ativo && M.state === 'caca' ? 'caca' : C.ANA.ativa ? 'ana' : 'paz';
    if (e === favEstado) return; favEstado = e;
    if (e === 'titulo') { if (favLink.__orig) favLink.href = favLink.__orig; return; }
    if (!favLink.__orig) favLink.__orig = favLink.getAttribute('href');
    const g = favCv.getContext('2d'); g.clearRect(0, 0, 32, 32); g.fillStyle = '#050505'; g.fillRect(0, 0, 32, 32); g.lineWidth = 2.4;
    if (e === 'paz') { g.fillStyle = '#c9a75a'; g.beginPath(); g.moveTo(16, 5); g.quadraticCurveTo(7, 7, 7, 22); g.lineTo(25, 22); g.quadraticCurveTo(25, 7, 16, 5); g.fill(); g.beginPath(); g.arc(16, 25, 3, 0, Math.PI * 2); g.fill(); }
    else if (e === 'ana' || e === 'oculta') { g.strokeStyle = '#e9dfc8'; g.beginPath(); if (e === 'ana') { g.moveTo(3, 16); g.quadraticCurveTo(16, 3, 29, 16); g.quadraticCurveTo(16, 29, 3, 16); g.stroke(); g.fillStyle = '#e9dfc8'; g.beginPath(); g.arc(16, 16, 4.5, 0, Math.PI * 2); g.fill(); } else { g.moveTo(3, 14); g.quadraticCurveTo(16, 26, 29, 14); g.stroke(); for (const x of [9, 16, 23]) { g.beginPath(); g.moveTo(x, 20); g.lineTo(x, 26); g.stroke(); } } }
    else if (e === 'caca') { g.fillStyle = '#b3241a'; g.fillRect(9, 13, 14, 15); for (let i = 0; i < 4; i++) g.fillRect(9 + i * 3.6, 4 + (i === 0 ? 4 : 0), 2.6, 11); g.fillRect(4, 15, 6, 3); }
    else if (e === 'pausa') { g.fillStyle = '#e9dfc8'; g.fillRect(13, 14, 6, 15); g.fillStyle = '#e8a23a'; g.beginPath(); g.ellipse(16, 9, 3, 5, 0, 0, Math.PI * 2); g.fill(); }
    try { favLink.href = favCv.toDataURL('image/png'); } catch (e) {}
  }

  // ------------------------------------------------------------ QUADRO A QUADRO
  let holdFeito = false, vidaAnt = null, Sref = null, inv0 = null, holdAnt = 0, holdQuarto = 0, promptTxt = '', fpsT = 0, danoT = 0;
  const VERBO = [[/Esconder|embaixo da cama|Deitar/i, 'Esconder', '▮'], [/^Sair/i, 'Sair', '▯'], [/^Ler|página|bilhete|nota|cartaz|livro|ficha/i, 'Ler', '≡'], [/Fita|gravador|Tocar|Ouvir a fita/i, 'Tocar', '▣'], [/Ouvir/i, 'Ouvir', '◖'], [/Forçar|Cavar|Girar|dar corda|corda|válvula/i, null, '⟳'], [/Falar|Atender|Responder/i, 'Falar', '❝'], [/Abrir|Fechar|porta|Destrancar|cadeado|Subir|Descer|escotilha/i, null, '⊓'], [/Pegar|Levar|Colocar|Ligar|Usar/i, null, '◇']];
  function promptFrame() {
    const pr = $('#prompt'), t = pr.textContent;
    if (t !== promptTxt) {
      promptTxt = t; let ic = '', vb = 'Usar';
      const txt = t.replace(/^(segure\s+)?E\s*/i, '');
      for (const [re, v, i] of VERBO) if (re.test(txt)) { ic = i; vb = v || (txt.split(/\s+/)[0] || 'Usar'); break; }
      if (ic) pr.dataset.ic = ic; else delete pr.dataset.ic;
      const tb = $('#tq-usar'); if (tb) tb.textContent = t ? vb.slice(0, 10) : 'Usar';
    }
    const S = C.S, M = C.M, perto = M.ativo ? M.pos.distanceTo(C.P.pos) : 99;
    pr.classList.toggle('medo', !!t && (S.fear > 70 || perto < 5) && !OPT.vFlash);
    pr.classList.toggle('arrisca', !!t && perto < 10 && !!pr.querySelector('.onda'));
  }
  function holdFrame() { // ações longas: tique que sobe a cada quarto, pulso nos últimos 20%, estalo no fim
    const h = $('#hold'), arc = $('#hold-arc'); if (!h || !arc) return;
    const off = parseFloat(arc.style.strokeDashoffset), p = h.hidden || isNaN(off) ? 0 : 1 - off / 138.2;
    if (p > holdAnt + .001) { const q = Math.floor(p * 4); if (q > holdQuarto && q < 4) { holdQuarto = q; tocar('tique', 420 + q * 160); try { toque() && navigator.vibrate && navigator.vibrate(8); } catch (e) {} } }
    if (p > .97 && !holdFeito) { holdFeito = true; tocar('pronto'); h.classList.remove('fim'); h.getBoundingClientRect(); h.classList.add('fim'); setTimeout(() => h.classList.remove('fim'), 400); }
    if (p < .05) { holdQuarto = 0; holdFeito = false; }
    h.classList.toggle('quase', p > .8 && !h.hidden);
    holdAnt = p;
  }
  const SIMB_INV = { pilhas: '▮', kits: '✚', garrafas: '◊', reliquias: '✦' };
  function invFrame() {
    const S = C.S, I = S.inv, atual = { pilhas: I.pilhas | 0, kits: I.kits | 0, garrafas: I.garrafas | 0, reliquias: I.reliquias | 0, chaves: Object.values(I.chaves || {}).filter(Boolean).length };
    if (inv0) for (const k in atual) if (atual[k] > inv0[k]) { voar(SIMB_INV[k] || '⚿', k === 'chaves' || k === 'reliquias'); break; }
    inv0 = atual;
  }
  function voar(s, especial) {
    const alvo = $('#inv-mini').getBoundingClientRect();
    voo.textContent = s; voo.hidden = false; voo.classList.toggle('especial', !!especial);
    voo.style.setProperty('--dx', (alvo.right - 20 - innerWidth / 2).toFixed(0) + 'px'); voo.style.setProperty('--dy', (alvo.bottom - 14 - innerHeight / 2).toFixed(0) + 'px');
    voo.classList.remove('vai'); void voo.offsetWidth; voo.classList.add('vai');
    const im = $('#inv-mini'); im.classList.remove('ganhou'); void im.offsetWidth; im.classList.add('ganhou');
    clearTimeout(voo.__to); voo.__to = setTimeout(() => { voo.hidden = true; }, 520);
    if (especial) tocar('pronto');
  }
  function danoFrame(dt) {
    const S = C.S;
    if (vidaAnt !== null && S.health < vidaAnt - .5 && OPT.dano && !S.dead) {
      const M = C.M, ANA = C.ANA, PROC = C.PROC, P = C.P;
      const fontes = [M.ativo && M.pos, ANA.ativa && ANA.pos, PROC.fase && PROC.pos].filter(Boolean);
      let f = null, md = 1e9; for (const p of fontes) { const d = Math.hypot(p.x - P.pos.x, p.z - P.pos.z); if (d < md) { md = d; f = p; } }
      if (f && md < 12) { const dr = U.direcao(f); dano.style.transform = `rotate(${dr.a.toFixed(0)}deg)`; dano.style.setProperty('--o', clamp((vidaAnt - S.health) / 50, .35, 1).toFixed(2)); dano.hidden = false; dano.classList.remove('on'); void dano.offsetWidth; dano.classList.add('on'); danoT = .9; }
    }
    vidaAnt = S.health;
    if (danoT > 0) { danoT -= dt; if (danoT <= 0) dano.hidden = true; }
  }
  function frame(dt, ativo) {
    titulo(dt); favicon(dt);
    if (!pausaAberta || $('#pause').hidden) pausaAberta = 0; else if (rel() - pausaAberta > 40) fantasmaPausa();
    const S = C.S;
    if (S !== Sref) { Sref = S; vidaAnt = null; inv0 = null; fantasmaFeito = false; }
    const jogo = C.mode === 'jogo' && S && !S.dead;
    if (contaT > 0) { contaT -= dt; if (contaT <= 0 || !jogo) { anelAna.hidden = true; contaT = 0; } }
    // batimento (modo live)
    const mostraBpm = OPT.bpm && jogo && !C.ui;
    bpm.hidden = !mostraBpm;
    if (mostraBpm) { fpsT -= dt; if (fpsT <= 0) { fpsT = .5; const b = Math.round(60 + clamp(S.fear, 0, 100) * 1.2); bpm.querySelector('span').textContent = b + ' BPM'; bpm.style.setProperty('--b', (60 / b).toFixed(2) + 's'); } }
    if (!ativo || !S) { if (!jogo) { dano.hidden = true; } return; }
    promptFrame(); holdFrame(); invFrame(); danoFrame(dt); curvaFrame(dt);
    // fôlego quase no fim: a barra de prender o ar fica vermelha e treme
    const br = $('#breath'); if (br && !br.hidden) { const v = parseFloat(($('#b-breath').style.getPropertyValue('--v') || '100')); br.classList.toggle('pouco', v < 25); }
    const fol = $('#b-folego'); if (fol) fol.parentElement.classList.toggle('cansada', S.stamina < 20);
  }

  // ------------------------------------------------------------ TECLAS
  function tecla(e) {
    if (!como.hidden && (e.code === 'Escape' || e.code === 'Backspace')) { fecharComo(); return true; }
    if (avisoAberto && e.code === 'Escape') { avisoAberto = false; $('#confirma').hidden = true; tit.hidden = false; U.focar('#title'); return true; }
    if (e.code === 'F8' && C.mode === 'jogo' && C.S && !C.S.dead) { marcarMomento(); return true; }
    if (C.mode === 'titulo' && !tit.hidden) ocioso = 0;
    return false;
  }

  aplicar();
  return { aplicar, opcoes, aviso, teclaTitulo, atualizarTitulo, morte, fimCap, objetivo, salvou, som, fala, frame, tecla, tocar, anunciar, get comoAberto() { return !como.hidden; } };
}
