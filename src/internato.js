// INTERNATO — extras do térreo (Capítulos I e II) e do andar dos dormitórios (Capítulo III)
// Ganchos chamados por terreo() e superior() em mapas.js. Tudo procedural (canvas + SFX do motor).
// Cada função devolve ganchos { sync, entrar, inicioCapitulo, entrouSala, fitaOuvida, anaFim, ... } que
// juntar() encadeia com os do mapa, sem substituir os originais.

const SEGREDOS_TOTAL = 5;

export function juntar(def, X) {
  X.def = def;
  for (const k of ['sync', 'entrar', 'inicioCapitulo', 'fitaOuvida', 'entrouSala', 'notaLida', 'anaFim']) {
    if (!X[k]) continue;
    const a = def[k], b = X[k];
    def[k] = a ? function (...args) { const r = a.apply(this, args); b.apply(this, args); return r; } : b;
  }
  return def;
}

// ---------- utilidades
function base(A, S) {
  const { THREE } = A;
  const agenda = [];
  const depois = (t, f) => agenda.push({ t, f });
  const _v = new THREE.Vector3(), _f = new THREE.Vector3();
  const olhando = (x, y, z, cos = .8, alcance = 16) => {
    _v.set(x, y, z).sub(A.camera.position); const d = _v.length(); if (d > alcance || d < .01) return false;
    A.camera.getWorldDirection(_f); return _f.dot(_v.multiplyScalar(1 / d)) > cos;
  };
  const dist = (x, z) => Math.hypot(A.P.pos.x - x, A.P.pos.z - z);
  const tex = (w, h, draw) => { const t = A.canvasTex(w, h, draw); t.userData = { clone: true }; return t; };
  const segredo = (id, texto) => {
    const sg = S.flags.segredos || (S.flags.segredos = {});
    if (sg[id]) return; sg[id] = true;
    const n = Object.keys(sg).length;
    A.toast(`${texto} · Segredo do internato ${n}/${SEGREDOS_TOTAL}`);
    if (n >= SEGREDOS_TOTAL) depois(3.5, () => A.sub('lia', 'Esse prédio não tem mais nada pra me esconder. Só ele.'));
  };
  A.W.tick.push(dt => { for (let i = agenda.length - 1; i >= 0; i--) { agenda[i].t -= dt; if (agenda[i].t <= 0) { const f = agenda[i].f; agenda.splice(i, 1); f(); } } });
  return { depois, olhando, dist, tex, segredo };
}

// Pegadas, cacos, rabiscos: texturas em canvas
function texCacos(U) {
  return U.tex(128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 34; i++) {
      const x = 20 + Math.random() * 88, y = 20 + Math.random() * 88, s = 3 + Math.random() * 9, a = Math.random() * 6.3;
      g.fillStyle = `rgba(${170 + Math.random() * 60 | 0},${190 + Math.random() * 50 | 0},${190 + Math.random() * 50 | 0},${.55 + Math.random() * .4})`;
      g.beginPath(); g.moveTo(x + Math.cos(a) * s, y + Math.sin(a) * s); g.lineTo(x + Math.cos(a + 2.2) * s * .6, y + Math.sin(a + 2.2) * s * .6); g.lineTo(x + Math.cos(a + 4) * s * .8, y + Math.sin(a + 4) * s * .8); g.closePath(); g.fill();
    }
    g.fillStyle = 'rgba(20,40,24,.7)'; g.beginPath(); g.ellipse(64, 64, 9, 5, .4, 0, 7); g.fill();
  });
}
function texPicho(U, linhas, cor = 'rgba(110,8,6,.88)', tam = 46) {
  return U.tex(512, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = cor; g.textAlign = 'center';
    linhas.forEach((l, i) => { g.font = `bold ${tam}px Georgia`; g.save(); g.translate(w / 2, (h / (linhas.length + 1)) * (i + 1) + 12); g.rotate((Math.random() - .5) * .08); g.fillText(l, 0, 0); g.restore(); });
    for (let i = 0; i < 14; i++) { const x = 60 + Math.random() * 390, y = 90 + Math.random() * 120; g.fillRect(x, y, 3, 18 + Math.random() * 50); }
  });
}
function texPegada(U) {
  return U.tex(64, 96, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(14,20,18,.85)';
    g.beginPath(); g.ellipse(32, 58, 13, 24, 0, 0, 7); g.fill();
    for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(20 + i * 6.5, 26 - Math.abs(i - 1.5) * 2.5, 3.6, 4.6, 0, 0, 7); g.fill(); }
  });
}
function texRelogio(U, h, m) {
  return U.tex(128, 128, (g) => {
    g.fillStyle = '#b8ab8a'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = '#211'; g.lineWidth = 3; g.stroke();
    g.fillStyle = '#211'; g.font = '14px Georgia'; g.textAlign = 'center';
    const rom = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2; g.fillText(rom[i - 1], 64 + Math.sin(a) * 46, 69 - Math.cos(a) * 46); }
    const ah = ((h % 12) + m / 60) / 12 * Math.PI * 2, am = m / 60 * Math.PI * 2;
    g.lineWidth = 4; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.sin(ah) * 30, 64 - Math.cos(ah) * 30); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.sin(am) * 46, 64 - Math.cos(am) * 46); g.stroke();
  });
}

// Esconderijo mais próximo se acende quando as luzes piscam + dedos do Inspetor na quina da porta
function comuns(A, S, U) {
  const { THREE, MAT, box, SFX } = A;
  // --- destaque do esconderijo na Procissão
  const luzH = new THREE.PointLight(0xff9a40, 0, 5, 1.6); A.W.grupo.add(luzH);
  let hl = null;
  // --- dedos
  const pele = new THREE.MeshStandardMaterial({ color: 0x4a4038, roughness: .55 });
  const mao = new THREE.Group(); mao.visible = false; A.W.grupo.add(mao);
  for (let i = 0; i < 4; i++) { const f = box(.24 - Math.abs(i - 1.5) * .03, .022, .03, pele, 0, -i * .065, 0, mao, false); f.position.x = .1; }
  box(.05, .26, .05, pele, -.02, -.1, 0, mao, false);
  let dedos = null, dedosCool = 25;
  A.W.tick.push(dt => {
    const PR = window.__jogo && window.__jogo.PROC;
    // destaque
    if (PR && PR.fase === 'aviso') {
      if (!hl) {
        let melhor = null, dm = 1e9;
        for (const L of A.W.lockers) { const d = U.dist(L.x, L.z); if (d < dm) { dm = d; melhor = L; } }
        if (melhor && dm < 26) {
          hl = melhor; luzH.position.set(melhor.x, melhor.tipo === 'cama' ? .9 : 2.35, melhor.z);
          const n = S.flags.dicaEsconde | 0;
          if (n < 2) { S.flags.dicaEsconde = n + 1; const sala = A.roomAt(melhor.x, melhor.z); A.sub('lia', `${melhor.tipo === 'cama' ? 'Embaixo da cama' : 'O armário'} — ${sala.nome.toLowerCase()}! Rápido!`); }
        } else hl = 'nada';
      }
      if (hl && hl !== 'nada') luzH.intensity = 2.2 + Math.sin(A.perf() * 9) * 1.3;
    } else if (hl) { hl = null; luzH.intensity = 0; }
    // dedos na quina da porta
    dedosCool -= dt;
    const M = A.M;
    if (dedos) {
      dedos.t -= dt;
      const lit = S.flashOn && U.olhando(mao.position.x, mao.position.y, mao.position.z, .94, 10);
      if (lit || dedos.t <= 0 || !M.ativo || M.pos.distanceTo(new THREE.Vector3(dedos.l.x, 0, dedos.l.z)) > 4.5 || M.state === 'caca') {
        mao.visible = false; if (lit) { SFX.estalo(M.pos, .8); S.fear = Math.min(100, S.fear + 18); } dedos = null; dedosCool = 45;
      }
    } else if (dedosCool <= 0 && M.ativo && (M.state === 'procura' || M.state === 'investiga') && !S.hidden && !A.P.room.fora) {
      const rm = A.roomAt(M.pos.x, M.pos.z);
      if (rm !== A.P.room) {
        const l = A.W.links.find(k => ((k.a === rm.id && k.b === A.P.room.id) || (k.b === rm.id && k.a === A.P.room.id)) && (!k.door || k.door.open));
        if (l && Math.hypot(M.pos.x - l.x, M.pos.z - l.z) < 4 && U.dist(l.x, l.z) > 2.6 && U.dist(l.x, l.z) < 9) {
          // lado do jogador em relação à porta
          const s = l.eixo === 'x' ? Math.sign(A.P.pos.z - l.z) || 1 : Math.sign(A.P.pos.x - l.x) || 1;
          if (l.eixo === 'x') { mao.position.set(l.x + .78, 2.05, l.z + s * .07); mao.rotation.set(0, s > 0 ? 0 : Math.PI, 0); }
          else { mao.position.set(l.x + s * .07, 2.05, l.z + .78); mao.rotation.set(0, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0); }
          mao.visible = true; dedos = { l, t: 7 }; dedosCool = 45;
        }
      }
    }
  });
}

