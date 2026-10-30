// A HORA DO SILÊNCIO — Lote 4 (2ª rodada): mais segredos e easter eggs de plataforma/acessibilidade.
// Tudo cosmético, opcional e guardado; nada roda no QA (robo = navigator.webdriver) e tudo em try/catch.
// Ligado por uma linha em plataforma4.js: instalarPlat4b(C, bag). Não toca no caminho de quem não procura.

const $ = s => document.querySelector(s);
const K = 'hora-silencio-segb';

// conquistas secretas desta rodada (registradas em memória, sem tocar no roteiro.js)
const CONQ4B = [
  { id: 's4b_coro', nome: 'Coro', desc: 'Ouça o hino do internato começar sozinho.', secreta: true, dica: 'Uma fita diz: CORO.' },
  { id: 's4b_pega', nome: 'Pegadinha', desc: 'Receba um susto preparado por um amigo.', secreta: true, dica: 'Abra o link que te mandaram.' },
  { id: 's4b_coletor', nome: 'Colecionador', desc: 'Compare sua coleção com a de um amigo.', secreta: true, dica: 'Cole o código de colecionador de alguém.' },
  { id: 's4b_clipe', nome: 'Diretor', desc: 'Guarde um clipe dos seus últimos segundos.', secreta: true, dica: 'Ligue os clipes em Desempenho e aperte F9.' },
  { id: 's4b_bateria', nome: 'Até Você, Pilha', desc: 'Jogue com o aparelho quase sem bateria.', secreta: true, dica: 'A pilha da Lia sente a sua.' },
  { id: 's4b_gaveta', nome: 'Quem Abriu a Minha Gaveta', desc: 'Decifre o bilhete escondido no código da página.', secreta: true, dica: 'Está em cifra no "ver código-fonte".' },
  { id: 's4b_boca', nome: 'Mãos na Boca', desc: 'Tampe a boca com as duas mãos.', secreta: true, dica: 'Os dois analógicos para baixo.' },
  { id: 's4b_vela', nome: 'Acendedor', desc: 'Acenda a vela que alguém deixou para você.', secreta: true, dica: 'Um amigo pode te mandar uma vela.' },
  { id: 's4b_nome', nome: 'Chamei Pelo Nome', desc: 'Chame alguém em voz alta, com o microfone ligado.', secreta: true, dica: 'Ligue o microfone em Desempenho e diga um nome.' }
];

