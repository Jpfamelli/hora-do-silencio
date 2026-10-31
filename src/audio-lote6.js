// =====================================================================
// ÁUDIO — LOTE 6 ("A noite nunca soa igual": rejogabilidade pelo ouvido)
// Camadas de som que fazem CADA noite soar diferente e premiam voltar:
// clima sonoro sorteado pela semente, tema procedural da noite que evolui
// a cada noite sobrevivida, boletim do rádio que lê o seu histórico, sino
// quente de recorde, trilha-fantasma contra o seu melhor tempo, segredos
// que só aparecem depois do final verdadeiro (o Davi baixinho, as fitas com
// camada escondida, os ecos de 1979 legendados), eco da sua run anterior,
// a cantiga da Ana que ganha uma nota por noite e badaladas que soletram.
// Som 100% procedural. Ligado ao motor por poucas linhas (procure AUDL6 em jogo.js).
// =====================================================================

const LEGENDAS = {
  l6_clima_tempestade: { t: 'a tempestade abafa tudo: ele mal ouve seus passos', imp: 0, cd: 60, cat: 'h' },
  l6_clima_garoa: { t: 'uma garoa fina cai sobre o telhado', imp: 0, cd: 60, cat: 'h' },
  l6_clima_vento: { t: 'vento seco corre pelos corredores', imp: 0, cd: 60, cat: 'h' },
  l6_clima_cigarras: { t: 'cigarras cantam lá fora, altas demais', imp: 0, cd: 60, cat: 'h' },
  l6_clima_quietude: { t: 'um silêncio quase total: cada passo seu vaza', imp: 1, cd: 60, cat: 'p' },
  l6_tema: { t: 'um fio de melodia volta, igual a esta noite', imp: 0, cd: 20, cat: 'h' },
  l6_temaNoite: { t: 'o tema soa mais fundo: você já veio tantas vezes', imp: 0, cd: 40, cat: 'h' },
  l6_boletim: { t: 'a Serra FM fala, só pra você', imp: 0, cd: 90, cat: 'h' },
  l6_recordeCap: { t: 'um sino quente marca: seu melhor tempo neste capítulo', imp: 1, cd: 8, cat: 'h' },
  l6_recordeTotal: { t: 'o sino celebra: nunca saiu tão rápido da casa', imp: 1, cd: 8, cat: 'h' },
  l6_fantasmaFrente: { t: 'uma batida sobe: você está à frente do seu fantasma', imp: 0, cd: 10, cat: 'h' },
  l6_fantasmaAtras: { t: 'o som esvazia: o seu fantasma passou na sua frente', imp: 0, cd: 10, cat: 'h' },
  l6_passoFantasma: { t: 'passos macios ecoam a rota da sua melhor corrida', imp: 0, cd: 6, cat: 'h', pos: a => a[0] },
  l6_davi: { t: 'uma melodia de menino assombra a sala calada', imp: 0, cd: 12, cat: 'h', pos: a => a[0] },
  l6_daviFala: { t: 'o Davi comenta baixinho, só pra quem já viu o fim', imp: 1, cd: 14, cat: 'h' },
  l6_eco1979: { t: 'o eco de 1979 agora faz sentido: era uma frase', imp: 1, cd: 16, cat: 'h' },
  l6_fitaCamada: { t: 'por baixo da fita, uma respiração que não estava lá antes', imp: 1, cd: 10, cat: 'h' },
  l6_ecoAnterior: { t: 'baixinho, um som da sua noite passada repete aqui', imp: 1, cd: 30, cat: 'h', pos: a => a[0] },
  l6_cantigaNota: { t: 'a caixinha ganhou mais uma nota desde a última noite', imp: 1, cd: 20, cat: 'h' },
  l6_cantigaCheia: { t: 'a melodia da Ana se completou, enfim', imp: 1, cd: 40, cat: 'h' },
  l6_badaladaCodigo: { t: 'as nove badaladas marcam um ritmo: parece um número', imp: 1, cd: 40, cat: 'h' },
  l6_horaSorteada: { t: 'o relógio marca outra hora: faltam mais badaladas', imp: 0, cd: 60, cat: 'h' },
  l6_sinoNervoso: { t: 'o sino presságio bateu fora de hora', imp: 1, cd: 20, cat: 'p' },
  l6_silencioReal: { t: '[silêncio total. ele gosta assim.]', imp: 1, cd: 60, cat: 'p' },
  l6_radioSecreta: { t: 'uma estação perdida conta um causo da serra', imp: 0, cd: 90, cat: 'h' },
  l6_modoGrave: { t: 'o tema desce de tom: esta não é uma noite comum', imp: 0, cd: 60, cat: 'h' },
  l6_hino: { t: 'o hino do internato volta, mais desafinado a cada noite', imp: 0, cd: 40, cat: 'h' },
  l6_nervos: { t: 'seu coração se assenta: você passou o capítulo inteiro em paz', imp: 1, cd: 8, cat: 'h' },
  l6_codigoFalso: { t: 'num ouvido só, um número sussurrado — não confie nele', imp: 1, cd: 14, cat: 'p' },
  l6_morte: { t: 'onde você morreu antes, uma nota baixa assombra', imp: 0, cd: 10, cat: 'h', pos: a => a[0] }
};

