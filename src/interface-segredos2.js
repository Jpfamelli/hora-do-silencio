// INTERFACE — lote 4, segunda leva de segredos e easter eggs. Tudo passivo, à prova de erro e guardado em try/catch.
// Novos códigos do título (pelo despachante único de interface.js), interações da tela de título (rodapé, subtítulo,
// rádio-relógio ao vivo, ocioso, datas especiais, letra trocada), tela de morte (números que assombram, boatos),
// pausa (regras falsas e verdadeiras), opções (uma piada a mais), final (recado preto no preto), legendas raras,
// e o título da aba do navegador que reage ao que acontece. Criado por src/interface.js: criarSegredos2(C, U).
export function criarSegredos2(C, U) {
  const $ = s => document.querySelector(s);
  const R = C.R, OPT = C.OPT;
  const rel = () => performance.now() / 1000;
  const St = () => C.S;
  const pick = a => a[Math.random() * a.length | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const UI5 = 'hora-silencio-ui4b';
  const mem = (() => { try { return JSON.parse(localStorage.getItem(UI5)) || {}; } catch (e) { return {}; } })();
  const gravar = () => { try { localStorage.setItem(UI5, JSON.stringify(mem)); } catch (e) {} };
  const stats = () => { try { return C.lsGet('hora-silencio-stats', {}) || {}; } catch (e) { return {}; } };
  const acervo = () => { try { return C.lsGet('hora-silencio-v3-acervo', {}) || {}; } catch (e) { return {}; } };
  const sub = t => { try { U.subTitulo(t); } catch (e) {} };
  const sfx = (k, ...a) => { try { C.SFX[k] && C.SFX[k](...a); } catch (e) {} };
  const leg = (t, c) => { try { U.legenda(t, c || 'h'); } catch (e) {} };
  const conq = id => { try { C.conquista(id); } catch (e) {} };
  const menosMov = () => document.body.classList.contains('menos-mov');
  const semFlash = () => !!OPT.vFlash;
  const tit = $('#title');

  // ------------------------------------------------------------ CONQUISTAS SECRETAS NOVAS
  for (const c of [
    { id: 'chamada2', nome: 'Lista de Chamada', desc: 'Chame no título o Benedito, o Luiz e o Seu Joaquim.', segredo: true },
    { id: 'lazaro', nome: 'São Lázaro', desc: 'Diga no título o nome do santo dos esquecidos.', segredo: true },
    { id: 'lata_davi', nome: 'A Lata do Davi', desc: 'Peça a lata do Davi na tela de título.', segredo: true },
    { id: 'testemunha_rodape', nome: 'Quem Lê o Rodapé', desc: 'Leia todas as ocorrências escondidas no rodapé do título.', segredo: true },
    { id: 'insone', nome: 'Insone', desc: 'Fique parado na tela de título até ele reparar em você.', segredo: true }
  ]) try { if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c); } catch (e) {}

  // ------------------------------------------------------------ SONS PRÓPRIOS (procedurais, no volume geral)
  let nb = null;
  function AC() { const A = C.AC; if (!A || !C.master || A.state !== 'running') return null; if (!nb) { nb = A.createBuffer(1, A.sampleRate, A.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return A; }
  function tom(A, t, dur, f, f2, vol, tipo = 'sine') { const o = A.createOscillator(); o.type = tipo; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); const g = A.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(C.master); o.start(t); o.stop(t + dur + .03); }
  function ruido(A, t, dur, tipo, f, q, vol) { const s = A.createBufferSource(); s.buffer = nb; const fl = A.createBiquadFilter(); fl.type = tipo; fl.frequency.value = f; fl.Q.value = q; const g = A.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur); s.connect(fl); fl.connect(g); g.connect(C.master); s.start(t, Math.random() * .4); s.stop(t + dur + .03); }
  const SOM = {
    latido() { const A = AC(); if (!A) return; const t = A.currentTime; for (let i = 0; i < 2; i++) { tom(A, t + i * .22, .14, 430 - i * 40, 230, .09, 'square'); ruido(A, t + i * .22, .12, 'bandpass', 900, 1.5, .05); } },
    apito() { const A = AC(); if (!A) return; tom(A, A.currentTime, .5, 2300, 2500, .05, 'sine'); },
    olhos() { const A = AC(); if (!A) return; tom(A, A.currentTime, .3, 150, 90, .04, 'triangle'); },
    chuva(d) { const A = AC(); if (!A) return; ruido(A, A.currentTime, d || 2.2, 'highpass', 2600, .4, .035); },
    portao() { const A = AC(); if (!A) return; const t = A.currentTime; ruido(A, t, .9, 'bandpass', 420, 3, .08); tom(A, t, .9, 70, 48, .05, 'sawtooth'); },
    lingua() { const A = AC(); if (!A) return; ruido(A, A.currentTime, .02, 'bandpass', 1500, 5, .13); }
  };

  // ------------------------------------------------------------ CSS
  const css = document.createElement('style'); css.id = 'sg4b-css';
  css.textContent = `
  #sg2-olhos{position:absolute;right:6vw;top:16%;display:flex;gap:10px;opacity:0;transition:opacity .5s;pointer-events:none;z-index:2}
  #sg2-olhos.on{opacity:.9}
  #sg2-olhos span{width:11px;height:7px;border-radius:50%;background:radial-gradient(circle,#e9d34a,#8a6a14);box-shadow:0 0 10px #d9b63a;animation:sg2Pisca 3.4s steps(1) infinite}
  #sg2-olhos span:nth-child(2){animation-delay:.08s}
  @keyframes sg2Pisca{0%,92%{opacity:1}93%,100%{opacity:0}}
  #title.sg2-relampago{animation:sg2Rel .5s steps(2)}
  @keyframes sg2Rel{0%,100%{filter:none}50%{filter:brightness(2.4) contrast(1.3)}}
  body.sem-flash #title.sg2-relampago{animation:none}
  #title.sg2-vira h1{display:inline-block;transform:scaleX(-1);transition:transform .4s}
  #rot-ver.sg2-clica{cursor:help}
  #t-sub.sg2-clica{cursor:help}
  #title.sg2-cem h1{animation:sg2Trem 2.4s ease-in-out infinite}
  body.menos-mov #title.sg2-cem h1{animation:none}
  @keyframes sg2Trem{0%,100%{transform:translate(0,0)}25%{transform:translate(.6px,-.4px)}75%{transform:translate(-.5px,.5px)}}
  #sg2-vela2{position:absolute;right:8vw;bottom:14%;width:9px;height:40px;background:linear-gradient(#e9dfc8,#b8a988);border-radius:2px;z-index:2}
  #sg2-vela2::before{content:"";position:absolute;left:-3px;top:-18px;width:15px;height:20px;border-radius:50% 50% 45% 45%;background:radial-gradient(circle at 50% 70%,#fff6c8,#f2a93b 45%,rgba(200,60,20,0) 70%);animation:sg2Chama .25s infinite alternate}
  @keyframes sg2Chama{to{transform:scaleY(1.12)}}
  #sg2-oculto-fim{display:block;margin:12px auto 0;max-width:420px;color:#000;user-select:text;-webkit-user-select:text;font-family:"Special Elite";font-size:12px;text-align:center}
  #sg2-oculto-fim::selection{background:#8e1b14;color:#fff3dc}
  #death .sg2-boato{display:block;margin-top:8px;font-family:"IM Fell English",Georgia,serif;font-style:italic;color:#8a7a62;font-size:15px}
  #pause .sg2-regra{display:block;margin-top:10px;font-family:"Special Elite";font-size:12px;color:#857a63;border-top:1px dashed #2c2720;padding-top:8px}
  .op.sg2-piada span{color:#6d6452;font-style:italic}
  #radiorel.sg2-vivo{cursor:default}
  `;
  try { document.head.appendChild(css); } catch (e) {}
  const nova = (tag, id, pai, cls) => { let el = id && document.getElementById(id); if (el) return el; el = document.createElement(tag); if (id) el.id = id; if (cls) el.className = cls; (pai || document.body).appendChild(el); return el; };

  // ------------------------------------------------------------ CÓDIGOS NOVOS DO TÍTULO (despachante único; letras, sem campo)
  const nomesChamados = {};
  function chamar(k) { nomesChamados[k] = 1; if (nomesChamados.benedito && nomesChamados.luiz && nomesChamados.joaquim) conq('chamada2'); }
  const reg = (p, fn) => { try { U.registrarCodigo(p, fn); } catch (e) {} };
  reg('LAZARO', () => { velaTit(14000); sfx('sinoLonge'); sub('São Lázaro, padroeiro dos doentes e dos esquecidos. Reze por nós.'); conq('lazaro'); });
  reg('JOAQUIM', () => { faroisTit(); sub('Seu Joaquim já tinha morrido quando mandou você entrar. Em 1979.'); chamar('joaquim'); });
  reg('BENEDITO', () => { sfx('pancada', 0, 0); sub('Benedito foi o primeiro. Cavaram o túnel e esqueceram de contar pra alguém.'); chamar('benedito'); });
  reg('LUIZ', () => { velaTit(9000); sub('O Luiz está embaixo da pedra sem nome. Eu levo flor quando dá. — D.'); chamar('luiz'); });
  reg('TUFAO', () => { SOM.latido(); sub('O Tufão abanava o rabo pra todo mundo. Ainda espera no portão.'); });
  reg('SOCORRO', () => { if (tit && !semFlash()) { tit.classList.add('sg2-relampago'); setTimeout(() => tit.classList.remove('sg2-relampago'), 520); } sfx('estatica', 1); sub('Eu também gritei. Ninguém veio. Você veio.'); });
  reg('MAE', () => { sub('Fala pra ela que eu não chorei. Fala baixinho. — D.'); });
  reg('HINO', () => { sfx('sino', .3); sub('A gente cantava o hino torto de propósito. Era a única graça que a gente tinha.'); });
  reg('GATO', () => { olhosTit(5000); SOM.olhos(); sub('O gato preto só aparece pra quem anda devagar. Não corre no corredor de cima.'); });
  reg('PORTAO', () => { SOM.portao(); sub('O portão abre pra fora. A gente só nunca teve permissão de usar.'); });
  reg('APITO', () => { SOM.apito(); sub('O apito do Inspetor ainda está no bolso dele. Não assopra sozinho. Quase nunca.'); });
  reg('REZA', () => { velaTit(12000); sfx('sussurros', .8); sub('(baixinho) Com Deus me deito, com Deus me levanto. A irmã rezava por nós.'); });
  reg('LILI', () => { sub('Lili. Só eu te chamava assim. Ainda chamo, quando ninguém ouve. — D.'); });
  reg('AMEM', () => { sfx('sinoLonge'); sub('Amém. A capela ficava trancada, mas a gente rezava do lado de fora.'); });
  reg('CELA', () => { if (tit) { tit.style.filter = 'brightness(.3)'; setTimeout(() => { if (tit) tit.style.filter = ''; }, 2400); } sub('O castigo era o quarto sem janela. Dava pra ouvir o sino lá de dentro.'); });
  reg('CARRINHO', () => { sfx('tique'); sub('O carrinho azul. Traz o azul, Lia. O vermelho não é o meu. — D.'); });
  reg('QUINZE', () => { velaTit(15000); sub('Quinze de março. Eu ia fazer aniversário com você. — D.'); });
  reg('CHUVA', () => { SOM.chuva(2.4); sub('Quando chove dá pra correr: o trovão cobre o barulho dos pés. Regra que ninguém ensina.'); });
  reg('TROVAO', () => { if (tit && !semFlash()) { tit.classList.add('sg2-relampago'); setTimeout(() => tit.classList.remove('sg2-relampago'), 520); } sfx('estatica', .5); sub('Um relâmpago, e por um segundo dava pra ver quem estava no corredor.'); });
  reg('ESPELHO', () => { if (tit) { tit.classList.add('sg2-vira'); setTimeout(() => tit.classList.remove('sg2-vira'), 2600); } sub('No espelho, não conte em voz alta. Ela aparece no três.'); });
  reg('LATA', () => { lataTit(); });
  reg('DORME', () => { sfx('sussurros', .7); sub('Dorme, criança. A irmã fica acordada por você. (ela nunca ficou)'); });
  reg('SINETA', () => { sfx('tique'); setTimeout(() => sfx('sino', .25), 300); sub('A sineta do refeitório. Tocava três vezes. Hoje ninguém come aqui.'); });
  reg('COBERTOR', () => { sub('Dobre o cobertor em quatro partes iguais antes do café. Sempre dobrei errado. — D.'); });
  reg('QUADRO', () => { sub('No quadro-negro ainda tem uma conta pela metade. Ninguém apagou.'); });
  reg('NOVENA', () => { for (let i = 0; i < 9; i++) setTimeout(() => sfx('sino', .18), i * 650); sub('Nove dias de reza. A gente contava os dias no dedo, baixinho.'); });
  reg('VISITA', () => { velaTit(8000); sub('Dia de visita. A gente arrumava a cama e esperava no portão. Ninguém vinha.'); });
  reg('FOSFORO', () => { velaTit(6000); sfx('tique'); sub('Um fósforo só dura o suficiente pra ler uma linha. Lê rápido, Lia.'); });
  reg('COVA', () => { if (tit) { tit.style.filter = 'brightness(.4)'; setTimeout(() => { if (tit) tit.style.filter = ''; }, 2000); } sfx('pancada', 0, 0); sub('Tem uma cova aberta no fundo do cemitério. Esperando. Não é a minha.'); });
  reg('LANTERNA', () => { if (tit && !semFlash()) { tit.classList.add('sg2-relampago'); setTimeout(() => tit.classList.remove('sg2-relampago'), 300); } sub('A lanterna era da Irmã. Recolhida às oito. No escuro, a gente aprendeu a enxergar.'); });
  function lataTit() {
    const L = []; try { const a = acervo(); for (const n of [...R.notas, ...R.paginas]) if (n.secreta && a[n.id]) L.push(n.titulo); } catch (e) {}
    sub(L.length ? `A lata do Davi: ${L.slice(0, 4).join(', ')}${L.length > 4 ? '...' : ''}. Falta pouco.` : 'A lata do Davi ainda está vazia. Procura, Lia.');
    conq('lata_davi');
  }
  function velaTit(ms) { if (!tit) return; const v = nova('div', 'sg2-vela2', tit); clearTimeout(v._t); v._t = setTimeout(() => v.remove(), ms || 10000); }
  function olhosTit(ms) { if (!tit) return; const o = nova('div', 'sg2-olhos', tit); o.innerHTML = '<span></span><span></span>'; void o.offsetWidth; o.classList.add('on'); clearTimeout(o._t); o._t = setTimeout(() => o.classList.remove('on'), ms || 5000); }
  function faroisTit() {
    if (!tit || semFlash()) { sfx('estatica', .4); return; }
    const f = nova('div', 'sg2-farois', tit); f.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(60vw 40vh at -10% 60%,rgba(242,220,150,.3),transparent 55%);opacity:0;transition:opacity .3s,transform 1.6s linear;transform:translateX(0)';
    void f.offsetWidth; f.style.opacity = '1'; f.style.transform = 'translateX(120vw)';
    sfx('estatica', .3); setTimeout(() => { f.style.opacity = '0'; setTimeout(() => f.remove(), 400); }, 1700);
  }

  // ------------------------------------------------------------ TÍTULO: rodapé clicável (ocorrências de 1979)
  const OCORRENCIAS = [
    'Ocorrência 03/1979: aluno L.M. não respondeu à chamada da manhã.',
    'Ocorrência 03/1979: a irmã Celeste pediu transferência. Negada.',
    'Ocorrência 03/1979: o gerador foi desligado às 21h, por ordem da diretoria.',
    'Ocorrência 03/1979: faltam sete cobertores no dormitório F.',
    'Ocorrência 03/1979: o Inspetor registrou "barulho de contagem" no porão.',
    'Ocorrência 15/03/1979: incêndio na ala leste. Causa não apurada.',
    'Ocorrência 16/03/1979: o internato São Lázaro foi fechado. Sem sobreviventes catalogados.'
  ];
  function ligarRodape() {
    const el = $('#rot-ver'); if (!el || el._sg2) return; el._sg2 = 1; el.classList.add('sg2-clica'); el.setAttribute('title', 'clique');
    el.addEventListener('click', () => {
      mem.occ = ((mem.occ || 0) + 1); gravar(); sfx('papel');
      const i = (mem.occ - 1) % OCORRENCIAS.length; sub(OCORRENCIAS[i]);
      if (mem.occ >= OCORRENCIAS.length && !mem.occFim) { mem.occFim = 1; gravar(); setTimeout(() => conq('testemunha_rodape'), 500); }
    });
  }

  // ------------------------------------------------------------ TÍTULO: subtítulo com três cliques revela uma frase escondida
  const SUSSURROS_SUB = ['tem alguém atrás de você agora.', 'não era pra você ter lido isso.', 'conta comigo. um, dois...', 'o sino bate nove. sempre nove.', 'você não dorme há quanto tempo?'];
  function ligarSub() {
    const el = $('#t-sub'); if (!el || el._sg2) return; el._sg2 = 1; let c = [];
    el.addEventListener('click', () => { const t = rel(); c = c.filter(x => t - x < 1.2).concat(t); if (c.length >= 3) { c = []; sfx('sussurros', .6); sub('(bem baixinho) ' + pick(SUSSURROS_SUB)); } });
  }

  // ------------------------------------------------------------ TÍTULO: rádio-relógio ao vivo + telefone/hora
  let rrBase = null;
  function relogioVivo() {
    const rr = $('#radiorel'); if (!rr || C.mode !== 'titulo' || tit.hidden) return;
    if (OPT.relVivo === false || rr._hover) return;
    const h = rr.querySelector('.h'), m = rr.querySelector('.m'); if (!h || !m) return;
    if (!rrBase) rrBase = { h: h.textContent, m: m.textContent };
    const d = new Date(); h.textContent = String(d.getHours()).padStart(2, '0'); m.textContent = String(d.getMinutes()).padStart(2, '0');
    rr.classList.add('sg2-vivo');
  }
  // passar o mouse no rádio-relógio o leva para a Hora do Silêncio (21:00)
  function ligarRadio() {
    const rr = $('#radiorel'); if (!rr || rr._sg2) return; rr._sg2 = 1;
    if (!rrBase) { const h = rr.querySelector('.h'), m = rr.querySelector('.m'); if (h && m) rrBase = { h: h.textContent, m: m.textContent }; }
    rr.addEventListener('pointerenter', () => { rr._hover = 1; const h = rr.querySelector('.h'), m = rr.querySelector('.m'); if (h && m) { h.textContent = '21'; m.textContent = '00'; } });
    rr.addEventListener('pointerleave', () => { rr._hover = 0; if (OPT.relVivo === false) { const h = rr.querySelector('.h'), m = rr.querySelector('.m'); if (h && m && rrBase) { h.textContent = rrBase.h; m.textContent = rrBase.m; } } });
  }

  // ------------------------------------------------------------ TÍTULO: tooltips vivos nos botões
  function tooltips() {
    const nv = $('#b-novo'); if (nv) { const n = stats().mortes || 0; nv.title = n <= 0 ? 'Mais uma Lia entra no São Lázaro.' : n < 10 ? `Já saíram ${n} de você aqui dentro.` : `${n} ocorrências. A lista não fecha.`; }
    const ct = $('#b-cont'); if (ct && !ct.hidden) { let txt = 'Voltar lá pra dentro.'; try { const sv = C.lsGet(C.SAVE_KEY, null); if (sv && R.capitulos[sv.chapter]) txt = `Ele ainda está em ${R.capitulos[sv.chapter].titulo}. Esperando.`; } catch (e) {} ct.title = txt; }
  }

  // ------------------------------------------------------------ TÍTULO: tremor quando tudo foi achado + Serra FM baixinho
  function cemPorCento() {
    try { const a = acervo(); let tot = 0, ach = 0; for (const n of [...R.notas, ...R.paginas]) if (n.secreta) { tot++; if (a[n.id]) ach++; } for (const f of R.fitas) if (f.secreta) { tot++; if (a[f.id]) ach++; } return tot > 0 && ach >= tot; } catch (e) { return false; }
  }
  function tremorTit() { if (!tit) return; tit.classList.toggle('sg2-cem', cemPorCento()); }
  let fmT = 0;
  function serraFM(dt) {
    if (C.mode !== 'titulo' || tit.hidden || OPT.legSom === 'nao') { fmT = 0; return; }
    fmT += dt; if (fmT > 55 && !mem.fm) { mem.fm = 1; gravar(); leg('[alguém sintoniza a Serra FM, bem baixinho, num quarto ao lado]'); fmT = 0; }
  }

  // ------------------------------------------------------------ TÍTULO: datas especiais
  function datas() {
    const d = new Date(), mes = d.getMonth() + 1, dia = d.getDate(), dow = d.getDay();
    if (mes === 11 && dia === 2) { velaTit(99999); if (!mem.finados) { mem.finados = 1; gravar(); sub('Dia de Finados. Hoje até o São Lázaro acende uma vela.'); } }
    else if (mes === 3 && dia === 15) { if (!mem.q15) { mem.q15 = 1; gravar(); if (tit && !semFlash()) { tit.classList.add('sg2-relampago'); setTimeout(() => tit.classList.remove('sg2-relampago'), 520); } sub('Quinze de março. O cheiro de fumaça não sai mais daqui.'); } }
    else if (dow === 5 && dia === 13) { const el = $('#rot-ver'); if (el && !mem.sexta13) { mem.sexta13 = 1; gravar(); } sub('Sexta-feira, dia treze. O Inspetor gosta.'); }
  }

  // ------------------------------------------------------------ TÍTULO: segurar o mouse no logo troca uma letra
  let h1Hover = 0;
  function ligarH1() {
    const h1 = $('#t-titulo'); if (!h1 || h1._sg2) return; h1._sg2 = 1; const orig = h1.innerHTML;
    h1.addEventListener('pointerenter', () => { h1Hover = rel(); });
    h1.addEventListener('pointerleave', () => { h1Hover = 0; if (h1._troc) { h1.innerHTML = orig; h1._troc = 0; } });
    h1._origHtml = orig;
  }
  function h1Frame() {
    const h1 = $('#t-titulo'); if (!h1 || !h1Hover || h1._troc) return;
    if (rel() - h1Hover < 6) return;
    h1._troc = 1; h1.innerHTML = h1._origHtml.replace('SILÊNCIO', 'SILÊNCIA'); sfx('sussurros', .5);
    sub('Silência. É assim que ele chama a Lia, quando acha que ninguém escuta.');
  }

  // ------------------------------------------------------------ TÍTULO: ocioso demais
  let idleT = 0, idleFez = false, ultMexeu = rel();
  function mexeu() { ultMexeu = rel(); idleT = 0; }
  try { for (const ev of ['pointermove', 'keydown', 'pointerdown']) addEventListener(ev, mexeu, { passive: true }); } catch (e) {}
  function idle(dt) {
    if (C.mode !== 'titulo' || tit.hidden) { idleT = 0; idleFez = false; return; }
    idleT += dt;
    if (!idleFez && idleT > 40) { idleFez = true; sfx('sussurros', 1); leg('[alguém, muito perto do microfone] ...ainda tá aí?'); sub('...ainda tá aí?'); conq('insone'); }
  }

  // ------------------------------------------------------------ TÍTULO: selo de aba do navegador reage
  let docTitBase = null, docTO = 0;
  function docTitulo(dt) {
    if (docTitBase === null) docTitBase = document.title;
    if (docTO > 0) { docTO -= dt; if (docTO <= 0) document.title = docTitBase; }
  }
  function piscaAba(txt, seg) { try { document.title = txt; docTO = seg || 2.5; } catch (e) {} }

  // ------------------------------------------------------------ NOTA: reabrir a mesma nota do Davi
  let notaObs = null, notaAnt = '';
  function ligarNota() {
    const note = $('#note'); if (!note || note._sg2) return; note._sg2 = 1;
    notaObs = new MutationObserver(() => {
      if (note.hidden) return;
      const h = note.querySelector('h2'); if (!h) return; const t = (h.textContent || '').trim(); if (!t || t === notaAnt) return; notaAnt = t;
      if (!/Davi/.test(t)) return;
      const S = St(); if (!S || !S.flags) return;
      const c = S.flags.sg4b_relidas = S.flags.sg4b_relidas || {}; c[t] = (c[t] || 0) + 1;
      if (c[t] === 3) { const p = note.querySelector('p'); if (p && !p.querySelector('.sg2-reli')) p.insertAdjacentHTML('beforeend', '<br><em class="sg2-reli" style="color:#aebde0">você de novo. tudo bem. eu também releio. — D.</em>'); }
    });
    notaObs.observe(note, { attributes: true, childList: true, subtree: true });
  }

  // ------------------------------------------------------------ TELA DE MORTE: números que assombram + boato
  const BOATOS_MORTE = [
    'dizem que a Lia número treze nunca saiu.',
    'dizem que quem morre perto da capela vira recado.',
    'dizem que o Inspetor conta as crianças de novo toda noite.',
    'dizem que a trigésima sétima vaga era a sua.',
    'dizem que o sino bate uma vez a cada Lia que cai.'
  ];
  let morteVista = false;
  function morteTela() {
    const S = St(); if (!S) return; if (morteVista) return; morteVista = true;
    const N = Math.max(stats().mortes || 0, S.mortes || 0), frase = $('#death-frase');
    if (N === 13) { if (frase) frase.textContent = 'Treze. O número que ninguém quer na chamada.'; }
    else if (N === 21) { if (frase) frase.textContent = 'Vinte e uma Lias. O Inspetor já decorou o seu nome.'; }
    else if (N === 79) { if (frase) frase.textContent = 'Setenta e nove. O ano não acaba nunca.'; }
    if ((S.mortes || 0) === 7) { const d = $('#death-dica'); if (d && !d.querySelector('.sg2-sete')) d.insertAdjacentHTML('beforeend', '<span class="sg2-sete"> O Tomé riria de você. Ele nunca é pego.</span>'); }
    document.querySelectorAll('.sg2-boato').forEach(x => x.remove());
    if (N > 0 && N % 5 === 0) { const d = $('#death-dica'); if (d) d.insertAdjacentHTML('afterend', `<span class="sg2-boato">${esc(pick(BOATOS_MORTE))}</span>`); }
    // morrer à meia-noite do relógio real
    if (new Date().getHours() === 0) { const d = $('#death-dica'); if (d && !d.querySelector('.sg2-mn')) d.insertAdjacentHTML('beforeend', '<span class="sg2-mn"> Meia-noite. A hora dele. Ele fica mais rápido agora.</span>'); }
    piscaAba('ELE TE ENCONTROU', 3);
  }

  // ------------------------------------------------------------ PAUSA: regras falsas (e uma verdadeira)
  const REGRAS = [
    { t: 'Regra 2: é proibido assobiar nos corredores, inclusive hinos.', v: 0 },
    { t: 'Regra 4: cartas para a família serão lidas antes do envio.', v: 0 },
    { t: 'Regra 5: o aluno não deve contar em voz alta, sob nenhum pretexto.', v: 0 },
    { t: 'Regra 6: na trovoada o aluno pode andar — o céu cobre o barulho dos pés.', v: 1 },
    { t: 'Regra 7: lanternas pertencem à Irmã e são recolhidas às oito.', v: 0 },
    { t: 'Regra 8: se ouvir o seu nome, responda. (não responda)', v: 0 },
    { t: 'Regra 9: às nove horas, ninguém fala. Quem falar será recolhido.', v: 0 }
  ];
  let pausaN = 0;
  function pausaTela() {
    const S = St(); if (!S) return;
    const el = $('#p-info'); if (!el) return;
    if (!el.querySelector('.sg2-regra')) { const r = REGRAS[(mem.regra || 0) % REGRAS.length]; mem.regra = (mem.regra || 0) + 1; gravar(); el.insertAdjacentHTML('beforeend', `<span class="sg2-regra">${esc(r.t)}</span>`); }
    const c = S.flags.sg4b_pausas = (S.flags.sg4b_pausas || 0) + 1;
    if (c === 9 && !el.querySelector('.sg2-np')) el.insertAdjacentHTML('beforeend', '<span class="sg2-regra sg2-np" style="color:#b98a6a">Nove pausas. Ele não pausa, sabia?</span>');
  }

  // ------------------------------------------------------------ OPÇÕES: a piada a mais
  function opcoes(box) {
    try {
      if (!box || box.querySelector('.sg2-piada')) return;
      const l = document.createElement('label'); l.className = 'op sg2-piada'; l.innerHTML = '<span>Avisar quando ele estiver atrás de você</span><button class="btn" type="button">Tarde demais</button>';
      box.appendChild(l); const b = l.querySelector('button'); let n = 0;
      b.onclick = e => { e.preventDefault(); n++; SOM.lingua(); b.textContent = n < 4 ? 'Tarde demais' : n < 7 ? 'Já foi' : 'Vira.'; if (n >= 7) b.textContent = 'Vira.'; };
    } catch (e) {}
  }
  // nova opção real: rádio-relógio ao vivo (liga/desliga a hora do computador no título)
  try {
    if (OPT.relVivo === undefined) OPT.relVivo = true; if (U.PAD) U.PAD.relVivo = true;
    const gInt = U.GRUPOS && U.GRUPOS.find(g => g[0] === 'Interface');
    if (gInt) gInt[1].push({ k: 'relVivo', nome: 'Rádio-relógio do título com a hora de verdade', tipo: 'sel', ops: [[true, 'Sim'], [false, 'Não (fixa em 20:47)']] });
  } catch (e) {}

  // ------------------------------------------------------------ FINAL: recado preto no preto + título em letra de criança
  const RECADO_FIM = ['VOCÊ PROCUROU. ISSO JÁ É MUITA COISA. — D.', 'NÃO VOLTA. DESSA VEZ NÃO VOLTA. — D.', 'EU FICO. VOCÊ VAI. TÁ CERTO ASSIM. — D.'];
  function finalTela() {
    const box = $('#e-stats'); if (box && !$('#sg2-oculto-fim')) {
      const el = document.createElement('div'); el.id = 'sg2-oculto-fim'; el.setAttribute('aria-hidden', 'true'); el.textContent = pick(RECADO_FIM);
      box.insertAdjacentElement('afterend', el);
    }
    const tt = $('#e-tit'); if (tt && !tt._sg2) { tt._sg2 = 1; let c = []; tt.style.cursor = 'help'; tt.addEventListener('click', () => { const t = rel(); c = c.filter(x => t - x < 1.2).concat(t); if (c.length >= 3) { c = []; tt.style.fontFamily = "'Special Elite', monospace"; tt.style.letterSpacing = '.02em'; sfx('tique'); } }); }
    piscaAba('— FIM —', 4);
  }

  // ------------------------------------------------------------ LEGENDAS raras (no máximo uma por noite cada)
  let legT = 0;
  function legendasRaras(dt, ativo) {
    const S = St(); if (!ativo || !S || C.mode !== 'jogo' || C.ui) { return; }
    if (OPT.legSom === 'nao' || OPT.truques === false) return;
    const M = C.M, calmo = !(M && M.ativo && (M.state === 'caca' || M.state === 'investiga'));
    if (!calmo) { legT = 0; return; }
    legT += dt;
    if (legT > 70 && !(S.flags.sg4b_legGiz) && (S.tempo || 0) > 180 && Math.random() < dt / 40) { S.flags.sg4b_legGiz = 1; leg('[o giz range no quadro-negro, sozinho]'); legT = 0; }
  }

  // ------------------------------------------------------------ LOOP PRÓPRIO
  let modoAnt = C.mode, raf = 0, ultT = performance.now();
  function liga() { ligarRodape(); ligarSub(); ligarRadio(); ligarH1(); ligarNota(); }
  function tick() {
    const agora = performance.now(), dt = Math.min(.1, (agora - ultT) / 1000); ultT = agora;
    try {
      liga();
      if (C.mode === 'titulo' && tit && !tit.hidden) { relogioVivo(); tooltips(); datas(); h1Frame(); tremorTit(); serraFM(dt); }
      idle(dt); docTitulo(dt);
      if (C.ui === 'morte') { if (!morteVista) morteTela(); } else morteVista = false;
      if (C.ui === 'pausa') { if (!pausaFez) { pausaFez = true; pausaTela(); } } else pausaFez = false;
      if (C.ui === 'final') { if (!finalFez) { finalFez = true; finalTela(); } } else finalFez = false;
      legendasRaras(dt, document.hasFocus());
    } catch (e) {}
    raf = requestAnimationFrame(tick);
  }
  let pausaFez = false, finalFez = false;
  tick();

  return { opcoes };
}
