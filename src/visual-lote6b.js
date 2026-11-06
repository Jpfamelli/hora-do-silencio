// =====================================================================
// LOTE 6 (2ª rodada) — VISUAL E LUZ: a casa lembra de você
// A casa envelhece com as noites e as mortes, a fachada acende uma janela por noite,
// luas raras, estações do ano, olhos que se acostumam ao escuro, sombras que desobedecem,
// partículas de clima e tinta que só a segunda jogada vê. Tudo passivo e à prova de erro,
// e quieto sob o teste automático (navigator.webdriver). Ligado por 5 linhas em jogo.js (L6B).
// Filhos: visual-lote6b-lentes.js (lentes e vigilância) e visual-lote6b-cartoes.js (cartões, título, mão).
// =====================================================================
import { instalarLentesL6B } from './visual-lote6b-lentes.js';
import { instalarCartoesL6B } from './visual-lote6b-cartoes.js';

function hashStr(s) { let h = 2166136261; for (const c of String(s || 'SEMCOD')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function prng(seed) { let a = seed >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function instalarVisualLote6B(C) {
  const { THREE, scene, camera, renderer, canvas, flash, hemi, moon, chuvaMat, W, P, M, ANA, PROC, MAT, TX, OPT, toast, conquista, canvasTex, rand, clamp, lerp } = C;
  const robo = (() => { try { return !!navigator.webdriver; } catch (e) { return false; } })();
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const seguro = fn => { try { return fn(); } catch (e) { if (window.__l6bDebug) console.log('[L6B] ' + (e && e.stack || e)); return undefined; } };
  const $ = s => document.querySelector(s);
  const KB = 'hora-silencio-l6b';
  const mem = Object.assign({ vistos: {}, tinta: {}, passaro: 0, cartaz: 0 }, lsGet(KB, {}));
  const salvarMem = () => lsSet(KB, mem);
  const Sx = () => C.S;

  // conquistas próprias (entram no acervo na importação)
  seguro(() => {
    const R = window.ROTEIRO;
    if (R && R.conquistas && !R.conquistas.find(x => x.id === 'l6b_sangue')) R.conquistas.push(
      { id: 'l6b_sangue', nome: 'Você pegou a lua vermelha?', desc: 'Jogou uma noite sob a lua de sangue, a que aparece em uma de vinte.', secreta: true },
      { id: 'l6b_tinta', nome: 'A letra da Lia antiga', desc: 'Leu quatro recados escritos com tinta que só a lanterna acorda.', secreta: true },
      { id: 'l6b_semlua', nome: 'O mundo fechou', desc: 'Atravessou uma noite sem lua: só a lanterna e o escuro.', secreta: true }
    );
  });

  // ---------- memória do que o jogador já fez (lido do que o motor já guarda) ----------
  let D = { partidas: 0, mortes: 0, finais: 0, verdadeiro: 0, silencio: 0, concluidas: 0 };
  function lerDados() {
    const st = lsGet('hora-silencio-stats', {}), l6 = lsGet('hora-silencio-l6', {}), f = st.finais || {};
    D = { partidas: Math.max(st.partidas | 0, l6.noites | 0), mortes: st.mortes | 0, finais: Object.keys(f).length, verdadeiro: f.verdadeiro | 0, silencio: f.silencio | 0, concluidas: st.concluidas | 0 };
    const ov = window.__l6bDados; if (ov) Object.assign(D, ov); // para testar à mão
    return D;
  }
  lerDados();

  // ---------- sorteios da noite ----------
  let semAtual = null, RARO = { sangue: false, semLua: false }, extraTint = new THREE.Color(1, 1, 1), extraNome = '';
  function paixao() { // Sexta-feira da Paixão pela data real (algoritmo de Páscoa)
    const d = new Date(), a = d.getFullYear(), m = a % 19, c = Math.floor(a / 100), cc = a % 100, dd = Math.floor(c / 4), e = c % 4, f = Math.floor((c + 8) / 25), g = Math.floor((c - f + 1) / 3);
    const h = (19 * m + c - dd - g + 15) % 30, i = Math.floor(cc / 4), k = cc % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, mm = Math.floor((m + 11 * h + 22 * l) / 451);
    const mes = Math.floor((h + l - 7 * mm + 114) / 31) - 1, dia = ((h + l - 7 * mm + 114) % 31) + 1;
    const pascoa = new Date(a, mes, dia); const sexta = new Date(pascoa.getTime() - 2 * 86400000);
    return sexta.getMonth() === d.getMonth() && sexta.getDate() === d.getDate();
  }
  function sortear() {
    const S = Sx(); const sem = (S && S.semente) || 'SEMCOD';
    if (sem === semAtual) return; semAtual = sem; lerDados();
    const r = prng(hashStr(sem + '|l6b')); const v = r();
    RARO = { sangue: v < .05, semLua: v >= .05 && v < .12 };
    if (window.__l6bForce) RARO = Object.assign(RARO, window.__l6bForce);
    // tinte extra acumulado: dia da semana · mortes · casa lavada · Sexta-feira da Paixão
    extraTint.setRGB(1, 1, 1); extraNome = '';
    if (!+OPT.daltonismo && !OPT.baixaVisao) {
      const dia = new Date().getDay(); // terça mais verde, sexta mais vermelha
      const dt = { 2: [.97, 1.04, .98], 5: [1.05, .97, .96], 0: [.99, .98, 1.04], 6: [1.02, 1.0, .96] }[dia]; if (dt) extraTint.multiply(new THREE.Color(dt[0], dt[1], dt[2]));
    }
    const tier = Math.min(3, Math.floor(D.mortes / 10)); // azul → âmbar → brasa
    if (tier > 0) { const q = [[1, 1, 1], [1.04, 1.0, .94], [1.09, .97, .86], [1.15, .92, .78]][tier]; extraTint.multiply(new THREE.Color(q[0], q[1], q[2])); }
    if (D.verdadeiro >= 3) extraTint.multiply(new THREE.Color(.92, 1.0, 1.1)); // a casa lavada e quase calma
    if (paixao()) { extraTint.multiply(new THREE.Color(1.08, .84, .98)); extraNome = 'paixao'; }
  }

  // ---------- helpers de parede ----------
  function paredesLivres(salaId, lado, passo = 1.2) {
    const r = W.salas.find(s => s.id === salaId); if (!r || r.fora) return [];
    const out = [], Tp = .115, len = lado[0] === 'x' ? (r.z1 - r.z0) : (r.x1 - r.x0);
    for (let t = 1.3; t < len - 1.3; t += passo) {
      let x, z, ry;
      if (lado === 'x0') { x = r.x0 + Tp; z = r.z0 + t; ry = Math.PI / 2; }
      else if (lado === 'x1') { x = r.x1 - Tp; z = r.z0 + t; ry = -Math.PI / 2; }
      else if (lado === 'z0') { x = r.x0 + t; z = r.z0 + Tp; ry = 0; }
      else { x = r.x0 + t; z = r.z1 - Tp; ry = Math.PI; }
      if (W.links.some(l => (l.a === r.id || l.b === r.id) && Math.hypot(l.x - x, l.z - z) < 1.9 + (l.largura || 0) / 2)) continue;
      const fx = x + Math.sin(ry) * .5, fz = z + Math.cos(ry) * .5;
      if (W.colliders.some(c => c.on && fx > c.minX - .25 && fx < c.maxX + .25 && fz > c.minZ - .25 && fz < c.maxZ + .25)) continue;
      out.push({ x, z, ry });
    }
    return out;
  }
  function decalParede(w, h, tex, p, y, extra = {}) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, opacity: extra.op ?? 1, emissive: extra.emi || 0x000000, emissiveIntensity: extra.emiI || 0 }));
    m.position.set(p.x + Math.sin(p.ry) * .012, y, p.z + Math.cos(p.ry) * .012); m.rotation.y = p.ry; m.renderOrder = 2; W.grupo.add(m); return m;
  }
  const escolher = (lista, r) => lista[Math.floor(r() * lista.length) % lista.length];

  // =====================================================================
  // 1) A CASA ENVELHECE (camadas nas texturas em canvas, na troca de mapa)
  // =====================================================================
  let idadeAplicada = 0; const editados = new Set();
  const nivelIdade = () => Math.min(9, Math.floor(D.partidas / 3) + Math.floor(D.mortes / 12) + (D.mortes >= 25 ? 1 : 0));
  function camada(nivel) {
    const r = prng(0x9e3779b1 ^ (nivel * 7919));
    const alvo = (nomes, fn) => { for (const n of nomes) { const t = TX[n]; if (!t || !t.image || !t.image.getContext) continue; const g = t.image.getContext('2d'), w = t.image.width, h = t.image.height; fn(g, w, h); editados.add(t.image); t.needsUpdate = true; } };
    const PAREDES = ['reboco', 'azulejo', 'tijolo', 'concreto'];
    if (nivel === 1) alvo(['reboco', 'ladrilho', 'azulejo'], (g, w, h) => { // mofo subindo do rodapé e dos cantos
      for (let i = 0; i < 26; i++) { const x = r() * w, y = h - r() * h * .32, rad = 6 + r() * 20, gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(26,38,22,.5)'); gr.addColorStop(1, 'rgba(26,38,22,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    });
    if (nivel === 2) alvo(['reboco', 'tijolo'], (g, w, h) => { // teias nos cantos
      g.strokeStyle = 'rgba(214,214,206,.38)'; g.lineWidth = 1;
      for (const [cx, cy, sx, sy] of [[0, 0, 1, 1], [w, 0, -1, 1]]) { const L = 34 + r() * 22; for (let k = 0; k <= 6; k++) { const a = k / 6 * Math.PI / 2; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + sx * Math.cos(a) * L, cy + sy * Math.sin(a) * L); g.stroke(); } for (let q = 1; q <= 4; q++) { g.beginPath(); for (let k = 0; k <= 6; k++) { const a = k / 6 * Math.PI / 2, rr = L * q / 4 * (.82 + r() * .12); g.lineTo(cx + sx * Math.cos(a) * rr, cy + sy * Math.sin(a) * rr); } g.stroke(); } }
    });
    if (nivel === 3) alvo(['reboco', 'concreto'], (g, w, h) => { // tinta descascando
      for (let i = 0; i < 8; i++) { const x = r() * w, y = r() * h * .8, ww = 12 + r() * 28, hh = 8 + r() * 22; g.fillStyle = 'rgba(150,140,120,.55)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + ww, y + hh * .2); g.lineTo(x + ww * .8, y + hh); g.lineTo(x + ww * .1, y + hh * .8); g.closePath(); g.fill(); g.strokeStyle = 'rgba(20,16,10,.55)'; g.lineWidth = 1.5; g.stroke(); }
    });
    if (nivel === 4) alvo(['reboco', 'tijolo', 'concreto'], (g, w, h) => { // rachaduras
      g.strokeStyle = 'rgba(10,8,6,.7)'; g.lineWidth = 1.3;
      for (let c = 0; c < 3; c++) { let x = r() * w, y = r() * h * .3; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 9; k++) { x += (r() - .5) * 18; y += 10 + r() * 14; g.lineTo(x, y); } g.stroke(); }
    });
    if (nivel === 5) alvo(['reboco'], (g, w, h) => { // giz de criança: casinha, sol e um boneco de palito
      g.strokeStyle = 'rgba(232,228,216,.5)'; g.lineWidth = 2; g.lineCap = 'round';
      const x = 30 + r() * (w - 110), y = h * .25 + r() * 40;
      g.strokeRect(x, y + 14, 26, 20); g.beginPath(); g.moveTo(x - 3, y + 14); g.lineTo(x + 13, y); g.lineTo(x + 29, y + 14); g.stroke();
      g.beginPath(); g.arc(x + 58, y + 6, 6, 0, 7); g.stroke();
      g.beginPath(); g.arc(x + 46, y + 40, 4, 0, 7); g.moveTo(x + 46, y + 44); g.lineTo(x + 46, y + 58); g.moveTo(x + 38, y + 50); g.lineTo(x + 54, y + 50); g.moveTo(x + 46, y + 58); g.lineTo(x + 40, y + 70); g.moveTo(x + 46, y + 58); g.lineTo(x + 52, y + 70); g.stroke();
    });
    if (nivel === 6) alvo(PAREDES, (g, w, h) => { // manchas de umidade escuras
      for (let i = 0; i < 6; i++) { const x = r() * w, y = r() * h * .45, rad = 24 + r() * 46, gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(14,12,8,.42)'); gr.addColorStop(1, 'rgba(14,12,8,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    });
    if (nivel === 7) alvo(['reboco', 'tijolo'], (g, w, h) => { // raízes e hera subindo
      g.strokeStyle = 'rgba(20,34,16,.75)'; g.lineWidth = 2; g.lineCap = 'round';
      for (let c = 0; c < 4; c++) { let x = r() * w, y = h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 12; k++) { x += (r() - .5) * 20; y -= 12 + r() * 12; g.lineTo(x, y); if (r() < .3) { g.moveTo(x, y); g.lineTo(x + (r() - .5) * 26, y - 8); g.moveTo(x, y); } } g.stroke(); for (let k = 0; k < 8; k++) { g.fillStyle = 'rgba(30,52,24,.7)'; g.beginPath(); g.ellipse(x + (r() - .5) * 30, h - r() * h * .6, 3, 5, r() * 3, 0, 7); g.fill(); } }
    });
    if (nivel === 8) alvo(['reboco', 'madeira', 'ladrilho', 'tijolo'], (g, w, h) => { g.fillStyle = 'rgba(8,10,6,.2)'; g.fillRect(0, 0, w, h); }); // casa tomada: tudo mais escuro
    if (nivel === 9) alvo(['reboco'], (g, w, h) => { // depois de 25 mortes as paredes sangram, quase imperceptível
      for (let c = 0; c < 5; c++) { const x = r() * w, y = r() * h * .4, len = 40 + r() * 90, gr = g.createLinearGradient(0, y, 0, y + len); gr.addColorStop(0, 'rgba(90,10,10,.38)'); gr.addColorStop(1, 'rgba(90,10,10,0)'); g.fillStyle = gr; g.fillRect(x, y, 2 + r() * 3, len); }
    });
  }
  function envelhecer() {
    if (robo) return; const alvo = nivelIdade();
    while (idadeAplicada < alvo) camada(++idadeAplicada);
    if (editados.size) W.grupo.traverse(o => { if (!o.isMesh || !o.material) return; for (const m of [].concat(o.material)) if (m.map && editados.has(m.map.image)) m.map.needsUpdate = true; });
    const n = idadeAplicada;
    // vidros embaçados e lâmpadas que amarelam com a idade
    if (MAT.vidro) { MAT.vidro.opacity = Math.min(.82, .5 + n * .04); MAT.vidro.color.setRGB(.07 + n * .012, .09 + n * .012, .1 + n * .01); }
    if (n > 0) for (const L of W.lampadas) { const k = Math.min(.55, n * .06), c = new THREE.Color(0xd8c066); if (L.halo) L.halo.material.color.lerp(c, k); if (L.bulbo) L.bulbo.material.emissive.lerp(c, k); }
  }

  // =====================================================================
  // 2) MARCAS DAS MORTES: mancha, contorno de giz, contagem em cinco e unhas na porta
  // =====================================================================
  function marcasMortes() {
    const todas = lsGet('hora-silencio-l6-mortes', {}), lista = todas[W.mapa] || []; if (!lista.length) return;
    const recentes = lista.slice(-12);
    const manchaTex = canvasTex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(40,6,6,.72)'); gr.addColorStop(.6, 'rgba(30,6,6,.4)'); gr.addColorStop(1, 'rgba(30,6,6,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    for (const [x, z] of recentes) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ map: manchaTex, transparent: true, depthWrite: false, opacity: .8 })); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.random() * 6; m.position.set(x, .018, z); m.renderOrder = 1; W.grupo.add(m); }
    // contorno de giz do corpo na última morte
    const [ux, uz] = lista[lista.length - 1];
    const corpoTex = canvasTex(128, 192, (g, w, h) => { g.strokeStyle = 'rgba(228,224,212,.7)'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.arc(64, 30, 17, 0, 7); g.stroke(); g.beginPath(); g.moveTo(50, 50); g.lineTo(34, 100); g.lineTo(44, 104); g.lineTo(58, 70); g.lineTo(58, 130); g.lineTo(50, 182); g.lineTo(62, 184); g.lineTo(64, 140); g.lineTo(68, 184); g.lineTo(80, 182); g.lineTo(70, 130); g.lineTo(70, 70); g.lineTo(84, 104); g.lineTo(94, 100); g.lineTo(78, 50); g.closePath(); g.stroke(); });
    const c = new THREE.Mesh(new THREE.PlaneGeometry(.85, 1.3), new THREE.MeshBasicMaterial({ map: corpoTex, transparent: true, depthWrite: false, opacity: .75 })); c.rotation.x = -Math.PI / 2; c.rotation.z = (uz * 3.7 + ux) % 6.28; c.position.set(ux, .02, uz); c.renderOrder = 1; W.grupo.add(c);
    // onde você mais cai: contagem em risquinhos de cinco (e as unhas da porta mais próxima)
    let melhor = null, nm = 0; for (const [x, z] of lista) { const n = lista.filter(([a, b]) => Math.hypot(a - x, b - z) < 4).length; if (n > nm) { nm = n; melhor = [x, z]; } }
    if (melhor && nm >= 3) {
      const tex = canvasTex(160, 96, (g, w, h) => { g.strokeStyle = 'rgba(224,220,206,.62)'; g.lineWidth = 3; g.lineCap = 'round'; for (let i = 0; i < Math.min(nm, 20); i++) { const gr = Math.floor(i / 5), k = i % 5, bx = 12 + gr * 38; if (k < 4) { g.beginPath(); g.moveTo(bx + k * 7, 14); g.lineTo(bx + k * 7, 52); g.stroke(); } else { g.beginPath(); g.moveTo(bx - 4, 46); g.lineTo(bx + 30, 20); g.stroke(); } } });
      const t = new THREE.Mesh(new THREE.PlaneGeometry(1.2, .72), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, opacity: .8 })); t.rotation.x = -Math.PI / 2; t.position.set(melhor[0] + 1, .021, melhor[1]); t.renderOrder = 1; W.grupo.add(t);
      let porta = null, dm = 99; for (const d of W.doors) { const dd = Math.hypot(d.x - melhor[0], d.z - melhor[1]); if (dd < dm) { dm = dd; porta = d; } }
      if (porta && dm < 8) {
        const unhas = canvasTex(128, 160, (g, w, h) => { g.strokeStyle = 'rgba(20,12,8,.8)'; g.lineWidth = 2.2; for (let k = 0; k < Math.min(9, 3 + nm); k++) { const x = 20 + k * 11 + Math.random() * 4; g.beginPath(); g.moveTo(x, 20 + Math.random() * 20); g.bezierCurveTo(x + 3, 60, x - 3, 100, x + 2, 130 + Math.random() * 20); g.stroke(); } });
        for (const lado of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.7, .85), new THREE.MeshBasicMaterial({ map: unhas, transparent: true, depthWrite: false, opacity: .85 })); const ax = porta.eixo === 'x'; m.position.set(porta.x + (ax ? 0 : lado * .075), 1.15, porta.z + (ax ? lado * .075 : 0)); m.rotation.y = ax ? (lado > 0 ? 0 : Math.PI) : (lado > 0 ? Math.PI / 2 : -Math.PI / 2); m.renderOrder = 3; W.grupo.add(m); }
      }
    }
  }

  // =====================================================================
  // 3) FACHADA E CEMITÉRIO: o placar silencioso (janelas acesas e velas)
  // =====================================================================
  let janelas = [], janelaApaga = null, velas = [];
  function texJanelaAcesa(v) {
    return canvasTex(64, 72, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffcf80'); gr.addColorStop(1, '#e89a40'); g.fillStyle = gr; g.fillRect(2, 2, w - 4, h - 4);
      g.fillStyle = '#2a1a0c'; g.fillRect(w / 2 - 1.5, 2, 3, h - 4); g.fillRect(2, h * .45, w - 4, 3);
      g.fillStyle = 'rgba(14,8,4,.92)'; const cx = [w * .28, w * .72, w * .28][v], by = h - 4;
      g.beginPath(); g.arc(cx, by - 30, 5, 0, 7); g.fill(); g.fillRect(cx - 5, by - 25, 10, 24); // cabeça e corpo de criança
      if (v === 1) { g.fillRect(cx - 12, by - 22, 8, 3); }
    });
  }
  function fachada() {
    janelas = []; janelaApaga = null;
    if (W.mapa !== 'estrada') return;
    const BZ = -79, z = BZ + 5.18, r = prng(0xFAC4ADA), slots = [];
    for (let i = -6; i <= 6; i++) for (const y of [2, 5.5]) slots.push({ x: i * 5, y });
    for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }
    const n = Math.min(slots.length, D.partidas + Math.floor(D.finais / 2));
    const texs = [0, 1, 2].map(texJanelaAcesa);
    for (let i = 0; i < n; i++) {
      const s = slots[i], m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), new THREE.MeshBasicMaterial({ map: texs[i % 3], transparent: true, opacity: .8 + r() * .2 }));
      m.position.set(s.x, s.y, z); W.grupo.add(m); janelas.push(m);
    }
    if (n >= 12) janelaApaga = janelas[11]; // na décima segunda, uma janela apaga quando você olha
    if (D.verdadeiro > 0) { // a janela do sótão só acende depois do final verdadeiro
      const m = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.1), new THREE.MeshBasicMaterial({ map: texs[2], transparent: true, opacity: .95 })); m.position.set(0, 11.4, BZ + 7.06); W.grupo.add(m);
    }
  }
  let janelaApagou = false;
  function fachadaTick() {
    if (!janelaApaga || janelaApagou || !janelaApaga.visible) return;
    const d = new THREE.Vector3().subVectors(janelaApaga.position, camera.position), dist = d.length(); if (dist > 70) return;
    const f = new THREE.Vector3(); camera.getWorldDirection(f);
    if (f.dot(d.normalize()) > .985) { janelaApaga.visible = false; janelaApagou = true; seguro(() => C.SFX.clique()); }
  }
  function velasCemiterio() {
    velas = [];
    if (W.mapa !== 'cemiterio') return;
    const n = Math.min(34, D.finais + Math.floor(D.partidas / 2)); if (n <= 0) return;
    const halo = canvasTex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 1, 32, 32, 30); gr.addColorStop(0, 'rgba(255,220,150,1)'); gr.addColorStop(.3, 'rgba(255,170,70,.5)'); gr.addColorStop(1, 'rgba(255,140,40,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const cera = new THREE.MeshStandardMaterial({ color: 0xe6dcc0, roughness: .8 });
    const sombraTex = canvasTex(32, 32, (g) => { const gr = g.createRadialGradient(16, 16, 1, 16, 16, 15); gr.addColorStop(0, 'rgba(0,0,0,.7)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
    for (let i = 0; i < n; i++) {
      const lado = i % 2 ? 1 : -1, k = Math.floor(i / 2), x = lado * (3.8 + k * .85), z = -45.6 + (k % 2) * .25;
      const g = new THREE.Group(); g.position.set(x, 0, z);
      const c = new THREE.Mesh(new THREE.CylinderGeometry(.025, .028, .16, 8), cera); c.position.y = .08; g.add(c);
      const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, transparent: true, opacity: .8, depthWrite: false, blending: THREE.AdditiveBlending })); h.scale.set(.32, .32, 1); h.position.y = .2; g.add(h);
      const s = new THREE.Mesh(new THREE.PlaneGeometry(.2, .3), new THREE.MeshBasicMaterial({ map: sombraTex, transparent: true, opacity: 0, depthWrite: false })); s.rotation.x = -Math.PI / 2; s.position.set(0, .012, -.16); g.add(s);
      W.grupo.add(g); velas.push({ g, h, s, f: Math.random() * 9 });
    }
  }
  function velasTick(dt) {
    if (!velas.length) return; const f = new THREE.Vector3(); camera.getWorldDirection(f); const t = C.perf() * 7;
    const on = !!(Sx() && Sx().flashOn);
    for (const v of velas) {
      const d = new THREE.Vector3(v.g.position.x - camera.position.x, 0, v.g.position.z - camera.position.z), dist = d.length();
      const luz = on && dist < 12 ? Math.max(0, f.dot(d.normalize())) ** 6 : 0;
      v.h.material.opacity = (.55 + Math.sin(t + v.f) * .12 + Math.sin(t * 2.3 + v.f) * .06) * (1 + luz * .9);
      v.h.scale.setScalar(.3 + Math.sin(t * 1.3 + v.f) * .03 + luz * .12); v.s.material.opacity = luz * .7;
    }
  }

  // =====================================================================
  // 4) PAREDES QUE CONTAM: gibi do Davi, cartaz, mancha de umidade, tinta invisível, troféus do hall
  // =====================================================================
  let tintas = [], manchaRosto = null;
  function gibiDoDavi(p) {
    const n = Math.min(9, D.partidas), red = '#b01c24';
    const tex = canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = 'rgba(20,18,14,.18)'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(232,228,214,.82)'; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
      const cel = 160, gx = 12;
      for (let i = 0; i < 9; i++) {
        const cx = gx + (i % 3) * (cel + 8), cy = gx + Math.floor(i / 3) * (cel + 8);
        g.strokeStyle = 'rgba(232,228,214,.82)'; g.strokeRect(cx, cy, cel, cel);
        if (i >= n) { g.fillStyle = 'rgba(10,10,8,.5)'; g.fillRect(cx + 2, cy + 2, cel - 4, cel - 4); continue; }
        if (i === 8 && D.verdadeiro < 1) { g.fillStyle = 'rgba(10,10,8,.5)'; g.fillRect(cx + 2, cy + 2, cel - 4, cel - 4); continue; }
        const o = (x, y) => [cx + x, cy + y];
        const boneco = (x, y, s = 1) => { g.beginPath(); g.arc(...o(x, y), 9 * s, 0, 7); g.moveTo(...o(x, y + 9 * s)); g.lineTo(...o(x, y + 40 * s)); g.moveTo(...o(x - 14 * s, y + 22 * s)); g.lineTo(...o(x + 14 * s, y + 22 * s)); g.moveTo(...o(x, y + 40 * s)); g.lineTo(...o(x - 10 * s, y + 62 * s)); g.moveTo(...o(x, y + 40 * s)); g.lineTo(...o(x + 10 * s, y + 62 * s)); g.stroke(); };
        if (i === 0) { boneco(50, 70); g.beginPath(); g.moveTo(...o(80, 120)); g.lineTo(...o(150, 120)); g.stroke(); } // Davi correndo
        else if (i === 1) { g.strokeRect(...o(30, 30), 60, 110); g.beginPath(); g.arc(...o(100, 90), 9, 0, 7); g.stroke(); } // atrás da porta
        else if (i === 2) { boneco(50, 70); boneco(110, 86, .8); g.beginPath(); g.moveTo(...o(100, 70)); g.lineTo(...o(122, 70)); g.stroke(); } // a menina que conta
        else if (i === 3) { boneco(110, 60, 1.1); g.beginPath(); g.moveTo(...o(80, 70)); g.lineTo(...o(60, 150)); g.stroke(); g.fillStyle = 'rgba(232,228,214,.9)'; g.fillRect(...o(98, 66), 24, 8); } // o homem da bengala, de venda
        else if (i === 4) { g.strokeRect(...o(40, 20), 70, 130); boneco(75, 60, .8); } // no armário
        else if (i === 5) { g.beginPath(); g.moveTo(...o(10, 100)); g.lineTo(...o(150, 100)); g.moveTo(...o(10, 70)); g.lineTo(...o(150, 70)); g.stroke(); boneco(80, 78, .7); } // túnel
        else if (i === 6) { boneco(60, 70); boneco(100, 70); g.beginPath(); g.moveTo(...o(74, 92)); g.lineTo(...o(86, 92)); g.stroke(); } // de mãos dadas
        else if (i === 7) { g.beginPath(); g.moveTo(...o(80, 20)); g.lineTo(...o(60, 100)); g.lineTo(...o(100, 100)); g.closePath(); g.stroke(); g.beginPath(); g.arc(...o(80, 108), 6, 0, 7); g.stroke(); } // o sino
        else { g.strokeStyle = red; g.fillStyle = red; g.lineWidth = 4; boneco(80, 64, 1.1); g.beginPath(); g.arc(...o(72, 72), 2.5, 0, 7); g.arc(...o(89, 72), 2.5, 0, 7); g.fill(); g.beginPath(); g.moveTo(...o(80, 100)); g.lineTo(...o(80, 150)); g.stroke(); } // o nono painel: o Davi olha para a Lia (a única cor)
      }
    });
    decalParede(1.5, 1.5, tex, p, 1.55, { op: .92 });
  }
  function cartazProcura(p) {
    const pontos = Math.min(30, D.partidas), recompensa = Math.round((50 + 4950 * Math.pow(pontos / 30, 1.6)) / 10) * 10, volte = D.partidas >= 15;
    const tex = canvasTex(256, 360, (g, w, h) => {
      g.fillStyle = '#c9b88c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 600; i++) { g.fillStyle = `rgba(80,60,30,${Math.random() * .08})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
      g.fillStyle = '#2a2014'; g.textAlign = 'center'; g.font = 'bold 36px Georgia'; g.fillText(volte ? 'VOLTE' : 'PROCURA-SE', w / 2, 46);
      g.strokeStyle = '#3a3226'; g.lineWidth = 2; g.strokeRect(34, 62, w - 68, 150);
      g.strokeStyle = 'rgba(40,36,30,.8)'; g.lineWidth = 1.4; // desenho a lápis da Lia
      g.beginPath(); g.ellipse(w / 2, 142, 36, 46, 0, 0, 7); g.stroke();
      for (let i = 0; i < 18; i++) { g.beginPath(); g.moveTo(w / 2 - 38 + i * 4, 98); g.quadraticCurveTo(w / 2 - 44 + i * 5, 130, w / 2 - 40 + i * 5, 190 - (i % 3) * 8); g.stroke(); }
      g.beginPath(); g.arc(w / 2 - 14, 138, 4, 0, 7); g.arc(w / 2 + 14, 138, 4, 0, 7); g.stroke(); g.beginPath(); g.moveTo(w / 2 - 10, 166); g.quadraticCurveTo(w / 2, 170, w / 2 + 10, 166); g.stroke();
      g.fillStyle = '#2a2014'; g.font = 'bold 30px Georgia'; g.fillText('LIA', w / 2, 248);
      g.font = 'italic 18px Georgia'; g.fillText(volte ? 'a casa guardou o seu lugar' : 'viva ou morta', w / 2, 274);
      g.font = 'bold 20px Georgia'; g.fillText('RECOMPENSA', w / 2, 308); g.font = 'bold 28px Georgia'; g.fillText('Cr$ ' + recompensa.toLocaleString('pt-BR'), w / 2, 340);
    });
    decalParede(.55, .78, tex, p, 1.55);
  }
  function manchaDeUmidade(p, r) {
    const rosto = canvasTex(256, 256, (g, w, h) => {
      g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h);
      for (let i = 0; i < 22; i++) { const x = 128 + (r() - .5) * 120, y = 128 + (r() - .5) * 150, rad = 20 + r() * 44, gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, 'rgba(30,26,16,.34)'); gr.addColorStop(1, 'rgba(30,26,16,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
      g.fillStyle = 'rgba(14,10,6,.55)'; g.beginPath(); g.ellipse(100, 112, 12, 17, 0, 0, 7); g.ellipse(158, 112, 12, 17, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(129, 170, 14, 26, 0, 0, 7); g.fill();
    });
    const m = decalParede(1.7, 1.7, rosto, p, 1.85, { op: .9 }); manchaRosto = { m, olhou: 0, t: 0, sumindo: false };
  }
  function mensagensTinta() {
    const todos = {
      estrada: ['O VELHO NÃO PAROU DE ESPERAR', 'NÃO ABRA O PORTÃO DE DIA'],
      terreo: ['O SEGUNDO DEGRAU RANGE', 'ELE OUVE O QUE VOCÊ PISA', 'FECHE A PORTA POR TRÁS', 'A TERCEIRA GAVETA NÃO É DE PAPEL'],
      superior: ['NÃO CONTE ATÉ DEZ COM ELA', 'ONDE VOCÊ OLHA, O CORREDOR CHEGA'],
      tuneis: ['A ÁGUA SABE A ORDEM', 'NÃO RESPONDA O CHAMADO'],
      cemiterio: ['TRÊS COVAS, TRÊS NOMES', 'O SINO CHAMA OS DOIS']
    };
    return todos[W.mapa] || [];
  }
  function paredesDoMapa() {
    tintas = []; manchaRosto = null;
    const S = Sx(); const sem = (S && S.semente) || 'SEMCOD'; const r = prng(hashStr(sem + '|paredes'));
    const salasI = W.salas.filter(s => !s.fora);
    // tinta invisível: só para quem já viu um final
    if (D.finais > 0 || D.concluidas > 0) {
      const msgs = mensagensTinta(), cands = (salasI.length ? salasI : W.salas.filter(s => s.fora)).slice();
      for (const msg of msgs) {
        const sala = cands.length ? cands[Math.floor(r() * cands.length)] : null; if (!sala || sala.fora) continue;
        const lados = ['x0', 'x1', 'z0', 'z1'].sort(() => r() - .5);
        for (const lado of lados) { const ps = paredesLivres(sala.id, lado, 1.4); if (!ps.length) continue; const p = ps[Math.floor(r() * ps.length)];
          const tex = canvasTex(256, 96, (g, w, h) => { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); g.fillStyle = '#9fd8c8'; g.textAlign = 'center'; g.font = 'italic 21px "Special Elite", Georgia'; g.fillText(msg, w / 2, 40); g.font = 'italic 14px Georgia'; g.fillText('— Lia', w / 2 + 70, 72); });
          const m = decalParede(1.5, .56, tex, p, 1.55 + r() * .3, { op: 0 }); m.material.blending = THREE.AdditiveBlending; tintas.push({ m, msg, exp: 0, vida: 4, lida: false }); break; }
      }
    }
    if (W.mapa === 'terreo') {
      const hall = paredesLivres('hall', 'x1', 1), hall2 = paredesLivres('hall', 'x0', 1);
      if (hall.length) gibiDoDavi(hall[Math.floor(hall.length / 2)]);
      if (hall2.length) cartazProcura(hall2[Math.floor(hall2.length / 2)]);
      const cw = paredesLivres('ce', 'z1', 1.5); if (cw.length) manchaDeUmidade(cw[Math.floor(r() * cw.length)], r);
      trofeusHall();
    }
    if (W.mapa === 'superior') { const cr = paredesLivres('corr', r() < .5 ? 'x0' : 'x1', 1.5); if (cr.length) manchaDeUmidade(cr[Math.floor(r() * cr.length)], r); }
  }
  function paredesTick(dt) {
    const S = Sx(); const f = new THREE.Vector3(); camera.getWorldDirection(f);
    for (const t of tintas) {
      if (t.lida && t.vida <= 0) { t.m.material.opacity = Math.max(0, t.m.material.opacity - dt); continue; }
      const d = new THREE.Vector3().subVectors(t.m.position, camera.position), dist = d.length();
      const iluminada = S && S.flashOn && dist < 5.5 && f.dot(d.normalize()) > .93;
      if (iluminada) { t.exp += dt; t.m.material.opacity = Math.min(.95, t.m.material.opacity + dt * 3); if (!t.lida && t.exp > 1) { t.lida = true; mem.tinta[t.msg] = 1; salvarMem(); if (Object.keys(mem.tinta).length >= 4) conquista('l6b_tinta'); } if (t.exp > 4) t.vida = 0; }
      else t.m.material.opacity = Math.max(0, t.m.material.opacity - dt * 1.4);
      if (t.exp > 4) { t.lida = true; t.vida = 0; }
    }
    if (manchaRosto && !manchaRosto.sumindo) { // olhou duas vezes: a mancha vira para você e depois some
      const d = new THREE.Vector3().subVectors(manchaRosto.m.position, camera.position), dist = d.length(); const vendo = dist < 7 && f.dot(d.normalize()) > .9;
      if (vendo) { manchaRosto.t += dt; if (manchaRosto.t > 1.2 && manchaRosto.olhou === 0) { manchaRosto.olhou = 1; manchaRosto.t = 0; } else if (manchaRosto.t > 1 && manchaRosto.olhou === 1) { manchaRosto.olhou = 2; manchaRosto.sumindo = true; } }
      else if (manchaRosto.olhou === 1 && manchaRosto.t > 0) manchaRosto.t = Math.max(0, manchaRosto.t - dt);
    } else if (manchaRosto && manchaRosto.sumindo) { manchaRosto.m.material.opacity = Math.max(0, manchaRosto.m.material.opacity - dt * .35); }
  }
  function trofeusHall() {
    const hall = W.salas.find(s => s.id === 'hall'); if (!hall) return; const x = hall.x0 + .5, z = hall.z1 - .5;
    const g = new THREE.Group(); g.position.set(x, 0, z); W.grupo.add(g);
    if (D.partidas >= 1) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.03, .034, .18, 8), new THREE.MeshStandardMaterial({ color: 0xe8dcc0, emissive: 0xffa040, emissiveIntensity: .35 })); c.position.set(0, .09, 0); g.add(c); const ch = new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffc070 })); ch.position.set(0, .2, 0); g.add(ch); } // uma vela
    if (D.verdadeiro >= 1) { const fita = new THREE.Mesh(new THREE.BoxGeometry(.28, .008, .05), new THREE.MeshStandardMaterial({ color: 0x8a1c24, roughness: .9 })); fita.position.set(.3, .006, .05); fita.rotation.y = .4; g.add(fita); const ponta = fita.clone(); ponta.scale.x = .5; ponta.position.set(.4, .006, .14); ponta.rotation.y = -.5; g.add(ponta); } // uma fita
    if (D.finais >= 2) { const m = new THREE.MeshStandardMaterial({ color: 0x4a3a30, roughness: .9 }); const a = new THREE.Mesh(new THREE.BoxGeometry(.06, .035, .14), m); a.position.set(.65, .02, .02); g.add(a); const b = new THREE.Mesh(new THREE.BoxGeometry(.06, .035, .14), m); b.position.set(.74, .02, .1); b.rotation.y = .5; g.add(b); } // um sapatinho
  }

  // =====================================================================
  // 5) OLHOS QUE SE ACOSTUMAM, OFUSCAMENTO E O RELÂMPAGO NO CÉU
  // =====================================================================
  let escuroT = 0, lanternaAnt = false, ofusc = 0, ofEl = null;
  function garantirOfusc() {
    if (ofEl) return; const st = document.createElement('style');
    st.textContent = '#l6b-ofusc{position:fixed;inset:0;pointer-events:none;z-index:5;opacity:0;background:radial-gradient(circle at 50% 50%,rgba(255,244,214,.9) 0,rgba(255,226,170,.5) 18%,rgba(255,226,170,0) 46%);mix-blend-mode:screen}#l6b-geada{position:fixed;inset:0;pointer-events:none;z-index:5;opacity:0;transition:opacity 1.5s;background:radial-gradient(ellipse at 50% 50%,rgba(220,235,255,0) 52%,rgba(220,235,255,.22) 86%,rgba(235,244,255,.42) 100%)}';
    document.head.appendChild(st); ofEl = document.createElement('div'); ofEl.id = 'l6b-ofusc'; document.body.appendChild(ofEl);
    const ge = document.createElement('div'); ge.id = 'l6b-geada'; document.body.appendChild(ge);
  }
  function olhos(dt) {
    const S = Sx(); if (!S || C.mode !== 'jogo' || S.dead || S.fim) { escuroT = 0; return; }
    garantirOfusc();
    const on = !!S.flashOn;
    if (lanternaAnt && !on && S.inv && S.inv.lanterna) ofusc = 2; // ofuscamento: dois segundos de mancha clara depois que a luz apaga
    lanternaAnt = on;
    if (on) escuroT = Math.max(0, escuroT - dt * 30); else escuroT += dt; // acender reseta a adaptação
    ofusc = Math.max(0, ofusc - dt);
    ofEl.style.opacity = ofusc > 0 ? String(Math.min(1, ofusc / 2) * .55 * (OPT.vFlash ? .4 : 1)) : '0';
    const adapt = clamp((escuroT - 20) / 40, 0, 1) * .4; // depois de 20 s no escuro o ambiente sobe devagar até 40%
    olhos.adapt = adapt; if (adapt > 0.001) { hemi.intensity += adapt * .5; }
  }
  olhos.adapt = 0;

  let boltSpr = null, raioAnt = 0;
  function texRaio() {
    return canvasTex(128, 256, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(235,240,255,1)'; g.lineCap = 'round'; g.shadowColor = 'rgba(190,210,255,1)'; g.shadowBlur = 10;
      const ramo = (x, y, esp, prof) => { g.lineWidth = esp; g.beginPath(); g.moveTo(x, y); let px = x; for (let i = 0; i < prof; i++) { px += (Math.random() - .5) * 26; y += 14 + Math.random() * 12; g.lineTo(px, y); if (Math.random() < .22 && esp > 1.4) ramo(px, y, esp * .55, 4 + (Math.random() * 5 | 0)); g.moveTo(px, y); } g.stroke(); };
      ramo(w / 2 + (Math.random() - .5) * 30, 0, 3.6, 16);
    });
  }
  function raioNoCeu(dt) {
    if (robo || OPT.vFlash) return; const ri = C.raioI || 0, fora = !!(P.room && P.room.fora);
    if (fora && ri > .6 && raioAnt <= .6 && !boltSpr && W.mapa !== 'tuneis') {
      const ang = (Math.random() - .5) * 1.5, dir = new THREE.Vector3(); camera.getWorldDirection(dir); dir.y = 0; dir.normalize(); dir.applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
      boltSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: texRaio(), transparent: true, opacity: 0, depthWrite: false, depthTest: false, fog: false, blending: THREE.AdditiveBlending }));
      boltSpr.position.set(camera.position.x + dir.x * 70, 30, camera.position.z + dir.z * 70); boltSpr.scale.set(26, 52, 1); boltSpr.renderOrder = 4; scene.add(boltSpr);
    }
    raioAnt = ri;
    if (boltSpr) { boltSpr.material.opacity = Math.min(1, ri * 1.2); if (ri < .05) { scene.remove(boltSpr); boltSpr.material.map.dispose(); boltSpr.material.dispose(); boltSpr = null; } }
  }

  // =====================================================================
  // 6) AMBIENTE POR SEMENTE: lua de sangue, noite sem lua, amanhecer, paletas (por quadro)
  // =====================================================================
  const moonCor0 = new THREE.Color(); let moonY0 = null, avisouRaro = false, tochou = false, semLuaVisto = false;
  function ambiente(dt) {
    const S = Sx(); if (!S) return; sortear();
    if (moonY0 === null) { moonY0 = moon.position.y; moonCor0.copy(moon.color); }
    moon.color.copy(moonCor0);
    scene.fog.color.multiply(extraTint); if (scene.background && scene.background.isColor) scene.background.multiply(extraTint);
    if (RARO.sangue) { // lua de sangue: céu vinho, sombras longas e quase pretas
      scene.fog.color.lerp(new THREE.Color(.34, .04, .05), .55); if (scene.background && scene.background.isColor) scene.background.lerp(new THREE.Color(.22, .02, .03), .7);
      moon.color.setRGB(.9, .22, .18); moon.position.y = moonY0 * .42; hemi.intensity *= .72;
      if (C.mode === 'jogo' && !avisouRaro) { avisouRaro = true; toast('A lua subiu vermelha. As sombras estão compridas.'); conquista('l6b_sangue'); }
    }
    if (!RARO.sangue && moon.position.y !== moonY0) moon.position.y = moonY0;
    if (RARO.semLua) { // noite sem lua: janelas pretas absolutas, só a lanterna
      moon.intensity = 0; hemi.intensity *= .3; scene.fog.color.multiplyScalar(.35); if (scene.background && scene.background.isColor) scene.background.multiplyScalar(.12);
      if (C.mode === 'jogo' && !semLuaVisto) { semLuaVisto = true; conquista('l6b_semlua'); }
      if (S.battery !== undefined && ambiente.bat !== undefined && S.battery < ambiente.bat) S.battery = Math.min(100, S.battery + (ambiente.bat - S.battery) * .3); // a lanterna dura mais
      ambiente.bat = S.battery;
    }
    // amanhecer sobre a capela: o céu clareia com o tempo do capítulo
    if (W.mapa === 'cemiterio' && P.room && P.room.fora && S.chapter === 5 && !RARO.semLua) {
      const k = clamp((S.capT - 40) / 520, 0, 1), rosa = new THREE.Color(.72, .46, .46);
      if (k > 0) { scene.fog.color.lerp(rosa, k * .55); if (scene.background && scene.background.isColor) scene.background.lerp(rosa, k * .6); hemi.intensity += k * .25; moon.color.lerp(new THREE.Color(1, .8, .7), k * .6); }
      if (k > .85 && !tochou && !mem.passaro) { tochou = true; seguro(() => { const AC = C.AC; if (!AC || AC.state !== 'running') return; const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(3100, AC.currentTime); o.frequency.exponentialRampToValueAtTime(4300, AC.currentTime + .09); o.frequency.exponentialRampToValueAtTime(3300, AC.currentTime + .22); g.gain.setValueAtTime(0, AC.currentTime); g.gain.linearRampToValueAtTime(.035, AC.currentTime + .03); g.gain.linearRampToValueAtTime(0, AC.currentTime + .26); o.connect(g); g.connect(AC.destination); o.start(); o.stop(AC.currentTime + .3); }); }
    }
    // estação real: chuva grossa de janeiro a março
    const mes = new Date().getMonth();
    if (mes <= 2 && !RARO.semLua) chuvaMat.opacity *= 1.35;
  }

  // =====================================================================
  // 7) SOMBRA QUE DESOBEDECE (atrasada, parada, de costas e com um segundo par de pés)
  // =====================================================================
  let sombra = null, extra = null, hist = [], paradaAte = 0, proxParada = 40, viraEm = -1, virou = false, pesEm = -1, pesVivo = 0, pesPos = null, capAnt = -1;
  function texSilhueta() {
    return canvasTex(64, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.9)'; g.beginPath(); g.arc(32, 22, 11, 0, 7); g.fill(); g.fillRect(22, 32, 20, 48); g.fillRect(14, 34, 9, 40); g.fillRect(41, 34, 9, 40); g.fillRect(24, 78, 7, 44); g.fillRect(33, 78, 7, 44); });
  }
  function sombras(dt) {
    const S = Sx(); if (!S || C.mode !== 'jogo' || S.dead || S.fim || robo) return;
    if (D.partidas < 5 && !window.__l6bForce) return; // a casa só começa a te conhecer na quinta noite
    if (!sombra) {
      const tx = texSilhueta();
      sombra = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.8), new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0, depthWrite: false })); sombra.rotation.x = -Math.PI / 2; sombra.renderOrder = 2; scene.add(sombra);
      extra = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.8), new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0, depthWrite: false })); extra.rotation.x = -Math.PI / 2; extra.renderOrder = 2; scene.add(extra);
    }
    const t = S.tempo; hist.push({ t, x: P.pos.x, z: P.pos.z, yaw: P.yaw }); while (hist.length > 2 && hist[1].t < t - .8) hist.shift();
    if (S.chapter !== capAnt) { capAnt = S.chapter; viraEm = 50 + Math.random() * 160; virou = false; pesEm = Math.random() < .125 ? 70 + Math.random() * 120 : -1; pesVivo = 0; }
    let a = hist[0]; for (const h of hist) if (h.t <= t - .5) a = h; // posição de meio segundo atrás
    if (t >= proxParada && paradaAte < t) { paradaAte = t + 3.2; proxParada = t + 50 + Math.random() * 60; sombra.userData.fx = sombra.position.x; sombra.userData.fz = sombra.position.z; }
    const parada = t < paradaAte;
    const sx = a.x + Math.sin(a.yaw) * .55, sz = a.z + Math.cos(a.yaw) * .55; // atrás de onde ela estava, sob o feixe
    if (!parada) sombra.position.set(sx, .03, sz); else sombra.position.set(sombra.userData.fx, .03, sombra.userData.fz);
    let rot = a.yaw; if (S.capT > viraEm && S.capT < viraEm + 4) { rot += Math.PI; if (!virou) { virou = true; } } // uma vez por capítulo ela olha para o lado oposto
    sombra.rotation.z = rot;
    const fora = P.room && P.room.fora;
    sombra.material.opacity = (S.flashOn ? .5 : .2) * (fora ? .6 : 1);
    if (pesEm > 0 && S.capT > pesEm && pesVivo === 0) { pesVivo = 20; const d = P.yaw; pesPos = { x: P.pos.x + Math.sin(d) * 2.1, z: P.pos.z + Math.cos(d) * 2.1, yaw: d }; extra.position.set(pesPos.x, .03, pesPos.z); extra.rotation.z = pesPos.yaw; }
    if (pesVivo > 0) {
      pesVivo -= dt; const fw = new THREE.Vector3(); camera.getWorldDirection(fw); const d = new THREE.Vector3(extra.position.x - camera.position.x, 0, extra.position.z - camera.position.z), dist = d.length();
      const olhando = fw.dot(d.normalize()) > .6 && dist < 6; // se ela vira a câmera, não há nada
      extra.material.opacity = olhando ? 0 : Math.min(.55, extra.material.opacity + dt * .3);
      if (pesVivo <= 0) { extra.material.opacity = 0; pesEm = -1; }
    } else extra.material.opacity = 0;
  }

  // =====================================================================
  // 8) PARTÍCULAS DE CLIMA E ESTAÇÃO (traças, folhas, vaga-lumes, vapor, brasas, neblina)
  // =====================================================================
  const PX = []; const fxMat = {};
  function matFx(tipo) {
    if (fxMat[tipo]) return fxMat[tipo];
    const cfg = {
      traca: { c: [200, 200, 190], tam: 32, fn: (g) => { g.fillStyle = 'rgba(210,205,190,.85)'; g.beginPath(); g.ellipse(10, 16, 9, 5, -.5, 0, 7); g.ellipse(22, 16, 9, 5, .5, 0, 7); g.fill(); g.fillStyle = 'rgba(80,70,60,.9)'; g.fillRect(15, 10, 2, 12); }, add: false },
      folha: { fn: (g) => { g.fillStyle = 'rgba(70,52,28,.95)'; g.beginPath(); g.ellipse(16, 16, 11, 5, .6, 0, 7); g.fill(); g.strokeStyle = 'rgba(30,20,10,.8)'; g.beginPath(); g.moveTo(7, 22); g.lineTo(25, 10); g.stroke(); }, add: false },
      vagalume: { fn: (g) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 15); gr.addColorStop(0, 'rgba(220,255,140,1)'); gr.addColorStop(.3, 'rgba(180,240,90,.55)'); gr.addColorStop(1, 'rgba(160,220,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); }, add: true },
      vapor: { fn: (g) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 15); gr.addColorStop(0, 'rgba(230,240,255,.55)'); gr.addColorStop(1, 'rgba(230,240,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); }, add: false },
      brasa: { fn: (g) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 12); gr.addColorStop(0, 'rgba(255,230,160,1)'); gr.addColorStop(.4, 'rgba(255,120,30,.8)'); gr.addColorStop(1, 'rgba(255,60,10,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); }, add: true },
      nevoa: { fn: (g) => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 15); gr.addColorStop(0, 'rgba(210,218,228,.5)'); gr.addColorStop(1, 'rgba(210,218,228,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); }, add: false }
    }[tipo];
    const tex = canvasTex(32, 32, (g) => { g.clearRect(0, 0, 32, 32); cfg.fn(g); });
    return fxMat[tipo] = { tex, add: cfg.add };
  }
  function novo(tipo, x, y, z, vida, vx, vy, vz, esc, op) {
    const mt = matFx(tipo), s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mt.tex, transparent: true, opacity: 0, depthWrite: false, blending: mt.add ? THREE.AdditiveBlending : THREE.NormalBlending }));
    s.position.set(x, y, z); s.scale.setScalar(esc); scene.add(s); PX.push({ s, tipo, vida, t0: vida, vx, vy, vz, esc, op, f: Math.random() * 9 });
  }
  const contar = tipo => PX.reduce((n, p) => n + (p.tipo === tipo ? 1 : 0), 0);
  let tVapor = 2, tClima = 0;
  function particulas(dt) {
    const S = Sx(); if (!S || C.mode !== 'jogo' || S.dead || robo) return;
    const q = (window.__plat && window.__plat.O && window.__plat.O.qual) || 'alta'; if (q === 'minima') { limparParticulas(); return; }
    const lim = q === 'baixa' ? .5 : 1, fora = !!(P.room && P.room.fora), mes = new Date().getMonth();
    const clima = C.L6V ? C.L6V.clima : null, cx = camera.position.x, cz = camera.position.z, t = C.perf();
    tClima += dt;
    if (tClima > .12) {
      tClima = 0;
      // traças em volta das lâmpadas acesas (noites sem temporal)
      if (!fora && !(clima && clima.nome === 'Temporal') && contar('traca') < 6 * lim) { const Ls = W.lampadas.filter(L => L.ligada && !L.l6off && L.luz.intensity > .5 && Math.hypot(L.x - cx, L.z - cz) < 9); if (Ls.length) { const L = Ls[Math.floor(Math.random() * Ls.length)]; novo('traca', L.x, 2.4, L.z, 14, 0, 0, 0, .14, .9); PX[PX.length - 1].lamp = L; } }
      // folhas no vento do temporal
      if (fora && clima && clima.nome === 'Temporal' && contar('folha') < 22 * lim) novo('folha', cx + rand(-14, 14), rand(.4, 3), cz + rand(-14, 14), 5, rand(4, 8), rand(-.4, .4), rand(-2, 2), .16, .95);
      // vaga-lumes de setembro a dezembro
      if (fora && mes >= 8 && mes <= 11 && W.mapa === 'estrada' && contar('vagalume') < 22 * lim) novo('vagalume', cx + rand(-11, 11), rand(.4, 2.2), cz + rand(-11, 11), 9, rand(-.4, .4), rand(-.1, .2), rand(-.4, .4), .22, 1);
      // brasas flutuando nas paletas de fogo e depois de muitas mortes
      if (fora && (D.mortes >= 20 || /brasa|calor/.test((C.L6V && C.L6V.paletaNome && C.L6V.paletaNome()) || '')) && contar('brasa') < 16 * lim) novo('brasa', cx + rand(-9, 9), rand(.2, 1), cz + rand(-9, 9), 5, rand(-.3, .3), rand(.5, 1.1), rand(-.3, .3), .09, 1);
      // fiapos de neblina rente ao chão
      if (fora && clima && /Neblina/.test(clima.nome) && contar('nevoa') < 9 * lim) novo('nevoa', cx + rand(-14, 14), rand(.3, .9), cz + rand(-14, 14), 12, rand(-.4, .4), 0, rand(-.4, .4), rand(3, 5), .55);
    }
    // vapor da respiração de junho a agosto (e quando ela corre)
    if (fora && mes >= 5 && mes <= 7) {
      tVapor -= dt; if (tVapor <= 0) { tVapor = P.sprinting ? 1.5 : 3.4; const f = new THREE.Vector3(); camera.getWorldDirection(f); novo('vapor', cx + f.x * .5, camera.position.y - .12, cz + f.z * .5, 1.5, f.x * .4, .12, f.z * .4, .22, .9); }
    }
    const ge = $('#l6b-geada'); if (ge) ge.style.opacity = fora && mes >= 5 && mes <= 7 && C.mode === 'jogo' ? '1' : '0'; // geada nas bordas do vidro
    for (let i = PX.length - 1; i >= 0; i--) {
      const p = PX[i]; p.vida -= dt; const k = p.vida / p.t0;
      if (p.vida <= 0) { scene.remove(p.s); p.s.material.dispose(); PX.splice(i, 1); continue; }
      const env = Math.min(1, (1 - k) * 4, k * 3) * p.op;
      p.s.material.opacity = p.tipo === 'vagalume' ? env * (.35 + .65 * Math.max(0, Math.sin(t * 3 + p.f))) : env;
      if (p.tipo === 'traca' && p.lamp) { p.f += dt * 7; p.s.position.set(p.lamp.x + Math.cos(p.f * .6) * .32, 2.45 + Math.sin(p.f * 1.3) * .22, p.lamp.z + Math.sin(p.f * .6) * .32); p.s.scale.set(.14 + Math.sin(p.f * 6) * .05, .14, 1); continue; }
      p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.s.position.z += p.vz * dt;
      if (p.tipo === 'folha') { p.s.material.rotation += dt * 6; p.vy -= dt * .4; }
      if (p.tipo === 'vapor') p.s.scale.setScalar(p.esc * (1 + (1 - k) * 2.2));
    }
  }
  function limparParticulas() { for (const p of PX) { scene.remove(p.s); p.s.material.dispose(); } PX.length = 0; }

  // =====================================================================
  // montagem dos filhos e ganchos
  // =====================================================================
  const U = { THREE, C, W, P, M, ANA, PROC, scene, camera, renderer, canvas, OPT, toast, conquista, canvasTex, rand, clamp, lerp, robo, lsGet, lsSet, seguro, hashStr, prng, dados: () => D, raro: () => RARO, paredesLivres, mem, salvarMem, $ };
  const LEN = instalarLentesL6B(U);
  const CAR = instalarCartoesL6B(U);

  const api = {
    get l6v() { return C.L6V; }, get raro() { return RARO; }, get idade() { return idadeAplicada; }, get adaptacao() { return olhos.adapt; },
    mapa() {
      if (robo) return;
      seguro(() => { lerDados(); sortear(); });
      seguro(envelhecer); seguro(marcasMortes); seguro(fachada); seguro(velasCemiterio); seguro(paredesDoMapa);
      seguro(() => { janelaApagou = false; limparParticulas(); if (boltSpr) { scene.remove(boltSpr); boltSpr = null; } });
      seguro(() => LEN.mapa()); seguro(() => CAR.mapa());
    },
    posClima() { if (robo) return; seguro(() => ambiente()); },
    tick(dt) {
      if (robo) return;
      seguro(() => olhos(dt)); seguro(() => sombras(dt)); seguro(() => particulas(dt)); seguro(() => raioNoCeu(dt));
      seguro(fachadaTick); seguro(() => velasTick(dt)); seguro(() => paredesTick(dt));
      seguro(() => LEN.tick(dt)); seguro(() => CAR.tick(dt));
    },
    depois() { if (robo) return; seguro(() => LEN.depois()); seguro(() => CAR.depois()); }
  };
  window.__l6b = api;
  return api;
}
