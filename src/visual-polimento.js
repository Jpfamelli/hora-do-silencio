// VISUAL E LUZ — Lote 3: polimento e sensação.
// A mão da Lia com a lanterna (cena própria desenhada por cima), o peso da lanterna, golpes que doem,
// itens que voam para o bolso, luz sob as portas, manchas de luz no chão, câmera com corpo, gotas na tela,
// pálpebras, estilo "fita 240 linhas", contorno para baixa visão e pequenos segredos de luz.
// Instalado por src/visual.js (instalarVisual). Ganchos: update, lanterna, hud/filtro, mapa, morte, ruido,
// depois (logo depois do renderer.render do motor) e tempo (congelamento curto do golpe).
export function instalarPolimento(C, V) {
  const { THREE, scene, camera, renderer, canvas, flash, MON, ANA, PROC, M, P, W, OPT, keys } = C;
  const $ = s => document.querySelector(s);
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const pick = a => a[Math.random() * a.length | 0];
  const ease = k => k * k * (3 - 2 * k);
  const PO = () => (window.__plat && window.__plat.O) || {};
  const qual = () => PO().qual || 'alta';
  const camK = () => OPT.vCam >= 2 ? 1 : OPT.vCam >= 1 ? .5 : 0;
  const bobOn = () => PO().bob !== false && OPT.vCam > 0;
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), v3 = new THREE.Vector3(), fw = new THREE.Vector3();
  const { tex, TX_SUAVE } = V;
  const ctex = (w, h, draw, rep) => { const t = tex(w, h, draw, rep); return t; };
  const compart = m => { m.userData.compartilhado = true; return m; };

  // =================================================================== CSS E CAMADAS DE TELA
  const css = document.createElement('style');
  css.textContent = `
.pol-fx{position:fixed;inset:0;pointer-events:none}
#pol-golpe{opacity:0}
#pol-unhas{width:100%;height:100%;opacity:0;transition:opacity 2s ease-out}
#pol-onda{opacity:0;background:radial-gradient(circle at center,rgba(0,0,0,0) 0,rgba(0,0,0,0) calc(var(--r,0%) - 9%),rgba(255,190,120,.28) var(--r,0%),rgba(0,0,0,0) calc(var(--r,0%) + 9%))}
#pol-ar{opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 38%,rgba(var(--c,0,0,0),.92) 100%)}
#pol-embaca{opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 30%,rgba(196,202,210,.34) 78%,rgba(214,220,226,.55) 100%)}
#pol-gotas{width:100%;height:100%}
#pol-queima{opacity:0;background:radial-gradient(ellipse at center,rgba(0,0,0,0) var(--q,90%),rgba(60,24,6,.9) calc(var(--q,90%) + 6%),#000 calc(var(--q,90%) + 16%))}
#pol-dither{opacity:0;mix-blend-mode:overlay;image-rendering:pixelated}
.pol-palp{position:fixed;left:-5%;width:110%;height:52%;background:#000;pointer-events:none;z-index:6}
#pol-palp-a{top:0;border-radius:0 0 50% 50%/0 0 18% 18%}
#pol-palp-b{bottom:0;border-radius:50% 50% 0 0/18% 18% 0 0}
#pol-play{position:fixed;left:28px;top:22px;font-family:"Special Elite",monospace;font-size:20px;letter-spacing:.12em;color:#e8e2d0;text-shadow:0 0 4px #000,2px 0 rgba(255,0,0,.4),-2px 0 rgba(0,120,255,.4);pointer-events:none;white-space:pre;transition:opacity .6s}
#pol-mais{position:fixed;font-family:"IM Fell English SC",serif;font-size:18px;color:#e9dfc8;text-shadow:0 0 6px #000;pointer-events:none;transition:transform .9s ease-out,opacity .9s;z-index:5}
#pol-segredo{position:fixed;left:50%;bottom:9%;transform:translateX(-50%);font-family:"Special Elite",monospace;letter-spacing:.14em;color:#e8e2d0;text-shadow:2px 0 rgba(255,0,0,.45),-2px 0 rgba(0,120,255,.45);pointer-events:none;transition:opacity .8s;z-index:60}
#inv-mini.pol-pulo{animation:polPulo .45s ease-out}
@keyframes polPulo{0%{transform:scale(1);filter:none}35%{transform:scale(1.18);filter:drop-shadow(0 0 6px rgba(255,214,150,.9))}100%{transform:scale(1);filter:none}}
`;
  document.head.appendChild(css);
  const ref = $('#fx-red');
  function camada(id, tag = 'div') { const e = document.createElement(tag); e.id = id; e.className = 'pol-fx'; (ref || document.body).after(e); return e; }
  const elGolpe = camada('pol-golpe'), elUnhas = camada('pol-unhas', 'canvas'), elOnda = camada('pol-onda'), elAr = camada('pol-ar'), elEmb = camada('pol-embaca');
  const elGotas = camada('pol-gotas', 'canvas'), elQueima = camada('pol-queima'), elDither = camada('pol-dither');
  elUnhas.width = 320; elUnhas.height = 180; const gUnhas = elUnhas.getContext('2d');
  elGotas.width = 320; elGotas.height = 180; const gGotas = elGotas.getContext('2d');
  const palpA = document.createElement('div'), palpB = document.createElement('div');
  palpA.id = 'pol-palp-a'; palpB.id = 'pol-palp-b'; palpA.className = palpB.className = 'pol-palp'; palpA.hidden = palpB.hidden = true;
  const hudEl = $('#hud'); document.body.insertBefore(palpA, hudEl); document.body.insertBefore(palpB, hudEl);
  const elPlay = document.createElement('div'); elPlay.id = 'pol-play'; elPlay.hidden = true; document.body.appendChild(elPlay);
  { // pontilhado ordenado (Bayer 4x4) do estilo de fita
    const c = document.createElement('canvas'); c.width = c.height = 4; const g = c.getContext('2d'); const B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    for (let i = 0; i < 16; i++) { const v = B[i] / 15 * 255 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(i % 4, i / 4 | 0, 1, 1); }
    elDither.style.backgroundImage = `url(${c.toDataURL()})`;
  }

  // =================================================================== A MÃO DA LIA (cena própria, desenhada por cima)
  const cenaMao = new THREE.Scene();
  const camMao = new THREE.PerspectiveCamera(56, camera.aspect, .01, 4);
  const ambMao = new THREE.HemisphereLight(0x8c96b0, 0x141210, .2); cenaMao.add(ambMao);
  const luzMao = new THREE.PointLight(0xfff0d2, 0, 1.6, 1.4); luzMao.position.set(.16, -.05, -.62); cenaMao.add(luzMao);
  const luzLamp = new THREE.DirectionalLight(0xffc98a, 0); luzLamp.position.set(-.3, 1, .4); cenaMao.add(luzLamp);
  const txPele = ctex(128, 128, (g, w, h) => {
    g.fillStyle = '#a78470'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${rand(90, 150) | 0},${rand(55, 90) | 0},${rand(45, 70) | 0},${rand(.05, .2)})`; g.fillRect(rand(0, w), rand(0, h), rand(1, 3), rand(1, 3)); }
    for (let i = 0; i < 5; i++) { const y = rand(10, h - 10); g.strokeStyle = 'rgba(70,40,30,.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + rand(-6, 6)); g.stroke(); } // dobras dos dedos
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(60,20,20,.0)'); gr.addColorStop(1, 'rgba(40,16,12,.35)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); // sujeira e frio
  });
  const txMoletom = ctex(128, 128, (g, w, h) => {
    g.fillStyle = '#34373a'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 3) { g.fillStyle = `rgba(0,0,0,${rand(.08, .22)})`; g.fillRect(x, 0, 1, h); }
    for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(150,150,140,${rand(.03, .1)})`; g.fillRect(rand(0, w), rand(0, h), 2, 1); }
    for (let i = 0; i < 4; i++) { const x = rand(0, w), y = rand(0, h), r = rand(8, 20), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(20,14,10,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } // lama e fuligem
  }, true);
  const txMetal = ctex(128, 64, (g, w, h) => {
    g.fillStyle = '#1d1f20'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(170,170,160,${rand(.15, .55)})`; g.fillRect(rand(0, w), rand(0, h), rand(1, 7), rand(1, 2)); } // tinta lascada
    for (let i = 0; i < 6; i++) { const x = rand(0, w), y = rand(0, h), gr = g.createRadialGradient(x, y, 0, x, y, 9); gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - 10, y - 10, 20, 20); } // amassados
    for (let y = 6; y < h; y += 10) { g.fillStyle = 'rgba(80,80,76,.35)'; g.fillRect(0, y, w, 2); } // frisos do cabo
  }, true);
  const matPele = new THREE.MeshLambertMaterial({ map: txPele });
  const matMol = new THREE.MeshLambertMaterial({ map: txMoletom });
  const matMetal = new THREE.MeshLambertMaterial({ map: txMetal });
  const matAro = new THREE.MeshLambertMaterial({ color: 0x5a5852 });
  const matLente = new THREE.MeshBasicMaterial({ color: 0xfff0d2 });
  const cil = (rt, rb, h, mat, seg = 12) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  const caixa = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  // braço direito: manga, mão fechada na lanterna, polegar no botão
  const braco = new THREE.Group(); cenaMao.add(braco);
  const lan = new THREE.Group(); braco.add(lan);
  { const corpo = cil(.021, .023, .19, matMetal); corpo.rotation.x = Math.PI / 2; corpo.position.z = -.02; lan.add(corpo);
    const cab = cil(.035, .026, .055, matMetal, 14); cab.rotation.x = Math.PI / 2; cab.position.z = -.14; lan.add(cab);
    const aro = new THREE.Mesh(new THREE.TorusGeometry(.034, .005, 6, 18), matAro); aro.position.z = -.168; lan.add(aro);
    const lente = new THREE.Mesh(new THREE.CircleGeometry(.031, 18), matLente); lente.position.z = -.169; lente.rotation.y = Math.PI; lan.add(lente);
    const brilho = new THREE.Mesh(new THREE.TorusGeometry(.03, .0035, 5, 18), matLente); brilho.position.z = -.171; lan.add(brilho);
    const tampa = cil(.024, .024, .02, matAro, 10); tampa.rotation.x = Math.PI / 2; tampa.position.z = .085; lan.add(tampa); lan.userData.tampa = tampa;
    const botao = caixa(.012, .008, .018, matAro); botao.position.set(0, .024, -.075); lan.add(botao); }
  const mao = new THREE.Group(); braco.add(mao);
  { const palma = caixa(.058, .05, .085, matPele); palma.position.set(.006, -.016, .005); mao.add(palma);
    for (let i = 0; i < 4; i++) { const d = cil(.0095, .0085, .05, matPele, 6); d.rotation.z = Math.PI / 2 + .25; d.position.set(-.02, -.006 - Math.abs(i - 1.5) * .002, -.03 + i * .022); mao.add(d); } }
  const polegar = new THREE.Group(); polegar.position.set(.01, .018, -.03); mao.add(polegar);
  { const p = cil(.009, .008, .05, matPele, 6); p.rotation.x = Math.PI / 2 - .25; p.position.z = -.022; polegar.add(p); }
  { const manga = cil(.043, .055, .34, matMol, 12); manga.rotation.x = Math.PI / 2; manga.position.set(.012, -.02, .215); braco.add(manga);
    const punho = cil(.04, .042, .035, matMol, 12); punho.rotation.x = Math.PI / 2; punho.position.set(.012, -.018, .06); braco.add(punho); }
  // a pilha velha que cai ao trocar
  const pilhaVelha = cil(.018, .018, .07, new THREE.MeshLambertMaterial({ color: 0x8a6a22 }), 8); pilhaVelha.visible = false; cenaMao.add(pilhaVelha);
  // mão esquerda (livre): tapa a boca, bate na lanterna, empurra a porta, faz o curativo, segura a garrafa
  const maoE = new THREE.Group(); cenaMao.add(maoE);
  const dedosE = [];
  { const palma = caixa(.07, .022, .08, matPele); maoE.add(palma);
    for (let i = 0; i < 4; i++) { const d = caixa(.014, .013, .062, matPele); d.position.set(-.024 + i * .016, 0, -.068); maoE.add(d); dedosE.push(d); }
    const pol = caixa(.014, .013, .045, matPele); pol.position.set(.044, 0, -.02); pol.rotation.y = -.6; maoE.add(pol);
    const manga = cil(.04, .05, .3, matMol, 10); manga.rotation.x = Math.PI / 2; manga.position.set(0, -.005, .19); maoE.add(manga); }
  const garrafaM = new THREE.Group(); maoE.add(garrafaM); garrafaM.visible = false;
  { const vidro = new THREE.MeshLambertMaterial({ color: 0x2f5a3a, transparent: true, opacity: .8, emissive: 0x081208 });
    const c = cil(.026, .026, .12, vidro, 10); c.position.set(0, .05, -.02); garrafaM.add(c);
    const g2 = cil(.009, .02, .06, vidro, 8); g2.position.set(0, .14, -.02); garrafaM.add(g2); }
  const gaze = new THREE.Group(); maoE.add(gaze); gaze.visible = false;
  { const mg = new THREE.MeshLambertMaterial({ color: 0xdcd6c8 }); const rolo = cil(.022, .022, .05, mg, 10); rolo.rotation.z = Math.PI / 2; rolo.position.set(0, .03, -.03); gaze.add(rolo); gaze.userData.rolo = rolo;
    const tira = caixa(.04, .002, .16, mg); tira.position.set(0, .01, .06); gaze.add(tira); }
  const B0 = new THREE.Vector3(.19, -.2, -.4), E_FORA = new THREE.Vector3(-.26, -.55, -.38);
  const POSE_E = {
    fora: { p: E_FORA, r: [0, 0, 0] },
    boca: { p: new THREE.Vector3(-.01, -.16, -.2), r: [-1.35, 0, .1] },
    bater: { p: new THREE.Vector3(.1, -.16, -.36), r: [-.3, .5, -.9] },
    porta: { p: new THREE.Vector3(-.08, -.08, -.42), r: [-1.45, 0, 0] },
    cura: { p: new THREE.Vector3(-.04, -.27, -.33), r: [.2, .3, .4] },
    garrafa: { p: new THREE.Vector3(-.17, -.2, -.38), r: [0, 0, .15] }
  };
  const H = { vis: 0, swX: 0, swY: 0, yawPrev: null, pitchPrev: 0, flashPrev: false, polT: 0, trocaT: 0, batPrev: 100, slapT: 0, portaT: 0, caiT: 0, poseE: 'fora', resp: 0 };
  function maoVisivelAlvo(S) {
    return !!OPT.vMao && C.mode === 'jogo' && S && S.inv && S.inv.lanterna && !S.hidden && !(C.MAOS && C.MAOS.visible) && !S.fim && P.olhar < .5;
  }
  function luzLocal() { // quanto de luz do lugar chega na mão
    let l = 0, cor = null;
    for (const L of W.lampadas) { if (!L.luz || L.luz.intensity <= .1) continue; const d = Math.hypot(L.x - P.pos.x, L.z - P.pos.z); if (d > L.alcance) continue; const k = L.luz.intensity / 6 * (1 - d / L.alcance); if (k > l) { l = k; cor = L.luz.color; } }
    return { l: Math.min(1, l), cor };
  }
  let luzLocT = 0, luzLoc = { l: 0, cor: null };
  function animMao(dt, ativo, S, t) {
    if (!S) return;
    const alvoVis = maoVisivelAlvo(S) && !S.dead;
    H.vis = clamp(H.vis + (alvoVis ? dt * 3.2 : -dt * 4.5), 0, 1);
    if (S.dead) H.caiT += dt; else H.caiT = 0;
    if (!ativo && !S.dead) return;
    // inércia: a mão atrasa quando você vira rápido
    if (H.yawPrev === null) { H.yawPrev = P.yaw; H.pitchPrev = P.pitch; }
    let dy = P.yaw - H.yawPrev; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); const dp = P.pitch - H.pitchPrev; H.yawPrev = P.yaw; H.pitchPrev = P.pitch;
    const kk = 1 - Math.exp(-dt * 9);
    H.swX = lerp(H.swX, clamp(dy / Math.max(dt, 1e-3) * .012, -.07, .07), kk); H.swY = lerp(H.swY, clamp(-dp / Math.max(dt, 1e-3) * .01, -.05, .05), kk);
    const anda = keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD, corre = P.sprinting;
    const bx = anda ? Math.sin(P.bob) * (corre ? .018 : .008) : 0, by = anda ? -Math.abs(Math.cos(P.bob)) * (corre ? .02 : .009) : 0;
    // tremor: medo, vida baixa e ele muito perto
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;
    const trem = (S.fear > 60 ? (S.fear - 60) / 40 * .006 : 0) + (S.health < 35 ? .003 : 0) + (dM < 3 ? .006 : 0);
    const tx = (Math.sin(t * 31) + Math.sin(t * 17.3)) * trem, ty = (Math.sin(t * 27.1 + 1) + Math.sin(t * 13.7)) * trem;
    H.resp += dt * (P.prende ? 0 : lerp(1.4, 3.6, S.fear / 100)); // o peito sobe e desce; prender o ar congela
    const respY = Math.sin(H.resp) * .0035 * (anda ? .3 : 1);
    const proc = PROC.fase === 'passando' && PROC.pos.distanceTo(P.pos) < 10; // a Procissão perto: aperta a lanterna contra o peito
    const agach = P.crouch ? -.03 : 0, correY = corre ? -.05 : 0;
    // sacudir sem pilha, bater na lanterna, trocar a pilha
    const sacode = P.sacudirT > 0;
    if (S.battery > H.batPrev + 40) { H.trocaT = .75; pilhaVelha.visible = !!OPT.vMao; pilhaVelha.position.copy(braco.position).add(v1.set(0, -.03, .09)); pilhaVelha.userData.v = 0; pilhaVelha.rotation.set(Math.PI / 2, 0, 0); }
    H.batPrev = S.battery;
    if (H.trocaT > 0) H.trocaT -= dt;
    if (pilhaVelha.visible) { pilhaVelha.userData.v += dt * 2.2; pilhaVelha.position.y -= pilhaVelha.userData.v * dt; pilhaVelha.rotation.z += dt * 7; if (pilhaVelha.position.y < -.7) pilhaVelha.visible = false; }
    if (S.flashOn !== H.flashPrev) { H.polT = .18; H.flashPrev = S.flashOn; }
    if (H.polT > 0) H.polT -= dt;
    if (H.slapT > 0) H.slapT -= dt;
    if (H.portaT > 0) H.portaT -= dt;
    const troca = H.trocaT > 0 ? Math.sin(clamp(1 - H.trocaT / .75, 0, 1) * Math.PI) : 0;
    let px = B0.x + bx + tx + H.swX * .6, py = B0.y + by + ty + respY + agach + correY - troca * .06, pz = B0.z;
    let rx = .06 + (corre ? .35 : 0) + H.swY * 2 + troca * .5, ry = .07 + H.swX * 1.6, rz = bx * 2;
    if (proc) { px -= .07; py -= .03; pz += .08; rx -= .1; ry += .25; }
    if (sacode) { const s = Math.sin(t * 34); rz += s * .5; py += s * .012; }
    lan.rotation.z = H.trocaT > 0 ? -troca * Math.PI * 2 : (sacode ? Math.sin(t * 34) * .3 : 0); // a tampa gira na troca
    if (lan.userData.tampa) lan.userData.tampa.position.z = .085 + troca * .03;
    polegar.position.y = .018 - (H.polT > 0 ? Math.sin(H.polT / .18 * Math.PI) * .008 : 0); // o polegar aperta o botão
    // morte: a mão solta a lanterna e cai para fora do quadro
    if (S.dead) { const k = H.caiT; py -= k * k * 1.6; rx += k * 2.2; rz -= k * 1.5; px += k * .1; }
    const desce = (1 - ease(H.vis)) * .4;
    braco.position.set(px, py - desce, pz); braco.rotation.set(rx, ry, rz);
    // a lente na mão acende junto com o feixe e segue a cor dele
    const I = clamp(flash.intensity / 30, 0, 1.3);
    matLente.color.copy(flash.color).multiplyScalar(.15 + I * .95);
    // mão livre
    let pose = 'fora';
    if (P.curaT > 0) pose = 'cura';
    else if (P.mirarG > .05 && S.inv.garrafas > 0) pose = 'garrafa';
    else if (H.portaT > 0) pose = 'porta';
    else if (sacode || H.slapT > 0) pose = 'bater';
    else if (P.prende && !S.hidden) pose = 'boca';
    if (!H.vis || S.dead) pose = 'fora';
    H.poseE = pose; const alvo = POSE_E[pose], ke = 1 - Math.exp(-dt * (pose === 'fora' ? 8 : 14));
    maoE.position.lerp(alvo.p, ke);
    maoE.rotation.x = lerp(maoE.rotation.x, alvo.r[0], ke); maoE.rotation.y = lerp(maoE.rotation.y, alvo.r[1], ke); maoE.rotation.z = lerp(maoE.rotation.z, alvo.r[2], ke);
    if (pose === 'bater') { const s = Math.max(0, Math.sin(t * (sacode ? 18 : 26))); maoE.position.x += s * .03; maoE.position.y += s * .012; }
    if (pose === 'porta') { maoE.position.z -= Math.sin(clamp(1 - H.portaT / .45, 0, 1) * Math.PI) * .06; }
    if (pose === 'boca') { const q = S.ar < 25 ? (25 - S.ar) / 25 : 0; maoE.position.x += Math.sin(t * 40) * .003 * q; maoE.position.y -= q * .015; for (const d of dedosE) d.rotation.x = Math.sin(t * 37 + d.position.x * 90) * .12 * q; } // dedos tremem e escorregam
    else for (const d of dedosE) d.rotation.x = pose === 'garrafa' ? -1.1 : pose === 'cura' ? -.5 : 0;
    garrafaM.visible = pose === 'garrafa';
    if (pose === 'garrafa') maoE.position.z += clamp(P.mirarG, 0, 1.2) * .1; // o braço recua conforme a força
    gaze.visible = pose === 'cura'; if (gaze.visible) gaze.userData.rolo.rotation.x += dt * 9;
    if (pose === 'cura') { braco.position.y -= .07; braco.rotation.x += .4; }
    // luz na mão: feixe refletido, lâmpadas perto, relâmpago
    luzLocT -= dt; if (luzLocT <= 0) { luzLocT = .2; luzLoc = luzLocal(); }
    luzMao.color.copy(flash.color); luzMao.intensity = I * 1.1;
    const fora = P.room && P.room.fora;
    ambMao.intensity = .07 + luzLoc.l * .35 + (C.raioI || 0) * (fora ? 1.6 : .5);
    luzLamp.intensity = luzLoc.l * .6; if (luzLoc.cor) luzLamp.color.copy(luzLoc.cor);
  }
  function desenharMao() {
    if (H.vis <= .01 && !(C.S && C.S.dead && H.caiT < 1.2)) return;
    if (!OPT.vMao || C.mode !== 'jogo') return;
    if (camMao.aspect !== camera.aspect) { camMao.aspect = camera.aspect; camMao.updateProjectionMatrix(); }
    const inf = renderer.info.render, c0 = inf.calls, t0 = inf.triangles;
    const ac = renderer.autoClear; renderer.autoClear = false; renderer.clearDepth(); renderer.render(cenaMao, camMao); renderer.autoClear = ac;
    inf.calls += c0; inf.triangles += t0;
  }
  // gestos que vêm de teclas e do mundo
  addEventListener('keydown', e => {
    const S = C.S; if (!S || C.mode !== 'jogo' || C.ui) return;
    if (e.code === 'KeyF' && S.inv.lanterna && (C.flashPisca || (S.battery < 25 && S.battery > 0))) H.slapT = .4; // bate na lanterna que falha
  });

  // =================================================================== A LANTERNA COM PESO (antes do feixe ser desenhado)
  const COR_FIL = new THREE.Color(0xff7a24), COR_FRIA = new THREE.Color(0xf4f6ff);
  // lente da lanterna: anel mais claro, centro quente, riscos de poeira; com chuva, gotas que mancham o cone
  function cookie(gotas) {
    return ctex(256, 256, (g, w, h) => {
      const c = w / 2, gr = g.createRadialGradient(c, c, 0, c, c, c);
      gr.addColorStop(0, '#fff'); gr.addColorStop(.32, '#e6e2dc'); gr.addColorStop(.62, '#cfcac4'); gr.addColorStop(.74, '#f4f0ea'); gr.addColorStop(.82, '#a8a49e'); gr.addColorStop(.96, '#2a2826'); gr.addColorStop(1, '#000');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineCap = 'round';
      for (let i = 0; i < 9; i++) { g.lineWidth = rand(1, 3); g.beginPath(); const a = rand(0, 6.28), r = rand(20, 100); g.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r); g.lineTo(c + Math.cos(a) * r + rand(-40, 40), c + Math.sin(a) * r + rand(-40, 40)); g.stroke(); }
      for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(0,0,0,${rand(.05, .2)})`; g.beginPath(); g.arc(rand(20, w - 20), rand(20, h - 20), rand(.6, 2.2), 0, 7); g.fill(); }
      if (gotas) for (let i = 0; i < 26; i++) { const x = rand(30, w - 30), y = rand(30, h - 30), r = rand(4, 13), gg = g.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, 'rgba(255,255,255,.35)'); gg.addColorStop(.6, 'rgba(0,0,0,.45)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gg; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    });
  }
  const COOKIE = cookie(false), COOKIE_CHUVA = cookie(true);
  try { flash.map = COOKIE; } catch (e) {}
  const L = { on: false, ligT: 9, aftT: 0, pilhaT: 9, batPrev: 100, rc: new THREE.Raycaster(), rcT: 0, parede: 9, mortoT: 0, impacto: false };
  L.rc.far = 1.3;
  function lanterna(dt, ativo, S, t) {
    if (!S) return;
    const chove = C.chuvaMat && C.chuvaMat.opacity > .05 && P.room && P.room.fora && (W.mapa === 'estrada' || W.mapa === 'cemiterio');
    const mapa = chove ? COOKIE_CHUVA : COOKIE; if (flash.map !== mapa) flash.map = mapa;
    // morte: a lanterna cai da mão, o feixe despenca girando e pisca ao bater no chão
    if (S.dead) {
      L.mortoT += dt; const k = clamp(L.mortoT / .75, 0, 1), e = k * k;
      flash.target.position.set(Math.sin(L.mortoT * 9) * 3 * (1 - k) + 1.2 * k, -.15 - e * 4.6, -5 + e * 3.4);
      if (k >= 1 && !L.impacto) { L.impacto = true; L.flk = .09; }
      if (L.flk > 0) { L.flk -= dt; if (!OPT.vFlash) flash.intensity *= .05; }
      return;
    }
    L.mortoT = 0; L.impacto = false;
    if (!ativo) { L.on = S.flashOn; return; }
    const sv = !!OPT.vFlash;
    // ligar: o filamento acende laranja e sobe para o branco; o cone abre com um tranco
    if (S.flashOn && !L.on) { L.ligT = 0; L.aftT = 0; }
    if (!S.flashOn && L.on && S.battery > 0) L.aftT = .26;
    L.on = S.flashOn;
    if (S.battery > L.batPrev + 40) L.pilhaT = 0; L.batPrev = S.battery;
    let mult = 1.12, ang = 1;
    if (S.flashOn) {
      L.ligT += dt;
      if (L.ligT < .12) { const k = L.ligT / .12; flash.color.lerp(COR_FIL, (1 - k) * .85); mult *= sv ? lerp(.4, 1, k) : .25 + k * .85; ang *= lerp(.6, 1, ease(k)); }
      else if (L.ligT < .4 && !sv) { mult *= 1 + .15 * (1 - (L.ligT - .12) / .28); }
      // pilha nova: depois do acender, um pico mais forte e mais branco
      L.pilhaT += dt;
      if (L.pilhaT > .6 && L.pilhaT < 1.6) { const k = 1 - (L.pilhaT - .6); mult *= 1 + .2 * k; flash.color.lerp(COR_FRIA, .35 * k); }
      // pilha morrendo: o filamento respira fraco
      if (S.battery < 10 && !sv) mult *= .82 + .18 * Math.sin(t * 5.3) * Math.sin(t * 1.7);
      // perto da parede: círculo pequeno e forte
      L.rcT -= dt;
      if (L.rcT <= 0) { L.rcT = .1; camera.getWorldDirection(fw); L.rc.set(camera.position, fw); const h = L.rc.intersectObjects(W.solid, false)[0]; L.parede = h ? h.distance : 9; }
      if (L.parede < 1.05) { const k = clamp((L.parede - .25) / .8, 0, 1); ang *= lerp(.55, 1, k); mult *= lerp(1.5, 1, k); }
    } else if (L.aftT > 0) { // desligar: o filamento fica laranja por um instante
      L.aftT -= dt; flash.color.copy(COR_FIL); flash.intensity = (sv ? 1.2 : 2.4) * (L.aftT / .26); ang *= .7;
    }
    // golpe: o feixe é derrubado de lado e falha um instante
    if (G.knock > 0) {
      const k = G.knock > .5 ? (.65 - G.knock) / .15 : G.knock / .5;
      flash.target.position.y -= k * 2.6; flash.target.position.x += G.lado * k * 1.6;
      if (G.knock > .55 && !sv) mult *= .15;
    }
    // ele muito perto: a mão treme tanto que o feixe samba
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;
    if (dM < 3 && !S.hidden) { const a = (3 - dM) / 3 * .35; flash.target.position.x += Math.sin(t * 23) * a; flash.target.position.y += Math.sin(t * 19 + 1) * a * .7; }
    flash.intensity *= mult; flash.angle *= ang;
  }

  // =================================================================== GOLPES QUE DOEM
  const G = { vida: 100, parada: 0, knock: 0, lado: 0, jr: 0, jv: 0, cinza: 0, ondaT: 9 };
  function quemBateu() {
    let melhor = null, md = 1e9;
    const cand = [];
    if (M.ativo) cand.push(['inspetor', M.pos, 5]);
    if (ANA.ativa) cand.push(['ana', ANA.pos, 4]);
    if (PROC.fase === 'passando') cand.push(['procissao', PROC.pos, 7]);
    for (const [q, p, lim] of cand) { const d = p.distanceTo(P.pos); if (d < lim && d < md) { md = d; melhor = { q, p }; } }
    return melhor;
  }
  function golpe(S) {
    const qb = quemBateu();
    let a = 0;
    if (qb) { v1.set(qb.p.x, camera.position.y, qb.p.z); camera.worldToLocal(v1); a = Math.atan2(v1.x, -v1.z); }
    G.lado = Math.sin(a) >= 0 ? 1 : -1; if (Math.abs(Math.sin(a)) < .25 && Math.cos(a) < 0) G.lado = 0;
    if (!window.__teste) G.parada = .07; // o mundo para por um instante
    G.knock = .65; G.cinza = 1;
    if (camK() > 0) G.jv += -Math.sign(Math.sin(a) || 1) * 1.6 * camK(); // a cabeça é jogada para longe de quem bateu
    // a borda vermelha nasce do lado do golpe
    const px = 50 + Math.sin(a) * 58, py = 50 - Math.cos(a) * 58;
    elGolpe.style.transition = 'none'; elGolpe.style.background = `radial-gradient(circle at ${px.toFixed(0)}% ${py.toFixed(0)}%, rgba(150,10,6,.85) 0, rgba(110,0,0,.35) 32%, rgba(0,0,0,0) 62%)`;
    elGolpe.style.opacity = OPT.vFlash ? .55 : .95;
    requestAnimationFrame(() => { elGolpe.style.transition = 'opacity 1.3s ease-out'; elGolpe.style.opacity = 0; });
    // marcas: unhas do lado do golpe; a Menina deixa mãozinhas geladas
    gUnhas.clearRect(0, 0, 320, 180);
    const cx = 160 + Math.sin(a) * 120, cy = 90 - Math.cos(a) * 70, forca = clamp((G.vida - S.health) / 30, .5, 1.6);
    if (qb && qb.q === 'ana') {
      gUnhas.fillStyle = 'rgba(150,190,220,.55)';
      for (let k = 0; k < 2; k++) { const x = cx + rand(-40, 40), y = cy + rand(-25, 25); gUnhas.beginPath(); gUnhas.ellipse(x, y, 9, 11, 0, 0, 7); gUnhas.fill(); for (let i = 0; i < 5; i++) { gUnhas.beginPath(); gUnhas.ellipse(x - 9 + i * 4.5, y - 15 + (i === 0 ? 7 : 0), 2, 4.5, (i - 2) * .2, 0, 7); gUnhas.fill(); } }
    } else {
      gUnhas.strokeStyle = 'rgba(120,8,6,.85)'; gUnhas.lineCap = 'round';
      for (let i = 0; i < 3; i++) { gUnhas.lineWidth = (2 + i % 2) * forca; gUnhas.beginPath(); let x = cx - 40 + i * 18, y = cy - 40; gUnhas.moveTo(x, y); for (let k = 0; k < 5; k++) { x += rand(5, 12); y += rand(12, 18); gUnhas.lineTo(x, y); } gUnhas.stroke(); }
    }
    elUnhas.style.transition = 'none'; elUnhas.style.opacity = OPT.vFlash ? .45 : .9;
    requestAnimationFrame(() => requestAnimationFrame(() => { elUnhas.style.transition = 'opacity 2s ease-out'; elUnhas.style.opacity = 0; }));
  }
  function tempo(dt) { if (G.parada > 0) { G.parada -= dt; return 0; } return dt; }
  function golpes(dt, ativo, S) {
    if (S.health < G.vida - 3 && C.mode === 'jogo') golpe(S);
    if (S.health > G.vida + 10 && !S.dead && G.vida < 60) { G.ondaT = 0; } // o curativo devolve a cor numa onda
    G.vida = S.health;
    G.knock = Math.max(0, G.knock - dt); G.cinza = Math.max(0, G.cinza - dt / (OPT.vFlash ? .7 : .35));
    G.jv += (-G.jr * 160 - G.jv * 16) * dt; G.jr += G.jv * dt; // mola do tranco
    if (G.ondaT < 1.2) { G.ondaT += dt; const k = G.ondaT / 1.2; elOnda.style.setProperty('--r', (k * 110).toFixed(1) + '%'); elOnda.style.opacity = (1 - k).toFixed(3); } else if (elOnda.style.opacity !== '0') elOnda.style.opacity = 0;
    void ativo;
  }
  function filtro() {
    const S = C.S; if (!S) return '';
    const baixa = S.health < 25 ? (25 - S.health) / 25 * .85 : 0; // abaixo de 25 o mundo perde quase toda a cor
    const g = Math.max(baixa, G.cinza * .8);
    return g > .02 ? ` grayscale(${g.toFixed(2)})` : '';
  }

  // =================================================================== ITENS: voam para o bolso, brilho de descoberta
  const VOOS = [], vistos = new Set();
  let prevAlvo = null;
  const TX_ESTRELA = ctex(64, 64, (g, w, h) => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,250,230,1)'); gr.addColorStop(.15, 'rgba(255,230,180,.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,245,220,.9)'; g.lineWidth = 2; g.beginPath(); g.moveTo(32, 2); g.lineTo(32, 62); g.moveTo(2, 32); g.lineTo(62, 32); g.stroke();
  });
  const glints = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_ESTRELA, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.visible = false; scene.add(s); return { s, t: 0 }; });
  let glI = 0;
  function brilhar(pos, tam = .35, dur = .32) { const g = glints[glI++ % glints.length]; g.s.position.copy(pos); g.s.visible = true; g.t = dur; g.dur = dur; g.tam = tam; }
  const NPO = 90, poGeo = new THREE.BufferGeometry(), poPos = new Float32Array(NPO * 3).fill(-99), poVel = new Float32Array(NPO * 3), poVida = new Float32Array(NPO), poVida0 = new Float32Array(NPO), poGrav = new Float32Array(NPO), poCor = new Float32Array(NPO * 3), poBase = new Float32Array(NPO * 3);
  poGeo.setAttribute('position', new THREE.BufferAttribute(poPos, 3)); poGeo.setAttribute('color', new THREE.BufferAttribute(poCor, 3));
  const poMatX = new THREE.PointsMaterial({ map: TX_SUAVE, size: .05, vertexColors: true, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending });
  const particulas = new THREE.Points(poGeo, poMatX); particulas.frustumCulled = false; scene.add(particulas);
  let poI = 0;
  function particula(x, y, z, vx, vy, vz, vida, r, g, b, grav = 1.8) { const i = poI++ % NPO; poPos.set([x, y, z], i * 3); poVel.set([vx, vy, vz], i * 3); poVida[i] = poVida0[i] = vida; poGrav[i] = grav; poBase.set([r, g, b], i * 3); poCor.set([r, g, b], i * 3); }
  function atualizaParticulas(dt) {
    let algum = false;
    for (let i = 0; i < NPO; i++) {
      if (poVida[i] <= 0) continue; algum = true;
      poVida[i] -= dt; const o = i * 3;
      if (poVida[i] <= 0) { poPos[o + 1] = -99; continue; }
      poVel[o + 1] -= dt * poGrav[i]; // a poeira flutua; lama e respingo caem
      poPos[o] += poVel[o] * dt; poPos[o + 1] += poVel[o + 1] * dt; poPos[o + 2] += poVel[o + 2] * dt;
      const f = Math.min(1, poVida[i] / poVida0[i] * 2.5); poCor[o] = poBase[o] * f; poCor[o + 1] = poBase[o + 1] * f; poCor[o + 2] = poBase[o + 2] * f;
    }
    particulas.visible = algum;
    if (algum) { poGeo.attributes.position.needsUpdate = true; poGeo.attributes.color.needsUpdate = true; }
    poMatX.opacity = .3 + clamp(flash.intensity / 30, 0, 1) * .4; // a poeira aparece mais dentro do feixe
  }
  function copiaVisual(obj) { // cópia só do que se vê (sem userData com funções)
    const g = new THREE.Group();
    obj.updateWorldMatrix(true, true);
    obj.traverse(o => {
      if (!o.isMesh || !o.visible && o !== obj) return;
      const m = new THREE.Mesh(o.geometry, o.material); m.matrixAutoUpdate = false;
      m.matrix.copy(obj.matrixWorld).invert().multiply(o.matrixWorld); g.add(m);
    });
    g.position.setFromMatrixPosition(obj.matrixWorld); g.quaternion.setFromRotationMatrix(obj.matrixWorld);
    return g;
  }
  function pulaInventario(trilha) {
    const inv = $('#inv-mini'); if (!inv) return;
    inv.classList.remove('pol-pulo'); void inv.offsetWidth; inv.classList.add('pol-pulo');
    const r = inv.getBoundingClientRect(); if (!r.width && !r.height) return;
    let m = $('#pol-mais'); if (!m) { m = document.createElement('div'); m.id = 'pol-mais'; document.body.appendChild(m); }
    m.textContent = trilha ? '✦' : '+1'; m.style.transition = 'none'; m.style.left = (r.right + 8) + 'px'; m.style.top = (r.top + r.height / 2 - 10) + 'px'; m.style.opacity = 1; m.style.transform = 'translateY(0)';
    requestAnimationFrame(() => requestAnimationFrame(() => { m.style.transition = ''; m.style.opacity = 0; m.style.transform = 'translateY(-26px)'; }));
  }
  function itens(dt, ativo, S) {
    const alvo = C.alvo;
    camera.getWorldDirection(fw);
    for (const e of W.items) {
      const m = e.mesh; const vis = m.visible && !!m.parent;
      if (e._polVis && !vis && m.parent && (prevAlvo === e.it || m.position.distanceTo(P.pos) < 3)) { // pegou: voa até a mão
        const comum = /pilha|curativo|garrafa/i.test(e.it.label().replace(/<[^>]+>/g, ''));
        const g = copiaVisual(m); scene.add(g);
        m.getWorldPosition(v1); brilhar(v1, .5, .09);
        VOOS.push({ g, ini: g.position.clone(), q: g.quaternion.clone(), t: 0, trilha: !comum, s0: m.scale.x });
        pulaInventario(!comum);
      }
      e._polVis = vis;
      // brilho de descoberta: a primeira vez que o feixe passa por cima, um reflexo único
      if (vis && ativo && !vistos.has(e.key) && flash.intensity > 3 && S.dif !== 'pesadelo') {
        m.getWorldPosition(v1); v2.copy(v1).sub(camera.position); const d = v2.length();
        if (d < 7 && fw.dot(v2.normalize()) > .975) { vistos.add(e.key); v1.y += .08; brilhar(v1); }
      }
    }
    prevAlvo = alvo;
    for (let i = VOOS.length - 1; i >= 0; i--) {
      const f = VOOS[i]; f.t += dt / .26; const k = Math.min(1, f.t), e = k * k;
      v2.set(.12, -.32, -.38).applyMatrix4(camera.matrixWorld);
      f.g.position.lerpVectors(f.ini, v2, e); f.g.position.y += Math.sin(k * Math.PI) * .18;
      f.g.scale.setScalar(Math.max(.05, 1 - e * .85)); f.g.rotation.y += dt * 6;
      if (f.trilha && Math.random() < .8) particula(f.g.position.x, f.g.position.y, f.g.position.z, rand(-.1, .1), rand(.05, .25), rand(-.1, .1), rand(.5, 1.1), 1, .78, .35, -.05); // rastro de poeira dourada
      if (k >= 1) { scene.remove(f.g); VOOS.splice(i, 1); }
    }
    for (const g of glints) { if (!g.s.visible) continue; g.t -= dt; if (g.t <= 0) { g.s.visible = false; continue; } const k = 1 - g.t / g.dur; g.s.material.opacity = Math.sin(k * Math.PI); g.s.scale.setScalar(g.tam * (.4 + Math.sin(k * Math.PI) * .8)); g.s.material.rotation = k * 1.2; }
  }

  // =================================================================== LUZ: faixa sob as portas, manchas no chão, pulsos
  const TX_FAIXA = ctex(64, 16, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); const gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(.12, 'rgba(0,0,0,0)'); gx.addColorStop(.88, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, w, h); });
  const TX_POCA = ctex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(.35, 'rgba(255,255,255,.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  let FAIXAS = [], POCAS = [], mods = [], pulsoObj = 0, doneN = -1;
  const sombraPes = new Map();
  function luzDaSala(r) { let l = 0, cor = null; for (const Lp of W.lampadas) if (Lp.sala === r && Lp.luz) { const k = Lp.luz.intensity / Math.max(1, Lp.base || 6); if (k > l) { l = k; cor = Lp.luz.color; } } return { l, cor }; }
  function montarLuz() {
    FAIXAS = []; POCAS = [];
    for (const Lp of W.lampadas) Lp.sala = C.roomAt(Lp.x, Lp.z);
    for (const d of W.doors) {
      if (d.grade || !d.col) continue;
      const ex = d.eixo === 'x', lw = ex ? d.col.maxX - d.col.minX : d.col.maxZ - d.col.minZ;
      const ra = ex ? C.roomAt(d.x, d.z - .5) : C.roomAt(d.x - .5, d.z), rb = ex ? C.roomAt(d.x, d.z + .5) : C.roomAt(d.x + .5, d.z);
      if (!ra || !rb || ra === rb) continue;
      const temA = W.lampadas.some(l => l.sala === ra), temB = W.lampadas.some(l => l.sala === rb);
      if (!temA && !temB) continue;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(lw - .08, .34), new THREE.MeshBasicMaterial({ map: TX_FAIXA, color: 0xffc98a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3 }));
      m.raycast = () => {};
      m.rotation.x = -Math.PI / 2; if (!ex) m.rotation.z = Math.PI / 2;
      m.position.set(d.x, .012, d.z); m.renderOrder = 3; m.visible = false; W.grupo.add(m);
      FAIXAS.push({ m, d, ra, rb, temA, temB });
    }
    for (const Lp of W.lampadas) {
      if (!Lp.luz || !Lp.bulbo) continue;
      const r = Lp.sala; let y = .018;
      if (r && r.agua && W.agua.length && !(C.S && C.S.flags.aguaBaixa)) y = W.agua[0].position.y + .014;
      const raio = clamp((Lp.alcance || 8) * .32, 1.1, 2.6);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(raio * 2, raio * 2), new THREE.MeshBasicMaterial({ map: TX_POCA, color: Lp.luz.color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2 }));
      m.raycast = () => {}; m.rotation.x = -Math.PI / 2; m.position.set(Lp.x, y, Lp.z); m.renderOrder = 2; m.visible = false; W.grupo.add(m);
      POCAS.push({ m, L: Lp, y });
    }
  }
  function modLamp(Lp, k, ke = k) { // muda a lâmpada só neste desenho (volta em depois())
    if (!mods.some(x => x[0] === Lp)) mods.push([Lp, Lp.luz.intensity, Lp.bulbo.material.emissiveIntensity]);
    Lp.luz.intensity *= k; Lp.bulbo.material.emissiveIntensity *= ke;
  }
  const lampFalha = new Map();
  function luzes(dt, ativo, S, t) {
    // faixa de luz sob as portas fechadas; sombras de pés quando alguém passa do outro lado
    for (const f of FAIXAS) {
      const fechada = Math.abs(f.d.ang) < .06 && !f.d.open;
      let alvo = 0, cor = null;
      if (fechada && Math.hypot(f.d.x - P.pos.x, f.d.z - P.pos.z) < 18) {
        const a = f.temA ? luzDaSala(f.ra) : { l: 0 }, b = f.temB ? luzDaSala(f.rb) : { l: 0 };
        const pr = P.room, outra = pr === f.ra ? b : pr === f.rb ? a : (a.l > b.l ? a : b), minha = pr === f.ra ? a : pr === f.rb ? b : { l: 0 };
        alvo = clamp(outra.l - minha.l * .6, 0, 1.2) * .55; cor = outra.cor;
        let pes = 0;
        for (const ent of [M.ativo ? M.pos : null, PROC.fase === 'passando' ? PROC.pos : null, ANA.ativa ? ANA.pos : null]) if (ent && Math.hypot(ent.x - f.d.x, ent.z - f.d.z) < 1.4) pes = 1;
        const sp = lerp(sombraPes.get(f) || 0, pes, Math.min(1, dt * 6)); sombraPes.set(f, sp);
        if (sp > .02) alvo *= 1 - sp * (.55 + .45 * Math.abs(Math.sin(t * 5.5)));
      }
      f.m.material.opacity = lerp(f.m.material.opacity, alvo, Math.min(1, dt * 12));
      if (cor) f.m.material.color.copy(cor);
      f.m.visible = f.m.material.opacity > .01;
    }
    // manchas de luz no chão: seguem o bulbo que balança e falham junto com a lâmpada
    for (const p of POCAS) {
      const Lp = p.L, k = Lp.luz.intensity / Math.max(1, Lp.base || 6);
      p.m.material.opacity = clamp(k, 0, 1.3) * .2; p.m.visible = p.m.material.opacity > .01 && Math.hypot(Lp.x - P.pos.x, Lp.z - P.pos.z) < 26;
      if (p.m.visible) p.m.position.set(Lp.bulbo.position.x, p.y, Lp.bulbo.position.z);
    }
    // objetivo cumprido: as lâmpadas da sala dão um respiro quente
    const n = Object.keys(S.done || {}).length;
    if (doneN >= 0 && n > doneN && ativo && !(M.ativo && M.state === 'caca') && !OPT.vFlash) pulsoObj = 1.2;
    doneN = n;
    if (pulsoObj > 0) { pulsoObj -= dt; const k = 1 + .55 * Math.sin((1 - pulsoObj / 1.2) * Math.PI); for (const Lp of W.lampadas) if (Lp.sala === P.room && Lp.luz.intensity > .1) modLamp(Lp, k); }
    // portas batendo: poeira do batente e a lâmpada mais perto balança e falha uma vez
    for (const d of W.doors) {
      if (d._polT === undefined) { d._polT = d.target; continue; }
      if (d.target === d._polT) continue;
      const fechou = d.target === 0; d._polT = d.target;
      const dist = Math.hypot(d.x - P.pos.x, d.z - P.pos.z);
      if (dist > 10 || !ativo) continue;
      if (fechou || (M.ativo && Math.hypot(M.pos.x - d.x, M.pos.z - d.z) < 2.5)) {
        for (let i = 0; i < 14; i++) { const o = rand(-.45, .45); particula(d.x + (d.eixo === 'x' ? o : rand(-.05, .05)), 2.05 + rand(0, .1), d.z + (d.eixo === 'x' ? rand(-.05, .05) : o), rand(-.08, .08), rand(-.1, .05), rand(-.08, .08), rand(1, 1.8), .55, .5, .42, .25); }
      }
      if (dist < 2.2 && !fechou) H.portaT = .45; // a mão livre empurra a porta
      let melhor = null, md = 6; for (const Lp of W.lampadas) { const dd = Math.hypot(Lp.x - d.x, Lp.z - d.z); if (dd < md && Lp.luz.intensity > .1) { md = dd; melhor = Lp; } }
      if (melhor) { melhor.amp = .09; if (!OPT.vFlash) lampFalha.set(melhor, .1); }
    }
    for (const [Lp, tt] of lampFalha) { const r = tt - dt; if (r <= 0) lampFalha.delete(Lp); else { lampFalha.set(Lp, r); modLamp(Lp, .12, .2); } }
    // cacos de vidro cintilam na lanterna
    if (C.MAT_CACO) C.MAT_CACO.emissiveIntensity = flash.intensity > 3 ? .7 + (Math.random() < .3 ? rand(.6, 1.8) : 0) : .7;
  }

  // =================================================================== A MENINA: olhos que refletem a lanterna; olhos no canto
  const TX_OLHO = ctex(32, 32, (g, w, h) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,235,1)'); gr.addColorStop(.3, 'rgba(220,235,190,.7)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const olhoMat = new THREE.SpriteMaterial({ map: TX_OLHO, color: 0xe8f0d0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const reflexo = [];
  if (V.ANAX && V.ANAX.head) for (const s of [-1, 1]) { const o = new THREE.Sprite(olhoMat); o.scale.setScalar(.05); o.position.set(s * .04, .16, .15); V.ANAX.head.add(o); reflexo.push(o); }
  const olhosCanto = new THREE.Group(); scene.add(olhosCanto); olhosCanto.visible = false;
  const olhoCantoMat = olhoMat.clone();
  for (const s of [-1, 1]) { const o = new THREE.Sprite(olhoCantoMat); o.scale.setScalar(.045); o.position.x = s * .045; olhosCanto.add(o); }
  let olhoCantoT = 0, olhoCantoCd = 60; const olhoCap = {};
  function olhos(dt, ativo, S) {
    if (reflexo.length) {
      let a = 0;
      if (ANA.ativa && ANA_visivel() && flash.intensity > 3) {
        V.ANAX.head.getWorldPosition(v1); v2.copy(v1).sub(camera.position); const d = v2.length(); camera.getWorldDirection(fw);
        const dot = fw.dot(v2.normalize()); if (d > 6) a = clamp((dot - .975) / .02, 0, 1) * clamp((d - 6) / 3, 0, 1);
      }
      olhoMat.opacity = lerp(olhoMat.opacity, a * .9, Math.min(1, dt * 10));
    }
    // segredo: num canto escuro, dois pontinhos refletem a luz e somem (uma vez por capítulo)
    olhoCantoCd -= dt;
    if (olhoCantoT > 0) { olhoCantoT -= dt; olhoCantoMat.opacity = Math.min(1, olhoCantoT * 4) * .8; if (olhoCantoT <= 0) olhosCanto.visible = false; }
    else if (ativo && olhoCantoCd <= 0 && !olhoCap[S.chapter] && S.chapter >= 1 && S.flashOn && !S.hidden && !ANA.ativa && P.room && !P.room.fora && !(M.ativo && M.state === 'caca')) {
      olhoCantoCd = 45;
      if (Math.random() < .35) {
        camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
        const lado = Math.random() < .5 ? -1 : 1, a = Math.atan2(fw.x, fw.z) + lado * .5;
        L.rc.far = 9; L.rc.set(v1.set(camera.position.x, 1, camera.position.z), v2.set(Math.sin(a), 0, Math.cos(a)));
        const h = L.rc.intersectObjects(W.solid, false)[0]; L.rc.far = 1.3;
        if (h && h.distance > 3.5) { olhosCanto.position.copy(h.point).addScaledVector(v2, -.25); olhosCanto.position.y = rand(.75, 1.05); olhosCanto.visible = true; olhoCantoT = .55; olhoCap[S.chapter] = true; }
      }
    }
  }
  const ANA_visivel = () => !!(V.ANAX && ANA.ativa && C.ANA_G && C.ANA_G.visible !== false);

  // =================================================================== CÂMERA COM CORPO
  const K = { hPrev: null, cy: 0, cv: 0, roll: 0, resp: 0, prendeAnt: false, ofego: 0, yawPrev: null, empY: 0, empV: 0, hidPrev: undefined, trans: new THREE.Vector3(), transT: 0, camPrev: new THREE.Vector3(), peito: 0, crouchPrev: false };
  function empurrao(x, z, r) { // som forte: a cabeça vira por reflexo para o lado de onde veio
    const S = C.S; if (!S || C.mode !== 'jogo' || camK() <= 0) return;
    const d = Math.hypot(P.pos.x - x, P.pos.z - z); if (d < 1.6 || r < 4) return;
    v1.set(x, camera.position.y, z); camera.worldToLocal(v1);
    K.empV += Math.sign(-v1.x || 1) * Math.min(.5, r / (d * d + 6) * .9) * camK();
  }
  function cameraCorpo(dt, ativo, S, t) {
    // transição do esconderijo: a câmera desliza em vez de cortar
    if (S.hidden !== K.hidPrev) {
      if (ativo && K.hidPrev !== undefined && camK() > 0) { K.trans.copy(K.camPrev).sub(camera.position); if (K.trans.length() < 3) K.transT = .35; }
      K.hidPrev = S.hidden;
    }
    if (!ativo) { K.camPrev.copy(camera.position); return; }
    if (K.transT > 0) { K.transT = Math.max(0, K.transT - dt); const k = K.transT / .35; camera.position.addScaledVector(K.trans, ease(k)); }
    const ck = camK();
    // esconderijo: o peito sobe e desce, mais rápido com medo; prender o ar para
    if (S.hidden) {
      K.peito += dt * (P.prende ? 0 : lerp(1.6, 4.2, S.fear / 100));
      if (ck > 0) camera.position.y += Math.sin(K.peito) * .006 * (1 + S.fear / 100) * ck;
      K.camPrev.copy(camera.position); return;
    }
    if (P.bloqueado) { K.camPrev.copy(camera.position); return; }
    const anda = keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD, st = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    // agachar com mola: passa do ponto e volta
    if (P.crouch !== K.crouchPrev) { K.cv += P.crouch ? -.55 : .25; K.crouchPrev = P.crouch; }
    K.cv += (-K.cy * 140 - K.cv * 13) * dt; K.cy += K.cv * dt;
    // respiração parada; prender o ar congela, soltar puxa o ar
    K.resp += dt * (P.prende ? 0 : lerp(1.3, 3.4, S.fear / 100));
    if (K.prendeAnt && !P.prende) K.cv -= .18;
    K.prendeAnt = !!P.prende;
    K.ofego = lerp(K.ofego, !anda && S.stamina < 45 ? (45 - S.stamina) / 45 : 0, Math.min(1, dt * 2)); // ofegante depois de correr
    // roll: andar de lado e virar correndo
    if (K.yawPrev === null) K.yawPrev = P.yaw;
    let dy = P.yaw - K.yawPrev; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); K.yawPrev = P.yaw;
    const vy = dy / Math.max(dt, 1e-3);
    const rollAlvo = (P.crouch ? .5 : 1) * (-st * .014 + (P.sprinting ? clamp(vy * .02, -.052, .052) : 0));
    K.roll = lerp(K.roll, rollAlvo, Math.min(1, dt * 6));
    // tranco do som forte (mola)
    K.empV += (-K.empY * 90 - K.empV * 11) * dt; K.empY += K.empV * dt;
    // piso: água lenta e funda, terra e grama escorregam de lado, madeira afunda curto no passo
    let px = 0, py = 0, pr = 0;
    if (anda && P.room) {
      const piso = P.room.piso || (P.room.fora ? 'grama' : '');
      if (P.naAgua) { py += Math.sin(P.bob * .9) * .022; pr += Math.sin(P.bob * .9) * .01; }
      else if (piso === 'grama' || piso === 'terra') px += Math.sin(P.bob) * .012;
      else if (piso === 'madeira') py -= Math.pow(Math.max(0, Math.sin(P.bob * 2)), 6) * .012;
    }
    if (ck > 0) {
      const b = bobOn() ? 1 : 0;
      camera.position.y += (K.cy + (anda ? 0 : Math.sin(K.resp) * .003 * (1 + S.fear / 60) * b + Math.sin(t * 2.6) * .008 * K.ofego * b) + py * b) * ck;
      if (px) { camera.getWorldDirection(fw); camera.position.x += -fw.z * px * ck * b; camera.position.z += fw.x * px * ck * b; }
      camera.rotation.z += (K.roll * b + pr * b) * ck + G.jr * .4;
      camera.rotation.y += K.empY * .012 + G.jr * .06;
    }
    K.camPrev.copy(camera.position);
  }

  // =================================================================== TELA: gotas de chuva, ar preso, embaçado, pálpebras, notas
  const GOTAS = [];
  let molhaT = 0;
  function gotas(dt, ativo, S) {
    const fora = P.room && P.room.fora && (W.mapa === 'estrada' || W.mapa === 'cemiterio');
    const chove = fora && C.chuvaMat && C.chuvaMat.opacity > .05;
    const max = qual() === 'baixa' ? 12 : 40;
    if (ativo && chove) {
      const olhaCima = clamp((P.pitch - .2) / .5, 0, 1), contra = P.sprinting ? .5 : 0; // olhar para o céu ou correr contra a chuva molha a lente
      if (Math.random() < (olhaCima * 9 + contra * 3) * dt && GOTAS.length < max) GOTAS.push({ x: rand(0, 320), y: rand(0, 150), r: rand(2, 6), v: 0, vida: rand(2, 3.5), seca: false });
    }
    if (ativo && W.mapa === 'tuneis' && P.naAgua && P.sprinting) molhaT = Math.random() < dt * 4 ? 3 : molhaT; // respingo da água dos túneis
    if (molhaT > 0) { molhaT -= dt; if (molhaT > 2.6 && GOTAS.length < max && Math.random() < .5) GOTAS.push({ x: rand(0, 320), y: rand(90, 175), r: rand(1.5, 4), v: 0, vida: 3, seca: false }); }
    const coberto = !fora || !chove;
    if (!GOTAS.length) { if (elGotas.style.opacity !== '0') { gGotas.clearRect(0, 0, 320, 180); elGotas.style.opacity = 0; } return; }
    elGotas.style.opacity = 1;
    gGotas.clearRect(0, 0, 320, 180);
    const luz = 1 + (C.raioI || 0) * 2.4; // no relâmpago as gotas acendem
    for (let i = GOTAS.length - 1; i >= 0; i--) {
      const g = GOTAS[i]; g.vida -= dt * (coberto ? 2.2 : 1) * (P.pitch < -.1 ? 1.6 : 1);
      if (g.vida <= 0 || g.y > 190) { GOTAS.splice(i, 1); continue; }
      if (g.r > 3.5 || g.vida < 1.5) g.v += dt * rand(4, 14); g.y += g.v * dt * 6; // as grandes escorrem
      const a = Math.min(1, g.vida) * .5;
      const gr = gGotas.createRadialGradient(g.x - g.r * .3, g.y - g.r * .3, 0, g.x, g.y, g.r);
      gr.addColorStop(0, `rgba(230,236,246,${(a * .9 * luz).toFixed(3)})`); gr.addColorStop(.55, `rgba(120,130,150,${(a * .35).toFixed(3)})`); gr.addColorStop(1, `rgba(10,12,16,${(a * .5).toFixed(3)})`);
      gGotas.fillStyle = gr; gGotas.beginPath(); gGotas.ellipse(g.x, g.y, g.r, g.r * 1.15, 0, 0, 7); gGotas.fill();
      if (g.v > 2) { gGotas.fillStyle = `rgba(150,160,180,${(a * .25).toFixed(3)})`; gGotas.fillRect(g.x - .6, g.y - g.v * 1.2, 1.2, g.v * 1.2); }
    }
  }
  let arT = 0, emb = 0;
  function telas(dt, ativo, S, t) {
    // prender o ar: as bordas escurecem aos poucos; no fim do fôlego ficam roxas e a imagem treme
    arT = P.prende && ativo ? Math.min(1, arT + dt / 3) : Math.max(0, arT - dt * 2.5);
    const fim = P.prende && S.ar < 20 ? (20 - S.ar) / 20 : 0;
    const opAr = (arT * .55 + fim * .35).toFixed(3);
    if (opAr !== elAr._op || fim > 0) { elAr._op = opAr;
      elAr.style.setProperty('--c', fim > 0 ? '52,8,60' : '0,0,0'); elAr.style.opacity = opAr;
      elAr.style.transform = fim > 0 && OPT.vCam > 0 ? `translate(${rand(-2, 2) * fim | 0}px,${rand(-2, 2) * fim | 0}px)` : '';
    }
    // dentro do armário as frestas embaçam com a respiração; prender o ar para
    if (ativo && S.hidden && S.hidden.tipo === 'armario') emb = clamp(emb + dt * (P.prende ? -.04 : .018 * (1 + S.fear / 60)), 0, 1); else emb = Math.max(0, emb - dt * .8);
    const opE = (emb * .85).toFixed(3); if (elEmb._op !== opE) { elEmb._op = opE; elEmb.style.opacity = opE; }
    // a nota treme na mão com o medo e com ele perto
    const pap = $('#note .paper');
    if (pap) {
      const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;
      if (C.ui === 'nota' && OPT.vCam > 0) { const a = Math.max(0, (S.fear - 40) / 60) * 2.2 + (dM < 8 ? (8 - dM) / 8 * 2 : 0); pap.style.transform = a > .1 ? `translate(${(Math.sin(t * 23) * a).toFixed(1)}px,${(Math.sin(t * 19 + 1) * a).toFixed(1)}px) rotate(${(Math.sin(t * 7) * a * .12).toFixed(2)}deg)` : ''; }
      else if (pap.style.transform) pap.style.transform = '';
    }
    // mira e texto de interação tremem com medo alto; prender o ar firma
    const tr = ativo && S.fear > 80 && !P.prende && OPT.vCam > 0 ? (S.fear - 80) / 20 * 1.4 : 0;
    for (const sel of ['#cross', '#prompt']) { const el = $(sel); if (!el) continue; const s = tr ? `translate(${(Math.sin(t * 29 + sel.length) * tr).toFixed(1)}px,${(Math.sin(t * 31) * tr).toFixed(1)}px)` : ''; if (el.style.translate !== s) el.style.translate = s; }
  }
  // pálpebras ao voltar do checkpoint e ao trocar de mapa
  let palpT = -1, palpEspera = 0;
  function palpebras(dt) {
    if (palpT < 0) return;
    if (C.mode !== 'jogo' || C.ui) { palpEspera += dt; if (palpEspera > 12) palpT = -1; palpA.hidden = palpB.hidden = palpT < 0 || C.mode !== 'jogo'; return; }
    palpT += dt; palpA.hidden = palpB.hidden = false;
    let o; const k = palpT;
    if (OPT.vCam <= 0) o = clamp(k / .6, 0, 1); // câmera mínima: só um fade
    else o = k < .12 ? 0 : k < .3 ? (k - .12) / .18 * .45 : k < .4 ? .45 - (k - .3) / .1 * .4 : k < 1 ? .05 + ease((k - .4) / .6) * .95 : 1;
    if (OPT.vCam <= 0) { palpA.style.transform = palpB.style.transform = ''; palpA.style.opacity = palpB.style.opacity = (1 - o).toFixed(3); }
    else { palpA.style.opacity = palpB.style.opacity = 1; palpA.style.transform = `translateY(${(-o * 105).toFixed(1)}%)`; palpB.style.transform = `translateY(${(o * 105).toFixed(1)}%)`; }
    if (o >= 1) { palpT = -1; palpA.hidden = palpB.hidden = true; }
  }

  // =================================================================== PARTÍCULAS DO CORPO: poeira dos pés, bafo, pegadas molhadas
  const bafo = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_SUAVE, color: 0xdfe6ee, transparent: true, opacity: 0, depthWrite: false, fog: false })); camera.add(bafo); let bafoT = 0;
  let passoPrev = 0, molhada = 0, pegCap = {}, pegCd = 70;
  function corpo(dt, ativo, S) {
    // poeira dos pés ao correr; respingo na água; lama no cemitério
    if (ativo && !S.hidden && P.stepAcc < passoPrev - .2 && (P.sprinting || P.naAgua)) {
      const piso = P.room ? P.room.piso || (P.room.fora ? 'grama' : 'pedra') : 'pedra';
      camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
      const cor = P.naAgua ? [.55, .62, .66] : W.mapa === 'cemiterio' ? [.3, .24, .18] : piso === 'madeira' ? [.5, .42, .32] : [.42, .4, .36];
      for (let i = 0; i < (P.naAgua ? 8 : 5); i++) particula(P.pos.x + fw.x * .35 + rand(-.15, .15), P.naAgua ? (W.agua.length ? W.agua[0].position.y : .4) + .03 : .06, P.pos.z + fw.z * .35 + rand(-.15, .15), rand(-.3, .3), P.naAgua ? rand(.6, 1.2) : rand(.15, .4), rand(-.3, .3), rand(.4, .8), cor[0], cor[1], cor[2]);
    }
    passoPrev = P.stepAcc;
    // bafo grande ao soltar o ar preso no frio
    const frio = W.mapa === 'estrada' || W.mapa === 'cemiterio' || W.mapa === 'tuneis' || (P.room && P.room.fora);
    if (K.prendeAnt && !P.prende && frio && ativo) bafoT = 1;
    if (bafoT > 0) { bafoT -= dt * .8; const k = 1 - bafoT; bafo.material.opacity = Math.sin(Math.min(1, k * 1.4) * Math.PI) * .2; bafo.scale.setScalar(.3 + k * .9); bafo.position.set(0, -.15 + k * .12, -.45 - k * .3); } else bafo.material.opacity = 0;
    // pegadas molhadas da Lia que secam
    if (P.naAgua) molhada = 40; else if (P.room && P.room.fora && C.chuvaMat && C.chuvaMat.opacity > .05) molhada = Math.max(molhada, 22);
    molhada = Math.max(0, molhada - dt);
    if (ativo && molhada > 0 && P.room && !P.room.fora && !P.naAgua && !S.hidden && V.pegadaSe) V.pegadaSe('lia', P.pos, P.yaw + Math.PI, .62, 8 + molhada * .6);
    // segredo: pegadas pequenas que não são suas vão até um armário (uma vez por capítulo)
    pegCd -= dt;
    if (ativo && pegCd <= 0 && !pegCap[S.chapter] && S.chapter >= 1 && S.chapter <= 4 && S.flashOn && !ANA.ativa && !S.hidden && P.room && !P.room.fora && V.pegada) {
      pegCd = 40;
      const arm = W.lockers.filter(l => l.tipo === 'armario' && Math.hypot(l.x - P.pos.x, l.z - P.pos.z) < 7 && Math.hypot(l.x - P.pos.x, l.z - P.pos.z) > 2.5 && C.roomAt(l.x, l.z) === P.room);
      if (arm.length && Math.random() < .5) {
        const l = pick(arm); camera.getWorldDirection(fw);
        const sx = P.pos.x + fw.x * 1.4, sz = P.pos.z + fw.z * 1.4, dx = l.x + l.face[0] * .5 - sx, dz = l.z + l.face[1] * .5 - sz, n = Math.max(2, Math.floor(Math.hypot(dx, dz) / .38)), yaw = Math.atan2(dx, dz);
        for (let i = 0; i <= n; i++) V.pegada('ana', sx + dx * i / n, sz + dz * i / n, yaw, 18 + i * .4);
        pegCap[S.chapter] = true;
      }
    }
  }

  // =================================================================== FEIXE: poeira mais densa nas salas velhas
  const VELHAS = /enferm|deposit|depósit|sotao|sótão|biblio|roupa|despensa|porao|porão|maquin|máquin/i;
  function feixe(S) {
    if (!V.poMat || !V.coneMat || flash.intensity / 30 <= .02) return; // só quando o feixe acabou de ser montado neste quadro
    const r = P.room; let k = 1;
    if (r && !r.fora && (VELHAS.test(r.id || '') || VELHAS.test(r.nome || ''))) k = 1.8;
    if (r && r.fora && C.chuvaMat && C.chuvaMat.opacity > .05) k = .6; // na chuva a poeira some
    V.poMat.opacity *= k; V.coneMat.opacity *= lerp(1, k, .6);
    void S;
  }

  // =================================================================== CONTORNO DO QUE DÁ PARA USAR (baixa visão)
  const contMat = new THREE.MeshBasicMaterial({ color: 0xf2ead8, side: THREE.BackSide, transparent: true, opacity: .3, depthWrite: false, fog: false });
  compart(contMat);
  let contAtual = null; const contCache = new Map();
  const naoRaio = () => {};
  function contornoDe(obj) {
    let l = contCache.get(obj); if (l) return l;
    l = [];
    obj.traverse(o => {
      if (!o.isMesh || o.userData.polCont || o.isInstancedMesh || !o.geometry) return;
      const c = new THREE.Mesh(o.geometry, contMat); c.scale.setScalar(1.045); c.userData.polCont = true; c.raycast = naoRaio; c.visible = false; c.renderOrder = 4;
      l.push({ o, c });
    });
    for (const { o, c } of l) o.add(c);
    contCache.set(obj, l); return l;
  }
  function contorno(dt, ativo, S, t) {
    const a = C.alvo, quer = ativo && OPT.vReal && S.dif !== 'pesadelo' && a && a.obj && !(a.on && !a.on()) && !S.hidden;
    let alvoObj = null;
    if (quer) { a.obj.getWorldPosition(v1); if (v1.distanceTo(camera.position) < 3.2) alvoObj = a.obj; }
    if (contAtual && contAtual !== alvoObj) { for (const { c } of contornoDe(contAtual)) c.visible = false; contAtual = null; }
    if (alvoObj) { contAtual = alvoObj; for (const { c } of contornoDe(alvoObj)) c.visible = true; contMat.opacity = .16 + .2 * (.5 + .5 * Math.sin(t * 4)); contMat.color.setHex(PO().dalt && PO().dalt !== 'nao' ? 0xffd23c : 0xf2ead8); }
  }

  // =================================================================== MORTE: quadro negativo e queimando
  let queimaT = -1;
  function morte(quem) {
    queimaT = 0;
    if (!OPT.vFlash) { canvas.style.transition = 'none'; const f0 = canvas.style.filter; setTimeout(() => { canvas.style.filter = (f0 || '') + ' invert(1)'; setTimeout(() => { canvas.style.filter = f0; }, 80); }, 430); }
    void quem;
  }
  function queima(dt) {
    if (queimaT < 0) return;
    const S = C.S; if (!S || !S.dead) { queimaT = -1; elQueima.style.opacity = 0; return; }
    queimaT += dt; const k = clamp((queimaT - .5) / 1.1, 0, 1);
    elQueima.style.setProperty('--q', ((1 - k) * 92).toFixed(1) + '%');
    elQueima.style.opacity = (OPT.vFlash ? k * .6 : Math.min(1, k * 1.5)).toFixed(3);
    elQueima.style.filter = OPT.vFlash ? 'saturate(0)' : '';
  }

  // =================================================================== FITA: estilo 240 linhas, letreiro de PLAY e o código secreto
  let retroPR = 0, retroAtivo = false, retroT = 0;
  function retro() {
    if (OPT.vRetro) {
      const pr = renderer.getPixelRatio(), f = Math.min(1, 400 / Math.max(1, innerWidth * pr));
      renderer.setSize(Math.max(160, Math.round(innerWidth * f)), Math.max(90, Math.round(innerHeight * f)), false);
      canvas.style.imageRendering = 'pixelated'; retroPR = pr; retroAtivo = true;
      const px = innerWidth / 400; elDither.style.backgroundSize = `${(4 * px).toFixed(1)}px ${(4 * px).toFixed(1)}px`; elDither.style.opacity = .16;
    } else if (retroAtivo) { renderer.setSize(innerWidth, innerHeight, false); canvas.style.imageRendering = ''; retroAtivo = false; elDither.style.opacity = 0; }
  }
  addEventListener('resize', () => { if (OPT.vRetro) retro(); });
  let capPrev = null, playT = 0;
  function fita(dt, S) {
    retroT -= dt; if (retroT <= 0) { retroT = 1; if (OPT.vRetro && renderer.getPixelRatio() !== retroPR) retro(); if (!!OPT.vRetro !== retroAtivo) retro(); }
    // começo de capítulo com o filtro de fita: ▶ PLAY e o contador da fita rodando
    if (capPrev !== S.chapter) { const novo = capPrev !== null; capPrev = S.chapter; if (novo && C.mode === 'jogo' && (OPT.vVhs || OPT.vRetro || S.dif === 'pesadelo')) playT = 4.5; }
    if (playT > 0 && C.mode === 'jogo') {
      playT -= dt; const s = 4.5 - playT; elPlay.hidden = false;
      elPlay.textContent = `▶ PLAY   SP\n${S.chapter}:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s) % 60).padStart(2, '0')}.${String(Math.floor(s * 30) % 30).padStart(2, '0')}`;
      elPlay.style.opacity = playT < .7 ? (playT / .7).toFixed(2) : 1;
      if (playT <= 0) elPlay.hidden = true;
    } else if (!elPlay.hidden && (playT <= 0 || C.mode !== 'jogo')) elPlay.hidden = true;
  }
  const CODIGO = 'REBOBINA'; let digitado = '';
  addEventListener('keydown', e => {
    if (C.mode !== 'titulo' || !/^Key[A-Z]$/.test(e.code)) return;
    digitado = (digitado + e.code.slice(3)).slice(-CODIGO.length);
    if (digitado !== CODIGO) return;
    digitado = '';
    OPT.vVhs = OPT.vVhs ? 0 : 1; if (V.salvar) V.salvar(); if (V.syncUI) V.syncUI();
    let el = $('#pol-segredo'); if (!el) { el = document.createElement('div'); el.id = 'pol-segredo'; document.body.appendChild(el); }
    el.textContent = OPT.vVhs ? '◀◀ fita rebobinada · 14 MAR 1979' : '■ fita ejetada'; el.style.transition = 'none'; el.style.opacity = 1;
    setTimeout(() => { el.style.transition = 'opacity .8s'; el.style.opacity = 0; }, 2600);
  });

  // =================================================================== TEXTURAS NO TAMANHO DA QUALIDADE
  const anisoMax = (() => { try { return renderer.capabilities.getMaxAnisotropy(); } catch (e) { return 4; } })();
  function texturas() {
    const q = qual(), a = q === 'alta' ? Math.min(8, anisoMax) : q === 'media' ? Math.min(4, anisoMax) : 1;
    const feitas = new Set();
    W.grupo && W.grupo.traverse(o => {
      if (!o.isMesh || !o.material) return;
      for (const m of [].concat(o.material)) { const t = m.map; if (!t || feitas.has(t) || !t.isTexture || t.wrapS !== THREE.RepeatWrapping) continue; feitas.add(t); if (t.anisotropy !== a) { t.anisotropy = a; t.needsUpdate = true; } }
    });
  }

  // =================================================================== GANCHOS
  function update(dt, ativo, S, t) {
    golpes(dt, ativo, S);
    animMao(dt, ativo, S, t);
    itens(dt, ativo, S);
    luzes(dt, ativo, S, t);
    olhos(dt, ativo, S);
    cameraCorpo(dt, ativo, S, t);
    gotas(dt, ativo, S);
    telas(dt, ativo, S, t);
    palpebras(dt);
    corpo(dt, ativo, S);
    contorno(dt, ativo, S, t);
    atualizaParticulas(dt);
    queima(dt);
    fita(dt, S);
    feixe(S);
  }
  function depois() {
    for (const [Lp, i, e] of mods) { Lp.luz.intensity = i; Lp.bulbo.material.emissiveIntensity = e; } mods = [];
    desenharMao();
  }
  function mapa() {
    for (const f of VOOS) scene.remove(f.g); VOOS.length = 0; contCache.clear(); contAtual = null; sombraPes.clear(); lampFalha.clear();
    GOTAS.length = 0; molhada = 0; emb = 0; doneN = -1; pulsoObj = 0; olhosCanto.visible = false; olhoCantoT = 0;
    for (let i = 0; i < NPO; i++) { poVida[i] = 0; poPos[i * 3 + 1] = -99; }
    montarLuz(); texturas();
    palpT = 0; palpEspera = 0; // abre os olhos no lugar novo
    if (OPT.vRetro) retro();
  }
  if (OPT.vRetro) setTimeout(retro, 0);
  return { update, lanterna, depois, mapa, morte, tempo, filtro, ruido: empurrao, retro, maoVisivel: () => H.vis };
}
