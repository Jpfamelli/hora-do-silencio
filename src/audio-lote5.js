// =====================================================================
// ÁUDIO — LOTE 5 ("Os monstros pelo ouvido")
// Camadas de som que fazem as entidades serem lidas, temidas e enfrentadas
// só pela audição: respiração que vaza por porta e parede, estalos e chaves
// com direção 3D, leitmotifs por entidade, infra-som antes da caçada,
// trilha de caça por proximidade, a Hora do Silêncio, a cantiga que muda
// com a fúria e o capítulo, o apito ferido, o coração como bússola e mais.
// Som 100% procedural. Ligado ao motor por poucas linhas (procure AUDL5 em jogo.js).
// =====================================================================

const LEGENDAS = {
  l5_infra: { t: 'um grave fundo faz o ar tremer', imp: 1, cd: 14, cat: 'p' },
  l5_zumProx: { t: 'um zumbido grave cresce bem perto', imp: 0, cd: 8, cat: 'p' },
  l5_venda: { t: 'um fio de zumbido: ele virou a cara para cá', imp: 0, cd: 6, cat: 'p' },
  l5_respParede: { t: 'uma respiração rasgada vaza pela parede', imp: 0, cd: 5, cat: 'p', pos: a => a[0], insp: 1 },
  l5_respPorta: { t: 'uma respiração rasgada vaza pela fresta da porta', imp: 1, cd: 5, cat: 'p', pos: a => a[0], insp: 1 },
  l5_bengala: { t: 'uma bengala tateia o chão', imp: 0, cd: 3, cat: 'p', pos: a => a[0], insp: 1 },
  l5_bengalaMovel: { t: 'a bengala bate num móvel', imp: 0, cd: 3, cat: 'p', pos: a => a[0] },
  l5_dentes: { t: 'o ar entra e sai pelos dentes dele', imp: 1, cd: 4, cat: 'p' },
  l5_coracaoAlto: { t: 'o seu coração vaza no silêncio', imp: 1, cd: 6, cat: 'p' },
  l5_hora: { t: 'a Hora do Silêncio: fique absolutamente parada', imp: 1, cd: 30, cat: 'p' },
  l5_chavesCalam: { t: 'as chaves dele calam de repente', imp: 1, cd: 5, cat: 'p' },
  l5_geradorAbafa: { t: 'o gerador abafa os seus passos', imp: 1, cd: 10, cat: 'h' },
  l5_leit_inspetor: { t: 'uma corda grave arranha perto', imp: 0, cd: 7, cat: 'p' },
  l5_leit_ana: { t: 'uma caixinha desafinada tilinta perto', imp: 0, cd: 7, cat: 'h' },
  l5_leit_procissao: { t: 'um coro de crianças soa perto', imp: 0, cd: 7, cat: 'h' },
  l5_leit_chamado: { t: 'uma voz ao contrário chama perto', imp: 0, cd: 7, cat: 'h' },
  l5_imitaSom: { t: 'ele repete, distorcido, o último barulho que você fez', imp: 1, cd: 8, cat: 'p' },
  l5_vozMenino: { t: 'por baixo do chiado, um menino chora', imp: 1, cd: 10, cat: 'h' },
  l5_cano: { t: 'uma batida corre pelos canos', imp: 1, cd: 4, cat: 'h', pos: a => a[0] },
  l5_apitoFerido: { t: 'o apito sai ferido, só chiado', imp: 1, cd: 6, cat: 'h' },
  l5_choroAnda: { t: 'um choro de menino se move pelas salas', imp: 0, cd: 6, cat: 'h', pos: a => a[0] },
  l5_coracaoCrianca: { t: 'um coração de criança bate, não o seu', imp: 1, cd: 10, cat: 'h' },
  l5_segundoCoracao: { t: 'um segundo coração, mais lento, bate junto', imp: 1, cd: 8, cat: 'p' },
  l5_coral: { t: 'o coro da Procissão mede a distância', imp: 0, cd: 6, cat: 'p' },
  l5_pressagio: { t: 'um sussurro ao contrário cresce: algo vem', imp: 1, cd: 8, cat: 'p' },
  l5_doisChamados: { t: 'duas vozes chamam de lados opostos', imp: 1, cd: 10, cat: 'p' },
  l5_coroCamping: { t: 'vozes de criança sobem onde você parou', imp: 1, cd: 12, cat: 'p' },
  l5_armarioResp: { t: 'uma respiração infantil presa num armário', imp: 0, cd: 6, cat: 'h', pos: a => a[0] },
  l5_cliqueFalso: { t: 'um clique de lanterna que não foi você', imp: 1, cd: 6, cat: 'p', pos: a => a[0] },
  l5_duetoCaixinha: { t: 'a Ana completa a cantiga de outro canto', imp: 1, cd: 8, cat: 'h' },
  l5_coroUnido: { t: 'o canto da fila vira a voz rachada dele', imp: 1, cd: 10, cat: 'p' },
  l5_interfone: { t: 'um interfone antigo toca numa sala', imp: 1, cd: 8, cat: 'h', pos: a => a[0] }
};

