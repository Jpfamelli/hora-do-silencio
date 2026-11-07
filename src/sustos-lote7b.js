// SUSTOS E EVENTOS — Lote 7 (parte B): SOM E ATMOSFERA, os eventos roteirizados pelo ouvido.
// Instalado por src/sustos-lote7.js (instalarSustosL7b(E, K, H)). Um diretor próprio sorteia UM evento por vez,
// com intervalo longo, orçamento por capítulo/noite e nunca em perigo. Tudo procedural (WebAudio), sem assets.
// Nada roda no QA automático (navigator.webdriver) a não ser com window.__l7force (kit de fumaça).

export function instalarSustosL7b(E, K, H) {
  const { rand, pick, clamp, W, P, M, ANA, PROC, OPT } = E;
  const S = () => E.S;
  const { seguro, depois, agora, som, voz, respiracao, passoPos, batida, vacuo, atras, fwdH, dist2, marcarForte } = K;
  const { qa, jogando, perigoAtivo, dM, dp, sx, perto } = H;
  const AC = () => E.AC;
  const sub = (q, t, p) => { try { E.sub && E.sub(q, t, p); } catch (e) {} };
  const leg = t => sub('leg', t);
  const dentro = () => !(P.room && P.room.fora);
  const sala = () => (P.room && P.room.id) || '';
  const calmo = () => jogando() && !perigoAtivo() && !PROC.fase && !(M.ativo && dM() < 14);

  const B = {
    s: null, cap: {}, noite: {}, ult: -99, dirT: rand(60, 95),
    seg: null, radio: null, chamada: null, piano: null, chuv: null, choro: null, cama: null, quieto: 0, quietoAcum: 0,
    parado: 0, base: { x: 0, z: 0, yaw: 0 }, corrT: 0, shhT: -99, ultPos: { x: 0, z: 0 }, yawAnt: 0,
    salaAnt: null, deadPrev: false, estPrev: null, doorPrev: new Map(), portaRec: null, mudaDoor: null,
    visBanh: {}, visPat: 0, capSala: 0, pesc: null, orbita: null, conta: null, tab: null, estat: null,
    aoRaioN: 0, tosseOk: true, horaPrev: false, ultSomPerto: -99, nomeLia: null,
    chuvaMudo: null, ventoMudo: null, chuvaAte: 0, restChuva: null, hiddenPrev: false, coracaoFeito: false,
    ativos: [], tiqueN: 0
  };

  // ---------- utilidades ----------
  const reiniciaSeNovoJogo = () => { const s = S(); if (B.s !== s) { B.s = s; B.cap = {}; B.noite = {}; B.visBanh = {}; B.visPat = 0; B.tiqueN = 0; B.nomeLia = null; B.quieto = 0; B.doorPrev = new Map(); } };
  const kc = id => `${S().chapter}:${id}`;
  const usosCap = id => B.cap[kc(id)] || 0;
  const usosNoite = id => B.noite[id] || 0;
  const marca = id => { B.cap[kc(id)] = usosCap(id) + 1; B.noite[id] = usosNoite(id) + 1; };
  const rel = (fr, di, y = 1.5) => { const f = fwdH(); return { x: P.pos.x + f.x * fr - f.z * di, y, z: P.pos.z + f.z * fr + f.x * di }; };
  const polar = (ang, d, y = 1.5) => rel(Math.cos(ang) * d, Math.sin(ang) * d, y);
  const nomeLia = () => { if (B.nomeLia) return B.nomeLia; let n = 'Lia'; try { n = (JSON.parse(localStorage.getItem('hora-silencio-nome') || '""') || '').trim().slice(0, 16) || 'Lia'; } catch (e) {} return (B.nomeLia = n); };
  const VOGAIS = { a: [800, 1200], e: [500, 1800], i: [300, 2300], o: [500, 900], u: [320, 800] };
  const vg = c => VOGAIS[c] || VOGAIS.a;
  // sílabas (vogais) de um texto, para falar "com formantes"
  const silabas = (txt, max = 7) => (String(txt).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[aeiou]+/g) || ['a']).slice(0, max).map(v => v[0]);
  function falaVoz(pos, txt, o = {}) {
    const sl = silabas(txt, o.max || 7), d = o.sil || .2;
    sl.forEach((v, i) => dp(i * (d + .04), () => voz(pos, { f0: (o.f0 || 260) * (1 + (i % 3) * .03), vogais: [vg(v), vg(v)], dur: d, vol: o.vol || .07, sopro: !!o.sopro, wet: o.wet ?? .5, cai: o.cai || .92 })));
    return sl.length * (d + .04);
  }
  const tom = (pos, f, dur, vol, tipo = 'sine', bus = 'sfx', wet = .4, f1) => som((ac, t) => {
    const g = E.saida(pos, wet, bus), o = ac.createOscillator(); o.type = tipo; o.frequency.setValueAtTime(f, t); if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    o.connect(g); E.env(g, t, .004, vol, dur); o.start(t); o.stop(t + dur + .1);
  });
  const chiado = (pos, dur, vol = .12, f = 1900, bus = 'amb') => som((ac, t) => { const g = E.saida(pos, .2, bus); E.burst(t, dur, 'bandpass', f, 1.4, g); E.env(g, t, .01, vol, dur); });
  const estalo = (pos, v = .5) => som((ac, t) => { const g = E.saida(pos, .5, 'sfx'); E.burst(t, .05, 'highpass', 1800, 1, g); E.env(g, t, .001, v, .05); });
  const gotaF = (pos, f0 = 1100, vol = .06) => som((ac, t) => { const g = E.saida(pos, .6, 'amb'); const o = ac.createOscillator(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * .33, t + .08); o.connect(g); E.env(g, t, .002, vol, .1); o.start(t); o.stop(t + .15); });
  const batidaDura = (pos, v = .5) => batida(pos, v);
  function trancaSerie(n, ini, passo, fn) { for (let i = 0; i < n; i++) dp(ini + i * passo, () => fn(i)); }
  const cantoEscuro = () => { const r = P.room; if (!r) return perto(7); const cs = [[r.x0 + .8, r.z0 + .8], [r.x1 - .8, r.z0 + .8], [r.x0 + .8, r.z1 - .8], [r.x1 - .8, r.z1 - .8]]; cs.sort((a, b) => Math.hypot(b[0] - P.pos.x, b[1] - P.pos.z) - Math.hypot(a[0] - P.pos.x, a[1] - P.pos.z)); return { x: cs[0][0], y: .6, z: cs[0][1] }; };
  const artigo = nome => { const w = String(nome || '').split(' ')[0].toLowerCase(); return /a$/.test(w) ? 'na' : 'no'; };

  // mudos próprios da chuva e do vento (os nós do motor são reescritos todo quadro; o nosso fica no meio do caminho)
  function garantirMudos() {
    if (B.chuvaMudo || !AC() || !E.AMB || !E.AMB.chuva || !E.BUS || !E.BUS.amb) return !!B.chuvaMudo;
    try {
      const ac = AC();
      B.chuvaMudo = ac.createGain(); E.AMB.chuva.disconnect(); E.AMB.chuva.connect(B.chuvaMudo); B.chuvaMudo.connect(E.BUS.amb);
      if (E.AMB.vento) { B.ventoMudo = ac.createGain(); E.AMB.vento.disconnect(); E.AMB.vento.connect(B.ventoMudo); B.ventoMudo.connect(E.BUS.amb); }
    } catch (e) { B.chuvaMudo = null; return false; }
    return true;
  }
  function chuvaMuda(mudo, rapido) {
    if (!garantirMudos()) return;
    try { const t = AC().currentTime; for (const n of [B.chuvaMudo, B.ventoMudo]) if (n) { n.gain.cancelScheduledValues(t); n.gain.setTargetAtTime(mudo ? 0 : 1, t, rapido ? .015 : .4); } } catch (e) {}
    try { const CL = E.CLIMA; if (CL) { if (mudo && B.restChuva == null) B.restChuva = CL.chuvaOp; if (mudo) CL.chuvaOp = 0; else if (B.restChuva != null) { CL.chuvaOp = B.restChuva; B.restChuva = null; } } } catch (e) {}
  }
  function restaurarChuva() { if (B.chuvaAte || B.restChuva != null) { B.chuvaAte = 0; chuvaMuda(false, true); } }

  // ---------- algo mudou de lugar (corredor mudo, nona badalada) ----------
  function algoMudou() {
    const ds = W.doors.filter(d => !d.open && !d.grade && !d.arrombada && !(d.trava && d.trava()) && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 13 && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) > 3);
    if (!ds.length) return false;
    const d = pick(ds); E.setDoor(d, true, true); sx('rangido', [d.x, 1.2, d.z, .5, 'amb']); leg(T.mudou_leg); return true;
  }

  const T = Object.assign({
    falso_leg: '[passos dele, na sala ao lado... e param]',
    falso_lia: '(sem ar) Passos. Não... ou sim?',
    chuvapara_leg: '[a chuva e o vento cessaram de uma vez]',
    chuvapara_lia: '(baixinho) Só os meus passos.',
    chuvavolta_leg: '[a chuva volta, de uma só vez]',
    chuvavolta_voz: '...volta.',
    nuca_leg: '[uma respiração, colada atrás da sua cabeça]',
    mudo_leg: '[nenhum som. nem os seus passos]',
    mudou_leg: '[uma porta que estava fechada agora está aberta]',
    defas_leg: '[passos idênticos aos seus, um pouco atrás]',
    defas_fim_leg: '[um passo a mais, depois do último]',
    frente_leg: '[os seus passos soam à frente]',
    frente_lia: '(sussurra) Tá errado.',
    radio_leg: '[um rádio chia numa sala próxima]',
    radio_engasga: '[o locutor engasga e perde a frase]',
    chamada_ini: '[o alto-falante faz a chamada de 1979]',
    chamada_lia: '(pelo alto-falante) ...Lia.',
    chamada_fica: '(sem voz) Fica parada.',
    chamada_mexeu: '(pelo alto-falante, mais alto) LIA!',
    chamada_presente: '[uma criança responde "presente", longe. Não é você]',
    tres_leg: '[três vozes chamam o seu nome, de três lugares]',
    tres_real: '[a mais baixa repete, mais perto]',
    eco_nome_leg: '[o seu nome, na voz da Ana, atrás de você]',
    raiomudo_leg: '[um clarão... e nenhum trovão]',
    tosse_leg: '[uma tosse de criança, curta, a poucos passos]',
    nada_lia: 'Eu não ouço mais nada.',
    coracao_leg: '[o seu coração parou]',
    coracao_volta: '[ele volta, duplo]',
    chuveiro_leg: '[os chuveiros abrem, um a um]',
    chuveiro_ult: '[só o último box continua correndo]',
    chuveiro_fim: '[tudo fecha de uma vez]',
    bola_leg: '[uma bola de plástico quica, cada vez mais perto]',
    bola_para: '[ela rola e para, junto aos seus pés]',
    bola_atras: '[um quique, agora atrás de você]',
    porta_fecha_leg: '[a porta que você abriu fechou sozinha, devagar]',
    armario_leg: '[três batidas fracas, de dentro do armário]',
    armario_dentro: '[as batidas voltam, aqui dentro com você. e uma respiração que não é a sua]',
    piano_leg: '[um piano toca a cantiga, numa sala fechada]',
    piano_corta: '[o piano calou num acorde. o banco ainda balança]',
    portas_coro_leg: '[as portas rangem ao vento, em coro]',
    porta_muda_resp: '[atrás da porta que não rangeu, alguém prende o ar]',
    hora_lanterna: '[a lanterna morre com o sino]',
    hora_volta: '[a luz volta com uma falha elétrica]',
    relogio_leg: '[um rádio-relógio liga sozinho e toca uma cantiga desafinada]',
    relogio_parede: '[desligou... e a cantiga continua dentro da parede]',
    telefone_leg: '[um telefone toca atrás de uma parede onde não existe telefone]',
    telefone_perto: '[o toque está mais perto do que da outra vez]',
    sirene_leg: '[uma sirene vem de longe... e cala antes de chegar]',
    shh_leg: '[a casa faz "shhh", de quatro lugares]',
    cano_leg: '[uma criança fala pelo cano e erra o seu nome]',
    cano_gota: '[a torneira pinga uma gota escura e fecha]',
    choro_leg: '[um choro de criança, no canto para onde a luz aponta]',
    risada_leg: '[uma risada abafada, lá no alto da nave]',
    caixinha_leg: '[uma caixinha de música, desafinando e acelerando num canto escuro]',
    caixinha_fim: '[a corda acabou. A sala está vazia]',
    melodia_fecha: '[a melodia fechou. Quem a toca está logo atrás]',
    portas_seq_leg: '[três portas batem, cada uma mais perto]',
    pescoco_leg: '[um sopro quente, na nuca]',
    orbita_leg: '[um sussurro dá a volta em você]',
    orbita_para: '[o sussurro parou quando você olhou]',
    orbita_bu: '[um "bu" suave, colado ao ouvido]',
    conta_ini: 'Fique imóvel. Dez segundos.',
    conta_falha: '[a respiração parou... e veio de trás]',
    conta_ok: '(um sussurro) ...o relógio parou antes do sino...',
    telhado_leg: '[passos no telhado, de ponta a ponta]',
    telhado_para: '[os passos param bem em cima de você]',
    estatica_leg: '[estática no ouvido... uma frase, quase]',
    renasce_leg: '[o mundo volta devagar, como de baixo d\'água]',
    tabua_leg: '[uma tábua range onde você não pisou]',
    coro_leg: '[três rádios ligam, um a um, e sussurram a mesma frase]',
    coro_frase: 'a casa sabe o seu nome',
    loop_leg: '[a gota caiu diferente. Com uma sílaba humana]',
    tique_leg: '[um relógio tiquetaqueia, em algum lugar]',
    tique_para: '[o relógio parou. Alguém chegou]',
    cama_leg: '[uma cama bem feita ronca baixinho]',
    cama_para: '[o ronco parou de uma vez. Os lençóis se mexeram]',
    alivio_leg: '[um acorde suave... e uma porta, muito longe]',
    escada_leg: '[passos sobem a escada, degrau por degrau, e param no último]',
    assovio_leg: '[um assovio grave... e uma porta bate]',
    contradiz_leg: '[a porta range abrindo, mas continua fechada]',
    nao_paga: '[o silêncio voltou... e passou]',
    reverso_leg: '[o ar da sala é puxado, e solta]'
  }, (E.R && E.R.sustos7b) || {});

  // =====================================================================================================
  // EVENTOS DO DIRETOR (cada um é um susto de ouvido; nenhum causa dano)
  // =====================================================================================================
  // 1. O som falso: passos dele numa sala vizinha, sem ninguém. Ensina a duvidar.
  function evSomFalso() {
    marca('falso'); const a = rand(0, 6.28), n = 7; let d = 13;
    for (let i = 0; i < n; i++) dp(i * .68, () => { d -= .9; passoPos({ x: P.pos.x + Math.cos(a) * d, y: .1, z: P.pos.z + Math.sin(a) * d }, .62); });
    leg(T.falso_leg); dp(1, () => sub('lia', T.falso_lia));
  }
  // 2. A chuva e o vento param de uma vez; 8 s de campo aberto; volta no fim da frase de uma voz que ninguém viu falar.
  function evChuvaPara() {
    marca('chuvapara'); B.chuvaAte = agora() + 9.4; chuvaMuda(true, true); sx('silencio', [8.4, .2, false]);
    gotaF({ x: P.pos.x + 1, y: 1, z: P.pos.z }, 340, .16); leg(T.chuvapara_leg); dp(2.2, () => sub('lia', T.chuvapara_lia));
    dp(6.6, () => falaVoz(perto(15), T.chuvavolta_voz, { f0: 190, vol: .1, sil: .32, cai: .78 }));
    dp(8.7, () => { restaurarChuva(); leg(T.chuvavolta_leg); });
  }
  // 3. Susto só de ouvido: o mundo cala por 1,6 s e alguém respira colado atrás da cabeça. Se ela vira, nada.
  function evRespiraNuca() {
    marca('nuca'); vacuo(1.6, 0); sx('silencio', [8, .03, true]);
    dp(1.7, () => { respiracao(atras(.2), 5, false, .85); leg(T.nuca_leg); try { if (!OPT.semTremor) P.shake = Math.max(P.shake || 0, .012); } catch (e) {} });
  }
  // 4. Silêncio total no corredor longo: nem passos nem respiração por 6 s; ao voltar, algo mudou de lugar.
  function evCorredorMudo() {
    marca('corrmudo'); vacuo(6, 0); leg(T.mudo_leg);
    dp(6.4, () => { if (!algoMudou()) sx('rangido', [P.pos.x, 1, P.pos.z - 4, .4, 'amb']); marcarForte(); });
  }
  // 5/6. Passos que saem do compasso, ou que soam à frente.
  function evPassosDefasados(modo) { marca(modo === 'frente' ? 'passosfrente' : 'defas'); B.seg = { modo, n: 0, ult: agora(), t0: agora() }; if (modo === 'frente') { leg(T.frente_leg); dp(1.4, () => sub('lia', T.frente_lia)); } else leg(T.defas_leg); }
  function passoSeg() {
    const g = B.seg; if (!g) return; g.n++; g.ult = agora();
    if (g.modo === 'frente') { const a = rel(2.8, g.n % 2 ? .35 : -.35, .1); passoPos(a, .5); return; }
    const atraso = .42 - g.n * .024;
    if (atraso > .03) dp(atraso, () => passoPos(atras(1.9), .5));
    else if (atraso > -.2) passoPos(atras(1.1), .5);
    else passoPos(rel(2.4, g.n % 2 ? .3 : -.3, .1), .5);
    if (g.n > 28) B.seg = null;
  }
  function updSeg() {
    const g = B.seg; if (!g) return;
    const parou = agora() - g.ult > 1.1 || (g.modo === 'frente' && agora() - g.t0 > 6);
    if (perigoAtivo()) { B.seg = null; return; }
    if (parou) { B.seg = null; if (g.modo !== 'frente' && g.n >= 14) { passoPos(atras(1.2), .5); leg(T.defas_fim_leg); } }
  }
  // 7. O rádio que narra o que ela acaba de fazer (e, às vezes, o que ainda vai fazer).
  function artSala(r) { return r ? `${artigo(r.nome)} ${String(r.nome).toLowerCase()}` : 'no escuro'; }
  function evRadioNarra() {
    marca('radio'); const p = perto(9); B.radio = { pos: { x: p.x, y: 1.2, z: p.z }, fim: agora() + 55, atraso: pick([2, 8]), linhas: 0, esp: null, doorN: W.doors.filter(d => d.open).length, crouch: !!P.crouch, lan: !!S().flashOn, sala: P.room, fila: [] };
    chiado(B.radio.pos, 1.1, .1); leg(T.radio_leg);
  }
  function radioFala(txt, preditivo) {
    const R = B.radio; if (!R) return;
    chiado(R.pos, .35, .1, 1700, 'sfx'); dp(.25, () => falaVoz(R.pos, txt, { f0: 170, vol: .085, sopro: false, wet: .8, sil: .18 }));
    sub('leg', `[no rádio, entre chiados] "${txt}"`); R.linhas++;
    if (Math.random() < .5) E.emitNoise(R.pos.x, R.pos.z, 6, false);
    if (preditivo) R.esp = { ate: agora() + 11, doorN: W.doors.filter(d => d.open).length, sala: P.room };
  }
  function updRadio(dt) {
    const R = B.radio; if (!R) return;
    if (agora() > R.fim || R.linhas >= 6 || perigoAtivo()) { chiado(R.pos, .5, .08); B.radio = null; return; }
    const dispara = txt => { const pre = Math.random() < .3; dp(R.atraso, () => radioFala(txt, false)); if (pre) { const dd = W.doors.filter(d => !d.open && !(d.trava && d.trava()) && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 7)[0]; if (dd) dp(R.atraso + 2.4, () => radioFala('atrás dela, a porta', true)); } };
    if (P.room !== R.sala) { R.sala = P.room; dispara(`ela entrou ${artSala(P.room)}`); if (R.esp) R.esp.sala = P.room; }
    else if (!!P.crouch !== R.crouch) { R.crouch = !!P.crouch; dispara(R.crouch ? 'ela se agachou' : 'ela se levantou'); }
    else if (!!S().flashOn !== R.lan) { R.lan = !!S().flashOn; dispara(R.lan ? 'ela acendeu a lanterna' : 'ela apagou a lanterna'); }
    if (R.esp) {
      const n = W.doors.filter(d => d.open).length;
      if (n !== R.esp.doorN || P.room !== R.esp.sala) R.esp = null;                       // fez o que a voz previu
      else if (agora() > R.esp.ate) { R.esp = null; chiado(R.pos, .7, .16, 900, 'sfx'); leg(T.radio_engasga); }  // contrariou: a voz engasga
    }
  }
  // 8. A chamada de presença de 1979: quando chamam "Lia", 5 s parada. Mexeu: a voz repete mais alto e ele ouve.
  function evChamada() {
    marca('chamada'); const nomes = ['Davi', 'Clara', 'Joaquim', 'Marta'], c = { x: P.pos.x, y: 3, z: P.pos.z };
    leg(T.chamada_ini); nomes.forEach((n, i) => dp(i * 1.25, () => falaVoz(c, n, { f0: 150, vol: .08, sil: .3, wet: .9, cai: .85 })));
    dp(5.2, () => { falaVoz(c, nomeLia(), { f0: 150, vol: .1, sil: .34, wet: .9, cai: .8 }); sub('leg', T.chamada_lia); sub('lia', T.chamada_fica); B.chamada = { ate: agora() + 5.4, x: P.pos.x, z: P.pos.z, ok: false }; });
  }
  function updChamada() {
    const c = B.chamada; if (!c) return;
    if (Math.hypot(P.pos.x - c.x, P.pos.z - c.z) > .7 || P.sprinting) { B.chamada = null; falaVoz({ x: P.pos.x, y: 3, z: P.pos.z }, nomeLia(), { f0: 140, vol: .2, sil: .34, wet: 1, cai: .75 }); sub('leg', T.chamada_mexeu); E.emitNoise(P.pos.x, P.pos.z, 15, true); marcarForte(); return; }
    if (agora() > c.ate) { B.chamada = null; const p = perto(18); falaVoz(p, 'presente', { f0: 520, vol: .09, sil: .25, wet: .7 }); dp(.9, () => sub('leg', T.chamada_presente)); }
  }
  // 9. Três vozes chamam o nome ao mesmo tempo de lugares diferentes; a mais baixa é a verdadeira.
  function evTresVozes() {
    marca('tres'); const base = rand(0, 6.28), real = (Math.random() * 3) | 0, f0s = [520, 215, 310], nome = nomeLia();
    leg(T.tres_leg); for (let i = 0; i < 3; i++) { const p = polar(base + i * 2.09, rand(5, 9)); dp(i * .18, () => falaVoz(p, nome, { f0: f0s[i], vol: i === real ? .045 : .09, sil: .32, wet: .8, cai: .85 })); }
    const pr = polar(base + real * 2.09, 3.2); dp(6, () => { falaVoz(pr, nome, { f0: f0s[real], vol: .06, sil: .34, wet: .7, cai: .8 }); leg(T.tres_real); });
  }
  // 10. A casa repete o seu nome com o timbre da Ana.
  function evEcoNome() { marca('econome'); dp(1, () => { falaVoz(atras(2.3), nomeLia(), { f0: 540, vol: .08, sil: .36, wet: .9, cai: .72 }); leg(T.eco_nome_leg); }); }
  // 11. O silêncio que não paga: 4 s sem nada; um em cada três vezes não acontece nada depois.
  function evSilencioQuatro() {
    marca('sil4'); const n = usosNoite('sil4'); sx('silencio', [4, .0, true]); vacuo(.6, .02); sub('lia', T.nada_lia);
    const paga = n % 3 !== 0, falso = n % 4 === 0;
    if (!paga) { dp(4.3, () => leg(T.nao_paga)); return; }
    dp(4.2, () => { const p = rel(-2.5, rand(-1.5, 1.5)); sx('rangido', [p.x, 1.1, p.z, .6, 'sfx']); marcarForte(); });
    if (falso) dp(3.4, () => { const p = rel(-3, 2); sx('rangido', [p.x, 1.1, p.z, .35, 'sfx']); });
  }
  // 12. Uma tosse de criança depois de um silêncio longo (25 s sem som relevante).
  function evTosse() {
    marca('tosse'); const p = polar(rand(0, 6.28), 3, 1.1);
    som((ac, t) => { for (const k of [0, .19]) { const g = E.saida(p, .5, 'voz'); E.burst(t + k, .13, 'bandpass', 950 - k * 500, 2.2, g); E.env(g, t + k, .004, .32, .12); } });
    voz(p, { f0: 280, vogais: [vg('a'), vg('o')], dur: .2, vol: .06, sopro: true }); leg(T.tosse_leg);
  }
  // 13. O coração para por 2 s com ele passando rente à porta do esconderijo; volta duplo.
  function evCoracaoEscondido() {
    B.coracaoFeito = true; vacuo(2, 0); leg(T.coracao_leg);
    dp(2.1, () => { sx('coracao', [1]); dp(.12, () => sx('coracao', [.9])); leg(T.coracao_volta); });
  }
  // 14. Chuveiros em cadeia no banheiro: abrem um a um; só o último continua; fecham quando ela olha.
  function agua(pos) {
    let fonte = null;
    som((ac, t) => { const g = E.saida(pos, .5, 'amb'), s = E.ruido(true), f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 3400; f.Q.value = .5; s.connect(f); f.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.2, t + .9); s.start(t); fonte = { g, s }; });
    return { fecha: () => { if (!fonte) return; try { const t = AC().currentTime; fonte.g.gain.cancelScheduledValues(t); fonte.g.gain.setTargetAtTime(0, t, .03); fonte.s.stop(t + .3); } catch (e) {} } };
  }
  function evChuveiros() {
    marca('chuv'); const r = P.room, n = 5, w = (r.x1 - r.x0 - 1) / n, fs = [];
    leg(T.chuveiro_leg); for (let i = 0; i < n; i++) { const p = { x: r.x0 + .5 + w * (i + .5), y: 2, z: r.z0 + 1 }; dp(i * 1.1, () => fs.push({ p, a: agua(p) })); }
    dp(n * 1.1 + .5, () => { for (let i = 0; i < fs.length - 1; i++) fs[i].a.fecha(); leg(T.chuveiro_ult); });
    B.chuv = { fs, sala: sala(), ate: agora() + n * 1.1 + 14, ini: agora() + n * 1.1 + 1.5 };
  }
  function updChuv() {
    const c = B.chuv; if (!c) return;
    if (agora() < c.ini) return;
    const u = c.fs[c.fs.length - 1], f = fwdH(); let olhou = false;
    if (u) { const dx = u.p.x - P.pos.x, dz = u.p.z - P.pos.z, l = Math.hypot(dx, dz) || 1; olhou = (dx / l * f.x + dz / l * f.z) > .88 && l < 9; }
    if (olhou || agora() > c.ate || sala() !== c.sala) { B.chuv = null; for (const x of c.fs) x.a.fecha(); if (u) batida(u.p, .4); leg(T.chuveiro_fim); }
  }
  // 15. A bola que quica corredor adentro e para junto aos pés da Lia.
  function evBola() {
    marca('bola'); const r = P.room, f = fwdH(), dist = [14, 10.6, 7.6, 5.2, 3.2, 1.6], gaps = [0, .95, .85, .72, .6, .5];
    let t = 0; leg(T.bola_leg);
    dist.forEach((d, i) => { t += gaps[i]; dp(t, () => { const p = { x: clamp(P.pos.x + f.x * d, r.x0 + .4, r.x1 - .4), y: .15, z: clamp(P.pos.z + f.z * d, r.z0 + .4, r.z1 - .4) }; tom(p, 260 - i * 10, .1, .5, 'sine', 'sfx', .5, 150); chiado(p, .05, .22, 2400, 'sfx'); }); });
    dp(t + .5, () => { som((ac, tt) => { const g = E.saida({ x: P.pos.x + f.x * .8, y: .1, z: P.pos.z + f.z * .8 }, .3, 'sfx'); E.burst(tt, 1.2, 'lowpass', 600, 1, g, 0); g.gain.setValueAtTime(.0001, tt); g.gain.linearRampToValueAtTime(.12, tt + .1); g.gain.linearRampToValueAtTime(0, tt + 1.2); }); leg(T.bola_para); });
    if (Math.random() < .5) dp(t + 14, () => { if (!perigoAtivo()) { const p = atras(2.2); tom({ x: p.x, y: .15, z: p.z }, 250, .1, .5, 'sine', 'sfx', .5, 150); leg(T.bola_atras); } });
  }
  // 16. Uma porta que você abriu fecha sozinha às suas costas 20 a 40 s depois, com rangido lento.
  function updPortas(dt) {
    for (const d of W.doors) {
      const antes = B.doorPrev.get(d);
      if (antes === false && d.open && !B.portaRec && usosCap('portafecha') < 1 && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 3.2 && !d.grade && !(d.trava && d.trava()) && calmo() && !qa()) B.portaRec = { d, t: agora() + rand(20, 40) };
      B.doorPrev.set(d, !!d.open);
    }
    const r = B.portaRec; if (!r || agora() < r.t) return;
    B.portaRec = null; const d = r.d;
    if (!d.open || d.arrombada || Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 2.5 || perigoAtivo() || !jogando()) return;
    marca('portafecha'); E.setDoor(d, false, true); sx('rangido', [d.x, 1.2, d.z, .9, 'sfx', true]); dp(1.2, () => { tom({ x: d.x, y: 1, z: d.z }, 900, .06, .3, 'square', 'sfx', .3); }); leg(T.porta_fecha_leg);
  }
  // 17. Armário que bate por dentro; se ela se esconde nele depois, as batidas voltam com ela.
  function updArmarios() {
    if (qa() || !jogando() || S().hidden) return;
    for (const L of W.lockers) {
      if (L.tipo !== 'armario' || L.l7 !== undefined) continue;
      if (Math.hypot(L.x - P.pos.x, L.z - P.pos.z) < 1.9) {
        L.l7 = Math.random() < .34 && calmo() && usosNoite('armbate') < 2;
        if (L.l7) { marca('armbate'); const p = { x: L.x, y: 1.2, z: L.z }; trancaSerie(3, .6, .55, () => batidaDura(p, .22)); leg(T.armario_leg); }
      }
    }
  }
  // 18. O piano que cala quando a porta abre.
  function evPiano() {
    marca('piano'); const id = W.mapa === 'superior' ? 'brinq' : 'biblio', r = W.salas.find(x => x.id === id); if (!r) return;
    if (P.room === r) return;
    const pos = { x: (r.x0 + r.x1) / 2, y: 1.3, z: (r.z0 + r.z1) / 2 };
    B.piano = { r, pos, ate: agora() + 48, i: 0, prox: 0 }; leg(T.piano_leg);
  }
  const CANTIGA = [392, 440, 392, 330, 349, 330, 294, 262, 330, 392, 440, 392, 349, 330, 294];
  function nota(pos, f, dur = .9, vol = .13) { som((ac, t) => { const g = E.saida(pos, .7, 'amb'); for (const [m, v] of [[1, 1], [2.01, .35], [3.02, .15]]) { const o = ac.createOscillator(); o.type = 'triangle'; o.frequency.value = f * m; const gg = ac.createGain(); gg.gain.value = v; o.connect(gg); gg.connect(g); o.start(t); o.stop(t + dur + .1); } E.env(g, t, .006, vol, dur); }); }
  function updPiano() {
    const p = B.piano; if (!p) return;
    if (P.room === p.r) { B.piano = null; for (const f of [262, 277, 370, 392]) nota(p.pos, f, 1.6, .2); leg(T.piano_corta); marcarForte(); return; }
    if (agora() > p.ate) { B.piano = null; return; }
    if (agora() >= p.prox) { nota(p.pos, CANTIGA[p.i % CANTIGA.length], .8); p.i++; p.prox = agora() + (p.i % 5 === 0 ? 1.4 : .52); }
  }
  // 19. A porta que não range: todas rangem em coro, uma não.
  function evPortaMuda() {
    marca('portamuda'); const ds = W.doors.filter(d => !d.grade && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 24); if (ds.length < 3) return;
    const muda = pick(ds); B.mudaDoor = muda; leg(T.portas_coro_leg);
    ds.filter(d => d !== muda).forEach((d, i) => dp(i * .28, () => sx('rangido', [d.x, 1.2, d.z, .45, 'amb'])));
  }
  function updPortaMuda() {
    const d = B.mudaDoor; if (!d) return;
    if (d.open && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 3.5) { B.mudaDoor = null; respiracao({ x: d.x, y: 1.4, z: d.z }, 2.4, true, .5); leg(T.porta_muda_resp); marcarForte(); }
  }
  // 20. Rádio-relógio às 3h07: liga sozinho, toca uma cantiga desafinada; quando "desligam", ela segue dentro da parede.
  function evRadioRelogio() {
    marca('relogio'); const p = perto(8), pos = { x: p.x, y: .9, z: p.z }; leg(T.relogio_leg); E.emitNoise(pos.x, pos.z, 12, false);
    const notas = [262, 330, 392, 330, 262, 294, 349, 294, 247, 294, 330, 262];
    notas.forEach((f, i) => dp(i * .62, () => voz(pos, { f0: f * (1 + (i % 2 ? .012 : -.015)), vogais: [vg('a'), vg('o')], dur: .55, vol: .07, wet: .8, cai: .96 })));
    dp(notas.length * .62, () => { leg(T.relogio_parede); const dentro = { x: pos.x, y: 2.4, z: pos.z }; [262, 294, 247, 262].forEach((f, i) => dp(i * .8, () => nota(dentro, f * .5, .9, .06))); });
  }
  // 21. O telefone que toca atrás de uma parede: a cada vez mais perto; o Inspetor também ouve.
  function toque(pos) { som((ac, t) => { for (let k = 0; k < 4; k++) { const g = E.saida(pos, .5, 'sfx'), o = ac.createOscillator(), m = ac.createOscillator(), mg = ac.createGain(); o.type = 'square'; o.frequency.value = 1380; m.frequency.value = 22; mg.gain.value = 700; m.connect(mg); mg.connect(o.frequency); o.connect(g); E.env(g, t + k * .5, .005, .09, .38); o.start(t + k * .5); m.start(t + k * .5); o.stop(t + k * .5 + .45); m.stop(t + k * .5 + .45); } }); }
  function evTelefone() {
    marca('telefone'); const n = usosNoite('telefone'), d = Math.max(4, 12 - n * 3.2), p = polar(rand(0, 6.28), d, 1.2); leg(n > 1 ? T.telefone_perto : T.telefone_leg);
    toque(p); dp(2.4, () => toque(p)); E.emitNoise(p.x, p.z, 13, false);
  }
  // 22. A sirene que sobe de longe e cala antes de chegar. Uma vez por jogo.
  function evSirene() {
    marca('sirene'); const a = rand(0, 6.28);
    som((ac, t) => { const p = { x: P.pos.x + Math.cos(a) * 24, y: 2, z: P.pos.z + Math.sin(a) * 24 }, g = E.saida(p, .6, 'sfx'), o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(240, t); o.frequency.linearRampToValueAtTime(520, t + 5); o.frequency.linearRampToValueAtTime(300, t + 8); const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; o.connect(lp); lp.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.18, t + 6.5); g.gain.setValueAtTime(0, t + 6.6); o.start(t); o.stop(t + 8.2); });
    leg(T.sirene_leg);
  }
  // 23. A casa diz "shhh" para quem corre sem necessidade.
  function evShh() {
    B.shhT = agora(); leg(T.shh_leg);
    for (let i = 0; i < 4; i++) { const p = polar(i * 1.57 + rand(-.3, .3), rand(3, 5)); dp(i * .22, () => som((ac, t) => { const g = E.saida(p, .5, 'amb'), f = E.burst(t, .9, 'bandpass', 4200, 1.8, g); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.13, t + .3); g.gain.linearRampToValueAtTime(.0001, t + .9); })); }
  }
  // 24. A voz que fala pelo cano do banheiro e erra o nome.
  function evCano() {
    marca('cano'); const p = { x: P.pos.x + rand(-2, 2), y: 2.6, z: P.pos.z + rand(-2, 2) }, errado = pick(['Lúcia', 'Lila', 'Lídia']);
    leg(T.cano_leg); falaVoz(p, errado, { f0: 480, vol: .09, sil: .3, wet: 1, cai: .8 }); dp(2.4, () => { gotaF(p, 700, .12); leg(T.cano_gota); });
  }
  // 25. O choro que acompanha a lanterna (monitor contínuo)
  function updChoro(dt) {
    const s = S(); if (!s.flashOn || !dentro() || P.room.tipo === 'corredor' || perigoAtivo() || qa() || s.hidden) { if (B.choro && B.choro.on) cortaChoro(); B.choro = null; return; }
    const r = P.room, f = fwdH(); let alvo = null;
    for (const c of [[r.x0 + .8, r.z0 + .8], [r.x1 - .8, r.z0 + .8], [r.x0 + .8, r.z1 - .8], [r.x1 - .8, r.z1 - .8]]) { const dx = c[0] - P.pos.x, dz = c[1] - P.pos.z, l = Math.hypot(dx, dz); if (l > 2 && l < 10 && (dx / l * f.x + dz / l * f.z) > .96) alvo = { x: c[0], y: .6, z: c[1] }; }
    if (!B.choro) B.choro = { t: 0, on: false, prox: 0, v: .03, vezes: 0 };
    const c = B.choro;
    if (alvo) { c.t += dt; if (c.t > 2 && usosNoite('choro') < 3 + (c.on ? 99 : 0)) { if (!c.on) { c.on = true; marca('choro'); leg(T.choro_leg); } if (agora() >= c.prox) { c.prox = agora() + .75; c.v = Math.min(.14, c.v + .012); voz(alvo, { f0: 560, vogais: [vg('a'), vg('i'), vg('a')], dur: .55, vol: c.v, wet: .7, cai: .8 }); } } }
    else { c.t = 0; if (c.on) cortaChoro(); }
  }
  function cortaChoro() { if (B.choro) { B.choro.on = false; B.choro.t = -3; B.choro.v = .03; } sx('silencio', [.5, .1, true]); }
  // 26. Risada abafada no alto da nave da capela; cada passagem, mais perto do chão.
  function updCapela(dt) {
    if (W.mapa !== 'cemiterio' || sala() !== 'capela' || qa() || perigoAtivo()) { B.capSala = 0; return; }
    B.capSala += dt;
    if (B.capSala > 6 && usosNoite('risada') < 4 && agora() - (B.ultRisada ?? -99) > 18) {
      B.ultRisada = agora(); const n = usosNoite('risada'); marca('risada'); B.capSala = 0;
      const p = { x: P.pos.x + rand(-2, 2), y: Math.max(1.4, 6 - n * 1.4), z: P.pos.z + rand(-2, 2) };
      trancaSerie(4, 0, .17, i => voz(p, { f0: 640 - i * 30, vogais: [vg('a'), vg('a')], dur: .12, vol: .06, wet: .9 })); leg(T.risada_leg);
    }
  }
  // 27. A caixinha de música sem cantiga: desafina e acelera; ao chegar, a sala está vazia.
  function evCaixinhaVazia() {
    marca('caixinha'); const pos = cantoEscuro(), notas = [523, 587, 659, 523, 523, 587, 659, 523, 659, 698, 784, 659, 698, 784];
    let t = 0, iv = .55; leg(T.caixinha_leg);
    notas.forEach((f, i) => { dp(t, () => caixa(pos, f * (1 - i * .006))); t += iv; iv *= .93; });
    dp(t + .2, () => { som((ac, tt) => { const g = E.saida(pos, .5, 'amb'); E.burst(tt, .06, 'bandpass', 2600, 8, g); E.env(g, tt, .001, .2, .06); }); });
    B.caixaSala = { r: P.room, ate: agora() + t + 25 };
  }
  function caixa(pos, f, vol = .1) { som((ac, t) => { const g = E.saida(pos, .8, 'amb'); for (const [m, v] of [[1, 1], [2.76, .4], [5.4, .15]]) { const o = ac.createOscillator(); o.frequency.value = f * m; const gg = ac.createGain(); gg.gain.value = v; o.connect(gg); gg.connect(g); o.start(t); o.stop(t + .6); } E.env(g, t, .002, vol, .5); }); }
  // 28. A melodia que resolve é perigo: incompleta é segura; se fecha na tônica, a Ana está atrás.
  function evMelodiaFecha() {
    marca('melodia'); const n = usosNoite('melodia'), pos = perto(7), base = [523, 587, 659, 698, 784, 880], fim = n >= 3 ? 523 : 988;
    [...base, fim].forEach((f, i) => dp(i * .5, () => caixa(pos, f, .11)));
    if (n >= 3) dp(3.9, () => { respiracao(atras(.4), 3, false, .5); leg(T.melodia_fecha); marcarForte(); });
  }
  // 29. Três portas batem em salas cada vez mais próximas, pelo mapa real de portas.
  function evPortasSeq() {
    const ds = W.doors.filter(d => !d.grade && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 40 && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) > 5).sort((a, b) => Math.hypot(b.x - P.pos.x, b.z - P.pos.z) - Math.hypot(a.x - P.pos.x, a.z - P.pos.z));
    if (ds.length < 3) return; marca('portasseq'); const sel = [ds[0], ds[(ds.length / 2) | 0], ds[ds.length - 1]]; leg(T.portas_seq_leg);
    sel.forEach((d, i) => dp(i * 2, () => { sx('portaLonge', [{ x: d.x, z: d.z }]); if (i === 2 && M.ativo && M.state !== 'caca' && Math.random() < .5) E.emitNoise(d.x, d.z, 10, false); }));
  }
  // 30. Respiração na nuca de quem fica de costas parado 10 s num corredor (monitor)
  function updPesc(dt) {
    if (!dentro() || P.room.tipo !== 'corredor' || !calmo() || qa() || usosNoite('pesc') >= 2) { B.pesc = null; return; }
    if (B.parado < 10) { B.pesc = null; return; }
    if (!B.pesc) { B.pesc = { t: 0, real: Math.random() < 1 / 6, yaw: P.yaw }; marca('pesc'); leg(T.pescoco_leg); }
    const c = B.pesc; c.t += dt; if (c.t < 3.6 && Math.round(c.t * 2) % 3 === 0 && agora() - (c.u || 0) > 1.3) { c.u = agora(); respiracao(atras(.25), 1.4, false, c.real ? .95 : .7); }
    if (Math.abs(angDif(P.yaw, c.yaw)) > .9 && !c.v) { c.v = true; if (c.real) { E.SFX.susto && E.SFX.susto(); E.emitNoise(P.pos.x, P.pos.z, 12, true); } else respiracao(atras(3.5), 1.2, false, .25); }
  }
  const angDif = (a, b) => { let d = a - b; while (d > Math.PI) d -= 6.283; while (d < -Math.PI) d += 6.283; return d; };
  // 31. O sussurro que dá a volta: se ela olha na direção dele, ele cala; se não, termina com um "bu".
  function evOrbita() {
    marca('orbita'); const angs = [-1.57, -2.5, 2.5, 1.57]; B.orbita = { i: 0, prox: agora(), angs }; leg(T.orbita_leg);
  }
  function updOrbita() {
    const o = B.orbita; if (!o) return;
    if (perigoAtivo()) { B.orbita = null; return; }
    if (o.i > 0) { const p = polar(o.angs[o.i - 1], 3), dx = p.x - P.pos.x, dz = p.z - P.pos.z, l = Math.hypot(dx, dz) || 1, f = fwdH(); if ((dx / l * f.x + dz / l * f.z) > .82) { B.orbita = null; leg(T.orbita_para); return; } }
    if (agora() < o.prox) return;
    if (o.i >= o.angs.length) { B.orbita = null; voz(atras(.35), { f0: 200, vogais: [vg('u'), vg('u')], dur: .3, vol: .1, sopro: false }); leg(T.orbita_bu); return; }
    const p = polar(o.angs[o.i], 3); voz(p, { f0: 250, vogais: [vg('e'), vg('i'), vg('a')], dur: .95, vol: .065, sopro: true }); o.i++; o.prox = agora() + 1;
  }
  // 32. Contagem silenciosa no quarto da Celeste: 10 s imóvel; se mexe, a respiração vem de trás.
  function updConta(dt) {
    const s = S();
    if (!B.conta) {
      if (W.mapa === 'superior' && sala() === 'celeste' && s.chapter === 3 && !usosNoite('conta') && calmo() && !qa()) { marca('conta'); B.conta = { t: 0, x: P.pos.x, z: P.pos.z, yaw: P.yaw }; sub('lia', T.conta_ini, true); }
      return;
    }
    const c = B.conta; c.t += dt;
    if (c.t < 1.2) { c.x = P.pos.x; c.z = P.pos.z; c.yaw = P.yaw; return; }
    if (Math.hypot(P.pos.x - c.x, P.pos.z - c.z) > .3 || Math.abs(angDif(P.yaw, c.yaw)) > .55 || P.sprinting) { B.conta = null; respiracao(atras(.3), 2.5, false, .9); leg(T.conta_falha); marcarForte(); return; }
    if (c.t < 11.2) { if (Math.floor(c.t * 1.2) !== c.u) { c.u = Math.floor(c.t * 1.2); respiracao(polar(c.t * .6, 1.5), 1.3, false, .4); } return; }
    B.conta = null; falaVoz(atras(.4), 'o relogio parou antes do sino', { f0: 240, vol: .07, sopro: true, sil: .2, max: 9 }); sub('leg', T.conta_ok);
  }
  // 33. Algo anda no telhado de ponta a ponta e para bem em cima de onde ela está.
  function evTelhado() {
    marca('telhado'); const n = 22, a = rand(0, 6.28), dx = Math.cos(a), dz = Math.sin(a); let t = 0, parou = false;
    leg(T.telhado_leg);
    for (let i = 0; i < n; i++) {
      const d = -15 + i * 1.4; t += .5; const pos = { x: P.pos.x + dx * d, y: 5, z: P.pos.z + dz * d };
      dp(t, () => { passoPos(pos, .5); if (i % 3 === 0) sx('rangido', [pos.x, 5, pos.z, .25, 'amb']); });
      if (!parou && d > -1.2) { parou = true; t += 3; dp(t - 3, () => leg(T.telhado_para)); }
    }
  }
  // 34. Sussurro na estática: parada 3 s, a estática abre numa frase; se mexe, some. Uma frase por capítulo (algumas mentem).
  const FRASES = { 0: 'o posto ainda está aberto', 1: 'a luz volta quando você não olha', 2: 'ele não ouve quem respira devagar', 3: 'a menina nunca mente', 4: 'a gaveta tem duas chaves', 5: 'o sino toca para quem fica' };
  function updEstatica(dt) {
    const e = B.estat;
    if (!calmo() || qa() || !dentro() || usosCap('estatica') >= 1) { B.estat = null; return; }
    if (B.parado < 3) { B.estat = null; return; }
    if (!e) { B.estat = { t: 0, v: 0 }; marca('estatica'); chiado(atras(.5), 1.1, .13, 3000, 'sfx'); leg(T.estatica_leg); const f = FRASES[S().chapter] || FRASES[1]; dp(.8, () => { if (B.parado >= 3) { falaVoz(atras(.5), f, { f0: 240, vol: .06, sopro: true, sil: .17, max: 9 }); sub('leg', `[estática] "${f}"`); } }); }
  }
  // 35. Renascer debaixo d'água: o mundo volta devagar, o coração em primeiro plano; o primeiro som claro é uma gota.
  function renascer() {
    som((ac, t) => { const g = E.master.gain, vol = OPT.vol; g.cancelScheduledValues(t); g.setValueAtTime(vol * .07, t); g.linearRampToValueAtTime(vol * .7, t + 4.6); g.linearRampToValueAtTime(vol, t + 5.4); });
    sx('coracao', [1]); dp(.7, () => sx('coracao', [1])); dp(1.5, () => gotaF({ x: P.pos.x + 1.4, y: 1.5, z: P.pos.z - 1 }, 1100, .13)); leg(T.renasce_leg);
  }
  // 36. Uma tábua que range a cada passo sem que ela pise; vai ficando para trás; some quando ela corre.
  function passoTabua() {
    const t = B.tab; if (!t) return;
    if (P.sprinting) { B.tab = null; return; }
    t.n++; if (t.n < 3) return; if (t.n === 3) leg(T.tabua_leg);
    const p = atras(1.3 + (t.n - 3) * .35); sx('rangido', [p.x, .1, p.z, .35, 'amb']); if (t.n > 17) B.tab = null;
  }
  // 37. Coro de rádios.
  function evCoroRadios() {
    marca('coro'); leg(T.coro_leg); const ps = [0, 2.1, 4.2].map(a => polar(a + rand(-.4, .4), rand(4, 7)));
    ps.forEach((p, i) => { dp(i * .9, () => chiado(p, .6, .1, 1800, 'sfx')); });
    dp(2.6, () => ps.forEach((p, i) => dp(i * .5, () => falaVoz(p, T.coro_frase, { f0: 250, vol: .06, sopro: true, sil: .17, max: 8 }))));
    dp(5.4, () => ps.forEach(p => falaVoz(p, T.coro_frase, { f0: 250, vol: .07, sopro: true, sil: .17, max: 8 })));
  }
  // 38. O som que se repete idêntico três vezes... e na quarta vem errado.
  function evLoop() {
    marca('loop'); const p = perto(5), f = rand(900, 1300); const pos = { x: p.x, y: 1.6, z: p.z };
    for (let i = 0; i < 3; i++) dp(i * 4.5, () => gotaF(pos, f, .07));
    dp(13.5, () => { gotaF({ x: pos.x - (pos.x - P.pos.x) * .45, y: 1.6, z: pos.z - (pos.z - P.pos.z) * .45 }, f * .72, .09); dp(.3, () => voz({ x: pos.x, y: 1.6, z: pos.z }, { f0: 220, vogais: [vg('a'), vg('a')], dur: .18, vol: .05, sopro: true })); leg(T.loop_leg); });
  }
  // 39. O tique-taque inofensivo nas três primeiras vezes... na quarta marca a chegada dele.
  function evTique() {
    B.tiqueN++; marca('tique'); const p = perto(6), pos = { x: p.x, y: 1.6, z: p.z }, paga = B.tiqueN >= (B.noite.pagaTique || (B.noite.pagaTique = Math.random() < .4 ? 5 : 4));
    leg(T.tique_leg); for (let i = 0; i < 9; i++) dp(i * .9, () => { tom(pos, i % 2 ? 1800 : 2100, .03, .12, 'square', 'sfx', .2); });
    if (paga) dp(8.4, () => { leg(T.tique_para); E.emitNoise(P.pos.x, P.pos.z, 11, true); marcarForte(); });
  }
  // 40. Ronco numa cama vazia: para de uma vez quando ela se aproxima, e os lençóis se mexem.
  function evCama() {
    const camas = W.lockers.filter(l => l.tipo === 'cama' && Math.hypot(l.x - P.pos.x, l.z - P.pos.z) > 6 && Math.hypot(l.x - P.pos.x, l.z - P.pos.z) < 22); if (!camas.length) return;
    marca('cama'); B.cama = { L: pick(camas), prox: 0, ate: agora() + 120 }; leg(T.cama_leg);
  }
  function updCama() {
    const c = B.cama; if (!c) return; const L = c.L, d = Math.hypot(L.x - P.pos.x, L.z - P.pos.z);
    if (agora() > c.ate || perigoAtivo()) { B.cama = null; return; }
    if (d < 3.2) { B.cama = null; sx('rangido', [L.x, .6, L.z, .35, 'amb']); leg(T.cama_para); marcarForte(); return; }
    if (agora() >= c.prox) { c.prox = agora() + 2.7; respiracao({ x: L.x, y: .7, z: L.z }, 1.9, true, .35); }
  }
  // 41. Falso alívio: depois de despistá-lo, um acorde suave... e uma porta muito longe.
  function falsoAlivio() {
    marca('alivio'); const c = [262, 330, 392];
    som((ac, t) => { for (const f of c) { const g = E.saida(null, .5, 'amb'), o = ac.createOscillator(); o.frequency.value = f; o.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.05, t + .8); g.gain.linearRampToValueAtTime(.0001, t + 3.1); o.start(t); o.stop(t + 3.2); } });
    dp(3.6, () => { const p = polar(rand(0, 6.28), 18); sx('portaLonge', [{ x: p.x, z: p.z }]); leg(T.alivio_leg); marcarForte(); });
  }
  // 42. Passos sobem a escada, degrau por degrau, e param no último.
  function evEscada() {
    marca('escada'); const n = 12 + B.visPat * 2, f = fwdH(), a = Math.atan2(-f.z, -f.x), d0 = 5;
    leg(T.escada_leg); for (let i = 0; i < n; i++) dp(i * .55, () => { const k = i / (n - 1); passoPos({ x: P.pos.x + Math.cos(a) * (d0 - k * 4), y: -2.6 + k * 2.7, z: P.pos.z + Math.sin(a) * (d0 - k * 4) }, .55); });
  }
  // 43. Um assovio grave e uma porta bate: nas duas primeiras vezes é a casa; na terceira é ele.
  function evAssovio() {
    marca('assovio'); const n = usosNoite('assovio'), p = perto(9);
    tom(P.pos, 150, 1.4, .1, 'sine', 'sfx', .6, 118);
    dp(1.7, () => { sx('portaLonge', [{ x: p.x, z: p.z }]); leg(T.assovio_leg); if (n >= 3) E.emitNoise(p.x, p.z, 12, false); });
  }
  // 44. O áudio que contradiz o visual: a porta fechada range como se abrisse e um passo sai do lugar vazio.
  function evContradiz() {
    const ds = W.doors.filter(d => !d.open && !d.grade && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 6.5 && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) > 2.2 && E.visivel && E.visivel({ x: d.x, z: d.z }, 1.2, 8)); if (!ds.length) return;
    marca('contradiz'); const d = pick(ds); sx('rangido', [d.x, 1.2, d.z, .9, 'sfx', true]); leg(T.contradiz_leg);
    dp(1.6, () => passoPos({ x: d.x + (P.pos.x - d.x) * .3, y: .1, z: d.z + (P.pos.z - d.z) * .3 }, .5));
  }
  // 45. O reverso antes do susto: o ar da sala é puxado e solta (só em metade das vezes).
  function antesDoSusto() { if (qa() || Math.random() > .5 || !jogando()) return; sx('silencio', [.5, .06, true]); H.succao(.5); }

  // =====================================================================================================
  // DIRETOR: um evento por vez, com intervalo longo, orçamento por capítulo/noite e nunca em perigo
  // =====================================================================================================
  const catalogo = () => {
    const s = S(), cap = s.chapter, m = W.mapa, fora = !dentro(), tipo = (P.room && P.room.tipo) || '';
    return [
      { id: 'falso', w: 1.2, ok: () => !fora && (m === 'terreo' || m === 'superior') && cap >= 1 && usosCap('falso') < 1 && usosNoite('falso') < 3, go: evSomFalso },
      { id: 'chuvapara', w: 2.2, ok: () => fora && (m === 'cemiterio' || m === 'estrada') && usosNoite('chuvapara') < 2 && usosCap('chuvapara') < 1, go: evChuvaPara },
      { id: 'nuca', w: 1.3, ok: () => !fora && cap >= 1 && usosNoite('nuca') < 1 && s.fear < 60, go: evRespiraNuca },
      { id: 'corrmudo', w: 4, ok: () => m === 'superior' && sala() === 'corr' && P.pos.z < -18 && P.pos.z > -44 && usosNoite('corrmudo') < 1, go: evCorredorMudo },
      { id: 'defas', w: 2, ok: () => !fora && tipo === 'corredor' && usosNoite('defas') < 2 && !B.seg, go: () => evPassosDefasados('atras') },
      { id: 'passosfrente', w: 1.4, ok: () => !fora && tipo === 'corredor' && usosNoite('passosfrente') < 1 && !B.seg, go: () => evPassosDefasados('frente') },
      { id: 'radio', w: 1.6, ok: () => cap >= 3 && !B.radio && usosCap('radio') < 2, go: evRadioNarra },
      { id: 'chamada', w: 1.4, ok: () => !fora && m === 'terreo' && cap >= 1 && cap <= 2 && usosNoite('chamada') < 1 && !B.chamada, go: evChamada },
      { id: 'tres', w: 1.1, ok: () => cap >= 2 && usosCap('tres') < 1 && s.fear < 60, go: evTresVozes },
      { id: 'econome', w: 1, ok: () => cap >= 3 && usosNoite('econome') < 1, go: evEcoNome },
      { id: 'sil4', w: 1.3, ok: () => usosCap('sil4') < 2 && s.fear < 55, go: evSilencioQuatro },
      { id: 'chuveiros', w: 6, ok: () => (sala() === 'banh' || sala() === 'banhS') && usosCap('chuv') < 1 && !B.chuv, go: evChuveiros },
      { id: 'bola', w: 1.5, ok: () => !fora && tipo === 'corredor' && cap >= 1 && usosCap('bola') < 1 && P.room.x1 - P.room.x0 + P.room.z1 - P.room.z0 > 14, go: evBola },
      { id: 'piano', w: 1.3, ok: () => (m === 'terreo' || m === 'superior') && cap >= 1 && usosNoite('piano') < 1 && !B.piano, go: evPiano },
      { id: 'portamuda', w: 3, ok: () => m === 'superior' && sala() === 'corr' && usosNoite('portamuda') < 1, go: evPortaMuda },
      { id: 'relogio', w: 1.4, ok: () => !fora && (m === 'superior' || m === 'terreo') && cap >= 2 && usosNoite('relogio') < 1, go: evRadioRelogio },
      { id: 'telefone', w: 1.3, ok: () => !fora && (m === 'terreo' || m === 'superior') && usosNoite('telefone') < 3, go: evTelefone },
      { id: 'sirene', w: 2.5, ok: () => fora && (m === 'cemiterio' || m === 'estrada') && !usosNoite('sirene') && !B.noiteSirene, go: () => { B.noiteSirene = true; evSirene(); } },
      { id: 'cano', w: 8, ok: () => (sala() === 'banh' || sala() === 'banhS') && B.visBanh[sala()] >= 2 && !usosNoite('cano'), go: evCano },
      { id: 'caixinha', w: 1.1, ok: () => !fora && cap >= 2 && usosNoite('caixinha') < 1, go: evCaixinhaVazia },
      { id: 'melodia', w: 2, ok: () => cap === 3 && !fora && usosNoite('melodia') < 4 && agora() - (B.melT || -999) > 60, go: () => { B.melT = agora(); evMelodiaFecha(); } },
      { id: 'portasseq', w: 1.2, ok: () => !fora && usosCap('portasseq') < 1 && cap >= 1, go: evPortasSeq },
      { id: 'orbita', w: 1.2, ok: () => !fora && usosCap('orbita') < 1 && s.fear < 55 && cap >= 2, go: evOrbita },
      { id: 'telhado', w: 1.3, ok: () => !fora && (m === 'terreo' || m === 'superior') && usosCap('telhado') < 1 && cap >= 1, go: evTelhado },
      { id: 'coro', w: 1, ok: () => m === 'terreo' && !fora && usosNoite('coro') < 1 && cap >= 1, go: evCoroRadios },
      { id: 'loop', w: 1.2, ok: () => usosNoite('loop') < 1, go: evLoop },
      { id: 'tique', w: 1.6, ok: () => !fora && usosNoite('tique') < 5 && cap >= 1, go: evTique },
      { id: 'cama', w: 4, ok: () => m === 'superior' && !B.cama && usosNoite('cama') < 1, go: evCama },
      { id: 'assovio', w: 1.2, ok: () => !fora && usosCap('assovio') < 2 && cap >= 1, go: evAssovio },
      { id: 'contradiz', w: 1.1, ok: () => !fora && usosCap('contradiz') < 1 && cap >= 1, go: evContradiz },
    ];
  };
  function diretor() {
    const s = S(), ev = catalogo().filter(e => e.w > 0 && (() => { try { return e.ok(); } catch (x) { return false; } })());
    if (!ev.length) return;
    let tot = ev.reduce((a, e) => a + e.w, 0), r = Math.random() * tot, esc = ev[0];
    for (const e of ev) { r -= e.w; if (r <= 0) { esc = e; break; } }
    B.ult = agora(); seguro(esc.go)();
  }

  // =====================================================================================================
  // GANCHOS
  // =====================================================================================================
  function update(dt, s) {
    reiniciaSeNovoJogo();
    // renascer debaixo d'água (dead -> vivo)
    if (B.deadPrev && !s.dead && jogando() && !qa()) renascer();
    B.deadPrev = !!s.dead;
    if (!s.dead && B.chuvaAte && agora() > B.chuvaAte) restaurarChuva();
    if (s.dead || !P.room || !jogando()) return;
    // parado / quieto
    const dx = P.pos.x - B.ultPos.x, dz = P.pos.z - B.ultPos.z, v = Math.hypot(dx, dz) / Math.max(dt, 1e-3);
    B.ultPos = { x: P.pos.x, z: P.pos.z };
    B.parado = v < .15 && !P.sprinting ? B.parado + dt : 0;
    B.quieto = v < 1.7 && !P.sprinting && !perigoAtivo() && !(M.ativo && dM() < 16) ? B.quieto + dt : 0;
    const q = qa();
    // entradas de sala
    if (P.room !== B.salaAnt) {
      B.salaAnt = P.room; const id = sala(); B.salaVez = {}; if (id === 'banh' || id === 'banhS') B.visBanh[id] = (B.visBanh[id] || 0) + 1;
      if (id === 'patamar' && W.mapa === 'superior') { B.visPat++; if (!q && B.visPat <= 2 && calmo() && usosNoite('escada') < 2) dp(2.4, () => { if (sala() === 'patamar' && calmo()) evEscada(); }); }
      if (!q && !B.tab && W.mapa === 'terreo' && P.room.tipo === 'corredor' && !usosNoite('tabua') && calmo()) { marca('tabua'); B.tab = { n: 0 }; }
    }
    // mostra o estado do Inspetor (falso alívio)
    const est = M.ativo ? M.state : null;
    if (!q && B.estPrev === 'caca' && est && est !== 'caca' && dM() > 12 && usosCap('alivio') < 1 && jogando()) dp(1.2, () => { if (!perigoAtivo() && jogando()) falsoAlivio(); });
    B.estPrev = est;
    // nona badalada: a lanterna morre por 4 s e algo mudou de lugar
    const hora = !!s.flags.am_hora;
    if (hora && !B.horaPrev && !q) dp(9, () => { if (!jogando()) return; K.apagao(4, false); leg(T.hora_lanterna); dp(4.1, () => { leg(T.hora_volta); algoMudou(); }); });
    B.horaPrev = hora;
    // coração para quando ele passa rente ao esconderijo
    if (s.hidden && M.ativo && dM() < 3.2 && !B.coracaoFeito && !q && Math.random() < dt * .35 && usosNoite('coracaoesc') < 3) { marca('coracaoesc'); evCoracaoEscondido(); }
    if (!s.hidden) B.coracaoFeito = false;
    // shhh: correr à toa
    if (P.sprinting && calmo() && !s.hidden) B.corrT += dt; else B.corrT = Math.max(0, B.corrT - dt * .5);
    if (B.corrT > 5 && !q && agora() - B.shhT > 100) { B.corrT = 0; evShh(); }
    // tosse depois de 25 s de silêncio
    if (B.quieto > 25 && !q && usosCap('tosse') < 1 && calmo() && s.fear < 50) { B.quieto = 0; evTosse(); }
    // monitores contínuos
    updSeg(); updRadio(dt); updChamada(); updChuv(); updPortas(dt); updPiano(); updPortaMuda(); updChoro(dt); updCapela(dt); updPesc(dt); updOrbita(); updConta(dt); updEstatica(dt); updCama();
    if (!q) updArmarios();
    // diretor
    if (!q) { B.dirT -= dt; if (B.dirT <= 0) { B.dirT = rand(60, 110); if (calmo() && agora() - B.ult > 40 && !s.hidden && !B.radio && !B.seg && !B.chamada && !B.orbita && !B.conta) diretor(); } }
  }
  const aoPasso = () => { if (B.seg) passoSeg(); if (B.tab) passoTabua(); };
  const aoEsconder = L => {
    try { if (L && L.tipo === 'armario' && L.l7 && !L.l7dentro) { L.l7dentro = true; trancaSerie(3, 1.8, .6, () => batidaDura({ x: P.pos.x, y: 1.3, z: P.pos.z - .3 }, .3)); dp(4.2, () => { respiracao(atras(.3), 2.5, false, .6); leg(T.armario_dentro); }); } } catch (e) {}
    if (B.radio) B.radio.sala = P.room;
  };
  const aoRaio = () => {
    if (qa() || !jogando() || OPT.vFlash || perigoAtivo() || usosNoite('raiomudo') >= 3) return;
    B.aoRaioN++; if (Math.random() < .09) { marca('raiomudo'); vacuo(3.2, 0); chuvaMuda(true, true); B.chuvaAte = agora() + 3.4; leg(T.raiomudo_leg); }
  };
  const novoMapa = id => { B.seg = null; B.radio = null; B.chamada = null; B.piano = null; B.chuv = null; B.choro = null; B.cama = null; B.orbita = null; B.conta = null; B.tab = null; B.portaRec = null; B.mudaDoor = null; B.doorPrev = new Map(); B.salaAnt = null; B.parado = 0; B.quieto = 0; B.visPat = 0; restaurarChuva(); };
  const morte = () => { B.seg = null; B.radio = null; B.chamada = null; B.piano = null; B.chuv = null; B.choro = null; B.orbita = null; B.conta = null; restaurarChuva(); };
  const avistamento = () => antesDoSusto();
  return { update: seguro(update), aoPasso: seguro(aoPasso), aoEsconder: seguro(aoEsconder), aoRaio: seguro(aoRaio), novoMapa: seguro(novoMapa), morte: seguro(morte), avistamento: seguro(avistamento), eventos: { evSomFalso, evChuvaPara, evRespiraNuca, evCorredorMudo, evPassosDefasados, evRadioNarra, evChamada, evTresVozes, evEcoNome, evSilencioQuatro, evTosse, evCoracaoEscondido, evChuveiros, evBola, evPiano, evPortaMuda, evRadioRelogio, evTelefone, evSirene, evShh, evCano, evCaixinhaVazia, evMelodiaFecha, evPortasSeq, evOrbita, evTelhado, evCoroRadios, evLoop, evTique, evCama, falsoAlivio, evEscada, evAssovio, evContradiz, renascer, algoMudou }, _B: B };
}
