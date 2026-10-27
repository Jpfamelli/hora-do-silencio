// MONSTROS E LORE — A Hora do Silêncio (Lote 2, área Monstros e IA)
// A vida das entidades: o chaveiro, o apito e o crachá do Inspetor, os lugares e objetos que são dele,
// as rotinas de memória (camas, canecas, o túmulo do Luiz), a Procissão com rosto e nome,
// a Ana que lembra de você, e as presenças que não atacam (Davi, Seu Joaquim, o diretor Albano, a Irmã Celeste).
// O motor (jogo.js) chama criarMonstrosLore(E) uma vez e usa os ganchos devolvidos (poucas linhas lá).
import * as THREE from 'three';

export function criarMonstrosLore(E) {
  const { R, rand, pick, clamp, lerp, camera, scene, W, P, M, MON, ANA, PROC, MAT, OPT } = E;
  const T = R.monstros2 || {};
  const L2 = T.legendas || {};
  const S = () => E.S;
  const F = () => (E.S && E.S.flags) || {};
  const seguro = fn => (...a) => { try { return fn(...a); } catch (e) { console.warn('[monstros-lore]', e && e.message); } };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const pesadelo = () => S() && S().dif === 'pesadelo';
  const fwdH = () => { const f = new THREE.Vector3(); camera.getWorldDirection(f); f.y = 0; if (f.lengthSq() < 1e-6) f.set(0, 0, -1); return f.normalize(); };
  const temAudio = () => !!E.AC;
  // Lia já sabe quem é (desenho do aniversário, fita do Davi ou a cabeceira dele): os monstros também sabem
  const liaReconhecida = () => { const St = S(); return !!(St && (St.notes.n13 || St.fitas.f4 || St.flags.seg_dm)); };

  // ---------------- relógio próprio (só corre jogando) e fila de eventos
  let agora = 0; const fila = [];
  const depois = (s, fn) => fila.push({ t: agora + s, fn });

  // ---------------- legendas de som próprias (respeitam a opção "Legendar sons")
  const leg = document.createElement('div'); leg.id = 'ml-leg';
  leg.style.cssText = 'position:fixed;left:50%;bottom:24%;transform:translateX(-50%);font:italic 15px Georgia,serif;color:#cdbfae;text-shadow:0 0 6px #000,0 0 2px #000;pointer-events:none;z-index:6;opacity:0;transition:opacity .4s;text-align:center;max-width:80vw';
  document.body.appendChild(leg);
  let legT = 0; const legCd = {};
  function legenda(k, importante = true) {
    const txt = L2[k] || k; if (!txt || OPT.legSom === 'nao' || (!importante && OPT.legSom !== 'todos')) return;
    if ((legCd[k] || -99) > agora - 4) return; legCd[k] = agora;
    leg.textContent = '[' + txt + ']'; leg.style.opacity = 1; legT = 2.8;
  }

  // ---------------- sons procedurais novos
  const SOM = {
    chaves(pos, vol = 1) { // o molho de chaves dos armários, a cada passo
      const t = E.AC.currentTime;
      for (let i = 0; i < 4; i++) { const g = E.saida({ x: pos.x, y: 1.2, z: pos.z }, .4); const k = t + i * rand(.02, .05); E.osc('triangle', rand(2800, 5200), k, .18, g); E.env(g, k, .001, .05 * vol, rand(.08, .16)); }
    },
    apito(pos, vol = 1) { // apito de metal, curto e rachado
      const t = E.AC.currentTime, g = E.saida({ x: pos.x, y: 3, z: pos.z }, .6);
      const o = E.AC.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(2350, t); o.frequency.linearRampToValueAtTime(2200, t + .32);
      const tr = E.AC.createOscillator(); tr.frequency.value = 38; const tg = E.AC.createGain(); tg.gain.value = 140; tr.connect(tg); tg.connect(o.frequency);
      const f = E.AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 3; o.connect(f); f.connect(g);
      E.env(g, t, .01, .22 * vol, .32); o.start(t); tr.start(t); o.stop(t + .4); tr.stop(t + .4);
      const g2 = E.saida({ x: pos.x, y: 3, z: pos.z }, .6); E.burst(t, .35, 'bandpass', 3800, 2, g2); E.env(g2, t, .01, .12 * vol, .3);
    },
    caneca(pos) { const t = E.AC.currentTime, g = E.saida({ x: pos.x, y: 1.1, z: pos.z }, .5); E.osc('sine', rand(1900, 2300), t, .5, g); E.osc('sine', rand(4100, 4600), t, .3, g); E.env(g, t, .001, .12, .4); },
    lencol(pos) { const t = E.AC.currentTime, g = E.saida({ x: pos.x, y: .7, z: pos.z }, .4); const f = E.burst(t, .7, 'bandpass', 1200, .8, g); f.frequency.linearRampToValueAtTime(700, t + .6); E.env(g, t, .15, .16, .5); },
    choro(pos) { // um menino chorando abafado
      const t = E.AC.currentTime;
      for (let i = 0; i < 3; i++) { const k = t + i * .55; E.silaba(k, { x: pos.x, y: 1.2, z: pos.z }, rand(300, 360), i % 2 ? 'u' : 'i', .35, .05, 'voz', .2); }
    },
    cochicho(pos, vol = 1) { const t = E.AC.currentTime; for (let i = 0; i < 6; i++) { const g = E.saida(pos ? { x: pos.x, y: 1.4, z: pos.z } : null, .1); E.burst(t + i * .13, .1, 'bandpass', rand(2400, 4200), 3, g); E.env(g, t + i * .13, .02, .09 * vol, .08); } },
    terco(pos) { const t = E.AC.currentTime; for (let i = 0; i < 9; i++) { const g = E.saida({ x: pos.x, y: 1.2, z: pos.z }, .4), k = t + i * rand(.06, .12); E.osc('triangle', rand(3000, 3800), k, .05, g); E.env(g, k, .001, .06, .04); } },
    cantigaRoda(pos) { // cantiga de roda inventada, voz de menina, que pode ser cortada no meio
      const t = E.AC.currentTime, g = E.saida({ x: pos.x, y: 1.1, z: pos.z }, .6), o = E.AC.createOscillator(); o.type = 'sine';
      const notas = [784, 784, 880, 784, 659, 698, 784, 659, 587, 659, 523]; notas.forEach((n, i) => o.frequency.setValueAtTime(n, t + i * .32));
      const vib = E.AC.createOscillator(); vib.frequency.value = 6; const vg = E.AC.createGain(); vg.gain.value = 6; vib.connect(vg); vg.connect(o.frequency);
      o.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.07, t + .1); g.gain.setValueAtTime(.07, t + 3.3); g.gain.exponentialRampToValueAtTime(.0001, t + 3.6);
      o.start(t); vib.start(t); o.stop(t + 3.7); vib.stop(t + 3.7);
      return () => { const k = E.AC.currentTime; try { g.gain.cancelScheduledValues(k); g.gain.setValueAtTime(.0001, k); o.stop(k + .02); vib.stop(k + .02); } catch (e) {} };
    },
    assobio(pos) { // cinco notas assobiadas, sempre as mesmas
      const t = E.AC.currentTime; [[0, 1175], [.35, 1319], [.7, 1175], [1.05, 988], [1.6, 1047]].forEach(([k, f]) => { const g = E.saida({ x: pos.x, y: 1.8, z: pos.z }, .8); const o = E.osc('sine', f, t + k, .4, g); o.frequency.linearRampToValueAtTime(f * 1.02, t + k + .3); E.env(g, t + k, .04, .09, .3); });
    },
    carrinho(pos) { // rodinhas rolando pelo teto, de um lado para o outro, e uma risada abafada
      const t = E.AC.currentTime, x0 = pos.x - 5, x1 = pos.x + 5;
      for (let i = 0; i < 10; i++) { const g = E.saida({ x: lerp(x0, x1, i / 9), y: 4.6, z: pos.z + rand(-2, 2) }, .5); const lp = E.AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.connect(g); E.burst(t + i * .2, .22, 'bandpass', 260, 1, lp); E.env(g, t + i * .2, .04, .3, .2); }
      E.silaba(t + 2.3, { x: x1, y: 4.6, z: pos.z }, 420, 'i', .12, .03, 'voz', .5); E.silaba(t + 2.45, { x: x1, y: 4.6, z: pos.z }, 400, 'i', .12, .025, 'voz', .5);
    },
    pisao(pos) { const t = E.AC.currentTime; for (const k of [0, .3]) { const g = E.saida({ x: pos.x, y: .1, z: pos.z }, .4); const o = E.AC.createOscillator(); o.frequency.setValueAtTime(90, t + k); o.frequency.exponentialRampToValueAtTime(40, t + k + .12); o.connect(g); E.env(g, t + k, .005, .5, .15); o.start(t + k); o.stop(t + k + .2); } },
    passinhos(pos, dir) { for (let i = 0; i < 6; i++) { const t = E.AC.currentTime + i * .17, g = E.saida({ x: pos.x + dir.x * i * .7, y: .1, z: pos.z + dir.z * i * .7 }, .4); E.burst(t, .04, 'highpass', 1600, 1, g); E.env(g, t, .002, .25, .04); } },
    chiado(pos) { const t = E.AC.currentTime, g = E.saida({ x: pos.x, y: 1, z: pos.z }, .3); E.burst(t, .4, 'highpass', 5000, 1, g); E.env(g, t, .01, .08, .35); },
    rangido(pos) { E.SFX.rangido(pos.x, 1.1, pos.z, .5); },
    vozMenino(pos) { const t = E.AC.currentTime; for (let i = 0; i < 4; i++) E.silaba(t + i * .2, { x: pos.x, y: 2.8, z: pos.z }, rand(165, 190), pick(['e', 'a', 'o']), .17, .05); },
    vozHomem(pos) { const t = E.AC.currentTime; for (let i = 0; i < 5; i++) E.silaba(t + i * .24, { x: pos.x, y: 2.8, z: pos.z }, rand(105, 118), pick(['e', 'a', 'u', 'o']), .2, .045); },
    reza(pos) { const t = E.AC.currentTime; for (let i = 0; i < 8; i++) E.silaba(t + i * .3, { x: pos.x, y: 1.5, z: pos.z }, rand(200, 215), pick(['e', 'a', 'o']), .25, .035, 'voz', .6); },
    numero(pos, n) { E.SFX.contagem(pos, clamp(n, 0, 8)); }
  };
  const SX2 = new Proxy({}, { get: (t, k) => (...a) => { if (!temAudio()) return; try { return SOM[k] && SOM[k](...a); } catch (e) { console.warn(e); } } });

  // ---------------- uma luz extra compartilhada (lampião dele, lanterninha do Davi, lampião do Joaquim, brasa do cigarro)
  const luz = new THREE.PointLight(0xffb060, 0, 7, 2); scene.add(luz); let luzDono = null;
  const pedirLuz = (dono, cor, int, alc, x, y, z) => { if (luzDono && luzDono !== dono) return false; luzDono = dono; luz.color.setHex(cor); luz.intensity = int; luz.distance = alc; luz.position.set(x, y, z); return true; };
  const soltarLuz = dono => { if (luzDono === dono) { luzDono = null; luz.intensity = 0; } };

  // ---------------- texturas em canvas
  const tex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const TX_CRACHA = tex(128, 64, (g, w, h) => { g.fillStyle = '#c9c1a8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5a5040'; g.lineWidth = 3; g.strokeRect(3, 3, w - 6, h - 6); g.fillStyle = '#2a2418'; g.font = 'bold 19px Georgia'; g.fillText('M. DUARTE', 12, 28); g.font = '13px Georgia'; g.fillText('DISCIPLINA', 12, 48); g.fillStyle = 'rgba(80,50,20,.35)'; g.fillRect(90, 10, 26, 26); });
  const TX_VENDA = tex(256, 32, (g, w, h) => { g.fillStyle = '#bcae94'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(90,70,50,.25)'; for (let i = 0; i < 40; i++) g.fillRect(Math.random() * w, Math.random() * h, 6, 1); g.fillStyle = '#6a2020'; g.fillRect(118, 8, 4, 16); g.fillRect(112, 14, 16, 4); g.fillStyle = '#4a3a2a'; g.font = 'italic bold 14px Georgia'; g.fillText('M.D.', 132, 22); });
  const TX_NUM = n => tex(48, 40, (g, w, h) => { g.fillStyle = '#8f887a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3a342a'; g.setLineDash([3, 2]); g.strokeRect(2, 2, w - 4, h - 4); g.fillStyle = '#1a1612'; g.font = 'bold 24px Georgia'; g.textAlign = 'center'; g.fillText(String(n), w / 2, 29); });
  const TX_RISCOS = (txt, letra) => tex(128, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(210,205,190,.75)'; g.lineWidth = 1.5; for (let i = 0; i < 46; i++) { const x = 8 + (i % 23) * 5, y = 70 + Math.floor(i / 23) * 26; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rand(-1, 1), y + 20); g.stroke(); if (i % 5 === 4) { g.beginPath(); g.moveTo(x - 20, y + 4); g.lineTo(x + 2, y + 16); g.stroke(); } } g.fillStyle = 'rgba(215,210,195,.85)'; g.font = (letra ? 'bold 54px' : 'bold 22px') + ' Georgia'; g.fillText(txt, letra ? 40 : 18, letra ? 56 : 40); if (letra) { g.lineWidth = 4; g.beginPath(); g.moveTo(30, 60); g.lineTo(100, 14); g.stroke(); } });
  const TX_GIZ = txt => tex(256, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(232,150,190,.85)'; g.font = (txt.length > 3 ? 'bold 34px' : 'bold 80px') + ' Georgia'; g.textAlign = 'center'; g.fillText(txt, w / 2, txt.length > 3 ? 74 : 96); });
  const TX_FLOR = tex(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#d9c9b0'; for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(32 + Math.cos(i) * 13, 32 + Math.sin(i) * 13, 11, 6, i, 0, 7); g.fill(); } g.fillStyle = '#c05070'; g.beginPath(); g.arc(32, 32, 7, 0, 7); g.fill(); });

  // ---------------- o Inspetor ganha o que era dele: chaveiro, apito, crachá, lampião
  function acessorios(mod, sombra) {
    const g = mod.g;
    const metal = sombra ? MAT.sombra : new THREE.MeshStandardMaterial({ color: 0x8c867a, metalness: .75, roughness: .35 });
    const pano = sombra ? MAT.sombra : new THREE.MeshStandardMaterial({ color: 0x4a4236, roughness: 1 });
    const chav = new THREE.Group(); chav.position.set(.27, 1.52, .3); g.add(chav);
    const arg = E.cyl(.055, .055, .012, metal, 0, 0, 0, 10, chav); arg.rotation.x = Math.PI / 2;
    E.box(.09, .05, .05, pano, 0, .03, 0, chav, false); // enrolado num pano, para não fazer barulho quando ele não quer
    for (let i = 0; i < 9; i++) { const k = E.box(.016, .1, .005, metal, (i - 4) * .011, -.07, .01, chav, false); k.rotation.z = (i - 4) * .16; }
    const ap = new THREE.Group(); ap.position.set(.04, 2.95, .25); g.add(ap);
    const cord = E.box(.006, .45, .006, pano, -.03, .2, -.02, ap, false); cord.rotation.z = .3;
    const corpoAp = E.cyl(.018, .018, .085, metal, 0, 0, 0, 8, ap); corpoAp.rotation.z = Math.PI / 2;
    let cracha = null;
    if (!sombra) { cracha = E.plano(.17, .085, new THREE.MeshStandardMaterial({ map: TX_CRACHA, roughness: .7 }), -.12, 2.72, .262, 0, g); }
    const lamp = new THREE.Group(); lamp.position.set(-.33, 1.45, .12); g.add(lamp);
    const vidro = new THREE.MeshStandardMaterial({ color: 0x4a4030, emissive: 0xffa040, emissiveIntensity: 0, transparent: true, opacity: .85 });
    E.cyl(.05, .06, .13, vidro, 0, -.08, 0, 8, lamp); E.cyl(.035, .06, .04, metal, 0, .0, 0, 8, lamp); E.box(.004, .1, .004, metal, 0, .07, 0, lamp, false);
    return { chav, ap, lamp, vidro, cracha };
  }
  const ACE = acessorios(MON, false);
  if (E.VULTO) acessorios(E.VULTO, true);
  const faixaBase = MON.faixa.map;
  let vendaMarcada = false;

  // ---------------- a figura de castigo (Cap. I): o Inspetor virado para a parede antes de acordar
  const CAST = E.modeloInspetor(); acessorios(CAST, false); CAST.g.visible = false; scene.add(CAST.g);
  const castFig = { ativo: false, t: 0, feito: false };

  // ---------------- Davi (menino de pijama, lanterninha vermelha), sempre de costas
  function modeloCrianca(cor, alt = 1) {
    const g = new THREE.Group();
    const roupa = new THREE.MeshStandardMaterial({ color: cor, roughness: 1 }), pele = new THREE.MeshStandardMaterial({ color: 0x8e8478, roughness: .8 }), cabelo = new THREE.MeshStandardMaterial({ color: 0x0c0a08, roughness: 1 });
    for (const s of [-1, 1]) E.cyl(.045, .04, .5, roupa, s * .07, .25, 0, 6, g);
    E.cyl(.14, .17, .55, roupa, 0, .78, 0, 8, g);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), pele); cab.position.y = 1.17; g.add(cab);
    const cb = new THREE.Mesh(new THREE.SphereGeometry(.118, 10, 8, 0, Math.PI * 2, 0, Math.PI * .55), cabelo); cb.position.y = 1.19; cb.rotation.x = -.35; g.add(cb);
    const bracoD = new THREE.Group(); bracoD.position.set(.17, 1.0, 0); g.add(bracoD); E.cyl(.03, .025, .45, roupa, 0, -.22, 0, 6, bracoD);
    const bracoE = new THREE.Group(); bracoE.position.set(-.17, 1.0, 0); g.add(bracoE); E.cyl(.03, .025, .45, roupa, 0, -.22, 0, 6, bracoE);
    const lant = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff3020 })); lant.position.set(0, -.47, .04); bracoE.add(lant);
    g.scale.setScalar(alt); g.visible = false; scene.add(g);
    return { g, bracoD, bracoE, lant };
  }
  const DAVI = modeloCrianca(0x7d8a99, 1.05);
  const SOMBRA_FALSA = new THREE.Mesh(new THREE.PlaneGeometry(.5, 3.2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .55, depthWrite: false }));
  SOMBRA_FALSA.rotation.x = -Math.PI / 2; SOMBRA_FALSA.visible = false; scene.add(SOMBRA_FALSA);
  const DV = { ativo: false, t: 0, modo: null, falso: false, some: 0, vel: null, capVisto: -1, capTentou: -1 };

  // ---------------- Seu Joaquim (capa de chuva, chapéu, lampião)
  const JOAQ = (() => {
    const g = new THREE.Group(), capa = new THREE.MeshStandardMaterial({ color: 0x5f5326, roughness: .7 }), pele = new THREE.MeshStandardMaterial({ color: 0x7a6e60, roughness: .9 });
    E.cyl(.2, .38, 1.45, capa, 0, .73, 0, 9, g); const cab = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), pele); cab.position.y = 1.6; g.add(cab);
    E.cyl(.26, .26, .02, capa, 0, 1.7, 0, 12, g); E.cyl(.13, .14, .14, capa, 0, 1.78, 0, 10, g);
    const braco = new THREE.Group(); braco.position.set(.24, 1.35, 0); g.add(braco); E.cyl(.05, .04, .6, capa, 0, -.3, 0, 6, braco);
    const vidro = new THREE.MeshStandardMaterial({ color: 0x3a3020, emissive: 0xffa040, emissiveIntensity: 1.6 }); const lamp = E.cyl(.06, .07, .16, vidro, 0, -.66, 0, 8, braco);
    g.visible = false; scene.add(g); return { g, braco, vidro, lamp };
  })();
  const JQ = { ativo: false, t: 0, apagando: 0, capVisto: -1, portao: false };

  // ---------------- o diretor Albano (terno, sem rosto), só nos túneis
  const ALB = (() => {
    const g = new THREE.Group(), terno = new THREE.MeshStandardMaterial({ color: 0x15151a, roughness: .8 }), pele = new THREE.MeshStandardMaterial({ color: 0x9a948a, roughness: .5 });
    for (const s of [-1, 1]) E.cyl(.07, .06, .9, terno, s * .11, .45, 0, 6, g);
    E.cyl(.22, .19, .8, terno, 0, 1.3, 0, 9, g); E.box(.08, .4, .02, new THREE.MeshStandardMaterial({ color: 0x6a1010 }), 0, 1.45, .2, g, false);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), pele); cab.scale.set(.9, 1.15, .95); cab.position.y = 1.85; g.add(cab);
    const braco = new THREE.Group(); braco.position.set(.25, 1.62, 0); g.add(braco); E.cyl(.05, .045, .7, terno, 0, -.35, 0, 6, braco);
    g.visible = false; scene.add(g); return { g, braco };
  })();
  const AL = { ativo: false, t: 0, n: 0, cofreVisto: false, frente: false };

  // ---------------- brasa de cigarro na diretoria
  const BRASA = new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 5), new THREE.MeshBasicMaterial({ color: 0xff5a10 })); BRASA.visible = false; scene.add(BRASA);
  const BR = { ativo: false, caindo: 0, cap: -1 };

  // ---------------- a Procissão com rosto: os objetos das lápides, números de armário, Tomé e a Irmã Celeste
  const PRO = { n: 0, faseAnt: null, detalheDito: false, tomeDito: false, freiraDita: false, protegeu: false };
  const freira = (() => {
    const s = new THREE.Group(), habito = MAT.sombra;
    E.cyl(.14, .32, 1.45, habito, 0, .72, 0, 9, s); const c = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), habito); c.position.y = 1.6; s.add(c);
    E.box(.24, .04, .2, new THREE.MeshStandardMaterial({ color: 0xb8b2a2, roughness: 1 }), 0, 1.52, .04, s, false); // a gola branca, só na luz das velas
    E.cyl(.016, .016, .2, MAT.vela, .16, 1.05, .16, 6, s);
    const ch = new THREE.Mesh(new THREE.SphereGeometry(.028, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false })); ch.scale.y = 1.8; ch.position.set(.16, 1.2, .16); s.add(ch); PROC.chamas.push(ch);
    s.position.set(0, 0, -2.2); s.userData.f = 1; s.userData.base = s.position.clone(); s.visible = false; PROC.g.add(s); return s;
  })();
  seguro(() => {
    const fl = PROC.filhos; if (!fl || fl.length < 8) return;
    const vermelho = new THREE.MeshStandardMaterial({ color: 0x9a1420, roughness: .6 }), madeira = new THREE.MeshStandardMaterial({ color: 0x6a4a28, roughness: .8 }), vidro = new THREE.MeshStandardMaterial({ color: 0x5a7a9a, emissive: 0x1a2a3a, roughness: .1, metalness: .3 });
    for (const s of [-1, 1]) { const l = E.box(.06, .025, .04, vermelho, s * .045, 1.15, -.06, fl[0], false); l.rotation.z = s * .5; } // fita da Rosa
    const piao = new THREE.Mesh(new THREE.ConeGeometry(.045, .08, 8), madeira); piao.rotation.x = Math.PI; piao.position.set(-.15, .62, .1); fl[1].add(piao); // pião do Luiz
    const gude = new THREE.Mesh(new THREE.SphereGeometry(.022, 8, 6), vidro); gude.position.set(-.14, .6, .12); fl[2].add(gude); // bolinha do João
    E.cyl(.13, .26, 1.0, new THREE.MeshStandardMaterial({ color: 0x2c2a30, roughness: 1 }), 0, .44, 0, 8, fl[3]); // uniforme antigo, comprido demais (Maria das Dores)
    fl[7].scale.setScalar(.82); E.cyl(.1, .135, .07, vermelho, 0, 1.15, 0, 10, fl[7]); E.box(.2, .015, .2, vermelho, 0, 1.12, .03, fl[7], false); // capacete de papelão do Tomé
    [7, 12, 3, 19, 23, 5, 31, 28, 12].forEach((n, i) => { if (fl[i] && i !== 3) E.plano(.08, .066, new THREE.MeshStandardMaterial({ map: TX_NUM(n), roughness: 1 }), 0, .72, .135, 0, fl[i]); });
  })();
  // As lápides das crianças da fila: quem viu a Procissão pela fresta reconhece no cemitério
  seguro(() => {
    for (const l of (R.lapides || [])) {
      const extra = (T.lapides || {})[l.nome]; if (!extra) continue;
      let base = l.epitafio;
      Object.defineProperty(l, 'epitafio', { configurable: true, enumerable: true, get: () => base + (F().mlProcViu ? ' — ' + extra : ''), set: v => { base = v; } });
    }
  })();

  // ---------------- objetos dos mapas
  const MP = { castigo: null, terceiro: null, flor: null, giz: [], bilhete: null, placa: null };
  let castigoEntrou = false, terceiroEntrou = false, choroT = 3;
  function marcarArmario(L, textura) { const m = E.plano(.42, .42, new THREE.MeshStandardMaterial({ map: textura, transparent: true, alphaTest: .1, roughness: 1, depthWrite: false }), 0, 1.3, .352, 0, L.g); return m; }
  function armarioPerto(x, z) { let b = null, bd = 1.2; for (const L of W.lockers) { if (L.tipo !== 'armario') continue; const d = Math.hypot(L.x - x, L.z - z); if (d < bd) { bd = d; b = L; } } return b; }
  const novoMapa = seguro(id => {
    fila.length = 0; MP.castigo = MP.terceiro = MP.flor = MP.bilhete = MP.placa = null; MP.giz = [];
    DV.ativo = false; DAVI.g.visible = false; SOMBRA_FALSA.visible = false; JQ.ativo = false; JOAQ.g.visible = false; JQ.portao = false; AL.ativo = false; ALB.g.visible = false;
    BR.ativo = false; BRASA.visible = false; castFig.ativo = false; CAST.g.visible = false; luzDono = null; luz.intensity = 0; pausaM = null; rumo = null;
    limparFuligem();
    const St = S(); if (!St) return;
    if (id === 'terreo') {
      const L = armarioPerto(-33.4, -12); if (L) { L.mlCastigo = true; MP.castigo = L; marcarArmario(L, TX_RISCOS('M.D. 1951', false)); }
    }
    if (id === 'tuneis') {
      const L = armarioPerto(-33.55, -21.5); if (L) { L.mlTerceiro = true; MP.terceiro = L; marcarArmario(L, TX_RISCOS('M', true)); }
      // a Ana seguiu a Lia até aqui embaixo: números de giz nas paredes do caminho até a escotilha
      if (St.done.ana) {
        const pos = [[1.9, -10, -Math.PI / 2], [1.9, -14.5, -Math.PI / 2], [1.9, -23, -Math.PI / 2], [1.9, -27.5, -Math.PI / 2], [3.6, -30.1, Math.PI], [5.9, -32, -Math.PI / 2], [10, -34.1, Math.PI], [15, -37.9, 0], [20, -34.1, Math.PI], [31.9, -33, -Math.PI / 2]];
        const nums = T.numeros || [];
        pos.forEach(([x, z, ry], i) => { const t = nums[i] || String(i + 1); const m = E.plano(t.length > 3 ? 1.1 : .55, t.length > 3 ? .55 : .5, new THREE.MeshStandardMaterial({ map: TX_GIZ(t), transparent: true, alphaTest: .1, roughness: 1, depthWrite: false }), x, 1.35, z, ry); MP.giz.push(m); });
        E.box(.03, .2, .02, new THREE.MeshStandardMaterial({ color: 0xd8789a, roughness: .7 }), 31.15, 1.05, -35.8); // uma fitinha cor-de-rosa amarrada na escada
        if (!St.flags.mlAnaPegou && !St.flags.mlFlor) { // um presente dela no caminho (opcional)
          const fl = E.plano(.22, .22, new THREE.MeshStandardMaterial({ map: TX_FLOR, transparent: true, alphaTest: .1, roughness: 1 }), -1.1, .03, -21, 0); fl.rotation.x = -Math.PI / 2; MP.flor = fl;
          E.interact(fl, () => '<b>E</b>Pegar a flor de papel', () => { St.flags.mlFlor = true; fl.visible = false; E.SFX.papel && E.SFX.papel(); E.subPequeno('lia', T.flor); }, { on: () => fl.visible });
        }
      }
      if (St.flags.mlAnaPegou) { // ela lembra que você piscou
        const b = E.plano(.18, .24, MAT.papel, 2.6, .03, -3.6, 0); b.rotation.x = -Math.PI / 2; b.rotation.z = .5; MP.bilhete = b;
        E.interact(b, () => '<b>E</b>Ler o bilhete molhado', () => { const bt = T.bilhete || {}; E.SFX.papel && E.SFX.papel(); E.abrirNotaUI(bt.titulo || 'Bilhete', bt.texto || ''); });
      }
    }
    if (id === 'superior') { // a plaquinha embaixo da prateleira da sala de brinquedos
      const pl = E.box(.22, .1, .01, new THREE.MeshStandardMaterial({ color: 0x8a6a30, metalness: .7, roughness: .4, emissive: 0x1a1206 }), 14.93, 1.05, -31, W.grupo, false); pl.rotation.y = -Math.PI / 2; MP.placa = pl;
      E.interact(pl, () => '<b>E</b>Ler a plaquinha de latão', () => { St.flags.mlPlaca = true; const p = T.placa || {}; E.abrirNotaUI(p.titulo || '', p.texto || ''); });
    }
    if (id === 'terreo' && St.chapter === 1 && !St.done.forcar_porta) castFig.feito = false;
    if (id === 'cemiterio' && !St.flags.sino) { JQ.portao = true; JOAQ.g.position.set(1.8, 0, 13.4); JOAQ.g.rotation.y = Math.PI; JOAQ.braco.rotation.x = 0; JOAQ.g.visible = true; }
  });

  // ---------------- o Inspetor: pausas de memória (estado "reza": ele para, com o ouvido pela metade)
  let pausaM = null, rumo = null;
  function pausa(tipo, dur, volta = 'patrulha', alvo = null) {
    M.state = 'reza'; M.path = []; M.acao = null; M.wait = 0;
    pausaM = { tipo, t: dur, dur, volta, alvo, fim: false, somT: 0 };
    if (alvo) M.yaw = Math.atan2(alvo.x - M.pos.x, alvo.z - M.pos.z);
  }
  function fimPausa() {
    const p = pausaM; pausaM = null; if (!p) return;
    MON.cabeca.rotation.x = 0;
    if (p.volta === 'caca') { M.state = 'investiga'; M.searchT = 0; if (M.ultimo) E.planejar(M, M.ultimo.x, M.ultimo.z); else E.patrulhar(); }
    else E.patrulhar();
  }
  function poseDaPausa(dt) {
    const p = pausaM; if (!p || M.state !== 'reza') return;
    const k = Math.min(1, dt * 8);
    if (p.tipo === 'mao') { MON.armR.rotation.x = lerp(MON.armR.rotation.x, -1.35, k); MON.cabeca.rotation.z = lerp(MON.cabeca.rotation.z, .9, k); }
    else if (p.tipo === 'cama') { MON.g.rotation.x = lerp(MON.g.rotation.x, .55, k); const s = Math.sin(E.perf * 4) * .25; MON.armL.rotation.x = -1 + s; MON.armR.rotation.x = -1 - s; }
    else if (p.tipo === 'canecas') { MON.armR.rotation.x = -.85 + Math.sin(E.perf * 7) * .2; MON.cabeca.rotation.z = lerp(MON.cabeca.rotation.z, 1.1, k); }
    else if (p.tipo === 'luiz') { MON.g.rotation.x = lerp(MON.g.rotation.x, .22, k); MON.cabeca.rotation.x = lerp(MON.cabeca.rotation.x, .6, k); MON.armL.rotation.x = MON.armR.rotation.x = -.35; }
    else if (p.tipo === 'fala') { MON.cabeca.rotation.y = lerp(MON.cabeca.rotation.y, .9, k); }
    else if (p.tipo === 'memoria') { MON.armL.rotation.x = lerp(MON.armL.rotation.x, -2.5, k); MON.armR.rotation.x = lerp(MON.armR.rotation.x, -2.5, k); MON.g.rotation.x = lerp(MON.g.rotation.x, .3, k); }
  }
  function falaM(texto, pequeno) { if (!texto) return; if (pequeno) E.subPequeno('inspetor', texto); else E.sub('inspetor', texto); E.SFX.voz(M.pos, texto); M.falaT = Math.max(M.falaT, 6); }

  // ---------------- ganchos chamados pelo motor
  function protegido(L) { if (!L) return false; if (L.mlCastigo) return true; if (L.mlTerceiro && !F().mlTerceiroUsado) return true; return false; }
  const poupou = seguro(L => {
    if (L.mlCastigo) { E.subPequeno('lia', T.castigoPoupa); M.yaw = Math.atan2(L.x - M.pos.x, L.z - M.pos.z); }
    else if (L.mlTerceiro) { F().mlTerceiroUsado = true; depois(3.5, () => { SX2.rangido(L); legenda('porta'); E.subPequeno('lia', T.terceiroSai); }); }
  });
  const falaExtra = (perdeu, tipo) => {
    const St = S(); if (!St || !T.passoDavi) return null; const f = St.flags;
    if (!perdeu && M.state === 'caca' && liaReconhecida() && !f.mlFalouLia && Math.random() < .5) { f.mlFalouLia = true; return pick(T.reconhece); }
    if (!perdeu && W.mapa === 'tuneis' && !f.mlPassoDavi) { f.mlPassoDavi = true; return T.passoDavi; }
    if (!perdeu && W.mapa === 'cemiterio' && St.inv.reliquias > 0 && !f.mlRelic) { const k = Object.keys(St.tumulos || {})[0]; if (k && T.reliquia && T.reliquia[k]) { f.mlRelic = true; return T.reliquia[k]; } }
    return null;
  };
  // A menina que conta, encarada com calma depois de ler o bilhete dela: a lanterna não falha
  let calmaT = 0;
  const anaOlhada = () => calmaT > 0 && !F().mlOlhou;
  const fraseMorte = quem => {
    if (quem !== 'inspetor') return null;
    if (liaReconhecida() && Math.random() < .5) return T.morteLia;
    if (Math.random() < .25) return T.morteChave;
    return null;
  };

  // ---------------- estado anterior (transições)
  let estAnt = 'patrulha', mPosAnt = new THREE.Vector3(), chavesAcc = 0, falaT = 50, falaAlterna = 0, castigoCd = 0, camaCd = 20, canecaCd = 30, luizCd = 40, menCd = 0, lugaresDitos = {}, memCap = -1;
  let anaAtivaAnt = false, anaContaAnt = 0, anaFlags = {}, cantigaStop = null, anaScriptAnt = false, doneAnaAnt = null, cofreAnt = null, procFaseAnt = null, radarN = 99, radarT = 0, tomeT = 70, hiddenAnt = null, forcouAnt = null, sVisto = null;

  function transicaoInspetor(de, para, d) {
    const St = S();
    if (de === 'patrulha' && para !== 'patrulha' && E.SX.cortaCantiga() && d < 26) legenda('cantigaCorta');
    if (['patrulha', 'investiga', 'procura', 'conferir'].includes(de) && ['alerta', 'caca', 'escuta'].includes(para) && d < 20) legenda('chavesParam');
    if (para === 'caca' && de !== 'caca' && !St.flags.sino) { SX2.apito(M.pos, 1); if (pesadelo()) setTimeout(() => SX2.apito(M.pos, .9), 260); if (d < 30) legenda('apito'); }
    if (de === 'procura' && para === 'patrulha' && d > 8) { SX2.apito(M.pos, .35); legenda('apitoLonge', false); }
    if (para === 'fareja' && St.fitas.f3 && menCd <= 0 && Math.random() < 1 / 4) { menCd = 60; E.sub('inspetor', pick(T.menino || [''])); SX2.vozMenino(M.pos); }
    if (de === 'reza' && pausaM) { // algo o tirou da pausa antes da hora
      if (pausaM.tipo === 'luiz' && d < 20) M.furia = Math.max(M.furia, 3);
      pausaM = null; MON.cabeca.rotation.x = 0;
    }
    if (para !== 'patrulha') rumo = null;
  }

  function tickInspetor(dt, St) {
    if (!M.ativo) { estAnt = M.state; soltarLuz('lampiao'); ACE.vidro.emissiveIntensity = 0; return; }
    const d = M.pos.distanceTo(P.pos), ra = E.roomAt(M.pos.x, M.pos.z);
    if (M.state !== estAnt) { transicaoInspetor(estAnt, M.state, d); estAnt = M.state; }
    // nome nas legendas: depois da fita dele, ele é o Moacir
    if (R.personagens && R.personagens.inspetor) { const pi = R.personagens.inspetor; if (!pi._mlBase) pi._mlBase = pi.nomeRevelado; pi.nomeRevelado = St.fitas.f3 ? 'Moacir' : pi._mlBase; }
    // a venda mostra o bordado "M.D." e a cruz da enfermaria depois da ficha médica
    if (!!St.notes.n4 !== vendaMarcada) { vendaMarcada = !!St.notes.n4; MON.faixa.map = vendaMarcada ? TX_VENDA : faixaBase; MON.faixa.color.setHex(vendaMarcada ? 0xffffff : 0xbcae94); MON.faixa.needsUpdate = true; }
    // chaveiro: balança e tilinta andando; na caçada ele segura o molho e o silêncio é o aviso
    const andou = Math.hypot(M.pos.x - mPosAnt.x, M.pos.z - mPosAnt.z); mPosAnt.copy(M.pos);
    const andando = ['patrulha', 'investiga', 'procura', 'conferir'].includes(M.state) && andou > 0 && andou < 1;
    if (andando) { chavesAcc += andou; ACE.chav.rotation.z = Math.sin(M.anim * 2) * .35; if (chavesAcc > .95) { chavesAcc = 0; if (d < 24) { SX2.chaves(M.pos, M.state === 'patrulha' ? .7 : 1); if (d < 14) legenda('chaves', false); } } }
    else ACE.chav.rotation.z = lerp(ACE.chav.rotation.z, 0, Math.min(1, dt * 6));
    // o lampião que ele não precisa: aceso nos túneis depois do cofre
    const lampAceso = W.mapa === 'tuneis' && St.flags.cofre;
    ACE.vidro.emissiveIntensity = lampAceso ? 1.4 + Math.random() * .3 : 0;
    if (lampAceso) { const w = new THREE.Vector3(); ACE.lamp.getWorldPosition(w); pedirLuz('lampiao', 0xffa850, .9 + Math.random() * .25, 6, w.x, w.y, w.z); } else soltarLuz('lampiao');
    // pausas de memória
    menCd -= dt; castigoCd -= dt; camaCd -= dt; canecaCd -= dt; luizCd -= dt;
    if (M.state === 'reza') {
      if (!pausaM) { E.patrulhar(); return; }
      pausaM.t -= dt; pausaM.somT -= dt;
      if (pausaM.tipo === 'canecas' && pausaM.somT <= 0) { pausaM.somT = .85; SX2.caneca(M.pos); if (d < 20) legenda('canecas'); }
      if (pausaM.tipo === 'cama' && pausaM.somT <= 0) { pausaM.somT = 1.1; SX2.lencol(pausaM.alvo || M.pos); if (d < 16) legenda('lencol', false); }
      if (pausaM.tipo === 'mao' && pausaM.humano && pausaM.t < .5 && !pausaM.estalou) { pausaM.estalou = true; E.SX.estalo(M.pos, 1.6, true); }
      if (pausaM.t <= 0) fimPausa();
      return;
    }
    if (St.flags.sino) return;
    const ocupado = ['alerta', 'bote', 'agarra', 'fareja', 'vasculha', 'escuta', 'emboscada'].includes(M.state);
    // o armário do castigo: ele para, encosta a mão na porta e segue. Na caçada, a memória o trava por 2 s (uma vez por capítulo)
    const C = MP.castigo;
    if (C && !ocupado) {
      const dc = Math.hypot(M.pos.x - C.x, M.pos.z - C.z);
      if (M.state === 'caca' && dc < 2.4 && d > 3 && memCap !== St.chapter) { memCap = St.chapter; pausa('memoria', 2, 'caca'); falaM(T.naoFalei); SX2.vozMenino(M.pos); return; }
      if ((M.state === 'patrulha' || M.state === 'procura') && dc < 1.7 && castigoCd <= 0) {
        castigoCd = 35; pausa('mao', 2.4, 'patrulha', C);
        if (Math.random() < .3) { pausaM.humano = true; E.sub('moacir', T.humano); SX2.vozHomem(M.pos); }
        return;
      }
    }
    if (M.state !== 'patrulha' || M.recuo > 0) return;
    // conta as canecas da cozinha, batendo nelas uma a uma (janela de 4 a 6 s)
    if (W.mapa === 'terreo' && ra && ra.id === 'cozinha' && canecaCd <= 0) { canecaCd = 70; pausa('canecas', rand(4, 6)); return; }
    // arruma as camas do andar de cima, como fazia quando era funcionário
    if (W.mapa === 'superior' && camaCd <= 0) {
      const cama = W.lockers.find(L => L.tipo === 'cama' && Math.hypot(L.x - M.pos.x, L.z - M.pos.z) < 1.6);
      if (cama) {
        camaCd = 45; pausa('cama', 3.5, 'patrulha', cama);
        if (St.hidden === cama) { E.P.shake = Math.max(E.P.shake, .06); St.fear = Math.min(100, St.fear + 25); E.subPequeno('lia', '(ele alisa o lençol bem em cima de você)'); }
        return;
      }
    }
    // no cemitério ele visita o túmulo do Luiz e reza 6 s, de cabeça baixa
    if (W.mapa === 'cemiterio' && St.tumPos && St.tumPos[11]) {
      const [lx, lz] = St.tumPos[11];
      if (rumo === 'luiz' && Math.hypot(M.pos.x - lx, M.pos.z - lz - 2) < 1.6) { rumo = null; pausa('luiz', 6, 'patrulha', { x: lx, z: lz }); if (d < 22 && !St.flags.mlLuizDito) { St.flags.mlLuizDito = true; depois(2, () => E.subPequeno('lia', T.luiz)); } return; }
      if (!rumo && luizCd <= 0 && d > 10) { luizCd = 75; if (E.planejar(M, lx, lz + 2)) rumo = 'luiz'; }
    }
    // fala com as crianças que não existem (para 3 s) ou recita a lista de castigos, baixinho
    falaT -= dt;
    if (falaT <= 0 && St.chapter >= 1 && d > 7 && d < 26) {
      falaT = rand(45, 80);
      if (falaAlterna++ % 2 === 0) { pausa('fala', 3); falaM(pick(T.criancas || ['']), true); }
      else { const cs = T.castigos || []; cs.forEach((l, i) => depois(i * 1.3, () => { if (M.ativo && M.state === 'patrulha') { E.subPequeno('inspetor', l); E.SFX.voz(M.pos); } })); }
      return;
    }
    // lugares da história dele (uma vez por jogo cada)
    if (ra && d < 30) {
      const lug = W.mapa === 'superior' && /^dorm/.test(ra.id) ? 'dorm' : W.mapa === 'terreo' && ra.id === 'diret' ? 'diret' : W.mapa === 'tuneis' && ra.id === 'secreta' ? 'secreta' : W.mapa === 'cemiterio' && ra.id === 'capela' ? 'capela' : null;
      const k = 'mlLug_' + lug;
      if (lug && !St.flags[k] && T.lugares) { St.flags[k] = true; if (lug === 'diret') pausa('fala', 2); falaM(T.lugares[lug], true); }
    }
    // depois de ler a plaquinha, a Lia reconhece a cantiga dele
    if (St.flags.mlPlaca && !St.flags.mlLigou && d < 14 && Math.random() < dt * .2) { St.flags.mlLigou = true; E.subPequeno('lia', T.cantigaPlaca); }
  }

  // ---------------- esconderijos dele: o do castigo (choro de menino) e o do terceiro menino
  function tickEsconderijo(dt, St) {
    const L = St.hidden;
    if (L !== hiddenAnt) {
      if (L && L.mlCastigo && !castigoEntrou) { castigoEntrou = true; E.subPequeno('lia', T.castigoEntra); }
      if (L && L.mlTerceiro && !terceiroEntrou && !St.flags.mlTerceiroUsado) { terceiroEntrou = true; SX2.cochicho(null, 1); E.subPequeno('crianca', T.terceiroEntra); }
      hiddenAnt = L; choroT = 2.5;
    }
    if (L && L.mlCastigo) { choroT -= dt; if (choroT <= 0) { choroT = rand(5, 8); SX2.choro({ x: L.x, z: L.z }); legenda('castigoChoro'); } }
  }
  L2.castigoChoro = (T.castigoChoro || '').replace(/^\[|\]$/g, '');

  // ---------------- a figura de castigo (Cap. I): aparece quando a porta é forçada
  function tickCastigoFig(dt, St) {
    const forcou = !!St.done.forcar_porta;
    if (forcouAnt === false && forcou && W.mapa === 'terreo' && St.chapter === 1 && !castFig.feito) {
      castFig.feito = true; castFig.ativo = true; castFig.t = 0;
      CAST.g.position.set(3.4, 0, -13.25); CAST.g.rotation.set(0, Math.PI, 0); CAST.cabeca.rotation.set(0, 0, .45); CAST.g.visible = true;
      depois(1.2, () => E.subPequeno('lia', T.castigoFigura));
    }
    forcouAnt = forcou;
    if (!castFig.ativo) return;
    castFig.t += dt;
    CAST.g.rotation.z = Math.sin(E.perf * 1.3) * .04;
    if (castFig.t > 1.8) CAST.cabeca.rotation.y = lerp(CAST.cabeca.rotation.y, 1.4, Math.min(1, dt * .9)); // vira a cabeça devagar
    const pos = CAST.g.position, lit = St.flashOn && !E.flashPisca && E.visivel(pos, 2.4, 22) && castFig.t > 1.5;
    if (castFig.t > 5 || lit || dist(P.pos, pos) < 4) { castFig.ativo = false; CAST.g.visible = false; E.SX.estalo(pos, 1.1); St.fear = Math.min(100, St.fear + 10); }
  }

  // ---------------- a Ana
  function tickAna(dt, St) {
    const at = ANA.ativa;
    if (at && !anaAtivaAnt) { // começou: ela cantarola uma cantiga de roda antes de contar
      anaFlags = {}; anaContaAnt = 0; calmaT = 0;
      ANA.contaT = Math.max(ANA.contaT, ANA.script ? 3.6 : 2.6);
      cantigaStop = SX2.cantigaRoda(ANA.pos) || null; legenda('cantigaRoda');
      if (ANA.script && liaReconhecida() && !St.flags.mlIrma) { St.flags.mlIrma = true; depois(3.8, () => E.sub('ana', T.irma)); }
    }
    if (!at && anaAtivaAnt) { if (cantigaStop) { cantigaStop(); cantigaStop = null; } }
        if (at && ANA.script && ANA.pegos > 0) St.flags.mlAnaPegou = true;
    anaAtivaAnt = at; anaScriptAnt = at && ANA.script;
    // a brincadeira acabou: quem nunca foi pega ganha uma aliada; quem leu o bilhete ouve um segredo
    const dn = !!St.done.ana;
    if (doneAnaAnt === false && dn) { if (!St.flags.mlAnaPegou) St.flags.mlAnaLimpa = true; if (St.notes.n6) depois(4.5, () => E.subPequeno('ana', T.leu)); }
    doneAnaAnt = dn;
    if (!at) return;
    const c = ANA.conta;
    if (c !== anaContaAnt) {
      if (anaContaAnt === 0 && c === 1 && cantigaStop) { cantigaStop(); cantigaStop = null; legenda('contaComeca'); }
      if (c === 3 && liaReconhecida() && !anaFlags.voltou) { anaFlags.voltou = true; E.subPequeno('ana', T.voltou); }
      if (c >= 2 && c <= 6 && !anaFlags.domingo && Math.random() < .14) { anaFlags.domingo = true; depois(.35, () => { if (ANA.ativa) E.subPequeno('ana', T.domingo); }); }
      if (c === 9 && St.notes.n6 && !anaFlags.mae && !St.hidden) { anaFlags.mae = true; ANA.contaT += 1.5; E.subPequeno('ana', T.mae); }
      // a Irmã Celeste fecha a porta entre vocês duas (uma vez por jogo, nunca no Pesadelo)
      if (c === 8 && W.mapa === 'superior' && !pesadelo() && !St.flags.mlCelestePorta && !St.hidden) {
        const ra = E.roomAt(ANA.pos.x, ANA.pos.z);
        const l = ra && ra !== P.room && W.links.find(l => l.door && l.door.open && !l.door.grade && ((l.a === ra.id && l.b === P.room.id) || (l.b === ra.id && l.a === P.room.id)));
        if (l && dist(ANA.pos, P.pos) > 2.5) { St.flags.mlCelestePorta = true; E.setDoor(l.door, false, true); E.SFX.pancada(l.door.x, l.door.z); SX2.terco({ x: l.door.x, z: l.door.z }); legenda('terco'); depois(1.2, () => E.subPequeno('lia', T.celesteFecha)); }
      }
      anaContaAnt = c;
    }
    // encarada com calma (sem correr, quase parada) por 10 s depois de ler o bilhete dela: ela agradece e vai embora
    const parada = !P.sprinting && (P.velAtual === undefined ? true : P.velAtual < 1.2);
    if (!ANA.script && St.notes.n6 && !St.flags.mlOlhou && ANA.vista && St.flashOn && parada) {
      calmaT += dt;
      if (calmaT >= 10) {
        St.flags.mlOlhou = true; calmaT = 0; E.sub('ana', T.obrigada); E.despawnAna(true);
        St.inv.kits = (St.inv.kits || 0) + 1; E.renderInvMini && E.renderInvMini(); depois(1.5, () => E.toast(T.curativo));
      }
    } else calmaT = 0;
  }
  let velPos = new THREE.Vector3(); // velocidade da jogadora (para "encarar com calma")
  function tickVel(dt) { if (dt > 0) P.velAtual = Math.hypot(P.pos.x - velPos.x, P.pos.z - velPos.z) / dt; velPos.copy(P.pos); }

  // ---------------- a Ana do seu lado: no cemitério (e nos túneis, para quem nunca respondeu) conta quantos passos faltam até ele
  function tickRadar(dt, St) {
    radarT -= dt;
    if (!M.ativo || pesadelo() || !St.flags.mlAnaLimpa || ANA.ativa) { radarN = 99; return; }
    if (!(W.mapa === 'cemiterio' || (W.mapa === 'tuneis' && !St.flags.respondeu))) return;
    const d = M.pos.distanceTo(P.pos);
    if (d > 16) { radarN = 99; return; }
    const n = clamp(Math.round(d / 2), 1, 8);
    if ((n < radarN && radarT <= 0) || radarT < -4) {
      radarN = n; radarT = 1.4;
      const v = new THREE.Vector3(M.pos.x - P.pos.x, 0, M.pos.z - P.pos.z).normalize();
      SX2.numero({ x: P.pos.x + v.x * 1.2, z: P.pos.z + v.z * 1.2 }, n - 1);
      E.subPequeno('ana', (T.radar || [])[n - 1] || '');
    }
    // perto do túmulo dela, com o presente: "Você brincou comigo."
  }
  function tickTumuloAna(St) {
    if (W.mapa !== 'cemiterio' || !St.flags.mlFlor || St.flags.mlBrincou || !St.tumPos || !St.tumPos[0]) return;
    const [x, z] = St.tumPos[0];
    if (Math.hypot(P.pos.x - x, P.pos.z - z) < 2.6) { St.flags.mlBrincou = true; SX2.cochicho({ x, z }, .8); E.sub('ana', T.brincou); }
  }

  // ---------------- a Procissão
  function tickProcissao(dt, St) {
    const fase = PROC.fase;
    if (fase === 'aviso' && procFaseAnt !== 'aviso') {
      // da terceira em diante, o Tomé bate duas vezes no armário certo quando você está longe de um
      if (PRO.n >= 2 && !pesadelo()) {
        let perto = null, dp = 1e9; for (const L of W.lockers) { const dd = Math.hypot(L.x - P.pos.x, L.z - P.pos.z); if (dd < dp) { dp = dd; perto = L; } }
        if (perto && dp > 5) depois(1.4, () => { E.SX.batida(perto.x, perto.z, .8); setTimeout(() => E.SX.batida(perto.x, perto.z, .8), 300); legenda('batidas'); if (!St.flags.mlTomeBate) { St.flags.mlTomeBate = true; E.subPequeno('lia', T.tomeBate); } });
      }
    }
    if (fase === 'passando' && procFaseAnt !== 'passando') {
      PRO.detalheDito = PRO.tomeDito = PRO.freiraDita = false;
      freira.visible = PRO.n >= 1; // da segunda Procissão em diante, a Irmã Celeste vai no fim da fila
      // o quarto da Celeste protege quem ouviu a fita dela (uma vez por jogo)
      if (St.fitas.f2 && P.room && P.room.id === 'celeste' && St.hidden && !St.flags.mlCelesteProtegeu) {
        St.flags.mlCelesteProtegeu = true; const c = E.centroSala(P.room);
        SX2.reza(c); legenda('reza'); E.sub('celeste', T.celesteReza);
        depois(2.6, () => { if (PROC.fase === 'passando') { E.acabarProcissao(); E.subPequeno('lia', T.celesteObrigada); } });
      }
    }
    if (!fase && procFaseAnt === 'passando') PRO.n++;
    procFaseAnt = fase;
    if (fase !== 'passando' || !St.hidden) return;
    const dP = dist(PROC.pos, P.pos);
    if (dP < 3.4 && !PRO.detalheDito) { // pela fresta dá para ver quem são
      PRO.detalheDito = true; St.flags.mlProcViu = true;
      const [nome, desc] = pick(T.detalhes || [['', '']]);
      E.subPequeno('crianca', desc); depois(1.6, () => { SX2.cochicho(PROC.pos, .7); E.subPequeno('crianca', '...' + nome + '...'); });
    }
    if (dP < 3 && !St.flashOn && !PRO.tomeDito && Math.random() < .5) { PRO.tomeDito = true; depois(2.8, () => E.subPequeno('crianca', T.tome)); }
    else if (dP < 3) PRO.tomeDito = true;
    if (freira.visible && dP < 2.8 && !PRO.freiraDita) { PRO.freiraDita = true; PROC.t -= 2; depois(.8, () => E.subPequeno('celeste', T.freira)); }
  }

  // ---------------- fuligem (quando o Davi se desfaz)
  const fuligem = [];
  const MAT_FUL = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
  function soltarFuligem(pos, alt = 1.2) { for (let i = 0; i < 16; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(.03, .03, .03), MAT_FUL); m.position.set(pos.x + rand(-.18, .18), rand(.2, alt), pos.z + rand(-.18, .18)); scene.add(m); fuligem.push({ m, v: rand(.4, 1.2), t: 1.4 }); } }
  function tickFuligem(dt) { for (let i = fuligem.length - 1; i >= 0; i--) { const f = fuligem[i]; f.t -= dt; f.m.position.y = Math.max(.01, f.m.position.y - f.v * dt); f.m.rotation.x += dt * 3; if (f.t <= 0) { scene.remove(f.m); f.m.geometry.dispose(); fuligem.splice(i, 1); } } }
  function limparFuligem() { for (const f of fuligem) { scene.remove(f.m); f.m.geometry.dispose(); } fuligem.length = 0; }

  // ---------------- presenças que não atacam
  const semAmeaca = St => !PROC.fase && !ANA.ativa && !E.ui && (!M.ativo || (!['caca', 'alerta', 'bote', 'agarra'].includes(M.state) && M.pos.distanceTo(P.pos) > 16)) && !St.hidden && !St.flags.sino;
  function pontoNaVista(dmin, dmax, foraOk) {
    const fw = fwdH();
    for (const ang of [0, .25, -.25, .45, -.45]) for (const dd of [dmax, (dmin + dmax) / 2, dmin]) {
      const dir = fw.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), ang), p = P.pos.clone().addScaledVector(dir, dd), r = E.roomAt(p.x, p.z);
      if (!r || (r.fora && !foraOk) || !W.salas.includes(r) || !E.linhaLivre(P.pos, p, 1.2)) continue;
      const c = p.clone(); if (E.collide) E.collide(c, .25); if (c.distanceTo(p) > .1) continue;
      return p;
    }
    return null;
  }
  function lockerMaisPerto(p) { let b = null, bd = 1e9; for (const L of W.lockers) { const d = Math.hypot(L.x - p.x, L.z - p.z); if (d < bd) { bd = d; b = L; } } return b; }
  function apontar(braco, de, alvo, yaw) { const a = Math.atan2(alvo.x - de.x, alvo.z - de.z) - yaw; braco.rotation.order = 'YXZ'; braco.rotation.set(-1.45, Math.atan2(Math.sin(a), Math.cos(a)), 0); }

  function tickDavi(dt, St) {
    // depois do "QUEM ABRIU A MINHA GAVETA?": o Davi aparece por um instante e mostra para onde correr
    const cf = !!St.flags.cofre;
    if (cofreAnt === false && cf && W.mapa === 'tuneis') depois(4.6, () => {
      if (W.mapa !== 'tuneis' || S().dead) return;
      DV.ativo = true; DV.modo = 'gaveta'; DV.t = 0; DV.falso = false; DAVI.g.position.set(-.4, 0, -43); DAVI.g.rotation.y = Math.atan2(P.pos.x + .4, P.pos.z + 43);
      DAVI.g.visible = true; DAVI.bracoD.rotation.set(-1.2, 0, 0); E.sub('lia', T.daviGaveta);
    });
    cofreAnt = cf;
    if (DV.ativo) {
      DV.t += dt; const g = DAVI.g;
      const lp = new THREE.Vector3(); DAVI.lant.getWorldPosition(lp); pedirLuz('davi', 0xff3020, .7, 3.5, lp.x, lp.y, lp.z);
      if (DV.modo === 'gaveta') {
        if (DV.t < .7) DAVI.bracoD.rotation.x = -1.2 + Math.sin(DV.t * 14) * .5; // faz sinal de "vem"
        else { if (!DV.vel) { DV.vel = new THREE.Vector3(1, 0, .45).normalize(); g.rotation.y = Math.atan2(DV.vel.x, DV.vel.z); SX2.passinhos(g.position, DV.vel); legenda('passinhos'); } g.position.addScaledVector(DV.vel, dt * 4.2); DAVI.bracoD.rotation.x = Math.sin(DV.t * 18) * .8; DAVI.bracoE.rotation.x = -Math.sin(DV.t * 18) * .8; }
        if (DV.t > 1.6) somirDavi(false);
        return;
      }
      // de costas, apontando
      if (DV.some > 0) { DV.some -= dt; if (DV.some <= 0) somirDavi(true); return; }
      const lit = St.flashOn && !E.flashPisca && E.visivel(g.position, 1, 16);
      if (lit || dist(P.pos, g.position) < 6 || DV.t > 9) {
        if (!DV.falso) { SX2.pisao(g.position); legenda('pisao'); DV.some = .65; if (!St.flags.mlDaviPisou) { St.flags.mlDaviPisou = true; depois(1, () => E.subPequeno('lia', T.daviPisou)); } }
        else { E.SX.estalo(g.position, 1.2); somirDavi(true); if (!St.flags.mlDaviFalso) { St.flags.mlDaviFalso = true; depois(1, () => E.subPequeno('lia', T.daviFalso)); } }
      }
      return;
    }
    soltarLuz('davi');
    // uma vez por capítulo, longe e de costas, aponta para o esconderijo mais perto dele (ou, se for o falso, para onde o Inspetor está)
    if (St.chapter < 1 || DV.capVisto === St.chapter || St.capT < 40 || St.fear < 15 || !semAmeaca(St) || W.mapa === 'estrada') return;
    if (Math.random() > dt * .03) return;
    const p = pontoNaVista(10, 14, W.mapa === 'cemiterio'); if (!p) return;
    DV.capVisto = St.chapter; DV.ativo = true; DV.modo = 'aponta'; DV.t = 0; DV.some = 0; DV.vel = null;
    DV.falso = St.chapter >= 4 && St.flags.mlDaviPisou && M.ativo && Math.random() < .4;
    const g = DAVI.g; g.position.set(p.x, 0, p.z); g.scale.setScalar(DV.falso ? 1.15 : 1.05);
    const yaw = Math.atan2(p.x - P.pos.x, p.z - P.pos.z); g.rotation.y = yaw; g.visible = true; // de costas para você
    const alvo = DV.falso ? M.pos : (lockerMaisPerto(p) || P.pos);
    DAVI.bracoE.rotation.set(0, 0, 0); apontar(DAVI.bracoD, p, alvo, yaw);
    if (DV.falso) { SOMBRA_FALSA.position.set(p.x - Math.sin(yaw) * 1.7, .02, p.z - Math.cos(yaw) * 1.7); SOMBRA_FALSA.rotation.z = -yaw; SOMBRA_FALSA.visible = true; }
  }
  function somirDavi(fuli) { if (fuli) soltarFuligem(DAVI.g.position); DV.ativo = false; DAVI.g.visible = false; SOMBRA_FALSA.visible = false; DV.vel = null; DAVI.bracoD.rotation.set(0, 0, 0); DAVI.bracoE.rotation.set(0, 0, 0); soltarLuz('davi'); }

  function tickJoaquim(dt, St) {
    if (JQ.portao) { // no cemitério ele espera no portão dos fundos desde o começo
      if (St.flags.sino || W.mapa !== 'cemiterio') { JQ.portao = false; JOAQ.g.visible = false; soltarLuz('joaquim'); return; }
      const w = new THREE.Vector3(); JOAQ.lamp.getWorldPosition(w); pedirLuz('joaquim', 0xffa850, .8, 6, w.x, w.y, w.z); JOAQ.vidro.emissiveIntensity = 1.4 + Math.random() * .3;
      return;
    }
    if (JQ.ativo) {
      JQ.t += dt; const g = JOAQ.g;
      const w = new THREE.Vector3(); JOAQ.lamp.getWorldPosition(w);
      if (JQ.apagando > 0) { JQ.apagando -= dt; JOAQ.vidro.emissiveIntensity = 0; soltarLuz('joaquim'); if (JQ.apagando <= 0) { JQ.ativo = false; g.visible = false; } return; }
      pedirLuz('joaquim', 0xffa850, .9 + Math.random() * .2, 7, w.x, w.y, w.z); JOAQ.vidro.emissiveIntensity = 1.5;
      const lit = St.flashOn && !E.flashPisca && E.visivel(g.position, 1.5, 24);
      if (lit || dist(P.pos, g.position) < 8 || JQ.t > 10 || !semAmeaca(St)) { JQ.apagando = .35; E.SFX.clique && E.SFX.clique(); }
      return;
    }
    // uma vez por capítulo, bem longe, só quando nada está perto
    if (St.chapter < 1 || St.chapter > 4 || JQ.capVisto === St.chapter || St.capT < 60 || !semAmeaca(St)) return;
    if (Math.random() > dt * .02) return;
    const p = pontoNaVista(15, 19, false); if (!p) return;
    JQ.capVisto = St.chapter; JQ.ativo = true; JQ.t = 0; JQ.apagando = 0;
    const g = JOAQ.g; g.position.set(p.x, 0, p.z); g.rotation.y = Math.atan2(P.pos.x - p.x, P.pos.z - p.z); g.visible = true;
    const L = lockerMaisPerto(p); if (L) apontar(JOAQ.braco, p, L, g.rotation.y); else JOAQ.braco.rotation.set(0, 0, 0);
    SX2.assobio(p); legenda('assobio'); if (!St.flags.mlJoaquim) { St.flags.mlJoaquim = true; depois(2.2, () => E.subPequeno('lia', T.joaquim)); }
  }

  function tickAlbano(dt, St) {
    if (W.mapa !== 'tuneis' || St.chapter !== 4) { if (AL.ativo) { AL.ativo = false; ALB.g.visible = false; } return; }
    if (AL.ativo) {
      AL.t += dt; const g = ALB.g, lit = St.flashOn && !E.flashPisca && E.visivel(g.position, 1.6, 24);
      if (lit || dist(P.pos, g.position) < (AL.frente ? 3 : 8) || AL.t > (AL.frente ? 3.5 : 7)) { AL.ativo = false; g.visible = false; E.SX.estalo(g.position, .5); St.fear = Math.min(100, St.fear + 8); if (AL.frente) depois(.8, () => E.subPequeno('lia', T.albanoCofre)); else if (!St.flags.mlAlbano) { St.flags.mlAlbano = true; depois(.8, () => E.subPequeno('lia', T.albano)); } }
      return;
    }
    // na sala dele, antes do cofre: de frente, sem rosto, apontando o cofre
    if (P.room && P.room.id === 'secreta' && !St.flags.cofre && !AL.cofreVisto && (!M.ativo || M.pos.distanceTo(P.pos) > 14)) {
      AL.cofreVisto = true; AL.ativo = true; AL.frente = true; AL.t = 0;
      const g = ALB.g; g.position.set(-6.4, 0, -63.5); g.rotation.y = Math.atan2(P.pos.x + 6.4, P.pos.z + 63.5); g.visible = true; apontar(ALB.braco, g.position, { x: 7.4, z: -60 }, g.rotation.y);
      return;
    }
    // de costas, no fim das galerias
    if (AL.n >= 2 || !semAmeaca(St) || Math.random() > dt * .04) return;
    const cand = [[-22, -18], [22, -18], [-20, -36], [20, -36]].map(([x, z]) => ({ x, z })).filter(c => { const dd = dist(c, P.pos); return dd > 12 && dd < 26 && E.linhaLivre(P.pos, c, 1.4) && E.visivel(c, 1.5, 30); });
    if (!cand.length) return;
    const c = pick(cand); AL.n++; AL.ativo = true; AL.frente = false; AL.t = 0;
    const g = ALB.g; g.position.set(c.x, 0, c.z); g.rotation.y = Math.atan2(c.x - P.pos.x, c.z - P.pos.z); ALB.braco.rotation.set(0, 0, 0); g.visible = true;
  }

  function tickBrasa(dt, St) {
    if (W.mapa !== 'terreo' || St.chapter < 1 || St.chapter > 2) { if (BR.ativo) { BR.ativo = false; BRASA.visible = false; soltarLuz('brasa'); } return; }
    if (!BR.ativo && P.room && P.room.id === 'diret' && BR.cap !== St.chapter && semAmeaca(St)) {
      BR.cap = St.chapter; BR.ativo = true; BR.caindo = 0; BRASA.position.set(17.2, 1.58, -1.1); BRASA.visible = true;
      if (!St.flags.mlBrasa) { St.flags.mlBrasa = true; depois(1.5, () => E.subPequeno('lia', T.brasa)); }
    }
    if (!BR.ativo) return;
    if (BR.caindo > 0) { BR.caindo -= dt; BRASA.position.y = Math.max(.02, BRASA.position.y - dt * 3.5); pedirLuz('brasa', 0xff4a10, .25, 1.5, BRASA.position.x, BRASA.position.y + .05, BRASA.position.z); if (BR.caindo <= 0) { BR.ativo = false; BRASA.visible = false; soltarLuz('brasa'); SX2.chiado(BRASA.position); } return; }
    const pulso = .35 + (Math.sin(E.perf * 1.6) * .5 + .5) * .9; BRASA.scale.setScalar(.8 + pulso * .5);
    pedirLuz('brasa', 0xff4a10, pulso, 2.6, BRASA.position.x, BRASA.position.y, BRASA.position.z);
    const lit = St.flashOn && !E.flashPisca && E.visivel(BRASA.position, BRASA.position.y, 10);
    if (lit || dist(P.pos, BRASA.position) < 2.5 || P.room.id !== 'diret') BR.caindo = .5;
  }

  function tickTome(dt, St) { // o Tomé brinca com o carrinho no andar de cima (térreo, capítulos I e II)
    if (W.mapa !== 'terreo' || St.chapter < 1 || St.chapter > 2) return;
    tomeT -= dt;
    if (tomeT <= 0) { tomeT = rand(60, 100); if (semAmeaca(St)) { SX2.carrinho(P.pos); legenda('carrinho'); } }
  }

  // ---------------- loop
  const tick = seguro(dt => {
    const St = S(); if (!St || St.dead) return;
    agora += dt;
    for (let i = fila.length - 1; i >= 0; i--) if (fila[i].t <= agora) { const f = fila.splice(i, 1)[0]; try { f.fn(); } catch (e) { console.warn('[monstros-lore]', e && e.message); } }
    if (legT > 0) { legT -= dt; if (legT <= 0) leg.style.opacity = 0; }
    tickVel(dt);
    if (sVisto !== St) { sVisto = St; doneAnaAnt = !!St.done.ana; cofreAnt = !!St.flags.cofre; forcouAnt = !!St.done.forcar_porta; castigoEntrou = terceiroEntrou = false; DV.capVisto = JQ.capVisto = -1; BR.cap = -1; castFig.feito = false; AL.n = 0; AL.cofreVisto = false; PRO.n = 0; lugaresDitos = {}; memCap = -1; }
    tickInspetor(dt, St); poseDaPausa(dt);
    tickEsconderijo(dt, St); tickCastigoFig(dt, St);
    tickAna(dt, St); tickRadar(dt, St); tickTumuloAna(St);
    tickProcissao(dt, St);
    tickDavi(dt, St); tickJoaquim(dt, St); tickAlbano(dt, St); tickBrasa(dt, St); tickTome(dt, St);
    tickFuligem(dt);
  });

  if (typeof window !== 'undefined') window.__mlore = { PRO, DV, JQ, AL, BR, castFig, get pausa() { return pausaM; }, freira, legenda };
  return { tick, novoMapa, protegido, poupou, falaExtra: (p, t) => { try { return falaExtra(p, t); } catch (e) { return null; } }, anaOlhada, fraseMorte: q => { try { return fraseMorte(q); } catch (e) { return null; } }, pausa };
}
