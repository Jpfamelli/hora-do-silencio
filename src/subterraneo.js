// Efeitos dos mapas de baixo da terra (túneis alagados e cemitério).
// Tudo procedural: geometria simples, texturas em canvas e som com WebAudio do motor (A.audio).

// ---------- sons
export function sons(A) {
  const au = A.audio;
  const ok = () => au && au.AC && au.AC.state !== 'closed';
  const p3 = (p, y = .4) => p ? { x: p.x, y: p.y ?? y, z: p.z } : null;
  return {
    // nota limpa de cano (válvula certa)
    nota(f, pos, vol = .5) {
      if (!ok()) return; const AC = au.AC, t = AC.currentTime;
      for (const [m, a] of [[1, 1], [2, .35], [3.01, .15]]) { const g = au.saida(p3(pos, 1.3), .8); au.osc('sine', f * m, t, 3.2, g); au.env(g, t, .01, vol * a, 2.8 / m); }
      const g = au.saida(p3(pos, 1.3), .6); au.osc('triangle', f / 2, t, 1.6, g); au.env(g, t, .02, vol * .4, 1.4);
    },
    // batida dissonante (erro)
    dissonante(pos) {
      if (!ok()) return; const AC = au.AC, t = AC.currentTime;
      for (const f of [92, 97.5, 138, 146]) { const g = au.saida(p3(pos, 2), .9); au.osc('sawtooth', f, t, 1.4, g); au.env(g, t, .004, .22, 1.2); }
      const g = au.saida(p3(pos, 2), .8); au.burst(t, .5, 'lowpass', 500, 1, g, 0); au.env(g, t, .002, .9, .45);
    },
    // rangido longo da válvula, mais alto com o progresso k (0..1)
    rangido(pos, k) {
      if (!ok()) return; const AC = au.AC, t = AC.currentTime, g = au.saida(p3(pos, 1.3), .5);
      const f = au.burst(t, .45, 'bandpass', 900 + k * 900, 9, g); f.frequency.linearRampToValueAtTime(600 + k * 1300, t + .4);
      au.env(g, t, .04, .08 + k * .5, .35);
    },
    // bolhas estourando
    bolhas(pos, n = 4, vol = .25) {
      if (!ok()) return; const AC = au.AC, t0 = AC.currentTime;
      for (let i = 0; i < n; i++) { const t = t0 + i * (.06 + Math.random() * .12), g = au.saida(p3(pos, .4), .4); const o = AC.createOscillator(); o.type = 'sine'; const f = 300 + Math.random() * 500; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 2.2, t + .05); o.connect(g); au.env(g, t, .003, vol, .06); o.start(t); o.stop(t + .1); }
    },
    // respiração arrastada debaixo da água
    respiraAgua(pos, vol = .35) {
      if (!ok()) return; const AC = au.AC, t = AC.currentTime;
      for (const [k, d] of [[0, 1.1], [1.5, 1.4]]) { const g = au.saida(p3(pos, .3), .7); const f = au.burst(t + k, d, 'lowpass', 380, 3, g); f.frequency.linearRampToValueAtTime(180, t + k + d); au.env(g, t + k, .4, vol, d * .7); }
      this.bolhas(pos, 6, vol * .6);
    },
    // água escorrendo de alguém que levanta
    escorrer(pos) {
      if (!ok()) return; const AC = au.AC, t = AC.currentTime;
      const g = au.saida(p3(pos, 1), .6); const f = au.burst(t, 2.2, 'bandpass', 1400, 1.2, g); f.frequency.linearRampToValueAtTime(500, t + 2); au.env(g, t, .05, .7, 2);
      const g2 = au.saida(p3(pos, .2), .5); const o = AC.createOscillator(); o.frequency.setValueAtTime(48, t); o.frequency.exponentialRampToValueAtTime(30, t + 1.6); o.connect(g2); au.env(g2, t, .1, .8, 1.5); o.start(t); o.stop(t + 1.8);
      this.bolhas(pos, 10, .35);
    },
    // jato de água do cano estourado
    jato(pos, dur = 2) {
      if (!ok()) return; const AC = au.AC, t = AC.currentTime, g = au.saida(p3(pos, 2), .5);
      au.burst(t, dur, 'highpass', 1800, .7, g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.35, t + .08); g.gain.setValueAtTime(.35, t + dur * .7); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    },
    // ofego ao subir sem ar
    ofegoAgua() {
      if (!ok()) return; const AC = au.AC, t = AC.currentTime, g = au.saida(null, .2);
      au.burst(t, .7, 'bandpass', 1100, 1, g); au.env(g, t, .05, .45, .6); this.bolhas(null, 5, .3);
    },
    // terra cedendo
    terra(pos) {
      if (!ok()) return; const AC = au.AC, t = AC.currentTime, g = au.saida(p3(pos, .2), .4);
      au.burst(t, 1.4, 'lowpass', 260, 1, g, 0); au.env(g, t, .08, .9, 1.2);
    }
  };
}

