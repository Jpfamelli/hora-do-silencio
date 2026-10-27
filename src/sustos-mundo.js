// SUSTOS E EVENTOS — Lote 2: o mundo conta a história sozinho
// Ecos de 1979, o Davi que só aparece em reflexos, as chamadas no escuro, objetos que lembram de você,
// o livro de ocorrências que se escreve sozinho, a cova aberta e o incêndio que volta por três segundos.
// Instalado por src/sustos.js (criarSustos) com o kit K (fila, sons, utilidades). Nada aqui tem IA nem dá dano;
// no máximo faz barulho e o Inspetor escuta.
import * as THREE from 'three';

const MEMS = {}; // memória por partida: sobrevive a morrer e voltar do checkpoint (a chave é o código sorteado da partida)
const LS_KEY = 'hora-silencio-sx2';
const lsGet = (d) => { try { const v = JSON.parse(localStorage.getItem(LS_KEY)); return v && typeof v === 'object' ? v : d; } catch (e) { return d; } };
const lsSet = (v) => { try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch (e) { /* sem armazenamento: tudo bem */ } };

export function instalarMundo(E, K) {
  const { R, rand, pick, clamp, lerp, camera, W, P, M, ANA, PROC } = E;
  const S = () => E.S;
  const { depois, anima, voz, respiracao, passoPos, batida, vacuo, marcarForte, apagao, notas, arranhao, vento, rolar, atras, fwdH, dist2, abrirDevagar, fundoCorredor, seguro, som, maoContato } = K;
  const agora = () => K.agora();
  const T = Object.assign({
    cartaz_arranca: 'Isso não tem graça. Quem colou isso aqui?',
    cartaz_volta: '(baixinho) ...tá colado de novo.',
    cartaz_label: 'DESAPARECIDA — 1994 — Lia Moraes, 29 anos. “Vista pela última vez na estrada velha.”',
    livro_proc: '(tinta fresca) 17/03/1994 — {h}. Visitante Lia M. fora da cama. O Inspetor decide.',
    livro_correu: '(tinta fresca) 17/03/1994 — {h}. Visitante Lia M. correu durante a Hora.',
    livro_morte: '(tinta fresca) 17/03/1994 — {h}. Lia M. Armário.',
    chamada_nomes: ['Benedito Alves?', 'Carla Souza?', 'Jorge Lima?', 'Marta Ferreira?'],
    chamada_presente: '(vozes de criança, no escuro) Presente.',
    chamada_mortos: ['Davi Moraes?', 'Ana Luísa Prado?', 'Tomé Ribeiro?'],
    chamada_lia: 'Lia Moraes?',
    chamada_falta: '(a freira, anotando) ...Falta.',
    chamada_presente_ele: '(de dentro do refeitório, grave) Presente.',
    chamadaB: [['Ana?', 'presente'], ['Tomé?', 'presente'], ['Davi?', null], ['Davi?', null], ['Lia?', 'lia']],
    chamadaB_lia: '(uma criança, logo atrás de você) Presente.',
    diretor_fuma: 'Cigarro e cera. Ele ainda vem aqui.',
    joaquim_patio: 'Seu Joaquim...? No meio da chuva. Ele tá apontando pra casa de máquinas.',
    joaquim_arm: 'Seu Joaquim? ...Ele apontou pra aquele armário.',
    joaquim_proc: '(longe, a voz do velho) Esse aí elas não abrem.',
    polaroid_label: '<b>E</b>Ver a foto instantânea',
    polaroid: ['Uma foto instantânea. Sou eu, de costas, parada na estrada. Tirada de cima do carro.', '(no verso, a lápis) 17/03/1994 — chegou.'],
    fuligem: '[cheiro de fumaça... mas a porta está fria]',
    lia_cama: '(baixinho, debaixo da cama) Agora você mora aqui.',
    lia_arm_risco: '[algo risca a madeira por dentro, um risquinho de cada vez]',
    lia_arm: '(sussurro, colado na sua orelha) Esse é seu desde 79.',
    arm12: '(um menino, colado em você) Ele vai ficar bonzinho se você não chorar.',
    arm12_dica: 'Segure ESPAÇO. Não deixa a respiração sair.',
    gude: '[a bolinha de vidro estala alto debaixo da bota]',
    amarelinha_fim: '(atrás de você) Achei.',
    lata_label: '<b>E</b>Encostar a lata no ouvido',
    lata_puxar: '<b>E</b>Puxar o barbante',
    lata_fala: '(do outro lado do barbante, um menino) Ele tá {onde}.',
    lata_longe: '(do outro lado do barbante, um menino) Ele não tá aqui em cima. Ainda.',
    lata_puxa: '[o outro lado puxa de volta, com força]',
    blocos: '(rindo, em algum lugar da sala) Já tô brincando.',
    bater_label: '<b>E</b>Bater de leve na parede',
    bater_todas: '[a resposta vem de todas as paredes ao mesmo tempo]',
    bater_sai: '(do outro lado, um menino soletrando) S... A... I...',
    pijama: '(a mão acende a lanterna sozinha) ...Não. Não tinha ninguém.',
    nao_olha: '(do outro lado da porta) Não olha pra mim ainda.',
    escada: 'Foi aqui que o Seu Joaquim não conseguiu passar.',
    arrastado: '(voz de homem, longe) Falou durante a Hora.',
    davi_cama: 'O cobertor de retalhos... A mãe costurou esse. Ainda tá quente.',
    davi_mao: '[uma mão pequena segura a sua e apaga a lanterna]',
    nao_label: '<b>E</b>Abrir o armário marcado “NÃO”',
    nao_garrafa: '<b>E</b>Pegar a garrafa da mão dele',
    nao_fala: ['Um homem. Jaqueta de couro, crachá do jornal. Encolhido aqui dentro.', 'Ele se escondeu. Ele prendeu o ar. ...Não adiantou.'],
    nao_cracha: 'CLÁUDIO REIS — JORNAL DO VALE — 1987',
    seta_falsa: 'Essa seta... Essa não é a letra dele.',
    cadeira: 'Cheiro de cigarro. Ele estava sentado aqui agora.',
    choro: '[choro abafado, de dentro do armário enferrujado]',
    choro_dentro: '(dentro do armário, colado em você) Shhh. Ele ouve a gente chorar.',
    cova: 'Uma cova aberta. A cruz é nova... e tem o meu nome. A giz.',
    cova_terra: '[terra caindo, atrás de você]',
    albano_sem: 'Não tem corrente nenhuma. Ninguém trancou nada.',
    reporter: ['(do lado de fora do muro, um homem rouco) Moça? Moça, tem alguém aí? Eu sou do jornal... eu me perdi.', '(o homem) Responde. Por favor. Só responde.'],
    reporter_lia: 'Tô aqui! Quem é?',
    reporter_achei: '(a mesma voz, agora grave e do seu lado) Achei.',
    reporter_vai: '(o homem, se afastando) ...devo ter ouvido coisa.',
    desenho_label: 'Um desenho de giz de cera preso no muro',
    desenho: 'Esse não é o meu. No meu não tinha ninguém atrás da gente.',
    abre: '(de dentro da capela, mãos pequenas na madeira) Abre! Abre! ABRE!',
    rosa: 'ROSA, 8 ANOS — uma fita de cabelo vermelha, molhada, como se tivesse voltado agora.',
    joao: 'JOÃO, 7 ANOS — uma bolinha de gude molhada, encostada na pedra.',
    tosse: '(tosse, engasgada com a fumaça)',
    tosse_dica: 'Prenda o ar (ESPAÇO) para atravessar a fumaça.',
    sem_nome: '(a última da fila, de mãos sujas de terra) Você também não tem nome.',
    proc_lia: '(uma das crianças, passando) ...Lia.',
    telefone_lia: '(do outro lado da linha, a sua própria voz) Alô? Alô? Tem alguém aí?',
    retrato: '',
    hora: '(no seu ouvido) Nove e quatro.',
    fumaca: '[cheiro de fumaça... e de cera de vela]',
    choro_amb: '[alguém chora baixinho dentro de um armário]',
    ecos: {}
  }, R.sustosMundo || {});
  const LUGARES = { patamar: 'na escada', corr: 'no corredor', dormA: 'no dormitório A', dormB: 'no dormitório B', dormC: 'no dormitório C', dormD: 'no dormitório D', dormE: 'no dormitório E', banhS: 'no banheiro', celeste: 'no quarto da Irmã Celeste', roup: 'na rouparia', brinq: 'aqui do lado, na sala de brinquedos', sotao: 'no depósito' };

  // ---------------------------------------------------------------- memória da partida e utilidades
  const mem = () => {
    const s = S(); const k = s ? [s.code, s.quadro, s.ordem, s.dif].map(v => Array.isArray(v) ? v.join('') : v).join('|') : '-';
    if (!MEMS[k]) MEMS[k] = { mortes: [], usados: {}, correu: 0, correuHora: null, procs: 0, procHora: null, carrinhos: 0, fogos: 0, reflexos: 0, outra: !!lsGet({}).cap5 };
    return MEMS[k];
  };
  const uma = id => { const m = mem(); if (m.usados[id]) return false; m.usados[id] = true; return true; };
  const ja = id => !!mem().usados[id];
  const HORA0 = [20 * 60 + 31, 20 * 60 + 47, 21 * 60, 21 * 60 + 12, 21 * 60 + 31, 21 * 60 + 52];
  const hora = () => { const s = S(); const m = (HORA0[s.chapter] || 1260) + Math.floor((s.capT || 0) / 60); return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`; };
  const ameaca = () => (M.ativo && (M.state === 'caca' || dist2(M.pos, P.pos) < 14)) || !!PROC.fase || ANA.ativa || !!E.chamado;
  const calma = () => { const s = S(); return !ameaca() && s.fear < 55 && !s.hidden && !s.flags.sino; };
  const sala = id => W.salas.find(r => r.id === id);
  const centro = r => ({ x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2 });
  const camas = id => W.lockers.filter(L => L.tipo === 'cama' && E.roomAt(L.x, L.z) && E.roomAt(L.x, L.z).id === id);
  const olhaPara = (x, z, cos = .9) => { const f = fwdH(), vx = x - P.pos.x, vz = z - P.pos.z, l = Math.hypot(vx, vz) || 1; return (f.x * vx + f.z * vz) / l > cos; };
  const esp = v => (v && v.length ? v[0] : null);

  function tex(w, h, fn) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); fn(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
  function redesenhar(t, fn) { const c = t.image, g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); fn(g, c.width, c.height); t.needsUpdate = true; }
  function plano(w, h, mat, x, y, z, ry = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; W.grupo.add(m); return m; }
  function planoEm(par, w, h, mat, x, y, z, ry = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; }
  function noChao(w, h, mat, x, z, y = .014, rz = 0) { const m = plano(w, h, mat, x, y, z); m.rotation.set(-Math.PI / 2, 0, rz); return m; }
  const matT = (t, op = 1, basic = false, extra = {}) => basic ? new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: op, depthWrite: false, ...extra }) : new THREE.MeshStandardMaterial({ map: t, transparent: true, opacity: op, roughness: .92, depthWrite: false, ...extra });
  const matCor = (cor, op = 1) => new THREE.MeshBasicMaterial({ color: cor, transparent: op < 1, opacity: op, depthWrite: op >= 1 });
  const solido = (x0, x1, z0, z1, mesh) => { W.colliders.push({ minX: x0, maxX: x1, minZ: z0, maxZ: z1, on: true }); if (mesh) W.solid.push(mesh); };
  function papelTex(linhas, { w = 256, h = 320, fundo = '#e6e1d3', cor = '#1c1813' } = {}) {
    return tex(w, h, (g) => {
      g.fillStyle = fundo; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(80,60,30,.12)'; for (let i = 0; i < 30; i++) g.fillRect(Math.random() * w, Math.random() * h, rand(4, 30), rand(1, 3));
      g.textAlign = 'center'; g.fillStyle = cor;
      for (const l of linhas) { g.font = `${l.estilo || 'bold'} ${l.tam || 20}px ${l.fonte || 'Georgia'}`; g.fillStyle = l.cor || cor; g.fillText(l.t, w / 2, l.y); }
    });
  }

  // figura simples (criança ou adulto) — só visual
  function figura({ alt = 1.1, cor = 0x0a0908, op = 1, olhos = false, cabelo = null } = {}) {
    const g = new THREE.Group(), m = matCor(cor, op), k = alt / 1.1;
    const corpo = new THREE.Mesh(new THREE.CylinderGeometry(.1 * k, .22 * k, .9 * k, 8), m); corpo.position.y = .45 * k; g.add(corpo);
    const cab = new THREE.Group(); cab.position.y = 1.03 * k; g.add(cab);
    cab.add(new THREE.Mesh(new THREE.SphereGeometry(.12 * k, 10, 8), m));
    if (olhos) for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.014 * k, 6, 5), new THREE.MeshBasicMaterial({ color: olhos === true ? 0xe8e4d8 : olhos })); o.position.set(s * .04 * k, .02 * k, .11 * k); cab.add(o); }
    if (cabelo) { const f = new THREE.Mesh(new THREE.BoxGeometry(.1 * k, .03 * k, .03 * k), new THREE.MeshBasicMaterial({ color: cabelo })); f.position.set(0, .1 * k, -.06 * k); cab.add(f); }
    const braco = new THREE.Group(); braco.position.set(.17 * k, .82 * k, 0); g.add(braco);
    const b = new THREE.Mesh(new THREE.BoxGeometry(.05 * k, .5 * k, .05 * k), m); b.position.y = -.25 * k; braco.add(b);
    const be = new THREE.Group(); be.position.set(-.17 * k, .82 * k, 0); be.add(b.clone()); g.add(be);
    g.userData = { m, cab, braco, be, k }; g.visible = false; W.grupo.add(g); return g;
  }
  const apontar = (g, sim = true) => { g.userData.braco.rotation.x = sim ? -Math.PI / 2 : 0; };
  const virarPara = (g, x, z) => { g.rotation.y = Math.atan2(x - g.position.x, z - g.position.z); };
  const fant = (alt = 1.05, op = .28, cor = 0xbcc8d4) => figura({ alt, cor, op });
  function sentado(cor = 0x0b0a09) { // homem de terno sentado, de costas
    const g = new THREE.Group(), m = matCor(cor);
    E.box(.5, .7, .34, m, 0, .85, 0, g, false); const c = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), m); c.position.y = 1.36; g.add(c);
    E.box(.5, .16, .5, m, 0, .5, .14, g, false); E.box(.08, .12, .08, m, 0, 1.17, 0, g, false);
    g.visible = false; W.grupo.add(g); return g;
  }
  // luz quente (1979, incêndio, lampião)
  let luzQ = null;
  function luzQuente(x, y, z, int, dist = 14) { if (!luzQ || luzQ.parent !== W.grupo) { luzQ = new THREE.PointLight(0xffa850, 0, dist, 1.3); W.grupo.add(luzQ); } luzQ.distance = dist; luzQ.position.set(x, y, z); luzQ.intensity = int; return luzQ; }
  function luzPor(x, y, z, int, dur, dist = 14, tremer = 0) { const l = luzQuente(x, y, z, int, dist); let t = 0; anima(l, dt => { t += dt; l.intensity = t < dur ? int * (1 - tremer * Math.random()) : 0; return t >= dur; }); }
  // partículas (brasa, fumaça, fuligem)
  function particulas(o, { n = 30, cor = 0xff8030, vida = 2, tam = .05, sobe = 1, espalha = 1, aditivo = true, caem = false } = {}) {
    const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), v = [];
    for (let i = 0; i < n; i++) { pos[i * 3] = o.x + rand(-espalha, espalha); pos[i * 3 + 1] = o.y + rand(0, .5); pos[i * 3 + 2] = o.z + rand(-espalha, espalha); v.push([rand(-.2, .2), caem ? -rand(.25, .6) : rand(.3, 1) * sobe, rand(-.2, .2)]); }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: cor, size: tam, transparent: true, depthWrite: false, blending: aditivo ? THREE.AdditiveBlending : THREE.NormalBlending });
    const pts = new THREE.Points(geo, mat); W.grupo.add(pts); let t = 0;
    anima(pts, dt => { t += dt; const a = geo.attributes.position.array; for (let i = 0; i < n; i++) { a[i * 3] += v[i][0] * dt + Math.sin(t * 3 + i) * .003; a[i * 3 + 1] = Math.max(.01, a[i * 3 + 1] + v[i][1] * dt); a[i * 3 + 2] += v[i][2] * dt; } geo.attributes.position.needsUpdate = true; mat.opacity = Math.max(0, 1 - t / vida); if (t > vida) { W.grupo.remove(pts); geo.dispose(); mat.dispose(); return true; } });
    return pts;
  }
  const TX_FUMO = tex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(150,146,140,.7)'); gr.addColorStop(1, 'rgba(120,116,110,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });

  // tela laranja do incêndio (overlay próprio)
  const elFogo = document.createElement('div'); elFogo.id = 'sx2-fogo';
  elFogo.style.cssText = 'position:fixed;inset:0;pointer-events:none;opacity:0;background:radial-gradient(ellipse at 50% 80%,rgba(255,120,30,.45),rgba(160,40,0,.25) 55%,rgba(40,8,0,.5));mix-blend-mode:screen;transition:opacity .08s';
  document.body.appendChild(elFogo);

  // ---------------------------------------------------------------- sons novos (procedurais)
  function crepitar(pos, dur = 2, vol = .3) { som((ac, t) => { for (let i = 0; i < dur * 24; i++) { const at = t + Math.random() * dur, g = E.saida(pos, .4); E.burst(at, .015, 'highpass', rand(1800, 4200), 1, g); E.env(g, at, .001, vol * rand(.3, 1), .02); } const g = E.saida(pos, .5); E.burst(t, dur, 'lowpass', 240, 1, g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol * .7, t + .3); g.gain.exponentialRampToValueAtTime(.0001, t + dur); }); }
  function tosse(pos, crianca = true, n = 3) { som((ac, t) => { for (let i = 0; i < n; i++) { const at = t + i * rand(.22, .32), g = E.saida(pos, .3); E.burst(at, .12, 'bandpass', crianca ? rand(900, 1200) : rand(450, 650), 1.4, g); E.env(g, at, .004, .28, .1); } }); }
  function choro(pos, dur = 3, vol = .06) { for (let i = 0; i < dur / .7; i++) depois(i * .7, () => voz(pos, { f0: rand(380, 460), vogais: [[320, 800], [500, 900], [320, 800]], dur: .55, vol, wet: .2, cai: .8 })); }
  function apito(pos) { som((ac, t) => { for (const [a, d] of [[0, .35], [.5, .8]]) { const g = E.saida(pos, .6), o = ac.createOscillator(); o.frequency.value = 2650; const tr = ac.createOscillator(); tr.frequency.value = 38; const tg = ac.createGain(); tg.gain.value = 140; tr.connect(tg); tg.connect(o.frequency); o.connect(g); E.env(g, t + a, .01, .05, d); o.start(t + a); o.stop(t + a + d + .05); tr.start(t + a); tr.stop(t + a + d + .05); } }); }
  function giz(pos, dur = 1.6) { som((ac, t) => { const g = E.saida(pos, .4); E.burst(t, dur, 'bandpass', 3400, 6, g); g.gain.setValueAtTime(0, t); for (let i = 0; i < dur * 10; i++) g.gain.setValueAtTime(Math.random() < .6 ? rand(.05, .14) : 0, t + i / 10); g.gain.setValueAtTime(0, t + dur); }); }
  function tilintar(pos, n = 3, vol = .05) { som((ac, t) => { for (let i = 0; i < n; i++) { const at = t + i * rand(.08, .3), g = E.saida(pos, .4); E.osc('sine', rand(3000, 4600), at, .3, g); E.env(g, at, .001, vol, .2); } }); }
  function corrente(pos, dur = 1.2) { som((ac, t) => { for (let i = 0; i < dur * 14; i++) { const at = t + Math.random() * dur, g = E.saida(pos, .4); E.osc('square', rand(900, 2100), at, .05, g); E.env(g, at, .001, .02, .04); } }); }
  function cadeado(pos) { som((ac, t) => { const g = E.saida(pos, .4); E.burst(t, .05, 'highpass', 2500, 1, g); E.env(g, t, .001, .5, .05); const g2 = E.saida(pos, .4); E.osc('square', 1800, t + .02, .06, g2); E.env(g2, t + .02, .001, .05, .05); }); }
  function terra(pos, dur = 2) { som((ac, t) => { const g = E.saida(pos, .3); E.burst(t, dur, 'lowpass', 500, 1, g); g.gain.setValueAtTime(0, t); for (let i = 0; i < dur * 12; i++) g.gain.setValueAtTime(rand(.03, .2), t + i / 12); g.gain.setValueAtTime(0, t + dur); }); }
  function gota(pos, vol = .06) { som((ac, t) => { const g = E.saida(pos, .5), o = ac.createOscillator(); o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(600, t + .08); o.connect(g); E.env(g, t, .002, vol, .08); o.start(t); o.stop(t + .12); }); }
  function hino(pos, vol = .022) { const mel = [220, 247, 262, 247, 220, 196, 220]; mel.forEach((f, i) => depois(i * .62, () => voz(pos, { f0: f, vogais: [[350, 820], [400, 900]], dur: .58, vol, wet: .6, cai: 1 }))); }
  function clack(pos) { som((ac, t) => { const g = E.saida(pos, .3); E.burst(t, .04, 'bandpass', 1300, 3, g); E.env(g, t, .001, .35, .04); }); }
  const vozAdulta = (pos, f0 = 200) => voz(pos, { f0, vogais: [[500, 1800], [800, 1200], [400, 2000]], dur: .9, vol: .09, wet: .55 });
  const vozCrianca = (pos, vol = .08, f0) => voz(pos, { f0: f0 || rand(330, 420), vogais: [[500, 1800], [300, 2300], [500, 1800]], dur: .6, vol, wet: .5 });
  const sussurro = (pos, vol = .12, dur = 1) => voz(pos, { sopro: true, vogais: [[300, 2300], [700, 1300], [400, 1900]], dur, vol, wet: .05 });

  // ---------------------------------------------------------------- estado do mapa atual
  let L = {}, ticks = [];
  const tick = fn => ticks.push(seguro(fn));
  const posAnt = new THREE.Vector3(); let paradoT = 0;

  // ================================================================ CONTORNOS DE GIZ (onde você morreu)
  const TX_GIZ = tex(128, 256, (g, w, h) => {
    g.strokeStyle = 'rgba(235,232,220,.85)'; g.lineWidth = 3; g.lineJoin = 'round'; g.beginPath();
    g.ellipse(64, 34, 16, 19, 0, 0, 7); g.moveTo(54, 52); g.lineTo(26, 70); g.lineTo(14, 128); g.moveTo(74, 52); g.lineTo(104, 76); g.lineTo(118, 122);
    g.moveTo(52, 54); g.lineTo(46, 140); g.lineTo(34, 236); g.moveTo(76, 54); g.lineTo(82, 140); g.lineTo(98, 234); g.moveTo(46, 140); g.lineTo(82, 140); g.stroke();
  });
  function contornos() {
    const s = S(), m = mem(), aqui = m.mortes.filter(d => d.mapa === W.mapa && d.cap === s.chapter);
    const grupos = [];
    for (const d of aqui) {
      const g = noChao(.9, 1.8, matT(TX_GIZ, .8, false), d.x, d.z, .016 + grupos.length * .001, d.ang);
      const tt = tex(256, 48, (c) => { c.fillStyle = 'rgba(235,232,220,.85)'; c.font = 'italic 28px "Special Elite",Georgia'; c.textAlign = 'center'; c.fillText(`LIA — ${d.h}`, 128, 34); });
      noChao(.9, .17, matT(tt, .85, false), d.x + Math.cos(d.ang) * .75, d.z - Math.sin(d.ang) * .75, .017, d.ang);
      g.userData.n = aqui.filter(o => Math.hypot(o.x - d.x, o.z - d.z) < 1.5).length; grupos.push(g);
    }
    // na terceira morte no mesmo lugar, um corpo coberto por lençol (some quando você chega perto ou ilumina)
    const tres = aqui.find(d => aqui.filter(o => Math.hypot(o.x - d.x, o.z - d.z) < 1.5).length >= 3);
    if (tres) {
      const c = new THREE.Group(); c.position.set(tres.x, 0, tres.z); c.rotation.y = tres.ang; W.grupo.add(c);
      E.box(.55, .22, 1.7, E.MAT.lencol, 0, .11, 0, c, false); const cab = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), E.MAT.lencol); cab.scale.set(1, .6, 1.1); cab.position.set(0, .16, -.85); c.add(cab);
      L.lencolMorte = c;
      tick(() => { if (!c.visible) return; const d = Math.hypot(P.pos.x - c.position.x, P.pos.z - c.position.z); if (d < 2 || (S().flashOn && d < 7 && E.visivel(c.position, .2, 7) && (L.lmT = (L.lmT || 0) + 1 / 60) > .7)) { c.visible = false; E.SFX.arrastar(); } });
    }
  }

  // ================================================================ ECOS DE 1979 (ficar parada escuta o passado)
  const ECOS = [
    { id: 'cozinha', mapa: 'terreo', x: -29, z: -20, r: 4, txt: '(1979) Colheres batendo nos pratos. Uma voz cansada: “Sopa pra trinta e sete. Quem derramar, fica sem.”', som: p => { for (let i = 0; i < 8; i++) depois(i * .3, () => tilintar(p, 1, .06)); } },
    { id: 'aula', mapa: 'terreo', x: -13, z: -5, r: 4, txt: '(1979) Giz na lousa. Uma freira dita devagar: “Repitam comigo. Quem fala... some.”', som: p => giz(p, 2.2) },
    { id: 'hall', mapa: 'terreo', x: 0, z: -8, r: 3.5, txt: '(1979) Alguém esmurra a porta de um armário de ferro. Um homem conta: “Um. Dois. Três.”', som: p => { for (let i = 0; i < 3; i++) depois(i * .8, () => batida(p, .35)); } },
    { id: 'dormA', mapa: 'superior', x: -8, z: -8, r: 4, txt: '(1979) Cochichos entre as camas: “Apaga, apaga! Ele tá subindo a escada.”', som: p => { sussurro(p, .1, 1.2); depois(1.3, () => sussurro(p, .1, .9)); } },
    { id: 'roup', mapa: 'superior', x: 8, z: -7, r: 4, txt: '(1979) Risadinhas abafadas no meio dos lençóis. E então, silêncio de uma vez.', som: p => { E.SFX.risada(p.x, p.z); } },
    { id: 'cisterna', mapa: 'tuneis', x: 0, z: -36, r: 4.5, txt: '(1979) Alguém desce a escada contando os degraus: “...doze... treze...” e para.', som: p => { for (let i = 0; i < 4; i++) depois(i * .7, () => passoPos({ x: p.x, y: 1, z: p.z + i * .4 }, .35)); } },
    { id: 'secreta', mapa: 'tuneis', x: 0, z: -60, r: 4, txt: '(1979) Uma caneta risca papel. Um homem pigarreia: “Fugitivos. Escreva fugitivos.”', som: p => giz(p, 1.2) },
    { id: 'capela', mapa: 'cemiterio', x: 0, z: -58, r: 5, txt: '(1979) Tosse de criança, muita, no escuro. Mãos pequenas batendo na madeira.', som: p => { tosse(p, true, 5); for (let i = 0; i < 5; i++) depois(.4 + i * .25, () => batida({ x: 0, y: 1, z: -48.4 }, .2)); } }
  ];
  function updateEcos(dt) {
    const s = S();
    const mov = Math.hypot(P.pos.x - posAnt.x, P.pos.z - posAnt.z); posAnt.copy(P.pos);
    if (mov < .01 && P.noiseR === 0 && !s.hidden && !ameaca()) paradoT += dt; else paradoT = 0;
    if (paradoT < 6) return;
    for (const e of ECOS) {
      if (e.mapa !== W.mapa || ja('eco_' + e.id) || Math.hypot(P.pos.x - e.x, P.pos.z - e.z) > e.r) continue;
      uma('eco_' + e.id); paradoT = 0; vacuo(1.2, .25);
      const p = { x: e.x + rand(-1, 1), y: 1.4, z: e.z + rand(-1, 1) };
      depois(1, () => { e.som(p); E.sub('', (T.ecos && T.ecos[e.id]) || e.txt); E.emitNoise(P.pos.x, P.pos.z, 3); });
      break;
    }
  }

  // ================================================================ MUNDO GERAL
  function updateGeral(dt) {
    const s = S(), m = mem();
    // o livro registra quem corre durante a Hora
    if (P.sprinting && s.chapter >= 1) { m.correu += dt; if (m.correu > 10 && !m.correuHora) m.correuHora = hora(); }
    // a Procissão: quantas passaram e a hora da primeira
    if (PROC.fase) L.procViva = true;
    else if (L.procViva) { L.procViva = false; m.procs++; if (!m.procHora) m.procHora = hora(); procAcabou(); }
    // ANA some: um uniforme a mais molhado na rouparia
    if (ANA.ativa) L.anaViva = true; else if (L.anaViva) { L.anaViva = false; if (L.uniformes) molharUniforme(); }
    // o carrinho azul do Tomé rola por baixo da porta antes de ele entrar (só para quem ouviu a fita do Tomé)
    if (s.fitas.f6 && m.carrinhos < 3 && M.ativo && M.state !== 'caca' && !s.hidden && agora() > (L.carT || 0) && !P.room.fora) {
      const rm = E.roomAt(M.pos.x, M.pos.z), d = dist2(M.pos, P.pos);
      if (rm && rm !== P.room && d < 9 && d > 3) {
        const l = W.links.find(l => l.door && !l.door.open && ((l.a === rm.id && l.b === P.room.id) || (l.b === rm.id && l.a === P.room.id)));
        if (l) { L.carT = agora() + 90; m.carrinhos++; carrinho(l.door); }
      }
    }
    // a Irmã Celeste cantarola perto de um esconderijo, quando está tudo calmo
    if (agora() > (L.hinoT || 40) && calma() && s.fear < 25 && !P.room.fora) {
      L.hinoT = agora() + rand(70, 120);
      const arm = W.lockers.filter(o => o.tipo === 'armario' && Math.hypot(o.x - P.pos.x, o.z - P.pos.z) < 5)[0];
      if (arm && Math.random() < .5) { hino({ x: arm.x, y: 1.6, z: arm.z }); if (!ja('hinoLeg')) { uma('hinoLeg'); E.sub('', '[uma mulher cantarola um hino sem letra, bem baixinho, perto do armário]'); } }
    }
    // o livro de ocorrências se escreve sozinho
    if (agora() > (L.livroT || 0)) { L.livroT = agora() + 1; livro(); }
    updateFumaca(dt); updateFogoPorta(dt); updateOutraLia(dt); updateJoaquimArm(dt);
  }
  function carrinho(d) {
    const g = new THREE.Group(); const azul = new THREE.MeshStandardMaterial({ color: 0x1d4fa0, roughness: .5, emissive: 0x081830, emissiveIntensity: .7 });
    E.box(.16, .06, .08, azul, 0, .05, 0, g, false); E.box(.08, .04, .07, azul, -.01, .1, 0, g, false);
    for (const [x, z] of [[-.05, -.045], [.05, -.045], [-.05, .045], [.05, .045]]) { const r = E.cyl(.022, .022, .015, E.MAT.preto, x, .022, z, 8, g); r.rotation.x = Math.PI / 2; }
    g.position.set(d.x, 0, d.z); W.grupo.add(g);
    const alvo = { x: P.pos.x + rand(-.3, .3), z: P.pos.z + rand(-.3, .3) }, ini = { x: d.x, z: d.z }; g.rotation.y = Math.atan2(alvo.x - ini.x, alvo.z - ini.z) - Math.PI / 2;
    let t = 0; rolar({ x: d.x, y: .1, z: d.z }, 1.6);
    anima(g, dt => { t += dt; const k = Math.min(1, t / 1.6), e = 1 - Math.pow(1 - k, 2); g.position.x = lerp(ini.x, alvo.x, e); g.position.z = lerp(ini.z, alvo.z, e); return k >= 1; });
    if (!ja('carLeg')) { uma('carLeg'); depois(1.7, () => E.sub('', '[um carrinho azul de brinquedo rola por baixo da porta até o seu pé]')); }
  }
  // fumaça que só a lanterna mostra (lugares que queimaram em 1979)
  function fumaca(x0, x1, z0, z1, n = 7) {
    const sp = [];
    for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_FUMO, transparent: true, opacity: 0, depthWrite: false })); s.scale.set(rand(1.6, 2.4), rand(1.2, 1.8), 1); s.position.set(rand(x0, x1), rand(1.1, 2), rand(z0, z1)); W.grupo.add(s); sp.push(s); }
    L.fumaca = { sp, tosseT: 0 };
  }
  function updateFumaca(dt) {
    const F = L.fumaca; if (!F) return;
    const s = S(), f = new THREE.Vector3(); camera.getWorldDirection(f);
    let dentro = false;
    for (const sp of F.sp) {
      const v = sp.position.clone().sub(camera.position), d = v.length(); v.normalize();
      const naLuz = s.flashOn && d < 9 && f.dot(v) > Math.cos(.42);
      sp.material.opacity = lerp(sp.material.opacity, naLuz ? .34 : 0, Math.min(1, dt * 4)); sp.material.rotation += dt * .05;
      if (Math.hypot(sp.position.x - P.pos.x, sp.position.z - P.pos.z) < .9) dentro = true;
    }
    F.tosseT -= dt;
    if (dentro && s.flashOn && !E.keys.Space && F.tosseT <= 0 && !s.hidden) {
      F.tosseT = 7; tosse({ x: P.pos.x, y: 1.5, z: P.pos.z }, false, 3); E.sub('lia', T.tosse); E.emitNoise(P.pos.x, P.pos.z, 7);
      if (!ja('dicaTosse')) { uma('dicaTosse'); E.toast(T.tosse_dica); }
    }
  }
  // fogo-fantasma por baixo de uma porta fechada (no máximo duas vezes por partida)
  function updateFogoPorta(dt) {
    const s = S(), m = mem(), F = L.fogo;
    if (F) {
      F.t += dt; const d = Math.hypot(P.pos.x - F.d.x, P.pos.z - F.d.z);
      F.m.material.opacity = F.t < 2.4 ? .55 + Math.sin(F.t * 31) * .2 + Math.random() * .15 : Math.max(0, F.m.material.opacity - dt * 2);
      if (d < 2.2 && !F.perto) { F.perto = true; F.m.visible = false; particulas({ x: P.pos.x, y: 2.6, z: P.pos.z }, { n: 40, cor: 0x1a1612, caem: true, aditivo: false, vida: 3, tam: .03, espalha: 1.4 }); E.sub('', T.fuligem); }
      if (F.t > 4 || F.perto) { if (F.t > 4) W.grupo.remove(F.m); L.fogo = null; }
      return;
    }
    if (m.fogos >= 2 || !['terreo', 'superior'].includes(W.mapa) || !calma() || agora() < (L.fogoProx || 80)) return;
    const d = W.doors.find(d => !d.open && !d.grade && d.id !== 'main' && !(d.trava && d.trava()) && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) > 3.5 && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 8 && olhaPara(d.x, d.z, .85));
    if (!d) { L.fogoProx = agora() + 4; return; }
    m.fogos++; L.fogoProx = agora() + 160;
    const lado = d.eixo === 'x' ? Math.sign(P.pos.z - d.z) || 1 : Math.sign(P.pos.x - d.x) || 1;
    const mat = new THREE.MeshBasicMaterial({ color: 0xff7a20, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const fm = plano(1, .06, mat, d.eixo === 'x' ? d.x : d.x + lado * .05, .03, d.eixo === 'x' ? d.z + lado * .05 : d.z, d.eixo === 'x' ? 0 : Math.PI / 2);
    L.fogo = { d, m: fm, t: 0 };
    crepitar({ x: d.x, y: .6, z: d.z }, 2.4, .25);
    for (let i = 0; i < 3; i++) depois(.3 + i * .55, () => voz({ x: d.x - (d.eixo === 'x' ? 0 : lado) * 2, y: 1.2, z: d.z - (d.eixo === 'x' ? lado : 0) * 2 }, { f0: rand(520, 700), vogais: [[800, 1200], [700, 1100]], dur: .5, vol: .05, wet: .3, cai: .7 }));
  }
  // a outra Lia (só a partir da segunda partida que chegou ao Cap. V)
  let LIA2 = null;
  function outraLia() {
    const g = figura({ alt: 1.68, cor: 0x17120e }); LIA2 = g;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(.5, 3, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, opacity: .07, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    cone.rotation.x = Math.PI / 2; cone.position.set(.18, 1.2, 1.5); g.add(cone);
    return g;
  }
  function updateOutraLia() {
    const s = S(), m = mem();
    if (!m.outra || !LIA2 || L.lia2) return;
    if (W.mapa === 'terreo' && P.room.tipo === 'corredor' && calma() && s.capT > 30 && !ja('outraLia')) {
      const p = fundoCorredor(P.room, 12); if (!p) return;
      uma('outraLia'); L.lia2 = true;
      const r = P.room, para = p.ax === 'x' ? { x: Math.sign(p.x - P.pos.x) > 0 ? r.x1 - .4 : r.x0 + .4, z: p.z } : { x: p.x, z: Math.sign(p.z - P.pos.z) > 0 ? r.z1 - .4 : r.z0 + .4 };
      andarModelo(LIA2, { x: p.x, z: p.z }, para, 1.3, { passo: .6, fim: () => { L.lia2 = false; } });
    }
  }
  // Seu Joaquim aparece no fim do corredor e aponta um armário (uma vez por capítulo; o armário apontado a Procissão não abre)
  let JOAQ = null;
  function joaquim() {
    const g = figura({ alt: 1.7, cor: 0x2b2a1c }); JOAQ = g;
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffb050 })); lamp.position.set(-.3, .75, .15); g.add(lamp);
    const luz = new THREE.PointLight(0xffa040, 0, 7, 1.5); luz.position.copy(lamp.position); g.add(luz); g.userData.luz = luz;
    E.box(.5, .06, .5, matCor(0x1a1910), 0, 1.24, 0, g, false); // chapéu
    return g;
  }
  function mostrarJoaquim(x, z, mirarX, mirarZ, dur = 8, cb) {
    const g = JOAQ; if (!g) return;
    g.position.set(x, 0, z); virarPara(g, mirarX, mirarZ); apontar(g, true); g.visible = true; g.userData.luz.intensity = 2.2;
    let t = 0, luzT = 0;
    anima(g, dt => {
      t += dt; g.userData.luz.intensity = 2 + Math.sin(t * 9) * .3;
      if (S().flashOn && E.visivel(g.position, 1.3, 16)) luzT += dt;
      const d = Math.hypot(P.pos.x - g.position.x, P.pos.z - g.position.z);
      if (luzT > .5 || t > dur || d < 4 || L.raioSome) { g.visible = false; g.userData.luz.intensity = 0; L.raioSome = false; E.SFX.estatica(.2); if (cb) cb(); return true; }
    });
  }
  function updateJoaquimArm() {
    const s = S();
    if (!JOAQ || JOAQ.visible || !['terreo', 'superior'].includes(W.mapa) || s.chapter < 1 || s.chapter > 3 || P.room.tipo !== 'corredor' || s.capT < 45 || !calma() || ja('joaqArm' + s.chapter)) return;
    const p = fundoCorredor(P.room, 10); if (!p) return;
    const arm = W.lockers.filter(o => o.tipo === 'armario' && !o.sxOcupado && Math.hypot(o.x - p.x, o.z - p.z) < 7 && Math.hypot(o.x - P.pos.x, o.z - P.pos.z) > 4).sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z))[0];
    if (!arm) return;
    uma('joaqArm' + s.chapter); arm.sxJoaquim = true;
    mostrarJoaquim(p.x, p.z, arm.x, arm.z, 7, () => { if (!ja('joaqFala')) { uma('joaqFala'); E.sub('lia', T.joaquim_arm); } });
  }
  function molharUniforme() { const u = L.uniformes && L.uniformes.find(u => !u.molhado); if (!u) return; u.molhado = true; u.m.material = u.m.material.clone(); u.m.material.color.setHex(0x1c222c); u.m.material.roughness = .35; }
  function procAcabou() {
    const s = S();
    if (L.uniformes) molharUniforme();
    if (s.hidden && s.hidden.sxJoaquim && !ja('joaqProc')) { uma('joaqProc'); depois(1.5, () => E.sub('joaquim', T.joaquim_proc)); }
  }

  // ================================================================ LIVRO DE OCORRÊNCIAS
  const N2 = R.notas.find(n => n.id === 'n2'); const N2BASE = N2 ? N2.texto : '';
  function livro() {
    if (!N2) return;
    const m = mem(), extra = [];
    if (m.procHora) extra.push(T.livro_proc.replace('{h}', m.procHora));
    if (m.correuHora) extra.push(T.livro_correu.replace('{h}', m.correuHora));
    const morte = m.mortes.find(d => d.cap >= 1 && d.cap <= 2); if (morte) extra.push(T.livro_morte.replace('{h}', morte.h));
    N2.texto = extra.length ? N2BASE + '\n\n' + extra.join('\n') : N2BASE;
  }

  // ================================================================ ESTRADA (prólogo)
  function montarEstrada() {
    const s = S();
    const tx = tex(256, 340, (g, w, h) => {
      g.fillStyle = '#ece8dc'; g.fillRect(0, 0, w, h); g.fillStyle = '#16120e'; g.textAlign = 'center';
      g.font = 'bold 30px Georgia'; g.fillText('DESAPARECIDA', w / 2, 40); g.font = 'bold 22px Georgia'; g.fillText('— 1994 —', w / 2, 68);
      g.fillStyle = '#4a4640'; g.fillRect(68, 84, 120, 140); g.fillStyle = '#16120e'; g.beginPath(); g.ellipse(128, 136, 26, 32, 0, 0, 7); g.fill(); g.fillRect(88, 168, 80, 56);
      g.fillStyle = '#16120e'; g.font = 'bold 22px Georgia'; g.fillText('Lia Moraes, 29 anos', w / 2, 256);
      g.font = 'italic 16px Georgia'; g.fillText('Vista pela última vez', w / 2, 284); g.fillText('na estrada velha.', w / 2, 304);
    });
    const c = plano(.34, .45, new THREE.MeshStandardMaterial({ map: tx, roughness: .95 }), 14.25, 1.6, -13.11, Math.PI); c.visible = false;
    L.cartaz = { m: c, e: 0, fora: 0, x: 14.25 };
    E.interact(c, () => L.cartaz.e === 1 ? '<b>E</b>Arrancar o cartaz com o seu nome' : T.cartaz_label, seguro(() => {
      const C = L.cartaz; if (C.e !== 1) return;
      C.e = 2; E.SFX.papel(); E.sub('lia', T.cartaz_arranca); let t = 0;
      anima(c, dt => { t += dt; const k = Math.min(1, t / .7); c.position.y = lerp(1.6, .02, k * k); c.position.z = -13.11 - k * .35; c.rotation.x = -Math.PI / 2 * k; return k >= 1; });
    }));
    tick(dt => {
      const C = L.cartaz;
      if (C.e === 0 && s.inv.chaves.portao && P.room.id !== 'posto') { C.e = 1; c.visible = true; }
      if (C.e === 2) {
        const v = E.visivel({ x: C.x, z: -13.2 }, 1.6, 14) || E.visivel({ x: C.x, z: -13.5 }, .1, 14);
        C.fora = v ? 0 : C.fora + dt;
        if (C.fora > .8 && Math.hypot(P.pos.x - C.x, P.pos.z + 13.4) > 1.2) { C.e = 3; c.position.set(C.x, 1.6, -13.11); c.rotation.set(0, Math.PI, 0); }
      } else if (C.e === 3 && E.visivel({ x: C.x, z: -13.15 }, 1.6, 10)) { C.e = 4; E.SFX.estalo({ x: C.x, z: -13.2 }, .4); s.fear = Math.min(100, s.fear + 8); depois(.4, () => E.sub('lia', T.cartaz_volta)); }
    });
  }

  // ================================================================ TÉRREO
  function montarTerreo() {
    const s = S();
    // --- chamada no refeitório (Cap. II): ficar quieta quando chamarem o seu nome
    tick(() => {
      if (s.chapter !== 2 || P.room.id !== 'refeit' || ja('chamadaR') || !calma()) return;
      uma('chamadaR'); const c = centro(sala('refeit')), pf = { x: c.x, y: 1.7, z: c.z - 3 };
      let t = .6; vacuo(.8, .3);
      for (const n of T.chamada_nomes) { const at = t; depois(at, () => { E.sub('celeste', n); vozAdulta(pf); }); depois(at + 1.3, () => { E.sub('', T.chamada_presente); vozCrianca({ x: c.x + rand(-6, 6), y: 1, z: c.z + rand(-4, 4) }); }); t += 2.8; }
      for (const n of T.chamada_mortos) { const at = t; depois(at, () => { E.sub('celeste', n); vozAdulta(pf); }); t += 3.2; }
      depois(t, () => { E.sub('celeste', T.chamada_lia); vozAdulta(pf); L.chamada = { ate: agora() + 3.8 }; });
    });
    tick(() => {
      const C = L.chamada; if (!C) return;
      if (P.noiseR > 1.5 || P.sprinting) {
        L.chamada = null; marcarForte(); E.SFX.susto(); E.sub('inspetor', T.chamada_presente_ele);
        const c = centro(sala('refeit')); voz({ x: c.x, y: 2, z: c.z }, { f0: 92, vogais: [[300, 870], [320, 800]], dur: 1.1, vol: .16, cai: .85 });
        E.emitNoise(P.pos.x, P.pos.z, 24);
      } else if (agora() > C.ate || ameaca()) { L.chamada = null; if (!ameaca()) E.sub('celeste', T.chamada_falta); }
    });
    // --- o diretor fuma na diretoria (Cap. II)
    const msD = (W.spots.diret && W.spots.diret.mesa) || [], mesa = msD.length > 3 ? msD[msD.length - 1] : msD[0] ? { x: msD[0].x - .3, y: msD[0].y, z: msD[0].z + .15 } : null, rd = sala('diret');
    if (mesa && rd) {
      const c = centro(rd), vx = c.x - mesa.x, vz = c.z - mesa.z, l = Math.hypot(vx, vz) || 1;
      const dir = sentado(); dir.position.set(mesa.x + vx / l * .75, 0, mesa.z + vz / l * .75); dir.rotation.y = Math.atan2(-vx, -vz);
      const brasa = new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 5), new THREE.MeshBasicMaterial({ color: 0xff4a10 })); brasa.position.set(mesa.x, (mesa.y || .8) + .015, mesa.z); brasa.visible = false; W.grupo.add(brasa);
      L.dir = { g: dir, brasa, luzT: 0, fumoT: 0 };
      tick(dt => {
        const D = L.dir;
        if (!D.g.visible && !D.foi && s.chapter === 2 && P.room.id === 'diret' && calma() && !ja('diretorFuma')) { uma('diretorFuma'); D.g.visible = true; brasa.visible = true; }
        if (D.g.visible) {
          const d = Math.hypot(P.pos.x - D.g.position.x, P.pos.z - D.g.position.z);
          if (s.flashOn && E.visivel(D.g.position, 1.2, 9)) D.luzT += dt;
          D.fumoT -= dt; if (D.fumoT <= 0) { D.fumoT = .5; particulas({ x: D.g.position.x, y: 1.5, z: D.g.position.z }, { n: 5, cor: 0x8a8680, aditivo: false, vida: 2.5, tam: .06, sobe: .5, espalha: .08 }); }
          if (d < 2.3 || D.luzT > .5) { D.g.visible = false; D.foi = true; particulas({ x: D.g.position.x, y: 1, z: D.g.position.z }, { n: 60, cor: 0x7a7670, aditivo: false, vida: 2.2, tam: .07, sobe: .6, espalha: .35 }); E.SFX.suspiro && E.SFX.suspiro(D.g.position); depois(1, () => E.sub('lia', T.diretor_fuma)); }
        }
        if (D.foi && brasa.visible && P.room.id === 'diret') { D.fumoT -= dt; if (D.fumoT <= 0) { D.fumoT = .7; particulas({ x: brasa.position.x, y: brasa.position.y, z: brasa.position.z }, { n: 3, cor: 0x9a968e, aditivo: false, vida: 2.4, tam: .04, sobe: .4, espalha: .02 }); } }
      });
    }
    // --- pátio cheio de crianças no relâmpago (Cap. II) e o refeitório de 1979
    const patio = new THREE.Group(); patio.visible = false; W.grupo.add(patio);
    for (let i = 0; i < 26; i++) { const f = figura({ alt: rand(.95, 1.25), cor: 0x050505 }); W.grupo.remove(f); f.visible = true; f.position.set(rand(-12, 12), 0, rand(4.5, 14.5)); f.rotation.y = Math.PI + rand(-.2, .2); patio.add(f); }
    L.patio = patio;
    const r79 = new THREE.Group(); r79.visible = false; W.grupo.add(r79);
    const mesas = (W.spots.refeit && W.spots.refeit.mesa) || [];
    for (const p of mesas.slice(0, 10)) { const f = figura({ alt: .85, cor: 0xffd8a8, op: .3 }); W.grupo.remove(f); f.visible = true; f.position.set(p.x + rand(-.3, .3), 0, p.z + .55); f.rotation.y = Math.PI; r79.add(f); }
    { const rr = sala('refeit'), c = centro(rr), alto = figura({ alt: 1.95, cor: 0x1a1006, op: .7, olhos: true }); W.grupo.remove(alto); alto.visible = true; alto.position.set(c.x, 0, c.z); r79.add(alto); }
    L.r79 = r79;
    // --- Seu Joaquim no pátio, debaixo da chuva, depois dos fusíveis (Cap. I)
    joaquim();
    tick(() => {
      if (s.chapter !== 1 || s.done.gerador || !(s.inv.fusiveis > 0 || s.done.fusiveis) || P.room.id !== 'hall' || fwdH().z < .55 || JOAQ.visible || ja('joaqPatio')) return;
      uma('joaqPatio'); mostrarJoaquim(2.5, 8.5, 30, -20, 9); depois(1.4, () => E.sub('lia', T.joaquim_patio));
    });
    // --- o Davi no espelho do banheiro de baixo (Cap. I e II)
    const espM = new THREE.MeshStandardMaterial({ color: 0x2c3438, metalness: .9, roughness: .12 });
    const esp1 = plano(.62, .82, espM, 23.95, 1.6, -15.6, -Math.PI / 2);
    E.box(.04, .9, .7, E.MAT.madeiraEsc, 23.99, 1.6, -15.6, W.grupo, false);
    const txB = tex(128, 180, () => {}), menino = plano(.62, .82, matT(txB, 0, true), 23.935, 1.6, -15.6, -Math.PI / 2);
    const desenhaB = (k, aponta) => redesenhar(txB, (g, w, h) => {
      const cx = 74, cy = 100; g.fillStyle = 'rgba(12,12,14,.92)'; g.beginPath(); g.ellipse(cx, cy - 32 * k, 13 * k, 15 * k, 0, 0, 7); g.fill(); g.fillRect(cx - 15 * k, cy - 16 * k, 30 * k, 70 * k);
      g.fillStyle = 'rgba(220,214,200,.55)'; g.fillRect(cx - 6 * k, cy - 34 * k, 3 * k, 2 * k); g.fillRect(cx + 3 * k, cy - 34 * k, 3 * k, 2 * k);
      if (aponta) { g.fillStyle = 'rgba(12,12,14,.92)'; g.fillRect(cx - 62 * k, cy - 10 * k, 50 * k, 7 * k); }
    });
    L.espB = { m: menino, f: 0, v: false };
    tick(() => {
      const B = L.espB; if (B.f >= 9 || P.room.id !== 'banh' || s.chapter < 1 || s.chapter > 2) return;
      const v = s.flashOn && E.visivel(esp1.position, 1.6, 6);
      if (v && !B.v) { B.v = true; if (B.f === 0) { desenhaB(.6, false); menino.material.opacity = .8; B.f = 1; } else if (B.f === 2) { desenhaB(1.05, true); menino.material.opacity = .85; B.f = 3; respiracao(atras(.6), 1.4, false, .5); marcarForte(); } else if (B.f === 4) { B.f = 9; for (let i = 0; i < 7; i++) depois(i * .16, () => passoPos({ x: 20 + i * 1.3, y: .1, z: -12 }, .5, true)); } }
      else if (!v && B.v) { B.v = false; if (B.f === 1 || B.f === 3) { B.f++; menino.material.opacity = 0; } }
    });
    // --- a foto instantânea na cama da enfermaria (Cap. II)
    const cm = camas('enferm')[0];
    if (cm) {
      const tf = tex(96, 116, (g, w, h) => { g.fillStyle = '#ece8dc'; g.fillRect(0, 0, w, h); g.fillStyle = '#16181a'; g.fillRect(6, 6, w - 12, 84); g.fillStyle = '#2a2c2a'; g.beginPath(); g.moveTo(36, 90); g.lineTo(60, 90); g.lineTo(50, 30); g.lineTo(46, 30); g.fill(); g.fillStyle = '#c8c0a8'; g.fillRect(46, 52, 4, 10); g.beginPath(); g.arc(48, 49, 3, 0, 7); g.fill(); g.fillStyle = '#333'; g.font = 'italic 11px Georgia'; g.textAlign = 'center'; g.fillText('17/03/94', w / 2, 106); });
      const foto = noChao(.13, .16, new THREE.MeshStandardMaterial({ map: tf, roughness: .6 }), cm.x + .1, cm.z + .1, .68, .5);
      foto.visible = false; tick(() => { if (!ja('polaroid')) foto.visible = s.chapter >= 2; });
      E.interact(foto, () => T.polaroid_label, seguro(() => {
        if (!foto.visible) return; uma('polaroid'); foto.visible = false; E.SFX.papel();
        E.sub('lia', T.polaroid[0]); depois(4, () => E.sub('lia', T.polaroid[1]));
        const d = W.doors.filter(d => !d.open && !d.grade && d.id !== 'main' && !(d.trava && d.trava())).sort((a, b) => Math.hypot(a.x - P.pos.x, a.z - P.pos.z) - Math.hypot(b.x - P.pos.x, b.z - P.pos.z))[0];
        if (d && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 14) depois(5.5, () => abrirDevagar(d, -1.1, 4));
      }));
    }
    // --- fumaça que a lanterna mostra no fim do corredor leste (a ala que pegou fogo)
    fumaca(26, 33, -13.6, -10.4, 6);
  }
  function eco1979Badalada(n) { // cada badalada: o corredor pisca para 1979 (na nona, demora e ele vira a cabeça)
    const s = S(); if (W.mapa !== 'terreo' || P.room.fora || s.dead) return;
    const f = fwdH(), nona = n === 8, dur = nona ? 1 : .3;
    luzPor(P.pos.x + f.x * 3, 2.7, P.pos.z + f.z * 3, 7, dur, 16);
    if (!L.b79) { L.b79 = [0, 1, 2].map(() => figura({ alt: 1.05, cor: 0xe8dcc0, op: .32, olhos: 0x111111 })); L.b79m = figura({ alt: 1.95, cor: 0x140c06, op: .85, olhos: true }); }
    L.b79.forEach((g, i) => { const d = 3.5 + i * 1.8, lado = (i % 2 ? 1 : -1) * .9, x = P.pos.x + f.x * d + f.z * lado, z = P.pos.z + f.z * d - f.x * lado; if (E.roomAt(x, z) !== P.room) return; g.position.set(x, 0, z); virarPara(g, P.pos.x, P.pos.z); g.visible = true; depois(dur, () => { g.visible = false; }); });
    if (nona) {
      const g = L.b79m, x = P.pos.x + f.x * 9, z = P.pos.z + f.z * 9;
      if (E.roomAt(x, z) === P.room) { g.position.set(x, 0, z); virarPara(g, P.pos.x, P.pos.z); g.rotation.y += Math.PI; g.userData.cab.rotation.y = 0; g.visible = true; let t = 0; anima(g, dt => { t += dt; g.userData.cab.rotation.y = Math.min(Math.PI, t * 4.2); if (t > dur) { g.visible = false; g.userData.cab.rotation.y = 0; return true; } }); }
    }
  }

  // ================================================================ ANDAR DE CIMA
  function montarSuperior() {
    const s = S(), m = mem();
    // --- a chamada no Dormitório B (Cap. III)
    tick(() => {
      if (s.chapter !== 3 || P.room.id !== 'dormB' || ja('chamadaB') || !calma()) return;
      uma('chamadaB'); const c = centro(sala('dormB')); let t = .5;
      for (const [nome, resp] of T.chamadaB) {
        const at = t; depois(at, () => { E.sub('moacir', nome); vozAdulta({ x: -3.5, y: 1.7, z: -20 }, 150); });
        if (resp === 'presente') depois(at + 1.3, () => { E.sub('', T.chamada_presente); vozCrianca({ x: c.x + rand(-3, 3), y: .9, z: c.z + rand(-3, 3) }); });
        if (resp === 'lia') depois(at + 1.6, () => { E.sub('', T.chamadaB_lia); vozCrianca(atras(.6), .1, 300); respiracao(atras(.5), 1.4, false, .5); marcarForte(); P.shake = Math.max(P.shake, .04); });
        t += resp ? 3 : 2.6;
      }
    });
    // --- a cama que agora tem o nome da Lia (depois da brincadeira da Ana)
    const dD = camas('dormD').sort((a, b) => Math.hypot(a.x - 3, a.z + 19.14) - Math.hypot(b.x - 3, b.z + 19.14))[0];
    if (dD) {
      const tl = tex(128, 48, (g, w, h) => { g.fillStyle = '#d8d0b8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3a2a1a'; g.strokeRect(3, 3, w - 6, h - 6); g.fillStyle = '#1a120c'; g.font = 'bold 19px Georgia'; g.textAlign = 'center'; g.fillText('LIA MORAES', w / 2, 31); });
      const px = dD.ao === 'x' ? dD.x - .95 : dD.x, pz = dD.ao === 'x' ? dD.z : dD.z - .95;
      const pl = plano(.32, .12, new THREE.MeshStandardMaterial({ map: tl, roughness: .7 }), px, .78, pz, dD.ao === 'x' ? Math.PI / 2 : 0);
      const aberto = E.box(dD.ao === 'x' ? .5 : .82, .05, dD.ao === 'x' ? .82 : .5, E.MAT.lencol, dD.ao === 'x' ? dD.x + .45 : dD.x, .69, dD.ao === 'x' ? dD.z : dD.z + .45, W.grupo, false);
      aberto.rotation.set(dD.ao === 'x' ? 0 : .25, 0, dD.ao === 'x' ? -.25 : 0);
      pl.visible = aberto.visible = false; L.camaLia = { L: dD, pl, aberto };
      tick(() => { const C = L.camaLia; if (!C.pl.visible && s.done.ana && !E.visivel({ x: C.L.x, z: C.L.z }, .7, 30)) C.pl.visible = C.aberto.visible = true; });
    }
    // --- armários do corredor de cima: "LIA M." riscado e o número 12
    const armLia = W.lockers.find(o => o.tipo === 'armario' && Math.abs(o.x - 2.55) < .1 && Math.abs(o.z + 38) < .1);
    const arm12 = W.lockers.find(o => o.tipo === 'armario' && Math.abs(o.x + 2.55) < .1 && Math.abs(o.z + 14) < .1);
    const rotulo = (A, tx, w, h, y) => plano(w, h, new THREE.MeshStandardMaterial({ map: tx, transparent: true, roughness: .8 }), A.x + A.face[0] * .345, y, A.z + A.face[1] * .345, Math.atan2(A.face[0], A.face[1]));
    if (armLia) {
      rotulo(armLia, tex(128, 64, (g) => { g.strokeStyle = 'rgba(210,200,170,.9)'; g.lineWidth = 2; g.font = 'bold 30px Georgia'; g.textAlign = 'center'; g.strokeText('LIA M.', 64, 42); for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(rand(10, 118), rand(8, 56)); g.lineTo(rand(10, 118), rand(8, 56)); g.lineWidth = .7; g.stroke(); } }), .4, .2, 1.3);
      for (let i = 0; i < 6; i++) { const lasca = E.box(rand(.02, .05), .006, rand(.008, .02), E.MAT.madeira, armLia.x + armLia.face[0] * rand(.45, .8), .004, armLia.z + rand(-.3, .3), W.grupo, false); lasca.rotation.y = rand(0, 3); }
      armLia.sxLia = true;
    }
    if (arm12) { rotulo(arm12, tex(64, 64, (g) => { g.fillStyle = 'rgba(230,224,200,.85)'; g.font = 'bold 40px Georgia'; g.textAlign = 'center'; g.fillText('12', 32, 46); }), .16, .16, 1.85); arm12.sx12 = true; }
    tick(dt => {
      const H = s.hidden;
      if (H && H.sxLia && !ja('armLia')) {
        L.liaT = (L.liaT || 0) + dt; L.riscoT = (L.riscoT || 0) - dt;
        if (L.riscoT <= 0) { L.riscoT = 1.2; arranhao({ x: H.x, y: 1.2, z: H.z }, .25); if (!L.riscoLeg) { L.riscoLeg = true; E.sub('', T.lia_arm_risco); } }
        if (L.liaT > 8) { uma('armLia'); E.sub('davi', T.lia_arm); sussurro({ x: H.x, y: 1.6, z: H.z }, .14, 1.1); marcarForte(); }
      } else if (!H) L.liaT = 0;
      if (H && H.sx12 && !ja('arm12')) {
        L.t12 = (L.t12 || 0) + dt;
        if (L.t12 > 1.5 && !L.f12) { L.f12 = true; E.sub('moacir', T.arm12); sussurro({ x: H.x, y: 1.5, z: H.z }, .14, 1.4); E.toast(T.arm12_dica); }
        if (L.f12) { L.r12 = (L.r12 || 0) - dt; if (L.r12 <= 0) { L.r12 = 1; if (!E.keys.Space) { E.emitNoise(H.x, H.z, 3.5); s.fear = Math.min(100, s.fear + 5); E.SFX.ofego && E.SFX.ofego(); } } if (L.t12 > 5.5) uma('arm12'); }
      } else if (!H) L.t12 = 0;
    });
    // --- a cama da Ana (A.L.P.): por baixo, o estrado coberto de olhos
    const bA = camas('dormB').sort((a, b) => Math.hypot(b.x + 3, b.z + 20) - Math.hypot(a.x + 3, a.z + 20))[0];
    if (bA) {
      const tl = tex(128, 64, (g) => { g.fillStyle = '#4a2c1c'; g.fillRect(0, 0, 128, 64); g.strokeStyle = '#b8a888'; g.lineWidth = 3; g.font = 'bold 30px Georgia'; g.textAlign = 'center'; g.strokeText('A.L.P.', 64, 44); });
      plano(.42, .2, new THREE.MeshStandardMaterial({ map: tl, roughness: .8 }), bA.ao === 'x' ? bA.x - .96 : bA.x, .72, bA.ao === 'x' ? bA.z : bA.z - .96, bA.ao === 'x' ? Math.PI / 2 : 0);
      const olhos = (fixos) => tex(256, 512, (g, w, h) => {
        g.fillStyle = '#3a3226'; g.fillRect(0, 0, w, h);
        for (let i = 0; i < 260; i++) { const x = rand(8, w - 8), y = rand(8, h - 8), r = rand(5, 11); g.strokeStyle = 'rgba(20,16,10,.85)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, r, r * .55, 0, 0, 7); g.stroke(); const a = fixos ? Math.atan2(h / 2 - y, w / 2 - x) : rand(0, 7), k = fixos ? .1 : .5; g.fillStyle = 'rgba(14,10,6,.95)'; g.beginPath(); g.arc(x + Math.cos(a) * r * k, y + Math.sin(a) * r * .5 * k, r * .3, 0, 7); g.fill(); }
      });
      const tA = olhos(false), tB = olhos(true);
      const est = new THREE.Mesh(new THREE.PlaneGeometry(bA.ao === 'x' ? 1.9 : .8, bA.ao === 'x' ? .8 : 1.9), new THREE.MeshBasicMaterial({ map: tA, color: 0x8a8070 })); est.rotation.x = Math.PI / 2; est.position.set(bA.x, .355, bA.z); est.visible = false; W.grupo.add(est);
      L.alp = { L: bA, est, tA, tB, n: 0 };
    }
    // --- a cama do Davi (dormitório A): o cobertor de retalhos ainda está quente
    const cDavi = camas('dormA').sort((a, b) => b.z - a.z)[1];
    if (cDavi) {
      const tr = tex(128, 128, (g) => { const cs = ['#7a2a22', '#2a4a6a', '#6a6a2a', '#4a2a5a', '#8a6a3a', '#2a5a3a']; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = cs[(x * 3 + y * 5) % cs.length]; g.fillRect(x * 32, y * 32, 32, 32); g.strokeStyle = '#d8d0b8'; g.setLineDash([3, 3]); g.strokeRect(x * 32 + 2, y * 32 + 2, 28, 28); } });
      const cob = E.box(cDavi.ao === 'x' ? 1.1 : .84, .03, cDavi.ao === 'x' ? .84 : 1.1, new THREE.MeshStandardMaterial({ map: tr, roughness: .95 }), cDavi.ao === 'x' ? cDavi.x + .35 : cDavi.x, .675, cDavi.ao === 'x' ? cDavi.z : cDavi.z + .35, W.grupo, false);
      L.camaDavi = { L: cDavi, cob, prot: 0 };
      tick(dt => {
        const C = L.camaDavi; if (C.prot <= 0) return;
        C.prot -= dt; s.flashOn = false;
        if (M.ativo && M.state !== 'caca' && dist2(M.pos, P.pos) < 7 && (M.state === 'procura' || M.state === 'investiga')) { E.patrulhar(); M.wait = 0; }
      });
    }
    // --- bolinha de gude que rola pelo corredor de cima (pisar nela estala)
    tick(() => {
      if (s.chapter !== 3 || P.room.id !== 'corr' || s.capT < 25 || !calma() || L.gude || ja('gude')) return;
      const p = fundoCorredor(P.room, 9); if (!p) return;
      uma('gude');
      const b = new THREE.Mesh(new THREE.SphereGeometry(.018, 10, 8), new THREE.MeshStandardMaterial({ color: 0x8fc0d0, roughness: .05, metalness: .2, transparent: true, opacity: .8, emissive: 0x10303a, emissiveIntensity: .8 }));
      b.position.set(p.x, .018, p.z); W.grupo.add(b); const f = fwdH(), alvo = { x: P.pos.x + f.x * .6, z: P.pos.z + f.z * .6 }, ini = { x: p.x, z: p.z };
      const tot = Math.hypot(alvo.x - ini.x, alvo.z - ini.z), dur = tot / 2.6; let t = 0, tinT = 0;
      L.gude = { m: b, parou: false };
      anima(b, dt => { t += dt; const k = Math.min(1, t / dur), e = 1 - Math.pow(1 - k, 1.6); b.position.x = lerp(ini.x, alvo.x, e); b.position.z = lerp(ini.z, alvo.z, e); b.rotation.x += dt * 30 * (1 - k); tinT -= dt; if (tinT <= 0 && k < 1) { tinT = .22; tilintar(b.position, 1, .03 + k * .04); } if (k >= 1) { L.gude.parou = true; return true; } });
    });
    tick(() => {
      const G = L.gude; if (!G || !G.parou || !G.m.parent) return;
      if (Math.hypot(P.pos.x - G.m.position.x, P.pos.z - G.m.position.z) < .32 && P.noiseR > 1.5) { W.grupo.remove(G.m); E.SFX.vidro(G.m.position.x, G.m.position.z); E.emitNoise(G.m.position.x, G.m.position.z, 9); E.sub('', T.gude); }
    });
    // --- amarelinha de giz: cada casa pisada, a Ana conta; a décima chama ela
    const tAm = tex(128, 1024, (g, w, h) => { g.strokeStyle = 'rgba(232,228,214,.75)'; g.lineWidth = 4; g.fillStyle = 'rgba(232,228,214,.8)'; g.font = 'bold 44px Georgia'; g.textAlign = 'center'; for (let i = 0; i < 10; i++) { const y = h - (i + 1) * 102; g.strokeRect(14, y + 4, w - 28, 94); g.fillText(String(i + 1), w / 2, y + 68); } });
    noChao(1.2, 8, matT(tAm, .85, false), 0, -20, .015);
    L.amar = { ult: -1, feita: false };
    tick(() => {
      const A = L.amar; if (A.feita || s.chapter !== 3 || P.room.id !== 'corr') return;
      if (Math.abs(P.pos.x) > .6 || P.pos.z > -16 || P.pos.z < -24) return;
      const i = clamp(Math.floor((-16 - P.pos.z) / .8), 0, 9);
      if (i === A.ult) return;
      if (i === 0) A.ult = 0; else if (i === A.ult + 1) A.ult = i; else { A.ult = -9; return; } E.SFX.contagem({ x: rand(-2, 2), z: P.pos.z - 3 }, i);
      if (i === 9) { A.feita = true; depois(.8, () => { E.sub('ana', T.amarelinha_fim); sussurro(atras(.5), .14, .7); marcarForte(); if (W.def.ana && W.def.ana() && !ANA.ativa) s.timers.ana = Math.min(s.timers.ana, 1.5); }); }
    });
    // --- telefone de lata na sala de brinquedos
    const lata = new THREE.Group(); lata.position.set(14.82, 1.05, -26.6); W.grupo.add(lata);
    E.cyl(.04, .04, .1, E.MAT.metal, 0, 0, 0, 10, lata); const fio = E.box(.006, .006, 1.2, E.MAT.papel, .05, .06, -.6, lata, false); fio.rotation.y = .1;
    L.lata = { n: 0 };
    E.interact(lata, () => L.lata.n === 0 ? T.lata_label : L.lata.n === 1 ? T.lata_puxar : 'Uma lata amassada, sem barbante.', seguro(() => {
      const C = L.lata;
      if (C.n === 0) {
        C.n = 1; respiracao({ x: 14.8, y: 1.1, z: -26.6 }, 1.8, false, .35);
        const r = M.ativo ? E.roomAt(M.pos.x, M.pos.z) : null;
        depois(1.9, () => { E.sub('davi', r && LUGARES[r.id] ? T.lata_fala.replace('{onde}', LUGARES[r.id]) : T.lata_longe, true); sussurro({ x: 14.8, y: 1.1, z: -26.6 }, .1, 1.6); });
      } else if (C.n === 1) {
        C.n = 2; fio.visible = false; E.SFX.arrastar(); E.SFX.metal && E.SFX.metal(.8); P.shake = Math.max(P.shake, .05);
        let t = 0; anima(lata, dt => { t += dt; lata.position.x = Math.min(14.97, lata.position.x + dt * 3); lata.rotation.z += dt * 12; return t > .25; });
        E.emitNoise(14.8, -26.6, 7); E.sub('', T.lata_puxa);
      }
    }));
    // --- a sala de brinquedos conta com blocos, cada vez que você vira as costas
    const BL = [];
    for (let i = 0; i < 10; i++) {
      const tn = tex(64, 64, (g) => { g.fillStyle = ['#8a2a1a', '#2a5a8a', '#8a7a1a', '#2a7a3a'][i % 4]; g.fillRect(0, 0, 64, 64); g.fillStyle = '#e8e0c8'; g.font = 'bold 40px Georgia'; g.textAlign = 'center'; g.fillText(String(i + 1), 32, 46); });
      const b = E.box(.2, .2, .2, new THREE.MeshStandardMaterial({ map: tn, roughness: .8 }), 6.2 + i * .42, .1, -24.6, W.grupo, false); b.rotation.y = rand(-.15, .15); b.visible = i === 0; BL.push(b);
    }
    L.blocos = { BL, n: 1, fora: 0, pend: false };
    tick(dt => {
      const B = L.blocos; if (B.n >= 10 || s.done.caixinha || s.chapter !== 3 || P.room.id !== 'brinq') return;
      const v = E.visivel({ x: 8.1, z: -24.6 }, .15, 16) || E.visivel({ x: 6.4, z: -24.6 }, .15, 16) || E.visivel({ x: 9.9, z: -24.6 }, .15, 16);
      if (!v) { B.fora += dt; if (B.fora > 1.3) B.pend = true; } else { B.fora = 0; if (B.pend) { B.pend = false; BL[B.n].visible = true; B.n++; clack({ x: 6.2 + B.n * .42, y: .2, z: -24.6 }); if (B.n >= 10) { E.SFX.caixinha(8.5, -26); depois(1.2, () => E.sub('ana', T.blocos)); marcarForte(); } } }
    });
    // --- rouparia: cabides com nome, três sempre vazios; a cada aparição, um uniforme a mais molhado
    const NOMES = ['BENEDITO A.', 'DAVI M.', 'CARLA S.', 'JORGE L.', 'ANA L. P.', 'MARTA F.', 'TOMÉ R.', 'PAULO N.'];
    E.cyl(.015, .015, 4.6, E.MAT.metal, 12.7, 1.95, -7.3, 6, W.grupo).rotation.x = Math.PI / 2;
    const uni = [];
    NOMES.forEach((n, i) => {
      const z = -9.4 + i * .6, vazio = ['DAVI M.', 'ANA L. P.', 'TOMÉ R.'].includes(n);
      const et = tex(128, 32, (g) => { g.fillStyle = '#d8d0b8'; g.fillRect(0, 0, 128, 32); g.fillStyle = '#1a120c'; g.font = 'bold 16px Georgia'; g.textAlign = 'center'; g.fillText(n, 64, 22); });
      plano(.18, .045, new THREE.MeshStandardMaterial({ map: et, roughness: .8 }), 12.64, 1.86, z, -Math.PI / 2);
      E.box(.02, .02, .3, E.MAT.metal, 12.7, 1.88, z, W.grupo, false);
      if (!vazio) { const u = E.box(.05, .72, .4, new THREE.MeshStandardMaterial({ color: 0x3a4250, roughness: .95 }), 12.7, 1.48, z, W.grupo, false); uni.push({ m: u, z, molhado: false }); }
    });
    L.uniformes = uni; L.pingoT = 0;
    tick(dt => {
      if (P.room.id !== 'roup') return; L.pingoT -= dt;
      if (L.pingoT <= 0) { L.pingoT = rand(.8, 1.6); const w = L.uniformes.filter(u => u.molhado); if (w.length) { const u = pick(w); gota({ x: 12.7, y: 1, z: u.z }, .05); particulas({ x: 12.7, y: 1.1, z: u.z }, { n: 2, cor: 0x9ab0c0, caem: true, aditivo: false, vida: 1.2, tam: .02, espalha: .1 }); } }
    });
    // --- batidas na parede da rouparia: alguém responde
    const mancha = plano(.7, .9, matT(tex(64, 80, (g) => { const gr = g.createRadialGradient(32, 40, 4, 32, 40, 36); gr.addColorStop(0, 'rgba(40,30,20,.45)'); gr.addColorStop(1, 'rgba(40,30,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 80); }), 1, false), 3.03, 1.3, -8, Math.PI / 2);
    L.bat = { n: 0, t: 0, hist: [], fim: false };
    E.interact(mancha, () => L.bat.fim ? 'A parede está fria e quieta.' : T.bater_label, seguro(() => { const B = L.bat; if (B.fim) return; B.n++; B.t = 0; batida({ x: 3.1, y: 1.3, z: -8 }, .22); }));
    tick(dt => {
      const B = L.bat; if (!B.n) return; B.t += dt; if (B.t < 1.4) return;
      const n = B.n; B.n = 0; B.hist.push(n); if (B.hist.length > 3) B.hist.shift();
      if (n >= 9) {
        B.fim = true; const ps = [[3, -8], [12.9, -7], [8, -11.9], [8, -2.1]];
        for (let i = 0; i < 9; i++) for (const [x, z] of ps) depois(i * .32 + rand(0, .05), () => batida({ x, y: 1.3, z }, .25));
        depois(.5, () => E.sub('', T.bater_todas)); E.emitNoise(8, -7, 16); marcarForte();
      } else {
        for (let i = 0; i < n; i++) depois(.5 + i * .45, () => batida({ x: 2.9, y: 1.3, z: -8.2 }, .2));
        if (B.hist.length === 3 && B.hist.every(h => h === 3) && !ja('sai')) { uma('sai'); B.fim = true; depois(.6 + n * .45, () => { E.sub('tome', T.bater_sai); ['S', 'A', 'I'].forEach((_, k) => depois(k * .9, () => vozCrianca({ x: 2.9, y: 1.3, z: -8.2 }, .07, 380))); }); }
      }
    });
    // --- o menino de pijama que chega mais perto a cada vez que você apaga a luz (Cap. III)
    L.pij = { g: fant(1.05, .26, 0xc8d4e0), d: 14, t: 0, fim: false };
    tick(dt => {
      const J = L.pij; if (J.fim || s.chapter !== 3) return;
      if (P.room.id !== 'corr' || s.flashOn || !calma()) { if (J.g.visible) { J.g.visible = false; if (s.flashOn) J.d -= 3.5; } J.t = 0; return; }
      J.t += dt;
      if (!J.g.visible && J.t > 2.5) {
        const f = fwdH(); if (Math.abs(f.z) < .8) return; const z = clamp(P.pos.z + Math.sign(f.z) * Math.max(3, J.d), -57, -3);
        J.g.position.set(rand(-.8, .8), 0, z); virarPara(J.g, P.pos.x, P.pos.z); J.g.visible = true;
        if (J.d <= 3.5) { J.fim = true; depois(1.2, () => { J.g.visible = false; if (s.inv.lanterna && s.battery > 0) { s.flashOn = true; E.SFX.clique(); } E.sub('lia', T.pijama); marcarForte(); }); }
      }
    });
    // --- Davi, de costas, aponta o dormitório E e entra antes de você chegar
    L.davi = { g: figura({ alt: 1.25, cor: 0x1c2232 }), foi: false };
    tick(() => {
      const V = L.davi; if (V.foi || s.chapter !== 3 || s.inv.engrenagens > 0 || s.done.engrenagens || ja('daviAponta')) return;
      if (!V.g.visible && P.room.id === 'corr' && P.pos.z < -24 && P.pos.z > -36 && olhaPara(1.9, -45.1, .9) && calma()) { V.g.position.set(1.9, 0, -45.14); V.g.rotation.y = Math.PI / 2; apontar(V.g, true); V.g.visible = true; }
      if (V.g.visible && (Math.hypot(P.pos.x - 1.9, P.pos.z + 45.14) < 8 || (s.flashOn && E.visivel(V.g.position, 1, 14) && (V.lt = (V.lt || 0) + 1 / 60) > 1.2))) {
        V.foi = true; uma('daviAponta'); apontar(V.g, false); andarModelo(V.g, { x: 1.9, z: -45.14 }, { x: 4.6, z: -45.14 }, 1.8, { descalco: true, passo: .3 });
        tick(() => { if (!L.davi.ouviu && Math.hypot(P.pos.x - 3, P.pos.z + 45.14) < 2.2) { L.davi.ouviu = true; E.sub('davi', T.nao_olha); sussurro({ x: 4, y: 1.4, z: -45 }, .1, 1); } });
      }
    });
    // --- eco do incêndio na escada
    E.gatilho('sx2_escada', -2, 2, 1.5, 4.2, seguro(() => {
      if (!uma('escada')) return;
      depois(1.2, () => { luzPor(P.pos.x, 1.4, P.pos.z, 5, 1.2, 7, .5); crepitar({ x: 0, y: .5, z: 6 }, 1.2, .3); depois(.3, () => tosse({ x: .8, y: .2, z: 6.5 }, true, 4)); depois(.8, () => batida({ x: 1.3, y: 1, z: 4.8 }, .3)); depois(2, () => E.sub('lia', T.escada)); });
    }));
    // --- a turma de 1979 ganha uma adulta de lanterna (depois que você morre aqui em cima)
    const mortesAqui = m.mortes.filter(d => d.mapa === 'superior').length;
    if (mortesAqui) {
      const tr = tex(256, 196, (g) => { const k = mortesAqui > 1 ? 1.35 : 1, x = mortesAqui > 1 ? 150 : 214, y = mortesAqui > 1 ? 52 : 30; g.fillStyle = 'rgba(18,14,10,.92)'; g.beginPath(); g.ellipse(x, y, 9 * k, 11 * k, 0, 0, 7); g.fill(); g.fillRect(x - 11 * k, y + 10 * k, 22 * k, 40 * k); g.fillStyle = 'rgba(255,240,190,.55)'; g.beginPath(); g.moveTo(x + 10 * k, y + 22 * k); g.lineTo(x + 40 * k, y + 8 * k); g.lineTo(x + 40 * k, y + 36 * k); g.fill(); });
      plano(.84, .64, matT(tr, 1, false), 2.85, 1.8, -47.5, -Math.PI / 2);
    }
    // --- um menino é arrastado para dentro de um armário (eco da noite do incêndio)
    tick(() => {
      if (s.chapter !== 3 || P.room.id !== 'corr' || s.capT < 110 || !calma() || ja('arrastado')) return;
      const f = fwdH(); if (Math.abs(f.z) < .85) return;
      const z = P.pos.z + Math.sign(f.z) * 8; if (z > -4 || z < -56) return;
      const arm = W.lockers.filter(o => o.tipo === 'armario' && E.roomAt(o.x, o.z) && E.roomAt(o.x, o.z).id === 'corr' && Math.abs(o.z - z) < 6)[0]; if (!arm) return;
      uma('arrastado');
      const g = fant(1, .3, 0xd0d8e0); g.position.set(0, 0, z); virarPara(g, arm.x, arm.z); g.visible = true;
      const braco = E.box(.06, .06, 1, matCor(0x060504), arm.x, 1.1, arm.z, W.grupo, false); braco.visible = false;
      let t = 0; const ini = { x: 0, z };
      anima(g, dt => {
        t += dt;
        if (t > .8 && t < 1.4) { braco.visible = true; const k = (t - .8) / .6, ex = lerp(arm.x, ini.x, k), ez = lerp(arm.z, ini.z, k); braco.position.set((arm.x + ex) / 2, 1.1, (arm.z + ez) / 2); braco.scale.z = Math.max(.05, Math.hypot(ex - arm.x, ez - arm.z)); braco.lookAt(ex, 1.1, ez); }
        if (t >= 1.4) { const k = Math.min(1, (t - 1.4) / .7); g.position.x = lerp(ini.x, arm.x, k); g.position.z = lerp(ini.z, arm.z, k); g.rotation.z = .5 * k; braco.scale.z = Math.max(.05, Math.hypot(g.position.x - arm.x, g.position.z - arm.z)); if (k >= 1) { g.visible = false; braco.visible = false; batida({ x: arm.x, y: 1.2, z: arm.z }, .6); depois(.6, () => E.sub('moacir', T.arrastado)); return true; } }
      });
    });
    // --- luz amarela por baixo da porta do banheiro, com dois pezinhos passando
    const dB = E.DOOR('bS');
    if (dB && !ja('luzPorta')) {
      const tl = tex(128, 16, () => {});
      const fresta = plano(1, .05, matT(tl, 1, true, { blending: THREE.AdditiveBlending }), -2.95, .03, -31, Math.PI / 2);
      L.fresta = { d: dB, m: fresta, t: rand(3, 6), pes: -1 };
      const desenhar = (px) => redesenhar(tl, (g, w, h) => { g.fillStyle = 'rgba(255,200,110,.9)'; g.fillRect(0, 0, w, h); if (px >= 0) { g.fillStyle = 'rgba(0,0,0,.95)'; g.fillRect(px, 0, 10, h); g.fillRect(px + 16, 0, 10, h); } });
      desenhar(-1);
      tick(dt => {
        const F = L.fresta; if (!F) return;
        if (F.d.open) { W.grupo.remove(F.m); L.fresta = null; uma('luzPorta'); return; }
        F.t -= dt;
        if (F.pes < 0 && F.t <= 0 && Math.hypot(P.pos.x + 3, P.pos.z + 31) < 12) { F.pes = 0; for (let i = 0; i < 4; i++) depois(i * .3, () => passoPos({ x: -5, y: .1, z: -31.4 + i * .3 }, .25, true)); }
        if (F.pes >= 0) { F.pes += dt * 110; desenhar(F.pes); if (F.pes > 130) { F.pes = -1; F.t = rand(7, 12); desenhar(-1); } }
      });
    }
    joaquim();
  }

  // ================================================================ TÚNEIS
  function montarTuneis() {
    const s = S();
    // --- o armário marcado "NÃO": o repórter de 1987 se escondeu aqui
    const ax = 3.9, az = -41.62;
    const corpo = new THREE.Group(); corpo.position.set(ax, 0, az); W.grupo.add(corpo); // oco: fundo, laterais, teto e piso
    const fundo = E.box(.9, 2, .03, E.MAT.metalVerde, 0, 1, -.26, corpo, true);
    for (const sx of [-1, 1]) E.box(.03, 2, .55, E.MAT.metalVerde, sx * .435, 1, 0, corpo, true);
    E.box(.9, .03, .55, E.MAT.metalVerde, 0, 1.985, 0, corpo, false); E.box(.9, .03, .55, E.MAT.metalVerde, 0, .015, 0, corpo, false);
    solido(ax - .47, ax + .47, az - .3, az + .3, fundo);
    const piv = new THREE.Group(); piv.position.set(ax - .45, 0, az + .29); W.grupo.add(piv);
    const tampa = E.box(.88, 1.94, .03, E.MAT.metalVerde, .44, 1, 0, piv, false);
    const fita = plano(.4, .14, new THREE.MeshStandardMaterial({ map: tex(128, 48, (g) => { g.fillStyle = '#d8c890'; g.fillRect(0, 0, 128, 48); g.fillStyle = '#1a120c'; g.font = 'bold 32px Georgia'; g.textAlign = 'center'; g.fillText('NÃO', 64, 36); }), roughness: .8 }), .44, 1.5, .02); piv.add(fita);
    const esq = new THREE.Group(); esq.position.set(ax, 0, az); W.grupo.add(esq); esq.visible = false;
    const osso = new THREE.MeshStandardMaterial({ color: 0xcfc6ae, roughness: .8 }), jaq = new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: .7 });
    E.box(.42, .45, .26, jaq, 0, .7, 0, esq, false); const cr = new THREE.Mesh(new THREE.SphereGeometry(.1, 10, 8), osso); cr.position.set(0, 1.05, .03); cr.rotation.x = .4; esq.add(cr);
    for (const sx of [-1, 1]) { E.box(.06, .06, .38, jaq, sx * .14, .5, .14, esq, false); E.box(.04, .04, .3, osso, sx * .12, .3, .28, esq, false); }
    planoEm(esq, .12, .05, new THREE.MeshStandardMaterial({ map: tex(128, 48, (g) => { g.fillStyle = '#e0dccc'; g.fillRect(0, 0, 128, 48); g.fillStyle = '#111'; g.font = 'bold 12px Georgia'; g.textAlign = 'center'; g.fillText('CLÁUDIO REIS', 64, 20); g.fillText('JORNAL DO VALE · 1987', 64, 38); }), roughness: .8 }), -.1, .82, .135);
    const gar = E.MK.garrafa(); gar.position.set(.12, .45, .25); gar.rotation.z = .6; esq.add(gar);
    L.nao = { e: 0 };
    const itNao = E.interact(corpo, () => L.nao.e === 0 ? T.nao_label : L.nao.e === 1 ? T.nao_garrafa : 'Ele continua encolhido aqui dentro.', seguro(() => {
      const A = L.nao;
      if (A.e === 0) {
        A.e = 1; esq.visible = true; E.SFX.rangido(ax, 1, az, .9); E.emitNoise(ax, az, 6); let t = 0; anima(piv, dt => { t += dt; piv.rotation.y = -Math.min(1, t / .8) * 1.9; return t > .8; });
        E.sub('lia', T.nao_fala[0]); depois(3.2, () => E.sub('lia', T.nao_fala[1]));
        depois(2.4, () => { const p = M.ativo ? { x: M.pos.x, z: M.pos.z } : { x: ax - 14, z: az + 8 }; E.SFX.estalo(p, 1); depois(.25, () => E.SFX.estalo(p, 1)); if (M.ativo && M.state === 'patrulha') E.planejar(M, ax + rand(-1, 1), az + 1.5); });
      } else if (A.e === 1) { A.e = 2; gar.visible = false; s.inv.garrafas++; E.SFX.pegar(); E.renderInvMini(); }
    }));
    for (const g of [piv, esq]) g.traverse(o => { o.userData.it = itNao; });
    // --- o Davi no reflexo da água parada (três vezes; na terceira ele aponta)
    const tR = tex(128, 192, () => {});
    const refl = new THREE.Mesh(new THREE.PlaneGeometry(.6, .9), matT(tR, 0, true)); refl.rotation.x = -Math.PI / 2; refl.visible = false; W.grupo.add(refl);
    L.refl = { m: refl, t: 0, on: false };
    tick(dt => {
      const Rf = L.refl, m = mem();
      if (Rf.on) {
        Rf.t += dt; refl.material.opacity = Math.min(.7, Rf.t * 2);
        if (P.pitch > -.3 || Rf.t > 2.6 || ameaca()) { Rf.on = false; refl.visible = false; refl.material.opacity = 0; if (m.reflexos === 1) depois(.6, () => E.sub('lia', '(sussurro) ...Davi?')); }
        return;
      }
      if (m.reflexos >= 3 || !W.agua.length || !P.naAgua || P.pitch > -.5 || !s.flashOn || P.noiseR > 0 || agora() < (Rf.prox || 0) || ameaca()) return;
      Rf.prox = agora() + 25; m.reflexos++; Rf.on = true; Rf.t = 0;
      const f = fwdH(), ap = m.reflexos >= 3;
      redesenhar(tR, (g, w, h) => { g.fillStyle = 'rgba(14,14,16,.9)'; g.beginPath(); g.ellipse(64, 150, 16, 19, 0, 0, 7); g.fill(); g.fillRect(46, 52, 36, 82); g.fillStyle = 'rgba(210,206,196,.6)'; g.fillRect(56, 150, 4, 3); g.fillRect(68, 150, 4, 3); if (ap) { g.fillStyle = 'rgba(14,14,16,.9)'; g.fillRect(80, 88, 44, 8); } });
      refl.position.set(P.pos.x + f.x * 1.3, W.agua[0].position.y + .012, P.pos.z + f.z * 1.3);
      refl.rotation.set(-Math.PI / 2, 0, Math.atan2(f.x, f.z)); refl.visible = true;
      if (!ja('reflSom')) { uma('reflSom'); respiracao(atras(.5), 1.2, false, .35); }
    });
    // --- a seta de giz branca no muro da cisterna: aponta para onde ELE está
    const tS = tex(256, 96, () => {});
    const seta = plano(1.2, .45, matT(tS, 1, false), 4, 1.5, -30.04, Math.PI);
    const desenhaSeta = (dir) => redesenhar(tS, (g, w, h) => { g.strokeStyle = 'rgba(236,232,220,.9)'; g.lineWidth = 7; g.lineCap = 'round'; const a = dir > 0 ? 30 : 226, b = dir > 0 ? 226 : 30; g.beginPath(); g.moveTo(a, 48); g.lineTo(b, 48); g.moveTo(b, 48); g.lineTo(b - dir * 36, 18); g.moveTo(b, 48); g.lineTo(b - dir * 36, 78); g.stroke(); });
    desenhaSeta(1); L.seta = { v: false };
    tick(() => {
      const St = L.seta, v = E.visivel(seta.position, 1.5, 9);
      if (v && !St.v) { const lado = M.ativo ? (M.pos.x > 0 ? -1 : 1) : 1; desenhaSeta(lado); if (!ja('setaFalsa')) { uma('setaFalsa'); depois(.8, () => E.sub('lia', T.seta_falsa)); } }
      St.v = v;
    });
    // --- a cadeira do diretor, ocupada depois da carta ao bispo
    const mesa = esp(W.spots.secreta && W.spots.secreta.mesa), rs = sala('secreta');
    if (mesa && rs) {
      const c = centro(rs), vx = c.x - mesa.x, vz = c.z - mesa.z, l = Math.hypot(vx, vz) || 1;
      const g = sentado(0x0d0c0b); g.position.set(mesa.x + vx / l * .75, 0, mesa.z + vz / l * .75); g.rotation.y = Math.atan2(-vx, -vz);
      L.cad = { g, lia: !!s.notes.n10 };
      tick(() => {
        const C = L.cad;
        if (!C.lia && s.notes.n10) { C.lia = true; if (!s.flags.cofre && uma('cadeira')) C.g.visible = true; }
        if (C.g.visible && (Math.hypot(P.pos.x - C.g.position.x, P.pos.z - C.g.position.z) < 2.1 || s.flags.cofre)) { C.g.visible = false; particulas({ x: C.g.position.x, y: 1, z: C.g.position.z }, { n: 60, cor: 0x7a7670, aditivo: false, vida: 2.2, tam: .07, sobe: .6, espalha: .35 }); depois(1, () => E.sub('lia', T.cadeira)); }
      });
    }
    // --- choro abafado num armário enferrujado da cisterna
    const armC = W.lockers.find(o => o.tipo === 'armario' && Math.abs(o.x - 5.55) < .1 && Math.abs(o.z + 33.5) < .1);
    if (armC) {
      armC.sxChoro = true;
      tick(() => {
        if (!ja('choroT') && Math.hypot(P.pos.x - armC.x, P.pos.z - armC.z) < 5 && calma()) { uma('choroT'); L.choroAte = agora() + 25; choro({ x: armC.x, y: 1.2, z: armC.z }, 4, .05); depois(.5, () => E.sub('', T.choro)); }
        if (s.hidden === armC && L.choroAte && agora() < L.choroAte && !ja('choroDentro')) { uma('choroDentro'); depois(1.2, () => { E.sub('tome', T.choro_dentro); sussurro({ x: armC.x, y: 1.4, z: armC.z }, .12, 1.2); }); }
      });
    }
    fumaca(-1.6, 1.6, -52, -44, 5);
  }

  // ================================================================ CEMITÉRIO E CAPELA
  function montarCemiterio() {
    const s = S(), m = mem();
    const ls = lsGet({}); if (!ls.cap5) { ls.cap5 = true; lsSet(ls); }
    const idx = nome => R.lapides.findIndex(l => l.id === nome || l.nome === nome);
    const posL = i => (i >= 0 && s.tumPos && s.tumPos[i]) ? { x: s.tumPos[i][0], z: s.tumPos[i][1] } : null;
    // --- a cova aberta com a cruz "LIA" ao lado do Davi
    const pd = posL(idx('davi'));
    if (pd) {
      const cx = clamp(pd.x + 2, -27, 27), cz = pd.z + 1;
      const cova = new THREE.Group(); cova.position.set(cx, 0, cz); W.grupo.add(cova);
      const buraco = noChao(.85, 1.7, matCor(0x030302), 0, 0, .01); cova.add(buraco); buraco.position.set(0, .01, 0);
      const monte = E.box(.5, .3, 1.4, E.MAT.tronco || E.MAT.madeiraEsc, .75, .15, 0, cova, false); monte.rotation.z = .3;
      const cabo = E.cyl(.02, .02, 1.1, E.MAT.madeira, .7, .7, .5, 6, cova); cabo.rotation.z = .25; E.box(.18, .22, .02, E.MAT.metal, .58, .15, .5, cova, false);
      const cruz = new THREE.Group(); cruz.position.set(0, 0, -1.05); cova.add(cruz); E.box(.06, 1, .05, E.MAT.madeira, 0, .5, 0, cruz, false); E.box(.45, .06, .05, E.MAT.madeira, 0, .78, 0, cruz, false);
      planoEm(cruz, .3, .12, matT(tex(128, 48, (g) => { g.fillStyle = 'rgba(236,232,220,.9)'; g.font = 'bold 30px Georgia'; g.textAlign = 'center'; g.fillText('LIA', 64, 36); }), 1, false), 0, .62, .03);
      const cheia = new THREE.Group(); cheia.visible = false; cova.add(cheia);
      E.box(.85, .18, 1.7, E.MAT.tronco || E.MAT.madeiraEsc, 0, .06, 0, cheia, false);
      for (let i = 0; i < 9; i++) { const fl = new THREE.Mesh(new THREE.SphereGeometry(.04, 6, 5), new THREE.MeshStandardMaterial({ color: pick([0xe8e0d0, 0xb02030, 0xd8b040]), roughness: .7, emissive: 0x201010, emissiveIntensity: .5 })); fl.position.set(rand(-.3, .3), .17, rand(-.7, .7)); cheia.add(fl); }
      L.cova = { g: cova, buraco, cheia, monte, e: 0, fora: 0, tum: Object.keys(s.tumulos).length };
      tick(dt => {
        const C = L.cova, v = E.visivel({ x: cx, z: cz }, .2, 16) || E.visivel({ x: cx, z: cz - 1 }, .8, 16);
        if (C.e === 0 && v && Math.hypot(P.pos.x - cx, P.pos.z - cz) < 8) { C.e = 1; depois(.6, () => E.sub('lia', T.cova)); }
        const n = Object.keys(s.tumulos).length;
        if (n >= 3 && C.tum < 3 && C.e < 2) { C.e = 2; terra({ x: cx, y: .3, z: cz }, 2.4); depois(.4, () => E.sub('', T.cova_terra)); }
        C.tum = n;
        if (C.e === 2) { C.fora = v ? 0 : C.fora + dt; if (C.fora > 1) { C.e = 3; C.buraco.visible = false; C.monte.visible = false; C.cheia.visible = true; } }
        else if (C.e === 3 && v) { C.e = 4; s.fear = Math.min(100, s.fear + 12); E.SFX.estalo({ x: cx, z: cz }, .5); marcarForte(); }
      });
    }
    // --- o eco do diretor trancando a capela, visto de longe (começo do Cap. V)
    if (s.chapter === 5 && !s.flags.sino && !ja('albano')) {
      const g = figura({ alt: 1.85, cor: 0x0b0a09 }); g.position.set(.5, 0, -47.2); g.rotation.y = Math.PI; L.albano = g;
      const lamp = new THREE.PointLight(0xffa040, 0, 9, 1.4); lamp.position.set(-.6, .4, -46.9); W.grupo.add(lamp);
      tick(() => {
        if (g.userData.foi || g.visible || s.flags.sino || Math.hypot(P.pos.x, P.pos.z + 47) > 34 || !olhaPara(0, -47, .95)) return;
        uma('albano'); g.userData.foi = true; g.visible = true; lamp.intensity = 2.4; let t = 0, cT = 0;
        anima(g, dt => {
          t += dt; cT -= dt; g.userData.braco.rotation.x = -1.2 + Math.sin(t * 6) * .25; lamp.intensity = 2.2 + Math.sin(t * 11) * .3;
          if (cT <= 0 && t < 6) { cT = 1.4; corrente({ x: .5, y: 1.2, z: -47.6 }, 1); }
          if (t > 6 && !g.userData.cad) { g.userData.cad = true; cadeado({ x: .5, y: 1.2, z: -47.6 }); }
          if (L.raioSome || t > 13 || Math.hypot(P.pos.x - .5, P.pos.z + 47.2) < 12 || (S().flashOn && E.visivel(g.position, 1.4, 20) && t > 2)) { L.raioSome = false; g.visible = false; lamp.intensity = 0; E.SFX.estatica(.2); return true; }
        });
      });
      tick(() => { if (!ja('albanoSem') && Math.hypot(P.pos.x, P.pos.z + 48) < 4 && Object.keys(s.tumulos).length >= 3) { uma('albanoSem'); E.sub('lia', T.albano_sem); } });
    }
    // --- o repórter de 1987 chama do lado de fora do muro (responder com V é responder ao chamado)
    tick(() => {
      if (L.rep) {
        const Rp = L.rep, v = !!E.keys.KeyV;
        if (v && !Rp.vAnt) { L.rep = null; E.sub('lia', T.reporter_lia, true); depois(1.2, () => { vacuo(.5, .02); }); depois(1.7, () => { E.sub('inspetor', T.reporter_achei); E.SFX.susto(); marcarForte(); voz({ x: P.pos.x + 1, y: 1.6, z: P.pos.z }, { f0: 88, vogais: [[300, 870], [320, 800]], dur: .9, vol: .16 }); E.emitNoise(P.pos.x, P.pos.z, 26); }); return; }
        Rp.vAnt = v;
        if (agora() > Rp.ate) { L.rep = null; E.sub('', T.reporter_vai); for (let i = 0; i < 5; i++) depois(.4 + i * .6, () => passoPos({ x: -3 - i * 1.5, y: .1, z: 15 }, .35)); }
        return;
      }
      if (s.chapter !== 5 || ja('reporter') || Math.hypot(P.pos.x, P.pos.z - 12) > 15 || !calma()) return;
      uma('reporter'); const pr = { x: 1, y: 1.6, z: 15.5 };
      E.sub('', T.reporter[0]); voz(pr, { f0: 118, vogais: [[500, 1500], [700, 1100], [400, 1700]], dur: 1.4, vol: .1, wet: .4 });
      depois(4, () => { E.sub('', T.reporter[1]); voz(pr, { f0: 112, vogais: [[600, 1200], [400, 1700]], dur: 1.1, vol: .1, wet: .4 }); L.rep = { ate: agora() + 6, vAnt: !!E.keys.KeyV }; });
    });
    // --- o desenho do Davi preso no muro, com alguém a mais desenhado atrás (para quem achou o desenho)
    if (s.notes.n13) {
      const td = tex(160, 120, (g, w, h) => { g.fillStyle = '#ece6d4'; g.fillRect(0, 0, w, h); g.lineWidth = 3; g.strokeStyle = '#c03020'; g.beginPath(); g.arc(56, 44, 9, 0, 7); g.moveTo(56, 53); g.lineTo(56, 84); g.moveTo(56, 62); g.lineTo(78, 62); g.stroke(); g.strokeStyle = '#2050a0'; g.beginPath(); g.arc(96, 48, 8, 0, 7); g.moveTo(96, 56); g.lineTo(96, 84); g.moveTo(96, 64); g.lineTo(78, 62); g.stroke(); g.strokeStyle = '#111'; g.lineWidth = 5; g.beginPath(); g.arc(128, 18, 9, 0, 7); g.moveTo(128, 27); g.lineTo(128, 110); g.moveTo(128, 40); g.lineTo(104, 60); g.stroke(); });
      const dz = plano(.32, .24, new THREE.MeshStandardMaterial({ map: td, roughness: .9 }), 3.4, 1.3, 11.77, Math.PI);
      E.interact(dz, () => T.desenho_label, seguro(() => { if (!uma('desenho')) return; E.SFX.papel(); E.sub('lia', T.desenho); }));
    }
    // --- a fuga: mãos pequenas esmurram a porta da capela por dentro
    tick(dt => {
      if (!s.flags.sino) return;
      if (!L.fugaT) { L.fugaT = .01; L.batT = 1; depois(3, () => E.sub('', T.abre)); }
      if (!L.fugaT || L.fugaT > 26) return;
      L.fugaT += dt; L.batT -= dt;
      if (L.batT <= 0) { L.batT = Math.max(.18, 1.2 - L.fugaT * .05); batida({ x: rand(-.6, .6), y: rand(.6, 1.3), z: -48.3 }, .3); if (Math.random() < .25) vozCrianca({ x: 0, y: 1, z: -49.5 }, .06, rand(380, 480)); }
    });
    // --- pegadas de bota iguais às suas seguem na frente, para a capela (só no escuro)
    tick(dt => {
      if (s.chapter !== 5 || P.room.id !== 'cem' || s.flags.sino) return;
      if (L.peg) { const v = s.flashOn && L.peg.some(p => E.visivel(p.position, .02, 14)); if (v || P.pos.z < L.peg[L.peg.length - 1].position.z) { for (const p of L.peg) W.grupo.remove(p); L.peg = null; if (v) E.SFX.estatica(.15); } return; }
      if (ja('pegadas') || s.flashOn || !calma() || P.pos.z < -30) { L.escT = 0; return; }
      L.escT = (L.escT || 0) + dt; if (L.escT < 3) return;
      uma('pegadas'); const tb = tex(32, 64, (g) => { g.fillStyle = 'rgba(160,170,176,.55)'; g.beginPath(); g.ellipse(16, 20, 9, 16, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(16, 52, 7, 9, 0, 0, 7); g.fill(); });
      L.peg = [];
      for (let i = 0; i < 12; i++) { const z = P.pos.z - 3 - i * .75; if (z < -47) break; L.peg.push(noChao(.14, .28, matT(tb, .8, true), (i % 2 ? .18 : -.18), z, .02, Math.PI)); }
      if (!L.peg.length) L.peg = null;
    });
    // --- três crianças de 1979 refazem o caminho até a capela no escuro; a menor fica para trás, olhando você
    tick(dt => {
      if (s.chapter !== 5 || P.room.id !== 'cem' || s.flags.sino) return;
      const K3 = L.k3;
      if (K3 && K3.fase === 1) { if (s.flashOn) { K3.g.visible = false; K3.fase = 2; K3.t = 0; } return; }
      if (K3 && K3.fase === 2) { if (!s.flashOn) { K3.t += dt; if (K3.t > 1) { K3.fase = 3; const f = fwdH(); const a = K3.ana; a.position.set(P.pos.x + f.x * 1.05, 0, P.pos.z + f.z * 1.05); virarPara(a, P.pos.x, P.pos.z); a.visible = true; respiracao(a.position, 1.5, false, .35); marcarForte(); let t = 0; anima(a, dt2 => { t += dt2; if (S().flashOn || t > 2.6) { a.visible = false; return true; } }); } } return; }
      if (K3 || ja('criancas79') || s.flashOn || !calma() || P.pos.z < -36) { L.k3T = 0; return; }
      L.k3T = (L.k3T || 0) + dt; if (L.k3T < 4.5 || !ja('pegadas')) return;
      uma('criancas79');
      const g = new THREE.Group(); W.grupo.add(g); const z0 = Math.max(-44, P.pos.z - 8);
      [[-.5, 1.15], [0, 1.05], [.5, .85]].forEach(([x, a]) => { const f = fant(a, .26, 0xd8dce4); W.grupo.remove(f); f.visible = true; f.position.set(x, 0, 0); f.rotation.y = Math.PI; f.userData.be.rotation.z = -.5; f.userData.braco.rotation.z = .5; g.add(f); });
      g.position.set(0, 0, z0); g.visible = true;
      const ana = figura({ alt: .85, cor: 0xd8dce4, op: .3, cabelo: 0xa01020, olhos: 0x202020 });
      L.k3 = { g, ana, fase: 1, t: 0 };
      anima(g, dt2 => { if (!g.visible) return true; g.position.z = Math.max(-47, g.position.z - dt2 * .7); g.children.forEach((c, i) => { c.position.y = Math.abs(Math.sin(agora() * 4 + i)) * .03; }); if (g.position.z <= -47) { g.visible = false; return true; } });
    });
    // --- o terceiro objeto no altar: por três segundos, a capela volta a 14/03/1979
    L.placed = s.placed;
    tick(() => {
      if (s.placed >= 3 && L.placed < 3 && uma('incendio')) incendio();
      L.placed = s.placed;
    });
    // --- um menino corre para a capela e uma mão comprida o puxa para dentro
    tick(() => {
      if (s.chapter !== 5 || P.room.id !== 'cem' || s.flags.sino || P.pos.z > -14 || P.pos.z < -40 || fwdH().z > -.7 || !calma() || ja('meninoCapela')) return;
      uma('meninoCapela');
      const g = fant(1.05, .3, 0xd0d8e0); andarModelo(g, { x: -5, z: Math.max(-44, P.pos.z - 6) }, { x: 0, z: -48.2 }, 4, { descalco: true, passo: .2, fim: () => {
        const b = E.box(.07, 1.3, .07, matCor(0x050403), 0, 1.5, -48.6, W.grupo, false); b.rotation.x = -.6; let t = 0;
        anima(b, dt => { t += dt; b.rotation.x = -.6 + t * 1.8; if (t > .5) { W.grupo.remove(b); batida({ x: 0, y: 1, z: -48.3 }, .8); return true; } });
      } });
    });
    // --- lápides da Rosa e do João: a fita e a bolinha voltaram molhadas (para quem viu a Procissão)
    if (m.procs >= 1) {
      const pr = posL(idx('ROSA, 8 ANOS')), pj = posL(idx('JOÃO, 7 ANOS'));
      if (pr) { const fitaR = E.box(.12, .012, .05, new THREE.MeshStandardMaterial({ color: 0x9a1020, roughness: .2, metalness: .1, emissive: 0x200408, emissiveIntensity: .7 }), pr.x, .13, pr.z + .55, W.grupo, false); E.interact(fitaR, () => T.rosa, () => {}); }
      if (pj) { const bo = new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 8), new THREE.MeshStandardMaterial({ color: 0x80b0c8, roughness: .05, transparent: true, opacity: .85, emissive: 0x10303a, emissiveIntensity: .8 })); bo.position.set(pj.x + .15, .15, pj.z + .5); W.grupo.add(bo); E.interact(bo, () => T.joao, () => {}); }
    }
    // --- a outra Lia, parada no portão, olhando para a capela
    if (m.outra && LIA2 && !ja('outraLia5')) {
      tick(() => {
        if (L.lia5 || ja('outraLia5') || s.chapter !== 5 || s.flags.sino) return;
        if (Math.hypot(P.pos.x, P.pos.z - 11) < 25 && olhaPara(0, 11, .93)) {
          uma('outraLia5'); L.lia5 = true; LIA2.position.set(0, 0, 10.6); LIA2.rotation.y = Math.PI; LIA2.visible = true; let t = 0;
          anima(LIA2, dt => { t += dt; if (t > 9 || Math.hypot(P.pos.x, P.pos.z - 10.6) < 6 || (S().flashOn && E.visivel(LIA2.position, 1.4, 25) && t > 1.5)) { LIA2.visible = false; E.SFX.estatica(.2); return true; } });
        }
      });
    }
    // --- fumaça que a lanterna mostra dentro da capela
    fumaca(-5, 5, -62, -51, 7);
  }
  function incendio() {
    vacuo(.35, .1); marcarForte();
    depois(.35, () => {
      elFogo.style.opacity = .9; let t = 0;
      const luz = luzQuente(0, 3, -60, 12, 24);
      anima(luz, dt => { t += dt; luz.intensity = 10 + Math.random() * 6; elFogo.style.opacity = .6 + Math.random() * .35; if (t > 3) { luz.intensity = 0; elFogo.style.opacity = 0; return true; } });
      for (let i = 0; i < 4; i++) depois(i * .7, () => particulas({ x: rand(-4, 4), y: .3, z: rand(-64, -52) }, { n: 40, cor: 0xff7a20, vida: 2.4, tam: .06, sobe: 1.6, espalha: 2 }));
      crepitar({ x: 0, y: 1.5, z: -58 }, 3, .4);
      for (let i = 0; i < 12; i++) depois(.2 + i * .22, () => batida({ x: rand(-.7, .7), y: rand(.5, 1.2), z: -48.4 }, .28));
      for (let i = 0; i < 3; i++) depois(.5 + i * .8, () => voz({ x: rand(-1, 1), y: 1, z: -49 }, { f0: rand(500, 650), vogais: [[800, 1200], [600, 1000]], dur: .6, vol: .06, cai: .7 }));
      depois(1, () => { E.SFX.sino(.25, { x: 0, y: 6, z: -66 }, .97); tosse({ x: 1, y: 1, z: -56 }, true, 4); });
      depois(3, () => { vacuo(1.6, 0); elFogo.style.opacity = 0; });
    });
  }

  // ================================================================ GANCHOS
  const H = {};
  H.novoMapa = seguro(id => {
    L = { mapa: id }; ticks = []; luzQ = null; LIA2 = null; JOAQ = null; paradoT = 0; posAnt.copy(P.pos); elFogo.style.opacity = 0;
    const s = S(); if (!s || !W.grupo) return;
    contornos();
    if (mem().outra) outraLia();
    if (id === 'estrada') montarEstrada();
    else if (id === 'terreo') montarTerreo();
    else if (id === 'superior') montarSuperior();
    else if (id === 'tuneis') montarTuneis();
    else if (id === 'cemiterio') montarCemiterio();
  });
  H.update = seguro(dt => {
    const s = S(); if (!s || s.dead || !P.room) return;
    updateGeral(dt); updateEcos(dt);
    for (const f of ticks) f(dt);
  });
  H.morte = seguro(() => {
    const s = S(); if (!s || !W.mapa) return;
    const f = fwdH(); mem().mortes.push({ mapa: W.mapa, cap: s.chapter, x: P.pos.x, z: P.pos.z, ang: Math.atan2(f.x, f.z), h: hora() });
  });
  H.aoRaio = seguro(() => {
    const s = S(); if (!s || !P.room) return;
    if (JOAQ && JOAQ.visible) L.raioSome = true;
    if (L.albano && L.albano.visible) L.raioSome = true;
    if (W.mapa === 'terreo') {
      if (s.chapter === 2 && L.patio && (P.room.id === 'hall' || P.room.fora) && fwdH().z > .4 && uma('patioCheio')) { L.patio.visible = true; s.fear = Math.min(100, s.fear + 10); depois(.18, () => { L.patio.visible = false; }); }
      if (L.r79 && P.room.id === 'refeit' && uma('refeit79')) { const c = centro(P.room); L.r79.visible = true; luzPor(c.x, 2.8, c.z, 9, .25, 16); depois(.25, () => { L.r79.visible = false; }); }
      if (s.chapter === 1 && P.room.id === 'enferm' && uma('enfRaio')) {
        const r = P.room, cs = [[r.x0 + .8, r.z0 + .8], [r.x1 - .8, r.z0 + .8], [r.x0 + .8, r.z1 - .8], [r.x1 - .8, r.z1 - .8]].sort((a, b) => Math.hypot(b[0] - P.pos.x, b[1] - P.pos.z) - Math.hypot(a[0] - P.pos.x, a[1] - P.pos.z))[0];
        const g = L.enfVulto || (L.enfVulto = figura({ alt: 1.95, cor: 0x030303 })); g.position.set(cs[0], 0, cs[1]); virarPara(g, P.pos.x, P.pos.z); g.visible = true; depois(.16, () => { g.visible = false; E.SFX.estalo({ x: cs[0], z: cs[1] }, .6); });
      }
    }
  });
  H.badaladas = seguro(() => { for (let i = 0; i < 8; i++) depois(i * 2.2 + .05, () => eco1979Badalada(i)); depois(8 * 2.2 + 2.65, () => eco1979Badalada(8)); });
  H.aoEsconder = seguro(Lk => {
    const s = S();
    if (L.camaLia && Lk === L.camaLia.L && L.camaLia.pl.visible && uma('camaLia')) depois(2, () => { E.sub('ana', T.lia_cama); sussurro({ x: Lk.x, y: .4, z: Lk.z }, .12, 1); });
    if (L.alp && Lk === L.alp.L) { L.alp.n++; L.alp.est.material.map = L.alp.n >= 2 ? L.alp.tB : L.alp.tA; L.alp.est.material.needsUpdate = true; L.alp.est.visible = true; if (L.alp.n === 1) depois(3, () => giz({ x: Lk.x, y: .5, z: Lk.z }, 1)); }
    if (L.camaDavi && Lk === L.camaDavi.L && uma('camaDavi')) { E.sub('lia', T.davi_cama); depois(2.2, () => { maoContato(); E.sub('', T.davi_mao); L.camaDavi.prot = 3; s.flashOn = false; }); }
  });
  H.aoSair = seguro(Lk => { if (L.alp && Lk === L.alp.L) L.alp.est.visible = false; if (L.camaDavi) L.camaDavi.prot = 0; });
  // a Procissão parou na frente do esconderijo
  H.procParou = seguro((Lk) => {
    const s = S(), m = mem();
    if (!s.flashOn && uma('semNome')) depois(1.3, () => { E.sub('', T.sem_nome); sussurro({ x: PROC.pos.x, y: 1, z: PROC.pos.z }, .12, 1.2); });
    if (Lk && uma('gudeProc')) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(.018, 10, 8), new THREE.MeshStandardMaterial({ color: 0x8fc0d0, roughness: .05, transparent: true, opacity: .85, emissive: 0x10303a, emissiveIntensity: .8 }));
      const ini = { x: PROC.pos.x, z: PROC.pos.z }, alvo = { x: Lk.x + Lk.face[0] * .5, z: Lk.z + Lk.face[1] * .5 }; b.position.set(ini.x, .018, ini.z); W.grupo.add(b); let t = 0;
      anima(b, dt => { t += dt; const k = Math.min(1, t / 1.4); b.position.x = lerp(ini.x, alvo.x, k); b.position.z = lerp(ini.z, alvo.z, k); if (k >= 1) { tilintar(b.position, 2, .06); return true; } });
    }
    if (m.procs >= 1 && uma('procLia')) depois(.6, () => { E.sub('', T.proc_lia); sussurro({ x: PROC.pos.x, y: 1, z: PROC.pos.z }, .12, .8); });
  });
  H.telefone = seguro(() => { if (S().fitas.f1) depois(5.5, () => { E.sub('lia', T.telefone_lia, true); voz({ x: P.pos.x, y: 1.3, z: P.pos.z }, { f0: 220, vogais: [[800, 1200], [500, 900], [800, 1200]], dur: 1, vol: .06, wet: .05 }); }); });

  // ================================================================ NOVOS SUSTOS AMBIENTE (para o diretor de sustos)
  const vizinha = () => { const l = W.links.filter(l => l.a === P.room.id || l.b === P.room.id).map(l => sala(l.a === P.room.id ? l.b : l.a)).filter(r => r && !r.fora); return l.length ? pick(l) : null; };
  if (K.AMBIENTE) K.AMBIENTE.push(
    { id: 'choroArm', ok: () => !P.room.fora && W.lockers.some(o => o.tipo === 'armario' && Math.hypot(o.x - P.pos.x, o.z - P.pos.z) < 10), fn: () => { const a = W.lockers.filter(o => o.tipo === 'armario').sort((x, y) => Math.hypot(x.x - P.pos.x, x.z - P.pos.z) - Math.hypot(y.x - P.pos.x, y.z - P.pos.z))[0]; choro({ x: a.x, y: 1.2, z: a.z }, 3, .045); depois(.4, () => E.sub('', T.choro_amb)); } },
    { id: 'apito', ok: () => W.mapa === 'terreo' || W.mapa === 'superior' || W.mapa === 'tuneis', fn: () => apito(atras(16)) },
    { id: 'sapato', ok: () => !P.room.fora, fn: () => {
      const f = fwdH(), x = P.pos.x + f.z * 1.3 + f.x * .6, z = P.pos.z - f.x * 1.3 + f.z * .6; if (E.roomAt(x, z) !== P.room) return;
      const sp = E.box(.09, .07, .2, new THREE.MeshStandardMaterial({ color: 0x241810, roughness: .6 }), x, 2.6, z, W.grupo, false); let t = 0, vy = 0;
      anima(sp, dt => { t += dt; vy -= 9.8 * dt; sp.position.y = Math.max(.035, sp.position.y + vy * dt); sp.rotation.x += dt * 5; if (sp.position.y <= .035 && vy < 0) { if (!sp.userData.q) { sp.userData.q = true; batida({ x, y: .1, z }, .35); vy = 1.6; } else { sp.rotation.x = 0; return true; } } return t > 3; });
    } },
    { id: 'giz', ok: () => !P.room.fora && !!vizinha(), fn: () => { const r = vizinha(); if (r) giz({ x: (r.x0 + r.x1) / 2, y: 1.6, z: (r.z0 + r.z1) / 2 }, 2); } },
    { id: 'roda', ok: () => !P.room.fora, fn: () => { for (let i = 0; i < 12; i++) depois(i * .2, () => { const a = i / 12 * Math.PI * 2; passoPos({ x: P.pos.x + Math.cos(a) * 2.2, y: .1, z: P.pos.z + Math.sin(a) * 2.2 }, .45, true); }); depois(2.6, () => E.SFX.risada(P.pos.x + 1, P.pos.z)); } },
    { id: 'caneca', ok: () => !P.room.fora, fn: () => { const p = atras(4); som((ac, t) => { const g = E.saida(p, .4); E.osc('triangle', 1250, t, .4, g); E.env(g, t, .001, .1, .35); }); depois(.3, () => rolar(p, 1.4)); } },
    { id: 'hora', ok: () => S().chapter >= 1, fn: () => { const f = fwdH(); sussurro({ x: P.pos.x - f.z * .4, y: 1.6, z: P.pos.z + f.x * .4 }, .13, 1); E.sub('', T.hora); } },
    { id: 'fumaca', ok: () => !P.room.fora, fn: () => { E.sub('', T.fumaca); particulas({ x: P.pos.x, y: 2.7, z: P.pos.z }, { n: 36, cor: 0x1a1612, caem: true, aditivo: false, vida: 3, tam: .03, espalha: 1.6 }); } },
    { id: 'assoalho', ok: () => W.mapa === 'superior', fn: () => { for (let i = 0; i < 3; i++) depois(i * .45, () => batida({ x: P.pos.x + .3, y: -.4, z: P.pos.z + .3 }, .3)); } },
    { id: 'arrasta', ok: () => !P.room.fora, fn: () => { const f = fwdH(); som((ac, t) => { const g = E.saida({ x: P.pos.x + f.z * 3, y: .4, z: P.pos.z - f.x * 3 }, .4); E.burst(t, 2.4, 'lowpass', 700, 1, g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.22, t + 1.2); g.gain.exponentialRampToValueAtTime(.0001, t + 2.4); }); } }
  );
  window.__sustosMundo = { mem, L: () => L };
  return H;
}
