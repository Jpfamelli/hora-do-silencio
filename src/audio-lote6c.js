// =====================================================================
// ÁUDIO — LOTE 6, 2ª RODADA, parte musical (chamado por audio-lote6b.js)
// A trilha que lembra: tema que desafina a cada noite, prelúdio por semente, melodia das suas
// mortes, cantigas da Ana sorteadas, coro das noites vencidas, assobios do Inspetor por humor,
// o título que ganha uma voz por final visto, sons raros de cada clima, goteira com ritmo próprio,
// marchinha de carnaval, réquiem dos créditos, colagem sonora da noite e a fita .wav da noite.
// Som 100% procedural. Tudo dentro de try/catch; calado no QA (X.qa()).
// =====================================================================

const LEGENDAS = {
  l6b_cantiga: { t: 'a Ana cantarola a cantiga da noite, sempre incompleta', imp: 0, cd: 25, cat: 'p', pos: a => a[0] },
  l6b_cantigaFalta: { t: 'a última nota da cantiga soa bem atrás de você: ela chegou', imp: 1, cd: 10, cat: 'p' },
  l6b_assobioHumor: { t: 'um {0} vem de longe', imp: 0, cd: 20, cat: 'p', pos: a => a[1] },
  l6b_coroVencidas: { t: 'um coral de crianças canta ao longe: {0}', imp: 0, cd: 40, cat: 'h' },
  l6b_cantigaNoites: { t: 'crianças cantam {0}: um verso para cada noite sua', imp: 0, cd: 60, cat: 'h' },
  l6b_prelude: { t: 'quatro notas por baixo da voz da Lia: {0}', imp: 0, cd: 60, cat: 'h' },
  l6b_temaNome: { t: 'o tema desta noite era: {0}', imp: 1, cd: 30, cat: 'h' },
  l6b_notaMorte: { t: 'uma nota nova entra na melodia das suas mortes', imp: 1, cd: 8, cat: 'h' },
  l6b_melodiaMortes: { t: 'a caixinha toca, inteira, a melodia das suas mortes', imp: 1, cd: 40, cat: 'h' },
  l6b_requiem: { t: 'o réquiem junta a cantiga, o tema da noite e o hino', imp: 1, cd: 60, cat: 'h' },
  l6b_colagem: { t: 'a colagem junta os sons da sua noite', imp: 1, cd: 30, cat: 'h' },
  l6b_hinoVerso: { t: 'o hino ganhou um verso novo: "{0}"', imp: 1, cd: 40, cat: 'h' },
  l6b_tituloVoz: { t: 'a caixinha do título ganhou uma voz', imp: 0, cd: 120, cat: 'h' },
  l6b_fitaPronta: { t: 'a fita da noite está pronta para baixar', imp: 1, cd: 60, cat: 'h' }
};

// ---- cantigas da Ana (semitons sobre o dó); a última nota é a que falta
const CANTIGAS = [
  [0, 2, 4, 2, 0, -3],
  [7, 5, 4, 2, 4, 0],
  [0, 3, 7, 3, 5, 2],
  [12, 9, 7, 9, 4, 0]
];
// ---- assobios por humor: notas (semitons sobre o dó 5), tempo por nota, descrição
const ASSOBIOS = {
  paciente: { n: [0, -2, -5], dt: .6, txt: 'assobio lento' },
  nervoso: { n: [7, 9, 7], dt: .16, txt: 'assobio agudo e nervoso' },
  metodico: { n: [0, 4, 7], dt: .32, txt: 'assobio em compasso certinho' },
  surdo: { n: [5, 5, 0], dt: .36, txt: 'assobio chapado, sem vibrato' },
  faminto: { n: [-5, 0, -5], dt: .24, txt: 'assobio que escorrega' },
  teimoso: { n: [0, 0, 0, 0], dt: .42, txt: 'assobio teimoso que repete' }
};
// ---- preludios dos temas da noite
const TEMAS = [
  { id: 'espelhos', nome: 'Espelhos' }, { id: 'telefones', nome: 'Telefones' }, { id: 'agua', nome: 'Água' }, { id: 'sombras', nome: 'Sombras' }
];
const VERSOS = ['Silêncio na casa, silêncio no pátio', 'quem fala depois das nove não volta', 'o sino não chama, o sino conta', 'a menina conta e não olha para trás', 'sete velas acesas, nenhuma para você', 'nove badaladas e a casa se fecha'];
const AVISOS_NOME = { espelhos: 'Espelhos', telefones: 'Telefones', agua: 'Água', sombras: 'Sombras' };

