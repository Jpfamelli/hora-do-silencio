// PRÓLOGO — som e atmosfera da estrada (Lote 7). Ambiência viva por volta do carro, do posto e do portão:
// grilos, sapos, um cão ao longe, caminhão na rodovia, grito no vento; a chuva na lataria do carro e no
// zinco do posto; o rádio do carro virando farol que some com a distância; e o silêncio usado como arma —
// a natureza cala quando o morto chega. Tudo procedural, no mesmo AudioContext do motor. Sem assets novos.
// Chamado por estrada() em mapas.js, depois de rejogoEstrada (lê S.flags.climaNoite).

import { audioEstrada2, LEG2 } from './estrada-audio2.js';

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;

// legendas de acessibilidade dos sons novos do prólogo
const LEG = {
  est_grilos_calam: { t: 'os grilos calam de repente', imp: 1, cd: 6, cat: 'p' },
  est_cao: { t: 'um cão late ao longe', imp: 0, cd: 7, cat: 'h', pos: a => a[0] },
  est_cao_cala: { t: 'o cão emudece no meio do latido', imp: 1, cd: 8, cat: 'p', pos: a => a[0] },
  est_caminhao: { t: 'um caminhão passa na rodovia', imp: 0, cd: 14, cat: 'h', pos: a => a[0] },
  est_grito_vento: { t: 'um grito distante no vento', imp: 1, cd: 10, cat: 'p', pos: a => a[0] },
  est_coruja: { t: 'uma coruja piando no mato', imp: 0, cd: 12, cat: 'h', pos: a => a[0] },
  est_chuva_estoura: { t: 'a chuva estoura lá fora', imp: 1, cd: 20 },
  est_chuva_teto: { t: 'chuva tamborilando no teto do carro', imp: 0, cd: 16, cat: 'h', pos: a => a[0] },
  est_chuva_zinco: { t: 'chuva martelando no zinco do posto', imp: 0, cd: 16, cat: 'h', pos: a => a[0] },
  est_granizo: { t: 'granizo batendo seco no telhado', imp: 1, cd: 9, cat: 'p' },
  est_raio_rente: { t: 'um relâmpago rente — e um silêncio total', imp: 1, cd: 18, cat: 'p' },
  est_chapinha: { t: 'seus pés chapinham na água', imp: 0, cd: 3, cat: 'p' },
  est_sapos_calam: { t: 'os sapos se calam', imp: 0, cd: 8, cat: 'p' }
};

