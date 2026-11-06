// A HORA DO SILÊNCIO — Lote 7 (Jogabilidade): SOM E ATMOSFERA pela pele da Lia.
// O silêncio vira arma; o barulho do mundo vira cobertura; prender o ar vira uma bolha aflita.
// Módulo novo, ligado ao motor por poucos ganchos (procure "JGS" em jogo.js):
//   JGS.update(dt)   — um passo por quadro, dentro do bloco jogável
//   JGS.tecla(e)     — tecla N: fechar os olhos para ouvir (e encostar o ouvido na parede)
//   JGS.mascara(x,z) — multiplicador que entra em mascaraSom(): trovão, gerador, compasso quebrado, vácuo da garrafa
//   JGS.passoK()     — multiplicador do P.noiseR: tapete abafa, ritmo da chuva
//   JGS.corte()      — teto de frequência extra (surdez tática ao prender o ar / olhos fechados)
//   JGS.mundoK()     — ganho extra do mundo (a bolha de silêncio do fôlego preso e dos olhos fechados)
//   JGS.vacuo()      — nível de vácuo extra (o poço de silêncio depois da distração)
// Opções novas em OPT (prefixo s7): nervos, olhos, soPerigo, surdo. Tudo à prova de erro.

import { criarAtmosfera } from './jogabilidade-atmosfera.js';