export function instalarPlat4b(C, bag) {
  const O = bag.O, salvar = bag.salvar, robo = bag.robo, hash0 = bag.hash0 || '';
  const sub = bag.sub || (() => {}), sfx = bag.sfx || (() => {}), conq = bag.conq || (() => {});
  const noTitulo = bag.noTitulo || (() => false), emJogo = bag.emJogo || (() => false);
  const vibrar = bag.vibrar || (() => {}), copiar = bag.copiar, feedback = bag.feedback;
  const lsGet = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const seg = lsGet(K, {}), guarda = () => lsSet(K, seg);
  const semFlash = () => !!O.semFlashSeg;
  const vibrarSeg = (a, b, ms) => { if (!O.semVibSeg) try { vibrar(a, b, ms); } catch (e) {} };
  // bate uma letra em Morse no controle/celular (opção morseSeg)
  const MORSE = { A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..' };
  function morse(letra) {
    if (robo || !O.morseSeg) return; const seq = MORSE[String(letra || '').toUpperCase()[0]]; if (!seq) return;
    let t = 0; for (const s of seq) { const dur = s === '-' ? 240 : 90; setTimeout(() => vibrarSeg(.6, .3, dur), t); t += dur + 120; }
  }

  // CSS do módulo
  try { if (!$('#s4b-css')) { const l = document.createElement('link'); l.id = 's4b-css'; l.rel = 'stylesheet'; l.href = 'src/plataforma4b.css'; document.head.appendChild(l); } } catch (e) {}

  // registra as conquistas desta rodada
  try {
    const R = window.ROTEIRO; if (R && R.conquistas) {
      const tem = new Set(R.conquistas.map(c => c.id));
      for (const c of CONQ4B) if (!tem.has(c.id)) R.conquistas.push(c);
    }
  } catch (e) {}

  // ------------------------------------------------------------------ NOVOS MARCADORES DE ENDEREÇO (#...): manda a um amigo
  function lerHash() {
    let h = ''; try { h = String(hash0 || '').replace(/^#/, '').toLowerCase(); } catch (e) {}
    if (!h || robo) return;
    const cls = c => { try { document.documentElement.classList.add(c); } catch (e) {} };
    switch (h) {
      case 'coro': try { if (C.AC) C.iniciarAudio && C.iniciarAudio(); } catch (e) {} sfx('badaladas'); setTimeout(() => sfx('sussurros'), 900); sub('o coro do internato ensaia sozinho, no escuro.'); conq('s4b_coro'); break;
      case 'joaquim': sub('"eu não devia ter aberto o portão naquela noite." — Seu Joaquim'); sfx('sinoLonge'); break;
      case 'luiz': cls('s4b-luiz'); muroNome('LUIZ'); sub('alguém riscou um nome no muro.'); break;
      case 'tome': sub('21h04 — "eu só falei..." — Tomé R.'); sfx('sussurros'); break;
      case 'celeste': sub('Dona Celeste reza baixinho por todos vocês.'); sfx('sussurros'); break;
      case 'vela': velaTitulo(); sub('uma vela acesa, esquecida no corredor.'); break;
      case 'corvo': corvoTitulo(); sub('um corvo pousou no sino.'); break;
      case 'neblina': cls('s4b-neblina'); sub('a neblina subiu do pátio.'); break;
      case 'relampago': if (!semFlash()) relampagoTitulo(); sub('a tempestade chegou junto com você.'); break;
      case 'apagada': cls('s4b-apagada'); sub('a luz do título queimou — só o que você aponta aparece.'); lanternaTitulo(); break;
      case 'vinil': sfx('chiadoFita', true); sub('a vitrola da sala dos professores começou a girar.'); break;
      case 'sino': sfx('badaladas'); sub('nove badaladas — conte junto.'); break;
      case 'moacir': sfx('sinoLonge'); setTimeout(() => sfx('apito'), 700); sub('o bedel assoviou lá do fundo do pátio.'); break;
      case 'fita': cls('s4b-fita'); sub('a imagem tremeu feito fita velha.'); break;
      case 'ladob': sfx('fitaClique'); setTimeout(() => sfx('chiadoFita'), 300); sub('você virou a fita pro lado B.'); break;
      case 'fogo': cls('s4b-fogo'); sub('por três segundos, o internato pegou fogo de novo.'); setTimeout(() => { try { document.documentElement.classList.remove('s4b-fogo'); } catch (e) {} }, 3000); break;
      default: break;
    }
    try { morse(h[0]); } catch (e) {}
  }
  function muroNome(txt) {
    if ($('#s4b-muro')) return; const d = document.createElement('div'); d.id = 's4b-muro'; d.textContent = txt;
    $('#title') && $('#title').appendChild(d);
  }
  function velaTitulo() {
    if ($('#s4b-vela')) return; const d = document.createElement('div'); d.id = 's4b-vela'; d.innerHTML = '<span class="chama"></span>';
    d.style.pointerEvents = 'auto'; d.style.cursor = 'pointer'; d.title = 'soprar a vela';
    d.onclick = () => { const ch = d.querySelector('.chama'); if (ch) ch.style.display = ch.style.display === 'none' ? '' : 'none'; sfx('clique'); sub(ch && ch.style.display === 'none' ? 'você apagou a vela. agora escurece de verdade.' : 'acendeu de novo.'); };
    $('#title') && $('#title').appendChild(d);
  }
  function corvoTitulo() {
    if ($('#s4b-corvo')) return; const c = document.createElement('canvas'); c.id = 's4b-corvo'; c.width = 70; c.height = 50;
    const g = c.getContext('2d'); g.fillStyle = '#0a0a0a'; g.beginPath(); g.ellipse(35, 30, 16, 9, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(50, 24, 7, 6, 0, 0, 7); g.fill(); g.fillRect(55, 23, 8, 2); // bico
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.moveTo(20, 28); g.lineTo(4, 16); g.lineTo(24, 24); g.fill();
    $('#title') && $('#title').appendChild(c);
  }
  function relampagoTitulo() {
    if (semFlash()) return; const o = document.createElement('div'); o.id = 's4b-rel'; $('#title') && $('#title').appendChild(o);
    let n = 0; const t = setInterval(() => { if (!noTitulo() || n > 40) { clearInterval(t); o.remove(); return; } if (Math.random() < .08) { o.style.opacity = '.5'; sfx('trovao'); setTimeout(() => o.style.opacity = '0', 90); setTimeout(() => { o.style.opacity = '.3'; setTimeout(() => o.style.opacity = '0', 60); }, 180); } n++; }, 500);
  }
  function lanternaTitulo() {
    const t = $('#title'); if (!t) return; const mv = e => { const x = (e.touches ? e.touches[0].clientX : e.clientX), y = (e.touches ? e.touches[0].clientY : e.clientY); t.style.setProperty('--lx', x + 'px'); t.style.setProperty('--ly', y + 'px'); };
    t.addEventListener('mousemove', mv); t.addEventListener('touchmove', mv);
  }

  // ------------------------------------------------------------------ CÓDIGO NOVO DIGITADO NO TÍTULO: GAVETA (da cifra do código-fonte)
  let bufT = '';
  if (!robo) addEventListener('keydown', e => {
    if (!noTitulo()) { bufT = ''; return; }
    const m = /^Key([A-Z])$/.exec(e.code); if (!m) return;
    bufT = (bufT + m[1]).slice(-10);
    if (bufT.endsWith('GAVETA')) { bufT = ''; sub('QUEM ABRIU A MINHA GAVETA? — a letra do Davi, decifrada.'); sfx('sinoLonge'); if (!seg.gaveta) { seg.gaveta = 1; guarda(); conq('s4b_gaveta'); } }
  }, false);

  // ------------------------------------------------------------------ COMANDOS DE CONSOLE NOVOS (circulam em fórum)
  try {
    const S = window.__segredos; if (S) {
      const asc = s => '\n' + s + '\n';
      S.moacir = () => asc('  FICHA — Moacir, bedel.\n  cego desde 1947. "eu ouço quem conta."\n  última anotação: 14/03/1979.');
      S.ana = () => { let o = '  '; for (let i = 1; i <= 10; i++) o += (i === 10 ? '___' : i) + ' '; return asc(o + '\n  (ela parou de contar no dez.)'); };
      S.procissao = () => asc('  as nove badaladas:\n  ' + [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => 'dom').join(' · ') + '\n  na nona, ninguém respira.');
      S.joaquim = () => { sfx('sinoLonge'); return asc('  "eu abri o portão. deus me perdoe." — J.'); };
      S.sino = () => { sfx('badaladas'); return 'nove badaladas. conta.'; };
      S.presente = () => asc('  olhe os créditos de novo.\n  algumas letras pesam mais: elas escrevem um PRESENTE.');
      S.turma = () => asc('  a turma de 1979 — 37 crianças, uma sem nome:\n  Davi, Ana, Tomé, Celeste, Luiz... ______');
      S.celeste = () => { sfx('sussurros'); return asc('  "santa Luzia, dai luz aos olhos dele."\n  — Dona Celeste, cozinheira'); };
      S.tome = () => asc('  OCORRÊNCIA 21h04 — aluno Tomé R. falou\n  durante a Hora. não foi mais visto.');
      S.silencio = () => { try { console.clear(); } catch (e) {} return '.'; };
      S.ajuda && (S.ajuda = (orig => function () { try { orig.call(this); } catch (e) {} console.log('mais: moacir() ana() procissao() joaquim() sino() presente() turma()'); return 'ninguém ajudou a gente. — D.'; })(S.ajuda));
    }
  } catch (e) {}

  // ------------------------------------------------------------------ CORREIO ENTRE AMIGOS (link, sem servidor)
  const filtra = s => String(s || '').replace(/[^A-Za-zÀ-ÿ0-9 .!?]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
  // FRASES prontas (sem texto livre) para recado de giz no fim do capítulo
  const FRASES = ['NÃO CONFIA NA LUZ', 'TEM ARMÁRIO À ESQUERDA', 'EU MORRI AQUI', 'ELE ESTÁ NO TETO', 'NÃO RESPONDE', 'TEM PILHA AQUI', 'CORRE', 'ELA TÁ ATRÁS', 'EU CHEGUEI ATÉ AQUI', 'MENTIRA'];
  const SUSTOS = ['uma mão no vidro', 'o sino fora de hora', 'a Ana no banco de trás', 'o Inspetor no fim da estrada', 'o rádio dizendo seu nome'];

  function lerLink() {
    if (robo || !noTitulo()) return;
    let p; try { p = new URLSearchParams(location.search); } catch (e) { return; }
    // selo de exploradora: "{nome} achou o Dormitório F. Você não."
    const selo = filtra(p.get('selo')); if (selo) { const nome = filtra(p.get('de')) || 'alguém'; cartaz(nome + ' achou o ' + selo + '. Você não.'); }
    // frase de giz pronta (índice)
    const fi = parseInt(p.get('f'), 10); if (fi >= 0 && fi < FRASES.length) { gizChao(FRASES[fi], filtra(p.get('de'))); conq('s4_correio'); }
    // pegadinha preparada por um amigo
    const pg = parseInt(p.get('pega'), 10); if (pg >= 0 && pg < SUSTOS.length) agendarPega(pg, filtra(p.get('de')));
    // código de colecionador para comparar
    const col = p.get('col'); if (col) compararColecao(col, filtra(p.get('de')));
    // vela acesa que um amigo deixou
    if (p.get('vela')) { velaTitulo(); sub((filtra(p.get('de')) || 'alguém') + ' acendeu uma vela pra você.'); conq('s4b_vela'); }
    // X de giz vermelho onde o amigo caiu
    const xn = filtra(p.get('x')); if (p.get('x') != null) xGiz(xn || (filtra(p.get('de')) || 'alguém'));
    // senha de pista para amigos: uma dica vaga, sem spoiler (confirma antes)
    const senha = String(p.get('pista') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
    if (senha && PISTAS[senha]) { sub('Um amigo te deixou uma pista. Toque no título para ler.'); const abrir = () => { removeEventListener('pointerdown', abrir); if (confirm('Quer mesmo a pista? Tira um pouco da graça de achar sozinho.')) sub('Pista: ' + PISTAS[senha]); }; addEventListener('pointerdown', abrir, { once: true }); }
  }
  const PISTAS = { GATO7: 'cozinha, Capítulo I, tem a ver com pão', SINO9: 'o relógio da recepção marca mais que a hora', POCO3: 'túneis, perto da água parada', LOUSA: 'dormitórios, uma conta errada de propósito', PORAO: 'uma placa de obra no portão não mente' };
  function xGiz(nome) { if ($('#s4b-x')) return; const d = document.createElement('div'); d.id = 's4b-x'; d.innerHTML = '✕<small>' + nome.toUpperCase().slice(0, 16) + ' caiu aqui</small>'; $('#title') && $('#title').appendChild(d); }
  function cartaz(txt) { if ($('#s4b-cartaz')) return; const d = document.createElement('div'); d.id = 's4b-cartaz'; d.textContent = txt; $('#title') && $('#title').appendChild(d); narrar(txt); }
  function gizChao(frase, de) { const d = document.createElement('div'); d.id = 's4b-giz-chao'; d.innerHTML = frase.replace(/</g, '') + '<small>— ' + (de ? de.toUpperCase().slice(0, 16) : 'um amigo') + '</small>'; $('#title') && $('#title').appendChild(d); narrar('recado de giz, ' + frase); }
  function agendarPega(ix, de) {
    seg.pegaPend = { ix, de }; guarda();
  }
  // dispara a pegadinha guardada quando o prólogo começa (só uma vez, nunca em modos especiais)
  function talvezPega() {
    if (robo || !seg.pegaPend) return;
    try { if (C.S && (C.S.umaVida || C.S.desafio)) return; } catch (e) {}
    const { ix, de } = seg.pegaPend; delete seg.pegaPend; guarda();
    setTimeout(() => {
      if (!emJogo()) return;
      const o = document.createElement('div'); o.id = 's4b-pega'; o.innerHTML = '<div class="rosto"></div>'; document.body.appendChild(o);
      sfx(ix === 1 ? 'sino' : ix === 4 ? 'sussurros' : 'risada'); if (!semFlash()) vibrarSeg(.9, .6, 300);
      setTimeout(() => { o.classList.add('some'); setTimeout(() => o.remove(), 600); }, 700);
      try { C.toast && C.toast('Pegadinha de ' + (de || 'um amigo') + ': ' + SUSTOS[ix] + '.'); } catch (e) {}
      conq('s4b_pega');
    }, 4000 + Math.random() * 6000);
  }
  // código de colecionador: bitmask dos selos em base36
  function meuCodigo() {
    try {
      const sel = (lsGet('hora-silencio-seg', {}).selos) || {}; const keys = ['davi', 'ana', '1979', 'silencio', 'breu', 'espelho', 'apito', 'chuva', 'aniv'];
      let bits = 0; keys.forEach((k, i) => { if (sel[k]) bits |= (1 << i); });
      let n = 0; (window.ROTEIRO.conquistas || []).forEach(c => { if (c.secreta && temConq(c.id)) n++; });
      return (bits.toString(36) + '.' + n.toString(36));
    } catch (e) { return '0.0'; }
  }
  function temConq(id) { try { return (JSON.parse(localStorage.getItem(C.CAPS_KEY) || '{}'))[id]; } catch (e) { return false; } }
  function compararColecao(cod, de) {
    try {
      const amigo = parseInt((cod.split('.')[1] || '0'), 36) || 0; let meu = 0; (window.ROTEIRO.conquistas || []).forEach(c => { if (c.secreta && temConq(c.id)) meu++; });
      const dif = amigo - meu; conq('s4b_coletor');
      cartaz((de || 'um amigo') + ' tem ' + amigo + ' segredos. Você tem ' + meu + '.' + (dif > 0 ? ' Faltam ' + dif + ' pra você.' : dif < 0 ? ' Você está na frente.' : ' Empate.'));
    } catch (e) {}
  }

  // botões no fim do capítulo (recado de giz por frase, mandar susto, código de colecionador)
  function montarFim() {
    const menu = $('#e-menu'); if (!menu) return;
    if (!$('#s4b-giz-btn')) {
      const b = document.createElement('button'); b.className = 'btn'; b.id = 's4b-giz-btn'; b.textContent = 'Deixar recado de giz (frase pronta)'; menu.before(b);
      b.onclick = () => {
        const lista = FRASES.map((f, i) => (i + 1) + '. ' + f).join('\n');
        const n = parseInt(prompt('Escolha uma frase para riscar no chão do amigo:\n' + lista, '1'), 10);
        if (!(n >= 1 && n <= FRASES.length)) return;
        const nome = filtra(prompt('Seu nome (até 16 letras):', '') || '').slice(0, 16);
        montarLink(b, { f: (n - 1), de: nome });
      };
    }
    if (!$('#s4b-pega-btn')) {
      const b = document.createElement('button'); b.className = 'btn'; b.id = 's4b-pega-btn'; b.textContent = 'Preparar um susto para alguém'; menu.before(b);
      b.onclick = () => {
        const lista = SUSTOS.map((s, i) => (i + 1) + '. ' + s).join('\n');
        const n = parseInt(prompt('Qual susto o amigo vai levar no prólogo?\n' + lista, '1'), 10);
        if (!(n >= 1 && n <= SUSTOS.length)) return;
        const nome = filtra(prompt('Seu nome (até 16 letras):', '') || '').slice(0, 16);
        montarLink(b, { pega: (n - 1), de: nome });
      };
    }
    if (!$('#s4b-col-btn')) {
      const b = document.createElement('button'); b.className = 'btn'; b.id = 's4b-col-btn'; b.textContent = 'Copiar meu código de colecionador'; menu.before(b);
      b.onclick = () => { const cod = meuCodigo(); const nome = filtra(prompt('Seu nome (para o amigo comparar, até 16 letras):', '') || '').slice(0, 16); montarLink(b, { col: cod, de: nome }, 'Código copiado. O amigo cola no link ?col='); };
    }
  }
  function montarLink(b, params, msg) {
    let url = location.origin + location.pathname; const q = [];
    for (const k in params) if (params[k] !== '' && params[k] != null) q.push(k + '=' + encodeURIComponent(params[k]));
    if (q.length) url += '?' + q.join('&');
    if (copiar) copiar(url).then(ok => feedback && feedback(b, ok ? (msg || 'Link copiado. Mande para um amigo.') : url)); else prompt('Copie o link:', url);
  }

  // ------------------------------------------------------------------ PILHA DO APARELHO (getBattery): a lanterna sente
  function pilhaReal() {
    if (robo || !navigator.getBattery) return;
    try {
      navigator.getBattery().then(bt => {
        const ver = () => {
          try {
            if (!emJogo()) return;
            if (bt.level < .15 && !bt.charging) {
              if (!seg.bateria) { seg.bateria = 1; guarda(); conq('s4b_bateria'); C.toast && C.toast('a sua pilha também tá acabando, né?'); }
              try { if (C.S) C.S._pilhaFraca = 1; } catch (e) {}
            } else { try { if (C.S) C.S._pilhaFraca = 0; } catch (e) {} if (bt.charging && seg.bateria === 1) { seg.bateria = 2; guarda(); C.toast && C.toast('obrigada. a luz voltou.'); } }
          } catch (e) {}
        };
        bt.addEventListener('levelchange', ver); bt.addEventListener('chargingchange', ver); setInterval(ver, 15000); ver();
      });
    } catch (e) {}
  }

  // ------------------------------------------------------------------ TECLA DE CLIPE (F9): grava os últimos 15 s (opt-in)
  let rec = null, chunks = [];
  function ligarClipes() {
    if (robo || rec || !O.clipes) return;
    try {
      const cv = document.querySelector('canvas'); if (!cv || !cv.captureStream) return;
      const st = cv.captureStream(30);
      try { if (C.AC && C.AC.createMediaStreamDestination) { const dst = C.AC.createMediaStreamDestination(); C.master && C.master.connect(dst); dst.stream.getAudioTracks().forEach(t => st.addTrack(t)); } } catch (e) {}
      rec = new MediaRecorder(st, { mimeType: 'video/webm' });
      rec.ondataavailable = e => { if (e.data && e.data.size) { chunks.push(e.data); if (chunks.length > 8) chunks.shift(); } };
      rec.start(2000);
    } catch (e) { rec = null; }
  }
  function baixarClipe() {
    try {
      if (!chunks.length) { C.toast && C.toast('Nada gravado ainda.'); return; }
      const blob = new Blob(chunks, { type: 'video/webm' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = 'hora-do-silencio-clipe.webm'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      conq('s4b_clipe'); C.toast && C.toast('Clipe salvo.');
    } catch (e) {}
  }
  if (!robo) addEventListener('keydown', e => { if (e.code === 'F9' && O.clipes) { e.preventDefault(); baixarClipe(); } });

  // ------------------------------------------------------------------ CONTROLE: dois analógicos para baixo = mãos na boca
  let padLoop2 = 0;
  function pollPad2() {
    padLoop2 = requestAnimationFrame(pollPad2); if (robo || !emJogo()) return;
    let gp = null; try { gp = (navigator.getGamepads && navigator.getGamepads()[0]) || null; } catch (e) {}
    if (!gp || !gp.connected) return; const ax = gp.axes || [];
    const baixo = (ax[1] > .7) && (ax[3] > .7);
    if (baixo && !seg._boca) { seg._boca = 1; if (!seg.boca) { seg.boca = 1; guarda(); conq('s4b_boca'); } C.toast && C.toast('[você tampa a boca com as duas mãos]'); try { if (C.S) C.S._mB = 1; } catch (e) {} }
    else if (!baixo && seg._boca) { seg._boca = 0; try { if (C.S) C.S._mB = 0; } catch (e) {} }
  }
  if (!robo) pollPad2();

  // ------------------------------------------------------------------ GAMEPAD caiu no meio da caçada: "ele não vai esperar"
  if (!robo) {
    addEventListener('gamepaddisconnected', () => {
      try { if (emJogo() && C.S && C.S.fear > 60) { const d = document.createElement('div'); d.id = 's4b-semcontrole'; d.textContent = 'ele não vai esperar'; document.body.appendChild(d); setTimeout(() => d.remove(), 1200); } } catch (e) {}
    });
    addEventListener('gamepadconnected', () => { try { if (emJogo()) for (let i = 0; i < 9; i++) setTimeout(() => vibrarSeg(.6, .4, 60), i * 90); } catch (e) {} });
  }

  // ------------------------------------------------------------------ TÍTULO DA ABA reage ao que você já viu
  function tituloAba() {
    try {
      const n = (window.ROTEIRO.conquistas || []).filter(c => c.secreta && temConq(c.id)).length;
      if (n >= 6 && !/★/.test(document.title)) document.title = '★ ' + document.title.replace(/^★ /, '');
      if (document.documentElement.classList.contains('s4-lua') && !/🌕/.test(document.title)) document.title = '🌕 ' + document.title;
    } catch (e) {}
  }

  // ------------------------------------------------------------------ PWA: oferecer instalar (jogar offline) e avisar quando guardar
  if (!robo) {
    addEventListener('beforeinstallprompt', e => {
      try {
        e.preventDefault(); if (!noTitulo() || $('#s4b-instalar')) return;
        const b = document.createElement('button'); b.id = 's4b-instalar'; b.className = 'btn'; b.textContent = 'Instalar para jogar sem internet';
        b.onclick = () => { b.remove(); e.prompt(); };
        $('#title') && $('#title').appendChild(b);
      } catch (er) {}
    });
    addEventListener('appinstalled', () => { try { sub('guardado. agora dá pra jogar sem internet.'); } catch (e) {} });
  }

  // ------------------------------------------------------------------ Opções novas na tela Desempenho
  function montarOpcoes() {
    const fs = $('#s4-opc'); if (!fs || $('#s4b-opc-add')) return;
    const span = document.createElement('div'); span.id = 's4b-opc-add';
    const row = (key, label, dica) => `<label><input type="checkbox" data-k="${key}"> ${label}</label>${dica ? '<small>' + dica + '</small>' : ''}`;
    span.innerHTML = row('clipes', 'Guardar clipes (F9)', 'Grava os últimos 15 s do que está na tela. Para quem faz live.') +
      row('clipeMorte', 'Baixar o clipe ao morrer', 'Guarda sozinho os últimos segundos quando o Inspetor te pega.') +
      (('getBattery' in navigator) ? row('semPilhaReal', 'Ignorar a bateria do aparelho', 'Desliga o efeito de pilha fraca quando o aparelho está acabando.') : '') +
      row('semPega', 'Recusar pegadinhas de amigos', 'Ignora sustos preparados por links de amigos.') +
      row('pulso', 'Pulso no controle', 'O controle bate junto com o coração da Lia — mais forte com medo.') +
      (('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) ? row('micNome', 'Microfone: chamar pelo nome', 'Dizer um nome em voz alta chama alguém no escuro. Pede o microfone.') : '') +
      row('segContraste', 'Legendas de segredo em alto contraste', 'Contorno escuro atrás dos recados de giz.') +
      row('segGrande', 'Texto dos segredos maior', 'Aumenta os recados e cartazes dos easter eggs.') +
      row('escondePista', 'Esconder a pista do porão', 'Tira o aviso de obra no rodapé do título.') +
      row('semFxTitulo', 'Parar os efeitos do título', 'Congela cinzas, chuva, vela e corvo (para quem se cansa do movimento).') +
      row('narraSeg', 'Narrar os segredos achados', 'Anuncia por leitor de tela quando um segredo aparece.') +
      row('semVibSeg', 'Segredos sem vibração', 'Tira a vibração dos easter eggs (pegadinhas, pulso, controle).') +
      row('morseSeg', 'Vibrar a inicial da sala em Morse', 'Perto de um segredo, o controle/celular bate a letra em Morse.');
    fs.appendChild(span);
    span.querySelectorAll('input[data-k]').forEach(inp => { const k = inp.dataset.k; inp.checked = !!O[k]; inp.onchange = () => { O[k] = inp.checked; salvar(); if (k === 'clipes') { if (inp.checked) ligarClipes(); } if (k === 'micNome') { if (inp.checked) ligarMic(); else pararMic(); } aplicarAcess(); }; });
    aplicarAcess();
  }

  // ------------------------------------------------------------------ ACESSIBILIDADE dos segredos (classes no body, narração)
  function aplicarAcess() {
    try {
      document.body.classList.toggle('s4b-contraste', !!O.segContraste);
      document.body.classList.toggle('s4b-grande', !!O.segGrande);
      document.body.classList.toggle('s4b-semfx', !!O.semFxTitulo);
      const p = $('#s4-pista'); if (p) p.style.display = O.escondePista ? 'none' : '';
    } catch (e) {}
  }
  let viva = null;
  function narrar(t) {
    if (!O.narraSeg) return;
    try { if (!viva) { viva = document.createElement('div'); viva.id = 's4b-aria'; viva.setAttribute('aria-live', 'polite'); viva.style.cssText = 'position:absolute;left:-9999px'; document.body.appendChild(viva); } viva.textContent = ''; setTimeout(() => viva.textContent = 'Segredo: ' + t, 60); } catch (e) {}
  }

  // ------------------------------------------------------------------ MICROFONE: chamar alguém pelo nome (opt-in)
  let recog = null;
  function ligarMic() {
    if (robo || recog) return;
    try {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SR) return;
      recog = new SR(); recog.lang = 'pt-BR'; recog.continuous = true; recog.interimResults = false;
      recog.onresult = ev => {
        try {
          if (!emJogo()) return; let txt = ''; for (let i = ev.resultIndex; i < ev.results.length; i++) txt += ev.results[i][0].transcript + ' ';
          txt = txt.toLowerCase();
          if (/\bdavi\b|\blia\b|\bana\b/.test(txt)) {
            if (!seg.nome) { seg.nome = 1; guarda(); conq('s4b_nome'); }
            C.toast && C.toast('alguém respondeu, bem baixinho.'); sfx('sussurros');
            try { if (C.S) { C.S.fear = Math.min(100, (C.S.fear || 0) + 8); } } catch (e) {}
          }
        } catch (e) {}
      };
      recog.onend = () => { if (O.micNome && !robo) { try { recog.start(); } catch (e) {} } };
      recog.start();
    } catch (e) { recog = null; }
  }
  function pararMic() { try { if (recog) { recog.onend = null; recog.stop(); recog = null; } } catch (e) {} }

  // ------------------------------------------------------------------ PULSO no controle (coração da Lia)
  let pulsoT = 0;
  function pulso(dt) {
    if (robo || !O.pulso || !emJogo()) return; pulsoT -= (dt || 1 / 60);
    if (pulsoT <= 0) { let f = 0; try { f = (C.S && C.S.fear) || 0; } catch (e) {} const ritmo = 1.0 - Math.min(.6, f / 100 * .6); pulsoT = ritmo; const forca = .12 + f / 100 * .35; vibrarSeg(forca, forca * .5, 70); setTimeout(() => vibrarSeg(forca * .7, forca * .3, 60), 150); }
  }

  // ------------------------------------------------------------------ TÍTULO: contador de segredos, 9 cliques, ociosidade
  function contadorTitulo() {
    try {
      const n = (window.ROTEIRO.conquistas || []).filter(c => c.secreta && temConq(c.id)).length;
      let el = $('#s4b-contador'); if (!el) { el = document.createElement('div'); el.id = 's4b-contador'; $('#title') && $('#title').appendChild(el); }
      el.textContent = 'segredos achados: ' + n;
    } catch (e) {}
  }
  if (!robo) {
    let cli = 0, cliT = 0;
    addEventListener('click', e => { if (!noTitulo()) { cli = 0; return; } const now = performance.now(); if (now - cliT > 1200) cli = 0; cliT = now; cli++; if (cli >= 9) { cli = 0; sfx('badaladas'); sub('quem foi que contou?'); } });
    let idleT = 0, idleAviso = false;
    setInterval(() => { if (!noTitulo()) { idleT = 0; idleAviso = false; return; } idleT += 1; if (idleT === 30 && !idleAviso) { idleAviso = true; sfx('sussurros'); sub('vamos, Lia? elas estão esperando.'); } }, 1000);
    ['pointermove', 'keydown'].forEach(ev => addEventListener(ev, () => { idleT = 0; idleAviso = false; }));
  }

  // ------------------------------------------------------------------ BOTÃO "baixar os últimos 15 s" na tela de morte
  let morteBtnFeito = false;
  function talvezBotaoMorte() {
    if (robo || !O.clipes) return;
    try {
      const m = $('#morte') || $('#death') || $('#tela-morte');
      if (m && !m.hidden && !$('#s4b-clip-morte')) {
        const b = document.createElement('button'); b.className = 'btn'; b.id = 's4b-clip-morte'; b.textContent = 'Baixar os últimos 15 s';
        b.onclick = baixarClipe; (m.querySelector('.menu') || m).appendChild(b);
        if (O.clipeMorte) setTimeout(baixarClipe, 300);
      }
    } catch (e) {}
  }

  // ------------------------------------------------------------------ início
  if (!robo) { lerHash(); lerLink(); pilhaReal(); montarOpcoes(); tituloAba(); contadorTitulo(); aplicarAcess(); if (O.clipes) setTimeout(ligarClipes, 3000); if (O.micNome) setTimeout(ligarMic, 2000); }

  let fimFeito = false, pegaOk = false;
  return {
    frame(dt, ativo) {
      if (robo) return;
      if (O.semPega && seg.pegaPend) { delete seg.pegaPend; guarda(); }
      if (!pegaOk && emJogo()) { pegaOk = true; if (!O.semPega) talvezPega(); }
      if (!fimFeito) { try { if ($('#e-menu')) { montarFim(); fimFeito = true; } } catch (e) {} }
      try { pulso(dt); } catch (e) {}
      try { talvezBotaoMorte(); } catch (e) {}
    },
    mapa() { fimFeito = false; pegaOk = false; },
    aoFim() { montarFim(); montarOpcoes(); },
    baixarClipe,
    _teste: { CONQ4B, FRASES, SUSTOS, meuCodigo, temConq }
  };
}
