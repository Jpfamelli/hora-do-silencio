// MONSTROS DO INTERNATO — Lote 5
// Comportamentos novos, variações por capítulo, aparências mais perturbadoras,
// contra-jogos e momentos de perseguição memoráveis para o térreo (Cap I/II) e
// o andar dos dormitórios (Cap III). Ganchos curtos chamados por terreo() e
// superior() em mapas.js e encadeados com juntar() de ./internato.js.
// Tudo procedural (geometria + canvas + SFX do motor). Nada bloqueia o caminho
// obrigatório nem muda rótulo de interação — set-pieces são sentidos, não travam.

// ---------- utilidades locais
function baseMon(A, S) {
  const { THREE } = A;
  const agenda = [];
  const depois = (t, f) => agenda.push({ t, f });
  const dist = (x, z) => Math.hypot(A.P.pos.x - x, A.P.pos.z - z);
  const _v = new THREE.Vector3(), _f = new THREE.Vector3();
  const olhandoPara = (x, y, z, cos = .55, alcance = 30) => {
    _v.set(x, y, z).sub(A.camera.position); const d = _v.length(); if (d > alcance || d < .01) return false;
    A.camera.getWorldDirection(_f); return _f.dot(_v.multiplyScalar(1 / d)) > cos;
  };
  const tex = (w, h, draw) => { const t = A.canvasTex(w, h, draw); t.userData = { clone: true }; return t; };
  A.W.tick.push(dt => { for (let i = agenda.length - 1; i >= 0; i--) { agenda[i].t -= dt; if (agenda[i].t <= 0) { const f = agenda[i].f; agenda.splice(i, 1); f(); } } });
  return { depois, dist, olhandoPara, tex };
}

// Textura de três/quatro sulcos de garra, com relevo que brilha sob a lanterna
function texGarra(U, n = 4) {
  return U.tex(128, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const base = 24 + Math.random() * 20;
    for (let i = 0; i < n; i++) {
      const x = base + i * (14 + Math.random() * 6) + (Math.random() - .5) * 4;
      const topo = 24 + Math.random() * 30, fundo = h - 24 - Math.random() * 40;
      g.strokeStyle = `rgba(${40 + Math.random() * 30 | 0},${22 + Math.random() * 16 | 0},${16 + Math.random() * 12 | 0},.9)`;
      g.lineWidth = 3 + Math.random() * 3; g.beginPath(); g.moveTo(x, topo);
      g.bezierCurveTo(x + (Math.random() - .5) * 10, (topo + fundo) / 2, x + (Math.random() - .5) * 10, (topo + fundo) / 2, x + (Math.random() - .5) * 8, fundo); g.stroke();
      // lasca mais clara ao lado do sulco (madeira exposta — pega a luz)
      g.strokeStyle = 'rgba(190,170,130,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x + 2, topo + 4); g.lineTo(x + 2, fundo - 4); g.stroke();
    }
  });
}

