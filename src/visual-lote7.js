// =====================================================================
// LOTE 7 — VISUAL E LUZ: som e atmosfera (o lado de luz, chuva e partículas)
// A chama das velas denuncia o Inspetor, o vento e a porta que abriu; o trovão
// derruba e balança as lâmpadas; a poeira do feixe treme com os graves; a névoa
// respira com a caça; o bafo da Lia sai no frio (e o de outra pessoa também);
// pirilampos apagam quando ele chega; o relâmpago molha o vidro e revela a
// tempestade; o silêncio dilata o tempo. Tudo passivo, silencioso no QA
// (navigator.webdriver) e respeita "reduzir flashes". Ganchos em jogo.js:
// VL7.mapa, VL7.tick, VL7.depois, VL7.silencio, VL7.poeiraTeto e VL7.lento (queda da chuva).
// Regra de ouro: quase nada aqui é gravado "de vez": tudo o que mexe em luz,
// névoa, chama ou posição passa por tweak(), que desfaz sozinho no quadro
// seguinte se o motor não tiver reescrito o valor (nada acumula, nada fica preso).
// =====================================================================

export function instalarVisualLote7(C) {
  const { THREE, scene, camera, flash, hemi, moon, chuva, chuvaMat, respingos, W, P, OPT, SFX, rand, clamp, lerp } = C;
  const robo = (() => { try { return !!navigator.webdriver; } catch (e) { return false; } })();
  const baixa = () => { try { return !!(C.baixa && C.baixa()); } catch (e) { return false; } };
  const T = () => { try { return C.perf(); } catch (e) { return 0; } };
  const reduz = () => !!OPT.vFlash;
  const fora = () => !!(P.room && P.room.fora);
  const distM = () => { const M = C.M; return (M && M.ativo) ? Math.hypot(camera.position.x - M.pos.x, camera.position.z - M.pos.z) : 99; };
  const procFase = () => { try { return !!(C.PROC && C.PROC.fase); } catch (e) { return false; } };

  // ---------------------------------------------------------------- desfazer: nada acumula
  const livro = [];
  function tweak(o, k, novo) { const prev = o[k]; o[k] = novo; livro.push([o, k, prev, novo]); }
  function desfazer() { for (let i = livro.length - 1; i >= 0; i--) { const [o, k, prev, escrito] = livro[i]; if (o[k] === escrito) o[k] = prev; } livro.length = 0; }

  // dados que a lanterna (visual.js) lê: tremor da poeira, vibração do feixe, câmera lenta
  const FD = flash.userData.l7 = { tr: 0, bx: 0, by: 0, lento: 1 };

  // ---------------------------------------------------------------- partículas: um sistema pequeno e reaproveitável
  let _tex = null;
  function pontoTex() {
    if (_tex || typeof document === 'undefined') return _tex;
    const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d');
    const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.45, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32); _tex = new THREE.CanvasTexture(c); return _tex;
  }
  function sistema(n, o) {
    const g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3).fill(9999);
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    let col = null; if (o.cores) { col = new Float32Array(n * 3); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); }
    const m = new THREE.PointsMaterial({ color: o.cor, size: o.tam, transparent: true, opacity: o.op, depthWrite: false, sizeAttenuation: true, map: o.mapa ? pontoTex() : null, vertexColors: !!o.cores, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = o.ro || 3; pts.visible = false; scene.add(pts);
    const pool = []; for (let i = 0; i < n; i++) pool.push({ vida: 0, max: 1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, k: 0 });
    return {
      pts, pool, pos, col, m, n,
      nasce(vida) { const p = pool.find(p => p.vida <= 0); if (!p) return null; p.vida = p.max = vida; return p; },
      limpa() { for (const p of pool) p.vida = 0; pts.visible = false; },
      passo(dt, o2) { // integra; devolve a fração de vida máxima restante (para a opacidade)
        o2 = o2 || {}; const at = o2.atrito == null ? 1 : o2.atrito, gr = o2.grav || 0, kv = o2.vel == null ? 1 : o2.vel, sv = o2.sumir == null ? 1 : o2.sumir;
        let mx = 0;
        for (let i = 0; i < n; i++) {
          const p = pool[i];
          if (p.vida > 0) {
            p.vida -= dt * sv; p.x += p.vx * dt * kv; p.y += p.vy * dt * kv; p.z += p.vz * dt * kv; p.vy += gr * dt; p.vx *= at; p.vz *= at;
            pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z; mx = Math.max(mx, p.vida / p.max);
          } else { pos[i * 3] = pos[i * 3 + 1] = pos[i * 3 + 2] = 9999; }
        }
        pts.visible = mx > 0; g.attributes.position.needsUpdate = true; return mx;
      }
    };
  }

  // ================================================================ graves: poeira que treme e feixe que vibra
  let tetoTr = 0, tetoQ = [];
  function graves(dt) {
    const M = C.M, S = C.S, t = T(), dM = distM();
    let alvo = 0;
    // 1) trovão: o clarão vem antes e o estrondo chega depois (AUD.trovaoIni); a poeira treme com o estrondo, não com a luz
    try {
      const A = C.AUD && C.AUD(), ac = C.AC && C.AC();
      if (A && ac && A.trovaoIni && ac.currentTime >= A.trovaoIni && ac.currentTime <= A.trovaoAte) {
        const k = (ac.currentTime - A.trovaoIni) / Math.max(.1, A.trovaoAte - A.trovaoIni);
        alvo = Math.max(alvo, Math.sin(Math.min(1, k * 3) * Math.PI / 2) * (1 - k) * (fora() ? 1 : .65) * (.7 + .3 * Math.sin(t * 37)));
      }
    } catch (e) {}
    // 2) o passo pesado do Inspetor a menos de 10 m (mais rápido quando caça)
    if (dM < 10) { const ritmo = (C.M && C.M.state === 'caca') ? 3.1 : 1.9; alvo = Math.max(alvo, (1 - dM / 10) * Math.pow(Math.max(0, Math.sin(t * ritmo * 6.283)), 6) * .95); }
    // 3) a Procissão passando e o sino do fim
    if (procFase() && C.PROC.fase === 'passando') alvo = Math.max(alvo, .55 * (.6 + .4 * Math.sin(t * 9)));
    if (S && S.flags && S.flags.sino) alvo = Math.max(alvo, .5 * Math.pow(Math.max(0, Math.sin(t * 2.4)), 2));
    // 4) o infra-som da caçada por perto
    if (M && M.ativo && M.state === 'caca' && dM < 14) alvo = Math.max(alvo, .35 * (1 - dM / 14) * (.6 + .4 * Math.sin(t * 50)));
    // 5) a poeira que cai do forro quando alguém pisa no andar de cima
    tetoTr = Math.max(0, tetoTr - dt * 2); alvo = Math.max(alvo, tetoTr);
    FD.tr = lerp(FD.tr, alvo, Math.min(1, dt * (alvo > FD.tr ? 18 : 5)));
    const a = FD.tr * (reduz() ? .4 : 1) * .06;       // o feixe vibra 1 a 2 px no grave
    FD.bx = (Math.random() - .5) * 2 * a; FD.by = (Math.random() - .5) * 2 * a;
    if (FD.tr > .01 && S && S.flashOn) tweak(flash, 'intensity', flash.intensity * (1 + (Math.random() - .5) * FD.tr * .18)); // e a luz oscila no mesmo grave
  }

  // ================================================================ a lanterna cintila no ritmo do drone da sala
  function lanternaDrone() {
    const S = C.S; if (!S || !S.flashOn || procFase()) return;
    const dr = C.droneNivel ? C.droneNivel() : 0, dM = distM();
    if (dr < .02 && dM > 9) return;
    const f = clamp(dr * 60, 1, 4), t = T();
    let m = 1 + .05 * Math.sin(t * 6.283 * f) * clamp(dr * 20, .3, 1);       // 1 a 4 Hz, mesma frequência do tom
    if (dM < 9) m += Math.sin(t * 23) * Math.sin(t * 7.1) * .09 * (1 - dM / 9); // com entidade na sala a cintilação fica irregular
    tweak(flash, 'intensity', flash.intensity * m);
  }

  // ================================================================ velas: anemômetro (Inspetor, vento, porta, trovão)
  let velas = [], portaVento = null;
  function coletarVelas() {
    velas = [];
    if (!W.grupo) return;
    W.grupo.traverse(o => {
      if (o.isPointLight && o.userData && o.userData.vela && o.userData.chama) {
        const b = o.userData.velaBase || { x: o.position.x, y: o.position.y - .4, z: o.position.z };
        velas.push({ l: o, chama: o.userData.chama, x: b.x, y: b.y, z: b.z, lean: 0, leanX: 0, leanZ: 0, gut: 1, tr: 0, cor0: o.color.getHex() });
      }
    });
    for (const d of W.doors) d._l7open = undefined;
  }
  function vigiarPortas() {
    for (const d of W.doors) {
      if (d._l7open === undefined) { d._l7open = d.open; continue; }
      if (d.open !== d._l7open) { d._l7open = d.open; if (d.open) portaVento = { x: d.x != null ? d.x : (d.pivot ? d.pivot.position.x : 0), z: d.z != null ? d.z : (d.pivot ? d.pivot.position.z : 0), t: 8 }; }
    }
  }
  function atualizarVelas(dt) {
    if (!velas.length) return;
    const M = C.M, t = T(), dM = distM();
    const trov = Math.min(1, (C.raioI || 0) * 1.3);
    const passo = (dM < 8) ? (1 - dM / 8) : 0;
    const cacando = !!(M && M.ativo && M.state === 'caca' && dM < 13);
    if (portaVento) { portaVento.t -= dt; if (portaVento.t <= 0) portaVento = null; }
    for (const V of velas) {
      if (V.l.userData.apagada) continue;
      if (Math.abs(V.x - camera.position.x) > 12 || Math.abs(V.z - camera.position.z) > 12) continue;
      let ax = 0, az = 0, forca = 0;
      if (M && M.ativo) {
        const dx = V.x - M.pos.x, dz = V.z - M.pos.z, d = Math.hypot(dx, dz) || 1;
        if (d < 7) { const p = 1 - d / 7; ax += (dx / d) * p; az += (dz / d) * p; forca = Math.max(forca, p); }   // deita para longe dele
      }
      if (portaVento) {                                                                                           // a corrente de uma porta aberta puxa a chama na direção dela
        const dx = portaVento.x - V.x, dz = portaVento.z - V.z, d = Math.hypot(dx, dz) || 1;
        if (d < 14) { const p = (1 - d / 14) * Math.min(1, portaVento.t / 3); ax += (dx / d) * p * .9; az += (dz / d) * p * .9; forca = Math.max(forca, p * .6); }
      }
      const vw = C.vento ? C.vento() : 0;
      ax += vw * .12 * (fora() ? 1 : .35); forca = Math.max(forca, Math.min(1, Math.abs(vw) * .08 * (fora() ? 1 : .35)));
      const alvoLean = clamp(forca + passo * .4 + trov * .5, 0, 1.4);
      V.lean = lerp(V.lean, alvoLean, Math.min(1, dt * 4));
      V.leanX = lerp(V.leanX, ax, Math.min(1, dt * 3)); V.leanZ = lerp(V.leanZ, az, Math.min(1, dt * 3));
      const alvoGut = 1 - clamp((forca > .7 ? (forca - .7) / .3 : 0) + trov * .3, 0, .85);
      V.gut = lerp(V.gut, alvoGut, Math.min(1, dt * 6));
      V.tr = Math.max(0, V.tr - dt * 2); if (trov > .55 && V.tr <= 0) V.tr = .4;
      const trem = (V.tr > 0 ? Math.sin(t * 40) * .18 * V.tr : 0) + passo * Math.sin(t * 22 + V.x) * .12 + (cacando ? Math.sin(t * 14 + V.z) * .05 : 0);
      const ch = V.chama;
      tweak(ch.rotation, 'z', -V.leanX * 1.1 + trem); tweak(ch.rotation, 'x', V.leanZ * 1.1);
      tweak(ch.position, 'x', ch.position.x + V.leanX * .02); tweak(ch.position, 'z', ch.position.z + V.leanZ * .02);
      tweak(ch.scale, 'y', Math.max(.2, ch.scale.y * V.gut * (trov > .7 ? 1 - (trov - .7) * 1.5 : 1)));
      tweak(V.l, 'intensity', Math.max(.05, V.l.intensity * V.gut * (1 + trem * .3)));
      const cm = ch.material.color;
      if (V.gut < .4) { const b = (.4 - V.gut) / .4; cm.setRGB(1 - b * .3, .75 - b * .1, .37 + b * .4); } else cm.setRGB(1, .75, .37);
      const perto = Math.hypot(V.x - camera.position.x, V.z - camera.position.z);
      if (perto < 3.5 && !baixa()) { const k = 1 - perto / 3.5; V.l.color.setRGB(1, .58 - k * .06, .22 + k * .04); } else V.l.color.setHex(V.cor0);
      if (V.gut < .55 && passo > .2 && !baixa() && !robo) emitirFagulha(V);
    }
  }

  // fagulhas (brasas) das velas que quase apagam
  let FAG = null;
  function emitirFagulha(V) {
    if (!FAG) FAG = sistema(48, { cor: 0xff8a30, tam: .035, op: .9, add: true, mapa: true, ro: 4 });
    if (Math.random() > .2) return;
    const p = FAG.nasce(rand(.5, 1.1)); if (!p) return;
    const vw = C.vento ? C.vento() : 0;
    p.x = V.x + rand(-.02, .02); p.y = V.y + .3; p.z = V.z + rand(-.02, .02); p.vx = vw * .1 + rand(-.05, .05); p.vz = rand(-.05, .05); p.vy = rand(.25, .5);
  }

  // ================================================================ lâmpadas: trovão derruba, balança e a casa respira
  let lampT = 0, lampForca = 0, raioAnt = 0, blackout = 0, swayK = 0;
  function lampadas(dt) {
    const M = C.M, t = T(), ri = C.raioI || 0, dM = distM();
    const cacando = !!(M && M.ativo && (M.state === 'caca' || M.state === 'alerta') && dM < 15);
    if (!robo && W.mapa !== 'tuneis' && ri > .6 && raioAnt <= .6 && !procFase()) {
      lampT = reduz() ? .35 : .18; lampForca = Math.min(1, ri); swayK = Math.max(swayK, Math.min(1, ri));
      if (!reduz() && ri > .9 && Math.random() < .25 && blackout <= 0) blackout = .9;
      try { SFX.lampadaEstala(Math.min(1, ri)); } catch (e) {}
    }
    raioAnt = ri;
    if (lampT > 0) lampT -= dt;
    if (blackout > 0) blackout -= dt;
    swayK = Math.max(swayK, FD.tr * .5);
    swayK = Math.max(0, swayK - dt * .9);
    if (procFase() || robo) return;
    const kQ = lampT > 0 ? clamp(lampT / (reduz() ? .35 : .18), 0, 1) : 0;
    const fase = t * 6.283 / 14;                                  // o ciclo de 14 s da casa
    const vel = cacando ? 1 + 1.8 * (1 - dM / 15) : 1;
    for (const L of W.lampadas) {
      if (!L.ligada || L.estourou || L.l6off) continue;
      const lfo = Math.sin(fase * vel + L.x * .3) * (cacando ? .07 : .04) + (cacando ? Math.sin(t * 7.3 + L.z) * Math.sin(t * 3.1 + L.x) * .04 * (1 - dM / 15) : 0);
      let m = 1 + lfo;
      if (kQ > 0) { const inter = (M && M.ativo && Math.hypot(L.x - M.pos.x, L.z - M.pos.z) < 6) ? .5 : 1; m *= Math.max(.04, 1 - (reduz() ? .55 : .9) * lampForca * kQ * inter); }
      if (blackout > 0) m = 0;
      if (Math.abs(m - 1) > .002) {
        tweak(L.luz, 'intensity', L.luz.intensity * m);
        if (L.bulbo) tweak(L.bulbo.material, 'emissiveIntensity', Math.max(blackout > 0 ? .15 : .1, L.bulbo.material.emissiveIntensity * (m < 1 ? Math.max(.1, m) : 1)));
        if (L.halo) tweak(L.halo.material, 'opacity', L.halo.material.opacity * Math.max(.1, Math.min(1, m)));
      }
      if (swayK > .02 && L.bulbo) {                               // a lâmpada balança no fio com o grave
        const a = swayK * .035 * (reduz() ? .4 : 1), sx = Math.sin(t * 9 + L.x) * a, sz = Math.cos(t * 8 + L.z) * a;
        for (const o of [L.bulbo, L.halo, L.luz]) if (o) { tweak(o.position, 'x', o.position.x + sx); tweak(o.position, 'z', o.position.z + sz); }
      }
    }
  }

  // ================================================================ névoa viva
  let fogPulso = 0, fogLerp = 0;
  function nevoaViva(dt) {
    if (!scene.fog) return;
    const M = C.M, dM = distM();
    const caca = (M && M.ativo && (M.state === 'caca' || M.state === 'alerta')) ? 1 : 0;
    const perigo = Math.max(caca, dM < 6 ? (1 - dM / 6) * .7 : 0);
    fogLerp = lerp(fogLerp, perigo, Math.min(1, dt * .6));
    const temporal = (C.climaId && C.climaId() === 'temporal') ? .08 : 0;
    const dr = C.droneNivel ? C.droneNivel() : 0;
    fogPulso += dt * (1.1 + perigo * 1.6);
    const resp = Math.sin(fogPulso) * (.04 + dr * .5 + perigo * .05);
    const mult = 1 + fogLerp * (fora() ? .12 : .35 + temporal) + resp * (fora() ? .4 : 1);
    tweak(scene.fog, 'density', Math.max(.001, scene.fog.density * mult));
  }

  // ================================================================ bafo: o da Lia e o de quem mais respira no frio
  let BAF = null, BAF2 = null, bafoClock = 0, bafoOfegoCd = 0, bafo2Clock = 0;
  function salaFria() {
    if (W.mapa === 'cemiterio' || W.mapa === 'tuneis') return true;
    const cl = (C.climaId && C.climaId()) || '';
    return cl === 'neblina' || (cl === 'seca' && fora());
  }
  function bafo(dt) {
    if (robo || baixa()) { if (BAF) BAF.pts.visible = false; if (BAF2) BAF2.pts.visible = false; return; }
    const S = C.S, ativo = C.mode === 'jogo' && S && !S.dead && !S.fim;
    const frio = ativo && salaFria();
    if (!BAF && frio) { BAF = sistema(40, { cor: 0xcdd4de, tam: .1, op: 0, mapa: true }); BAF2 = sistema(14, { cor: 0xaab4c0, tam: .3, op: 0, mapa: true }); }
    if (!BAF) return;
    if (!frio) { BAF.limpa(); BAF2.limpa(); return; }
    const prende = !!(P.prende || P.semAr || (C.estatua && C.estatua()));
    const fear = S.fear || 0, dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    const vw = C.vento ? C.vento() : 0;
    if (!prende) {
      bafoClock += dt;
      const ciclo = 3.6 - Math.min(2.2, fear / 100 * 2.2);
      if (bafoClock >= ciclo) {
        bafoClock = 0;
        const base = camera.position.clone().addScaledVector(dir, .35); base.y -= .12;
        const n = 3 + Math.round(2 + fear / 40) + ((C.climaId && C.climaId() === 'neblina') ? 3 : 0);
        for (let k = 0; k < n; k++) { const p = BAF.nasce(rand(.9, 1.5)); if (!p) break; p.x = base.x + rand(-.04, .04); p.y = base.y + rand(-.03, .03); p.z = base.z + rand(-.04, .04); p.vx = dir.x * rand(.15, .4) + rand(-.08, .08) + vw * .06; p.vz = dir.z * rand(.15, .4) + rand(-.08, .08); p.vy = rand(.12, .26); }
      }
    }
    bafoOfegoCd = Math.max(0, bafoOfegoCd - dt);
    if (!prende && (P.ofegoT || 0) > 0 && bafoOfegoCd <= 0) {
      bafoOfegoCd = .5; bafoClock = 0;
      const base = camera.position.clone().addScaledVector(dir, .4); base.y -= .14;
      for (let k = 0; k < 8; k++) { const p = BAF.nasce(rand(1.1, 1.8)); if (!p) break; p.x = base.x + rand(-.05, .05); p.y = base.y + rand(-.04, .04); p.z = base.z + rand(-.05, .05); p.vx = dir.x * rand(.3, .6) + rand(-.1, .1); p.vz = dir.z * rand(.3, .6) + rand(-.1, .1); p.vy = rand(.1, .22); }
    }
    const mx = BAF.passo(dt, { atrito: .97, sumir: prende ? 3 : 1 });
    for (const p of BAF.pool) if (p.vida > 0) p.vy *= .98;
    BAF.m.opacity = (S.hidden ? .18 : .34) * Math.min(1, mx) * (prende ? .4 : 1);
    // o segundo bafo: mais lento e mais largo, no escuro à frente, quando o Inspetor respira perto sem ser visto
    const dM = distM(), M = C.M;
    if (M && M.ativo && dM < 9 && dM > 3 && !S.hidden) {
      bafo2Clock += dt;
      if (bafo2Clock >= 5.5) {
        bafo2Clock = 0;
        const ux = (M.pos.x - camera.position.x) / dM, uz = (M.pos.z - camera.position.z) / dM, d = Math.min(dM - .8, 3.4);
        for (let k = 0; k < 4; k++) { const p = BAF2.nasce(rand(2.2, 3.2)); if (!p) break; p.x = camera.position.x + ux * d + rand(-.15, .15); p.y = 1.55 + rand(-.1, .1); p.z = camera.position.z + uz * d + rand(-.15, .15); p.vx = rand(-.05, .05) + ux * .04; p.vz = rand(-.05, .05) + uz * .04; p.vy = rand(.04, .1); }
      }
    }
    const m2 = BAF2.passo(dt, { atrito: .99, sumir: 1 });
    BAF2.m.opacity = .2 * Math.min(1, m2);
  }

  // ================================================================ poeira que cai do forro (gancho: SOM.passosTeto)
  let TET = null, tetoNext = 0;
  function poeiraTeto(dt) {
    if (robo || baixa()) return;
    const t = T();
    while (tetoQ.length && tetoQ[0] <= t) {
      tetoQ.shift(); tetoTr = Math.max(tetoTr, .55);
      if (!TET) TET = sistema(48, { cor: 0xd6ccb8, tam: .045, op: .6, mapa: true });
      const dir = new THREE.Vector3(); camera.getWorldDirection(dir); dir.y = 0; dir.normalize();
      for (let k = 0; k < 8; k++) {
        const p = TET.nasce(rand(2.4, 3.6)); if (!p) break;
        const d = rand(.5, 3.4), lat = rand(-1.1, 1.1);
        p.x = camera.position.x + dir.x * d - dir.z * lat; p.z = camera.position.z + dir.z * d + dir.x * lat; p.y = 2.9 + rand(-.1, .1);
        p.vx = rand(-.03, .03); p.vz = rand(-.03, .03); p.vy = -rand(.1, .28);
      }
    }
    if (TET) { const m = TET.passo(dt, { atrito: .99 }); TET.m.opacity = .6 * Math.min(1, m * 1.5); }
  }

  // ================================================================ pirilampos no cemitério
  let FF = null, ffIni = false;
  function pirilampos(dt) {
    const S = C.S, M = C.M;
    const on = !robo && !baixa() && W.mapa === 'cemiterio' && fora() && C.mode === 'jogo' && S && !S.dead && !S.fim;
    if (!on) { if (FF) FF.pts.visible = false; return; }
    if (!FF) { FF = sistema(18, { cor: 0xffffff, tam: .11, op: 1, mapa: true, add: true, cores: true, ro: 4 }); ffIni = false; }
    const t = T();
    if (!ffIni) { for (const p of FF.pool) { p.vida = 9999; p.max = 9999; ffSpawn(p); p.k = 0; } ffIni = true; }
    let alguma = false;
    for (let i = 0; i < FF.n; i++) {
      const p = FF.pool[i], ph = i * 1.7;
      p.x += Math.cos(t * .4 + ph) * .3 * dt; p.z += Math.sin(t * .35 + ph * 1.3) * .3 * dt; p.y = clamp(p.y + Math.sin(t * .6 + ph) * .12 * dt, .5, 2.4);
      if (Math.hypot(p.x - camera.position.x, p.z - camera.position.z) > 19) ffSpawn(p);
      const pisca = .55 + .45 * Math.sin(t * 1.3 + ph * 3);
      let alvo = pisca;
      if (M && M.ativo && Math.hypot(p.x - M.pos.x, p.z - M.pos.z) < 10) alvo = 0;           // apagam em círculo quando o Inspetor chega
      p.k = lerp(p.k, alvo, Math.min(1, dt * (alvo < p.k ? 4 : .5)));                       // e voltam devagar, depois
      FF.pos[i * 3] = p.x; FF.pos[i * 3 + 1] = p.y; FF.pos[i * 3 + 2] = p.z;
      FF.col[i * 3] = .85 * p.k; FF.col[i * 3 + 1] = 1 * p.k; FF.col[i * 3 + 2] = .45 * p.k;
      if (p.k > .02) alguma = true;
    }
    FF.pts.geometry.attributes.position.needsUpdate = true; FF.pts.geometry.attributes.color.needsUpdate = true; FF.pts.visible = alguma;
  }
  function ffSpawn(p) { const a = rand(0, 6.283), r = rand(4, 16); p.x = camera.position.x + Math.cos(a) * r; p.z = camera.position.z + Math.sin(a) * r; p.y = rand(.6, 2.2); }

  // ================================================================ água: anéis dos passos do Inspetor e ondas sem pingo
  let aneisX = 0, aneisZ = 0, aneisAcc = 0, soloT = 8, soloFila = [];
  function naAgua(x, z) {
    for (const m of W.agua) { const g = m.geometry && m.geometry.parameters; if (g && Math.abs(x - m.position.x) < g.width / 2 && Math.abs(z - m.position.z) < g.height / 2) return m; }
    return null;
  }
  function aneis(dt) {
    if (robo || !W.agua || !W.agua.length || !C.criarOnda) return;
    const M = C.M, S = C.S; if (!S || C.mode !== 'jogo' || S.dead || S.fim) return;
    if (M && M.ativo && naAgua(M.pos.x, M.pos.z)) {          // cada passo dele desenha um anel, mesmo longe da vista
      aneisAcc += Math.hypot(M.pos.x - aneisX, M.pos.z - aneisZ);
      if (aneisAcc > .85) { aneisAcc = 0; C.criarOnda(M.pos.x, M.pos.z); }
    } else aneisAcc = 0;
    if (M && M.ativo) { aneisX = M.pos.x; aneisZ = M.pos.z; }
    const t = T();
    while (soloFila.length && soloFila[0].t <= t) { const o = soloFila.shift(); if (naAgua(o.x, o.z)) C.criarOnda(o.x, o.z); }
    soloT -= dt;
    if (soloT <= 0 && W.mapa === 'tuneis') {                 // ondas concêntricas sem pingo: algo invisível anda na água
      soloT = rand(10, 22);
      const perto = W.agua.filter(m => Math.hypot(m.position.x - camera.position.x, m.position.z - camera.position.z) < 16);
      if (perto.length) {
        const m = perto[(Math.random() * perto.length) | 0], g = m.geometry.parameters;
        let x = m.position.x + rand(-g.width / 2, g.width / 2) * .8, z = m.position.z + rand(-g.height / 2, g.height / 2) * .8;
        const a = rand(0, 6.283), n = 2 + ((Math.random() * 3) | 0);
        for (let i = 0; i < n; i++) soloFila.push({ t: t + i * .55, x: x + Math.cos(a) * i * .7, z: z + Math.sin(a) * i * .7 });
      }
    }
  }

  // ================================================================ camadas de tela (DOM)
  let elVidro = null, elVinh = null, elSil = null, elEmb = null, elShh = null, elOnda = null;
  function garantirCamadas() {
    if (elVidro || typeof document === 'undefined') return;
    const st = document.createElement('style');
    st.textContent = '#l7-vidro{position:fixed;inset:0;pointer-events:none;z-index:5;opacity:0;mix-blend-mode:screen;' +
      'background:radial-gradient(2px 10px at 20% 12%,rgba(180,200,230,.5),transparent 60%),radial-gradient(2px 14px at 62% 24%,rgba(180,200,230,.45),transparent 60%),radial-gradient(3px 18px at 38% 55%,rgba(180,200,230,.4),transparent 60%),radial-gradient(2px 12px at 82% 40%,rgba(180,200,230,.5),transparent 60%),radial-gradient(2px 16px at 10% 70%,rgba(180,200,230,.42),transparent 60%),radial-gradient(3px 20px at 72% 78%,rgba(180,200,230,.38),transparent 60%);transition:opacity .08s linear}' +
      '#l7-vinh,#l7-sil{position:fixed;inset:0;pointer-events:none;z-index:5;opacity:0}' +
      '#l7-vinh{background:radial-gradient(circle at 50% 50%,transparent 42%,rgba(0,0,0,.72) 100%)}' +
      '#l7-sil{background:radial-gradient(circle at 50% 50%,transparent 36%,rgba(0,0,0,.9) 100%);transition:opacity 1.6s ease-in}' +
      '#l7-emb{position:fixed;inset:0;pointer-events:none;z-index:5;opacity:0;background:radial-gradient(ellipse at 50% 50%,rgba(220,230,240,0) 28%,rgba(220,230,240,.55) 100%);backdrop-filter:blur(1.5px)}' +
      '#l7-shh{position:fixed;pointer-events:none;z-index:5;opacity:0;font:italic 700 9vmin Georgia,serif;color:rgba(255,255,255,.55);text-shadow:0 0 6px rgba(255,255,255,.5);letter-spacing:.1em;transform:rotate(-6deg)}' +
      '#l7-onda{position:fixed;left:50%;top:50%;width:30vmin;height:30vmin;margin:-15vmin 0 0 -15vmin;border:3px solid rgba(190,215,255,.55);border-radius:50%;pointer-events:none;z-index:5;opacity:0;box-shadow:0 0 18px rgba(190,215,255,.35),inset 0 0 18px rgba(190,215,255,.2)}';
    document.head.appendChild(st);
    const mk = (id, tag) => { const e = document.createElement(tag || 'div'); e.id = id; document.body.appendChild(e); return e; };
    elVidro = mk('l7-vidro'); elVinh = mk('l7-vinh'); elSil = mk('l7-sil'); elEmb = mk('l7-emb'); elShh = mk('l7-shh', 'span'); elShh.textContent = 'shh'; elOnda = mk('l7-onda');
  }

  // vidro molhado no clarão + tempestade que chega + onda de choque na lente
  let vidroK = 0, raioAnt2 = 0, mudoT = 0, muteFlash = 0, botePrev = false;
  function relampago(dt) {
    if (robo) return;
    garantirCamadas();
    const S = C.S, ri = C.raioI || 0, M = C.M;
    const temJanela = fora() || W.mapa === 'estrada' || W.mapa === 'terreo' || W.mapa === 'superior';
    if (!reduz() && ri > .55 && raioAnt2 <= .55 && temJanela && W.mapa !== 'tuneis') vidroK = 1;
    if (ri > .6 && raioAnt2 <= .6 && fora() && S && C.mode === 'jogo' && !S.dead && !S.fim) S.fear = Math.min(100, S.fear + 2);
    if (!reduz() && ri > .8 && raioAnt2 <= .8 && elOnda && !baixa()) onda(.35 + ri * .25, 22);                // onda de choque na lente: o estrondo que vem do céu
    const bote = !!(M && M.ativo && M.state === 'bote');
    if (bote && !botePrev && !reduz() && elOnda) onda(.55, 50);                                                  // e o golpe do Inspetor sacode a lente
    botePrev = bote;
    raioAnt2 = ri;
    vidroK = Math.max(0, vidroK - dt * .9);
    if (elVidro) elVidro.style.opacity = (reduz() ? 0 : (vidroK * .5 + ri * vidroK * .4)).toFixed(3);
    if (respingos && respingos.material && fora()) { const v = .45 + ri * .5; tweak(respingos.material, 'opacity', v); }
    if (chuvaMat && fora()) tweak(chuvaMat, 'opacity', Math.min(1, chuvaMat.opacity + ri * .25));
    if (fora()) { tweak(moon, 'intensity', moon.intensity + ri * .6); tweak(hemi, 'intensity', hemi.intensity + ri * .25); }
  }
  function onda(op, topo) {
    try { elOnda.style.top = topo + '%'; elOnda.animate([{ transform: 'scale(.2)', opacity: op }, { transform: 'scale(3.4)', opacity: 0 }], { duration: 420, easing: 'ease-out' }); } catch (e) {}
  }
  function tempestadeChegando(dt) {
    if (robo || reduz()) { muteFlash = 0; return; }
    const S = C.S; if (!S || C.mode !== 'jogo' || S.dead || S.fim) return;
    const clima = (C.climaId && C.climaId()) || '';
    if (W.mapa === 'tuneis' || clima === 'seca') return;
    const capT = S.capT || 0; if (capT > 55) return;
    const chega = clamp(capT / 55, 0, 1);
    mudoT -= dt;
    if (mudoT <= 0) { mudoT = rand(5, 10) * (1 - chega * .6); muteFlash = .18 + chega * .35; }
    muteFlash = Math.max(0, muteFlash - dt * 2.2);
    if (muteFlash > 0) { const f = muteFlash * (fora() ? 1 : .35); tweak(moon, 'intensity', moon.intensity + f * .9); tweak(hemi, 'intensity', hemi.intensity + f * .35); }
  }

  // sinestesia: a vinheta pulsa com o subgrave da caça no medo máximo
  function sinestesia(dt) {
    if (robo || !elVinh) return;
    const S = C.S, M = C.M;
    const perigoMax = (M && M.ativo && M.state === 'caca') || (procFase() && C.PROC.fase === 'passando');
    const alvo = (!reduz() && S && (S.fear || 0) > 90 && perigoMax) ? (.1 + .14 * (.5 + .5 * Math.sin(T() * 7.5))) : 0;
    elVinh.style.opacity = lerp(+(elVinh.style.opacity || 0), alvo, Math.min(1, dt * 6)).toFixed(3);
  }

  // ================================================================ silêncio como arma: vinheta que fecha e o tempo que dilata
  let silT = 0, lento = 1;
  function silencio(dt) {
    silT = Math.max(0, silT - dt);
    const alvo = silT > 0 ? .25 : 1;                          // as gotas e a poeira caem a 25% da velocidade
    lento = lerp(lento, reduz() ? 1 : alvo, Math.min(1, dt * (silT > 0 ? 8 : 1.2)));   // e o som volta: a velocidade volta em ~1 s
    FD.lento = lento; api.lento = lento;
    if (elSil) elSil.style.opacity = (!reduz() && silT > 0 && !robo) ? '.1' : '0';
  }

  // ================================================================ o vidro embaça com o medo; "shh" desenhado por fora
  let embK = 0, shhT = 0, shhPos = 0;
  function embaco(dt) {
    if (robo || !elEmb) return;
    const S = C.S, M = C.M;
    const sala = (W.mapa === 'terreo' || W.mapa === 'superior') && !fora();
    const alvo = (!reduz() && sala && S && C.mode === 'jogo' && !S.dead && (S.fear || 0) > 60) ? clamp(((S.fear || 0) - 60) / 40, 0, 1) * .55 : 0;
    embK = lerp(embK, alvo, Math.min(1, dt * (alvo > embK ? .5 : .25)));                       // limpa em ~4 s
    elEmb.style.opacity = embK.toFixed(3);
    if (embK > .12 && M && M.ativo && distM() < 8) {
      if (shhT <= 0) { shhPos++; elShh.style.left = (18 + ((shhPos * 37) % 50)) + '%'; elShh.style.top = (22 + ((shhPos * 23) % 30)) + '%'; }
      shhT = 4;
    }
    shhT = Math.max(0, shhT - dt);
    elShh.style.opacity = (Math.min(1, shhT / 1.5) * Math.min(1, embK * 2.2)).toFixed(3);
  }

  // ================================================================ ambiência dá um fôlego no clarão
  let ambAnt = 0;
  function ambienciaRelampago() {
    if (robo || reduz()) return;
    const ri = C.raioI || 0, AC = C.AC && C.AC(), AMB = C.AMB && C.AMB();
    if (ri > .6 && ambAnt <= .6 && AC && AMB && AMB.drone) {
      const g = AMB.drone.gain, t = AC.currentTime;
      try { const v = g.value; g.cancelScheduledValues(t); g.setValueAtTime(v, t); g.linearRampToValueAtTime(v * .5, t + .02); g.setValueAtTime(v * .5, t + .1); g.linearRampToValueAtTime(v, t + .32); } catch (e) {}
    }
    ambAnt = ri;
  }

  // ganchos públicos ------------------------------------------------
  const rodar = (f, ...a) => { try { f(...a); } catch (e) {} };
  const api = {
    lento: 1,
    mapa() {
      try {
        desfazer(); coletarVelas(); lampT = 0; blackout = 0; vidroK = 0; bafoClock = 0; bafo2Clock = 0; mudoT = rand(2, 5); portaVento = null; swayK = 0; tetoQ = []; tetoTr = 0; soloFila = []; soloT = rand(6, 12); aneisAcc = 0; silT = 0; ffIni = false; embK = 0; shhT = 0;
        if (BAF) BAF.limpa(); if (BAF2) BAF2.limpa(); if (TET) TET.limpa(); if (FAG) FAG.limpa();
      } catch (e) {}
    },
    silencio(dur) { silT = Math.max(silT, Math.min(12, +dur || 1.5)); },   // gancho: abafarMundo e SOM.silencio
    poeiraTeto() { const t = T(), n = 4 + ((Math.random() * 3) | 0); for (let i = 0; i < n; i++) tetoQ.push(t + i * .62); }, // gancho: SOM.passosTeto (mesmo compasso dos passos)
    depois() { try { desfazer(); } catch (e) {} },
    tick(dt) {
      try {
        if (C.mode !== 'jogo' && C.mode !== 'titulo' && C.mode !== 'cena') return;
        desfazer();
        rodar(graves, dt); rodar(vigiarPortas); rodar(atualizarVelas, dt); rodar(lanternaDrone); rodar(lampadas, dt); rodar(nevoaViva, dt);
        rodar(bafo, dt); rodar(poeiraTeto, dt); rodar(pirilampos, dt); rodar(aneis, dt);
        rodar(relampago, dt); rodar(tempestadeChegando, dt); rodar(sinestesia, dt); rodar(silencio, dt); rodar(embaco, dt); rodar(ambienciaRelampago);
        if (FAG) { const m = FAG.passo(dt, { grav: -.6 }); FAG.m.opacity = .9 * Math.min(1, m * 2); }
      } catch (e) {}
    }
  };
  return api;
}
