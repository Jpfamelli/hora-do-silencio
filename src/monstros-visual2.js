// =====================================================================
// LOTE 5 (2a rodada) — Monstros: visual e luz (src/monstros-visual2.js)
// Mais desumanização por capítulo, brasa do incêndio de 1979, sombra que
// mente, rastro de perseguição e leitura atmosférica. Tudo em canvas/Three,
// sem assets externos. Ligado por poucas linhas em jogo.js: MVIS2.tick(dt).
// Não muda fluxo de capítulo nem rótulos de interação (T.tudo segue valendo).
// =====================================================================
export function instalarMonstrosVisual2(C) {
  const { THREE, scene, camera, MON, VULTO, ANA, ANA_G, PROC, M, P, W, MAT, OPT, canvasTex, rand, clamp, lerp, naLuz, visivel, SX, chuvaMat, hemi, moon } = C;
  const S = () => C.S, perf = () => C.perf, pisca = () => C.flashPisca, raioI = () => C.raioI || 0;
  const R2D = Math.PI / 2;
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _q = new THREE.Quaternion();
  function tex(w, h, draw) { const t = canvasTex(w, h, (g, W2, H2) => { g.clearRect(0, 0, W2, H2); draw(g, W2, H2); }); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; }
  function olhaPara(obj) { try { obj.getWorldPosition(_a); const dir = _b.set(0, 0, 1).applyQuaternion(obj.getWorldQuaternion(_q)); _c.copy(camera.position).sub(_a).setY(0).normalize(); return dir.setY(0).normalize().dot(_c); } catch (e) { return 0; } }

  // ------------------------------------------------------------------
  // (1) Couro cabeludo queimado no alto da cabeça (revelado quando o chapéu some, Cap V)
  const scalpTex = tex(96, 96, (g) => {
    g.fillStyle = '#241512'; g.beginPath(); g.ellipse(48, 46, 34, 30, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(8,5,4,.8)'; for (let i = 0; i < 40; i++) g.fillRect(rand(16, 80), rand(16, 76), rand(2, 6), rand(2, 6));
    g.strokeStyle = 'rgba(90,40,26,.7)'; g.lineWidth = 2; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(rand(20, 76), rand(16, 30)); g.lineTo(rand(20, 76), rand(60, 80)); g.stroke(); }
  });
  const mScalp = new THREE.Mesh(new THREE.PlaneGeometry(.26, .26), new THREE.MeshBasicMaterial({ map: scalpTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
  mScalp.position.set(0, .34, 0); mScalp.rotation.x = -1.1; try { MON.cabeca.add(mScalp); } catch (e) {}

  // (2) Mãozinhas de criança empurrando por dentro do casaco (vincos no tronco, Cap IV+)
  const bulgeMat = new THREE.MeshStandardMaterial({ color: 0x14130f, roughness: .9, transparent: true, opacity: 0 });
  const bulges = []; try { for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), bulgeMat.clone()); m.scale.set(1, 1.3, .5); m.position.set(rand(-.18, .18), 2.0 + i * .28, .3); MON.g.add(m); bulges.push({ m, ph: rand(0, 7), y0: m.position.y }); } } catch (e) {}

  // (3) Rosto sem boca que surge na gola por um instante (Cap IV+, raro)
  const golaFaceTex = tex(64, 72, (g) => { g.fillStyle = 'rgba(190,180,170,.0)'; g.fillStyle = '#9a8e80'; g.beginPath(); g.ellipse(32, 36, 18, 24, 0, 0, 7); g.fill(); g.fillStyle = '#070606'; g.beginPath(); g.arc(24, 30, 3.5, 0, 7); g.fill(); g.beginPath(); g.arc(40, 30, 3.5, 0, 7); g.fill(); });
  const mGola = new THREE.Mesh(new THREE.PlaneGeometry(.14, .16), new THREE.MeshBasicMaterial({ map: golaFaceTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); mGola.position.set(0, 3.08, .18); try { MON.g.add(mGola); } catch (e) {} let golaCd = rand(6, 14);

  // (4/41) Casaco respira: tronco infla/murcha; trava quando ele espera parado
  let tronco = null; try { MON.g.traverse(o => { if (!tronco && o.isMesh && o.geometry && o.geometry.type === 'CylinderGeometry' && Math.abs(o.position.y - 2.15) < .01) tronco = o; }); } catch (e) {}
  let respira = 0;

  // (5) Pele do rosto mais rachada/encardida por capítulo (overlay trocado por capítulo)
  function peleTex(cap) { return tex(96, 128, (g) => { if (cap <= 0) return; g.strokeStyle = `rgba(10,7,6,${.2 + cap * .12})`; g.lineCap = 'round'; for (let i = 0; i < cap * 4; i++) { g.lineWidth = rand(.5, 1.6); let x = rand(16, 80), y = rand(10, 110); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 3; k++) { x += rand(-14, 14); y += rand(-14, 14); g.lineTo(x, y); } g.stroke(); } g.fillStyle = `rgba(20,14,10,${.08 + cap * .05})`; for (let i = 0; i < cap * 8; i++) g.fillRect(rand(14, 82), rand(10, 118), rand(2, 5), rand(2, 5)); }); }
  const PELES = [0, 1, 2, 3, 4, 5].map(peleTex);
  const mPele = new THREE.Mesh(new THREE.PlaneGeometry(.3, .4), new THREE.MeshBasicMaterial({ map: PELES[0], transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); mPele.position.set(0, .12, .138); try { MON.cabeca.add(mPele); } catch (e) {} let peleCap = -1;

  // (6) Rachaduras de brasa nas laterais do tronco (Cap V)
  const brasaLadoTex = tex(64, 128, (g) => { g.strokeStyle = 'rgba(255,90,30,.9)'; g.lineCap = 'round'; for (let i = 0; i < 5; i++) { g.lineWidth = rand(1, 2.5); let x = rand(16, 48), y = rand(10, 24); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += rand(-10, 10); y += rand(14, 22); g.lineTo(x, y); } g.stroke(); } });
  const brasaLados = []; try { for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.22, .5), new THREE.MeshBasicMaterial({ map: brasaLadoTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.position.set(sx * .34, 2.45, 0); m.rotation.y = sx * R2D; MON.g.add(m); brasaLados.push(m); } } catch (e) {}

  // (7) Casaco molhado/pingando nos túneis (gotas + brilho)
  const pingoPool = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.012, 5, 4), new THREE.MeshStandardMaterial({ color: 0x0a0c0c, roughness: .1, metalness: .3 })); m.visible = false; scene.add(m); pingoPool.push({ m, t: 0 }); } let pingoI = 0, pingoCd = 0;

  // (8) Veias pretas que sobem pelas laterais do pescoço (mais por capítulo)
  const veiaTex = tex(48, 96, (g) => { g.strokeStyle = 'rgba(6,5,5,.8)'; g.lineCap = 'round'; for (let i = 0; i < 4; i++) { g.lineWidth = rand(1, 2); let x = rand(12, 36), y = 92; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += rand(-6, 6); y -= rand(16, 22); g.lineTo(x, y); } g.stroke(); } });
  const veias = []; try { for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.1, .3), new THREE.MeshBasicMaterial({ map: veiaTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); m.position.set(sx * .05, 3.42, .06); MON.g.add(m); veias.push(m); } } catch (e) {}

  // (9) Cicatriz de queimadura no pescoço, revelada de perto
  const cicatrizTex = tex(64, 48, (g) => { g.fillStyle = 'rgba(70,30,20,.8)'; g.beginPath(); g.ellipse(32, 24, 24, 12, .2, 0, 7); g.fill(); g.fillStyle = 'rgba(10,6,4,.7)'; for (let i = 0; i < 16; i++) g.fillRect(rand(10, 54), rand(12, 36), rand(2, 5), rand(2, 4)); });
  const mCicatriz = new THREE.Mesh(new THREE.PlaneGeometry(.16, .12), new THREE.MeshBasicMaterial({ map: cicatrizTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); mCicatriz.position.set(0, 3.38, .1); try { MON.g.add(mCicatriz); } catch (e) {}

  // (10) Braços-sombra translúcidos acompanham os braços reais na fúria (Cap V)
  const bracoFantasma = []; try { for (const base of [MON.armL, MON.armR]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.05, .035, 2, 6), new THREE.MeshBasicMaterial({ color: 0x050505, transparent: true, opacity: 0, depthWrite: false })); m.position.y = -.97; base.add(m); bracoFantasma.push(m); } } catch (e) {}

  // (11) Sopro de brasa sai da boca ao expirar (Cap V)
  const sopro = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.05, .05), new THREE.MeshBasicMaterial({ color: 0xff6a24, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.visible = false; scene.add(m); sopro.push({ m, t: 0 }); } let soproI = 0, soproCd = 0;

  // (12) Pontas das unhas escurecem e sangram por capítulo
  const unhasPonta = []; try { for (const mao of MON.maos) mao.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'ConeGeometry') unhasPonta.push(o); }); } catch (e) {}

  // (13) Gola/ombros rangem e encolhem quando ele passa por vão apertado (Cap V perto de parede)
  let encolhe = 0;

  // (14) Botões/crachá de bronze do casaco enferrujam e somem de capítulo em capítulo
  const crachaMat = MAT.bronze ? MAT.bronze.clone() : null;
  try { if (crachaMat) MON.g.traverse(o => { if (o.isMesh && o.material === MAT.bronze && o.position.y > 2 && o.position.y < 3 && Math.abs(o.position.x) < .05) o.material = crachaMat; }); } catch (e) {}

  // ------------------------------------------------------------------
  // (15) Penumbra que ele carrega: esfera escura ao redor dele escurece o ambiente no escuro
  let penumbra = null; try { penumbra = new THREE.Mesh(new THREE.SphereGeometry(2.4, 12, 10), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, side: THREE.BackSide, depthWrite: false })); scene.add(penumbra); } catch (e) {}

  // (16) Pós-imagem queimada do corpo quando o facho forte sai dele
  const afterTex = tex(64, 160, (g) => { g.fillStyle = '#000'; g.beginPath(); g.ellipse(32, 26, 14, 18, 0, 0, 7); g.fill(); g.fillRect(20, 40, 24, 110); g.fillRect(8, 48, 10, 80); g.fillRect(46, 48, 10, 80); });
  let mAfter = null; try { mAfter = new THREE.Mesh(new THREE.PlaneGeometry(1, 2.4), new THREE.MeshBasicMaterial({ map: afterTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); scene.add(mAfter); } catch (e) {} let fachoForteAnt = 0;

  // (17) Sombra com gesto atrasado, diferente do corpo (na parede)
  const sombraGestoTex = tex(96, 180, (g) => { g.fillStyle = '#000'; g.beginPath(); g.ellipse(48, 28, 16, 20, 0, 0, 7); g.fill(); g.fillRect(34, 46, 28, 110); g.save(); g.translate(40, 60); g.rotate(-1.1); g.fillRect(-6, 0, 12, 90); g.restore(); g.fillRect(56, 58, 11, 70); });
  let mSombraGesto = null; try { mSombraGesto = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.1), new THREE.MeshBasicMaterial({ map: sombraGestoTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); mSombraGesto.position.y = 1.1; scene.add(mSombraGesto); } catch (e) {}

  // ------------------------------------------------------------------
  // Partículas de rastro, brasa do chão, poeira do facho
  // (22) Poeira presa no ar revela o rastro recente quando o facho cruza
  const poeiraRastro = []; for (let i = 0; i < 18; i++) { const g = new THREE.Group(); for (let k = 0; k < 4; k++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(.015, .015), new THREE.MeshBasicMaterial({ color: 0xbdb2a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); p.position.set(rand(-.12, .12), rand(.4, 1.5), rand(-.12, .12)); g.add(p); } g.visible = false; scene.add(g); poeiraRastro.push({ g, t: 0 }); } let poeiraI = 0, poeiraCd = 0;
  // (23) Fumaça rasteira que sobe do piso no trajeto recente (Cap V)
  const fumChao = []; for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.2, .3), new THREE.MeshBasicMaterial({ color: 0x3a3632, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); fumChao.push({ m, t: 0 }); } let fumI = 0, fumCd = 0;
  // (24) Cinza e brasa sobem do chão ao redor dele na caça (Cap V)
  const cinza = []; for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.025, .025), new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.visible = false; scene.add(m); cinza.push({ m, t: 0, vy: 0 }); } let cinzaI = 0, cinzaCd = 0;
  // (25) Lufada de poeira rente ao chão da posição dele até você ao expirar
  const lufada = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.3, .3), new THREE.MeshBasicMaterial({ color: 0x5a5248, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); m.rotation.x = -R2D; m.visible = false; scene.add(m); lufada.push({ m, t: 0, dir: new THREE.Vector3() }); } let lufadaI = 0;
  // (26) Bafo mais denso/frequente quanto mais perto (vapor extra da cabeça)
  const bafo2 = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.1, .1), new THREE.MeshBasicMaterial({ color: 0xcfd6d8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); bafo2.push({ m, t: 0 }); } let bafo2I = 0, bafo2Cd = 0;
  // (29) Órbitas costuradas reveladas por um quadro no clarão do relâmpago (Cap V cemitério)
  const orbTex = tex(96, 64, (g) => { for (const sx of [-1, 1]) { const cx = 48 + sx * 18, cy = 32; g.fillStyle = '#0a0604'; g.beginPath(); g.ellipse(cx, cy, 11, 7, 0, 0, 7); g.fill(); g.strokeStyle = '#1a0e0a'; g.lineWidth = 2; for (let i = -10; i <= 10; i += 4) { g.beginPath(); g.moveTo(cx + i, cy - 7); g.lineTo(cx + i + 2, cy + 7); g.stroke(); } } });
  const mOrb = new THREE.Mesh(new THREE.PlaneGeometry(.26, .16), new THREE.MeshBasicMaterial({ map: orbTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); mOrb.position.set(0, .17, .152); try { MON.cabeca.add(mOrb); } catch (e) {}
  // (31) Névoa mais densa perto dele (Cap V)
  let fogAlvo = null;
  // vapor "fervendo" quando a chuva toca o corpo de brasa (Cap V ao ar livre)
  const fervura = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.06, .06), new THREE.MeshBasicMaterial({ color: 0x9a9a9a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); fervura.push({ m, t: 0 }); } let fervI = 0, fervCd = 0;
  // (21) Disco de brasa pulsa no chão sob ele (Cap V)
  let discoBrasa = null; try { discoBrasa = new THREE.Mesh(new THREE.CircleGeometry(.7, 18), new THREE.MeshBasicMaterial({ color: 0xff4a14, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); discoBrasa.rotation.x = -R2D; scene.add(discoBrasa); } catch (e) {}

  // ------------------------------------------------------------------
  // ANA
  // (32) Olhos de risco (tally) de muito perto
  const riscoTex = tex(96, 110, (g) => { g.strokeStyle = 'rgba(30,24,22,.9)'; g.lineWidth = 2.5; g.lineCap = 'round'; for (const cx of [34, 62]) { for (let k = 0; k < 4; k++) g.strokeRect ? 0 : 0; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(cx - 9 + k * 5, 38); g.lineTo(cx - 9 + k * 5, 52); g.stroke(); } g.beginPath(); g.moveTo(cx - 12, 54); g.lineTo(cx + 12, 36); g.stroke(); } });
  let anaCab = null, mAnaRisco = null; try { anaCab = ANA_G.userData.cabG; if (anaCab) { mAnaRisco = new THREE.Mesh(new THREE.PlaneGeometry(.2, .24), new THREE.MeshBasicMaterial({ map: riscoTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); mAnaRisco.position.set(0, .01, .124); anaCab.add(mAnaRisco); } } catch (e) {}
  // (34) Vestido encharcado nos túneis (escurece/brilha)
  let anaVestido = []; try { ANA_G.traverse(o => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() !== 0x9a948a && o.material.roughness !== undefined) anaVestido.push({ m: o.material, cor: o.material.color.getHex(), rough: o.material.roughness }); }); } catch (e) {}
  // (35) Ana racha por tempo no Cap V (independente de captura)
  // (33) feixe extra dos olhos no escuro por capítulo — reforço leve
  // Marca de mãozinha molhada na parede quando a Ana escala (túneis)
  const anaMao = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.12, .14), new THREE.MeshBasicMaterial({ color: 0x0c1614, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; scene.add(m); anaMao.push({ m, t: 0 }); } let anaMaoI = 0, anaMaoCd = 0;

  // ------------------------------------------------------------------
  // PROCISSÃO
  // (36) Poeira cai do teto quando a fila para
  const poeiraTeto = []; for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.02, .06), new THREE.MeshBasicMaterial({ color: 0x8a8070, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; scene.add(m); poeiraTeto.push({ m, t: 0, vy: 0 }); } let poeiraTetoI = 0, poeiraTetoCd = 0;
  let procPosAnt = new THREE.Vector3(), procParada = 0;

  // (37) As faces queimadas da Procissão piscam no clarão do relâmpago — reforço (usa luz própria)
  // Chamas da Procissão se curvam na direção da Lia quando a fila para
  let procChamasBase = null;

  // ------------------------------------------------------------------
  // VULTO: proporção errada (mais alto, cabeça torta já no outro módulo; aqui alonga)
  let vultoAlt = 0;

  // ------------------------------------------------------------------
  // overlay próprio (feixe volumétrico, estroboscópio do sino)
  let ov = null, octx = null;
  function garantirOv() { if (ov) return; ov = document.getElementById('l5v2-ov'); if (!ov) { ov = document.createElement('canvas'); ov.id = 'l5v2-ov'; ov.width = 320; ov.height = 180; ov.className = 'fx'; ov.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;opacity:1'; const alvo = document.getElementById('fx-black') || document.body; alvo.parentNode.insertBefore(ov, alvo); } octx = ov.getContext('2d'); }
  let strobo = 0, strTx = .5, strTy = .5;

  // ------------------------------------------------------------------
  // BATCH 2 — mais brasa, corpo de fera, sombra e perseguição
  // (36) Fresta de brasa na venda (Cap V)
  const mFresta = new THREE.Mesh(new THREE.PlaneGeometry(.1, .02), new THREE.MeshBasicMaterial({ color: 0xff5a1e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); mFresta.position.set(0, .18, .147); try { MON.cabeca.add(mFresta); } catch (e) {}
  // (37) Pontas dos dedos com brilho de brasa (Cap V)
  const dedoBrasa = []; try { for (const mao of MON.maos) { const m = new THREE.Mesh(new THREE.SphereGeometry(.02, 5, 4), new THREE.MeshBasicMaterial({ color: 0xff6a20, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.set(0, -.42, 0); mao.add(m); dedoBrasa.push(m); } } catch (e) {}
  // (38) Filete de brasa escorrendo da boca (Cap V)
  const mBrasaBoca = new THREE.Mesh(new THREE.CylinderGeometry(.004, .002, .1, 5), new THREE.MeshBasicMaterial({ color: 0xff4a14, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); mBrasaBoca.position.set(.03, -.12, .14); try { MON.cabeca.add(mBrasaBoca); } catch (e) {}
  // (39) Corcunda nas costas que cresce por capítulo
  const mCorcunda = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 6), MON.faixa ? new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: .95 }) : MAT.preto); mCorcunda.scale.set(1.1, .9, .7); mCorcunda.position.set(0, 2.9, -.22); try { MON.g.add(mCorcunda); mCorcunda.scale.setScalar(0); } catch (e) {}
  // (40) Halo de calor ao redor da cabeça (Cap V)
  let mHalo = null; try { mHalo = new THREE.Mesh(new THREE.TorusGeometry(.2, .05, 6, 16), new THREE.MeshBasicMaterial({ color: 0xff5a1e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); mHalo.rotation.x = R2D; mHalo.position.y = .17; MON.cabeca.add(mHalo); } catch (e) {}
  // (41) Faíscas que saltam do chão sob ele (Cap V)
  const faiscas = []; for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.015, .05), new THREE.MeshBasicMaterial({ color: 0xffb060, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.visible = false; scene.add(m); faiscas.push({ m, t: 0, vy: 0 }); } let faiscaI = 0, faiscaCd = 0;
  // (42) Pegadas chamuscadas em forma de pé (Cap V)
  const peTex = tex(48, 72, (g) => { g.fillStyle = '#000'; g.beginPath(); g.ellipse(24, 44, 14, 24, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(24, 16, 10, 12, 0, 0, 7); g.fill(); });
  const pegadasPe = []; for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.18, .28), new THREE.MeshBasicMaterial({ map: peTex, color: 0xff5a1e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = -R2D; m.visible = false; scene.add(m); pegadasPe.push({ m, t: 0 }); } let pePe = 0, peCd = 0, peLado = 1;
  // (43) Pegadas molhadas nos túneis
  const pegadasAgua = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.16, .24), new THREE.MeshBasicMaterial({ map: peTex, color: 0x9fc0c8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = -R2D; m.visible = false; scene.add(m); pegadasAgua.push({ m, t: 0 }); } let paI = 0, paCd = 0;
  // (44) Poeira do teto cai no caminho dele ao correr
  const poeiraCorre = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.02, .08), new THREE.MeshBasicMaterial({ color: 0x7a7060, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; scene.add(m); poeiraCorre.push({ m, t: 0, vy: 0 }); } let pcI = 0, pcCd = 0, insPosAnt3 = new THREE.Vector3();
  // (45) Cinzas que esfarelam das barras do casaco ao correr
  const cinzaBarra = []; for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.015, .015), new THREE.MeshBasicMaterial({ color: 0x2a2420, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; scene.add(m); cinzaBarra.push({ m, t: 0, vy: 0 }); } let cbI = 0, cbCd = 0;
  // (46) Sombra adiantada que dobra a esquina antes dele
  let mSombraAdiante = null; try { mSombraAdiante = new THREE.Mesh(new THREE.PlaneGeometry(.9, 2.2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); mSombraAdiante.position.y = 1.1; scene.add(mSombraAdiante); } catch (e) {}
  // (48) Chuva escorre pelo corpo (overlay, Cap V ao ar livre) — streaks guardados p/ overlay
  // (51) Cabelo/corpo da Ana balança como na água (tilt)
  // (52) Dentes num sorriso rachado de perto (Ana)
  const dentesAnaTex = tex(96, 48, (g) => { g.fillStyle = 'rgba(230,224,210,.9)'; for (let i = 0; i < 8; i++) { const x = 16 + i * 8; g.beginPath(); g.moveTo(x, 10); g.lineTo(x - 3, 34 + rand(0, 8)); g.lineTo(x + 3, 34 + rand(0, 8)); g.closePath(); g.fill(); } g.strokeStyle = 'rgba(30,20,18,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(10, 10); g.lineTo(84, 12); g.stroke(); });
  let mAnaDentes = null; try { if (anaCab) { mAnaDentes = new THREE.Mesh(new THREE.PlaneGeometry(.16, .08), new THREE.MeshBasicMaterial({ map: dentesAnaTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); mAnaDentes.position.set(0, -.06, .125); anaCab.add(mAnaDentes); } } catch (e) {}
  // (53) Olhos da Ana piscam em contratempo (pálpebras)
  const mAnaPalp = []; try { if (anaCab) for (const sx of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.05, .03), new THREE.MeshBasicMaterial({ color: 0x6a6258, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); m.position.set(sx * .045, .04, .126); anaCab.add(m); mAnaPalp.push(m); } } catch (e) {} let palpCd = 0, palpOn = 0;
  // (54) Gotas escorrem do vestido da Ana nos túneis
  const anaGotas = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.01, 5, 4), new THREE.MeshStandardMaterial({ color: 0x0a1210, roughness: .1 })); m.visible = false; scene.add(m); anaGotas.push({ m, t: 0 }); } let agI = 0, agCd = 0;
  // (56) A fila da Procissão projeta sombras-silhueta extras
  const procSombras = []; try { for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.4, 1.3), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = -R2D; m.visible = false; scene.add(m); procSombras.push(m); } } catch (e) {}
  // (57) Rostos da Procissão choram tinta preta quando a luz passa
  const procTinta = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.008, 5, 4), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: .3 })); m.visible = false; scene.add(m); procTinta.push({ m, t: 0 }); } let ptI = 0, ptCd = 0;
  // (58) Vulto pisca entre duas poses por um quadro
  let vultoPiscaCd = rand(2, 5);
  // (47) Clarão laranja curto no bote (Cap V) — flag p/ overlay
  let flashLaranja = 0;
  let chuvaCorpo = 0;

  function extra(dt, st, cap, pf, reduz, d, foco, perto, caca, bote, lit, ativoM) {
    const furia = M.furia || 0;
    if (ativoM) {
      // (36) fresta de brasa na venda
      mFresta.material.opacity = lerp(mFresta.material.opacity, cap >= 5 ? .4 + Math.sin(pf * 4) * .2 : 0, Math.min(1, dt * 4));
      // (37) dedos com brasa
      for (const m of dedoBrasa) m.material.opacity = lerp(m.material.opacity, cap >= 5 ? (.3 + (bote ? .5 : 0) + Math.sin(pf * 3) * .1) * clamp(1 - d / 10, 0, 1) : 0, Math.min(1, dt * 4));
      // (38) filete de brasa da boca
      mBrasaBoca.material.opacity = lerp(mBrasaBoca.material.opacity, cap >= 5 && (caca || bote) ? .7 : 0, Math.min(1, dt * 4));
      // (39) corcunda cresce por capítulo
      try { mCorcunda.scale.setScalar(lerp(mCorcunda.scale.x, clamp(cap - 2, 0, 3) * .4, Math.min(1, dt * 2))); } catch (e) {}
      // (40) halo de calor
      if (mHalo) { mHalo.material.opacity = lerp(mHalo.material.opacity, cap >= 5 ? (.12 + Math.sin(pf * 2) * .06) * clamp(1 - d / 8, 0, 1) : 0, Math.min(1, dt * 3)); mHalo.scale.setScalar(1 + Math.sin(pf * 2) * .08); }
      // (41) faíscas do chão (Cap V)
      if (cap >= 5 && (caca || bote) && (faiscaCd -= dt) <= 0 && !reduz) { faiscaCd = .18; const f = faiscas[faiscaI++ % faiscas.length]; f.m.visible = true; f.t = .6; f.vy = rand(1, 2); f.m.position.set(M.pos.x + rand(-.3, .3), .05, M.pos.z + rand(-.3, .3)); }
      // (42) pegadas de pé chamuscadas (Cap V)
      const movPe = M.pos.distanceTo(insPosAnt3);
      if (cap >= 5 && movPe > .02 && (peCd -= dt) <= 0 && !reduz) { peCd = .35; peLado = -peLado; const p = pegadasPe[pePe++ % pegadasPe.length]; p.m.visible = true; p.t = 2.5; const ang = MON.g.rotation.y; p.m.position.set(M.pos.x + Math.cos(ang) * peLado * .12, .03, M.pos.z - Math.sin(ang) * peLado * .12); p.m.rotation.z = -ang; }
      // (43) pegadas molhadas (túneis)
      if (W.mapa === 'tuneis' && movPe > .02 && (paCd -= dt) <= 0 && !reduz) { paCd = .4; const p = pegadasAgua[paI++ % pegadasAgua.length]; p.m.visible = true; p.t = 4; p.m.position.set(M.pos.x + rand(-.1, .1), .03, M.pos.z + rand(-.1, .1)); }
      // (44) poeira do teto ao correr
      if (caca && movPe > .03 && (pcCd -= dt) <= 0 && !reduz) { pcCd = .25; const p = poeiraCorre[pcI++ % poeiraCorre.length]; p.m.visible = true; p.t = 1.4; p.vy = 0; p.m.position.set(M.pos.x + rand(-.3, .3), 2.6, M.pos.z + rand(-.3, .3)); }
      // (45) cinzas das barras ao correr (Cap IV+)
      if (cap >= 4 && caca && (cbCd -= dt) <= 0 && !reduz) { cbCd = .2; const c = cinzaBarra[cbI++ % cinzaBarra.length]; c.m.visible = true; c.t = 1.2; c.vy = -.2; c.m.position.set(M.pos.x + rand(-.2, .2), rand(.6, 1.2), M.pos.z + rand(-.2, .2)); }
      insPosAnt3.copy(M.pos);
      // (46) sombra adiantada que dobra a esquina
      if (mSombraAdiante) { const ang = MON.g.rotation.y; mSombraAdiante.position.set(M.pos.x + Math.sin(ang) * 2.2, 1.1 + cap * .1, M.pos.z + Math.cos(ang) * 2.2); try { mSombraAdiante.lookAt(camera.position.x, 1.1, camera.position.z); } catch (e) {} mSombraAdiante.scale.set(1 + cap * .1, 1 + cap * .15, 1); mSombraAdiante.material.opacity = lerp(mSombraAdiante.material.opacity, (caca && !reduz) ? clamp(.3 + cap * .04, 0, .55) : 0, Math.min(1, dt * 2)); }
      // (47) clarão laranja no bote (Cap V)
      if (cap >= 5 && bote && estAnt2 !== M.state) flashLaranja = .5;
      // (48) chuva escorre pelo corpo (overlay) quando perto no cemitério/estrada, Cap V
      const cc = (cap >= 5 && (W.mapa === 'cemiterio' || W.mapa === 'estrada') && d < 5) ? clamp(1 - d / 5, 0, 1) : 0;
      chuvaCorpo = lerp(chuvaCorpo, cc, Math.min(1, dt * 3));
      estAnt2 = M.state;
    } else {
      mFresta.material.opacity = Math.max(0, mFresta.material.opacity - dt * 3);
      for (const m of dedoBrasa) m.material.opacity = Math.max(0, m.material.opacity - dt * 3);
      mBrasaBoca.material.opacity = 0; if (mHalo) mHalo.material.opacity = 0;
      if (mSombraAdiante) mSombraAdiante.material.opacity = Math.max(0, mSombraAdiante.material.opacity - dt * 3);
      chuvaCorpo = lerp(chuvaCorpo, 0, Math.min(1, dt * 3));
    }
    flashLaranja = Math.max(0, flashLaranja - dt * 2);

    // (51/52/53/54) ANA extra
    if (ANA.ativa && ANA_G.visible && anaCab) {
      const ad = ANA.pos.distanceTo(camera.position);
      try { if (W.mapa === 'tuneis') anaCab.rotation.z = lerp(anaCab.rotation.z, Math.sin(pf * 1.2) * .12, Math.min(1, dt * 2)); } catch (e) {}
      if (mAnaDentes) mAnaDentes.material.opacity = lerp(mAnaDentes.material.opacity, (ad < 1.8 && ANA.vista) ? .85 : 0, Math.min(1, dt * 5));
      // pálpebras em contratempo enquanto conta
      if (!ANA.vista && (ANA.conta || 0) > 0) { if ((palpCd -= dt) <= 0) { palpCd = rand(.4, .9); palpOn = .12; } }
      palpOn = Math.max(0, palpOn - dt);
      for (const m of mAnaPalp) m.material.opacity = palpOn > 0 ? .9 : 0;
      if (W.mapa === 'tuneis' && ANA.vista && (agCd -= dt) <= 0 && !reduz) { agCd = rand(.4, 1); const g = anaGotas[agI++ % anaGotas.length]; g.m.visible = true; g.t = 1.2; g.m.position.set(ANA.pos.x + rand(-.1, .1), rand(.6, 1.2), ANA.pos.z + rand(-.05, .05)); }
    } else { if (mAnaDentes) mAnaDentes.material.opacity = Math.max(0, mAnaDentes.material.opacity - dt * 3); for (const m of mAnaPalp) m.material.opacity = 0; }

    // (56/57) PROCISSÃO extra
    if (PROC.g && PROC.g.visible && PROC.filhos) {
      const ver = st.flashOn && !pisca() && visivel(PROC.pos, 1, 12);
      // sombras extras no chão (mais figuras do que há)
      procSombras.forEach((m, i) => { const base = PROC.filhos[i % PROC.filhos.length]; if (!base) return; try { base.getWorldPosition(_a); const ang = Math.atan2(camera.position.x - _a.x, camera.position.z - _a.z); m.position.set(_a.x + Math.sin(ang + i) * .6, .02, _a.z + Math.cos(ang + i) * .6); m.rotation.z = -ang; m.visible = ver; m.material.opacity = lerp(m.material.opacity, ver && !reduz ? .4 : 0, Math.min(1, dt * 3)); } catch (e) {} });
      // tinta preta escorrendo dos rostos
      if (ver && (ptCd -= dt) <= 0 && !reduz) { ptCd = .4; const t = procTinta[ptI++ % procTinta.length]; const base = PROC.filhos[(Math.random() * PROC.filhos.length) | 0]; try { base.getWorldPosition(_a); t.m.visible = true; t.t = 1; t.m.position.copy(_a).add(_b.set(rand(-.08, .08), 1, .1)); } catch (e) {} }
    } else { for (const m of procSombras) m.material.opacity = 0; }

    // (58) Vulto pisca entre poses
    try { if (VULTO.g.visible) { if ((vultoPiscaCd -= dt) <= 0) { vultoPiscaCd = rand(2, 5); VULTO.g.scale.x = VULTO.g.scale.x > .9 ? .7 : 1.1; } } } catch (e) {}

    // partículas batch2
    for (const f of faiscas) if (f.m.visible) { f.t -= dt; f.m.position.y += f.vy * dt; f.vy -= dt * 4; f.m.material.opacity = clamp(f.t / .6, 0, 1); if (f.t <= 0) f.m.visible = false; }
    for (const p of pegadasPe) if (p.m.visible) { p.t -= dt; const k = clamp(p.t / 2.5, 0, 1); p.m.material.opacity = k * .6; p.m.material.color.setRGB(1, .35 * k, .1 * k); if (p.t <= 0) p.m.visible = false; }
    for (const p of pegadasAgua) if (p.m.visible) { p.t -= dt; p.m.material.opacity = clamp(p.t / 4, 0, 1) * .4; if (p.t <= 0) p.m.visible = false; }
    for (const p of poeiraCorre) if (p.m.visible) { p.t -= dt; p.vy += dt * .6; p.m.position.y -= p.vy * dt; p.m.material.opacity = clamp(p.t / 1.4, 0, 1) * .4; if (p.t <= 0 || p.m.position.y < .1) p.m.visible = false; }
    for (const c of cinzaBarra) if (c.m.visible) { c.t -= dt; c.m.position.y += c.vy * dt; try { c.m.lookAt(camera.position); } catch (e) {} c.m.material.opacity = clamp(c.t / 1.2, 0, 1) * .5; if (c.t <= 0) c.m.visible = false; }
    for (const g of anaGotas) if (g.m.visible) { g.t -= dt; g.m.position.y -= dt * 1.2; if (g.t <= 0 || g.m.position.y < .05) g.m.visible = false; }
    for (const t of procTinta) if (t.m.visible) { t.t -= dt; t.m.position.y -= dt * .6; if (t.t <= 0 || t.m.position.y < .2) t.m.visible = false; }
  }
  let estAnt2 = '';

  // ------------------------------------------------------------------
  // BATCH 3 — sujeira por mapa, mais fogo, sombra e perseguição
  // (59) Sujeira do casaco muda por mapa (teia no térreo, giz em cima, limo nos túneis, lama no cemitério)
  function sujeiraTex(cor, pts) { return tex(96, 128, (g) => { g.fillStyle = cor; for (let i = 0; i < pts; i++) g.fillRect(rand(10, 82), rand(10, 118), rand(3, 10), rand(2, 7)); }); }
  const SUJ = { terreo: sujeiraTex('rgba(170,165,150,.35)', 26), superior: sujeiraTex('rgba(220,214,200,.4)', 30), tuneis: sujeiraTex('rgba(60,90,70,.4)', 34), cemiterio: sujeiraTex('rgba(70,55,40,.45)', 34) };
  const mSujeira = new THREE.Mesh(new THREE.PlaneGeometry(.5, .7), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); mSujeira.position.set(0, 2.5, .27); try { MON.g.add(mSujeira); } catch (e) {} let sujMapa = '';
  // (60) Giz branco nas mãos (superior) — pozinho nas pontas
  const giz = []; try { for (const mao of MON.maos) { const m = new THREE.Mesh(new THREE.SphereGeometry(.03, 5, 4), new THREE.MeshBasicMaterial({ color: 0xe8e2d0, transparent: true, opacity: 0, depthWrite: false })); m.position.y = -.4; mao.add(m); giz.push(m); } } catch (e) {}
  // (63) Centelhas que sobem da boca quando ele range os dentes na caça (Cap V)
  const centBoca = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.01, .03), new THREE.MeshBasicMaterial({ color: 0xffc070, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.visible = false; scene.add(m); centBoca.push({ m, t: 0, vy: 0 }); } let cbocI = 0, cbocCd = 0;
  // (64) O disco de brasa esquenta com o tempo de caça
  let cacaTempo = 0;
  // (65) Fumaça preta sobe da corcunda (Cap V)
  const fumCorc = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.15, .2), new THREE.MeshBasicMaterial({ color: 0x15120f, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; scene.add(m); fumCorc.push({ m, t: 0 }); } let fcI = 0, fcCd = 0;
  // (66) Brasa ilumina o teto acima dele (Cap V)
  let mTeto = null; try { mTeto = new THREE.Mesh(new THREE.CircleGeometry(1, 16), new THREE.MeshBasicMaterial({ color: 0xff4a14, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); mTeto.rotation.x = R2D; scene.add(mTeto); } catch (e) {}
  // (69) Reflexo esticado da Ana no chão molhado dos túneis
  let mAnaRefl = null; try { mAnaRefl = new THREE.Mesh(new THREE.PlaneGeometry(.4, 1.6), new THREE.MeshBasicMaterial({ color: 0x1a2422, transparent: true, opacity: 0, depthWrite: false })); mAnaRefl.rotation.x = -R2D; scene.add(mAnaRefl); } catch (e) {}
  // (70) Rasgos no vestido da Ana por captura
  const rasgoTex = tex(96, 110, (g) => { g.strokeStyle = 'rgba(10,8,8,.8)'; g.lineCap = 'round'; for (let i = 0; i < 6; i++) { g.lineWidth = rand(2, 5); let x = rand(16, 80), y = rand(40, 100); g.beginPath(); g.moveTo(x, y); g.lineTo(x + rand(-10, 10), y + rand(10, 24)); g.stroke(); } });
  let mAnaRasgo = null; try { if (anaCab === null) anaCab = ANA_G.userData && ANA_G.userData.cabG; } catch (e) {}
  try { mAnaRasgo = new THREE.Mesh(new THREE.PlaneGeometry(.28, .4), new THREE.MeshBasicMaterial({ map: rasgoTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); mAnaRasgo.position.set(0, .9, .13); ANA_G.add(mAnaRasgo); } catch (e) {}
  // (71) Rastro de água escura da Ana / (72) cera da Procissão / (77/78) marcas de mão e garra: decals próprios
  const decal3 = []; for (let i = 0; i < 20; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.2, .2), new THREE.MeshBasicMaterial({ color: 0x0c1614, transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = -R2D; m.visible = false; scene.add(m); decal3.push({ m, t: 0, vida: 1 }); } let d3I = 0;
  function decal(x, z, tam, cor, vida, parede) { const d = decal3[d3I++ % decal3.length]; d.m.visible = true; d.t = vida; d.vida = vida; d.m.position.set(x, parede ? 1.1 : .03, z); d.m.rotation.x = parede ? 0 : -R2D; d.m.scale.setScalar(tam); if (d.m.material.color) d.m.material.color.setHex(cor); }
  let anaDecCd = 0, procCeraCd = 0, procPosAnt3 = new THREE.Vector3(), procParada3 = 0;
  // (74) Fiapos de fumaça pelo cemitério no Cap V (ambiente)
  const fumAmb = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.3, .5), new THREE.MeshBasicMaterial({ color: 0x2a2824, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; scene.add(m); fumAmb.push({ m, t: 0 }); } let faI = 0, faCd2 = 0;
  // (76) Pingos de brasa caem das mãos (Cap V)
  const pingoBrasa = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(.012, 5, 4), new THREE.MeshBasicMaterial({ color: 0xff5a1e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.visible = false; scene.add(m); pingoBrasa.push({ m, t: 0, vy: 0 }); } let pbI = 0, pbCd = 0;
  // (79) Vapor sobe das poças quando ele passa (túneis)
  const vaporPoca = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.2, .3), new THREE.MeshBasicMaterial({ color: 0x8a9a98, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); m.visible = false; scene.add(m); vaporPoca.push({ m, t: 0 }); } let vpI = 0, vpCd = 0;
  // (80) Brilho molhado (suor/sangue) sobre a venda quando iluminada
  const mSuor = new THREE.Mesh(new THREE.PlaneGeometry(.12, .08), new THREE.MeshBasicMaterial({ color: 0xff8060, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); mSuor.position.set(0, .2, .148); try { MON.cabeca.add(mSuor); } catch (e) {}
  // (81) Barras do casaco esvoaçam ao correr
  const barras = []; try { for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.18, .35), new THREE.MeshStandardMaterial({ color: 0x0a0a0b, roughness: .95, side: THREE.DoubleSide })); m.position.set((i - 1) * .14, 1.2, .1); MON.g.add(m); barras.push({ m, ph: rand(0, 7) }); } } catch (e) {}
  // (83) Rachaduras de brasa no pescoço (Cap V)
  const mBrasaPesc = new THREE.Mesh(new THREE.PlaneGeometry(.1, .18), new THREE.MeshBasicMaterial({ map: (brasaLados[0] ? brasaLados[0].material.map : null), color: 0xff5a1e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); mBrasaPesc.position.set(0, 3.42, .09); try { MON.g.add(mBrasaPesc); } catch (e) {}
  // (85) Marcadores de brasa no rastro de cheiro que ele farejou
  const rastroCheiro = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.CircleGeometry(.1, 10), new THREE.MeshBasicMaterial({ color: 0xff5a1e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = -R2D; m.visible = false; scene.add(m); rastroCheiro.push({ m, t: 0 }); } let rcI = 0, rcCd = 0;
  // (86) Vulto deixa trilha de fumaça ao deslizar
  const vultoFum = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.3, .5), new THREE.MeshBasicMaterial({ color: 0x101010, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; scene.add(m); vultoFum.push({ m, t: 0 }); } let vfI = 0, vfCd = 0, vultoPosAnt = new THREE.Vector3();
  // (90) O relâmpago revela a Procissão inteira por um quadro
  // (91) jitter do modelo no pico do relâmpago
  // (92) faíscas quando as garras raspam a parede na caça
  const faiscaParede = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.015, .04), new THREE.MeshBasicMaterial({ color: 0xffd080, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.visible = false; scene.add(m); faiscaParede.push({ m, t: 0, vy: 0 }); } let fpI = 0, fpCd = 0;
  let notch = 0, wallSil = 0, raioJit = 0, vapPosAnt = new THREE.Vector3();

  function extra3(dt, st, cap, pf, reduz, d, foco, perto, caca, bote, lit, ativoM) {
    const furia = M.furia || 0;
    if (ativoM) {
      // (59) sujeira por mapa
      if (sujMapa !== W.mapa) { sujMapa = W.mapa; const t = SUJ[W.mapa]; if (t) { mSujeira.material.map = t; mSujeira.material.needsUpdate = true; } }
      mSujeira.material.opacity = lerp(mSujeira.material.opacity, (SUJ[W.mapa] && perto > .08) ? .6 : 0, Math.min(1, dt * 4));
      // (60) giz nas mãos (superior)
      for (const m of giz) m.material.opacity = lerp(m.material.opacity, (W.mapa === 'superior' && perto > .1) ? .7 : 0, Math.min(1, dt * 4));
      // (63) centelhas da boca
      if (cap >= 5 && caca && (cbocCd -= dt) <= 0 && !reduz) { cbocCd = .2; const c = centBoca[cbocI++ % centBoca.length]; c.m.visible = true; c.t = .7; c.vy = rand(.5, 1.2); try { MON.cabeca.getWorldPosition(_c); c.m.position.copy(_c).add(_b.set(rand(-.03, .03), -.05, .12)); } catch (e) {} }
      // (64) disco esquenta com o tempo de caça
      cacaTempo = caca ? Math.min(6, cacaTempo + dt) : Math.max(0, cacaTempo - dt * 2);
      if (discoBrasa && cap >= 5) discoBrasa.material.opacity = Math.max(discoBrasa.material.opacity, clamp(cacaTempo / 6, 0, 1) * .25);
      // (65) fumaça da corcunda
      if (cap >= 5 && (fcCd -= dt) <= 0 && !reduz) { fcCd = .4; const f = fumCorc[fcI++ % fumCorc.length]; f.m.visible = true; f.t = 1.8; try { mCorcunda.getWorldPosition(_c); f.m.position.copy(_c); } catch (e) {} }
      // (66) brasa no teto
      if (mTeto) { mTeto.position.set(M.pos.x, 2.7, M.pos.z); mTeto.material.opacity = lerp(mTeto.material.opacity, cap >= 5 ? (.08 + Math.sin(pf * 3) * .04) : 0, Math.min(1, dt * 3)); }
      // (76) pingos de brasa das mãos
      if (cap >= 5 && (pbCd -= dt) <= 0 && !reduz) { pbCd = .3; const p = pingoBrasa[pbI++ % pingoBrasa.length]; p.m.visible = true; p.t = 1; p.vy = 0; try { MON.maos[(Math.random() * MON.maos.length) | 0].getWorldPosition(_c); p.m.position.copy(_c); } catch (e) {} }
      // (79) vapor das poças (túneis)
      const movVap = M.pos.distanceTo(vapPosAnt); vapPosAnt.copy(M.pos);
      if (W.mapa === 'tuneis' && (vpCd -= dt) <= 0 && !reduz && movVap > .015) { vpCd = .5; const v = vaporPoca[vpI++ % vaporPoca.length]; v.m.visible = true; v.t = 1.4; v.m.position.set(M.pos.x, .2, M.pos.z); }
      // (80) brilho molhado na venda
      mSuor.material.opacity = lerp(mSuor.material.opacity, perto > .2 ? .25 + Math.sin(pf * 4) * .08 : 0, Math.min(1, dt * 5));
      // (81) barras esvoaçam ao correr
      for (const b of barras) { b.ph += dt * (caca ? 8 : 3); b.m.rotation.x = Math.sin(b.ph) * (caca ? .5 : .15); b.m.rotation.z = Math.cos(b.ph * .7) * .1; }
      // (83) brasa no pescoço
      mBrasaPesc.material.opacity = lerp(mBrasaPesc.material.opacity, cap >= 5 ? (.2 + Math.sin(pf * 3) * .12) * clamp(1 - d / 8, 0, 1) : 0, Math.min(1, dt * 4));
      // (85) rastro de cheiro em brasa quando fareja
      if (M.state === 'fareja' && (rcCd -= dt) <= 0 && !reduz) { rcCd = .5; const r = rastroCheiro[rcI++ % rastroCheiro.length]; r.m.visible = true; r.t = 2; const ang = MON.g.rotation.y; r.m.position.set(M.pos.x + Math.sin(ang) * rand(.5, 1.5), .03, M.pos.z + Math.cos(ang) * rand(.5, 1.5)); }
      // (92) faíscas quando as garras raspam a parede na caça (Cap IV+)
      if (cap >= 4 && caca && (fpCd -= dt) <= 0 && !reduz && Math.random() < .5) { fpCd = .25; const f = faiscaParede[fpI++ % faiscaParede.length]; f.m.visible = true; f.t = .5; f.vy = rand(.3, .8); const ang = MON.g.rotation.y; f.m.position.set(M.pos.x - Math.cos(ang) * .3, rand(1, 1.6), M.pos.z + Math.sin(ang) * .3); }
      // (67) recorte escuro no facho quando aponta nele
      notch = lerp(notch, (foco > .5 && d < 6) ? foco : 0, Math.min(1, dt * 5));
      // (91) jitter do modelo no pico do relâmpago
      if (raioI() > .3) { raioJit = raioI() * .02; try { MON.g.rotation.z = Math.sin(pf * 40) * raioJit; } catch (e) {} } else if (Math.abs(MON.g.rotation.z) > .001) { try { MON.g.rotation.z = lerp(MON.g.rotation.z, 0, Math.min(1, dt * 6)); } catch (e) {} }
    } else {
      mSujeira.material.opacity = Math.max(0, mSujeira.material.opacity - dt * 3);
      for (const m of giz) m.material.opacity = 0; mSuor.material.opacity = 0; mBrasaPesc.material.opacity = 0;
      if (mTeto) mTeto.material.opacity = Math.max(0, mTeto.material.opacity - dt * 3);
      notch = lerp(notch, 0, Math.min(1, dt * 4));
    }

    // (68/90) relâmpago: silhueta na parede + revela a Procissão
    wallSil = lerp(wallSil, (ativoM && raioI() > .25 && (lit || true)) ? raioI() : 0, Math.min(1, dt * 8));
    if (raioI() > .2 && PROC.g && PROC.g.visible && PROC.filhos) { PROC.filhos.forEach((s) => { try { s.traverse(o => { if (o.isMesh && o.material && o.material.transparent && o.material.opacity > 0 && o.material.opacity < .95 && !o.material.map) o.material.opacity = Math.min(1, o.material.opacity + raioI() * .5); }); } catch (e) {} }); }

    // (69) reflexo da Ana no chão molhado (túneis)
    if (mAnaRefl) { const on = (ANA.ativa && ANA_G.visible && W.mapa === 'tuneis' && ANA.vista); if (on) { mAnaRefl.position.set(ANA.pos.x, .02, ANA.pos.z + .3); try { mAnaRefl.lookAt(camera.position.x, .02, camera.position.z); mAnaRefl.rotation.x = -R2D; } catch (e) {} } mAnaRefl.material.opacity = lerp(mAnaRefl.material.opacity, on && !reduz ? .4 : 0, Math.min(1, dt * 3)); }
    // (70) rasgos no vestido por captura
    if (mAnaRasgo) mAnaRasgo.material.opacity = lerp(mAnaRasgo.material.opacity, (ANA.ativa && ANA_G.visible) ? Math.min(.8, ((ANA.capturas || 0) + ((st.chapter | 0) >= 5 ? 1 : 0)) * .25) : 0, Math.min(1, dt * 3));
    // (71) rastro de água escura da Ana
    if (ANA.ativa && ANA_G.visible && !ANA.vista && (anaDecCd -= dt) <= 0 && !reduz) { anaDecCd = .6; decal(ANA.pos.x + rand(-.1, .1), ANA.pos.z + rand(-.1, .1), .3, 0x08120f, 8); }

    // (72) cera da Procissão + (73) facho no teto quando param
    if (PROC.g && PROC.g.visible) {
      const parada = PROC.pos.distanceTo(procPosAnt3) < .003; procPosAnt3.copy(PROC.pos); procParada3 = parada ? procParada3 + dt : 0;
      if ((procCeraCd -= dt) <= 0 && !reduz) { procCeraCd = .8; decal(PROC.pos.x + rand(-.6, .6), PROC.pos.z + rand(-.6, .6), .18, 0xc8b88a, 20); }
    }

    // (74) fumaça ambiente do cemitério (Cap V)
    if (cap >= 5 && W.mapa === 'cemiterio' && (faCd2 -= dt) <= 0 && !reduz) { faCd2 = .6; const f = fumAmb[faI++ % fumAmb.length]; f.m.visible = true; f.t = 3; f.m.position.set(camera.position.x + rand(-6, 6), .3, camera.position.z + rand(-6, 6)); }

    // (86) vulto trilha de fumaça
    try { if (VULTO.g.visible) { VULTO.g.getWorldPosition(_a); if (_a.distanceTo(vultoPosAnt) > .1 && (vfCd -= dt) <= 0 && !reduz) { vfCd = .2; const f = vultoFum[vfI++ % vultoFum.length]; f.m.visible = true; f.t = 1; f.m.position.copy(_a).setY(1.2); } vultoPosAnt.copy(_a); } } catch (e) {}

    // partículas batch3
    for (const c of centBoca) if (c.m.visible) { c.t -= dt; c.m.position.y += c.vy * dt; c.vy -= dt * 2; try { c.m.lookAt(camera.position); } catch (e) {} c.m.material.opacity = clamp(c.t / .7, 0, 1); if (c.t <= 0) c.m.visible = false; }
    for (const f of fumCorc) if (f.m.visible) { f.t -= dt; f.m.position.y += dt * .4; f.m.scale.setScalar(1 + (1.8 - f.t)); try { f.m.lookAt(camera.position); } catch (e) {} f.m.material.opacity = clamp(f.t / 1.8, 0, 1) * .3; if (f.t <= 0) f.m.visible = false; }
    for (const p of pingoBrasa) if (p.m.visible) { p.t -= dt; p.vy += dt * 2; p.m.position.y -= p.vy * dt; p.m.material.opacity = clamp(p.t, 0, 1) * .7; if (p.t <= 0 || p.m.position.y < .05) p.m.visible = false; }
    for (const v of vaporPoca) if (v.m.visible) { v.t -= dt; v.m.position.y += dt * .4; v.m.scale.setScalar(1 + (1.4 - v.t)); try { v.m.lookAt(camera.position); } catch (e) {} v.m.material.opacity = clamp(v.t / 1.4, 0, 1) * .16; if (v.t <= 0) v.m.visible = false; }
    for (const r of rastroCheiro) if (r.m.visible) { r.t -= dt; r.m.material.opacity = clamp(r.t / 2, 0, 1) * .3; if (r.t <= 0) r.m.visible = false; }
    for (const f of fumAmb) if (f.m.visible) { f.t -= dt; f.m.position.y += dt * .25; try { f.m.lookAt(camera.position); } catch (e) {} f.m.material.opacity = clamp(f.t / 3, 0, 1) * .1; if (f.t <= 0) f.m.visible = false; }
    for (const f of faiscaParede) if (f.m.visible) { f.t -= dt; f.m.position.y += f.vy * dt; f.vy -= dt * 4; f.m.material.opacity = clamp(f.t / .5, 0, 1); if (f.t <= 0) f.m.visible = false; }
    for (const f of vultoFum) if (f.m.visible) { f.t -= dt; f.m.position.y += dt * .3; try { f.m.lookAt(camera.position); } catch (e) {} f.m.material.opacity = clamp(f.t, 0, 1) * .2; if (f.t <= 0) f.m.visible = false; }
    for (const d of decal3) if (d.m.visible) { d.t -= dt; d.m.material.opacity = clamp(d.t / d.vida, 0, 1) * .5; if (d.t <= 0) d.m.visible = false; }
    if (mapaAnt3 !== W.mapa) { mapaAnt3 = W.mapa; for (const arr of [centBoca, fumCorc, pingoBrasa, vaporPoca, rastroCheiro, fumAmb, faiscaParede, vultoFum, decal3]) for (const o of arr) { o.m.visible = false; o.t = 0; } }
  }
  let mapaAnt3 = '';

  // ------------------------------------------------------------------
  // BATCH 4 — últimos toques: humano no começo, brasa do sino, tremor e gelo
  // (79) Cap I quase humano: pele e venda limpas, realce de rosto de homem
  const humanoTex = tex(96, 128, (g) => { g.fillStyle = 'rgba(150,120,100,.25)'; g.beginPath(); g.ellipse(48, 70, 34, 46, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(60,45,38,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(40, 96); g.quadraticCurveTo(48, 100, 56, 96); g.stroke(); });
  const mHumano = new THREE.Mesh(new THREE.PlaneGeometry(.28, .38), new THREE.MeshBasicMaterial({ map: humanoTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); mHumano.position.set(0, .1, .137); try { MON.cabeca.add(mHumano); } catch (e) {}
  // (82) Marca de mão queimada no chão (Cap V, quadrúpede)
  const maoTex = tex(64, 64, (g) => { g.fillStyle = '#000'; g.beginPath(); g.ellipse(32, 40, 12, 14, 0, 0, 7); g.fill(); for (let i = 0; i < 5; i++) { const a = (i - 2) * .4; g.save(); g.translate(32, 28); g.rotate(a); g.fillRect(-2.5, -18, 5, 18); g.restore(); } });
  const maoPool = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.2, .2), new THREE.MeshBasicMaterial({ map: maoTex, color: 0xff5a1e, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = -R2D; m.visible = false; scene.add(m); maoPool.push({ m, t: 0 }); } let maoI = 0, maoCd = 0;
  // (83) Barras do casaco queimam/escurecem por capítulo — guarda as barras
  // (84) mancha de fuligem na lanterna (overlay) / (86) tremor / (91) âmbar da Procissão: flags
  // (87) Reflexo de brasa no chão molhado (Cap V)
  let mReflBrasa = null; try { mReflBrasa = new THREE.Mesh(new THREE.PlaneGeometry(.5, 1.2), new THREE.MeshBasicMaterial({ color: 0xff4a14, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); mReflBrasa.rotation.x = -R2D; scene.add(mReflBrasa); } catch (e) {}
  // (88) Interior da boca em brasa (Cap V, caça)
  const mBocaBrasa = new THREE.Mesh(new THREE.PlaneGeometry(.06, .14), new THREE.MeshBasicMaterial({ color: 0xff4a14, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); mBocaBrasa.position.set(0, -.07, .137); try { MON.cabeca.add(mBocaBrasa); } catch (e) {}
  // (92) Hálito vira cristais de gelo no ar (túneis)
  const cristais = []; for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.012, .012), new THREE.MeshBasicMaterial({ color: 0xcfe0e8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); m.visible = false; scene.add(m); cristais.push({ m, t: 0 }); } let crI = 0, crCd = 0;
  let fuligemLanterna = 0, tremor = 0, procAmbar = 0, desistiuAnt = ''; const _cinzaAzul = new THREE.Color(0x3a444a);

  function extra4(dt, st, cap, pf, reduz, d, foco, perto, caca, bote, lit, ativoM) {
    const furia = M.furia || 0, sino = st.flags && st.flags.sino;
    if (ativoM) {
      // (79) quase humano no Cap 0-1
      mHumano.material.opacity = lerp(mHumano.material.opacity, (cap <= 1 && perto > .1) ? .6 : 0, Math.min(1, dt * 4));
      // (80) queixo treme ao farejar
      if (M.state === 'fareja' && MON.boca) { try { MON.boca.position.x = Math.sin(pf * 30) * .006; } catch (e) {} } else if (MON.boca && Math.abs(MON.boca.position.x) > .0005) { try { MON.boca.position.x = lerp(MON.boca.position.x, 0, Math.min(1, dt * 8)); } catch (e) {} }
      // (81) ombros sobem/descem com a respiração
      try { const r = Math.sin(perf() * (caca ? 5 : 2.2)) * (caca ? .04 : .02); MON.armL.position.y = 3.2 + r; MON.armR.position.y = 3.2 + r; } catch (e) {}
      // (82) marca de mão queimada no chão no Cap V em movimento
      if (cap >= 5 && caca && (maoCd -= dt) <= 0 && !reduz) { maoCd = .5; const p = maoPool[maoI++ % maoPool.length]; p.m.visible = true; p.t = 2.5; const ang = MON.g.rotation.y; p.m.position.set(M.pos.x + Math.sin(ang) * .4 + rand(-.2, .2), .03, M.pos.z + Math.cos(ang) * .4 + rand(-.2, .2)); p.m.rotation.z = rand(0, 7); }
      // (87) reflexo de brasa no chão molhado
      if (mReflBrasa) { const on = cap >= 5 && (W.mapa === 'tuneis' || W.mapa === 'cemiterio'); mReflBrasa.position.set(M.pos.x, .025, M.pos.z + .4); try { mReflBrasa.lookAt(camera.position.x, .025, camera.position.z); mReflBrasa.rotation.x = -R2D; } catch (e) {} mReflBrasa.material.opacity = lerp(mReflBrasa.material.opacity, on ? (.12 + Math.sin(pf * 3) * .05) : 0, Math.min(1, dt * 3)); }
      // (88) interior da boca em brasa quando escancara na caça
      mBocaBrasa.material.opacity = lerp(mBocaBrasa.material.opacity, (cap >= 5 && (caca || bote)) ? .5 + Math.sin(pf * 6) * .15 : 0, Math.min(1, dt * 5));
      // (84) fuligem na lanterna quando ele está muito perto
      fuligemLanterna = lerp(fuligemLanterna, (d < 2.5 && (caca || bote)) ? clamp(1 - d / 2.5, 0, 1) : 0, Math.min(1, dt * 3));
      // (86) tremor da tela no bote colado
      if (bote && d < 2 && desistiuAnt !== M.state) tremor = .6;
      // (89) sopro longo de vapor ao desistir da caça
      if (desistiuAnt === 'caca' && M.state !== 'caca' && M.state !== 'bote' && M.state !== 'agarra') { for (let k = 0; k < 4; k++) { const b = bafo2[k % bafo2.length]; b.m.visible = true; b.t = 2.2; try { MON.cabeca.getWorldPosition(_c); b.m.position.copy(_c).add(_b.set(rand(-.1, .1), 0, .12)); } catch (e) {} b.m.scale.setScalar(1.4); } }
      // (90) a cada badalada do sino, a brasa do corpo pulsa forte
      if (sino && cap >= 5) { const p = (Math.sin(pf * 6) * .5 + .5) * .4; for (const m of brasaLados) m.material.opacity = Math.max(m.material.opacity, p); mBrasaPesc.material.opacity = Math.max(mBrasaPesc.material.opacity, p); if (discoBrasa) discoBrasa.material.opacity = Math.max(discoBrasa.material.opacity, p * .6); }
      // (92) hálito vira cristais no ar gelado (túneis)
      if (W.mapa === 'tuneis' && (crCd -= dt) <= 0 && !reduz) { crCd = .3; const c = cristais[crI++ % cristais.length]; c.m.visible = true; c.t = 2; try { MON.cabeca.getWorldPosition(_c); c.m.position.copy(_c).add(_b.set(rand(-.15, .15), rand(-.1, .1), .2)); } catch (e) {} }
      desistiuAnt = M.state;
    } else {
      mHumano.material.opacity = Math.max(0, mHumano.material.opacity - dt * 3); mBocaBrasa.material.opacity = 0;
      if (mReflBrasa) mReflBrasa.material.opacity = Math.max(0, mReflBrasa.material.opacity - dt * 3);
      fuligemLanterna = lerp(fuligemLanterna, 0, Math.min(1, dt * 3));
    }
    tremor = Math.max(0, tremor - dt * 2);
    // (85) a Ana perde a cor e fica cinza-azulada no Cap V
    if (cap >= 5 && ANA.ativa && ANA_G.visible) { try { for (const v of anaVestido) if (v.m.color) v.m.color.lerp(_cinzaAzul, Math.min(1, dt * 1.5)); } catch (e) {} }
    // (91) velas da Procissão tingem o alto da tela de âmbar quando perto
    procAmbar = lerp(procAmbar, (PROC.g && PROC.g.visible && PROC.pos.distanceTo(camera.position) < 7) ? clamp(1 - PROC.pos.distanceTo(camera.position) / 7, 0, 1) : 0, Math.min(1, dt * 3));

    // partículas batch4
    for (const p of maoPool) if (p.m.visible) { p.t -= dt; const k = clamp(p.t / 2.5, 0, 1); p.m.material.opacity = k * .55; p.m.material.color.setRGB(1, .35 * k, .1 * k); if (p.t <= 0) p.m.visible = false; }
    for (const c of cristais) if (c.m.visible) { c.t -= dt; c.m.position.y -= dt * .1; try { c.m.lookAt(camera.position); } catch (e) {} c.m.material.opacity = clamp(c.t / 2, 0, 1) * .5 * (Math.sin(pf * 10 + c.m.id) > 0 ? 1 : .3); if (c.t <= 0) c.m.visible = false; }
    if (mapaAnt4 !== W.mapa) { mapaAnt4 = W.mapa; for (const o of maoPool) { o.m.visible = false; o.t = 0; } for (const o of cristais) { o.m.visible = false; o.t = 0; } }
  }
  let mapaAnt4 = '';

  let capAplic = -1, estAnt = '', encaraInsp = 0, insPosAnt = new THREE.Vector3(), anaRachaT = 0;

  function aplicarCap(cap) {
    if (cap === capAplic) return; capAplic = cap;
    // (14) crachá/botões enferrujam e somem
    if (crachaMat && crachaMat.color) { const f = clamp(cap / 5, 0, 1); crachaMat.color.setRGB(.5 - f * .38, .35 - f * .3, .12 - f * .08); crachaMat.transparent = true; crachaMat.opacity = clamp(1 - cap * .2, .1, 1); crachaMat.roughness = clamp(.4 + f * .5, 0, 1); }
    // (83) barras do casaco queimam/escurecem por capítulo
    try { const f = clamp(cap / 5, 0, 1); for (const b of barras) if (b.m.material && b.m.material.color) b.m.material.color.setRGB(.04 * (1 - f), .04 * (1 - f), .045 * (1 - f)); } catch (e) {}
  }

  function tick(dt) {
    const st = S(); if (!st || C.mode !== 'jogo') { if (penumbra) penumbra.material.opacity = 0; if (discoBrasa) discoBrasa.material.opacity = 0; return; }
    garantirOv();
    const cap = st.chapter | 0, pf = perf(), reduz = !!OPT.vFlash, furia = M.furia || 0;
    aplicarCap(cap);

    const ativoM = M.ativo && MON.g.visible;
    let d = 99, foco = 0, perto = 0, caca = false, bote = false, lit = false;
    if (ativoM) {
      try { MON.cabeca.getWorldPosition(_a); d = _a.distanceTo(camera.position); } catch (e) {}
      const noFeixe = st.flashOn && !pisca() && d < 14;
      if (noFeixe) { const fw = camera.getWorldDirection(_b); foco = clamp((fw.dot(_a.clone().sub(camera.position).normalize()) - .9) / .1, 0, 1); }
      perto = foco * (1 - d / 14);
      caca = M.state === 'caca'; bote = M.state === 'bote' || M.state === 'agarra';
      lit = (st.flashOn && !pisca() && d < 12) || caca;
    }

    // ===== INSPETOR =====
    if (ativoM) {
      // (5) pele por capítulo
      if (peleCap !== cap) { peleCap = cap; try { mPele.material.map = PELES[clamp(cap, 0, 5)]; mPele.material.needsUpdate = true; } catch (e) {} }
      mPele.material.opacity = lerp(mPele.material.opacity, perto > .1 ? clamp(cap / 5 * .75, 0, .75) : 0, Math.min(1, dt * 5));

      // (1) couro cabeludo queimado no Cap V (chapéu sumiu)
      mScalp.material.opacity = lerp(mScalp.material.opacity, cap >= 5 ? clamp(.5 + perto, 0, .95) : 0, Math.min(1, dt * 3));

      // (2) mãozinhas empurrando o casaco (Cap IV+)
      const bOn = cap >= 4 ? (M.state === 'reza' || caca ? .95 : .55) : 0;
      for (const b of bulges) { b.ph += dt * (caca ? 5 : 2); const push = (Math.sin(b.ph) * .5 + .5); b.m.material.opacity = lerp(b.m.material.opacity, bOn, Math.min(1, dt * 3)); b.m.position.z = .3 + push * .09 * (cap >= 4 ? 1 : 0); b.m.position.y = b.y0 + Math.sin(b.ph * .6) * .03; }

      // (3) rosto sem boca na gola (raro, Cap IV+)
      golaCd -= dt; if (cap >= 4 && golaCd <= 0 && !reduz) { mGola.material.opacity = .9; golaCd = rand(8, 18); }
      if (mGola.material.opacity > 0) { mGola.material.opacity = Math.max(0, mGola.material.opacity - dt * .7); try { mGola.lookAt(camera.position); } catch (e) {} }

      // (4/41) casaco respira; trava na espera
      const prendendo = M.state === 'emboscada' || M.state === 'procura' || M.state === 'escuta';
      respira += dt * (prendendo ? .2 : caca ? 5 : 2.2);
      if (tronco) { const r = prendendo ? 1 : 1 + Math.sin(respira) * (caca ? .05 : .025); tronco.scale.x = lerp(tronco.scale.x, r, Math.min(1, dt * 6)); tronco.scale.z = tronco.scale.x; }

      // (6) rachaduras de brasa nas laterais do tronco (Cap V)
      const ladoOp = cap >= 5 ? (.25 + Math.sin(pf * (3 + furia)) * .15 + Math.min(.3, furia * .07)) : 0;
      for (const m of brasaLados) m.material.opacity = lerp(m.material.opacity, clamp(ladoOp, 0, .7) * clamp(1 - d / 10, 0, 1), Math.min(1, dt * 4));

      // (8) veias pretas no pescoço por capítulo
      for (const m of veias) m.material.opacity = lerp(m.material.opacity, perto > .1 ? clamp(cap / 5 * .7, 0, .7) : 0, Math.min(1, dt * 4));
      // (9) cicatriz no pescoço de perto
      mCicatriz.material.opacity = lerp(mCicatriz.material.opacity, perto > .25 ? .8 : 0, Math.min(1, dt * 5));

      // (10) braços-fantasma na fúria (Cap V)
      const fantOp = (cap >= 5 && (caca || bote)) ? .3 + Math.sin(pf * 8) * .1 : 0;
      bracoFantasma.forEach((m, i) => { m.material.opacity = lerp(m.material.opacity, fantOp, Math.min(1, dt * 4)); m.rotation.z = Math.sin(pf * 6 + i * 2) * .3; });

      // (11) sopro de brasa ao expirar (Cap V)
      if (cap >= 5 && (soproCd -= dt) <= 0 && (M.state === 'fareja' || Math.sin(respira) > .9)) { soproCd = rand(.5, 1.2); for (let k = 0; k < 2; k++) { const s = sopro[soproI++ % sopro.length]; s.m.visible = true; s.t = 1; try { MON.cabeca.getWorldPosition(_c); const fw = _b.set(0, 0, 1).applyQuaternion(MON.cabeca.getWorldQuaternion(_q)); s.m.position.copy(_c).addScaledVector(fw, .15); } catch (e) {} } }

      // (12) pontas das unhas sangram/escurecem por capítulo
      for (const u of unhasPonta) if (u.material && u.material.color) u.material.color.setRGB(.08 + cap * .03, .02, .02);

      // (13) ombros encolhem perto de parede (Cap V) — leitura de "quase não cabe"
      let pertoParede = false; try { pertoParede = cap >= 5 && caca; } catch (e) {}
      encolhe = lerp(encolhe, pertoParede && d < 4 ? 1 : 0, Math.min(1, dt * 3));
      try { MON.armL.position.x = -.38 + encolhe * .08; MON.armR.position.x = .38 - encolhe * .08; } catch (e) {}

      // (15) penumbra que ele carrega (escuro colado de perto)
      if (penumbra) { const on = (!st.flashOn && d < 4 && (caca || M.state === 'investiga')) ? clamp(1 - d / 4, 0, .5) : 0; penumbra.position.copy(M.pos).setY(1.4); penumbra.material.opacity = lerp(penumbra.material.opacity, reduz ? on * .4 : on, Math.min(1, dt * 3)); }

      // (16) pós-imagem queimada quando o facho forte sai dele
      const fachoForte = foco > .6 && d < 6 ? 1 : 0;
      if (mAfter && fachoForteAnt > .5 && fachoForte < .5 && !reduz) { mAfter.position.copy(M.pos).setY(1.2); try { mAfter.lookAt(camera.position.x, 1.2, camera.position.z); } catch (e) {} mAfter.material.opacity = .7; }
      if (mAfter && mAfter.material.opacity > 0) mAfter.material.opacity = Math.max(0, mAfter.material.opacity - dt * 1.8);
      fachoForteAnt = fachoForte;

      // (17) sombra com gesto atrasado na parede
      if (mSombraGesto) { const ang = MON.g.rotation.y; mSombraGesto.position.set(M.pos.x - Math.sin(ang) * 1.2, 1.1 + cap * .1, M.pos.z - Math.cos(ang) * 1.2); try { mSombraGesto.lookAt(camera.position.x, 1.1, camera.position.z); } catch (e) {} mSombraGesto.scale.set(1 + cap * .1, 1.1 + cap * .14, 1); mSombraGesto.material.opacity = lerp(mSombraGesto.material.opacity, lit && !reduz ? clamp(.25 + cap * .04, 0, .5) : 0, Math.min(1, dt * 2.5)); }

      // (21) disco de brasa no chão sob ele (Cap V, pulsa com a fúria)
      if (discoBrasa) { discoBrasa.position.set(M.pos.x, .02, M.pos.z); const op = cap >= 5 ? (.1 + Math.sin(pf * (3 + furia)) * .06 + Math.min(.2, furia * .05)) : 0; discoBrasa.material.opacity = lerp(discoBrasa.material.opacity, clamp(op, 0, .35), Math.min(1, dt * 3)); }

      // (22) poeira do rastro revelada pelo facho
      if ((poeiraCd -= dt) <= 0 && (caca || M.state === 'investiga') && !reduz) { poeiraCd = .3; const g = poeiraRastro[poeiraI++ % poeiraRastro.length]; g.g.visible = true; g.t = 3; const ang = MON.g.rotation.y; g.g.position.set(M.pos.x - Math.sin(ang) * .3, 0, M.pos.z - Math.cos(ang) * .3); }

      // (23) fumaça rasteira do trajeto (Cap V)
      if (cap >= 5 && (fumCd -= dt) <= 0 && (caca || M.state === 'investiga') && !reduz) { fumCd = .35; const f = fumChao[fumI++ % fumChao.length]; f.m.visible = true; f.t = 2; const ang = MON.g.rotation.y; f.m.position.set(M.pos.x - Math.sin(ang) * .25, .15, M.pos.z - Math.cos(ang) * .25); }

      // (24) cinza/brasa sobe do chão ao redor na caça (Cap V)
      if (cap >= 5 && caca && (cinzaCd -= dt) <= 0 && !reduz) { cinzaCd = .12; const c = cinza[cinzaI++ % cinza.length]; c.m.visible = true; c.t = 1.4; c.vy = rand(.4, .9); c.m.position.set(M.pos.x + rand(-.5, .5), .05, M.pos.z + rand(-.5, .5)); }

      // (25) lufada ao expirar: corre da posição dele até você
      if ((M.state === 'fareja' || (bote && estAnt !== M.state)) && !reduz) { const l = lufada[lufadaI++ % lufada.length]; l.m.visible = true; l.t = 1.2; l.m.position.set(M.pos.x, .03, M.pos.z); l.dir.copy(camera.position).sub(M.pos).setY(0).normalize(); }

      // (26) bafo mais denso/frequente quanto mais perto
      const freqBafo = clamp(1 - d / 8, 0, 1);
      if ((bafo2Cd -= dt) <= 0 && (W.mapa === 'tuneis' || W.mapa === 'cemiterio' || cap >= 4)) { bafo2Cd = lerp(1.4, .3, freqBafo); const b = bafo2[bafo2I++ % bafo2.length]; b.m.visible = true; b.t = 1.6 + freqBafo; try { MON.cabeca.getWorldPosition(_c); const fw = _b.set(0, 0, 1).applyQuaternion(MON.cabeca.getWorldQuaternion(_q)); b.m.position.copy(_c).addScaledVector(fw, .1); } catch (e) {} b.m.scale.setScalar(.6 + freqBafo); }

      // (29) órbitas reveladas no clarão do relâmpago (Cap V, cemitério)
      if (cap >= 5 && W.mapa === 'cemiterio') mOrb.material.opacity = Math.max(reduz ? raioI() * .6 : raioI() * 1.5, mOrb.material.opacity - dt * 2); else mOrb.material.opacity = Math.max(0, mOrb.material.opacity - dt * 2);

      // (31) névoa mais densa perto dele (Cap V)
      if (cap >= 5 && scene.fog && d < 8) { scene.fog.density *= 1 + clamp(1 - d / 8, 0, 1) * .35; }

      // vapor "fervendo" quando a chuva toca o corpo de brasa (Cap V, céu aberto)
      if (cap >= 5 && (W.mapa === 'cemiterio' || W.mapa === 'estrada') && (fervCd -= dt) <= 0 && !reduz) { fervCd = .3; const f = fervura[fervI++ % fervura.length]; f.m.visible = true; f.t = .9; f.m.position.set(M.pos.x + rand(-.2, .2), 2 + rand(0, .6), M.pos.z + rand(-.2, .2)); }

      // (7) casaco pinga nos túneis + brilho molhado
      if (W.mapa === 'tuneis' && (pingoCd -= dt) <= 0 && !reduz) { pingoCd = rand(.3, .8); const p = pingoPool[pingoI++ % pingoPool.length]; p.m.visible = true; p.t = 1.4; p.m.position.set(M.pos.x + rand(-.25, .25), 2.4, M.pos.z + rand(-.15, .15)); }

      // (20) estroboscópio do sino: guarda posição p/ o overlay
      if (st.flags && st.flags.sino && cap >= 5) { try { _c.copy(M.pos).setY(1.4).project(camera); strTx = clamp(_c.x * .5 + .5, 0, 1); strTy = clamp(-_c.y * .5 + .5, 0, 1); strobo = 1; } catch (e) {} }

      // (37/chamas) nada aqui
      encaraInsp = olhaPara(MON.cabeca);
      estAnt = M.state;
      insPosAnt.copy(M.pos);
    } else {
      mScalp.material.opacity = Math.max(0, mScalp.material.opacity - dt * 3);
      for (const b of bulges) b.m.material.opacity = Math.max(0, b.m.material.opacity - dt * 3);
      mGola.material.opacity = Math.max(0, mGola.material.opacity - dt * 3);
      for (const m of brasaLados) m.material.opacity = Math.max(0, m.material.opacity - dt * 3);
      for (const m of veias) m.material.opacity = Math.max(0, m.material.opacity - dt * 3);
      mCicatriz.material.opacity = 0; mPele.material.opacity = Math.max(0, mPele.material.opacity - dt * 3); mOrb.material.opacity = 0;
      for (const m of bracoFantasma) m.material.opacity = 0;
      if (penumbra) penumbra.material.opacity = Math.max(0, penumbra.material.opacity - dt * 3);
      if (discoBrasa) discoBrasa.material.opacity = Math.max(0, discoBrasa.material.opacity - dt * 3);
      if (mSombraGesto) mSombraGesto.material.opacity = Math.max(0, mSombraGesto.material.opacity - dt * 3);
      if (mAfter) mAfter.material.opacity = Math.max(0, mAfter.material.opacity - dt * 3);
    }

    // ===== clima: (28) chuva/relâmpago afinam no alerta do bote =====
    try {
      const alerta = M.ativo && (M.state === 'alerta' || (bote && d > 1.5));
      if (alerta && chuvaMat) chuvaMat.opacity = Math.min(chuvaMat.opacity, .06);
    } catch (e) {}

    // ===== ANA =====
    if (ANA.ativa && ANA_G.visible && anaCab) {
      const ad = ANA.pos.distanceTo(camera.position);
      // (32) olhos de risco de muito perto
      if (mAnaRisco) mAnaRisco.material.opacity = lerp(mAnaRisco.material.opacity, (ad < 1.6 && ANA.vista) ? .9 : 0, Math.min(1, dt * 5));
      // (34) vestido encharcado nos túneis
      for (const v of anaVestido) { if (!v.m.color) continue; const molhado = W.mapa === 'tuneis'; const alvo = new THREE.Color(v.cor).multiplyScalar(molhado ? .6 : 1); v.m.color.lerp(alvo, Math.min(1, dt * 2)); v.m.roughness = lerp(v.m.roughness, molhado ? .12 : v.rough, Math.min(1, dt * 2)); }
      // (35) racha por tempo no Cap V (mAnaRisco reaproveita leve pulso) — usa o tempo de encarada
      // marca de mãozinha molhada na parede (túneis)
      if (W.mapa === 'tuneis' && !ANA.vista && (anaMaoCd -= dt) <= 0 && !reduz) { anaMaoCd = rand(.6, 1.4); const a = anaMao[anaMaoI++ % anaMao.length]; a.m.visible = true; a.t = 30; a.m.position.set(ANA.pos.x, rand(1, 1.8), ANA.pos.z - .3); }
    } else if (mAnaRisco) mAnaRisco.material.opacity = Math.max(0, mAnaRisco.material.opacity - dt * 3);

    // ===== PROCISSÃO =====
    if (PROC.g && PROC.g.visible) {
      const parada = PROC.pos.distanceTo(procPosAnt) < .003; procPosAnt.copy(PROC.pos); procParada = parada ? procParada + dt : 0;
      // (36) poeira cai do teto quando a fila para
      if (procParada > .4 && (poeiraTetoCd -= dt) <= 0 && !reduz) { poeiraTetoCd = .15; const p = poeiraTeto[poeiraTetoI++ % poeiraTeto.length]; p.m.visible = true; p.t = 1.6; p.vy = 0; p.m.position.set(PROC.pos.x + rand(-.6, .6), 2.6, PROC.pos.z + rand(-.6, .6)); }
      // (37) faces piscam no clarão do relâmpago (as próprias faces já têm opacidade; aqui um reforço)
      if (raioI() > .2 && PROC.filhos) PROC.filhos.forEach((s) => { try { s.traverse(o => { if (o.isMesh && o.material && o.material.map && o.material.transparent && o.material.opacity > 0 && o.material.opacity < 1) o.material.opacity = Math.min(1, o.material.opacity + raioI()); }); } catch (e) {} });
    }

    // ===== partículas: fade/movimento =====
    for (const p of pingoPool) if (p.m.visible) { p.t -= dt; p.m.position.y -= dt * 1.2; if (p.t <= 0 || p.m.position.y < .05) p.m.visible = false; }
    for (const s of sopro) if (s.m.visible) { s.t -= dt; s.m.position.y += dt * .2; s.m.scale.setScalar(1 + (1 - s.t) * 1.5); try { s.m.lookAt(camera.position); } catch (e) {} s.m.material.opacity = clamp(s.t, 0, 1) * .5; if (s.t <= 0) s.m.visible = false; }
    for (const g of poeiraRastro) if (g.g.visible) { g.t -= dt; const litP = st.flashOn && !pisca() && visivel(g.g.position, 1, 10); const op = litP ? clamp(g.t / 3, 0, 1) * .5 : 0; for (const c of g.g.children) { c.material.opacity = op; try { c.lookAt(camera.position); } catch (e) {} } if (g.t <= 0) g.g.visible = false; }
    for (const f of fumChao) if (f.m.visible) { f.t -= dt; f.m.position.y += dt * .3; f.m.scale.setScalar(1 + (2 - f.t)); try { f.m.lookAt(camera.position); } catch (e) {} f.m.material.opacity = clamp(f.t / 2, 0, 1) * .12; if (f.t <= 0) f.m.visible = false; }
    for (const c of cinza) if (c.m.visible) { c.t -= dt; c.m.position.y += c.vy * dt; c.vy += dt * .3; try { c.m.lookAt(camera.position); } catch (e) {} c.m.material.opacity = clamp(c.t / 1.4, 0, 1) * .6; c.m.material.color.setRGB(1, .4 * clamp(c.t, 0, 1), .1); if (c.t <= 0) c.m.visible = false; }
    for (const l of lufada) if (l.m.visible) { l.t -= dt; l.m.position.addScaledVector(l.dir, dt * 3); l.m.scale.setScalar(1 + (1.2 - l.t) * 2); l.m.material.opacity = clamp(l.t / 1.2, 0, 1) * .25; if (l.t <= 0) l.m.visible = false; }
    for (const b of bafo2) if (b.m.visible) { b.t -= dt; b.m.position.y += dt * .25; b.m.scale.setScalar(b.m.scale.x + dt * .5); try { b.m.lookAt(camera.position); } catch (e) {} b.m.material.opacity = clamp(b.t / 2, 0, 1) * .13; if (b.t <= 0) b.m.visible = false; }
    for (const f of fervura) if (f.m.visible) { f.t -= dt; f.m.position.y += dt * .5; try { f.m.lookAt(camera.position); } catch (e) {} f.m.material.opacity = clamp(f.t / .9, 0, 1) * .2; if (f.t <= 0) f.m.visible = false; }
    for (const a of anaMao) if (a.m.visible) { a.t -= dt; a.m.material.opacity = clamp(a.t / 30, 0, 1) * .5; if (a.t <= 0) a.m.visible = false; }
    for (const p of poeiraTeto) if (p.m.visible) { p.t -= dt; p.vy += dt * .6; p.m.position.y -= p.vy * dt; p.m.material.opacity = clamp(p.t / 1.6, 0, 1) * .4; if (p.t <= 0 || p.m.position.y < .1) p.m.visible = false; }
    // limpeza ao trocar de mapa
    if (mapaAnt !== W.mapa) { mapaAnt = W.mapa; for (const arr of [pingoPool, sopro, fumChao, cinza, lufada, bafo2, fervura, anaMao, poeiraTeto]) for (const o of arr) { (o.m || o).visible = false; o.t = 0; } for (const g of poeiraRastro) { g.g.visible = false; g.t = 0; } }

    // ===== batch 2 e 3 =====
    try { extra(dt, st, cap, pf, reduz, d, foco, perto, caca, bote, lit, ativoM); } catch (e) {}
    try { extra3(dt, st, cap, pf, reduz, d, foco, perto, caca, bote, lit, ativoM); } catch (e) {}
    try { extra4(dt, st, cap, pf, reduz, d, foco, perto, caca, bote, lit, ativoM); } catch (e) {}

    // ===== overlay próprio =====
    desenhar(dt, st, pf, reduz, cap);
  }
  let mapaAnt = '';

  function desenhar(dt, st, pf, reduz, cap) {
    if (!octx) return; const w = ov.width, h = ov.height; octx.clearRect(0, 0, w, h);
    if (st.dead || C.mode !== 'jogo') return;
    // (19) feixe volumétrico na fumaça (Cap V / cemitério) quando a lanterna está acesa
    if (!reduz && st.flashOn && !pisca() && (cap >= 5 || W.mapa === 'cemiterio')) {
      const g = octx.createRadialGradient(w / 2, h * .62, 0, w / 2, h * .62, h * .7);
      g.addColorStop(0, 'rgba(210,210,190,.05)'); g.addColorStop(1, 'rgba(210,210,190,0)');
      octx.fillStyle = g; octx.beginPath(); octx.moveTo(w / 2, h * .58); octx.lineTo(w * .18, h); octx.lineTo(w * .82, h); octx.closePath(); octx.fill();
    }
    // (20) estroboscópio do sino: lampejos que recortam a silhueta dele
    if (strobo > 0 && !reduz) { strobo -= dt * .8; if (Math.sin(pf * 16) > .3) { octx.globalAlpha = clamp(strobo, 0, 1) * .5; octx.fillStyle = '#000'; octx.beginPath(); octx.ellipse(strTx * w, strTy * h, w * .05, h * .28, 0, 0, 7); octx.fill(); octx.globalAlpha = 1; octx.fillStyle = 'rgba(255,240,210,.08)'; octx.fillRect(0, 0, w, h); } }
    // (30) no clímax, um leve "congelar" branco a cada clarão do relâmpago (um passo mais perto)
    if (raioI() > .25 && cap >= 5 && !reduz && st.flags && st.flags.sino) { octx.fillStyle = `rgba(230,235,245,${(raioI() * .1).toFixed(3)})`; octx.fillRect(0, 0, w, h); }
    // (47) clarão laranja curto no bote (Cap V)
    if (flashLaranja > 0 && !reduz) { octx.fillStyle = `rgba(255,90,20,${(flashLaranja * .3).toFixed(3)})`; octx.fillRect(0, 0, w, h); }
    // (48) chuva escorre pelo corpo dele: riscos verticais claros do lado dele
    if (chuvaCorpo > .03 && !reduz) { let sx = .5; try { _c.set(M.pos.x, 1.4, M.pos.z).project(camera); sx = clamp(_c.x * .5 + .5, 0, 1); } catch (e) {} octx.globalAlpha = chuvaCorpo * .25; octx.strokeStyle = '#aeb8c0'; octx.lineWidth = 1; for (let i = 0; i < 14; i++) { const x = sx * w + (Math.random() - .5) * w * .18; octx.beginPath(); octx.moveTo(x, h * .35 + Math.random() * h * .2); octx.lineTo(x, h * .35 + Math.random() * h * .5); octx.stroke(); } octx.globalAlpha = 1; }
    // (67) a silhueta dele "come" a luz: um recorte escuro no facho quando aponta nele
    if (notch > .05 && !reduz) { let sx = .5, sy = .5; try { MON.cabeca.getWorldPosition(_a); _a.setY(_a.y - .4).project(camera); sx = clamp(_a.x * .5 + .5, 0, 1); sy = clamp(-_a.y * .5 + .5, 0, 1); } catch (e) {} octx.globalAlpha = notch * .4; octx.fillStyle = '#000'; octx.beginPath(); octx.ellipse(sx * w, sy * h, w * .045, h * .2, 0, 0, 7); octx.fill(); octx.globalAlpha = 1; }
    // (68) o relâmpago joga a sombra gigante e torta dele na parede por um quadro
    if (wallSil > .1 && !reduz && M.ativo) { let sx = .5; try { _c.copy(M.pos).setY(1.4).project(camera); sx = clamp(_c.x * .5 + .5, 0, 1); } catch (e) {} octx.globalAlpha = clamp(wallSil, 0, 1) * .5; octx.fillStyle = '#000'; const bx = sx * w, by = h * .3; octx.beginPath(); octx.ellipse(bx, by, w * .03, h * .09, 0, 0, 7); octx.fill(); octx.fillRect(bx - w * .035, by + h * .08, w * .07, h * .6); octx.save(); octx.translate(bx - w * .02, by + h * .12); octx.rotate(-.9); octx.fillRect(-w * .012, 0, w * .024, h * .5); octx.restore(); octx.globalAlpha = 1; }
    // (84) mancha de fuligem na lanterna quando ele está colado
    if (fuligemLanterna > .03 && !reduz) { octx.globalAlpha = fuligemLanterna * .3; const g = octx.createRadialGradient(w / 2, h * .9, h * .1, w / 2, h * .9, h * .7); g.addColorStop(0, 'rgba(10,8,6,.6)'); g.addColorStop(1, 'rgba(10,8,6,0)'); octx.fillStyle = g; octx.fillRect(0, 0, w, h); octx.globalAlpha = 1; }
    // (86) tremor: a borda da tela estremece no bote colado
    if (tremor > .02 && !reduz) { const off = Math.sin(pf * 60) * tremor * 6; octx.fillStyle = '#000'; octx.fillRect(0, 0, w, Math.max(0, 4 + off)); octx.fillRect(0, h - Math.max(0, 4 - off), w, Math.max(0, 4 - off)); }
    // (91) âmbar das velas da Procissão no alto da tela quando ela está perto
    if (procAmbar > .03 && !reduz) { const g = octx.createLinearGradient(0, 0, 0, h * .5); g.addColorStop(0, `rgba(220,150,50,${(procAmbar * .14).toFixed(3)})`); g.addColorStop(1, 'rgba(220,150,50,0)'); octx.fillStyle = g; octx.fillRect(0, 0, w, h * .5); }
  }

  return { tick };
}
