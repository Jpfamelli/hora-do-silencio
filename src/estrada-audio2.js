// PRÓLOGO — som e atmosfera, 2ª parte (Lote 7): eventos sonoros com dono e lugar. Cães em cadeia que calam um a um,
// o carro esfriando (motor, pisca-alerta), a placa e o sino de vento do posto, o portão que range, os fios da rua,
// o rádio que troca de estação, o vento que fala, passos molhados que não são seus, o cruzamento sem som, a neblina.
// Tudo procedural, no mesmo AudioContext do motor, tolerante a falha. Chamado por audioEstrada (src/estrada-audio.js),
// que passa o estado compartilhado `est` (ventoCala, fioCala, hushAdd, estacao, neonCala) e as funções de silêncio.

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const rnd = (a, b) => a + Math.random() * (b - a);

export const LEG2 = {
  est_cao_cadeia: { t: 'cães de sítio respondem uns aos outros', imp: 0, cd: 8, cat: 'h', pos: a => a[0] },
  est_cao_ganido: { t: 'um cão ganiu e calou', imp: 1, cd: 7, cat: 'p', pos: a => a[0] },
  est_cao_aviso: { t: 'o cão ganiu, cortado, quando o vulto apareceu', imp: 1, cd: 12, cat: 'p', pos: a => a[0] },
  est_latidos_param: { t: 'os latidos chegam perto da estrada e param de uma vez', imp: 1, cd: 30, cat: 'p', pos: a => a[0] },
  est_respira_carro: { t: 'um chiado de respiração passa rente ao carro', imp: 1, cd: 30, cat: 'p', pos: a => a[0] },
  est_pisca_morre: { t: 'o clique do pisca-alerta morre', imp: 1, cd: 30, cat: 'p', pos: a => a[0] },
  est_pisca_volta: { t: 'o pisca-alerta estala mais uma vez, sozinho', imp: 1, cd: 30, cat: 'p', pos: a => a[0] },
  est_motor_tic: { t: 'o motor esfria: tic', imp: 0, cd: 14, cat: 'h', pos: a => a[0] },
  est_motor_perto: { t: 'um tic mais perto que os outros', imp: 1, cd: 20, cat: 'p', pos: a => a[0] },
  est_motor_frio: { t: 'o motor esfriou de vez', imp: 1, cd: 30, cat: 'p', pos: a => a[0] },
  est_motor_liga: { t: 'o motor do carro liga sozinho e morre', imp: 1, cd: 30, cat: 'p', pos: a => a[0] },
  est_placa: { t: 'a placa do posto bate', imp: 0, cd: 9, cat: 'h', pos: a => a[0] },
  est_placa_sem_vento: { t: 'o vento calou, e a placa continua batendo', imp: 1, cd: 30, cat: 'p', pos: a => a[0] },
  est_sino_vento: { t: 'o sino de vento do posto tilinta', imp: 0, cd: 12, cat: 'h', pos: a => a[0] },
  est_sino_para: { t: 'o sino de vento para de uma vez, e o vento continua', imp: 1, cd: 40, cat: 'p', pos: a => a[0] },
  est_portao_range: { t: 'a dobradiça do portão range', imp: 0, cd: 9, cat: 'h', pos: a => a[0] },
  est_portao_cala: { t: 'o rangido do portão morre quando a chave gira', imp: 1, cd: 60, cat: 'h' },
  est_fios_calam: { t: 'os fios da rua calam de uma vez', imp: 1, cd: 60, cat: 'p' },
  est_fio_racha: { t: 'o zumbido do fio sobe e racha', imp: 1, cd: 14, cat: 'p' },
  est_neon_estala: { t: 'o letreiro estala e morre por um instante', imp: 1, cd: 25, cat: 'p', pos: a => a[0] },
  est_radio_estacao: { t: 'o rádio do carro troca de estação sozinho', imp: 0, cd: 20, cat: 'h', pos: a => a[0] },
  est_radio_sussurro: { t: 'um sussurro por baixo da estática do rádio', imp: 1, cd: 30, cat: 'p', pos: a => a[0] },
  est_radio_valvula: { t: 'um rádio de válvula toca uma cantiga antiga no posto', imp: 0, cd: 25, cat: 'h', pos: a => a[0] },
  est_radio_verso: { t: 'o rádio do posto toca um verso a mais', imp: 1, cd: 60, cat: 'p', pos: a => a[0] },
  est_vento_fala: { t: 'o vento passa nas árvores como palavras sibiladas', imp: 0, cd: 25, cat: 'h', pos: a => a[0] },
  est_vento_nome: { t: 'o vento parece dizer um nome', imp: 1, cd: 60, cat: 'p' },
  est_passos_atras: { t: 'passos molhados atrás de você, fora do seu compasso', imp: 1, cd: 14, cat: 'p', pos: a => a[0] },
  est_cruzamento: { t: 'silêncio total, e um sino ao longe', imp: 1, cd: 30, cat: 'h' },
  est_trovao_eco: { t: 'o trovão volta em eco do vale', imp: 0, cd: 8, cat: 'h' },
  est_neblina_fila: { t: 'sussurros em fila passam de um ouvido ao outro', imp: 1, cd: 40, cat: 'p' }
};