// =====================================================================
// TÉRREO — Capítulos I e II
// =====================================================================
export function monstrosTerreo(A, S, refs = {}) {
  const { THREE, box, cyl, SFX } = A;
  const U = baseMon(A, S);
  const sg = S.flags.l5t || (S.flags.l5t = {}); // flags próprias do lote, prefixo l5

  // ---------- marcas de garra que ficam no corredor (memória do mundo) ----------
  // três texturas de garra (3, 4 e 5 sulcos) para as marcas não ficarem idênticas
  const garraMats = [texGarra(U, 3), texGarra(U, 4), texGarra(U, 5)].map(mp => new THREE.MeshStandardMaterial({ map: mp, transparent: true, roughness: .85 }));
  let marcaCd = 0; const corrMarcas = {};
  function marcaGarra(x, y, z, ry) {
    const mat = garraMats[Math.random() * garraMats.length | 0];
    const h = 1 + Math.random() * .5, w = .55 + Math.random() * .35;
    const m = A.plano(w, h, mat, x, y, z, ry); m.renderOrder = 2;
    return m;
  }
  // deixa uma marca na parede mais próxima do Inspetor quando ele caça
  function talvezMarcar(dt) {
    marcaCd -= dt; if (marcaCd > 0) return;
    const M = A.M; if (!M.ativo || M.state !== 'caca') return;
    const r = A.roomAt(M.pos.x, M.pos.z); if (!r || r.tipo !== 'corredor') return;
    // Cap II ele caça mais: os riscos aparecem mais rápido que no Cap I
    marcaCd = (S.chapter >= 2 ? 1.5 : 2.6) + Math.random() * 1.8;
    // parede lateral do corredor (z de cima ou de baixo)
    const zTopo = Math.abs(M.pos.z - r.z0) < Math.abs(M.pos.z - r.z1) ? r.z0 : r.z1;
    const ladoTopo = zTopo === r.z0;
    marcaGarra(M.pos.x, 1.4 + Math.random() * .3, zTopo + (ladoTopo ? .12 : -.12), ladoTopo ? 0 : Math.PI);
    SFX.rangido(M.pos.x, 1.4, zTopo, 1);
    const k = r.id; corrMarcas[k] = (corrMarcas[k] || 0) + 1;
    if (corrMarcas[k] === 5 && !sg['den_' + k]) { sg['den_' + k] = true; A.toast('As paredes deste corredor estão cobertas de riscos. Ele caça muito por aqui.'); }
  }

  // ---------- Inspetor na janela do pátio (silhueta no relâmpago) ----------
  const janelaVulto = refs.vulto ? refs.vulto(A) : null;
  if (janelaVulto) { janelaVulto.position.set(-13, 0, .4); janelaVulto.scale.set(.9, .9, .9); }
  let janelaAtivo = false;
  function tickJanelaPatio() {
    if (!janelaVulto) return;
    const capKey = 'janela_' + S.chapter;
    if (!janelaAtivo && !sg[capKey] && A.P.room && A.P.room.id === 'patio' && A.raioI > .18 && U.dist(-13, .4) < 24) {
      sg[capKey] = true; janelaAtivo = true; janelaVulto.visible = true; S.fear = Math.min(100, (S.fear || 0) + 18);
      A.sub('lia', 'Tem alguém na janela.'); SFX.sussurros(1.6); SFX.trovao();
    }
    if (janelaAtivo) {
      // a cabeça acompanha a Lia; some quando o relâmpago apaga
      janelaVulto.rotation.y = Math.atan2(A.P.pos.x - (-13), A.P.pos.z - .4) + Math.PI;
      if (A.raioI < .05) { janelaAtivo = false; janelaVulto.visible = false; }
    }
  }

  // ---------- corredor que se fecha (Cap II) ----------
  // ao ser avistada no corredor leste, as portas das salas batem fechando em
  // sequência atrás da Lia. Mão única: só as portas perpendiculares (não trancam a passagem).
  let fechaSeq = null;
  function dispararCorredorQueFecha() {
    if (sg.corrFecha || S.chapter !== 2) return;
    sg.corrFecha = true;
    // ela entra o corredor leste pela recepção (x≈6) e vai para o fundo (x≈34): as portas das salas
    // batem em sequência da entrada para o fundo. Não toca a diretoria (objetivo do capítulo).
    const seq = ['enferm', 'lavand', 'banh', 'maq'];
    fechaSeq = { seq, i: 0, t: 0 };
    A.sub('lia', 'As portas... estão fechando sozinhas!');
    SFX.estalo({ x: 6, z: -12 }, 1); // o estalo de língua dele vem da entrada do corredor
    // desperta/avança o Inspetor logo atrás
    if (!A.M.ativo && S.done.forcar_porta) { A.ativarInspetor(6, -12); }
  }
  function tickCorredorQueFecha(dt) {
    if (!fechaSeq) return;
    fechaSeq.t -= dt; if (fechaSeq.t > 0) return;
    if (fechaSeq.i >= fechaSeq.seq.length) { // última porta: pancada seca final
      fechaSeq = null; SFX.pancada(34, -12); A.P.shake = Math.max(A.P.shake || 0, .09); A.sub('lia', 'Saí bem antes da última.'); return;
    }
    const d = A.DOOR(fechaSeq.seq[fechaSeq.i]); fechaSeq.i++; fechaSeq.t = .42;
    if (d && !d.arrombada) { A.setDoor(d, false, true); d.vel = 11; SFX.portaBate(); SFX.pancada(d.x, d.z); A.emitNoise(d.x, d.z, 3); A.P.shake = Math.max(A.P.shake || 0, .05); }
  }

  // ---------- escada que range na fuga ----------
  // cada degrau range proporcional à velocidade; subir devagar é silencioso
  const EX = refs.EX != null ? refs.EX : -3.1;
  let degrauCd = 0, dicaEscada = false;
  function tickEscadaRange(dt) {
    degrauCd -= dt;
    const p = A.P.pos; const naEscada = Math.abs(p.x - EX) < 1.4 && p.z > -13.9 && p.z < -9.3;
    if (!naEscada || degrauCd > 0) return;
    const correndo = A.P.sprinting, devagar = A.P.devagar || A.P.crouch;
    const vel = Math.hypot(A.P.vx || 0, A.P.vz || 0);
    if (vel < .4) return;
    degrauCd = correndo ? .26 : .4;
    if (devagar) { SFX.rangido(EX, .1, p.z, .12); return; } // silenciosa
    const forca = correndo ? .9 : .4;
    SFX.rangido(EX, .1, p.z, forca); SFX.tabua({ x: EX, z: p.z }, .8); A.emitNoise(EX, p.z, correndo ? 7 : 4, true);
    if (!dicaEscada) { dicaEscada = true; A.toast('Os degraus rangem alto. Devagar eles ficam quietos.'); }
  }

  // ---------- presença do Inspetor perto (respiração/estalos quando caça) ----------
  let bafoCd = 0;
  function tickPresenca(dt) {
    const M = A.M; if (!M.ativo) return;
    bafoCd -= dt; if (bafoCd > 0) return;
    const d = M.pos.distanceTo(A.P.pos);
    if (M.state === 'caca' && d < 6.5 && !S.hidden) { bafoCd = 1.3 + Math.random(); SFX.arfar(); if (d < 3.5) SFX.sussurros(1.1); }
    else if (M.state === 'procura' && d < 10) { bafoCd = 2.2 + Math.random() * 1.5; SFX.estalo(M.pos, .5); }
    else if (M.state === 'investiga' && d < 12 && Math.random() < .4) { bafoCd = 3; SFX.inspirar(); }
  }

  // ---------- variação por capítulo (sensação) ----------
  function climaCapitulo(cap) {
    if (cap === 1) { sg.climaI = true; } // recém-desperto: ver abaixo
    if (cap === 2) { sg.climaII = true; }
  }

  return {
    entrar(cap) {
      climaCapitulo(cap);
      // Cap I: ele ainda está "acordando" — um estalo distante solitário ao entrar
      if (cap === 1 && !sg.introI) { sg.introI = true; U.depois(6, () => { if (A.M.ativo) SFX.estalo({ x: A.P.pos.x + 8, z: A.P.pos.z - 6 }, .6); }); }
      // Cap II: o corredor leste "respira" — uma pancada seca ao entrar o capítulo
      if (cap === 2 && !sg.introII) { sg.introII = true; U.depois(2.5, () => SFX.pancada(26, -12)); }
      A.W.tick.push(dt => {
        tickJanelaPatio();
        talvezMarcar(dt);
        tickCorredorQueFecha(dt);
        tickEscadaRange(dt);
        tickPresenca(dt);
      });
      // gatilho do corredor que se fecha: entrar o corredor leste no Cap II
      A.gatilho('l5_corrFecha', 7, 14, -14, -10, () => { if (S.chapter === 2) dispararCorredorQueFecha(); });
    },
    inicioCapitulo(cap) { if (cap === 2) sg.corrFecha = false; },
    // corte: ao escapar do gerador o Inspetor marca o corredor da fuga com força
    gerouLigou() { if (A.M.ativo) { const r = A.roomAt(A.P.pos.x, A.P.pos.z); if (r) { marcaCd = 0; } } }
  };
}

