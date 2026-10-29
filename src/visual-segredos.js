// VISUAL E LUZ — Lote 4: segredos e easter eggs feitos de luz, sombra e reflexo.
// Instalado por src/visual.js. Ganchos: SEG.luz(dt, S) logo depois da lanterna (antes do polimento),
// SEG.update(dt, ativo, S, t) no fim de VIS.update, SEG.mapa() ao trocar de mapa, SEG.morte(quem) ao morrer,
// SEG.vermelha() (a Menina Que Conta não conta a luz vermelha) e SEG.mapaLanterna(chove) (lanterna do Davi).
// Nada aqui dá dano nem trava o caminho: é recompensa para quem olha, apaga a luz, prende o ar e volta.
export function instalarSegredos(C, X) {
  const { THREE, scene, camera, renderer, flash, P, M, W, OPT, keys, MON } = C;
  const $ = s => document.querySelector(s);
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const PI = Math.PI;
  const v1 = new THREE.Vector3(), v2 = new THREE.Vector3(), fw = new THREE.Vector3();
  const SALA = id => W.salas.find(s => s.id === id);
  const fl = () => (C.S && C.S.flags) || {};
  const fala = txt => { try { C.sub('lia', txt); } catch (e) {} };
  const som = (k, ...a) => { try { C.SFX[k](...a); } catch (e) {} };

  // =================================================================== MEMÓRIA ENTRE NOITES
  const LS = 'hora-silencio-l4vis';
  const ler = () => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; } };
  const DB = ler(); DB.mortes = DB.mortes || []; DB.seg = DB.seg || {};
  const gravar = () => { try { localStorage.setItem(LS, JSON.stringify(DB)); } catch (e) {} };
  const stats = () => { try { return JSON.parse(localStorage.getItem('hora-silencio-stats')) || {}; } catch (e) { return {}; } };
  const plat = () => (window.__plat && window.__plat.O) || {};
  const minima = () => plat().qual === 'minima';
  const dalt = () => { const d = plat().dalt; return !!d && d !== 'nao'; };

  // conquistas novas (texto entra no roteiro na hora de instalar, sem mexer em roteiro.js)
  const R = window.ROTEIRO;
  if (R && R.conquistas) {
    const novas = [
      { id: 'l4_hoje', nome: 'Hoje', desc: 'Veja na poça a lápide que não está no cemitério.', secreta: true, dica: 'A chuva junta água onde a terra afundou.' },
      { id: 'l4_telegrafista', nome: 'Telegrafista', desc: 'Leia a lâmpada do corredor antes de ouvir a primeira fita.', secreta: true, dica: 'Nem toda lâmpada que pisca está com defeito.' },
      { id: 'l4_sombras', nome: 'Teatro de Sombras', desc: 'Faça um coelho na parede de um dormitório até alguém responder.', secreta: true, dica: 'Lanterna acesa, parede lisa, segure E.' },
      { id: 'l4_naotinha', nome: 'Não Tinha Esse', desc: 'Veja a sombra a mais no teatrinho de lençol.', secreta: true, dica: 'Conte os bonecos. Depois conte as sombras.' },
      { id: 'l4_exposicao', nome: 'Exposição Longa', desc: 'Deixe a câmera parada no escuro, no modo foto, até alguém passar.', secreta: true, dica: 'Paciência com o obturador.' }
    ];
    for (const c of novas) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
  }
  const conq = id => { try { C.conquista(id); } catch (e) {} };

  // legendas de som (categoria h = história)
  const LEG = C.legendas || {};
  LEG.l4zumbido = { t: 'a lâmpada zune em ritmo', imp: 1, cd: 9, cat: 'h' };
  LEG.l4giz = { t: 'giz raspando na parede', imp: 1, cd: 6, cat: 'h' };
  LEG.l4respira = { t: 'alguém respira atrás de você', imp: 1, cd: 8, cat: 'p' };
  LEG.l4plastico = { t: 'papel de bala amassando', imp: 0, cd: 2, cat: 'h' };

  // segredos da luz: o contador mostra "x de ?" (sem revelar o total)
  function segredo(id, txt) {
    if (DB.seg[id]) return false;
    DB.seg[id] = Date.now(); gravar();
    const n = Object.keys(DB.seg).length;
    try { C.toast(`${txt ? txt + ' · ' : ''}Segredo da luz ${n} de ?`); } catch (e) {}
    if (n >= 3 && !DB.davi) { DB.davi = 1; gravar(); syncDavi(); setTimeout(() => { try { C.toast('Desbloqueado: “Lanterna do Davi”, nas opções de Imagem.'); } catch (e) {} }, 3200); }
    return true;
  }

  // =================================================================== TEXTURAS (canvas)
  function tex(w, h, draw, repete) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    if (repete) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.userData = { clone: true }; return t;
  }
  function traco(g, pts, cor, lw = 3, n = 2, a0 = .55, a1 = .9, j = 1.5) { // giz/giz de cera: várias passadas tremidas
    g.strokeStyle = cor; g.lineCap = 'round'; g.lineJoin = 'round';
    for (let k = 0; k < n; k++) {
      g.lineWidth = lw * rand(.7, 1.1); g.globalAlpha = rand(a0, a1); g.beginPath();
      pts.forEach(([x, y], i) => { const jx = x + rand(-j, j), jy = y + rand(-j, j); if (i) g.lineTo(jx, jy); else g.moveTo(jx, jy); });
      g.stroke();
    }
    g.globalAlpha = 1;
  }
  const roda = (x, y, r, n = 16, a0 = 0, a1 = PI * 2) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [x + Math.cos(a) * r, y + Math.sin(a) * r]; });
  function palito(g, x, y, s, cor, o = {}) { // boneco de palito; y = pés
    const lw = o.lw || Math.max(2, s * .06), cab = s * .16;
    traco(g, roda(x, y - s + cab, cab, 14), cor, lw, 2);
    traco(g, [[x, y - s + cab * 2], [x, y - s * .38]], cor, lw, 2);
    traco(g, [[x - s * .17, y], [x, y - s * .38], [x + s * .17, y]], cor, lw, 2);
    const ba = o.bracos || 'baixo';
    if (ba === 'cima') traco(g, [[x - s * .25, y - s * 1.0], [x, y - s * .72], [x + s * .25, y - s * 1.0]], cor, lw, 2);
    else if (ba === 'aponta') { traco(g, [[x, y - s * .7], [x + s * .42, y - s * .82]], cor, lw, 2); traco(g, [[x, y - s * .7], [x - s * .2, y - s * .45]], cor, lw, 2); }
    else traco(g, [[x - s * .24, y - s * .45], [x, y - s * .72], [x + s * .24, y - s * .45]], cor, lw, 2);
    if (o.saia) traco(g, [[x - s * .14, y - s * .3], [x, y - s * .6], [x + s * .14, y - s * .3], [x - s * .14, y - s * .3]], cor, lw, 2);
    if (o.tranca) for (const sx of [-1, 1]) traco(g, [[x + sx * cab, y - s + cab], [x + sx * cab * 1.6, y - s + cab * 2.4]], cor, lw, 1);
    if (o.lanterna) { traco(g, [[x + s * .24, y - s * .45], [x + s * .34, y - s * .5]], '#333', lw * 1.4, 1); g.fillStyle = 'rgba(255,220,60,.55)'; g.beginPath(); g.moveTo(x + s * .34, y - s * .5); g.lineTo(x + s * 1.1, y - s * .8); g.lineTo(x + s * 1.1, y - s * .2); g.fill(); }
  }
  function papel(g, w, h, cor = '#e9e1cd') {
    g.fillStyle = cor; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 600; i++) { g.fillStyle = `rgba(90,70,40,${rand(.02, .07)})`; g.fillRect(rand(0, w), rand(0, h), rand(1, 3), 1); }
    for (let i = 0; i < 3; i++) { g.strokeStyle = 'rgba(80,60,30,.12)'; g.lineWidth = 1; g.beginPath(); g.moveTo(rand(0, w), 0); g.lineTo(rand(0, w), h); g.stroke(); }
    const gr = g.createRadialGradient(w / 2, h / 2, w * .2, w / 2, h / 2, w * .8); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(70,50,20,.35)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
  const furos = (g, w, h, n, a = .7) => { g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < n; i++) { g.fillStyle = `rgba(0,0,0,${rand(.2, a)})`; g.fillRect(rand(0, w), rand(0, h), rand(1, 3), rand(1, 2)); } g.globalCompositeOperation = 'source-over'; };
  function letreiro(g, txt, x, y, tam, cor, fonte = 'bold', alinha = 'center') { g.font = `${fonte} ${tam}px Georgia`; g.textAlign = alinha; g.textBaseline = 'middle'; g.fillStyle = cor; for (let p = 0; p < 3; p++) { g.globalAlpha = .45 + p * .2; g.save(); g.translate(x + rand(-1.5, 1.5), y + rand(-1.5, 1.5)); g.rotate(rand(-.02, .02)); g.fillText(txt, 0, 0); g.restore(); } g.globalAlpha = 1; }
  function silCrianca(g, x, y, s, cor = '#000', pose = 'pe') { // silhueta cheia, de frente
    g.fillStyle = cor; g.strokeStyle = cor; g.lineCap = 'round';
    g.beginPath(); g.arc(x, y - s * .86, s * .1, 0, 7); g.fill();
    g.beginPath(); g.moveTo(x - s * .1, y - s * .74); g.lineTo(x + s * .1, y - s * .74); g.lineTo(x + s * .17, y - s * .32); g.lineTo(x - s * .17, y - s * .32); g.fill();
    g.lineWidth = s * .055; for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(x + sx * .06 * s, y - s * .33); g.lineTo(x + sx * .07 * s, y); g.stroke(); }
    g.lineWidth = s * .045;
    if (pose === 'aponta') { g.beginPath(); g.moveTo(x + s * .08, y - s * .68); g.lineTo(x + s * .42, y - s * .8); g.stroke(); g.beginPath(); g.moveTo(x - s * .08, y - s * .68); g.lineTo(x - s * .14, y - s * .4); g.stroke(); }
    else if (pose === 'dedo') { g.beginPath(); g.moveTo(x + s * .09, y - s * .68); g.lineTo(x + s * .05, y - s * .56); g.lineTo(x + s * .01, y - s * .8); g.stroke(); g.beginPath(); g.moveTo(x - s * .09, y - s * .68); g.lineTo(x - s * .14, y - s * .4); g.stroke(); }
    else for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(x + sx * .09 * s, y - s * .68); g.lineTo(x + sx * .15 * s, y - s * .4); g.stroke(); }
  }
  const TX_BRILHO = tex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(255,255,255,.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const TX_PE = tex(64, 128, g => { // pezinho descalço de criança
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(32, 78, 15, 34, 0, 0, 7); g.fill();
    for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(19 + i * 6.5, 34 - Math.sin(i / 4 * PI) * 5 + i * 1.5, 4.2 - i * .4, 0, 7); g.fill(); }
  });

  // =================================================================== ONDE COLOCAR AS COISAS (sem atravessar o que já existe)
  const NORM = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  let CAIXAS = null; const _b = new THREE.Box3();
  const visivelArvore = o => { while (o) { if (!o.visible) return false; o = o.parent; } return true; };
  function caixas() {
    if (CAIXAS) return CAIXAS; CAIXAS = [];
    W.grupo.updateMatrixWorld(true);
    W.grupo.traverse(o => {
      if (!(o.isMesh || o.isSprite) || o.isInstancedMesh || (o.userData && o.userData.l4) || !visivelArvore(o)) return;
      const b = new THREE.Box3().setFromObject(o); if (b.isEmpty()) return;
      CAIXAS.push(b);
    });
    return CAIXAS;
  }
  function semPorta(r, lado, c, folga) {
    for (const l of W.links) {
      if (l.a !== r.id && l.b !== r.id) continue;
      if (lado < 2 && l.eixo === 'x' && Math.abs(l.z - (lado === 0 ? r.z0 : r.z1)) < .05 && Math.abs(l.x - c) < folga) return false;
      if (lado >= 2 && l.eixo === 'z' && Math.abs(l.x - (lado === 2 ? r.x0 : r.x1)) < .05 && Math.abs(l.z - c) < folga) return false;
    }
    return true;
  }
  function regiao(r, lado, c, y, w, h, prof) {
    const a = .104;
    if (lado === 0) _b.set(v1.set(c - w / 2, y - h / 2, r.z0 + a), v2.set(c + w / 2, y + h / 2, r.z0 + prof));
    else if (lado === 1) _b.set(v1.set(c - w / 2, y - h / 2, r.z1 - prof), v2.set(c + w / 2, y + h / 2, r.z1 - a));
    else if (lado === 2) _b.set(v1.set(r.x0 + a, y - h / 2, c - w / 2), v2.set(r.x0 + prof, y + h / 2, c + w / 2));
    else _b.set(v1.set(r.x1 - prof, y - h / 2, c - w / 2), v2.set(r.x1 - a, y + h / 2, c + w / 2));
    return _b;
  }
  function livre(b) { for (const o of caixas()) if (o.intersectsBox(b)) return false; return true; }
  function ocupar(b) { caixas().push(b.clone()); }
  function lugarParede(r, larg, alt, y, lados = [0, 1, 2, 3], prof = .32, tent = 14) {
    for (let i = 0; i < tent; i++) {
      const lado = lados[i % lados.length], lo = lado < 2 ? r.x0 : r.z0, hi = lado < 2 ? r.x1 : r.z1;
      if (hi - lo < larg + 1) continue;
      const c = rand(lo + larg / 2 + .45, hi - larg / 2 - .45);
      if (!semPorta(r, lado, c, larg / 2 + 1.1)) continue;
      const b = regiao(r, lado, c, y, larg, alt, prof); if (!livre(b)) continue;
      ocupar(b); return { lado, c };
    }
    return null;
  }
  function naParede(r, lado, c, y, w, h, mat, off = .113, pai = W.grupo) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    if (lado === 0) m.position.set(c, y, r.z0 + off);
    else if (lado === 1) { m.position.set(c, y, r.z1 - off); m.rotation.y = PI; }
    else if (lado === 2) { m.position.set(r.x0 + off, y, c); m.rotation.y = PI / 2; }
    else { m.position.set(r.x1 - off, y, c); m.rotation.y = -PI / 2; }
    m.userData.l4 = true; pai.add(m); return m;
  }
  const dirLado = lado => ({ x: lado === 2 ? -1 : lado === 3 ? 1 : 0, z: lado === 0 ? -1 : lado === 1 ? 1 : 0 }); // para dentro da parede
  function noChao(r, folga = .9, tent = 24, raio = .45) { // ponto de chão livre dentro da sala
    for (let i = 0; i < tent; i++) {
      const x = rand(r.x0 + folga, r.x1 - folga), z = rand(r.z0 + folga, r.z1 - folga);
      _b.set(v1.set(x - raio, .05, z - raio), v2.set(x + raio, 1.2, z + raio));
      if (livre(_b)) { ocupar(_b); return { x, z }; }
    }
    return null;
  }
  const rcA = new THREE.Raycaster(); rcA.camera = camera;
  function apoio(r, y0 = .62, y1 = 1.3, tent = 40) { // tampo de mesa ou balcão dentro da sala
    const alvos = []; W.grupo.traverse(o => { if (o.isMesh && !o.userData.l4 && visivelArvore(o)) alvos.push(o); });
    for (let i = 0; i < tent; i++) {
      const x = rand(r.x0 + .5, r.x1 - .5), z = rand(r.z0 + .5, r.z1 - .5);
      rcA.set(v1.set(x, 2.2, z), v2.set(0, -1, 0)); rcA.far = 2.3;
      const h = rcA.intersectObjects(alvos, false)[0];
      if (h && h.point.y > y0 && h.point.y < y1 && h.face && Math.abs(h.face.normal.y) > .7) return { x, y: h.point.y, z };
    }
    return null;
  }

  // =================================================================== AJUDAS DE OLHAR E DE LUZ
  function olhar(p, abre = .96, dmax = 8) {
    v1.copy(p).sub(camera.position); const d = v1.length(); if (d > dmax || d < .05) return 0;
    return clamp((fw.dot(v1.multiplyScalar(1 / d)) - abre) / (1 - abre), 0, 1);
  }
  const luzOn = () => { const S = C.S; return !!(S && S.flashOn && !C.flashPisca && flash.intensity > 3); };
  const naLuz = (p, dmax = 7, abre = .93) => luzOn() ? olhar(p, abre, dmax) : 0;
  const naSala = id => P.room && P.room.id === id;
  const pitch = () => Math.asin(clamp(fw.y, -1, 1));
  let semN = 1;
  function semear(extra) { const S = C.S, b = S && S.code ? +S.code.join('') * 31 + +S.quadro.join('') : 7; semN = (b * 7919 + extra * 104729) % 2147483646 + 1; }
  const rnd = () => { semN = (semN * 16807) % 2147483647; return (semN - 1) / 2147483646; };
  const suprimentos = () => W.items.filter(i => i.mesh.visible && /pilha|curativo/i.test(String(i.it.label()))).map(i => i.mesh.position);
  function maisPerto(x, z, lista) { let m = null, dm = 1e9; for (const p of lista) { const d = Math.hypot(p.x - x, p.z - z); if (d < dm) { dm = d; m = p; } } return m; }
  function caminhoSalas(de, ate) { // portas entre a sala de partida e a de chegada (busca em largura)
    if (!de || !ate) return null; if (de === ate) return [];
    const ant = { [de.id]: null }, fila = [de.id];
    while (fila.length) {
      const id = fila.shift(); if (id === ate.id) break;
      for (const l of W.links) { const o = l.a === id ? l.b : l.b === id ? l.a : null; if (!o || o in ant) continue; ant[o] = { id, l }; fila.push(o); }
    }
    if (!(ate.id in ant)) return null;
    const portas = []; let k = ate.id; while (ant[k]) { portas.unshift(ant[k].l); k = ant[k].id; }
    return portas;
  }

  // =================================================================== ESTADO POR MAPA
  let G = null, montarPend = false;
  const mapaId = () => W.mapa;
  function mapa() { G = { ticks: [] }; CAIXAS = null; montarPend = true; luaSp.visible = false; fotoCri.visible = false; fotoPassa.visible = false; maoM.visible = false; elAbraco.style.opacity = 0; verm = verm && !!fl().l4v_celofane; }
  function montar() {
    montarPend = false; if (!C.S || !W.grupo) return;
    const passos = [riscos, varal, estrelas, olhosArmario, lampadaCodigo, velaFria, sombraAponta, bafoJanelas, seisPortas, liaMenina, pilhaFraca, circuloSeco, lapidePoca,
      fotoTurma, desenhoCompleta, teatroLencol, vendaOlhos, celofane, teclasGastas, monoculo, gibi, sinosVitral, poeiraLeitura, naoPare, quarto1979, contorno, tetoDormA, quadroCostas,
      tvRecepcao, mapaDavi, espelhoAtrasa, sombraLenta, cavalinho, vitralCor, turma1979, cadernoGiz, fitaVideo, oculosMoacir, pegadasAtras, vultoJanela, pingosPia, retratoOlhos, tetoDormB, balancoPatio, lousaReflexo, caleidoscopio,
      velaCor, setasTunel, maosTeto, mobilePecas, luaParabrisa, vaporTunel, portaNumero, gotasTeto, relogioParado, barrasCela, fotosRiscadas, pesSobPorta, cruzCapela,
      armarioRosto, altarVelas, contornoPatio, maoVidroDorm];
    for (const f of passos) { try { f(); } catch (e) { console.warn('visual-segredos', f.name, e); } }
  }

  // =================================================================== 1. RISCOS DAS MORTES (sala de aula)
  function riscos() {
    if (mapaId() !== 'terreo') return; const r = SALA('aula'); if (!r) return;
    const total = Math.max(stats().mortes | 0, C.S.mortes | 0), noite = Math.min(total, C.S.mortes | 0);
    const t = tex(512, 320, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      letreiro(g, total ? 'VEZES QUE A LIA NÃO VOLTOU' : 'AINDA', w / 2, 42, total ? 30 : 64, 'rgba(232,232,222,.92)');
      const max = 60; let x = 40, y = 100;
      for (let i = 0; i < Math.min(total, max); i++) {
        const nova = i >= total - noite, cor = nova ? 'rgba(220,70,60,.95)' : 'rgba(232,232,222,.85)';
        if (i % 5 === 4) traco(g, [[x - 58, y + 44], [x + 4, y - 4]], cor, 3.4, 2); // o quinto corta os quatro
        else { traco(g, [[x, y], [x + rand(-3, 3), y + 46]], cor, 3.6, 2); x += 13; }
        if (i % 5 === 4) { x += 22; if (x > w - 70) { x = 40; y += 64; } }
      }
      if (total > max) letreiro(g, `E MAIS ${total - max}`, w - 110, h - 26, 24, 'rgba(232,232,222,.8)');
      furos(g, w, h, 900, .8);
    });
    const lug = lugarParede(r, 1.5, .95, 1.3, [3, 2, 0, 1]); if (!lug) return;
    const m = naParede(r, lug.lado, lug.c, 1.3, 1.5, .94, new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.userData.leitura = total ? `Riscos de giz, de cinco em cinco. ${total} ao todo.` : 'Escrito a giz: AINDA.';
    let vistoT = 0;
    G.ticks.push((dt, ativo) => {
      if (!ativo || fl().l4v_riscos) return;
      if (naSala('aula') && olhar(m.position, .95, 4) > .3) { vistoT += dt; if (vistoT > 1.4) { fl().l4v_riscos = true; fala(total ? (total === 1 ? 'Um risco. Alguém tá contando.' : `${total} riscos. Alguém tá contando cada vez.`) : 'Ainda... Ainda o quê?'); segredo('riscos'); } } else vistoT = 0;
    });
  }

  // =================================================================== 2. VARAL DE DESENHOS DAS SUAS MORTES (sala de brinquedos)
  const LEGENDA = { inspetor: 'O HOMEM OUVIU A LIA', ana: 'A ANA ACHOU A LIA', procissao: 'A LIA NÃO SE ESCONDEU', armario: 'A LIA SE ESCONDEU MAL', agua: 'A LIA FOI PRA ÁGUA', outro: 'A LIA CORREU' };
  function texDesenho(d) {
    return tex(256, 320, (g, w, h) => {
      papel(g, w, h);
      const chao = 240; traco(g, [[10, chao], [w - 10, chao + rand(-4, 4)]], '#4f7a32', 5, 2);
      if (!d) { // ninguém morreu ainda
        palito(g, 128, chao, 120, '#2a3a8a', { lanterna: true });
        g.globalAlpha = .35; palito(g, 60, chao, 150, '#111', { bracos: 'cima' }); g.globalAlpha = 1;
        letreiro(g, 'A LIA AINDA NÃO', w / 2, 284, 22, '#a8261c');
        return;
      }
      const q = d.esc === 'armario' ? 'armario' : d.agua ? 'agua' : d.q in LEGENDA ? d.q : 'outro';
      if (q === 'armario') { // armário com a mão vermelha para fora
        traco(g, [[84, chao], [84, 70], [172, 70], [172, chao], [84, chao]], '#3a6a3a', 6, 3);
        traco(g, [[128, 70], [128, chao]], '#3a6a3a', 3, 2); palito(g, 106, chao - 10, 90, '#2a3a8a');
        traco(g, [[172, 150], [196, 146]], '#c0201a', 7, 3); for (let i = 0; i < 4; i++) traco(g, [[196, 146], [206, 136 + i * 5]], '#c0201a', 3, 2);
        g.globalAlpha = .7; palito(g, 214, chao, 190, '#111', { bracos: 'cima' }); g.globalAlpha = 1;
      } else if (q === 'agua') {
        palito(g, 128, chao - 30, 100, '#2a3a8a', { bracos: 'cima' });
        for (let k = 0; k < 4; k++) traco(g, Array.from({ length: 14 }, (_, i) => [10 + i * 18, 190 + k * 16 + Math.sin(i * 1.3 + k) * 6]), '#2b6fd0', 5, 2);
      } else if (q === 'inspetor') {
        palito(g, 90, chao, 100, '#2a3a8a', { lanterna: true });
        palito(g, 180, chao, 210, '#111', { bracos: 'cima', lw: 7 }); traco(g, [[166, 66], [194, 66]], '#f4f0e0', 8, 2); // a venda branca
      } else if (q === 'ana') {
        palito(g, 90, chao, 100, '#2a3a8a', { lanterna: true }); palito(g, 196, chao, 90, '#5a2a1a', { saia: true, tranca: true });
        for (let i = 1; i <= 10; i++) letreiro(g, String(i), 24 + (i - 1) * 23, 40 + Math.sin(i) * 12, 20, i === 10 ? '#c0201a' : '#555');
      } else if (q === 'procissao') {
        palito(g, 40, chao, 90, '#2a3a8a');
        for (let i = 0; i < 5; i++) { const x = 95 + i * 34; palito(g, x, chao, 110 + i * 4, '#555'); g.fillStyle = 'rgba(255,190,40,.9)'; g.beginPath(); g.arc(x + 20, chao - 70, 5, 0, 7); g.fill(); }
      } else { palito(g, 128, chao, 110, '#2a3a8a', { bracos: 'cima' }); for (let i = 0; i < 3; i++) traco(g, [[40 + i * 10, 120 + i * 30], [90, 120 + i * 30]], '#777', 3, 1); }
      letreiro(g, LEGENDA[q], w / 2, 272, 20, '#a8261c');
      letreiro(g, `${d.d || ''} · ${(d.sala || '').toUpperCase()}`, w / 2, 300, 13, '#555', 'normal');
    });
  }
  function varal() {
    if (mapaId() !== 'superior') return; const r = SALA('brinq'); if (!r) return;
    const lista = DB.mortes.slice(-6);
    const n = Math.max(1, lista.length);
    let lado = 3, ok = null;
    for (const l of [3, 2, 1, 0]) { const len = l < 2 ? r.x1 - r.x0 : r.z1 - r.z0; if (len < n * .62 + 1.6) continue; const c = l < 2 ? (r.x0 + r.x1) / 2 : (r.z0 + r.z1) / 2; const b = regiao(r, l, c, 2.0, n * .62 + .4, .7, .7); if (livre(b)) { ocupar(b); lado = l; ok = c; break; } }
    if (ok === null) { lado = 3; ok = (r.z0 + r.z1) / 2; }
    const comp = n * .62 + .4, fio = new THREE.MeshStandardMaterial({ color: 0xcfc2a0, roughness: 1 });
    const grupo = new THREE.Group(); grupo.userData.l4 = true; W.grupo.add(grupo);
    const corda = naParede(r, lado, ok, 2.28, comp, .012, fio, .5, grupo); corda.material = fio;
    const pregM = new THREE.MeshStandardMaterial({ color: 0x9a7a4a, roughness: .8 });
    G.varal = [];
    for (let i = 0; i < n; i++) {
      const d = lista[i] || null, desl = -comp / 2 + .5 + i * .62;
      const piv = new THREE.Group(); grupo.add(piv);
      const base = naParede(r, lado, ok, 2.28, .01, .01, fio, .5, grupo); // só para pegar a posição e rotação
      piv.position.copy(base.position); piv.rotation.copy(base.rotation); grupo.remove(base);
      const dl = lado === 0 ? [1, 0] : lado === 1 ? [-1, 0] : lado === 2 ? [0, -1] : [0, 1];
      piv.position.x += dl[0] * desl; piv.position.z += dl[1] * desl;
      const folha = new THREE.Mesh(new THREE.PlaneGeometry(.42, .52), new THREE.MeshStandardMaterial({ map: texDesenho(d), roughness: 1, side: THREE.DoubleSide }));
      folha.position.y = -.27; piv.add(folha);
      for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.025, .06, .02), pregM); p.position.set(s * .15, -.01, 0); piv.add(p); }
      folha.userData.leitura = d ? `Um desenho de giz de cera: ${LEGENDA[d.esc === 'armario' ? 'armario' : d.agua ? 'agua' : d.q in LEGENDA ? d.q : 'outro']}.` : 'Um desenho de giz de cera: A LIA AINDA NÃO.';
      G.varal.push({ piv, f: rand(0, 6), amp: 0 });
    }
    let visto = 0;
    G.ticks.push((dt, ativo, S, t) => {
      for (const v of G.varal) { // balançam com o vento da porta e quando a Lia passa perto
        const d = Math.hypot(P.pos.x - v.piv.position.x, P.pos.z - v.piv.position.z);
        v.amp = Math.max(v.amp * Math.exp(-dt * .8), d < 1.3 && P.sprinting ? .35 : d < 1.3 ? .18 : .04);
        v.piv.rotation.x = Math.sin(t * 2.1 + v.f) * v.amp;
      }
      if (ativo && naSala('brinq') && !fl().l4v_varal && olhar(G.varal[0].piv.position, .9, 5) > .3) { visto += dt; if (visto > 1.5) { fl().l4v_varal = true; fala(lista.length ? 'Sou eu. Desenharam como eu... Como eles sabem?' : 'A Lia ainda não. Ainda não o quê?'); segredo('varal'); } }
    });
  }
  function morte(quem) {
    const S = C.S; if (!S) return;
    const dt = new Date(), d = `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
    DB.mortes.push({ q: quem, sala: (P.room && P.room.nome) || '', esc: S.hidden ? S.hidden.tipo : null, agua: !!P.naAgua, d, mapa: W.mapa, x: +P.pos.x.toFixed(2), z: +P.pos.z.toFixed(2) });
    if (DB.mortes.length > 40) DB.mortes.splice(0, DB.mortes.length - 40);
    gravar();
  }

  // =================================================================== 3. ESTRELAS QUE BRILHAM NO ESCURO (Dormitório E)
  function estrelas() {
    if (mapaId() !== 'superior') return; const r = SALA('dormE'); if (!r) return;
    const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2, w = r.x1 - r.x0 - 1, d = r.z1 - r.z0 - 1, h = r.h || 3.2;
    const arm = W.lockers.filter(L => L.tipo === 'armario' && L.x > r.x0 && L.x < r.x1 && L.z > r.z0 && L.z < r.z1);
    const alvo = arm[0] || W.lockers.find(L => L.x > r.x0 && L.x < r.x1 && L.z > r.z0 && L.z < r.z1) || { x: cx + 2, z: cz };
    const dig = C.S.code[2], ang = Math.atan2(-(alvo.z - cz), alvo.x - cx);
    const desenha = (g, W2, H2, brilho) => {
      g.clearRect(0, 0, W2, H2);
      const estrela = (x, y, s) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? s * .45 : s; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); };
      g.fillStyle = brilho ? 'rgba(150,255,170,1)' : 'rgba(225,230,200,1)';
      for (let i = 0; i < 46; i++) estrela(rand(20, W2 - 20), rand(20, H2 - 20), rand(5, 10));
      // a seta (feita de estrelas) aponta para o armário
      const ox = W2 / 2, oy = H2 / 2, ca = Math.cos(ang), sa = -Math.sin(ang);
      for (let k = -4; k <= 5; k++) estrela(ox + ca * k * 26, oy + sa * k * 26, 9);
      for (const s of [-1, 1]) for (let k = 1; k <= 3; k++) { const a = ang + PI + s * .6; estrela(ox + ca * 130 + Math.cos(a) * k * 24, oy + sa * 130 - Math.sin(a) * k * 24, 9); }
      // e o terceiro número do cofre, em quadradinhos
      const bx = W2 * .2, by = H2 * .78; g.strokeStyle = g.fillStyle; g.lineWidth = 3;
      for (let i = 0; i < 4; i++) { g.strokeRect(bx + i * 46, by - 22, 38, 44); if (i === 2) { g.font = 'bold 34px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(dig), bx + i * 46 + 19, by); } }
    };
    const base = tex(512, 512, (g, a, b) => desenha(g, a, b, false)), glow = tex(512, 512, (g, a, b) => desenha(g, a, b, true));
    const plano = (mat, dy) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = PI / 2; m.position.set(cx, h - dy, cz); m.userData.l4 = true; W.grupo.add(m); return m; };
    const mB = plano(new THREE.MeshStandardMaterial({ map: base, transparent: true, depthWrite: false, roughness: .6, opacity: .55, polygonOffset: true, polygonOffsetFactor: -2 }), .013);
    const mG = plano(new THREE.MeshBasicMaterial({ map: glow, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }), .016);
    let carga = 0, falou = false; void mB;
    G.ticks.push((dt, ativo, S) => {
      const dentro = naSala('dormE');
      if (dentro && luzOn() && pitch() > .55) carga = Math.min(1, carga + dt / 3); // carregando com a lanterna no teto
      else carga = Math.max(0, carga - dt / (S.flashOn ? 4 : 10));
      mG.material.opacity = carga * (S.flashOn ? .12 : .95);
      if (dentro && !S.flashOn && carga > .5 && !falou && ativo && pitch() > .3) { falou = true; if (!fl().l4v_estrelas) { fl().l4v_estrelas = true; fala('Estrelinhas... formam uma seta. E um número.'); segredo('estrelas'); } }
    });
  }

  // =================================================================== 4. A LUA QUE TEM ROSTO (estrada)
  const texLua = rosto => tex(256, 256, (g, w, h) => {
    const gr = g.createRadialGradient(128, 128, 40, 128, 128, 128); gr.addColorStop(0, 'rgba(220,226,235,.35)'); gr.addColorStop(1, 'rgba(220,226,235,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#dfe3e8'; g.beginPath(); g.arc(128, 128, 54, 0, 7); g.fill();
    for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(150,156,168,${rand(.2, .5)})`; g.beginPath(); g.arc(128 + rand(-36, 36), 128 + rand(-36, 36), rand(4, 13), 0, 7); g.fill(); }
    if (rosto) { // a Ana: franja, olhos fundos e a boca aberta contando
      g.fillStyle = 'rgba(30,26,30,.9)'; g.beginPath(); g.ellipse(108, 122, 9, 12, 0, 0, 7); g.ellipse(148, 122, 9, 12, 0, 0, 7); g.fill();
      g.beginPath(); g.ellipse(128, 160, 7, 11, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(40,30,30,.75)'; g.beginPath(); g.arc(128, 104, 56, PI, 0); g.lineTo(178, 100); g.lineTo(78, 100); g.fill();
    }
  });
  const LUA = [texLua(false), texLua(true)];
  const luaSp = new THREE.Sprite(new THREE.SpriteMaterial({ map: LUA[0], transparent: true, opacity: 0, depthWrite: false, fog: false })); luaSp.scale.set(10, 10, 1); luaSp.visible = false; scene.add(luaSp);
  const LUA_DIR = new THREE.Vector3(.42, .36, -.83).normalize();
  let luaParado = 0, luaRosto = 0; const luaUlt = new THREE.Vector3();
  function tickLua(dt, ativo, S, t) {
    const ok = mapaId() === 'estrada' && P.room && P.room.fora;
    luaSp.visible = ok; if (!ok) return;
    const gap = clamp((Math.sin(t * PI * 2 / 37) * .6 + Math.sin(t * PI * 2 / 23 + 2) * .4 - .25) / .5, 0, 1) * (1 - clamp((C.raioI || 0) * 3, 0, 1)); // a chuva dá uma trégua entre os relâmpagos
    luaSp.position.copy(camera.position).addScaledVector(LUA_DIR, 100); luaSp.material.opacity = gap * .9;
    if (luaRosto > 0) { luaRosto--; if (!luaRosto) luaSp.material.map = LUA[0]; return; }
    const mexeu = luaUlt.distanceTo(P.pos) > .02; luaUlt.copy(P.pos);
    semear(3);
    const noite = rnd() < 1 / 3; // uma noite em cada três
    if (ativo && noite && !fl().l4v_lua && gap > .6 && !mexeu && fw.dot(LUA_DIR) > .985) { luaParado += dt; if (luaParado > 5) { fl().l4v_lua = true; luaSp.material.map = LUA[1]; luaRosto = 2; } }
    else luaParado = 0;
  }

  // =================================================================== 5. OLHOS NA FRESTA DO ARMÁRIO
  function olhosArmario() {
    const arm = W.lockers.filter(L => L.tipo === 'armario' && L.g); if (arm.length < 2) return;
    semear(5); const L = arm[Math.floor(rnd() * arm.length)];
    const mat = new THREE.SpriteMaterial({ map: TX_BRILHO, color: 0xd8f0a0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const olhos = [-1, 1].map(s => { const sp = new THREE.Sprite(mat); sp.scale.set(.045, .045, 1); sp.position.set(s * .07, 1.74, .37); sp.userData.l4 = true; L.g.add(sp); return sp; });
    const giz = tex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); for (const x of [80, 176]) { traco(g, roda(x, 110, 34, 18).map(([a, b]) => [a, 110 + (b - 110) * .55]), 'rgba(235,235,225,.9)', 4, 3); g.fillStyle = 'rgba(235,235,225,.85)'; g.beginPath(); g.arc(x, 110, 11, 0, 7); g.fill(); } letreiro(g, 'EU TAMBÉM', 128, 200, 30, 'rgba(235,235,225,.85)'); });
    const dentro = new THREE.Mesh(new THREE.PlaneGeometry(.6, .6), new THREE.MeshBasicMaterial({ map: giz, transparent: true, color: 0x8a8a80, depthWrite: false }));
    dentro.position.set(0, 1.5, .298); dentro.rotation.y = PI; dentro.userData.l4 = true; L.g.add(dentro);
    G.ticks.push((dt, ativo, S) => {
      L.g.getWorldPosition(v2); v2.y = 1.74;
      const d = v2.distanceTo(camera.position);
      mat.opacity = S.hidden ? 0 : naLuz(v2, 9, .97) * clamp((d - 1.6) / 1.5, 0, 1) * (.75 + Math.random() * .25);
      if (S.hidden === L && !fl().l4v_olhos) { fl().l4v_olhos = true; setTimeout(() => { fala('Tem dois olhos desenhados aqui dentro. Alguém já se escondeu aqui... e ficou olhando.'); segredo('olhos'); }, 900); }
    });
    void olhos;
  }

  // =================================================================== 6. LÂMPADA QUE PISCA EM CÓDIGO (corredor do térreo)
  const MORSE = ['-----', '.----', '..---', '...--', '....-', '.....', '-....', '--...', '---..', '----.'];
  function lampadaCodigo() {
    if (mapaId() !== 'terreo') return;
    const L = W.lampadas.find(l => l.sala && (l.sala.id === 'cw' || l.sala.id === 'ce')) || null; if (!L || !L.luz) return;
    const seq = []; // [ligada?, duração]
    for (const dgt of C.S.quadro) { for (const s of MORSE[dgt]) seq.push([1, s === '.' ? .2 : .6], [0, .2]); seq[seq.length - 1][1] = .7; }
    seq.push([0, 2.4]);
    const ciclo = seq.reduce((a, s) => a + s[1], 0);
    let tt = 0, vendo = 0, ultimoI = -1;
    const pos = new THREE.Vector3(L.x, (L.sala.h || 3.2) - .3, L.z);
    G.ticks.push((dt, ativo, S) => {
      if (!S.flags.energia || !L.ligada || C.PROC.fase) return;
      tt = (tt + dt) % ciclo; let acc = 0, i = 0; for (; i < seq.length; i++) { acc += seq[i][1]; if (tt < acc) break; }
      const on = seq[Math.min(i, seq.length - 1)][0];
      const k = OPT.vFlash ? (on ? 1 : .45) : (on ? 1 : .04); // com "reduzir flashes" só esmaece
      L.luz.intensity = L.base * k; L.bulbo.material.emissiveIntensity = on ? 2 : .2;
      const d = Math.hypot(P.pos.x - L.x, P.pos.z - L.z);
      if (i === 0 && ultimoI !== 0 && d < 12) som('l4zumbido');
      if (on && i !== ultimoI && seq[i][1] > .5 && d < 9) som('tique', { x: L.x, y: pos.y, z: L.z });
      ultimoI = i;
      if (ativo && d < 14 && olhar(pos, .9, 14) > .2) { vendo += dt; if (vendo > 6 && !fl().l4v_morse) { fl().l4v_morse = true; fala('Não é defeito. Alguém tá falando.'); segredo('morse'); } if (vendo > ciclo + 6 && !S.fitas.f1) conq('l4_telegrafista'); }
    });
  }

  // =================================================================== 7. VELA FRIA (uma por mapa, só no escuro)
  function velaFria() {
    if (fl()['l4v_vela_' + mapaId()]) return;
    const salas = W.salas.filter(r => !r.fora && (r.x1 - r.x0) > 3 && (r.z1 - r.z0) > 3);
    const lista = salas.length ? salas : W.salas.filter(r => r.fora); if (!lista.length) return;
    semear(7); const r = lista[Math.floor(rnd() * lista.length)];
    const p = noChao(r, 1, 30, .3); if (!p) return;
    const g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.visible = false; g.userData.l4 = true; W.grupo.add(g);
    const cera = new THREE.Mesh(new THREE.CylinderGeometry(.028, .032, .16, 10), new THREE.MeshStandardMaterial({ color: 0xc8d6e6, roughness: .6, emissive: 0x203040, emissiveIntensity: .6 })); cera.position.y = .08; g.add(cera);
    const chama = new THREE.Mesh(new THREE.ConeGeometry(.018, .11, 8), new THREE.MeshBasicMaterial({ color: 0x8fc4ff, transparent: true, opacity: .95, blending: THREE.AdditiveBlending, depthWrite: false }));
    chama.position.y = .22; g.add(chama); // chama fina e pontuda: dá para reconhecer pela forma, não só pela cor
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_BRILHO, color: 0x6a9cff, transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending })); halo.scale.set(.5, .5, 1); halo.position.y = .22; g.add(halo);
    let escuro = 0;
    const it = C.interact(g, () => '<b>E</b>Encostar na vela fria', () => {
      fl()['l4v_vela_' + mapaId()] = true; g.visible = false; som('suspiro', { x: p.x, y: .5, z: p.z });
      const alvo = maisPerto(p.x, p.z, suprimentos());
      if (!alvo) { fala('A chama apagou no meu dedo. Gelada. Não tinha nada pra me mostrar.'); return; }
      pegadasDavi(p, alvo); fala('Pegadas... pequenas. Ele passou por aqui.'); segredo('vela_' + mapaId(), 'O caminho do Davi');
    });
    it.on = () => g.visible;
    G.ticks.push((dt, ativo, S, t) => {
      escuro = S.flashOn ? 0 : escuro + dt;
      const d = Math.hypot(P.pos.x - p.x, P.pos.z - p.z);
      g.visible = escuro > 5 && d < 11 && !fl()['l4v_vela_' + mapaId()];
      if (g.visible) { chama.scale.set(1 + Math.sin(t * 13) * .08, 1 + Math.sin(t * 7.3) * .15, 1); halo.material.opacity = .4 + Math.sin(t * 9) * .1; }
    });
  }
  const PEGS = []; const pegMat = new THREE.MeshBasicMaterial({ map: TX_PE, color: 0x9cc8ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  function pegadasDavi(de, alvo) {
    const r0 = C.roomAt(de.x, de.z), r1 = C.roomAt(alvo.x, alvo.z);
    const portas = caminhoSalas(r0, r1) || [];
    const pts = [{ x: de.x, z: de.z }, ...portas.map(l => ({ x: l.x, z: l.z })), { x: alvo.x, z: alvo.z }];
    let n = 0;
    for (let i = 0; i < pts.length - 1 && n < 70; i++) {
      const a = pts[i], b = pts[i + 1], L = Math.hypot(b.x - a.x, b.z - a.z), dx = (b.x - a.x) / (L || 1), dz = (b.z - a.z) / (L || 1);
      for (let s = .4; s < L && n < 70; s += .45, n++) {
        const lado = n % 2 ? .06 : -.06;
        const m = new THREE.Mesh(new THREE.PlaneGeometry(.08, .16), pegMat.clone()); m.rotation.order = 'YXZ'; m.rotation.set(-PI / 2, Math.atan2(-dx, -dz), 0);
        m.position.set(a.x + dx * s - dz * lado, .02, a.z + dz * s + dx * lado); m.userData.l4 = true; W.grupo.add(m);
        PEGS.push({ m, t: -n * .09 });
      }
    }
  }
  function tickPegadas(dt) {
    for (let i = PEGS.length - 1; i >= 0; i--) {
      const p = PEGS[i]; p.t += dt;
      p.m.material.opacity = p.t < 0 ? 0 : p.t < .25 ? p.t / .25 * .85 : Math.max(0, .85 - (p.t - 2.2) / 5);
      if (p.t > 7.5 || !p.m.parent) { if (p.m.parent) p.m.parent.remove(p.m); p.m.material.dispose(); PEGS.splice(i, 1); }
    }
  }

  // =================================================================== 8. SOMBRA DE CRIANÇA QUE APONTA (lanterna apagada)
  const TX_SOMBRA = { pe: tex(128, 256, (g, w, h) => silCrianca(g, 64, 250, 240, 'rgba(0,0,0,.92)')), aponta: tex(256, 256, (g, w, h) => silCrianca(g, 96, 250, 240, 'rgba(0,0,0,.92)', 'aponta')) };
  function sombraAponta() {
    const salas = W.salas.filter(r => !r.fora && (r.h || 3.2) >= 2.6 && Math.max(r.x1 - r.x0, r.z1 - r.z0) > 5);
    if (!salas.length) return;
    semear(11 + (C.S.chapter | 0)); const r = salas[Math.floor(rnd() * salas.length)];
    const lug = lugarParede(r, 1, 1.6, .9, [0, 1, 2, 3], .3); if (!lug) return;
    const mat = new THREE.MeshBasicMaterial({ map: TX_SOMBRA.pe, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3 });
    const m = naParede(r, lug.lado, lug.c, .78, .62, 1.3, mat, .114);
    let escuro = 0, apontou = false;
    G.ticks.push((dt, ativo, S) => {
      const d = Math.hypot(P.pos.x - m.position.x, P.pos.z - m.position.z), perto = P.room === r && d < 8;
      if (S.flashOn || !perto) { escuro = 0; mat.opacity = 0; if (apontou) { apontou = false; mat.map = TX_SOMBRA.pe; m.scale.x = 1; m.geometry.dispose(); m.geometry = new THREE.PlaneGeometry(.62, 1.3); } return; } // acender apaga na hora
      escuro += dt; mat.opacity = Math.min(.85, escuro * .9);
      if (escuro > 5 && !apontou) {
        apontou = true; mat.map = TX_SOMBRA.aponta; m.geometry.dispose(); m.geometry = new THREE.PlaneGeometry(1.24, 1.3);
        const alvo = maisPerto(m.position.x, m.position.z, suprimentos());
        const ld = lug.lado, u = ld === 0 ? [1, 0] : ld === 1 ? [-1, 0] : ld === 2 ? [0, -1] : [0, 1]; // para onde a textura aponta, no mundo
        let s = 1; if (alvo) s = Math.sign((alvo.x - m.position.x) * u[0] + (alvo.z - m.position.z) * u[1]) || 1;
        m.scale.x = s; // espelha a textura para apontar para o lado certo
        if (ativo && !fl().l4v_sombra) { fl().l4v_sombra = true; fala('A sombra... tá apontando.'); segredo('sombra'); }
      }
    });
  }

  // =================================================================== 9. BAFO NA JANELA FRIA (dormitórios)
  const DESENHOS_BAFO = [
    g => { traco(g, [[100, 60], [70, 170], [186, 170], [156, 60], [100, 60]], '#000', 7, 2); traco(g, [[100, 150], [156, 150]], '#000', 5, 1); for (let i = 0; i < 4; i++) traco(g, [[112 + i * 11, 140], [118 + i * 11, 162]], '#000', 3, 1); },
    g => { traco(g, [[60, 128], [190, 128]], '#000', 8, 2); traco(g, [[150, 92], [192, 128], [150, 164]], '#000', 8, 2); letreiro(g, 'CAMA', 128, 210, 34, '#000'); },
    g => { silCrianca(g, 128, 220, 190, '#000', 'dedo'); },
    g => { letreiro(g, 'ELA CONTA', 128, 90, 34, '#000'); letreiro(g, 'ATÉ 10', 128, 150, 40, '#000'); },
    g => { traco(g, [[70, 200], [70, 120], [128, 70], [186, 120], [186, 200], [70, 200]], '#000', 6, 2); traco(g, [[90, 110], [166, 190]], '#000', 6, 2); traco(g, [[166, 110], [90, 190]], '#000', 6, 2); }
  ];
  const texBafo = i => tex(256, 256, (g, w, h) => {
    for (let k = 0; k < 90; k++) { const x = rand(0, w), y = rand(0, h), r = rand(20, 60), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(230,236,240,.18)'); gr.addColorStop(1, 'rgba(230,236,240,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    g.globalCompositeOperation = 'destination-out'; DESENHOS_BAFO[i % DESENHOS_BAFO.length](g); g.globalCompositeOperation = 'source-over';
    for (let k = 0; k < 30; k++) { g.fillStyle = 'rgba(230,236,240,.25)'; g.fillRect(rand(0, w), rand(h * .5, h), 1.5, rand(6, 22)); } // gotas escorrendo
  });
  const vm = () => window.__visualMundo;
  function janelasDe(f) { const v = vm(); const js = (v && v.janelas) || []; return js.filter(j => j.r && f(j.r)); }
  function bafoJanelas() {
    const js = janelasDe(r => r.tipo === 'dorm'); if (!js.length) return;
    const lista = js.slice(0, 6).map((j, i) => {
      const mat = new THREE.MeshBasicMaterial({ map: texBafo(i), transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
      const m = naParede(j.r, j.lado, j.c, 1.75, .96, 1.24, mat, .1185); return { m, mat, j, t: 0 };
    });
    let ar = 0;
    G.ticks.push((dt, ativo, S) => {
      const prende = !!(keys.Space || P.arTrava) && ativo && !S.hidden;
      let perto = null; for (const b of lista) if (b.m.position.distanceTo(camera.position) < 1.1 && olhar(b.m.position, .75, 1.3) > 0) perto = b;
      if (prende) ar += dt;
      else { if (ar >= 3 && perto) { perto.t = 4.6; if (!fl().l4v_bafo) { fl().l4v_bafo = true; setTimeout(() => fala('Tem um desenho no vidro. Feito com o dedo. Dedo pequeno.'), 700); segredo('bafo'); } } ar = 0; }
      for (const b of lista) { b.t = Math.max(0, b.t - dt); b.mat.opacity = b.t > 4 ? (4.6 - b.t) / .6 * .9 : b.t / 4 * .9; }
    });
  }

  // =================================================================== 10. O VIDRO DO CORREDOR QUE MOSTRA SEIS PORTAS
  const TX_SEIS = tex(256, 320, (g, w, h) => {
    g.fillStyle = '#0b0a09'; g.fillRect(0, 0, w, h);
    const vx = 128, vy = 150;
    g.strokeStyle = 'rgba(150,140,120,.45)'; g.lineWidth = 2;
    for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h]]) { g.beginPath(); g.moveTo(x, y); g.lineTo(vx + (x - vx) * .08, vy + (y - vy) * .08); g.stroke(); }
    for (let i = 0; i < 6; i++) { // seis portas do lado direito, a última com um F
      const k0 = .95 - i * .14, k1 = k0 - .08, X0 = vx + (w - vx) * k0, X1 = vx + (w - vx) * k1, Y0 = vy - 110 * k0, Y1 = vy + 150 * k0, Y0b = vy - 110 * k1, Y1b = vy + 150 * k1;
      g.fillStyle = i === 5 ? 'rgba(170,120,60,.75)' : 'rgba(70,52,36,.85)'; g.beginPath(); g.moveTo(X0, Y0 * .5 + vy * .5); g.lineTo(X1, Y0b * .5 + vy * .5); g.lineTo(X1, Y1b); g.lineTo(X0, Y1); g.fill();
      if (i === 5) { g.fillStyle = 'rgba(255,220,150,.9)'; g.font = 'bold 14px Georgia'; g.fillText('F', X1 + 1, vy - 4); }
    }
    for (let i = 0; i < 5; i++) { const k0 = .95 - i * .17, k1 = k0 - .09, X0 = vx - vx * k0, X1 = vx - vx * k1; g.fillStyle = 'rgba(70,52,36,.85)'; g.beginPath(); g.moveTo(X0, vy - 55 * k0); g.lineTo(X1, vy - 55 * k1); g.lineTo(X1, vy + 150 * k1); g.lineTo(X0, vy + 150 * k0); g.fill(); }
    const gr = g.createRadialGradient(w / 2, h / 2, 30, w / 2, h / 2, 190); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.85)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  function seisPortas() {
    if (mapaId() !== 'superior') return; const r = SALA('corr'); if (!r) return;
    const j = janelasDe(x => x.id === 'corr').find(x => x.lado === 0);
    let c = j ? j.c : 0;
    if (!j) { // não tem janela ali: põe um vidro com moldura
      const b = regiao(r, 0, c, 1.75, 1, 1.3, .2); if (!livre(b)) return; ocupar(b);
      naParede(r, 0, c, 1.75, 1, 1.3, new THREE.MeshStandardMaterial({ color: 0x0a0e12, roughness: .08, metalness: .6 }), .112);
      for (const [w, h, dy, dx] of [[1.12, .07, .67, 0], [1.12, .07, -.67, 0], [.07, 1.36, 0, -.53], [.07, 1.36, 0, .53]]) { const m = naParede(r, 0, c + dx, 1.75 + dy, w, h, new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: .9 }), .121); void m; }
    }
    const mat = new THREE.MeshBasicMaterial({ map: TX_SEIS, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
    const m = naParede(r, 0, c, 1.75, .94, 1.2, mat, .1186);
    let vt = 0;
    G.ticks.push((dt, ativo) => {
      const d = m.position.distanceTo(camera.position);
      mat.opacity = lerp(mat.opacity, d < 3 ? naLuz(m.position, 3, .97) * .8 : 0, Math.min(1, dt * 6));
      if (ativo && mat.opacity > .5) { vt += dt; if (vt > 1.2 && !fl().l4v_seis) { fl().l4v_seis = true; fala('(sussurrando) Eram cinco... não eram?'); segredo('seis'); } }
    });
  }

  // =================================================================== 11. NA JANELA, A LIA TEM DOZE ANOS
  const TX_LIAMENINA = { olha: tex(128, 256, (g, w, h) => menina(g, false)), dedo: tex(128, 256, (g, w, h) => menina(g, true)) };
  function menina(g, dedo) {
    g.clearRect(0, 0, 128, 256);
    g.fillStyle = 'rgba(90,96,120,.85)'; g.beginPath(); g.moveTo(40, 110); g.lineTo(88, 110); g.lineTo(98, 230); g.lineTo(30, 230); g.fill(); // uniforme
    g.fillStyle = 'rgba(200,180,160,.85)'; g.beginPath(); g.arc(64, 76, 22, 0, 7); g.fill();
    g.fillStyle = 'rgba(40,28,20,.95)'; g.beginPath(); g.arc(64, 70, 24, PI, 0); g.fill(); g.fillRect(40, 68, 8, 40); g.fillRect(80, 68, 8, 40); // cabelo
    g.fillStyle = '#1a1210'; g.fillRect(55, 76, 5, 4); g.fillRect(69, 76, 5, 4);
    if (dedo) { g.strokeStyle = 'rgba(200,180,160,.95)'; g.lineWidth = 6; g.beginPath(); g.moveTo(80, 140); g.lineTo(70, 108); g.lineTo(65, 88); g.stroke(); }
    else { g.fillStyle = '#444'; g.fillRect(84, 150, 22, 8); g.fillStyle = 'rgba(255,230,160,.6)'; g.beginPath(); g.moveTo(106, 154); g.lineTo(128, 140); g.lineTo(128, 170); g.fill(); }
  }
  function liaMenina() {
    const js = janelasDe(r => r.id === 'dormE' || r.id === 'dormC' || r.id === 'dormA'); if (!js.length) return;
    const j = js[0], mat = new THREE.MeshBasicMaterial({ map: TX_LIAMENINA.olha, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -5 });
    const m = naParede(j.r, j.lado, j.c, 1.62, .32, .64, mat, .1188);
    const base = m.position.clone(), eixo = j.lado < 2 ? 'x' : 'z';
    const buf = []; let dedoT = 0, sumiu = false;
    G.ticks.push((dt, ativo, S, t) => {
      if (sumiu || fl().l4v_menina) { mat.opacity = 0; return; }
      buf.push({ t, v: camera.position[eixo] }); while (buf.length > 2 && buf[1].t < t - .3) buf.shift(); // 300 ms atrasada
      const atras = buf[0].v, d = base.distanceTo(camera.position);
      m.position[eixo] = clamp(base[eixo] + (atras - base[eixo]) * .5, base[eixo] - .3, base[eixo] + .3);
      const ver = olhar(base, .85, 6);
      if (dedoT > 0) { dedoT -= dt; mat.opacity = .7 * clamp(dedoT / .3, 0, 1); if (dedoT <= 0) { sumiu = true; fl().l4v_menina = true; fala('Era eu. Com doze anos. Ela pediu silêncio.'); segredo('menina'); } return; }
      mat.opacity = lerp(mat.opacity, ver > 0 && d > 1 && d < 5 ? .55 * ver : 0, Math.min(1, dt * 4));
      if (mat.opacity > .25 && d < 1) { mat.map = TX_LIAMENINA.dedo; dedoT = .9; som('sussurros', .6); }
    });
  }

  // =================================================================== 12. O QUE SÓ APARECE COM A PILHA MORRENDO
  const FRACOS = [
    g => { for (let i = 0; i < 4; i++) { const x = 50 + i * 55, y = 130 + Math.sin(i) * 20; g.fillStyle = 'rgba(40,30,25,.8)'; g.beginPath(); g.ellipse(x, y, 16, 22, 0, 0, 7); g.fill(); for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x - 16 + k * 8, y - 30 - Math.sin(k / 4 * PI) * 8, 4, 10, 0, 0, 7); g.fill(); } } },
    g => { letreiro(g, 'QUANDO A LUZ MORRE', 128, 100, 24, 'rgba(40,30,25,.85)'); letreiro(g, 'A GENTE APARECE', 128, 150, 28, 'rgba(40,30,25,.85)'); },
    g => { traco(g, [[40, 128], [200, 128]], 'rgba(40,30,25,.85)', 9, 3); traco(g, [[160, 88], [210, 128], [160, 168]], 'rgba(40,30,25,.85)', 9, 3); letreiro(g, 'PILHA', 120, 200, 26, 'rgba(40,30,25,.85)'); }
  ];
  function pilhaFraca() {
    if (!['terreo', 'superior', 'tuneis'].includes(mapaId())) return;
    const salas = W.salas.filter(r => !r.fora && Math.max(r.x1 - r.x0, r.z1 - r.z0) > 5); if (salas.length < 2) return;
    semear(13); const usadas = [];
    for (let i = 0; i < 3; i++) {
      const r = salas[Math.floor(rnd() * salas.length)]; const lug = lugarParede(r, 1.1, 1.1, 1.3); if (!lug) continue;
      const mat = new THREE.MeshBasicMaterial({ map: tex(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); FRACOS[i](g); furos(g, w, h, 500); }), transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 });
      const m = naParede(r, lug.lado, lug.c, 1.3, 1.1, 1.1, mat);
      usadas.push({ m, mat, r, lug, i });
    }
    const seta = usadas.find(u => u.i === 2);
    if (seta && C.item && C.MK) { // a seta aponta para pilhas que só quem deixa a luz morrer acha
      const { r, lug } = seta, dir = lug.lado === 0 ? [1, 0] : lug.lado === 1 ? [-1, 0] : lug.lado === 2 ? [0, -1] : [0, 1], n = NORM[lug.lado];
      let x = seta.m.position.x + dir[0] * 1.6 + n[0] * .35, z = seta.m.position.z + dir[1] * 1.6 + n[1] * .35;
      x = clamp(x, r.x0 + .4, r.x1 - .4); z = clamp(z, r.z0 + .4, r.z1 - .4);
      try { C.item('l4pilha', { x, y: .03, z }, C.MK.pilha(), 'Pegar pilhas', () => { const S = C.S; S.inv.pilhas++; C.toast('Pilhas guardadas. R para trocar.'); segredo('pilhaFraca_' + mapaId(), 'Achou com a luz morrendo'); }); } catch (e) {}
    }
    let falou = false;
    G.ticks.push((dt, ativo, S) => {
      const fraca = luzOn() && S.battery < 15;
      for (const u of usadas) u.mat.opacity = lerp(u.mat.opacity, fraca ? naLuz(u.m.position, 6, .9) * .9 : 0, Math.min(1, dt * 5));
      if (fraca && !falou && usadas.some(u => u.mat.opacity > .5)) { falou = true; if (ativo) fala('Só aparece com a luz fraca...'); }
    });
  }

  // =================================================================== 13. O CÍRCULO SECO NO PÁTIO
  const elAbraco = document.createElement('div');
  elAbraco.style.cssText = 'position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 40%,rgba(160,90,40,.42) 100%);opacity:0;transition:opacity .6s;z-index:3';
  document.body.appendChild(elAbraco);
  function circuloSeco() {
    if (mapaId() !== 'terreo') return; const r = SALA('patio'); if (!r) return;
    semear(17); const x = lerp(r.x0 + 3, r.x1 - 3, rnd()), z = lerp(r.z0 + 3, r.z1 - 3, rnd());
    const seco = tex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(128, 128, 60, 128, 128, 128); gr.addColorStop(0, 'rgba(120,108,92,.55)'); gr.addColorStop(.8, 'rgba(120,108,92,.4)'); gr.addColorStop(1, 'rgba(120,108,92,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    const disco = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshStandardMaterial({ map: seco, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }));
    disco.rotation.x = -PI / 2; disco.position.set(x, .016, z); disco.userData.l4 = true; W.grupo.add(disco);
    const pes = [-1, 1].map(s => { const m = new THREE.Mesh(new THREE.PlaneGeometry(.08, .16), new THREE.MeshStandardMaterial({ map: TX_PE, color: 0x2a221a, transparent: true, depthWrite: false, roughness: 1 })); m.rotation.order = 'YXZ'; m.rotation.set(-PI / 2, 0, 0); m.position.set(x + s * .06, .02, z); m.userData.l4 = true; W.grupo.add(m); return m; });
    let dentroAnt = false;
    G.seco = { x, z };
    G.ticks.push((dt, ativo, S) => {
      const d = Math.hypot(P.pos.x - x, P.pos.z - z), dentro = d < 1.05 && ativo;
      if (dentro) { S.fear = Math.max(0, S.fear - dt * 30); if (!fl().l4v_seco) { fl().l4v_seco = true; fala('Não chove aqui. E tá... quente. Como um abraço.'); segredo('seco'); } }
      elAbraco.style.opacity = dentro ? 1 : 0;
      if (dentroAnt && !dentro && d > 1.2) for (const m of pes) m.rotation.y = Math.atan2(-(P.pos.x - x), -(P.pos.z - z)); // ao sair, as pegadinhas se viraram para a Lia
      dentroAnt = dentro || (dentroAnt && d < 1.2);
    });
  }
  function semChuva() { // tira as gotas que cairiam dentro do círculo seco
    if (!G || !G.seco || !C.chuvaGeo || !P.room || !P.room.fora) return;
    const a = C.chuvaGeo.attributes.position.array, ox = camera.position.x, oz = camera.position.z, sx = G.seco.x, sz = G.seco.z;
    if (Math.hypot(ox - sx, oz - sz) > 26) return;
    let mudou = false;
    for (let o = 0; o < a.length; o += 6) { const dx = a[o] + ox - sx, dz = a[o + 2] + oz - sz; if (dx * dx + dz * dz < 1.2 && a[o + 1] < 6) { a[o + 1] = a[o + 4] = -60; mudou = true; } }
    if (mudou) C.chuvaGeo.attributes.position.needsUpdate = true;
  }

  // =================================================================== 14. A LÁPIDE QUE SÓ EXISTE NA POÇA (cemitério)
  function lapidePoca() {
    if (mapaId() !== 'cemiterio') return; const r = SALA('cem'); if (!r) return;
    let p = null; for (let i = 0; i < 80 && !p; i++) { const x = rand(-14, 14), z = rand(-40, 4); _b.set(v1.set(x - 1.3, .05, z - 2.5), v2.set(x + 1.3, 1.5, z + 1.2)); if (livre(_b)) { ocupar(_b); p = { x, z }; } }
    if (!p) return;
    const poca = new THREE.Mesh(new THREE.CircleGeometry(1.25, 28), new THREE.MeshStandardMaterial({ color: 0x0b0d10, roughness: .04, metalness: .75, transparent: true, opacity: .92, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    poca.rotation.x = -PI / 2; poca.scale.set(1, .75, 1); poca.position.set(p.x, .018, p.z); poca.userData.l4 = true; W.grupo.add(poca);
    const ref = tex(256, 320, (g, w, h) => {
      g.save(); g.translate(0, h); g.scale(1, -1); // de cabeça para baixo: é reflexo
      g.fillStyle = 'rgba(150,150,140,.9)'; g.beginPath(); g.moveTo(40, h); g.lineTo(40, 90); g.quadraticCurveTo(128, 10, 216, 90); g.lineTo(216, h); g.fill();
      g.fillStyle = 'rgba(40,40,36,.95)'; g.font = 'bold 26px Georgia'; g.textAlign = 'center'; g.fillText('DAVI MORAES', 128, 150); g.font = '22px Georgia'; g.fillText('1967 — 1994', 128, 190);
      g.restore();
    });
    const mat = new THREE.MeshBasicMaterial({ map: ref, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
    const reflexo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.25), mat); reflexo.rotation.x = -PI / 2; reflexo.position.set(p.x, .02, p.z + .1); reflexo.userData.l4 = true; W.grupo.add(reflexo);
    const terra = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8, 0, PI * 2, 0, PI / 2), new THREE.MeshStandardMaterial({ color: 0x2c1e14, roughness: 1 }));
    terra.scale.set(.55, .16, 1.05); terra.position.set(p.x, 0, p.z - 1.9); terra.visible = false; terra.userData.l4 = true; W.grupo.add(terra);
    const vazio = new THREE.Vector3(p.x, .4, p.z - 1.9);
    let vt = 0, viu = !!fl().l4v_poca;
    if (viu) terra.visible = true;
    G.ticks.push((dt, ativo) => {
      const alvo = pitch() < -.4 ? naLuz(poca.position, 6, .9) : 0;
      mat.opacity = lerp(mat.opacity, alvo * .75, Math.min(1, dt * 5));
      if (ativo && mat.opacity > .45 && !viu) { vt += dt; if (vt > .9) { viu = true; fl().l4v_poca = true; fala('1994... é hoje.'); } }
      if (viu && !terra.visible && pitch() > -.15 && olhar(vazio, .9, 8) > .2 && mat.opacity < .1) { terra.visible = true; som('arrastar'); conq('l4_hoje'); segredo('poca', 'A lápide da poça'); setTimeout(() => fala('Terra fresca. Alguém cavou. Agora.'), 600); }
    });
  }

  // =================================================================== 15. A FOTO DA TURMA DE 1978 (recepção)
  function texTurma(est) {
    return tex(384, 256, (g, w, h) => {
      g.fillStyle = '#d8d0bc'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a3630'; g.fillRect(14, 14, w - 28, h - 48);
      const gr = g.createLinearGradient(0, 14, 0, h - 34); gr.addColorStop(0, '#77706a'); gr.addColorStop(1, '#2a2622'); g.fillStyle = gr; g.fillRect(18, 18, w - 36, h - 56);
      const pessoa = (x, y, s, cor, lado) => { g.fillStyle = cor; g.beginPath(); g.arc(x + (lado || 0) * s * .03, y - s * .62, s * .14, 0, 7); g.fill(); g.fillRect(x - s * .2, y - s * .48, s * .4, s * .48); if (lado) { g.fillStyle = '#16120e'; g.fillRect(x + lado * s * .1, y - s * .64, s * .05, s * .03); } else { g.fillStyle = '#16120e'; g.fillRect(x - s * .06, y - s * .64, s * .03, s * .03); g.fillRect(x + s * .03, y - s * .64, s * .03, s * .03); } };
      for (let i = 0; i < 8; i++) pessoa(46 + i * 42, 104, 70, i === 6 && est >= 2 ? '#a8a296' : '#bdb6a8', i === 6 && est >= 2 ? 1 : 0); // fileira de trás (em pé)
      for (let i = 0; i < 7; i++) { const x = 66 + i * 42; g.fillStyle = '#4a4036'; g.fillRect(x - 16, 150, 32, 40); if (i === 4) { if (est >= 4) { pessoa(x, 176, 92, '#c4bba8'); g.fillStyle = '#3a4a6a'; g.fillRect(x - 18, 132, 36, 44); g.fillStyle = '#ffe9a8'; g.fillRect(x + 14, 156, 12, 5); } else if (est >= 3) pessoa(x, 176, 92, 'rgba(20,18,16,.92)'); continue; } pessoa(x, 176, 60, '#c8c0b0'); }
      g.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 300; i++) g.fillRect(rand(18, w - 18), rand(18, h - 38), 1, 1);
      g.fillStyle = '#3a342a'; g.font = 'italic 16px Georgia'; g.textAlign = 'center'; g.fillText('Turma de 1978 · Internato São Lázaro', w / 2, h - 14);
    });
  }
  function fotoTurma() {
    if (mapaId() !== 'terreo') return; const r = SALA('hall'); if (!r) return;
    const noites = Math.max(1, stats().partidas | 0), est = Math.min(4, noites); // muda a cada noite jogada
    const lug = lugarParede(r, .9, .7, 1.6, [2, 3, 0, 1], .25); if (!lug) return;
    const moldura = naParede(r, lug.lado, lug.c, 1.6, .98, .72, new THREE.MeshStandardMaterial({ color: 0x3a2616, roughness: .7 }), .108);
    const foto = naParede(r, lug.lado, lug.c, 1.6, .9, .6, new THREE.MeshStandardMaterial({ map: texTurma(est), roughness: .35, metalness: .1 }), .113);
    foto.userData.leitura = ['', 'Turma de 1978. Ninguém sorri.', 'Turma de 1978. Um menino lá atrás olha para o lado.', 'Turma de 1978. Numa cadeira vazia, uma mulher sentada.', 'Turma de 1978. A mulher na cadeira é a Lia, de jaqueta e lanterna.'][est];
    void moldura;
    let vt = 0;
    G.ticks.push((dt, ativo) => { if (!ativo || est < 3 || fl().l4v_turma) return; if (olhar(foto.position, .96, 3) > .3) { vt += dt; if (vt > 1.5) { fl().l4v_turma = true; fala(est >= 4 ? 'Essa sou eu. Na foto de 1978.' : 'Tinha uma cadeira vazia nessa foto. Eu juro que tinha.'); segredo('turma'); } } else vt = 0; });
  }

  // =================================================================== 16. O DESENHO QUE SE COMPLETA (Dormitório D)
  const texMaos = completo => tex(512, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); const cor = 'rgba(232,232,222,.9)';
    for (let i = 0; i < 4; i++) palito(g, 70 + i * 90, 220, 120, cor, { bracos: 'baixo', saia: i % 2 === 1, tranca: i === 1 });
    for (let i = 0; i < 3; i++) traco(g, [[70 + i * 90 + 28, 167], [70 + (i + 1) * 90 - 28, 167]], cor, 3, 2);
    if (completo) { palito(g, 440, 220, 170, cor, { lanterna: false }); traco(g, [[340, 167], [412, 152]], cor, 3, 2); traco(g, [[466, 150], [490, 140]], cor, 5, 2); traco(g, [[490, 140], [506, 120], [506, 160], [490, 140]], 'rgba(255,230,150,.7)', 3, 2); letreiro(g, 'LIA', 440, 30, 26, cor); }
    else traco(g, [[412, 222], [470, 222]], 'rgba(232,232,222,.25)', 2, 1);
    furos(g, w, h, 700, .8);
  });
  function desenhoCompleta() {
    if (mapaId() !== 'superior') return; const r = SALA('dormD'); if (!r) return;
    const lug = lugarParede(r, 1.8, .9, 1.25); if (!lug) return;
    const mat = new THREE.MeshStandardMaterial({ map: texMaos(!!fl().l4v_desenho), transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
    const m = naParede(r, lug.lado, lug.c, 1.25, 1.8, .9, mat);
    const po = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(60 * 3), 3)), new THREE.PointsMaterial({ color: 0xe8e8de, size: .012, transparent: true, opacity: 0, depthWrite: false }));
    po.frustumCulled = false; po.userData.l4 = true; W.grupo.add(po);
    const n = NORM[lug.lado], ponta = m.position.clone(); if (lug.lado < 2) ponta.x += (lug.lado === 0 ? 1 : -1) * .7; else ponta.z += (lug.lado === 2 ? -1 : 1) * .7;
    let viu = 0, fora = 0, feito = !!fl().l4v_desenho, falou = false, poT = 0;
    G.ticks.push((dt, ativo) => {
      if (poT > 0) { poT -= dt; const a = po.geometry.attributes.position.array; for (let i = 0; i < 60; i++) { a[i * 3 + 1] -= dt * (.3 + (i % 5) * .08); if (a[i * 3 + 1] < .02) a[i * 3 + 1] = .02; } po.geometry.attributes.position.needsUpdate = true; po.material.opacity = Math.min(.8, poT); }
      if (!ativo || !naSala('dormD')) { fora = 0; return; }
      const v = olhar(m.position, .9, 7) > 0;
      if (!feito) {
        if (v) { viu += dt; fora = 0; } else if (viu > .8) { fora += dt; if (fora > 5) { // completou enquanto ninguém olhava
          feito = true; fl().l4v_desenho = true; mat.map = texMaos(true); mat.needsUpdate = true; som('l4giz');
          const a = po.geometry.attributes.position.array; for (let i = 0; i < 60; i++) { a[i * 3] = ponta.x + rand(-.15, .15) + n[0] * .15; a[i * 3 + 1] = rand(.6, 1.6); a[i * 3 + 2] = ponta.z + rand(-.15, .15) + n[1] * .15; } po.geometry.attributes.position.needsUpdate = true; poT = 3.5;
        } }
      } else if (!falou && v && poT > 0) { falou = true; fala('Essa sou eu.'); segredo('desenho'); }
    });
  }

  // =================================================================== 17. TEATRINHO DE SOMBRAS NO LENÇOL (sala de brinquedos)
  const texTeatro = () => tex(512, 320, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.85)';
    // coelho
    g.beginPath(); g.ellipse(90, 220, 40, 30, 0, 0, 7); g.fill(); g.beginPath(); g.arc(128, 190, 20, 0, 7); g.fill(); for (const dx of [0, 14]) { g.beginPath(); g.ellipse(124 + dx, 150, 6, 26, .2, 0, 7); g.fill(); }
    // casinha
    g.fillRect(220, 180, 80, 70); g.beginPath(); g.moveTo(210, 180); g.lineTo(260, 130); g.lineTo(310, 180); g.fill();
    // sino
    g.beginPath(); g.moveTo(380, 150); g.quadraticCurveTo(410, 150, 415, 230); g.lineTo(445, 240); g.lineTo(315 + 30, 240); g.lineTo(375, 230); g.quadraticCurveTo(380, 150, 410, 150); g.fill();
    for (const x of [130, 260, 410]) g.fillRect(x - 2, 250, 4, 70); // varetas
  });
  const texAlto = virado => tex(128, 320, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.9)';
    g.save(); g.translate(64, 60); g.rotate(virado ? -.15 : .45); g.beginPath(); g.ellipse(0, 0, 18, 24, 0, 0, 7); g.fill(); g.restore(); // cabeça torta
    g.beginPath(); g.moveTo(50, 84); g.lineTo(78, 84); g.lineTo(84, 320); g.lineTo(44, 320); g.fill();
    g.lineWidth = 8; g.strokeStyle = 'rgba(0,0,0,.9)'; g.beginPath(); g.moveTo(52, 96); g.lineTo(20, 240); g.moveTo(76, 96); g.lineTo(108, 240); g.stroke();
    if (virado) { g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(52, 54, 6, 3); g.fillRect(68, 54, 6, 3); }
  });
  function teatroLencol() {
    if (mapaId() !== 'superior') return; const r = SALA('brinq'); if (!r) return;
    const p = noChao(r, 1.6, 30, .9); if (!p) return;
    const g = new THREE.Group(); g.position.set(p.x, 0, p.z); g.rotation.y = rand(0, PI); g.userData.l4 = true; W.grupo.add(g);
    const madeira = new THREE.MeshStandardMaterial({ color: 0x5a3e24, roughness: .9 });
    for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(.05, 1.75, .05), madeira); b.position.set(s * .78, .875, 0); g.add(b); }
    const barra = new THREE.Mesh(new THREE.BoxGeometry(1.62, .05, .05), madeira); barra.position.y = 1.75; g.add(barra);
    const lencol = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0), new THREE.MeshStandardMaterial({ color: 0xd8d2c0, roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: .93 }));
    lencol.position.y = 1.22; g.add(lencol);
    for (const [x, c] of [[-.42, 0x8a7a5a], [.02, 0x7a6a4a], [.42, 0x9a8a6a]]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(.22, .2), new THREE.MeshStandardMaterial({ color: c, roughness: 1, side: THREE.DoubleSide })); b.position.set(x, 1.0, -.22); g.add(b); const v = new THREE.Mesh(new THREE.BoxGeometry(.012, .5, .012), madeira); v.position.set(x, .7, -.22); g.add(v); }
    const somb = [1, -1].map(s => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.46, .92), new THREE.MeshBasicMaterial({ map: texTeatro(), transparent: true, opacity: 0, depthWrite: false })); m.position.set(0, 1.2, s * .006); if (s < 0) m.rotation.y = PI; g.add(m); return m; });
    const TA = [texAlto(false), texAlto(true)];
    const alto = [1, -1].map(s => { const m = new THREE.Mesh(new THREE.PlaneGeometry(.32, .78), new THREE.MeshBasicMaterial({ map: TA[0], transparent: true, opacity: 0, depthWrite: false })); m.position.set(.5, 1.25, s * .008); if (s < 0) m.rotation.y = PI; g.add(m); return m; });
    let luzT = 0, sobra = 0, ax = .5, virou = false;
    G.ticks.push((dt, ativo) => {
      lencol.getWorldPosition(v2);
      const l = naLuz(v2, 6, .9);
      if (l > .2) { luzT += dt; sobra = 1; } else { sobra = Math.max(0, sobra - dt); if (sobra <= 0) luzT = Math.max(0, luzT - dt * 2); }
      const a = l > .2 ? l : 0;
      for (const m of somb) m.material.opacity = a * .8;
      const extra = luzT > 1.5; // a sombra a mais aparece e fica 1 s depois que a luz sai
      ax = extra ? Math.max(-.55, ax - dt * .12) : .5;
      const op = extra ? (l > .2 ? .85 : .85 * sobra) : 0;
      for (const m of alto) { m.material.opacity = op; m.position.x = m.rotation.y ? -ax : ax; }
      if (extra && luzT > 4.5 && !virou) { virou = true; for (const m of alto) m.material.map = TA[1]; som('risada', v2.x, v2.z); if (ativo) { fala('Não tinha esse boneco.'); conq('l4_naotinha'); segredo('teatro'); } }
      if (!extra && virou && luzT <= 0) { virou = false; for (const m of alto) m.material.map = TA[0]; }
    });
  }

  // =================================================================== 18. MODO FOTO: QUEM ESTÁ ATRÁS / EXPOSIÇÃO LONGA
  const texCrianca = (costas) => tex(128, 256, (g, w, h) => { silCrianca(g, 64, 250, 236, 'rgba(14,12,12,.96)'); if (!costas) { g.fillStyle = 'rgba(220,214,200,.85)'; g.beginPath(); g.arc(64, 47, 17, 0, 7); g.fill(); g.fillStyle = '#000'; g.fillRect(56, 44, 5, 5); g.fillRect(68, 44, 5, 5); } });
  const fotoCri = new THREE.Sprite(new THREE.SpriteMaterial({ map: texCrianca(false), transparent: true, depthWrite: false })); fotoCri.scale.set(.6, 1.2, 1); fotoCri.visible = false; scene.add(fotoCri);
  const fotoPassa = new THREE.Sprite(new THREE.SpriteMaterial({ map: texCrianca(true), transparent: true, depthWrite: false })); fotoPassa.scale.set(.6, 1.2, 1); fotoPassa.visible = false; scene.add(fotoPassa);
  const FT = { em: false, yaw: 0, base: new THREE.Vector3(), atras: false, parado: 0, ult: new THREE.Vector3(), ultR: new THREE.Euler(), passa: -1, dir: new THREE.Vector3(), lat: new THREE.Vector3(), dist: 5 };
  function tickFoto(dt) {
    const S = C.S, em = document.body.classList.contains('modo-foto') && !!S && C.mode === 'jogo';
    if (em && !FT.em) {
      FT.em = true; FT.base.copy(P.pos); FT.yaw = camera.rotation.y; FT.parado = 0; FT.ult.copy(camera.position); FT.ultR.copy(camera.rotation);
      const chave = 'l4v_atras_' + (S.chapter | 0);
      FT.atras = (stats().partidas | 0) >= 2 && !S.flags[chave] && Math.random() < .5;
      if (FT.atras) { S.flags[chave] = true; fotoCri.position.set(P.pos.x + Math.sin(FT.yaw) * .55, .62, P.pos.z + Math.cos(FT.yaw) * .55); fotoCri.visible = true; }
    } else if (!em && FT.em) { FT.em = false; fotoCri.visible = false; fotoPassa.visible = false; FT.passa = -1; }
    if (!em) return;
    const rev = $('#pl-foto .pf-rev'); if (rev && !rev.hidden) fotoCri.visible = false; // some depois do clique, mas fica na foto
    // exposição longa: câmera parada 9 s num canto escuro
    const parada = FT.ult.distanceTo(camera.position) < .002 && Math.abs(FT.ultR.y - camera.rotation.y) < .0005 && Math.abs(FT.ultR.x - camera.rotation.x) < .0005;
    FT.ult.copy(camera.position); FT.ultR.copy(camera.rotation);
    if (FT.passa >= 0) {
      FT.passa += dt; const k = FT.passa / 2.6;
      fotoPassa.position.copy(camera.position).addScaledVector(FT.dir, FT.dist).addScaledVector(FT.lat, lerp(-2.2, 2.2, k)); fotoPassa.position.y = .6;
      if (k >= 1) { FT.passa = -1; fotoPassa.visible = false; }
      return;
    }
    FT.parado = parada ? FT.parado + dt : 0;
    if (FT.parado > 9) {
      FT.parado = 0;
      camera.getWorldDirection(FT.dir); FT.dir.y = 0; FT.dir.normalize();
      const escuro = !W.lampadas.some(L => L.ligada && L.luz && L.luz.intensity > .5 && Math.hypot(L.x - (camera.position.x + FT.dir.x * 4), L.z - (camera.position.z + FT.dir.z * 4)) < 5);
      if (!escuro) return;
      const n = (DB.expo | 0) + 1; DB.expo = n; gravar();
      FT.dist = n >= 2 ? 2.6 : 5; FT.lat.set(-FT.dir.z, 0, FT.dir.x); FT.passa = 0; fotoPassa.visible = true;
      conq('l4_exposicao');
    }
  }

  // =================================================================== 19. A VENDA QUE DEIXA VER
  let vendaOlhosM = null, vendaT = 0, vendaShow = 0;
  function vendaOlhos() {
    if (vendaOlhosM || !MON || !MON.cabeca) return;
    const mat = new THREE.MeshBasicMaterial({ color: 0xe8ecf0, transparent: true, opacity: 0, depthWrite: false });
    vendaOlhosM = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(.019, 10, 8), mat); e.scale.set(1.2, .8, .4); e.position.set(s * .046, .17, .148); MON.cabeca.add(e); const p = new THREE.Mesh(new THREE.CircleGeometry(.006, 8), new THREE.MeshBasicMaterial({ color: 0x8a9aa0, transparent: true, opacity: 0, depthWrite: false })); p.position.set(s * .046, .17, .157); MON.cabeca.add(p); return p; });
    vendaOlhosM.mat = mat;
  }
  function tickVenda(dt, ativo, S) {
    if (!vendaOlhosM) return;
    const mat = vendaOlhosM.mat;
    if (vendaShow > 0) { vendaShow -= dt; const a = clamp(vendaShow / .4, 0, 1) * clamp((1.6 - vendaShow) / .3, 0, 1); mat.opacity = a * .95; for (const p of vendaOlhosM) p.material.opacity = a; return; }
    mat.opacity = 0; for (const p of vendaOlhosM) p.material.opacity = 0;
    if (!ativo || !M.ativo || M.state !== 'reza' || fl().l4v_venda) { vendaT = 0; return; }
    MON.cabeca.getWorldPosition(v2); v2.y += .17;
    if (v2.distanceTo(camera.position) < 1.6 && naLuz(v2, 1.7, .96) > .4) { vendaT += dt; if (vendaT > 2) { vendaShow = 1.6; fl().l4v_venda = true; som('coracao', 1); setTimeout(() => fala('(sussurrando) Ele não é cego de tudo.'), 1700); segredo('venda'); } } else vendaT = 0;
  }

  // =================================================================== 20. PAPEL DE BALA VERMELHO NA LANTERNA
  let verm = false, fUlt = -9;
  const D0 = flash.distance;
  document.addEventListener('keydown', e => {
    if (e.code !== 'KeyF' || e.repeat || C.mode !== 'jogo' || C.ui || !C.S || !fl().l4v_celofane) return;
    const ag = performance.now() / 1000;
    if (ag - fUlt < .35) { verm = !verm; fUlt = -9; som('papel'); som('l4plastico'); try { C.toast(verm ? 'Papel vermelho na lanterna.' : 'Tirou o papel vermelho.'); } catch (er) {} }
    else fUlt = ag;
  });
  function luz(dt, S) { // antes do polimento da lanterna: tinge o feixe
    if (verm && S && S.flashOn) {
      flash.color.setHex(dalt() ? 0xff40d0 : 0xff2814); if (C.flashFill) C.flashFill.color.copy(flash.color);
      flash.intensity *= .72; flash.distance = 12;
    } else if (flash.distance !== D0) flash.distance = D0;
    if (OPT.vDavi && DB.davi && S && S.flashOn && !verm) flash.color.lerp(AMARELO, .4);
  }
  const AMARELO = new THREE.Color(0xffd27a);
  const RECADOS = ['ELA NÃO ABRE\nPORTA FECHADA', 'O HOMEM NÃO VÊ\nELE OUVE', 'NO ARMÁRIO\nSEGURA O AR', 'ESSA LUZ\nNÃO VALE PRA ELA', 'CONTA JUNTO\nBAIXINHO'];
  function celofane() {
    if (mapaId() !== 'superior') return;
    const r = SALA('brinq');
    if (r && !fl().l4v_celofane) {
      const p = apoio(r) || (() => { const q = noChao(r, 1, 20, .2); return q && { x: q.x, y: .02, z: q.z }; })();
      if (p) {
        const t = tex(64, 64, (g, w, h) => { g.fillStyle = 'rgba(210,20,20,.75)'; g.fillRect(4, 10, 56, 44); g.strokeStyle = 'rgba(255,180,180,.6)'; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(rand(4, 60), rand(10, 54)); g.lineTo(rand(4, 60), rand(10, 54)); g.stroke(); } g.fillStyle = 'rgba(255,40,40,.9)'; g.fillRect(0, 26, 6, 12); g.fillRect(58, 26, 6, 12); });
        const m = new THREE.Mesh(new THREE.PlaneGeometry(.16, .13), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: .15, metalness: .2, emissive: 0x400000, emissiveIntensity: .5, side: THREE.DoubleSide }));
        m.rotation.x = -PI / 2; m.rotation.z = rand(0, 3); m.position.set(p.x, p.y + .006, p.z); m.userData.l4 = true; W.grupo.add(m);
        const it = C.interact(m, () => '<b>E</b>Pegar o papel de bala vermelho', () => {
          fl().l4v_celofane = true; m.visible = false; som('papel');
          C.toast('Papel de bala guardado. Aperte F duas vezes rápido para prender na lanterna ou tirar.');
          setTimeout(() => fala('Igual a gente fazia quando era criança. Luz vermelha pra ler escondido.'), 900);
        });
        it.on = () => m.visible;
      }
    }
    // recados das crianças em giz vermelho, que só aparecem na luz vermelha
    const salas = ['corr', 'dormA', 'dormB', 'dormC', 'dormD', 'dormE', 'brinq'].map(SALA).filter(Boolean);
    const lista = [];
    RECADOS.forEach((txt, i) => {
      const r2 = salas[(i * 3 + 1) % salas.length]; const lug = lugarParede(r2, 1.4, .8, 1.35); if (!lug) return;
      const t = tex(512, 256, (g, w, h) => { g.clearRect(0, 0, w, h); const ls = txt.split('\n'); ls.forEach((l, k) => letreiro(g, l, w / 2, h / 2 + (k - (ls.length - 1) / 2) * 62, 44, 'rgba(255,240,235,.95)')); furos(g, w, h, 800); });
      const mat = new THREE.MeshBasicMaterial({ map: t, color: 0xff5a5a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3 });
      lista.push({ m: naParede(r2, lug.lado, lug.c, 1.35, 1.4, .7, mat), mat });
    });
    let viu = false;
    G.ticks.push((dt, ativo) => {
      for (const u of lista) u.mat.opacity = verm ? naLuz(u.m.position, 7, .9) * .9 : 0;
      if (verm && !viu && ativo && lista.some(u => u.mat.opacity > .5)) { viu = true; if (!fl().l4v_recado) { fl().l4v_recado = true; fala('Recados. Escritos em vermelho, pra só a gente ver.'); segredo('recados'); } }
    });
  }

  // =================================================================== 21. TECLAS GASTAS AO LADO DO COFRE
  function teclasGastas() {
    if (mapaId() !== 'tuneis' || !SALA('secreta')) return;
    const code = C.S.code;
    const t = tex(256, 320, (g, w, h) => {
      g.fillStyle = '#4a4a46'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2a28'; g.fillRect(10, 10, w - 20, 50);
      g.fillStyle = '#9a9a8a'; g.font = 'bold 22px Georgia'; g.textAlign = 'center'; g.fillText('COFRE · SEGREDO', w / 2, 42);
      const ord = [1, 2, 3, 4, 5, 6, 7, 8, 9, -1, 0, -2];
      ord.forEach((n, i) => {
        const x = 30 + (i % 3) * 70, y = 76 + Math.floor(i / 3) * 60;
        g.fillStyle = '#b8b4a6'; g.fillRect(x, y, 56, 48); if (n < 0) return;
        if (code.includes(n)) { const gr = g.createRadialGradient(x + 28, y + 24, 2, x + 28, y + 24, 30); gr.addColorStop(0, 'rgba(20,16,12,.85)'); gr.addColorStop(1, 'rgba(20,16,12,.25)'); g.fillStyle = gr; g.fillRect(x, y, 56, 48); }
        g.fillStyle = '#1a1a18'; g.font = 'bold 28px Georgia'; g.fillText(String(n), x + 28, y + 34);
      });
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.22, .28), new THREE.MeshStandardMaterial({ map: t, roughness: .8, metalness: .3 }));
    m.position.set(7.887, 1.3, -59.05); m.rotation.y = -PI / 2; m.userData.l4 = true; W.grupo.add(m);
    m.userData.leitura = 'Um teclado velho ao lado do cofre.';
    G.ticks.push((dt, ativo) => {
      if (!ativo || fl().l4v_teclas || fl().cofre) return;
      if (m.position.distanceTo(camera.position) < .75 && naLuz(m.position, 1, .9) > .3) { fl().l4v_teclas = true; fala('Quatro teclas encardidas. Alguém digitou isso muitas vezes.'); segredo('teclas'); }
    });
  }

  // =================================================================== 22. MONÓCULO DE LEMBRANÇA (posto)
  const visor = document.createElement('div');
  visor.id = 'l4-visor'; visor.hidden = true;
  visor.style.cssText = 'position:fixed;inset:0;z-index:60;background:#000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;font-family:"Special Elite",monospace;color:#cfc6b0;cursor:pointer';
  const visorCv = document.createElement('canvas'); visorCv.width = 640; visorCv.height = 480; visorCv.style.cssText = 'max-width:min(92vw,820px);max-height:78vh;width:auto;height:auto';
  const visorTx = document.createElement('div'); visorTx.style.cssText = 'font-size:14px;letter-spacing:.12em;opacity:.7;text-align:center';
  visor.append(visorCv, visorTx); document.body.appendChild(visor);
  let visorFim = null, visorPags = null, visorI = 0, visorT = null;
  function abrirVisor(pags, ao) { visorPags = pags; visorI = 0; visorFim = ao; visor.hidden = false; mostrarPag(); }
  function mostrarPag() {
    clearTimeout(visorT);
    const p = visorPags[visorI]; const g = visorCv.getContext('2d'); g.clearRect(0, 0, 640, 480); p.desenha(g, 640, 480);
    visorTx.textContent = p.txt || '';
    visorT = setTimeout(proxPag, p.dur || 2600);
  }
  function proxPag() { if (visor.hidden) return; visorI++; if (visorI >= visorPags.length) fecharVisor(); else mostrarPag(); }
  function fecharVisor() { clearTimeout(visorT); visor.hidden = true; const f = visorFim; visorFim = null; if (f) f(); }
  visor.addEventListener('click', proxPag);
  addEventListener('keydown', e => { if (visor.hidden) return; e.stopImmediatePropagation(); e.preventDefault(); if (e.code === 'Escape') fecharVisor(); else if (!e.repeat) proxPag(); }, true);
  function lente(g, w, h) { const gr = g.createRadialGradient(w / 2, h / 2, h * .28, w / 2, h / 2, h * .5); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#000'; g.fillRect(0, 0, w * .14, h); g.fillRect(w * .86, 0, w * .14, h); }
  function fotoPortao(g, w, h) {
    g.fillStyle = '#c9b48c'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d8c8a0'); gr.addColorStop(1, '#8a7a5a'); g.fillStyle = gr; g.fillRect(w * .14, 0, w * .72, h);
    g.strokeStyle = '#3a2e20'; g.lineWidth = 6; for (let i = 0; i < 12; i++) { const x = w * .2 + i * 34; g.beginPath(); g.moveTo(x, 90); g.lineTo(x, 330); g.stroke(); } g.beginPath(); g.moveTo(w * .18, 120); g.lineTo(w * .82, 120); g.stroke();
    g.fillStyle = '#3a2e20'; g.font = 'bold 22px Georgia'; g.textAlign = 'center'; g.fillText('INTERNATO SÃO LÁZARO', w / 2, 80);
    const crianca = (x, s, cabelo) => { g.fillStyle = '#e4d4b4'; g.beginPath(); g.arc(x, 300 - s, s * .22, 0, 7); g.fill(); g.fillStyle = cabelo; g.beginPath(); g.arc(x, 300 - s - s * .05, s * .23, PI, 0); g.fill(); g.fillStyle = '#5a6a8a'; g.fillRect(x - s * .25, 300 - s * .78, s * .5, s * .7); g.fillStyle = '#3a3020'; g.fillRect(x - s * .2, 300 - s * .08, s * .14, s * .5); g.fillRect(x + s * .06, 300 - s * .08, s * .14, s * .5); };
    crianca(w * .42, 150, '#3a2a1a'); crianca(w * .58, 120, '#2a1a10');
    g.fillStyle = '#2a2018'; g.fillRect(w * .41 + 22, 172, 30, 6); // os óculos do Davi
    g.fillStyle = 'rgba(80,60,40,.8)'; g.font = 'italic 18px Georgia'; g.fillText('Davi e Lia · 1977', w / 2, h - 50);
    lente(g, w, h);
  }
  function fotoEstrada(g, w, h) {
    g.fillStyle = '#05070a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#15181c'; g.beginPath(); g.moveTo(w * .3, h); g.lineTo(w * .46, 0); g.lineTo(w * .54, 0); g.lineTo(w * .7, h); g.fill();
    g.strokeStyle = 'rgba(200,190,140,.5)'; g.setLineDash([20, 26]); g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 0); g.stroke(); g.setLineDash([]);
    g.fillStyle = 'rgba(255,230,170,.25)'; g.beginPath(); g.moveTo(w * .5, h * .6); g.lineTo(w * .4, h * .1); g.lineTo(w * .6, h * .1); g.fill();
    g.fillStyle = '#1e2a3a'; g.beginPath(); g.ellipse(w / 2, h * .62, 22, 34, 0, 0, 7); g.fill(); g.fillStyle = '#2a1e16'; g.beginPath(); g.arc(w / 2, h * .55, 13, 0, 7); g.fill(); // a Lia de cima, de costas
    g.strokeStyle = 'rgba(180,190,210,.25)'; g.lineWidth = 1; for (let i = 0; i < 160; i++) { const x = rand(0, w), y = rand(0, h); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 14); g.stroke(); }
    g.fillStyle = 'rgba(30,30,30,.9)'; g.fillRect(0, h * .9, w, h * .1); // a borda do teto do carro
    lente(g, w, h);
  }
  function monoculo() {
    if (mapaId() !== 'estrada') return; const r = SALA('posto'); if (!r) return;
    const p = apoio(r, .7, 1.25) || { x: (r.x0 + r.x1) / 2 + 1.5, y: .9, z: r.z0 + .6 };
    const g = new THREE.Group(); g.position.set(p.x, p.y, p.z); g.rotation.y = rand(0, PI); g.userData.l4 = true; W.grupo.add(g);
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(.05, .045, .07), new THREE.MeshStandardMaterial({ color: 0xc8402a, roughness: .4, emissive: 0x200805, emissiveIntensity: .5 })); corpo.position.y = .024; g.add(corpo);
    const lnt = new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, .02, 10), new THREE.MeshStandardMaterial({ color: 0xe8f0f8, roughness: .1, emissive: 0x404850, emissiveIntensity: .4 })); lnt.rotation.x = PI / 2; lnt.position.set(0, .024, .044); g.add(lnt);
    const it = C.interact(g, () => '<b>E</b>Olhar pelo monóculo “Lembrança da Serra”', () => {
      const n = (fl().l4v_mono | 0) + 1; fl().l4v_mono = n;
      if (n === 1) abrirVisor([{ desenha: fotoPortao, txt: 'LEMBRANÇA DA SERRA · aponte para a luz', dur: 4200 }], () => fala('O Davi e eu. No portão. Eu nem lembrava dessa foto.'));
      else abrirVisor([{ desenha: fotoEstrada, txt: 'LEMBRANÇA DA SERRA', dur: 3800 }], () => { fala('Sou eu. Agora. Tirada de cima do carro.'); som('susto'); segredo('monoculo'); });
    });
    void it;
  }

  // =================================================================== 23. O GIBI DA CABANINHA (depósito dos túneis)
  function quadro(g, x, y, w, h, fn) { g.save(); g.fillStyle = '#efe6cf'; g.fillRect(x, y, w, h); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(x, y, w, h); g.restore(); g.strokeStyle = '#111'; g.lineWidth = 4; g.strokeRect(x, y, w, h); }
  function balao(g, x, y, txt) { g.font = 'bold 18px Georgia'; const w = g.measureText(txt).width + 20; g.fillStyle = '#fff'; g.strokeStyle = '#111'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, w / 2, 20, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#111'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, x, y); }
  function pagGibi(titulo, quadros) { return (g, w, h) => { g.fillStyle = '#d9cfb4'; g.fillRect(0, 0, w, h); letreiro(g, titulo, w / 2, 34, 30, '#8a1a12'); const qw = (w - 50) / quadros.length; quadros.forEach((fn, i) => quadro(g, 20 + i * (qw + 5), 64, qw, h - 90, (x, y, ww, hh) => fn(g, x, y, ww, hh))); }; }
  function gibi() {
    if (mapaId() !== 'tuneis') return; const r = SALA('dep'); if (!r) return;
    const p = noChao(r, .8, 20, .3); if (!p) return;
    const capa = tex(128, 160, (g, w, h) => { g.fillStyle = '#c8a040'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a1a10'; g.font = 'bold 24px Georgia'; g.textAlign = 'center'; g.fillText('O INSPETOR', w / 2, 30); palito(g, 64, 150, 100, '#111', { bracos: 'cima' }); traco(g, [[52, 64], [76, 64]], '#fff', 6, 1); for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(60,40,10,${rand(.05, .2)})`; g.fillRect(rand(0, w), rand(0, h), 2, 2); } });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.2, .26), new THREE.MeshStandardMaterial({ map: capa, roughness: .9 }));
    m.rotation.x = -PI / 2; m.rotation.z = rand(-1, 1); m.position.set(p.x, .012, p.z); m.userData.l4 = true; W.grupo.add(m);
    C.interact(m, () => '<b>E</b>Folhear o gibi molhado', () => {
      const S = C.S, sala = (P.room && P.room.nome) || 'aqui', mortes = S.mortes | 0;
      const ultimo = (g, x, y, w, h) => { // desenhado na hora: a Lia, a sala onde você está e as suas mortes
        g.fillStyle = '#2a2620'; g.fillRect(x, y, w, h); g.fillStyle = '#5a5244'; g.fillRect(x, y + h * .72, w, h * .28);
        for (let i = 0; i < Math.min(mortes, 20); i++) traco(g, [[x + 20 + i * 9 + Math.floor(i / 5) * 8, y + 30], [x + 20 + i * 9 + Math.floor(i / 5) * 8, y + 64]], '#e8e2d0', 3, 1);
        palito(g, x + w * .45, y + h * .9, h * .5, '#e8e2d0', { lanterna: true });
        g.fillStyle = 'rgba(0,0,0,.9)'; silCrianca(g, x + w * .75, y + h * .9, h * .6, 'rgba(0,0,0,.95)');
        g.fillStyle = '#e8e2d0'; g.font = 'bold 15px Georgia'; g.textAlign = 'center'; g.fillText(sala.toUpperCase(), x + w / 2, y + h - 12);
      };
      const continua = (g, w, h) => { g.fillStyle = '#0a0806'; g.fillRect(0, 0, w, h); letreiro(g, 'CONTINUA...', w / 2, h * .2, 54, '#e8e2d0'); g.fillStyle = '#000'; silCrianca(g, w / 2, h * .95, h * .6, '#000'); g.fillStyle = '#e8e2d0'; g.fillRect(w / 2 - 14, h * .95 - h * .6 * .88, 7, 7); g.fillRect(w / 2 + 6, h * .95 - h * .6 * .88, 7, 7); };
      abrirVisor([
        { desenha: pagGibi('O INSPETOR', [(g, x, y, w, h) => { palito(g, x + w / 2, y + h - 10, h * .8, '#111', { bracos: 'cima' }); traco(g, [[x + w / 2 - 22, y + h * .3], [x + w / 2 + 22, y + h * .3]], '#fff', 8, 1); }, (g, x, y, w, h) => { balao(g, x + w / 2, y + 40, 'SHHH...'); palito(g, x + w / 2, y + h - 10, h * .5, '#2a3a8a'); }]), txt: 'clique ou aperte qualquer tecla para virar', dur: 3000 },
        { desenha: pagGibi('A PROCISSÃO', [(g, x, y, w, h) => { for (let i = 0; i < 5; i++) { palito(g, x + 30 + i * (w - 60) / 4, y + h - 10, h * .55, '#555'); g.fillStyle = '#e8a020'; g.beginPath(); g.arc(x + 46 + i * (w - 60) / 4, y + h * .5, 6, 0, 7); g.fill(); } }, (g, x, y, w, h) => { traco(g, [[x + 30, y + 40], [x + w - 30, y + 40], [x + w - 30, y + h - 20], [x + 30, y + h - 20], [x + 30, y + 40]], '#3a6a3a', 6, 2); balao(g, x + w / 2, y + 30, 'NÃO RESPIRA'); }]), dur: 2600 },
        { desenha: pagGibi('A ANA CONTA', [(g, x, y, w, h) => { palito(g, x + w / 2, y + h - 10, h * .5, '#5a2a1a', { saia: true, tranca: true }); for (let i = 1; i <= 10; i++) { g.fillStyle = i === 10 ? '#c0201a' : '#333'; g.font = 'bold 20px Georgia'; g.fillText(String(i), x + 14 + (i - 1) * (w - 28) / 9, y + 26); } }, (g, x, y, w, h) => { balao(g, x + w / 2, y + 40, 'OLHA PRA ELA!'); palito(g, x + w / 2, y + h - 10, h * .5, '#2a3a8a', { lanterna: true }); }]), dur: 2600 },
        { desenha: pagGibi('E A LIA?', [ultimo]), dur: 3200 },
        { desenha: continua, dur: 2600 }
      ], () => { som('papel'); if (!fl().l4v_gibi) { fl().l4v_gibi = true; fala('O último quadrinho... é aqui. Sou eu. Agora.'); segredo('gibi'); } });
    });
  }

  // =================================================================== 24. OS VITRAIS DESENHAM SETE SINOS (capela)
  function sinosVitral() {
    if (mapaId() !== 'cemiterio') return; const r = SALA('capela'); if (!r) return;
    const t = tex(512, 256, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      const cores = ['rgba(200,60,50,', 'rgba(60,110,200,', 'rgba(220,180,60,', 'rgba(70,160,90,'];
      for (let i = 0; i < 7; i++) {
        const x = 40 + i * 70, y = 130, c = cores[i % 4];
        const gr = g.createRadialGradient(x, y, 4, x, y, 50); gr.addColorStop(0, c + '.35)'); gr.addColorStop(1, c + '0)'); g.fillStyle = gr; g.fillRect(x - 50, y - 60, 100, 120);
        g.fillStyle = c + '.9)'; g.beginPath(); g.moveTo(x - 6, y - 34); g.quadraticCurveTo(x - 22, y - 30, x - 24, y + 22); g.lineTo(x + 24, y + 22); g.quadraticCurveTo(x + 22, y - 30, x + 6, y - 34); g.fill();
        g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x - 20, y + 28); g.lineTo(x + 20, y + 16); g.stroke(); // o risco na boca do sino
      }
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.rotation.x = -PI / 2; m.position.set((r.x0 + r.x1) / 2, .03, (r.z0 + r.z1) / 2 - 2); m.userData.l4 = true; W.grupo.add(m);
    let vt = 0;
    G.ticks.push((dt, ativo) => {
      const k = naSala('capela') ? clamp((C.raioI || 0) * 1.6, 0, 1) : 0;
      m.material.opacity = Math.max(k, m.material.opacity - dt * 1.5);
      if (ativo && m.material.opacity > .4 && !fl().l4v_sinos) { vt += dt; if (vt > .1 && pitch() < -.2) { fl().l4v_sinos = true; setTimeout(() => fala('Sete sinos. Todos com a boca riscada.'), 400); segredo('sinos'); } }
    });
  }

  // =================================================================== 25. SOMBRA DE COELHO NA PAREDE (segurar E sem alvo)
  const texMao = tipo => tex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.88)';
    if (tipo === 'coelho') { g.beginPath(); g.ellipse(128, 170, 52, 40, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(104, 92, 13, 46, -.2, 0, 7); g.ellipse(146, 92, 13, 46, .25, 0, 7); g.fill(); g.fillRect(100, 200, 60, 56); }
    else { g.beginPath(); g.moveTo(20, 150); g.lineTo(150, 110); g.lineTo(180, 60); g.lineTo(200, 110); g.lineTo(240, 130); g.lineTo(240, 230); g.lineTo(60, 230); g.fill(); g.beginPath(); g.moveTo(20, 150); g.lineTo(130, tipo === 'loboA' ? 200 : 160); g.lineTo(150, 230); g.fill(); g.fillStyle = 'rgba(0,0,0,0)'; g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(170, 124, 6, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; }
  });
  const MAO = { coelho: texMao('coelho'), lobo: texMao('lobo'), loboA: texMao('loboA') };
  const maoMat = new THREE.MeshBasicMaterial({ map: MAO.coelho, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
  const maoM = new THREE.Mesh(new THREE.PlaneGeometry(.55, .55), maoMat); maoM.visible = false; scene.add(maoM);
  const rcM = new THREE.Raycaster(); rcM.far = 2;
  const SB = { t: 0, n: 0, lobo: 0, segAnt: false };
  function tickCoelho(dt, ativo, S) {
    const segura = ativo && keys.KeyE && !C.alvo && !S.hidden && luzOn();
    if (segura && !SB.segAnt) {
      rcM.set(camera.position, fw); const h = rcM.intersectObjects(W.solid, false)[0];
      if (h && h.face && h.distance < 2 && Math.abs(h.face.normal.y) < .3) {
        const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
        maoM.position.copy(h.point).addScaledVector(n, .02); maoM.lookAt(v2.copy(maoM.position).add(n));
        maoM.visible = true; maoMat.map = MAO.coelho; SB.t = 0; SB.lobo = 0;
        if (P.room && P.room.tipo === 'dorm') SB.n = (fl().l4v_coelhoN | 0) + 1, fl().l4v_coelhoN = SB.n;
      }
    }
    SB.segAnt = segura;
    if (!maoM.visible) return;
    SB.t += dt;
    if (SB.n >= 3 && !fl().l4v_lobo && SB.t > 1.6) { // na terceira vez, nos dormitórios, a sombra que responde não é a da Lia
      SB.lobo += dt; maoMat.map = SB.lobo < .5 ? MAO.lobo : MAO.loboA; maoM.scale.setScalar(1.6);
      if (SB.lobo > 1.1) { fl().l4v_lobo = true; maoM.visible = false; maoM.scale.setScalar(1); som('risada', maoM.position.x, maoM.position.z); fala('Não era a minha mão.'); conq('l4_sombras'); segredo('lobo'); }
      maoMat.opacity = .9; return;
    }
    maoMat.opacity = segura ? Math.min(.85, SB.t * 3) : Math.max(0, maoMat.opacity - dt * 4);
    if (!segura && maoMat.opacity <= 0) { maoM.visible = false; maoM.scale.setScalar(1); }
  }

  // =================================================================== 26. A POEIRA QUE FORMA UMA CRIANÇA LENDO (biblioteca)
  function poeiraLeitura() {
    if (mapaId() !== 'terreo') return; const r = SALA('biblio'); if (!r) return;
    const p = noChao(r, 1.2, 30, .5); if (!p) return;
    const c = document.createElement('canvas'); c.width = 64; c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.beginPath(); g.arc(30, 14, 7, 0, 7); g.fill(); g.fillRect(24, 20, 12, 22); g.fillRect(24, 38, 26, 8); g.fillRect(44, 40, 6, 20); g.fillRect(34, 24, 18, 4); g.fillRect(46, 18, 12, 12);
    const d = g.getImageData(0, 0, 64, 64).data, alvo = [];
    for (let i = 0; i < 2000 && alvo.length < 140; i++) { const x = Math.random() * 64 | 0, y = Math.random() * 64 | 0; if (d[(y * 64 + x) * 4 + 3] > 100) alvo.push([(x - 32) / 64 * 1.1, (64 - y) / 64 * 1.1]); }
    const n = alvo.length, pos = new Float32Array(n * 3), solto = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { solto[i * 3] = rand(-.6, .6); solto[i * 3 + 1] = rand(.1, 1.4); solto[i * 3 + 2] = rand(-.6, .6); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: TX_BRILHO, color: 0xffe6c0, size: .03, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    pts.position.set(p.x, 0, p.z); pts.frustumCulled = false; pts.userData.l4 = true; W.grupo.add(pts);
    const centro = new THREE.Vector3(p.x, .6, p.z); let forma = 0; const rAnt = new THREE.Euler();
    G.ticks.push((dt, ativo, S, t) => {
      const l = naLuz(centro, 6, .94);
      const giro = Math.abs(camera.rotation.y - rAnt.y) + Math.abs(camera.rotation.x - rAnt.x); rAnt.copy(camera.rotation);
      forma = l > .3 && giro < .02 ? Math.min(1, forma + dt / 2) : Math.max(0, forma - dt * (giro > .03 ? 3 : .6)); // mexer a lanterna desfaz
      pts.rotation.y = Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
      for (let i = 0; i < n; i++) { const k = forma * forma; pos[i * 3] = lerp(solto[i * 3] + Math.sin(t * .3 + i) * .05, alvo[i][0], k); pos[i * 3 + 1] = lerp(solto[i * 3 + 1] + Math.sin(t * .2 + i * 1.7) * .05, alvo[i][1], k); pos[i * 3 + 2] = lerp(solto[i * 3 + 2], 0, k); }
      geo.attributes.position.needsUpdate = true;
      pts.material.opacity = l * .7;
      if (ativo && forma > .95 && !fl().l4v_poeira) { fl().l4v_poeira = true; fala('A poeira... parece um menino lendo.'); segredo('poeira'); }
    });
  }

  // =================================================================== 27. "NÃO PARE" (túnel central)
  function naoPare() {
    if (mapaId() !== 'tuneis') return; const r = SALA('t1'); if (!r) return;
    const lug = lugarParede(r, 2.2, 1, 1.4, [2, 3]); if (!lug) return;
    const t = tex(512, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.font = 'bold 120px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText('NÃO PARE', w / 2, h / 2); const d = g.getImageData(0, 0, w, h); for (let i = 0; i < d.data.length; i += 4) { if (d.data[i + 3] > 0) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = d.data[i + 3] * (Math.random() < .5 ? 1 : .4); } } g.putImageData(d, 0, 0); }, true);
    const mat = new THREE.MeshBasicMaterial({ map: t, color: 0xb8b0a0, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 });
    const m = naParede(r, lug.lado, lug.c, 1.4, 2.2, 1.1, mat);
    const ult = new THREE.Vector3(), rAnt = new THREE.Euler(); let viu = 0, parado = 0, resp = false;
    G.ticks.push((dt, ativo) => {
      const mov = ult.distanceTo(P.pos) / Math.max(dt, 1e-3), giro = (Math.abs(camera.rotation.y - rAnt.y) + Math.abs(camera.rotation.x - rAnt.x)) / Math.max(dt, 1e-3);
      ult.copy(P.pos); rAnt.copy(camera.rotation);
      const movendo = clamp(mov / 1.5 + giro / 1.2, 0, 1), vis = olhar(m.position, .8, 9);
      mat.opacity = lerp(mat.opacity, movendo * vis * (OPT.vFlash ? .35 : .8), Math.min(1, dt * 8));
      if (movendo > .1) t.offset.set(Math.random() * .004, Math.random() * .004); // os grãos da frase andam diferente do reboco
      if (!ativo) return;
      if (mat.opacity > .4) viu += dt;
      if (viu > 1 && !resp) { parado = movendo < .05 ? parado + dt : 0; if (parado > 1.5) { resp = true; v2.copy(camera.position).addScaledVector(fw, -1.4); som('suspiro', { x: v2.x, y: 1.3, z: v2.z }); som('l4respira'); if (C.S) C.S.fear = Math.min(100, C.S.fear + 12); segredo('naopare'); } }
    });
  }

  // =================================================================== 28. A JANELA QUE MOSTRA O QUARTO DE 1979
  const TX_1979 = tex(256, 320, (g, w, h) => {
    g.fillStyle = '#c8ccd8'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3; i++) { const y = 80 + i * 80; g.fillStyle = '#eef0f4'; g.fillRect(20, y, 150 - i * 20, 50); g.fillStyle = '#8890a8'; g.beginPath(); g.arc(40, y + 20, 14, 0, 7); g.fill(); g.fillStyle = '#3a3a48'; g.beginPath(); g.arc(40, y + 14, 15, PI, 0); g.fill(); }
    g.fillStyle = '#e8e0d0'; g.beginPath(); g.arc(40, 274, 13, 0, 7); g.fill(); g.fillStyle = '#000'; g.fillRect(43, 270, 5, 5); // um olho aberto
    const gr = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, 200); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,14,30,.8)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  });
  function quarto1979() {
    const js = janelasDe(r => r.tipo === 'dorm'); if (!js.length) return;
    semear(29); const j = js[Math.floor(rnd() * js.length)];
    const mat = new THREE.MeshBasicMaterial({ map: TX_1979, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6 });
    const m = naParede(j.r, j.lado, j.c, 1.75, .94, 1.22, mat, .1192);
    let antes = 0, aceso = 0;
    G.ticks.push((dt, ativo) => {
      const ri = C.raioI || 0;
      if (ri > .3 && antes <= .3) aceso = .3; antes = ri;
      aceso = Math.max(0, aceso - dt);
      mat.opacity = aceso > 0 ? (OPT.vFlash ? .5 : .9) : 0;
      if (ativo && aceso > 0 && olhar(m.position, .85, 7) > .2 && !fl().l4v_1979) { fl().l4v_1979 = true; setTimeout(() => fala('No vidro... o quarto arrumado. Tinha criança dormindo. Uma de olho aberto.'), 500); segredo('quarto1979'); }
    });
  }

  // =================================================================== 31. CONTORNO DE GIZ ONDE A LIA MORREU
  function contorno() {
    const ult = [...DB.mortes].reverse().find(m => m.mapa === mapaId() && m.x !== undefined); if (!ult) return;
    const t = tex(256, 256, (g, w, h) => {
      g.clearRect(0, 0, w, h); const cor = 'rgba(235,235,225,.85)';
      traco(g, roda(128, 50, 22, 16), cor, 4, 2);
      traco(g, [[118, 72], [96, 90], [60, 70], [44, 54]], cor, 4, 2); traco(g, [[138, 72], [166, 92], [200, 120], [214, 150]], cor, 4, 2);
      traco(g, [[100, 92], [92, 160], [72, 230], [96, 236], [124, 170], [140, 236], [164, 230], [156, 160], [152, 92]], cor, 4, 2);
      g.fillStyle = cor; g.font = '16px Georgia'; g.textAlign = 'center'; g.fillText(ult.d || '', 200, 230);
    });
    const mat = new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 1, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0, polygonOffset: true, polygonOffsetFactor: -2 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), mat); m.rotation.x = -PI / 2; m.rotation.z = rand(0, PI * 2); m.position.set(ult.x, .017, ult.z); m.userData.l4 = true; W.grupo.add(m);
    G.ticks.push(() => { mat.emissiveIntensity = naLuz(m.position, 6, .9) * .25; });
  }

  // =================================================================== 32. NO TETO DO DORMITÓRIO A, SÓ NO RELÂMPAGO
  function tetoDormA() {
    if (mapaId() !== 'superior') return; const r = SALA('dormA'); if (!r) return;
    const t = tex(512, 256, (g, w, h) => { g.clearRect(0, 0, w, h); letreiro(g, 'EU TE VEJO', w / 2, 90, 70, 'rgba(225,240,255,.9)'); letreiro(g, 'DORMIR', w / 2, 180, 70, 'rgba(225,240,255,.9)'); furos(g, w, h, 1200, .9); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.5), new THREE.MeshBasicMaterial({ map: t, color: 0xcfe2ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    m.rotation.x = PI / 2; m.position.set((r.x0 + r.x1) / 2, (r.h || 3.2) - .018, (r.z0 + r.z1) / 2); m.userData.l4 = true; W.grupo.add(m);
    G.ticks.push(() => { m.material.opacity = naSala('dormA') ? clamp((C.raioI || 0) * 1.4, 0, OPT.vFlash ? .4 : .9) : 0; });
  }

  // =================================================================== 33. O QUADRO QUE MOSTRA VOCÊ DE COSTAS (diretoria)
  let RT = null, rtCam = null;
  const texLiaCostas = () => tex(128, 256, g => {
    g.fillStyle = '#26303e'; g.beginPath(); g.moveTo(30, 250); g.lineTo(36, 110); g.quadraticCurveTo(64, 92, 92, 110); g.lineTo(98, 250); g.fill(); // jaqueta
    g.fillStyle = '#2a1c14'; g.beginPath(); g.arc(64, 74, 26, 0, 7); g.fill(); g.fillRect(56, 90, 16, 34); // cabelo preso
    g.fillStyle = 'rgba(255,230,160,.5)'; g.beginPath(); g.moveTo(96, 150); g.lineTo(128, 120); g.lineTo(128, 190); g.fill();
  });
  function quadroCostas() {
    if (mapaId() !== 'terreo') return; const r = SALA('diret'); if (!r) return;
    const lug = lugarParede(r, .8, 1.05, 1.75, [1, 0, 2, 3], .25); if (!lug) return;
    naParede(r, lug.lado, lug.c, 1.75, .9, 1.16, new THREE.MeshStandardMaterial({ color: 0x5a3a18, roughness: .5, metalness: .3, emissive: 0x2a1808, emissiveIntensity: .3 }), .108);
    const fixo = minima();
    const pincel = tex(128, 160, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${rand(40, 120) | 0},${rand(30, 90) | 0},${rand(20, 60) | 0},${rand(.08, .22)})`; g.lineWidth = rand(2, 6); g.beginPath(); const x = rand(0, w), y = rand(0, h); g.moveTo(x, y); g.lineTo(x + rand(-12, 12), y + rand(-6, 6)); g.stroke(); } const gr = g.createRadialGradient(w / 2, h / 2, 30, w / 2, h / 2, 100); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(20,12,4,.7)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    let mapaQ;
    if (fixo) mapaQ = tex(96, 128, (g, w, h) => { g.fillStyle = '#2a2018'; g.fillRect(0, 0, w, h); g.fillStyle = '#4a3a28'; g.fillRect(0, h * .7, w, h * .3); g.fillStyle = '#1e2836'; g.beginPath(); g.moveTo(34, h); g.lineTo(38, 70); g.quadraticCurveTo(48, 60, 58, 70); g.lineTo(62, h); g.fill(); g.fillStyle = '#20140c'; g.beginPath(); g.arc(48, 52, 12, 0, 7); g.fill(); });
    else {
      if (!RT) { RT = new THREE.WebGLRenderTarget(96, 128); RT.texture.colorSpace = THREE.SRGBColorSpace; rtCam = new THREE.PerspectiveCamera(58, 96 / 128, .1, 40); rtCam.layers.enable(1); }
      mapaQ = RT.texture;
    }
    const tela = naParede(r, lug.lado, lug.c, 1.75, .78, 1.02, new THREE.MeshBasicMaterial({ map: mapaQ, color: 0xb8a888 }), .113);
    naParede(r, lug.lado, lug.c, 1.75, .78, 1.02, new THREE.MeshBasicMaterial({ map: pincel, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }), .114); // pinceladas por cima: parece óleo
    tela.userData.leitura = 'Um quadro a óleo. Uma sala por trás de uma mulher de jaqueta.';
    const lia = new THREE.Sprite(new THREE.SpriteMaterial({ map: texLiaCostas(), depthWrite: true })); lia.scale.set(.75, 1.55, 1); lia.layers.set(1); W.grupo.add(lia);
    const vulto = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_SOMBRA.pe, color: 0x000000 })); vulto.scale.set(.6, 1.25, 1); vulto.layers.set(1); vulto.visible = false; W.grupo.add(vulto);
    let acc = 0, vendo = 0, falou = false;
    G.ticks.push((dt, ativo, S) => {
      if (fixo || !naSala('diret')) { vendo = 0; return; }
      const v = olhar(tela.position, .9, 7);
      vendo = v > .2 ? vendo + dt : Math.max(0, vendo - dt * .5);
      vulto.visible = vendo > 4; // quem olha muito tempo vê alguém atrás dela
      if (vulto.visible && !falou && ativo) { falou = true; fala('No quadro tem alguém atrás de mim.'); segredo('quadro'); }
      acc += dt; if (acc < .2 || v <= 0) return; acc = 0; // 5 vezes por segundo, só olhando
      const yaw = camera.rotation.y, sx = Math.sin(yaw), cz = Math.cos(yaw);
      lia.position.set(P.pos.x, .8, P.pos.z);
      vulto.position.set(P.pos.x + sx * .6, .65, P.pos.z + cz * .6);
      rtCam.position.set(P.pos.x + sx * 2.1, 2.3, P.pos.z + cz * 2.1); rtCam.lookAt(P.pos.x - sx * 2, 1.1, P.pos.z - cz * 2);
      const ant = renderer.getRenderTarget(); renderer.setRenderTarget(RT); renderer.render(scene, rtCam); renderer.setRenderTarget(ant);
    });
  }

  // =================================================================== LOTE 4 (2ª rodada): mais luz, sombra e reflexo
  LEG.l4tv = { t: 'a televisão chia sozinha', imp: 1, cd: 10, cat: 'h' };
  LEG.l4fita = { t: 'a fita range no videocassete', imp: 1, cd: 8, cat: 'h' };
  LEG.l4anel = { t: 'um som vira um anel de luz', imp: 0, cd: 4, cat: 'h' };
  if (R && R.conquistas) {
    for (const c of [
      { id: 'l4_tracking', nome: 'Ajusta o Tracking', desc: 'Firme a imagem da fita de aniversário na diretoria.', secreta: true, dica: 'Encare a TV sem desviar até a faixa parar de tremer.' },
      { id: 'l4_seis', nome: 'Seis Meninas', desc: 'Veja a menina do caleidoscópio chegar quase ao centro e desvie a tempo.', secreta: true, dica: 'Olhe pela lata, mas não encare até o fim.' },
      { id: 'l4_espelho', nome: 'Quem Pisca', desc: 'Encare o espelho até o reflexo piscar sozinho.', secreta: true, dica: 'Fique parada diante do espelho do banheiro.' }
    ]) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);
  }
  const TX_ANEL = tex(64, 64, (g) => { for (let k = 0; k < 3; k++) { g.strokeStyle = `rgba(200,230,255,${.7 - k * .2})`; g.lineWidth = 4 - k; g.beginPath(); g.arc(32, 32, 26 - k * 3, 0, 7); g.stroke(); } });
  function rtNovo(w, h, layer) { const rt = new THREE.WebGLRenderTarget(w, h); rt.texture.colorSpace = THREE.SRGBColorSpace; const cam = new THREE.PerspectiveCamera(60, w / h, .1, 40); cam.layers.enable(layer); return { rt, cam }; }
  const texLiaFrente = piscou => tex(128, 256, g => {
    g.fillStyle = '#26303e'; g.beginPath(); g.moveTo(30, 250); g.lineTo(36, 110); g.quadraticCurveTo(64, 92, 92, 110); g.lineTo(98, 250); g.fill();
    g.fillStyle = '#2a1c14'; g.beginPath(); g.arc(64, 60, 30, PI, 0); g.fill(); g.fillRect(38, 58, 52, 26);
    g.fillStyle = '#d9c3a0'; g.beginPath(); g.arc(64, 78, 24, 0, 7); g.fill();
    g.fillStyle = '#1a1410'; if (piscou) { g.fillRect(50, 76, 10, 2); g.fillRect(70, 76, 10, 2); } else { g.beginPath(); g.arc(55, 76, 3, 0, 7); g.arc(75, 76, 3, 0, 7); g.fill(); }
  });

  // A1. TV da recepção que te mostra de costas
  let TVrt = null;
  function tvRecepcao() {
    if (mapaId() !== 'terreo') return; const r = SALA('hall'); if (!r) return;
    const lug = lugarParede(r, .95, .86, 1.1, [0, 2, 3, 1], .42); if (!lug) return;
    naParede(r, lug.lado, lug.c, 1.0, 1.0, .86, new THREE.MeshStandardMaterial({ color: 0x3a3630, roughness: .8 }), .2);
    const fixo = minima();
    let mapaTV;
    if (!fixo) { if (!TVrt) TVrt = rtNovo(96, 128, 2); mapaTV = TVrt.rt.texture; }
    else mapaTV = tex(96, 128, (g, w, h) => { g.fillStyle = '#1a2018'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { const v = Math.random() * 180 | 0; g.fillStyle = `rgb(${v},${v + 20},${v})`; g.fillRect(Math.random() * w | 0, Math.random() * h | 0, 2, 2); } });
    const over = tex(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); for (let y = 0; y < h; y += 3) { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(0, y, w, 1); } }, true);
    const tela = naParede(r, lug.lado, lug.c, 1.05, .66, .5, new THREE.MeshBasicMaterial({ map: mapaTV, color: 0x9fb09f }), .205);
    const scan = naParede(r, lug.lado, lug.c, 1.05, .66, .5, new THREE.MeshBasicMaterial({ map: over, transparent: true, depthWrite: false, opacity: .4, blending: THREE.AdditiveBlending }), .206);
    tela.userData.leitura = 'Uma TV de tubo no chuvisco. Dá para se ver de costas nela.';
    const lia = new THREE.Sprite(new THREE.SpriteMaterial({ map: texLiaCostas(), depthWrite: true })); lia.scale.set(.75, 1.55, 1); lia.layers.set(2); W.grupo.add(lia);
    const cri = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_SOMBRA.pe, color: 0x101014 })); cri.scale.set(.5, 1.0, 1); cri.layers.set(2); cri.visible = false; W.grupo.add(cri);
    let acc = 0, olhadas = 0, olhando = 0, era = false;
    G.ticks.push((dt, ativo, S) => {
      scan.material.map.offset.y = (scan.material.map.offset.y + dt * 2) % 1;
      if (fixo || !naSala('hall')) { olhando = 0; era = false; return; }
      const v = olhar(tela.position, .85, 7) > .3;
      if (v && !era) olhadas++; era = v;
      olhando = v ? olhando + dt : 0;
      cri.visible = olhadas >= 3 && olhando > 1.2;
      if (cri.visible && ativo && !fl().l4v_tv) { fl().l4v_tv = true; fala('Tem uma criança atrás de mim. Só na TV.'); som('l4tv'); segredo('tv'); }
      acc += dt; if (acc < .1 || !v) return; acc = 0;
      const yaw = camera.rotation.y, sx = Math.sin(yaw), cz = Math.cos(yaw);
      lia.position.set(P.pos.x, .85, P.pos.z); cri.position.set(P.pos.x + sx * .35, .6, P.pos.z + cz * .35);
      TVrt.cam.position.set(P.pos.x + sx * 2.0, 2.1, P.pos.z + cz * 2.0); TVrt.cam.lookAt(P.pos.x - sx, 1.1, P.pos.z - cz);
      const ant = renderer.getRenderTarget(); renderer.setRenderTarget(TVrt.rt); renderer.render(scene, TVrt.cam); renderer.setRenderTarget(ant);
    });
  }

  // A2. O mapa do Davi marca onde você morreu
  function mapaDavi() {
    if (mapaId() !== 'terreo') return; const r = SALA('biblio'); if (!r) return;
    const xs = [], zs = []; for (const s of W.salas) { xs.push(s.x0, s.x1); zs.push(s.z0, s.z1); }
    const minx = Math.min(...xs), maxx = Math.max(...xs), minz = Math.min(...zs), maxz = Math.max(...zs), dx = maxx - minx || 1, dz = maxz - minz || 1;
    const noite = C.S.mortes | 0, marcas = DB.mortes.filter(m => m.mapa === 'terreo' && m.x != null).slice(-Math.max(noite, 0));
    const t = tex(360, 360, (g, w, h) => {
      papel(g, w, h, '#d8cba6');
      g.strokeStyle = 'rgba(40,30,15,.5)'; g.lineWidth = 2;
      for (const s of W.salas) { if (s.fora) continue; const X = (s.x0 - minx) / dx * (w - 44) + 22, Y = (s.z0 - minz) / dz * (h - 70) + 46, W2 = (s.x1 - s.x0) / dx * (w - 44), H2 = (s.z1 - s.z0) / dz * (h - 70); g.strokeRect(X, Y, W2, H2); }
      letreiro(g, 'MAPA DO DAVI', w / 2, 26, 20, '#3a2a12');
      marcas.forEach((m, i) => { const X = (m.x - minx) / dx * (w - 44) + 22, Y = (m.z - minz) / dz * (h - 70) + 46, tr = 1.5 + Math.min(i * .7, 5); traco(g, [[X - 10, Y - 10], [X + 10, Y + 10]], '#b01810', 3.4, 2, .6, .95, tr); traco(g, [[X + 10, Y - 10], [X - 10, Y + 10]], '#b01810', 3.4, 2, .6, .95, tr); });
      if (marcas.length >= 5) letreiro(g, 'para de vir por aí', w / 2, h - 22, 17, '#b01810', 'italic');
    });
    const lug = lugarParede(r, .8, .8, 1.5, [0, 1, 2, 3]); if (!lug) return;
    const m = naParede(r, lug.lado, lug.c, 1.5, .8, .8, new THREE.MeshStandardMaterial({ map: t, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.userData.leitura = marcas.length ? `O mapa do Davi, com ${marcas.length} X vermelho${marcas.length > 1 ? 's' : ''}.` : 'Um mapa do internato, desenhado à mão.';
    let vt = 0;
    G.ticks.push((dt, ativo) => { if (!ativo || fl().l4v_mapaDavi) return; if (naSala('biblio') && olhar(m.position, .9, 4) > .3) { vt += dt; if (vt > 1.4) { fl().l4v_mapaDavi = true; fala(marcas.length >= 5 ? 'Para de vir por aí... é a letra do Davi.' : marcas.length ? 'Ele marcou onde eu caí. Com a mão tremendo.' : 'O mapa do Davi. Ainda sem nenhum X.'); segredo('mapaDavi'); } } else vt = 0; });
  }

  // A3. Espelho do banheiro: o reflexo atrasa e pisca
  let ESrt = null;
  function espelhoAtrasa() {
    const sala = mapaId() === 'superior' ? 'banhS' : mapaId() === 'terreo' ? 'banh' : null; if (!sala) return; const r = SALA(sala); if (!r) return;
    const lug = lugarParede(r, .78, 1.1, 1.4, [0, 1, 2, 3], .2); if (!lug) return;
    naParede(r, lug.lado, lug.c, 1.4, .78, 1.1, new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: .4, metalness: .6 }), .108);
    const fixo = minima();
    let mapaE;
    if (!fixo) { if (!ESrt) ESrt = rtNovo(128, 160, 3); mapaE = ESrt.rt.texture; }
    else mapaE = tex(128, 160, (g, w, h) => { g.fillStyle = '#8a9098'; g.fillRect(0, 0, w, h); for (let i = 0; i < 140; i++) { g.fillStyle = `rgba(210,218,228,${rand(.05, .2)})`; g.beginPath(); g.arc(rand(0, w), rand(0, h), rand(4, 16), 0, 7); g.fill(); } });
    const vidro = naParede(r, lug.lado, lug.c, 1.4, .66, .98, new THREE.MeshBasicMaterial({ map: mapaE, color: 0xaab0b8 }), .11);
    vidro.userData.leitura = 'Um espelho embaçado. O reflexo demora a te acompanhar.';
    const n = dirLado(lug.lado);
    const liaF = new THREE.Sprite(new THREE.SpriteMaterial({ map: texLiaFrente(false), depthWrite: true })); liaF.scale.set(.8, 1.6, 1); liaF.layers.set(3); W.grupo.add(liaF);
    const buf = []; let piscou = false, enc = 0;
    G.ticks.push((dt, ativo, S) => {
      if (fixo || !naSala(sala)) { enc = 0; return; }
      const v = olhar(vidro.position, .8, 5);
      buf.push({ x: P.pos.x, z: P.pos.z }); if (buf.length > 40) buf.shift();
      const atras = buf[Math.max(0, buf.length - 30)];
      liaF.position.set(atras.x, .9, atras.z);
      enc = v > .3 ? enc + dt : 0;
      if (enc > 9 && !piscou) { piscou = true; liaF.material.map = texLiaFrente(true); setTimeout(() => { try { liaF.material.map = texLiaFrente(false); } catch (e) {} }, 180); if (ativo && !fl().l4v_espelho) { fl().l4v_espelho = true; fala('Ela piscou. Eu não pisquei.'); conq('l4_espelho'); segredo('espelho'); } }
      if (v <= 0) return;
      ESrt.cam.position.set(vidro.position.x - n.x * .1, 1.3, vidro.position.z - n.z * .1); ESrt.cam.lookAt(atras.x, 1.0, atras.z);
      const ant = renderer.getRenderTarget(); renderer.setRenderTarget(ESrt.rt); renderer.render(scene, ESrt.cam); renderer.setRenderTarget(ant);
    });
  }

  // A4. A sombra atrasada no corredor (com uma mãozinha a mais)
  function sombraLenta() {
    const sala = mapaId() === 'superior' ? 'corr' : mapaId() === 'terreo' ? 'cw' : null; if (!sala) return; const r = SALA(sala); if (!r) return;
    const corr = sala === 'corr', lado = corr ? 3 : 0, c = corr ? (r.z0 + r.z1) / 2 : (r.x0 + r.x1) / 2, eixo = corr ? 'z' : 'x';
    const matA = new THREE.MeshBasicMaterial({ map: TX_SOMBRA.pe, transparent: true, opacity: 0, depthWrite: false, color: 0, polygonOffset: true, polygonOffsetFactor: -3 });
    const m = naParede(r, lado, c, 1.15, .7, 1.65, matA, .09);
    const matB = matA.clone(); const m2 = new THREE.Mesh(new THREE.PlaneGeometry(.4, .95), matB); m2.rotation.copy(m.rotation); m2.userData.l4 = true; W.grupo.add(m2);
    const buf = []; let done = false, qAnt = false;
    G.ticks.push((dt, ativo, S) => {
      if (!naSala(sala) || !luzOn() || done) { matA.opacity = Math.max(0, matA.opacity - dt * 3); matB.opacity = matA.opacity * .8; return; }
      buf.push({ x: P.pos.x, z: P.pos.z }); if (buf.length > 28) buf.shift();
      const lag = buf[0];
      m.position[eixo] = clamp(lag[eixo], corr ? r.z0 + .6 : r.x0 + .6, corr ? r.z1 - .6 : r.x1 - .6);
      m2.position.copy(m.position); m2.position.y = .95; m2.position[eixo] += .32;
      const vis = olhar(m.position, .55, 7) > 0 ? 1 : 0;
      matA.opacity = lerp(matA.opacity, vis * (OPT.vFlash ? .4 : .72), Math.min(1, dt * 6)); matB.opacity = matA.opacity * .85;
      const q = ativo && keys.KeyQ; if (q && !qAnt) { done = true; if (!fl().l4v_sombraLenta) { fl().l4v_sombraLenta = true; fala('A minha sombra deu mais um passo. Sozinha. E tinha outra, pequena, de mãos dadas.'); segredo('sombraLenta'); } } qAnt = q;
    });
  }

  // A5. Teatro de sombras do cavalinho
  function cavalinho() {
    if (mapaId() !== 'superior') return; const r = SALA('brinq'); if (!r) return;
    const p = noChao(r, 1.4, 28, .5); if (!p) return;
    const caixa = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .5), new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: .9 })); caixa.position.set(p.x, .25, p.z); caixa.userData.l4 = true; W.grupo.add(caixa);
    const cav = new THREE.Group(); cav.position.set(p.x, .5, p.z); cav.userData.l4 = true; W.grupo.add(cav);
    const mc = new THREE.MeshStandardMaterial({ color: 0x5a3a1a, roughness: .9 });
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(.4, .18, .14), mc); corpo.position.y = .22; cav.add(corpo);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(.16, .22, .12), mc); cab.position.set(.22, .32, 0); cav.add(cab);
    const mx = clamp(p.x - 1.6, r.x0 + .5, r.x1 - .5), mz = p.z;
    const marca = new THREE.Mesh(new THREE.PlaneGeometry(.5, .5), new THREE.MeshBasicMaterial({ map: tex(128, 128, (g) => { g.clearRect(0, 0, 128, 128); traco(g, roda(64, 64, 40, 20), 'rgba(230,230,210,.7)', 4, 2); letreiro(g, 'X', 64, 64, 40, 'rgba(230,230,210,.7)'); }), transparent: true, depthWrite: false })); marca.rotation.x = -PI / 2; marca.position.set(mx, .03, mz); marca.userData.l4 = true; W.grupo.add(marca);
    marca.userData.leitura = 'Uma marca de giz no chão, como se dissesse onde pisar.';
    const bed = (C.S.code[0] % 5) + 1;
    const somT = tex(256, 256, (g) => { g.clearRect(0, 0, 256, 256); letreiro(g, 'CAMA ' + bed, 128, 110, 40, 'rgba(0,0,0,.85)'); traco(g, [[60, 170], [196, 170]], 'rgba(0,0,0,.85)', 6, 2); traco(g, [[196, 170], [170, 152]], 'rgba(0,0,0,.85)', 6, 2); traco(g, [[196, 170], [170, 188]], 'rgba(0,0,0,.85)', 6, 2); });
    const somMat = new THREE.MeshBasicMaterial({ map: somT, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 });
    naParede(r, 2, clamp(mz, r.z0 + .7, r.z1 - .7), 1.3, 1.0, 1.0, somMat, .1);
    G.ticks.push((dt, ativo) => {
      const naMarca = Math.hypot(P.pos.x - mx, P.pos.z - mz) < .8, mira = luzOn() && olhar(cav.position, .78, 3) > .2, ok = naMarca && mira;
      somMat.opacity = lerp(somMat.opacity, ok ? .8 : 0, Math.min(1, dt * 5));
      if (ok && ativo && !fl().l4v_cavalinho) { fl().l4v_cavalinho = true; fala('A sombra do cavalinho virou um número. Cama ' + bed + '.'); segredo('cavalinho'); }
    });
  }

  // A6. Vitral que joga cor no chão; o vermelho esconde a Lia
  function vitralCor() {
    if (mapaId() !== 'cemiterio') return; const r = SALA('capela'); if (!r) return;
    const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2, cores = [0xb02020, 0x2040b0, 0x30a040, 0xc0a020];
    const mats = cores.map((cor, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); m.rotation.x = -PI / 2; m.position.set(cx + (i - 1.5) * 1.3, .03, cz); m.userData.l4 = true; W.grupo.add(m); return m; });
    const verm = mats[0]; let aviso = false;
    G.ticks.push((dt, ativo, S) => {
      const k = naSala('capela') ? clamp((C.raioI || 0) * 1.5, 0, 1) : 0; for (const m of mats) m.material.opacity = k * .5;
      if (naSala('capela') && k > .2 && Math.hypot(P.pos.x - verm.position.x, P.pos.z - verm.position.z) < .8) { if (S) S.fear = Math.max(0, S.fear - dt * 10); if (ativo && !aviso) { aviso = true; fala('A luz vermelha... ela não me acha na luz vermelha.'); segredo('vitralCor'); } }
    });
  }

  // A7. Foto da turma de 1979 que ganha foco a cada segredo
  function turma1979() {
    if (mapaId() !== 'terreo') return; const r = SALA('hall'); if (!r) return;
    const achados = Object.keys(DB.seg).length;
    const t = tex(360, 260, (g, w, h) => {
      g.fillStyle = '#2a2620'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8bc9a'; g.fillRect(12, 12, w - 24, h - 24);
      letreiro(g, 'TURMA DE 1979', w / 2, 30, 18, '#3a2e18');
      const rostos = [[70, 110], [140, 100], [210, 100], [280, 110], [100, 170], [180, 170], [260, 170], [175, 215]];
      rostos.forEach(([x, y], i) => { const nitido = i < Math.min(achados, rostos.length - 1); g.save(); try { if (!nitido) g.filter = 'blur(5px)'; } catch (e) {} g.fillStyle = '#d9c3a0'; g.beginPath(); g.arc(x, y, 15, 0, 7); g.fill(); g.fillStyle = '#2a1c14'; g.beginPath(); g.arc(x, y - 5, 17, PI, 0); g.fill(); g.restore(); });
    });
    const lug = lugarParede(r, .7, .5, 1.6, [0, 2, 3, 1], .2); if (!lug) return;
    const m = naParede(r, lug.lado, lug.c, 1.6, .7, .5, new THREE.MeshStandardMaterial({ map: t, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }));
    m.userData.leitura = `Foto da turma de 1979. ${achados} rosto${achados !== 1 ? 's' : ''} já voltaram ao foco.`;
    let vt = 0;
    G.ticks.push((dt, ativo) => { if (!ativo || fl().l4v_turma79) return; if (naSala('hall') && olhar(m.position, .9, 4) > .3) { vt += dt; if (vt > 1.4) { fl().l4v_turma79 = true; fala('Os rostos vão voltando. Menos um, lá atrás. Esse nunca volta.'); segredo('turma79'); } } else vt = 0; });
  }

  // A8. Caderno de giz: só aparece com o facho rasante
  function cadernoGiz() {
    if (!['terreo', 'superior', 'tuneis'].includes(mapaId())) return;
    const cands = W.salas.filter(s => !s.fora); if (!cands.length) return;
    semear(71); const feitos = [];
    for (let k = 0; k < 2; k++) { const r = cands[Math.floor(rnd() * cands.length)]; const lug = lugarParede(r, .9, .9, 1.2, [0, 1, 2, 3]); if (!lug) continue;
      const frases = ['A LIA DORMIA AQUI', 'NÃO CONTA PRA IRMÃ', 'A GENTE AINDA BRINCA', 'ELE ANDA DE NOITE'];
      const t = tex(256, 256, (g) => { g.clearRect(0, 0, 256, 256); letreiro(g, frases[Math.floor(rnd() * frases.length)], 128, 78, 22, 'rgba(230,228,215,.9)'); silCrianca(g, 128, 210, 140, 'rgba(230,228,215,.8)'); });
      const mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 });
      const m = naParede(r, lug.lado, lug.c, 1.2, .9, .9, mat); const nr = dirLado(lug.lado); feitos.push({ m, mat, nr }); }
    if (!feitos.length) return; let falou = false;
    G.ticks.push((dt, ativo) => { for (const f of feitos) { const vis = naLuz(f.m.position, 6, .9), raso = 1 - Math.abs(fw.x * f.nr.x + fw.z * f.nr.z);
      f.mat.opacity = lerp(f.mat.opacity, vis > 0 ? clamp((raso - .72) / .28, 0, 1) * (OPT.vFlash ? .5 : .9) : 0, Math.min(1, dt * 5));
      if (f.mat.opacity > .4 && ativo && !falou && !fl().l4v_rasante) { falou = true; fl().l4v_rasante = true; fala('Tem giz aqui. Só aparece com a luz de lado.'); segredo('rasante'); } } });
  }

  // A9. Fita de vídeo com tracking que firma quando você encara
  function fitaVideo() {
    if (mapaId() !== 'terreo') return; const r = SALA('diret'); if (!r) return;
    const lug = lugarParede(r, .9, .8, 1.0, [1, 0, 2, 3], .35); if (!lug) return;
    naParede(r, lug.lado, lug.c, 1.0, .9, .8, new THREE.MeshStandardMaterial({ color: 0x2a2824, roughness: .8 }), .2);
    const base = tex(128, 96, (g) => { g.fillStyle = '#b0a070'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#8a2a2a'; g.fillRect(20, 40, 88, 30); for (let i = 0; i < 5; i++) { g.fillStyle = '#e8d0a0'; g.beginPath(); g.arc(30 + i * 16, 36, 6, 0, 7); g.fill(); } g.fillStyle = '#242424'; g.beginPath(); g.arc(106, 34, 7, 0, 7); g.fill(); letreiro(g, 'ANIVERSÁRIO 1978', 64, 84, 12, '#403020'); });
    const baseCv = base.image, cv = document.createElement('canvas'); cv.width = 128; cv.height = 96; const g2 = cv.getContext('2d'); const texF = new THREE.CanvasTexture(cv); texF.colorSpace = THREE.SRGBColorSpace;
    const tela = naParede(r, lug.lado, lug.c, 1.05, .6, .46, new THREE.MeshBasicMaterial({ map: texF, color: 0x9aa89a }), .205);
    tela.userData.leitura = 'Uma fita: ANIVERSÁRIO 1978. A imagem treme. Encare para firmar.';
    let olhando = 0, pronto = false, chi = 0, redraw = 0;
    G.ticks.push((dt, ativo, S) => {
      if (!naSala('diret')) { olhando = Math.max(0, olhando - dt); return; } // fora da diretoria: nada de canvas
      const v = olhar(tela.position, .85, 5); olhando = v > .3 ? olhando + dt : Math.max(0, olhando - dt * 2);
      const tr = pronto ? 0 : clamp(1 - olhando / 4, 0, 1);
      redraw += dt; if (redraw >= 1 / 15) { redraw = 0; g2.clearRect(0, 0, 128, 96); const jit = (Math.random() - .5) * tr * 18; g2.drawImage(baseCv, 0, jit, 128, 96); for (let i = 0; i < Math.floor(tr * 10); i++) { const y = Math.random() * 96; g2.fillStyle = `rgba(240,240,240,${rand(.2, .6)})`; g2.fillRect(0, y, 128, rand(1, 3)); } texF.needsUpdate = true; }
      chi += dt; if (tr > .3 && chi > .6) { chi = 0; som('l4fita'); }
      if (!pronto && olhando > 4) { pronto = true; som('l4fita'); if (ativo) { fala('Um menino magro no fundo. Ele não era dessa turma.'); conq('l4_tracking'); segredo('fita'); } }
    });
  }

  // A10. Os óculos rachados do Moacir: o som vira anel de luz
  function oculosMoacir() {
    const sala = mapaId() === 'terreo' ? 'cw' : mapaId() === 'tuneis' ? 't6' : null; if (!sala) return; const r = SALA(sala); if (!r) return;
    const p = noChao(r, 1, 24, .4) || { x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2 };
    const oc = new THREE.Group(); oc.position.set(p.x, .06, p.z); oc.userData.l4 = true; W.grupo.add(oc);
    const mo = new THREE.MeshStandardMaterial({ color: 0x202020, roughness: .4, metalness: .3 });
    for (const sx of [-1, 1]) { const a = new THREE.Mesh(new THREE.TorusGeometry(.05, .012, 6, 12), mo); a.position.set(sx * .06, 0, 0); a.rotation.x = PI / 2; oc.add(a); }
    oc.userData.leitura = 'Os óculos de lente rachada do Moacir. Por eles, o mundo escurece e o som vira luz.';
    const aneis = []; for (let i = 0; i < 4; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_ANEL, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, color: 0xbfe0ff })); s.userData.l4 = true; scene.add(s); aneis.push({ s, t: 9 }); }
    let usos = DB.seg.oculos ? 2 : 0, vis = 0, era = false;
    G.ticks.push((dt, ativo, S) => {
      const perto = Math.hypot(P.pos.x - p.x, P.pos.z - p.z) < 1.2 && luzOn() && olhar(oc.position, .7, 1.7) > .1;
      if (perto && !era && usos < 3) { usos++; vis = 3.2; som('l4anel'); if (usos >= 3 && !fl().l4v_oculos) { fl().l4v_oculos = true; fala('Uma silhueta alta. Do meu lado. Feita só de som.'); } segredo('oculos'); }
      era = perto; vis = Math.max(0, vis - dt);
      let i = 0; for (const a of aneis) { a.t += dt; if (a.t > 1.3) { a.t = 0; const yaw = camera.rotation.y;
        const alvo = usos >= 3 && i === 0 ? { x: P.pos.x + Math.cos(yaw) * .6, z: P.pos.z - Math.sin(yaw) * .6, y: 1.3 } : i === 1 ? { x: P.pos.x + Math.cos(yaw) * 2, z: P.pos.z - Math.sin(yaw) * 2, y: 1.0 } : { x: P.pos.x, z: P.pos.z, y: 1.0 };
        a.s.position.set(alvo.x, alvo.y, alvo.z); }
        const k = a.t / 1.3; a.s.scale.setScalar(.2 + k * 1.6); a.s.material.opacity = (vis > 0 ? clamp(vis, 0, 1) : 0) * (1 - k) * .5; i++; }
    });
  }

  // A11. Pegadas descalças atrás de você (só olhando para trás)
  function pegadasAtras() {
    if (mapaId() === 'estrada') return;
    const N = 6, ps = []; for (let i = 0; i < N; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.14, .28), new THREE.MeshBasicMaterial({ map: TX_PE, transparent: true, opacity: 0, depthWrite: false, color: 0x203040 })); m.rotation.x = -PI / 2; m.visible = false; m.userData.l4 = true; W.grupo.add(m); ps.push({ m, t: 0 }); }
    let dist = 0, idx = 0; const last = new THREE.Vector3().copy(P.pos);
    G.ticks.push((dt, ativo, S) => {
      const piso = P.room && !P.room.fora && /ladrilho|concreto|pedra/.test(P.room.piso || '');
      dist += last.distanceTo(P.pos); last.copy(P.pos);
      if (piso && dist > .6) { dist = 0; const pt = ps[idx % N]; idx++; pt.m.position.set(P.pos.x, .02, P.pos.z); pt.m.rotation.z = camera.rotation.y + (idx % 2 ? .3 : -.3); pt.t = 4; pt.m.visible = true; }
      const olhandoTras = ativo && keys.KeyQ && luzOn();
      let vivo = false; for (const pt of ps) { pt.t = Math.max(0, pt.t - dt); pt.m.material.opacity = (pt.t > 0 && olhandoTras) ? clamp(pt.t / 4, 0, 1) * .6 : 0; if (pt.t > 1) vivo = true; if (pt.t <= 0) pt.m.visible = false; }
      if (olhandoTras && vivo && !fl().l4v_pegadasT) { fl().l4v_pegadasT = true; fala('Pegadas. Atrás de mim. Pés descalços.'); segredo('pegadasTras'); }
    });
  }

  // A12. Vulto na janela do fim do corredor (no relâmpago)
  function vultoJanela() {
    if (mapaId() !== 'superior') return; const js = janelasDe(x => x.id === 'corr'); if (!js.length) return; const j = js[js.length - 1];
    const b = naParede(j.r, j.lado, j.c, 1.75, .01, .01, new THREE.MeshBasicMaterial({ visible: false }), .2);
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_SOMBRA.pe, color: 0x05070a, transparent: true, opacity: 0, depthWrite: false })); spr.scale.set(.7, 1.5, 1); spr.position.copy(b.position); spr.position.y = 1.3; spr.userData.l4 = true; W.grupo.add(spr);
    G.ticks.push((dt, ativo, S) => { const k = naSala('corr') ? clamp((C.raioI || 0) * 2, 0, 1) : 0; spr.material.opacity = k * .9; if (k > .5 && ativo && olhar(spr.position, .9, 22) > .3 && !fl().l4v_vultoJan) { fl().l4v_vultoJan = true; fala('Tinha alguém na janela. Agora não tem.'); segredo('vultoJanela'); } });
  }

  // A13. Pingos escuros na pia que a luz faz sumir
  function pingosPia() {
    const sala = mapaId() === 'superior' ? 'banhS' : mapaId() === 'terreo' ? 'banh' : null; if (!sala) return; const r = SALA(sala); if (!r) return;
    const p = noChao(r, 1, 20, .4) || { x: (r.x0 + r.x1) / 2, z: r.z0 + .6 };
    const t = tex(128, 128, (g) => { g.clearRect(0, 0, 128, 128); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(60,10,10,.8)'; g.beginPath(); g.ellipse(rand(30, 98), rand(30, 98), rand(4, 9), rand(6, 14), 0, 0, 7); g.fill(); } });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.5, .5), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = -PI / 2; m.position.set(p.x, .9, p.z); m.userData.l4 = true; W.grupo.add(m);
    G.ticks.push((dt, ativo, S) => { const v = naLuz(m.position, 3, .85); m.material.opacity = lerp(m.material.opacity, v > 0 ? 0 : .7, Math.min(1, dt * 4)); if (naSala(sala) && Math.hypot(P.pos.x - p.x, P.pos.z - p.z) < 1 && ativo && !fl().l4v_pingos) { fl().l4v_pingos = true; fala('Mancha pingando na pia. Acendi a luz e sumiu.'); segredo('pingos'); } });
  }

  // A14. O retrato cujos olhos brilham e acompanham
  function retratoOlhos() {
    const sala = mapaId() === 'terreo' ? 'diret' : mapaId() === 'superior' ? 'celeste' : null; if (!sala) return; const r = SALA(sala); if (!r) return;
    const lug = lugarParede(r, .5, .62, 1.7, [0, 1, 2, 3], .2); if (!lug) return;
    const t = tex(128, 160, (g) => { g.fillStyle = '#4a3a28'; g.fillRect(0, 0, 128, 160); g.fillStyle = '#8a7a5a'; g.fillRect(10, 10, 108, 140); g.fillStyle = '#6a5a44'; g.beginPath(); g.ellipse(64, 72, 30, 38, 0, 0, 7); g.fill(); g.fillStyle = '#2a2018'; g.beginPath(); g.arc(64, 58, 26, PI, 0); g.fill(); });
    const m = naParede(r, lug.lado, lug.c, 1.7, .5, .62, new THREE.MeshStandardMaterial({ map: t, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }));
    const nr = dirLado(lug.lado), lateral = lug.lado < 2 ? 'x' : 'z';
    const os = [-1, 1].map(sx => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_BRILHO, color: 0xfff0c0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.set(.03, .03, 1); s.position.copy(m.position); s.position.y = 1.74; s.position[lateral] += sx * .07; s.position.x -= nr.x * .01; s.position.z -= nr.z * .01; s.userData.l4 = true; W.grupo.add(s); return s; });
    G.ticks.push((dt, ativo) => { const v = naLuz(m.position, 6, .95); for (const o of os) o.material.opacity = v * (.5 + Math.random() * .3); if (v > .5 && ativo && !fl().l4v_retrato) { fl().l4v_retrato = true; fala('Os olhos do quadro brilham. E acompanham.'); segredo('retrato'); } });
  }

  // A15. No teto do Dormitório B, uma frase no clarão
  function tetoDormB() {
    if (mapaId() !== 'superior') return; const r = SALA('dormB'); if (!r) return;
    const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2, h = r.h || 3.2;
    const t = tex(256, 256, (g) => { g.clearRect(0, 0, 256, 256); letreiro(g, 'ELE CONTA AS CAMAS', 128, 128, 30, 'rgba(200,40,30,.9)'); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry((r.x1 - r.x0) - 1, (r.z1 - r.z0) - 1), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = PI / 2; m.position.set(cx, h - .02, cz); m.userData.l4 = true; W.grupo.add(m);
    G.ticks.push(() => { m.material.opacity = naSala('dormB') ? clamp((C.raioI || 0) * 1.4, 0, OPT.vFlash ? .4 : .9) : 0; });
  }

  // A16. A sombra do balanço que se mexe sozinha no pátio
  function balancoPatio() {
    if (mapaId() !== 'terreo') return; const r = SALA('patio'); if (!r) return;
    const t = tex(128, 256, (g) => { g.clearRect(0, 0, 128, 256); g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(58, 10, 4, 180); g.fillRect(40, 186, 48, 8); g.beginPath(); g.arc(60, 72, 6, 0, 7); g.fill(); });
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false })); spr.scale.set(1, 2, 1); spr.position.set(clamp((r.x0 + r.x1) / 2 + 3, r.x0 + 1, r.x1 - 1), 1, r.z0 + 1.5); spr.userData.l4 = true; W.grupo.add(spr);
    G.ticks.push((dt, ativo, S, tt) => { const v = naLuz(spr.position, 8, .9); spr.material.opacity = v * .5; spr.material.rotation = Math.sin(tt * 1.3) * .18; if (v > .4 && ativo && !fl().l4v_balanco) { fl().l4v_balanco = true; fala('A sombra de um balanço se mexe. Balanço nenhum ali.'); segredo('balanco'); } });
  }

  // A17. O vulto refletido no encerado da lousa
  function lousaReflexo() {
    if (mapaId() !== 'terreo') return; const r = SALA('aula'); if (!r) return;
    const lug = lugarParede(r, 1.6, 1.0, 1.4, [1, 0], .2); if (!lug) return;
    naParede(r, lug.lado, lug.c, 1.4, 1.6, 1.0, new THREE.MeshStandardMaterial({ color: 0x14251a, roughness: .35 }), .108);
    const b = naParede(r, lug.lado, lug.c, 1.4, .01, .01, new THREE.MeshBasicMaterial({ visible: false }), .112);
    const vulto = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_SOMBRA.pe, color: 0x0a140e, transparent: true, opacity: 0, depthWrite: false })); vulto.scale.set(.5, 1.1, 1); vulto.position.copy(b.position); vulto.position.y = 1.35; vulto.userData.l4 = true; W.grupo.add(vulto);
    let vt = 0;
    G.ticks.push((dt, ativo) => { const v = naLuz(b.position, 6, .9); vulto.material.opacity = lerp(vulto.material.opacity, v > .3 ? .4 : 0, Math.min(1, dt * 3)); if (v > .3) { vt += dt; if (vt > 3 && ativo && !fl().l4v_lousa) { fl().l4v_lousa = true; fala('No encerado da lousa tem um vulto refletido. Atrás de mim.'); segredo('lousa'); } } else vt = 0; });
  }

  // A18. O caleidoscópio de lata e a menina que se aproxima
  function caleidoscopio() {
    if (mapaId() !== 'superior') return; const r = SALA('brinq'); if (!r) return;
    const p = noChao(r, 1.4, 24, .4); if (!p) return;
    const lata = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .3, 10), new THREE.MeshStandardMaterial({ color: 0x8a7a3a, roughness: .5, metalness: .4 })); lata.position.set(p.x, .15, p.z); lata.rotation.z = .4; lata.userData.l4 = true; W.grupo.add(lata);
    lata.userData.leitura = 'Um caleidoscópio de lata. Aponte a luz para dentro dele.';
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const g2 = cv.getContext('2d'); const texK = new THREE.CanvasTexture(cv); texK.colorSpace = THREE.SRGBColorSpace;
    const h = r.h || 3.2; const proj = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: texK, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); proj.rotation.x = PI / 2; proj.position.set(p.x, h - .03, p.z); proj.userData.l4 = true; W.grupo.add(proj);
    let prog = 0, salvou = false, era = false, rk = 0;
    G.ticks.push((dt, ativo, S) => {
      const mira = luzOn() && olhar(lata.position, .8, 2.2) > .1;
      prog = mira ? Math.min(1, prog + dt / 8) : Math.max(0, prog - dt / 4);
      proj.material.opacity = prog > .02 ? .6 : 0;
      if (naSala('brinq') && prog > .02) { rk += dt; if (rk >= 1 / 15) { rk = 0; g2.clearRect(0, 0, 256, 256); g2.save(); g2.translate(128, 128);
        for (let s = 0; s < 6; s++) { g2.rotate(PI / 3); g2.save(); if (s % 2) g2.scale(1, -1); g2.fillStyle = 'rgba(120,90,160,.5)'; g2.beginPath(); g2.moveTo(0, 0); g2.arc(0, 0, 120, -PI / 6, PI / 6); g2.closePath(); g2.fill(); const d = (1 - prog) * 100 + 10; g2.fillStyle = 'rgba(20,16,24,.9)'; g2.beginPath(); g2.arc(d, -8, 6, 0, 7); g2.fill(); g2.fillRect(d - 5, -4, 10, 16); g2.restore(); }
        g2.restore(); texK.needsUpdate = true; } }
      if (era && !mira && prog > .4 && prog < .95 && !salvou) { salvou = true; conq('l4_seis'); fala('Seis meninas. Desviei a tempo.'); }
      if (prog >= 1 && ativo && !fl().l4v_caleid) { fl().l4v_caleid = true; fala('A menina chegou ao centro. E virou pra mim.'); if (S) S.fear = Math.min(100, S.fear + 15); segredo('caleidoscopio'); }
      era = mira;
    });
  }

  // B1. Vela do cemitério que fica vermelha quando você chega
  function velaCor() {
    if (mapaId() !== 'cemiterio') return; const r = SALA('cem'); if (!r) return; const p = noChao(r, 2, 20, .4) || { x: r.x0 + 3, z: r.z1 - 3 };
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_BRILHO, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.scale.set(.2, .36, 1); s.position.set(p.x, .4, p.z); s.userData.l4 = true; scene.add(s);
    G.ticks.push((dt, ativo, S, tt) => { const perto = Math.hypot(P.pos.x - p.x, P.pos.z - p.z), k = clamp(1 - (perto - 1) / 3, 0, 1); s.material.color.setRGB(1, .6 - k * .5, .3 - k * .2); s.material.opacity = .7 + Math.sin(tt * 9) * .15; if (k > .7 && ativo && !fl().l4v_velaCor) { fl().l4v_velaCor = true; fala('A chama ficou vermelha quando eu cheguei perto.'); segredo('velaCor'); } });
  }

  // B2. Setas de giz fosforescente no chão do túnel
  function setasTunel() {
    if (mapaId() !== 'tuneis') return; const r = W.salas.find(s => !s.fora); if (!r) return; const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2;
    const t = tex(256, 256, (g) => { g.clearRect(0, 0, 256, 256); for (let k = 0; k < 3; k++) { const y = 60 + k * 70; traco(g, [[60, y], [200, y]], 'rgba(150,255,170,.9)', 6, 2); traco(g, [[200, y], [170, y - 20]], 'rgba(150,255,170,.9)', 6, 2); traco(g, [[200, y], [170, y + 20]], 'rgba(150,255,170,.9)', 6, 2); } });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); m.rotation.x = -PI / 2; m.position.set(cx, .03, cz); m.userData.l4 = true; W.grupo.add(m);
    let carga = 0; G.ticks.push((dt, ativo, S) => { const dentro = P.room && P.room.id === r.id; if (dentro && luzOn() && pitch() < -.2) carga = Math.min(1, carga + dt / 2.5); else carga = Math.max(0, carga - dt / (S.flashOn ? 5 : 9)); m.material.opacity = carga * (S.flashOn ? .1 : .9); if (dentro && !S.flashOn && carga > .5 && ativo && !fl().l4v_setas) { fl().l4v_setas = true; fala('Setas no chão. Brilham quando apago a luz.'); segredo('setas'); } });
  }

  // B3. Mãozinhas fosforescentes no teto do banheiro de cima
  function maosTeto() {
    if (mapaId() !== 'superior') return; const r = SALA('banhS'); if (!r) return; const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2, h = r.h || 3.2;
    const t = tex(256, 256, (g) => { g.clearRect(0, 0, 256, 256); g.fillStyle = 'rgba(150,255,170,1)'; for (let k = 0; k < 6; k++) { const x = rand(40, 216), y = rand(40, 216); g.beginPath(); g.ellipse(x, y, 16, 22, 0, 0, 7); g.fill(); for (let f = 0; f < 5; f++) { g.beginPath(); g.ellipse(x - 16 + f * 8, y - 24, 4, 10, 0, 0, 7); g.fill(); } } });
    const m = new THREE.Mesh(new THREE.PlaneGeometry((r.x1 - r.x0) - 1, (r.z1 - r.z0) - 1), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); m.rotation.x = PI / 2; m.position.set(cx, h - .02, cz); m.userData.l4 = true; W.grupo.add(m);
    let carga = 0; G.ticks.push((dt, ativo, S) => { const dentro = naSala('banhS'); if (dentro && luzOn() && pitch() > .5) carga = Math.min(1, carga + dt / 3); else carga = Math.max(0, carga - dt / (S.flashOn ? 4 : 10)); m.material.opacity = carga * (S.flashOn ? .1 : .9); if (dentro && !S.flashOn && carga > .5 && ativo && !fl().l4v_maosTeto) { fl().l4v_maosTeto = true; fala('Mãozinhas no teto. Alguém se pendurou aqui.'); segredo('maosTeto'); } });
  }

  // B4. Móbile de brinquedos: sombras de bichos e uma de gente
  function mobilePecas() {
    if (mapaId() !== 'superior') return; const r = SALA('brinq'); if (!r) return; const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2, h = r.h || 3.2;
    const t = tex(256, 256, (g) => { g.clearRect(0, 0, 256, 256); g.fillStyle = 'rgba(0,0,0,.8)'; g.beginPath(); g.ellipse(70, 130, 16, 20, 0, 0, 7); g.ellipse(64, 100, 5, 16, 0, 0, 7); g.ellipse(78, 100, 5, 16, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(150, 130, 18, 12, 0, 0, 7); g.moveTo(168, 126); g.lineTo(190, 120); g.lineTo(168, 134); g.fill(); silCrianca(g, 212, 160, 90, 'rgba(0,0,0,.85)'); });
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false })); spr.scale.set(2.2, 2.2, 1); spr.position.set(cx, h - 1.1, cz - .1); spr.userData.l4 = true; W.grupo.add(spr);
    G.ticks.push((dt, ativo, S, tt) => { const v = naLuz(v1.set(cx, 1.6, cz), 6, .9); spr.material.opacity = v * .5; spr.position.x = cx + Math.sin(tt * .8) * .1; if (v > .4 && ativo && !fl().l4v_mobile) { fl().l4v_mobile = true; fala('Sombras de coelho, de passarinho... e uma de gente, que vira a cabeça.'); segredo('mobile'); } });
  }

  // B5. A lua com rosto refletida na poça perto do carro
  function luaParabrisa() {
    if (mapaId() !== 'estrada') return;
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: LUA[0], transparent: true, opacity: 0, depthWrite: false, fog: false })); spr.scale.set(1.2, 1.2, 1); spr.userData.l4 = true; scene.add(spr);
    const px = 2, pz = 6; spr.position.set(px, .1, pz);
    G.ticks.push((dt, ativo, S, tt) => { spr.material.opacity = (P.room && P.room.fora ? .3 : 0) * (.6 + Math.sin(tt * 2) * .2); semear(144); if (rnd() < 1 / 3 && Math.hypot(P.pos.x - px, P.pos.z - pz) < 2.2 && olhar(spr.position, .9, 4) > .3) { spr.material.map = LUA[1]; if (ativo && !fl().l4v_luaPoca) { fl().l4v_luaPoca = true; fala('A lua na poça... tinha um rosto.'); segredo('luaPoca'); } } });
  }

  // B6. "ELE OUVE O AR" escrito no vapor de uma porta de vidro no túnel
  function vaporTunel() {
    if (mapaId() !== 'tuneis') return; const r = W.salas.find(s => !s.fora && (s.id === 'dep' || s.id === 'secreta')) || W.salas.find(s => !s.fora); if (!r) return;
    const lug = lugarParede(r, .9, 1.2, 1.3, [0, 1, 2, 3]); if (!lug) return;
    naParede(r, lug.lado, lug.c, 1.3, .9, 1.3, new THREE.MeshStandardMaterial({ color: 0x2a3038, roughness: .2, metalness: .5, transparent: true, opacity: .5 }), .108);
    const t = tex(256, 128, (g) => { g.clearRect(0, 0, 256, 128); letreiro(g, 'ELE OUVE O AR', 128, 64, 30, 'rgba(210,220,230,.9)'); });
    const mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 });
    const m = naParede(r, lug.lado, lug.c, 1.3, .8, .4, mat, .11); m.userData.rev = 0;
    let ar = 0; G.ticks.push((dt, ativo, S) => { const perto = m.position.distanceTo(camera.position) < 1.4 && olhar(m.position, .7, 1.6) > 0; const prende = !!(keys.Space || P.arTrava) && ativo && !S.hidden; if (prende) ar += dt; else { if (ar >= 2 && perto) { m.userData.rev = 3; if (!fl().l4v_vapor) { fl().l4v_vapor = true; setTimeout(() => fala('Escrito no vapor: ele ouve o ar. Prender o fôlego perto dele não dura pra sempre.'), 600); segredo('vapor'); } } ar = 0; } if (m.userData.rev > 0) m.userData.rev -= dt; mat.opacity = clamp((m.userData.rev || 0) / 3, 0, 1) * .85; });
  }

  // B7. A plaquinha de porta que muda de número quando você não olha
  function portaNumero() {
    if (mapaId() !== 'superior') return; const r = SALA('corr'); if (!r) return;
    const faz = n => tex(128, 128, (g) => { papel(g, 128, 128, '#d8cba6'); letreiro(g, String(n), 64, 64, 60, '#3a2a12'); });
    const lug = lugarParede(r, .3, .3, 1.8, [2, 3]); if (!lug) return; let num = 5;
    const m = naParede(r, lug.lado, lug.c, 1.8, .3, .3, new THREE.MeshStandardMaterial({ map: faz(num), roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 })); m.userData.leitura = 'Uma plaquinha de porta com um número.';
    let fora = 0, falou = false; G.ticks.push((dt, ativo) => { const vendo = naSala('corr') && olhar(m.position, .9, 5) > .3; if (!vendo) { fora += dt; if (fora > 2 && num < 6) { num = 6; m.material.map = faz(num); } } else { if (num === 6 && ativo && !falou) { falou = true; fala('Essa porta era a cinco. Agora diz seis.'); segredo('portaNum'); } fora = 0; } });
  }

  // B8. Pingos no teto do Dormitório C que formam uma palavra
  function gotasTeto() {
    if (mapaId() !== 'superior') return; const r = SALA('dormC'); if (!r) return; const cx = (r.x0 + r.x1) / 2, cz = (r.z0 + r.z1) / 2, h = r.h || 3.2;
    const t = tex(256, 128, (g) => { g.clearRect(0, 0, 256, 128); letreiro(g, 'VOLTA', 128, 64, 44, 'rgba(70,20,20,.85)'); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .7), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false })); m.rotation.x = PI / 2; m.position.set(cx, h - .02, cz); m.userData.l4 = true; W.grupo.add(m);
    G.ticks.push((dt, ativo) => { const v = naLuz(v1.set(cx, h - .1, cz), 6, .9) * (pitch() > .4 ? 1 : 0); m.material.opacity = v * .8; if (v > .4 && ativo && !fl().l4v_gotas) { fl().l4v_gotas = true; fala('Pingou do teto e formou uma palavra. VOLTA.'); segredo('gotas'); } });
  }

  // B9. O relógio da sala de aula parado às três
  function relogioParado() {
    if (mapaId() !== 'terreo') return; const r = SALA('aula'); if (!r) return; const lug = lugarParede(r, .4, .4, 2.1, [0, 1, 2, 3]); if (!lug) return;
    const t = tex(128, 128, (g) => { g.fillStyle = '#e8e0d0'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 3; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.stroke(); g.lineWidth = 4; g.beginPath(); g.moveTo(64, 64); g.lineTo(64, 24); g.moveTo(64, 64); g.lineTo(92, 64); g.stroke(); });
    const m = naParede(r, lug.lado, lug.c, 2.1, .4, .4, new THREE.MeshStandardMaterial({ map: t, roughness: .6, polygonOffset: true, polygonOffsetFactor: -2 })); m.userData.leitura = 'Um relógio de parede parado às três horas.';
    let vt = 0; G.ticks.push((dt, ativo) => { if (!ativo || fl().l4v_relogio) return; if (naSala('aula') && olhar(m.position, .9, 5) > .3) { vt += dt; if (vt > 1.5) { fl().l4v_relogio = true; fala('O relógio parou às três. A hora que tudo parou aqui.'); segredo('relogio'); } } else vt = 0; });
  }

  // B10. Sombra de cela e uma criança entre as barras (corredor de cima)
  function barrasCela() {
    if (mapaId() !== 'superior') return; const r = SALA('corr'); if (!r) return;
    const t = tex(256, 256, (g) => { g.clearRect(0, 0, 256, 256); g.fillStyle = 'rgba(0,0,0,.55)'; for (let i = 0; i < 7; i++) g.fillRect(20 + i * 32, 0, 10, 256); silCrianca(g, 128, 210, 120, 'rgba(0,0,0,.5)'); });
    const mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false }); const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); m.rotation.x = -PI / 2; m.position.set((r.x0 + r.x1) / 2, .03, clamp((r.z0 + r.z1) / 2 - 10, r.z0 + 1, r.z1 - 1)); m.userData.l4 = true; W.grupo.add(m);
    G.ticks.push((dt, ativo, S) => { const k = naSala('corr') ? clamp((C.raioI || 0) * 1.4, 0, 1) : 0; mat.opacity = k * .6; if (k > .5 && ativo && !fl().l4v_barras) { fl().l4v_barras = true; fala('As grades fazem sombra de cela. E tem alguém entre as barras.'); segredo('barras'); } });
  }

  // B11. Fotos do hall com os olhos riscados que ainda brilham
  function fotosRiscadas() {
    if (mapaId() !== 'terreo') return; const r = SALA('hall'); if (!r) return; const lug = lugarParede(r, .4, .5, 1.65, [0, 2, 3, 1], .2); if (!lug) return;
    const t = tex(128, 160, (g) => { g.fillStyle = '#3a3228'; g.fillRect(0, 0, 128, 160); g.fillStyle = '#b8ac8a'; g.fillRect(12, 12, 104, 136); g.fillStyle = '#8a7a5a'; g.beginPath(); g.arc(64, 70, 26, 0, 7); g.fill(); g.strokeStyle = '#201810'; g.lineWidth = 4; g.beginPath(); g.moveTo(48, 60); g.lineTo(60, 70); g.moveTo(68, 60); g.lineTo(80, 70); g.stroke(); });
    const m = naParede(r, lug.lado, lug.c, 1.65, .4, .5, new THREE.MeshStandardMaterial({ map: t, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 }));
    const olho = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_BRILHO, color: 0xffe0a0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); olho.scale.set(.05, .05, 1); olho.position.copy(m.position); olho.position.y = 1.72; olho.userData.l4 = true; W.grupo.add(olho);
    G.ticks.push((dt, ativo) => { const v = naLuz(m.position, 6, .95); olho.material.opacity = v * (.4 + Math.random() * .4); if (v > .5 && ativo && !fl().l4v_fotosR) { fl().l4v_fotosR = true; fala('Riscaram os olhos dessa foto. Mas ainda brilham.'); segredo('fotosR'); } });
  }

  // B12. Pés que passam por baixo de uma porta
  function pesSobPorta() {
    if (!['terreo', 'superior'].includes(mapaId())) return; const link = W.links.find(l => l.nome); if (!link) return;
    const t = tex(128, 32, (g) => { g.clearRect(0, 0, 128, 32); g.fillStyle = 'rgba(0,0,0,.8)'; g.beginPath(); g.ellipse(48, 16, 10, 8, 0, 0, 7); g.ellipse(80, 16, 10, 8, 0, 0, 7); g.fill(); });
    const mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false }); const m = new THREE.Mesh(new THREE.PlaneGeometry(.8, .1), mat); m.position.set(link.x, .05, link.z); m.rotation.x = -PI / 2; m.userData.l4 = true; W.grupo.add(m);
    let acc = rand(6, 14), falou = false; G.ticks.push((dt, ativo) => { acc -= dt; const d = Math.hypot(P.pos.x - link.x, P.pos.z - link.z); if (acc < 0 && d < 4) { mat.opacity = Math.min(1, mat.opacity + dt * 2); if (mat.opacity >= 1) acc = rand(16, 28); if (!falou && ativo && mat.opacity > .6) { falou = true; fala('Passaram pés por baixo da porta. Agora.'); segredo('pesPorta'); } } else mat.opacity = Math.max(0, mat.opacity - dt * 1.5); });
  }

  // B13. A cruz da capela que aparece de cabeça para baixo no relâmpago
  function cruzCapela() {
    if (mapaId() !== 'cemiterio') return; const r = SALA('capela'); if (!r) return; const lug = lugarParede(r, .6, 1.0, 1.9, [1, 0]); if (!lug) return;
    const t = tex(128, 200, (g) => { g.clearRect(0, 0, 128, 200); g.fillStyle = 'rgba(120,20,20,.85)'; g.fillRect(56, 20, 16, 160); g.fillRect(26, 60, 76, 16); });
    const mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 });
    const m = naParede(r, lug.lado, lug.c, 1.9, .6, 1.0, mat); m.rotation.z = PI;
    G.ticks.push((dt, ativo) => { const k = naSala('capela') ? clamp((C.raioI || 0) * 1.5, 0, 1) : 0; mat.opacity = k * .85; if (k > .5 && ativo && !fl().l4v_cruz) { fl().l4v_cruz = true; fala('No raio, a cruz aparece. De cabeça pra baixo.'); segredo('cruz'); } });
  }

  // B14. Caco de espelho num armário mostrando um rosto que não é o seu
  function armarioRosto() {
    if (!['terreo', 'superior'].includes(mapaId())) return; const arm = W.lockers.filter(L => L.tipo === 'armario' && L.g); if (!arm.length) return;
    semear(88); const L = arm[Math.floor(rnd() * arm.length)];
    const t = tex(128, 160, (g) => { g.clearRect(0, 0, 128, 160); g.fillStyle = 'rgba(180,190,200,.25)'; g.fillRect(24, 20, 80, 120); g.strokeStyle = 'rgba(40,40,45,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(40, 20); g.lineTo(70, 140); g.moveTo(90, 30); g.lineTo(60, 120); g.stroke(); g.fillStyle = 'rgba(20,16,18,.55)'; g.beginPath(); g.arc(64, 74, 22, 0, 7); g.fill(); g.fillStyle = 'rgba(200,200,190,.5)'; g.beginPath(); g.arc(55, 70, 4, 0, 7); g.arc(73, 70, 4, 0, 7); g.fill(); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.3, .4), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false })); m.position.set(0, 1.4, .3); m.rotation.y = PI; m.userData.l4 = true; L.g.add(m);
    G.ticks.push((dt, ativo, S) => { L.g.getWorldPosition(v2); v2.y = 1.4; m.material.opacity = S.hidden === L ? 0 : naLuz(v2, 5, .95) * .7; if (m.material.opacity > .4 && ativo && !fl().l4v_armRosto) { fl().l4v_armRosto = true; fala('Tem um caco de espelho no armário. E um rosto nele que não é o meu.'); segredo('armRosto'); } });
  }

  // B15. As velas do altar que acendem sozinhas
  function altarVelas() {
    if (mapaId() !== 'cemiterio') return; const r = SALA('capela'); if (!r) return; const cx = (r.x0 + r.x1) / 2, cz = r.z0 + 1.5;
    const velas = []; for (let i = 0; i < 7; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX_BRILHO, color: 0xffcf80, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); s.scale.set(.12, .22, 1); s.position.set(cx - .9 + i * .3, 1.0, cz); s.userData.l4 = true; scene.add(s); velas.push(s); }
    let n = 3, tt = 0; G.ticks.push((dt, ativo, S, t2) => { tt += dt; if (naSala('capela') && tt > 4 && n < 7) { tt = 0; n++; } velas.forEach((s, i) => { s.material.opacity = i < n ? .6 + Math.sin(t2 * 8 + i) * .2 : 0; }); if (n >= 6 && naSala('capela') && ativo && !fl().l4v_altar) { fl().l4v_altar = true; fala('Tinha três velas acesas. Agora são seis. Ninguém acendeu.'); segredo('altar'); } });
  }

  // B16. O contorno de giz no pátio que ganha um segundo corpo
  function contornoPatio() {
    if (mapaId() !== 'terreo') return; const r = SALA('patio'); if (!r) return; const p = noChao(r, 2, 20, .6) || { x: 0, z: 8 };
    const faz = dois => tex(256, 256, (g) => { const corpo = (x, rot) => { g.save(); g.translate(x, 128); g.rotate(rot); traco(g, roda(0, -70, 16, 14), 'rgba(230,230,210,.7)', 4, 2); traco(g, [[0, -54], [0, 10]], 'rgba(230,230,210,.7)', 4, 2); traco(g, [[0, -40], [-30, -10]], 'rgba(230,230,210,.7)', 4, 2); traco(g, [[0, -40], [30, -10]], 'rgba(230,230,210,.7)', 4, 2); traco(g, [[0, 10], [-22, 70]], 'rgba(230,230,210,.7)', 4, 2); traco(g, [[0, 10], [22, 70]], 'rgba(230,230,210,.7)', 4, 2); g.restore(); }; g.clearRect(0, 0, 256, 256); corpo(96, .2); if (dois) corpo(160, -.3); });
    const mat = new THREE.MeshBasicMaterial({ map: faz(false), transparent: true, opacity: 0, depthWrite: false }); const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); m.rotation.x = -PI / 2; m.position.set(p.x, .03, p.z); m.userData.l4 = true; W.grupo.add(m);
    let vendoAnt = false, pend = false, dois = false; G.ticks.push((dt, ativo) => { const v = naLuz(m.position, 7, .9); mat.opacity = v * .6; const vendo = v > .3; if (vendoAnt && !vendo) pend = true; if (!vendoAnt && vendo && pend && !dois) { dois = true; mat.map = faz(true); } vendoAnt = vendo; if (dois && vendo && ativo && !fl().l4v_contP) { fl().l4v_contP = true; fala('Era um contorno de giz. Agora são dois. Lado a lado.'); segredo('contornoPatio'); } });
  }

  // B17. Mãozinha no vidro de um dormitório, no relâmpago
  function maoVidroDorm() {
    if (mapaId() !== 'superior') return; const js = janelasDe(r => r.id === 'dormD'); if (!js.length) return; const j = js[0];
    const t = tex(128, 160, (g) => { g.clearRect(0, 0, 128, 160); g.fillStyle = 'rgba(210,210,220,.5)'; g.beginPath(); g.ellipse(64, 90, 18, 24, 0, 0, 7); g.fill(); for (let f = 0; f < 5; f++) { g.beginPath(); g.ellipse(40 + f * 12, 58, 5, 14, 0, 0, 7); g.fill(); } });
    const mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -5 });
    naParede(j.r, j.lado, j.c, 1.5, .5, .6, mat, .1185);
    G.ticks.push((dt, ativo) => { const k = naSala('dormD') ? clamp((C.raioI || 0) * 1.6, 0, 1) : 0; mat.opacity = k * .7; if (k > .5 && ativo && !fl().l4v_maoVidro) { fl().l4v_maoVidro = true; fala('Uma mão pequena no vidro. Pelo lado de fora. No segundo andar.'); segredo('maoVidro'); } });
  }

  // =================================================================== LANTERNA DO DAVI (recompensa: estrelinha de fita isolante no círculo de luz)
  const COOKIE_DAVI = tex(256, 256, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const gr = g.createRadialGradient(128, 128, 10, 128, 128, 126); gr.addColorStop(0, '#fff6dc'); gr.addColorStop(.75, '#e8d8a8'); gr.addColorStop(1, '#000'); g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill();
    g.fillStyle = 'rgba(0,0,0,.92)'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? 13 : 32; g.lineTo(128 + Math.cos(a) * rr, 128 + Math.sin(a) * rr); } g.closePath(); g.fill();
    for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(0,0,0,${rand(.05, .2)})`; g.beginPath(); g.arc(rand(20, 236), rand(20, 236), rand(.6, 2), 0, 7); g.fill(); }
  });
  function mapaLanterna() { return OPT.vDavi && DB.davi && !verm ? COOKIE_DAVI : null; }
  const optLabels = [];
  for (const sel of ['#title .vis-opts', '#pause .vis-opts']) {
    const box = $(sel); if (!box) continue;
    const l = document.createElement('label'); l.title = 'Recompensa por achar segredos da luz: a lanterna amarela do Davi, com uma estrelinha de fita isolante no meio'; l.innerHTML = '<input type="checkbox"> Lanterna do Davi';
    const cb = l.querySelector('input'); cb.addEventListener('change', () => { OPT.vDavi = cb.checked ? 1 : 0; try { X.salvar(); } catch (e) {} syncDavi(); });
    box.appendChild(l); optLabels.push({ l, cb });
  }
  function syncDavi() { for (const o of optLabels) { o.l.hidden = !DB.davi; o.cb.checked = !!OPT.vDavi; } }
  syncDavi();

  // =================================================================== LOOP
  function update(dt, ativo, S, t) {
    if (!S) return;
    camera.getWorldDirection(fw);
    if (montarPend && C.mode !== 'titulo') montar();
    tickLua(dt, ativo, S, t);
    tickFoto(dt);
    tickPegadas(dt);
    tickVenda(dt, ativo, S);
    tickCoelho(dt, ativo, S);
    if (!G) return;
    semChuva();
    for (const f of G.ticks) { try { f(dt, ativo, S, t); } catch (e) { if (!f._erro) { f._erro = true; console.warn('visual-segredos', e); } } }
  }
  const api = { update, mapa, morte, luz, mapaLanterna, vermelha: () => verm && !!(C.S && C.S.flashOn), teste: { DB, segredo, get G() { return G; }, montar, abrirVisor, fecharVisor, get verm() { return verm; }, set verm(v) { verm = v; } } };
  window.__segredos = api;
  return api;
}
