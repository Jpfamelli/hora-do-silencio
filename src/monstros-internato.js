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

  // ---------- presságio: o rosto dele desliza pelas janelas da fachada (Cap I, antes do 1º encontro) ----------
  // Ele já está lá fora, rondando, antes de forçar a entrada. Some quando a Lia chega ao fundo do hall.
  const fachadaXs = [-13, -9, 9, 13]; // janelas do hall/salas de frente
  let fachadaVulto = null, fachadaT = -1;
  function tickPrenuncioFachada(dt) {
    if (S.chapter !== 1 || sg.prenFachada || A.M.ativo) return;
    const p = A.P.pos, r = A.P.room;
    const naFrente = r && (r.id === 'hall' || r.id === 'aula' || r.id === 'diret') && p.z > -9;
    if (fachadaT < 0) {
      if (!naFrente) return;
      sg.prenFachada = true; fachadaT = 0;
      if (!fachadaVulto && refs.vulto) { fachadaVulto = refs.vulto(A); fachadaVulto.scale.set(.8, .8, .8); }
      if (fachadaVulto) { fachadaVulto.position.set(Math.max(-13, Math.min(13, p.x)), 0, .55); fachadaVulto.visible = true; }
      S.fear = Math.min(100, (S.fear || 0) + 12); A.sub('lia', 'Tem um vulto passando pelas janelas lá fora.'); SFX.sussurros(1.4);
    } else if (fachadaVulto) {
      fachadaT += dt;
      // desliza pela fachada acompanhando a Lia, sempre um pouco à frente
      const alvo = Math.max(-13, Math.min(13, p.x + (p.x >= 0 ? 2.5 : -2.5)));
      fachadaVulto.position.x += (alvo - fachadaVulto.position.x) * Math.min(1, dt * 2.2);
      fachadaVulto.rotation.y = Math.atan2(p.x - fachadaVulto.position.x, p.z - .55) + Math.PI;
      if (fachadaT > 7 || p.z < -11) { fachadaVulto.visible = false; fachadaT = -1; SFX.estalo({ x: 0, z: 1 }, .5); }
    }
  }

  // ---------- refeitório: ele vira as mesas na perseguição (set-piece, Cap I/II) ----------
  // Mesas tombam com estrondo no encalço da Lia, afunilando para a saída. Só visual: nunca cria colisor.
  let mesas = null;
  function dispararRefeitorio() {
    if (sg.refeit || !(S.chapter === 1 || S.chapter === 2)) return;
    // só vira set-piece quando ELE já está caçando: nunca cria uma caçada do nada (não atrapalha a rota)
    const M = A.M; if (!M.ativo || !(M.state === 'caca' || M.state === 'procura')) return;
    sg.refeit = true;
    const fila = [[-20, -16.5], [-16, -18], [-12, -16.5], [-18, -22], [-13, -22.5], [-9, -17.5]];
    const arr = [];
    for (const [x, z] of fila) {
      const m = A.box(1.6, .08, .9, A.MAT.madeira, x, .76, z, A.W.grupo, false);
      arr.push({ m, x, z, t: 0, caiu: false, ang: 0 });
    }
    mesas = { arr, i: 0, next: 0 };
    A.sub('lia', 'Ele está jogando as mesas pra cima de mim!'); SFX.pancada(-18, -18); A.P.shake = Math.max(A.P.shake || 0, .16);
  }
  function tickRefeitorio(dt) {
    if (!mesas) return; const p = A.P.pos;
    mesas.next -= dt;
    if (mesas.i < mesas.arr.length && mesas.next <= 0) {
      const t = mesas.arr[mesas.i++]; mesas.next = .3 + Math.random() * .25; t.caiu = true;
      SFX.pancada(t.x, t.z); SFX.tabua({ x: t.x, z: t.z }, .9); A.emitNoise(t.x, t.z, 5); A.P.shake = Math.max(A.P.shake || 0, .1);
    }
    let vivas = 0;
    for (const t of mesas.arr) {
      if (!t.caiu) { vivas++; continue; }
      if (t.ang < Math.PI / 2 - .05) { t.ang += dt * 5; t.m.rotation.x = -t.ang; t.m.position.y = .76 - Math.sin(t.ang) * .36; vivas++; }
    }
    if (mesas.i >= mesas.arr.length && vivas === 0) { mesas = null; A.sub('lia', 'Passei por cima da bagunça. A saída está logo ali.'); }
  }

  // ---------- quadro de fusíveis como armadilha: religar a chave solta um arco e o atordoa ----------
  // Uma vez por partida. Risco: o estouro faz barulho e apaga as luzes da ala por um tempo.
  let arcoAviso = false;
  function tickArcoFusivel(dt) {
    if (sg.arco || !S.flags.energia) return;
    const M = A.M; if (!M.ativo || M.state !== 'caca') return;
    const dM = Math.hypot(M.pos.x - 33.85, M.pos.z - 22.5);
    const dP = Math.hypot(A.P.pos.x - 33.85, A.P.pos.z - 22.5);
    if (dP < 2.2 && !arcoAviso) { arcoAviso = true; A.toast('O quadro de fusíveis chia. Se ele chegar perto e você bater a chave, o arco pode cegá-lo.'); }
    if (dP < 1.6 && dM < 2.8) {
      sg.arco = true;
      SFX.metal(1.2); SFX.tremor(); SFX.pancada(33.85, 22.5); A.P.shake = Math.max(A.P.shake || 0, .22);
      M.l5stun = Math.max(M.l5stun || 0, 3.5); M.caidoT = Math.max(M.caidoT || 0, 1.2); M.wait = Math.max(M.wait || 0, 2.5);
      A.emitNoise(33.85, 22.5, 9); A.sub('lia', 'O arco estourou na cara dele! A luz da ala apagou.');
      A.conquista && A.conquista('esquiva');
    }
  }

  // ---------- rastro de cera e frio da Procissão (Cap II) ----------
  // A fila deixa uma faixa de cera no corredor; atravessá-la gela a Lia e a deixa lenta por um instante.
  let ceraFaixa = null, frioT = 0;
  function porCera() {
    if (ceraFaixa || S.chapter !== 2) return;
    const mat = new THREE.MeshStandardMaterial({ color: 0x9fb4c8, roughness: .3, transparent: true, opacity: .55, emissive: 0x24303c, emissiveIntensity: .4 });
    const faixa = A.plano(26, 2.4, mat, 0, .02, -12, -Math.PI / 2); faixa.renderOrder = 1;
    ceraFaixa = { faixa, z: -12 };
  }
  function tickCera(dt) {
    if (ceraFaixa) {
      const p = A.P.pos;
      if (Math.abs(p.z - ceraFaixa.z) < 1.3 && Math.abs(p.x) < 13 && frioT <= 0 && Math.hypot(A.P.vx || 0, A.P.vz || 0) > .3) {
        frioT = 2.4; S.stamina = Math.max(0, (S.stamina || 100) - 20); S.fear = Math.min(100, (S.fear || 0) + 8);
        SFX.sussurros(1.2); A.sub('lia', 'Que frio... a cera gela por onde eles passaram.'); if (A.P.vx) A.P.vx *= .5; if (A.P.vz) A.P.vz *= .5;
      }
    }
    if (frioT > 0) { frioT -= dt; if (frioT > 0 && A.P.sprinting) S.stamina = Math.max(0, (S.stamina || 100) - dt * 10); }
  }

  // ---------- ele tranca uma porta à frente (Cap I/II, fora da caça) ----------
  // Som de chave girando; bate uma porta perpendicular (nunca a do objetivo) e some a trava no capítulo seguinte.
  function tickTrancaPorta(dt) {
    if (sg.tranca || !(S.chapter === 1 || S.chapter === 2) || A.M.ativo) return;
    const p = A.P.pos, r = A.P.room;
    if (r && r.id === 'ce' && p.x > 14 && p.x < 22) {
      sg.tranca = true;
      const d = A.DOOR('banh'); // porta perpendicular, fora do caminho obrigatório
      if (d && !d.arrombada) { A.setDoor(d, false, true); d.vel = 10; SFX.rangido(d.x, 1.2, d.z, .5); SFX.pancada(d.x, d.z); }
      SFX.metal(.7); A.sub('lia', 'Ouvi uma chave girando. Ele trancou uma porta ali na frente.'); S.fear = Math.min(100, (S.fear || 0) + 8);
    }
  }

  // ---------- coração-bússola na caça de perto (sensação de perseguição) ----------
  let batCd = 0;
  function tickCoracao(dt) {
    const M = A.M; if (!M.ativo || M.state !== 'caca' || S.hidden) { return; }
    const d = M.pos.distanceTo(A.P.pos);
    if (d > 9) return;
    batCd -= dt; if (batCd > 0) return;
    const prox = 1 - Math.min(1, d / 9);
    batCd = .85 - prox * .35;
    SFX.coracao(.4 + prox * .8);
    if (d < 4) SFX.zumbidoOuvido(prox * .7);
  }

  // ---------- assinatura por capítulo: Cap II ele bate o cassetete nas grades ao caçar ----------
  let cassCd = 0;
  function tickCassetete(dt) {
    if (S.chapter !== 2) return; const M = A.M; if (!M.ativo || M.state !== 'caca') return;
    cassCd -= dt; if (cassCd > 0) return; cassCd = 1.4 + Math.random() * 1.2;
    SFX.metal(.5); SFX.estalo(M.pos, .7, 'caca');
  }

  // ---------- Cap I: o Inspetor ainda manca (passo arrastado, meio humano) ----------
  let mancaCd = 0;
  function tickManca(dt) {
    if (S.chapter !== 1) return; const M = A.M; if (!M.ativo) return;
    const vel = Math.hypot((M.pos.x - (sg._px || M.pos.x)), (M.pos.z - (sg._pz || M.pos.z)));
    sg._px = M.pos.x; sg._pz = M.pos.z;
    mancaCd -= dt; if (mancaCd > 0 || vel < .01) return;
    mancaCd = .9 + Math.random() * .4; // passo irregular: um pé arrasta
    SFX.arrastar();
  }

  // ---------- primeiro avistamento: ele hesita no Cap I, avança direto no Cap II ----------
  function tickPrimeiroOlhar(dt) {
    const M = A.M; if (!M.ativo || sg.hesit || M.state !== 'caca') return;
    if (M.pos.distanceTo(A.P.pos) < 9) {
      sg.hesit = true;
      if (S.chapter === 1) { M.wait = Math.max(M.wait || 0, 1.6); SFX.inspirar(); A.sub('lia', 'Ele parou... como se ainda lembrasse de ser gente.'); }
      else { SFX.estalo(M.pos, 1.2, 'caca'); A.sub('lia', 'Dessa vez ele nem parou. Veio direto.'); }
    }
  }

  // ---------- gerador como isca: ronco atrai o Inspetor e mascara seus passos na ala ----------
  let iscaAviso = false;
  function tickGeradorIsca(dt) {
    if (!S.flags.energia) return; const M = A.M; if (!M.ativo) return;
    const r = A.P.room, naMaq = r && r.id === 'maq';
    if (naMaq && !iscaAviso) { iscaAviso = true; A.toast('O ronco do gerador abafa seus passos aqui — mas é o ronco que o traz pra cá.'); }
    // o ronco puxa o Inspetor quando ele não está caçando
    if (M.state !== 'caca' && !sg.iscaCd && Math.random() < dt * .3) {
      sg.iscaCd = 8; if (A.planejar && A.planejar(M, 31.6, -19)) { M.state = 'investiga'; M.searchT = 0; SFX.estalo(M.pos, .5); }
    }
    sg.iscaCd = Math.max(0, (sg.iscaCd || 0) - dt);
  }

  // ---------- vidro quebrado desvia o faro (vão da copa/lavanderia) ----------
  function tickFaroVidro(dt) {
    const M = A.M; if (!M.ativo) return;
    if (M.farejaT > 0 && !sg.faroCd) {
      const dP = Math.hypot(A.P.pos.x - 6, A.P.pos.z - 23); // perto do vão da janela quebrada
      if (dP < 4) { sg.faroCd = 10; M.farejaT = Math.max(M.farejaT, 2.2); M.olhar = new THREE.Vector3(6, 0, -23); M.olharT = 2; SFX.sussurros(1); A.sub('lia', 'A corrente de ar da janela puxou o cheiro pra fora. Ele farejou errado.'); }
    }
    sg.faroCd = Math.max(0, (sg.faroCd || 0) - dt);
  }

  // ---------- pegadas de fuligem no chão por onde o Inspetor passou (térreo) ----------
  const pegadas = []; let pegCd = 0, pegLado = 1;
  function tickPegadas(dt) {
    const M = A.M; if (M.ativo && M.state !== 'patrulha') {
      pegCd -= dt; if (pegCd <= 0) {
        pegCd = .55; pegLado = -pegLado;
        const mat = new THREE.MeshStandardMaterial({ color: 0x0b0a09, roughness: 1, transparent: true, opacity: .8 });
        const pe = A.plano(.18, .34, mat, M.pos.x + pegLado * .12, .02, M.pos.z, -Math.PI / 2); pe.rotation.z = M.yaw || 0; pe.renderOrder = 2;
        pegadas.push({ pe, mat, v: 1 });
        if (pegadas.length > 20) { const o = pegadas.shift(); A.W.grupo.remove(o.pe); }
      }
    }
    for (let i = pegadas.length - 1; i >= 0; i--) { const f = pegadas[i]; f.v -= dt * .06; f.mat.opacity = Math.max(0, f.v * .8); if (f.v <= 0) { A.W.grupo.remove(f.pe); pegadas.splice(i, 1); } }
  }

  // ---------- arranhão comprido e luminoso ocasional na caça (distinto das marcas em grupo) ----------
  let gashCd = 6; const gashes = [];
  function tickArranhaoLongo(dt) {
    const M = A.M; if (!M.ativo || M.state !== 'caca') return;
    gashCd -= dt; if (gashCd > 0) return; gashCd = 7 + Math.random() * 5;
    const r = A.roomAt(M.pos.x, M.pos.z); if (!r) return;
    const mat = new THREE.MeshStandardMaterial({ color: 0x1a1210, emissive: 0x5a3a26, emissiveIntensity: .5, roughness: .6, transparent: true });
    const g = A.plano(.1, 2.2, mat, M.pos.x, 1.4, M.pos.z + (r.tipo === 'corredor' ? (Math.abs(M.pos.z - r.z0) < Math.abs(M.pos.z - r.z1) ? .14 : -.14) : .14), Math.random() * .4 - .2);
    g.renderOrder = 3; SFX.rangido(M.pos.x, 1.4, M.pos.z, 1.3);
    gashes.push(g); if (gashes.length > 6) A.W.grupo.remove(gashes.shift()); // limite: não acumula geometria
  }

  // ---------- ponto cego: imóvel e agachada num canto faz ele passar reto ----------
  let cego = 0, cegoAviso = false;
  function tickPontoCego(dt) {
    const M = A.M; if (!M.ativo || M.state !== 'caca' || S.hidden) { cego = 0; return; }
    const r = A.P.room, parada = Math.hypot(A.P.vx || 0, A.P.vz || 0) < .1;
    const noCanto = r && r.tipo === 'corredor' && !S.flashOn && (A.P.crouch || A.P.estatua);
    if (noCanto && parada && M.pos.distanceTo(A.P.pos) < 5) {
      cego += dt;
      if (cego > 1.2 && !sg.cegoCd) { sg.cegoCd = 12; M.somT = Math.max(M.somT || 0, 2.5); M.wait = Math.max(M.wait || 0, .4); SFX.sussurros(1.2); A.sub('ana', 'Fica quietinha. Ele passa reto.'); if (!cegoAviso) { cegoAviso = true; A.toast('Imóvel, agachada e sem luz num corredor: às vezes ele passa reto.'); } }
    } else cego = 0;
    sg.cegoCd = Math.max(0, (sg.cegoCd || 0) - dt);
  }

  // ---------- "eu te vejo": quando o medo estoura na caça, ele sussurra na sua direção ----------
  let vejoCd = 0;
  function tickEuTeVejo(dt) {
    const M = A.M; if (!M.ativo || M.state !== 'caca') return;
    vejoCd -= dt; if (vejoCd > 0) return;
    if ((S.fear || 0) > 88 && M.pos.distanceTo(A.P.pos) < 7) { vejoCd = 6; SFX.voz(M.pos); SFX.sussurros(1); A.sub('inspetor', 'Eu te vejo.'); }
  }

  // ---------- o estalo de língua fica mais rachado a cada capítulo ----------
  let estCd = 3;
  function tickEstaloCapitulo(dt) {
    const M = A.M; if (!M.ativo) return; estCd -= dt; if (estCd > 0) return;
    estCd = 4 + Math.random() * 3;
    if (M.state === 'procura' || M.state === 'investiga') SFX.estalo(M.pos, S.chapter >= 2 ? .8 : .5, S.chapter >= 2 ? 'caca' : 'procura');
  }

  // ---------- os ratos fogem na frente do Inspetor ----------
  let ratoCd = 2;
  function tickRatos(dt) {
    const M = A.M; if (!M.ativo || M.state === 'patrulha') return;
    ratoCd -= dt; if (ratoCd > 0) return; ratoCd = 5 + Math.random() * 5;
    if (M.pos.distanceTo(A.P.pos) < 16 && Math.random() < .6) SFX.rato();
  }

  // ---------- quando perde a pista, ele arrasta o cassetete pela parede (procura) ----------
  let arrastoCd = 0;
  function tickArrastoParede(dt) {
    const M = A.M; if (!M.ativo || M.state !== 'procura') return;
    arrastoCd -= dt; if (arrastoCd > 0) return; arrastoCd = .8;
    SFX.rangido(M.pos.x, 1.3, M.pos.z, .25);
  }

  // ---------- a Lia prende o fôlego sozinha quando ele passa colado no esconderijo ----------
  let folegoCd = 0;
  function tickFolego(dt) {
    const M = A.M; if (!M.ativo || !S.hidden) return; folegoCd -= dt; if (folegoCd > 0) return;
    if (M.pos.distanceTo(A.P.pos) < 2.4) { folegoCd = 4; SFX.suspiroLia(); }
  }

  // ---------- o relógio da recepção "trava" quando ele entra o hall ----------
  function tickRelogioHall(dt) {
    const M = A.M; if (!M.ativo || sg.relCd) return;
    const r = A.roomAt(M.pos.x, M.pos.z);
    if (r && r.id === 'hall') { sg.relCd = 8; SFX.tique(); SFX.sussurros(.8); A.sub('lia', 'Até o relógio parou quando ele entrou.'); }
    sg.relCd = Math.max(0, (sg.relCd || 0) - dt);
  }

  // ---------- marca de garra nas portas por onde ele caça (térreo) ----------
  const garrasPorta = [];
  function tickGarraPortaTerreo(dt) {
    const M = A.M; if (!M.ativo || M.state !== 'caca') return;
    sg._gpt = (sg._gpt || 0) + dt; if (sg._gpt < 8) return; sg._gpt = 0;
    const r = A.roomAt(M.pos.x, M.pos.z); if (!r || r.tipo !== 'corredor') return;
    const m = marcaGarra(M.pos.x, 1.0 + Math.random() * .4, r.z0 + .12, 0); SFX.rangido(M.pos.x, 1, r.z0, .55);
    garrasPorta.push(m); if (garrasPorta.length > 5) A.W.grupo.remove(garrasPorta.shift());
  }

  // ---------- ao desistir da caça, ele solta um suspiro grave de frustração ----------
  function tickDesiste(dt) {
    const M = A.M; if (!M.ativo) return;
    const caçando = M.state === 'caca' || M.state === 'procura';
    if (sg._caç && !caçando) { sg._caç = false; SFX.gemido(); SFX.suspiro(M.pos); }
    else if (caçando) sg._caç = true;
  }

  // ---------- Cap I: na primeira caça ele ainda resmunga uma frase humana ----------
  function tickFraseHumana(dt) {
    const M = A.M; if (S.chapter !== 1 || sg.fraseHum || !M.ativo || M.state !== 'caca') return;
    sg.fraseHum = true; SFX.voz(M.pos); A.sub('inspetor', 'Volta pro dormitório, menina. Ainda dá tempo.');
  }

  // ---------- cheiro de parafina quando ele está na sala ao lado (parede compartilhada) ----------
  let parafCd = 0;
  function tickParafina(dt) {
    const M = A.M; if (!M.ativo) return; parafCd -= dt; if (parafCd > 0) return;
    const rM = A.roomAt(M.pos.x, M.pos.z), rP = A.P.room;
    if (rM && rP && rM.id !== rP.id && M.pos.distanceTo(A.P.pos) < 7 && M.state !== 'caca') {
      parafCd = 9; A.sub('lia', 'Cheiro de parafina e cinza... ele está do outro lado da parede.');
    }
  }

  // ---------- Cap II: correr no corredor em caça enfurece o Inspetor ----------
  let furiaCd = 0;
  function tickFuriaCorrida(dt) {
    if (S.chapter !== 2) return; const M = A.M; if (!M.ativo || M.state !== 'caca') return;
    furiaCd -= dt;
    if (A.P.sprinting && A.P.room && A.P.room.tipo === 'corredor' && furiaCd <= 0) {
      furiaCd = 3; M.furia = Math.min(3, (M.furia || 0) + 1); SFX.gemido();
    }
  }

  // ---------- mexer-se sobre a cera durante a Procissão vira a atenção da fila ----------
  let ceraMoveCd = 0;
  function tickCeraMexe(dt) {
    if (!ceraFaixa || S.chapter !== 2) return; const p = A.P.pos;
    ceraMoveCd -= dt;
    if (Math.abs(p.z - ceraFaixa.z) < 1.6 && Math.hypot(A.P.vx || 0, A.P.vz || 0) > 2 && ceraMoveCd <= 0) {
      ceraMoveCd = 4; S.fear = Math.min(100, (S.fear || 0) + 10); SFX.sussurros(1.5);
      if (!sg.ceraDica) { sg.ceraDica = true; A.toast('Correndo sobre a cera você chama a atenção da fila. Atravesse devagar.'); }
    }
  }

  // ---------- segunda aparição do rosto no pátio (Cap II), maior e mais deformado ----------
  function tick2aJanela(dt) {
    if (S.chapter !== 2 || sg.jan2 || !janelaVulto) return;
    if (A.P.room && A.P.room.id === 'patio' && A.raioI > .18 && U.dist(-13, .4) < 24) {
      sg.jan2 = true; janelaVulto.scale.set(1.25, 1.25, 1.25); janelaVulto.visible = true; janelaAtivo = true;
      S.fear = Math.min(100, (S.fear || 0) + 22); A.sub('lia', 'Está maior. Mais perto do vidro do que antes.'); SFX.trovao(); SFX.gemido();
    }
  }

  return {
    entrar(cap) {
      climaCapitulo(cap);
      // Cap I: ele ainda está "acordando" — um estalo distante solitário ao entrar
      if (cap === 1 && !sg.introI) { sg.introI = true; U.depois(6, () => { if (A.M.ativo) SFX.estalo({ x: A.P.pos.x + 8, z: A.P.pos.z - 6 }, .6); }); }
      // Cap II: o corredor leste "respira" — uma pancada seca ao entrar o capítulo
      if (cap === 2 && !sg.introII) { sg.introII = true; U.depois(2.5, () => SFX.pancada(26, -12)); }
      // Cap II: a fila deixa cera no corredor
      if (cap === 2) porCera();
      A.W.tick.push(dt => {
        tickJanelaPatio();
        talvezMarcar(dt);
        tickCorredorQueFecha(dt);
        tickEscadaRange(dt);
        tickPresenca(dt);
        tickPrenuncioFachada(dt);
        tickRefeitorio(dt);
        tickArcoFusivel(dt);
        tickCera(dt);
        tickTrancaPorta(dt);
        tickCoracao(dt);
        tickCassetete(dt);
        tickManca(dt);
        tickPrimeiroOlhar(dt);
        tickGeradorIsca(dt);
        tickFaroVidro(dt);
        tickPegadas(dt);
        tickArranhaoLongo(dt);
        tickPontoCego(dt);
        tickEuTeVejo(dt);
        tickEstaloCapitulo(dt);
        tickRatos(dt);
        tickArrastoParede(dt);
        tickFolego(dt);
        tickRelogioHall(dt);
        tick2aJanela(dt);
        tickFraseHumana(dt);
        tickParafina(dt);
        tickFuriaCorrida(dt);
        tickCeraMexe(dt);
        tickGarraPortaTerreo(dt);
        tickDesiste(dt);
      });
      // gatilho do corredor que se fecha: entrar o corredor leste no Cap II
      A.gatilho('l5_corrFecha', 7, 14, -14, -10, () => { if (S.chapter === 2) dispararCorredorQueFecha(); });
      // gatilho do set-piece do refeitório: entrar o refeitório no Cap I/II
      A.gatilho('l5_refeit', -24, -6, -26, -14, () => dispararRefeitorio());
    },
    inicioCapitulo(cap) { if (cap === 2) { sg.corrFecha = false; porCera(); } },
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
    let t = 0, avisou = false, roçou = false; const tot = dur / 1000;
    const h = dt => {
      t += dt; const k = Math.min(1, t / tot);
      // agachar no fundo mantém a Lia fora do alcance da mão
      const agachou = A.P.crouch;
      const alcance = agachou ? -.15 : -.6;
      g.position.y = 3.2 - k * .6 + Math.sin(t * 22) * .05 + (agachou ? .25 : 0); // sacode a grade; sobe um pouco se a Lia agacha
      g.rotation.y = Math.sin(t * 9) * .25;
      if (!agachou && t > .5 && !avisou) { avisou = true; A.sub('lia', 'Agacha no fundo! A mão não alcança quem está encolhida.'); }
      if (!agachou && t > tot * .55 && !roçou) { roçou = true; SFX.arrastar(); A.P.shake = Math.max(A.P.shake || 0, .3); S.fear = Math.min(100, (S.fear || 0) + 14); A.sub('lia', 'A mão roçou meu cabelo!'); }
      A.P.shake = Math.max(A.P.shake || 0, (agachou ? .05 : .08) + Math.sin(t * 20) * .04);
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

  // ---------- ele corre por fora das janelas e corta o caminho (flanqueio visível, Cap III em caça) ----------
  // A silhueta cruza as janelas da fachada oeste (x≈-3.5), janela a janela, mais rápido que a Lia,
  // e "entra por uma porta à frente". Pura encenação do flanqueio. Scriptado, uma vez por noite.
  let flanco = null, flancoVulto = null;
  function dispararFlanco() {
    if (sg.flanco || S.chapter !== 3) return; sg.flanco = true;
    if (!flancoVulto && refs.vulto) { flancoVulto = refs.vulto(A); flancoVulto.scale.set(.85, .85, .85); }
    if (!flancoVulto) return;
    const z0 = A.P.pos.z;
    flancoVulto.position.set(-3.7, 0, z0 + 2); flancoVulto.visible = true;
    flanco = { t: 0, z: z0 + 2, alvoPorta: Math.max(-48, z0 - 14) };
    A.sub('lia', 'Ele está correndo por fora, acompanhando as janelas!'); SFX.sussurros(1.3); SFX.passoMonstro({ x: -3.7, z: z0 }, .8);
  }
  function tickFlanco(dt) {
    if (!flanco) return; const p = A.P.pos; flanco.t += dt;
    // corre para o fundo, mais rápido que a Lia
    flanco.z += -6.5 * dt;
    flancoVulto.position.z = flanco.z;
    flancoVulto.rotation.y = Math.atan2(p.x - (-3.7), p.z - flanco.z) + Math.PI;
    if (flanco.t > .4 && Math.floor(flanco.t / .22) !== flanco._s) { flanco._s = Math.floor(flanco.t / .22); SFX.passoMonstro({ x: -3.7, z: flanco.z }, .5); }
    if (flanco.z <= flanco.alvoPorta) {
      // "entra por uma porta à frente" para cortar o caminho
      flancoVulto.visible = false; flanco = null;
      SFX.pancada(-3, Math.max(-46, p.z - 12)); SFX.portaBate(); A.P.shake = Math.max(A.P.shake || 0, .08);
      A.sub('lia', 'Ele entrou na frente! Tenho que achar outra saída.');
      if (!A.M.ativo && S.chapter === 3) A.ativarInspetor(-2, flanco ? 0 : Math.max(-46, p.z - 12), 'procura');
    }
  }

  // ---------- a cama de ferro que tomba atrás da Lia (dormitório) ----------
  // "A criança que foi pro armário." O estrondo atrai o Inspetor de verdade: sair rápido é a leitura.
  function tickCamaTomba(dt) {
    if (sg.camaTomba || S.chapter !== 3) return;
    const p = A.P.pos, r = A.P.room;
    if (r && (r.id === 'dormB' || r.id === 'dormC') && p.z < (r.id === 'dormB' ? -18 : -42)) {
      sg.camaTomba = true;
      const cx = r.id === 'dormB' ? -10 : -10, cz = r.id === 'dormB' ? -15.5 : -37.5;
      const cama = A.box(.9, .12, 2, A.MAT.ferrugem, cx, 1, cz, A.W.grupo, false);
      let t = 0; const h = dt2 => { t += dt2; cama.rotation.z = Math.min(Math.PI / 2, t * 4); cama.position.y = 1 - Math.sin(Math.min(Math.PI / 2, t * 4)) * .55; if (t > .6) { const i = A.W.tick.indexOf(h); if (i >= 0) A.W.tick.splice(i, 1); } };
      A.W.tick.push(h);
      SFX.metal(1.1); SFX.pancada(cx, cz); A.emitNoise(cx, cz, 8); A.P.shake = Math.max(A.P.shake || 0, .14);
      S.fear = Math.min(100, (S.fear || 0) + 14); A.sub('lia', 'Uma cama tombou sozinha atrás de mim! O barulho vai trazê-lo.');
      if (A.M.ativo) A.M.somT = Math.max(A.M.somT || 0, 0); // ele reage ao estrondo
    }
  }

  // ---------- fuligem onde ele passou (pista de para onde ele foi, a partir do Cap III) ----------
  // Escurece o material do spot que ele toca; esmaece com o tempo. Vira rastro de onde ele andou.
  const fuligem = []; let fulCd = 0;
  function tickFuligem(dt) {
    const M = A.M; if (M.ativo && M.state !== 'patrulha') {
      fulCd -= dt;
      if (fulCd <= 0) {
        fulCd = 1.1;
        const mat = new THREE.MeshStandardMaterial({ color: 0x0c0b0a, roughness: 1, transparent: true, opacity: .7 });
        const mancha = A.plano(.5 + Math.random() * .4, .8, mat, M.pos.x, 1 + Math.random() * .6, M.pos.z, Math.random() * Math.PI);
        mancha.renderOrder = 2; fuligem.push({ mancha, mat, v: 1 });
        if (fuligem.length > 14) { const o = fuligem.shift(); A.W.grupo.remove(o.mancha); }
      }
    }
    for (let i = fuligem.length - 1; i >= 0; i--) { const f = fuligem[i]; f.v -= dt * .04; f.mat.opacity = Math.max(0, f.v * .7); if (f.v <= 0) { A.W.grupo.remove(f.mancha); fuligem.splice(i, 1); } }
  }

  // ---------- degrau que cede na fuga pela escada (decisão de risco) ----------
  let degrauCedeu = false;
  function tickDegrauCede(dt) {
    if (degrauCedeu || S.chapter !== 3 || !A.M.ativo) return;
    const p = A.P.pos; const naEscada = Math.abs(p.x) < 1.5 && p.z > 3.4 && p.z < 6.2;
    const vel = Math.hypot(A.P.vx || 0, A.P.vz || 0);
    if (naEscada && vel > 2.5) {
      degrauCedeu = true;
      SFX.tabua({ x: 0, z: p.z }, 1.3); SFX.rangido(0, .1, p.z, 1.2); A.P.shake = Math.max(A.P.shake || 0, .12);
      A.emitNoise(0, p.z, 8, true); A.sub('lia', 'Um degrau cedeu embaixo do meu pé!');
    }
  }

  // ---------- coração-bússola e zumbido na caça de perto (Cap III) ----------
  let batCd = 0;
  function tickCoracaoSup(dt) {
    const M = A.M; if (!M.ativo || M.state !== 'caca' || S.hidden) return;
    const d = M.pos.distanceTo(A.P.pos); if (d > 9) return;
    batCd -= dt; if (batCd > 0) return; const prox = 1 - Math.min(1, d / 9);
    batCd = .85 - prox * .35; SFX.coracao(.4 + prox * .8); if (d < 4) SFX.zumbidoOuvido(prox * .7);
  }

  // ---------- respiração dele através da parede/porta (proximidade) ----------
  let respCd = 0;
  function tickRespiraParede(dt) {
    const M = A.M; if (!M.ativo) return; respCd -= dt; if (respCd > 0) return;
    const d = M.pos.distanceTo(A.P.pos);
    if (d < 5.5 && M.state !== 'caca' && S.chapter === 3) {
      respCd = 2.4 + Math.random() * 1.6;
      if (d < 3) SFX.arfar(); else SFX.inspirar();
    }
  }

  // ---------- o rosto na janela agora pisca e abre a boca (mais perturbador) ----------
  function perturbaRosto(dt) {
    if (!rosto || !rosto.visible) return;
    rosto.userData._p = (rosto.userData._p || 0) + dt;
    // pisca: some os olhos por um instante
    const pisca = (Math.sin(rosto.userData._p * 1.3) > .97);
    for (const o of rosto.children) if (o.geometry && o.geometry.parameters && o.geometry.parameters.radius < .05) o.visible = !pisca;
    // "respira": estica de leve na vertical
    rosto.children[0].scale.y = 1.08 + Math.sin(rosto.userData._p * 2.2) * .06;
  }

  // ---------- camas que viram: se a Lia ficar na fileira dele, ele vira a cabeça (quase percebe) ----------
  let percebeCd = 0;
  function tickCamasPercebe(dt) {
    if (!rotina) return; const p = A.P.pos;
    const naSala = A.P.room && A.P.room.id === 'dormD';
    percebeCd -= dt;
    if (naSala && Math.abs(p.z - rotina.fig.position.z) < 1.2 && percebeCd <= 0 && Math.hypot(A.P.vx || 0, A.P.vz || 0) < .25) {
      percebeCd = 3; rotina.fig.lookAt(p.x, 1.6, p.z); SFX.estalo({ x: rotina.fig.position.x, z: rotina.fig.position.z }, .9, 'caca');
      S.fear = Math.min(100, (S.fear || 0) + 10); A.sub('lia', 'Ele virou a cabeça na minha direção. Preciso sair da cama dele.');
    }
  }

  // ---------- ele bate no vidro acompanhando pela sala (tensão de janela/beiral) ----------
  let vidroCd = 0, vidroAviso = false;
  function tickBateVidro(dt) {
    const M = A.M; if (!M.ativo || S.chapter !== 3) return;
    const r = A.P.room; if (!r || !(r.id === 'corr')) return;
    const p = A.P.pos; vidroCd -= dt;
    if (M.pos.distanceTo(p) < 7 && Math.abs(p.x + 3) < 1.2 && vidroCd <= 0) {
      vidroCd = 1.8 + Math.random(); SFX.vidro(-3.4, p.z); A.P.shake = Math.max(A.P.shake || 0, .05);
      if (!vidroAviso) { vidroAviso = true; A.toast('Ele soca o vidro acompanhando você pela janela. O vidro aguenta... por ora.'); }
    }
  }

  // ---------- um brinquedo range quando ele passa perto da sala de brinquedos ----------
  let brinqCd = 0;
  function tickBrinquedo(dt) {
    const M = A.M; if (!M.ativo || S.chapter !== 3) return;
    const r = A.roomAt(M.pos.x, M.pos.z); if (!r || r.id !== 'brinq') return;
    brinqCd -= dt; if (brinqCd > 0) return; brinqCd = 3 + Math.random() * 2;
    SFX.rangido(9, .4, -31, .5); SFX.corda();
  }

  // ---------- poeira e rosnado quando o corredor desaba ----------
  const poeiras = [];
  function cuspirPoeira(x, z) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x6b6258, roughness: 1, transparent: true, opacity: .5 });
    for (let i = 0; i < 4; i++) { const n = A.plano(.8 + Math.random(), .8 + Math.random(), mat, x + (Math.random() - .5), .6 + Math.random() * 1.4, z + (Math.random() - .5) * 2, Math.random() * 6); n.renderOrder = 4; poeiras.push({ n, mat: mat.clone(), v: 1 }); n.material = poeiras[poeiras.length - 1].mat; }
  }
  let rosnaCd = 0;
  function tickDesabaExtra(dt) {
    // poeira sobe nos pontos que acabaram de cair
    for (const q of quedas) { if (q.usado && !q._po) { q._po = true; cuspirPoeira(q.x, q.z); } }
    for (let i = poeiras.length - 1; i >= 0; i--) { const f = poeiras[i]; f.v -= dt * .5; f.n.position.y += dt * .3; f.mat.opacity = Math.max(0, f.v * .5); if (f.v <= 0) { A.W.grupo.remove(f.n); poeiras.splice(i, 1); } }
    // o Inspetor rosna do outro lado dos escombros enquanto você foge
    if (desaba) { rosnaCd -= dt; if (rosnaCd <= 0) { rosnaCd = 1.6 + Math.random(); SFX.gemido(); SFX.pancada(A.P.pos.x, Math.min(-8, A.P.pos.z + 4)); } }
  }

  // ---------- o rosto deixa uma marca de mão embaçada no vidro ao sumir ----------
  let marcaMao = null;
  function deixarMarcaMao() {
    if (marcaMao || !rosto) return;
    const mat = new THREE.MeshStandardMaterial({ color: 0xcfd6da, roughness: .2, transparent: true, opacity: .4, emissive: 0x20282c, emissiveIntensity: .3 });
    marcaMao = A.plano(.26, .34, mat, -3.0, 1.55, rosto.position.z, Math.PI / 2); marcaMao.renderOrder = 3;
    U.depois(14, () => { if (marcaMao) { A.W.grupo.remove(marcaMao); marcaMao = null; } });
  }
  let rostoViuAnt = false;
  function tickMarcaMao() {
    const vis = !!(rosto && rosto.visible);
    if (rostoViuAnt && !vis) deixarMarcaMao();
    rostoViuAnt = vis;
  }

  // ---------- "eu te vejo" na caça de perto (superior) ----------
  let vejoCdS = 0;
  function tickEuTeVejoSup(dt) {
    const M = A.M; if (!M.ativo || M.state !== 'caca') return; vejoCdS -= dt; if (vejoCdS > 0) return;
    if ((S.fear || 0) > 88 && M.pos.distanceTo(A.P.pos) < 7) { vejoCdS = 6; SFX.voz(M.pos); SFX.sussurros(1); A.sub('inspetor', 'Tá na hora de dormir.'); }
  }

  // ---------- ponto cego nos dormitórios: imóvel entre as camas ele passa reto ----------
  let cegoS = 0, cegoAvisoS = false;
  function tickPontoCegoSup(dt) {
    const M = A.M; if (!M.ativo || M.state !== 'caca' || S.hidden) { cegoS = 0; return; }
    const r = A.P.room, parada = Math.hypot(A.P.vx || 0, A.P.vz || 0) < .1;
    if (r && r.tipo === 'dorm' && !S.flashOn && (A.P.crouch || A.P.estatua) && parada && M.pos.distanceTo(A.P.pos) < 5) {
      cegoS += dt;
      if (cegoS > 1.2 && !sg.cegoCd) { sg.cegoCd = 12; M.somT = Math.max(M.somT || 0, 2.5); M.wait = Math.max(M.wait || 0, .4); SFX.sussurros(1.1); if (!cegoAvisoS) { cegoAvisoS = true; A.toast('Entre as camas, imóvel e no escuro, às vezes ele passa reto.'); } }
    } else cegoS = 0;
    sg.cegoCd = Math.max(0, (sg.cegoCd || 0) - dt);
  }

  // ---------- a escada que ele corta: pula do patamar para a sua frente (fuga) ----------
  function dispararEscadaCorta() {
    // só no meio da fuga: ele precisa estar caçando de perto e a Lia voltando para o patamar
    if (sg.corta || S.chapter !== 3 || !A.M.ativo || A.M.state !== 'caca') return;
    if (A.M.pos.distanceTo(A.P.pos) > 10) return; sg.corta = true;
    const vulto = refs.vulto ? refs.vulto(A) : null;
    if (vulto) { vulto.position.set(0, 3, 2); vulto.scale.set(.9, .9, .9); vulto.visible = true; let t = 0; const h = dt => { t += dt; vulto.position.y = Math.max(0, 3 - t * 9); if (t > .4) { vulto.visible = false; const i = A.W.tick.indexOf(h); if (i >= 0) A.W.tick.splice(i, 1); } }; A.W.tick.push(h); }
    SFX.pancada(0, 2); SFX.impacto(1); A.P.shake = Math.max(A.P.shake || 0, .18); S.fear = Math.min(100, (S.fear || 0) + 16);
    A.sub('lia', 'Ele pulou do patamar bem na minha frente! Subir não ia adiantar.');
    A.ativarInspetor(0, 2, 'caca');
  }

  // ---------- fuligem escurece a maçaneta da porta mais próxima que ele tocou ----------
  function tickFuligemPorta(dt) {
    const M = A.M; if (!M.ativo || M.state === 'patrulha') return;
    sg._fp = (sg._fp || 0) + dt; if (sg._fp < 2.5) return; sg._fp = 0;
    // deixa uma mancha de fuligem no batente perto dele (pista passiva; não bloqueia nada)
    const mat = new THREE.MeshStandardMaterial({ color: 0x0c0b0a, roughness: 1, transparent: true, opacity: .6 });
    const m = A.plano(.3, .3, mat, M.pos.x, 1.1, M.pos.z, -Math.PI / 2); m.renderOrder = 2;
    U.depois(10, () => { A.W.grupo.remove(m); });
  }

  // ---------- pegadas de fuligem no chão do corredor (superior) ----------
  const pegadasS = []; let pegCdS = 0, pegLadoS = 1;
  function tickPegadasSup(dt) {
    const M = A.M; if (M.ativo && M.state !== 'patrulha') {
      pegCdS -= dt; if (pegCdS <= 0) { pegCdS = .55; pegLadoS = -pegLadoS;
        const mat = new THREE.MeshStandardMaterial({ color: 0x0b0a09, roughness: 1, transparent: true, opacity: .8 });
        const pe = A.plano(.18, .34, mat, M.pos.x + pegLadoS * .12, .04, M.pos.z, -Math.PI / 2); pe.rotation.z = M.yaw || 0; pe.renderOrder = 2;
        pegadasS.push({ pe, mat, v: 1 }); if (pegadasS.length > 20) { const o = pegadasS.shift(); A.W.grupo.remove(o.pe); }
      }
    }
    for (let i = pegadasS.length - 1; i >= 0; i--) { const f = pegadasS[i]; f.v -= dt * .06; f.mat.opacity = Math.max(0, f.v * .8); if (f.v <= 0) { A.W.grupo.remove(f.pe); pegadasS.splice(i, 1); } }
  }

  // ---------- a caixinha de música desafina quando ele está perto ----------
  let caixaCd = 0;
  function tickCaixaDesafina(dt) {
    const M = A.M; if (!M.ativo || !S.done.caixinha) return;
    const dBr = Math.hypot(M.pos.x - 9, M.pos.z - 31);
    caixaCd -= dt; if (caixaCd > 0 || dBr > 8) return; caixaCd = 3 + Math.random() * 2;
    SFX.caixinha(9, -31); SFX.estatica(.3);
  }

  // ---------- as portas de armário rangem abrindo quando ele entra o dormitório ----------
  function tickArmariosRangem(dt) {
    const M = A.M; if (!M.ativo || M.state === 'patrulha') return;
    const r = A.roomAt(M.pos.x, M.pos.z); if (!r || r.tipo !== 'dorm') return;
    if (sg._armSala !== r.id) { sg._armSala = r.id; SFX.rangido(r.x0 + 1, 1.5, (r.z0 + r.z1) / 2, .4); SFX.armario && SFX.armario(); }
  }

  // ---------- ele arranha o teto quando está no depósito, acima da sala de brinquedos ----------
  let tetoCd = 0;
  function tickTeto(dt) {
    const M = A.M; if (!M.ativo) return; const r = A.roomAt(M.pos.x, M.pos.z);
    if (!r || r.id !== 'sotao') return; tetoCd -= dt; if (tetoCd > 0) return; tetoCd = 2.5 + Math.random() * 2;
    SFX.passosTeto();
  }

  // ---------- risada infantil se adianta quando ele patrulha a sala de brinquedos ----------
  let risCd = 0;
  function tickRisada(dt) {
    const M = A.M; if (!M.ativo || S.done.caixinha) return;
    const r = A.roomAt(M.pos.x, M.pos.z); if (!r || r.id !== 'brinq') return;
    risCd -= dt; if (risCd > 0) return; risCd = 4 + Math.random() * 3;
    SFX.risada(A.P.pos.x + (Math.random() - .5) * 6, A.P.pos.z - 4);
  }

  // ---------- a Lia prende o fôlego perto dele no esconderijo (superior) ----------
  let folegoCdS = 0;
  function tickFolegoSup(dt) {
    const M = A.M; if (!M.ativo || !S.hidden) return; folegoCdS -= dt; if (folegoCdS > 0) return;
    if (M.pos.distanceTo(A.P.pos) < 2.4) { folegoCdS = 4; SFX.suspiroLia(); }
  }

  // ---------- a grade do monta-cargas chacoalha sozinha quando a Lia entra o depósito (presságio) ----------
  function tickGradePressagio(dt) {
    if (sg.gradeP || S.chapter !== 3) return;
    const r = A.P.room; if (!r || r.id !== 'sotao') return;
    sg.gradeP = true; SFX.metal(.7); SFX.rangido(11.6, 1.5, -56, .5); A.sub('lia', 'A grade do monta-cargas chacoalhou sozinha. Algo desce por ali.');
  }

  // ---------- estalo ritmado ecoa pelo corredor dos dormitórios quando ele caça ----------
  let ecoCd = 0;
  function tickEcoEstalo(dt) {
    const M = A.M; if (!M.ativo || M.state !== 'caca') return;
    const r = A.roomAt(M.pos.x, M.pos.z); if (!r || r.id !== 'corr') return;
    ecoCd -= dt; if (ecoCd > 0) return; ecoCd = 1.1 + Math.random() * .6;
    SFX.estalo(M.pos, .9, 'caca');
  }

  // ---------- lençóis farfalham em sequência conforme a figura das camas avança ----------
  function tickLencol(dt) {
    if (!rotina) return;
    if (Math.floor(rotina.t / 1.3) !== rotina._lb) { rotina._lb = Math.floor(rotina.t / 1.3); SFX.rangido(rotina.fig.position.x, .8, rotina.fig.position.z, .18); }
  }

  // ---------- um brinquedo rola pelo corredor na frente da Lia durante a fuga ----------
  function tickBolaRola(dt) {
    const M = A.M; if (S.chapter !== 3 || sg.bola || !M.ativo) return;
    const p = A.P.pos, r = A.P.room; if (!(r && r.id === 'corr' && M.state === 'caca')) return;
    sg.bola = true;
    const bola = A.cyl(.12, .12, .12, A.MAT.madeira, p.x, .12, p.z - 4, 10, A.W.grupo); bola.rotation.z = Math.PI / 2;
    let t = 0, vx = (Math.random() - .5) * 2, vz = 3.2;
    const h = dt2 => { t += dt2; bola.position.x += vx * dt2; bola.position.z += vz * dt2; bola.rotation.x += dt2 * 8; if (t > 1.6) { A.W.grupo.remove(bola); const i = A.W.tick.indexOf(h); if (i >= 0) A.W.tick.splice(i, 1); } };
    A.W.tick.push(h); SFX.corda(); SFX.rangido(p.x, .2, p.z - 3, .3); A.sub('lia', 'Um brinquedo rolou do escuro na minha frente.');
  }

  // ---------- a bailarina da caixinha para de girar quando ele entra a sala de brinquedos ----------
  function tickCaixaPara(dt) {
    const M = A.M; if (!M.ativo || !S.done.caixinha) return;
    const r = A.roomAt(M.pos.x, M.pos.z); const dentro = r && r.id === 'brinq';
    if (dentro && !sg._caixaPara) { sg._caixaPara = true; S.flags.cavalinho = false; SFX.estatica(.2); A.sub('lia', 'A caixinha parou de tocar quando ele chegou.'); }
    else if (!dentro && sg._caixaPara) { sg._caixaPara = false; S.flags.cavalinho = true; }
  }

  // ---------- marcas de garra também nas portas dos dormitórios por onde ele passou ----------
  const garrasDorm = [];
  function tickGarraPorta(dt) {
    const M = A.M; if (!M.ativo || M.state === 'patrulha') return;
    sg._gp = (sg._gp || 0) + dt; if (sg._gp < 7) return; sg._gp = 0;
    const r = A.roomAt(M.pos.x, M.pos.z); if (!r || r.tipo !== 'dorm') return;
    const m = marcaGarra(M.pos.x, 1.2, M.pos.z, Math.random() * Math.PI); SFX.rangido(M.pos.x, 1.2, M.pos.z, .6);
    garrasDorm.push(m); if (garrasDorm.length > 5) A.W.grupo.remove(garrasDorm.shift());
  }

  // ---------- ao descer a escada em caça, a silhueta dele aparece no topo por um instante ----------
  function tickSilhuetaTopo(dt) {
    const M = A.M; if (S.chapter !== 3 || sg.topo || !M.ativo || M.state !== 'caca') return;
    const p = A.P.pos; if (!(Math.abs(p.x) < 1.5 && p.z > 3.4 && p.z < 6.2)) return;
    sg.topo = true;
    const v = refs.vulto ? refs.vulto(A) : null;
    if (v) { v.position.set(0, 0, -1); v.scale.set(.85, .85, .85); v.visible = true; U.depois(1.2, () => { v.visible = false; }); }
    SFX.passoMonstro({ x: 0, z: -1 }, .9); A.sub('lia', 'Ele apareceu no alto da escada, me vendo descer.');
  }

  // ---------- um quadro cai da parede quando ele passa correndo pelo corredor ----------
  function tickQuadroCai(dt) {
    const M = A.M; if (S.chapter !== 3 || !M.ativo || M.state !== 'caca') return;
    sg._qc = (sg._qc || 0) + dt; if (sg._qc < 3) return; sg._qc = 0;
    if (Math.random() < .5) return;
    const z = Math.max(-50, Math.min(-14, M.pos.z));
    const mat = new THREE.MeshStandardMaterial({ color: 0x2a211a, roughness: .9 });
    const q = A.box(.04, .7, .9, mat, 2.85, 1.8, z, A.W.grupo, false);
    let t = 0, vy = 0; const h = dt2 => { t += dt2; vy += dt2 * 14; q.position.y -= vy * dt2; q.rotation.x += dt2 * 6; if (q.position.y <= .1) { q.position.y = .08; SFX.metal(.5); const i = A.W.tick.indexOf(h); if (i >= 0) A.W.tick.splice(i, 1); U.depois(6, () => A.W.grupo.remove(q)); } };
    A.W.tick.push(h); SFX.rangido(2.85, 1.8, z, .4);
  }

  return {
    cenaMontaCargas, // exposto para o itPoco chamar na descida
    entrar(cap) {
      A.W.tick.push(dt => {
        tickRosto(dt);
        tickCamas(dt);
        tickDesaba(dt);
        tickEscadaSup(dt);
        tickFlanco(dt);
        tickCamaTomba(dt);
        tickFuligem(dt);
        tickDegrauCede(dt);
        tickCoracaoSup(dt);
        tickRespiraParede(dt);
        perturbaRosto(dt);
        tickCamasPercebe(dt);
        tickBateVidro(dt);
        tickBrinquedo(dt);
        tickDesabaExtra(dt);
        tickMarcaMao(dt);
        tickEuTeVejoSup(dt);
        tickPontoCegoSup(dt);
        tickFuligemPorta(dt);
        tickPegadasSup(dt);
        tickCaixaDesafina(dt);
        tickArmariosRangem(dt);
        tickTeto(dt);
        tickRisada(dt);
        tickFolegoSup(dt);
        tickLencol(dt);
        tickBolaRola(dt);
        tickCaixaPara(dt);
        tickGarraPorta(dt);
        tickSilhuetaTopo(dt);
        tickQuadroCai(dt);
        tickGradePressagio(dt);
        tickEcoEstalo(dt);
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
      // flanqueio visível: avistada no meio do corredor em caça
      A.gatilho('l5_flanco', -3, 3, -34, -26, () => { if (S.chapter === 3 && A.M.ativo) dispararFlanco(); });
      // a escada que ele corta: ao voltar para o patamar em caça
      A.gatilho('l5_corta', -3, 3, -6, 0, () => { if (S.chapter === 3 && A.M.ativo) dispararEscadaCorta(); });
    }
  };
}
