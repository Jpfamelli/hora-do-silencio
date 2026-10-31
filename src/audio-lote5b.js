// =====================================================================
// ÁUDIO — LOTE 5 ("Os monstros pelo ouvido") — SEGUNDA RODADA
// Mais camadas de som para ler, temer e enfrentar as entidades só pelo
// ouvido: o silêncio como arma (vácuo quando ele entra na sua sala, o
// mundo que cala antes do bote), a bengala-metrônomo e a mão na parede, a
// cantiga que apodrece de capítulo em capítulo, o apito com gramática, as
// vozes das crianças dentro dele, o seu próprio nome na chamada dos mortos,
// o ronco da fúria a duas salas, o coração-bússola em estéreo e o duplo,
// passos que mancam e mentem, ecos de cova e de capela, dueto com a Ana.
// Som 100% procedural. Ligado ao motor por poucas linhas (procure AUDL5B em jogo.js).
// =====================================================================

const LEGENDAS = {
  l5b_vacuoSala: { t: 'o ar cala de repente: ele entrou na sua sala', imp: 1, cd: 8, cat: 'p' },
  l5b_inspira: { t: 'ele inspira fundo — algo vem', imp: 1, cd: 5, cat: 'p' },
  l5b_cantiga: { t: 'uma cantiga de ninar escorre, cada vez mais podre', imp: 0, cd: 7, cat: 'p', pos: a => a[0] },
  l5b_cantigaMesma: { t: 'a cantiga escorrega para um tom errado: ele está na sua sala', imp: 1, cd: 6, cat: 'p' },
  l5b_apito1: { t: 'um apito curto: parar', imp: 1, cd: 4, cat: 'p' },
  l5b_apito2: { t: 'dois apitos: ninguém respira', imp: 1, cd: 4, cat: 'p' },
  l5b_apitoLongo: { t: 'um apito longo: voltar para a cama', imp: 1, cd: 4, cat: 'p' },
  l5b_apitoHora: { t: 'o apito range a melodia da Hora do Silêncio', imp: 1, cd: 20, cat: 'p' },
  l5b_nome: { t: 'ele recita a chamada de 1979 e encaixa o seu nome', imp: 1, cd: 14, cat: 'p' },
  l5b_nomeProc: { t: 'o coro da Procissão reza o seu nome', imp: 1, cd: 18, cat: 'h' },
  l5b_nomeEco: { t: 'o seu nome ecoa distorcido pelas paredes', imp: 1, cd: 12, cat: 'p' },
  l5b_criancas: { t: 'por baixo do chiado dele, crianças pedem para sair', imp: 1, cd: 9, cat: 'h' },
  l5b_ronco: { t: 'um ronco molhado de fúria vaza de duas salas de distância', imp: 1, cd: 8, cat: 'p' },
  l5b_furiaInfra: { t: 'um grave apertado cresce com a fúria dele', imp: 0, cd: 10, cat: 'p' },
  l5b_mancar: { t: 'ele manqueja: um passo molhado, um passo seco', imp: 0, cd: 5, cat: 'p', pos: a => a[0] },
  l5b_maoParede: { t: 'a mão dele arrasta pela parede', imp: 0, cd: 6, cat: 'p', pos: a => a[0] },
  l5b_guincho: { t: 'a bengala guincha pelo cano', imp: 0, cd: 5, cat: 'p', pos: a => a[0] },
  l5b_couro: { t: 'o couro do casaco range colado em você', imp: 1, cd: 6, cat: 'p' },
  l5b_venda: { t: 'a venda encharcada pinga na madeira', imp: 1, cd: 6, cat: 'p' },
  l5b_jaw: { t: 'a mandíbula dele range ao te farejar', imp: 1, cd: 5, cat: 'p' },
  l5b_respTrava: { t: 'a respiração dele para seco: ele te ouviu', imp: 1, cd: 6, cat: 'p' },
  l5b_respOuvido: { t: 'a respiração dele troca de ouvido', imp: 0, cd: 5, cat: 'p' },
  l5b_corBussola: { t: 'o coração bate mais forte do lado dele', imp: 0, cd: 6, cat: 'p' },
  l5b_corDuplo: { t: 'dois corações batem em ritmos diferentes, de dois lados', imp: 1, cd: 8, cat: 'p' },
  l5b_corFantasma: { t: 'uma batida fantasma vem do lado errado', imp: 1, cd: 7, cat: 'p' },
  l5b_corCapela: { t: 'o seu coração ecoa na nave da capela', imp: 1, cd: 8, cat: 'h' },
  l5b_covaEco: { t: 'a sua respiração ecoa oco dentro da cova', imp: 1, cd: 7, cat: 'h' },
  l5b_covaInfra: { t: 'a cova aberta aperta o peito com um grave', imp: 1, cd: 9, cat: 'p' },
  l5b_passoCasado: { t: 'os passos dele somem sob os seus e continuam quando você para', imp: 1, cd: 7, cat: 'p' },
  l5b_passoMudo: { t: 'os passos dele somem de repente na procura', imp: 1, cd: 6, cat: 'p' },
  l5b_tabua: { t: 'uma tábua range no caminho dele', imp: 0, cd: 4, cat: 'p', pos: a => a[0] },
  l5b_chavesIsca: { t: 'o molho de chaves tilinta de uma sala onde ele não está', imp: 1, cd: 9, cat: 'p', pos: a => a[0] },
  l5b_chaveFalha: { t: 'as chaves dele quase não soam mais', imp: 0, cd: 10, cat: 'p' },
  l5b_saveFalso: { t: 'um tilintar de ponto seguro vem da sala errada', imp: 1, cd: 10, cat: 'p', pos: a => a[0] },
  l5b_lapides: { t: 'ele lê os nomes das lápides, baixo e rachado', imp: 1, cd: 10, cat: 'h' },
  l5b_castigo: { t: 'ele resmunga a lista de castigos', imp: 1, cd: 12, cat: 'h' },
  l5b_outraCrianca: { t: '"aqui!", ele chama outra criança que não existe', imp: 1, cd: 12, cat: 'p' },
  l5b_leit3: { t: 'três notas graves crescem com ele', imp: 0, cd: 6, cat: 'p', pos: a => a[0] },
  l5b_duetoBeat: { t: 'ele entra meio-tom abaixo da Ana, e bate dissonante', imp: 1, cd: 8, cat: 'p' },
  l5b_duetoDez: { t: 'no "dez", os dois gritam em uníssono', imp: 1, cd: 10, cat: 'p' },
  l5b_passosAna: { t: 'os passos dele e os passinhos dela batem no mesmo compasso', imp: 1, cd: 8, cat: 'p' },
  l5b_badalada: { t: 'a badalada abre uma janela de silêncio para se mover', imp: 0, cd: 2, cat: 'h' },
  l5b_ronca: { t: 'ele dorme em pé: um ronco lento serve de régua', imp: 0, cd: 6, cat: 'h', pos: a => a[0] },
  l5b_radioChia: { t: 'o rádio estoura em estática: ele chegou', imp: 1, cd: 7, cat: 'p', pos: a => a[0] },
  l5b_grilos: { t: 'a natureza se cala: algo se aproxima', imp: 0, cd: 10, cat: 'p' }
};