// ---------- anéis de onda na superfície da água
export function ondas(A, n = 16) {
  const { THREE } = A;
  const geo = new THREE.RingGeometry(.86, 1, 36);
  const pool = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xa8c4b4, transparent: true, opacity: 0, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.visible = false; m.renderOrder = 2; A.W.grupo.add(m);
    pool.push({ m, t: 1, dur: 1, r: 1, a: 0 });
  }
  let k = 0;
  return {
    criar(x, y, z, raio = 1.2, forca = .35, dur = 1.6, cor) {
      const o = pool[k++ % n]; o.t = 0; o.dur = dur; o.r = raio; o.a = forca;
      o.m.position.set(x, y + .012, z); o.m.visible = true; o.m.material.color.setHex(cor || 0xa8c4b4);
    },
    update(dt, y) {
      for (const o of pool) {
        if (!o.m.visible) continue;
        o.t += dt / o.dur;
        if (o.t >= 1) { o.m.visible = false; continue; }
        const s = .08 + o.r * o.t; o.m.scale.set(s, s, 1); o.m.position.y = y + .012;
        o.m.material.opacity = o.a * (1 - o.t) * Math.min(1, o.t * 6);
      }
    },
    limpar() { for (const o of pool) o.m.visible = false; }
  };
}

// ---------- bolhas que estouram na superfície
export function bolhas(A, n = 40) {
  const { THREE } = A;
  const geo = new THREE.SphereGeometry(1, 6, 4);
  const mat = new THREE.MeshBasicMaterial({ color: 0xd8e8dc, transparent: true, opacity: .55, depthWrite: false });
  const pool = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(geo, mat); m.visible = false; A.W.grupo.add(m); pool.push({ m, t: 1, dur: .5, r: .04 }); }
  let k = 0;
  return {
    emitir(x, y, z, qtd = 3, espalha = .35, r = .045) {
      for (let i = 0; i < qtd; i++) {
        const b = pool[k++ % n]; b.t = -Math.random() * .6; b.dur = .35 + Math.random() * .35; b.r = r * (.6 + Math.random() * .8);
        b.m.position.set(x + (Math.random() - .5) * 2 * espalha, y, z + (Math.random() - .5) * 2 * espalha); b.m.visible = true; b.m.scale.setScalar(.001);
      }
    },
    update(dt, y) {
      for (const b of pool) {
        if (!b.m.visible) continue;
        b.t += dt / b.dur;
        if (b.t >= 1) { b.m.visible = false; continue; }
        const s = b.t < 0 ? .001 : b.r * Math.sin(Math.min(1, b.t) * Math.PI * .5 + .2);
        b.m.scale.set(s, s * .7, s); b.m.position.y = y + s * .3;
      }
    }
  };
}

// ---------- luz de emergência em gaiola
export function luzEmergencia(A, x, y, z, ry = 0) {
  const { THREE, box, MAT } = A;
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; A.W.grupo.add(g);
  box(.26, .04, .12, MAT.ferrugem, 0, .14, -.04, g, false);
  for (const dx of [-.1, 0, .1]) box(.012, .26, .012, MAT.ferrugem, dx, 0, .04, g, false);
  box(.24, .012, .14, MAT.ferrugem, 0, -.13, 0, g, false);
  const bulbo = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), new THREE.MeshStandardMaterial({ color: 0x400806, emissive: 0xff2010, emissiveIntensity: 0 }));
  bulbo.position.set(0, 0, 0); g.add(bulbo);
  const luz = new THREE.PointLight(0xff2a14, 0, 8, 1.6); luz.position.set(0, 0, .25); g.add(luz);
  const L = { g, luz, bulbo, fase: Math.random() * 6, on: false, rapido: false, base: 2.6 };
  L.update = (t) => {
    if (!L.on) { luz.intensity = 0; bulbo.material.emissiveIntensity = 0; return; }
    const v = L.rapido ? (Math.sin(t * 9 + L.fase) > .1 ? 1.25 : .05) : .55 + .45 * Math.sin(t * 1.25 + L.fase);
    luz.intensity = L.base * v; bulbo.material.emissiveIntensity = .3 + 2.2 * v;
  };
  return L;
}

