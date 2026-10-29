// PRÓLOGO — Lote 3 (polimento e plataforma). Chamado por estrada() em mapas.js, depois de mundoEstrada().
// - Atalho do barranco: cerca caída no fundo do posto (só agachada), trilha de cascalho até o portão,
//   um vulto encolhido dormindo no meio dela (acorda com barulho e com a lanterna) e o selo secreto.
// - Abertura: painel, volante, velocímetro, limpador, chuva no vidro, derrapada, porta que abre e bate.
// - Sensação: vibração (controle/celular), animações de chave, cadeado, portão, orelhão, porta-malas, poças.
// - Acessibilidade: legendas dos sons novos, "reduzir flashes" e "menos movimento" respeitados na estrada,
//   dicas que falam o botão certo (teclado, controle ou toque) e botões de toque que pulsam na hora certa.
// - Desempenho: menos árvores nas qualidades Baixa/Média, interior do carro e efeitos só quando estão perto.

// ---------- utilidades exportadas (usadas também por src/estrada-extra.js e mapas.js)
export const semFlash = () => { try { return document.body.classList.contains('sem-flash'); } catch (e) { return false; } };
let optCache = null, optT = -1e9;
function opt() { const n = performance.now(); if (!optCache || n - optT > 2000) { optT = n; try { optCache = JSON.parse(localStorage.getItem('hora-silencio-opt') || '{}') || {}; } catch (e) { optCache = {}; } } return optCache; }
const pedeMenosMov = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
// quanto tremor de câmera a abertura pode usar (1 normal, menos com "movimento de câmera" reduzido ou o sistema pedindo)
export const movK = () => { const v = opt().vCam; let k = v === undefined || v >= 2 ? 1 : v >= 1 ? .5 : .2; if (pedeMenosMov) k = Math.min(k, .35); return k; };
const corpo = c => { try { return document.body.classList.contains(c); } catch (e) { return false; } };
export const noToque = () => corpo('toque');
export const noControle = () => corpo('pad');
const NOMES = { E: ['E', 'A', 'Usar'], C: ['C', 'B', 'Agachar'], F: ['F', 'X', 'Lanterna'], R: ['R', 'R', 'Pilha'], TAB: ['TAB', 'Y', 'Diário'] };
// nome do botão do jeito que a pessoa está jogando: tecla, botão do controle ou botão de toque
export function tecla(k) { const n = NOMES[k] || [k, k, k]; return noToque() ? `botão ${n[2]}` : noControle() ? `botão ${n[1]}` : n[0]; }
export function vibrar(forte, fraco, ms) {
  try {
    const O = window.__plat && window.__plat.O; if (O && O.vibrar === false) return;
    if (noControle() && navigator.getGamepads) for (const g of navigator.getGamepads()) if (g && g.vibrationActuator && g.vibrationActuator.playEffect) g.vibrationActuator.playEffect('dual-rumble', { duration: ms, strongMagnitude: forte, weakMagnitude: fraco }).catch(() => {});
    if (noToque() && navigator.vibrate) navigator.vibrate(ms);
  } catch (e) {}
}
const qual = () => { try { return (window.__plat && window.__plat.O && window.__plat.O.qual) || ''; } catch (e) { return ''; } };
export const POCAS = [[-1.4, 30], [2, 18], [-2.2, -9], [1.2, -20], [-.8, -33], [2.4, -44], [-1.8, -52]];

// ---------- texto novo (falas, conquista e legendas de som)
const FALAS = {
  est_barranco_cerca: [{ quem: 'lia', texto: 'A cerca caiu aqui. Dá pra passar por baixo do arame... agachada.' }],
  est_barranco_entra: [{ quem: 'lia', texto: 'Cascalho solto. Se eu andar em pé, vão me ouvir lá do portão.' }],
  est_barranco_semchave: [{ quem: 'lia', texto: '(sussurrando) O portão tá trancado de qualquer jeito. Primeiro a chave do Seu Joaquim.' }],
  est_barranco_vulto: [{ quem: 'lia', texto: '(sussurrando) Tem uma coisa encolhida ali no barranco. Respirando. Apaga a luz, Lia.' }],
  est_barranco_mexeu: [{ quem: 'lia', texto: '(sussurrando) Ele mexeu. Ele parou de respirar. Devagar...' }],
  est_barranco_acordou: [{ quem: 'lia', texto: 'Ele acordou. Não tira o olho dele.' }],
  est_barranco_pegou: [{ quem: 'lia', texto: 'Eu tô no posto de novo. O barranco me cuspiu de volta.' }],
  est_barranco_saiu: [{ quem: 'lia', texto: 'Saí do lado do portão. E ele nem veio pela estrada atrás de mim.' }],
  est_barranco_limpo: [{ quem: 'lia', texto: 'Passei do lado dele e ele nem acordou. O Seu Joaquim devia cortar caminho por aqui.' }],
  est_barranco_placa: [{ quem: 'lia', texto: '"Só de joelhos". O Seu Joaquim sabia que tinha alguma coisa dormindo aqui embaixo.' }]
};
const CONQ = { id: 'atalho_barranco', nome: 'Atalho do barranco', desc: 'Atravesse o barranco do posto até o portão, por baixo das cercas caídas.', secreta: true, dica: 'Num trecho, a cerca do posto caiu. Bem baixinho.' };
const LEG = {
  est_buzina: { t: 'a buzina do seu carro', imp: 1, cd: 2, cat: 'p', pos: a => a[0] },
  est_toque: { t: 'o orelhão toca', imp: 1, cd: 5, cat: 'h', pos: a => a[0] },
  est_raspar: { t: 'unhas raspando no teto do carro', imp: 1, cd: 3, cat: 'p', pos: a => a[0] },
  est_resp: { t: 'uma respiração pesada', imp: 1, cd: 4, cat: 'p', pos: a => a[0] },
  est_bip: { t: 'o fliperama apita', imp: 0, cd: 3, cat: 'h', pos: a => a[0] },
  est_voz: { t: 'uma voz baixa', imp: 0, cd: 4, cat: 'h', pos: a => a[0] },
  est_freada: { t: 'pneus cantando no asfalto', imp: 1, cd: 4 },
  est_motor: { t: 'o motor engasga e morre', imp: 1, cd: 6 },
  est_portaCarro: { t: 'a porta do carro bate', imp: 0, cd: 2 },
  est_metal: { t: 'o motor estala, esfriando', imp: 0, cd: 8, pos: a => a[0] },
  est_chaves: { t: 'chaves tilintando', imp: 0, cd: 2 },
  est_cadeado: { t: 'o cadeado cai no chão', imp: 1, cd: 3 },
  est_portao: { t: 'o portão range, abrindo', imp: 1, cd: 4 },
  est_cascalho: { t: 'o cascalho estala alto sob seus pés', imp: 1, cd: 3.5, cat: 'p' },
  est_pedras: { t: 'pedras rolando barranco abaixo', imp: 1, cd: 4, cat: 'p', pos: a => a[0] },
  est_arame: { t: 'arame farpado arranhando', imp: 0, cd: 3 },
  est_agua: { t: 'água espirrando', imp: 0, cd: 3 }
};
function mesclar(A) {
  const R = A.R; if (!R) return;
  if (R.falas) for (const k in FALAS) if (!R.falas[k]) R.falas[k] = FALAS[k];
  if (R.conquistas && !R.conquistas.some(x => x.id === CONQ.id)) R.conquistas.push(CONQ);
  try { const L = A.legendas; if (L) for (const k in LEG) if (!L[k]) L[k] = LEG[k]; } catch (e) {}
}