// =====================================================================
// ANDAR DOS DORMITÓRIOS — Capítulo III
// =====================================================================
export function monstrosSuperior(A, S, refs = {}) {
  const { THREE, box, cyl, SFX } = A;
  const U = baseMon(A, S);
  const sg = S.flags.l5s || (S.flags.l5s = {});

  const garraMat = new THREE.MeshStandardMaterial({ map: texGarra(U), transparent: true, roughness: .85 });
  function marcaGarra(x, y, z, ry) { const m = A.plano(.7, 1.2, garraMat, x, y, z, ry); m.renderOrder = 2; return m; }

  // ---------- o rosto na janela (presságio, sem dano) ----------
  // um rosto pálido do lado de fora acompanha a Lia pelo corredor e some quando ela para ou olha direto
  let rosto = null;
  function fazRosto() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xb9b2a0, roughness: 1, emissive: 0x161210, emissiveIntensity: .25 });
    const c = new THREE.Mesh(new THREE.SphereGeometry(.17, 14, 12), mat); c.scale.set(.82, 1.08, .6); g.add(c);
    const olhoMat = new THREE.MeshStandardMaterial({ color: 0x000, emissive: 0x000, roughness: 1 });
    for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 8), olhoMat); o.position.set(s * .06, .03, .15); g.add(o); }
    g.visible = false; A.W.grupo.add(g); return g;
  }
  let rostoT = -1, rostoLado = 1;
  function tickRosto(dt) {
    if (S.chapter !== 3) return;
    if (!rosto) rosto = fazRosto();
    const p = A.P.pos, r = A.P.room;
    // só no corredor, na parte onde a parede dá para a fachada (lado x = -3, janelas externas em x≈-3.2)
    const noCorr = r && r.id === 'corr';
    if (rostoT < 0 && !A.ANA.ativa && noCorr && !sg.rosto && p.z < -8 && p.z > -46) {
      // aparece do lado de fora da janela mais próxima
      sg.rosto = true; rostoT = 0; rostoLado = -1; // fachada oeste
      rosto.position.set(-3.45, 1.55, p.z); rosto.visible = true;
      S.fear = Math.min(100, (S.fear || 0) + 14);
    }
    if (rostoT >= 0) {
      rostoT += dt;
      // acompanha a Lia pela fachada
      const alvoZ = Math.max(-46, Math.min(-6, p.z));
      rosto.position.z += (alvoZ - rosto.position.z) * Math.min(1, dt * 1.4);
      rosto.lookAt(p.x, 1.6, rosto.position.z + .01);
      const parada = Math.hypot(A.P.vx || 0, A.P.vz || 0) < .3;
      const olhando = U.olhandoPara(rosto.position.x, 1.55, rosto.position.z, .72, 14);
      // some quando ela para ou olha direto
      if ((parada || olhando) && rostoT > .8) { rosto.visible = false; rostoT = -1; SFX.sussurros(1); }
      else if (rostoT > 10) { rosto.visible = false; rostoT = -1; }
    }
  }

  // ---------- o dormitório das camas que viram (rotina do Inspetor) ----------
  // figura roteirada que desce a fileira alisando lençol por lençol; ficar na
  // fileira dele enche o medo (contra-jogo: trocar de cama, ir à frente da rotina).
  let rotina = null;
  function fazFigura() {
    const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 1 });
    A.cyl(.22, .4, 1.9, m, 0, .95, 0, 8, g);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), m); cab.position.set(0, 2.0, 0); g.add(cab);
    const mao = A.cyl(.05, .04, .5, m, .3, 1.05, .2, 5, g); mao.rotation.x = -.6; // mão estendida para o lençol
    g.visible = false; A.W.grupo.add(g); return g;
  }
  function dispararCamas() {
    if (sg.camas || S.chapter !== 3) return; sg.camas = true;
    const fig = fazFigura(); rotina = { fig, x: 3.6, dir: -1, z0: -13, z1: -23, zAtual: -13, t: 0, aviso: false };
    fig.position.set(rotina.x, 0, rotina.z0); fig.visible = true;
    A.sub('lia', 'Ele está passando a mão em cada cama. Uma por uma.');
    SFX.arrastar(); S.fear = Math.min(100, (S.fear || 0) + 16);
  }
  function tickCamas(dt) {
    if (!rotina) return; const p = A.P.pos; const M = rotina;
    M.t += dt;
    // avança pela fileira em "batidas" (pausa de memória a cada cama)
    const passo = 1.6; // metros por cama
    const alvoZ = Math.max(M.z1, M.z0 - Math.floor(M.t / 1.3) * passo);
    M.fig.position.z += (alvoZ - M.fig.position.z) * Math.min(1, dt * 2.2);
    M.fig.lookAt(p.x, 1.6, M.fig.position.z);
    if (Math.floor(M.t / 1.3) !== M._b) { M._b = Math.floor(M.t / 1.3); SFX.arrastar(); A.emitNoise(M.fig.position.x, M.fig.position.z, 1.5); }
    // contra-jogo: estar atrás da rotina dele (z maior, já alisado) é seguro; à frente enche o medo
    const naSala = A.P.room && A.P.room.id === 'dormD';
    if (naSala) {
      const aFrente = p.z < M.fig.position.z - .6; // mais ao fundo que ele
      if (aFrente) { S.fear = Math.min(100, (S.fear || 0) + dt * 10); if (!M.aviso) { M.aviso = true; A.toast('Fique sempre à frente da rotina dele, nunca na cama que ele vai alisar.'); } }
    }
    if (M.fig.position.z <= M.z1 + .2) { // chegou ao fim da fileira: some
      M.fig.visible = false; rotina = null; A.sub('lia', 'Ele terminou a fileira. Não olhou pra mim.'); SFX.sussurros(1.4);
    }
  }

  // ---------- corredor que desaba (set-piece de fuga) ----------
  // ao disparar, tábuas do teto caem em pontos marcados; desvio por rota, não QTE.
  // debris são visuais (sem colisor): não trava o caminho; contato custa vida + atraso.
  let desaba = null; const quedas = [];
  function fazTabua(x, z) {
    const m = A.box(.9, .12, 2.2, A.MAT.madeiraEsc, x, 3.1, z, A.W.grupo, false);
    return { m, x, z, cai: false, vy: 0, poeira: 0, usado: false };
  }
  function dispararDesaba() {
    if (sg.desaba || S.chapter !== 3) return; sg.desaba = true;
    // pontos ao longo do corredor (x em 0, z de -10 a -40), alternando o lado
    const pts = [[-1.2, -12], [1.2, -18], [-1.2, -24], [1.2, -30], [-1.2, -36]];
    for (const [x, z] of pts) quedas.push(fazTabua(x, z));
    desaba = { t: 0, next: 0, i: 0 };
    A.sub('lia', 'O teto está vindo abaixo! Corre!'); SFX.pancada(0, -10); A.P.shake = Math.max(A.P.shake || 0, .2);
    // o estrondo prende o Inspetor atrás
    if (A.M.ativo) A.M.wait = Math.max(A.M.wait || 0, 2);
  }
  function tickDesaba(dt) {
    if (!desaba) return; const p = A.P.pos;
    desaba.t += dt; desaba.next -= dt;
    // dispara a próxima queda quando a Lia passa perto do ponto
    for (const q of quedas) {
      if (!q.cai && !q.usado && Math.abs(p.z - q.z) < 3 && p.z < q.z + 2) { q.cai = true; SFX.rangido(q.x, 2, q.z, 1.2); }
      if (q.cai && !q.usado) {
        q.vy += dt * 22; q.m.position.y -= q.vy * dt;
        q.m.rotation.z += dt * 2;
        if (q.m.position.y <= .2) {
          q.usado = true; q.m.position.y = .12; q.m.rotation.z = (Math.random() - .5) * .5;
          SFX.pancada(q.x, q.z); SFX.tabua({ x: q.x, z: q.z }, 1); A.emitNoise(q.x, q.z, 6); A.P.shake = Math.max(A.P.shake || 0, .14);
          // contato: se a Lia estiver bem embaixo, leva o baque
          if (Math.abs(p.x - q.x) < .7 && Math.abs(p.z - q.z) < 1.2) {
            S.health = Math.max(1, (S.health || 100) - 12); A.P.shake = Math.max(A.P.shake || 0, .3);
            A.P.vx *= .2; A.P.vz *= .2; SFX.ofego(); A.sub('lia', 'Ah! Uma tábua me acertou.');
          }
        }
      }
    }
    if (quedas.every(q => q.usado) && desaba.t > 2) { desaba = null; A.sub('lia', 'Passei. O corredor inteiro veio abaixo atrás de mim.'); }
  }

  // ---------- perseguição no monta-cargas (transição para os túneis) ----------
  // chamado pela descida do poço (itPoco): a mão do Inspetor entra pelas frestas
  // do teto enquanto a plataforma desce. Automático: só aguentar a descida.
  function cenaMontaCargas(dur = 900) {
    const g = new THREE.Group(); g.position.set(11.6, 3.2, -56.2); A.W.grupo.add(g);
    const m = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 1 });
    // mão/braço do Inspetor por cima da grade
    const braco = A.cyl(.06, .05, 1.1, m, 0, .4, 0, 6, g); braco.rotation.x = .5;
    const palma = A.box(.16, .05, .2, m, 0, -.1, .22, g);
    for (let i = 0; i < 4; i++) { const dedo = A.cyl(.02, .015, .22, m, -.06 + i * .04, -.2, .32, 4, g); dedo.rotation.x = .8; }
    let t = 0; const tot = dur / 1000;
    const h = dt => {
      t += dt; const k = Math.min(1, t / tot);
      g.position.y = 3.2 - k * .6 + Math.sin(t * 22) * .05; // sacode a grade
      g.rotation.y = Math.sin(t * 9) * .25;
      if (Math.floor(t * 6) % 2 === 0) { /* arranhão ritmado */ }
      A.P.shake = Math.max(A.P.shake || 0, .08 + Math.sin(t * 20) * .04);
      if (t > tot) { const i = A.W.tick.indexOf(h); if (i >= 0) A.W.tick.splice(i, 1); A.W.grupo.remove(g); }
    };
    A.W.tick.push(h);
    SFX.rangido(11.6, 3, -56, 1.3); SFX.rangido(11.6, 2.4, -56, .8);
    A.sub('lia', 'A mão dele entrou pela grade! Desce, desce logo!');
    setTimeout(() => SFX.pancada(11.6, -56), Math.max(0, dur - 120)); // baque final quando a plataforma encosta
  }

  // ---------- escada dos dormitórios que range na fuga ----------
  let degrauCd = 0, dicaEscada = false;
  function tickEscadaSup(dt) {
    degrauCd -= dt;
    const p = A.P.pos; const naEscada = Math.abs(p.x) < 1.5 && p.z > 3.4 && p.z < 6.2;
    if (!naEscada || degrauCd > 0) return;
    const vel = Math.hypot(A.P.vx || 0, A.P.vz || 0); if (vel < .4) return;
    const devagar = A.P.devagar || A.P.crouch;
    degrauCd = A.P.sprinting ? .26 : .4;
    if (devagar) { SFX.rangido(0, .1, p.z, .12); return; }
    const forca = A.P.sprinting ? .9 : .4;
    SFX.rangido(0, .1, p.z, forca); SFX.tabua({ x: 0, z: p.z }, .8); A.emitNoise(0, p.z, A.P.sprinting ? 7 : 4, true);
    if (!dicaEscada) { dicaEscada = true; A.toast('A escada range. Descer devagar mantém o silêncio.'); }
  }

  return {
    cenaMontaCargas, // exposto para o itPoco chamar na descida
    entrar(cap) {
      A.W.tick.push(dt => {
        tickRosto(dt);
        tickCamas(dt);
        tickDesaba(dt);
        tickEscadaSup(dt);
        // marca de garra no corredor quando o Inspetor caça aqui
        const M = A.M;
        if (M.ativo && M.state === 'caca') {
          sg._mc = (sg._mc || 0) + dt;
          if (sg._mc > 3) { sg._mc = 0; const r = A.roomAt(M.pos.x, M.pos.z); if (r && r.id === 'corr') { marcaGarra(-2.88, 1.5, M.pos.z, Math.PI / 2); SFX.rangido(-3, 1.4, M.pos.z, 1); } }
        }
      });
      // gatilhos: o rosto na janela e as camas e o desabamento ficam no corredor/dormitório
      A.gatilho('l5_camas', 3, 13, -24, -12, () => { if (S.chapter === 3) dispararCamas(); });
      A.gatilho('l5_desaba', -3, 3, -46, -40, () => { if (S.chapter === 3) dispararDesaba(); });
    }
  };
}
