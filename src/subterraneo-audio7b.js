// Lote 7 (2ª leva) — som e atmosfera do subterrâneo: eco que mede o espaço, canos que cantam, silêncio como arma,
// cemitério com corvos, cruzes que assobiam, pá que muda de som, órgão que cresce com cada túmulo e o amanhecer do final.
// Tudo procedural (WebAudio do motor), ligado por tratadores no W.tick do mapa: ao trocar de mapa o tick para e os sons
// (one-shots curtos) terminam sozinhos. Sons de ambiência vão no barramento 'amb' (cai primeiro quando há muitas vozes,
// respeita a opção de volume de ambiente e o silêncio repentino do motor).
import { fab, segura } from './subterraneo-audio7.js';
import { HINO } from './audio-mundo.js';

const AU = A => { try { return A.audio ? A.audio() : null; } catch (e) { return null; } };
const P3 = (p, y = 1) => p ? { x: p.x, y: p.y ?? y, z: p.z } : null;
const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const sd = (a, p, wet = .3, y) => a.saida(P3(p, y), wet, 'amb');
const tons = [130.81, 164.81, 196];

// ---------------------------------------------------------------------
// legendas de som próprias (legenda de sons da interface; o motor só desenha se o jogador ligou)
// ---------------------------------------------------------------------
const LEG = {
  a7Eco3: { t: 'o seu barulho volta três vezes, de lugares diferentes', imp: 1, cd: 5, cat: 'p' },
  a7Dobra: { t: 'o eco devolve dois passos para um', imp: 1, cd: 20, cat: 'p', pos: a => a[0] },
  a7Passo: { t: 'um passo que não é seu continua depois de você parar', imp: 1, cd: 30, cat: 'p', pos: a => a[0] },
  a7Fecha: { t: 'a rocha estala e pó cai atrás de você', imp: 0, cd: 10, pos: a => a[0] },
  a7Fole: { t: 'o compressor sopra, grave, nas paredes', imp: 0, cd: 12 },
  a7CompPara: { t: 'o compressor desliga com um suspiro', imp: 1, cd: 30, cat: 'h' },
  a7Vale: { t: 'passos do outro lado da parede, no vale do ventilador', imp: 1, cd: 14, cat: 'p', pos: a => a[0] },
  a7Pop: { t: 'o ouvido estala e o mundo abre', imp: 0, cd: 20 },
  a7Canta: { t: 'um cano canta uma nota baixa', imp: 0, cd: 25, cat: 'h', pos: a => a[0] },
  a7Balde: { t: 'gotas em baldes de lata tocam uma melodia', imp: 1, cd: 30, cat: 'h', pos: a => a[0] },
  a7Vapor: { t: 'vapor assobia agudo, cobrindo os passos', imp: 1, cd: 6, cat: 'p', pos: a => a[0] },
  a7SinoAfog: { t: 'um sino afogado soa debaixo d\'água', imp: 1, cd: 4, cat: 'p', pos: a => a[0] },
  a7Duto: { t: 'vozes e passos vazam pela grade do teto', imp: 1, cd: 25, cat: 'h', pos: a => a[0] },
  a7Corrente: { t: 'uma corrente de ar assobia numa fresta', imp: 0, cd: 18, cat: 'h', pos: a => a[0] },
  a7Cala: { t: 'a água do canal cala de repente', imp: 1, cd: 30, cat: 'p' },
  a7Gush: { t: 'a água volta com força, rugindo', imp: 1, cd: 30, cat: 'p' },
  a7Torrente: { t: 'a água sobe com um rugido', imp: 1, cd: 8, cat: 'p' },
  a7Chape: { t: 'algo anda na água, em compasso', imp: 1, cd: 12, cat: 'p', pos: a => a[0] },
  a7CanoBate: { t: 'batidas num cano, em compasso', imp: 0, cd: 14, cat: 'h' },
  a7Respiro: { t: 'o ar solta: ele perdeu você', imp: 1, cd: 15, cat: 'h' },
  a7Corvos: { t: 'um bando de corvos explode em voo, grasnando', imp: 1, cd: 4, cat: 'p', pos: a => a[0] },
  a7VentoCala: { t: 'o vento nas cruzes se cala de repente', imp: 1, cd: 10, cat: 'p' },
  a7Cruz: { t: 'uma cruz de ferro assobia ao vento', imp: 0, cd: 20, cat: 'h', pos: a => a[0] },
  a7Sussurro: { t: 'uma sílaba sussurrada, vindo de um túmulo', imp: 1, cd: 6, cat: 'h', pos: a => a[0] },
  a7SinoTerra: { t: 'um sino toca abafado debaixo da terra', imp: 1, cd: 15, cat: 'h', pos: a => a[0] },
  a7Pa: { t: 'a pá bate em madeira oca', imp: 1, cd: 5, cat: 'h', pos: a => a[0] },
  a7PaLonge: { t: 'outra pá cava ao longe e responde', imp: 1, cd: 8, cat: 'p', pos: a => a[0] },
  a7Orgao: { t: 'um órgão distante soma mais uma nota', imp: 1, cd: 10, cat: 'h' },
  a7Porta: { t: 'a porta da capela vibra', imp: 1, cd: 20, cat: 'h', pos: a => a[0] },
  a7Badalo: { t: 'o sino bate sem badalo e uma vela apaga', imp: 1, cd: 2, cat: 'p', pos: a => a[0] },
  a7Hino: { t: 'o órgão toca o primeiro compasso do hino', imp: 1, cd: 30, cat: 'h' },
  a7Trovao: { t: 'o trovão chega cada vez mais depressa', imp: 1, cd: 6, cat: 'p' },
  a7Amanhecer: { t: 'o primeiro amanhecer: pássaros, galo e um sino de seis horas', imp: 1, cd: 60, cat: 'h' }
};
const reg = A => { try { const d = A.legendas; if (d) for (const [k, v] of Object.entries(LEG)) if (!d[k]) d[k] = v; } catch (e) {} };
const leg = (A, k, p) => { try { A.SFX[k](p ? P3(p) : null); } catch (e) {} };
// toca depois de ms, só se ainda estamos no mesmo mapa e a Lia está viva; devolve o áudio ao callback
const depois = (A, mapa, ms, fn) => setTimeout(() => { try { if (A.W.mapa === mapa && !A.S.dead) { const a = AU(A); if (a) fn(a); } } catch (e) {} }, ms);

