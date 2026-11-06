// A HORA DO SILÊNCIO — Lote 7 (Jogabilidade), parte 2: ATMOSFERA QUE VIRA REGRA.
// Chuva em ondas, goteiras, rezas, palmas, pedrinhas, sapatos molhados, a casa que pressiona.
// Criado por jogabilidade-som.js (JGS); nunca é ligado direto ao motor. Tudo à prova de erro:
// qualquer falha de áudio é engolida e o jogo segue. Teclas novas (todas livres no motor):
//   vírgula (,)  segurar = fechar os olhos para ouvir; toque rápido = bater palma (eco da sala)
//   ponto (.)    segurar = tapar os ouvidos
//   M            segurar = a Lia reza baixinho (acalma o medo, mas ela murmura)
//   G sem garrafa = joga uma pedrinha (2 por capítulo)
// Opção própria: s7ouvido (mutador Ouvido Ruim).

export function criarAtmosfera(ctx) {
  const { THREE, P, keys, OPT, emitNoise, marcarCausa, toast, subPequeno, audio, collide, setDoor, chuvaMat, scene, roomAt } = ctx;
  const g = ctx;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const dist = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
  const pos3 = (x, z, y = 1.4) => ({ x, y, z });
  const hash = s => { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

  if (OPT.s7ouvido === undefined) OPT.s7ouvido = false;

  const a = {
    T: 0,
    // chuva em ondas
    chFase: 'garoa', chT: rnd(30, 50), chAviso: false,
    // tapar os ouvidos
    tapa: false, tapaK: 0, tapaFim: 0, prevFear: 0,
    // lanterna
    escuroT: 0, humO: null, humG: null, humT: 0, humAviso: false, escutaAviso: false,
    // sapatos molhados
    molhadoT: 0, chuvaExpT: 0, molhAviso: false, faseAnt: undefined, pegadas: [], pegI: 0,
    // goteira
    salaRef: null, pingoClock: 0, pingoPer: 3, pingoAte: -1, tique: 0, tiqueAviso: false,
    // reza e soluço
    rezaT: 0, rezaSilaba: 0, rezaDeb: -99, rezaIT: 0, rezaIAviso: false, solucoT: rnd(20, 40), solucoAviso: false,
    // palma
    cmDown: -1, cmPrev: false, palmaCd: 0,
    // tosse
    poeira: 0, tosseCd: 0, tosseAviso: false,
    // porta que bate
    portaT: rnd(50, 90), portaFase: 0, portaAlvo: null, portaAviso: false,
    // mochila / pano
    raspaCd: 0, raspaAviso: false, yawAnt: 0, farfT: 0, farfCd: 0, _v: null,
    // granizo
    granizo: false, granizoFeito: false, granizoT: 0,
    // refúgio, pressão da casa
    refAviso: {}, pressao: 0, quietoX: 0, quietoZ: 0, quietoT: 0, pressaoAviso: false, subO: null, subG: null,
    // tensão musical
    tensO: null, tensG: null, tensK: 0,
    // ouvido ruim
    ouvidoT: 0, hpAnt: -1, zumO: null, zumG: null, ouvidoAviso: false,
    // pedras
    capRef: -1,
    // marcadores de escuta
    aneis: [], anelI: 0
  };

  const AC = () => g.AC;
  const jogando = () => g.mode === 'jogo' && !g.ui && g.S && !g.S.dead && !g.S.fim;

  // ------------------------------------------------------------------ sons procedurais
  // limite em tempo real: se o jogo roda acelerado (QA, aba em segundo plano) os sons não se acumulam em centenas de nós de áudio
  const _gate = {};
  function pode(k, ms) { const n = performance.now(); if (n - (_gate[k] || 0) < ms) return false; _gate[k] = n; return true; }
  function saida(p, wet, bus) { try { if (p && !(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z))) return null; return audio.saida(p, wet, bus); } catch (e) { return null; } }
  function pingo(x, z) { if (!pode('pingo', 350)) return;
    const c = AC(); if (!c) return;
    try {
      const t = c.currentTime, gg = saida(pos3(x, z, 2.6), .6, 'amb'); if (!gg) return;
      const o = audio.osc('sine', 1700, t, .12, gg); o.frequency.exponentialRampToValueAtTime(620, t + .09);
      audio.env(gg, t, .002, .09, .1);
    } catch (e) {}
  }
  function tiqueSom() { if (!pode('tique', 300)) return;
    const c = AC(); if (!c) return;
    try { const t = c.currentTime, gg = saida(null, .1, 'corpo'); if (!gg) return; audio.osc('triangle', 2100, t, .05, gg); audio.env(gg, t, .002, .035, .05); } catch (e) {}
  }
  function chap() { if (!pode('chap', 90)) return;
    const c = AC(); if (!c) return;
    try { const t = c.currentTime, gg = saida(pos3(P.pos.x, P.pos.z, .1), .2, 'corpo'); if (!gg) return; audio.burst(t, .09, 'bandpass', 820, 1.6, gg); audio.env(gg, t, .004, .11, .09); } catch (e) {}
  }
  function vento(dur, pico, f0, f1) {
    const c = AC(); if (!c || !pode('vento', 800)) return;
    try {
      const t = c.currentTime, gg = saida(null, .3, 'amb'); if (!gg) return;
      const f = audio.burst(t, dur + .3, 'bandpass', f0, .7, gg);
      f.frequency.setValueAtTime(f0, t); f.frequency.linearRampToValueAtTime(f1, t + dur);
      audio.env(gg, t, dur * .85, pico, dur * .3);
    } catch (e) {}
  }
  const VOGAIS = [[730, 1090], [270, 2290], [300, 870], [530, 1840], [570, 840]];
  function silaba(vol) { if (!pode('silaba', 200)) return; // sílaba sussurrada: dente-de-serra por dois formantes, sem texto
    const c = AC(); if (!c) return;
    try {
      const t = c.currentTime, gg = saida(null, .25, 'corpo'); if (!gg) return;
      const v = VOGAIS[(Math.random() * VOGAIS.length) | 0], base = 125 + Math.random() * 40;
      const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = base; o.frequency.linearRampToValueAtTime(base * .93, t + .3);
      for (const f of v) { const b = c.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = 9; const gf = c.createGain(); gf.gain.value = f === v[0] ? 1 : .5; o.connect(b); b.connect(gf); gf.connect(gg); }
      o.start(t); o.stop(t + .34); o.onended = () => { try { o.disconnect(); } catch (e) {} };
      audio.env(gg, t, .05, vol, .26);
    } catch (e) {}
  }
  function soluco() { if (!pode('soluco', 1500)) return;
    const c = AC(); if (!c) return;
    try {
      const t = c.currentTime, gg = saida(null, .15, 'corpo'); if (!gg) return;
      audio.burst(t, .18, 'bandpass', 600, 2.5, gg); const o = audio.osc('sine', 260, t, .16, gg); o.frequency.exponentialRampToValueAtTime(180, t + .14);
      audio.env(gg, t, .01, .25, .16);
    } catch (e) {}
  }
  function tosse() { if (!pode('tosse', 800)) return;
    const c = AC(); if (!c) return;
    try {
      const t = c.currentTime;
      for (let i = 0; i < 3; i++) { const gg = saida(pos3(P.pos.x, P.pos.z, 1.5), .5, 'corpo'); if (!gg) return; audio.burst(t + i * .13, .1, 'bandpass', 900 - i * 80, 1.3, gg); audio.env(gg, t + i * .13, .005, .35, .1); }
    } catch (e) {}
  }
  function palmaSom() { if (!pode('palma', 300)) return;
    const c = AC(); if (!c) return;
    try { const t = c.currentTime, gg = saida(null, .5, 'corpo'); if (!gg) return; audio.burst(t, .07, 'highpass', 1900, .8, gg); audio.env(gg, t, .001, .7, .06); } catch (e) {}
  }
  function eco(x, z, atraso, vol) {
    const c = AC(); if (!c) return;
    try { const t = c.currentTime + atraso, gg = saida(pos3(x, z, 1.4), .6, 'sfx'); if (!gg) return; const f = audio.burst(t, .09, 'bandpass', 1500 - atraso * 500, 1, gg); audio.env(gg, t, .002, vol, .12); } catch (e) {}
  }
  function raspa() { if (!pode('raspa', 300)) return;
    const c = AC(); if (!c) return;
    try { const t = c.currentTime, gg = saida(pos3(P.pos.x, P.pos.z, 1.1), .2, 'corpo'); if (!gg) return; audio.burst(t, .24, 'highpass', 3200, .9, gg); audio.env(gg, t, .02, .22, .2); } catch (e) {}
  }
  function pano() { if (!pode('pano', 250)) return;
    const c = AC(); if (!c) return;
    try { const t = c.currentTime, gg = saida(null, .1, 'corpo'); if (!gg) return; audio.burst(t, .13, 'highpass', 2400, .7, gg); audio.env(gg, t, .02, .08, .1); } catch (e) {}
  }
  function batida(x, z) { if (!pode('batida', 500)) return;
    const c = AC(); if (!c) return;
    try {
      const t = c.currentTime, gg = saida(pos3(x, z, 1.3), .5, 'sfx'); if (!gg) return;
      audio.burst(t, .3, 'lowpass', 260, 1, gg); const o = audio.osc('sine', 75, t, .3, gg); o.frequency.exponentialRampToValueAtTime(40, t + .25);
      audio.env(gg, t, .004, .9, .3);
    } catch (e) {}
  }
  function hailTick() { if (!pode('hail', 45)) return;
    const c = AC(); if (!c) return;
    try { const t = c.currentTime, gg = saida(pos3(P.pos.x + rnd(-3, 3), P.pos.z + rnd(-3, 3), 3.2), .2, 'amb'); if (!gg) return; audio.burst(t, .035, 'bandpass', rnd(2800, 6500), 3, gg); audio.env(gg, t, .001, rnd(.05, .14), .03); } catch (e) {}
  }
  function osciladorFixo(tipo, f, nivelInicial) { // oscilador contínuo ligado ao bus escolhido, nível controlado por setTargetAtTime
    const c = AC(); if (!c) return null;
    try {
      const o = c.createOscillator(), gg = c.createGain(); o.type = tipo; o.frequency.value = f; gg.gain.value = nivelInicial;
      o.connect(gg); gg.connect(g.master || c.destination); o.start(); return { o, g: gg };
    } catch (e) { return null; }
  }
  function nivel(no, v, tc = .15) { // só reprograma o ganho quando o alvo muda de verdade (centenas de eventos por segundo entopem o áudio)
    if (!no) return; v = Math.max(.00001, v); const n = performance.now();
    if (no.ult !== undefined && Math.abs(v - no.ult) < no.ult * .08 && n - no.ultT < 400) return;
    no.ult = v; no.ultT = n;
    try { no.g.gain.setTargetAtTime(v, AC().currentTime, tc); } catch (e) {} }
  function pararOsc(no) { if (!no) return; try { no.g.gain.setTargetAtTime(.00001, AC().currentTime, .08); const o = no.o; setTimeout(() => { try { o.stop(); o.disconnect(); } catch (e) {} }, 300); } catch (e) {} }

  // ------------------------------------------------------------------ marcadores no chão
  function anel(x, z, cor = 0xdfe6ff, dur = 2.4) {
    try {
      const ix = a.anelI++ % 6; let m = a.aneis[ix];
      if (!m) { m = { mesh: new THREE.Mesh(new THREE.RingGeometry(.35, .5, 28), new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: 0, depthTest: false, depthWrite: false, side: THREE.DoubleSide })), t: 0, dur: 1 }; m.mesh.rotation.x = -Math.PI / 2; m.mesh.renderOrder = 998; scene.add(m.mesh); a.aneis[ix] = m; }
      m.mesh.position.set(x, .08, z); m.t = dur; m.dur = dur; m.mesh.material.color.setHex(cor); m.mesh.visible = true;
    } catch (e) {}
  }
  function atualizarAneis(dt) {
    for (const m of a.aneis) {
      if (!m || !m.mesh) continue;
      if (m.t > 0) { m.t -= dt; const k = clamp(m.t / m.dur, 0, 1); m.mesh.material.opacity = k * .7; m.mesh.scale.setScalar(1 + (1 - k) * 1.6); if (m.t <= 0) m.mesh.visible = false; }
    }
  }
  function pegada(x, z, yaw) {
    try {
      const ix = a.pegI++ % 14; let p = a.pegadas[ix];
      if (!p) { p = { mesh: new THREE.Mesh(new THREE.CircleGeometry(.12, 10), new THREE.MeshBasicMaterial({ color: 0x0a1018, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })), t: 0 }; p.mesh.rotation.x = -Math.PI / 2; p.mesh.scale.set(.8, 1.5, 1); scene.add(p.mesh); a.pegadas[ix] = p; }
      p.mesh.position.set(x, .045, z); p.mesh.rotation.z = yaw; p.t = 14; p.mesh.visible = true;
    } catch (e) {}
  }
  function atualizarPegadas(dt) {
    for (const p of a.pegadas) if (p && p.t > 0) { p.t -= dt; p.mesh.material.opacity = clamp(p.t / 14, 0, 1) * .5; if (p.t <= 0) p.mesh.visible = false; }
  }

  // ------------------------------------------------------------------ teclas
  function tecla(e) {
    const S = g.S; if (!S) return false;
    if (e.code === 'KeyF' && S.inv && S.inv.lanterna && S.battery > 0 && !(P.pilhaT > 0) && P.noiseR === 0 && !P.crouch) {
      // o clique do interruptor, parado e em pé, é ouvido a uns 4 m (agachada ou andando devagar o motor trata de ser macio)
      emitNoise(P.pos.x, P.pos.z, 3.6, true);
    }
    return false;
  }

  // ------------------------------------------------------------------ ciclo da chuva
  function ciclo(dt, fora) {
    a.chT -= dt;
    if (a.chFase === 'garoa') {
      if (a.chT <= 3.1 && !a.chAviso) { a.chAviso = true; if (fora) vento(3.2, .2, 260, 1000); }
      if (a.chT <= 0) { a.chFase = 'rajada'; a.chT = rnd(5.5, 6.5); a.chAviso = false; if (fora && !g.S.flags.s7rajada) { g.S.flags.s7rajada = true; subPequeno('lia', 'O vento sobe... quando a rajada vier, a chuva cobre tudo.'); } }
    } else if (a.chFase === 'rajada') {
      if (a.chT <= 0) { a.chFase = 'recuo'; a.chT = rnd(4, 5.5); if (fora) vento(1.2, .08, 1200, 2400); }
    } else if (a.chT <= 0) { a.chFase = 'garoa'; a.chT = rnd(40, 70); a.chAviso = false; }
    if (a.chFase === 'rajada' && fora) { try { chuvaMat.opacity = Math.min(.95, chuvaMat.opacity * 1.6 + .08); } catch (e) {} }
  }

  // ------------------------------------------------------------------ update
  function update(dt, c) {
    const S = g.S, M = g.M, AUD = g.AUD, AMB = g.AMB, W = g.W, ANA = g.ANA, PROC = g.PROC, ac = AC();
    if (!S) return;
    a.T += dt;
    const { perto, dM, parada, fora, prende, olhos } = c;
    const ok = jogando();
    atualizarAneis(dt); atualizarPegadas(dt);
    if (!ok) { pararTudoSeParado(); return; }
    const andando = !parada;
    const passoDado = a.faseAnt !== undefined && P.faseAnt !== a.faseAnt && !!P.noiseR; a.faseAnt = P.faseAnt;

    // ---- pedrinhas: duas por capítulo (guardadas nas flags para sobreviver ao checkpoint)
    if (S.flags.s7pedCap !== S.chapter) { S.flags.s7pedCap = S.chapter; S.flags.s7ped = 2; if (!S.flags.s7pedDica && S.chapter >= 1) { S.flags.s7pedDica = true; subPequeno('lia', 'Dois seixos no bolso. Sem garrafa, G joga um.'); } }

    // ---- chuva em ondas
    ciclo(dt, fora);
    if (prende && fora && (a.chFase === 'rajada' || (AUD && ac && ac.currentTime < AUD.trovaoAte))) S.ar = Math.min(100, (S.ar || 0) + 7 * dt); // a chuva cobre o corpo: prender o ar custa metade

    // ---- tapar os ouvidos (.)
    const quer = !!keys.Period && !olhos;
    if (quer && !a.tapa) { a.tapa = true; if (!S.flags.s7tapa) { S.flags.s7tapa = true; subPequeno('lia', 'Mãos nos ouvidos. Não escuto nada... nem ele.'); } }
    else if (!quer && a.tapa) { a.tapa = false; a.tapaFim = a.T; if (M && M.ativo && dM < 5) emitNoise(P.pos.x, P.pos.z, 1.2, true); pano(); }
    a.tapaK = clamp(a.tapaK + (a.tapa ? dt * 7 : -dt * 4), 0, 1);
    const gritando = !!((PROC && PROC.fase) || (ANA && ANA.ativa));
    if (a.tapa && S.fear > a.prevFear && gritando) S.fear = a.prevFear + (S.fear - a.prevFear) * .2; // o coro e o grito perdem o gume
    a.prevFear = S.fear;
    if (a.tapa && AUD && ac && ac.currentTime < AUD.zumbidoFim - 1) { try { AUD.zumbidoFim = ac.currentTime + 1; AUD.zumbidoAte = Math.min(AUD.zumbidoAte, ac.currentTime + .5); } catch (e) {} } // tapar encurta o zumbido do estouro

    // ---- lanterna: bateria que zumbe, escuro que afia o ouvido
    const luz = !!S.flashOn;
    if (!luz && S.inv && S.inv.lanterna && !S.hidden) a.escutaT = clamp((a.escutaT || 0) + dt, 0, 8); else a.escutaT = clamp((a.escutaT || 0) - dt * 8, 0, 8);
    if (a.escutaT > 4 && !a.escutaAviso && !S.flags.s7escuro) { a.escutaAviso = true; S.flags.s7escuro = true; subPequeno('lia', 'No escuro eu escuto melhor.'); }
    if (luz && S.battery > 0 && S.battery < 20) {
      if (!a.humO) a.humO = osciladorFixo('triangle', 118, .00001);
      nivel(a.humO, .0035 * (1 - S.battery / 20) + .0012);
      a.humT -= dt;
      if (a.humT <= 0) { a.humT = 2; if (M && M.ativo && dM < 5.5) emitNoise(P.pos.x, P.pos.z, 2.4, true); }
      if (!a.humAviso) { a.humAviso = true; subPequeno('lia', 'A pilha está zumbindo. Ele pode ouvir.'); }
    } else if (a.humO) { pararOsc(a.humO); a.humO = null; }

    // ---- sapatos encharcados
    const naChuva = fora && (window.__chuvaForte || a.chFase === 'rajada');
    if (P.naAgua && andando) a.molhadoT = 40;
    if (naChuva && andando) { a.chuvaExpT += dt; if (a.chuvaExpT > 6) a.molhadoT = Math.max(a.molhadoT, 40); } else a.chuvaExpT = Math.max(0, a.chuvaExpT - dt);
    if (a.molhadoT > 0) {
      const seca = (parada && !fora && !P.naAgua) || (P.crouch && parada);
      a.molhadoT -= dt * (seca ? 2 : 1);
      if (passoDado) {
        if (!fora || P.naAgua) { chap(); const yaw = P.yaw || 0; pegada(P.pos.x, P.pos.z, yaw); }
        if (!a.molhAviso && !P.naAgua) { a.molhAviso = true; toast('Os sapatos encharcados chapam. Pare num piso seco para secar mais rápido.'); }
      }
    }

    // ---- goteira: pingos com ritmo fixo por sala, passos no pingo ficam quase mudos
    const sala = P.room;
    if (sala !== a.salaRef) { a.salaRef = sala; const h = sala && !sala.fora ? hash(sala.id || sala.nome) : 1; a.goteira = !!sala && !sala.fora && h % 3 === 0; a.pingoPer = 2.2 + (h % 7) * .25; a.pingoClock = (h % 5) * .4; a.tique = 0; }
    a.pingoAte -= dt;
    if (a.goteira) {
      a.pingoClock += dt;
      if (a.pingoClock >= a.pingoPer) { a.pingoClock = 0; a.pingoAte = .18; pingo((sala.x0 + sala.x1) / 2 + rnd(-1, 1), (sala.z0 + sala.z1) / 2 + rnd(-1, 1)); }
      if (passoDado) {
        if (a.pingoAte > -.12) { a.tique++; if (a.tique >= 3) { a.tique = 0; tiqueSom(); if (!a.tiqueAviso) { a.tiqueAviso = true; subPequeno('lia', 'Pisei junto do pingo. Ninguém ouviu.'); } } } else a.tique = 0;
      }
    }

    // ---- reza (M) e murmúrio do pavor
    const rezando = !!keys.KeyM && !P.sprinting && !olhos && !a.tapa;
    if (rezando) {
      a.rezaT += dt; a.rezaSilaba -= dt;
      S.fear = Math.max(0, S.fear - (S.fear > 70 ? 3 : 2) * dt);
      if (a.rezaSilaba <= 0) { a.rezaSilaba = rnd(.3, .45); silaba(.2); if (M && M.ativo && dM < 7) emitNoise(P.pos.x, P.pos.z, S.hidden ? 1.6 : 3, true); }
      if (a.T - a.rezaDeb > 25) { a.rezaDeb = a.T; subPequeno('lia', '[ela reza baixinho]'); }
    } else a.rezaT = 0;
    if (S.hidden && S.fear > 88 && !prende && !rezando) {
      a.rezaIT += dt;
      if (a.rezaIT > 5 && a.rezaIT % 1.5 < dt) {
        silaba(.16); if (M && M.ativo && dM < 9) { emitNoise(P.pos.x, P.pos.z, 2.5, true); marcarCausa('murmurou'); }
        if (!a.rezaIAviso) { a.rezaIAviso = true; subPequeno('lia', 'Estou rezando sem querer. Preciso prender o ar!'); }
      }
    } else a.rezaIT = 0;
    // soluço de pânico
    if (S.fear > 90 && (S.stamina < 40 || (S.ar || 100) < 50) && !prende && M && M.ativo) {
      a.solucoT -= dt;
      if (a.solucoT <= 0) { a.solucoT = rnd(20, 40); soluco(); emitNoise(P.pos.x, P.pos.z, 4, true); marcarCausa('soluçou'); if (!a.solucoAviso) { a.solucoAviso = true; subPequeno('lia', 'Um soluço... prender o ar segura.'); } }
    }

    // ---- palma (toque na vírgula) e fechar os olhos (segurar) vivem aqui para dividir a mesma tecla
    const cm = !!keys.Comma;
    if (cm && !a.cmPrev) a.cmDown = a.T;
    if (!cm && a.cmPrev && a.cmDown >= 0 && a.T - a.cmDown < .22 && a.T > a.palmaCd && !S.hidden && !prende) palma();
    a.cmPrev = cm;

    // ---- tosse da poeira dos túneis
    if (W.mapa === 'tuneis' && P.sprinting && !prende) {
      a.poeira += dt;
      if (a.poeira > 2.6 && a.T > a.tosseCd) {
        a.poeira = 0; a.tosseCd = a.T + 7; tosse(); emitNoise(P.pos.x, P.pos.z, 9, true); marcarCausa('tosse'); P.shake = Math.max(P.shake || 0, .06);
        if (!a.tosseAviso) { a.tosseAviso = true; toast('A poeira fez você tossir. Nos túneis, agache ou ande devagar.'); }
      }
    } else a.poeira = Math.max(0, a.poeira - dt * 1.5);

    // ---- mochila raspando e roupa farfalhando
    a.raspaCd -= dt;
    if (P.sprinting && !prende && M && M.ativo && dM < 22 && a.raspaCd <= 0) {
      if (!a._v) a._v = new THREE.Vector3();
      a._v.copy(P.pos); try { collide(a._v, .62); } catch (e) {}
      if (Math.hypot(a._v.x - P.pos.x, a._v.z - P.pos.z) > .12) {
        a.raspaCd = 1.2; raspa(); emitNoise(P.pos.x, P.pos.z, 4, true); marcarCausa('raspou');
        if (!a.raspaAviso) { a.raspaAviso = true; toast('A mochila raspou na parede. Corra pelo meio do corredor.'); }
      }
    }
    const dyaw = Math.abs(Math.atan2(Math.sin(P.yaw - a.yawAnt), Math.cos(P.yaw - a.yawAnt))) / Math.max(dt, 1e-3); a.yawAnt = P.yaw;
    a.farfCd -= dt;
    if (dyaw > 6 && M && M.ativo && dM < 9 && !P.devagar && !S.hidden) {
      a.farfT += dt;
      if (a.farfT > .2 && a.farfCd <= 0) { a.farfCd = 1.4; a.farfT = 0; pano(); emitNoise(P.pos.x, P.pos.z, 2, true); }
    } else a.farfT = Math.max(0, a.farfT - dt);

    // ---- corrente de ar fecha uma porta que você deixou aberta
    if (a.portaFase === 0) {
      a.portaT -= dt;
      if (a.portaT <= 0) {
        a.portaT = rnd(50, 90);
        const busy = (M && M.ativo && ['caca', 'bote', 'agarra'].includes(M.state)) || (PROC && PROC.fase) || S.chapter < 1 || S.hidden;
        let alvo = null, melhor = 1e9;
        if (!busy && W && W.doors) for (const d of W.doors) {
          if (!d.open || d.arrombada || d.aoAbrir || d.trava || (d.fresta || 0) > 0) continue;
          const dd = dist(d.x, d.z, P.pos.x, P.pos.z); if (dd < 5 || dd > 24) continue;
          if (dd < melhor) { melhor = dd; alvo = d; }
        }
        if (alvo) { a.portaAlvo = alvo; a.portaFase = 1; a.portaT2 = 1.4; vento(1.3, .16, 300, 700); }
      }
    } else {
      a.portaT2 -= dt;
      if (a.portaT2 <= 0) {
        const d = a.portaAlvo; a.portaFase = 0; a.portaAlvo = null;
        if (d && d.open && !(d.fresta > 0)) { try { setDoor(d, false, true); } catch (e) {} batida(d.x, d.z); emitNoise(d.x, d.z, 10, false); if (!a.portaAviso) { a.portaAviso = true; subPequeno('lia', 'A corrente bateu uma porta! Ele ouviu.'); } }
      }
    }

    // ---- granizo no telhado do capítulo III (sorteado pela semente)
    if (S.chapter === 3 && hash(S.semente || 'x') % 2 === 0 && !a.granizoFeito) {
      if (!a.granizo && S.capT > 70 && S.capT < 110) { a.granizo = true; a.granizoT = 0; subPequeno('lia', 'Granizo no telhado! Ninguém ouve ninguém.'); }
      if (a.granizo && S.capT >= 110) { a.granizo = false; a.granizoFeito = true; subPequeno('lia', 'O granizo parou.'); }
    } else if (a.granizo) a.granizo = false;
    if (a.granizo) { a.granizoT -= dt; if (a.granizoT <= 0) { a.granizoT = rnd(.05, .1); hailTick(); } }
    if (S.chapter !== a.capRef) { a.capRef = S.chapter; a.granizoFeito = false; a.granizo = false; }

    // ---- refúgios acústicos (livros e tecido)
    const rid = sala && sala.id;
    if (REFUGIO[rid] && !a.refAviso[rid]) { a.refAviso[rid] = true; subPequeno('lia', 'Tudo aqui é tecido e papel. O som morre. Eu também não ouço nada de fora.'); }

    // ---- a casa pressiona quem demora
    if (dist(P.pos.x, P.pos.z, a.quietoX, a.quietoZ) > 6 || S.hidden) { a.quietoX = P.pos.x; a.quietoZ = P.pos.z; a.quietoT = 0; a.pressao = Math.max(0, a.pressao - dt * .3); }
    else { a.quietoT += dt; if (a.quietoT > 40) a.pressao = clamp(a.pressao + dt / 40, 0, 1); }
    if (a.pressao > .15) {
      if (!a.subO) a.subO = osciladorFixo('sine', 44, .00001);
      nivel(a.subO, a.pressao * .03, .5);
      if (!a.pressaoAviso && a.pressao > .4) { a.pressaoAviso = true; subPequeno('lia', 'A casa pesa em cima de mim. Preciso seguir.'); }
    } else if (a.subO) { pararOsc(a.subO); a.subO = null; }

    // ---- música procedural de tensão: três notas em atrito que sobem com a distância dele
    const tens = M && M.ativo && dM < 16 ? clamp(1 - dM / 16, 0, 1) * (['caca', 'bote', 'alerta'].includes(M.state) ? 1 : .45) : 0;
    a.tensK += (tens - a.tensK) * Math.min(1, dt * 1.5);
    if (a.tensK > .03) {
      if (!a.tensO) { a.tensO = osciladorFixo('sine', 110, .00001); a.tensO2 = osciladorFixo('sine', 116.5, .00001); a.tensO3 = osciladorFixo('triangle', 155.6, .00001); }
      const abafa = S.hidden || olhos > .3 ? .35 : 1, pulso = .5 + .5 * Math.sin(a.T * (1.4 + a.tensK * 5));
      const v = a.tensK * .012 * abafa;
      nivel(a.tensO, v, .3); nivel(a.tensO2, v * (.6 + .4 * pulso), .1); nivel(a.tensO3, v * .5 * a.tensK, .3);
    } else if (a.tensO) { pararOsc(a.tensO); pararOsc(a.tensO2); pararOsc(a.tensO3); a.tensO = a.tensO2 = a.tensO3 = null; }

    // ---- ouvido ruim (mutador opcional): depois de levar dano
    if (a.hpAnt < 0) a.hpAnt = S.health;
    if (OPT.s7ouvido && S.health < a.hpAnt - 1) { a.ouvidoT = 60; if (!a.ouvidoAviso) { a.ouvidoAviso = true; subPequeno('lia', 'Um zumbido no ouvido... só escuto abafado.'); } }
    a.hpAnt = S.health;
    if (a.ouvidoT > 0 && OPT.s7ouvido) {
      a.ouvidoT -= dt;
      if (!a.zumO) a.zumO = osciladorFixo('sine', 4300, .00001);
      nivel(a.zumO, .004 * clamp(a.ouvidoT / 60, 0, 1), .3);
    } else if (a.zumO) { pararOsc(a.zumO); a.zumO = null; a.ouvidoT = 0; }

    // ---- mapa auditivo: olhos fechados marcam a ameaça por poucos segundos
    if (olhos > .85 && M && M.ativo && dM < 24 && a.T - (a.anelUlt || -9) > 1.1) { a.anelUlt = a.T; anel(M.pos.x, M.pos.z, 0xdfe6ff, 1.8); }
  }

  function pararTudoSeParado() {
    for (const k of ['humO', 'tensO', 'tensO2', 'tensO3', 'subO', 'zumO']) if (a[k]) { pararOsc(a[k]); a[k] = null; }
  }

  // palma: bate, o som volta das paredes e a Lia lê o tamanho do cômodo pelo eco
  function palma() {
    const S = g.S, r = P.room; a.palmaCd = a.T + 5;
    palmaSom(); emitNoise(P.pos.x, P.pos.z, 14, true); marcarCausa('palma');
    if (!r || r.fora) { toast('A palma se perde. Nenhum eco volta: espaço aberto.'); return; }
    const L = [{ d: P.pos.x - r.x0, x: r.x0, z: P.pos.z }, { d: r.x1 - P.pos.x, x: r.x1, z: P.pos.z }, { d: P.pos.z - r.z0, x: P.pos.x, z: r.z0 }, { d: r.z1 - P.pos.z, x: P.pos.x, z: r.z1 }].sort((p, q) => p.d - q.d).slice(0, 3);
    for (const p of L) eco(p.x, p.z, clamp(2 * p.d / 343 * 3, .05, .9), clamp(.5 - p.d * .015, .12, .45));
    const area = (r.x1 - r.x0) * (r.z1 - r.z0);
    toast(area < 45 ? 'O eco volta curto: um cômodo apertado.' : area < 150 ? 'O eco volta médio: um cômodo comum.' : 'O eco demora a voltar: um salão grande.');
    if (!S.flags.s7palma) { S.flags.s7palma = true; subPequeno('lia', 'Foi alto demais. Ele deve ter ouvido.'); }
  }

  // ------------------------------------------------------------------ multiplicadores lidos pelo motor
  const REFUGIO = { biblio: .6, roup: .5, celeste: .7, diret: .75 }; // livros, lençóis, tapete
  function sondaFora(x, z) { try { const r = roomAt(x, z); return !!(r && r.fora); } catch (e) { return false; } }
  function mascara(x, z) {
    let k = 1;
    if (a.chFase === 'rajada' && sondaFora(x, z)) k *= .4;
    if (a.chFase === 'recuo' && sondaFora(x, z)) k *= 1.15;
    if (a.granizo) k *= .3;
    if (a.pressao > 0) k *= 1 + a.pressao * .25;
    return k;
  }
  function passoK() {
    let k = 1; const r = P.room;
    if (r && REFUGIO[r.id]) k *= REFUGIO[r.id];
    else if (r && !r.fora) { if (r.piso === 'ladrilho') k *= 1.2; else if (r.piso === 'pedra') k *= 1.1; }
    if (a.molhadoT > 0 && !(r && r.fora && !P.naAgua)) k *= 1.25;
    if (a.chFase === 'recuo' && r && r.fora) k *= 1.3;
    if (a.goteira && a.pingoAte > -.12) k *= .4;
    return k;
  }
  function corte() {
    let c = 20000;
    if (a.tapaK > .2) c = Math.min(c, 700);
    else if (a.T - a.tapaFim < 1.2 && a.tapaFim > 0) c = Math.min(c, 1800);
    if (a.pressao > 0) c = Math.min(c, 20000 - 13000 * a.pressao);
    if (a.ouvidoT > 0 && OPT.s7ouvido) c = Math.min(c, 2600);
    return c;
  }
  function mundoK() {
    let k = 1;
    if (a.tapaK > .01) k *= 1 - a.tapaK * .7;
    if ((a.escutaT || 0) > 0) k *= 1 + .35 * clamp(a.escutaT / 8, 0, 1);
    const r = P.room; if (r && REFUGIO[r.id]) k *= .5;
    if (a.ouvidoT > 0 && OPT.s7ouvido) k *= .75;
    return k;
  }

  // ------------------------------------------------------------------ pedrinhas
  function pedras() { const S = g.S; return S && S.flags && (S.flags.s7ped || 0) > 0 ? S.flags.s7ped : 0; }
  function gastarPedra() { const S = g.S; if (pedras() > 0) { S.flags.s7ped--; toast(S.flags.s7ped > 0 ? `Pedrinha jogada. Sobra ${S.flags.s7ped}.` : 'Última pedrinha jogada.'); return true; } return false; }
  function pedraCaiu(x, z) {
    const r = (() => { try { return roomAt(x, z); } catch (e) { return null; } })();
    const piso = r && r.agua ? 'agua' : r && r.piso || (r && r.fora ? 'grama' : 'concreto');
    const tipo = piso === 'agua' ? 'agua' : (piso === 'terra' || piso === 'grama' || piso === 'asfalto' && false) ? 'terra' : piso === 'madeira' ? 'madeira' : REFUGIO[r && r.id] ? 'tecido' : 'pedra';
    const raio = { agua: 6, terra: 3.5, madeira: 9, tecido: 2.5, pedra: 11 }[tipo];
    const c = AC();
    if (c) {
      try {
        const t = c.currentTime, gg = saida(pos3(x, z, .2), .45, 'sfx');
        if (gg) {
          if (tipo === 'agua') { const o = audio.osc('sine', 520, t, .14, gg); o.frequency.exponentialRampToValueAtTime(190, t + .12); audio.env(gg, t, .003, .5, .15); }
          else if (tipo === 'terra' || tipo === 'tecido') { audio.burst(t, .08, 'lowpass', 380, .8, gg); audio.env(gg, t, .004, .35, .08); }
          else if (tipo === 'madeira') { const o = audio.osc('triangle', 420, t, .12, gg); o.frequency.exponentialRampToValueAtTime(260, t + .1); audio.env(gg, t, .002, .6, .12); }
          else { audio.burst(t, .05, 'highpass', 2600, .9, gg); const o = audio.osc('sine', 1900, t, .06, gg); audio.env(gg, t, .001, .6, .06); }
          // quica mais duas vezes, cada vez mais fraco
          for (let i = 1; i <= 2; i++) { const g2 = saida(pos3(x + rnd(-.3, .3), z + rnd(-.3, .3), .2), .45, 'sfx'); if (g2) { audio.burst(t + i * .13, .04, tipo === 'pedra' ? 'highpass' : 'lowpass', tipo === 'pedra' ? 3000 : 400, .9, g2); audio.env(g2, t + i * .13, .002, .3 / (i + 1), .05); } }
        }
      } catch (e) {}
    }
    emitNoise(x, z, raio, false, true);
    return tipo;
  }

  return { update, tecla, mascara, passoK, corte, mundoK, pedras, gastarPedra, pedraCaiu,
    get tapando() { return a.tapa; }, get fase() { return a.chFase; }, anel };
}
