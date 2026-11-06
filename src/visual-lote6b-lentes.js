// =====================================================================
// LOTE 6 (2ª rodada) — lentes de pós-processo e telas dentro do mundo
// Lentes novas (tecla I, mesmo ciclo do lote 6): Carvão e Giz, Câmera de Segurança, Pixel 1996, Fita VHS e Só Som.
// Telas no mundo: o monitor de vigilância da diretoria e o espelho do banheiro com câmera de verdade.
// Tudo passivo, à prova de erro e desligado sob o teste automático (navigator.webdriver).
// =====================================================================
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const PAL = [[8, 8, 10], [28, 26, 34], [52, 46, 54], [84, 74, 70], [122, 106, 92], [168, 150, 126], [214, 198, 168], [244, 236, 214], [42, 64, 44], [78, 110, 74], [22, 38, 60], [58, 86, 128], [92, 24, 26], [150, 44, 36], [196, 120, 52], [232, 190, 96]];
const LUT = (() => { const t = new Uint8Array(4096 * 3); for (let i = 0; i < 4096; i++) { const r = ((i >> 8) & 15) * 17, g = ((i >> 4) & 15) * 17, b = (i & 15) * 17; let m = 1e9, k = 0; for (let j = 0; j < 16; j++) { const p = PAL[j], d = (r - p[0]) ** 2 * .9 + (g - p[1]) ** 2 * 1.2 + (b - p[2]) ** 2 * .8; if (d < m) { m = d; k = j; } } t[i * 3] = PAL[k][0]; t[i * 3 + 1] = PAL[k][1]; t[i * 3 + 2] = PAL[k][2]; } return t; })();
const RUIDO = (() => { const a = new Float32Array(8192); for (let i = 0; i < a.length; i++) a[i] = Math.random() - .5; return a; })();

