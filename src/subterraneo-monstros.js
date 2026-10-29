// MONSTROS DO SUBTERRÂNEO — Lote 5
// Foco: comportamentos novos, variações por capítulo, aparências mais perturbadoras,
// contra-jogos e momentos de perseguição memoráveis nos túneis (Cap. IV) e no
// cemitério/capela (Cap. V). Entra como camada mais externa em tuneis()/cemiterio().
//
// Regras do projeto: nada aqui trava objetivo nem obriga backtracking; tudo é sentido
// pelo jogador. Comportamentos que movem/invocam o Inspetor, a Ana ou mudam o nível da
// água ficam atrás de !window.__teste para não atrapalhar o QA automático (que teleporta
// a jogadora pelos objetivos); o resto (luz, som, fala, partícula, medo) roda sempre.

const emTeste = () => { try { return !!window.__teste; } catch (e) { return false; } };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

// ---------------------------------------------------------------------
// TÚNEIS DE DRENAGEM — Capítulo IV
// ---------------------------------------------------------------------
export function tuneis(A, S, def, ctx = {}) {
  const { THREE, P, M, ANA } = A;
  const som = ctx.som, O = ctx.O, B = ctx.B;
  const nivel = ctx.nivel || (() => A.S.flags.aguaBaixa ? .04 : .42);
  const grupo = A.W.grupo;
  const vTmp = new THREE.Vector3(), vTmp2 = new THREE.Vector3();
  const olhando = (x, y, z, corte = .7) => { A.camera.getWorldDirection(vTmp); vTmp2.set(x, y, z).sub(A.camera.position); const dd = vTmp2.length(); vTmp2.normalize(); return vTmp.dot(vTmp2) > corte ? dd : 0; };
  const iluminado = (x, y, z, corte = .86, alc = 7) => { if (!A.S.flashOn) return false; const d = olhando(x, y, z, corte); return d > .01 && d < alc; };
  const estaAgua = () => !A.S.flags.aguaBaixa && nivel() > .3;

  // 1-2. PEGADAS DE LAMA DO INSPETOR: botas molhadas que brilham na lanterna e somem;
  //      as frescas avisam que ele acabou de passar ali.
  const peMat = new THREE.MeshBasicMaterial({ color: 0x24312b, transparent: true, opacity: 0, depthWrite: false });
  const peGeo = new THREE.PlaneGeometry(.2, .36);
  const pegadas = [];
  for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(peGeo, peMat.clone()); m.rotation.x = -Math.PI / 2; m.position.y = .015; m.visible = false; grupo.add(m); pegadas.push({ m, t: -9, lado: 0 }); }
  let pegIdx = 0, pegAcc = 0, pegAviso = -9;
  const lastM = new THREE.Vector3();
  // RASTRO MOLHADO SEU: ao sair da água você pinga; o Inspetor segue as suas pegadas farejáveis.
  const molhaMat = new THREE.MeshBasicMaterial({ color: 0x3a4a44, transparent: true, opacity: 0, depthWrite: false });
  const molhaPeg = []; for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(peGeo, molhaMat.clone()); m.rotation.x = -Math.PI / 2; m.position.y = .012; m.visible = false; grupo.add(m); molhaPeg.push({ m, v: 0 }); }
  let molhaIdx = 0, molhaLado = 1, molhaT = 0, molhaAcc = 0;
  const soltarPegada = () => {
    const p = pegadas[pegIdx = (pegIdx + 1) % pegadas.length];
    p.lado = -p.lado || 1;
    p.m.position.set(M.pos.x + Math.cos(M.yaw) * .12 * p.lado, .015, M.pos.z - Math.sin(M.yaw) * .12 * p.lado);
    p.m.rotation.z = -M.yaw + (Math.random() - .5) * .3; p.m.visible = true; p.t = A.perf();
    p.molhada = estaAgua() || (A.roomAt(M.pos.x, M.pos.z).agua && !A.S.flags.aguaBaixa);
  };

  // 3-5. O LAMPIÃO ABANDONADO (isca): ele larga o lampião aceso parado no centro de uma
  //      sala e se afasta, mudo. A luz atrai — ao entrar no alcance ele volta correndo do escuro.
  const isca = { luz: new THREE.PointLight(0xffb060, 0, 7, 2), on: false, x: 0, z: 0, t: 0, cd: emTeste() ? 1e9 : 22 };
  isca.luz.visible = false; grupo.add(isca.luz);
  const iscaCorpo = new THREE.Group(); iscaCorpo.visible = false; grupo.add(iscaCorpo);
  { const vidro = new THREE.MeshStandardMaterial({ color: 0x3a3020, emissive: 0xffa040, emissiveIntensity: 1.6 });
    A.cyl(.06, .08, .18, vidro, 0, .14, 0, 8, iscaCorpo); A.cyl(.05, .05, .03, A.MAT.ferrugem, 0, .25, 0, 8, iscaCorpo); A.box(.004, .12, .004, A.MAT.ferrugem, 0, .32, 0, iscaCorpo, false); }
  const porIsca = () => {
    if (emTeste() || isca.on || A.S.chapter !== 4 || !M.ativo || M.state !== 'patrulha') return;
    const salas = A.W.salas.filter(r => r.tipo === 'tunel' && Math.hypot((r.x0 + r.x1) / 2 - P.pos.x, (r.z0 + r.z1) / 2 - P.pos.z) > 9 && Math.hypot((r.x0 + r.x1) / 2 - M.pos.x, (r.z0 + r.z1) / 2 - M.pos.z) < 10);
    if (!salas.length) return;
    const r = salas[Math.random() * salas.length | 0];
    isca.x = (r.x0 + r.x1) / 2; isca.z = (r.z0 + r.z1) / 2; isca.on = true; isca.t = 0;
    iscaCorpo.position.set(isca.x, .02, isca.z); iscaCorpo.visible = true; isca.luz.position.set(isca.x, 1.2, isca.z); isca.luz.visible = true;
    // ele se afasta no escuro
    const fugaX = isca.x + (isca.x >= 0 ? 8 : -8), fugaZ = isca.z - 6;
    A.planejar(M, fugaX, fugaZ); M.state = 'patrulha'; M.wait = 0;
    if (!A.S.flags.l5_iscaAviso) { A.S.flags.l5_iscaAviso = true; setTimeout(() => { if (A.W.mapa === 'tuneis') A.sub('lia', 'Ele não larga esse lampião. ...É armadilha.'); }, 900); }
  };
  const largarIsca = () => { isca.on = false; isca.luz.visible = false; iscaCorpo.visible = false; };

  // 6-8. MÃOS SAINDO DA PAREDE DE TERRA: em medo alto, mãozinhas das crianças saem meio
  //      palmo da parede e recolhem quando a luz bate nelas. Não dão dano, só pavor e lore.
  const dedosMat = new THREE.MeshStandardMaterial({ color: 0xb9b0a0, roughness: .95, emissive: 0x161210, emissiveIntensity: .25 });
  const fazerMao = () => { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const f = A.box(.02, .14, .02, dedosMat, (i - 1.5) * .035, .07, 0, g, false); f.rotation.x = .2; } A.box(.11, .06, .04, dedosMat, 0, 0, 0, g, false); return g; };
  const maosParede = []; for (let i = 0; i < 5; i++) { const g = fazerMao(); g.visible = false; g.scale.setScalar(0); grupo.add(g); maosParede.push({ g, out: 0, alvo: 0 }); }
  let maoCd = A.rand(8, 16), maoLore = false;
  const brotarMaos = () => {
    const r = P.room; if (!r || r.tipo !== 'tunel') return;
    const paredes = r.x1 - r.x0 < r.z1 - r.z0 ? [[r.x0, 'x', 1], [r.x1, 'x', -1]] : [[r.z0, 'z', 1], [r.z1, 'z', -1]];
    let i = 0;
    for (const m of maosParede) {
      if (m.out > .01) continue;
      const pr = paredes[i++ % paredes.length];
      if (pr[1] === 'x') { m.g.position.set(pr[0], A.rand(.5, 1.6), clamp(P.pos.z + A.rand(-3, 3), r.z0 + .5, r.z1 - .5)); m.g.rotation.y = pr[2] > 0 ? Math.PI / 2 : -Math.PI / 2; }
      else { m.g.position.set(clamp(P.pos.x + A.rand(-3, 3), r.x0 + .5, r.x1 - .5), A.rand(.5, 1.6), pr[0]); m.g.rotation.y = pr[2] > 0 ? 0 : Math.PI; }
      m.alvo = 1; m.g.visible = true; m.lore = pr;
      if (i >= 3) break;
    }
    if (som) som.bolhas && som.bolhas(null, 3, .12);
    A.SFX.sussurros(1); // um sussurro de criança junto com as mãos
    if (!maoLore) { maoLore = true; setTimeout(() => { if (A.W.mapa === 'tuneis') A.sub('lia', 'As crianças... estão na parede. Enterraram elas aqui, de pé.'); }, 1200); }
  };

  // 9-11. O CHAMADO ECOA PELOS CANOS: a voz "anda" de uma boca de cano a outra. Seguir o cano
  //       que fala leva ao Inspetor; a boca de cano muda é a segura.
  const bocas = [{ x: -24, z: -18 }, { x: 24, z: -18 }, { x: 0, z: -48 }, { x: 15, z: -36 }];
  const canoVoz = { t: emTeste() ? 1e9 : A.rand(26, 40), seq: [], idx: 0, segura: null };
  const tocarCano = (b, vol) => { if (!som) return; try { som.respiraAgua && som.respiraAgua({ x: b.x, y: 1.4, z: b.z }, vol * .25); } catch (e) {} A.SFX.sussurros(1.1); };

  // 12. SUBMERGIR ESCONDE DA PROCISSÃO: quando a fila passa e você está submersa, o canto abafa
  //     e eles passam reto (aviso sensorial + menos medo). A regra 2 da água segue valendo.
  let procAbafou = false;

  // 13-14. PERSEGUIÇÃO NA ÁGUA: na caçada, em água alta, cada passo faz respingo que o guia;
  //         a parte rasa/seca devolve velocidade. Camada de ruído e de feedback.
  let splashAcc = 0, zonaSeca = false, dicaSeca = false;

  // 19-21. O INSPETOR NA ÁGUA, mais perturbador: olhos refletindo a lanterna e o lampião
  //         brilhando através da água; os "taps" da bengala viram baques abafados.
  const olhoMat = new THREE.MeshBasicMaterial({ color: 0x201010 });
  const olhos = new THREE.Group();
  for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 5), olhoMat); o.position.set(s * .05, 0, 0); olhos.add(o); }
  olhos.visible = false; grupo.add(olhos); // per-mapa (grupo), reposicionado à flor da água cada quadro
  const luzAgua = new THREE.PointLight(0x8fd8c0, 0, 6, 2); luzAgua.visible = false; grupo.add(luzAgua);
  let tapCd = 0;

  // 22-23. A MURETA DE PEDRAS SOLTAS (lote 3): atravessar por ali derruba as pedras atrás de
  //         você e atrasa o Inspetor alguns segundos (ele contorna). Decisão de rota sob pressão.
  const mureta = { x: ctx.muretaX ?? -18, z: ctx.muretaZ ?? -36, usada: false };
  let muretaDelay = 0;

  // 24-28. TÚNEL QUE ALAGA NA FUGA: durante o apagão do cofre, a água parece subir e o lampião
  //         dele varre atrás. Reforço sensorial da fuga (sem brigar com o nível real da água).
  const sweep = new THREE.SpotLight(0xffc070, 0, 24, .5, .5, 1.2); sweep.visible = false;
  const sweepAlvo = new THREE.Object3D(); grupo.add(sweep); grupo.add(sweepAlvo); sweep.target = sweepAlvo;
  let fugaVista = false, fugaK = 0;

  // 31-34. PONTE DE PRANCHAS SOBRE A CISTERNA: travessia que cede e denuncia; correr apressada
  //         faz barulho, cair deixa rastro molhado + susto da Ana encharcada.
  const ponteG = new THREE.Group(); grupo.add(ponteG);
  const pz0 = -39, pz1 = -32, px = -2;
  const prMat = A.MAT.madeiraEsc;
  const pranchas = [];
  for (let i = 0; i < 7; i++) { const z = pz0 + i * (pz1 - pz0) / 6; const t = A.box(.9, .06, .9, prMat, px, 1.02, z, ponteG, false); pranchas.push({ m: t, z, base: 1.02, w: 0 }); }
  A.box(.05, .05, pz1 - pz0, A.MAT.ferrugem, px - .5, 1.0, (pz0 + pz1) / 2, ponteG, false);
  A.box(.05, .05, pz1 - pz0, A.MAT.ferrugem, px + .5, 1.0, (pz0 + pz1) / 2, ponteG, false);
  let naPonte = false, ponteAviso = false, anaMolhada = -9;

  // 29-30. VARIAÇÃO POR CAPÍTULO: fora do Cap. IV o Inspetor não acende o lampião aqui embaixo.
  const noCap4 = () => A.S.chapter === 4;

  // ---- tick dos túneis -------------------------------------------------
  A.W.tick.push(dt => {
    const t = A.perf(), agua = estaAgua();
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;
    const movM = M.ativo ? Math.hypot(M.pos.x - lastM.x, M.pos.z - lastM.z) : 0;
    if (M.ativo) lastM.copy(M.pos);

    // pegadas de lama quando ele anda
    if (M.ativo && movM > .001 && movM < 2) { pegAcc += movM; if (pegAcc > .9) { pegAcc = 0; soltarPegada(); } }
    for (const p of pegadas) { if (!p.m.visible) continue; const idade = t - p.t; const fade = clamp(1 - idade / (p.molhada ? 26 : 16), 0, 1); const lum = iluminado(p.m.position.x, .02, p.m.position.z, .8, 8) ? 1 : .25; p.m.material.opacity = fade * (p.molhada ? .55 : .4) * (.35 + .65 * lum); if (fade <= 0) p.m.visible = false; }
    // pegada fresca perto: ele passou aqui agora
    const fresca = pegadas.find(p => p.m.visible && t - p.t < 2.4 && Math.hypot(p.m.position.x - P.pos.x, p.m.position.z - P.pos.z) < 2.2);
    if (fresca && A.S.flashOn && t - pegAviso > 20 && dM > 6) { pegAviso = t; A.toast('Pegadas molhadas, ainda escorrendo. Ele passou por aqui agora.'); }

    // seu rastro molhado: depois de sair da água você pinga por um tempo e deixa pegadas que ele fareja
    if (P.naAgua || (def.submersa && def.submersa())) molhaT = 8;
    else if (molhaT > 0) molhaT -= dt;
    const movP = Math.hypot(P.pos.x - lastP.x, P.pos.z - lastP.z);
    if (molhaT > 0 && movP > .001 && !(P.room && P.room.agua && !A.S.flags.aguaBaixa)) {
      molhaAcc += movP;
      if (molhaAcc > .55) {
        molhaAcc = 0; molhaLado = -molhaLado;
        const b = molhaPeg[molhaIdx = (molhaIdx + 1) % molhaPeg.length];
        b.m.position.set(P.pos.x + molhaLado * .1, .012, P.pos.z); b.m.rotation.z = -P.yaw; b.m.visible = true; b.v = clamp(molhaT / 8, .2, 1);
        if (!emTeste() && M.ativo && M.state !== 'caca' && Math.random() < .5) A.emitNoise(P.pos.x, P.pos.z, 3); // ele fareja o rastro
      }
    }
    for (const b of molhaPeg) { if (!b.m.visible) continue; b.v = Math.max(0, b.v - dt * .05); b.m.material.opacity = b.v * .5; if (b.v <= 0) b.m.visible = false; }

    // lampião-isca
    if (!emTeste()) {
      if (!isca.on) { isca.cd -= dt; if (isca.cd <= 0 && noCap4()) { isca.cd = A.rand(26, 44); porIsca(); } }
      else {
        isca.t += dt; isca.luz.intensity = 2.6 + Math.sin(t * 7) * .3;
        const dIsca = Math.hypot(isca.x - P.pos.x, isca.z - P.pos.z);
        if (dIsca < 3.2) { // mordeu a isca: ele volta do escuro
          largarIsca();
          if (M.ativo) { A.planejar(M, P.pos.x, P.pos.z); M.state = 'caca'; M.cool = 0; M.replan = .2; M.furia = Math.max(M.furia || 0, 1); }
          A.emitNoise(isca.x, isca.z, 10); A.SFX.grito('inspetor'); P.shake = Math.max(P.shake, .12); A.S.fear = Math.min(100, A.S.fear + 25);
        } else if (isca.t > 18 || dM < 3 || A.S.flags.aguaBaixa && A.S.done.sair_tuneis) { const tava = isca.on; largarIsca(); if (tava && isca.t > 18 && !A.S.flags.l5_iscaLargou) { A.S.flags.l5_iscaLargou = true; A.sub('lia', 'Ele voltou buscar o lampião. Esperou eu chegar perto.'); } }
      }
    }

    // mãos na parede de terra em medo alto
    maoCd -= dt;
    if (maoCd <= 0) { maoCd = A.rand(10, 20); if (A.S.fear > 55 && P.room && P.room.tipo === 'tunel' && dM > 8) brotarMaos(); }
    for (const m of maosParede) {
      if (m.alvo > 0 && m.g.visible) {
        const lit = iluminado(m.g.position.x, m.g.position.y, m.g.position.z, .8, 6);
        if (lit) m.alvo = 0; // a luz faz recolher
        else { // no escuro, a mão estica um pouco mais na direção da parede e, se você ficar colada, gela
          const d = Math.hypot(m.g.position.x - P.pos.x, m.g.position.z - P.pos.z);
          if (d < 1.6 && Math.hypot(P.pos.x - lastP.x, P.pos.z - lastP.z) < .002) { m.alvo = 1.4; if (!m.tocou && d < 1.1) { m.tocou = true; A.S.fear = Math.min(100, A.S.fear + 10); P.shake = Math.max(P.shake, .05); A.SFX.susto(); } }
        }
      }
      m.out += (m.alvo - m.out) * Math.min(1, dt * (m.alvo > m.out ? 1.6 : 6));
      if (m.g.visible) { m.g.scale.setScalar(Math.max(.001, m.out)); if (m.out < .02 && m.alvo === 0) { m.g.visible = false; m.tocou = false; } }
    }

    // o Chamado pelos canos
    if (!emTeste()) {
      canoVoz.t -= dt;
      if (canoVoz.t <= 0 && !canoVoz.seq.length && A.M && !A.S.flags.aguaBaixa) {
        canoVoz.t = A.rand(30, 48);
        const emb = bocas.slice().sort(() => Math.random() - .5);
        canoVoz.seq = emb.slice(0, 3).map((b, i) => ({ b, at: i * 1.3 })); canoVoz.k = 0; canoVoz.start = t;
        canoVoz.segura = canoVoz.seq[canoVoz.seq.length - 1].b; // a última é a muda/segura
      }
      if (canoVoz.seq.length) {
        const el = t - canoVoz.start;
        while (canoVoz.k < canoVoz.seq.length && el >= canoVoz.seq[canoVoz.k].at) { const s = canoVoz.seq[canoVoz.k++]; if (s.b !== canoVoz.segura) tocarCano(s.b, 1); }
        if (el > 6) {
          // entrou na sala de um cano que falou (não a muda): atrai o Inspetor
          const errada = canoVoz.seq.find(s => s.b !== canoVoz.segura && Math.hypot(s.b.x - P.pos.x, s.b.z - P.pos.z) < 4);
          if (errada && M.ativo) { A.emitNoise(errada.b.x, errada.b.z, 12); if (!A.S.flags.l5_canoAviso) { A.S.flags.l5_canoAviso = true; A.sub('lia', 'A voz corre pelos canos. O cano que cala é o certo.'); } }
          canoVoz.seq = [];
        }
      }
    }

    // perseguição na água: respingo que o guia + zona seca que salva
    if (agua && M.ativo && M.state === 'caca' && P.naAgua && !(def.submersa && def.submersa())) {
      splashAcc += Math.hypot(P.pos.x - lastP.x, P.pos.z - lastP.z);
      if (splashAcc > .5) { splashAcc = 0; A.emitNoise(P.pos.x, P.pos.z, 4, true); }
      if (!dicaSeca) { dicaSeca = true; A.toast('Na água cada passo faz respingo. Ache o chão seco pra correr sem denunciar.'); }
    }
    lastP.copy(P.pos);

    // o Inspetor na água: olhos refletem a lanterna, lampião brilha pela água, baques abafados
    const aguaM = M.ativo && A.roomAt(M.pos.x, M.pos.z).agua && !A.S.flags.aguaBaixa;
    if (aguaM && dM < 16) {
      olhos.visible = true; olhos.position.set(M.pos.x, nivel() + .04, M.pos.z); olhos.rotation.y = M.yaw;
      const lit = A.S.flashOn && olhando(M.pos.x, nivel() + .04, M.pos.z, .8);
      olhoMat.color.setHex(lit ? 0x9fe0ff : 0x201010);
      luzAgua.visible = noCap4(); luzAgua.position.set(M.pos.x, Math.max(.1, nivel() - .1), M.pos.z); luzAgua.intensity = noCap4() ? (M.state === 'caca' ? 2.6 : 1.4) * clamp(1 - dM / 16, 0, 1) : 0;
      tapCd -= dt; if (tapCd <= 0 && movM > .002) { tapCd = .5; if (som && som.terra) try { som.terra({ x: M.pos.x, z: M.pos.z }); } catch (e) {} }
    } else { olhos.visible = false; luzAgua.visible = false; }

    // mureta de pedras soltas: atravessar derruba as pedras e atrasa o Inspetor
    if (!mureta.usada && P.sprinting && Math.hypot(P.pos.x - mureta.x, P.pos.z - mureta.z) < 2) {
      mureta.usada = true; A.SFX.pancada(mureta.x, mureta.z); A.emitNoise(mureta.x, mureta.z, 3, true); muretaDelay = 4; P.shake = Math.max(P.shake, .06);
      A.toast('As pedras desabam atrás de você. Ele vai ter que contornar.');
    }
    if (muretaDelay > 0 && M.ativo) { muretaDelay -= dt; if (M.state === 'caca') { M.wait = Math.max(M.wait, .06); } }

    // submergir abafa o mundo de cima: o canto e os passos somem, o medo cede um pouco
    const submersa = def.submersa && def.submersa();
    if (submersa) {
      if (!procAbafou) { procAbafou = true; A.S.fear = Math.max(0, A.S.fear - 8); A.toast('Debaixo d\'água tudo some. Só a sua respiração.'); }
      // ele passando por cima enquanto você está submersa: bolhas e a luz dele distorce na superfície
      if (M.ativo && dM < 2.4 && B && B.emitir && Math.random() < dt * 6) try { B.emitir(P.pos.x + A.rand(-.5, .5), nivel(), P.pos.z + A.rand(-.5, .5), 2, .3); } catch (e) {}
    } else procAbafou = false;

    // fuga do cofre: a água "sobe" na tela e o lampião dele varre atrás
    const emFuga = !!A.S.flags.apagao && A.S.chapter === 4 && !A.S.done.sair_tuneis;
    if (emFuga) {
      fugaK = Math.min(1, fugaK + dt * .4);
      if (M.ativo) { sweep.visible = true; sweep.position.set(M.pos.x, 2.4, M.pos.z); const dx = P.pos.x - M.pos.x, dz = P.pos.z - M.pos.z; sweepAlvo.position.set(M.pos.x + dx * .6 + Math.sin(t * 1.3) * 3, .2, M.pos.z + dz * .6); sweep.intensity = 3.2 * clamp(1 - dM / 22, .1, 1); sweep.angle = .45 + Math.sin(t) * .08; }
      if (!fugaVista && dM < 10 && M.ativo) { fugaVista = true; A.sub('lia', 'A água tá subindo de novo. A escotilha, rápido!'); }
    } else { if (fugaK > 0) fugaK = Math.max(0, fugaK - dt); sweep.visible = false; }

    // ponte de pranchas sobre a cisterna
    const sobrePonte = Math.abs(P.pos.x - px) < .7 && P.pos.z > pz0 - .5 && P.pos.z < pz1 + .5 && !A.S.flags.aguaBaixa;
    if (sobrePonte && !emTeste()) {
      if (!ponteAviso) { ponteAviso = true; if (!A.S.flags.l5_ponte) { A.S.flags.l5_ponte = true; A.sub('lia', 'Pranchas soltas. Devagar... elas cedem.'); } }
      // agachada a prancha mal cede e não range (contra-jogo claro: devagar é seguro, correr denuncia)
      for (const pr of pranchas) { const d = Math.abs(pr.z - P.pos.z); if (d < .8) { pr.w = clamp(pr.w + dt * (P.sprinting ? 6 : P.crouch ? .6 : 2), 0, 1); } }
      if (P.sprinting) { A.emitNoise(px, P.pos.z, 7, true); if (Math.random() < dt * 4) A.SFX.tabua && A.SFX.tabua(); }
      // correr demais escorrega: cai na água
      if (P.sprinting && Math.random() < dt * 1.4 && A.S.fear > 40) {
        A.toast('Você escorregou da prancha!'); A.emitNoise(P.pos.x, P.pos.z, 9, true); P.shake = .3; A.S.fear = Math.min(100, A.S.fear + 20);
        if (B && B.emitir) try { B.emitir(P.pos.x, nivel(), P.pos.z, 6, .6); } catch (e) {}
        if (ANA && !ANA.ativa && t - anaMolhada > 30 && A.spawnAna) { anaMolhada = t; try { A.spawnAna(P.room); A.S.flags.l5_anaMolhada = true; } catch (e) {} }
      }
    } else ponteAviso = false;
    for (const pr of pranchas) { if (!sobrePonte || Math.abs(pr.z - P.pos.z) > .8) pr.w = Math.max(0, pr.w - dt); pr.m.position.y = pr.base - pr.w * .07 + Math.sin(t * 9 + pr.z) * pr.w * .01; }
  });

  // Ana encharcada depois de descer atrás de você (aparência mais perturbadora)
  const poca = new THREE.Mesh(new THREE.PlaneGeometry(.6, .6), new THREE.MeshBasicMaterial({ color: 0x1a2a24, transparent: true, opacity: .5, depthWrite: false }));
  poca.rotation.x = -Math.PI / 2; poca.position.y = .02; poca.visible = false; grupo.add(poca);
  let anaLore = false;
  A.W.tick.push(dt => {
    if (!ANA.ativa) { poca.visible = false; return; }
    const molhada = !!A.S.flags.l5_anaMolhada || (A.roomAt(ANA.pos.x, ANA.pos.z).agua && !A.S.flags.aguaBaixa);
    poca.visible = molhada; if (molhada) poca.position.set(ANA.pos.x, .02, ANA.pos.z);
    if (molhada && !anaLore) { anaLore = true; setTimeout(() => { if (A.W.mapa === 'tuneis' && ANA.ativa) A.sub('lia', 'Ela tá pingando. Ela desceu atrás de mim, pela água.'); }, 1000); }
  });

  // variação de velocidade/ruído na fuga alagada (compõe com o que já existe)
  const lastP = new THREE.Vector3().copy(P.pos);
  const velMul0 = def.velMul, ruidoMul0 = def.ruidoMul;
  def.velMul = () => (velMul0 ? velMul0() : 1) * (A.S.flags.apagao && A.S.chapter === 4 && !A.S.done.sair_tuneis && P.naAgua ? .82 : 1);
  def.ruidoMul = () => (ruidoMul0 ? ruidoMul0() : 1) * (A.S.flags.apagao && A.S.chapter === 4 && P.naAgua ? 1.3 : 1);

  const entrar0 = def.entrar;
  def.entrar = cap => { if (entrar0) entrar0(cap); isca.cd = emTeste() ? 1e9 : 20; canoVoz.t = emTeste() ? 1e9 : A.rand(26, 40); };

  return def;
}

