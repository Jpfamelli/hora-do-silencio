// INTERNATO — POLIMENTO (Lote 3): sensação, acessibilidade, toque e desempenho no térreo e nos dormitórios.
// polirTerreo() e polirSuperior() são chamados por terreo() e superior() em mapas.js e devolvem ganchos
// { sync, entrar, ruidoMul } — juntar() encadeia sync/entrar; ruidoMul o próprio mapa chama.
// Inclui a janela quebrada da copa (atalho agachada pelos cacos, que o Inspetor não atravessa).
// Tudo procedural: texturas em canvas e som com o AudioContext do motor (A.audio()).

// ---------- utilidades
function base(A, S) {
  const { THREE } = A;
  const agenda = [];
  const depois = (t, f) => agenda.push({ t, f });
  const _v = new THREE.Vector3(), _f = new THREE.Vector3();
  const olhando = (x, y, z, cos = .9, alcance = 8) => {
    _v.set(x, y, z).sub(A.camera.position); const d = _v.length(); if (d > alcance || d < .01) return false;
    A.camera.getWorldDirection(_f); return _f.dot(_v.multiplyScalar(1 / d)) > cos;
  };
  const dist = (x, z) => Math.hypot(A.P.pos.x - x, A.P.pos.z - z);
  const sala = () => (A.P.room && A.P.room.id) || '';
  const corpo = c => document.body.classList.contains(c);
  const PO = () => (window.__plat && window.__plat.O) || {};
  const qual = () => PO().qual || 'alta';
  let opt = {}, optT = 0;
  const lerOpt = () => { try { opt = JSON.parse(localStorage.getItem('hora-silencio-opt') || '{}') || {}; } catch (e) { opt = {}; } };
  lerOpt();
  const menosClarao = () => !!+opt.vFlash;
  // tremor de câmera: respeita "tremor da câmera" da tela Desempenho (menos movimento)
  const tremor = k => { const m = PO().tremor ?? 1; A.P.shake = Math.max(A.P.shake || 0, k * m); };
  // vibração no celular e no controle, respeitando a opção de vibrar
  const vib = (ms, forte = .5) => {
    if (PO().vibrar === false) return;
    try { if (corpo('toque') && navigator.vibrate) navigator.vibrate(ms); } catch (e) {}
    try { if (corpo('pad') && navigator.getGamepads) for (const g of navigator.getGamepads()) if (g && g.vibrationActuator && g.vibrationActuator.playEffect) g.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: forte, weakMagnitude: forte * .6 }).catch(() => {}); } catch (e) {}
  };
  // legendas de som próprias (usam o mesmo letreiro de src/monstros-lore.js e a opção "Legendar sons")
  const leg = (txt, imp = true) => { try { if (window.__mlore && window.__mlore.legenda) window.__mlore.legenda(txt, imp); } catch (e) {} };
  const tAgachar = () => corpo('toque') ? 'Agachar' : corpo('pad') ? 'B' : 'C';
  const tex = (w, h, draw) => { const t = A.canvasTex(w, h, draw); t.userData = { clone: true }; return t; };
  const medo = n => { S.fear = Math.min(100, (S.fear || 0) + n); };
  // os efeitos deste módulo nunca derrubam o jogo: um erro vira aviso uma vez só
  let avisou = false;
  const tick = f => A.W.tick.push(dt => { try { f(dt); } catch (e) { if (!avisou) { avisou = true; console.warn('internato-polimento', e); } } });
  tick(dt => {
    optT -= dt; if (optT <= 0) { optT = 2; lerOpt(); }
    for (let i = agenda.length - 1; i >= 0; i--) { agenda[i].t -= dt; if (agenda[i].t <= 0) { const f = agenda[i].f; agenda.splice(i, 1); f(); } }
  });
  // som procedural
  // A.audio é um objeto (getter AC); sem contexto de áudio ainda (antes do primeiro clique) fica em silêncio
  const au = () => { try { const a = A.audio; return a && a.AC && a.AC.state !== 'closed' ? a : null; } catch (e) { return null; } };
  const SOM = {
    vento(pos, vol = .2) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(pos, .5, 'amb'); const f = a.burst(t, 1.9, 'bandpass', 650 + Math.random() * 400, 7, g, 0); f.frequency.linearRampToValueAtTime(1000 + Math.random() * 500, t + 1.8); a.env(g, t, .6, vol, 1.2); },
    cacos(pos, vol = .35) { const a = au(); if (!a) return; const t = a.AC.currentTime; for (let i = 0; i < 4; i++) { const k = Math.random() * .25, g = a.saida(pos, .2, 'sfx'); a.burst(t + k, .03, 'highpass', 3500 + Math.random() * 2500, 2, g); a.env(g, t + k, .001, vol * (.5 + Math.random() * .5), .04); } },
    tilintar(pos, vol = .08) { const a = au(); if (!a) return; const t = a.AC.currentTime; [2637, 3520, 3136].forEach((f, i) => { const g = a.saida(pos, .5, 'sfx'); a.osc('sine', f, t + i * .11, .6, g); a.env(g, t + i * .11, .004, vol, .5); }); },
    guincho(pos) { const a = au(); if (!a) return; const t = a.AC.currentTime; for (let i = 0; i < 6; i++) { const k = i * .13 + Math.random() * .06, g = a.saida(pos, .3, 'sfx'), f = 2600 + Math.random() * 1600; const o = a.osc('sine', f, t + k, .07, g); o.frequency.exponentialRampToValueAtTime(f * 1.35, t + k + .06); a.env(g, t + k, .004, .06, .05); } const g = a.saida(pos, .2, 'sfx'); a.burst(t, 1, 'bandpass', 5000, 1, g, 0); a.env(g, t, .05, .03, .8); },
    tique(pos, alto) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(pos, .15, 'sfx'); a.burst(t, .02, 'highpass', alto ? 5200 : 3800, 1, g, 0); a.env(g, t, .001, .07, .03); },
    gota(pos, vol = .06) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(pos, .35, 'sfx'); const o = a.osc('sine', 1300 + Math.random() * 300, t, .09, g); o.frequency.exponentialRampToValueAtTime(480, t + .08); a.env(g, t, .002, vol, .07); },
    metal(pos, vol = .12) { const a = au(); if (!a) return; const t = a.AC.currentTime; for (const f of [620, 910, 1480]) { const g = a.saida(pos, .4, 'sfx'); a.osc('triangle', f * (.97 + Math.random() * .06), t + Math.random() * .05, .8, g); a.env(g, t, .002, vol, .7); } },
    rangeMetal(pos, vol = .06, dur = .5) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(pos, .3, 'sfx'); const bp = a.AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 7; bp.connect(g); const o = a.AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(260 + Math.random() * 40, t); o.frequency.linearRampToValueAtTime(200, t + dur); o.connect(bp); o.start(t); o.stop(t + dur + .05); a.env(g, t, .05, vol, dur); },
    baque(pos, vol = .4) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(pos, .4, 'sfx'); a.burst(t, .14, 'lowpass', 380, 1, g, 0); a.env(g, t, .002, vol, .14); const g2 = a.saida(pos, .2, 'sfx'); const o = a.osc('sine', 85, t, .2, g2); o.frequency.exponentialRampToValueAtTime(45, t + .18); a.env(g2, t, .002, vol * .8, .18); },
    pano(pos, vol = .05) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(pos, .2, 'sfx'); a.burst(t, .5, 'bandpass', 2400, 1.2, g, 0); a.env(g, t, .12, vol, .35); },
    faisca(pos) { const a = au(); if (!a) return; const t = a.AC.currentTime; for (let i = 0; i < 8; i++) { const k = Math.random() * .4, g = a.saida(pos, .3, 'sfx'); a.burst(t + k, .02, 'highpass', 4200, 1, g); a.env(g, t + k, .001, .25, .02); } },
    trava(pos) { const a = au(); if (!a) return; const t = a.AC.currentTime; for (const [k, f] of [[0, 2200], [.07, 1500]]) { const g = a.saida(pos, .2, 'sfx'); a.burst(t + k, .03, 'bandpass', f, 4, g, 0); a.env(g, t + k, .001, .3, .05); } },
    liquido(pos, vol = .05) { const a = au(); if (!a) return; const t = a.AC.currentTime, g = a.saida(pos, .2, 'sfx'); const f = a.burst(t, .45, 'lowpass', 500, 3, g, 0); f.frequency.linearRampToValueAtTime(260, t + .4); a.env(g, t, .05, vol, .35); }
  };
  // materiais próprios brilham sem mexer nos materiais compartilhados do motor (A.MAT)
  const compartilhado = m => Object.values(A.MAT).includes(m);
  // objetivos: brilham quando a lanterna passa por eles e ganham uma área de mira maior (toque e controle)
  const destacar = (its) => {
    const lista = [];
    for (const it of its) {
      if (!it || !it.obj) continue;
      const mats = [];
      it.obj.traverse(o => { if (o.isMesh && o.material && o.material.emissive && !compartilhado(o.material) && !mats.some(m => m.m === o.material)) mats.push({ m: o.material, b: o.material.emissiveIntensity || .6 }); });
      const hb = new THREE.Mesh(new THREE.BoxGeometry(.55, .45, .55), new THREE.MeshBasicMaterial({ visible: false }));
      hb.position.y = .15; hb.userData.it = it; it.obj.add(hb);
      lista.push({ it, mats, k: 0 });
    }
    const p = new THREE.Vector3();
    tick(dt => {
      for (const L of lista) {
        const o = L.it.obj; if (!o.visible) continue;
        o.getWorldPosition(p);
        const alvo = S.flashOn && Math.hypot(A.P.pos.x - p.x, A.P.pos.z - p.z) < 7 && olhando(p.x, p.y + .1, p.z, .965, 7) ? 1 : 0;
        L.k += (alvo - L.k) * Math.min(1, dt * 5);
        if (L.k < .01 && !L.sujo) continue;
        L.sujo = L.k >= .01;
        const pulso = .7 + .3 * Math.sin(A.perf() * 5);
        for (const m of L.mats) m.m.emissiveIntensity = m.b * (1 + L.k * 1.8 * pulso);
      }
    });
  };
  // objetos miúdos não projetam sombra: menos desenho no mapa de sombras (notebook fraco agradece)
  const semSombraMiuda = () => {
    const lim = qual() === 'alta' ? .16 : .3;
    A.W.grupo.traverse(o => {
      if (!o.isMesh || !o.castShadow || !o.geometry) return;
      const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); if (!g.boundingSphere) return;
      const s = o.scale, r = g.boundingSphere.radius * Math.max(s.x, s.y, s.z);
      if (r < lim) o.castShadow = false;
    });
  };
  // tinta fosforescente: carrega com a lanterna apontada e descarrega devagar no escuro
  const fosforo = (mats, x, z, alcance = 7) => {
    let carga = .4;
    tick(dt => {
      if (Math.abs(A.P.pos.x - x) + Math.abs(A.P.pos.z - z) > 40) return;
      const perto = Math.hypot(A.P.pos.x - x, A.P.pos.z - z) < alcance;
      carga = Math.max(.12, Math.min(1, carga + (S.flashOn && perto ? dt * .45 : -dt * .025)));
      for (const m of mats) m.emissiveIntensity = .15 + carga * .85;
    });
  };
  // lâmpada que balança com o trovão (a luz e as sombras mexem junto)
  const balancarNoTrovao = (L) => {
    if (!L) return;
    const b0 = L.bulbo.position.clone(), h0 = L.halo.position.clone(), l0 = L.luz.position.clone();
    let amp = 0, fase = 0, antes = 0;
    tick(dt => {
      const r = A.raioI || 0;
      if (r > .12 && antes <= .12 && Math.hypot(A.P.pos.x - L.x, A.P.pos.z - L.z) < 16) amp = Math.min(.09, amp + .06);
      antes = r;
      if (amp < .002) return;
      amp *= Math.exp(-dt * .9); fase += dt * 3.1;
      const dx = Math.sin(fase) * amp, dz = Math.cos(fase * .7) * amp * .5;
      L.bulbo.position.set(b0.x + dx, b0.y, b0.z + dz); L.halo.position.set(h0.x + dx, h0.y, h0.z + dz); L.luz.position.set(l0.x + dx * 1.3, l0.y, l0.z + dz * 1.3);
    });
  };
  const lampadaDa = id => A.W.lampadas.find(L => { const r = A.roomAt(L.x, L.z); return r && r.id === id; });
  // marcas no chão (pegadas): textura de pé em canvas
  const texPe = (crianca) => tex(64, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = '#fff';
    g.beginPath(); g.ellipse(32, 78, crianca ? 13 : 15, crianca ? 34 : 38, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(32, 112, 11, 12, 0, 0, 7); g.fill();
    for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(18 + i * 7, 34 - Math.abs(2 - i) * 3, 4.5 - i * .5, 0, 7); g.fill(); }
  });
  const decal = (map, w, h, cor, op) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, color: cor, transparent: true, opacity: op, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.rotation.x = -Math.PI / 2; m.renderOrder = 2; A.W.grupo.add(m); return m;
  };
  // placa pintada com texto (lê de perto sem tela cheia: userData.leitura)
  const placaTxt = (linhas, w, h, opts = {}) => {
    const map = A.textoTex(linhas, { w: 512, h: Math.round(512 * h / w), tam: 34, manchas: 3, ...opts });
    const mat = new THREE.MeshStandardMaterial({ map, roughness: .9, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.userData.leitura = { t: linhas.map(l => l.t ?? l).join(' · ') };
    A.W.grupo.add(m); return { m, mat };
  };
  // partículas leves (um único desenho por nuvem)
  const nuvem = (n, cor, tam, aditivo) => {
    const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: cor, size: tam, transparent: true, opacity: 0, depthWrite: false, blending: aditivo ? THREE.AdditiveBlending : THREE.NormalBlending });
    const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.visible = false; A.W.grupo.add(pts);
    const vel = new Float32Array(n * 3); let vida = 0, dur = 1, grav = 0;
    const N = {
      pts, soltar(x, y, z, espalha = .4, sobe = 0, d = 1.2, g = -2) {
        for (let i = 0; i < n; i++) { pos[i * 3] = x + (Math.random() - .5) * espalha; pos[i * 3 + 1] = y + (Math.random() - .5) * .1; pos[i * 3 + 2] = z + (Math.random() - .5) * espalha; vel[i * 3] = (Math.random() - .5) * espalha; vel[i * 3 + 1] = sobe * Math.random(); vel[i * 3 + 2] = (Math.random() - .5) * espalha; }
        geo.attributes.position.needsUpdate = true; vida = dur = d; grav = g; pts.visible = true; mat.opacity = .85;
      }
    };
    tick(dt => {
      if (!pts.visible) return;
      vida -= dt; if (vida <= 0) { pts.visible = false; return; }
      for (let i = 0; i < n; i++) { vel[i * 3 + 1] += grav * dt; pos[i * 3] += vel[i * 3] * dt; pos[i * 3 + 1] = Math.max(.01, pos[i * 3 + 1] + vel[i * 3 + 1] * dt); pos[i * 3 + 2] += vel[i * 3 + 2] * dt; }
      geo.attributes.position.needsUpdate = true; mat.opacity = .85 * Math.min(1, vida / dur * 1.5);
    });
    return N;
  };
  return { depois, olhando, dist, sala, qual, menosClarao, tremor, vib, leg, tAgachar, tex, medo, tick, SOM, destacar, semSombraMiuda, fosforo, balancarNoTrovao, lampadaDa, texPe, decal, placaTxt, nuvem, compartilhado };
}

