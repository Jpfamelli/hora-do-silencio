// PRÓLOGO — Lote 6, 2ª rodada: o que a ESTRADA tem de diferente a cada noite. Placas que contam as noites, obstáculo
// sorteado, barranco que fecha na volta, um evento por noite (serração viva, estrada escura, luzes de criança, mula,
// redemoinho, forma na névoa, caroneiro, ponto de ônibus, cervo, lampião, caminhão, criança de capa ou a espera de
// nada), pegadas de ontem, bichos e recordes por rota. Chamado por mundoL6B. Nada aqui bloqueia o caminho e nada dá dano.
export function eventosL6B(X) {
  const { A, S, c, THREE, MAT, box, cyl, plano, interact, item, MK, grupo, P, cam, GZ, BZ, SX, F, R, escolhe, noite, rejogo, mem, memSet, dist, olhando, medo, falar, dizer, conquista, agenda, ticks, resumo, apagarLuz, luzAcesa, TXT6B, clamp, STD, hitMat } = X;
  const tenta = (nome, fn) => { try { fn(); } catch (e) { console.warn('[estrada6b:' + nome + ']', e); } };
  const NO = noite();
  const naEstrada = () => P.room && P.room.id === 'estrada';
  const desceu = () => !!S.inv.chaves.portao;
  const fora = c.fora || null;
  const LUGARES = { prego: 'no prego da parede', balcao: 'em cima do balcão', casaco: 'no bolso do casaco', bomba: 'pendurada na bomba', sob: 'embaixo do balcão' };

  // ---- peças compartilhadas
  const luzEv = new THREE.PointLight(0xffffff, 0, 12, 2); luzEv.position.set(0, 2, 0); grupo.add(luzEv);   // luz única dos eventos (criada no começo: o número de luzes não muda)
  const figura = (cor = 0x040404, alt = 1) => {
    const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: cor, roughness: 1 });
    cyl(.17 * alt, .2 * alt, .9 * alt, m, 0, .95 * alt, 0, 8, g); cyl(.07, .06, .55 * alt, m, -.09, .28 * alt, 0, 5, g); cyl(.07, .06, .55 * alt, m, .09, .28 * alt, 0, 5, g);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.12 * alt, 10, 8), m); cab.position.y = 1.55 * alt; g.add(cab); g.visible = false; grupo.add(g); return g;
  };
  const au = () => (A.audio && A.audio()) || null;
  const ronco = (pos, dur = 3, f = 110, vol = .3) => { const a = au(); if (!a) return; const { AC, saida, burst } = a; const t = AC.currentTime, g = saida(pos, .4); burst(t, dur, 'lowpass', f, 1, g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * .4); g.gain.exponentialRampToValueAtTime(.0001, t + dur); };
  const pegTex = A.canvasTex(32, 64, g => { g.fillStyle = 'rgba(14,12,10,.85)'; g.beginPath(); g.ellipse(16, 38, 9, 18, 0, 0, 6.3); g.fill(); g.beginPath(); g.ellipse(16, 12, 7, 8, 0, 0, 6.3); g.fill(); });
  const pegMat = new THREE.MeshStandardMaterial({ map: pegTex, transparent: true, depthWrite: false, roughness: .2, polygonOffset: true, polygonOffsetFactor: -2 });
  const pegada = (x, z, ang, s = 1) => { const pl = plano(.26 * s, .5 * s, pegMat, x, .016, z, 0); pl.rotation.set(-Math.PI / 2, 0, ang); return pl; };
  X.calaGrilos = 0;

  // =================================================================== PLACAS QUE CONTAM AS NOITES
  tenta('placas', () => {
    const l2 = NO === 20 ? '0 km' : NO === 3 ? '1979 km' : NO >= 11 ? 'BEM-VINDA' : NO === 10 ? 'JÁ CHEGOU' : (10 - NO) + ' km';
    const tx = A.canvasTex(256, 128, (g, w, h) => { g.fillStyle = NO >= 10 ? '#4a1a14' : '#1d4a2c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8e0d0'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#d8e0d0'; g.textAlign = 'center'; g.font = 'bold 28px Arial'; g.fillText('SÃO LÁZARO', w / 2, 46); g.font = 'bold ' + (l2.length > 7 ? 34 : 46) + 'px Arial'; g.fillText(l2, w / 2, 98); });
    for (const dz of [-.55, .55]) cyl(.04, .04, 2.6, MAT.metal, 6.4, 1.3, 62 + dz, 6);
    const pl = plano(1.6, .8, new THREE.MeshStandardMaterial({ map: tx, roughness: .8 }), 6.36, 2.3, 62, -Math.PI / 2);
    pl.userData.leitura = { t: 'SÃO LÁZARO · ' + l2 };
    if (NO >= 10) interact(pl, () => '<b>E</b>Ler a placa da estrada', () => falar('e6b_placa_zero'));
    // placa de destinos: só um nome é verdadeiro; ler os falsos dá um susto sonoro sem dano
    const falsos = ['MONTE ALTO', 'RIBEIRÃO DOS SINOS', 'PEDRA FUNDA', 'VALE DO SILÊNCIO', 'SANTA LAURA'].map(n => [R('dest:' + n), n]).sort((a, b) => a[0] - b[0]).map(x => x[1]).slice(0, 2);
    const nomes = [...falsos.map(n => [n, false]), ['SÃO LÁZARO', true]].map(x => [R('ord:' + x[0]), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
    cyl(.05, .05, 3.2, MAT.metal, -6.3, 1.6, 22, 6);
    nomes.forEach(([nome, certo], i) => {
      const t = A.canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#2a2218'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c8b890'; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#e0d4b0'; g.textAlign = 'center'; g.font = 'bold 26px Arial'; g.fillText(nome, w / 2, 32); g.font = '16px Arial'; g.fillText((3 + Math.floor(R('km' + nome) * 12)) + ' km  →', w / 2, 54); });
      const bd = plano(1.0, .25, new THREE.MeshStandardMaterial({ map: t, roughness: .8 }), -6.22, 2.7 - i * .34, 22, Math.PI / 2);
      bd.userData.leitura = { t: nome };
      interact(bd, () => `<b>E</b>Ler a placa: ${nome}`, () => {
        if (certo) { falar('e6b_placa_certa'); return; }
        falar('e6b_placa_falsa'); medo(6); try { A.SFX.estalo({ x: -6.2, z: 22 }, .6); } catch (e) {}
      });
    });
  });

  // =================================================================== OBSTÁCULO SORTEADO DA DESCIDA
  tenta('obstaculo', () => {
    const tp = escolhe('obst', ['tronco', 'poca', 'arame']), z0 = -(34 + Math.floor(R('obz') * 16));
    resumo.push('obstáculo na estrada: ' + ({ tronco: 'tronco caído', poca: 'poça funda', arame: 'arame farpado' })[tp]);
    let avisou = false;
    ticks.push(() => { if (!avisou && desceu() && naEstrada() && Math.abs(P.pos.z - z0) < 10) { avisou = true; falar('e6b_obst_' + tp); } });
    if (tp === 'tronco') {
      const t = cyl(.38, .42, 6.2, MAT.tronco, -3.7, .4, z0, 8); t.rotation.z = Math.PI / 2; t.rotation.y = .06;
      A.addCollider(-6.9, -.5, z0 - .45, z0 + .45);
      for (let i = 0; i < 4; i++) { const b = cyl(.04, .09, 1.6, MAT.tronco, -5.5 + i * 1.5, .9, z0 + (i % 2 ? .3 : -.3), 5); b.rotation.z = (i % 2 ? .9 : -.9); }
    } else if (tp === 'poca') {
      const m = new THREE.MeshStandardMaterial({ color: 0x07090c, roughness: .05, metalness: .55, transparent: true, opacity: .85 });
      const pl = plano(5.6, 3.4, m, 0, .02, z0, 0); pl.rotation.x = -Math.PI / 2;
      let cd = 0, dentro = false, molhados = 0, ult = null;
      ticks.push(dt => {
        const d = Math.abs(P.pos.x) < 2.8 && Math.abs(P.pos.z - z0) < 1.7 && naEstrada();
        const mov = ult ? Math.hypot(P.pos.x - ult.x, P.pos.z - ult.z) : 0; ult = { x: P.pos.x, z: P.pos.z };
        if (d && mov > .01) { cd -= dt; if (cd <= 0) { cd = P.sprinting ? .3 : P.crouch ? 1 : .5; try { A.SFX.passo(P.sprinting ? 1 : .6, 'grama', true, true); } catch (e) {} A.emitNoise(P.pos.x, P.pos.z, P.crouch ? 3.5 : P.sprinting ? 16 : 8, true); } dentro = true; molhados = 8; }
        else if (!d && dentro) { dentro = false; }
        if (!d && molhados > 0 && mov > .02) { c._dm = (c._dm || 0) + mov; if (c._dm > 1.1) { c._dm = 0; molhados--; pegada(P.pos.x, P.pos.z, Math.PI - P.yaw); } }
      });
    } else {
      const fio = new THREE.MeshStandardMaterial({ color: 0x6a6a70, roughness: .4, metalness: .7 });
      const col = A.addCollider(-6.9, -.5, z0 - .2, z0 + .2), fios = [];
      for (let i = 0; i < 6; i++) box(.07, 1.3, .07, STD(0x3a2a1c), -6.6 + i * 1.2, .65, z0, grupo, false);
      for (const y of [.35, .7, 1.05]) { const w = box(6.2, .015, .015, fio, -3.7, y, z0, grupo, false); fios.push(w); }
      const hit = box(6.2, 1.3, .5, hitMat, -3.7, .65, z0, grupo, false);
      interact(hit, () => col.on ? '<b>E</b>Afastar o arame farpado (faz barulho)' : 'O arame, torcido de lado.', () => {
        if (!col.on) return; col.on = false; A.emitNoise(-3.7, z0, 18, true); try { A.SFX.rangido(1.6, .9, -3.7, .6); } catch (e) {} medo(5);
        fios.forEach((w, i) => { w.rotation.z = .5 + i * .2; w.position.y += .25; });
      }, { on: () => naEstrada() });
    }
  });

  // =================================================================== O BARRANCO FECHA NA VOLTA + RECORDE POR ROTA
  const rota = { id: 'estrada', t: 0 };
  tenta('barranco', () => {
    if (rejogo() && mem().barrancoUsado) { // quem usou o atalho ontem encontra o barranco fechado pela lama
      memSet({ barrancoUsado: false });
      const lama = box(5.4, .6, 1.6, STD(0x2a1e12, 1), 9.9, .3, -34, grupo, false);
      A.addCollider(7.2, 12.6, -34.8, -33.2); resumo.push('o barranco fechou com lama');
      const t = A.canvasTex(128, 48, (g, w, h) => { g.fillStyle = '#24190f'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8b890'; g.font = 'bold 20px Georgia'; g.textAlign = 'center'; g.fillText('LAMA · FECHADO', w / 2, 30); });
      const pl = plano(.8, .3, new THREE.MeshStandardMaterial({ map: t, roughness: .95 }), 9.9, 1.0, -33.35, 0); pl.userData.leitura = { t: 'LAMA · FECHADO. O barranco de ontem ruiu.' };
      let av = false; ticks.push(() => { if (!av && P.room && P.room.id === 'barranco' && P.pos.z < -29) { av = true; falar('e6b_lama_barranco'); } });
    }
    ticks.push(dt => {
      if (S.flags.saiuCarro) rota.t += dt;
      if (rota.id !== 'barranco' && P.pos.x > 7.4 && P.pos.z < -28 && P.pos.z > GZ - 1) { rota.id = 'barranco'; memSet({ barrancoUsado: true }); }
    });
  });
  const placar = { cv: null, g: null, tx: null };
  tenta('placar', () => {
    placar.cv = document.createElement('canvas'); placar.cv.width = 256; placar.cv.height = 112; placar.g = placar.cv.getContext('2d');
    placar.tx = new THREE.CanvasTexture(placar.cv); placar.tx.colorSpace = THREE.SRGBColorSpace;
    placar.desenha = () => {
      const g = placar.g, r = mem().recRota || {}; g.fillStyle = '#14130f'; g.fillRect(0, 0, 256, 112); g.strokeStyle = '#5a5240'; g.lineWidth = 3; g.strokeRect(6, 6, 244, 100);
      g.fillStyle = '#d8ccae'; g.textAlign = 'center'; g.font = 'italic 17px Georgia'; g.fillText('dois caminhos', 128, 28);
      g.font = 'bold 21px Georgia'; g.fillText('estrada: ' + (r.estrada ? r.estrada + ' s' : '—'), 128, 60); g.fillText('barranco: ' + (r.barranco ? r.barranco + ' s' : '—'), 128, 90);
      placar.tx.needsUpdate = true;
    };
    placar.desenha();
    const pl = plano(.7, .31, new THREE.MeshStandardMaterial({ map: placar.tx, roughness: .9 }), 2.1, 1.3, GZ + .22, 0);
    pl.userData.leitura = { t: 'Melhor tempo por caminho: estrada e barranco, cada um com o seu recorde.' };
  });
  const antesPortao = X.aoChegarPortao;
  X.aoChegarPortao = () => {
    if (antesPortao) antesPortao();
    tenta('rotaFim', () => {
      const m = mem(), rec = m.recRota || {}, feitas = m.rotas || {}, seg = Math.round(rota.t * 10) / 10, ant = rec[rota.id];
      if (!ant || seg < ant) { rec[rota.id] = seg; if (ant) agenda(2.5, () => falar('e6b_recorde_rota')); }
      const nova = !feitas[rota.id]; feitas[rota.id] = true; memSet({ recRota: rec, rotas: feitas });
      if (feitas.estrada && feitas.barranco) conquista('e6b_rotas');
      if (nova && NO > 1) agenda(1, () => falar('e6b_rota_' + rota.id));
      if (placar.desenha) placar.desenha();
      resumo.push('rota: ' + (rota.id === 'barranco' ? 'barranco' : 'estrada') + ' em ' + seg + ' s');
      if (X.salvaTrilha) X.salvaTrilha();
    });
    tenta('caroPegadas', () => { // o homem ignorado seguiu o carro: pegadas encharcadas até o portão
      if (S.flags.e6b_caroIgnorado) { for (let i = 0; i < 7; i++) pegada(-4.6 + i * .55, GZ + 7 - i * .9, Math.PI - .5, 1); falar('e6b_caro_pegadas'); resumo.push('pegadas encharcadas no portão'); }
    });
  };

  // =================================================================== PEGADAS DA NOITE ANTERIOR (noites de neblina)
  tenta('trilha', () => {
    const pts = []; let ult = null;
    const ok = () => P.room && (P.room.id === 'estrada' || P.room.id === 'patioPosto' || P.room.id === 'barranco');
    const salva = () => { if (pts.length > 5) memSet({ trilha: pts.slice(0, 120).map(p => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]) }); };
    X.salvaTrilha = salva;
    const ontem = mem().trilha;
    if (X.clima === 'neblina' && rejogo() && ontem && ontem.length > 8) {
      const passo = Math.max(1, Math.ceil(ontem.length / 40));
      for (let i = 0; i < ontem.length - 1; i += passo) { const a = ontem[i], b = ontem[Math.min(ontem.length - 1, i + 1)]; pegada(a[0] + (i % 2 ? .12 : -.12), a[1], Math.PI - Math.atan2(b[0] - a[0], b[1] - a[1])); }
      const fim = [...ontem].reverse().find(p => p[1] > GZ + 4 && p[1] < -3 && Math.abs(p[0]) < 5.5);
      if (fim) {
        let achou = false; item('est6b_trilha_achado', { x: fim[0] + .5, y: .03, z: fim[1] + .4 }, MK.pilha(), 'Pegar a pilha no fim das pegadas', () => { falar('e6b_pegadas_achado'); resumo.push('achou a pilha no fim das pegadas'); achou = true; });
        let av = false; ticks.push(() => { if (!av && naEstrada() && dist(ontem[0][0], ontem[0][1]) < 14) { av = true; falar('e6b_pegadas_ontem'); resumo.push('as pegadas de ontem na névoa'); } });
      }
    }
    ticks.push(dt => { if (!S.flags.saiuCarro || !ok() || P.room.id === 'posto') return; if (!ult || Math.hypot(P.pos.x - ult.x, P.pos.z - ult.z) > 2.4) { ult = { x: P.pos.x, z: P.pos.z }; pts.push([ult.x, ult.z]); if (pts.length % 10 === 0) salva(); } });
  });

  // =================================================================== BICHOS DA NOITE (corvos, grilos, sapos)
  tenta('bichos', () => {
    // corvos na cerca: voam todos juntos quando você chega perto
    const n = 3 + Math.floor(R('corvos') * 3), corvos = [];
    for (let i = 0; i < n; i++) {
      const z = 18 - i * 17 - Math.floor(R('cz' + i) * 6), g = new THREE.Group(); g.position.set(-6.7, 0, z); grupo.add(g);
      cyl(.05, .06, 1.35, STD(0x2a2218), 0, .67, 0, 5, g);
      const m = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1 }), b = new THREE.Mesh(new THREE.SphereGeometry(.1, 8, 6), m); b.scale.set(1, .8, 1.4); b.position.y = 1.45; g.add(b);
      const bico = new THREE.Mesh(new THREE.ConeGeometry(.03, .09, 5), m); bico.rotation.x = Math.PI / 2; bico.position.set(0, 1.47, .15); g.add(bico);
      corvos.push({ b, bico, g, voou: false, t: 0, z });
    }
    let falou = false;
    ticks.push(dt => {
      for (const k of corvos) {
        if (!k.voou && S.flags.saiuCarro && dist(-6.7, k.z) < 7) { k.voou = true; try { SX.voz && SX.voz({ x: -6.7, y: 1.5, z: k.z }, 1, 620); A.emitNoise(-6.7, k.z, 7, false); } catch (e) {} if (!falou) { falou = true; agenda(1.2, () => falar('e6b_corvos')); resumo.push('corvos na cerca'); } }
        if (k.voou && k.t < 2.4) { k.t += dt; k.b.position.y += dt * 2.4; k.b.position.x -= dt * 1.2; k.bico.position.y = k.b.position.y + .02; k.bico.position.x = k.b.position.x; if (k.t >= 2.4) { k.b.visible = false; k.bico.visible = false; } }
      }
    });
    // grilos (noite seca) e sapos (chuva): ambiente que fala e que cala
    let cd = 2, gt = 0, calou = false;
    ticks.push(dt => {
      if (!S.flags.saiuCarro || !naEstrada()) return;
      const sil = X.calaGrilos > 0; if (sil) X.calaGrilos -= dt;
      if (sil && !calou && X.clima === 'seca') { calou = true; falar('e6b_grilos_calam'); }
      cd -= dt; if (cd > 0) return;
      if (X.clima === 'seca' && !sil) { cd = .5 + Math.random() * .8; const pos = { x: P.pos.x + (Math.random() - .5) * 18, y: .3, z: P.pos.z + (Math.random() - .5) * 18 }; try { for (let i = 0; i < 3; i++) agenda(i * .07, () => SX.tique && SX.tique(pos, true)); } catch (e) {} }
      else if (X.clima === 'chuva') { cd = 4.5 + Math.random() * 5; const pos = { x: (Math.random() - .5) * 12, y: .2, z: P.pos.z + (Math.random() - .5) * 20 }; try { SX.voz && SX.voz(pos, 2, 105, true); } catch (e) {} }
      else cd = 3;
    });
  });

  // =================================================================== UM EVENTO POR NOITE
  const EV = {};
  EV.serracao = () => {
    const g = new THREE.Group(); g.visible = false; grupo.add(g);
    const mat = new THREE.MeshBasicMaterial({ color: 0xc4cad0, transparent: true, opacity: .42, depthWrite: false, fog: false, side: THREE.DoubleSide });
    for (let i = 0; i < 3; i++) plano(24, 7, mat, 0, 3.4, i * 1.4, 0, g);
    const st = { on: false, z: 0, tocou: false, fim: false, esvai: -1 };
    return dt => {
      if (st.fim) return;
      if (!st.on) { if (desceu() && naEstrada() && P.pos.z < -28) { st.on = true; st.z = P.pos.z + 15; g.visible = true; falar('e6b_serracao'); X.calaGrilos = 20; } return; }
      st.z -= 1.45 * dt; g.position.z = st.z;
      if (!st.tocou && st.z <= P.pos.z + .6) { st.tocou = true; st.esvai = 1.6; apagarLuz(2); falar('e6b_serracao_toca'); medo(15); try { SX.respiracao && SX.respiracao({ x: P.pos.x, y: 1.4, z: P.pos.z + 1 }); } catch (e) {} resumo.push('a serração me alcançou'); }
      if (st.esvai > 0) { st.esvai -= dt; mat.opacity = .42 * Math.max(0, st.esvai / 1.6); if (st.esvai <= 0) { g.visible = false; st.fim = true; } }
      if (P.pos.z < GZ + 3) { st.fim = true; g.visible = false; if (!st.tocou) { conquista('e6b_nevoa'); agenda(1, () => falar('e6b_serracao_ok')); resumo.push('cheguei antes da serração'); } }
    };
  };
  EV.escura = () => {
    const zs = [-28, -36, -44, -52], postes = zs.map(z => {
      const g = new THREE.Group(); g.position.set(-5.2, 0, z); grupo.add(g); cyl(.07, .09, 4.2, STD(0x2a2a2a), 0, 2.1, 0, 6, g); box(.6, .05, .05, STD(0x2a2a2a), .25, 4.1, 0, g, false);
      const b = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe0a0, fog: false })); b.position.set(.5, 4.0, 0); g.add(b); return { z, b, on: true };
    });
    const st = { ini: false, parado: 0, pegou: false, ant: null, fog0: fora ? fora.fog : 0, restA: 0 };
    const apaga = p => { if (p.on) { p.on = false; p.b.material.color.setHex(0x14120c); } };
    return dt => {
      if (!desceu() || !naEstrada()) return;
      if (!st.ini && P.pos.z < -24) { st.ini = true; falar('e6b_escura'); X.calaGrilos = 12; }
      if (!st.ini) return;
      postes.forEach(p => { if (p.on && P.pos.z < p.z - 6) apaga(p); });
      const mov = st.ant ? Math.hypot(P.pos.x - st.ant.x, P.pos.z - st.ant.z) : 1; st.ant = { x: P.pos.x, z: P.pos.z };
      st.parado = mov < .012 ? st.parado + dt : 0;
      if (!st.pegou && st.parado > 4 && P.pos.z > GZ + 5) {
        st.pegou = true; postes.forEach((p, i) => agenda(i * .4, () => apaga(p))); agenda(1.4, () => { falar('e6b_escura_pega'); medo(12); apagarLuz(1.2); if (fora) { fora.fog += .03; st.restA = 7; } });
      }
      if (st.restA > 0) { st.restA -= dt; if (st.restA <= 0 && fora) fora.fog = st.fog0; }
    };
  };
  EV.criancas = () => {
    const zc = -3, orbs = [], mat = new THREE.MeshBasicMaterial({ color: 0xffd060, fog: false });
    for (let i = 0; i < 5; i++) { const o = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), mat); o.position.set(-9.8 - (i % 2) * 1.6, 1 + (i % 3) * .3, zc + (i - 2) * 1.1); o.visible = false; grupo.add(o); orbs.push(o); }
    const premio = R('crianca') < .5, st = { on: false, fim: false, riso: 3, pagou: false };
    if (premio) item('est6b_crianca_pilha', { x: -6.4, y: .03, z: zc }, MK.pilha(), 'Pegar a pilha deixada pelas luzinhas', () => { falar('e6b_criancas_pilha'); resumo.push('as luzinhas deixaram uma pilha'); }, () => st.pagou);
    const emb = c.novoVulto ? c.novoVulto() : null;
    return dt => {
      if (st.fim) return;
      if (!st.on) { if (S.flags.saiuCarro && S.inv.lanterna && naEstrada() && P.pos.z < 8 && P.pos.z > -30) { st.on = true; orbs.forEach(o => { o.visible = true; }); falar('e6b_criancas'); } return; }
      const t = A.perf();
      orbs.forEach((o, i) => { o.position.y = 1 + (i % 3) * .3 + Math.sin(t * 2 + i) * .12; o.position.x -= dt * .06; });
      st.riso -= dt; if (st.riso <= 0) { st.riso = 4.5; try { SX.voz && SX.voz({ x: -10, y: 1.2, z: zc }, 3, 640); } catch (e) {} }
      if (dist(-9.8, zc) < 6) {
        st.fim = true; orbs.forEach(o => { o.visible = false; });
        if (premio) { st.pagou = true; A.syncWorld && A.syncWorld(); }
        else if (emb) { emb.position.set(-5.8, 0, zc - 2.6); emb.visible = true; emb.rotation.y = Math.atan2(P.pos.x - emb.position.x, P.pos.z - emb.position.z); falar('e6b_criancas_embosca'); medo(26); try { SX.respiracao && SX.respiracao({ x: -5.8, y: 1.4, z: zc - 2.6 }); } catch (e) {} agenda(1.6, () => { emb.visible = false; }); resumo.push('as luzinhas eram uma emboscada'); }
      }
    };
  };
  EV.mula = () => {
    const g = new THREE.Group(); g.visible = false; grupo.add(g);
    const m = new THREE.MeshStandardMaterial({ color: 0x0a0806, roughness: 1 });
    box(.5, .8, 1.6, m, 0, 1.1, 0, g, false); for (const [x, z] of [[-.18, .6], [.18, .6], [-.18, -.6], [.18, -.6]]) cyl(.05, .04, .8, m, x, .45, z, 5, g);
    const chamas = [0, 1, 2, 3, 4].map(i => { const f = new THREE.Mesh(new THREE.SphereGeometry(.13, 6, 5), new THREE.MeshBasicMaterial({ color: 0x59a0ff, fog: false })); f.position.set(0, 1.7 + i * .06, -.9 + i * .05); g.add(f); return f; });
    const st = { fase: 0, x: -14, z: 0, passos: 0 };
    return dt => {
      if (st.fase === 0) { if (S.flags.saiuCarro && S.inv.lanterna && naEstrada() && P.pos.z < -4 && P.pos.z > -32) { st.fase = 1; st.z = P.pos.z - 14; st.x = -14; g.visible = true; luzEv.color.setHex(0x4890ff); luzEv.intensity = 3.2; falar('e6b_mula'); X.calaGrilos = 14; } return; }
      if (st.fase === 1) {
        st.x += 11 * dt; g.position.set(st.x, 0, st.z); g.rotation.y = Math.PI / 2; luzEv.position.set(st.x, 1.6, st.z);
        chamas.forEach((f, i) => { f.scale.setScalar(.8 + Math.random() * .6); });
        st.passos -= dt; if (st.passos <= 0) { st.passos = .24; try { A.SFX.passoMonstro({ x: st.x, y: 0, z: st.z }, .6); } catch (e) {} }
        if (!st.hit && Math.abs(st.x - P.pos.x) < 1.6 && Math.abs(st.z - P.pos.z) < 5) { st.hit = true; if (Math.abs(P.pos.x) < 3.5) { apagarLuz(5); falar('e6b_mula_pega'); medo(20); resumo.push('a mula apagou a lanterna'); } else { falar('e6b_mula_passa'); resumo.push('vi a mula passar do mato'); } }
        if (st.x > 14) { st.fase = 2; g.visible = false; luzEv.intensity = 0; }
      }
    };
  };
  EV.redemoinho = () => {
    const N = 44, pp = new Float32Array(N * 3), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xb8a888, size: .1, transparent: true, opacity: .8 })); pts.frustumCulled = false; pts.visible = false; grupo.add(pts);
    const st = { fase: 0, x: 0, z: 0, t: 0, som: 0 };
    return dt => {
      if (st.fase === 0) { if (S.flags.saiuCarro && S.inv.lanterna && naEstrada() && P.pos.z < -4 && P.pos.z > -30) { st.fase = 1; st.z = P.pos.z - 24; st.x = 2.5 * (R('red') < .5 ? -1 : 1); pts.visible = true; falar('e6b_redemoinho'); X.calaGrilos = 12; } return; }
      if (st.fase === 1) {
        st.t += dt; st.z += 3.8 * dt; st.x += (P.pos.x - st.x) * dt * .5;
        for (let i = 0; i < N; i++) { const a = st.t * 4 + i * .55, r = .2 + (i / N) * 1.1; pp[i * 3] = st.x + Math.cos(a) * r; pp[i * 3 + 1] = (i / N) * 3; pp[i * 3 + 2] = st.z + Math.sin(a) * r; }
        geo.attributes.position.needsUpdate = true;
        st.som -= dt; if (st.som <= 0) { st.som = .9; try { A.SFX.estatica(.6, { x: st.x, y: 1.5, z: st.z }); } catch (e) {} }
        if (Math.hypot(st.x - P.pos.x, st.z - P.pos.z) < 1.8) { st.fase = 2; pts.visible = false; apagarLuz(3); medo(10); falar('e6b_redemoinho_pega'); resumo.push('o redemoinho apagou a lanterna'); }
        else if (st.z > P.pos.z + 12) { st.fase = 2; pts.visible = false; }
      }
    };
  };
  EV.forma = () => {
    const tp = escolhe('forma', ['mao', 'arvore', 'crianca']);
    const tx = A.canvasTex(128, 160, (g, w, h) => {
      g.fillStyle = 'rgba(235,238,240,.9)'; g.strokeStyle = 'rgba(235,238,240,.9)'; g.lineWidth = 9; g.lineCap = 'round';
      if (tp === 'mao') { g.beginPath(); g.ellipse(64, 108, 28, 26, 0, 0, 6.3); g.fill(); for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(40 + i * 12, 96); g.lineTo(34 + i * 15, 30 + Math.abs(i - 2) * 14); g.stroke(); } }
      else if (tp === 'arvore') { g.lineWidth = 12; g.beginPath(); g.moveTo(64, 155); g.lineTo(64, 70); g.stroke(); g.lineWidth = 6; for (const [x, y] of [[20, 40], [108, 36], [30, 22], [98, 18]]) { g.beginPath(); g.moveTo(64, 80); g.lineTo(x, y); g.stroke(); } }
      else { g.beginPath(); g.arc(64, 44, 20, 0, 6.3); g.fill(); g.beginPath(); g.moveTo(44, 150); g.lineTo(54, 66); g.lineTo(74, 66); g.lineTo(84, 150); g.fill(); }
    });
    const sombra = new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0, depthWrite: false, fog: false });
    const pl = plano(3, 3.75, sombra, 0, 2, 0, 0); pl.visible = false;
    const st = { on: false, fim: false };
    return dt => {
      if (st.fim) return;
      if (!st.on) { if (S.flags.saiuCarro && S.inv.lanterna && naEstrada() && P.pos.z < -2 && P.pos.z > GZ + 40) { st.on = true; pl.position.set(0, 2, Math.max(GZ + 8, P.pos.z - 30)); pl.visible = true; } return; }
      const d = Math.hypot(P.pos.x - pl.position.x, P.pos.z - pl.position.z);
      sombra.opacity = clamp((d - 8) / 10, 0, 1) * .42;
      if (d < 8) { st.fim = true; pl.visible = false; falar('e6b_forma'); resumo.push('uma forma na névoa'); }
    };
  };
  EV.caroneiro = () => {
    const g = figura(0x0a0a0a, 1.02); g.position.set(-5.4, 0, -1.5); g.rotation.y = Math.PI; g.visible = false;
    const braco = cyl(.04, .04, .7, STD(0x0a0a0a), .26, 1.65, 0, 5, g); braco.rotation.z = -.2;
    const st = { on: false, feito: false };
    const certo = LUGARES[X.lugarChave || 'prego'], errado = LUGARES[escolhe('errado', ['prego', 'balcao', 'casaco', 'bomba'].filter(k => k !== (X.lugarChave || 'prego')))];
    const res = R('caro') < .4 ? 'verdade' : R('caro') < .7 ? 'mentira' : 'nada';
    const hit = box(1.2, 2.2, 1.2, hitMat, -5.4, 1.1, -1.5, grupo, false);
    interact(hit, () => '<b>E</b>Chamar o homem do acostamento', () => {
      if (st.feito) return; st.feito = true; S.flags.e6b_caroFalou = true;
      if (res === 'verdade') dizer('radio', `(o homem, sem virar) "A chave? ${certo}."`, true);
      else if (res === 'mentira') dizer('radio', `(o homem, sem virar) "Tá ${errado}, moça. Sempre aí." (E ele ri baixinho.)`, true);
      else { falar('e6b_caro_nada'); [0, .5, 1].forEach(t => agenda(t, () => apagarLuz(.25))); }
      agenda(2.2, () => { g.visible = false; }); resumo.push('o caroneiro disse algo ' + (res === 'nada' ? '(nada)' : res === 'verdade' ? 'verdadeiro' : 'falso'));
    }, { on: () => st.on && !st.feito && g.visible });
    return dt => {
      if (!st.on) { if (S.flags.saiuCarro && S.inv.lanterna && naEstrada() && dist(-5.4, -1.5) < 22) { st.on = true; g.visible = true; falar('e6b_caroneiro'); X.calaGrilos = 6; } return; }
      if (!st.feito && P.pos.z < -30 && g.visible) { g.visible = false; S.flags.e6b_caroIgnorado = true; }   // ignorado: ele acompanha o carro de longe
    };
  };
  EV.ponto = () => {
    const bx = 5.9, bz = -14, g = new THREE.Group(); g.position.set(bx, 0, bz); grupo.add(g);
    box(1.4, .08, .4, STD(0x3a2a1c), 0, .45, 0, g, false); box(1.4, .5, .06, STD(0x3a2a1c), 0, .75, .18, g, false); for (const dx of [-.6, .6]) box(.06, .45, .34, STD(0x2a1e14), dx, .22, 0, g, false);
    cyl(.04, .04, 2.6, MAT.metal, -1.0, 1.3, 0, 6, g);
    const t = A.canvasTex(128, 64, (gg, w, h) => { gg.fillStyle = '#d8d0b0'; gg.fillRect(0, 0, w, h); gg.fillStyle = '#7a1a14'; gg.beginPath(); gg.arc(32, 32, 22, 0, 6.3); gg.fill(); gg.fillStyle = '#e8e0c8'; gg.font = 'bold 30px Arial'; gg.textAlign = 'center'; gg.fillText('Ô', 32, 44); gg.fillStyle = '#2a2a2a'; gg.font = 'bold 15px Arial'; gg.fillText('ÚLTIMO ÔNIBUS', 88, 28); gg.font = '13px Arial'; gg.fillText('18h · 1979', 88, 48); });
    plano(.7, .35, new THREE.MeshStandardMaterial({ map: t, roughness: .8 }), -1.0, 2.3, .06, Math.PI / 2, g);
    const hit = box(1.6, .9, .7, hitMat, 0, .6, 0, g, false);
    const vul = c.novoVulto ? c.novoVulto() : null;
    const st = { fase: 0, t: 0, pagou: false };
    interact(hit, () => st.fase === 0 ? '<b>E</b>Sentar no banco do ponto e esperar' : st.fase === 1 ? 'Esperando o ônibus...' : 'O banco do ponto de ônibus.', () => {
      if (st.fase !== 0) return; st.fase = 1; st.t = 0; falar('e6b_ponto'); if (vul) { vul.visible = true; vul.position.set(3.6, 0, -52); }
    }, { on: () => !!S.flags.saiuCarro && st.fase === 0 });
    return dt => {
      if (st.fase !== 1) return;
      st.t += dt;
      if (vul) { vul.position.z = -52 + (st.t / 38) * 36; vul.position.x = 3.6 + (bx - 3.6) * Math.min(1, st.t / 38); vul.rotation.y = Math.atan2(bx - vul.position.x, bz - vul.position.z); if (st.t > 6 && st.t < 6.1) falar('e6b_ponto_vulto'); }
      if (dist(bx, bz) > 3.4) { st.fase = 3; if (vul) vul.visible = false; A.toast(st.pagou ? 'O banco te liberou.' : 'Você levantou cedo: o banco não paga.'); return; }
      if (!st.pagou && st.t >= 25) { st.pagou = true; S.inv.pilhas++; conquista('e6b_espera'); falar('e6b_ponto_ok'); A.toast('Uma pilha pela espera.'); resumo.push('esperei no ponto: uma pilha'); }
      if (st.t >= 38) { st.fase = 2; medo(30); if (vul) vul.visible = false; falar('e6b_ponto_susto'); try { SX.respiracao && SX.respiracao({ x: bx, y: 1.4, z: bz - 1 }); A.SFX.estalo({ x: bx, z: bz }, .8); } catch (e) {} }
    };
  };
  EV.cervo = () => {
    const g = new THREE.Group(); g.visible = false; grupo.add(g);
    const m = new THREE.MeshStandardMaterial({ color: 0x4a3524, roughness: 1 });
    box(1.3, .6, .4, m, 0, 1.0, 0, g, false); for (const [x, z] of [[-.5, .12], [-.5, -.12], [.5, .12], [.5, -.12]]) cyl(.04, .03, 1.0, m, x, .5, z, 5, g);
    const pesc = cyl(.07, .05, .6, m, .72, 1.4, 0, 6, g); pesc.rotation.z = -.5; const cab = new THREE.Mesh(new THREE.SphereGeometry(.14, 8, 6), m); cab.scale.set(1.3, 1, 1); cab.position.set(.95, 1.7, 0); g.add(cab);
    for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.028, 6, 5), new THREE.MeshBasicMaterial({ color: 0xcfe4ff })); o.position.set(1.04, 1.74, s * .08); g.add(o); }
    const st = { fase: 0, x: 0 };
    return dt => {
      if (st.fase === 0) { if (desceu() && naEstrada() && P.pos.z < -30 && P.pos.z > GZ + 14) { st.fase = 1; st.x = .6; g.position.set(st.x, 0, P.pos.z - 14); g.visible = true; falar('e6b_cervo'); X.calaGrilos = 8; } return; }
      if (st.fase === 1) { g.rotation.y = Math.atan2(P.pos.x - g.position.x, P.pos.z - g.position.z) - Math.PI / 2; if (dist(g.position.x, g.position.z) < 9) { st.fase = 2; resumo.push('um cervo de olhos humanos'); } return; }
      if (st.fase === 2) { g.position.x -= dt * 9; g.rotation.y = Math.PI; try { if (Math.random() < .2) A.SFX.passoMonstro({ x: g.position.x, y: 0, z: g.position.z }, .5); } catch (e) {} if (g.position.x < -12) { g.visible = false; st.fase = 3; } }
    };
  };
  EV.lampiao = () => {
    const g = figura(0x14100a, .95); g.position.set(-8, 0, -34);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffb860, fog: false })); lamp.position.set(.35, 1.0, .12); g.add(lamp);
    const st = { fase: 0 };
    return dt => {
      if (st.fase === 0) { if (desceu() && naEstrada() && P.pos.z < -26 && P.pos.z > -50) { st.fase = 1; g.position.set(-6.5, 0, P.pos.z - 10); g.visible = true; luzEv.color.setHex(0xffa850); luzEv.intensity = 2.4; falar('e6b_lampiao'); X.calaGrilos = 10; } return; }
      if (st.fase === 1) { g.position.x += .95 * dt; g.rotation.y = Math.PI / 2; luzEv.position.set(g.position.x + .35, 1.1, g.position.z); if (g.position.x > 6.5) { st.fase = 2; g.visible = false; luzEv.intensity = 0; resumo.push('a mulher do lampião'); } }
    };
  };
  EV.caminhao = () => {
    const g = new THREE.Group(); g.visible = false; grupo.add(g);
    const m = new THREE.MeshStandardMaterial({ color: 0x1a1c1e, roughness: .8 });
    box(2.4, 2.4, 4.2, m, 0, 1.9, 1.6, g, false); box(2.4, 1.8, 2.2, m, 0, 1.5, -1.6, g, false);
    const lf = new THREE.MeshBasicMaterial({ color: 0xfff4d0, fog: false }); for (const x of [-.8, .8]) box(.5, .3, .08, lf, x, .8, -2.72, g, false);
    for (const [x, z] of [[-1.05, -1.3], [1.05, -1.3], [-1.05, 2.6], [1.05, 2.6]]) { const p = cyl(.55, .55, .35, MAT.pneu, x, .55, z, 12, g); p.rotation.z = Math.PI / 2; }
    const st = { fase: 0, z: 0, ron: 0 };
    return dt => {
      if (st.fase === 0) { if (S.flags.saiuCarro && S.inv.lanterna && naEstrada() && P.pos.z < -4 && P.pos.z > -30) { st.fase = 1; st.z = P.pos.z + 60; g.position.set(-2.4, 0, st.z); g.visible = true; luzEv.color.setHex(0xfff0c8); luzEv.intensity = 7; falar('e6b_caminhao'); X.calaGrilos = 12; ronco({ x: -2.4, y: 1, z: st.z }, 5, 90, .4); } return; }
      if (st.fase === 1) {
        st.z -= 15 * dt; g.position.z = st.z; luzEv.position.set(-2.4, 1, st.z - 3);
        if (!st.vi && Math.abs(st.z - P.pos.z) < 20) { st.vi = true; try { SX.buzina && SX.buzina({ x: -2.4, y: 2, z: st.z - 3 }, .8); } catch (e) {} }
        if (st.z < P.pos.z - 60) { st.fase = 2; g.visible = false; luzEv.intensity = 0; resumo.push('o caminhão sem motorista'); }
      }
    };
  };
  EV.capa = () => {
    const g = new THREE.Group(); g.visible = false; grupo.add(g);
    const m = new THREE.MeshStandardMaterial({ color: 0x5a1c18, roughness: 1 });
    const manto = new THREE.Mesh(new THREE.ConeGeometry(.36, .95, 8), m); manto.position.y = .5; g.add(manto);
    const cabe = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), new THREE.MeshStandardMaterial({ color: 0x0a0a0a })); cabe.position.y = 1.08; g.add(cabe);
    const st = { fase: 0, t: 0 };
    return dt => {
      if (st.fase === 0) { if (desceu() && naEstrada() && P.pos.z < -26 && P.pos.z > GZ + 18) { st.fase = 1; g.position.set(.4, 0, P.pos.z - 16); g.visible = true; falar('e6b_capa'); X.calaGrilos = 8; } return; }
      if (st.fase === 1) { g.rotation.y = Math.atan2(P.pos.x - g.position.x, P.pos.z - g.position.z); const d = dist(g.position.x, g.position.z); if (d < 7.5 || (d < 18 && olhando({ x: g.position.x, z: g.position.z }, .2, 18, 1))) st.t += dt; if (d < 4.5 || st.t > 1.1) { st.fase = 2; cabe.visible = false; manto.scale.y = .08; manto.position.y = .04; manto.scale.x = 1.6; manto.scale.z = 1.6; resumo.push('a capa vazia na estrada'); try { A.SFX.estalo({ x: g.position.x, z: g.position.z }, .3); } catch (e) {} } }
    };
  };
  EV.nada = () => {
    const st = { fase: 0, t: 0, tq: 0 };
    return dt => {
      if (st.fase === 0) { if (S.flags.saiuCarro && S.inv.lanterna && naEstrada() && P.pos.z < -2) { st.fase = 1; dizer('radio', 'Serra FM: Atenção, ouvintes. Algo vai acontecer na estrada.', true); falar('e6b_nada'); X.calaGrilos = 40; } return; }
      if (st.fase === 1) {
        st.t += dt; st.tq -= dt;
        if (st.tq <= 0) { st.tq = Math.max(.35, 1.6 - st.t * .04); try { SX.tique && SX.tique({ x: P.pos.x + 3, y: 1, z: P.pos.z - 4 }, false); } catch (e) {} }
        if (st.t > 14 && !st.r) { st.r = true; try { SX.respiracao && SX.respiracao({ x: P.pos.x, y: 1.4, z: P.pos.z + 3 }); } catch (e) {} }
        if (st.t > 30) { st.fase = 2; conquista('e6b_nada'); falar('e6b_nada_fim'); resumo.push('o evento em que nada aconteceu'); }
      }
    };
  };
  tenta('eventos', () => {
    const elig = []; if (X.clima === 'neblina') elig.push('serracao', 'criancas', 'forma'); else elig.push('escura');
    elig.push('mula', 'redemoinho', 'caroneiro', 'cervo', 'lampiao', 'caminhao', 'capa', 'nada'); if (rejogo() && NO >= 3) elig.push('ponto');
    const ev = F.evento || elig[Math.floor(R('evento') * elig.length) % elig.length]; S.flags.e6b_evento = ev; X.evento = ev;
    const tk = EV[ev] && EV[ev](); if (tk) ticks.push(dt => { if (S.flags.e6b_eventoOff) return; tk(dt); });
  });
}
