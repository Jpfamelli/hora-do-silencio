// =====================================================================
// LOTE 6 (2ª rodada) — o que a tela guarda de você
// Retrato da última morte no título, o pior momento da noite, cartão para postar, time-lapse do fim,
// vitral das conquistas, relógio de pulso, marcas e trajes na mão da Lia e a vertigem do primeiro encontro.
// Tudo passivo e à prova de erro; sob o teste automático (navigator.webdriver) nada daqui roda.
// =====================================================================
export function instalarCartoesL6B(U) {
  const { THREE, C, W, P, M, ANA, PROC, canvas, OPT, toast, clamp, robo, seguro, lsGet, lsSet, mem, salvarMem, $ } = U;
  const K_ULT = 'hora-silencio-l6b-ultima', K_PIOR = 'hora-silencio-l6b-pior';
  const R = () => window.ROTEIRO || {};
  const dados = () => U.dados();
  const css = (id, txt) => { if (document.getElementById(id)) return; const s = document.createElement('style'); s.id = id; s.textContent = txt; document.head.appendChild(s); };

  css('l6b-css', `
  .l6b-pol{position:absolute;background:#d9d2c0;padding:7px 7px 24px;box-shadow:0 6px 18px rgba(0,0,0,.7);font:12px "Special Elite",Georgia,monospace;color:#2a2418;text-align:center;pointer-events:none;z-index:0}
  .l6b-pol img{display:block;width:150px;height:84px;object-fit:cover;filter:sepia(.5) contrast(1.1)}
  .l6b-pol b{position:absolute;left:0;right:0;bottom:4px;font-weight:400;font-size:11px;letter-spacing:.04em}
  .l6b-pol .x{position:absolute;left:62%;top:22%;width:46px;height:46px;pointer-events:none}
  #l6b-pol-t{left:3vw;bottom:5vh;transform:rotate(-4deg);opacity:.9}
  #l6b-pol-d{right:3vw;bottom:5vh;transform:rotate(3deg);opacity:.95}
  #l6b-vitral{position:absolute;right:2.4vw;top:12vh;width:110px;height:170px;pointer-events:none;opacity:.88;z-index:0}
  #l6b-relogio{position:fixed;right:-260px;bottom:-30px;width:230px;height:230px;z-index:7;pointer-events:none;transition:right .35s cubic-bezier(.2,.8,.2,1)}
  #l6b-relogio.on{right:10px}
  #l6b-lapso{display:block;margin:10px auto;border:1px solid rgba(214,208,186,.3);background:#0b0c0e;max-width:92vw}
  .l6b-btn{margin:6px auto;display:block}
  `);

  // ---------- captura de quadros (retrato da morte e pior momento) ----------
  const cp = document.createElement('canvas'); cp.width = 160; cp.height = 90; const cpg = cp.getContext('2d');
  const cg = document.createElement('canvas'); cg.width = 540; cg.height = 304; const cgg = cg.getContext('2d');
  let pedido = null, ultimo = lsGet(K_ULT, null), pior = lsGet(K_PIOR, null), piorRun = 0, piorT = 0, mortoAnt = false, fotoGrande = null, infoGrande = null;
  const horaTxt = S => `${String((21 + Math.floor((S ? S.tempo : 0) / 3600)) % 24).padStart(2, '0')}:${String(Math.floor((S ? S.tempo : 0) / 60) % 60).padStart(2, '0')}`;
  function vendoInspetor() { if (!M.ativo) return false; const d = new THREE.Vector3().subVectors(M.pos, C.camera.position), dist = d.length(); const f = new THREE.Vector3(); C.camera.getWorldDirection(f); return dist < 14 && f.dot(d.normalize()) > .55; }
  function capturar() {
    if (!pedido) return; const tipo = pedido; pedido = null; const S = C.S;
    cpg.drawImage(canvas, 0, 0, 160, 90); cgg.drawImage(canvas, 0, 0, 540, 304);
    fotoGrande = cg.toDataURL('image/jpeg', .8);
    const info = { sala: P.room ? P.room.nome : '', hora: horaTxt(S), cap: S ? S.chapter : 0, ins: tipo === 'morte' ? vendoInspetor() : false, fear: Math.round(S ? S.fear : 0) };
    infoGrande = info;
    const img = cp.toDataURL('image/jpeg', .6);
    if (tipo === 'morte') { ultimo = Object.assign({ img }, info); lsSet(K_ULT, ultimo); montarPolTitulo(); }
    else if (info.fear >= piorRun) { piorRun = info.fear; if (!pior || info.fear >= (pior.fear || 0) - 6) { pior = Object.assign({ img, data: new Date().toLocaleDateString('pt-BR') }, info); lsSet(K_PIOR, pior); } montarPolMorte(); }
  }

  // ---------- retrato da última morte (presa na parede do título) ----------
  let polT = null, polD = null;
  function polaroide(id, dados, rotulo) {
    const el = document.createElement('div'); el.className = 'l6b-pol'; el.id = id;
    el.innerHTML = `<img alt="" src="${dados.img}">${dados.ins ? '<svg class="x" viewBox="0 0 46 46"><path d="M6 6L40 40M40 6L6 40" stroke="#e9e3d0" stroke-width="5" stroke-linecap="round" opacity=".92"/></svg>' : ''}<b>${rotulo}</b>`;
    return el;
  }
  function montarPolTitulo() {
    const t = $('#title'); if (!t || !ultimo) return; if (polT) polT.remove();
    polT = polaroide('l6b-pol-t', ultimo, `${ultimo.hora} · ${String(ultimo.sala || '').slice(0, 18)}`); t.appendChild(polT);
  }
  function montarPolMorte() {
    const d = $('#death'); if (!d || !pior) return; if (polD) polD.remove();
    polD = polaroide('l6b-pol-d', pior, `o pior momento · ${pior.hora}`); d.appendChild(polD);
  }

  // ---------- cartão da noite (PNG 1080x1350) ----------
  function cartao() {
    const S = C.S; if (!S) return; const w = 1080, h = 1350, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0c0d10'); bg.addColorStop(1, '#17120e'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2400; i++) { g.fillStyle = `rgba(214,208,186,${Math.random() * .05})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    g.textAlign = 'center'; g.fillStyle = '#cfc3a6'; g.font = 'bold 74px Georgia'; g.fillText('A HORA DO SILÊNCIO', w / 2, 130);
    g.font = 'italic 30px Georgia'; g.fillStyle = 'rgba(207,195,166,.7)'; g.fillText('o internato lembra de você', w / 2, 180);
    const desenhar = () => {
      g.save(); g.translate(w / 2, 520); g.rotate(-.012); g.fillStyle = '#d9d2c0'; g.fillRect(-440, -280, 880, 640); g.drawImage(imgF || cg, -420, -260, 840, 473); g.restore();
      g.strokeStyle = 'rgba(232,228,214,.55)'; g.lineWidth = 4; g.lineCap = 'round'; for (let i = 0; i < 9; i++) { g.beginPath(); const x = 80 + Math.random() * 920, y = 800 + Math.random() * 40; g.moveTo(x, y); g.lineTo(x + 40 + Math.random() * 80, y + (Math.random() - .5) * 14); g.stroke(); } // giz
      const clima = (C.L6V && C.L6V.climaNome && C.L6V.climaNome()) || '', pal = (C.L6V && C.L6V.paletaNome && C.L6V.paletaNome()) || '';
      const min = Math.floor(S.tempo / 60), seg = Math.floor(S.tempo) % 60;
      g.fillStyle = '#e8dfc6'; g.font = 'bold 44px "Special Elite",Georgia'; g.fillText(`semente ${S.semente || '—'}`, w / 2, 920);
      g.font = '38px Georgia'; g.fillStyle = '#cfc3a6';
      const linhas = [`tempo da noite  ${min}min ${String(seg).padStart(2, '0')}s`, `encontrada  ${S.mortes}x`, `clima  ${clima || 'seca'}`, `luz  ${pal || 'lua azulada'}`];
      linhas.forEach((l, i) => g.fillText(l, w / 2, 1000 + i * 62));
      g.font = 'italic 28px Georgia'; g.fillStyle = 'rgba(207,195,166,.55)'; g.fillText('mesma semente, mesma noite — consegue chegar mais longe?', w / 2, 1292);
      c.toBlob(b => { if (!b) return; const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = `hora-do-silencio-${S.semente || 'noite'}.png`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); toast('Cartão da noite salvo como imagem.'); }, 'image/png');
    };
    let imgF = null;
    if (fotoGrande) { imgF = new Image(); imgF.onload = desenhar; imgF.onerror = () => { imgF = null; desenhar(); }; imgF.src = fotoGrande; } else { g.fillStyle = '#d9d2c0'; desenhar(); }
  }
  function botoes() {
    for (const [pai, ref] of [['#death', null], ['#ending', '#e-menu']]) {
      const el = $(pai); if (!el || el.querySelector('.l6b-btn')) continue;
      const b = document.createElement('button'); b.className = 'btn l6b-btn'; b.textContent = 'Gerar cartão da noite'; b.onclick = e => { e.stopPropagation(); seguro(cartao); };
      const r = ref ? $(ref) : null; if (r && r.parentNode === el) el.insertBefore(b, r); else el.appendChild(b);
    }
  }

  // ---------- time-lapse da noite (planta em 2D, 20 s) ----------
  let lapso = { mapas: {}, ordem: [], mortes: {}, nSem: '' }, ampMapa = '', rectsMapa = [], amostraT = 0, mortesAnt = 0;
  function registrarMapa() {
    const S = C.S; if (!S) return;
    if (S.semente !== lapso.nSem || (S.tempo < 2 && lapso.ordem.length > 0 && !S._l6bRec)) { lapso = { mapas: {}, ordem: [], mortes: {}, nSem: S.semente }; }
    S._l6bRec = true; ampMapa = W.mapa;
    if (!lapso.mapas[W.mapa]) { lapso.mapas[W.mapa] = { pts: [], rects: [] }; lapso.ordem.push(W.mapa); }
    const m = lapso.mapas[W.mapa]; if (!m.rects.length) m.rects = W.colliders.filter(c => c.maxX - c.minX > .25 || c.maxZ - c.minZ > .25).slice(0, 700).map(c => [c.minX, c.maxX, c.minZ, c.maxZ]);
  }
  function amostrar(dt) {
    const S = C.S; if (!S || C.mode !== 'jogo' || S.dead || S.fim || !lapso.mapas[W.mapa]) return;
    amostraT -= dt; if (amostraT > 0) return; amostraT = .5; const m = lapso.mapas[W.mapa]; if (m.pts.length > 2600) return;
    const v = (o, ativo) => ativo ? [+o.pos.x.toFixed(1), +o.pos.z.toFixed(1)] : null;
    m.pts.push([+P.pos.x.toFixed(1), +P.pos.z.toFixed(1), v(M, M.ativo), v(ANA, ANA.ativa), PROC.fase === 'passando' && PROC.pos ? [+PROC.pos.x.toFixed(1), +PROC.pos.z.toFixed(1)] : null]);
    if (S.mortes > mortesAnt) { (lapso.mortes[W.mapa] = lapso.mortes[W.mapa] || []).push([+P.pos.x.toFixed(1), +P.pos.z.toFixed(1)]); }
    mortesAnt = S.mortes;
  }
  let lapsoEl = null, lapsoT = 0;
  function mostrarLapso() {
    const fim = $('#ending'); if (!fim || fim.hidden) { if (lapsoEl) lapsoEl.style.display = 'none'; lapsoT = 0; return; }
    if (!lapso.ordem.length) return;
    if (!lapsoEl) { lapsoEl = document.createElement('canvas'); lapsoEl.id = 'l6b-lapso'; lapsoEl.width = 420; lapsoEl.height = 230; const ref = $('#e-stats'); ref && ref.parentNode ? ref.parentNode.insertBefore(lapsoEl, ref.nextSibling) : fim.appendChild(lapsoEl); }
    lapsoEl.style.display = 'block'; lapsoT += 1 / 60;
    const g = lapsoEl.getContext('2d'), w = lapsoEl.width, h = lapsoEl.height; g.fillStyle = '#0b0c0e'; g.fillRect(0, 0, w, h);
    const total = 20, dur = total / lapso.ordem.length, t = lapsoT % (total + 3), idx = Math.min(lapso.ordem.length - 1, Math.floor(t / dur)); if (t > total) { g.fillStyle = 'rgba(207,195,166,.6)'; g.font = '14px Georgia'; g.textAlign = 'center'; g.fillText('fim da noite', w / 2, h / 2); return; }
    const id = lapso.ordem[idx], m = lapso.mapas[id], k = clamp((t - idx * dur) / dur, 0, 1);
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const r of m.rects) { x0 = Math.min(x0, r[0]); x1 = Math.max(x1, r[1]); z0 = Math.min(z0, r[2]); z1 = Math.max(z1, r[3]); } for (const p of m.pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); }
    if (!isFinite(x0)) return; const esc = Math.min((w - 30) / Math.max(1, x1 - x0), (h - 40) / Math.max(1, z1 - z0)), ox = (w - (x1 - x0) * esc) / 2, oz = (h - (z1 - z0) * esc) / 2 + 6;
    const X = x => ox + (x - x0) * esc, Z = z => oz + (z - z0) * esc;
    g.fillStyle = 'rgba(120,112,96,.55)'; for (const r of m.rects) g.fillRect(X(r[0]), Z(r[2]), Math.max(1, (r[1] - r[0]) * esc), Math.max(1, (r[3] - r[2]) * esc));
    const n = Math.max(1, Math.floor(m.pts.length * k)); g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < n; i++) { const p = m.pts[i]; i ? g.lineTo(X(p[0]), Z(p[1])) : g.moveTo(X(p[0]), Z(p[1])); } g.stroke();
    const p = m.pts[Math.min(m.pts.length - 1, n - 1)] || [0, 0, null, null, null], pt = (q, cor, r) => { if (!q) return; g.fillStyle = cor; g.beginPath(); g.arc(X(q[0]), Z(q[1]), r, 0, 7); g.fill(); };
    pt(p[2], '#e0372f', 4); pt(p[3], '#e8d49a', 3.5); pt(p[4], '#e8a24a', 4); pt([p[0], p[1]], '#ffffff', 4);
    g.strokeStyle = '#cfc3a6'; g.lineWidth = 2; for (const q of (lapso.mortes[id] || [])) { const a = X(q[0]), b = Z(q[1]); g.beginPath(); g.moveTo(a - 4, b - 4); g.lineTo(a + 4, b + 4); g.moveTo(a + 4, b - 4); g.lineTo(a - 4, b + 4); g.stroke(); } // cruzes onde ela caiu
    g.fillStyle = 'rgba(207,195,166,.7)'; g.font = '12px Georgia'; g.textAlign = 'left'; g.fillText(id.toUpperCase() + '  ·  a noite em 20 segundos', 8, 16);
  }

  // ---------- vitral das conquistas na tela de título ----------
  let vitral = null, vitralN = -1;
  function desenharVitral() {
    const t = $('#title'); if (!t) return; const lista = (R().conquistas || []), cq = lsGet('hora-silencio-v2-conq', {}); const n = lista.length, ok = lista.filter(x => cq[x.id]).length;
    if (!vitral) { vitral = document.createElement('canvas'); vitral.id = 'l6b-vitral'; vitral.width = 110; vitral.height = 170; t.appendChild(vitral); }
    if (ok === vitralN || !n) return; vitralN = ok;
    const g = vitral.getContext('2d'), w = 110, h = 170; g.clearRect(0, 0, w, h);
    g.save(); g.beginPath(); g.moveTo(4, h - 3); g.lineTo(4, 62); g.quadraticCurveTo(4, 4, w / 2, 3); g.quadraticCurveTo(w - 4, 4, w - 4, 62); g.lineTo(w - 4, h - 3); g.closePath(); g.clip();
    const cols = Math.max(4, Math.ceil(Math.sqrt(n * .62))), rows = Math.ceil(n / cols), cw = (w - 8) / cols, ch = (h - 6) / rows, todos = ok >= n;
    if (todos) { const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, '#ffd9a0'); gr.addColorStop(1, '#ff9a6a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    lista.forEach((c, i) => {
      const x = 4 + (i % cols) * cw, y = 3 + Math.floor(i / cols) * ch, h0 = (i * 47) % 360;
      if (cq[c.id]) g.fillStyle = `hsla(${h0},62%,52%,${todos ? .55 : .85})`; else g.fillStyle = c.secreta ? 'rgba(210,214,220,.2)' : 'rgba(18,18,22,.78)'; // secretas em vidro fosco
      g.fillRect(x, y, cw, ch);
    });
    g.strokeStyle = 'rgba(10,10,10,.95)'; g.lineWidth = 1.2; for (let i = 0; i <= cols; i++) { g.beginPath(); g.moveTo(4 + i * cw, 0); g.lineTo(4 + i * cw, h); g.stroke(); } for (let j = 0; j <= rows; j++) { g.beginPath(); g.moveTo(0, 3 + j * ch); g.lineTo(w, 3 + j * ch); g.stroke(); }
    g.restore(); g.strokeStyle = '#111'; g.lineWidth = 3; g.beginPath(); g.moveTo(2, h - 2); g.lineTo(2, 62); g.quadraticCurveTo(2, 2, w / 2, 1); g.quadraticCurveTo(w - 2, 2, w - 2, 62); g.lineTo(w - 2, h - 2); g.stroke();
  }

  // ---------- relógio de pulso (segure ;) ----------
  let rel = null, relOn = false;
  function garantirRelogio() {
    if (rel) return; rel = document.createElement('canvas'); rel.id = 'l6b-relogio'; rel.width = 230; rel.height = 230; rel.setAttribute('aria-hidden', 'true'); document.body.appendChild(rel);
  }
  function relogio() {
    const S = C.S; garantirRelogio(); const on = relOn && C.mode === 'jogo' && S && !S.dead && !S.fim; rel.classList.toggle('on', !!on); if (!on) return;
    const g = rel.getContext('2d'); g.clearRect(0, 0, 230, 230);
    g.fillStyle = '#26282b'; g.save(); g.translate(115, 115); g.rotate(-.5); g.fillRect(-150, -34, 150, 68); g.restore(); // a manga
    g.fillStyle = '#8a6a4a'; g.save(); g.translate(115, 115); g.rotate(-.5); g.fillRect(-60, -24, 60, 48); g.restore(); // a pulseira
    g.fillStyle = '#d8d0b8'; g.beginPath(); g.arc(150, 85, 62, 0, 7); g.fill(); g.strokeStyle = '#3a3226'; g.lineWidth = 5; g.stroke();
    g.fillStyle = '#1a1710'; g.textAlign = 'center'; g.font = '13px Georgia'; for (let i = 1; i <= 12; i++) { const a = i / 12 * 6.2832; g.fillText(['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][i - 1], 150 + Math.sin(a) * 47, 90 - Math.cos(a) * 47); }
    const t = S.tempo, hh = (21 + t / 3600) % 12, mm = (t / 60) % 60, ss = t % 60, ca = S.capT;
    const mao = (ang, len, esp, cor) => { g.strokeStyle = cor; g.lineWidth = esp; g.lineCap = 'round'; g.beginPath(); g.moveTo(150, 85); g.lineTo(150 + Math.sin(ang) * len, 85 - Math.cos(ang) * len); g.stroke(); };
    mao(hh / 12 * 6.2832, 28, 5, '#1a1710'); mao(mm / 60 * 6.2832, 42, 3, '#1a1710'); mao(ss / 60 * 6.2832, 46, 1.4, '#a02020');
    const cm = Math.floor(ca / 60), cs = Math.floor(ca) % 60; g.fillStyle = '#2a2418'; g.font = 'bold 14px "Special Elite",Georgia'; g.fillText(`cap. ${['0', 'I', 'II', 'III', 'IV', 'V'][S.chapter] || S.chapter}  ${cm}:${String(cs).padStart(2, '0')}`, 150, 120);
  }

  // ---------- a mão da Lia: marcas, cicatrizes e trajes ----------
  let mao = null, maoMarcas = false;
  const TRAJES = [
    { id: 'moletom', nome: 'moletom cinzento', lib: () => true },
    { id: 'uniforme', nome: 'manga do uniforme do internato', lib: d => d.partidas >= 3, mol: 0x2c3a5c },
    { id: 'couro', nome: 'couro velho do Davi', lib: d => d.verdadeiro >= 1, mol: 0x5a3c22 },
    { id: 'la', nome: 'luva de lã da Celeste', lib: d => d.finais >= 2, pele: 0x8e97a6 },
    { id: 'atadura', nome: 'mão enfaixada', lib: d => d.mortes >= 15, band: true },
    { id: 'molhada', nome: 'manga encharcada', lib: d => d.concluidas >= 1 || d.partidas >= 8, mol: 0x161e28 }
  ];
  function aplicarTraje() {
    mao = mao || (C.VIS && C.VIS.mao ? C.VIS.mao() : null); if (!mao) return; const d = dados(), id = mem.traje || 'moletom', T = TRAJES.find(x => x.id === id && x.lib(d)) || TRAJES[0];
    mao.matMol.color.setHex(T.mol || 0xffffff); mao.matPele.color.setHex(T.pele || 0xffffff);
    if (mao.band) mao.band.forEach(b => { b.visible = !!T.band; });
  }
  function marcasNaMao() {
    mao = mao || (C.VIS && C.VIS.mao ? C.VIS.mao() : null); if (!mao || maoMarcas) return; maoMarcas = true; const d = dados();
    const { braco, mao: m } = mao; const T3 = THREE;
    if (d.verdadeiro >= 1) { const t = new T3.Mesh(new T3.TorusGeometry(.046, .0045, 6, 16), new T3.MeshLambertMaterial({ color: 0x9a1c26 })); t.position.set(.012, -.018, .074); braco.add(t); } // pulseira de fita do Davi
    if (d.silencio >= 1) { const dedo = m.children[3]; if (dedo) { const a = new T3.Mesh(new T3.TorusGeometry(.0105, .0026, 6, 12), new T3.MeshLambertMaterial({ color: 0xb09a68 })); a.rotation.x = Math.PI / 2; a.position.y = .004; dedo.add(a); } } // anel de corda
    if (d.mortes >= 10) { const c = new T3.Mesh(new T3.BoxGeometry(.034, .004, .02), new T3.MeshLambertMaterial({ color: 0xdccfaa })); c.position.set(.006, .0115, -.012); c.rotation.y = .3; m.add(c); const f = new T3.Mesh(new T3.BoxGeometry(.012, .0045, .003), new T3.MeshLambertMaterial({ color: 0x9a2a2a })); f.position.set(.006, .0138, -.012); f.rotation.y = .3; m.add(f); } // curativo de criança
    const nA = d.mortes >= 40 ? 4 : d.mortes >= 15 ? 3 : d.mortes >= 5 ? 1 : 0; // arranhões proporcionais às mortes
    for (let i = 0; i < nA; i++) { const a = new T3.Mesh(new T3.BoxGeometry(.036, .0009, .0025), new T3.MeshLambertMaterial({ color: 0x6a2222 })); a.position.set(.004 + i * .002, .0105, .026 - i * .011); a.rotation.y = .5 + i * .12; m.add(a); }
    mao.band = []; for (let i = 0; i < 3; i++) { const b = new T3.Mesh(new T3.BoxGeometry(.062, .052, .012), new T3.MeshLambertMaterial({ color: 0xcfc6b0 })); b.position.set(.006, -.016, -.02 + i * .026); b.visible = false; m.add(b); mao.band.push(b); } // ataduras
    const fuligem = d.concluidas >= 1 ? new T3.Mesh(new T3.BoxGeometry(.03, .0008, .02), new T3.MeshLambertMaterial({ color: 0x101010, transparent: true, opacity: .55 })) : null; if (fuligem) { fuligem.position.set(-.006, .0106, .008); m.add(fuligem); } // fuligem de quem já viu o incêndio
    aplicarTraje();
  }
  function trocarTraje() {
    const d = dados(), livres = TRAJES.filter(t => t.lib(d)); if (livres.length < 2) { toast('Você ainda não ganhou outra roupa. Os finais e as noites liberam.'); return; }
    const i = livres.findIndex(t => t.id === (mem.traje || 'moletom')), n = livres[(i + 1) % livres.length]; mem.traje = n.id; salvarMem(); aplicarTraje(); toast('Roupa: ' + n.nome + '.');
  }
  if (typeof document !== 'undefined') addEventListener('keydown', e => {
    seguro(() => {
      if (C.mode !== 'jogo' || e.repeat) return; const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.key === ';') relOn = true; else if (e.key === '\\' || e.key === '´') trocarTraje();
    });
  });
  if (typeof document !== 'undefined') addEventListener('keyup', e => { if (e.key === ';') relOn = false; });

  // ---------- vertigem no primeiro encontro com cada entidade (só na primeira vez) ----------
  let vert = null;
  function vertigem(dt) {
    const S = C.S; if (!S || C.mode !== 'jogo' || S.dead) return; const cam = C.camera, f = new THREE.Vector3(); cam.getWorldDirection(f);
    if (!vert) {
      const olha = (o) => { const d = new THREE.Vector3().subVectors(o, cam.position), dist = d.length(); return dist < 9 && f.dot(d.normalize()) > .45; };
      const quem = M.ativo && !mem.vistos.inspetor && olha(M.pos) ? 'inspetor' : ANA.ativa && !mem.vistos.ana && olha(ANA.pos) ? 'ana' : PROC.fase === 'passando' && !mem.vistos.procissao ? 'procissao' : '';
      if (quem && !P.zoomFov) { mem.vistos[quem] = 1; salvarMem(); vert = { t: 0, base: OPT.fov || 72 }; }
      return;
    }
    vert.t += dt; const u = vert.t / 1.2; if (u >= 1) { if (P.zoomFov) P.zoomFov = 0; vert = null; return; }
    const s = Math.sin(Math.PI * u); P.zoomFov = vert.base + 30 * s; // o fundo estica enquanto a câmera avança
    cam.position.x += f.x * .45 * s; cam.position.z += f.z * .45 * s;
  }

  function atualizarDOM() {
    const t = $('#title'), morto = $('#death');
    if (polT) polT.style.display = t && !t.hidden ? '' : 'none'; if (polD) polD.style.display = morto && !morto.hidden ? '' : 'none';
    if (t && !t.hidden) seguro(desenharVitral);
  }
  let domT = 0;
  return {
    mapa() { seguro(registrarMapa); seguro(marcasNaMao); seguro(aplicarTraje); seguro(botoes); if (!polT && ultimo) montarPolTitulo(); if (!polD && pior) montarPolMorte(); },
    tick(dt) {
      const S = C.S;
      domT -= dt; if (domT <= 0) { domT = .5; seguro(atualizarDOM); seguro(botoes); }
      seguro(() => relogio());
      seguro(() => mostrarLapso());
      if (!S) return;
      seguro(() => vertigem(dt)); seguro(() => amostrar(dt));
      if (S.dead && !mortoAnt && !pedido) pedido = 'morte'; mortoAnt = !!S.dead;
      if (C.mode === 'jogo' && !S.dead && !S.fim) { piorT -= dt; if (S.fear >= 95 && piorT <= 0) { piorT = 8; if (!pedido) pedido = 'pior'; } }
      if (S.tempo < 2) piorRun = 0;
    },
    depois() { seguro(capturar); }
  };
}
