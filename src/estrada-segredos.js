// PRÓLOGO — Lote 4: segredos e easter eggs da estrada velha. Chamado por estrada() em mapas.js, depois de polirEstrada().
// - O carro por dentro: entrar de novo, buzina (3 = luz na torre, 9 devagar = o último ônibus), retrovisor que muda
//   entre as noites, banco de trás (Q), farol alto, a chave no contato (Final 0) e ficar três minutos (final secreto).
// - A estrada que dá a volta (andar para trás três vezes), andar de costas (Ré), marco 79, pegadas no relâmpago,
//   pipa no poste, manilha, placas de escola, cartaz do diretor, bicicleta na neblina e o velho do saco (raro).
// - Lanterna que fala: S.O.S. para o internato e três piscadas para o posto (detector de ritmo do F).
// - Posto: gato, bala de goma, máquina de chiclete, poço, binóculo, contador da bomba, caixa de correio, porão do rádio.
import { TX4, mesclarSegredos } from './estrada-segredos-texto.js';
import { memoria, lembrar } from './estrada-extra.js';
import { semFlash, vibrar, tecla } from './estrada-polimento.js';

const MEM4 = 'hora-silencio-estrada4';
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const mem4 = () => lsGet(MEM4, {}) || {};
const mem4Set = (k, v) => { const m = mem4(); m[k] = v; lsSet(MEM4, m); };
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const stats = () => lsGet('hora-silencio-stats', {}) || {};
let sensC = 1, sensT = -1e9;
const sens = () => { const n = performance.now(); if (n - sensT > 2000) { sensT = n; sensC = +(lsGet('hora-silencio-opt', {}) || {}).sens || 1; } return sensC; };

// placa do portão: perde letras a cada 10 mortes (somando as noites), numa ordem fixa
const ESTAGIOS = [[0, 'INTERNATO SÃO LÁZARO'], [10, 'INTERNATO S O LÁZARO'], [20, '    RNATO S O LÁZARO'], [30, '     NATO S O L ZARO'], [45, '     NATO S O LÁ    '], [65, '          S O LÁ    '], [90, '              LÁ    ']];
export function letrasPlaca() { const m = stats().mortes || 0; let t = ESTAGIOS[0][1]; for (const [n, s] of ESTAGIOS) if (m >= n) t = s; return t; }

