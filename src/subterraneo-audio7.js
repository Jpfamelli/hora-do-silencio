// Lote 7 — Som e atmosfera do subterrâneo (túneis, cemitério e capela).
// Tudo procedural, com o mesmo AudioContext do motor (A.audio()). Nada de asset novo.
// Só instala tratadores no W.tick da área: quando o mapa troca, o tick para e os sons
// (one-shots curtos) terminam sozinhos — não sobra nada tocando no mapa seguinte.

const AU = A => { try { return A.audio ? A.audio() : null; } catch (e) { return null; } };
const P3 = (p, y) => p ? { x: p.x, y: p.y ?? y ?? 1, z: p.z } : null;
// um tick que quebra não derruba o quadro: depois de 5 erros ele se desliga sozinho
export const segura = fn => { let erros = 0; return dt => { if (erros > 5) return; try { fn(dt); } catch (e) { if (++erros === 1) console.warn('[audio7]', e); } }; };

// ---------- blocos de som reaproveitados pelas duas áreas
export function fab(a) {
  const AC = a.AC;
  return {
    // tom simples com envelope
    tom(pos, f, dur, vol, tipo = 'sine', wet = .3) {
      const t = AC.currentTime, g = a.saida(P3(pos, 1.3), wet, 'amb');
      a.osc(tipo, f, t, dur, g); a.env(g, t, Math.min(.35, dur * .35), vol, dur * .7);
    },
    // acorde grave de tubos de órgão (dente de serra filtrado em passa-baixa)
    orgao(pos, base, vol, dur, det = 0) {
      const t = AC.currentTime;
      for (const [m, d, v] of [[.5, 0, .7], [1, 0, 1], [1, .6, .5], [1.5, -.4, .35], [2, .3, .3], [3, 1.2, .18]]) {
        const g = a.saida(P3(pos, 2.4), .5, 'amb'), o = AC.createOscillator(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(base * m + d + det, t);
        const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 620; lp.Q.value = .6;
        o.connect(lp); lp.connect(g); a.env(g, t, dur * .45, vol * v, dur * .6); o.start(t); o.stop(t + dur + .15);
      }
    },
    // "aah" de coro (formantes) — curto, para cortar rápido ao virar
    coro(pos, f, vol, dur) {
      const t = AC.currentTime;
      for (const [ff, amp] of [[520, 1], [1180, .5], [2600, .22]]) {
        const g = a.saida(P3(pos, 3), .55, 'amb'), o = AC.createOscillator(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * 1.004, t + dur);
        const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = 5;
        o.connect(bp); bp.connect(g); a.env(g, t, dur * .4, vol * amp, dur * .55); o.start(t); o.stop(t + dur + .1);
      }
    },
    // pingo d'água, timbre por material
    pingo(pos, mat, vol = .25) {
      const t = AC.currentTime, g = a.saida(P3(pos, .5), .4, 'amb');
      if (mat === 'lata') { const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(2200, t); o.frequency.exponentialRampToValueAtTime(1300, t + .09); o.connect(g); a.env(g, t, .002, vol, .12); o.start(t); o.stop(t + .14); }
      else if (mat === 'poca') { a.burst(t, .12, 'lowpass', 900, 1, g); a.env(g, t, .003, vol, .1); }
      else if (mat === 'pedra') { const o = AC.createOscillator(); o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(700, t + .05); o.connect(g); a.env(g, t, .001, vol, .05); o.start(t); o.stop(t + .08); }
      else { const o = AC.createOscillator(); o.frequency.setValueAtTime(1100, t); o.frequency.exponentialRampToValueAtTime(600, t + .07); o.connect(g); a.env(g, t, .002, vol, .09); o.start(t); o.stop(t + .12); }
    },
    // pancada metálica num cano distante
    cano(pos, vol = .5) {
      const t = AC.currentTime, g = a.saida(P3(pos, 1.6), .6, 'amb');
      a.burst(t, .25, 'bandpass', 420, 8, g); a.env(g, t, .002, vol, .22);
      const g2 = a.saida(P3(pos, 1.6), .5, 'amb'), o = AC.createOscillator(); o.type = 'triangle';
      o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(120, t + .3); o.connect(g2); a.env(g2, t, .002, vol * .5, .3); o.start(t); o.stop(t + .35);
    },
    // assobio de caldeira ganhando pressão
    assobio(pos, k, vol) {
      const t = AC.currentTime, g = a.saida(P3(pos, 1.4), .3, 'amb'), o = AC.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(700 + k * 900, t); o.frequency.linearRampToValueAtTime(760 + k * 1100, t + .5);
      const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2000; bp.Q.value = 2; o.connect(bp); bp.connect(g);
      a.env(g, t, .2, vol, .35); o.start(t); o.stop(t + .6);
      a.burst(t, .55, 'highpass', 3200, .8, a.saida(P3(pos, 1.4), .2, 'amb')); // chiado de vapor junto
    },
    // válvula de escape fechando (tchunc)
    tchunc(pos) {
      const t = AC.currentTime, g = a.saida(P3(pos, 1.4), .4, 'amb');
      a.burst(t, .09, 'lowpass', 380, 1, g); a.env(g, t, .001, .6, .08);
      const o = AC.createOscillator(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(60, t + .1); const g2 = a.saida(P3(pos, 1.4), .3, 'amb'); o.connect(g2); a.env(g2, t, .001, .4, .1); o.start(t); o.stop(t + .12);
    },
    // subgrave longo do trovão sentido debaixo da terra
    subtrovao(vol) {
      const t = AC.currentTime, g = a.saida(null, .1, 'amb'), o = AC.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(34, t); o.frequency.linearRampToValueAtTime(22, t + 2.4); o.connect(g);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .4); g.gain.exponentialRampToValueAtTime(.0001, t + 2.6); o.start(t); o.stop(t + 2.8);
    },
    // gorgolejo contínuo (uma fatia curta) da cisterna
    gorg(pos, grave, vol) {
      const t = AC.currentTime, g = a.saida(P3(pos, .6), .4, 'amb');
      const f = a.burst(t, 1.1, 'bandpass', grave ? 300 : 620, 1.4, g); f.frequency.linearRampToValueAtTime(grave ? 180 : 420, t + 1); a.env(g, t, .25, vol, .8);
    },
    // zumbido de moscas
    moscas(pos, vol) {
      const t = AC.currentTime, g = a.saida(P3(pos, .8), .15, 'amb'), o = AC.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(150, t); const lfo = AC.createOscillator(); lfo.frequency.value = 7; const lg = AC.createGain(); lg.gain.value = 40; lfo.connect(lg); lg.connect(o.frequency);
      const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 3; o.connect(bp); bp.connect(g);
      a.env(g, t, .4, vol, 1.1); o.start(t); o.stop(t + 1.6); lfo.start(t); lfo.stop(t + 1.6);
    },
    // range longo de estrutura metálica (cabo, catraca)
    estrutura(pos, vol) {
      const t = AC.currentTime, g = a.saida(P3(pos, 1.2), .5, 'amb');
      const f = a.burst(t, 1.3, 'bandpass', 520, 7, g); f.frequency.linearRampToValueAtTime(360, t + 1.2); a.env(g, t, .2, vol, 1);
    },
    // tom baixo e contínuo que serve de norte (uma fatia)
    norte(pos, vol) {
      const t = AC.currentTime, g = a.saida(P3(pos, 3), .35, 'amb');
      a.osc('sine', 72, t, 1.4, g); a.osc('sine', 108, t, 1.4, a.saida(P3(pos, 3), .3, 'amb')); a.env(g, t, .4, vol, 1);
    },
    // apito agudo na orelha (tinido depois da badalada)
    tinido(vol) {
      const t = AC.currentTime, g = a.saida(null, 0, 'amb'); a.osc('sine', 3100, t, 1.3, g); a.env(g, t, .02, vol, 1.25);
    },
    // vento soprando num tubo (nota grave por corrente de ar)
    sopro(pos, f, vol) {
      const t = AC.currentTime, g = a.saida(P3(pos, 2.4), .45, 'amb'), o = AC.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * .99, t + 1.8);
      const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; o.connect(lp); lp.connect(g);
      a.env(g, t, .7, vol, 1.3); o.start(t); o.stop(t + 2); a.burst(t, 1.8, 'highpass', 2600, .7, a.saida(P3(pos, 2.4), .2, 'amb'));
    },
    // carrilhão de ossos (cliques secos de madeira/osso)
    carrilhao(pos, n, vol) {
      const t0 = AC.currentTime;
      for (let i = 0; i < n; i++) { const t = t0 + i * (.05 + Math.random() * .1), g = a.saida(P3(pos, 2.2), .4, 'amb'), o = AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(380 + Math.random() * 500, t); o.frequency.exponentialRampToValueAtTime(220, t + .06); o.connect(g); a.env(g, t, .001, vol * (.5 + Math.random() * .5), .09); o.start(t); o.stop(t + .12); }
    },
    // voz muito abafada vazando por uma parede/cano (passa-banda baixa)
    vozAbafada(pos, vol) {
      const t = AC.currentTime;
      for (const [k, f0, vo] of [[0, 150, 'o'], [.35, 165, 'a'], [.7, 140, 'e']]) {
        const g = a.saida(P3(pos, 1.4), .4, 'amb'), o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t + k); o.frequency.linearRampToValueAtTime(f0 * .9, t + k + .4);
        const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; lp.Q.value = 1; o.connect(lp); lp.connect(g); a.env(g, t + k, .08, vol, .35); o.start(t + k); o.stop(t + k + .5);
      }
    }
  };
}

