// =====================================================================
// Jogabilidade, Lote 5 — 2ª rodada: mais contra-jogos do corpo e do
// silêncio contra o Inspetor e a Ana, sem itens novos. Preso ao motor
// por ganchos curtos de jogo.js (seção JOGADOR):
//   JGL5B.update(dt)      no loop
//   JGL5B.ruidoMul()      no cálculo do ruído dos passos (updatePlayer)
//   JGL5B.velMul()        na velocidade (updatePlayer)
//   JGL5B.tecla(e)        no onKey (tecla N: descalçar)
//   JGL5B.boteDeitada()   lido pelo bote do Inspetor (updateInspetor)
//   JGL5B.cacoDescalca()  lido pelos cacos (updateCacos)
//   JGL5B.garrafaPouso(g) / segurandoPorta(dr) / ambMul()  garrafa, porta e drone (jogo.js); tecla N joga a lanterna
// Nada aqui pode estourar: cada subsistema roda dentro de um try/catch,
// e nenhum efeito trava o movimento da Lia (o QA joga sozinho).
// =====================================================================
export function criarJogabilidadeL5B(C) {
  const { THREE, P, M, ANA, PROC, W, keys, camera, OPT, SFX, emitNoise, marcarCausa, toast, sub, subPequeno, audio, estourarLampada, conquista } = C;
  const S = () => C.S, perf = () => C.perf, AC = () => C.AC;
  const now = () => { try { return AC() ? AC().currentTime : 0; } catch (e) { return 0; } };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // no QA (jogo automático) as ações que o jogador dispara de propósito ficam inertes,
  // para não interferir na partida sozinha; os contra-jogos passivos seguem valendo.
  const testando = () => { try { return !!window.__teste || (typeof navigator !== 'undefined' && navigator.webdriver); } catch (e) { return false; } };

  try { const R = window.ROTEIRO; if (R && Array.isArray(R.conquistas) && !R.conquistas.some(x => x.id === 'jgl5b_costas')) R.conquistas.push({ id: 'jgl5b_costas', nome: 'Pelas Costas do Que Reza', desc: 'Passe colada atrás do Inspetor enquanto ele reza, agachada e calada.', secreta: true }); } catch (e) {}
  let selo = null, lama = null, criado = false;
  function ini() {
    if (criado || typeof document === 'undefined') return; criado = true;
    const mk = (id, css) => { const d = document.createElement('div'); d.id = id; d.style.cssText = css; d.setAttribute('aria-hidden', 'true'); document.body.appendChild(d); return d; };
    selo = mk('l5b-selo', 'position:fixed;left:50%;bottom:20%;transform:translateX(-50%);z-index:12;pointer-events:none;opacity:0;transition:opacity .2s;font:600 12px/1.4 Georgia,serif;letter-spacing:.12em;color:#b9ad8f;text-shadow:0 1px 3px #000;text-align:center');
    lama = mk('l5b-lama', 'position:fixed;inset:0;z-index:8;pointer-events:none;opacity:0;transition:opacity .5s linear;background:radial-gradient(ellipse at 50% 60%, transparent 54%, rgba(26,18,9,.55) 100%)');
  }
  function dizerSelo(txt) {
    if (!selo) return;
    if (txt) { try { const sb = document.getElementById('sub'); if (sb && sb.textContent.trim()) txt = ''; } catch (e) {} }
    selo.textContent = txt || ''; selo.style.opacity = txt ? '.78' : '0';
  }
  function tinido(freq, dur, peak, tipo = 'triangle') {
    try { if (!AC() || !audio) return; const t = now(), g = audio.saida(null, 0, 'sfx'); audio.env(g, t, .006, peak, dur); audio.osc(tipo, freq, t, dur + .04, g); } catch (e) {}
  }
  function baque(freq, dur, peak) {
    try { if (!AC() || !audio) return; const t = now(), g = audio.saida(null, 0, 'sfx'); audio.env(g, t, .01, peak, dur); audio.osc('sine', freq, t, dur + .05, g); } catch (e) {}
  }

  let st = {
    descalca: false, descalcaDica: false, cacoDescalcaCd: -99,
    lamaAte: -99, lamaDica: false, aguaAnt: false, secaT: 0, secaDica: false,
    borrifoCd: -99, borrifoDica: false,
    deitada: 0, deitarDica: false,
    espiar: 0, espiarCd: -99, espiarDica: false,
    palmaCd: -99, palmaDica: false,
    cacoRevelCd: -99,
    compasso: 0, compassoDica: false,
    curaCheiro: null, curaDica: false,
    arBaixoDica: false, prendeAnt: false, arAnt: 100, arSoltaDica: false,
    pegadaCd: -99,
    somMundoDica: false,
    anaPiscaN: 0, anaPiscaT: 0, anaPiscaDica: false, flashAnt: false,
    estatuaParede: 0, firmeza: 1, firmezaDica: false,
    corProfundo: 0, corDica: false,
    qTras: false, qCd: -99, qDica: false,
    trasVelDica: false,
    calorChaoDica: false,
    respiroParedeCd: -99, respiroDica: false,
    agarraSacode: 0,
    lc: null, lcS: null, lcDica: false, lcCd: -99, lcAviso: -99, lcPegaDica: false,
    portaForca: 1, portaId: null, portaDica: false, portaQuebra: 0,
    estUsos: 0, estAnt: false, estAprendeu: false,
    rezaT: 0, rezaFeito: false, costasCd: -99, costasDica: false,
    cacaIni: -99, cacaAnt: false, calmaDica: false,
    pilhaClicou: false, ambK: 1, presoMovDica: false, truqueDica: false, lampDica: false
  };

  // ---------- ganchos lidos pelo motor ----------
  function ruidoMul() {
    try {
      let k = 1;
      if (st.descalca && !P.sprinting) { const piso = (P.room && P.room.piso) || 'concreto'; if (piso !== 'tapete' && piso !== 'grama') k *= .45; } // descalça só rende no piso duro
      if (perf() - st.lamaAte < 0) k *= .72;      // enlameada: o barro abafa o passo
      if (st.compasso > 0) k *= .55;              // pisando no compasso dos passos dele
      if (perf() - st.borrifoCd < 1.6) k *= .5;   // o borrifo da água cobre os próximos passos
      if (P.crouch && P.devagar) k *= .82;
      if (P.prende && P.crouch && P.devagar && !S().hidden) k *= .35; // agachada, devagar e sem respirar: dois metros críticos quase mudos        // agachada E devagar ao mesmo tempo
      return k;
    } catch (e) { return 1; }
  }
  function velMul() {
    try { let k = 1; if (st.descalca) k *= .9; if (perf() - st.lamaAte < 0) k *= .94; if (keys.KeyQ && M.ativo && M.state === 'caca') k *= .88; return k; } catch (e) { return 1; }
  }
  function boteDeitada() { try { const s = S(); return st.deitada > .9 && !s.flashOn && Math.hypot(P.vx || 0, P.vz || 0) < .08; } catch (e) { return false; } }
  function cacoDescalca() { try { return st.descalca; } catch (e) { return false; } }

  // ---------- descalçar / calçar (tecla ` / Backquote, livre no esquema padrão) ----------
  function tecla(e) {
    try {
      const s = S(); if (!s || C.mode !== 'jogo' || C.ui || s.dead || s.fim) return false;
      if (e.code === 'KeyF' && st.lc && !testando()) { if (perf() - st.lcAviso > 2.5) { st.lcAviso = perf(); const d = Math.round(Math.hypot(st.lc.x - P.pos.x, st.lc.z - P.pos.z)); toast('Sua lanterna está no chão, a uns ' + d + ' m. Passe por cima para pegar.'); } return true; }
      if (e.code === 'KeyN' && !e.repeat) return jogarLanterna();
      if (e.code === 'Backquote') {
        if (s.hidden || testando()) return false;
        st.descalca = !st.descalca;
        tinido(st.descalca ? 210 : 320, .1, .2, 'sine');
        if (st.descalca) { if (!st.descalcaDica) { st.descalcaDica = true; toast('Você tirou os sapatos (tecla `): anda quase em silêncio no piso duro, um pouco mais devagar, e sente os cacos nos pés.'); } else subPequeno('lia', '(tirei os sapatos...)'); }
        else { subPequeno('lia', '(calcei de novo — mais rápida, mais barulhenta)'); if (M.ativo && M.pos.distanceTo(P.pos) < 4) { emitNoise(P.pos.x, P.pos.z, 2, true); marcarCausa('calcou'); } }
        return true;
      }
    } catch (e2) {}
    return false;
  }

  function update(dt) { try { _update(dt); } catch (e) {} }

  function _update(dt) {
    if (!criado) ini();
    const s = S();
    if (!s || C.mode !== 'jogo' || C.ui || s.dead || s.fim) { dizerSelo(''); if (lama) lama.style.opacity = '0'; st.deitada = 0; P.estatua2 = 0; return; }
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;
    const prende = !!P.prende;
    const parado = Math.hypot(P.vx || 0, P.vz || 0) < .08;
    const emCaca = M.ativo && M.state === 'caca';

    if (lama) lama.style.opacity = (perf() - st.lamaAte < 0 ? .85 : 0).toFixed(2);

    _lama(dt);
    _borrifo(dt);
    _compasso(dt, dM, emCaca, parado);
    _cacoNaCaca(dt, dM, emCaca);
    _curaCheiro(dt, dM);
    _arSolta(dt, dM, prende);
    _secaRastro(dt);
    _calorChao(dt);
    _respiroPorta(dt, dM);
    _somDoMundo(dt, dM);
    _anaPisca(dt);
    _estatuaParede(dt, dM, parado);
    _coracaoProfundo(dt, dM, prende);
    _agarra(dt);
    _porta(dt);
    _lanternaChao(dt, dM);
    _aprende(dt, dM);
    _reza(dt, dM);
    _calmaria(dt);
    _pilhaClique();
    _arEmMovimento(dt, dM);

    _aguaFolego(dt, dM);
    _trovaoCue(dt, dM);
    _leituraEstado(dt, dM);
    _descalcaPiso(dt);
    _focoChao(dt, dM);
    _correrEco(dt);

    if (s.hidden) { st.deitada = 0; return; }
    _deitar(dt, dM, parado, prende);
    _espiar(dt, dM, parado);
    _qTras(dt, dM);
    _palma(dt, dM);
  }

  // --- agachada e parada dentro da água, a Lia afunda o rosto e respira sem barulho ---
  function _aguaFolego(dt, dM) {
    const s = S();
    if (P.naAgua && P.crouch && Math.hypot(P.vx || 0, P.vz || 0) < .08) {
      if (P.ofegoT > 0) P.ofegoT = 0;
      if (s.ar !== undefined) s.ar = Math.min(100, s.ar + dt * 6);
      if (!st.aguaFolegoDica) { st.aguaFolegoDica = true; subPequeno('lia', '(agachada na água, respiro sem fazer barulho)'); }
    }
  }

  // --- janela do trovão: enquanto o estrondo cobre o mundo, um aviso marca a hora de agir ---
  function _trovaoCue(dt, dM) {
    try {
      if (C.trovao && C.trovao() && M.ativo && dM < 14) { dizerSelo('o trovão cobre o barulho — agora'); if (!st.trovaoDica) { st.trovaoDica = true; subPequeno('lia', '(no estrondo ele não me ouve — é agora)'); } }
    } catch (e) {}
  }

  // --- lama por água, véu e secagem ---
  function _lama(dt) {
    if (P.naAgua && !st.aguaAnt) { st.lamaAte = perf() + 24; if (!st.lamaDica) { st.lamaDica = true; subPequeno('lia', '(o barro grudou... o cheiro se perde nele)'); } }
    st.aguaAnt = !!P.naAgua;
  }
  function _secaRastro(dt) {
    if (perf() - st.lamaAte < 0 && !P.naAgua && Math.hypot(P.vx || 0, P.vz || 0) < .08) {
      st.secaT += dt; if (st.secaT > 4) { st.lamaAte = perf() - 99; st.secaT = 0; if (!st.secaDica) { st.secaDica = true; subPequeno('lia', '(o barro secou e caiu)'); } }
    } else st.secaT = 0;
  }
  // --- borrifo: entrar na água correndo/andando faz um splash que mascara os próximos passos ---
  function _borrifo(dt) {
    if (P.naAgua && !st.aguaAnt2 && Math.hypot(P.vx || 0, P.vz || 0) > 1.5) {
      st.borrifoCd = perf(); if (!st.borrifoDica) { st.borrifoDica = true; subPequeno('lia', '(o splash cobre meus passos por um instante)'); }
    }
    st.aguaAnt2 = !!P.naAgua;
  }

  // --- compasso: andando agachada e devagar com ele caçando perto, o passo some no eco ---
  function _compasso(dt, dM, emCaca, parado) {
    if (emCaca && dM < 9 && !parado && P.crouch && P.devagar) {
      st.compasso = .3; if (!st.compassoDica) { st.compassoDica = true; subPequeno('lia', '(piso junto com ele... o eco engole meus passos)'); }
    } else st.compasso = Math.max(0, st.compasso - dt);
  }

  // --- caco na caça: o Inspetor que pisa no vidro range, cambaleia e se denuncia ---
  function _cacoNaCaca(dt, dM, emCaca) {
    if (!emCaca || perf() - st.cacoRevelCd < 6) return;
    try {
      if (!M.cacos) return;
      for (const c of M.cacos) {
        if (Math.hypot(M.pos.x - c.x, M.pos.z - c.z) < .7) {
          st.cacoRevelCd = perf(); M.wait = Math.max(M.wait || 0, 2.2); M.l5mudo = Math.max(M.l5mudo || 0, 1.3);
          SFX.vidro && SFX.vidro(M.pos.x, M.pos.z); SFX.voz && SFX.voz(M.pos);
          subPequeno('lia', '(ele pisou no vidro — sei onde ele está agora)'); break;
        }
      }
    } catch (e) {}
  }

  // --- curativo deixa cheiro de sangue: o faro dele sobe; dentro da água não deixa cheiro ---
  function _curaCheiro(dt, dM) {
    if (P.curaT > 0 && !st.curaCheiro) {
      st.curaCheiro = perf();
      if (P.naAgua) { st.curaCheiro = perf() - 99; }
      else if (M.ativo && dM < 12 && !testando()) { if (!st.curaDica) { st.curaDica = true; subPequeno('lia', '(o sangue... ele sentiu)'); } }
    } else if (P.curaT <= 0 && st.curaCheiro && perf() - st.curaCheiro > 4.2) st.curaCheiro = null;
    // o cheiro dura alguns segundos: o faro dele fica mais aberto o tempo todo (o cérebro do lote 5 zera o fator a cada quadro)
    if (st.curaCheiro && perf() - st.curaCheiro < 4 && perf() - st.curaCheiro >= 0 && M.ativo && dM < 14 && !testando()) M.l5ouvidoMul = (M.l5ouvidoMul || 1) * 1.6;
  }

  // --- soltar o ar devagar: aviso no fim do fôlego e leitura de soltar de supetão ---
  function _arSolta(dt, dM, prende) {
    const s = S();
    if (prende && (s.ar ?? 100) < 25 && M.ativo && dM < 6) { dizerSelo('solte o ar devagar...'); if (!st.arBaixoDica) st.arBaixoDica = true; }
    if (st.prendeAnt && !prende && st.arAnt < 30 && !st.arSoltaDica) { st.arSoltaDica = true; subPequeno('lia', '(soltei o ar rápido demais)'); }
    st.prendeAnt = prende; st.arAnt = (s.ar ?? 100);
  }

  // --- apontar a lanterna bem para o chão esfria mais rápido o calor que ele caça ---
  function _calorChao(dt) {
    const s = S();
    if (s.flashOn && P.pitch < -1.05 && M.ativo && (M.calorT || 0) > 0) {
      M.calorT = Math.max(0, M.calorT - dt * 2.5);
      if (!st.calorChaoDica) { st.calorChaoDica = true; subPequeno('lia', '(luz no chão... ele não acha o calor no meu rosto)'); }
    }
  }

  // --- respiração dele pela parede: colada numa parede com ele do outro lado, um baque de leitura ---
  function _respiroPorta(dt, dM) {
    if (!M.ativo || dM > 5 || perf() - st.respiroParedeCd < 3) return;
    try {
      if ((M.state === 'caca' || M.state === 'procura') && C.paredeEntre && C.paredeEntre(M.pos, P.pos)) {
        st.respiroParedeCd = perf(); baque(68, .32, .12);
        if (!st.respiroDica) { st.respiroDica = true; subPequeno('lia', '(a respiração dele... do outro lado da parede)'); }
      }
    } catch (e) {}
  }

  // --- som alto do mundo mascara o ofego do medo alto ---
  function _somDoMundo(dt, dM) {
    const s = S();
    const proc = PROC && PROC.fase, gerador = s.flags && s.flags.energia && !s.flags.falouLuz;
    if ((proc || gerador) && (s.fear || 0) > 65 && M.ativo && dM < 8) {
      if (P.ofegoT > 0) P.ofegoT = 0;
      if (proc && !st.somMundoDica) { st.somMundoDica = true; subPequeno('lia', '(o barulho da Procissão cobre meu ofego)'); }
      else if (gerador && !st.geradorDica) { st.geradorDica = true; subPequeno('lia', '(o ronco do gerador engole meu ofego)'); }
    }
  }

  // --- Ana imita a luz: piscar no mesmo ritmo a faz recuar ---
  function _anaPisca(dt) {
    if (!(ANA && ANA.ativa && !ANA.script && ANA.pos)) { st.anaPiscaN = 0; return; }
    const s = S(), on = !!s.flashOn; st.anaPiscaT += dt;
    if (on !== st.flashAnt) {
      st.flashAnt = on;
      if (ANA.pos.distanceTo(P.pos) < 7) {
        if (st.anaPiscaT > .16 && st.anaPiscaT < 1.1) {
          st.anaPiscaN++; st.anaPiscaT = 0;
          if (st.anaPiscaN >= 4) { st.anaPiscaN = 0; if (typeof ANA.cool === 'number') ANA.cool = Math.max(ANA.cool, 2); ANA.conta = Math.max(0, (ANA.conta || 0) - 2); tinido(1250, .08, .1); subPequeno('ana', '(ela pisca de volta, ri baixinho... e recua um passo)'); if (!st.anaPiscaDica) { st.anaPiscaDica = true; toast('A Menina imita a sua luz. Pisque no mesmo ritmo que ela e ela recua.'); } }
        } else st.anaPiscaT = 0;
      }
    }
  }

  // --- estátua melhor na parede (P.estatua2) + firmeza que esvazia ---
  function _estatuaParede(dt, dM, parado) {
    const s = S();
    // vale agachada OU em pé (esconderijo improvisado numa quina escura), desde que no escuro e colada na parede
    const cond = parado && !s.flashOn && M.ativo && dM < 5 && _pertoParede();
    if (cond) {
      st.estatuaParede = Math.min(1, st.estatuaParede + dt);
      st.firmeza = Math.max(0, st.firmeza - dt * .14);               // segurar demais cansa a firmeza
      if (st.estatuaParede > .3 && st.estatuaParede <= .6) dizerSelo('fique imóvel...'); // ainda virando sombra
      if (st.estatuaParede > .6) {
        if (s.ar !== undefined) s.ar = Math.max(0, s.ar - dt * 4);    // virar estátua custa fôlego
        if (s.fear > 0) s.fear = Math.max(0, s.fear - dt * 5);        // de sangue-frio, o medo cede
        P.shake = Math.min(P.shake || 0, .004);                      // a câmera firma contra o tremor do medo
        if (st.firmeza < .25) { dizerSelo('a firmeza vai... mexa logo'); if (!st.firmezaDica) { st.firmezaDica = true; subPequeno('lia', '(não aguento ficar parada muito mais)'); } }
        else dizerSelo(P.crouch ? 'contra a parede, ele não te acha' : 'de pé na quina... encolhida no escuro');
      }
    } else { st.estatuaParede = Math.max(0, st.estatuaParede - dt * 2); st.firmeza = Math.min(1, st.firmeza + dt * .4); }
    // em pé é mais frágil: se ele colar a menos de 1,5 m, a sombra não engana
    const fragil = !P.crouch && dM < 1.5;
    P.estatua2 = st.estatuaParede > .6 && st.firmeza > .05 && !fragil ? 1 : 0;
    if (st.estatua2Ant && !P.estatua2) { if (SFX.ofego) SFX.ofego(); } // ao sair da pose, solta o ar preso num suspiro
    st.estatua2Ant = !!P.estatua2;
  }
  function _pertoParede() {
    try { for (const c of W.colliders) { if (!c.on) continue; const cx = Math.max(c.minX, Math.min(P.pos.x, c.maxX)), cz = Math.max(c.minZ, Math.min(P.pos.z, c.maxZ)); if (Math.hypot(P.pos.x - cx, P.pos.z - cz) < .8) return true; } } catch (e) {}
    return false;
  }

  // --- coração em respiro: parada e agachada sem ameaça perto, os nervos (P.pulso) caem mais rápido ---
  function _coracaoProfundo(dt, dM, prende) {
    const semAmeaca = !(M.ativo && dM < 9) && !(ANA && ANA.ativa) && !(PROC && PROC.fase);
    if (P.crouch && Math.hypot(P.vx || 0, P.vz || 0) < .08 && prende && semAmeaca) {
      if ((P.pulso || 0) > 0) P.pulso = Math.max(0, P.pulso - dt * 25);
      if (!st.corDica) { st.corDica = true; subPequeno('lia', '(respira fundo... o coração desacelera)'); }
    }
  }

  // --- agarrão: ganhar o cabo de guerra também com um lado da tela que pisca na direção certa ---
  function _agarra(dt) {
    if (M.ativo && M.state === 'agarra') { dizerSelo('mexa o mouse com força para escapar!'); }
  }

  // --- deitar / fingir de morta: parada, agachada e no escuro, a Lia encolhe no chão ---
  function _deitar(dt, dM, parado, prende) {
    const s = S();
    const quer = !!keys.KeyC && parado && P.crouch && !s.flashOn && prende;
    if (quer) {
      st.deitada = Math.min(1.2, st.deitada + dt);
      if (st.deitada > .9) {
        dizerSelo('deitada e imóvel — ele tateia por cima');
        if (s.fear > 0) s.fear = Math.max(0, s.fear - dt * 4);
        if (!st.deitarDica && M.ativo && dM < 5) { st.deitarDica = true; toast('Deitada no chão, parada, no escuro e com o ar preso, o Inspetor tateia na cintura e passa por cima. Qualquer movimento quebra.'); }
      }
    } else st.deitada = Math.max(0, st.deitada - dt * 2.5);
  }

  // --- encostar o ouvido na parede: parada e agachada junto a uma parede, baque que marca o lado dele ---
  function _espiar(dt, dM, parado) {
    if (!M.ativo || !parado || !P.crouch || dM > 12 || !_pertoParede() || S().flashOn) { st.espiar = 0; return; }
    st.espiar += dt;
    if (st.espiar > .8 && perf() - st.espiarCd > 1.4) {
      st.espiarCd = perf(); baque(M.state === 'caca' ? 92 : 70, .24, .1);
      if (!st.espiarDica) { st.espiarDica = true; subPequeno('lia', '(encosto o ouvido na parede... ouço de que lado ele vem)'); }
    }
  }

  // --- olhar para trás na fuga: a Lia ofega baixinho, a tentação tem um custo de som ---
  function _qTras(dt, dM) {
    const quer = !!keys.KeyQ && M.ativo && M.state === 'caca' && Math.hypot(P.vx || 0, P.vz || 0) > 2;
    if (quer && !st.qTras && perf() - st.qCd > 4) { st.qCd = perf(); if (SFX.ofego) SFX.ofego(); if (!st.qDica) { st.qDica = true; subPequeno('lia', '(olhar pra trás me faz perder o fôlego)'); } }
    st.qTras = quer;
  }

  // --- palma de pânico: bater palma de propósito o manda correndo pra fonte (segurar E+C juntos parada) ---
  function _palma(dt, dM) {
    const quer = !!keys.KeyE && !!keys.KeyC && Math.hypot(P.vx || 0, P.vz || 0) < .08 && !C.alvo;
    if (quer && !testando() && perf() - st.palmaCd > 12) {
      st.palmaCd = perf();
      const fx = P.pos.x - Math.sin(P.yaw) * 4, fz = P.pos.z - Math.cos(P.yaw) * 4;
      tinido(1400, .05, .3, 'square'); tinido(1100, .07, .25, 'square');
      emitNoise(fx, fz, 9, true); marcarCausa('bateu');
      if (M.ativo) { M.furia = (M.furia || 0) + 1.5; }
      if (!st.palmaDica) { st.palmaDica = true; toast('Você bateu palma: ele corre para o som lá na frente. Mas a fúria sobe e o próximo recuo é mais curto.'); }
      else subPequeno('lia', '(bati palma de propósito... corre pra lá)');
    }
  }

  // --- leitura do estado dele: avisos curtos quando ele está lendo o mundo (só perto) ---
  function _leituraEstado(dt, dM) {
    if (!M.ativo || dM > 7 || !OPT.posturaUI) return; // só com a opção "Leitura do perigo" ligada
    const s = S();
    if (s.flashOn === undefined) return;
    if ((M.l5stun || 0) > 0) dizerSelo('ele tropeçou — corra');
    else if (M.state === 'reza') dizerSelo('ele está rezando — passe agora, calada');
    else if (M.state === 'escuta' || M.state === 'emboscada') dizerSelo('ele está ouvindo — não se mexa');
    else if (M.state === 'conferir') dizerSelo('ele vai entrar — saia pelo outro lado');
    else if ((M.state === 'fareja' || M.state === 'vasculha')) dizerSelo('ele está tateando perto — prenda o ar');
    else if ((M.furia || 0) > 0 && M.state === 'caca') dizerSelo('ele não vai parar...');
  }

  // --- encarar o chão agachada, no escuro, acalma os nervos mais rápido ---
  function _focoChao(dt, dM) {
    const s = S();
    if (P.crouch && P.pitch < -1.0 && !s.flashOn && Math.hypot(P.vx || 0, P.vz || 0) < .08) {
      if ((P.pulso || 0) > 0) P.pulso = Math.max(0, P.pulso - dt * 14);
      if (!st.focoChaoDica) { st.focoChaoDica = true; subPequeno('lia', '(olho pro chão, respiro... os nervos baixam)'); }
    }
  }

  // --- correr descalça ainda ecoa: os sapatos não salvam da corrida desabalada ---
  function _correrEco(dt) {
    if (st.descalca && P.sprinting && !st.ecoDescalcaDica) { st.ecoDescalcaDica = true; subPequeno('lia', '(descalça ou não, correr ecoa pelo prédio)'); }
  }

  // --- descalça no tapete ou na grama não rende nada: aviso uma vez ---
  function _descalcaPiso(dt) {
    if (!st.descalca) return;
    const piso = (P.room && P.room.piso) || 'concreto';
    if ((piso === 'tapete' || piso === 'grama') && !st.descalcaMoleDica) { st.descalcaMoleDica = true; subPequeno('lia', '(aqui é macio... descalça não faz diferença)'); }
  }

  // ================== 3ª leva: iscas, porta, lâmpada, estátua que ele aprende ==================

  // --- garrafa (chamada por updateGarrafas antes do resto): lâmpada acesa ao lado dele, truque na escuta, costas dele ---
  function garrafaPouso(g) {
    try {
      if (!M.ativo || !g || !g.fim) return;
      const fim = g.fim, ini = g.ini, dMi = Math.hypot(M.pos.x - fim.x, M.pos.z - fim.z);
      const ocupado = M.state === 'bote' || M.state === 'agarra';
      // 1) a garrafa estoura uma lâmpada acesa colada nele: clarão, estrondo, ele cobre o rosto e fica surdo um instante
      for (const L of W.lampadas || []) {
        if (!L.ligada || L.estourada || !L.bulbo) continue;
        const b = L.bulbo.position, ab = fim.clone().sub(ini), t = clamp(b.clone().sub(ini).dot(ab) / Math.max(.01, ab.lengthSq()), 0, 1), q = ini.clone().addScaledVector(ab, t);
        q.y += Math.sin(t * Math.PI) * 1.2;
        if (q.distanceTo(b) < .45) {
          if (!ocupado && Math.hypot(M.pos.x - b.x, M.pos.z - b.z) < 5.5) {
            M.l5stun = Math.max(M.l5stun || 0, 1.7); M.wait = Math.max(M.wait || 0, 1.7); M.l5mudo = Math.max(M.l5mudo || 0, 1.7);
            try { SFX.voz && SFX.voz(M.pos); } catch (e) {}
            subPequeno('lia', '(o bulbo estourou na cara dele... ele cobriu o rosto)');
            if (!st.lampDica) { st.lampDica = true; toast('Você estourou a lâmpada ao lado dele: ele fica cego e surdo por um instante. Corra.'); }
          }
          return;
        }
      }
      if (testando()) return;
      // 2) ele está parado escutando e você joga a garrafa: percebe o truque e vem pro seu lado
      if ((M.state === 'escuta' || M.state === 'emboscada') && dMi > 2.5 && Math.hypot(M.pos.x - P.pos.x, M.pos.z - P.pos.z) < 12) {
        M.olhar = P.pos.clone(); M.olharT = Math.max(M.olharT || 0, 1.5); emitNoise(P.pos.x, P.pos.z, 4, true);
        if (!st.truqueDica) { st.truqueDica = true; toast('Ele estava ouvindo, não andando. Jogar a garrafa agora o fez farejar o truque.'); }
        else subPequeno('lia', '(ele estava escutando... percebeu a garrafa)');
        return;
      }
      // 3) em plena caça, o estouro nas costas dele (do lado oposto ao seu) o trava e vira a cabeça por um segundo
      if (M.state === 'caca' && perf() - st.costasCd > 8) {
        const a = new THREE.Vector3(fim.x - M.pos.x, 0, fim.z - M.pos.z), b2 = new THREE.Vector3(P.pos.x - M.pos.x, 0, P.pos.z - M.pos.z);
        if (a.length() < 6.5 && a.length() > .8 && a.dot(b2) < 0) {
          st.costasCd = perf(); M.wait = Math.max(M.wait || 0, 1.1); M.olhar = new THREE.Vector3(fim.x, 0, fim.z); M.olharT = Math.max(M.olharT || 0, 1.1);
          if (!st.costasDica) { st.costasDica = true; toast('O estouro nas costas dele o travou por um segundo. Se errasse o lado, você se entregava.'); }
        }
      }
    } catch (e) {}
  }

  // --- segurar a porta com o corpo (E depois de fechar) durante os socos dele; chamada por portaInspetor ---
  function segurandoPorta(dr) {
    try {
      if (testando() || !dr || dr.open) return false;
      const s = S(); if (s.hidden || s.flags.sino || P.portaT > 0 || !keys.KeyE) return false;
      if (Math.hypot(dr.x - P.pos.x, dr.z - P.pos.z) > 2) return false;
      if (st.portaId !== dr) { st.portaId = dr; st.portaForca = 1; }
      st.portaForca -= .27;
      P.shake = Math.max(P.shake || 0, .05); s.stamina = Math.max(0, (s.stamina ?? 100) - 12);
      if (!st.portaDica) { st.portaDica = true; toast('Você escora a porta com o corpo (E). Cada soco gasta a sua força; quando zera, ele arromba.'); }
      if (st.portaForca <= 0) {
        st.portaForca = 0; M.socos = 3; st.portaQuebra = perf(); P.shake = Math.max(P.shake, .14); s.fear = Math.min(100, (s.fear || 0) + 12); if (SFX.ofego) SFX.ofego();
        subPequeno('lia', '(não aguento mais... vai ceder!)'); return false;
      }
      M.wait = Math.max(M.wait || 0, 1); return true;
    } catch (e) { return false; }
  }
  function _porta(dt) {
    try {
      const dr = M.porta; if (!M.ativo || M.state !== 'caca' || !dr || dr.open || testando()) return;
      if (!keys.KeyE || P.portaT > 0 || S().hidden || Math.hypot(dr.x - P.pos.x, dr.z - P.pos.z) > 2) return;
      const f = st.portaId === dr ? st.portaForca : 1, n = Math.max(0, Math.round(f * 4));
      dizerSelo('escorando a porta  ' + '▮'.repeat(n) + '▯'.repeat(4 - n));
    } catch (e) {}
  }

  // --- jogar a lanterna acesa como isca de calor (tecla N); F avisa onde ela está; pegar de volta chegando perto ---
  function jogarLanterna() {
    const s = S();
    if (testando() || !s.inv || !s.inv.lanterna || s.hidden || P.pilhaT > 0 || st.lc || perf() - st.lcCd < 1.5) return false;
    const dir = new THREE.Vector3(); camera.getWorldDirection(dir); dir.y = 0; if (dir.lengthSq() < 1e-4) return false; dir.normalize();
    let d = 7; const p = new THREE.Vector3();
    for (let i = 0; i < 8; i++) { p.set(P.pos.x + dir.x * d, 0, P.pos.z + dir.z * d); if (C.paredeEntre && C.paredeEntre(P.pos, p)) d -= .8; else break; }
    if (d < 1.6) { toast('Parede colada: não há onde jogar a lanterna.'); return true; }
    const acesa = !!s.flashOn;
    const g = W.grupo, mesh = new THREE.Mesh(new THREE.CylinderGeometry(.03, .04, .17, 8), new THREE.MeshBasicMaterial({ color: acesa ? 0xfff0c0 : 0x555555 }));
    mesh.rotation.z = Math.PI / 2; mesh.position.set(p.x, .05, p.z);
    const luz = new THREE.PointLight(0xffe2a8, acesa ? 6 : 0, 9, 1.6); luz.position.set(p.x, .35, p.z);
    g.add(mesh); g.add(luz);
    st.lc = { x: p.x, z: p.z, mesh, luz, grupo: g, acesa, t: 0, ruido: 0, pisada: false }; st.lcS = s; st.lcCd = perf();
    s.flashOn = false; SFX.arremesso && SFX.arremesso();
    setTimeout(() => { try { tinido(900, .14, .3, 'square'); tinido(640, .2, .22, 'triangle'); } catch (e) {} }, 380);
    emitNoise(p.x, p.z, acesa ? 13 : 8, false);
    subPequeno('lia', acesa ? '(joguei a luz lá longe... agora é só o escuro)' : '(joguei a lanterna apagada, só pelo barulho)');
    if (!st.lcDica) { st.lcDica = true; toast('Você jogou a lanterna acesa: ela puxa o Inspetor para lá. Busque-a depois, passando por cima.'); }
    return true;
  }
  function _soltaLanterna() {
    if (!st.lc) return;
    try { const g = st.lc.grupo; g.remove(st.lc.mesh); g.remove(st.lc.luz); st.lc.mesh.geometry.dispose(); st.lc.mesh.material.dispose(); } catch (e) {}
    st.lc = null;
  }
  function _lanternaChao(dt, dM) {
    const lc = st.lc, s = S();
    if (!lc) return;
    if (lc.grupo !== W.grupo || st.lcS !== s) { _soltaLanterna(); return; } // saiu da área: ela volta ao bolso
    s.flashOn = false;
    lc.t += dt;
    if (lc.acesa && !lc.pisada) lc.luz.intensity = 5 + Math.sin(lc.t * 9) * .6 * Math.random();
    const dP = Math.hypot(lc.x - P.pos.x, lc.z - P.pos.z);
    if (dP < 1.1) { _soltaLanterna(); SFX.pegar && SFX.pegar(); tinido(520, .08, .2, 'sine'); if (!st.lcPegaDica) { st.lcPegaDica = true; subPequeno('lia', '(a lanterna... ainda quente)'); } return; }
    if (!M.ativo) return;
    const dm = Math.hypot(lc.x - M.pos.x, lc.z - M.pos.z);
    if (lc.acesa && !lc.pisada) {
      lc.ruido -= dt;
      if (lc.ruido <= 0 && dm > 1.3 && dm < 18 && M.state !== 'bote' && M.state !== 'agarra' && M.state !== 'alerta') { lc.ruido = 2.4; emitNoise(lc.x, lc.z, 6, false); }
      if (dm < 1.1) { // ele pisa na lanterna: a luz morre, ele para para sentir o que é
        lc.pisada = true; lc.luz.intensity = 0; lc.mesh.material.color.set(0x444444); M.wait = Math.max(M.wait || 0, 2.4);
        try { SFX.vidro && SFX.vidro(lc.x, lc.z); SFX.voz && SFX.voz(M.pos); } catch (e) {}
        subPequeno('lia', '(ele pisou na lanterna... está escuro, mas ela é minha ainda)');
      }
    }
  }

  // --- estátua que ele aprende: depois de quatro botes seguros na mesma noite, a pose deixa de funcionar ---
  function _aprende(dt, dM) {
    if (testando()) return;
    const ativa = !!(P.estatua || P.estatua2) && M.ativo && dM < 3.5;
    if (ativa && !st.estAnt) st.estUsos++;
    st.estAnt = ativa;
    if (st.estUsos >= 5 && (P.estatua || P.estatua2)) {
      P.estatua = 0; P.estatua2 = 0;
      if (!st.estAprendeu) { st.estAprendeu = true; toast('Ele aprendeu o truque da estátua: agora espera colado e agarra assim que você se mexer. Alterne os contra-jogos.'); }
    }
  }

  // --- passar por trás dele enquanto reza: agachada, calada e lenta, ele nem desperta ---
  function _reza(dt, dM) {
    if (!M.ativo || M.state !== 'reza' || S().hidden) { st.rezaT = Math.max(0, st.rezaT - dt * 2); return; }
    if (dM < 2.4 && P.crouch && !P.sprinting && P.noiseR <= 1.6) {
      st.rezaT += dt;
      if (st.rezaT > 1.2 && !st.rezaFeito) { st.rezaFeito = true; try { conquista('jgl5b_costas'); } catch (e) {} subPequeno('lia', '(passei por trás dele... ele só reza)'); }
    } else st.rezaT = Math.max(0, st.rezaT - dt);
  }

  // --- respiro merecido: depois de uma caça longa que ele perde, o diretor de tensão o manda longe por um bom tempo ---
  function _calmaria(dt) {
    const caca = M.ativo && (M.state === 'caca' || M.state === 'bote' || M.state === 'agarra' || M.state === 'alerta');
    if (caca && !st.cacaAnt) st.cacaIni = perf();
    if (!caca && st.cacaAnt && !S().dead && perf() - st.cacaIni > 12 && !S().flags.sino && !testando()) {
      M.recuo = Math.max(M.recuo || 0, 22); M.tensao = 0;
      if (!st.calmaDica) { st.calmaDica = true; toast('Ele perdeu o seu rastro. Respire: vai demorar a voltar.'); } else subPequeno('lia', '(ele foi embora... respiro)');
    }
    st.cacaAnt = caca;
  }

  // --- o clique de trocar a pilha chama ele se estiver perto ---
  function _pilhaClique() {
    if (P.pilhaT > .55 && !st.pilhaClicou) {
      st.pilhaClicou = true;
      if (!testando() && M.ativo && M.pos.distanceTo(P.pos) < 6 && !['caca', 'bote', 'agarra', 'alerta'].includes(M.state)) { emitNoise(P.pos.x, P.pos.z, 2, true); subPequeno('lia', '(o clique da pilha... ele virou a cabeça)'); }
    } else if (!(P.pilhaT > 0)) st.pilhaClicou = false;
  }

  // --- gastar mais ar andando sem respirar e abafar o drone do mundo para ouvir os passos dele ---
  function _arEmMovimento(dt, dM) {
    const s = S();
    if (P.prende && !s.hidden && P.crouch && P.devagar && Math.hypot(P.vx || 0, P.vz || 0) > .15 && s.ar !== undefined) {
      s.ar = Math.max(0, s.ar - dt * 7);
      if (!st.presoMovDica) { st.presoMovDica = true; subPequeno('lia', '(sem respirar, agachada, passo colada nele... o ar vai rápido)'); }
    }
    const alvoK = (P.prende && M.ativo && dM < 16) ? .3 : 1;
    st.ambK += (alvoK - st.ambK) * Math.min(1, dt * 3);
  }
  function ambMul() { return st.ambK; }

  return { ini, update, tecla, ruidoMul, velMul, boteDeitada, cacoDescalca, garrafaPouso, segurandoPorta, ambMul, jogarLanterna };
}