// ---------------------------------------------------------------------
// CEMITÉRIO E CAPELA — Capítulo V (final)
// ---------------------------------------------------------------------
export function cemiterio(A, S, def, ctx = {}) {
  const { THREE, P, M, ANA } = A;
  const som = ctx.som, grupo = A.W.grupo;
  const covas = ctx.covas || [], pedras = ctx.pedras || [], fundos = ctx.fundos;
  const velasAltar = ctx.velasAltar || [], avivar = ctx.avivar || (() => {}), neblina = ctx.neblina;
  const vTmp = new THREE.Vector3(), vTmp2 = new THREE.Vector3();
  const olhando = (x, y, z, corte = .7) => { A.camera.getWorldDirection(vTmp); vTmp2.set(x, y, z).sub(A.camera.position); vTmp2.normalize(); return vTmp.dot(vTmp2) > corte; };

  // 35-37, 49. A PROCISSÃO SAI DAS COVAS: mãozinhas da terra em três covas, depois crianças
  //            com velas de defunto. Aviso = terra tremendo + coro abafado vindo do chão.
  const coro = () => {
    const au = A.audio; if (!au || !au.AC) return;
    const AC = au.AC, t = AC.currentTime;
    for (const [f, k] of [[110, 0], [146.8, .2], [164.8, .5]]) { const g = au.saida(null, .5); au.osc('sine', f, t + k, 3.4, g); au.env(g, t + k, .6, .09, 3); const g2 = au.saida(null, .4); au.osc('sine', f * 2.01, t + k, 3.4, g2); au.env(g2, t + k, .6, .04, 3); }
    const gn = au.saida(null, .3); au.burst(t, 3, 'lowpass', 300, 1, gn); au.env(gn, t, .4, .12, 3);
  };
  const covaProc = { feito: false, t: 0, maos: [], velas: [], criancas: [] };
  const dedosMat = new THREE.MeshStandardMaterial({ color: 0xbdb4a4, roughness: .95, emissive: 0x161210, emissiveIntensity: .3 });
  const criancaMat = new THREE.MeshStandardMaterial({ color: 0x2a2620, roughness: .95 });
  const iniciarCovaProc = () => {
    if (covaProc.feito || emTeste2() || !covas.length) return;
    // três covas perto, à frente da jogadora
    const perto = covas.filter(c => { const d = Math.hypot(c.x - P.pos.x, c.z - P.pos.z); return d > 3 && d < 16; }).sort((a, b) => Math.hypot(a.x - P.pos.x, a.z - P.pos.z) - Math.hypot(b.x - P.pos.x, b.z - P.pos.z)).slice(0, 3);
    if (perto.length < 3) return;
    covaProc.feito = true; covaProc.t = 0; covaProc.alvos = perto;
    coro(); A.S.fear = Math.min(100, A.S.fear + 20); P.shake = Math.max(P.shake, .05);
    if (som && som.terra) for (const c of perto) try { som.terra({ x: c.x, z: c.z }); } catch (e) {}
    A.sub('lia', 'A terra... tá tremendo. Tem um coro vindo de baixo.');
    for (const c of perto) {
      const mg = new THREE.Group(); for (let i = 0; i < 4; i++) A.box(.02, .16, .02, dedosMat, (i - 1.5) * .04, .08, 0, mg, false); A.box(.12, .06, .05, dedosMat, 0, 0, 0, mg, false);
      mg.position.set(c.x, .05, c.z - .6); mg.scale.setScalar(.001); grupo.add(mg); covaProc.maos.push({ g: mg, k: 0 });
      const vela = SUBvela(A, c.x + .2, .1, c.z - .6); covaProc.velas.push(vela);
      const kid = new THREE.Group(); A.cyl(.1, .14, .7, criancaMat, 0, .35, 0, 6, kid); const cab = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), criancaMat); cab.position.y = .78; kid.add(cab); kid.position.set(c.x, -.9, c.z - .6); kid.visible = false; grupo.add(kid); covaProc.criancas.push({ g: kid, c });
    }
  };
  function emTeste2() { try { return !!window.__teste; } catch (e) { return false; } }

  // 40, 47. CAÇA A CÉU ABERTO: o lampião aceso do Inspetor denuncia a posição dele à distância;
  //          ele some no escuro e reaparece pela luz quente. Só depois do sino.
  const beaconInsp = new THREE.PointLight(0xffb060, 0, 40, 1.4); beaconInsp.visible = false; grupo.add(beaconInsp);

  // 44-46. A LUZ DO PORTÃO como ponto de fuga: um lampião quente no portão dos fundos, visível
  //         de longe; nos últimos metros o Inspetor dá um arranque. Cruzar o portão corta tudo.
  const beaconPortao = new THREE.PointLight(0xffc878, 0, 30, 1.2); beaconPortao.position.set(0, 2.4, 12); beaconPortao.visible = false; grupo.add(beaconPortao);
  const lampPortao = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, .2, 8), new THREE.MeshStandardMaterial({ color: 0x3a3020, emissive: 0xffb050, emissiveIntensity: 1.8 }));
  lampPortao.position.set(1.4, 1.1, 12); lampPortao.visible = false; grupo.add(lampPortao);
  let surgeFeito = false;

  // 42-43. FUGA PELA PRANCHA SOBRE A COVA ABERTA: um momento de equilíbrio no caminho central
  //         de volta. Correr escorrega; devagar demais, ele alcança. Zona-gatilho, sem bloquear a rota.
  const covaAberta = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2), new THREE.MeshBasicMaterial({ color: 0x050403 }));
  covaAberta.rotation.x = -Math.PI / 2; covaAberta.position.set(0, -.02, -6); covaAberta.visible = false; grupo.add(covaAberta);
  const prancha = A.box(.7, .06, 2.6, A.MAT.madeiraEsc, 0, .03, -6, grupo, false); prancha.visible = false;
  let noEquilibrio = false, equiAviso = false;

  // 48, 50. VARIAÇÃO DA ANA NO CEMITÉRIO: encharcada/terra, pálida à luz do luar aberto.
  let anaCem = false;

  // 18/38. PROCISSÃO REVERSA NA CAPELA: ao botar os objetos/tocar o sino, uma fila curta de
  //         crianças com velas é vista pela porta da capela vindo do cemitério (do lado invertido).
  const filaRev = new THREE.Group(); filaRev.visible = false; grupo.add(filaRev);
  const velaMat = new THREE.MeshBasicMaterial({ color: 0xffd090 });
  for (let i = 0; i < 4; i++) { const kid = new THREE.Group(); A.cyl(.09, .13, .6, criancaMat, 0, .3, 0, 6, kid); const cab = new THREE.Mesh(new THREE.SphereGeometry(.1, 8, 6), criancaMat); cab.position.y = .66; kid.add(cab); const vela = new THREE.Mesh(new THREE.SphereGeometry(.04, 6, 5), velaMat); vela.position.set(.15, .9, 0); kid.add(vela); kid.position.set(-6 + i * .1, 0, -44 - i * 1.4); filaRev.add(kid); }
  let filaT = -9;

  // estado das camadas extras do cemitério
  let coverDica = false, velasAgitar = 0, coroFuga = -9, anaBarroAcc = 0, rugidoT = 5;
  const barroMat = new THREE.MeshBasicMaterial({ color: 0x2a2015, transparent: true, opacity: 0, depthWrite: false });
  const barroGeo = new THREE.PlaneGeometry(.18, .32);
  const barro = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(barroGeo, barroMat.clone()); m.rotation.x = -Math.PI / 2; m.position.y = .015; m.visible = false; grupo.add(m); barro.push({ m, v: 0 }); }
  let barroIdx = 0, barroLado = 1;
  const soltarBarro = (x, z) => { const b = barro[barroIdx = (barroIdx + 1) % barro.length]; barroLado = -barroLado; b.m.position.set(x + barroLado * .1, .015, z); b.m.rotation.z = Math.random() * 6; b.m.visible = true; b.v = .5; };

  A.W.tick.push(dt => {
    const t = A.perf();
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;

    // cova-procissão: dispara uma vez quando a jogadora já cavou ao menos um túmulo e anda no campo
    if (!covaProc.feito && Object.keys(A.S.tumulos || {}).length >= 1 && !A.S.flags.sino && P.room && P.room.id === 'cem' && P.pos.z > -40) iniciarCovaProc();
    if (covaProc.feito && covaProc.t < 12) {
      covaProc.t += dt; const k = covaProc.t;
      for (const m of covaProc.maos) { m.k = Math.min(1, k / 2.4); m.g.scale.setScalar(Math.max(.001, m.k)); m.g.position.y = .05 + m.k * .2; }
      // as crianças sobem mais rápido quando você NÃO está olhando para elas
      if (k > 3) for (let i = 0; i < covaProc.criancas.length; i++) { const kc = covaProc.criancas[i]; kc.g.visible = true; const olha = olhando(kc.c.x, .4, kc.c.z - .6, .9); kc.sobe = (kc.sobe || 0) + dt * (olha ? .12 : .4); kc.g.position.y = -.9 + clamp(kc.sobe, 0, .9); }
      if (k > 9) { const f = clamp((12 - k) / 3, 0, 1); for (const kc of covaProc.criancas) kc.g.position.y = -.9 + ( .9) * f; for (const v of covaProc.velas) if (v) v.acesa = false; for (const m of covaProc.maos) m.g.scale.setScalar(m.k * f); }
      if (k >= 12) { for (const kc of covaProc.criancas) kc.g.visible = false; for (const m of covaProc.maos) m.g.visible = false; }
    }

    // caça a céu aberto: o lampião dele brilha de longe depois do sino
    if (A.S.flags.sino && M.ativo) {
      beaconInsp.visible = true; beaconInsp.position.set(M.pos.x, 2.2, M.pos.z);
      beaconInsp.intensity = M.state === 'caca' ? 2.2 : 1.2;
    } else beaconInsp.visible = false;

    // portão como farol na fuga + arranque final
    if (A.S.flags.sino) {
      beaconPortao.visible = true; lampPortao.visible = true;
      const perto = clamp(1 - (Math.hypot(P.pos.x, P.pos.z - 12)) / 40, 0, 1); // mais forte conforme você chega
      beaconPortao.intensity = (2.2 + perto * 1.8) + Math.sin(t * 4) * .3; lampPortao.material.emissiveIntensity = 1.6 + Math.sin(t * 5) * .4;
      covaAberta.visible = true; prancha.visible = true;
      // ele ruge de tempos em tempos na perseguição, marcando a direção
      if (!emTeste2() && M.ativo) { rugidoT -= dt; if (rugidoT <= 0) { rugidoT = A.rand(5, 9); A.SFX.grito('inspetor'); A.emitNoise(M.pos.x, M.pos.z, 8); } }
      if (!emTeste2() && M.ativo && P.pos.z > 2 && Math.hypot(P.pos.x, P.pos.z - 12) < 11 && !surgeFeito) {
        surgeFeito = true; A.SFX.grito('inspetor'); A.emitNoise(P.pos.x, P.pos.z, 20); M.state = 'caca'; M.cool = 0; M.furia = Math.max(M.furia || 0, 1.5);
        A.S.fear = Math.min(100, A.S.fear + 20);
      }
      // arranque: colado no portão ele ganha um empurrão (contra o travão do lote 1)
      if (!emTeste2() && surgeFeito && M.ativo && P.pos.z > 4 && dM > 1.6) { const dx = P.pos.x - M.pos.x, dz = (P.pos.z) - M.pos.z, dd = Math.hypot(dx, dz) || 1; M.pos.x += dx / dd * dt * 1.1; M.pos.z += dz / dd * dt * 1.1; }
    } else { beaconPortao.visible = false; lampPortao.visible = false; }

    // equilíbrio na prancha sobre a cova aberta (fuga)
    const sobre = A.S.flags.sino && Math.abs(P.pos.x) < .6 && Math.abs(P.pos.z + 6) < 1.4;
    if (sobre && !emTeste2()) {
      if (!equiAviso) { equiAviso = true; if (!A.S.flags.l5_equi) { A.S.flags.l5_equi = true; A.sub('lia', 'Uma prancha sobre a cova. Firme... sem correr.'); } }
      if (P.sprinting && Math.random() < dt * 1.6) { A.toast('Você quase caiu na cova! Mais devagar na prancha.'); P.shake = .28; A.emitNoise(P.pos.x, P.pos.z, 8, true); A.S.fear = Math.min(100, A.S.fear + 12); }
      else if (!P.sprinting && M.ativo) { M.cool = Math.max(0, M.cool - dt); } // devagar demais: ele encosta
    } else equiAviso = false;

    // Ana no cemitério, mais perturbadora: terra nos olhos / pálida no luar
    if (ANA.ativa && !anaCem) { anaCem = true; setTimeout(() => { if (A.W.mapa === 'cemiterio' && ANA.ativa) A.sub('lia', 'Ela saiu da terra também. Tem barro na boca dela.'); }, 900); }
    if (!ANA.ativa) anaCem = false;

    // procissão reversa vista pela porta da capela — com o coro e as velas do altar reagindo
    if (A.S.placed >= 1 && filaT < -1 && !A.S.flags.l5_filaRev) { A.S.flags.l5_filaRev = true; filaRev.visible = true; filaT = t; coro(); avivar(2.2); }
    if (filaRev.visible) { const el = t - filaT; for (let i = 0; i < filaRev.children.length; i++) { const kid = filaRev.children[i]; kid.position.z = -44 - i * 1.4 - el * .5; kid.position.y = Math.abs(Math.sin(t * 6 + i)) * .05; } if (el > 8) filaRev.visible = false; }

    // esconderijo atrás das lápides: agachada perto de um túmulo o som se perde — ensina uma vez
    if (A.S.flags.sino && M.ativo && P.crouch && !coverDica && P.room && P.room.fora) {
      for (const pd of pedras) if (Math.abs(pd.x - P.pos.x) < 1.2 && Math.abs(pd.z - P.pos.z) < 1.2) { coverDica = true; A.toast('Agachada atrás de um túmulo, ele te ouve menos. Use as lápides como abrigo.'); break; }
    }

    // as velas do altar se agitam quando ele se aproxima da capela
    if (A.S.flags.sino && M.ativo && Math.hypot(M.pos.x, M.pos.z + 60) < 10) { velasAgitar -= dt; if (velasAgitar <= 0) { velasAgitar = 1.2; avivar(1.6); } }

    // a neblina rasteira se abre de leve por onde ele passa
    if (Array.isArray(neblina) && A.S.flags.sino && M.ativo) { const baixa = dM < 6 ? 1 : 0; for (const c of neblina) { if (!c.m) continue; const base = c.alvo ?? (c.alvo = c.m.material.opacity); c.m.material.opacity = clamp(c.m.material.opacity + ((base * (1 - baixa * .5)) - c.m.material.opacity) * Math.min(1, dt * 2), .05, base); } }

    // o coro das covas volta baixinho durante a fuga do sino
    if (A.S.flags.sino && t - coroFuga > 9) { coroFuga = t; coro(); }

    // encarar as crianças que sobem das covas aperta mais o medo
    if (covaProc.feito && covaProc.t > 3 && covaProc.t < 9 && covaProc.alvos) { for (const c of covaProc.alvos) if (olhando(c.x, .6, c.z - .6, .9)) { A.S.fear = Math.min(100, A.S.fear + dt * 6); break; } }

    // a Ana deixa pegadas de barro no cemitério
    if (ANA.ativa && P.room && P.room.fora) { anaBarroAcc += dt; if (anaBarroAcc > .5) { anaBarroAcc = 0; soltarBarro(ANA.pos.x, ANA.pos.z); } }
    for (const b of barro) { if (!b.m.visible) continue; b.v = Math.max(0, b.v - dt * .06); b.m.material.opacity = b.v; if (b.v <= 0) b.m.visible = false; }
  });

  // sync/entrar compostos
  const sync0 = def.sync;
  def.sync = () => { if (sync0) sync0(); };
  const entrar0 = def.entrar;
  def.entrar = cap => { if (entrar0) entrar0(cap); surgeFeito = false; };

  // att≈1 a céu aberto: o Inspetor ouve de mais longe no campo (variação por capítulo)
  def.inspetorFora = true;
  const ruidoMul0 = def.ruidoMul;
  def.ruidoMul = () => (ruidoMul0 ? ruidoMul0() : 1) * (A.S.flags.sino && P.room && P.room.fora ? 1.25 : 1);

  return def;
}

// vela de defunto (chama azulada): emissiva, sem luz dinâmica, para não pesar no limite de luzes
function SUBvela(A, x, y, z) {
  const { THREE } = A;
  const g = new THREE.Group(); g.position.set(x, y, z);
  const mat = new THREE.MeshBasicMaterial({ color: 0xbfe0ff, transparent: true, opacity: .95 });
  const chama = new THREE.Mesh(new THREE.SphereGeometry(.035, 6, 5), mat); chama.position.y = .22; g.add(chama);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(.09, 6, 5), new THREE.MeshBasicMaterial({ color: 0x3a6a8a, transparent: true, opacity: .35, depthWrite: false })); halo.position.y = .22; g.add(halo);
  A.W.grupo.add(g);
  const o = { g, acesa: true };
  A.W.tick.push(dt => { const s = o.acesa ? 1 + Math.sin(A.perf() * 9) * .2 : 0; chama.scale.setScalar(Math.max(.001, s)); halo.scale.setScalar(Math.max(.001, s)); chama.visible = halo.visible = o.acesa; });
  return o;
}