// =====================================================================
// TÚNEIS
// =====================================================================
export function tuneis(A, S, def, extra = {}) {
  const nivelF = extra.nivel || (() => 0), valvIts = extra.valvIts || [];
  const O = extra.O, B = extra.B, som = extra.som;
  let maskMul = 1;                           // abafamento dos seus passos (caldeira, sincronia da gota)
  const r0 = def.ruidoMul; def.ruidoMul = () => (r0 ? r0() : 1) * maskMul;

  // pontos de goteira com material próprio (xilofone de localização no escuro)
  const gotas = [
    { x: -14, z: -17.6, mat: 'poca', iv: 1.6, t: 0, metro: true },  // compasso regular (metrônomo)
    { x: 14, z: -17.6, mat: 'lata', iv: 1.7, t: 1 },
    { x: 0, z: -24, mat: 'pedra', iv: 2.3, t: .5 },
    { x: -5, z: -36, mat: 'concreto', iv: 2.7, t: 2 }
  ];
  // um pingo discreto perto de cada válvula, para triangular de ouvido
  for (const V of valvIts) gotas.push({ x: V.pos.x + (V.pos.x < 0 ? 1.4 : -1.4), z: V.pos.z, mat: 'lata', iv: 3.6, t: Math.random() * 3, guia: true, vol: .14, n: V.n });

  const rand = A.rand;
  let ratoT = A.rand(5, 10), canoEco = null, lastNoise = 0, caldeira = { fase: 0, t: A.rand(8, 16) };
  let cisT = 0, mareT = 0, pocaT = A.rand(12, 20), nucaT = A.rand(18, 30), paredeT = A.rand(26, 44);
  let prevRaio = 0, parada = 0, sussurro = { t: A.rand(30, 55), n: 0, fase: 0 }, estruturaT = A.rand(10, 18);
  let moscaT = A.rand(10, 18), stepAcc = 0, prevStep = 0, metroFase = 0;
  let fluxoT = 0, prevValv = (A.S.valv ? A.S.valv.length : 0), assentaT = A.rand(12, 22), tensaoT = 0, splashAcc = 0, ecoGotaT = 0;
  let infil = { t: 3, iv: 1.4, x: 6, z: -40 }, ecoPasso = 0, subBedT = 0, arranhaT = A.rand(14, 26);
  let salaAnt = null, lapT = 0, coincideT = A.rand(40, 60);
  const lama = {};                           // células de lama já pisadas (sucção só na ida)
  const lastP = new A.THREE.Vector3().copy(A.P.pos);
  const fwd = new A.THREE.Vector3();

  // parede de escuta: encostar o ouvido numa parede marcada do túnel oeste
  try {
    const par = new A.THREE.Mesh(new A.THREE.BoxGeometry(2.4, 2, .06), new A.THREE.MeshStandardMaterial({ color: 0x241d16, roughness: 1 }));
    par.position.set(30, 1.2, -23.9); A.W.grupo.add(par);
    const itP = A.interact(par, () => '<b>E</b>Encostar o ouvido na parede', () => {
      const a = AU(A); if (a) fab(a).vozAbafada({ x: 30, y: 1.2, z: -27 }, .3);
      A.sub && A.sub('lia', 'Tem gente falando do outro lado dessa parede. Baixinho. Não dá pra entender.');
    });
    if (itP) { itP.hold = 1.4; itP.som = null; }
  } catch (e) {}

  A.W.tick.push(segura(dt => {
    const a = AU(A); const P = A.P, M = A.M, t = A.perf();
    const nivel = nivelF(), alta = nivel > .3;
    const mov = Math.hypot(P.pos.x - lastP.x, P.pos.z - lastP.z); lastP.copy(P.pos);
    maskMul = 1;
    const dM = M && M.ativo ? M.pos.distanceTo(P.pos) : 99;   // distância do Inspetor (99 = longe/ausente)

    // ---- caldeira: assobio que mascara o seu barulho e cala num tchunc
    caldeira.t -= dt;
    if (caldeira.fase === 0 && caldeira.t <= 0) { caldeira.fase = 1; caldeira.k = 0; caldeira.pos = { x: -30, z: -36 }; }
    if (caldeira.fase === 1) {
      caldeira.k = Math.min(1, caldeira.k + dt * .28);
      caldeira.sub = (caldeira.sub || 0) - dt; if (caldeira.sub <= 0) { caldeira.sub = .5; if (a) fab(a).assobio(caldeira.pos, caldeira.k, .18 + caldeira.k * .12); }
      maskMul = Math.min(maskMul, 1 - caldeira.k * .55);   // move-se barulhenta só enquanto ela apita
      if (caldeira.k >= 1) { caldeira.fase = 0; caldeira.t = rand(14, 26); if (a) fab(a).tchunc(caldeira.pos); if (A.emitNoise) A.emitNoise(-30, -36, 3); }
    }

    // ---- de tempos em tempos as três goteiras de intervalos primos caem juntas num só 'plop' que parece de propósito
    coincideT -= dt;
    if (coincideT <= 0) { coincideT = rand(55, 80); if (a && dM > 12) { const f = fab(a); f.pingo({ x: -14, z: -17.6 }, 'poca', .3); f.pingo({ x: 14, z: -17.6 }, 'lata', .3); f.pingo({ x: 0, z: -24 }, 'pedra', .3); } }

    // ---- goteiras por material; a do centro é um metrônomo
    const vcount = A.S.valv ? A.S.valv.length : 0;
    for (const d of gotas) {
      if (d.guia && vcount > 0 && d.n != null && A.S.valv.includes(d.n)) continue; // a goteira-guia cala quando a válvula já foi girada
      d.t -= dt;
      if (d.t <= 0 && dM < 9) { d.t = .6; continue; }   // as goteiras calam quando ele chega perto: o silêncio avisa
      if (d.t <= 0) {
        d.t = d.guia ? d.iv : d.iv * (d.metro ? 1 : .8 + Math.random() * .4);
        const graveN = alta ? .5 : 0;        // mais funda, pingo mais grave
        if (a) { const f = fab(a); f.pingo({ x: d.x, z: d.z }, alta && d.mat === 'poca' ? 'poca' : d.mat, (d.vol || .22) * (1 - graveN * .3)); setTimeout(() => { const a2 = AU(A); if (a2 && A.W.mapa === 'tuneis') fab(a2).pingo({ x: d.x, z: d.z }, d.mat, (d.vol || .22) * .35); }, 170); } // cauda de eco molhada
        if (B && alta && d.mat === 'poca') B.emitir(d.x, nivel, d.z, 1, .1);
        if (d.metro) metroFase = t;            // marca a batida para a sincronia do passo
      }
    }
    // o pingo-guia some depois que a válvula correspondente é girada (feito acima com continue)

    // ---- infiltração que acelera e "transborda" num respingo alto, reiniciando (relógio de tensão)
    infil.t -= dt;
    if (infil.t <= 0) {
      infil.iv = Math.max(.2, infil.iv - .12);
      if (infil.iv <= .22) { if (a) fab(a).pingo({ x: infil.x, z: infil.z }, 'poca', .4); if (O) O.criar(infil.x, nivel, infil.z, .9, .3, 1.2); infil.iv = 1.5; infil.t = 1.8; }
      else { if (a) fab(a).pingo({ x: infil.x, z: infil.z }, 'lata', .18); infil.t = infil.iv; }
    }

    // ---- submersa: o mundo abafa num ronco grave e só sobra o seu coração
    const submersa = def.submersa ? def.submersa() : false;
    if (submersa) { subBedT -= dt; if (subBedT <= 0) { subBedT = .7; if (a) { const g = a.saida(null, 0, 'amb'); a.burst(a.AC.currentTime, .8, 'lowpass', 160, 1, g, 0); a.env(g, a.AC.currentTime, .1, .12, .6); const g2 = a.saida(null, 0, 'amb'); const o = a.AC.createOscillator(); o.frequency.setValueAtTime(60, a.AC.currentTime); o.frequency.exponentialRampToValueAtTime(40, a.AC.currentTime + .18); o.connect(g2); a.env(g2, a.AC.currentTime, .02, .14, .2); o.start(a.AC.currentTime); o.stop(a.AC.currentTime + .25); } } }

    // ---- na caça dentro do túnel, seus próprios passos voltam ecoando de trás (a cauda confunde)
    if (M && M.ativo && M.state === 'caca' && mov > .02) { ecoPasso -= dt; if (ecoPasso <= 0) { ecoPasso = .4; A.camera.getWorldDirection(fwd); const bx = P.pos.x + fwd.x * 2.5, bz = P.pos.z + fwd.z * 2.5; setTimeout(() => { const a2 = AU(A); if (a2 && A.W.mapa === 'tuneis') { const g = a2.saida({ x: bx, y: .1, z: bz }, .5); a2.burst(a2.AC.currentTime, .12, 'lowpass', 500, 1, g); a2.env(g, a2.AC.currentTime, .01, .1, .12); } }, 260); } }

    // ---- unhas pequenas arranhando ao longe quando o Inspetor não está por perto
    arranhaT -= dt;
    if (arranhaT <= 0) { arranhaT = rand(12, 22); if (a && !(M && M.ativo && dM < 16)) { const px = rand(-24, 24), pz = rand(-50, -10), g = a.saida({ x: px, y: .3, z: pz }, .3); a.burst(a.AC.currentTime, .4, 'highpass', 3600, 2, g); a.env(g, a.AC.currentTime, .05, .05, .35); } }
    // sincronizar o passo com a gota do compasso abaixa um pouco o seu ruído
    if (mov > .001 && !P.sprinting) { const defase = Math.abs(((t - metroFase) % 1.6)); if (defase < .22 || defase > 1.38) maskMul = Math.min(maskMul, .8); }

    // pisar na poça de referência te denuncia (respingo alto que ele ouve)
    pocaT -= dt;
    if (mov > .02 && Math.abs(P.pos.x + 14) < 1.1 && Math.abs(P.pos.z + 17.6) < 1.1 && pocaT <= 0) {
      pocaT = 1.2; if (a) fab(a).pingo({ x: P.pos.x, z: P.pos.z }, 'poca', .5); if (O) O.criar(P.pos.x, nivel, P.pos.z, .8, .3, 1.2); if (A.emitNoise) A.emitNoise(P.pos.x, P.pos.z, 6);
    }

    // ---- ratos: guincham e correm para longe do Inspetor; calam quando ele chega ao túnel
    ratoT -= dt;
    if (ratoT <= 0) {
      ratoT = rand(6, 13);
      if (!(M && M.ativo && dM < 14)) {        // os ratos somem quando ele está por perto
        let dir = Math.random() < .5 ? 1 : -1;
        if (M && M.ativo) dir = (P.pos.x - M.pos.x) >= 0 ? 1 : -1;  // fogem para o lado oposto ao dele
        if (a) { const f = fab(a); for (let i = 0; i < 5; i++) { const tt = i; const px = P.pos.x + dir * (2 + i * 1.6), pz = P.pos.z + rand(-2, 2); setTimeout(() => { const a2 = AU(A); if (a2 && A.W.mapa === 'tuneis') { const g = a2.saida({ x: px, y: .2, z: pz }, .3); a2.burst(a2.AC.currentTime, .04, 'bandpass', 3000 + Math.random() * 1500, 6, g); a2.env(g, a2.AC.currentTime, .001, .12, .05); } }, tt * 70); } }
      }
    }

    // ---- cano responde ao seu barulho ~1 s depois, de um ponto distante
    if (P.noiseR > 6 && t - lastNoise > 2.5) { lastNoise = t; canoEco = { t: .8 + Math.random() * .5, x: rand(-24, 24), z: rand(-50, -10) }; }
    if (canoEco) { canoEco.t -= dt; if (canoEco.t <= 0) { if (a) fab(a).cano({ x: canoEco.x, z: canoEco.z }, .35); canoEco = null; } }

    // ---- trovão vira subgrave sentido mais que ouvido
    const raio = A.raioI || 0;
    if (raio > .5 && prevRaio <= .5) { if (a) fab(a).subtrovao(.12); P.shake = Math.max(P.shake || 0, .08); }
    prevRaio = raio;

    // ---- cisterna: gorgolejo que engrossa com o nível + maré lenta (~30 s)
    if (P.room && P.room.id === 'hub') {
      cisT -= dt; mareT += dt;
      const mare = .5 + .5 * Math.sin(mareT * (Math.PI * 2 / 30));
      const valvK = (A.S.valv ? A.S.valv.length : 0);
      if (cisT <= 0) { cisT = alta ? 1.1 : 2.4; if (a) fab(a).gorg({ x: 0, z: -36 }, alta, (alta ? .18 : .1) * (.6 + mare * .6)); }
      // a voz da cisterna sobe de tom conforme as válvulas baixam a água (conta o estado de longe)
      if (Math.random() < dt * .4 && a) fab(a).tom({ x: 0, z: -37 }, 60 + valvK * 22 + mare * 10, 1.6, .05 + mare * .04, 'sine', .4);
    }

    // ---- parado na água, no silêncio sobra um respingo que não é seu
    if (mov < .001 && alta && !S.hidden) parada += dt; else parada = 0;
    if (parada > 5 && Math.random() < dt * .5 && dM > 10) { const ang = rand(0, 6.28), r = rand(3, 6); const x = P.pos.x + Math.cos(ang) * r, z = P.pos.z + Math.sin(ang) * r; if (a) fab(a).pingo({ x, z }, 'poca', .3); if (O) O.criar(x, nivel, z, .7, .25, 1.2); parada = 2; }

    // gota na nuca, de vez em quando, com estremecer
    nucaT -= dt;
    if (nucaT <= 0 && P.room && P.room.agua) { nucaT = rand(22, 40); if (a) { const aa = AU(A); if (aa) { const g = aa.saida({ x: P.pos.x, y: 2.4, z: P.pos.z }, .2); aa.burst(aa.AC.currentTime, .08, 'bandpass', 1600, 3, g); aa.env(g, aa.AC.currentTime, .002, .22, .1); } } P.shake = Math.max(P.shake || 0, .05); }

    // ---- sussurro que conta de trás para frente; no "um", uma porta bate longe
    sussurro.t -= dt;
    if (sussurro.fase === 0 && sussurro.t <= 0 && dM > 14 && !S.hidden) { sussurro.fase = 1; sussurro.n = 10; sussurro.st = 0; sussurro.pos = { x: P.pos.x + rand(-2, 2), z: P.pos.z + rand(-2, 2) }; }
    if (sussurro.fase === 1) {
      sussurro.st = (sussurro.st || 0) - dt;
      if (sussurro.st <= 0) {
        sussurro.st = .7;
        if (sussurro.n > 0) { if (a) { const g = a.saida(P3(sussurro.pos, 1), .5, 'amb'); a.burst(a.AC.currentTime, .3, 'bandpass', 900 + sussurro.n * 40, 5, g); a.env(g, a.AC.currentTime, .05, .1, .28); } sussurro.n--; }
        else { sussurro.fase = 0; sussurro.t = rand(50, 90); const px = rand(-24, 24), pz = rand(-52, -10); if (a) { const aa = AU(A); if (aa) { const g = aa.saida({ x: px, y: 1, z: pz }, .8); aa.burst(aa.AC.currentTime, .5, 'lowpass', 300, 1, g, 0); aa.env(g, aa.AC.currentTime, .003, 1, .45); } } if (A.emitNoise) A.emitNoise(px, pz, 4); }
      }
    } else if (mov > .02) sussurro.t = Math.max(sussurro.t, 6);  // andando, ela não ouve a contagem

    // ---- lama que cede: sucção na ida, mais calada na volta
    if (mov > .015 && P.room && P.room.agua && Math.random() < dt * 4) {
      const cx = Math.round(P.pos.x / 2), cz = Math.round(P.pos.z / 2), key = cx + ',' + cz;
      const novo = !lama[key]; lama[key] = true;
      if (a) { const g = a.saida({ x: P.pos.x, y: .1, z: P.pos.z }, .2); a.burst(a.AC.currentTime, novo ? .18 : .08, 'lowpass', novo ? 380 : 600, 1, g); a.env(g, a.AC.currentTime, .004, novo ? .22 : .08, novo ? .16 : .07); }
    }

    // ---- range de estrutura metálica perto do monta-cargas/escada de saída
    estruturaT -= dt;
    if (estruturaT <= 0) { estruturaT = rand(9, 16); if (a && Math.hypot(P.pos.x - 31.6, P.pos.z + 36) < 20) fab(a).estrutura({ x: 31.6, z: -36 }, .08); }

    // ---- moscas sobre algo morto no canto do túnel leste
    moscaT -= dt;
    if (moscaT <= 0) { moscaT = rand(7, 14); const d = Math.hypot(P.pos.x - 24, P.pos.z + 18); if (a && d < 14) fab(a).moscas({ x: 24, z: -18 }, Math.max(.03, .12 * (1 - d / 14))); }

    // ---- ambiência por sala: ao trocar de sala, um tom surdo próprio do espaço
    const salaAtual = P.room ? P.room.id : null;
    if (salaAtual && salaAtual !== salaAnt) {
      salaAnt = salaAtual;
      if (a) { const grande = salaAtual === 'hub' || salaAtual === 'secreta'; fab(a).tom({ x: P.pos.x, z: P.pos.z }, grande ? 46 : 72, grande ? 3.2 : 2.2, grande ? .06 : .04, 'sine', .45); }
    }

    // ---- água batendo de leve nas paredes quando o nível está alto
    if (alta) { lapT -= dt; if (lapT <= 0) { lapT = rand(2.2, 4); if (a && P.room && P.room.agua) { const g = a.saida({ x: P.pos.x, y: nivel, z: P.pos.z - 2 }, .3); a.burst(a.AC.currentTime, 1, 'bandpass', 500, 1, g); a.env(g, a.AC.currentTime, .3, .05, .7); } } }

    // ---- água corrente de fundo (bed): mais forte com a água alta e nas tempestades
    fluxoT -= dt;
    if (fluxoT <= 0) {
      fluxoT = 1.3; const forca = (alta ? .07 : .03) * (1 + (A.raioI || 0) * .8);
      if (a && forca > .01) { const g = a.saida({ x: 0, y: .3, z: -36 }, .3); a.burst(a.AC.currentTime, 1.3, 'bandpass', alta ? 360 : 520, 1, g); a.env(g, a.AC.currentTime, .4, forca, 1); }
    }

    // ---- aríete: girar a válvula certa manda uma pancada pelos canos até salas distantes
    const vc = A.S.valv ? A.S.valv.length : 0;
    if (vc > prevValv) { prevValv = vc; if (a) { const f = fab(a); const pts = [{ x: 0, z: -24 }, { x: 18, z: -36 }, { x: -18, z: -36 }]; pts.forEach((p, i) => setTimeout(() => { const a2 = AU(A); if (a2 && A.W.mapa === 'tuneis') fab(a2).cano(p, .4 - i * .08); }, 120 + i * 180)); } if (A.emitNoise) A.emitNoise(0, -24, 10);
      if (vc >= 3 && a) { const f = fab(a); for (let i = 0; i < 5; i++) setTimeout(() => { const a2 = AU(A); if (a2 && A.W.mapa === 'tuneis') fab(a2).gorg({ x: 0, z: -36 }, true, .14); }, 400 + i * 500); } } // a água baixando escorre gorgolejando pelos ralos
    else if (vc < prevValv) prevValv = vc;

    // ---- seus respingos na água alta soam alto e viram um anel que o Inspetor pode seguir
    if (alta && mov > .001 && !S.hidden && !P.sprinting) { splashAcc += mov; if (splashAcc > .8) { splashAcc = 0; if (a) fab(a).pingo({ x: P.pos.x, z: P.pos.z }, 'poca', .18 + P.noiseR * .01); if (O) O.criar(P.pos.x, nivel, P.pos.z, .5, .18, 1.2); if (A.emitNoise && P.noiseR > 4) A.emitNoise(P.pos.x, P.pos.z, 3); } }

    // ---- canos que "assentam" sozinhos de longe (a estrutura velha trabalhando)
    assentaT -= dt; if (assentaT <= 0) { assentaT = rand(11, 20); if (a) fab(a).cano({ x: rand(-24, 24), z: rand(-50, -10) }, .14); }

    // ---- música procedural de tensão: um pulso grave sobe enquanto o Inspetor caça
    tensaoT -= dt;
    if (M && M.ativo && (M.state === 'caca' || M.state === 'procura') && tensaoT <= 0) {
      tensaoT = M.state === 'caca' ? 1 : 1.8;
      if (a) { const f = M.state === 'caca' ? 55 : 44; fab(a).tom(null, f, 1.4, M.state === 'caca' ? .08 : .05, 'sawtooth', .2); }
    }

    // cano que traz o andar de cima: parada sob o cano do cruzamento, o internato vaza fino
    if (Math.abs(P.pos.x) < 1.3 && Math.abs(P.pos.z + 30) < 1.3 && mov < .002 && Math.random() < dt * .5) {
      if (a) { const aa = AU(A); if (aa) { const g = aa.saida({ x: 0, y: 2.6, z: -30 }, .3); const o = aa.AC.createOscillator(); o.type = 'sine'; o.frequency.value = 523; const bp = aa.AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 6; o.connect(bp); bp.connect(g); aa.env(g, aa.AC.currentTime, .1, .06, 1.1); o.start(aa.AC.currentTime); o.stop(aa.AC.currentTime + 1.3); } }
    }
  }));
  return def;
}

