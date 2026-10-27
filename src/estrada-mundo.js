// PRÓLOGO — mundo da estrada velha (Lote 2): lugares que contam a história sozinhos.
// Carro (porta-luvas, foto no para-brisa, tronco serrado), estrada (tapume, cruzes, oratório, ponte,
// ônibus, ponto, Kombi, Fusca do repórter, placas e marcos que mudam, outdoor), posto (livro de quem subiu,
// jornal de amanhã, secretária eletrônica, mural, caderneta de fiado, foto e crachá do Joaquim, TV, cama)
// e portão (guarita, muro com nomes e mãos, lema no arco). Chamado por estrada() em mapas.js.
import { MT } from './estrada-mundo-texto.js';
import { memoria, lembrar, zerou } from './estrada-extra.js';

const CONQ_KEY = 'hora-silencio-v2-conq';
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const finais = () => { const c = lsGet(CONQ_KEY, {}) || {}; return { comum: !!c.final_comum, silencio: !!c.final_silencio, verdadeiro: !!c.final_verdadeiro }; };
const nomeJogador = () => { const n = lsGet('hora-silencio-nome', ''); return typeof n === 'string' ? n.trim().slice(0, 16) : ''; };
const CRIANCA = "'Comic Sans MS', 'Chalkboard SE', cursive";
const MAO = "'Segoe Script', 'Bradley Hand', cursive";