export function instalarAudioLote5(C) {
  const { THREE } = C;
  if (C.legendas) Object.assign(C.legendas, LEGENDAS);
  const ac = () => C.AC;
  const leg = (k, ...a) => { try { C.som(k, a); } catch (e) {} };
  // estado do módulo
  const L = {
    nodes: null, pronto: false,
    estPrev: null, capPrev: -1, mapaPrev: null,
    infraT: 0, dentesT: 0, zumVendaOn: false,
    leitT: 0, respParedeT: 0, respPortaT: 0, bengalaT: 0,
    chavesIam: false, chavesCalT: 0, geradorAviso: 0,
    horaAtiva: false, horaT: 0, horaAvisou: false, horaNoise: 0,
    ultNoise: { x: 0, z: 0, r: 0, t: -99 }, imitaCd: 0,
    cantigaCap: -1, apitoFuro: false,
    choroPos: null, choroT: 0, coralT: 0,
    campingX: 0, campingZ: 0, campingAc: 0, campingAvisou: 0,
    presagioCd: 0, cliqueAnaCd: 0, duetoCd: 0, armarioCd: 0,
    interfoneCd: 0, interfoneTocando: null, canoCd: 0,
    segCoracaoT: 0, bussolaT: 0, vozMeninoCd: 0, doisCd: 0
  };

  // --- Nós contínuos criados uma vez (como SOM.musica no motor)
  function montar() {
    const A = ac(); if (!A || L.nodes) return;
    const BUS = C.BUS, N = {};
    // infra-som (<40 Hz): o corpo sente antes do ouvido (ideia 5)
    N.infra = A.createGain(); N.infra.gain.value = 0; N.infra.connect(C.master ? C.master : BUS.sfx);
    N.infraO = A.createOscillator(); N.infraO.type = 'sine'; N.infraO.frequency.value = 32; N.infraO.connect(N.infra); N.infraO.start();
    // zumbido de proximidade: grave que sobe com 1/d quando ele divide a sala invisível (ideia 15)
    N.zum = A.createGain(); N.zum.gain.value = 0; const zlp = A.createBiquadFilter(); zlp.type = 'lowpass'; zlp.frequency.value = 220; N.zum.connect(BUS.amb);
    N.zumO = A.createOscillator(); N.zumO.type = 'sawtooth'; N.zumO.frequency.value = 58; N.zumO.connect(zlp); zlp.connect(N.zum); N.zumO.start();
    // fio de zumbido agudo da venda quando ele encara (ideia 23)
    N.venda = A.createGain(); N.venda.gain.value = 0; N.venda.connect(BUS.amb);
    N.vendaO = A.createOscillator(); N.vendaO.type = 'sine'; N.vendaO.frequency.value = 5200; N.vendaO.connect(N.venda); N.vendaO.start();
    // respiração-régua contínua + binaural: ritmo/volume mapeiam a distância e o lado de onde ele vem (ideias 13,62)
    N.respG = A.createGain(); N.respG.gain.value = 0; const rf = A.createBiquadFilter(); rf.type = 'bandpass'; rf.frequency.value = 820; rf.Q.value = 1.4;
    N.respPan = A.createStereoPanner ? A.createStereoPanner() : null;
    N.respS = C.ruido(true); N.respS.connect(rf); rf.connect(N.respG);
    if (N.respPan) { N.respG.connect(N.respPan); N.respPan.connect(BUS.ent); } else N.respG.connect(BUS.ent);
    N.respF = rf; N.respS.start();
    // trilha de caça por proximidade: baixo pulsante, feito à mão no tick (ideia 19) usa SOM.pulso existente
    L.nodes = N; L.pronto = true;
  }

  // --- panner 3D + oclusão aproveitando o motor
  function pos3(pos, y, bus, wet) { return C.saida({ x: pos.x, y: y ?? 1.6, z: pos.z }, wet ?? .5, bus || 'ent'); }

  // respiração rasgada abafada, com direção e filtro de parede (ideias 11,14,20,24)
  function respAbafada(pos, atraves, forte) {
    const A = ac(), t = A.currentTime, g = pos3(pos, 2.4, 'ent', .4);
    const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = atraves === 'porta' ? 900 : 520; lp.connect(g);
    const f = C.burst(t, .6, 'bandpass', 820, 1.6, lp); C.env(g, t, .09, (forte ? .3 : .18), .5);
    const g2 = pos3(pos, 2.4, 'ent', .2), o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(66, t); o.frequency.linearRampToValueAtTime(52, t + .55);
    const l2 = A.createBiquadFilter(); l2.type = 'lowpass'; l2.frequency.value = 200; o.connect(l2); l2.connect(g2); C.env(g2, t, .07, forte ? .14 : .09, .5); o.start(t); o.stop(t + .7);
  }

  // o ar pelos dentes, íntimo, sem posição (ideia 4)
  function dentes() {
    const A = ac(), t = A.currentTime, g = C.saida(null, .1, 'ent');
    for (const k of [0, .42]) { const f = C.burst(t + k, .36, 'bandpass', 2200, 7, g); f.frequency.linearRampToValueAtTime(3400, t + k + .32); }
    C.env(g, t, .05, .09, .9);
  }

  // leitmotif curto por entidade quando perto e não vista (ideia 26)
  function leitmotif(quem, pos, forca) {
    const A = ac(), t = A.currentTime, g = pos3(pos, 2, 'ent', .6);
    if (quem === 'inspetor') { // corda grave arranhada
      const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(82, t); o.frequency.linearRampToValueAtTime(78, t + 1.1);
      const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 220; bp.Q.value = 7; o.connect(bp); bp.connect(g); C.env(g, t, .12, .05 * forca, 1.1); o.start(t); o.stop(t + 1.3); leg('l5_leit_inspetor');
    } else if (quem === 'ana') { // caixinha desafinada
      const notas = [1320, 1570, 1240]; notas.forEach((f, i) => { const g2 = pos3(pos, 1.4, 'ent', .5); C.osc('sine', f * C.rand(.96, 1.05), t + i * .18, .4, g2); C.env(g2, t + i * .18, .003, .04 * forca, .35); }); leg('l5_leit_ana');
    } else if (quem === 'procissao') { // coral de crianças
      for (const f of [330, 392, 494]) { const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * C.rand(.99, 1.01); const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 4; o.connect(bp); bp.connect(g); o.start(t); o.stop(t + 1.2); } C.env(g, t, .3, .04 * forca, 1); leg('l5_leit_procissao');
    } else { // chamado: voz invertida (envelope crescente cortado)
      const o = A.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(240, t); o.frequency.linearRampToValueAtTime(300, t + .8); o.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05 * forca, t + .75); g.gain.setValueAtTime(.0001, t + .78); o.start(t); o.stop(t + .82); leg('l5_leit_chamado');
    }
  }

  // bengala branca batendo o chão (ideias 3,42,76,81)
  function bengala(pos, ritmo, movel) {
    const A = ac(), t = A.currentTime, g = pos3(pos, .1, 'ent', C.W.mapa === 'tuneis' ? .9 : .4);
    const o = A.createOscillator(); o.frequency.setValueAtTime(movel ? 180 : 320, t); o.frequency.exponentialRampToValueAtTime(movel ? 90 : 150, t + .09); o.connect(g); C.env(g, t, .002, movel ? .22 : .3, movel ? .14 : .09); o.start(t); o.stop(t + .2);
    const g2 = pos3(pos, .1, 'ent', .3); C.burst(t, .05, 'highpass', 2600, 1, g2); C.env(g2, t, .001, .12, .04);
    if (movel) leg('l5_bengalaMovel', pos); else leg('l5_bengala', pos);
  }

  // apito ferido depois do furto (ideias 83,84,61)
  function apitoFerido(cap) {
    const A = ac(), t = A.currentTime, g = C.saida(C.M.ativo ? { x: C.M.pos.x, y: 2.8, z: C.M.pos.z } : null, .4, 'ent');
    const s = C.ruido(), f = A.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 3; s.connect(f); f.connect(g);
    C.env(g, t, .04, .14, .5); s.start(t); s.stop(t + .6);
    const g2 = C.saida(null, .2, 'ent'), o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(880 + (cap || 0) * 52, t); o.frequency.linearRampToValueAtTime(760, t + .3); o.connect(g2); C.env(g2, t, .03, .03, .3); o.start(t); o.stop(t + .4);
    leg('l5_apitoFerido');
  }

  // =============== TICK ===============
  function tick(dt, ctx) {
    const A = ac(); if (!A) return;
    montar();
    const S = C.S, M = C.M, ANA = C.ANA, PROC = C.PROC, P = C.P, W = C.W, now = A.currentTime;
    if (!S) return;
    const jogando = ctx && ctx.jogando, est = ctx ? ctx.est : (M.ativo ? M.state : null);
    const dM = ctx ? ctx.dM : (M.ativo ? M.pos.distanceTo(P.pos) : 99);
    const dA = ctx ? ctx.dA : (ANA.ativa ? ANA.pos.distanceTo(P.pos) : 99);
    const prende = ctx && ctx.prende;
    const N = L.nodes;

    // mapa/capítulo mudou: recalibra timbres (ideias 50,68,84)
    if (W.mapa !== L.mapaPrev) { L.mapaPrev = W.mapa; L.apitoFuro = false; }
    if (S.chapter !== L.capPrev) { L.capPrev = S.chapter; }

    // ---- Infra-som no instante em que ele decide caçar (ideia 5)
    if (N && est === 'caca' && L.estPrev !== 'caca' && jogando) {
      L.infraT = .6; N.infra.gain.cancelScheduledValues(now); N.infra.gain.setValueAtTime(.0001, now); N.infra.gain.linearRampToValueAtTime(.5, now + .08); N.infra.gain.linearRampToValueAtTime(.0001, now + .55);
      try { if (!C.OPT || !C.OPT.semTremor) P.shake = Math.max(P.shake || 0, .05); } catch (e) {}
      leg('l5_infra');
    }
    L.estPrev = est;

    // ---- Zumbido grave de proximidade: ele na sala, invisível no escuro (ideia 15)
    if (N) {
      const mesmaSala = M.ativo && jogando && !S.hidden && (() => { try { return C.roomAt(M.pos.x, M.pos.z) === P.room; } catch (e) { return false; } })();
      const alvoZ = mesmaSala && dM < 9 ? .006 + .02 * C.clamp(1 - dM / 9, 0, 1) : 0;
      N.zum.gain.setTargetAtTime(alvoZ, now, .4);
      if (alvoZ > .018 && Math.random() < dt * .4) leg('l5_zumProx');
    }

    // ---- Fio de zumbido da venda quando ele vira a cara para você (ideia 23)
    if (N && M.ativo && jogando) {
      let encara = false;
      try { const ay = M.yaw || 0, dx = P.pos.x - M.pos.x, dz = P.pos.z - M.pos.z, ang = Math.atan2(dx, dz); let d2 = Math.abs(ang - ay); d2 = Math.min(d2, Math.PI * 2 - d2); encara = d2 < .5 && dM < 16; } catch (e) {}
      N.venda.gain.setTargetAtTime(encara ? .0022 : 0, now, encara ? .12 : .4);
      if (encara && !L.zumVendaOn) { L.zumVendaOn = true; leg('l5_venda'); } else if (!encara) L.zumVendaOn = false;
    }

    // ---- Respiração que vaza por porta/parede quando ele espera do outro lado (ideias 11,14,20,24)
    L.respParedeT -= dt; L.respPortaT -= dt;
    if (M.ativo && jogando && !S.hidden && dM < 6 && (est === 'procura' || est === 'emboscada' || est === 'conferir' || est === 'investiga')) {
      let mr = null; try { mr = C.roomAt(M.pos.x, M.pos.z); } catch (e) {}
      if (mr && P.room && mr !== P.room) {
        const adj = (() => { try { return C.salaAdj(mr, P.room); } catch (e) { return false; } })();
        const porPorta = (() => { try { return (W.links || []).some(l => l.door && ((l.a === mr.id && l.b === P.room.id) || (l.b === mr.id && l.a === P.room.id)) && Math.abs(l.door.ang || 0) < .2); } catch (e) { return false; } })();
        if (porPorta && L.respPortaT <= 0) { L.respPortaT = C.rand(2.2, 4); respAbafada(M.pos, 'porta', true); leg('l5_respPorta', M.pos); }
        else if (adj && L.respParedeT <= 0) { L.respParedeT = C.rand(2.6, 4.5); respAbafada(M.pos, 'parede', false); leg('l5_respParede', M.pos); }
      }
    }

    // ---- Dentes: respiração úmida colado em você escondida (ideia 4)
    L.dentesT -= dt;
    if (S.hidden && M.ativo && jogando && dM < 1.6 && !prende && L.dentesT <= 0) { L.dentesT = C.rand(2.6, 4); dentes(); leg('l5_dentes'); }

    // ---- Bengala branca: radar sonoro honesto (ideias 3,42,76,81)
    L.bengalaT -= dt;
    if (M.ativo && jogando && dM < 22 && (est === 'patrulha' || est === 'investiga' || est === 'procura' || est === 'caca')) {
      if (L.bengalaT <= 0) {
        const rapido = est === 'caca' || est === 'procura';
        L.bengalaT = (est === 'caca' ? .32 : est === 'procura' ? .5 : .9) * C.rand(.9, 1.1);
        const movel = Math.random() < .22;
        bengala(M.pos, rapido, movel);
      }
    }

    // ---- Chaves que calam = perigo: aviso grave quando o tilintar some (ideia 2,41)
    const segurandoChaves = M.ativo && (est === 'procura' || est === 'emboscada');
    if (segurandoChaves && !L.chavesIam && jogando && dM < 18) {
      L.chavesIam = true;
      const g = C.saida(null, 0, 'corpo'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.value = 30; o.connect(g); C.env(g, now, .06, .18, .8); o.start(now); o.stop(now + 1);
      leg('l5_chavesCalam');
    } else if (!segurandoChaves) L.chavesIam = false;

    // ---- Gerador/rádio abafa seus passos: aviso de furtividade (ideias 9)
    L.geradorAviso -= dt;
    try {
      const ger = C.AMB && C.AMB.ger;
      if (ger && jogando && Math.hypot(P.pos.x - ger.pos.x, P.pos.z - ger.pos.z) < 7 && P.noiseR > 2 && L.geradorAviso <= 0) { L.geradorAviso = 9; leg('l5_geradorAbafa'); }
    } catch (e) {}

    // ---- Leitmotif da ameaça mais perto e não vista (ideia 26)
    L.leitT -= dt;
    if (jogando && L.leitT <= 0 && !S.dead) {
      let quem = null, pos = null, forca = 0;
      if (M.ativo && dM < 12 && est !== 'caca') { const f = C.clamp(1 - dM / 12, 0, 1); if (f > forca) { forca = f; quem = 'inspetor'; pos = M.pos; } }
      if (ANA.ativa && !ANA.vista && dA < 12) { const f = C.clamp(1 - dA / 12, 0, 1); if (f > forca) { forca = f; quem = 'ana'; pos = ANA.pos; } }
      if (PROC.fase === 'passando' && PROC.pos) { const d = PROC.pos.distanceTo(P.pos), f = C.clamp(1 - d / 16, 0, 1); if (f > forca) { forca = f; quem = 'procissao'; pos = PROC.pos; } }
      if (quem) { L.leitT = C.rand(4.5, 7); leitmotif(quem, pos, forca); }
    }

    // ---- A Hora do Silêncio: na nona badalada tudo congela e cala (ideia 1,18)
    if (L.horaAtiva) {
      L.horaT -= dt;
      // qualquer barulho seu nesse instante é fatal: vira ruído enorme que as entidades captam
      if (jogando && P.noiseR > 1.5 && !window.__teste) { L.horaNoise += dt; if (L.horaNoise > .15) { L.horaNoise = 0; try { C.emitNoise(P.pos.x, P.pos.z, 10, true); } catch (e) {} } }
      // o coração vaza se o medo estiver alto (ideia 18)
      if (jogando && S.fear > 70 && !prende && L.horaT > 0 && Math.random() < dt * 1.2) { leg('l5_coracaoAlto'); if (M.ativo && dM < 5 && !window.__teste) try { C.emitNoise(P.pos.x, P.pos.z, 2, true); } catch (e) {} }
      if (L.horaT <= 0) L.horaAtiva = false;
    }

    // ---- Coração como bússola/segundo coração (ideias 70,80)
    if (M.ativo && jogando && dM < 3 && C.AUD && C.AUD.coracaoN > .5) {
      L.segCoracaoT -= dt;
      if (L.segCoracaoT <= 0) {
        L.segCoracaoT = 60 / (52 + 40 * C.AUD.coracaoN);
        // segundo batimento, mais grave e lento, posicionado na direção dele (bússola)
        const dir = { x: (M.pos.x - P.pos.x) / (dM || 1), z: (M.pos.z - P.pos.z) / (dM || 1) };
        const ouv = { x: C.camera.position.x + dir.x, y: C.camera.position.y, z: C.camera.position.z + dir.z };
        const g = C.saida(ouv, 0, 'corpo'); const o = A.createOscillator(); o.frequency.setValueAtTime(44, now); o.frequency.exponentialRampToValueAtTime(28, now + .18); o.connect(g); C.env(g, now, .01, .18 * C.AUD.coracaoN, .2); o.start(now); o.stop(now + .3);
        if (Math.random() < .1) leg('l5_segundoCoracao');
      }
    }

    // ---- Dueto da caixinha Cap III+ (ideia 35) e coro que vira a voz dele na Procissão (ideia 12)
    L.duetoCd -= dt;
    if (S.chapter >= 2 && ANA.ativa && M.ativo && L.duetoCd <= 0 && jogando && dA < 14 && Math.random() < dt * .5) { L.duetoCd = C.rand(7, 12); leg('l5_duetoCaixinha'); }

    // ---- O coro da Procissão mede a distância da fila (ideia 60)
    if (PROC.fase === 'passando' && PROC.pos && jogando) { L.coralT -= dt; if (L.coralT <= 0) { L.coralT = 1.5; if (est === 'caca') leg('l5_coroUnido'); else leg('l5_coral'); } }

    // ---- Anti-camping: vozes sobem onde você fica parada demais (ideia 63)
    if (jogando && !S.hidden && est !== 'caca') {
      const mov = Math.hypot(P.pos.x - L.campingX, P.pos.z - L.campingZ);
      if (mov < 1.2) L.campingAc += dt; else { L.campingAc = Math.max(0, L.campingAc - dt * 3); L.campingX = P.pos.x; L.campingZ = P.pos.z; }
      if (L.campingAc > 26 && now - L.campingAvisou > 14) {
        L.campingAvisou = now; const g = C.saida(null, .5, 'amb'); for (const f of [392, 494, 587]) { const o = A.createOscillator(); o.type = 'sine'; o.frequency.value = f * C.rand(.99, 1.01); o.connect(g); o.start(now); o.stop(now + 2.2); } C.env(g, now, .6, .05 + Math.min(.08, (L.campingAc - 26) * .01), 1.6);
        leg('l5_coroCamping');
      }
    } else { L.campingAc = Math.max(0, L.campingAc - dt * 2); L.campingX = P.pos.x; L.campingZ = P.pos.z; }

    // ---- Presságio: sussurro ao contrário 1 s antes de ele entrar na sua sala (ideia 56)
    L.presagioCd -= dt;
    if (M.ativo && jogando && !S.hidden && L.presagioCd <= 0 && dM < 7 && est !== 'patrulha') {
      let mr = null; try { mr = C.roomAt(M.pos.x, M.pos.z); } catch (e) {}
      if (mr && P.room && mr !== P.room && (() => { try { return C.salaAdj(mr, P.room); } catch (e) { return false; } })()) {
        L.presagioCd = 9; const g = C.saida(null, .7, 'amb'); const s = C.ruido(), f = A.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 5; s.connect(f); f.connect(g);
        g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(.12, now + .9); g.gain.linearRampToValueAtTime(.0001, now + 1); s.start(now); s.stop(now + 1.1); leg('l5_pressagio');
      }
    }

    // ---- Choro de menino que anda e puxa para o lado errado (ideia 54)
    L.choroT -= dt;
    if (jogando && !S.hidden && S.chapter >= 1 && L.choroT <= 0 && Math.random() < dt * .08) {
      L.choroT = C.rand(16, 30); const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * C.rand(8, 14), z: P.pos.z + Math.sin(a) * C.rand(8, 14) };
      const g = pos3(pos, 1, 'amb', .6), o = A.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(320, now); const vib = A.createOscillator(); vib.frequency.value = 6; const vg = A.createGain(); vg.gain.value = 18; vib.connect(vg); vg.connect(o.frequency);
      const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 3; o.connect(bp); bp.connect(g); C.env(g, now, .3, .06, 2.4); o.start(now); vib.start(now); o.stop(now + 2.6); vib.stop(now + 2.6);
      leg('l5_choroAnda', pos);
    }

    // ---- A Ana imita o clique da sua lanterna (ideia 67)
    L.cliqueAnaCd -= dt;
    if (ANA.ativa && !ANA.vista && jogando && !S.flashOn && L.cliqueAnaCd <= 0 && dA < 10 && Math.random() < dt * .3) {
      L.cliqueAnaCd = C.rand(6, 10); const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * 3, z: P.pos.z + Math.sin(a) * 3 };
      const g = C.saida({ x: pos.x, y: 1.2, z: pos.z }, 0, 'ent'); C.burst(now, .05, 'highpass', 3000, 1, g); C.env(g, now, .001, .2, .03);
      const g2 = C.saida({ x: pos.x, y: 1.2, z: pos.z }, 0, 'ent'); C.burst(now + .04, .03, 'bandpass', 1400, 3, g2); C.env(g2, now + .04, .001, .1, .03); leg('l5_cliqueFalso', pos);
    }

    // ---- Respiração presa nos armários vazios (ideia 69)
    L.armarioCd -= dt;
    if (jogando && !S.hidden && L.armarioCd <= 0 && Math.random() < dt * .05) {
      try {
        const arms = (W.lockers || W.armarios || []).filter(a => Math.hypot(a.x - P.pos.x, a.z - P.pos.z) < 5);
        if (arms.length) { L.armarioCd = C.rand(10, 20); const a = C.pick(arms); const g = C.saida({ x: a.x, y: 1.4, z: a.z }, .3, 'amb'); C.burst(now, .5, 'bandpass', 1300, 1.4, g); C.env(g, now, .1, .05, .5); if (Math.random() < .25) { const g2 = C.saida({ x: a.x, y: 1.4, z: a.z }, .3, 'amb'); const o = A.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(380, now + .5); o.frequency.linearRampToValueAtTime(260, now + .7); o.connect(g2); C.env(g2, now + .5, .03, .05, .3); o.start(now + .5); o.stop(now + .85); } leg('l5_armarioResp', { x: a.x, z: a.z }); }
      } catch (e) {}
    }

    // ---- Coração de criança perto do armário do castigo / nas rondas de memória (ideia 55)
    if (M.ativo && est === 'reza' && jogando && dM < 8) { L.bussolaT -= dt; if (L.bussolaT <= 0) { L.bussolaT = 60 / 96; const g = C.saida(null, 0, 'corpo'); const o = A.createOscillator(); o.frequency.setValueAtTime(90, now); o.frequency.exponentialRampToValueAtTime(60, now + .1); o.connect(g); C.env(g, now, .008, .1, .12); o.start(now); o.stop(now + .2); if (Math.random() < .06) leg('l5_coracaoCrianca'); } }

    // ---- Voz dupla na caçada: o menino chorando por baixo do chiado (ideia 28,52)
    L.vozMeninoCd -= dt;
    if (M.ativo && est === 'caca' && jogando && dM < 10 && L.vozMeninoCd <= 0 && Math.random() < dt * .4) {
      L.vozMeninoCd = C.rand(5, 9); const g = C.saida({ x: M.pos.x, y: 3, z: M.pos.z }, .4, 'ent');
      const o = A.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(520, now); const vib = A.createOscillator(); vib.frequency.value = 7; const vg = A.createGain(); vg.gain.value = 22; vib.connect(vg); vg.connect(o.frequency);
      const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 4; o.connect(bp); bp.connect(g); C.env(g, now, .15, .04, 1); o.start(now); vib.start(now); o.stop(now + 1.1); vib.stop(now + 1.1); leg('l5_vozMenino');
    }

    // ---- Som que viaja pelos canos nos túneis (ideia 72) — cue ambiental honesto
    L.canoCd -= dt;
    if (W.mapa === 'tuneis' && jogando && M.ativo && est !== 'caca' && L.canoCd <= 0 && Math.random() < dt * .15) {
      L.canoCd = C.rand(8, 16); const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * 12, z: P.pos.z + Math.sin(a) * 12 };
      const g = pos3(pos, 1, 'amb', .8); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(180, now); o.frequency.exponentialRampToValueAtTime(120, now + .3); o.connect(g); C.env(g, now, .004, .22, .4); o.start(now); o.stop(now + .5); leg('l5_cano', pos);
    }

    // ---- Respiração-régua contínua + binaural (ideias 13,62)
    if (N && N.respG) {
      let alvo = 0;
      if (M.ativo && jogando && dM < 7 && !S.hidden && est !== 'patrulha') alvo = .05 * C.clamp(1 - dM / 7, 0, 1);
      N.respG.gain.setTargetAtTime(alvo, now, .3);
      N.respF.frequency.setTargetAtTime(dM < 3 ? 1200 : 760, now, .3);
      if (N.respPan && alvo > 0) { try { const dx = M.pos.x - P.pos.x, dz = M.pos.z - P.pos.z; const fw = new THREE.Vector3(); C.camera.getWorldDirection(fw); const rt = new THREE.Vector3(fw.z, 0, -fw.x); const l = Math.hypot(dx, dz) || 1; N.respPan.pan.setTargetAtTime(C.clamp((dx / l * rt.x + dz / l * rt.z), -1, 1), now, .2); } catch (e) {} }
    }

    // ---- Silêncio-aviso quando ele entra em 'escuta': o mundo cala de repente (ideia 7)
    if (est === 'escuta' && L.escutaPrev !== 'escuta' && jogando) { try { C.SOM.silencio(.9, .1, true); } catch (e) {} }
    // ---- Silêncio total 1 s antes do bote (ideias 21,22)
    if ((est === 'alerta' || est === 'bote') && L.escutaPrev !== 'alerta' && L.escutaPrev !== 'bote' && jogando) { try { C.abafarMundo(.05, .9); } catch (e) {} }
    L.escutaPrev = est;

    // ---- Leitmotif do Chamado quando a armadilha está no ar (ideia 26 — 4ª assinatura)
    if (C.chamado && jogando && L.leitChamadoCd !== undefined) { }
    L.leitChamadoCd = (L.leitChamadoCd || 0) - dt;
    if (C.chamado && jogando && L.leitChamadoCd <= 0 && Math.random() < dt * .5) { L.leitChamadoCd = C.rand(5, 8); const a = C.rand(0, 6.28); leitmotif('chamado', { x: P.pos.x + Math.cos(a) * 6, z: P.pos.z + Math.sin(a) * 6 }, .8); }

    // ---- Eco enganoso nos túneis: um estalo-eco vem do lado oposto (ideias 29,33,43,46)
    L.ecoCd = (L.ecoCd || 0) - dt;
    if (W.mapa === 'tuneis' && M.ativo && jogando && (est === 'procura' || est === 'caca') && L.ecoCd <= 0 && Math.random() < dt * .5) {
      L.ecoCd = C.rand(3, 6); const op = { x: P.pos.x * 2 - M.pos.x, z: P.pos.z * 2 - M.pos.z };
      const g = pos3(op, 3, 'ent', .9), lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1600; lp.connect(g);
      for (let i = 0; i < 2; i++) C.burst(now + .18 + i * .08, .03, 'bandpass', 2400, 6, lp); C.env(g, now + .18, .01, .1, .3);
    }

    // ---- Nomes errados na procura: ele chama pelos nomes das crianças de 1979 (ideia 48)
    L.nomeCd = (L.nomeCd || 0) - dt;
    if (M.ativo && est === 'procura' && jogando && !S.hidden && L.nomeCd <= 0 && dM < 16 && Math.random() < dt * .25 && C.subPequeno) {
      L.nomeCd = C.rand(8, 14); const nomes = ['Rosa...', 'Luiz...', 'Sebastião...', 'Teresa...', 'Davi...', 'Lia...'];
      const certo = Math.random() < .2; try { C.subPequeno('inspetor', (certo ? 'Lia...' : C.pick(nomes.slice(0, 5))) + ' fica na cama.'); } catch (e) {}
    }

    // ---- O hino como radar na reza/cochilo: volume cai com a distância (ideia 49)
    if (M.ativo && est === 'reza' && jogando && dM < 24) { L.radarT = (L.radarT || 0) - dt; if (L.radarT <= 0) { L.radarT = 2.4; const g = pos3(M.pos, 2.6, 'ent', .5), fz = C.clamp(1 - dM / 24, 0, 1); for (const [i, f] of [[0, 293.66], [1, 349.23], [2, 440]]) { const o = A.createOscillator(); o.type = 'triangle'; o.frequency.value = f / 2; o.connect(g); o.start(now + i * .4); o.stop(now + i * .4 + .5); } C.env(g, now, .1, .03 * fz + .005, 1.3); } }

    // ---- Coração metrônomo da Ana: a batida sincroniza e acelera com a contagem (ideia 53)
    if (ANA.ativa && jogando && dA < 8 && S.fear > 60) { L.anaHbT = (L.anaHbT || 0) - dt; if (L.anaHbT <= 0) { L.anaHbT = 60 / (56 + 5 * (ANA.conta || 0)); const g = C.saida(null, 0, 'corpo'); const o = A.createOscillator(); o.frequency.setValueAtTime(56, now); o.frequency.exponentialRampToValueAtTime(34, now + .14); o.connect(g); C.env(g, now, .01, .12, .16); o.start(now); o.stop(now + .25); } }

    // ---- Respiração binaural colado atrás no escuro (ideia 13)
    L.atrasCd = (L.atrasCd || 0) - dt;
    if (M.ativo && jogando && !S.hidden && dM < 2.2 && !S.flashOn && L.atrasCd <= 0) {
      try { const dx = M.pos.x - P.pos.x, dz = M.pos.z - P.pos.z, fw = new THREE.Vector3(); C.camera.getWorldDirection(fw); fw.y = 0; fw.normalize(); const l = Math.hypot(dx, dz) || 1; if ((dx / l * fw.x + dz / l * fw.z) < 0) { L.atrasCd = C.rand(1.8, 3); respAbafada(M.pos, 'ar', true); } } catch (e) {}
    }

    // ---- A voz oscila entre homem e menino na reza (ideia 52)
    L.vozRezaCd = (L.vozRezaCd || 0) - dt;
    if (M.ativo && est === 'reza' && jogando && dM < 10 && L.vozRezaCd <= 0 && Math.random() < dt * .3) {
      L.vozRezaCd = C.rand(6, 10); const g = pos3(M.pos, 2.4, 'ent', .5), o = A.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(260, now); o.frequency.linearRampToValueAtTime(440, now + .9); const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 3; o.connect(bp); bp.connect(g); C.env(g, now, .1, .05, .9); o.start(now); o.stop(now + 1); leg('l5_vozMenino');
    }

    // ---- Gato Breu: um Chamado às vezes mia (ideia 75)
    L.miadoCd = (L.miadoCd || 0) - dt;
    if (C.chamado && jogando && L.miadoCd <= 0 && Math.random() < dt * .2) {
      L.miadoCd = C.rand(10, 18); const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * 5, z: P.pos.z + Math.sin(a) * 5 };
      const g = pos3(pos, .6, 'voz', .6), o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(520, now); o.frequency.linearRampToValueAtTime(380, now + .5); const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 4; o.connect(bp); bp.connect(g); C.env(g, now, .05, .09, .5); o.start(now); o.stop(now + .6);
    }

    // ---- O apito do lado errado, raro (ideia 36)
    L.apitoLadoCd = (L.apitoLadoCd || 0) - dt;
    if (M.ativo && est === 'caca' && jogando && L.apitoLadoCd <= 0 && Math.random() < dt * .08) {
      L.apitoLadoCd = C.rand(20, 40); const op = { x: P.pos.x * 2 - M.pos.x, z: P.pos.z * 2 - M.pos.z };
      const g = pos3(op, 2.8, 'ent', .7), o = A.createOscillator(); o.type = 'sine'; o.frequency.value = 2900; const lfo = A.createOscillator(); lfo.frequency.value = 28; const lg = A.createGain(); lg.gain.value = 120; lfo.connect(lg); lg.connect(o.frequency); o.connect(g); C.env(g, now, .01, .06, .5); o.start(now); lfo.start(now); o.stop(now + .6); lfo.stop(now + .6);
    }

    // ---- Dois chamados de lados opostos quando a armadilha persiste (ideia 59)
    if (C.chamado) L.chamadoAc = (L.chamadoAc || 0) + dt; else L.chamadoAc = 0;
    if (L.chamadoAc > 18 && (L.doisCd -= dt) <= 0) { L.doisCd = 20; doisChamados(); }

    // ---- Interfone antigo nos capítulos finais (ideia 32)
    L.interCd = (L.interCd || 0) - dt;
    if (jogando && S.chapter >= 3 && !S.hidden && est !== 'caca' && L.interCd <= 0 && Math.random() < dt * .03) {
      L.interCd = C.rand(40, 80); const a = C.rand(0, 6.28); interfone({ x: P.pos.x + Math.cos(a) * 8, z: P.pos.z + Math.sin(a) * 8 });
    }

    // ---- Apito ferido: se o apito foi furtado (flag), o assopro dele sai quebrado (ideia 83)
    if (!L.apitoFuro) { try { if (S.flags && (S.flags.apitoFurtado || S.flags.furtouApito || (S.inv && S.inv.apito))) { L.apitoFuro = true; } } catch (e) {} }

    // ---- Trilha de caça procedural por proximidade: baixo pulsante que sobe de volume/andamento (ideia 19)
    if (M.ativo && est === 'caca' && jogando) {
      L.cacaBaixoT = (L.cacaBaixoT || 0) - dt;
      if (L.cacaBaixoT <= 0) { L.cacaBaixoT = C.clamp(.35 + dM * .05, .35, 1); const g = C.saida(null, 0, 'mus'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(48, now); o.frequency.exponentialRampToValueAtTime(30, now + .25); o.connect(g); C.env(g, now, .01, .09 * C.clamp(1.2 - dM / 18, .2, 1), .28); o.start(now); o.stop(now + .4); }
    }

    // ---- Eco longo dos passos dele em salas grandes (refeitório/capela) (ideias 66,73,77)
    L.ecoSalaCd = (L.ecoSalaCd || 0) - dt;
    if (M.ativo && jogando && (est === 'caca' || est === 'procura') && L.ecoSalaCd <= 0) {
      let grande = false; try { grande = !!(P.room && (P.room.grande || /refeit|capela|nave|salao|salão|ginas/i.test(P.room.id || ''))); } catch (e) {}
      if (grande && Math.random() < dt * .6) { L.ecoSalaCd = C.rand(1, 2.2); const g = pos3(M.pos, .3, 'ent', 1), lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(g); const o = A.createOscillator(); o.frequency.setValueAtTime(66, now + .22); o.frequency.exponentialRampToValueAtTime(30, now + .5); o.connect(lp); C.env(g, now + .22, .01, .18, .5); o.start(now + .22); o.stop(now + .75); }
    }

    // ---- Sua respiração volta pelos canos nos túneis ao prender/soltar (ideia 74)
    if (W.mapa === 'tuneis' && jogando && M.ativo && dM < 10) {
      if (prende && !L.prendiaCano) { L.prendiaCano = true; }
      else if (!prende && L.prendiaCano) { L.prendiaCano = false; const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * 9, z: P.pos.z + Math.sin(a) * 9 }; const g = pos3(pos, 1, 'amb', .9); const f = C.burst(now + .15, .5, 'bandpass', 700, 2, g); f.frequency.linearRampToValueAtTime(400, now + .6); C.env(g, now + .15, .08, .07, .5); }
    }

    // ---- O coro da Procissão reza diferente por andar (ideia 58)
    if (PROC.fase === 'passando' && PROC.pos && jogando) { L.andarCd = (L.andarCd || 0) - dt; if (L.andarCd <= 0) { L.andarCd = 2; const freqs = W.mapa === 'tuneis' ? [196, 220] : W.mapa === 'superior' ? [293, 349, 440] : W.mapa === 'cemiterio' ? [293, 349, 440, 587] : [233]; const g = pos3(PROC.pos, 1.2, 'amb', W.mapa === 'tuneis' ? .9 : .5); const lp = A.createBiquadFilter(); lp.type = W.mapa === 'tuneis' ? 'lowpass' : 'bandpass'; lp.frequency.value = W.mapa === 'tuneis' ? 600 : 900; lp.Q.value = 3; lp.connect(g); for (const f of freqs) { const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f * C.rand(.99, 1.01); o.connect(lp); o.start(now); o.stop(now + 1.6); } C.env(g, now, .3, .045, 1.3); } }

    // ---- Silêncio total antes do caixão: Cap V, a procissão para perto de você (ideia 8)
    if (W.mapa === 'cemiterio' && PROC.fase === 'passando' && PROC.pos && jogando && PROC.pos.distanceTo(P.pos) < 6) {
      L.caixaoCd = (L.caixaoCd || 0) - dt; if (L.caixaoCd <= 0) { L.caixaoCd = 10; try { C.SOM.silencio(2.4, .03, true); } catch (e) {} const g = pos3(PROC.pos, 1, 'amb', .3); C.burst(now + 1.6, .25, 'bandpass', 500, 4, g); C.env(g, now + 1.6, .02, .15, .25); }
    }

    // ---- O coração desacelera e perde o compasso ao prender o ar perto dele (ideia 31)
    if (prende && M.ativo && jogando && dM < 5) { L.prendeCor = (L.prendeCor || 0) - dt; if (L.prendeCor <= 0) { L.prendeCor = 1.1; const g = C.saida(null, 0, 'corpo'); const o = A.createOscillator(); o.frequency.setValueAtTime(50, now); o.frequency.exponentialRampToValueAtTime(32, now + .16); o.connect(g); C.env(g, now, .01, .1, .2); o.start(now); o.stop(now + .3); } }

    // ---- A reza da Irmã Celeste como radar amistoso: sobe quando ele se aproxima do esconderijo (ideia 37)
    if (S.hidden && M.ativo && jogando && S.flags && S.flags.fita2 && dM < 16) { L.rezaCd = (L.rezaCd || 0) - dt; if (L.rezaCd <= 0) { L.rezaCd = 3.2; const fz = C.clamp(1 - dM / 16, 0, 1); const g = C.saida(null, .6, 'voz'); const s = C.ruido(), f = A.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = 6; s.connect(f); f.connect(g); C.env(g, now, .2, .03 + .06 * fz, 1); s.start(now); s.stop(now + 1.3); } }

    // ---- O Chamado imita o som do objetivo/mundo de uma sala errada (ideias 6,10)
    L.chamObjCd = (L.chamObjCd || 0) - dt;
    if (C.chamado && jogando && L.chamObjCd <= 0 && Math.random() < dt * .25) {
      L.chamObjCd = C.rand(10, 18); const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * 9, z: P.pos.z + Math.sin(a) * 9 }, tipo = C.pick(['gerador', 'telefone', 'fita', 'sineta']);
      const g = pos3(pos, 1, 'amb', .6);
      if (tipo === 'gerador') { const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(40, now); o.frequency.linearRampToValueAtTime(70, now + .8); const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 200; o.connect(lp); lp.connect(g); C.env(g, now, .3, .1, 1); o.start(now); o.stop(now + 1.4); }
      else if (tipo === 'telefone') { for (let i = 0; i < 4; i++) for (const f of [1100, 1400]) C.osc('square', f, now + i * .5, .25, g); C.env(g, now, .01, .08, 2); }
      else if (tipo === 'fita') { const s = C.ruido(true), f = A.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500; s.connect(f); f.connect(g); C.env(g, now, .1, .05, 1.6); s.start(now); s.stop(now + 1.8); }
      else { for (let i = 0; i < 3; i++) C.osc('sine', 1760, now + i * .4, .4, g); C.env(g, now, .01, .07, 1.3); }
    }

    // ---- Ele imita o seu passo e quebra de propósito (ideia 57)
    if (M.ativo && est === 'caca' && jogando && dM < 8 && P.noiseR > 3) { L.passoEspelhoCd = (L.passoEspelhoCd || 0) - dt; if (L.passoEspelhoCd <= 0) { L.passoEspelhoCd = C.rand(4, 7); for (let i = 0; i < 3; i++) { const t2 = now + i * .42 + (i === 2 ? .15 : 0), g = pos3(M.pos, .3, 'ent', .4); const o = A.createOscillator(); o.frequency.setValueAtTime(68, t2); o.frequency.exponentialRampToValueAtTime(32, t2 + .22); o.connect(g); C.env(g, t2, .01, .35, .25); o.start(t2); o.stop(t2 + .35); } } }

    // ---- Zumbido da venda cresce também com o medo alto
    if (N && N.venda && jogando && S.fear > 80 && M.ativo && dM < 20) N.venda.gain.setTargetAtTime(Math.max(N.venda.gain.value, .0012 * C.clamp((S.fear - 80) / 20, 0, 1)), now, .3);

    // ---- Batimento diegético: medo acima de 90 e ele a menos de 4 m faz a tela pulsar no ritmo do coração (ideia 16)
    if (jogando && S.fear > 90 && M.ativo && dM < 4 && !prende) { L.diegT = (L.diegT || 0) - dt; if (L.diegT <= 0) { L.diegT = 60 / (70 + 60 * C.clamp((S.fear - 90) / 10, 0, 1)); try { if (!C.OPT || !C.OPT.semTremor) P.shake = Math.max(P.shake || 0, .03); } catch (e) {} } }

    // ---- A cantiga sobe meio-tom quando a fúria dele cresce (ideias 47,65): um realce quando ele fica bravo
    if (M.ativo && jogando) { const fAtual = M.furia || 0; if (fAtual > (L.furiaPrev || 0) + .5 && dM < 16) { const g = pos3(M.pos, 2.8, 'ent', .5); const o = A.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(330, now); o.frequency.linearRampToValueAtTime(392, now + .4); o.connect(g); C.env(g, now, .05, .05, .4); o.start(now); o.stop(now + .5); } L.furiaPrev = fAtual; }

    // ---- A bengala vira arrastão na caçada (ideia 3)
    if (M.ativo && est === 'caca' && jogando && dM < 16) { L.arrastaoCd = (L.arrastaoCd || 0) - dt; if (L.arrastaoCd <= 0) { L.arrastaoCd = C.rand(1.4, 2.6); const g = pos3(M.pos, .1, 'ent', .6); const f = C.burst(now, .5, 'bandpass', 500, 1, g); f.frequency.linearRampToValueAtTime(1600, now + .45); C.env(g, now, .05, .14, .45); } }

    // ---- Eco do estalo também na capela/cemitério, não só nos túneis (ideias 77,73)
    L.ecoCapCd = (L.ecoCapCd || 0) - dt;
    if (W.mapa === 'cemiterio' && M.ativo && jogando && (est === 'procura' || est === 'caca') && L.ecoCapCd <= 0 && Math.random() < dt * .5) {
      L.ecoCapCd = C.rand(2.5, 5); const g = pos3(M.pos, 3, 'ent', 1), lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2000; lp.connect(g); for (let i = 0; i < 2; i++) C.burst(now + .25 + i * .18, .03, 'bandpass', 2600, 6, lp); C.env(g, now + .25, .01, .08, .5);
    }

    // ---- Silêncio súbito quando a Procissão vira na sua direção (ideia 7 estendido)
    if (PROC.fase === 'passando' && PROC.pos && jogando) { const d = PROC.pos.distanceTo(P.pos); if (d < 10 && (L.procDprev || 99) >= 10) { try { C.SOM.silencio(1, .1, true); } catch (e) {} } L.procDprev = d; } else L.procDprev = 99;

    // ---- Zumbido grave quando a Ana divide a sala, invisível no escuro (ideia 15 p/ Ana)
    if (N && N.zum && ANA.ativa && !ANA.vista && jogando && dA < 8 && (!M.ativo || dM > dA)) { const mesmaA = (() => { try { return C.roomAt(ANA.pos.x, ANA.pos.z) === P.room; } catch (e) { return false; } })(); if (mesmaA) N.zum.gain.setTargetAtTime(Math.max(N.zum.gain.value, .005 + .015 * C.clamp(1 - dA / 8, 0, 1)), now, .4); }

    // ---- "Silêncio... silêncio..." sussurrado pela fila da Procissão (ideia 12/58)
    L.shhCd = (L.shhCd || 0) - dt;
    if (PROC.fase === 'passando' && PROC.pos && jogando && L.shhCd <= 0 && Math.random() < dt * .6) {
      L.shhCd = C.rand(1.8, 3); const g = pos3(PROC.pos, 1.2, 'amb', .7); const grave = est === 'caca'; [[0, grave ? 1400 : 2600], [.5, grave ? 1100 : 1900]].forEach(([k, f]) => { const b = C.burst(now + k, .5, 'bandpass', f, 4, g); C.env(g, now + k, .09, .14, .4); });
    }

    // ---- A cantiga da caixinha vira tom menor quando ele caça ou a Ana chega (ideia 82)
    L.menorCd = (L.menorCd || 0) - dt;
    if (jogando && (est === 'caca' || (ANA.ativa && dA < 8)) && L.menorCd <= 0 && Math.random() < dt * .3) {
      L.menorCd = C.rand(6, 10); const src = est === 'caca' ? M.pos : ANA.pos, g = pos3(src, 2, 'amb', .5); for (const [i, f] of [[0, 523], [1, 622], [2, 784]]) { const o = A.createOscillator(); o.type = 'sine'; o.frequency.value = f * C.rand(.98, 1.02); o.connect(g); o.start(now + i * .22); o.stop(now + i * .22 + .5); } C.env(g, now, .05, .04, 1); // dó-mi bemol-sol: a cantiga em tom menor
    }

    // ---- O apito sobe meio-tom por capítulo e racha mais com a fúria (ideias 61,84)
    if (M.ativo && est === 'caca' && L.estPrev2 !== 'caca' && jogando) { const cap = S.chapter || 0, fur = C.clamp((M.furia || 0) / 6, 0, 1), base = 2600 * Math.pow(2, cap / 12) * (1 + .1 * fur); const g = pos3(M.pos, 2.8, 'ent', .6); const ws = A.createWaveShaper(); ws.curve = C.curvaDist(2 + 10 * fur); ws.connect(g); const o = A.createOscillator(); o.type = 'sine'; o.frequency.value = base; const lfo = A.createOscillator(); lfo.frequency.value = 28; const lg = A.createGain(); lg.gain.value = 120 + 120 * fur; lfo.connect(lg); lg.connect(o.frequency); o.connect(ws); C.env(g, now, .01, .05 + .03 * fur, .5); o.start(now); lfo.start(now); o.stop(now + .6); lfo.stop(now + .6); }
    L.estPrev2 = est;
  }

  // =============== GANCHOS PÚBLICOS ===============
  // chamado pelo motor quando a nona badalada bate (idéia 1)
  function horaDoSilencio() {
    const A = ac(); if (!A) return;
    L.horaAtiva = true; L.horaT = 3; L.horaNoise = 0;
    try { C.abafarMundo(.02, 3); } catch (e) {}
    try { C.SOM.silencio(3, .02, true); } catch (e) {}
    leg('l5_hora');
  }
  // o jogador acabou de fazer barulho: guarda para o Inspetor imitar (ideia 27,78)
  function registraRuido(x, z, r) { const A = ac(); if (!A) return; L.ultNoise = { x, z, r, t: A.currentTime }; }
  // o Inspetor, numa emboscada, imita o último barulho do jogador vindo de uma sala errada (ideia 27)
  function imitaUltimoSom() {
    const A = ac(); if (!A || !L.ultNoise || A.currentTime - L.ultNoise.t > 20) return false;
    const t = A.currentTime, a = C.rand(0, 6.28), pos = { x: C.P.pos.x + Math.cos(a) * C.rand(5, 9), z: C.P.pos.z + Math.sin(a) * C.rand(5, 9) };
    const ws = A.createWaveShaper(); ws.curve = C.curvaDist(10); const g = C.saida({ x: pos.x, y: 1.2, z: pos.z }, .6, 'ent'); ws.connect(g);
    const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(220, t); o.frequency.linearRampToValueAtTime(130, t + .3); o.connect(ws);
    const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 3; o.connect(bp); bp.connect(g); C.env(g, t, .02, .14, .4); o.start(t); o.stop(t + .5);
    leg('l5_imitaSom'); return true;
  }
  // furtou o apito: a partir daqui o assopro sai ferido (ideia 83)
  function furtouApito() { L.apitoFuro = true; apitoFerido(C.S ? C.S.chapter : 0); }
  function apitoEstaFerido() { return L.apitoFuro; }
  // dois chamados de lados opostos depois de ignorar três (ideia 59)
  function doisChamados() {
    const A = ac(); if (!A) return; const t = A.currentTime, a = C.rand(0, 6.28);
    for (const s of [0, Math.PI]) { const pos = { x: C.P.pos.x + Math.cos(a + s) * 8, z: C.P.pos.z + Math.sin(a + s) * 8 }; try { C.SOMX.vozFalsa ? null : null; } catch (e) {} const g = C.saida({ x: pos.x, y: 1.5, z: pos.z }, .8, 'voz'); const o = A.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(s ? 262 : 330, t); o.frequency.linearRampToValueAtTime(s ? 230 : 300, t + .5); const f = A.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 4; o.connect(f); f.connect(g); C.env(g, t, .08, .1, .6); o.start(t); o.stop(t + .8); }
    leg('l5_doisChamados');
  }
  // interfone/ramal toca numa sala; atender atrai, deixar tocar some (ideia 32)
  function interfone(pos) {
    const A = ac(); if (!A) return; const t = A.currentTime;
    for (let i = 0; i < 6; i++) { const g = C.saida({ x: pos.x, y: 1, z: pos.z }, .5, 'amb'); for (const f of [1200, 1500]) C.osc('square', f, t + i * .5, .3, g); C.env(g, t + i * .5, .01, .14, .28); }
    leg('l5_interfone', pos);
  }

  return { tick, horaDoSilencio, registraRuido, imitaUltimoSom, furtouApito, apitoEstaFerido, doisChamados, interfone, bengala, apitoFerido };
}