// textura de tapete gasto (passadeira)
function texTapete(U, cor = [92, 30, 24]) {
  return U.tex(128, 512, (g, w, h) => {
    g.fillStyle = `rgb(${cor[0]},${cor[1]},${cor[2]})`; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(190,150,80,.45)'; g.lineWidth = 5; g.strokeRect(10, 6, w - 20, h - 12);
    g.strokeStyle = 'rgba(190,150,80,.25)'; g.lineWidth = 2;
    for (let y = 40; y < h; y += 64) { g.beginPath(); g.moveTo(w / 2, y - 22); g.lineTo(w / 2 + 26, y); g.lineTo(w / 2, y + 22); g.lineTo(w / 2 - 26, y); g.closePath(); g.stroke(); }
    for (let i = 0; i < 2400; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * .18})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(30,22,16,.45)'; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 10 + Math.random() * 20, 14 + Math.random() * 30, Math.random() * 3, 0, 7); g.fill(); }
  });
}
function texGlow(U, linhas, cor = 'rgba(170,255,190,.95)') {
  return U.tex(512, 192, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = cor; g.textAlign = 'center'; g.font = 'bold 40px Georgia';
    linhas.forEach((l, i) => { g.save(); g.translate(w / 2, 70 + i * 60); g.rotate((Math.random() - .5) * .06); g.fillText(l, 0, 0); g.restore(); });
  });
}
function texFumaca(U) {
  return U.tex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(160,160,155,.55)'); gr.addColorStop(.6, 'rgba(120,120,115,.2)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
}