export function criarJogabilidadeSom(ctx) {
  const { THREE, P, keys, camera, OPT, SFX, emitNoise, marcarCausa, toast, sub, subPequeno, conquista,
          audio, abafarMundo, aplicarVolumes } = ctx;
  const g = ctx; // getters: S, M, ANA, PROC, W, AC, perf, mode, ui, AUD, AMB, BUS, master
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

  // estado interno do módulo
  const st = {
    preseT: 0, prendiaAnt: false, zumO: null, zumG: null, zumAte: 0,
    pisadaAgua: false, aguaMolhadaT: 0, pingoT: 0,
    quietoT: 0, perdidaT: 0, perdidaAvisou: false,
    distracaoAte: 0, nervosFeito: false, nervosAte: 0, nervosFase: 0,
    olhos: false, olhosK: 0, overlay: null, olhosAviso: false,
    denteT: 0, tremAviso: false,
    compassoBuf: [], compassoAte: 0,
    pisoTapeteAviso: false, trovaoAviso: false, geradorAviso: false, aguaAviso: false,
    distanteAte: 0, distanteFonte: null,
    ribomboT: 0, calmaResp: 0, calmaFase: 0, calmaAviso: false,
    boteVacAte: 0, flashAnaAte: 0,
    barra: null, barraDot: null,
    modosAplicados: '', estErroAud: false,
    chuvaFase: 0, passoRitmoBom: true,
    portaOuvT: 0, engoleT: 3, assobioT: 0, cmHold: 0, olhosT: 0, olhosDesc: 0,
  };
  const ATM = criarAtmosfera(ctx); // parte 2: chuva em ondas, goteiras, reza, palma, pedrinhas, sapatos molhados, a casa que pressiona

  // --- opções novas, com padrões (uma vez)
  for (const [k, v] of Object.entries({ s7nervos: true, s7olhos: true, s7soPerigo: false, s7surdo: false }))
    if (OPT[k] === undefined) OPT[k] = v;

  // --- helpers de áudio procedural seguro
  function ac() { return g.AC; }
  function pos3(x, z, y = 1.4) { return { x, y, z }; }
  // tom agudo crescente do fôlego preso demais (desconforto que empurra a soltar)
  function zumbidoLigar() {
    const AC = ac(); if (!AC || st.zumO || OPT.semZumbido) return;
    try {
      const o = AC.createOscillator(), gg = AC.createGain(); o.type = 'sine'; o.frequency.value = 2400;
      gg.gain.value = 0.00001; o.connect(gg); gg.connect(g.master || AC.destination); o.start();
      st.zumO = o; st.zumG = gg;
    } catch (e) {}
  }
  function zumbidoNivel(n, f) {
    if (!st.zumG) return; const AC = ac(); if (!AC) return;
    try { st.zumG.gain.setTargetAtTime(Math.max(0.00001, n), AC.currentTime, 0.1); st.zumO.frequency.setTargetAtTime(f, AC.currentTime, 0.2); } catch (e) {}
  }
  function zumbidoDesligar() {
    if (!st.zumO) return; const AC = ac();
    try { st.zumG.gain.setTargetAtTime(0.00001, AC.currentTime, 0.08); const o = st.zumO; setTimeout(() => { try { o.stop(); o.disconnect(); } catch (e) {} }, 300); } catch (e) {}
    st.zumO = null; st.zumG = null;
  }
  // sting curto de corda (quando a poça te denuncia perto do monstro)
  function stingCorda() {
    const AC = ac(); if (!AC || !audio) return;
    try {
      const t = AC.currentTime, gg = audio.saida(null, 0.35, 'susto');
      const o = audio.osc('sawtooth', 220, t, 0.5, gg); o.frequency.exponentialRampToValueAtTime(140, t + 0.45);
      audio.env(gg, t, 0.004, 0.22, 0.4);
    } catch (e) {}
  }
  // ribombo grave dos passos sentido pelo chão (agachada e parada)
  const _g7 = {};
  function pode7(k, ms) { const n = performance.now(); if (n - (_g7[k] || 0) < ms) return false; _g7[k] = n; return true; }
  function ribombo(x, z) {
    const AC = ac(); if (!AC || !audio || !pode7('ribombo', 250)) return;
    try {
      const t = AC.currentTime, gg = audio.saida(pos3(x, z, 0.1), 0.2, 'sfx');
      const o = audio.osc('sine', 46, t, 0.3, gg);
      audio.env(gg, t, 0.01, 0.06, 0.28);
    } catch (e) {}
  }
  // bater dos dentes: micro-ruído rítmico e seco
  function dente(x, z) {
    const AC = ac(); if (!AC || !audio || !pode7('dente', 150)) return;
    try { const t = AC.currentTime, gg = audio.saida(pos3(x, z), 0.15, 'corpo'); audio.burst(t, 0.03, 'bandpass', 2600, 6, gg); audio.env(gg, t, 0.002, 0.03, 0.04); } catch (e) {}
  }
  // "ufa" curto da Lia ao acalmar o coração no ritmo
  function ufa() {
    const AC = ac(); if (!AC || !audio) return;
    try { const t = AC.currentTime, gg = audio.saida(null, 0.1, 'corpo'); audio.burst(t, 0.35, 'lowpass', 700, 0.8, gg); audio.env(gg, t, 0.05, 0.02, 0.4); } catch (e) {}
  }

  // --- overlay de "fechar os olhos" e barra da respiração (DOM próprio, sem mexer no HUD alheio)
  function garantirDom() {
    if (st.overlay) return;
    try {
      const o = document.createElement('div');
      o.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:70;transition:opacity .12s';
      document.body.appendChild(o); st.overlay = o;
      const b = document.createElement('div');
      b.style.cssText = 'position:fixed;left:50%;bottom:7%;transform:translateX(-50%);width:120px;height:3px;background:rgba(255,255,255,.08);border-radius:3px;opacity:0;pointer-events:none;z-index:46;transition:opacity .25s';
      const d = document.createElement('div');
      d.style.cssText = 'position:absolute;top:-2px;width:7px;height:7px;border-radius:50%;background:rgba(220,220,230,.6);left:0;transform:translateX(-50%)';
      b.appendChild(d); document.body.appendChild(b); st.barra = b; st.barraDot = d;
    } catch (e) {}
  }

  function jogando() { return g.mode === 'jogo' && !g.ui && g.S && !g.S.dead && !g.S.fim; }
  function ameaca() {
    const M = g.M, ANA = g.ANA, PROC = g.PROC;
    return !!((M && M.ativo && ['caca', 'alerta', 'bote', 'agarra', 'procura', 'investiga', 'fareja', 'vasculha'].includes(M.state)) || (ANA && ANA.ativa) || (PROC && PROC.fase));
  }
  function distM() { const M = g.M; return M && M.ativo ? dist(M.pos.x, M.pos.z, P.pos.x, P.pos.z) : 99; }

  // --- tecla N: fechar os olhos para ouvir
  function tecla(e) {
    if (e.code === 'Comma' && jogando()) return true; // vírgula: segurar fecha os olhos, tocar bate palma (o N já é "andar sozinha" da plataforma)
    return ATM.tecla(e);
  }

  // ==================================================================
  function update(dt) {
    const S = g.S, M = g.M, AUD = g.AUD, AMB = g.AMB, BUS = g.BUS, perf = g.perf, AC = g.AC;
    if (!S) return;
    garantirDom();
    const perto = ameaca(), dM = distM();
    const parada = P.noiseR === 0 && !P.sprinting;
    const fora = !!(P.room && P.room.fora);

    // ---------- FECHAR OS OLHOS PARA OUVIR (N segurado) ----------
    if (keys.Comma) st.cmHold += dt; else st.cmHold = 0;
    if (st.olhosDesc > 0) st.olhosDesc -= dt;
    let querOlhos = OPT.s7olhos && st.cmHold > .22 && st.olhosDesc <= 0 && !S.hidden && !P.sprinting && jogando();
    if (querOlhos) {
      st.olhosT += dt;
      if (st.olhosT > 4) { querOlhos = false; st.olhosDesc = 10; st.olhosT = 0; toast('Os olhos ardem de tanto apertar. Dez segundos para descansar.'); } // escuta de até 4 s, depois 10 s de descanso
    } else if (!keys.Comma) st.olhosT = Math.max(0, st.olhosT - dt * .5);
    st.olhos = querOlhos;
    st.olhosK = clamp(st.olhosK + (st.olhos ? dt * 6 : -dt * 7), 0, 1);
    if (st.overlay) { const ov = (st.olhosK * 0.92).toFixed(2); if (ov !== st._ov) { st._ov = ov; st.overlay.style.opacity = ov; } }
    if (st.olhos && st.olhosK > 0.9 && !S.flags.s7olhosDica) { S.flags.s7olhosDica = true; subPequeno('lia', 'De olhos fechados eu escuto melhor — mas fico cega.'); }

    // ---------- PRENDER O AR: a bolha de silêncio aflita ----------
    const prende = !!P.prende;
    if (prende) st.preseT += dt; else st.preseT = 0;
    // zumbido crescente do fôlego preso demais (empurra a soltar)
    if (prende && st.preseT > 4.5 && !OPT.semZumbido) {
      zumbidoLigar();
      const k = clamp((st.preseT - 4.5) / 4, 0, 1);
      zumbidoNivel(0.006 * k, 2200 + 1600 * k);
    } else zumbidoDesligar();
    // bordas: já tratado pelo JGL5; aqui só a barra de respiração
    if (st.barra) {
      const mostra = (prende || perto) && jogando();
      const op = mostra ? '1' : '0'; if (op !== st._bop) { st._bop = op; st.barra.style.opacity = op; }
      if (mostra) { const fase = (Math.sin((AUD ? AUD.resp : perf)) + 1) / 2; const v = prende ? clamp((S.ar || 0) / 100, 0, 1) : fase; const lf = (v * 100).toFixed(0) + '%'; if (lf !== st._blf) { st._blf = lf; st.barraDot.style.left = lf; } }
    }

    // ---------- TREMOR DE FRIO (medo alto + clima frio/tempestade) ----------
    const frio = fora || (window.__raioFrio) || (AUD && AC && AC.currentTime < AUD.trovaoAte + 6);
    if (jogando() && S.fear > 70 && frio && !prende && !S.hidden) {
      st.denteT -= dt;
      if (st.denteT <= 0) {
        st.denteT = 0.45 + Math.random() * 0.2;
        dente(P.pos.x, P.pos.z);
        if (dM < 6 && M && M.ativo) emitNoise(P.pos.x, P.pos.z, 1.3, true);
        if (!st.tremAviso) { st.tremAviso = true; S.flags.s7trem = true; subPequeno('lia', 'Estou tremendo de frio... prender o ar segura os dentes.'); }
      }
    } else st.denteT = Math.max(st.denteT, 0.2);

    // ---------- POÇAS E RASTRO MOLHADO ----------
    const naAgua = !!P.naAgua;
    if (naAgua && !st.pisadaAgua && P.noiseR > 0) {
      st.pisadaAgua = true;
      if (P.sprinting) {
        emitNoise(P.pos.x, P.pos.z, 10, true); marcarCausa('poça'); SFX.vidro(P.pos.x, P.pos.z);
        if (dM < 10 && M && M.ativo) { stingCorda(); P.shake = Math.max(P.shake, 0.04); }
        if (!st.aguaAviso) { st.aguaAviso = true; S.flags.s7agua = true; toast('O respingo da poça entrega você. Ande devagar na água.'); }
      }
    } else if (!naAgua) {
      if (st.pisadaAgua) { st.aguaMolhadaT = 3.2; } // saiu da água: pés ainda pingam
      st.pisadaAgua = false;
    }
    if (st.aguaMolhadaT > 0) {
      st.aguaMolhadaT -= dt; st.pingoT -= dt;
      if (st.pingoT <= 0) {
        st.pingoT = 0.6;
        const ang = P.yaw + Math.PI, bx = P.pos.x + Math.sin(ang) * 0.4, bz = P.pos.z + Math.cos(ang) * 0.4;
        if (M && M.ativo && dM < 7 && !P.crouch) emitNoise(bx, bz, 2, true);
      }
    }

    // ---------- SILÊNCIO COMO ARMA: a casa te perde ----------
    const quietaTotal = parada && P.crouch && !S.flashOn && !S.hidden && jogando() && !S.flags.sino;
    if (quietaTotal) st.quietoT += dt; else st.quietoT = Math.max(0, st.quietoT - dt * 3);
    if (st.quietoT > 8) {
      st.perdidaT = 2.5; // janela em que o Inspetor procura mais longe
      if (!st.perdidaAvisou) { st.perdidaAvisou = true; subPequeno('lia', 'A casa não sabe onde eu estou.'); }
      // empurra a busca dele para longe: alivia o medo e reduz a atração
      if (M && M.ativo && ['procura', 'investiga'].includes(M.state)) { S.fear = Math.max(0, S.fear - 8 * dt); }
    } else st.perdidaAvisou = st.quietoT > 4 ? st.perdidaAvisou : false;
    if (st.perdidaT > 0) st.perdidaT -= dt;

    // ---------- VÁCUO DO BOTE (idea 26): o instante de silêncio antes do bote ----------
    if (M && M.ativo && M.state === 'bote' && (M.cacaT === undefined || M.cacaT < 0.4)) st.boteVacAte = perf + 0.4;

    // ---------- QUEBRAR O COMPASSO (dessincronizar o Inspetor) ----------
    const estado = P.sprinting ? 2 : (P.devagar || P.crouch) ? 0 : 1;
    const ult = st.compassoBuf[st.compassoBuf.length - 1];
    if (!ult || ult.e !== estado) st.compassoBuf.push({ e: estado, t: perf });
    while (st.compassoBuf.length && perf - st.compassoBuf[0].t > 2) st.compassoBuf.shift();
    if (perto && M && M.ativo && M.state === 'caca' && st.compassoBuf.length >= 3 && perf > st.compassoAte) {
      st.compassoAte = perf + 2.5; st.perdidaT = Math.max(st.perdidaT, 1.5);
      if (audio) { try { const t = AC.currentTime, gg = audio.saida(null, 0.2, 'mus'); audio.osc('sine', 330, t, 0.25, gg); audio.env(gg, t, 0.02, 0.05, 0.22); } catch (e) {} }
      if (!S.flags.s7compasso) { S.flags.s7compasso = true; subPequeno('lia', 'Mudei o passo... ele perdeu o meu compasso.'); }
    }


    // ---------- ACALMAR O CORAÇÃO (respiração ritmada, agachada e parada) ----------
    if (P.crouch && parada && jogando() && S.fear > 40) {
      st.calmaResp += dt;
      const ciclo = (prende !== st.prendiaAnt);
      if (ciclo && st.calmaResp > 0.8 && st.calmaResp < 2.4) {
        S.fear = Math.max(0, S.fear - 10); ufa(); st.calmaFase++;
        if (st.calmaFase >= 2 && !st.calmaAviso) { st.calmaAviso = true; subPequeno('lia', 'Respira... devagar. O coração acalma.'); }
      }
      if (ciclo) st.calmaResp = 0;
    } else { st.calmaResp = 0; st.calmaFase = Math.max(0, st.calmaFase - dt); }
    st.prendiaAnt = prende;

    // ---------- OUVIDO NO CHÃO (agachada e parada: ribombo dos passos dele) ----------
    if (P.crouch && parada && M && M.ativo && dM < 9 && dM > 2 && jogando()) {
      st.ribomboT -= dt;
      if (st.ribomboT <= 0) { st.ribomboT = 0.7; ribombo(M.pos.x, M.pos.z); }
    }

    // ---------- SOM DISTANTE QUE O SILÊNCIO REVELA ----------
    if (quietaTotal && st.quietoT > 3 && !perto) {
      if (perf > st.distanteAte && Math.random() < dt * 0.4) {
        st.distanteAte = perf + 8;
        if (audio && AC) { try { const ang = Math.random() * 6.28, dx = P.pos.x + Math.cos(ang) * 16, dz = P.pos.z + Math.sin(ang) * 16, gg = audio.saida(pos3(dx, dz, 1.6), 0.6, 'amb'); audio.burst(AC.currentTime, 0.4, 'bandpass', 500, 2, gg); audio.env(gg, AC.currentTime, 0.1, 0.04, 0.35); } catch (e) {} }
      }
    }

    // ---------- TESTE DE NERVOS: o jogo "morre" (raríssimo, 1x por noite, nunca em caça) ----------
    if (OPT.s7nervos && !window.__teste && jogando() && !st.nervosFeito && !perto && S.capT > 60 && Math.random() < dt * 0.0012) {
      st.nervosFeito = true; st.nervosAte = perf + 3.6; st.nervosFase = 1;
    }
    if (st.nervosFase === 1) {
      if (perf < st.nervosAte) { abafarMundo && abafarMundo(0.001, 0.2); }
      else { st.nervosFase = 0; try { if (AMB && AMB.resp) SFX.arfar && SFX.arfar(); } catch (e) {} if (abafarMundo) abafarMundo(1, 0.01); }
    }

    // ---------- JANELA DO TROVÃO: aviso e cobertura ----------
    if (AUD && AC) {
      const t = AC.currentTime;
      if (t < AUD.trovaoIni && AUD.trovaoIni - t < 0.9 && AUD.trovaoIni > 0 && !st.trovaoAviso && fora) {
        st.trovaoAviso = true;
        if (!S.flags.s7trovao) { S.flags.s7trovao = true; subPequeno('lia', 'Vem o estrondo. Corra agora que ele não me ouve.'); }
      }
      if (t > AUD.trovaoAte) st.trovaoAviso = false;
    }

    // ---------- ANA EXPOSTA NO CLARÃO DO RELÂMPAGO ----------
    if (window.__raioI > 0.4 && g.ANA && g.ANA.ativa) st.flashAnaAte = perf + 0.3;

    // ---------- TAPAR OS OUVIDOS (olhos fechados + agachada): o medo baixa mais rápido ----------
    if (st.olhos && P.crouch && jogando()) { S.fear = Math.max(0, S.fear - 10 * dt); }

    // ---------- PRENDER O AR COLADO NELE: alívio extra do medo ----------
    if (prende && M && M.ativo && dM < 2.2) S.fear = Math.max(0, S.fear - 7 * dt);

    // ---------- OLHOS FECHADOS: as pistas de ameaça chegam de mais longe ----------
    if (BUS && AC) {
      const t = AC.currentTime, boost = st.olhosK > 0.4;
      if (boost) { for (const b of ['ent', 'voz']) { const v = (OPT['v' + (b === 'ent' ? 'Ent' : 'Voz')] ?? 1) * 1.6; if (BUS[b]) BUS[b].gain.setTargetAtTime(v, t, 0.1); } st._boostOlhos = true; }
      else if (st._boostOlhos) { st._boostOlhos = false; try { aplicarVolumes && aplicarVolumes(); } catch (e) {} }
    }

    // ---------- OUVIR PELA PORTA (encostada, parada): o outro lado chega mais claro ----------
    if (parada && M && M.ativo && g.W && g.W.doors) {
      let dperto = null, dd = 2;
      for (const p of g.W.doors) { const h = dist(p.x, p.z, P.pos.x, P.pos.z); if (h < dd) { dd = h; dperto = p; } }
      if (dperto && !dperto.open && (dperto.fresta || 0) < 0.3) {
        st.portaOuvT -= dt;
        if (st.portaOuvT <= 0 && dM < 9) {
          st.portaOuvT = 0.8;
          // respiração dele colado do outro lado, ou o passo abafado
          if (dM < 3.2) {
            if (audio && AC) { try { const gg = audio.saida(pos3(dperto.x, dperto.z, 1.4), 0.1, 'ent'); audio.burst(AC.currentTime, 0.5, 'lowpass', 500, 0.8, gg); audio.env(gg, AC.currentTime, 0.1, 0.03, 0.5); } catch (e) {} }
            if (!S.flags.s7porta) { S.flags.s7porta = true; subPequeno('lia', 'Tem alguém encostado do outro lado...'); }
          } else ribombo(dperto.x, dperto.z);
        }
      } else st.portaOuvT = Math.max(st.portaOuvT, 0.3);
    }

    // ---------- ENGOLIR SECO quando ele está colado ----------
    if (M && M.ativo && dM < 3 && !prende && !S.hidden && jogando()) {
      st.engoleT -= dt;
      if (st.engoleT <= 0) { st.engoleT = 4 + Math.random() * 3; if (audio && AC) { try { const gg = audio.saida(null, 0.08, 'corpo'); audio.burst(AC.currentTime, 0.12, 'lowpass', 400, 1, gg); audio.env(gg, AC.currentTime, 0.03, 0.02, 0.12); } catch (e) {} } }
    }

    // ---------- ASSOBIO FINO quando se prende o ar quase sem fôlego ----------
    if (prende && (S.ar || 0) < 18 && jogando()) {
      st.assobioT -= dt;
      if (st.assobioT <= 0) { st.assobioT = 1.2; if (audio && AC) { try { const gg = audio.saida(pos3(P.pos.x, P.pos.z), 0.05, 'corpo'); const o = audio.osc('sine', 2800, AC.currentTime, 0.25, gg); audio.env(gg, AC.currentTime, 0.04, 0.006, 0.2); } catch (e) {} } if (M && M.ativo && dM < 4) emitNoise(P.pos.x, P.pos.z, 1.1, true); }
    }

    ATM.update(dt, { perto, dM, parada, fora, prende, olhos: st.olhosK });

    // ---------- MODOS DE DESAFIO (Só o Perigo / Surdo) ----------
    aplicarModos();
  }

  // Só o Perigo: sem ambiência/música, só as pistas de ameaça. Surdo: só o corpo da Lia.
  function aplicarModos() {
    const BUS = g.BUS, AC = g.AC, S = g.S; if (!BUS || !AC) return;
    const chave = (OPT.s7soPerigo ? 'P' : '') + (OPT.s7surdo ? 'S' : '');
    const t = AC.currentTime;
    if (OPT.s7soPerigo || OPT.s7surdo) {
      const ambA = OPT.s7surdo ? 0 : 0.0001;
      for (const b of ['amb', 'mus']) { if (BUS[b]) BUS[b].gain.setTargetAtTime(ambA, t, 0.2); if (BUS[b + 'R']) BUS[b + 'R'].gain.setTargetAtTime(ambA, t, 0.2); }
      if (OPT.s7surdo) for (const b of ['ent', 'voz', 'sfx']) { const v = 0.0001; if (BUS[b]) BUS[b].gain.setTargetAtTime(v, t, 0.2); if (BUS[b + 'R']) BUS[b + 'R'].gain.setTargetAtTime(v, t, 0.2); }
      st.modosAplicados = chave;
    } else if (st.modosAplicados) {
      st.modosAplicados = ''; try { aplicarVolumes && aplicarVolumes(); } catch (e) {}
    }
    if (chave !== st._chaveAviso) {
      st._chaveAviso = chave;
      if (OPT.s7surdo) toast('Modo Surdo: só o seu corpo. Horror sem pistas.');
      else if (OPT.s7soPerigo) toast('Modo Só o Perigo: sem ambiência, só as pistas da ameaça.');
    }
  }

  // ---------- multiplicadores lidos pelo motor ----------
  function mascara(x, z) {
    let k = 1; const AC = g.AC, AUD = g.AUD, M = g.M;
    if (!AC) return k;
    const t = AC.currentTime;
    // pico do trovão: cobertura forte (além do 0.3 que o motor já aplica)
    if (AUD && t > AUD.trovaoIni && t < AUD.trovaoIni + 2) k *= 0.25; // os 2 s do estrondo: cavar, arrombar e correr custam um quarto do ruído
    // vácuo do bote e poço de silêncio depois da garrafa: mover-se nessas brechas é seguro
    if (g.perf < st.boteVacAte) k *= 0.15;
    if (g.perf < st.distracaoAte) k *= 0.12;
    // a casa te perdeu / compasso quebrado: ele te ouve menos por um instante
    if (st.perdidaT > 0) k *= 0.45;
    if (window.__chuvaForte) k *= 0.8;
    return k * ATM.mascara(x, z);
  }
  function passoK() {
    let k = 1;
    k *= ATM.passoK(); // pisos, tecido, sapatos molhados, goteira e recuo da chuva
    return k;
  }
  function corte() {
    // surdez tática: prender o ar demais ou fechar os olhos ensurdece os agudos
    let c = 20000;
    if (st.olhosK > 0.5) c = Math.min(c, 1400);
    if (P.prende && st.preseT > 2) c = Math.min(c, 260 + 600 * clamp(1 - (st.preseT - 2) / 5, 0, 1));
    return Math.min(c, ATM.corte());
  }
  function mundoK() {
    // a bolha: prender o ar afunda o mundo; de olhos fechados a ambiência cede e o perto cresce
    let k = 1;
    if (P.prende) k *= clamp(0.55 - st.preseT * 0.03, 0.25, 0.55);
    if (st.olhosK > 0.05) k *= (1 - st.olhosK * 0.55);
    return k * ATM.mundoK();
  }
  function vacuo() {
    let v = 1;
    if (g.perf < st.distracaoAte) v = Math.min(v, 0.06);
    if (g.perf < st.boteVacAte) v = Math.min(v, 0.15);
    return v;
  }
  // chamado pelo motor quando a garrafa quebra: abre o poço de silêncio
  function garrafaQuebrou() { st.distracaoAte = g.perf + 1.5; }
  // chamado pelo motor a cada quique da garrafa na madeira: o Inspetor segue o som
  function garrafaQuique(x, z) {
    const M = g.M; if (M && M.ativo && M.state === 'caca') { M.olhar = new THREE.Vector3(x, 0, z); M.olharT = Math.max(M.olharT || 0, 1); }
  }

  function montarOpcoes() {
    // devolve descrições para a interface de opções (se ela quiser listar); seguro se ignorado
    return [
      { k: 's7olhos', nome: 'Fechar os olhos (vírgula)', dica: 'Segure a vírgula para escutar melhor, cega e imóvel; um toque rápido bate palma.' },
      { k: 's7nervos', nome: 'Teste de nervos', dica: 'Raramente, todo o som some por alguns segundos.' },
      { k: 's7soPerigo', nome: 'Modo Só o Perigo', dica: 'Sem ambiência nem música: só as pistas de ameaça.' },
      { k: 's7surdo', nome: 'Modo Surdo', dica: 'Silencia tudo menos o corpo da Lia.' },
    ];
  }

  return { update, tecla, mascara, passoK, corte, mundoK, vacuo, garrafaQuebrou, garrafaQuique, montarOpcoes,
    pedras: ATM.pedras, gastarPedra: ATM.gastarPedra, pedraCaiu: ATM.pedraCaiu,
    get olhosFechados() { return st.olhos; } };
}