// ---------- mão pálida que sai da água ou da terra
export function maoPalida(A) {
  const { THREE, cyl } = A;
  const pele = new THREE.MeshStandardMaterial({ color: 0xb9b2a4, roughness: .7, emissive: 0x1a1814, emissiveIntensity: .6 });
  const g = new THREE.Group(); A.W.grupo.add(g);
  cyl(.045, .06, .7, pele, 0, -.3, 0, 7, g);
  const palma = new THREE.Mesh(new THREE.BoxGeometry(.1, .12, .04), pele); palma.position.y = .1; g.add(palma);
  for (let i = 0; i < 4; i++) { const d = cyl(.011, .009, .19, pele, (i - 1.5) * .026, .25, 0, 4, g); d.rotation.z = (i - 1.5) * .12; d.rotation.x = .35; }
  const pol = cyl(.012, .01, .12, pele, -.065, .12, .01, 4, g); pol.rotation.z = .9;
  g.visible = false;
  const H = { g, t: 0, dur: 1.2, base: 0, ativa: false };
  H.mostrar = (x, y, z, dur = 1.2, yaw = Math.random() * 6) => { H.ativa = true; H.t = 0; H.dur = dur; H.base = y; g.position.set(x, y - .6, z); g.rotation.set(0, yaw, (Math.random() - .5) * .4); g.visible = true; };
  H.update = (dt) => {
    if (!H.ativa) return;
    H.t += dt;
    const k = H.t / H.dur, sobe = k < .3 ? k / .3 : k > .7 ? Math.max(0, (1 - k) / .3) : 1;
    g.position.y = H.base - .62 + sobe * .78;
    g.rotation.x = Math.sin(H.t * 7) * .12 * sobe;
    if (k >= 1) { H.ativa = false; g.visible = false; }
  };
  return H;
}

// ---------- camada de tela (efeitos de tela própria dos mapas subterrâneos)
const telas = {};
export function tela(id, css) {
  if (telas[id] && document.body.contains(telas[id])) return telas[id];
  const d = document.createElement('div'); d.className = 'fx'; d.id = id; d.style.cssText = css + ';opacity:0;pointer-events:none;transition:opacity .35s';
  const ref = document.getElementById('fx-vignette'); if (ref && ref.parentNode) ref.parentNode.insertBefore(d, ref); else document.body.appendChild(d);
  telas[id] = d; return d;
}
// apaga as camadas quando o jogador não está mais no mapa dono (vigia único)
let vigia = false;
export function vigiarTelas(A) {
  if (vigia) return; vigia = true;
  const loop = () => {
    requestAnimationFrame(loop);
    for (const [id, d] of Object.entries(telas)) if (d.dono && (A.W.mapa !== d.dono || A.mode !== 'jogo' || (A.S && A.S.dead))) d.style.opacity = 0;
  };
  requestAnimationFrame(loop);
}

// ---------- vela controlável (para apagar sozinha)
export function velaViva(A, x, y, z, alcance = 5) {
  const { THREE, cyl, MAT } = A;
  cyl(.035, .035, .22, MAT.vela, x, y + .11, z, 8);
  const chama = new THREE.Mesh(new THREE.SphereGeometry(.025, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffb050 }));
  chama.scale.set(1, 1.8, 1); chama.position.set(x, y + .26, z); A.W.grupo.add(chama);
  const luz = new THREE.PointLight(0xff9a40, 1.3, alcance, 1.6); luz.position.set(x, y + .45, z); A.W.grupo.add(luz);
  const V = { luz, chama, acesa: true, forca: 1 };
  A.W.tick.push(() => {
    const f = V.acesa ? V.forca * (1.05 + Math.random() * .45) : 0;
    luz.intensity = f; chama.visible = V.acesa; chama.scale.y = 1.5 + Math.random() * .6;
  });
  return V;
}

