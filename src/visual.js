// VISUAL E LUZ — câmera, lanterna, partículas, decalques, detalhes dos modelos e efeitos de tela.
// Ganchos em jogo.js: VIS.update(dt, ativo) antes de desenhar · VIS.hud() no HUD · VIS.mapa() ao carregar um mapa
// · VIS.estrobo(dt) no aviso da Procissão · VIS.morte(quem) ao morrer · VIS.ruido(x, z, r) a cada barulho.
export function instalarVisual(C) {
  const { THREE, scene, camera, renderer, canvas, flash, flashFill, MON, ANA, ANA_G, PROC, M, P, W, OPT, keys } = C;
  const $ = s => document.querySelector(s);
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const pick = a => a[Math.random() * a.length | 0];
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), fw = new THREE.Vector3(), mInv = new THREE.Matrix4();
  function tex(w, h, draw, repete) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (repete) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  const suave = (g, w, h, cor = '255,255,255') => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, `rgba(${cor},1)`); gr.addColorStop(1, `rgba(${cor},0)`); g.fillStyle = gr; g.fillRect(0, 0, w, h); };
  const TX_SUAVE = tex(64, 64, (g, w, h) => suave(g, w, h));

  // =================================================================== OPÇÕES DE IMAGEM
  const DEF = { vFov: 72, vCam: 2, vFlash: 0, vBlur: 1, vBrilho: 1, vVhs: 0, vCalib: 0 };
  for (const k in DEF) if (typeof OPT[k] !== 'number' || isNaN(OPT[k])) OPT[k] = DEF[k];
  const salvar = () => C.lsSet(C.OPT_KEY, OPT);
  const aplicarBrilho = () => { renderer.toneMappingExposure = 1.1 * OPT.vBrilho; };
  aplicarBrilho();

  const css = document.createElement('style');
  css.textContent = `
.vis-fx{position:fixed;inset:0;pointer-events:none}
#vis-pulso{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 42%,rgba(95,0,0,.9) 100%);opacity:0}
#vis-tunel{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 24%,rgba(0,0,0,.97) 80%);opacity:0}
#vis-geada{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 46%,rgba(160,200,235,.45) 100%);opacity:0;mix-blend-mode:screen}
#vis-rachas{opacity:0;background-size:100% 100%}
#vis-scan{background:repeating-linear-gradient(180deg,rgba(0,0,0,.32) 0 1px,transparent 1px 3px);opacity:0}
#vis-vhs{width:100%;height:100%;opacity:0;image-rendering:pixelated;mix-blend-mode:screen}
#vis-rec{position:absolute;left:50%;top:18px;transform:translateX(-50%);font-family:"Special Elite",monospace;font-size:19px;letter-spacing:.1em;color:#e8e2d0;text-shadow:0 0 4px #000,2px 0 rgba(255,0,0,.45),-2px 0 rgba(0,120,255,.45);white-space:nowrap}
#vis-rec b{color:#d62a1e;font-weight:normal}
.vis-opts{display:flex;gap:14px 24px;flex-wrap:wrap;justify-content:center;align-items:center;max-width:min(980px,92vw)}
.vis-opts label{display:flex;align-items:center;gap:8px}
.vis-opts select{background:#0c0a08;color:var(--ui);border:1px solid #3a3228;font-family:inherit;font-size:13px;padding:2px 4px}
#title .vis-opts{margin-top:14px;font-family:"IM Fell English SC";font-size:13px;letter-spacing:.1em;color:var(--fraco)}
#pause .vis-opts{gap:10px 22px;margin:-8px 0 18px;font-family:"IM Fell English SC";font-size:14px;letter-spacing:.1em;color:var(--fraco)}
#vis-calib{background:rgba(0,0,0,.97);z-index:50;gap:16px;padding:16px;text-align:center}
#vis-calib h2{font-family:"IM Fell English SC";letter-spacing:.14em;font-weight:normal;font-size:clamp(22px,3vw,32px)}
#vis-calib p{max-width:640px;color:var(--fraco);font-style:italic;line-height:1.5}
#vis-calib .aviso{border:1px solid #3a3228;padding:12px 16px;color:var(--ui);font-style:normal}
#vis-calib label{font-family:"IM Fell English SC";letter-spacing:.1em;display:flex;gap:10px;align-items:center}
#vis-calib .simb{display:flex;gap:28px;justify-content:center;background:#000;padding:18px 26px}
#vis-calib .simb i{width:64px;height:64px;display:block;clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%)}
`;
  document.head.appendChild(css);

  function controles(pref) {
    const d = document.createElement('div'); d.className = 'vis-opts';
    d.innerHTML = `<label>Brilho <input type="range" id="${pref}-brilho" min="0.6" max="1.6" step="0.05"></label>
<label>Campo de visão <input type="range" id="${pref}-fov" min="60" max="90" step="1"></label>
<label>Câmera <select id="${pref}-cam"><option value="2">movimento completo</option><option value="1">movimento reduzido</option><option value="0">movimento mínimo</option></select></label>
<label><input type="checkbox" id="${pref}-flash"> Reduzir flashes</label>
<label><input type="checkbox" id="${pref}-blur"> Desfoque de pânico</label>
<label><input type="checkbox" id="${pref}-vhs"> Filtro de fita VHS</label>`;
    return d;
  }
  const optTit = $('#title .opts'), optPau = $('#pause .set');
  if (optTit) optTit.after(controles('vo'));
  if (optPau) optPau.after(controles('vp'));
  const CAMPOS = { brilho: 'vBrilho', fov: 'vFov', cam: 'vCam', flash: 'vFlash', blur: 'vBlur', vhs: 'vVhs' };
  function syncUI() { for (const p of ['vo', 'vp']) for (const [id, k] of Object.entries(CAMPOS)) { const el = $(`#${p}-${id}`); if (!el) continue; if (el.type === 'checkbox') el.checked = !!OPT[k]; else el.value = OPT[k]; } }
  function setV(k, v) { OPT[k] = +v; salvar(); if (k === 'vBrilho') aplicarBrilho(); syncUI(); }
  for (const p of ['vo', 'vp']) for (const [id, k] of Object.entries(CAMPOS)) {
    const el = $(`#${p}-${id}`); if (!el) continue;
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', () => setV(k, el.type === 'checkbox' ? (el.checked ? 1 : 0) : el.value));
  }
  syncUI();

  // Primeira vez: aviso de fotossensibilidade + calibração de brilho antes de jogar
  const cal = document.createElement('div'); cal.id = 'vis-calib'; cal.className = 'screen'; cal.hidden = true;
  cal.innerHTML = `<h2>Antes de entrar</h2>
<p class="aviso">Aviso de fotossensibilidade: este jogo tem relâmpagos, lâmpadas piscando e uma lanterna que falha. Se luzes piscando fazem mal a você, ligue “Reduzir flashes”. Dá para mudar depois no menu e na pausa.</p>
<label><input type="checkbox" id="vc-flash"> Reduzir flashes</label>
<p>Ajuste o brilho até o símbolo da esquerda quase sumir no escuro. O da direita precisa continuar visível.</p>
<div class="simb" id="vc-simb"><i style="background:#0a0a0a"></i><i style="background:#151515"></i><i style="background:#242424"></i></div>
<label>Brilho <input type="range" id="vc-brilho" min="0.6" max="1.6" step="0.05"></label>
<button class="btn" id="vc-ok">Começar</button>`;
  document.body.appendChild(cal);
  let depoisCal = null;
  const prevCal = () => { $('#vc-simb').style.filter = `brightness(${(OPT.vBrilho * 1.5).toFixed(2)})`; };
  $('#vc-brilho').addEventListener('input', e => { setV('vBrilho', e.target.value); prevCal(); });
  $('#vc-flash').addEventListener('change', e => setV('vFlash', e.target.checked ? 1 : 0));
  $('#vc-ok').addEventListener('click', () => { OPT.vCalib = 1; salvar(); cal.hidden = true; const cb = depoisCal; depoisCal = null; if (cb) cb(); });
  document.addEventListener('click', e => {
    if (!e.isTrusted || OPT.vCalib || window.__teste) return;
    const b = e.target && e.target.closest && e.target.closest('#b-novo, #b-cont');
    if (!b) return;
    e.stopImmediatePropagation(); e.preventDefault();
    depoisCal = () => b.click(); $('#vc-flash').checked = !!OPT.vFlash; $('#vc-brilho').value = OPT.vBrilho; prevCal(); cal.hidden = false;
  }, true);

  // =================================================================== CAMADAS DE TELA
  const ref = $('#fx-red');
  function camada(id, tag = 'div') { const e = document.createElement(tag); e.id = id; e.className = 'vis-fx'; ref.after(e); return e; }
  const elPulso = camada('vis-pulso'), elTunel = camada('vis-tunel'), elGeada = camada('vis-geada'), elRachas = camada('vis-rachas'), elScan = camada('vis-scan');
  const elVhs = camada('vis-vhs', 'canvas'); elVhs.width = 160; elVhs.height = 90; const gVhs = elVhs.getContext('2d');
  { // rachaduras nas bordas (lidas sem depender de cor)
    const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d');
    g.strokeStyle = 'rgba(10,0,0,.85)'; g.lineCap = 'round';
    for (let i = 0; i < 16; i++) {
      const lado = i % 4; let x = lado === 0 ? 0 : lado === 1 ? 640 : rand(0, 640), y = lado === 2 ? 0 : lado === 3 ? 360 : rand(0, 360);
      g.lineWidth = rand(1.5, 3.5); g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 7; k++) { x += (320 - x) * rand(.04, .12) + rand(-14, 14); y += (180 - y) * rand(.04, .12) + rand(-14, 14); g.lineTo(x, y); if (Math.random() < .3) { g.moveTo(x, y); g.lineTo(x + rand(-30, 30), y + rand(-30, 30)); g.moveTo(x, y); } }
      g.stroke();
    }
    elRachas.style.backgroundImage = `url(${c.toDataURL()})`;
  }
  const elRec = document.createElement('div'); elRec.id = 'vis-rec'; elRec.hidden = true; ($('#hud') || document.body).appendChild(elRec);
  const grainEl = $('#fx-grain'), vigEl = $('#fx-vignette'), hudEl = $('#hud');
  // aberração cromática (canal vermelho deslocado) via filtro SVG
  const svgNS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute';
  svg.innerHTML = '<filter id="vis-cromo" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r"/><feOffset id="vis-cromo-dx" in="r" dx="3" dy="0" result="r2"/><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" result="gb"/><feBlend in="r2" in2="gb" mode="screen"/></filter>';
  document.body.appendChild(svg);
  const cromoDx = svg.querySelector('#vis-cromo-dx');

  // =================================================================== LANTERNA: feixe e poeira
  const COR0 = new THREE.Color(0xfff0d2), COR1 = new THREE.Color(0xff9a3a);
  const coneTex = tex(8, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.1, 'rgba(255,255,255,0)'); gr.addColorStop(.32, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const coneGeo = new THREE.ConeGeometry(Math.tan(.4) * 7, 7, 24, 1, true); coneGeo.translate(0, -3.5, 0); coneGeo.rotateX(Math.PI / 2);
  const coneMat = new THREE.MeshBasicMaterial({ map: coneTex, color: 0xffe6c0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const cone = new THREE.Mesh(coneGeo, coneMat); cone.frustumCulled = false; cone.position.copy(flash.position); camera.add(cone);
  const NP = 120, poGeo = new THREE.BufferGeometry(), poPos = new Float32Array(NP * 3), poVel = new Float32Array(NP * 3);
  poGeo.setAttribute('position', new THREE.BufferAttribute(poPos, 3));
  const poMat = new THREE.PointsMaterial({ map: TX_SUAVE, color: 0xffe6c0, size: .02, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const poeira = new THREE.Points(poGeo, poMat); poeira.frustumCulled = false; scene.add(poeira);
  let poIni = false;
  function semente(i) { // nasce dentro do cone da lanterna, em coordenadas da câmera, e vai para o mundo
    const z = -rand(.5, 4.8), r = Math.tan(.34) * -z * Math.sqrt(Math.random()), a = rand(0, 6.283);
    v1.set(flash.position.x * (1 + z / 5) + Math.cos(a) * r, -.15 + Math.sin(a) * r, z).applyMatrix4(camera.matrixWorld);
    poPos[i * 3] = v1.x; poPos[i * 3 + 1] = v1.y; poPos[i * 3 + 2] = v1.z;
    poVel[i * 3] = rand(-.04, .04); poVel[i * 3 + 1] = rand(-.03, .03); poVel[i * 3 + 2] = rand(-.04, .04);
  }
  let yawS = 0, pitchS = 0, relT = 0, batPrev = 100, interfT = 4, interfOn = 0, twT = 0, twX = 0, estaloPrev = 0, piscaPrev = false;
  function lanterna(dt, ativo, S, t) {
    // a luz vem com atraso atrás da câmera e balança com o passo
    let dy = P.yaw - yawS; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    const kf = 1 - Math.exp(-dt * 10); yawS += dy * kf; pitchS += (P.pitch - pitchS) * kf;
    let rx = P.yaw - yawS; rx = Math.atan2(Math.sin(rx), Math.cos(rx));
    let x = clamp(rx, -.25, .25) * 5, y = -.15 + clamp(pitchS - P.pitch, -.25, .25) * 5;
    if (ativo && !S.hidden) {
      const anda = keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD;
      if (anda) { x += Math.sin(P.bob) * (P.sprinting ? .45 : .1); y += (Math.abs(Math.cos(P.bob)) - .5) * (P.sprinting ? .4 : .08); }
      // mãos tremendo: medo alto e vida baixa
      const amp = (S.fear > 45 ? (S.fear - 45) / 55 * .22 : 0) + (S.health < 35 ? .12 : 0);
      x += (Math.sin(t * 13.1) + Math.sin(t * 7.3 + 1)) * .5 * amp; y += (Math.sin(t * 11.7 + 2) + Math.sin(t * 5.9)) * .5 * amp;
    }
    if (twT > 0) { twT -= dt; x += twX; } // reflexo: a mão vira para o estalo
    flash.target.position.set(x, y, -5);
    if (!ativo) return;
    // pilha acabando: luz amarela/alaranjada e cone mais fechado
    const tb = clamp((30 - S.battery) / 30, 0, 1);
    flash.color.copy(COR0).lerp(COR1, tb); flashFill.color.copy(flash.color); flash.angle = .4 - .1 * tb;
    let mult = 1;
    if (S.battery > batPrev + 40) relT = .6; batPrev = S.battery; // pilha nova: demora para acender
    if (relT > 0) { relT -= dt; mult *= OPT.vFlash ? 1 - relT / .6 : relT > .3 ? 0 : (Math.sin(relT * 70) > 0 ? .8 : .1); }
    if (S.hidden) mult *= S.hidden.tipo === 'armario' ? .3 : .5; // abafada dentro do esconderijo
    if (M.ativo && S.flashOn) { // interferência: ele está perto e fora de vista
      const d = M.pos.distanceTo(P.pos);
      if (d < 6 && !C.visivel(M.pos, 2.2, 8)) { interfT -= dt; if (interfT <= 0) { interfT = rand(2.5, 5); interfOn = .08; } }
    }
    if (interfOn > 0) { interfOn -= dt; mult *= OPT.vFlash ? .5 : 0; }
    flash.intensity *= mult; flashFill.intensity *= mult;
  }
  function feixe(dt, S) {
    const I = flash.intensity / 30;
    const lugar = W.mapa === 'tuneis' ? 'vapor' : P.room && P.room.fora ? 'garoa' : 'poeira';
    v1.copy(flash.target.position).sub(flash.position).normalize();
    cone.quaternion.setFromUnitVectors(v2.set(0, 0, -1), v1);
    cone.visible = I > .02;
    coneMat.opacity = I * (lugar === 'vapor' ? .075 : lugar === 'garoa' ? .06 : .045);
    coneMat.color.copy(flash.color);
    poeira.visible = I > .02;
    if (!poeira.visible) return;
    camera.updateMatrixWorld(); mInv.copy(camera.matrixWorld).invert();
    if (!poIni) { for (let i = 0; i < NP; i++) semente(i); poIni = true; }
    const parado = PROC.fase === 'passando' ? 0 : 1; // a poeira congela no ar quando eles passam
    const vy = lugar === 'vapor' ? .12 : lugar === 'garoa' ? -2.2 : 0;
    for (let i = 0; i < NP; i++) {
      const o = i * 3;
      poPos[o] += poVel[o] * dt * parado; poPos[o + 1] += (poVel[o + 1] + vy) * dt * parado; poPos[o + 2] += poVel[o + 2] * dt * parado;
      v1.set(poPos[o], poPos[o + 1], poPos[o + 2]).applyMatrix4(mInv);
      if (v1.z > -.4 || v1.z < -5.2 || Math.hypot(v1.x - flash.position.x * (1 + v1.z / 5), v1.y + .15) > Math.tan(.38) * -v1.z + .05) semente(i);
    }
    poGeo.attributes.position.needsUpdate = true;
    poMat.size = lugar === 'vapor' ? .055 : lugar === 'garoa' ? .014 : .018;
    poMat.color.setHex(lugar === 'vapor' ? 0xbfc8c2 : lugar === 'garoa' ? 0xb8c6dc : 0xffe6c0).multiply(flash.color);
    poMat.opacity = I * (lugar === 'vapor' ? .09 : .55);
  }

  // =================================================================== VULTOS (sustos de um instante)
  const VUL = (() => {
    const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: 0x020202 });
    const c = (rt, rb, h, x, y, z) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 7), m); o.position.set(x, y, z); g.add(o); return o; };
    c(.2, .36, 1.75, 0, 1.75, 0); c(.06, .04, 1.45, -.15, .72, 0); c(.06, .04, 1.45, .15, .72, 0); c(.3, .2, .35, 0, 2.7, 0);
    for (const s of [-1, 1]) c(.035, .02, 1.9, s * .33, 1.75, 0).rotation.z = s * .07;
    const h = new THREE.Mesh(new THREE.SphereGeometry(.15, 10, 8), m); h.scale.set(.8, 1.5, 1); h.position.set(.06, 3.05, 0); h.rotation.z = .45; g.add(h);
    g.visible = false; scene.add(g); return g;
  })();
  let vulT = 0, vulCool = 10, raioPrev = 0; const vulCap = {};
  function mostrarVulto(x, z, dur) { VUL.position.set(x, 0, z); VUL.rotation.y = Math.atan2(P.pos.x - x, P.pos.z - z); VUL.visible = true; vulT = dur; }
  function vultos(dt, ativo, S) {
    vulCool -= dt;
    if (vulT > 0) { vulT -= dt; if (vulT <= 0) VUL.visible = false; }
    if (!ativo) { raioPrev = C.raioI; piscaPrev = C.flashPisca; return; }
    // relâmpago lá fora: às vezes revela alguém parado longe, só durante o clarão
    const ri = C.raioI;
    if (ri > .3 && raioPrev <= .3 && P.room && P.room.fora && W.mapa !== 'tuneis' && vulCool <= 0 && Math.random() < .34) {
      const a = P.yaw + rand(-.6, .6), d = rand(15, 24), x = P.pos.x - Math.sin(a) * d, z = P.pos.z - Math.cos(a) * d;
      const r = C.roomAt(x, z);
      if (r && r.fora) { mostrarVulto(x, z, .3); vulCool = 40; }
    }
    if (VUL.visible && vulT > .15 && ri < .15 && P.room && P.room.fora) { VUL.visible = false; vulT = 0; }
    raioPrev = ri;
    // lanterna falhando num corredor: quando a luz volta, por um instante, ele está lá no fim
    const pisca = C.flashPisca;
    if (piscaPrev && !pisca && S.flashOn && P.room && !P.room.fora && S.chapter >= 1 && vulCool <= 0 && (vulCap[S.chapter] || 0) < 2 && !S.hidden && Math.random() < .2 && !(M.ativo && C.visivel(M.pos, 2, 20))) {
      camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
      const rc = new THREE.Raycaster(v1.set(camera.position.x, 1.4, camera.position.z), fw, .1, 20);
      const hit = rc.intersectObjects(W.solid, false)[0], livre = hit ? hit.distance : 20;
      if (livre > 7) { const d = Math.min(livre - .8, 13); mostrarVulto(P.pos.x + fw.x * d, P.pos.z + fw.z * d, .09); vulCool = 25; vulCap[S.chapter] = (vulCap[S.chapter] || 0) + 1; }
    }
    piscaPrev = pisca;
  }

  // =================================================================== O INSPETOR: rosto, dedos, chaves, animação estranha
  const INS = (() => {
    const g = MON.g, cab = MON.cabeca; g.rotation.order = 'YXZ';
    const rostoTex = tex(256, 256, (c, w, h) => {
      const gr = c.createRadialGradient(w / 2, h * .45, 10, w / 2, h * .5, w * .55); gr.addColorStop(0, 'rgba(96,88,80,1)'); gr.addColorStop(.75, 'rgba(70,62,56,1)'); gr.addColorStop(1, 'rgba(60,52,46,0)');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.strokeStyle = 'rgba(40,20,44,.55)'; // veias
      for (let i = 0; i < 22; i++) { let x = rand(20, w - 20), y = rand(0, h * .8); c.lineWidth = rand(.6, 1.8); c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += rand(-14, 14); y += rand(4, 16); c.lineTo(x, y); } c.stroke(); }
      c.fillStyle = 'rgba(70,6,4,.85)'; for (const s of [-1, 1]) { const x = w / 2 + s * 34; c.beginPath(); c.moveTo(x - 5, 0); c.lineTo(x + 5, 0); c.lineTo(x + 2, rand(70, 110)); c.lineTo(x - 2, rand(60, 100)); c.fill(); }
      const bx = w / 2, by = h * .6; // boca aberta e esticada, costurada nos cantos
      const gb = c.createRadialGradient(bx, by, 4, bx, by, 60); gb.addColorStop(0, '#000'); gb.addColorStop(.7, '#0a0303'); gb.addColorStop(1, 'rgba(30,8,8,.0)');
      c.fillStyle = gb; c.beginPath(); c.ellipse(bx, by, 26, 62, 0, 0, 7); c.fill();
      c.strokeStyle = 'rgba(200,190,160,.5)'; c.lineWidth = 1.5; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(bx + i * 6, by - 52); c.lineTo(bx + i * 6.5, by - 40); c.stroke(); }
      c.strokeStyle = 'rgba(20,10,8,.9)'; c.lineWidth = 2;
      for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const x = bx + s * (32 + k * 7), y = by - 10 + k * 8; c.beginPath(); c.moveTo(x - 4, y - 4); c.lineTo(x + 4, y + 4); c.moveTo(x + 4, y - 4); c.lineTo(x - 4, y + 4); c.stroke(); }
    });
    const rostoMat = new THREE.MeshStandardMaterial({ map: rostoTex, transparent: true, roughness: .32, metalness: .1, emissive: 0xffffff, emissiveMap: rostoTex, emissiveIntensity: 0 });
    const rosto = new THREE.Mesh(new THREE.SphereGeometry(.164, 20, 12, Math.PI / 2 - .95, 1.9, 1.42, 1.32), rostoMat);
    rosto.scale.set(.82, 1.55, .95); rosto.position.y = .12; cab.add(rosto);
    let venda = null, boca0 = null; const sangue = [];
    for (const o of cab.children) {
      if (!o.isMesh || o === rosto) continue;
      if (o.geometry.type === 'CylinderGeometry') venda = o;
      else if (o.geometry.type === 'BoxGeometry' && o.material === C.MAT.preto) boca0 = o;
      else if (o.geometry.type === 'BoxGeometry') sangue.push({ m: o, y0: o.position.y });
    }
    if (boca0) boca0.visible = false;
    if (venda) { // venda de pano com olhos costurados em X e sangue vazando
      const vt = tex(256, 32, (c, w, h) => {
        c.fillStyle = '#b4a68c'; c.fillRect(0, 0, w, h);
        for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(60,48,30,${rand(.05, .25)})`; c.fillRect(rand(0, w), rand(0, h), rand(1, 4), 1); }
        for (const x of [w * .07, w * .93]) {
          const gr = c.createRadialGradient(x, h / 2, 1, x, h / 2, 14); gr.addColorStop(0, 'rgba(90,8,6,.95)'); gr.addColorStop(1, 'rgba(90,8,6,0)'); c.fillStyle = gr; c.fillRect(x - 16, 0, 32, h);
          c.strokeStyle = '#1a0a06'; c.lineWidth = 2; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x - 6 + k * 5, 8); c.lineTo(x + 2 + k * 5, 24); c.moveTo(x + 2 + k * 5, 8); c.lineTo(x - 6 + k * 5, 24); c.stroke(); }
        }
        c.strokeStyle = 'rgba(40,30,20,.6)'; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(0, 3); c.lineTo(w, 3); c.moveTo(0, h - 3); c.lineTo(w, h - 3); c.stroke();
      });
      venda.material = new THREE.MeshStandardMaterial({ map: vt, roughness: 1 });
    }
    const boca = new THREE.Mesh(new THREE.PlaneGeometry(.05, .11).translate(0, -.055, 0), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    boca.position.set(0, -.005, .138); boca.rotation.x = -.2; cab.add(boca);
    // dedos mais longos e pálidos, com polegar; contorcem-se
    const dedoMat = new THREE.MeshStandardMaterial({ color: 0x6a5e52, roughness: .5, emissive: 0x3a3228, emissiveIntensity: .3 });
    const dedos = [];
    for (const arm of [MON.armL, MON.armR]) {
      const mao = arm.children.find(o => o.isGroup); if (!mao) continue;
      for (const f of mao.children) if (f.isMesh) { f.material = dedoMat; f.scale.y = 1.35; f.position.y = -.27; dedos.push({ f, x0: f.rotation.x, ph: Math.random() * 6 }); }
      const pol = new THREE.Mesh(new THREE.BoxGeometry(.018, .26, .018), dedoMat); pol.position.set(0, -.12, .05); pol.rotation.x = .7; mao.add(pol); dedos.push({ f: pol, x0: .7, ph: Math.random() * 6 });
    }
    // botões do paletó que brilham fraco na lanterna
    const botMat = new THREE.MeshStandardMaterial({ color: 0x6a5226, roughness: .3, metalness: .9, emissive: 0x806030, emissiveIntensity: 0 });
    for (const o of g.children) if (o.isMesh && o.material === C.MAT.bronze) o.material = botMat;
    // molho de chaves pendurado na cintura
    const chaves = new THREE.Group(); chaves.position.set(.3, 1.85, .12); g.add(chaves);
    const argola = new THREE.Mesh(new THREE.TorusGeometry(.05, .008, 5, 14), botMat); chaves.add(argola);
    for (let i = 0; i < 5; i++) { const k = new THREE.Mesh(new THREE.BoxGeometry(.018, .13, .006), botMat); k.position.set((i - 2) * .02, -.1, 0); k.rotation.z = (i - 2) * .18; chaves.add(k); }
    return { rostoMat, sangue, boca, dedoMat, dedos, botMat, chaves, caca: 0, porta: 0, trava: -3, salvo: null };
  })();
  const eco = new THREE.PointLight(0x7f9ab8, 0, 7, 2); scene.add(eco); let ecoI = 0; // o estalo "acende" o que ele ouve
  function animInspetor(dt, S, t) {
    if (!M.ativo || !MON.g.visible || S.dead) return;
    const caca = M.state === 'caca';
    INS.caca = lerp(INS.caca, caca ? 1 : 0, Math.min(1, dt * 3));
    MON.cabeca.rotation.z = lerp(MON.cabeca.rotation.z, .05, INS.caca * .85); // na caça a cabeça para de tombar e aponta reto
    const w0 = M.path[0];
    INS.porta = w0 && (w0.link || w0.porta) && Math.hypot(w0.x - M.pos.x, w0.z - M.pos.z) < 1.5 ? Math.min(1, INS.porta + dt * 3) : Math.max(0, INS.porta - dt * 2);
    MON.g.rotation.x = INS.caca * .16 + INS.porta * .38; // curva-se para caber na porta
    MON.cabeca.rotation.x = INS.porta * .5;
    MON.armL.rotation.z = -.07 - INS.porta * .55; MON.armR.rotation.z = .07 + INS.porta * .55; // mãos no batente
    if (M.state === 'procura') { const a = -.2 + Math.sin(t * 1.3) * .08; MON.armL.rotation.x = a; MON.armR.rotation.x = a; } // braços arrastando
    MON.legR.rotation.x *= .45; MON.legR.rotation.z = .06; // uma perna arrasta
    INS.trava -= dt; // paradas secas no meio do passo
    if (INS.trava < -rand(2.5, 6) && M.path.length) INS.trava = .2;
    const partes = [MON.legL, MON.legR, MON.armL, MON.armR];
    if (INS.trava > 0 && INS.salvo) partes.forEach((p, i) => p.rotation.x = INS.salvo[i]); else INS.salvo = partes.map(p => p.rotation.x);
    for (const d of INS.dedos) d.f.rotation.x = d.x0 + Math.sin(t * 9 + d.ph) * (caca ? .22 : .08);
    INS.boca.scale.y = lerp(INS.boca.scale.y, caca ? 1.9 + Math.sin(t * 3) * .3 : 1, Math.min(1, dt * 4));
    for (const s of INS.sangue) { s.m.scale.y = lerp(s.m.scale.y, caca ? 2.4 : 1, Math.min(1, dt * .8)); s.m.position.y = s.y0 - (s.m.scale.y - 1) * .05; }
    INS.chaves.rotation.z = Math.sin(M.anim * 2) * .35; INS.chaves.rotation.x = Math.cos(M.anim * 2) * .2;
    // luz: rosto úmido e botões só aparecem com a lanterna perto; dedos pálidos denunciam ao longe
    MON.cabeca.getWorldPosition(v1); const dh = v1.distanceTo(camera.position);
    camera.getWorldDirection(fw); v1.sub(camera.position).normalize();
    const naLuz = flash.intensity > 3 && fw.dot(v1) > .9;
    INS.rostoMat.emissiveIntensity = lerp(INS.rostoMat.emissiveIntensity, naLuz ? clamp((3.4 - dh) / 2.4, 0, 1) * .35 : 0, Math.min(1, dt * 6));
    INS.botMat.emissiveIntensity = naLuz && dh < 9 ? .5 : 0;
    INS.dedoMat.emissiveIntensity = dh > 12 ? .9 : .3;
    // passos que molham o chão
    pegadasInspetor(dt, S);
  }
  function onEstalo(S) {
    const d = M.pos.distanceTo(P.pos);
    if (d < 10) ecoI = M.state === 'caca' ? 1.3 : .8;
    if (d < 6 && !C.visivel(M.pos, 2.2, 8)) { v1.copy(M.pos).setY(1.5); camera.worldToLocal(v1); twX = Math.sign(v1.x || 1) * .17; twT = .2; }
    void S;
  }

  // =================================================================== A MENINA: rosto, olhos, poses
  const ANAX = (() => {
    const g = ANA_G, ms = g.children.filter(o => o.isMesh);
    const cab = ms.find(o => o.geometry.type === 'SphereGeometry');
    if (!cab) return null;
    const cabelo = ms.find(o => o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.openEnded);
    const veu = ms.find(o => o.geometry.type === 'BoxGeometry');
    const bracos = ms.filter(o => o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.radiusTop < .03);
    const head = new THREE.Group(); head.position.set(0, 1.12, 0); g.add(head);
    for (const o of [cab, cabelo, veu]) if (o) { o.position.y -= 1.12; head.add(o); }
    const rt = tex(256, 128, (c, w, h) => {
      c.fillStyle = '#a49c90'; c.fillRect(0, 0, w, h);
      const fx = w * .25, ey = h * .47;
      for (const s of [-1, 1]) { const gr = c.createRadialGradient(fx + s * 13, ey, 1, fx + s * 13, ey, 11); gr.addColorStop(0, '#000'); gr.addColorStop(.6, '#120c0a'); gr.addColorStop(1, 'rgba(60,40,40,0)'); c.fillStyle = gr; c.beginPath(); c.arc(fx + s * 13, ey, 11, 0, 7); c.fill(); }
      c.fillStyle = 'rgba(40,10,10,.9)'; c.beginPath(); c.ellipse(fx, h * .66, 5, 3, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(30,20,20,.5)'; for (const s of [-1, 1]) c.fillRect(fx + s * 13 - 1, ey + 10, 2, rand(12, 22));
    });
    cab.material = new THREE.MeshStandardMaterial({ map: rt, roughness: .7 });
    const olhoMat = new THREE.MeshBasicMaterial({ color: 0xf4f0e8, transparent: true, opacity: 0 });
    const olhos = [-1, 1].map(s => { const o = new THREE.Mesh(new THREE.SphereGeometry(.011, 6, 5), olhoMat); o.position.set(s * .04, .16, .135); head.add(o); return o; });
    const b0 = bracos.map(b => ({ b, rz: b.rotation.z, x: b.position.x, y: b.position.y }));
    return { head, olhoMat, olhos, bracos: b0, pose: 0, foraT: 0, luzT: 0, vistaPrev: false };
  })();
  const POSES = [{ tilt: 0, braco: false }, { tilt: .26, braco: false }, { tilt: .7, braco: true }, { tilt: -.45, braco: false }, { tilt: 1.15, braco: true }];
  function aplicarPose() {
    const p = POSES[ANAX.pose];
    ANAX.head.rotation.z = p.tilt;
    const a = ANAX.bracos[0]; if (!a) return;
    if (p.braco) { a.b.rotation.z = a.x < 0 ? -2.7 : 2.7; a.b.position.y = 1.18; a.b.position.x = a.x * 1.2; } else { a.b.rotation.z = a.rz; a.b.position.y = a.y; a.b.position.x = a.x; }
  }
  function animAna(dt, S) {
    if (!ANAX) return;
    if (!ANA.ativa) { ANAX.luzT = 0; ANAX.olhoMat.opacity = 0; if (ANAX.pose) { ANAX.pose = 0; aplicarPose(); } return; }
    if (!ANA.vista) ANAX.foraT += dt;
    else { if (!ANAX.vistaPrev && ANAX.foraT > .05) { ANAX.pose = (ANAX.pose + 1) % POSES.length; aplicarPose(); } ANAX.foraT = 0; } // muda de pose só quando você não vê
    ANAX.luzT = ANA.vista ? ANAX.luzT + dt : Math.max(0, ANAX.luzT - dt * 2);
    ANAX.vistaPrev = ANA.vista;
    let rel = Math.atan2(P.pos.x - ANA.pos.x, P.pos.z - ANA.pos.z) - ANA.yaw; rel = Math.atan2(Math.sin(rel), Math.cos(rel));
    camera.getWorldDirection(fw); v1.set(ANA.pos.x, 1.1, ANA.pos.z).sub(camera.position).normalize();
    const borda = ANA.vista && fw.dot(v1) < Math.cos(.42) ? .26 * Math.sign(rel || 1) : 0; // no limite da luz, um giro rápido
    const giro = clamp((ANAX.luzT - 4) / 2, 0, 1) * clamp(rel, -1.2, 1.2); // muito tempo na luz: vira devagar para você
    ANAX.head.rotation.y = lerp(ANAX.head.rotation.y, giro + borda, Math.min(1, dt * (borda ? 12 : 1.4)));
    ANAX.olhoMat.opacity = lerp(ANAX.olhoMat.opacity, clamp((ANAX.luzT - 4) / 1.5, 0, 1), Math.min(1, dt * 3));
    if (!ANA.vista) pegadaSe('ana', ANA.pos, ANA.yaw, .42, 8);
    void S;
  }

  // =================================================================== A PROCISSÃO: velas, capuzes, olhar no armário
  const PRX = (() => {
    const figs = PROC.g.children.filter(o => o.isGroup), velaMat = new THREE.MeshBasicMaterial({ color: 0xcfc4a8 }), chamaMat = new THREE.MeshBasicMaterial({ color: 0xffb050 });
    for (const s of figs) {
      const capuz = new THREE.Mesh(new THREE.ConeGeometry(.15, .34, 8), C.MAT.sombra); capuz.position.y = 1.2; s.add(capuz);
      const v = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, .14, 6), velaMat); v.position.set(.1, .62, .16); s.add(v);
      const ch = new THREE.Mesh(new THREE.SphereGeometry(.013, 6, 4), chamaMat); ch.scale.y = 2.2; ch.position.set(.1, .72, .16); s.add(ch); s.userData.chama = ch;
      s.userData.olhos = s.children.filter(o => o.isMesh && o.geometry.type === 'SphereGeometry' && o.geometry.parameters.radius < .02);
    }
    return { figs, olha: null, olhaT: 0 };
  })();
  function animProcissao(dt, S, t) {
    if (PROC.fase !== 'passando') { if (PRX.olha) { PRX.olha.rotation.y = 0; PRX.olha = null; } return; }
    PROC.luz.intensity = OPT.vFlash ? 5 : 5 * (.75 + .25 * Math.sin(t * 9) + .1 * Math.sin(t * 23));
    for (const s of PRX.figs) { const ch = s.userData.chama; if (ch) ch.scale.set(1, 2.2 + Math.sin(t * 17 + s.userData.f) * .5, 1); }
    if (S.hidden && PROC.pos.distanceTo(P.pos) < 4.5 && !PRX.olha && PRX.olhaT <= 0) { // uma delas vira a cabeça para o seu esconderijo
      let melhor = null, md = 99; for (const s of PRX.figs) { s.getWorldPosition(v1); const d = v1.distanceTo(P.pos); if (d < md) { md = d; melhor = s; } }
      PRX.olha = melhor; PRX.olhaT = 1;
    }
    if (PRX.olha) {
      PRX.olhaT -= dt; PRX.olha.getWorldPosition(v1);
      const a = Math.atan2(P.pos.x - v1.x, P.pos.z - v1.z) - PROC.g.rotation.y;
      PRX.olha.rotation.y = a; for (const o of PRX.olha.userData.olhos) o.scale.setScalar(1.8);
      if (PRX.olhaT <= 0) { PRX.olha.rotation.y = 0; for (const o of PRX.olha.userData.olhos) o.scale.setScalar(1); PRX.olha = null; PRX.olhaT = -6; }
    } else if (PRX.olhaT < 0) PRX.olhaT = Math.min(0, PRX.olhaT + dt);
    pegadaSe('proc', PROC.pos, PROC.ent ? PROC.ent.yaw : 0, 1.1, 20);
  }
  // onda de luz que mostra de onde ela vai sair (chamada no aviso)
  let ondaT = 0;
  function estrobo(dt) {
    if (!PROC.ini || !W.salas.includes(PROC.ini)) {
      const salas = C.salasAlcancaveis(P.pos, { semFora: true }), longe = salas.filter(r => C.distSalas(r, P.room) >= 2);
      PROC.ini = longe.length ? pick(longe) : pick(salas.filter(r => r !== P.room)) || P.room; ondaT = 0;
    }
    const ini = PROC.ini, cx = (ini.x0 + ini.x1) / 2, cz = (ini.z0 + ini.z1) / 2;
    ondaT += dt; const frente = (ondaT % 1.4) / 1.4 * 26;
    for (const L of W.lampadas) {
      const d = Math.hypot(L.x - cx, L.z - cz);
      L.pT = (L.pT || 0) - dt;
      if (L.pT <= 0) { L.pT = OPT.vFlash ? .5 : rand(.08, .25); L.pOn = Math.random() < (d < 7 ? .22 : .6); } // pulsos de 80 a 250 ms; perto da origem, mais escuro
      const on = L.pOn && Math.abs(d - frente) > 3.5; // a frente escura sai da sala de origem
      const ai = on ? L.base * rand(.7, 1.2) : 0, ae = on ? 2 : 0;
      if (OPT.vFlash) { const k = Math.min(1, dt * 4); L.luz.intensity = lerp(L.luz.intensity, ai, k); L.bulbo.material.emissiveIntensity = lerp(L.bulbo.material.emissiveIntensity, ae, k); }
      else { L.luz.intensity = ai; L.bulbo.material.emissiveIntensity = ae; }
    }
  }

  // =================================================================== PEGADAS
  const pegGrupo = new THREE.Group(); scene.add(pegGrupo);
  const texBota = tex(64, 128, (c, w, h) => { c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.ellipse(w / 2, h * .32, 20, 34, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(w / 2, h * .8, 16, 20, 0, 0, 7); c.fill(); c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 40; i++) c.fillRect(rand(0, w), rand(0, h), rand(1, 4), rand(1, 4)); });
  const texPe = tex(64, 128, (c, w, h) => { c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.ellipse(w / 2, h * .55, 13, 30, 0, 0, 7); c.fill(); for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(w / 2 - 12 + i * 6, h * .22 - (i === 0 ? 4 : 0), i === 0 ? 5 : 3.5, 0, 7); c.fill(); } });
  const pegGeo = new THREE.PlaneGeometry(1, 1), PEG = [];
  for (let i = 0; i < 70; i++) {
    const m = new THREE.Mesh(pegGeo, new THREE.MeshStandardMaterial({ map: texBota, color: 0x07090a, roughness: .12, metalness: .35, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, emissive: 0x8fb0cc, emissiveIntensity: 0 }));
    m.rotation.order = 'YXZ'; m.visible = false; pegGrupo.add(m); PEG.push({ m, vida: 0, max: 1, tipo: '' });
  }
  let pegI = 0; const pegUlt = {}, pegLado = {};
  function pegada(tipo, x, z, yaw, vida) {
    const p = PEG[pegI++ % PEG.length], lado = (pegLado[tipo] = -(pegLado[tipo] || 1));
    const off = tipo === 'insp' ? .16 : tipo === 'ana' ? .07 : rand(-.5, .5);
    p.m.position.set(x + Math.cos(yaw) * off * lado, .014, z - Math.sin(yaw) * off * lado);
    p.m.rotation.set(-Math.PI / 2, yaw + Math.PI, 0);
    const k = tipo === 'insp' ? 1 : tipo === 'ana' ? .55 : .5; p.m.scale.set(.16 * k * 1.6, .32 * k * 1.6, 1);
    p.m.material.map = tipo === 'insp' ? texBota : texPe; p.vida = p.max = vida; p.tipo = tipo; p.m.visible = true;
  }
  function pegadaSe(tipo, pos, yaw, passo, vida) {
    const u = pegUlt[tipo] || (pegUlt[tipo] = new THREE.Vector3(1e9, 0, 0));
    if (u.distanceTo(pos) < passo) return;
    u.copy(pos);
    const r = C.roomAt(pos.x, pos.z), S = C.S;
    if (r && r.agua && !(S && S.flags.aguaBaixa)) return; // dentro da água não fica marca
    pegada(tipo, pos.x, pos.z, yaw, vida);
  }
  let molhado = 0;
  function pegadasInspetor(dt, S) {
    const r = C.roomAt(M.pos.x, M.pos.z);
    if (r && r.agua && !S.flags.aguaBaixa) molhado = 40;
    molhado = Math.max(0, molhado - dt);
    const chuva = r && r.fora && (W.mapa === 'cemiterio' || W.mapa === 'estrada');
    if (molhado > 0 || S.chapter >= 4 || chuva) pegadaSe('insp', M.pos, M.yaw, 1.0, chuva ? 20 : 30);
  }
  function pegadas(dt) {
    camera.getWorldDirection(fw);
    for (const p of PEG) {
      if (!p.m.visible) continue;
      p.vida -= dt; if (p.vida <= 0) { p.m.visible = false; continue; }
      p.m.material.opacity = Math.min(1, p.vida / p.max * 2.5) * (p.tipo === 'insp' ? .85 : .7);
      if (p.tipo === 'ana') { v1.copy(p.m.position).sub(camera.position); const d = v1.length(); p.m.material.emissiveIntensity = flash.intensity > 3 && d < 9 && fw.dot(v1.normalize()) > .93 ? .25 : 0; }
    }
  }

  // =================================================================== DECALQUES NAS PAREDES (escritas e marcas de unha)
  function naParede(r, lado, c, y, w, h, mat) {
    const off = .118, m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    if (lado === 0) { m.position.set(c, y, r.z0 + off); m.rotation.y = 0; }
    else if (lado === 1) { m.position.set(c, y, r.z1 - off); m.rotation.y = Math.PI; }
    else if (lado === 2) { m.position.set(r.x0 + off, y, c); m.rotation.y = Math.PI / 2; }
    else { m.position.set(r.x1 - off, y, c); m.rotation.y = -Math.PI / 2; }
    W.grupo.add(m); return m;
  }
  function semPorta(r, lado, c, folga = 1.4) {
    for (const l of W.links) {
      if (l.a !== r.id && l.b !== r.id) continue;
      if (lado < 2 && l.eixo === 'x' && Math.abs(l.z - (lado === 0 ? r.z0 : r.z1)) < .05 && Math.abs(l.x - c) < folga) return false;
      if (lado >= 2 && l.eixo === 'z' && Math.abs(l.x - (lado === 2 ? r.x0 : r.x1)) < .05 && Math.abs(l.z - c) < folga) return false;
    }
    return true;
  }
  const ESCRITAS = {
    terreo: ['NÃO CORRE', 'ELE OUVE O SEU\nCORAÇÃO', 'DEPOIS DAS NOVE\nNINGUÉM FALA', '#contagem'],
    superior: ['ELA CONTA\nATÉ DEZ', 'NÃO OLHA\nPRA TRÁS', 'LIA', '#contagem'],
    tuneis: ['NÃO RESPIRA', 'ELE OUVE O SEU\nCORAÇÃO', 'LIA', 'A ÁGUA\nTE ENTREGA']
  };
  function texEscrita(txt) {
    const t = tex(512, 256, (c, w, h) => {
      c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(150,40,26,.92)'; c.strokeStyle = 'rgba(150,40,26,.92)';
      if (txt === '#contagem') { // contagem de 1 a 10 riscada
        c.lineWidth = 7; c.lineCap = 'round';
        for (let i = 0; i < 10; i++) { const x = 40 + i * 44 + (i >= 5 ? 20 : 0); c.beginPath(); c.moveTo(x + rand(-3, 3), 60); c.lineTo(x + rand(-3, 3), 196); c.stroke(); }
        for (const x0 of [24, 264]) { c.beginPath(); c.moveTo(x0, 170); c.lineTo(x0 + 220, 80); c.stroke(); }
      } else {
        const ls = txt.split('\n'); c.textAlign = 'center'; c.font = `bold ${ls.length > 1 ? 64 : 92}px Georgia`;
        ls.forEach((l, i) => { c.save(); c.translate(w / 2, h / 2 + (i - (ls.length - 1) / 2) * 74 + 24); c.rotate(rand(-.05, .05)); c.fillText(l, 0, 0); c.restore(); });
      }
      for (let i = 0; i < 14; i++) { const x = rand(40, w - 40), y0 = rand(h * .45, h * .75), l = rand(20, 70); c.fillRect(x, y0, rand(2, 4), l); c.beginPath(); c.arc(x + 1.5, y0 + l, 3, 0, 7); c.fill(); } // escorridos
    });
    t.userData = { clone: true }; return t;
  }
  let ESC = [], UNHAS = [], unhaT = 0;
  const texUnha = (() => { const t = tex(256, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = 'rgba(12,8,6,.95)'; c.lineCap = 'round'; for (let i = 0; i < 4; i++) { c.lineWidth = rand(3, 6); c.beginPath(); let x = 30 + i * 18, y = 10 + i * 4; c.moveTo(x, y); for (let k = 0; k < 6; k++) { x += rand(28, 36); y += rand(10, 18); c.lineTo(x, y); } c.stroke(); } }); return t; })();
  function escritas() {
    ESC = []; UNHAS = [];
    const lista = (C.R && C.R.escritas && C.R.escritas[W.mapa]) || ESCRITAS[W.mapa];
    if (!lista) return;
    const salas = W.salas.filter(r => !r.fora && r.x1 - r.x0 > 3 && r.z1 - r.z0 > 3 && (r.h || 3.2) > 2.5).sort(() => Math.random() - .5);
    let n = 0;
    for (const r of salas) {
      if (n >= lista.length) break;
      for (let tent = 0; tent < 6; tent++) {
        const lado = Math.random() * 4 | 0, lo = lado < 2 ? r.x0 : r.z0, hi = lado < 2 ? r.x1 : r.z1;
        if (hi - lo < 3) continue;
        const c = rand(lo + 1.3, hi - 1.3);
        if (!semPorta(r, lado, c)) continue;
        const mat = new THREE.MeshBasicMaterial({ map: texEscrita(lista[n]), transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
        ESC.push(naParede(r, lado, c, 1.95, 1.5, .75, mat)); n++; break;
      }
    }
  }
  function decalques(dt, S) {
    if (ESC.length) {
      camera.getWorldDirection(fw); const I = flash.intensity / 30;
      for (const m of ESC) { // só aparecem quando o feixe passa por cima
        v1.copy(m.position).sub(camera.position); const d = v1.length(), dot = fw.dot(v1.normalize());
        const alvo = I > .05 && d < 8 ? clamp((dot - .9) / .07, 0, 1) * clamp((8 - d) / 2.5, 0, 1) * Math.min(1, I * 1.3) : 0;
        m.material.opacity = lerp(m.material.opacity, alvo, Math.min(1, dt * 5));
      }
    }
    unhaT -= dt; // na caça ele arranha as paredes por onde passa; as marcas ficam até o fim do capítulo
    if (M.ativo && M.state === 'caca' && unhaT <= 0 && UNHAS.length < 12) {
      unhaT = 2.2; const r = C.roomAt(M.pos.x, M.pos.z);
      if (r && !r.fora) {
        const ds = [M.pos.z - r.z0, r.z1 - M.pos.z, M.pos.x - r.x0, r.x1 - M.pos.x], lado = ds.indexOf(Math.min(...ds));
        const c = lado < 2 ? M.pos.x : M.pos.z;
        if (ds[lado] < .9 && semPorta(r, lado, c, 1)) {
          const mat = new THREE.MeshStandardMaterial({ map: texUnha, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, roughness: 1 });
          const m = naParede(r, lado, c, rand(1.3, 2), .9, .45, mat); m.rotation.z = rand(-.5, .2); UNHAS.push(m);
        }
      }
    }
    void S;
  }

  // =================================================================== ITENS, LÂMPADAS, GRAVADORES
  const QUENTE = new THREE.Color(0x2a2214);
  function brilhoItens(dt) {
    camera.getWorldDirection(fw); const ligada = flash.intensity > 3;
    for (const it of W.items) {
      const m = it.mesh; if (!m.visible) continue;
      let gl = m.userData.visGlow;
      if (!gl) {
        gl = m.userData.visGlow = []; m.userData.visAmt = 0;
        m.traverse(o => {
          if (!o.isMesh || !o.material || !('emissiveIntensity' in o.material)) return;
          if (o.material.userData.compartilhado) { o.material = o.material.clone(); o.material.userData = { compartilhado: true }; }
          const preto = o.material.emissive.getHex() === 0;
          if (preto) o.material.emissive.copy(QUENTE);
          gl.push({ mat: o.material, base: preto ? 0 : o.material.emissiveIntensity });
        });
      }
      m.getWorldPosition(v1); v1.sub(camera.position); const d = v1.length();
      const alvo = ligada && d < 6 && fw.dot(v1.normalize()) > .95 ? 1 : 0; // o feixe "acorda" o objeto: acaba a caça ao pixel no escuro
      m.userData.visAmt = lerp(m.userData.visAmt, alvo, Math.min(1, dt * 4));
      for (const g of gl) g.mat.emissiveIntensity = g.base + m.userData.visAmt * .9;
    }
  }
  function lampadas(dt, t) {
    const perto = M.ativo ? M.pos : null;
    for (const L of W.lampadas) {
      if (L.halo) L.halo.material.opacity = clamp(L.bulbo.material.emissiveIntensity / 2, 0, 1) * .5;
      if (!L.p0) { L.p0 = L.luz.position.clone(); L.ph = Math.random() * 6; L.amp = .012; }
      const alvo = .012 + (perto && Math.hypot(L.x - perto.x, L.z - perto.z) < 5 ? .05 : 0) + C.raioI * .05; // balançam quando ele passa ou com o trovão
      L.amp = lerp(L.amp, alvo, Math.min(1, dt * 1.5));
      const ox = Math.sin(t * 1.4 + L.ph) * L.amp, oz = Math.cos(t * 1.1 + L.ph) * L.amp;
      L.luz.position.set(L.p0.x + ox, L.p0.y, L.p0.z + oz);
      L.bulbo.position.set(L.p0.x + ox * .8, L.p0.y + .1, L.p0.z + oz * .8);
      if (L.halo) L.halo.position.copy(L.bulbo.position);
    }
  }
  function rolos(dt) { if (!C.fita) return; for (const o of C.ROLOS) if (o.mapa === W.mapa) o.r.rotation.y += dt * (o.r.position.x < -.05 ? 5 : 3.5); }

  // =================================================================== RESPIRAÇÃO, NÉVOA RASTEIRA, ÁGUA
  const vapor = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_SUAVE, color: 0xdfe6ee, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  vapor.position.set(0, -.16, -.45); camera.add(vapor); let vapT = 0, frio = 0;
  function respiracao(dt, ativo, S) {
    const fora = W.mapa === 'estrada' || W.mapa === 'cemiterio' || (P.room && P.room.fora);
    const ent = (ANA.ativa && ANA.pos.distanceTo(P.pos) < 8) || (PROC.fase === 'passando' && PROC.pos.distanceTo(P.pos) < 8);
    frio = lerp(frio, ativo && ent ? 1 : 0, Math.min(1, dt * 2));
    const prende = S.hidden && keys.Space && S.stamina > 0; // prendendo a respiração o vapor some na hora
    const on = ativo && (fora || ent || S.fear > 50) && !prende;
    vapT += dt / lerp(3.4, 1.3, S.fear / 100); const f = vapT % 1, a = f < .45 ? Math.sin(f / .45 * Math.PI) : 0;
    vapor.material.opacity = on ? a * (ent ? .17 : fora ? .11 : .06) : Math.max(0, vapor.material.opacity - dt * 3);
    vapor.scale.setScalar(.22 + f * .5); vapor.position.y = -.17 + f * .06; vapor.position.z = -.42 - f * .18;
  }
  let NEV = [];
  const texNev = tex(256, 256, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 70; i++) { const x = rand(0, w), y = rand(0, h), r = rand(20, 70), gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) c.fillRect(x - r + dx, y - r + dy, r * 2, r * 2); } }, true);
  function nevoa() {
    NEV = [];
    if (W.mapa !== 'cemiterio' && W.mapa !== 'estrada') return;
    for (const r of W.salas) {
      if (!r.fora) continue;
      const w = Math.min(90, r.x1 - r.x0), d = Math.min(170, r.z1 - r.z0), cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
      for (let i = 0; i < 3; i++) {
        const t = texNev.clone(); t.needsUpdate = true; t.userData = { clone: true }; t.repeat.set(w / 14, d / 14); t.offset.set(Math.random(), Math.random());
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ map: t, color: 0x8c96a4, transparent: true, opacity: [.3, .2, .13][i], depthWrite: false }));
        m.rotation.x = -Math.PI / 2; m.position.set(cx, .22 + i * .22, cz); m.renderOrder = 2; W.grupo.add(m);
        NEV.push({ t, vx: rand(-.012, .012), vz: rand(.006, .02) });
      }
    }
  }
  const aneis = [];
  for (let i = 0; i < 10; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(.09, .12, 28), new THREE.MeshBasicMaterial({ color: 0xa0b0a8, transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); aneis.push({ m, t: 0 }); }
  let anelI = 0, anelP = 0, anelM = 0;
  function anel(x, z, k = 1) { const a = aneis[anelI++ % aneis.length], y = W.agua.length ? W.agua[0].position.y + .012 : .43; a.m.position.set(x, y, z); a.t = 1.2 * k; a.k = k; a.m.visible = true; }
  function agua(dt, ativo, S, t) {
    if (W.agua.length) { const tx = W.agua[0].material.map; if (tx) { tx.offset.x = Math.sin(t * .1) * .05; tx.offset.y += dt * .012; } } // a água corre
    if (ativo && P.naAgua && (keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD)) { anelP -= dt; if (anelP <= 0) { anelP = P.sprinting ? .3 : .5; anel(P.pos.x, P.pos.z); } }
    if (M.ativo && M.path.length) { const r = C.roomAt(M.pos.x, M.pos.z); if (r && r.agua && !S.flags.aguaBaixa) { anelM -= dt; if (anelM <= 0) { anelM = .6; anel(M.pos.x, M.pos.z, 1.6); } } } // dá para ver ele chegando pela água
    for (const a of aneis) { if (!a.m.visible) continue; a.t -= dt; if (a.t <= 0) { a.m.visible = false; continue; } const f = 1 - a.t / (1.2 * a.k); a.m.scale.setScalar(1 + f * 7 * a.k); a.m.material.opacity = (1 - f) * .35; }
  }

  // =================================================================== MORTE
  function morte(quem) {
    const t0 = performance.now() + 420; let y0 = null, z0 = 0;
    (function anim() {
      const S = C.S; if (!S || !S.dead) return;
      const k = clamp((performance.now() - t0) / 560, 0, 1);
      if (k > 0) {
        if (y0 === null) { y0 = camera.position.y; z0 = camera.rotation.z; }
        const e = k * k * (3 - 2 * k), roll = OPT.vCam >= 1 ? 1.2 : .5; let olha = false;
        camera.position.y = lerp(y0, .22, e); // a Lia cai no chão
        if (quem === 'inspetor' && MON.g.visible) { // ele se debruça por cima, com a boca aberta e o rosto à mostra
          camera.getWorldDirection(fw); fw.y = 0; if (fw.lengthSq() < 1e-4) fw.set(0, 0, -1); fw.normalize();
          MON.g.position.set(camera.position.x + fw.x * 1.35, 0, camera.position.z + fw.z * 1.35);
          MON.g.rotation.y = Math.atan2(-fw.x, -fw.z); MON.g.rotation.x = e * .36;
          MON.cabeca.rotation.x = e * .9; MON.cabeca.rotation.z = .3; INS.boca.scale.y = 1 + e * 2.2; INS.rostoMat.emissiveIntensity = .2 * e;
          MON.cabeca.getWorldPosition(v1); olha = true;
        } else if (quem === 'ana') {
          camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
          ANA_G.position.set(camera.position.x + fw.x * .65, 0, camera.position.z + fw.z * .65); ANA_G.rotation.y = Math.atan2(-fw.x, -fw.z);
          if (ANAX) { ANAX.head.rotation.z = .5; ANAX.head.rotation.y = 0; ANAX.olhoMat.opacity = 1; ANAX.head.getWorldPosition(v1); v1.y += .15; olha = true; }
        }
        if (olha) { const dx = v1.x - camera.position.x, dz = v1.z - camera.position.z; camera.rotation.y = Math.atan2(-dx, -dz); camera.rotation.x = Math.atan2(v1.y - camera.position.y, Math.hypot(dx, dz)); }
        camera.rotation.z = lerp(z0, roll, e);
      }
      if (k < 1) requestAnimationFrame(anim);
    })();
  }

  // =================================================================== RUÍDO, HUD E FILTROS
  function ruido(x, z, r) { // som alto por perto dá um tranco na câmera
    const S = C.S; if (!S || C.mode !== 'jogo' || OPT.vCam <= 0) return;
    const d = Math.hypot(P.pos.x - x, P.pos.z - z); if (d < 1.6 || r < 4) return;
    P.shake = Math.max(P.shake, Math.min(.05, r / (d * d + 6) * .03) * (OPT.vCam >= 2 ? 1 : .5));
  }
  let filtroV = '', pulso = 0, perigo = 0, trackT = 0, vidaPrev = 100, recT = 0;
  function batida(S) { pulso = 1; if (OPT.vCam >= 2 && S.fear > 60 && !S.hidden) P.shake = Math.max(P.shake, .004 + (S.fear - 60) / 40 * .008); }
  function hud() {
    const S = C.S; if (!S) return;
    const pul = pulso;
    vigEl.style.opacity = Math.min(1, .6 + S.fear / 100 * .4 + (S.health < 40 ? .2 : 0) + (S.fear > 60 ? pul * .15 : 0)); // pulsa com o coração
    const tun = (S.fear > 60 ? (S.fear - 60) / 40 * (OPT.vBlur ? .35 : .75) : 0) * (1 + pul * .25) + (S.hidden && keys.Space ? .25 : 0);
    elTunel.style.opacity = tun.toFixed(3);
    elPulso.style.opacity = (S.health < 35 ? .35 + pul * .5 : S.health < 50 ? pul * .3 : 0).toFixed(3);
    elRachas.style.opacity = (S.health < 35 ? .5 + pul * .25 : 0).toFixed(3);
    let blur = 0;
    if (OPT.vBlur) { if (S.fear > 75) blur = (S.fear - 75) / 25 * 1.6 * (.65 + .35 * pul); if (S.health < 50) blur = Math.max(blur, pul * .9); }
    const sat = Math.max(.2, 1 - S.fear / 160 - perigo * .15), con = 1 + (S.fear > 75 ? (S.fear - 75) / 25 * .15 : 0) + perigo * .06;
    let f = `blur(${blur.toFixed(1)}px) saturate(${sat.toFixed(2)}) contrast(${con.toFixed(2)})`;
    if (S.health < 35) f += ' sepia(.4) hue-rotate(-20deg)';
    const cromo = OPT.vBlur ? Math.max(S.fear > 85 ? (S.fear - 85) / 15 : 0, perigo) : 0; // aberração cromática no pânico
    if (cromo > .05) { cromoDx.setAttribute('dx', (cromo * 4).toFixed(1)); f += ' url(#vis-cromo)'; }
    if (canvas.style.filter === '' && filtroV) filtroV = '';
    if (f !== filtroV) { canvas.style.filter = f; filtroV = f; }
  }
  function telas(dt, ativo, S, t) {
    const insp = M.ativo ? M.pos.distanceTo(P.pos) : 99;
    perigo = lerp(perigo, ativo && insp < 4 && !C.visivel(M.pos, 2, 6) ? 1 : 0, Math.min(1, dt * 3));
    const aviso = PROC.fase === 'aviso';
    grainEl.style.opacity = (.1 + (ativo ? S.fear / 100 * .08 + perigo * .15 + (aviso ? .12 : 0) : 0)).toFixed(3);
    elGeada.style.opacity = (frio * .9).toFixed(3); // geada nas bordas perto da Menina ou da Procissão
    if (ativo && S.health < vidaPrev - 5) trackT = .35; vidaPrev = S.health;
    const fita = !!OPT.vVhs || S.dif === 'pesadelo';
    elScan.style.opacity = ativo && fita ? .55 : 0;
    trackT = Math.max(0, trackT - dt);
    const rasgo = ativo && fita && (trackT > 0 || insp < 6 || aviso || (S.fear > 70 && Math.random() < .02));
    if (rasgo && !OPT.vFlash) { // linhas de tracking rasgando a imagem
      gVhs.clearRect(0, 0, 160, 90);
      for (let b = 0; b < (trackT > 0 ? 4 : 2); b++) { const y = rand(0, 90) | 0, hh = rand(2, 7) | 0; for (let yy = y; yy < y + hh; yy++) { gVhs.fillStyle = `rgba(255,255,255,${rand(.05, .35)})`; gVhs.fillRect(rand(-20, 40), yy, rand(60, 180), 1); } }
      elVhs.style.opacity = .7; elVhs.style.transform = trackT > 0 ? `translateX(${rand(-6, 6).toFixed(0)}px)` : '';
    } else if (elVhs.style.opacity !== '0') { elVhs.style.opacity = 0; elVhs.style.transform = ''; }
    const recOn = ativo && fita && !(hudEl && hudEl.hidden);
    elRec.hidden = !recOn;
    if (recOn) { recT += dt; const mm = String(Math.min(59, Math.floor(S.tempo / 60))).padStart(2, '0'); const h = `<b style="visibility:${recT % 1 < .6 ? 'visible' : 'hidden'}">●</b> REC&nbsp;&nbsp; 14 MAR 1979 &nbsp;21:${mm}`; if (elRec.innerHTML !== h) elRec.innerHTML = h; }
    void t;
  }

  // =================================================================== LOOP
  let fovAtual = camera.fov, parado = 0, hbPrev = 0; const ultimo = new THREE.Vector3();
  function cameraCorpo(dt, ativo, S) {
    let alvo = OPT.vFov;
    if (ativo) {
      if (S.hidden) alvo = OPT.vFov - (S.hidden.tipo === 'armario' ? 12 : 8); // aperto do esconderijo
      else { if (P.sprinting) alvo += 6; if (S.fear > 70) alvo -= (S.fear - 70) / 30 * 8; } // correndo abre, pânico fecha
    }
    fovAtual = lerp(fovAtual, alvo, Math.min(1, dt * 3));
    if (Math.abs(camera.fov - fovAtual) > .1) { camera.fov = fovAtual; camera.updateProjectionMatrix(); }
    if (!ativo || S.hidden || P.bloqueado) return;
    const vel = ultimo.distanceTo(P.pos) / Math.max(dt, 1e-3); ultimo.copy(P.pos);
    parado = vel < .3 ? Math.min(1, parado + dt * 2) : 0;
    const k = OPT.vCam >= 2 ? parado * .5 : OPT.vCam >= 1 ? .55 : 1; // movimento de câmera reduzido/mínimo e menos tremor parado
    if (k > 0) { v1.set(P.pos.x, P.h - (P.naAgua ? .12 : 0), P.pos.z); camera.position.lerp(v1, k); camera.rotation.z *= 1 - k; }
  }
  function update(dt, ativo) {
    const S = C.S; if (!S) return;
    const t = C.perf;
    const hb = C.hbT; if (hb > hbPrev + .05) batida(S); hbPrev = hb; pulso = Math.max(0, pulso - dt * 3);
    if (M.ativo) { if (M.clickT > estaloPrev + .2) onEstalo(S); estaloPrev = M.clickT; }
    ecoI *= Math.exp(-dt * 22); eco.intensity = ecoI; if (M.ativo) eco.position.set(M.pos.x, 2.4, M.pos.z);
    cameraCorpo(dt, ativo, S);
    lanterna(dt, ativo, S, t);
    feixe(dt, S);
    vultos(dt, ativo, S);
    if (ativo) { animInspetor(dt, S, t); animAna(dt, S); animProcissao(dt, S, t); }
    pegadas(dt); decalques(dt, S); brilhoItens(dt); lampadas(dt, t); rolos(dt);
    respiracao(dt, ativo, S);
    for (const n of NEV) { n.t.offset.x += n.vx * dt; n.t.offset.y += n.vz * dt; }
    agua(dt, ativo, S, t);
    telas(dt, ativo, S, t);
  }
  function mapa() {
    PROC.ini = null; VUL.visible = false; vulT = 0;
    for (const p of PEG) { p.m.visible = false; p.vida = 0; } for (const k in pegUlt) pegUlt[k].set(1e9, 0, 0);
    for (const a of aneis) a.m.visible = false;
    molhado = 0; poIni = false; if (ANAX) { ANAX.pose = 0; aplicarPose(); ANAX.head.rotation.set(0, 0, 0); ANAX.olhoMat.opacity = 0; ANAX.luzT = 0; }
    for (let i = C.ROLOS.length - 1; i >= 0; i--) { let o = C.ROLOS[i].r; while (o.parent && o.parent !== W.grupo) o = o.parent; if (o.parent !== W.grupo) C.ROLOS.splice(i, 1); }
    escritas(); nevoa();
  }
  const api = { update, hud, mapa, estrobo, morte, ruido, opt: OPT };
  window.__visual = api;
  return api;
}
