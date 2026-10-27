// PRÓLOGO — extras da estrada (Lote 1): cena de abertura, sustos casados com relâmpago, vulto que espreita
// pela mata, perseguição curta do vulto (ensina "olhe" e "não corra"), orelhão que atende, rádio do carro
// sintonizável e os detalhes do posto. Chamado por estrada() em mapas.js.
import { TXT, mesclarTexto } from './estrada-roteiro.js';
import { semFlash, movK, vibrar } from './estrada-polimento.js';

const CONQ_KEY = 'hora-silencio-v2-conq';
const MEM_KEY = 'hora-silencio-estrada';
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
export const memoria = () => lsGet(MEM_KEY, {}) || {};
export const lembrar = k => { const m = memoria(); m[k] = true; lsSet(MEM_KEY, m); };
export const zerou = () => { const c = lsGet(CONQ_KEY, {}) || {}; return !!(c.final_comum || c.final_silencio || c.final_verdadeiro); };
export const SPAWN = { x: .2, z: 13.1, yaw: -.72 };
const lerp = (a, b, t) => a + (b - a) * t;

export function extrasEstrada(A, S, c) {
  const { THREE, MAT, box, cyl, plano, interact } = A;
  mesclarTexto(A.R);
  const grupo = A.W.grupo, P = A.P, cam = A.camera, GZ = c.GZ;
  const vivo = () => A.W.grupo === grupo && A.S === S;
  const jogando = () => vivo() && A.mode === 'jogo';
  const _v = new THREE.Vector3(), _f = new THREE.Vector3();
  function olhando(p, cone = .5, alcance = 34, y = 1.8) {
    _v.set(p.x, y, p.z).sub(cam.position); const d = _v.length(); if (d > alcance) return false;
    cam.getWorldDirection(_f); return _f.dot(_v.normalize()) > Math.cos(cone);
  }
  const dist = p => Math.hypot(p.x - P.pos.x, p.z - P.pos.z);
  const olharPara = o => { o.rotation.y = Math.atan2(P.pos.x - o.position.x, P.pos.z - o.position.z); };
  const medo = n => { S.fear = Math.min(100, Math.max(S.fear, 0) + n); };
  // agenda: atrasos que só correm com o jogo rodando (param junto com a pausa) e morrem com o mapa
  const fila = [];
  const agenda = (seg, fn) => fila.push({ t: seg, fn });
  const tickFila = dt => { for (let i = fila.length - 1; i >= 0; i--) { const f = fila[i]; f.t -= dt; if (f.t <= 0) { fila.splice(i, 1); if (vivo()) f.fn(); } } };

  // ---------- sons novos (procedurais, usam o mesmo AudioContext do motor)
  const au = () => (A.audio && A.audio()) || null;
  const SX = {
    buzina(pos, dur = .45) {
      const a = au(); if (!a) return; const { AC, saida } = a;
      const t = AC.currentTime, g = saida(pos, .35), lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1600; lp.connect(g);
      for (const f of [392, 494]) { const o = AC.createOscillator(); o.type = 'square'; o.frequency.value = f; o.connect(lp); o.start(t); o.stop(t + dur + .05); }
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.3, t + .02); g.gain.setValueAtTime(.3, t + dur - .04); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    },
    toque(pos) {
      const a = au(); if (!a) return; const { AC, saida, osc } = a;
      const t = AC.currentTime, g = saida(pos, .3); for (const f of [440, 480]) osc('sine', f, t, 1.2, g);
      g.gain.setValueAtTime(0, t); for (let i = 0; i < 24; i++) g.gain.setValueAtTime(i % 2 ? 0 : .07, t + i * .05); g.gain.setValueAtTime(0, t + 1.2);
    },
    voz(pos, silabas = 6, base = 240, grave = false) {
      const a = au(); if (!a) return; const { AC, saida, env } = a; let t = AC.currentTime + .05;
      for (let i = 0; i < silabas; i++) {
        const d = .12 + Math.random() * .16, g = saida(pos, .15), o = AC.createOscillator(), bp = AC.createBiquadFilter(), hp = AC.createBiquadFilter();
        o.type = 'sawtooth'; const f = base * (.85 + Math.random() * .35); o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * (grave ? .8 : .93), t + d);
        bp.type = 'bandpass'; bp.frequency.value = grave ? 500 : 1300; bp.Q.value = 1.4; hp.type = 'highpass'; hp.frequency.value = grave ? 80 : 320;
        o.connect(bp); bp.connect(hp); hp.connect(g); env(g, t, .02, grave ? .2 : .09, d); o.start(t); o.stop(t + d + .1);
        t += d + .04 + Math.random() * .08;
      }
    },
    raspar(pos, dur = 1.4) {
      const a = au(); if (!a) return; const { AC, saida, burst } = a;
      const t = AC.currentTime, g = saida(pos, .4), f = burst(t, dur, 'bandpass', 900, 5, g); f.frequency.linearRampToValueAtTime(2600, t + dur);
      g.gain.setValueAtTime(.0001, t); for (let i = 0; i < dur * 12; i++) g.gain.setValueAtTime(.05 + Math.random() * .22, t + i / 12); g.gain.exponentialRampToValueAtTime(.0001, t + dur + .05);
    },
    tique(pos, alto) { const a = au(); if (!a) return; const { AC, saida, burst, env } = a; const t = AC.currentTime, g = saida(pos, 0); burst(t, .04, 'bandpass', alto ? 2200 : 1500, 4, g); env(g, t, .001, .1, .03); },
    bip(pos) { const a = au(); if (!a) return; const { AC, saida, osc, env } = a; const t = AC.currentTime; [660, 520, 390, 260].forEach((f, i) => { const g = saida(pos, .2); osc('square', f, t + i * .22, .2, g); env(g, t + i * .22, .005, .05, .18); }); },
    respiracao(pos) { const a = au(); if (!a) return; const { AC, saida, burst } = a; const t = AC.currentTime; for (let k = 0; k < 2; k++) { const g = saida(pos, .1), t0 = t + k * 1.3; burst(t0, 1, 'lowpass', 700, 1, g); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.14, t0 + .45); g.gain.exponentialRampToValueAtTime(.0001, t0 + 1); } },
    zumbido(pos) {
      const a = au(); if (!a) return null; const { AC, saida } = a;
      const g = saida(pos, .05); g.gain.value = 0; const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.connect(g);
      const os = [120, 240.6].map(f => { const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(lp); o.start(); return o; });
      return { g, parar() { try { os.forEach(o => o.stop()); g.disconnect(); } catch (e) {} } };
    }
  };

  // ---------- relâmpago local (casa os sustos com o clarão; soma à luz do céu do motor)
  const raioH = new THREE.HemisphereLight(0xc4d2ff, 0x202430, 0), raioD = new THREE.DirectionalLight(0xd0dcff, 0);
  raioD.position.set(-20, 30, 30); grupo.add(raioH, raioD);
  let raioK = 0, raioExt = 0;
  // o relâmpago do motor (a cada 14–38 s) também vale para os sustos casados com o clarão
  const SU = A.sustos;
  if (SU && !SU.__estradaRaio && typeof SU.aoRaio === 'function') { const o = SU.aoRaio; SU.__estradaRaio = true; SU.aoRaio = function (...a) { try { window.__raioEstrada && window.__raioEstrada(); } catch (e) {} return o.apply(this, a); }; }
  window.__raioEstrada = () => { if (vivo()) raioExt = 1; };
  const relampago = (k = 1, trovao = true) => { raioK = Math.max(raioK, k); if (trovao) A.SFX.trovao(); };
  const tickRaio = dt => { raioExt = Math.max(0, raioExt - dt * 3); raioK = Math.max(0, raioK - dt * 2.2); const sf = semFlash(), fl = raioK > 0 && (sf || Math.random() < .75) ? raioK * (sf ? .35 : 1) : 0; raioH.intensity = fl * 1.6; raioD.intensity = fl * 3.2; };

  // ---------- o carro: pisca-alerta, vidro de trás com mãos, porta-malas que abre, pegadas, rádio
  const carro = c.carro, carPos = () => ({ x: carro.position.x, y: 1, z: carro.position.z });
  const laranja = new THREE.MeshStandardMaterial({ color: 0x3a1c00, emissive: 0xff8a20, emissiveIntensity: 0 });
  for (const [x, y, z] of [[-.78, .72, -2.12], [.78, .72, -2.12], [-.78, .82, 2.12], [.78, .82, 2.12]]) box(.14, .1, .04, laranja, x, y, z, carro, false);
  const piscaL = [-2.5, 2.5].map(z => { const l = new THREE.PointLight(0xff8a20, 0, 7, 1.6); l.position.set(0, .9, z); carro.add(l); return l; });
  let piscaOn = false, piscaCena = false;
  function tickPisca() {
    const ativo = (S.flags.saiuCarro || piscaCena) && !S.flags.piscaParou && A.mode !== 'titulo';
    const on = ativo && (A.perf() * 1.2) % 1 < .5;
    if (on !== piscaOn) { piscaOn = on; if (ativo && dist(carro.position) < 9) SX.tique(carPos(), on); }
    laranja.emissiveIntensity = on ? 2.2 : 0; for (const l of piscaL) l.intensity = on ? 3 : 0;
    // o pisca para sozinho quando você se afasta com a lanterna
    if (ativo && S.inv.lanterna && A.mode === 'jogo' && dist(carro.position) > 16) S.flags.piscaParou = true;
  }
  const texMaos = A.canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = 'rgba(150,160,172,.55)'; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'destination-out';
    const mao = (x, y, s, r) => {
      g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s); g.fillStyle = 'rgba(0,0,0,.85)';
      g.beginPath(); g.ellipse(0, 0, 9, 11, 0, 0, 6.3); g.fill();
      [[-8, -13, 2.4, 8], [-3, -17, 2.6, 10], [2, -18, 2.6, 10.5], [7, -15, 2.4, 9], [11, -2, 2.4, 7]].forEach(([fx, fy, rx, ry], i) => { g.beginPath(); g.ellipse(fx, fy, rx, ry, i === 4 ? -.9 : fx * .03, 0, 6.3); g.fill(); });
      g.fillRect(-6, 6, 12, 14 + Math.random() * 34); g.restore();
    };
    mao(40, 50, 1.3, -.2); mao(82, 72, 1.1, .1); mao(150, 44, 1.4, .25); mao(204, 80, 1.2, -.1); mao(122, 96, 1, .4);
    g.globalCompositeOperation = 'source-over';
  });
  const vidroTras = plano(1.5, .45, new THREE.MeshStandardMaterial({ map: texMaos, transparent: true, roughness: .2, side: THREE.DoubleSide, depthWrite: false }), 0, 1.25, 1.315, 0, carro);
  vidroTras.visible = !!S.flags.maos;
  interact(vidroTras, () => S.flags.viuMaos ? 'Marcas de mão. Do lado de dentro do vidro.' : '<b>E</b>Olhar o vidro de trás', () => {
    if (S.flags.viuMaos) return; S.flags.viuMaos = true; A.falar('maos_vidro'); SX.respiracao(carPos()); medo(10);
  });
  // porta-malas abre de verdade
  let tampaK = S.inv.lanterna ? 1 : 0;
  const tampa = c.portaMalas;
  const poseTampa = () => { tampa.rotation.x = -1.05 * tampaK; tampa.position.y = .95 + .32 * tampaK; tampa.position.z = 2.05 - .12 * tampaK; };
  poseTampa();
  // pegadas enormes, descalças, do carro até o mato
  const texPe = A.canvasTex(64, 128, (g) => {
    g.fillStyle = 'rgba(20,14,8,.85)'; g.beginPath(); g.ellipse(32, 80, 16, 38, 0, 0, 6.3); g.fill();
    for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(13 + i * 9.5, 28 - Math.abs(2 - i) * 3 + (i === 0 ? 4 : 0), 4.5, 7, 0, 0, 6.3); g.fill(); }
  });
  const matPe = new THREE.MeshStandardMaterial({ map: texPe, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
  { const ini = [2.9, 10.3], fim = [7.9, 15.7], n = 6, dx = fim[0] - ini[0], dz = fim[1] - ini[1], L = Math.hypot(dx, dz), ang = Math.atan2(dx, dz);
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1), lado = i % 2 ? 1 : -1, px = ini[0] + dx * k + dz / L * .24 * lado, pz = ini[1] + dz * k - dx / L * .24 * lado;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(.34, .62), matPe); m.rotation.set(-Math.PI / 2, 0, ang + Math.PI); m.position.set(px, .014, pz); grupo.add(m);
    } }
  // rádio do carro (dá para sintonizar de fora, pela janela do motorista)
  const painel = box(.22, .07, .04, new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xffa040, emissiveIntensity: .45 }), -.08, 1.02, -.78, carro, false);
  const hitRadio = box(.95, .34, .55, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), -.2, 1.12, -.6, carro, false);
  let estacao = -1, trocas = 0, radioCd = 0;
  const posRadio = () => ({ x: carro.position.x - .1, y: 1.05, z: carro.position.z - .75 });
  function sintonizar() {
    if (radioCd > 0) return; radioCd = 1.3; trocas++; if (api.aoSintonizar) api.aoSintonizar(trocas);
    const pos = posRadio(); A.SFX.estatica(.35, pos); painel.material.emissiveIntensity = .2 + Math.random() * .8;
    if (trocas === 9 && !S.flags.radioSecreto) { S.flags.radioSecreto = true; agenda(.5, () => { A.sub(TXT.radioSecreto.quem, TXT.radioSecreto.texto, true); SX.voz(pos, 9, 300); A.toast('Você achou uma frequência escondida.'); }); return; }
    if (api.radioExtra) { const ex = api.radioExtra(trocas); if (ex) { agenda(.4, () => A.sub(ex.quem, ex.texto, true)); agenda(.5, () => SX.voz(pos, 8 + (ex.texto.length / 18 | 0), 190)); return; } }
    estacao = (estacao + 1) % TXT.radio.length; const e = TXT.radio[estacao];
    if (estacao === 3) { agenda(1.6, () => { A.SFX.voz(pos); A.sub(e.quem, e.texto, true); medo(15); }); return; }
    agenda(.4, () => A.sub(e.quem, e.texto, true));
    if (estacao === 0) agenda(.5, () => SX.voz(pos, 10, 170));
    if (estacao === 1) for (let i = 0; i < 10; i++) agenda(.6 + i * .55, () => A.SFX.contagem(pos, 9 - i));
    if (estacao === 2) for (let i = 0; i < 9; i++) agenda(.5 + i * .9, () => A.SFX.sino(.12, pos));
  }
  interact(hitRadio, () => radioCd > 0 ? 'O rádio chia...' : `<b>E</b>${estacao < 0 ? 'Ligar o rádio do carro' : 'Trocar a estação do rádio'}`, () => sintonizar());

  // ---------- o posto: mariposas, zumbido, luz que morre, calendário, bombas, garrafas, fliperama
  const lp = c.lp, LX = lp.x, LZ = lp.z, LY = 2.42;
  const NM = 30, mp = new Float32Array(NM * 3), mar = [];
  for (let i = 0; i < NM; i++) mar.push({ r: .12 + Math.random() * .45, a: Math.random() * 6.28, w: (Math.random() < .5 ? -1 : 1) * (2 + Math.random() * 4), y: (Math.random() - .5) * .5, vy: 0, caiu: false, x: 0, yy: 0, z: 0 });
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3));
  const mariposas = new THREE.Points(mg, new THREE.PointsMaterial({ color: 0xcfc4a0, size: .04 })); mariposas.frustumCulled = false; grupo.add(mariposas);
  function tickMariposas(dt) {
    const morta = S.flags.luzPostoMorta, longe = A.mode === 'jogo' && Math.hypot(P.pos.x - LX, P.pos.z - LZ) > 26;
    if (mariposas.visible === longe) mariposas.visible = !longe;
    if (longe && (!morta || mar.every(m => m.caiu))) return; // longe do posto não calcula nada
    mar.forEach((m, i) => {
      if (!morta) { m.a += m.w * dt; m.x = LX + Math.cos(m.a) * m.r; m.yy = LY + m.y + Math.sin(m.a * 1.7) * .08; m.z = LZ + Math.sin(m.a) * m.r; }
      else if (!m.caiu) { m.vy -= 3 * dt; m.yy += m.vy * dt; m.x += Math.cos(m.a) * dt * .3; if (m.yy <= .03) { m.yy = .03; m.caiu = true; } }
      mp[i * 3] = m.x; mp[i * 3 + 1] = m.yy; mp[i * 3 + 2] = m.z;
    });
    mg.attributes.position.needsUpdate = true;
  }
  if (S.flags.luzPostoMorta) mar.forEach(m => { m.caiu = true; m.x = LX + (Math.random() - .5) * 1.4; m.yy = .03; m.z = LZ + (Math.random() - .5) * 1.4; });
  tickMariposas(0);
  let zb = null, piscaLuz = 0;
  const vigia = setInterval(() => { if (!vivo()) { clearInterval(vigia); if (zb) zb.parar(); zb = null; } }, 500);
  function tickZumbido() {
    const d = Math.hypot(P.pos.x - LX, P.pos.z - LZ);
    if (zb && (d > 14 || S.flags.luzPostoMorta) && zb.g.gain.value < .002) { zb.parar(); zb = null; } // longe ou com a luz morta, desliga os osciladores
    if (!zb && A.mode === 'jogo' && d < 12 && !S.flags.luzPostoMorta) zb = SX.zumbido({ x: LX, y: LY, z: LZ });
    if (!zb) return;
    const alvo = (!S.flags.luzPostoMorta && A.mode === 'jogo') ? Math.max(0, 1 - d / 7) * .045 : 0;
    zb.g.gain.value = lerp(zb.g.gain.value, alvo, .1);
  }
  // calendário parado em março de 1979
  const texCal = A.canvasTex(200, 260, (g, w) => {
    g.fillStyle = '#d9cfb4'; g.fillRect(0, 0, w, 260); g.textAlign = 'center';
    g.fillStyle = '#8a1c14'; g.font = 'bold 34px Georgia'; g.fillText('MARÇO', w / 2, 44);
    g.fillStyle = '#3a3226'; g.font = '24px Georgia'; g.fillText('1979', w / 2, 72);
    g.font = '15px Georgia'; const dias = 'DSTQQSS'; for (let i = 0; i < 7; i++) g.fillText(dias[i], 20 + i * 26.5, 100);
    let d = 1; for (let s = 0; s < 5; s++) for (let i = 0; i < 7; i++) {
      if ((s === 0 && i < 4) || d > 31) continue; const x = 20 + i * 26.5, y = 126 + s * 27;
      g.fillStyle = '#3a3226'; g.fillText(String(d), x, y);
      if (d === 17) { g.strokeStyle = '#b01a10'; g.lineWidth = 3; g.beginPath(); g.ellipse(x, y - 5, 13, 11, 0, 0, 6.3); g.stroke(); }
      d++;
    }
    const gr = g.createRadialGradient(150, 220, 0, 150, 220, 70); gr.addColorStop(0, 'rgba(70,50,20,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, 260);
  });
  const cal = plano(.4, .52, new THREE.MeshStandardMaterial({ map: texCal, roughness: .9 }), 19.86, 1.65, -14.2, -Math.PI / 2);
  interact(cal, () => S.flags.viuCal ? 'Calendário de março de 1979. O dia 17 está circulado.' : '<b>E</b>Olhar o calendário', () => { if (S.flags.viuCal) return; S.flags.viuCal = true; A.SFX.papel(); A.falar('calendario'); });
  // bombas com preço em cruzeiros
  [[-19, 'GASOLINA', 'Cr$ 6,30'], [-15, 'ÁLCOOL', 'Cr$ 4,90']].forEach(([z, t1, t2]) => plano(.34, .2, new THREE.MeshStandardMaterial({ map: A.textoTex([{ t: t1, tam: 46, estilo: 'bold' }, { t: t2, tam: 64 }], { fundo: '#e8dcc0', cor: '#7a1a12', manchas: 3 }), roughness: .8 }), 9.34, 1.15, z, -Math.PI / 2));
  // garrafas de refrigerante de vidro no balcão
  [[16.55, -19.3, 0x1d3d22], [16.3, -19.45, 0x3d2410], [16.45, -19.15, 0x5a6a60]].forEach(([x, z, cor]) => {
    const m = new THREE.MeshStandardMaterial({ color: cor, roughness: .15, metalness: .1, transparent: true, opacity: .85 });
    cyl(.035, .04, .24, m, x, 1.045 + .12, z, 8); cyl(.014, .02, .08, m, x, 1.045 + .28, z, 6);
  });
  // fliperama desligado da tomada
  const fli = new THREE.Group(); fli.position.set(13.1, 0, -20.35); grupo.add(fli);
  const corpoF = box(.7, 1.75, .6, new THREE.MeshStandardMaterial({ color: 0x1a1430, roughness: .7 }), 0, .875, 0, fli);
  box(.72, .1, .32, MAT.preto, 0, 1.0, .4, fli); cyl(.012, .012, .1, MAT.metal, -.12, 1.09, .42, 6, fli);
  A.addCollider(12.75, 13.45, -20.65, -20.05); A.W.solid.push(corpoF);
  const telaOff = new THREE.MeshBasicMaterial({ color: 0x050508 });
  // placar de recordes: as iniciais deles, e um primeiro lugar piscando que vira LIA depois de três fichas
  const mortes = () => { try { const s = JSON.parse(localStorage.getItem('hora-silencio-stats') || '{}'); return Math.min(9999, s.mortes || 0); } catch (e) { return 0; } };
  const placarTex = (pri, piscaOn) => A.canvasTex(256, 192, (g, w) => {
    g.fillStyle = '#020a02'; g.fillRect(0, 0, w, 192); g.fillStyle = '#4cff6a'; g.textAlign = 'center'; g.font = 'bold 30px monospace'; g.fillText('FIM DE JOGO', w / 2, 34);
    g.font = 'bold 20px monospace'; const linhas = [[pri, piscaOn], ['DAV', '0909'], ['ANA', '1010'], ['TOM', '0034']];
    linhas.forEach(([n, p], i) => { if (i === 0 && p === false) return; g.fillText(`${i + 1}. ${n}  ${i === 0 ? String(pri === 'LIA' ? mortes() : 9999).padStart(4, '0') : p}`, w / 2, 72 + i * 26); });
    g.font = '16px monospace'; g.fillText('INSIRA FICHA', w / 2, 178);
  });
  const texPlacarA = placarTex('???', true), texPlacarB = placarTex('???', false);
  let texPlacarL = null, fichas = 0;
  const telaOn = new THREE.MeshBasicMaterial({ map: S.flags.placarLia ? (texPlacarL = placarTex('LIA', true)) : texPlacarA });
  const tela = plano(.5, .38, telaOff, 0, 1.38, .305, 0, fli);
  const luzTela = new THREE.PointLight(0x4cff6a, 0, 3.5, 2); luzTela.position.set(0, 1.4, .6); fli.add(luzTela);
  let telaT = 0;
  const fliPos = { x: 13.1, y: 1.3, z: -20 };
  interact(fli, () => S.flags.joaquimSumiu ? `<b>E</b>${S.flags.placarLia ? 'Olhar o placar do fliperama' : 'Apertar o botão do fliperama'}` : 'Um fliperama velho. O fio está desligado da tomada.', () => {
    if (!S.flags.joaquimSumiu) return; SX.bip(fliPos);
    if (S.flags.placarLia) { A.toast('1. LIA · 2. DAV · 3. ANA · 4. TOM. O fio continua solto no chão.'); return; }
    fichas++; A.SFX.tique(fliPos);
    if (fichas < 3) { A.toast(fichas === 1 ? 'FIM DE JOGO. O fio continua solto no chão.' : 'O primeiro lugar pisca: ???'); return; }
    S.flags.placarLia = true; texPlacarL = placarTex('LIA', true); telaOn.map = texPlacarL; A.conquista('recorde'); agenda(.8, () => A.falar('est_placar')); medo(10);
  });
  function tickFliperama(dt) {
    if (!S.flags.joaquimSumiu || Math.hypot(P.pos.x - fliPos.x, P.pos.z - fliPos.z) > 16) return;
    telaT += dt; const on = (telaT % 1.2) < .8;
    if (!S.flags.placarLia) telaOn.map = (telaT % .5) < .25 ? texPlacarA : texPlacarB;
    tela.material = on ? telaOn : telaOff; luzTela.intensity = on ? .9 : .15;
  }
  // Seu Joaquim vira o rosto para você quando você não está olhando
  function tickJoaquim() {
    if (!c.velho.visible) return;
    const jp = c.joaquim.position;
    if (olhando(jp, .7, 30, 1.2)) return;
    let d = Math.atan2(P.pos.x - jp.x, P.pos.z - jp.z) - c.joaquim.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
    c.velho.rotation.y = Math.max(-.9, Math.min(.9, d));
  }
  // chamado por mapas.js quando ele some: a luz estala e morre, as mariposas caem, o fliperama acorda
  function sumir(instantaneo) {
    if (instantaneo) { S.flags.luzPostoMorta = true; return; }
    if (S.flags.luzPostoMorta) return;
    piscaLuz = 1.3; A.SFX.estalo({ x: LX, z: LZ }, .9);
    agenda(1.3, () => { S.flags.luzPostoMorta = true; A.SFX.estalo({ x: LX, z: LZ }, 1); A.SFX.vidro(LX, LZ); A.syncLuzes(); medo(15); });
    agenda(2.4, () => SX.bip(fliPos));
  }
  function tickLuzPosto(dt) {
    if (piscaLuz <= 0 || S.flags.luzPostoMorta) return;
    piscaLuz -= dt;
    if (semFlash()) { const k = Math.max(0, piscaLuz / 1.3); lp.luz.intensity = lp.base * k; lp.bulbo.material.emissiveIntensity = 2 * k; return; } // reduzir flashes: apaga devagar
    const on = Math.random() < .4; lp.luz.intensity = on ? lp.base * Math.random() : 0; lp.bulbo.material.emissiveIntensity = on ? 2 : 0;
  }

  // ---------- orelhão: toca até você atender (ou se afastar), fala, fica pendurado balançando
  const posTel = { x: 8.4, y: 1.6, z: -8.4 };
  const tel = { tocando: 0, toques: 0, t: 0, ocupado: false };
  const fone = new THREE.Group(); fone.position.set(-.12, 1.72, .12); c.orelhao.add(fone);
  box(.06, .24, .07, MAT.metal, 0, -.12, 0, fone); box(.08, .06, .09, MAT.metal, 0, -.24, .01, fone); box(.08, .06, .09, MAT.metal, 0, 0, .01, fone);
  const fio = cyl(.008, .008, .5, MAT.preto, 0, .25, 0, 5, fone); fio.visible = false;
  let foneT = 0;
  const poseFone = () => { if (S.flags.fone) { fone.position.set(-.12, 1.25, .16); fio.visible = true; } };
  poseFone();
  function tocar(n) { tel.tocando = n; tel.toques = 0; tel.t = 0; }
  function falarFone(linhas, aoFim) {
    tel.ocupado = true; SX.respiracao(posTel);
    linhas.forEach((l, i) => agenda(.7 + i * 3.4, () => {
      A.sub(l.quem, l.texto, true);
      if (l.quem === 'inspetor') A.SFX.voz(posTel); else if (l.quem === 'radio') A.SFX.estatica(.8, posTel);
      else SX.voz(posTel, 4 + (l.texto.length / 9 | 0), l.quem === 'ana' ? 380 : l.quem === 'lia' ? 190 : 270);
    }));
    agenda(.9 + linhas.length * 3.4, () => { tel.ocupado = false; aoFim && aoFim(); });
  }
  function atender() {
    const n = tel.tocando; tel.tocando = 0; A.SFX.clique(); S.flags.fone = true; poseFone(); foneT = 0;
    if (n === 1 || !S.flags.lig1) {
      S.flags.lig1 = true;
      let linhas = TXT.orelhao.normal;
      if (zerou()) linhas = TXT.orelhao.zerou;
      else if (S.dif === 'pesadelo') {
        if (S.flags.frase == null) S.flags.frase = Math.random() * TXT.orelhao.pesadelo.length | 0;
        linhas = [TXT.orelhao.normal[0], { quem: 'davi', texto: TXT.orelhao.pesadelo[S.flags.frase] }, ...TXT.orelhao.normal.slice(2)];
      }
      falarFone(linhas);
    } else {
      S.flags.lig2 = true; medo(25);
      falarFone(TXT.orelhao.segunda, () => iniciarPerseguicao());
    }
  }
  function ouvirMudo() {
    S.flags.foneMudo = (S.flags.foneMudo || 0) + 1; A.SFX.estatica(.6, posTel);
    if (S.flags.foneMudo < 9) { A.sub('radio', TXT.orelhao.mudo, true); return; }
    medo(20); for (let i = 0; i < 10; i++) agenda(.5 + i * .6, () => A.SFX.contagem(posTel, i));
    falarFone(TXT.orelhao.nove);
  }
  interact(c.orelhao, () => {
    if (tel.tocando) return '<b>E</b>Atender o orelhão';
    if (tel.ocupado) return 'Tem alguém na linha...';
    if (S.flags.fone && (S.flags.foneMudo || 0) < 9) return '<b>E</b>Ouvir o fone pendurado';
    if (S.flags.fone) return 'O fone está mudo. Balançando.';
    return 'Um orelhão. O fone está gelado.';
  }, () => {
    if (tel.tocando) return atender();
    if (!tel.ocupado && S.flags.fone && (S.flags.foneMudo || 0) < 9) ouvirMudo();
  });
  A.gatilho('orelhao', -7, 7, -14, -2, () => { if (!S.flags.lig1) tocar(1); });
  function tickOrelhao(dt) {
    if (S.flags.fone) { foneT += dt; fone.rotation.z = Math.sin(foneT * 2.3) * Math.max(.07, .45 * Math.exp(-foneT * .25)); }
    if (S.done.chave_portao && !S.flags.ring2 && P.room && P.room.id === 'patioPosto') {
      S.flags.ring2 = true; tocar(2); if (S.flags.fone) agenda(2.2, () => A.falar('fone_mudo'));
    }
    if (!tel.tocando) return;
    tel.t -= dt; if (tel.t > 0) return;
    if (tel.toques >= 7 || dist(posTel) > 32) { tel.tocando = 0; return; }
    SX.toque(posTel); tel.toques++; tel.t = 3;
  }

  // ---------- vulto que espreita pela mata (carro -> posto), sempre na borda da visão
  const v = c.v;
  const novoVulto = () => {
    const g = c.novoVulto(), olho = new THREE.MeshStandardMaterial({ color: 0x100000, emissive: 0x9a1810, emissiveIntensity: 1.1 });
    for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 4), olho); o.position.set(s * .05, 2.9, .12); g.add(o); }
    return g;
  };
  const vc = novoVulto(), cabecaVc = vc.children.find(o => o.geometry && o.geometry.type === 'SphereGeometry');
  const esp = { t: 5, vis: 0, n: 0, dist: 15, passoT: 0 };
  function tickEspreita(dt) {
    const pode = !S.done.posto && esp.n < 4 && S.inv.lanterna && P.pos.z < 12 && P.pos.z > -12 && P.room && P.room.id === 'estrada' && !rev.fase;
    if (!pode) { if (esp.vis) { v.visible = false; esp.vis = 0; } return; }
    if (!esp.vis) {
      esp.t -= dt; if (esp.t > 0) return;
      cam.getWorldDirection(_f); const lado = Math.random() < .5 ? -1 : 1, ang = Math.atan2(_f.x, _f.z) + lado * (.72 + Math.random() * .16);
      let x = P.pos.x + Math.sin(ang) * esp.dist; const z = P.pos.z + Math.cos(ang) * esp.dist;
      if (Math.abs(x) < 8.5) x = (x < 0 ? -1 : 1) * (8.5 + Math.random() * 2);
      if (olhando({ x, z }, .45, 40)) { esp.t = .5; return; }
      v.position.set(x, 0, z); olharPara(v); v.visible = true; esp.vis = 6; esp.passoT = 0; return;
    }
    esp.vis -= dt; esp.passoT -= dt;
    if (esp.passoT <= 0) { esp.passoT = 1.1; A.SFX.passoMonstro({ x: v.position.x, z: v.position.z }, .3); }
    const visto = olhando(v.position, .4, 40);
    if (visto || esp.vis <= 0) {
      v.visible = false; esp.vis = 0; esp.n++; esp.dist = Math.max(8, esp.dist - 2.5); esp.t = 4 + Math.random() * 4;
      if (visto) { A.SFX.estalo({ x: v.position.x, z: v.position.z }, .8); medo(12); vibrar(.25, .1, 90); }
    }
  }
  // ---------- vulto no fim da estrada, revelado só pelo relâmpago (no clarão seguinte, sumiu)
  const rev = { fase: 0, t: 0 };
  function tickRevela(dt) {
    if (S.flags.revelou) return;
    if (!rev.fase) {
      if (!S.inv.lanterna || !P.room || P.room.id !== 'estrada') return;
      if (P.pos.z < -7) { S.flags.revelou = true; return; }
      if (P.pos.z < 2.6) { cam.getWorldDirection(_f); if (_f.z < -.8) { rev.fase = 1; rev.t = 0; vc.position.set(Math.max(-5, Math.min(5, P.pos.x * .4)), 0, P.pos.z - 19); vc.rotation.y = 0; relampago(1.4); } }
      return;
    }
    rev.t += dt;
    if (rev.fase === 1) { vc.visible = raioK > .25; if (rev.t > .9) { vc.visible = false; rev.fase = 2; rev.t = 0; } }
    else if (rev.fase === 2 && rev.t > 1.8) { relampago(1.1); rev.fase = 3; rev.t = 0; }
    else if (rev.fase === 3 && rev.t > .9) { A.falar('vulto_estrada'); medo(18); S.flags.revelou = true; rev.fase = 0; }
  }

  // ---------- perseguição: depois da chave, o vulto sai da frente do carro e vem pela estrada
  // Só anda quando você não está olhando; correr faz ele vir mais rápido; encarar demais faz ele dar um passo.
  // Se alcançar, susto e você volta para a saída do posto (sem morte; no Pesadelo custa vida).
  const CASA = { x: 2.2, z: 6.3 };
  const ch = { fase: 0, t: 0, vistoT: 0, passoT: 0, andou: 0, sussT: 0, avisou: false };
  function iniciarPerseguicao() {
    if (ch.fase || S.done.abrir_portao || !jogando()) return;
    ch.fase = 1; ch.t = 0; S.flags.perseguicao = true; S.flags.piscaParou = true;
    vc.position.set(CASA.x, 0, CASA.z); vc.visible = true; olharPara(vc);
    SX.buzina(carPos(), .5); agenda(.75, () => SX.buzina(carPos(), .9));
    if (semFlash()) c.farolOn(true); else for (let i = 0; i < 6; i++) agenda(i * .22, () => c.farolOn(i % 2 === 0));
    agenda(1.4, () => c.farolOn(true)); agenda(.5, () => relampago(.9)); agenda(1.3, () => A.falar('vulto_carro'));
    medo(40);
  }
  function mover(m) {
    const dx = P.pos.x - vc.position.x, dz = P.pos.z - vc.position.z, L = Math.hypot(dx, dz) || 1, s = Math.min(m, L);
    vc.position.x += dx / L * s; vc.position.z += dz / L * s; ch.andou += s;
  }
  function capturar() {
    ch.fase = 3; ch.t = 0; P.bloqueado = true; S.flags.vultoPegou = (S.flags.vultoPegou || 0) + 1;
    cam.getWorldDirection(_f); _f.y = 0; _f.normalize();
    vc.position.set(P.pos.x + _f.x * .9, -1.15, P.pos.z + _f.z * .9); olharPara(vc); vc.visible = true;
    A.SFX.grito('inspetor'); A.SFX.susto(); P.shake = .35 * Math.max(.3, movK()); S.fear = 100;
    agenda(.7, () => A.fade(true));
    agenda(1.7, () => {
      P.pos.set(5.4, 0, -21); P.yaw = 0; P.pitch = 0; P.bloqueado = false;
      vc.position.set(CASA.x, 0, CASA.z); vc.visible = false; ch.vistoT = 0;
      if (S.dif === 'pesadelo') { S.health = Math.max(5, S.health - 25); S.capDano += 25; }
      S.capVisto++;
      A.fade(false); A.falar('vulto_pegou');
      if (S.flags.vultoPegou === 1 || S.dif === 'facil') agenda(3.5, () => A.toast(TXT.dicaVulto));
      ch.fase = 4; ch.t = 0;
    });
  }
  function tickPerseguicao(dt) {
    if (!ch.fase) {
      if (S.inv.chaves.portao && !S.done.abrir_portao && P.pos.x < 7.2 && P.pos.z < -5 && P.pos.z > GZ + 12) iniciarPerseguicao();
      return;
    }
    if (S.done.abrir_portao) {
      if (ch.fase !== 9) { ch.fase = 9; P.bloqueado = false; relampago(1); agenda(.15, () => { vc.visible = false; }); A.SFX.estatica(.7); }
      return;
    }
    ch.t += dt;
    if (ch.fase === 1) { olharPara(vc); if (ch.t > 3) ch.fase = 2; return; }
    if (ch.fase === 3) return;
    if (ch.fase === 4) { if (ch.t > 2.5) { ch.fase = 2; vc.visible = true; } return; }
    const d = dist(vc.position), visto = olhando(vc.position, .5, 34, 1.9);
    olharPara(vc);
    if (visto) {
      ch.vistoT += dt;
      if (ch.andou > 4 && !ch.avisou) { ch.avisou = true; A.falar('vulto_parou'); }
      if (cabecaVc) cabecaVc.rotation.z = .4 + Math.sin(A.perf() * 1.3) * .25;
      if (ch.vistoT > 4) { ch.vistoT = 1.5; mover(1.4); A.SFX.passoMonstro({ x: vc.position.x, z: vc.position.z }, .8); }
    } else {
      ch.vistoT = 0;
      mover(4 * (A.D().vel || 1) * (P.sprinting ? 1.25 : 1) * (S.flags.fumoDeixado ? .7 : 1) * dt);
      ch.passoT -= dt; if (ch.passoT <= 0) { ch.passoT = .55; A.SFX.passoMonstro({ x: vc.position.x, z: vc.position.z }, .5); }
    }
    S.fear = Math.max(S.fear, Math.max(20, Math.min(95, 75 - d * 2)));
    if (d < 6) { ch.sussT -= dt; if (ch.sussT <= 0) { ch.sussT = 2.5; A.SFX.sussurros(1.2); } }
    if (!S.flags.portaoAtras && Math.hypot(P.pos.x, P.pos.z - GZ) < 4.5) { S.flags.portaoAtras = true; A.falar('portao_atras'); }
    if (d < 1.5) capturar();
  }

  // ---------- janela acesa do internato: alguém olhando quando você chega no portão
  const jan = c.janela, silh = box(.42, 1.05, .02, new THREE.MeshBasicMaterial({ color: 0x000000 }), jan.position.x, jan.position.y - .22, jan.position.z + .07, grupo, false);
  silh.visible = false;
  function tickJanela() {
    if (S.flags.janelaVista || !S.inv.chaves.portao || P.pos.z > GZ + 9) return;
    if (!olhando({ x: jan.position.x, z: jan.position.z }, .4, 60, jan.position.y)) return;
    S.flags.janelaVista = true; silh.visible = true; A.falar('janela');
    agenda(2.6, () => { silh.visible = false; S.flags.janelaApagou = true; });
  }
  // ---------- galhos estalando no mato enquanto você anda na estrada
  let galhoT = 6;
  function tickGalhos(dt) {
    if (!P.room || !P.room.fora || ch.fase) return;
    galhoT -= dt; if (galhoT > 0) return;
    galhoT = 7 + Math.random() * 8; const lado = Math.random() < .5 ? -1 : 1;
    A.SFX.estalo({ x: lado * (9 + Math.random() * 4), z: P.pos.z + (Math.random() - .5) * 14 }, .45);
  }

  A.W.tick.push(dt => {
    tickRaio(dt); tickPisca(); tickMariposas(dt);
    if (!jogando()) return;
    tickFila(dt); radioCd -= dt;
    if (tampaK < 1 && S.inv.lanterna) { tampaK = Math.min(1, tampaK + dt * 2.2); poseTampa(); }
    if (!S.flags.viuPegadas && S.flags.saiuCarro && Math.hypot(P.pos.x - 5.3, P.pos.z - 13) < 2.6) { S.flags.viuPegadas = true; A.falar('pegadas'); }
    tickZumbido(); tickLuzPosto(dt); tickFliperama(dt); tickJoaquim(); tickOrelhao(dt);
    tickEspreita(dt); tickRevela(dt); tickPerseguicao(dt); tickJanela(); tickGalhos(dt);
  });

  // ---------- cena de abertura (o carro chegando)
  let st = {};
  const cena = {
    iniciar() {
      st = { shake: 0 }; carro.position.z = 72; c.farolOn(true); vidroTras.visible = false; piscaCena = false;
      estacao = -1; trocas = 0; radioCd = 0;
    },
    update(t, dt) {
      const TF = 16.5, V = 3.62;
      let z;
      if (t < TF) z = 72 - V * t;
      else { const k = Math.min(1, (t - TF) / 2), z0 = 72 - V * TF; z = z0 - (z0 - 9.6) * (1 - Math.pow(1 - k, 3)); }
      carro.position.z = z;
      // o vulto atravessa na frente dos faróis, no mesmo instante do relâmpago
      if (t > 14.6 && t < 17.2) { v.visible = true; v.position.set(-7 + (t - 14.6) * 5.6, 0, z - 12); v.rotation.y = Math.PI / 2; } else if (t >= 17.2) v.visible = false;
      if (t > 15 && !st.raio1) { st.raio1 = true; relampago(1.3); }
      if (t > TF && !st.freou) { st.freou = true; A.SFX.freada(); }
      if (t > 18.6 && !st.morreu) { st.morreu = true; A.SFX.motor(false); }
      if (t > 18.6 && t < 19.6) c.farolOn(semFlash() ? t < 19.1 : Math.random() < .5);
      else if (t >= 19.6 && !st.apagou) { st.apagou = true; c.farolOn(false); S.flags.faroisMortos = true; piscaCena = true; }
      if (t > 19.8 && !st.chiado) { st.chiado = true; A.SFX.estatica(1.6, posRadio()); }
      if (t > 24 && !st.pancada) { st.pancada = true; A.SFX.pancada(carro.position.x, carro.position.z); st.shake = .3; }
      if (t > 25.4 && !st.raspou) { st.raspou = true; SX.raspar({ x: carro.position.x, y: 1.25, z: carro.position.z + 1.4 }); S.flags.maos = true; vidroTras.visible = true; }
      tickRaio(dt); tickPisca(); tickFila(dt); radioCd -= dt;
      st.shake = Math.max(0, st.shake - dt * .35);
      const tremor = ((t > TF && t < TF + 2 ? .03 : .004) + st.shake * .05) * movK();
      cam.position.set(carro.position.x - .38 + A.rand(-tremor, tremor), 1.15 + Math.sin(t * 9) * .006, carro.position.z - .05);
      let yaw = Math.sin(t * .4) * .03 + (t > TF + 2 ? Math.sin((t - TF - 2) * .7) * .2 : 0), pitch = -.03, roll = 0;
      if (t > 24) { const k = Math.min(1, (t - 24) / .5); pitch = -.03 + .35 * k * (t < 25.4 ? 1 : Math.max(0, 1 - (t - 25.4) / .8)); roll = Math.sin(t * 23) * st.shake * .25 * movK(); }
      if (t > 25.4) { const k = Math.min(1, (t - 25.4) / 1.6), e = k * k * (3 - 2 * k); yaw = lerp(yaw, Math.PI * .92, e); }
      cam.rotation.set(pitch, yaw, roll);
    },
    tecla(code) { if (/^Arrow/.test(code)) sintonizar(); },
    fim() {
      carro.position.z = 9.6; v.visible = false; c.farolOn(false); fila.length = 0;
      S.flags.faroisMortos = true; S.flags.maos = true; S.flags.saiuCarro = true; vidroTras.visible = true; piscaCena = true;
      P.pos.set(SPAWN.x, 0, SPAWN.z); P.yaw = SPAWN.yaw; P.pitch = -.32; A.objDone('sair_carro');
    }
  };
  const api = { cena, sumir, iniciarPerseguicao, radioExtra: null,
    util: { SX, agenda, olhando, medo, relampago, raio: () => Math.max(raioK, raioExt), posRadio,
      radioSozinho() { const p = posRadio(); A.SFX.estatica(2, p); painel.material.emissiveIntensity = 1.4; agenda(2, () => { painel.material.emissiveIntensity = .45; }); } } };
  return api;
}
