// =====================================================================
// Jogabilidade, Lote 5: contra-jogo do corpo e do silêncio.
// Tudo o que a Lia faz com fôlego, pânico e sangue-frio para enganar o
// Inspetor e a Ana sem itens novos. Ligado ao motor por poucos ganchos
// em jogo.js (seção JOGADOR): JGL5.ini(), JGL5.update(dt), JGL5.boteLuz(),
// JGL5.baterParede() e o custo de olhar para trás na fuga.
// Nada aqui pode estourar: todo o update roda dentro de um try/catch.
// =====================================================================
export function criarJogabilidadeL5(C) {
  const { THREE, P, M, ANA, PROC, W, keys, camera, OPT, SFX, emitNoise, marcarCausa, toast, sub, subPequeno, audio } = C;
  const S = () => C.S, perf = () => C.perf, AC = () => C.AC;
  const now = () => { try { return AC() ? AC().currentTime : 0; } catch (e) { return 0; } };

  // --- overlays próprios (sem mexer no index.html nem no CSS de ninguém)
  let vinheta = null, selo = null, criado = false;
  function ini() {
    if (criado || typeof document === 'undefined') return; criado = true;
    const mk = (id, css) => { const d = document.createElement('div'); d.id = id; d.style.cssText = css; d.setAttribute('aria-hidden', 'true'); document.body.appendChild(d); return d; };
    // escurecimento das bordas ao prender o ar / coração disparado
    vinheta = mk('l5-vinheta', 'position:fixed;inset:0;z-index:9;pointer-events:none;opacity:0;transition:opacity .12s linear;background:radial-gradient(ellipse at center, transparent 34%, rgba(0,0,0,.92) 96%)');
    // selo de "imóvel" / olhos fechados / mão na boca: um aviso discreto, não um ícone berrante
    selo = mk('l5-selo', 'position:fixed;left:50%;bottom:16%;transform:translateX(-50%);z-index:12;pointer-events:none;opacity:0;transition:opacity .2s;font:600 13px/1.4 Georgia,serif;letter-spacing:.14em;color:#cdbf9e;text-shadow:0 1px 3px #000;text-align:center');
  }
  function mostrarSelo(txt) { if (!selo) return; selo.textContent = txt; selo.style.opacity = txt ? '.8' : '0'; }

  // --- sons procedurais curtos reaproveitando o sintetizador do motor
  function bater(freq, dur, peak, tipo = 'triangle') {
    try { if (!AC() || !audio) return; const t = now(), g = audio.saida(null, 0, 'sfx'); audio.env(g, t, .008, peak, dur); audio.osc(tipo, freq, t, dur + .05, g); } catch (e) {}
  }
  function coracao(forte) { // duas batidas "tum-tá"
    try { if (!AC() || !audio) return; const t = now(), g = audio.saida(null, 0, 'sfx'); const p = forte ? .5 : .28; audio.env(g, t, .01, p, .12); audio.osc('sine', 58, t, .18, g); const g2 = audio.saida(null, 0, 'sfx'); audio.env(g2, t + .22, .01, p * .8, .1); audio.osc('sine', 52, t + .22, .16, g2); } catch (e) {}
  }
  function assobio() { try { if (!AC() || !audio) return; const t = now(), g = audio.saida(null, 0, 'sfx'); audio.env(g, t, .05, .12, .5); const o = audio.osc('sine', 900, t, .6, g); if (o && o.frequency) { o.frequency.setValueAtTime(900, t); o.frequency.linearRampToValueAtTime(1500, t + .3); o.frequency.linearRampToValueAtTime(1100, t + .55); } } catch (e) {}
  }

  // estado interno
  let st = {
    heartT: 0, cor: 0,            // batimento do coração
    estatua: 0, estatuaDica: false, // "virar estátua"
    jaGritou: 0,                  // (reservado)
    tosseCd: -99, coracaoCd: -99,
    pareC: 0, pareCd: -99, pareAbuso: 0, pareAbusoEm: -99, pareDica: false,
    assobioCd: -99, assobioDica: false,
    olhosT: 0, olhosDica: false,
    bocaDica: false,
    congDica: false,
    yawAnt: 0, pitchAnt: 0,
    mascaraDica: false
  };

  // chamado do gancho F quando a luz apaga: se estava no bote, ele erra o bote
  let luzOffEm = -99;
  function boteLuz() { luzOffEm = perf(); }
  // lido por boteInspetor em jogo.js: a luz apagada no instante do bote faz ele passar reto
  function esquivouPelaLuz() { return perf() - luzOffEm < .55; }

  // --- "bater na parede": isca sem gastar garrafa. Chamado por jogo.js quando
  // você segura E encostada numa parede, sem alvo e sem porta por perto.
  function baterParede() {
    const s = S(); if (!s || s.hidden) return false;
    if (perf() - st.pareCd < 6) return false;
    st.pareCd = perf();
    // ponto do barulho: um pouco à frente, na parede que você encara
    const fx = P.pos.x - Math.sin(P.yaw) * 1.1, fz = P.pos.z - Math.cos(P.yaw) * 1.1;
    // a parede responde conforme o piso da sala: madeira soa seca, pedra/concreto soa cavo
    const piso = (P.room && P.room.piso) || 'concreto';
    const f = piso === 'madeira' ? 240 : piso === 'tapete' ? 150 : 180;
    bater(f, .14, .5); bater(f * .8, .18, .4);
    // abuso: três batidas em pouco tempo e ele desconfia e vem à SUA origem
    if (perf() - st.pareAbusoEm < 20) st.pareAbuso++; else st.pareAbuso = 1;
    st.pareAbusoEm = perf();
    const naOrigem = st.pareAbuso >= 3;
    emitNoise(naOrigem ? P.pos.x : fx, naOrigem ? P.pos.z : fz, naOrigem ? 7 : 6, true);
    marcarCausa('bateu');
    _distrairAna(1.4);  // o barulho também faz a Ana parar de contar por um instante
    if (!st.pareDica) { st.pareDica = true; toast('Você bateu de leve na parede. Ele vai investigar o barulho, não você — se não abusar.'); }
    else if (naOrigem) subPequeno('inspetor', '...de novo essa batida. É você.');
    return true;
  }

  function update(dt) {
    try { _update(dt); } catch (e) { /* nunca derruba o quadro */ }
  }

  function _update(dt) {
    if (!criado) ini();
    const s = S();
    if (!s || C.mode !== 'jogo' || C.ui || s.dead || s.fim) { mostrarSelo(''); if (vinheta) vinheta.style.opacity = '0'; return; }
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;
    const prende = !!P.prende;
    const parado = !P.vx && !P.vz ? true : Math.hypot(P.vx, P.vz) < .08;

    // ---------------------------------------------------------------
    // 1) Prender o ar tem fundo: a visão fecha em preto pelas bordas e o
    //    coração dispara conforme o fôlego (S.ar) acaba. Desligável.
    // ---------------------------------------------------------------
    let escuro = 0;
    if (prende) {
      const falta = clamp(1 - (s.ar === undefined ? 100 : s.ar) / 100, 0, 1);
      // só começa a pesar depois de ~1,5 s de ar gasto (abaixo de ~70%)
      const base = clamp((falta - .3) / .7, 0, 1);
      const pulso = .06 * Math.sin(perf() * (4 + falta * 7));
      escuro = Math.min(.9, base * .85 + (base > .05 ? pulso : 0));
      if (OPT.vFlash) escuro = Math.min(escuro, .34); // acessibilidade: "reduzir flashes" suaviza o escurecimento
    }
    if (vinheta) vinheta.style.opacity = escuro.toFixed(3);

    // batimento do coração: acelera com o medo e com o fôlego no fim; prender o ar o segura
    const medo = clamp((s.fear || 0) / 100, 0, 1), arFalta = clamp(1 - (s.ar ?? 100) / 100, 0, 1);
    const perto = M.ativo && dM < 6;
    let ritmo = perto ? (dM < 2.2 ? 2.6 : 1.5) : 0;
    ritmo += medo * .9 + (prende ? arFalta * 1.6 : 0);
    if (s.hidden) ritmo += (P.pulso || 0) / 100 * 1.2; // escondida, os nervos cheios aceleram a batida
    if (ritmo > .4 && AC() && (OPT.vol === undefined || OPT.vol > 0)) {
      st.heartT -= dt * ritmo;
      if (st.heartT <= 0) { st.heartT = 1; coracao(dM < 2 || arFalta > .7); if (dM < 2.2 && !prende) P.shake = Math.max(P.shake, .012); } // colado, a batida forte treme a mão de leve
    } else st.heartT = 0;

    _encarar(dt, dM);              // encarar o Inspetor acelera os nervos; desviar o olhar acalma
    _pinAna();                     // mantém a Ana travada depois de uma isca sonora
    if (s.hidden) { _escondida(dt, dM, prende); _estatua(0); _mascaraPasso(); st.pareC = 0; return; }
    _foraDoEsconderijo(dt, dM, parado, prende);
    _isca(dt, parado);
    _mascaraPasso();
  }

  // Encarar o Inspetor de perto faz os nervos subirem mais rápido; desviar o olhar dele acalma.
  const _fwd = THREE ? new THREE.Vector3() : null;
  function _encarar(dt, dM) {
    if (!M.ativo || dM > 7 || !_fwd) return;
    try {
      camera.getWorldDirection(_fwd);
      const vx = M.pos.x - P.pos.x, vz = M.pos.z - P.pos.z, l = Math.hypot(vx, vz) || 1;
      const dot = (_fwd.x * vx + _fwd.z * vz) / l;      // 1 = olhando direto para ele
      // sobe os nervos, mas nunca sozinho a ponto de arrancar o arquejo (o termo de proximidade do motor é que decide isso)
      if (dot > .6) { if ((P.pulso || 0) < 88) P.pulso = Math.min(88, (P.pulso || 0) + (7 - dM) * 4 * dt); if (dM < 2.6 && (P.pulso || 0) > 60) mostrarSelo('não encare ele'); }
      else if (dot < .1) P.pulso = Math.max(0, (P.pulso || 0) - 8 * dt);
    } catch (e) {}
  }

  // ---------------------------------------------------------------
  // 2) Escondida: o coração que ele ouve + a tosse de nervos
  // ---------------------------------------------------------------
  function _escondida(dt, dM, prende) {
    const s = S();
    // o coração alto (nervos cheios) colado nele vira um fio de ruído, a não ser que você prenda o ar
    if (M.ativo && dM < 2.4 && !prende) {
      const nervos = P.pulso || 0;
      if (nervos > 72 && perf() - st.coracaoCd > 2.2) {
        st.coracaoCd = perf();
        emitNoise(P.pos.x, P.pos.z, 1.4 + (nervos - 72) / 28 * 1.6, true); marcarCausa('coracao');
        if (dM < 1.8) mostrarSelo('seu coração está alto demais');
      }
    } else mostrarSelo('');
    // tosse de nervos: o pulso estoura escondida e muito perto -> tosse alta, a menos que prenda o ar a tempo
    // a janela é mais apertada no Pesadelo (tosse já com os nervos a 90) e mais folgada no Fácil
    const limiar = s.dif === 'pesadelo' ? 90 : s.dif === 'facil' ? 100 : 97;
    if ((P.pulso || 0) >= limiar && M.ativo && dM < 3 && !prende && perf() - st.tosseCd > 8) {
      st.tosseCd = perf(); P.pulso = 30;
      bater(320, .12, .4, 'sawtooth'); if (SFX && SFX.ofego) SFX.ofego();
      emitNoise(P.pos.x, P.pos.z, dM < 2 ? 6 : 4, true); marcarCausa('tosse');
      if (s.fear !== undefined) s.fear = Math.min(100, s.fear + 12); // a própria tosse te assusta
      toast('Você tossiu! Prenda a respiração quando os nervos estourarem.');
      subPequeno('lia', '(engoli a tosse tarde demais)');
    }
    // alívio: quando ele finalmente se afasta do esconderijo, a Lia solta o ar devagar e os nervos caem rápido
    if (M.ativo) {
      if (dM < 3) st.estavaColado = true;
      else if (st.estavaColado && dM > 6.5) { st.estavaColado = false; if (!prende) { if (SFX && SFX.ofego) SFX.ofego(); } P.pulso = Math.max(0, (P.pulso || 0) - 40); }
    }
  }

  // ---------------------------------------------------------------
  // 3) Virar estátua, mão na boca e fechar os olhos (fora do esconderijo)
  // ---------------------------------------------------------------
  function _foraDoEsconderijo(dt, dM, parado, prende) {
    const s = S();
    _estatua(dt, dM, parado);

    // parar de repente depois de correr derrapa: um passo arrastado audível
    const vel = Math.hypot(P.vx || 0, P.vz || 0);
    if ((st.velAnt || 0) > 3.6 && vel < 1.2 && perf() - (st.derrapaCd || -99) > 2) {
      st.derrapaCd = perf();
      if (SFX && SFX.passo) SFX.passo(.5, (P.room && P.room.piso) || 'concreto', !!(P.room && P.room.fora), !!P.naAgua);
      emitNoise(P.pos.x, P.pos.z, 3.5, true); marcarCausa('derrapa');
    }
    st.velAnt = vel;

    // mão na boca (automática): colado nele, parada e sem alcançar esconderijo, a Lia
    // abafa a respiração de pânico; some o arfar do medo alto enquanto cobre a boca
    const colado = M.ativo && M.state === 'caca' && dM < 1.6 && parado && !prende;
    if (colado) {
      P.ofegoT = 0; P.pulso = Math.min(P.pulso, 80);
      if (s.ar !== undefined) s.ar = Math.max(0, s.ar - dt * 8); // abafar com a mão cansa: gasta fôlego
      mostrarSelo(st.olhosT > 0 ? 'olhos fechados · mão na boca' : 'mão na boca');
      if (!st.bocaDica) { st.bocaDica = true; subPequeno('lia', '(a mão na boca, o ar preso... não respira)'); }
      st.coladoAnt = true;
    } else if (st.coladoAnt) { st.coladoAnt = false; if (SFX && SFX.ofego) SFX.ofego(); } // tira a mão da boca e solta um suspiro baixo

    // fechar os olhos: segurar Z e X juntos (as duas teclas de espiar). A Ana não se aproxima enquanto você não a vê
    // (invertido a seu favor): o módulo congela a posição dela quadro a quadro.
    // Em troca você fica cega ao Inspetor e ao caminho (tela preta).
    const querFechar = !!keys.KeyZ && !!keys.KeyX && !prende;
    st.olhosT = querFechar ? st.olhosT + dt : 0;
    if (querFechar) {
      if (vinheta) vinheta.style.opacity = Math.min(.98, Math.max(+vinheta.style.opacity || 0, .3 + Math.min(.68, st.olhosT * 1.2))).toFixed(3);
      if (ANA && ANA.ativa && !ANA.script && ANA.pos) {    // trava a Ana onde ela está
        if (!st.anaTrava) { st.anaTrava = ANA.pos.clone(); }
        else { ANA.pos.copy(st.anaTrava); if (ANA.path) ANA.path.length = 0; }
        if (!colado) mostrarSelo('olhos fechados — a Ana não se mexe');
      } else if (!colado) mostrarSelo('olhos fechados');
      if (!st.olhosDica) { st.olhosDica = true; toast('Segure Z e X juntos para fechar os olhos: a Ana não se aproxima — mas você fica cega a tudo.'); }
    } else st.anaTrava = null;

    // respiro fundo: agachada e parada, sem ameaça perto, a Lia recupera o fôlego e o medo mais rápido
    const semAmeaca = !(M.ativo && dM < 9) && !(ANA && ANA.ativa) && !(PROC && PROC.fase);
    if (P.crouch && parado && !prende && semAmeaca) {
      if (s.ar !== undefined) s.ar = Math.min(100, s.ar + dt * 10);
      if (s.fear > 0) s.fear = Math.max(0, s.fear - dt * 10);
    }

    // apontar a lanterna bem para o chão com a luz acesa espalha menos luz pelos cantos: o medo do escuro cede um pouco
    if (s.flashOn && P.pitch < -1.0) { if (s.fear > 0) s.fear = Math.max(0, s.fear - dt * 5); }
  }

  // ---------------------------------------------------------------
  // "Virar estátua": imóvel + agachada + lanterna apagada + perto de parede.
  // Enquanto nisso, o Inspetor em caça que passa rente não te acha (tateia e segue).
  // Qualquer movimento de câmera acima de um limiar quebra e vira um fio de ruído.
  // ---------------------------------------------------------------
  function _estatua(dt, dM, parado) {
    const s = S();
    if (!dt) { st.estatua = 0; P.estatua = 0; return; }
    const dYaw = Math.abs(Math.atan2(Math.sin(P.yaw - st.yawAnt), Math.cos(P.yaw - st.yawAnt)));
    const dPitch = Math.abs(P.pitch - st.pitchAnt);
    st.yawAnt = P.yaw; st.pitchAnt = P.pitch;
    const mira = (dYaw + dPitch) / Math.max(dt, 1e-3);          // velocidade angular da mira
    const condicao = parado && P.crouch && !s.flashOn && perto_de_parede();
    if (condicao) {
      // prender o ar junto faz você virar estátua mais rápido
      st.estatua = Math.min(1.2, st.estatua + dt * (P.prende ? 1.8 : 1));
      if (st.estatua >= 1 && mira > 1.6) { // micro-movimento denuncia
        st.estatua = .4; emitNoise(P.pos.x, P.pos.z, 1.6, true); marcarCausa('estatua');
      }
    } else st.estatua = Math.max(0, st.estatua - dt * 2);
    if (condicao && st.estatua > .35 && st.estatua < 1 && M.ativo && dM < 5) mostrarSelo('fique imóvel...'); // ainda virando sombra
    const ativa = st.estatua >= 1 && mira <= 1.6;
    P.estatua = ativa ? 1 : 0;     // lido por boteInspetor em jogo.js: segura o bote
    if (ativa) {
      if (s.fear > 0) s.fear = Math.max(0, s.fear - dt * 6); // de sangue-frio, o medo cede um pouco
      mostrarSelo('imóvel — ele não te vê');
      if (!st.estatuaDica && M.ativo && dM < 4) { st.estatuaDica = true; toast('Imóvel, agachada e no escuro contra a parede, você vira sombra. Não mexa nem a mira.'); }
    }
  }
  // Segurar E encostada numa parede, sem nada para interagir, bate de leve para iscar
  function _isca(dt, parado) {
    const livre = !C.alvo && !P.portaT && P.curaT <= 0 && P.pilhaT <= 0 && P.saidaT <= 0;
    if (keys.KeyE && livre && parado && perto_de_parede()) {
      st.pareC += dt;
      if (st.pareC > .5 && st.pareC - dt <= .5) { if (!baterParede()) st.pareC = -99; }
    } else st.pareC = 0;
  }
  const _vP = { x: 0, z: 0 };
  function perto_de_parede() {
    try {
      for (const c of W.colliders) {
        if (!c.on) continue;
        const cx = Math.max(c.minX, Math.min(P.pos.x, c.maxX)), cz = Math.max(c.minZ, Math.min(P.pos.z, c.maxZ));
        if (Math.hypot(P.pos.x - cx, P.pos.z - cz) < .85) return true;
      }
    } catch (e) {}
    return false;
  }

  // ---------------------------------------------------------------
  // 4) Som alto do mundo mascara seus passos (lido por mascaraSom em jogo.js
  //    via JGL5.mascara()): o sino e a chuva forte abafam o barulho.
  // ---------------------------------------------------------------
  function mascara() {
    const s = S(); let k = 1;
    try {
      if (PROC && PROC.fase) k *= .55;          // o rádio chiando e o sino da Procissão cobrem o barulho
      if (s && s.flags && s.flags.sino) k *= .7; // o sino da capela badalando na fuga final
    } catch (e) {}
    return k;
  }
  function _mascaraPasso() {
    const s = S();
    if (!st.mascaraDica && PROC && PROC.fase && M.ativo && !s.hidden) {
      st.mascaraDica = true; subPequeno('lia', '(o barulho da Procissão cobre meus passos)');
    }
  }

  // ---------------------------------------------------------------
  // 5) Assobiar (tecla J): um ponto de ruído na SUA posição. Longe dele,
  //    serve de isca; colado, é suicídio. Chamado por jogo.js no onKey.
  // ---------------------------------------------------------------
  function assobiar() {
    const s = S(); if (!s || s.hidden) return false;
    if (perf() - st.assobioCd < 5) return false;
    st.assobioCd = perf();
    assobio();
    emitNoise(P.pos.x, P.pos.z, M.ativo && M.pos.distanceTo(P.pos) < 6 ? 7 : 5, true); marcarCausa('assobio');
    _distrairAna(1.8);  // o assobio prende a atenção da Ana por um instante
    if (!st.assobioDica) { st.assobioDica = true; toast('Você assobiou. O barulho sai de onde você está — use de longe, nunca colada nele.'); }
    return true;
  }

  // iscas sonoras (bater na parede / assobiar) prendem a atenção da Ana: ela trava por um instante
  function _distrairAna(dur) {
    try { if (ANA && ANA.ativa && !ANA.script) { st.anaPauseAte = perf() + dur; st.anaPausePos = ANA.pos ? ANA.pos.clone() : null; if (typeof ANA.contaT === 'number') ANA.contaT = Math.max(ANA.contaT, dur); } } catch (e) {}
  }
  function _pinAna() {
    if (st.anaPauseAte && perf() < st.anaPauseAte && ANA && ANA.ativa && st.anaPausePos && ANA.pos) { ANA.pos.copy(st.anaPausePos); if (ANA.path) ANA.path.length = 0; }
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  return { ini, update, boteLuz, esquivouPelaLuz, baterParede, assobiar, mascara };
}