export function mundoEstrada(A, S, c) {
  const { THREE, MAT, box, cyl, plano, interact } = A;
  const U = c.ex.util, GZ = c.GZ, grupo = A.W.grupo, P = A.P, cam = A.camera;
  const vivo = () => A.W.grupo === grupo && A.S === S;
  const jogando = () => vivo() && A.mode === 'jogo';
  const dist = (x, z) => Math.hypot(x - P.pos.x, z - P.pos.z);
  const medo = U.medo, agenda = U.agenda, olhando = U.olhando, raio = U.raio;
  const luzLigada = () => S.inv.lanterna && S.flashOn && S.battery > 0;
  const falar1 = (flag, chave) => { if (S.flags[flag]) return false; S.flags[flag] = true; A.falar(chave); return true; };
  const nota = id => (A.R.notas || []).find(n => id === n.id);
  const F = finais(), jaVeio = !!memoria().noite1;
  const tex = (w, h, draw) => A.canvasTex(w, h, draw);
  const matT = (t, extra = {}) => new THREE.MeshStandardMaterial({ map: t, roughness: .9, ...extra });
  const quadro = (t, w, h, x, y, z, ry = 0, extra, pai) => plano(w, h, matT(t, extra), x, y, z, ry, pai);
  const manchas = (g, w, h, n, cor = 'rgba(0,0,0,.4)', r0 = 10, r1 = 50) => { for (let i = 0; i < n; i++) { const x = Math.random() * w, y = Math.random() * h, r = r0 + Math.random() * (r1 - r0), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, cor); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); } };
  const linhasTexto = (g, linhas, x, y, lh, font, cor, rot = 0) => { g.save(); g.fillStyle = cor; g.font = font; g.textAlign = 'left'; linhas.forEach((l, i) => { g.save(); g.translate(x, y + i * lh); g.rotate(rot + (Math.random() - .5) * .02); g.fillText(l, 0, 0); g.restore(); }); g.restore(); };
  const madeiraClara = new THREE.MeshStandardMaterial({ color: 0x6a5238, roughness: 1 });
  const branco = new THREE.MeshStandardMaterial({ color: 0xcfc8b8, roughness: .8 });
  const cera = new THREE.MeshStandardMaterial({ color: 0xe6d8b8, roughness: .5, emissive: 0x2a2010, emissiveIntensity: .4 });
  const amarelo = new THREE.MeshStandardMaterial({ color: 0xc89a20, roughness: .6 });
  const au = () => (A.audio && A.audio()) || null;
  // som de clique de câmera atrás de você e assobio fino na mata (procedurais)
  const SOM = {
    camera(pos) { const a = au(); if (!a) return; const { AC, saida, burst, env, osc } = a; const t = AC.currentTime; const g = saida(pos, .1); burst(t, .04, 'highpass', 4200, 1, g); env(g, t, .001, .35, .04); const g2 = saida(pos, .1); burst(t + .07, .09, 'bandpass', 1800, 2, g2); env(g2, t + .07, .002, .25, .08); const g3 = saida(pos, .2); osc('sine', 3100, t + .12, .5, g3); env(g3, t + .12, .05, .015, .45); },
    assobio(pos, vol = .12) { const a = au(); if (!a) return; const { AC, saida } = a; const t = AC.currentTime + .05; [[2100, 2600, 0, .32], [2600, 1900, .42, .5]].forEach(([f0, f1, dt, dur]) => { const g = saida(pos, .5, 'amb'), o = AC.createOscillator(), lfo = AC.createOscillator(), lg = AC.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f0, t + dt); o.frequency.linearRampToValueAtTime(f1, t + dt + dur); lfo.frequency.value = 6; lg.gain.value = 25; lfo.connect(lg); lg.connect(o.frequency); o.connect(g); g.gain.setValueAtTime(.0001, t + dt); g.gain.exponentialRampToValueAtTime(vol, t + dt + .06); g.gain.exponentialRampToValueAtTime(.0001, t + dt + dur); o.start(t + dt); lfo.start(t + dt); o.stop(t + dt + dur + .05); lfo.stop(t + dt + dur + .05); }); },
    tuc() { const a = au(); if (!a) return; const { AC, saida, osc, env } = a; const t = AC.currentTime, g = saida(null, .05); osc('sine', 90, t, .25, g); env(g, t, .002, .4, .2); const g2 = saida(null, .05); osc('sine', 14000, t, .3, g2); env(g2, t, .001, .02, .25); },
    voz(pos, silabas, base) { c.ex.util.SX.voz(pos, silabas, base); }
  };
  // laços de som contínuo (córrego e chuvisco da TV); morrem junto com o mapa
  const lacos = [];
  function laco(filtro, freq, q) {
    const a = au(); if (!a) return null; const { AC, saida, ruido } = a;
    const g = saida(null, .15, 'amb'); g.gain.value = 0; const f = AC.createBiquadFilter(); f.type = filtro; f.frequency.value = freq; f.Q.value = q; f.connect(g);
    const s = ruido(true); s.connect(f); s.start();
    const l = { g, f, parar() { try { s.stop(); s.disconnect(); g.disconnect(); } catch (e) {} } }; lacos.push(l); return l;
  }
  const vigia = setInterval(() => { if (!vivo()) { clearInterval(vigia); lacos.forEach(l => l.parar()); lacos.length = 0; } }, 600);

  // =================================================================== O CARRO
  const carro = c.carro;
  // porta-luvas (pela janela do passageiro): o envelope da fita, com carimbo impossível
  const hitPL = box(.5, .34, .55, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), .62, 1.12, -.6, carro, false);
  interact(hitPL, () => `<b>E</b>${S.notes.e_envelope ? 'Ler de novo o envelope da fita' : 'Abrir o porta-luvas'}`, () => {
    A.SFX.clique(); A.lerNota('e_envelope'); if (falar1('viuEnvelope', 'est_portaluvas')) medo(8);
  });
  // a foto presa no limpador de para-brisa (apareceu depois da pancada no teto)
  const desenhaFoto = (g, w, h, alto) => {
    g.fillStyle = '#e8e2d0'; g.fillRect(0, 0, w, h);
    const iw = w - 16, ih = h - 44, gr = g.createLinearGradient(0, 8, 0, 8 + ih); gr.addColorStop(0, '#6a5a44'); gr.addColorStop(1, '#2e261c'); g.fillStyle = gr; g.fillRect(8, 8, iw, ih);
    g.strokeStyle = '#1a140e'; g.lineWidth = 2; for (let x = 14; x < 8 + iw; x += 9) { g.beginPath(); g.moveTo(x, 8 + ih * .25); g.lineTo(x, 8 + ih); g.stroke(); }
    g.fillStyle = '#1a140e'; g.fillRect(8, 8 + ih * .25, iw, 3);
    if (alto) { g.fillStyle = 'rgba(8,6,4,.92)'; g.fillRect(w / 2 - 9, 8 + ih * .08, 18, ih * .92); g.beginPath(); g.ellipse(w / 2, 8 + ih * .08, 8, 12, 0, 0, 6.3); g.fill(); g.fillStyle = 'rgba(200,190,170,.8)'; g.fillRect(w / 2 - 8, 8 + ih * .06, 16, 4); }
    const crianca = (x, alt, cor) => { g.fillStyle = cor; g.fillRect(x - 7, 8 + ih - alt, 14, alt - 10); g.beginPath(); g.arc(x, 8 + ih - alt - 4, 7, 0, 6.3); g.fill(); };
    crianca(w * .36, ih * .55, '#c8b8a0'); crianca(w * .62, ih * .45, '#b0a088');
    manchas(g, w, h, 4, 'rgba(60,40,10,.35)');
    g.fillStyle = '#3a3226'; g.font = `15px ${MAO}`; g.textAlign = 'center'; g.fillText('Lia e Davi — 1978', w / 2, h - 14);
  };
  const fotoA = tex(128, 156, (g, w, h) => desenhaFoto(g, w, h, false)), fotoB = tex(128, 156, (g, w, h) => desenhaFoto(g, w, h, true));
  box(.7, .02, .02, MAT.preto, .15, .965, -1.0, carro, false).rotation.y = .18;
  const polaroid = plano(.14, .17, new THREE.MeshStandardMaterial({ map: fotoA, roughness: .7, side: THREE.DoubleSide }), .32, .975, -1.12, 0, carro);
  polaroid.rotation.set(-Math.PI / 2 - .35, 0, Math.PI + .25); polaroid.visible = !!S.flags.maos;
  const posPolaroid = () => { const v = new THREE.Vector3(); polaroid.getWorldPosition(v); return v; };
  interact(polaroid, () => '<b>E</b>Olhar a foto presa no para-brisa', () => { A.SFX.papel(); if (falar1('viuPolaroid', 'est_polaroid')) medo(6); else A.toast('Lia e Davi, 1978. No portão do internato. A foto está úmida de chuva.'); });
  let polaroidRaio = 0;
  function tickPolaroid(dt) {
    polaroid.visible = !!S.flags.maos;
    if (polaroidRaio > 0) { polaroidRaio -= dt; if (polaroidRaio <= 0) polaroid.material.map = fotoA; return; }
    if (raio() > .35 && polaroid.visible && olhando(posPolaroid(), .35, 3.2, .98)) {
      polaroid.material.map = fotoB; polaroidRaio = .5; A.SFX.estatica(.2, posPolaroid());
      if (!S.flags.polaroidRevelada) { S.flags.polaroidRevelada = true; A.conquista('revelada'); agenda(.8, () => A.falar('est_polaroid_raio')); medo(15); }
    }
  }
  // o tronco foi serrado: corte reto na ponta e o serrote do J.S. no mato
  const texCorte = tex(128, 128, (g, w, h) => { g.fillStyle = '#7a5e3c'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(60,40,20,.7)'; for (let r = 6; r < 64; r += 4 + Math.random() * 3) { g.lineWidth = 1 + Math.random(); g.beginPath(); g.arc(64 + Math.random() * 2, 64 + Math.random() * 2, r, 0, 6.3); g.stroke(); } g.strokeStyle = 'rgba(40,26,12,.35)'; for (let y = 0; y < h; y += 3) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 2); g.stroke(); } manchas(g, w, h, 3, 'rgba(20,14,8,.5)'); });
  const corte = new THREE.Mesh(new THREE.CircleGeometry(.56, 20), new THREE.MeshStandardMaterial({ map: texCorte, roughness: 1 })); corte.position.set(3.71, .55, 3.56); corte.rotation.y = Math.PI / 2 + .08; grupo.add(corte);
  interact(corte, () => '<b>E</b>Olhar a ponta do tronco', () => falar1('viuCorte', 'est_tronco') || A.toast('Corte reto. Serrote.'));
  const serrote = new THREE.Group(); serrote.position.set(5.5, .03, 2.7); serrote.rotation.y = .7; grupo.add(serrote);
  box(.62, .01, .14, MAT.ferrugem, 0, 0, 0, serrote); box(.16, .04, .1, madeiraClara, -.36, .01, .02, serrote);
  interact(serrote, () => '<b>E</b>Olhar o serrote no mato', () => falar1('viuSerrote', 'est_serrote') || A.toast('J.S., gravado no cabo.'));

  // =================================================================== ESTRADA: CARRO -> POSTO
  // tapume da interdição, pichado ao longo dos anos
  const texTapume = tex(512, 230, (g, w, h) => {
    g.fillStyle = '#8a7a52'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? '#c8b020' : '#1a1a1a'; g.save(); g.translate(i * 110, 0); g.transform(1, 0, -.5, 1, 0, 0); g.fillRect(0, 0, 55, 46); g.restore(); }
    g.fillStyle = '#1e1a12'; g.font = 'bold 40px Arial'; g.textAlign = 'center'; g.fillText('ESTRADA INTERDITADA', w / 2, 92); g.font = '24px Arial'; g.fillText('D.E.R. — 1979', w / 2, 122);
    g.save(); g.rotate(-.06); g.fillStyle = 'rgba(160,20,16,.9)'; g.font = `bold 34px ${CRIANCA}`; g.fillText('NÃO RESPONDE', 150, 180); g.restore();
    g.fillStyle = 'rgba(240,240,230,.85)'; g.font = `24px ${MAO}`; g.fillText('SÉRGIO VOLTA PRA CASA', 380, 170); g.fillStyle = 'rgba(20,20,20,.9)'; g.font = `22px ${CRIANCA}`; g.fillText('eles contam', 400, 212);
    manchas(g, w, h, 10, 'rgba(30,24,10,.5)');
  });
  for (const z of [.8, 2.8]) cyl(.05, .05, 1.4, madeiraClara, -5.6, .7, z, 6);
  const tapume = quadro(texTapume, 2.3, 1, -5.55, 1, 1.8, Math.PI / 2, { side: THREE.DoubleSide });
  interact(tapume, () => '<b>E</b>Ler o tapume da interdição', () => falar1('viuTapume', 'est_tapume') || A.toast('NÃO RESPONDE · SÉRGIO VOLTA PRA CASA · eles contam'));
  // placa verde da estrada: "São" riscado e "Silêncio" por cima; no relâmpago, uma mãozinha vermelha; na perseguição, 0 km
  const placaVerde = (km, silencio, mao, risco) => tex(384, 192, (g, w, h) => {
    g.fillStyle = '#1d4a2c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d8e0d0'; g.lineWidth = 5; g.strokeRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#d8e0d0'; g.textAlign = 'center'; g.font = 'bold 34px Arial'; g.fillText('INTERNATO', w / 2, silencio ? 46 : 62); g.fillText('SÃO LÁZARO', w / 2, silencio ? 118 : 104); g.font = 'bold 44px Arial'; g.fillText(km, w / 2, silencio ? 172 : 160);
    if (silencio) { g.strokeStyle = 'rgba(230,230,220,.95)'; g.lineWidth = 6; g.beginPath(); g.moveTo(88, 106); g.lineTo(158, 114); g.moveTo(90, 116); g.lineTo(156, 102); g.stroke(); g.fillStyle = '#efe6d0'; g.font = `bold 26px ${CRIANCA}`; g.save(); g.translate(122, 86); g.rotate(-.1); g.textAlign = 'center'; g.fillText('SILÊNCIO', 0, 0); g.restore(); }
    if (mao) { g.fillStyle = 'rgba(170,16,12,.85)'; g.beginPath(); g.ellipse(332, 150, 14, 17, 0, 0, 6.3); g.fill(); [[-11, -20], [-4, -26], [4, -27], [11, -22], [17, -4]].forEach(([dx, dy]) => { g.beginPath(); g.ellipse(332 + dx, 150 + dy, 3.5, 9, dx * .03, 0, 6.3); g.fill(); }); }
    if (risco) { g.strokeStyle = 'rgba(10,10,10,.8)'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(150 + i * 14, 120); g.lineTo(180 + i * 16, 178); g.stroke(); } }
    manchas(g, w, h, 6, 'rgba(10,20,10,.5)');
  });
  for (const z of [.45, 1.55]) cyl(.04, .04, 2.6, MAT.metal, 6.4, 1.3, z, 6);
  const texSil = placaVerde('2 km', true, false), texSilMao = placaVerde('2 km', true, true), texSil0 = placaVerde('0 km', true, false, true);
  const placaSil = quadro(texSil, 1.6, .8, 6.36, 2.3, 1, -Math.PI / 2);
  interact(placaSil, () => '<b>E</b>Ler a placa da estrada', () => falar1('viuPlacaSil', 'est_placa') || A.toast(S.flags.perseguicao ? 'INTERNATO SILÊNCIO LÁZARO · 0 km. Arranhada.' : 'INTERNATO SILÊNCIO LÁZARO · 2 km'));
  let maoT = 0;
  function tickPlacaSil(dt) {
    if (S.flags.perseguicao) { placaSil.material.map = texSil0; return; }
    if (raio() > .4 && maoT <= 0) maoT = .45;
    if (maoT > 0) { maoT -= dt; placaSil.material.map = maoT > 0 ? texSilMao : texSil; }
  }
  // cruz do Seu Joaquim, com foto 3x4 num saquinho e flores frescas (murcham quando ele some)
  const cruz = (x, z, mat = madeiraClara, alt = 1.1, ry = Math.PI / 2) => { const gq = new THREE.Group(); gq.position.set(x, 0, z); gq.rotation.y = ry; grupo.add(gq); box(.07, alt, .07, mat, 0, alt / 2, 0, gq); box(.46, .07, .07, mat, 0, alt * .74, 0, gq); return gq; };
  const cruzJ = cruz(-5.6, -1);
  const texJ = tex(96, 128, (g, w, h) => { g.fillStyle = '#d8d0bc'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a6e5a'; g.fillRect(14, 10, 68, 70); g.fillStyle = '#4a4034'; g.beginPath(); g.arc(48, 42, 16, 0, 6.3); g.fill(); g.fillRect(28, 58, 40, 22); g.fillStyle = '#3a3226'; g.fillRect(30, 24, 36, 6); g.font = '11px Georgia'; g.textAlign = 'center'; g.fillText('JOAQUIM SILVA', w / 2, 98); g.fillText('✝ 14/03/1979', w / 2, 114); manchas(g, w, h, 3, 'rgba(60,50,20,.3)'); });
  quadro(texJ, .16, .21, 0, .62, .045, 0, { side: THREE.DoubleSide }, cruzJ);
  plano(.2, .25, new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .18, roughness: .05 }), 0, .62, .05, 0, cruzJ);
  const flores = [], corF = [0xd83a4a, 0xe8d040, 0xf0f0f0, 0xd85aa0];
  for (let i = 0; i < 7; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(.045, 6, 5), new THREE.MeshStandardMaterial({ color: corF[i % 4], roughness: .6 })); f.position.set(-.18 + i * .06, .08 + Math.random() * .05, .14 + Math.random() * .06); cruzJ.add(f); flores.push(f); }
  let murchou = false;
  const murchar = () => { if (murchou) return; murchou = true; flores.forEach(f => { f.material.color.setHex(0x3a2a18); f.scale.set(.8, .45, .8); f.position.y = .03; }); };
  if (S.flags.joaquimSumiu) murchar();
  interact(cruzJ, () => S.flags.leuCruz ? 'JOAQUIM SILVA ✝ 14/03/1979' : '<b>E</b>Olhar a cruz na beira da estrada', () => { if (S.flags.leuCruz) return; S.flags.leuCruz = !S.done.posto ? 'antes' : 'depois'; A.falar(murchou ? 'est_cruz_depois' : 'est_cruz'); medo(6); });
  // ponte de tábuas sobre o córrego: correndo, as tábuas estalam alto e algo responde do mato
  const ZP = -3.5;
  const texAguaC = tex(256, 64, (g, w, h) => { g.fillStyle = '#081210'; g.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(120,150,150,${Math.random() * .25})`; g.beginPath(); const x = Math.random() * w, y = Math.random() * h; g.moveTo(x, y); g.lineTo(x + 10 + Math.random() * 30, y + (Math.random() - .5) * 3); g.stroke(); } });
  texAguaC.repeat.set(12, 1);
  const agua = plano(70, 1.6, new THREE.MeshStandardMaterial({ map: texAguaC, roughness: .08, metalness: .5, color: 0x8aa0a0 }), 0, .012, ZP, 0); agua.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 12; i++) box(14.2, .06, .2, i % 3 ? MAT.madeiraEsc : madeiraClara, 0, .05, ZP - 1.1 + i * .2, grupo, false);
  for (const x of [-6.8, 6.8]) for (const z of [ZP - 1.1, ZP + 1.1]) cyl(.06, .06, 1.1, MAT.madeiraEsc, x, .55, z, 6);
  for (const x of [-6.8, 6.8]) box(.06, .06, 2.3, MAT.madeiraEsc, x, 1.05, ZP, grupo, false);
  const somAgua = { l: null };
  const ponte = { acc: 0, ultX: 0, ultZ: 0, respondeu: false };
  function tickPonte(dt) {
    if (!somAgua.l && A.mode === 'jogo') somAgua.l = laco('bandpass', 1100, .7);
    if (somAgua.l) somAgua.l.g.gain.value += ((P.room && P.room.fora ? Math.max(0, 1 - Math.abs(P.pos.z - ZP) / 14) * .05 : 0) - somAgua.l.g.gain.value) * .08;
    const naPonte = Math.abs(P.pos.z - ZP) < 1.15 && Math.abs(P.pos.x) < 7;
    const mov = Math.hypot(P.pos.x - ponte.ultX, P.pos.z - ponte.ultZ); ponte.ultX = P.pos.x; ponte.ultZ = P.pos.z;
    if (!naPonte || mov > 2) { ponte.acc = 0; return; }
    ponte.acc += mov; if (ponte.acc < .62) return; ponte.acc = 0;
    if (P.crouch) { A.SFX.rangido(P.pos.x, .1, P.pos.z, .08); return; }
    const forte = P.sprinting;
    A.SFX.rangido(P.pos.x, .1, P.pos.z, forte ? 1.1 : .35); A.emitNoise(P.pos.x, P.pos.z, forte ? 8 : 3.5, true);
    if (forte && !ponte.respondeu) { ponte.respondeu = true; agenda(.9, () => { A.SFX.estalo({ x: -13, z: ZP - 4 }, 1); medo(10); }); agenda(1.8, () => falar1('ponteFalou', 'est_ponte')); }
  }

  // ônibus escolar tombado na vala, com a lista de chamada da última viagem
  const texLata = tex(256, 128, (g, w, h) => { g.fillStyle = '#8a6a1e'; g.fillRect(0, 0, w, h); manchas(g, w, h, 26, 'rgba(70,30,10,.6)', 6, 30); for (let i = 0; i < 600; i++) { g.fillStyle = `rgba(${60 + Math.random() * 40},${30 + Math.random() * 20},10,${Math.random() * .5})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } manchas(g, w, h, 8, 'rgba(20,40,16,.5)', 10, 40); });
  texLata.repeat.set(3, 1);
  const bus = new THREE.Group(); bus.position.set(-9.3, 0, -9.5); bus.rotation.z = .28; grupo.add(bus);
  const latMat = matT(texLata, { roughness: .8, metalness: .3 });
  box(2.4, 2.4, 9, latMat, 0, 1.5, 0, bus); box(2.3, .6, 1.4, latMat, 0, .9, -5.1, bus);
  for (const z of [-3.2, 3.2]) for (const x of [-1.15, 1.15]) { const r = cyl(.5, .5, .3, MAT.pneu, x, .5, z, 12, bus); r.rotation.z = Math.PI / 2; }
  const texLetreiro = A.textoTex([{ t: 'INTERNATO S. LÁZARO', tam: 46, estilo: 'bold' }], { w: 512, h: 64, fundo: '#7a5a16', cor: '#1a1408', manchas: 8 });
  plano(5.5, .4, matT(texLetreiro), 1.215, 1.05, 0, Math.PI / 2, bus);
  const texRostos = tex(128, 96, (g, w, h) => { g.fillStyle = '#05070a'; g.fillRect(0, 0, w, h); for (const [x, s] of [[34, 1], [92, .85]]) { g.fillStyle = 'rgba(200,196,180,.85)'; g.beginPath(); g.ellipse(x, 52, 16 * s, 21 * s, 0, 0, 6.3); g.fill(); g.fillStyle = '#05070a'; g.beginPath(); g.arc(x - 6 * s, 48, 3.5 * s, 0, 6.3); g.arc(x + 6 * s, 48, 3.5 * s, 0, 6.3); g.fill(); g.fillRect(x - 4 * s, 62, 8 * s, 2); } });
  const texMaoBus = tex(128, 96, (g, w, h) => { g.fillStyle = 'rgba(160,170,180,.35)'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(220,210,200,.75)'; g.beginPath(); g.ellipse(64, 56, 13, 15, 0, 0, 6.3); g.fill(); [[-11, -18], [-4, -24], [4, -25], [11, -20], [17, -2]].forEach(([dx, dy]) => { g.beginPath(); g.ellipse(64 + dx, 56 + dy, 3.2, 8, dx * .03, 0, 6.3); g.fill(); }); });
  const vidroMat = new THREE.MeshStandardMaterial({ color: 0x0a0d10, roughness: .15, metalness: .4 });
  const rostoMat = new THREE.MeshBasicMaterial({ map: texRostos });
  const janelasBus = [];
  for (let i = 0; i < 6; i++) { const j = plano(.95, .7, vidroMat, 1.215, 2.05, -3.4 + i * 1.36, Math.PI / 2, bus); janelasBus.push(j); }
  const maoVidro = plano(.5, .38, new THREE.MeshBasicMaterial({ map: texMaoBus, transparent: true, depthWrite: false }), 1.225, 2.0, -3.4 + 3 * 1.36, Math.PI / 2, bus);
  const texLista = tex(96, 128, (g, w, h) => { g.fillStyle = '#d8cfb4'; g.fillRect(0, 0, w, h); g.fillStyle = '#3a3226'; g.font = 'bold 9px Georgia'; g.fillText('CHAMADA 14/03/79', 6, 14); for (let i = 0; i < 18; i++) { g.fillStyle = 'rgba(40,34,26,.7)'; g.fillRect(8, 22 + i * 5.6, 50 + Math.random() * 20, 1.4); g.fillStyle = i === 4 || i === 9 || i === 15 ? 'rgba(0,0,0,0)' : '#2a4a9a'; g.fillText('✓', 80, 25 + i * 5.6); } manchas(g, w, h, 3, 'rgba(80,60,20,.35)'); });
  const lista = plano(.26, .34, new THREE.MeshStandardMaterial({ map: texLista, roughness: 1, emissive: 0x2a2418, emissiveIntensity: .5 }), 1.23, 2.0, -3.4 + 1.36, Math.PI / 2, bus);
  interact(lista, () => `<b>E</b>${S.notes.e_chamada ? 'Ler de novo a' : 'Ler a'} lista presa na janela do ônibus`, () => { A.lerNota('e_chamada'); if (falar1('viuChamada', 'est_onibus')) medo(6); });
  const mochila = new THREE.Group(); mochila.position.set(1.32, 1.75, -3.4 + 4 * 1.36); bus.add(mochila);
  box(.3, .36, .14, new THREE.MeshStandardMaterial({ color: 0x2a4a6a, roughness: 1 }), 0, -.2, 0, mochila); cyl(.008, .008, .1, MAT.preto, 0, -.02, 0, 4, mochila);
  const piscaBus = new THREE.MeshStandardMaterial({ color: 0x3a1c00, emissive: 0xff8a20, emissiveIntensity: 0 });
  for (const z of [-5.75, 4.52]) box(.2, .14, .06, piscaBus, 1.0, 1.2, z, bus, false);
  const busSt = { raioT: 0, pisca: -1 };
  function tickOnibus(dt) {
    mochila.rotation.x = Math.sin(A.perf() * 1.1) * .22; mochila.rotation.z = Math.sin(A.perf() * .7) * .12;
    maoVidro.visible = !S.flags.maoBusSumiu;
    if (!S.flags.maoBusSumiu && dist(-8.5, -9.5 + 3 * 1.36 - 3.4) < 4.2) { S.flags.maoBusSumiu = true; A.SFX.estalo({ x: -8.6, z: -8.8 }, .35); agenda(.6, () => A.falar('est_onibus_mao')); medo(12); }
    if (raio() > .45 && busSt.raioT <= 0 && P.pos.z < 8 && P.pos.z > -24 && Math.random() < .6) busSt.raioT = .35;
    if (busSt.raioT > 0) { busSt.raioT -= dt; janelasBus.forEach((j, i) => { j.material = busSt.raioT > 0 && i !== 3 ? rostoMat : vidroMat; }); }
    if (busSt.pisca < 0 && P.pos.z < -8.5 && P.pos.z > -14 && S.inv.lanterna) { busSt.pisca = 0; A.SFX.tique({ x: -8.5, z: -15 }); }
    if (busSt.pisca >= 0 && busSt.pisca < 2) { busSt.pisca += dt; piscaBus.emissiveIntensity = (busSt.pisca % .7) < .35 && busSt.pisca < 1.4 ? 2.4 : 0; }
  }
  // ponto de ônibus com recados de quinze anos e a mochila da Ana no banco
  box(.15, 2.2, 2.6, A.texMat('concreto', 1, 1), -6.92, 1.1, -16, grupo); box(1.2, .12, 2.8, A.texMat('concreto', 1, 1), -6.45, 2.26, -16);
  box(.42, .07, 2.0, MAT.madeiraEsc, -6.6, .46, -16); for (const z of [-16.8, -15.2]) box(.06, .44, .06, MAT.metal, -6.6, .22, z);
  A.addCollider(-7, -6.38, -17.1, -14.9);
  const texPonto = tex(512, 300, (g, w, h) => {
    g.fillStyle = '#6a6458'; g.fillRect(0, 0, w, h); manchas(g, w, h, 14, 'rgba(30,26,20,.5)');
    g.fillStyle = '#d8d0b8'; g.fillRect(20, 18, 170, 60); g.fillStyle = '#1a1612'; g.font = 'bold 16px Arial'; g.fillText('LINHA 14 — SERRA', 30, 40); g.fillText('ÚLTIMO ÔNIBUS 21h00', 30, 64);
    g.strokeStyle = '#8a1a12'; g.lineWidth = 4; g.beginPath(); g.moveTo(26, 58); g.lineTo(186, 66); g.stroke(); g.fillStyle = '#8a1a12'; g.font = `bold 18px ${MAO}`; g.fillText('NÃO PASSA MAIS', 40, 98);
    const rec = [['ouvi o sino de novo — 1983', 240, 50, '#e8e0c8', MAO, 20], ['minha irmã entrou e não saiu — 1990', 220, 110, '#d8d8e8', MAO, 18], ['NÃO RESPONDE', 60, 170, '#c02018', CRIANCA, 34], ['SÉRGIO VOLTA PRA CASA', 270, 190, '#f0f0e8', 'Arial', 20], ['eles contam até dez', 90, 250, '#101010', CRIANCA, 24], ['J. esteve aqui toda noite', 300, 268, '#c8b880', MAO, 16]];
    rec.forEach(([t, x, y, cor, f, s]) => { g.save(); g.translate(x, y); g.rotate((Math.random() - .5) * .14); g.fillStyle = cor; g.font = `${s}px ${f}`; g.fillText(t, 0, 0); g.restore(); });
  });
  const recados = quadro(texPonto, 2.4, 1.4, -6.83, 1.35, -16, Math.PI / 2);
  interact(recados, () => `<b>E</b>${S.notes.e_ponto ? 'Ler de novo os' : 'Ler os'} recados do ponto de ônibus`, () => { A.lerNota('e_ponto'); falar1('viuPonto', 'est_ponto'); });
  const mochAna = new THREE.Group(); mochAna.position.set(-6.55, .5, -15.7); mochAna.rotation.y = .4; grupo.add(mochAna);
  box(.32, .36, .16, new THREE.MeshStandardMaterial({ color: 0x8a3a5a, roughness: 1 }), 0, .18, 0, mochAna); box(.2, .14, .03, new THREE.MeshStandardMaterial({ color: 0x6a2a44 }), 0, .12, .09, mochAna);
  quadro(A.textoTex([{ t: 'Ana L. P.', tam: 60, fonte: MAO }], { w: 256, h: 96, fundo: '#e8dcc0', cor: '#2a2018', manchas: 2 }), .11, .04, 0, .3, .085, 0, {}, mochAna);
  interact(mochAna, () => '<b>E</b>Olhar a mochila no banco', () => { A.SFX.papel(); A.toast('Uma etiqueta: Ana L. P. Dentro, um bilhete: "mãe, eu espero aqui."'); falar1('viuPonto', 'est_ponto'); });

  // =================================================================== POSTO (pátio)
  const tigela = new THREE.Group(); tigela.position.set(10.6, 0, -24.4); grupo.add(tigela);
  cyl(.16, .12, .08, MAT.metal, 0, .04, 0, 12, tigela); cyl(.14, .14, .01, new THREE.MeshStandardMaterial({ color: 0x1a2a2a, roughness: .05, metalness: .5 }), 0, .075, 0, 12, tigela);
  const coleira = new THREE.Mesh(new THREE.TorusGeometry(.12, .015, 6, 16), new THREE.MeshStandardMaterial({ color: 0x6a1a10 })); coleira.rotation.x = Math.PI / 2; coleira.position.set(.32, .015, .06); tigela.add(coleira);
  interact(tigela, () => '<b>E</b>Olhar a tigela de cachorro', () => falar1('viuTigela', 'est_tigela') || A.toast('"Tufão", na plaquinha da coleira.'));
  // "aberto 24h" vira "fechado desde 1979" quando o velho some
  const texFechado = A.textoTex([{ t: 'POSTO SERRA', tam: 54, estilo: 'bold' }, { t: 'fechado desde 1979', tam: 30, estilo: 'italic' }], { fundo: '#141a16', cor: '#8a9a80' });
  const placaFechado = plano(2.4, 1.2, new THREE.MeshStandardMaterial({ map: texFechado, roughness: .9 }), 7.63, 5.2, -7.5, Math.PI / 2); placaFechado.visible = !!S.flags.joaquimSumiu;

  // =================================================================== LOJA DO POSTO
  const Y = 1.047;
  // secretária eletrônica com a luz piscando 15
  const texLed = tex(64, 32, (g) => { g.fillStyle = '#100404'; g.fillRect(0, 0, 64, 32); g.fillStyle = '#ff3020'; g.font = 'bold 26px monospace'; g.textAlign = 'center'; g.fillText('15', 32, 26); });
  const sec = new THREE.Group(); sec.position.set(16.42, Y, -14.8); grupo.add(sec);
  box(.2, .07, .26, new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: .5 }), 0, .035, 0, sec); box(.07, .01, .1, MAT.metal, .03, .075, .04, sec);
  const led = plano(.06, .03, new THREE.MeshBasicMaterial({ map: texLed }), -.03, .072, -.07, 0, sec); led.rotation.x = -Math.PI / 2;
  const secSt = { tocando: false, i: 0, ouviu: false };
  function tocarRecados() {
    secSt.tocando = true; A.SFX.clique(); A.SFX.fitaClique(); const pos = { x: 16.42, y: 1.1, z: -14.8 };
    MT.recados.forEach((r, i) => agenda(.8 + i * 4.6, () => {
      A.sub(r.quem, r.texto, true); A.SFX.estatica(.5, pos); A.emitNoise(16.4, -14.8, 2);
      if (!/respiração/.test(r.texto)) SOM.voz(pos, 5 + (r.texto.length / 14 | 0), r.quem === 'lia' ? 200 : 150 + i * 25);
      else for (let k = 0; k < 9; k++) agenda(1 + k * .3, () => A.SFX.tique(pos));
      if (i === MT.recados.length - 1) medo(18);
    }));
    agenda(1.4 + MT.recados.length * 4.6, () => { secSt.tocando = false; A.SFX.fitaClique(); if (!secSt.ouviu) { secSt.ouviu = true; S.flags.recados = true; A.conquista('caixa_postal'); A.falar('est_secretaria_fim'); } });
  }
  interact(sec, () => secSt.tocando ? 'A fita da secretária está rodando...' : `<b>E</b>${S.flags.recados ? 'Ouvir os recados de novo' : 'Ouvir os recados da secretária eletrônica'}`, () => { if (!secSt.tocando) tocarRecados(); });
  // jornal de amanhã
  const desenhaJornal = bom => (g, w, h) => {
    g.fillStyle = '#d8d2c0'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1814'; g.textAlign = 'center'; g.font = 'bold 22px Georgia'; g.fillText('GAZETA DA SERRA', w / 2, 30); g.font = '11px Georgia'; g.fillText('Campos do Jordão — 15 de março de 1994', w / 2, 46); g.fillRect(10, 52, w - 20, 2);
    g.font = 'bold 19px Georgia'; (bom ? ['INTERNATO SÃO LÁZARO', 'DESABA DURANTE', 'A MADRUGADA'] : ['CARRO ABANDONADO', 'NA ESTRADA VELHA']).forEach((l, i) => g.fillText(l, w / 2, 80 + i * 22));
    g.font = 'italic 12px Georgia'; g.fillText(bom ? '"Agora eles dormem", diz moça de Taubaté' : 'Motorista não foi encontrada', w / 2, bom ? 150 : 128);
    g.fillStyle = '#5a5448'; g.fillRect(16, 160, 90, 64); g.fillStyle = '#2a2620'; if (!bom) { g.fillRect(30, 196, 60, 18); g.fillRect(40, 186, 40, 12); } else { g.fillRect(24, 200, 74, 24); g.fillRect(44, 178, 10, 24); }
    for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(30,28,24,.55)'; g.fillRect(116, 164 + i * 7, 100 + Math.random() * 20, 2); }
    for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(30,28,24,.5)'; g.fillRect(16, 236 + i * 7, w - 34, 2); }
    manchas(g, w, h, 4, 'rgba(90,70,30,.3)');
  };
  const jornalBom = F.verdadeiro;
  const jornal = plano(.3, .4, new THREE.MeshStandardMaterial({ map: tex(240, 320, desenhaJornal(jornalBom)), roughness: 1 }), 16.42, Y + .004, -16.1, 0); jornal.rotation.set(-Math.PI / 2, 0, Math.PI / 2 + .12);
  interact(jornal, () => '<b>E</b>Ler o jornal no balcão', () => {
    const n = nota('e_jornal'); if (n && jornalBom && n.textoDepois) { n.texto = n.textoDepois; }
    A.lerNota('e_jornal'); if (falar1('viuJornal', jornalBom ? 'est_jornal_bom' : 'est_jornal')) medo(jornalBom ? 0 : 10);
  });
  // livro de quem subiu: a última linha já tem o nome dela, com a hora em que ela saiu do carro
  const desfecho = F.verdadeiro ? ' dormiu. Os três dormiram.' : F.silencio ? ' ficou.' : F.comum ? ' voltou. Sozinha.' : '';
  const nLivro = nota('e_livro'), modeloLivro = nLivro ? nLivro.texto : '';
  const desenhaLivro = lado => (g, w, h) => {
    g.fillStyle = '#d6cdb0'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(70,90,140,.35)'; for (let y = 20; y < h; y += 13) { g.beginPath(); g.moveTo(6, y); g.lineTo(w - 6, y); g.stroke(); }
    const ls = lado ? ['1988 Dona Cida', '  não voltou', '1991 Padre Lúcio', '  não voltou', '1992 Moça de', '  Taubaté', '  não voltou', '', '1994 Lia Moraes'] : ['QUEM SUBIU', '1980 Dois rapazes', '  não voltou', '1983 Del. Arantes', '  não voltou', '1986 Sérgio Lima', '  não voltou'];
    ls.forEach((l, i) => { g.fillStyle = l.includes('não voltou') ? 'rgba(90,90,90,.85)' : i === 8 && lado ? 'rgba(20,24,60,1)' : 'rgba(30,26,20,.9)'; g.font = `${i === 0 && !lado ? 'bold ' : ''}12px ${MAO}`; g.fillText(l, 10, 17 + i * 13); });
    if (lado) { g.fillStyle = 'rgba(20,24,60,.45)'; g.beginPath(); g.ellipse(80, 118, 22, 5, 0, 0, 6.3); g.fill(); }
    manchas(g, w, h, 2, 'rgba(90,70,30,.3)');
  };
  const livro = new THREE.Group(); livro.position.set(16.42, Y + .01, -16.88); livro.rotation.y = Math.PI / 2; grupo.add(livro);
  box(.46, .015, .32, new THREE.MeshStandardMaterial({ color: 0x3a1a12, roughness: .8 }), 0, -.004, 0, livro);
  [-1, 1].forEach((s, i) => { const p = plano(.21, .3, new THREE.MeshStandardMaterial({ map: tex(128, 180, desenhaLivro(i)), roughness: 1 }), s * .108, .006, 0, 0, livro); p.rotation.x = -Math.PI / 2; p.rotation.y = -s * .08; });
  interact(livro, () => '<b>E</b>Ler o livro aberto no balcão', () => {
    const n = nota('e_livro'); if (n) n.texto = modeloLivro.replace('{hora}', S.flags.horaSaiu || '21h04').replace('{desfecho}', desfecho);
    A.lerNota('e_livro'); if (falar1('viuLivro', 'est_livro')) medo(14);
  });
  // café ainda soltando fumaça (para quando ele some, e vira mofo)
  const xic = new THREE.Group(); xic.position.set(16.45, Y, -17.62); grupo.add(xic);
  cyl(.07, .07, .01, branco, 0, .005, 0, 14, xic); cyl(.04, .032, .07, branco, 0, .045, 0, 12, xic);
  const cafe = cyl(.037, .037, .004, new THREE.MeshStandardMaterial({ color: 0x1a0c04, roughness: .1 }), 0, .075, 0, 12, xic);
  const NV = 14, vp = new Float32Array(NV * 3), vap = []; for (let i = 0; i < NV; i++) vap.push({ t: Math.random() * 2, x: 0, z: 0 });
  const vg = new THREE.BufferGeometry(); vg.setAttribute('position', new THREE.BufferAttribute(vp, 3));
  const vapor = new THREE.Points(vg, new THREE.PointsMaterial({ color: 0xd8d4cc, size: .025, transparent: true, opacity: .45, depthWrite: false })); vapor.position.copy(xic.position); vapor.frustumCulled = false; grupo.add(vapor);
  let mofou = false;
  const mofar = () => { if (mofou) return; mofou = true; vapor.visible = false; cafe.material.color.setHex(0x4a5a3a); cafe.material.roughness = 1; };
  function tickVapor(dt) {
    if (S.flags.joaquimSumiu) { mofar(); return; }
    vap.forEach((v, i) => { v.t += dt * .6; if (v.t > 1) { v.t = 0; v.x = (Math.random() - .5) * .03; v.z = (Math.random() - .5) * .03; } vp[i * 3] = v.x + Math.sin(v.t * 6 + i) * .015; vp[i * 3 + 1] = .08 + v.t * .22; vp[i * 3 + 2] = v.z; });
    vg.attributes.position.needsUpdate = true;
  }
  if (S.flags.joaquimSumiu) mofar();
  interact(xic, () => '<b>E</b>Tocar a xícara de café', () => { if (mofou) { A.falar('est_cafe_frio'); medo(6); } else A.falar('est_cafe'); });
  // caderneta de fiado (pilhas do Moacir, velas da Celeste, querosene do diretor; e a dica do fumo)
  const fiado = box(.16, .02, .22, new THREE.MeshStandardMaterial({ color: 0x1a2a5a, roughness: .8 }), 16.4, Y + .01, -18.3, grupo, false); fiado.rotation.y = .3;
  interact(fiado, () => '<b>E</b>Ler a caderneta de fiado', () => { A.lerNota('e_fiado'); falar1('viuFiado', 'est_fiado'); });
  // rascunhos das regras amassados no chão, atrás do balcão
  const rasc = new THREE.Group(); grupo.add(rasc);
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(.055, 0), MAT.papel); b.position.set(17.15 + Math.random() * .6, .05, -15.2 + Math.random() * .5); b.rotation.set(Math.random() * 3, Math.random() * 3, 0); b.scale.set(1, .8, 1.1); rasc.add(b); }
  interact(rasc, () => '<b>E</b>Desamassar os papéis do chão', () => { A.lerNota('e_rascunhos'); if (falar1('viuRascunhos', 'est_rascunhos')) medo(8); });
  // cama de campanha, marmita fria, maço de cartas e o fumo de corda
  A.prop(2.0, .36, .72, MAT.ferrugem, 18.42, .18, -13.78);
  box(1.9, .1, .66, new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 1 }), 18.42, .41, -13.78); box(.4, .12, .5, MAT.colchao, 19.2, .51, -13.78);
  const cartas = new THREE.Group(); cartas.position.set(18.0, .47, -13.72); cartas.rotation.y = .4; grupo.add(cartas);
  box(.16, .06, .11, MAT.papel, 0, .03, 0, cartas); box(.17, .012, .012, madeiraClara, 0, .062, 0, cartas); box(.012, .012, .12, madeiraClara, 0, .062, 0, cartas);
  let cartaN = S.flags.cartaN || 0;
  interact(cartas, () => `<b>E</b>${S.notes.e_cartas ? 'Ler outra carta do maço' : 'Ler o maço de cartas'}`, () => {
    const n = nota('e_cartas'); if (n) n.texto = MT.cartas[cartaN % MT.cartas.length] + `\n\n(carta ${cartaN % MT.cartas.length + 1} de ${MT.cartas.length} · o maço tem mais de trinta)`;
    cartaN++; S.flags.cartaN = cartaN; A.lerNota('e_cartas'); if (cartaN === 2) A.falar('est_cartas');
  });
  A.prop(.5, .45, .5, A.MAT.madeiraEsc, 19.45, .225, -14.75);
  box(.2, .08, .14, MAT.metal, 19.32, .49, -14.66, grupo); box(.2, .01, .14, MAT.metal, 19.32, .535, -14.66, grupo).rotation.z = .5;
  const fumo = new THREE.Mesh(new THREE.TorusGeometry(.07, .03, 8, 16), new THREE.MeshStandardMaterial({ color: 0x3a2412, roughness: 1 })); fumo.rotation.x = Math.PI / 2; fumo.position.set(19.55, .48, -14.88); grupo.add(fumo);
  fumo.visible = !S.flags.temFumo && !S.flags.fumoDeixado;
  interact(fumo, () => '<b>E</b>Pegar o rolo de fumo de corda', () => { S.flags.temFumo = true; fumo.visible = false; A.SFX.pegar(); A.toast('Fumo de corda guardado.'); if (S.notes.e_fiado) A.falar('est_fumo'); }, { on: () => fumo.visible });
  // foto do Joaquim zelador com as crianças: no segundo olhar falta uma criança; quando ele some, o rosto dele vira luz
  const desenhaFotoJ = (est) => (g, w, h) => {
    g.fillStyle = '#3a2a1a'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#a8987a'); gr.addColorStop(1, '#5a4a36'); g.fillStyle = gr; g.fillRect(10, 10, w - 20, h - 40);
    g.strokeStyle = '#2a2016'; g.lineWidth = 3; for (let x = 18; x < w - 10; x += 12) { g.beginPath(); g.moveTo(x, 30); g.lineTo(x, h - 30); g.stroke(); }
    g.fillStyle = '#3a3024'; g.fillRect(w / 2 - 14, 34, 28, 72); g.beginPath(); g.arc(w / 2, 30, 13, 0, 6.3); g.fill();
    if (est === 2) { const gl = g.createRadialGradient(w / 2, 30, 0, w / 2, 30, 18); gl.addColorStop(0, 'rgba(255,250,230,1)'); gl.addColorStop(1, 'rgba(255,250,230,0)'); g.fillStyle = gl; g.fillRect(w / 2 - 20, 10, 40, 40); }
    const kid = (x, a) => { g.fillStyle = '#4a3e30'; g.fillRect(x - 7, h - 30 - a, 14, a); g.beginPath(); g.arc(x, h - 34 - a, 7, 0, 6.3); g.fill(); };
    kid(40, 40); kid(66, 46); if (est === 0) kid(w - 66, 42); kid(w - 40, 36);
    g.fillStyle = '#d8cfb4'; g.font = '12px Georgia'; g.textAlign = 'center'; g.fillText('São Lázaro, 1978 — J. Silva, zelador', w / 2, h - 12);
    manchas(g, w, h, 4, 'rgba(30,20,10,.4)');
  };
  const fotosJ = [0, 1, 2].map(e => tex(220, 170, desenhaFotoJ(e)));
  let estFoto = S.flags.fotoJ || 0;
  const fotoJ = plano(.42, .32, new THREE.MeshStandardMaterial({ map: fotosJ[0], roughness: .8 }), 19.9, 1.6, -19.7, -Math.PI / 2);
  box(.03, .38, .48, MAT.madeiraEsc, 19.93, 1.6, -19.7, grupo, false);
  const poseFoto = () => { fotoJ.material.map = fotosJ[S.flags.joaquimSumiu ? 2 : Math.min(1, estFoto > 1 ? 1 : 0)]; fotoJ.material.needsUpdate = true; };
  poseFoto();
  interact(fotoJ, () => '<b>E</b>Olhar a foto emoldurada', () => {
    if (S.flags.joaquimSumiu) { if (falar1('viuFoto3', 'est_foto3')) medo(10); return; }
    estFoto++; S.flags.fotoJ = estFoto;
    if (estFoto === 1) A.falar('est_foto1'); else if (estFoto === 2) { A.falar('est_foto2'); medo(12); A.SFX.estalo({ x: 19.5, z: -19.7 }, .4); }
    else A.toast('São Lázaro, 1978 — J. Silva, zelador. Três crianças.');
    poseFoto();
  });
  // ao segundo olhar a criança já sumiu da foto (a troca acontece quando você desvia os olhos)
  let fotoTrocou = estFoto > 1;
  function tickFoto() {
    if (S.flags.joaquimSumiu) { if (fotoJ.material.map !== fotosJ[2]) { fotoJ.material.map = fotosJ[2]; fotoJ.material.needsUpdate = true; } return; }
    if (estFoto >= 1 && !fotoTrocou && !olhando({ x: 19.9, z: -19.7 }, .6, 12, 1.6)) { fotoTrocou = true; estFoto = Math.max(estFoto, 2); S.flags.fotoJ = estFoto; fotoJ.material.map = fotosJ[1]; fotoJ.material.needsUpdate = true; }
  }
  // crachá do zelador ao lado do calendário
  const texCracha = tex(96, 128, (g, w, h) => { g.fillStyle = '#e0dccc'; g.fillRect(0, 0, w, h); g.fillStyle = '#1d3a5a'; g.fillRect(0, 0, w, 22); g.fillStyle = '#e0dccc'; g.font = 'bold 10px Arial'; g.textAlign = 'center'; g.fillText('INTERNATO S. LÁZARO', w / 2, 15); g.fillStyle = '#7a6e5a'; g.fillRect(28, 30, 40, 46); g.fillStyle = '#1a1612'; g.font = 'bold 11px Arial'; g.fillText('JOAQUIM SILVA', w / 2, 92); g.font = '10px Arial'; g.fillText('ZELADOR', w / 2, 106); g.fillText('1958 — 1979', w / 2, 120); });
  const cracha = plano(.11, .15, new THREE.MeshStandardMaterial({ map: texCracha, roughness: .7 }), 19.9, 1.45, -13.55, -Math.PI / 2);
  interact(cracha, () => S.flags.joaquimSumiu ? '<b>E</b>Olhar o crachá na parede' : 'Um crachá: JOAQUIM SILVA · ZELADOR · 1958–1979', () => { if (S.flags.joaquimSumiu) falar1('viuCracha', 'est_cracha'); });
  // macacão chamuscado pendurado atrás do fliperama (balança depois que ele some)
  const texMac = tex(128, 256, (g, w, h) => { g.fillStyle = '#3e4a52'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a343a'; g.fillRect(0, 120, w, 8); g.fillRect(56, 128, 16, h); g.fillStyle = '#d8c890'; g.font = `bold 11px Arial`; g.textAlign = 'center'; g.fillText('J. SILVA — ZELADOR', w / 2, 52); g.fillText('S. LÁZARO', w / 2, 66); const gr = g.createLinearGradient(0, h - 70, 0, h); gr.addColorStop(0, 'rgba(10,6,2,0)'); gr.addColorStop(1, 'rgba(10,6,2,.95)'); g.fillStyle = gr; g.fillRect(0, h - 70, w, 70); manchas(g, w, h, 5, 'rgba(10,8,4,.5)'); });
  const macPiv = new THREE.Group(); macPiv.position.set(12.4, 1.85, -20.86); grupo.add(macPiv);
  const mac = plano(.46, 1.05, new THREE.MeshStandardMaterial({ map: texMac, roughness: 1, side: THREE.DoubleSide }), 0, -.55, 0, 0, macPiv); cyl(.006, .006, .06, MAT.metal, 0, 0, .02, 4, macPiv).rotation.x = Math.PI / 2;
  interact(mac, () => '<b>E</b>Olhar o macacão pendurado', () => { if (S.flags.joaquimSumiu) { if (falar1('viuMacVazio', 'est_macacao_vazio')) medo(8); } else falar1('viuMac', 'est_macacao'); });
  let macT = 0;
  function tickMacacao(dt) { if (!S.flags.joaquimSumiu) return; macT += dt; const k = Math.exp(-macT * .08) * .28 + .04; macPiv.rotation.x = Math.sin(macT * 2.1) * k; macPiv.rotation.z = Math.sin(macT * 1.3) * k * .4; }
  // geladeira com uma TV de tubo fora do ar em cima (chuvisco, barras de cor, e uma capela no meio do chiado)
  A.prop(.66, 1.44, .6, branco, 12.43, .72, -13.42);
  box(.42, .38, .5, new THREE.MeshStandardMaterial({ color: 0x2a221a, roughness: .7 }), 12.43, 1.63, -13.45, grupo);
  for (const s of [-1, 1]) { const ant = cyl(.004, .004, .35, MAT.metal, 12.43, 1.95, -13.45 + s * .06, 4); ant.rotation.x = s * .5; }
  const cvTV = document.createElement('canvas'); cvTV.width = 64; cvTV.height = 48; const gTV = cvTV.getContext('2d');
  const texTV = new THREE.CanvasTexture(cvTV); texTV.colorSpace = THREE.SRGBColorSpace; texTV.magFilter = THREE.NearestFilter;
  const telaTV = plano(.3, .23, new THREE.MeshBasicMaterial({ map: texTV }), 12.645, 1.64, -13.45, Math.PI / 2);
  const tv = { t: 0, barras: 0, capela: 0, desligada: false, voltaT: 0, l: null, viuCapela: false };
  function desenhaTV(modo) {
    if (modo === 'off') { gTV.fillStyle = '#050605'; gTV.fillRect(0, 0, 64, 48); }
    else if (modo === 'barras') { ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'].forEach((c2, i) => { gTV.fillStyle = c2; gTV.fillRect(i * 9.2, 0, 9.3, 36); }); gTV.fillStyle = '#101010'; gTV.fillRect(0, 36, 64, 12); }
    else { const im = gTV.createImageData(64, 48); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 200 | 0; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
      if (modo === 'capela') for (let y = 0; y < 48; y++) for (let x = 0; x < 64; x++) { const dentro = (y > 22 && y < 44 && x > 20 && x < 44) || (y > 8 && y <= 22 && Math.abs(x - 32) < (y - 6) * .9) || (y > 2 && y < 9 && Math.abs(x - 32) < 3); if (dentro) { const k = (y * 64 + x) * 4; im.data[k] = im.data[k + 1] = im.data[k + 2] = 8; } }
      gTV.putImageData(im, 0, 0); }
    texTV.needsUpdate = true;
  }
  desenhaTV('chuvisco');
  interact(telaTV, () => tv.desligada ? 'A TV está desligada.' : '<b>E</b>Desligar a TV', () => { if (tv.desligada) return; tv.desligada = true; tv.voltaT = 22; SOM.tuc(); desenhaTV('off'); });
  function tickTV(dt) {
    const d = dist(12.5, -13.45), perto = d < 14 && P.room && (P.room.id === 'posto' || P.room.id === 'patioPosto');
    if (!tv.l && A.mode === 'jogo') tv.l = laco('highpass', 2600, .5);
    if (tv.l) tv.l.g.gain.value += ((perto && !tv.desligada ? Math.max(0, 1 - d / 6) * .03 : 0) - tv.l.g.gain.value) * .1;
    if (tv.desligada) { tv.voltaT -= dt; if (tv.voltaT <= 0 && d < 9) { tv.desligada = false; SOM.tuc(); A.SFX.estatica(.6, { x: 12.6, y: 1.6, z: -13.45 }); falar1('tvVoltou', 'est_tv_volta'); medo(10); } return; }
    if (!perto) return;
    tv.t -= dt; if (tv.t > 0) return; tv.t = .09;
    if (tv.capela > 0) { tv.capela--; desenhaTV('capela'); if (!tv.viuCapela && olhando({ x: 12.64, z: -13.45 }, .45, 8, 1.64)) { tv.viuCapela = true; agenda(.6, () => A.falar('est_tv')); medo(10); } return; }
    if (tv.barras > 0) { tv.barras -= tv.t; return; }
    if (Math.random() < .006) { tv.barras = 2.5; desenhaTV('barras'); return; }
    desenhaTV('chuvisco');
  }
  // mural de cortiça: quem passou e não voltou, recados de mães e a foto do carro dela tirada do teto
  const texMural = tex(384, 288, (g, w, h) => {
    g.fillStyle = '#8a6a44'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(${60 + Math.random() * 60},${40 + Math.random() * 40},20,.5)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    const papel = (x, y, ww, hh, rot, cor, txt, f = 11, nv) => { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = cor; g.fillRect(-ww / 2, -hh / 2, ww, hh); g.fillStyle = '#a01010'; g.beginPath(); g.arc(0, -hh / 2 + 5, 3, 0, 6.3); g.fill(); g.fillStyle = '#2a2018'; g.font = `${f}px ${MAO}`; g.textAlign = 'center'; (txt || []).forEach((t, i) => g.fillText(t, 0, -hh / 2 + 22 + i * (f + 3))); if (nv) { g.fillStyle = 'rgba(170,20,16,.95)'; g.font = 'bold 12px Arial'; g.fillText('NÃO VOLTOU', 0, hh / 2 - 8); } g.restore(); };
    const foto = (x, y, rot, txt) => { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = '#e8e2d0'; g.fillRect(-32, -38, 64, 76); g.fillStyle = '#5a5040'; g.fillRect(-27, -33, 54, 50); g.fillStyle = '#2a2420'; g.beginPath(); g.arc(0, -14, 10, 0, 6.3); g.fill(); g.fillRect(-12, -4, 24, 21); g.fillStyle = 'rgba(170,20,16,.95)'; g.font = 'bold 10px Arial'; g.textAlign = 'center'; g.fillText('NÃO VOLTOU', 0, 31); g.fillStyle = '#2a2018'; g.font = `9px ${MAO}`; g.fillText(txt, 0, 22); g.restore(); };
    foto(50, 60, -.1, 'Pe. Lúcio 1991'); foto(124, 52, .08, 'Sérgio 1986'); foto(196, 66, -.05, 'Rapazes 1980');
    papel(60, 170, 100, 70, .06, '#e8e0c8', ['Rosa, a mamãe', 'ainda deixa a', 'janela aberta', '(1966)']);
    papel(165, 176, 100, 70, -.08, '#d8e0e8', ['Ana Luísa, a luz', 'da varanda fica', 'acesa (1979)']);
    papel(260, 60, 80, 90, .1, '#f0e8d0', ['DESAPARECIDOS', 'Davi · Ana · Tomé', '1979'], 10);
    g.save(); g.translate(310, 200); g.rotate(-.12); g.fillStyle = '#f4f2ea'; g.fillRect(-40, -46, 80, 92); g.fillStyle = '#20242a'; g.fillRect(-34, -40, 68, 62); g.fillStyle = '#3a3f36'; g.fillRect(-12, -24, 24, 34); g.fillStyle = '#4a4a40'; g.fillRect(-10, -18, 20, 18); g.fillStyle = '#19120d'; g.save(); g.rotate(.1); g.fillRect(-34, -34, 68, 7); g.restore(); g.fillStyle = 'rgba(255,140,30,.9)'; g.fillRect(-12, 8, 5, 3); g.fillRect(7, 8, 5, 3); g.fillStyle = '#2a2018'; g.font = `10px ${MAO}`; g.textAlign = 'center'; g.fillText('hoje', 0, 38); g.restore();
  });
  const mural = quadro(texMural, 1.0, .75, 12.08, 1.55, -14.9, Math.PI / 2);
  box(.03, .8, 1.06, MAT.madeiraEsc, 12.06, 1.55, -14.9, grupo, false);
  interact(mural, () => '<b>E</b>Olhar o mural de cortiça', () => { A.lerNota('e_mural'); if (falar1('viuMural', 'est_mural')) medo(12); });

  // =================================================================== ESTRADA: POSTO -> PORTÃO
  // outdoor do internato: crianças com os olhos raspados e um homem alto ao fundo (que some num relâmpago)
  const desenhaOutdoor = homem => (g, w, h) => {
    g.fillStyle = '#b8a888'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8aa0a8'); gr.addColorStop(.6, '#c8b890'); gr.addColorStop(1, '#6a7a4a'); g.fillStyle = gr; g.fillRect(0, 50, w, h - 50);
    g.fillStyle = '#5a4a3a'; g.fillRect(260, 70, 160, 90); g.beginPath(); g.moveTo(250, 70); g.lineTo(340, 30); g.lineTo(430, 70); g.fill();
    if (homem) { g.fillStyle = '#1a1612'; g.fillRect(150, 70, 22, 150); g.beginPath(); g.ellipse(161, 62, 10, 15, 0, 0, 6.3); g.fill(); }
    for (let i = 0; i < 6; i++) { const x = 70 + i * 70, y = 210; g.fillStyle = ['#d8a080', '#c89070', '#e0b090'][i % 3]; g.beginPath(); g.arc(x, y - 40, 18, 0, 6.3); g.fill(); g.fillStyle = '#3a4a6a'; g.fillRect(x - 18, y - 22, 36, 46); g.strokeStyle = 'rgba(245,245,240,.95)'; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 14, y - 44 + Math.random() * 2); g.lineTo(x + 14, y - 42); g.stroke(); g.fillStyle = '#6a2a20'; g.beginPath(); g.arc(x, y - 32, 6, .2, 2.9); g.fill(); }
    g.fillStyle = '#1d3a5a'; g.fillRect(0, 0, w, 50); g.fillStyle = '#efe6d0'; g.font = 'bold 30px Georgia'; g.textAlign = 'center'; g.fillText('INTERNATO SÃO LÁZARO — DISCIPLINA E FÉ', w / 2, 36);
    manchas(g, w, h, 18, 'rgba(40,30,20,.55)', 20, 70);
  };
  const outA = tex(512, 256, desenhaOutdoor(true)), outB = tex(512, 256, desenhaOutdoor(false));
  for (const z of [-25, -21]) cyl(.1, .1, 4.4, MAT.madeiraEsc, -9.6, 2.2, z, 6);
  const outdoor = quadro(S.flags.outdoorVazio ? outB : outA, 5, 2.5, -9.5, 3.3, -23, Math.PI / 2);
  function tickOutdoor() {
    if (S.flags.outdoorVazio || raio() < .4) return;
    if (!olhando({ x: -9.5, z: -23 }, .5, 30, 3.3)) return;
    S.flags.outdoorVazio = true; outdoor.material.map = outB; outdoor.material.needsUpdate = true; agenda(1.2, () => A.falar('est_outdoor_raio')); medo(14);
  }
  // placa antiga por baixo da nova: a lanterna de perto descasca a tinta e mostra "asilo-colônia"
  for (const z of [-27.6, -26.4]) cyl(.04, .04, 2.6, MAT.metal, -6.4, 1.3, z, 6);
  const texAsiloA = placaVerde('1 km', false), texAsiloB = tex(384, 192, (g, w, h) => { g.fillStyle = '#3a3428'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8d0b8'; g.textAlign = 'center'; g.font = 'bold 26px Georgia'; g.fillText('ASILO-COLÔNIA', w / 2, 52); g.fillText('SÃO LÁZARO', w / 2, 86); g.font = 'italic 17px Georgia'; g.fillText('PROIBIDA A ENTRADA DE VISITANTES', w / 2, 126); g.font = '14px Georgia'; g.fillText('Serviço Nacional de Lepra — 1931', w / 2, 156); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(29,74,44,.85)'; g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, 30 + Math.random() * 40, 14 + Math.random() * 18, Math.random(), 0, 6.3); g.fill(); } });
  const placaAsilo = quadro(S.flags.asilo ? texAsiloB : texAsiloA, 1.6, .8, -6.36, 2.0, -27, Math.PI / 2);
  let asiloT = 0;
  interact(placaAsilo, () => S.flags.asilo ? '<b>E</b>Ler a placa antiga' : '<b>E</b>Ler a placa da estrada', () => { if (S.flags.asilo) A.toast('ASILO-COLÔNIA SÃO LÁZARO · PROIBIDA A ENTRADA DE VISITANTES · 1931'); else A.toast('INTERNATO SÃO LÁZARO · 1 km. A tinta está descascando.'); });
  function tickAsilo(dt) {
    if (S.flags.asilo) return;
    if (luzLigada() && dist(-6.36, -27) < 3.2 && olhando({ x: -6.36, z: -27 }, .35, 4, 2)) { asiloT += dt; if (asiloT > 1.5) { S.flags.asilo = true; placaAsilo.material.map = texAsiloB; placaAsilo.material.needsUpdate = true; A.SFX.papel(); A.falar('est_asilo'); } }
    else asiloT = Math.max(0, asiloT - dt);
  }
  // oratório de beira de estrada: velas, ex-votos de cera, fotos 3x4 (e uma foto dela, de hoje), orelha de cera do Moacir
  const OX = 6.35, OZ = -29.5;
  const ora = new THREE.Group(); ora.position.set(OX, 0, OZ); grupo.add(ora);
  const alv = A.texMat('reboco', 1, 1);
  box(.34, 1.0, .34, alv, 0, .5, 0, ora); box(.56, .06, .66, alv, -.04, 1.03, 0, ora); box(.06, .7, .66, alv, .22, 1.38, 0, ora);
  for (const s of [-1, 1]) box(.5, .7, .05, alv, -.03, 1.38, s * .31, ora);
  for (const s of [-1, 1]) { const t = box(.6, .05, .44, MAT.telhado, -.03, 1.86, s * .17, ora); t.rotation.x = s * .55; }
  A.addCollider(OX - .3, OX + .3, OZ - .35, OZ + .35);
  const texFotos = tex(256, 96, (g, w, h) => { g.fillStyle = '#2a2018'; g.fillRect(0, 0, w, h); ['Davi', 'Ana', 'Tomé', ''].forEach((n, i) => { const x = 8 + i * 62; g.fillStyle = '#d8d0bc'; g.fillRect(x, 8, 54, 72); g.fillStyle = '#6a6050'; g.fillRect(x + 4, 12, 46, 52); g.fillStyle = '#3a3428'; if (i < 3) { g.beginPath(); g.arc(x + 27, 32, 11, 0, 6.3); g.fill(); g.fillRect(x + 14, 44, 26, 20); } else { g.fillStyle = '#20242a'; g.fillRect(x + 4, 12, 46, 52); g.fillStyle = '#3a3f36'; g.fillRect(x + 26, 40, 22, 14); g.fillStyle = '#4a3a30'; g.beginPath(); g.arc(x + 16, 30, 6, 0, 6.3); g.fill(); g.fillRect(x + 10, 36, 12, 26); } g.fillStyle = '#2a2018'; g.font = `10px ${MAO}`; g.textAlign = 'center'; g.fillText(n || 'hoje', x + 27, 76); }); });
  quadro(texFotos, .4, .15, .185, 1.45, 0, -Math.PI / 2, { side: THREE.DoubleSide }, ora);
  const chamas = []; const chamaMat = new THREE.MeshBasicMaterial({ color: 0xffc060 });
  [-.18, 0, .18].forEach((z, i) => { cyl(.022, .022, .14 + i * .02, MAT.vela, .05, 1.13 + i * .01, z, 8, ora); const ch = new THREE.Mesh(new THREE.SphereGeometry(.014, 6, 5), chamaMat); ch.scale.y = 2.2; ch.position.set(.05, 1.23 + i * .02, z); ora.add(ch); chamas.push(ch); });
  const luzOra = new THREE.PointLight(0xff9a40, 1.3, 5, 1.8); luzOra.position.set(-.2, 1.35, 0); ora.add(luzOra);
  [[-.1, 1.62, -.2], [-.12, 1.6, .2], [-.14, 1.66, 0]].forEach(([x, y, z], i) => { cyl(.002, .002, .14, MAT.preto, x, y + .08, z, 3, ora); const e = new THREE.Mesh(i === 0 ? new THREE.BoxGeometry(.05, .08, .02) : new THREE.SphereGeometry(.035, 8, 6), cera); e.position.set(x, y, z); ora.add(e); });
  const orelha = new THREE.Mesh(new THREE.SphereGeometry(.04, 10, 8), cera); orelha.scale.set(.45, 1.3, .9); orelha.position.set(-.16, 1.56, -.12); ora.add(orelha); cyl(.002, .002, .12, MAT.preto, -.16, 1.68, -.12, 3, ora);
  interact(orelha, () => '<b>E</b>Ler o bilhete enrolado na orelha de cera', () => { A.lerNota('e_orelha'); });
  const fumoOra = new THREE.Mesh(new THREE.TorusGeometry(.06, .025, 8, 14), fumo.material); fumoOra.rotation.x = Math.PI / 2; fumoOra.position.set(-.12, 1.08, -.05); ora.add(fumoOra); fumoOra.visible = !!S.flags.fumoDeixado;
  chamas[1].visible = !!S.flags.velaAcesa;
  let oraPerto = false;
  const hitOra = box(.06, .36, .62, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), -.27, 1.24, 0, ora, false);
  interact(hitOra, () => (S.flags.temFumo && !S.flags.fumoDeixado) ? '<b>E</b>Deixar o fumo de corda no oratório' : '<b>E</b>Olhar o oratório', () => {
    if (S.flags.temFumo && !S.flags.fumoDeixado) { S.flags.fumoDeixado = true; S.flags.temFumo = false; fumoOra.visible = true; A.SFX.pegar(); A.conquista('oferenda'); agenda(1.2, () => A.falar('est_fumo_deixou')); return; }
    if (!S.flags.viuOratorio) { S.flags.viuOratorio = true; A.falar('est_oratorio'); medo(14); agenda(1.6, () => { const yaw = P.yaw; SOM.camera({ x: P.pos.x + Math.sin(yaw) * 2.2, y: 1.6, z: P.pos.z + Math.cos(yaw) * 2.2 }); P.shake = Math.max(P.shake || 0, .08); }); return; }
    A.toast('Davi, Ana, Tomé. E uma foto sua, de costas, ao lado do carro. Escrito: hoje.');
  });
  function tickOratorio() {
    const d = dist(OX, OZ); if (d < 3.2) oraPerto = true;
    if (!S.flags.velaAcesa && oraPerto && d > 7) { S.flags.velaAcesa = true; chamas[1].visible = true; if (d < 20) agenda(.4, () => A.falar('est_oratorio_vela')); }
    const t = A.perf() * 6; luzOra.intensity = 1.2 + Math.sin(t) * .15 + Math.sin(t * 2.3) * .1; chamas.forEach((ch, i) => { ch.scale.y = 2.2 + Math.sin(t * 1.3 + i) * .4; });
  }
  // assobio fino na mata que acompanha a Lia (some quando ela deixa o fumo na capelinha)
  const asb = { t: 22, ini: -1 };
  function tickAssobio(dt) {
    if (S.flags.fumoDeixado || !S.inv.lanterna || !P.room || !P.room.fora || S.done.abrir_portao) return;
    if (asb.ini < 0) asb.ini = A.perf();
    asb.t -= dt; if (asb.t > 0) return; asb.t = 16 + Math.random() * 10;
    const min = (A.perf() - asb.ini) / 60, d = Math.max(5, 24 - min * 5), lado = Math.random() < .5 ? -1 : 1, yaw = P.yaw + lado * 1.9;
    SOM.assobio({ x: P.pos.x + Math.sin(yaw) * d, y: 1.6, z: P.pos.z + Math.cos(yaw) * d }, Math.min(.2, .07 + min * .03));
    if (!S.flags.ouviuAssobio) { S.flags.ouviuAssobio = true; agenda(1.4, () => A.falar('est_assobio')); }
    medo(3 + min * 2);
  }
  // cruzes de quem tentou antes (e uma nova, ainda sem nome)
  const texPlaq = t => A.textoTex([{ t, tam: 40, fonte: MAO }], { w: 256, h: 64, fundo: '#b8a888', cor: '#2a2018', manchas: 2 });
  [['Sérgio, repórter — 1986', -32], ['Padre Lúcio — 1991', -33.4], ['Moça de Taubaté — 1992', -34.8], ['', -36.2]].forEach(([nome, z], i) => {
    const nova = !nome, cr = cruz(-6.1, z, nova ? new THREE.MeshStandardMaterial({ color: 0xb89a70, roughness: 1 }) : madeiraClara, nova ? 1.2 : 1.0);
    if (nome) quadro(texPlaq(nome), .34, .085, 0, .55, .045, 0, {}, cr);
    if (!nova) { const fl = new THREE.Mesh(new THREE.SphereGeometry(.05, 5, 4), new THREE.MeshStandardMaterial({ color: 0x4a3a20 })); fl.position.set(0, .04, .12); fl.scale.y = .5; cr.add(fl); }
    interact(cr, () => nova ? '<b>E</b>Olhar a cruz nova' : `<b>E</b>Ler a cruz: ${nome}`, () => { if (nova) { if (falar1('viuCruzNova', 'est_cruz_nova')) medo(12); } else falar1('viuCruzes', 'est_cruzes'); });
  });
  // placas pintadas à mão pelo Joaquim: a velha desbotada, a nova em vermelho, e a última virada de cabeça para baixo
  const tabua = (linhas, cor, fundo, desb) => tex(320, 120, (g, w, h) => { g.fillStyle = fundo; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(0,0,0,.3)'; for (let y = 0; y < h; y += 30) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + 3); g.stroke(); } g.globalAlpha = desb ? .45 : 1; g.fillStyle = cor; g.textAlign = 'center'; linhas.forEach((l, i) => { g.font = `bold ${l.length > 14 ? 26 : 42}px ${MAO}`; g.fillText(l, w / 2, h / (linhas.length + 1) * (i + 1) + 12); }); g.globalAlpha = 1; manchas(g, w, h, 6, 'rgba(20,14,8,.5)'); });
  const tabuas = [[['NÃO CORRA'], '#e8e0c8', '#4a3a28', true, -6.55, -38.2, Math.PI / 2, 0], [['NÃO RESPONDA.', 'NEM SE FOR ELE.'], '#c01810', '#3a2a1c', false, 6.55, -41, -Math.PI / 2, 0], [['ENTRA'], '#e8e0c8', '#3a2a1c', false, -6.55, -53.2, Math.PI / 2, Math.PI]];
  tabuas.forEach(([l, cor, fundo, desb, x, z, ry, rz]) => { cyl(.07, .07, 2.4, MAT.tronco, x + (x < 0 ? -.12 : .12), 1.2, z, 6); const p = quadro(tabua(l, cor, fundo, desb), 1.1, .42, x, 1.7, z, ry); p.rotation.z = rz; interact(p, () => `Uma tábua pregada, pintada à mão: ${l.join(' ')}${rz ? ' (de cabeça para baixo)' : ''}`, () => {}); });
  // marcos de quilômetro em contagem regressiva (o KM 2 vira KM 9 quando você passa e não está olhando)
  const marcoTex = (txt, giz) => tex(96, 160, (g, w, h) => { g.fillStyle = '#c8c4b8'; g.fillRect(0, 0, w, h); g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, 44); g.fillStyle = '#e8e4d8'; g.font = 'bold 24px Arial'; g.textAlign = 'center'; g.fillText('KM', w / 2, 32); g.fillStyle = '#1a1a1a'; g.font = 'bold 54px Arial'; g.fillText(txt, w / 2, 104); if (giz) { g.fillStyle = 'rgba(240,240,240,.85)'; g.font = `15px ${CRIANCA}`; giz.split('|').forEach((t, i) => g.fillText(t, w / 2, 128 + i * 16)); } manchas(g, w, h, 5, 'rgba(30,40,20,.5)'); });
  const marcos = {};
  [['5', null, 5.7, 16, -Math.PI / 2], ['4', null, -5.7, -11, Math.PI / 2], ['3', null, 5.7, -27.2, -Math.PI / 2], ['2', null, 5.7, -38.4, -Math.PI / 2], ['1', null, 5.7, -47, -Math.PI / 2], ['0', 'VOLTE|PRA CAMA', 5.6, -57.6, -Math.PI / 2]].forEach(([k, giz, x, z, ry]) => {
    box(.3, .72, .18, A.texMat('concreto', 1, 1), x, .36, z, grupo).rotation.y = ry;
    const face = quadro(marcoTex(k, giz), .28, .46, x + (x > 0 ? -.1 : .1), .42, z, ry); marcos[k] = face;
  });
  const marco9 = marcoTex('9', null);
  if (S.flags.marcoMudou) marcos['2'].material.map = marco9;
  function tickMarco() {
    if (S.flags.marcoMudou) return;
    if (P.pos.z < -42 && !olhando({ x: 5.6, z: -38.4 }, .7, 30, .45)) { S.flags.marcoMudou = true; marcos['2'].material.map = marco9; marcos['2'].material.needsUpdate = true; S.flags.marcoPendente = true; }
  }
  function tickMarcoVisto() { if (S.flags.marcoPendente && olhando({ x: 5.6, z: -38.4 }, .3, 14, .45)) { S.flags.marcoPendente = false; A.falar('est_km_mudou'); medo(12); } }
  // fitinhas amarradas no KM 1, com nomes de família (a dos Moraes é nova)
  const fitinhas = []; const corFi = [0xc8b8a0, 0xa83a3a, 0x3a5a8a, 0xd8c040, 0x5a8a4a, 0xd8d8d8, 0x8a4a8a, 0xe08a30, 0xf0f0f0];
  corFi.forEach((cor, i) => { const f = plano(.03, .32, new THREE.MeshStandardMaterial({ color: cor, roughness: 1, side: THREE.DoubleSide, emissive: i === 8 ? 0x202020 : 0 }), 5.6 - .06 + (i % 3) * .05, .55, -47.1 + (i / 3 | 0) * .06 - .06, -Math.PI / 2); f.geometry.translate(0, -.16, 0); f.position.y = .72; fitinhas.push(f); });
  interact(marcos['1'], () => '<b>E</b>Ler as fitinhas amarradas no marco', () => { A.toast('Prado · Ribeiro · Arantes · Lima · Cunha · Moraes... Pais que subiram para buscar os filhos.'); falar1('viuFitinhas', 'est_km'); });
  // árvore das fitas de promessa (uma rosa, com ANA bordado)
  arvoreSecaLocal(-6.6, -40.6);
  const promessas = [];
  for (let i = 0; i < 26; i++) { const ana = i === 7, f = plano(.035, .5 + Math.random() * .3, new THREE.MeshStandardMaterial({ color: ana ? 0xe890b0 : [0xd8d0c0, 0xc84040, 0x4060a0, 0xe0c040, 0x60a060][i % 5], roughness: 1, side: THREE.DoubleSide }), 0, 0, 0, 0); f.geometry.translate(0, -.3, 0); const a = i / 26 * 6.28; f.position.set(-6.6 + Math.cos(a) * (.4 + Math.random() * .6), 2.2 + Math.random() * 1.6, -40.6 + Math.sin(a) * (.4 + Math.random() * .6)); f.rotation.y = Math.random() * 3; promessas.push(f); }
  interact(promessas[7], () => '<b>E</b>Olhar a fita rosa na árvore', () => falar1('viuFitas', 'est_fitas'));
  interact(troncoFitas, () => '<b>E</b>Olhar as fitas de promessa', () => falar1('viuFitas', 'est_fitas'));
  function tickFitas() { const t = A.perf(); promessas.forEach((f, i) => { f.rotation.x = Math.sin(t * 1.6 + i) * .25; f.rotation.z = Math.sin(t * 1.1 + i * 2) * .15; }); fitinhas.forEach((f, i) => { f.rotation.x = Math.sin(t * 2 + i) * .3; }); }
  // bicicleta de criança queimada, plaqueta 23
  const bici = new THREE.Group(); bici.position.set(5.9, .04, -44); bici.rotation.set(Math.PI / 2 - .08, 0, .5); grupo.add(bici);
  const queimado = new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: 1, metalness: .2 });
  for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(.24, .02, 6, 18), queimado); r.position.set(s * .38, 0, 0); bici.add(r); }
  box(.76, .03, .03, queimado, 0, .1, 0, bici); box(.03, .3, .03, queimado, .1, .2, 0, bici); box(.16, .04, .06, queimado, .1, .36, 0, bici);
  interact(bici, () => '<b>E</b>Olhar a bicicleta no mato', () => falar1('viuBici', 'est_bicicleta') || A.toast('S. LÁZARO Nº 23'));
  // Kombi do internato capotada na vala (o rádio do seu carro liga sozinho quando você chega perto)
  const kombi = new THREE.Group(); kombi.position.set(9.6, 1.0, -35); kombi.rotation.set(0, .2, Math.PI); grupo.add(kombi);
  const texKombi = tex(256, 128, (g, w, h) => { g.fillStyle = '#c8c4b0'; g.fillRect(0, 0, w, h); manchas(g, w, h, 18, 'rgba(40,60,30,.6)', 8, 36); g.fillStyle = 'rgba(30,60,90,.75)'; g.font = 'bold 18px Arial'; g.textAlign = 'center'; g.fillText('INTERNATO SÃO LÁZARO', w / 2, 80); manchas(g, w, h, 8, 'rgba(60,30,10,.5)', 6, 20); });
  box(1.8, 1.9, 4.3, matT(texKombi), 0, 0, 0, kombi); for (let i = 0; i < 3; i++) box(.02, .5, .8, vidroMat, .91, -.3, -1.3 + i * 1.1, kombi);
  for (const z of [-1.5, 1.5]) for (const x of [-.8, .8]) { const r = cyl(.32, .32, .2, MAT.pneu, x, -1.05, z, 10, kombi); r.rotation.z = Math.PI / 2; }
  function tickKombi() { if (!S.flags.kombiRadio && dist(9.6, -35) < 7 && S.flags.joaquimSumiu) { S.flags.kombiRadio = true; U.radioSozinho(); agenda(1.2, () => A.falar('est_kombi')); medo(10); } }
  // Fusca do repórter engolido pelo mato, com o gravador no banco e marcas de mão pequenas por fora do vidro
  const FX = -6.35, FZ = -46;
  const texMusgo = tex(128, 128, (g, w, h) => { g.fillStyle = '#4a5a4a'; g.fillRect(0, 0, w, h); manchas(g, w, h, 30, 'rgba(30,60,20,.7)', 6, 26); manchas(g, w, h, 10, 'rgba(70,40,20,.6)', 6, 18); });
  const musgo = matT(texMusgo);
  box(1.5, .55, 3.8, musgo, FX, .55, FZ, grupo); box(1.3, .08, 1.7, musgo, FX, 1.42, FZ + .1);
  for (const [x, z] of [[-.6, -.7], [.6, -.7], [-.6, .9], [.6, .9]]) cyl(.035, .035, .6, musgo, FX + x, 1.12, FZ + z, 5);
  for (const [x, z] of [[-.75, -1.2], [.75, -1.2], [-.75, 1.2], [.75, 1.2]]) { const r = cyl(.28, .28, .16, MAT.pneu, FX + x, .28, FZ + z, 10); r.rotation.z = Math.PI / 2; }
  box(.9, .06, .5, MAT.colchao, FX, .86, FZ - .2); box(.9, .45, .08, MAT.colchao, FX, 1.08, FZ + .08);
  const texMaoF = tex(128, 64, (g, w, h) => { g.fillStyle = 'rgba(150,160,150,.35)'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(20,16,10,.75)'; [[30, 34], [62, 28], [96, 38]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 7, 8, 0, 0, 6.3); g.fill(); [[-6, -10], [-2, -13], [2, -13.5], [6, -11], [9, -2]].forEach(([dx, dy]) => { g.beginPath(); g.ellipse(x + dx, y + dy, 1.8, 4.5, 0, 0, 6.3); g.fill(); }); }); });
  plano(1.1, .5, new THREE.MeshStandardMaterial({ map: texMaoF, transparent: true, depthWrite: false, roughness: .2 }), FX, 1.12, FZ + .96, 0);
  A.addCollider(FX - .8, FX + .8, FZ - 1.95, FZ + 1.95);
  const fuscaHit = box(1.5, .55, 3.8, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), FX, .56, FZ - .01, grupo, false);
  interact(fuscaHit, () => '<b>E</b>Olhar o Fusca no mato', () => { if (falar1('viuFusca', 'est_fusca')) medo(8); else A.toast('Crachá de imprensa: SÉRGIO LIMA — JORNAL DO VALE — 1986.'); });
  A.ITENS.gravador('f_rep', { x: FX + .2, y: .9, z: FZ - .25 });
  // três cruzinhas brancas sem nome (fita de cabelo, rodinha azul, folha de caderno)
  [[-50.4, 0xe890b0], [-51.2, 0x2a5ad8], [-52, 0xe8e4d8]].forEach(([z, cor], i) => {
    const cr = cruz(-6.1, z, branco, .55);
    const m = new THREE.MeshStandardMaterial({ color: cor, roughness: .8, side: THREE.DoubleSide });
    if (i === 0) box(.12, .03, .03, m, 0, .4, .05, cr); else if (i === 1) { const r = cyl(.03, .03, .02, m, 0, .05, .1, 10, cr); r.rotation.x = Math.PI / 2; } else plano(.1, .13, MAT.papel, 0, .26, .045, 0, cr);
    interact(cr, () => '<b>E</b>Olhar as três cruzinhas brancas', () => { const volta = zerou() || memoria().cruzinhas; lembrar('cruzinhas'); if (!falar1('viuCruzinhas', volta ? 'est_cruzinhas_volta' : 'est_cruzinhas')) A.toast('Sem nome. Uma fita de cabelo, uma rodinha azul, uma folha de caderno.'); });
  });
  // postes de luz mortos; o do meio do trecho final ainda engasga (e apaga de vez na perseguição)
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x202018, emissive: 0xffd8a0, emissiveIntensity: 0 });
  [[6.7, 22], [-6.8, -20], [6.7, -50]].forEach(([x, z], i) => { cyl(.09, .12, 6, MAT.madeiraEsc, x, 3, z, 6); const br = box(1.1, .06, .06, MAT.madeiraEsc, x - Math.sign(x) * .5, 5.8, z); const cab = box(.3, .1, .2, i === 2 ? lampMat : MAT.metal, x - Math.sign(x) * 1, 5.72, z); });
  function tickPoste() { lampMat.emissiveIntensity = S.flags.perseguicao ? 0 : (Math.random() < .07 ? 1.6 : (Math.sin(A.perf() * 3) > .96 ? .8 : 0)); }
  // poças d'água na estrada, refletindo o pouco de luz
  const pocaMat = new THREE.MeshStandardMaterial({ color: 0x06080a, roughness: .04, metalness: .85 });
  [[-1.4, 30], [2, 18], [-2.2, -9], [1.2, -20], [-.8, -33], [2.4, -44], [-1.8, -52]].forEach(([x, z]) => { const p = new THREE.Mesh(new THREE.CircleGeometry(1, 16), pocaMat); p.rotation.x = -Math.PI / 2; p.scale.set(.6 + Math.random() * .8, .4 + Math.random() * .6, 1); p.position.set(x, .007, z); grupo.add(p); });

  // =================================================================== PORTÃO
  // arco de pedra com o lema e a placa do lema caída no chão
  box(5.4, .5, .5, A.texMat('pedra', 2, 1), 0, 3.62, GZ, grupo);
  const texLema = A.textoTex([{ t: 'SILENTIVM SALVAT', tam: 64, estilo: 'bold' }], { w: 512, h: 72, fundo: '#4a4844', cor: '#1e1c18', manchas: 5 });
  const lema = quadro(texLema, 3.2, .42, 0, 3.62, GZ + .26, 0);
  interact(lema, () => '<b>E</b>Ler a inscrição no arco', () => falar1('viuLema', 'est_lema') || A.toast('SILENTIVM SALVAT — o silêncio salva.'));
  const texCaida = tex(384, 96, (g, w, h) => { g.fillStyle = '#3a2a1e'; g.fillRect(0, 0, w, h); manchas(g, w, h, 14, 'rgba(120,60,20,.6)', 6, 30); g.fillStyle = '#c8b898'; g.font = 'bold 26px Georgia'; g.textAlign = 'center'; g.fillText('SÃO LÁZARO — ACOLHER EM SILÊNCIO', w / 2, 58); g.strokeStyle = '#0a0806'; g.lineWidth = 5; g.beginPath(); g.moveTo(178, 46); g.lineTo(276, 56); g.moveTo(178, 56); g.lineTo(276, 44); g.stroke(); });
  const caida = plano(1.4, .36, new THREE.MeshStandardMaterial({ map: texCaida, roughness: .8, metalness: .3 }), -3.4, .03, GZ + .9, 0); caida.rotation.set(-Math.PI / 2, 0, .25);
  interact(caida, () => '<b>E</b>Ler a placa de ferro caída', () => falar1('viuCaida', 'est_lema_caido') || A.toast('SÃO LÁZARO — ACOLHER EM SILÊNCIO. "Acolher" riscado.'));
  // muro: nomes riscados de quem veio procurar alguém (e "LIA ESTEVE AQUI", na letra dela)
  const texNomes = tex(320, 200, (g, w, h) => { g.clearRect(0, 0, w, h); const ns = [['MARCOS 1980', '#d8d0c0'], ['procurando o Zé — 1983', '#c8c0b0'], ['DONA CIDA', '#e0d8c8'], ['Pe. Lúcio 91', '#c8c8d0'], ['SÉRGIO', '#d8d0b8'], ['voltem pra casa', '#c8b8a8'], ['1988 — R.', '#d0c8b8'], ['Luzia esteve aqui', '#c8c0b0']]; ns.forEach(([t, cor], i) => { g.save(); g.translate(14 + (i % 2) * 150 + Math.random() * 20, 26 + (i / 2 | 0) * 34); g.rotate((Math.random() - .5) * .2); g.fillStyle = cor; g.globalAlpha = .55 + Math.random() * .3; g.font = `${16 + Math.random() * 6 | 0}px ${i % 3 ? MAO : 'Arial'}`; g.fillText(t, 0, 0); g.restore(); }); g.globalAlpha = .9; g.fillStyle = '#efe8d8'; g.save(); g.translate(60, 178); g.rotate(-.05); g.font = `22px ${MAO}`; g.fillText('Lia esteve aqui — 1994', 0, 0); g.restore(); });
  const nomes = plano(1.6, 1.0, new THREE.MeshStandardMaterial({ map: texNomes, transparent: true, depthWrite: false, roughness: 1 }), 3.35, 1.2, GZ + .22, 0);
  interact(nomes, () => '<b>E</b>Ler os nomes riscados no muro', () => { if (falar1('viuMuro', 'est_muro')) medo(12); else A.toast('Nomes e datas. E "Lia esteve aqui — 1994".'); });
  // 34 mãozinhas de cal em fila, com três lugares vazios (preenchidos de tinta fresca depois do final verdadeiro)
  const texMaos = tex(512, 96, (g, w, h) => { g.clearRect(0, 0, w, h); let k = 0; for (let r = 0; r < 2; r++) for (let i = 0; i < 20; i++) { const x = 14 + i * 25, y = 30 + r * 44; const vaga = r === 1 && (i === 8 || i === 9 || i === 10); if (k >= 37) continue; k++; if (vaga && !F.verdadeiro) continue; g.fillStyle = vaga ? 'rgba(170,24,16,.95)' : 'rgba(235,232,220,.8)'; g.beginPath(); g.ellipse(x, y, 7, 8, 0, 0, 6.3); g.fill(); [[-6, -10], [-2, -13], [2, -13.5], [6, -11], [9, -2]].forEach(([dx, dy]) => { g.beginPath(); g.ellipse(x + dx, y + dy, 1.8, 4.5, 0, 0, 6.3); g.fill(); }); } });
  const maos = plano(2.3, .44, new THREE.MeshStandardMaterial({ map: texMaos, transparent: true, depthWrite: false, roughness: 1 }), -3.75, 1.0, GZ + .22, 0);
  interact(maos, () => '<b>E</b>Olhar as marcas de mão no muro', () => falar1('viuMaos', F.verdadeiro ? 'est_maos_cheias' : 'est_maos') || A.toast(F.verdadeiro ? '37 mãozinhas. As três do meio ainda pegajosas.' : '34 mãozinhas de cal. Três lugares vazios.'));
  // guarita do Seu Joaquim: lampião aceso, caderno de rondas, parede de risquinhos, capa pingando e um "6?" no vidro
  const GX0 = -6.9, GX1 = -5.1, GZ0 = GZ + 1.4, GZ1 = GZ + 3.6, GCX = (GX0 + GX1) / 2, GCZ = (GZ0 + GZ1) / 2;
  const mGua = A.texMat('madeira', 1, 1, { color: 0x6a5a48 });
  box(.1, 2.3, 2.2, mGua, GX0, 1.15, GCZ); box(1.8, 2.3, .1, mGua, GCX, 1.15, GZ0); box(1.8, 2.3, .1, mGua, GCX, 1.15, GZ1);
  box(.1, 1.0, 2.2, mGua, GX1, .5, GCZ); box(.1, .4, 2.2, mGua, GX1, 2.1, GCZ); box(.1, .9, .5, mGua, GX1, 1.45, GZ0 + .25); box(.1, .9, .5, mGua, GX1, 1.45, GZ1 - .25);
  box(2.2, .12, 2.6, MAT.telhado, GCX, 2.36, GCZ);
  A.addCollider(GX0 - .05, GX1 + .05, GZ0 - .05, GZ1 + .05);
  box(.8, .05, 1.0, MAT.madeiraEsc, GCX - .3, .78, GCZ); box(.06, .76, .06, MAT.madeiraEsc, GCX - .3, .38, GCZ);
  const texRondas = tex(128, 160, (g, w, h) => { g.fillStyle = '#d6cdb0'; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { g.fillStyle = i === 15 ? 'rgba(20,24,60,.95)' : 'rgba(40,34,26,.7)'; g.fillRect(8, 12 + i * 9, 80 + Math.random() * 30, 2); } });
  const cad = plano(.22, .28, new THREE.MeshStandardMaterial({ map: texRondas, roughness: 1 }), GCX - .2, .81, GCZ - .1, 0); cad.rotation.set(-Math.PI / 2, 0, .3);
  cyl(.04, .05, .2, new THREE.MeshStandardMaterial({ color: 0x8a2a1a, roughness: .5 }), GCX - .55, .9, GCZ + .3, 10);
  const lampiao = new THREE.Mesh(new THREE.CylinderGeometry(.05, .06, .16, 8), new THREE.MeshStandardMaterial({ color: 0x302010, emissive: 0xffa040, emissiveIntensity: 1.2, transparent: true, opacity: .9 })); lampiao.position.set(GCX - .4, .9, GCZ - .35); grupo.add(lampiao);
  const luzGua = new THREE.PointLight(0xffa850, 1.6, 5.5, 1.6); luzGua.position.set(GCX - .2, 1.3, GCZ - .2); grupo.add(luzGua);
  const texRisc = tex(256, 192, (g, w, h) => { g.fillStyle = '#5a4a38'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(230,220,200,.55)'; g.lineWidth = 1; for (let i = 0; i < 1400; i++) { const gx = (i % 70) * 3.6 + 4, gy = (i / 70 | 0) * 9.4 + 4; if (i % 5 === 4) { g.beginPath(); g.moveTo(gx - 14, gy + 6); g.lineTo(gx, gy); g.stroke(); } else { g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx, gy + 7); g.stroke(); } } });
  quadro(texRisc, 2.0, 1.4, GX0 + .06, 1.35, GCZ, Math.PI / 2);
  const texVidroA = tex(128, 128, (g, w, h) => { g.fillStyle = 'rgba(190,200,205,.32)'; g.fillRect(0, 0, w, h); manchas(g, w, h, 6, 'rgba(230,235,240,.25)', 10, 40); });
  const texVidroB = tex(128, 128, (g, w, h) => { g.fillStyle = 'rgba(190,200,205,.32)'; g.fillRect(0, 0, w, h); manchas(g, w, h, 6, 'rgba(230,235,240,.25)', 10, 40); g.globalCompositeOperation = 'destination-out'; g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(46, 76, 16, 0, 6.3); g.moveTo(62, 40); g.quadraticCurveTo(30, 34, 30, 76); g.stroke(); g.beginPath(); g.moveTo(80, 44); g.quadraticCurveTo(102, 34, 100, 56); g.quadraticCurveTo(98, 66, 90, 72); g.lineTo(90, 82); g.stroke(); g.beginPath(); g.arc(90, 98, 3, 0, 6.3); g.stroke(); g.globalCompositeOperation = 'source-over'; });
  const vidroG = plano(1.1, .9, new THREE.MeshStandardMaterial({ map: S.flags.vidro6 ? texVidroB : texVidroA, transparent: true, depthWrite: false, roughness: .1, side: THREE.DoubleSide }), GX1 + .02, 1.45, GCZ, Math.PI / 2);
  interact(vidroG, () => `<b>E</b>${S.notes.e_rondas ? 'Ler de novo o' : 'Olhar pela janela da guarita: o'} caderno de rondas`, () => { A.lerNota('e_rondas'); if (falar1('viuGuarita', 'est_guarita')) medo(8); });
  function tickGuarita() {
    luzGua.intensity = 1.5 + Math.sin(A.perf() * 7) * .12 + (Math.random() < .03 ? -.6 : 0);
    if (!S.flags.vidro6 && luzLigada() && dist(GX1, GCZ) < 2.4 && olhando({ x: GX1, z: GCZ }, .4, 3, 1.45)) { S.flags.vidro6 = true; vidroG.material.map = texVidroB; vidroG.material.needsUpdate = true; A.falar('est_guarita_vidro'); medo(10); }
  }
  // capa de chuva amarela pendurada do lado de fora, pingando (some quando o cadeado abre)
  const capa = box(.42, .95, .06, amarelo, GX1 + .08, 1.35, GZ1 - .12, grupo, false); capa.visible = !S.done.abrir_portao;
  const ND = 10, dp = new Float32Array(ND * 3), gotas = []; for (let i = 0; i < ND; i++) gotas.push({ y: Math.random(), x: (Math.random() - .5) * .38 });
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  const pingos = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xa8b8c8, size: .02, transparent: true, opacity: .7 })); pingos.position.set(GX1 + .1, 0, GZ1 - .12); pingos.frustumCulled = false; grupo.add(pingos);
  function tickCapa(dt) {
    if (S.done.abrir_portao && capa.visible) { capa.visible = false; pingos.visible = false; }
    if (!capa.visible) return;
    gotas.forEach((g, i) => { g.y += dt * (1.6 + i * .1); if (g.y > .85) g.y = 0; dp[i * 3] = 0; dp[i * 3 + 1] = .87 - g.y; dp[i * 3 + 2] = g.x; });
    dg.attributes.position.needsUpdate = true;
  }
  // o fantasma do Seu Joaquim com o lampião, na mata perto do portão, balançando a cabeça (não)
  const fant = new THREE.Group(); fant.position.set(-11, 0, GZ + 12); grupo.add(fant); fant.visible = false;
  const capaMat = new THREE.MeshStandardMaterial({ color: 0x8a7020, roughness: .8 });
  cyl(.2, .34, 1.4, capaMat, 0, .75, 0, 8, fant); const cabF = new THREE.Group(); cabF.position.y = 1.62; fant.add(cabF);
  const cabM = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), new THREE.MeshStandardMaterial({ color: 0x8a6e58, roughness: .7 })); cabF.add(cabM); cyl(.22, .22, .03, MAT.preto, 0, .12, 0, 12, cabF);
  const lampF = new THREE.Mesh(new THREE.SphereGeometry(.06, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffc070 })); lampF.position.set(.32, .85, .1); fant.add(lampF);
  const luzF = new THREE.PointLight(0xffb060, 0, 7, 1.6); luzF.position.set(.32, .9, .2); fant.add(luzF);
  const fan = { fase: 0, t: 0, visto: 0 };
  function tickFantasma(dt) {
    if (fan.fase === 9) return;
    if (!fan.fase) { if (S.flags.joaquimSumiu && P.pos.z < GZ + 26 && P.room && P.room.id === 'estrada') { fan.fase = 1; fant.visible = true; luzF.intensity = 2.2; } return; }
    fan.t += dt; fant.rotation.y = Math.atan2(P.pos.x - fant.position.x, P.pos.z - fant.position.z);
    cabF.rotation.y = Math.sin(fan.t * 2.4) * .45; luzF.intensity = 2 + Math.sin(fan.t * 9) * .3; lampF.position.y = .85 + Math.sin(fan.t * 1.5) * .03;
    if (olhando(fant.position, .3, 30, 1.4)) { fan.visto += dt; if (fan.visto > .8 && !S.flags.viuLampiao) { S.flags.viuLampiao = true; A.falar('est_lampiao'); medo(8); } }
    if (dist(fant.position.x, fant.position.z) < 8 || fan.t > 18 || S.done.abrir_portao) { fan.fase = 9; fant.visible = false; luzF.intensity = 0; A.SFX.estalo({ x: fant.position.x, z: fant.position.z }, .3); }
  }
  // lamparina que guia quem se perde: depois de um tempo sem chegar mais perto do objetivo, uma luz aparece adiante
  const guiaG = new THREE.Group(); guiaG.visible = false; grupo.add(guiaG);
  const guiaLamp = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffc070 })); guiaLamp.position.y = 1.1; guiaG.add(guiaLamp);
  const luzGuia = new THREE.PointLight(0xffb060, 0, 8, 1.5); luzGuia.position.y = 1.2; guiaG.add(luzGuia);
  const guia = { t: 0, melhor: 1e9, alvo: '', on: false };
  function alvoGuia() {
    if (!S.inv.lanterna || S.done.abrir_portao) return null;
    if (!S.done.posto) return { id: 'posto', x: 12, z: -17 };
    if (S.done.chave_portao) return { id: 'portao', x: 0, z: GZ + 1 };
    return null;
  }
  function tickGuia(dt) {
    const a = alvoGuia();
    if (!a) { if (guia.on) { guia.on = false; guiaG.visible = false; luzGuia.intensity = 0; } return; }
    if (a.id !== guia.alvo) { guia.alvo = a.id; guia.t = 0; guia.melhor = 1e9; }
    const d = dist(a.x, a.z);
    if (d < guia.melhor - 2.5) { guia.melhor = d; guia.t = 0; if (guia.on) { guia.on = false; guiaG.visible = false; luzGuia.intensity = 0; } }
    if (guia.on) { guiaLamp.position.y = 1.1 + Math.sin(A.perf() * 2) * .05; guiaG.position.x += Math.sin(A.perf() * 1.3) * .002; luzGuia.intensity = 2 + Math.sin(A.perf() * 8) * .3; if (dist(guiaG.position.x, guiaG.position.z) < 3.5) { guia.on = false; guiaG.visible = false; luzGuia.intensity = 0; guia.t = 25; A.SFX.estalo({ x: guiaG.position.x, z: guiaG.position.z }, .25); } return; }
    guia.t += dt; if (guia.t < 40 || d < 6) return;
    const L = Math.min(12, d - 2), vx = (a.x - P.pos.x) / d, vz = (a.z - P.pos.z) / d;
    let x = P.pos.x + vx * L, z = P.pos.z + vz * L; if (z > -6 || z < -26 || x < 7) x = Math.max(-5.5, Math.min(5.5, x));
    if (a.id === 'posto' && P.pos.z > -6) { z = Math.max(-12, Math.min(P.pos.z - 8, -2)); x = 3; }
    guiaG.position.set(x, 0, z); guiaG.visible = true; guia.on = true; luzGuia.intensity = 2; guia.t = 0;
    falar1('viuGuia', 'est_guia');
  }

  // =================================================================== RÁDIO DO CARRO: estações novas
  const nomeJ = nomeJogador();
  c.ex.radioExtra = (trocas) => {
    if (S.flags.joaquimSumiu && !S.flags.radioVivo1) { S.flags.radioVivo1 = true; agenda(3.5, () => A.falar('est_radio_live')); medo(14); return { quem: 'radio', texto: MT.radioVivo.perto }; }
    if (S.flags.joaquimSumiu && !S.flags.radioVivo2) { S.flags.radioVivo2 = true; medo(10); return { quem: 'radio', texto: MT.radioVivo.costas }; }
    if (trocas === 3) return MT.radioNome(nomeJ || 'moça do carro cinza');
    if (trocas === 6 && jaVeio) return MT.radioOntem(nomeJ || 'a moça do carro cinza');
    return null;
  };

  // =================================================================== CENA DE ABERTURA: o que os faróis pegam no caminho
  // placas da estrada contando errado (9 km... 3 km) e uma menina parada na beira, que some quando o farol chega
  for (const [z, km] of [[52, '9 km'], [30, '3 km']]) { for (const dz of [-.55, .55]) cyl(.04, .04, 2.6, MAT.metal, 6.4, 1.3, z + dz, 6); quadro(placaVerde(km, false), 1.6, .8, 6.36, 2.3, z, -Math.PI / 2); }
  const menina = new THREE.Group(); menina.visible = false; menina.position.set(-4.7, 0, 30.5); grupo.add(menina);
  const vestido = new THREE.MeshStandardMaterial({ color: 0xb8b0a0, roughness: 1, emissive: 0x141210, emissiveIntensity: .5 });
  cyl(.12, .26, .85, vestido, 0, .55, 0, 8, menina); const cabMen = new THREE.Mesh(new THREE.SphereGeometry(.11, 10, 8), new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 1 })); cabMen.position.y = 1.08; menina.add(cabMen);
  for (const s of [-1, 1]) cyl(.025, .02, .45, vestido, s * .16, .62, 0, 5, menina);
  const cabecaTras = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), new THREE.MeshBasicMaterial({ color: 0x030303 })); cabecaTras.scale.set(.9, 1.15, .9); cabecaTras.position.set(.36, 1.22, .95); cabecaTras.visible = false; carro.add(cabecaTras);
  const ce = { menina: false, sino: false, resp: false, cab: false };
  const cena = c.ex.cena, cIni = cena.iniciar, cUp = cena.update, cFim = cena.fim;
  cena.iniciar = () => { cIni(); Object.assign(ce, { menina: false, sino: false, resp: false, cab: false }); polaroid.visible = false; };
  cena.update = (t, dt) => {
    cUp(t, dt);
    const cz = carro.position.z;
    menina.visible = t > 6.5 && cz - menina.position.z > 9 && cz - menina.position.z < 34;
    if (menina.visible) menina.rotation.y = Math.atan2(carro.position.x - menina.position.x, cz - menina.position.z);
    if (!ce.menina && t > 6.5 && cz - menina.position.z <= 9) { ce.menina = true; A.sub('lia', MT.falas.est_menina_cena[0].texto, false); }
    if (!ce.sino && t > 20.8) { ce.sino = true; A.SFX.sino(.22, { x: 0, y: 8, z: GZ - 30 }); }
    if (!ce.resp && t > 22.4) { ce.resp = true; c.ex.util.SX.respiracao({ x: carro.position.x + .4, y: 1.1, z: cz + 1 }); }
    if (t > 25.4) polaroid.visible = true;
    cabecaTras.visible = t > 25.9 && t < 26.5;
    if (!ce.cab && t > 26.5) { ce.cab = true; A.SFX.estalo({ x: carro.position.x, z: cz + 1 }, .3); }
  };
  cena.fim = () => { cFim(); menina.visible = false; cabecaTras.visible = false; polaroid.visible = true; marcarSaida(); };
  function marcarSaida() { if (!S.flags.horaSaiu) { const d = new Date(); S.flags.horaSaiu = `${String(d.getHours()).padStart(2, '0')}h${String(d.getMinutes()).padStart(2, '0')}`; } lembrar('noite1'); }
  if (S.flags.saiuCarro) marcarSaida();

  // =================================================================== TICK
  let viuSumir = !!S.flags.joaquimSumiu;
  A.W.tick.push(dt => {
    if (!vivo()) return;
    tickFitas(); tickOratorio(); tickPoste();
    if (A.mode !== 'jogo') return;
    tickPolaroid(dt); tickPlacaSil(dt); tickPonte(dt); tickOnibus(dt); tickVapor(dt); tickFoto(); tickMacacao(dt); tickTV(dt);
    tickOutdoor(); tickAsilo(dt); tickAssobio(dt); tickMarco(); tickMarcoVisto(); tickKombi(); tickGuarita(); tickCapa(dt); tickFantasma(dt); tickGuia(dt);
    if (S.flags.joaquimSumiu && !viuSumir) {
      viuSumir = true; murchar(); placaFechado.visible = true;
      if (P.room && P.room.id === 'posto') { tv.capela = 3; tv.t = 2.2; }
      if (S.flags.leuCruz === 'antes') agenda(26, () => { if (S.mapa === 'estrada') falar1('cruzLembrou', 'est_cruz_depois'); });
    }
  });

  function arvoreSecaLocal(x, z) { const h = 5.5; const tr = cyl(.16, .3, h, MAT.tronco, x, h / 2, z, 6); troncoFitas = tr; for (let k = 0; k < 6; k++) { const b = cyl(.03, .08, 2.2, MAT.tronco, x, h * .5 + k * .45, z, 5); b.rotation.z = Math.sin(k * 2.1) * 1.1; b.rotation.x = Math.cos(k * 1.7) * .7; } A.addCollider(x - .3, x + .3, z - .3, z + .3); }
  var troncoFitas;
  return { tvCapela: () => { tv.capela = 3; } };
}