// ---------------------------------------------------------------------
// instrumentos novos (somados aos de subterraneo-audio7.js)
// ---------------------------------------------------------------------
const cache = new WeakMap();
function K(a) {
  let k = cache.get(a.AC); if (k) return k;
  const AC = a.AC, now = () => AC.currentTime, base = fab(a);
  const tomE = (pos, f, dur, vol, tipo = 'sine', wet = .4, ataque = .01) => { const t = now(), g = sd(a, pos, wet); a.osc(tipo, f, t, dur, g); a.env(g, t, ataque, vol, Math.max(.02, dur - ataque)); };
  const ruidoE = (pos, dur, filtro, f, q, vol, wet = .3, ataque = .01, y) => { const t = now(), g = sd(a, pos, wet, y); a.burst(t, dur, filtro, f, q, g); a.env(g, t, ataque, vol, dur); };
  // sino de parciais inarmônicos; com lp vira sino afogado/enterrado
  const sino = (pos, f, vol, dur, lp, wet = .6) => {
    const t = now(), g = sd(a, pos, wet), h = AC.createGain(); let dest = g;
    if (lp) { const fl = AC.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; fl.connect(g); dest = fl; }
    h.connect(dest);
    for (const [m, v] of [[1, 1], [2.4, .5], [3, .35], [4.07, .22]]) { const o = AC.createOscillator(); o.type = 'sine'; o.frequency.value = f * m; const og = AC.createGain(); og.gain.value = v; o.connect(og); og.connect(h); o.start(t); o.stop(t + dur + .1); }
    a.env(g, t, .006, vol, dur);
  };
  k = {
    ...base, tomE, ruidoE, sino,
    // passo que volta pelas paredes; vol cresce com a corrida
    passoEco(pos, vol, grave = false) { ruidoE(pos, .15, 'lowpass', grave ? 360 : 520, 1, vol, .75, .01, .1); },
    // "bong" de tubo: curto em passagem estreita, longo em galeria
    bong(pos, f, dur, vol) { tomE(pos, f, dur, vol, 'triangle', .5, .003); tomE(pos, f * 2.76, dur * .5, vol * .4, 'sine', .4, .003); },
    // parede falsa: um "tum" oco com reverb de câmara
    oco(pos, vol) { tomE(pos, 108, .6, vol, 'sine', .9, .006); ruidoE(pos, .3, 'lowpass', 230, 1, vol * .7, .9, .01); },
    // golpe da pá por camada de terra: 0 terra mole, 1 raízes, 2 pedra, 3 madeira oca
    pa(pos, camada, vol) {
      if (camada === 0) ruidoE(pos, .17, 'lowpass', 420, .8, vol, .3, .006);
      else if (camada === 1) { ruidoE(pos, .24, 'bandpass', 1500, 3, vol * .8, .3, .004); ruidoE(pos, .1, 'lowpass', 300, 1, vol * .6, .3, .004); }
      else if (camada === 2) { tomE(pos, 1050, .2, vol * .7, 'triangle', .4, .001); ruidoE(pos, .06, 'highpass', 3000, 1, vol * .5, .3, .001); }
      else { tomE(pos, 150, .45, vol * 1.1, 'sine', .8, .004); tomE(pos, 92, .5, vol * .8, 'sine', .8, .004); ruidoE(pos, .12, 'lowpass', 200, 1, vol * .5, .8, .004); }
    },
    caw(pos, vol) {
      const t = now(), g = sd(a, pos, .35, 4), o = AC.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(430 + Math.random() * 90, t); o.frequency.exponentialRampToValueAtTime(260, t + .28);
      const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 2; o.connect(bp); bp.connect(g); a.env(g, t, .02, vol, .28); o.start(t); o.stop(t + .35);
    },
    asas(pos, dur, vol) { for (let i = 0; i < 7; i++) { const t = now() + i * dur / 7, g = sd(a, pos, .3, 3); a.burst(t, .07, 'highpass', 1700 + Math.random() * 900, 1, g); a.env(g, t, .004, vol * (1 - i / 9), .07); } },
    // vento passando numa cruz de ferro: nota fina com vibrato lento
    cruzNota(pos, f, vol) {
      const t = now(), g = sd(a, pos, .5, 1.6), o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f, t);
      const lfo = AC.createOscillator(), lg = AC.createGain(); lfo.frequency.value = 5; lg.gain.value = f * .012; lfo.connect(lg); lg.connect(o.frequency);
      o.connect(g); a.env(g, t, .5, vol, 1.1); o.start(t); o.stop(t + 1.7); lfo.start(t); lfo.stop(t + 1.7);
      ruidoE(pos, 1.5, 'bandpass', f, 6, vol * .4, .5, .5, 1.6);
    },
    sino3(pos, f, vol, n) { for (let i = 0; i < n; i++) { const tt = i * .09; setTimeout(() => { try { if (AU({ audio: () => a })) tomE(pos, f * (1 + i * .12), .5, vol, 'triangle', .5, .002); } catch (e) {} }, tt * 1000); } },
    // sílaba sussurrada com dois formantes
    silaba(pos, f1, f2, vol) {
      const t = now();
      for (const [dt, ff] of [[0, f1], [.26, f2]]) { const g = sd(a, pos, .6, 1.1); a.burst(t + dt, .24, 'bandpass', ff, 7, g); a.burst(t + dt, .24, 'bandpass', ff * 2.3, 9, g); a.env(g, t + dt, .05, vol, .2); }
    },
    trovaoGrave(vol) { const t = now(), g = a.saida(null, .2, 'amb'); a.burst(t, 2.6, 'lowpass', 110, 1, g); a.env(g, t, .15, vol, 2.4); tomE(null, 38, 2.4, vol * .7, 'sine', 0, .2); },
    suspiro(vol) { ruidoE(null, 1.6, 'bandpass', 520, 1, vol, 0, .6); },
    // zumbido de pressão/ar parado
    pressao(f, vol, dur = 1.8) { tomE(null, f, dur, vol, 'sine', 0, .5); }
  };
  cache.set(a.AC, k); return k;
}

// música de tensão: dois tons em segunda menor que crescem com o medo; e o suspiro quando o Inspetor perde você
function tensao(A, a, dt, st) {
  const M = A.M, S2 = A.S, k = a ? K(a) : null;
  st.t -= dt;
  const medo = cl((S2.fear || 0) / 100, 0, 1);
  if (st.t <= 0) {
    st.t = 1.7;
    if (k && medo > .25) { const v = .004 + medo * medo * .05; k.tomE(null, 110, 2.2, v, 'sine', 0, .8); k.tomE(null, 116.5, 2.2, v * .9, 'sine', 0, .8); if (medo > .75) k.tomE(null, 55, 2.2, v * 1.2, 'sawtooth', 0, .9); }
  }
  const est = M && M.ativo ? M.state : null;
  if ((st.prev === 'caca' || st.prev === 'procura') && est === 'patrulha') { if (k) k.suspiro(.08); leg(A, 'a7Respiro'); }
  st.prev = est;
}