const CONQ = [
  { id: 'l6_ouvido', nome: 'De Olhos Fechados', desc: 'Termine um capítulo com o mundo quase mudo, guiada só pelo perigo.', secreta: true, charada: 'Baixe o volume do mundo e confie no ouvido.' },
  { id: 'l6_cantiga', nome: 'A Caixinha Inteira', desc: 'Complete a melodia da Ana somando as noites.', secreta: true, charada: 'Uma nota a mais a cada noite, até a cantiga fechar.' },
  { id: 'l6_fantasma', nome: 'Correndo Contra Si', desc: 'Termine um capítulo à frente do seu tempo-fantasma.', secreta: true, charada: 'Ganhe de você mesma, com o cronômetro ligado.' },
  { id: 'l6_nervos', nome: 'Nervos de Aço', desc: 'Atravesse um capítulo inteiro mantendo o coração calmo.', secreta: true, charada: 'Sem pânico, do começo ao fim de um capítulo.' }
];

export function instalarAudioLote6(C) {
  const { THREE } = C;
  if (C.legendas) Object.assign(C.legendas, LEGENDAS);
  try { const lista = window.ROTEIRO && window.ROTEIRO.conquistas; if (lista) for (const c of CONQ) if (!lista.some(x => x.id === c.id)) lista.push(c); } catch (e) {}

  const ac = () => C.AC;
  const leg = (k, ...a) => { try { C.som(k, a); } catch (e) {} };
  const lsGet = C.lsGet || ((k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } });
  const lsSet = C.lsSet || ((k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} });
  const STATS_KEY = 'hora-silencio-stats';
  const CAPS_KEY = (C.KEYS && C.KEYS.CAPS_KEY) || 'hora-silencio-v3-caps';
  const ECO_KEY = 'hora-silencio-l6eco';
  const CANT_KEY = 'hora-silencio-l6cantiga';
  const MORTE_KEY = 'hora-silencio-l6mortes';
  const conq = id => { try { C.conquista && C.conquista(id); } catch (e) {} };

  const stats = () => lsGet(STATS_KEY, {}) || {};
  const noiteN = () => (stats().partidas || 0);
  const concluidas = () => (stats().concluidas || 0);
  const venceu = () => { const f = stats().finais || {}; return !!f.verdadeiro; };
  const finaisVistos = () => Object.keys(stats().finais || {}).length;
  const ultimoFinal = () => { const f = stats().finais || {}; let best = null, n = -1; for (const k in f) if (f[k] > n) { n = f[k]; best = k; } return best; };
  const recTotal = () => stats().melhorTotal || 0;
  const caps = () => lsGet(CAPS_KEY, {}) || {};
  const capId = c => { try { return C.R.capitulos[c].id; } catch (e) { return 'c' + c; } };
  const recCapAtual = () => (caps()[capId(C.S ? C.S.chapter : 0)] || {}).tempo || 0;

  // -------- PRNG determinístico a partir da semente da noite --------
  function mkRng(str) {
    let h = 2166136261 >>> 0; str = String(str || 'semente');
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  const CLIMAS = ['tempestade', 'garoa', 'vento', 'cigarras', 'quietude'];
  // escala menor (dó menor natural) em Hz para o tema da noite
  const ESCALA = [261.63, 293.66, 311.13, 349.23, 392.0, 415.3, 466.16, 523.25];

  const L = {
    nodes: null, pronto: false,
    semPrev: null, capPrev: -1, mapaPrev: null, roomPrev: null, fimPrev: false,
    clima: 'garoa', climaMul: 1, tema: [], temaBase: 1, temaTempo: .32, temaVozes: 1, temaGrave: 1,
    horaInicio: 21, codigoBad: 0,
    recAtual: 0, capTultimo: 0, recTotalIni: 0, recAvisouCap: false, recAvisouTotal: false,
    temaCd: 0, boletimFeito: false, boletimCd: 0,
    daviCd: 0, fitaCamadaOn: false, ecoCd: 0, ecoFeito: false,
    cantigaCd: 0, radioSecCd: 0, fantGain: 0,
    climaAvisou: false, horaAvisou: false, modoAvisou: false,
    mudoT: 0, capMudoOk: true, fantFrenteT: 0,
    logSala: {}, logNoiteSem: null,
    cantigaNotas: 0, cantigaAvisou: false,
    hinoCd: 0, stress: 0, stressCapOk: true, deadPrev: false, mortes: null, morteCd: 0, codigoFalsoCd: 0
  };

  // -------- Nós contínuos criados uma vez --------
  function montar() {
    const A = ac(); if (!A || L.nodes) return;
    const BUS = C.BUS, N = {};
    // chuva extra (clima), por cima da base
    N.rainG = A.createGain(); N.rainG.gain.value = 0; const rlp = A.createBiquadFilter(); rlp.type = 'lowpass'; rlp.frequency.value = 3200; N.rainF = rlp;
    N.rainS = C.ruido(true); N.rainS.connect(rlp); rlp.connect(N.rainG); N.rainG.connect(BUS.amb); N.rainS.start();
    // vento seco
    N.ventoG = A.createGain(); N.ventoG.gain.value = 0; const vbp = A.createBiquadFilter(); vbp.type = 'bandpass'; vbp.frequency.value = 520; vbp.Q.value = 1.6;
    N.ventoS = C.ruido(true); N.ventoS.connect(vbp); vbp.connect(N.ventoG); N.ventoG.connect(BUS.amb); N.ventoS.start();
    const vlfo = A.createOscillator(); vlfo.frequency.value = .13; const vlg = A.createGain(); vlg.gain.value = 260; vlfo.connect(vlg); vlg.connect(vbp.frequency); vlfo.start();
    // cigarras: ruído agudo tremulado
    N.cigG = A.createGain(); N.cigG.gain.value = 0; const cbp = A.createBiquadFilter(); cbp.type = 'bandpass'; cbp.frequency.value = 6200; cbp.Q.value = 7;
    N.cigS = C.ruido(true); N.cigS.connect(cbp); cbp.connect(N.cigG); N.cigG.connect(BUS.amb); N.cigS.start();
    const clfo = A.createOscillator(); clfo.type = 'square'; clfo.frequency.value = 42; const clg = A.createGain(); clg.gain.value = .5; clfo.connect(clg); clg.connect(N.cigG.gain); clfo.start();
    // sibilo de quietude (quase tinnitus)
    N.hushG = A.createGain(); N.hushG.gain.value = 0; N.hushO = A.createOscillator(); N.hushO.type = 'sine'; N.hushO.frequency.value = 7400; N.hushO.connect(N.hushG); N.hushG.connect(BUS.amb); N.hushO.start();
    // trilha-fantasma: um grave que respira conforme você ganha/perde do recorde
    N.fantG = A.createGain(); N.fantG.gain.value = 0; N.fantO = A.createOscillator(); N.fantO.type = 'sine'; N.fantO.frequency.value = 50; const flp = A.createBiquadFilter(); flp.type = 'lowpass'; flp.frequency.value = 160; N.fantO.connect(flp); flp.connect(N.fantG); N.fantG.connect(BUS.amb); N.fantO.start();
    L.nodes = N; L.pronto = true;
  }

  const fin = n => Number.isFinite(n);
  function pos3(pos, y, bus, wet) {
    const x = pos && +pos.x, z = pos && +pos.z;
    if (!fin(x) || !fin(z)) return C.saida(null, wet ?? .5, bus || 'amb'); // nunca manda posição não-finita para o panner
    return C.saida({ x, y: fin(y) ? y : 1.6, z }, wet ?? .5, bus || 'amb');
  }

  // -------- recalcula a identidade sonora da noite quando a semente muda --------
  function recalcNoite() {
    const S = C.S; if (!S) return;
    const sem = S.semente || 'SEMCOD';
    if (sem === L.semPrev) return;
    L.semPrev = sem;
    const rng = mkRng(sem);
    // clima sorteado
    L.clima = CLIMAS[(rng() * CLIMAS.length) | 0];
    // tema da noite: 3 ou 4 notas da escala menor
    const n = 3 + ((rng() * 2) | 0);
    L.tema = []; for (let i = 0; i < n; i++) L.tema.push(ESCALA[(rng() * ESCALA.length) | 0]);
    L.temaBase = [.5, .75, 1, 1.5][(rng() * 4) | 0]; // transposição por semente
    L.temaTempo = .24 + rng() * .22;
    if (S.replay) L.temaTempo *= 1.15; // no rejogo o tema soa mais arrastado
    // hora inicial sorteada
    L.horaInicio = [20, 21, 23][(rng() * 3) | 0];
    // número de 3 dígitos que as badaladas "soletram" na rejogada
    L.codigoBad = 100 + ((rng() * 900) | 0);
    // evolução por número de noite: mais vozes e mais grave
    const nn = Math.max(noiteN(), concluidas());
    L.temaVozes = 1 + Math.min(4, Math.floor(nn / 2));
    L.temaGrave = 1 - Math.min(.28, nn * .03);
    // tinta por modo
    if (S.modo && S.modo.umaVida) L.temaGrave *= .88;
    if (S.replay) L.temaGrave *= .94;
    L.climaAvisou = L.horaAvisou = L.modoAvisou = L.boletimFeito = L.ecoFeito = L.cantigaAvisou = false;
    L.cantigaNotas = lsGet(CANT_KEY, 0) || 0;
    // carrega o log de sons da noite ANTERIOR para ecoar, e começa um log novo
    try { L.logAnterior = lsGet(ECO_KEY, {}) || {}; } catch (e) { L.logAnterior = {}; }
    L.logSala = {};
  }

  // grava um evento sonoro simples por sala para a noite seguinte
  function logar(tipo) {
    try { const r = C.P.room; if (!r) return; const id = r.id || 'x'; (L.logSala[id] = L.logSala[id] || []).push(tipo); if (L.logSala[id].length > 4) L.logSala[id].shift(); } catch (e) {}
  }

  // -------- tema procedural da noite --------
  function tocaTema(pos, vol) {
    const A = ac(), t = A.currentTime, g = pos ? pos3(pos, 1.8, 'amb', .6) : C.saida(null, .6, 'mus');
    L.tema.forEach((f, i) => {
      const o = A.createOscillator(); o.type = 'triangle'; o.frequency.value = f * L.temaBase * L.temaGrave;
      const bp = A.createBiquadFilter(); bp.type = 'lowpass'; bp.frequency.value = 1400; o.connect(bp); bp.connect(g);
      o.start(t + i * L.temaTempo); o.stop(t + i * L.temaTempo + L.temaTempo + .3);
      // vozes extras (oitavas) acumuladas por noite
      for (let v = 1; v < L.temaVozes; v++) { const o2 = A.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * L.temaBase * L.temaGrave * (v === 1 ? .5 : 2); o2.detune.value = C.rand(-6, 6) * v; o2.connect(bp); o2.start(t + i * L.temaTempo); o2.stop(t + i * L.temaTempo + L.temaTempo + .2); }
    });
    C.env(g, t, .08, (vol || .045), L.tema.length * L.temaTempo + .4);
  }

  function sinoQuente(total) {
    const A = ac(), t = A.currentTime;
    try { C.SOM.silencio && C.SOM.silencio(.4, .3, true); } catch (e) {} // um respiro: o mundo cala por um instante
    for (const [m, a, dl] of [[1, 1, 0], [1.5, .5, .25], [2, .35, .5]]) { const g = C.saida(null, .9, 'mus'); C.osc('sine', 174.6 * m, t + dl, 3.4, g); C.env(g, t + dl, .02, .22 * a * (total ? 1.2 : 1), 3); }
    leg(total ? 'l6_recordeTotal' : 'l6_recordeCap');
  }

  function nervosDeAco() {
    const A = ac(), t = A.currentTime; const g = C.saida(null, 0, 'corpo');
    for (const k of [0, .5]) { const o = A.createOscillator(); o.frequency.setValueAtTime(52, t + k); o.frequency.exponentialRampToValueAtTime(34, t + k + .18); o.connect(g); C.env(g, t + k, .01, .14 * (k ? .6 : 1), .2); o.start(t + k); o.stop(t + k + .3); }
    conq('l6_nervos'); leg('l6_nervos');
  }

  // boletim da Serra FM lido a partir das suas estatísticas
  function boletim() {
    if (window.__teste) return;
    const A = ac(); if (!A) return;
    const S = C.S, nn = noiteN(), nf = finaisVistos(), rt = recTotal();
    const fmt = s => { s = Math.round(s); const m = (s / 60) | 0, g = s % 60; return `${m} minuto${m === 1 ? '' : 's'}${g ? ' e ' + g + ' segundo' + (g === 1 ? '' : 's') : ''}`; };
    const uf = { comum: 'voltou sem olhar para trás', silencio: 'preferiu o silêncio', verdadeiro: 'descobriu o que houve em 1979' }[ultimoFinal()] || 'não voltou';
    const climaTxt = { tempestade: 'Chuva forte em toda a serra esta noite', garoa: 'Garoa fina na Mantiqueira', vento: 'Vento seco descendo a serra', cigarras: 'Noite quente, de cigarra', quietude: 'Uma calmaria estranha na região' }[L.clima];
    let linha;
    if (nn <= 1) linha = `${climaTxt}. Uma moça parou o carro na estrada velha. Boa sorte, moça.`;
    else if (venceu()) {
      const falta = faltandoNoAcervo();
      linha = falta ? `(chiado) ...${climaTxt}. Dizem que ainda há ${falta} na casa que ninguém achou...` : `(chiado) ...${climaTxt}. A ouvinte já sabe de tudo. Mesmo assim voltou...`;
    } else if (rt) linha = `${climaTxt}. Recorde da estrada velha: ${fmt(rt)}. Alguém ${uf} da última vez.`;
    else linha = `${climaTxt}. ${nn - 1 === 1 ? 'Uma noite' : (nn - 1) + ' noites'} e a moça voltou. ${nf ? nf + ' finais vistos.' : ''}`;
    // linha extra sorteada pela semente e pelo número da noite (2ª, 3ª, 5ª, 9ª)
    const rng = mkRng((S.semente || '') + 'boletim');
    const pool = ['Dizem que ela anda rápido demais.', 'Ninguém mais sobe essa estrada.', 'A chuva não para faz dez dias.', 'Um ônibus sumiu aqui em 79, lembram?', 'Boa noite para quem ainda escuta rádio.'];
    const noiteLinha = { 2: ' Segunda vez que param nesse mesmo lugar.', 3: ' Terceira noite. A serra reparou.', 5: ' Cinco noites. Já é teimosia.', 9: ' Nona noite. Nove badaladas. Coincidência?' }[nn] || '';
    const extra = pool[(rng() * pool.length) | 0] + noiteLinha;
    try { C.SFX && C.SFX.estatica && C.SFX.estatica(1.4); } catch (e) {}
    try { C.sub('radio', linha); } catch (e) {}
    try { setTimeout(() => { if (C.mode === 'jogo' && C.W.mapa === 'estrada') { C.sub('radio', '(chiado) ...' + extra); tocaTema(null, .035); } }, 5200); } catch (e) {} // o tema da noite fecha o boletim como assinatura
    leg('l6_boletim');
  }

  function faltandoNoAcervo() {
    try {
      const R = window.ROTEIRO, S = C.S; if (!R || !S) return '';
      const total = [...(R.notas || []), ...(R.paginas || []), ...(R.fitas || [])].filter(x => !x.secreta);
      const falta = total.filter(x => !((x.linhas ? S.fitas : S.notes) || {})[x.id]).length;
      return falta > 0 ? `${falta} ${falta === 1 ? 'coisa' : 'coisas'}` : '';
    } catch (e) { return ''; }
  }

  // estação secreta de folclore ao fundo (rejogada)
  function radioSecreta(pos) {
    const A = ac(), t = A.currentTime;
    try { C.SFX && C.SFX.estatica && C.SFX.estatica(2, pos); } catch (e) {}
    leg('l6_radioSecreta');
  }

  // badaladas que soletram um número (só depois do final verdadeiro)
  function horaCodificada() {
    const A = ac(); if (!A || !venceu()) return;
    const t = A.currentTime, dig = String(L.codigoBad).split('').map(Number);
    let dl = .4;
    for (const d of dig) {
      for (let i = 0; i < (d || 10); i++) { const g = C.saida(null, .5, 'mus'); C.osc('sine', 1560, t + dl, .12, g); C.env(g, t + dl, .002, .04, .1); dl += .16; }
      dl += .5;
    }
    leg('l6_badaladaCodigo');
  }

  // =============== TICK ===============
  function tick(dt, ctx) {
    const A = ac(); if (!A) return;
    montar();
    const S = C.S, M = C.M, ANA = C.ANA, PROC = C.PROC, P = C.P, W = C.W, now = A.currentTime;
    if (!S) return;
    recalcNoite();
    try {
    const jogando = ctx && ctx.jogando, est = ctx ? ctx.est : (M.ativo ? M.state : null);
    const dM = ctx ? ctx.dM : (M.ativo ? M.pos.distanceTo(P.pos) : 99);
    const fora = ctx ? ctx.fora : false, subsolo = ctx ? ctx.subsolo : false, perigo = ctx ? ctx.perigo : 0;
    const N = L.nodes;

    // ---------- CLIMA SONORO DA NOITE ----------
    if (N) {
      let r = 0, v = 0, c = 0, h = 0;
      if (jogando) {
        const foraK = fora ? 1 : .35, subK = subsolo ? .3 : 1;
        if (L.clima === 'tempestade') { r = .16 * foraK; v = .03; }
        else if (L.clima === 'garoa') { r = .05 * foraK; }
        else if (L.clima === 'vento') { v = .07 * foraK; }
        else if (L.clima === 'cigarras') { c = (fora ? .05 : .015) * (est === 'caca' ? .15 : 1); } // as cigarras calam quando ele caça
        else if (L.clima === 'quietude') { h = C.OPT && C.OPT.semZumbido ? 0 : .003 * (1 + C.clamp((S.fear - 50) / 50, 0, 1.4)); } // o sibilo sobe com o medo
        r *= subK; v *= subK;
      }
      if (N.rainF) N.rainF.frequency.setTargetAtTime(L.clima === 'tempestade' ? 2200 : 4200, now, 1); // tempestade mais grave, garoa mais aguda
      N.rainG.gain.setTargetAtTime(r, now, .8);
      N.ventoG.gain.setTargetAtTime(v, now, .8);
      N.cigG.gain.setTargetAtTime(c, now, 1.2);
      N.hushG.gain.setTargetAtTime(h, now, 1.5);
      if (jogando && !L.climaAvisou) { L.climaAvisou = true; leg('l6_clima_' + L.clima); }
      // trovões ocasionais na tempestade
      if (jogando && L.clima === 'tempestade' && fora) { L.trovaoCd = (L.trovaoCd || 0) - dt; if (L.trovaoCd <= 0 && Math.random() < dt * .06) { L.trovaoCd = C.rand(10, 24); const g = C.saida(null, .6, 'amb'); const o = A.createOscillator(); o.frequency.setValueAtTime(C.rand(40, 60), now); o.frequency.exponentialRampToValueAtTime(24, now + 1.4); o.connect(g); C.burst(now, 1.2, 'lowpass', 300, 1, g); C.env(g, now, .05, .18, 1.4); o.start(now); o.stop(now + 1.6); } }
    }

    // ---------- HORA INICIAL / RELÓGIO SORTEADO ----------
    if (jogando && !L.horaAvisou && W.mapa !== 'estrada' && L.horaInicio !== 21) { L.horaAvisou = true; leg('l6_horaSorteada'); }

    // ---------- AVISO DE MODO (tema mais grave em noites especiais) ----------
    if (jogando && !L.modoAvisou && ((S.modo && S.modo.umaVida) || S.replay)) { L.modoAvisou = true; leg('l6_modoGrave'); }

    // ---------- BOLETIM DO RÁDIO NO PRÓLOGO ----------
    if (jogando && W.mapa === 'estrada' && !L.boletimFeito) {
      L.boletimCd = (L.boletimCd || 0) + dt;
      if (L.boletimCd > 14) { L.boletimFeito = true; boletim(); }
    }

    // ---------- TEMA PROCEDURAL DA NOITE (quando calmo) ----------
    L.temaCd -= dt;
    if (jogando && L.temaCd <= 0 && est !== 'caca' && perigo < .4 && !S.hidden) {
      L.temaCd = C.rand(22, 40);
      tocaTema(null, L.temaVozes > 2 ? .05 : .04);
      if (L.temaVozes > 2 && Math.random() < .5) leg('l6_temaNoite'); else leg('l6_tema');
    }

    // ---------- RECORDE DE CAPÍTULO / TOTAL (sino quente) ----------
    if (S.chapter !== L.capPrev) {
      if (L.capPrev >= 0 && L.recAtual > 0 && L.capTultimo > 0 && L.capTultimo < L.recAtual && !window.__teste) { sinoQuente(false); const cronoOn = C.OPT && (C.OPT.crono || (S.modo && S.modo.crono)); if (cronoOn) conq('l6_fantasma'); }
      L.capPrev = S.chapter;
      L.recAtual = recCapAtual();
      L.recAvisouCap = false;
      // avalia o desafio "mundo mudo" do capítulo anterior
      if (jogando && L.capMudoOk && L.mudoT > 20 && !window.__teste) { conq('l6_ouvido'); leg('l6_silencioReal'); }
      L.capMudoOk = true; L.mudoT = 0;
      // avalia o "Nervos de Aço" do capítulo anterior (coração calmo)
      if (jogando && L.capPrev > 0 && L.stress < 8 && L.capTultimo > 30 && !window.__teste) nervosDeAco();
      L.stress = 0;
    }
    if (jogando) L.capTultimo = S.capT;
    // acompanha o volume do mundo para o desafio "Silêncio Real"
    if (jogando) { const vol = C.OPT ? C.OPT.vol : 1; if (vol <= .12) L.mudoT += dt; else L.capMudoOk = false; }

    // recorde total ao terminar a noite
    if (S.fim && !L.fimPrev) { L.fimPrev = true; if (S.completo && L.recTotalIni > 0 && S.tempo < L.recTotalIni && !window.__teste) sinoQuente(true); }
    if (!S.fim) L.fimPrev = false;
    if (L.recTotalIni === 0) L.recTotalIni = recTotal(); // guarda o recorde de quando a noite começou

    // ---------- TRILHA-FANTASMA CONTRA O RECORDE ----------
    if (N && N.fantG) {
      const cronoOn = C.OPT && (C.OPT.crono || (S.modo && (S.modo.crono || S.modo.umaVida)));
      let alvo = 0;
      if (jogando && cronoOn && L.recAtual > 0 && S.capT > 2) {
        const razao = S.capT / L.recAtual; // <1 à frente, >1 atrás
        if (razao < .97) { alvo = .02 + .03 * C.clamp(1 - razao, 0, .5); N.fantO.frequency.setTargetAtTime(54, now, .5); L.fantFrenteT += dt; if (L.fantFrenteT > 6) { L.fantFrenteT = -4; leg('l6_fantasmaFrente'); } }
        else if (razao > 1.05) { alvo = .012; N.fantO.frequency.setTargetAtTime(38, now, .5); if ((L.fantAtrasCd = (L.fantAtrasCd || 0) - dt) <= 0) { L.fantAtrasCd = 14; leg('l6_fantasmaAtras'); } }
      }
      N.fantG.gain.setTargetAtTime(alvo, now, .5);
    }
    // passos-fantasma suaves marcando a rota recorde
    if (jogando && (C.OPT && (C.OPT.crono || (S.modo && S.modo.crono))) && L.recAtual > 0) {
      L.passoFantCd = (L.passoFantCd || 0) - dt;
      if (L.passoFantCd <= 0 && Math.random() < dt * .3) {
        L.passoFantCd = C.rand(3, 6); const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * C.rand(4, 8), z: P.pos.z + Math.sin(a) * C.rand(4, 8) };
        const g = pos3(pos, .2, 'amb', .5), o = A.createOscillator(); o.frequency.setValueAtTime(70, now); o.frequency.exponentialRampToValueAtTime(34, now + .2); const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400; o.connect(lp); lp.connect(g); C.env(g, now, .01, .05, .2); o.start(now); o.stop(now + .3);
        if (Math.random() < .3) leg('l6_passoFantasma', pos);
      }
    }

    // ---------- SEGREDOS DA 2ª JOGADA (depois do final verdadeiro) ----------
    const viu = venceu();
    // mudança de sala: ganchos de rejogada
    const roomId = (() => { try { return P.room && P.room.id; } catch (e) { return null; } })();
    if (roomId && roomId !== L.roomPrev) {
      L.roomPrev = roomId;
      // o Davi comenta baixinho na rejogada (idea 9,13,43)
      if (viu && S.replay && jogando && !S.hidden && Math.random() < .35 && !window.__teste) {
        const falas = ['aqui eu me escondia.', 'não vai pela esquerda.', 'eu risquei essa parede.', 'ela conta mais rápido aqui.', 'foi aqui que eu parei.'];
        try { C.subPequeno && C.subPequeno('davi', C.pick ? C.pick(falas) : falas[0]); } catch (e) {}
        leg('l6_daviFala');
      }
      // eco de um som da SUA noite anterior, uma vez por noite, nunca em perigo (idea 11,12)
      if (!L.ecoFeito && jogando && !S.hidden && perigo < .3 && L.logAnterior && L.logAnterior[roomId] && Math.random() < .5) {
        L.ecoFeito = true; const tipo = C.pick ? C.pick(L.logAnterior[roomId]) : L.logAnterior[roomId][0];
        const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * 4, z: P.pos.z + Math.sin(a) * 4 };
        ecoDaNoite(tipo, pos); leg('l6_ecoAnterior', pos);
      }
    }
    // leitmotif do Davi nas salas antes caladas (idea 16)
    L.daviCd -= dt;
    if (viu && jogando && !S.hidden && est !== 'caca' && perigo < .3 && L.daviCd <= 0 && Math.random() < dt * .06) {
      L.daviCd = C.rand(18, 34); const a = C.rand(0, 6.28), pos = { x: P.pos.x + Math.cos(a) * C.rand(3, 7), z: P.pos.z + Math.sin(a) * C.rand(3, 7) };
      const g = pos3(pos, 1.2, 'amb', .7);
      for (const [i, f] of [[0, 392], [1, 466], [2, 349]]) { const o = A.createOscillator(); o.type = 'sine'; o.frequency.value = f; const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1000; o.connect(bp); bp.connect(g); o.start(now + i * .3); o.stop(now + i * .3 + .4); }
      C.env(g, now, .1, .035, 1.1); leg('l6_davi', pos);
    }
    // ecos de 1979 legendados (reveal): na rejogada um sussurro ganha sentido
    L.eco79Cd = (L.eco79Cd || 0) - dt;
    if (viu && jogando && !S.hidden && L.eco79Cd <= 0 && Math.random() < dt * .03) {
      L.eco79Cd = C.rand(40, 80); const g = C.saida(null, .6, 'voz'); const s = C.ruido(), f = A.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 5; s.connect(f); f.connect(g);
      C.env(g, now, .2, .05, 1.4); s.start(now); s.stop(now + 1.6); leg('l6_eco1979');
    }
    // camada extra sob as fitas já ouvidas (idea 51)
    try {
      const tocando = C.fita && C.fita();
      if (viu && tocando && !L.fitaCamadaOn) { L.fitaCamadaOn = true; const g = C.saida(null, .3, 'voz'); const s = C.ruido(true), f = A.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 1.4; s.connect(f); f.connect(g); C.env(g, now, .6, .03, 3.4); s.start(now); s.stop(now + 4); leg('l6_fitaCamada'); setTimeout(() => { L.fitaCamadaOn = false; }, 5000); }
      else if (!tocando) L.fitaCamadaOn = false;
    } catch (e) {}
    // estação secreta de folclore ao fundo (rejogada)
    L.radioSecCd = (L.radioSecCd || 0) - dt;
    if (viu && jogando && W.mapa === 'estrada' && L.radioSecCd <= 0 && Math.random() < dt * .04) { L.radioSecCd = 999; radioSecreta(); }

    // ---------- CANTIGA DA ANA QUE GANHA UMA NOTA POR NOITE ----------
    if (ANA && ANA.ativa && jogando && !L.cantigaAvisou) { L.cantigaAvisou = true; if (L.cantigaNotas >= 7) leg('l6_cantigaCheia'); else if (L.cantigaNotas > 0) leg('l6_cantigaNota'); }
    L.cantigaCd -= dt;
    if (ANA && ANA.ativa && jogando && L.cantigaCd <= 0 && Math.random() < dt * .4) {
      L.cantigaCd = C.rand(8, 16);
      const nts = Math.min(8, 1 + L.cantigaNotas); const g = pos3(ANA.pos, 1.4, 'amb', .5);
      for (let i = 0; i < nts; i++) { const o = A.createOscillator(); o.type = 'sine'; o.frequency.value = ESCALA[i % ESCALA.length] * 2 * C.rand(.99, 1.01); o.connect(g); o.start(now + i * .18); o.stop(now + i * .18 + .3); }
      C.env(g, now, .02, .035, nts * .18 + .3);
    }

    // ---------- SINO NERVOSO: presságio fora de hora na rejogada ----------
    if (S.replay && jogando && S.chapter === 2 && W.mapa === 'terreo') {
      L.nervosoCd = (L.nervosoCd || (10 + mkRng(S.semente + 'sino')() * 120));
      L.nervosoCd -= dt;
      if (L.nervosoCd <= 0 && !L.nervosoFeito) { L.nervosoFeito = true; try { C.SOM.sino && C.SOM.sino(.5, null, .99); } catch (e) {} leg('l6_sinoNervoso'); }
    }

    // ---------- HINO DO INTERNATO MAIS DESAFINADO A CADA NOITE ----------
    L.hinoCd -= dt;
    if (jogando && !subsolo && est !== 'caca' && perigo < .35 && L.hinoCd <= 0 && Math.random() < dt * .04) {
      L.hinoCd = C.rand(40, 80); const nn = Math.max(noiteN(), concluidas()), desaf = 1 - Math.min(.1, nn * .012);
      const g = C.saida(null, .7, 'amb');
      for (const [i, f] of [[0, 196], [1, 261.6], [2, 246.9], [3, 196]]) { const o = A.createOscillator(); o.type = 'triangle'; o.frequency.value = f * desaf * (nn >= 9 ? C.rand(.98, 1.02) : 1); const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; o.connect(lp); lp.connect(g); o.start(now + i * .5); o.stop(now + i * .5 + .6); if (nn >= 4) { const o2 = A.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * desaf * .5; o2.connect(lp); o2.start(now + i * .5); o2.stop(now + i * .5 + .6); } }
      C.env(g, now, .2, .03, 2.4); leg('l6_hino');
    }

    // ---------- MEDIDOR DE ESTRESSE ESCONDIDO (Modo Coração) ----------
    if (jogando) { if (S.fear > 60) L.stress += dt * (S.fear - 60) / 40; if (est === 'caca' || (M.ativo && dM < 3)) L.stress += dt * 1.2; }

    // ---------- SUSSURRO COM CÓDIGO FALSO (2ª jogada, um ouvido só) ----------
    L.codigoFalsoCd -= dt;
    if (viu && S.replay && jogando && !S.hidden && L.codigoFalsoCd <= 0 && Math.random() < dt * .02 && A.createStereoPanner) {
      L.codigoFalsoCd = C.rand(50, 100); const g = C.saida(null, .3, 'voz'), pan = A.createStereoPanner(); pan.pan.value = Math.random() < .5 ? -.9 : .9;
      const s = C.ruido(), f = A.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1700; f.Q.value = 6; s.connect(f); f.connect(pan); pan.connect(g);
      C.env(g, now, .15, .06, 1.2); s.start(now); s.stop(now + 1.4); leg('l6_codigoFalso');
    }

    // ---------- TRILHA ONDE VOCÊ MORREU (NG+) ----------
    if (L.mortes === null) { try { L.mortes = lsGet(MORTE_KEY, {}) || {}; } catch (e) { L.mortes = {}; } }
    if (S.dead && !L.deadPrev) { L.deadPrev = true; try { const m = L.mortes[W.mapa] = (L.mortes[W.mapa] || []); m.push({ x: Math.round(P.pos.x), z: Math.round(P.pos.z) }); if (m.length > 12) m.shift(); lsSet(MORTE_KEY, L.mortes); } catch (e) {} }
    if (!S.dead) L.deadPrev = false;
    L.morteCd -= dt;
    if (jogando && !S.hidden && est !== 'caca' && L.morteCd <= 0 && L.mortes && L.mortes[W.mapa]) {
      const lista = L.mortes[W.mapa], perto = lista.find(p => Math.hypot(p.x - P.pos.x, p.z - P.pos.z) < 2.5);
      if (perto && Math.random() < dt * 2) { L.morteCd = 12; const quantas = lista.filter(p => Math.hypot(p.x - perto.x, p.z - perto.z) < 3).length; const g = pos3(perto, 1, 'amb', .7); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(130, now); o.frequency.exponentialRampToValueAtTime(70, now + .6); o.connect(g); C.env(g, now, .1, Math.min(.12, .04 + quantas * .02), .8); o.start(now); o.stop(now + 1); leg('l6_morte', perto); } // quanto mais vezes morreu ali, mais forte a nota
    }

    // ---------- registra sons da noite para ecoar na próxima ----------
    if (jogando) {
      L.logTick = (L.logTick || 0) + dt;
      if (L.logTick > 2 && P.noiseR > 3) { L.logTick = 0; logar(P.sprinting ? 'corrida' : 'passo'); }
      if (S.flashOn && !L.flashPrev) logar('clique');
      L.flashPrev = S.flashOn;
    }
    } catch (e) {} // um erro em qualquer camada de áudio nunca derruba o quadro
  }

  // eco procedural de um tipo de som da noite anterior
  function ecoDaNoite(tipo, pos) {
    const A = ac(), t = A.currentTime, g = pos3(pos, 1.2, 'amb', .7);
    if (tipo === 'corrida' || tipo === 'passo') { for (let i = 0; i < (tipo === 'corrida' ? 4 : 2); i++) { const o = A.createOscillator(); o.frequency.setValueAtTime(70, t + i * .28); o.frequency.exponentialRampToValueAtTime(34, t + i * .28 + .18); const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380; o.connect(lp); lp.connect(g); o.start(t + i * .28); o.stop(t + i * .28 + .25); } C.env(g, t, .02, .05, 1.2); }
    else { C.burst(t, .06, 'highpass', 3000, 1, g); C.env(g, t, .001, .08, .05); }
  }

  // =============== GANCHOS PÚBLICOS ===============
  // o motor avisa que a nona badalada bateu (depois de AUDL5.horaDoSilencio)
  function horaDoSilencio() { try { horaCodificada(); } catch (e) {} }
  // salva o log de sons da noite ao terminar/trocar, e grava progresso da cantiga
  function fecharNoite() {
    try { lsSet(ECO_KEY, L.logSala || {}); } catch (e) {}
    // a cantiga ganha uma nota por noite concluída; ao fechar 8, conquista
    try {
      if (C.S && C.S.completo) { const n = (lsGet(CANT_KEY, 0) || 0) + 1; lsSet(CANT_KEY, n); if (n >= 8) conq('l6_cantiga'); }
    } catch (e) {}
  }
  function climaDaNoite() { return L.clima; }
  function ruidoMul() {
    // o clima da noite abafa (tempestade) ou expõe (quietude) seus passos
    if (!C.S || C.mode !== 'jogo' || window.__teste) return 1; // o teste automático corre com ruído neutro
    if (L.clima === 'tempestade') return .78;
    if (L.clima === 'garoa') return .92;
    if (L.clima === 'quietude') return 1.2;
    if (L.clima === 'vento') return .9;
    return 1;
  }

  return { tick, horaDoSilencio, fecharNoite, climaDaNoite, ruidoMul, boletim, horaCodificada };
}