// =====================================================================
// TÉRREO
// =====================================================================
export function extrasTerreo(A, S, ctx) {
  const { THREE, MAT, box, cyl, plano, interact, SFX, rand } = A;
  const U = base(A, S), H = {};
  comuns(A, S, U);
  const W = A.W;
  const lamp = (x, z) => W.lampadas.reduce((a, b) => Math.hypot(b.x - x, b.z - z) < Math.hypot(a.x - x, a.z - z) ? b : a, W.lampadas[0]);
  const lampSala = id => W.lampadas.filter(L => A.roomAt(L.x, L.z).id === id);

  // --- linguagem de luz: corredores frios e nervosos, velas quentes sobre os esconderijos
  const lampCorr = [...lampSala('ce'), ...lampSala('cw')];
  for (const L of lampCorr) { L.luz.color.setHex(0xb2d2aa); L.base = 5.2; }
  // --- esconderijos garantidos (corredores, recepção, casa de máquinas)
  A.armario(16.5, -10.42, [0, -1]); A.armario(33.4, -12, [-1, 0]);
  A.armario(-20, -10.42, [0, -1]); A.armario(-33.4, -12, [1, 0]);
  A.armario(5.55, -8.2, [-1, 0]);
  const armMaq = A.armario(27.4, -14.45, [0, -1]);
  A.vela(16.5, 2.06, -10.42); A.vela(-20, 2.06, -10.42); A.vela(5.55, 2.06, -8.2);
  const luzFuga = new THREE.PointLight(0xff8a30, 0, 6, 1.5); luzFuga.position.set(27.4, 2.4, -14.7); W.grupo.add(luzFuga);

  // --- relógios: 20h47 no Cap. I, 21h00 em ponto a partir das badaladas
  const rel1 = texRelogio(U, 8, 47), rel2 = texRelogio(U, 9, 0);
  const relogios = ctx.relogios || [];
  const syncRel = () => { for (const m of relogios) { const t = S.chapter >= 2 ? rel2 : rel1; if (m.material.map !== t) { m.material.map = t; m.material.needsUpdate = true; } } };
  let ticT = 0;

  // --- porta principal: rangido cresce a cada pulso, soltar guarda o progresso
  const dMain = A.DOOR('main'), itMain = dMain && W.inter.find(i => i.obj === dMain.pivot);
  let ult = -9, cPress = 0, guardado = 0, pulsos = 0, pico = 0;
  if (itMain) {
    const holdBase = itMain.hold || 3, lb = itMain.label;
    const fecharPress = () => { if (cPress && A.perf() - ult > .75) { guardado = Math.min(holdBase - .6, guardado + Math.max(0, cPress - 1) * .6); cPress = 0; } };
    Object.defineProperty(itMain, 'hold', { configurable: true, get: () => Math.max(.6, holdBase - guardado) });
    Object.defineProperty(itMain, 'ruido', {
      configurable: true, get() {
        fecharPress();
        const t = A.perf(); pulsos = t - ult < 1.1 ? pulsos + 1 : 0; ult = t; cPress++;
        const r = Math.min(14, 4 + pulsos * 2.5); pico = Math.max(pico, r);
        if (!S.flags.dicaPulso) { S.flags.dicaPulso = true; A.toast('Soltar o E faz o rangido parar. Ela cede aos poucos.'); }
        if (pulsos >= 3) A.P.shake = Math.max(A.P.shake, .02 + pulsos * .006);
        return r;
      }
    });
    itMain.label = () => { fecharPress(); const s = lb(); return guardado > 0 && !dMain.open && s.includes('Forçar') ? `${s} — já cedeu ${Math.round(guardado / holdBase * 100)}%` : s; };
  }
  H.inspAcorda = () => pico >= 11.5 ? 22 : pico >= 9 ? 32 : 45;
  H.pontoDespertar = () => {
    for (const [x, z] of [[-29, -20], [-27, -5], [20, -20], [28, -5], [-15, -20]]) if (U.dist(x, z) >= 14) return [x, z];
    return [-29, -20];
  };
  H.despertou = (x, z) => { SFX.voz({ x, z }); A.sub('inspetor', 'Quem abriu a porta da frente?'); };

  // --- gerador: as luzes voltam uma a uma e revelam ele no fim do corredor
  let cascata = null, fuga = null;
  H.ligarGerador = () => {
    S.flags.energia = true; SFX.gerador(true, { x: 31.6, y: 1, z: -19 }); A.emitNoise(31.6, -19, 45); A.conquista('luz');
    const rev = lamp(10.6, -12);
    const ordem = W.lampadas.filter(L => L !== rev).sort((a, b) => Math.hypot(a.x - 31.6, a.z + 19) - Math.hypot(b.x - 31.6, b.z + 19));
    ordem.push(rev);
    for (const L of W.lampadas) { L.ligada = false; L.luz.intensity = 0; L.bulbo.material.emissiveIntensity = 0; }
    cascata = { ordem, i: 0, t: .5, rev };
    fuga = { t: 0, escondida: 0, fim: false, dicaFolego: false };
    U.depois(1.2, () => A.falar('gerador'));
  };
  const revelar = L => {
    const M = A.M;
    if (!M.ativo) A.ativarInspetor(L.x, L.z, 'investiga');
    else if (Math.hypot(M.pos.x - L.x, M.pos.z - L.z) > 8 && M.pos.distanceTo(A.P.pos) > 14) M.pos.set(L.x, 0, L.z);
    M.state = 'investiga'; A.planejar(M, 29, -15.6); M.cool = 2; M.furia = 6 * A.D().vel; M.recuo = 0;
    SFX.susto(); SFX.voz(M.pos); A.P.shake = .1;
    A.sub('lia', 'Ele tá no fim do corredor. O armário perto da porta, AGORA!', true);
    A.toast('ESCONDA-SE: armário ao lado da porta da casa de máquinas.');
  };
  W.tick.push(dt => {
    if (cascata) {
      cascata.t -= dt;
      if (cascata.t <= 0) {
        const L = cascata.ordem[cascata.i++];
        L.ligada = true; L.luz.intensity = L.base; L.bulbo.material.emissiveIntensity = 2; SFX.clique();
        if (L === cascata.rev) { revelar(L); cascata = null; A.syncWorld(); }
        else cascata.t = .2;
      }
    }
    if (fuga && !fuga.fim) {
      fuga.t += dt;
      luzFuga.intensity = Math.sin(A.perf() * 10) > 0 ? 2.4 : 0;
      if (S.hidden) {
        fuga.escondida += dt;
        if (!fuga.dicaFolego && A.M.ativo && A.M.pos.distanceTo(A.P.pos) < 6) { fuga.dicaFolego = true; A.toast('Segure ESPAÇO para prender a respiração.'); }
      }
      if ((fuga.escondida >= 6 && (!A.M.ativo || A.M.pos.distanceTo(A.P.pos) > 3)) || fuga.t >= 20) {
        fuga.fim = true; luzFuga.intensity = 0;
        A.objDone('gerador'); U.depois(1, () => A.sub('lia', 'Ele foi atrás do barulho do motor... Agora vai ser assim a noite toda.'));
      }
      if (S.dead) { fuga = null; luzFuga.intensity = 0; }
    }
  });

  // --- itens de missão com consequência
  H.galaoPego = () => { SFX.arrastar(); U.depois(4.5, () => A.sub('lia', 'Alguma coisa se arrastou no andar de cima.')); };
  let galaoT = 0;
  W.tick.push(dt => {
    if (!S.inv.galao || S.flags.energia) return;
    galaoT -= dt;
    if (A.P.sprinting && galaoT <= 0) {
      galaoT = .7; A.emitNoise(A.P.pos.x, A.P.pos.z, 9); SFX.clique();
      if (!S.flags.dicaGalao) { S.flags.dicaGalao = true; A.toast('O galão chacoalha quando você corre.'); }
    }
  });
  H.fusiveisPegos = () => {
    const d = A.DOOR('enferm');
    if (d && d.open && U.dist(d.x, d.z) > 2.2) U.depois(.9, () => { if (U.dist(d.x, d.z) > 1.6) { A.setDoor(d, false, true); SFX.pancada(d.x, d.z); A.P.shake = .08; A.sub('lia', 'A porta... fechou sozinha.'); } });
  };

  // --- atalhos com trinco: só abrem de dentro, e o trinco faz barulho
  H.trinco = (id, dentro) => {
    const d = A.DOOR(id); if (!d || S.flags['trinco_' + id]) return;
    if (A.P.room && A.P.room.id === dentro) {
      S.flags['trinco_' + id] = true; SFX.clique(); A.setDoor(d, true); A.emitNoise(d.x, d.z, 8);
      A.toast('Você puxou o trinco. O atalho ficou aberto.');
    } else A.toast('Trancada pelo outro lado. Dá pra ouvir um trinco solto.');
  };

  // --- Cap. II: corredor oeste barrado por camas empilhadas (só some do caminho quando você está longe)
  const pilha = new THREE.Group(); W.grupo.add(pilha); pilha.visible = false;
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Group(); c.position.set(-5.25 + (i % 2) * .2, .45 + i * .55, -12 + (i - 1) * .3); c.rotation.set(rand(-.3, .3), i * .7, rand(-.5, .5)); pilha.add(c);
    box(.85, .08, 1.9, MAT.ferrugem, 0, 0, 0, c); box(.8, .12, 1.8, MAT.colchao, 0, .1, 0, c);
  }
  const colPilha = A.addCollider(-5.95, -4.55, -13.4, -10.6); colPilha.on = false;
  interact(pilha, () => 'Camas empilhadas bloqueiam o corredor oeste. Alguém arrastou tudo isso até aqui.', () => { A.toast('Pesado demais. E faria barulho demais.'); });
  const dCW = A.DOOR('hcw');
  if (dCW) { dCW.trava = () => !!S.flags.barricada; dCW.msg = 'Do outro lado, camas empilhadas seguram a porta.'; }
  const OESTE = ['hall', 'cw', 'aula', 'biblio', 'refeit', 'cozinha', 'despensa', 'patio'];

  // --- Cap. II: o prédio mudou
  const volte = plano(3.4, 1.7, new THREE.MeshStandardMaterial({ map: texPicho(U, ['VOLTE PARA', 'A CAMA']), transparent: true, roughness: .9 }), .4, 2.1, -13.88);
  const rastro = new THREE.Group(); W.grupo.add(rastro);
  const matTinta = new THREE.MeshStandardMaterial({ map: U.tex(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(96,8,6,.9)'; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(32 + rand(-14, 14), 32 + rand(-14, 14), rand(3, 11), 0, 7); g.fill(); } }), transparent: true, roughness: .3, depthWrite: false });
  for (const [x, z] of [[0, -1.5], [.9, -2.6], [2.1, -3.4], [3.3, -4.2], [4.6, -4.8], [5.6, -5.1], [6.6, -5], [7.8, -4.6], [9.1, -4.3], [10.4, -4.6], [11.2, -5.1]]) {
    const m = plano(.5, .5, matTinta, x, .004, z, 0, rastro); m.rotation.x = -Math.PI / 2; m.rotation.z = rand(0, 6);
  }
  let avermelhou = false, fixProc = false, badal = null, dim = 0;
  const mataHall = () => { const L = lamp(0, -7); if (L && A.roomAt(L.x, L.z).id === 'hall') { L.base = 0; L.luz.intensity = 0; L.bulbo.material.emissive.setHex(0x000000); } };
  H.inicioCapitulo = cap => { if (cap === 2) { badal = { n: 0, t: .3 }; syncRel(); } };
  W.tick.push(dt => {
    // checkpoint do Cap. II não pode adiar a primeira Procissão
    if (!fixProc) { fixProc = true; if (S.chapter === 2 && !S.done.procissao) S.timers.procissao = Math.min(S.timers.procissao, 28); }
    if (S.chapter >= 2 && S.flags.energia && !avermelhou) {
      avermelhou = true; const v = new THREE.Color(0xff5a40);
      for (const L of W.lampadas) { L.luz.color.lerp(v, .45); L.base *= .8; }
      if (S.flags.lampHallMorta) mataHall();
      A.syncLuzes();
    }
    // nove badaladas que mexem no prédio
    if (badal) {
      badal.t -= dt;
      if (badal.t <= 0) {
        badal.n++; badal.t = 2.2; SFX.sino(.45, null); dim = .4;
        for (const L of W.lampadas) if (L.ligada) L.luz.intensity = L.base * .3;
        const abertas = W.doors.filter(d => d.open && d.id !== 'main' && U.dist(d.x, d.z) > 2.5 && U.dist(d.x, d.z) < 26);
        const d = abertas.length ? A.pick(abertas) : null;
        if (d) { A.setDoor(d, false, true); SFX.pancada(d.x, d.z); }
        if (badal.n >= 9) { S.flags.lampHallMorta = true; mataHall(); badal = null; A.P.shake = .06; }
      }
    }
    if (dim > 0) { dim -= dt; if (dim <= 0) { const PR = window.__jogo && window.__jogo.PROC; if (!(PR && PR.fase)) for (const L of W.lampadas) if (L.ligada) L.luz.intensity = L.base; } }
    // barricada
    if (S.chapter >= 2 && !S.flags.barricada && A.P.room && !OESTE.includes(A.P.room.id)) S.flags.barricada = true;
    const bar = !!S.flags.barricada;
    if (pilha.visible !== bar) { pilha.visible = bar; colPilha.on = bar; if (bar && dCW && dCW.open) A.setDoor(dCW, false, true); }
    // relógio da recepção: tique-taque até as nove
    ticT -= dt;
    if (ticT <= 0) { ticT = 1; if (S.chapter < 2 && U.dist(-3.5, -13.8) < 7) SFX.clique(); }
    // corredores: lâmpadas frias mais nervosas
    for (const L of lampCorr) if (L.flick > 1.4) L.flick = rand(.05, 1.4);
    volte.visible = S.chapter >= 2; rastro.visible = S.chapter >= 2 && !S.fitas.f1;
  });

  // --- Cap. II: o corredor leste se alonga (uma vez, depois da Procissão)
  let ilusao = null;
  W.tick.push(dt => {
    if (!ilusao) return;
    ilusao.t += dt; const k = ilusao.t < 1.5 ? ilusao.t / 1.5 : ilusao.t > 5 ? Math.max(0, (6.5 - ilusao.t) / 1.5) : 1;
    if (H.def && H.def.dentro) H.def.dentro.fog = .1 + .15 * k;
    if (ilusao.t >= 6.5) { if (H.def && H.def.dentro) H.def.dentro.fog = .1; for (const L of ilusao.ls) L.ligada = true; A.syncLuzes(); ilusao = null; }
  });

  // --- telefone da recepção (Cap. II)
  const tel = new THREE.Group(); tel.position.set(.3, 1.16, -4.15); W.grupo.add(tel);
  box(.26, .09, .2, MAT.preto, 0, .045, 0, tel); const fone = cyl(.03, .03, .26, MAT.preto, 0, .12, -.02, 8, tel); fone.rotation.z = Math.PI / 2;
  let tocando = 0, tocT = 0;
  interact(tel, () => tocando > 0 ? '<b>E</b>Atender o telefone' : 'Um telefone preto. O fio foi cortado.', () => {
    if (tocando <= 0) return;
    tocando = 0; SFX.clique(); fone.position.y = .2;
    A.sub('davi', '(chiando) Lia... a fita do diretor fala o número do quadro.');
    U.depois(4.6, () => A.sub('davi', '(chiando) Digita certo de primeira. Ele escuta o teclado.'));
    U.depois(9, () => { fone.position.y = .12; A.sub('lia', 'O fio tá cortado. O fio tá CORTADO.'); });
  });
  W.tick.push(dt => {
    if (tocando <= 0) return;
    tocando -= dt; tocT -= dt;
    if (tocT <= 0) { tocT = 2.4; A.emitNoise(.3, -4.15, 10); }
  });

  // --- quadro de chaves: o erro faz barulho; três erros travam e chamam ele
  let errosQ = 0, travaQ = 0;
  W.tick.push(dt => { if (travaQ > 0) travaQ -= dt; });
  H.quadroTravado = () => travaQ > 0 ? `Quadro de chaves travado (${Math.ceil(travaQ)}s). O alarme ainda tilinta.` : null;
  H.erroQuadro = () => {
    errosQ++; A.emitNoise(3, -13, 10); SFX.vidro(3, -13.6);
    if (errosQ >= 3) {
      errosQ = 0; travaQ = 10;
      for (let i = 0; i < 4; i++) U.depois(.3 + i * .5, () => SFX.vidro(3, -13.6));
      A.emitNoise(3, -13, 40);
      const M = A.M; if (M.ativo && M.state !== 'caca') { M.state = 'investiga'; A.planejar(M, 3, -12.4); }
      A.toast('Três erros: o quadro travou e o alarme disparou.');
      setTimeout(() => { if (window.__jogo && window.__jogo.ui === 'teclado') window.__jogo.onKey({ code: 'Escape', preventDefault() {} }); }, 450);
    } else A.toast(errosQ === 1 ? 'O bipe do erro ecoa pelo prédio.' : 'Mais um erro e o quadro trava.');
  };
  H.acertouQuadro = () => { errosQ = 0; };

  // --- lousa que muda quando você não está olhando
  const frases = [['Eu não vou falar', 'depois das nove.'], ['NÃO FALE'], ['NÃO CORRA'], ['ELE OUVE'], ['LIA'], ['ATRÁS DE VOCÊ']];
  const lousaTex = frases.map(f => U.tex(512, 180, (g, w, h) => {
    g.fillStyle = '#1d2a22'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(220,220,210,.82)'; g.textAlign = 'center'; g.font = f.length > 1 ? '34px Georgia' : 'bold 64px Georgia';
    f.forEach((l, i) => g.fillText(l, w / 2, h / 2 + 22 - (f.length - 1) * 22 + i * 46));
    g.fillStyle = 'rgba(200,200,200,.06)'; for (let i = 0; i < 9; i++) g.fillRect(Math.random() * w, Math.random() * h, 80, 30);
  }));
  const lousaM = new THREE.MeshStandardMaterial({ map: lousaTex[0], roughness: .9 });
  const lousa = plano(4, 1.4, lousaM, -6.135, 1.7, -5, -Math.PI / 2);
  let lI = 0, lFora = 0, lVista = true;
  W.tick.push(dt => {
    if (!A.P.room || A.P.room.id !== 'aula' || lI >= frases.length - 1) return;
    const v = U.olhando(lousa.position.x, 1.7, lousa.position.z, .55, 18);
    if (!v) { lFora += dt; if (lVista && lFora > 1.2) { lVista = false; lI++; lousaM.map = lousaTex[lI]; lousaM.needsUpdate = true; } }
    else { lFora = 0; if (!lVista) { lVista = true; if (lI === frases.length - 1) { const f = new THREE.Vector3(); A.camera.getWorldDirection(f); SFX.risada(A.P.pos.x - f.x * 1.6, A.P.pos.z - f.z * 1.6); S.fear = Math.min(100, S.fear + 25); } } }
  });

  // --- refeitório: cadeiras que se viram e pratos servidos
  const cadeiras = [];
  for (const z of [-24, -20, -16]) for (const [x, ry] of [[-21.6, -Math.PI / 2], [-8.4, Math.PI / 2]]) {
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; W.grupo.add(c);
    box(.44, .05, .44, MAT.madeiraEsc, 0, .45, 0, c); box(.44, .5, .05, MAT.madeiraEsc, 0, .72, -.2, c);
    for (const [dx, dz] of [[-.19, -.19], [.19, -.19], [-.19, .19], [.19, .19]]) box(.04, .45, .04, MAT.madeiraEsc, dx, .22, dz, c, false);
    A.addCollider(x - .25, x + .25, z - .25, z + .25); cadeiras.push(c);
  }
  const pratos = new THREE.Group(); pratos.visible = false; W.grupo.add(pratos);
  const matPrato = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: .4 }), matSopa = new THREE.MeshStandardMaterial({ color: 0x4a1a10, roughness: .2 });
  for (const z of [-24.25, -19.75, -16.25]) for (const x of [-19.6, -16, -14.2, -10.5]) cyl(.13, .11, .02, matPrato, x, .83, z, 12, pratos);
  cyl(.1, .1, .01, matSopa, -14.2, .845, -19.75, 12, pratos);
  let refVisitas = 0;

  // --- cacos de vidro: dá pra ver sob a lanterna, e agachada você pisa com cuidado
  const matCacos = new THREE.MeshStandardMaterial({ map: texCacos(U), transparent: true, roughness: .12, metalness: .7, emissive: 0x1a2424, emissiveIntensity: .35, depthWrite: false });
  for (const [x, z] of [[14, -11.3], [23.5, -12.6], [-10, -12.4], [-25, -11.5], [11.5, -21]]) {
    const m = plano(1.1, 1.1, matCacos, x, .005, z); m.rotation.x = -Math.PI / 2;
    A.gatilho('cacos' + x, x - .55, x + .55, z - .55, z + .55, () => {
      if (A.P.crouch) { SFX.clique(); A.emitNoise(x, z, 2.5); return; }
      SFX.vidro(x, z); A.emitNoise(x, z, 10, true);
      if (!S.flags.dicaCacos) { S.flags.dicaCacos = true; A.toast('Cacos de vidro. Agachada (C) você pisa sem barulho.'); }
    }, false);
  }

  // --- vulto atrás dos lençóis da lavanderia
  const vl = ctx.vulto ? ctx.vulto(A) : null; let vlT = -1;
  if (vl) vl.position.set(11, 0, -22.6);
  W.tick.push(dt => {
    if (!vl || vlT < 0) return;
    vlT += dt;
    const lit = S.flashOn && U.olhando(11, 2.4, -22.6, .96, 14);
    if (lit) vl.userData.lit = (vl.userData.lit || 0) + dt;
    if (U.dist(11, -22.6) < 4.5 || (vl.userData.lit || 0) > .35 || vlT > 25) { vl.visible = false; vlT = -1; SFX.sussurros(1.2); S.fear = Math.min(100, S.fear + 15); }
  });

  // --- sustos pequenos de sala
  A.gatilho('banhCabine', 16, 24, -26, -14, () => { U.depois(.6, () => { SFX.pancada(17.4, -25.2); A.P.shake = .05; }); });
  A.gatilho('cozinhaPanela', -34, -24, -26, -14, () => { U.depois(1.4, () => { SFX.pancada(-31, -24); SFX.vidro(-31, -24); A.emitNoise(-31, -24, 6); }); });
  A.gatilho('biblioLivro', -34, -20, -10, 0, () => { U.depois(2, () => SFX.pancada(-29.6, -5.8)); });
  A.gatilho('aulaCarteira', -20, -6, -10, 0, () => { U.depois(1.2, () => SFX.arrastar()); });

  // --- segredo: o livro torto da biblioteca
  const livro = box(.07, .3, .2, new THREE.MeshStandardMaterial({ color: 0x6a1a14, roughness: .7, emissive: 0x220806, emissiveIntensity: .5 }), -24.06, 1.47, -5.1);
  interact(livro, () => S.flags.seg_livro ? 'Um livro torto: "Regulamento Interno, 1961".' : '<b>E</b>Puxar o livro torto da estante', () => {
    if (S.flags.seg_livro) return;
    S.flags.seg_livro = true; livro.rotation.z = .5; livro.position.x += .08; SFX.rangido(-24.1, 1.4, -5.1, .5); A.emitNoise(-24.1, -5.1, 3);
    A.dialogo([
      { quem: 'lia', texto: 'Atrás do livro tem um papel dobrado. Um mapa do prédio, desenhado a lápis.' },
      { quem: 'lia', texto: 'Na casa de máquinas, um X: "O HOMEM DORME AQUI". No fim do corredor de cima: "O TOMÉ ESCONDE COISAS NO RODAPÉ".' },
      { quem: 'lia', texto: 'E uma pilha, embrulhada no papel. Obrigada, Davi.' }
    ], () => { S.inv.pilhas++; U.segredo('livro', 'Achou o mapa do Davi e uma pilha.'); });
  });

  // --- segredo: o retrato do diretor que se vira para a parede
  const ret = new THREE.Group(); ret.position.set(17.9, 1.9, -2.4); ret.rotation.y = -Math.PI / 2; W.grupo.add(ret);
  const tRet = U.tex(256, 320, (g, w, h) => {
    g.fillStyle = '#1a120c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6a5226'; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14);
    g.fillStyle = '#2e241b'; g.beginPath(); g.ellipse(128, 300, 100, 120, 0, 0, 7); g.fill();
    g.fillStyle = '#7c6a58'; g.beginPath(); g.ellipse(128, 130, 50, 64, 0, 0, 7); g.fill();
    g.fillStyle = '#120c08'; g.fillRect(96, 116, 22, 8); g.fillRect(138, 116, 22, 8); g.fillRect(110, 170, 36, 4);
    g.fillStyle = '#b8a070'; g.font = 'italic 18px Georgia'; g.textAlign = 'center'; g.fillText('Diretor Albano · 1971', 128, 296);
  });
  const tVerso = U.tex(256, 320, (g, w, h) => { g.fillStyle = '#4a3a28'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(20,14,10,.85)'; g.font = '22px Georgia'; g.textAlign = 'center'; for (let i = 0; i < 9; i++) g.fillText('NÃO OLHA PRA MIM', 128, 50 + i * 30); });
  plano(.7, .88, new THREE.MeshStandardMaterial({ map: tRet, roughness: .6 }), 0, 0, .01, 0, ret);
  plano(.7, .88, new THREE.MeshStandardMaterial({ map: tVerso, roughness: 1 }), 0, 0, -.01, Math.PI, ret);
  let diretVisitas = 0;
  interact(ret, () => S.flags.retVirado && !S.flags.seg_retrato ? '<b>E</b>Desvirar o retrato do diretor' : 'Retrato do Diretor Albano.', () => {
    if (!S.flags.retVirado || S.flags.seg_retrato) return;
    S.flags.seg_retrato = true; ret.rotation.y = -Math.PI / 2; SFX.arrastar();
    A.dialogo([
      { quem: 'lia', texto: 'Atrás do quadro, um buraco na parede. Um curativo e um bilhete com letra de criança:' },
      { quem: 'davi', texto: '“Ele ouve o teclado do quadro. Digita certo de primeira.”' }
    ], () => { S.inv.kits++; U.segredo('retrato', 'Achou um curativo atrás do retrato.'); });
  });

  // --- placa da recepção
  if (ctx.placa) ctx.placa(A, [{ t: 'HORA DO SILÊNCIO', tam: 40, estilo: 'bold' }, { t: 'das 21h até o sino', tam: 28, estilo: 'italic' }, { t: 'Quem fala vai para o armário.', tam: 24 }], -3.4, 1.9, -.08, 2.2, 1.1, Math.PI);

  // --- ganchos
  H.entrouSala = r => {
    if (r.id === 'hall' && S.done.forcar_porta && !S.flags.portaBateu) {
      S.flags.portaBateu = true;
      U.depois(1.6, () => { if (dMain && dMain.open && U.dist(0, 0) > 3) { A.setDoor(dMain, false, true); SFX.pancada(0, 0); A.P.shake = .12; A.sub('lia', 'A porta bateu atrás de mim.'); } });
    }
    if (r.id === 'hall' && S.chapter === 2 && S.flags.energia && !S.flags.telefone) { S.flags.telefone = true; U.depois(2.5, () => { tocando = 9; tocT = 0; SFX.orelhao({ x: .3, y: 1.2, z: -4.15 }); }); }
    if (r.id === 'ce' && S.chapter === 2 && !S.done.procissao && S.timers.procissao > 4) S.timers.procissao = 4;
    if (r.id === 'ce' && S.chapter === 2 && S.done.procissao && !S.flags.corrLongo && !ilusao) {
      S.flags.corrLongo = true;
      const ls = lampSala('ce').filter(L => L.ligada);
      for (const L of ls) { L.ligada = false; L.luz.intensity = 0; L.bulbo.material.emissiveIntensity = 0; }
      ilusao = { t: 0, ls }; SFX.sussurros(3);
    }
    if (r.id === 'refeit') {
      refVisitas++;
      if (refVisitas === 2) {
        for (const c of cadeiras) c.rotation.y = Math.atan2(-15 - c.position.x, -14 - c.position.z);
        pratos.visible = true; for (let i = 0; i < 3; i++) U.depois(.8 + i * .7, () => SFX.vidro(-14.2, -19.75));
      }
    }
    if (r.id === 'diret') { diretVisitas++; if (diretVisitas === 2 && !S.flags.retVirado) { S.flags.retVirado = true; ret.rotation.y = Math.PI / 2; } }
    if (r.id === 'lavand' && vl && !S.flags.vultoLav) { S.flags.vultoLav = true; vl.visible = true; vlT = 0; }
  };
  H.sync = () => { syncRel(); if (S.flags.retVirado && !S.flags.seg_retrato) ret.rotation.y = Math.PI / 2; if (S.flags.seg_livro) { livro.rotation.z = .5; } };
  return H;
}

// =====================================================================
// ANDAR DE CIMA — DORMITÓRIOS
// =====================================================================
export function extrasSuperior(A, S, ctx) {
  const { THREE, MAT, box, cyl, plano, interact, SFX, rand } = A;
  const U = base(A, S), H = {};
  comuns(A, S, U);
  const W = A.W;
  const camas = id => W.lockers.filter(L => L.tipo === 'cama' && A.roomAt(L.x, L.z).id === id);
  const temItem = L => W.items.some(i => Math.hypot(i.mesh.position.x - L.x, i.mesh.position.z - L.z) < 1.15);
  const corpo = (L, mat = MAT.lencol) => {
    const g = new THREE.Group(); g.position.set(L.x, 0, L.z); g.visible = false; W.grupo.add(g);
    const c = cyl(.2, .23, 1.45, mat, .12, .73, 0, 10, g); c.rotation.z = Math.PI / 2; c.scale.set(1, 1, .8);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), mat); cab.position.set(-.68, .77, 0); g.add(cab);
    return g;
  };
  const sentado = L => {
    const g = new THREE.Group(); g.position.set(L.x - .35, 0, L.z); g.visible = false; W.grupo.add(g);
    cyl(.13, .32, .8, MAT.lencol, 0, 1.0, 0, 10, g);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.15, 10, 8), MAT.lencol); cab.position.y = 1.5; cab.scale.set(1, 1.15, 1); g.add(cab);
    return g;
  };

  // --- esconderijos no corredor de 56 m (antes não tinha nenhum)
  A.armario(-2.55, -14, [1, 0]); A.armario(2.55, -38, [-1, 0]); A.armario(-2.55, -47.5, [1, 0]);
  A.vela(-2.55, 2.06, -14); A.vela(2.55, 2.06, -38);
  const lampCorr = W.lampadas.filter(L => A.roomAt(L.x, L.z).id === 'corr');

  // --- retratos das turmas no corredor (o de 1979 muda depois da brincadeira)
  const turma = (ano, riscados, inspetor) => U.tex(256, 196, (g, w, h) => {
    g.fillStyle = '#5a4a34'; g.fillRect(0, 0, w, h); g.fillStyle = '#9a8a6a'; g.fillRect(10, 10, w - 20, h - 46);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 7; i++) {
      const x = 32 + i * 32, y = 60 + r * 52;
      g.fillStyle = '#3a2e22'; g.beginPath(); g.arc(x, y, 10, 0, 7); g.fill(); g.fillRect(x - 11, y + 10, 22, 26);
      if (riscados.includes(r * 7 + i)) { g.strokeStyle = 'rgba(20,4,2,.95)'; g.lineWidth = 5; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(x - 12, y - 10 + k * 3); g.lineTo(x + 12, y - 12 + k * 4); g.stroke(); } }
    }
    if (inspetor) { g.fillStyle = '#0a0806'; g.fillRect(118, 6, 20, 120); g.beginPath(); g.ellipse(128, 12, 10, 16, .4, 0, 7); g.fill(); g.fillStyle = '#bcae94'; g.fillRect(118, 6, 20, 5); }
    g.fillStyle = '#e0d4b0'; g.font = 'italic 20px Georgia'; g.textAlign = 'center'; g.fillText(`Turma de ${ano}`, w / 2, h - 14);
  });
  const t79 = turma(1979, [3, 9, 11], false), t79b = turma(1979, [3, 9, 11], true);
  const retratos = [[1976, -11.5], [1977, -23.5], [1978, -35.5], [1979, -47.5]].map(([ano, z]) => plano(.84, .64, new THREE.MeshStandardMaterial({ map: ano === 1979 ? t79 : turma(ano, [], false), roughness: .8 }), 2.855, 1.8, z, -Math.PI / 2));
  const ret79 = retratos[3];

  // --- pichações
  plano(2.4, 1.2, new THREE.MeshStandardMaterial({ map: texPicho(U, ['NÃO PARE', 'DE OLHAR']), transparent: true, roughness: .9 }), 2.885, 1.5, -27, -Math.PI / 2);

  // --- Dormitório C: as camas mudam quando você vira de costas
  const cC = camas('dormC').filter(L => !temItem(L));
  const corposC = cC.map(L => corpo(L));
  const sentadaC = cC.length ? sentado(cC[Math.floor(cC.length / 2)]) : null;
  let cEst = 0, cFora = 0, cCentro = cC.length ? { x: cC.reduce((s, L) => s + L.x, 0) / cC.length, z: cC.reduce((s, L) => s + L.z, 0) / cC.length } : null, cPronto = true;
  W.tick.push(dt => {
    if (!cCentro || !A.P.room || A.P.room.id !== 'dormC' || S.hidden) { if (sentadaC && sentadaC.visible && (!A.P.room || A.P.room.id !== 'dormC')) sentadaC.visible = false; return; }
    const v = U.olhando(cCentro.x, .8, cCentro.z, .2, 20);
    if (cEst < 2) {
      if (!v) { cFora += dt; if (cPronto && cFora > .8) { cPronto = false; cEst++; if (cEst === 1) corposC.forEach(g => g.visible = true); else { corposC[Math.floor(cC.length / 2)].visible = false; sentadaC.visible = true; } } }
      else { cFora = 0; if (!cPronto) { cPronto = true; SFX.sussurros(1); S.fear = Math.min(100, S.fear + (cEst === 2 ? 30 : 15)); } }
    } else if (sentadaC.visible && (U.dist(sentadaC.position.x, sentadaC.position.z) < 2.4 || (S.flashOn && U.olhando(sentadaC.position.x, 1.3, sentadaC.position.z, .97, 9)))) {
      sentadaC.visible = false; corposC.forEach(g => g.visible = false); SFX.risada(sentadaC.position.x, sentadaC.position.z); S.fear = Math.min(100, S.fear + 20);
    }
  });

  // --- depois da brincadeira, camas vazias ganham alguém (uma respira) e murcham quando você chega perto
  const volumes = [];
  for (const id of ['dormA', 'dormB', 'dormD']) {
    const cs = camas(id).filter(L => !temItem(L));
    for (let i = 0; i < Math.min(2, cs.length); i++) { const L = cs[(i * 2 + 1) % cs.length]; volumes.push({ g: corpo(L), L, resp: id === 'dormA' && i === 0, foi: false }); }
  }
  W.tick.push(() => {
    const on = !!S.done.ana;
    for (const v of volumes) {
      v.g.visible = on && !v.foi;
      if (!v.g.visible) continue;
      if (v.resp) v.g.scale.y = 1 + Math.sin(A.perf() * 2.4) * .07;
      if (U.dist(v.L.x, v.L.z) < 1.7) { v.foi = true; v.g.visible = false; SFX.arrastar(); if (v.resp) SFX.sussurros(1); }
    }
  });

  // --- pegadas molhadas de criança que levam à engrenagem
  const pegadas = new THREE.Group(); pegadas.visible = false; W.grupo.add(pegadas);
  const matPeg = new THREE.MeshStandardMaterial({ map: texPegada(U), transparent: true, roughness: .1, metalness: .35, depthWrite: false });
  const rota = [[.4, -26.5], [1, -33], [1.6, -38], [2.2, -42.8], [2.8, -44.9], [3.6, -45.15], [4.6, -45.1], [5.6, -44.9]];
  let lado = 1;
  for (let k = 0; k < rota.length - 1; k++) {
    const [x0, z0] = rota[k], [x1, z1] = rota[k + 1], len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / .55)), ang = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i < n; i++) {
      const t = i / n, px = x0 + (x1 - x0) * t + Math.cos(ang) * .09 * lado, pz = z0 + (z1 - z0) * t - Math.sin(ang) * .09 * lado; lado = -lado;
      const m = plano(.12, .19, matPeg, px, .004, pz, 0, pegadas); m.rotation.x = -Math.PI / 2; m.rotation.z = ang + Math.PI;
    }
  }
  A.gatilho('pegadas', -3, 3, -30, -24, () => { if (S.chapter >= 3 && S.inv.engrenagens < 3) { S.flags.pegadas = true; SFX.risada(4, -44); } }, false);

  // --- ao pegar a engrenagem: as portas batem uma a uma e alguém conta no depósito
  H.engrenagemPega = () => {
    const ordem = ['dA', 'rp', 'dB', 'dD', 'bS', 'br', 'dC', 'dE', 'so'].map(id => A.DOOR(id)).filter(Boolean);
    ordem.forEach((d, i) => U.depois(.8 + i * .4, () => {
      if (U.dist(d.x, d.z) < 2.2) return;
      if (d.open) A.setDoor(d, false, true);
      SFX.pancada(d.x, d.z); A.P.shake = Math.max(A.P.shake, .04);
    }));
    const t0 = .8 + ordem.length * .4 + .6;
    for (let n = 0; n < 10; n++) U.depois(t0 + n * 1.1, () => { SFX.contagem({ x: 8, z: -55 }, n); if (n === 9) A.sub('ana', '(longe) ...DEZ. Achei você. Agora me acha.'); });
  };

  // --- monta-cargas: segure E para baixar a caixa (faz barulho de metal)
  H.prepararPoco = it => {
    if (!it) return;
    Object.defineProperty(it, 'hold', { configurable: true, get: () => S.inv.chaves.porao ? 4 : 0 });
    it.ruido = 7; it.som = 'cano'; it.pode = () => !!S.inv.chaves.porao;
  };

  // --- segredo: o rodapé solto no fim do corredor (só agachada)
  const rod = box(1.3, .26, .05, new THREE.MeshStandardMaterial({ color: 0x5a3e24, roughness: .8 }), 0, .13, -57.88);
  const itRod = interact(rod, () => {
    if (S.flags.seg_rodape) return 'Um buraco atrás do rodapé.';
    return A.P.crouch ? '<b>E</b>Forçar o rodapé solto' : 'Um pedaço de rodapé mais claro que os outros. Só agachada pra alcançar.';
  }, () => { if (!S.flags.seg_rodape && !A.P.crouch) A.toast('Agache (C) para alcançar o rodapé.'); });
  Object.defineProperty(itRod, 'hold', { configurable: true, get: () => (!S.flags.seg_rodape && A.P.crouch) ? 3 : 0 });
  itRod.ruido = 9; itRod.som = 'forcar'; itRod.pode = () => !S.flags.seg_rodape && A.P.crouch;
  const actRod = itRod.act;
  itRod.act = () => {
    if (S.flags.seg_rodape || !A.P.crouch) return actRod();
    S.flags.seg_rodape = true; rod.rotation.x = -1.2; rod.position.set(0, .05, -57.6); SFX.pancada(0, -57.6); A.syncWorld();
    A.sub('lia', 'O esconderijo do Tomé. Ninguém achou isso em quinze anos.');
    U.segredo('rodape', 'Achou o esconderijo do Tomé.');
  };
  A.item('carrinhoTome', { x: -.25, y: .02, z: -57.55 }, A.MK.carrinho(), 'Pegar o carrinho azul do Tomé', () => {
    A.sub('lia', 'O carrinho azul. Igual ele escreveu na redação.'); S.flags.carrinhoTome = true;
  }, () => !!S.flags.seg_rodape);
  A.ITENS.pilha('p4', { x: .35, y: .02, z: -57.5 });
  const itP4 = W.items.find(i => i.key === `${W.mapa}:p4`); if (itP4) itP4.cond = () => !!S.flags.seg_rodape;

  // --- segredo: a cama do Davi no dormitório A
  const cA = camas('dormA').sort((a, b) => b.z - a.z)[1];
  if (cA) {
    const tDM = U.tex(128, 64, (g, w, h) => { g.fillStyle = '#4a2c1c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b8a888'; g.lineWidth = 3; g.font = 'bold 34px Georgia'; g.textAlign = 'center'; g.strokeText('D.M.', w / 2, 44); });
    const dm = plano(.42, .2, new THREE.MeshStandardMaterial({ map: tDM, roughness: .8 }), cA.x - .96, .72, cA.z, Math.PI / 2);
    interact(dm, () => S.flags.seg_dm ? 'A cama do Davi.' : '<b>E</b>Olhar a cabeceira riscada “D.M.”', () => {
      if (S.flags.seg_dm) return;
      S.flags.seg_dm = true;
      A.dialogo([
        { quem: 'lia', texto: 'D.M. Davi Moraes. Essa era a cama dele.' },
        { quem: 'lia', texto: 'Tem um papel enfiado no estrado. Um desenho: eu e ele, de mão dada, no portão.' },
        { quem: 'davi', texto: '“Feliz aniversário, Lia. Um dia eu saio daqui.”' }
      ], () => { S.health = Math.min(100, S.health + 30); S.fear = 0; U.segredo('dm', 'O desenho do Davi te dá coragem (+vida).'); });
    });
  }

  // --- segredo: o espelho embaçado do banheiro
  const tEmb = U.tex(128, 180, (g, w, h) => { g.fillStyle = 'rgba(200,205,200,.55)'; g.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, 4 + Math.random() * 14, 0, 7); g.fill(); } });
  const tMsg = U.tex(128, 180, (g, w, h) => { g.fillStyle = 'rgba(200,205,200,.4)'; g.fillRect(0, 0, w, h); g.clearRect(14, 40, 100, 90); g.fillStyle = 'rgba(200,205,200,.5)'; g.font = 'bold 22px Georgia'; g.textAlign = 'center'; g.fillText('ELA SÓ', 64, 76); g.fillText('ANDA NO', 64, 100); g.fillText('ESCURO', 64, 124); });
  const espM = new THREE.MeshStandardMaterial({ map: tEmb, transparent: true, roughness: .4 });
  const esp = plano(.5, .7, espM, -10.2, 1.6, -26.14, Math.PI);
  interact(esp, () => S.flags.seg_espelho ? 'No espelho: ELA SÓ ANDA NO ESCURO.' : '<b>E</b>Passar a mão no espelho embaçado', () => {
    if (S.flags.seg_espelho) return;
    S.flags.seg_espelho = true; espM.map = tMsg; espM.needsUpdate = true; SFX.sussurros(1.4);
    U.depois(1.5, () => { S.inv.kits++; U.segredo('espelho', 'Atrás do espelho, um curativo.'); });
  });

  // --- o terço da Irmã Celeste (as contas batem na mesa)
  const terco = new THREE.Mesh(new THREE.TorusGeometry(.06, .008, 6, 16), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, emissive: 0x1a1008, emissiveIntensity: .6 }));
  terco.rotation.x = Math.PI / 2; terco.position.set(-4.6, .815, -53.28); W.grupo.add(terco);
  interact(terco, () => S.flags.terco ? 'As contas do terço, espalhadas.' : '<b>E</b>Pegar o terço da Irmã Celeste (as contas estão soltas)', () => {
    if (S.flags.terco) return;
    S.flags.terco = true; terco.scale.set(1.4, 1.4, .3); SFX.clique(); SFX.vidro(-4.6, -53.3); A.emitNoise(-4.6, -53.3, 12);
    A.sub('lia', 'As contas bateram na mesa. Igual no diário dela. Ele ouviu.');
  });

  // --- crucifixo que vira depois da fita da Celeste
  const cruz = new THREE.Group(); cruz.position.set(-12.9, 2.05, -53); W.grupo.add(cruz);
  box(.04, .55, .06, MAT.madeiraEsc, 0, 0, 0, cruz); box(.04, .06, .32, MAT.madeiraEsc, 0, .12, 0, cruz);
  H.fitaOuvida = id => { if (id === 'f2' && !S.flags.cruzVirou) { S.flags.cruzVirou = true; U.depois(1.2, () => { cruz.rotation.x = Math.PI; SFX.pancada(-12.9, -53); A.P.shake = .06; }); } };

  // --- bonecas com olhos que se viram para a porta, e o cavalinho que balança na chegada
  const olho = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const bonecas = W.grupo.children.filter(o => o.isGroup && Math.abs(o.position.y - 1.16) < .02 && A.roomAt(o.position.x, o.position.z).id === 'brinq');
  for (const b of bonecas) { b.rotation.y = Math.PI / 2; for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.009, 5, 4), olho); e.position.set(s * .022, .26, .05); b.add(e); } }
  let brinqVisitas = 0;

  // --- vulto no fim do corredor
  const vc = ctx.vulto ? ctx.vulto(A) : null; let vcT = -1;
  if (vc) vc.position.set(0, 0, -55.5);
  W.tick.push(dt => {
    if (vc && vcT >= 0) { vcT += dt; if (vcT > .55) { vc.visible = false; vcT = -1; SFX.estalo({ x: 0, z: -55 }, .5); } return; }
    if (!vc || S.flags.vultoCorr || S.chapter < 3 || !A.P.room || A.P.room.id !== 'corr' || A.P.pos.z < -16 || A.ANA.ativa) return;
    const f = new THREE.Vector3(); A.camera.getWorldDirection(f);
    if (f.z < -.93) { S.flags.vultoCorr = true; vc.visible = true; vcT = 0; S.fear = Math.min(100, S.fear + 20); }
  });

  // --- durante a brincadeira da Ana o corredor fica mais escuro e mais fundo
  let anaEsc = 0;
  W.tick.push(dt => {
    const alvo = A.ANA.ativa && A.ANA.script ? 1 : 0;
    if (alvo === anaEsc) return;
    anaEsc = alvo ? Math.min(1, anaEsc + dt * .5) : Math.max(0, anaEsc - dt * .5);
    if (H.def && H.def.dentro) H.def.dentro.fog = .1 + .08 * anaEsc;
    for (const L of lampCorr) { if (L._b === undefined) L._b = L.base; L.base = L._b * (1 - .65 * anaEsc); if (L.ligada) L.luz.intensity = Math.min(L.luz.intensity, L.base); }
  });

  // --- sustos de sala
  A.gatilho('pocoSobe', 3, 13, -58, -50, () => { if (!S.inv.chaves.porao) { SFX.cano({ x: 11.6, y: 1.5, z: -56 }); U.depois(1.2, () => A.sub('lia', 'Alguma coisa subiu pelo poço... e parou.')); } });
  A.gatilho('banhAbre', -3, 3, -34, -28, () => {
    if (S.flags.banhAbriu || !S.done.caixinha) return;
    const d = A.DOOR('bS'); if (!d || d.open) return;
    S.flags.banhAbriu = true; A.setDoor(d, true, true); SFX.rangido(d.x, 1.2, d.z, 1);
  }, false);

  H.entrar = cap => {
    if (cap === 3 && !S.flags.gradeBateu) { S.flags.gradeBateu = true; U.depois(4, () => { SFX.pancada(0, 7); A.P.shake = .08; A.sub('lia', 'A grade lá embaixo bateu sozinha.'); }); }
  };
  H.entrouSala = r => {
    if (r.id === 'brinq') {
      brinqVisitas++;
      if (brinqVisitas === 1 && !S.done.caixinha && !S.flags.cavalinho) { S.flags.cavalinho = true; U.depois(3, () => { if (!S.done.caixinha) S.flags.cavalinho = false; }); }
      if (brinqVisitas >= 2) for (const b of bonecas) b.rotation.y = Math.atan2(A.P.pos.x - b.position.x, A.P.pos.z - b.position.z);
    }
  };
  H.anaFim = () => { if (ret79.material.map !== t79b) { ret79.material.map = t79b; ret79.material.needsUpdate = true; } };
  H.sync = () => {
    pegadas.visible = !!S.flags.pegadas && S.inv.engrenagens < 3;
    if (S.done.ana && ret79.material.map !== t79b) { ret79.material.map = t79b; ret79.material.needsUpdate = true; }
    if (S.flags.cruzVirou) cruz.rotation.x = Math.PI;
    if (S.flags.terco) terco.scale.set(1.4, 1.4, .3);
    if (S.flags.seg_espelho) { espM.map = tMsg; espM.needsUpdate = true; }
    if (S.flags.seg_rodape) { rod.rotation.x = -1.2; rod.position.set(0, .05, -57.6); }
  };
  W.tick.push(() => { const v = !!S.flags.pegadas && S.inv.engrenagens < 3; if (pegadas.visible !== v) pegadas.visible = v; });
  return H;
}
