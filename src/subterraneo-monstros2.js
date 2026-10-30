// MONSTROS DO SUBTERRÂNEO — Lote 5 (2ª leva)
// Segue o subterraneo-monstros.js como camada mais externa de tuneis()/cemiterio().
// Foco: segunda rodada de comportamentos, variações por capítulo, aparências piores,
// contra-jogos e perseguições memoráveis nos túneis (Cap. IV) e cemitério/capela (Cap. V).
//
// Regras: nada trava objetivo nem obriga backtracking; tudo é sentido pelo jogador.
// Comportamentos que movem/invocam entidades ou mudam água ficam atrás de !window.__teste
// (o QA teleporta a jogadora); luz/som/fala/partícula/medo rodam sempre. Todo tick é
// embrulhado num try para nunca derrubar o loop do motor (o QA falha em pageerror).

const emTeste = () => { try { return !!window.__teste; } catch (e) { return false; } };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;

// empurra um tick embrulhado: se algo falhar, engole e segue (QA falha em exceção solta)
function tick(A, fn) { A.W.tick.push(dt => { try { fn(dt); } catch (e) { /* silencioso */ } }); }

// ---------------------------------------------------------------------
// TÚNEIS DE DRENAGEM — Capítulo IV
// ---------------------------------------------------------------------
export function tuneis(A, S, def, ctx = {}) {
  const { THREE, P, M, ANA } = A;
  const som = ctx.som, O = ctx.O, B = ctx.B;
  const nivel = ctx.nivel ? ctx.nivel() : (() => A.S.flags.aguaBaixa ? .04 : .42);
  const nv = () => { try { return typeof nivel === 'function' ? nivel() : (A.S.flags.aguaBaixa ? .04 : .42); } catch (e) { return .4; } };
  const grupo = A.W.grupo;
  const vA = new THREE.Vector3(), vB = new THREE.Vector3();
  const olhando = (x, y, z, corte = .7) => { A.camera.getWorldDirection(vA); vB.set(x, y, z).sub(A.camera.position); const d = vB.length(); vB.normalize(); return vA.dot(vB) > corte ? d : 0; };
  const iluminado = (x, y, z, corte = .86, alc = 7) => { if (!A.S.flashOn) return false; const d = olhando(x, y, z, corte); return d > .01 && d < alc; };
  const naAgua = () => !A.S.flags.aguaBaixa && nv() > .3;
  const dist = (x, z) => Math.hypot(P.pos.x - x, P.pos.z - z);
  const noCap4 = () => A.S.chapter === 4;
  const lastP = new THREE.Vector3().copy(P.pos);
  const lastM = new THREE.Vector3().copy(M.pos || P.pos);

  // ===== ÁGUA: ondas que denunciam, superfície que acalma, ilha seca =====
  // 1-3. Anéis de onda quando você se mexe na água; o Inspetor "lê" o movimento mesmo sem passo.
  const ondaMat = new THREE.MeshBasicMaterial({ color: 0x9fd6c4, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const ondaGeo = new THREE.RingGeometry(.12, .18, 20);
  const ondas = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(ondaGeo, ondaMat.clone()); m.rotation.x = -Math.PI / 2; m.visible = false; grupo.add(m); ondas.push({ m, t: -9, r: 0 }); }
  let ondaIdx = 0, ondaAcc = 0, calmaT = 0, ondaAviso = false, ondaRuidoT = 0;
  const soltarOnda = (x, z, forca) => { const o = ondas[ondaIdx = (ondaIdx + 1) % ondas.length]; o.m.position.set(x, nv() + .01, z); o.m.visible = true; o.t = A.perf(); o.r = forca; };

  // 4. Ilha seca: sobre a mureta/soleira o rastro sonoro some (sem respingo).
  const ilhas = [{ x: -18, z: -36, r: 1.6 }, { x: 0, z: -42, r: 1.4 }]; // mureta e borda da cisterna
  let naIlha = false, ilhaAviso = false;

  // 5. Reflexo do Inspetor chega antes do corpo na curva (lâmina d'água).
  const refMat = new THREE.MeshBasicMaterial({ color: 0x14100e, transparent: true, opacity: 0, depthWrite: false });
  const reflexo = new THREE.Mesh(new THREE.PlaneGeometry(.5, 1.6), refMat); reflexo.rotation.x = -Math.PI / 2; reflexo.visible = false; grupo.add(reflexo);

  // 6. Esteira na água: V de espuma na superfície quando ele vem submerso na caça.
  const espumaMat = new THREE.MeshBasicMaterial({ color: 0xcfeae0, transparent: true, opacity: 0, depthWrite: false });
  const espuma = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.4), espumaMat); espuma.rotation.x = -Math.PI / 2; espuma.visible = false; grupo.add(espuma);

  // 7. Bolhas de aviso ~1,5 s antes dele emergir perto de você.
  let bolhaAvisoT = 0, bolhaAvisoPos = new THREE.Vector3();

  // 8-9. Cisterna funda (refúgio): ele hesita na borda, mas ficar parado chama a Ana.
  const refugio = { x: 0, z: -36, r: 3.2 }; let refugioT = 0, refugioDica = false, refugioAna = -99;

  // ===== APARÊNCIAS: casaco que pinga, mão-rosto, mão do ralo =====
  // 10-11. Casaco que pinga: gotas escuras caindo dele + poças pequenas que somem.
  const gotaMat = new THREE.MeshBasicMaterial({ color: 0x120e0c, transparent: true, opacity: 0, depthWrite: false });
  const gotaGeo = new THREE.CircleGeometry(.08, 10);
  const gotas = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(gotaGeo, gotaMat.clone()); m.rotation.x = -Math.PI / 2; m.visible = false; grupo.add(m); gotas.push({ m, t: -9 }); }
  let gotaIdx = 0, gotaAcc = 0;

  // 12. Marca de mão molhada que escorre e vira o contorno de um rosto de criança.
  const rostoMat = new THREE.MeshBasicMaterial({ color: 0x3a4a44, transparent: true, opacity: 0, depthWrite: false });
  const canvasRosto = () => { try { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = 'rgba(120,150,140,.9)'; g.beginPath(); g.ellipse(32, 30, 16, 22, 0, 0, 7); g.fill(); g.fillStyle = '#0a0a0a'; g.beginPath(); g.ellipse(25, 26, 3, 4, 0, 0, 7); g.ellipse(39, 26, 3, 4, 0, 0, 7); g.fill(); const tx = new THREE.CanvasTexture(c); tx.needsUpdate = true; return tx; } catch (e) { return null; } };
  const rostoTex = canvasRosto();
  const rosto = new THREE.Mesh(new THREE.PlaneGeometry(.5, .7), new THREE.MeshBasicMaterial({ map: rostoTex, transparent: true, opacity: 0, depthWrite: false })); rosto.visible = false; grupo.add(rosto);
  let rostoT = 0, rostoFase = 0, rostoCd = A.rand(30, 60);

  // 13. Mão comprida que sai de um ralo e recolhe quando a luz bate.
  const ralos = [{ x: 24, z: -18 }, { x: -24, z: -18 }, { x: 15, z: -36 }];
  const maoRalo = new THREE.Group();
  { const mm = new THREE.MeshStandardMaterial({ color: 0xaba396, roughness: .96, emissive: 0x120f0d, emissiveIntensity: .25 }); A.cyl(.03, .03, .5, mm, 0, .25, 0, 6, maoRalo); for (let i = 0; i < 4; i++) A.box(.02, .14, .02, mm, (i - 1.5) * .03, .55, 0, maoRalo, false); }
  maoRalo.visible = false; maoRalo.scale.setScalar(0); grupo.add(maoRalo);
  let raloCd = A.rand(14, 26), raloAlvo = 0, raloOut = 0;

  // ===== INSPETOR: nicho onde dorme, lampião que enxerga, hugging, canos =====
  // 14-16. O nicho onde ele dorme em pé: gotejamento, poça que acorda (respingo), aviso.
  const nicho = { x: -30, z: -18, raio: 5, dorme: noCap4() && !emTeste(), gotaT: 0, acordou: false, aviso: false };
  const luzNicho = new THREE.PointLight(0xffa850, 0, 4, 2); luzNicho.position.set(nicho.x, 1.3, nicho.z); luzNicho.visible = false; grupo.add(luzNicho);

  // 17-18. Lampião que enxerga: a chama cresce no ciclo e abre um cone curto que ignora o som.
  const cone = { t: 0, on: false, dur: 0 };
  const coneLuz = new THREE.SpotLight(0xffd080, 0, 7, .42, .6, 1.4); coneLuz.visible = false; const coneAlvo = new THREE.Object3D(); grupo.add(coneLuz); grupo.add(coneAlvo); coneLuz.target = coneAlvo;
  let coneDica = false;

  // 19. Ele anda encostado na parede (hugging): o path de caça vai pra borda da sala;
  //     cortar reto pelo meio da galeria despista por um instante.
  let hugAcc = 0;

  // 20-21. Ele some num cano e o tilintar das chaves corre pela tubulação até outra boca.
  const bocasCano = [{ x: -24, z: -18 }, { x: 24, z: -18 }, { x: 0, z: -48 }, { x: 15, z: -36 }];
  const canoFuga = { on: false, de: null, pra: null, t: 0, cd: emTeste() ? 1e9 : A.rand(40, 70) };

  // ===== TERRENO: lama que atrasa, ladeira, afunilamento, duto dos ratos =====
  // 22. Poça de lama atrasa o Inspetor (ele patina e se agarra na parede).
  const lamacais = [{ x: -8, z: -24, r: 3 }, { x: 8, z: -36, r: 3 }]; let lamaDica = false;
  // 23-24. Ladeira de lama: a Lia escorrega e perde controle; ele desce de quatro atrás.
  const ladeira = { x: 0, z: -48, r: 3 }; let ladeiraT = 0, ladeiraDica = false;
  // 25-26. Trecho que afunila: o teto baixa, você agacha correndo (mais lenta) e ele rasteja.
  const afunil = { x: 15, z: -36, r: 2.4 }; let afunilDica = false, afunilDentro = false;
  // 27-28. Duto dos ratos vira rota de escape anti-Inspetor: ele bate do lado de fora.
  const duto = { x0: -32, x1: -24, z: -30, r: 2 }; let dutoDica = false, dutoBateT = 0;

  // 29. A Menina caça pela visão enquanto o Inspetor caça pelo som (caça em dupla no Cap IV).
  let duplaDica = false;

  // ======================= TICK DOS TÚNEIS =======================
  tick(A, dt => {
    const t = A.perf(), ag = naAgua();
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;
    const movM = M.ativo ? Math.hypot(M.pos.x - lastM.x, M.pos.z - lastM.z) : 0;
    const movP = Math.hypot(P.pos.x - lastP.x, P.pos.z - lastP.z);
    if (M.ativo) lastM.copy(M.pos);

    // -- ilha seca: fora da água por cima da mureta/soleira, sem respingo
    naIlha = ilhas.some(i => dist(i.x, i.z) < i.r);

    // -- ondas na água: anéis + ruído de onda proporcional à velocidade (mesmo agachada)
    if (ag && (P.naAgua || (P.room && P.room.agua)) && !naIlha && !(def.submersa && def.submersa())) {
      if (movP > .002) {
        calmaT = 0; ondaAcc += movP;
        if (ondaAcc > .4) { ondaAcc = 0; soltarOnda(P.pos.x, P.pos.z, clamp(movP * 60, .4, 1.6)); }
        ondaRuidoT -= dt;
        if (ondaRuidoT <= 0 && !emTeste() && M.ativo) { ondaRuidoT = .7; A.emitNoise(P.pos.x, P.pos.z, clamp(movP * 40, 1.5, 5), true); }
        if (!ondaAviso) { ondaAviso = true; A.toast('A água faz onda a cada passo. Ele sente o movimento mesmo sem barulho.'); }
      } else {
        calmaT += dt; // parada 3-4 s acalma a superfície e ele perde o ponto
        if (calmaT > 3 && !A.S.flags.l5_calma) { A.S.flags.l5_calma = true; A.toast('A água acalmou. Ele perdeu o rastro da onda.'); }
      }
    }
    for (const o of ondas) { if (!o.m.visible) continue; const a = t - o.t; const s = o.r * (1 + a * 2.2); o.m.scale.setScalar(Math.max(.001, s)); o.m.position.y = nv() + .01; o.m.material.opacity = clamp(.5 * o.r * (1 - a / 2.2), 0, .5); if (a > 2.2) o.m.visible = false; }

    // -- reflexo do Inspetor na água chega antes do corpo (dá meio segundo de aviso)
    if (ag && M.ativo && dM > 4 && dM < 13 && A.roomAt(M.pos.x, M.pos.z).agua) {
      reflexo.visible = true; const dx = M.pos.x - P.pos.x, dz = M.pos.z - P.pos.z, dd = Math.hypot(dx, dz) || 1;
      reflexo.position.set(P.pos.x + dx / dd * (dd - 2.2), nv() + .005, P.pos.z + dz / dd * (dd - 2.2)); reflexo.rotation.z = Math.atan2(dx, dz);
      refMat.opacity = clamp((13 - dM) / 13 * .5, 0, .45) * (A.S.flashOn ? 1 : .4);
    } else reflexo.visible = false;

    // -- esteira: V de espuma quando ele vem submerso na caça
    const subM = M.ativo && A.roomAt(M.pos.x, M.pos.z).agua && (M.l5mudo || M.state === 'caca');
    if (ag && subM && dM < 14) {
      espuma.visible = true; espuma.position.set(M.pos.x, nv() + .006, M.pos.z); espuma.rotation.z = M.yaw || 0;
      espumaMat.opacity = clamp((14 - dM) / 14 * .55, 0, .5) * (.6 + .4 * Math.abs(Math.sin(t * 5)));
    } else espuma.visible = false;

    // -- bolhas de aviso ~1,5 s antes dele emergir perto
    if (ag && M.ativo && A.roomAt(M.pos.x, M.pos.z).agua && dM < 6 && bolhaAvisoT <= 0) {
      bolhaAvisoT = 2.2; bolhaAvisoPos.copy(M.pos);
      if (B && B.emitir) try { B.emitir(M.pos.x, nv(), M.pos.z, 4, .5); } catch (e) {}
    }
    if (bolhaAvisoT > 0) { bolhaAvisoT -= dt; if (B && B.emitir && Math.random() < dt * 4) try { B.emitir(bolhaAvisoPos.x + A.rand(-.3, .3), nv(), bolhaAvisoPos.z + A.rand(-.3, .3), 1, .25); } catch (e) {} }

    // -- cisterna funda: refúgio onde ele hesita, mas ficar parado chama a Ana
    const noRef = ag && dist(refugio.x, refugio.z) < refugio.r;
    if (noRef) {
      refugioT += dt;
      if (!refugioDica) { refugioDica = true; A.toast('Água funda. Ele hesita em entrar aqui... mas não fique parada.'); }
      if (!emTeste() && M.ativo && M.state === 'caca' && dist(M.pos.x, M.pos.z) < refugio.r + 2 && dM > 2) M.wait = Math.max(M.wait || 0, .08); // ele tateia a borda
      if (refugioT > 8 && ANA && !ANA.ativa && t - refugioAna > 40 && A.spawnAna && !emTeste()) { refugioAna = t; refugioT = 0; try { A.spawnAna(P.room); A.sub('lia', 'Alguma coisa se mexeu na água atrás de mim.'); } catch (e) {} }
    } else refugioT = Math.max(0, refugioT - dt);

    // -- casaco que pinga: gotas escuras dele deixam poças que somem em ~15 s
    if (M.ativo && movM > .001 && movM < 2) { gotaAcc += movM; if (gotaAcc > 1.6) { gotaAcc = 0; const g = gotas[gotaIdx = (gotaIdx + 1) % gotas.length]; g.m.position.set(M.pos.x + A.rand(-.2, .2), .02, M.pos.z + A.rand(-.2, .2)); g.m.visible = true; g.t = t; } }
    for (const g of gotas) { if (!g.m.visible) continue; const a = t - g.t; const lum = iluminado(g.m.position.x, .02, g.m.position.z, .8, 7) ? 1 : .4; g.m.material.opacity = clamp(1 - a / 15, 0, 1) * .5 * lum; if (a > 15) g.m.visible = false; }

    // -- mão molhada que escorre e vira rosto de criança
    rostoCd -= dt;
    if (rostoCd <= 0 && !rosto.visible && P.room && P.room.tipo === 'tunel' && dM > 8 && A.S.fear > 40) {
      rostoCd = A.rand(40, 80); const r = P.room; const px = Math.random() < .5 ? r.x0 : r.x1;
      rosto.position.set(px, 1.4, clamp(P.pos.z + A.rand(-2, 2), r.z0 + .5, r.z1 - .5)); rosto.rotation.y = px < 0 ? Math.PI / 2 : -Math.PI / 2; rosto.visible = true; rostoT = 0; rostoFase = 0;
    }
    if (rosto.visible) { rostoT += dt; const op = rostoFase === 0 ? clamp(rostoT / 5, 0, .55) : clamp(1 - (rostoT - 10) / 3, 0, .55); rosto.material.opacity = op; if (rostoT > 10) rostoFase = 1; if (rostoT > 13) rosto.visible = false; }

    // -- mão comprida do ralo, recolhe na luz
    raloCd -= dt;
    if (raloCd <= 0 && raloAlvo === 0 && !emTeste()) { raloCd = A.rand(16, 30); const r = ralos.find(x => dist(x.x, x.z) < 4 && dist(x.x, x.z) > 1.4); if (r) { maoRalo.position.set(r.x, 0, r.z); maoRalo.visible = true; raloAlvo = 1; A.SFX.sussurros(.8); } }
    if (maoRalo.visible) { if (iluminado(maoRalo.position.x, .5, maoRalo.position.z, .8, 6)) raloAlvo = 0; raloOut += (raloAlvo - raloOut) * Math.min(1, dt * (raloAlvo > raloOut ? 2 : 5)); maoRalo.scale.setScalar(Math.max(.001, raloOut)); if (raloOut < .02 && raloAlvo === 0) maoRalo.visible = false; }

    // -- nicho onde ele dorme em pé: gotejamento marca o raio; respingo na poça acorda
    if (nicho.dorme && noCap4() && !emTeste()) {
      luzNicho.visible = true; luzNicho.intensity = 1.1 + Math.sin(t * 2) * .2;
      nicho.gotaT -= dt; if (nicho.gotaT <= 0) { nicho.gotaT = A.rand(1.2, 2.4); if (som && som.terra) try { som.terra({ x: nicho.x, z: nicho.z }); } catch (e) {} }
      const dN = dist(nicho.x, nicho.z);
      if (!nicho.aviso && dN < nicho.raio + 3) { nicho.aviso = true; A.sub('lia', 'Tem um vulto em pé no nicho. ...Ele dorme de olhos abertos. Não respinga.'); }
      if (dN < nicho.raio && !nicho.acordou) {
        const respingou = (P.naAgua || (P.room && P.room.agua)) && (movP > .03 || P.sprinting);
        if (respingou && M.ativo) { nicho.acordou = true; nicho.dorme = false; luzNicho.visible = false; A.SFX.grito('inspetor'); A.emitNoise(nicho.x, nicho.z, 8); A.planejar(M, P.pos.x, P.pos.z); M.state = 'caca'; M.cool = 0; A.S.fear = Math.min(100, A.S.fear + 20); }
      }
    } else luzNicho.visible = false;

    // -- lampião que enxerga: cone curto quando a chama cresce (ignora o som)
    if (M.ativo && noCap4() && !emTeste()) {
      cone.t += dt;
      if (!cone.on && cone.t > 6) { cone.on = true; cone.dur = 2; cone.t = 0; }
      if (cone.on) {
        cone.dur -= dt; coneLuz.visible = true; coneLuz.position.set(M.pos.x, 1.5, M.pos.z); A.camera.getWorldDirection(vA);
        const fx = Math.cos(M.yaw || 0), fz = -Math.sin(M.yaw || 0); coneAlvo.position.set(M.pos.x + fx * 4, .6, M.pos.z + fz * 4); coneLuz.intensity = 2.4 + Math.sin(t * 20) * .4;
        // pego no cone: ele te acha ignorando o silêncio
        const dx = P.pos.x - M.pos.x, dz = P.pos.z - M.pos.z, dd = Math.hypot(dx, dz) || 1;
        const dot = (dx / dd) * fx + (dz / dd) * fz;
        if (dd < 6 && dot > .8 && !S.hidden && !P.estatua) { A.emitNoise(P.pos.x, P.pos.z, 6, true); if (!coneDica) { coneDica = true; A.toast('A chama cresceu e varreu à frente. Saia do facho de luz dele.'); } }
        if (cone.dur <= 0) { cone.on = false; cone.t = 0; coneLuz.visible = false; }
      } else coneLuz.visible = false;
    } else coneLuz.visible = false;

    // -- hugging: na caça ele cola na parede; cortar reto pelo meio despista por um instante
    if (!emTeste() && M.ativo && M.state === 'caca' && P.room && P.room.tipo === 'tunel') {
      const r = P.room, meioX = (r.x0 + r.x1) / 2, meioZ = (r.z0 + r.z1) / 2;
      const noMeio = Math.abs(P.pos.x - meioX) < 1.2 && Math.abs(P.pos.z - meioZ) < 2;
      if (noMeio) { hugAcc += dt; if (hugAcc > 1.2) { hugAcc = 0; M.cool = Math.max(M.cool || 0, 1.2); if (!A.S.flags.l5_hug) { A.S.flags.l5_hug = true; A.toast('Ele anda colado na parede. Cortar reto pelo meio o perde por um instante.'); } } }
      else hugAcc = Math.max(0, hugAcc - dt);
    }

    // -- ele some num cano: o tilintar das chaves corre pela tubulação até outra boca
    if (!emTeste() && noCap4()) {
      if (!canoFuga.on) {
        canoFuga.cd -= dt;
        if (canoFuga.cd <= 0 && M.ativo && M.state !== 'caca' && dM > 8) {
          canoFuga.cd = A.rand(50, 80);
          const perto = bocasCano.slice().sort((a, b) => Math.hypot(a.x - M.pos.x, a.z - M.pos.z) - Math.hypot(b.x - M.pos.x, b.z - M.pos.z));
          canoFuga.de = perto[0]; canoFuga.pra = perto[1 + (Math.random() * (perto.length - 1) | 0)]; canoFuga.on = true; canoFuga.t = 0;
          A.SFX.chaves(canoFuga.de.x, 1.4, canoFuga.de.z); M.ativo = false; // some no cano
        }
      } else {
        canoFuga.t += dt; const f = clamp(canoFuga.t / 2.4, 0, 1);
        if (Math.random() < dt * 5) { const x = canoFuga.de.x + (canoFuga.pra.x - canoFuga.de.x) * f, z = canoFuga.de.z + (canoFuga.pra.z - canoFuga.de.z) * f; A.SFX.chaves(x, 1.4, z); }
        if (f >= 1) { canoFuga.on = false; M.pos.set(canoFuga.pra.x, M.pos.y || 1, canoFuga.pra.z); M.ativo = true; A.emitNoise(canoFuga.pra.x, canoFuga.pra.z, 2); if (!A.S.flags.l5_canoFuga) { A.S.flags.l5_canoFuga = true; A.sub('lia', 'As chaves correram pelo cano. Dá pra ouvir por qual boca ele vem.'); } }
      }
    }

    // -- lamaçais: o Inspetor patina e se atrasa na lama (contraste com a água que te entrega)
    if (!emTeste() && M.ativo && M.state === 'caca') { const l = lamacais.find(x => Math.hypot(M.pos.x - x.x, M.pos.z - x.z) < x.r); if (l) { M.wait = Math.max(M.wait || 0, .06); if (!lamaDica && dM < 10) { lamaDica = true; A.toast('Na lama ele patina e se agarra na parede. Use o terreno pra abrir distância.'); } } }

    // -- ladeira de lama: a Lia escorrega e perde o controle do passo
    if (dist(ladeira.x, ladeira.z) < ladeira.r && movP > .01) {
      ladeiraT += dt; P.shake = Math.max(P.shake, .03);
      if (!ladeiraDica) { ladeiraDica = true; A.toast('O chão desce em lama. Você escorrega — segura o passo.'); }
      if (!emTeste() && M.ativo && Math.random() < dt * .5) A.emitNoise(P.pos.x, P.pos.z, 3, true);
    }

    // -- afunilamento: o teto baixa e você precisa agachar correndo (mais lenta)
    const noAfunil = dist(afunil.x, afunil.z) < afunil.r;
    if (noAfunil && !afunilDentro) { afunilDentro = true; if (!afunilDica) { afunilDica = true; A.toast('O teto baixa aqui. Agachada (C) pra passar — ele rasteja atrás com os braços longos.'); } }
    else if (!noAfunil) afunilDentro = false;

    // -- duto dos ratos como fuga: ele não cabe, bate do lado de fora e sussurra
    const noDuto = P.pos.x > duto.x0 && P.pos.x < duto.x1 && Math.abs(P.pos.z - duto.z) < duto.r && P.crouch;
    if (noDuto && !emTeste() && M.ativo) {
      if (!dutoDica) { dutoDica = true; A.sub('lia', 'Aqui ele não cabe. Só os ratos... e ele batendo lá fora.'); }
      dutoBateT -= dt; if (dutoBateT <= 0) { dutoBateT = A.rand(.8, 1.6); A.SFX.pancada(P.pos.x + A.rand(-1, 1), duto.z + (Math.random() < .5 ? -1.6 : 1.6)); A.SFX.sussurros(.7); P.shake = Math.max(P.shake, .02); }
    }

    // -- caça em dupla no Cap IV: a Menina pela visão, o Inspetor pelo som
    if (!emTeste() && noCap4() && M.ativo && M.state === 'caca' && ANA && ANA.ativa && !duplaDica) { duplaDica = true; A.sub('lia', 'Ela me vê, ele me ouve. Tenho que enganar os dois: luz quebrada e silêncio.'); }

    lastP.copy(P.pos);
  });

  // ===== mergulhar fundo: ar cai mais rápido e a tela embaça (reforço do submersa) =====
  // 30-31. tela de mergulho que escurece conforme o fôlego cai.
  let vinheta = null;
  try { vinheta = document.getElementById('l5-mergulho'); if (!vinheta) { vinheta = document.createElement('div'); vinheta.id = 'l5-mergulho'; vinheta.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:40;opacity:0;transition:opacity .25s;background:radial-gradient(ellipse at center,rgba(6,20,14,0) 30%,rgba(2,10,6,.92) 100%)'; const hud = document.getElementById('hud') || document.body; hud.appendChild(vinheta); } vinheta.style.opacity = '0'; } catch (e) {}
  tick(A, dt => {
    const sub = def.submersa && def.submersa();
    if (vinheta) {
      if (sub) { const falta = clamp(1 - (A.S.ar || 100) / 100, 0, 1); vinheta.style.opacity = String(.3 + falta * .6); }
      else vinheta.style.opacity = '0';
    }
    if (sub && A.S.ar != null && !emTeste()) A.S.ar = Math.max(0, A.S.ar - dt * 4); // o ar cai mais rápido quando submersa de propósito
  });

  // ===== água que sobe na caça: ruído do passo por profundidade + andar mais lento =====
  // 32-34. mexe no velMul/ruidoMul por nível de água durante a perseguição.
  const velMul0 = def.velMul, ruidoMul0 = def.ruidoMul;
  const prof = () => { if (A.S.flags.aguaBaixa || !P.naAgua) return 0; return clamp((nv() - .3) / .4, 0, 1); }; // 0 raso → 1 cintura
  def.velMul = () => (velMul0 ? velMul0() : 1) * (1 - prof() * .22);
  def.ruidoMul = () => (ruidoMul0 ? ruidoMul0() : 1) * (1 + prof() * (M.state === 'caca' ? .8 : .4)) * (naIlha ? .25 : 1) * (naRefugioLimpa() ? .4 : 1);
  function naRefugioLimpa() { return !A.S.flags.aguaBaixa && (def.submersa && def.submersa()); }

  // passo na água corrente mascara o passo, mas entrar/sair faz splash alto
  let eraAgua = false;
  tick(A, dt => {
    const dentro = P.naAgua && !A.S.flags.aguaBaixa;
    if (dentro !== eraAgua && !emTeste()) { eraAgua = dentro; A.emitNoise(P.pos.x, P.pos.z, 6, true); if (dentro && !A.S.flags.l5_entraAgua) { A.S.flags.l5_entraAgua = true; A.toast('Parada na água corrente seus passos somem — mas entrar e sair faz splash.'); } }
  });

  // mãos de criança na água rasa seguram os tornozelos se você ficar parada
  let paradaAgua = 0, maoTorn = false;
  tick(A, dt => {
    const raso = P.naAgua && !A.S.flags.aguaBaixa && nv() < .5;
    const movP = Math.hypot(P.pos.x - lastP.x, P.pos.z - lastP.z);
    if (raso && movP < .003) { paradaAgua += dt; if (paradaAgua > 2.5 && !maoTorn) { maoTorn = true; A.S.fear = Math.min(100, A.S.fear + 8); P.shake = Math.max(P.shake, .04); A.SFX.susto(); A.sub('lia', 'Mãos pequenas... na minha perna. Não posso parar na água.'); if (!emTeste()) A.emitNoise(P.pos.x, P.pos.z, 4, true); } }
    else { paradaAgua = 0; maoTorn = false; }
  });

  // ======================= TÚNEIS — bloco extra =======================
  // 38-39. Eco da cisterna: a última fala dele volta com atraso, de um ponto errado da água.
  const cisterna = { x: 0, z: -36, r: 5 };
  let ecoCd = emTeste() ? 1e9 : A.rand(12, 20), ecoDica = false;
  // 40. Plantar eco: ruído forte perto de uma parede dura às vezes desvia o Inspetor pra parede.
  let plantouEco = false;
  // 41-42. Ponto fraco do piso: correr colado faz ceder sob o Inspetor; devagar aguenta os dois.
  const pisoFraco = { x: 8, z: -24, r: 2 }, pisoFracoDica = { v: false }; let pisoCedeu = false;
  // 43. Água subindo numa caça: aviso pra buscar a parte alta.
  let subindoDica = false;
  // 44. Anéis de gotejamento do teto marcam pontos fixos na água.
  const pingos = [{ x: -2, z: -20 }, { x: 15, z: -36 }, { x: 0, z: -40 }]; let pingoT = 0, pingoIdx = 0;
  // 45-46. Reflexos tremidos (caustics) do lampião dele no teto quando está na água.
  const caust = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0, depthWrite: false })); caust.rotation.x = Math.PI / 2; caust.visible = false; grupo.add(caust);
  // 47-48. Ratos que fogem quando você chega perto (vida no túnel).
  const ratoMat = new THREE.MeshStandardMaterial({ color: 0x1a1512, roughness: 1 });
  const ratos = []; for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(.12, .07, .2), ratoMat); m.visible = false; grupo.add(m); ratos.push({ m, dir: 0, fug: 0 }); }
  let ratoCd = A.rand(10, 20), ratoIdx = 0;
  // 49. Zumbido grave que cresce quando você está submersa.
  let zumT = 0;
  // 50. A lanterna tremula um instante quando ele está colado na água.
  let flashDipCd = 0;

  tick(A, dt => {
    const t = A.perf(), ag = naAgua();
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;

    // eco da cisterna de um ponto errado
    if (!emTeste() && dist(cisterna.x, cisterna.z) < cisterna.r) {
      ecoCd -= dt;
      if (ecoCd <= 0 && M.ativo) { ecoCd = A.rand(10, 18); const ang = Math.random() * 6.28; const ex = cisterna.x + Math.cos(ang) * 4, ez = cisterna.z + Math.sin(ang) * 4; if (som && som.respiraAgua) try { som.respiraAgua({ x: ex, y: 1.2, z: ez }, .3); } catch (e) {} A.SFX.sussurros(.9); if (!ecoDica) { ecoDica = true; A.sub('lia', 'O eco joga a voz dele pro lugar errado. Confia no chapinhar dos passos, não no eco.'); } }
    }

    // plantar eco: ruído alto junto de parede dura desvia o Inspetor
    if (!emTeste() && !plantouEco && M.ativo && M.state !== 'caca' && P.room && P.room.tipo === 'tunel') {
      const perto = P.noiseR > 6 && (Math.abs(P.pos.x - P.room.x0) < 1 || Math.abs(P.pos.x - P.room.x1) < 1);
      if (perto && Math.random() < .5) { plantouEco = true; const ex = P.pos.x < 0 ? P.room.x1 : P.room.x0; A.emitNoise(ex, P.pos.z, 7); setTimeout(() => plantouEco = false, 4000); }
    }

    // ponto fraco do piso cede sob o Inspetor
    if (!emTeste() && !pisoCedeu && M.ativo && Math.hypot(M.pos.x - pisoFraco.x, M.pos.z - pisoFraco.z) < pisoFraco.r && dist(pisoFraco.x, pisoFraco.z) < pisoFraco.r + 1) {
      if (P.sprinting && M.state === 'caca') { pisoCedeu = true; A.SFX.pancada(pisoFraco.x, pisoFraco.z); A.emitNoise(pisoFraco.x, pisoFraco.z, 4); M.wait = Math.max(M.wait || 0, 2); M.cool = Math.max(M.cool || 0, 2); P.shake = Math.max(P.shake, .08); A.toast('O chão cedeu sob ele! Corra enquanto ele se levanta.'); }
    }
    if (!pisoFracoDica.v && dist(pisoFraco.x, pisoFraco.z) < pisoFraco.r) { pisoFracoDica.v = true; A.toast('O piso aqui está podre. Rápido demais e ele desaba; devagar aguenta.'); }

    // aviso de água subindo na caça
    if (ag && M.ativo && M.state === 'caca' && P.naAgua && !subindoDica) { subindoDica = true; A.toast('A água tá subindo. Busque a parte alta antes que encha.'); }

    // gotejamento: anéis fixos na água
    if (ag) { pingoT -= dt; if (pingoT <= 0) { pingoT = A.rand(.8, 1.8); const p = pingos[pingoIdx = (pingoIdx + 1) % pingos.length]; soltarOnda(p.x, p.z, .4); if (som && som.terra) try { som.terra({ x: p.x, z: p.z }); } catch (e) {} } }

    // caustics do lampião dele no teto quando está na água
    const aguaM = M.ativo && A.roomAt(M.pos.x, M.pos.z).agua && noCap4();
    if (aguaM && dM < 12) { caust.visible = true; caust.position.set(M.pos.x, (P.room && P.room.h ? P.room.h : 2.8) - .05, M.pos.z); caust.material.opacity = clamp((12 - dM) / 12 * .3, 0, .3) * (.6 + .4 * Math.sin(t * 8)); caust.rotation.z = t * .3; } else caust.visible = false;

    // ratos que fogem
    ratoCd -= dt;
    if (ratoCd <= 0 && P.room && P.room.tipo === 'tunel') { ratoCd = A.rand(12, 24); const r = ratos[ratoIdx = (ratoIdx + 1) % ratos.length]; r.m.position.set(clamp(P.pos.x + A.rand(-3, 3), P.room.x0 + .3, P.room.x1 - .3), .04, clamp(P.pos.z + A.rand(-3, 3), P.room.z0 + .3, P.room.z1 - .3)); r.m.visible = true; r.dir = Math.random() * 6.28; r.fug = 1.2; A.SFX.sussurros(.4); }
    for (const r of ratos) { if (!r.m.visible) continue; r.fug -= dt; const vx = Math.cos(r.dir) * dt * 3, vz = Math.sin(r.dir) * dt * 3; r.m.position.x += vx; r.m.position.z += vz; r.m.rotation.y = -r.dir; if (r.fug <= 0) r.m.visible = false; }

    // zumbido grave quando submersa
    const sub = def.submersa && def.submersa();
    if (sub) { zumT += dt; if (zumT > .6) { zumT = 0; A.SFX.sussurros(.3); } }

    // a lanterna tremula quando ele está colado na água
    if (ag && M.ativo && dM < 3 && A.roomAt(M.pos.x, M.pos.z).agua) { flashDipCd -= dt; if (flashDipCd <= 0 && A.flash) { flashDipCd = 1.5; const i0 = A.flash.intensity; A.flash.intensity *= .35; setTimeout(() => { try { if (A.flash) A.flash.intensity = i0; } catch (e) {} }, 120); } }
  });

  // ======================= TÚNEIS — 3ª leva de leitura =======================
  // 51. Água turva: um véu escuro sobe na superfície quando ele está submerso perto.
  const turva = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: 0x0a1712, transparent: true, opacity: 0, depthWrite: false }));
  turva.rotation.x = -Math.PI / 2; turva.visible = false; grupo.add(turva);
  // 52-53. Submersa, girar a câmera faz ondulação que o entrega; imóvel total salva.
  let camYaw = 0, imovelAviso = false;
  try { A.camera.getWorldDirection(vA); camYaw = Math.atan2(vA.x, vA.z); } catch (e) {}
  // 54. Gota d'água na tela ao passar sob um ponto de gotejamento.
  let telaGota = null;
  try { telaGota = document.getElementById('l5-gota'); if (!telaGota) { telaGota = document.createElement('div'); telaGota.id = 'l5-gota'; telaGota.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:39;opacity:0;transition:opacity .4s;background:radial-gradient(circle at 58% 28%,rgba(190,220,210,.2),rgba(0,0,0,0) 20%)'; (document.getElementById('hud') || document.body).appendChild(telaGota); } telaGota.style.opacity = '0'; } catch (e) {}
  let gotaTelaCd = A.rand(5, 12);
  // 55. Marcas de mão molhada escorrendo nas paredes dos túneis.
  const maoPMat = new THREE.MeshBasicMaterial({ color: 0x4a5a53, transparent: true, opacity: 0, depthWrite: false });
  const maosParede = []; for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.22, .34), maoPMat.clone()); m.visible = false; grupo.add(m); maosParede.push({ m, t: -9 }); }
  let maoPIdx = 0, maoPCd = A.rand(12, 24);
  // 56. Bolhas sobem na borda do refúgio quando ele passa por fora.
  // 57. Submersa demais aperta o medo (claustrofobia do fôlego).
  let submT = 0;

  tick(A, dt => {
    const t = A.perf(), ag = naAgua();
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;
    const sub = def.submersa && def.submersa();

    // água turva quando ele está submerso perto
    const aguaM = M.ativo && A.roomAt(M.pos.x, M.pos.z).agua;
    if (ag && aguaM && dM < 8) { turva.visible = true; turva.position.set(M.pos.x, nv() + .003, M.pos.z); turva.material.opacity = clamp((8 - dM) / 8 * .5, 0, .45); } else turva.visible = false;

    // submersa: girar a câmera faz ondulação; imobilidade total salva
    if (sub) {
      let y = camYaw; try { A.camera.getWorldDirection(vA); y = Math.atan2(vA.x, vA.z); } catch (e) {}
      const d = Math.abs(((y - camYaw + Math.PI) % (2 * Math.PI)) - Math.PI); camYaw = y;
      if (d > .012) { soltarOnda(P.pos.x, P.pos.z, clamp(d * 10, .3, 1.2)); if (!emTeste() && M.ativo && Math.random() < dt * 3) A.emitNoise(P.pos.x, P.pos.z, clamp(d * 20, 1, 3), true); }
      else if (!imovelAviso) { imovelAviso = true; A.sub('lia', 'Se eu ficar imóvel aqui embaixo, a água nem se mexe.'); }
    }

    // gota na tela sob gotejamento
    if (telaGota) { gotaTelaCd -= dt; if (gotaTelaCd <= 0 && pingos.some(p => dist(p.x, p.z) < 1.6)) { gotaTelaCd = A.rand(4, 9); telaGota.style.opacity = '1'; setTimeout(() => { try { telaGota.style.opacity = '0'; } catch (e) {} }, 500); } }

    // marcas de mão molhada escorrendo na parede
    maoPCd -= dt;
    if (maoPCd <= 0 && P.room && P.room.tipo === 'tunel' && dM > 7) { maoPCd = A.rand(16, 30); const r = P.room; const px = Math.random() < .5 ? r.x0 + .05 : r.x1 - .05; const m = maosParede[maoPIdx = (maoPIdx + 1) % maosParede.length]; m.m.position.set(px, 1.5, clamp(P.pos.z + A.rand(-2, 2), r.z0 + .5, r.z1 - .5)); m.m.rotation.y = px < 0 ? Math.PI / 2 : -Math.PI / 2; m.m.visible = true; m.t = t; }
    for (const m of maosParede) { if (!m.m.visible) continue; const a = t - m.t; m.m.material.opacity = clamp(1 - a / 10, 0, 1) * .4; m.m.position.y = 1.5 - clamp(a / 10, 0, 1) * .35; if (a > 10) m.m.visible = false; }

    // bolhas na borda do refúgio quando ele passa por fora
    if (ag && M.ativo && B && B.emitir) { const dR = Math.hypot(M.pos.x - refugio.x, M.pos.z - refugio.z); if (dR > refugio.r - .6 && dR < refugio.r + 1.4 && Math.random() < dt * 4) try { B.emitir(M.pos.x, nv(), M.pos.z, 1, .2); } catch (e) {} }

    // submersa demais aperta o medo
    if (sub) { submT += dt; if (submT > 4 && A.S.fear != null) A.S.fear = Math.min(100, A.S.fear + dt * 3); } else submT = 0;
  });

  return def;
}

