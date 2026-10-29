// MONSTROS E IA, lote 5 — comportamentos novos, variações por capítulo, aparências piores,
// contra-jogos mais interessantes e perseguições memoráveis (A Hora do Silêncio).
// Tudo isolado num módulo só: o motor chama criarMonstrosLote5(E) uma vez e usa L5.tick(dt).
// O Inspetor ganha campos de gancho lidos pelo motor: M.l5velMul, M.l5ouvidoMul, M.l5stun, M.l5mudo.
// Nada aqui pode estourar: cada subsistema roda dentro de um try/catch.

export function criarMonstrosLote5(E) {
  const { THREE, W, P, M, MON, ANA, ANA_G, PROC, MAT, OPT, camera, scene, SX, SFX, D } = E;
  const S = () => E.S, AC = () => E.AC, perf = () => E.perf, flashPisca = () => E.flashPisca, ui = () => E.ui;
  const { roomAt, SALA, visivel, linhaLivre, distSalas, salaAdj, centroSala, pontoEm, planejar, collide, salasAlcancaveis,
          naLuz, prendendo, emitNoise, estourarLampada, setDoor, tremer, abafarMundo, iniciarAlerta, entrarCaca, falaInspetor, subPequeno, sub, toast, conquista, falar } = E;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.random() * a.length | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

  // ---- legenda própria (segue o estilo dos outros lotes)
  const leg = document.createElement('div'); leg.id = 'l5-leg';
  leg.style.cssText = 'position:fixed;left:50%;bottom:34%;transform:translateX(-50%);font:italic 15px Georgia,serif;color:#d6c6b2;text-shadow:0 0 6px #000,0 0 2px #000;pointer-events:none;z-index:6;opacity:0;transition:opacity .4s;text-align:center;max-width:80vw';
  document.body.appendChild(leg);
  let legT = 0; const legCd = {};
  function legenda(txt, k) {
    if (!txt || (OPT && OPT.legSom === 'nao')) return;
    const kk = k || txt; if ((legCd[kk] || -99) > perf() - 4) return; legCd[kk] = perf();
    leg.textContent = txt; leg.style.opacity = 1; legT = 2.6;
  }
  function liaDiz(flag, txt) { const s = S(); if (!s) return; s.flags = s.flags || {}; if (s.flags[flag]) return; s.flags[flag] = true; try { subPequeno('lia', txt); } catch (e) {} }

  // ---- nome digitado pela jogadora (o Inspetor "leu na ficha")
  const nomeJogador = () => { try { const n = JSON.parse(localStorage.getItem('hora-silencio-nome') || '""'); return typeof n === 'string' ? n.trim().slice(0, 16) : ''; } catch (e) { return ''; } };

  const seguro = fn => function (...a) { try { return fn.apply(null, a); } catch (e) { /* um subsistema nunca derruba o quadro */ } };

  // ---- estado do lote
  const L = {
    mapa: null, cap: -1, sinoVisto: false,
    rastro: [], rastroT: 0, aguaAnt: false, paradaT: 0,
    hbCount: 0, hbT: 0, duelo: 0,
    semVisaoT: 0, tateioCd: 0, despistaCd: 0, flancoCd: 0,
    falsaCd: 20, falsaT: 0, falsaTeste: false,
    paciencia: 0, pacienciaSala: null,
    pontoCego: false,
    proxCd: 0, proxDist: 9,
    visaoT: 0, visaoCd: 20, raioAnt: 0, luzAbertoCd: 0, nomeCd: 0, passosCd: 0,
    furiaLeg: false, bellPulseT: 0,
    casacoMat: null, anaBaseScale: ANA_G ? ANA_G.scale.x : 1
  };

  // =====================================================================
  // APARÊNCIA: a criatura piora capítulo a capítulo (mesmo modelo, só material)
  // =====================================================================
  function acharCasaco() {
    if (L.casacoMat || !MON || !MON.g) return;
    MON.g.traverse(o => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === 0x0b0b0c && !L.casacoMat) L.casacoMat = o.material; });
  }
  const aplicarAparencia = seguro(function () {
    acharCasaco();
    const cap = (S() || {}).chapter || 0;
    if (L.casacoMat) { // L5#brasa: rachaduras de brasa no corpo no capítulo final
      L.casacoMat.emissive = L.casacoMat.emissive || new THREE.Color(0, 0, 0);
      L.casacoMat.emissive.setHex(cap >= 5 ? 0x3a0a02 : cap >= 3 ? 0x140a06 : 0x000000);
      L.casacoMat.color.setHex(cap >= 3 ? 0x080807 : 0x0b0b0c); // L5#fuligem: casaco mais sujo/escuro do incêndio
    }
    if (MON && MON.faixa) MON.faixa.color.setHex(cap >= 5 ? 0x6b5a46 : cap >= 4 ? 0x9a8c70 : 0xbcae94); // L5#venda: a venda vai queimando
  });
  // fumaça fina subindo do casaco a partir do Cap IV
  let fumaca = null;
  function fumacaCap() {
    if (!scene) return;
    const cap = (S() || {}).chapter || 0, quer = cap >= 4 && M.ativo;
    if (quer && !fumaca) {
      const g = new THREE.BufferGeometry(); const n = 14, pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { pos[i * 3] = rand(-.12, .12); pos[i * 3 + 1] = rand(0, 1.1); pos[i * 3 + 2] = rand(-.12, .12); }
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const m = new THREE.PointsMaterial({ color: 0x4a4038, size: .09, transparent: true, opacity: .22, depthWrite: false });
      fumaca = new THREE.Points(g, m); scene.add(fumaca);
    } else if (!quer && fumaca) { scene.remove(fumaca); fumaca.geometry.dispose(); fumaca.material.dispose(); fumaca = null; }
    if (fumaca) { // L5#fumaca
      fumaca.position.set(MON.g.position.x, 2.6, MON.g.position.z);
      const p = fumaca.geometry.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) + .006; if (y > 1.2) y = 0; p.setY(i, y); } p.needsUpdate = true;
    }
  }

  // =====================================================================
  // PERSONALIDADE POR CAPÍTULO + faro de sangue + ponto cego → um multiplicador só
  // =====================================================================
  const personalidade = seguro(function (dt) {
    const s = S(); if (!s) return;
    const cap = s.chapter || 0, d = M.pos.distanceTo(P.pos);
    let vel = 1, ouv = 1;
    if (cap <= 1) { vel *= .88; ouv *= .84; }                 // L5#cap1: ainda domesticado, lento e tolerante
    if (cap === 2 && M.state !== 'caca') ouv *= 1.12;          // L5#cap2: em modo disciplina, reage mais rápido ao som
    if (cap === 3 && ANA.ativa) ouv *= .88;                    // L5#cap3: distraído enquanto a menina domina
    if (cap === 4 && P.naAgua) ouv *= 1.3;                     // L5#cap4: a água leva cada passo até ele
    if (cap >= 5) { vel *= 1.12; ouv *= 1.1; }                 // L5#cap5: solto, veloz e curvado
    // L5#sangue: ferida, a Lia ofega e ele sente de mais longe
    if (s.health > 0 && s.health < 30 && !s.hidden) { ouv *= 1.4; liaDiz('l5sangue', 'O sangue... ele sente o sangue.'); }
    // L5#pontocego: parada e muda exatamente nas costas dele, no rastro morto da audição
    L.pontoCego = false;
    if (!s.hidden && d < 1.7 && P.noiseR <= .01) {
      const fwx = Math.sin(M.yaw), fwz = Math.cos(M.yaw), vx = (P.pos.x - M.pos.x) / (d || 1), vz = (P.pos.z - M.pos.z) / (d || 1);
      if (fwx * vx + fwz * vz < -.5) { L.pontoCego = true; ouv *= .12; legenda('[nas costas dele]', 'pcego'); if (M.state === 'caca') { liaDiz('l5pcego', 'Bem atrás dele... ele não me ouve aqui.'); if (Math.random() < .01) try { falaInspetor(false, 'pontocego'); } catch (e) {} } }
    }
    M.l5velMul = vel; M.l5ouvidoMul = ouv;
    // L5#furia5: solto da capela ele não reza mais nem recua — fúria contínua na fuga
    if (cap >= 5 && s.flags && s.flags.sino && M.ativo) { M.furia = Math.max(M.furia, 1.5); if (!L.furiaLeg) { L.furiaLeg = true; legenda('[ele não para mais]', 'furia'); } }
  });

  // =====================================================================
  // SINO DO CLÍMAX: desliga o Inspetor e abre a fuga
  // =====================================================================
  const sino = seguro(function () {
    const s = S(); if (!s || !s.flags) return;
    if (s.flags.sino && !L.sinoVisto) { // L5#sino: a badalada o derruba de mãos nos ouvidos
      L.sinoVisto = true;
      if (M.ativo) { M.l5stun = 3.2; M.caidoT = Math.max(M.caidoT || 0, 1.2); }
      legenda('[o sino o paralisa]', 'sino'); try { falaInspetor(false, 'sino'); } catch (e) {}
      try { conquista('l5_sino'); } catch (e) {}
      // L5#todosolham: no toque do sino, todas as entidades param e te encaram
      if (ANA && ANA.ativa) { ANA.cool = Math.max(ANA.cool, 4); ANA.contaT = Math.max(ANA.contaT, 4); }
      if (PROC && PROC.fase === 'passando') PROC.pausa = Math.max(PROC.pausa, 2.5);
      legenda('[todos te olham]', 'todos');
    }
    if (!s.flags.sino) L.sinoVisto = false;
  });

  // =====================================================================
  // ESCURIDÃO QUE AVANÇA: na fuga, as lâmpadas estouram atrás de você conforme ele vem
  // =====================================================================
  const escuridao = seguro(function (dt) {
    const s = S(); if (!s || !s.flags || !s.flags.sino) return;
    if (M.state !== 'caca' || !estourarLampada || !W.lampadas) return;
    L.bellPulseT -= dt; if (L.bellPulseT > 0) return; L.bellPulseT = rand(.7, 1.2);
    // uma lâmpada acesa atrás da jogadora (entre ela e o Inspetor), a mais próxima dele
    const vx = P.pos.x - M.pos.x, vz = P.pos.z - M.pos.z, l = Math.hypot(vx, vz) || 1;
    let alvo = null, melhor = 1e9;
    for (const Lp of W.lampadas) {
      if (!Lp.ligada || Lp.estourou) continue;
      const rx = Lp.x - M.pos.x, rz = Lp.z - M.pos.z;
      if ((rx * vx + rz * vz) / l < 0) continue;            // só as que ficam na direção da jogadora
      const dm = Math.hypot(rx, rz); if (dm < melhor) { melhor = dm; alvo = Lp; }
    }
    if (alvo && melhor < 14) { estourarLampada(alvo); legenda('[o escuro te alcança]', 'escuro'); liaDiz('l5escuro', 'As luzes... estão apagando atrás de mim. Corre.'); }
  });

  // =====================================================================
  // RASTRO DE CHEIRO: correr deixa pegada quente que ele segue
  // =====================================================================
  const rastro = seguro(function (dt) {
    const s = S(); if (!s || s.hidden) { return; }
    // grava o caminho enquanto corre; agachada/parada quase não deixa
    L.rastroT -= dt;
    if (P.sprinting && L.rastroT <= 0) { L.rastroT = .4; L.rastro.push({ x: P.pos.x, z: P.pos.z, t: perf() }); if (L.rastro.length > 40) L.rastro.shift(); }
    // água apaga o rastro na hora
    if (P.naAgua && !L.aguaAnt && L.rastro.length) { L.rastro.length = 0; } L.aguaAnt = P.naAgua;
    // agachada e parada por 4 s: o rastro esfria
    if (P.crouch && P.noiseR <= .01) { L.paradaT += dt; if (L.paradaT > 4 && L.rastro.length) { L.rastro.length = 0; L.paradaT = 0; } } else L.paradaT = 0;
    // envelhece
    const agora = perf(); while (L.rastro.length && agora - L.rastro[0].t > 10) L.rastro.shift();
    // ele usa o rastro quando perdeu a pista na procura
    if (M.ativo && M.state === 'procura' && M.searchT < 2 && L.rastro.length > 3 && !M.l5rastroCd) {
      const alvo = L.rastro[Math.max(0, L.rastro.length - 6)];
      if (alvo && distSalas(roomAt(alvo.x, alvo.z), roomAt(M.pos.x, M.pos.z)) <= 2) {
        M.l5rastroCd = 6; if (planejar(M, alvo.x, alvo.z)) { M.state = 'investiga'; M.searchT = 0; legenda('[ele fareja o seu rastro]', 'rastro'); try { falaInspetor(false, 'rastro'); } catch (e) {} }
      }
    }
    M.l5rastroCd = Math.max(0, (M.l5rastroCd || 0) - dt);
  });

  // =====================================================================
  // PERDER DE VISTA: dobrar esquina e ficar em silêncio quebra a caçada
  // =====================================================================
  const visao = seguro(function (dt) {
    const s = S(); if (!s) return;
    if (M.state === 'caca' && !s.hidden) {
      const vendo = linhaLivre(M.pos, P.pos) && M.pos.distanceTo(P.pos) < 16;
      if (vendo || P.noiseR > .2) L.semVisaoT = 0; else L.semVisaoT += dt;
      // L5#despista: 3 s sem te ver e em silêncio → cai para procura no último ponto
      if (L.semVisaoT > 3 && L.despistaCd <= 0) {
        L.despistaCd = 12; L.semVisaoT = 0; M.state = 'procura'; M.searchT = rand(4, 6); M.achou = false;
        legenda('[ele te perdeu de vista]', 'perdeu'); liaDiz('l5perdeu', 'Se eu dobrar a esquina e calar a boca, ele me perde.');
        try { falaInspetor(true); } catch (e) {}
      }
      // L5#tateio: sem te ver há mais de 1,5 s, ele para e varre o escuro com os braços
      else if (L.semVisaoT > 1.5 && L.tateioCd <= 0 && M.pos.distanceTo(P.pos) < 8) {
        L.tateioCd = 10; M.wait = Math.max(M.wait, 2.2); M.l5mudo = 2.2;
        const a = Math.atan2(P.pos.x - M.pos.x, P.pos.z - M.pos.z) - M.yaw, da = Math.atan2(Math.sin(a), Math.cos(a));
        legenda('[ele tateia o escuro]', 'tateia');
        // dentro do cone de 50° à frente e perto: a mão alcança
        if (Math.abs(da) < .45 && M.pos.distanceTo(P.pos) < 2 && !s.hidden) { entrarCaca(); M.l5mudo = 0; }
      }
    } else { L.semVisaoT = 0; }
    L.despistaCd = Math.max(0, L.despistaCd - dt); L.tateioCd = Math.max(0, L.tateioCd - dt);
    M.l5mudo = Math.max(0, (M.l5mudo || 0) - dt);
  });

  // =====================================================================
  // FLANQUEIO: numa caçada longa ele corta caminho pela sua saída prevista
  // =====================================================================
  let jogAnt = null, jogDir = new THREE.Vector3();
  const flanco = seguro(function (dt) {
    const s = S(); if (!s) return;
    if (jogAnt) { jogDir.set(P.pos.x - jogAnt.x, 0, P.pos.z - jogAnt.z); }
    jogAnt = jogAnt || new THREE.Vector3(); jogAnt.copy(P.pos);
    L.flancoCd = Math.max(0, L.flancoCd - dt);
    if (M.state !== 'caca' || M.cacaT < 12 || L.flancoCd > 0 || s.hidden) return;
    if (jogDir.lengthSq() < .01) return;
    jogDir.normalize();
    const prev = new THREE.Vector3(P.pos.x + jogDir.x * 6, 0, P.pos.z + jogDir.z * 6);
    const salas = salasAlcancaveis(M.pos, { semFora: !W.def.inspetorFora });
    let alvo = null, melhor = 1e9;
    for (const r of salas) { if (r.seguro) continue; const c = centroSala(r), dd = dist(c, prev); if (dd < melhor && dd < 7) { melhor = dd; alvo = r; } }
    if (alvo && alvo !== P.room) { const [x, z] = pontoEm(alvo); if (planejar(M, x, z)) { L.flancoCd = 14; legenda('[ele cortou caminho]', 'flanco'); liaDiz('l5flanco', 'Ele conhece a casa. Está me cercando.'); } }
  });

  // =====================================================================
  // FALSA PARTIDA: na caçada ele dá dois passos e trava, testando seus nervos
  // =====================================================================
  const falsa = seguro(function (dt) {
    const s = S(); if (!s || s.hidden) return;
    L.falsaCd = Math.max(0, L.falsaCd - dt);
    if (M.state === 'caca' && L.falsaCd <= 0 && M.pos.distanceTo(P.pos) > 3 && M.pos.distanceTo(P.pos) < 9 && L.falsaT <= 0 && Math.random() < dt * .25) {
      L.falsaT = 1.6; L.falsaTeste = false; M.wait = Math.max(M.wait, 1.6); M.l5mudo = 1.6; L.falsaCd = 22;
      legenda('[ele parou de repente]', 'falsa');
    }
    if (L.falsaT > 0) {
      L.falsaT -= dt;
      if (!L.falsaTeste && P.sprinting) { L.falsaTeste = true; L.falsaT = 0; M.wait = 0; M.l5mudo = 0; try { entrarCaca(); } catch (e) {} legenda('[você correu — ele te achou]', 'falsapeg'); }
      else if (L.falsaT <= 0 && !L.falsaTeste) { M.recuo = Math.max(M.recuo, 4); legenda('[ele recuou, resmungando]', 'falsarec'); liaDiz('l5falsa', 'Ele fingiu. Se eu tivesse corrido...'); }
    }
  });

  // =====================================================================
  // MEDIDOR DE PACIÊNCIA: parada no armário muito tempo, ele faz uma varredura
  // =====================================================================
  const paciencia = seguro(function (dt) {
    const s = S();
    if (!s || !s.hidden || !M.ativo) { L.paciencia = 0; return; }
    const mesma = salaAdj(roomAt(M.pos.x, M.pos.z), P.room);
    if (!mesma || ['fareja', 'vasculha', 'agarra'].includes(M.state)) { L.paciencia = Math.max(0, L.paciencia - dt * .5); return; }
    const vel = s.dif === 'pesadelo' ? 1 / 16 : 1 / 25;
    L.paciencia += dt * vel;
    if (L.paciencia >= 1 && M.farejaCd <= 0 && W.lockers && S().hidden) { // varre do mais perto ao mais longe
      L.paciencia = .2;
      const alvo = W.lockers.filter(Lk => salaAdj(roomAt(Lk.x, Lk.z), P.room)).sort((a, b) => Math.hypot(a.x - M.pos.x, a.z - M.pos.z) - Math.hypot(b.x - M.pos.x, b.z - M.pos.z))[0];
      if (alvo) { const fx = alvo.x + alvo.face[0] * .95, fz = alvo.z + alvo.face[1] * .95; if (planejar(M, fx, fz)) { M.state = 'procura'; M.searchT = 3; M.favCheck = false; legenda('[ele vai abrir um por um]', 'pac'); try { falaInspetor(false, 'paciencia'); } catch (e) {} liaDiz('l5pac', 'Ele não vai cansar. Preciso trocar de lugar.'); } }
    }
    // um barulho noutra sala zera a paciência: a Lia aprende a jogar a isca
    if (P.noiseR > 2 && !salaAdj(roomAt(P.pos.x, P.pos.z), roomAt(M.pos.x, M.pos.z))) L.paciencia = 0;
  });

  // =====================================================================
  // ESCONDERIJO: ele cola o ouvido e conta as batidas do seu coração
  // =====================================================================
  const coracao = seguro(function (dt) {
    const s = S();
    if (!s || !s.hidden || M.state === 'caca') { L.hbCount = 0; return; }
    const d = M.pos.distanceTo(P.pos);
    if (d < 2.4 && s.fear > 80 && !['fareja', 'vasculha', 'agarra'].includes(M.state)) {
      if (prendendo()) { L.hbCount = 0; L.hbT = 0; return; }   // prender o ar no ritmo certo zera a contagem
      L.hbT -= dt;
      if (L.hbT <= 0) {
        L.hbT = 1; L.hbCount++;
        const num = ['', 'um...', 'dois...', 'três...', 'quatro...', 'cinco'][Math.min(5, L.hbCount)];
        if (num) { try { sub('inspetor', num); } catch (e) {} }
        if (L.hbCount >= 5) { L.hbCount = 0; M.achou = true; M.certo = false; legenda('[ele contou até cinco]', 'cinco'); liaDiz('l5cor', 'Ele conta meu coração. Segura o ar no ritmo dele.'); }
      }
    } else { L.hbCount = Math.max(0, L.hbCount - dt); L.hbT = 0; }
  });

  // =====================================================================
  // DUELO DE FÔLEGO: colado em você no armário, ele também fica mudo esperando
  // (o M.l5mudo já cala os estalos; aqui só a leitura e a legenda)
  // =====================================================================
  const duelo = seguro(function (dt) {
    const s = S();
    if (!s || !s.hidden || M.state === 'caca') { L.duelo = 0; return; }
    const d = M.pos.distanceTo(P.pos);
    if (d < 2.6 && prendendo() && ['fareja', 'vasculha'].includes(M.state)) { L.duelo += dt; M.l5mudo = Math.max(M.l5mudo || 0, .3); if (L.duelo > .4) legenda('[ele também parou de respirar]', 'duelo'); }
    else L.duelo = 0;
  });

  // =====================================================================
  // CEMITÉRIO ABERTO (Cap V): o relâmpago o faz enxergar, a luz o atrai de longe
  // =====================================================================
  const aberto = seguro(function (dt) {
    const s = S(); if (!s || (s.chapter || 0) < 5 || !M.ativo) return;
    const fora = P.room && P.room.fora, d = M.pos.distanceTo(P.pos);
    // L5#relampago: no clarão, correndo na linha dele, ele te vê
    const raio = E.raioI || 0;
    if (fora && raio > .18 && L.raioAnt <= .18 && P.sprinting && d < 18 && linhaLivre(M.pos, P.pos)) {
      if (M.state !== 'caca') { iniciarAlerta(); try { falaInspetor(false, 'enxergo'); } catch (e) {} } legenda('[o relâmpago o fez te ver]', 'raio'); liaDiz('l5raio', 'No clarão ele me vê. Fico parada atrás da pedra.');
    }
    L.raioAnt = raio;
    // L5#luzaberto: no aberto a luz da lanterna chama de longe
    L.luzAbertoCd = Math.max(0, L.luzAbertoCd - dt);
    if (fora && S().flashOn && !flashPisca() && d < 20 && M.state !== 'caca' && L.luzAbertoCd <= 0 && linhaLivre(M.pos, P.pos)) {
      L.luzAbertoCd = 4; M.olhar = P.pos.clone(); M.olharT = 1.5; M.ultimo = P.pos.clone(); if (M.state !== 'investiga') { M.state = 'investiga'; M.acao = null; planejar(M, P.pos.x, P.pos.z); } legenda('[ele viu a luz]', 'luzab');
    }
    // L5#venda: de vez em quando a venda queimada escorrega e ele "enxerga" um cone curto
    L.visaoCd = Math.max(0, L.visaoCd - dt);
    if (L.visaoCd <= 0 && L.visaoT <= 0 && Math.random() < dt * .06 && M.state === 'caca') { L.visaoT = 5; L.visaoCd = 40; legenda('[a venda escorregou]', 'vcai'); }
    if (L.visaoT > 0) {
      L.visaoT -= dt;
      const a = Math.atan2(P.pos.x - M.pos.x, P.pos.z - M.pos.z) - M.yaw, da = Math.atan2(Math.sin(a), Math.cos(a));
      if (d < 7 && Math.abs(da) < .5 && linhaLivre(M.pos, P.pos) && !s.hidden) { M.ultimo = P.pos.clone(); if (M.replan > 0) M.replan = 0; }
    }
  });

  // =====================================================================
  // PSICOLÓGICO: o nome na ficha e os passos contados
  // =====================================================================
  const psique = seguro(function (dt) {
    const s = S(); if (!s) return;
    L.nomeCd = Math.max(0, L.nomeCd - dt); L.passosCd = Math.max(0, L.passosCd - dt);
    const d = M.pos.distanceTo(P.pos);
    // L5#nome: colado no escuro e parada, ele sussurra o seu nome
    if (!s.hidden && d < 3 && P.noiseR <= .01 && !S().flashOn && L.nomeCd <= 0 && M.state !== 'patrulha') {
      const nome = nomeJogador();
      if (nome && nome.toUpperCase() !== 'LIA' && (s.flags.l5nomeCap !== s.chapter)) {
        s.flags.l5nomeCap = s.chapter; L.nomeCd = 60; try { sub('inspetor', '...' + nome + '?'); } catch (e) {}
      } else if (L.nomeCd <= 0 && Math.random() < dt * .3) { L.nomeCd = 40; try { falaInspetor(false, 'nome'); } catch (e) {} }
    }
    // L5#passos: numa caçada longa ele conta os seus passos em voz alta
    if (M.state === 'caca' && M.cacaT > 8 && (s.chapter || 0) >= 2 && L.passosCd <= 0 && P.sprinting) {
      L.passosCd = rand(6, 10); const n = 30 + (Math.random() * 20 | 0); try { sub('inspetor', '...' + n + ' passos... ' + (n + 1) + '...'); } catch (e) {}
    }
  });

  // =====================================================================
  // PROXIMIDADE: um tique elétrico quando ele chega na sala vizinha
  // =====================================================================
  const proximidade = seguro(function (dt) {
    const s = S(); if (!s || s.hidden) { L.proxDist = 9; return; }
    const d = M.pos.distanceTo(P.pos);
    L.proxCd = Math.max(0, L.proxCd - dt);
    if (L.proxDist > 6 && d <= 6 && d > 2 && M.state !== 'caca' && L.proxCd <= 0 && salaAdj(roomAt(M.pos.x, M.pos.z), P.room)) {
      L.proxCd = 8; try { SFX.clique && SFX.clique(); } catch (e) {} legenda('[ele está perto]', 'prox');
    }
    L.proxDist = d;
  });

  // =====================================================================
  // A ANA: variações por capítulo, aparência pior, cabeça impossível, a delatora
  // =====================================================================
  let anaBurro = 0;
  const ana = seguro(function (dt) {
    if (!ANA || !ANA.ativa || !ANA_G) return;
    const s = S(); if (!s) return;
    const cap = s.chapter || 0, U = ANA_G.userData;
    // L5#anasuja: nos túneis e no cemitério ela está encardida e molhada
    if (U && U.cabG) { const camisola = ANA_G.children.find(c => c.material && c.material.color);
      // tinge a camisola conforme o mapa (uma vez por mapa)
      if (L.anaMapa !== W.mapa) { L.anaMapa = W.mapa; const suja = W.mapa === 'tuneis' || W.mapa === 'cemiterio';
        ANA_G.traverse(o => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === 0xa8a294) o.material.color.setHex(suja ? 0x6f6a5c : 0xa8a294); }); }
    }
    // L5#anacresce: cada captura na mesma noite a deixa mais alta e a voz mais grave
    const esc = clamp(1 + (ANA.pegos || 0) * .12, 1, 1.5);
    ANA_G.scale.setScalar(L.anaBaseScale * esc);
    // L5#anacabeca: encarada tempo demais, a cabeça gira além do humano (updateAna já redefiniu a rotação neste quadro)
    if (ANA.encaraT > 7 && U && U.cabG) U.cabG.rotation.y += clamp((ANA.encaraT - 7) * .5, 0, Math.PI);
    // L5#anaouve: no Pesadelo ela também te ouve — correr perto a puxa mesmo no escuro
    if (s.dif === 'pesadelo' && !ANA.vista && !ANA.script && P.sprinting && ANA.pos.distanceTo(P.pos) < 9) {
      anaBurro -= dt; if (anaBurro <= 0) { anaBurro = 1.5; const v = new THREE.Vector3(P.pos.x - ANA.pos.x, 0, P.pos.z - ANA.pos.z); if (v.length() > 1.6) { v.normalize(); const n = ANA.pos.clone().addScaledVector(v, 1.2); collide(n, .25); if (salaAdj(roomAt(n.x, n.z), roomAt(ANA.pos.x, ANA.pos.z))) ANA.pos.copy(n); } liaDiz('l5anaouve', 'Aqui ela ouve igual a ele. Não posso correr.'); }
    }
    // L5#anaentrega: perto do Inspetor, no fim da contagem ela aponta e ele vem
    if (M.ativo && !ANA.script && ANA.conta >= 8 && M.pos.distanceTo(ANA.pos) < 12 && !s.flags.l5anaEntregaCd) {
      s.flags.l5anaEntregaCd = true; setTimeout(() => { if (s.flags) s.flags.l5anaEntregaCd = false; }, 30000);
      M.ultimo = P.pos.clone(); if (M.state !== 'caca') { try { iniciarAlerta(); } catch (e) {} } legenda('[ACHEI! — ela apontou]', 'anaent'); try { sub('ana', 'Achei! Ele tá ali!'); } catch (e) {} liaDiz('l5anaent', 'Ela me entregou pra ele.');
    }
  });

  // =====================================================================
  // TELLS por transição de estado: dá para saber o que ele faz só de ouvir/ler
  // =====================================================================
  let prevState = null, prevFuria = 0, prevSala = null, prevSocos = 0;
  const tells = seguro(function (dt) {
    const s = S(); if (!s) return;
    if (M.state !== prevState) {
      if (M.state === 'alerta') legenda('[as chaves se calam]', 'chaves');                  // L5#chaves
      else if (M.state === 'escuta') legenda('[ele parou para ouvir]', 'escuta');            // L5#escutaleg
      else if (M.state === 'emboscada') legenda('[ele fingiu ir embora]', 'emb');            // L5#embleg
      else if (M.state === 'fareja') { legenda('[dedos tateiam a fresta — prenda o ar]', 'dedos'); try { SX.arrastoAr && SX.arrastoAr(M.pos); } catch (e) {} } // L5#dedos
      else if (M.state === 'caca' && prevState !== 'bote') legenda('[ele está caçando]', 'caca'); // L5#cacaleg
      if (prevState === 'fareja' && M.state === 'procura') { legenda('[ele marcou esse lugar]', 'marcou'); liaDiz('l5marcou', 'Ele decorou esse esconderijo. Melhor variar.'); } // L5#marcou
      prevState = M.state;
    }
    if (M.furia > 0 && prevFuria <= 0) legenda('[ele está furioso]', 'furialeg');             // L5#furialeg
    prevFuria = M.furia;
    // L5#fungada: ao entrar numa sala nova procurando, ele cheira o ar
    const ra = roomAt(M.pos.x, M.pos.z);
    if (ra !== prevSala) { if (['procura', 'investiga'].includes(M.state) && M.ativo && !s.hidden && M.pos.distanceTo(P.pos) < 14) { try { SX.fungada && SX.fungada(M.pos); } catch (e) {} legenda('[ele está cheirando o ar]', 'fungleg'); } prevSala = ra; }
    // L5#contaporta: antes de arrombar a porta ele conta grave "três... dois..."
    if (M.socos > prevSocos && M.state === 'caca') { const n = ['', 'três...', 'dois...', 'um...'][Math.min(3, M.socos)]; if (n) try { sub('inspetor', n); } catch (e) {} }
    prevSocos = M.socos || 0;
    // L5#fecha: entrando caçando na sua sala, ele fecha a porta por onde você entrou
    if (M.state === 'caca' && setDoor && W.doors && ra === P.room && !L.fechaCd) {
      const dr = W.doors.find(d => d.open && d.id !== 'main' && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 3 && Math.hypot(d.x - M.pos.x, d.z - M.pos.z) < 3);
      if (dr) { L.fechaCd = 18; setDoor(dr, false, true); try { SFX.pancada && SFX.pancada(dr.x, dr.z); } catch (e) {} legenda('[ele fechou atrás de mim]', 'fecha'); }
    }
    L.fechaCd = Math.max(0, (L.fechaCd || 0) - dt);
  });

  // =====================================================================
  // EXTRAS por quadro: corpo, cantiga mentirosa, surdez no clarão, patrulha
  // =====================================================================
  let patrulhaCd = 0;
  const extras = seguro(function (dt) {
    const s = S(); if (!s) return;
    const d = M.pos.distanceTo(P.pos);
    // L5#nuca: colada no armário com ele em cima, um sopro na nuca
    if (s.hidden && d < 1.6 && Math.random() < dt * .25 && M.state !== 'caca') { try { SX.respiracaoNuca && SX.respiracaoNuca(); } catch (e) {} }
    // L5#pescoco: na caçada, quando ele vira a cabeça depressa, o pescoço estica além do humano
    if (MON && MON.cabeca) MON.cabeca.position.y = lerp(MON.cabeca.position.y || .62, (M.state === 'caca' && M.olharT > .8) ? .78 : .62, Math.min(1, dt * 6));
    // L5#cantiga: raramente, na caçada, a caixinha não para — ela só fica mais rápida
    if (M.state === 'caca' && d < 10 && Math.random() < dt * .03) { try { SX.cantarola && SX.cantarola(M.pos); } catch (e) {} legenda('[a cantiga não parou...]', 'cantmente'); }
    // L5#surdez: no clarão do relâmpago/trovão ele cobre o rosto e não ouve por um instante
    if ((E.raioI || 0) > .22 && M.state !== 'caca') { M.l5ouvidoMul = (M.l5ouvidoMul || 1) * .45; legenda('[no trovão ele não ouve]', 'surdez'); liaDiz('l5surdez', 'No trovão ele fica surdo por um instante.'); }
    // L5#escuro: no escuro total, parada, ele tateia o lado errado e te perde mais rápido
    if (M.state === 'caca' && !S().flashOn && !P.sprinting && !s.hidden) M.l5ouvidoMul = (M.l5ouvidoMul || 1) * .7;
    // L5#virou: ele virou a cabeça para você no meio da caçada
    if (M.state === 'caca' && M.olharT > 1 && M.olhar && dist(M.olhar, P.pos) < 2) legenda('[ele virou para você]', 'virou');
    // L5#patrulha: longe, na patrulha, ele murmura a chamada das camas
    patrulhaCd -= dt;
    if (M.state === 'patrulha' && d > 16 && patrulhaCd <= 0 && Math.random() < dt * .4) { patrulhaCd = rand(18, 30); try { sub('inspetor', pick(['Trinta e sete camas. Trinta e sete.', 'Todos dormindo. Todos quietos.', 'Uma cama vazia. Sempre tem uma.'])); } catch (e) {} }
    // L5#favproativo: na patrulha ele vai esperar de pé na frente do armário que você mais usou
    if (M.state === 'patrulha' && !M.path.length && !M.l5favCd && W.lockers && s.flags && s.flags.escUso) {
      const uso = s.flags.escUso;
      const fav = W.lockers.find((Lk, i) => (uso[W.mapa + ':' + i] || 0) >= 3 && Math.hypot(Lk.x - M.pos.x, Lk.z - M.pos.z) < 13 && salaAdj(roomAt(Lk.x, Lk.z), roomAt(M.pos.x, M.pos.z)));
      if (fav && Math.random() < .5) { const fx = fav.x + fav.face[0] * .95, fz = fav.z + fav.face[1] * .95; if (planejar(M, fx, fz)) { M.l5favCd = 30; M.wait = 3; liaDiz('l5fav', 'Ele está rondando o meu armário preferido. Preciso de outro.'); } }
    }
    M.l5favCd = Math.max(0, (M.l5favCd || 0) - dt);
    // L5#cap3teto: no Cap III, o corpo some e sobram pancadas no teto e na escada
    if ((s.chapter || 0) === 3 && (!M.ativo || M.pos.distanceTo(P.pos) > 16)) { L.tetoCd = (L.tetoCd || rand(20, 40)) - dt; if (L.tetoCd <= 0) { L.tetoCd = rand(25, 45); try { SX.passoCima && SX.passoCima(P.pos); } catch (e) {} legenda('[passos no teto]', 'teto3'); } }
    // L5#dequatro: no clímax, de quatro — o corpo cai mais para a frente
    if ((s.chapter || 0) >= 5 && s.flags && s.flags.sino && M.state === 'caca' && MON && MON.g) MON.g.rotation.x = lerp(MON.g.rotation.x, .5, Math.min(1, dt * 5));
  });

  // =====================================================================
  // ANA e PROCISSÃO — toques extras
  // =====================================================================
  let anaGotas = null;
  const anaExtra = seguro(function (dt) {
    const s = S();
    // L5#anapinga: presa no teto, gotas caem marcando onde ela vai cair
    if (ANA && ANA.ativa && ANA.teto && scene) {
      if (!anaGotas) { const g = new THREE.BufferGeometry(); const n = 6, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rand(-.1, .1); pos[i * 3 + 1] = rand(0, 3); pos[i * 3 + 2] = rand(-.1, .1); } g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); anaGotas = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x3a4a50, size: .05, transparent: true, opacity: .6, depthWrite: false })); scene.add(anaGotas); }
      anaGotas.visible = true; anaGotas.position.set(ANA.pos.x, 0, ANA.pos.z);
      const p = anaGotas.geometry.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) - dt * 2.2; if (y < 0) y = 3; p.setY(i, y); } p.needsUpdate = true;
      legenda('[pingando do teto... olhe para cima]', 'pinga');
    } else if (anaGotas) anaGotas.visible = false;
    // L5#anaregressiva: bem perto e no fim da conta, os últimos números estouram rápido
    if (ANA && ANA.ativa && !ANA.script && ANA.conta >= 8 && ANA.pos.distanceTo(P.pos) < 1.8) { ANA.contaT = Math.min(ANA.contaT, .3); }
    // L5#proccara: quando a fila para no seu esconderijo, os olhos vermelhos param em você
    if (PROC && PROC.olhos > 0) legenda('[não respira... eles pararam na fresta]', 'proccara');
  });

  // =====================================================================
  // EXTRAS 3: a escuta total, o fôlego medido, luz apagada ao passar, dueto com a Ana
  // =====================================================================
  let vacuoCd = 35, hideCount = 0, peleMat = null, estaloVirouCd = 0, blocoCd = 25, duetoCd = 0, procEntregaCd = 0;
  const extras3 = seguro(function (dt) {
    const s = S(); if (!s) return;
    const d = M.pos.distanceTo(P.pos);
    // L5#vacuo: uma vez por capítulo ele ergue a mão e todo o som some por 3 s — qualquer ruído = caçada
    vacuoCd -= dt;
    if (vacuoCd <= 0 && M.ativo && M.state !== 'caca' && !s.hidden && d < 12 && !s.flags['l5vacuoCap' + s.chapter]) {
      s.flags['l5vacuoCap' + s.chapter] = true; vacuoCd = 60; L.vacuoT = 3; M.l5mudo = 3; if (abafarMundo) try { abafarMundo(.1, 3); } catch (e) {} legenda('[silêncio... não se mexa]', 'vacuo'); liaDiz('l5vacuo', 'Ele levantou a mão. O mundo inteiro parou. Não respira.');
    }
    if (L.vacuoT > 0) { L.vacuoT -= dt; M.l5mudo = Math.max(M.l5mudo || 0, .3); if (P.noiseR > .5 && !s.hidden) { L.vacuoT = 0; try { entrarCaca(); } catch (e) {} } }
    // L5#folego: depois de dois esconderijos na noite, ele espera um pouco mais antes de desistir do armário
    if (M.state === 'fareja' && L.pf !== 'fareja' && hideCount >= 2) { M.farejaT = Math.max(M.farejaT, 3.6); }
    L.pf = M.state;
    if (s.hidden && !L.contouHide) { L.contouHide = true; hideCount++; } if (!s.hidden) L.contouHide = false;
    // L5#apagaluz: na caçada ele apaga a lâmpada bem à frente ao passar
    if (M.state === 'caca' && estourarLampada && W.lampadas && (s.chapter || 0) < 5 && !L.apagaCd) {
      const fwx = Math.sin(M.yaw), fwz = Math.cos(M.yaw);
      const alvo = W.lampadas.find(Lp => Lp.ligada && !Lp.estourou && Math.hypot(Lp.x - M.pos.x, Lp.z - M.pos.z) < 2 && ((Lp.x - M.pos.x) * fwx + (Lp.z - M.pos.z) * fwz) > 0);
      if (alvo) { L.apagaCd = 5; estourarLampada(alvo); legenda('[ele apaga a luz]', 'apaga'); }
    }
    L.apagaCd = Math.max(0, (L.apagaCd || 0) - dt);
    // L5#maos4: mãos queimadas a partir do Cap IV (tinge a pele uma vez)
    if (!peleMat && MON && MON.g) MON.g.traverse(o => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === 0x4a4038 && !peleMat) peleMat = o.material; });
    if (peleMat) peleMat.color.setHex((s.chapter || 0) >= 4 ? 0x3a2a22 : 0x4a4038);
    // L5#estalovira: ele estala duas vezes quando trava a cabeça na sua direção na caçada
    estaloVirouCd = Math.max(0, estaloVirouCd - dt);
    if (M.state === 'caca' && M.olharT > 1.2 && M.olhar && dist(M.olhar, P.pos) < 2 && estaloVirouCd <= 0) { estaloVirouCd = 3; try { SX.estalo && SX.estalo(M.pos, 1, true); } catch (e) {} }
    // L5#bloqueio: fora da caçada ele às vezes fica parado de costas no meio de um corredor
    blocoCd -= dt;
    if (blocoCd <= 0 && M.state === 'patrulha' && M.path.length && d < 14 && Math.random() < dt * .3) { blocoCd = rand(30, 50); M.wait = Math.max(M.wait, rand(3, 5)); legenda('[ele parou no corredor, de costas]', 'bloco'); liaDiz('l5bloco', 'Ele está parado no corredor. Tenho que dar a volta.'); }
    // L5#dueto: no Cap III, com a Menina contando, ele repete os números baixinho
    duetoCd = Math.max(0, duetoCd - dt);
    if ((s.chapter || 0) === 3 && ANA && ANA.ativa && M.ativo && ANA.conta >= 3 && duetoCd <= 0 && M.pos.distanceTo(ANA.pos) < 14) { duetoCd = rand(3, 6); const nums = ['um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']; try { sub('inspetor', nums[Math.min(8, ANA.conta - 1)] + '...'); } catch (e) {} }
    // L5#procentrega: luz acesa quando a fila passa perto e você está fora do esconderijo chama o Inspetor
    procEntregaCd = Math.max(0, procEntregaCd - dt);
    if (PROC && PROC.fase === 'passando' && !s.hidden && S().flashOn && !flashPisca() && M.ativo && M.state !== 'caca' && PROC.pos.distanceTo(P.pos) < 7 && procEntregaCd <= 0) {
      procEntregaCd = 20; M.ultimo = P.pos.clone(); try { iniciarAlerta(); } catch (e) {} legenda('[uma criança apontou para você]', 'procent');
    }
    // L5#medoana: medo alto acelera a contagem da Menina
    if (ANA && ANA.ativa && !ANA.script && s.fear > 80) ANA.contaT = Math.min(ANA.contaT, ANA.contaT * .85);
  });

  // =====================================================================
  // tick
  // =====================================================================
  function tick(dt) {
    if (legT > 0) { legT -= dt; if (legT <= 0) leg.style.opacity = 0; }
    const s = S(); if (!s || s.dead) { M.l5velMul = 1; M.l5ouvidoMul = 1; return; }
    if (L.cap !== s.chapter || L.mapa !== W.mapa) { L.cap = s.chapter; L.mapa = W.mapa; L.furiaLeg = false; L.sinoVisto = !!(s.flags && s.flags.sino); L.rastro.length = 0; aplicarAparencia(); }
    personalidade(dt);
    sino();
    escuridao(dt);
    rastro(dt);
    visao(dt);
    flanco(dt);
    falsa(dt);
    paciencia(dt);
    coracao(dt);
    duelo(dt);
    aberto(dt);
    psique(dt);
    proximidade(dt);
    ana(dt);
    tells(dt);
    extras(dt);
    extras3(dt);
    anaExtra(dt);
    fumacaCap();
    // pose do atordoamento: cabeça tombada, mãos subindo para os ouvidos
    if (M.l5stun > 0 && MON && MON.g) {
      MON.g.rotation.x = lerp(MON.g.rotation.x, .5, Math.min(1, dt * 6));
      if (MON.cabeca) MON.cabeca.rotation.z = lerp(MON.cabeca.rotation.z, 1.1, Math.min(1, dt * 6));
      if (MON.armL) MON.armL.rotation.x = lerp(MON.armL.rotation.x, -2.4, Math.min(1, dt * 8));
      if (MON.armR) MON.armR.rotation.x = lerp(MON.armR.rotation.x, -2.4, Math.min(1, dt * 8));
    }
  }

  return { tick: seguro(tick) };
}