// =====================================================================
// TÚNEIS
// =====================================================================
export function tuneis(A, S, def, extra = {}) {
  reg(A);
  const nivelF = extra.nivel || (() => 0), valvIts = extra.valvIts || [];
  const rand = A.rand, T3 = A.THREE, MAT = A.MAT;
  let mask = 1; const r0 = def.ruidoMul; def.ruidoMul = () => (r0 ? r0() : 1) * mask;
  const lastP = new T3.Vector3().copy(A.P.pos), lastM = new T3.Vector3(), fwd = new T3.Vector3();
  const vis = new Set(); let salaAnt = null;
  let stepAcc = 0, walk = 0, camT = 0, dobraN = 0, cT = rand(0, 8), fanT = rand(0, 12), fanS = 0, valeT = 0, valeLeg = 0, pres = { t: 0, ok1: false, ok2: false };
  let compOff = false, cantT = {}, baldeT = rand(9, 14), vaporT = -1, vaporS = 0, vaporAv = false, sinoT = 0, gal = [{ q: 0, on: false }, { q: 0, on: false }], dutoQ = 0, dutoOn = false;
  let aguaT = 0, corrT = rand(2, 7), pressT = 0, canalT = 0, calaCt = 0, calaFase = 0, calaT = 0, nivAnt = nivelF(), torT = 0, chapeT = 0, tapT = 0, st = { t: 2, prev: null }, silT = 0, ecoAprox = null, caçaAnt = false;
  const segredos = [{ x: -27, z: -24.2 }, { x: 2, z: -46.5 }];
  const focos = [
    { x: -23, z: -18, o: { x: 23, z: -18 }, fl: 'a7GalO', txt: 'Fica quietinha, Lia. A água só sobe quando a ordem erra.' },
    { x: 23, z: -18, o: { x: -23, z: -18 }, fl: 'a7GalL', txt: 'Quando o cano parar de bater, é porque ele está escutando você.' }
  ];

  // ----- objetos novos: grade de ventilação no teto, válvula de vapor e a placa dos canos
  try {
    A.box(.9, .05, .9, MAT.ferrugem, 0, 2.77, -12, A.W.grupo, false);
    for (let i = -2; i <= 2; i++) A.box(.025, .06, .84, MAT.preto, i * .17, 2.745, -12, A.W.grupo, false);
  } catch (e) {}
  try {
    const gv = new T3.Group(); gv.position.set(9, 1.3, -37.9); A.W.grupo.add(gv);
    A.cyl(.08, .08, .3, MAT.ferrugem, 0, 0, .1, 8, gv).rotation.x = Math.PI / 2;
    const roda = new T3.Mesh(new T3.TorusGeometry(.24, .035, 6, 14), MAT.ferrugem); roda.position.z = .22; gv.add(roda);
    A.box(.5, .035, .035, MAT.ferrugem, 0, 0, .22, gv);
    const itV = A.interact(gv, () => A.S.flags.a7Vapor ? 'A válvula de vapor já está aberta.' : '<b>E</b>Abrir a válvula de vapor (segure)', () => {
      if (A.S.flags.a7Vapor) return;
      A.S.flags.a7Vapor = true; vaporT = 0; vaporAv = false; A.emitNoise(9, -37, 7); leg(A, 'a7Vapor', { x: 9, z: -37.9 });
      A.toast('O vapor assobia alto. Ninguém ouve seus passos... mas ele ouve o assobio.');
    });
    if (itV) { itV.hold = 1.6; itV.ruido = 5; itV.som = null; itV.pode = () => !A.S.flags.a7Vapor; }
  } catch (e) {}
  try {
    const mat = new T3.MeshStandardMaterial({ map: A.textoTex([{ t: 'BATIDAS NO CANO', tam: 22, estilo: 'bold', y: 38 }, { t: 'devagar: ele ronda', tam: 19, y: 78 }, { t: 'rápido: ele caça', tam: 19, y: 108 }, { t: 'nenhuma: ele escuta', tam: 19, y: 138 }], { w: 256, h: 160, fundo: '#2a2018', cor: '#c9a75a', manchas: 3 }), emissive: 0x1a1206, emissiveIntensity: .5 });
    A.plano(1.1, .7, mat, 3, 1.75, -65.9, 0, A.W.grupo);
  } catch (e) {}

  A.W.tick.push(segura(dt => {
    const a = AU(A), P = A.P, M = A.M, t = A.perf(), S2 = A.S, k = a ? K(a) : null;
    const sala = P.room ? P.room.id : null, nivel = nivelF(), alta = nivel > .3, agua = !!S2.flags.aguaBaixa;
    let mov = Math.hypot(P.pos.x - lastP.x, P.pos.z - lastP.z); lastP.copy(P.pos); if (mov > 3) mov = 0;
    const dM = M && M.ativo ? M.pos.distanceTo(P.pos) : 99;
    const quieto = t < silT;
    mask = 1;
    A.camera.getWorldDirection(fwd);

    // ---- passos: o espaço responde pelo eco, pelo "bong" do tubo e pela parede oca
    let passo = false;
    if (mov > .001 && !S2.hidden) { stepAcc += mov; if (stepAcc > (P.sprinting ? 1.25 : P.crouch ? .95 : .75)) { stepAcc = 0; passo = true; walk++; } }
    else if (mov <= .001) {
      if (walk >= 10 && !S2.flags.a7Passo && dM > 10 && a && !quieto) {      // o eco continua um passo depois de você parar (uma vez por noite)
        S2.flags.a7Passo = true; const px = P.pos.x - fwd.x * 2.2, pz = P.pos.z - fwd.z * 2.2;
        depois(A, 'tuneis', 650, a2 => { K(a2).passoEco({ x: px, z: pz }, .09); leg(A, 'a7Passo', { x: px, z: pz }); });
        depois(A, 'tuneis', 2600, () => A.sub('lia', 'Eu parei. O passo não.'));
      }
      walk = 0;
    }
    if (passo && a && k && !quieto) {
      const R = P.room, len = R ? Math.max(R.x1 - R.x0, R.z1 - R.z0) : 8, dly = cl(.1 + len * .012, .14, .55) * 1000;
      const vol = P.sprinting ? .1 : P.crouch ? .025 : .06;
      const bx = P.pos.x - fwd.x * 3, bz = P.pos.z - fwd.z * 3;
      depois(A, 'tuneis', dly, a2 => K(a2).passoEco({ x: bx, z: bz }, vol, len > 16));
      let perto = false; for (const s of segredos) if (Math.hypot(P.pos.x - s.x, P.pos.z - s.z) < 3.2) perto = true;
      if (perto && !P.crouch) k.oco({ x: P.pos.x, z: P.pos.z }, .09);       // parede falsa soa oca e funda
      else if (!P.crouch) { const largo = sala === 'hub' ? 85 : (sala === 't5' || sala === 't6') ? 120 : 190; k.bong({ x: P.pos.x, z: P.pos.z - .3 }, largo, sala === 'hub' ? .8 : (sala === 't5' || sala === 't6') ? .5 : .22, .035); }
      // um dado, dois passos devolvidos (uma vez por noite, no túnel leste)
      if (!S2.flags.a7Dobra && sala === 't3' && walk >= 6 && Math.random() < .3 && dM > 10) { S2.flags.a7Dobra = true; dobraN = 5; }
      if (dobraN > 0) { dobraN--; const ax = P.pos.x + fwd.x * 4, az = P.pos.z + fwd.z * 4; depois(A, 'tuneis', 190, a2 => K(a2).passoEco({ x: ax, z: az }, .08)); if (dobraN === 4) leg(A, 'a7Dobra', { x: ax, z: az }); if (dobraN === 0) depois(A, 'tuneis', 2400, () => A.sub('lia', 'Dois passos. Eu só dei um.')); }
    }
    // ---- câmara do eco: o barulho volta três vezes e o Inspetor corre para o lugar errado
    if ((sala === 'v1' || sala === 'v2') && P.noiseR > 5 && t > camT && !S2.hidden) {
      camT = t + 4; const R = P.room, cx = (R.x0 + R.x1) / 2, cz = (R.z0 + R.z1) / 2, a0 = rand(0, 6.28), pts = [0, 2.1, 4.2].map(d => ({ x: cx + Math.cos(a0 + d) * 3.2, z: cz + Math.sin(a0 + d) * 4.5 }));
      [[300, .12], [700, .08], [1200, .05]].forEach(([ms, v], i) => depois(A, 'tuneis', ms, a2 => K(a2).ruidoE(pts[i], .26, 'bandpass', 700, 1.2, v, .8, .01)));
      leg(A, 'a7Eco3');
      if (M && M.ativo && dM > 9) depois(A, 'tuneis', 1500, () => A.emitNoise(pts[1].x, pts[1].z, 6));
    }
    // ---- um passo adiantado: parada numa curva, o eco antecipa um estalo que você ainda não deu
    // (coberto acima pelo passo duplo); aqui, o pop de ouvido ao descer e o fechamento do túnel atrás de você
    if (a && !pres.ok2) {
      pres.t += dt;
      if (pres.t > .8 && !pres.ok1) { pres.ok1 = true; try { A.SFX.zumbidoOuvido(1); } catch (e) {} k.pressao(54, .05, 3.2); }
      if (pres.t > 3.6) { pres.ok2 = true; k.ruidoE(null, .05, 'lowpass', 900, 1, .16, 0, .002); k.ruidoE(null, .5, 'bandpass', 2400, 1, .03, .2, .01); leg(A, 'a7Pop'); }
    }
    if (sala && salaAnt === null) { salaAnt = sala; vis.add(sala); }
    else if (sala && sala !== salaAnt) {
      salaAnt = sala;
      if (!vis.has(sala)) {
        vis.add(sala);
        if (['hub', 't4', 't5', 't6'].includes(sala) && a) {
          const bp = { x: P.pos.x - fwd.x * 4, z: P.pos.z - fwd.z * 4 };
          k.ruidoE(bp, .2, 'highpass', 2500, 1, .3, .5, .003);
          for (let i = 0; i < 5; i++) depois(A, 'tuneis', 150 + i * 130, a2 => K(a2).ruidoE(bp, .2, 'lowpass', 420 - i * 40, 1, .22 - i * .03, .5, .01));
          k.ruidoE(bp, 3, 'highpass', 4500, .7, .04, .2, 1);
          k.tomE(bp, 38, 2.4, .14, 'sine', .5, .3); P.shake = Math.max(P.shake || 0, .07); leg(A, 'a7Fecha', bp);
        }
      }
    }

    // ---- compressor pulsante: sopra 8 s em 8 s e cobre seus passos; no vale o túnel fica quieto demais
    if (!agua) {
      cT += dt;
      if (cT >= 8) { cT -= 8; if (a && Math.hypot(P.pos.x + 16, P.pos.z + 36) < 34) { k.ruidoE({ x: -16, z: -36 }, 2.4, 'lowpass', 160, .9, .22, .5, .5); k.tomE({ x: -16, z: -36 }, 48, 2.4, .1, 'sine', .5, .5); leg(A, 'a7Fole'); } }
      const sopra = cT < 2.6, perto = Math.hypot(P.pos.x + 16, P.pos.z + 36) < 24;
      if (sopra && perto) { mask = Math.min(mask, .55); if (Math.hypot(P.pos.x + 16, P.pos.z + 36) < 10) P.shake = Math.max(P.shake || 0, .015); }
      if (cT > 6.2) mask *= 1.12;
    } else if (!compOff) { compOff = true; if (a) { const tt = a.AC.currentTime, g = sd(a, { x: -16, z: -36 }, .5); const o = a.AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(90, tt); o.frequency.exponentialRampToValueAtTime(36, tt + 2.2); o.connect(g); a.env(g, tt, .05, .2, 2.2); o.start(tt); o.stop(tt + 2.4); leg(A, 'a7CompPara'); } }

    // ---- ventilador do poço: rugido de 12 s; no pico cobre tudo, no vale dá para ouvir o Inspetor do outro lado
    fanT += dt; const ph = Math.sin(fanT * Math.PI * 2 / 12), nv = (ph + 1) / 2, dF = Math.hypot(P.pos.x, P.pos.z + 48);
    fanS -= dt; if (fanS <= 0) { fanS = .55; if (a && dF < 30) k.ruidoE({ x: 0, z: -48 }, .7, 'bandpass', 160 + nv * 340, .9, (.02 + nv * .1) * (1 - dF / 32), .4, .2); }
    if (nv > .78 && dF < 24) mask = Math.min(mask, .6);
    if (nv < .12 && M && M.ativo && dM < 30 && a) { valeT -= dt; if (valeT <= 0) { valeT = .6; k.ruidoE(M.pos, .1, 'lowpass', 260, 1, .08, .5, .004); if (t - valeLeg > 14) { valeLeg = t; leg(A, 'a7Vale', M.pos); } } }

    // ---- canos que cantam: cada válvula solta a sua nota baixa; a ordem certa é uma melodia que os baldes repetem
    if (!agua && a) for (const V of valvIts) {
      if (S2.valv.includes(V.n)) continue;
      const d = Math.hypot(P.pos.x - V.pos.x, P.pos.z - V.pos.z); if (d > 16) continue;
      cantT[V.n] = (cantT[V.n] ?? rand(0, 1.5)) - dt;
      if (cantT[V.n] <= 0) { cantT[V.n] = 1.7; k.tomE(V.pos, tons[V.n - 1], 1.9, .025 + .04 * (1 - d / 16), 'sine', .5, .5); if (!cantT.leg || t - cantT.leg > 25) { cantT.leg = t; leg(A, 'a7Canta', V.pos); } }
    }
    if (S2.fitas && S2.fitas.f2 && !agua && S2.ordem && a) {
      baldeT -= dt;
      if (baldeT <= 0 && Math.hypot(P.pos.x + 4, P.pos.z + 40) < 30) {
        baldeT = 26; leg(A, 'a7Balde', { x: -4, z: -40 });
        S2.ordem.forEach((n, i) => depois(A, 'tuneis', i * 750, a2 => { const kk = K(a2); kk.tomE({ x: -4, z: -40 }, tons[n - 1] * 2, .55, .1, 'triangle', .6, .002); kk.ruidoE({ x: -4, z: -40 }, .05, 'highpass', 3500, 1, .05, .3, .001); }));
      } else if (baldeT <= 0) baldeT = 6;
    }

    // ---- válvula de vapor: assobio que cobre os passos por 20 s, mas chama o Inspetor depois de 15 s
    if (vaporT >= 0) {
      vaporT += dt; vaporS -= dt; const dv = Math.hypot(P.pos.x - 9, P.pos.z + 37.9);
      if (vaporS <= 0) { vaporS = .5; if (a) k.assobio({ x: 9, z: -37.9 }, cl(vaporT / 10, 0, 1), .16); }
      if (dv < 18) mask = Math.min(mask, .5);
      if (vaporT > 15 && vaporT < 20 && Math.floor(vaporT) !== Math.floor(vaporT - dt)) { A.emitNoise(9, -37.9, 13); if (!vaporAv) { vaporAv = true; A.toast('O assobio chama alguém.'); } }
      if (vaporT >= 20) { vaporT = -1; if (a) k.tchunc({ x: 9, z: -37.9 }); }
    }

    // ---- sino afogado: correr na água da cisterna faz um sino submerso soar, abafado e atrasado (ele ouve)
    sinoT -= dt;
    if (alta && sala === 'hub' && P.sprinting && mov > .001 && sinoT <= 0 && a) { sinoT = 1.9; const sx = P.pos.x, sz = P.pos.z; depois(A, 'tuneis', 260, a2 => { K(a2).sino({ x: sx, y: .1, z: sz }, 196, .16, 2.4, 420, .8); leg(A, 'a7SinoAfog', { x: sx, z: sz }); }); A.emitNoise(sx, sz, 4); }

    // ---- galeria dos sussurros: parada numa ponta, ela ouve nítido o que se diz na outra
    focos.forEach((f, i) => {
      const g = gal[i], d = Math.hypot(P.pos.x - f.x, P.pos.z - f.z);
      if (d < 2.6 && mov < .001 && !S2.hidden) { g.q += dt; if (g.q > 3 && !g.on && a) { g.on = true; k.vozAbafada({ x: P.pos.x + 1, y: 1.5, z: P.pos.z }, .22); if (!S2.flags[f.fl]) { S2.flags[f.fl] = true; depois(A, 'tuneis', 1600, () => A.sub('davi', f.txt)); } } }
      else { g.q = 0; if (d > 6) g.on = false; }
    });
    // ---- vozes pelo duto: sob a grade do teto, parada, o andar de cima vaza (passos, reza, uma contagem)
    if (Math.hypot(P.pos.x, P.pos.z + 12) < 1.3 && mov < .001 && !S2.hidden) {
      dutoQ += dt;
      if (dutoQ > 3 && !dutoOn && a) {
        dutoOn = true; leg(A, 'a7Duto', { x: 0, z: -12 });
        for (let i = 0; i < 3; i++) depois(A, 'tuneis', 200 + i * 700, a2 => K(a2).ruidoE({ x: 0, y: 3.4, z: -12 }, .12, 'lowpass', 300, 1, .1, .6, .004, 3.4));
        depois(A, 'tuneis', 300, a2 => K(a2).vozAbafada({ x: 0, y: 3.4, z: -12 }, .12));
        for (let i = 0; i < 3; i++) depois(A, 'tuneis', 2600 + i * 800, a2 => K(a2).tomE({ x: 0, y: 3.4, z: -12 }, 640, .12, .05, 'sine', .5, .005));
        if (!S2.flags.a7Duto) { S2.flags.a7Duto = true; depois(A, 'tuneis', 1500, () => A.sub('lia', 'Passos lá em cima. Uma reza baixinha. E alguém contando: um... dois...')); }
      }
    } else { dutoQ = 0; dutoOn = false; }

    // ---- a água corre mais forte na direção da saída (quem segue o som chega)
    aguaT -= dt;
    if (aguaT <= 0) { aguaT = 1.3; const dE = Math.hypot(P.pos.x - 30, P.pos.z + 36), kk = Math.pow(1 - cl(dE / 42, 0, 1), 2); if (a && kk > .02) k.ruidoE({ x: 30, z: -36 }, 1.4, 'bandpass', 420, 1, .012 + kk * .09, .3, .4, .3); }

    // ---- correntes de ar assobiam pelas frestas (o duto dos ratos e a grade da cabana) a cada 8 s
    corrT -= dt;
    if (corrT <= 0) {
      corrT = 8;
      if (a) [{ x: -27, z: -24.2, f: 520 }, { x: 2, z: -46.5, f: 740 }].forEach(c => { const d = Math.hypot(P.pos.x - c.x, P.pos.z - c.z); if (d < 14) { k.tomE(c, c.f, 1.6, .01 + .03 * (1 - d / 14), 'sine', .4, .5); k.ruidoE(c, 1.4, 'bandpass', c.f, 5, .01 + .02 * (1 - d / 14), .4, .5); leg(A, 'a7Corrente', c); } });
    }
    // ---- pressão: quanto mais fundo, mais o ar zumbe no ouvido
    pressT -= dt;
    if (pressT <= 0) { pressT = 1.6; const dep = cl((-P.pos.z - 6) / 55, 0, 1); if (a && dep > .08) k.pressao(52 + dep * 10, .008 + dep * .03); }

    // ---- canal: a água corrente cobre um pouco o seu barulho; uma vez por noite ela cala e volta rugindo
    const canal = sala === 't2' || sala === 't3';
    if (canal) {
      canalT -= dt;
      if (canalT <= 0) { canalT = 1.2; if (a) k.ruidoE(null, 1.3, 'bandpass', 700, .8, calaFase === 1 ? .018 : .06, 0, .3); }
      if (calaFase !== 1) mask = Math.min(mask, .9);
      calaCt += dt;
      if (calaFase === 0 && calaCt > 22 && !S2.flags.a7Cala && dM > 12) { calaFase = 1; calaT = 0; S2.flags.a7Cala = true; leg(A, 'a7Cala'); A.sub('lia', 'A água parou de falar. Alguma coisa travou o canal.'); }
    }
    if (calaFase === 1) { calaT += dt; if (calaT > 6) { calaFase = 2; if (a) { k.ruidoE(P.pos, 1.8, 'bandpass', 500, .8, .26, .4, .1); k.ruidoE(null, 1.6, 'lowpass', 200, 1, .2, 0, .1); } leg(A, 'a7Gush'); P.shake = Math.max(P.shake || 0, .15); } }
    // ---- enchente: quando o nível sobe o rugido de torrente e as gotas rápidas crescem
    const sobe = (nivel - nivAnt) / Math.max(dt, .001); nivAnt = nivel;
    if (sobe > .02) { torT -= dt; if (torT <= 0) { torT = .8; if (a) { k.ruidoE(null, .9, 'bandpass', 900, .8, .1, .2, .2); for (let i = 0; i < 3; i++) depois(A, 'tuneis', i * 120, a2 => K(a2).pingo({ x: P.pos.x + rand(-3, 3), z: P.pos.z + rand(-3, 3) }, 'poca', .12)); leg(A, 'a7Torrente'); } } }
    // ---- o Inspetor na água: chape em compasso enquanto anda; parado, ele escuta (silêncio)
    if (M && M.ativo) {
      const sM = A.roomAt(M.pos.x, M.pos.z), movM = M.pos.distanceTo(lastM); lastM.copy(M.pos);
      if (sM && sM.agua && alta && movM > .002 && movM < 2) { chapeT -= dt; if (chapeT <= 0) { chapeT = M.state === 'caca' ? .28 : .7; if (a && dM < 28) { k.ruidoE(M.pos, .18, 'bandpass', 900, 1.5, M.state === 'caca' ? .16 : .09, .4, .004, .1); leg(A, 'a7Chape', M.pos); } } }
      // ---- canos contam o estado dele: devagar = ronda, rápido = caça, nenhum = parado escutando
      const iv = M.state === 'caca' ? .3 : M.state === 'patrulha' ? 1 : 0; tapT -= dt;
      if (iv && dM < 45 && a) { if (tapT <= 0) { tapT = iv; k.tomE({ x: 3, z: -35 }, 230, .09, .07, 'triangle', .5, .002); leg(A, 'a7CanoBate'); } } else tapT = Math.max(tapT, .3);
      // ---- ao começar a caça o mundo prende o fôlego por um instante
      const caca = M.state === 'caca'; if (caca && !caçaAnt && dM < 22) { silT = t + .9; try { A.SFX.silencio(.9, .12, false); } catch (e) {} } caçaAnt = caca;
    }
    tensao(A, a, dt, st);
  }));
  return def;
}

