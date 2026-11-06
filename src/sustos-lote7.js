// SUSTOS E EVENTOS — Lote 7: SOM E ATMOSFERA
// Ambiência por sala, tensão procedural, vozes, o silêncio usado como arma, clima e chuva.
// Instalado por src/sustos.js (L7 = instalarSustosL7(E, K)); ganchos: update(dt,s), aoRaio(),
// aoEsconder(L), aoSair(L), aoPasso(), morte(quem), novoMapa(id), avistamento(), golpe(quem).
// Tudo original (inspiração, não cópia); sem assets externos: som 100% procedural (WebAudio).
// Nada que puxe o jogador para a morte durante o QA automático (navigator.webdriver / __teste).

import { instalarSustosL7b } from './sustos-lote7b.js';

export function instalarSustosL7(E, K) {
  const { rand, pick, clamp, camera, W, P, M, ANA, PROC, OPT } = E;
  const S = () => E.S;
  const seguro = K.seguro, depois = K.depois, agora = K.agora, som = K.som, vacuo = K.vacuo;
  const { voz, respiracao, marcarForte, atras, fwdH, dist2, sustoCom } = K;
  const dp = (s, fn) => depois(s, seguro(fn));
  const qa = () => { try { if (window.__l7force) return false; return !!(window.__teste || navigator.webdriver); } catch (e) { return false; } };
  const AC = () => E.AC;
  const jogando = () => E.mode === 'jogo' && S() && !S().dead;
  const dM = () => M.ativo ? dist2(M.pos, P.pos) : 99;
  const dA = () => ANA.ativa ? dist2(ANA.pos, P.pos) : 99;
  const perigoAtivo = () => (M.ativo && M.state === 'caca') || PROC.fase === 'passando' || (ANA.ativa && ANA.conta >= 7);
  // Inspetor está dentro do campo de visão da câmera?
  const naFrente = (pos) => { const f = fwdH(); const dx = pos.x - P.pos.x, dz = pos.z - P.pos.z, l = Math.hypot(dx, dz) || 1; return (dx / l * f.x + dz / l * f.z) > .2; };
  const sx = (k, a) => { try { return E.SFX[k] && E.SFX[k](...(a || [])); } catch (e) {} };

  const Q = {
    orc: 2, orcT: 0,           // orçamento de estrondos (anti-fadiga)
    dirT: rand(50, 90),        // relógio do diretor de som ambiente
    nome: false,               // nome sussurrado 1x por noite
    nomeT: rand(120, 260),
    falsoT: rand(180, 340), ultFalso: -99,
    gotaT: 0, gotaInt: 1.2, gotaAtras: null, gotaSegT: 0,
    paradoT: 0, paradoUlt: { x: 0, z: 0 },
    ventoPortaT: rand(8, 16), ventoRitmo: 0,
    cigarra: null, cigAlvo: 0,
    estPrev: null, cacaPrev: false, procPrev: false,
    quaseAte: 0, surdoPassosAte: 0,
    hiddenT: 0, hiddenDobra: false, hiddenSopro: false,
    costasVozT: rand(40, 90),
    tremorT: rand(90, 160),
    janelaT: rand(20, 40),
    mapa: null, salaAmaldic: null, salaAnt: null,
    atrasT: rand(55, 95),
  };

  // --------- blocos de som crus (sempre procedural) ---------
  // estrondo seco posicional (a casa, não o Inspetor): porta de ferro / estante caindo numa sala vizinha
  function estrondo(pos, v = 1) {
    som((ac, t) => {
      const g = E.saida(pos, .7, 'susto'); E.burst(t, .9, 'lowpass', 220, 1, g, 0); E.env(g, t, .002, 1.3 * v, .8);
      const g2 = E.saida(pos, .5, 'susto'); E.burst(t, .07, 'highpass', 1700, .8, g2); E.env(g2, t, .001, .5 * v, .07);
      for (let i = 1; i < 4; i++) { const g3 = E.saida(pos, .4, 'susto'); E.burst(t + i * .06 + rand(0, .02), .05, 'bandpass', rand(1400, 2600), 6, g3); E.env(g3, t + i * .06, .002, .14 * v / i, .05); }
    });
  }
  // inchaço grave de pavor (quando o orçamento de estrondos zera): um medo silencioso, sem bang
  function pavorGrave(v = 1) {
    som((ac, t) => { const g = E.saida(null, .5, 'susto'); const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(30, t); o.frequency.exponentialRampToValueAtTime(21, t + 2.4); o.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.3 * v, t + 1.6); g.gain.exponentialRampToValueAtTime(.0001, t + 2.6); o.start(t); o.stop(t + 2.7); });
    try { if (!OPT.semTremor) P.shake = Math.max(P.shake || 0, .02); } catch (e) {}
  }
  // consome 1 do orçamento; se vazio, troca o bang pelo inchaço grave
  function bang(pos, v = 1) {
    if (Q.orc >= 1) { Q.orc -= 1; estrondo(pos, v); marcarForte(); return true; }
    pavorGrave(v); return false;
  }
  // sopro sugado ao contrário: o ar sendo puxado para um ponto, cortado seco (aviso subconsciente)
  function succao(dur = 1, aoFim) {
    som((ac, t) => {
      const g = E.saida(null, .4, 'susto'); const f = E.burst(t, dur, 'bandpass', 500, .7, g); f.frequency.exponentialRampToValueAtTime(2400, t + dur);
      const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(60, t); o.frequency.exponentialRampToValueAtTime(150, t + dur); o.connect(g);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.4, t + dur); g.gain.setValueAtTime(0, t + dur + .01); o.start(t); o.stop(t + dur + .05);
    });
    if (aoFim) dp(dur, aoFim);
  }
  // sussurro curtíssimo ao contrário, baixíssimo: premonição que recompensa a atenção
  function preEco() { som((ac, t) => { const g = E.saida(null, .3, 'voz'); const s = E.ruido(), f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(2600, t); f.frequency.linearRampToValueAtTime(1500, t + .5); f.Q.value = 5; s.connect(f); f.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.05, t + .45); g.gain.setValueAtTime(0, t + .5); s.start(t, Math.random()); s.stop(t + .55); }); }
  // estalo de língua colado ao ouvido
  function estaloColado() { const p = atras(.5); sx('estalo', [p, .9]); }
  // gota d'água única, posicional
  function gota(pos, agudo = 1) { som((ac, t) => { const g = E.saida(pos, .6, 'amb'); const o = ac.createOscillator(); const f0 = rand(950, 1500) * agudo; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * .33, t + .08); o.connect(g); E.env(g, t, .002, .06, .1); o.start(t); o.stop(t + .15); }); }
  // (M52) infra-som crescente abaixo de 35 Hz: o corpo reage antes da mente
  function infra(dur = 1.6, aoFim) { som((ac, t) => { const g = E.saida(null, 0, 'susto'); const o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(34, t); o.frequency.exponentialRampToValueAtTime(26, t + dur); o.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.5, t + dur); g.gain.setValueAtTime(0, t + dur + .01); o.start(t); o.stop(t + dur + .05); }); if (aoFim) dp(dur, aoFim); }
  // (M77/M29) "inspirar do prédio": 0,2 s de silêncio seco imediatamente antes de um susto
  function inspiraPredio(aoFim, atr = .22) { sx('silencio', [atr + .1, 0, true]); dp(atr, aoFim); }
  // estrondo com corpo: infra-som sentido no peito antes do impacto audível
  function estrondoInfra(pos, v = 1) { infra(1.3, () => bang(pos, v)); }
  // (M59) susto por sussurro (não por pico): depois do silêncio, um sussurro MUITO baixo colado ao ouvido
  function sustoSussurro() { voz(atras(.4), { f0: 230, vogais: [[500, 1800], [800, 1200]], dur: .7, vol: .05, sopro: true }); }
  // (M58/M67) o susto que não vem: luz pisca, o mundo cala — e nada acontece (recalibra o medo)
  function feint() { if (qa()) return; try { E.flash && E.flash(40); } catch (e) {} sx('silencio', [rand(1.6, 2.4), .04, true]); }
  // (M75) cantiga de ninar doce vinda de uma direção fixa (conforto que é armadilha)
  function cantiga(pos) { const notas = [523, 659, 587, 494, 523, 440]; som((ac, t) => { notas.forEach((f, i) => { const g = E.saida(pos, .7, 'amb'); const o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f * .997; o.connect(g); E.env(g, t + i * .42, .01, .04, .5); o.start(t + i * .42); o.stop(t + i * .42 + .6); }); }); }
  // (M98/M32) eco de uma gota na cisterna: a gota e, depois, o seu eco longo e grave
  function gotaCisterna(pos) { gota(pos, .6); dp(.5, () => som((ac, t) => { const g = E.saida(pos, 1, 'amb'); const o = ac.createOscillator(); o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(140, t + .6); o.connect(g); E.env(g, t, .01, .05, .7); o.start(t); o.stop(t + .8); })); }
  // (M82) revoada de asas ao abrir para fora: um leque de panners subindo
  function revoada() { for (let i = 0; i < 7; i++) { const a = (i / 7) * 6.28, p = { x: P.pos.x + Math.cos(a) * rand(2, 5), y: rand(1, 4), z: P.pos.z + Math.sin(a) * rand(2, 5) }; som((ac, t) => { const g = E.saida(p, .3, 'amb'); E.burst(t + i * .04, .12, 'bandpass', rand(500, 900), 2, g); E.env(g, t + i * .04, .01, .12, .11); }); } }
  // uivo de vento numa fresta
  function uivo(pos) { som((ac, t) => { const g = E.saida(pos, .4, 'amb'); const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(200, t); o.frequency.linearRampToValueAtTime(rand(380, 620), t + 1.3); o.frequency.linearRampToValueAtTime(240, t + 2.6); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 600; bp.Q.value = 8; o.connect(bp); bp.connect(g); E.env(g, t, .5, .12, 2.2); o.start(t); o.stop(t + 2.8); }); }
  // trovão distante só rumble (sem clarão): a tempestade rodando longe
  function trovaoRolando() { som((ac, t) => { const g = E.saida(null, .6, 'amb'); E.burst(t, 2.6, 'lowpass', 120, 1, g, 0); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.28, t + 1.1); g.gain.exponentialRampToValueAtTime(.0001, t + 2.6); }); }
  // corvo/ave da noite
  function corvo(pos) { som((ac, t) => { for (let i = 0; i < 2; i++) { const g = E.saida(pos, .3, 'amb'); const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(rand(380, 520), t + i * .3); o.frequency.linearRampToValueAtTime(rand(220, 320), t + i * .3 + .18); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 4; o.connect(bp); bp.connect(g); E.env(g, t + i * .3, .01, .12, .2); o.start(t + i * .3); o.stop(t + i * .3 + .25); } }); }
  // (M97/M94) passo molhado vindo do reflexo (poça/vidro), não da fonte real
  function passoReflexo() { const a = rand(0, 6.28), p = { x: P.pos.x + Math.cos(a) * rand(2, 4), y: .1, z: P.pos.z + Math.sin(a) * rand(2, 4) }; som((ac, t) => { const g = E.saida(p, .4, 'ent'); E.burst(t, .12, 'bandpass', 700, 1.5, g); E.env(g, t, .01, .3, .12); const g2 = E.saida(p, .3, 'ent'); E.burst(t + .08, .1, 'highpass', 2500, 1, g2); E.env(g2, t + .08, .005, .08, .09); }); E.sub && E.sub('leg', TXT.reflexo_passo_leg); }

  // --------- O SILÊNCIO COMO ARMA ---------
  // (M5/M6) corte TOTAL por ~2s (inclui o corpo da Lia), volta com um sussurro colado ao ouvido
  function silencioTotal(dur = 2, comSussurro = true) {
    if (qa()) return;
    vacuo(dur, 0);                           // master a zero: nem o coração se ouve
    marcarForte();
    if (comSussurro) dp(dur - .05, () => { const p = atras(.45); voz(p, { f0: 300, vogais: [[300, 2300], [500, 900]], dur: .5, vol: .09, sopro: true }); E.sub && E.sub('lia', TXT.silencio_volta); });
  }
  // (M3) falso silêncio: o mundo cala por um batimento como se algo viesse — e nada acontece
  function falsoSilencio() { if (qa()) return; sx('silencio', [rand(1.4, 2.6), .03, true]); }
  // (M9) clareira auditiva: logo depois de um susto, 1s de quase-nada e você decide pra onde ir no escuro
  function clareira() { sx('silencio', [1, .05, true]); }

  // --------- TEXTOS (legendas/pensamentos da Lia) ---------
  const TXT = Object.assign({
    silencio_volta: '(colado no ouvido) ...tá me ouvindo?',
    nome_sussurro: '(baixinho, do nada) ...{nome}...',
    nome_lia: '(gelada) Alguém disse o meu nome.',
    atras_leg: '[uma respiração, bem atrás de você]',
    goteira_segue: '[um pingo cai sempre três passos atrás de você]',
    nuca_leg: '[um pingo frio escorre pela sua nuca]',
    porta_vento_leg: '[uma porta solta bate ao longe]',
    janela_leg: '[a janela bate fora do compasso — e de outro lado]',
    cigarra_leg: '[os grilos calaram todos de uma vez]',
    falso_leg: '[tudo ficou quieto... e passou]',
    dobra_leg: '[uma segunda respiração, atrasada da sua]',
    sopro_esconde_leg: '[um sopro de criança, de dentro do esconderijo]',
    fresta_resp_leg: '[a respiração dele passa pela fresta da porta]',
    eco_grito_leg: '[o seu grito ainda ecoa pela ala]',
    conta_junto_lia: '(sem querer, junto com ela) ...sete... oito...',
    reza_eco_leg: '[a sua resposta volta distorcida, um tom abaixo]',
    corredor_leg: '[meia frase do hino, de cada ponta do corredor]',
    morte_eco_leg: '[o último barulho que você fez, grave e lento]',
    tremor_leg: '[um segundo coração bate num canto da sala]',
    trovao_surdo_leg: '[o trovão te deixou surda por um instante]',
    reflexo_passo_leg: '[o passo dele veio do reflexo, não dele]',
    duble_leg: '[a sua respiração, repetida na sala ao lado]',
    arranhao_leg: '[unhas raspando a parede, em algum lugar]',
    objeto_leg: '[algo caiu na sala ao lado]',
    cantiga_leg: '[uma cantiga de ninar, doce demais, chama de um canto]',
    mosca_leg: '[moscas zumbem sobre alguma coisa, logo ali]',
    gota_bote_leg: '[uma gota pinga cada vez mais rápido]',
    avist_lia: '(sem querer) ...ah!',
  }, (E.R && E.R.sustos7) || {});

  // --------- CIGARRAS / GRILOS (leito de ambiência externo, cala na ameaça) ---------
  function garantirCigarra() {
    if (Q.cigarra || !AC()) return;
    som((ac, t) => {
      const g = ac.createGain(); g.gain.value = 0;
      const s = E.ruido(true), bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 4800; bp.Q.value = 7;
      const trem = ac.createOscillator(); trem.frequency.value = 22; const tg = ac.createGain(); tg.gain.value = .5; trem.connect(tg); tg.connect(g.gain);
      const sapo = ac.createOscillator(); sapo.type = 'triangle'; sapo.frequency.value = 180; const sf = ac.createBiquadFilter(); sf.type = 'bandpass'; sf.frequency.value = 400; sf.Q.value = 6; const sg = ac.createGain(); sg.gain.value = 0;
      const sl = ac.createOscillator(); sl.frequency.value = 2.6; const slg = ac.createGain(); slg.gain.value = .5; sl.connect(slg); slg.connect(sg.gain); sapo.connect(sf); sf.connect(sg);
      s.connect(bp); bp.connect(g); sg.connect(g);
      try { g.connect(E.master); } catch (e) {} // nó próprio contínuo preso ao master (segue o corte/mono/limitador)
      s.start(t); trem.start(t); sapo.start(t); sl.start(t);
      Q.cigarra = { g, bp };
    });
  }

  // --------- GANCHOS ---------
  // (M19/M20/M57/M14) relâmpago: o pico do som bate junto com o clarão
  const aoRaio = seguro(() => {
    if (!jogando()) return;
    const fora = !!(P.room && P.room.fora);
    // (M20) silhueta sonora: no instante do clarão, um sussurro/respiração brusca de direção aleatória
    if (!OPT.vFlash && Math.random() < (fora ? .5 : .35)) {
      const a = rand(0, 6.28), p = { x: P.pos.x + Math.cos(a) * 1.6, y: 1.5, z: P.pos.z + Math.sin(a) * 1.6 };
      voz(p, { f0: 260, vogais: [[500, 900], [300, 2300]], dur: .4, vol: .08, sopro: true });
    }
    // (M57) corda arranhada curtíssima batendo com o pico (respeita "reduzir flashes")
    if (!OPT.vFlash && !OPT.sustoSuave && Math.random() < .5) som((ac, t) => { const g = E.saida(null, .5, 'susto'); const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(1600, t); o.frequency.exponentialRampToValueAtTime(900, t + .18); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 6; o.connect(bp); bp.connect(g); E.env(g, t, .002, .12, .18); o.start(t); o.stop(t + .22); });
    // (M12/M52) raríssimo: estrondo seco casado ao trovão, com infra-som no peito antes (a casa, não o Inspetor)
    if (!perigoAtivo() && Math.random() < .14) { const a = rand(0, 6.28); estrondoInfra({ x: P.pos.x + Math.cos(a) * 9, y: 2, z: P.pos.z + Math.sin(a) * 9 }, .9); }
  });

  const aoEsconder = seguro(L => {
    Q.hiddenT = 0; Q.hiddenDobra = false; Q.hiddenSopro = false;
  });
  const aoSair = seguro(L => {
    // (M28) ao escapar "por um fio", o próprio grito preso ecoa pela ala e te entrega
    if (!qa() && agora() < Q.quaseAte && M.ativo && dM() < 7) {
      const r = P.room; const p = r ? { x: (r.x0 + r.x1) / 2, y: 1.6, z: (r.z0 + r.z1) / 2 } : P.pos;
      som((ac, t) => { const g = E.saida(p, .9, 'corpo'); const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(380, t); o.frequency.exponentialRampToValueAtTime(240, t + 1.6); o.connect(g); E.env(g, t, .05, .1, 1.5); o.start(t); o.stop(t + 1.7); });
      E.sub && E.sub('lia', TXT.eco_grito_leg, true);
      dp(.3, () => E.emitNoise(P.pos.x, P.pos.z, 7, true));
      // (M49) e o ouvido fica surdo aos passos dele por alguns segundos — a fuga às cegas
      Q.surdoPassosAte = agora() + 6;
    }
  });

  const aoPasso = seguro(() => {
    // (M41/M55/M80) um passo a mais no eco: raríssimo, logo depois de você parar, um passo seu "atrasa"
    Q.paradoUlt = { x: P.pos.x, z: P.pos.z };
  });

  const avistamento = seguro(() => {
    // (M60) ao avistar o Inspetor de perto, a Lia solta um inspirar curto (e um ruído de verdade)
    if (!jogando() || qa()) return;
    sx('inspirar');
    E.sub && E.sub('lia', TXT.avist_lia);
    if (M.ativo && dM() < 9) E.emitNoise(P.pos.x, P.pos.z, 2.2, true);
  });

  const golpe = seguro(() => { clareira(); });  // (M9) clareira auditiva depois do impacto

  const morte = seguro(quem => {
    // (M88/M93) na morte, o último barulho volta grave e distorcido, com o eco da sala
    som((ac, t) => {
      const grande = W.mapa === 'tuneis' || W.mapa === 'cemiterio';
      const g = E.saida(null, grande ? 1.2 : .5, 'susto'); const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 2); o.connect(g); E.env(g, t, .01, .25, grande ? 2.6 : 1.6); o.start(t); o.stop(t + 2.8);
      // (M81) a cauda do reverb "congela": um anel grave da sala que segura e corta seco
      const g2 = E.saida(null, 1, 'susto'); E.burst(t, grande ? 3 : 1.8, 'lowpass', grande ? 500 : 900, 1, g2, 0); g2.gain.setValueAtTime(0, t); g2.gain.linearRampToValueAtTime(.18, t + .2); g2.gain.setValueAtTime(.18, t + (grande ? 2.6 : 1.5)); g2.gain.linearRampToValueAtTime(0, t + (grande ? 2.9 : 1.75));
    });
  });

  const novoMapa = seguro(id => {
    Q.mapa = id; Q.dirT = rand(40, 70); Q.gotaAtras = null; Q.amaldicFeito = false; Q.salaAnt = null; Q.procSeco = false; Q.surdoPassosAte = 0;
    // (M6/M61) escolhe uma sala "amaldiçoada" do mapa: ao entrar, a ambiência corta de uma vez
    Q.salaAmaldic = null;
    try { const dentro = (W.salas || []).filter(r => !r.fora && r.id); if (dentro.length && Math.random() < .7) Q.salaAmaldic = pick(dentro).id; } catch (e) {}
    // leito de cigarras só nos mapas externos
    if ((id === 'estrada' || id === 'cemiterio') && !qa()) garantirCigarra();
  });

  // --------- DIRETOR DE SOM AMBIENTE (um evento por vez, com cooldown longo) ---------
  const perto = m => { const a = rand(0, 6.28); return { x: P.pos.x + Math.cos(a) * m, y: 1.5, z: P.pos.z + Math.sin(a) * m }; };
  // Catálogo de vinhetas de som ambiente (uma por vez, cooldown longo). Cada entrada é um som distinto.
  const VINHETAS = [
    { id: 'moscas', fn: () => moscas() },                                                   // zumbido sobre o coberto/cova/altar
    { id: 'porta_fantasma', fn: () => { const p = perto(3); sx('portaLonge', [p]); E.sub && E.sub('leg', TXT.porta_vento_leg); } }, // porta que bate onde não há porta
    { id: 'estrondo_distante', so: 'dentro', fn: () => { preEco(); dp(1.9, () => { if (jogando() && !perigoAtivo()) bang(perto(12), .7); }); } }, // premonição invertida e, depois, o estrondo sem ameaça
    { id: 'passo_eco', fn: () => passoEco() },                                               // um passo a mais no eco
    { id: 'duble_resp', fn: () => { const p = perto(7); respiracao({ x: p.x, y: 1.4, z: p.z }, 2, false, .4); E.sub && E.sub('leg', TXT.duble_leg); } }, // dublê da sua respiração
    { id: 'arranhao_parede', so: 'dentro', fn: () => { K.arranhao(perto(5), 1); E.sub && E.sub('leg', TXT.arranhao_leg); } }, // arranhão na parede ao longe
    { id: 'metal_balanca', so: 'dentro', fn: () => { sx('metal', [.6]); } },                 // metal/cabide balançando
    { id: 'sussurro_dir', fn: () => { voz(perto(2.4), { f0: 260, vogais: [[500, 1800], [300, 2300]], dur: .5, vol: .06, sopro: true }); } }, // sussurro curto de uma direção
    { id: 'objeto_cai', so: 'dentro', fn: () => { const p = perto(6); sx('vidro', [p.x, p.z]); E.sub && E.sub('leg', TXT.objeto_leg); } }, // isca sonora: objeto que cai numa sala vizinha
    { id: 'predio_assenta', so: 'dentro', fn: () => sx('predio') },                          // o prédio assentando (rangido/estalo)
    { id: 'mosquito', fn: () => { const f = fwdH(), lado = pick([-1, 1]); const p = { x: P.pos.x + f.z * lado * .6, y: 1.5, z: P.pos.z - f.x * lado * .6 }; som((ac, t) => { const g = E.saida(p, 0, 'amb'); const o = ac.createOscillator(); o.frequency.value = rand(5200, 6400); o.connect(g); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.012, t + .4); g.gain.linearRampToValueAtTime(0, t + 1.4); o.start(t); o.stop(t + 1.5); }); } }, // mosquito num ouvido só
    { id: 'sino_unico', so: 'fora', fn: () => sx('sinoLonge') },                             // um sino distante único
    { id: 'estalo_colado', fn: () => estaloColado() },                                       // estalo de língua colado ao ouvido
    { id: 'resp_sala', so: 'dentro', fn: () => { const p = perto(5); respiracao({ x: p.x, y: 1.5, z: p.z }, 2.4, true, .4); } }, // respiração presa numa sala vizinha
    { id: 'uivo', so: 'fora', fn: () => uivo(perto(10)) },                                    // uivo de vento forte
    { id: 'trovao_rolando', so: 'fora', fn: () => trovaoRolando() },                          // trovão distante rolando sem clarão
    { id: 'corvo', so: 'fora', fn: () => corvo(perto(12)) },                                  // corvo grasnando na noite
    { id: 'portao_vento', so: 'fora', fn: () => sx('portaoVento') },                          // portão rangendo ao vento
    { id: 'revoada', so: 'fora', fn: () => revoada() },                                        // revoada de asas
    { id: 'cano', so: 'tuneis', fn: () => sx('cano', [perto(8)]) },                            // água batendo num cano ao longe
    { id: 'gota_cisterna', so: 'tuneis', fn: () => gotaCisterna(perto(6)) },                   // eco de uma gota na cisterna
    { id: 'reflexo_passo', so: 'tuneis', fn: () => passoReflexo() },                           // passo molhado do reflexo
    { id: 'cantiga', so: 'dentro', fn: () => { if (M.ativo) { const dx = M.pos.x - P.pos.x, dz = M.pos.z - P.pos.z, l = Math.hypot(dx, dz) || 1; cantiga({ x: P.pos.x + dx / l * 6, y: 1.4, z: P.pos.z + dz / l * 6 }); } else cantiga(perto(6)); E.sub && E.sub('leg', TXT.cantiga_leg); } }, // cantiga de ninar que puxa
    { id: 'passos_molhados', so: 'tuneis', fn: () => { const f = fwdH(); for (let i = 0; i < 3; i++) dp(i * .4, () => K.passoPos({ x: P.pos.x - f.x * 3, y: .1, z: P.pos.z - f.z * 3 }, .4)); } }, // passos molhados três metros atrás
    { id: 'capela_fresta', so: 'cemiterio', fn: () => uivo(perto(8)) },                        // vento nas frestas da capela
    { id: 'terra', so: 'cemiterio', fn: () => sx('cavar') },                                   // terra sendo mexida ao longe
    { id: 'molas_cama', so: 'superior', fn: () => { sx('rangido', [perto(5).x, 1, perto(5).z, .4, 'amb']); } }, // molas de uma cama rangendo
    { id: 'telhado_chuva', so: 'superior', fn: () => som((ac, t) => { const g = E.saida(null, .3, 'amb'); const s = E.ruido(); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = .8; s.connect(bp); bp.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .8); g.gain.exponentialRampToValueAtTime(.0001, t + 3); s.start(t, Math.random()); s.stop(t + 3.1); }) }, // rajada de chuva no telhado
    { id: 'susto_duplo', so: 'dentro', fn: () => { sx('impacto', [.4]); dp(2, () => { if (jogando() && !perigoAtivo()) { const p = perto(8); inspiraPredio(() => bang(p, .9)); } }); } }, // susto fraco e, quando você relaxa, o prédio inspira e vem o forte
    { id: 'susto_sussurro', fn: () => { sx('silencio', [1.2, .04, true]); dp(1.1, () => sustoSussurro()); } }, // susto por sussurro, não por pico
  ];
  function dirSom() {
    const s = S(); if (!s || perigoAtivo() || PROC.fase) return;
    const fora = !!(P.room && P.room.fora), mapa = W.mapa;
    const ok = VINHETAS.filter(v => { if (v.so === 'fora') return fora; if (v.so === 'dentro') return !fora; if (v.so) return v.so === mapa; return true; });
    if (ok.length) seguro(pick(ok).fn)();
  }
  // (M38) moscas
  function moscas() {
    const a = rand(0, 6.28), p = { x: P.pos.x + Math.cos(a) * rand(3, 6), y: .6, z: P.pos.z + Math.sin(a) * rand(3, 6) };
    som((ac, t) => { const g = E.saida(p, .3, 'amb'); const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 150; const lfo = ac.createOscillator(); lfo.frequency.value = 7; const lg = ac.createGain(); lg.gain.value = 40; lfo.connect(lg); lg.connect(o.frequency); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 2; o.connect(bp); bp.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + 1.2); g.gain.exponentialRampToValueAtTime(.0001, t + 3.2); o.start(t); lfo.start(t); o.stop(t + 3.3); lfo.stop(t + 3.3); });
    E.sub && E.sub('leg', TXT.mosca_leg);
  }
  // (M35/M46) passo-eco e chamada-resposta
  function passoEco() {
    const f = fwdH(), p = { x: P.pos.x - f.x * 1.4, y: .3, z: P.pos.z - f.z * 1.4 };
    som((ac, t) => { const g = E.saida(p, .5, 'ent'); const o = ac.createOscillator(); o.frequency.setValueAtTime(62, t); o.frequency.exponentialRampToValueAtTime(30, t + .25); o.connect(g); E.env(g, t, .01, .5, .3); o.start(t); o.stop(t + .4); });
    E.sub && E.sub('leg', TXT.atras_leg);
  }

  // --------- UPDATE PRINCIPAL ---------
  const update = seguro((dt, s) => {
    if (!s || s.dead || !P.room) return;
    const t = agora(), fora = !!P.room.fora, subsolo = W.mapa === 'tuneis';
    // recarga do orçamento de estrondos (nunca dois perto um do outro; teto 2)
    Q.orcT += dt; if (Q.orcT > 42 && Q.orc < 2) { Q.orcT = 0; Q.orc++; }

    // --- cigarras: o canto da noite cala de repente quando o perigo chega (aviso do instinto)
    if (Q.cigarra) {
      const quer = fora && !perigoAtivo() && !(M.ativo && dM() < 14) ? 1 : 0;
      if (quer !== Q.cigAlvo) { Q.cigAlvo = quer; try { Q.cigarra.g.gain.setTargetAtTime(quer ? .02 : 0, AC().currentTime, quer ? 1.2 : .12); } catch (e) {} if (!quer && fora) E.sub && E.sub('leg', TXT.cigarra_leg); }
    }

    // --- pingo-metrônomo: salas com água/túneis têm um pingo em ritmo fixo; para no silêncio/Hora
    const temGoteira = subsolo || (P.room && P.room.agua);
    if (temGoteira && !perigoAtivo() && !s.flags.sino) {
      Q.gotaT += dt;
      if (Q.gotaT >= Q.gotaInt) { Q.gotaT = 0; Q.gotaInt = subsolo ? 1.15 : 1.6; const a = rand(0, 6.28); gota({ x: P.pos.x + Math.cos(a) * rand(2, 5), y: 2, z: P.pos.z + Math.sin(a) * rand(2, 5) }, subsolo ? .7 : 1); }
    }
    // --- (M51) no subsolo, uma goteira que te SEGUE ~3m atrás (soa como passo molhado perseguindo)
    if (subsolo && !perigoAtivo()) {
      Q.gotaSegT += dt;
      if (Q.gotaSegT >= rand(1.3, 2.1)) { Q.gotaSegT = 0; const f = fwdH(); gota({ x: P.pos.x - f.x * 3, y: .1, z: P.pos.z - f.z * 3 }, .6); }
    }

    // --- (M85) pingo frio na nuca: parada embaixo de goteira num momento de calma
    if (temGoteira && !perigoAtivo()) {
      const mexeu = Math.hypot(P.pos.x - Q.paradoUlt.x, P.pos.z - Q.paradoUlt.z) > .4;
      Q.paradoUlt = { x: P.pos.x, z: P.pos.z };
      if (mexeu) Q.paradoT = 0; else Q.paradoT += dt;
      if (Q.paradoT > rand(10, 16)) { Q.paradoT = -rand(14, 24); gota(atras(.3), .5); try { if (!OPT.semTremor) P.shake = Math.max(P.shake || 0, .02); } catch (e) {} E.sub && E.sub('leg', TXT.nuca_leg); }
    } else Q.paradoT = 0;

    // --- portas soltas no vento ao longe (falsos alertas de passo); uma fora de ritmo = ele
    if (fora || W.mapa === 'superior') {
      Q.ventoPortaT -= dt;
      if (Q.ventoPortaT <= 0) {
        Q.ventoPortaT = rand(4, 8);
        const noRitmo = Math.random() < .7;
        if (noRitmo) { const a = rand(0, 6.28); sx('portaLonge', [{ x: P.pos.x + Math.cos(a) * 16, z: P.pos.z + Math.sin(a) * 16 }]); }
        else if (M.ativo) { const dx = M.pos.x - P.pos.x, dz = M.pos.z - P.pos.z, l = Math.hypot(dx, dz) || 1; sx('portaLonge', [{ x: P.pos.x + dx / l * 12, z: P.pos.z + dz / l * 12 }]); E.sub && E.sub('leg', TXT.janela_leg); }
      }
    }

    // --- O SILÊNCIO como arma: o Inspetor prestes a desistir OU prestes a achar → 2s ambíguos
    const est = M.ativo ? M.state : null;
    if (est !== Q.estPrev) {
      if (!qa() && jogando()) {
        if ((Q.estPrev === 'procura' && est === 'patrulha' && dM() < 26) || (est === 'caca' && Q.estPrev !== 'caca' && dM() < 10)) { if (t > Q.ultFalso + 30) { Q.ultFalso = t; silencioTotal(1.8, false); } }
      }
      Q.estPrev = est;
    }
    // marca a janela de "por um fio" (perto e caçando): o escape custa o eco do grito
    if (M.ativo && est === 'caca' && dM() < 3.5) Q.quaseAte = t + 2.5;

    // --- (M11) vácuo pré-bote com uma gota que acelera, colada no coração
    const bote = est === 'alerta' || est === 'bote';
    if (bote && jogando() && !qa() && !Q.boteGota) {
      Q.boteGota = true; E.sub && E.sub('leg', TXT.gota_bote_leg);
      let i = 0; const toca = () => { if (!(M.state === 'alerta' || M.state === 'bote') || !jogando()) { Q.boteGota = false; return; } gota(atras(.4), 1); i++; dp(Math.max(.12, .5 - i * .06), toca); }; toca();
    } else if (!bote) Q.boteGota = false;

    // --- (M62) trovão que ensurdece: um estrondo muito perto deixa zumbido e abafa o mundo
    if (fora && !subsolo && !perigoAtivo()) {
      Q.tremorT -= dt;
      if (Q.tremorT <= 0) { Q.tremorT = rand(50, 95); if (!OPT.semZumbido && Math.random() < .4) { sx('zumbidoOuvido', [.8]); E.sub && E.sub('leg', TXT.trovao_surdo_leg); } }
    }

    // --- (M13/M94 interno) o coração que não é seu: um segundo batimento num canto parado
    if (!fora && !perigoAtivo() && jogando()) {
      Q.costasVozT -= dt;
      if (Q.costasVozT <= 0) {
        Q.costasVozT = rand(70, 130);
        if (!qa() && Math.random() < .6) { const a = rand(0, 6.28), p = { x: P.pos.x + Math.cos(a) * 4, y: 1, z: P.pos.z + Math.sin(a) * 4 }; som((ac, tt) => { for (const k of [0, .17]) { const g = E.saida(p, .4, 'amb'); const o = ac.createOscillator(); o.frequency.setValueAtTime(52, tt + k); o.frequency.exponentialRampToValueAtTime(34, tt + k + .14); o.connect(g); E.env(g, tt + k, .01, k ? .18 : .26, .16); o.start(tt + k); o.stop(tt + k + .25); } }); E.sub && E.sub('leg', TXT.tremor_leg); }
      }
    }

    // --- nome sussurrado 1x por noite, bem colado, baixíssimo
    if (!Q.nome && jogando() && !qa()) { Q.nomeT -= dt; if (Q.nomeT <= 0 && !perigoAtivo()) { Q.nome = true; sussurrarNome(); } }

    // --- diretor de som ambiente (anti-fadiga: cooldown longo, nunca em perigo)
    if (jogando()) { Q.dirT -= dt; if (Q.dirT <= 0) { Q.dirT = rand(70, 120); if (!qa() && !perigoAtivo() && !PROC.fase && !(M.ativo && dM() < 16)) dirSom(); } }

    // --- falso silêncio raro (isca de desconfiança): calmaria, nunca em caça
    if (jogando() && !qa() && s.fear < 45 && !M.ativo && !PROC.fase && !ANA.ativa) { Q.falsoT -= dt; if (Q.falsoT <= 0) { Q.falsoT = rand(220, 420); falsoSilencio(); E.sub && E.sub('leg', TXT.falso_leg); } }

    // --- (M26) respiração dobrada no esconderijo: depois de ~20s surge uma 2ª respiração atrasada
    if (s.hidden) {
      Q.hiddenT += dt;
      if (!Q.hiddenDobra && Q.hiddenT > 20 && !qa()) { Q.hiddenDobra = true; const f = fwdH(); respiracao({ x: P.pos.x - f.x * .5, y: 1.4, z: P.pos.z - f.z * .5 }, 3, false, .35); E.sub && E.sub('leg', TXT.dobra_leg); }
      // (M4) um sopro infantil de DENTRO do esconderijo, 1x por esconde, sem dano
      if (!Q.hiddenSopro && Q.hiddenT > rand(6, 12) && !qa() && Math.random() < .5) { Q.hiddenSopro = true; voz(atras(.3), { f0: 300, vogais: [[500, 1800], [300, 2300]], dur: .6, vol: .07, sopro: true }); E.sub && E.sub('leg', TXT.sopro_esconde_leg); }
      // (M21) com o Inspetor do lado de fora, a respiração dele passa pela fresta (abafada, apontada)
      if (M.ativo && dM() < 3 && Math.random() < dt * .4) { const dx = M.pos.x - P.pos.x, dz = M.pos.z - P.pos.z, l = Math.hypot(dx, dz) || 1; respiracao({ x: P.pos.x + dx / l * .6, y: 1.2, z: P.pos.z + dz / l * .6 }, 1.6, true, .5); E.sub && E.sub('leg', TXT.fresta_resp_leg); }
    } else Q.hiddenT = 0;

    // --- (M15) a Lia conta junto com a Ana sem querer (medo altíssimo), fazendo barulho de verdade
    if (ANA.ativa && ANA.conta >= 6 && dA() < 10 && s.fear > 80 && !s.hidden && !qa() && Math.random() < dt * .5) {
      voz(atras(.2), { f0: 250, vogais: [[500, 1800], [800, 1200]], dur: .4, vol: .05, sopro: true });
      E.emitNoise(P.pos.x, P.pos.z, 1.4, true);
      E.sub && E.sub('lia', TXT.conta_junto_lia);
    }

    // --- (M42) "atrás de você": o sussurro só dispara quando o Inspetor está fora do campo de visão
    if (M.ativo && est !== 'caca' && dM() < 9 && !naFrente(M.pos) && !s.hidden) {
      Q.atrasT -= dt;
      if (Q.atrasT <= 0 && !qa()) { Q.atrasT = rand(40, 80); const dx = M.pos.x - P.pos.x, dz = M.pos.z - P.pos.z, l = Math.hypot(dx, dz) || 1; voz({ x: P.pos.x + dx / l * 1.2, y: 1.5, z: P.pos.z + dz / l * 1.2 }, { f0: 220, vogais: [[500, 900], [300, 2300]], dur: .5, vol: .06, sopro: true }); E.sub && E.sub('leg', TXT.atras_leg); }
    } else if (est === 'caca') Q.atrasT = Math.min(Q.atrasT, 12);

    // --- (M6/M8/M61) ao ENTRAR na sala amaldiçoada do mapa, a ambiência é sugada e cai num buraco de som
    if (P.room !== Q.salaAnt) {
      Q.salaAnt = P.room;
      if (P.room && P.room.id && P.room.id === Q.salaAmaldic && !Q.amaldicFeito && !qa() && !perigoAtivo()) { Q.amaldicFeito = true; succao(.9, () => silencioTotal(2.2, true)); }
    }

    // --- (M40) ar endurece antes da Procissão: no aviso, o eco colapsa para seco de repente
    if (PROC.fase === 'aviso' && !Q.procSeco) { Q.procSeco = true; sx('silencio', [2.2, .06, true]); }
    else if (!PROC.fase && Q.procSeco) Q.procSeco = false;

    // --- (M84) vozes de criança nos corredores que calam com a lanterna
    if (!fora && jogando() && !s.hidden && !perigoAtivo()) {
      Q.criancaT = (Q.criancaT || rand(30, 60)) - dt;
      if (Q.criancaT <= 0) { Q.criancaT = rand(35, 70); if (!qa() && !s.flashOn && Math.random() < .5) { const p = perto(5); voz({ x: p.x, y: 1, z: p.z }, { f0: 500, vogais: [[500, 1800], [300, 2300]], dur: .5, vol: .05, sopro: true }); E.sub && E.sub('leg', TXT.crianca_corredor_leg); } }
    }

    // --- (M24/M58) o susto que não vem: muitos indícios e, de vez em quando, NADA (recalibra o medo)
    if (jogando() && !qa() && s.fear < 50 && !M.ativo && !PROC.fase && !ANA.ativa) { Q.feintT = (Q.feintT || rand(150, 300)) - dt; if (Q.feintT <= 0) { Q.feintT = rand(200, 360); feint(); } }

    // --- (M49) depois de um quase-acerto, o zumbido mascara justamente os passos dele por alguns segundos
    if (t < Q.surdoPassosAte && !OPT.semZumbido) { Q.surdoTick = (Q.surdoTick || 0) - dt; if (Q.surdoTick <= 0) { Q.surdoTick = 1.8; sx('zumbidoOuvido', [.5]); } }
  });

  function sussurrarNome() {
    let nome = 'Lia';
    try { nome = (JSON.parse(localStorage.getItem('hora-silencio-nome') || '""') || '').trim() || 'Lia'; } catch (e) {}
    const sils = (nome.toLowerCase().match(/[aeiou]+/g) || ['a']).slice(0, 3);
    const p = atras(.4);
    sils.forEach((v, i) => dp(i * .22, () => voz(p, { f0: 250, vogais: [[VOG(v)[0], VOG(v)[1]], [VOG(v)[0], VOG(v)[1]]], dur: .22, vol: .055, sopro: true })));
    dp(1.2, () => E.sub && E.sub('lia', TXT.nome_lia));
  }
  const VOGAIS = { a: [800, 1200], e: [500, 1800], i: [300, 2300], o: [500, 900], u: [320, 800] };
  const VOG = v => VOGAIS[v[0]] || VOGAIS.a;

  // chamado: eco distorcido quando respondem (gancho leve chamado por sustos.js se quiser)
  const ecoResposta = seguro(() => { if (qa()) return; const a = rand(0, 6.28), p = { x: P.pos.x + Math.cos(a) * 6, y: 1.4, z: P.pos.z + Math.sin(a) * 6 }; dp(.8, () => { voz(p, { f0: 200, vogais: [[300, 2300], [500, 900]], dur: .7, vol: .08, cai: .85 }); E.sub && E.sub('leg', TXT.reza_eco_leg); }); });

  // Parte B: eventos roteirizados do diretor próprio (src/sustos-lote7b.js)
  const LB = instalarSustosL7b(E, K, { qa, jogando, perigoAtivo, dM, dp, sx, perto, succao });
  const juntar = (a, b) => (...x) => { try { a(...x); } catch (e) { console.warn('[sustos7]', e && e.message); } return b(...x); };
  return { update: juntar(update, LB.update), aoRaio: juntar(aoRaio, LB.aoRaio), aoEsconder: juntar(aoEsconder, LB.aoEsconder), aoSair, aoPasso: juntar(aoPasso, LB.aoPasso), morte: juntar(morte, LB.morte), novoMapa: juntar(novoMapa, LB.novoMapa), avistamento: juntar(avistamento, LB.avistamento), golpe, ecoResposta, silencioTotal, eventos: LB.eventos, vinhetas: VINHETAS, _Q: Q, _B: LB._B };
}