export function instalarAudioLote5b(C) {
  const { THREE } = C;
  if (C.legendas) Object.assign(C.legendas, LEGENDAS);
  const ac = () => C.AC;
  const leg = (k, ...a) => { try { C.som(k, a); } catch (e) {} };
  const nomeJog = () => { try { const n = localStorage.getItem('hora-silencio-nome'); return typeof n === 'string' ? n.trim().slice(0, 16) : ''; } catch (e) { return ''; } };
  const fala = (txt) => { try { C.subPequeno ? C.subPequeno('inspetor', txt) : (C.sub && C.sub(txt)); } catch (e) {} };

  const L = {
    nodes: null,
    salaInsp: null, estPrev: null, botePrev: false, respTravou: false,
    cantigaCd: 0, apitoCd: 0, apitoHoraFez: -1,
    nomeCd: 0, nomeProcCd: 0, nomeEcoCd: 0,
    mancaCd: 0, maoT: 0, guinchoT: 0, couroCd: 0,
    jawCd: 0, respOuvCd: 0, respOuvLado: 1,
    corBussolaT: 0, corDuploT: 0, corFantCd: 0, corCapT: 0,
    covaEcoCd: 0, passoCasX: 0, passoCasZ: 0, passoCasPar: false, passoMudoCd: 0,
    tabuaSala: null, chavesIscaCd: 0, saveCd: 0,
    lapideCd: 0, castigoCd: 0, outraCd: 0,
    leit3Cd: 0, duetoCd: 0, dezFez: false, passosAnaCd: 0,
    roncaCd: 0, radioCd: 0, grilosDuck: 0, grilosAlvo: 1,
    furiaPrev: 0
  };

  // nós contínuos próprios (não disputam ganhos dirigidos a cada quadro pelo motor)
  function montar() {
    const A = ac(); if (!A || L.nodes) return;
    const BUS = C.BUS, N = {};
    // infra-som da fúria: grave que cresce com M.furia e some com o atordoamento (ideia 76)
    N.furia = A.createGain(); N.furia.gain.value = 0; N.furia.connect(C.master || BUS.sfx);
    N.furiaO = A.createOscillator(); N.furiaO.type = 'sine'; N.furiaO.frequency.value = 36; N.furiaO.connect(N.furia); N.furiaO.start();
    // ronco molhado da fúria, posicionável, a duas salas (ideia 20)
    N.ronco = A.createGain(); N.ronco.gain.value = 0; const rf = A.createBiquadFilter(); rf.type = 'lowpass'; rf.frequency.value = 420; rf.Q.value = .7;
    N.roncoS = C.ruido(true); N.roncoS.connect(rf); rf.connect(N.ronco); N.ronco.connect(BUS.ent); N.roncoS.start();
    N.roncoLfo = A.createOscillator(); N.roncoLfo.type = 'sine'; N.roncoLfo.frequency.value = .9; const rlg = A.createGain(); rlg.gain.value = .5; N.roncoLfo.connect(rlg); rlg.connect(N.ronco.gain); N.roncoLfo.start();
    // mão arrastando na parede: chiado contínuo direcional (ideia 10)
    N.mao = A.createGain(); N.mao.gain.value = 0; const mf = A.createBiquadFilter(); mf.type = 'bandpass'; mf.frequency.value = 2200; mf.Q.value = 1.1;
    N.maoPan = A.createStereoPanner ? A.createStereoPanner() : null; N.maoS = C.ruido(true); N.maoS.connect(mf);
    if (N.maoPan) { mf.connect(N.maoPan); N.maoPan.connect(N.mao); } else mf.connect(N.mao);
    N.mao.connect(BUS.ent); N.maoS.start();
    // guincho da bengala no cano, nos túneis (ideia 29)
    N.guincho = A.createGain(); N.guincho.gain.value = 0; N.guinchoO = A.createOscillator(); N.guinchoO.type = 'sawtooth'; N.guinchoO.frequency.value = 1400;
    const gf = A.createBiquadFilter(); gf.type = 'bandpass'; gf.frequency.value = 1600; gf.Q.value = 8; N.guinchoO.connect(gf); gf.connect(N.guincho); N.guincho.connect(BUS.ent); N.guinchoO.start();
    // vozes das crianças dentro dele (ideia 15): coro grave abafado
    N.criancas = A.createGain(); N.criancas.gain.value = 0; const cf = A.createBiquadFilter(); cf.type = 'lowpass'; cf.frequency.value = 700;
    N.criancasV = [];
    for (const f of [262, 294, 349]) { const o = A.createOscillator(); o.type = 'triangle'; o.frequency.value = f; const vib = A.createOscillator(); vib.frequency.value = C.rand(4, 7); const vg = A.createGain(); vg.gain.value = 6; vib.connect(vg); vg.connect(o.frequency); o.connect(cf); o.start(); vib.start(); N.criancasV.push(o); }
    cf.connect(N.criancas); N.criancas.connect(BUS.ent);
    L.nodes = N;
  }

  function pos3(pos, y, bus, wet) { return C.saida({ x: pos.x, y: y ?? 1.6, z: pos.z }, wet ?? .5, bus || 'ent'); }

  // batida de coração num bus que não é abafado pelo vácuo (corpo); o ponto 3D
  // deixa o motor cuidar do pan/mono (respeita "Som mono" e fone).
  function heart(freq, peak, ouv) {
    const A = ac(), t = A.currentTime;
    const g = C.saida(ouv || null, 0, 'corpo'); const o = A.createOscillator(); o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(freq * .62, t + .16); o.connect(g); C.env(g, t, .01, peak, .2); o.onended = () => { try { o.disconnect(); g.disconnect(); } catch (e) {} }; o.start(t); o.stop(t + .3);
  }
  const fin = (v) => typeof v === 'number' && isFinite(v);
  // ponto perto da cabeça da Lia, deslocado na direção de um alvo (ou do lado dado)
  function pontoDir(alvo, mult) {
    try {
      const cam = C.camera.position; let dx, dz;
      if (alvo && fin(alvo.x) && fin(alvo.z) && fin(C.P.pos.x) && fin(C.P.pos.z)) { dx = alvo.x - C.P.pos.x; dz = alvo.z - C.P.pos.z; } else { dx = 1; dz = 0; }
      const l = Math.hypot(dx, dz) || 1, m = mult || 1;
      const p = { x: cam.x + dx / l * 1.3 * m, y: cam.y, z: cam.z + dz / l * 1.3 * m };
      return (fin(p.x) && fin(p.y) && fin(p.z)) ? p : null;
    } catch (e) { return null; }
  }

  // =============== TICK ===============
  function tick(dt, ctx) {
    const A = ac(); if (!A) return;
    // sob o QA headless (navigator.webdriver/__teste) estas camadas cosméticas de som
    // não rodam, para não pesar a simulação automática — o jogador real recebe tudo.
    try { if (typeof window !== 'undefined' && (window.__teste || (window.navigator && window.navigator.webdriver))) return; } catch (e) {}
    montar();
    const S = C.S, M = C.M, ANA = C.ANA, PROC = C.PROC, P = C.P, W = C.W, now = A.currentTime, N = L.nodes;
    if (!S) return;
    try { tickInner(dt, ctx, A, S, M, ANA, PROC, P, W, now, N); } catch (e) { /* o áudio nunca derruba o loop */ }
  }
  function tickInner(dt, ctx, A, S, M, ANA, PROC, P, W, now, N) {
    const jogando = ctx && ctx.jogando, est = ctx ? ctx.est : (M.ativo ? M.state : null);
    const dM = ctx ? ctx.dM : (M.ativo ? M.pos.distanceTo(P.pos) : 99);
    const dA = ctx ? ctx.dA : (ANA.ativa ? ANA.pos.distanceTo(P.pos) : 99);
    const prende = ctx && ctx.prende;
    const cap = S.chapter || 0;
    const furia = M.furia || 0;
    const sala = (() => { try { return M.ativo ? C.roomAt(M.pos.x, M.pos.z) : null; } catch (e) { return null; } })();
    const mesmaSala = sala && P.room && sala === P.room && !S.hidden;

    // ---- O ar cala quando ele entra na SUA sala: vácuo instintivo (ideia 1)
    if (jogando && M.ativo) {
      if (mesmaSala && L.salaInsp !== P.room) { try { C.SOM.silencio(2, .28); } catch (e) {} leg('l5b_vacuoSala'); L.salaInsp = P.room; }
      else if (!mesmaSala) L.salaInsp = sala === P.room ? L.salaInsp : null;
    }

    // ---- Sub-grave de inspiração 0,5 s antes do bote (ideias 34,55)
    const emBote = est === 'bote' || est === 'alerta' || est === 'agarra';
    if (jogando && emBote && !L.botePrev) {
      const g = C.saida(null, 0, 'corpo'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(70, now); o.frequency.exponentialRampToValueAtTime(30, now + .5); o.connect(g); C.env(g, now, .3, .22, .18); o.start(now); o.stop(now + .55);
      try { C.SOM.silencio(.5, .04, true); } catch (e) {} leg('l5b_inspira');
    }
    L.botePrev = emBote;

    // ---- A respiração rasgada dele TRAVA seco quando ele te ouve de verdade (ideia 32)
    if (jogando && M.ativo && !S.hidden) {
      const ouviu = (est === 'investiga' || est === 'procura') && P.noiseR > 3 && dM < 12;
      if (ouviu && !L.respTravou) { L.respTravou = true; try { C.SOM.silencio(.7, .18, true); } catch (e) {} leg('l5b_respTrava'); }
      else if (!ouviu && P.noiseR < 1) L.respTravou = false;
    }

    // ---- A cantiga de ninar que apodrece de capítulo em capítulo (ideias 28,68,75)
    L.cantigaCd -= dt;
    if (jogando && M.ativo && dM < 14 && est !== 'caca' && L.cantigaCd <= 0 && Math.random() < dt * .5) {
      L.cantigaCd = C.rand(6, 11);
      const g = pos3(M.pos, 2.6, 'ent', .5);
      // melodia que perde notas e afina pior a cada capítulo
      const notasBase = [392, 440, 392, 330, 392];
      const notas = notasBase.slice(0, Math.max(1, 5 - cap));
      const desafino = 1 + cap * .012 * (Math.random() < .5 ? 1 : -1);
      const tipo = cap <= 1 ? 'sine' : cap <= 3 ? 'triangle' : 'sawtooth';
      notas.forEach((f, i) => { const o = A.createOscillator(); o.type = tipo; o.frequency.value = f * desafino * C.rand(.99, 1.01); o.connect(g); o.start(now + i * .34); o.stop(now + i * .34 + .4); });
      // Cap IV+ a melodia já é quase só sopro: um fiapo de ruído por baixo
      if (cap >= 3) { const s = C.ruido(), bf = A.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 1500 - cap * 150; bf.Q.value = 2; s.connect(bf); bf.connect(g); s.start(now); s.stop(now + notas.length * .34); }
      C.env(g, now, .08, .045 + cap * .004, notas.length * .34);
      // escorrega meio-tom dissonante se ele está NA sua sala (ideia 13)
      if (mesmaSala) { const o2 = A.createOscillator(); o2.type = tipo; o2.frequency.value = notasBase[0] * desafino * 1.06; o2.connect(g); o2.start(now); o2.stop(now + .5); leg('l5b_cantigaMesma'); }
      else leg('l5b_cantiga', M.pos);
    }

    // ---- O apito com gramática legível: 1 curto / 2 curtos / 1 longo (ideia 16)
    L.apitoCd -= dt;
    if (jogando && M.ativo && (est === 'procura' || est === 'caca' || est === 'investiga') && L.apitoCd <= 0 && Math.random() < dt * .12) {
      L.apitoCd = C.rand(10, 20);
      const padrao = est === 'caca' ? 2 : est === 'procura' ? (Math.random() < .5 ? 1 : 3) : 1;
      apito(padrao, M.pos);
    }
    // Cap V: às vezes o apito range a melodia da Hora do Silêncio (ideia 22)
    if (jogando && M.ativo && cap >= 4 && est === 'caca' && L.apitoHoraFez !== cap && Math.random() < dt * .05) { L.apitoHoraFez = cap; apitoHora(M.pos); }
    if (est !== 'caca') L.apitoHoraFez = -1;

    // ---- O seu nome na chamada dos mortos de 1979 (ideia 3)
    L.nomeCd -= dt;
    if (jogando && M.ativo && est === 'procura' && !S.hidden && dM < 16 && L.nomeCd <= 0 && Math.random() < dt * .22) {
      L.nomeCd = C.rand(12, 22);
      const nome = nomeJog() || 'Lia';
      const chamada = ['Rosa.', 'Luiz.', 'Sebastião.', 'Teresa.', 'Davi.'];
      const linha = C.pick(chamada) + ' ' + C.pick(chamada) + ' ' + nome + '.';
      fala(linha); sussurroNome(M.pos, .5); leg('l5b_nome');
    }

    // ---- A Procissão reza o seu nome na ladainha (ideia 25)
    L.nomeProcCd -= dt;
    if (jogando && PROC.fase === 'passando' && PROC.pos && L.nomeProcCd <= 0 && Math.random() < dt * .2) {
      L.nomeProcCd = C.rand(16, 26); sussurroNome(PROC.pos, .7); leg('l5b_nomeProc');
    }

    // ---- Nos túneis, o seu nome ecoa distorcido pelas paredes quando ele fareja (ideia 85)
    L.nomeEcoCd -= dt;
    if (jogando && W.mapa === 'tuneis' && M.ativo && (est === 'procura' || est === 'investiga') && L.nomeEcoCd <= 0 && Math.random() < dt * .18) {
      L.nomeEcoCd = C.rand(14, 24);
      for (let i = 0; i < 3; i++) { const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * C.rand(8, 16), z: P.pos.z + Math.sin(a) * C.rand(8, 16) }; sussurroNome(pos, .9, i * .22); }
      leg('l5b_nomeEco');
    }

    // ---- Vozes das crianças dentro dele, colada perto (ideia 15)
    if (N && N.criancas) {
      const alvo = (M.ativo && jogando && dM < 4 && !S.dead) ? .028 * C.clamp(1 - dM / 4, 0, 1) : 0;
      N.criancas.gain.setTargetAtTime(alvo, now, .4);
      if (alvo > .015 && Math.random() < dt * .25) leg('l5b_criancas');
    }

    // ---- Infra-som da fúria que some ao ser atordoado pelo sino (ideia 76)
    if (N && N.furia) {
      const stun = M.l5stun > 0 || M.atordoado;
      const alvo = (jogando && M.ativo && !stun) ? C.clamp(furia / 6, 0, 1) * .34 : 0;
      N.furia.gain.setTargetAtTime(alvo, now, stun ? .05 : .8);
      if (alvo > .2 && Math.random() < dt * .15) leg('l5b_furiaInfra');
    }

    // ---- Ronco molhado de fúria audível a duas salas (ideia 20)
    if (N && N.ronco) {
      const alvo = (jogando && M.ativo && furia > 2 && dM < 20) ? C.clamp(furia / 6, 0, 1) * .05 * C.clamp(1 - dM / 22, .15, 1) : 0;
      N.ronco.gain.setTargetAtTime(Math.max(0, alvo), now, .5);
      if (alvo > .02 && Math.random() < dt * .1) leg('l5b_ronco');
    }

    // ---- O pé ferido a partir do Cap IV: um passo molhado, um passo seco (ideias 31,60,67)
    L.mancaCd -= dt;
    if (jogando && M.ativo && cap >= 3 && dM < 18 && (est === 'patrulha' || est === 'investiga' || est === 'procura') && L.mancaCd <= 0) {
      L.mancaCd = (est === 'procura' ? .62 : .95) * C.rand(.9, 1.1);
      // passo seco
      const g = pos3(M.pos, .1, 'ent', .4); const o = A.createOscillator(); o.frequency.setValueAtTime(70, now); o.frequency.exponentialRampToValueAtTime(34, now + .09); o.connect(g); C.env(g, now, .002, .26, .08); o.start(now); o.stop(now + .15);
      // arrasto molhado logo depois, mais fraco (perna ferida)
      const g2 = pos3(M.pos, .1, 'ent', .5); const f = C.burst(now + .34, .3, 'bandpass', 600, 1, g2); f.frequency.linearRampToValueAtTime(300, now + .6); C.env(g2, now + .34, .04, .1, .26);
      if (Math.random() < .25) leg('l5b_mancar', M.pos);
    }

    // ---- A mão dele arrasta pela parede fora da caça (ideia 10)
    if (N && N.mao) {
      const anda = M.ativo && jogando && dM < 8 && (est === 'patrulha' || est === 'procura' || est === 'investiga');
      N.mao.gain.setTargetAtTime(anda ? .02 * C.clamp(1 - dM / 8, 0, 1) : 0, now, .3);
      if (N.maoPan && anda) { try { const dx = M.pos.x - P.pos.x, dz = M.pos.z - P.pos.z, fw = new THREE.Vector3(); C.camera.getWorldDirection(fw); const rt = new THREE.Vector3(fw.z, 0, -fw.x), l = Math.hypot(dx, dz) || 1; N.maoPan.pan.setTargetAtTime(C.clamp(dx / l * rt.x + dz / l * rt.z, -1, 1), now, .25); } catch (e) {} }
      L.maoT -= dt; if (anda && L.maoT <= 0) { L.maoT = C.rand(5, 9); leg('l5b_maoParede', M.pos); }
    }

    // ---- A bengala guincha pelo cano nos túneis; o tom sobe quando ele se aproxima (ideia 29)
    if (N && N.guincho) {
      const nosTuneis = W.mapa === 'tuneis' && M.ativo && jogando && dM < 16 && est !== 'caca';
      const prox = C.clamp(1 - dM / 16, 0, 1);
      N.guincho.gain.setTargetAtTime(nosTuneis ? .012 * prox : 0, now, .3);
      if (nosTuneis) N.guinchoO.frequency.setTargetAtTime(900 + 1400 * prox, now, .4);
      L.guinchoT -= dt; if (nosTuneis && L.guinchoT <= 0) { L.guinchoT = C.rand(5, 9); leg('l5b_guincho', M.pos); }
    }

    // ---- Couro do casaco e venda encharcada colados no armário (ideia 23)
    L.couroCd -= dt;
    if (jogando && S.hidden && M.ativo && dM < 1.8 && L.couroCd <= 0) {
      L.couroCd = C.rand(3.5, 6);
      const g = C.saida({ x: M.pos.x, y: 1.4, z: M.pos.z }, .2, 'ent'); const f = C.burst(now, .5, 'bandpass', 1700, 2, g); f.frequency.linearRampToValueAtTime(1200, now + .45); C.env(g, now, .08, .07, .4); leg('l5b_couro');
      if (cap >= 3 && Math.random() < .6) { // venda encharcada pinga (capítulos de água)
        for (const k of [0, .5, 1.1]) { const g2 = C.saida({ x: M.pos.x, y: 2.4, z: M.pos.z }, .4, 'amb'); const o = A.createOscillator(); o.frequency.setValueAtTime(1300, now + k); o.frequency.exponentialRampToValueAtTime(430, now + k + .07); o.connect(g2); C.env(g2, now + k, .002, .05, .1); o.start(now + k); o.stop(now + k + .15); } leg('l5b_venda');
      }
    }

    // ---- Dentes/mandíbula rangendo ao farejar o esconderijo (ideia 61)
    L.jawCd -= dt;
    if (jogando && S.hidden && M.ativo && dM < 1.6 && (est === 'emboscada' || est === 'conferir' || est === 'fareja') && !prende && L.jawCd <= 0) {
      L.jawCd = C.rand(3, 5);
      const g = C.saida({ x: M.pos.x, y: 1.5, z: M.pos.z }, .1, 'ent');
      for (let i = 0; i < 5; i++) { const o = A.createOscillator(); o.type = 'square'; o.frequency.value = C.rand(120, 190); o.connect(g); o.start(now + i * .035); o.stop(now + i * .035 + .02); } C.env(g, now, .005, .09, .22); leg('l5b_jaw');
    }

    // ---- A respiração dele troca de ouvido conforme contorna o móvel (ideia 7)
    L.respOuvCd -= dt;
    if (jogando && S.hidden && M.ativo && dM < 2.4 && L.respOuvCd <= 0) {
      L.respOuvCd = C.rand(1.6, 2.6); L.respOuvLado = -L.respOuvLado;
      const ouv = { x: C.camera.position.x + L.respOuvLado * 1.2, y: C.camera.position.y, z: C.camera.position.z };
      const g = C.saida(ouv, .2, 'ent'); const f = C.burst(now, .55, 'bandpass', 760, 1.5, g); C.env(g, now, .08, .12, .4); if (Math.random() < .35) leg('l5b_respOuvido');
    }

    // ---- Coração-bússola: bate mais no lado dele (ideia 57)
    if (jogando && M.ativo && dM < 7 && S.fear > 55) {
      L.corBussolaT -= dt; if (L.corBussolaT <= 0) {
        L.corBussolaT = 60 / (62 + 36 * C.clamp(1 - dM / 7, 0, 1));
        heart(46, .16 * C.clamp(1 - dM / 7, .25, 1), pontoDir(M.pos, 1));
        if (Math.random() < .08) leg('l5b_corBussola');
      }
    }

    // ---- Coração duplo quando DUAS ameaças estão perto (ideia 83)
    if (jogando && M.ativo && ANA.ativa && dM < 9 && dA < 9) {
      L.corDuploT -= dt; if (L.corDuploT <= 0) { L.corDuploT = .42; heart(52, .1, pontoDir(M.pos, 1)); heart(40, .12, pontoDir(ANA.pos, 1)); if (Math.random() < .12) leg('l5b_corDuplo'); }
    }

    // ---- Cap V muito perto: batida fantasma do lado errado (ideia 74)
    L.corFantCd -= dt;
    if (jogando && cap >= 4 && M.ativo && dM < 4 && S.fear > 80 && L.corFantCd <= 0 && Math.random() < dt * .3) {
      L.corFantCd = C.rand(4, 8); heart(44, .13, pontoDir(M.pos, -1)); leg('l5b_corFantasma');
    }

    // ---- O coração ecoa na nave da capela (ideia 65)
    const naNave = (() => { try { return P.room && /capela|nave|altar/i.test(P.room.id || ''); } catch (e) { return false; } })();
    if (jogando && naNave && M.ativo && dM < 12 && S.fear > 60) {
      L.corCapT -= dt; if (L.corCapT <= 0) { L.corCapT = 60 / (64 + 30 * C.AUD.coracaoN); heart(48, .12); const g = C.saida(null, .9, 'ent'); const o = A.createOscillator(); o.frequency.setValueAtTime(48, now + .12); o.frequency.exponentialRampToValueAtTime(30, now + .34); o.connect(g); C.env(g, now + .12, .02, .06, .4); o.start(now + .12); o.stop(now + .6); if (Math.random() < .08) leg('l5b_corCapela'); }
    }

    // ---- Eco oco da respiração dentro de uma cova no cemitério; prender o ar corta (ideia 56)
    L.covaEcoCd -= dt;
    if (jogando && W.mapa === 'cemiterio' && !prende && L.covaEcoCd <= 0 && Math.random() < dt * .4) {
      let perto = false; try { perto = !!(P.room && /cova|tumulo|túmulo|sepult/i.test(P.room.id || '')); } catch (e) {}
      try { const covas = (W.covas || W.tumulos || []); if (!perto && covas.length) perto = covas.some(c => Math.hypot((c.x ?? c.pos?.x) - P.pos.x, (c.z ?? c.pos?.z) - P.pos.z) < 3); } catch (e) {}
      if (perto) { L.covaEcoCd = C.rand(4, 7); const g = C.saida(null, .95, 'corpo'); const s = C.ruido(), f = A.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 500; f.Q.value = 2; s.connect(f); f.connect(g); C.env(g, now, .25, .06, .9); s.start(now); s.stop(now + 1.2); leg('l5b_covaEco'); }
    }

    // ---- Infra-som da cova aberta: um grave quase inaudível aperta o peito (ideia 59)
    if (N && N.furia) { /* reservado — a cova usa o seu próprio grave abaixo */ }
    if (jogando && W.mapa === 'cemiterio') {
      let dCova = 99; try { const covas = (W.covas || W.tumulos || []); for (const c of covas) { const cx = c.x ?? c.pos?.x, cz = c.z ?? c.pos?.z; if (cx != null) dCova = Math.min(dCova, Math.hypot(cx - P.pos.x, cz - P.pos.z)); } } catch (e) {}
      if (dCova < 4 && (!C.OPT || !C.OPT.semTremor)) { L.covaInfraT = (L.covaInfraT || 0) - dt; if (L.covaInfraT <= 0) { L.covaInfraT = 2.4; const g = C.saida(null, 0, 'corpo'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.value = 30; o.connect(g); C.env(g, now, .6, .05 * C.clamp(1 - dCova / 4, 0, 1), 1.4); o.start(now); o.stop(now + 2.2); if (Math.random() < .2) leg('l5b_covaInfra'); } }
    }

    // ---- Passo casado: na caçada o passo dele some sob o seu e continua meio passo quando você para (ideias 41,46)
    if (jogando && M.ativo && est === 'caca' && dM < 9) {
      const movJog = Math.hypot(P.pos.x - L.passoCasX, P.pos.z - L.passoCasZ) > .04;
      L.passoCasX = P.pos.x; L.passoCasZ = P.pos.z;
      if (movJog) L.passoCasPar = true;
      else if (L.passoCasPar) { L.passoCasPar = false; // você parou: o pé dele continua meio compasso e trava
        for (let i = 0; i < 2; i++) { const t2 = now + i * .34, g = pos3(M.pos, .1, 'ent', .4); const o = A.createOscillator(); o.frequency.setValueAtTime(66, t2); o.frequency.exponentialRampToValueAtTime(32, t2 + .2); o.connect(g); C.env(g, t2, .005, .3, .2); o.start(t2); o.stop(t2 + .3); }
        if (Math.random() < .3) leg('l5b_passoCasado');
      }
    }

    // ---- Passos que mentem na procura: um trecho totalmente mudo (ideia 70)
    L.passoMudoCd -= dt;
    if (jogando && M.ativo && est === 'procura' && dM < 16 && L.passoMudoCd <= 0 && Math.random() < dt * .15) {
      L.passoMudoCd = C.rand(8, 14); try { C.SOM.silencio(1.5, .25); } catch (e) {} leg('l5b_passoMudo');
    }

    // ---- A casa denuncia por onde ele vem: uma tábua range no caminho dele antes de entrar (ideia 18)
    if (jogando && M.ativo && sala && sala !== L.tabuaSala) {
      if (L.tabuaSala && sala && P.room && (() => { try { return C.salaAdj(sala, P.room); } catch (e) { return false; } })() && dM < 10) {
        const g = pos3(M.pos, .1, 'amb', .4); const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(140, now); o.frequency.exponentialRampToValueAtTime(70, now + .25); const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 300; bp.Q.value = 4; o.connect(bp); bp.connect(g); C.env(g, now, .02, .12, .3); o.start(now); o.stop(now + .4); leg('l5b_tabua', M.pos);
      }
      L.tabuaSala = sala;
    }

    // ---- As chaves que mentem: o molho tilinta de uma sala onde ele NÃO está (ideia 48)
    L.chavesIscaCd -= dt;
    if (jogando && M.ativo && est === 'procura' && L.chavesIscaCd <= 0 && Math.random() < dt * .08) {
      L.chavesIscaCd = C.rand(20, 40); const op = { x: P.pos.x * 2 - M.pos.x, z: P.pos.z * 2 - M.pos.z }; chaves(op, 1); leg('l5b_chavesIsca', op);
    }

    // ---- As chaves vão sendo abafadas de capítulo em capítulo (ideia 77)
    if (jogando && M.ativo && (est === 'patrulha' || est === 'investiga') && dM < 14) {
      L.chaveCd = (L.chaveCd || 0) - dt; if (L.chaveCd <= 0) { L.chaveCd = C.rand(1.4, 2.6); chaves(M.pos, C.clamp(1 - cap * .2, .12, 1)); if (cap >= 3 && Math.random() < .2) leg('l5b_chaveFalha'); }
    }

    // ---- Chamariz do ponto de save: ele imita o tilintar do checkpoint numa sala errada (ideia 39)
    L.saveCd -= dt;
    if (jogando && M.ativo && (est === 'procura' || est === 'emboscada') && cap >= 2 && L.saveCd <= 0 && Math.random() < dt * .05) {
      L.saveCd = C.rand(30, 60); const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * 8, z: P.pos.z + Math.sin(a) * 8 };
      const g = pos3(pos, 1.2, 'amb', .6); for (const f of [1760, 2093, 2637]) C.osc('sine', f, now + C.rand(0, .3), .5, g); C.env(g, now, .02, .06, .8); leg('l5b_saveFalso', pos);
    }

    // ---- Ele lê os nomes das lápides na patrulha do cemitério (ideia 66)
    L.lapideCd -= dt;
    if (jogando && W.mapa === 'cemiterio' && M.ativo && est === 'patrulha' && dM < 16 && L.lapideCd <= 0 && Math.random() < dt * .12) {
      L.lapideCd = C.rand(10, 18); let nomes = ['Rosa', 'Luiz', 'Sebastião', 'Teresa', 'Davi', 'Joaquim'];
      try { if (C.R && C.R.lapides) { const ns = C.R.lapides.map(l => (l.nome || '').split(' ')[0]).filter(Boolean); if (ns.length) nomes = ns; } } catch (e) {}
      fala(C.pick(nomes) + '... ' + C.pick(nomes) + '...'); leg('l5b_lapides');
    }

    // ---- Ele resmunga a lista de castigos na patrulha (ideia 51)
    L.castigoCd -= dt;
    if (jogando && M.ativo && est === 'patrulha' && dM < 18 && L.castigoCd <= 0 && Math.random() < dt * .1) {
      L.castigoCd = C.rand(14, 26); const linhas = ['Falar: uma hora no armário.', 'Chorar: duas horas.', 'Fugir: a noite inteira.', 'Mentir: o porão.', 'Rezar errado: de joelhos no milho.'];
      fala(C.pick(linhas)); leg('l5b_castigo');
    }

    // ---- Ele chama outra criança "aqui!" na patrulha (ideia 71)
    L.outraCd -= dt;
    if (jogando && M.ativo && est === 'patrulha' && !S.hidden && L.outraCd <= 0 && Math.random() < dt * .06) {
      L.outraCd = C.rand(18, 32); const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * C.rand(8, 14), z: P.pos.z + Math.sin(a) * C.rand(8, 14) };
      const g = pos3(pos, 1.5, 'voz', .6); const o = A.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(300, now); o.frequency.linearRampToValueAtTime(360, now + .3); const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1000; bp.Q.value = 4; o.connect(bp); bp.connect(g); C.env(g, now, .04, .08, .4); o.start(now); o.stop(now + .5); leg('l5b_outraCrianca');
    }

    // ---- Leitmotif de três notas que cresce e muda por estado (ideia 4)
    L.leit3Cd -= dt;
    if (jogando && M.ativo && dM < 13 && L.leit3Cd <= 0) {
      L.leit3Cd = est === 'caca' ? 1.6 : est === 'procura' ? 2.6 : 3.6;
      const forca = C.clamp(1 - dM / 13, 0, 1);
      const g = pos3(M.pos, 2, 'ent', .5);
      // três notas; o intervalo fica dissonante na caça, claro na procura, abafado no resto
      const inter = est === 'caca' ? [0, 1, 6] : est === 'procura' ? [0, 4, 7] : [0, 3, 5];
      const corte = est === 'investiga' ? 600 : est === 'procura' ? 1200 : 1800;
      const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = corte; lp.connect(g);
      inter.forEach((semi, i) => { const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 73 * Math.pow(2, semi / 12); o.connect(lp); o.start(now + i * .2); o.stop(now + i * .2 + .7); });
      C.env(g, now, .1, .03 + .05 * forca, 1.1);
      if (Math.random() < .12) leg('l5b_leit3', M.pos);
    }

    // ---- Dueto desafinado: ele entra meio tom abaixo e atrasado da Ana (ideia 38)
    L.duetoCd -= dt;
    if (jogando && cap >= 2 && ANA.ativa && M.ativo && dA < 12 && L.duetoCd <= 0 && (ANA.conta || 0) > 0 && Math.random() < dt * .5) {
      L.duetoCd = C.rand(5, 9); const base = 440 + (ANA.conta || 0) * 12; const g = C.saida({ x: M.pos.x, y: 2.6, z: M.pos.z }, .4, 'ent'); const o = A.createOscillator(); o.type = 'triangle'; o.frequency.value = base * 0.944; o.connect(g); C.env(g, now + .12, .05, .05, .5); o.start(now + .12); o.stop(now + .7); leg('l5b_duetoBeat');
    }
    // no "dez" os dois gritam em uníssono (ideia 53)
    if (jogando && ANA.ativa && (ANA.conta || 0) >= 10 && M.ativo && dM < 16) {
      if (!L.dezFez) { L.dezFez = true; const g = C.saida(null, .5, 'ent'); for (const f of [330, 331, 495]) { const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(g); o.start(now); o.stop(now + .7); } C.env(g, now, .02, .12, .6); leg('l5b_duetoDez'); }
    } else L.dezFez = false;

    // ---- Dueto de passos no Cap III: os passos dele e os passinhos dela no mesmo compasso (ideia 69)
    L.passosAnaCd -= dt;
    if (jogando && cap === 2 && ANA.ativa && M.ativo && !ANA.vista && dM < 14 && dA < 14 && L.passosAnaCd <= 0) {
      L.passosAnaCd = .7; const t1 = now, t2 = now + .02;
      const g1 = pos3(M.pos, .1, 'ent', .4); const o1 = A.createOscillator(); o1.frequency.setValueAtTime(64, t1); o1.frequency.exponentialRampToValueAtTime(32, t1 + .18); o1.connect(g1); C.env(g1, t1, .004, .2, .16); o1.start(t1); o1.stop(t1 + .25);
      const g2 = pos3(ANA.pos, .1, 'ent', .4); const o2 = A.createOscillator(); o2.frequency.setValueAtTime(150, t2); o2.frequency.exponentialRampToValueAtTime(90, t2 + .1); o2.connect(g2); C.env(g2, t2, .003, .1, .09); o2.start(t2); o2.stop(t2 + .15);
      if (Math.random() < .08) leg('l5b_passosAna');
    }

    // ---- Ronco-régua do adormecido quando ele dorme em pé (ideia 64)
    L.roncaCd -= dt;
    if (jogando && M.ativo && (est === 'reza' || est === 'dorme' || M.dormindo) && dM < 18 && L.roncaCd <= 0) {
      L.roncaCd = C.rand(2.8, 3.6); const g = pos3(M.pos, 1.8, 'ent', .4); const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(70, now); o.frequency.linearRampToValueAtTime(52, now + .6); o.frequency.linearRampToValueAtTime(90, now + 1.1); const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 300; o.connect(lp); lp.connect(g); C.env(g, now, .3, .08, 1.3); o.start(now); o.stop(now + 1.7); if (Math.random() < .2) leg('l5b_ronca', M.pos);
    }

    // ---- Rádio como máscara/detector: a estática cresce com a proximidade e estoura quando ele entra (ideia 42)
    L.radioCd -= dt;
    try {
      const ger = (C.AMB && C.AMB.ger) || null;
      if (ger && ger.pos && jogando && M.ativo) {
        const dGer = Math.hypot(M.pos.x - ger.pos.x, M.pos.z - ger.pos.z);
        if (dGer < 4 && L.radioCd <= 0) { L.radioCd = 6; const g = C.saida({ x: ger.pos.x, y: 1, z: ger.pos.z }, .4, 'amb'); C.burst(now, .5, 'bandpass', 2600, 1, g); C.env(g, now, .01, .14, .45); leg('l5b_radioChia', ger.pos); }
      }
    } catch (e) {}

    // ---- A natureza se cala pouco antes de uma ameaça chegar (ideia 21)
    // (o motor sobrescreve os ganhos de ambiência a cada quadro; usamos o vácuo curto do som)
    const ameacaPerto = (M.ativo && dM < 7 && est !== 'patrulha') || (ANA.ativa && dA < 7) || (PROC.fase === 'passando' && PROC.pos && PROC.pos.distanceTo(P.pos) < 9);
    if (jogando && ameacaPerto && !L.grilosFez) { L.grilosFez = true; try { C.SOM.silencio(1.2, .45); } catch (e) {} leg('l5b_grilos'); }
    else if (!ameacaPerto) L.grilosFez = false;

    // ================= SEGUNDA LEVA =================
    const estMudou = est !== L.estPrev;

    // ---- Respiração-régua da Lia: acelera por camadas com a ameaça real mais próxima (ideia 33)
    const perigoMin = Math.min(M.ativo ? dM : 99, ANA.ativa ? dA : 99, (PROC.fase === 'passando' && PROC.pos) ? PROC.pos.distanceTo(P.pos) : 99);
    if (jogando && !prende && perigoMin < 12 && S.fear > 40) {
      L.reguaT = (L.reguaT || 0) - dt; if (L.reguaT <= 0) {
        L.reguaT = 60 / (16 + 20 * C.clamp(1 - perigoMin / 12, 0, 1));
        const g = C.saida(null, .1, 'corpo'); C.burst(now, .42, 'bandpass', 760, 1.2, g); C.env(g, now, .1, .05 + .05 * C.clamp(1 - perigoMin / 12, 0, 1), .3);
      }
    }

    // ---- Na 'escuta' dele, sobe o seu coração e a respiração no vácuo (ideia 14)
    if (est === 'escuta' && !L.escutaFez && jogando) { L.escutaFez = true; heart(50, .2); const g = C.saida(null, .1, 'corpo'); C.burst(now + .2, .5, 'bandpass', 820, 1.3, g); C.env(g, now + .2, .12, .09, .4); }
    else if (est !== 'escuta') L.escutaFez = false;

    // ---- Prender o ar colado nele faz o sangue bater nos ouvidos (pânico)
    if (jogando && prende && M.ativo && dM < 5) { L.sangueCd = (L.sangueCd || 0) - dt; if (L.sangueCd <= 0) { L.sangueCd = 60 / 110; const g = C.saida(null, 0, 'corpo'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(40, now); o.frequency.exponentialRampToValueAtTime(24, now + .14); o.connect(g); C.env(g, now, .01, .14, .18); o.start(now); o.stop(now + .25); } }

    // ---- Silêncio-tampão: quando ele fareja/vasculha o seu armário, o mundo abafa grave (ideia 9)
    if (jogando && S.hidden && M.ativo && dM < 2 && (est === 'fareja' || est === 'vasculha' || est === 'conferir')) { if (!L.farejaFez) { L.farejaFez = true; try { C.abafarMundo(.25, 1.4); } catch (e) {} } } else L.farejaFez = false;

    // ---- Duelo de fôlego: colado no armário, a respiração dele some e sobra só o seu coração (ideia 72)
    if (jogando && S.hidden && M.ativo && dM < 1.6 && est === 'emboscada') { L.foleT = (L.foleT || 0) - dt; if (L.foleT <= 0) { L.foleT = 60 / (72 + 40 * C.clamp(S.fear / 100, 0, 1)); heart(48, .16); if (Math.random() < .04) leg('l5b_corBussola'); } }

    // ---- Coração errado do monstro colado ao esconderijo, que acelera antes de ele abrir (ideia 19)
    if (jogando && S.hidden && M.ativo && dM < 2.4 && (est === 'vasculha' || est === 'conferir')) {
      L.corErrT = (L.corErrT || 0) - dt; const abrindo = (M.vasculhaT != null && M.vasculhaT < 1.5) || (M.conferirT != null && M.conferirT < 1.5);
      if (L.corErrT <= 0) { L.corErrT = abrindo ? .4 : .95; const g = C.saida({ x: M.pos.x, y: 1.2, z: M.pos.z }, .3, 'ent'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(42, now); o.frequency.exponentialRampToValueAtTime(26, now + .17); o.connect(g); C.env(g, now, .01, .12, .22); o.start(now); o.stop(now + .3); }
    }

    // ---- Coração-bússola em arritmia quando ele caça colado (ideia 78)
    if (jogando && M.ativo && est === 'caca' && dM < 3) { L.arritT = (L.arritT || 0) - dt; if (L.arritT <= 0) { L.arritT = C.rand(1.4, 2.4); heart(48, .16, pontoDir(M.pos, 1)); const g = C.saida(null, 0, 'corpo'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(48, now + .5); o.frequency.exponentialRampToValueAtTime(30, now + .62); o.connect(g); C.env(g, now + .5, .01, .1, .14); o.start(now + .5); o.stop(now + .7); } }

    // ---- Ele imita a contagem da Menina de uma sala vazia quando a Ana NÃO está ativa (ideia 26)
    L.contaCd = (L.contaCd || 0) - dt;
    if (jogando && M.ativo && est === 'procura' && !ANA.ativa && L.contaCd <= 0 && Math.random() < dt * .12) {
      L.contaCd = C.rand(14, 24); const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * C.rand(7, 12), z: P.pos.z + Math.sin(a) * C.rand(7, 12) };
      const nums = [392, 440, 494, 523]; nums.forEach((f, i) => tono(pos, { type: 'triangle', f0: f, dur: .3, peak: .05, wet: .6, y: 1.3, bp: 1000, Q: 3, delay: i * .36 }));
    }

    // ---- Raramente, a respiração da Lia sai com o tom do Inspetor ao soltar o ar (ideia 54)
    if (jogando && !prende && L.prendPrev && M.ativo && dM < 10) { if (Math.random() < .14) { const g = C.saida(null, .2, 'corpo'); const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(150, now); o.frequency.linearRampToValueAtTime(90, now + .4); const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 3; o.connect(bp); bp.connect(g); C.env(g, now, .05, .08, .4); o.start(now); o.stop(now + .5); } }
    L.prendPrev = prende;

    // ---- O Chamado às vezes imita a voz da Lia pedindo socorro de outra sala (ideia 5)
    L.chamLiaCd = (L.chamLiaCd || 0) - dt;
    if (jogando && C.chamado && L.chamLiaCd <= 0 && Math.random() < dt * .1) {
      L.chamLiaCd = C.rand(18, 30); const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * 7, z: P.pos.z + Math.sin(a) * 7 };
      for (const [k, f, v] of [[0, 300, 'e'], [.3, 260, 'a'], [.7, 330, 'i']]) { if (C.SOMX && false) { } tono(pos, { type: 'triangle', f0: f, f1: f * .9, dur: .32, peak: .06, wet: .7, y: 1.6, bp: 1200, Q: 4, delay: k }); }
    }

    // ---- O Chamado às vezes usa a voz da mãe e erra o seu nome (ideia 12)
    L.chamMaeCd = (L.chamMaeCd || 0) - dt;
    if (jogando && C.chamado && L.chamMaeCd <= 0 && Math.random() < dt * .08) {
      L.chamMaeCd = C.rand(24, 40); const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * 8, z: P.pos.z + Math.sin(a) * 8 };
      const nome = nomeJog(); const erra = nome && Math.random() < .5 ? C.pick(['Rosa', 'Teresa', 'Ana']) : (nome || 'Lia');
      fala('Filha... ' + erra + '?'); sussurroNome(pos, .7);
    }

    // ---- Nos túneis, a voz dele sai de uma sala vizinha ERRADA (ideia 45)
    L.vozErradaCd = (L.vozErradaCd || 0) - dt;
    if (jogando && W.mapa === 'tuneis' && M.ativo && (est === 'procura' || est === 'caca') && L.vozErradaCd <= 0 && Math.random() < dt * .1) {
      L.vozErradaCd = C.rand(16, 28); const op = { x: P.pos.x * 2 - M.pos.x, z: P.pos.z * 2 - M.pos.z };
      const g = C.saida({ x: op.x, y: 2.4, z: op.z }, .9, 'ent'); const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(96, now); o.frequency.linearRampToValueAtTime(78, now + .8); const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 240; bp.Q.value = 6; o.connect(bp); bp.connect(g); C.env(g, now, .1, .08, .8); o.start(now); o.stop(now + 1);
    }

    // ---- A bengala bate num móvel quando ele esbarra fora da caça
    L.bengMovelCd = (L.bengMovelCd || 0) - dt;
    if (jogando && M.ativo && dM < 12 && (est === 'patrulha' || est === 'investiga' || est === 'procura') && L.bengMovelCd <= 0 && Math.random() < dt * .25) {
      L.bengMovelCd = C.rand(4, 8); tono(M.pos, { type: 'square', f0: 420, f1: 220, dur: .12, peak: .14, wet: .4, y: .8, bp: 900, Q: 2 });
    }

    // ---- Expiração de frustração quando ele perde o rastro; inspiração ao achar (ideias de estado)
    if (jogando && M.ativo && estMudou) {
      if ((L.estPrev === 'procura' || L.estPrev === 'caca') && (est === 'patrulha' || est === 'investiga')) { const g = C.saida({ x: M.pos.x, y: 2.6, z: M.pos.z }, .3, 'ent'); const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(130, now); o.frequency.exponentialRampToValueAtTime(70, now + .9); const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; o.connect(lp); lp.connect(g); C.env(g, now, .1, .09, .9); o.start(now); o.stop(now + 1.1); }
      if ((est === 'fareja' || est === 'procura') && (L.estPrev === 'patrulha' || L.estPrev === 'investiga')) { const g = C.saida({ x: M.pos.x, y: 2.6, z: M.pos.z }, .2, 'ent'); const s = C.ruido(), f = A.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(900, now); f.frequency.linearRampToValueAtTime(2200, now + .25); f.Q.value = 3; s.connect(f); f.connect(g); C.env(g, now, .02, .1, .28); s.start(now); s.stop(now + .35); }
    }

    // ---- Alívio grave quando ele desiste e os passos diminuem (transição para patrulha)
    if (jogando && M.ativo && estMudou && (L.estPrev === 'caca') && est !== 'caca') { const g = C.saida(null, .4, 'corpo'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(60, now); o.frequency.exponentialRampToValueAtTime(90, now + 1.4); o.connect(g); C.env(g, now, .4, .07, 1.2); o.start(now); o.stop(now + 1.8); }

    // ---- Estalos dos dedos/juntas dele no instante do bote (ideia tátil)
    if (jogando && emBote && !L.juntaFez) { L.juntaFez = true; for (let i = 0; i < 3; i++) tono(M.ativo ? M.pos : null, { type: 'square', f0: C.rand(180, 320), dur: .03, peak: .12, wet: .2, y: 1.6, delay: i * .07 }); }
    else if (!emBote) L.juntaFez = false;

    // ---- Unhas arranhando a madeira quando ele vasculha o armário
    L.unhaCd = (L.unhaCd || 0) - dt;
    if (jogando && S.hidden && M.ativo && dM < 1.8 && (est === 'vasculha' || est === 'conferir') && L.unhaCd <= 0) {
      L.unhaCd = C.rand(1.6, 3); const g = C.saida({ x: M.pos.x, y: 1.3, z: M.pos.z }, .2, 'ent'); const f = C.burst(now, .35, 'highpass', 2200, 1, g); C.env(g, now, .01, .07, .3);
    }

    // ---- "Shhh" dele pedindo silêncio quando você faz barulho na patrulha
    L.shhDele = (L.shhDele || 0) - dt;
    if (jogando && M.ativo && est === 'patrulha' && P.noiseR > 3 && dM < 16 && L.shhDele <= 0) {
      L.shhDele = C.rand(6, 10); const g = C.saida({ x: M.pos.x, y: 2.6, z: M.pos.z }, .4, 'voz'); C.burst(now, .5, 'bandpass', 5200, 2, g); C.env(g, now, .05, .09, .4);
    }

    // ---- Crachá/medalhão tilintando no peito ao andar nos primeiros capítulos (some depois)
    L.crachaCd = (L.crachaCd || 0) - dt;
    if (jogando && M.ativo && cap <= 2 && dM < 14 && (est === 'patrulha' || est === 'investiga') && L.crachaCd <= 0) {
      L.crachaCd = C.rand(1.2, 2.2); tono(M.pos, { type: 'sine', f0: 3200, dur: .08, peak: .05 * (1 - cap * .25), wet: .3, y: 1.3 });
    }

    // ---- Lampião chiando/pingando óleo quando ele está perto nos capítulos iniciais
    L.lampCd = (L.lampCd || 0) - dt;
    if (jogando && M.ativo && cap <= 2 && dM < 8 && L.lampCd <= 0) {
      L.lampCd = C.rand(2.4, 4); const g = C.saida({ x: M.pos.x, y: 1.4, z: M.pos.z }, .3, 'ent'); C.burst(now, .6, 'bandpass', 1800, .7, g); C.env(g, now, .3, .025, .5);
      if (Math.random() < .4) tono({ x: M.pos.x, y: .8, z: M.pos.z }, { type: 'sine', f0: 900, f1: 300, dur: .08, peak: .04, wet: .4, delay: .5 });
    }

    // ---- Tosse encatarrada dele, pior a cada capítulo
    L.tosseCd = (L.tosseCd || 0) - dt;
    if (jogando && M.ativo && dM < 14 && est !== 'caca' && L.tosseCd <= 0 && Math.random() < dt * .12) {
      L.tosseCd = C.rand(10, 20); const g = C.saida({ x: M.pos.x, y: 2.6, z: M.pos.z }, .3, 'ent'); for (let i = 0; i < 2 + (cap >= 3 ? 1 : 0); i++) { const f = C.burst(now + i * .18, .14, 'bandpass', 500 - cap * 40, 1.5, g); } C.env(g, now, .02, .1 + cap * .01, .4);
    }

    // ---- Estalo do pescoço quando ele vira a cabeça na sua direção
    let encaraAgora = false; try { const ay = M.yaw || 0, dx = P.pos.x - M.pos.x, dz = P.pos.z - M.pos.z, ang = Math.atan2(dx, dz); let d2 = Math.abs(ang - ay); d2 = Math.min(d2, Math.PI * 2 - d2); encaraAgora = M.ativo && d2 < .4 && dM < 14; } catch (e) {}
    if (jogando && encaraAgora && !L.encaraPrev) { tono(M.pos, { type: 'square', f0: 260, dur: .04, peak: .1, wet: .3, y: 2.3 }); tono(M.pos, { type: 'square', f0: 200, dur: .03, peak: .08, wet: .3, y: 2.3, delay: .06 }); }
    L.encaraPrev = encaraAgora;

    // ---- Rangido da bota ao agachar para olhar embaixo da cama
    L.botaCd = (L.botaCd || 0) - dt;
    if (jogando && S.hidden && M.ativo && dM < 2 && est === 'conferir' && L.botaCd <= 0) {
      L.botaCd = C.rand(2.5, 4.5); const g = C.saida({ x: M.pos.x, y: .6, z: M.pos.z }, .2, 'ent'); const f = C.burst(now, .5, 'bandpass', 1500, 2, g); f.frequency.linearRampToValueAtTime(900, now + .45); C.env(g, now, .08, .07, .4);
    }

    // ---- Assobio baixo e desafinado dele na patrulha do Capítulo I
    L.assobioCd = (L.assobioCd || 0) - dt;
    if (jogando && M.ativo && cap === 0 && est === 'patrulha' && dM < 16 && L.assobioCd <= 0 && Math.random() < dt * .1) {
      L.assobioCd = C.rand(12, 22); const notas = [523, 587, 494, 523]; notas.forEach((f, i) => tono(M.pos, { type: 'sine', f0: f * C.rand(.97, 1.02), dur: .35, peak: .04, wet: .5, y: 2.5, delay: i * .4 }));
    }

    // ---- Relógio dando a hora cheia, abafado ao longe, mais badaladas por capítulo
    L.relogioCd = (L.relogioCd || 0) - dt;
    if (jogando && L.relogioCd <= 0 && Math.random() < dt * .02) {
      L.relogioCd = C.rand(60, 120); const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * 24, z: P.pos.z + Math.sin(a) * 24 }, n = Math.min(12, 6 + cap);
      for (let i = 0; i < n; i++) tono(pos, { type: 'sine', f0: 180, dur: .5, peak: .05, wet: .9, y: 3, lp: 400, delay: i * .7 });
    }

    // ---- A respiração dele ecoa diferente por ala (túneis abafado, capela brilhante)
    L.respAlaCd = (L.respAlaCd || 0) - dt;
    if (jogando && M.ativo && dM < 9 && est !== 'caca' && L.respAlaCd <= 0) {
      L.respAlaCd = C.rand(3, 5); const lp = W.mapa === 'tuneis' ? 400 : W.mapa === 'cemiterio' ? 1400 : 760; const wet = W.mapa === 'tuneis' ? .9 : W.mapa === 'cemiterio' ? .8 : .4;
      const g = C.saida({ x: M.pos.x, y: 2.4, z: M.pos.z }, wet, 'ent'); C.burst(now, .5, 'bandpass', lp, 1.4, g); C.env(g, now, .1, .07, .4);
    }

    // ---- Gotas escorrendo do casaco encharcado quando ele para perto (Cap IV+)
    L.gotaCd = (L.gotaCd || 0) - dt;
    if (jogando && M.ativo && cap >= 3 && dM < 5 && (est === 'escuta' || est === 'emboscada' || est === 'investiga') && L.gotaCd <= 0) {
      L.gotaCd = C.rand(1.4, 3); tono({ x: M.pos.x, y: 1, z: M.pos.z }, { type: 'sine', f0: 1200, f1: 380, dur: .09, peak: .05, wet: .5, y: .3 });
    }

    // ---- Ranger do assoalho sob o peso dele parado do outro lado da parede
    L.assoalhoCd = (L.assoalhoCd || 0) - dt;
    if (jogando && M.ativo && !S.hidden && dM < 5 && (est === 'escuta' || est === 'emboscada') && sala && P.room && sala !== P.room && L.assoalhoCd <= 0) {
      L.assoalhoCd = C.rand(2.5, 4.5); const g = C.saida({ x: M.pos.x, y: .1, z: M.pos.z }, .3, 'ent'); const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(90, now); o.frequency.linearRampToValueAtTime(60, now + .5); const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220; o.connect(lp); lp.connect(g); C.env(g, now, .15, .08, .5); o.start(now); o.stop(now + .7);
    }

    // ---- Murmúrio de oração às avessas quando ele reza
    L.oracaoCd = (L.oracaoCd || 0) - dt;
    if (jogando && M.ativo && est === 'reza' && dM < 12 && L.oracaoCd <= 0 && Math.random() < dt * .3) {
      L.oracaoCd = C.rand(5, 9); const g = C.saida({ x: M.pos.x, y: 1.8, z: M.pos.z }, .5, 'voz'); for (const [k, f] of [[0, 220], [.35, 180], [.7, 247]]) { const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, now + k); o.frequency.linearRampToValueAtTime(f * 1.08, now + k + .3); const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 4; o.connect(bp); bp.connect(g); o.start(now + k); o.stop(now + k + .35); } C.env(g, now, .1, .05, 1.1);
    }

    // ---- Baque do corpo dele contra a porta ao arrombar o esconderijo (quando ele te agarra escondida)
    const arromba = S.hidden && M.ativo && (est === 'agarra' || est === 'bote' || M.arrombando);
    if (jogando && arromba && !L.arrombaFez) { L.arrombaFez = true; const g = C.saida(M.ativo ? { x: M.pos.x, y: 1.2, z: M.pos.z } : null, .5, 'ent'); C.burst(now, .3, 'lowpass', 180, 1, g, 0); C.env(g, now, .003, .5, .3); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(70, now); o.frequency.exponentialRampToValueAtTime(34, now + .25); o.connect(g); o.start(now); o.stop(now + .3); }
    else if (!arromba) L.arrombaFez = false;

    // ---- Apito molhado e engasgado no Cap V durante a caça (ferido)
    L.apitoMolCd = (L.apitoMolCd || 0) - dt;
    if (jogando && M.ativo && cap >= 4 && est === 'caca' && L.apitoMolCd <= 0 && Math.random() < dt * .1) {
      L.apitoMolCd = C.rand(5, 9); const g = C.saida({ x: M.pos.x, y: 2.8, z: M.pos.z }, .4, 'ent'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(2600, now); o.frequency.linearRampToValueAtTime(1800, now + .4); const s = C.ruido(), sf = A.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 2000; sf.Q.value = 2; s.connect(sf); sf.connect(g); o.connect(g); C.env(g, now, .03, .07, .4); o.start(now); o.stop(now + .5); s.start(now); s.stop(now + .5);
    }

    // ---- Eco do seu próprio passo volta "errado" nos túneis quando você anda
    L.passoEcoCd = (L.passoEcoCd || 0) - dt;
    if (jogando && W.mapa === 'tuneis' && P.noiseR > 2.5 && L.passoEcoCd <= 0) {
      L.passoEcoCd = C.rand(1.2, 2.2); const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * 10, z: P.pos.z + Math.sin(a) * 10 };
      tono(pos, { type: 'sine', f0: 66, f1: 34, dur: .18, peak: .08, wet: .9, y: .2, delay: .22 });
    }

    // ---- Clique metálico do lampião dele ao acender/apagar perto
    L.lampClickCd = (L.lampClickCd || 0) - dt;
    if (jogando && M.ativo && cap <= 3 && dM < 7 && estMudou && (est === 'escuta' || L.estPrev === 'escuta') && L.lampClickCd <= 0) {
      L.lampClickCd = C.rand(3, 6); tono(M.pos, { type: 'square', f0: 1800, dur: .02, peak: .1, wet: .2, y: 1.4 }); tono(M.pos, { type: 'square', f0: 1400, dur: .02, peak: .08, wet: .2, y: 1.4, delay: .05 });
    }

    // ---- Bengala com timbre por piso nos capítulos iniciais (madeira, pedra, água) (ideia 73)
    L.bengPisoT = (L.bengPisoT || 0) - dt;
    if (jogando && M.ativo && cap <= 2 && dM < 16 && (est === 'patrulha' || est === 'investiga' || est === 'procura') && L.bengPisoT <= 0) {
      L.bengPisoT = (est === 'procura' ? .55 : .9) * C.rand(.9, 1.1);
      const agua = W.mapa === 'tuneis' || (sala && sala.agua), madeira = W.mapa === 'superior';
      const f0 = agua ? 220 : madeira ? 300 : 360, lp = agua ? 500 : madeira ? 1200 : 2200;
      tono(M.pos, { type: 'triangle', f0, f1: f0 * .5, dur: .1, peak: agua ? .18 : .24, wet: agua ? .6 : .3, y: .1, lp });
    }

    L.estPrev = est; L.furiaPrev = furia;
  }

  // =============== SONS ===============
  // sussurro do nome (ruído formantado, sem síntese de voz real)
  function sussurroNome(pos, wet, atraso) {
    const A = ac(), t = A.currentTime + (atraso || 0); const g = C.saida({ x: pos.x, y: 1.6, z: pos.z }, wet ?? .6, 'voz');
    const silabas = C.rand(2, 3) | 0;
    for (let i = 0; i < silabas; i++) { const s = C.ruido(), f = A.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = C.rand(900, 1800); f.Q.value = 6; s.connect(f); f.connect(g); s.start(t + i * .22, Math.random()); s.stop(t + i * .22 + .16); }
    C.env(g, t, .06, .05, silabas * .22);
  }

  // tom simples posicionável com envelope e filtro opcional
  function tono(pos, o) {
    const A = ac(); if (!A) return; const t = A.currentTime + (o.delay || 0);
    const g = pos ? C.saida({ x: pos.x, y: o.y ?? 1.8, z: pos.z }, o.wet ?? .4, o.bus || 'ent') : C.saida(null, o.wet ?? .4, o.bus || 'ent');
    const osc = A.createOscillator(); osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(o.f0, t); if (o.f1 && o.f1 !== o.f0) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f1), t + (o.dur || .4));
    let node = g; if (o.lp) { const fl = A.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; fl.connect(g); node = fl; } else if (o.bp) { const fl = A.createBiquadFilter(); fl.type = 'bandpass'; fl.frequency.value = o.bp; fl.Q.value = o.Q || 3; fl.connect(g); node = fl; }
    osc.connect(node); C.env(g, t, o.atk ?? .02, o.peak ?? .08, o.dur || .4); osc.start(t); osc.stop(t + (o.dur || .4) + .1);
  }
  // sopro/chiado filtrado posicionável
  function chiado(pos, o) {
    const A = ac(); if (!A) return; const t = A.currentTime + (o.delay || 0);
    const g = pos ? C.saida({ x: pos.x, y: o.y ?? 1.8, z: pos.z }, o.wet ?? .4, o.bus || 'ent') : C.saida(null, o.wet ?? .4, o.bus || 'ent');
    C.burst(t, o.dur || .4, o.filt || 'bandpass', o.f || 1500, o.Q || 3, g); C.env(g, t, o.atk ?? .02, o.peak ?? .08, o.dur || .4);
  }

  // apito com gramática: 1 = curto, 2 = dois curtos, 3 = um longo (ideia 16)
  function apito(tipo, pos) {
    const A = ac(); if (!A) return; const t = A.currentTime; const src = pos ? { x: pos.x, y: 2.8, z: pos.z } : null;
    const pio = (t0, dur) => { const g = C.saida(src, .4, 'ent'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.value = 2900; const lfo = A.createOscillator(); lfo.frequency.value = 26; const lg = A.createGain(); lg.gain.value = 90; lfo.connect(lg); lg.connect(o.frequency); o.connect(g); C.env(g, t0, .01, .09, dur); o.start(t0); lfo.start(t0); o.stop(t0 + dur + .05); lfo.stop(t0 + dur + .05); };
    if (tipo === 1) { pio(t, .18); leg('l5b_apito1'); }
    else if (tipo === 2) { pio(t, .16); pio(t + .28, .16); leg('l5b_apito2'); }
    else { pio(t, .7); leg('l5b_apitoLongo'); }
  }

  // o apito range a melodia da Hora do Silêncio (ideia 22)
  function apitoHora(pos) {
    const A = ac(); if (!A) return; const t = A.currentTime; const src = pos ? { x: pos.x, y: 2.8, z: pos.z } : null;
    const mel = [659, 659, 784, 659, 523]; const fur = C.clamp((C.M.furia || 0) / 6, 0, 1);
    mel.forEach((f, i) => { const g = C.saida(src, .5, 'ent'); const ws = A.createWaveShaper(); ws.curve = C.curvaDist(4 + 8 * fur); ws.connect(g); const o = A.createOscillator(); o.type = 'sine'; o.frequency.value = f * (1 + .06 * fur); const lfo = A.createOscillator(); lfo.frequency.value = 22; const lg = A.createGain(); lg.gain.value = 70; lfo.connect(lg); lg.connect(o.frequency); o.connect(ws); C.env(g, t + i * .32, .02, .07, .3); o.start(t + i * .32); lfo.start(t + i * .32); o.stop(t + i * .32 + .35); lfo.stop(t + i * .32 + .35); });
    leg('l5b_apitoHora');
  }

  // tilintar de chaves com volume escalável (desumanização capítulo a capítulo, idéias 48/77)
  function chaves(pos, vol) {
    const A = ac(); if (!A) return; const t = A.currentTime; const g = C.saida({ x: pos.x, y: 1.2, z: pos.z }, .4, 'ent');
    for (let i = 0; i < 4; i++) { const f = C.burst(t + i * .05, .06, 'bandpass', C.rand(2400, 3600), 10, g); } C.env(g, t, .002, .08 * (vol ?? 1), .2);
  }

  // =============== GANCHOS PÚBLICOS ===============
  // chamado pelo laço do sino: cada badalada abafa quase tudo por um instante (ideia 17)
  function badalada(i, n) {
    const A = ac(); if (!A) return;
    try { if (typeof window !== 'undefined' && (window.__teste || (window.navigator && window.navigator.webdriver))) return; } catch (e) {}
    try { C.SOM.silencio(.5, .12); } catch (e) {}
    if (i === 0 && (C.S && C.S.chapter >= 1)) leg('l5b_badalada');
  }

  return { tick, apito, apitoHora, chaves, badalada, sussurroNome };
}