export function polirEstrada(A, S, c) {
  const { THREE, MAT, box, cyl, plano, interact } = A;
  mesclar(A);
  const U = c.ex.util, SX = U.SX, agenda = U.agenda, olhando = U.olhando, medo = U.medo;
  const grupo = A.W.grupo, P = A.P, cam = A.camera, GZ = c.GZ, carro = c.carro;
  const vivo = () => A.W.grupo === grupo && A.S === S;
  const jogando = () => vivo() && A.mode === 'jogo';
  const dist = (x, z) => Math.hypot(x - P.pos.x, z - P.pos.z);
  const lerp = (a, b, t) => a + (b - a) * t;
  const leg = (k, ...a) => { try { A.SFX[k](...a); } catch (e) {} }; // só a legenda: o motor não tem esse som, mostra o texto
  const luzAcesa = () => S.inv.lanterna && S.flashOn && S.battery > 0;
  const fala1 = (flag, k) => { if (S.flags[flag]) return false; S.flags[flag] = true; A.falar(k); return true; };
  const au = () => (A.audio && A.audio()) || null;

  // ---------- sons novos (procedurais)
  const SOM = {
    cascalho(vol = 1) { const a = au(); if (!a) return; const { AC, saida, burst, env } = a; const t = AC.currentTime; for (let i = 0; i < 3; i++) { const g = saida(null, .08), t0 = t + i * .035 + Math.random() * .02; burst(t0, .06, 'bandpass', 2400 + Math.random() * 1800, 2.5, g); env(g, t0, .002, (.12 + Math.random() * .1) * vol, .05); } const g2 = saida(null, .05); burst(t, .14, 'lowpass', 600, 1, g2); env(g2, t, .004, .12 * vol, .12); },
    pedras(pos) { const a = au(); if (!a) return; const { AC, saida, burst, env } = a; const t = AC.currentTime; for (let i = 0; i < 9; i++) { const g = saida(pos, .2), t0 = t + i * (.07 + Math.random() * .12); burst(t0, .05, 'bandpass', 1500 + Math.random() * 2500, 3, g); env(g, t0, .002, .12 * (1 - i / 11), .05); } },
    porta(pos) { const a = au(); if (!a) return; const { AC, saida, burst, env, osc } = a; const t = AC.currentTime; const g = saida(pos, .2); burst(t, .18, 'lowpass', 420, 1.2, g); env(g, t, .003, .5, .16); const g2 = saida(pos, .15); osc('triangle', 95, t, .2, g2); env(g2, t, .002, .25, .18); const g3 = saida(pos, .1); burst(t + .02, .05, 'highpass', 3000, 1, g3); env(g3, t + .02, .001, .1, .04); },
    chaves(pos) { const a = au(); if (!a) return; const { AC, saida, osc, env } = a; const t = AC.currentTime; for (let i = 0; i < 6; i++) { const g = saida(pos, .25), t0 = t + i * .06 + Math.random() * .03; osc('sine', 3200 + Math.random() * 2600, t0, .18, g); env(g, t0, .001, .05, .16); } },
    queda(pos) { const a = au(); if (!a) return; const { AC, saida, burst, env, osc } = a; const t = AC.currentTime + .35; const g = saida(pos, .2); burst(t, .08, 'bandpass', 1800, 6, g); env(g, t, .001, .35, .08); const g2 = saida(pos, .3); osc('square', 1240, t, .5, g2); env(g2, t, .001, .04, .45); const g3 = saida(pos, .2); burst(t + .18, .06, 'bandpass', 2200, 6, g3); env(g3, t + .18, .001, .15, .05); },
    arame(pos) { const a = au(); if (!a) return; const { AC, saida, burst } = a; const t = AC.currentTime, g = saida(pos, .15), f = burst(t, .5, 'bandpass', 3800, 9, g); f.frequency.linearRampToValueAtTime(5200, t + .5); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .05); g.gain.exponentialRampToValueAtTime(.0001, t + .5); }
  };
  // legendas para os sons da estrada que não passavam pelo motor (e vibração onde cabe)
  const embrulha = (k, fn) => { const o = SX[k]; if (typeof o !== 'function') return; SX[k] = (...a) => { try { fn(...a); } catch (e) {} return o(...a); }; };
  embrulha('buzina', pos => { leg('est_buzina', pos); vibrar(.8, .5, 380); });
  embrulha('toque', pos => { leg('est_toque', pos); tel.tremor = 1.2; if (dist(pos.x, pos.z) < 10) vibrar(.1, .35, 160); });
  embrulha('raspar', pos => { leg('est_raspar', pos); vibrar(.3, .6, 900); });
  embrulha('respiracao', pos => leg('est_resp', pos));
  embrulha('bip', pos => leg('est_bip', pos));
  embrulha('voz', pos => leg('est_voz', pos));

  // =================================================================== ABERTURA: o carro por dentro
  const painelMat = new THREE.MeshStandardMaterial({ color: 0x141210, roughness: .8 });
  const dash = box(1.56, .12, .32, painelMat, 0, .9, -.74, carro, false);
  const brilhoPainel = new THREE.MeshStandardMaterial({ color: 0x100800, emissive: 0xffa040, emissiveIntensity: .7 });
  const faixaPainel = box(.5, .015, .02, brilhoPainel, -.38, .965, -.6, carro, false);
  const volante = new THREE.Mesh(new THREE.TorusGeometry(.17, .018, 6, 20), painelMat); volante.position.set(-.38, 1.0, -.5); volante.rotation.x = -.35; carro.add(volante);
  box(.02, .3, .02, painelMat, -.38, 1.0, -.5, volante, false).rotation.z = 0;
  // velocímetro desenhado em canvas: o ponteiro desce até zero na freada
  const velCv = document.createElement('canvas'); velCv.width = 128; velCv.height = 72; const velG = velCv.getContext('2d');
  const velTex = new THREE.CanvasTexture(velCv); velTex.colorSpace = THREE.SRGBColorSpace;
  let velAnt = -1;
  function desenhaVel(kmh, aceso) {
    const v = Math.round(kmh); if (v === velAnt && aceso === desenhaVel.a) return; velAnt = v; desenhaVel.a = aceso;
    const g = velG; g.fillStyle = '#080604'; g.fillRect(0, 0, 128, 72);
    g.strokeStyle = aceso ? '#ffb060' : '#3a2a18'; g.lineWidth = 2; g.beginPath(); g.arc(64, 64, 52, Math.PI, 0); g.stroke();
    g.fillStyle = aceso ? '#ffc880' : '#4a3a28'; g.font = '10px monospace'; g.textAlign = 'center';
    for (let i = 0; i <= 6; i++) { const a = Math.PI + i / 6 * Math.PI; g.fillText(String(i * 20), 64 + Math.cos(a) * 40, 66 + Math.sin(a) * 40); }
    const a = Math.PI + Math.min(120, kmh) / 120 * Math.PI; g.strokeStyle = aceso ? '#ff5030' : '#5a2a20'; g.lineWidth = 3; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.cos(a) * 46, 64 + Math.sin(a) * 46); g.stroke();
    g.fillText('km/h', 64, 58); velTex.needsUpdate = true;
  }
  desenhaVel(0, false);
  const velPlano = plano(.2, .11, new THREE.MeshBasicMaterial({ map: velTex }), -.38, .985, -.66, 0, carro); velPlano.rotation.x = -.5;
  // mostrador do rádio (FM), trocando a cada estação
  const fmCv = document.createElement('canvas'); fmCv.width = 128; fmCv.height = 40; const fmG = fmCv.getContext('2d');
  const fmTex = new THREE.CanvasTexture(fmCv); fmTex.colorSpace = THREE.SRGBColorSpace;
  const FREQ = ['FM 88,1', 'FM 91,3', 'AM 1190', 'FM 66,6', 'FM 97,9', 'FM 102,7', 'AM 630', 'FM 104,5', 'FM 107,9'];
  function desenhaFM(t, aceso = true) { fmG.fillStyle = '#060402'; fmG.fillRect(0, 0, 128, 40); fmG.fillStyle = aceso ? '#ffb050' : '#3a2a18'; fmG.font = 'bold 22px monospace'; fmG.textAlign = 'center'; fmG.fillText(t, 64, 28); fmTex.needsUpdate = true; }
  desenhaFM('--,-', false);
  const fm = plano(.2, .062, new THREE.MeshBasicMaterial({ map: fmTex }), -.08, 1.02, -.755, 0, carro);
  fm.userData.leitura = { t: 'Rádio do carro. Setas trocam a estação na abertura; de fora, pela janela.' };
  c.ex.aoSintonizar = n => { desenhaFM(FREQ[(n - 1) % FREQ.length]); };
  // limpador de para-brisa e gotas escorrendo no vidro
  const limpG = new THREE.Group(); limpG.position.set(-.55, 1.02, -.96); carro.add(limpG);
  box(.62, .014, .014, MAT.preto, .31, 0, 0, limpG, false);
  const limpG2 = new THREE.Group(); limpG2.position.set(.15, 1.02, -.96); carro.add(limpG2);
  box(.62, .014, .014, MAT.preto, .31, 0, 0, limpG2, false);
  const texGotas = A.canvasTex(128, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { const x = Math.random() * w, y = Math.random() * h, r = 1 + Math.random() * 2.6; g.fillStyle = 'rgba(200,215,230,.35)'; g.beginPath(); g.ellipse(x, y, r, r * 1.3, 0, 0, 6.3); g.fill(); if (Math.random() < .3) { g.fillStyle = 'rgba(200,215,230,.16)'; g.fillRect(x - .6, y - 18 - Math.random() * 20, 1.2, 18); } }
  });
  texGotas.repeat.set(2, 1);
  const gotas = plano(1.58, .48, new THREE.MeshBasicMaterial({ map: texGotas, transparent: true, depthWrite: false }), 0, 1.25, -.885, 0, carro);
  // luz de teto (cortesia): só emissiva, sem luz nova na cena
  const cortesiaMat = new THREE.MeshStandardMaterial({ color: 0x1a1810, emissive: 0xfff0c0, emissiveIntensity: 0 });
  box(.18, .02, .08, cortesiaMat, 0, 1.54, .1, carro, false);
  // porta do motorista: abre quando a Lia sai e bate atrás dela
  const portaG = new THREE.Group(); portaG.position.set(-.91, 0, -.6); carro.add(portaG);
  box(.05, .6, 1.15, MAT.carro, 0, .62, .58, portaG); box(.03, .4, .9, MAT.vidro, .0, 1.2, .55, portaG, false);
  const interior = [dash, faixaPainel, volante, velPlano, fm, limpG, limpG2, gotas];
  // teto amassado pela pancada e marcas de pneu da freada
  const texAmassado = A.canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 60); gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(.6, 'rgba(0,0,0,.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(210,200,190,.45)'; g.lineWidth = 1.5; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(40 + i * 12, 30); g.lineTo(46 + i * 12, 100); g.stroke(); } });
  const amassado = new THREE.Mesh(new THREE.PlaneGeometry(.9, .9), new THREE.MeshStandardMaterial({ map: texAmassado, transparent: true, depthWrite: false, roughness: .4 })); amassado.rotation.x = -Math.PI / 2; amassado.position.set(.1, 1.556, .4); carro.add(amassado); amassado.visible = !!S.flags.maos;
  const texPneu = A.canvasTex(32, 256, (g, w, h) => { g.clearRect(0, 0, w, h); for (let y = 0; y < h; y++) { g.fillStyle = `rgba(8,8,8,${.55 * (y / h) * (.7 + Math.random() * .3)})`; g.fillRect(4 + Math.random() * 2, y, w - 9, 1); } });
  for (const x of [-.9, .9]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(.22, 7), new THREE.MeshStandardMaterial({ map: texPneu, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 })); m.rotation.x = -Math.PI / 2; m.position.set(1.6 + x * .98, .011, 9.6 + 1.4 - 3.5 - 2.2); m.rotation.z = .03 * x; grupo.add(m); }
  // fumaça saindo do capô nos primeiros minutos
  const NF = 22, fPos = new Float32Array(NF * 3), fumo = [];
  for (let i = 0; i < NF; i++) fumo.push({ t: Math.random() * 3 });
  const fGeo = new THREE.BufferGeometry(); fGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
  const fumaca = new THREE.Points(fGeo, new THREE.PointsMaterial({ color: 0x8a8a88, size: .18, transparent: true, opacity: .22, depthWrite: false })); fumaca.frustumCulled = false; grupo.add(fumaca); fumaca.visible = false;

  const cs = { door: 0, doorAlvo: 0, fechaT: 0, cortesia: 0, fim: -1, pneu: false, motor: false, raspou: false, tiqueT: 3, vel: 0, saiu: !!S.flags.saiuCarro };
  const cena = c.ex.cena, cIni = cena.iniciar, cUp = cena.update, cFim = cena.fim;
  cena.iniciar = () => { cIni(); Object.assign(cs, { door: 0, doorAlvo: 0, fechaT: 0, cortesia: 0, pneu: false, motor: false, raspou: false }); portaG.rotation.y = 0; amassado.visible = false; brilhoPainel.emissiveIntensity = .7; carro.rotation.y = 0; desenhaFM('FM 88,1'); };
  cena.update = (t, dt) => {
    cUp(t, dt);
    const TF = 16.5;
    // ponteiro: 60 km/h, freia até zero
    const kmh = t < TF ? 58 + Math.sin(t * 1.7) * 2 : Math.max(0, 58 * (1 - (t - TF) / 1.9));
    desenhaVel(kmh, t < 19.6);
    // limpador indo e voltando até o motor morrer
    const lk = t < 18.6 ? (Math.sin(t * 3.1) * .5 + .5) : Math.max(0, limpG.rotation.z / 1.2 - dt * 2);
    limpG.rotation.z = lk * 1.2; limpG2.rotation.z = lk * 1.2;
    texGotas.offset.y = (texGotas.offset.y + dt * .35) % 1;
    // derrapada leve na freada
    carro.rotation.y = t > TF && t < TF + 2.2 ? Math.sin((t - TF) * 4) * .05 * Math.exp(-(t - TF) * 1.6) * movK() : 0;
    if (t > TF && !cs.pneu) { cs.pneu = true; leg('est_freada'); vibrar(.6, .8, 600); }
    if (t > 18.6 && !cs.motor) { cs.motor = true; leg('est_motor'); vibrar(.4, .2, 300); }
    // painel pisca e apaga com o motor
    brilhoPainel.emissiveIntensity = t < 18.6 ? .7 : t < 19.6 ? (semFlash() ? .7 * (19.6 - t) : Math.random() < .5 ? .7 : 0) : 0;
    if (t > 24) amassado.visible = true;
  };
  cena.fim = () => {
    cFim(); carro.rotation.y = 0; amassado.visible = true; brilhoPainel.emissiveIntensity = 0; desenhaVel(0, false); desenhaFM('--,-', false);
    limpG.rotation.z = limpG2.rotation.z = 0;
    // a Lia sai pela porta do motorista: abre, a luz de cortesia acende, a porta bate atrás dela
    cs.doorAlvo = 1; cs.fechaT = 1.4; cs.cortesia = 1; cs.fim = A.perf(); cs.saiu = true; cs.tiqueT = 4;
    fumaca.visible = qual() !== 'baixa';
  };
  function tickCarro(dt) {
    if (cs.fechaT > 0) { cs.fechaT -= dt; if (cs.fechaT <= 0) cs.doorAlvo = 0; }
    const antes = cs.door; cs.door = lerp(cs.door, cs.doorAlvo, Math.min(1, dt * (cs.doorAlvo ? 7 : 12)));
    if (antes > .15 && cs.door <= .15 && cs.doorAlvo === 0) { const p = { x: carro.position.x - .9, y: .8, z: carro.position.z }; SOM.porta(p); leg('est_portaCarro'); vibrar(.25, .1, 90); carro.position.y = .015; }
    if (cs.door < .002 && cs.doorAlvo === 0) cs.door = 0;
    portaG.rotation.y = -1.05 * cs.door;
    carro.position.y = Math.max(0, carro.position.y - dt * .2);
    cs.cortesia = Math.max(0, cs.cortesia - dt * (cs.door > .2 ? 0 : .14)); cortesiaMat.emissiveIntensity = cs.cortesia * 1.6;
    // o metal do motor estala esfriando nos primeiros minutos
    const desde = cs.fim < 0 ? 0 : A.perf() - cs.fim;
    if (cs.fim >= 0 && desde < 150) {
      cs.tiqueT -= dt;
      if (cs.tiqueT <= 0) { cs.tiqueT = 1.6 + Math.random() * 3.5 + desde / 40; const p = { x: carro.position.x, y: .8, z: carro.position.z - 1.6 }; if (dist(p.x, p.z) < 8) { SX.tique(p, Math.random() < .4); leg('est_metal', p); } }
    }
    // fumaça do capô (some depois de dois minutos; desligada na qualidade Baixa)
    if (fumaca.visible) {
      const k = Math.max(0, 1 - desde / 130);
      if (k <= 0 || dist(carro.position.x, carro.position.z) > 30) { if (k <= 0) fumaca.visible = false; }
      else {
        fumo.forEach((f, i) => { f.t += dt; if (f.t > 3) f.t = 0; const u = f.t / 3; fPos[i * 3] = carro.position.x + Math.sin(i * 7.1 + f.t) * .25 * u; fPos[i * 3 + 1] = .95 + u * 1.6; fPos[i * 3 + 2] = carro.position.z - 1.7 + Math.cos(i * 3.3) * .3 + u * .5; });
        fGeo.attributes.position.needsUpdate = true; fumaca.material.opacity = .22 * k;
      }
    }
    // longe do carro, o interior nem é desenhado
    const perto = dist(carro.position.x, carro.position.z) < 22;
    if (interior[0].visible !== perto) interior.forEach(o => { o.visible = perto; });
    if (perto) texGotas.offset.y = (texGotas.offset.y + dt * .12) % 1;
  }

  // =================================================================== ESTRADA E POSTO: retorno das ações
  const pr = { lanterna: !!S.inv.lanterna, chave: !!S.inv.chaves.portao, portao: !!S.done.abrir_portao, pegou: S.flags.vultoPegou || 0, balanco: 0, tremorGate: 0 };
  const tel = { tremor: 0 };
  // a lanterna liga piscando antes de firmar; o carro balança quando o porta-malas abre
  function aoPegarLanterna() {
    pr.balanco = 1;
    const seq = [[.0, false], [.12, true], [.22, false], [.4, true], [.48, false], [.62, true]];
    if (!semFlash()) for (const [t, on] of seq) agenda(t + .05, () => { if (S.inv.lanterna) S.flashOn = on; });
    agenda(1.2, () => { if (!S.flags.dicaLanternaTq && (noToque() || noControle())) { S.flags.dicaLanternaTq = true; A.toast(`Lanterna no ${tecla('F')}. Pilha reserva no ${tecla('R')}.`); } });
  }
  // a chave balança no prego quando você chega perto; ao pegar, tilinta
  const chave = c.chave;
  const chaveRot = chave ? chave.rotation.x : 0;
  function tickChave(dt) {
    if (!chave || !chave.visible || S.inv.chaves.portao) return;
    const d = dist(12.14, -19.4);
    if (d < 3.2) chave.rotation.x = chaveRot + Math.sin(A.perf() * 3.4) * .18 * (1 - d / 3.2);
  }
  // cadeado: cada puxão sacode corrente e portão; quando abre, o cadeado cai no chão
  const cad = c.cadeado, gate = c.gate;
  const cadQueda = { on: false, t: 0, vy: 0 };
  if (cad && S.done.abrir_portao) { cad.position.set(.35, .04, GZ + .5); cad.rotation.set(Math.PI / 2, 0, .6); }
  function tickCadeado(dt) {
    const hold = document.getElementById('hold');
    const segurando = hold && !hold.hidden && S.inv.chaves.portao && !S.done.abrir_portao && dist(0, GZ) < 3.2;
    if (segurando && gate && !gate.aberto) {
      pr.tremorGate += dt;
      const k = Math.sin(pr.tremorGate * 38) * .012;
      gate.L.rotation.y = k; gate.R.rotation.y = -k;
      if (cad) cad.rotation.z = Math.sin(pr.tremorGate * 30) * .25;
      if ((pr.tremorGate % .6) < dt) vibrar(.15, .3, 70);
    } else if (pr.tremorGate && gate && !gate.aberto) { pr.tremorGate = 0; gate.L.rotation.y = 0; gate.R.rotation.y = 0; if (cad) cad.rotation.z = 0; }
    if (cadQueda.on && cad) {
      cadQueda.vy -= 9.8 * dt; cad.position.y = Math.max(.04, cad.position.y + cadQueda.vy * dt); cad.rotation.x = Math.min(Math.PI / 2, cad.rotation.x + dt * 6); cad.position.z = Math.min(GZ + .5, cad.position.z + dt * .8);
      if (cad.position.y <= .04) cadQueda.on = false;
    }
  }
  function aoAbrirPortao() {
    if (cad) { cadQueda.on = true; cadQueda.vy = .6; }
    SOM.queda({ x: 0, y: .5, z: GZ + .4 }); leg('est_cadeado');
    agenda(.5, () => { A.SFX.rangido(0, 1.4, GZ, 1.2); leg('est_portao'); vibrar(.35, .5, 700); });
  }
  // orelhão: a concha treme a cada toque
  const orelhao = c.orelhao;
  function tickOrelhao(dt) {
    if (tel.tremor <= 0) { if (orelhao.rotation.z) orelhao.rotation.z = 0; return; }
    tel.tremor = Math.max(0, tel.tremor - dt); orelhao.rotation.z = Math.sin(A.perf() * 60) * .012 * Math.min(1, tel.tremor * 2);
  }
  // poças: pisar espirra água e abre um anel
  const aneis = [];
  const anelMat = new THREE.MeshBasicMaterial({ color: 0xbfd0c8, transparent: true, opacity: 0, depthWrite: false });
  for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.RingGeometry(.12, .16, 18), anelMat.clone()); m.rotation.x = -Math.PI / 2; m.visible = false; grupo.add(m); aneis.push({ m, t: 9 }); }
  let pocaT = 0, pocaUlt = -1, ultX = P.pos.x, ultZ = P.pos.z;
  function tickPocas(dt, movendo) {
    pocaT -= dt;
    for (const a of aneis) { if (a.t > 1.2) { a.m.visible = false; continue; } a.t += dt; const s = 1 + a.t * 7; a.m.scale.set(s, s, 1); a.m.material.opacity = .45 * (1 - a.t / 1.2); }
    if (!movendo || pocaT > 0 || !P.room || P.room.id !== 'estrada') return;
    for (let i = 0; i < POCAS.length; i++) {
      const [x, z] = POCAS[i];
      if (dist(x, z) < .75) {
        if (i === pocaUlt && pocaT > -.6) return;
        pocaT = P.sprinting ? .3 : .5; pocaUlt = i;
        A.SFX.passo(P.sprinting ? 1 : P.crouch ? .25 : .55, 'asfalto', true, true); leg('est_agua');
        const a = aneis.reduce((m, x) => x.t > m.t ? x : m, aneis[0]); a.t = 0; a.m.visible = true; a.m.position.set(P.pos.x, .02, P.pos.z);
        return;
      }
    }
  }
  // leitura de perto (sem tela cheia) das placas e preços
  grupo.traverse(o => {
    if (!o.isMesh || o.userData.leitura || !o.material || !o.material.map) return;
    const p = o.position;
    if (Math.abs(p.x - 9.34) < .05 && Math.abs(p.z + 19) < .05) o.userData.leitura = { t: 'Bomba: GASOLINA · Cr$ 6,30' };
    else if (Math.abs(p.x - 9.34) < .05 && Math.abs(p.z + 15) < .05) o.userData.leitura = { t: 'Bomba: ÁLCOOL · Cr$ 4,90' };
    else if (Math.abs(p.x - 19.86) < .05 && Math.abs(p.z + 14.2) < .05) o.userData.leitura = { t: 'Calendário: MARÇO de 1979. O dia 17 está circulado de vermelho.' };
  });

  // =================================================================== TOQUE: botões que pulsam na hora certa
  if (!document.getElementById('css-estrada-pol')) {
    const st = document.createElement('style'); st.id = 'css-estrada-pol';
    st.textContent = '@keyframes tqPulsa{0%,100%{box-shadow:0 0 0 0 rgba(233,223,200,.0)}50%{box-shadow:0 0 0 7px rgba(233,223,200,.35)}}#toque button.tq-pulsa{animation:tqPulsa 1.1s ease-in-out infinite;border-color:#e9dfc8!important}body.sem-flash #toque button.tq-pulsa{animation-duration:2.4s}';
    document.head.appendChild(st);
  }
  const pulsa = (id, on) => { const b = document.getElementById(id); if (b && b.classList.contains('tq-pulsa') !== on) b.classList.toggle('tq-pulsa', on); };
  function tickToque() {
    if (!noToque()) return;
    const perto = (x, z, r) => dist(x, z) < r;
    const usar = (!S.inv.lanterna && perto(carro.position.x, carro.position.z + 2.1, 2.6)) ||
      (!!document.querySelector('#prompt b') && /Atender|cadeado/.test(document.getElementById('prompt').textContent));
    pulsa('tq-usar', !!usar);
    pulsa('tq-agachar', !P.crouch && (cercas.some(f => dist(f.cx, f.cz) < 1.8) || (bar.dentro && bv.sono > .4 && !bv.acordado)));
    pulsa('tq-lanterna', luzAcesa() && bar.dentro && !bv.acordado && dist(bv.x, bv.z) < 16);
  }
  function limparToque() { for (const id of ['tq-usar', 'tq-agachar', 'tq-lanterna']) pulsa(id, false); }

  // =================================================================== ATALHO DO BARRANCO
  const X0 = 7.2, X1 = 12.6, Z0 = GZ + .4, Z1 = -26;
  // chão de cascalho
  const texCasc = A.canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#3e3a34'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) { const r = 1 + Math.random() * 4, v = 60 + Math.random() * 70 | 0; g.fillStyle = `rgb(${v},${v - 4},${v - 10})`; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, r, r * (.6 + Math.random() * .5), Math.random() * 3, 0, 6.3); g.fill(); }
    for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  });
  texCasc.repeat.set(2, 13);
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshStandardMaterial({ map: texCasc, roughness: 1 }));
  chao.rotation.x = -Math.PI / 2; chao.position.set((X0 + X1) / 2, .006, (Z0 + Z1) / 2); chao.receiveShadow = true; grupo.add(chao);
  // barranco subindo do lado de fora (o paredão de terra que dá nome à trilha)
  const terraMat = A.texMat('terra', 10, 1.2, { color: 0x6a5a48 });
  const paredao = box(.6, 2.6, Z1 - Z0, terraMat, X1 + .3, 1, (Z0 + Z1) / 2, grupo, false); paredao.rotation.z = -.35;
  // pedras grandes no caminho (com colisão) e a Kombi tombada, que agora tem corpo
  const pedraMat = A.texMat('pedra', 1, 1, { color: 0x8a8478 });
  for (const [x, z, s] of [[11.6, -30.5, .7], [7.9, -41.5, .55], [11.9, -47.5, .8], [8.3, -53, .5], [11.2, -56.5, .6]]) {
    const p = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), pedraMat); p.position.set(x, s * .55, z); p.rotation.set(x, z, 0); p.castShadow = true; grupo.add(p);
    A.addCollider(x - s * .8, x + s * .8, z - s * .8, z + s * .8);
  }
  A.addCollider(8.65, 10.55, -37.2, -32.8);
  // cercas de arame: ao longo da estrada (separa o barranco) e no fundo do pátio; dois trechos caídos
  const arameMat = new THREE.MeshStandardMaterial({ color: 0x6a6a68, metalness: .8, roughness: .35 });
  const postoMat = MAT.madeiraEsc;
  function cercaReta(x1, z1, x2, z2, alturas = [.45, .85, 1.25]) {
    const horiz = z1 === z2, L = horiz ? Math.abs(x2 - x1) : Math.abs(z2 - z1), n = Math.max(1, Math.round(L / 2.4));
    for (let i = 0; i <= n; i++) { const k = i / n; cyl(.05, .06, 1.4, postoMat, x1 + (x2 - x1) * k, .7, z1 + (z2 - z1) * k, 5).rotation.z = Math.sin(i * 1.7) * .05; }
    for (const y of alturas) box(horiz ? L : .012, .012, horiz ? .012 : L, arameMat, (x1 + x2) / 2, y, (z1 + z2) / 2, grupo, false);
  }
  cercaReta(7.05, -26, 7.05, GZ + 3.6); cercaReta(7.05, GZ + 1.2, 7.05, GZ + .3);
  cercaReta(7.05, -25.95, 8.3, -25.95); cercaReta(10.7, -25.95, 24, -25.95);
  // trechos caídos: arame frouxo quase no chão, poste tombado
  function cercaCaida(x1, z1, x2, z2) {
    const horiz = z1 === z2, L = horiz ? Math.abs(x2 - x1) : Math.abs(z2 - z1), cx = (x1 + x2) / 2, cz = (z1 + z2) / 2;
    for (const [y, dy] of [[1.02, .1], [.96, -.05], [.32, .02]]) { const w = box(horiz ? L : .012, .012, horiz ? .012 : L, arameMat, cx, y, cz, grupo, false); if (horiz) w.rotation.z = dy; else w.rotation.x = dy; }
    const p = cyl(.05, .06, 1.4, postoMat, cx + (horiz ? .3 : .35), .25, cz + (horiz ? .35 : .3), 5); p.rotation.set(horiz ? 1.2 : 0, 0, horiz ? 0 : 1.2);
  }
  cercaCaida(8.35, -25.95, 10.65, -25.95); cercaCaida(7.05, GZ + 1.35, 7.05, GZ + 3.45);
  // colisão baixa: em pé, o arame segura; agachada, passa
  const cercas = [
    { col: A.addCollider(8.35, 10.65, -26.15, -25.85), cx: 9.5, cz: -26, avisou: false },
    { col: A.addCollider(6.85, 7.15, GZ + 1.35, GZ + 3.45), cx: 7, cz: GZ + 2.4, avisou: false }
  ];
  // placa pregada no poste do vão (e o recado do Joaquim por baixo)
  const placaB = plano(.9, .45, new THREE.MeshStandardMaterial({ map: A.textoTex([{ t: 'CUIDADO', tam: 60, estilo: 'bold' }, { t: 'barranco · cascalho solto', tam: 34 }, { t: 'só de joelhos — J.S.', tam: 30, estilo: 'italic' }], { fundo: '#2a2218', cor: '#c8b890', manchas: 8 }), roughness: .9 }), 10.95, 1.15, -25.85, 0);
  placaB.userData.leitura = { t: 'CUIDADO · barranco · cascalho solto · "só de joelhos" — J.S.' };
  interact(placaB, () => S.flags.leuPlacaB ? 'CUIDADO · barranco · cascalho solto. "Só de joelhos." — J.S.' : '<b>E</b>Ler a placa da cerca', () => { if (S.flags.leuPlacaB) return; S.flags.leuPlacaB = true; A.SFX.papel(); A.falar('est_barranco_placa'); });
  // o vulto encolhido no cascalho
  const vb = c.novoVulto();
  const olhoMat = new THREE.MeshStandardMaterial({ color: 0x100000, emissive: 0x9a1810, emissiveIntensity: 0 });
  for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.02, 6, 4), olhoMat); o.position.set(s * .05, 2.88, .12); vb.add(o); }
  const cabVb = vb.children.find(o => o.geometry && o.geometry.type === 'SphereGeometry');
  const bv = { x: 11.7, z: -43.5, sono: 0, acordado: false, levantar: 0, vistoT: 0, passoT: 0, respT: 2, avisou: false, pegando: false, respira: true };
  const hitVb = box(1.2, 1.3, 1.2, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), bv.x, .65, bv.z, grupo, false);
  interact(hitVb, () => bv.acordado ? '' : 'Uma coisa encolhida no cascalho. Respirando.', () => {}, { on: () => !bv.acordado && bar.dentro });
  function poseVb() {
    const k = bv.levantar;
    vb.scale.set(1, .38 + .62 * k, 1); vb.position.y = 0;
    vb.rotation.x = (1 - k) * .5; if (cabVb) cabVb.rotation.z = .4 + (1 - k) * .8;
  }
  function deitar(sono = 0) { bv.acordado = false; bv.levantar = 0; bv.sono = sono; bv.vistoT = 0; bv.avisou = false; bv.respira = true; vb.position.set(bv.x, 0, bv.z); vb.rotation.y = -Math.PI / 2; olhoMat.emissiveIntensity = 0; poseVb(); vb.visible = true; hitVb.position.set(bv.x, .65, bv.z); }
  deitar();
  const bar = { dentro: false, entrou: false, acordouNessa: false, passoAcc: 0, pedrasT: 8, viu: false, ultX: P.pos.x, ultZ: P.pos.z, perto: false };
  const noBarranco = () => P.pos.x > X0 && P.pos.x < X1 && P.pos.z > Z0 && P.pos.z < Z1;
  function acordar() {
    if (bv.acordado) return;
    bv.acordado = true; bar.acordouNessa = true; bv.respira = false;
    A.SFX.estalo({ x: bv.x, z: bv.z }, 1); A.SFX.passoMonstro({ x: bv.x, z: bv.z }, .9); SX.respiracao({ x: bv.x, y: 1.5, z: bv.z });
    medo(35); vibrar(.9, .6, 500); agenda(.6, () => A.falar('est_barranco_acordou'));
  }
  function pegou() {
    bv.pegando = true; P.bloqueado = true;
    const _f = new THREE.Vector3(); cam.getWorldDirection(_f); _f.y = 0; _f.normalize();
    vb.position.set(P.pos.x + _f.x * .9, -.9, P.pos.z + _f.z * .9); vb.rotation.y = Math.atan2(P.pos.x - vb.position.x, P.pos.z - vb.position.z); bv.levantar = 1; poseVb();
    A.SFX.grito('inspetor'); A.SFX.susto(); P.shake = .3 * movK(); S.fear = 100; vibrar(1, 1, 650);
    agenda(.7, () => A.fade(true));
    agenda(1.7, () => {
      P.pos.set(9.5, 0, -23.6); P.yaw = 0; P.pitch = 0; P.bloqueado = false; bv.pegando = false;
      if (S.dif === 'pesadelo') { S.health = Math.max(5, S.health - 25); S.capDano += 25; }
      S.capVisto++; S.flags.barrancoPegou = (S.flags.barrancoPegou || 0) + 1;
      deitar(.45); bar.entrou = false; bar.dentro = false;
      A.fade(false); A.falar('est_barranco_pegou');
      if (S.flags.barrancoPegou >= 2 || S.dif === 'facil') agenda(3.5, () => A.toast(`No cascalho: agachada (${tecla('C')}) e com a lanterna apagada (${tecla('F')}). Ou vá pela estrada.`));
    });
  }
  function tickBarranco(dt) {
    const dentro = noBarranco();
    if (dentro && !bar.dentro) {
      if (!bar.entrou) { bar.entrou = true; bar.acordouNessa = false; agenda(.4, () => { if (!fala1('barrancoEntrou', 'est_barranco_entra') && !S.inv.chaves.portao) fala1('barrancoSemChave', 'est_barranco_semchave'); }); if (!S.flags.dicaBarranco) { S.flags.dicaBarranco = true; agenda(2.6, () => A.toast(`Cascalho: em pé faz barulho. Agachada (${tecla('C')}) e no escuro (${tecla('F')}) é mais seguro.`)); } }
    }
    bar.dentro = dentro;
    // atravessou: chegou do lado do portão vinda do barranco
    if (bar.entrou && !dentro && P.room && P.room.id === 'estrada' && P.pos.z < GZ + 6) {
      bar.entrou = false;
      if (!S.flags.atalhoBarranco) { S.flags.atalhoBarranco = true; A.conquista(CONQ.id); agenda(.5, () => A.falar(bar.acordouNessa ? 'est_barranco_saiu' : 'est_barranco_limpo')); }
      if (bv.acordado && !bv.pegando) agenda(2, () => { if (!noBarranco()) deitar(.6); });
    }
    if (bar.entrou && !dentro && P.room && P.room.id === 'patioPosto') { bar.entrou = false; if (bv.acordado && !bv.pegando) agenda(2.5, () => { if (!noBarranco()) deitar(.6); }); }
    // passos no cascalho (em pé é alto; correndo, as pedras rolam)
    const mov = Math.hypot(P.pos.x - bar.ultX, P.pos.z - bar.ultZ); bar.ultX = P.pos.x; bar.ultZ = P.pos.z;
    if (dentro && mov > .001 && mov < 1) {
      bar.passoAcc += mov;
      const passo = P.sprinting ? .78 : P.crouch ? .55 : .62;
      if (bar.passoAcc > passo) {
        bar.passoAcc = 0; const d = dist(bv.x, bv.z);
        if (P.crouch) { SOM.cascalho(.12); if (!bv.acordado) bv.sono += .012 * Math.max(0, 1 - d / 10); }
        else {
          SOM.cascalho(P.sprinting ? 1.4 : .9); leg('est_cascalho');
          if (!bv.acordado) bv.sono += (P.sprinting ? .42 : .2) * Math.max(0, 1 - d / 20);
          if (P.sprinting && Math.random() < .45) { const p = { x: P.pos.x + 1.5, y: 0, z: P.pos.z - 1 }; SOM.pedras(p); leg('est_pedras', p); }
        }
      }
    }
    // pedrinhas caem do paredão de vez em quando
    if (dentro) { bar.pedrasT -= dt; if (bar.pedrasT <= 0) { bar.pedrasT = 7 + Math.random() * 9; const p = { x: X1 - .3, y: 1.5, z: P.pos.z + (Math.random() - .5) * 16 }; SOM.pedras(p); leg('est_pedras', p); } }
    // o vulto: dorme, respira, mexe, acorda
    const dV = dist(vb.position.x, vb.position.z);
    if (!bv.acordado) {
      if (dentro && luzAcesa() && dV < 13) bv.sono += (olhando(vb.position, .35, 14, .8) ? .55 : .26) * dt;
      bv.sono = Math.max(0, bv.sono - .03 * dt);
      if (dentro && dV < 16 && !bar.viu && olhando(vb.position, .4, 16, .8)) { bar.viu = true; fala1('barrancoViu', 'est_barranco_vulto'); }
      if (bv.sono > .45 && !bv.avisou) { bv.avisou = true; bv.respira = false; A.falar('est_barranco_mexeu'); medo(12); vibrar(.2, .4, 200); }
      if (bv.sono < .3 && bv.avisou) { bv.avisou = false; bv.respira = true; }
      if (cabVb) cabVb.rotation.y = bv.sono > .45 ? Math.atan2(P.pos.x - vb.position.x, P.pos.z - vb.position.z) * .4 : 0;
      if (bv.respira && dV < 22) { bv.respT -= dt; if (bv.respT <= 0) { bv.respT = 3.2; SX.respiracao({ x: vb.position.x, y: .6, z: vb.position.z }); } }
      vb.scale.y = .38 + Math.sin(A.perf() * 1.9) * (bv.respira ? .012 : 0);
      if (bv.sono >= 1) acordar();
      return;
    }
    // acordado: levanta devagar e anda quando você não está olhando (dentro do barranco)
    if (bv.pegando) return;
    bv.levantar = Math.min(1, bv.levantar + dt * .8); poseVb(); olhoMat.emissiveIntensity = 1.2 * bv.levantar;
    vb.rotation.y = Math.atan2(P.pos.x - vb.position.x, P.pos.z - vb.position.z);
    hitVb.position.set(vb.position.x, .65, vb.position.z);
    if (bv.levantar < 1 || !dentro) return;
    const visto = olhando(vb.position, .5, 30, 1.9);
    if (visto) { bv.vistoT += dt; if (bv.vistoT > 3.5) { bv.vistoT = 1.5; passoVb(1.2); A.SFX.passoMonstro({ x: vb.position.x, z: vb.position.z }, .8); } }
    else { bv.vistoT = 0; passoVb(3.6 * (A.D().vel || 1) * (P.sprinting ? 1.2 : 1) * dt); bv.passoT -= dt; if (bv.passoT <= 0) { bv.passoT = .5; A.SFX.passoMonstro({ x: vb.position.x, z: vb.position.z }, .55); SOM.cascalho(.8); } }
    S.fear = Math.max(S.fear, Math.min(95, 80 - dV * 2.5));
    if (dV < 5) P.shake = Math.max(P.shake, .006 * movK());
    if (dV < 1.4) pegou();
  }
  function passoVb(m) { const dx = P.pos.x - vb.position.x, dz = P.pos.z - vb.position.z, L = Math.hypot(dx, dz) || 1, s = Math.min(m, L); vb.position.x += dx / L * s; vb.position.z += dz / L * s; }
  // cercas: em pé o arame segura (e arranha); agachada passa
  function tickCercas() {
    for (const f of cercas) {
      f.col.on = !P.crouch;
      const d = dist(f.cx, f.cz);
      if (d < 1.1 && !P.crouch && !f.avisou && (Math.abs(P.pos.x - f.cx) < 1.4)) {
        f.avisou = true; SOM.arame({ x: f.cx, y: 1, z: f.cz }); leg('est_arame'); P.shake = Math.max(P.shake, .01 * movK());
        if (!fala1('barrancoCerca', 'est_barranco_cerca')) A.toast(`Por baixo do arame, só agachada (${tecla('C')}).`);
        else agenda(2.4, () => A.toast(`Por baixo do arame, só agachada (${tecla('C')}).`));
      }
      if (d > 3) f.avisou = false;
    }
  }

  // =================================================================== VIBRAÇÃO E SUSTOS DA ESTRADA
  function tickVultoEstrada(dt) {
    const n = S.flags.vultoPegou || 0;
    if (n > pr.pegou) { pr.pegou = n; vibrar(1, 1, 650); }
    // com a perseguição ativa, o controle pulsa fraco como um coração quando ele está perto
    if (S.flags.perseguicao && !S.done.abrir_portao) { pr.pulso = (pr.pulso || 0) - dt; if (pr.pulso <= 0 && S.fear > 70) { pr.pulso = .9; vibrar(.25, .05, 60); } }
  }

  // =================================================================== TÍTULO: um vulto no portão, num relâmpago
  const vt = c.novoVulto(); vt.position.set(3.4, 0, GZ + 2.2); vt.visible = false;
  const tit = { t: 0, feito: false, on: 0 };
  function tickTitulo(dt) {
    tit.t += dt;
    if (!tit.feito && tit.t > 9) { tit.feito = true; U.relampago(semFlash() ? .5 : 1.2, true); tit.on = .55; vt.rotation.y = 0; }
    if (tit.on > 0) { tit.on -= dt; vt.visible = U.raio() > .25 && tit.on > 0; if (tit.on <= 0) vt.visible = false; }
  }

  // =================================================================== DESEMPENHO: menos árvores em máquina fraca
  const arv = c.arvores; let qAnt = null, qT = 0;
  function tickQualidade(dt) {
    qT -= dt; if (qT > 0 || !arv) return; qT = 1;
    const q = qual(); if (q === qAnt) return; qAnt = q;
    const k = q === 'baixa' ? .55 : q === 'media' ? .8 : 1, n = Math.round(arv.n * k);
    arv.tronco.count = n; arv.copa.count = Math.min(arv.copaN, n * 2);
    if (q === 'baixa') fumaca.visible = false;
  }

  // =================================================================== TICK
  A.W.tick.push(dt => {
    if (!vivo()) return;
    if (A.mode === 'titulo') { tickTitulo(dt); tickQualidade(dt); return; }
    if (A.mode !== 'jogo') return;
    tickQualidade(dt); tickCarro(dt); tickChave(dt); tickCadeado(dt); tickOrelhao(dt); tickCercas(); tickVultoEstrada(dt);
    if (!pr.lanterna && S.inv.lanterna) { pr.lanterna = true; aoPegarLanterna(); }
    if (pr.balanco > 0) { pr.balanco = Math.max(0, pr.balanco - dt * 2.2); carro.rotation.x = Math.sin(pr.balanco * 18) * .012 * pr.balanco * movK(); if (pr.balanco === 0) carro.rotation.x = 0; }
    if (!pr.chave && S.inv.chaves.portao) { pr.chave = true; SOM.chaves({ x: 12.14, y: 1.5, z: -19.4 }); leg('est_chaves'); vibrar(.1, .3, 80); }
    if (!pr.portao && S.done.abrir_portao) { pr.portao = true; aoAbrirPortao(); }
    const mov = Math.hypot(P.pos.x - ultX, P.pos.z - ultZ) > .002; ultX = P.pos.x; ultZ = P.pos.z;
    tickPocas(dt, mov);
    if (bar.entrou || bar.dentro || bv.acordado || (P.pos.x > 6 && P.pos.z < -20)) tickBarranco(dt);
    else { bar.ultX = P.pos.x; bar.ultZ = P.pos.z; }
    tickToque();
  });
  const vigia = setInterval(() => { if (!vivo()) { clearInterval(vigia); limparToque(); } }, 700);

  return {
    // Lote 4 (src/estrada-segredos.js): abre a porta do motorista e fecha sozinha depois de `fecha` s (0 = fica como está)
    porta(abrir, fecha) { cs.doorAlvo = abrir ? 1 : 0; cs.fechaT = abrir ? fecha || 0 : 0; if (abrir) cs.cortesia = 1; },
    // o cascalho dobra o seu ruído em pé (e quase some agachada)
    ruidoMul: () => (bar.dentro ? (P.crouch ? .7 : P.sprinting ? 2.4 : 2) : 1)
  };
}