// =====================================================================
// CEMITÉRIO E CAPELA
// =====================================================================
export function cemiterio(A, S, def, extra = {}) {
  const avivar = extra.avivar, sinoP = extra.sinoP, importantes = extra.importantes || {}, covas = extra.covas || [];
  const rand = A.rand;
  let maskMul = 1;
  const r0 = def.ruidoMul; def.ruidoMul = () => (r0 ? r0() : 1) * maskMul;

  let coroT = 0, orgaoT = A.rand(4, 9), droneT = 0, naveT = A.rand(2, 5), harmT = A.rand(18, 30);
  let ventoT = A.rand(6, 12), sinoNorte = 0, carrT = A.rand(8, 15), moscaT = A.rand(6, 12), ecoT = 0;
  let prevRaio = 0, prevDoor = false, tolT = 0, tileT = 0, prevSino = false, soproGrande = 0;
  let arT = 0, velaT = A.rand(2, 5), covaT = A.rand(7, 13), mauT = 0, tensaoT = 0;
  let ventoCampoT = 0, passaroT = A.rand(14, 30), folhaT = 0, sinoEcoT = 0, bancoT = A.rand(10, 20), torreT = A.rand(8, 16);
  let prevPlaced = S.placed || 0, prevTum = S.tumulos ? Object.keys(S.tumulos).length : 0;
  const fwd = new A.THREE.Vector3(), aoAltar = new A.THREE.Vector3();
  const lastP = new A.THREE.Vector3().copy(A.P.pos);
  const ALTAR = { x: 0, y: 1.2, z: -66 }, BELL = { x: 4.8, y: 5, z: -64 };
  // lajotas que soltam uma nota de órgão ao serem pisadas (e fazem barulho)
  const lajes = [[-2.4, -56], [2.1, -58], [-1.2, -61], [1.6, -63]].map(([x, z]) => ({ x, z, cd: 0, f: 98 * (1 + Math.random() * .5) }));

  A.W.tick.push(segura(dt => {
    const a = AU(A); const P = A.P, M = A.M, t = A.perf();
    const mov = Math.hypot(P.pos.x - lastP.x, P.pos.z - lastP.z); lastP.copy(P.pos);
    maskMul = 1;
    const naCapela = P.room && P.room.id === 'capela';
    const dAltar = Math.hypot(P.pos.x - ALTAR.x, P.pos.z - ALTAR.z);

    // direção da câmera x direção do altar (coro às costas, órgão respirando)
    A.camera.getWorldDirection(fwd); aoAltar.set(ALTAR.x, ALTAR.y, ALTAR.z).sub(A.camera.position).normalize();
    const encara = fwd.dot(aoAltar);         // 1 = olhando o altar, -1 = de costas

    // ---- cantoria que só se ouve de costas para o altar
    coroT -= dt;
    if (coroT <= 0) {
      coroT = .45;
      const perto = dAltar < 26;
      const costas = Math.max(0, -encara);   // 0..1 conforme vira as costas
      if (perto && costas > .15 && a) { const f = [196, 233, 262][Math.floor(Math.random() * 3)]; fab(a).coro(ALTAR, f, .05 + costas * .11, .9); }
    }

    // ---- órgão: acorde grave inchando conforme chega ao altar
    orgaoT -= dt;
    if (orgaoT <= 0 && dAltar < 22) { orgaoT = rand(5, 9); const prox = 1 - Math.min(1, dAltar / 22); if (a) fab(a).orgao(ALTAR, 49, .05 + prox * .14, 3.4); }

    // ---- drone de tubos preenchendo a nave quando o resto do som cai
    droneT -= dt;
    if (droneT <= 0 && naCapela) { droneT = 2.6; if (a) fab(a).orgao(ALTAR, 36.7, .05, 3.2, -1); }

    // ---- harmônio solta sozinho uma nota longa ao entrar na nave
    if (naCapela && naveT > -900) { naveT -= dt; if (naveT <= 0) { naveT = -1000; if (a) fab(a).tom(ALTAR, 220 * .992, 3.2, .1, 'sawtooth', .5); } }

    // ---- harmônio respira e desafina um pouco nos segundos antes do sino
    if (sinoP) { const vibra = S.flags && S.flags.sino ? 1 : 0; if (vibra && droneT > 2 && Math.random() < dt && a) fab(a).orgao(ALTAR, 49, .08, 2.4, rand(-3, 3)); }

    // ---- rajada de vento faz o órgão/harmônio soltar nota grave aleatória; raramente erra feio
    const raio = A.raioI || 0; ventoT -= dt; harmT -= dt;
    const rajada = raio > .5 && prevRaio <= .5;
    if ((ventoT <= 0 || rajada) && (naCapela || dAltar < 28)) {
      ventoT = rand(7, 14);
      if (harmT <= 0 && Math.random() < .5) { harmT = 40; if (a) fab(a).orgao(ALTAR, 55, .12, 2.6, rand(-6, 6)); }  // acorde cansado e desafinado
      else if (a) fab(a).sopro(ALTAR, [41, 49, 55][Math.floor(Math.random() * 3)], .09);
    }
    prevRaio = raio;

    // ---- nave abre o som ao abrir a porta da capela (whoosh de espaço enorme)
    try { const d = A.DOOR && A.DOOR('cap'); const aberta = !!(d && d.open); if (aberta && !prevDoor && a) { const g = a.saida({ x: 0, y: 3, z: -50 }, .6); const f = a.burst(a.AC.currentTime, 2.2, 'bandpass', 500, .6, g); f.frequency.linearRampToValueAtTime(220, a.AC.currentTime + 2); a.env(g, a.AC.currentTime, .3, .18, 1.8); } prevDoor = aberta; } catch (e) {}

    // ---- eco úmido da nave: seus passos voltam mais longos e graves dentro da capela
    if (naCapela && mov > .02) { ecoT -= dt; if (ecoT <= 0) { ecoT = .5; if (a) setTimeout(() => { const aa = AU(A); if (aa && A.W.mapa === 'cemiterio') { const g = aa.saida({ x: P.pos.x, y: .1, z: P.pos.z }, .6); aa.burst(aa.AC.currentTime, .4, 'lowpass', 420, 1, g); aa.env(g, aa.AC.currentTime, .02, .12, .4); } }, 230); } }

    // ---- lajotas de órgão ao pisar (barulho para o Inspetor)
    tileT -= dt;
    if (naCapela && mov > .02 && tileT <= 0) for (const L of lajes) { if (Math.abs(P.pos.x - L.x) < .7 && Math.abs(P.pos.z - L.z) < .7) { tileT = .35; if (a) fab(a).orgao({ x: L.x, z: L.z }, L.f, .16, 1.4); if (A.emitNoise) A.emitNoise(L.x, L.z, 7); break; } }

    // ---- carrilhão de ossos num ponto fixo; bate mais rápido na rajada
    carrT -= dt;
    if (carrT <= 0) { carrT = (raio > .4 ? rand(2, 4) : rand(9, 16)); const d = Math.hypot(P.pos.x + 20, P.pos.z + 10); if (a && d < 30) fab(a).carrilhao({ x: -20, z: -10 }, raio > .4 ? 6 : 3, Math.max(.05, .3 * (1 - d / 30))); }

    // ---- moscas sobre os túmulos abertos (nojo quase subliminar)
    moscaT -= dt;
    if (moscaT <= 0) {
      moscaT = rand(5, 10); let melhor = null, md = 1e9;
      for (const id in importantes) if (S.tumulos && S.tumulos[id]) { const L = importantes[id]; if (L && L.g) { const d = Math.hypot(L.g.position.x - P.pos.x, L.g.position.z - P.pos.z); if (d < md) { md = d; melhor = L.g.position; } } }
      if (melhor && md < 10 && a) fab(a).moscas({ x: melhor.x, z: melhor.z }, Math.max(.03, .13 * (1 - md / 10)));
    }

    // ---- trovão sentido no campo aberto, bem grave
    if (rajada && a) fab(a).subtrovao(.08);

    // ---- durante a fuga: o sino vira norte (tom contínuo) e cada badalada deixa um tinido/surdez
    const fugindo = S.flags && S.flags.sino;
    if (fugindo) {
      sinoNorte -= dt; if (sinoNorte <= 0) { sinoNorte = 1.2; if (a) fab(a).norte(BELL, .08); }
    }
    // detecta a badalada grande (quando o sino balança forte) e cria janela de surdez
    const balanca = sinoP ? Math.abs(sinoP.rotation.x) : 0;
    const batendo = balanca > .45;
    if (batendo && !prevSino) { tolT = 1.2; if (a) fab(a).tinido(.16); }
    prevSino = batendo;
    if (tolT > 0) { tolT -= dt; maskMul = Math.min(maskMul, .3); }   // logo após a badalada você quase não ouve (nem a si)

    // ---- vento arrastado e airoso soprando pela nave alta
    if (naCapela) { arT -= dt; if (arT <= 0) { arT = 2.2; if (a) { const g = a.saida({ x: 0, y: 4.5, z: -62 }, .4); const f = a.burst(a.AC.currentTime, 2.4, 'bandpass', 420, .8, g); f.frequency.linearRampToValueAtTime(300, a.AC.currentTime + 2.2); a.env(g, a.AC.currentTime, .6, .05, 1.6); } } }

    // ---- as velas do altar crepitam de perto
    velaT -= dt;
    if (velaT <= 0 && dAltar < 5 && (S.placed > 0 || !S.flags || !S.flags.sino)) { velaT = rand(1.5, 3.5); if (a) { const g = a.saida(ALTAR, .2, 'amb'); a.burst(a.AC.currentTime, .12, 'highpass', 3000, 1, g); a.env(g, a.AC.currentTime, .002, .06, .1); } }

    // ---- corrente de ar fria assobia saindo dos túmulos abertos
    covaT -= dt;
    if (covaT <= 0) {
      covaT = rand(6, 12); let melhor = null, md = 1e9;
      for (const id in importantes) if (S.tumulos && S.tumulos[id]) { const L = importantes[id]; if (L && L.g) { const d = Math.hypot(L.g.position.x - P.pos.x, L.g.position.z - P.pos.z); if (d < md) { md = d; melhor = L.g.position; } } }
      if (melhor && md < 12 && a) fab(a).sopro({ x: melhor.x, z: melhor.z }, 180, Math.max(.03, .1 * (1 - md / 12)));
    }

    // ---- goteira ecoando dentro do mausoléu (saída dos túneis)
    mauT -= dt;
    if (mauT <= 0) { mauT = rand(2.4, 4.2); const d = Math.hypot(P.pos.x - 24, P.pos.z - 9); if (a && d < 16) fab(a).pingo({ x: 24, z: 9 }, 'pedra', Math.max(.04, .2 * (1 - d / 16))); }

    // ---- música procedural de tensão na fuga: um pulso grave que sobe
    if (fugindo) { tensaoT -= dt; if (tensaoT <= 0) { tensaoT = 1.1; const prox = M && M.ativo ? Math.max(0, 1 - M.pos.distanceTo(P.pos) / 20) : 0; if (a) fab(a).tom(null, 48 + prox * 14, 1.6, .05 + prox * .07, 'sawtooth', .2); } }

    // ---- vento aberto uivando baixinho sobre as covas
    if (!naCapela) { ventoCampoT -= dt; if (ventoCampoT <= 0) { ventoCampoT = rand(3, 5); if (a) { const g = a.saida({ x: P.pos.x, y: 3, z: P.pos.z - 10 }, .3); const f = a.burst(a.AC.currentTime, 3, 'bandpass', 520 + (A.raioI || 0) * 300, .9, g); f.frequency.linearRampToValueAtTime(360, a.AC.currentTime + 2.8); a.env(g, a.AC.currentTime, .9, .04 + (A.raioI || 0) * .05, 2); } } }

    // ---- um pássaro noturno solitário, de longe
    passaroT -= dt;
    if (passaroT <= 0 && !fugindo) { passaroT = rand(16, 34); if (a) { const f = fab(a); const px = P.pos.x + rand(-20, 20), pz = P.pos.z - rand(10, 30); for (let i = 0; i < 2; i++) { const tt = i * .25; setTimeout(() => { const a2 = AU(A); if (a2 && A.W.mapa === 'cemiterio') { const g = a2.saida({ x: px, y: 5, z: pz }, .3); const o = a2.AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(900, a2.AC.currentTime); o.frequency.linearRampToValueAtTime(700, a2.AC.currentTime + .3); o.connect(g); a2.env(g, a2.AC.currentTime, .05, .06, .3); o.start(a2.AC.currentTime); o.stop(a2.AC.currentTime + .4); } }, tt * 1000); } } }

    // ---- folhas secas farfalham sob os pés na grama
    if (!naCapela && mov > .02 && P.pos.z > -46) { folhaT -= dt; if (folhaT <= 0) { folhaT = rand(.4, .8); if (a) { const g = a.saida({ x: P.pos.x, y: .1, z: P.pos.z }, .1); a.burst(a.AC.currentTime, .12, 'highpass', 4000, 1, g); a.env(g, a.AC.currentTime, .01, .05, .1); } } }

    // ---- durante a fuga, o eco do sino volta fraco das colinas
    if (fugindo) { sinoEcoT -= dt; if (sinoEcoT <= 0) { sinoEcoT = rand(5, 9); if (a) fab(a).tom({ x: P.pos.x + 30, z: P.pos.z - 20 }, 330, 1.6, .05, 'sine', .5); } }

    // ---- rajadas fortes fazem os bancos queimados estalarem
    bancoT -= dt;
    if ((bancoT <= 0 || rajada) && naCapela) { bancoT = rand(9, 16); if (a) { const g = a.saida({ x: rand(-4, 4) < 0 ? -4 : 4, y: .5, z: -54 - rand(0, 8) }, .4); const o = a.AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(220, a.AC.currentTime); o.frequency.exponentialRampToValueAtTime(120, a.AC.currentTime + .15); o.connect(g); a.env(g, a.AC.currentTime, .003, .12, .18); o.start(a.AC.currentTime); o.stop(a.AC.currentTime + .25); } }

    // ---- a torre do sino range ao vento antes de você tocar
    torreT -= dt;
    if (torreT <= 0 && !fugindo) { torreT = rand(7, 14); const d = Math.hypot(P.pos.x - BELL.x, P.pos.z - BELL.z); if (a && d < 26) fab(a).estrutura({ x: BELL.x, z: BELL.z }, Math.max(.04, .12 * (1 - d / 26))); }

    // ---- colocar um objeto no altar solta um acorde de órgão; os três, um acorde grave e pleno
    const pl = S.placed || 0;
    if (pl > prevPlaced) { if (a) fab(a).orgao(ALTAR, pl >= 3 ? 41 : 55, pl >= 3 ? .16 : .1, pl >= 3 ? 4.2 : 2.6, pl >= 3 ? 0 : rand(-2, 2)); prevPlaced = pl; }

    // ---- quando uma vela de túmulo se apaga ao cavar, ela solta um sopro abafado
    const tc = S.tumulos ? Object.keys(S.tumulos).length : 0;
    if (tc > prevTum) { prevTum = tc; if (a) { const g = a.saida({ x: P.pos.x, y: .5, z: P.pos.z }, .2); a.burst(a.AC.currentTime, .22, 'lowpass', 700, .8, g); a.env(g, a.AC.currentTime, .01, .14, .2); } }
  }));
  return def;
}