// Páscoa (algoritmo anônimo gregoriano) para achar o Carnaval real: 47 dias antes
function carnaval(ano) {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia - 47);
}

export function instalarMusicaL6b(X) {
  const { C, ac, leg, conq, hz, rnd, pick, mkRng, h01, mem, gravar, stats, noiteN, venceu, rejogo, pos3, pontoAoRedor, pontoVizinho, calmo, qa, lsGet } = X;
  X.registrarLegendas(LEGENDAS);
  const OPT = C.OPT;

  const M = {
    log: [], t: 0, titT: 20, titFeito: 0,
    cantCd: 8, conta: 0, falta: false,
    assCd: 60, coroCd: 90, cantNoitesCd: 140, preFeito: false, temaIdx: 0, temaNome: '',
    melCd: 40, melFeita: false, hinoCd: 50, hinoCap: -1,
    piorCap: -1, piorOn: false, capMortes: 0, capPrev: -1,
    climaCd: 80, marchaFeita: false, goteiraT: 0, goteiraPos: null, goteiraI: 0, goteiraPad: [],
    requiemFeito: false, colagemOn: false
  };

  // =================== helpers ===================
  function toque(f, t, dur, peak, tipo, pos, bus, wet, det) {
    const A = ac(); const g = pos ? pos3(pos, 1.4, bus || 'amb', wet ?? .6) : C.saida(null, wet ?? .4, bus || 'mus');
    const o = A.createOscillator(); o.type = tipo || 'sine'; o.frequency.value = f; if (det) o.detune.value = det;
    const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3800; o.connect(lp); lp.connect(g);
    o.start(t); o.stop(t + dur + .05); C.env(g, t, .005, peak, dur);
  }
  function caixinha(notas, t0, passo, peak, pos, base) {
    const b = base || 523.25; notas.forEach((n, i) => { const t = t0 + i * passo; toque(b * Math.pow(2, n / 12), t, 1.1, peak, 'triangle', pos, pos ? 'amb' : 'mus', .5); toque(b * 2 * Math.pow(2, n / 12), t, .5, peak * .35, 'sine', pos, pos ? 'amb' : 'mus', .4); });
  }
  function vozCoro(f0, vogal, t, dur, peak, pos, det) {
    const A = ac(); const F = { a: [800, 1200], e: [500, 1800], i: [300, 2300], o: [500, 900], u: [320, 800] }[vogal] || [800, 1200];
    const g = pos ? pos3(pos, 1.3, 'amb', .85) : C.saida(null, .85, 'amb'); const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0 * .985, t + dur); if (det) o.detune.value = det;
    for (const [ff, a] of [[F[0], 1], [F[1], .5]]) { const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = 6; const bg = A.createGain(); bg.gain.value = a; o.connect(bp); bp.connect(bg); bg.connect(g); }
    C.env(g, t, dur * .3, peak, dur * .75); o.start(t); o.stop(t + dur + .1);
  }
  function assobio(pos, notas, dt, vib, slide) {
    const A = ac(), t = A.currentTime; const g = pos ? pos3(pos, 1.5, 'amb', .7) : C.saida(null, .4, 'amb');
    const o = A.createOscillator(); o.type = 'sine'; const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 2.5; o.connect(bp); bp.connect(g);
    const base = 1046.5; notas.forEach((n, i) => { const f = base * Math.pow(2, n / 12); if (slide && i) o.frequency.linearRampToValueAtTime(f, t + i * dt + dt * .8); else o.frequency.setValueAtTime(f, t + i * dt); });
    const l = A.createOscillator(); l.frequency.value = vib ? 6 : 0; const lg = A.createGain(); lg.gain.value = vib ? 9 : 0; l.connect(lg); lg.connect(o.frequency);
    const tot = notas.length * dt + .15; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .08); g.gain.setValueAtTime(.05, t + tot - .15); g.gain.exponentialRampToValueAtTime(.0001, t + tot);
    o.start(t); l.start(t); o.stop(t + tot + .05); l.stop(t + tot + .05);
  }

  // =================== registro de eventos da noite (colagem e fita) ===================
  function registrar(tipo) {
    if (qa()) return;
    const S = C.S; if (!S) return; M.log.push({ tipo, t: S.tempo || 0 }); if (M.log.length > 120) M.log.splice(0, 20);
  }

  function novaNoite(rng) {
    M.log = []; M.preFeito = false; M.melFeita = false; M.requiemFeito = false; M.hinoCap = -1; M.marchaFeita = false;
    M.cantCd = rnd(5, 12); M.conta = 0; M.assCd = rnd(35, 80); M.coroCd = rnd(70, 140); M.cantNoitesCd = rnd(110, 220); M.climaCd = rnd(60, 130); M.hinoCd = rnd(40, 70);
    const r = rng || Math.random; M.temaIdx = Math.floor(r() * TEMAS.length) % TEMAS.length; M.temaNome = TEMAS[M.temaIdx].nome;
    M.cantVar = Math.floor(r() * CANTIGAS.length) % CANTIGAS.length;
    M.goteiraPad = [0, 0, 0, 0].map(() => .7 + r() * 2.8); M.goteiraI = 0; M.goteiraPos = null; M.goteiraMapa = null;
  }

  // =================== prelúdio do tema da noite ===================
  function preludio() {
    const A = ac(), t = A.currentTime + .2, id = TEMAS[M.temaIdx].id;
    if (id === 'espelhos') [0, 7, 12, 19].forEach((n, i) => toque(1046.5 * Math.pow(2, n / 12), t + i * .9, 2.2, .018, 'sine', null, 'mus', .9));
    else if (id === 'telefones') [0, 0, 0, 0].forEach((n, i) => { toque(1900, t + i * .9, .08, .016, 'square', null, 'mus', .2); toque(2300, t + i * .9 + .1, .08, .016, 'square', null, 'mus', .2); });
    else if (id === 'agua') [0, -5, -2, -7].forEach((n, i) => { const g = C.saida(null, .8, 'mus'), o = A.createOscillator(); o.frequency.setValueAtTime(130 * Math.pow(2, n / 12), t + i * .9); o.frequency.exponentialRampToValueAtTime(70, t + i * .9 + .6); o.connect(g); o.start(t + i * .9); o.stop(t + i * .9 + .7); C.env(g, t + i * .9, .01, .04, .6); });
    else [0, 1, -1, 0].forEach((n, i) => { const g = C.saida(null, .7, 'mus'); C.burst(t + i * .9, 1, 'bandpass', 300 * Math.pow(2, n / 12), 4, g); C.env(g, t + i * .9, .3, .035, .7); });
    leg('l6b_prelude', 'sem nome por enquanto');
  }

  // =================== tick ===================
  function tick(dt, ctx, ex) {
    const A = ac(), S = C.S; if (!A || !S) return;
    M.t += dt;
    if (qa()) return;
    ex = ex || {};
    const AUDL6 = C.AUDL6, ANA = C.ANA, Mn = C.M, P = C.P, W = C.W;
    const noites = noiteN(), jogando = ctx && ctx.jogando;
    // ---- o tema da noite desafina a cada noite (3 centésimos por noite) e acelera/desafina no pior capítulo
    try {
      if (AUDL6 && AUDL6.ajuste) { AUDL6.ajuste.cents = Math.min(60, noites * 3) + (M.piorOn ? -35 : 0); AUDL6.ajuste.tempoMul = M.piorOn ? .86 : 1; }
    } catch (e) {}
    // ---- capítulo mudou: pior noite, alívio, hino por capítulo
    if (S.chapter !== M.capPrev) {
      const m6 = mem();
      if (M.capPrev >= 0 && M.piorOn && M.capMortes === 0 && M.capPrev === M.piorCap && jogando) {
        const t = A.currentTime; for (const [d, f] of [[0, 261.6], [.15, 329.6], [.3, 392]]) { const g = C.saida(null, .9, 'mus'); C.osc('sine', f, t + d, 3, g); C.env(g, t + d, .05, .09, 2.8); }
        leg('l6b_alivio'); m6.mortesCap[M.piorCap] = 0; gravar();
      }
      let pior = -1, pn = 2; for (const k of Object.keys(m6.mortesCap)) if (m6.mortesCap[k] > pn) { pn = m6.mortesCap[k]; pior = +k; }
      M.piorCap = pior; M.piorOn = pior === S.chapter && pior >= 0; M.capMortes = 0; M.capPrev = S.chapter; M.hinoCap = -1;
      if (M.piorOn && jogando) leg('l6b_piorNoite');
    }
    if (S.dead) return;
    M.capMortes = S.capMortes || 0;
    if (!jogando) return;

    // ---- prelúdio do tema no prólogo
    if (!M.preFeito && S.chapter === 0 && S.capT > 6 && rejogo()) { M.preFeito = true; preludio(); }

    // ---- melodia das mortes na fuga do capítulo V
    if (S.chapter === 5 && S.flags && S.flags.sino && !M.melFeita && calmo(ctx) && mem().melodia.length) { M.melCd -= dt; if (M.melCd <= 0) { M.melCd = 35; M.melFeita = true; melodiaMortes(); setTimeout(() => { M.melFeita = false; }, 40000); } }

    // ---- cantiga da Ana: sorteada pela semente, termina com a nota que falta
    if (ANA.ativa) {
      const dA = ctx.dA;
      M.cantCd -= dt;
      if (M.cantCd <= 0 && dA < 24) {
        M.cantCd = rnd(10, 18); const c = CANTIGAS[M.cantVar]; const pos = { x: ANA.pos.x, z: ANA.pos.z };
        caixinha(c.slice(0, -1), A.currentTime, .36, .035, pos, 392 * (S.chapter >= 3 ? 1 : 1)); leg('l6b_cantiga', pos);
      }
      if (M.conta >= 9 && ANA.conta === 0) {
        const c = CANTIGAS[M.cantVar], yaw = P.yaw || 0, pos = { x: P.pos.x + Math.sin(yaw) * 1.4, z: P.pos.z + Math.cos(yaw) * 1.4 };
        caixinha([c[c.length - 1]], A.currentTime, 0, .07, pos, 392); leg('l6b_cantigaFalta');
      }
      M.conta = ANA.conta;
    } else M.conta = 0;

    const clima = (() => { try { return AUDL6 ? AUDL6.climaDaNoite() : 'garoa'; } catch (e) { return 'garoa'; } })();
    const longe = !(ctx.est === 'caca' || ctx.est === 'bote' || ctx.est === 'alerta');

    // ---- assobio do Inspetor entrega o humor da noite
    M.assCd -= dt;
    if (Mn.ativo && longe && ctx.perigo < .5 && !S.hidden && M.assCd <= 0 && ctx.dM > 9 && ctx.dM < 45) {
      M.assCd = rnd(45, 95); const id = (() => { try { return C.humor && C.humor(); } catch (e) { return null; } })(), a = ASSOBIOS[id];
      if (a) {
        const pos = { x: Mn.pos.x, z: Mn.pos.z };
        assobio(pos, a.n, a.dt, id !== 'surdo', id === 'faminto'); leg('l6b_assobioHumor', a.txt, pos);
        const m6 = mem(); if (!m6.humores[id]) { m6.humores[id] = 1; gravar(); const nh = Object.keys(m6.humores).length; C.toast('Assobio anotado no caderno: ' + nh + ' de 6 humores do Inspetor reconhecidos.'); if (nh >= 3) conq('l6b_ouvido'); }
      }
    }

    // ---- coro das noites vencidas e cantiga que conta as noites
    M.coroCd -= dt;
    if (M.coroCd <= 0 && longe && ctx.perigo < .4 && !S.hidden) {
      M.coroCd = rnd(80, 150);
      const concl = stats().concluidas || 0;
      if (concl > 0) {
        const n = Math.min(34, concl), vozes = Math.min(9, 1 + Math.ceil(Math.sqrt(n) * 1.3)), pos = pontoAoRedor(10, 18), t = A.currentTime, f0 = 330;
        const notas = [0, 2, 4, 2, 0]; for (let i = 0; i < notas.length; i++) for (let v = 0; v < vozes; v++) vozCoro(f0 * Math.pow(2, notas[i] / 12) * (v % 3 === 0 ? 1 : v % 3 === 1 ? .5 : 2), pick(['a', 'o', 'u']), t + i * .7 + v * .03, .8, .018 + Math.min(.02, n * .0005), pos, rnd(-14, 14) * (1 + v * .1));
        leg('l6b_coroVencidas', n === 1 ? 'uma criança sozinha' : `${n} vozes, uma por noite vencida`);
        if (ex.salaMuda && Math.random() < .5) setTimeout(() => { try { leg('l6b_coroSala', ex.salaMuda); } catch (e) {} }, 3800);
      }
    }
    M.cantNoitesCd -= dt;
    if (M.cantNoitesCd <= 0 && noites >= 1 && (W.mapa === 'terreo' || W.mapa === 'superior') && longe) {
      M.cantNoitesCd = rnd(130, 230);
      const versos = Math.min(12, noites), extra = Math.max(0, noites - 12), fator = Math.max(.7, Math.pow(.97, extra)), quieta = P.noiseR < 2.5 && !(Mn.ativo && ctx.dM < 14);
      if (!(Mn.ativo && ctx.dM < 10)) {
        const pos = pontoAoRedor(9, 15), t = A.currentTime, vol = quieta ? .026 : .012;
        for (let v = 0; v < versos; v++) [0, 3, 5, 3].forEach((n, i) => vozCoro(392 * fator * Math.pow(2, n / 12), 'a', t + (v * 1.6 + i * .38) / fator, .45 / fator, vol, pos, rnd(-8, 8)));
        leg('l6b_cantigaNoites', versos === 1 ? 'um verso' : versos + ' versos');
      }
    }

    // ---- hino: um verso novo por capítulo
    if (S.chapter >= 1 && M.hinoCap !== S.chapter && rejogo()) {
      M.hinoCd -= dt;
      if (M.hinoCd <= 0 && longe && ctx.perigo < .4 && !S.hidden) {
        M.hinoCd = rnd(40, 70); M.hinoCap = S.chapter;
        const verso = VERSOS[(S.chapter - 1) % VERSOS.length], t = A.currentTime, g = C.saida(null, .8, 'amb'), notas = [196, 261.6, 246.9, 196, 220, 196].slice(0, 3 + (S.chapter % 3));
        notas.forEach((f, i) => { const o = A.createOscillator(); o.type = 'triangle'; o.frequency.value = f; const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1000; o.connect(lp); lp.connect(g); o.start(t + i * .5); o.stop(t + i * .5 + .55); });
        C.env(g, t, .2, .028, notas.length * .5 + .6); leg('l6b_hinoVerso', verso);
        const m6 = mem(); m6.versos = m6.versos || {}; if (!m6.versos[S.chapter]) { m6.versos[S.chapter] = 1; gravar(); C.toast('Versos do hino ouvidos: ' + Object.keys(m6.versos).length + ' de ' + VERSOS.length + '.'); }
      }
    }

    // ---- sons raros de cada clima
    M.climaCd -= dt;
    if (M.climaCd <= 0 && longe && ctx.perigo < .35 && !S.hidden && !ctx.prende) {
      M.climaCd = rnd(90, 190); climaRaro(clima);
    }

    // ---- goteira com ritmo próprio (túneis)
    if (W.mapa === 'tuneis') {
      if (M.goteiraMapa !== W.mapa || !M.goteiraPos) { M.goteiraMapa = W.mapa; M.goteiraPos = pontoAoRedor(5, 9); M.goteiraT = 1; }
      M.goteiraT -= dt;
      if (M.goteiraT <= 0 && longe) {
        const fora = Math.random() < .08; M.goteiraT = fora ? rnd(.25, .5) : M.goteiraPad[M.goteiraI++ % M.goteiraPad.length];
        const g = pos3(M.goteiraPos, .2, 'amb', .9), t = A.currentTime, o = A.createOscillator(); o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(500, t + .08); o.connect(g); o.start(t); o.stop(t + .12); C.env(g, t, .003, .04, .1);
        if (fora) leg('l6b_goteira', M.goteiraPos);
      }
    } else M.goteiraPos = null;

    // ---- marchinha de carnaval no rádio do prólogo
    if (W.mapa === 'estrada' && !M.marchaFeita && S.capT > 22) {
      M.marchaFeita = true; const hoje = new Date(), c = carnaval(hoje.getFullYear());
      if (Math.abs((hoje - c) / 86400000) <= 3) marchinha();
    }
  }

  function marchinha() {
    const A = ac(), t = A.currentTime, notas = [0, 0, 2, 4, 4, 2, 0, 4, 2, 2, 0, -3]; const g = C.saida(null, .5, 'mus');
    notas.forEach((n, i) => { const o = A.createOscillator(); o.type = 'square'; o.frequency.value = 392 * Math.pow(2, n / 12); o.detune.value = -i * 7; const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 1; o.connect(bp); bp.connect(g); o.start(t + i * .55); o.stop(t + i * .55 + .4); });
    C.env(g, t, .3, .03, notas.length * .55); leg('l6b_marchinha');
    try { C.SFX.estatica && C.SFX.estatica(1.2); } catch (e) {}
  }

  function climaRaro(clima) {
    const A = ac(), t = A.currentTime, pos = pontoAoRedor(14, 26);
    if (clima === 'garoa') { // coruja
      const g = pos3(pos, 3, 'amb', .8); [0, .7].forEach((d, i) => { const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(i ? 380 : 420, t + d); o.frequency.linearRampToValueAtTime(i ? 340 : 400, t + d + .35); o.connect(g); o.start(t + d); o.stop(t + d + .4); }); C.env(g, t, .08, .04, 1.2); leg('l6b_sonsRaros', 'uma coruja pia no beiral', pos);
    } else if (clima === 'vento') { // cão
      const g = pos3(pos, 1, 'amb', .9), o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(260, t); o.frequency.linearRampToValueAtTime(520, t + .9); o.frequency.linearRampToValueAtTime(330, t + 2.2); const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 2; o.connect(bp); bp.connect(g); o.start(t); o.stop(t + 2.4); C.env(g, t, .3, .035, 2); leg('l6b_sonsRaros', 'um cão uiva lá embaixo, na estrada', pos);
    } else if (clima === 'cigarras') { // cincerro
      for (let k = 0; k < 4; k++) { const g = pos3(pos, 1, 'amb', .7); C.osc('triangle', 1250 + k * 40, t + k * .5, .4, g); C.env(g, t + k * .5, .003, .03, .35); } leg('l6b_sonsRaros', 'um cincerro de vaca tilinta, sozinho', pos);
    } else if (clima === 'tempestade') { // trovão abafado e vidraça
      const g = C.saida(null, .8, 'amb'); C.burst(t, 1.6, 'lowpass', 180, 1, g, 0); C.env(g, t, .15, .12, 1.8); const g2 = pos3(pos, 1.5, 'amb', .4); C.burst(t + .3, .5, 'bandpass', 1400, 8, g2); C.env(g2, t + .3, .01, .03, .4); leg('l6b_sonsRaros', 'o trovão sacode as vidraças da casa', pos);
    } else { // quietude: relógio de parede
      for (let k = 0; k < 6; k++) { const g = pos3(pos, 1.5, 'amb', .5); C.burst(t + k * 1, .02, 'bandpass', 2400 + (k % 2) * 400, 6, g); C.env(g, t + k * 1, .001, .06, .04); } leg('l6b_sonsRaros', 'um relógio de parede tiquetaqueia na casa quieta', pos);
    }
  }

  // =================== melodia das mortes ===================
  const PENTA = [0, 2, 4, 7, 9, 12];
  function melodiaMortes() {
    const A = ac(), m6 = mem(); if (!m6.melodia.length) return;
    caixinha(m6.melodia.map(i => PENTA[i % PENTA.length]), A.currentTime, .42, .045, null, 440);
    leg('l6b_melodiaMortes');
  }
  function aoMorte(u) {
    try {
      const m6 = mem(), A = ac(); const rng = mkRng(m6.contaSeed + '|' + (m6.mortes || 0));
      if (m6.melodia.length < 16) { const idx = Math.floor(rng() * PENTA.length); m6.melodia.push(idx); gravar(); setTimeout(() => { try { toque(440 * Math.pow(2, PENTA[idx] / 12), ac().currentTime, 1.4, .06, 'triangle', null, 'mus', .8); leg('l6b_notaMorte'); } catch (e) {} }, 2600); }
    } catch (e) {}
  }

  // =================== título: a caixinha que ganha uma voz por final visto ===================
  function titulo(dt) {
    const A = ac(); if (!A || qa()) return; M.titT -= dt; if (M.titT > 0) return;
    M.titT = rnd(32, 55);
    const st = stats(), finais = Object.keys(st.finais || {}).length, bonus = (st.capsS > 0 ? 1 : 0) + ((lsGet('hora-silencio-l6', {}) || {}).venceu > 0 ? 1 : 0);
    const vozes = Math.min(7, finais + bonus); if (vozes < 1) return;
    let nConq = 0; try { nConq = Object.keys(lsGet((C.KEYS && C.KEYS.CONQ_KEY) || 'hora-silencio-v2-conq', {}) || {}).length; } catch (e) {}
    const t = A.currentTime + .1, melodia = [0, 4, 7, 4, 12, 7, 4, 0];
    const completo = vozes >= 7, fases = completo ? 2 : 1;
    for (let f = 0; f < fases; f++) {
      const o = f * 6;
      if (vozes >= 1) melodia.forEach((n, i) => toque(523.25 * Math.pow(2, n / 12), t + o + i * .5, 1.2, .018, 'triangle', null, 'mus', .6)); // caixinha
      if (vozes >= 2) toque(220, t + o, 4, .02, 'sine', null, 'mus', .9), toque(220 * 1.5, t + o + 2, 3.5, .012, 'sine', null, 'mus', .9); // sino distante
      if (vozes >= 3) [0, 4, 7].forEach((n, i) => vozCoro(262 * Math.pow(2, n / 12), 'o', t + o + 1 + i * .25, 2.6, .012, null, rnd(-9, 9))); // coro
      if (vozes >= 4) [0, 7].forEach(n => toque(130.8 * Math.pow(2, n / 12), t + o, 4.5, .014, 'sawtooth', null, 'mus', .7)); // harmônio
      if (vozes >= 5) toque(880, t + o + 2, 3, .008, 'sawtooth', null, 'mus', .6, 12); // violino
      if (vozes >= 6) { const g = C.saida(null, .8, 'mus'); C.burst(t + o + 3, 2.4, 'bandpass', 1800, 6, g); C.env(g, t + o + 3, .6, .008, 1.8); } // sussurro
      if (vozes >= 7) melodia.forEach((n, i) => toque(1046.5 * Math.pow(2, n / 12), t + o + i * .5 + .25, .8, .011, 'sine', null, 'mus', .6)); // celesta
      // vozes extras pelas conquistas: coral, sino, harmônio
      if (nConq >= 10) vozCoro(196, 'a', t + o + 2, 3, .008, null, 6);
      if (nConq >= 25) toque(440, t + o + 4, 3, .01, 'sine', null, 'mus', .9);
      if (nConq >= 50) toque(98, t + o, 5, .014, 'sawtooth', null, 'mus', .7, -9);
    }
  }

  // =================== créditos: réquiem, colagem, fita .wav ===================
  function requiem(tipo) {
    const A = ac(); if (!A || qa()) return;
    const st = stats(), finais = Object.keys(st.finais || {}).length + 1, inst = Math.min(4, finais), t = A.currentTime + .6;
    const c = CANTIGAS[M.cantVar || 0], tema = [0, 3, 7, 3, 5, 2];
    caixinha(c, t, .55, .04, null, 392);
    tema.forEach((n, i) => toque(196 * Math.pow(2, n / 12), t + i * .9, 1.6, .028, 'triangle', null, 'mus', .8));
    [0, 3, 1, 0].forEach((n, i) => toque(196 * Math.pow(2, n / 12), t + 6 + i * .55, .7, .03, 'triangle', null, 'mus', .7));
    if (inst >= 2) [0, 7, 3].forEach((n, i) => vozCoro(262 * Math.pow(2, n / 12), 'o', t + 2 + i * 1.5, 3, .014, null, rnd(-9, 9)));
    if (inst >= 3) toque(110, t, 9, .02, 'sine', null, 'mus', .9);
    if (inst >= 4) caixinha([12, 9, 7, 4, 0], t + 4, .5, .028, null, 523.25);
    leg('l6b_requiem');
    leg('l6b_temaNome', M.temaNome);
  }

  function colagem() {
    const A = ac(); if (!A || M.colagemOn) return; M.colagemOn = true;
    const log = M.log.length ? M.log : [{ tipo: 'passo', t: 0 }, { tipo: 'porta', t: 5 }, { tipo: 'resp', t: 9 }];
    const t0 = A.currentTime + .2, n = Math.min(40, log.length), passo = 20 / Math.max(6, n);
    // base: o Inspetor respirando por baixo
    const gb = C.saida(null, .5, 'mus'); C.burst(t0, 20, 'lowpass', 220, 1, gb); C.env(gb, t0, 4, .03, 16);
    for (let i = 0; i < n; i++) {
      const e = log[Math.floor(i * log.length / n)], t = t0 + i * passo, pan = A.createStereoPanner ? A.createStereoPanner() : null; const g = C.saida(null, .5, 'mus');
      if (e.tipo === 'passo') { C.burst(t, .1, 'lowpass', 500, 1, g); C.env(g, t, .004, .12, .1); }
      else if (e.tipo === 'porta') { C.burst(t, .3, 'lowpass', 260, 1, g, 0); C.env(g, t, .01, .2, .25); }
      else if (e.tipo === 'resp') { const f = C.burst(t, .7, 'bandpass', 1200, 1.2, g); f.frequency.linearRampToValueAtTime(1700, t + .4); C.env(g, t, .1, .09, .6); }
      else if (e.tipo === 'vidro') { C.burst(t, .25, 'highpass', 3200, 1.2, g); C.env(g, t, .002, .12, .22); }
      else { C.osc('sine', 196, t, 1.5, g); C.env(g, t, .01, .1, 1.4); }
    }
    leg('l6b_colagem'); setTimeout(() => { M.colagemOn = false; }, 21000);
  }

  function escreverWav(buf) {
    const d = buf.getChannelData(0), n = d.length, sr = buf.sampleRate, out = new DataView(new ArrayBuffer(44 + n * 2));
    const w = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
    w(0, 'RIFF'); out.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true); out.setUint32(24, sr, true); out.setUint32(28, sr * 2, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const s = Math.max(-1, Math.min(1, d[i])); out.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
    return new Blob([out], { type: 'audio/wav' });
  }
  const LADOS = ['Lado A: a casa acordada', 'Lado B: o que ficou no corredor', 'Lado A: nove batidas', 'Lado B: a menina conta', 'Lado A: chuva na serra'];
  async function baixarFita() {
    const Off = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!Off) return;
    const sr = 22050, dur = 30, off = new Off(1, sr * dur, sr);
    const ruidoB = off.createBuffer(1, sr * 2, sr); const rd = ruidoB.getChannelData(0); for (let i = 0; i < rd.length; i++) rd[i] = Math.random() * 2 - 1;
    const O = (tipo, f, t, d, pico) => { const o = off.createOscillator(), g = off.createGain(); o.type = tipo; o.frequency.value = f; o.connect(g); g.connect(off.destination); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(pico, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.start(t); o.stop(t + d + .05); };
    const R = (t, d, ftipo, f, pico) => { const s = off.createBufferSource(), fl = off.createBiquadFilter(), g = off.createGain(); s.buffer = ruidoB; fl.type = ftipo; fl.frequency.value = f; s.connect(fl); fl.connect(g); g.connect(off.destination); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(pico, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + d); s.start(t); s.stop(t + d + .05); };
    const S = C.S, c = CANTIGAS[M.cantVar || 0];
    // tema da semente (3 vozes), badaladas, passos no ritmo medido, respiração e cantiga da Ana
    [0, 3, 7, 3, 5, 2, 0, 3].forEach((n, i) => { O('triangle', 196 * Math.pow(2, n / 12), 1 + i * 1.6, 1.8, .08); O('sine', 98 * Math.pow(2, n / 12), 1 + i * 1.6, 1.8, .06); });
    for (let i = 0; i < 9; i++) { const t = 15 + i * 1.1; O('sine', 196, t, 2, .12 - i * .006); O('sine', 392 * 1.19, t, 1.5, .05); }
    const ts = X.L.passosT, med = ts.length > 3 ? (ts[ts.length - 1] - ts[0]) / (ts.length - 1) : .55;
    for (let t = 2; t < 14; t += Math.max(.3, Math.min(1, med))) R(t, .09, 'lowpass', 520, .1);
    for (let i = 0; i < 5; i++) R(5 + i * 5.2, .9, 'bandpass', 1100 + i * 80, .05);
    c.forEach((n, i) => O('triangle', 392 * 2 * Math.pow(2, n / 12), 24 + i * .6, 1, .06));
    const buf = await off.startRendering(); const blob = escreverWav(buf);
    const nome = LADOS[Math.floor(h01((S.semente || 'x') + '|lado') * LADOS.length) % LADOS.length];
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'fita-da-noite-' + (S.semente || 'noite') + '.wav'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
    C.toast(`Fita salva: "${nome}"`);
  }

  function botoesFinal() {
    try {
      const box = document.getElementById('e-stats'); if (!box || document.getElementById('l6b-fita')) return;
      const w = document.createElement('div'); w.id = 'l6b-fita'; w.style.cssText = 'margin:.8em 0;display:flex;gap:.6em;flex-wrap:wrap;justify-content:center';
      const mk = (txt, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = txt; b.onclick = e => { e.preventDefault(); e.stopPropagation(); try { fn(); } catch (er) {} }; w.appendChild(b); };
      mk('Ouvir a colagem sonora da noite (20 s)', () => { try { C.iniciarAudio && C.iniciarAudio(); } catch (e) {} colagem(); });
      mk('Baixar a fita desta noite (.wav)', () => { baixarFita(); });
      box.insertAdjacentElement('afterend', w); leg('l6b_fitaPronta');
    } catch (e) {}
  }
  function final(tipo) {
    if (qa()) return;
    const atraso = tipo ? 4200 : 2200;
    setTimeout(() => { try { requiem(tipo); botoesFinal(); } catch (e) {} }, atraso);
  }

  return { tick, titulo, final, aoMorte, novaNoite, registrar, aposNona: () => {}, colagem, baixarFita, _M: M, _t: { preludio, requiem, marchinha, climaRaro, melodiaMortes, assobio, caixinha, vozCoro, botoesFinal } };
}