export function segredosEstrada(A, S, c) {
  const { THREE, MAT, box, cyl, plano, interact, item } = A;
  mesclarSegredos(A.R);
  try { const L = A.legendas; if (L) for (const k in TX4.legendas) if (!L[k]) L[k] = TX4.legendas[k]; } catch (e) {}
  const U = c.ex.util, SX = U.SX, agenda = U.agenda, olhando = U.olhando, medo = U.medo;
  const grupo = A.W.grupo, P = A.P, cam = A.camera, GZ = c.GZ, BZ = c.BZ, carro = c.carro, fora = c.fora;
  const J = () => window.__jogo;
  const vivo = () => A.W.grupo === grupo && A.S === S;
  const livre = () => vivo() && A.mode === 'jogo' && !(J() && J().ui) && !S.dead && !S.fim;
  const dist = (x, z) => Math.hypot(x - P.pos.x, z - P.pos.z);
  const luzAcesa = () => S.inv.lanterna && S.flashOn && S.battery > 0;
  const leg = (k, ...a) => { try { A.SFX[k](...a); } catch (e) {} };
  const fala1 = (flag, k) => { if (S.flags[flag]) return false; S.flags[flag] = true; A.falar(k); return true; };
  const noite = () => S.flags._noite || stats().partidas || 1;
  const perseguindo = () => !!(S.flags.perseguicao && !S.done.abrir_portao);
  const au = () => (A.audio && A.audio()) || null;
  const inv = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
  const escuro = new THREE.MeshStandardMaterial({ color: 0x070707, roughness: 1 });
  const pele = new THREE.MeshStandardMaterial({ color: 0xb8a898, roughness: .7 });
  const uniforme = new THREE.MeshStandardMaterial({ color: 0x1c2440, roughness: .9 });
  const concreto = A.texMat('concreto', 1, 1);
  const tex = (w, h, draw) => A.canvasTex(w, h, draw);
  const semNevoa = (cor, op = 1) => new THREE.MeshBasicMaterial({ color: cor, fog: false, transparent: true, opacity: op, depthWrite: false });
  const posCarro = (lx, ly, lz) => ({ x: carro.position.x + lx, y: ly, z: carro.position.z + lz });

  // ---------------------------------------------------------------- sons novos (procedurais)
  const SOM = {
    buzOnibus(pos, vol = .3) { const a = au(); if (!a) return; const { AC, saida } = a; const t = AC.currentTime, g = saida(pos, .6), lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650; lp.connect(g); for (const f of [148, 176, 222]) { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(lp); o.start(t); o.stop(t + .85); } g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .06); g.gain.setValueAtTime(vol, t + .7); g.gain.exponentialRampToValueAtTime(.0001, t + .84); leg('s4_buzOnibus'); },
    batida(pos) { const a = au(); if (!a) return; const { AC, saida, burst, env, osc } = a; const t = AC.currentTime; const g = saida(pos, .1); burst(t, .06, 'bandpass', 1400, 2, g); env(g, t, .001, .45, .06); const g2 = saida(pos, .1); osc('sine', 210, t, .08, g2); env(g2, t, .001, .2, .07); },
    couro(pos) { const a = au(); if (!a) return; const { AC, saida, burst } = a; const t = AC.currentTime, g = saida(pos, .1), f = burst(t, 1.3, 'bandpass', 420, 6, g); f.frequency.linearRampToValueAtTime(760, t + 1.2); g.gain.setValueAtTime(.0001, t); for (let i = 0; i < 16; i++) g.gain.setValueAtTime(.04 + Math.random() * .2, t + i * .08); g.gain.exponentialRampToValueAtTime(.0001, t + 1.3); leg('s4_couro', pos); },
    ronrono(pos, dur = 3) { const a = au(); if (!a) return; const { AC, saida, burst } = a; const t = AC.currentTime, g = saida(pos, .05); burst(t, dur, 'lowpass', 380, 1, g); const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = 25; lg.gain.value = .07; lfo.connect(lg); lg.connect(g.gain); g.gain.setValueAtTime(.08, t); g.gain.linearRampToValueAtTime(0, t + dur); lfo.start(t); lfo.stop(t + dur); leg('s4_ronrono', pos); },
    chiado(pos) { const a = au(); if (!a) return; const { AC, saida, burst, env } = a; const t = AC.currentTime, g = saida(pos, .1); burst(t, .9, 'highpass', 2800, 1, g); env(g, t, .05, .22, .8); leg('s4_chiado', pos); },
    miado(pos) { const a = au(); if (!a) return; const { AC, saida } = a; const t = AC.currentTime, g = saida(pos, .2), o = AC.createOscillator(), bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 2; o.type = 'sawtooth'; o.frequency.setValueAtTime(620, t); o.frequency.linearRampToValueAtTime(820, t + .18); o.frequency.linearRampToValueAtTime(520, t + .55); o.connect(bp); bp.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .05); g.gain.exponentialRampToValueAtTime(.0001, t + .6); o.start(t); o.stop(t + .65); leg('s4_miado', pos); },
    festa(pos) { const a = au(); if (!a) return; const { AC, saida, env } = a; const t = AC.currentTime, notas = [392, 494, 587, 494, 440, 523, 659, 523, 392, 494, 587, 784]; notas.forEach((f, i) => { const g = saida(pos, .7, 'amb'), o = AC.createOscillator(); o.type = 'triangle'; o.frequency.value = f * (1 + (Math.random() - .5) * .01); o.connect(g); const t0 = t + i * .34; env(g, t0, .01, .05, .3); o.start(t0); o.stop(t0 + .35); }); leg('s4_festa'); },
    carta(pos, vol = .12) { const a = au(); if (!a) return; const { AC, saida, burst, env } = a; const t = AC.currentTime; for (let i = 0; i < 10; i++) { const g = saida(pos, .3), t0 = t + i * .028; burst(t0, .012, 'bandpass', 2600, 4, g); env(g, t0, .001, vol, .012); } },
    engasgo() { const a = au(); if (!a) return; const { AC, saida, burst } = a; const t = AC.currentTime, g = saida(null, .05); burst(t, .8, 'lowpass', 220, 2, g); g.gain.setValueAtTime(.0001, t); for (let i = 0; i < 6; i++) { g.gain.setValueAtTime(.35, t + i * .12); g.gain.setValueAtTime(.03, t + i * .12 + .06); } g.gain.exponentialRampToValueAtTime(.0001, t + .8); },
    engrenagem(pos) { const a = au(); if (!a) return; const { AC, saida, burst, env } = a; const t = AC.currentTime; for (let i = 0; i < 18; i++) { const g = saida(pos, .1), t0 = t + i * .13; burst(t0, .02, 'bandpass', 1800 - i * 30, 6, g); env(g, t0, .001, .12, .02); } leg('s4_contador', pos); }
  };
  // laço do diesel do ônibus (volume pela distância, sem posição fixa)
  function diesel() {
    const a = au(); if (!a) return null; const { AC, saida, ruido } = a;
    const g = saida(null, .2); g.gain.value = 0; const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.connect(g);
    const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 36; o.connect(lp); o.start();
    const n = ruido(true), f2 = AC.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 180; n.connect(f2); f2.connect(lp); n.start();
    return { g, parar() { try { o.stop(); n.stop(); g.disconnect(); } catch (e) {} } };
  }
  // chuva grossa no teto do carro (laço)
  function chuvaTeto() {
    const a = au(); if (!a) return null; const { AC, saida, ruido } = a;
    const g = saida(null, .1); g.gain.value = 0; const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = .6; bp.connect(g);
    const n = ruido(true); n.connect(bp); n.start();
    return { g, parar() { try { n.stop(); g.disconnect(); } catch (e) {} } };
  }

  // ---------------------------------------------------------------- bonecos simples
  function crianca(corRoupa = uniforme, cabecaBaixa = true) {
    const g = new THREE.Group();
    box(.26, .4, .16, corRoupa, 0, .55, 0, g, false);
    for (const s of [-1, 1]) { box(.08, .36, .09, corRoupa, s * .07, .18, 0, g, false); box(.06, .3, .07, corRoupa, s * .17, .52, 0, g, false); }
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.1, 10, 8), pele); cab.position.set(0, .86, cabecaBaixa ? .04 : 0); g.add(cab);
    const cabelo = new THREE.Mesh(new THREE.SphereGeometry(.105, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), escuro); cabelo.position.copy(cab.position); g.add(cabelo);
    if (cabecaBaixa) { cab.rotation.x = .5; cabelo.rotation.x = .5; }
    g.visible = false; return g;
  }
  const maoTex = (cor = 'rgba(200,205,212,.5)') => tex(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = cor; g.beginPath(); g.ellipse(32, 38, 9, 11, 0, 0, 6.3); g.fill(); [[-8, -13, 2.4, 8], [-3, -17, 2.6, 10], [2, -18, 2.6, 10.5], [7, -15, 2.4, 9], [11, -2, 2.4, 7]].forEach(([fx, fy, rx, ry]) => { g.beginPath(); g.ellipse(32 + fx, 38 + fy, rx, ry, fx * .03, 0, 6.3); g.fill(); }); });

  // =================================================================== O CARRO POR DENTRO
  const sent = { on: false, t: 0, base: 0, q: 0, farol: false, farolN: 0, travou: false, fim: false, retroT: 0, retroVisto: false, mov: 0, avisoMov: false, chuva: null };
  const podeSentar = () => S.flags.saiuCarro && !perseguindo() && !S.done.abrir_portao && !c.ex.cena.__rodando;
  const hitEntra = box(.08, .8, 1.0, inv, -.97, .95, -.15, carro, false);
  interact(hitEntra, () => '<b>E</b>Entrar no carro', () => sentar(), { on: () => !sent.on && podeSentar() });
  const hitSai = box(.05, .45, .8, inv, -.82, 1.05, -.2, carro, false);
  interact(hitSai, () => '<b>E</b>Sair do carro', () => levantar(), { on: () => sent.on && !sent.fim });
  const hitBuz = box(.34, .34, .06, inv, -.38, 1.0, -.47, carro, false);
  interact(hitBuz, () => '<b>E</b>Buzinar', () => buzinar(), { on: () => sent.on && !sent.fim });
  const hitChave = box(.1, .1, .08, inv, -.12, .92, -.6, carro, false);
  const itChave = interact(hitChave, () => S.inv.lanterna ? '<b>E</b>Girar a chave no contato' : 'A chave ainda está no contato.', () => { if (!S.inv.lanterna) { fala1('s4_chaveNao', 's4_chave_nao'); return; } desistir(); }, { on: () => sent.on && !sent.fim });
  Object.defineProperty(itChave, 'hold', { get: () => (S.inv.lanterna && sent.on ? 3 : 0) });
  // moeda de cruzeiro no cinzeiro (para a máquina de chiclete do posto)
  const moeda = cyl(.022, .022, .005, MAT.bronze, 0, 0, 0, 12, new THREE.Group());
  const pm = posCarro(.02, .935, -.64);
  item('s4_moeda', pm, moeda, 'Pegar a moeda do cinzeiro', () => { S.flags.s4_moeda = true; A.falar('s4_moeda'); });
  // tampa do porta-luvas (abre sozinha se você ficar no carro)
  const plG = new THREE.Group(); plG.position.set(.6, .845, -.575); carro.add(plG);
  box(.42, .11, .015, new THREE.MeshStandardMaterial({ color: 0x121010, roughness: .8 }), 0, .055, 0, plG, false);
  // retrovisor interno: o reflexo muda entre as noites
  const desenhaRetro = modo => (g, w, h) => {
    g.fillStyle = '#0a0a0c'; g.fillRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2a3038'); gr.addColorStop(1, '#101216'); g.fillStyle = gr; g.fillRect(30, 6, w - 60, h * .5);
    g.fillStyle = '#1a1612'; g.fillRect(10, h * .55, w - 20, h * .45); g.fillStyle = '#231e18'; g.fillRect(24, h * .42, 70, h * .2); g.fillRect(w - 94, h * .42, 70, h * .2);
    if (modo === 'cinto' || modo === 'lia') { g.strokeStyle = '#6a6a6a'; g.lineWidth = 3; g.beginPath(); g.moveTo(w - 40, h * .44); g.lineTo(w - 80, h * .95); g.stroke(); g.fillStyle = '#8a8a80'; g.fillRect(w - 84, h * .86, 10, 8); }
    if (modo === 'cinto') { g.fillStyle = 'rgba(210,215,220,.5)'; g.beginPath(); g.ellipse(w * .62, h * .25, 6, 8, 0, 0, 6.3); g.fill(); for (let i = 0; i < 4; i++) g.fillRect(w * .62 - 6 + i * 4, h * .25 - 18, 2.4, 10); }
    if (modo === 'lia') { g.save(); g.translate(w / 2, h * .3); g.scale(-1, 1); g.fillStyle = 'rgba(220,225,230,.65)'; g.font = 'bold 26px Arial'; g.textAlign = 'center'; g.fillText('LIA', 0, 9); g.restore(); }
    if (modo === 'vulto') { g.fillStyle = '#000'; g.fillRect(w / 2 - 16, h * .1, 32, h * .9); g.beginPath(); g.ellipse(w / 2, h * .12, 13, 16, 0, 0, 6.3); g.fill(); g.fillStyle = '#8a1010'; g.fillRect(w / 2 - 7, h * .12, 3, 2); g.fillRect(w / 2 + 4, h * .12, 3, 2); }
    g.strokeStyle = '#2a2a2a'; g.lineWidth = 4; g.strokeRect(1, 1, w - 2, h - 2);
  };
  const retroTex = { vazio: tex(192, 64, desenhaRetro('vazio')), cinto: tex(192, 64, desenhaRetro('cinto')), lia: tex(192, 64, desenhaRetro('lia')), vulto: tex(192, 64, desenhaRetro('vulto')) };
  const retroMat = new THREE.MeshBasicMaterial({ map: retroTex.vazio });
  const retro = plano(.24, .08, retroMat, .02, 1.47, -.84, 0, carro);
  box(.26, .1, .02, MAT.preto, .02, 1.47, -.852, carro, false);
  const retroNoite = () => { const n = noite(); return n >= 3 ? 'lia' : n >= 2 ? 'cinto' : 'vazio'; };
  // banco de trás: a criança (0,4 s, uma vez), o estofado molhado e a mãozinha no vidro
  const crBanco = crianca(); crBanco.position.set(.38, .3, .85); crBanco.rotation.y = Math.PI; carro.add(crBanco);
  const molhado = plano(.42, .4, new THREE.MeshStandardMaterial({ color: 0x050403, roughness: .1, metalness: .3, transparent: true, opacity: .7 }), .38, .66, .82, 0, carro); molhado.rotation.x = -Math.PI / 2; molhado.visible = !!S.flags.s4_banco;
  const maoVidro = plano(.12, .12, new THREE.MeshBasicMaterial({ map: maoTex(), transparent: true, depthWrite: false, side: THREE.DoubleSide }), .805, 1.25, .9, -Math.PI / 2, carro); maoVidro.visible = !!S.flags.s4_banco;
  // as três crianças do farol alto
  const tres = new THREE.Group(); grupo.add(tres); tres.visible = false;
  [-.6, 0, .6].forEach((x, i) => { const k = crianca(uniforme, false); k.visible = true; k.position.set(x, 0, 0); k.scale.setScalar(1.25 - i * .1); tres.add(k); });

  function sentar() {
    if (sent.on || !podeSentar()) return;
    sent.on = true; sent.t = 0; sent.q = 0; sent.mov = 0; sent.travou = false; sent.retroT = 0; sent.retroVisto = false;
    P.bloqueado = true; P.crouch = false; c.pol.porta(1, .7);
    P.pos.set(carro.position.x - .38, 0, carro.position.z - .05); P.h = 1.12; P.yaw = 0; P.pitch = -.04; sent.base = 0;
    A.SFX.clique(); vibrar(.2, .1, 80);
    if (!S.flags.s4_entrou) { S.flags.s4_entrou = true; A.falar('s4_carro_entra'); }
  }
  function levantar(silencio) {
    if (!sent.on) return;
    sent.on = false; P.bloqueado = false; P.h = 1.62; c.pol.porta(1, .8);
    P.pos.set(carro.position.x - 1.55, 0, carro.position.z - .2); P.yaw = Math.PI / 2; P.pitch = 0;
    if (sent.farol) { sent.farol = false; c.farolOn(false); }
    if (sent.chuva) { const ch = sent.chuva; sent.chuva = null; try { ch.g.gain.linearRampToValueAtTime(0, au().AC.currentTime + .6); } catch (e) {} setTimeout(() => ch.parar(), 900); }
    if (!silencio && sent.t > 30 && !S.flags.s4_saiuTarde) { S.flags.s4_saiuTarde = true; A.falar('s4_carro_sai'); }
  }
  // buzina: 3 curtas = a luz da torre responde; 9 devagar = o último ônibus; mais de 6 em seguida = pancada no teto
  const bz = { ts: [], ult: -9, rapidas: 0, lentas: 0, luzFeita: false };
  function buzinar() {
    const agora = A.perf(), dtb = agora - bz.ult; bz.ult = agora;
    SX.buzina(posCarro(0, 1, -1.8), .5); A.emitNoise(carro.position.x, carro.position.z, 14, true); vibrar(.6, .4, 300);
    bz.ts = bz.ts.filter(t => agora - t < 6); bz.ts.push(agora);
    bz.rapidas = dtb < .9 ? bz.rapidas + 1 : 1;
    bz.lentas = dtb >= .9 && dtb <= 4.5 ? bz.lentas + 1 : 1;
    if (bz.ts.length >= 7 && !S.flags.s4_teto) { S.flags.s4_teto = true; agenda(.5, () => { A.SFX.pancada(carro.position.x, carro.position.z); P.shake = Math.max(P.shake || 0, .25); medo(25); vibrar(.9, .6, 400); A.falar('s4_buzina_teto'); }); bz.lentas = 0; return; }
    if (bz.rapidas === 3) {
      if (!bz.luzFeita && !S.flags.s4_luzTorre) { bz.luzFeita = true; S.flags.s4_luzTorre = true; agenda(2.2, () => piscarTorre(3, .35, () => { leg('s4_luzTorre'); A.falar('s4_buzina_luz'); A.conquista('s4_sinal'); })); }
      else if (!S.flags.s4_buzSozinha) { S.flags.s4_buzSozinha = true; agenda(2.6, () => { SX.buzina(posCarro(0, 1, -1.8), .7); medo(18); A.falar('s4_buzina_sozinha'); }); }
    }
    if (bz.lentas === 9 && !S.flags.s4_onibus) { S.flags.s4_onibus = true; onibusVem(); }
  }

  // ---------------------------------------------------------------- o ônibus de 1979
  const onibus = new THREE.Group(); onibus.visible = false; grupo.add(onibus);
  const latao = new THREE.MeshStandardMaterial({ color: 0x5a4a1a, roughness: .8, metalness: .2 });
  box(2.4, 2.2, 9, latao, 0, 1.5, 0, onibus, false); box(2.3, .3, 9.1, escuro, 0, .45, 0, onibus, false);
  const janOn = new THREE.MeshBasicMaterial({ color: 0xffd890 });
  const janOff = new THREE.MeshBasicMaterial({ color: 0x0a0a08 });
  for (const s of [-1, 1]) for (let i = 0; i < 7; i++) {
    const vazia = s === 1 && (i === 2 || i === 4 || i === 5);
    const z = -3.6 + i * 1.15; plano(.9, .7, vazia ? janOff : janOn, s * 1.205, 1.95, z, s * Math.PI / 2, onibus);
    if (!vazia) { const cab = new THREE.Mesh(new THREE.SphereGeometry(.14, 8, 6), escuro); cab.position.set(s * 1.1, 1.85, z); onibus.add(cab); box(.05, .3, .32, escuro, s * 1.12, 1.62, z, onibus, false); }
  }
  plano(2.1, .8, janOn, 0, 2.0, -4.51, Math.PI, onibus);
  const farolOn = new THREE.MeshBasicMaterial({ color: 0xffd060 });
  for (const x of [-.8, .8]) box(.3, .2, .05, farolOn, x, .9, -4.52, onibus, false);
  const luzOn = new THREE.SpotLight(0xffd070, 0, 34, .5, .6, 1.2); luzOn.position.set(0, 1, -4.6); luzOn.target.position.set(0, 0, -16); onibus.add(luzOn, luzOn.target);
  const placaOn = A.textoTex([{ t: 'INTERNATO S. LÁZARO', tam: 44, estilo: 'bold' }], { w: 512, h: 96, fundo: '#1a1608', cor: '#e8c860', manchas: 2 });
  plano(1.8, .34, new THREE.MeshBasicMaterial({ map: placaOn }), 0, 2.75, -4.52, Math.PI, onibus);
  const on = { ativo: false, z: 0, som: null, vez: 0 };
  function onibusVem() {
    A.falar('s4_onibus_vem');
    for (let i = 0; i < 9; i++) agenda(1.4 + i * 1.35, () => { on.vez = i; SOM.buzOnibus({ x: -2.6, y: 2, z: 80 - i * 4 }, .12 + i * .03); if (i === 8) faroisNaNeblina(); });
  }
  function faroisNaNeblina() {
    on.ativo = true; on.z = 84; onibus.position.set(-2.6, 0, on.z); onibus.visible = true; luzOn.intensity = 30; on.som = diesel(); leg('s4_diesel'); medo(20);
  }
  function tickOnibus(dt) {
    if (!on.ativo) return;
    on.z -= dt * 4.2; onibus.position.z = on.z; onibus.position.y = Math.sin(A.perf() * 9) * .02;
    if (on.som) { const d = Math.abs(on.z - P.pos.z) + Math.abs(-2.6 - P.pos.x); on.som.g.gain.value = clamp(.35 - d / 120, 0, .35); }
    if (on.z < 17) {
      on.ativo = false; U.relampago(1); A.SFX.estatica(.6, { x: -2.6, y: 1.5, z: on.z });
      agenda(.15, () => { onibus.visible = false; luzOn.intensity = 0; });
      if (on.som) { const s = on.som; on.som = null; s.parar(); }
      agenda(1.4, () => { A.falar('s4_onibus_passou'); A.conquista('s4_onibus'); });
    }
  }

  // ---------------------------------------------------------------- luzes do internato (sem névoa: atravessam a chuva)
  const luzTorre = plano(.9, 1.3, semNevoa(0xffc070, 0), 0, 12.2, BZ + 7.06, 0); luzTorre.renderOrder = 5;
  const luzSOS = plano(1.3, 1.5, semNevoa(0xffd090, 0), -10, 5.5, BZ + 5.18, 0); luzSOS.renderOrder = 5;
  const silSOS = plano(.42, .9, semNevoa(0x000000, 0), -10, 5.35, BZ + 5.2, 0); silSOS.renderOrder = 6;
  const pulsos = []; // { t0, dur, alvo, k } — piscadas agendadas numa luz
  function piscar(mesh, seq, cb, pico = .95) { // seq: [[liga, dura], ...] em segundos a partir de agora
    const t = A.perf(); for (const [ini, dur] of seq) pulsos.push({ mesh, t0: t + ini, t1: t + ini + dur, pico });
    const fim = Math.max(...seq.map(s => s[0] + s[1])); if (cb) agenda(fim + .2, cb);
  }
  function piscarTorre(n, dur, cb) { const seq = []; for (let i = 0; i < n; i++) seq.push([i * dur * 2.2, dur]); piscar(luzTorre, seq, cb); }
  const base = new Map(); // brilho de fundo de cada luz (a janela do S.O.S. fica acesa até o portão)
  function tickLuzes() {
    const t = A.perf(), suave = semFlash();
    for (const m of [luzTorre, luzSOS, silSOS]) {
      let alvo = base.get(m) || 0;
      for (const p of pulsos) if (p.mesh === m && t >= p.t0 && t <= p.t1) alvo = p.pico;
      m.material.opacity = suave ? lerp(m.material.opacity, alvo, .18) : alvo;
    }
    for (let i = pulsos.length - 1; i >= 0; i--) if (t > pulsos[i].t1 + .5) pulsos.splice(i, 1);
  }
  const morse = { '.': .25, '-': .75 };
  function morseSeq(palavra, ini = 0) { // D A V I
    const L = { D: '-..', A: '.-', V: '...-', I: '..', S: '...', O: '---' }; const seq = []; let t = ini;
    for (const ch of palavra) { for (const s of L[ch]) { seq.push([t, morse[s]]); t += morse[s] + .25; } t += .6; }
    return seq;
  }

  // ---------------------------------------------------------------- o retrovisor, o banco de trás e o farol alto
  const _dir = new THREE.Vector3(), _wp = new THREE.Vector3();
  function olhandoRetro() { retro.getWorldPosition(_wp); cam.getWorldDirection(_dir); const v = _wp.clone().sub(cam.position).normalize(); return _dir.dot(v) > Math.cos(.13); }
  function tickSentada(dt) {
    if (!sent.on) return;
    sent.t += dt;
    P.pos.set(carro.position.x - .38, 0, carro.position.z - .05); P.h = 1.12;
    // olhar para o banco de trás (Q)
    const querTras = !!tec.KeyQ && !sent.travou;
    sent.q = clamp(sent.q + (querTras ? dt * 4 : -dt * 5), 0, 1);
    if (sent.q > 0) { const e = sent.q * sent.q * (3 - 2 * sent.q); P.yaw = lerp(sent.base, sent.base - 2.6, e); P.pitch = lerp(sent.pitchBase || -.04, -.25, e); }
    if (sent.q > .92 && !S.flags.s4_banco) {
      S.flags.s4_banco = true; crBanco.visible = true; medo(30);
      agenda(.4, () => { crBanco.visible = false; molhado.visible = true; maoVidro.visible = true; });
      agenda(1.6, () => A.falar('s4_banco'));
    }
    // retrovisor: mirar 2 s
    if (!sent.retroVisto && sent.q < .05 && olhandoRetro()) {
      sent.retroT += dt;
      if (sent.retroT > 2) { sent.retroVisto = true; const m = retroNoite(); retroMat.map = retroTex[m]; retroMat.needsUpdate = true; if (!S.flags['s4_retro_' + m]) { S.flags['s4_retro_' + m] = true; A.falar(m === 'lia' ? 's4_retrovisor3' : m === 'cinto' ? 's4_retrovisor2' : 's4_retrovisor1'); if (m !== 'vazio') medo(15); } }
    } else if (!sent.retroVisto) sent.retroT = Math.max(0, sent.retroT - dt);
    // andar não sai do carro: avisa uma vez
    if (tec.KeyW || tec.KeyS || tec.KeyA || tec.KeyD) { sent.mov += dt; if (sent.mov > .5 && !sent.avisoMov) { sent.avisoMov = true; A.toast(`${tecla('E')} na porta para sair do carro.`); } }
    tickFicar(dt);
  }
  function farolAlto() {
    sent.farol = !sent.farol; c.farolOn(sent.farol); A.SFX.clique();
    if (sent.farol) { sent.farolN++; if (sent.farolN === 3 && !S.flags.s4_tres) { S.flags.s4_tres = true; tres.position.set(.2, 0, carro.position.z - 17); tres.rotation.y = 0; tres.visible = true; leg('s4_criancas'); SX.respiracao(posCarro(0, 1, -17)); medo(28); agenda(.5, () => { tres.visible = false; }); agenda(1.2, () => A.falar('s4_farol')); } else if (sent.farolN === 1) A.toast('Os faróis acendem fracos, amarelados. A bateria ainda tem um resto.'); }
  }
  // ficar no carro: três minutos e ele sai
  function tickFicar(dt) {
    if (sent.fim || perseguindo()) return;
    const t = sent.t;
    if (t > 45 && !sent.f45) { sent.f45 = true; A.falar('s4_carro_45'); }
    if (t > 60) { if (!sent.chuva) sent.chuva = chuvaTeto(); if (sent.chuva) sent.chuva.g.gain.value = clamp((t - 60) / 60, 0, 1) * .22; }
    if (t > 90 && !sent.f90) { sent.f90 = true; A.SFX.estatica(3, U.posRadio()); A.sub('radio', '(só chiado. Um chiado que parece respiração.)'); }
    if (t > 120 && !sent.f120) { sent.f120 = true; const p = posCarro(-.95, 1.2, -.1); [0, .45, .9].forEach(d => agenda(d, () => SOM.batida(p))); leg('s4_batidas'); vibrar(.4, .3, 200); medo(20); agenda(1.8, () => A.falar('s4_carro_120')); }
    if (t > 150 && !sent.f150) { sent.f150 = true; A.SFX.clique(); sent.plAbre = 1; medo(10); }
    if (t > 170 && !sent.f170) { sent.f170 = true; sent.travou = true; sent.base = 0; P.yaw = 0; P.pitch = 0; SOM.couro(posCarro(.3, .7, .8)); carro.position.y = .03; medo(60); vibrar(.7, .5, 900); A.falar('s4_carro_170'); }
    if (sent.travou) { P.yaw = lerp(P.yaw, 0, .2); P.pitch = lerp(P.pitch, 0, .2); }
    if (t > 180 && !sent.fim) { sent.fim = true; fimSecreto('carro', 's4_carro'); }
  }
  const plAnim = () => { if (sent.plAbre) plG.rotation.x = lerp(plG.rotation.x, 1.25, .08); };

  // ---------------------------------------------------------------- finais secretos (não contam para os três finais)
  function fimSecreto(tipo, conq) {
    const F = TX4.finais[tipo]; if (!F || S.fim) return;
    A.conquista(conq); lembrar('s4_fim_' + tipo); mem4Set('fimRecente', tipo);
    S.fim = true; try { A.SFX.motor(false); } catch (e) {}
    if (sent.chuva) { sent.chuva.parar(); sent.chuva = null; }
    try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
    const $ = s => document.querySelector(s);
    $('#fx-black').style.opacity = 1;
    setTimeout(() => A.cartao(F.antes, 3.2), 400);
    setTimeout(() => {
      if (A.S !== S) return;
      const hud = $('#hud'); if (hud) hud.hidden = true;
      const extra = ['#e-copiar', '#e-jornal', '#escolha'].map(s => $(s)).filter(Boolean); const antes = extra.map(e => e.hidden); extra.forEach(e => { e.hidden = true; });
      $('#e-tit').textContent = F.titulo; $('#e-txt').textContent = F.texto;
      const min = Math.floor(S.tempo / 60), seg = Math.floor(S.tempo % 60);
      $('#e-stats').innerHTML = `final secreto · não conta para os três finais · ${min}min ${String(seg).padStart(2, '0')}s na estrada velha`;
      $('#ending').hidden = false;
      const volta = () => { extra.forEach((e, i) => { e.hidden = antes[i]; }); $('#e-menu').removeEventListener('click', volta); };
      $('#e-menu').addEventListener('click', volta);
      try { A.SFX.sino(.35, null); } catch (e) {}
    }, 4200);
  }
  // Final 0: a chave no contato (segure E): engasga duas vezes, pega na terceira, ré e um vulto no retrovisor por um quadro
  function desistir() {
    if (sent.fim) return; sent.fim = true; sent.travou = true;
    SOM.engasgo(); vibrar(.5, .3, 400);
    agenda(1.1, () => { SOM.engasgo(); vibrar(.5, .3, 400); });
    agenda(2.3, () => { A.SFX.motor(true); leg('s4_motorPega'); c.farolOn(true); vibrar(.4, .6, 800); A.falar('s4_motor_pega'); });
    agenda(3.8, () => { sent.re = true; });
    agenda(5.2, () => { retroMat.map = retroTex.vulto; retroMat.needsUpdate = true; agenda(.07, () => { retroMat.map = retroTex[sent.retroVisto ? retroNoite() : 'vazio']; retroMat.needsUpdate = true; }); });
    agenda(6.6, () => fimSecreto('desistencia', 's4_final0'));
  }
  function tickRe(dt) { if (!sent.re) return; carro.position.z += dt * 3.2; P.pos.set(carro.position.x - .38, 0, carro.position.z - .05); }

  // ---------------------------------------------------------------- o vidro de trás: bafo
  const bafoTex = tex(128, 96, (g, w, h) => { g.fillStyle = 'rgba(200,205,212,.55)'; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'destination-out'; g.save(); g.translate(w / 2, h * .62); g.scale(-1, 1); g.font = 'bold 34px Arial'; g.textAlign = 'center'; g.fillStyle = 'rgba(0,0,0,.9)'; g.fillText('VOLTA', 0, 0); g.restore(); });
  const bafo = plano(.62, .42, new THREE.MeshBasicMaterial({ map: bafoTex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }), -.818, 1.24, .78, -Math.PI / 2, carro);
  const maoFora = plano(.11, .11, new THREE.MeshBasicMaterial({ map: maoTex('rgba(180,190,200,.75)'), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }), -.83, 1.3, .62, -Math.PI / 2, carro);
  let bafoK = 0;
  const hitBafo = box(.06, .36, .7, inv, -.86, 1.25, .8, carro, false);
  const itBafo = interact(hitBafo, () => '<b>E</b>Encostar o rosto no vidro de trás', () => {
    bafoK = 1; A.SFX.suspiro({ x: P.pos.x, y: 1.5, z: P.pos.z }); medo(8);
    if (!S.flags.s4_bafo) { S.flags.s4_bafo = true; agenda(1.2, () => { A.falar('s4_bafo'); A.conquista('s4_bafo'); }); }
  }, { on: () => !sent.on && S.flags.saiuCarro });
  itBafo.hold = 2;
  function tickBafo(dt) { if (bafoK <= 0) return; bafoK = Math.max(0, bafoK - dt / 7); bafo.material.opacity = Math.min(1, bafoK * 1.4); maoFora.material.opacity = bafoK > .5 ? 1 : bafoK * 2; }

  // =================================================================== A ESTRADA QUE DÁ A VOLTA
  const fogBase = fora.fog;
  const vt = { n: S.flags.s4_voltas || 0, feito: !!S.flags.s4_voltaFeita, prende: 0, avisou: false };
  const kmTex = (t1, t2, cor = '#1d4a2c') => tex(256, 128, (g, w, h) => { g.fillStyle = cor; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8e0d0'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = '#d8e0d0'; g.textAlign = 'center'; g.font = 'bold 54px Arial'; g.fillText(t1, w / 2, 70); g.font = '20px Arial'; g.fillText(t2, w / 2, 104); });
  cyl(.04, .04, 2.6, MAT.metal, 6.3, 1.3, 40, 6);
  plano(1.1, .55, new THREE.MeshStandardMaterial({ map: kmTex('KM 19', 'ESTRADA VELHA'), roughness: .8 }), 6.3, 2.3, 39.97, Math.PI);
  plano(1.1, .55, new THREE.MeshStandardMaterial({ map: kmTex('VOLTE', 'não tem mais estrada', '#4a1a14'), roughness: .8 }), 6.3, 2.3, 40.03, 0);
  // os sinais do carro nas voltas: mãozinhas no para-brisa por dentro e a "outra Lia" no banco
  const maosPara = plano(.9, .4, new THREE.MeshBasicMaterial({ map: tex(256, 112, (g, w, h) => { g.clearRect(0, 0, w, h); const m = (x, y, r) => { g.save(); g.translate(x, y); g.rotate(r); g.fillStyle = 'rgba(205,210,215,.6)'; g.beginPath(); g.ellipse(0, 0, 9, 11, 0, 0, 6.3); g.fill(); [[-8, -13], [-3, -17], [2, -18], [7, -15]].forEach(([fx, fy]) => { g.beginPath(); g.ellipse(fx, fy, 2.4, 9, 0, 0, 6.3); g.fill(); }); g.restore(); }; m(40, 60, -.2); m(90, 46, .1); m(150, 70, .3); m(210, 50, -.1); }), transparent: true, depthWrite: false, side: THREE.DoubleSide }), 0, 1.25, -.9, 0, carro);
  maosPara.visible = vt.n >= 2;
  const outra = new THREE.Group(); outra.position.set(-.38, .35, .05); carro.add(outra); outra.visible = false;
  const capa = new THREE.MeshStandardMaterial({ color: 0x5a4a14, roughness: .8 });
  cyl(.17, .24, .62, capa, 0, .55, 0, 8, outra); const cabO = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), capa); cabO.position.set(0, .96, .05); outra.add(cabO);
  function tickVolta(dt) {
    if (perseguindo() || sent.on) { if (fora.fog !== fogBase && vt.prende <= 0) fora.fog = lerp(fora.fog, fogBase, Math.min(1, dt * 2)); return; }
    const z = P.pos.z;
    if (vt.prende > 0) { vt.prende -= dt; fora.fog = .16; }
    else if (z > 48 && !vt.feito) fora.fog = lerp(fogBase, .16, clamp((z - 48) / 18, 0, 1));
    else if (fora.fog !== fogBase) fora.fog = lerp(fora.fog, fogBase, Math.min(1, dt * .9));
    if (vt.feito) { if (z > 72 && !vt.avisou) { vt.avisou = true; A.falar('s4_volta_nao'); } return; }
    if (z > 66) {
      if (vt.n >= 3) { vt.feito = S.flags.s4_voltaFeita = true; A.falar('s4_volta_fim'); return; }
      vt.n++; S.flags.s4_voltas = vt.n;
      if (semFlash()) { A.fade(true); setTimeout(() => A.fade(false), 220); } else U.relampago(1.1);
      P.pos.z = -6 - (z - 66); vt.prende = 1.4; fora.fog = .16; medo(10 + vt.n * 8);
      if (vt.n === 1) agenda(2, () => A.falar('s4_volta1'));
      if (vt.n === 2) { c.pol.porta(1, 0); maosPara.visible = true; S.flags.piscaParou = false; agenda(2, () => A.falar('s4_volta2')); vt.portaAberta = true; }
      if (vt.n === 3) { outra.visible = true; U.radioSozinho(); agenda(2.2, () => A.falar('s4_volta3')); }
    }
    if (vt.portaAberta && dist(carro.position.x - 1, carro.position.z) < 2.4) { vt.portaAberta = false; c.pol.porta(0, 0); }
    if (outra.visible && dist(carro.position.x - .38, carro.position.z) < 3) {
      outra.visible = false; vt.feito = S.flags.s4_voltaFeita = true;
      const tinha = S.flashOn; S.flashOn = false; agenda(1, () => { if (tinha && S.inv.lanterna) S.flashOn = true; });
      A.SFX.estatica(1.2, U.posRadio()); A.sub('radio', '(chiado) ...Li... a...'); medo(30); vibrar(.6, .3, 500);
      agenda(2.4, () => { A.conquista('s4_volta'); A.falar('s4_volta_fim'); });
    }
  }

  // =================================================================== ANDAR DE COSTAS (Ré)
  const re = { m: 0, yaw0: 0, ult: new THREE.Vector3().copy(P.pos), v: null, fase: 0, t: 0 };
  function tickRe2(dt) {
    const dp = P.pos.clone().sub(re.ult); re.ult.copy(P.pos);
    if (S.flags.s4_re || sent.on || P.bloqueado) return;
    const d = Math.hypot(dp.x, dp.z);
    if (re.fase === 0) {
      if (d > 1.2 || !P.room || P.room.id !== 'estrada') { re.m = 0; return; }
      if (d < .001) return;
      const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), dot = (dp.x * fx + dp.z * fz) / d;
      let dy = P.yaw - re.yaw0; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      if (dot < -.8 && (re.m === 0 || Math.abs(dy) < .55)) { if (re.m === 0) re.yaw0 = P.yaw; re.m += d; } else if (dot > -.3) re.m = 0;
      if (re.m > 40) { re.fase = 1; re.t = 0; re.v = c.novoVulto(); re.v.visible = true; }
    } else if (re.fase === 1) {
      re.t += dt; const lado = Math.sin(P.yaw) > 0 ? 1 : -1;
      const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw);
      re.v.position.set(P.pos.x - fz * 5.5 * lado + fx * .6, 0, P.pos.z + fx * 5.5 * lado + fz * .6); re.v.rotation.y = P.yaw; // de costas, igual a você
      if (olhando(re.v.position, .3, 12, 2.2) || re.t > 14) { re.fase = 2; re.t = 0; re.v.rotation.y = Math.atan2(P.pos.x - re.v.position.x, P.pos.z - re.v.position.z); medo(30); vibrar(.5, .3, 300); }
    } else if (re.fase === 2) {
      re.t += dt; if (re.t > .35) { re.v.visible = false; re.fase = 3; S.flags.s4_re = true; A.SFX.estalo(re.v.position, .7); agenda(1, () => { A.falar('s4_re'); A.conquista('s4_re'); }); }
    }
  }

  // =================================================================== A LANTERNA QUE FALA (S.O.S. e três piscadas)
  const lz = { ant: !!S.flashOn, ligou: 0, desligou: 0, p: [] }; // pulsos: { dur, gap }
  const OLHA_SOS = { x: -10, z: BZ + 5.2 }, OLHA_POSTO = { x: 9.6, z: -17 };
  function tickLanterna() {
    const on = !!S.flashOn, t = A.perf();
    if (on === lz.ant) return; lz.ant = on;
    if (on) { lz.gap = t - lz.desligou; lz.ligou = t; return; }
    lz.desligou = t; lz.p.push({ dur: t - lz.ligou, gap: lz.gap || 9, t }); if (lz.p.length > 9) lz.p.shift();
    checarSinais();
  }
  const curta = p => p.dur < .5, longa = p => p.dur >= .55 && p.dur < 2.6;
  function checarSinais() {
    const p = lz.p, n = p.length;
    // três piscadas rápidas para a luz do posto (de fora do posto)
    if (n >= 3 && !S.flags.s4_postoLuz && !S.flags.joaquimSumiu && P.room && P.room.id !== 'posto') {
      const u = p.slice(-3);
      if (u.every(curta) && u[1].gap < .8 && u[2].gap < .8 && olhando(OLHA_POSTO, .3, 40, 3.8)) respostaPosto();
    }
    // S.O.S. para o internato (perto do portão, olhando a fachada)
    if (n === 9 && !S.flags.s4_sos && P.pos.z < GZ + 30 && olhando(OLHA_SOS, .5, 70, 5.5)) {
      const ok = p.slice(0, 3).every(curta) && p.slice(3, 6).every(longa) && p.slice(6).every(curta) && p.slice(1).every(x => x.gap < 1.8) && p[8].t - p[0].t < 16;
      if (ok) respostaSOS();
    }
  }
  function respostaSOS() {
    S.flags.s4_sos = true; lz.p.length = 0; medo(20);
    agenda(1.5, () => {
      leg('s4_janela'); const seq = morseSeq('DAVI'); piscar(luzSOS, seq, () => {
        base.set(luzSOS, .35); piscar(silSOS, [[0, 2]], null, .9); A.falar('s4_sos'); A.conquista('s4_sos'); S.flags.s4_pilhaSOS = true; A.syncWorld();
        agenda(4.5, () => fala1('s4_sosPilhaF', 's4_sos_pilha'));
        filaJoaquim.push('sos');
      });
    });
  }
  item('s4_pilhaSOS', { x: 1.1, y: .05, z: GZ + .9 }, A.MK.pilha(), 'Pegar a pilha que rolou por baixo do portão', () => { S.inv.pilhas++; A.toast(`Pilha guardada. ${tecla('R')} para trocar.`); }, () => !!S.flags.s4_pilhaSOS);
  let postoResp = 0;
  function respostaPosto() {
    S.flags.s4_postoLuz = true; lz.p.length = 0;
    const quatro = noite() >= 2 && Math.random() < .3; postoResp = quatro ? 4 : 3;
    agenda(.9, () => { pisc.t = 0; pisc.n = postoResp; pisc.on = true; });
    agenda(3.6, () => { A.falar(quatro ? 's4_posto_luz4' : 's4_posto_luz'); A.conquista('s4_posto'); filaJoaquim.push('luz'); });
  }
  const pisc = { on: false, t: 0, n: 3 };
  function tickNeon(dt) { // roda depois do tick do neon (mapas.js): a resposta manda na luz durante as piscadas
    if (!pisc.on) return; pisc.t += dt; const k = pisc.t / .55, i = Math.floor(k);
    if (i >= pisc.n) { pisc.on = false; return; }
    const aceso = (k - i) < .5; c.luzNeon.intensity = aceso ? 9 : .05; c.neon.material.emissiveIntensity = aceso ? 3 : .05;
  }

  // =================================================================== O SEU JOAQUIM COMENTA
  const filaJoaquim = [];
  let joaqT = 0;
  function tickJoaquim(dt) {
    joaqT -= dt; if (!filaJoaquim.length || joaqT > 0 || S.flags.joaquimSumiu) return;
    if (dist(18.2, -17.2) > 3.4 || (J() && J().ui)) return;
    const k = filaJoaquim.shift(); joaqT = 7; A.sub('joaquim', TX4.joaquim[k]);
    if (k === 'luz') { S.inv.pilhas++; A.toast(`Ele te deu uma pilha. ${tecla('R')} para trocar.`); A.SFX.pegar(); }
  }

  // =================================================================== O POSTO
  // pote de balas de 1979 no balcão
  const vidroPote = new THREE.MeshStandardMaterial({ color: 0xa8c0c0, roughness: .05, transparent: true, opacity: .35 });
  const pote = cyl(.065, .065, .16, vidroPote, 16.42, 1.125, -17.95, 12); cyl(.07, .07, .025, MAT.metal, 16.42, 1.215, -17.95, 12);
  for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 4), new THREE.MeshStandardMaterial({ color: [0xc0302a, 0xe0b020, 0x30a040, 0xe07090][i % 4], roughness: .4 })); b.position.set(16.42 + (Math.random() - .5) * .07, 1.07 + Math.random() * .08, -17.95 + (Math.random() - .5) * .07); grupo.add(b); }
  interact(pote, () => S.flags.s4_bala ? 'Um pote de balas de goma. De 1979.' : '<b>E</b>Pegar uma bala do pote', () => { if (S.flags.s4_bala) return; S.flags.s4_bala = true; A.SFX.clique(); A.falar('s4_bala'); filaJoaquim.push('bala'); });
  // a bala no banco do ponto de ônibus (some quando você não está olhando)
  const balaBanco = new THREE.Mesh(new THREE.SphereGeometry(.025, 6, 4), new THREE.MeshStandardMaterial({ color: 0xc0302a, roughness: .4 })); balaBanco.position.set(-6.6, .52, -16.75); grupo.add(balaBanco); balaBanco.visible = false;
  const hitBanco = box(.4, .2, .4, inv, -6.6, .55, -16.7, grupo, false);
  interact(hitBanco, () => '<b>E</b>Deixar a bala de goma no banco', () => { S.flags.s4_balaDada = true; balaBanco.visible = true; A.SFX.clique(); }, { on: () => S.flags.s4_bala && !S.flags.s4_balaDada });
  let balaT = 0;
  function tickBala(dt) {
    if (!balaBanco.visible || S.flags.s4_balaSumiu) return;
    balaT += dt; if (balaT < 2 || olhando(balaBanco.position, .7, 30, .5)) return;
    S.flags.s4_balaSumiu = true; balaBanco.visible = false; SX.voz({ x: -6.6, y: .8, z: -16.7 }, 2, 560); leg('s4_risadinha');
    agenda(1.5, () => { A.falar('s4_bala_some'); A.toast('No lugar da bala, um papel dobrado: "OBRIGADA. ELE DORME NO BARRANCO. VAI AGACHADA E SEM LUZ."'); A.conquista('s4_doce'); });
  }
  // máquina de chiclete (a moeda do cinzeiro do carro)
  const maq = new THREE.Group(); maq.position.set(14.0, 0, -13.62); grupo.add(maq);
  const vermelho = new THREE.MeshStandardMaterial({ color: 0x8a1a14, roughness: .5, metalness: .3 });
  cyl(.05, .07, .8, MAT.metal, 0, .4, 0, 8, maq); box(.3, .26, .26, vermelho, 0, .93, 0, maq);
  const globo = new THREE.Mesh(new THREE.SphereGeometry(.17, 14, 10), vidroPote); globo.position.y = 1.22; maq.add(globo);
  for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 4), new THREE.MeshStandardMaterial({ color: [0x202020, 0xd0a020, 0xc03030, 0x3060c0][i % 4], roughness: .5 })); b.position.set((Math.random() - .5) * .2, 1.13 + Math.random() * .14, (Math.random() - .5) * .2); maq.add(b); }
  const manivela = box(.12, .02, .02, MAT.metal, 0, .95, .14, maq);
  A.addCollider(13.82, 14.18, -13.8, -13.44);
  let girando = 0;
  interact(maq.children[1], () => S.flags.s4_chiclete ? 'A máquina de chiclete. Vazia de sorte, por hoje.' : S.flags.s4_moeda ? '<b>E</b>Pôr a moeda e girar a manivela' : 'Uma máquina de chiclete empoeirada. Aceita moeda de cruzeiro.', () => {
    if (S.flags.s4_chiclete || !S.flags.s4_moeda) return;
    S.flags.s4_chiclete = true; girando = 1.2; SOM.engrenagem({ x: 14, y: 1, z: -13.6 });
    const sorte = TX4.sortes[(noite() * 7 + (S.code ? S.code[0] : 0)) % TX4.sortes.length];
    agenda(1.4, () => { A.SFX.pegar(); A.toast(`Cai uma bolinha preta, queimada. Dentro, um anelzinho de plástico com a letra D e um papel: "${sorte}"`); agenda(3.5, () => A.falar('s4_chiclete')); });
  });
  // gato magro dormindo em cima da bomba (carinho devagar; correr perto assusta)
  const gato = new THREE.Group(); gato.position.set(9.6, 1.5, -15); gato.rotation.y = .6; grupo.add(gato);
  const pelo = new THREE.MeshStandardMaterial({ color: 0x141210, roughness: 1 });
  const corpoG = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), pelo); corpoG.scale.set(1, .6, 1.5); corpoG.position.y = .1; gato.add(corpoG);
  const cabG = new THREE.Group(); cabG.position.set(0, .14, .2); gato.add(cabG);
  cabG.add(new THREE.Mesh(new THREE.SphereGeometry(.075, 10, 8), pelo));
  for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.ConeGeometry(.03, .07, 4), pelo); o.position.set(s * .04, .07, 0); cabG.add(o); }
  const olhoMat = new THREE.MeshBasicMaterial({ color: 0x8aff70, transparent: true, opacity: 0 });
  for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 4), olhoMat); o.position.set(s * .03, .015, .065); cabG.add(o); }
  const rabo = new THREE.Mesh(new THREE.TorusGeometry(.13, .018, 5, 10, Math.PI), pelo); rabo.position.set(0, .05, -.15); rabo.rotation.x = Math.PI / 2; gato.add(rabo);
  const gt = { estado: S.flags.s4_gatoFugiu ? 'fugiu' : S.flags.s4_gato ? 'segue' : 'dorme', t: 0, chiaT: 0, miaT: 0, fugaT: 0 };
  if (gt.estado === 'fugiu') gato.visible = false;
  if (gt.estado === 'segue') gato.position.set(P.pos.x + 2, 0, P.pos.z + 2);
  const devagar = () => P.crouch || P.devagar;
  interact(corpoG, () => gt.estado !== 'dorme' ? '' : devagar() ? '<b>E</b>Fazer carinho no gato' : 'Um gato magro dormindo em cima da bomba. Chega devagar.', () => {
    if (gt.estado !== 'dorme' || !devagar()) return;
    S.flags.s4_gato = true; gt.estado = 'acorda'; gt.t = 0; SOM.ronrono({ x: 9.6, y: 1.6, z: -15 }, 3.2);
    agenda(1, () => A.falar('s4_gato')); agenda(3.4, () => A.conquista('s4_gato')); filaJoaquim.push('gato');
  }, { on: () => gt.estado === 'dorme' });
  function tickGato(dt) {
    const t = A.perf();
    olhoMat.opacity = luzAcesa() && olhando(gato.position, .25, 14, gato.position.y + .2) ? .95 : (gt.estado === 'dorme' ? 0 : .15);
    if (gt.estado === 'dorme') {
      corpoG.scale.y = .6 + Math.sin(t * 2.2) * .03;
      if (P.sprinting && dist(9.6, -15) < 4.5) { gt.estado = 'foge'; gt.t = 0; S.flags.s4_gatoFugiu = true; SOM.chiado({ x: 9.6, y: 1.6, z: -15 }); }
      return;
    }
    if (gt.estado === 'foge') { gt.t += dt; gato.position.x += dt * 7; gato.position.y = Math.max(0, gato.position.y - dt * 4); gato.rotation.y = Math.PI / 2; if (gt.t > 2.2) { gato.visible = false; gt.estado = 'fugiu'; } return; }
    if (gt.estado === 'acorda') { gt.t += dt; cabG.rotation.x = -.3; if (gt.t > 3.4) { gt.estado = 'segue'; gato.position.y = 0; } return; }
    if (gt.estado === 'segue') {
      if (S.done.abrir_portao || S.mapa !== 'estrada') { gt.estado = 'portao'; gato.position.set(1.4, 0, GZ + 1.2); gato.rotation.y = Math.PI; agenda(1.5, () => fala1('s4_gatoPortaoF', 's4_gato_portao')); return; }
      const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), ax = P.pos.x - fx * 3.2 + fz * 1.2, az = P.pos.z - fz * 3.2 - fx * 1.2;
      const dx = ax - gato.position.x, dz = az - gato.position.z, d = Math.hypot(dx, dz);
      if (d > 25) gato.position.set(ax, 0, az);
      else if (d > .4) { const v = Math.min(d, (d > 4 ? 6 : 2.6) * dt); gato.position.x += dx / d * v; gato.position.z += dz / d * v; gato.rotation.y = Math.atan2(dx, dz); gato.position.y = Math.abs(Math.sin(t * 12)) * .03; }
      // radar vivo: chia e arrepia para o lado do vulto
      const ameaca = (c.v && c.v.visible) ? c.v.position : perseguindo() ? { x: P.pos.x, z: P.pos.z + 12 } : null;
      gt.chiaT -= dt; gt.miaT -= dt;
      if (ameaca) { gato.rotation.y = Math.atan2(ameaca.x - gato.position.x, ameaca.z - gato.position.z); corpoG.scale.y = .8; if (gt.chiaT <= 0) { gt.chiaT = 3.5; SOM.chiado({ x: gato.position.x, y: .3, z: gato.position.z }); if (!S.flags.s4_gatoChiou) { S.flags.s4_gatoChiou = true; agenda(1, () => A.falar('s4_gato_chia')); } } }
      else corpoG.scale.y = .6;
      if (P.sprinting && gt.miaT <= 0) { gt.miaT = 4; SOM.miado({ x: gato.position.x, y: .3, z: gato.position.z }); A.emitNoise(gato.position.x, gato.position.z, 4); }
    }
  }
  // contador da bomba de gasolina: 20,0 L correndo para trás até 14,03
  const contCv = document.createElement('canvas'); contCv.width = 128; contCv.height = 48; const contG = contCv.getContext('2d');
  const contTex = new THREE.CanvasTexture(contCv); contTex.colorSpace = THREE.SRGBColorSpace;
  const desenhaCont = v => { contG.fillStyle = '#0c0c0a'; contG.fillRect(0, 0, 128, 48); contG.fillStyle = '#e8d8a0'; contG.font = 'bold 30px monospace'; contG.textAlign = 'right'; contG.fillText(v.toFixed(2).replace('.', ','), 104, 34); contG.font = '14px monospace'; contG.fillText('L', 122, 34); contTex.needsUpdate = true; };
  desenhaCont(S.flags.s4_bomba ? 14.03 : 20);
  plano(.3, .11, new THREE.MeshBasicMaterial({ map: contTex }), 9.349, 1.36, -19, -Math.PI / 2);
  const gatilho = box(.08, .22, .08, MAT.preto, 9.33, .95, -18.85);
  let contK = -1;
  interact(gatilho, () => S.flags.s4_bomba ? 'O contador parou em 14,03.' : '<b>E</b>Apertar o gatilho da bomba', () => { if (S.flags.s4_bomba) return; S.flags.s4_bomba = true; contK = 0; SOM.engrenagem({ x: 9.4, y: 1.2, z: -19 }); });
  function tickBomba(dt) {
    if (contK < 0) return; contK = Math.min(1, contK + dt / 2.4); desenhaCont(lerp(20, 14.03, contK * contK * (3 - 2 * contK)));
    if (contK >= 1) { contK = -1; pisc.t = 0; pisc.n = 2; pisc.on = true; agenda(1, () => fala1('s4_bombaF', 's4_bomba')); }
  }
  // caixa de correio com as cartas devolvidas (e uma carta dela, de amanhã)
  cyl(.04, .04, 1.1, MAT.madeiraEsc, 7.75, .55, -10.6, 6);
  const caixa = box(.3, .24, .42, new THREE.MeshStandardMaterial({ color: 0x2a4a5a, roughness: .7, metalness: .3 }), 7.75, 1.2, -10.6);
  interact(caixa, () => `<b>E</b>${S.notes.s4_carta ? 'Ler de novo as cartas da caixa de correio' : 'Abrir a caixa de correio'}`, () => { A.SFX.rangido(7.75, 1.2, -10.6, .3); A.lerNota('s4_carta'); medo(6); });
  // poço seco atrás da loja: cada noite o balde traz outra coisa
  const PX = 22.2, PZ = -18.5;
  const tijolo = A.texMat('pedra', 2, .6);
  const aro = new THREE.Mesh(new THREE.CylinderGeometry(.7, .75, .8, 14, 1, true), tijolo); aro.material.side = THREE.DoubleSide; aro.position.set(PX, .4, PZ); grupo.add(aro);
  const fundo = new THREE.Mesh(new THREE.CircleGeometry(.68, 14), MAT.preto); fundo.rotation.x = -Math.PI / 2; fundo.position.set(PX, .3, PZ); grupo.add(fundo);
  for (const s of [-1, 1]) cyl(.05, .05, 1.8, MAT.madeiraEsc, PX + s * .75, .9, PZ, 6);
  cyl(.04, .04, 1.6, MAT.madeiraEsc, PX, 1.75, PZ, 6).rotation.z = Math.PI / 2;
  const corda = cyl(.008, .008, 1, MAT.tronco, PX, 1.25, PZ, 4);
  const balde = cyl(.13, .1, .22, MAT.metal, PX, .85, PZ, 10);
  const maoPoco = new THREE.Group(); maoPoco.position.set(PX + .12, .72, PZ); grupo.add(maoPoco); maoPoco.visible = false;
  for (let i = 0; i < 4; i++) box(.018, .07, .018, pele, -.04 + i * .025, .03, 0, maoPoco, false);
  box(.08, .05, .03, pele, 0, -.02, 0, maoPoco, false);
  A.addCollider(PX - .8, PX + .8, PZ - .8, PZ + .8);
  let baldeK = -1;
  const itPoco = interact(balde, () => S.flags.s4_poco ? 'O balde, molhado. Melhor não puxar de novo hoje.' : '<b>E</b>Descer e puxar o balde do poço', () => {
    if (S.flags.s4_poco) return; S.flags.s4_poco = true; baldeK = 0; A.SFX.rangido(PX, 1.5, PZ, .5); leg('s4_balde');
  });
  Object.defineProperty(itPoco, 'hold', { get: () => (S.flags.s4_poco ? 0 : 4) });
  function tickPoco(dt) {
    if (baldeK < 0) return; baldeK += dt / 1.6; balde.position.y = .85 - Math.sin(Math.min(1, baldeK) * Math.PI) * .5; corda.scale.y = 1 + Math.sin(Math.min(1, baldeK) * Math.PI) * .5; corda.position.y = 1.75 - corda.scale.y * .5;
    if (baldeK >= 1) {
      baldeK = -1; const nPuxou = (mem4().pocoN || 0) + 1; mem4Set('pocoN', nPuxou);
      if (nPuxou >= 3 && !mem4().pocoMao) { mem4Set('pocoMao', 1); maoPoco.visible = true; balde.position.y = .7; A.SFX.rangido(PX, 1.2, PZ, .9); medo(45); vibrar(.8, .6, 600); agenda(.6, () => { maoPoco.visible = false; balde.position.y = .85; }); agenda(1.2, () => { A.falar('s4_poco_mao'); A.conquista('s4_poco'); }); }
      else A.toast(TX4.poco[noite() % TX4.poco.length]);
    }
  }
  // binóculo na mureta do fundo do pátio, apontado para o internato (com a cadeira de balanço vazia)
  box(.9, .9, .3, concreto, 12.0, .45, -25.62); A.addCollider(11.55, 12.45, -25.77, -25.47);
  const bin = new THREE.Group(); bin.position.set(12.0, .96, -25.62); grupo.add(bin);
  for (const s of [-1, 1]) { const t = cyl(.035, .035, .16, MAT.preto, s * .045, .02, 0, 10, bin); t.rotation.x = Math.PI / 2; }
  const cadeira = new THREE.Group(); cadeira.position.set(13.25, 0, -25.0); cadeira.rotation.y = Math.PI; grupo.add(cadeira);
  box(.48, .05, .46, MAT.madeiraEsc, 0, .46, 0, cadeira); box(.48, .7, .05, MAT.madeiraEsc, 0, .85, -.22, cadeira);
  for (const s of [-1, 1]) { const arco = new THREE.Mesh(new THREE.TorusGeometry(.42, .02, 4, 12, 1.4), MAT.madeiraEsc); arco.rotation.y = Math.PI / 2; arco.rotation.z = -Math.PI / 2 - .7; arco.position.set(s * .2, .45, 0); cadeira.add(arco); }
  const bn = { on: false, t: 0, ciclo: 0, viu: false, prevFlash: false };
  const vinheta = document.createElement('div'); vinheta.id = 's4-binoculo'; vinheta.hidden = true;
  vinheta.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:30;background:radial-gradient(circle at 38% 50%, transparent 0 22%, #000 23%) , radial-gradient(circle at 62% 50%, transparent 0 22%, #000 23%);background-blend-mode:darken';
  document.body.appendChild(vinheta);
  if (!document.getElementById('css-s4')) { const st = document.createElement('style'); st.id = 'css-s4'; st.textContent = '#s4-binoculo[hidden]{display:none!important}'; document.head.appendChild(st); }
  interact(bin, () => '<b>E</b>Olhar pelo binóculo', () => binoculo(true), { on: () => !bn.on });
  function binoculo(liga) {
    if (liga === bn.on) return; bn.on = liga;
    vinheta.hidden = !liga; P.bloqueado = liga; P.zoomFov = liga ? 12 : 0;
    luzTorre.material.depthTest = !liga;
    if (liga) {
      bn.t = 0; bn.prevFlash = S.flashOn; S.flashOn = false; A.SFX.clique();
      P.pos.set(12.0, 0, -25.2); P.h = 1.18;
      const dx = 0 - P.pos.x, dz = BZ + 7 - P.pos.z; P.yaw = Math.atan2(-dx, -dz); P.pitch = Math.atan2(12.2 - 1.18, Math.hypot(dx, dz));
      bn.yaw0 = P.yaw; bn.pitch0 = P.pitch;
      if (!S.flags.s4_binDica) { S.flags.s4_binDica = true; A.toast(`${tecla('E')} de novo para baixar o binóculo.`); }
    } else { P.h = 1.62; P.pos.set(12.0, 0, -24.6); if (bn.prevFlash && S.inv.lanterna) S.flashOn = true; }
  }
  function seqDigitos() { // os quatro números do cofre da noite, em grupos de piscadas (0 = dez piscadas)
    const seq = []; let t = .6; for (const d of (S.code || [1, 2, 3, 4])) { const n = d || 10; for (let i = 0; i < n; i++) { seq.push([t, .28]); t += .56; } t += 1.6; }
    return { seq, dur: t + 1.4 };
  }
  function tickBinoculo(dt) {
    if (!bn.on) return;
    if (!livre()) return;
    bn.t += dt; const tr = .0025 * (1 + S.fear / 60);
    P.yaw += (Math.random() - .5) * tr; P.pitch += (Math.random() - .5) * tr; // mão tremendo
    if (bn.ciclo <= 0) { const s = seqDigitos(); piscar(luzTorre, s.seq, null, .9); bn.ciclo = s.dur; bn.cicloIni = bn.t; }
    bn.ciclo -= dt;
    if (bn.ciclo <= 0 && !bn.viu && bn.t - bn.cicloIni > 8) { bn.viu = true; if (!S.flags.s4_pisca) { S.flags.s4_pisca = true; agenda(.5, () => { A.falar('s4_binoculo'); A.conquista('s4_pisca'); }); } }
  }
  // porão do rádio do Seu Joaquim, debaixo do tapete atrás do balcão (agachada)
  const tapete = plano(1.0, 1.2, new THREE.MeshStandardMaterial({ map: tex(128, 160, (g, w, h) => { g.fillStyle = '#5a2018'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c8a060'; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20); for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#8a4a20' : '#2a3a5a'; g.fillRect(24, 26 + i * 18, w - 48, 8); } }), roughness: 1 }), 18.7, .008, -19.5, 0);
  tapete.rotation.x = -Math.PI / 2;
  const ponta = box(.3, .03, .2, new THREE.MeshStandardMaterial({ color: 0x5a2018, roughness: 1 }), 19.1, .04, -18.98); ponta.rotation.x = .4;
  const buraco = box(.7, .01, .7, MAT.preto, 18.7, .006, -19.5); buraco.visible = false;
  const brilhoVerde = plano(.22, .1, new THREE.MeshBasicMaterial({ color: 0x40ff70, transparent: true, opacity: .55 }), 18.55, .012, -19.6, 0); brilhoVerde.rotation.x = -Math.PI / 2; brilhoVerde.visible = false;
  const tampaG = new THREE.Group(); tampaG.position.set(18.7, .01, -19.85); grupo.add(tampaG); tampaG.visible = false;
  box(.72, .04, .72, MAT.madeiraEsc, 0, .02, .36, tampaG, false);
  const luzPorao = new THREE.PointLight(0x50ff80, 0, 2.2, 1.6); luzPorao.position.set(18.7, .3, -19.5); grupo.add(luzPorao);
  const porao = { aberto: !!S.flags.s4_porao, radio: false };
  const abrirPorao = inst => { porao.aberto = true; buraco.visible = brilhoVerde.visible = tampaG.visible = true; tapete.position.x = 19.5; ponta.visible = false; tampaG.rotation.x = inst ? -1.9 : 0; luzPorao.intensity = .8; };
  if (porao.aberto) abrirPorao(true);
  const itTap = interact(ponta, () => porao.aberto ? '' : P.crouch ? '<b>E</b>Levantar o tapete' : 'A ponta do tapete está levantada.', () => {
    if (porao.aberto) return; if (!P.crouch) { A.toast(`Teria que agachar (${tecla('C')}).`); return; }
    S.flags.s4_porao = true; abrirPorao(false); A.SFX.rangido(18.7, .2, -19.5, .7); leg('s4_radioPorao'); A.conquista('s4_porao');
    agenda(.8, () => A.falar(S.flags.joaquimSumiu ? 's4_porao_abre' : 's4_porao_joaquim'));
  }, { on: () => !porao.aberto });
  Object.defineProperty(itTap, 'hold', { get: () => (!porao.aberto && P.crouch ? 1.5 : 0) });
  const hitRadio = box(.3, .2, .3, inv, 18.55, .1, -19.6, grupo, false);
  interact(hitRadio, () => '<b>E</b>Ligar o rádio lá embaixo', () => {
    if (porao.radio) return; porao.radio = true; A.SFX.estatica(1.6, { x: 18.6, y: -.2, z: -19.5 }); leg('s4_radioPorao');
    agenda(1.4, () => A.sub('joaquim', '(no rádio, chiado) Serra pra qualquer estação... Serra pra qualquer estação... alguém subiu hoje?'));
    agenda(6.5, () => A.sub('joaquim', S.flags.joaquimSumiu ? '(chiado) ...se alguém ouvir... a moça subiu. Desta vez eu deixei o portão destrancado.' : '(chiado) ...é a minha voz. De hoje. Mas eu tô sentado aqui.'));
    agenda(12, () => { porao.radio = false; });
  }, { on: () => porao.aberto });
  const hitMapa = box(.3, .2, .3, inv, 18.9, .1, -19.3, grupo, false);
  interact(hitMapa, () => `<b>E</b>${S.notes.s4_mapa ? 'Olhar de novo o mapa com alfinetes' : 'Puxar o mapa com alfinetes'}`, () => A.lerNota('s4_mapa'), { on: () => porao.aberto });
  const hitMorse = box(.25, .2, .2, inv, 18.7, .1, -19.8, grupo, false);
  interact(hitMorse, () => `<b>E</b>${S.notes.s4_morse ? 'Ler de novo a tabela da escada' : 'Ler a tabela pregada na escada'}`, () => A.lerNota('s4_morse'), { on: () => porao.aberto });
  function tickPorao(dt) { if (porao.aberto && tampaG.rotation.x > -1.9) tampaG.rotation.x = Math.max(-1.9, tampaG.rotation.x - dt * 2.4); if (porao.aberto) brilhoVerde.material.opacity = .4 + Math.sin(A.perf() * 3) * .15; }

  // =================================================================== A ESTRADA
  // marco 79, caído no mato atrás do carro: levantar abre a névoa e mostra o internato aceso, como em 1979
  const marco79 = new THREE.Group(); marco79.position.set(5.9, 0, 31); grupo.add(marco79);
  const m79 = new THREE.Group(); marco79.add(m79);
  box(.3, .72, .18, concreto, 0, .36, 0, m79);
  plano(.28, .46, new THREE.MeshStandardMaterial({ map: tex(96, 160, (g, w, h) => { g.fillStyle = '#c8c4b8'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, 44); g.fillStyle = '#e8e4d8'; g.font = 'bold 24px Arial'; g.textAlign = 'center'; g.fillText('KM', w / 2, 32); g.fillStyle = '#1a1a1a'; g.font = 'bold 54px Arial'; g.fillText('79', w / 2, 112); g.fillStyle = 'rgba(40,70,30,.6)'; for (let i = 0; i < 30; i++) g.fillRect(Math.random() * w, 60 + Math.random() * 100, 6, 3); }), roughness: 1 }), -.16, .42, 0, -Math.PI / 2, m79);
  const levantado = () => !!S.flags.s4_km79;
  const poseMarco = k => { m79.rotation.z = lerp(Math.PI / 2 - .1, 0, k); m79.position.set(lerp(.36, 0, k), lerp(.12, 0, k), 0); };
  poseMarco(levantado() ? 1 : 0);
  const mato = new THREE.MeshStandardMaterial({ color: 0x1e2a16, roughness: 1 });
  for (let i = 0; i < 7; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(.12, .5, 4), mato); t.position.set(5.6 + Math.random() * .8, .22, 30.5 + Math.random() * 1); t.rotation.z = (Math.random() - .5) * .5; grupo.add(t); }
  let marcoK = levantado() ? 1 : 0, km79T = -1;
  const itMarco = interact(m79, () => levantado() ? 'KM 79. Não devia ter um 79 nessa contagem.' : '<b>E</b>Levantar o marco caído no mato', () => {
    if (levantado()) return; S.flags.s4_km79 = true; marcoK = .001; A.SFX.arrastar(); km79T = 0;
  });
  Object.defineProperty(itMarco, 'hold', { get: () => (levantado() ? 0 : 2) });
  const janelas79 = [];
  const mat79 = semNevoa(0xffc880, 0);
  for (let i = -6; i <= 6; i++) for (const y of [2, 5.5]) { const p = plano(1.3, 1.5, mat79, i * 5, y, BZ + 5.19, 0); p.visible = false; janelas79.push(p); }
  const pijama = crianca(new THREE.MeshStandardMaterial({ color: 0xc8c0d8, roughness: .9 }), false); grupo.add(pijama);
  function tickMarco(dt) {
    if (marcoK > 0 && marcoK < 1) { marcoK = Math.min(1, marcoK + dt * 1.5); poseMarco(marcoK); }
    if (km79T < 0) return;
    km79T += dt; const t = km79T;
    if (t < 4.2) { fora.fog = lerp(fora.fog, .012, Math.min(1, dt * 3)); vt.prende = .2; }
    if (t > .5 && !janelas79[0].visible) { janelas79.forEach(p => { p.visible = true; }); SOM.festa({ x: 0, y: 4, z: BZ + 6 }); A.falar('s4_km79'); }
    mat79.opacity = t < 4.4 ? Math.min(.85, (t - .5) * 1.5) : Math.max(0, .85 - (t - 4.4) * 3);
    if (t > 1.6 && t < 3.6) { if (!pijama.visible) { pijama.visible = true; pijama.position.set(-6.5, 0, 20); } pijama.position.x += dt * 6.5; pijama.rotation.y = Math.PI / 2; pijama.position.y = Math.abs(Math.sin(t * 14)) * .05; if (pijama.position.x > 6.5) pijama.visible = false; }
    else pijama.visible = false;
    if (t > 4.4 && !S.flags.s4_km79Raio) { S.flags.s4_km79Raio = true; U.relampago(1.2); A.SFX.trovao(); }
    if (t > 5) { km79T = -1; janelas79.forEach(p => { p.visible = false; }); agenda(.8, () => { A.falar('s4_km79_fim'); A.conquista('s4_km79'); }); }
  }
  // pegadas pequenas que só aparecem no relâmpago, até um tronco oco com a fita de teste do Davi
  const pegTex = tex(32, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(20,14,8,.85)'; g.beginPath(); g.ellipse(16, 40, 8, 16, 0, 0, 6.3); g.fill(); for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(9 + i * 3.6, 18 - Math.abs(i - 1.5) * 2, 2.4, 0, 6.3); g.fill(); } });
  const pegMat = new THREE.MeshBasicMaterial({ map: pegTex, transparent: true, opacity: 0, depthWrite: false });
  for (let i = 0; i < 18; i++) { const k = i / 17, x = lerp(-4.4, -6.1, k) + (i % 2 ? .12 : -.12), z = lerp(13.5, 30.5, k); const p = plano(.12, .22, pegMat, x, .012 + i * .0002, z, 0); p.rotation.x = -Math.PI / 2; p.rotation.z = Math.atan2(-1.7, 17) + Math.PI; }
  const oco = new THREE.Mesh(new THREE.CylinderGeometry(.34, .38, 1.6, 10, 1, true), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 1, side: THREE.DoubleSide }));
  oco.rotation.x = Math.PI / 2; oco.position.set(-6.25, .34, 31.6); grupo.add(oco);
  A.addCollider(-6.7, -5.8, 30.8, 32.4);
  const fitaTeste = A.ITENS.gravador('s4_fteste', { x: -6.25, y: .08, z: 31.15 });
  function tickPegadas() { pegMat.opacity = Math.min(.9, U.raio() * 2.2) * (P.pos.z > 8 ? 1 : 0); }
  void fitaTeste;
  // pipa presa no poste, com a linha pendendo até a mão
  const pipaTex = tex(128, 128, (g, w, h) => { g.fillStyle = '#e8e0c8'; g.beginPath(); g.moveTo(64, 0); g.lineTo(128, 56); g.lineTo(64, 128); g.lineTo(0, 56); g.closePath(); g.fill(); g.strokeStyle = '#6a5a40'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#c03028'; g.font = 'bold 22px Arial'; g.textAlign = 'center'; g.fillText('LIA', 64, 54); g.fillText('VOA', 64, 80); g.strokeStyle = 'rgba(80,60,30,.4)'; for (let y = 10; y < 120; y += 9) { g.beginPath(); g.moveTo(10, y); g.lineTo(118, y); g.stroke(); } });
  const pipa = plano(.62, .62, new THREE.MeshStandardMaterial({ map: pipaTex, roughness: .9, side: THREE.DoubleSide, transparent: true, alphaTest: .1 }), 6.05, 5.15, 22, -Math.PI / 2 + .3);
  const rabiola = []; for (let i = 0; i < 6; i++) rabiola.push(box(.06, .02, .06, new THREE.MeshStandardMaterial({ color: [0xc03028, 0xe0b020, 0x3060c0][i % 3] }), 6.05, 4.7 - i * .22, 22.1));
  const linha = cyl(.004, .004, 3.6, MAT.preto, 5.98, 3.1, 22.25, 4);
  const hitLinha = box(.14, .5, .14, inv, 5.98, 1.35, 22.25, grupo, false);
  let pipaK = S.flags.s4_pipa ? 1 : -1;
  const posePipa = () => { if (pipaK < 0) return; const k = Math.min(1, pipaK); pipa.position.set(lerp(6.05, 5.5, k), lerp(5.15, .04, k * k), lerp(22, 22.7, k)); pipa.rotation.set(k >= 1 ? -Math.PI / 2 : k * 9, -Math.PI / 2 + .3, 0); rabiola.forEach((r, i) => { r.position.set(pipa.position.x + .1 + (k >= 1 ? i * .2 : 0), Math.max(.02, pipa.position.y - (k >= 1 ? 0 : .45 + i * .22)), pipa.position.z + .1); }); linha.visible = false; };
  posePipa();
  const itLinha = interact(hitLinha, () => '<b>E</b>Puxar a linha da pipa, devagar', () => { if (pipaK >= 0) return; pipaK = 0; S.flags.s4_pipa = true; A.SFX.estalo({ x: 6.2, z: 22 }, .5); }, { on: () => pipaK < 0 });
  itLinha.hold = 3; itLinha.ruido = 3;
  interact(pipa, () => pipaK >= 1 ? `<b>E</b>${S.notes.s4_pipa ? 'Olhar de novo a pipa' : 'Pegar a pipa caída'}` : '', () => { if (pipaK < 1) return; A.lerNota('s4_pipa'); fala1('s4_pipaF', 's4_pipa'); }, { on: () => pipaK >= 1 });
  function tickPipa(dt) { const t = A.perf(); if (pipaK < 0) { pipa.rotation.z = Math.sin(t * 1.7) * .15; rabiola.forEach((r, i) => { r.position.x = 6.05 + Math.sin(t * 2 + i * .6) * .05 * (i + 1); }); return; } if (pipaK < 1) { pipaK += dt / 1.4; posePipa(); } }
  // manilha de concreto na vala: três mochilas de anos diferentes e uma respiração lá no fundo
  const manilha = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, 1.8, 14, 1, true), new THREE.MeshStandardMaterial({ map: concreto.map, color: 0x9a968a, roughness: 1, side: THREE.DoubleSide }));
  manilha.rotation.z = Math.PI / 2; manilha.position.set(-6.95, .42, 44); grupo.add(manilha);
  const breu = new THREE.Mesh(new THREE.CircleGeometry(.48, 14), MAT.preto); breu.rotation.y = Math.PI / 2; breu.position.set(-7.6, .42, 44); grupo.add(breu);
  [[0x3a5a8a, -6.4], [0x8a3a3a, -6.7], [0x5a6a3a, -7.0]].forEach(([cor, x]) => box(.18, .22, .26, new THREE.MeshStandardMaterial({ color: cor, roughness: .9 }), x, .1, 44 + (Math.random() - .5) * .2));
  A.addCollider(-7, -6.05, 43.45, 44.55);
  const hitManilha = box(.1, .8, .9, inv, -6.0, .42, 44, grupo, false);
  interact(hitManilha, () => P.crouch ? `<b>E</b>${S.notes.s4_manilha ? 'Olhar de novo dentro da manilha' : 'Olhar dentro da manilha'}` : 'Uma manilha de concreto na vala. Só agachada pra olhar dentro.', () => {
    if (!P.crouch) { A.toast(`Agacha (${tecla('C')}) para olhar dentro.`); return; }
    A.lerNota('s4_manilha'); SX.respiracao({ x: -8.6, y: .4, z: 44 }); if (fala1('s4_manilhaF', 's4_manilha')) medo(14);
  });
  // placas amarelas de escola: três crianças, duas, uma... e um homem alto (a lanterna desfaz)
  const desenhaEscola = n => (g, w, h) => { g.fillStyle = '#d8b020'; g.save(); g.translate(w / 2, h / 2); g.rotate(Math.PI / 4); g.fillRect(-w * .34, -h * .34, w * .68, h * .68); g.strokeStyle = '#1a1a10'; g.lineWidth = 5; g.strokeRect(-w * .31, -h * .31, w * .62, h * .62); g.restore(); g.fillStyle = '#1a1a10'; const fig = (x, alt) => { g.fillRect(x - 5, h * .72 - alt, 10, alt * .8); g.beginPath(); g.arc(x, h * .72 - alt - 7, 7, 0, 6.3); g.fill(); }; if (n === 'homem') { g.fillRect(w / 2 - 6, h * .24, 12, h * .5); g.beginPath(); g.ellipse(w / 2, h * .22, 7, 10, 0, 0, 6.3); g.fill(); g.fillRect(w / 2 - 16, h * .3, 4, h * .38); g.fillRect(w / 2 + 12, h * .3, 4, h * .38); } else for (let i = 0; i < n; i++) fig(w / 2 + (i - (n - 1) / 2) * 24, 34 - i * 3); };
  const escolas = [];
  [[3, -34], [2, -43.5], [1, -48.8], ['homem', -54.5]].forEach(([n, z]) => { cyl(.035, .035, 2.4, MAT.metal, 6.75, 1.2, z, 6); const p = plano(.75, .75, new THREE.MeshStandardMaterial({ map: tex(128, 128, desenhaEscola(n)), roughness: .7, transparent: true, alphaTest: .1, side: THREE.DoubleSide }), 6.7, 2.1, z, -Math.PI / 2); escolas.push(p); });
  const escolaNormal = tex(128, 128, desenhaEscola(2));
  function tickEscola() {
    const ult = escolas[3]; if (S.flags.s4_escola) return;
    if (P.pos.z < -40 && P.pos.z > -58 && luzAcesa() && olhando(ult.position, .14, 11, 2.1)) { S.flags.s4_escola = true; ult.material.map = escolaNormal; ult.material.needsUpdate = true; A.SFX.estatica(.25, ult.position); agenda(.4, () => fala1('s4_escolaF', 's4_escola')); }
  }
  // cartaz eleitoral do diretor no poste (no relâmpago: "ORDEM DE QUEM?")
  const desenhaCartaz = raio => (g, w, h) => { g.fillStyle = '#c8b890'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a2a6a'; g.fillRect(0, 0, w, 40); g.fillStyle = '#e8e0c8'; g.font = 'bold 24px Arial'; g.textAlign = 'center'; g.fillText('ALBANO', w / 2, 30); g.fillStyle = '#5a4a3a'; g.fillRect(w / 2 - 34, 52, 68, 84); g.fillStyle = '#c8a888'; g.beginPath(); g.ellipse(w / 2, 84, 22, 28, 0, 0, 6.3); g.fill(); g.fillStyle = '#000'; for (const s of [-1, 1]) { g.beginPath(); g.arc(w / 2 + s * 9, 80, 3.4, 0, 6.3); g.fill(); } g.fillStyle = '#1a2a6a'; g.font = 'bold 15px Arial'; g.fillText('O HOMEM DA ORDEM', w / 2, 160); g.font = '11px Arial'; g.fillText('vereador · 1978', w / 2, 178); g.fillStyle = 'rgba(60,40,20,.35)'; g.fillRect(w * .7, 0, w * .3, h * .5); if (raio) { g.save(); g.translate(w / 2, 110); g.rotate(-.12); g.fillStyle = 'rgba(15,12,10,.92)'; g.font = "bold 22px 'Comic Sans MS', cursive"; g.fillText('ORDEM', 0, 0); g.fillText('DE QUEM?', 0, 26); g.restore(); } };
  const cartazA = tex(160, 192, desenhaCartaz(false)), cartazB = tex(160, 192, desenhaCartaz(true));
  const cartaz = plano(.55, .66, new THREE.MeshStandardMaterial({ map: cartazA, roughness: .9 }), -6.66, 1.75, -20.25, Math.PI / 2);
  let cartazT = 0;
  interact(cartaz, () => `<b>E</b>${S.notes.s4_cartaz ? 'Ler de novo o cartaz' : 'Ler o cartaz de campanha no poste'}`, () => { A.lerNota('s4_cartaz'); fala1('s4_cartazF', 's4_cartaz'); });
  function tickCartaz(dt) { if (cartazT > 0) { cartazT -= dt; if (cartazT <= 0) cartaz.material.map = cartazA; return; } if (U.raio() > .3 && olhando(cartaz.position, .5, 14, 1.75)) { cartaz.material.map = cartazB; cartazT = .7; } }
  // uma bicicleta passa na neblina (carta batendo no raio), sem ninguém em cima
  const bici = { feito: !!S.flags.s4_bici, t: -1 };
  function tickBici(dt) {
    if (bici.feito) { if (bici.t >= 0) { bici.t += dt; const k = bici.t / 3; if (k > 1) { bici.t = -1; agenda(1, () => A.falar('s4_bicicleta')); return; } const pos = { x: lerp(-14, 14, k), y: .6, z: bici.z }; if (Math.floor(bici.t / .11) !== bici.k) { bici.k = Math.floor(bici.t / .11); SOM.carta(pos, .05 + Math.sin(k * Math.PI) * .12); } } return; }
    if (S.capT > 40 && P.room && P.room.id === 'estrada' && P.pos.z < -1 && P.pos.z > -12 && !perseguindo()) { bici.feito = S.flags.s4_bici = true; bici.t = 0; bici.z = P.pos.z - 9; bici.k = -1; leg('s4_bicicleta'); }
  }
  // o velho do saco (1 noite em cada 20): atravessa longe, na neblina, e some no barranco
  const velhoSaco = new THREE.Group(); grupo.add(velhoSaco); velhoSaco.visible = false;
  const roupaV = new THREE.MeshStandardMaterial({ color: 0x1a1814, roughness: 1 });
  { const corpo = cyl(.16, .26, 1.1, roupaV, 0, .75, 0, 8, velhoSaco); corpo.rotation.x = .55; const cab = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), roupaV); cab.position.set(0, 1.2, .42); velhoSaco.add(cab); const saco = new THREE.Mesh(new THREE.SphereGeometry(.42, 8, 6), new THREE.MeshStandardMaterial({ color: 0x3a3226, roughness: 1 })); saco.position.set(0, 1.25, -.2); saco.scale.set(1, .9, .8); velhoSaco.add(saco); cyl(.02, .02, 1.3, MAT.tronco, .25, .65, .5, 4, velhoSaco); }
  const vs = { sorteio: !S.flags.s4_velhoSorteado ? (S.flags.s4_velhoSorteado = true, Math.random() < .05) : false, t: -1 };
  function tickVelho(dt) {
    if (vs.t >= 0) { vs.t += dt; velhoSaco.position.x += dt * 2.4; velhoSaco.position.y = Math.abs(Math.sin(vs.t * 3)) * .03; if (velhoSaco.position.x > 9) { velhoSaco.visible = false; vs.t = -1; S.flags.s4_velho = true; mem4Set('velho', 1); filaJoaquim.push('velho'); agenda(.6, () => A.falar('s4_velho')); } return; }
    if (!vs.sorteio || S.flags.s4_velho) return;
    if (P.pos.z < -26 && P.pos.z > -44 && P.room && P.room.id === 'estrada' && olhando({ x: 0, z: P.pos.z - 20 }, .5, 30, 1)) { vs.sorteio = false; vs.t = 0; velhoSaco.visible = true; velhoSaco.position.set(-8, 0, P.pos.z - 21); velhoSaco.rotation.y = Math.PI / 2; medo(15); }
  }

  // =================================================================== ABERTURA: o rádio lembra dos finais secretos
  const cena = c.ex.cena, cIni = cena.iniciar, cFim = cena.fim;
  cena.iniciar = () => { cena.__rodando = true; cIni(); };
  cena.fim = () => { cena.__rodando = false; cFim(); };
  let lembraT = -1; const recente = mem4().fimRecente;
  if (recente && !S.flags.s4_lembrou) lembraT = 0;
  function tickLembra(dt) {
    if (lembraT < 0 || !S.flags.saiuCarro || S.capT < 1) return; lembraT += dt;
    if (lembraT > 9) { lembraT = -1; S.flags.s4_lembrou = true; mem4Set('fimRecente', null); A.SFX.estatica(1.2, U.posRadio()); A.falar(recente === 'carro' ? 's4_carro_radio' : 's4_final0_radio'); }
  }

  // =================================================================== TECLAS (só sentada no carro ou no binóculo)
  const tec = {};
  const kd = e => {
    tec[e.code] = true; if (!vivo() || e.repeat) return;
    if (A.mode !== 'jogo' || (J() && J().ui) || S.dead || S.fim) return;
    if (bn.on && (e.code === 'KeyE' || e.code === 'Escape' || /^Key[WASD]$/.test(e.code))) { binoculo(false); if (e.code !== 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); } return; }
    if (sent.on && !sent.fim && (e.code === 'KeyF' || e.code === 'KeyQ')) { if (e.code === 'KeyF') farolAlto(); e.stopImmediatePropagation(); e.preventDefault(); }
  };
  const ku = e => { tec[e.code] = false; };
  const mm = e => {
    if ((!sent.on && !bn.on) || !document.pointerLockElement || A.mode !== 'jogo' || (J() && J().ui) || S.dead || S.fim) return;
    if (sent.on && (sent.q > 0 || sent.travou)) return;
    const k = (bn.on ? .0005 : .0022) * sens();
    P.yaw -= e.movementX * k; P.pitch = clamp(P.pitch - e.movementY * k, -1.2, 1.2);
    if (sent.on) { P.yaw = clamp(P.yaw, -1.7, 1.7); P.pitch = clamp(P.pitch, -.7, .5); sent.base = P.yaw; sent.pitchBase = P.pitch; }
    if (bn.on) { P.yaw = clamp(P.yaw, bn.yaw0 - .6, bn.yaw0 + .6); P.pitch = clamp(P.pitch, bn.pitch0 - .3, bn.pitch0 + .3); }
  };
  addEventListener('keydown', kd, true); addEventListener('keyup', ku, true); addEventListener('mousemove', mm);
  const vigia = setInterval(() => {
    if (vivo()) return;
    clearInterval(vigia); removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); removeEventListener('mousemove', mm);
    if (sent.on || bn.on) { P.bloqueado = false; P.h = 1.62; }
    P.zoomFov = 0; vinheta.remove(); fora.fog = fogBase;
    if (on.som) on.som.parar(); if (sent.chuva) sent.chuva.parar();
  }, 600);

  // =================================================================== TICK
  A.W.tick.push(dt => {
    tickLuzes(); tickNeon(dt); tickPegadas(); tickPorao(dt); plAnim();
    if (!livre()) return;
    tickSentada(dt); tickRe(dt); tickOnibus(dt); tickBafo(dt); tickVolta(dt); tickRe2(dt); tickLanterna();
    tickJoaquim(dt); tickBala(dt); tickGato(dt); tickBomba(dt); tickPoco(dt); tickBinoculo(dt);
    tickMarco(dt); tickPipa(dt); tickEscola(); tickCartaz(dt); tickBici(dt); tickVelho(dt); tickLembra(dt);
    if (S.done.abrir_portao) base.set(luzSOS, 0);
  });
  return { sentada: () => sent.on };
}
