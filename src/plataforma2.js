// A HORA DO SILÊNCIO — Plataforma e acessibilidade, lote 2.
// Lápide para compartilhar (morte e final), paleta para daltonismo nas luzes do mundo,
// o segredo do 14 de março, compartilhar o jogo pelo título e o aquecimento dos materiais ao trocar de mapa.
// Instalado por src/plataforma.js (instalarPlat2); não mexe no motor além do contexto que recebe.

const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function instalarPlat2(C, U) {
  const { O } = U;
  const R = C.R, THREE = C.THREE;

  // ===================================================================
  // LÁPIDE: um cartão em canvas para mandar no grupo
  // ===================================================================
  const QUEM = { inspetor: 'pega pelo Inspetor', ana: 'achada pela menina que conta', procissao: 'levada pela Procissão' };
  const CTX = {
    agarrao: 'sem conseguir se soltar das mãos dele', bote: 'no bote, sem tempo de recuar', escondida: 'arrancada de dentro do armário',
    pilha: 'com a lanterna morrendo', correu: 'correndo no corredor', respirou: 'por respirar alto demais', agua: 'com a água pelos joelhos',
    chamado: 'atendendo a uma voz que chamava', perto: 'fora da cama', semLuz: 'de lanterna apagada', piscou: 'quando a luz piscou',
    costas: 'de costas para ela', ana_armario: 'no armário onde ela entrou', fora: 'fora do esconderijo', proc_luz: 'de luz acesa no caminho dela'
  };
  const EPI = {
    inspetor: ['"Quem fala na Hora vai para o armário."', '"Ele não tem pressa."', '"Ele ouviu."'],
    ana: ['"...oito, nove, DEZ."', '"Achei você."', '"Agora é a sua vez de contar."'],
    procissao: ['"Todo mundo volta para a cama."', '"Fila indiana. Olhos no chão."'],
    final: ['"O sino parou. Por enquanto."', '"Saiu antes da última badalada."', '"Nove badaladas. Nenhuma para ela."']
  };
  const BASE_MIN = [20 * 60 + 31, 20 * 60 + 47, 21 * 60, 21 * 60 + 18, 21 * 60 + 36, 21 * 60 + 52];
  function horaDoJogo(S) {
    const m = (BASE_MIN[S.chapter] || 21 * 60) + Math.floor((S.capT || 0) / 20);
    return `${Math.floor(m / 60) % 24}h${String(m % 60).padStart(2, '0')}`;
  }
  function nomeSala() { const r = C.P && C.P.room; return r && r.nome ? r.nome : ''; }
  function nomeJogador() { const i = $('#o-nome'); const v = i && i.value ? i.value.replace(/[<>]/g, '').trim().slice(0, 16) : ''; return v; }
  function semente(str) { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
  function linkJogo() { const c = document.querySelector('link[rel=canonical]'); return (c && c.href) || (location.origin + location.pathname); }
  function dadosLapide(tipo) {
    const S = C.S || {}, cap = R.capitulos[S.chapter] || { titulo: '' }, nome = nomeJogador();
    const capCurto = (cap.titulo || '').split(' — ')[0];
    if (tipo === 'final') {
      const tit = ($('#e-tit') && $('#e-tit').textContent) || 'A Hora';
      return { topo: 'AQUI NÃO JAZ', nome: nome || 'LIA MORAES', sub: nome ? 'no lugar da Lia' : '', datas: '1965 — ?',
        causa: `saiu do São Lázaro às ${horaDoJogo(S)}`, linha2: `final: ${tit}`, linha3: `${S.mortes || 0} ${S.mortes === 1 ? 'volta' : 'voltas'} até sair · ${Math.round((S.tempo || 0) / 60)} min`,
        epi: EPI.final, quem: 'final' };
    }
    const quem = S.causa || 'inspetor', ctx = S.causaCtx || 'perto', sala = nomeSala();
    return { topo: 'AQUI JAZ', nome: nome || 'LIA MORAES', sub: nome ? 'no lugar da Lia' : '', datas: '1965 — 1994',
      causa: `${QUEM[quem] || 'perdida na Hora'} ${CTX[ctx] || 'fora da cama'}, às ${horaDoJogo(S)}`,
      linha2: sala ? `${sala} · ${capCurto}` : capCurto, linha3: `na volta nº ${Math.max(1, S.mortes || 1)}`,
      epi: EPI[quem] || EPI.inspetor, quem };
  }
  function quebrar(g, txt, larg) {
    const ps = txt.split(' '), ls = []; let l = '';
    for (const p of ps) { const t = l ? l + ' ' + p : p; if (g.measureText(t).width > larg && l) { ls.push(l); l = p; } else l = t; }
    if (l) ls.push(l); return ls;
  }
  function gravar(g, txt, x, y, font, cor = '#24221e') {
    g.font = font; g.textAlign = 'center';
    g.fillStyle = 'rgba(190,184,170,.28)'; g.fillText(txt, x + 1.2, y + 1.6); // borda de luz do entalhe
    g.fillStyle = cor; g.fillText(txt, x, y);
  }
  function desenharLapide(d) {
    const W = 640, H = 860, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d'), rnd = semente(d.nome + d.causa);
    const serif = '"IM Fell English SC", Georgia, serif', ital = 'italic 22px "IM Fell English", Georgia, serif', mono = '"Special Elite", "Courier New", monospace';
    // noite e névoa
    let gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#05070a'); gr.addColorStop(.7, '#0b0d0e'); gr.addColorStop(1, '#030303');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(160,170,180,${.012 + rnd() * .02})`; g.beginPath(); g.ellipse(rnd() * W, 520 + rnd() * 260, 80 + rnd() * 160, 14 + rnd() * 26, 0, 0, 7); g.fill(); }
    // chuva fina
    g.strokeStyle = 'rgba(180,190,200,.07)'; g.lineWidth = 1;
    for (let i = 0; i < 160; i++) { const x = rnd() * W, y = rnd() * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 16); g.stroke(); }
    // a pedra
    const x0 = 110, x1 = W - 110, topo = 120, base = 740, cx = W / 2;
    const forma = () => { g.beginPath(); g.moveTo(x0, base); g.lineTo(x0, topo + 150); g.bezierCurveTo(x0, topo - 10, x1, topo - 10, x1, topo + 150); g.lineTo(x1, base); g.closePath(); };
    g.save(); forma(); g.clip();
    gr = g.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, '#3b3935'); gr.addColorStop(.45, '#64615a'); gr.addColorStop(1, '#2c2a27');
    g.fillStyle = gr; g.fillRect(x0, topo - 20, x1 - x0, base - topo + 20);
    for (let i = 0; i < 9000; i++) { const v = rnd(); g.fillStyle = v < .5 ? `rgba(0,0,0,${rnd() * .22})` : `rgba(220,215,200,${rnd() * .1})`; g.fillRect(x0 + rnd() * (x1 - x0), topo - 20 + rnd() * (base - topo + 20), 1 + rnd() * 2, 1 + rnd() * 2); }
    // musgo subindo da base e escorrido de chuva
    for (let i = 0; i < 260; i++) { const y = base - Math.pow(rnd(), 2.2) * 260; g.fillStyle = `rgba(${40 + rnd() * 30},${58 + rnd() * 30},${30 + rnd() * 16},${.12 + rnd() * .3})`; g.beginPath(); g.arc(x0 + rnd() * (x1 - x0), y, 2 + rnd() * 9, 0, 7); g.fill(); }
    for (let i = 0; i < 22; i++) { const x = x0 + rnd() * (x1 - x0), y = topo + rnd() * 200; gr = g.createLinearGradient(0, y, 0, y + 260); gr.addColorStop(0, 'rgba(0,0,0,.18)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x, y, 2 + rnd() * 5, 260); }
    // rachadura
    g.strokeStyle = 'rgba(10,9,8,.75)'; g.lineWidth = 1.6; g.beginPath(); let rx = x1 - 60 - rnd() * 80, ry = topo + 40; g.moveTo(rx, ry);
    for (let i = 0; i < 9; i++) { rx += (rnd() - .55) * 34; ry += 18 + rnd() * 26; g.lineTo(rx, ry); } g.stroke();
    // sombra da borda
    g.lineWidth = 26; g.strokeStyle = 'rgba(0,0,0,.35)'; forma(); g.stroke();
    g.restore();
    // um sino entalhado no topo
    g.save(); g.translate(cx, topo + 58); g.fillStyle = '#26241f';
    g.beginPath(); g.moveTo(-22, 26); g.quadraticCurveTo(-20, -18, 0, -20); g.quadraticCurveTo(20, -18, 22, 26); g.closePath(); g.fill();
    g.fillRect(-26, 24, 52, 5); g.beginPath(); g.arc(0, 34, 5, 0, 7); g.fill(); g.restore();
    // textos entalhados
    gravar(g, d.topo, cx, topo + 128, `24px ${serif}`, '#2b2924');
    g.font = `52px ${serif}`; let tam = 52; while (g.measureText(d.nome.toUpperCase()).width > x1 - x0 - 50 && tam > 26) { tam -= 2; g.font = `${tam}px ${serif}`; }
    gravar(g, d.nome.toUpperCase(), cx, topo + 196, `${tam}px ${serif}`, '#1d1b18');
    let y = topo + 228;
    if (d.sub) { gravar(g, d.sub, cx, y, ital, '#2b2924'); y += 32; }
    gravar(g, d.datas, cx, y + 6, `26px ${mono}`, '#26241f'); y += 46;
    g.fillStyle = 'rgba(20,18,16,.6)'; g.fillRect(cx - 90, y, 180, 2); y += 40;
    g.font = 'italic 25px "IM Fell English", Georgia, serif';
    for (const l of quebrar(g, d.causa, x1 - x0 - 70)) { gravar(g, l, cx, y, 'italic 25px "IM Fell English", Georgia, serif', '#1f1d1a'); y += 32; }
    y += 8; gravar(g, d.linha2, cx, y, `19px ${mono}`, '#2b2924'); y += 28;
    gravar(g, d.linha3, cx, y, `19px ${mono}`, '#2b2924'); y += 44;
    const epi = d.epi[Math.floor(rnd() * d.epi.length)];
    g.font = ital; for (const l of quebrar(g, epi, x1 - x0 - 80)) { gravar(g, l, cx, y, ital, '#33302a'); y += 28; }
    gravar(g, 'A HORA DO SILÊNCIO', cx, base - 26, `18px ${serif}`, '#2b2924');
    // chão, grama e uma vela acesa
    gr = g.createLinearGradient(0, base - 10, 0, H); gr.addColorStop(0, '#0d0f0b'); gr.addColorStop(1, '#020202'); g.fillStyle = gr; g.fillRect(0, base - 6, W, H - base + 6);
    for (let i = 0; i < 420; i++) { const x = rnd() * W, h = 6 + rnd() * 22; g.strokeStyle = `rgba(${30 + rnd() * 30},${44 + rnd() * 30},${26},${.5 + rnd() * .4})`; g.beginPath(); g.moveTo(x, base + 4 + rnd() * 10); g.lineTo(x + (rnd() - .5) * 8, base - h + 10); g.stroke(); }
    const vx = x0 + 40, vy = base + 6;
    gr = g.createRadialGradient(vx, vy - 40, 2, vx, vy - 40, 120); gr.addColorStop(0, 'rgba(255,170,80,.32)'); gr.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = gr; g.fillRect(vx - 130, vy - 170, 260, 260);
    g.fillStyle = '#d9ccae'; g.fillRect(vx - 6, vy - 40, 12, 40);
    g.fillStyle = '#ffcf7a'; g.beginPath(); g.ellipse(vx, vy - 50, 5, 11, 0, 0, 7); g.fill();
    // assinatura e link
    g.textAlign = 'center'; g.fillStyle = '#857a63'; g.font = `18px ${mono}`;
    g.fillText(linkJogo().replace(/^https?:\/\//, '').replace(/\/$/, ''), cx, H - 50);
    g.fillStyle = '#5d5546'; g.font = 'italic 16px "IM Fell English", Georgia, serif'; g.fillText('jogue de fone, no escuro', cx, H - 24);
    return cv;
  }
  let lapCv = null, lapDe = null, lapVoltaFoco = null;
  function montarLapide() {
    if ($('#lapide')) return;
    const el = document.createElement('div'); el.id = 'lapide'; el.className = 'screen'; el.hidden = true;
    el.innerHTML = `<div class="lp-caixa"><img id="lp-img" alt="A sua lápide"><div class="lp-lado"><h2>A sua lápide</h2><p>Mande para alguém. Veja se essa pessoa dura mais que você.</p>
      <button class="btn" id="lp-share">Compartilhar</button><button class="btn" id="lp-baixar">Baixar imagem</button><button class="btn" id="lp-copiar">Copiar o link do jogo</button><button class="btn" id="lp-voltar">Voltar</button><small id="lp-msg" aria-live="polite"></small></div></div>`;
    document.body.appendChild(el);
    $('#lp-voltar').onclick = fecharLapide;
    $('#lp-baixar').onclick = () => baixar();
    $('#lp-copiar').onclick = async () => U.feedback($('#lp-copiar'), await U.copiar(linkJogo()) ? 'Link copiado.' : 'Não deu para copiar.');
    $('#lp-share').onclick = compartilhar;
    el.addEventListener('click', e => { if (e.target === el) fecharLapide(); });
  }
  function nomeArquivo() { return 'lapide-hora-do-silencio.png'; }
  function baixar() {
    if (!lapCv) return;
    const fim = url => { const a = document.createElement('a'); a.href = url; a.download = nomeArquivo(); document.body.appendChild(a); a.click(); a.remove(); };
    try { lapCv.toBlob(b => { if (!b) { fim(lapCv.toDataURL('image/png')); return; } const u = URL.createObjectURL(b); fim(u); setTimeout(() => URL.revokeObjectURL(u), 4000); $('#lp-msg').textContent = 'Imagem guardada nos downloads.'; }, 'image/png'); }
    catch (e) { $('#lp-msg').textContent = 'Não deu para gerar a imagem neste navegador.'; }
  }
  function compartilhar() {
    if (!lapCv) return;
    const txt = `${dadosLapide(lapDe).causa}. Consegue durar mais? ${linkJogo()}`;
    lapCv.toBlob(async b => {
      try {
        const f = b && typeof File !== 'undefined' ? new File([b], nomeArquivo(), { type: 'image/png' }) : null;
        if (f && navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: 'A Hora do Silêncio', text: txt }); return; }
        if (navigator.share) { await navigator.share({ title: 'A Hora do Silêncio', text: txt, url: linkJogo() }); return; }
      } catch (e) { if (e && e.name === 'AbortError') return; }
      baixar(); U.copiar(txt).then(ok => { if (ok) $('#lp-msg').textContent = 'Imagem baixada e frase copiada: é só colar no grupo.'; });
    }, 'image/png');
  }
  function abrirLapide(tipo) {
    montarLapide();
    lapDe = tipo; lapVoltaFoco = document.activeElement;
    const pinta = () => { lapCv = desenharLapide(dadosLapide(tipo)); $('#lp-img').src = lapCv.toDataURL('image/png'); };
    pinta(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!$('#lapide').hidden) pinta(); }).catch(() => {});
    $('#lp-msg').textContent = ''; $('#lp-share').hidden = !navigator.share;
    $('#lapide').hidden = false;
    setTimeout(() => { const b = navigator.share ? $('#lp-share') : $('#lp-baixar'); if (b) b.focus(); }, 30);
  }
  function fecharLapide() {
    const el = $('#lapide'); if (!el || el.hidden) return;
    el.hidden = true; const v = lapVoltaFoco; lapVoltaFoco = null; if (v && v.focus && document.body.contains(v)) v.focus();
  }

  // ===================================================================
  // DALTONISMO: troca as cores que carregam significado nas luzes do mundo
  // (vela/lugar seguro e Procissão em âmbar, emergência vermelha, telas verdes)
  // ===================================================================
  const hsv = c => { const r = c.r, g = c.g, b = c.b, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0; if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h /= 6; if (h < 0) h += 1; } return { h, s: mx ? d / mx : 0, v: mx }; };
  const cls = c => { const { h, s, v } = hsv(c); if (s < .55 || v < .15) return null; if (h < .03 || h > .95) return 'verm'; if (h < .13) return 'ambar'; if (h > .2 && h < .47) return 'verde'; return null; };
  const ALVO = {
    protan: { ambar: .15, verm: .86, verde: .6 },
    deutan: { ambar: .15, verm: .86, verde: .6 },
    tritan: { ambar: .94, verm: .02, verde: .45 }
  };
  const tmp = THREE ? new THREE.Color() : null, hsl = {};
  function remapear(cor, ud, chave, soAmbar) {
    // guarda a cor original; se outro código trocou a cor depois, a nova vira a original
    let reg = ud[chave];
    if (reg && cor.getHex() !== reg.feita) reg = null;
    if (!reg) reg = ud[chave] = { orig: cor.getHex(), feita: cor.getHex() };
    tmp.setHex(reg.orig);
    let k = O.dalt !== 'nao' && cls(tmp); if (soAmbar && k !== 'ambar') k = null; const al = k && ALVO[O.dalt] && ALVO[O.dalt][k];
    if (al === undefined || al === null || al === false) { cor.setHex(reg.orig); reg.feita = reg.orig; return false; }
    tmp.getHSL(hsl); cor.setHSL(al, Math.min(1, hsl.s * 1.05), clamp(hsl.l * (k === 'verm' ? 1.12 : 1), 0, .8)); reg.feita = cor.getHex();
    return true;
  }
  let chamaGeo = null, chamaMat = null;
  const chamas = [];
  function chamaMaior(mesh) {
    // a vela ganha uma chama maior, tremulando: lida pela forma, não só pela cor
    if (mesh.userData._chamaDalt) { mesh.userData._chamaDalt.visible = O.dalt !== 'nao'; return; }
    if (O.dalt === 'nao') return;
    if (!chamaGeo) { chamaGeo = new THREE.ConeGeometry(.022, .07, 6); chamaMat = new THREE.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: .85, depthWrite: false }); chamaMat.userData.compartilhado = true; }
    const m = new THREE.Mesh(chamaGeo, chamaMat); m.position.y = .03; m.scale.y = 1 / Math.max(.5, mesh.scale.y); m.userData.fase = Math.random() * 9;
    mesh.add(m); mesh.userData._chamaDalt = m; chamas.push(m);
  }
  function corrigirCores(tudo) {
    if (!THREE || !C.W.grupo) return;
    const raiz = [C.W.grupo, ...C.scene.children.filter(o => o !== C.W.grupo && (o.isLight || o.isGroup))];
    for (const r of raiz) r.traverse(o => {
      if (o === C.flash) return;
      if (o.isLight && o.color && !o.isAmbientLight && !o.isHemisphereLight && !o.isDirectionalLight) remapear(o.color, o.userData, '_dalt');
      if (!tudo || !o.material) return;
      for (const m of [].concat(o.material)) {
        if (m.emissive && (m.emissiveIntensity || 0) > 0) remapear(m.emissive, m.userData, '_daltE');
        if ((m.isMeshBasicMaterial || m.isSpriteMaterial) && m.color) {
          const mudou = remapear(m.color, m.userData, '_daltC', true); // só chamas e halos: sangue e tinta não mudam
          if (o.isMesh && o.geometry && o.geometry.parameters && o.geometry.parameters.radius === .016 && (mudou || o.userData._chamaDalt)) chamaMaior(o);
        }
      }
    });
  }
  let daltT = 0;
  function daltFrame(dt) {
    for (let i = chamas.length - 1; i >= 0; i--) {
      const m = chamas[i]; if (!m.parent || !m.parent.parent) { chamas.splice(i, 1); continue; }
      if (!m.visible) continue; m.userData.fase += dt * 9; const f = 1 + Math.sin(m.userData.fase) * .18 + Math.sin(m.userData.fase * 2.7) * .1;
      m.scale.x = m.scale.z = f; m.scale.y = f * 1.3 / Math.max(.5, m.parent.scale.y);
    }
    if (O.dalt === 'nao' && !chamas.length) return;
    daltT -= dt; if (daltT > 0) return; daltT = 1.5; corrigirCores(false); // as luzes mudam de cor sozinhas (piscas, sustos): confere de tempos em tempos
  }

  // ===================================================================
  // 14 DE MARÇO: o internato lembra do incêndio
  // ===================================================================
  const hoje = new Date();
  let aniv = hoje.getMonth() === 2 && hoje.getDate() === 14;
  const DEF_ANIV = { id: 'aniversario', nome: 'Aniversário', desc: 'Entre no internato num 14 de março, o dia do incêndio.', secreta: true, segredo: true, dica: 'Algumas datas o internato não esquece.' };
  if (R.conquistas && !R.conquistas.some(c => c.id === 'aniversario')) R.conquistas.push(DEF_ANIV);
  let cinzas = null, radioDito = false, anivConq = false;
  function montarCinzas() {
    if (cinzas || !THREE) return;
    const n = U.qual() === 'baixa' ? 90 : U.qual() === 'media' ? 180 : 300, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * 16; pos[i * 3 + 1] = Math.random() * 4; pos[i * 3 + 2] = (Math.random() - .5) * 16; }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0x8a8378, size: .035, transparent: true, opacity: .55, depthWrite: false, fog: true });
    cinzas = new THREE.Points(geo, mat); cinzas.frustumCulled = false; cinzas.userData.n = n; C.scene.add(cinzas);
  }
  function cinzasFrame(dt) {
    if (!cinzas) return;
    const cam = C.camera.position, p = cinzas.geometry.attributes.position, a = p.array, t = performance.now() / 1000;
    cinzas.visible = C.mode === 'jogo' || C.mode === 'cena';
    if (!cinzas.visible) return;
    if (!cinzas.userData.ajustado) { for (let i = 0; i < cinzas.userData.n; i++) { a[i * 3] += cam.x; a[i * 3 + 2] += cam.z; } cinzas.userData.ajustado = true; }
    for (let i = 0; i < cinzas.userData.n; i++) {
      let x = a[i * 3], y = a[i * 3 + 1], z = a[i * 3 + 2];
      y -= dt * (.08 + (i % 7) * .015); x += Math.sin(t * .7 + i) * dt * .12; z += Math.cos(t * .5 + i * 1.3) * dt * .1;
      // a cinza acompanha a Lia: o que sai do cubo em volta dela volta do outro lado
      if (y < -.2) y += 4.2; if (x - cam.x > 8) x -= 16; if (x - cam.x < -8) x += 16; if (z - cam.z > 8) z -= 16; if (z - cam.z < -8) z += 16;
      a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
    }
    p.needsUpdate = true;
  }
  function ligarAniversario() {
    if (!aniv) return;
    document.body.classList.add('aniversario');
    if (!$('#pl-aniv') && $('#title')) { const t = document.createElement('div'); t.id = 'pl-aniv'; t.textContent = '14 de março. Hoje faz quinze anos.'; $('#title').appendChild(t); }
    if (!$('#pl-fuligem')) { const f = document.createElement('div'); f.id = 'pl-fuligem'; f.className = 'fx'; document.body.appendChild(f); }
    if (!$('#pl-radio')) { const r = document.createElement('div'); r.id = 'pl-radio'; r.hidden = true; r.setAttribute('aria-live', 'polite'); document.body.appendChild(r); }
    montarCinzas();
  }
  function anivFrame(dt) {
    if (!aniv) return;
    cinzasFrame(dt);
    if (C.mode === 'cena' && !radioDito) {
      radioDito = true;
      const r = $('#pl-radio'); if (r) setTimeout(() => {
        r.textContent = '(o rádio do carro, chiando) ...hoje, catorze de março, faz quinze anos do incêndio do Internato São Lázaro. As famílias pedem que ninguém suba a serra esta noite...';
        r.hidden = false; setTimeout(() => { r.hidden = true; }, 9000);
      }, 2500);
    }
    if (C.mode === 'jogo' && !anivConq && C.S && !C.S.dead) { anivConq = true; try { C.conquista('aniversario'); } catch (e) {} }
  }

  // ===================================================================
  // TÍTULO: mandar o jogo para um amigo
  // ===================================================================
  function botaoCompartilhar() {
    const ctrl = document.querySelectorAll('#title .ctrl'); const ult = ctrl[ctrl.length - 1];
    if (!ult || $('#t-mandar')) return;
    const b = document.createElement('button'); b.id = 't-mandar'; b.className = 'link-mandar'; b.textContent = 'mandar o jogo para alguém corajoso';
    ult.after(b);
    b.onclick = async () => {
      const url = linkJogo(), txt = 'Um jogo de terror no navegador. Jogue de fone, no escuro, e me conte até onde chegou.';
      if (navigator.share) { try { await navigator.share({ title: 'A Hora do Silêncio', text: txt, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
      U.feedback(b, await U.copiar(txt + ' ' + url) ? 'link copiado: cole no grupo' : url);
    };
  }

  // ===================================================================
  // TROCA DE MAPA: daltonismo e aquecimento dos materiais (menos engasgo na primeira vez que algo aparece)
  // ===================================================================
  function mapa() {
    chamas.length = 0;
    setTimeout(() => {
      if (O.dalt !== 'nao') corrigirCores(true);
      if (U.robo || window.__teste) return;
      try { if (C.renderer.compile) C.renderer.compile(C.scene, C.camera); } catch (e) {}
    }, 60);
  }

  ligarAniversario(); botaoCompartilhar();
  const api = {
    abrirLapide, fecharLapide, mapa,
    morreu() {},
    opcoes(id) { if (C.W && C.W.grupo) corrigirCores(true); },
    frame(dt, ativo) { daltFrame(dt); anivFrame(dt); },
    desenharLapide, dadosLapide, corrigirCores,
    // só para testes e para quem quiser ver o segredo fora da data
    aniversario(on = true) { aniv = on; if (on) ligarAniversario(); },
    get aniv() { return aniv; }
  };
  return api;
}