// ---------- fotos da sala do diretor (canvas)
export function fotoTex(A, i, estado) {
  const c = document.createElement('canvas'); c.width = 128; c.height = 96;
  const g = c.getContext('2d');
  g.fillStyle = '#6e5e46'; g.fillRect(0, 0, 128, 96);
  for (let k = 0; k < 400; k++) { g.fillStyle = `rgba(${30 + Math.random() * 40},${25 + Math.random() * 30},15,${Math.random() * .25})`; g.fillRect(Math.random() * 128, Math.random() * 96, 2, 2); }
  g.fillStyle = '#4a3e2c'; g.fillRect(0, 62, 128, 34);
  const n = 4 + (i % 2), meio = estado >= 1 ? Math.floor(n / 2) : -1;
  for (let k = 0; k < n; k++) {
    const x = 14 + k * (100 / (n - 1)), alta = k === meio, h = alta ? 50 : 34 + (k * 7 + i * 3) % 9;
    g.fillStyle = alta ? '#1a1612' : '#2e271c';
    g.fillRect(x - 6, 92 - h, 12, h - 10);
    g.beginPath(); g.arc(x, 92 - h - 2, alta ? 7 : 6, 0, 6.3); g.fill();
    if (alta) { g.fillRect(x - 8, 92 - h - 4, 16, 14); }
    // olhos: no normal, de lado; depois, encarando a câmera
    g.fillStyle = estado >= 1 ? '#e8dcc0' : '#4a3e2c';
    const ox = estado >= 1 ? 0 : 2;
    g.fillRect(x - 3 + ox, 92 - h - 3, 2, 2); g.fillRect(x + 1 + ox, 92 - h - 3, 2, 2);
    if (estado >= 2) { g.strokeStyle = '#070505'; g.lineWidth = 2; for (let r = 0; r < 4; r++) { g.beginPath(); g.moveTo(x - 6 + Math.random() * 2, 92 - h - 5 + Math.random() * 2); g.lineTo(x + 6 - Math.random() * 2, 92 - h - 1 + Math.random() * 2); g.stroke(); } }
  }
  if (estado >= 1) { g.fillStyle = 'rgba(140,20,10,.5)'; g.font = 'bold 10px serif'; g.fillText(estado >= 2 ? 'NÃO SAIA' : 'LIA', 4, 12); }
  const t = new A.THREE.CanvasTexture(c); t.colorSpace = A.THREE.SRGBColorSpace; return t;
}

// ---------- neblina rasteira (canvas animado por deslocamento)
export function neblina(A, x0, x1, z0, z1, y = .35, op = .28) {
  const { THREE } = A;
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  for (let k = 0; k < 90; k++) { const x = Math.random() * 256, z = Math.random() * 256, r = 20 + Math.random() * 50; const gr = g.createRadialGradient(x, z, 0, x, z, r); gr.addColorStop(0, 'rgba(200,205,210,.22)'); gr.addColorStop(1, 'rgba(200,205,210,0)'); g.fillStyle = gr; for (const dx of [-256, 0, 256]) for (const dz of [-256, 0, 256]) { g.save(); g.translate(dx, dz); g.fillRect(x - r, z - r, r * 2, r * 2); g.restore(); } }
  const tex = new THREE.CanvasTexture(c); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set((x1 - x0) / 14, (z1 - z0) / 14);
  const camadas = [];
  for (const [dy, s] of [[0, 1], [.35, -.7]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshBasicMaterial({ map: dy ? tex.clone() : tex, color: 0x4a5258, transparent: true, opacity: op * (dy ? .7 : 1), depthWrite: false }));
    if (dy) { m.material.map.wrapS = m.material.map.wrapT = THREE.RepeatWrapping; m.material.map.repeat.copy(tex.repeat); m.material.map.needsUpdate = true; }
    m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y + dy, (z0 + z1) / 2); m.renderOrder = 3; A.W.grupo.add(m);
    camadas.push({ m, s });
  }
  A.W.tick.push(dt => { for (const { m, s } of camadas) { m.material.map.offset.x += dt * .012 * s; m.material.map.offset.y += dt * .006; } });
  return camadas;
}
