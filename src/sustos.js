// SUSTOS E EVENTOS — A Hora do Silêncio
// Diretor de sustos (orçamento e calmaria), sustos roteirizados e dinâmicos, alucinações,
// esconderijos que não são 100% seguros, mortes com cena própria e segredos.
// O motor (jogo.js) chama criarSustos(E) uma vez e usa os ganchos devolvidos (poucas linhas lá).
import * as THREE from 'three';
import { instalarMundo } from './sustos-mundo.js';
import { instalarSustosL3 } from './sustos-plataforma.js';
import { instalarSustosL4 } from './sustos-segredos.js';
import { instalarSustosL4b } from './sustos-segredos2.js';

export function criarSustos(E) {
  const { R, rand, pick, clamp, lerp, camera, scene, W, P, M, MON, ANA, ANA_G, PROC } = E;
  const TXT = Object.assign({
    respira: 'Respira. Respira pra mim.',
    proc_fresta: '(muitas vozes, bem perto) ...você não tá na cama...',
    proc_luz: 'A luz da lanterna vaza pela fresta. Apaga!',
    aviso: ['O rádio chia...', 'Passos pequenos. Muitos.', 'Estão vindo. Esconde!'],
    achei: '(do lado de fora, bem baixinho) ...achei.',
    ocupado: '(de dentro do armário) Esse é meu. Acha outro.',
    ocupado_toast: 'Alguém segura a porta por dentro.',
    ocupado_de_novo: 'Não abre. Alguém segura por dentro.',
    dez_grave: '(voz de homem, devagar) ...um...',
    mao_cama: '(sussurro) Aqui é meu.',
    ombro: '...Quem tá aí? Tinha uma mão no meu ombro.',
    nada_ouve: 'Você não ouve mais nada.',
    legenda_mente: '[alguém respira atrás de você]',
    chamado_lia: 'Lia...? Sou eu. Vem cá. Rápido.',
    chamado_davi: 'Davi? Davi, é você?',
    responder: 'Davi?! DAVI! Eu tô aqui!',
    responder_castigo: '(dentro da sua cabeça) Quem responde, fica.',
    garrafa_volta: '(do escuro, uma criança) De novo.',
    garrafa_toast: 'A garrafa voltou rolando até você.',
    telefone: '(sussurro de criança) Ele tá {onde}. Não deixa tocar de novo.',
    telefone_longe: '(sussurro de criança) Ele não tá aqui embaixo. Ainda.',
    pausa: 'ELE CONTINUA ESCUTANDO',
    nove_poco: '(lá em cima, na boca do poço) ...nove...',
    fim_lia: 'Lia.',
    lanterna_bater: 'Bate na lanterna (F, F)!',
    lanterna_volta: 'Voltou.',
    turma: 'TURMA DE 1978',
    alunos: '{n} alunos'
  }, R.sustos || {});
  const S = () => E.S;
  const dist2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const fwd = () => { const f = new THREE.Vector3(); camera.getWorldDirection(f); return f; };
  const fwdH = () => { const f = fwd(); f.y = 0; if (f.lengthSq() < 1e-6) f.set(0, 0, -1); return f.normalize(); };
  const dif = () => (E.D ? E.D() : { intervalo: 1, aviso: 7 });
  const pesadelo = () => S() && S().dif === 'pesadelo';
  const seguro = fn => (...a) => { try { return fn(...a); } catch (e) { console.warn('[sustos]', e && e.message); } };

  // ---------------- relógio próprio (só corre jogando) e fila de eventos
  let agora = 0;
  const fila = [];
  const depois = (s, fn) => fila.push({ t: agora + s, fn });
  const D = {
    ultimoForte: -99, ultimaCaca: -99, proxAmb: 90, ultimoTipo: null, usados: new Set(), stingerT: -99, cacasCap: 0, capStinger: -1,
    apagaoT: 0, batidas: 0, piscaAte: 0, falhouEncontro: false, espia: null, espiaCool: 0, passaT: 0, procParou: 0, procPassagens: 0,
    escuroT: 0, mapa: null, mapaAnterior: null, alucT: -99, lanternaFantasma: -99, ecoAte: 0, ecoPassosAte: 0, fov0: camera.fov,
    estadoM: null, costasT: 0, portaAnim: [], luzesApagadas: 0, prev: {}, hiddenT: 0
  };

  // ---------------- camada visual (overlays próprios, sem mexer no index.html)
  const css = document.createElement('style');
  css.textContent = `
  .sx{position:fixed;inset:0;pointer-events:none;opacity:0}
  #sx-rosto{background:radial-gradient(ellipse 17vw 30vh at 50% 46%,rgba(0,0,0,.98) 55%,rgba(0,0,0,.7) 75%,transparent 100%);transition:opacity .9s}
  #sx-rosto i{position:absolute;left:41%;width:18%;top:36%;height:5vh;background:rgba(188,174,148,.55);filter:blur(5px);border-radius:40%}
  #sx-rosto b{position:absolute;top:40%;width:1.2%;height:3vh;background:rgba(80,8,6,.9);filter:blur(2px)}
  #sx-dedos{opacity:1}
  #sx-dedos i{position:absolute;top:0;width:.7vw;height:34vh;background:linear-gradient(180deg,rgba(74,64,56,.0),rgba(90,78,66,.95) 40%,rgba(60,50,44,.95));border-radius:0 0 40% 40%;transform:translateY(-102%);transition:transform 1.4s cubic-bezier(.3,.1,.2,1)}
  #sx-dedos.on i{transform:translateY(-8%)}
  #sx-passa{opacity:1;overflow:hidden}
  #sx-passa i{position:absolute;top:0;bottom:0;width:34vw;left:-40vw;background:linear-gradient(90deg,transparent,#000 25%,#000 75%,transparent)}
  #sx-verm{background:radial-gradient(ellipse at 50% 50%,rgba(255,40,10,.35),rgba(120,0,0,.15) 60%,transparent);transition:opacity .4s;mix-blend-mode:screen}
  #sx-azul{background:radial-gradient(ellipse at center,rgba(20,40,90,0) 35%,rgba(30,60,140,.55) 100%);transition:opacity 1.2s}
  #sx-flash{background:#fff}
  #sx-tecido{opacity:1;transform:translateY(-105%);background:repeating-linear-gradient(90deg,#3a352c 0 3vw,#2d2922 3vw 6vw),#332e26;box-shadow:inset 0 -6vh 6vh rgba(0,0,0,.8)}
  #sx-mao{opacity:0;transition:opacity .25s,transform .4s;left:auto;right:-6vw;top:auto;bottom:-10vh;width:30vw;height:46vh;transform:translate(10vw,10vh) rotate(-28deg);background:radial-gradient(ellipse 40% 30% at 50% 22%,#b9b2a6,#7d776d 70%,transparent 72%),linear-gradient(90deg,transparent 30%,#8d877c 30% 70%,transparent 70%);filter:blur(1.5px);border-radius:50%}
  #sx-mao.on{opacity:.92;transform:translate(0,0) rotate(-28deg)}
  #sx-fim{position:absolute;left:50%;top:6%;width:22vw;height:88vh;transform:translateX(-50%);background:#000;opacity:0;z-index:-1;clip-path:polygon(46% 0,54% 0,57% 6%,55% 12%,62% 15%,66% 40%,63% 41%,61% 70%,64% 100%,58% 100%,52% 62%,48% 62%,42% 100%,36% 100%,39% 70%,37% 41%,34% 40%,38% 15%,45% 12%,43% 6%)}
  `;
  document.head.appendChild(css);
  const div = (id, html, antes) => { const el = document.createElement('div'); el.id = id; el.className = 'sx'; if (html) el.innerHTML = html; const ref = document.getElementById(antes); if (ref) ref.before(el); else document.body.appendChild(el); return el; };
  const elRosto = div('sx-rosto', '<i></i><b style="left:46%"></b><b style="left:52%"></b>', 'fx-locker');
  const elDedos = div('sx-dedos', [0, 1, 2, 3].map(i => `<i style="left:${45.5 + i * 2.4}%"></i>`).join(''), 'fx-locker');
  const elPassa = div('sx-passa', '<i></i>', 'fx-locker');
  const elVerm = div('sx-verm', '', 'fx-locker');
  const elAzul = div('sx-azul', '', 'fx-black');
  const elFlash = div('sx-flash', '', 'fx-black');
  const elTecido = div('sx-tecido', '', 'fx-black');
  const elMao = div('sx-mao', '', 'fx-black');
  const fimEl = document.getElementById('fimcap'); let elFim = null;
  if (fimEl) { elFim = document.createElement('div'); elFim.id = 'sx-fim'; fimEl.prepend(elFim); }
  const flashBranco = (ms = 80) => { elFlash.style.transition = 'none'; elFlash.style.opacity = .95; setTimeout(() => { elFlash.style.transition = 'opacity .25s'; elFlash.style.opacity = 0; }, ms); };
  function esconderFresta() { elRosto.style.opacity = 0; elDedos.classList.remove('on'); elVerm.style.opacity = 0; }

  // ---------------- modelos só visuais (nunca têm IA nem causam dano)
  function clonarInspetor() {
    const g = MON.g.clone(true); g.visible = false; scene.add(g);
    g.userData.cabeca = g.children.find(c => c.isGroup && Math.abs(c.position.y - 3.62) < .02);
    return g;
  }
  const SOMBRA = clonarInspetor(), TETO = clonarInspetor();
  function crianca(olhos = true) {
    const g = new THREE.Group();
    E.cyl(.1, .22, .9, E.MAT.sombra, 0, .45, 0, 8, g);
    const c = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), E.MAT.sombra); c.position.y = 1.05; g.add(c);
    if (olhos) for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.016, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff3010 })); o.position.set(s * .04, 1.07, .11); g.add(o); }
    g.visible = false; scene.add(g); return g;
  }
  const CRIANCA = crianca(false), CRIANCA_OLHOS = crianca(true);
  const ANA2 = ANA_G.clone(true); ANA2.visible = false; scene.add(ANA2);
  const ROSTO = new THREE.Group(); {
    const pele = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: .8, emissive: 0x2a2620, emissiveIntensity: .6 });
    const r = new THREE.Mesh(new THREE.SphereGeometry(.13, 14, 10), pele); r.scale.set(.85, 1.15, .8); ROSTO.add(r);
    for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0x000000 })); o.position.set(s * .045, .03, .1); ROSTO.add(o); }
    const b = new THREE.Mesh(new THREE.BoxGeometry(.05, .07, .02), new THREE.MeshBasicMaterial({ color: 0x050000 })); b.position.set(0, -.06, .1); ROSTO.add(b);
    ROSTO.visible = false; scene.add(ROSTO);
  }
  const MAO = new THREE.Group(); {
    const pele = new THREE.MeshStandardMaterial({ color: 0xb8b0a2, roughness: .8, emissive: 0x1a1814, emissiveIntensity: .7 });
    E.box(.09, .025, .3, pele, 0, 0, .15, MAO, false);
    for (let i = 0; i < 4; i++) E.box(.014, .014, .16, pele, (i - 1.5) * .022, 0, .38, MAO, false);
    MAO.visible = false; scene.add(MAO);
  }
  const OLHOS = new THREE.Group(); {
    const vm = new THREE.MeshBasicMaterial({ color: 0xff2a10 });
    for (let i = 0; i < 9; i++) {
      const c = new THREE.Group(), a = (i / 9) * Math.PI * 2;
      const h = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), E.MAT.sombra); c.add(h);
      for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 6), vm); o.position.set(s * .045, .02, .11); c.add(o); }
      c.userData.a = a; OLHOS.add(c);
    }
    OLHOS.visible = false; scene.add(OLHOS);
  }
  const luzRosto = new THREE.PointLight(0xfff4e8, 0, 3.2, 1.6); scene.add(luzRosto);
  const luzRaio = new THREE.PointLight(0xdde6ff, 0, 14, 1.4); scene.add(luzRaio);
  const temporarios = []; // {obj, upd(dt)->bool fim}
  function anima(obj, upd) { temporarios.push({ obj, upd }); }
  const ringGeo = new THREE.RingGeometry(.05, .085, 28);
  function anel(x, z, forte = 1) {
    if (!W.agua.length) return;
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xa8b8c0, transparent: true, opacity: .45 * forte, depthWrite: false, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, W.agua[0].position.y + .015, z); scene.add(m);
    let t = 0; anima(m, dt => { t += dt; m.scale.setScalar(1 + t * 9); m.material.opacity = Math.max(0, .45 * forte * (1 - t / 1.3)); if (t > 1.3) { scene.remove(m); m.material.dispose(); return true; } });
  }
  function faiscas(x, y, z) {
    const n = 26, geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), vel = [];
    for (let i = 0; i < n; i++) { pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; vel.push([rand(-1.5, 1.5), rand(-.5, 1.5), rand(-1.5, 1.5)]); }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffd080, size: .05, transparent: true, depthWrite: false }));
    scene.add(pts); let t = 0;
    anima(pts, dt => { t += dt; const a = geo.attributes.position.array; for (let i = 0; i < n; i++) { vel[i][1] -= 9 * dt; a[i * 3] += vel[i][0] * dt; a[i * 3 + 1] = Math.max(.02, a[i * 3 + 1] + vel[i][1] * dt); a[i * 3 + 2] += vel[i][2] * dt; } geo.attributes.position.needsUpdate = true; pts.material.opacity = Math.max(0, 1 - t / .6); if (t > .6) { scene.remove(pts); geo.dispose(); pts.material.dispose(); return true; } });
  }
  function esconderModelos() {
    for (const g of [SOMBRA, TETO, CRIANCA, CRIANCA_OLHOS, ANA2, ROSTO, MAO, OLHOS]) g.visible = false;
    for (const g of [SOMBRA, TETO]) { g.rotation.set(0, 0, 0); g.position.y = 0; }
    ANA2.rotation.set(0, 0, 0); ANA2.position.y = 0;
    luzRosto.intensity = 0; luzRaio.intensity = 0;
  }

  // ---------------- som procedural próprio
  function som(fn) { const ac = E.AC; if (!ac || !E.master) return; try { fn(ac, ac.currentTime); } catch (e) { console.warn('[sustos] som', e && e.message); } }
  // "vácuo": o mundo some (chuva, drone, passos) e volta de uma vez junto com o susto
  function vacuo(dur, nivel = .05) {
    som((ac, t) => { const g = E.master.gain, vol = E.OPT.vol; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(vol * nivel, t + Math.min(.35, dur * .4)); g.setValueAtTime(vol * nivel, t + dur); g.linearRampToValueAtTime(vol, t + dur + .03); });
  }
  function restaurarVolume() { som((ac, t) => { const g = E.master.gain; g.cancelScheduledValues(t); g.setValueAtTime(E.OPT.vol, t); }); }
  function marcarForte() { D.ultimoForte = agora; }
  function sustoCom(espera = .9, fn) { vacuo(espera); marcarForte(); L3.avisar(espera); depois(espera, () => { if (fn) fn(); else E.SFX.susto(); L3.assustou(); }); }
  // voz com formantes (vogais) — de criança, de adulto ou sussurrada
  function voz(pos, { f0 = 330, vogais = [[400, 2200], [800, 1200]], dur = .8, vol = .12, sopro = false, wet = .5, cai = .9 } = {}) {
    som((ac, t) => {
      const g = E.saida(pos, wet);
      let fonte;
      if (sopro) fonte = E.ruido(true);
      else { fonte = ac.createOscillator(); fonte.type = 'sawtooth'; fonte.frequency.setValueAtTime(f0, t); fonte.frequency.linearRampToValueAtTime(f0 * cai, t + dur); const vib = ac.createOscillator(); vib.frequency.value = 5.5; const vg = ac.createGain(); vg.gain.value = f0 * .015; vib.connect(vg); vg.connect(fonte.frequency); vib.start(t); vib.stop(t + dur + .1); }
      const seg = dur / Math.max(1, vogais.length - 1);
      for (const k of [0, 1]) {
        const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = sopro ? 10 : 6;
        vogais.forEach((v, i) => { if (i === 0) bp.frequency.setValueAtTime(v[k], t); else bp.frequency.linearRampToValueAtTime(v[k], t + seg * i); });
        const gk = ac.createGain(); gk.gain.value = k ? .55 : 1; fonte.connect(bp); bp.connect(gk); gk.connect(g);
      }
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol * (sopro ? 2.2 : 1), t + .06); g.gain.setValueAtTime(vol * (sopro ? 2.2 : 1), t + dur * .75); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      fonte.start(t); fonte.stop(t + dur + .05);
    });
  }
  function respiracao(pos, dur = 2, grave = false, vol = .5) {
    som((ac, t) => {
      const s = E.ruido(true), f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = grave ? 520 : 1500; f.Q.value = 1.2;
      const g = E.saida(pos, .3); s.connect(f); f.connect(g); g.gain.setValueAtTime(.0001, t);
      for (let k = 0; k < dur; k += 1.5) { g.gain.exponentialRampToValueAtTime(vol * .3, t + k + .5); g.gain.exponentialRampToValueAtTime(.002, t + k + .9); g.gain.exponentialRampToValueAtTime(vol * .2, t + k + 1.2); g.gain.exponentialRampToValueAtTime(.0005, t + k + 1.5); }
      s.start(t); s.stop(t + dur + .2);
    });
  }
  function passoPos(pos, vol = .5, descalco = false) {
    som((ac, t) => { const g = E.saida(pos, .35); E.burst(t, descalco ? .06 : .12, descalco ? 'bandpass' : 'lowpass', descalco ? 1600 : 650, 1, g); E.env(g, t, .004, vol * (descalco ? .35 : .45), descalco ? .05 : .1); });
  }
  function batida(pos, vol = .6) { som((ac, t) => { const g = E.saida(pos, .5); E.burst(t, .3, 'lowpass', 280, 1, g, 0); E.env(g, t, .002, vol, .22); }); }
  function maoContato() { som((ac, t) => { for (let i = 0; i < 7; i++) { const g = E.saida(null, 0), k = t + i * rand(.03, .09); E.burst(k, .02, 'bandpass', 3200, 3, g); E.env(g, k, .001, .3, .02); } const g = E.saida(null, 0); E.osc('square', 118, t, .25, g); E.env(g, t, .01, .03, .2); }); }
  function cabide() { som((ac, t) => { for (let i = 0; i < 3; i++) { const g = E.saida(null, .3); E.osc('sine', rand(2300, 3400), t + i * .07, .4, g); E.env(g, t + i * .07, .001, .06, .3); } const g = E.saida(null, .1); E.burst(t, .35, 'bandpass', 900, 1, g); E.env(g, t, .03, .25, .3); }); }
  function arranhao(pos, dur = 1.1) { som((ac, t) => { const g = E.saida(pos, .4), f = E.burst(t, dur, 'bandpass', 3000, 7, g); f.frequency.linearRampToValueAtTime(1800, t + dur); g.gain.setValueAtTime(0, t); for (let i = 0; i < dur * 14; i++) g.gain.setValueAtTime(Math.random() * .28, t + i / 14); g.gain.setValueAtTime(0, t + dur); }); }
  function estouro(x, y, z) { E.SFX.vidro(x, z); som((ac, t) => { const g = E.saida({ x, y, z }, .5); E.burst(t, .08, 'highpass', 2500, 1, g, 0); E.env(g, t, .001, .9, .07); const g2 = E.saida({ x, y, z }, .4); E.osc('sine', 60, t, .3, g2); E.env(g2, t, .002, .4, .25); }); }
  function vento(pos, dur = 2.4) { som((ac, t) => { const g = E.saida(pos, .3), f = E.burst(t, dur, 'lowpass', 300, 1, g); f.frequency.linearRampToValueAtTime(900, t + dur * .6); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.35, t + dur * .5); g.gain.exponentialRampToValueAtTime(.0001, t + dur); }); }
  function impactoGrave(vol = 1.4) { som((ac, t) => { const g = E.saida(null, .4), o = ac.createOscillator(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(26, t + 1); o.connect(g); E.env(g, t, .004, vol, 1); o.start(t); o.stop(t + 1.2); const g2 = E.saida(null, .5); E.burst(t, .5, 'lowpass', 1400, 1, g2, 0); E.env(g2, t, .002, vol * .7, .4); }); }
  function rolar(pos, dur = 3) { som((ac, t) => { const g = E.saida(pos, .3), f = E.burst(t, dur, 'lowpass', 220, 2, g); g.gain.setValueAtTime(0, t); for (let i = 0; i < dur * 12; i++) g.gain.setValueAtTime(.12 + Math.random() * .12, t + i / 12); g.gain.setValueAtTime(0, t + dur); }); }
  function telefoneToque(pos) { som((ac, t) => { const g = E.saida(pos, .3); for (const f of [425, 452]) E.osc('sine', f, t, 1.1, g); g.gain.setValueAtTime(0, t); for (let i = 0; i < 22; i++) g.gain.setValueAtTime(i % 2 ? .02 : .09, t + i * .05); g.gain.setValueAtTime(0, t + 1.1); }); }
  function notas(pos, fs, gap = .45, vol = .07) { som((ac, t) => fs.forEach((f, i) => { const g = E.saida(pos, .7), at = t + i * gap; E.osc('sine', f, at, 1.4, g); E.env(g, at, .002, vol, 1.1); })); }
  function cantoCurto(pos, dur = 1.2, vol = .05) { som((ac, t) => { const g = E.saida(pos, .7); for (const f of [146.8, 174.6, 220]) { const o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 5; o.connect(bp); bp.connect(g); o.start(t); o.stop(t + dur + .1); } g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .3); g.gain.exponentialRampToValueAtTime(.0001, t + dur); }); }
  function geradorFalha(pos) { som((ac, t) => { const g = E.saida(pos, .3), o = ac.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(52, t); o.frequency.linearRampToValueAtTime(30, t + 1.6); const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 240; o.connect(f); f.connect(g); g.gain.setValueAtTime(0, t); for (let i = 0; i < 16; i++) g.gain.setValueAtTime(Math.random() < .6 ? .25 : 0, t + i * .1); g.gain.setValueAtTime(0, t + 1.7); o.start(t); o.stop(t + 1.8); }); }
  function bolhas(pos) { som((ac, t) => { for (let i = 0; i < 6; i++) { const g = E.saida(pos, .5), at = t + i * rand(.08, .22), o = ac.createOscillator(); o.frequency.setValueAtTime(rand(300, 500), at); o.frequency.exponentialRampToValueAtTime(rand(900, 1400), at + .06); o.connect(g); E.env(g, at, .002, .08, .06); o.start(at); o.stop(at + .1); } }); }
  function estalos(pos, n = 4, gap = .12) { for (let i = 0; i < n; i++) setTimeout(() => E.SFX.estalo(pos, 1), i * gap * 1000); }
  const sussurroDez = pos => voz(pos, { sopro: true, vogais: [[500, 1900], [700, 1700], [350, 2300]], dur: .7, vol: .14, wet: .1 });

  // ---------------- utilidades de mundo
  const atras = (m = 1.4) => { const f = fwdH(); return { x: P.pos.x - f.x * m, y: 1.5, z: P.pos.z - f.z * m }; };
  const naSala = (x, z, sala = P.room) => sala && x > sala.x0 + .35 && x < sala.x1 - .35 && z > sala.z0 + .35 && z < sala.z1 - .35;
  function lampadasPerto(raio = 12) { return W.lampadas.filter(L => L.ligada && !L.estourada && Math.hypot(L.x - P.pos.x, L.z - P.pos.z) < raio); }
  function estourar(L, ruidoIns = true) {
    if (!L || L.estourada) return;
    L.estourada = true; L.ligada = false; L.luz.intensity = 0; L.bulbo.material.emissiveIntensity = 0;
    estouro(L.x, 2.6, L.z); faiscas(L.x, 2.6, L.z); D.luzesApagadas++;
    if (ruidoIns) E.emitNoise(L.x, L.z, 8);
  }
  function apagarEmSequencia(lamps, gap = .4, volta = 6, cb) {
    lamps.forEach((L, i) => depois(i * gap, () => { if (!L.ligada) return; L.ligada = false; L.luz.intensity = 0; L.bulbo.material.emissiveIntensity = 0; E.SFX.estalo({ x: L.x, z: L.z }, .4); }));
    depois(lamps.length * gap + volta, () => { if (!PROC.fase) E.syncLuzes(); if (cb) cb(); });
  }
  function portaDaSala(sala, filtro = () => true) {
    return W.links.filter(l => l.door && (l.a === sala.id || l.b === sala.id)).map(l => l.door).filter(d => !d.grade && d.id !== 'main' && !(d.trava && d.trava()) && filtro(d));
  }
  function abrirDevagar(d, alvo = -Math.PI * .56, dur = 2.5, colisao = true) {
    D.portaAnim.push({ d, de: d.target, para: alvo, t: 0, dur });
    if (colisao) { d.open = true; d.col.on = false; S().doorsOpen[`${W.mapa}:${d.id}`] = true; }
    E.SFX.rangido(d.x, 1.2, d.z, .7); depois(dur * .6, () => E.SFX.rangido(d.x, 1.2, d.z, .45));
  }
  function bater(d) { D.portaAnim = D.portaAnim.filter(a => a.d !== d); E.setDoor(d, false, true); E.SFX.pancada(d.x, d.z); }
  function andarModelo(g, de, para, vel, opts = {}) {
    g.position.set(de.x, opts.y || 0, de.z); g.visible = true; const tot = Math.hypot(para.x - de.x, para.z - de.z); let s = 0, passoT = 0;
    g.rotation.y = Math.atan2(para.x - de.x, para.z - de.z);
    anima(g, dt => {
      s += vel * dt; const k = Math.min(1, s / tot);
      g.position.x = lerp(de.x, para.x, k); g.position.z = lerp(de.z, para.z, k);
      if (g.userData.cabeca) { g.userData.cabeca.rotation.z = .9 + Math.sin(E.perf * 6) * .08; g.userData.cabeca.rotation.y = Math.sin(E.perf * 1.3) * .7; }
      passoT -= dt; if (passoT <= 0 && opts.som !== false) { passoT = opts.passo || .9; if (opts.descalco) passoPos(g.position, .5, true); else { E.SFX.estalo(g.position, .5); passoPos(g.position, .4); } }
      if (opts.sumirSe && opts.sumirSe()) { g.visible = false; return true; }
      if (k >= 1) { g.visible = false; if (opts.fim) opts.fim(); return true; }
    });
  }
  function eixoCorredor(r) { return (r.x1 - r.x0) > (r.z1 - r.z0) ? 'x' : 'z'; }
  // ponto no fundo do corredor, na direção em que a jogadora olha
  function fundoCorredor(r, minDist = 11) {
    const f = fwdH(), ax = eixoCorredor(r);
    const s = Math.sign(ax === 'x' ? f.x : f.z); if (!s || Math.abs(ax === 'x' ? f.x : f.z) < .75) return null;
    const lim = ax === 'x' ? (s > 0 ? r.x1 - 1.5 : r.x0 + 1.5) : (s > 0 ? r.z1 - 1.5 : r.z0 + 1.5);
    const cur = ax === 'x' ? P.pos.x : P.pos.z, dd = Math.abs(lim - cur);
    if (dd < minDist) return null;
    const alvoD = Math.min(dd, rand(minDist, minDist + 5)) * s;
    return ax === 'x' ? { x: P.pos.x + alvoD, z: (r.z0 + r.z1) / 2, ax } : { x: (r.x0 + r.x1) / 2, z: P.pos.z + alvoD, ax };
  }

  // ===================================================================== LANTERNA
  function apagao(dur, som2 = true) { D.apagaoT = Math.max(D.apagaoT, dur); D.batidas = 0; if (som2) maoContato(); }
  const API = {};
  API.lanternaFalha = () => D.apagaoT > 0 || (agora < D.piscaAte && ((agora * 9) | 0) % 2 === 0);
  API.bater = seguro(() => {
    if (!(D.apagaoT > 0)) return false;
    D.batidas++; E.SFX.clique(); P.shake = Math.max(P.shake, .03);
    if (D.batidas >= 2) { D.apagaoT = 0; E.toast(TXT.lanterna_volta); maoContato(); }
    return true;
  });
  API.aoLanterna = seguro(() => {
    const s = S();
    if (agora < D.ecoAte && D.ecoSala) { const r = D.ecoSala, x = (r.x0 + r.x1) / 2, z = (r.z0 + r.z1) / 2; depois(2, () => som((ac, t) => { const g = E.saida({ x, y: 1.4, z }, .4); E.burst(t, .05, 'highpass', 3000, 1, g); E.env(g, t, .001, .35, .03); })); }
    // ligar a lanterna com muito medo às vezes mostra o que não está lá (um quadro só)
    if (s.flashOn && s.fear > 70 && agora - D.lanternaFantasma > 40 && !ANA.ativa && !(M.ativo && dist2(M.pos, P.pos) < 12) && !P.room.fora) {
      D.lanternaFantasma = agora; const f = fwdH(); const x = P.pos.x + f.x * 6.5, z = P.pos.z + f.z * 6.5;
      if (naSala(x, z) || (P.room.tipo === 'corredor')) { CRIANCA.position.set(x, 0, z); CRIANCA.rotation.y = Math.atan2(P.pos.x - x, P.pos.z - z); CRIANCA.visible = true; let n = 0; anima(CRIANCA, () => { if (++n > 2) { CRIANCA.visible = false; return true; } }); }
    }
  });

  // ===================================================================== INSPETOR
  API.stinger = seguro(d => {
    const s = S();
    if (D.capStinger !== s.chapter) { D.capStinger = s.chapter; D.cacasCap = 0; }
    D.cacasCap++; D.ultimaCaca = agora;
    const forte = D.cacasCap === 1 || d < 4;
    L3.notou(d);
    if (forte && agora - D.stingerT > 25) { D.stingerT = agora; L3.suave(); E.SFX.susto(); marcarForte(); }
    else { estalos(M.pos, 5, .09); E.SFX.coracao(); setTimeout(() => E.SFX.coracao(), 380); }
  });
  API.avistamento = seguro(() => sustoCom(.9));
  API.aoRaio = seguro(() => {
    MUNDO.aoRaio();
    if (D.raioSombra) { const f = D.raioSombra; D.raioSombra = null; f(); }
    if (M.ativo && M.state !== 'caca' && dist2(M.pos, P.pos) < 14 && E.visivel(M.pos, 2.4, 14)) {
      const dx = M.pos.x - P.pos.x, dz = M.pos.z - P.pos.z, l = Math.hypot(dx, dz) || 1;
      luzRaio.position.set(M.pos.x + dx / l * 1.2, 2.6, M.pos.z + dz / l * 1.2); luzRaio.intensity = 60;
      setTimeout(() => luzRaio.intensity = 0, 120);
    }
  });
  function updateInspetorSustos(dt) {
    const s = S();
    if (!M.ativo) { D.estadoM = null; return; }
    const d = dist2(M.pos, P.pos);
    // falso alívio: ele "vai embora" (passos se afastando, porta longe) mas fica parado e mudo na sala
    if (D.estadoM === 'procura' && M.state === 'patrulha' && s.hidden && d < 12 && !s.flags.sino && Math.random() < .3) {
      M.path = []; M.wait = 8; M.clickT = 8;
      const ux = (M.pos.x - P.pos.x) / (d || 1), uz = (M.pos.z - P.pos.z) / (d || 1);
      for (let i = 1; i <= 5; i++) depois(i * .9, () => passoPos({ x: M.pos.x + ux * i * 1.8, y: .3, z: M.pos.z + uz * i * 1.8 }, .6 - i * .08));
      depois(5.4, () => batida({ x: M.pos.x + ux * 12, y: 1, z: M.pos.z + uz * 12 }, .5));
    }
    D.estadoM = M.state;
    // lâmpada estoura quando ele passa embaixo (o prédio vai ficando escuro)
    D.lampT = (D.lampT || 0) - dt; if (D.lampT <= 0) { D.lampT = .15; for (const L of W.lampadas) { // de 0,15 em 0,15 s: ele anda menos de 0,4 m nesse tempo
      const perto = L.ligada && !L.estourada && Math.hypot(L.x - M.pos.x, L.z - M.pos.z) < 1.5;
      if (perto && !L._sxVisto) { L._sxVisto = true; if (Math.random() < .25 && D.luzesApagadas < 4) estourar(L, false); }
      else if (!perto) L._sxVisto = false;
    } }
    // luzes apagam atrás de você, na direção de onde ele vem
    if (P.room.tipo === 'corredor' && d > 15 && d < 25 && M.state !== 'caca' && agora > (D.apagaCorrT || 0)) {
      const lamps = lampadasPerto(26).filter(L => Math.hypot(L.x - M.pos.x, L.z - M.pos.z) < d && Math.hypot(L.x - P.pos.x, L.z - P.pos.z) > 2).sort((a, b) => Math.hypot(a.x - M.pos.x, a.z - M.pos.z) - Math.hypot(b.x - M.pos.x, b.z - M.pos.z));
      if (lamps.length >= 2) { D.apagaCorrT = agora + 120; apagarEmSequencia(lamps, .4, 6); }
    }
    // lanterna falha com pilha fraca e ele perto (uma vez por encontro; F, F religa)
    if (s.flashOn && s.battery < 30 && d < 8 && !D.falhouEncontro && !ANA.ativa) { D.falhouEncontro = true; if (Math.random() < .35) { apagao(1.5); if (!s.flags.sx_dicaBater) { s.flags.sx_dicaBater = true; E.toast(TXT.lanterna_bater); } } }
    if (D.falhouEncontro && d > 16) D.falhouEncontro = false;
    // Cap. IV: a lanterna morre por 4 s com ele investigando a mesma sala
    if (s.chapter === 4 && !s.flags.sx_apagaoIV && s.flashOn && M.state === 'investiga' && E.roomAt(M.pos.x, M.pos.z) === P.room && !ANA.ativa) { s.flags.sx_apagaoIV = true; apagao(4); }
    updateFresta(dt, d);
  }
  // Escondida no armário: ele passa colado, para, espia pela fresta e pede para você respirar
  function updateFresta(dt, d) {
    const s = S(), L = s.hidden;
    if (!L || L.tipo !== 'armario') { if (D.espia) { D.espia = null; esconderFresta(); } return; }
    if (d < 1.7 && M.path.length && agora > D.passaT) {
      D.passaT = agora + 7; P.shake = Math.max(P.shake, .05); respiracao({ x: M.pos.x, y: 2.4, z: M.pos.z }, 1.6, true, .7);
      const i = elPassa.firstChild; i.style.transition = 'none'; i.style.left = '-40vw'; void i.offsetWidth; i.style.transition = 'left 1.3s linear'; i.style.left = '110vw';
    }
    if (!D.espia && agora > D.espiaCool && d < 1.9 && (M.state === 'procura' || M.state === 'investiga') && !M.achou) {
      D.espia = { t: rand(2.8, 3.8), prende: 0 }; D.espiaCool = agora + 25; marcarForte();
      M.path = []; M.wait = Math.max(M.wait, D.espia.t); M.yaw = Math.atan2(L.x - M.pos.x, L.z - M.pos.z);
      elRosto.style.opacity = 1; elDedos.classList.add('on'); vacuo(D.espia.t, .3);
      depois(2, () => elDedos.classList.remove('on'));
      depois(.8, () => { if (!D.espia) return; E.sub('inspetor', TXT.respira); voz({ x: M.pos.x, y: 1.6, z: M.pos.z }, { sopro: true, vogais: [[500, 1500], [300, 900], [600, 1600]], dur: 1.6, vol: .2, wet: .05 }); });
    }
    if (D.espia) {
      D.espia.t -= dt;
      if (E.keys.Space && s.stamina > 0) D.espia.prende += dt;
      if (D.espia.prende >= 3 && M.state !== 'caca') { D.espia.t = 0; M.wait = 0; E.patrulhar(); }
      if (D.espia.t <= 0 || M.achou || !s.hidden) { D.espia = null; esconderFresta(); }
    }
  }

  // ===================================================================== ANA
  API.nove = seguro(() => {
    const a = atras(.5); respiracao(a, 1.6, false, .6);
    elAzul.style.opacity = 1; setTimeout(() => elAzul.style.opacity = 0, 1300);
    if (Math.random() < .5) { elMao.classList.add('on'); setTimeout(() => elMao.classList.remove('on'), 420); }
  });
  API.dez = seguro(() => {
    const s = S(); ANA.conta = 0; marcarForte(); ANA.cool = Math.max(ANA.cool, 1.6); L3.avisar(.4);
    const v = D.dezSeq = (D.dezSeq === undefined ? 0 : D.dezSeq + 1);
    const tipo = v === 0 ? 'atras' : pick(['atras', 'atras', 'silencio', 'grave']);
    const teleAtras = (m) => {
      const f = fwdH(); let x = P.pos.x - f.x * m, z = P.pos.z - f.z * m;
      if (!naSala(x, z) && E.roomAt(x, z) !== P.room) { x = P.pos.x - f.x * .9; z = P.pos.z - f.z * .9; if (E.roomAt(x, z) !== P.room) { x = P.pos.x; z = P.pos.z; const [px, pz] = E.pontoEm(P.room, .8); x = px; z = pz; } }
      ANA.pos.set(x, 0, z); E.collide(ANA.pos, .25); ANA.path = []; ANA.cool = Math.max(ANA.cool, 1.2);
      D.dezJanela = 1.25; P.shake = Math.max(P.shake, .06); P.pitch = clamp(P.pitch - .05, -1.45, 1.45);
    };
    if (tipo === 'atras') {
      vacuo(.4, .02); depois(.4, () => { if (!ANA.ativa) return; teleAtras(1.4); sussurroDez(atras(.4)); E.SFX.susto(); D.piscaAte = agora + .7; });
    } else if (tipo === 'silencio') {
      ANA.cool = Math.max(ANA.cool, 4.6); vacuo(3.2, .02);
      depois(3.1, () => { if (!ANA.ativa) return; E.SFX.risada(P.pos.x + rand(-.5, .5), P.pos.z + rand(-.5, .5)); });
      depois(3.6, () => { if (!ANA.ativa) return; teleAtras(.95); sussurroDez(atras(.3)); E.SFX.susto(); });
    } else {
      voz({ x: ANA.pos.x, y: 1.3, z: ANA.pos.z }, { f0: 98, vogais: [[300, 870], [320, 800]], dur: 1.1, vol: .16, cai: .85 });
      E.sub('ana', TXT.dez_grave); ANA.conta = 0;
    }
  });
  function updateAnaSustos(dt) {
    const s = S();
    if (D.dezJanela > 0) {
      D.dezJanela -= dt;
      if (ANA.ativa && ANA.vista) { D.dezJanela = 0; if (!ANA.script) { E.despawnAna(); } else ANA.cool = Math.max(ANA.cool, 1); }
    }
    // A primeira aparição depois da caixinha: a lanterna falha 1,2 s e ela está 2 m mais perto
    if (ANA.ativa && ANA.script && !s.flags.sx_falhaAna) {
      D.anaScriptT = (D.anaScriptT || 0) + dt;
      if (D.anaScriptT > 3 && ANA.vista && s.flashOn) {
        s.flags.sx_falhaAna = true; apagao(1.2); ANA.cool = Math.max(ANA.cool, 2.6); marcarForte();
        const dx = P.pos.x - ANA.pos.x, dz = P.pos.z - ANA.pos.z, l = Math.hypot(dx, dz) || 1, m = Math.min(2, Math.max(0, l - 1.6));
        D.anaPrende = { x: ANA.pos.x + dx / l * m, z: ANA.pos.z + dz / l * m, t: 1.2 };
      }
    }
    if (D.anaPrende) { D.anaPrende.t -= dt; if (D.anaPrende.t <= 0 || !ANA.ativa) D.anaPrende = null; else { ANA.pos.set(D.anaPrende.x, 0, D.anaPrende.z); ANA.path = []; ANA_G.position.x = ANA.pos.x; ANA_G.position.z = ANA.pos.z; } }
  }

  // ===================================================================== PROCISSÃO
  API.procFalsa = seguro(() => {
    const s = S();
    if (s.chapter < 3 || !s.flags.procAviso || D.ultimaFalsa || Math.random() > .3) { D.ultimaFalsa = false; return false; }
    D.ultimaFalsa = true; D.falsaT = 1.5; E.SFX.estatica(1.2); D.cantoSairAte = agora + 25;
    s.timers.procissao = rand(40, 70) * dif().intervalo;
    depois(1.5, () => { if (!PROC.fase) E.syncLuzes(); E.SFX.estalo({ x: P.pos.x + rand(-3, 3), z: P.pos.z + rand(-3, 3) }, .5); });
    return true;
  });
  API.procAviso = seguro(dt => {
    const s = S();
    if (!D.aviso) {
      D.aviso = { ini: PROC.t, etapa: 0, rangT: 0 };
      const hs = W.lockers.slice().sort((a, b) => Math.hypot(a.x - P.pos.x, a.z - P.pos.z) - Math.hypot(b.x - P.pos.x, b.z - P.pos.z));
      D.aviso.alvo = hs[0] || null;
      if (!hs[0] || Math.hypot(hs[0].x - P.pos.x, hs[0].z - P.pos.z) > 12) { PROC.t += 3; D.aviso.ini += 3; }
    }
    for (const L of W.lampadas) if (L.estourada) { L.luz.intensity = 0; L.bulbo.material.emissiveIntensity = 0; }
    const A = D.aviso, k = 1 - PROC.t / A.ini;
    const et = k < .34 ? 0 : k < .7 ? 1 : 2;
    if (et >= A.etapa) { E.toast(TXT.aviso[A.etapa]); A.etapa++; }
    A.rangT -= dt;
    if (A.alvo && !pesadelo() && A.rangT <= 0 && !s.hidden) { A.rangT = 1.6; E.SFX.rangido(A.alvo.x, 1, A.alvo.z, .22); }
  });
  API.procPausa = seguro(dt => {
    const s = S(), L = s.hidden;
    if (D.procParou > 0) {
      D.procParou -= dt; PROC.t += dt;
      const c = D.procCrianca;
      if (c && L) { const w = new THREE.Vector3(); c.getWorldPosition(w); const ty = Math.atan2(L.x - w.x, L.z - w.z) - PROC.g.rotation.y; c.rotation.y = lerp(c.rotation.y, Math.atan2(Math.sin(ty), Math.cos(ty)), Math.min(1, dt * 3)); }
      if (D.procParou <= 0) { if (c) c.rotation.y = 0; elVerm.style.opacity = 0; cantoVolta(); }
      return true;
    }
    if (L && L.sxJoaquim) return false; // o armário que o Seu Joaquim apontou: a Procissão passa reto
    if (L && !D.procParouNesta && dist2(PROC.pos, L) < 2.6) {
      D.procParouNesta = true; D.procPassagens++;
      if (D.procPassagens > 1 && Math.random() < .5) return false;
      D.procParou = 2.6; marcarForte(); MUNDO.procParou(L);
      D.procCrianca = PROC.g.children.filter(c => c.isGroup)[4] || null;
      elVerm.style.opacity = L.tipo === 'armario' ? 1 : .6; cantoCorta();
      if (!s.flags.sx_procFresta) { s.flags.sx_procFresta = true; depois(.8, () => E.sub('ana', TXT.proc_fresta)); }
      if (s.flashOn) { s.stamina = s.stamina / 2; E.toast(TXT.proc_luz); }
      return true;
    }
    return false;
  });
  function cantoCorta() { const c = E.AMB.canto; som((ac, t) => { if (!c) return; c.g.gain.cancelScheduledValues(t); c.g.gain.setValueAtTime(Math.max(.0002, c.g.gain.value), t); c.g.gain.exponentialRampToValueAtTime(.0002, t + .25); }); }
  function cantoVolta() { const c = E.AMB.canto; som((ac, t) => { if (!c) return; c.g.gain.cancelScheduledValues(t); c.g.gain.setValueAtTime(.0002, t); c.g.gain.exponentialRampToValueAtTime(.12, t + .6); }); }

  // ===================================================================== ESCONDERIJOS
  API.armarioOcupado = seguro(L => {
    const s = S();
    if (L.sxOcupado) { E.SFX.trancado(); E.toast(TXT.ocupado_de_novo); return true; }
    if (s.flags.sx_ocupado || L !== D.armOcup || !(s.chapter === 2 || s.chapter === 3)) return false;
    if (M.ativo && M.state === 'caca' && dist2(M.pos, P.pos) < 14) return false;
    s.flags.sx_ocupado = true; L.sxOcupado = true; E.SFX.trancado(); respiracao({ x: L.x, y: 1.5, z: L.z }, 1.5, false, .5);
    depois(.5, () => { E.sub('ana', TXT.ocupado); voz({ x: L.x, y: 1.4, z: L.z }, { sopro: true, vogais: [[400, 2300], [700, 1300], [500, 1800]], dur: 1.1, vol: .12 }); });
    E.toast(TXT.ocupado_toast); return true;
  });
  API.aoEsconder = seguro(L => {
    const s = S(); D.hiddenT = 0; D.hiddenBateu = false; MUNDO.aoEsconder(L); L4.aoEsconder(L); L4b.aoEsconder(L);
    if (agora < D.ecoAte && D.ecoSala) { const r = D.ecoSala; depois(2, () => E.SFX.rangido((r.x0 + r.x1) / 2, 1, (r.z0 + r.z1) / 2, .5)); }
    if (L.tipo === 'cama') { D.camaN = (D.camaN || 0) + 1; D.camaT = 0; return; }
    const novo = !L.sxAberto; L.sxAberto = true;
    const capK = 'sx_arm' + s.chapter;
    if (novo && !s.flags[capK] && s.chapter >= 1 && !(M.ativo && M.state === 'caca')) {
      s.flags[capK] = true;
      if (s.chapter >= 2 && agora - D.ultimoForte > 45 && Math.random() < .5) {
        // rosto pálido dentro do armário vazio, por um piscar
        const f = L.face; ROSTO.position.set(L.x + f[0] * .27, 1.55, L.z + f[1] * .27); ROSTO.lookAt(L.x - f[0] * .05, 1.55, L.z - f[1] * .05); ROSTO.visible = true;
        E.SFX.susto(); marcarForte(); setTimeout(() => ROSTO.visible = false, 250);
      } else {
        // um uniforme velho escorrega do cabide em cima de você
        cabide(); elTecido.style.transition = 'transform .22s ease-in'; elTecido.style.transform = 'translateY(0)';
        setTimeout(() => { elTecido.style.transition = 'transform .9s ease-in'; elTecido.style.transform = 'translateY(110%)'; }, 700);
        setTimeout(() => { elTecido.style.transition = 'none'; elTecido.style.transform = 'translateY(-105%)'; }, 1800);
      }
    }
  });
  API.aoSair = seguro(L => {
    const s = S(); esconderFresta(); D.espia = null; MUNDO.aoSair(L); L4.aoSair(L); L4b.aoSair(L);
    if (agora < D.cantoSairAte) { D.cantoSairAte = 0; const a = atras(4); cantoCurto(a, 1.1, .04); }
    if (L && L.tipo === 'cama' && W.mapa === 'superior' && s.chapter === 3 && s.flags.sx_rostoCama && !s.flags.sx_anaSentada && !ANA.ativa) {
      const outra = W.lockers.filter(o => o.tipo === 'cama' && o !== L && Math.hypot(o.x - L.x, o.z - L.z) < 3.5)[0];
      if (outra) {
        s.flags.sx_anaSentada = true; ANA2.position.set(outra.x, .2, outra.z); ANA2.rotation.set(0, Math.atan2(outra.x - P.pos.x, outra.z - P.pos.z), 0); ANA2.visible = true;
        notas({ x: outra.x, y: 1, z: outra.z }, [659, 587, 523, 494, 523], .6, .035);
        let luzT = 0, girou = 0;
        anima(ANA2, dt => {
          const dd = Math.hypot(P.pos.x - outra.x, P.pos.z - outra.z);
          if (s.flashOn && E.visivel(ANA2.position, 1, 8)) luzT += dt;
          if (luzT > .8) { girou += dt; const alvoY = Math.atan2(P.pos.x - outra.x, P.pos.z - outra.z); ANA2.rotation.y = lerp(ANA2.rotation.y, alvoY, Math.min(1, dt * 1.2)); }
          if (girou > 1.4 || dd > 7 || ANA.ativa) { ANA2.visible = false; if (girou > 1.4) { maoContato(); D.piscaAte = agora + .5; E.SFX.risada(outra.x, outra.z); } return true; }
        });
      }
    }
  });
  function updateEsconderijo(dt) {
    const s = S(), L = s.hidden;
    if (!L) return;
    D.hiddenT += dt;
    // acampar no armário sem ameaça: batidas na porta e um "achei"
    const longe = !M.ativo || dist2(M.pos, P.pos) > 15;
    if (L.tipo === 'armario' && D.hiddenT > 45 && longe && !PROC.fase && !D.hiddenBateu && !s.flags['sx_bate' + s.chapter] && s.chapter >= 2) {
      D.hiddenBateu = true; s.flags['sx_bate' + s.chapter] = true;
      const p = { x: L.x + L.face[0] * .5, y: 1.3, z: L.z + L.face[1] * .5 };
      for (let i = 0; i < 3; i++) depois(i * .7, () => batida(p, .35));
      depois(2.6, () => { E.sub('ana', TXT.achei); voz(p, { sopro: true, vogais: [[700, 1300], [300, 2300]], dur: .7, vol: .12, wet: .05 }); });
    }
    // embaixo da cama, no andar de cima: o rosto dela no chão, ao seu lado; depois, a mão
    if (L.tipo === 'cama' && W.mapa === 'superior' && s.chapter === 3 && !ANA.ativa) {
      D.camaT = (D.camaT || 0) + dt;
      if (!s.flags.sx_rostoCama && D.camaT > 4) {
        s.flags.sx_rostoCama = true; const f = L.face; const cx = camera.position.x + f[0] * .75, cz = camera.position.z + f[1] * .75;
        ANA2.position.set(cx, .26 - 1.27, cz); ANA2.rotation.set(0, Math.atan2(camera.position.x - cx, camera.position.z - cz), 0); ANA2.visible = true;
        let visto = 0, t = 0;
        anima(ANA2, dt2 => { t += dt2; if (E.visivel({ x: cx, z: cz }, .2, 3)) visto += dt2; if (visto > .6 || t > 6 || !S().hidden) { if (visto > .6) { E.SFX.risada(cx, cz); marcarForte(); } ANA2.visible = false; ANA2.position.y = 0; return true; } });
      } else if (s.flags.sx_rostoCama && !s.flags.sx_maoCama && D.camaN >= 2 && D.camaT > 3) {
        s.flags.sx_maoCama = true; const f = L.face, lado = [f[1], -f[0]];
        const x0 = camera.position.x + lado[0] * .5 + f[0] * .2, z0 = camera.position.z + lado[1] * .5 + f[1] * .2;
        MAO.position.set(x0, .03, z0); MAO.rotation.set(0, Math.atan2(-lado[0], -lado[1]), 0); MAO.visible = true; let t = 0;
        anima(MAO, dt2 => { t += dt2; const k = t < .6 ? t / .6 : t < 1.4 ? 1 : Math.max(0, 1 - (t - 1.4) / .5); MAO.position.set(x0 - lado[0] * .25 * k, .03, z0 - lado[1] * .25 * k); if (t > 1.9) { MAO.visible = false; return true; } });
        E.sub('ana', TXT.mao_cama); voz({ x: x0, y: .3, z: z0 }, { sopro: true, vogais: [[300, 2300], [700, 1200], [400, 1900]], dur: .9, vol: .12, wet: .05 });
      }
    }
  }

  // ===================================================================== MORTE
  API.morte = seguro(quem => {
    MUNDO.morte(quem); L3.morte(quem); L4.morte(quem); L4b.morte(quem);
    D.fov0 = D.fov0 || camera.fov;
    setTimeout(() => restaurarVolume(), 2400);
    som((ac, t) => { const g = E.master.gain; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.setValueAtTime(g.value, t + .33); g.linearRampToValueAtTime(0, t + .38); g.setValueAtTime(0, t + .53); g.setValueAtTime(E.OPT.vol, t + .54); });
    setTimeout(seguro(() => {
      const f = fwdH(), c = camera.position, yawCam = Math.atan2(-f.x, -f.z);
      impactoGrave(1.5); if (!+E.OPT.vFlash) flashBranco(80); // 'Reduzir flashes' tira o clarão branco da morte
      luzRosto.position.set(c.x + f.x * .3, c.y - .45, c.z + f.z * .3); luzRosto.intensity = 9;
      let alvo;
      if (quem === 'inspetor') {
        MON.g.visible = true; MON.g.position.set(c.x + f.x * .62, c.y - 2.98, c.z + f.z * .62); MON.g.rotation.set(0, yawCam, 0);
        MON.armL.rotation.x = MON.armR.rotation.x = -1.3; alvo = () => { const h = new THREE.Vector3(); MON.cabeca.getWorldPosition(h); h.y += .1; return h; };
        estalos(MON.g.position, 4, .14); setTimeout(() => voz(null, { sopro: true, vogais: [[2800, 5200], [3200, 6000]], dur: .7, vol: .12, wet: .2 }), 450);
      } else if (quem === 'ana') {
        ANA_G.visible = false; ANA2.visible = true; ANA2.position.set(c.x + f.x * .42, c.y + 1.3, c.z + f.z * .42); ANA2.rotation.set(0, yawCam, Math.PI);
        alvo = () => new THREE.Vector3(ANA2.position.x, c.y, ANA2.position.z);
        voz(null, { f0: 160, vogais: [[400, 2100], [600, 1800], [300, 2300]], dur: 1, vol: .16, cai: .55 });
      } else {
        PROC.g.visible = false; OLHOS.visible = true; OLHOS.position.copy(c);
        OLHOS.children.forEach((o, i) => { const a = yawCam + Math.PI + (i - 4) * .32; o.position.set(Math.sin(a) * .8, (i % 3 - 1) * .22, Math.cos(a) * .8); o.lookAt(c); });
        alvo = () => new THREE.Vector3(c.x + f.x, c.y, c.z + f.z);
        for (const [k, fr] of [[0, 220], [1, 262], [2, 330]]) setTimeout(() => voz(null, { f0: fr, vogais: [[400, 2200], [700, 1100], [500, 1700]], dur: .9, vol: .07 }), k * 40);
      }
      const t0 = performance.now();
      (function anim() {
        const k = Math.min(1, (performance.now() - t0) / 650), s = S();
        camera.fov = lerp(D.fov0, 50, Math.min(1, k * 2)); camera.updateProjectionMatrix();
        if (alvo) { camera.lookAt(alvo()); camera.rotation.z += rand(-.04, .04) * (1 - k * .5); }
        if (quem === 'inspetor') { MON.cabeca.rotation.z = .45 + k * .85 + (Math.random() < .15 ? rand(-.2, .2) : 0); MON.cabeca.rotation.y = 0; }
        if (quem === 'procissao') OLHOS.children.forEach(o => { o.position.multiplyScalar(.985); o.lookAt(camera.position); });
        if (k < 1 && s && s.dead) requestAnimationFrame(anim);
      })();
    }), 400);
  });

  // ===================================================================== CHAMADO
  API.chamado = seguro((x, z, sala) => {
    const s = S(); s.flags.sx_chamados = (s.flags.sx_chamados || 0) + 1; const n = s.flags.sx_chamados;
    const pos = { x, y: 1.4, z };
    if (s.chapter === 4 && !s.flags.sx_chamadoIV) {
      s.flags.sx_chamadoIV = true; voz(pos, { f0: 230, vogais: [[300, 2300], [700, 1200], [300, 2300], [600, 1000]], dur: 1.3, vol: .1 }); E.sub('lia', TXT.chamado_davi);
    } else if (n === 3) {
      voz(pos, { f0: 220, vogais: [[300, 2300], [800, 1200]], dur: .9, vol: .11 }); E.sub('lia', TXT.chamado_lia);
    } else {
      voz(pos, { f0: 330, vogais: [[320, 2400], [330, 2300], [800, 1250], [780, 1200]], dur: .95, vol: .11 }); E.sub('davi', R.falas.chamado[0].texto);
    }
    if (n >= 2) { D.ecoAte = agora + 60; D.ecoSala = sala; }
  });
  API.chamadoVoz = seguro((x, z) => voz({ x, y: 1.4, z }, { f0: 330, vogais: [[320, 2400], [330, 2300], [800, 1250], [780, 1200]], dur: .95, vol: .11 }));
  API.armadilha = seguro(() => sustoCom(.5));
  // Segredo: a regra cinco manda nunca responder. V responde.
  API.responder = seguro(() => {
    const s = S(), c = E.chamado;
    if (!c || s.hidden || s.dead || s.flags.sx_respondeu) return;
    s.flags.sx_respondeu = true; E.limparChamado(); E.sub('lia', TXT.responder, true); E.emitNoise(P.pos.x, P.pos.z, 25, true);
    const hs = W.lockers.filter(l => l.tipo === 'armario').sort((a, b) => Math.hypot(a.x - (c.sala.x0 + c.sala.x1) / 2, a.z - (c.sala.z0 + c.sala.z1) / 2) - Math.hypot(b.x - (c.sala.x0 + c.sala.x1) / 2, b.z - (c.sala.z0 + c.sala.z1) / 2));
    const L = hs[0]; if (!L) return;
    P.bloqueado = true; E.fade(true, null, 400); if (M.ativo) M.cool = Math.max(M.cool, 3);
    setTimeout(seguro(() => {
      P.bloqueado = false; P.pos.set(L.x, 0, L.z); P.room = E.roomAt(L.x, L.z); E.entrarEsconderijo(L);
      if (M.ativo) { M.pos.set(L.x + L.face[0] * 2.2, 0, L.z + L.face[1] * 2.2); E.collide(M.pos, .3); M.state = 'procura'; M.searchT = 9; M.path = []; M.wait = 3; M.achou = false; M.cool = 3; }
      respiracao({ x: L.x + L.face[0] * 1.2, y: 2.6, z: L.z + L.face[1] * 1.2 }, 3, true, .7);
      E.fade(false); depois(1.2, () => E.sub('davi', TXT.responder_castigo));
    }), 1600);
  });

  // ===================================================================== ALUCINAÇÕES
  API.alucinacao = seguro(() => {
    const s = S();
    if ((M.ativo && M.state === 'caca') || PROC.fase || agora - D.ultimaCaca < 20) return true; // nada de alucinação no meio da caçada
    const r = Math.random();
    if (r < .3 && agora - D.alucT > 60) {
      D.alucT = agora; const f = fwdH(), lado = Math.random() < .5 ? 1 : -1, a = Math.atan2(f.x, f.z) + lado * rand(.75, .95), dd = rand(4, 6);
      const x = P.pos.x + Math.sin(a) * dd, z = P.pos.z + Math.cos(a) * dd;
      CRIANCA_OLHOS.position.set(x, 0, z); CRIANCA_OLHOS.rotation.y = Math.atan2(P.pos.x - x, P.pos.z - z); CRIANCA_OLHOS.visible = true; let t = 0;
      anima(CRIANCA_OLHOS, dt => { t += dt; CRIANCA_OLHOS.position.x += Math.cos(a) * dt * 2 * lado; if (t > .3) { CRIANCA_OLHOS.visible = false; return true; } });
      passoPos({ x, y: .2, z }, .4, true); return true;
    }
    if (r < .55) {
      const c = s.chapter, perto = (m = 3) => ({ x: P.pos.x + rand(-m, m), y: 1.4, z: P.pos.z + rand(-m, m) });
      if (c === 1) geradorFalha(perto(10));
      else if (c === 2) { const p = perto(6); for (let i = 0; i < 9; i++) depois(i * .22, () => passoPos({ x: p.x + i * .3, y: .1, z: p.z }, .45, true)); }
      else if (c === 3) { const f = fwdH(), esq = { x: P.pos.x + f.z * .45, y: 1.6, z: P.pos.z - f.x * .45 }; E.SFX.contagem(esq, 0); depois(1.1, () => E.SFX.contagem(esq, 1)); }
      else if (c === 4) { const p = atras(1.5); respiracao(p, 1.8, false, .5); bolhas({ x: p.x, y: .3, z: p.z }); }
      else if (c === 5) E.SFX.sino(.25, { x: P.pos.x + rand(-20, 20), y: 6, z: P.pos.z - 30 });
      else return false;
      return true;
    }
    if (r < .65) { E.sub('', TXT.legenda_mente); return true; }
    if (r < .72) { const d = portaDaSala(P.room, d => d.open && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) > 2.5)[0]; if (d) { bater(d); return true; } }
    return false;
  });

  // ===================================================================== GARRAFA DEVOLVIDA
  API.garrafaVolta = seguro(fim => {
    const s = S();
    if (s.flags.sx_garrafa || s.chapter < 2 || Math.random() > .08) return false;
    if (M.ativo && (dist2(M.pos, fim) < 15 || dist2(M.pos, P.pos) < 15)) return false;
    s.flags.sx_garrafa = true;
    const g = E.MK.garrafa(); g.rotation.z = Math.PI / 2; g.position.set(fim.x, .05, fim.z); scene.add(g);
    E.SFX.estalo({ x: fim.x, z: fim.z }, .3); let t = 0;
    const ini = { x: fim.x, z: fim.z };
    anima(g, dt => {
      t += dt; if (t < 2.5) return;
      const k = Math.min(1, (t - 2.5) / 3); g.position.x = lerp(ini.x, P.pos.x, k * .92); g.position.z = lerp(ini.z, P.pos.z, k * .92); g.rotation.x += dt * 9;
      if (!g.userData.som) { g.userData.som = true; rolar(g.position, 3); }
      if (k >= 1) { scene.remove(g); S().inv.garrafas++; E.renderInvMini(); E.toast(TXT.garrafa_toast); E.sub('ana', TXT.garrafa_volta); voz(atras(1), { sopro: true, vogais: [[400, 2200], [500, 1900], [700, 1200]], dur: .8, vol: .1 }); return true; }
    });
    return true;
  });

  // ===================================================================== PASSOS (eco e água)
  API.aoPasso = seguro(() => {
    L4.aoPasso(); L4b.aoPasso();
    if (agora < D.ecoPassosAte) { const a = atras(1.6); depois(.15, () => passoPos({ x: a.x, y: .1, z: a.z }, .5)); }
    if (P.naAgua) {
      anel(P.pos.x, P.pos.z);
      if (Math.random() < .12 && agora > (D.anelT || 0)) { D.anelT = agora + 8; const a = atras(2.2); depois(1.8, () => { anel(a.x, a.z, .8); som((ac, t) => { const g = E.saida({ x: a.x, y: .3, z: a.z }, .4); E.burst(t, .25, 'bandpass', 700, 1.5, g); E.env(g, t, .02, .2, .2); }); }); }
    }
  });

  // ===================================================================== PAUSA E FIM DE CAPÍTULO
  API.aoPausar = seguro(() => {
    L3.aoPausar();
    const s = S(); if (!s || s.flags.sx_pausa || !M.ativo || dist2(M.pos, P.pos) > 8) return;
    D.pausas = (D.pausas || 0) + 1; if (D.pausas < 3) return;
    s.flags.sx_pausa = true; const h = document.querySelector('#pause h2'); if (!h) return;
    const orig = h.textContent; h.textContent = TXT.pausa; h.style.color = '#c0392b'; passoPos({ x: M.pos.x, y: .3, z: M.pos.z }, .8);
    setTimeout(() => { h.textContent = orig; h.style.color = ''; }, 1000);
  });
  API.fimCap = seguro(() => {
    L3.fimCap();
    vacuo(1.5, .02);
    if (Math.random() < .34) setTimeout(() => voz(null, { sopro: true, vogais: [[300, 2400], [800, 1200]], dur: .6, vol: .14, wet: 0 }), 900);
    setTimeout(() => { if (!elFim) return; elFim.style.opacity = .85; E.SFX.estalo({ x: P.pos.x, z: P.pos.z }, .7); setTimeout(() => elFim.style.opacity = 0, 130); }, 3000);
  });

  // ===================================================================== DIRETOR DE SUSTOS (ambiente)
  const AMBIENTE = [
    { id: 'porta', ok: () => portaDaSala(P.room, d => d.open && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) > 3).length || W.doors.some(d => d.open && !d.grade && d.id !== 'main' && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) > 5 && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 14), fn: () => {
      const d = portaDaSala(P.room, d => d.open && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) > 3)[0] || W.doors.find(d => d.open && !d.grade && d.id !== 'main' && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) > 5 && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 14);
      if (d) bater(d);
    } },
    { id: 'lampada', ok: () => S().flags.energia && D.luzesApagadas < 4 && lampadasPerto(10).some(L => Math.hypot(L.x - P.pos.x, L.z - P.pos.z) > 2.5), fn: () => {
      const L = lampadasPerto(10).filter(L => Math.hypot(L.x - P.pos.x, L.z - P.pos.z) > 2.5)[0];
      for (let i = 0; i < 3; i++) depois(i * .25, () => { L.luz.intensity = 0; depois(.1, () => { if (!L.estourada) L.luz.intensity = L.base; }); });
      depois(.9, () => estourar(L, true));
    } },
    { id: 'cima', ok: () => W.mapa === 'terreo' && !P.room.fora, fn: () => { const f = fwdH(); for (let i = 0; i < 6; i++) depois(i * .7, () => passoPos({ x: P.pos.x + f.x * (4 - i * 1.4), y: 4.2, z: P.pos.z + f.z * (4 - i * 1.4) }, .9)); } },
    { id: 'bola', ok: () => !P.room.fora && !D.bolaMapa, fn: () => {
      D.bolaMapa = true; const [x, z] = E.pontoEm(P.room, 1); if (Math.hypot(x - P.pos.x, z - P.pos.z) < 3) return;
      const b = new THREE.Mesh(new THREE.SphereGeometry(.11, 12, 10), new THREE.MeshStandardMaterial({ color: 0x7a1a14, roughness: .6, emissive: 0x200404, emissiveIntensity: .5 }));
      b.position.set(x, .11, z); W.grupo.add(b); const alvo = { x: P.pos.x + rand(-.4, .4), z: P.pos.z + rand(-.4, .4) }; let t = 0; rolar({ x, y: .1, z }, 2.6);
      anima(b, dt => { t += dt; const k = Math.min(1, t / 2.6), e = 1 - Math.pow(1 - k, 2); b.position.x = lerp(x, alvo.x, e); b.position.z = lerp(z, alvo.z, e); b.rotation.x += dt * 6 * (1 - k); return k >= 1; });
      depois(3, () => E.SFX.risada(x, z));
    } },
    { id: 'radio', ok: () => S().chapter >= 2 && !P.room.fora, fn: () => { const p = atras(7); E.SFX.estatica(2.2, p); for (let i = 0; i < 3; i++) depois(.6 + i * 1.1, () => E.SFX.contagem(p, i)); } },
    { id: 'risada', ok: () => true, fn: () => { const a = atras(2.2); E.SFX.risada(a.x, a.z); } },
    { id: 'batidas', ok: () => !P.room.fora, fn: () => { const f = fwdH(), p = { x: P.pos.x + f.z * 2, y: 1.6, z: P.pos.z - f.x * 2 }; for (let i = 0; i < 3; i++) depois(i * .55, () => batida(p, .5)); } },
    { id: 'abre', ok: () => portaDaSala(P.room, d => !d.open && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 9).length, fn: () => {
      const d = portaDaSala(P.room, d => !d.open && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 9)[0];
      D.portaAnim.push({ d, de: d.target, para: -.35, t: 0, dur: 3 }); E.SFX.rangido(d.x, 1.2, d.z, .8); vento({ x: d.x, y: 1.5, z: d.z });
      if (M.ativo && M.state === 'patrulha' && dist2(M.pos, P.pos) > 20) depois(20, () => { if (M.ativo && M.state === 'patrulha') E.planejar(M, d.x + rand(-1, 1), d.z + rand(-1, 1)); });
    } },
    { id: 'corre', ok: () => P.room.tipo === 'corredor' && S().flashOn && !!fundoCorredor(P.room, 10), fn: () => {
      const p = fundoCorredor(P.room, 10); if (!p) return; const r = P.room;
      const de = p.ax === 'x' ? { x: p.x, z: r.z0 + .4 } : { x: r.x0 + .4, z: p.z }, para = p.ax === 'x' ? { x: p.x, z: r.z1 - .4 } : { x: r.x1 - .4, z: p.z };
      andarModelo(CRIANCA, de, para, Math.min(r.x1 - r.x0, r.z1 - r.z0) / .6, { descalco: true, passo: .12 });
    } },
    { id: 'silencio', ok: () => !S().flags['sx_silencio' + S().chapter], fn: () => {
      S().flags['sx_silencio' + S().chapter] = true; vacuo(4, 0); E.toast(TXT.nada_ouve);
      depois(4.1, () => { const a = atras(1.2); E.SFX.estalo(a, 1); });
    } },
    { id: 'caixinha', ok: () => S().chapter === 3 && S().inv.engrenagens < 3, fn: () => { const p = atras(8); notas(p, [659, 784, 659], .42, .06); } },
    { id: 'apagao', ok: () => S().flags.energia && P.room.tipo === 'corredor' && lampadasPerto(30).filter(L => E.roomAt(L.x, L.z) === P.room).length >= 3, fn: () => {
      const lamps = lampadasPerto(30).filter(L => E.roomAt(L.x, L.z) === P.room).sort((a, b) => Math.hypot(b.x - P.pos.x, b.z - P.pos.z) - Math.hypot(a.x - P.pos.x, a.z - P.pos.z));
      apagarEmSequencia(lamps, .4, 2); depois(lamps.length * .4, () => vacuo(2, .05));
    } }
  ];
  function diretor() {
    const s = S();
    if (agora < D.proxAmb) return;
    const semAmeaca = !(M.ativo && (M.state === 'caca' || dist2(M.pos, P.pos) < 15)) && !PROC.fase && !ANA.ativa && !s.hidden;
    if (!semAmeaca || s.fear >= 40 || M.tensao >= 30 || agora - D.ultimaCaca < 20 || agora - D.ultimoForte < 45 || s.flags.sino) { D.proxAmb = agora + 5; return; }
    let cands = AMBIENTE.filter(c => c.id !== D.ultimoTipo && !D.usados.has(c.id) && seguro(c.ok)());
    if (!cands.length) { D.usados.clear(); cands = AMBIENTE.filter(c => c.id !== D.ultimoTipo && seguro(c.ok)()); }
    D.proxAmb = agora + rand(75, 110) * dif().intervalo;
    if (!cands.length) return;
    const c = pick(cands); D.ultimoTipo = c.id; D.usados.add(c.id); seguro(c.fn)();
  }

  // ===================================================================== CORREDORES (vulto, passagem, teto)
  function updateCorredor(dt) {
    const s = S(), r = P.room;
    if (!r || r.tipo !== 'corredor') { D.escuroT = 0; if (TETO.visible && !D.tetoFoi) TETO.visible = false; return; }
    const comprido = Math.max(r.x1 - r.x0, r.z1 - r.z0) > 12, longe = !M.ativo || dist2(M.pos, P.pos) > 20;
    // o vulto parado no fim do corredor, só no escuro (uma vez por capítulo)
    if (!s.flashOn && comprido && longe && !PROC.fase) D.escuroT += dt; else D.escuroT = 0;
    if (D.escuroT > 8 && !s.flags['sx_vulto' + s.chapter] && !SOMBRA.visible) {
      const p = fundoCorredor(r, 11);
      if (p) {
        s.flags['sx_vulto' + s.chapter] = true; SOMBRA.position.set(p.x, 0, p.z); SOMBRA.rotation.set(0, Math.atan2(P.pos.x - p.x, P.pos.z - p.z), 0); SOMBRA.visible = true;
        if (SOMBRA.userData.cabeca) SOMBRA.userData.cabeca.rotation.set(0, 0, .6);
        let t = 0; anima(SOMBRA, dt2 => { t += dt2; if (S().flashOn || t > 9) { SOMBRA.visible = false; if (S().flashOn) { E.SFX.estatica(.3); E.SFX.estalo(p, .8); } return true; } });
      }
    }
    // a primeira vez no corredor em cada capítulo: algo atravessa o fundo, sem te ouvir
    if (!s.flags['sx_passa' + s.chapter + W.mapa] && longe && !SOMBRA.visible && !PROC.fase && agora > 6) {
      const p = fundoCorredor(r, 12);
      if (p) {
        s.flags['sx_passa' + s.chapter + W.mapa] = true;
        const de = p.ax === 'x' ? { x: p.x, z: r.z0 + .3 } : { x: r.x0 + .3, z: p.z }, para = p.ax === 'x' ? { x: p.x, z: r.z1 - .3 } : { x: r.x1 - .3, z: p.z };
        andarModelo(SOMBRA, de, para, 1.2, { passo: 1.1 });
      }
    }
    // segredo: no corredor de cima, quem aponta a luz para o teto vê ele grudado lá
    if (W.mapa === 'superior' && s.chapter === 3 && !s.flags.sx_teto && r.id === 'corr') {
      const perto = Math.abs(P.pos.z - (-33)) < 9;
      TETO.visible = perto && P.pitch > .45 && !D.tetoFoi;
      if (TETO.visible && s.flashOn && E.visivel({ x: 0, z: -34.5 }, 2.9, 12)) {
        D.tetoLuz = (D.tetoLuz || 0) + dt;
        if (D.tetoLuz > .35) { s.flags.sx_teto = true; D.tetoFoi = true; arranhao({ x: 0, y: 3, z: -34 }); marcarForte(); let t = 0; anima(TETO, dt2 => { t += dt2; TETO.position.y = 3.05 + t * 3; TETO.position.z -= dt2 * 6; if (t > .5) { TETO.visible = false; return true; } }); }
      }
    } else if (TETO.visible && !D.tetoFoi) TETO.visible = false;
  }

  // ===================================================================== PORTAS VIVAS
  function updatePortas(dt) {
    for (let i = D.portaAnim.length - 1; i >= 0; i--) { const a = D.portaAnim[i]; if (a.open0 === undefined) a.open0 = a.d.open; if (a.d.open !== a.open0) { D.portaAnim.splice(i, 1); continue; } a.t += dt; a.d.target = lerp(a.de, a.para, Math.min(1, a.t / a.dur)); if (a.t >= a.dur) D.portaAnim.splice(i, 1); }
    const s = S();
    if (P.room.fora || (M.ativo && dist2(M.pos, P.pos) < 15) || PROC.fase || s.hidden) { D.costasT = 0; return; }
    // a porta que abre sozinha enquanto você está de costas (uma por mapa)
    const kc = 'sx_costas_' + W.mapa;
    if (!s.flags[kc] && s.fear > 15 && s.fear < 85) {
      const f = fwdH(), d = portaDaSala(P.room, d => !d.open && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 6 && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) > 1.5)[0];
      if (d) { const vx = d.x - P.pos.x, vz = d.z - P.pos.z, l = Math.hypot(vx, vz); if ((f.x * vx + f.z * vz) / l < -.6) D.costasT += dt; else D.costasT = 0; if (D.costasT > 3) { s.flags[kc] = true; D.portaAnim.push({ d, de: d.target, para: -Math.PI * .45, t: 0, dur: 3.5 }); d.open = true; d.col.on = false; s.doorsOpen[`${W.mapa}:${d.id}`] = true; depois(3.3, () => E.SFX.rangido(d.x, 1.2, d.z, .35)); } }
      else D.costasT = 0;
    }
    // a porta que se fecha atrás de você, com alguém respirando do outro lado (uma por mapa)
    const kf = 'sx_fecha_' + W.mapa;
    if (D.fechaPend && !s.flags[kf]) {
      const fp = D.fechaPend, dd = Math.hypot(fp.d.x - P.pos.x, fp.d.z - P.pos.z);
      if (P.room !== fp.sala || !fp.d.open) D.fechaPend = null;
      else if (dd > 3) { s.flags[kf] = true; D.fechaPend = null; D.portaAnim.push({ d: fp.d, de: fp.d.target, para: 0, t: 0, dur: 2.2 }); E.SFX.rangido(fp.d.x, 1.2, fp.d.z, .8); depois(2.2, () => { fp.d.open = false; fp.d.col.on = true; S().doorsOpen[`${W.mapa}:${fp.d.id}`] = false; respiracao({ x: fp.d.x + fp.lado.x, y: 1.6, z: fp.d.z + fp.lado.z }, 2.4, false, .45); }); }
    }
  }
  function aoTrocarSala(de, para) {
    const s = S();
    if (!de || !para || de.fora || para.fora || s.flags['sx_fecha_' + W.mapa] || s.chapter < 1) return;
    const l = W.links.find(l => l.door && ((l.a === de.id && l.b === para.id) || (l.b === de.id && l.a === para.id)));
    if (l && l.door.open && !l.door.grade && l.door.id !== 'main' && !(l.door.trava) && Math.random() < .35) D.fechaPend = { d: l.door, sala: para, lado: { x: ((de.x0 + de.x1) / 2 - l.door.x) * .15, z: ((de.z0 + de.z1) / 2 - l.door.z) * .15 } };
  }

  // ===================================================================== MAPAS: TÉRREO
  function montarTerreo() {
    const s = S();
    // telefone da diretoria (antes ficava em cima do telefone da recepção, os dois no mesmo lugar)
    const msT = (W.spots.diret && W.spots.diret.mesa) || [], pT = msT.length > 2 ? msT[2] : msT[0] ? { x: msT[0].x + .35, y: msT[0].y, z: msT[0].z - .1 } : { x: 12, y: .8, z: -5 };
    const tel = new THREE.Group(); tel.position.set(pT.x, pT.y, pT.z); W.grupo.add(tel); const telP = { x: pT.x, y: pT.y + .15, z: pT.z };
    E.box(.24, .08, .18, E.MAT.preto, 0, .04, 0, tel); E.box(.26, .05, .07, E.MAT.preto, 0, .1, -.03, tel);
    const disco = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .01, 14), E.MAT.metal); disco.position.set(0, .085, .05); tel.add(disco);
    D.tel = { g: tel, n: 0, t: 0, p: telP };
    E.interact(tel, () => s.flags.sx_tel === 'tocando' ? '<b>E</b>Atender o telefone' : 'Um telefone de disco. Mudo.', seguro(() => {
      if (s.flags.sx_tel !== 'tocando') return;
      s.flags.sx_tel = 'atendido'; E.SFX.clique();
      const onde = { hall: 'na recepção, do seu lado', cw: 'no corredor oeste', ce: 'no corredor leste', aula: 'na sala de aula', biblio: 'na biblioteca', refeit: 'no refeitório', cozinha: 'na cozinha', despensa: 'na despensa', diret: 'na diretoria', enferm: 'na enfermaria', lavand: 'na lavanderia', banh: 'nos banheiros', maq: 'na casa de máquinas', patio: 'lá fora, no pátio' };
      const r = M.ativo ? E.roomAt(M.pos.x, M.pos.z) : null;
      MUNDO.telefone();
      depois(.9, () => { E.sub('davi', r ? TXT.telefone.replace('{onde}', onde[r.id] || 'perto') : TXT.telefone_longe, true); voz(telP, { sopro: true, vogais: [[300, 2300], [700, 1300], [400, 2000], [600, 1500]], dur: 1.8, vol: .1, wet: .05 }); });
    }));
    // quadro "Turma de 1978" na diretoria: a cada olhada, falta uma criança
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 192; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const desenhar = n => {
      const g = cv.getContext('2d'); g.fillStyle = '#4a3f2e'; g.fillRect(0, 0, 256, 192); g.fillStyle = '#8c7c5c'; g.fillRect(8, 8, 240, 150);
      g.fillStyle = '#2a2219'; g.font = 'bold 14px Georgia'; g.textAlign = 'center'; g.fillText(TXT.turma, 128, 176);
      g.font = 'italic 11px Georgia'; g.fillText(TXT.alunos.replace('{n}', n), 128, 189);
      let k = 0; const falt = [5, 17, 30];
      for (let row = 0; row < 3; row++) for (let i = 0; i < 13 && k < 37; i++, k++) {
        if (falt.slice(0, 37 - n).includes(k)) continue;
        const x = 22 + i * 17.5 + (row % 2) * 6, y = 52 + row * 34; g.fillStyle = '#1e1810';
        g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); g.fillRect(x - 6, y + 5, 12, 16);
      }
      if (n <= 34) { g.fillStyle = '#000'; for (const x of [70, 130, 190]) { g.beginPath(); g.arc(x, 26, 7, 0, 7); g.fill(); g.fillRect(x - 8, 32, 16, 18); g.fillStyle = '#ddd'; g.fillRect(x - 3, 24, 2, 2); g.fillRect(x + 1, 24, 2, 2); g.fillStyle = '#000'; } }
      tex.needsUpdate = true;
    };
    const turma = E.plano(1.1, .82, new THREE.MeshStandardMaterial({ map: tex, roughness: .9 }), 17.92, 2.25, -5, -Math.PI / 2);
    const n0 = s.flags.sx_turma || 37; desenhar(n0); D.turma = { m: turma, n: n0, visto: false, desenhar };
    // lençol da lavanderia com uma sombra de criança atrás
    const lc = W.grupo.children.find(o => o.isMesh && o.geometry && o.geometry.type === 'PlaneGeometry' && Math.abs(o.position.x - 11) < .3 && Math.abs(o.position.z - -17.6) < .3);
    if (lc) {
      const sc = document.createElement('canvas'); sc.width = 64; sc.height = 96; const g = sc.getContext('2d'); const grd = g.createRadialGradient(32, 40, 4, 32, 50, 46); grd.addColorStop(0, 'rgba(0,0,0,.85)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd; g.beginPath(); g.arc(32, 26, 11, 0, 7); g.fill(); g.fillRect(20, 36, 24, 50);
      const st = new THREE.CanvasTexture(sc); const sombraLc = new THREE.Mesh(new THREE.PlaneGeometry(.7, 1.05), new THREE.MeshBasicMaterial({ map: st, transparent: true, opacity: 0, depthWrite: false }));
      sombraLc.position.set(0, -.15, .02); lc.add(sombraLc); D.lencol = sombraLc;
    }
  }
  API.portaBate = seguro(() => {
    const d = E.DOOR('biblio'); setTimeout(() => { E.SFX.pancada(-30, -12); E.SFX.risada(-32, -20); }, 800);
    if (!d || d.open) return;
    depois(1.2, () => abrirDevagar(d, -1.1, 1.8, false));
    depois(3.6, () => { bater(d); E.SFX.risada(d.x, d.z + 3); });
  });
  API.lencol = seguro(() => {
    const m = D.lencol; if (!m) return; som((ac, t) => { const g = E.saida({ x: 11, y: 1.6, z: -17.6 }, .3); E.burst(t, .4, 'bandpass', 600, 1, g); E.env(g, t, .02, .3, .35); });
    let t = 0; anima(m, dt => { t += dt; m.material.opacity = t < .3 ? t / .3 * .8 : t < 1.6 ? .8 : Math.max(0, .8 - (t - 1.6) / .6 * .8); if (t > 1.2 && !m.userData.riu) { m.userData.riu = true; E.SFX.risada(11, -18.5); } if (t > 2.3) { m.material.opacity = 0; return true; } });
  });
  API.cascata = seguro((x, z, cb) => {
    const lamps = W.lampadas.filter(L => !L.sempre).sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z));
    lamps.forEach(L => { L.ligada = false; L.luz.intensity = 0; L.bulbo.material.emissiveIntensity = 0; });
    const ce = lamps.filter(L => { const r = E.roomAt(L.x, L.z); return r && r.id === 'ce'; });
    const ultima = ce.length ? ce[ce.length - 1] : null;
    lamps.forEach((L, i) => depois(.15 * i + .4, () => {
      if (L.estourada) return; L.ligada = true; L.luz.intensity = L.base; L.bulbo.material.emissiveIntensity = 2; E.SFX.estalo({ x: L.x, z: L.z }, .25);
      if (L === ultima && !S().flags.sx_cascata) {
        S().flags.sx_cascata = true; SOMBRA.position.set(L.x, 0, L.z + .2); SOMBRA.rotation.set(0, Math.atan2(P.pos.x - L.x, P.pos.z - L.z) + Math.PI, 0); SOMBRA.visible = true;
        depois(.9, () => { SOMBRA.visible = false; estourar(L, false); });
      }
    }));
    depois(.15 * lamps.length + 1.2, () => { if (cb) cb(); });
    // falso alívio: alguns segundos depois as luzes do corredor morrem vindo na sua direção
    depois(.15 * lamps.length + 4.5, () => {
      const ls = W.lampadas.filter(L => L.ligada && !L.estourada && E.roomAt(L.x, L.z) && ['ce', 'cw'].includes(E.roomAt(L.x, L.z).id)).sort((a, b) => Math.hypot(b.x - P.pos.x, b.z - P.pos.z) - Math.hypot(a.x - P.pos.x, a.z - P.pos.z));
      if (ls.length >= 2) apagarEmSequencia(ls, .35, 1.6);
    });
  });
  API.badaladas = seguro(() => {
    const s = S();
    if (s.flags.sx_badaladas) { E.SFX.badaladas(9); return; }
    s.flags.sx_badaladas = true; MUNDO.badaladas();
    for (let i = 0; i < 8; i++) setTimeout(() => E.SFX.sino(.45, null), i * 2200);
    setTimeout(() => vacuo(4.2, .03), 8 * 2200 - 1800);
    setTimeout(() => { const f = fwdH(); E.SFX.sino(1.2, { x: P.pos.x - f.z * 1.2, y: 2, z: P.pos.z + f.x * 1.2 }); P.shake = Math.max(P.shake, .2); marcarForte(); }, 8 * 2200 + 2600);
  });

  // ===================================================================== MAPAS: ANDAR DE CIMA
  function montarSuperior() {
    const s = S();
    // reflexo no espelho do banheiro
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 180; const tex = new THREE.CanvasTexture(cv);
    const reflexo = E.plano(.5, .7, new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false }), -10.2, 1.6, -26.135, Math.PI);
    const desenha = (esc) => { const g = cv.getContext('2d'); g.clearRect(0, 0, 128, 180); const cx = 64, cy = 92, k = esc; g.fillStyle = 'rgba(200,196,186,.9)'; g.beginPath(); g.ellipse(cx, cy - 20 * k, 10 * k, 13 * k, 0, 0, 7); g.fill(); g.fillStyle = '#050505'; g.beginPath(); g.ellipse(cx, cy - 24 * k, 13 * k, 16 * k, 0, Math.PI, 0); g.fill(); g.fillRect(cx - 13 * k, cy - 24 * k, 4 * k, 34 * k); g.fillRect(cx + 9 * k, cy - 24 * k, 4 * k, 34 * k); g.fillRect(cx - 4 * k, cy - 30 * k, 8 * k, 22 * k); g.fillStyle = 'rgba(160,154,140,.85)'; g.fillRect(cx - 12 * k, cy - 6 * k, 24 * k, 50 * k); tex.needsUpdate = true; };
    D.espelho = { m: reflexo, fase: s.flags.sx_espelho ? 9 : 0, visto: false, desenha };
    // volume que respira debaixo do lençol, no dormitório E
    const eng = W.items.find(i => i.key === 'superior:eng0');
    const camas = W.lockers.filter(L => L.tipo === 'cama' && E.roomAt(L.x, L.z) && E.roomAt(L.x, L.z).id === 'dormE' && (!eng || Math.hypot(L.x - eng.mesh.position.x, L.z - eng.mesh.position.z) > 1));
    if (camas.length >= 2 && !s.flags.sx_volume2) {
      const porta = { x: 3, z: -44 }; camas.sort((a, b) => Math.hypot(b.x - porta.x, b.z - porta.z) - Math.hypot(a.x - porta.x, a.z - porta.z));
      const vol = new THREE.Mesh(new THREE.BoxGeometry(.5, .26, 1.2), E.MAT.lencol); W.grupo.add(vol);
      D.volume = { m: vol, camas, fase: s.flags.sx_volume1 ? 1 : 0, t: 0 };
      const c = camas[D.volume.fase === 0 ? 0 : camas.length - 1]; vol.position.set(c.x, .78, c.z); if (c.ao === 'x') vol.rotation.y = Math.PI / 2; vol.visible = D.volume.fase === 0;
    }
    TETO.position.set(0, 3.05, -36); TETO.rotation.set(Math.PI / 2, 0, 0); TETO.visible = false; D.tetoFoi = !!s.flags.sx_teto;
    // gatilhos: mão no ombro na chegada, passos que imitam os seus no corredor
    E.gatilho('sx_ombro', -5, 5, -2, 1, seguro(() => { P.shake = Math.max(P.shake, .08); P.pitch = clamp(P.pitch + .07, -1.45, 1.45); E.SFX.arrastar(); som((ac, t) => { const g = E.saida(atras(.4), .1); E.burst(t, .6, 'bandpass', 2200, .8, g); E.env(g, t, .1, .2, .45); }); depois(1, () => E.sub('lia', TXT.ombro)); }));
    E.gatilho('sx_eco', -3, 3, -32, -26, seguro(() => { if (S().chapter !== 3) return; D.ecoPassosAte = agora + 6; depois(6.3, () => { const f = fwdH(); batida({ x: P.pos.x + f.x * 9, y: 1.2, z: P.pos.z + f.z * 9 }, 1); }); }));
  }
  API.espiaQuina = seguro(() => {
    const d = E.DOOR('so'); if (!d || S().chapter < 3) return;
    if (!d.open) abrirDevagar(d, -1.2, 1.4, false);
    SOMBRA.position.set(3.7, -.85, -54.6); SOMBRA.rotation.set(0, -Math.PI / 2, -.18); SOMBRA.visible = true; let t = 0;
    anima(SOMBRA, dt => { t += dt; if ((S().flashOn && E.visivel({ x: 3.3, z: -54.6 }, 2, 16) && t > .3) || t > 6) { SOMBRA.visible = false; SOMBRA.rotation.set(0, 0, 0); SOMBRA.position.y = 0; if (t <= 6) { E.SFX.estatica(.25); depois(.3, () => bater(d)); } return true; } });
  });

  // ===================================================================== MAPAS: TÚNEIS E CAPELA
  API.cofre = seguro(cb => {
    vacuo(2.6, .04);
    E.box(.55, .7, .45, E.MAT.madeiraEsc, 6.7, .35, -61.5);
    const gav = new THREE.Group(); gav.position.set(6.7, .6, -61.5); W.grupo.add(gav);
    E.box(.4, .12, .4, E.MAT.madeira, 0, 0, 0, gav); const venda = new THREE.Mesh(new THREE.TorusGeometry(.09, .025, 6, 14), new THREE.MeshStandardMaterial({ color: 0xece4d2, emissive: 0x303028, emissiveIntensity: .6 })); venda.rotation.x = Math.PI / 2; venda.position.y = .08; gav.add(venda);
    let t = 0; anima(gav, dt => { t += dt; gav.position.x = 6.7 - Math.min(1, t / 2) * .32; return t > 2; });
    E.SFX.rangido(6.6, .7, -61.5, .9); depois(1, () => E.SFX.rangido(6.5, .7, -61.5, .6));
    depois(2.6, () => { if (cb) cb(); marcarForte(); });
  });
  API.sino = seguro(() => {
    const velas = []; W.grupo.traverse(o => { if (o.isPointLight && o.userData.vela) velas.push(o); });
    velas.sort((a, b) => a.position.x - b.position.x).forEach((l, i) => depois(.8 + i * .45, () => { l.userData.apagada = true; vento({ x: l.position.x, y: 1.4, z: l.position.z }, .8); }));
  });
  API.cisterna = seguro(() => { const a = atras(3); depois(1.5, () => { respiracao({ x: a.x, y: .5, z: a.z }, 2.2, false, .5); bolhas({ x: a.x, y: .3, z: a.z }); anel(a.x, a.z, .9); }); });

  // ===================================================================== EVENTOS QUE OLHAM O ESTADO
  function vigiarEstado(dt) {
    const s = S(), pv = D.prev;
    // Cap. I: forçar a porta — relâmpago e ele atravessa a recepção, de uma porta à outra
    if (W.mapa === 'terreo' && s.chapter === 1 && s.done.forcar_porta && !pv.forcar && !s.flags.sx_recepcao) {
      s.flags.sx_recepcao = true;
      depois(.6, () => { E.raio(); const a = E.DOOR('hcw'), b = E.DOOR('hce'); if (a && !a.open) E.setDoor(a, true, true); if (b && !b.open) E.setDoor(b, true, true); vacuo(3.5, .2); andarModelo(SOMBRA, { x: -7, z: -12.2 }, { x: 7.5, z: -12.2 }, 2.1, { passo: .8 }); });
    }
    pv.forcar = !!s.done.forcar_porta;
    // Cap. I: o galão — ele passa pela porta da despensa, de perfil, sem entrar
    if (W.mapa === 'terreo' && s.chapter === 1 && s.inv.galao && !pv.galao && !s.flags.sx_galao) {
      s.flags.sx_galao = true;
      if (!M.ativo || dist2(M.pos, P.pos) > 14) depois(1.4, () => { vacuo(4.5, .15); andarModelo(SOMBRA, { x: -33, z: -23.6 }, { x: -25, z: -23.6 }, 1.5, { passo: 1 }); });
    }
    pv.galao = !!s.inv.galao;
    // Cap. I: a primeira vez que abre a enfermaria, ele está parado do outro lado, de costas
    const de = W.mapa === 'terreo' ? E.DOOR('enferm') : null;
    if (de && de.open && pv.enferm === false && s.chapter === 1 && !s.flags.sx_enferm && Math.hypot(P.pos.x - de.x, P.pos.z - de.z) < 3.2 && (!M.ativo || dist2(M.pos, P.pos) > 18)) {
      s.flags.sx_enferm = true; SOMBRA.position.set(de.x + .2, -.3, de.z + 1.5); SOMBRA.rotation.set(0, 0, 0); SOMBRA.visible = true; if (SOMBRA.userData.cabeca) SOMBRA.userData.cabeca.rotation.set(0, 0, .45); marcarForte();
      vacuo(1.6, .1); depois(1.2, () => apagao(.35)); depois(1.35, () => { SOMBRA.visible = false; SOMBRA.position.y = 0; });
    }
    if (de) pv.enferm = de.open;
    // Cap. I/II: a diretoria abre sozinha, com passos; depois bate quando você sai
    const dd = W.mapa === 'terreo' ? E.DOOR('diret') : null;
    if (dd && P.room.id === 'ce' && s.chapter >= 1 && !s.flags.sx_diret && !dd.open && s.done.forcar_porta && (!M.ativo || dist2(M.pos, P.pos) > 16)) {
      s.flags.sx_diret = true; D.diretAberta = agora; abrirDevagar(dd, -Math.PI * .5, 3.5); for (let i = 0; i < 4; i++) depois(.5 + i * .5, () => passoPos({ x: dd.x, y: .2, z: dd.z + 1 + i * .6 }, .35));
    }
    if (dd && D.diretAberta && pv.sala === 'diret' && P.room.id === 'ce' && agora - D.diretAberta > 20 && dd.open && Math.hypot(P.pos.x - dd.x, P.pos.z - dd.z) > 1.4) { D.diretAberta = 0; bater(dd); E.SFX.risada(dd.x, dd.z + 3); }
    // Cap. I: enfermaria — o relâmpago desenha alguém parado no pátio
    // Cap. II: telefone toca depois da Procissão
    if (W.mapa === 'terreo' && s.chapter === 2 && s.done.procissao && !s.flags.sx_tel && ['hall', 'cw', 'ce'].includes(P.room.id) && D.tel) { s.flags.sx_tel = 'tocando'; D.tel.t = 3; D.tel.n = 0; }
    if (W.mapa === 'terreo' && s.flags.sx_tel === 'tocando' && D.tel) {
      D.tel.t += dt;
      if (D.tel.t >= 3) { D.tel.t = 0; D.tel.n++; telefoneToque(D.tel.p); E.emitNoise(D.tel.p.x, D.tel.p.z, 12); if (D.tel.n > 6) s.flags.sx_tel = 'ignorado'; }
    }
    // quadro da turma: some uma criança a cada vez que você olha de novo
    if (D.turma && W.mapa === 'terreo' && P.room.id === 'diret') {
      const v = E.visivel(D.turma.m.position, 2.25, 7);
      if (v && !D.turma.visto) { D.turma.visto = true; if (D.turma.jaViu && D.turma.n > 34) { D.turma.n--; s.flags.sx_turma = D.turma.n; D.turma.desenhar(D.turma.n); if (D.turma.n === 34) { E.SFX.estalo({ x: 17, z: -5 }, .8); marcarForte(); } } D.turma.jaViu = true; }
      else if (!v) D.turma.visto = false;
    }
    // espelho do banheiro de cima: ela aparece atrás de você, cada vez mais perto
    if (D.espelho && W.mapa === 'superior' && P.room.id === 'banhS' && s.chapter >= 3 && D.espelho.fase < 9) {
      const e = D.espelho, v = s.flashOn && E.visivel(e.m.position, 1.6, 5);
      if (v && !e.visto) {
        e.visto = true;
        if (e.fase === 0) { e.desenha(.55); e.m.material.opacity = .8; e.fase = 1; }
        else if (e.fase === 2) { e.desenha(1.25); e.m.material.opacity = .9; e.fase = 3; respiracao(atras(.6), 1.5, false, .6); marcarForte(); }
        else if (e.fase === 4) { e.m.material.opacity = 0; e.fase = 9; s.flags.sx_espelho = true; E.SFX.risada(P.pos.x, P.pos.z); }
      } else if (!v && e.visto) { e.visto = false; if (e.fase === 1 || e.fase === 3) { e.fase++; if (e.fase === 4) e.m.material.opacity = 0; } }
    }
    // volume debaixo do lençol
    if (D.volume && D.volume.m.visible) {
      const V = D.volume; V.t += dt; V.m.scale.y = 1 + Math.sin(V.t * 1.6) * .07;
      if (Math.hypot(P.pos.x - V.m.position.x, P.pos.z - V.m.position.z) < 2) {
        V.m.visible = false; E.SFX.arrastar(); if (V.fase === 0) { s.flags.sx_volume1 = true; V.fase = 1; } else { s.flags.sx_volume2 = true; E.SFX.risada(V.m.position.x, V.m.position.z); V.fase = 2; }
      }
    }
    if (D.volume && D.volume.fase === 1 && !D.volume.m.visible && s.inv.engrenagens >= 3 && !s.flags.sx_volume2) {
      const c = D.volume.camas[D.volume.camas.length - 1]; if (Math.hypot(P.pos.x - c.x, P.pos.z - c.z) > 3.2) { D.volume.m.position.set(c.x, .78, c.z); D.volume.m.rotation.y = c.ao === 'x' ? Math.PI / 2 : 0; D.volume.m.visible = true; }
    }
    // estrada: o vulto te acompanha quando você olha para trás
    if (W.mapa === 'estrada' && s.flags.faroisMortos && !s.flags.sx_estradaFim && P.room && P.room.id === 'estrada' && P.pos.z < 0 && P.pos.z > -68) {
      const f = fwdH(), olhaTras = f.z > .55;
      if (olhaTras && !D.olhavaTras && agora > (D.estradaT || 0)) {
        D.estradaT = agora + 4; s.flags.sx_estradaN = (s.flags.sx_estradaN || 0) + 1; const n = s.flags.sx_estradaN;
        if (n >= 3) { s.flags.sx_estradaFim = true; SOMBRA.visible = false; for (let i = 0; i < 3; i++) depois(i * .5, () => passoPos({ x: P.pos.x + f.z * 1.4, y: .1, z: P.pos.z - f.x * 1.4 + i * .3 }, .7)); }
        else { const dz = 26 - n * 8, lado = (n % 2 ? 1 : -1) * 5.2; SOMBRA.position.set(clamp(P.pos.x + lado, -6.5, 6.5), 0, P.pos.z + dz); SOMBRA.rotation.set(0, Math.PI, 0); SOMBRA.visible = true; D.estradaVulto = true; }
      }
      if (!olhaTras && D.estradaVulto) { D.estradaVulto = false; SOMBRA.visible = false; }
      if (D.estradaVulto && SOMBRA.visible) { const vx = SOMBRA.position.x - camera.position.x, vz = SOMBRA.position.z - camera.position.z, l = Math.hypot(vx, vz); if ((f.x * vx + f.z * vz) / l > .985) { SOMBRA.visible = false; D.estradaVulto = false; E.SFX.estatica(.2); } }
      D.olhavaTras = olhaTras;
    }
    pv.sala = P.room.id;
  }

  // ===================================================================== GANCHOS DE CICLO
  API.novoMapa = seguro(id => {
    D.mapaAnterior = D.mapa; D.mapa = id;
    fila.length = 0; const fixos = [SOMBRA, TETO, CRIANCA, CRIANCA_OLHOS, ANA2, ROSTO, MAO, OLHOS]; for (const a of temporarios) { if (a.obj && a.obj.parent === scene && !fixos.includes(a.obj)) scene.remove(a.obj); } temporarios.length = 0; D.salaAnt = null;
    esconderModelos(); esconderFresta(); elAzul.style.opacity = 0; elMao.classList.remove('on'); elRosto.style.opacity = 0;
    if (D.fov0) { camera.fov = D.fov0; camera.updateProjectionMatrix(); }
    restaurarVolume();
    D.apagaoT = 0; D.piscaAte = 0; D.espia = null; D.portaAnim = []; D.procParou = 0; D.aviso = null; D.dezJanela = 0; D.anaPrende = null; D.fechaPend = null; D.bolaMapa = false; D.luzesApagadas = 0;
    D.tel = null; D.turma = null; D.espelho = null; D.volume = null; D.lencol = null; D.diretAberta = 0; D.usados.clear(); D.prev = {};
    const s = S(); if (!s) return;
    D.prev = { forcar: !!s.done.forcar_porta, galao: !!s.inv.galao, sala: null };
    const arm = W.lockers.filter(l => l.tipo === 'armario'); D.armOcup = arm.length ? pick(arm) : null;
    if (id === 'terreo') montarTerreo();
    if (id === 'superior') { montarSuperior(); if (!s.flags.sx_chegouCima) { s.flags.sx_chegouCima = true; depois(4, () => batida({ x: 0, y: -2, z: 6 }, 1)); } }
    MUNDO.novoMapa(id); L3.novoMapa(id); L4.novoMapa(id); L4b.novoMapa(id);
    if (id === 'tuneis' && D.mapaAnterior === 'superior' && !s.flags.sx_poco) { s.flags.sx_poco = true; depois(1.4, () => { voz({ x: 0, y: 4, z: -1 }, { f0: 520, vogais: [[300, 2300], [500, 2000], [700, 1200]], dur: 1, vol: .1 }); E.sub('ana', TXT.nove_poco); }); }
  });
  API.update = seguro(dt => {
    const s = S(); if (!s || s.dead || !P.room) return;
    agora += dt;
    if (D.apagaoT > 0) D.apagaoT -= dt;
    if (M.ativo && M.state === 'caca') D.ultimaCaca = agora;
    if (PROC.fase) D.ultimaCaca = Math.max(D.ultimaCaca, agora - 10); else { D.aviso = null; D.procParouNesta = false; }
    if (PROC.fase !== 'passando' && D.procParou > 0) { D.procParou = 0; elVerm.style.opacity = 0; }
    if (D.falsaT > 0) { D.falsaT -= dt; for (const L of W.lampadas) { if (!L.ligada) continue; const on = Math.random() < .35; L.luz.intensity = on ? L.base : 0; L.bulbo.material.emissiveIntensity = on ? 2 : 0; } }
    if (P.room !== D.salaAnt) { aoTrocarSala(D.salaAnt, P.room); D.salaAnt = P.room; }
    for (let i = fila.length - 1; i >= 0; i--) if (fila[i].t <= agora) { const f = fila.splice(i, 1)[0]; seguro(f.fn)(); }
    for (let i = temporarios.length - 1; i >= 0; i--) { let fim = false; try { fim = temporarios[i].upd(dt); } catch (e) { fim = true; console.warn('[sustos]', e && e.message); } if (fim) temporarios.splice(i, 1); }
    updateInspetorSustos(dt); updateAnaSustos(dt); updateEsconderijo(dt); updateCorredor(dt); updatePortas(dt); vigiarEstado(dt);
    diretor();
    MUNDO.update(dt); L3.update(dt, s); L4.update(dt, s); L4b.update(dt, s);
  });
  const MUNDO = instalarMundo(E, { D, depois, anima, voz, respiracao, passoPos, batida, vacuo, marcarForte, apagao, notas, arranhao, vento, rolar, atras, fwdH, dist2, abrirDevagar, bater, andarModelo, portaDaSala, fundoCorredor, seguro, som, maoContato, AMBIENTE, agora: () => agora });
  const L3 = instalarSustosL3(E, { D, depois, anima, voz, respiracao, passoPos, batida, vacuo, marcarForte, apagao, rolar, atras, fwdH, dist2, abrirDevagar, andarModelo, portaDaSala, seguro, som, agora: () => agora, SOMBRA, ANA2, CRIANCA, luzRosto });
  // Lote 4: segredos e easter eggs (src/sustos-segredos.js)
  const L4 = instalarSustosL4(E, { D, depois, anima, voz, respiracao, passoPos, batida, vacuo, marcarForte, apagao, notas, rolar, vento, atras, fwdH, dist2, abrirDevagar, bater, portaDaSala, fundoCorredor, seguro, som, sustoCom, agora: () => agora, SOMBRA, ANA2, CRIANCA, luzRosto });
  API._L4 = L4;
  // Lote 4 (parte 2): mais segredos e eventos (src/sustos-segredos2.js)
  const L4b = instalarSustosL4b(E, { D, depois, anima, voz, respiracao, passoPos, batida, vacuo, marcarForte, apagao, notas, rolar, vento, atras, fwdH, dist2, abrirDevagar, bater, portaDaSala, fundoCorredor, seguro, som, sustoCom, agora: () => agora, SOMBRA, ANA2, CRIANCA, luzRosto });
  API._L4b = L4b;
  // Lote 3: o motor multiplica o dt do mundo (golpe congela, 'por um fio' desacelera), avisa o golpe e espera a queda na morte
  API.escala = dt => { try { return L3.escala(dt); } catch (e) { return dt; } };
  API.golpe = seguro(q => L3.golpe(q));
  API.atrasoMorte = r => { try { return L3.atrasoMorte(r) || 0; } catch (e) { return 0; } };
  API._L3 = L3; // depuração (kit de teste)
  API.vacuo = vacuo; API.sustoCom = sustoCom; API.agora = () => agora; API._D = D;
  window.__sustos = API;
  return API;
}
