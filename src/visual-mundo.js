// VISUAL E LUZ — Lote 2: o mundo e a história contados pela luz (relâmpago, lembranças de 1979, fuligem, vitrais, janelas).
// Ganchos em jogo.js: VM.update(dt, ativo) depois de VIS.update · VM.depois() depois de desenhar · VM.mapa() ao carregar um mapa
// · VM.capitulo(c) no início de cada capítulo · VM.vela(x, y, z, luz, chama) em vela().
export function instalarMundoVisual(C) {
  const { THREE, scene, camera, flash, hemi, moon, W, P, M, ANA, ANA_G, PROC, MON, MAT, MK, OPT, R, TX } = C;
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const pick = a => a[Math.random() * a.length | 0];
  const PI = Math.PI;
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), fw = new THREE.Vector3();
  const flags = () => (C.S && C.S.flags) || {};

  function tex(w, h, draw, repete) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    if (repete) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }
  const fixo = m => { m.userData.compartilhado = true; return m; };
  const suave = tex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const furos = (g, w, h, n, a = .8) => { g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < n; i++) { g.fillStyle = `rgba(0,0,0,${rand(.2, a)})`; g.fillRect(rand(0, w), rand(0, h), rand(1, 3), rand(1, 2)); } g.globalCompositeOperation = 'source-over'; };

  // =================================================================== TEXTURAS (canvas)
  function texGiz(txt, w = 512, h = 256) { // giz que só brilha no clarão
    return tex(w, h, g => {
      const ls = txt.split('\n'); g.textAlign = 'center'; g.textBaseline = 'middle';
      const tam = ls.length > 4 ? 26 : ls.length > 1 ? 56 : 80;
      g.font = `bold ${tam}px Georgia`;
      for (let p = 0; p < 4; p++) {
        g.fillStyle = `rgba(225,240,255,${.2 + p * .07})`;
        ls.forEach((l, i) => { g.save(); g.translate(w / 2 + rand(-2, 2), h / 2 + (i - (ls.length - 1) / 2) * tam * 1.12 + rand(-2, 2)); g.rotate(rand(-.03, .03)); g.fillText(l, 0, 0); g.restore(); });
      }
      furos(g, w, h, 1400, .9);
    });
  }
  function texSil(tipo) { // silhuetas pretas de criança
    return tex(128, 256, g => {
      g.fillStyle = '#000'; g.strokeStyle = '#000'; g.lineCap = 'round';
      const cab = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
      if (tipo === 'costas') {
        cab(64, 82, 24); g.fillRect(57, 100, 14, 14);
        g.beginPath(); g.moveTo(30, 236); g.quadraticCurveTo(26, 120, 64, 110); g.quadraticCurveTo(102, 120, 98, 236); g.fill();
      } else if (tipo === 'menina') {
        cab(64, 52, 21); for (const s of [-1, 1]) { g.beginPath(); g.ellipse(64 + s * 24, 78, 7, 18, s * .3, 0, 7); g.fill(); }
        g.beginPath(); g.moveTo(48, 76); g.lineTo(80, 76); g.lineTo(104, 196); g.lineTo(24, 196); g.fill();
        g.lineWidth = 9; for (const x of [52, 76]) { g.beginPath(); g.moveTo(x, 196); g.lineTo(x, 246); g.stroke(); }
        g.lineWidth = 7; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(64 + s * 16, 84); g.lineTo(64 + s * 30, 150); g.stroke(); }
      } else if (tipo === 'corre') {
        cab(74, 44, 19); g.lineWidth = 16; g.beginPath(); g.moveTo(70, 66); g.lineTo(58, 150); g.stroke();
        g.lineWidth = 9; g.beginPath(); g.moveTo(58, 150); g.lineTo(90, 196); g.lineTo(84, 246); g.moveTo(58, 150); g.lineTo(34, 200); g.lineTo(14, 222); g.stroke();
        g.lineWidth = 7; g.beginPath(); g.moveTo(68, 80); g.lineTo(100, 112); g.lineTo(112, 92); g.moveTo(66, 82); g.lineTo(40, 118); g.lineTo(26, 138); g.stroke();
      } else { // 'bracos': puxando a corda, braços para cima
        cab(64, 70, 20); g.lineWidth = 18; g.beginPath(); g.moveTo(64, 92); g.lineTo(64, 170); g.stroke();
        g.lineWidth = 9; g.beginPath(); g.moveTo(58, 170); g.lineTo(50, 248); g.moveTo(70, 170); g.lineTo(78, 248); g.stroke();
        g.lineWidth = 7; g.beginPath(); g.moveTo(56, 98); g.lineTo(58, 8); g.moveTo(72, 98); g.lineTo(66, 10); g.stroke();
      }
    });
  }
  const SIL = { costas: texSil('costas'), menina: texSil('menina'), corre: texSil('corre'), bracos: texSil('bracos') };
  const silMat = {}; for (const k in SIL) silMat[k] = fixo(new THREE.SpriteMaterial({ map: SIL[k], color: 0x000000, transparent: true, depthWrite: false }));
  const sombraMeninaMat = fixo(new THREE.MeshBasicMaterial({ map: SIL.menina, color: 0x000000, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }));

  const TX_QUEIMADO = tex(256, 256, (g, w, h) => { // parede na noite do incêndio
    g.fillStyle = '#120c08'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { const x = rand(0, w), y = rand(0, h), r = rand(10, 50), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(40,24,14,.8)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    g.strokeStyle = 'rgba(255,120,30,.85)'; for (let i = 0; i < 14; i++) { let x = rand(0, w), y = rand(0, h); g.lineWidth = rand(1, 2.5); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += rand(-14, 14); y += rand(-12, 12); g.lineTo(x, y); } g.stroke(); }
    for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,${rand(90, 170) | 0},30,${rand(.3, .9)})`; g.fillRect(rand(0, w), rand(h * .5, h), rand(1, 3), rand(1, 3)); }
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(0,0,0,.85)'); gr.addColorStop(.5, 'rgba(0,0,0,.2)'); gr.addColorStop(1, 'rgba(120,40,10,.25)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }, true);
  const TX_FUL_SOBE = tex(128, 256, (g, w, h) => { // fuligem subindo do rodapé
    for (let i = 0; i < 70; i++) { const y = h - Math.pow(Math.random(), .7) * h, x = w / 2 + rand(-1, 1) * (w * .45) * (y / h), r = rand(10, 34) * (.4 + y / h * .8); const a = .12 + .3 * (y / h); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(6,5,4,${a})`); gr.addColorStop(1, 'rgba(6,5,4,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    for (let i = 0; i < 10; i++) { const x = rand(w * .2, w * .8); const gr = g.createLinearGradient(0, h, 0, rand(0, h * .4)); gr.addColorStop(0, 'rgba(4,3,2,.5)'); gr.addColorStop(1, 'rgba(4,3,2,0)'); g.fillStyle = gr; g.fillRect(x, 0, rand(3, 9), h); }
    furos(g, w, h, 500, .6);
  });
  const TX_FUL_TETO = tex(256, 256, (g, w, h) => {
    for (let i = 0; i < 26; i++) { const x = w / 2 + rand(-80, 80), y = h / 2 + rand(-80, 80), r = rand(20, 90); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(5,4,3,.42)'); gr.addColorStop(1, 'rgba(5,4,3,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    furos(g, w, h, 600, .5);
  });
  const TX_CELESTE = tex(512, 512, (g, w, h) => { // a sombra de fuligem: a irmã abraçando três crianças
    g.filter = 'blur(3px)'; g.fillStyle = 'rgba(4,3,2,.95)';
    g.beginPath(); g.ellipse(256, 120, 40, 50, 0, 0, 7); g.fill(); // cabeça com véu
    g.beginPath(); g.moveTo(214, 120); g.quadraticCurveTo(170, 200, 150, 500); g.lineTo(362, 500); g.quadraticCurveTo(342, 200, 298, 120); g.fill(); // hábito
    for (const [x, y, r] of [[176, 300, 30], [256, 330, 32], [334, 296, 29]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.beginPath(); g.moveTo(x - r * 1.1, y + 10); g.lineTo(x - r * 1.3, 500); g.lineTo(x + r * 1.3, 500); g.lineTo(x + r * 1.1, y + 10); g.fill(); }
    g.lineWidth = 26; g.strokeStyle = 'rgba(4,3,2,.92)'; g.lineCap = 'round';
    g.beginPath(); g.moveTo(214, 190); g.quadraticCurveTo(130, 270, 196, 360); g.moveTo(298, 190); g.quadraticCurveTo(390, 270, 316, 356); g.stroke();
    g.filter = 'blur(18px)'; for (let i = 0; i < 18; i++) { const x = rand(120, 392), y = rand(40, 480), r = rand(30, 80); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(6,5,4,.3)'); gr.addColorStop(1, 'rgba(6,5,4,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    g.filter = 'none'; const gr = g.createLinearGradient(0, 0, 0, 160); gr.addColorStop(0, 'rgba(4,3,2,.6)'); gr.addColorStop(1, 'rgba(4,3,2,0)'); g.fillStyle = gr; g.fillRect(150, 0, 212, 160);
    furos(g, w, h, 2400, .7);
  });
  const TX_MAOS = tex(256, 256, (g, w, h) => { // mãos pequenas queimadas por dentro da porta
    const mao = (x, y, s, a) => { g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s); g.fillStyle = 'rgba(14,8,4,.9)'; g.beginPath(); g.ellipse(0, 0, 11, 13, 0, 0, 7); g.fill(); for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(-8 + i * 5.5, -18 - (i === 1 || i === 2 ? 3 : 0), 2.4, 7, 0, 0, 7); g.fill(); } g.beginPath(); g.ellipse(12, -2, 2.6, 6, -.8, 0, 7); g.fill(); g.restore(); };
    for (let i = 0; i < 16; i++) mao(rand(30, 226), rand(60, 236), rand(.8, 1.3), rand(-.4, .4));
    g.strokeStyle = 'rgba(10,6,4,.7)'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { const x = rand(30, 226), y = rand(80, 200); g.beginPath(); g.moveTo(x, y); g.lineTo(x + rand(-6, 6), y + rand(30, 60)); g.stroke(); } // arranhões
    furos(g, w, h, 600, .6);
  });
  function texVitral(variante) { // 0: São Lázaro do Silêncio (rosto riscado) · 1: o mesmo, com o rosto do Inspetor · 2: o santo do sino
    return tex(256, 448, (g, w, h) => {
      g.fillStyle = '#050403'; g.fillRect(0, 0, w, h);
      g.save(); g.beginPath(); g.moveTo(14, h - 10); g.lineTo(14, 120); g.quadraticCurveTo(14, 12, w / 2, 10); g.quadraticCurveTo(w - 14, 12, w - 14, 120); g.lineTo(w - 14, h - 10); g.closePath(); g.clip();
      const cores = ['#1e3a7a', '#2a5a9a', '#173060', '#5a1a3a', '#24506a', '#3a2a6a'];
      for (let y = 0; y < h; y += 34) for (let x = 0; x < w; x += 40) { g.fillStyle = pick(cores); g.fillRect(x + rand(-4, 4), y + rand(-4, 4), 46, 40); }
      g.fillStyle = '#d8b040'; g.beginPath(); g.arc(w / 2, 110, 46, 0, 7); g.fill(); // auréola
      g.fillStyle = variante === 2 ? '#2a5a3a' : '#7a1a24'; g.beginPath(); g.moveTo(w / 2 - 34, 150); g.lineTo(w / 2 + 34, 150); g.lineTo(w / 2 + 70, 400); g.lineTo(w / 2 - 70, 400); g.fill(); // manto
      g.fillStyle = '#c8b090'; g.beginPath(); g.ellipse(w / 2, 112, 26, 32, variante === 1 ? .45 : 0, 0, 7); g.fill(); // rosto
      if (variante === 1) { // o Inspetor de cabeça torta: pele cinza, boca esticada, venda suja
        g.fillStyle = '#6a6460'; g.beginPath(); g.ellipse(w / 2 + 4, 114, 26, 34, .45, 0, 7); g.fill();
        g.save(); g.translate(w / 2 + 4, 112); g.rotate(.45); g.fillStyle = '#b4a68c'; g.fillRect(-30, -14, 60, 12); g.fillStyle = '#5a0806'; g.fillRect(-14, -2, 4, 22); g.fillRect(10, -2, 4, 18); g.fillStyle = '#000'; g.beginPath(); g.ellipse(0, 18, 6, 12, 0, 0, 7); g.fill(); g.restore();
      } else {
        g.fillStyle = '#f2ecdc'; g.save(); g.translate(w / 2, 104); g.rotate(rand(-.06, .06)); g.fillRect(-32, -7, 64, 13); g.restore(); // venda branca
        if (variante === 2) { g.strokeStyle = 'rgba(250,246,236,.9)'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(w / 2 - 36 + rand(-2, 2), 98 + rand(0, 14)); g.lineTo(w / 2 + 36 + rand(-2, 2), 98 + rand(0, 14)); g.stroke(); } } // pincelada nova, por cima do chumbo
        if (variante === 0) { g.strokeStyle = 'rgba(10,6,4,.9)'; g.lineWidth = 3; for (let i = 0; i < 26; i++) { g.beginPath(); g.moveTo(w / 2 + rand(-26, 26), 86 + rand(0, 54)); g.lineTo(w / 2 + rand(-26, 26), 86 + rand(0, 54)); g.stroke(); } } // rosto riscado
      }
      g.fillStyle = '#c8b090';
      if (variante === 2) { // segura um sino; três crianças ajoelhadas
        g.fillStyle = '#c89a30'; g.beginPath(); g.moveTo(w / 2 - 22, 250); g.quadraticCurveTo(w / 2 - 20, 214, w / 2, 210); g.quadraticCurveTo(w / 2 + 20, 214, w / 2 + 22, 250); g.fill();
        g.fillStyle = '#e8dcc0'; for (const x of [50, 128, 206]) { g.beginPath(); g.arc(x, 360, 13, 0, 7); g.fill(); g.fillRect(x - 13, 372, 26, 30); }
      } else { g.beginPath(); g.ellipse(w / 2 + 12, 150, 7, 9, 0, 0, 7); g.fill(); g.fillRect(w / 2 + 10, 128, 4, 22); } // dedo nos lábios
      g.fillStyle = '#e8dcc0'; g.fillRect(24, 404, w - 48, 26); g.fillStyle = '#3a1a10'; g.font = 'bold 14px Georgia'; g.textAlign = 'center'; g.fillText(variante === 2 ? 'O SINO DOS INOCENTES' : 'S. LÁZARO DO SILÊNCIO', w / 2, 422);
      g.strokeStyle = '#050403'; g.lineWidth = 4; // chumbo
      for (let y = 30; y < h; y += rand(30, 46)) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + rand(-8, 8)); g.stroke(); }
      for (let x = 30; x < w; x += rand(34, 52)) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + rand(-10, 10), h); g.stroke(); }
      g.restore();
      speck(g, w, h, 900, ['#000', '#2a2418'], .5);
    });
  }
  function speck(g, w, h, n, cols, alpha) { for (let i = 0; i < n; i++) { g.globalAlpha = alpha * Math.random(); g.fillStyle = cols[i % cols.length]; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.globalAlpha = 1; }
  const VITRAL = [texVitral(0), texVitral(1), texVitral(2)];
  const TX_LUZJANELA = tex(128, 256, (g, w, h) => { // luz recortada pelo caixilho em cruz
    g.filter = 'blur(6px)'; g.fillStyle = 'rgba(255,255,255,1)';
    g.beginPath(); g.moveTo(30, 18); g.lineTo(98, 18); g.lineTo(118, 240); g.lineTo(10, 240); g.fill();
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.fillRect(58, 0, 12, h); g.fillRect(0, 118, w, 12);
    g.lineWidth = 4; g.strokeStyle = '#000'; g.beginPath(); g.moveTo(20, 60); g.quadraticCurveTo(60, 90, 50, 150); g.moveTo(100, 40); g.quadraticCurveTo(80, 120, 108, 200); g.stroke(); // sombra de galhos
    g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  });
  // vidro com chuva escorrendo (animado a 10 qps)
  const cvChuva = document.createElement('canvas'); cvChuva.width = 64; cvChuva.height = 96; const gChuva = cvChuva.getContext('2d');
  const TX_VIDRO = new THREE.CanvasTexture(cvChuva); TX_VIDRO.colorSpace = THREE.SRGBColorSpace;
  const gotasV = Array.from({ length: 22 }, () => ({ x: rand(0, 64), y: rand(0, 96), v: rand(6, 30), l: rand(3, 12) }));
  function desenhaVidro(dt) {
    const g = gChuva; const gr = g.createLinearGradient(0, 0, 0, 96); gr.addColorStop(0, '#2a3448'); gr.addColorStop(1, '#141a26'); g.fillStyle = gr; g.fillRect(0, 0, 64, 96);
    g.fillStyle = 'rgba(10,14,20,.9)'; g.beginPath(); g.moveTo(0, 96); g.quadraticCurveTo(20, 60, 40, 70); g.quadraticCurveTo(54, 74, 64, 52); g.lineTo(64, 96); g.fill(); // copas lá fora
    g.strokeStyle = 'rgba(190,210,240,.55)'; g.lineWidth = 1;
    for (const d of gotasV) { d.y += d.v * dt; if (d.y > 100) { d.y = -d.l; d.x = rand(0, 64); d.v = rand(6, 30); } g.beginPath(); g.moveTo(d.x, d.y); g.lineTo(d.x + Math.sin(d.y * .2) * .8, d.y + d.l); g.stroke(); }
    g.fillStyle = 'rgba(200,215,240,.4)'; for (let i = 0; i < 18; i++) g.fillRect(rand(0, 64), rand(0, 96), 1, 1);
    TX_VIDRO.needsUpdate = true;
  }
  desenhaVidro(0);
  const TX_CORTINA = tex(64, 128, (g, w, h) => {
    for (let x = 0; x < w; x += 4) { g.fillStyle = `hsl(36,18%,${rand(36, 48)}%)`; g.fillRect(x, 0, 4, h); }
    speck(g, w, h, 300, ['#3a3020', '#6a5a40'], .5);
    const gr = g.createLinearGradient(0, h * .6, 0, h); gr.addColorStop(0, 'rgba(30,14,6,0)'); gr.addColorStop(.6, 'rgba(30,14,6,.9)'); gr.addColorStop(1, 'rgba(6,3,2,1)'); g.fillStyle = gr; g.fillRect(0, h * .6, w, h * .4);
    g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 4) g.lineTo(x, h - rand(4, 22)); g.lineTo(w, h); g.fill();
    for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(rand(0, w), rand(h * .7, h), rand(2, 6), 0, 7); g.fill(); }
    g.globalCompositeOperation = 'source-over';
  });
  const TX_PATINHOS = tex(256, 256, (g, w, h) => { // papel de parede infantil desbotado e descascando
    g.fillStyle = '#86805e'; g.fillRect(0, 0, w, h);
    for (let y = 18; y < h * .66; y += 40) for (let x = ((y / 40) % 2) * 26 + 10; x < w; x += 52) {
      g.fillStyle = 'rgba(170,154,80,.38)'; g.beginPath(); g.ellipse(x, y, 11, 7, 0, 0, 7); g.fill(); g.beginPath(); g.arc(x + 9, y - 7, 5, 0, 7); g.fill();
      g.fillStyle = 'rgba(170,90,40,.6)'; g.fillRect(x + 13, y - 8, 5, 2); g.fillStyle = 'rgba(30,24,14,.6)'; g.fillRect(x + 10, y - 9, 1.5, 1.5);
    }
    g.strokeStyle = 'rgba(120,110,80,.35)'; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h * .66); g.stroke(); }
    for (let i = 0; i < 5; i++) { const x = rand(0, w), y = rand(0, h * .55), ww = rand(8, 22), hh = rand(10, 30); g.fillStyle = 'rgba(104,98,80,.85)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + ww, y + rand(-6, 6)); g.lineTo(x + ww * .7, y + hh); g.lineTo(x - 4, y + hh * .8); g.fill(); g.fillStyle = 'rgba(220,210,170,.35)'; g.fillRect(x, y - 2, ww, 2); } // descascado
    for (let i = 0; i < 6; i++) { const x = rand(0, w), hh = rand(40, 140); const gr = g.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, 'rgba(40,30,14,.5)'); gr.addColorStop(1, 'rgba(40,30,14,0)'); g.fillStyle = gr; g.fillRect(x, 0, rand(6, 18), hh); }
    g.fillStyle = 'rgba(48,52,40,.75)'; g.fillRect(0, h * .66, w, h * .34); g.fillStyle = 'rgba(18,14,10,.7)'; g.fillRect(0, h * .66, w, 4);
    speck(g, w, h, 1600, ['#4a4338', '#7d7462'], .4);
  }, true);
  const baseImg = (k, w, h, extra) => tex(w, h, (g, ww, hh) => { if (TX && TX[k] && TX[k].image) g.drawImage(TX[k].image, 0, 0, ww, hh); else { g.fillStyle = '#333'; g.fillRect(0, 0, ww, hh); } extra(g, ww, hh); }, true);
  const TX_TIJOLO_LIMO = baseImg('tijolo', 256, 256, (g, w, h) => { // limo escorrido e a marca da água
    for (let i = 0; i < 16; i++) { const x = rand(0, w), hh = rand(30, 160); const gr = g.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, 'rgba(30,60,20,.65)'); gr.addColorStop(1, 'rgba(30,60,20,0)'); g.fillStyle = gr; g.fillRect(x, 0, rand(4, 14), hh); }
    g.fillStyle = 'rgba(14,22,10,.55)'; g.fillRect(0, h * .84, w, h * .16); g.fillStyle = 'rgba(70,80,50,.7)'; for (let x = 0; x < w; x += 3) g.fillRect(x, h * .84 + Math.sin(x * .2) * 2, 3, 3);
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(40,${rand(70, 100) | 0},30,${rand(.2, .6)})`; g.fillRect(rand(0, w), h * .84 - Math.pow(Math.random(), 2) * h * .3, rand(1, 3), rand(1, 3)); }
  });
  const TX_PEDRA_CERA = baseImg('pedra', 256, 256, (g, w, h) => { // pedra da capela: fuligem e cera escorrida
    for (let i = 0; i < 20; i++) { const x = rand(0, w), y = rand(0, h), r = rand(14, 60); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(6,4,2,.5)'); gr.addColorStop(1, 'rgba(6,4,2,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    for (let i = 0; i < 4; i++) { const x = rand(0, w), y = rand(h * .3, h * .8), l = rand(10, 34); g.fillStyle = 'rgba(176,160,120,.42)'; g.fillRect(x, y, rand(2, 3), l); g.beginPath(); g.arc(x + 1, y + l, 2.5, 0, 7); g.fill(); }
  });
  const TX_BRASAO = tex(256, 256, (g, w, h) => { // sino de boca costurada · SILENTIUM SALVAT
    g.fillStyle = '#1c2438'; g.strokeStyle = '#a8883a'; g.lineWidth = 8;
    g.beginPath(); g.moveTo(40, 30); g.lineTo(216, 30); g.lineTo(216, 130); g.quadraticCurveTo(216, 210, 128, 240); g.quadraticCurveTo(40, 210, 40, 130); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#c8a040'; g.beginPath(); g.moveTo(80, 160); g.quadraticCurveTo(82, 70, 128, 64); g.quadraticCurveTo(174, 70, 176, 160); g.lineTo(186, 172); g.lineTo(70, 172); g.fill();
    g.fillRect(122, 50, 12, 16);
    g.strokeStyle = '#1c2438'; g.lineWidth = 4; g.beginPath(); g.moveTo(76, 172); g.lineTo(180, 172); g.stroke();
    g.lineWidth = 3; for (let x = 84; x <= 172; x += 11) { g.beginPath(); g.moveTo(x - 4, 165); g.lineTo(x + 4, 180); g.moveTo(x + 4, 165); g.lineTo(x - 4, 180); g.stroke(); } // boca costurada
    g.fillStyle = '#d8ccb0'; g.fillRect(30, 196, 196, 30); g.fillStyle = '#2a1a10'; g.font = 'bold 19px Georgia'; g.textAlign = 'center'; g.fillText('SILENTIUM SALVAT', 128, 218);
  });
  const TX_PRATO = tex(128, 128, (g, w, h) => {
    g.fillStyle = '#cfc8b6'; g.beginPath(); g.arc(64, 64, 63, 0, 7); g.fill(); g.strokeStyle = '#3a4a7a'; g.lineWidth = 5; g.beginPath(); g.arc(64, 64, 56, 0, 7); g.stroke();
    g.drawImage(TX_BRASAO.image, 40, 40, 48, 48);
  });
  const TX_PRATO_SUJO = tex(128, 128, (g, w, h) => {
    g.drawImage(TX_PRATO.image, 0, 0); for (let i = 0; i < 8; i++) { const x = rand(20, 108), y = rand(20, 108), r = rand(6, 26); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(50,36,20,.8)'); gr.addColorStop(1, 'rgba(50,36,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    g.strokeStyle = 'rgba(20,14,8,.8)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(64, 2); g.lineTo(58, 40); g.lineTo(70, 70); g.stroke();
  });
  function texRabisco(tipo) { // riscos de giz e lápis na altura de criança
    return tex(256, 128, (g, w, h) => {
      g.strokeStyle = 'rgba(235,230,215,.95)'; g.fillStyle = 'rgba(235,230,215,.95)'; g.lineWidth = 3; g.lineCap = 'round';
      const boneco = (x, y, s = 1) => { g.beginPath(); g.arc(x, y - 30 * s, 8 * s, 0, 7); g.moveTo(x, y - 22 * s); g.lineTo(x, y); g.lineTo(x - 9 * s, y + 18 * s); g.moveTo(x, y); g.lineTo(x + 9 * s, y + 18 * s); g.moveTo(x - 12 * s, y - 14 * s); g.lineTo(x + 12 * s, y - 14 * s); g.stroke(); };
      if (tipo === 'shhh') { g.font = 'bold 54px Georgia'; g.save(); g.translate(128, 72); g.rotate(-.06); g.fillText('SHHH', -78, 0); g.restore(); g.beginPath(); g.moveTo(40, 100); g.lineTo(220, 96); g.stroke(); }
      else if (tipo === 'maos') { boneco(70, 80); boneco(120, 80, .85); boneco(170, 80, .7); g.beginPath(); g.moveTo(82, 66); g.lineTo(108, 66); g.moveTo(132, 68); g.lineTo(158, 68); g.stroke(); }
      else if (tipo === 'alto') { // homem alto com X nos olhos
        g.beginPath(); g.ellipse(128, 22, 10, 13, 0, 0, 7); g.moveTo(128, 35); g.lineTo(128, 96); g.lineTo(116, 126); g.moveTo(128, 96); g.lineTo(140, 126); g.moveTo(128, 46); g.lineTo(96, 112); g.moveTo(128, 46); g.lineTo(160, 112); g.stroke();
        g.lineWidth = 2; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(128 + s * 5 - 3, 17); g.lineTo(128 + s * 5 + 3, 23); g.moveTo(128 + s * 5 + 3, 17); g.lineTo(128 + s * 5 - 3, 23); g.stroke(); }
        boneco(50, 96, .6); boneco(210, 96, .6);
      } else if (tipo === 'sino') { g.beginPath(); g.moveTo(98, 100); g.quadraticCurveTo(100, 30, 128, 26); g.quadraticCurveTo(156, 30, 158, 100); g.lineTo(98, 100); g.stroke(); g.beginPath(); g.arc(128, 108, 6, 0, 7); g.stroke(); g.font = '20px Georgia'; g.fillText('DIN DON', 168, 50); }
      else { g.font = 'bold 22px Georgia'; for (let i = 1; i <= 10; i++) g.fillText(String(i), 10 + (i - 1) * 24, 60 + Math.sin(i) * 6); g.beginPath(); g.moveTo(8, 80); g.lineTo(250, 84); g.stroke(); }
      furos(g, w, h, 900, .9);
    });
  }
  const TX_SETA = tex(128, 64, (g, w, h) => { g.strokeStyle = 'rgba(240,236,220,.95)'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(10, 32); g.lineTo(110, 32); g.moveTo(84, 12); g.lineTo(112, 32); g.lineTo(84, 52); g.stroke(); g.fillStyle = 'rgba(240,236,220,.9)'; g.font = 'bold 13px Georgia'; g.fillText('D', 20, 22); furos(g, w, h, 300, .9); });
  const TX_TEIA = tex(128, 128, (g, w, h) => {
    g.strokeStyle = 'rgba(230,230,225,.7)'; g.lineWidth = 1;
    for (let i = 0; i < 9; i++) { const a = i / 8 * PI / 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 128, Math.sin(a) * 128); g.stroke(); }
    for (let r = 14; r < 128; r += rand(9, 16)) { g.beginPath(); for (let i = 0; i <= 8; i++) { const a = i / 8 * PI / 2, rr = r + rand(-3, 3); i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.stroke(); }
  });
  const TX_LUA = tex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 10, 64, 64, 64); gr.addColorStop(0, 'rgba(235,240,250,1)'); gr.addColorStop(.32, 'rgba(210,220,240,.95)'); gr.addColorStop(.36, 'rgba(150,170,210,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(150,160,180,.4)'; for (const [x, y, r] of [[56, 58, 6], [72, 70, 4], [62, 76, 3]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } });
  const TX_QUEIMA_CHAO = tex(256, 256, (g, w, h) => { for (let i = 0; i < 60; i++) { const a = rand(0, 6.28), d = Math.pow(Math.random(), .8) * 110, x = 128 + Math.cos(a) * d, y = 128 + Math.sin(a) * d, r = rand(10, 40) * (1 - d / 160); const gr = g.createRadialGradient(x, y, 0, x, y, Math.max(2, r)); gr.addColorStop(0, 'rgba(8,6,4,.55)'); gr.addColorStop(1, 'rgba(8,6,4,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } furos(g, w, h, 900, .6); });
  const TX_BURACO = tex(64, 64, (g, w, h) => { g.fillStyle = '#9ab0d0'; g.beginPath(); for (let i = 0; i <= 12; i++) { const a = i / 12 * 6.28, r = rand(18, 30); i ? g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r) : g.moveTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } g.fill(); });
  const TX_FEIXE = tex(8, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,.05)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const TX_POCA = tex(128, 128, (g, w, h) => { g.fillStyle = '#fff'; g.beginPath(); for (let i = 0; i <= 14; i++) { const a = i / 14 * 6.28, r = rand(36, 60); i ? g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r * .8) : g.moveTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r * .8); } g.fill(); });

  // =================================================================== TELA: calor, lembranças
  const css = document.createElement('style');
  css.textContent = `.vm-fx{position:fixed;inset:0;pointer-events:none;opacity:0}
#vm-calor{background:radial-gradient(ellipse at center,rgba(255,140,50,.10) 0%,rgba(255,110,30,.32) 100%);mix-blend-mode:screen}
#vm-memoria{width:100%;height:100%;mix-blend-mode:normal}`;
  document.head.appendChild(css);
  const ref = document.querySelector('#fx-red') || document.body.firstChild;
  const camada = (id, tag = 'div') => { const e = document.createElement(tag); e.id = id; e.className = 'vm-fx'; if (ref && ref.parentNode) ref.after(e); else document.body.appendChild(e); return e; };
  const elCalor = camada('vm-calor'), elMem = camada('vm-memoria', 'canvas');
  elMem.width = 480; elMem.height = 270;
  { // a mesma sala em 1979: luz amarela de fita velha, crianças borradas
    const g = elMem.getContext('2d'), w = 480, h = 270;
    const gr = g.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * .62); gr.addColorStop(0, 'rgba(255,214,140,.42)'); gr.addColorStop(1, 'rgba(90,50,16,.85)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.filter = 'blur(4px)';
    for (let i = 0; i < 7; i++) { const x = 50 + i * 64 + rand(-10, 10), y = h * .9, s = rand(.8, 1.1); g.fillStyle = `rgba(40,22,8,${rand(.35, .6)})`; g.beginPath(); g.arc(x, y - 92 * s, 15 * s, 0, 7); g.fill(); g.fillRect(x - 15 * s, y - 76 * s, 30 * s, 80 * s); }
    g.filter = 'none'; for (let i = 0; i < 4000; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? '255,240,200' : '40,20,6'},${rand(.05, .2)})`; g.fillRect(rand(0, w), rand(0, h), 1, 1); }
    for (let y = 0; y < h; y += 3) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, y, w, 1); }
  }
  let memT = 0, memDur = .5, calorAlvo = 0, calor = 0;
  // luz quente única (lampião de 1979): reaproveitada por todas as lembranças, nunca muda o número de luzes da cena
  const LM = new THREE.PointLight(0xffb060, 0, 14, 1.3); scene.add(LM);
  let lmI = 0, lmAlvo = 0;

  // =================================================================== HELPERS DE PAREDE
  const OFF = .12;
  function naParede(r, lado, c, y, w, h, mat, off = OFF, pai = W.grupo) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    if (lado === 0) m.position.set(c, y, r.z0 + off);
    else if (lado === 1) { m.position.set(c, y, r.z1 - off); m.rotation.y = PI; }
    else if (lado === 2) { m.position.set(r.x0 + off, y, c); m.rotation.y = PI / 2; }
    else { m.position.set(r.x1 - off, y, c); m.rotation.y = -PI / 2; }
    pai.add(m); return m;
  }
  function semPorta(r, lado, c, folga = 1.4) {
    for (const l of W.links) {
      if (l.a !== r.id && l.b !== r.id) continue;
      if (lado < 2 && l.eixo === 'x' && Math.abs(l.z - (lado === 0 ? r.z0 : r.z1)) < .05 && Math.abs(l.x - c) < folga) return false;
      if (lado >= 2 && l.eixo === 'z' && Math.abs(l.x - (lado === 2 ? r.x0 : r.x1)) < .05 && Math.abs(l.z - c) < folga) return false;
    }
    return true;
  }
  function externo(r, lado, c) {
    for (const o of W.salas) {
      if (o === r || o.fora) continue;
      if (lado === 0 && Math.abs(o.z1 - r.z0) < .05 && c > o.x0 - .4 && c < o.x1 + .4) return false;
      if (lado === 1 && Math.abs(o.z0 - r.z1) < .05 && c > o.x0 - .4 && c < o.x1 + .4) return false;
      if (lado === 2 && Math.abs(o.x1 - r.x0) < .05 && c > o.z0 - .4 && c < o.z1 + .4) return false;
      if (lado === 3 && Math.abs(o.x0 - r.x1) < .05 && c > o.z0 - .4 && c < o.z1 + .4) return false;
    }
    return true;
  }
  let OCUP = [];
  function livre(r, lado, c, meio, y0, y1) { for (const o of OCUP) if (o.r === r && o.lado === lado && Math.abs(o.c - c) < o.meio + meio && !(y1 < o.y0 || y0 > o.y1)) return false; return true; }
  function vaga(r, lado, larg, y0, y1, folga = 1.4, tent = 8) {
    const lo = lado < 2 ? r.x0 : r.z0, hi = lado < 2 ? r.x1 : r.z1;
    if (hi - lo < larg + 1) return null;
    for (let i = 0; i < tent; i++) { const c = rand(lo + larg / 2 + .4, hi - larg / 2 - .4); if (semPorta(r, lado, c, folga + larg / 2) && livre(r, lado, c, larg / 2, y0, y1)) { OCUP.push({ r, lado, c, meio: larg / 2, y0, y1 }); return c; } }
    return null;
  }
  const decal = (map, extra = {}) => new THREE.MeshStandardMaterial({ map, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, roughness: 1, ...extra });
  const cloneRep = (t, rx, ry) => { const c = t.clone(); c.needsUpdate = true; c.repeat.set(rx, ry); c.userData = { clone: true }; return c; };
  const salasMapa = (filtro) => W.salas.filter(r => !r.fora && (!filtro || filtro(r)));
  function naLanterna(p, dmax = 7, abre = .93) {
    if (flash.intensity < 3) return 0;
    v1.copy(p).sub(camera.position); const d = v1.length(); if (d > dmax || d < .05) return 0;
    const dot = fw.dot(v1.multiplyScalar(1 / d));
    return clamp((dot - abre) / (1 - abre) * 1.6, 0, 1) * clamp((dmax - d) / 2, 0, 1);
  }
  function sprite(mat, x, y, z, sx, sy, pai) { const s = new THREE.Sprite(mat); s.position.set(x, y, z); s.scale.set(sx, sy, 1); pai.add(s); return s; }
  const hit = (m, it) => { if (it) m.traverse(o => { o.userData.it = it; }); };

  // =================================================================== ESTADO POR MAPA
  let G = null; // tudo que é do mapa atual
  const nG = () => ({
    giz: [], lanternaDec: [], setas: [], flashback: {}, pedido: {}, salaT: 0, salaId: null, janelas: [], vidro: null, patch: null, cortinas: [],
    feixes: null, celeste: null, vitrais: [], capela: null, espelhos: [], pocas: [], abajur: null, retrato: null, cinza: null, fatuos: [], mariposa: null, sombraT: 30, sombraN: 0,
    energiaPrev: null, badT: 0, onda: -1, engasgo: 0, engasgoT: rand(40, 90), ger: false, gotas: null, poeiraQueda: null, sino: null, sinoPrev: false, procT: 0, procMem: false
  });

  // =================================================================== RELÂMPAGO: escritas, retrato, vitrais, espelhos, 1979
  const GIZ = {
    terreo: [['hall', 'ELE OUVE O TEU\nCORAÇÃO'], ['refeit', 'NOVE BADALADAS\nE NINGUÉM DORME'], ['aula', 'O DAVI VAI\nTOCAR O SINO'], ['biblio', 'O DIRETOR\nSABIA'], ['enferm', 'ELE JÁ NÃO\nENXERGA']],
    superior: [['dormA', 'LIA, VEM\nME BUSCAR'], ['dormC', 'A ANA CONTA\nPRA NÃO CHORAR'], ['dormD', 'QUEM FALA\nVAI PRO ARMÁRIO'], ['brinq', 'A GENTE\nNÃO ESQUECEU']]
  };
  function gizes() {
    const lista = GIZ[W.mapa]; if (!lista) return;
    for (const [id, txt] of lista) {
      const r = W.salas.find(s => s.id === id); if (!r) continue;
      for (const lado of [0, 1, 2, 3].sort(() => Math.random() - .5)) {
        const c = vaga(r, lado, 1.8, 1.3, 2.5); if (c === null) continue;
        const mat = new THREE.MeshBasicMaterial({ map: texGiz(txt), color: 0xcfe2ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3 });
        mat.map.userData = { clone: true };
        const m = naParede(r, lado, c, 1.9, 1.8, .9, mat, OFF + .004); m.rotation.z = rand(-.05, .05); G.giz.push(m); break;
      }
    }
  }
  function nomesCapela() { // os nove nomes, em giz, na parede da torre do sino
    const r = W.salas.find(s => s.id === 'capela'); if (!r) return;
    const nomes = (R.lapides || []).map(l => l.nome).filter(n => n && !n.startsWith('—')).slice(0, 9);
    if (!nomes.length) return;
    const mat = new THREE.MeshBasicMaterial({ map: texGiz(['OS NOVE DA NOITE', ...nomes].join('\n'), 512, 512), color: 0xcfe2ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3 });
    mat.map.userData = { clone: true };
    G.giz.push(naParede(r, 3, -61, 2.3, 2.2, 2.2, mat, OFF + .004));
  }
  function retrato1979() { // foto da turma na recepção; no clarão, uma figura alta e vendada aparece atrás das crianças
    const r = W.salas.find(s => s.id === 'hall'); if (!r) return;
    let lado = 3, c = vaga(r, 3, 1.2, 1.2, 2.4); if (c === null) { lado = 2; c = vaga(r, 2, 1.2, 1.2, 2.4); } if (c === null) return;
    const foto = tex(512, 360, (g, w, h) => {
      g.fillStyle = '#d8ccb0'; g.fillRect(0, 0, w, h);
      const gr = g.createLinearGradient(0, 24, 0, 300); gr.addColorStop(0, '#5a4630'); gr.addColorStop(1, '#8a7252'); g.fillStyle = gr; g.fillRect(24, 24, w - 48, 276);
      g.fillStyle = '#3a2c1c'; g.fillRect(24, 24, w - 48, 90);
      for (let row = 0; row < 3; row++) { const n = 8 - row % 2, y = 266 - row * 50; for (let i = 0; i < n; i++) { const x = 70 + i * 50 + (row % 2) * 25; g.fillStyle = '#2a2016'; g.beginPath(); g.arc(x, y - 30, 12, 0, 7); g.fill(); g.fillStyle = row === 0 ? '#4a3a28' : '#3a2e20'; g.fillRect(x - 15, y - 18, 30, 40); g.fillStyle = '#b8a07a'; g.fillRect(x - 6, y - 34, 12, 8); } }
      g.fillStyle = '#100c08'; g.fillRect(452, 120, 34, 160); g.fillStyle = '#d8ccb0'; g.beginPath(); g.arc(469, 128, 12, 0, 7); g.fill(); g.fillStyle = '#100c08'; g.beginPath(); g.arc(469, 126, 14, PI, 0); g.fill(); // a irmã
      g.fillStyle = '#1a140e'; g.fillRect(26, 130, 32, 150); g.fillStyle = '#b8a07a'; g.beginPath(); g.arc(42, 122, 12, 0, 7); g.fill(); // o diretor
      g.fillStyle = '#3a2c1c'; g.font = 'italic 21px Georgia'; g.textAlign = 'center'; g.fillText('Internato São Lázaro · turma de 1979', w / 2, 334);
      for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${Math.random() < .5 ? '255,240,210' : '20,12,6'},${rand(.04, .16)})`; g.fillRect(rand(24, w - 24), rand(24, 300), 1, 1); }
      for (let i = 0; i < 6; i++) { const x = rand(30, w - 30), y = rand(30, 290), rr = rand(10, 40); const gg = g.createRadialGradient(x, y, 0, x, y, rr); gg.addColorStop(0, 'rgba(90,60,20,.35)'); gg.addColorStop(1, 'rgba(90,60,20,0)'); g.fillStyle = gg; g.fillRect(0, 0, w, h); }
    }); foto.userData = { clone: true };
    const vulto = tex(512, 360, (g) => {
      g.fillStyle = 'rgba(6,4,2,.96)'; g.beginPath(); g.moveTo(286, 70); g.lineTo(326, 70); g.lineTo(334, 240); g.lineTo(278, 240); g.fill();
      g.save(); g.translate(306, 52); g.rotate(.4); g.beginPath(); g.ellipse(0, 0, 15, 21, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(230,222,200,.95)'; g.fillRect(-17, -6, 34, 7); g.restore();
      g.lineWidth = 7; g.strokeStyle = 'rgba(6,4,2,.96)'; g.beginPath(); g.moveTo(290, 80); g.lineTo(262, 230); g.moveTo(322, 80); g.lineTo(352, 230); g.stroke();
    }); vulto.userData = { clone: true };
    const grp = new THREE.Group(); W.grupo.add(grp);
    const base = naParede(r, lado, c, 1.75, 1.04, .76, new THREE.MeshStandardMaterial({ color: 0x1e140c, roughness: .8 }), OFF - .005, grp);
    const ft = naParede(r, lado, c, 1.75, .96, .68, new THREE.MeshStandardMaterial({ map: foto, roughness: .5, emissive: 0x1a140c, emissiveIntensity: .25 }), OFF + .002, grp);
    const vm = new THREE.MeshBasicMaterial({ map: vulto, transparent: true, opacity: 0, depthWrite: false });
    const ov = naParede(r, lado, c, 1.75, .96, .68, vm, OFF + .006, grp);
    const it = C.interact(grp, () => 'Foto da turma de 1979. Uma freira, o diretor e vinte e três crianças.', () => {});
    hit(base, it); hit(ft, it); hit(ov, it);
    G.retrato = { vm, visto: false };
  }
  function vitrais() { // capela: o santo vendado (oeste) e o santo do sino (leste)
    const r = W.salas.find(s => s.id === 'capela'); if (!r) return;
    const mk = (lado, c, var0) => {
      const mat = new THREE.MeshBasicMaterial({ map: VITRAL[var0], color: 0x222222, transparent: true, depthWrite: false, side: THREE.DoubleSide });
      const m = naParede(r, lado, c, 3.7, 1.5, 2.62, mat, OFF + .002);
      const fx = lado === 2 ? r.x0 + 2.4 : r.x1 - 2.4;
      const chao = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 3.4), new THREE.MeshBasicMaterial({ map: VITRAL[var0], transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2 }));
      chao.rotation.x = -PI / 2; chao.rotation.z = lado === 2 ? -PI / 2 : PI / 2; chao.position.set(fx, .02, c); W.grupo.add(chao);
      const it = C.interact(m, () => var0 === 2 ? 'Vitral: um santo segura um sino sobre três crianças ajoelhadas. A venda dele foi pintada depois, por cima do vidro.' : 'Vitral: "São Lázaro do Silêncio", vendado, com o dedo nos lábios. Alguém riscou o rosto dele.', () => {});
      void it;
      G.vitrais.push({ mat, chao, var0, troca: var0 === 0, trocado: false, t: 0 });
    };
    mk(2, -58, 0); mk(3, -56, 2);
  }
  function espelhos() { // no clarão, o espelho mostra uma criança atrás de você
    for (const r of salasMapa(s => s.tipo === 'banheiro')) {
      const n = Math.min(3, Math.floor((r.x1 - r.x0 - 1) / 1.6));
      for (let i = 0; i < n; i++) {
        const x = r.x0 + 1.2 + i * 1.6, m = new THREE.Mesh(new THREE.PlaneGeometry(.34, .58), new THREE.MeshBasicMaterial({ map: SIL.menina, color: 0x000000, transparent: true, opacity: 0, depthWrite: false }));
        m.position.set(x, 1.55, r.z1 - .125); m.rotation.y = PI; W.grupo.add(m); G.espelhos.push({ m, x, z: r.z1 - .12, usado: false });
      }
    }
  }
  // lembranças de 1979 e da noite do incêndio, uma vez por sala, num clarão
  function flashbacks() {
    const marcar = (r, tipo, construir) => { const grp = new THREE.Group(); grp.visible = false; W.grupo.add(grp); const intacto = new THREE.Group(); grp.add(intacto); const criancas = new THREE.Group(); grp.add(criancas); construir(r, intacto, criancas); G.flashback[r.id] = { r, tipo, grp, intacto, criancas, t: 0 }; };
    const branco = new THREE.MeshStandardMaterial({ color: 0xeee8da, roughness: .9, emissive: 0x3a3020, emissiveIntensity: .6 });
    const cobrir = (r, mat, pai) => { const h = r.h || 3.2; for (const lado of [0, 1, 2, 3]) { const len = lado < 2 ? r.x1 - r.x0 : r.z1 - r.z0, c = lado < 2 ? (r.x0 + r.x1) / 2 : (r.z0 + r.z1) / 2; const m = mat.clone(); m.map = cloneRep(mat.map, len / 3, h / 3.2); naParede(r, lado, c, h / 2, len - .1, h, m, OFF - .01, pai); } };
    const queimado = new THREE.MeshStandardMaterial({ map: TX_QUEIMADO, roughness: 1, emissive: 0xff5010, emissiveMap: TX_QUEIMADO, emissiveIntensity: .35 });
    const R_ = id => W.salas.find(s => s.id === id);
    if (W.mapa === 'terreo') {
      const rf = R_('refeit'); if (rf) marcar(rf, '1979', (r, intacto, criancas) => {
        const cx = (r.x0 + r.x1) / 2, w = r.x1 - r.x0, d = r.z1 - r.z0, n = Math.max(2, Math.floor(d / 4)), mw = w * .65;
        const prato = new THREE.MeshStandardMaterial({ map: TX_PRATO, roughness: .4 }), lado = new THREE.MeshStandardMaterial({ color: 0xcfc8b6, roughness: .4 });
        for (let k = 0; k < n; k++) {
          const z = r.z0 + d * (k + .5) / n;
          const toalha = new THREE.Mesh(new THREE.BoxGeometry(mw + .1, .02, 1.16), branco); toalha.position.set(cx, .835, z); intacto.add(toalha);
          const np = Math.floor(mw / .75);
          for (let i = 0; i < np; i++) for (const s of [-1, 1]) {
            const x = cx - mw / 2 + .4 + i * (mw - .8) / Math.max(1, np - 1);
            const p = new THREE.Mesh(new THREE.CylinderGeometry(.11, .1, .015, 14), [lado, prato, lado]); p.position.set(x, .852, z + s * .36); intacto.add(p);
            const cp = new THREE.Mesh(new THREE.CylinderGeometry(.035, .03, .08, 8), lado); cp.position.set(x + .16, .885, z + s * .3); intacto.add(cp);
            if ((i + k + (s > 0 ? 1 : 0)) % 2 === 0) sprite(silMat.costas, x, .78, z + s * .85, .5, 1, criancas);
          }
        }
      });
      const au = R_('aula'); if (au) marcar(au, '1979', (r, intacto, criancas) => {
        const w = r.x1 - r.x0, d = r.z1 - r.z0, cz = (r.z0 + r.z1) / 2;
        for (let i = 0; i < 3; i++) for (let k = 0; k < 2; k++) sprite(silMat.costas, r.x0 + w * (.22 + i * .2), .78, r.z0 + d * (.3 + k * .35) + .6, .48, .95, criancas);
        const lousa = tex(512, 256, (g, ww, hh) => { g.fillStyle = '#22342a'; g.fillRect(0, 0, ww, hh); g.fillStyle = 'rgba(235,235,225,.9)'; g.font = '30px Georgia'; g.fillText('Quarta-feira, 14 de março de 1979', 30, 50); g.font = 'italic 26px Georgia'; g.fillText('Ditado: "O silêncio é a voz de Deus."', 30, 110); g.font = '24px Georgia'; g.fillText('Hoje à noite: Hora do Silêncio às 21h.', 30, 170); }); lousa.userData = { clone: true };
        const m = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(4, d * .6), 1.4), new THREE.MeshBasicMaterial({ map: lousa, color: 0xb0b0a8 })); m.position.set(r.x1 - .13, 1.7, cz); m.rotation.y = -PI / 2; intacto.add(m);
      });
    } else if (W.mapa === 'superior') {
      const db = R_('dormB'); if (db) marcar(db, '1979', (r, intacto, criancas) => {
        let i = 0;
        for (const L of W.lockers) {
          if (L.tipo !== 'cama' || L.x < r.x0 || L.x > r.x1 || L.z < r.z0 || L.z > r.z1) continue;
          const ao = L.ao, Lx = ao === 'x' ? 1.9 : .85, Lz = ao === 'x' ? .85 : 1.9;
          const lc = new THREE.Mesh(new THREE.BoxGeometry(Lx, .06, Lz), branco); lc.position.set(L.x, .66, L.z); intacto.add(lc);
          const tr = new THREE.Mesh(new THREE.BoxGeometry(ao === 'x' ? .35 : .6, .1, ao === 'x' ? .6 : .35), branco); tr.position.set(L.x + (ao === 'x' ? -.72 : 0), .72, L.z + (ao === 'x' ? 0 : -.72)); intacto.add(tr);
          if (i++ % 2 === 0) sprite(silMat.costas, L.x + (ao === 'x' ? .2 : .5), 1.05, L.z + (ao === 'x' ? .5 : .2), .46, .9, criancas);
        }
      });
      const co = R_('corr'); if (co) marcar(co, 'fogo', (r, intacto, criancas) => {
        cobrir(r, queimado, intacto);
        for (let i = 0; i < 4; i++) sprite(silMat.corre, (r.x0 + r.x1) / 2 + rand(-1.6, 1.6), .7, r.z0 + 4 + i * (r.z1 - r.z0 - 8) / 3, .75, 1.4, criancas);
      });
      const ro = R_('roup'); if (ro) marcar(ro, 'fogo', (r, intacto, criancas) => { cobrir(r, queimado, intacto); sprite(silMat.menina, (r.x0 + r.x1) / 2, .72, (r.z0 + r.z1) / 2, .6, 1.3, criancas); });
    } else if (W.mapa === 'cemiterio') {
      const cp = R_('capela'); if (cp) marcar(cp, 'fogo', (r, intacto, criancas) => {
        cobrir(r, queimado, intacto);
        for (const [x, t] of [[-.6, 'bracos'], [0, 'menina'], [.6, 'bracos']]) sprite(silMat[t], x, .72, r.z1 - .5, .6, 1.3, criancas); // batendo na porta trancada
        sprite(silMat.menina, -3, .95, r.z1 - 1.2, .9, 1.9, criancas); // a irmã, perto deles
      });
    }
  }

  // =================================================================== FULIGEM, TEXTURAS QUE ENVELHECEM, RABISCOS, TEIAS
  function fuligem() {
    const cap = C.S ? C.S.chapter : 0;
    const plumas = { terreo: 4, superior: 9, cemiterio: 10 }[W.mapa] || 0;
    const sobe = decal(TX_FUL_SOBE, { color: 0x000000, opacity: .95 });
    const alvo = salasMapa(r => (r.h || 3.2) > 2.5 && (W.mapa !== 'terreo' || ['hall', 'cw', 'ce', 'refeit', 'lavand'].includes(r.id)) && (W.mapa !== 'cemiterio' || r.id === 'capela'));
    for (let i = 0; i < plumas && alvo.length; i++) {
      const r = alvo[i % alvo.length], h = r.h || 3.2, lado = Math.random() * 4 | 0, larg = rand(1, 1.8), c = vaga(r, lado, larg, 0, h, 1.2, 4);
      if (c === null) continue;
      const m = naParede(r, lado, c, h * .45, larg, h * .9, sobe, OFF - .004); m.renderOrder = 1;
    }
    const teto = decal(TX_FUL_TETO, { color: 0x000000, side: THREE.DoubleSide });
    const manchaTeto = (r, x, z, s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), teto); m.rotation.x = PI / 2; m.position.set(x, (r.h || 3.2) - .012, z); W.grupo.add(m); return m; };
    if (W.mapa === 'terreo' && cap >= 2) for (const id of ['hall', 'cw', 'ce', 'refeit', 'aula']) { const r = W.salas.find(s => s.id === id); if (r) for (let k = 0; k < 2; k++) manchaTeto(r, rand(r.x0 + 1, r.x1 - 1), rand(r.z0 + 1, r.z1 - 1), rand(2.2, 4)); }
    if (W.mapa === 'superior') {
      const so = W.salas.find(s => s.id === 'sotao'); if (so) { const m = new THREE.Mesh(new THREE.PlaneGeometry(so.x1 - so.x0 - .2, so.z1 - so.z0 - .2), new THREE.MeshStandardMaterial({ color: 0x050403, roughness: 1, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 })); m.rotation.x = PI / 2; m.position.set((so.x0 + so.x1) / 2, (so.h || 3.2) - .012, (so.z0 + so.z1) / 2); W.grupo.add(m); }
      for (const r of salasMapa(r => r.tipo === 'dorm' || r.id === 'corr')) manchaTeto(r, rand(r.x0 + 1, r.x1 - 1), rand(r.z0 + 1, r.z1 - 1), rand(2, 3.5));
    }
    if (W.mapa === 'cemiterio') { const r = W.salas.find(s => s.id === 'capela'); if (r) for (let k = 0; k < 5; k++) manchaTeto(r, rand(r.x0 + 2, r.x1 - 2), rand(r.z0 + 2, r.z1 - 2), rand(3, 6)); }
  }
  function trocarParedes() { // cada andar com a sua idade
    const regra = W.mapa === 'superior' ? { de: 'reboco', para: TX_PATINHOS, salas: s => s.tipo === 'dorm' || s.tipo === 'brinquedos' }
      : W.mapa === 'tuneis' ? { de: 'tijolo', para: TX_TIJOLO_LIMO, salas: s => s.tipo === 'tunel' }
      : W.mapa === 'cemiterio' ? { de: 'pedra', para: TX_PEDRA_CERA, salas: s => s.id === 'capela' } : null;
    if (!regra) return;
    const salas = salasMapa(regra.salas);
    for (const m of W.solid) {
      const mat = m.material; if (!mat || Array.isArray(mat) || !mat.map || mat.map.name !== regra.de) continue;
      if (!m.geometry || m.geometry.type !== 'BoxGeometry') continue;
      const p = m.position; if (!salas.some(r => p.x >= r.x0 - .01 && p.x <= r.x1 + .01 && p.z >= r.z0 - .01 && p.z <= r.z1 + .01)) continue;
      const nt = regra.para.clone(); nt.needsUpdate = true; nt.repeat.copy(mat.map.repeat); nt.offset.copy(mat.map.offset); nt.userData = { clone: true }; nt.name = regra.de + '+';
      if (mat.map.userData && mat.map.userData.clone) mat.map.dispose();
      mat.map = nt; if (mat.bumpMap) mat.bumpMap = nt; mat.needsUpdate = true;
    }
  }
  function rabiscos() { // giz e lápis a 60–90 cm do chão: só aparecem bem sob a lanterna
    if (W.mapa !== 'terreo' && W.mapa !== 'superior') return;
    const tipos = ['shhh', 'maos', 'alto', 'sino', 'conta', 'shhh', 'alto'];
    const salas = salasMapa(r => r.tipo === 'corredor' || r.tipo === 'dorm' || r.tipo === 'hall' || r.tipo === 'brinquedos');
    let n = 0;
    for (let i = 0; i < 18 && n < tipos.length && salas.length; i++) {
      const r = pick(salas), lado = Math.random() * 4 | 0, c = vaga(r, lado, 1, .45, 1.05, 1.2, 3); if (c === null) continue;
      const t = texRabisco(tipos[n]); t.userData = { clone: true };
      const m = naParede(r, lado, c, .75, 1, .5, decal(t, { color: 0x6a6660, opacity: .85 })); m.rotation.z = rand(-.06, .06); n++;
    }
  }
  function setasDavi() { // setas de giz do Davi: nunca para objetivos, só para segredos
    const mat = new THREE.MeshStandardMaterial({ map: TX_SETA, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, color: 0x8a8678, emissive: 0xd8d0b8, emissiveIntensity: .04, roughness: 1 });
    const seta = (x, z, ang, s = .5) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s / 2), mat); m.rotation.x = -PI / 2; m.rotation.z = ang; m.position.set(x, .014, z); W.grupo.add(m); G.setas.push(m); };
    if (W.mapa === 'terreo') { seta(-21.2, -3.4, PI * .82); seta(-22.6, -4.6, PI); }
    if (W.mapa === 'superior') {
      seta(1.2, -50, PI / 2); seta(.6, -54.4, PI / 2);
      const dm = W.inter.find(i => { try { return /D\.M\./.test(i.label()); } catch (e) { return false; } });
      if (dm) { dm.obj.getWorldPosition(v1); seta(v1.x + 2.4, v1.z + .6, PI); seta(v1.x + 1.5, v1.z + .2, PI); }
    }
    G.setaMat = mat;
  }
  function teias() {
    const mat = new THREE.MeshStandardMaterial({ map: TX_TEIA, transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 1, color: 0xd8d8d0, opacity: .8 });
    const salas = salasMapa(r => r.tipo && r.tipo !== 'tunel' || W.mapa === 'tuneis');
    for (let i = 0; i < 12 && salas.length; i++) {
      const r = pick(salas), h = r.h || 3.2, cx = Math.random() < .5, cz = Math.random() < .5;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(.7, .7), mat);
      const x = cx ? r.x0 + .12 : r.x1 - .12, z = cz ? r.z0 + .12 : r.z1 - .12;
      m.position.set(x + (cx ? .35 : -.35) * .7, h - .3, z + (cz ? .35 : -.35) * .7); m.rotation.y = (cx === cz ? PI / 4 : -PI / 4); m.rotation.x = .5; W.grupo.add(m);
    }
  }
  function brasoes() {
    const mat = new THREE.MeshStandardMaterial({ map: TX_BRASAO, transparent: true, roughness: .6, metalness: .2 });
    const placa = (x, y, z, ry, s = .9) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), mat); m.position.set(x, y, z); m.rotation.y = ry; W.grupo.add(m); return m; };
    if (W.mapa === 'estrada') placa(-4.6, 2.1, -59.8, 0, 1.1);
    if (W.mapa === 'terreo') {
      placa(-4.2, 3.9, .37, 0, 1.1); placa(4.2, 3.9, .37, 0, 1.1);
      const r = W.salas.find(s => s.id === 'hall'); if (r) { const c = vaga(r, 1, 1, 1.6, 2.6); if (c !== null) { const m = naParede(r, 1, c, 2.2, .9, .9, mat); const it = C.interact(m, () => 'O brasão do internato: um sino de boca costurada. "SILENTIUM SALVAT" — o silêncio salva.', () => {}); void it; } }
      // louça do refeitório: pratos sujos com o brasão espalhados nas mesas
      const rf = W.salas.find(s => s.id === 'refeit');
      if (rf) {
        const pm = new THREE.MeshStandardMaterial({ map: TX_PRATO_SUJO, roughness: .5 }), lm = new THREE.MeshStandardMaterial({ color: 0x9a9282, roughness: .5 });
        const cx = (rf.x0 + rf.x1) / 2, w = rf.x1 - rf.x0, d = rf.z1 - rf.z0, n = Math.max(2, Math.floor(d / 4));
        for (let k = 0; k < n; k++) for (let i = 0; i < 4; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.11, .1, .015, 12), [lm, pm, lm]); p.position.set(cx + rand(-w * .3, w * .3), .835, rf.z0 + d * (k + .5) / n + rand(-.4, .4)); p.rotation.set(rand(-.05, .05), rand(0, 6), 0); W.grupo.add(p); }
        // cardápio da semana do incêndio
        const c = vaga(rf, 2, 1, 1.2, 2.2) ?? vaga(rf, 3, 1, 1.2, 2.2);
        if (c !== null) {
          const t = tex(256, 320, (g, ww, hh) => { g.fillStyle = '#c8bb98'; g.fillRect(0, 0, ww, hh); g.drawImage(TX_BRASAO.image, 98, 8, 60, 60); g.fillStyle = '#2a1c10'; g.textAlign = 'center'; g.font = 'bold 18px Georgia'; g.fillText('CARDÁPIO DA SEMANA', 128, 92); g.font = 'italic 14px Georgia'; g.fillText('12 a 16 de março de 1979', 128, 112); g.textAlign = 'left'; g.font = '15px Georgia'; ['SEG — arroz, feijão, ovo', 'TER — sopa de fubá', 'QUA — sopa de legumes', 'QUI — macarrão', 'SEX — peixe'].forEach((l, i) => g.fillText(l, 22, 148 + i * 26)); g.strokeStyle = 'rgba(30,20,10,.9)'; g.lineWidth = 2; g.beginPath(); g.moveTo(18, 196); g.lineTo(230, 194); g.stroke(); g.fillStyle = 'rgba(120,30,20,.85)'; g.font = 'italic 16px Georgia'; g.fillText('a gente não jantou', 70, 220); g.fillStyle = '#2a1c10'; g.font = 'bold 14px Georgia'; g.textAlign = 'center'; g.fillText('HORA DO SILÊNCIO: 21h ATÉ O SINO', 128, 300); stainsPapel(g, ww, hh); }); t.userData = { clone: true };
          const m = naParede(rf, OCUP[OCUP.length - 1].lado, c, 1.6, .55, .69, new THREE.MeshStandardMaterial({ map: t, roughness: 1, emissive: 0x2a2418, emissiveIntensity: .4 }));
          const it = C.interact(m, () => 'Cardápio da semana de 12 a 16 de março de 1979. Quarta-feira está riscada.', () => {}); void it;
        }
      }
    }
  }
  function stainsPapel(g, w, h) { for (let i = 0; i < 5; i++) { const x = rand(0, w), y = rand(0, h), r = rand(14, 50); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(90,60,20,.35)'); gr.addColorStop(1, 'rgba(90,60,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } }
  function desenhosBrinquedos() {
    const r = W.salas.find(s => s.id === 'brinq'); if (!r) return;
    const desenhos = [
      (g, w, h) => { g.strokeStyle = '#2a4a8a'; g.lineWidth = 4; g.strokeRect(40, 90, 90, 70); g.beginPath(); g.moveTo(30, 92); g.lineTo(85, 40); g.lineTo(140, 92); g.stroke(); g.fillStyle = '#c8a030'; g.beginPath(); g.arc(85, 66, 12, PI, 0); g.fill(); g.strokeStyle = '#8a2020'; for (const x of [170, 200]) { g.beginPath(); g.arc(x, 110, 9, 0, 7); g.moveTo(x, 119); g.lineTo(x, 150); g.stroke(); } g.beginPath(); g.moveTo(170, 130); g.lineTo(200, 130); g.stroke(); g.fillStyle = '#2a2a2a'; g.font = '16px Georgia'; g.fillText('EU E A LIA', 150, 180); },
      (g, w, h) => { g.strokeStyle = '#111'; g.lineWidth = 5; g.beginPath(); g.ellipse(128, 40, 12, 16, 0, 0, 7); g.moveTo(128, 56); g.lineTo(128, 150); g.moveTo(128, 70); g.lineTo(70, 160); g.moveTo(128, 70); g.lineTo(186, 160); g.moveTo(128, 150); g.lineTo(110, 190); g.moveTo(128, 150); g.lineTo(146, 190); g.stroke(); g.strokeStyle = '#c02020'; g.lineWidth = 3; g.beginPath(); g.moveTo(114, 36); g.lineTo(142, 36); g.stroke(); g.fillStyle = '#111'; g.font = 'bold 16px Georgia'; g.fillText('O INSPETOR', 76, 214); },
      (g, w, h) => { for (let i = 0; i < 9; i++) { const x = 22 + i * 26; g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(x, 110, 8, 0, 7); g.fill(); g.fillRect(x - 7, 118, 14, 34); g.fillStyle = '#e09020'; g.beginPath(); g.arc(x + 9, 116, 4, 0, 7); g.fill(); } g.fillStyle = '#111'; g.font = '16px Georgia'; g.fillText('a procissão das nove', 50, 190); },
      (g, w, h) => { g.strokeStyle = '#8a2020'; g.lineWidth = 4; g.beginPath(); g.arc(128, 70, 16, 0, 7); g.moveTo(112, 88); g.lineTo(100, 160); g.lineTo(156, 160); g.lineTo(144, 88); g.stroke(); g.fillStyle = '#111'; g.font = 'bold 20px Georgia'; g.fillText('1 2 3 4 5 6 7 8 9 10', 20, 200); g.font = 'italic 14px Georgia'; g.fillText('a Ana conta pra não chorar', 46, 222); }
    ];
    let k = 0;
    for (const lado of [0, 1, 2, 3]) for (let tent = 0; tent < 2 && k < desenhos.length; tent++) {
      const c = vaga(r, lado, .7, 1.1, 1.9, 1.3, 3); if (c === null) continue;
      const t = tex(256, 240, (g, w, h) => { g.fillStyle = '#d4c8a8'; g.fillRect(0, 0, w, h); desenhos[k](g, w, h); stainsPapel(g, w, h); }); t.userData = { clone: true };
      const m = naParede(r, lado, c, 1.5, .6, .56, new THREE.MeshStandardMaterial({ map: t, roughness: 1, side: THREE.DoubleSide })); m.rotation.z = rand(-.12, .12); k++;
    }
  }

  // =================================================================== JANELAS: caixilho, chuva no vidro, luz no chão, cortinas
  const vidroMat = fixo(new THREE.MeshBasicMaterial({ map: TX_VIDRO, color: 0x666666 }));
  const patchMat = fixo(new THREE.MeshBasicMaterial({ map: TX_LUZJANELA, color: 0x9ab0d8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2 }));
  function janelas() {
    if (W.mapa !== 'terreo' && W.mapa !== 'superior') return;
    const tipos = ['refeitorio', 'corredor', 'dorm', 'aula', 'biblioteca', 'enfermaria', 'hall', 'brinquedos', 'quarto', 'deposito'];
    const cortina = W.mapa === 'superior' ? new THREE.MeshStandardMaterial({ map: TX_CORTINA, transparent: true, side: THREE.DoubleSide, roughness: 1 }) : null;
    let n = 0;
    for (const r of salasMapa(s => tipos.includes(s.tipo))) {
      for (const lado of [0, 1, 2, 3]) {
        const lo = lado < 2 ? r.x0 : r.z0, hi = lado < 2 ? r.x1 : r.z1;
        for (let c = lo + 2.2; c <= hi - 2.2 && n < 16; c += 5) {
          if (!externo(r, lado, c) || !semPorta(r, lado, c, 1.8) || !livre(r, lado, c, .8, 1, 2.5)) continue;
          OCUP.push({ r, lado, c, meio: .8, y0: 1, y1: 2.5 });
          const g = new THREE.Group(); W.grupo.add(g);
          naParede(r, lado, c, 1.75, 1, 1.3, vidroMat, OFF - .006, g);
          const moldura = MAT.madeiraEsc;
          const barra = (w, h, dy) => naParede(r, lado, c, 1.75 + dy, w, h, moldura, OFF, g);
          barra(1.12, .07, .67); barra(1.12, .07, -.67); barra(.06, 1.3, 0); barra(1, .05, 0); barra(1.2, .05, -.72);
          for (const s of [-1, 1]) { const b = naParede(r, lado, c, 1.75, .07, 1.36, moldura, OFF, g); desloca(b, lado, s * .53); }
          const pt = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.6), patchMat); pt.rotation.x = -PI / 2;
          const dentro = 1.5;
          if (lado === 0) pt.position.set(c, .013, r.z0 + dentro); else if (lado === 1) { pt.position.set(c, .013, r.z1 - dentro); pt.rotation.z = PI; }
          else if (lado === 2) { pt.position.set(r.x0 + dentro, .013, c); pt.rotation.z = -PI / 2; } else { pt.position.set(r.x1 - dentro, .013, c); pt.rotation.z = PI / 2; }
          W.grupo.add(pt);
          if (cortina) for (const s of [-1, 1]) { const ct = naParede(r, lado, c, 1.6, .42, 1.7, cortina, OFF + .05, g); desloca(ct, lado, s * .66); G.cortinas.push({ m: ct, f: rand(0, 6), r0: ct.rotation.x }); }
          G.janelas.push({ x: pt.position.x, z: pt.position.z, r, lado, c }); n++; // r/lado/c: vidro (lote 4, src/visual-segredos.js)
        }
      }
    }
  }
  function desloca(m, lado, d) { // ao longo da parede, no sentido "direita de quem olha a parede"
    if (lado === 0) m.position.x += d; else if (lado === 1) m.position.x -= d; else if (lado === 2) m.position.z -= d; else m.position.z += d;
  }

  // =================================================================== REFEITÓRIO: feixes de luar pelo forro furado
  function feixesRefeitorio() {
    const r = W.mapa === 'terreo' && W.salas.find(s => s.id === 'refeit'); if (!r) return;
    const h = r.h || 3.2, pts = [[r.x0 + 4, r.z1 - 3], [(r.x0 + r.x1) / 2 + 1.5, (r.z0 + r.z1) / 2 - 2], [r.x1 - 3, r.z1 - 2]];
    const coneMat = new THREE.MeshBasicMaterial({ map: TX_FEIXE, color: 0x8ea6cc, transparent: true, opacity: .1, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const furoMat = new THREE.MeshBasicMaterial({ map: TX_BURACO, color: 0x6a7c98, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    const pocaMat = new THREE.MeshStandardMaterial({ map: TX_POCA, color: 0x080a0e, roughness: .06, metalness: .55, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const cones = [];
    for (const [x, z] of pts) {
      const cn = new THREE.Mesh(new THREE.CylinderGeometry(.32, .95, h, 16, 1, true), coneMat); cn.position.set(x, h / 2, z); W.grupo.add(cn); cones.push(cn);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(.9, .9), furoMat); f.rotation.x = PI / 2; f.position.set(x, h - .008, z); W.grupo.add(f);
      for (let i = 0; i < 3; i++) { const ripa = new THREE.Mesh(new THREE.BoxGeometry(.05, .03, rand(.5, .9)), MAT.madeiraEsc); ripa.position.set(x + rand(-.4, .4), h - .1 - rand(0, .2), z + rand(-.2, .2)); ripa.rotation.set(rand(-.6, .6), rand(0, 3), rand(-.3, .3)); W.grupo.add(ripa); }
      const pc = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.1), pocaMat); pc.rotation.x = -PI / 2; pc.position.set(x + .1, .012, z); W.grupo.add(pc);
    }
    const NPF = 90, geo = new THREE.BufferGeometry(), pos = new Float32Array(NPF * 3), dados = [];
    for (let i = 0; i < NPF; i++) { const k = i % 3, y = rand(.2, h - .2); dados.push({ k, y, a: rand(0, 6.28), r: rand(0, 1), vy: rand(-.03, .03), va: rand(.1, .35) }); }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pm = new THREE.Points(geo, new THREE.PointsMaterial({ map: suave, color: 0xc8d4ec, size: .03, transparent: true, opacity: .6, depthWrite: false, blending: THREE.AdditiveBlending })); pm.frustumCulled = false; W.grupo.add(pm);
    const NG = 9, gg = new THREE.BufferGeometry(), gp = new Float32Array(NG * 6), gd = [];
    for (let i = 0; i < NG; i++) gd.push({ k: i % 3, y: rand(0, h), v: rand(5, 7), dx: rand(-.3, .3), dz: rand(-.3, .3) });
    gg.setAttribute('position', new THREE.BufferAttribute(gp, 3));
    const gl = new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: 0xa8b8d8, transparent: true, opacity: .45, depthWrite: false })); gl.frustumCulled = false; W.grupo.add(gl);
    G.feixes = { pts, h, coneMat, dados, pos, geo, gd, gp, gg };
  }
  function updateFeixes(dt) {
    const F = G.feixes; if (!F) return;
    F.coneMat.opacity = .09 + C.raioI * .3;
    const parado = PROC.fase === 'passando' ? 0 : 1; // a poeira congela quando eles passam
    for (let i = 0; i < F.dados.length; i++) {
      const d = F.dados[i], [x, z] = F.pts[d.k];
      d.a += d.va * dt * parado; d.y += d.vy * dt * parado; if (d.y < .1 || d.y > F.h - .1) d.vy *= -1;
      const raio = (.3 + (1 - d.y / F.h) * .6) * d.r;
      F.pos[i * 3] = x + Math.cos(d.a) * raio; F.pos[i * 3 + 1] = d.y; F.pos[i * 3 + 2] = z + Math.sin(d.a) * raio;
    }
    F.geo.attributes.position.needsUpdate = true;
    for (let i = 0; i < F.gd.length; i++) {
      const d = F.gd[i], [x, z] = F.pts[d.k]; d.y -= d.v * dt; if (d.y < 0) { d.y = F.h; d.dx = rand(-.3, .3); d.dz = rand(-.3, .3); }
      F.gp.set([x + d.dx, d.y, z + d.dz, x + d.dx, d.y + .14, z + d.dz], i * 6);
    }
    F.gg.attributes.position.needsUpdate = true;
  }

  // =================================================================== POÇAS E GOTEIRAS NO TÉRREO · POÇAS NA ESTRADA
  function pocas() {
    const lista = W.mapa === 'terreo' ? [[-28, -12], [-15, -12.4], [14, -11.6], [27, -12.2], [1.5, -7]] : W.mapa === 'estrada' ? Array.from({ length: 7 }, () => [rand(-3.2, 3.2), rand(-50, 70)]) : [];
    if (!lista.length) return;
    const mat = new THREE.MeshStandardMaterial({ map: TX_POCA, color: 0x07090c, roughness: .05, metalness: .6, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const anelMat = new THREE.MeshBasicMaterial({ color: 0x9aa8c0, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    for (const [x, z] of lista) {
      const s = rand(.9, 1.6), m = new THREE.Mesh(new THREE.PlaneGeometry(s, s * .8), mat); m.rotation.x = -PI / 2; m.rotation.z = rand(0, 6); m.position.set(x, .011, z); W.grupo.add(m);
      if (W.mapa !== 'terreo') continue;
      const anel = new THREE.Mesh(new THREE.RingGeometry(.03, .045, 18), anelMat.clone()); anel.rotation.x = -PI / 2; anel.position.set(x, .016, z); W.grupo.add(anel);
      const gota = new THREE.Mesh(new THREE.SphereGeometry(.012, 5, 4), new THREE.MeshBasicMaterial({ color: 0x9aa8c0 })); gota.position.set(x, 3, z); W.grupo.add(gota);
      G.pocas.push({ x, z, anel, gota, y: rand(0, 3), v: 0, t: 0, espera: rand(.5, 2.5) });
    }
  }
  function updatePocas(dt) {
    for (const p of G.pocas) {
      if (p.espera > 0) { p.espera -= dt; p.gota.visible = false; }
      else { p.gota.visible = true; p.v += 9.8 * dt; p.y -= p.v * dt; p.gota.position.y = p.y; if (p.y <= .02) { p.y = 3.1; p.v = 0; p.espera = rand(1.2, 3); p.t = 1; } }
      if (p.t > 0) { p.t -= dt * 1.4; const k = 1 - p.t; p.anel.scale.setScalar(1 + k * 7); p.anel.material.opacity = Math.max(0, p.t) * .6; }
    }
  }

  // =================================================================== CAPELA E CEMITÉRIO
  function capela() {
    if (W.mapa !== 'cemiterio') return;
    const r = W.salas.find(s => s.id === 'capela'); if (!r) return;
    // a sombra de fuligem da Irmã Celeste, abraçando três crianças, ao lado da porta
    const cel = naParede(r, 1, -4, 1.45, 2.3, 2.7, new THREE.MeshStandardMaterial({ map: TX_CELESTE, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, color: 0x111111, roughness: 1 }));
    G.celeste = { m: cel, t: 0 };
    // mãos pequenas queimadas por dentro da porta
    const d = C.DOOR && C.DOOR('cap');
    if (d && d.pivot) { const lw = 2; const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.3), new THREE.MeshStandardMaterial({ map: TX_MAOS, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, roughness: 1 })); m.position.set(lw / 2, .95, -.045); m.rotation.y = PI; d.pivot.add(m); m.userData.it = d.pivot.userData.it; }
    // por fora: janelas com luz de fogo e uma linha laranja por baixo da porta
    const fogoMat = new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const janArco = new THREE.Shape(); janArco.moveTo(-.38, -.9); janArco.lineTo(.38, -.9); janArco.lineTo(.38, .4); janArco.quadraticCurveTo(.38, .9, 0, .95); janArco.quadraticCurveTo(-.38, .9, -.38, .4); janArco.lineTo(-.38, -.9);
    const jg = new THREE.ShapeGeometry(janArco); const fora = [];
    for (const z of [-52, -58, -64]) for (const s of [-1, 1]) { const m = new THREE.Mesh(jg, fogoMat); m.position.set(s * (8.03), 3.4, z); m.rotation.y = s * PI / 2; W.grupo.add(m); fora.push(m); for (const dy of [-.2, .35]) { const b = new THREE.Mesh(new THREE.BoxGeometry(.04, .04, .8), MAT.preto); b.position.set(s * 8.05, 3.4 + dy, z); W.grupo.add(b); } }
    const ros = new THREE.Mesh(new THREE.CircleGeometry(.6, 18), fogoMat); ros.position.set(0, 4.3, -47.97); W.grupo.add(ros); fora.push(ros);
    const fresta = new THREE.Mesh(new THREE.PlaneGeometry(1.9, .07), fogoMat); fresta.position.set(0, .04, -47.96); W.grupo.add(fresta); fora.push(fresta);
    const luz = new THREE.PointLight(0xff6a20, 0, 8, 1.6); luz.position.set(0, 1.3, -46.4); W.grupo.add(luz);
    // grama queimada que leva até a capela
    const qc = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), new THREE.MeshStandardMaterial({ map: TX_QUEIMA_CHAO, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, roughness: 1, color: 0x000000 }));
    qc.rotation.x = -PI / 2; qc.position.set(0, .012, -46); W.grupo.add(qc);
    // brasas que ainda pulsam nas frestas do piso perto do altar
    const NB = 40, bg = new THREE.BufferGeometry(), bp = new Float32Array(NB * 3);
    for (let i = 0; i < NB; i++) bp.set([rand(-3, 3), .02, rand(-68.5, -63)], i * 3);
    bg.setAttribute('position', new THREE.BufferAttribute(bp, 3));
    const brasas = new THREE.Points(bg, new THREE.PointsMaterial({ map: suave, color: 0xff6a20, size: .05, transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending })); W.grupo.add(brasas);
    G.capela = { fogoMat, luz, fora, brasas, pulso: 0, prox: 0 };
    // fogo-fátuo azul sobre os túmulos das três crianças
    const S = C.S; if (S && S.tumPos && R.lapides) R.lapides.forEach((l, i) => {
      if (!l.importante || !S.tumPos[i]) return; const [x, z] = S.tumPos[i];
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: suave, color: 0x7fb0ff, transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending })); sp.scale.set(.32, .32, 1); sp.position.set(x, 1.2, z + 1); W.grupo.add(sp);
      G.fatuos.push({ sp, id: l.id, x, z: z + 1, f: rand(0, 6) });
    });
    // cinza no ar (mais densa perto da capela; na fuga vira neve)
    const NC = 220, cg = new THREE.BufferGeometry(), cp = new Float32Array(NC * 3), cv = [];
    for (let i = 0; i < NC; i++) { cp.set([rand(-12, 12), rand(0, 8), rand(-12, 12)], i * 3); cv.push({ vx: rand(-.2, .2), vy: rand(-.5, -.15), vz: rand(-.2, .2), f: rand(0, 6) }); }
    cg.setAttribute('position', new THREE.BufferAttribute(cp, 3));
    const cm = new THREE.PointsMaterial({ map: suave, color: 0x8a8580, size: .045, transparent: true, opacity: 0, depthWrite: false }); const pts = new THREE.Points(cg, cm); pts.frustumCulled = false; W.grupo.add(pts);
    G.cinza = { cg, cp, cv, cm, pts, NC };
  }
  function updateCapela(dt, t) {
    const K = G.capela; if (!K) return;
    const S = C.S, dentro = P.room && P.room.id === 'capela', dCap = Math.hypot(P.pos.x, P.pos.z + 50);
    const fl = .75 + Math.sin(t * 7.3) * .12 + Math.sin(t * 13.1 + 1) * .08 + (Math.random() < .04 ? -.25 : 0);
    if (S.flags.sino && !G.sinoPrev) { G.sinoPrev = true; G.badT = 0; lembrancaSino(); }
    if (S.flags.sino) { G.badT += dt; if (G.badT >= 7) { G.badT -= 7; K.pulso = 1; } } // a luz pulsa a cada badalada
    K.pulso = Math.max(0, K.pulso - dt * 1.4);
    K.fogoMat.opacity = (.42 + K.pulso * .5) * fl;
    K.luz.intensity = dentro ? 0 : (1.2 + K.pulso * 2.4) * fl;
    K.brasas.material.opacity = .35 + Math.sin(t * 2.1) * .2;
    // cinza: segue a Lia; densidade pela proximidade da capela
    const Z = G.cinza, neve = !!S.flags.sino;
    const dens = dentro ? .9 : clamp(1.05 - (dCap - 6) / 34, .06, 1);
    Z.cm.opacity = lerp(Z.cm.opacity, (neve ? .85 : .6) * (neve ? 1 : dens), Math.min(1, dt * 1.5));
    Z.cm.color.setHex(neve ? 0xd6d2ca : 0x8a8580); Z.cm.size = neve ? .06 : .045;
    const px = P.pos.x, pz = P.pos.z, a = Z.cp, vel = neve ? 1.6 : 1;
    for (let i = 0; i < Z.NC; i++) {
      const o = i * 3, v = Z.cv[i];
      a[o] += (v.vx + Math.sin(t * .7 + v.f) * .12) * dt; a[o + 1] += v.vy * vel * dt; a[o + 2] += v.vz * dt;
      if (a[o + 1] < 0 || Math.abs(a[o] - px) > 12 || Math.abs(a[o + 2] - pz) > 12) { a[o] = px + rand(-12, 12); a[o + 1] = rand(4, 8); a[o + 2] = pz + rand(-12, 12); }
    }
    Z.cg.attributes.position.needsUpdate = true;
    calorAlvo = Math.max(calorAlvo, dentro ? .55 : 0);
    for (const f of G.fatuos) { const on = !S.tumulos[f.id]; f.sp.visible = on; if (on) { f.sp.position.set(f.x + Math.sin(t * .5 + f.f) * .4, 1.1 + Math.sin(t * 1.3 + f.f) * .18, f.z + Math.cos(t * .4 + f.f) * .3); f.sp.material.opacity = .35 + Math.sin(t * 3 + f.f) * .15; } }
    // a sombra da irmã: iluminar 2 s
    const Ce = G.celeste;
    if (Ce && !S.flags.vmCeleste) { Ce.m.getWorldPosition(v2); if (naLanterna(v2, 6.5, .9) > .3) { Ce.t += dt; if (Ce.t > 2) { S.flags.vmCeleste = true; C.sub && C.sub('lia', 'Ela ficou com eles até o fim.'); } } else Ce.t = Math.max(0, Ce.t - dt); }
  }
  function lembrancaSino() { // por 3 s a capela volta a março de 1979: luz laranja, três crianças na corda, batidas na porta
    if (W.mapa !== 'cemiterio') return;
    const grp = new THREE.Group(); W.grupo.add(grp);
    for (const [x, z] of [[4.5, -63.4], [5.1, -64.4], [4.2, -64.7]]) sprite(silMat.bracos, x, .78, z, .6, 1.4, grp);
    G.sino = { grp, t: 0 };
    for (let i = 0; i < 3; i++) setTimeout(() => { if (W.mapa === 'cemiterio' && G.sino) { C.SFX.pancada(0, -48.2); P.shake = Math.max(P.shake, .04); } }, 500 + i * 800);
  }
  function updateSino(dt, t) {
    const L = G.sino; if (!L) return;
    L.t += dt;
    if (L.t < 3) { LM.position.set(2, 3.2, -62); lmAlvo = 0; lmI = 9 * (.8 + Math.sin(t * 17) * .1 + Math.sin(t * 9) * .1); calorAlvo = Math.max(calorAlvo, 1.6); }
    else { lmI = 0; calor = 0; calorAlvo = 0; elCalor.style.opacity = 0; L.grp.visible = false; G.sino = null; } // corte seco para o escuro de agora
  }

  // =================================================================== LUA ENTRE NUVENS, RAIO NO CÉU, CHUVA QUE PARA
  const luaSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_LUA, transparent: true, opacity: 0, depthWrite: false, fog: false })); luaSp.scale.set(9, 9, 1); luaSp.visible = false; scene.add(luaSp);
  const LUA_DIR = new THREE.Vector3(-.35, .42, -.84).normalize();
  const MOON0 = moon.position.clone();
  scene.add(moon.target);
  let nuvem = 1, sombraT = 0, chuvaK = 1;
  function luaMapa() {
    const cem = W.mapa === 'cemiterio';
    moon.castShadow = cem && C.renderer.shadowMap.enabled;
    if (cem) {
      moon.position.set(-22, 38, -12); moon.target.position.set(0, 0, -26);
      const sc = moon.shadow.camera; sc.left = -44; sc.right = 44; sc.top = 52; sc.bottom = -52; sc.near = 1; sc.far = 110; sc.updateProjectionMatrix();
      moon.shadow.mapSize.set(1024, 1024); moon.shadow.bias = -.0008; moon.shadow.autoUpdate = false; moon.shadow.needsUpdate = true;
    } else { moon.position.copy(MOON0); moon.target.position.set(0, 0, 0); }
    moon.target.updateMatrixWorld();
    luaSp.visible = cem; chuvaK = 1;
  }
  // o raio visível no céu (só ao ar livre, nunca com "Reduzir flashes")
  const raioMat = new THREE.LineBasicMaterial({ color: 0xe6eeff, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const raioGeo = new THREE.BufferGeometry(); const raioPos = new Float32Array(3 * 120); raioGeo.setAttribute('position', new THREE.BufferAttribute(raioPos, 3));
  const raioLinha = new THREE.LineSegments(raioGeo, raioMat); raioLinha.frustumCulled = false; raioLinha.visible = false; scene.add(raioLinha);
  function desenhaRaio() {
    const a = rand(0, 6.28), d = rand(55, 85); let x = camera.position.x + Math.cos(a) * d, z = camera.position.z + Math.sin(a) * d, y = 48;
    let n = 0; const seg = (x0, y0, z0, x1, y1, z1) => { if (n >= 40) return; raioPos.set([x0, y0, z0, x1, y1, z1], n * 6); n++; };
    while (y > 0 && n < 30) { const nx = x + rand(-3, 3), ny = y - rand(2.5, 5), nz = z + rand(-3, 3); seg(x, y, z, nx, ny, nz); if (Math.random() < .25) { let bx = nx, by = ny, bz = nz; for (let k = 0; k < 3; k++) { const ex = bx + rand(-4, 4), ey = by - rand(2, 4), ez = bz + rand(-4, 4); seg(bx, by, bz, ex, ey, ez); bx = ex; by = ey; bz = ez; } } x = nx; y = ny; z = nz; }
    for (let i = n; i < 40; i++) raioPos.fill(0, i * 6, i * 6 + 6);
    raioGeo.attributes.position.needsUpdate = true; raioGeo.setDrawRange(0, n * 2); raioLinha.visible = true;
  }

  // =================================================================== PALETA DE LUZ POR CAPÍTULO
  const HEMI0 = { ceu: hemi.color.clone(), chao: hemi.groundColor.clone() };
  const PALETA = {
    0: { ceu: 0x6a88c4, chao: 0x10141c, nev: 0x050a16, k: .5 },   // prólogo: azul-chuva
    1: { ceu: 0x7ea68a, chao: 0x121a12, nev: 0x07120b, k: .55 },  // I: verde fluorescente doente
    3: { ceu: 0x8e7cb8, chao: 0x16121e, nev: 0x0b0716, k: .55 },  // III: lilás de luar
    4: { ceu: 0x62aaa0, chao: 0x0c1614, nev: 0x041311, k: .6 },   // IV: verde-água
    5: { ceu: 0xa0a8b4, chao: 0x16130f, nev: 0x0b0b0e, k: .45 }   // V: cinza-prata
  };
  const pal = { ceu: hemi.color.clone(), chao: hemi.groundColor.clone(), nev: new THREE.Color(0x04060a), k: 0 };
  const cA = new THREE.Color(), cB = new THREE.Color(), cN = new THREE.Color();
  function updatePaleta(dt) {
    const S = C.S, p = S && PALETA[S.chapter];
    if (p) { cA.setHex(p.ceu); cB.setHex(p.chao); } else { cA.copy(HEMI0.ceu); cB.copy(HEMI0.chao); }
    const k = Math.min(1, dt * .9);
    pal.ceu.lerp(cA, k); pal.chao.lerp(cB, k); if (p) pal.nev.lerp(cN.setHex(p.nev), k); pal.k = lerp(pal.k, p ? p.k : 0, k);
    hemi.color.copy(pal.ceu); hemi.groundColor.copy(pal.chao);
    const kk = pal.k * (1 - Math.min(1, C.raioI * 2));
    if (kk > .001 && novo('nev', scene.fog.color.getHex())) { scene.fog.color.lerp(pal.nev, kk); scene.background.lerp(pal.nev, kk * .8); marca('nev', scene.fog.color.getHex()); }
  }

  // =================================================================== LÂMPADAS: gerador que respira, engasgo, energia em onda, faíscas, mariposas
  const MAQ = { x: 29, z: -20 };
  let mods = []; // [L, i, e, h] restaurados depois de desenhar
  function updateLampadas(dt, t, ativo) {
    const S = C.S;
    const en = !!(W.def && W.def.energia && W.def.energia());
    if (G.energiaPrev === null) G.energiaPrev = en;
    if (en && !G.energiaPrev && W.mapa === 'terreo') G.onda = 0; // a luz volta sala por sala, saindo da casa de máquinas
    G.energiaPrev = en;
    if (G.onda >= 0) { G.onda += dt; if (G.onda > 4) G.onda = -1; }
    G.ger = en && W.mapa === 'terreo';
    if (G.ger && ativo) { G.engasgoT -= dt; if (G.engasgoT <= 0) { G.engasgoT = rand(40, 90); G.engasgo = .5; } }
    if (PROC.fase === 'aviso' && !G.procAviso && G.ger) G.engasgo = .6; // nas badaladas ele sempre engasga
    G.procAviso = PROC.fase === 'aviso';
    G.engasgo = Math.max(0, G.engasgo - dt);
    const resp = 1 + .05 * Math.sin(t * PI * 2 / 1.2);
    mods = [];
    for (const L of W.lampadas) {
      if (!L.ligada || !L.luz) continue;
      let f = 1;
      if (G.ger && !OPT.vFlash) f *= resp;
      if (G.engasgo > 0) f *= .5;
      if (G.onda >= 0) { const atraso = Math.hypot(L.x - MAQ.x, L.z - MAQ.z) / 14; f *= G.onda < atraso ? 0 : G.onda < atraso + .08 && !OPT.vFlash ? 1.7 : 1; }
      if (f !== 1) { mods.push([L, L.luz.intensity, L.bulbo.material.emissiveIntensity, L.halo ? L.halo.material.opacity : 0]); L.luz.intensity *= f; L.bulbo.material.emissiveIntensity *= f; if (L.halo) L.halo.material.opacity *= Math.min(1.3, f); }
    }
    // abajur da Irmã Celeste: luz quente e parada; depois da fita dela, apaga sozinho
    const A = G.abajur;
    if (A) {
      const ouviu = S && S.fitas && S.fitas.f2;
      if (ouviu && !A.apagando && A.on) { A.apagando = 1.2; }
      if (A.apagando > 0) { A.apagando -= dt; const pisca = Math.sin(A.apagando * 40) > 0 ? 1 : .1; A.luz.intensity = 2.2 * pisca * (A.apagando / 1.2); A.cup.material.emissiveIntensity = .9 * pisca; if (A.apagando <= 0) { A.on = false; A.luz.intensity = 0; A.cup.material.emissiveIntensity = 0; C.SFX.estalo({ x: A.x, z: A.z }, .3); } }
      else if (A.on) { A.luz.intensity = 2.2; A.cup.material.emissiveIntensity = .9; }
    }
    faiscas(dt, en);
    mariposas(dt, t);
  }
  function depois() { for (const [L, i, e, h] of mods) { L.luz.intensity = i; L.bulbo.material.emissiveIntensity = e; if (L.halo) L.halo.material.opacity = h; } mods = []; }
  // faíscas das lâmpadas estouradas
  const NF = 48, fGeo = new THREE.BufferGeometry(), fPos = new Float32Array(NF * 3).fill(-99), fVel = new Float32Array(NF * 3), fVida = new Float32Array(NF);
  fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
  const fPts = new THREE.Points(fGeo, new THREE.PointsMaterial({ map: suave, color: 0xffc070, size: .045, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); fPts.frustumCulled = false; scene.add(fPts);
  let fI = 0, fT = 2;
  function faiscas(dt, en) {
    fT -= dt;
    if (fT <= 0) {
      fT = rand(2.5, 6);
      const L = en && W.lampadas.filter(L => L.estourada && Math.hypot(L.x - P.pos.x, L.z - P.pos.z) < 14);
      if (L && L.length) { const l = pick(L); for (let k = 0; k < 10; k++) { const i = fI++ % NF; fPos.set([l.bulbo.position.x, l.bulbo.position.y, l.bulbo.position.z], i * 3); fVel.set([rand(-1, 1), rand(-.5, 1), rand(-1, 1)], i * 3); fVida[i] = rand(.3, .8); } l.halo && (l.halo.material.opacity = .6); }
    }
    for (let i = 0; i < NF; i++) if (fVida[i] > 0) { fVida[i] -= dt; fVel[i * 3 + 1] -= 9 * dt; for (let k = 0; k < 3; k++) fPos[i * 3 + k] += fVel[i * 3 + k] * dt; if (fVida[i] <= 0) fPos[i * 3 + 1] = -99; }
    fGeo.attributes.position.needsUpdate = true;
  }
  // mariposas em volta das lâmpadas acesas
  const NM = 14, mGeo = new THREE.BufferGeometry(), mPos = new Float32Array(NM * 3).fill(-99), mDado = Array.from({ length: NM }, () => ({ a: rand(0, 6), r: rand(.12, .4), v: rand(2, 5), f: rand(0, 6) }));
  mGeo.setAttribute('position', new THREE.BufferAttribute(mPos, 3));
  const mPts = new THREE.Points(mGeo, new THREE.PointsMaterial({ color: 0x3a3228, size: .03, transparent: true, opacity: .9, depthWrite: false })); mPts.frustumCulled = false; scene.add(mPts);
  function mariposas(dt, t) {
    const acesas = W.lampadas.filter(L => L.ligada && L.luz && L.luz.intensity > 1 && Math.hypot(L.x - P.pos.x, L.z - P.pos.z) < 12).slice(0, 7);
    for (let i = 0; i < NM; i++) {
      const L = acesas[i >> 1]; if (!L) { mPos[i * 3 + 1] = -99; continue; }
      const d = mDado[i]; d.a += d.v * dt * (1 + Math.sin(t * 3 + d.f) * .6);
      const b = L.bulbo.position; mPos.set([b.x + Math.cos(d.a) * d.r, b.y - .05 + Math.sin(t * 7 + d.f) * .08, b.z + Math.sin(d.a * 1.3) * d.r], i * 3);
    }
    mGeo.attributes.position.needsUpdate = true;
  }
  function luzesAndar() { // andar de cima: luzes frias e falhando; o abajur da Irmã Celeste é a única luz quente
    if (W.mapa !== 'superior') return;
    for (const L of W.lampadas) { if (!L.luz) continue; L.luz.color.setHex(0xb4c4e6); L.bulbo.material.emissive.setHex(0xc8d8ff); if (L.halo) L.halo.material.color.setHex(0xb8c8f0); L.vmFria = true; }
    const r = W.salas.find(s => s.id === 'celeste'); if (!r) return;
    const cz = (r.z0 + r.z1) / 2, x = r.x1 - 1.55, z = cz - .22, y = .8;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, .04, 10), MAT.bronze); base.position.set(x, y + .02, z); W.grupo.add(base);
    const haste = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .34, 6), MAT.bronze); haste.position.set(x, y + .2, z); W.grupo.add(haste);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(.09, .17, .2, 14, 1, true), new THREE.MeshStandardMaterial({ color: 0xc8a878, emissive: 0xffa040, emissiveIntensity: .9, roughness: 1, side: THREE.DoubleSide })); cup.position.set(x, y + .42, z); W.grupo.add(cup);
    const luz = new THREE.PointLight(0xffb860, 0, 8, 1.4); luz.position.set(x, y + .38, z); W.grupo.add(luz);
    const S = C.S, on = !(S && S.fitas && S.fitas.f2);
    G.abajur = { luz, cup, on, apagando: 0, x, z };
    if (!on) { cup.material.emissiveIntensity = 0; }
  }

  // =================================================================== AS ENTIDADES: venda bordada, vestido queimado, objetos da Procissão
  (function vendaBordada() {
    const cab = MON && MON.cabeca; if (!cab) return;
    const venda = cab.children.find(o => o.isMesh && o.geometry && o.geometry.type === 'CylinderGeometry');
    if (!venda || !venda.material || !venda.material.map || !venda.material.map.image) return;
    const src = venda.material.map.image, w = src.width, h = src.height;
    const t = tex(w * 2, h * 2, (g, ww, hh) => {
      g.drawImage(src, 0, 0, ww, hh);
      g.font = `bold ${hh * .3}px Georgia`; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (const x0 of [0, ww]) { g.save(); g.translate(x0, hh * .76); g.strokeStyle = 'rgba(110,8,6,.95)'; g.lineWidth = 1.2; g.setLineDash([2, 1.5]); g.strokeText('SILÊNCIO', 0, 0); g.fillStyle = 'rgba(140,12,8,.75)'; g.fillText('SILÊNCIO', 0, 0); g.restore(); }
    });
    venda.material.map = t; venda.material.needsUpdate = true;
  })();
  (function vestidoAna() { // a barra da camisola preta de fuligem
    if (!ANA_G) return;
    const corpo = ANA_G.children.find(o => o.isMesh && o.geometry && o.geometry.type === 'CylinderGeometry' && o.geometry.parameters.radiusBottom >= .29);
    if (!corpo) return;
    const fu = new THREE.MeshStandardMaterial({ color: 0x0c0907, roughness: 1, emissive: 0x2a0a02, emissiveIntensity: .25 });
    const barra = new THREE.Mesh(new THREE.CylinderGeometry(.285, .305, .16, 12, 1, true), fu); barra.position.set(corpo.position.x, .08, corpo.position.z); ANA_G.add(barra);
    const borda = new THREE.Mesh(new THREE.CylinderGeometry(.275, .29, .08, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 1, transparent: true, opacity: .7 })); borda.position.set(corpo.position.x, .2, corpo.position.z); ANA_G.add(borda);
  })();
  const gude = { m: null, v: new THREE.Vector3(), vida: 0, solta: false };
  (function objetosProcissao() { // pião, fita vermelha no cabelo e uma bolinha de gude
    const f = PROC.filhos; if (!f || f.length < 4) return;
    const piao = new THREE.Group(); const pm = new THREE.MeshStandardMaterial({ color: 0x8a5a2a, roughness: .6, emissive: 0x1a0c04, emissiveIntensity: .5 });
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(.05, .08, 10), pm); c1.rotation.x = PI; piao.add(c1); const c2 = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .02, 10), pm); c2.position.y = .05; piao.add(c2);
    piao.position.set(-.13, .6, .12); f[1].add(piao);
    const fita = new THREE.MeshStandardMaterial({ color: 0x9a1420, emissive: 0x3a0408, emissiveIntensity: .8 });
    for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.09, .03, .02), fita); l.position.set(s * .05, 1.16, -.06); l.rotation.z = s * .5; f[4].add(l); }
    const gm = new THREE.Mesh(new THREE.SphereGeometry(.018, 10, 8), new THREE.MeshStandardMaterial({ color: 0x5aa0c0, roughness: .05, metalness: .2, transparent: true, opacity: .85, emissive: 0x0a2030, emissiveIntensity: .6 }));
    gm.visible = false; scene.add(gm); gude.m = gm;
    const mao = new THREE.Mesh(new THREE.SphereGeometry(.016, 8, 6), gm.material); mao.position.set(-.12, .62, .14); f[7].add(mao); gude.mao = mao;
  })();
  function updateGude(dt) {
    if (!gude.m) return;
    if (PROC.fase === 'passando' && !gude.solta && PROC.pos.distanceTo(P.pos) < 7 && Math.random() < dt * .4) { // cai e rola
      gude.solta = true; gude.mao.getWorldPosition(gude.m.position); gude.v.set(rand(-1, 1), 0, rand(-1, 1)).normalize().multiplyScalar(rand(.8, 1.4)); gude.vy = 0; gude.vida = 14; gude.m.visible = true; gude.mao.visible = false;
      C.SFX.tique && C.SFX.tique();
    }
    if (PROC.fase !== 'passando' && PROC.fase !== 'aviso' && !gude.vida) { gude.solta = false; if (gude.mao) gude.mao.visible = true; }
    if (gude.vida > 0) {
      gude.vida -= dt; const m = gude.m;
      if (m.position.y > .018) { gude.vy -= 9.8 * dt; m.position.y = Math.max(.018, m.position.y + gude.vy * dt); if (m.position.y <= .018 && Math.abs(gude.vy) > 1) { gude.vy *= -.35; m.position.y = .02; C.SFX.tique && C.SFX.tique(); } }
      v1.copy(m.position).addScaledVector(gude.v, dt);
      v2.copy(v1); if (C.collide) C.collide(v2, .03); if (v2.distanceToSquared(v1) > 1e-6) gude.v.multiplyScalar(-.6); else m.position.copy(v1);
      gude.v.multiplyScalar(1 - dt * .5); m.rotation.x += gude.v.z * dt * 30; m.rotation.z -= gude.v.x * dt * 30;
      if (gude.vida <= 0) { m.visible = false; gude.vida = 0; }
    }
  }

  // =================================================================== MODELOS (MK): detalhes de quem usou cada coisa
  const enrolar = (k, fn) => { const o = MK[k]; if (typeof o !== 'function') return; MK[k] = (...a) => { const g = o(...a); try { fn(g); } catch (e) { console.warn(e); } return g; }; };
  const etiqueta = (txt, w = 64, h = 32, fundo = '#c8bb98', cor = '#2a1c10') => tex(w, h, (g) => { g.fillStyle = fundo; g.fillRect(0, 0, w, h); g.fillStyle = cor; g.font = `bold ${h * .55}px Georgia`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 1); });
  const TX_ETQ_DAVI = etiqueta('DAVI M.'), TX_ETQ_INF = etiqueta('INFLAMÁVEL', 96, 32, '#d8c040', '#1a1408'), TX_ETQ_CHAVE = etiqueta('nº', 32, 32);
  const matEtq = (t) => new THREE.MeshStandardMaterial({ map: t, roughness: 1, emissive: 0x2a2418, emissiveIntensity: .5 });
  enrolar('lanterna', g => { const a = new THREE.Mesh(new THREE.TorusGeometry(.05, .006, 5, 14), MAT.preto); a.position.set(-.16, .05, 0); a.rotation.y = PI / 2; g.add(a); });
  enrolar('chave', g => { const e = new THREE.Mesh(new THREE.PlaneGeometry(.05, .05), matEtq(TX_ETQ_CHAVE)); e.rotation.x = -PI / 2; e.rotation.z = .5; e.position.set(-.05, .008, .02); g.add(e); const fio = new THREE.Mesh(new THREE.BoxGeometry(.03, .002, .002), MAT.preto); fio.position.set(-.03, .008, .01); fio.rotation.y = .5; g.add(fio); });
  enrolar('caderno', g => { const el = new THREE.Mesh(new THREE.BoxGeometry(.19, .034, .012), new THREE.MeshStandardMaterial({ color: 0x8a1a14, emissive: 0x200604, emissiveIntensity: .6 })); el.position.set(0, .015, .06); g.add(el); const e = new THREE.Mesh(new THREE.PlaneGeometry(.1, .05), matEtq(TX_ETQ_DAVI)); e.rotation.x = -PI / 2; e.position.set(0, .031, -.04); g.add(e); });
  enrolar('gravador', g => { for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.004, .002, .07), MAT.metal); b.position.set(.08 + i * .012, .101, .03); g.add(b); } const al = new THREE.Mesh(new THREE.TorusGeometry(.08, .008, 5, 14, PI), MAT.preto); al.position.set(0, .1, -.08); g.add(al); });
  enrolar('galao', g => { const e = new THREE.Mesh(new THREE.PlaneGeometry(.18, .06), matEtq(TX_ETQ_INF)); e.position.set(0, .2, .0915); g.add(e); });
  enrolar('boneca', g => { const b = new THREE.Mesh(new THREE.CylinderGeometry(.088, .093, .05, 8, 1, true), new THREE.MeshStandardMaterial({ color: 0x0c0806, roughness: 1, emissive: 0x200602, emissiveIntensity: .3 })); b.position.y = .025; g.add(b); });
  enrolar('carrinho', g => { const fm = new THREE.MeshBasicMaterial({ color: 0xffe0a0 }); for (const z of [-.035, .035]) { const f = new THREE.Mesh(new THREE.SphereGeometry(.011, 6, 5), fm); f.position.set(.131, .07, z); g.add(f); } });
  enrolar('engrenagem', g => { const e = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .05, 8), MAT.ferrugem); e.position.y = .02; g.add(e); });

  // =================================================================== VELAS: poça de cera, fio de fumaça e fumaça ao apagar
  const fumacaMat = fixo(new THREE.SpriteMaterial({ map: suave, color: 0x9a948a, transparent: true, opacity: .0, depthWrite: false }));
  const ceraMat = fixo(new THREE.MeshStandardMaterial({ color: 0xd8ccb0, roughness: .6, emissive: 0x3a2a10, emissiveIntensity: .3 }));
  let VELAS = [];
  function vela(x, y, z, l, chama) {
    try {
      const poca = new THREE.Mesh(new THREE.CylinderGeometry(rand(.05, .08), rand(.07, .1), .008, 10), ceraMat); poca.position.set(x + rand(-.01, .01), y + .004, z); W.grupo.add(poca);
      for (let i = 0; i < 2; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(.008, rand(.04, .1), .006), ceraMat); const a = rand(0, 6.28); p.position.set(x + Math.cos(a) * .03, y + .2 - p.geometry.parameters.height / 2, z + Math.sin(a) * .03); W.grupo.add(p); }
      const fm = [0, 1, 2].map(() => { const s = new THREE.Sprite(fumacaMat.clone()); s.scale.set(.05, .05, 1); s.visible = false; W.grupo.add(s); return s; });
      VELAS.push({ x, y: y + .3, z, l, chama, fm, f: rand(0, 6), apagada: false, puff: 0 });
    } catch (e) { console.warn(e); }
  }
  function updateVelas(dt, t) {
    for (const V of VELAS) {
      if (Math.abs(V.x - P.pos.x) > 10 || Math.abs(V.z - P.pos.z) > 10) { for (const s of V.fm) s.visible = false; continue; }
      const ap = !!(V.l.userData && V.l.userData.apagada);
      if (ap && !V.apagada) V.puff = 3; V.apagada = ap;
      V.puff = Math.max(0, V.puff - dt);
      V.fm.forEach((s, i) => {
        const fase = ((t * .35 + i / 3 + V.f) % 1);
        const forte = V.puff > 0 ? V.puff / 3 : 0, fraco = ap ? 0 : .12;
        s.visible = forte + fraco > .01;
        s.position.set(V.x + Math.sin(t * 1.3 + V.f + i) * .02 * (1 + fase * 3), V.y + .05 + fase * (.35 + forte * .4), V.z + Math.cos(t * 1.1 + i) * .015 * (1 + fase * 3));
        const sc = .04 + fase * (.12 + forte * .2); s.scale.set(sc, sc, 1);
        s.material.opacity = (fraco * .5 + forte * .6) * (1 - fase);
      });
    }
  }

  // =================================================================== SUSTOS DE LUZ: sombra no feixe, memória, 1979 na Procissão, poeira no trovão
  const ray = new THREE.Raycaster(); ray.far = 7;
  const sombra = new THREE.Mesh(new THREE.PlaneGeometry(.55, 1.15), sombraMeninaMat); sombra.visible = false; scene.add(sombra);
  let sombraV = null;
  function sombraNoFeixe(dt) {
    const S = C.S;
    if (sombraV) {
      sombraV.t += dt; const k = sombraV.t / .8;
      sombra.position.copy(sombraV.p0).addScaledVector(sombraV.dir, (k - .5) * 1.3);
      sombraMeninaMat.opacity = Math.sin(Math.min(1, k) * PI) * .75;
      if (k >= 1) { sombra.visible = false; sombraV = null; }
      return;
    }
    if (!S || S.chapter !== 3 || !S.flashOn || S.hidden || flash.intensity < 10) return;
    if (G.sombraN >= 3) return;
    G.sombraT -= dt; if (G.sombraT > 0) return;
    G.sombraT = rand(1.5, 3);
    if ((M.ativo && M.state === 'caca') || ANA.ativa || PROC.fase || Math.random() > .12) return;
    ray.setFromCamera({ x: 0, y: 0 }, camera);
    const h = ray.intersectObjects(W.solid, false)[0];
    if (!h || h.distance < 2.2 || !h.face) return;
    const n = h.face.normal.clone().transformDirection(h.object.matrixWorld); if (Math.abs(n.y) > .3) return;
    const gp = h.object.geometry.parameters; if (!gp || Math.max(gp.width || 0, gp.depth || 0) < 1.5 || (gp.height || 0) < 2) return;
    sombra.position.copy(h.point).addScaledVector(n, .03); sombra.position.y = clamp(h.point.y, .62, 1.3);
    sombra.lookAt(v1.copy(sombra.position).add(n));
    const dir = new THREE.Vector3(-n.z, 0, n.x); if (Math.random() < .5) dir.negate();
    sombraV = { t: 0, p0: sombra.position.clone(), dir }; sombra.visible = true;
    G.sombraN++; G.sombraT = rand(70, 110);
    S.fear = Math.min(100, S.fear + 10);
  }
  let memPrev = null;
  const memEstado = S => S ? { eng: S.inv.engrenagens || 0, tum: Object.keys(S.tumulos || {}).length, pl: S.placed || 0, caix: !!(S.done && S.done.caixinha), dm: !!(S.flags && S.flags.seg_dm) } : null;
  function memoria(dur = .5) { memT = dur; memDur = dur; LM.position.set(P.pos.x, 2.6, P.pos.z); lmI = Math.max(lmI, 5); }
  function updateMemoria(dt, ativo) {
    const S = C.S, m = memEstado(S);
    if (ativo && memPrev && m && (m.eng > memPrev.eng || m.tum > memPrev.tum || m.pl > memPrev.pl || (m.caix && !memPrev.caix) || (m.dm && !memPrev.dm))) memoria(m.dm && !memPrev.dm ? 1.2 : .5);
    memPrev = m;
    if (memT > 0) { memT -= dt; elMem.style.opacity = clamp(memT / memDur * 1.6, 0, .9); if (memT <= 0) elMem.style.opacity = 0; }
  }
  function updateProc1979(dt) { // escondida, durante a Procissão, a sala vira 1979 por alguns segundos
    const S = C.S, perto = PROC.fase === 'passando' && S.hidden && PROC.pos.distanceTo(P.pos) < 7;
    if (PROC.fase !== 'passando') { G.procT = 0; if (G.procMem) { G.procMem = false; for (const k in G.flashback) { const f = G.flashback[k]; if (f && f.grp && !f.t) f.grp.visible = false; } } return; }
    if (perto && G.procT < 3.5) {
      G.procT += dt; G.procMem = true;
      const r = P.room; LM.position.set((r.x0 + r.x1) / 2, 2.6, (r.z0 + r.z1) / 2); lmI = Math.max(lmI, 3.5);
      mult(scene.fog, 'density', .55, 'nevoaProc');
      const f = G.flashback[r.id]; if (f && f.tipo === '1979') { f.grp.visible = true; f.criancas.visible = false; }
    } else if (G.procMem) { G.procMem = false; const f = P.room && G.flashback[P.room.id]; if (f && !f.t) { f.grp.visible = false; f.criancas.visible = true; } }
  }
  const NQ = 60, qGeo = new THREE.BufferGeometry(), qPos = new Float32Array(NQ * 3).fill(-99), qVel = new Float32Array(NQ);
  qGeo.setAttribute('position', new THREE.BufferAttribute(qPos, 3));
  const qPts = new THREE.Points(qGeo, new THREE.PointsMaterial({ map: suave, color: 0x8a8070, size: .035, transparent: true, opacity: .8, depthWrite: false })); qPts.frustumCulled = false; scene.add(qPts);
  let qVida = 0;
  function poeiraDoForro() { // no trovão, cai poeira do forro em cima da Lia
    if (!P.room || P.room.fora || W.mapa === 'tuneis') return;
    const h = (P.room.h || 3.2) - .05; qVida = 3;
    for (let i = 0; i < NQ; i++) { qPos.set([P.pos.x + rand(-2.2, 2.2), h - rand(0, .4), P.pos.z + rand(-2.2, 2.2)], i * 3); qVel[i] = rand(.4, 1.2); }
  }
  function updatePoeiraQueda(dt) {
    if (qVida <= 0) return; qVida -= dt;
    for (let i = 0; i < NQ; i++) { qPos[i * 3 + 1] -= qVel[i] * dt; qPos[i * 3] += Math.sin(qVida * 3 + i) * .05 * dt; if (qPos[i * 3 + 1] < 0 || qVida <= 0) qPos[i * 3 + 1] = -99; }
    qPts.material.opacity = clamp(qVida, 0, .8); qGeo.attributes.position.needsUpdate = true;
  }
  // túneis, cap. IV: gotas pretas de fuligem pingando do teto
  const NGP = 26, gpGeo = new THREE.BufferGeometry(), gpPos = new Float32Array(NGP * 6).fill(-99), gpVel = new Float32Array(NGP);
  gpGeo.setAttribute('position', new THREE.BufferAttribute(gpPos, 3));
  const gpLin = new THREE.LineSegments(gpGeo, new THREE.LineBasicMaterial({ color: 0x050403, transparent: true, opacity: .9 })); gpLin.frustumCulled = false; gpLin.visible = false; scene.add(gpLin);
  function updateGotasPretas(dt) {
    const on = W.mapa === 'tuneis'; gpLin.visible = on; if (!on) return;
    const h = (P.room && P.room.h) || 2.8;
    for (let i = 0; i < NGP; i++) {
      let y = gpPos[i * 6 + 1];
      if (y < -1) { if (Math.random() < dt * .8) { const x = P.pos.x + rand(-4, 4), z = P.pos.z + rand(-4, 4); gpPos.set([x, h, z, x, h + .06, z], i * 6); gpVel[i] = 0; } continue; }
      gpVel[i] += 9.8 * dt; y -= gpVel[i] * dt; gpPos[i * 6 + 1] = y; gpPos[i * 6 + 4] = y + .06;
      if (y < .42) gpPos[i * 6 + 1] = gpPos[i * 6 + 4] = -99;
    }
    gpGeo.attributes.position.needsUpdate = true;
  }

  // =================================================================== RELÂMPAGO: o que só aparece no clarão
  let raioPrev = 99, gizK = 0, picoRaio = 0;
  function aoRaio() {
    picoRaio = 0;
    if (P.room && P.room.fora && !OPT.vFlash) desenhaRaio();
    poeiraDoForro();
    // espelho: uma criança atrás de você
    for (const e of G.espelhos) if (!e.usado && Math.abs(P.pos.x - e.x) < 1 && P.pos.z < e.z && e.z - P.pos.z < 2.6) { e.usado = true; e.t = .35; C.SFX.sussurros(1); if (C.S) C.S.fear = Math.min(100, C.S.fear + 12); break; }
    // lembranças de 1979, uma vez por sala
    const r = P.room, f = r && G.flashback[r.id], S = C.S;
    const chave = r && `vm79_${W.mapa}_${r.id}`;
    if (f && S && !S.flags[chave]) {
      S.flags[chave] = true; f.t = OPT.vFlash ? .3 : .16; f.grp.visible = true; f.criancas.visible = true;
      LM.position.set((r.x0 + r.x1) / 2, (r.h || 3.2) - .6, (r.z0 + r.z1) / 2); lmI = f.tipo === 'fogo' ? 8 : 6; LM.color.setHex(f.tipo === 'fogo' ? 0xff7a30 : 0xffc070);
      S.fear = Math.min(100, S.fear + 6); setTimeout(() => C.SFX.sussurros(1.2), 120);
    }
  }
  function updateRaio(dt, t) {
    const S = C.S, rc = C.raioClock;
    if (rc < raioPrev - .01 && W.mapa !== 'tuneis') aoRaio();
    raioPrev = rc;
    const ri = W.mapa === 'tuneis' ? 0 : C.raioI;
    picoRaio = Math.max(picoRaio, ri);
    const alvo = clamp(ri * 1.6, 0, 1);
    gizK = alvo > gizK ? lerp(gizK, alvo, Math.min(1, dt * (OPT.vFlash ? 2.5 : 30))) : Math.max(alvo, gizK - dt * (OPT.vFlash ? .45 : 1.6));
    for (const m of G.giz) m.material.opacity = gizK;
    if (G.retrato) G.retrato.vm.opacity = gizK;
    for (const v of G.vitrais) {
      v.mat.color.setScalar(.22 + ri * 1.6); v.chao.material.opacity = .035 + gizK * .7;
      if (v.troca && !v.trocado && ri > .6 && P.room && P.room.id === 'capela') { v.trocado = true; v.t = .09; v.mat.map = VITRAL[1]; v.mat.needsUpdate = true; } // por um quadro, o rosto riscado é o dele
      if (v.t > 0) { v.t -= dt; if (v.t <= 0) { v.mat.map = VITRAL[0]; v.mat.needsUpdate = true; } }
    }
    for (const e of G.espelhos) if (e.t > 0) { e.t -= dt; e.m.material.opacity = e.t > 0 ? .85 : 0; }
    raioMat.opacity = raioLinha.visible ? clamp(ri * 1.4, 0, 1) : 0; if (raioLinha.visible && ri < .02 && C.raioClock > .5) raioLinha.visible = false;
    for (const k in G.flashback) { const f = G.flashback[k]; if (!f || !f.t) continue; f.t -= dt; if (f.t <= 0) { f.t = 0; f.grp.visible = false; lmI = 0; LM.color.setHex(0xffb060); } }
    patchMat.opacity = G.janelas.length ? .045 + gizK * .75 : 0;
    vidroMat.color.setScalar(.38 + ri * 1.4);
    // pede um relâmpago quando a Lia fica numa sala marcada que ainda não mostrou 1979
    const r = P.room;
    if (r && G.flashback[r.id] && S && !S.flags[`vm79_${W.mapa}_${r.id}`] && !G.pedido[r.id]) {
      if (G.salaId !== r.id) { G.salaId = r.id; G.salaT = 0; }
      G.salaT += dt; if (G.salaT > 3.5 && C.raioClock > 6 && !PROC.fase) { G.pedido[r.id] = true; C.raio && C.raio(); }
    }
    void t;
  }

  // =================================================================== LOOP
  const ULT = {};
  const novo = (k, v) => ULT[k] !== v;
  const marca = (k, v) => { ULT[k] = v; };
  function mult(obj, key, f, k) { if (!novo(k, obj[key])) return; obj[key] *= f; marca(k, obj[key]); }
  let vidroT = 0;
  function update(dt, ativo) {
    const S = C.S; if (!S || !G) return;
    const t = C.perf;
    camera.getWorldDirection(fw);
    calorAlvo = 0;
    updatePaleta(dt);
    updateRaio(dt, t);
    updateLampadas(dt, t, ativo);
    if (G.janelas.length && P.room && !P.room.fora) { vidroT -= dt; if (vidroT <= 0) { vidroT = .1; desenhaVidro(.1); } }
    for (const c of G.cortinas) c.m.rotation.x = c.r0 + Math.sin(t * .8 + c.f) * .04;
    updateFeixes(dt); updatePocas(dt); updateVelas(dt, t); updatePoeiraQueda(dt); updateGotasPretas(dt);
    if (G.setas.length) { let mx = 0; for (const s of G.setas) mx = Math.max(mx, naLanterna(s.position, 6, .9)); G.setaMat.emissiveIntensity = .04 + mx * .35; }
    if (W.mapa === 'cemiterio') {
      // lua entre nuvens: o cemitério aparece por alguns segundos e some
      const n = .5 + Math.sin(t * PI * 2 / 31) * .3 + Math.sin(t * PI * 2 / 19 + 1.3) * .25;
      nuvem = lerp(nuvem, S.flags.sino ? 1 : clamp((n - .32) / .45, 0, 1), Math.min(1, dt * .8));
      if (P.room && P.room.fora) { mult(moon, 'intensity', .35 + .9 * nuvem, 'lua'); mult(hemi, 'intensity', .8 + .35 * nuvem, 'hemi'); }
      luaSp.position.copy(camera.position).addScaledVector(LUA_DIR, 90); luaSp.material.opacity = (S.flags.sino ? 1 : nuvem) * .95;
      sombraT -= dt; if (moon.castShadow && sombraT <= 0) { sombraT = .5; moon.shadow.needsUpdate = true; }
      // depois do sino a chuva para e a neblina abre perto do portão dos fundos
      chuvaK = S.flags.sino ? Math.max(.08, chuvaK - dt / 10) : 1;
      if (S.flags.sino) mult(scene.fog, 'density', lerp(1, .45, clamp((P.pos.z + 4) / 14, 0, 1)), 'nevoaSino');
      updateCapela(dt, t); updateSino(dt, t);
    } else chuvaK = 1;
    if (C.chuvaMat) mult(C.chuvaMat, 'opacity', chuvaK, 'chuva');
    if (C.respingos) C.respingos.material.opacity = .45 * chuvaK;
    if (ativo) { sombraNoFeixe(dt); updateGude(dt); }
    updateMemoria(dt, ativo);
    if (ativo) updateProc1979(dt);
    // luz do lampião de 1979 e calor
    lmI = lmAlvo > lmI ? lmAlvo : lmI * Math.exp(-dt * (G.sino ? 0 : 4)); LM.intensity = lmI;
    calor = lerp(calor, calorAlvo, Math.min(1, dt * (calorAlvo > calor ? 3 : 1.5))); elCalor.style.opacity = calor.toFixed(3);
  }
  function mapa() {
    G = nG(); OCUP = []; VELAS = VELAS.filter(V => V.l.parent && V.l.parent === W.grupo);
    lmI = 0; LM.intensity = 0; LM.color.setHex(0xffb060); memT = 0; elMem.style.opacity = 0; calor = 0; elCalor.style.opacity = 0;
    raioLinha.visible = false; sombra.visible = false; sombraV = null; qVida = 0; qPos.fill(-99); gpPos.fill(-99); fPos.fill(-99); fVida.fill(0);
    if (gude.m) { gude.m.visible = false; gude.vida = 0; gude.solta = false; if (gude.mao) gude.mao.visible = true; }
    memPrev = memEstado(C.S); G.sinoPrev = !!(C.S && C.S.flags && C.S.flags.sino);
    const passos = [luaMapa, trocarParedes, janelas, retrato1979, gizes, nomesCapela, vitrais, espelhos, flashbacks, fuligem, rabiscos, setasDavi, teias, brasoes, desenhosBrinquedos, feixesRefeitorio, pocas, capela, luzesAndar];
    for (const f of passos) { try { f(); } catch (e) { console.warn('visual-mundo', f.name, e); } }
  }
  function capitulo(c) { // o internato fica "mais perto de 1979" a cada capítulo
    if (!G) return;
    if (W.mapa === 'terreo' && c === 2) { try { fuligemTeto(); } catch (e) { console.warn(e); } }
  }
  function fuligemTeto() { // cap. II: manchas de fuligem aparecem nos tetos do térreo
    const teto = decal(TX_FUL_TETO, { color: 0x000000, side: THREE.DoubleSide });
    for (const id of ['hall', 'cw', 'ce', 'refeit', 'aula']) { const r = W.salas.find(s => s.id === id); if (!r) continue; for (let k = 0; k < 2; k++) { const s = rand(2.2, 4), m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), teto); m.rotation.x = PI / 2; m.position.set(rand(r.x0 + 1, r.x1 - 1), (r.h || 3.2) - .012, rand(r.z0 + 1, r.z1 - 1)); W.grupo.add(m); } }
  }
  const api = { update, depois, mapa, capitulo, vela, memoria, forcarRaio: () => C.raio && C.raio(), get janelas() { return G ? G.janelas : []; } };
  window.__visualMundo = api;
  return api;
}