// =====================================================================
// TÉRREO
// =====================================================================
export function polirTerreo(A, S, ctx) {
  const U = base(A, S), { THREE, MAT, box, cyl, plano } = A;
  const { X } = ctx;
  const J = () => window.__jogo;
  const tick = U.tick;

  // ---------------- COPA DE SERVIÇO + JANELA QUEBRADA (rota alternativa pelos fundos)
  const JX = 6, JZ = -23; // janela no meio da parede entre a copa e a lavanderia
  const mVidro = new THREE.MeshStandardMaterial({ color: 0x9fb8b8, roughness: .08, metalness: .35, emissive: 0x334448, emissiveIntensity: .25, transparent: true, opacity: .75 });
  const mParede = A.texMat('reboco', .4, .3);
  const peitoril = box(.3, .85, 1.3, mParede, JX, .425, JZ); A.W.solid.push(peitoril);
  box(.34, .05, 1.4, MAT.madeiraEsc, JX, .87, JZ);
  for (const s of [-1, 1]) box(.32, 1.05, .07, MAT.madeiraEsc, JX, 1.375, JZ + s * .63);
  box(.32, .07, 1.33, MAT.madeiraEsc, JX, 1.87, JZ);
  // o que sobrou do vidro: lascas presas no caixilho
  for (const [y, z, h, r] of [[1.72, -.4, .26, .5], [1.75, .1, .2, -.4], [1.05, .45, .3, .3], [1.0, -.5, .2, -.6], [1.68, .48, .22, .2]]) { const l = box(.008, h, .14, mVidro, JX, y, JZ + z, A.W.grupo, false); l.rotation.x = r; }
  // mãozinha marcada no pedaço de vidro de cima
  const texMao = U.tex(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(40,30,26,.75)'; g.beginPath(); g.ellipse(32, 40, 12, 14, 0, 0, 7); g.fill(); for (let i = 0; i < 4; i++) { g.save(); g.translate(20 + i * 8, 24); g.rotate((i - 1.5) * .12); g.fillRect(-2.5, -16, 5, 18); g.restore(); } g.save(); g.translate(46, 40); g.rotate(.9); g.fillRect(-2.5, -12, 5, 14); g.restore(); });
  const mao = plano(.16, .16, new THREE.MeshBasicMaterial({ map: texMao, transparent: true, depthWrite: false }), JX + .012, 1.66, JZ - .32, Math.PI / 2);
  mao.userData.leitura = { t: 'Uma mão pequena marcada no vidro, de dentro para fora.' };
  // riscos no batente: o Davi já fugia por aqui
  const texRisco = U.tex(256, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(210,200,180,.8)'; g.fillStyle = 'rgba(210,200,180,.8)'; g.font = 'italic 30px Georgia'; g.textAlign = 'center'; g.fillText('D. 1979', w / 2, 48); g.font = 'italic 22px Georgia'; g.fillText('por aqui ele não passa', w / 2, 92); });
  const risco = plano(.3, .15, new THREE.MeshBasicMaterial({ map: texRisco, transparent: true, depthWrite: false }), JX - .17, 1.35, JZ + .6, -Math.PI / 2);
  risco.userData.leitura = { t: 'Riscado a prego no batente: "D. 1979 — por aqui ele não passa".' };
  // cacos no chão dos dois lados
  const cacos = [];
  for (let i = 0; i < 16; i++) { const lado = i % 2 ? 1 : -1, c = box(.04 + Math.random() * .06, .006, .03 + Math.random() * .05, mVidro, JX + lado * (.25 + Math.random() * .7), .008, JZ + (Math.random() - .5) * 1.2, A.W.grupo, false); c.rotation.y = Math.random() * 3; cacos.push(c); }
  // trapo preso no caixilho, balançando com o vento
  const trapo = new THREE.Group(); trapo.position.set(JX - .02, 1.82, JZ + .5); A.W.grupo.add(trapo);
  const mTrapo = new THREE.MeshStandardMaterial({ color: 0x6a6258, roughness: 1, side: THREE.DoubleSide });
  const pTrapo = plano(.2, .55, mTrapo, 0, -.27, 0, Math.PI / 2, trapo);
  // a janela não deixa passar andando: só agachada, pelos cacos
  A.addCollider(JX - .2, JX + .2, JZ - .66, JZ + .66);
  const vao = new THREE.Mesh(new THREE.BoxGeometry(.5, 1.05, 1.2), new THREE.MeshBasicMaterial({ visible: false }));
  vao.position.set(JX, 1.38, JZ); A.W.grupo.add(vao);
  const itJan = A.interact(vao, () => S.hidden ? '' : !A.P.crouch ? `Janela de vidro quebrado. Agache (${U.tAgachar()}) para passar pelos cacos.` : '<b>E</b>Passar pela janela quebrada (segure) <small style="opacity:.7">((·)) faz barulho</small>', () => {
    if (!A.P.crouch) { A.toast(`Em pé você se corta. Agache (${U.tAgachar()}) e passe devagar.`); return; }
    const lado = A.P.pos.x < JX ? 1 : -1;
    A.P.pos.x = JX + lado * .95; A.P.pos.z = JZ; A.P.crouch = true;
    A.P.yaw = lado > 0 ? -Math.PI / 2 : Math.PI / 2; // sai virada para a frente
    U.SOM.cacos({ x: JX, y: .3, z: JZ }, .45); U.leg('cacos de vidro rangendo'); U.vib(90, .35); U.tremor(.05);
    const n = S.flags.janelaN = (S.flags.janelaN || 0) + 1;
    if (n === 1) U.depois(.8, () => A.sub('lia', '(sussurro) Ele é grande demais pra passar aqui. Eu não sou.'));
    const M = A.M;
    if (M.ativo && ['caca', 'procura', 'investiga', 'alerta'].includes(M.state) && Math.hypot(M.pos.x - JX, M.pos.z - JZ) < 10) {
      U.depois(1.4, () => { U.SOM.baque({ x: JX, y: 1.2, z: JZ }, .6); U.SOM.cacos({ x: JX, y: 1, z: JZ }, .3); U.leg('alguém esmurra o caixilho da janela'); U.medo(10); U.tremor(.08); if (!S.flags.janelaMurro) { S.flags.janelaMurro = true; U.depois(1.2, () => A.sub('lia', 'Ele não cabe. Ele não cabe. Vai dar a volta.')); } });
    }
  });
  itJan.hold = 1.5; itJan.ruido = 9; itJan.pode = () => A.P.crouch && !S.hidden;
  let janT = 0, ventoT = 1, cacosMotor = false, trapoF = 0;
  tick(dt => {
    const d = U.dist(JX, JZ);
    // os cacos entram na conta do motor (pisar em pé faz barulho), depois que o mapa terminou de montar
    if (!cacosMotor && A.M.cacosGrupo === A.W.grupo && A.M.cacos) { cacosMotor = true; A.M.cacos.push({ x: JX + .6, z: JZ, cd: 0 }, { x: JX - .6, z: JZ, cd: 0 }); }
    if (d > 14) return;
    // atravessando: estalos de vidro a cada passo e a tela treme de leve
    const j = J();
    if (j && j.alvo === itJan && j.keys.KeyE && A.P.crouch) { janT -= dt; if (janT <= 0) { janT = .42; U.SOM.cacos({ x: JX, y: .2, z: JZ }); U.tremor(.03); U.leg('cacos de vidro rangendo', false); } } else janT = 0;
    // vento assobiando pela janela: dá para achar ela no escuro pelo ouvido
    ventoT -= dt; if (ventoT <= 0) { ventoT = 2.2 + Math.random() * 1.6; if (d < 11) { U.SOM.vento({ x: JX, y: 1.4, z: JZ }, .05 + .18 * (1 - d / 11)); U.leg('vento assobiando numa janela quebrada', false); } }
    trapoF += dt; trapo.rotation.x = Math.sin(trapoF * 2.1) * .22 + Math.sin(trapoF * 5.3) * .06;
    // a lanterna faz os cacos brilharem
    const k = S.flashOn && d < 6 && U.olhando(JX, .2, JZ, .8, 6) ? .55 + .45 * Math.sin(A.perf() * 9) : 0;
    mVidro.emissiveIntensity = .25 + k * .9;
  });

  // copa: bancada, armário, passa-pratos, carrinho e marmita
  const mInox = new THREE.MeshStandardMaterial({ color: 0x5a6062, roughness: .45, metalness: .6 });
  A.prop(5, .9, .6, mInox, .5, .45, -25.6);
  A.armario(-3.2, -20.45, [0, -1]);
  const passa = new THREE.Group(); passa.position.set(-5.855, 1.5, -25.2); A.W.grupo.add(passa);
  box(.04, .5, .6, MAT.madeiraEsc, 0, -.25, 0, passa);
  box(.02, .64, .72, MAT.madeiraEsc, -5.89, 1.25, -25.2, A.W.grupo, false); // moldura (fica no lugar)
  const carro = new THREE.Group(); carro.position.set(3, 0, -20.9); A.W.grupo.add(carro);
  for (const y of [.25, .75]) box(.8, .03, .5, mInox, 0, y, 0, carro);
  for (const [x, z] of [[-.38, -.23], [.38, -.23], [-.38, .23], [.38, .23]]) box(.03, .78, .03, mInox, x, .39, z, carro);
  const mPrato = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: .4 });
  const pratos = [];
  for (let i = 0; i < 6; i++) pratos.push(cyl(.1, .1, .012, mPrato, -.2 + (i % 3) * .2, .78 + Math.floor(i / 3) * .014, (i % 2 ? .1 : -.1), 10, carro));
  A.addCollider(2.58, 3.42, -21.17, -20.63);
  const marmita = cyl(.09, .09, .14, mInox, -1, .97, -25.6, 10);
  A.interact(marmita, () => `<b>E</b>Ler a marmita de alumínio${S.flags.l3_marmita ? '<small style="opacity:.6"> (lido)</small>' : ''}`, () => {
    S.flags.l3_marmita = true; A.SFX.papel();
    A.dialogo([
      { quem: 'lia', texto: 'Uma marmita amassada, com o nome gravado a ponta de faca: "M. DUARTE — INSPETOR".' },
      { quem: 'lia', texto: 'Tá morna. Feijão e arroz. Alguém ainda faz a comida dele.' }
    ]);
  });
  const placaCopa = U.placaTxt([{ t: 'COPA', tam: 54, estilo: 'bold' }, { t: 'só funcionários', tam: 30, estilo: 'italic' }], .8, .34);
  placaCopa.m.position.set(-6.115, 1.9, -24.45); placaCopa.m.rotation.y = -Math.PI / 2;
  // segredo: riscado no ladrilho, só brilha no escuro e de perto agachada
  const mSeg = new THREE.MeshBasicMaterial({ map: texGlow(U, ['OBRIGADO POR VOLTAR', '— D.']), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const segCopa = plano(1.1, .42, mSeg, 1.4, .012, -24.75); segCopa.rotation.x = -Math.PI / 2;
  let passaT = 0, passaAng = 0, carroCd = 0;
  tick(dt => {
    if (U.sala() !== 'copa' && U.dist(0, -23) > 9) return;
    // passa-pratos: a portinhola bate quando o Inspetor está no refeitório do outro lado
    const M = A.M, ref = M.ativo && A.roomAt(M.pos.x, M.pos.z);
    passaT -= dt;
    if (ref && ref.id === 'refeit' && U.sala() === 'copa' && passaT <= 0) { passaT = 3 + Math.random() * 3; passaAng = .55; U.SOM.baque({ x: -5.9, y: 1.3, z: -25.2 }, .3); U.leg('a portinhola do passa-pratos bate'); }
    passaAng = Math.max(0, passaAng - dt * 1.6); passa.rotation.z = Math.sin(passaAng * 9) * passaAng * .6;
    // carrinho de pratos: esbarrar em pé faz os pratos baterem
    carroCd -= dt;
    if (carroCd <= 0 && A.P.noiseR > 0 && !A.P.crouch && !S.hidden && U.dist(3, -20.9) < 1.05) { carroCd = 3; U.SOM.metal({ x: 3, y: .8, z: -20.9 }, .09); A.emitNoise(3, -20.9, 6, true); U.leg('pratos batendo num carrinho'); for (const p of pratos) p.userData.t = .5; }
    for (const p of pratos) if (p.userData.t > 0) { p.userData.t -= dt; p.rotation.z = Math.sin(p.userData.t * 40) * p.userData.t * .3; }
    // tinta que brilha no escuro
    const ver = !S.flashOn && A.P.crouch && U.dist(1.4, -24.75) < 2.4;
    mSeg.opacity += ((ver ? .85 : 0) - mSeg.opacity) * Math.min(1, dt * 1.5);
    if (ver && mSeg.opacity > .6 && !S.flags.l3_segCopa) { S.flags.l3_segCopa = true; A.toast('Segredo da copa: um recado brilhando no ladrilho.'); U.depois(1, () => A.sub('lia', '(sussurro) Ele sabia que eu ia voltar. Ele riscou isso pra mim.')); }
  });

  // ---------------- GERADOR: treme, solta fumaça, LED pisca
  const { ger, led, visor, quadro, grade, EX, fusNoQuadro, alcapao, bal, itens } = ctx;
  const texF = texFumaca(U), fumos = [];
  const nFumo = U.qual() === 'baixa' ? 3 : 7;
  for (let i = 0; i < nFumo; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texF, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; A.W.grupo.add(s); fumos.push({ s, t: 0 }); }
  let fumoT = 0, energiaAntes = !!S.flags.energia;
  const faiscas = U.nuvem(18, 0xffb050, .05, true);
  tick(dt => {
    const d = U.dist(31.6, -19);
    if (d > 30) return;
    const per = A.perf();
    if (!S.flags.energia) led.material.emissiveIntensity = U.menosClarao() ? .55 + .35 * Math.sin(per * 2) : (Math.sin(per * 6) > 0 ? 1.7 : .15);
    else {
      led.material.emissiveIntensity = 1.1;
      ger.position.x = 31.6 + (Math.random() - .5) * .014; ger.position.z = -19 + (Math.random() - .5) * .01;
      if (d < 3) U.tremor(.012);
      fumoT -= dt;
      if (fumoT <= 0) { fumoT = U.qual() === 'baixa' ? .8 : .35; const f = fumos.find(f => !f.s.visible); if (f) { f.t = 0; f.s.visible = true; f.s.position.set(31.0 + (Math.random() - .5) * .05, 2.95, -19 + (Math.random() - .5) * .05); } }
    }
    for (const f of fumos) {
      if (!f.s.visible) continue;
      f.t += dt; const k = f.t / 2.6;
      if (k >= 1) { f.s.visible = false; continue; }
      f.s.position.y += dt * .55; f.s.position.x += dt * .12; const sc = .25 + k * 1.1; f.s.scale.set(sc, sc, 1); f.s.material.opacity = .32 * (1 - k);
    }
  });
  const ligar0 = X.ligarGerador;
  X.ligarGerador = function (...a) {
    const r = ligar0.apply(this, a);
    U.tremor(.12); U.vib(420, .8);
    for (let i = 0; i < 3; i++) U.depois(.35 + i * .28, () => {
      const f = fusNoQuadro[i]; if (!f) return;
      f.traverse(o => { if (o.isMesh && o.material && o.material.emissive && !U.compartilhado(o.material)) { o.userData.l3b = o.userData.l3b ?? o.material.emissiveIntensity; o.material.emissiveIntensity = 5; o.userData.l3t = .6; } });
      U.SOM.tique({ x: 33.75, y: 1.6, z: -22.5 }, true);
    });
    U.depois(1.2, () => { faiscas.soltar(33.7, 1.6, -22.5, .5, 1.5, .5, -6); U.SOM.faisca({ x: 33.75, y: 1.6, z: -22.5 }); U.leg('faíscas estalando no quadro de fusíveis'); });
    return r;
  };
  tick(dt => { for (const f of fusNoQuadro) f.traverse(o => { if (o.userData.l3t > 0) { o.userData.l3t -= dt; o.material.emissiveIntensity = o.userData.l3b + (5 - o.userData.l3b) * Math.max(0, o.userData.l3t / .6); } }); });

  // ---------------- QUADRO DE CHAVES: visor com cursor, erro vermelho, acerto verde, teclas que acendem
  let erroT = 0, okT = 0;
  const erro0 = X.erroQuadro, acerto0 = X.acertouQuadro;
  X.erroQuadro = function (...a) { erroT = .7; U.tremor(.06); U.vib(140, .5); return erro0.apply(this, a); };
  X.acertouQuadro = function (...a) { okT = 1.4; U.SOM.trava({ x: 3, y: 1.6, z: -13.8 }); U.vib(60, .3); return acerto0.apply(this, a); };
  const mTecla = new THREE.MeshStandardMaterial({ color: 0x111, emissive: 0xc8ff9a, emissiveIntensity: 0 });
  for (let i = 0; i < 9; i++) plano(.035, .035, mTecla, 2.6 + (i % 3) * .4, 1.75 - Math.floor(i / 3) * .25, -13.735);
  tick(dt => {
    if (U.dist(3, -13.8) > 14) return;
    erroT = Math.max(0, erroT - dt); okT = Math.max(0, okT - dt);
    mTecla.emissiveIntensity = S.flags.energia ? .35 + (erroT > 0 ? .6 : 0) : 0;
    const vm = visor.material;
    if (erroT > 0) { vm.emissive.set(0xff3020); vm.emissiveIntensity = 2; }
    else if (okT > 0) { vm.emissive.set(0x30ff60); vm.emissiveIntensity = 2.4; }
    else {
      vm.emissive.set(0x30ff60);
      if (S.flags.energia && !S.inv.chaves.escada) vm.emissiveIntensity = U.menosClarao() ? 1.3 : (A.perf() % 1 < .55 ? 1.6 : .35);
      else vm.emissiveIntensity = 0;
    }
  });

  // ---------------- ESCADA: cadeado brilha com a chave, a grade sobe rangendo, fita fosforescente nos degraus
  const mCad = new THREE.MeshStandardMaterial({ color: 0x6a5020, emissive: 0xffc060, emissiveIntensity: 0, metalness: .6, roughness: .4 });
  const cad = box(.16, .2, .1, mCad, .2, 1.1, .06, grade, false); cad.visible = false;
  let gradeSobe = 0;
  const itG = grade.userData.it;
  if (itG) { const a0 = itG.act; itG.act = function (...a) { if (S.inv.chaves.escada && !gradeSobe) { gradeSobe = .001; U.SOM.rangeMetal({ x: EX, y: 1.2, z: -9.2 }, .09, .6); U.vib(150, .4); } return a0.apply(this, a); }; }
  const mFita = new THREE.MeshStandardMaterial({ color: 0x223322, emissive: 0x9fe8a8, emissiveIntensity: .4 });
  for (let i = 0; i < 8; i++) box(2.4, .012, .045, mFita, EX, .206 + i * .3, -9.6 - i * .45 + .2, A.W.grupo, false);
  U.fosforo([mFita], EX, -10.5, 8);
  tick(dt => {
    if (U.dist(EX, -9.2) > 16) return;
    cad.visible = !!S.inv.chaves.escada;
    if (cad.visible) mCad.emissiveIntensity = .5 + .5 * Math.sin(A.perf() * 3.2);
    if (gradeSobe > 0 && gradeSobe < 1) { gradeSobe = Math.min(1, gradeSobe + dt * 2.2); grade.position.y = gradeSobe * 1.9; }
  });

  // ---------------- PORTA PRINCIPAL: treme a cada empurrão; quando cede, poeira cai do batente
  const pMain = A.DOOR('main');
  const poeira = U.nuvem(U.qual() === 'baixa' ? 14 : 30, 0x8a8070, .035, false);
  if (pMain) {
    let aberta = pMain.open, forcando = false, empT = 0;
    tick(dt => {
      if (U.dist(0, 0) > 12) { aberta = pMain.open; return; }
      const j = J();
      if (j && j.alvo && j.alvo.porta === pMain && j.keys.KeyE && !pMain.open) {
        forcando = true; empT -= dt;
        pMain.pivot.rotation.y = pMain.ang + (Math.random() - .5) * .035;
        if (empT <= 0) { empT = .6; U.tremor(.03); U.vib(40, .3); }
      } else if (forcando) { forcando = false; if (!pMain.open) pMain.pivot.rotation.y = pMain.ang; }
      if (pMain.open && !aberta) { poeira.soltar(0, 2.3, -.2, 1.4, 0, 1.6, -1.2); U.tremor(.08); U.vib(220, .6); U.SOM.baque({ x: 0, y: 1.5, z: 0 }, .5); }
      aberta = pMain.open;
    });
  }

  // ---------------- OBJETIVOS: brilho sob a lanterna e mira maior
  U.destacar(itens);
  // correndo com o galão, a gasolina chacoalha
  let galaoT = 0;
  tick(dt => { if (!S.inv.galao || S.flags.energia) return; galaoT -= dt; if (A.P.sprinting && galaoT <= 0) { galaoT = 1.1; U.SOM.liquido({ x: A.P.pos.x, y: .8, z: A.P.pos.z }); U.leg('gasolina chacoalhando no galão', false); } });

  // ---------------- ALÇAPÃO: a tampa se abre rangendo antes de descer
  const itA = alcapao.userData.it;
  if (itA) {
    let abre = 0; const a0 = itA.act;
    itA.act = function (...a) { if (S.inv.chaves.porao && !abre) { abre = .001; U.SOM.rangeMetal({ x: 27, y: .3, z: -23.5 }, .08, .7); U.vib(120, .4); } return a0.apply(this, a); };
    tick(dt => { if (abre > 0 && abre < 1) { abre = Math.min(1, abre + dt * 2); alcapao.position.y = .04 + abre * .5; alcapao.rotation.x = -abre * 1.2; } });
  }

  // ---------------- PÁTIO: balanço que range, portão no vento, poças com gotas
  let balAnt = 0, portaoT = 12;
  tick(dt => {
    const fora = U.sala() === 'patio';
    if (!fora && U.dist(6.5, 6) > 12) return;
    const c = Math.cos(A.perf() * .8), parado = (bal.userData.parado || 0);
    if (Math.sign(c) !== Math.sign(balAnt) && parado < .5 && U.dist(6.5, 6) < 9) { U.SOM.rangeMetal({ x: 6.5, y: 2.5, z: 6 }, .035 * (1 - parado), .7); U.leg('correntes do balanço rangendo', false); }
    balAnt = c;
    if (!fora) return;
    portaoT -= dt; if (portaoT <= 0) { portaoT = 18 + Math.random() * 18; U.SOM.rangeMetal({ x: 0, y: 1.5, z: 16 }, .07, 1.3); U.leg('o portão range no vento', false); }
  });
  const texAnel = U.tex(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(200,210,215,.8)'; g.lineWidth = 3; g.beginPath(); g.arc(32, 32, 26, 0, 7); g.stroke(); });
  const pocas = [];
  for (const [x, z, r] of [[-4, 6, 1.1], [3, 10.5, .8], [-8, 12.5, .9]]) {
    const p = plano(r * 2, r * 1.4, new THREE.MeshStandardMaterial({ color: 0x1a2024, roughness: .05, metalness: .5, transparent: true, opacity: .7 }), x, .006, z); p.rotation.x = -Math.PI / 2;
    const aneis = [0, 1].map(() => { const a = U.decal(texAnel, .3, .3, 0xffffff, 0); a.position.set(x, .008, z); return { a, t: Math.random() }; });
    pocas.push({ x, z, r, aneis });
  }
  tick(dt => {
    if (U.sala() !== 'patio') return;
    for (const P of pocas) for (const A_ of P.aneis) {
      A_.t += dt * 1.3; if (A_.t >= 1) { A_.t = 0; A_.a.position.set(P.x + (Math.random() - .5) * P.r, .008, P.z + (Math.random() - .5) * P.r * .6); }
      const s = .1 + A_.t * .9; A_.a.scale.set(s, s, 1); A_.a.material.opacity = .5 * (1 - A_.t);
    }
  });

  // ---------------- GOTEIRAS nos dois corredores
  const mGota = new THREE.MeshBasicMaterial({ color: 0xa8c0c8, transparent: true, opacity: .8 });
  for (const [gx, gz] of [[15, -12.4], [-20.5, -11.6]]) {
    const p = plano(.9, .7, new THREE.MeshStandardMaterial({ color: 0x141a1c, roughness: .05, metalness: .5, transparent: true, opacity: .65 }), gx, .007, gz); p.rotation.x = -Math.PI / 2;
    const gota = new THREE.Mesh(new THREE.SphereGeometry(.014, 5, 4), mGota); gota.scale.y = 1.8; A.W.grupo.add(gota);
    const anel = U.decal(texAnel, .25, .25, 0xffffff, 0); anel.position.set(gx, .009, gz);
    box(.5, .01, .5, new THREE.MeshStandardMaterial({ color: 0x2a2620, roughness: 1 }), gx, 3.18, gz, A.W.grupo, false); // mancha de infiltração no teto
    let y = 3.1, esp = Math.random(), at = 1;
    tick(dt => {
      if (U.dist(gx, gz) > 18) { gota.visible = false; return; }
      if (esp > 0) { esp -= dt; gota.visible = false; }
      else { gota.visible = true; y -= dt * 4.2; if (y <= .02) { y = 3.1; esp = 1.2 + Math.random() * 1; at = 0; if (U.dist(gx, gz) < 9) U.SOM.gota({ x: gx, y: .1, z: gz }, .05); } }
      gota.position.set(gx, y, gz);
      if (at < 1) { at = Math.min(1, at + dt * 1.6); const s = .2 + at; anel.scale.set(s, s, 1); anel.material.opacity = .55 * (1 - at); }
    });
  }

  // ---------------- RECEPÇÃO: lâmpada que balança no trovão, pegadas molhadas, tapete que abafa, relógio
  U.balancarNoTrovao(U.lampadaDa('hall'));
  const texPeA = U.texPe(false), pegadas = [];
  const nPeg = U.qual() === 'baixa' ? 8 : 16;
  for (let i = 0; i < nPeg; i++) { const m = U.decal(texPeA, .13, .27, 0x0e0c0a, 0); m.visible = false; pegadas.push(m); }
  let molhado = 0, salaAnt = U.sala(), passoAc = 0, lado = 1, prox = 0, ultX = A.P.pos.x, ultZ = A.P.pos.z;
  tick(dt => {
    const sl = A.P.room;
    if (sl && salaAnt && sl.id !== salaAnt) { const ant = A.W.salas.find(r => r.id === salaAnt); if (ant && ant.fora && !sl.fora) molhado = 16; }
    salaAnt = sl && sl.id;
    const dx = A.P.pos.x - ultX, dz = A.P.pos.z - ultZ; ultX = A.P.pos.x; ultZ = A.P.pos.z;
    if (molhado > 0 && sl && !sl.fora) {
      molhado -= dt; passoAc += Math.hypot(dx, dz);
      if (passoAc > .62) {
        passoAc = 0; lado = -lado;
        const m = pegadas[prox++ % pegadas.length], yaw = A.P.yaw;
        m.position.set(A.P.pos.x + Math.cos(yaw) * .11 * lado, .004, A.P.pos.z - Math.sin(yaw) * .11 * lado);
        m.rotation.z = yaw; m.material.opacity = .5 * Math.min(1, molhado / 6); m.visible = true;
      }
    }
    for (const m of pegadas) if (m.visible) { m.material.opacity -= dt * .5 / 30; if (m.material.opacity <= 0) m.visible = false; }
  });
  const tapete = plano(3.2, 7.4, new THREE.MeshStandardMaterial({ map: texTapete(U), roughness: 1 }), 0, .005, -6.9); tapete.rotation.x = -Math.PI / 2; tapete.rotation.z = Math.PI / 2; tapete.receiveShadow = true;
  const naTapeteHall = () => U.sala() === 'hall' && Math.abs(A.P.pos.x) < 3.7 && A.P.pos.z < -5.3 && A.P.pos.z > -8.5;
  let tiqT = 0, tiqLado = false;
  tick(dt => {
    const d = U.dist(-3.5, -13.88); if (d > 8) return;
    tiqT -= dt; if (tiqT > 0) return;
    const M = A.M, perto = M.ativo && Math.hypot(M.pos.x + 3.5, M.pos.z + 13.88) < 12;
    tiqT = perto ? .72 : 1; tiqLado = !tiqLado; U.SOM.tique({ x: -3.5, y: 2.2, z: -13.88 }, tiqLado);
  });

  // ---------------- DESPENSA: ratos na primeira entrada
  const mRato = new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: 1 });
  const ratos = [0, 1, 2].map(i => { const g = new THREE.Group(); box(.16, .06, .07, mRato, 0, .04, 0, g, false); box(.16, .008, .008, mRato, -.15, .02, 0, g, false); g.visible = false; A.W.grupo.add(g); return { g, t: -i * .22 }; });
  let ratosOn = false;
  tick(dt => {
    if (!ratosOn && U.sala() === 'despensa' && !S.flags.l3_ratos) { S.flags.l3_ratos = true; ratosOn = true; U.SOM.guincho({ x: -29, y: .2, z: -30 }); U.leg('ratos guinchando e correndo'); U.medo(6); }
    if (!ratosOn) return;
    let vivos = 0;
    for (const r of ratos) {
      r.t += dt; const k = r.t / 1.1; if (k < 0) { vivos++; continue; } if (k >= 1) { r.g.visible = false; continue; }
      vivos++; r.g.visible = true; const x = -33 + k * 8, z = -27.4 - k * 4.5 + Math.sin(k * 20) * .08; r.g.position.set(x, 0, z); r.g.rotation.y = Math.atan2(4.5, 8);
    }
    if (!vivos) ratosOn = false;
  });

  // ---------------- COZINHA: panelas penduradas (correr embaixo faz tilintar; balançam quando ele passa)
  const panelas = [];
  box(2.2, .03, .03, MAT.ferrugem, -28.5, 2.45, -19.2, A.W.grupo, false);
  for (let i = 0; i < 3; i++) { const g = new THREE.Group(); g.position.set(-29.3 + i * .8, 2.45, -19.2); A.W.grupo.add(g); box(.008, .25, .008, MAT.preto, 0, -.12, 0, g, false); const p = cyl(.15 - i * .02, .12 - i * .02, .1, mInox, 0, -.3, 0, 10, g); p.castShadow = false; panelas.push({ g, a: 0, f: Math.random() * 6 }); }
  let panCd = 0;
  tick(dt => {
    if (U.dist(-28.5, -19.2) > 14) return;
    panCd -= dt;
    const M = A.M, ele = M.ativo && Math.hypot(M.pos.x + 28.5, M.pos.z + 19.2) < 2.5;
    if (panCd <= 0 && ((A.P.sprinting && U.dist(-28.5, -19.2) < 2.3) || ele)) {
      panCd = 4; U.SOM.metal({ x: -28.5, y: 2.2, z: -19.2 }, ele ? .07 : .12); U.leg('panelas tilintando');
      if (!ele) A.emitNoise(-28.5, -19.2, 7, true);
      for (const p of panelas) p.a = .45;
    }
    for (const p of panelas) { p.a = Math.max(.02, p.a - dt * .25); p.f += dt * 3.4; p.g.rotation.x = Math.sin(p.f) * p.a; p.g.rotation.z = Math.cos(p.f * .8) * p.a * .5; }
  });

  // ---------------- ENFERMARIA: cortina divisória que balança quando você passa
  const cortina = new THREE.Group(); cortina.position.set(23.2, 2.05, -8.3); A.W.grupo.add(cortina);
  box(.02, .02, 1.8, MAT.metal, 0, 0, 0, cortina, false);
  const mCort = new THREE.MeshStandardMaterial({ color: 0xb8c4b8, roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: .88 });
  plano(1.7, 1.75, mCort, 0, -.9, 0, Math.PI / 2, cortina);
  let cortA = 0, cortF = 0, cortCd = 0;
  tick(dt => {
    const d = U.dist(23.2, -8.3); if (d > 10) return;
    cortCd -= dt;
    if (d < 1.4 && A.P.noiseR > 0 && cortCd <= 0) { cortCd = 2; cortA = A.P.sprinting ? .35 : .18; U.SOM.pano({ x: 23.2, y: 1.2, z: -8.3 }); }
    cortA = Math.max(0, cortA - dt * .12); cortF += dt * 2.4; cortina.rotation.z = Math.sin(cortF) * cortA;
  });

  // ---------------- BIBLIOTECA: um livro cai da estante se você passar em pé (uma vez)
  const sps = A.W.spots.biblio && A.W.spots.biblio.prateleira;
  if (sps && sps.length) {
    const sp = sps.reduce((a, b) => (b.y > a.y ? b : a), sps[0]);
    const livro = box(.05, .26, .18, new THREE.MeshStandardMaterial({ color: 0x4a1a12, roughness: .8 }), sp.x, sp.y + .13, sp.z, A.W.grupo, false);
    let cai = 0, vy = 0;
    tick(dt => {
      if (S.flags.l3_livro && cai >= 1) return;
      const d = U.dist(sp.x, sp.z);
      if (!cai && !S.flags.l3_livro && d < 1.6 && A.P.noiseR > 0 && !A.P.crouch) { S.flags.l3_livro = true; cai = .001; vy = 0; }
      if (S.flags.l3_livro && !cai) { livro.position.y = .03; livro.rotation.z = Math.PI / 2; cai = 1; return; }
      if (cai > 0 && cai < 1) {
        vy -= 9.8 * dt; livro.position.y += vy * dt; livro.rotation.z = Math.min(Math.PI / 2, livro.rotation.z + dt * 6); livro.position.x += dt * .4;
        if (livro.position.y <= .03) { livro.position.y = .03; cai = 1; U.SOM.baque({ x: sp.x, y: .1, z: sp.z }, .5); A.emitNoise(sp.x, sp.z, 8, true); U.leg('um livro cai no chão'); U.medo(5); U.tremor(.04); }
      }
    });
  }

  // ---------------- BANHEIROS: torneira pingando
  const pia = (A.W.spots.banh && A.W.spots.banh.mesa && A.W.spots.banh.mesa[0]) || { x: 17.2, y: .86, z: -14.4 };
  let piaT = 0;
  tick(dt => { if (U.sala() !== 'banh') return; piaT -= dt; if (piaT <= 0) { piaT = 1.15 + Math.random() * .2; U.SOM.gota({ x: pia.x, y: pia.y, z: pia.z }, .045); U.leg('uma torneira pinga', false); } });

  // ---------------- DIRETORIA: abajur verde que acende com a energia
  const mAbaj = new THREE.MeshStandardMaterial({ color: 0x1c3a22, emissive: 0x6aff8a, emissiveIntensity: 0, roughness: .4, side: THREE.DoubleSide });
  cyl(.07, .09, .03, MAT.bronze, 12.75, .845, -5.35, 10); cyl(.012, .012, .32, MAT.bronze, 12.75, 1.02, -5.35, 6);
  const cupula = new THREE.Mesh(new THREE.CylinderGeometry(.06, .16, .14, 12, 1, true), mAbaj); cupula.position.set(12.75, 1.18, -5.35); A.W.grupo.add(cupula);
  tick(() => { if (U.dist(12, -5) > 14) return; mAbaj.emissiveIntensity = S.flags.energia ? .55 + (Math.random() < .02 ? -.4 : 0) : 0; });

  // ---------------- PLACAS FOSFORESCENTES de orientação nos corredores
  const pW = U.placaTxt([{ t: '◂ RECEPÇÃO        COZINHA ▸', tam: 34, estilo: 'bold' }], 1.6, .26, { fundo: '#1a1e18', cor: '#b8e8b0' });
  pW.m.position.set(-20, 2.78, -10.115); pW.m.rotation.y = Math.PI;
  const pE = U.placaTxt([{ t: '◂ ENFERMARIA · MÁQUINAS        RECEPÇÃO ▸', tam: 28, estilo: 'bold' }], 1.9, .26, { fundo: '#1a1e18', cor: '#b8e8b0' });
  pE.m.position.set(20, 2.78, -10.115); pE.m.rotation.y = Math.PI;
  for (const p of [pW, pE]) p.mat.emissiveIntensity = .3;
  U.fosforo([pW.mat], -20, -12, 9); U.fosforo([pE.mat], 20, -12, 9);

  // ---------------- desempenho: miúdos sem sombra
  U.semSombraMiuda();

  return {
    ruidoMul: () => (naTapeteHall() ? .65 : 1),
    sync() { /* o visor e o LED são atualizados a cada quadro acima */ },
    entrar() { cacosMotor = false; }
  };
}

// =====================================================================
// ANDAR DE CIMA — DORMITÓRIOS
// =====================================================================
export function polirSuperior(A, S, ctx) {
  const U = base(A, S), { THREE, MAT, box, cyl, plano } = A;
  const { X, caixa, itPoco, desce, itens, itEng } = ctx;
  const tick = U.tick;

  // ---------------- PASSADEIRA no corredor: abafa os passos (trechos com madeira à mostra entre eles)
  const trechos = [[-3.5, -15], [-18.5, -33.5], [-37, -46.5], [-49.5, -56]];
  const mTap = new THREE.MeshStandardMaterial({ map: texTapete(U, [70, 34, 30]), roughness: 1 });
  for (const [z0, z1] of trechos) { const m = plano(1.3, Math.abs(z1 - z0), mTap, 0, .005, (z0 + z1) / 2); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; }
  const naPassadeira = () => U.sala() === 'corr' && Math.abs(A.P.pos.x) < .7 && trechos.some(([a, b]) => A.P.pos.z <= a && A.P.pos.z >= b);
  // segredo: a ponta da última passadeira está levantada
  const ponta = box(1.3, .03, .25, mTap, 0, .03, -55.85, A.W.grupo, false); ponta.rotation.x = .25;
  A.interact(ponta, () => S.flags.l3_ponta ? 'A ponta da passadeira, dobrada.' : '<b>E</b>Levantar a ponta da passadeira', () => {
    if (S.flags.l3_ponta) return;
    S.flags.l3_ponta = true; A.SFX.papel(); U.SOM.pano({ x: 0, y: .1, z: -55.8 }, .07);
    A.dialogo([
      { quem: 'lia', texto: 'Embaixo da passadeira tem uma tábua riscada: "AQUI A TÁBUA NÃO RANGE. ANDA NO TAPETE. — A.L.P."' },
      { quem: 'lia', texto: 'E uma garrafa de vidro escondida. Alguém guardou pra jogar longe.' }
    ], () => { S.inv.garrafas = (S.inv.garrafas || 0) + 1; A.toast('Segredo do corredor: uma garrafa guardada. G joga longe.'); });
  });

  // ---------------- PATAMAR: placa de orientação, fita fosforescente na escada, lâmpada que balança
  const pl = U.placaTxt([{ t: 'DORMITÓRIOS  A · B · C · D · E', tam: 34, estilo: 'bold' }, { t: 'depósito ao fundo do corredor', tam: 24, estilo: 'italic' }], 2.6, .36, { fundo: '#1a1e18', cor: '#b8e8b0' });
  pl.m.position.set(0, 3.0, -1.885); pl.mat.emissiveIntensity = .3;
  U.fosforo([pl.mat], 0, 1, 9);
  const mFita = new THREE.MeshStandardMaterial({ color: 0x223322, emissive: 0x9fe8a8, emissiveIntensity: .4 });
  box(2.5, .012, .05, mFita, 0, .106, 3.85, A.W.grupo, false);
  for (let i = 1; i < 6; i++) box(2.5, .01, .04, mFita, 0, .105 - i * .02, 3.85 + i * .3, A.W.grupo, false);
  U.fosforo([mFita], 0, 3.5, 7);
  U.balancarNoTrovao(U.lampadaDa('patamar'));
  // descer a escada range os degraus
  const itD = desce.userData.it;
  if (itD) { const a0 = itD.act; itD.act = function (...a) { A.SFX.rangido(0, .4, 4.6, .6); return a0.apply(this, a); }; }

  // ---------------- OBJETIVOS: brilho sob a lanterna e mira maior; a caixinha pulsa quando dá para montar
  U.destacar(itens);
  const mCx = caixa.children[0] && caixa.children[0].material;
  const cxBase = mCx ? mCx.emissiveIntensity : 0;
  tick(() => {
    if (!mCx || U.dist(caixa.position.x, caixa.position.z) > 16) return;
    mCx.emissiveIntensity = S.inv.engrenagens >= 3 && !S.done.caixinha && S.chapter >= 3 ? cxBase + .9 + .7 * Math.sin(A.perf() * 4) : cxBase;
  });
  // a engrenagem tilinta de vez em quando (guia pelo ouvido até o Dormitório E)
  let tilT = 4;
  const pe = new THREE.Vector3();
  tick(dt => {
    if (!itEng || !itEng.obj.visible || S.chapter < 3) return;
    itEng.obj.getWorldPosition(pe);
    const d = U.dist(pe.x, pe.z); if (d > 26) return;
    tilT -= dt; if (tilT <= 0) { tilT = 8 + Math.random() * 5; U.SOM.tilintar({ x: pe.x, y: pe.y + .2, z: pe.z }, .03 + .08 * (1 - d / 26)); U.leg('algo de metal tilinta'); }
  });
  const peg0 = X.engrenagemPega;
  X.engrenagemPega = function (...a) { U.SOM.tilintar({ x: A.P.pos.x, y: 1.2, z: A.P.pos.z }, .12); U.vib(70, .3); return peg0.apply(this, a); };

  // pegadinhas de pé descalço até a sala de brinquedos, depois da engrenagem (somem quando a caixinha toca)
  const texPeC = U.texPe(true), pegadas = [];
  for (let i = 0; i < 11; i++) { const m = U.decal(texPeC, .08, .17, 0x18120e, 0); m.position.set(i % 2 ? 2.05 : 2.3, .0045, -44.2 + i * 1.15); m.rotation.z = Math.PI + (Math.random() - .5) * .2; pegadas.push(m); }
  tick(dt => {
    if (U.dist(2, -38) > 22) return;
    const on = S.inv.engrenagens >= 3 && !S.done.caixinha && S.chapter >= 3;
    for (const m of pegadas) m.material.opacity += ((on ? .55 : 0) - m.material.opacity) * Math.min(1, dt * .8);
  });

  // ---------------- MONTA-CARGAS: lâmpada vermelha de serviço; a grade bate e o cabo range ao descer
  const mVerm = new THREE.MeshStandardMaterial({ color: 0x300, emissive: 0xff2a10, emissiveIntensity: 0 });
  const lampV = new THREE.Mesh(new THREE.SphereGeometry(.06, 8, 6), mVerm); lampV.position.set(11.6, 2.75, -55.32); A.W.grupo.add(lampV);
  box(.16, .04, .12, MAT.metal, 11.6, 2.83, -55.36, A.W.grupo, false);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texFumaca(U), color: 0xff4020, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.set(.7, .7, 1); halo.position.copy(lampV.position); A.W.grupo.add(halo);
  tick(() => {
    if (U.dist(11.6, -56) > 20) return;
    const on = !!S.inv.chaves.porao, k = on ? (U.menosClarao() ? .9 : .75 + .25 * Math.sin(A.perf() * 2.4)) : 0;
    mVerm.emissiveIntensity = k * 2.2; halo.material.opacity = k * .55;
  });
  if (itPoco) {
    const a0 = itPoco.act;
    itPoco.act = function (...a) {
      if (S.inv.chaves.porao) { U.SOM.baque({ x: 11.6, y: 1.3, z: -55.4 }, .6); U.SOM.rangeMetal({ x: 11.6, y: 2.5, z: -56 }, .08, 1.1); U.leg('a grade bate e o cabo do monta-cargas range'); U.vib(500, .7); U.tremor(.1); }
      return a0.apply(this, a);
    };
  }

  // ---------------- QUARTO DA IRMÃ CELESTE: luz de vela vazando por baixo da porta
  const mFresta = new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, map: texFumaca(U) });
  const fresta = plano(.5, 1.5, mFresta, -2.75, .008, -53); fresta.rotation.x = -Math.PI / 2;
  const pCel = A.DOOR('cel');
  tick(() => {
    if (U.dist(-3, -53) > 18) return;
    const aberta = pCel && pCel.open, t = A.perf();
    mFresta.opacity = aberta ? 0 : .32 + Math.sin(t * 6) * .05 + Math.sin(t * 13.7) * .03;
  });

  // ---------------- QUADROS DO CORREDOR: batem e entortam quando o Inspetor passa (um rastro dele)
  const quadros = [];
  A.W.grupo.children.forEach(o => { if (o.isMesh && Math.abs(o.position.x - 2.88) < .001 && Math.abs(o.position.y - 1.8) < .001) quadros.push({ o, alvo: 0, feito: false }); });
  tick(dt => {
    const M = A.M;
    for (const q of quadros) {
      if (!q.feito && M.ativo && Math.hypot(M.pos.x - q.o.position.x, M.pos.z - q.o.position.z) < 3.2 && U.dist(q.o.position.x, q.o.position.z) < 22) {
        q.feito = true; q.alvo = (Math.random() < .5 ? -1 : 1) * (.22 + Math.random() * .15);
        U.SOM.baque({ x: q.o.position.x, y: 1.8, z: q.o.position.z }, .2); U.leg('um quadro bate na parede');
      }
      q.o.rotation.x += (q.alvo - q.o.rotation.x) * Math.min(1, dt * 7);
    }
  });

  // ---------------- desempenho: miúdos sem sombra
  U.semSombraMiuda();

  return {
    ruidoMul: () => (naPassadeira() ? .6 : 1)
  };
}
