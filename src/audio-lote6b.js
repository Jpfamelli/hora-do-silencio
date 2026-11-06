// =====================================================================
// ÁUDIO — LOTE 6, 2ª RODADA ("A casa lembra o que você fez": rejogabilidade pelo ouvido)
// A segunda jogada em diante ganha uma camada de memória sonora:
//  - o rádio noticia a SUA última morte (sala, causa e hora reais) e o seu trajeto;
//  - a sua voz (opcional, só na memória) volta distorcida no meio da noite;
//  - o aviso da Procissão, as badaladas e o assobio do Inspetor mudam por semente;
//  - mutadores sonoros (buraco de som, pistas que mentem, sala do silêncio);
//  - ferramentas de ouvido para quem já conhece a casa (ouvido atento, estalo de dedos);
//  - a casa envelhece: eco que cresce com as mortes, corpo da Lia mais surdo, zumbido de ressaca.
// A parte musical (trilha, cantigas, coro, título, créditos, fita .wav) fica em audio-lote6c.js.
// Som 100% procedural. Tudo passivo e à prova de erro; calado no QA (window.__teste / webdriver).
// Ligado ao motor por poucas linhas (procure AUDL6B em jogo.js).
// =====================================================================
import { instalarMusicaL6b } from './audio-lote6c.js';

const LEGENDAS = {
  l6b_boletimMorte: { t: 'a Serra FM lê a notícia da sua última morte', imp: 1, cd: 30, cat: 'h' },
  l6b_radioMorte: { t: 'um rádio distante repete a sua morte como notícia', imp: 1, cd: 40, cat: 'h', pos: a => a[0] },
  l6b_daviCorta: { t: 'o Davi corta o locutor, com pressa', imp: 1, cd: 20, cat: 'h' },
  l6b_vozSua: { t: 'a sua própria voz chama você, picotada, de uma sala vizinha', imp: 1, cd: 30, cat: 'p', pos: a => a[0] },
  l6b_horaReal: { t: 'a casa sabe a sua hora: o sino bate pela hora de verdade', imp: 1, cd: 30, cat: 'h' },
  l6b_procSino: { t: 'um sininho de brinquedo toca três vezes: a Procissão está perto', imp: 1, cd: 12, cat: 'p' },
  l6b_procRisada: { t: 'uma criança ri ao longe: a Procissão está perto', imp: 1, cd: 12, cat: 'p', pos: a => a[0] },
  l6b_procHino: { t: 'o hino toca de trás para a frente: a Procissão está perto', imp: 1, cd: 12, cat: 'p' },
  l6b_procChiado: { t: 'o rádio chia fundo: a Procissão está perto', imp: 1, cd: 12, cat: 'p' },
  l6b_badaladaTimbre: { t: 'a badalada soa como {0}', imp: 0, cd: 2, cat: 'h' },
  l6b_badaladaExtra: { t: 'o relógio bateu uma a mais: alguém conta errado', imp: 1, cd: 20, cat: 'p' },
  l6b_buraco: { t: '[o som caiu a zero. olhe ao redor.]', imp: 1, cd: 30, cat: 'p' },
  l6b_buracoVolta: { t: '[o som voltou de uma vez]', imp: 1, cd: 30, cat: 'p' },
  l6b_pistaChaveiro: { t: 'um chaveiro tilinta de novo e de novo', imp: 1, cd: 14, cat: 'p', pos: a => a[0] },
  l6b_pistaPassos: { t: 'passos de metal vêm de perto', imp: 1, cd: 14, cat: 'p', pos: a => a[0] },
  l6b_pistaResp: { t: 'uma respiração rouca atrás da parede', imp: 1, cd: 14, cat: 'p', pos: a => a[0] },
  l6b_pistaFalsa: { t: 'um clique seco: era só um cano velho. nada se mexe.', imp: 1, cd: 14, cat: 'h' },
  l6b_ressaca: { t: 'um zumbido distante: a sua cabeça ainda lateja da última vez', imp: 0, cd: 60, cat: 'h' },
  l6b_estouro: { t: 'o estouro deixa um zumbido agudo: os sons distantes sumiram', imp: 1, cd: 10, cat: 'p' },
  l6b_ecoCasa: { t: 'o eco da casa demora mais a morrer', imp: 0, cd: 120, cat: 'h' },
  l6b_gritoDobrado: { t: 'o seu último grito volta como uma segunda voz', imp: 1, cd: 20, cat: 'h' },
  l6b_silencioSala: { t: 'o silêncio engoliu tudo: este cômodo não devolve nada', imp: 1, cd: 25, cat: 'p' },
  l6b_silencioSai: { t: 'o som volta de repente: você saiu do cômodo mudo', imp: 1, cd: 25, cat: 'p' },
  l6b_ouvidoInicio: { t: 'você prende a respiração e apura o ouvido', imp: 0, cd: 6, cat: 'h' },
  l6b_ouvidoEle: { t: 'ele está {0}', imp: 1, cd: 2, cat: 'p' },
  l6b_ouvidoAna: { t: 'a Menina está {0}', imp: 1, cd: 2, cat: 'p' },
  l6b_ouvidoNada: { t: 'nada se mexe por perto', imp: 0, cd: 6, cat: 'h' },
  l6b_ouvidoFim: { t: 'o ouvido cansa: espere para escutar de novo', imp: 0, cd: 6, cat: 'h' },
  l6b_estalo: { t: 'o estalo volta pelas paredes: {0}', imp: 0, cd: 1, cat: 'h' },
  l6b_fitaAvesso: { t: 'a fita ao contrário diz: "{0}"', imp: 1, cd: 10, cat: 'h' },
  l6b_tocaFitas: { t: 'o toca-fitas de bolso arrasta e engasga com o perigo', imp: 0, cd: 60, cat: 'p' },
  l6b_sapato: { t: '{0}', imp: 0, cd: 3, cat: 'p', pos: a => a[1] },
  l6b_assinatura: { t: 'um acorde único: um capítulo inteiro sem barulho nenhum', imp: 1, cd: 8, cat: 'h' },
  l6b_ecoErro: { t: 'de longe, o som que te entregou da última vez toca sozinho', imp: 1, cd: 30, cat: 'p', pos: a => a[0] },
  l6b_assobioMorte: { t: 'a Lia assobia sem perceber: foi aqui que ela morreu antes', imp: 1, cd: 30, cat: 'p' },
  l6b_passosRitmo: { t: 'passos atrás de você, no seu ritmo exato', imp: 1, cd: 20, cat: 'p', pos: a => a[0] },
  l6b_respResposta: { t: 'alguém respira de volta, da sala ao lado', imp: 1, cd: 20, cat: 'p', pos: a => a[0] },
  l6b_trote: { t: 'o telefone interno toca: uma criança ri e dá um número', imp: 1, cd: 40, cat: 'h', pos: a => a[0] },
  l6b_marchinha: { t: 'uma marchinha de carnaval toca no rádio, devagar e desafinada', imp: 0, cd: 60, cat: 'h' },
  l6b_grito: { t: 'o seu grito mais alto da noite: {0}', imp: 1, cd: 10, cat: 'h' },
  l6b_alivio: { t: 'o tema volta limpo: você venceu o capítulo que mais te matou', imp: 1, cd: 20, cat: 'h' },
  l6b_piorNoite: { t: 'o tema desafina e acelera: este é o capítulo que mais te matou', imp: 0, cd: 60, cat: 'p' },
  l6b_coroSala: { t: 'o coro cantarola um nome: "{0}"', imp: 0, cd: 60, cat: 'h' },
  l6b_goteira: { t: 'uma gota cai fora do compasso', imp: 0, cd: 20, cat: 'h', pos: a => a[0] },
  l6b_sonsRaros: { t: '{0}', imp: 0, cd: 30, cat: 'h', pos: a => a[1] },
  l6b_absoluto: { t: 'Ouvido Absoluto: a trilha calou, só o que tem direção sobrou', imp: 0, cd: 120, cat: 'h' }
};

const CONQ = [
  { id: 'l6b_casa', nome: 'A Casa Inteira Ouviu', desc: 'Grite tão alto no microfone que o vizinho acordaria.', secreta: true, charada: 'Liga o microfone e deixa o medo sair.' },
  { id: 'l6b_ouvido', nome: 'Ouvido Treinado', desc: 'Reconheça três humores do Inspetor só pelo assobio.', secreta: true, charada: 'Ele assobia diferente a cada humor. Escute.' },
  { id: 'l6b_silencio', nome: 'Assinatura de Silêncio', desc: 'Termine um capítulo inteiro sem um barulho alto sequer.', secreta: true, charada: 'Nem passo pesado, nem porta batida, nem garrafa.' },
  { id: 'l6b_morcego', nome: 'Morcego', desc: 'Use o estalo de dedos cinco vezes numa noite e volte inteira.', secreta: true, charada: 'Estale os dedos e ouça as paredes responderem.' },
  { id: 'l6b_absoluto', nome: 'Ouvido Absoluto', desc: 'Termine um capítulo no modo Ouvido Absoluto.', secreta: true, charada: 'Sem trilha: só o som que tem lugar.' },
  { id: 'l6b_silenciosa', nome: 'Sala Muda', desc: 'Atravesse a sala do silêncio da noite sem sair do outro lado como entrou.', secreta: true, charada: 'Um cômodo por noite não devolve nada.' }
];