const CAES = [{ x: -36, z: -34 }, { x: 36, z: 18 }, { x: -33, z: 60 }, { x: 34, z: 58 }]; // quatro sítios, quatro cães
const VALVULA = { x: 16.4, y: 1.2, z: -15.4 }, PLACA = { x: 7.6, y: 5.2, z: -7.5 }, SINO = { x: 9.0, y: 3.3, z: -9.2 };
const CRUZ = { x: 0, z: 38, r: 7.5 };

export function audioEstrada2(A, S, c, x) {
  const P = A.P, carro = c.carro, GZ = c.GZ;
  const { au, leg, jogando, cena, fora, vivo, clima, temChuva, agendar, est, carPos, SOM, buraco, camadas, nodes } = x;
  const sfx = (k, ...a) => { try { A.SFX[k](...a); } catch (e) {} };
  const noCaminho = (pos, max = 28) => { // o motor descarta ambiente a mais de 32 m: traz o som para a mesma direção, mais perto
    const dx = pos.x - P.pos.x, dz = pos.z - P.pos.z, d = Math.hypot(dx, dz) || 1, k = d > max ? max / d : 1;
    return { x: P.pos.x + dx * k, y: pos.y ?? 1, z: P.pos.z + dz * k };
  };

  // ---------- sons de uma nota só ----------
  const S2 = {
    ganido(pos) { // ganido agudo que se corta no meio
      const a = au(); if (!a) return; const { AC, saida, env } = a; const t = AC.currentTime, g = saida(pos, .4, 'amb'); if (!g) return;
      const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(1100, t); o.frequency.exponentialRampToValueAtTime(520, t + .22);
      const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 2; o.connect(bp); bp.connect(g); env(g, t, .01, .22, .12); o.start(t); o.stop(t + .25);
    },
    rele(pos, vol = 1) { // clique seco de relé
      const a = au(); if (!a) return; const { AC, saida, burst, env } = a; const t = AC.currentTime, g = saida(pos, 0, 'sfx'); if (!g) return;
      burst(t, .02, 'bandpass', 1300, 3, g); env(g, t, .001, .16 * vol, .03);
      const g2 = saida(pos, 0, 'sfx'); if (g2) { burst(t + .05, .015, 'highpass', 2600, 2, g2); env(g2, t + .05, .001, .08 * vol, .02); }
    },
    tic(pos, vol = 1) { // metal esfriando
      const a = au(); if (!a) return; const { AC, saida, burst, env } = a; const t = AC.currentTime, g = saida(pos, .15, 'sfx'); if (!g) return;
      const o = AC.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(2700 + Math.random() * 500, t); o.frequency.exponentialRampToValueAtTime(2100, t + .06); o.connect(g); env(g, t, .001, .06 * vol, .09); o.start(t); o.stop(t + .12);
      const g2 = saida(pos, 0, 'sfx'); if (g2) { burst(t, .008, 'highpass', 4200, 1, g2); env(g2, t, .001, .05 * vol, .01); }
    },
    placa(pos, forte = 1) { // lata batendo no poste e vibrando
      const a = au(); if (!a) return; const { AC, saida, burst, env } = a; const t = AC.currentTime, g = saida(pos, .4, 'amb'); if (!g) return;
      burst(t, .16, 'bandpass', 760, 6, g); env(g, t, .002, .16 * forte, .55);
      for (const f of [262, 397]) { const g2 = saida(pos, .4, 'amb'); if (!g2) break; const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(f * (1 + Math.random() * .02), t); o.connect(g2); env(g2, t, .003, .05 * forte, .5); o.start(t); o.stop(t + .6); }
    },
    sino(pos, n = 3) { // sino de vento: três notas altas, cada uma com cauda
      const a = au(); if (!a) return; const { AC, saida, env } = a; const t = AC.currentTime, notas = [1568, 1976, 2349, 2637, 1760];
      for (let i = 0; i < n; i++) { const g = saida(pos, .5, 'amb'); if (!g) break; const o = AC.createOscillator(); o.type = 'sine'; o.frequency.value = notas[(Math.random() * notas.length) | 0]; o.connect(g); const t0 = t + i * rnd(.09, .2); env(g, t0, .003, .045, .9); o.start(t0); o.stop(t0 + 1); }
    },
    rangePortao(pos, forte = 1) { // dobradiça enferrujada: glissando agudo com tremor
      const a = au(); if (!a) return; const { AC, saida } = a; const t = AC.currentTime, d = 1.3, g = saida(pos, .4, 'amb'); if (!g) return;
      const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(190, t); o.frequency.linearRampToValueAtTime(260, t + d * .45); o.frequency.linearRampToValueAtTime(175, t + d);
      const vib = AC.createOscillator(); vib.frequency.value = 17; const vg = AC.createGain(); vg.gain.value = 14; vib.connect(vg); vg.connect(o.frequency);
      const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 7; o.connect(bp); bp.connect(g);
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.075 * forte, t + .25); g.gain.linearRampToValueAtTime(.0001, t + d); o.start(t); vib.start(t); o.stop(t + d + .05); vib.stop(t + d + .05);
    },
    crepita(pos, vol = 1) { // corona no isolador
      const a = au(); if (!a) return; const { AC, saida, burst } = a; const t = AC.currentTime, g = saida(pos, .05, 'amb'); if (!g) return;
      burst(t, .02, 'highpass', 5200, 1, g); g.gain.setValueAtTime(.03 * vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .03);
    },
    ventoFala(pos, nome) { // sílabas sibiladas em ritmo de frase
      const a = au(); if (!a) return 0; const { AC, saida, burst, env } = a; let t = AC.currentTime; const n = 5 + ((Math.random() * 3) | 0);
      for (let i = 0; i < n; i++) { const g = saida(pos, .4, 'amb'); if (!g) break; const d = rnd(.09, .24); burst(t, d, 'bandpass', rnd(1700, 3400), 3.5, g); env(g, t, .02, nome && i === n - 1 ? .05 : .035, d); t += d + rnd(.04, .15); }
      return t - AC.currentTime;
    },
    valvula(pos, f, vol = .05, solto = false) { // nota de rádio de válvula
      const a = au(); if (!a) return; const { AC, saida, env, burst } = a; const t = AC.currentTime, g = saida(pos, .3, 'amb'); if (!g) return;
      const o = AC.createOscillator(); o.type = 'triangle'; o.frequency.value = f; const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1700; o.connect(lp); lp.connect(g); env(g, t, .012, vol, .5); o.start(t); o.stop(t + .6);
      if (solto) { const g2 = saida(pos, .1, 'amb'); if (g2) { burst(t, .3, 'bandpass', 1500, .8, g2); env(g2, t, .02, .012, .3); } }
    },
    ecoTrovao() { // o vale devolve o trovão: grave, longo, mais fraco
      const a = au(); if (!a) return; const { AC, saida, burst } = a; const t = AC.currentTime, g = saida(null, .5, 'amb'); if (!g) return;
      burst(t, 2.2, 'lowpass', 230, 1, g); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.35, t + .5); g.gain.exponentialRampToValueAtTime(.0001, t + 2.2);
    },
    sussurroFila() { // um sussurro que cruza a cabeça de um ouvido ao outro
      const a = au(); if (!a) return; const { AC, master } = a; const t = AC.currentTime, d = 3.2;
      for (let k = 0; k < 3; k++) {
        const s = AC.createBufferSource(); s.buffer = a.AC.__nb || (a.AC.__nb = (() => { const b = AC.createBuffer(1, AC.sampleRate, AC.sampleRate), q = b.getChannelData(0); for (let i = 0; i < q.length; i++) q[i] = Math.random() * 2 - 1; return b; })()); s.loop = true;
        const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = rnd(1900, 3300); f.Q.value = 6;
        const g = AC.createGain(); g.gain.value = 0; const p = AC.createPanner(); p.panningModel = 'equalpower'; p.positionY.value = 1.6;
        const x0 = -5 - k * 1.2, x1 = 5 + k * 1.2; p.positionX.setValueAtTime(P.pos.x + x0, t + k * .45); p.positionX.linearRampToValueAtTime(P.pos.x + x1, t + k * .45 + d); p.positionZ.value = P.pos.z - 1.5 + k;
        for (let i = 0; i < d * 8; i++) g.gain.setValueAtTime(Math.random() < .65 ? rnd(.012, .04) : 0, t + k * .45 + i / 8); g.gain.setValueAtTime(0, t + k * .45 + d);
        s.connect(f); f.connect(g); g.connect(p); p.connect(master); s.start(t + k * .45); s.stop(t + k * .45 + d + .05);
      }
    }
  };

  // neblina: assovio fino de cabos, tonal, no lugar da chuva (duas senoides que batem devagar)
  let nebG = null;
  function criarNeblina() {
    const a = au(); if (!a || nebG) return; const { AC } = a, cm = camadas(); if (!cm) return;
    nebG = AC.createGain(); nebG.gain.value = 0; nebG.connect(cm.bedOut);
    const o1 = AC.createOscillator(), o2 = AC.createOscillator(); o1.frequency.value = 1180; o2.frequency.value = 1186.5; o1.connect(nebG); o2.connect(nebG); o1.start(); o2.start(); nodes.push(o1, o2);
  }

  // ---------- estado ----------
  let T = 0, jogT = 0;
  const caes = CAES.map(s => ({ ...s, vivo: true, volta: 0 }));
  let vultoVisto = false, latidos = null, nomeFeito = false;
  const mot = { n: 0, prox: 2.2, fim: false, liga: rnd(80, 140), ligou: false };
  let piscaFim = false, piscaVolta = false, cruzT = 0, cruzN = 0, cruzAvisou = false;
  let placaT = 3, placaJan = { on: false, feito: false, t: 0, dur: 0 }, sinoT = 6, sinoN = 0, sinoMudo = 0, sinoParou = false;
  let portaoT = 4, portaoCalou = false, fiosCalaram = false, neonLivre = 0, neonDe = -9, vozT = rnd(24, 40), nebFilaT = rnd(35, 70), radT = rnd(9, 16), estacaoT = 0, radSus = false;
  const seg = { ativo: false, t: 0, passo: 0, dist: 0, prox: rnd(60, 100), lx: P.pos.x, lz: P.pos.z, n: 0 };
  const val = { dentro: false, fase: 0, t: 1, frase: 0, verso: false, avisou: false };
  let granizoT = 0;

  // ---------- cães em cadeia ----------
  function S2cao(pos, n) { try { SOM.cao(pos, n); } catch (e) {} }
  function cadeia() {
    const vivos = caes.filter(d => d.vivo); if (!vivos.length || !(jogando() || cena())) return;
    const a = vivos[(Math.random() * vivos.length) | 0], pa = noCaminho({ x: a.x, y: 1, z: a.z });
    if (Math.random() < .14) { S2cao(pa, 1); a.vivo = false; a.volta = rnd(14, 26); leg('est_cao_ganido', pa); return; } // corta no meio e fica mudo
    S2cao(pa, 2 + ((Math.random() * 2) | 0)); leg('est_cao', pa);
    vivos.filter(d => d !== a).forEach((d, i) => { // os outros respondem, atrasados pela distância
      const atraso = 800 + Math.hypot(d.x - a.x, d.z - a.z) * 14 + rnd(0, 700) + i * 300;
      setTimeout(() => { if (d.vivo && vivo() && jogando()) { const pd = noCaminho({ x: d.x, y: 1, z: d.z }); S2cao(pd, 1 + ((Math.random() * 2) | 0)); if (i === 0) leg('est_cao_cadeia', pd); } }, atraso);
    });
  }
  agendar(7, 15, cadeia);

  // ---------- eventos pontuais (latidos que chegam e param) ----------
  function eventoLatidos() {
    S.flags.l7Latidos = true; const lado = Math.random() < .5 ? -1 : 1, z0 = carro.position.z - 3;
    const rota = [[30, 7], [20, 6], [12, 5], [7.5, 4]].map(([dx, n]) => ({ x: carro.position.x + lado * dx, z: z0 + rnd(-3, 3), n }));
    rota.forEach((p, i) => setTimeout(() => { if (!vivo() || !jogando()) return; const pos = { x: p.x, y: .8, z: p.z }; S2cao(pos, 2); if (i === 0) leg('est_cao', pos); }, i * 1500));
    setTimeout(() => { // tudo para de uma vez
      if (!vivo() || !jogando()) return; est.hushAdd = 2.2; leg('est_latidos_param', { x: carro.position.x + lado * 7.5, y: 1, z: z0 });
      setTimeout(() => { if (!vivo() || !jogando()) return; const pos = { x: carro.position.x + lado * 1.4, y: 1.1, z: carro.position.z }; sfx('respiraRasgada', pos); leg('est_respira_carro', pos); setTimeout(() => { if (vivo() && jogando()) try { A.toast('Aqui não tem cachorro nenhum.'); } catch (e) {} }, 1800); }, 1600);
    }, rota.length * 1500 + 300);
  }

  // ---------- a placa, o sino, o portão, os fios ----------
  agendar(.3, .9, () => { // corona nos isoladores: crepita na chuva e quando o morto está perto
    if (!au() || !fora() || !(temChuva() || est.perto)) return;
    S2.crepita({ x: P.pos.x < 0 ? -4.5 : 4.5, y: 6, z: P.pos.z + rnd(-8, 8) }, temChuva() ? 1 : .7);
  });

  // ---------- o rádio de válvula do posto ----------
  const FRASES = [[440, 523, 659, 587, 523, 440, 392, 440], [392, 440, 523, 494, 440, 392, 349, 392]];
  function tocarFrase(f, solto, vol = .05) { const det = S.flags.joaquimSumiu ? .955 : 1, gap = S.flags.joaquimSumiu ? 620 : 480; f.forEach((n, i) => setTimeout(() => { if (vivo()) S2.valvula(VALVULA, n * det, vol, solto || S.flags.joaquimSumiu); }, i * gap)); return f.length * gap; }

  function ruidoMul(swell) { return (swell > .3 ? .82 : 1) * (granizoT > 0 ? .86 : 1); }

  function tick(dt, k) {
    const a = au(); if (!a) return; const t = a.AC.currentTime, jog = jogando(), cm = camadas(); if (!cm) return;
    T += dt; if (jog) jogT += dt; granizoT = Math.max(0, granizoT - dt);
    const dCarro = k.dCarro, saiu = !!S.flags.saiuCarro, am = k.amb, dAm = am.length ? Math.min(...am.map(m => Math.hypot(m.x - P.pos.x, m.z - P.pos.z))) : 99;
    est.perto = dAm < 18; est.dAm = dAm;
    est.neonCala = Math.max(0, est.neonCala - dt);

    // o vulto aparece: o cão mais próximo ganiu cortado, e cala
    const apareceu = am.length > 0;
    if (apareceu && !vultoVisto && jog) {
      vultoVisto = true; const vivos = caes.filter(d => d.vivo).sort((p, q) => Math.hypot(p.x - P.pos.x, p.z - P.pos.z) - Math.hypot(q.x - P.pos.x, q.z - P.pos.z));
      if (vivos[0]) { const d = vivos[0], pos = noCaminho({ x: d.x, y: 1, z: d.z }); S2.ganido(pos); d.vivo = false; d.volta = rnd(26, 40); leg('est_cao_aviso', pos); }
    }
    if (!apareceu) vultoVisto = false;
    // os cães calam um a um da direção dele; voltam devagar quando a ameaça some
    for (const d of caes) {
      if (d.vivo) { const dm = am.length ? Math.min(...am.map(m => Math.hypot(m.x - d.x, m.z - d.z))) : 99; if (dm < 34) { d.vivo = false; d.volta = rnd(30, 50); const pos = noCaminho({ x: d.x, y: 1, z: d.z }); S2.ganido(pos); leg('est_cao_ganido', pos); } }
      else if (!am.length && (d.volta -= dt) <= 0) d.vivo = true;
    }

    // latidos que chegam perto da estrada e param (uma vez por noite, depois que a Lia saiu do carro)
    if (saiu && !S.flags.l7Latidos && jog && jogT > 55 && !S.flags.perseguicao && dCarro < 16 && !am.length && P.room && P.room.fora && Math.random() < dt * .08) eventoLatidos();

    // o carro esfriando: pisca-alerta que morre e volta uma vez, motor que estala cada vez mais espaçado
    if (S.flags.piscaParou && !piscaFim && jog) { piscaFim = true; est.hushAdd = 1.8; S2.rele(carPos(1), 1.6); leg('est_pisca_morre', carPos()); }
    if (piscaFim && !piscaVolta && jog && dCarro < 4.5 && !am.length) { piscaVolta = true; leg('est_pisca_volta', carPos()); [0, 620, 1240].forEach(ms => setTimeout(() => { if (vivo()) S2.rele(carPos(1), 1); }, ms)); }
    if (saiu && !mot.fim && jog) {
      mot.prox -= dt;
      if (mot.prox <= 0) {
        mot.n++; mot.prox = Math.min(13, 1.25 * Math.pow(1.17, mot.n)) * rnd(.8, 1.2);
        if (mot.n >= 20) { mot.fim = true; if (dCarro < 45) { S2.tic(carPos(1), 1.2); leg('est_motor_frio', carPos()); } }
        else if (dCarro < 40) {
          if (Math.random() < .09 && dCarro > 6) { const dx = carro.position.x - P.pos.x, dz = carro.position.z - P.pos.z, L = Math.hypot(dx, dz) || 1, pp = { x: P.pos.x + dx / L * 2.6, y: 1, z: P.pos.z + dz / L * 2.6 }; S2.tic(pp, 2.2); leg('est_motor_perto', pp); }
          else { const cp = noCaminho(carPos(1), 30); S2.tic(cp, 1); if (mot.n % 4 === 1) leg('est_motor_tic', cp); }
        }
      }
      mot.liga -= dt; // de longe, o motor engasga e liga sozinho por 2 s
      if (!mot.ligou && mot.liga <= 0 && dCarro > 22 && !S.flags.perseguicao && !am.length) { mot.ligou = true; sfx('motor', true); setTimeout(() => sfx('motor', false), 2000); leg('est_motor_liga', noCaminho(carPos(1), 30)); }
    }

    // a placa do posto bate; num trecho o vento calou e ela segue em compasso certo
    const dPlaca = Math.hypot(P.pos.x - PLACA.x, P.pos.z - PLACA.z);
    if (!placaJan.feito && !placaJan.on && saiu && jog && dPlaca < 14 && !S.flags.perseguicao && !am.length) { placaJan.t += dt; if (placaJan.t > 5) { placaJan.on = true; placaJan.dur = 14; leg('est_placa_sem_vento', PLACA); } }
    if (placaJan.on) { placaJan.dur -= dt; if (placaJan.dur <= 0 || S.flags.perseguicao) { placaJan.on = false; placaJan.feito = true; } }
    est.ventoCala += ((placaJan.on ? 1 : 0) - est.ventoCala) * Math.min(1, dt * 2.4);
    if (fora() && dPlaca < 42 && jog) { placaT -= dt; if (placaT <= 0) { const pp = noCaminho(PLACA, 30), reg = placaJan.on; S2.placa(pp, reg ? .8 : rnd(.5, 1) * (clima() === 'chuva' ? 1.2 : 1)); leg('est_placa', pp); placaT = reg ? 2.0 : rnd(2.4, 7.5) * (clima() === 'chuva' ? .65 : 1); } }
    // o sino de vento: tilinta com as rajadas; numa delas para de uma vez
    sinoMudo = Math.max(0, sinoMudo - dt);
    if (fora() && Math.hypot(P.pos.x - SINO.x, P.pos.z - SINO.z) < 30 && jog && sinoMudo <= 0 && !placaJan.on) {
      sinoT -= dt;
      if (sinoT <= 0) {
        const ps = noCaminho(SINO, 30); sinoT = rnd(8, 15);
        if (!sinoParou && ++sinoN >= 4 && Math.hypot(P.pos.x - SINO.x, P.pos.z - SINO.z) < 14) { sinoParou = true; S2.sino(ps, 2); sinoMudo = 28; leg('est_sino_para', ps); try { A.toast('Não foi o vento.'); } catch (e) {} }
        else { S2.sino(ps, 3); leg('est_sino_vento', ps); }
      }
    }
    // a dobradiça do portão, em ciclos de 8 a 12 s: o som é a bússola na neblina; quando a chave gira, para de vez
    if (S.done.abrir_portao && !portaoCalou) { portaoCalou = true; leg('est_portao_cala'); }
    if (!portaoCalou && jog && fora() && P.pos.z < GZ + 52) { portaoT -= dt; if (portaoT <= 0) { const pp = { x: 0, y: 1.6, z: GZ }; S2.rangePortao(noCaminho(pp, 30), clamp(1 - Math.max(0, P.pos.z - GZ) / 70, .35, 1)); leg('est_portao_range', noCaminho(pp, 30)); portaoT = rnd(8, 12); } }
    // fios da rua: cada trecho tem o seu tom; sobe e racha quando o morto passa a menos de 18 m; calam quando o portão abre
    const tom = [60, 62.2, 58.4][((Math.floor((P.pos.z + 80) / 34) % 3) + 3) % 3] * (est.perto ? 1.06 : 1);
    try { cm.fio.frequency.setTargetAtTime(tom, t, .5); cm.fio2.frequency.setTargetAtTime(tom * 2, t, .5); } catch (e) {}
    if (est.perto && !est.fioRachou && jog) { est.fioRachou = true; leg('est_fio_racha'); } if (!est.perto && dAm > 26) est.fioRachou = false;
    if (S.done.abrir_portao && !fiosCalaram) { fiosCalaram = true; est.fioCala = 1; est.hushAdd = Math.max(est.hushAdd, 2.5); leg('est_fios_calam'); }
    // o letreiro estala e morre por um instante quando a Lia chega muito perto da porta da loja
    const dPorta = Math.hypot(P.pos.x - 12, P.pos.z + 17);
    if (dPorta < 3.4 && jog && T - neonDe > 40 && !S.flags.luzPostoMorta) { neonDe = T; est.neonCala = 3; S2.rele({ x: 9.6, y: 3.9, z: -17 }, 1.4); leg('est_neon_estala', { x: 9.6, y: 3.9, z: -17 }); }

    // o rádio do carro troca de estação sozinho; às vezes para numa voz baixinha por baixo da estática
    est.estacao = Math.max(0, est.estacao - dt / 3.4);
    if (k.radioLigado && jog && !am.length) {
      radT -= dt;
      if (radT <= 0) {
        radT = rnd(24, 42); est.estacao = 1; const notas = [[262, 330, 392, 330, 262, 294], [349, 392, 440, 392, 349, 330], [220, 262, 330, 262, 220, 196]][(Math.random() * 3) | 0];
        notas.forEach((n, i) => { try { cm.tune.frequency.setValueAtTime(n, t + i * .5); } catch (e) {} }); leg('est_radio_estacao', noCaminho(carPos(1), 30));
        if (!radSus && dCarro < 15 && Math.random() < .45) { radSus = true; setTimeout(() => { if (vivo() && jogando()) { sfx('sussurros', 1.2); leg('est_radio_sussurro', carPos()); } }, 3200); }
      }
    }
    // o rádio de válvula do posto: uma cantiga antiga; ao se afastar, toca um verso a mais do que o disco tinha
    const dVal = Math.hypot(P.pos.x - VALVULA.x, P.pos.z - VALVULA.z);
    if (jog && !S.flags.luzPostoMorta) {
      if (dVal < 11) { val.dentro = true; }
      if (dVal < 24) {
        val.t -= dt;
        if (val.t <= 0) { const dur = tocarFrase(FRASES[val.frase++ % 2], false, .04 + (dVal < 11 ? .02 : 0)); val.t = dur / 1000 + rnd(2.2, 4); if (!val.avisou) { val.avisou = true; leg('est_radio_valvula', noCaminho(VALVULA, 30)); } }
      } else if (val.dentro && dVal > 26 && !val.verso) { val.verso = true; tocarFrase([392, 349, 330, 294, 262], true, .05); setTimeout(() => leg('est_radio_verso', noCaminho(VALVULA, 30)), 900); }
    }

    // o vento que fala: sílabas sibiladas que vêm da mata; perto do carro, o último "diz" um nome
    vozT -= dt;
    if (vozT <= 0 && jog && fora()) {
      vozT = rnd(30, 58);
      if (buraco(P.pos.x, P.pos.z) > .8) {
        const lado = Math.random() < .5 ? -1 : 1, pos = { x: lado * rnd(16, 22), y: 2.5, z: P.pos.z + rnd(-12, 12) }, dur = S2.ventoFala(pos, saiu && dCarro < 14 && !nomeFeito);
        leg('est_vento_fala', pos);
        if (saiu && dCarro < 14 && !nomeFeito && Math.random() < .55) { nomeFeito = true; setTimeout(() => { if (vivo() && jogando()) { sfx('sussurros', 1); leg('est_vento_nome'); } }, dur * 1000); }
      }
    }
    // passos molhados que não são seus: o segundo par tem outro ritmo e para junto com você
    const dx = P.pos.x - seg.lx, dz = P.pos.z - seg.lz, dd = Math.hypot(dx, dz); seg.lx = P.pos.x; seg.lz = P.pos.z;
    if (jog && temChuva() && fora()) {
      if (!seg.ativo) { seg.prox -= dd * .4; if (seg.prox <= 0 && dAm > 30) { seg.ativo = true; seg.t = 0; seg.dist = 0; seg.n = 0; seg.prox = rnd(75, 130); leg('est_passos_atras', P.pos); } }
      else {
        seg.t += dt; seg.dist += dd;
        if (seg.dist >= 1.12) { seg.dist = 0; seg.n++; let dir = { x: 0, z: -1 }; try { const v = A.camera.getWorldDirection(new A.THREE.Vector3()); const L = Math.hypot(v.x, v.z) || 1; dir = { x: v.x / L, z: v.z / L }; } catch (e) {} const pp = { x: P.pos.x - dir.x * 4.5, y: .05, z: P.pos.z - dir.z * 4.5 }; try { SOM.chapinha(pp, .55); } catch (e) {} }
        if (seg.n >= 9 || seg.t > 16) seg.ativo = false;
      }
    } else seg.ativo = false;
    // o cruzamento onde tudo cala: o círculo de 7 m sem bicho, sem vento e sem chuva nas poças; depois, um sino
    const dCruz = Math.hypot(P.pos.x - CRUZ.x, P.pos.z - CRUZ.z);
    if (dCruz < CRUZ.r && jog) {
      cruzT += dt;
      if (cruzT > 1.7 && !cruzAvisou && cruzN < 3) { cruzAvisou = true; cruzN++; sfx('sinoLonge'); leg('est_cruzamento'); if (cruzN === 1) try { A.toast('Aqui não canta bicho nenhum. Aqui não chove.'); } catch (e) {} }
    } else if (dCruz > CRUZ.r + 2) { cruzT = 0; cruzAvisou = false; }
    // neblina: assovio fino de cabos no lugar da chuva e, de vez em quando, sussurros em fila
    if (clima() === 'neblina') {
      criarNeblina();
      if (nebG) try { nebG.gain.setTargetAtTime(fora() && jog ? .012 * (1 - est.fioCala) * buraco(P.pos.x, P.pos.z) : 0, t, .6); } catch (e) {}
      nebFilaT -= dt; if (nebFilaT <= 0 && jog && fora() && saiu) { nebFilaT = rnd(40, 80); S2.sussurroFila(); leg('est_neblina_fila'); }
    }
  }
  const trovao = () => { setTimeout(() => { if (vivo() && fora()) { S2.ecoTrovao(); leg('est_trovao_eco'); } }, 1200 + Math.random() * 300); }; // o vale devolve o trovão
  const granizo = () => { granizoT = 2.6; };
  return { tick, ruidoMul, trovao, granizo, caesVivos: () => caes.some(d => d.vivo) };
}
