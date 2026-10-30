// =====================================================================
// LOTE 5 — Monstros: visual e luz (src/monstros-visual.js)
// Aparências mais perturbadoras, variações por capítulo, comportamentos
// de perseguição memoráveis. Tudo em canvas/Three, sem assets externos.
// Ligado por poucas linhas em jogo.js: instalarMonstrosVisual(...) e MVIS.tick(dt).
// =====================================================================
export function instalarMonstrosVisual(C) {
  const { THREE, scene, camera, MON, VULTO, ANA, ANA_G, PROC, M, P, W, MAT, OPT, canvasTex, rand, pick, clamp, lerp, naLuz, visivel, subPequeno, conquista } = C;
  const S = () => C.S, perf = () => C.perf, pisca = () => C.flashPisca;
  const R2D = Math.PI / 2;

  // ---------- helpers de textura de rosto (fundo transparente) ----------
  function faceTex(w, h, draw) {
    const t = canvasTex(w, h, (g, W2, H2) => { g.clearRect(0, 0, W2, H2); draw(g, W2, H2); });
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
  }
  const costura = (g, x0, y0, x1, y1, n = 7, cor = '#120a08') => {
    g.strokeStyle = cor; g.lineWidth = 2;
    for (let i = 0; i <= n; i++) { const tt = i / n, x = x0 + (x1 - x0) * tt, y = y0 + (y1 - y0) * tt, nx = (y1 - y0), ny = -(x1 - x0), l = Math.hypot(nx, ny) || 1; g.beginPath(); g.moveTo(x - nx / l * 5, y - ny / l * 5); g.lineTo(x + nx / l * 5, y + ny / l * 5); g.stroke(); }
  };
  // Venda por capítulo: limpa -> suja/torta -> caída com olhos costurados
  function vendaTex(est) {
    return faceTex(128, 128, (g) => {
      // pano
      g.fillStyle = est >= 2 ? '#8a7c58' : est === 1 ? '#a99a74' : '#c3b48c'; g.fillRect(14, 40, 100, 34);
      g.strokeStyle = 'rgba(70,60,40,.5)'; g.lineWidth = 1; for (let y = 44; y < 72; y += 4) { g.beginPath(); g.moveTo(14, y + (est ? Math.sin(y) * 2 : 0)); g.lineTo(114, y); g.stroke(); }
      if (est >= 1) { g.fillStyle = 'rgba(30,20,12,.5)'; for (let i = 0; i < 10; i++) g.fillRect(rand(16, 110), rand(42, 70), rand(3, 10), rand(2, 6)); } // sujeira
      if (est >= 2) { // escorrido escuro saindo por baixo
        for (let i = 0; i < 4; i++) { const x = rand(28, 100), gr = g.createLinearGradient(0, 70, 0, 110); gr.addColorStop(0, 'rgba(20,10,8,.8)'); gr.addColorStop(1, 'rgba(20,10,8,0)'); g.fillStyle = gr; g.fillRect(x, 70, rand(3, 6), rand(24, 38)); }
        // vinco das órbitas costuradas aparecendo sob o pano
        g.globalAlpha = .5; for (const sx of [-1, 1]) { const cx = 64 + sx * 20; g.strokeStyle = '#1a0e0a'; g.beginPath(); g.ellipse(cx, 57, 11, 7, 0, 0, 7); g.stroke(); costura(g, cx - 10, 57, cx + 10, 57, 5); } g.globalAlpha = 1;
      }
    });
  }
  // Órbitas vazias costuradas (revelação de perto / morte)
  const orbitasTex = faceTex(128, 128, (g) => {
    for (const sx of [-1, 1]) { const cx = 64 + sx * 22, cy = 58; g.fillStyle = '#0a0604'; g.beginPath(); g.ellipse(cx, cy, 13, 9, 0, 0, 7); g.fill(); g.fillStyle = '#1c0f0a'; g.beginPath(); g.ellipse(cx, cy, 8, 5, 0, 0, 7); g.fill(); costura(g, cx - 13, cy - 7, cx + 13, cy - 7, 6); costura(g, cx - 13, cy + 7, cx + 13, cy + 7, 6); }
  });
  // Rosto queimado de 1979 (flash)
  const queimadoTex = faceTex(128, 128, (g) => {
    g.fillStyle = '#2a1510'; g.fillRect(20, 20, 88, 92); g.fillStyle = 'rgba(10,6,4,.8)'; for (let i = 0; i < 60; i++) g.fillRect(rand(20, 108), rand(20, 112), rand(2, 7), rand(2, 7)); g.fillStyle = '#50251a'; for (let i = 0; i < 20; i++) { g.beginPath(); g.arc(rand(26, 102), rand(26, 104), rand(2, 6), 0, 7); g.fill(); }
  });
  // Olhos de giz de criança desenhados por cima da venda
  const gizOlhosTex = faceTex(128, 128, (g) => {
    g.strokeStyle = 'rgba(220,210,190,.85)'; g.lineWidth = 3; g.lineCap = 'round';
    for (const sx of [-1, 1]) { const cx = 64 + sx * 20, cy = 56; g.beginPath(); g.arc(cx, cy, 12, 0, 7); g.stroke(); g.fillStyle = 'rgba(220,210,190,.85)'; g.beginPath(); g.arc(cx, cy, 4, 0, 7); g.fill(); for (let k = 0; k < 8; k++) { const a = k / 8 * 7; g.beginPath(); g.moveTo(cx + Math.cos(a) * 13, cy + Math.sin(a) * 13); g.lineTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18); g.stroke(); } }
  });
  // Sorriso largo pintado (modo caça) e sangue de fúria
  const sorrisoTex = faceTex(128, 128, (g) => { g.strokeStyle = 'rgba(40,10,8,.9)'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(30, 92); g.quadraticCurveTo(64, 116, 98, 92); g.stroke(); for (let x = 36; x <= 92; x += 9) { g.beginPath(); g.moveTo(x, 94 + Math.sin((x - 36) / 56 * Math.PI) * 10); g.lineTo(x, 100 + Math.sin((x - 36) / 56 * Math.PI) * 12); g.stroke(); } });
  const furiaTex = faceTex(128, 128, (g) => { for (let i = 0; i < 5; i++) { const x = rand(26, 100), gr = g.createLinearGradient(0, 40, 0, 120); gr.addColorStop(0, 'rgba(120,10,8,.9)'); gr.addColorStop(1, 'rgba(90,6,6,0)'); g.fillStyle = gr; g.fillRect(x, 40, rand(3, 6), rand(40, 78)); } });

  // ---------- peças 3D do Inspetor ----------
  const VENDAS = [vendaTex(0), vendaTex(1), vendaTex(2)];
  const inspFace = (tex, y, z, op = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(.3, .3), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide })); m.position.set(0, y, z); MON.cabeca.add(m); return m; };
  const mVenda = inspFace(VENDAS[0], .17, .146);          // venda detalhada por capítulo
  const mOrbitas = inspFace(orbitasTex, .17, .148, 0);     // órbitas (close/morte)
  const mGiz = inspFace(gizOlhosTex, .17, .149, 0);        // olhos de giz
  const mSorriso = inspFace(sorrisoTex, .02, .145, 0);     // sorriso da caça
  const mQueimado = inspFace(queimadoTex, .12, .143, 0);   // flash queimado
  const mFuria = inspFace(furiaTex, .1, .147, 0);          // sangue de fúria
  // dois pontos úmidos sob a venda (reflexo do facho nos olhos cegos)
  const umido = []; for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 6), new THREE.MeshBasicMaterial({ color: 0xbfd0d8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.set(sx * .05, .15, .145); MON.cabeca.add(m); umido.push(m); }
  // gota escura escorrendo da venda (lágrima preta / escorrido)
  const mGota = new THREE.Mesh(new THREE.CylinderGeometry(.004, .002, .08, 5), new THREE.MeshBasicMaterial({ color: 0x0c0806, transparent: true, opacity: 0 })); mGota.position.set(.03, .06, .14); MON.cabeca.add(mGota);
  // boca costurada: pontos escuros que se rasgam no grito
  const bocaCostura = faceTex(64, 40, (g) => { g.strokeStyle = '#140b08'; g.lineWidth = 2; g.beginPath(); g.moveTo(8, 20); g.lineTo(56, 20); g.stroke(); for (let x = 10; x < 56; x += 7) { g.beginPath(); g.moveTo(x, 12); g.lineTo(x, 28); g.stroke(); } });
  const mCostura = new THREE.Mesh(new THREE.PlaneGeometry(.12, .07), new THREE.MeshBasicMaterial({ map: bocaCostura, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); mCostura.position.set(0, -.06, .141); MON.cabeca.add(mCostura);
  // dedo a mais em cada mão + unhas pretas compridas (mão menos humana de perto)
  const unhas = [];
  try { for (const mao of MON.maos) { const fmat = mao.children[0] ? mao.children[0].material : MAT.pele; const f = new THREE.Mesh(new THREE.BoxGeometry(.015, .46, .015), fmat); f.position.set(.06, -.22, 0); f.rotation.x = .25; mao.add(f); mao.children.forEach(ch => { ch.scale.y = 1.18; }); const u = new THREE.Mesh(new THREE.ConeGeometry(.01, .06, 4), new THREE.MeshStandardMaterial({ color: 0x080606, roughness: .5 })); u.position.set(0, -.44, .02); u.rotation.x = Math.PI; mao.add(u); unhas.push(u); } } catch (e) {}
  // molho na cintura que de perto são dentes de leite num cordão, não chaves
  const mDentes = new THREE.Mesh(new THREE.PlaneGeometry(.14, .12), new THREE.MeshBasicMaterial({ map: faceTex(80, 64, (g) => { g.strokeStyle = 'rgba(40,30,20,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(8, 10); g.lineTo(72, 14); g.stroke(); g.fillStyle = '#e8e2d2'; for (let i = 0; i < 7; i++) { const x = 12 + i * 9; g.beginPath(); g.moveTo(x, 16); g.lineTo(x - 3, 40 + rand(0, 8)); g.lineTo(x + 3, 40 + rand(0, 8)); g.closePath(); g.fill(); g.fillStyle = 'rgba(60,40,30,.6)'; g.fillRect(x - 1, 18, 2, 2); g.fillStyle = '#e8e2d2'; } }), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  mDentes.position.set(.2, 2.25, .22); MON.g.add(mDentes); let viuDentes = false;
  // partículas: fiapos e poeira do casaco na caça
  const fiosPool = []; for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.02, .02), new THREE.MeshBasicMaterial({ color: 0x1a1512, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; scene.add(m); fiosPool.push({ m, t: 0, vy: 0 }); } let fioI = 0;
  // partículas: hálito de vapor no frio
  const bafoPool = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.08, .08), new THREE.MeshBasicMaterial({ color: 0xcfd6d8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); bafoPool.push({ m, t: 0 }); } let bafoI = 0, bafoCd = 0;
  // olhos no escuro: pares que piscam no fundo das salas e somem quando a luz chega
  const olhosEscuro = []; for (let i = 0; i < 5; i++) { const g = new THREE.Group(); for (const sx of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 6), new THREE.MeshBasicMaterial({ color: 0xb8c0b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); o.position.x = sx * .05; g.add(o); } g.visible = false; scene.add(g); olhosEscuro.push({ g, t: 0, cd: rand(2, 8) }); }

  // materiais do corpo (para fuligem/decadência por capítulo e o "desfazer" do Cap V)
  const corpos = []; MON.g.traverse(o => { if (o.isMesh && o.material && o.material !== MON.faixa) corpos.push({ m: o.material, cor: o.material.color ? o.material.color.getHex() : 0 }); });
  let capAplicado = -1;
  function aplicarCapitulo(cap) {
    if (cap === capAplicado) return; capAplicado = cap;
    const fuligem = clamp(cap / 5, 0, 1);
    mVenda.material.map = VENDAS[cap >= 5 ? 2 : cap >= 3 ? 1 : 0]; mVenda.material.needsUpdate = true;
    for (const c of corpos) { if (!c.m.color) continue; const col = new THREE.Color(c.cor); col.multiplyScalar(1 - fuligem * .45); c.m.color.copy(col); c.m.transparent = cap >= 5; c.m.opacity = cap >= 5 ? .82 : 1; }
    MON.cabeca.rotation.z = .45 + fuligem * .08; // postura mais torta conforme a noite consome ele
  }

  // ---------- Ana: rostos que nunca se completam ----------
  function anaFaceTex(tipo) {
    return faceTex(96, 110, (g) => {
      const base = () => { g.fillStyle = 'rgba(150,146,138,.0)'; };
      const olho = (x, y, r = 6) => { g.fillStyle = '#060606'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
      const boca = (y, larg = 22) => { g.strokeStyle = '#1a0f0d'; g.lineWidth = 3; g.beginPath(); g.moveTo(48 - larg, y); g.quadraticCurveTo(48, y + 10, 48 + larg, y); g.stroke(); };
      base();
      if (tipo === 'sorriso') { olho(34, 44); olho(62, 44); g.strokeStyle = '#2a0f0d'; g.lineWidth = 4; g.beginPath(); g.moveTo(20, 72); g.quadraticCurveTo(48, 104, 76, 72); g.stroke(); }
      else if (tipo === 'semboca') { olho(34, 46); olho(62, 46); }
      else if (tipo === 'deslocado') { olho(28, 38); olho(70, 56, 7); boca(84, 14); }
      else if (tipo === 'trocado') { boca(40, 10); olho(34, 78); olho(62, 80); }  // boca no lugar dos olhos
      else { olho(36, 46); olho(60, 46); boca(74); }
      // sempre algo errado: um fiapo de cabelo atravessando
      g.strokeStyle = 'rgba(5,5,5,.7)'; g.lineWidth = 2; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(rand(20, 76), 10); g.lineTo(rand(20, 76), 100); g.stroke(); }
    });
  }
  const ANA_FACES = ['normal', 'sorriso', 'semboca', 'deslocado', 'trocado'].map(anaFaceTex);
  let anaCab = null, mAnaFace = null, mAnaCabelo = null, mAnaSorriso = null;
  try {
    anaCab = ANA_G.userData.cabG;
    mAnaFace = new THREE.Mesh(new THREE.PlaneGeometry(.2, .24), new THREE.MeshBasicMaterial({ map: ANA_FACES[0], transparent: true, opacity: .9, depthWrite: false, side: THREE.DoubleSide })); mAnaFace.position.set(0, .01, .122); anaCab.add(mAnaFace);
    // franja que desce e cobre o rosto quando a cabeça entorta
    const cabeloMat = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: .9, side: THREE.DoubleSide, transparent: true, opacity: 0 });
    mAnaCabelo = new THREE.Mesh(new THREE.PlaneGeometry(.26, .3), cabeloMat); mAnaCabelo.position.set(0, -.04, .13); anaCab.add(mAnaCabelo);
  } catch (e) {}
  // estágios de apodrecimento da pele da Ana
  const anaPele = []; try { ANA_G.traverse(o => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === 0x9a948a && !anaPele.includes(o.material)) anaPele.push(o.material); }); } catch (e) {}
  const PELE_ESTAGIOS = [0x9a948a, 0x8a8278, 0x6f6f66, 0x4e544e, 0x343c38];
  let anaFaceIdx = 0, anaVistaAnt = false;
  // sombra da Ana no chão que aponta para a Lia / anda um passo à frente
  let anaSombra = null; try { anaSombra = new THREE.Mesh(new THREE.PlaneGeometry(.5, 1.4), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false })); anaSombra.rotation.x = -R2D; scene.add(anaSombra); } catch (e) {}
  // rastro luminoso dos olhos da Ana no escuro
  const anaRastro = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.02, 5, 5), new THREE.MeshBasicMaterial({ color: 0x9fb0b8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.visible = false; scene.add(m); anaRastro.push(m); } let rastroI = 0, anaMoveAnt = new THREE.Vector3();

  // ---------- Procissão: rostos, pés que flutuam, olhos na nuca ----------
  const procFaces = [], procNuca = [], procPes0 = [];
  const faceCriancaQueimada = faceTex(64, 72, (g) => {
    g.fillStyle = '#6a5c4e'; g.beginPath(); g.ellipse(32, 36, 22, 28, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(20,12,8,.7)'; for (let i = 0; i < 24; i++) g.fillRect(rand(12, 52), rand(10, 62), rand(2, 5), rand(2, 5));
    g.fillStyle = '#0a0606'; g.beginPath(); g.arc(24, 32, 4, 0, 7); g.fill(); g.beginPath(); g.arc(40, 32, 4, 0, 7); g.fill(); // olhos (sem boca)
  });
  const faceNuca = faceTex(64, 64, (g) => { for (const x of [22, 42]) { g.fillStyle = 'rgba(230,228,220,.9)'; g.beginPath(); g.arc(x, 30, 9, 0, 7); g.fill(); g.fillStyle = '#101014'; g.beginPath(); g.arc(x, 30, 4, 0, 7); g.fill(); } });
  try {
    PROC.filhos.forEach((s, i) => {
      const f = new THREE.Mesh(new THREE.PlaneGeometry(.16, .18), new THREE.MeshBasicMaterial({ map: faceCriancaQueimada, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); f.position.set(0, 1.05, .115); s.add(f); procFaces.push(f);
      const n = new THREE.Mesh(new THREE.PlaneGeometry(.14, .14), new THREE.MeshBasicMaterial({ map: faceNuca, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); n.position.set(0, 1.06, -.115); n.rotation.y = Math.PI; s.add(n); procNuca.push(n);
      procPes0.push(s.position.y);
    });
  } catch (e) {}
  let procParada = 0, procPosAnt = new THREE.Vector3(), nucaChora = 0;

  // ---------- decalques no chão/parede (gotas, pegadas, arranhões, mãos) ----------
  const decalPool = []; for (let i = 0; i < 24; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.2, .2), new THREE.MeshBasicMaterial({ color: 0x100a08, transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = -R2D; m.visible = false; scene.add(m); decalPool.push({ m, t: 0, vida: 1 }); }
  let decalI = 0, mapaDecal = '';
  function soltarDecal(x, z, tam, cor, vida, parede) {
    const d = decalPool[decalI++ % decalPool.length]; d.m.visible = true; d.t = vida; d.vida = vida;
    d.m.position.set(x, parede ? 1.1 : .03, z); d.m.rotation.x = parede ? 0 : -R2D; d.m.scale.setScalar(tam);
    if (d.m.material.color) d.m.material.color.setHex(cor);
  }

  // ---------- overlay de tela (estática, túnel, vinheta, pós-imagem) ----------
  let ov = null, octx = null;
  function garantirOverlay() {
    if (ov) return; ov = document.getElementById('l5-ov');
    if (!ov) { ov = document.createElement('canvas'); ov.id = 'l5-ov'; ov.width = 320; ov.height = 180; ov.className = 'fx'; ov.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;opacity:1'; const alvo = document.getElementById('fx-black') || document.body; alvo.parentNode.insertBefore(ov, alvo); }
    octx = ov.getContext('2d');
  }
  let posImg = 0, posImgX = .5, posImgY = .5, olhoDele = 0, flashEmerg = 0;

  // ---------- estado interno ----------
  let revelouVenda = false, calorFlashCd = 0, gotaY = 0, neckBase = null, hitTopo = 0, lanternaPertoAcc = 0;
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
  function olhaParaMim(obj, lim = .55) { try { obj.getWorldPosition(_a); const dir = _b.set(0, 0, 1).applyQuaternion(obj.getWorldQuaternion(new THREE.Quaternion())); _c.copy(camera.position).sub(_a).setY(0).normalize(); return dir.setY(0).normalize().dot(_c); } catch (e) { return 0; } }

  // =====================================================================
  // LOTE 5 (2a rodada) — mais desumanização, brasa, sombra e perseguição
  // =====================================================================
  // rosto calmo do menino Moacir (revelado num quadro quando o sino o atordoa)
  const meninoTex = faceTex(128, 160, (g) => {
    g.fillStyle = '#d8cdbe'; g.beginPath(); g.ellipse(64, 80, 40, 52, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(150,130,110,.35)'; g.beginPath(); g.ellipse(64, 86, 34, 44, 0, 0, 7); g.fill();
    g.strokeStyle = '#3a2c22'; g.lineWidth = 3; g.lineCap = 'round'; // olhos fechados (cílios)
    for (const sx of [-1, 1]) { const cx = 64 + sx * 18; g.beginPath(); g.moveTo(cx - 10, 72); g.quadraticCurveTo(cx, 78, cx + 10, 72); g.stroke(); }
    g.lineWidth = 2; g.strokeStyle = 'rgba(120,90,80,.7)'; g.beginPath(); g.moveTo(54, 112); g.quadraticCurveTo(64, 116, 74, 112); g.stroke();
  });
  const mMenino = inspFace(meninoTex, .14, .151, 0); mMenino.scale.set(1.1, 1.1, 1);
  // olhos de brasa apagada sob a venda (Cap V): dois pontos laranja que pulsam
  const brasaOlhos = []; for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.SphereGeometry(.016, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff5a1e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.set(sx * .05, .15, .146); MON.cabeca.add(m); brasaOlhos.push(m); }
  // rachaduras de brasa no peito, pulsam no compasso da fúria; abrem no fareja/inspira
  const brasaTex = faceTex(96, 128, (g) => { g.strokeStyle = 'rgba(255,90,30,.9)'; g.lineCap = 'round'; for (let i = 0; i < 8; i++) { g.lineWidth = rand(1, 3); g.beginPath(); let x = rand(20, 76), y = rand(16, 24); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += rand(-14, 14); y += rand(10, 18); g.lineTo(x, y); } g.stroke(); } });
  const mBrasaPeito = new THREE.Mesh(new THREE.PlaneGeometry(.34, .46), new THREE.MeshBasicMaterial({ map: brasaTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  mBrasaPeito.position.set(0, 2.5, .26); MON.g.add(mBrasaPeito);
  // brilho do peito feito só com plano aditivo (sem luz dinâmica nova, para não pesar no render por software)
  const mBrasaGlow = new THREE.Mesh(new THREE.PlaneGeometry(.5, .5), new THREE.MeshBasicMaterial({ color: 0xff4a14, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); mBrasaGlow.position.set(0, 2.5, .27); MON.g.add(mBrasaGlow);
  // rostos de criança pulsando sob a pele do pescoço/rosto (Cap IV+)
  const criancaTex = faceTex(128, 96, (g) => { for (let i = 0; i < 4; i++) { const cx = rand(24, 104), cy = rand(26, 70), r = rand(10, 16); g.fillStyle = 'rgba(180,170,160,.5)'; g.beginPath(); g.ellipse(cx, cy, r * .8, r, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(10,8,8,.8)'; g.beginPath(); g.arc(cx - r * .3, cy - 2, 2.2, 0, 7); g.fill(); g.beginPath(); g.arc(cx + r * .3, cy - 2, 2.2, 0, 7); g.fill(); } });
  const mCrianca = inspFace(criancaTex, -.02, .139, 0); mCrianca.scale.set(1.4, 1.1, 1);
  // fuligem/veias escuras que sobem pelo rosto por capítulo
  const fuligemFaceTex = faceTex(96, 128, (g) => { g.strokeStyle = 'rgba(8,6,6,.75)'; g.lineCap = 'round'; for (let i = 0; i < 7; i++) { g.lineWidth = rand(1, 2.5); let x = rand(20, 76), y = 124; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += rand(-10, 10); y -= rand(16, 24); g.lineTo(x, y); } g.stroke(); } });
  const mFuligem = inspFace(fuligemFaceTex, .05, .14, 0);
  // sombra que chega antes dele: silhueta com braços a mais, mais alta e torta
  let sombraInsp = null;
  try {
    const sTex = faceTex(128, 200, (g) => {
      g.fillStyle = '#000'; g.beginPath();
      g.ellipse(64, 34, 20, 24, 0, 0, 7); g.fill(); // cabeça pendida
      g.fillRect(44, 54, 40, 120); // tronco
      // braços reais + extras, longos
      const braco = (x0, ang, larg) => { g.save(); g.translate(x0, 70); g.rotate(ang); g.fillRect(-larg / 2, 0, larg, 110); g.restore(); };
      braco(50, .25, 13); braco(78, -.25, 13); braco(46, .8, 9); braco(82, -.8, 9); braco(58, 1.3, 7);
    });
    sombraInsp = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.4), new THREE.MeshBasicMaterial({ map: sTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    sombraInsp.position.y = 1.2; scene.add(sombraInsp);
  } catch (e) {}
  // bengala branca de cego (Cap I-II), tateia; some no Cap III
  let bengala = null; try { bengala = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 1.4, 5), new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: .7 })); bengala.position.set(.14, -1.4, .2); bengala.rotation.x = .5; const ponta = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .08, 6), new THREE.MeshStandardMaterial({ color: 0x9a2a1a, roughness: .6 })); ponta.position.y = -.74; bengala.add(ponta); if (MON.maos[1]) MON.maos[1].add(bengala); } catch (e) {}
  // chapéu de funcionário que amassa e some no Cap V
  let chapeu = null; try { chapeu = new THREE.Group(); const aba = new THREE.Mesh(new THREE.CylinderGeometry(.2, .22, .02, 14), new THREE.MeshStandardMaterial({ color: 0x15130f, roughness: .95 })); const copa = new THREE.Mesh(new THREE.CylinderGeometry(.13, .15, .16, 14), aba.material); copa.position.y = .08; chapeu.add(aba, copa); chapeu.position.set(0, .34, .02); MON.cabeca.add(chapeu); } catch (e) {}
  // lanterninha morta de outra criança presa ao cinto; acende um instante na caça
  let lanterninha = null, lanternaLuz = null;
  try { lanterninha = new THREE.Mesh(new THREE.CylinderGeometry(.03, .035, .12, 8), new THREE.MeshStandardMaterial({ color: 0x3a3a3c, roughness: .5 })); lanterninha.position.set(-.18, 2.2, .2); lanterninha.rotation.z = .4; MON.g.add(lanterninha); lanternaLuz = new THREE.Mesh(new THREE.CircleGeometry(.04, 8), new THREE.MeshBasicMaterial({ color: 0xffe6a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); lanternaLuz.position.set(-.2, 2.2, .26); MON.g.add(lanternaLuz); } catch (e) {}
  // rastro de brasa no chão (Cap V): discos quentes que esfriam e somem
  const brasaPool = []; for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.28, .28), new THREE.MeshBasicMaterial({ color: 0xff5a1e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = -R2D; m.visible = false; scene.add(m); brasaPool.push({ m, t: 0 }); } let brasaI = 0, brasaCd = 0;
  // Ana: rosto que se apaga no Cap V (só a boca contando num borrão)
  const anaSemRostoTex = faceTex(96, 110, (g) => { g.strokeStyle = 'rgba(40,36,36,.5)'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(30, 78); g.quadraticCurveTo(48, 90, 66, 78); g.stroke(); g.fillStyle = 'rgba(120,116,110,.18)'; g.beginPath(); g.ellipse(48, 48, 26, 20, 0, 0, 7); g.fill(); });
  // Ana: olhos pintados na nuca
  let mAnaNuca = null; try { if (anaCab) { mAnaNuca = new THREE.Mesh(new THREE.PlaneGeometry(.18, .14), new THREE.MeshBasicMaterial({ map: faceNuca, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); mAnaNuca.position.set(0, .02, -.12); mAnaNuca.rotation.y = Math.PI; anaCab.add(mAnaNuca); } } catch (e) {}
  // Ana: rachaduras de porcelana que se acumulam a cada captura na noite
  const rachaTex = faceTex(96, 110, (g) => { g.strokeStyle = 'rgba(20,18,18,.85)'; g.lineCap = 'round'; for (let i = 0; i < 10; i++) { g.lineWidth = rand(.6, 1.8); let x = rand(16, 80), y = rand(10, 100); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += rand(-16, 16); y += rand(-16, 16); g.lineTo(x, y); } g.stroke(); } });
  let mAnaRacha = null; try { if (anaCab) { mAnaRacha = new THREE.Mesh(new THREE.PlaneGeometry(.2, .24), new THREE.MeshBasicMaterial({ map: rachaTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); mAnaRacha.position.set(0, .01, .123); anaCab.add(mAnaRacha); } } catch (e) {}
  // boca costurada que descose ponto a ponto por capítulo
  function bocaCosturaTex(cap) { const pts = Math.max(1, 7 - cap); return faceTex(64, 40, (g) => { g.strokeStyle = '#140b08'; g.lineWidth = 2; g.beginPath(); g.moveTo(8, 20); g.lineTo(56, 20); g.stroke(); for (let i = 0; i < pts; i++) { const x = 10 + i * (46 / pts); g.beginPath(); g.moveTo(x, 12); g.lineTo(x, 28); g.stroke(); } }); }
  const BOCA_COST = [0, 1, 2, 3, 4, 5].map(bocaCosturaTex);
  // dentes/boca que pegam um resíduo de luz no breu quando ele caça perto
  const mBocaLuz = new THREE.Mesh(new THREE.PlaneGeometry(.08, .1), new THREE.MeshBasicMaterial({ color: 0x4a4038, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); mBocaLuz.position.set(0, -.06, .138); MON.cabeca.add(mBocaLuz);
  // mancha de fuligem escorrendo pela bochecha por capítulo
  const bochechaTex = faceTex(64, 96, (g) => { const gr = g.createLinearGradient(0, 10, 0, 90); gr.addColorStop(0, 'rgba(10,8,8,.0)'); gr.addColorStop(.3, 'rgba(10,8,8,.7)'); gr.addColorStop(1, 'rgba(10,8,8,0)'); g.fillStyle = gr; g.fillRect(24, 10, 16, 80); });
  const mBochecha = inspFace(bochechaTex, .02, .141, 0); mBochecha.scale.set(.9, 1.2, 1);
  // fiapo de fumaça subindo das órbitas de brasa (Cap V)
  const fumacaOlho = []; for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.04, .04), new THREE.MeshBasicMaterial({ color: 0x6a6a6a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); fumacaOlho.push({ m, t: 0 }); } let fumacaI = 0, fumacaCd = 0;
  // Ana: feixes fracos que saem dos olhos no escuro e varrem a parede
  const anaFeixe = []; try { if (anaCab) for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.ConeGeometry(.06, .5, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fb0b8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.position.set(sx * .035, .02, .36); m.rotation.x = R2D; anaCab.add(m); anaFeixe.push(m); } } catch (e) {}
  // Procissão: mãozinhas que se erguem para a frente quando a fila para
  const procMaos = []; try { PROC.filhos.forEach((s) => { const par = new THREE.Group(); for (const sx of [-1, 1]) { const br = new THREE.Mesh(new THREE.CylinderGeometry(.015, .012, .3, 5), new THREE.MeshStandardMaterial({ color: 0x6a5c4e, roughness: .9 })); br.position.set(sx * .1, .9, .1); br.rotation.x = -R2D; par.add(br); } par.visible = false; s.add(par); procMaos.push(par); }); } catch (e) {}
  // estado da 2a rodada
  let l5stunAnt = 0, meninoCd = 0, capturas = 0, estadoAnt = '', leanInsp = 0, bengalaFase = 0, brasaBorda = 0, breu = 0, insDesce = 0, vendaCaida = 0, anaRachaN = 0, anaVistaAnt2 = false, bocaCapAp = -1, anaPegCd = 0, afogada = 0, procParada2 = 0, procPosAnt2 = new THREE.Vector3(), mapaBrasa = '', insPosAnt = new THREE.Vector3();
  const POSES_CAP = [0, .04, .1, .2, .34, .5]; // inclinação do tronco para a frente por capítulo

  function tickExtra(dt, st, cap, pf, reduz) {
    const furia = M.furia || 0;
    // --- INSPETOR ---
    if (M.ativo && MON.g.visible) {
      const head = MON.cabeca.getWorldPosition(_a); const d = head.distanceTo(camera.position);
      const noFeixe = st.flashOn && !pisca() && d < 14;
      let foco = 0; if (noFeixe) { const fw = camera.getWorldDirection(_b); foco = clamp((fw.dot(head.clone().sub(camera.position).normalize()) - .9) / .1, 0, 1); }
      const perto = foco * (1 - d / 14);
      const caca = M.state === 'caca', bote = M.state === 'bote' || M.state === 'agarra';

      // POSTURA que desumaniza por capítulo: tronco cai para a frente, corpo cresce um pouco
      leanInsp = lerp(leanInsp, POSES_CAP[clamp(cap, 0, 5)] + (caca ? .12 : 0) + (bote ? .2 : 0), Math.min(1, dt * 3));
      MON.g.rotation.x = lerp(MON.g.rotation.x, leanInsp, Math.min(1, dt * 4));
      const alvoEsc = .8 * (1 + cap * .03); MON.g.scale.setScalar(lerp(MON.g.scale.x, alvoEsc, Math.min(1, dt * 2)));
      // braços cada vez mais longos; no Cap V quase arrastam
      const bracoLongo = 1 + cap * .06 + (caca ? .05 : 0); MON.armL.scale.y = MON.armR.scale.y = lerp(MON.armL.scale.y || 1, bracoLongo, Math.min(1, dt * 2));
      // unhas crescem por capítulo
      for (const u of unhas) u.scale.setScalar(lerp(u.scale.x || 1, 1 + cap * .25 + (bote ? .6 : 0), Math.min(1, dt * 4)));

      // MANDÍBULA desencaixa mais a cada capítulo mesmo fora da caça; fica pendida no Cap V
      if (MON.boca) { const base = 1 + cap * .25; MON.boca.scale.y = Math.max(MON.boca.scale.y, lerp(MON.boca.scale.y, base, Math.min(1, dt * 2))); if (cap >= 5) MON.boca.position.y = lerp(MON.boca.position.y, -.11, Math.min(1, dt * 2)); }

      // OLHOS DE BRASA apagada no Cap V; brilham mais no bote
      const brasaOn = cap >= 5 ? (.25 + Math.sin(pf * 2) * .12 + (bote ? .6 : 0) + Math.min(.5, furia * .1)) : 0;
      for (const m of brasaOlhos) m.material.opacity = lerp(m.material.opacity, brasaOn, Math.min(1, dt * 5));

      // RACHADURAS DE BRASA no peito (Cap V), pulsam com a fúria e abrem no fareja
      if (cap >= 5) {
        const inspira = M.state === 'fareja' || M.state === 'vasculha';
        const pulso = .3 + Math.sin(pf * (3 + furia)) * .18 + (inspira ? .4 : 0) + Math.min(.4, furia * .08);
        mBrasaPeito.material.opacity = lerp(mBrasaPeito.material.opacity, clamp(pulso, 0, 1), Math.min(1, dt * 5));
        mBrasaGlow.material.opacity = lerp(mBrasaGlow.material.opacity, (inspira ? .5 : .18) * clamp(1 - d / 10, 0, 1), Math.min(1, dt * 4));
      } else { mBrasaPeito.material.opacity = Math.max(0, mBrasaPeito.material.opacity - dt * 2); mBrasaGlow.material.opacity = Math.max(0, mBrasaGlow.material.opacity - dt * 2); }

      // ROSTINHOS sob a pele a partir do Cap IV, iluminados de perto
      mCrianca.material.opacity = lerp(mCrianca.material.opacity, cap >= 4 && perto > .12 ? (.4 + Math.sin(pf * 3) * .18) : 0, Math.min(1, dt * 4));
      // FULIGEM subindo pelo rosto por capítulo
      mFuligem.material.opacity = lerp(mFuligem.material.opacity, perto > .1 ? clamp(cap / 5 * .7, 0, .7) : 0, Math.min(1, dt * 5));

      // PESCOÇO pendido para trás na escuta (rosto ao teto, boca à mostra)
      const escuta = M.state === 'escuta' || M.state === 'emboscada';
      MON.cabeca.rotation.x = lerp(MON.cabeca.rotation.x, escuta ? -.9 : 0, Math.min(1, dt * 3));
      // PESCOÇO travado de lado no Cap V na caça, com estalo seco ao entrar
      if (cap >= 5 && caca) MON.cabeca.rotation.z = lerp(MON.cabeca.rotation.z, 1.4, Math.min(1, dt * 3));
      if (caca && estadoAnt !== 'caca' && cap >= 5) { try { C.SX && C.SX.estalo && C.SX.estalo(M.pos, .6); } catch (e) {} }

      // CABEÇA acompanha você além do humano na passagem (sem te ter ouvido)
      if (!caca && !bote && visivel(M.pos, 2, 12)) { const al = olhaParaMim(MON.cabeca); if (al > -1) MON.cabeca.rotation.y = lerp(MON.cabeca.rotation.y, clamp(-Math.atan2(camera.position.x - head.x, camera.position.z - head.z) + MON.g.rotation.y, -2.2, 2.2), Math.min(1, dt * 1.5)); }

      // PÉS que deixam de tocar o chão no Cap V em plena caça
      insDesce = lerp(insDesce, cap >= 5 && caca ? .06 : 0, Math.min(1, dt * 2));
      MON.g.position.y += insDesce;
      if (cap >= 5 && caca) { MON.legL.rotation.x = lerp(MON.legL.rotation.x, 0, Math.min(1, dt * 3)); MON.legR.rotation.x = lerp(MON.legR.rotation.x, 0, Math.min(1, dt * 3)); }

      // CEGUEIRA DE DOR: facho forte de perto no Cap V faz a cabeça tombar e as mãos subirem
      if (cap >= 5 && foco > .75 && d < 3) { MON.cabeca.rotation.x = lerp(MON.cabeca.rotation.x, -.7, Math.min(1, dt * 4)); MON.armL.rotation.x = lerp(MON.armL.rotation.x, -1.8, Math.min(1, dt * 5)); MON.armR.rotation.x = lerp(MON.armR.rotation.x, -1.8, Math.min(1, dt * 5)); for (const m of brasaOlhos) m.material.opacity = Math.min(1, m.material.opacity + .4); }

      // VENDA cai de vez no clímax (Cap V em fúria/sino): órbitas o tempo todo
      if (cap >= 5 && (st.flags && st.flags.sino || furia > 2)) vendaCaida = Math.min(1, vendaCaida + dt * .4);
      if (vendaCaida > 0) { mVenda.material.opacity = Math.min(mVenda.material.opacity, 1 - vendaCaida * .7); mOrbitas.material.opacity = Math.max(mOrbitas.material.opacity, vendaCaida); }

      // A VENDA RESPIRA: leve jitter dos fios quando iluminada de perto
      if (perto > .2) mVenda.position.y = .17 + Math.sin(pf * 5) * .003; else mVenda.position.y = .17;

      // DENTES/VENDA brilham fraco no escuro total quando ele está perto e caçando
      const breuPerto = !st.flashOn && caca && d < 5;
      mBocaLuz.material.opacity = lerp(mBocaLuz.material.opacity, breuPerto ? .25 + Math.sin(pf * 10) * .05 : 0, Math.min(1, dt * 4));
      if (breuPerto) for (const m of brasaOlhos) if (cap < 5) m.material.opacity = Math.max(m.material.opacity, .12);
      // fiapos do casaco pegam cor de brasa no Cap V
      if (cap >= 5) for (const f of fiosPool) if (f.m.visible && f.m.material.color) f.m.material.color.setHex(0x5a2410);

      // SOMBRA que chega antes dele: projetada à frente, mais alta e com braços a mais
      if (sombraInsp) {
        const lit = (st.flashOn && !pisca() && d < 12) || caca;
        const ang = MON.g.rotation.y;
        sombraInsp.position.set(M.pos.x + Math.sin(ang) * 1.3, 1.2 + cap * .12, M.pos.z + Math.cos(ang) * 1.3);
        sombraInsp.lookAt(camera.position.x, 1.2, camera.position.z);
        sombraInsp.scale.set(1 + cap * .12, 1 + cap * .18, 1);
        sombraInsp.material.opacity = lerp(sombraInsp.material.opacity, lit && !reduz ? clamp(.35 + cap * .06, 0, .6) : 0, Math.min(1, dt * 3));
      }

      // BENGALA de cego tateia nos Cap I-II; some do Cap III em diante
      bengalaFase += dt * 3;
      if (bengala) { const mostra = cap <= 1; bengala.visible = mostra; if (mostra) { bengala.rotation.z = Math.sin(bengalaFase) * .5; } }
      // CHAPÉU amassa e some no Cap V
      if (chapeu) { chapeu.scale.setScalar(lerp(chapeu.scale.x, cap >= 5 ? 0 : 1 - cap * .08, Math.min(1, dt * 2))); chapeu.children[1] && (chapeu.children[1].scale.y = 1 - cap * .12); }

      // LANTERNINHA morta no cinto pisca um instante na caça (isca cruel)
      if (lanternaLuz) { if (caca && Math.random() < dt * .4) lanternaLuz.material.opacity = .9; lanternaLuz.material.opacity = Math.max(0, lanternaLuz.material.opacity - dt * 2.5); }

      // CASACO pinga o mesmo breu do cabelo da Ana (Cap IV+)
      if (cap >= 4 && !reduz && Math.random() < dt * 1.1) soltarDecal(M.pos.x + rand(-.15, .15), M.pos.z + rand(-.15, .15), .3, 0x0a0a0c, 16);

      // RASTRO DE BRASA quente no chão no Cap V (esfria e some)
      if (cap >= 5 && (caca || M.state === 'investiga') && !reduz && (brasaCd -= dt) <= 0) { brasaCd = .25; const b = brasaPool[brasaI++ % brasaPool.length]; const ang = MON.g.rotation.y; b.m.visible = true; b.t = 2.5; b.m.position.set(M.pos.x - Math.sin(ang) * .2, .04, M.pos.z - Math.cos(ang) * .2); b.m.scale.setScalar(rand(.6, 1)); }

      // DEDOS que alongam no bote (garras por um instante)
      if (bote) for (const u of unhas) u.scale.setScalar(u.scale.x + dt * 2);

      // MANCHA de fuligem na bochecha, cresce por capítulo quando iluminada
      mBochecha.material.opacity = lerp(mBochecha.material.opacity, perto > .12 ? clamp(cap / 5 * .8, 0, .8) : 0, Math.min(1, dt * 4));
      // REZA: cabeça baixa e braços se juntam em frente
      if (M.state === 'reza') { MON.cabeca.rotation.x = lerp(MON.cabeca.rotation.x, .5, Math.min(1, dt * 3)); MON.armL.rotation.x = lerp(MON.armL.rotation.x, -1.2, Math.min(1, dt * 4)); MON.armR.rotation.x = lerp(MON.armR.rotation.x, -1.2, Math.min(1, dt * 4)); }
      // ESPREITA: parado (procura/emboscada), o pescoço estica mais para cima devagar
      const insParado = M.pos.distanceTo(insPosAnt) < .01; insPosAnt.copy(M.pos);
      if ((M.state === 'procura' || M.state === 'emboscada') && insParado && neckBase !== null) { MON.cabeca.position.y = lerp(MON.cabeca.position.y, neckBase + .1, Math.min(1, dt * 2)); }
      // SORRISO DE GIZ pinga giz branco quando ele caça por muito tempo
      if (M.state === 'caca' && mSorriso.material.opacity > .5 && !reduz && Math.random() < dt * .8) soltarDecal(M.pos.x + rand(-.1, .1), M.pos.z + rand(-.1, .1), .25, 0xcfc7b4, 14);
      // OLHOS DE GIZ acompanham você mesmo com a cabeça parada
      try { if (mGiz.material.opacity > .1) { const a = -Math.atan2(camera.position.x - head.x, camera.position.z - head.z) + MON.g.rotation.y; mGiz.rotation.z = clamp(a * .15, -.3, .3); } } catch (e) {}
      // GARRAS raspam a parede num corredor na caça do Cap IV+ (risco efêmero)
      if (!reduz && caca && cap >= 4 && Math.random() < dt * 1.2) soltarDecal(M.pos.x, M.pos.z - .35, .4, 0x0a0806, 10, true);
      // FUMAÇA fina sobe das órbitas de brasa no Cap V
      if (cap >= 5 && (fumacaCd -= dt) <= 0 && !reduz) { fumacaCd = .4; const fo = fumacaOlho[fumacaI++ % fumacaOlho.length]; fo.m.visible = true; fo.t = 1.4; MON.cabeca.getWorldPosition(_c); fo.m.position.copy(_c).add(_b.set(rand(-.03, .03), .05, 0)); }
      // BOCA COSTURADA descose ponto a ponto por capítulo
      if (bocaCapAp !== cap && BOCA_COST[clamp(cap, 0, 5)]) { bocaCapAp = cap; try { mCostura.material.map = BOCA_COST[clamp(cap, 0, 5)]; mCostura.material.needsUpdate = true; } catch (e) {} }
      // OLHAR que não bate com a cabeça: os pontos úmidos seguem você mesmo com a cara virada
      try { const alvo = _b.copy(camera.position).sub(head).setY(0); const off = clamp(alvo.x * .02, -.02, .02); for (const m of umido) m.position.z = .145 + Math.abs(off) * 2; } catch (e) {}

      estadoAnt = M.state;
    } else { if (sombraInsp) sombraInsp.material.opacity = Math.max(0, sombraInsp.material.opacity - dt * 3); for (const m of brasaOlhos) m.material.opacity = 0; mBrasaPeito.material.opacity = 0; mBrasaGlow.material.opacity = 0; mCrianca.material.opacity = 0; mFuligem.material.opacity = 0; mMenino.material.opacity = Math.max(0, mMenino.material.opacity - dt * 4); if (lanternaLuz) lanternaLuz.material.opacity = 0; mBocaLuz.material.opacity = 0; mBochecha.material.opacity = 0; }

    // ROSTO DO MENINO no atordoamento do sino (l5stun sobe): um quadro e volta
    meninoCd -= dt;
    if ((M.l5stun || 0) > l5stunAnt + .05 && meninoCd <= 0 && !reduz) { mMenino.material.opacity = 1; mVenda.material.opacity = .2; meninoCd = 6; }
    l5stunAnt = M.l5stun || 0;
    if (mMenino.material.opacity > 0) mMenino.material.opacity = Math.max(0, mMenino.material.opacity - dt * 3);

    // contagem de capturas da noite: molho de dentes cresce
    if (M.state === 'agarra' && estadoAnt !== 'agarra') { capturas++; }
    mDentes.scale.setScalar(lerp(mDentes.scale.x || 1, 1 + capturas * .08 + (S().chapter | 0) * .03, Math.min(1, dt * 3)));

    // brasas do chão esfriam
    for (const b of brasaPool) if (b.m.visible) { b.t -= dt; const k = clamp(b.t / 2.5, 0, 1); b.m.material.opacity = k * .5; b.m.material.color.setRGB(1, .35 * k, .1 * k); if (b.t <= 0) b.m.visible = false; }
    if (mapaBrasa !== W.mapa) { mapaBrasa = W.mapa; for (const b of brasaPool) { b.m.visible = false; b.t = 0; } for (const fo of fumacaOlho) { fo.m.visible = false; fo.t = 0; } }
    // fumaça das órbitas de brasa sobe e some
    for (const fo of fumacaOlho) if (fo.m.visible) { fo.t -= dt; fo.m.position.y += dt * .3; fo.m.scale.setScalar(1 + (1.4 - fo.t)); fo.m.lookAt(camera.position); fo.m.material.opacity = clamp(fo.t / 1.4, 0, 1) * .12; if (fo.t <= 0) fo.m.visible = false; }

    // VULTO: cabeça tombada num ângulo impossível, que o corpo real não tem
    try { if (VULTO.g.visible && VULTO.cabeca) VULTO.cabeca.rotation.z = lerp(VULTO.cabeca.rotation.z, 1.1, Math.min(1, dt * 2)); } catch (e) {}

    // --- ANA: rosto que se apaga no Cap V, nuca que olha, porcelana que racha ---
    if (ANA.ativa && ANA_G.visible && anaCab) {
      if (cap >= 5 && mAnaFace) { mAnaFace.material.map = anaSemRostoTex; mAnaFace.material.needsUpdate = true; }
      // olhos na nuca aparecem quando ela está de costas na sua luz
      if (mAnaNuca) { const costas = olhaParaMim(anaCab) < -.2; const ver = st.flashOn && !pisca() && ANA.pos.distanceTo(camera.position) < 10; mAnaNuca.material.opacity = lerp(mAnaNuca.material.opacity, costas && ver ? .85 : 0, Math.min(1, dt * 4)); }
      // porcelana racha a cada captura (DEZ) da noite — some ao reaparecer novinha? não: fica
      if (mAnaRacha) mAnaRacha.material.opacity = lerp(mAnaRacha.material.opacity, Math.min(.9, anaRachaN * .18), Math.min(1, dt * 3));
      if (ANA.vista && !anaVistaAnt2 && (ANA.conta || 0) >= 9) anaRachaN++;
      anaVistaAnt2 = ANA.vista;
      // AFOGADA nos túneis: surge inclinada como se boiasse e se ergue devagar na luz
      afogada = lerp(afogada, (W.mapa === 'tuneis' && !ANA.vista) ? 1 : 0, Math.min(1, dt * 1.5));
      ANA_G.rotation.x = lerp(ANA_G.rotation.x, afogada * .55, Math.min(1, dt * 2));
      // MARCAS molhadas de mão/pé por onde ela passou
      if ((anaPegCd -= dt) <= 0 && !ANA.vista && !reduz) { anaPegCd = .5; soltarDecal(ANA.pos.x + rand(-.15, .15), ANA.pos.z + rand(-.15, .15), .3, 0x0c1614, 30); }
      // FEIXES fracos dos olhos varrem o escuro enquanto ela conta
      const contaEsc = !ANA.vista && (ANA.conta || 0) > 0 && !naLuz(ANA.pos);
      for (const f of anaFeixe) f.material.opacity = lerp(f.material.opacity, contaEsc ? .12 + Math.sin(pf * 3) * .05 : 0, Math.min(1, dt * 3));
    } else { if (mAnaNuca) mAnaNuca.material.opacity = 0; for (const f of anaFeixe) f.material.opacity = 0; }

    // --- PROCISSÃO: mãozinhas que se erguem para a frente quando a fila para ---
    if (PROC.g && PROC.g.visible) {
      const parada = PROC.pos.distanceTo(procPosAnt2) < .003; procPosAnt2.copy(PROC.pos); procParada2 = parada ? procParada2 + dt : 0;
      const erguer = procParada2 > .5;
      procMaos.forEach((par) => { if (par) par.visible = erguer; });
    } else { for (const par of procMaos) if (par) par.visible = false; }

    // --- borda de brasa na caça do Cap V (overlay suave) ---
    brasaBorda = lerp(brasaBorda, (M.ativo && M.state === 'caca' && (S().chapter | 0) >= 5) ? 1 : 0, Math.min(1, dt * 2));
    // --- penumbra: ele traz o breu junto quando cola de perto no escuro ---
    if (M.ativo && MON.g.visible) { const d2 = M.pos.distanceTo(camera.position); breu = lerp(breu, (!st.flashOn && d2 < 3.5 && M.state === 'caca') ? clamp(1 - d2 / 3.5, 0, .6) : 0, Math.min(1, dt * 3)); } else breu = lerp(breu, 0, Math.min(1, dt * 3));
  }

  function tick(dt) {
    const st = S(); if (!st) return;
    const cap = st.chapter | 0, pf = perf(), reduz = !!OPT.vFlash;
    garantirOverlay();
    aplicarCapitulo(cap);

    // ===== INSPETOR =====
    if (M.ativo && MON.g.visible) {
      const head = MON.cabeca.getWorldPosition(_a); const d = head.distanceTo(camera.position);
      const noFeixe = st.flashOn && !pisca() && d < 14;
      // facho aponta no rosto?
      let foco = 0; if (noFeixe) { const fw = camera.getWorldDirection(_b); foco = clamp((fw.dot(head.clone().sub(camera.position).normalize()) - .9) / .1, 0, 1); }
      const perto = foco * (1 - d / 14);

      // reflexo úmido dos olhos cegos sob a venda
      for (const m of umido) m.material.opacity = lerp(m.material.opacity, perto > .2 && cap >= 1 ? .5 * perto : 0, Math.min(1, dt * 8));
      // sorriso largo pintado no modo caça
      mSorriso.material.opacity = lerp(mSorriso.material.opacity, M.state === 'caca' ? .8 : 0, Math.min(1, dt * 4));
      // sangue da venda na fúria
      mFuria.material.opacity = lerp(mFuria.material.opacity, (M.furia || 0) > 1.2 ? .85 : 0, Math.min(1, dt * 3));
      // olhos de giz (lore: as crianças "deram olhos" a ele) a partir do Cap III
      mGiz.material.opacity = lerp(mGiz.material.opacity, cap >= 3 && perto > .15 ? .7 : 0, Math.min(1, dt * 6));

      // calor da lanterna: encarar por tempo faz piscar a versão queimada de 1979
      calorFlashCd -= dt;
      if (foco > .5 && d < 4) { lanternaPertoAcc += dt; } else lanternaPertoAcc = Math.max(0, lanternaPertoAcc - dt * 2);
      if (lanternaPertoAcc > 4 && calorFlashCd <= 0 && !reduz) { mQueimado.material.opacity = .85; calorFlashCd = clamp(5 - (lanternaPertoAcc - 4), .6, 4); }
      else mQueimado.material.opacity = Math.max(0, mQueimado.material.opacity - dt * 6);
      // vislumbre queimado também no medo máximo com ele no feixe
      if (st.fear > 95 && foco > .3 && Math.random() < dt * 1.5 && !reduz) mQueimado.material.opacity = Math.max(mQueimado.material.opacity, .8);

      // pálpebras costuradas: revelação única ao iluminar bem de perto (< 1,5 m)
      if (!revelouVenda && d < 1.5 && foco > .6) { revelouVenda = true; mOrbitas.material.opacity = 1; mVenda.material.opacity = .35; setTimeout(() => { subPequeno('lia', 'As pálpebras dele... estão costuradas.'); }, 60); try { conquista('viu_sob_venda'); } catch (e) {} }
      if (revelouVenda) { mOrbitas.material.opacity = Math.max(0, mOrbitas.material.opacity - dt * .6); mVenda.material.opacity = Math.min(1, mVenda.material.opacity + dt * .6); }
      // órbitas no agarrão/close extremo
      if ((M.state === 'agarra' || M.state === 'bote') && d < 2) mOrbitas.material.opacity = Math.max(mOrbitas.material.opacity, clamp(1.8 - d, 0, 1));

      // boca que desencaixa além do humano no grito/apito
      const grita = ['bote', 'agarra'].includes(M.state) || (M.state === 'caca' && d < 3);
      if (MON.boca) { MON.boca.scale.y = lerp(MON.boca.scale.y, grita ? 3.2 + Math.sin(pf * 22) * .4 : MON.boca.scale.y, Math.min(1, dt * 10)); MON.boca.position.y = lerp(MON.boca.position.y, grita ? -.14 : -.06, Math.min(1, dt * 10)); }
      // a boca costurada se rasga no grito e volta a costurar na ronda
      mCostura.material.opacity = lerp(mCostura.material.opacity, grita ? 0 : (perto > .1 || d < 3 ? .9 : .5), Math.min(1, dt * 8));

      // lágrima/escorrido preto na reza; escorre e pinga por capítulo
      const rezando = M.state === 'reza';
      mGota.material.opacity = lerp(mGota.material.opacity, (rezando || cap >= 4) ? .85 : 0, Math.min(1, dt * 4));
      if ((rezando || cap >= 4)) { gotaY -= dt * .12; mGota.scale.y = clamp(1 + (-gotaY) * 4, 1, 3); if (gotaY < -.12) { if (!reduz) soltarDecal(MON.g.position.x + .03, MON.g.position.z + .11, .9, cap >= 4 ? 0x120808 : 0x0c0806, 22); gotaY = 0; } }

      // pescoço estica para o teto quando ele escuta algo vindo de cima
      if (neckBase === null) neckBase = MON.cabeca.position.y;
      const escuta = M.state === 'escuta' || M.state === 'emboscada';
      MON.cabeca.position.y = lerp(MON.cabeca.position.y, neckBase + (escuta ? .07 : 0), Math.min(1, dt * 4));

      // rastro: dedos arranham o chão na caça; pegadas de terra/fuligem por capítulo
      if (!reduz && (M.state === 'caca' || M.state === 'investiga') && Math.random() < dt * 4) {
        const ang = MON.g.rotation.y, px = MON.g.position.x - Math.sin(ang) * .2, pz = MON.g.position.z - Math.cos(ang) * .2;
        if (W.mapa === 'cemiterio') soltarDecal(px, pz, .7, 0x1c140c, 14);           // terra úmida
        else if (cap >= 4) soltarDecal(px, pz, .6, 0x090706, 10);                     // fuligem fria
        else soltarDecal(px, pz, .4, 0x05120f, 6);                                     // riscos de unha
      }
      // marca de mão molhada na parede dos túneis
      if (!reduz && W.mapa === 'tuneis' && M.state !== 'caca' && Math.random() < dt * .8) soltarDecal(MON.g.position.x, MON.g.position.z - .3, .5, 0x0e1a16, 25, true);

      // vulto: braços longuíssimos no escuro, recolhem no bote
      if (VULTO.g.visible) { const longo = M.state === 'bote' || M.state === 'caca' ? 1 : 1.5; VULTO.g.scale.y = lerp(VULTO.g.scale.y || .8, .8 * longo, Math.min(1, dt * 4)); }

      // venda fica translúcida por um instante no facho forte: dá para ver que atrás não há olhos
      if (foco > .7 && d < 2.5 && Math.random() < dt * 2 && !reduz) { mVenda.material.opacity = .4; mOrbitas.material.opacity = Math.max(mOrbitas.material.opacity, .8); }
      mVenda.material.opacity = Math.min(1, mVenda.material.opacity + dt * .8);
      // chaves que de perto são dentes de leite
      mDentes.material.opacity = lerp(mDentes.material.opacity, perto > .2 ? .9 : 0, Math.min(1, dt * 6));
      if (!viuDentes && perto > .5 && d < 1.5) { viuDentes = true; setTimeout(() => subPequeno('lia', 'Aquilo não são chaves...'), 50); }
      // fiapos e poeira do casaco caindo na caça
      if ((M.state === 'caca') && !reduz && Math.random() < dt * 8) { const f = fiosPool[fioI++ % fiosPool.length]; f.m.visible = true; f.t = 1.2; f.vy = 0; f.m.position.set(MON.g.position.x + rand(-.2, .2), 1.6, MON.g.position.z + rand(-.2, .2)); }
      // hálito de vapor no frio, sobe antes de ver o corpo
      if ((W.mapa === 'tuneis' || W.mapa === 'cemiterio') && (bafoCd -= dt) <= 0) { bafoCd = rand(.6, 1.4); const b = bafoPool[bafoI++ % bafoPool.length]; b.m.visible = true; b.t = 2; MON.cabeca.getWorldPosition(_c); b.m.position.copy(_c); }
      // estática na borda quando a cabeça dele aponta para você (mesmo sem te ver)
      hitTopo = olhaParaMim(MON.cabeca, 0);
    } else { for (const m of umido) m.material.opacity = 0; mSorriso.material.opacity = 0; mFuria.material.opacity = 0; mGiz.material.opacity = 0; mQueimado.material.opacity = 0; mGota.material.opacity = 0; mDentes.material.opacity = 0; hitTopo = 0; }

    // ===== ANA =====
    if (ANA.ativa && ANA_G.visible && anaCab) {
      const ad = ANA.pos.distanceTo(camera.position);
      // cada vez que reaparece (sai e volta à vista), troca o rosto — nunca o mesmo seguido
      if (ANA.vista && !anaVistaAnt) { let n = anaFaceIdx; while (n === anaFaceIdx && ANA_FACES.length > 1) n = (Math.random() * ANA_FACES.length) | 0; anaFaceIdx = n; mAnaFace.material.map = ANA_FACES[anaFaceIdx]; mAnaFace.material.needsUpdate = true; }
      anaVistaAnt = ANA.vista;
      mAnaFace.material.opacity = ANA.vista ? .92 : .4;
      // sorriso rasgado por 1-2 quadros quando as luzes piscam perto dela
      if (pisca() && ad < 6 && Math.random() < .4 && !reduz) { mAnaFace.material.map = ANA_FACES[1]; mAnaFace.material.needsUpdate = true; }

      // pescoço torto além do humano quando encarada por muito tempo
      const enc = ANA.encaraT || 0;
      if (enc > 2.5) { anaCab.rotation.y = lerp(anaCab.rotation.y, clamp((enc - 2.5) * .9, 0, 2.9) * Math.sign(ANA.headY || 1), Math.min(1, dt * 2)); if (enc > 3 && Math.random() < dt * .5) { try { C.SX && C.SX.estalo(ANA.pos, .5); } catch (e) {} } }

      // franja cobre o rosto quando a cabeça entorta muito
      mAnaCabelo.material.opacity = lerp(mAnaCabelo.material.opacity, Math.abs(ANA.headY || 0) > 1.4 ? .95 : 0, Math.min(1, dt * 4));

      // apodrece ao ser encarada (afogamento na cisterna): estágios de pele
      const estagio = clamp(Math.floor((enc) / 1.5), 0, PELE_ESTAGIOS.length - 1);
      for (const m of anaPele) if (m.color) m.color.lerp(new THREE.Color(PELE_ESTAGIOS[estagio]), Math.min(1, dt * 3));

      // flutua ~2 cm (sem pés) quando parada e encarada
      ANA_G.position.y = lerp(ANA_G.position.y, (!ANA.vista || enc > 1) ? .02 : 0, Math.min(1, dt * 5));

      // sombra que aponta para a Lia e anda um passo à frente quando a luz vai sair
      if (anaSombra) { anaSombra.position.set(ANA.pos.x, .02, ANA.pos.z); const ang = Math.atan2(camera.position.x - ANA.pos.x, camera.position.z - ANA.pos.z); anaSombra.rotation.z = -ang; anaSombra.position.x += Math.sin(ang) * .7; anaSombra.position.z += Math.cos(ang) * .7; anaSombra.material.opacity = lerp(anaSombra.material.opacity, ANA.vista ? .5 : 0, Math.min(1, dt * 4)); }

      // os olhos pretos da Ana acendem num brilho fraco enquanto ela conta no escuro
      try { const om = ANA_G.userData.olhoMat; if (om && om.color) om.color.lerp(new THREE.Color((!ANA.vista && (ANA.conta || 0) > 0) ? 0x9fb0b8 : 0x000000), Math.min(1, dt * 4)); } catch (e) {}
      // o cabelo molhado da Ana pinga e marca o chão
      if (ANA.vista && Math.random() < dt * 1.2 && !reduz) soltarDecal(ANA.pos.x + rand(-.1, .1), ANA.pos.z + rand(-.1, .1), .35, 0x0a1210, 18);
      // rastro luminoso dos olhos no escuro quando se move sem ser vista
      const mv = ANA.pos.distanceTo(anaMoveAnt); if (!ANA.vista && mv > .05 && !naLuz(ANA.pos)) { const m = anaRastro[rastroI++ % anaRastro.length]; m.visible = true; m.position.set(ANA.pos.x, 1.2, ANA.pos.z); m.material.opacity = .6; } anaMoveAnt.copy(ANA.pos);
    } else { if (anaSombra) anaSombra.material.opacity = 0; }
    for (const m of anaRastro) if (m.visible) { m.material.opacity -= dt * .7; if (m.material.opacity <= 0) m.visible = false; }

    // ===== PROCISSÃO =====
    if (PROC.g && PROC.g.visible) {
      const naLuzVela = true; // sempre perto das próprias velas
      const parada = PROC.pos.distanceTo(procPosAnt) < .002; procPosAnt.copy(PROC.pos); procParada = parada ? procParada + dt : 0;
      const viraPraVoce = procParada > .4;
      PROC.filhos.forEach((s, i) => {
        if (procFaces[i]) procFaces[i].material.opacity = lerp(procFaces[i].material.opacity, naLuzVela ? .9 : 0, Math.min(1, dt * 3));
        // sem pés: flutuam ~2 cm quando a fila para e vira o rosto
        s.position.y = lerp(s.position.y, procPes0[i] + (viraPraVoce ? .025 : 0), Math.min(1, dt * 4));
        // olhos na nuca piscam e choram tinta quando a sua luz passa
        if (procNuca[i]) { const ver = st.flashOn && !pisca() && visivel(PROC.pos, 1, 12); procNuca[i].material.opacity = lerp(procNuca[i].material.opacity, ver ? (Math.sin(pf * 6 + i) > -.3 ? .85 : .1) : 0, Math.min(1, dt * 5)); }
      });
      if (st.flashOn && !pisca() && visivel(PROC.pos, 1, 10)) nucaChora += dt;
      // sombra com crianças a mais: velas extras acesas além das 9 reais já sugerem a fila maior
      // velas como cronômetro: durante a passagem, apagam uma a uma
      if (PROC.fase === 'passando' && PROC.chamas) { const frac = clamp(PROC.t / 16, 0, 1), acesas = Math.ceil(frac * PROC.chamas.length); PROC.chamas.forEach((ch, i) => { ch.visible = i < acesas; }); }
      else if (PROC.chamas) PROC.chamas.forEach(ch => ch.visible = true);
    }

    // ===== decalques: fade =====
    if (mapaDecal !== W.mapa) { mapaDecal = W.mapa; for (const d of decalPool) { d.m.visible = false; d.t = 0; } }
    for (const d of decalPool) if (d.m.visible) { d.t -= dt; d.m.material.opacity = clamp(d.t / d.vida, 0, 1) * .6; if (d.t <= 0) d.m.visible = false; }

    // ===== partículas e olhos no escuro =====
    for (const f of fiosPool) if (f.m.visible) { f.t -= dt; f.vy -= dt * .3; f.m.position.y += f.vy * dt; f.m.lookAt(camera.position); f.m.material.opacity = clamp(f.t, 0, 1) * .5; if (f.t <= 0) f.m.visible = false; }
    for (const b of bafoPool) if (b.m.visible) { b.t -= dt; b.m.position.y += dt * .25; b.m.scale.setScalar(1 + (2 - b.t) * .8); b.m.lookAt(camera.position); b.m.material.opacity = clamp(b.t / 2, 0, 1) * .14; if (b.t <= 0) b.m.visible = false; }
    // olhos no escuro: só no escuro, somem quando a luz chega perto
    for (const e of olhosEscuro) {
      if (e.g.visible) { e.t -= dt; const perto = e.g.position.distanceTo(camera.position); if (e.t <= 0 || (st.flashOn && !pisca() && visivel(e.g.position, 1, 7) && perto < 7) || naLuz(e.g.position)) { e.g.visible = false; e.cd = rand(3, 9); } else { const blink = Math.sin(pf * 2 + e.g.id) > -.7 ? 1 : .1; for (const o of e.g.children) o.material.opacity = .6 * blink; } }
      else if ((e.cd -= dt) <= 0 && C.mode === 'jogo' && !st.dead && W.mapa !== 'estrada') { const ang = rand(0, 7), dist = rand(5, 9), x = camera.position.x + Math.sin(ang) * dist, z = camera.position.z + Math.cos(ang) * dist; if (!naLuz({ x, z })) { e.g.position.set(x, rand(.9, 1.5), z); e.g.visible = true; e.t = rand(1.5, 4); e.g.children.forEach(o => o.material.opacity = 0); } else e.cd = rand(1, 3); }
    }

    // luzes de emergência vermelhas na fuga final (sino tocado)
    if (st.flags && st.flags.sino) flashEmerg = Math.max(flashEmerg, .3);
    // raríssimo: um instante "pelos olhos" dele durante a caça
    if (M.ativo && M.state === 'caca' && olhoDele <= 0 && Math.random() < dt * .03 && !reduz) olhoDele = .45;

    // ===== 2a rodada do Lote 5 =====
    try { tickExtra(dt, st, cap, pf, reduz); } catch (e) {}

    // ===== overlay de tela =====
    desenharOverlay(dt, st, pf, reduz);
  }

  function desenharOverlay(dt, st, pf, reduz) {
    if (!octx) return; const w = ov.width, h = ov.height; octx.clearRect(0, 0, w, h);
    if (st.dead || C.mode !== 'jogo') return;
    const caca = M.ativo && M.state === 'caca';
    // vinheta de pânico / visão em túnel na caça (sobe o escuro nas bordas)
    const tun = clamp((caca ? .5 : 0) + (st.fear - 70) / 60, 0, .85);
    if (tun > .02) { const g = octx.createRadialGradient(w / 2, h / 2, h * .25, w / 2, h / 2, h * .62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${tun.toFixed(3)})`); octx.fillStyle = g; octx.fillRect(0, 0, w, h); }
    // grão mais forte na caça (pontos escuros rápidos)
    if (caca && !reduz) { octx.globalAlpha = .08; for (let i = 0; i < 120; i++) { octx.fillStyle = Math.random() > .5 ? '#000' : '#fff'; octx.fillRect(Math.random() * w, Math.random() * h, 1, 1); } octx.globalAlpha = 1; }
    // estática na borda quando a cabeça do Inspetor aponta para você
    if (hitTopo > .4 && !reduz) { const k = (hitTopo - .4) / .6; octx.globalAlpha = .18 * k; for (let i = 0; i < 260 * k; i++) { const borda = Math.random(); let x, y; if (borda < .5) { x = Math.random() * w; y = Math.random() < .5 ? Math.random() * h * .18 : h - Math.random() * h * .18; } else { y = Math.random() * h; x = Math.random() < .5 ? Math.random() * w * .14 : w - Math.random() * w * .14; } octx.fillStyle = Math.random() > .5 ? '#cfd6d8' : '#101014'; octx.fillRect(x, y, 2, 1); } octx.globalAlpha = 1; }
    // vinheta vermelha pulsando + embaçado com vida baixa
    if (st.health < 30) { const bat = (Math.sin(pf * (3 + (30 - st.health) / 10)) * .5 + .5); const a = (30 - st.health) / 30 * (reduz ? .25 : .5) * (.5 + bat * .5); const g = octx.createRadialGradient(w / 2, h / 2, h * .2, w / 2, h / 2, h * .7); g.addColorStop(0, 'rgba(90,0,0,0)'); g.addColorStop(1, `rgba(120,0,0,${a.toFixed(3)})`); octx.fillStyle = g; octx.fillRect(0, 0, w, h); }
    // Ana muito perto e em pânico: a "visão" dela invade a tela (tons de giz, contagem)
    if (ANA.ativa && ANA.pos.distanceTo(camera.position) < 3 && st.fear > 85 && !reduz) { octx.fillStyle = 'rgba(210,205,195,.10)'; octx.fillRect(0, 0, w, h); octx.fillStyle = 'rgba(230,228,220,.22)'; octx.font = 'bold ' + (h * .5 | 0) + 'px Georgia'; octx.textAlign = 'center'; octx.fillText(String(Math.min(10, (ANA.conta | 0) || 1)), w / 2, h * .72); }
    // Ana pelo canto do olho: um borrão onde ela está quando não está no centro da mira
    if (ANA.ativa && ANA_G.visible && !reduz) { try { _c.set(ANA.pos.x, 1.1, ANA.pos.z).project(camera); if (_c.z < 1) { const sx = _c.x * .5 + .5, sy = -_c.y * .5 + .5, off = Math.hypot(_c.x, _c.y); if (off > .35 && off < 1.2) { octx.globalAlpha = clamp((off - .35) * 1.2, 0, .5); octx.fillStyle = '#0a0a0c'; octx.beginPath(); octx.ellipse(sx * w, sy * h, w * .05, h * .12, 0, 0, 7); octx.fill(); octx.globalAlpha = 1; } } } catch (e) {} }
    // pós-imagem do vulto que acabou de sumir na luz
    if (posImg > 0) { posImg -= dt * 3; octx.globalAlpha = clamp(posImg, 0, 1) * .6; octx.fillStyle = '#000'; octx.beginPath(); octx.ellipse(w * posImgX, h * posImgY, w * .04, h * .22, 0, 0, 7); octx.fill(); octx.globalAlpha = 1; }
    // raro: um instante "pelos olhos" do Inspetor cego (negativo de ruído)
    if (olhoDele > 0) { olhoDele -= dt; octx.fillStyle = 'rgba(6,8,10,.75)'; octx.fillRect(0, 0, w, h); octx.globalAlpha = .5; for (let i = 0; i < 400; i++) { octx.fillStyle = '#2a3a44'; octx.fillRect(Math.random() * w, Math.random() * h, 1, 1); } octx.globalAlpha = 1; }
    // luzes de emergência vermelhas na fuga final, com o recorte dele por um quadro
    if (flashEmerg > 0 && !reduz) { flashEmerg -= dt; if (Math.sin(pf * 10) > 0) { octx.fillStyle = 'rgba(120,0,0,.22)'; octx.fillRect(0, 0, w, h); } }
    // borda de brasa pulsando na caça do Cap V (por cima do vermelho de perigo)
    if (brasaBorda > .02 && !reduz) { const a = brasaBorda * (.14 + Math.sin(pf * 5) * .06); const g = octx.createRadialGradient(w / 2, h / 2, h * .3, w / 2, h / 2, h * .72); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(255,70,20,${clamp(a, 0, .3).toFixed(3)})`); octx.fillStyle = g; octx.fillRect(0, 0, w, h); }
    // penumbra: ele traz o breu quando cola de perto no escuro, mais forte do lado dele
    if (breu > .02) { let sx = .5; try { _c.set(M.pos.x, 1.4, M.pos.z).project(camera); sx = clamp(_c.x * .5 + .5, .15, .85); } catch (e) {} const g = octx.createRadialGradient(sx * w, h / 2, h * .15, sx * w, h / 2, h * .9); g.addColorStop(0, `rgba(0,0,0,${(breu * .5).toFixed(3)})`); g.addColorStop(1, 'rgba(0,0,0,0)'); octx.fillStyle = g; octx.fillRect(0, 0, w, h); }
    // tênue matiz da ameaça MAIS PRÓXIMA no lado de onde ela vem (vermelho Inspetor, azul Ana, âmbar Procissão)
    if (!reduz) {
      let melhor = null, dMin = 7, cor = null;
      if (M.ativo && MON.g.visible) { const dd = M.pos.distanceTo(camera.position); if (dd < dMin) { dMin = dd; melhor = M.pos; cor = '255,40,30'; } }
      if (ANA.ativa && ANA_G.visible) { const dd = ANA.pos.distanceTo(camera.position); if (dd < dMin) { dMin = dd; melhor = ANA.pos; cor = '70,120,210'; } }
      if (PROC.g && PROC.g.visible) { const dd = PROC.pos.distanceTo(camera.position); if (dd < dMin) { dMin = dd; melhor = PROC.pos; cor = '220,150,40'; } }
      if (melhor && cor) { let sx = .5; try { _c.set(melhor.x, 1.4, melhor.z).project(camera); sx = clamp(_c.x * .5 + .5, 0, 1); } catch (e) {} const a = clamp((1 - dMin / 7) * .12, 0, .12) * (.6 + Math.sin(pf * 3) * .4); const g = octx.createLinearGradient(sx < .5 ? 0 : w, 0, sx < .5 ? w * .5 : w * .5, 0); g.addColorStop(0, `rgba(${cor},${a.toFixed(3)})`); g.addColorStop(1, `rgba(${cor},0)`); octx.fillStyle = g; octx.fillRect(0, 0, w, h); }
    }
  }

  // gancho para a pós-imagem do vulto (chamado quando o vulto some na luz)
  function posImagemVulto() { try { VULTO.g.getWorldPosition(_a); _a.project(camera); posImgX = clamp(_a.x * .5 + .5, 0, 1); posImgY = clamp(-_a.y * .5 + .5, 0, 1); posImg = 1; } catch (e) { posImg = 1; } }

  return {
    tick,
    posImagemVulto,
    olhosDele() { if (!OPT.vFlash) olhoDele = .5; },
    emergencia(t = 4) { flashEmerg = t; }
  };
}