const OPCOES = [
  { k: 'a6Hora', nome: 'Sino pela hora de verdade (hora cheia do seu relógio)', tipo: 'sel', ops: [[1, 'Ligado'], [0, 'Desligado']] },
  { k: 'a6Boletim', nome: 'Rádio noticia a sua última morte e o seu trajeto', tipo: 'sel', ops: [[1, 'Ligado'], [0, 'Desligado']] },
  { k: 'a6Mut', nome: 'Mutadores sonoros (buraco de som, pistas que mentem, sala do silêncio)', tipo: 'sel', ops: [[1, 'Ligados'], [0, 'Desligados']] },
  { k: 'a6Zumbido', nome: 'Zumbido depois de uma morte ou de um estouro', tipo: 'sel', ops: [[1, 'Ligado'], [0, 'Desligado']] },
  { k: 'a6Voz', nome: 'Guardar um trecho da minha voz (microfone; só na memória, nada vai para o disco ou para a internet)', tipo: 'sel', ops: [[0, 'Desligado'], [1, 'Ligado'], ['apagar', 'Apagar a voz guardada agora']] },
  { k: 'a6Fita', nome: 'Toca-fitas de bolso (a música avisa o perigo)', tipo: 'sel', ops: [[0, 'Desligado'], [1, 'Ligado']] },
  { k: 'a6Absoluto', nome: 'Ouvido Absoluto (trilha e apoio mudos, só som com direção)', tipo: 'sel', ops: [[0, 'Desligado'], [1, 'Ligado']] }
];