export function audioEstrada(A, S, c) {
  // no QA automático (navigator.webdriver) o módulo fica de fora, como os de cosmética pesada: dezenas de nós de áudio a mais só atrasam o relógio real do teste (o fumaça próprio liga com window.__L7DEBUG)
  if (typeof navigator !== 'undefined' && navigator.webdriver && !window.__L7DEBUG) return { parar() {}, ruidoMul: () => 1 };
  const { THREE } = A;
  const grupo = A.W.grupo, P = A.P;
  const GZ = c.GZ, carro = c.carro;
  const vivo = () => A.W.grupo === grupo && A.S === S;
  const jogando = () => vivo() && A.mode === 'jogo';
  const cena = () => vivo() && A.mode === 'cena';
  const fora = () => P.room && P.room.fora;
  const dist = (x, z) => Math.hypot(x - P.pos.x, z - P.pos.z);
  const au = () => (A.audio && A.audio()) || null;
  const clima = () => S.flags.climaNoite || 'seca';
  const temChuva = () => { const cl = clima(); return cl === 'chuva' || cl === 'neblina'; };
  const leg = (k, ...a) => { try { A.SFX[k](...a); } catch (e) {} };
  try { const L = A.legendas; if (L) for (const k in LEG) if (!L[k]) L[k] = LEG[k]; if (L) for (const k in LEG2) if (!L[k]) L[k] = LEG2[k]; } catch (e) {}

  const carPos = (y = 1) => ({ x: carro.position.x, y, z: carro.position.z });

  // ---------- geradores de uma nota só (one-shots procedurais) ----------
  const SOM = {
    // chilro de grilo: trinado de onda alta modulado, com cauda curta (céu aberto)
    grilo(pos, vol = 1) {
      const a = au(); if (!a) return; const { AC, saida } = a; const t = AC.currentTime;
      const g = saida(pos, .08, 'amb'); if (!g) return;
      const o = AC.createOscillator(); o.type = 'square'; o.frequency.value = 4200 + Math.random() * 1400;
      const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = o.frequency.value; bp.Q.value = 14;
      o.connect(bp); bp.connect(g);
      g.gain.setValueAtTime(0.0001, t);
      const n = 5 + (Math.random() * 4 | 0), dur = .028;
      for (let i = 0; i < n; i++) { const t0 = t + i * dur * 2; g.gain.setValueAtTime((.06 + Math.random() * .04) * vol, t0); g.gain.setValueAtTime(0.0001, t0 + dur); }
      o.start(t); o.stop(t + n * dur * 2 + .05);
    },
    // coaxo de sapo: pulso grave com gargarejo
    sapo(pos, vol = 1) {
      const a = au(); if (!a) return; const { AC, saida, env } = a; const t = AC.currentTime;
      const g = saida(pos, .18, 'amb'); if (!g) return;
      const o = AC.createOscillator(); o.type = 'sawtooth'; const f = 150 + Math.random() * 90;
      o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * .86, t + .3);
      const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
      const trem = AC.createGain(); const tl = AC.createOscillator(); tl.type = 'square'; tl.frequency.value = 26 + Math.random() * 16;
      const tg = AC.createGain(); tg.gain.value = .5; tl.connect(tg); tg.connect(trem.gain); trem.gain.value = .5;
      o.connect(lp); lp.connect(trem); trem.connect(g); env(g, t, .02, .22 * vol, .3); o.start(t); tl.start(t); o.stop(t + .4); tl.stop(t + .4);
    },
    // latido distante: dois ou três "aus" com oclusão de distância
    cao(pos, n = 2) {
      const a = au(); if (!a) return; const { AC, saida, env } = a; let t = AC.currentTime;
      for (let i = 0; i < n; i++) {
        const g = saida(pos, .4, 'amb'); if (!g) { return; }
        const o = AC.createOscillator(); o.type = 'sawtooth'; const f = 280 + Math.random() * 120;
        o.frequency.setValueAtTime(f * 1.4, t); o.frequency.exponentialRampToValueAtTime(f, t + .16);
        const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 1.2;
        const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400;
        o.connect(bp); bp.connect(lp); lp.connect(g); env(g, t, .01, .3, .22); o.start(t); o.stop(t + .3);
        t += .34 + Math.random() * .2;
      }
    },
    // caminhão passando: grave de motor que cresce e some, com um toque de buzina no auge
    caminhao(pos, buzina) {
      const a = au(); if (!a) return; const { AC, saida } = a; const t = AC.currentTime, dur = 7;
      const g = saida(pos, .2, 'amb'); if (!g) return;
      const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 58;
      const o2 = AC.createOscillator(); o2.type = 'triangle'; o2.frequency.value = 87;
      const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
      o.connect(lp); o2.connect(lp); lp.connect(g);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(.16, t + dur * .5); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.start(t); o2.start(t); o.stop(t + dur); o2.stop(t + dur);
      if (buzina) { const t2 = t + dur * .5, gb = saida(pos, .3, 'amb'); if (gb) { for (const f of [196, 262]) { const b = AC.createOscillator(); b.type = 'square'; b.frequency.value = f; const blp = AC.createBiquadFilter(); blp.type = 'lowpass'; blp.frequency.value = 900; b.connect(blp); blp.connect(gb); b.start(t2); b.stop(t2 + .9); } gb.gain.setValueAtTime(0.0001, t2); gb.gain.exponentialRampToValueAtTime(.12, t2 + .05); gb.gain.setValueAtTime(.12, t2 + .7); gb.gain.exponentialRampToValueAtTime(0.0001, t2 + .9); } }
    },
    // grito distante no vento: formante agudo filtrado, decaindo
    grito(pos) {
      const a = au(); if (!a) return; const { AC, saida } = a; const t = AC.currentTime, dur = 1.6;
      const g = saida(pos, .5, 'amb'); if (!g) return;
      const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(620, t); o.frequency.linearRampToValueAtTime(540, t + dur);
      const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 5;
      const hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 500;
      const vib = AC.createOscillator(); vib.frequency.value = 5.5; const vg = AC.createGain(); vg.gain.value = 30; vib.connect(vg); vg.connect(o.frequency);
      o.connect(bp); bp.connect(hp); hp.connect(g); vib.start(t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.09, t + .3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur); vib.stop(t + dur);
    },
    coruja(pos) {
      const a = au(); if (!a) return; const { AC, saida, env } = a; let t = AC.currentTime;
      for (const [k, f] of [[0, 420], [.5, 380], [.68, 360]]) { const g = saida(pos, .4, 'amb'); if (!g) continue; const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(f * 1.05, t + k); o.frequency.linearRampToValueAtTime(f, t + k + .18); o.connect(g); env(g, t + k, .04, .08, .2); o.start(t + k); o.stop(t + k + .3); }
    },
    // chapinhada na poça: espirro curto de ruído, mais fundo quanto mais água acumulada
    chapinha(pos, prof = .3) {
      const a = au(); if (!a) return; const { AC, saida, burst, env } = a; const t = AC.currentTime;
      const g = saida(pos, .2, 'sfx'); if (!g) return; const f = burst(t, .12, 'lowpass', 1200 - prof * 500, .8, g); f.frequency.linearRampToValueAtTime(400, t + .12);
      env(g, t, .002, .1 + prof * .18, .12);
      if (prof > .5) { const g2 = saida(pos, .3, 'sfx'); if (g2) { const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(90, t + .2); o.connect(g2); env(g2, t, .003, .14, .2); o.start(t); o.stop(t + .25); } }
    },
    // granizo: rajada de tiquinhos secos e altos no telhado
    granizo(pos, dur = 1.2) {
      const a = au(); if (!a) return; const { AC, saida, burst } = a; const t = AC.currentTime;
      const g = saida(pos, .1, 'amb'); if (!g) return;
      const n = dur * 34 | 0; for (let i = 0; i < n; i++) { const t0 = t + Math.random() * dur; const gg = saida(pos, .05, 'amb'); if (!gg) break; burst(t0, .015, 'highpass', 4500 + Math.random() * 2500, 1, gg); gg.gain.setValueAtTime(.08 + Math.random() * .07, t0); gg.gain.exponentialRampToValueAtTime(.0001, t0 + .02); }
    },
    // corvo grasnando ao longe (rural, inquieto)
    corvo(pos) {
      const a = au(); if (!a) return; const { AC, saida, env } = a; let t = AC.currentTime; const n = 2 + (Math.random() * 2 | 0);
      for (let i = 0; i < n; i++) { const g = saida(pos, .4, 'amb'); if (!g) return; const o = AC.createOscillator(); o.type = 'sawtooth'; const f = 320 + Math.random() * 80; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * .8, t + .18); const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 3; o.connect(bp); bp.connect(g); env(g, t, .01, .12, .2); o.start(t); o.stop(t + .25); t += .28 + Math.random() * .18; }
    },
    // inseto noturno sustentado (zumbido áspero, timbre diferente do grilo)
    inseto(pos) {
      const a = au(); if (!a) return; const { AC, saida } = a; const t = AC.currentTime, dur = 2 + Math.random() * 2;
      const g = saida(pos, .06, 'amb'); if (!g) return; const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 1700 + Math.random() * 600;
      const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = o.frequency.value; bp.Q.value = 8; const am = AC.createGain(); const al = AC.createOscillator(); al.type = 'sawtooth'; al.frequency.value = 42; const ag = AC.createGain(); ag.gain.value = .5; al.connect(ag); ag.connect(am.gain); am.gain.value = .5;
      o.connect(bp); bp.connect(am); am.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.045, t + .4); g.gain.setValueAtTime(.045, t + dur - .4); g.gain.linearRampToValueAtTime(.0001, t + dur); o.start(t); al.start(t); o.stop(t + dur); al.stop(t + dur);
    },
    // rajada de vento forte (whoosh de ruído crescendo e caindo)
    rajada(vol = 1) {
      const a = au(); if (!a) return; const { AC, saida } = a; const t = AC.currentTime, dur = 2.4;
      const g = saida(null, .2, 'amb'); if (!g) return; const s = AC.createBufferSource(); s.buffer = ruidoBuf(AC); s.loop = true; const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(500, t); bp.frequency.linearRampToValueAtTime(1300, t + dur * .5); bp.frequency.linearRampToValueAtTime(400, t + dur); bp.Q.value = .9; s.connect(bp); bp.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.12 * vol, t + dur * .45); g.gain.linearRampToValueAtTime(.0001, t + dur); s.start(t); s.stop(t + dur);
    },
    // pingo grosso escorrendo e caindo do carro (depois da chuva)
    goteira(pos) { const a = au(); if (!a) return; const { AC, saida, env } = a; const t = AC.currentTime, g = saida(pos, .3, 'amb'); if (!g) return; const o = AC.createOscillator(); o.type = 'sine'; const f = 900 + Math.random() * 700; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .4, t + .07); o.connect(g); env(g, t, .002, .05, .09); o.start(t); o.stop(t + .12); },
    // pressão de infra-som quando o morto passa rente (sentida mais que ouvida)
    subpressao() { const a = au(); if (!a) return; const { AC, saida } = a; const t = AC.currentTime, g = saida(null, .1, 'amb'); if (!g) return; const o = AC.createOscillator(); o.frequency.setValueAtTime(30, t); o.frequency.exponentialRampToValueAtTime(19, t + 1.4); o.connect(g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.3, t + .5); g.gain.exponentialRampToValueAtTime(.0001, t + 1.6); o.start(t); o.stop(t + 1.7); },
    // o estalo seco de um raio rente (sem o atraso do trovão)
    raioRente() {
      const a = au(); if (!a) return; const { AC, saida, burst, env } = a; const t = AC.currentTime;
      const g = saida(null, .4, 'amb'); if (g) { burst(t, .25, 'highpass', 1600, .8, g); env(g, t, .001, 1.1, .22); }
      const g2 = saida(null, .5, 'amb'); if (g2) { burst(t + .02, 1.4, 'lowpass', 320, 1, g2, 0); g2.gain.setValueAtTime(.0001, t + .02); g2.gain.exponentialRampToValueAtTime(.9, t + .08); g2.gain.exponentialRampToValueAtTime(.0001, t + 1.4); }
    }
  };

  // ---------- camadas contínuas (criadas quando o áudio existe) ----------
  const nodes = []; // tudo que precisa ser parado ao sair do mapa
  let camadas = null;
  function criarCamadas() {
    const a = au(); if (!a || camadas) return; const { AC } = a;
    const mk = (connectTo) => { const g = AC.createGain(); g.gain.value = 0; g.connect(connectTo); return g; };
    // usamos saida(null) para pegar o barramento de ambiente do motor corretamente roteado (com um pouco de reverb curto = céu aberto)
    // o leito próprio vai direto ao master (um nó de `saida` pode vir desconectado quando as vozes do motor estão cheias)
    const bedOut = AC.createGain(); bedOut.gain.value = 1; bedOut.connect(a.master);
    // coro de grilos em 10 pontos FIXOS do mundo (dois lados da estrada, a cada ~28 m): cada ponto cala sozinho quando o morto
    // chega perto, então o buraco de silêncio caminha pela mata junto com ele (a frente de silêncio é a pista de perigo)
    const coros = [];
    for (const z of [-42, -14, 14, 42, 70]) for (const lado of [-1, 1]) {
      const s = AC.createBufferSource(); s.buffer = ruidoBuf(AC); s.loop = true;
      const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 4700 + Math.random() * 1000; bp.Q.value = 2.4;
      const tm = AC.createGain(); tm.gain.value = .5; const lf = AC.createOscillator(); lf.type = 'triangle'; lf.frequency.value = 8.5 + Math.random() * 5; const lg = AC.createGain(); lg.gain.value = .45; lf.connect(lg); lg.connect(tm.gain);
      const pn = AC.createPanner(); pn.panningModel = 'equalpower'; pn.distanceModel = 'inverse'; pn.refDistance = 9; pn.rolloffFactor = 1.1; pn.positionX.value = lado * (10 + Math.random() * 3); pn.positionY.value = .4; pn.positionZ.value = z + Math.random() * 8;
      const g = mk(bedOut); s.connect(bp); bp.connect(tm); tm.connect(pn); pn.connect(g); s.start(0, Math.random() * 1.5); lf.start();
      nodes.push(s, lf); coros.push({ g, bp, x: pn.positionX.value, z: pn.positionZ.value });
    }
    // vento rastejando no mato (soma ao vento do motor): ruído -> bandpass médio, LFO lento
    const wn = (() => { const s = AC.createBufferSource(); s.buffer = ruidoBuf(AC); s.loop = true; return s; })();
    const wbp = AC.createBiquadFilter(); wbp.type = 'bandpass'; wbp.frequency.value = 650; wbp.Q.value = .8;
    const wg = mk(bedOut); wg.gain.value = 0; const wl = AC.createOscillator(); wl.frequency.value = .09; const wlg = AC.createGain(); wlg.gain.value = 260; wl.connect(wlg); wlg.connect(wbp.frequency);
    wn.connect(wbp); wbp.connect(wg); wn.start(); wl.start();
    // chuva no teto do carro (metálica): ruído -> bandpass ressonante -> lowpass (abafado por dentro)
    const rr = (() => { const s = AC.createBufferSource(); s.buffer = ruidoBuf(AC); s.loop = true; return s; })();
    const rrb = AC.createBiquadFilter(); rrb.type = 'bandpass'; rrb.frequency.value = 1900; rrb.Q.value = .9;
    const rrl = AC.createBiquadFilter(); rrl.type = 'lowpass'; rrl.frequency.value = 900;
    const rrg = mk(bedOut); rrg.gain.value = 0; rr.connect(rrb); rrb.connect(rrl); rrl.connect(rrg); rr.start();
    // chuva no zinco do posto (metálica aguda, localizada)
    const zr = (() => { const s = AC.createBufferSource(); s.buffer = ruidoBuf(AC); s.loop = true; return s; })();
    const zrb = AC.createBiquadFilter(); zrb.type = 'bandpass'; zrb.frequency.value = 2600; zrb.Q.value = 1.1;
    const zpan = AC.createPanner(); zpan.panningModel = 'equalpower'; zpan.distanceModel = 'inverse'; zpan.refDistance = 3; zpan.rolloffFactor = 1.3; zpan.positionX.value = 9.6; zpan.positionY.value = 4; zpan.positionZ.value = -17;
    const zrg = mk(bedOut); zrg.gain.value = 0; zr.connect(zrb); zrb.connect(zpan); zpan.connect(zrg); zr.start();
    // farol sonoro: o rádio do carro deixado ligado — estática + uma estaçãozinha que some com a distância
    const rad = (() => { const s = AC.createBufferSource(); s.buffer = ruidoBuf(AC); s.loop = true; return s; })();
    const radbp = AC.createBiquadFilter(); radbp.type = 'bandpass'; radbp.frequency.value = 1800; radbp.Q.value = .7;
    const radlp = AC.createBiquadFilter(); radlp.type = 'lowpass'; radlp.frequency.value = 2600;
    const radpan = AC.createPanner(); radpan.panningModel = 'equalpower'; radpan.distanceModel = 'inverse'; radpan.refDistance = 2.2; radpan.rolloffFactor = 1.6;
    const radg = mk(bedOut); radg.gain.value = 0; rad.connect(radbp); radbp.connect(radlp); radlp.connect(radpan); radpan.connect(radg); rad.start();
    // uma voz-tom fraca por baixo da estática (a "estação de 1979")
    const tune = AC.createOscillator(); tune.type = 'sawtooth'; tune.frequency.value = 220; const tunef = AC.createBiquadFilter(); tunef.type = 'bandpass'; tunef.frequency.value = 900; tunef.Q.value = 6; const tuneg = AC.createGain(); tuneg.gain.value = .0; tune.connect(tunef); tunef.connect(tuneg); tuneg.connect(radpan); tune.start();
    // zumbido elétrico do letreiro de neon do posto (localizado, 60 Hz + harmônico)
    const neonG = (() => { const p = AC.createPanner(); p.panningModel = 'equalpower'; p.distanceModel = 'inverse'; p.refDistance = 2; p.rolloffFactor = 1.5; p.positionX.value = 9.6; p.positionY.value = 3.9; p.positionZ.value = -17; const g = AC.createGain(); g.gain.value = 0; g.connect(bedOut); p.connect(g); return { p, g }; })();
    const neo1 = AC.createOscillator(); neo1.type = 'sawtooth'; neo1.frequency.value = 120; const neo2 = AC.createOscillator(); neo2.type = 'sawtooth'; neo2.frequency.value = 180; const neoF = AC.createBiquadFilter(); neoF.type = 'bandpass'; neoF.frequency.value = 160; neoF.Q.value = 3; neo1.connect(neoF); neo2.connect(neoF); neoF.connect(neonG.p); neo1.start(); neo2.start();
    // zumbido da rede elétrica ao longo da estrada (fio da rua)
    const fioG = mk(bedOut); const fio = AC.createOscillator(); fio.type = 'sine'; fio.frequency.value = 60; const fio2 = AC.createOscillator(); fio2.type = 'sine'; fio2.frequency.value = 120; const fiog2 = AC.createGain(); fiog2.gain.value = .4; fio2.connect(fiog2); fio.connect(fioG); fiog2.connect(fioG); fio.start(); fio2.start();
    // assovio do vento nas grades do portão (localizado em GZ)
    const whG = (() => { const p = AC.createPanner(); p.panningModel = 'equalpower'; p.distanceModel = 'inverse'; p.refDistance = 3; p.rolloffFactor = 1.3; p.positionX.value = 0; p.positionY.value = 1.5; p.positionZ.value = GZ; const g = AC.createGain(); g.gain.value = 0; g.connect(bedOut); p.connect(g); return { p, g }; })();
    const whs = (() => { const s = AC.createBufferSource(); s.buffer = ruidoBuf(AC); s.loop = true; return s; })(); const whf = AC.createBiquadFilter(); whf.type = 'bandpass'; whf.frequency.value = 2200; whf.Q.value = 12; whs.connect(whf); whf.connect(whG.p); whs.start();
    // calha/água escorrendo do telhado do posto (só na chuva)
    const calG = (() => { const p = AC.createPanner(); p.panningModel = 'equalpower'; p.distanceModel = 'inverse'; p.refDistance = 2; p.rolloffFactor = 1.6; p.positionX.value = 11.4; p.positionY.value = 1; p.positionZ.value = -17; const g = AC.createGain(); g.gain.value = 0; g.connect(bedOut); p.connect(g); return { p, g }; })();
    const cals = (() => { const s = AC.createBufferSource(); s.buffer = ruidoBuf(AC); s.loop = true; return s; })(); const calf = AC.createBiquadFilter(); calf.type = 'bandpass'; calf.frequency.value = 1400; calf.Q.value = 1.4; cals.connect(calf); calf.connect(calG.p); cals.start();
    // massa surda do prédio do internato atrás do muro (drone grave que cresce perto do portão)
    const predG = (() => { const p = AC.createPanner(); p.panningModel = 'equalpower'; p.distanceModel = 'inverse'; p.refDistance = 6; p.rolloffFactor = .8; p.positionX.value = 0; p.positionY.value = 4; p.positionZ.value = c.BZ; const g = AC.createGain(); g.gain.value = 0; g.connect(bedOut); p.connect(g); return { p, g }; })();
    const pred1 = AC.createOscillator(); pred1.type = 'sine'; pred1.frequency.value = 38; const pred2 = AC.createOscillator(); pred2.type = 'sine'; pred2.frequency.value = 45.5; const predlp = AC.createBiquadFilter(); predlp.type = 'lowpass'; predlp.frequency.value = 120; pred1.connect(predlp); pred2.connect(predlp); predlp.connect(predG.p); pred1.start(); pred2.start();
    nodes.push(wn, wl, rr, zr, rad, tune, neo1, neo2, fio, fio2, whs, cals, pred1, pred2);
    camadas = { tune, fio, fio2, radlp, bedOut, coros, wg, wbp, rrg, rrl, zrg, radg, radpan, tuneg, rrb, neonG, fioG, whG, calG, predG };
  }
  // buffer de ruído branco reaproveitável
  let _rb = null;
  function ruidoBuf(AC) { if (_rb && _rb.sampleRate === AC.sampleRate) return _rb; const b = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; _rb = b; return b; }

  // ---------- o silêncio como arma: o buraco que o morto abre no som da mata ----------
  let amb = [], sobMarquiseAgora = false, prendeAgora = false;
  const est = { ventoCala: 0, fioCala: 0, hushAdd: 0, estacao: 0, neonCala: 0, perto: false, dAm: 99, fioRachou: false }; // estado dividido com src/estrada-audio2.js
  const U = (c.ex && c.ex.util) || {};
  function ameacas() { // quem cala a natureza: o vulto visível (espreita e perseguição) e o batedor de 1979, onde estiverem
    const r = [];
    try { if (c.v && c.v.visible) r.push({ x: c.v.position.x, z: c.v.position.z }); } catch (e) {}
    try { const b = U.batedorPos && U.batedorPos(); if (b) r.push({ x: b.x, z: b.z }); } catch (e) {}
    return r;
  }
  const RAIO_SIL = 5, RAIO_VOLTA = 16; // dentro de 5 m, mudo; a 16 m, o coro já está inteiro
  function buraco(x, z) { let f = 1; for (const m of amb) f = Math.min(f, clamp((Math.hypot(x - m.x, z - m.z) - RAIO_SIL) / (RAIO_VOLTA - RAIO_SIL), 0, 1)); return f; }
  // o cruzamento onde a chuva (e tudo o mais) para num círculo de 7 m: o silêncio total antes de um sino
  const CRUZ = { x: 0, z: 38, r: 7.5 };
  function semCampo(x, z) { return clamp((Math.hypot(x - CRUZ.x, z - CRUZ.z) - CRUZ.r + 2) / 2, 0, 1); }

  // ---------- estado ----------
  let rainAccum = .25;     // água acumulada cresce ao longo do prólogo (0..1)
  let vultoDuck = 0;       // 0 = natureza viva; 1 = calada pelo morto
  let hush = 0;            // silêncio total depois de um raio rente
  let swell = 0;          // "incha" da chuva no trovão
  let hushBicho = 0;      // engasgada dos bichos logo depois do trovão
  let lastRaioI = 0;
  let passosFase = 0, lastX = P.pos.x, lastZ = P.pos.z;
  let avisouChuva = false; // "estouro" ao sair do carro, uma vez
  let destruido = false;

  // agendadores esparsos que se encerram sozinhos ao sair do mapa ou do jogo
  function agendar(min, max, fn) {
    const passo = () => { if (destruido || !vivo()) return; setTimeout(passo, (min + Math.random() * (max - min)) * 1000); try { if (jogando() || cena()) fn(); } catch (e) {} };
    setTimeout(passo, (min + Math.random() * (max - min)) * 1000);
  }

  // (os cães agora moram em src/estrada-audio2.js: cadeia de latidos que cala um a um)
  // caminhão na rodovia, de madrugada — o mundo indiferente
  agendar(26, 55, () => { if (!au()) return; const lado = Math.random() < .5 ? -1 : 1; const pos = { x: P.pos.x + lado * 27, y: 1, z: P.pos.z + (Math.random() < .5 ? -1 : 1) * 18 }; SOM.caminhao(pos, Math.random() < .5); leg('est_caminhao', pos); });
  // coruja no mato
  agendar(22, 48, () => { if (!au() || !fora()) return; const pos = { x: P.pos.x + (Math.random() < .5 ? -1 : 1) * (14 + Math.random() * 12), y: 5, z: P.pos.z - 8 - Math.random() * 16 }; SOM.coruja(pos); leg('est_coruja', pos); });
  // grito distante trazido pela rajada (isca; nunca é perigo real)
  agendar(28, 60, () => { if (!au() || !fora() || !jogando()) return; const ang = Math.random() * 6.28, r = 22 + Math.random() * 7; const pos = { x: P.pos.x + Math.cos(ang) * r, y: 1.6, z: P.pos.z + Math.sin(ang) * r }; SOM.grito(pos); leg('est_grito_vento', pos); });
  // sapos coaxando na valeta do posto (calam quando o morto se aproxima)
  let saposVivos = true;
  agendar(2.2, 5.5, () => {
    if (!au() || !fora()) return; if (buraco(11, -15) < .5) { if (saposVivos) { saposVivos = false; leg('est_sapos_calam', { x: 9, y: .2, z: -14 }); } return; }
    saposVivos = true; const n = 1 + (Math.random() * 2 | 0); for (let i = 0; i < n; i++) { const sp = { x: 8 + Math.random() * 6, y: .2, z: -10 - Math.random() * 10 }; if (buraco(sp.x, sp.z) > .55 && semCampo(sp.x, sp.z) > .9) SOM.sapo(sp, clima() === 'chuva' ? 1.2 : .8); }
  });
  // acentos de grilos soltos por cima do leito (quando a natureza está viva)
  agendar(.8, 2.4, () => { if (!au() || !fora() || vultoDuck > .4 || clima() === 'chuva') return; const ang = Math.random() * 6.28, r = 4 + Math.random() * 9, gp = { x: P.pos.x + Math.cos(ang) * r, y: .3, z: P.pos.z + Math.sin(ang) * r }; if (buraco(gp.x, gp.z) < .6 || semCampo(gp.x, gp.z) < .9) return; SOM.grilo(gp, clima() === 'neblina' ? .6 : 1); });
  // inseto noturno sustentado, de longe (segunda camada de bicho)
  agendar(10, 24, () => { if (!au() || !fora() || vultoDuck > .4) return; const ang = Math.random() * 6.28, r = 10 + Math.random() * 14, ip = { x: P.pos.x + Math.cos(ang) * r, y: .5, z: P.pos.z + Math.sin(ang) * r }; if (buraco(ip.x, ip.z) < .6 || semCampo(ip.x, ip.z) < .9) return; SOM.inseto(ip); });
  // corvos grasnando ao longe
  agendar(34, 70, () => { if (!au() || !fora() || vultoDuck > .4) return; const pos = { x: P.pos.x + (Math.random() < .5 ? -1 : 1) * (16 + Math.random() * 10), y: 6, z: P.pos.z - 10 - Math.random() * 12 }; SOM.corvo(pos); });
  // rajadas de vento mais fortes (whoosh), mais frequentes no temporal/neblina
  agendar(12, 28, () => { if (!au() || !fora()) return; const cl = clima(); if (est.ventoCala > .3) return; if (cl === 'seca' && Math.random() < .6) return; SOM.rajada(cl === 'chuva' ? 1.3 : cl === 'neblina' ? 1 : .6); });
  // pingos grossos escorrendo do carro depois da chuva
  agendar(3.5, 8, () => { if (!au() || !temChuva()) return; if (dist(carro.position.x, carro.position.z) > 7) return; SOM.goteira({ x: carro.position.x + (Math.random() - .5) * 1.6, y: .4, z: carro.position.z + (Math.random() - .5) * 2 }); });

  // ---------- laço principal (self-terminante) ----------
  const DT = .06;
  function ticker() {
    if (destruido) return;
    if (!vivo()) { parar(); return; }
    setTimeout(ticker, DT * 1000);
    try { passo(); } catch (e) { if (window.__L7DEBUG) console.error('[L7] ' + (e && e.stack || e)); }
  }
  function passo() {
    const a = au(); if (!a) return;
    criarCamadas(); if (!camadas) return;
    const t = a.AC.currentTime, foraAgora = fora();
    const cl = clima();
    const dPostoX = Math.hypot(P.pos.x - 9.6, P.pos.z + 17);
    sobMarquiseAgora = temChuva() && dPostoX < 3.2 && Math.abs(P.pos.x - 9.6) < 2.6;
    prendeAgora = !!(jogando() && A.P && A.P.prende);

    // decaimentos
    swell = Math.max(0, swell - DT * 1.2);
    hush = Math.max(0, hush - DT);
    if (est.hushAdd > 0) { hush = Math.max(hush, est.hushAdd); est.hushAdd = 0; } // silêncios pedidos pelos eventos (o pisca que morre, o latido que para)
    // o morto cala a natureza: perseguição, vulto à vista, ou medo alto
    const perto = S.flags.perseguicao || (c.v && c.v.visible) || (c.vultoAtivo && c.vultoAtivo()) || S.fear > 60;
    vultoDuck = clamp(vultoDuck + (perto ? DT * 2.5 : -DT * .6), 0, 1);
    amb = ameacas(); const buracoEu = buraco(P.pos.x, P.pos.z); // 0 = dentro do buraco de silêncio do morto

    // raio rente / trovão: detecta a borda de subida do clarão do motor
    const ri = (() => { try { return A.raioI || 0; } catch (e) { return 0; } })();
    if (ri > lastRaioI + .25) { // acabou de relampejar
      swell = Math.min(1, .6 + ri * .5); // a chuva "incha" no áudio conforme a força do raio (pista de ritmo)
      if (temChuva() && Math.random() < .3) { SOM.granizo(carPos(2), 1 + Math.random()); leg('est_granizo'); E2.granizo(); }
      E2.trovao();
      if (Math.random() < .5) setTimeout(() => { if (!destruido && vivo()) { const pos = { x: P.pos.x + (Math.random() < .5 ? -1 : 1) * 24, y: 1, z: P.pos.z - 18 }; SOM.cao(pos, 2 + (Math.random() * 2 | 0)); leg('est_cao', pos); } }, 600 + Math.random() * 900); // o trovão faz o cão latir
      hushBicho = .9; // bichos dão uma engasgada logo depois do trovão
      if (foraAgora && Math.random() < .14 && hush <= 0) { // raro: relâmpago rente, estalo seco e um silêncio de um segundo
        SOM.raioRente(); hush = 1.1; leg('est_raio_rente'); if (A.P) A.P.shake = Math.max(A.P.shake || 0, .01);
      }
    }
    lastRaioI = ri;
    hushBicho = Math.max(0, hushBicho - DT);

    // fatores de volume
    const baseFora = foraAgora && (jogando() || cena()) ? 1 : 0;
    const dCarro = dist(carro.position.x, carro.position.z);
    const dGate = Math.max(0, P.pos.z - GZ); // quanto mais perto do portão, mais quieto (perto do prédio)
    const gateHush = clamp(dGate / 16, .4, 1);
    const silencioso = (1 - vultoDuck * .92) * (1 - hush * .95);
    const nebMul = cl === 'neblina' ? .78 : 1;       // neblina abafa tudo um pouco
    const secaMul = cl === 'seca' ? 1.18 : 1;        // noite seca: grilos mais altos, cada passo ecoa
    const climaVento = cl === 'chuva' ? 1.3 : cl === 'neblina' ? .8 : .45;

    // grilos (somem quando a natureza cala e perto do portão)
    const grilosAlvo = baseFora * .075 * gateHush * (1 - vultoDuck * .3) * (1 - hush * .95) * nebMul * secaMul * (cl === 'chuva' ? .5 : 1) * (1 - hushBicho * .7) * (1 - est.fioCala * .8) * semCampo(P.pos.x, P.pos.z);
    // cada coro do mundo tem o seu buraco: o silêncio do morto atravessa a mata em fila
    for (const k of camadas.coros) {
      const dk = Math.hypot(k.x - P.pos.x, k.z - P.pos.z);
      ramp(k.g.gain, dk > 46 ? 0 : grilosAlvo * buraco(k.x, k.z) * (sobMarquiseAgora ? .3 : 1) * (prendeAgora ? .5 : 1) * semCampo(k.x, k.z), t);
      k.bp.frequency.setTargetAtTime((cl === 'neblina' ? 3700 : 4900) + (k.x > 0 ? 300 : 0), t, .4); // na neblina o som "afunda"
    }
    // vento no mato
    ramp(camadas.wg.gain, baseFora * .05 * climaVento * (1 - hush * .9) * semCampo(P.pos.x, P.pos.z) * (1 - est.ventoCala), t);
    // chuva no teto do carro: alta por dentro (cena), some ao sair; só com chuva
    const dentroCarro = cena() || (!S.flags.saiuCarro && dCarro < 3.5);
    const tetoAlvo = temChuva() ? (dentroCarro ? .16 : clamp(1 - dCarro / 6, 0, 1) * .05) * (1 + swell * .5) : 0;
    ramp(camadas.rrg.gain, tetoAlvo, t);
    camadas.rrl.frequency.setTargetAtTime(dentroCarro ? 900 : 4000, t, .25); // abafado por dentro, "abre" ao sair
    // chuva no zinco do posto (localizada)
    const dPosto = Math.hypot(P.pos.x - 9.6, P.pos.z + 17); // dist ao posto (loja em z = -17)
    const zAlvo = temChuva() ? clamp(1 - dPosto / 14, 0, 1) * .14 * (1 + swell * .4) : 0;
    ramp(camadas.zrg.gain, zAlvo, t);
    // debaixo da marquise do posto você fica "surda" ao resto: duck da ambiência
    const sobMarquise = temChuva() && dPosto < 3.2 && Math.abs(P.pos.x - 9.6) < 2.6;
    if (sobMarquise) { ramp(camadas.wg.gain, baseFora * .015, t); if (!camadas._marq) { camadas._marq = true; leg('est_chuva_zinco', { x: 9.6, y: 4, z: -17 }); } } else camadas._marq = false;
    // rádio-farol do carro: estática + estaçãozinha que some com a distância (o último elo lá fora)
    const radioLigado = (jogando() && S.flags.saiuCarro) || cena();
    const sinal = clamp(1 - dCarro / 26, 0, 1); // força do sinal cai com a distância
    const dAm = amb.length ? Math.min(...amb.map(m => Math.hypot(m.x - P.pos.x, m.z - P.pos.z))) : 99, prox = clamp(1 - dAm / 40, 0, 1); // o rádio vira farol: a estática cresce a 40 m do perigo
    const radAlvo = radioLigado ? (.02 + .05 * sinal + .06 * prox) : 0;
    ramp(camadas.radg.gain, radAlvo, t);
    camadas.radpan.positionX.value = carro.position.x; camadas.radpan.positionZ.value = carro.position.z - .8;
    camadas.radlp.frequency.setTargetAtTime(600 + sinal * 2600, t, .3); // longe = mais abafado/chiado
    camadas.tuneg.gain.setTargetAtTime(radioLigado ? (.012 * sinal * sinal + .03 * est.estacao * sinal) * (1 - prox) : 0, t, .3); // a estação só aparece perto
    // o rádio-farol vira só estática no instante em que o morto aparece
    if (perto) camadas.tuneg.gain.setTargetAtTime(0, t, .15);

    // neon do posto zumbindo (perto), e some quando a luz do posto morre
    ramp(camadas.neonG.g.gain, (!S.flags.luzPostoMorta && est.neonCala <= 0 ? .02 : 0) * silencioso, t);
    // fio da rede elétrica ao longo da estrada (fundo baixíssimo, o tempo todo lá fora)
    ramp(camadas.fioG.gain, baseFora * .006 * silencioso * (1 - est.fioCala), t);
    // assovio do vento no portão cresce conforme você chega perto e com o clima
    ramp(camadas.whG.g.gain, baseFora * clamp(1 - dGate / 10, 0, 1) * .05 * climaVento * silencioso * (1 - est.ventoCala), t);
    camadas.whG.p.positionX.value = P.pos.x < 0 ? -2 : 2;
    // água escorrendo da calha do posto (só com chuva, perto do posto)
    ramp(camadas.calG.g.gain, temChuva() ? clamp(1 - dPosto / 10, 0, 1) * .05 : 0, t);
    // massa surda do prédio cresce ao chegar no portão (mal-estar sem fonte visível)
    ramp(camadas.predG.g.gain, baseFora * clamp(1 - dGate / 20, 0, 1) * .05, t);

    // prender o ar ao ar livre: o mundo "foca", a ambiência dá uma afundada
    if (prendeAgora) ramp(camadas.wg.gain, baseFora * .025 * climaVento, t);

    // o morto passando rente: um baque de infra-som (uma vez por aproximação)
    if (vultoDuck > .82 && !camadas._sub) { camadas._sub = true; SOM.subpressao(); }
    if (vultoDuck < .3) camadas._sub = false;

    // chapinhada nos passos (cresce com a água acumulada), pune correr na água
    if (jogando() && temChuva() && foraAgora) {
      const dx = P.pos.x - lastX, dz = P.pos.z - lastZ, dd = Math.hypot(dx, dz);
      passosFase += dd; lastX = P.pos.x; lastZ = P.pos.z;
      const correndo = dd / DT > 3.2;
      const passoLen = correndo ? .95 : 1.35;
      if (passosFase >= passoLen) { passosFase = 0; const prof = clamp(rainAccum + (correndo ? .2 : 0), 0, 1); if (prof > .12 && semCampo(P.pos.x, P.pos.z) > .9) { SOM.chapinha({ x: P.pos.x, y: .05, z: P.pos.z }, prof); if (prof > .55) leg('est_chapinha'); } }
      rainAccum = Math.min(1, rainAccum + DT * .002); // a poça engrossa devagar
    }

    // dispara a legenda "os grilos calaram" no instante em que a natureza morre de vez
    if (vultoDuck > .8 && !camadas._calou) { camadas._calou = true; leg('est_grilos_calam'); }
    if (vultoDuck < .3) camadas._calou = false;
    E2.tick(DT, { dCarro, amb, radioLigado });
  }
  function ramp(param, v, t) { try { param.setTargetAtTime(v, t, .18); } catch (e) {} }

  function parar() {
    if (destruido) return; destruido = true;
    for (const n of nodes) { try { n.stop && n.stop(); } catch (e) {} try { n.disconnect && n.disconnect(); } catch (e) {} }
    if (camadas) { for (const k of ['chg', 'wg', 'rrg', 'zrg', 'radg', 'tuneg']) { try { camadas[k].disconnect(); } catch (e) {} } try { camadas.bedOut.disconnect(); } catch (e) {} }
  }

  // "estouro" da chuva ao sair do carro — um gancho curto no sair_carro
  const SX = c.ex && c.ex.util && c.ex.util.SX;
  function estouroChuva() {
    if (avisouChuva || !temChuva()) return; avisouChuva = true;
    const a = au(); if (!a) return; const { AC, saida, burst } = a; const t = AC.currentTime;
    const g = saida(null, .3, 'amb'); if (g) { const f = burst(t, 1.2, 'highpass', 1800, .6, g); f.frequency.setValueAtTime(600, t); f.frequency.linearRampToValueAtTime(3000, t + .25); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(.22, t + .18); g.gain.exponentialRampToValueAtTime(.05, t + 1.2); }
    leg('est_chuva_estoura'); if (temChuva()) { leg('est_chuva_teto', carPos(2)); }
  }
  // observa o sair do carro (sem mexer no fluxo): quando saiuCarro vira true, estoura a chuva uma vez
  (function vigiaSaida() {
    const passo = () => { if (destruido || !vivo()) return; setTimeout(passo, 300); if (S.flags.saiuCarro && !avisouChuva) estouroChuva(); };
    setTimeout(passo, 300);
  })();

  const E2 = audioEstrada2(A, S, c, { au, leg, jogando, cena, fora, vivo, clima, temChuva, agendar, est, carPos, SOM, buraco, camadas: () => camadas, nodes });
  ticker();
  return { parar, ruidoMul: () => { try { return E2.ruidoMul(swell); } catch (e) { return 1; } } };
}