export function instalarLentesL6B(U) {
  const { THREE, C, W, P, M, ANA, PROC, scene, camera, renderer, canvas, OPT, clamp, robo, seguro, paredesLivres, mem, salvarMem, $ } = U;
  const lente = () => (C.L6V && C.L6V.lenteId) ? C.L6V.lenteId() : '';
  const MINHAS = ['carvao', 'cftv', 'pixel96', 'vhs', 'sosom'];
  const qual = () => (window.__plat && window.__plat.O && window.__plat.O.qual) || 'alta';
  let ov = null, ctx = null, quadro = 0, jitterT = 0;

  function garantir(w, h) {
    if (!ov) {
      ov = document.createElement('canvas'); ov.id = 'l6b-lente'; ov.setAttribute('aria-hidden', 'true');
      ov.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;display:none';
      canvas.after(ov); ctx = ov.getContext('2d', { willReadFrequently: true });
    }
    if (ov.width !== w || ov.height !== h) { ov.width = w; ov.height = h; }
    ov.style.display = 'block';
  }
  function esconder() { if (ov && ov.style.display !== 'none') { ov.style.display = 'none'; ov.style.transform = ''; } }

  // ---------- Pixel 1996: 320x240, 16 cores com dither e geometria que treme ----------
  function pixel96(dt) {
    const w = 320, h = 240; garantir(w, h); ctx.drawImage(canvas, 0, 0, w, h);
    const im = ctx.getImageData(0, 0, w, h), d = im.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, b = (BAYER[(y & 3) * 4 + (x & 3)] / 16 - .5) * 44;
      const r = clamp(d[i] + b, 0, 255) >> 4, g = clamp(d[i + 1] + b, 0, 255) >> 4, bl = clamp(d[i + 2] + b, 0, 255) >> 4, k = ((r << 8) | (g << 4) | bl) * 3;
      d[i] = LUT[k]; d[i + 1] = LUT[k + 1]; d[i + 2] = LUT[k + 2];
    }
    ctx.putImageData(im, 0, 0);
    jitterT -= dt; if (jitterT <= 0) { jitterT = .09; ov.style.transform = `translate(${(Math.random() * 3 - 1.5).toFixed(1)}px,${(Math.random() * 3 - 1.5).toFixed(1)}px) scale(1.01)`; } // a geometria treme
  }

  // ---------- Carvão e Giz: papel granulado, traço grosso, pontos de luz ----------
  function carvao() {
    const w = 480, h = 270; garantir(w, h); ctx.drawImage(canvas, 0, 0, w, h);
    const im = ctx.getImageData(0, 0, w, h), d = im.data, lum = new Float32Array(w * h);
    for (let i = 0, j = 0; j < lum.length; i += 4, j++) lum[j] = (d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11) / 255;
    const tint = (Date.now() / 4000) | 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const j = y * w + x, v = lum[j], e = Math.abs(v - lum[j + (x < w - 1 ? 1 : 0)]) + Math.abs(v - lum[j + (y < h - 1 ? w : 0)]);
      const n = RUIDO[(j * 7 + tint) & 8191] * 30, nivel = Math.round(Math.pow(v, .72) * 5) / 5;
      let r = 20 + (226 - 20) * nivel + n, g = 20 + (220 - 20) * nivel + n, b = 22 + (204 - 22) * nivel + n;
      if (e > .07) { const k = Math.min(1, e * 6); r *= 1 - k * .9; g *= 1 - k * .9; b *= 1 - k * .9; } // traço grosso nas bordas
      if (v > .86) { r = g = b = 250; } // pontos de luz brancos
      const i = j * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b;
    }
    ctx.putImageData(im, 0, 0);
  }

  // ---------- Câmera de Segurança ----------
  function cftv(dt) {
    const w = 640, h = 360; garantir(w, h); ctx.drawImage(canvas, 0, 0, w, h);
    const im = ctx.getImageData(0, 0, w, h), d = im.data, S = C.S, perto = M.ativo ? M.pos.distanceTo(P.pos) : 99;
    const sinal = perto < 8 ? clamp((8 - perto) / 8, 0, 1) : 0; // perda de sinal quando o Inspetor chega perto
    const copia = new Uint8ClampedArray(d);
    for (let y = 0; y < h; y++) {
      const tear = sinal > .35 && RUIDO[(y * 3 + quadro * 11) & 8191] > .485 ? Math.round((RUIDO[(y + quadro) & 8191]) * 90 * sinal) : 0;
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4, xs = Math.min(w - 1, Math.max(0, x + tear)), is = (y * w + xs) * 4, ir = (y * w + Math.min(w - 1, xs + 3)) * 4;
        const l = copia[is] * .3 + copia[is + 1] * .59 + copia[is + 2] * .11, n = RUIDO[(i + quadro * 131) & 8191] * (14 + sinal * 90);
        d[i] = copia[ir] * .35 + l * .45 + n; d[i + 1] = l * .95 + 8 + n; d[i + 2] = copia[is + 2] * .3 + l * .55 + n * .8; // aberração de cor
      }
    }
    ctx.putImageData(im, 0, 0);
    ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    const sala = P.room ? W.salas.indexOf(P.room) + 1 : 0, vista = M.ativo && M.state === 'caca';
    ctx.font = 'bold 15px "Courier New",monospace'; ctx.fillStyle = 'rgba(235,255,235,.9)'; ctx.shadowColor = '#000'; ctx.shadowBlur = 3;
    ctx.fillText(vista ? 'CAM —' : 'CAM ' + String(Math.max(1, sala)).padStart(2, '0') + (P.room ? ' · ' + P.room.nome.toUpperCase() : ''), 14, 24);
    const t = S ? S.tempo : 0, hh = (21 + Math.floor(t / 3600)) % 24, mm = Math.floor(t / 60) % 60, ss = Math.floor(t) % 60;
    ctx.fillText(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`, w - 96, 24);
    if (Math.floor(performance.now() / 600) % 2 === 0) { ctx.fillStyle = '#ff3b30'; ctx.beginPath(); ctx.arc(w - 112, 19, 5, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(235,255,235,.9)'; ctx.fillText('REC', w - 150, 24); }
    if (sinal > .6) ctx.fillText('SINAL FRACO', 14, h - 14);
    ctx.shadowBlur = 0;
  }

  // ---------- Fita VHS completa ----------
  let hpAnt = 100, golpe = 0;
  function vhs(dt) {
    const w = 640, h = 360; garantir(w, h); ctx.drawImage(canvas, 0, 0, w, h);
    const S = C.S, t = performance.now() / 1000, perto = M.ativo ? M.pos.distanceTo(P.pos) : 99;
    if (S && S.health < hpAnt - 2) golpe = 1; hpAnt = S ? S.health : 100; golpe = Math.max(0, golpe - dt * 2.2);
    const forca = 1 + clamp((9 - perto) / 9, 0, 1) * 2 + golpe * 4; // distorce mais quando ele está perto e ao bater
    const yb = ((t * 70) % (h + 80)) - 40;
    for (let k = 0; k < 4; k++) { const y0 = yb + k * 9, dx = Math.sin(t * 9 + k) * 7 * forca; if (y0 >= 0 && y0 < h - 10) ctx.drawImage(ov, 0, y0, w, 9, dx, y0, w, 9); } // tracking
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .12; ctx.drawImage(canvas, 3, 0, w, h); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; // vazamento de cor
    ctx.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);
    for (let i = 0; i < 90 * forca; i++) { ctx.fillStyle = `rgba(255,255,255,${Math.random() * .25})`; ctx.fillRect(Math.random() * w, Math.random() * h, 12 + Math.random() * 30, 1); }
    ctx.font = '19px "Courier New",monospace'; ctx.shadowColor = '#000'; ctx.shadowBlur = 3; ctx.fillStyle = 'rgba(255,255,255,.88)';
    ctx.fillText('PLAY ▶', 16, 28); const mm = S ? Math.floor(S.tempo / 60) % 60 : 0; ctx.fillText(`12/03/1979  21:${String(mm).padStart(2, '0')}`, w - 218, h - 18); ctx.shadowBlur = 0;
  }

  // ---------- Só Som: eco-localização ----------
  const aneis = []; let anelT = 0; const mAnt = new THREE.Vector3(), aAnt = new THREE.Vector3(), v3 = new THREE.Vector3();
  function pj(x, y, z) { v3.set(x, y, z).project(camera); return v3.z > 1 || v3.z < -1 ? null : [(v3.x * .5 + .5) * ov.width, (-v3.y * .5 + .5) * ov.height]; }
  function sosom(dt) {
    const w = 640, h = 360; garantir(w, h); ctx.fillStyle = '#020304'; ctx.fillRect(0, 0, w, h);
    anelT -= dt; const S = C.S;
    if (anelT <= 0) {
      anelT = .45;
      if (P.noiseR > 1.2) aneis.push({ x: P.pos.x, z: P.pos.z, t: 0, R: Math.min(20, P.noiseR * 1.5), c: '150,215,255' });
      if (M.ativo) { const v = M.pos.distanceTo(mAnt) / .45; mAnt.copy(M.pos); if (v > .9 || M.state === 'caca') aneis.push({ x: M.pos.x, z: M.pos.z, t: 0, R: 15, c: '255,96,76', blob: M.pos }); }
      if (ANA.ativa) { const v = ANA.pos.distanceTo(aAnt) / .45; aAnt.copy(ANA.pos); if (v > .8) aneis.push({ x: ANA.pos.x, z: ANA.pos.z, t: 0, R: 11, c: '255,214,150', blob: ANA.pos }); }
      if (PROC.fase === 'passando' && PROC.pos) aneis.push({ x: PROC.pos.x, z: PROC.pos.z, t: 0, R: 18, c: '255,190,120' });
      if (S && S.flashOn) aneis.push({ x: P.pos.x, z: P.pos.z, t: 0, R: 6, c: '255,244,214' });
    }
    ctx.lineWidth = 1.6;
    for (let i = aneis.length - 1; i >= 0; i--) {
      const a = aneis[i]; a.t += dt; const r = a.t * 9; if (r > a.R + 1.5) { aneis.splice(i, 1); continue; }
      const al = clamp(1 - r / (a.R + 1.5), 0, 1);
      ctx.strokeStyle = `rgba(${a.c},${(al * .5).toFixed(2)})`; ctx.beginPath(); // o anel no chão
      let ini = true; for (let k = 0; k <= 28; k++) { const an = k / 28 * 6.2832, p = pj(a.x + Math.cos(an) * r, 0, a.z + Math.sin(an) * r); if (!p) { ini = true; continue; } if (ini) { ctx.moveTo(p[0], p[1]); ini = false; } else ctx.lineTo(p[0], p[1]); } ctx.stroke();
      ctx.strokeStyle = `rgba(${a.c},${al.toFixed(2)})`; // contornos de parede tocados pelo anel
      let n = 0;
      for (const c of W.colliders) {
        if (!c.on || n > 90) continue; const dx = Math.max(c.minX - a.x, 0, a.x - c.maxX), dz = Math.max(c.minZ - a.z, 0, a.z - c.maxZ), dd = Math.hypot(dx, dz);
        if (Math.abs(dd - r) > 1.3) continue; n++;
        const cs = [[c.minX, c.minZ], [c.maxX, c.minZ], [c.maxX, c.maxZ], [c.minX, c.maxZ]];
        for (let k = 0; k < 4; k++) { const A = cs[k], B = cs[(k + 1) % 4], a0 = pj(A[0], 0, A[1]), b0 = pj(B[0], 0, B[1]), a1 = pj(A[0], 2.4, A[1]), b1 = pj(B[0], 2.4, B[1]); if (!a0 || !b0 || !a1 || !b1) continue; ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(b0[0], b0[1]); ctx.lineTo(b1[0], b1[1]); ctx.lineTo(a1[0], a1[1]); ctx.lineTo(a0[0], a0[1]); ctx.stroke(); }
      }
      if (a.blob && r < 4) { const p = pj(a.blob.x, 1.2, a.blob.z); if (p) { const gr = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 34); gr.addColorStop(0, `rgba(${a.c},${(1 - r / 4).toFixed(2)})`); gr.addColorStop(1, `rgba(${a.c},0)`); ctx.fillStyle = gr; ctx.fillRect(p[0] - 34, p[1] - 34, 68, 68); } } // ele só aparece quando faz barulho
    }
    if (aneis.length > 14) aneis.splice(0, aneis.length - 14);
  }

  // ---------- gancho: roda depois do render ----------
  function depois() {
    const id = lente(); quadro++;
    if (!MINHAS.includes(id) || C.mode === 'titulo' && id === 'sosom') { esconder(); return; }
    const dt = 1 / 60;
    if (id === 'pixel96') pixel96(dt); else if (id === 'carvao') carvao(); else if (id === 'cftv') cftv(dt); else if (id === 'vhs') vhs(dt); else sosom(dt);
    if (!mem.lentes) mem.lentes = {}; if (!mem.lentes[id]) { mem.lentes[id] = 1; salvarMem(); }
  }

  // =====================================================================
  // MONITOR DE VIGILÂNCIA NA DIRETORIA (câmera de teto, 5 quadros por segundo)
  // =====================================================================
  let mon = null; const camV = new THREE.PerspectiveCamera(72, 4 / 3, .1, 70); camV.layers.set(0);
  function montarMonitor() {
    mon = null; if (W.mapa !== 'terreo') return;
    for (const lado of ['z1', 'x0', 'x1', 'z0']) {
      const ps = paredesLivres('diret', lado, 1); if (!ps.length) continue; const p = ps[Math.floor(ps.length / 2)];
      const rt = new THREE.WebGLRenderTarget(192, 144); rt.texture.colorSpace = THREE.SRGBColorSpace;
      const ruido = document.createElement('canvas'); ruido.width = 64; ruido.height = 48; const rg = ruido.getContext('2d'), rtex = new THREE.CanvasTexture(ruido); rtex.colorSpace = THREE.SRGBColorSpace;
      const g = new THREE.Group(); g.position.set(p.x + Math.sin(p.ry) * .26, 0, p.z + Math.cos(p.ry) * .26); g.rotation.y = p.ry; W.grupo.add(g);
      const mesa = new THREE.Mesh(new THREE.BoxGeometry(.7, .95, .4), new THREE.MeshStandardMaterial({ color: 0x3a2c20, roughness: .9 })); mesa.position.y = .475; g.add(mesa);
      const corpo = new THREE.Mesh(new THREE.BoxGeometry(.58, .46, .4), new THREE.MeshStandardMaterial({ color: 0x24251f, roughness: .6 })); corpo.position.set(0, 1.19, 0); g.add(corpo);
      const tela = new THREE.Mesh(new THREE.PlaneGeometry(.44, .33), new THREE.MeshBasicMaterial({ map: rtex, color: 0xbfe6c8 })); tela.position.set(0, 1.2, .205); g.add(tela);
      mon = { g, tela, rt, rtex, rg, ruido, t: 0, hum: null, p };
      break;
    }
  }
  function ruidoTela() { const im = mon.rg.createImageData(64, 48), d = im.data; for (let i = 0; i < d.length; i += 4) { const v = Math.random() * 120 + 20; d[i] = v * .7; d[i + 1] = v; d[i + 2] = v * .75; d[i + 3] = 255; } mon.rg.putImageData(im, 0, 0); mon.rtex.needsUpdate = true; }
  function pararHum() { if (mon && mon.hum) { seguro(() => { mon.hum.g.gain.setTargetAtTime(0, C.AC.currentTime, .05); mon.hum.o.stop(C.AC.currentTime + .3); }); mon.hum = null; } }
  function monitor(dt) {
    if (!mon) return; const S = C.S; if (!S || C.mode !== 'jogo') { pararHum(); return; }
    const dp = Math.hypot(mon.g.position.x - P.pos.x, mon.g.position.z - P.pos.z); if (dp > 14 || qual() === 'minima') { pararHum(); return; }
    mon.t -= dt; if (mon.t > 0) { /* entre quadros */ } else {
      mon.t = .2; // 5 quadros por segundo
      if (M.ativo && qual() !== 'baixa') {
        const sala = C.roomAt(M.pos.x, M.pos.z), cx = sala ? (sala.x0 + sala.x1) / 2 : M.pos.x + 3, cz = sala ? (sala.z0 + sala.z1) / 2 : M.pos.z + 3, hh = sala && sala.h ? sala.h - .35 : 3;
        camV.position.set(cx + (Math.abs(cx - M.pos.x) < .5 ? 1.5 : 0), hh, cz + (Math.abs(cz - M.pos.z) < .5 ? 1.5 : 0)); camV.lookAt(M.pos.x, 1.1, M.pos.z); camV.updateMatrixWorld();
        const vis = mon.g.visible; mon.g.visible = false; const rtAnt = renderer.getRenderTarget();
        renderer.setRenderTarget(mon.rt); renderer.render(scene, camV); renderer.setRenderTarget(rtAnt); mon.g.visible = vis;
        mon.tela.material.map = mon.rt.texture; mon.tela.material.needsUpdate = true; mon.cheia = true;
      } else { ruidoTela(); mon.tela.material.map = mon.rtex; mon.tela.material.needsUpdate = true; mon.cheia = false; }
    }
    if (mon.cheia && Math.random() < .08) { mon.tela.material.color.setRGB(.9, 1, .9); } else mon.tela.material.color.setRGB(.75, .9, .78);
    // olhar para ele: o zumbido do aparelho enche o ouvido
    const f = new THREE.Vector3(); camera.getWorldDirection(f); const d = new THREE.Vector3(mon.g.position.x - camera.position.x, 1.2 - camera.position.y, mon.g.position.z - camera.position.z), dist = d.length();
    const olhando = dist < 6 && f.dot(d.normalize()) > .9;
    seguro(() => {
      const AC = C.AC; if (!AC || AC.state !== 'running') return;
      if (olhando && !mon.hum) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sawtooth'; o.frequency.value = 58; g.gain.value = 0; o.connect(g); g.connect(AC.destination); o.start(); g.gain.setTargetAtTime(.018, AC.currentTime, .15); mon.hum = { o, g }; }
      else if (!olhando) pararHum();
    });
  }

  // =====================================================================
  // ESPELHO DE VERDADE NO BANHEIRO (segunda câmera em textura, reflexo que desobedece)
  // =====================================================================
  let esp = null; const camE = new THREE.PerspectiveCamera(72, 16 / 9, .05, 60); camE.layers.enable(2);
  function montarEspelho() {
    esp = null; if (W.mapa !== 'terreo') return;
    for (const lado of ['z0', 'z1', 'x0', 'x1']) {
      const ps = paredesLivres('banh', lado, 1); if (!ps.length) continue; const p = ps[Math.floor(ps.length / 2)];
      const rt = new THREE.WebGLRenderTarget(320, 180); const tm = new THREE.Matrix4();
      const mat = new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: rt.texture }, textureMatrix: { value: tm }, fade: { value: 0 } },
        vertexShader: 'uniform mat4 textureMatrix; varying vec4 vUv; void main(){ vUv = textureMatrix * vec4(position,1.0); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader: 'uniform sampler2D tDiffuse; uniform float fade; varying vec4 vUv; void main(){ vec4 c = texture2DProj(tDiffuse, vUv); vec3 col = c.rgb*vec3(.8,.9,.88); gl_FragColor = vec4(mix(vec3(.05,.07,.07), col, fade), 1.0);\n#include <colorspace_fragment>\n }' });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.15), mat); m.position.set(p.x + Math.sin(p.ry) * .02, 1.55, p.z + Math.cos(p.ry) * .02); m.rotation.y = p.ry; m.renderOrder = 2; W.grupo.add(m);
      const moldura = new THREE.Mesh(new THREE.BoxGeometry(.98, 1.23, .03), new THREE.MeshStandardMaterial({ color: 0x1e1a14, roughness: .8 })); moldura.position.set(p.x + Math.sin(p.ry) * .005, 1.55, p.z + Math.cos(p.ry) * .005); moldura.rotation.y = p.ry; W.grupo.add(moldura);
      // a Lia do reflexo: só a câmera do espelho a enxerga (camada 2)
      const fig = new THREE.Group(); fig.layers.set(2);
      const mt = new THREE.MeshBasicMaterial({ color: 0x23262c });
      const corpo = new THREE.Mesh(new THREE.CylinderGeometry(.2, .24, .8, 10), mt); corpo.position.y = .95; corpo.layers.set(2); fig.add(corpo);
      const cab = new THREE.Group(); cab.position.y = 1.5; fig.add(cab); cab.layers.set(2);
      const cr = new THREE.Mesh(new THREE.SphereGeometry(.14, 10, 8), new THREE.MeshBasicMaterial({ color: 0x6b5a4c })); cr.layers.set(2); cab.add(cr);
      const nariz = new THREE.Mesh(new THREE.BoxGeometry(.03, .03, .05), mt); nariz.position.set(0, 0, .13); nariz.layers.set(2); cab.add(nariz);
      const perna = new THREE.Mesh(new THREE.CylinderGeometry(.12, .1, .55, 8), mt); perna.position.y = .27; perna.layers.set(2); fig.add(perna);
      scene.add(fig);
      const S = C.S, r = U.prng(U.hashStr(((S && S.semente) || 'x') + '|espelho'));
      esp = { m, rt, mat, tm, fig, cab, n: new THREE.Vector3(Math.sin(p.ry), 0, Math.cos(p.ry)), p, acao: r() < .4 ? (r() < .5 ? 'cabeca' : 'passo') : '', t: 0, quadro: 0, fade: 0, olhaT: 0 };
      break;
    }
  }
  function espelho(dt) {
    if (!esp) return; const S = C.S; const q = qual();
    if (!S || C.mode !== 'jogo' || q === 'minima' || q === 'baixa') { esp.fig.visible = false; esp.mat.uniforms.fade.value = 0; return; } // nas qualidades baixas fica o vidro escuro
    const c = camera.position, n = esp.n, pl = esp.p;
    const dd = (c.x - pl.x) * n.x + (c.z - pl.z) * n.z; // distância ao plano do espelho
    const f = new THREE.Vector3(); camera.getWorldDirection(f);
    const alvo = new THREE.Vector3(pl.x - c.x, 1.55 - c.y, pl.z - c.z), dist = alvo.length();
    const vendo = dd > .15 && dist < 7 && f.dot(alvo.normalize()) > .35;
    esp.fade = vendo ? Math.min(1, esp.fade + dt * 4) : Math.max(0, esp.fade - dt * 4); esp.mat.uniforms.fade.value = esp.fade;
    esp.fig.visible = vendo;
    if (!vendo) return;
    // a Lia do reflexo copia a Lia; em noites sorteadas ela faz uma ação a mais
    const px = P.pos.x, pz = P.pos.z, sy = Math.sin(P.yaw), cy = Math.cos(P.yaw); esp.t += dt;
    let adiante = 0, giro = 0;
    if (esp.acao === 'passo' && Math.sin(esp.t * .5) > .8) adiante = .9; // um passo à frente
    if (esp.acao === 'cabeca' && Math.sin(esp.t * .45) > .82) giro = Math.PI * .85; // vira a cabeça para você
    esp.fig.position.set(px + sy * adiante, 0, pz + cy * adiante); esp.fig.rotation.y = P.yaw;
    esp.cab.rotation.y = lerpA(esp.cab.rotation.y, giro, dt * 6);
    esp.fig.scale.y = P.crouch ? .72 : 1;
    esp.quadro -= dt; if (esp.quadro > 0) return; esp.quadro = 1 / 12; // reflexo a 12 quadros por segundo
    // câmera refletida
    const cv = new THREE.Vector3(c.x - 2 * dd * n.x, c.y, c.z - 2 * dd * n.z), dn = f.x * n.x + f.z * n.z, dv = new THREE.Vector3(f.x - 2 * dn * n.x, f.y, f.z - 2 * dn * n.z);
    camE.position.copy(cv); camE.up.set(0, 1, 0); camE.lookAt(cv.x + dv.x, cv.y + dv.y, cv.z + dv.z);
    camE.fov = camera.fov; camE.aspect = camera.aspect; camE.near = Math.max(.05, dd * .92); camE.updateProjectionMatrix(); camE.updateMatrixWorld();
    esp.tm.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1); esp.tm.multiply(camE.projectionMatrix); esp.tm.multiply(camE.matrixWorldInverse); esp.m.updateMatrixWorld(); esp.tm.multiply(esp.m.matrixWorld);
    const vis = esp.m.visible; esp.m.visible = false; const rtAnt = renderer.getRenderTarget();
    renderer.setRenderTarget(esp.rt); renderer.render(scene, camE); renderer.setRenderTarget(rtAnt); esp.m.visible = vis;
  }
  function lerpA(a, b, k) { return a + (b - a) * Math.min(1, k); }

  return {
    lente, mapa() { pararHum(); if (esp) { scene.remove(esp.fig); } seguro(montarMonitor); seguro(montarEspelho); window.__l6bInfo = { mon: mon ? mon.g.position.toArray() : null, esp: esp ? esp.m.position.toArray() : null, espn: esp ? esp.n.toArray() : null }; },
    tick(dt) { seguro(() => monitor(dt)); seguro(() => espelho(dt)); },
    depois() { seguro(depois); }
  };
}
