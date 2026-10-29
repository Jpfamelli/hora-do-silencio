// INTERFACE — lote 4: segredos e easter eggs. Álbum de figurinhas, a última página do diário (que responde),
// decalque da página arrancada, margens que brilham no escuro, fuligem dos segredos que ficaram para trás,
// título que guarda o que você achou (riscos de giz, marcas da porta, rodapé, texto escondido, boatos no rádio,
// disco de telefone), códigos novos, tela de morte com segredos (Lia nº N, fora do ar, trigésima sétima),
// opção que não devia estar lá, manual do F1, final com boatos da escola, charada, lata e "E também".
// Criado por src/interface.js (criarSegredos(C, U)); todos os ganchos são chamados por lá.
import { vibrar } from './estrada-polimento.js';

export function criarSegredos(C, U) {
  const $ = s => document.querySelector(s);
  const R = C.R, OPT = C.OPT;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rel = () => performance.now() / 1000;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const UI4 = 'hora-silencio-ui4';
  const mem = (() => { try { return JSON.parse(localStorage.getItem(UI4)) || {}; } catch (e) { return {}; } })();
  const gravar = () => { try { localStorage.setItem(UI4, JSON.stringify(mem)); } catch (e) {} };
  const St = () => C.S;
  const fl = k => { const S = St(); return !!(S && S.flags && S.flags['sg4_' + k]); };
  const marcar = k => { const S = St(); if (S && S.flags) S.flags['sg4_' + k] = 1; };
  const stats = () => C.lsGet('hora-silencio-stats', {}) || {};
  const acervo = () => C.lsGet('hora-silencio-v3-acervo', {}) || {};
  const conqs = () => C.lsGet('hora-silencio-v2-conq', {}) || {};
  const nomeJog = () => { const n = C.lsGet('hora-silencio-nome', ''); return typeof n === 'string' ? n.trim().slice(0, 16) : ''; };
  const norm = s => String(s || '').normalize('NFD').toLowerCase().replace(/[^a-z0-9]/g, '');
  const menosMov = () => document.body.classList.contains('menos-mov');
  const semFlash = () => !!OPT.vFlash;
  const pick = a => a[Math.random() * a.length | 0];
  const hoje = () => { const d = new Date(); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; };
  const relogio = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}.${String(Math.floor(s * 100 % 100)).padStart(2, '0')}`;
  const mmss = s => `${Math.floor(s / 60)}min ${String(Math.floor(s % 60)).padStart(2, '0')}s`;

  // ------------------------------------------------------------ CONQUISTAS SECRETAS NOVAS
  for (const c of [
    { id: 'fora_do_ar', nome: 'Fora do Ar', desc: 'Morra nove vezes na mesma noite e assista ao fim da programação.', segredo: true },
    { id: 'nove_e_nove', nome: 'Nove e Nove', desc: 'Com o cronômetro ligado, passe pelos 09:09.09.', segredo: true },
    { id: 'convite', nome: 'Convite', desc: 'Insista na opção que não devia estar lá.', segredo: true },
    { id: 'manual', nome: 'Leu o Manual', desc: 'Aperte a tecla de ajuda que ninguém usa.', segredo: true },
    { id: 'decalque', nome: 'Decalque', desc: 'Passe o lápis na página que ficou marcada pela caneta.', segredo: true },
    { id: 'acordei', nome: 'Acordei', desc: 'Diga ao internato para acordar, na tela de título.', segredo: true },
    { id: 'sineiro', nome: 'Sineiro', desc: 'Escreva no título o que o Davi queria ser.', segredo: true },
    { id: 'chamada', nome: 'Chamada Completa', desc: 'Chame no título o Tomé, a Irmã Celeste e o diretor.', segredo: true },
    { id: 'porta_giz', nome: 'A Porta de Giz', desc: 'Ache todas as palavras do título e abra a porta que elas desenham.', segredo: true },
    { id: 'disco', nome: 'Linha Direta', desc: 'Disque um segredo no telefone do rádio-relógio.', segredo: true }
  ]) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);

  // ------------------------------------------------------------ OPÇÃO NOVA: FARO (liberada depois do primeiro final)
  const algumFinal = () => Object.keys(stats().finais || {}).length > 0;
  if (OPT.faro === undefined) OPT.faro = false; U.PAD.faro = false;
  const gInt = U.GRUPOS.find(g => g[0] === 'Interface');
  if (gInt) gInt[1].push({ k: 'faro', nome: 'Faro para segredos (um tom grave e "algo escondido por perto" a 4 m de um segredo)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']], se: algumFinal });

  // ------------------------------------------------------------ SONS PRÓPRIOS (procedurais, no volume geral)
  let nb = null;
  function ac() { const A = C.AC; if (!A || !C.master || A.state !== 'running') return null; if (!nb) { nb = A.createBuffer(1, A.sampleRate, A.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return A; }
  function destino(A, pan) { if (pan && A.createStereoPanner) { const p = A.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); p.connect(C.master); return p; } return C.master; }
  function ruido(A, t, dur, tipo, f, q, vol, pan, f2, ataque) {
    const s = A.createBufferSource(); s.buffer = nb; const fl2 = A.createBiquadFilter(); fl2.type = tipo; fl2.frequency.setValueAtTime(f, t); if (f2) fl2.frequency.exponentialRampToValueAtTime(f2, t + dur); fl2.Q.value = q;
    const g = A.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + (ataque || Math.min(.004, dur / 4))); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(fl2); fl2.connect(g); g.connect(destino(A, pan)); s.start(t, Math.random() * .5); s.stop(t + dur + .03);
  }
  function tom(A, t, dur, f, f2, vol, tipo = 'sine', pan, sustenta) {
    const o = A.createOscillator(); o.type = tipo; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = A.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01);
    if (sustenta) { g.gain.setValueAtTime(vol, t + dur - .05); g.gain.linearRampToValueAtTime(0, t + dur); } else g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(destino(A, pan)); o.start(t); o.stop(t + dur + .03);
  }
  const SOM = {
    giz() { const A = ac(); if (!A) return; const t = A.currentTime; for (let i = 0; i < 6; i++) ruido(A, t + i * .045 + Math.random() * .02, .035, 'bandpass', 2600 + Math.random() * 1500, 3, .07); ruido(A, t + .3, .12, 'bandpass', 3400, 2, .05, 0, 2200); },
    figurinha() { const A = ac(); if (!A) return; const t = A.currentTime; ruido(A, t, .38, 'highpass', 900, .7, .06, 0, 5200, .05); ruido(A, t + .36, .03, 'bandpass', 1800, 4, .09); },
    mola(n) { const A = ac(); if (!A) return; const t = A.currentTime, d = .12 * n + .1; tom(A, t, d, 260, 700, .025, 'triangle'); for (let i = 0; i < n; i++) ruido(A, t + i * .12, .015, 'bandpass', 2400, 6, .08); },
    furo() { const A = ac(); if (!A) return; ruido(A, A.currentTime, .05, 'bandpass', 900, 2, .1); },
    grafite() { const A = ac(); if (!A) return; ruido(A, A.currentTime, .06, 'bandpass', 3200 + Math.random() * 800, 2, .03); },
    escrita() { const A = ac(); if (!A) return; ruido(A, A.currentTime, .04, 'bandpass', 2000 + Math.random() * 1500, 3, .025); },
    tvOff() { const A = ac(); if (!A) return; const t = A.currentTime; ruido(A, t, .03, 'highpass', 2500, .7, .12); tom(A, t, .9, 140, 35, .06, 'sawtooth'); ruido(A, t + .05, .8, 'bandpass', 6000, 1, .02, 0, 900); },
    khz(dur) { const A = ac(); if (!A) return; tom(A, A.currentTime, dur, 1000, 0, .035, 'sine', 0, true); },
    respira(pan) { const A = ac(); if (!A) return; const t = A.currentTime; ruido(A, t, .9, 'lowpass', 900, .6, .09, pan, 500, .35); ruido(A, t + 1.1, .7, 'lowpass', 700, .6, .06, pan, 400, .2); },
    lingua() { const A = ac(); if (!A) return; const t = A.currentTime; ruido(A, t, .02, 'bandpass', 1500, 5, .14); ruido(A, t + .03, .014, 'bandpass', 2100, 5, .08); },
    batidas() { const A = ac(); if (!A) return; const t = A.currentTime; for (let i = 0; i < 3; i++) { ruido(A, t + .4 + i * .5, .22, 'lowpass', 260, 1, .4); tom(A, t + .4 + i * .5, .18, 90, 60, .12); } },
    grave() { const A = ac(); if (!A) return; tom(A, A.currentTime, .9, 68, 52, .1); },
    calor() { const A = ac(); if (!A) return; ruido(A, A.currentTime, 1.2, 'highpass', 4000, .5, .03, 0, 7000, .4); }
  };
  const sfx = (k, ...a) => { try { C.SFX[k](...a); } catch (e) {} };

  // ------------------------------------------------------------ DESENHOS A GIZ (canvas, sem asset)
  const FORMAS = {
    sino: g => { g.moveTo(.3, .72); g.quadraticCurveTo(.28, .24, .5, .22); g.quadraticCurveTo(.72, .24, .7, .72); g.closePath(); g.moveTo(.24, .74); g.lineTo(.76, .74); g.moveTo(.55, .83); g.arc(.5, .83, .05, 0, 7); },
    vela: g => { g.rect(.42, .42, .16, .42); g.moveTo(.5, .16); g.quadraticCurveTo(.6, .3, .5, .38); g.quadraticCurveTo(.4, .3, .5, .16); },
    olho: g => { g.moveTo(.12, .5); g.quadraticCurveTo(.5, .16, .88, .5); g.quadraticCurveTo(.5, .84, .12, .5); g.moveTo(.6, .5); g.arc(.5, .5, .1, 0, 7); },
    chave: g => { g.moveTo(.42, .5); g.arc(.3, .5, .12, 0, 7); g.moveTo(.42, .5); g.lineTo(.86, .5); g.lineTo(.86, .63); g.moveTo(.72, .5); g.lineTo(.72, .6); },
    casa: g => { g.rect(.27, .46, .46, .36); g.moveTo(.2, .48); g.lineTo(.5, .2); g.lineTo(.8, .48); g.rect(.44, .62, .12, .2); },
    fita: g => { g.rect(.14, .3, .72, .42); g.moveTo(.43, .5); g.arc(.35, .5, .08, 0, 7); g.moveTo(.73, .5); g.arc(.65, .5, .08, 0, 7); g.moveTo(.3, .66); g.lineTo(.7, .66); },
    estrela: g => { for (let i = 0; i <= 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 4 / 5, x = .5 + Math.cos(a) * .36, y = .54 + Math.sin(a) * .36; if (i) g.lineTo(x, y); else g.moveTo(x, y); } },
    carro: g => { g.rect(.12, .48, .76, .2); g.moveTo(.3, .48); g.lineTo(.36, .32); g.lineTo(.62, .32); g.lineTo(.7, .48); g.moveTo(.37, .74); g.arc(.3, .74, .07, 0, 7); g.moveTo(.77, .74); g.arc(.7, .74, .07, 0, 7); },
    lua: g => { g.moveTo(.625, .785); g.arc(.48, .5, .32, Math.PI * .35, Math.PI * 1.65); g.quadraticCurveTo(.38, .5, .625, .785); },
    cruz: g => { g.moveTo(.5, .14); g.lineTo(.5, .86); g.moveTo(.28, .36); g.lineTo(.72, .36); },
    pipa: g => { g.moveTo(.5, .12); g.lineTo(.78, .42); g.lineTo(.5, .76); g.lineTo(.22, .42); g.closePath(); g.moveTo(.5, .76); g.quadraticCurveTo(.38, .86, .56, .95); },
    barco: g => { g.moveTo(.14, .6); g.lineTo(.86, .6); g.lineTo(.72, .78); g.lineTo(.28, .78); g.closePath(); g.moveTo(.5, .6); g.lineTo(.5, .18); g.lineTo(.76, .52); g.lineTo(.5, .52); },
    telefone: g => { g.moveTo(.2, .38); g.quadraticCurveTo(.5, .12, .8, .38); g.lineTo(.72, .46); g.lineTo(.6, .38); g.lineTo(.4, .38); g.lineTo(.28, .46); g.closePath(); g.rect(.3, .52, .4, .3); g.moveTo(.58, .67); g.arc(.5, .67, .08, 0, 7); },
    porta: g => { g.moveTo(.3, .9); g.lineTo(.3, .3); g.quadraticCurveTo(.5, .08, .7, .3); g.lineTo(.7, .9); g.moveTo(.63, .6); g.arc(.6, .6, .03, 0, 7); }
  };
  const LISTA_FORMAS = Object.keys(FORMAS);
  function hash(s) { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }
  function rng(seed) { let s = seed >>> 0 || 7; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
  function glifo(cv, forma, cor, seed, tracejado) {
    const g = cv.getContext('2d'), w = cv.width, h = cv.height, r = rng(seed || 1);
    g.clearRect(0, 0, w, h); g.lineCap = 'round'; g.lineJoin = 'round';
    const passes = tracejado ? 1 : 3;
    for (let p = 0; p < passes; p++) {
      g.save(); g.translate(w * .08 + (r() - .5) * w * .04, h * .08 + (r() - .5) * h * .04); g.scale(w * .84, h * .84); g.beginPath(); (FORMAS[forma] || FORMAS.estrela)(g); g.restore();
      g.strokeStyle = cor; g.globalAlpha = tracejado ? .55 : .35 + r() * .35; g.lineWidth = Math.max(1, w / 20); if (tracejado) g.setLineDash([Math.max(2, w / 18), Math.max(2, w / 14)]); g.stroke(); g.setLineDash([]);
    }
    g.globalAlpha = 1;
  }
  const formaDe = id => LISTA_FORMAS[hash(id) % LISTA_FORMAS.length];
  // as crianças de mãos dadas (Davi, Ana, Tomé), a giz
  function criancas(g, x, y, esc2, cor, quantas = 3) {
    g.save(); g.translate(x, y); g.scale(esc2, esc2); g.strokeStyle = cor; g.lineWidth = 2.2; g.lineCap = 'round';
    for (let i = 0; i < quantas; i++) {
      const cx = i * 30;
      g.beginPath(); g.arc(cx, -38, 7, 0, 7); g.moveTo(cx, -31); g.lineTo(cx, -10); g.moveTo(cx, -10); g.lineTo(cx - 6, 4); g.moveTo(cx, -10); g.lineTo(cx + 6, 4);
      g.moveTo(cx - 13, -22); g.lineTo(cx, -26); g.lineTo(cx + 13, -22); g.stroke();
    }
    g.restore();
  }

  // ------------------------------------------------------------ CATÁLOGO DOS SEGREDOS (só lê o que o jogo já guarda)
  const MAPA_PAG = { estrada: 'estrada', terreo: 'internato', superior: 'internato', tuneis: 'subsolo', cemiterio: 'subsolo' };
  const PAGINAS = [['estrada', 'A Estrada'], ['internato', 'O Internato'], ['subsolo', 'Debaixo da Terra'], ['noites', 'O Que Ninguém Conta']];
  const pagDe = n => n.onde ? (MAPA_PAG[n.onde[0]] || 'internato') : /^e_|^f_rep/.test(n.id) ? 'estrada' : /^(f7|n18|n19)$/.test(n.id) ? 'subsolo' : 'internato';
  function segredos() {
    const L = [];
    for (const n of [...R.notas, ...R.paginas]) if (n.secreta) L.push({ id: n.id, tipo: 'n', nome: n.titulo, pag: pagDe(n), onde: n.onde });
    for (const f of R.fitas) if (f.secreta) L.push({ id: f.id, tipo: 'f', nome: f.titulo, pag: pagDe(f) });
    for (const c of R.conquistas) if (c.secreta || c.segredo) L.push({ id: c.id, tipo: 'c', nome: c.nome, pag: 'noites' });
    return L;
  }
  function achado(s, ac2, cq, S) { if (s.tipo === 'c') return !!cq[s.id]; return !!(ac2[s.id] || (S && (s.tipo === 'n' ? S.notes && S.notes[s.id] : S.fitas && S.fitas[s.id]))); }
  function nestaNoite(S) {
    if (!S) return [];
    const L = segredos(), noite = new Set(S.conqNoite || []);
    return L.filter(s => s.tipo === 'c' ? noite.has(s.id) : s.tipo === 'n' ? S.notes && S.notes[s.id] : S.fitas && S.fitas[s.id]);
  }
  function resumo() { const L = segredos(), a = acervo(), c = conqs(), S = St(); const ach = L.filter(s => achado(s, a, c, S)); return { L, ach, falta: L.filter(s => !ach.includes(s)) }; }

  // ------------------------------------------------------------ BOATOS (dois verdadeiros apontam o que falta; um é mentira)
  const BOATO = {
    linha_cruzada: 'o orelhão da estrada toca pra quem passa devagar',
    nove_horas: 'às nove da noite o jogo não é o mesmo jogo',
    hora_certa: 'tem uma hora certa de abrir o jogo, e o rádio sabe qual é',
    nome_pedra: 'no cemitério tem uma pedra com o nome de quem tá jogando',
    verso: 'a folha das regras tem um lado de trás',
    arrombadora: 'o cofre conta uma história se você errar do jeito certo',
    escuro: 'tem gente lá dentro que só fala com quem apaga a lanterna',
    bombeiro: 'o carrinho azul de verdade não tá onde todo mundo procura',
    desenho: 'tem um presente de aniversário escondido atrás dos livros do diretor',
    nove_cliques: 'o sino do começo responde se você bater nove vezes, sem pressa',
    fita_gasta: 'a fita do começo fica velha se você pedir a fita gasta pelo nome',
    segredo_velorio: 'tem uma palavra de enterro que apaga as cores do jogo',
    segredo_davi: 'se você chamar o irmão pelo nome antes de começar, ele responde',
    segredo_estatua: 'quem fica parada vinte segundos perto dele vira estátua',
    segredo_nove: 'tem um número que faz o sino bater antes de começar',
    segredo_radio: 'o rádio-relógio grava quem mexe nele três vezes',
    segredo_moacir: 'ele escuta o próprio nome até na tela do começo',
    segredo_esperando: 'quem espera muito no começo vê alguém esperando também',
    segredo_foto: 'a foto da pausa mexe se você demorar',
    olhos_gato: 'dá pra passar o primeiro capítulo quase sem lanterna',
    regra_cinco: 'quem ignora três vezes o próprio nome ganha alguma coisa',
    coracao_frio: 'tem gente que passou do lado dele sem ser notada',
    quem_lembra: 'a data do incêndio, escrita no começo, abre uma lembrança',
    senha: 'a palavra que eles mais repetem libera um jeito de jogar com uma vida só',
    fora_do_ar: 'na nona morte da mesma noite a televisão sai do ar',
    nove_e_nove: 'o cronômetro trava numa hora só, se você estiver olhando',
    convite: 'nas opções tem uma que não devia estar lá',
    manual: 'tem um manual escondido numa tecla que ninguém aperta',
    decalque: 'a página depois da última do Davi não tá em branco de verdade',
    acordei: 'tem uma palavra que acorda o internato inteiro',
    sineiro: 'o Davi queria ser uma coisa quando crescesse, e essa palavra toca no começo',
    chamada: 'se você chamar os adultos pelo nome no começo, eles aparecem',
    porta_giz: 'as palavras do começo desenham uma porta no canto da tela',
    disco: 'o rádio-relógio tem um telefone dentro, é só bater cinco vezes',
    n14: 'tem um livro de matrícula com um nome riscado a lápis',
    n15: 'a diretoria guarda cartas que nunca saíram',
    n16: 'a enfermaria tem a ficha da menina que conta',
    n18: 'lá embaixo tem um livro dos inspetores com uma linha em branco',
    n20: 'embaixo de uma cama tem uma mala feita e nunca levada',
    n21: 'na enfermaria tem frascos de remédio pra quem não enxerga',
    n22: 'tem um uniforme de menina que nunca foi usado',
    n23: 'o caderno do posto sabe quem comprou gasolina em 1979',
    n24: 'tem galões na casa de máquinas que não cheiram a óleo'
  };
  const MENTIRAS = [
    'se você pular do telhado do internato, acorda em casa',
    'o Inspetor enxerga quando chove',
    'a Menina abre a porta se você pedir por favor',
    'correndo de costas no cemitério dá pra pular o capítulo',
    'se apagar a lanterna três vezes seguidas, o sino toca sozinho',
    'quem dorme na cama do Davi não morre mais'
  ];
  const CIDADES = ['Taubaté', 'Campos do Jordão', 'Pinda', 'Tremembé', 'São Bento', 'Caçapava', 'Santo Antônio'];
  const CHARADA = {
    nome_pedra: 'Uma pedra velha sabe o seu nome antes de você chegar.',
    verso: 'Toda regra tem um avesso. Esta também.',
    bombeiro: 'O carrinho que todo mundo pega não é o que ele perdeu.',
    desenho: 'Um presente atrás de livros que ninguém lê.',
    escuro: 'Tem uma voz que só fala com quem não enxerga nada.',
    linha_cruzada: 'Um telefone sem fio toca na estrada. Quem atende?',
    segredo_estatua: 'Vinte segundos sem respirar perto de quem escuta.',
    decalque: 'A última página do Davi não é a última.',
    convite: 'Ele bate nove vezes antes de você deixar.',
    manual: 'A ajuda que ninguém pede mora numa tecla que ninguém aperta.',
    fora_do_ar: 'Nove vezes no chão e a programação termina.',
    acordei: 'Seis letras acordam nove camas.',
    n20: 'Nove camas arrumadas. Embaixo de uma tem uma viagem que não aconteceu.',
    n22: 'Um uniforme com o seu nome, que nunca foi usado.'
  };
  function boatos(n, verdade = 2) {
    const f = resumo().falta.filter(s => BOATO[s.id]);
    const v = f.sort(() => Math.random() - .5).slice(0, verdade).map(s => ({ t: BOATO[s.id], id: s.id }));
    const out = v.slice(); if (n > v.length) out.push({ t: pick(MENTIRAS), id: null });
    return out.sort(() => Math.random() - .5);
  }

  // ------------------------------------------------------------ CSS
  const css = document.createElement('style'); css.id = 'sg4-css';
  css.textContent = `
  #legsom div.segredo{color:#e3c76e;text-decoration:underline dotted rgba(227,199,110,.6)}
  .sg-voa{position:fixed;left:50%;top:46%;width:72px;height:72px;margin:-36px 0 0 -36px;z-index:40;pointer-events:none;background:#d9ccae;border:2px solid #fff6dc;border-radius:6px;box-shadow:0 6px 24px #000;transition:transform .9s cubic-bezier(.5,-.3,.6,1),opacity .9s;transform:rotate(-8deg) scale(1.3)}
  .sg-voa canvas{width:100%;height:100%}
  .sg-voa.vai{transform:translate(calc(50vw - 70px),calc(-46vh + 40px)) rotate(14deg) scale(.35);opacity:.2}
  #sg-selo{position:fixed;right:26px;top:22px;width:46px;height:46px;z-index:39;pointer-events:none;opacity:0}
  #sg-selo.on{animation:sgSelo 2.6s ease-out}
  #sg-selo path{stroke:#e9e2cf;stroke-width:3;fill:none;stroke-linecap:round;stroke-dasharray:160;stroke-dashoffset:160}
  #sg-selo.on path{animation:sgRisca .6s ease-out forwards}
  @keyframes sgSelo{0%{opacity:0}8%,70%{opacity:.9}100%{opacity:0}}
  @keyframes sgRisca{to{stroke-dashoffset:0}}
  #sg-brilho{position:fixed;inset:0;z-index:38;pointer-events:none;box-shadow:inset 0 0 90px rgba(227,199,110,.45);opacity:0}
  #sg-brilho.on{animation:sgBrilho 1.6s ease-out}
  @keyframes sgBrilho{0%{opacity:0}15%{opacity:1}100%{opacity:0}}
  .sg-album p.sg-cab,.sg-ultima p.sg-cab{color:var(--fraco);font-family:"Special Elite";font-size:14px;margin:4px 0 10px}
  .sg-pag{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:10px;padding:12px;background:repeating-linear-gradient(0deg,#1b1812 0 22px,#1e1a14 22px 23px);border:1px solid #2c2720;border-radius:3px;margin-bottom:8px}
  .sg-fig{margin:0;text-align:center;font-family:"Special Elite";font-size:11px;line-height:1.25;color:var(--fraco)}
  .sg-fig canvas{width:62px;height:62px;display:block;margin:0 auto 4px;border-radius:4px}
  .sg-fig.ok canvas{background:#2b2620;box-shadow:0 2px 0 #0008,inset 0 0 0 2px #e9dfc855}
  .sg-fig.ok figcaption{color:var(--ui)}
  .sg-fig.x canvas{background:transparent;outline:1px dashed #3a3328;outline-offset:-2px}
  .sg-fig.x figcaption{font-size:18px;color:#3d3529}
  .sg-brilhante{display:flex;align-items:center;gap:14px;margin:0 0 18px;color:#e3c76e;font-family:"Special Elite";font-size:14px}
  .sg-brilhante canvas{width:96px;height:96px;border-radius:6px;box-shadow:0 0 18px rgba(227,199,110,.35)}
  .sg-boatos-d div{font-family:"Special Elite";font-size:14px;color:#cfc3a6;padding:6px 10px;margin:6px 0;background:#d9ccae14;border-left:2px solid #8e1b14;transform:rotate(-.4deg)}
  .sg-davi{font-family:"IM Fell English",Georgia,serif;font-style:italic;color:#aebde0;font-size:20px;line-height:1.45;transform:rotate(-.6deg);text-shadow:0 0 1px #aebde099}
  .sg-ultima .sg-linhas div{margin:2px 0}
  .sg-ultima .sg-voce{font-family:"Special Elite";color:var(--fraco);font-size:15px;margin-top:10px}
  .sg-ultima .sg-pre{opacity:.85;border-bottom:1px dashed #2c2720;padding-bottom:8px;margin-bottom:8px}
  .sg-ultima input{font-family:"IM Fell English",Georgia,serif;font-style:italic;font-size:20px;background:transparent;border:0;border-bottom:1px solid #3a3328;color:#e9dfc8;width:min(420px,70vw);outline:none;padding:2px 4px}
  .sg-ultima input:focus{border-bottom-color:#8e1b14}
  .sg-ultima label{display:block;margin:14px 0 6px;font-family:"Special Elite";font-size:14px;color:var(--fraco)}
  .sg-rabisco svg{width:150px;height:28px;display:block}
  .sg-rabisco path{stroke:#aebde0;stroke-width:2;fill:none;stroke-dasharray:400;stroke-dashoffset:400;animation:sgRisca 1.2s ease-out forwards}
  #sg-dec{width:min(560px,100%);height:auto;display:block;touch-action:none;cursor:crosshair;border-radius:2px;box-shadow:0 4px 18px #000}
  .sg-final-desenho{display:block;width:220px;height:110px;margin:10px 0}
  .sg-margem{position:absolute;left:4px;top:70px;bottom:60px;width:38px;writing-mode:vertical-rl;transform:rotate(180deg);font-family:"IM Fell English",Georgia,serif;font-style:italic;font-size:15px;color:#a8f0b0;text-shadow:0 0 6px #4fe06a,0 0 14px #1f8a34;opacity:0;transition:opacity 1.6s;pointer-events:none;text-align:center}
  .sg-margem.on{opacity:.85}
  #diario.sg-escuro .wrap{filter:brightness(.55)}
  #diario.sg-escuro .sg-margem{filter:brightness(1.8)}
  .sg-fuligem{display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 10px 4px}
  .sg-digital{width:20px;height:24px;cursor:help;opacity:.75}
  .sg-digital:hover,.sg-digital:focus{opacity:1;outline:none}
  .sg-digital svg{width:100%;height:100%}
  .sg-dica-fuligem{font-family:"Special Elite";font-size:13px;color:#857a63;margin:-6px 0 10px 6px;min-height:1em}
  .sg-tremida{font-family:"IM Fell English",Georgia,serif;font-style:italic;color:#c9bfae;margin-top:18px;font-size:17px}
  .sg-tremida div{display:inline-block;animation:sgTreme .18s steps(2) infinite;margin-right:18px}
  body.menos-mov .sg-tremida div{animation:none}
  @keyframes sgTreme{0%{transform:translate(0,0) rotate(-.6deg)}50%{transform:translate(.6px,-.4px) rotate(.4deg)}}
  .sg-x{display:none}
  #sg-riscos{position:absolute;left:22px;bottom:64px;max-width:44vw;display:flex;flex-wrap:wrap;gap:4px 10px;z-index:2}
  #sg-riscos svg{width:34px;height:30px;cursor:default}
  #sg-riscos svg path{stroke:rgba(235,228,210,.55);stroke-width:2.2;fill:none;stroke-linecap:round}
  #sg-riscos svg:hover path{stroke:#fff8e6}
  #sg-riscos .tudo{width:150px;height:62px}
  #sg-riscos-nomes{position:absolute;left:22px;bottom:38px;font-family:"Special Elite";font-size:12px;color:#c9bfa4;max-width:60vw;text-shadow:0 0 6px #000;z-index:2;min-height:1em}
  #sg-porta{position:absolute;right:24px;bottom:58px;width:70px;height:96px;z-index:2}
  #sg-porta canvas{position:absolute;width:14px;height:14px;margin:-7px 0 0 -7px}
  #sg-porta.completa{cursor:pointer;filter:drop-shadow(0 0 6px rgba(227,199,110,.7))}
  #sg-porta.completa::after{content:"";position:absolute;left:18px;right:18px;top:20px;bottom:6px;border:1px solid rgba(227,199,110,.25);border-radius:20px 20px 0 0}
  #sg-oculto{position:absolute;right:5vw;top:44%;max-width:240px;font-family:"Special Elite";font-size:13px;color:#000;user-select:text;-webkit-user-select:text;cursor:text;text-align:right;z-index:2}
  #sg-oculto::selection{background:#8e1b14;color:#fff3dc}
  #sg-boato{position:absolute;top:58px;left:20px;max-width:min(380px,70vw);font-family:"Special Elite";font-size:12px;color:#b98a6a;text-shadow:0 0 6px #000;opacity:0;transition:opacity 1.2s;z-index:2}
  #sg-boato.on{opacity:.9}
  #sg-disco{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.86);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
  #sg-disco canvas{width:min(340px,80vw);height:auto;touch-action:none;cursor:pointer}
  #sg-disco .num{font-family:"Courier New",monospace;font-size:26px;letter-spacing:.2em;color:#e9dfc8;min-height:32px}
  #sg-disco small{font-family:"Special Elite";color:var(--fraco);font-size:13px;text-align:center;padding:0 16px}
  .sg-cena{position:fixed;inset:0;z-index:58;background:#000;display:flex;align-items:center;justify-content:center}
  .sg-cena canvas{width:100%;height:100%}
  .sg-cena .txt{position:absolute;left:0;right:0;bottom:12%;text-align:center;font-family:"Special Elite";font-size:20px;color:#e9dfc8;padding:0 20px;white-space:pre-line}
  #sg-rec{position:absolute;top:18px;right:22px;font-family:"Courier New",monospace;font-size:16px;color:#e23b2b;z-index:3;letter-spacing:.1em}
  #sg-rec::first-letter{animation:pisca 1s steps(1) infinite}
  #sg-vela{position:absolute;left:50%;top:22%;width:10px;height:44px;margin-left:min(-38vw,-330px);background:linear-gradient(#e9dfc8,#b8a988);border-radius:2px;z-index:2}
  #sg-vela::before{content:"";position:absolute;left:-3px;top:-20px;width:16px;height:22px;border-radius:50% 50% 45% 45%;background:radial-gradient(circle at 50% 70%,#fff6c8,#f2a93b 45%,rgba(200,60,20,0) 70%);animation:sgChama .25s infinite alternate;filter:blur(.4px)}
  #sg-vela::after{content:"";position:absolute;left:-60px;top:-80px;width:130px;height:130px;border-radius:50%;background:radial-gradient(rgba(242,169,59,.22),transparent 70%);pointer-events:none}
  @keyframes sgChama{to{transform:scaleY(1.1) translateX(.6px)}}
  #title .menu .btn.sg-some{visibility:hidden}
  #sg-lian{font-family:"Special Elite";font-size:13px;color:#857a63;margin:-4px 0 10px;letter-spacing:.06em}
  #sg-barras{position:fixed;inset:0;z-index:70;background:linear-gradient(90deg,#c0c0c0 0 14.28%,#c0c000 0 28.56%,#00c0c0 0 42.84%,#00c000 0 57.12%,#c000c0 0 71.4%,#c00000 0 85.68%,#0000c0 0);display:flex;align-items:center;justify-content:center}
  #sg-barras::after{content:"";position:absolute;left:0;right:0;bottom:0;height:22%;background:linear-gradient(90deg,#0000c0 0 14.28%,#111 0 28.56%,#c000c0 0 42.84%,#111 0 57.12%,#00c0c0 0 71.4%,#111 0 85.68%,#c0c0c0 0)}
  #sg-barras div{position:relative;z-index:1;background:#000;color:#fff;font-family:"Courier New",monospace;font-size:clamp(16px,2.6vw,28px);padding:14px 24px;text-align:center;letter-spacing:.06em}
  #sg-barras b{font-weight:normal}
  #sg-barras b.pisca{color:#ff2a1a;animation:pisca .4s steps(1) infinite}
  body.sem-flash #sg-barras b.pisca{animation:none}
  #sg-escurece{position:fixed;inset:0;z-index:30;background:#000;opacity:0;pointer-events:none}
  #sg-ainda{font-family:"IM Fell English",Georgia,serif;font-style:italic;color:#c9bfae;font-size:18px;margin:6px auto;max-width:640px}
  #sg-ainda small{display:block;font-family:"Special Elite";font-size:13px;color:#aebde0;margin-top:4px;transform:rotate(-.6deg)}
  #sg-ombro{position:fixed;right:-30px;bottom:0;width:min(34vw,320px);height:80vh;z-index:35;pointer-events:none;opacity:0}
  #sg-ombro.on{opacity:.92}
  #sg-tv{position:fixed;inset:0;z-index:80;background:#000;pointer-events:none;display:flex;align-items:center;justify-content:center}
  #sg-tv i{display:block;width:100%;height:100%;background:#dcdcdc;animation:sgTv .55s ease-in forwards}
  @keyframes sgTv{0%{transform:scale(1,1);opacity:.9}45%{transform:scale(1,.004);opacity:1}80%{transform:scale(.003,.004);opacity:1}100%{transform:scale(0,0);opacity:0}}
  #sg-manual{position:fixed;inset:0;z-index:65;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center}
  #sg-manual .paper{transform:rotate(.6deg);max-width:min(620px,92vw)}
  #sg-manual ol{margin:10px 0 0 22px;font-size:16px;line-height:1.55}
  #sg-manual li.v{font-weight:bold}
  .sg-final{max-width:700px;margin:10px auto 24px;text-align:center}
  .sg-final canvas{display:block;margin:6px auto;width:min(440px,90vw);height:auto}
  .sg-final .lian{font-family:"Special Elite";color:#857a63;font-size:14px}
  .sg-final .tambem{font-style:italic;color:#cfc3a6;font-size:16px;margin-top:10px}
  .sg-final .bilhete{display:inline-block;text-align:left;background:#d9ccae;color:#2a2119;font-family:"Special Elite";font-size:15px;padding:14px 18px;margin-top:14px;transform:rotate(-1.2deg);box-shadow:0 8px 24px #000;max-width:min(560px,90vw)}
  .sg-final .bilhete h4{font-family:"IM Fell English SC",Georgia,serif;font-weight:normal;font-size:17px;margin-bottom:6px}
  .sg-final .bilhete div{margin:4px 0}
  .sg-final .charada{font-family:"IM Fell English",Georgia,serif;font-style:italic;color:#e3c76e;font-size:19px;margin-top:16px;user-select:text;-webkit-user-select:text}
  #pause .sg-p{color:#e3c76e;font-family:"Special Elite";font-size:13px}
  .sg-soma{display:block;color:#e3c76e;font-family:"Special Elite";font-size:13px;margin-top:6px}
  #split.ouro{color:#e3c76e;text-shadow:0 0 10px rgba(227,199,110,.6)}
  #cron b.sg-99{color:#e23b2b;display:inline-block;animation:sgTreme .08s steps(2) infinite}
  .sg-convite span{color:#6d6452;font-style:italic}
  #sg-preto{position:fixed;inset:0;z-index:66;background:#000;opacity:0;transition:opacity .8s;pointer-events:none}
  #sg-preto.on{opacity:1;pointer-events:auto}
  @media (max-width:700px){#sg-riscos{left:12px;bottom:84px;max-width:60vw}#sg-riscos svg{width:24px;height:22px}#sg-porta{right:10px;bottom:84px;transform:scale(.8)}#sg-oculto{top:auto;bottom:30%}#sg-vela{display:none}}
  `;
  document.head.appendChild(css);
  const nova = (tag, id, pai, cls) => { let el = id && document.getElementById(id); if (el) return el; el = document.createElement(tag); if (id) el.id = id; if (cls) el.className = cls; (pai || document.body).appendChild(el); return el; };

  // ------------------------------------------------------------ LEGENDA DE SEGREDO (categoria nova "s", com símbolo ✶)
  U.som.def.segredo = { t: 'algo escondido foi encontrado', imp: 1, cd: 1.5, cat: 's' };
  U.som.def.faro = { t: 'algo escondido por perto', imp: 1, cd: 6, cat: 's' };

  // ------------------------------------------------------------ CELEBRAR UM SEGREDO NOVO (som + legenda + vibração + luz)
  const selo = nova('div', 'sg-selo'); selo.innerHTML = '<svg viewBox="0 0 46 46"><path d="M23 3 L28 18 L44 18 L31 27 L36 43 L23 33 L10 43 L15 27 L2 18 L18 18 Z"/></svg>';
  const brilho = nova('div', 'sg-brilho');
  let vistos = null, checarT = 0;
  function celebrar(s) {
    SOM.figurinha(); setTimeout(() => SOM.giz(), 520);
    vibrar(.35, .6, 110);
    try { U.som('segredo', []); } catch (e) {}
    if (s.tipo !== 'c' && C.mode === 'jogo') frase('achou', 'você não devia ter achado isso.');
    if (OPT.hudMin && C.mode === 'jogo') return; // HUD mínimo: só o som (e a legenda, se ligada)
    brilho.classList.remove('on'); void brilho.offsetWidth; brilho.classList.add('on');
    const v = document.createElement('div'); v.className = 'sg-voa'; const cv = document.createElement('canvas'); cv.width = cv.height = 72; v.appendChild(cv); document.body.appendChild(v);
    glifo(cv, formaDe(s.id), '#2a2119', hash(s.id));
    setTimeout(() => v.classList.add('vai'), 380);
    setTimeout(() => { v.remove(); selo.classList.remove('on'); void selo.offsetWidth; selo.classList.add('on'); }, 1300);
  }
  function checarNovos() {
    const { ach } = resumo(), ids = new Set(ach.map(s => s.id));
    if (!vistos) { vistos = ids; return; }
    for (const s of ach) if (!vistos.has(s.id)) { vistos.add(s.id); celebrar(s); break; }
  }

  // ------------------------------------------------------------ FRASES QUE A LIA NÃO LEMBRA DE TER ESCRITO (no máximo 4 por noite)
  function frase(k, txt) {
    const S = St(); if (!S || !S.flags) return;
    const L = S.flags.sg4_frases = S.flags.sg4_frases || [];
    if (L.length >= 4 || L.some(x => x.k === k)) return;
    L.push({ k, t: txt });
  }

  // ------------------------------------------------------------ DIÁRIO: margem no escuro, fuligem, rabisco, frases, contador
  const MARGEM = [
    'o orelhão da estrada atende quem espera',
    'a matrícula tem um nome riscado a lápis',
    'o remédio dele mora na enfermaria',
    'tem um uniforme que nunca foi usado',
    'o livro deles tem uma linha em branco',
    'tem uma pedra esperando por você'
  ];
  const MAPA_CAP = ['estrada', 'terreo', 'terreo', 'superior', 'tuneis', 'cemiterio'];
  const SALA_NOME = { aula: 'sala de aula', diret: 'diretoria', enferm: 'enfermaria', biblio: 'biblioteca', secreta: 'sala do diretor', celeste: 'quarto da irmã', roup: 'rouparia', posto: 'posto', maq: 'casa de máquinas', despensa: 'despensa', cozinha: 'cozinha', hall: 'recepção', dormE: 'dormitório E', brinq: 'brinquedos', capela: 'capela' };
  const TIPO_DICA = { mesa: 'em cima, madeira', chao: 'no chão, embaixo', prateleira: 'no alto, poeira', parede: 'pregado, na parede' };
  const dicaFuligem = s => s.onde ? `${TIPO_DICA[s.onde[2]] || 'escondido'} · ${SALA_NOME[s.onde[1]] || 'outra sala'}` : 'perto da estrada, papel';
  const digitalSvg = seed => { const r = rng(seed); let p = ''; for (let i = 0; i < 5; i++) { const rx = 3 + i * 1.6, ry = 4 + i * 1.9; p += `<ellipse cx="${10 + (r() - .5)}" cy="${12 + (r() - .5)}" rx="${rx}" ry="${ry}" stroke="#2d2a26" stroke-width="1" fill="none" stroke-dasharray="${2 + r() * 3} ${1 + r() * 2}"/>`; } return `<svg viewBox="0 0 20 24"><ellipse cx="10" cy="12" rx="9" ry="11" fill="#1b1916"/>${p}</svg>`; };
  function abaAtiva() { const b = document.querySelector('#diario nav .btn.on'); return b ? b.dataset.tab : ''; }
  function extrasAba(pane) {
    const S = St(); if (!S) return;
    const tab = abaAtiva(), marca = '<span class="sg-x"></span>';
    if (tab === 'obj') {
      const hs = [...pane.querySelectorAll(':scope > h3')];
      const L = segredos().filter(s => s.tipo === 'n');
      R.capitulos.forEach((c, i) => {
        if (i >= S.chapter || MAPA_CAP[i] === MAPA_CAP[i + 1]) return; // só depois de terminar o mapa
        const h = hs.find(x => x.textContent === c.titulo); if (!h) return;
        const mapa = MAPA_CAP[i];
        const faltam = L.filter(s => (s.onde ? s.onde[0] === mapa : (mapa === 'estrada' && /^e_/.test(s.id))) && !(S.notes && S.notes[s.id]));
        if (!faltam.length) return;
        const ul = h.nextElementSibling && h.nextElementSibling.tagName === 'UL' ? h.nextElementSibling : h;
        const box = document.createElement('div'); box.className = 'sg-fuligem'; box.setAttribute('aria-label', `${faltam.length} segredo${faltam.length > 1 ? 's' : ''} deste lugar ficaram para trás`);
        box.innerHTML = faltam.map(s => `<span class="sg-digital" tabindex="0" title="${esc(dicaFuligem(s))}" data-d="${esc(dicaFuligem(s))}">${digitalSvg(hash(s.id))}</span>`).join('');
        const dica = document.createElement('div'); dica.className = 'sg-dica-fuligem';
        box.querySelectorAll('.sg-digital').forEach(d => { const mostra = () => { dica.textContent = d.dataset.d; }; d.onmouseenter = mostra; d.onfocus = mostra; d.onclick = mostra; });
        ul.insertAdjacentElement('afterend', box); box.insertAdjacentElement('afterend', dica);
      });
      const fr = (S.flags.sg4_frases || []);
      if (fr.length) pane.insertAdjacentHTML('beforeend', `<div class="sg-tremida">${fr.map(f => `<div>${esc(f.t)}</div>`).join('')}</div>`);
    } else if (tab === 'notas') {
      const L = segredos().filter(s => s.tipo !== 'c'), a = acervo();
      const noite = L.filter(s => achado(s, {}, {}, S)).length, sempre = L.filter(s => achado(s, a, {}, S)).length;
      pane.insertAdjacentHTML('afterbegin', `<p class="sg-cab" style="color:#e3c76e;font-family:'Special Elite';font-size:14px">✶ papéis e fitas secretos: ${noite} nesta noite · ${sempre} de ${L.length} em todas as noites</p>`);
    } else if (tab === 'mapa' && (S.flags._noite || 0) >= 3) rabiscoMapa(pane);
    pane.insertAdjacentHTML('beforeend', marca);
  }
  const RABISCO_TXT = ['eu deixava as coisas aqui', 'olha embaixo, Lia', 'não conta pra ninguém', 'aqui ninguém procurava', 'eu escondi uma coisa', 'era o meu lugar'];
  function rabiscoMapa(pane) {
    const S = St(), W = C.W, svg = pane.querySelector('svg'); if (!svg || !W || !W.salas.length) return;
    const L = segredos().filter(s => s.tipo === 'n' && !(S.notes && S.notes[s.id]));
    let alvo = null;
    for (const s of L) { const it = W.items.find(i => i.key === `${W.mapa}:nota_${s.id}` && i.mesh.visible); if (it) { alvo = { s, it }; break; } }
    if (!alvo) return;
    const salas = W.salas, minX = Math.min(...salas.map(r => r.x0)), maxX = Math.max(...salas.map(r => r.x1)), minZ = Math.min(...salas.map(r => r.z0)), maxZ = Math.max(...salas.map(r => r.z1));
    const k = Math.min(900 / (maxX - minX), 560 / (maxZ - minZ)), x = (alvo.it.mesh.position.x - minX) * k + 10, z = (maxZ - alvo.it.mesh.position.z) * k + 10;
    const f = ['olho', 'vela', 'barco', 'pipa', 'lua', 'estrela'][S.chapter % 6];
    const p = { olho: 'M-9 0Q0 -8 9 0Q0 8 -9 0M3 0A3 3 0 1 1 -3 0A3 3 0 1 1 3 0', vela: 'M-3 -2L-3 10L3 10L3 -2ZM0 -10Q4 -5 0 -3Q-4 -5 0 -10', barco: 'M-10 2L10 2L6 8L-6 8ZM0 2L0 -10L7 0L0 0', pipa: 'M0 -10L7 -2L0 7L-7 -2ZM0 7Q-3 11 2 14', lua: 'M3 -9A9 9 0 1 0 3 9A7 7 0 1 1 3 -9', estrela: 'M0 -9L3 -2L9 -2L4 2L6 9L0 5L-6 9L-4 2L-9 -2L-3 -2Z' }[f];
    svg.insertAdjacentHTML('beforeend', `<g transform="translate(${x.toFixed(1)} ${z.toFixed(1)}) rotate(${(hash(alvo.s.id) % 30) - 15})" style="cursor:help"><title>${esc(RABISCO_TXT[hash(alvo.s.id) % RABISCO_TXT.length])} — D.</title><circle r="13" fill="transparent"/><path d="${p}" stroke="#aebde0" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`);
  }
  const pane = $('#d-pane');
  if (pane) new MutationObserver(() => { if (pane.querySelector('.sg-x') || $('#diario').hidden) return; try { extrasAba(pane); } catch (e) { console.warn('[segredos] diário', e); } }).observe(pane, { childList: true });
  function diario() {
    const S = St(), d = $('#diario'); if (!S || !d) return;
    const wrap = d.querySelector('.wrap'), m = nova('div', 'sg-margem', wrap, 'sg-margem');
    const escuro = !!(S.inv && S.inv.lanterna && !S.flashOn);
    d.classList.toggle('sg-escuro', escuro); m.classList.remove('on');
    if (escuro) { m.textContent = MARGEM[S.chapter] || MARGEM[0]; setTimeout(() => { if (!d.hidden) m.classList.add('on'); }, 600); }
  }

  // ------------------------------------------------------------ ABA ÁLBUM (figurinhas dos segredos)
  function renderAlbum(el) {
    const { L, ach } = resumo(), tem = new Set(ach.map(s => s.id)), noite = new Set(nestaNoite(St()).map(s => s.id));
    let h = `<div class="sg-album"><p class="sg-cab">figurinhas coladas: ${ach.length} de ${L.length} · as que faltam ficam em branco, sem dica</p>`;
    let n = 0;
    for (const [pg, tit] of PAGINAS) {
      const its = L.filter(s => s.pag === pg); if (!its.length) continue;
      const ok = its.filter(s => tem.has(s.id)).length, completa = ok === its.length;
      h += `<h3>Página — ${tit} <small style="font-family:'Special Elite';font-size:12px">${ok}/${its.length}</small></h3>`;
      if (completa) h += `<div class="sg-brilhante"><canvas width="96" height="96" data-brilho="1"></canvas><span>Página completa. A figurinha brilhante: as três crianças, juntas.</span></div>`;
      h += '<div class="sg-pag">' + its.map(s => { n++; const t = tem.has(s.id); return `<figure class="sg-fig ${t ? 'ok' : 'x'}"><canvas width="62" height="62" data-id="${esc(s.id)}" data-ok="${t ? 1 : 0}" data-n="${n}"></canvas><figcaption>${t ? esc(s.nome) + (noite.has(s.id) ? ' ✶' : '') : n}</figcaption></figure>`; }).join('') + '</div>';
    }
    const bt = mem.boatos || [];
    h += `<h3>Boatos da escola da cidade</h3>` + (bt.length ? `<div class="sg-boatos-d">${bt.slice(-9).reverse().map(b => `<div>dizem que ${esc(b)}</div>`).join('')}</div>` : '<p class="sg-cab">Ninguém te contou nada ainda. Termine uma noite.</p>');
    el.innerHTML = h + '</div>';
    el.querySelectorAll('canvas[data-id]').forEach(cv => {
      const ok = cv.dataset.ok === '1';
      if (ok) glifo(cv, formaDe(cv.dataset.id), '#efe6cf', hash(cv.dataset.id));
      else { const g = cv.getContext('2d'); g.strokeStyle = '#3d3529'; g.setLineDash([3, 3]); g.strokeRect(6, 6, 50, 50); g.setLineDash([]); }
    });
    el.querySelectorAll('canvas[data-brilho]').forEach(cv => { const g = cv.getContext('2d'), gr = g.createLinearGradient(0, 0, 96, 96); gr.addColorStop(0, '#6d5a2a'); gr.addColorStop(.45, '#f3dc8a'); gr.addColorStop(.55, '#fff8d8'); gr.addColorStop(1, '#7a6230'); g.fillStyle = gr; g.fillRect(0, 0, 96, 96); criancas(g, 18, 78, .95, '#3a2a12'); });
  }

  // ------------------------------------------------------------ ABA ÚLTIMA PÁGINA (escreve e ele responde; decalque)
  const PRE = ['você veio. eu sabia que vinha.', 'apaga a luz quando ele passar. ele não vê, mas sente o calor.', 'nove. conta comigo, baixinho.', 'não olha pro lado dela. olha pra ela.', 'a água conta os seus passos. anda devagar.', 'toca. eu tô do teu lado.'];
  const LINHA = ['achou {t}. eu escondi melhor que isso.', '{t}. eu vi você pegando.', 'ninguém achava {t}. só você.', '{t} era pra ser segredo. tudo bem. é você.', 'você leu {t}. agora a gente sabe a mesma coisa.', '{t}. eu ri quando você achou.'];
  const RESP = {
    oi: ['oi, Lia.', 'oi. fala baixo.', 'oi. não para de andar.', 'oi. ela tá contando.', 'oi. tô mais perto.', 'oi. finalmente.'],
    ola: ['oi, Lia.'],
    onde: ['Mais pra frente. No fim da estrada.', 'Dentro. Sempre estive aqui dentro.', 'Dentro. Atrás do quadro de chaves não.', 'Em cima não. Embaixo.', 'Embaixo. Bem embaixo.', 'Do teu lado.'],
    desculpa: ['não foi culpa sua. eu que pedi pra vir no seu lugar.'],
    ana: ['ela conta porque tem medo de parar.', 'ela conta porque tem medo de parar.', 'ela conta porque tem medo de parar.', 'não escreve o nome dela agora. ela tá ouvindo.'],
    moacir: ['não escreve o nome dele. ele escuta até papel.'],
    inspetor: ['ele também foi criança aqui. ninguém lembra disso.'],
    sino: ['nove vezes. nem uma a mais.', 'nove vezes. nem uma a mais.', 'nove vezes. nem uma a mais.', 'nove vezes. nem uma a mais.', 'nove vezes. nem uma a mais.', 'agora. toca agora.'],
    '1979': ['quinze de março. eu ia fazer aniversário com você.'],
    davi: ['tô aqui.', 'tô aqui.', 'tô aqui.', 'tô aqui. mais embaixo.', 'tô aqui. bem embaixo.', 'tô aqui. do teu lado.'],
    lia: ['é você. eu conheço a sua letra.'],
    lili: ['só eu te chamava assim. ainda chamo.'],
    tome: ['o Tomé ainda tá escondido. ele ganha sempre.'],
    celeste: ['ela rezava baixinho pra gente dormir.'],
    albano: ['ele gravava tudo. até o que não devia.'],
    socorro: ['eu também pedi. ninguém veio. você veio.'],
    mae: ['fala pra ela que eu não chorei.'],
    sineiro: ['era o que eu queria ser quando crescesse.'],
    carrinho: ['o azul. traz o azul.'],
    medo: ['eu também. anda mesmo assim.'],
    tchau: ['não fala isso aqui.']
  };
  function respostaPara(txt) {
    const S = St(), cap = S ? S.chapter : 0, k = norm(txt), nome = norm(nomeJog());
    if (!k) return null;
    if (nome && k === nome) return `${nomeJog()}. bonito. eu vou lembrar.`;
    const r = RESP[k] || (k.length > 3 && Object.keys(RESP).find(x => x.length > 3 && k.includes(x)) && RESP[Object.keys(RESP).find(x => x.length > 3 && k.includes(x))]);
    if (!r) return null;
    return r[Math.min(cap, r.length - 1)];
  }
  let conversa = [], escrevendo = null;
  function rabiscar(box) {
    const r = rng(Date.now()); let d = 'M4 14'; for (let i = 0; i < 14; i++) d += ` Q${8 + i * 10} ${r() * 26} ${12 + i * 10} ${6 + r() * 16}`;
    const div = document.createElement('div'); div.className = 'sg-rabisco'; div.innerHTML = `<svg viewBox="0 0 150 28"><path d="${d}"/></svg>`; box.appendChild(div);
    for (let i = 0; i < 6; i++) setTimeout(() => SOM.grafite(), i * 160);
  }
  function escreverDavi(box, txt, cb) {
    const div = document.createElement('div'); div.className = 'sg-davi'; box.appendChild(div);
    let i = 0; clearInterval(escrevendo);
    escrevendo = setInterval(() => { i++; div.textContent = txt.slice(0, i); if (i % 2) SOM.escrita(); if (i >= txt.length) { clearInterval(escrevendo); escrevendo = null; cb && cb(); } }, menosMov() ? 20 : 85);
  }
  function renderUltima(el) {
    const S = St(); if (!S) return;
    if (!S.flags.sg4_pre) { S.flags.sg4_pre = 1; S.flags.sg4_preTxt = PRE[S.chapter] || PRE[0]; }
    const L = segredos(), noite = nestaNoite(S), a = acervo();
    const papeis = L.filter(s => s.tipo !== 'c'), todos = papeis.length && papeis.every(s => achado(s, a, {}, S));
    const linhas = noite.map(s => LINHA[hash(s.id) % LINHA.length].replace('{t}', s.tipo === 'c' ? s.nome.toLowerCase() : `“${s.nome}”`));
    let h = `<div class="sg-ultima"><p class="sg-cab">a última página do caderno. depois dela, mais nada. ${linhas.length ? `linhas na letra dele: ${linhas.length}` : ''}</p>`;
    if (S.flags.sg4_preTxt) h += `<div class="sg-davi sg-pre">${esc(S.flags.sg4_preTxt)}</div>`;
    if (linhas.length) h += `<div class="sg-linhas sg-davi">${linhas.map(l => `<div>${esc(l)}</div>`).join('')}</div>`;
    if (todos) h += `<canvas class="sg-final-desenho" width="220" height="110" data-dois="1"></canvas>`;
    h += `<div id="sg-conv"></div><label>escreva aqui (ENTER), se quiser <input id="sg-in" maxlength="24" autocomplete="off" spellcheck="false" aria-label="Escrever na última página"></label>`;
    h += `<h3>A página de trás</h3><p class="sg-cab">ficou marcada pela caneta da página arrancada. passe o lápis devagar (mouse ou dedo).</p><canvas id="sg-dec" width="560" height="150" aria-label="Página marcada: passe o lápis para ler"></canvas></div>`;
    el.innerHTML = h;
    const conv = el.querySelector('#sg-conv');
    for (const c of conversa) { const v = document.createElement('div'); v.className = 'sg-voce'; v.textContent = c.v; conv.appendChild(v); if (c.d) { const d = document.createElement('div'); d.className = 'sg-davi'; d.textContent = c.d; conv.appendChild(d); } else rabiscar(conv); }
    const dois = el.querySelector('canvas[data-dois]');
    if (dois) { const g = dois.getContext('2d'); criancas(g, 70, 96, 1, '#aebde0', 2); g.fillStyle = '#aebde0'; g.font = 'italic 14px Georgia'; g.fillText('eu e a Lia', 120, 40); g.beginPath(); g.moveTo(150, 60); g.quadraticCurveTo(160, 48, 172, 60); g.lineTo(172, 76); g.lineTo(150, 76); g.closePath(); g.strokeStyle = '#aebde0'; g.stroke(); }
    const inp = el.querySelector('#sg-in');
    inp.addEventListener('keydown', e => {
      if (e.code === 'Tab' || e.code === 'Escape') { inp.blur(); return; }
      e.stopPropagation();
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        const v = inp.value.trim(); if (!v || escrevendo) return; inp.value = '';
        const vv = document.createElement('div'); vv.className = 'sg-voce'; vv.textContent = v; conv.appendChild(vv);
        const r = respostaPara(v); conversa.push({ v, d: r }); if (conversa.length > 8) conversa.shift();
        setTimeout(() => { if (!document.body.contains(conv)) return; if (r) escreverDavi(conv, r); else rabiscar(conv); }, 900);
      }
    });
    inp.addEventListener('keyup', e => { if (e.code !== 'Tab' && e.code !== 'Escape') e.stopPropagation(); });
    decalque(el.querySelector('#sg-dec'));
  }
  const DECALQUE = ['LIA — SE VOCÊ LER ISSO, EU AINDA TÔ AQUI.', 'NÃO TOCA O SINO SOZINHA. EU CONTO ATÉ NOVE COM VOCÊ.', 'E DESCULPA POR TER VINDO NO SEU LUGAR. — D.'];
  function decalque(cv) {
    if (!cv) return;
    const g = cv.getContext('2d'), w = cv.width, h = cv.height;
    g.fillStyle = '#cfc6b0'; g.fillRect(0, 0, w, h);
    const r = rng(77); g.strokeStyle = 'rgba(120,150,190,.25)'; for (let y = 28; y < h; y += 26) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(90,80,60,${r() * .06})`; g.fillRect(r() * w, r() * h, 2, 2); }
    const mask = document.createElement('canvas'); mask.width = w; mask.height = h; const mg = mask.getContext('2d');
    mg.fillStyle = '#fff'; mg.font = 'italic 21px Georgia'; DECALQUE.forEach((l, i) => mg.fillText(l, 18 + (i % 2) * 6, 38 + i * 40));
    const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h; const tg = tmp.getContext('2d');
    let ult = null, esfregou = 0, somT = 0, feito = false;
    const pos = e => { const b = cv.getBoundingClientRect(); return { x: (e.clientX - b.left) * w / b.width, y: (e.clientY - b.top) * h / b.height }; };
    cv.addEventListener('pointermove', e => {
      const p = pos(e), agora = performance.now();
      const v = ult ? Math.hypot(p.x - ult.x, p.y - ult.y) / Math.max(1, agora - ult.t) : 0; ult = { x: p.x, y: p.y, t: agora };
      if (v > 2.2) return; // rápido demais: o lápis pula
      tg.clearRect(0, 0, w, h); tg.globalCompositeOperation = 'source-over'; tg.fillStyle = 'rgba(55,52,48,.32)';
      for (let i = 0; i < 3; i++) { tg.beginPath(); tg.ellipse(p.x + (Math.random() - .5) * 6, p.y + (Math.random() - .5) * 6, 11, 7, -.5, 0, 7); tg.fill(); }
      tg.globalCompositeOperation = 'destination-out'; tg.drawImage(mask, 0, 0); tg.globalCompositeOperation = 'source-over';
      g.drawImage(tmp, 0, 0);
      if (agora - somT > 90) { somT = agora; SOM.grafite(); }
      if (p.y > 14 && p.y < 128) esfregou++;
      if (!feito && esfregou > 260) { feito = true; C.conquista('decalque'); }
    });
    cv.addEventListener('pointerleave', () => { ult = null; });
  }

  // ------------------------------------------------------------ TÍTULO: riscos de giz, porta, rodapé, texto escondido, boatos no rádio
  const tit = $('#title');
  const riscos = nova('div', 'sg-riscos', tit), riscosNomes = nova('div', 'sg-riscos-nomes', tit);
  const porta = nova('div', 'sg-porta', tit), oculto = nova('div', 'sg-oculto', tit), boatoEl = nova('div', 'sg-boato', tit);
  oculto.setAttribute('aria-hidden', 'true');
  const OCULTO = ['O RÁDIO-RELÓGIO GRAVA QUEM MEXE NELE TRÊS VEZES.', 'BATA CINCO VEZES NO RÁDIO. ELE TEM UM TELEFONE DENTRO.', 'A FOLHA DAS REGRAS TEM VERSO.', 'APERTE F1 SE QUISER AS REGRAS DE VERDADE.', 'SEIS LETRAS ACORDAM O INTERNATO. A PRIMEIRA É A.', 'O DIÁRIO TEM UMA PÁGINA DEPOIS DA ÚLTIMA.', 'APAGUE A LANTERNA E ABRA O DIÁRIO.'];
  let ocultoVisto = false;
  function textoOculto() { oculto.textContent = OCULTO[(mem.oculto || 0) % OCULTO.length]; }
  document.addEventListener('selectionchange', () => {
    const s = document.getSelection(); if (!s) return;
    const dentro = s.rangeCount && !s.isCollapsed && s.containsNode(oculto, true);
    if (dentro) ocultoVisto = true;
    else if (ocultoVisto && (s.isCollapsed || !s.rangeCount)) { ocultoVisto = false; mem.oculto = (mem.oculto || 0) + 1; gravar(); setTimeout(textoOculto, 400); }
  });
  function desenharRiscos() {
    const { L, ach } = resumo();
    riscos.innerHTML = '';
    if (!ach.length) return;
    if (ach.length >= L.length) {
      const cv = document.createElement('canvas'); cv.width = 300; cv.height = 124; cv.className = 'tudo'; riscos.appendChild(cv);
      criancas(cv.getContext('2d'), 70, 110, 1.6, 'rgba(235,228,210,.75)'); cv.title = 'todos os segredos'; return;
    }
    for (let i = 0; i < ach.length; i += 5) {
      const grupo = ach.slice(i, i + 5), r = rng(i + 3); let d = '';
      grupo.forEach((s, j) => { if (j < 4) { const x = 5 + j * 6 + (r() - .5) * 2; d += `M${x.toFixed(1)} ${(4 + r() * 2).toFixed(1)}L${(x + (r() - .5) * 2).toFixed(1)} ${(26 - r() * 2).toFixed(1)}`; } else d += `M2 ${(22 + r() * 2).toFixed(1)}L${(30 + r() * 2).toFixed(1)} ${(8 + r() * 2).toFixed(1)}`; });
      const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 34 30');
      const p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); svg.appendChild(p);
      const nomes = grupo.map(s => s.nome).join(' · ');
      svg.addEventListener('pointerenter', () => { riscosNomes.textContent = nomes; });
      svg.addEventListener('pointerleave', () => { riscosNomes.textContent = ''; });
      riscos.appendChild(svg);
    }
  }
  // marcas da porta: uma por palavra secreta do título, cada uma no seu lugar do contorno de uma porta
  const CODIGOS_TODOS = [['SILENCIO', 'lua'], ['VELORIO', 'cruz'], ['FITAGASTA', 'fita'], ['DAVI', 'carro'], ['NOVE', 'sino'], ['MOACIR', 'olho'], ['ANA', 'estrela'], ['1979', 'casa'], ['1403', 'vela'], ['ORELHAO', 'telefone'], ['ACORDA', 'pipa'], ['SINEIRO', 'sino'], ['TOME', 'barco'], ['CELESTE', 'vela'], ['ALBANO', 'chave']];
  const SLOTS = (() => { const s = []; for (let i = 0; i < 5; i++) s.push([12, 90 - i * 14]); for (let i = 0; i < 5; i++) { const a = Math.PI - i * Math.PI / 4; s.push([35 + Math.cos(a) * 23, 32 - Math.sin(a) * 22]); } for (let i = 0; i < 5; i++) s.push([58, 34 + i * 14]); return s; })();
  function desenharPorta() {
    porta.innerHTML = ''; const cod = mem.codigos || {};
    let n = 0;
    CODIGOS_TODOS.forEach(([c, f], i) => {
      if (!cod[c]) return; n++;
      const cv = document.createElement('canvas'); cv.width = cv.height = 28; cv.style.left = SLOTS[i][0] + 'px'; cv.style.top = SLOTS[i][1] + 'px';
      glifo(cv, f, 'rgba(235,228,210,.8)', hash(c)); porta.appendChild(cv);
    });
    const completa = n === CODIGOS_TODOS.length;
    porta.classList.toggle('completa', completa);
    porta.title = completa ? 'uma porta' : '';
    porta.setAttribute('role', completa ? 'button' : 'presentation'); if (completa) porta.tabIndex = 0; else porta.removeAttribute('tabindex');
  }
  porta.addEventListener('click', () => { if (porta.classList.contains('completa')) fitaDaPorta(); });
  porta.addEventListener('keydown', e => { if (porta.classList.contains('completa') && (e.code === 'Enter' || e.code === 'Space')) { e.stopPropagation(); fitaDaPorta(); } });
  function cena(dur, desenhar, txt, fim) {
    const el = document.createElement('div'); el.className = 'sg-cena'; const cv = document.createElement('canvas'); el.appendChild(cv); const t = document.createElement('div'); t.className = 'txt'; el.appendChild(t); document.body.appendChild(el);
    cv.width = innerWidth; cv.height = innerHeight; const g = cv.getContext('2d'); const t0 = rel(); let raf;
    const passo = () => { const k = rel() - t0; try { desenhar(g, cv.width, cv.height, k, t); } catch (e) {} if (k < dur) raf = requestAnimationFrame(passo); else { el.remove(); fim && fim(); } };
    passo(); el.addEventListener('click', () => { if (rel() - t0 > 1.5) { cancelAnimationFrame(raf); el.remove(); fim && fim(); } });
    if (txt) t.textContent = txt;
  }
  function fitaDaPorta() {
    sfx('fitaClique');
    const msg = 'Lia. Você procurou em todo canto. Até nos cantos que eu nem lembrava.\nObrigado por procurar tanto.\nAgora pode parar. Eu tô bem. — D.';
    cena(14, (g, w, h, k, t) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h * .42; g.strokeStyle = '#5a5246'; g.lineWidth = 3; g.strokeRect(cx - 120, cy - 50, 240, 100);
      for (const dx of [-55, 55]) { g.save(); g.translate(cx + dx, cy); g.rotate(k * (dx < 0 ? 2 : 1.6)); g.beginPath(); g.arc(0, 0, 26, 0, 7); for (let i = 0; i < 6; i++) { g.moveTo(0, 0); g.lineTo(Math.cos(i) * 26, Math.sin(i) * 26); } g.stroke(); g.restore(); }
      const n = Math.floor(clamp((k - 1) / 9, 0, 1) * msg.length); if (t.textContent.length !== n) { t.textContent = msg.slice(0, n); if (n % 3 === 0) SOM.escrita(); }
    }, '', () => { C.conquista('porta_giz'); });
  }
  function atualizarRodape() {
    const el = $('#rot-ver'); if (!el) return;
    const s = stats(), n = Math.max(1, s.partidas || 0), { L, ach } = resumo();
    el.textContent = ach.length >= L.length ? `${R.versao} — volte para a cama` : n >= 9 ? `${R.versao} — ${n} Lias. Chega.` : `${R.versao} — ${n} Lia${n > 1 ? 's' : ''}`;
    el.title = `ocorrências: ${s.mortes || 0}`;
  }
  // boatos no rádio-relógio: cada segredo achado libera um boato que aponta para outro que falta
  let boatoT = 12, boatoI = 0, boatoFora = 0;
  function boatoRadio(dt) {
    if (C.mode !== 'titulo' || tit.hidden) { boatoEl.classList.remove('on'); return; }
    if (boatoFora > 0) { boatoFora -= dt; if (boatoFora <= 0) boatoEl.classList.remove('on'); }
    boatoT -= dt; if (boatoT > 0) return; boatoT = 30;
    const { ach, falta } = resumo(), f = falta.filter(s => BOATO[s.id]); const n = Math.min(ach.length, f.length); if (!n) return;
    const s = f[boatoI++ % n];
    boatoEl.textContent = `☎ ouvinte de ${CIDADES[hash(s.id) % CIDADES.length]} liga e diz que ${BOATO[s.id]}.`; boatoEl.classList.add('on'); boatoFora = 10;
    sfx('estatica', .5);
  }

  // ------------------------------------------------------------ CÓDIGOS DO TÍTULO (registrados no despachante único de src/interface.js)
  let buf = '';
  addEventListener('keydown', e => {
    if (C.mode !== 'titulo' || tit.hidden || $('#sg-disco') || U.emCampo()) return;
    const k = e.key && e.key.length === 1 ? norm(e.key).toUpperCase() : ''; if (!k) return;
    buf = (buf + k).slice(-12);
    for (const [c] of CODIGOS_TODOS) if (buf.endsWith(c)) { buf = ''; mem.codigos = mem.codigos || {}; if (!mem.codigos[c]) { mem.codigos[c] = Date.now(); gravar(); setTimeout(desenharPorta, 300); } break; }
  });
  U.registrarCodigo('ACORDA', acorda);
  U.registrarCodigo('SINEIRO', () => {
    for (let i = 0; i < 3; i++) setTimeout(() => sfx('sino', .35, null), i * 1300);
    U.subTitulo('Sineiro. Era o que eu queria ser quando crescesse. — D.'); C.conquista('sineiro');
  });
  const nomeDito = k => { mem.nomes = mem.nomes || {}; mem.nomes[k] = 1; gravar(); if (mem.nomes.tome && mem.nomes.celeste && mem.nomes.albano) setTimeout(() => C.conquista('chamada'), 1500); };
  U.registrarCodigo('TOME', () => {
    const bs = [...tit.querySelectorAll('.menu .btn')].filter(b => !b.hidden); sfx('tique');
    bs.forEach((b, i) => setTimeout(() => { b.classList.add('sg-some'); sfx('tique'); }, 300 + i * 260));
    setTimeout(() => { bs.forEach(b => b.classList.remove('sg-some')); U.subTitulo('Achou não! O Tomé sempre ganha.'); }, 300 + bs.length * 260 + 2200);
    U.subTitulo('Um, dois, três... (risadinha atrás da cortina)'); nomeDito('tome');
  });
  U.registrarCodigo('CELESTE', () => {
    const v = nova('div', 'sg-vela', tit); clearTimeout(v._t); v._t = setTimeout(() => v.remove(), 20000);
    U.subTitulo('(baixinho, como quem reza) Dorme, criança. A irmã fica acordada por você.'); nomeDito('celeste');
  });
  U.registrarCodigo('ALBANO', () => {
    const r = nova('div', 'sg-rec', tit); r.textContent = '● GRAVANDO 21:00'; clearTimeout(r._t); r._t = setTimeout(() => r.remove(), 9000);
    sfx('estatica', 1); sfx('fitaClique');
    setTimeout(() => U.subTitulo('(voz calma de homem, gravada) Depois das nove, ninguém fala. Nem você.'), 1200); nomeDito('albano');
  });
  function acorda() {
    const fins = Object.keys(stats().finais || {}).length, janelas = [];
    for (let l = 0; l < 3; l++) for (let c = 0; c < 6; c++) janelas.push({ l, c, apaga: 3.4 + Math.random() * 2.2 });
    const comCrianca = new Set(); while (comCrianca.size < Math.min(fins, 3)) comCrianca.add([7, 9, 4][comCrianca.size]);
    sfx('sinoLonge');
    cena(6.5, (g, w, h, k) => {
      g.fillStyle = '#05070b'; g.fillRect(0, 0, w, h);
      const bw = Math.min(w * .7, 760), bh = bw * .52, x0 = (w - bw) / 2, y0 = h * .2;
      g.fillStyle = '#0f0d0b'; g.fillRect(x0, y0, bw, bh); g.beginPath(); g.moveTo(x0 - 10, y0); g.lineTo(w / 2, y0 - bh * .28); g.lineTo(x0 + bw + 10, y0); g.fill();
      const jw = bw / 6 * .5, jh = bh / 3 * .55;
      janelas.forEach((j, i) => {
        const x = x0 + bw / 6 * (j.c + .25), y = y0 + bh / 3 * (j.l + .22);
        let luz = k < .4 ? k / .4 : k > j.apaga ? Math.max(0, 1 - (k - j.apaga) / (semFlash() ? .8 : .12)) : 1;
        g.fillStyle = `rgba(242,190,90,${(.12 + luz * .8).toFixed(2)})`; g.fillRect(x, y, jw, jh);
        if (comCrianca.has(i) && luz > .2) { g.fillStyle = '#120c08'; const cx = x + jw / 2, cy = y + jh * .45; g.beginPath(); g.arc(cx, cy, jw * .14, 0, 7); g.fill(); g.fillRect(cx - jw * .14, cy + jw * .12, jw * .28, jh * .5); g.save(); g.translate(cx + jw * .12, cy + jw * .2); g.rotate(-1.9 + Math.sin(k * 7) * .5); g.fillRect(0, -2, jw * .32, 4); g.restore(); }
      });
    }, '', () => { U.subTitulo('Acordaram todos. Menos você.'); C.conquista('acordei'); });
  }

  // ------------------------------------------------------------ DISCO DE TELEFONE (códigos do título sem teclado: toque, mouse ou controle)
  const LETRA_DIG = {}; ['', '', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'].forEach((s, d) => { for (const ch of s) LETRA_DIG[ch] = String(d); });
  const digitos = c => [...c].map(ch => /[0-9]/.test(ch) ? ch : LETRA_DIG[ch] || '').join('');
  const DIG = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], LETRAS = ['', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ', ''];
  let disco = null;
  function abrirDisco() {
    if ($('#sg-disco') || C.mode !== 'titulo') return;
    const el = nova('div', 'sg-disco'); el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Disco de telefone');
    el.innerHTML = '<div class="num" aria-live="polite"></div><canvas width="340" height="340"></canvas><small>Disque um número (as letras ficam embaixo de cada furo, como nos aparelhos de 1994). Teclado: números · controle: ◀ ▶ e A · ESC ou B desliga.</small><button class="btn" id="sg-desligar">Desligar</button>';
    disco = { el, cv: el.querySelector('canvas'), num: el.querySelector('.num'), ang: 0, sel: 0, ocupado: false, dig: '' };
    el.querySelector('#sg-desligar').onclick = fecharDisco;
    disco.cv.addEventListener('pointerdown', e => { const b = disco.cv.getBoundingClientRect(), x = (e.clientX - b.left) * 340 / b.width - 170, y = (e.clientY - b.top) * 340 / b.height - 170; for (let i = 0; i < 10; i++) { const a = furoAng(i); if (Math.hypot(x - Math.cos(a) * 118, y - Math.sin(a) * 118) < 22) { discar(i); break; } } });
    desenharDisco(); sfx('clique');
    setTimeout(() => { const b = el.querySelector('#sg-desligar'); if (b) b.focus(); }, 40);
  }
  function fecharDisco() { if (!disco) return; disco.el.remove(); disco = null; }
  const furoAng = i => (-50 - i * 30) * Math.PI / 180;
  function desenharDisco() {
    if (!disco) return; const g = disco.cv.getContext('2d');
    g.clearRect(0, 0, 340, 340); g.save(); g.translate(170, 170);
    g.fillStyle = '#e9e2cf'; g.beginPath(); g.arc(0, 0, 150, 0, 7); g.fill();
    for (let i = 0; i < 10; i++) { const a = furoAng(i), x = Math.cos(a) * 96, y = Math.sin(a) * 96; g.fillStyle = '#2a2119'; g.font = 'bold 20px "Courier New"'; g.textAlign = 'center'; g.fillText(DIG[i], x * 1.23, y * 1.23 + 2); g.font = '9px "Courier New"'; g.fillText(LETRAS[i], x * 1.23, y * 1.23 + 13); }
    g.rotate(disco.ang);
    g.fillStyle = '#141110'; g.beginPath(); g.arc(0, 0, 142, 0, 7); g.arc(0, 0, 54, 0, 7, true); g.fill('evenodd');
    for (let i = 0; i < 10; i++) { const a = furoAng(i); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(Math.cos(a) * 118, Math.sin(a) * 118, 19, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; if (i === disco.sel) { g.strokeStyle = '#c9a75a'; g.lineWidth = 2; g.beginPath(); g.arc(Math.cos(a) * 118, Math.sin(a) * 118, 21, 0, 7); g.stroke(); } }
    g.restore();
    g.fillStyle = '#8e1b14'; g.beginPath(); g.arc(170, 170, 50, 0, 7); g.fill(); g.fillStyle = '#e9dfc8'; g.font = '11px "Special Elite"'; g.textAlign = 'center'; g.fillText('SÃO LÁZARO', 170, 166); g.fillText('21-00', 170, 182);
    const s = 60 * Math.PI / 180; g.strokeStyle = '#b8b0a0'; g.lineWidth = 6; g.beginPath(); g.moveTo(170 + Math.cos(s) * 128, 170 + Math.sin(s) * 128); g.lineTo(170 + Math.cos(s) * 158, 170 + Math.sin(s) * 158); g.stroke();
  }
  function discar(i) {
    if (!disco || disco.ocupado) return; disco.ocupado = true; disco.sel = i; SOM.furo();
    const alvo = (110 + 30 * i) * Math.PI / 180, ida = .25, volta = .12 * (i + 1) + .1, t0 = rel(); let somFeito = false;
    const anim = () => {
      if (!disco) return; const k = rel() - t0;
      if (k < ida) disco.ang = alvo * (k / ida);
      else if (k < ida + volta) { if (!somFeito) { somFeito = true; SOM.mola(i + 1); } disco.ang = alvo * (1 - (k - ida) / volta); }
      else { disco.ang = 0; disco.ocupado = false; desenharDisco(); discou(DIG[i]); return; }
      desenharDisco(); requestAnimationFrame(anim);
    };
    anim();
  }
  function discou(d) {
    if (!disco) return; disco.dig = (disco.dig + d).slice(-12); disco.num.textContent = disco.dig;
    for (const [c] of CODIGOS_TODOS) {
      if (!disco.dig.endsWith(digitos(c))) continue;
      fecharDisco(); C.conquista('disco');
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      setTimeout(() => { for (const ch of c) { const code = /[0-9]/.test(ch) ? 'Digit' + ch : 'Key' + ch; for (const tipo of ['keydown', 'keyup']) dispatchEvent(new KeyboardEvent(tipo, { code, key: ch.toLowerCase(), bubbles: true, cancelable: true })); } }, 250);
      return;
    }
  }
  let radioCliques = [];
  const rr = $('#radiorel');
  if (rr) rr.addEventListener('click', () => { const t = rel(); radioCliques = radioCliques.filter(x => t - x < 3).concat(t); if (radioCliques.length >= 5) { radioCliques = []; setTimeout(abrirDisco, 300); } });
  addEventListener('keydown', e => {
    if (!disco) return;
    if (e.code === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); fecharDisco(); return; }
    const m = /^(?:Digit|Numpad)([0-9])$/.exec(e.code); if (m) { e.stopImmediatePropagation(); discar(DIG.indexOf(m[1])); }
  }, true);
  // controle: Select três vezes abre o disco; ◀ ▶ escolhem o furo, A disca, B desliga
  let padAnt = {}, selects = [];
  function padTitulo() {
    if (C.mode !== 'titulo' || !navigator.getGamepads) return;
    let gp = null; try { gp = [...navigator.getGamepads()].find(x => x && x.connected); } catch (e) {} if (!gp) return;
    const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed), borda = i => { const v = b(i), a = padAnt[i]; padAnt[i] = v; return v && !a; };
    const sel = borda(8), esq = borda(14), dir = borda(15), A = borda(0), B = borda(1);
    if (!disco) { if (sel && !tit.hidden) { const t = rel(); selects = selects.filter(x => t - x < 2.5).concat(t); if (selects.length >= 3) { selects = []; abrirDisco(); } } return; }
    if (B) { fecharDisco(); return; }
    if (esq) { disco.sel = (disco.sel + 9) % 10; desenharDisco(); } if (dir) { disco.sel = (disco.sel + 1) % 10; desenharDisco(); }
    if (A) discar(disco.sel);
  }

  // ------------------------------------------------------------ MANUAL DO ALUNO (F1)
  function manual() {
    if ($('#sg-manual')) return fecharManual();
    if (C.mode === 'jogo' && !C.ui && C.S && !C.S.dead) for (const tipo of ['keydown', 'keyup']) dispatchEvent(new KeyboardEvent(tipo, { code: 'KeyP', key: 'p', bubbles: true, cancelable: true }));
    const el = nova('div', 'sg-manual'); el.setAttribute('role', 'dialog');
    el.innerHTML = `<div class="paper"><h2>MANUAL DO ALUNO — 1979</h2><p style="font-size:14px;margin-bottom:6px">Internato São Lázaro · leitura obrigatória · ESC fecha</p><ol>
      <li>O aluno deve dobrar o cobertor em quatro partes iguais antes do café.</li>
      <li>É proibido assobiar nos corredores, inclusive hinos.</li>
      <li>Sapatos ficam alinhados pelo bico, nunca pelo calcanhar.</li>
      <li>Cartas para a família serão lidas pela diretoria antes do envio.</li>
      <li>O aluno não deve contar em voz alta, sob nenhum pretexto.</li>
      <li class="v">Durante a trovoada o aluno pode andar: o barulho do céu cobre o dos pés.</li>
      <li>Lanternas pertencem à Irmã responsável e são recolhidas às oito.</li>
      <li>O sino é bênção e só o Diretor o toca.</li>
      <li>Às nove horas, ninguém fala. Quem falar será recolhido.</li>
      <li>Em caso de dúvida, consulte o Inspetor. Ele escuta.</li></ol></div>`;
    el.addEventListener('click', fecharManual);
    C.conquista('manual'); sfx('papel');
  }
  function fecharManual() { const el = $('#sg-manual'); if (el) { el.remove(); sfx('papel'); } }

  // ------------------------------------------------------------ OPÇÕES: a opção que não devia estar lá
  function opcoes(box) {
    if (mem.convite) return;
    const l = document.createElement('label'); l.className = 'op sg-convite'; l.innerHTML = '<span>Deixar ele entrar</span><button class="btn" type="button">Não</button>';
    box.appendChild(l); const b = l.querySelector('button'); let n = 0;
    b.onclick = e => {
      e.preventDefault(); n++;
      if (n < 9) { b.textContent = 'Não'; SOM.lingua(); return; }
      b.textContent = 'Sim'; const p = nova('div', 'sg-preto'); void p.offsetWidth; p.classList.add('on'); SOM.batidas();
      setTimeout(() => { p.classList.remove('on'); setTimeout(() => p.remove(), 900); l.remove(); mem.convite = true; gravar(); C.conquista('convite'); }, 2600);
    };
  }

  // ------------------------------------------------------------ TELA DE MORTE
  let morteEm = -99, segura = null, aindaFeito = false;
  function morte(quem) {
    setTimeout(() => { try { morteDepois(quem); } catch (e) { console.warn('[segredos] morte', e); } }, 0);
  }
  function morteDepois(quem) {
    const S = St(); if (!S) return;
    morteEm = rel(); segura = null; aindaFeito = false; const ai = $('#sg-ainda'); if (ai) ai.remove();
    const N = Math.max(stats().mortes || 0, S.mortes || 0);
    const causa = $('#death-causa'), lian = nova('div', 'sg-lian'); if (causa && lian.previousElementSibling !== causa) causa.insertAdjacentElement('afterend', lian);
    lian.textContent = `Lia nº ${N}` + (N === 38 ? ' · Sobrou uma vaga.' : '');
    if (N === 37) { const d = $('#death-dica'); if (d) d.textContent = 'Trinta e sete. Agora a lista tá completa.'; trintaESete(); }
    else fitaVermelha();
    if ((S.capMortes || 0) >= 3) frase('mortes', 'de novo não. de novo não. de novo não.');
    if (S.mortes === 9 && !fl('foraAr')) { marcar('foraAr'); foraDoAr(); }
  }
  function trintaESete() {
    const cv = $('#death-mapa'); if (!cv) return; cv.hidden = false; const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height);
    g.strokeStyle = '#c0392b'; g.lineWidth = 2;
    for (let i = 0; i < 37; i++) { const x = 22 + (i % 10) * 31, y = 26 + Math.floor(i / 10) * 40, s = 7; g.beginPath(); g.moveTo(x - s, y - s); g.lineTo(x + s, y + s); g.moveTo(x + s, y - s); g.lineTo(x - s, y + s); g.stroke(); }
    g.fillStyle = '#857a63'; g.font = '12px "Special Elite", monospace'; g.fillText('37 matriculados · 1979', 8, cv.height - 6);
  }
  function itensSecretos() {
    const S = St(), W = C.W; if (!S || !W) return [];
    const ids = new Set(segredos().filter(s => s.tipo === 'n' && !(S.notes && S.notes[s.id])).map(s => s.id));
    return W.items.filter(i => i.mesh.visible && i.key.startsWith(W.mapa + ':nota_') && ids.has(i.key.slice(W.mapa.length + 6)));
  }
  function fitaVermelha() {
    const t = U.mapaMorte && U.mapaMorte(), cv = $('#death-mapa'); if (!t || !cv || cv.hidden) return;
    const P = C.P, it = itensSecretos().find(i => Math.hypot(i.mesh.position.x - P.pos.x, i.mesh.position.z - P.pos.z) < 6); if (!it) return;
    const g = cv.getContext('2d'), x = t.sx(it.mesh.position.x), y = t.sz(it.mesh.position.z);
    if (x < 0 || y < 0 || x > cv.width || y > cv.height) return;
    g.save(); g.translate(x, y); g.rotate(-.5); g.fillStyle = 'rgba(170,40,34,.55)'; g.fillRect(-6, -2, 12, 4); g.beginPath(); g.moveTo(6, -2); g.lineTo(10, -5); g.lineTo(9, 1); g.closePath(); g.moveTo(-6, -2); g.lineTo(-10, 3); g.lineTo(-8, -3); g.closePath(); g.fill(); g.restore();
  }
  function foraDoAr() {
    const el = nova('div', 'sg-barras'); el.innerHTML = '<div>ENCERRAMOS NOSSA PROGRAMAÇÃO.<br>VOLTAMOS ÀS <b>NOVE</b>.</div>';
    SOM.khz(4);
    setTimeout(() => { const b = el.querySelector('b'); if (b) b.classList.add('pisca'); }, 4000);
    setTimeout(() => { el.remove(); C.conquista('fora_do_ar'); }, 5600);
  }
  function dicaSegredoPerto() {
    const P = C.P; let best = null, bd = 1e9;
    for (const it of itensSecretos()) { const d = Math.hypot(it.mesh.position.x - P.pos.x, it.mesh.position.z - P.pos.z); if (d < bd) { bd = d; best = it; } }
    if (!best) return 'não tem mais nada escondido aqui perto. só eu.';
    let sala = ''; try { const r = C.roomAt(best.mesh.position.x, best.mesh.position.z); sala = r && r.nome ? r.nome.toLowerCase() : ''; } catch (e) {}
    return `tem papel escondido ${sala ? 'na ' + sala : 'perto'}, a uns ${Math.round(bd)} passos de onde você caiu.`;
  }
  // segurar ESPAÇO na tela de morte: a Lia prende o ar (um toque continua sendo "tentar de novo")
  function morteFrame(dt) {
    const esc2 = nova('div', 'sg-escurece');
    if (!segura) { if (+esc2.style.opacity > 0) esc2.style.opacity = Math.max(0, +esc2.style.opacity - dt * 1.5); return; }
    const k = rel() - segura;
    if (k > .6) esc2.style.opacity = clamp((k - .6) / 8.4, 0, .93);
    if (k >= 9 && !aindaFeito) {
      aindaFeito = true; segura = null; sfx('sussurros', 1.5);
      if (fl('ainda')) return; marcar('ainda');
      const d = $('#death-dica'), a = document.createElement('div'); a.id = 'sg-ainda';
      a.innerHTML = `...ainda não.<small>${esc(dicaSegredoPerto())}</small>`; if (d) d.insertAdjacentElement('afterend', a);
    }
  }

  // ------------------------------------------------------------ CRONÔMETRO: 09:09.09 e trechos de ouro
  let ant = null, trava = null, Sc = null;
  function cron(S) {
    if (!S) return null;
    if (S !== Sc) { Sc = S; ant = { c: S.capT, t: S.tempo }; }
    const alvo = 549.09;
    if (!fl('99') && ant) {
      const k = ant.c < alvo && S.capT >= alvo ? 'cap' : ant.t < alvo && S.tempo >= alvo ? 'tot' : null;
      if (k) { marcar('99'); trava = { k, ate: rel() + 1.1 }; sfx('sinoLonge'); setTimeout(() => C.conquista('nove_e_nove'), 1200); }
    }
    ant = { c: S.capT, t: S.tempo };
    if (trava && rel() < trava.ate) return trava.k === 'cap' ? `<b class="sg-99">09:09.09</b><small>${relogio(S.tempo)}</small>` : `${relogio(S.capT)}<small><b class="sg-99">09:09.09</b></small>`;
    return null;
  }
  let ultObj = { cap: -1, t: 0 };
  function split(id) {
    const S = St(); if (!S || !OPT.cron) return;
    const c = R.capitulos[S.chapter]; if (!c) return;
    const ini = ultObj.cap === S.chapter && ultObj.t <= S.capT ? ultObj.t : 0, seg = S.capT - ini; ultObj = { cap: S.chapter, t: S.capT };
    const caps = C.lsGet(C.CAPS_KEY, {}), reg = caps[c.id] || {}, segs = reg.segs || {}, melhor = segs[id];
    const el = $('#split');
    if (melhor && seg < melhor && el) { el.classList.add('ouro'); el.textContent += ' ★ trecho de ouro'; }
    else if (el) el.classList.remove('ouro');
    if (!melhor || seg < melhor) { segs[id] = +seg.toFixed(2); caps[c.id] = { ...reg, segs }; C.lsSet(C.CAPS_KEY, caps); }
  }
  function fimCap(c) {
    const S = St(); if (!S || !OPT.cron) return;
    const reg = (C.lsGet(C.CAPS_KEY, {})[c.id] || {}), segs = reg.segs || {};
    if (!c.objetivos.every(o => segs[o.id])) return;
    const soma = c.objetivos.reduce((a, o) => a + segs[o.id], 0), ganha = S.capT - soma;
    const el = $('#fc-crit'); if (el) el.insertAdjacentHTML('beforeend', `<span class="sg-soma">Soma dos melhores trechos: ${relogio(soma)}${ganha > .5 ? ` · ainda dá para ganhar ${relogio(ganha)}` : ' · você correu o melhor possível'}</span>`);
  }

  // ------------------------------------------------------------ PAUSA
  let menuHover = 0;
  const pMenu = $('#p-menu');
  if (pMenu) { pMenu.addEventListener('pointerenter', () => { menuHover = rel(); }); pMenu.addEventListener('pointerleave', () => { menuHover = 0; }); }
  function pausa() {
    const S = St(), n = nestaNoite(S).length, el = $('#p-info');
    if (el && n) el.insertAdjacentHTML('beforeend', `<br><small class="sg-p">✶ ${n} segredo${n > 1 ? 's' : ''} achado${n > 1 ? 's' : ''} nesta noite</small>`);
  }
  function naoPodeSair() {
    if (!menuHover || C.ui !== 'pausa' || fl('naoSai') || OPT.truques === false) return;
    if (rel() - menuHover < 9) return;
    marcar('naoSai'); menuHover = 0; const orig = pMenu.textContent; pMenu.textContent = 'Você não pode sair';
    sfx('pancada', C.P.pos.x + 1, C.P.pos.z);
    setTimeout(() => { try { C.fecharPausa(); } catch (e) {} U.legenda('[uma porta de armário se fecha, bem atrás de você]', 'p'); }, 900);
    setTimeout(() => { pMenu.textContent = orig; }, 3000);
  }

  // ------------------------------------------------------------ TECLAS
  let oT = [], qT = [], copias = 0;
  function tecla(e) {
    if (e.code === 'F1') { if (e.preventDefault) e.preventDefault(); manual(); return true; }
    if ($('#sg-manual') && (e.code === 'Escape' || e.code === 'Enter')) { fecharManual(); return true; }
    if (e.code === 'Space' && C.ui === 'morte' && !$('#death').hidden && rel() - morteEm > .4) { segura = rel(); return true; }
    const S = St();
    if (C.mode === 'jogo' && !C.ui && S && !S.dead) {
      if (e.code === 'KeyO') {
        const t = rel(); oT = oT.filter(x => t - x < 6).concat(t);
        if (!fl('irrita')) {
          if (oT.length === 9) C.sub('lia', 'Para de me perguntar, eu também não sei!');
          if (oT.length >= 10) { marcar('irrita'); oT = []; sfx('estatica', 1.2); setTimeout(() => C.sub('davi', '(no rádio, entre chiados) Ela sabe sim. Ela só tá com medo.'), 900); }
        }
      }
      if (e.code === 'KeyQ') { const t = rel(); qT = qT.filter(x => t - x < 8).concat(t); if (qT.length >= 3) frase('olhar', 'para de olhar pra trás.'); }
    }
    if (C.ui === 'nota' && e.code === 'KeyC' && (e.ctrlKey || e.metaKey) && ehDavi()) {
      const txt = copias++ ? 'eu disse não.' : `não me tira daqui. — D. ${hoje()}`; ultimaCopia = txt;
      try { navigator.clipboard.writeText(txt).catch(() => {}); } catch (er) {}
      return true;
    }
    return false;
  }
  function soltou(e) {
    if (e.code !== 'Space' || !segura) return;
    const k = rel() - segura; segura = null;
    if (k < .6 && C.ui === 'morte') C.retry();
  }
  const ehDavi = () => /Davi/.test(($('#note h2') || {}).textContent || '');
  let ultimaCopia = '';
  document.addEventListener('copy', e => { if (C.ui !== 'nota' || !ehDavi()) return; try { e.clipboardData.setData('text/plain', ultimaCopia || `não me tira daqui. — D. ${hoje()}`); e.preventDefault(); } catch (er) {} });

  // ------------------------------------------------------------ QUADRO A QUADRO
  let modoAnt = C.mode, uiAnt = null, notaT = 0, ombro = false, legT = 0, legEspera = null, faroVisto = new Set(), faroT = 0, escondT = 0, Sant = null;
  let realT = 0;
  const ombroEl = nova('div', 'sg-ombro');
  ombroEl.innerHTML = '<svg viewBox="0 0 100 260" width="100%" height="100%" preserveAspectRatio="xMaxYMax meet"><path d="M60 40a18 20 0 1 1 0.1 0ZM36 70q24-10 48 0l10 80-8 2-4 108h-18l-2-70-2 70h-18l-4-108-8-2Z" fill="#050403" opacity=".96"/></svg>';
  function tvOff() {
    if (semFlash() || menosMov()) return;
    const el = nova('div', 'sg-tv'); el.innerHTML = '<i></i>'; SOM.tvOff();
    setTimeout(() => { el.style.transition = 'opacity .35s'; el.style.opacity = 0; }, 560); setTimeout(() => el.remove(), 950);
  }
  function frame(dt, ativo) {
    const S = St();
    if (C.mode !== modoAnt) { if (modoAnt === 'jogo' && C.mode === 'titulo') { tvOff(); setTimeout(atualizarTitulo, 50); } modoAnt = C.mode; }
    if (S !== Sant) { if (S && S.chapter === 0 && (S.tempo || 0) < 1) { realT = 0; conversa = []; ultObj = { cap: -1, t: 0 }; } Sant = S; }
    if (C.mode !== 'titulo' && S && !S.fim) realT += dt;
    boatoRadio(dt); padTitulo();
    if (C.ui === 'morte') morteFrame(dt); else { segura = null; const e2 = $('#sg-escurece'); if (e2) e2.style.opacity = 0; }
    checarT -= dt; if (checarT <= 0) { checarT = 1; try { checarNovos(); } catch (e) {} }
    // alguém lendo por cima do ombro (uma vez por noite; não com o aviso antes dos sustos)
    if (C.ui === 'nota') { notaT += dt; if (notaT > 40 && !fl('ombro') && OPT.avisoSusto !== true && OPT.truques !== false && C.mode === 'jogo') { marcar('ombro'); ombro = true; const pan = Math.random() < .5 ? -.8 : .8; SOM.respira(pan); U.legenda(`[alguém lê por cima do seu ombro, ${pan < 0 ? 'à esquerda' : 'à direita'}]`, 'p'); } }
    else { notaT = 0; if (uiAnt === 'nota' && ombro) { ombro = false; ombroEl.style.left = Math.random() < .5 ? '-30px' : ''; ombroEl.style.right = ombroEl.style.left ? '' : '-30px'; ombroEl.classList.add('on'); setTimeout(() => ombroEl.classList.remove('on'), 300); } }
    uiAnt = C.ui;
    naoPodeSair();
    if (!ativo || !S || C.mode !== 'jogo') return;
    if (S.hidden) { escondT += dt; if (escondT > 60) frase('esconde', 'ele sabe onde você fica.'); } else escondT = 0;
    // legenda que sabe que está sendo lida (uma vez por noite, num momento calmo)
    const M = C.M, calmo = !(M.ativo && (M.state === 'caca' || M.state === 'investiga')) && !C.PROC.fase && !C.ANA.ativa && !S.hidden;
    if (legEspera) {
      let d = C.P.yaw - legEspera.yaw; d = Math.abs(Math.atan2(Math.sin(d), Math.cos(d)));
      if (d > 2.3) { U.legenda('[obrigado por olhar]', 'h'); legEspera = null; } else if (rel() > legEspera.ate) legEspera = null;
    } else if (calmo && OPT.legSom !== 'nao' && OPT.truques !== false && !fl('lida') && (S.tempo || 0) > 240) {
      legT += dt; if (legT > 45 && Math.random() < dt / 30) { marcar('lida'); U.legenda('[alguém lendo as legendas, atrás de você]', 'h'); legEspera = { yaw: C.P.yaw, ate: rel() + 8 }; }
    } else legT = 0;
    // faro para segredos
    if (OPT.faro && algumFinal()) {
      faroT -= dt;
      if (faroT <= 0) {
        faroT = .5; const P = C.P;
        for (const it of itensSecretos()) { if (faroVisto.has(it.key)) continue; if (Math.hypot(it.mesh.position.x - P.pos.x, it.mesh.position.z - P.pos.z) < 4) { faroVisto.add(it.key); SOM.grave(); try { U.som('faro', []); } catch (e) {} break; } }
      }
    }
  }

  // ------------------------------------------------------------ TELA FINAL
  function telaFinal(tipo) {
    const S = St(); if (!S) return;
    const ant2 = $('#sg-final'); if (ant2) ant2.remove();
    const N = Math.max(stats().mortes || 0, S.mortes || 0), noite = nestaNoite(S);
    const bs = boatos(3); mem.boatos = (mem.boatos || []).concat(bs.map(b => b.t)).slice(-12); gravar();
    const falta = resumo().falta.filter(s => CHARADA[s.id]), ch = falta.length ? CHARADA[falta[hash(String(S.flags._noite || 1) + tipo) % falta.length].id] : '';
    const box = document.createElement('div'); box.id = 'sg-final'; box.className = 'sg-final';
    box.innerHTML = `<canvas width="440" height="64" aria-label="A lata do Davi: o que você achou nesta noite"></canvas>
      <div class="lian">Saiu a Lia nº ${N}. · no relógio da parede: ${mmss(realT)} (com pausas, cargas e cenas) · tempo de jogo ${mmss(S.tempo || 0)}</div>
      ${noite.length ? `<div class="tambem"><b>E também:</b> ${noite.map(s => esc(s.tipo === 'c' ? `${s.nome}, lembrado` : `${s.nome}, achado`)).join(' · ')}</div>` : ''}
      ${bs.length ? `<div class="bilhete"><h4>O que dizem na escola da cidade</h4>${bs.map(b => `<div>— dizem que ${esc(b.t)}.</div>`).join('')}<div style="text-align:right;font-size:12px;margin-top:6px">(passa pra frente)</div></div>` : ''}
      ${ch ? `<div class="charada">${esc(ch)}</div>` : ''}`;
    const st = $('#e-stats'); if (st) st.insertAdjacentElement('afterend', box);
    lata(box.querySelector('canvas'), S);
  }
  function lata(cv, S) {
    const g = cv.getContext('2d'), L = segredos().filter(s => s.tipo !== 'c'), a = acervo();
    g.fillStyle = '#16120e'; g.fillRect(0, 0, 440, 64); g.strokeStyle = '#5a4a2e'; g.strokeRect(1, 1, 438, 62);
    g.fillStyle = '#8a7350'; g.font = '11px "Special Elite"'; g.fillText('a lata do Davi', 8, 13);
    const n = Math.max(1, L.length), w = Math.min(26, (424) / n);
    L.forEach((s, i) => {
      const c = document.createElement('canvas'); c.width = c.height = 24;
      const agora = achado(s, {}, {}, S), antes = achado(s, a, {}, S);
      glifo(c, formaDe(s.id), agora ? '#e3c76e' : antes ? '#7d7058' : '#4a4133', hash(s.id), !antes);
      g.drawImage(c, 8 + i * w, 22, Math.min(24, w - 1), Math.min(24, w - 1));
    });
  }

  // ------------------------------------------------------------ TÍTULO
  function atualizarTitulo() { try { desenharRiscos(); desenharPorta(); atualizarRodape(); textoOculto(); } catch (e) { console.warn('[segredos] título', e); } }
  atualizarTitulo();

  return { frame, morte, pausa, fimCap, split, cron, tecla, soltou, opcoes, diario, renderAlbum, renderUltima, telaFinal, atualizarTitulo };
}