export function instalarAudioLote6b(C) {
  const OPT = C.OPT;
  // legendas com texto dinâmico: o objeto registrado tem um getter para t (UIX.som lê def.t na hora de mostrar)
  const DIN = {}, TODAS = {};
  function registrarLegendas(dic) {
    for (const [k, d] of Object.entries(dic)) {
      TODAS[k] = d; const def = { imp: d.imp, cd: d.cd, cat: d.cat }; if (d.pos) def.pos = d.pos;
      Object.defineProperty(def, 't', { get: () => DIN[k] || d.t.replace('{0}', ''), enumerable: true });
      try { if (C.legendas) C.legendas[k] = def; } catch (e) {}
    }
  }
  registrarLegendas(LEGENDAS);
  try { const lista = window.ROTEIRO && window.ROTEIRO.conquistas; if (lista) for (const c of CONQ) if (!lista.some(x => x.id === c.id)) lista.push(c); } catch (e) {}
  for (const [k, v] of Object.entries({ a6Hora: 1, a6Boletim: 1, a6Mut: 1, a6Zumbido: 1, a6Voz: 0, a6Fita: 0, a6Absoluto: 0 })) if (OPT[k] === undefined) OPT[k] = v;
  try { if (C.grupos && !C.grupos.some(g => g[0] === 'Som da rejogada')) C.grupos.push(['Som da rejogada', OPCOES]); } catch (e) {}

  const ac = () => C.AC;
  const leg = (k, ...a) => { try { const d = TODAS[k]; if (d && d.t.includes('{0}') && typeof a[0] === 'string') DIN[k] = d.t.replace('{0}', a[0]); C.som(k, a); } catch (e) {} };
  const conq = id => { try { C.conquista && C.conquista(id); } catch (e) {} };
  const lsGet = C.lsGet || ((k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } });
  const lsSet = C.lsSet || ((k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} });
  const qa = () => !window.__L6BFORCE && !!(window.__teste || (typeof navigator !== 'undefined' && navigator.webdriver));
  const fin = n => Number.isFinite(n);
  const hz = n => 261.63 * Math.pow(2, n / 12);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[(Math.random() * arr.length) | 0];

  // -------- PRNG por semente (mesma família do audio-lote6.js) --------
  function mkRng(str) {
    let h = 2166136261 >>> 0; str = String(str || 'semente');
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function h01(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return ((h >>> 0) % 100003) / 100003; }

  // -------- memória entre noites --------
  const MEM_KEY = 'hora-silencio-l6b';
  let MEM = null, memCd = 0;
  const mem = () => {
    if (!MEM) {
      MEM = lsGet(MEM_KEY, {}) || {};
      MEM.ult = MEM.ult || null; MEM.rota = MEM.rota || []; MEM.mortesSala = MEM.mortesSala || {}; MEM.mortesCap = MEM.mortesCap || {};
      MEM.melodia = MEM.melodia || []; MEM.gritoMax = MEM.gritoMax || 0; MEM.humores = MEM.humores || {}; MEM.contaSeed = MEM.contaSeed || String((Math.random() * 1e9) | 0);
      MEM.mortes = MEM.mortes || 0; MEM.dicaOuvido = MEM.dicaOuvido || 0;
    }
    return MEM;
  };
  const gravar = () => { memCd = 3; };
  const salvarJa = () => { try { if (MEM) lsSet(MEM_KEY, MEM); } catch (e) {} memCd = 0; };

  const STATS_KEY = 'hora-silencio-stats';
  const stats = () => lsGet(STATS_KEY, {}) || {};
  const noiteN = () => { const s = stats(); return Math.max(s.partidas || 0, s.concluidas || 0); };
  const venceu = () => !!((stats().finais || {}).verdadeiro);
  const rejogo = () => noiteN() >= 2 || !!(C.S && C.S.replay);

  // estado de execução
  const L = {
    pronto: false, nodes: null, nightKey: null, semente: null,
    capPrev: -1, roomPrev: null, deadPrev: false, rota: [],
    boletimFeito: false, radioCd: 90, radioFeitos: 0,
    horaUlt: -1, horaCheck: 0,
    procPrev: null, procVar: 0,
    sinoN: 0, sinoUlt: -99, timbres: [], ninthExtra: false,
    buracoFeito: false, buracoT: 0, buracoAlvo: 0, buracoAte: 0,
    pistaCd: 0, pistaFeitas: 0,
    ressacaAte: 0, ressacaPend: false, estouroAte: 0,
    salaMuda: null, salaMudaDentro: false, salaMudaCd: 0, salaMudaOk: false, salaMudaAviso: false,
    ouv: { hold: 0, ativo: false, t: 0, cd: 0, pings: 0 }, estalo: { cd: 0, n: 0, prev: false },
    passosT: [], ghost: null, ghostCd: 40, vel: 0, posPrev: null, parado: 0,
    respCd: 0, respPrev: false, respFim: -9,
    fitaB: 0, fitaBOn: false,
    tocaT: 0, tocaN: 0, tocaProc: 0,
    altosCap: 0, altoPrev: false, capAltos: 0,
    telefoneCd: 0, telefoneFeito: false,
    assobioCd: 0, assobioSalas: {},
    ecoErroFeito: false, ecoErroCd: 0,
    marchaFeita: false,
    sonsCd: 60, goteiraT: 0, goteiraPos: null, goteiraPad: null, goteiraI: 0,
    gritoPico: 0, absOn: false, absCapOk: true,
    avisouCorpo: false, corpoK: -1, ecoK: -1
  };

  // =================== helpers de áudio ===================
  function pos3(pos, y, bus, wet) {
    const x = pos && +pos.x, z = pos && +pos.z;
    if (!fin(x) || !fin(z)) return C.saida(null, wet ?? .5, bus || 'amb');
    return C.saida({ x, y: fin(y) ? y : 1.6, z }, wet ?? .5, bus || 'amb');
  }
  function pontoAoRedor(dmin, dmax) {
    const P = C.P; const a = rnd(0, 6.283), d = rnd(dmin, dmax);
    return { x: P.pos.x + Math.cos(a) * d, z: P.pos.z + Math.sin(a) * d };
  }
  // ponto de uma sala vizinha (onde o som não sai do nada na parede da sua frente)
  function pontoVizinho() {
    try {
      const W = C.W, P = C.P; if (!W.salas || !P.room) return pontoAoRedor(7, 12);
      const viz = W.salas.filter(r => r !== P.room && !r.fora && C.salaAdj && C.salaAdj(r, P.room));
      const r = viz.length ? pick(viz) : null;
      if (r) return { x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2 };
    } catch (e) {}
    return pontoAoRedor(7, 12);
  }
  const calmo = (ctx) => ctx && ctx.jogando && ctx.est !== 'caca' && ctx.est !== 'bote' && ctx.est !== 'alerta' && (ctx.perigo || 0) < .4 && !C.S.hidden && !C.PROC.fase;
  const salaNome = r => { try { return (r && (r.nome || r.id)) || 'um cômodo'; } catch (e) { return 'um cômodo'; } };
  const horaTxt = ts => { const d = new Date(ts); const h = d.getHours(), m = d.getMinutes(); return m === 0 ? `${h}h em ponto` : `${h}h${String(m).padStart(2, '0')}`; };

  // sub-módulo musical (trilha, cantigas, coro, título, créditos, fita)
  const X = { C, registrarLegendas, ac, leg, conq, lsGet, lsSet, qa, fin, hz, rnd, pick, mkRng, h01, mem, gravar, stats, noiteN, venceu, rejogo, pos3, pontoAoRedor, pontoVizinho, calmo, salaNome, L };
  const MU = instalarMusicaL6b(X);

  // =================== montagem dos nós contínuos ===================
  function montar() {
    const A = ac(); if (!A || L.nodes) return;
    const BUS = C.BUS, AUD = C.AUD, N = {};
    // zumbido (ressaca e estouro): senoide aguda, sempre calada até ser chamada
    N.zumG = A.createGain(); N.zumG.gain.value = 0; N.zumO = A.createOscillator(); N.zumO.type = 'sine'; N.zumO.frequency.value = 7800; N.zumO.connect(N.zumG); N.zumG.connect(BUS.corpo); N.zumO.start();
    // eco da casa que cresce com as mortes: revIn -> filtro -> atraso com realimentação -> vácuo
    try {
      if (AUD.revIn && AUD.vacuo) {
        N.ecoLp = A.createBiquadFilter(); N.ecoLp.type = 'lowpass'; N.ecoLp.frequency.value = 1800;
        N.ecoD = A.createDelay(1.5); N.ecoD.delayTime.value = .3;
        N.ecoFb = A.createGain(); N.ecoFb.gain.value = 0; N.ecoG = A.createGain(); N.ecoG.gain.value = 0;
        AUD.revIn.connect(N.ecoLp); N.ecoLp.connect(N.ecoD); N.ecoD.connect(N.ecoFb); N.ecoFb.connect(N.ecoD); N.ecoD.connect(N.ecoG); N.ecoG.connect(AUD.vacuo);
      }
    } catch (e) {}
    // corpo da Lia que fica surdo: BUS.corpo -> passa-baixa -> master
    try {
      if (BUS.corpo && C.master) { N.corpoLp = A.createBiquadFilter(); N.corpoLp.type = 'lowpass'; N.corpoLp.frequency.value = 20000; N.corpoLp.Q.value = .5; BUS.corpo.disconnect(); BUS.corpo.connect(N.corpoLp); N.corpoLp.connect(C.master); }
    } catch (e) { N.corpoLp = null; try { BUS.corpo.connect(C.master); } catch (e2) {} }
    // Ouvido Absoluto: a trilha e os sons de apoio passam por ganhos próprios
    try {
      N.absMus = A.createGain(); N.absMusR = A.createGain(); N.absSus = A.createGain();
      if (BUS.mus && AUD.mundo) { BUS.mus.disconnect(); BUS.mus.connect(N.absMus); N.absMus.connect(AUD.mundo); }
      if (BUS.musR && AUD.revIn) { BUS.musR.disconnect(); BUS.musR.connect(N.absMusR); N.absMusR.connect(AUD.revIn); }
      if (BUS.susto && AUD.sustoCmp) { BUS.susto.disconnect(); BUS.susto.connect(N.absSus); N.absSus.connect(AUD.sustoCmp); }
    } catch (e) {}
    // toca-fitas de bolso
    N.tfG = A.createGain(); N.tfG.gain.value = 0; N.tfLp = A.createBiquadFilter(); N.tfLp.type = 'lowpass'; N.tfLp.frequency.value = 1500; N.tfBp = A.createBiquadFilter(); N.tfBp.type = 'peaking'; N.tfBp.frequency.value = 900; N.tfBp.gain.value = 6;
    N.tfLp.connect(N.tfBp); N.tfBp.connect(N.tfG); N.tfG.connect(BUS.corpo);
    L.nodes = N; L.pronto = true;
    envolverSons();
  }

  // =================== envoltórios dos sons do motor ===================
  const ja = new Set();
  function envolver(nome, fn, antes) {
    const SOM = C.SOM; const o = SOM[nome];
    if (typeof o !== 'function' || ja.has(nome)) return; ja.add(nome);
    SOM[nome] = function (...a) {
      if (antes) { let r; try { r = antes.apply(this, a); } catch (e) { r = undefined; } if (r && r.__l6bSub) return r.v; }
      const ret = o.apply(this, a);
      try { fn.apply(this, a); } catch (e) {}
      return ret;
    };
  }
  const TIMBRES = ['vidro', 'madeira', 'ferro', 'voz', 'água', 'osso', 'papel', 'pedra', 'lata'];
  const TIMBRE_TXT = { vidro: 'vidro batido', madeira: 'madeira oca', ferro: 'ferro velho', voz: 'uma voz de criança', água: 'uma gota grande', osso: 'osso estalando', papel: 'papel rasgado', pedra: 'pedra num poço', lata: 'lata vazia' };
  function envolverSons() {
    const SOM = C.SOM;
    // badaladas do Capítulo II: cada uma ganha um timbre próprio, embaralhado pela semente
    envolver('sino', () => {}, function (vol, pos) {
      const S = C.S, A = ac(); if (!S || !A || qa() || !rejogo()) return;
      if (S.chapter !== 2 || C.W.mapa !== 'terreo' || pos || Math.abs(vol - .45) > .012 || L.emTimbre) return;
      const t = A.currentTime;
      if (t - L.sinoUlt > 6) L.sinoN = 0;
      L.sinoUlt = t; const i = L.sinoN++;
      if (i > 12) return;
      const tim = L.timbres[i % 9] || TIMBRES[i % 9];
      timbreBadalada(tim, i);
      L.emTimbre = true; try { SOM.sino(vol * .5, pos, 1 - i * .005); } finally { L.emTimbre = false; }
      leg('l6b_badaladaTimbre', TIMBRE_TXT[tim] || tim);
      if (i === 8) MU.aposNona && MU.aposNona();
      if (i === 8 && L.extraBad) setTimeout(() => { try { badaladaExtra(); } catch (e) {} }, 2600);
      return { __l6bSub: true, v: undefined };
    });
    // passos no estéreo e no ritmo: guarda o intervalo dos seus passos
    envolver('passo', (vol) => {
      const A = ac(); if (!A) return;
      const t = A.currentTime; L.passosT.push(t); if (L.passosT.length > 10) L.passosT.shift();
      MU.registrar && MU.registrar('passo');
    });
    envolver('ofego', () => { MU.registrar && MU.registrar('resp'); });
    envolver('arfar', () => { MU.registrar && MU.registrar('resp'); });
    envolver('pancada', () => { MU.registrar && MU.registrar('porta'); });
    // vidro estourando perto da Lia deixa zumbido
    envolver('vidro', (x, z) => {
      const P = C.P; if (qa()) return;
      if (fin(x) && fin(z) && Math.hypot(x - P.pos.x, z - P.pos.z) < 3) estouro(1 + Math.random() * .6);
      MU.registrar && MU.registrar('vidro');
    });
    envolver('impacto', (v) => { const A = ac(); if (!A || qa() || v === undefined || v < 1.1 || C.mode !== 'jogo' || !C.S || C.S.dead || A.currentTime - (L.impUlt || -99) < 40) return; L.impUlt = A.currentTime; estouro(.9); });
    // o sapato do Inspetor muda a cada noite
    envolver('passoMonstro', (pos, vol) => {
      if (qa() || !pos || !rejogo()) return;
      sapato(pos, vol == null ? 1 : vol);
    });
    // o grito de morte volta como segunda voz depois de 100 mortes
    envolver('grito', () => {
      if (qa() || mem().mortes < 100) return;
      setTimeout(() => { try { gritoSegundaVoz(); } catch (e) {} }, 850);
    });
  }

  function timbreBadalada(tim, i) {
    const A = ac(), t = A.currentTime, g = C.saida(null, .8, 'mus');
    const f0 = 196 * (1 - i * .005);
    if (tim === 'vidro') { for (const m of [2.4, 3.7, 5.1]) C.osc('sine', f0 * m, t, 2.4, g); C.env(g, t, .002, .09, 2.2); }
    else if (tim === 'madeira') { C.burst(t, .25, 'bandpass', 520, 6, g); C.osc('triangle', f0 * 1.5, t, .5, g); C.env(g, t, .002, .16, .35); }
    else if (tim === 'ferro') { for (const m of [1, 2.76, 5.4]) C.osc('square', f0 * m, t, 1.6, g); C.env(g, t, .004, .045, 1.5); }
    else if (tim === 'voz') { const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0 * 2.5, t); o.frequency.linearRampToValueAtTime(f0 * 2.3, t + .9); const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800; bp.Q.value = 5; o.connect(bp); bp.connect(g); o.start(t); o.stop(t + 1); C.env(g, t, .08, .08, .9); }
    else if (tim === 'água') { const o = A.createOscillator(); o.frequency.setValueAtTime(900, t); o.frequency.exponentialRampToValueAtTime(260, t + .16); o.connect(g); o.start(t); o.stop(t + .3); C.env(g, t, .004, .22, .25); }
    else if (tim === 'osso') { for (let k = 0; k < 3; k++) C.burst(t + k * .05, .03, 'highpass', 2400 + k * 400, 3, g); C.env(g, t, .001, .2, .2); }
    else if (tim === 'papel') { C.burst(t, .6, 'highpass', 2600, .5, g); C.env(g, t, .06, .14, .5); }
    else if (tim === 'pedra') { C.osc('sine', f0 * .5, t, 2.8, g); C.burst(t, .08, 'lowpass', 400, 1, g); C.env(g, t, .005, .3, 2.6); }
    else { C.osc('square', f0 * 3.2, t, .5, g); C.burst(t, .1, 'bandpass', 3000, 4, g); C.env(g, t, .002, .08, .45); }
  }
  function badaladaExtra() {
    const S = C.S; if (!S || S.dead || S.chapter !== 2) return;
    try { C.SOM.sino(.3, null, .96); } catch (e) {}
    leg('l6b_badaladaExtra');
    if (L.extraBad > 1) setTimeout(() => { try { if (C.S && !C.S.dead) C.SOM.sino(.22, null, .94); } catch (e) {} }, 2300);
  }

  // =================== sapatos do Inspetor ===================
  const SAPATOS = [
    { id: 'bota', txt: 'passos secos de bota' },
    { id: 'chinelo', txt: 'passos molhados de chinelo' },
    { id: 'descalco', txt: 'pés descalços colando no chão' }
  ];
  function sapato(pos, vol) {
    const A = ac(), S = C.S; if (!S) return;
    const rng = mkRng((S.semente || 'x') + 'sapato'); const sp = SAPATOS[(rng() * 3) | 0];
    const t = A.currentTime, p = { x: pos.x, y: .2, z: pos.z }, g = C.saida(p, .35, 'ent');
    if (sp.id === 'bota') { C.burst(t, .035, 'highpass', 2600, 2, g); C.burst(t + .02, .06, 'bandpass', 900, 3, g); C.env(g, t, .001, .16 * vol, .09); }
    else if (sp.id === 'chinelo') { C.burst(t, .12, 'lowpass', 700, 2, g); const o = A.createOscillator(); o.frequency.setValueAtTime(260, t); o.frequency.exponentialRampToValueAtTime(110, t + .1); o.connect(g); o.start(t); o.stop(t + .15); C.env(g, t, .004, .17 * vol, .14); const g2 = C.saida(p, .3, 'ent'); C.burst(t + .13, .05, 'highpass', 1800, 2, g2); C.env(g2, t + .13, .002, .09 * vol, .05); }
    else { C.osc('sine', 80, t, .12, g); C.env(g, t, .01, .13 * vol, .1); const g2 = C.saida(p, .2, 'ent'); const f = C.burst(t + .08, .12, 'bandpass', 1200, 2, g2); f.frequency.linearRampToValueAtTime(2400, t + .2); C.env(g2, t + .08, .01, .06 * vol, .1); }
    if (!L.sapatoAvisou) { L.sapatoAvisou = true; leg('l6b_sapato', sp.txt, pos); }
  }

  // =================== zumbido (ressaca / estouro) ===================
  function estouro(forca) {
    if (!OPT.a6Zumbido || OPT.semZumbido) return;
    const A = ac(); if (!A) return;
    try { C.SOM.zumbidoOuvido(forca); } catch (e) {}
    try { C.abafarMundo(.5, 2.4 * forca); } catch (e) {}
    L.estouroAte = A.currentTime + 3.5 * forca;
    leg('l6b_estouro');
  }
  function gritoSegundaVoz() {
    const A = ac(); if (!A) return; const t = A.currentTime, g = C.saida(null, .9, 'voz');
    const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(640, t); o.frequency.exponentialRampToValueAtTime(340, t + .9);
    const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 2; o.connect(bp); bp.connect(g); o.start(t); o.stop(t + 1); C.env(g, t, .03, .05, .9);
    leg('l6b_gritoDobrado');
  }

  // =================== microfone (opcional): voz guardada e medidor de grito ===================
  const V = { estado: null, st: null, sp: null, buf: null, sr: 44100, captando: null, pico: 0, janela: 0, janelaN: 0, nivel: 0, pedido: false };
  function ligarVoz() {
    if (V.estado || V.pedido) return; V.pedido = true;
    const A = ac(); if (!A || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !A.createScriptProcessor) { V.pedido = false; return; }
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }).then(st => {
      try {
        const src = A.createMediaStreamSource(st), sp = A.createScriptProcessor(4096, 1, 1), mudo = A.createGain(); mudo.gain.value = 0;
        src.connect(sp); sp.connect(mudo); mudo.connect(A.destination);
        sp.onaudioprocess = e => { try { processarMic(e.inputBuffer.getChannelData(0), A.sampleRate); } catch (er) {} };
        V.st = st; V.sp = sp; V.src = src; V.mudo = mudo; V.estado = 'ligado'; V.sr = A.sampleRate;
        C.toast('Microfone ligado: um trecho da sua voz fica guardado só na memória deste navegador.');
      } catch (e) { V.estado = null; V.pedido = false; }
    }).catch(() => { V.estado = 'negado'; OPT.a6Voz = 0; try { C.salvarOpt(); } catch (e) {} C.toast('O navegador não liberou o microfone. Nada será gravado.'); });
  }
  function desligarVoz(apagar) {
    try { if (V.sp) { V.sp.onaudioprocess = null; V.sp.disconnect(); } if (V.src) V.src.disconnect(); if (V.st) V.st.getTracks().forEach(t => t.stop()); } catch (e) {}
    V.st = V.sp = V.src = V.mudo = null; V.estado = null; V.pedido = false; V.captando = null;
    if (apagar) { V.buf = null; V.pico = 0; }
  }
  function processarMic(d, sr) {
    let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i];
    const rms = Math.sqrt(s / d.length); V.nivel = rms; if (rms > V.pico) V.pico = rms;
    const S = C.S; if (!S || C.mode !== 'jogo') return;
    if (V.captando) {
      const cap = V.captando; const n = Math.min(d.length, cap.arr.length - cap.i); cap.arr.set(d.subarray(0, n), cap.i); cap.i += n;
      if (cap.i >= cap.arr.length) { V.buf = cap.arr; V.sr = sr; V.captando = null; }
    } else if (!V.buf && S.chapter <= 3 && rms > .035 && !S.dead) {
      V.captando = { arr: new Float32Array(Math.floor(sr * 2.5)), i: 0 };
      const n = Math.min(d.length, V.captando.arr.length); V.captando.arr.set(d.subarray(0, n), 0); V.captando.i = n;
    }
  }
  function tocarVoz() {
    const A = ac(); if (!A || !V.buf) return false;
    let pico = 0; for (let i = 0; i < V.buf.length; i += 8) pico = Math.max(pico, Math.abs(V.buf[i]));
    const k = Math.min(8, .5 / Math.max(.02, pico));
    const b = A.createBuffer(1, V.buf.length, V.sr); const ch = b.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = V.buf[i] * k;
    const pos = pontoVizinho(), g = pos3(pos, 1.5, 'voz', .9);
    const src = A.createBufferSource(); src.buffer = b; src.playbackRate.value = .78;
    const lfo = A.createOscillator(); lfo.frequency.value = 5.5; const lg = A.createGain(); lg.gain.value = 260; lfo.connect(lg); try { lg.connect(src.detune); } catch (e) {}
    const pica = A.createGain(); pica.gain.value = .55; const pl = A.createOscillator(); pl.type = 'square'; pl.frequency.value = 11; const pg = A.createGain(); pg.gain.value = .45; pl.connect(pg); pg.connect(pica.gain);
    const dl = A.createDelay(1); dl.delayTime.value = .27; const fb = A.createGain(); fb.gain.value = .45; const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    src.connect(pica); pica.connect(lp); lp.connect(g); lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(g);
    const t = A.currentTime, dur = b.duration / .78 + 2.2;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.8, t + .1); g.gain.setValueAtTime(.8, t + dur - 1.4); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    src.start(t); lfo.start(t); pl.start(t); lfo.stop(t + dur + .1); pl.stop(t + dur + .1); src.stop(t + dur + .1);
    leg('l6b_vozSua', pos);
    return true;
  }
  const CLASSES = [[.06, 'sussurro'], [.16, 'susto'], [.34, 'grito de verdade'], [9, 'vizinho acordou']];
  function classeGrito(p) { for (const [lim, nome] of CLASSES) if (p < lim) return nome; return 'vizinho acordou'; }
  function mostrarGrito() {
    if (V.estado !== 'ligado' || V.pico < .02) return;
    const nome = classeGrito(V.pico), M6 = mem(); const rec = V.pico > (M6.gritoMax || 0);
    if (rec) { M6.gritoMax = V.pico; gravar(); try { const A = ac(), t = A.currentTime + .3, g = C.saida(null, .6, 'menu'); C.osc('sine', 880, t, .9, g); C.osc('sine', 1318, t + .12, .8, g); C.env(g, t, .01, .08, .8); } catch (e) {} }
    leg('l6b_grito', nome + (rec ? ' (recorde)' : ''));
    try { const d = document.getElementById('death'); if (d) { let el = document.getElementById('l6b-grito'); if (!el) { el = document.createElement('div'); el.id = 'l6b-grito'; el.style.cssText = 'margin:.6em 0;font-size:.85em;opacity:.8;letter-spacing:.06em'; const f = document.getElementById('death-frase'); if (f && f.parentNode) f.parentNode.insertBefore(el, f.nextSibling); else d.appendChild(el); } const barras = Math.max(1, Math.min(12, Math.round(V.pico * 24))); el.textContent = 'grito da noite: ' + '█'.repeat(barras) + '░'.repeat(12 - barras) + '  ' + nome + (rec ? ' · recorde' : ''); } } catch (e) {}
    if (V.pico >= .34) conq('l6b_casa');
    V.pico = 0;
  }

  // =================== boletim da Serra FM sobre a SUA morte ===================
  const CTX_FRASE = {
    escondida: 'foi encontrada dentro de um esconderijo',
    pilha: 'foi encontrada no escuro, sem pilha',
    agarrao: 'foi puxada pelo pescoço',
    ana_armario: 'foi achada dentro de um armário, com uma contagem escrita',
    proc_luz: 'foi alcançada por uma luz que não devia estar acesa'
  };
  const QUEM_FRASE = {
    inspetor: ['foi encontrada sem vida', 'foi achada sem vida, de olhos abertos', 'não respondeu quando chamaram'],
    ana: ['foi encontrada de costas, contando em voz baixa', 'foi achada com a boca ainda no número dez'],
    procissao: ['foi levada pela procissão e largada no chão', 'foi encontrada com as velas apagadas ao redor']
  };
  function montarFraseMorte(u) {
    if (!u) return null;
    const lista = QUEM_FRASE[u.quem] || QUEM_FRASE.inspetor;
    const base = (u.ctx && CTX_FRASE[u.ctx]) || lista[(u.ts % 7) % lista.length];
    const lugar = u.fora ? `ao ar livre, perto de "${u.salaNome}"` : `no cômodo "${u.salaNome}"`;
    return `uma jovem ${base} ${lugar}, às ${horaTxt(u.ts)}`;
  }
  function trajetoTxt() {
    const r = mem().rota || []; const un = []; for (const n of r) if (!un.includes(n)) un.push(n);
    if (un.length < 3) return '';
    const cont = {}; for (const n of r) cont[n] = (cont[n] || 0) + 1;
    const mais = Object.keys(cont).sort((a, b) => cont[b] - cont[a])[0];
    return `A moça passou por "${un[0]}", parou em "${mais}" e acabou em "${un[un.length - 1]}".`;
  }
  const HUMORES = ['paciente', 'nervoso', 'metodico', 'surdo', 'faminto', 'teimoso'];
  const PREV = {
    paciente: 'o vento vem devagar hoje', nervoso: 'o vento vem nervoso hoje', metodico: 'o vento vem em compasso hoje',
    surdo: 'o vento vem torto hoje', faminto: 'o vento vem com fome hoje', teimoso: 'o vento vem teimoso hoje'
  };
  function previsaoTxt() {
    const S = C.S; const sem = (S && S.semente) || 'SEMCOD';
    const real = HUMORES[Math.floor(h01(sem + '|terreo|1|humor') * 6) % 6];
    const mente = h01(sem + '|previsao') < .25;
    const dito = mente ? HUMORES[(HUMORES.indexOf(real) + 1 + Math.floor(h01(sem + '|prev2') * 5)) % 6] : real;
    return PREV[dito];
  }
  function boletimMorte(posicional) {
    const u = mem().ult; if (!u || !OPT.a6Boletim || qa()) return false;
    const A = ac(); if (!A) return false;
    const frase = montarFraseMorte(u); if (!frase) return false;
    const extra = posicional ? '' : ' ' + trajetoTxt();
    const prev = posicional ? '' : ` Previsão da noite: ${previsaoTxt()}.`;
    try { C.SFX.estatica && C.SFX.estatica(posicional ? 1.1 : 1.6, posicional || undefined); } catch (e) {}
    try { C.sub('radio', `Serra FM, plantão: ${frase}.${extra}${prev}`); } catch (e) {}
    leg(posicional ? 'l6b_radioMorte' : 'l6b_boletimMorte', posicional);
    if (!posicional) setTimeout(() => { try { if (C.mode === 'jogo' && !(C.S && C.S.dead)) { C.SFX.estatica && C.SFX.estatica(.5); C.subPequeno('davi', 'Desliga isso. Lia, desliga o rádio. Agora.'); leg('l6b_daviCorta'); } } catch (e) {} }, 7500);
    return true;
  }

  // =================== morte (hook do motor) ===================
  function morte(quem) {
    try {
      const S = C.S, P = C.P, W = C.W, M6 = mem(); if (!S || qa()) return;
      const r = P.room; const ctx = S.causaCtx || null;
      const recente = C.perf - (P.causaRuidoEm || -99) < 6;
      M6.ult = { quem, ctx, sala: (r && r.id) || '?', salaNome: salaNome(r), fora: !!(r && r.fora), mapa: W.mapa, cap: S.chapter, ts: Date.now(), x: Math.round(P.pos.x), z: Math.round(P.pos.z), causaRuido: recente ? P.causaRuido : null };
      M6.mortes = (M6.mortes || 0) + 1;
      const ks = W.mapa + ':' + M6.ult.sala; M6.mortesSala[ks] = (M6.mortesSala[ks] || 0) + 1;
      M6.mortesCap[S.chapter] = (M6.mortesCap[S.chapter] || 0) + 1;
      M6.rota = L.rota.slice(-14);
      gravar();
      L.ressacaPend = true; L.ecoErroFeito = false;
      MU.aoMorte && MU.aoMorte(M6.ult);
      setTimeout(() => { try { mostrarGrito(); } catch (e) {} }, 2200);
    } catch (e) {}
  }

  // =================== procissão: aviso com forma sorteada ===================
  function avisoProcissao() {
    const A = ac(), S = C.S; if (!A || !S || qa() || !rejogo()) return;
    const rng = mkRng((S.semente || 'x') + 'aviso'); const forma = (rng() * 4) | 0; L.procVar = forma;
    const t = A.currentTime;
    if (forma === 0) { try { C.SFX.estatica && C.SFX.estatica(1.6); } catch (e) {} leg('l6b_procChiado'); }
    else if (forma === 1) { for (let k = 0; k < 3; k++) { const g = C.saida(null, .8, 'amb'); C.osc('sine', 1760 * (k % 2 ? 1.12 : 1), t + k * .42, .9, g); C.osc('sine', 3520, t + k * .42, .5, g); C.env(g, t + k * .42, .003, .06, .8); } leg('l6b_procSino'); }
    else if (forma === 2) {
      const pos = pontoAoRedor(14, 20);
      for (const [dl, f0] of [[0, 640], [.55, 760], [1.1, 560]]) { const g = pos3(pos, 1.1, 'amb', .9), o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t + dl); o.frequency.linearRampToValueAtTime(f0 * 1.18, t + dl + .12); o.frequency.linearRampToValueAtTime(f0 * .9, t + dl + .3); const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1100; bp.Q.value = 4; o.connect(bp); bp.connect(g); o.start(t + dl); o.stop(t + dl + .4); C.env(g, t + dl, .02, .045, .3); }
      leg('l6b_procRisada', pos);
    } else {
      const g = C.saida(null, .9, 'amb'); const notas = [196, 261.6, 246.9, 196].reverse();
      notas.forEach((f, i) => { const o = A.createOscillator(); o.type = 'triangle'; o.frequency.value = f; const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1000; o.connect(lp); lp.connect(g); o.start(t + i * .5); o.stop(t + i * .5 + .55); });
      g.gain.setValueAtTime(.0001, t); for (let i = 0; i < 4; i++) { g.gain.exponentialRampToValueAtTime(.05, t + i * .5 + .46); g.gain.setValueAtTime(.0001, t + i * .5 + .5); }
      leg('l6b_procHino');
    }
  }

  // =================== buraco de som ===================
  function buraco(ctx) {
    const A = ac(), AUD = C.AUD, S = C.S;
    if (!OPT.a6Mut || qa() || !rejogo() || L.buracoFeito || !ctx.jogando || S.chapter < 1) return;
    if (!L.buracoAlvo) L.buracoAlvo = rnd(70, 200);
    L.buracoT += 0; // contado no tick
    if (L.buracoT < L.buracoAlvo || !calmo(ctx)) return;
    L.buracoFeito = true; const t = A.currentTime;
    AUD.corte.gain.cancelScheduledValues(t); AUD.corte.gain.setValueAtTime(AUD.corte.gain.value || 1, t); AUD.corte.gain.linearRampToValueAtTime(0, t + .04);
    L.buracoAte = t + 6; AUD.corte.gain.setValueAtTime(0, t + 6); AUD.corte.gain.setValueAtTime(1, t + 6.001);
    leg('l6b_buraco');
    setTimeout(() => { try { if (C.mode === 'jogo' && C.S && !C.S.dead) { C.SOM.passo(.9); leg('l6b_buracoVolta'); } } catch (e) {} }, 6030);
  }

  // =================== pistas que mentem ===================
  function pistaFalsa(ctx, dt) {
    if (!OPT.a6Mut || qa() || !rejogo() || !calmo(ctx) || L.pistaFeitas >= 2) return;
    L.pistaCd -= dt; if (L.pistaCd > 0) return;
    L.pistaCd = rnd(70, 150); if (L.pistaFeitas === 0 && Math.random() < .35) return;
    L.pistaFeitas++;
    const A = ac(), S = C.S, t = A.currentTime, pos = pontoVizinho();
    const v = Math.floor(h01((S.semente || 'x') + '|pista' + L.pistaFeitas) * 3);
    const g = pos3(pos, 1.1, 'ent', .6);
    if (v === 0) { for (let k = 0; k < 7; k++) { const dl = k * rnd(.07, .16); C.burst(t + dl, .06, 'bandpass', rnd(3200, 5200), 12, g); } C.env(g, t, .01, .09, 1.4); leg('l6b_pistaChaveiro', pos); }
    else if (v === 1) { for (let k = 0; k < 5; k++) { const dl = k * .5; C.burst(t + dl, .1, 'bandpass', rnd(1500, 2100), 18, g); C.osc('triangle', 180 + k * 8, t + dl, .12, g); } C.env(g, t, .01, .12, 2.6); leg('l6b_pistaPassos', pos); }
    else { for (let k = 0; k < 3; k++) { const f = C.burst(t + k * .9, .6, 'bandpass', 900, 1.5, g); f.frequency.linearRampToValueAtTime(1300, t + k * .9 + .5); } C.env(g, t, .3, .12, 3); leg('l6b_pistaResp', pos); }
    setTimeout(() => { try { if (C.mode === 'jogo' && C.S && !C.S.dead) { const g2 = C.saida(pos, .2, 'sfx'), t2 = ac().currentTime; C.osc('sine', 2300, t2, .05, g2); C.osc('sine', 1700, t2 + .09, .05, g2); C.env(g2, t2, .002, .12, .18); leg('l6b_pistaFalsa'); } } catch (e) {} }, 3600);
  }

  // =================== sala do silêncio ===================
  function escolherSalaMuda() {
    try {
      const W = C.W, S = C.S; if (!W.salas || W.mapa === 'estrada') { L.salaMuda = null; return; }
      const chave = (S.semente || 'x') + '|' + W.mapa;
      if (L.salaMudaChave === chave) return; L.salaMudaChave = chave;
      const el = W.salas.filter(r => !r.fora && !r.seguro && (r.x1 - r.x0) * (r.z1 - r.z0) >= 9);
      L.salaMuda = el.length ? el[Math.floor(h01(chave + '|muda') * el.length) % el.length] : null;
      L.salaMudaAviso = false; L.salaMudaDentro = false; L.salaMudaOk = false;
    } catch (e) { L.salaMuda = null; }
  }
  function salaMuda(ctx, dt) {
    if (!OPT.a6Mut || qa() || !rejogo()) { if (L.salaMudaDentro) sairSalaMuda(); return; }
    escolherSalaMuda();
    const P = C.P, A = ac(); if (!L.salaMuda || !ctx.jogando) return;
    const dentro = P.room === L.salaMuda;
    if (dentro) {
      L.salaMudaCd -= dt;
      if (!L.salaMudaDentro) { L.salaMudaDentro = true; L.salaMudaOk = true; L.salaMudaCd = 0; leg('l6b_silencioSala'); try { Object.values(C.AUD.rev).forEach(s => s.gain.setTargetAtTime(0, A.currentTime, .15)); } catch (e) {} }
      if (L.salaMudaCd <= 0) { L.salaMudaCd = .55; try { C.abafarMundo(.2, .9); } catch (e) {} }
    } else if (L.salaMudaDentro) sairSalaMuda();
  }
  function sairSalaMuda() {
    L.salaMudaDentro = false; try { C.AUD.sala = null; } catch (e) {}
    try { C.abafarMundo(1, .05); } catch (e) {}
    leg('l6b_silencioSai'); if (L.salaMudaOk) { L.salaMudaOk = false; conq('l6b_silenciosa'); }
  }
  function nomeSalaMuda() { return L.salaMuda ? salaNome(L.salaMuda) : null; }

  // =================== ouvido atento (segure .) e estalo de dedos (,) ===================
  function descreve(dx, dz) {
    const P = C.P, yaw = P.yaw || 0, d = Math.hypot(dx, dz) || 1;
    const fwd = (dx * -Math.sin(yaw) + dz * -Math.cos(yaw)) / d, rgt = (dx * Math.cos(yaw) + dz * -Math.sin(yaw)) / d;
    const lado = Math.abs(fwd) > Math.abs(rgt) ? (fwd > 0 ? 'à frente' : 'atrás de você') : (rgt > 0 ? 'à direita' : 'à esquerda');
    const dist = d < 8 ? 'perto' : d < 18 ? 'a alguns cômodos' : 'longe';
    return `${lado}, ${dist}`;
  }
  function ouvidoAtento(ctx, dt) {
    const O = L.ouv, k = C.keys, A = ac(), S = C.S;
    const livre = ctx.jogando && !C.ui && !S.hidden && rejogo() && !qa();
    if (O.cd > 0) O.cd -= dt;
    const seg = !!(k && k.Period) && livre;
    if (!seg) {
      if (O.ativo) { O.ativo = false; O.cd = Math.max(O.cd, 8); leg('l6b_ouvidoFim'); }
      O.hold = 0; return;
    }
    if (O.cd > 0) return;
    O.hold += dt;
    if (!O.ativo && O.hold > .3) {
      O.ativo = true; O.t = 0; O.pings = 0; leg('l6b_ouvidoInicio');
      const t = A.currentTime, g = C.saida(null, .2, 'corpo'); C.burst(t, 3.1, 'bandpass', 900, 1.5, g); C.env(g, t, .6, .02, 2.6);
    }
    if (O.ativo) {
      O.t += dt;
      if (O.t >= O.pings * 1 + .4 && O.pings < 3) { O.pings++; pingOuvido(); }
      if (O.t >= 3.1) { O.ativo = false; O.cd = 40; O.hold = 0; leg('l6b_ouvidoFim'); }
    }
  }
  function pingOuvido() {
    const A = ac(), P = C.P, M = C.M, ANA = C.ANA, t = A.currentTime; let achou = false;
    const alvos = []; if (M.ativo) alvos.push(['ele', M.pos, 1]); if (ANA.ativa) alvos.push(['ana', ANA.pos, 0]);
    for (const [q, p, ele] of alvos) {
      const dx = p.x - P.pos.x, dz = p.z - P.pos.z, d = Math.hypot(dx, dz) || 1; if (d > 60) continue; achou = true;
      const pd = Math.min(5, Math.max(2, d * .25)); const pos = { x: P.pos.x + dx / d * pd, z: P.pos.z + dz / d * pd };
      const g = pos3(pos, 1.4, 'corpo', .1), f = (ele ? 520 : 380) + Math.max(0, 30 - d) * 18;
      C.osc('sine', f, t, .4, g); C.osc('sine', f * 1.5, t + .12, .3, g); C.env(g, t, .01, .09, .4);
      leg(q === 'ele' ? 'l6b_ouvidoEle' : 'l6b_ouvidoAna', descreve(dx, dz), pos);
    }
    if (!achou) leg('l6b_ouvidoNada');
  }
  function estaloDedos(ctx, dt) {
    const E = L.estalo, k = C.keys, S = C.S, A = ac(), P = C.P;
    if (E.cd > 0) E.cd -= dt;
    const press = !!(k && k.Comma); const edge = press && !E.prev; E.prev = press;
    if (!edge || !ctx.jogando || C.ui || S.hidden || !rejogo() || qa() || E.cd > 0) return;
    E.cd = 2.5; E.n++;
    const t = A.currentTime, g0 = C.saida(null, .1, 'corpo'); C.burst(t, .03, 'highpass', 2600, 1.5, g0); C.env(g0, t, .001, .22, .04);
    try { C.emitNoise(P.pos.x, P.pos.z, 6, true); C.marcarCausa && C.marcarCausa('estalo'); } catch (e) {}
    const yaw = P.yaw || 0, cols = C.W.colliders || []; let menor = 99, menorDir = '';
    for (let i = 0; i < 8; i++) {
      const ang = yaw + i * Math.PI / 4, dx = -Math.sin(ang), dz = -Math.cos(ang); let d = 14;
      for (let r = .5; r <= 14; r += .5) { const x = P.pos.x + dx * r, z = P.pos.z + dz * r; if (cols.some(c => c.on && x >= c.minX && x <= c.maxX && z >= c.minZ && z <= c.maxZ)) { d = r; break; } }
      if (d < menor) { menor = d; menorDir = descreve(dx * d, dz * d).split(',')[0]; }
      const atraso = .05 + d * .028, vol = .2 / (1 + d * .18);
      const pos = { x: P.pos.x + dx * Math.min(d, 6), z: P.pos.z + dz * Math.min(d, 6) };
      const g = pos3(pos, 1.3, 'corpo', .5); C.burst(t + atraso, .05, 'bandpass', 2200 - d * 60, 2, g); C.env(g, t + atraso, .003, vol, .14);
    }
    leg('l6b_estalo', menor >= 14 ? 'nenhuma parede por perto' : `a parede mais próxima fica ${menorDir}`);
    if (E.n >= 5) conq('l6b_morcego');
  }

  // =================== fita ao avesso (segure B com uma fita tocando, depois do final verdadeiro) ===================
  const AVESSO = ['ele não é o culpado', 'a cova do meio está vazia', 'conta de trás para a frente', 'fui eu que abri a gaveta', 'a Celeste sabe o nome', 'o sino não toca por nós'];
  function vozReversa() {
    const A = ac(), sr = A.sampleRate, dur = 1.8, n = Math.floor(sr * dur), b = A.createBuffer(1, n, sr), d = b.getChannelData(0);
    const formantes = [[800, 1200], [500, 1800], [300, 2300], [500, 900], [320, 800]]; let ph = 0;
    for (let s = 0; s < 6; s++) {
      const [f1, f2] = formantes[s % 5], ini = Math.floor(n * s / 6), fim = Math.floor(n * (s + .8) / 6), f0 = 120 + (s % 3) * 12;
      for (let i = ini; i < fim; i++) { const x = (i - ini) / (fim - ini), e = Math.sin(Math.PI * x); ph += f0 / sr; let v = 0; for (let h = 1; h < 24; h++) { const f = h * f0; const w = Math.exp(-Math.pow((f - f1) / 180, 2)) + .6 * Math.exp(-Math.pow((f - f2) / 260, 2)); v += Math.sin(2 * Math.PI * ph * h) * w / h; } d[i] = v * e * .12; }
    }
    d.reverse(); return b;
  }
  function fitaAvesso(ctx, dt) {
    const k = C.keys, A = ac(), fita = C.fita;
    const seg = !!(fita && k && k.KeyB && ctx.jogando && venceu() && !qa());
    if (!seg) { L.fitaB = 0; L.fitaBOn = false; return; }
    L.fitaB += dt;
    if (L.fitaB > 1.4 && !L.fitaBOn) {
      L.fitaBOn = true; const g = C.saida(null, .5, 'voz'); const src = A.createBufferSource(); src.buffer = vozReversa(); src.connect(g); const t = A.currentTime; g.gain.setValueAtTime(.9, t); src.start(t);
      const fr = AVESSO[Math.floor(h01('avesso' + (fita.id || fita.titulo || '')) * AVESSO.length) % AVESSO.length];
      leg('l6b_fitaAvesso', fr);
      try { C.subPequeno('lia', '(a fita, ao contrário: ' + fr + ')'); } catch (e) {}
      const M6 = mem(); M6.avesso = M6.avesso || {}; M6.avesso[fita.id || '?'] = 1; gravar();
    }
  }

  // =================== toca-fitas de bolso ===================
  const MELO_TF = [0, 4, 7, 4, 2, 5, 9, 5];
  function tocaFitas(ctx, dt) {
    const N = L.nodes, A = ac(), S = C.S, M = C.M, PROC = C.PROC; if (!N) return;
    const on = !!OPT.a6Fita && ctx.jogando && !qa();
    N.tfG.gain.setTargetAtTime(on ? .014 : 0, A.currentTime, .4);
    if (!on) return;
    const dM = ctx.dM, est = ctx.est, proc = !!PROC.fase;
    L.tocaT -= dt;
    // o pitch arrasta quando ele chega perto, a fita pula na caçada e engasga com a Procissão
    const arrasto = dM < 14 ? -Math.round((1 - dM / 14) * 900) : 0;
    if (L.tocaT <= 0) {
      L.tocaT = est === 'caca' ? .17 : .36;
      const f = hz(MELO_TF[L.tocaN++ % MELO_TF.length] + (est === 'caca' ? 12 : 0)), t = A.currentTime;
      const o = A.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = arrasto + (proc ? Math.sin(t * 9) * 80 : 0);
      const g = A.createGain(); o.connect(g); g.connect(N.tfLp);
      const pula = est === 'caca' && Math.random() < .35;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(pula ? .0002 : 1, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .3);
      o.start(t); o.stop(t + .34);
    }
    if (proc) N.tfG.gain.setTargetAtTime(Math.sin(A.currentTime * 16) > 0 ? .04 : .004, A.currentTime, .02);
    if (!L.tocaAvisou) { L.tocaAvisou = true; leg('l6b_tocaFitas'); }
  }

  // =================== Ouvido Absoluto ===================
  function ouvidoAbsoluto(ctx) {
    const N = L.nodes, A = ac(); if (!N || !N.absMus) return;
    const on = !!OPT.a6Absoluto; const t = A.currentTime;
    N.absMus.gain.setTargetAtTime(on ? .22 : 1, t, .3); N.absMusR.gain.setTargetAtTime(on ? .15 : 1, t, .3); N.absSus.gain.setTargetAtTime(on ? .55 : 1, t, .3);
    if (on && ctx.jogando && !L.absAviso) { L.absAviso = true; leg('l6b_absoluto'); }
  }

  // =================== zumbido de ressaca e voz da casa ===================
  function ressaca(ctx, dt) {
    const N = L.nodes, A = ac(), S = C.S, t = A.currentTime;
    let alvo = 0;
    if (OPT.a6Zumbido && !OPT.semZumbido && !qa()) {
      if (L.ressacaPend && !S.dead && ctx.jogando) { L.ressacaPend = false; L.ressacaAte = t + 20; leg('l6b_ressaca'); }
      if (t < L.ressacaAte) alvo = .006 * ((L.ressacaAte - t) / 20);
      if (t < L.estouroAte) alvo = Math.max(alvo, .012);
    }
    N.zumG.gain.setTargetAtTime(alvo, t, .5);
  }
  function casaEnvelhece() {
    const N = L.nodes, A = ac(), M6 = mem(); if (!N) return;
    const m = M6.mortes || 0, noites = noiteN(); const t = A.currentTime;
    // eco que cresce com as mortes
    if (N.ecoG) {
      const k = Math.min(1, m / 100);
      N.ecoG.gain.setTargetAtTime(Math.min(.3, m * .0035), t, 1);
      N.ecoFb.gain.setTargetAtTime(Math.min(.5, .05 + m * .004), t, 1);
      N.ecoD.delayTime.setTargetAtTime(Math.min(.55, .2 + m * .007), t, 1);
      if (L.ecoK < 0) { L.ecoK = k; if (m >= 5) setTimeout(() => leg('l6b_ecoCasa'), 20000); }
    }
    // corpo da Lia mais surdo a cada 3 noites
    if (N.corpoLp) { const k = Math.floor(Math.max(0, noites - 1) / 3); N.corpoLp.frequency.setTargetAtTime(k <= 0 ? 20000 : Math.max(1400, 9000 / (1 + k * .55)), t, 1); }
  }

  // =================== relógio de verdade ===================
  function horaReal(ctx, dt) {
    if (!OPT.a6Hora || qa() || !ctx.jogando) return;
    L.horaCheck -= dt; if (L.horaCheck > 0) return; L.horaCheck = 4;
    const d = new Date(), h = d.getHours(), m = d.getMinutes();
    if (m === 0 && h !== L.horaUlt && ctx.est !== 'caca') {
      L.horaUlt = h; const n = Math.min(12, h % 12 || 12);
      for (let i = 0; i < n; i++) setTimeout(() => { try { if (C.mode === 'jogo' && C.S && !C.S.dead) C.SOM.sino(.12, { x: C.P.pos.x + 38, y: 6, z: C.P.pos.z - 24 }, .985); } catch (e) {} }, 800 + i * 2300);
      leg('l6b_horaReal');
    }
    if (m !== 0) L.horaUlt = L.horaUlt === h ? h : L.horaUlt;
  }

  // =================== passos no seu ritmo e respiração que responde ===================
  function ritmoPassos(ctx, dt) {
    const P = C.P, A = ac(), S = C.S;
    // velocidade do jogador
    if (L.posPrev) { const d = Math.hypot(P.pos.x - L.posPrev.x, P.pos.z - L.posPrev.z); L.vel = d / Math.max(.001, dt); } L.posPrev = { x: P.pos.x, z: P.pos.z };
    L.parado = L.vel < .25 ? L.parado + dt : 0;
    const gh = L.ghost;
    if (gh) {
      if (L.parado > .4 || !ctx.jogando || ctx.est === 'caca') { L.ghost = null; return; }
      gh.t -= dt;
      if (gh.t <= 0 && gh.n > 0) {
        gh.t = gh.int; gh.n--; const yaw = P.yaw || 0; const pos = { x: P.pos.x + Math.sin(yaw) * 3.2, z: P.pos.z + Math.cos(yaw) * 3.2 };
        const g = pos3(pos, .15, 'ent', .5), t = A.currentTime; C.burst(t, .11, 'lowpass', 520, 1, g); C.env(g, t, .004, .12, .1);
        if (!gh.leg) { gh.leg = true; leg('l6b_passosRitmo', pos); }
      }
      if (gh.n <= 0) L.ghost = null;
      return;
    }
    L.ghostCd -= dt;
    if (!OPT.a6Mut || qa() || !rejogo() || L.ghostCd > 0 || !calmo(ctx) || L.vel < 1 || L.passosT.length < 6) return;
    if (C.M.ativo && ctx.dM < 25) return;
    const ts = L.passosT; let soma = 0; for (let i = 1; i < ts.length; i++) soma += ts[i] - ts[i - 1];
    const medio = soma / (ts.length - 1); if (medio < .25 || medio > 1.2) return;
    L.ghostCd = rnd(120, 260); if (Math.random() < .4) return;
    L.ghost = { int: medio, t: medio, n: 8, leg: false };
  }
  function respiracaoResposta(ctx, dt) {
    const S = C.S, A = ac(); const prende = !!ctx.prende;
    if (L.respPrev && !prende && ctx.jogando && rejogo() && OPT.a6Mut && !qa() && L.respCd <= 0 && Math.random() < .3) {
      L.respCd = 90; const dl = rnd(2.5, 5);
      setTimeout(() => { try { if (C.mode !== 'jogo' || !C.S || C.S.dead) return; const pos = pontoVizinho(), g = pos3(pos, 1.3, 'ent', .7), t = ac().currentTime; const f = C.burst(t, .9, 'bandpass', 1000, 1.4, g); f.frequency.linearRampToValueAtTime(1500, t + .35); f.frequency.linearRampToValueAtTime(900, t + .9); C.env(g, t, .12, .1, .8); leg('l6b_respResposta', pos); } catch (e) {} }, dl * 1000);
    }
    L.respCd -= dt; L.respPrev = prende;
  }

  // =================== assinatura de silêncio (capítulo sem barulho alto) ===================
  function assinaturaSilencio(ctx) {
    const S = C.S, P = C.P;
    if (ctx.jogando) {
      const alto = P.noiseR >= 12; if (alto && !L.altoPrev) L.capAltos++; L.altoPrev = alto;
    }
    if (S.chapter !== L.capPrev) {
      if (L.capPrev >= 0 && L.capAltos === 0 && S.capT < 10 && !qa() && L.capDurou > 45) {
        const A = ac(), t = A.currentTime;
        for (const [m, a] of [[1, 1], [1.5, .6], [1.89, .45]]) { const g = C.saida(null, .9, 'mus'); C.osc('sine', 220 * m, t, 2.6, g); C.env(g, t, .03, .1 * a, 2.4); }
        leg('l6b_assinatura'); conq('l6b_silencio'); const M6 = mem(); M6.silencios = (M6.silencios || 0) + 1; gravar();
      }
      L.capAltos = 0; L.capDurou = 0;
    }
    L.capDurou = S.capT;
  }

  // =================== assobio onde você morre sempre / eco do erro ===================
  function assobioMorte(ctx, dt) {
    const P = C.P, M6 = mem(), A = ac(), S = C.S;
    const r = P.room; if (!r || r.id === L.roomAssobio) return; L.roomAssobio = r.id;
    if (!ctx.jogando || qa() || !OPT.a6Mut) return;
    const n = M6.mortesSala[C.W.mapa + ':' + r.id] || 0; if (n < 3 || L.assobioSalas[r.id]) return;
    L.assobioSalas[r.id] = 1; if (Math.random() < .25) return;
    const t = A.currentTime, g = C.saida(null, .5, 'corpo');
    [[0, 0], [.4, 3], [.8, -2]].forEach(([dl, st]) => { const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(hz(12 + st), t + dl); o.frequency.linearRampToValueAtTime(hz(12 + st) * 1.03, t + dl + .3); const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1400; bp.Q.value = 3; o.connect(bp); bp.connect(g); o.start(t + dl); o.stop(t + dl + .38); });
    C.env(g, t, .06, .05, 1.3); leg('l6b_assobioMorte');
    try { C.emitNoise(P.pos.x, P.pos.z, 5, true); } catch (e) {}
  }
  function ecoDoErro(ctx, dt) {
    const M6 = mem(), P = C.P, A = ac(), u = M6.ult; if (!u || !u.causaRuido || L.ecoErroFeito || qa() || !OPT.a6Mut || !rejogo()) return;
    if (u.mapa !== C.W.mapa || !calmo(ctx)) return;
    L.ecoErroCd -= dt; if (L.ecoErroCd > 0) return; L.ecoErroCd = 1.5;
    const d = Math.hypot(u.x - P.pos.x, u.z - P.pos.z); if (d > 18 || d < 6) return;
    L.ecoErroFeito = true; const t = A.currentTime, pos = { x: u.x, z: u.z }, g = pos3(pos, 1.2, 'amb', .8), c = u.causaRuido;
    if (c === 'cacos') { C.burst(t, .25, 'highpass', 3200, 1.2, g); C.env(g, t, .002, .12, .22); }
    else if (c === 'porta') { C.burst(t, .3, 'lowpass', 280, 1, g, 0); C.env(g, t, .01, .22, .25); }
    else if (c === 'respirou') { const f = C.burst(t, .7, 'bandpass', 1200, 1.2, g); f.frequency.linearRampToValueAtTime(1700, t + .4); C.env(g, t, .08, .08, .6); }
    else if (c === 'correu' || c === 'tabua') { for (let k = 0; k < 4; k++) { C.burst(t + k * .26, .1, 'lowpass', 420, 1, g); } C.env(g, t, .01, .09, 1.1); }
    else { C.burst(t, .12, 'bandpass', 1600, 3, g); C.env(g, t, .004, .1, .14); }
    leg('l6b_ecoErro', pos);
  }

  // =================== telefone interno: trote ===================
  function trote(ctx, dt) {
    if (qa() || !rejogo() || L.telefoneFeito || !calmo(ctx)) return;
    const W = C.W, S = C.S; if (W.mapa !== 'terreo' && W.mapa !== 'superior') return;
    L.telefoneCd = L.telefoneCd || rnd(100, 260); L.telefoneCd -= dt; if (L.telefoneCd > 0) return;
    L.telefoneFeito = true; const A = ac(), t = A.currentTime, pos = pontoVizinho(), ramal = 200 + Math.floor(h01((S.semente || 'x') + '|ramal') * 99);
    for (let k = 0; k < 4; k++) { const dl = k * 1.6; const g = pos3(pos, 1.1, 'amb', .6); for (let b = 0; b < 8; b++) { C.osc('square', b % 2 ? 480 : 440, t + dl + b * .05, .05, g); } C.env(g, t + dl, .003, .05, .5); }
    const tR = t + 6.6, g2 = pos3(pos, 1.1, 'amb', .5); C.burst(tR, .05, 'highpass', 2500, 1, g2); C.env(g2, tR, .001, .1, .05);
    for (const [dl, f0] of [[.4, 700], [.8, 820], [1.2, 640]]) { const g3 = pos3(pos, 1.1, 'amb', .6), o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, tR + dl); o.frequency.linearRampToValueAtTime(f0 * 1.15, tR + dl + .1); const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200; bp.Q.value = 4; o.connect(bp); bp.connect(g3); o.start(tR + dl); o.stop(tR + dl + .22); C.env(g3, tR + dl, .01, .04, .2); }
    leg('l6b_trote', pos);
    setTimeout(() => { try { if (C.mode === 'jogo' && C.S && !C.S.dead) { C.subPequeno('ana', `ramal ${ramal}... ramal ${ramal}... ramal ${ramal}.`); C.toast(`[ramal ${ramal} anotado no caderno da Lia]`); const M6 = mem(); (M6.ramais = M6.ramais || []).push(ramal); gravar(); } } catch (e) {} }, 7400);
  }

  // =================== TICK ===================
  function recalcNoite() {
    const S = C.S; if (!S) return;
    const st = stats(); const key = (S.semente || 'SEMCOD') + '#' + (st.partidas || 0);
    if (key === L.nightKey) return; L.nightKey = key;
    const rng = mkRng((S.semente || 'SEMCOD') + 'l6b');
    // timbres das 9 badaladas embaralhados pela semente
    const arr = TIMBRES.slice(); for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    L.timbres = arr; L.extraBad = rng() < .5 ? (rng() < .5 ? 1 : 2) : 0;
    Object.assign(L, { boletimFeito: false, radioCd: rnd(140, 280), radioFeitos: 0, buracoFeito: false, buracoT: 0, buracoAlvo: 0, pistaCd: rnd(50, 110), pistaFeitas: 0,
      ghostCd: rnd(60, 160), telefoneFeito: false, telefoneCd: 0, ecoErroFeito: false, assobioSalas: {}, sapatoAvisou: false, tocaAvisou: false, absAviso: false,
      sonsCd: rnd(60, 150), estalo: { cd: 0, n: 0, prev: false }, ouv: { hold: 0, ativo: false, t: 0, cd: 0, pings: 0 }, rota: [], gritoPico: 0, salaMudaChave: null, marchaFeita: false, absCapOk: true });
    V.pico = 0;
    MU.novaNoite && MU.novaNoite(rng);
  }
  function tick(dt, ctx) {
    const A = ac(); if (!A) return;
    montar(); if (!L.pronto) return;
    const S = C.S, P = C.P, W = C.W; if (!S) return;
    ctx = ctx || {};
    try {
      recalcNoite();
      if (memCd > 0) { memCd -= dt; if (memCd <= 0) salvarJa(); }
      // opção da voz
      if (OPT.a6Voz === 'apagar') { desligarVoz(true); OPT.a6Voz = 0; try { C.salvarOpt(); } catch (e) {} C.toast('A voz guardada foi apagada da memória.'); }
      else if (OPT.a6Voz && !qa() && ctx.jogando) ligarVoz();
      else if (!OPT.a6Voz && V.estado === 'ligado') desligarVoz(true);
      L.envT = (L.envT || 0) - dt; if (L.envT <= 0) { L.envT = .4; casaEnvelhece(); ouvidoAbsoluto(ctx); }
      if (S.dead && !L.deadPrev) { L.deadPrev = true; } if (!S.dead) L.deadPrev = false;
      ressaca(ctx, dt);
      if (!ctx.jogando) { MU.tick && MU.tick(dt, ctx, X2()); return; }
      if (!qa()) {
        // rota da noite (para o rádio dedo-duro)
        const r = P.room; if (r && r.id !== L.roomPrev) { L.roomPrev = r.id; const n = salaNome(r); if (L.rota[L.rota.length - 1] !== n) { L.rota.push(n); if (L.rota.length > 40) L.rota.shift(); } }
        // boletim da morte no prólogo
        if (W.mapa === 'estrada' && !L.boletimFeito && rejogo() && mem().ult) { L.boletimT = (L.boletimT || 0) + dt; if (L.boletimT > 30) { L.boletimFeito = true; boletimMorte(null); } }
        // rádios do internato leem o boletim de vez em quando
        if ((W.mapa === 'terreo' || W.mapa === 'superior') && rejogo() && mem().ult && L.radioFeitos < 2 && calmo(ctx)) { L.radioCd -= dt; if (L.radioCd <= 0) { L.radioCd = rnd(160, 320); if (Math.random() < .55) { L.radioFeitos++; boletimMorte(pontoVizinho()); } } }
        // aviso da Procissão
        const fase = C.PROC.fase; if (fase === 'aviso' && L.procPrev !== 'aviso') avisoProcissao(); L.procPrev = fase;
        L.buracoT += dt;
        buraco(ctx); pistaFalsa(ctx, dt); salaMuda(ctx, dt); ouvidoAtento(ctx, dt); estaloDedos(ctx, dt); fitaAvesso(ctx, dt); tocaFitas(ctx, dt);
        horaReal(ctx, dt); ritmoPassos(ctx, dt); respiracaoResposta(ctx, dt); assinaturaSilencio(ctx); assobioMorte(ctx, dt); ecoDoErro(ctx, dt); trote(ctx, dt);
        if (rejogo() && !mem().dicaOuvido && S.chapter >= 1 && S.capT > 25 && calmo(ctx)) { mem().dicaOuvido = 1; gravar(); C.toast('Você já conhece a casa: segure . (ponto) para apurar o ouvido e aperte , (vírgula) para estalar os dedos e ouvir as paredes.'); }
        if (V.buf && S.chapter >= 4 && calmo(ctx) && !L.vozTocada && S.capT > 35) { L.vozTocada = true; tocarVoz(); }
        if (S.chapter < 4) L.vozTocada = false;
        // Ouvido Absoluto: terminar um capítulo inteiro vale a conquista
        if (S.chapter !== L.capAbs) { if (L.capAbs !== undefined && OPT.a6Absoluto && L.absCapOk && S.capT < 10) conq('l6b_absoluto'); L.capAbs = S.chapter; L.absCapOk = !!OPT.a6Absoluto; }
        if (!OPT.a6Absoluto) L.absCapOk = false;
      } else if (S.chapter !== L.capPrev) { /* QA: só atualiza o capítulo */ }
      MU.tick && MU.tick(dt, ctx, X2());
      L.capPrev = S.chapter;
    } catch (e) {}
  }
  // dados que o sub-módulo precisa, atualizados por quadro
  function X2() { return { salaMuda: nomeSalaMuda(), voz: V.buf ? true : false }; }

  function ruidoMul() {
    const S = C.S; if (!S || C.mode !== 'jogo' || qa()) return 1;
    let m = 1;
    if (L.salaMudaDentro) m *= .5;
    if (L.ouv.ativo) m *= .7;
    return m;
  }
  function final(tipo) { try { MU.final && MU.final(tipo); salvarJa(); } catch (e) {} }
  function titulo(dt) { try { MU.titulo && MU.titulo(dt); } catch (e) {} }

  return { tick, morte, ruidoMul, final, titulo, boletimMorte, tocarVoz, nomeSalaMuda, _estado: () => ({ L, V, MEM: mem() }), _mu: MU, _som: C.SOM,
    _t: { avisoProcissao, timbreBadalada, sapato, estouro, gritoSegundaVoz, pingOuvido, vozReversa, badaladaExtra, montarFraseMorte, trajetoTxt, previsaoTxt, mostrarGrito, processarMic, escolherSalaMuda, descreve } };
}