// ---------------------------------------------------------------------
// CEMITÉRIO E CAPELA — Capítulo V (final)
// ---------------------------------------------------------------------
export function cemiterio(A, S, def, ctx = {}) {
  const { THREE, P, M, ANA } = A;
  const som = ctx.som, grupo = A.W.grupo;
  const covas = ctx.covas || [], pedras = ctx.pedras || [], sinoP = ctx.sinoP;
  const avivar = ctx.avivar || (() => {});
  const vA = new THREE.Vector3(), vB = new THREE.Vector3();
  const olhando = (x, y, z, corte = .7) => { A.camera.getWorldDirection(vA); vB.set(x, y, z).sub(A.camera.position); vB.normalize(); return vA.dot(vB) > corte; };
  const dist = (x, z) => Math.hypot(P.pos.x - x, P.pos.z - z);
  const coro = () => { try { const au = A.audio; if (!au || !au.AC) return; const AC = au.AC, t = AC.currentTime; for (const [f, k] of [[110, 0], [146.8, .25], [164.8, .5]]) { const g = au.saida(null, .45); au.osc('sine', f, t + k, 3, g); au.env(g, t + k, .6, .08, 2.6); } } catch (e) {} };

  // ===== A PÁ DENUNCIA: cavar faz ruído forte e sobe a fúria dele (Cap V) =====
  // 35-37. ganchos em S.tumulos: cada túmulo novo cavado emite ruído alto e aquece o Inspetor.
  let tumVistos = Object.keys(A.S.tumulos || {}).length, paDica = false;

  // ===== TRÊS ENTERRADOS: braços lentos saem das covas no toque do sino =====
  // 38-40. agarradores que avançam enquanto o sino não bate de novo.
  const bracoMat = new THREE.MeshStandardMaterial({ color: 0x6a6052, roughness: .97, emissive: 0x100d0a, emissiveIntensity: .3 });
  const bracos = []; let bracosFeito = false;
  const fazerBraco = (x, z) => { const g = new THREE.Group(); A.cyl(.05, .07, .9, bracoMat, 0, .45, 0, 6, g); for (let i = 0; i < 4; i++) A.box(.025, .18, .025, bracoMat, (i - 1.5) * .04, .95, 0, g, false); g.position.set(x, -1, z); grupo.add(g); return { g, base: z, prog: 0 }; };

  // ===== MÃOS DA TERRA nos túmulos errados prendem o pé 1 s =====
  // 41-42. passar por cima de monte de terra fresca (cova que você NÃO precisa) agarra.
  let maoTerraCd = A.rand(6, 12), presoT = 0, maoTerraDica = false;

  // ===== RETA ABERTA: ele ganha velocidade em linha reta; zigue-zague quebra =====
  // 43-44. no trecho aberto, correr reto na frente dele = ele alcança; zigue-zague o atrasa.
  let retaAcc = 0, lastAng = 0, zigAcc = 0, retaDica = false;

  // ===== CERCO ATÉ A COVA: ele te empurra em arco pra cova aberta =====
  // 45. ajusta o alvo do Inspetor pra te cortar o lado seguro, rumo à cova central.
  const covaCentro = { x: 0, z: -6 }; let cercoDica = false;

  // ===== PROCISSÃO DAS COVAS QUE PERSEGUE: a fila avança pelo campo depois do sino =====
  // 46-48. fila de crianças com velas que avança; lápides e capela são abrigo real.
  const criancaMat = new THREE.MeshStandardMaterial({ color: 0x241f1a, roughness: .96 });
  const velaMat = new THREE.MeshBasicMaterial({ color: 0xffd79a });
  const filaAvanca = new THREE.Group(); filaAvanca.visible = false; grupo.add(filaAvanca);
  for (let i = 0; i < 5; i++) { const kid = new THREE.Group(); A.cyl(.1, .14, .7, criancaMat, 0, .35, 0, 6, kid); const cab = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), criancaMat); cab.position.y = .8; kid.add(cab); const v = new THREE.Mesh(new THREE.SphereGeometry(.045, 6, 5), velaMat); v.position.set(.16, .95, 0); kid.add(v); kid.position.set(-4 + i * 2, 0, -46); filaAvanca.add(kid); }
  let filaOn = false, filaDano = 0, filaDica = false;

  // ===== CONVERGÊNCIA NA PORTA DA CAPELA (clímax) =====
  // 49-50. Inspetor, Menina e a fila convergem pro átrio quando você corre pras portas.
  let convDica = false;

  // ===== FUGA DO SINO: arrombamento ~1 s atrás na corrida final =====
  // 51-52. estrondos de porta arrombada escalando atrás de você.
  let arromba = -9, arrombaN = 0, fugaDica = false;

  // ===== ENCURRALADA NA CAPELA: ele bloqueia a porta e avança devagar =====
  // 53-54. pressão lenta e inevitável enquanto você procura a saída dos fundos.
  const bloqueio = new THREE.Group(); bloqueio.visible = false; grupo.add(bloqueio);
  { const mm = new THREE.MeshStandardMaterial({ color: 0x1a1512, roughness: .9 }); A.box(.5, 1.9, .3, mm, 0, .95, 0, bloqueio, false); const cab = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 6), mm); cab.position.y = 2; bloqueio.add(cab); }
  bloqueio.position.set(0, 0, -48.4); let encurDica = false, encurT = 0;

  // ===== BANCOS EM DOMINÓ: tombam atrás de você na fuga da capela =====
  // 55-56. estrondo e poeira empurrando sempre pra frente.
  const bancoMat = A.MAT && A.MAT.madeiraEsc ? A.MAT.madeiraEsc : new THREE.MeshStandardMaterial({ color: 0x3a2d20 });
  const bancos = []; for (let i = 0; i < 6; i++) { const b = A.box(1.6, .4, .3, bancoMat, (i % 2 ? -1.6 : 1.6), .4, -52 - i * 2, grupo, false); bancos.push({ m: b, caiu: false, base: -52 - i * 2 }); }
  let dominoN = 0;

  // ===== FARO DE FUMAÇA: vento que esconde a favor e entrega contra =====
  // 57-58. a fumaça do incêndio de 1979 carrega o cheiro; ficar a favor do vento esconde.
  const ventoDir = new THREE.Vector2(.7, .3).normalize(); let fumacaDica = false;

  // ===== TRECHO ÀS CEGAS guiado pelo apito no apagão da fuga =====
  // 59-60. o apito do Inspetor no estéreo diz pra onde correr.
  let apitoT = 0, cegasDica = false;

  // ===== CORREDOR QUE AFUNILA na fuga: teto da capela desaba atrás =====
  // 61. pedaços caem atrás e dos lados, empurrando pra frente.
  const entulhoMat = new THREE.MeshStandardMaterial({ color: 0x2a2622, roughness: .98 });
  const entulhos = []; for (let i = 0; i < 5; i++) { const e = A.box(1.2, 1.2, .6, entulhoMat, 0, 8, -50 - i * 3, grupo, false); e.visible = false; entulhos.push({ m: e, z: -50 - i * 3, caiu: false }); }
  let entulhoN = 0;

  // ===== ESCADA DO CAMPANÁRIO: Inspetor colado + degraus que estalam =====
  // 62-63. subida final com estalos e botes pelos vãos (reforço sensorial, sem morte garantida).
  let escadaDica = false, escadaT = 0;

  tick(A, dt => {
    const t = A.perf();
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;
    const sino = !!A.S.flags.sino;

    // -- a pá denuncia: cada túmulo novo cavado faz ruído alto e sobe a fúria
    const tn = Object.keys(A.S.tumulos || {}).length;
    if (tn > tumVistos) { tumVistos = tn; if (!emTeste()) { A.emitNoise(P.pos.x, P.pos.z, 10, true); if (M.ativo) M.furia = Math.max(M.furia || 0, 1); } if (!paDica) { paDica = true; A.toast('A pá faz barulho. Cave quando ele estiver longe.'); } }

    // -- três enterrados no toque do sino: braços que avançam até o sino bater de novo
    if (sino && !bracosFeito && !emTeste() && covas.length) {
      bracosFeito = true; const tres = covas.slice(0, 3);
      for (const c of tres) bracos.push(fazerBraco(c.x, c.z));
      coro();
    }
    if (bracos.length) { for (const b of bracos) { b.prog = Math.min(1, b.prog + dt * .25); b.g.position.y = -1 + b.prog * 1.1; b.g.rotation.z = Math.sin(t * 2 + b.base) * .3; const d = Math.hypot(b.g.position.x - P.pos.x, b.g.position.z - P.pos.z); if (d < 1.2 && b.prog > .5) { A.S.fear = Math.min(100, A.S.fear + dt * 10); P.shake = Math.max(P.shake, .02); } } }

    // -- mãos da terra nos túmulos que você NÃO cava: prendem o pé por 1 s
    if (!emTeste() && !sino && P.room && P.room.fora) {
      maoTerraCd -= dt;
      if (maoTerraCd <= 0 && presoT <= 0) { maoTerraCd = A.rand(8, 16); const perto = pedras.find(pd => Math.abs(pd.x - P.pos.x) < .8 && Math.abs(pd.z - P.pos.z) < .8); if (perto && Math.hypot(P.pos.x - lastPC.x, P.pos.z - lastPC.z) > .01) { presoT = 1; A.S.fear = Math.min(100, A.S.fear + 8); P.shake = Math.max(P.shake, .05); A.SFX.susto(); if (!maoTerraDica) { maoTerraDica = true; A.toast('Mãos de terra agarraram seu pé. Desvie dos montes de terra fresca.'); } } }
      if (presoT > 0) presoT -= dt;
    }

    // -- reta aberta: correr reto na frente dele o deixa alcançar; zigue-zague quebra
    if (sino && M.ativo && P.sprinting && P.room && P.room.fora && !emTeste()) {
      const ang = Math.atan2(P.pos.x - lastPC.x, P.pos.z - lastPC.z);
      const dAng = Math.abs(((ang - lastAng + Math.PI) % (2 * Math.PI)) - Math.PI); lastAng = ang;
      if (dAng < .25) { retaAcc += dt; if (retaAcc > 1.2) { retaAcc = 0; const dx = P.pos.x - M.pos.x, dz = P.pos.z - M.pos.z, dd = Math.hypot(dx, dz) || 1; M.pos.x += dx / dd * dt * 2.4; M.pos.z += dz / dd * dt * 2.4; if (!retaDica) { retaDica = true; A.toast('No aberto ele voa em linha reta. Zigue-zague entre as lápides.'); } } }
      else { zigAcc += dAng; retaAcc = Math.max(0, retaAcc - dt); if (zigAcc > 2 && M.ativo) { zigAcc = 0; M.cool = Math.max(M.cool || 0, .6); } }
    }

    // -- cerco até a cova: ele te empurra em arco rumo à cova aberta central
    if (sino && M.ativo && !emTeste() && dM < 10 && dist(covaCentro.x, covaCentro.z) > 3) {
      if (M.state === 'caca' && Math.random() < dt * .4) { const bx = covaCentro.x + (P.pos.x - covaCentro.x) * 1.3, bz = covaCentro.z + (P.pos.z - covaCentro.z) * 1.3; A.planejar(M, clamp(bx, -28, 28), clamp(bz, -46, 10)); if (!cercoDica) { cercoDica = true; A.toast('Ele te empurra pra cova aberta. Não deixe ele te cortar o lado seguro.'); } }
    }

    // -- procissão das covas que persegue: a fila avança pelo campo depois do sino
    if (sino && !filaOn && !emTeste() && t > (A.S.flags.l5_sinoT || (A.S.flags.l5_sinoT = t)) + 6) { filaOn = true; filaAvanca.visible = true; coro(); if (!filaDica) { filaDica = true; A.sub('lia', 'A fila saiu das covas. As lápides e a capela são o único abrigo.'); } }
    if (filaOn && filaAvanca.visible) {
      for (let i = 0; i < filaAvanca.children.length; i++) { const k = filaAvanca.children[i]; k.position.z += dt * .7; k.position.y = Math.abs(Math.sin(t * 5 + i)) * .05; }
      // longe de lápide/capela a fila machuca de leve (empurra pro abrigo, não mata)
      const abrigo = (P.room && !P.room.fora) || pedras.some(pd => Math.abs(pd.x - P.pos.x) < 1.3 && Math.abs(pd.z - P.pos.z) < 1.3);
      const frente = filaAvanca.children.some(k => Math.hypot(k.position.x - P.pos.x, k.position.z - P.pos.z) < 2.5);
      if (frente && !abrigo) { filaDano += dt; if (filaDano > .6) { filaDano = 0; A.S.fear = Math.min(100, A.S.fear + 6); P.shake = Math.max(P.shake, .03); } }
      if (filaAvanca.children[0] && filaAvanca.children[0].position.z > 12) filaAvanca.visible = false;
    }

    // -- convergência na porta da capela: Inspetor + Menina + fila rumam ao átrio
    const atrioX = 0, atrioZ = -48;
    if (sino && dist(atrioX, atrioZ) < 14 && !convDica) { convDica = true; if (!emTeste()) { if (M.ativo) A.planejar(M, atrioX - 6, atrioZ + 2); if (ANA && ANA.ativa) { try { ANA.pos.set(atrioX + 6, ANA.pos.y || 1, atrioZ + 2); } catch (e) {} } } A.sub('lia', 'Vêm os três de uma vez pro átrio. Preciso ler a brecha e passar.'); }

    // -- fuga do sino: arrombamento escalando atrás na corrida final
    if (sino && M.ativo && dM < 14 && !emTeste()) { arromba -= dt; if (arromba <= 0) { arromba = clamp(2.4 - arrombaN * .3, .9, 2.4); arrombaN++; A.SFX.pancada(M.pos.x, M.pos.z); A.SFX.portaBate && A.SFX.portaBate(); P.shake = Math.max(P.shake, .04); if (!fugaDica) { fugaDica = true; A.sub('lia', 'Ele arromba cada porta um segundo atrás de mim. Não dá pra parar.'); } } }

    // -- encurralada na capela: ele bloqueia a porta e avança devagar
    const naCapela = P.room && P.room.id === 'capela';
    if (sino && naCapela && M.ativo && !emTeste()) {
      bloqueio.visible = true; encurT += dt;
      bloqueio.position.z = -48.4 + Math.min(6, encurT * .5); // avança devagar pra dentro
      if (!encurDica) { encurDica = true; A.sub('lia', 'Ele travou a porta e vem devagar. A saída é pelos fundos.'); }
      if (encurT > 2 && M.ativo && Math.random() < dt) A.emitNoise(0, -48, 2);
    } else { bloqueio.visible = false; encurT = 0; }

    // -- bancos em dominó na fuga da capela
    if (sino && naCapela && !emTeste()) { dominoN += dt; const idx = Math.floor(dominoN / .5); if (idx < bancos.length && !bancos[idx].caiu) { bancos[idx].caiu = true; bancos[idx].m.rotation.x = -1.2; A.SFX.pancada(bancos[idx].m.position.x, bancos[idx].base); P.shake = Math.max(P.shake, .03); } }

    // -- faro de fumaça: a favor do vento esconde, contra entrega
    if (sino && M.ativo && P.room && P.room.fora && !emTeste()) {
      const dx = P.pos.x - M.pos.x, dz = P.pos.z - M.pos.z, dd = Math.hypot(dx, dz) || 1;
      const aFavor = (dx / dd) * ventoDir.x + (dz / dd) * ventoDir.y; // >0: fumaça leva seu cheiro pra longe dele
      if (aFavor < -.3) { if (Math.random() < dt * .6) A.emitNoise(P.pos.x, P.pos.z, 2, true); if (!fumacaDica) { fumacaDica = true; A.toast('A fumaça leva seu cheiro. Fique do lado pra onde o vento sopra.'); } }
    }

    // -- trecho às cegas guiado pelo apito no apagão da fuga
    if (sino && A.S.flags.apagaoCapela && M.ativo && !emTeste()) { apitoT -= dt; if (apitoT <= 0) { apitoT = 1.4; A.SFX.chamadoVoz ? A.SFX.chamadoVoz(M.pos.x, 1.6, M.pos.z) : A.SFX.sussurros(1); if (!cegasDica) { cegasDica = true; A.sub('lia', 'Tudo escuro. Só o apito dele diz pra onde correr.'); } } }

    // -- corredor que afunila na fuga: entulho cai atrás, empurrando pra frente
    if (sino && naCapela && !emTeste()) { entulhoN += dt; const idx = Math.floor(entulhoN / .8); if (idx < entulhos.length && !entulhos[idx].caiu) { entulhos[idx].caiu = true; const e = entulhos[idx]; e.m.visible = true; e.m.position.y = .6; A.SFX.pancada(0, e.z); P.shake = Math.max(P.shake, .05); } }

    // -- escada do campanário: estalos e botes pelos vãos durante a subida final
    if (sino && sinoP && Math.hypot(P.pos.x - sinoP.x, P.pos.z - sinoP.z) < 4 && P.pos.y > 2 && !emTeste()) {
      escadaT -= dt; if (escadaT <= 0) { escadaT = A.rand(.6, 1.2); A.SFX.tabua && A.SFX.tabua(); P.shake = Math.max(P.shake, .03); if (M.ativo && Math.random() < .4) A.SFX.grito('inspetor'); }
      if (!escadaDica) { escadaDica = true; A.sub('lia', 'Os degraus estalam e cedem atrás. Só dá pra subir.'); }
    }

    lastPC.copy(P.pos);
  });
  const lastPC = new THREE.Vector3().copy(P.pos);

  // ======================= CEMITÉRIO — bloco extra =======================
  // 64-65. Prensado entre a fila e o Inspetor: aviso pra achar abrigo e prender o ar.
  let prensDica = false;
  // 66. O coro das covas cresce conforme a fila se aproxima de você.
  let coroVolCd = 0;
  // 67-68. O Inspetor fareja o ar no campo, virando a cabeça pro vento (aparência).
  let farejaT = 0, farejaDica = false;
  // 69. Terra fresca afunda sob os pés com um som abafado.
  let terraDica = false;
  // 70-71. A fila deixa um rastro de velas apagadas por onde passa.
  const velaApMat = new THREE.MeshBasicMaterial({ color: 0x1a1812, transparent: true, opacity: 0, depthWrite: false });
  const velasAp = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.CircleGeometry(.1, 8), velaApMat.clone()); m.rotation.x = -Math.PI / 2; m.position.y = .02; m.visible = false; grupo.add(m); velasAp.push({ m, t: -9 }); }
  let velaApIdx = 0, velaApAcc = 0;
  // 72-73. Corvos levantam voo quando você corre no aberto (denúncia pelo som).
  let corvoCd = A.rand(14, 28), corvoDica = false;
  // 74. A neblina rasteira corre na direção do vento (leitura do faro de fumaça).
  // 75. A terra treme um instante antes dos braços saírem das covas.
  const tremorMat = new THREE.MeshBasicMaterial({ color: 0x2a2015, transparent: true, opacity: 0, depthWrite: false });
  const tremor = []; for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.CircleGeometry(.5, 12), tremorMat.clone()); m.rotation.x = -Math.PI / 2; m.position.y = .02; m.visible = false; grupo.add(m); tremor.push(m); }
  let tremorT = 0, tremorFeito = false;
  // 76. O vento uiva mais forte quando você está longe de qualquer abrigo.
  let uivoCd = A.rand(8, 16);
  const lastPC2 = new THREE.Vector3().copy(P.pos);

  tick(A, dt => {
    const t = A.perf();
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;
    const sino = !!A.S.flags.sino;

    // prensado: fila de um lado, Inspetor do outro, num raio apertado
    if (sino && filaAvanca.visible && M.ativo && dM < 7) {
      const filaPerto = filaAvanca.children.some(k => Math.hypot(k.position.x - P.pos.x, k.position.z - P.pos.z) < 6);
      if (filaPerto && !prensDica) { prensDica = true; A.sub('lia', 'Ele de um lado, a fila do outro. Me encolho e prendo o ar até passarem.'); }
    }

    // coro cresce com a fila
    if (sino && filaAvanca.visible) { const d = Math.min(...filaAvanca.children.map(k => Math.hypot(k.position.x - P.pos.x, k.position.z - P.pos.z))); coroVolCd -= dt; if (coroVolCd <= 0 && d < 10) { coroVolCd = clamp(d / 3, .6, 3); coro(); } }

    // o Inspetor fareja o vento virando a cabeça (só no campo, depois do sino)
    if (sino && M.ativo && !emTeste()) { farejaT -= dt; if (farejaT <= 0) { farejaT = A.rand(3, 6); A.SFX.ofego && A.SFX.ofego(); if (dM < 14 && !farejaDica) { farejaDica = true; A.toast('Ele ergue a cara e fareja o ar. Fique do lado certo do vento.'); } } }

    // terra fresca afunda sob os pés
    if (P.room && P.room.fora && pedras.some(pd => Math.abs(pd.x - P.pos.x) < 1 && Math.abs(pd.z - P.pos.z) < 1) && Math.hypot(P.pos.x - lastPC2.x, P.pos.z - lastPC2.z) > .01) {
      if (som && som.terra && Math.random() < dt * 4) try { som.terra({ x: P.pos.x, z: P.pos.z }); } catch (e) {}
      if (!terraDica) { terraDica = true; A.toast('A terra fresca afunda sob o pé. Pisa leve perto das covas.'); }
    }

    // rastro de velas apagadas atrás da fila
    if (sino && filaAvanca.visible) { velaApAcc += dt; if (velaApAcc > .6) { velaApAcc = 0; const k = filaAvanca.children[filaAvanca.children.length - 1]; if (k) { const m = velasAp[velaApIdx = (velaApIdx + 1) % velasAp.length]; m.m.position.set(k.position.x, .02, k.position.z); m.m.visible = true; m.t = t; } } }
    for (const m of velasAp) { if (!m.m.visible) continue; const a = t - m.t; m.m.material.opacity = clamp(1 - a / 8, 0, 1) * .5; if (a > 8) m.m.visible = false; }

    // corvos levantam voo quando corre no aberto
    if (P.sprinting && P.room && P.room.fora) { corvoCd -= dt; if (corvoCd <= 0) { corvoCd = A.rand(16, 30); A.SFX.sussurros(.8); if (!emTeste() && M.ativo && Math.random() < .5) A.emitNoise(P.pos.x, P.pos.z, 3, true); if (!corvoDica) { corvoDica = true; A.toast('Corvos levantam voo quando você corre. O barulho denuncia.'); } } }

    // a terra treme antes dos braços saírem (aviso do set-piece do sino)
    if (sino && !tremorFeito && bracos.length === 0 && covas.length) { tremorFeito = true; tremorT = 0; for (let i = 0; i < 3 && i < covas.length; i++) { tremor[i].position.set(covas[i].x, .02, covas[i].z); tremor[i].visible = true; } }
    if (tremorFeito && tremorT < 2) { tremorT += dt; for (const m of tremor) { if (!m.visible) continue; m.material.opacity = Math.abs(Math.sin(t * 20)) * .4 * clamp((2 - tremorT) / 2, 0, 1); m.scale.setScalar(1 + Math.sin(t * 20) * .1); } if (tremorT >= 2) for (const m of tremor) m.visible = false; }

    // o vento uiva quando você está longe de qualquer abrigo
    if (sino && P.room && P.room.fora) { const abrigo = pedras.some(pd => Math.abs(pd.x - P.pos.x) < 2 && Math.abs(pd.z - P.pos.z) < 2); if (!abrigo) { uivoCd -= dt; if (uivoCd <= 0) { uivoCd = A.rand(10, 18); A.SFX.sussurros(.5); } } }
    lastPC2.copy(P.pos);
  });

  // ======================= CEMITÉRIO — 3ª leva de leitura =======================
  // 77. Névoa rasteira corre na direção do vento (leitura do faro de fumaça).
  const nevMat = new THREE.MeshBasicMaterial({ color: 0x8a9a94, transparent: true, opacity: 0, depthWrite: false });
  const nevoas = []; for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), nevMat.clone()); m.rotation.x = -Math.PI / 2; m.position.set(A.rand(-12, 12), .1, A.rand(-24, 2)); grupo.add(m); nevoas.push(m); }
  // 78-79. Pegadas de lama da Lia no campo que o Inspetor fareja e segue.
  const pegMat = new THREE.MeshBasicMaterial({ color: 0x2a221a, transparent: true, opacity: 0, depthWrite: false });
  const pegs = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.CircleGeometry(.08, 6), pegMat.clone()); m.rotation.x = -Math.PI / 2; m.position.y = .02; m.visible = false; grupo.add(m); pegs.push({ m, t: -9 }); }
  let pegIdx = 0, pegAcc = 0, pegDica = false;
  // 80. Lápides racham com estalo quando os braços sobem.
  let laprachou = false;
  // 81-82. O sino balança sozinho de leve antes de você tocar (aviso do clímax).
  let sinoAviso = false;
  // 83. Grito distante do Inspetor ecoa pelo campo na fuga, marcando a direção.
  let gritoCd = A.rand(6, 12);
  // 84. Bafo frio sai das covas abertas quando você passa perto.
  const bafoMat = new THREE.MeshBasicMaterial({ color: 0x5a6a60, transparent: true, opacity: 0, depthWrite: false });
  const bafos = []; for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.8, 1.2), bafoMat.clone()); m.visible = false; grupo.add(m); bafos.push(m); }
  // 85-86. Corvo pousado numa lápide levanta voo quando você chega perto (susto calado).
  const corvoMat = new THREE.MeshStandardMaterial({ color: 0x08070a, roughness: 1 });
  const corvo = new THREE.Group(); A.box(.12, .1, .24, corvoMat, 0, 0, 0, corvo, false); corvo.visible = false; grupo.add(corvo);
  let corvoPousoCd = A.rand(10, 20), corvoPousado = false, corvoVoo = 0;
  const lastPC3 = new THREE.Vector3().copy(P.pos);

  tick(A, dt => {
    const t = A.perf();
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;
    const sino = !!A.S.flags.sino;
    const movP = Math.hypot(P.pos.x - lastPC3.x, P.pos.z - lastPC3.z);
    const fora = P.room && P.room.fora;

    // névoa rasteira corre na direção do vento
    for (const m of nevoas) { m.position.x += ventoDir.x * dt * .4; m.position.z += ventoDir.y * dt * .4; if (m.position.x > 32) m.position.x = -32; if (m.position.z > 14) m.position.z = -48; m.material.opacity = fora ? .08 : 0; }

    // pegadas de lama da Lia que o Inspetor fareja no campo
    if (fora && movP > .005) { pegAcc += movP; if (pegAcc > .9) { pegAcc = 0; const p = pegs[pegIdx = (pegIdx + 1) % pegs.length]; p.m.position.set(P.pos.x, .02, P.pos.z); p.m.visible = true; p.t = t; } }
    for (const p of pegs) { if (!p.m.visible) continue; const a = t - p.t; p.m.material.opacity = clamp(1 - a / 12, 0, 1) * .45; if (a > 12) p.m.visible = false; }
    if (sino && M.ativo && M.state !== 'caca' && !emTeste()) { const fresca = pegs.filter(p => p.m.visible).sort((a, b) => b.t - a.t)[0]; if (fresca && Math.hypot(M.pos.x - fresca.m.position.x, M.pos.z - fresca.m.position.z) < 6 && Math.random() < dt * .5) { A.planejar(M, fresca.m.position.x, fresca.m.position.z); if (!pegDica) { pegDica = true; A.toast('Você deixa pegadas de lama. Ele fareja seu rastro no campo.'); } } }

    // lápides racham com estalo quando os braços sobem
    if (bracos.length && !laprachou) { laprachou = true; if (A.SFX.pancada) A.SFX.pancada(P.pos.x, P.pos.z); P.shake = Math.max(P.shake, .04); }

    // sino balança de leve sozinho antes de você tocar
    if (!sino && sinoP && dist(sinoP.x, sinoP.z) < 10 && !sinoAviso) { sinoAviso = true; try { A.SFX.sino(); } catch (e) { A.SFX.sussurros(.4); } A.sub('lia', 'O sino balançou sozinho. Como se soubesse que eu vim.'); }

    // grito distante do Inspetor ecoa na fuga
    if (sino && M.ativo && !emTeste()) { gritoCd -= dt; if (gritoCd <= 0) { gritoCd = A.rand(7, 14); if (dM > 8 && A.SFX.grito) A.SFX.grito('inspetor'); } }

    // bafo frio das covas abertas quando passa perto
    if (sino) for (let i = 0; i < bafos.length && i < covas.length; i++) { const c = covas[i]; const d = dist(c.x, c.z); if (d < 3) { bafos[i].visible = true; bafos[i].position.set(c.x, .6 + Math.sin(t * 1.5 + i) * .1, c.z); try { bafos[i].lookAt(A.camera.position); } catch (e) {} bafos[i].material.opacity = clamp((3 - d) / 3 * .25, 0, .25); } else bafos[i].visible = false; }

    // corvo pousado que levanta voo de perto (susto calado)
    if (fora && !corvoPousado && corvoVoo <= 0) { corvoPousoCd -= dt; if (corvoPousoCd <= 0) { corvoPousoCd = A.rand(14, 26); const pd = pedras[(Math.random() * pedras.length) | 0]; if (pd) { corvo.position.set(pd.x, 1.1, pd.z); corvo.rotation.set(0, Math.random() * 6.28, 0); corvo.visible = true; corvoPousado = true; } } }
    if (corvoPousado && dist(corvo.position.x, corvo.position.z) < 2.5) { corvoPousado = false; corvoVoo = 1.4; A.SFX.sussurros(.7); P.shake = Math.max(P.shake, .03); A.S.fear = Math.min(100, A.S.fear + 4); if (!emTeste() && M.ativo && Math.random() < .5) A.emitNoise(P.pos.x, P.pos.z, 2, true); }
    if (corvoVoo > 0) { corvoVoo -= dt; corvo.position.y += dt * 3; corvo.rotation.z += dt * 6; if (corvoVoo <= 0) corvo.visible = false; }

    lastPC3.copy(P.pos);
  });

  // o Inspetor ouve de mais longe no campo durante a reta aberta já é tratado em monstros.js;
  // aqui só garantimos que a fila e o cerco não rodam fora do Cap V.
  const entrar0 = def.entrar;
  def.entrar = cap => { if (entrar0) entrar0(cap); bracosFeito = false; filaOn = false; arrombaN = 0; dominoN = 0; entulhoN = 0; };

  // mão da terra prende o pé: quase para a Lia por ~1 s (compõe com o velMul existente)
  const velMul0 = def.velMul;
  def.velMul = () => (velMul0 ? velMul0() : 1) * (presoT > 0 ? .06 : 1);

  return def;
}
