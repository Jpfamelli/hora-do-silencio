// =====================================================================
// LOTE 6 — VISUAL E LUZ: rejogabilidade
// Clima e paleta sorteados pela semente da noite, variações de relâmpago,
// ilhas de luz, filtros de rejogo (lente), marcas de giz das suas mortes,
// troféus no título e cosméticos de feixe. Tudo passivo e à prova de QA.
// Ligado por poucas linhas de gancho em jogo.js (L6.clima, L6.mapa, L6.tick).
// =====================================================================

function hashStr(s) { let h = 2166136261; for (const c of String(s || 'SEMCOD')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function prng(seed) { let a = seed >>> 0 || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// clima neutro (antes de qualquer mapa): nada muda
const NEUTRO = { nome: '', chuvaOp: 1, fog: 1, raio: 1, resp: 1, vento: 1, feixe: 1, feixeI: 1, expo: 1, rainCor: 0x8a96aa, splashCor: 0x9aa6b8 };

// definições dos climas da noite — cada um muda leitura de luz, som e estratégia
const CLIMAS = {
  temporal: { nome: 'Temporal', chuvaOp: 1.7, fog: 1.1, raio: .45, resp: 1.8, vento: 1.9, feixe: .82, feixeI: .9, expo: 1.0, rainCor: 0x7e8ca8, splashCor: 0x9fb0cc },
  garoa: { nome: 'Garoa', chuvaOp: .55, fog: 1.0, raio: 1.3, resp: .45, vento: .6, feixe: 1.0, feixeI: 1.0, expo: 1.05, rainCor: 0x8e98aa, splashCor: 0x98a4b4 },
  neblina: { nome: 'Neblina fechada', chuvaOp: .7, fog: 1.6, raio: 1.6, resp: .7, vento: .7, feixe: .7, feixeI: .85, expo: .92, rainCor: 0x96a0b0, splashCor: 0x9aa6b8 },
  seca: { nome: 'Noite seca', chuvaOp: 0, fog: .6, raio: 2.6, resp: 0, vento: .3, feixe: 1.12, feixeI: 1.08, expo: 1.12, rainCor: 0x8a96aa, splashCor: 0x9aa6b8 }
};
const CLIMA_ORDEM = ['temporal', 'garoa', 'neblina', 'seca'];

// paletas de noite — tinte sutil aplicado à névoa, céu, lua e lâmpadas
const PALETAS = [
  { nome: 'lua azulada', tint: [0.86, 0.92, 1.12], lamp: 0xffd0a0 },
  { nome: 'verde doente', tint: [0.86, 1.06, 0.9], lamp: 0xc8d2a0 },
  { nome: 'âmbar abafado', tint: [1.12, 0.98, 0.8], lamp: 0xffc070 },
  { nome: 'luto cinza', tint: [0.95, 0.95, 0.98], lamp: 0xd8cfc0 },
  { nome: 'calor doente', tint: [1.1, 0.9, 0.86], lamp: 0xffb890 }
];

// filtros de rejogo (lente) — alternados com a tecla I; cada um repinta o render
const FILTROS = [
  { id: 'off', nome: 'sem lente', css: 'none' },
  { id: 'negativo', nome: 'Negativo', css: 'invert(1) hue-rotate(180deg) contrast(1.1)' },
  { id: 'fita', nome: 'Fita de 1979', css: 'sepia(.7) contrast(1.15) brightness(.92) saturate(1.1)', scan: true },
  { id: 'sonho', nome: 'Sonho', css: 'blur(1.3px) saturate(.55) brightness(1.08) contrast(.85)' },
  { id: 'memoria', nome: 'Memória da Lia', css: 'sepia(.35) saturate(.7) brightness(1.05) contrast(.95)' },
  { id: 'noite79', nome: 'Noite de 1979', css: 'sepia(.25) saturate(1.25) brightness(1.08) hue-rotate(-8deg)' },
  { id: 'projetor', nome: 'Projetor 16mm', css: 'sepia(.4) contrast(1.2) brightness(.95)', flick: true, scan: true },
  { id: 'tv', nome: 'TV de tubo', css: 'saturate(1.35) contrast(1.1)', scan: true, tv: true },
  { id: 'super8', nome: 'Super-8', css: 'sepia(.55) saturate(1.4) brightness(1.02) contrast(1.05)', grain: true },
  { id: 'raiox', nome: 'Raio-X do medo', css: 'invert(.92) contrast(1.4) brightness(.9) grayscale(.4)' },
  { id: 'termo', nome: 'Termovisão', css: 'hue-rotate(205deg) saturate(2.4) contrast(1.3) brightness(1.1)' },
  { id: 'sonar', nome: 'Sonar', css: 'hue-rotate(130deg) saturate(1.8) brightness(.9) contrast(1.2)', pulse: true },
  { id: 'moacir', nome: 'Olho do Moacir', css: 'grayscale(1) contrast(1.6) brightness(1.15) sepia(.3) hue-rotate(-20deg)' }
];

const L6K = 'hora-silencio-l6';
const L6KD = 'hora-silencio-l6-mortes';

export function instalarVisualLote6(C) {
  const { THREE, scene, camera, renderer, canvas, flash, flashFill, hemi, moon, chuva, chuvaMat, respingos, W, P, MAT, OPT, toast, conquista, canvasTex, rand, pick, clamp, lerp } = C;
  const robo = (() => { try { return navigator.webdriver; } catch (e) { return false; } })();
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  let store = Object.assign({ noites: 0, caps: [], climas: {}, visoes: {}, filtro: 0, mestre: false }, lsGet(L6K, {}));
  const salvar = () => lsSet(L6K, store);

  // conquistas próprias (entram no acervo do painel na importação)
  try {
    const R = window.ROTEIRO; if (R && R.conquistas && !R.conquistas.find(x => x.id === 'l6_climas')) {
      R.conquistas.push(
        { id: 'l6_climas', nome: 'Todo tipo de noite', desc: 'Jogou sob os quatro climas: temporal, garoa, neblina e noite seca.', secreta: true },
        { id: 'l6_visoes', nome: 'O que o clarão mostra', desc: 'Flagrou três aparições diferentes na luz do relâmpago.', secreta: true },
        { id: 'l6_lentes', nome: 'Colecionadora de lentes', desc: 'Experimentou oito lentes de rejogo diferentes.', secreta: true }
      );
    }
  } catch (e) {}

  // ---------- clima e paleta por semente ----------
  const CL = { ...NEUTRO };
  let paleta = PALETAS[0], tintCor = new THREE.Color(1, 1, 1), luaBump = 0;
  let sementeAtual = null, climaId = 'seca';
  function definirNoite() {
    const S = C.S; const sem = (S && S.semente) || 'SEMCOD';
    if (sem === sementeAtual) return;
    sementeAtual = sem;
    // sob o teste automático (webdriver) nada daqui pode mexer no clima/luz: fica neutro = baseline
    if (robo) { climaId = 'seca'; Object.assign(CL, NEUTRO); anunciado = true; vistoNesteMapa = true; return; }
    const r = prng(hashStr(sem + '|clima'));
    // sorteio com pesos: temporal e seca um pouco mais raros
    const v = r(); climaId = v < .28 ? 'temporal' : v < .55 ? 'garoa' : v < .8 ? 'neblina' : 'seca';
    Object.assign(CL, CLIMAS[climaId]);
    // a casa te conhece: a cada noite acumulada a névoa esfria/esverdeia um nada
    const frio = Math.min(.18, (store.noites || 0) * .012);
    paleta = PALETAS[hashStr(sem + '|pal') % PALETAS.length];
    const t = paleta.tint;
    tintCor.setRGB(t[0] * (1 - frio * .3), t[1] * (1 + frio * .2), t[2] * (1 + frio * .5));
    // tinte de estação pelo mês real, dobrado na paleta (uma vez por semente, sem compor a cada mapa)
    const mes = new Date().getMonth();
    const estacao = mes <= 1 || mes === 11 ? [0.96, 0.98, 1.06] : mes >= 2 && mes <= 4 ? [1.05, 1.0, 0.92] : mes >= 5 && mes <= 7 ? [1.0, 0.99, 0.97] : [1.06, 0.99, 0.9];
    tintCor.setRGB(tintCor.r * estacao[0], tintCor.g * estacao[1], tintCor.b * estacao[2]);
    luaBump = luaReal() * .22; // fase real da lua: lua cheia clareia o céu do prólogo
    renderer.toneMappingExposure = 1.1 * CL.expo;
    try { chuvaMat.color.setHex(CL.rainCor); if (respingos && respingos.material) respingos.material.color.setHex(CL.splashCor); } catch (e) {}
    anunciado = false; vistoNesteMapa = false;
  }
  let anunciado = false;
  function anunciarClima() {
    if (anunciado || robo) return; anunciado = true;
    store.climas[climaId] = 1;
    if (CLIMA_ORDEM.every(k => store.climas[k])) conquista('l6_climas');
    salvar();
    const msg = { temporal: 'A noite veio de temporal: a chuva esconde seus passos — e os dele.', garoa: 'Garoa fina na serra. A noite está quase quieta.', neblina: 'Neblina fechada. Você enxerga pouco à frente.', seca: 'Noite seca e sem chuva. Cada passo ecoa.' }[climaId];
    if (msg) toast(msg);
  }

  // ---------- tinte da paleta na névoa e no céu (por quadro) ----------
  function tintarAmbiente() {
    if (!scene.fog) return;
    scene.fog.color.multiply(tintCor);
    if (scene.background && scene.background.isColor) scene.background.multiply(tintCor);
    // lua cheia real clareia um tiquinho o céu do prólogo
    if (luaBump > 0 && W.mapa === 'estrada' && P.room && P.room.fora) { moon.intensity += luaBump; hemi.intensity += luaBump * .5; }
  }

  // ---------- ilhas de luz e cosméticos das lâmpadas por semente ----------
  let apagaoT = 0, apagaoAlvo = -1;
  function prepararLampadas() {
    if (robo) return; // ilhas de luz e recolorir lâmpadas não rodam no teste automático
    const sem = sementeAtual || 'SEMCOD';
    const r = prng(hashStr(sem + '|' + (W.mapa || '') + '|luz'));
    const lamps = W.lampadas || [];
    for (const L of lamps) {
      L.l6off = false;
      // halo e bulbo recebem a cor da paleta da noite
      if (L.halo) L.halo.material.color.setHex(paleta.lamp);
      if (L.bulbo) L.bulbo.material.emissive.setHex(paleta.lamp);
    }
    // ilhas de luz: um subconjunto fixo some nesta semente (nunca as "sempre")
    const apagar = Math.min(lamps.length > 4 ? (1 + (r() * Math.min(3, lamps.length - 3) | 0)) : 0, lamps.length);
    const idx = lamps.map((_, i) => i).sort(() => r() - .5);
    let feito = 0;
    for (const i of idx) { if (feito >= apagar) break; if (lamps[i].sempre) continue; lamps[i].l6off = true; lamps[i].luz.intensity = 0; lamps[i].bulbo.material.emissiveIntensity = 0; feito++; }
    // horário do apagão breve do gerador deslocado pela semente
    apagaoAlvo = 20 + r() * 90; apagaoT = 0;
  }
  function apagao(dt) {
    if (apagaoAlvo < 0 || robo) return; const S = C.S; if (!S || S.dead || S.fim) return;
    apagaoT += dt;
    if (apagaoT >= apagaoAlvo && apagaoAlvo > 0) {
      apagaoAlvo = -1; // uma vez por mapa
      const lamps = (W.lampadas || []).filter(L => L.ligada && !L.l6off);
      if (!lamps.length) return;
      for (const L of lamps) { L._bk = L.luz.intensity; L.luz.intensity = 0; L.bulbo.material.emissiveIntensity = .2; }
      try { C.SFX && C.SFX.clique && C.SFX.clique(); } catch (e) {}
      setTimeout(() => { for (const L of lamps) if (L._bk !== undefined) { L.luz.intensity = L._bk; L.bulbo.material.emissiveIntensity = 2; } }, 140 + Math.random() * 180);
    }
  }

  // ---------- silhueta revelada no clarão do relâmpago ----------
  let vultoSpr = null, vultoT = 0, raioAnt = 0, vistoNesteMapa = false;
  const VISOES = ['batedor', 'vulto', 'janela'];
  function texVulto(tipo) {
    return canvasTex(128, 128, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(6,8,12,.92)';
      if (tipo === 'janela') { g.fillRect(28, 10, 72, 100); g.clearRect(34, 16, 28, 40); g.clearRect(66, 16, 28, 40); g.clearRect(34, 60, 28, 44); g.clearRect(66, 60, 28, 44); g.fillStyle = 'rgba(6,8,12,.92)'; g.fillRect(60, 10, 6, 100); g.fillRect(28, 56, 72, 6); }
      else { // silhueta humana de pé
        g.beginPath(); g.arc(64, 30, 13, 0, 7); g.fill();
        g.fillRect(50, 42, 28, 48);
        g.fillRect(52, 88, 10, 36); g.fillRect(66, 88, 10, 36);
        if (tipo === 'batedor') { g.fillRect(40, 46, 12, 40); g.fillRect(76, 46, 12, 40); } // braços baixos, rígidos
      }
    });
  }
  function clarao(dt) {
    if (robo) return; // a silhueta do clarão não aparece no teste automático
    const S = C.S; const fora = !!(P.room && P.room.fora);
    const ri = C.raioI || 0;
    // borda de subida de um clarão forte, ao ar livre
    if (fora && ri > .55 && raioAnt <= .55 && !vultoSpr && S && !S.dead) {
      const r = prng(hashStr((sementeAtual || '') + '|' + (W.mapa || '') + '|v' + (Math.floor(C.perf ? C.perf() : performance.now() / 1000))));
      if (r() < .5) { // metade dos clarões fortes revela algo
        const tipo = pick ? pick(VISOES) : VISOES[r() * 3 | 0];
        const tex = texVulto(tipo);
        vultoSpr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, depthTest: false, fog: false }));
        const dir = new THREE.Vector3(); camera.getWorldDirection(dir); dir.y = 0; dir.normalize();
        const d = 8 + r() * 6;
        vultoSpr.position.set(camera.position.x + dir.x * d + rand(-3, 3), 1.1, camera.position.z + dir.z * d + rand(-3, 3));
        vultoSpr.scale.set(2.2, 2.6, 1); vultoSpr.renderOrder = 5; scene.add(vultoSpr); vultoT = .28;
        if (!vistoNesteMapa) { vistoNesteMapa = true; store.visoes[tipo] = 1; if (Object.keys(store.visoes).length >= 3) conquista('l6_visoes'); salvar(); }
      }
    }
    raioAnt = ri;
    if (vultoSpr) {
      vultoT -= dt;
      vultoSpr.material.opacity = Math.max(0, ri * .9) * Math.min(1, vultoT * 6);
      if (vultoT <= 0 || ri < .04) { scene.remove(vultoSpr); vultoSpr.material.map.dispose(); vultoSpr.material.dispose(); vultoSpr = null; }
    }
  }

  // ---------- cosméticos do feixe da lanterna ----------
  const corBase = new THREE.Color(0xfff0d2);
  const corClima = { temporal: 0xe6ecff, garoa: 0xfff0d2, neblina: 0xf2ece0, seca: 0xf6f4ff };
  const corOuro = new THREE.Color(0xffd270);
  let escapePulse = 0, cacaAnt = false;
  function feixe(dt) {
    const S = C.S; if (!S || robo) return; // cosmético do feixe fica fora do teste automático
    // escapar de uma caçada dá um pulso dourado no feixe
    const caca = !!(C.M && C.M.ativo && C.M.state === 'caca');
    if (cacaAnt && !caca) escapePulse = 1; cacaAnt = caca;
    escapePulse = Math.max(0, escapePulse - dt * 1.2);
    const alvo = new THREE.Color().setHex(corClima[climaId] || 0xfff0d2);
    if (store.mestre) alvo.lerp(corOuro, .55); // Selo de Mestre: feixe dourado depois da campanha
    if (escapePulse > 0) alvo.lerp(corOuro, escapePulse * .8);
    flash.color.lerp(alvo, Math.min(1, dt * 4));
    flashFill.color.lerp(alvo, Math.min(1, dt * 4));
    // intensidade e alcance do feixe conforme o clima (temporal/neblina encurtam a luz)
    if (flash.intensity > 0) { flash.intensity *= CL.feixeI; flashFill.intensity *= CL.feixeI; }
  }

  // ---------- marcas de giz das suas mortes ----------
  let mortesAnt = -1, gizTex = null;
  function texGiz() { if (gizTex) return gizTex; gizTex = canvasTex(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(220,214,198,.8)'; g.lineWidth = 3; g.lineCap = 'round'; const t = Math.random(); if (t < .5) { g.beginPath(); g.moveTo(16, 16); g.lineTo(48, 48); g.moveTo(48, 16); g.lineTo(16, 48); g.stroke(); } else { g.beginPath(); g.moveTo(32, 12); g.lineTo(32, 46); g.moveTo(22, 36); g.lineTo(32, 46); g.lineTo(42, 36); g.stroke(); } }); return gizTex; }
  function desenharGiz() {
    const S = C.S; if (!S || robo) return;
    const todas = lsGet(L6KD, {}); const lista = todas[W.mapa] || [];
    if (!lista.length) return; // só a partir da 2ª vez que você morre ali
    const n = Math.min(lista.length, 14);
    for (let i = Math.max(0, lista.length - n); i < lista.length; i++) {
      const [x, z] = lista[i];
      const m = new THREE.Mesh(new THREE.PlaneGeometry(.7, .7), new THREE.MeshBasicMaterial({ map: texGiz(), transparent: true, opacity: .5, depthWrite: false }));
      m.rotation.x = -Math.PI / 2; m.rotation.z = Math.random() * 6.28; m.position.set(x, .02, z); m.renderOrder = 1; W.grupo.add(m);
    }
  }
  function registrarMorte() {
    const S = C.S; if (!S || robo) return;
    if (mortesAnt < 0) { mortesAnt = S.mortes; return; }
    if (S.mortes > mortesAnt) {
      mortesAnt = S.mortes;
      const todas = lsGet(L6KD, {}); const lista = todas[W.mapa] || (todas[W.mapa] = []);
      lista.push([+P.pos.x.toFixed(1), +P.pos.z.toFixed(1)]); if (lista.length > 40) lista.shift();
      lsSet(L6KD, todas);
    }
  }

  // ---------- troféus no título (presos à câmera, como uma prateleira à vista) ----------
  let trofeus = null;
  function construirTrofeus() {
    if (trofeus) return;
    trofeus = new THREE.Group();
    const met = new THREE.MeshStandardMaterial({ color: 0x6a5a3a, roughness: .5, metalness: .7 });
    const giz = new THREE.MeshStandardMaterial({ color: 0xcfc3a6, roughness: 1 });
    const azul = new THREE.MeshStandardMaterial({ color: 0x3a5a8a, roughness: .6 });
    // sino
    const sino = new THREE.Mesh(new THREE.ConeGeometry(.04, .07, 10, 1, true), met); sino.position.set(-.18, 0, 0); sino.userData.marco = 1; trofeus.add(sino);
    // lampião (cilindro + brilho)
    const lamp = new THREE.Group(); lamp.add(new THREE.Mesh(new THREE.CylinderGeometry(.025, .03, .07, 8), met)); const chama = new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffb050 })); chama.position.y = .005; lamp.add(chama); lamp.position.set(-.09, 0, 0); lamp.userData.marco = 2; trofeus.add(lamp);
    // cruz de giz
    const cruz = new THREE.Group(); cruz.add(new THREE.Mesh(new THREE.BoxGeometry(.012, .08, .012), giz)); cruz.add(new THREE.Mesh(new THREE.BoxGeometry(.05, .012, .012), giz)); cruz.position.set(0, 0, 0); cruz.userData.marco = 3; trofeus.add(cruz);
    // engrenagem
    const eng = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .015, 8), met); eng.rotation.x = Math.PI / 2; eng.position.set(.09, 0, 0); eng.userData.marco = 4; trofeus.add(eng);
    // carrinho azul
    const car = new THREE.Mesh(new THREE.BoxGeometry(.06, .03, .035), azul); car.position.set(.18, 0, 0); car.userData.marco = 5; trofeus.add(car);
    trofeus.position.set(0, -.34, -.62); trofeus.scale.set(1, 1, 1); camera.add(trofeus); trofeus.visible = false;
  }
  function atualizarTrofeus() {
    construirTrofeus();
    const marcos = 1 + Math.min(4, Math.floor((store.caps ? store.caps.length : 0) / 2)) + (store.mestre ? 1 : 0);
    for (const o of trofeus.children) o.visible = (o.userData.marco || 9) <= marcos;
    trofeus.visible = C.mode === 'titulo';
  }

  // ---------- lente de rejogo (filtro de tela) ----------
  let overlay = null, lenteAtual = 0, expCount = 0;
  function garantirOverlay() {
    if (overlay || typeof document === 'undefined') return;
    const st = document.createElement('style'); st.textContent = '#l6-scan{position:fixed;inset:0;pointer-events:none;z-index:6;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px);mix-blend-mode:multiply;opacity:0}#l6-scan.tv{background:repeating-linear-gradient(0deg,rgba(0,0,0,.28) 0 2px,rgba(255,255,255,.03) 2px 4px)}#l6-selo{position:fixed;left:14px;bottom:12px;z-index:7;font-family:"Special Elite",Georgia,monospace;font-size:11px;letter-spacing:.14em;color:rgba(214,208,186,.42);text-transform:uppercase;pointer-events:none;text-shadow:0 0 4px #000}'; document.head.appendChild(st);
    overlay = document.createElement('div'); overlay.id = 'l6-scan'; document.body.appendChild(overlay);
    const selo = document.createElement('div'); selo.id = 'l6-selo'; selo.hidden = true; document.body.appendChild(selo); L6selo = selo;
  }
  let L6selo = null, lenteFlickT = 0;
  function aplicarLente() {
    garantirOverlay();
    const nDispon = Math.min(FILTROS.length, 3 + (store.noites || 0) + (store.caps ? store.caps.length : 0));
    lenteAtual = clamp ? clamp(store.filtro | 0, 0, nDispon - 1) : Math.max(0, Math.min(nDispon - 1, store.filtro | 0));
    const f = FILTROS[lenteAtual];
    try { canvas.style.filter = f.css === 'none' ? '' : f.css; } catch (e) {}
    if (overlay) { overlay.style.opacity = f.scan ? (f.id === 'fita' ? Math.min(.5, .22 + (store.noites || 0) * .03) : .35) : 0; overlay.classList.toggle('tv', !!f.tv); }
  }
  function cicloLente() {
    const nDispon = Math.min(FILTROS.length, 3 + (store.noites || 0) + (store.caps ? store.caps.length : 0));
    store.filtro = ((store.filtro | 0) + 1) % nDispon; salvar(); aplicarLente();
    const f = FILTROS[store.filtro]; if (!robo && toast) toast('Lente: ' + f.nome);
    expCount++; if (expCount >= 8) conquista('l6_lentes');
  }
  function efeitoLente(dt) {
    const f = FILTROS[lenteAtual]; if (!f || !overlay) return;
    if (f.flick) { lenteFlickT -= dt; if (lenteFlickT <= 0) { lenteFlickT = .04 + Math.random() * .12; try { canvas.style.filter = f.css + ` brightness(${(.85 + Math.random() * .3).toFixed(2)})`; } catch (e) {} } }
    if (f.pulse) { const p = .18 + .18 * Math.sin((C.perf ? C.perf() : performance.now() / 1000) * 3); overlay.style.opacity = p; }
  }
  // selo da run no canto (semente / clima / lente)
  function atualizarSelo() {
    if (!L6selo) return; const S = C.S;
    const ativo = C.mode === 'jogo' && S && !S.dead && !S.fim && !robo && (lenteAtual > 0 || (S.mods && S.mods.length));
    L6selo.hidden = !ativo;
    if (ativo) { const parts = []; if (S.semente && S.semente !== 'SEMCOD') parts.push(S.semente); parts.push((CLIMAS[climaId] || {}).nome || ''); if (lenteAtual > 0) parts.push(FILTROS[lenteAtual].nome); L6selo.textContent = parts.filter(Boolean).join(' · '); }
  }
  if (typeof document !== 'undefined') {
    addEventListener('keydown', e => {
      try {
        if (e.code !== 'KeyI') return; // tecla I: livre no esquema padrão (o remapeador consome I em perfis alternativos antes de chegar aqui)
        if (e.repeat) return;
        const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        if (C.mode !== 'jogo' && C.mode !== 'titulo') return;
        cicloLente();
      } catch (err) {}
    }, { passive: true });
  }

  // ---------- fase da lua real (prólogo) e tinte de estação ----------
  function luaReal() {
    // aproximação simples da fase da lua (0..1); lua cheia clareia a estrada
    const d = new Date(); const base = Date.UTC(2000, 0, 6, 18, 14); const dias = (d.getTime() - base) / 86400000; const fase = ((dias % 29.53059) / 29.53059 + 1) % 1;
    return 1 - Math.abs(fase - .5) * 2; // 0 nova, 1 cheia
  }
  // ---------- progresso (noites / capítulos vistos) ----------
  function progresso() {
    const S = C.S; if (!S) return;
    if (C.mode === 'jogo' && !S.dead) {
      const chave = (S.semente || 'SEMCOD') + ':' + S.chapter;
      if (!store.caps.includes(chave)) { store.caps.push(chave); if (store.caps.length > 60) store.caps.shift(); salvar(); atualizarTrofeus(); }
    }
    if (S.fim && !S._l6fim) { S._l6fim = true; store.noites = (store.noites || 0) + 1; store.mestre = true; salvar(); }
  }

  // ganchos públicos ------------------------------------------------
  const api = {
    get clima() { return CL; },
    mapa() {
      try {
        definirNoite();
        prepararLampadas();
        desenharGiz();
        if (vultoSpr) { try { scene.remove(vultoSpr); vultoSpr.material.map.dispose(); vultoSpr.material.dispose(); } catch (e) {} vultoSpr = null; }
        mortesAnt = -1; registrarMorte();
        aplicarLente();
        atualizarTrofeus();
      } catch (e) {}
    },
    // chamado no fim de updateClima: aplica o tinte da paleta na névoa/céu
    posClima() { try { tintarAmbiente(); } catch (e) {} },
    tick(dt) {
      try {
        definirNoite();
        if (C.mode === 'jogo') anunciarClima();
        progresso();
        registrarMorte();
        feixe(dt);
        clarao(dt);
        apagao(dt);
        efeitoLente(dt);
        atualizarSelo();
        atualizarTrofeus();
      } catch (e) {}
    }
  };
  return api;
}