// =====================================================================
// CEMITÉRIO E CAPELA
// =====================================================================
export function cemiterio(A, S, def, extra = {}) {
  reg(A);
  const covas = extra.covas || [], pedras = extra.pedras || [], itsTum = extra.itsTum || {}, importantes = extra.importantes || {};
  const velasAltar = extra.velasAltar || [], cel = extra.cel || [], nomes = extra.nomes || [];
  const rand = A.rand, T3 = A.THREE, MAT = A.MAT;
  const ALTAR = { x: 0, y: 1.2, z: -66 }, BELL = { x: 4.8, y: 5, z: -64 }, PORTA = { x: 0, y: 1.2, z: -48 };
  const lastP = new T3.Vector3().copy(A.P.pos), fwd = new T3.Vector3();
  const cruzes = covas.filter(c => c.g && c.g.children.length >= 3);
  const rachada = cel[nomes.length] || null;
  let prevRaio = 0, prevTum = A.S.tumulos ? Object.keys(A.S.tumulos).length : 0, silT = 0, ventoCala = 0, cruzT = rand(1, 3), chimeT = rand(2, 4), chimeCd = 0, fugaT = 0, tm = 0;
  let paT = rand(3, 6), paResp = null, golpesTot = 0, parouT = 0, paNivel = 0, orgT = rand(3, 6), sinoTerraT = rand(2, 5), mosT = 3, chuvaT = 0;
  let ritual = null, naCapT = 0, hinoOk = false, fim = false, ent = { t: 0, ok1: false, ok2: false }, st = { t: 2, prev: null };
  const whT = {}, camada = {}, golp = {};
  const pa = [{ x: -22, z: -30 }, { x: 20, z: -14 }, { x: -12, z: -44 }];
  const paFonte = pa[Math.floor(Math.random() * pa.length)];

  // ----- bandos de corvos pousados em três lápides distantes entre si
  const bandos = [];
  try {
    const cand = pedras.filter(p => p.z > -44 && p.z < 8 && Math.abs(p.x) > 4);
    for (const p of cand) {
      if (bandos.length >= 3) break;
      if (bandos.every(b => Math.hypot(b.x - p.x, b.z - p.z) > 12)) {
        const ms = []; for (let i = 0; i < 3; i++) ms.push(A.box(.13, .1, .2, MAT.preto, p.x + (i - 1) * .22, 1.12, p.z + rand(-.05, .05), A.W.grupo, false));
        bandos.push({ x: p.x, z: p.z, ms, voo: 0 });
      }
    }
  } catch (e) {}

  A.W.tick.push(segura(dt => {
    const a = AU(A), P = A.P, M = A.M, t = A.perf(), S2 = A.S, k = a ? K(a) : null;
    const mov = Math.hypot(P.pos.x - lastP.x, P.pos.z - lastP.z); lastP.copy(P.pos);
    const naCapela = P.room && P.room.id === 'capela', fugindo = !!S2.flags.sino, raio = A.raioI || 0;
    const dM = M && M.ativo ? M.pos.distanceTo(P.pos) : 99, quieto = t < silT, ntum = S2.tumulos ? Object.keys(S2.tumulos).length : 0;
    const dAltar = Math.hypot(P.pos.x - ALTAR.x, P.pos.z - ALTAR.z), rajada = raio > .5 && prevRaio <= .5; prevRaio = raio;
    A.camera.getWorldDirection(fwd);
    // posição audível na direção de um alvo longe (o 'amb' descarta fontes a mais de 32 m)
    const rumo = (alvo, dist) => { const dx = alvo.x - P.pos.x, dz = alvo.z - P.pos.z, d = Math.hypot(dx, dz) || 1, r = Math.min(dist, d); return { x: P.pos.x + dx / d * r, z: P.pos.z + dz / d * r }; };
    if (fugindo) fugaT += dt;

    // ---- pressão inversa ao subir: o ouvido estala, o ar frio entra pela escotilha
    if (a && !ent.ok2) {
      ent.t += dt;
      if (ent.t > .4 && !ent.ok1) { ent.ok1 = true; try { A.SFX.zumbidoOuvido(.7); } catch (e) {} k.ruidoE(null, 3, 'bandpass', 600, .8, .07, 0, 1.2); k.tomE(null, 880, 2.4, .012, 'sine', 0, .8); }
      if (ent.t > 2.4) { ent.ok2 = true; k.ruidoE(null, .06, 'lowpass', 1200, 1, .14, 0, .002); leg(A, 'a7Pop'); }
    }

    // ---- corvos: levantam em estouro de asas se você corre ou joga garrafa perto, ou quando ele passa no mato
    for (const b of bandos) {
      const d = Math.hypot(P.pos.x - b.x, P.pos.z - b.z);
      if (b.voo > 0) { b.voo -= dt; if (b.voo <= 0) for (const m of b.ms) m.visible = true; continue; }
      const eu = d < 11 && (P.sprinting || P.noiseR > 6), ele = M && M.ativo && Math.hypot(M.pos.x - b.x, M.pos.z - b.z) < 8;
      if ((eu || ele) && !quieto) {
        b.voo = 45; for (const m of b.ms) m.visible = false;
        if (a) { k.asas(b, 1.4, .22); for (let i = 0; i < 3; i++) depois(A, 'cemiterio', i * 230, a2 => K(a2).caw({ x: b.x, z: b.z }, .12)); leg(A, 'a7Corvos', b); }
        if (eu) A.emitNoise(b.x, b.z, 18);     // o Inspetor ouve o estouro de asas com ganho alto
      }
    }

    // ---- vento nas cruzes de ferro: uma nota por fileira, mais aguda na direção da capela; calam 3 s quando ele chega
    if (M && M.ativo && dM < 14) { if (ventoCala <= 0) leg(A, 'a7VentoCala'); ventoCala = 3; }
    if (ventoCala > 0) ventoCala -= dt;
    cruzT -= dt;
    if (cruzT <= 0) {
      cruzT = rand(2, 3.6) / (1 + raio * 2);
      if (a && ventoCala <= 0 && !naCapela && !quieto) {
        const perto = cruzes.filter(c => Math.hypot(c.x - P.pos.x, c.z - P.pos.z) < 16).sort(() => Math.random() - .5).slice(0, 2);
        for (const c of perto) { const f = 280 + cl(-c.z + 10, 0, 70) * 7, v = .03 * (1 + cl(-P.pos.z / 40, 0, 1) * .9); k.cruzNota({ x: c.x, z: c.z }, f, v); leg(A, 'a7Cruz', c); }
      }
    }
    // ---- sinos de vento nas cruzes: tocam com a brisa; se você corre perto, tocam fora do compasso
    chimeT -= dt; chimeCd -= dt;
    if (chimeT <= 0) { chimeT = rand(1.8, 3.4); if (a && ventoCala <= 0 && !quieto) { const c = cruzes.find(c => Math.hypot(c.x - P.pos.x, c.z - P.pos.z) < 10); if (c) k.tomE({ x: c.x, z: c.z }, [1760, 2093, 2349][Math.random() * 3 | 0], .7, .03, 'triangle', .5, .002); } }
    if (P.sprinting && chimeCd <= 0 && a) { const c = cruzes.find(c => Math.hypot(c.x - P.pos.x, c.z - P.pos.z) < 2.2); if (c) { chimeCd = 3; k.sino3({ x: c.x, z: c.z }, 1900, .05, 3); } }

    // ---- cada túmulo por cavar sussurra uma sílaba do nome, na direção dele
    const sil = { ana: [800, 1250], tome: [520, 900], davi: [850, 2300] };
    for (const id in importantes) {
      if (S2.tumulos && S2.tumulos[id]) continue;
      const L = importantes[id]; if (!L || !L.g) continue;
      const d = Math.hypot(L.g.position.x - P.pos.x, L.g.position.z - P.pos.z); if (d > 14) continue;
      whT[id] = (whT[id] ?? rand(0, 3)) - dt;
      if (whT[id] <= 0) { whT[id] = rand(3.8, 5.6); const f = sil[id] || [700, 1100]; if (a && !quieto) { k.silaba({ x: L.g.position.x, z: L.g.position.z }, f[0], f[1], .05 + .14 * (1 - d / 14)); leg(A, 'a7Sussurro', L.g.position); } }
    }
    // ---- moscas apontam o túmulo que falta (depois que a pá está na mão)
    mosT -= dt;
    if (mosT <= 0) {
      mosT = 3.2;
      if (a && S2.inv && S2.inv.pa && !fugindo) { let m = null, md = 18; for (const id in importantes) if (!(S2.tumulos && S2.tumulos[id])) { const L = importantes[id]; if (L && L.g) { const d = Math.hypot(L.g.position.x - P.pos.x, L.g.position.z - P.pos.z); if (d < md) { md = d; m = L.g.position; } } } if (m) k.moscas({ x: m.x, z: m.z }, .03 + .11 * (1 - md / 18)); }
    }
    // ---- sino enterrado: um sino toca abafado sob a lápide rachada, mais alto quando você chega perto
    sinoTerraT -= dt;
    if (rachada && sinoTerraT <= 0) {
      sinoTerraT = 8.5; const d = Math.hypot(P.pos.x - rachada[0], P.pos.z - rachada[1]);
      if (a && d < 34 && !fugindo) { k.sino({ x: rachada[0], y: -.3, z: rachada[1] }, 196, .05 + .2 * (1 - d / 34), 3, 380, .4); leg(A, 'a7SinoTerra', { x: rachada[0], z: rachada[1] }); if (d < 3) for (let i = 0; i < 3; i++) depois(A, 'cemiterio', 300 + i * 260, a2 => K(a2).tomE({ x: rachada[0], z: rachada[1] }, 70, .3, .1, 'sine', .4, .004)); }
      if (d < 2.5 && !S2.flags.a7SinoTerra) { S2.flags.a7SinoTerra = true; A.sub('lia', 'Tem um sino tocando debaixo da terra. Aqui. Bem aqui.'); }
    }

    // ---- a pá muda de som a cada camada: terra mole, raízes, pedra e, no fim, o toque oco da madeira
    let cavando = false;
    for (const id in itsTum) {
      const it = itsTum[id].it, L = itsTum[id].L; if (!it || (S2.tumulos && S2.tumulos[id])) continue;
      const seg = t - (it.seguradoT ?? -9) < .08; if (!seg) continue; cavando = true;
      golp[id] = (golp[id] ?? 0) - dt;
      if (golp[id] <= 0) {
        golp[id] = .55; golpesTot++;
        const fator = { ana: .9, tome: 1, davi: 1.1 }[id] || 1, kk = cl((it.progresso || 0) / (it.hold || 4) / fator, 0, 1);   // cada cova tem uma profundidade
        const cam = kk < .25 ? 0 : kk < .5 ? 1 : kk < .75 ? 2 : 3, pos = { x: L.g.position.x, z: L.g.position.z };
        if (a) {
          k.pa(pos, cam, .16 * (raio > .25 ? .5 : 1));
          k.tomE(pos, 520 - 260 * kk, .5, .02 + .02 * kk, 'sine', .7, .05);      // o buraco assobia como garrafa; a nota desce com a profundidade
          if (cam === 3 && camada[id] !== 3) { leg(A, 'a7Pa', pos); A.toast('A pá bate em madeira. Oca.'); }
        }
        camada[id] = cam;
        if (raio > .25 && !S2.flags.a7Cobre) { S2.flags.a7Cobre = true; A.toast('O trovão cobre a pá.'); }
        else if (raio < .05 && !S2.flags.a7Trovejar) { S2.flags.a7Trovejar = true; A.sub('lia', '(Só cavo quando trovejar.)'); }
      }
    }
    // ---- a pá distante: pausa quando você cava e responde com o mesmo número de golpes, cada vez mais perto
    if (cavando) { parouT = 0; paT = 4; }
    else if (golpesTot > 0) { parouT += dt; if (parouT > 1.2 && a) { const n = Math.min(golpesTot, 6); golpesTot = 0; paNivel = Math.min(3, paNivel + 1); const kk = 1 - paNivel * .2, fx = P.pos.x + (paFonte.x - P.pos.x) * kk, fz = P.pos.z + (paFonte.z - P.pos.z) * kk; for (let i = 0; i < n; i++) depois(A, 'cemiterio', 400 + i * 450, a2 => K(a2).pa(rumo({ x: fx, z: fz }, 26), 0, .1)); leg(A, 'a7PaLonge', { x: fx, z: fz }); parouT = -99; } }
    paT -= dt;
    if (paT <= 0 && !cavando && !fugindo && ntum < 3) { paT = 6; if (a) { const kk = 1 - paNivel * .2, fx = P.pos.x + (paFonte.x - P.pos.x) * kk, fz = P.pos.z + (paFonte.z - P.pos.z) * kk; for (let i = 0; i < 3; i++) depois(A, 'cemiterio', i * 480, a2 => K(a2).pa(rumo({ x: fx, z: fz }, 26), 0, .07)); } }

    // ---- órgão distante que soma uma nota por túmulo; com os três o acorde fecha e a porta da capela vibra
    orgT -= dt;
    if (orgT <= 0) {
      orgT = 8;
      if (a && ntum > 0 && !fugindo && !naCapela && S2.placed < 3) { [55, 65.41, 82.41].slice(0, ntum).forEach((f, i) => depois(A, 'cemiterio', i * 160, a2 => K(a2).orgao(rumo(ALTAR, 14), f, .04 + ntum * .02, 4.2))); if (ntum === 3) k.orgao(rumo(ALTAR, 14), 110, .06, 4.2); leg(A, 'a7Orgao'); }
    }
    if (ntum > prevTum) {
      if (ntum === 3 && a) {
        leg(A, 'a7Porta', PORTA);
        for (let i = 0; i < 12; i++) depois(A, 'cemiterio', i * 100, a2 => K(a2).ruidoE(PORTA, .06, 'highpass', 2200, 2, .08, .4, .002, 1.2));
        k.tomE(PORTA, 45, 1.6, .16, 'sine', .5, .2); if (Math.hypot(P.pos.x, P.pos.z + 48) < 22) P.shake = Math.max(P.shake || 0, .08);
        depois(A, 'cemiterio', 1800, () => A.sub('lia', 'A porta da capela tá vibrando. Tá me chamando.'));
      }
      // ---- silêncio total antes da mão sair da terra
      if (ntum === 3) { silT = t + 2.8; try { A.SFX.silencio(2.6, .05, true); } catch (e) {} }
      prevTum = ntum;
    }

    // ---- capela: o sino bate sem badalo, uma vela apaga a cada batida; a última soma uma batida a mais e o chão vibra
    if (naCapela && !fugindo && S2.placed < 3) naCapT += dt; else if (!naCapela) naCapT = 0;
    if (!ritual && naCapT > 7 && !S2.flags.a7Ritual) { S2.flags.a7Ritual = true; ritual = { t: 0, antes: velasAltar.map(v => v.acesa), n: 0 }; }
    if (ritual) {
      ritual.t += dt;
      const toques = [0, 3, 6, 9];
      while (ritual.n < 4 && ritual.t >= toques[ritual.n]) { const i = ritual.n++; if (a) { k.sino(BELL, 220 - i * 10, .22, 3.4, 0, .7); leg(A, 'a7Badalo', BELL); } if (velasAltar[i]) velasAltar[i].acesa = false; }
      if (ritual.n === 4 && ritual.t > 12.5) { ritual.n = 5; if (a) { k.sino(BELL, 165, .32, 5, 0, .8); k.subtrovao(.14); } P.shake = Math.max(P.shake || 0, .22); }
      if (ritual.t > 15) { velasAltar.forEach((v, i) => { v.acesa = ritual.antes[i] === false ? false : true; }); ritual = null; }
    }
    // ---- o primeiro compasso do hino sai do órgão quando ela chega ao altar
    if (naCapela && dAltar < 4.5 && !hinoOk && !fugindo) { hinoOk = true; try { for (let i = 0; i < 4; i++) { const f = (HINO[i] || [220, 1])[0] / 2; depois(A, 'cemiterio', i * 1000, a2 => K(a2).orgao(ALTAR, f, .1, 1.8)); } } catch (e) {} leg(A, 'a7Hino'); if (!S2.flags.a7Hino) { S2.flags.a7Hino = true; depois(A, 'cemiterio', 3500, () => A.sub('lia', 'Eu conheço essa melodia. É o hino do internato.')); } }
    if (!naCapela) hinoOk = hinoOk && dAltar < 8;

    // ---- o trovão da fuga chega cada vez mais depressa depois do relâmpago
    if (rajada && fugindo) { const dly = Math.round((1 - cl(fugaT / 70, 0, 1)) * 6000); depois(A, 'cemiterio', dly, a2 => { K(a2).trovaoGrave(.22); leg(A, 'a7Trovao'); }); }

    // ---- a chuva soa diferente na pedra e na terra
    chuvaT -= dt;
    if (chuvaT <= 0 && !naCapela && a && !quieto) {
      chuvaT = .22 / (1 + raio * 2); const px = P.pos.x + rand(-4, 4), pz = P.pos.z + rand(-4, 4), pedra = pedras.some(p => Math.abs(p.x - px) < 1.1 && Math.abs(p.z - pz) < 1.1);
      if (pedra) k.tomE({ x: px, z: pz }, 1800 + Math.random() * 500, .05, .025, 'sine', .2, .001); else k.ruidoE({ x: px, z: pz }, .06, 'lowpass', 1200, 1, .03, .2, .002, .1);
    }
    // ---- o amanhecer: ao cruzar o portão com o sino tocado, o final traz o primeiro som normal da noite
    if (fugindo && !fim && P.pos.z > 10.9 && Math.abs(P.pos.x) < 2.6) {
      fim = true; let n = 0;
      const iv = setInterval(() => {
        n++;
        try {
          const el = document.getElementById('ending');
          if (el && !el.hidden) { clearInterval(iv); const tit = (document.getElementById('e-tit') || {}).textContent; const tipo = Object.keys(A.R.finais || {}).find(k2 => A.R.finais[k2].titulo === tit); amanhecer(A, tipo); }
          else if (n > 50) clearInterval(iv);
        } catch (e) { clearInterval(iv); }
      }, 300);
    }
    tensao(A, a, dt, st);
  }));
  return def;
}

