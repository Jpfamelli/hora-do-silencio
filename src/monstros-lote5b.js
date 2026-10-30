// MONSTROS E IA, lote 5 — SEGUNDA RODADA (A Hora do Silêncio).
// Mais comportamentos, perseguições, aparências e contra-jogos do Inspetor (e da Ana/Procissão),
// sem repetir o que o monstros-lote5.js já faz. Tudo isolado: o motor chama criarMonstrosLote5B(E)
// uma vez e usa L5B.tick(dt), logo depois de L5.tick. Nada aqui pode estourar o quadro.
// Campos de gancho extras no Inspetor, com prefixo l5b (M.l5bVisaoT, M.l5bAgua...) e os já lidos
// pelo motor (M.l5velMul, M.l5ouvidoMul, M.l5mudo, M.l5stun).

export function criarMonstrosLote5B(E) {
  const { THREE, W, P, M, MON, VULTO, ANA, ANA_G, PROC, MAT, OPT, camera, scene, SX, SFX, D, AG } = E;
  const S = () => E.S, perf = () => E.perf, flashPisca = () => E.flashPisca, ui = () => E.ui, raioI = () => E.raioI || 0;
  const { roomAt, SALA, visivel, linhaLivre, distSalas, salaAdj, centroSala, pontoEm, planejar, collide, salasAlcancaveis,
          naLuz, prendendo, emitNoise, estourarLampada, setDoor, tremer, abafarMundo,
          iniciarAlerta, entrarCaca, agarrar, falaInspetor, subPequeno, sub, toast, conquista, falar } = E;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.random() * a.length | 0];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const seguro = fn => function (...a) { try { return fn.apply(null, a); } catch (e) { /* um subsistema nunca derruba o quadro */ } };
  const flashOn = () => { const s = S(); return !!(s && s.flashOn); };

  // ---- legenda própria (abaixo da do L5, para não cobrir)
  const leg = document.createElement('div'); leg.id = 'l5b-leg';
  leg.style.cssText = 'position:fixed;left:50%;bottom:40%;transform:translateX(-50%);font:italic 15px Georgia,serif;color:#cdbda8;text-shadow:0 0 6px #000,0 0 2px #000;pointer-events:none;z-index:6;opacity:0;transition:opacity .4s;text-align:center;max-width:80vw';
  document.body.appendChild(leg);
  let legT = 0; const legCd = {};
  function legenda(txt, k) {
    if (!txt || (OPT && OPT.legSom === 'nao')) return;
    const kk = k || txt; if ((legCd[kk] || -99) > perf() - 4) return; legCd[kk] = perf();
    leg.textContent = txt; leg.style.opacity = 1; legT = 2.6;
  }
  function liaDiz(flag, txt) { const s = S(); if (!s) return; s.flags = s.flags || {}; if (s.flags[flag]) return; s.flags[flag] = true; try { subPequeno('lia', txt); } catch (e) {} }
  function diz(txt) { try { sub('inspetor', txt); } catch (e) {} }
  const nomeJogador = () => { try { const n = JSON.parse(localStorage.getItem('hora-silencio-nome') || '""'); return typeof n === 'string' ? n.trim().slice(0, 16) : ''; } catch (e) { return ''; } };

  const L = {
    cap: -1, mapa: null,
    // tique da noite
    tique: null,
    // estátua / imobilidade
    estatuaT: 0, estatuaCd: 0, imovelMed: 0, imovelCd: 0,
    // garrafa
    garrAnt: 0, garrN: {}, iscaCd: 0,
    // fúria
    respiroT: 0, respiroCd: 12, botesSeq: 0, botesCd: 0, boteHunt: 0,
    // bote finta
    fintaCd: 8, fintaT: 0, fintaChave: false,
    // caça longa
    stepSync: 0,
    // objetivo / guarda
    guardaCd: 18, guardaT: 0, objCd: 10,
    // túneis
    dormeCd: 25, dormeT: 0, tosseCd: 14, splashCd: 0, ondaT: 0,
    // armário
    entreCd: 20, farejaConta: 0, farejaContaT: 0, vascErrCd: 0, ultHide: false,
    // reza
    rezaFrenteCd: 30, chuteCd: 20,
    // cap1
    cap1AloCd: 8, cap1AloT: 0, descansoCd: 22, descansoT: 0, esbarroCd: 16, primCaca: false,
    // sino / clímax
    sinoNum: 0, apitoCd: 20, reforcoFeito: false,
    // medo / cego
    medoT: 0, breuT: 0, fomeT: 0,
    // frustração
    frustra: 0, socosAnt: 0,
    // ana
    apagonAnt: false, duetoRuidoCd: 0,
    // faro cruzado
    curaAnt: 0,
    // estado anterior
    pstate: null,
    // meshes
    segHead: null, bafo: null, orbita: [], gizPool: [], sootPool: [], cone: null, costas: null, headSpin: 0, backwards: 0, crawlY: 0,
    objSala: null
  };

  // =====================================================================
  // MESHES EXTRAS (criados uma vez, presos ao modelo)
  // =====================================================================
  function montarMeshes() {
    if (!MON || !MON.cabeca || L.segHead) return;
    try {
      // L5B#luiz: a segunda cabeça pálida (o Luiz) nas costas, no Cap V
      const h = new THREE.Mesh(new THREE.SphereGeometry(.1, 10, 8), new THREE.MeshStandardMaterial({ color: 0x9a9082, roughness: .9, transparent: true, opacity: 0 }));
      h.scale.set(.8, 1.2, .9); h.position.set(0, .02, -.22); MON.cabeca.add(h); L.segHead = h;
      // L5B#bafo: a respiração que vira fumacinha branca na boca
      const g = new THREE.BufferGeometry(); const n = 8, pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { pos[i * 3] = rand(-.03, .03); pos[i * 3 + 1] = rand(-.02, .02); pos[i * 3 + 2] = .15 + rand(0, .1); }
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const bm = new THREE.PointsMaterial({ color: 0xcfd6d8, size: .035, transparent: true, opacity: 0, depthWrite: false });
      L.bafo = new THREE.Points(g, bm); MON.cabeca.add(L.bafo);
      // L5B#orbita: a órbita costurada que só pisca no clarão
      for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.CircleGeometry(.035, 8), new THREE.MeshBasicMaterial({ color: 0x1a0d0a, transparent: true, opacity: 0, side: THREE.DoubleSide })); o.position.set(s * .055, .14, .151); MON.cabeca.add(o); L.orbita.push(o); }
      // L5B#fuligemvenda: fuligem escorrendo da venda queimada
      const streak = new THREE.Mesh(new THREE.PlaneGeometry(.02, .22), new THREE.MeshBasicMaterial({ color: 0x0b0806, transparent: true, opacity: 0, depthWrite: false }));
      streak.position.set(.05, 0, .151); MON.cabeca.add(streak); L.streak = streak;
      // L5B#surra: vergões antigos nas costas, só aparecem bem curvado (presos ao tronco)
      const cg = new THREE.Group();
      for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(.18, .012, .01), new THREE.MeshBasicMaterial({ color: 0x2a0a06, transparent: true, opacity: 0, depthWrite: false })); m.position.set(rand(-.03, .03), 2.5 + i * .18, -.21); m.rotation.z = rand(-.2, .2); cg.add(m); }
      MON.g.add(cg); L.costas = cg;
      // L5B#lanternacap1: a lanterna fraca e amarelada do Inspetor no Cap I
      const cone = new THREE.SpotLight(0xffcf8a, 0, 9, .5, .7, 1.4); cone.position.set(0, 3.2, .3); const alvo = new THREE.Object3D(); alvo.position.set(0, 2.4, 4); MON.g.add(cone, alvo); cone.target = alvo; L.cone = cone;
    } catch (e) {}
  }

  // =====================================================================
  // TIQUE DA NOITE: um traço único sorteado (estável dentro da partida)
  // =====================================================================
  const TIQUES = [
    { id: 'ouvido', nome: 'Noite do Ouvido Afiado' },
    { id: 'faro', nome: 'Noite do Faro' },
    { id: 'rapido', nome: 'Noite do Passo Apressado' },
    { id: 'lento', nome: 'Noite do Gigante Lento' },
    { id: 'teimoso', nome: 'Noite do Teimoso' }
  ];
  const tique = seguro(function () {
    const s = S(); if (!s) return;
    s.flags = s.flags || {};
    if (!L.tique) {
      if (!s.flags.l5bTique) s.flags.l5bTique = pick(TIQUES).id;
      L.tique = s.flags.l5bTique;
      const t = TIQUES.find(x => x.id === L.tique);
      if (t && !s.flags.l5bTiqueVisto) { s.flags.l5bTiqueVisto = true; setTimeout(() => { try { toast('Esta noite: ' + t.nome); } catch (e) {} }, 2600); }
    }
    if (!M.ativo) return;
    // efeitos leves e justos
    if (L.tique === 'ouvido') M.l5ouvidoMul = (M.l5ouvidoMul || 1) * 1.28;                       // L5B#tiqueouvido
    else if (L.tique === 'rapido') { M.l5velMul = (M.l5velMul || 1) * 1.12; if (M.state === 'alerta') M.alertaT += 0.016; } // L5B#tiquerapido (reage um tanto mais devagar)
    else if (L.tique === 'lento') { M.l5velMul = (M.l5velMul || 1) * .9; M.l5ouvidoMul = (M.l5ouvidoMul || 1) * 1.12; } // L5B#tiquelento
    // 'faro' e 'teimoso' agem nos sistemas de rastro/objetivo abaixo
  });

  // =====================================================================
  // APARÊNCIA / POSE (sem brigar com o L5 e o updateInspetor)
  // =====================================================================
  const aparencia = seguro(function (dt) {
    const s = S(); if (!s) return; const cap = s.chapter || 0, d = M.pos.distanceTo(P.pos);
    montarMeshes();
    // L5B#curva: a postura vai se curvando ao longo da noite (ownership de g.position.y nossa quando curvado)
    // L5B#rasteja: no Cap V, em caça por corredor, ele baixa o corpo quase ao chão
    const corredor = P.room && roomAt(M.pos.x, M.pos.z) && centroSala ? true : true;
    let crawl = (cap >= 5 && (s.flags && s.flags.sino) && M.state === 'caca') ? .45 : 0;
    L.crawlY = lerp(L.crawlY, crawl, Math.min(1, dt * 4));
    if (L.crawlY > .02 && MON && MON.g) MON.g.position.y = (MON.g.position.y) - L.crawlY; // abaixa além do bob já aplicado
    // L5B#maxilar / L5B#grito: a mandíbula desce além do humano ao escutar e no grito do Cap V
    if (MON && MON.boca) {
      let alvo = null;
      if (['escuta', 'alerta'].includes(M.state)) alvo = 2.7;
      else if (cap >= 5 && M.state === 'caca' && (s.flags && s.flags.sino)) alvo = 3.4;
      if (alvo != null) MON.boca.scale.y = lerp(MON.boca.scale.y, alvo, Math.min(1, dt * 5));
    }
    // L5B#girapescoco: ao ouvir algo exatamente atrás na procura/patrulha, a cabeça gira 180° com estalo
    L.headSpin = Math.max(0, L.headSpin - dt);
    if (['procura', 'patrulha', 'investiga'].includes(M.state) && d < 10 && !s.hidden) {
      const fwx = Math.sin(M.yaw), fwz = Math.cos(M.yaw), vx = (P.pos.x - M.pos.x) / (d || 1), vz = (P.pos.z - M.pos.z) / (d || 1);
      if (fwx * vx + fwz * vz < -.6 && P.noiseR > .4 && L.headSpin <= 0) { L.headSpin = 2; try { SX.estalo(M.pos, .9, true); } catch (e) {} legenda('[a cabeça girou para trás]', 'gira'); }
    }
    // L5B#costastravada: depois de te perder, a cabeça fica travada para o último som enquanto o corpo anda
    let spin = 0, querGirar = false;
    if (L.headSpin > 0) { spin = Math.PI * Math.min(1, (2 - L.headSpin) * 2 + .2); querGirar = true; }
    else if (M.state === 'procura' && M.ultimo) { const a = Math.atan2(M.ultimo.x - M.pos.x, M.ultimo.z - M.pos.z) - M.yaw; spin = clamp(Math.atan2(Math.sin(a), Math.cos(a)), -1.4, 1.4); querGirar = true; }
    // L5B#decostas: no Cap V, perdido, ele gira a cabeça 180° e anda de costas por uns passos
    L.backwards = Math.max(0, L.backwards - dt);
    if (cap >= 5 && M.state === 'procura' && M.ativo && L.backwards <= 0 && Math.random() < dt * .05) { L.backwards = 2.5; legenda('[ele anda de costas]', 'decostas'); }
    if (L.backwards > 0) { spin = Math.PI; querGirar = true; }
    // só assumimos a cabeça quando temos um giro intencional; fora isso, deixamos o updateInspetor mirar normalmente
    if (querGirar && MON && MON.cabeca) MON.cabeca.rotation.y = lerp(MON.cabeca.rotation.y, spin, Math.min(1, dt * 7));
    // L5B#luiz: a segunda cabeça aparece de relance no Cap V e some na luz
    if (L.segHead) { let o = 0; if (cap >= 5 && M.ativo && !flashOn() && d < 12) o = (Math.sin(perf() * .7) > .6 ? .85 : 0); L.segHead.material.opacity = lerp(L.segHead.material.opacity, o, Math.min(1, dt * 6)); if (o > 0) L.segHead.rotation.y = Math.atan2(P.pos.x - M.pos.x, P.pos.z - M.pos.z) - M.yaw - MON.cabeca.rotation.y; }
    // L5B#bafo: a respiração vira fumacinha no frio (Cap V) e nos túneis
    if (L.bafo) { const quer = (cap >= 5 || W.mapa === 'tuneis') && M.ativo; L.bafo.material.opacity = lerp(L.bafo.material.opacity, quer ? .4 + Math.sin(perf() * 2) * .2 : 0, Math.min(1, dt * 4)); const pb = L.bafo.geometry.attributes.position; for (let i = 0; i < pb.count; i++) { let z = pb.getZ(i) + dt * .2; if (z > .4) z = .15; pb.setZ(i, z); } pb.needsUpdate = true; }
    // L5B#orbita + L5B#fuligemvenda: no clarão do Cap IV+ a órbita costurada pisca; a fuligem escorre no Cap V
    if (L.orbita.length) { const flash = raioI() > .2 && cap >= 4 && M.ativo; for (const o of L.orbita) o.material.opacity = flash ? .9 : 0; }
    if (L.streak) L.streak.material.opacity = lerp(L.streak.material.opacity, cap >= 5 && M.ativo ? .7 : 0, Math.min(1, dt * 3));
    // L5B#surra: os vergões aparecem quando ele se curva para farejar/caçar
    if (L.costas) { const curvado = ['fareja', 'caca'].includes(M.state) || L.crawlY > .1; for (const c of L.costas.children) c.material.opacity = lerp(c.material.opacity, curvado && cap >= 2 ? .8 : 0, Math.min(1, dt * 4)); }
    // L5B#lanternacap1: no Cap I a lanterna dele acende; vai falhando e apaga de vez no Cap III
    if (L.cone) { const inten = cap === 0 ? 1.1 : cap === 1 ? .8 : cap === 2 ? .35 : 0; const falha = cap <= 2 && Math.sin(perf() * (cap + 2)) < -.7 ? .25 : 1; L.cone.intensity = lerp(L.cone.intensity, M.ativo ? inten * falha : 0, Math.min(1, dt * 5)); }
  });

  // =====================================================================
  // ESTÁTUA CONGELADA + DUELO DE IMOBILIDADE
  // =====================================================================
  const estatua = seguro(function (dt) {
    const s = S(); if (!s || s.hidden || !M.ativo) { L.estatuaT = 0; L.imovelMed = Math.max(0, L.imovelMed - dt); return; }
    const d = M.pos.distanceTo(P.pos);
    const imovel = P.noiseR <= .02 && !P.sprinting;
    // L5B#congela: ao ouvir seu último ruído de perto na caça, ele vira a cabeça ao ponto e CONGELA esperando
    L.estatuaCd = Math.max(0, L.estatuaCd - dt);
    if (M.state === 'caca' && d < 5 && d > 1.4 && L.estatuaCd <= 0 && L.estatuaT <= 0 && Math.random() < dt * .3) {
      L.estatuaT = 2.2; L.estatuaCd = 16; M.wait = Math.max(M.wait, 2.2); M.l5mudo = Math.max(M.l5mudo || 0, 2.2); M.olhar = P.pos.clone(); M.olharT = 2.2;
      legenda('[ele congelou, esperando você se mexer]', 'congela');
    }
    if (L.estatuaT > 0) {
      L.estatuaT -= dt; M.wait = Math.max(M.wait, .2);
      if (P.noiseR > .35 || P.sprinting) { L.estatuaT = 0; try { entrarCaca(); } catch (e) {} legenda('[você se mexeu — ele avançou]', 'congelapeg'); }
      else if (L.estatuaT <= 0) { M.recuo = Math.max(M.recuo, 3); liaDiz('l5bcongela', 'Enquanto ele congela, viro estátua. Quem se mexer primeiro perde.'); }
    }
    // L5B#duelomovel: você parada em estátua perto dele enche um medidor; cheio, ele desiste da ronda
    L.imovelCd = Math.max(0, L.imovelCd - dt);
    if (M.state !== 'caca' && d < 4 && imovel && !['fareja', 'vasculha', 'agarra', 'bote'].includes(M.state)) {
      L.imovelMed += dt; M.l5mudo = Math.max(M.l5mudo || 0, .3);
      if (L.imovelMed > 1 && !L.imovelDica) { L.imovelDica = true; legenda('[fique imóvel... ele está em dúvida]', 'duelomov'); }
      if (L.imovelMed >= 4 && L.imovelCd <= 0) { L.imovelMed = 0; L.imovelCd = 20; L.imovelDica = false; M.recuo = Math.max(M.recuo, 6); M.state = 'patrulha'; M.achou = false; legenda('[ele desistiu e voltou à ronda]', 'duelodesiste'); liaDiz('l5bduelo', 'Se eu não me mexo, ele acaba desistindo.'); }
    } else { L.imovelMed = Math.max(0, L.imovelMed - dt * 2); L.imovelDica = false; }
  });

  // =====================================================================
  // GARRAFA: habituação, roubo da isca e emboscada na origem
  // =====================================================================
  const garrafa = seguro(function (dt) {
    const s = S(); if (!s) return;
    L.iscaCd = Math.max(0, L.iscaCd - dt);
    const cur = M.alvoGarrafa || 0;
    if (cur > L.garrAnt + .5) { // uma garrafa acabou de distrair (rising edge)
      const sala = (roomAt(M.pos.x, M.pos.z) || {}).id || '?';
      L.garrN[sala] = (L.garrN[sala] || 0) + 1; L.garrN._tot = (L.garrN._tot || 0) + 1;
      const n = L.garrN._tot;
      // L5B#iscaencurta: a cada repetição o desvio encurta
      if (n >= 2 && n < 3) { M.alvoGarrafa = Math.min(M.alvoGarrafa, 2); legenda('[ele desconfiou da garrafa]', 'garr2'); }
      // L5B#iscaignora: na 3ª ele ignora e vem reto
      if (n >= 3) {
        M.alvoGarrafa = 0; L.garrN._tot = 2; // mantém o patamar
        if (planejar(M, P.pos.x, P.pos.z)) { if (M.state !== 'caca') { M.state = 'investiga'; M.searchT = 0; M.ultimo = P.pos.clone(); } }
        legenda('[esse truque eu ensinei]', 'garrign'); try { diz('Esse truque eu ensinei.'); } catch (e) {} liaDiz('l5bgarr', 'A garrafa não engana mais. Preciso variar as iscas.');
        // L5B#embgarrafa: ele vai até a origem e espera, mudo
        L.emboscaGarr = { t: 6 };
      }
    }
    L.garrAnt = cur;
    if (L.emboscaGarr && L.emboscaGarr.t > 0) { L.emboscaGarr.t -= dt; M.l5mudo = Math.max(M.l5mudo || 0, .3); if (L.emboscaGarr.t <= 0) L.emboscaGarr = null; }
  });

  // =====================================================================
  // FÚRIA (Cap V pós-sino): respiro, botes em sequência, agarrão instantâneo
  // =====================================================================
  const furia = seguro(function (dt) {
    const s = S(); if (!s) return; const furioso = M.furia > 0 || (s.flags && s.flags.sino);
    // L5B#respiro: a cada ~12 s de fúria, ele leva as mãos aos ouvidos por 2 s (janela de fuga)
    if (furioso && M.state === 'caca') {
      L.respiroCd -= dt;
      if (L.respiroCd <= 0 && L.respiroT <= 0) { L.respiroT = 2; L.respiroCd = 12; }
      if (L.respiroT > 0) { L.respiroT -= dt; M.wait = Math.max(M.wait, .2); M.l5stun = Math.max(M.l5stun || 0, .1); legenda('[o sino ainda ecoa na cabeça dele — corra]', 'respiro'); liaDiz('l5brespiro', 'De vez em quando ele trava com o sino na cabeça. É a minha chance.'); }
    } else { L.respiroT = 0; L.respiroCd = 12; }
    // L5B#botesseq: na fúria, se o bote erra e você ainda está perto, ele emenda outro
    if (furioso) {
      if (M.state === 'bote') L.boteEra = true;
      else if (L.boteEra && M.state === 'caca') { L.boteEra = false; const d = M.pos.distanceTo(P.pos); if (d < 3 && L.botesSeq < 2 && !s.hidden) { L.botesSeq++; M.boteT = Math.min(M.boteT || .3, .18); try { iniciarAlerta(); } catch (e) {} legenda('[cego de raiva, ele insiste]', 'botseq'); } }
      if (M.state !== 'caca' && M.state !== 'bote') L.botesSeq = 0;
    }
    // L5B#agarrainstant: pós-sino o bote vira quase imediato (só a estátua segura)
    if (s.flags && s.flags.sino && M.state === 'bote') M.boteT = Math.min(M.boteT || .3, .22);
  });

  // =====================================================================
  // BOTE: finta de dois tempos + tinido da chave no instante do bote
  // =====================================================================
  const bote = seguro(function (dt) {
    const s = S(); if (!s) return; const cap = s.chapter || 0;
    // L5B#chavebote: no instante em que ele compromete o bote, cai um tilintar seco de chave (deixa pra reagir)
    if (M.state === 'bote' && !L.boteChaveFeito) { L.boteChaveFeito = true; try { SX.corrente(M.pos); } catch (e) {} }
    if (M.state !== 'bote') L.boteChaveFeito = false;
    // L5B#finta: no Cap IV-V ele às vezes ergue os braços, segura e só então avança — esquivar cedo te joga no golpe
    L.fintaCd = Math.max(0, L.fintaCd - dt);
    if (cap >= 4 && M.state === 'caca' && L.fintaCd <= 0 && L.fintaT <= 0 && M.pos.distanceTo(P.pos) < 3.2 && Math.random() < dt * .4 && !s.hidden) {
      L.fintaT = .6; L.fintaCd = 10; M.wait = Math.max(M.wait, .6); legenda('[ele ergueu os braços... espere o golpe descer]', 'finta');
    }
    if (L.fintaT > 0) L.fintaT -= dt;
  });

  // =====================================================================
  // PASSO SINCRONIZADO + tapa que apaga a lanterna
  // =====================================================================
  const passoTapa = seguro(function (dt) {
    const s = S(); if (!s || s.hidden) return; const d = M.pos.distanceTo(P.pos);
    // L5B#passosync: na caçada longa ele casa o passo com o seu e some na sua pisada; quando você para, sobra um passo atrás
    if (M.state === 'caca' && M.cacaT > 8 && d < 6) {
      if (!P.sprinting && P.noiseR <= .05) { L.stepSync -= dt; if (L.stepSync <= 0) { L.stepSync = rand(.5, .8); try { SFX.passoMonstro && SFX.passoMonstro(M.pos, .4); } catch (e) {} legenda('[um passo a mais atrás de você]', 'passoextra'); } }
    }
    // L5B#tapaluz: colado na fúria, um tapa apaga a lanterna por ~2 s
    if ((M.furia > 0 || (s.flags && s.flags.sino)) && M.state === 'caca' && d < 1.8 && flashOn() && !L.tapaCd && Math.random() < dt * .5) {
      L.tapaCd = 14; try { s.flashOn = false; if (E.setFlash) E.setFlash(false); } catch (e) {}
      try { SX.estalo(M.pos, 1, true); } catch (e) {} legenda('[ele apagou sua lanterna com um tapa]', 'tapaluz'); liaDiz('l5btapa', 'Ele bate na minha mão. A luz some.');
    }
    L.tapaCd = Math.max(0, (L.tapaCd || 0) - dt);
  });

  // =====================================================================
  // GUARDA / OBJETIVO: ele ronda e guarda o caminho obrigatório
  // =====================================================================
  const guarda = seguro(function (dt) {
    const s = S(); if (!s || s.hidden || !M.ativo) return;
    L.guardaCd = Math.max(0, L.guardaCd - dt); L.objCd = Math.max(0, L.objCd - dt);
    // L5B#guarda: fora da caça, de vez em quando ele planta na porta entre você e a saída e fica parado, mudo
    if (M.state === 'patrulha' && L.guardaCd <= 0 && !M.path.length && W.doors && Math.random() < dt * .25) {
      const dr = W.doors.filter(dd => dd.open && dd.id !== 'main').sort((a, b) => Math.hypot(a.x - P.pos.x, a.z - P.pos.z) - Math.hypot(b.x - P.pos.x, b.z - P.pos.z))[0];
      if (dr && Math.hypot(dr.x - M.pos.x, dr.z - M.pos.z) < 14 && Math.hypot(dr.x - P.pos.x, dr.z - P.pos.z) < 9) {
        if (planejar(M, dr.x, dr.z)) { L.guardaCd = 26; M.wait = rand(10, 16); legenda('[ele está guardando a passagem]', 'guarda'); liaDiz('l5bguarda', 'Ele plantou na porta. Vou ter que tirá-lo dali.'); }
      }
    }
    // L5B#rondaobj: o 'teimoso' da noite gravita para a sala mais afastada (o próximo ponto costuma estar longe dele)
    if (L.tique === 'teimoso' && M.state === 'patrulha' && !M.path.length && L.objCd <= 0) {
      const salas = salasAlcancaveis(M.pos, { semFora: !W.def.inspetorFora }).filter(r => !r.seguro && r !== P.room);
      if (salas.length) { const r = salas.reduce((a, b) => distSalas(b, P.room) < distSalas(a, P.room) ? b : a); const [x, z] = pontoEm(r); if (planejar(M, x, z)) { L.objCd = 16; } }
    }
  });

  // =====================================================================
  // TÚNEIS (Cap IV): adormecido, tosse molhada, água que denuncia, splash
  // =====================================================================
  const tuneis = seguro(function (dt) {
    const s = S(); if (!s || !M.ativo) return; const cap = s.chapter || 0, d = M.pos.distanceTo(P.pos);
    // L5B#dorme: nos túneis ele dorme em pé; passar devagar e agachada é seguro, ruído o acorda em bote
    if (W.mapa === 'tuneis' && cap >= 4) {
      L.dormeCd -= dt;
      if (L.dormeCd <= 0 && L.dormeT <= 0 && M.state === 'patrulha' && d > 7) { L.dormeT = rand(6, 10); L.dormeCd = 40; legenda('[ele dorme em pé... passe devagar]', 'dorme'); liaDiz('l5bdorme', 'Ele cochila. Agachada e em silêncio eu passo.'); }
      if (L.dormeT > 0) { L.dormeT -= dt; M.wait = Math.max(M.wait, .3); M.l5ouvidoMul = (M.l5ouvidoMul || 1) * .25; if ((P.noiseR > .5 || P.sprinting) && d < 7 && !s.hidden) { L.dormeT = 0; try { entrarCaca(); } catch (e) {} legenda('[você o acordou!]', 'acorda'); } }
    }
    // L5B#tosse: Cap I-IV, numa caçada longa ele para e tosse encatarrado (janela de ~2 s)
    L.tosseCd = Math.max(0, L.tosseCd - dt);
    if (cap <= 4 && M.state === 'caca' && M.cacaT > 20 && L.tosseCd <= 0) { L.tosseCd = rand(16, 24); M.wait = Math.max(M.wait, 2); M.l5mudo = Math.max(M.l5mudo || 0, .5); try { SX.respiraRasgada(M.pos); } catch (e) {} legenda('[ele parou para tossir]', 'tosse'); }
    // L5B#onda: nos túneis as ondas que você fez continuam chegando nele mesmo parada; sair da água é o certo
    if (W.mapa === 'tuneis') {
      if (P.naAgua && (P.sprinting || P.noiseR > .3)) L.ondaT = 1.4;
      if (L.ondaT > 0) { L.ondaT -= dt; if (M.state !== 'caca' && d < 16) { M.ultimo = P.pos.clone(); if (M.state !== 'investiga') { M.state = 'investiga'; planejar(M, P.pos.x, P.pos.z); } legenda('[as ondas na água o levam até você]', 'onda'); liaDiz('l5bonda', 'A água guarda cada passo. Ficar parada aqui não adianta.'); } }
      // L5B#splash: pisar fundo (sem agachar) gera um splash que ele persegue de longe
      L.splashCd = Math.max(0, L.splashCd - dt);
      if (P.naAgua && P.sprinting && !P.crouch && L.splashCd <= 0 && d < 24) { L.splashCd = 6; M.ultimo = P.pos.clone(); try { iniciarAlerta(); } catch (e) {} legenda('[o splash o chamou de longe]', 'splash'); }
    }
  });

  // =====================================================================
  // ARMÁRIO / ESCONDERIJO
  // =====================================================================
  const armario = seguro(function (dt) {
    const s = S(); if (!s) return; const d = M.pos.distanceTo(P.pos);
    // L5B#entreaberto: na ronda ele abre um armário aleatório, confere e deixa entreaberto
    L.entreCd = Math.max(0, L.entreCd - dt);
    if (M.state === 'patrulha' && W.lockers && L.entreCd <= 0 && d < 12 && Math.random() < dt * .2) {
      const lk = W.lockers.filter(Lk => salaAdj(roomAt(Lk.x, Lk.z), roomAt(M.pos.x, M.pos.z)) && !Lk.aberto)[0];
      if (lk) { L.entreCd = 18; lk.aberto = .5; try { if (lk.g && lk.g.children[1]) lk.g.children[1].rotation.y = .4; } catch (e) {} try { SX.estalo(lk, .4); } catch (e) {} legenda('[ele deixou um armário entreaberto]', 'entre'); liaDiz('l5bentre', 'Um armário aberto. Ele passou por aqui — não posso confiar.'); }
    }
    // L5B#contadez: colado no esconderijo, no fim do fareja ele conta grave "dez... nove..." — silêncio até o zero e ele vai embora
    if (M.state === 'fareja' && s.hidden && d < 2.6) {
      L.farejaContaT -= dt;
      if (L.farejaContaT <= 0) { L.farejaContaT = .7; L.farejaConta = Math.min(10, L.farejaConta + 1); const n = 10 - L.farejaConta; if (n >= 0) diz('' + n + (n === 0 ? '.' : '...')); }
    } else { L.farejaConta = 0; L.farejaContaT = 0; }
    // L5B#vascerra: na vasculha ele às vezes "conta errado" e abre no dois, pegando quem relaxa cedo
    L.vascErrCd = Math.max(0, L.vascErrCd - dt);
    if (M.state === 'vasculha' && M.vasculhaT < 2.4 && M.vasculhaT > 1.8 && L.vascErrCd <= 0 && Math.random() < .5) { L.vascErrCd = 30; M.vasculhaT = Math.min(M.vasculhaT, 1.5); legenda('[...três... dois...]', 'vascerra'); diz('...dois!'); }
    // L5B#contafaltam: ao abrir um armário vazio na procura, ele murmura quantos alunos faltam
    if (M.state === 'procura' && L.pstate !== 'procura') L.faltam = 8;
    // L5B#folegoinverso: colado, enquanto o fôlego DELE está preso há silêncio; quando ele solta, é a janela segura
    if (['fareja', 'vasculha'].includes(M.state) && s.hidden && d < 2.6) {
      L.folT = (L.folT || 0) - dt;
      if (L.folT <= 0) { L.folT = rand(3, 5); L.folSolta = 1.2; try { SX.respiraRasgada(M.pos); } catch (e) {} }
      if (L.folSolta > 0) { L.folSolta -= dt; legenda('[ele soltou o ar — respire agora]', 'folsolta'); }
      else { M.l5mudo = Math.max(M.l5mudo || 0, .3); }
    } else { L.folT = 0; L.folSolta = 0; }
  });

  // =====================================================================
  // CAP I: humano — alô, descanso, esbarrão, primeira caçada perdoada
  // =====================================================================
  const cap1 = seguro(function (dt) {
    const s = S(); if (!s || (s.chapter || 0) > 1 || !M.ativo) return; const d = M.pos.distanceTo(P.pos);
    // L5B#alo: ele chama "Tem alguém aí?" e espera resposta; ruído confirma, silêncio o faz duvidar
    L.cap1AloCd = Math.max(0, L.cap1AloCd - dt);
    if (['investiga', 'procura'].includes(M.state) && L.cap1AloCd <= 0 && L.cap1AloT <= 0 && d < 12 && Math.random() < dt * .4) {
      L.cap1AloT = 2.5; L.cap1AloCd = 20; M.wait = Math.max(M.wait, 2.5); diz(pick(['Tem alguém aí?', 'Quem está aí? Apareça.'])); legenda('[ele chamou... fique quieta]', 'alo');
    }
    if (L.cap1AloT > 0) { L.cap1AloT -= dt; if (P.noiseR > .4 && !s.hidden) { L.cap1AloT = 0; try { iniciarAlerta(); } catch (e) {} legenda('[você respondeu — ele vem]', 'alopeg'); } else if (L.cap1AloT <= 0) { M.recuo = Math.max(M.recuo, 3); diz('...coisa da minha cabeça.'); } }
    // L5B#descansa: entre patrulhas ele encosta na parede, respiração humana; ruído o sobressalta
    L.descansoCd = Math.max(0, L.descansoCd - dt);
    if (M.state === 'patrulha' && d > 9 && L.descansoCd <= 0 && L.descansoT <= 0 && !M.path.length && Math.random() < dt * .3) { L.descansoT = rand(6, 9); L.descansoCd = 30; M.wait = Math.max(M.wait, L.descansoT); legenda('[ele parou para descansar]', 'descansa'); }
    if (L.descansoT > 0) { L.descansoT -= dt; if (P.noiseR > .5 && d < 8) { L.descansoT = 0; M.wait = 0; try { iniciarAlerta(); } catch (e) {} } }
    // L5B#esbarro: recém-desperto, ele esbarra na mobília às cegas e se trai com o barulho
    L.esbarroCd = Math.max(0, L.esbarroCd - dt);
    if ((s.chapter || 0) === 0 || (s.chapter || 0) === 1) { if (M.state === 'patrulha' && M.path.length && L.esbarroCd <= 0 && Math.random() < dt * .25) { L.esbarroCd = rand(12, 20); try { SFX.pancada && SFX.pancada(M.pos.x, M.pos.z); } catch (e) {} diz(pick(['...quem deixou isso aqui?', '...desculpe.', 'Droga de escuro.'])); legenda('[ele esbarrou em algo no escuro]', 'esbarro'); } }
    // L5B#primeiracaca: a primeira caçada do jogo é mais lenta e ele desiste cedo (ensina sem matar)
    if (M.state === 'caca' && !L.primCaca) { L.primCaca = true; s.flags.l5bPrimCaca = true; }
    if (s.flags.l5bPrimCaca && M.state === 'caca') { M.l5velMul = (M.l5velMul || 1) * .82; if (M.cacaT > 10) { M.state = 'procura'; M.searchT = 3; s.flags.l5bPrimCaca = false; diz('Volta pro dormitório, menina.'); legenda('[ele te deixou escapar... dessa vez]', 'primdesiste'); liaDiz('l5bprim', 'Ele ainda hesita. Isso vai mudar.'); } }
  });

  // =====================================================================
  // REZA / RECUO: reza que some, reza interrompida vira fúria, recuo mentiroso, chute de teste
  // =====================================================================
  const reza = seguro(function (dt) {
    const s = S(); if (!s || !M.ativo) return; const cap = s.chapter || 0, d = M.pos.distanceTo(P.pos);
    // L5B#rezasome: as pausas de reza ficam mais curtas a cada capítulo e somem no Cap V
    if (M.state === 'reza') { const mul = clamp(1 - cap * .18, 0, 1); if (cap >= 5) { M.rezaT = 0; } else if (M.rezaT) M.rezaT = Math.min(M.rezaT, M.rezaT * mul + .5); }
    // L5B#rezafuria: Cap IV+, barulho perto durante a reza o tira JÁ em caça, não em investiga
    if (M.state === 'reza' && cap >= 4 && P.noiseR > .6 && d < 6 && !s.hidden) { try { entrarCaca(); } catch (e) {} legenda('[você o tirou dele — ele explodiu]', 'rezafuria'); try { diz('Você me tirou dele...'); } catch (e) {} }
    // L5B#rezafrente: às vezes ele ajoelha e reza bem na frente do seu esconderijo
    L.rezaFrenteCd = Math.max(0, L.rezaFrenteCd - dt);
    if (s.hidden && M.state === 'procura' && d < 2.4 && L.rezaFrenteCd <= 0 && cap < 5 && Math.random() < dt * .3) { L.rezaFrenteCd = 40; M.state = 'reza'; M.rezaT = 6; M.wait = 6; legenda('[ele se ajoelhou na sua frente... não respire]', 'rezafrente'); liaDiz('l5brezaf', 'Ele reza bem na minha frente. Vejo a nuca dele pela fresta.'); }
    // L5B#rezacabeca: durante a reza, se você passa perto, a cabeça gira lenta te seguindo
    if (M.state === 'reza' && !s.hidden && d < 5) { const a = Math.atan2(P.pos.x - M.pos.x, P.pos.z - M.pos.z) - M.yaw; if (MON && MON.cabeca) MON.cabeca.rotation.y = lerp(MON.cabeca.rotation.y, clamp(Math.atan2(Math.sin(a), Math.cos(a)), -1.3, 1.3), Math.min(1, dt * 3)); legenda('[ele não sai do lugar... mas sabe que você está aí]', 'rezaseg'); }
    // L5B#recuomente: no Cap IV+, parte dos recuos é falsa — ele dá dois passos e volta em ~2 s
    if (cap >= 4 && M.recuo > 0 && !L.recMente && M.recuo > 6 && Math.random() < dt * .1) { L.recMente = true; L.recMenteT = 2; }
    if (L.recMente) { L.recMenteT -= dt; if (L.recMenteT <= 0) { L.recMente = false; M.recuo = 0; if (!s.hidden) { try { iniciarAlerta(); } catch (e) {} legenda('[o recuo era mentira]', 'recmente'); liaDiz('l5brec', 'Nem sempre dá pra confiar quando ele recua.'); } } }
    // L5B#chute: parada e muda tempo demais e ele desconfia — chuta um móvel pra te fazer reagir
    L.chuteCd = Math.max(0, L.chuteCd - dt);
    if (!s.hidden && P.noiseR <= .02 && M.state === 'procura' && d < 7 && L.chuteCd <= 0) { L.quietoT = (L.quietoT || 0) + dt; if (L.quietoT > 3) { L.quietoT = 0; L.chuteCd = 18; L.chuteReage = 1; try { SFX.pancada && SFX.pancada(M.pos.x + rand(-1, 1), M.pos.z + rand(-1, 1)); } catch (e) {} legenda('[ele chutou um móvel — não reaja]', 'chute'); } } else L.quietoT = 0;
    if (L.chuteReage > 0) { L.chuteReage -= dt; if (P.noiseR > .4 && !s.hidden) { L.chuteReage = 0; try { iniciarAlerta(); } catch (e) {} legenda('[você se assustou — ele ouviu]', 'chutepeg'); } }
    // L5B#frustra: cada armário/porta vazia soma; a 3 ele urra e fica mais rápido e agressivo
    if ((M.socos || 0) > L.socosAnt) { L.socosAnt = M.socos; } else L.socosAnt = M.socos || 0;
    if (L.pstate === 'vasculha' && M.state !== 'vasculha' && !M.achou) { L.frustra++; }
    if (L.frustra >= 3) { L.frustra = 0; M.furia = Math.max(M.furia, 2.5); try { if (abafarMundo) abafarMundo(.4, .4); SX.estalo(M.pos, 1, true); } catch (e) {} legenda('[ele urrou de raiva]', 'frustra'); liaDiz('l5bfrustra', 'Estou enlouquecendo ele. Isso pode ser perigoso.'); }
    if (M.achou) L.frustra = Math.max(0, L.frustra - 1);
  });

  // =====================================================================
  // SINO / CLÍMAX: conta com o sino, apito que convoca/mente
  // =====================================================================
  const climax = seguro(function (dt) {
    const s = S(); if (!s) return; const cap = s.chapter || 0;
    // L5B#contasino: no clímax, a cada badalada ele conta um número grave junto; na nona ele tomba
    if (cap >= 5 && s.flags && s.flags.sino) {
      if (!L.sinoRel && L.sinoRel !== 0) L.sinoRel = 0; L.sinoRel += dt;
      const badalada = Math.min(9, 1 + Math.floor(Math.max(0, L.sinoRel - 1.6) / 2.2));
      if (badalada > L.sinoNum && L.sinoRel > 1.4) {
        L.sinoNum = badalada; const nums = ['', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
        if (nums[L.sinoNum]) diz('...' + nums[L.sinoNum] + '...');
        if (L.sinoNum >= 9) { M.l5stun = Math.max(M.l5stun || 0, 2.5); legenda('[na nona ele levou as mãos aos ouvidos e tombou]', 'nona'); }
      }
    } else { L.sinoRel = 0; }
    // L5B#apitoreforco: se a caçada se arrasta no Cap V, ele apita e um coro distante responde (fecha o cerco)
    L.apitoCd = Math.max(0, L.apitoCd - dt);
    if (cap >= 5 && M.state === 'caca' && M.cacaT > 25 && L.apitoCd <= 0) { L.apitoCd = 30; legenda('[ele chamou as crianças]', 'reforco'); liaDiz('l5breforco', 'O apito dele chama os outros. Tenho que acabar com isso — não dá pra correr em círculos.'); if (PROC && PROC.fase !== 'passando' && s.timers) { try { for (const k in s.timers) if (/proc|ana/i.test(k)) s.timers[k] = Math.min(s.timers[k], 2); } catch (e) {} } }
    // L5B#apitomente: no Cap V ele às vezes apita de onde ESTAVA, já tendo se movido
    if (cap >= 5 && M.state === 'caca' && !L.apitoMenteCd && Math.random() < dt * .05) { L.apitoMenteCd = 18; const atras = M.pos.clone().addScaledVector(new THREE.Vector3(Math.sin(M.yaw), 0, Math.cos(M.yaw)), -3); try { SFX.apito ? SFX.apito(atras) : SX.estalo(atras, .8); } catch (e) {} legenda('[o apito veio de onde ele estava]', 'apitomente'); liaDiz('l5bapito', 'O apito engana a distância. Não corro pro som cego.'); }
    L.apitoMenteCd = Math.max(0, (L.apitoMenteCd || 0) - dt);
  });

  // =====================================================================
  // MEDO / CEGO / FOME
  // =====================================================================
  const medo = seguro(function (dt) {
    const s = S(); if (!s || !M.ativo) return; const d = M.pos.distanceTo(P.pos);
    // L5B#faromedo: medo acima de 80 por 8 s seguidos guia a próxima procura direto para a sua ala
    if (s.fear > 80 && !s.hidden) L.medoT += dt; else L.medoT = Math.max(0, L.medoT - dt * 2);
    if (L.medoT > 8 && M.state === 'procura' && !L.medoUsado) { L.medoUsado = true; M.ultimo = P.pos.clone(); planejar(M, P.pos.x, P.pos.z); M.searchT = Math.max(M.searchT, 2); legenda('[ele sente o seu pânico]', 'faromedo'); liaDiz('l5bmedo', 'Quando entro em pânico, é como se ele soubesse onde estou.'); }
    if (L.medoT < 2) L.medoUsado = false;
    // L5B#ouvidomedo: medo alto melhora o ouvido dele (separado do faro de sangue)
    if (s.fear > 85) M.l5ouvidoMul = (M.l5ouvidoMul || 1) * 1.15;
    // L5B#cegobreu: lanterna apagada tempo demais na caça — o cego está em casa no escuro
    if (M.state === 'caca' && !flashOn() && !s.hidden) { L.breuT += dt; if (L.breuT > 3) { M.l5velMul = (M.l5velMul || 1) * 1.1; M.l5ouvidoMul = (M.l5ouvidoMul || 1) * 1.2; if (!L.breuDica) { L.breuDica = true; legenda('[no escuro total ele está em casa]', 'cegobreu'); liaDiz('l5bbreu', 'No breu ele é mais rápido que eu. A luz nem sempre é inimiga.'); } } } else { L.breuT = 0; L.breuDica = false; }
    // L5B#fome: tempo demais sem encontro faz a fome (fúria) subir devagar
    if (M.state !== 'caca' && M.state !== 'bote' && d > 10) { L.fomeT += dt; if (L.fomeT > 45) { L.fomeT = 20; M.furia = Math.max(M.furia, 1.2); M.l5ouvidoMul = (M.l5ouvidoMul || 1) * 1.1; legenda('[a paciência dele acabou]', 'fome'); } }
    if (M.state === 'caca') L.fomeT = 0;
  });

  // =====================================================================
  // ANA / MENINA — variações novas
  // =====================================================================
  const ana = seguro(function (dt) {
    if (!ANA || !ANA.ativa) return; const s = S(); if (!s) return; const cap = s.chapter || 0;
    // L5B#anaapagao: iluminada ela para, mas cada apagão da lanterna a faz avançar um passo
    const apag = !flashOn();
    if (apag && !L.apagonAnt && ANA.vista && !ANA.script) { const v = new THREE.Vector3(P.pos.x - ANA.pos.x, 0, P.pos.z - ANA.pos.z); if (v.length() > 1.4) { v.normalize(); const n = ANA.pos.clone().addScaledVector(v, .8); try { collide(n, .25); } catch (e) {} ANA.pos.copy(n); legenda('[ela avançou no apagão]', 'anaapagao'); liaDiz('l5banaapag', 'Piscar a luz nela só a aproxima. Preciso de luz contínua.'); } }
    L.apagonAnt = apag;
    // L5B#anaprox: quando a Menina e o Inspetor estão na mesma ala, a contagem dela acelera
    if (M.ativo && !ANA.script && salaAdj(roomAt(ANA.pos.x, ANA.pos.z), roomAt(M.pos.x, M.pos.z)) && ANA.contaT) ANA.contaT = Math.min(ANA.contaT, ANA.contaT * .8);
    // L5B#analabios: longe, ela move os lábios contando SEM som
    if (!ANA.script && ANA.pos.distanceTo(P.pos) > 12 && ANA.conta > 0 && Math.random() < dt * .5) legenda('[os lábios dela se mexem... mas não há som]', 'analabios');
    // L5B#anaolhosbreu: no escuro total só os olhos dela piscam
    if (!flashOn() && ANA.pos.distanceTo(P.pos) < 10 && ANA_G && ANA_G.userData && ANA_G.userData.cabG) { const blink = Math.sin(perf() * 3) > .5; if (Math.random() < dt * .6) legenda('[no escuro, só os olhos dela]', 'anaolhos'); }
    // L5B#anagiz: do Cap IV em diante, olhos de giz desenhados por cima
    if (cap >= 4 && ANA_G && !L.anaGiz) { L.anaGiz = true; liaDiz('l5banagiz', 'Ela desenhou olhos de giz. Pra não precisar piscar.'); }
    // L5B#anarespira: no Cap III, prender o ar perto dela a faz apontar e chamar o Inspetor
    if (cap === 3 && prendendo() && ANA.pos.distanceTo(P.pos) < 4 && M.ativo && !L.anaRespCd) { L.anaRespCd = 20; if (M.state !== 'caca') { M.ultimo = P.pos.clone(); try { iniciarAlerta(); } catch (e) {} } diz(''); try { sub('ana', 'Ela parou de respirar!'); } catch (e) {} legenda('[ela reparou que você prendeu o ar]', 'anaresp'); liaDiz('l5banaresp', 'Perto dela, prender o ar me entrega. Os truques se mordem.'); }
    L.anaRespCd = Math.max(0, (L.anaRespCd || 0) - dt);
    // L5B#duetoruido: no Cap III, barulho durante a contagem faz os dois pularem números juntos
    L.duetoRuidoCd = Math.max(0, L.duetoRuidoCd - dt);
    if (cap === 3 && M.ativo && !ANA.script && ANA.conta >= 1 && P.noiseR > .8 && L.duetoRuidoCd <= 0) { L.duetoRuidoCd = 4; if (typeof ANA.conta === 'number') ANA.conta = Math.min(9, ANA.conta + 1); if (ANA.contaT) ANA.contaT = Math.min(ANA.contaT, .5); legenda('[eles pularam um número]', 'duetoruido'); }
    // L5B#imitamenina: raramente, na ronda do Cap III-IV, ele imita a contagem da Menina de uma sala errada
    if (cap >= 3 && cap <= 4 && M.ativo && M.state !== 'caca' && !L.imitaCd && Math.random() < dt * .03) { L.imitaCd = 40; const erra = M.pos.clone().addScaledVector(new THREE.Vector3(rand(-1, 1), 0, rand(-1, 1)).normalize(), 5); diz('...sete... oito...'); legenda('[a contagem dele desafina — não é ela]', 'imitamen'); liaDiz('l5bimita', 'Ele imita a voz dela pra me puxar. A dele desafina.'); }
    L.imitaCd = Math.max(0, (L.imitaCd || 0) - dt);
  });

  // =====================================================================
  // EXTRAS por quadro: sonâmbulo, bengala eco, vulto que vira, voz própria, curativo
  // =====================================================================
  const extras = seguro(function (dt) {
    const s = S(); if (!s) return; const cap = s.chapter || 0, d = M.pos.distanceTo(P.pos);
    // L5B#sonambulo: no Cap III ele anda lento e desatento, mas a luz nele o acorda furioso
    if (cap === 3 && M.ativo && M.state !== 'caca') {
      M.l5velMul = (M.l5velMul || 1) * .85;
      if (flashOn() && !flashPisca() && d < 12 && linhaLivre(M.pos, P.pos)) { try { iniciarAlerta(); } catch (e) {} legenda('[a luz o acordou!]', 'sonambulo'); liaDiz('l5bsonamb', 'Nunca aponto a luz nele. Isso o acorda na hora.'); }
    }
    // L5B#bengalaeco: parado na procura ele bate a bengala e "lê" o eco — sala pequena e fechada o vira pra você
    L.bengCd = Math.max(0, (L.bengCd || 0) - dt);
    if (M.state === 'procura' && L.bengCd <= 0 && Math.random() < dt * .25 && d < 9) {
      L.bengCd = 8; try { SX.batida(M.pos.x, M.pos.z, .6); } catch (e) {}
      const mesmaSala = roomAt(M.pos.x, M.pos.z) === P.room, salaPeq = P.room && Math.min((P.room.x1 - P.room.x0) || 9, (P.room.z1 - P.room.z0) || 9) < 6;
      if (mesmaSala && salaPeq && !s.hidden) { M.olhar = P.pos.clone(); M.olharT = 1.5; legenda('[o eco bateu em você]', 'bengeco'); liaDiz('l5bbeng', 'Num canto fechado o eco da bengala me acha. Melhor um cômodo grande.'); }
      else legenda('[ele bate a bengala e escuta]', 'bengala');
    }
    // L5B#vultovira: do Cap IV em diante, às vezes o vulto não some na luz — vira a cabeça 180° e aí se desfaz
    if (cap >= 4 && VULTO && VULTO.g && VULTO.g.visible && flashOn() && !L.vultoViraCd && Math.random() < dt * .4) { L.vultoViraCd = 20; try { VULTO.cabeca.rotation.y = Math.PI; } catch (e) {} legenda('[ele virou a cabeça para você antes de sumir]', 'vultovira'); }
    L.vultoViraCd = Math.max(0, (L.vultoViraCd || 0) - dt);
    // L5B#vozpropria: raríssimo, colado no escuro, ele sussurra "aqui..." com a voz da Lia
    if (!s.hidden && d < 3 && !flashOn() && !L.vozCd && Math.random() < dt * .04 && s.flags.l5bVozCap !== cap) { s.flags.l5bVozCap = cap; L.vozCd = 50; try { subPequeno('lia', 'aqui...'); } catch (e) {} legenda('[a voz era... a sua?]', 'vozpropria'); }
    L.vozCd = Math.max(0, (L.vozCd || 0) - dt);
    // L5B#curativo: usar o curativo (curaT) deixa um cheiro por ~6 s — na mesma ala ele vira pra você
    if (P.curaT > 0) L.curaAnt = 6;
    if (L.curaAnt > 0) { L.curaAnt -= dt; if (M.ativo && salaAdj(roomAt(M.pos.x, M.pos.z), P.room) && M.state !== 'caca') { M.ultimo = P.pos.clone(); legenda('[o sangue do curativo o chamou]', 'curativo'); liaDiz('l5bcura', 'Melhor me curar longe dele. Ele sente o sangue.'); } }
    // L5B#contaparadepois: numa caça longa ele conta seus passos e para de repente num número
    if (M.state === 'caca' && M.cacaT > 12 && !L.contaParaCd && P.sprinting && Math.random() < dt * .1) { L.contaParaCd = 14; L.contaParaT = 2; diz('...dez.'); M.wait = Math.max(M.wait, 2); legenda('[ele parou no dez... pare também]', 'contapara'); }
    if (L.contaParaT > 0) { L.contaParaT -= dt; if (P.noiseR > .4 || P.sprinting) { L.contaParaT = 0; try { entrarCaca(); } catch (e) {} } else if (L.contaParaT <= 0) { M.recuo = Math.max(M.recuo, 2); } }
    L.contaParaCd = Math.max(0, (L.contaParaCd || 0) - dt);
    // L5B#apitocomando: do Cap II em diante, 1 apito = "todos parados" — mover-se nesse instante denuncia
    if (cap >= 2 && M.ativo && M.state !== 'caca' && !L.cmdCd && Math.random() < dt * .04) {
      L.cmdCd = 30; L.cmdT = 2; try { SFX.apito ? SFX.apito(M.pos) : SX.estalo(M.pos, .8); } catch (e) {} legenda('[um apito: todos parados]', 'apitocmd'); liaDiz('l5bcmd', 'Um apito quer dizer: ninguém se mexe. Melhor obedecer.');
    }
    if (L.cmdT > 0) { L.cmdT -= dt; if ((P.sprinting || P.noiseR > .5) && !s.hidden && M.ativo) { L.cmdT = 0; M.ultimo = P.pos.clone(); try { iniciarAlerta(); } catch (e) {} legenda('[você se mexeu no apito]', 'apitocmdpeg'); } }
    L.cmdCd = Math.max(0, (L.cmdCd || 0) - dt);
    // L5B#fungadaescada: no Cap III, quando o corpo some, uma fungada desce a escada
    if (cap === 3 && (!M.ativo || d > 16) && !L.fungEscCd && Math.random() < dt * .3) { L.fungEscCd = rand(18, 30); try { SX.fungada(P.pos); } catch (e) {} legenda('[uma fungada desceu a escada]', 'fungesc'); }
    L.fungEscCd = Math.max(0, (L.fungEscCd || 0) - dt);
  });

  // =====================================================================
  // ESCONDERIJO / VENDA: abaixar sob o cone, mercê no clímax
  // =====================================================================
  const contraJogo = seguro(function (dt) {
    const s = S(); if (!s || !M.ativo) return; const cap = s.chapter || 0, d = M.pos.distanceTo(P.pos);
    // L5B#agachacone: com a venda caída (Cap IV-V) e o cone curto ativo, agachar tira você da linha dos olhos dele
    if (cap >= 4 && M.state === 'caca' && P.crouch && d < 3 && !s.hidden) { M.l5ouvidoMul = (M.l5ouvidoMul || 1) * .6; if (!L.agachaDica) { L.agachaDica = true; legenda('[agachada, você some sob a linha dos olhos dele]', 'agachacone'); liaDiz('l5bagacha', 'Ele é alto. Agachada, passo por baixo da vista dele.'); } }
    // L5B#merce: pós-sino, absolutamente imóvel e sem ar a <1 m, chance rara dele passar rente e te poupar
    if (cap >= 5 && s.flags && s.flags.sino && d < 1 && prendendo() && P.noiseR <= .01 && M.state === 'caca' && !L.merceCd) {
      L.merceCd = 30;
      if (Math.random() < .25) { M.recuo = Math.max(M.recuo, 5); M.state = 'procura'; M.searchT = 4; diz('...dorme...'); legenda('[ele encostou a mão no seu rosto... e seguiu]', 'merce'); try { conquista('l5_merce'); } catch (e) {} liaDiz('l5bmerce', 'Ficar absolutamente parada é o último recurso. Falhar é morrer.'); }
    }
    L.merceCd = Math.max(0, (L.merceCd || 0) - dt);
  });

  // =====================================================================
  // EXTRAS 2: rastro, pinça, fome de armário, apitos, coordenação
  // =====================================================================
  const trilha = []; // anel de posições recentes da Lia (p/ o faro)
  const extras2 = seguro(function (dt) {
    const s = S(); if (!s) return; const cap = s.chapter || 0, d = M.pos.distanceTo(P.pos);
    // L5B#farorastro: grava as últimas ~8 s do caminho da Lia; o tique 'faro' faz ele refazer a trilha na procura
    L.trilhaT = (L.trilhaT || 0) - dt;
    if (L.trilhaT <= 0 && P.noiseR > .05) { L.trilhaT = .5; trilha.push({ x: P.pos.x, z: P.pos.z }); if (trilha.length > 16) trilha.shift(); }
    if (L.tique === 'faro' && M.ativo && M.state === 'procura' && !M.path.length && trilha.length > 2 && (L.rastroCd || 0) <= 0) {
      L.rastroCd = 4; const alvo = trilha[0]; if (planejar(M, alvo.x, alvo.z)) { trilha.shift(); legenda('[ele está cheirando seus passos]', 'farorastro'); liaDiz('l5bfaro', 'Esta noite ele fareja. Ele refaz o caminho que pisei — melhor cortar por onde não andei.'); }
    }
    L.rastroCd = Math.max(0, (L.rastroCd || 0) - dt);
    // L5B#tiquefaro: na noite do faro, o ouvido vira faro — ele te sente melhor logo depois de você se mover
    if (L.tique === 'faro' && M.ativo && P.noiseR > .05) M.l5ouvidoMul = (M.l5ouvidoMul || 1) * 1.2;
    // L5B#herding: Cap III+, caça com a Ana ativa — ele corta para o lado te empurrando na direção dela
    if (cap >= 3 && M.state === 'caca' && ANA && ANA.ativa && !ANA.script && d > 4 && (L.herdCd || 0) <= 0 && Math.random() < dt * .3) {
      L.herdCd = 6; const vx = (P.pos.x - ANA.pos.x), vz = (P.pos.z - ANA.pos.z), ln = Math.hypot(vx, vz) || 1;
      const fx = P.pos.x + vx / ln * 2.5, fz = P.pos.z + vz / ln * 2.5; // ponto no lado oposto à Ana, pra prensar
      if (planejar(M, fx, fz)) { legenda('[ele está te empurrando para a Menina]', 'herding'); liaDiz('l5bherd', 'Ele não me persegue reto — me empurra pra ela. Preciso pôr parede entre nós duas.'); }
    }
    L.herdCd = Math.max(0, (L.herdCd || 0) - dt);
    // L5B#faminto: Cap V pós-sino, ao entrar numa sala ele abre todos os armários em sequência rápida
    if (cap >= 5 && s.flags && s.flags.sino && M.ativo && W.lockers && (L.famCd || 0) <= 0 && Math.random() < dt * .4) {
      const aqui = W.lockers.filter(Lk => roomAt(Lk.x, Lk.z) === roomAt(M.pos.x, M.pos.z) && !Lk.aberto);
      if (aqui.length) { L.famCd = 8; aqui.forEach((Lk, i) => setTimeout(() => { try { Lk.aberto = 1; if (Lk.g && Lk.g.children[1]) Lk.g.children[1].rotation.y = .9; SX.estalo(Lk, .6); } catch (e) {} }, i * 160)); legenda('[faminto, ele rasga todos os armários]', 'faminto'); liaDiz('l5bfam', 'No fim ele não procura: arranca tudo. Tenho que já estar fora.'); }
    }
    L.famCd = Math.max(0, (L.famCd || 0) - dt);
    // L5B#doisapitos: do Cap II+, às vezes dois apitos = "ninguém respira" — respirar nesse instante denuncia
    if (cap >= 2 && M.ativo && M.state !== 'caca' && (L.dois || 0) <= 0 && Math.random() < dt * .03) {
      L.dois = 40; L.doisT = 2.4; try { SX.estalo(M.pos, .7); setTimeout(() => { try { SX.estalo(M.pos, .7); } catch (e) {} }, 220); } catch (e) {} legenda('[dois apitos: ninguém respira]', 'doisapitos'); liaDiz('l5bdois', 'Dois apitos: prenda o ar até ele baixar o braço.');
    }
    if (L.doisT > 0) { L.doisT -= dt; if (!prendendo() && P.noiseR > .3 && !s.hidden && M.ativo) { L.doisT = 0; M.ultimo = P.pos.clone(); try { iniciarAlerta(); } catch (e) {} legenda('[você respirou no apito]', 'doispeg'); } }
    L.dois = Math.max(0, (L.dois || 0) - dt);
    // L5B#geradormascara: com o gerador ligado, os passos e as chaves dele somem — ele chega colado sem aviso
    if (s.flags && s.flags.energia && M.ativo && M.state === 'caca') { M.l5mudo = Math.max(M.l5mudo || 0, .4); if (!L.gerDica && d < 10) { L.gerDica = true; legenda('[o gerador abafa os passos dele]', 'geradormascara'); liaDiz('l5bger', 'Com o gerador ligado não ouço ele chegar. Faca de dois gumes.'); } }
    else L.gerDica = false;
    // L5B#chamadoisca: numa sala vizinha ele usa um eco da sua própria voz pedindo socorro, pra te puxar ao bote
    if (M.ativo && M.state !== 'caca' && salaAdj(roomAt(M.pos.x, M.pos.z), P.room) && (L.iscaVozCd || 0) <= 0 && Math.random() < dt * .03) {
      L.iscaVozCd = 45; try { subPequeno('lia', pick(['Aqui... me ajuda.', 'Socorro... estou aqui.'])); } catch (e) {} legenda('[a sua voz veio da sala ao lado... não vá]', 'chamadoisca'); liaDiz('l5bisca', 'Ele imita a minha voz pra me atrair. Ir até lá é a morte.');
    }
    L.iscaVozCd = Math.max(0, (L.iscaVozCd || 0) - dt);
    // L5B#imitachamadonome: o Chamado dele usa o nome que você digitou no título, com a voz quebrada
    if (M.ativo && M.state !== 'caca' && !L.nomeCd && nomeJogador() && Math.random() < dt * .02) {
      L.nomeCd = 60; diz(nomeJogador() + '... vem...'); legenda('[ele sabe o seu nome]', 'nomechamado');
    }
    L.nomeCd = Math.max(0, (L.nomeCd || 0) - dt);
    // L5B#contapassos: na caça ele conta seus passos em voz baixa (clima, sem efeito mecânico)
    if (M.state === 'caca' && P.sprinting && (L.cpCd || 0) <= 0 && Math.random() < dt * .25) { L.cpCd = rand(3, 5); L.cpN = (L.cpN || 0) + 1; diz('...' + L.cpN + '...'); } else if (M.state !== 'caca') L.cpN = 0;
    L.cpCd = Math.max(0, (L.cpCd || 0) - dt);
    // L5B#anaombros: Cap III, a Menina sobe e aponta; enquanto aponta, ele vem reto até você
    if (cap === 3 && ANA && ANA.ativa && !ANA.script && ANA.vista && M.ativo && M.state !== 'caca' && (L.ombCd || 0) <= 0 && Math.random() < dt * .04) {
      L.ombCd = 25; M.ultimo = P.pos.clone(); try { planejar(M, P.pos.x, P.pos.z); } catch (e) {} legenda('[ela aponta dos ombros dele — ele vem reto]', 'anaombros'); liaDiz('l5bomb', 'Quando ela aponta, ele enxerga por ela. Apago a luz nela e os dois param.');
    }
    L.ombCd = Math.max(0, (L.ombCd || 0) - dt);
    // L5B#procissaopinca: Cap V, Procissão de frente e Inspetor atrás — aviso de prensa no clímax
    if (cap >= 5 && M.state === 'caca' && PROC && PROC.fase === 'passando' && !L.pincaDica) { L.pincaDica = true; legenda('[a Procissão vem de frente e ele por trás]', 'procpinca'); liaDiz('l5bpinca', 'Prensada: a fila na frente, ele atrás. Um esconderijo no meio ou um túmulo aberto.'); }
    if (!(PROC && PROC.fase === 'passando')) L.pincaDica = false;
    // L5B#passomudo: no Pesadelo, uma vez por capítulo ele entra numa caça totalmente muda por alguns segundos
    if (s.dif === 'pesadelo' && M.state === 'caca' && s.flags.l5bMudoCap !== cap && Math.random() < dt * .05) { s.flags.l5bMudoCap = cap; M.l5mudo = Math.max(M.l5mudo || 0, 4); legenda('[silêncio... ele caça mudo]', 'passomudo'); liaDiz('l5bmudo', 'Às vezes ele caça sem um som. Só me resta o olho.'); }
    // L5B#varreduraarmarios: na procura ele checa primeiro os esconderijos que você mais usou nesta noite
    if (M.state === 'procura' && L.pstate !== 'procura' && s.flags && s.flags.escUso && W.lockers) {
      try { const uso = s.flags.escUso; const usados = Object.keys(uso).filter(k => k.indexOf(W.mapa + ':') === 0).sort((a, b) => uso[b] - uso[a]); if (usados.length) { const idx = parseInt(usados[0].split(':')[1], 10); const alvo = W.lockers[idx]; if (alvo && planejar(M, alvo.x, alvo.z)) { legenda('[ele vai direto ao seu esconderijo preferido]', 'varredura'); liaDiz('l5bvarr', 'Ele decora onde eu me escondo. Tenho que variar.'); } } } catch (e) {}
    }
    // L5B#cegocone: Cap V, com a venda caída, um facho direto à frente dele o faz avançar reto
    if (cap >= 5 && M.ativo && flashOn() && !flashPisca() && d < 3 && linhaLivre(M.pos, P.pos) && M.state !== 'caca' && !s.hidden) {
      const fwx = Math.sin(M.yaw), fwz = Math.cos(M.yaw), vx = (P.pos.x - M.pos.x) / (d || 1), vz = (P.pos.z - M.pos.z) / (d || 1);
      if (fwx * vx + fwz * vz > .6) { M.ultimo = P.pos.clone(); try { iniciarAlerta(); } catch (e) {} if (!L.coneDica) { L.coneDica = true; legenda('[a venda caiu — a luz na cara o atrai]', 'cegocone'); liaDiz('l5bcone', 'Agora ele enxerga um facho de perto. No Cap V a luz vira isca.'); } }
    }
    // L5B#portaabre: fechar a porta na cara dele na caça só o atrasa — ele arranha e escancara em ~2 s
    if (M.state === 'caca' && (L.portaAbreCd || 0) <= 0 && W.doors) {
      const dr = W.doors.filter(dd => !dd.open && salaAdj(roomAt(dd.x, dd.z) || P.room, P.room)).sort((a, b) => Math.hypot(a.x - M.pos.x, a.z - M.pos.z) - Math.hypot(b.x - M.pos.x, b.z - M.pos.z))[0];
      if (dr && Math.hypot(dr.x - M.pos.x, dr.z - M.pos.z) < 2.2) { L.portaAbreCd = 8; M.wait = Math.max(M.wait, 2); setTimeout(() => { try { setDoor(dr, true); SFX.pancada(dr.x, dr.z); } catch (e) {} }, 1800); diz('Porta não me segura, menina.'); legenda('[ele vai escancarar a porta]', 'portaabre'); }
    }
    L.portaAbreCd = Math.max(0, (L.portaAbreCd || 0) - dt);
    // L5B#tiqueteimoso: a noite do Teimoso faz ele vasculhar a mesma sala por mais tempo antes de seguir
    if (L.tique === 'teimoso' && M.state === 'procura') M.searchT = Math.max(M.searchT || 0, 1);
    // L5B#bussolacapV: no Cap V, solto, ele acelera quando está longe e desacelera colado — vagando sempre na sua direção
    if (cap >= 5 && M.ativo && M.state !== 'caca' && M.state !== 'bote') { M.l5velMul = (M.l5velMul || 1) * (d > 10 ? 1.12 : .92); if ((L.bussCd || 0) <= 0 && d < 14) { L.bussCd = 2; if (M.state === 'patrulha' && !M.path.length) try { planejar(M, P.pos.x, P.pos.z); } catch (e) {} } }
    L.bussCd = Math.max(0, (L.bussCd || 0) - dt);
    // L5B#escutalonga: na patrulha ele às vezes para e escuta longo, de cabeça pendida (clima e janela de passagem)
    if (M.state === 'patrulha' && !M.path.length && (L.escCd || 0) <= 0 && d > 6 && Math.random() < dt * .15) { L.escCd = rand(14, 22); M.wait = Math.max(M.wait, rand(2, 3.5)); M.l5mudo = Math.max(M.l5mudo || 0, 1.2); legenda('[ele parou e escuta]', 'escutalonga'); }
    L.escCd = Math.max(0, (L.escCd || 0) - dt);
  });

  // =====================================================================
  // tick
  // =====================================================================
  function tick(dt) {
    if (legT > 0) { legT -= dt; if (legT <= 0) leg.style.opacity = 0; }
    const s = S(); if (!s || s.dead) return;
    if (L.cap !== s.chapter || L.mapa !== W.mapa) { L.cap = s.chapter; L.mapa = W.mapa; L.sinoNum = 0; L.primCaca = false; L.frustra = 0; }
    tique();
    estatua(dt);
    garrafa(dt);
    furia(dt);
    bote(dt);
    passoTapa(dt);
    guarda(dt);
    tuneis(dt);
    armario(dt);
    cap1(dt);
    reza(dt);
    climax(dt);
    medo(dt);
    ana(dt);
    extras(dt);
    extras2(dt);
    contraJogo(dt);
    aparencia(dt);
    L.pstate = M.state;
  }

  return { tick: seguro(tick) };
}