// primeiro som "normal" da campanha: chuva parando, pássaros em camadas, galo, ônibus rural e o sino das seis.
// O final comum só tem um pássaro, sem resposta.
function amanhecer(A, tipo) {
  const a = AU(A); if (!a) return;
  const AC = a.AC, now = () => AC.currentTime;
  const bem = (t0, f, vol) => { for (const [dt, m, d] of [[0, 1, .12], [.17, 1.28, .12], [.4, 1.12, .22]]) { const g = a.saida(null, .35); const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f * m, t0 + dt); o.frequency.linearRampToValueAtTime(f * m * 1.12, t0 + dt + d); o.connect(g); a.env(g, t0 + dt, .01, vol, d); o.start(t0 + dt); o.stop(t0 + dt + d + .02); } };
  const sabia = (t0, vol) => { for (let i = 0; i < 9; i++) { const tt = t0 + i * .11, f = 2100 + Math.random() * 1500, g = a.saida(null, .35), o = AC.createOscillator(); o.frequency.setValueAtTime(f, tt); o.frequency.linearRampToValueAtTime(f * (Math.random() < .5 ? 1.2 : .85), tt + .09); o.connect(g); a.env(g, tt, .008, vol, .09); o.start(tt); o.stop(tt + .11); } };
  const galo = (t0, vol) => { const g = a.saida(null, .5), o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(330, t0); o.frequency.linearRampToValueAtTime(520, t0 + .18); o.frequency.linearRampToValueAtTime(380, t0 + .9); const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 1.5; o.connect(bp); bp.connect(g); a.env(g, t0, .04, vol, .95); o.start(t0); o.stop(t0 + 1); };
  const onibus = (t0, vol) => { const g = a.saida(null, .4), o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(58, t0); o.frequency.linearRampToValueAtTime(76, t0 + 4); const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; o.connect(lp); lp.connect(g); a.env(g, t0, 2, vol, 3); o.start(t0); o.stop(t0 + 5.2); };
  const sino = (t0, vol) => { const g = a.saida(null, .6); for (const [m, v] of [[1, 1], [2.4, .5], [3, .3]]) { const o = AC.createOscillator(); o.frequency.value = 392 * m; const og = AC.createGain(); og.gain.value = v; o.connect(og); og.connect(g); o.start(t0); o.stop(t0 + 3.2); } a.env(g, t0, .005, vol, 3); };
  const t = now() + .4;
  if (tipo === 'verdadeiro') {
    bem(t + 1, 2000, .05); bem(t + 2.6, 2250, .035); sabia(t + 3.4, .04); sabia(t + 5.2, .03); bem(t + 6.5, 1950, .045); galo(t + 4.5, .05); onibus(t + 8, .05);
    for (let i = 0; i < 6; i++) sino(t + 9 + i * 2.6, .08);
  } else { bem(t + 3, 2100, .04); }   // só um pássaro, sem resposta
  leg(A, 'a7Amanhecer');
}
