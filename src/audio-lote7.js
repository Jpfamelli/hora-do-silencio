// =====================================================================
// ÁUDIO — LOTE 7 ("Som e atmosfera": o silêncio vira arma)
// Camadas de som que dão identidade a cada sala (room tone por função),
// trilha de tensão em camadas presa ao coração e à distância do Inspetor,
// vozes e presenças, a tempestade que se aproxima, e — acima de tudo — o
// silêncio usado como arma: cortes honestos antes do bote, blefes, a
// quietude mentirosa depois da caçada, a Hora sem trilha no clímax.
// Som 100% procedural. Ligado ao motor por poucas linhas (procure AUDL7 em jogo.js).
// =====================================================================

const LEGENDAS = {
  l7_torneira: { t: 'uma torneira pinga na cozinha', imp: 0, cd: 30, cat: 'h' },
  l7_torneiraCala: { t: '[a torneira parou de pingar]', imp: 1, cd: 12, cat: 'p' },
  l7_relogio: { t: 'um relógio tiquetaqueia na parede', imp: 0, cd: 40, cat: 'h' },
  l7_relogioCala: { t: '[o relógio parou]', imp: 1, cd: 12, cat: 'p' },
  l7_molas: { t: 'molas de cama rangem sozinhas, longe', imp: 0, cd: 16, cat: 'h' },
  l7_mosca: { t: 'uma mosca zumbe pela enfermaria', imp: 0, cd: 20, cat: 'h' },
  l7_louca: { t: 'talheres tilintam na mesa posta para 37', imp: 0, cd: 14, cat: 'h' },
  l7_orgao: { t: 'o órgão da capela solta uma nota grave e longa', imp: 0, cd: 30, cat: 'h' },
  l7_assobio: { t: 'o vento assobia pelas janelas quebradas', imp: 0, cd: 24, cat: 'h' },
  l7_cisterna: { t: 'algo pesado caiu na água, lá no fundo', imp: 0, cd: 20, cat: 'h', pos: a => a[0] },
  l7_silencioCaca: { t: '[um silêncio estranho se abre — e o mundo prende o ar]', imp: 1, cd: 18, cat: 'p' },
  l7_silencioBlefe: { t: '[tudo calou... mas nada veio]', imp: 1, cd: 25, cat: 'p' },
  l7_vacuoBote: { t: '[o mundo prendeu o ar]', imp: 1, cd: 6, cat: 'p' },
  l7_cantiga: { t: 'uma cantiga de ninar vem sempre de trás da sua cabeça', imp: 1, cd: 22, cat: 'p' },
  l7_nome: { t: 'a casa sussurra o seu nome de um canto vazio', imp: 1, cd: 30, cat: 'h' },
  l7_evp: { t: 'prendendo o ar, sussurros de criança surgem por baixo do silêncio', imp: 0, cd: 18, cat: 'h' },
  l7_chamada: { t: 'uma freira faz a chamada de 1979, muito longe', imp: 0, cd: 30, cat: 'h' },
  l7_shh: { t: 'crianças cochicham atrás da parede: "fica quieta"', imp: 1, cd: 16, cat: 'p' },
  l7_shhColetivo: { t: 'a casa inteira te manda calar: "shhh"', imp: 1, cd: 10, cat: 'p' },
  l7_liaPanico: { t: 'a Lia murmura para si mesma, sem querer', imp: 0, cd: 8, cat: 'h' },
  l7_granizo: { t: 'o granizo martela o telhado e abafa seus passos', imp: 1, cd: 40, cat: 'p' },
  l7_chuvaPara: { t: '[até a chuva parou]', imp: 1, cd: 14, cat: 'p' },
  l7_tinnitus: { t: 'o silêncio longo demais vira um zumbido no seu ouvido', imp: 0, cd: 20, cat: 'p' },
  l7_pressao: { t: 'uma pressão grave cresce: a casa não gosta que você hesite', imp: 0, cd: 20, cat: 'p' },
  l7_cantoCorte: { t: '[o canto do Inspetor parou no meio da nota]', imp: 1, cd: 10, cat: 'p' },
  l7_alivio: { t: 'um acorde quente resolve: por um fio, você escapou', imp: 1, cd: 8, cat: 'h' },
  l7_eco: { t: 'o clique da lanterna volta do fim do corredor, um tom abaixo', imp: 1, cd: 30, cat: 'p' },
  l7_semScore: { t: '[a trilha sumiu: só restam o seu corpo e a chuva]', imp: 1, cd: 40, cat: 'p' },
  l7_noite: { t: 'um barulho único e sem explicação cruza a noite', imp: 0, cd: 120, cat: 'h', pos: a => a[0] },
  l7_engasgo: { t: 'a Lia engole em seco, quase te entregando', imp: 1, cd: 8, cat: 'p' },
  l7_pizzicato: { t: 'uma corda seca soa de algum canto — ou foi só impressão?', imp: 0, cd: 25, cat: 'h' },
  l7_persiana: { t: 'uma veneziana bate solta ao vento', imp: 0, cd: 18, cat: 'h' },
  l7_portaVento: { t: 'uma porta distante bate sozinha', imp: 0, cd: 16, cat: 'h', pos: a => a[0] },
  l7_estaloGemeo: { t: 'um estalo seco atrás de você, idêntico a um passo', imp: 1, cd: 14, cat: 'p' },
  l7_concussao: { t: 'o baque te deixa com o ouvido tapado', imp: 1, cd: 10, cat: 'p' },
  l7_cantarola: { t: 'a Lia cantarola sem querer — cuidado, ele pode ouvir', imp: 1, cd: 14, cat: 'p' },
  l7_rumo: { t: 'a Lia murmura para si mesma onde procurar', imp: 1, cd: 30, cat: 'h' },
  l7_conta: { t: 'a Lia conta baixinho, tentando se acalmar', imp: 0, cd: 12, cat: 'h' },
  l7_mortes: { t: 'uma criança sussurra o número de vezes que você já caiu', imp: 1, cd: 30, cat: 'h' },
  l7_assinatura: { t: 'um acorde grave abre o novo lugar', imp: 0, cd: 20, cat: 'h' },
  l7_engole: { t: '[a presença dele parece comer o som ao redor]', imp: 1, cd: 10, cat: 'p' },
  l7_arfarAlheio: { t: 'o seu arfar volta um instante depois, mais grave', imp: 1, cd: 16, cat: 'p' },
  l7_silencioAbsoluto: { t: '[silêncio absoluto: você ficou surda ao perigo]', imp: 1, cd: 60, cat: 'p' },
  l7_reza: { t: 'sussurros de reza crescem das paredes antes da Procissão', imp: 1, cd: 20, cat: 'p' },
  l7_suspensa: { t: 'uma nota fica pendurada sem resolver: nunca há descanso', imp: 0, cd: 12, cat: 'p' },
  l7_metronomo: { t: 'um tique irregular trava no tempo: ele vai dar o bote', imp: 1, cd: 10, cat: 'p' },
  l7_proxEntidade: { t: 'o acorde se abre: duas presenças perto ao mesmo tempo', imp: 1, cd: 14, cat: 'p' },
  l7_quasePego: { t: 'a música de caça para: só um fio agudo, e ele a um palmo', imp: 1, cd: 10, cat: 'p' },
  l7_estiada: { t: '[a chuva parou]', imp: 1, cd: 60, cat: 'p' },
  l7_chuvaVolta: { t: '[um trovão distante: a chuva volta]', imp: 0, cd: 30, cat: 'h' },
  l7_rajada: { t: 'uma rajada de vento vem de longe e cobre a casa', imp: 1, cd: 30, cat: 'h' },
  l7_corrente: { t: 'um assobio de corrente de ar: alguém abriu uma porta, longe', imp: 1, cd: 8, cat: 'p', pos: a => a[0] },
  l7_trovaoPerto: { t: '[trovão: muito perto]', imp: 1, cd: 6, cat: 'p' },
  l7_trovaoMeio: { t: '[trovão: algumas casas adiante]', imp: 0, cd: 6, cat: 'h' },
  l7_trovaoLonge: { t: '[trovão: bem longe]', imp: 0, cd: 6, cat: 'h' },
  l7_passoSobrou: { t: '[um passo a mais, depois que você parou]', imp: 1, cd: 25, cat: 'p' },
  l7_passosExtra: { t: 'um segundo par de passos acompanha o seu', imp: 1, cd: 60, cat: 'p' },
  l7_geladeira: { t: '[a geladeira parou]', imp: 1, cd: 20, cat: 'p' },
  l7_golpeCordas: { t: 'cordas rasgam o silêncio: a música entra pela primeira vez', imp: 1, cd: 60, cat: 'p' },
  l7_musicaVolta: { t: 'uma nota longa volta, como uma pergunta', imp: 0, cd: 40, cat: 'h' },
  l7_calmaPesa: { t: '[a casa prende o ar]', imp: 1, cd: 40, cat: 'p' },
  l7_calmaTum: { t: 'um tum: o som volta de uma vez', imp: 1, cd: 20, cat: 'p' },
  l7_escuroRuido: { t: 'no escuro total, um chiado cresce no fundo', imp: 0, cd: 25, cat: 'p' },
  l7_respSombra: { t: '[outra respiração]', imp: 1, cd: 30, cat: 'p' },
  l7_anaPeso: { t: '[o ar pesa: o ruído da sala morreu]', imp: 1, cd: 20, cat: 'p' },
  l7_granizoAviso: { t: 'a chuva engrossa de repente: vem granizo', imp: 1, cd: 40, cat: 'p' },
  l7_degelo: { t: 'o granizo para: só o degelo pinga no telhado', imp: 0, cd: 30, cat: 'h' },
  l7_alivioFalso: { t: 'o acorde quente desafina para o menor no meio', imp: 1, cd: 30, cat: 'p' },
  l7_fadiga: { t: '[o seu ouvido cansou: os agudos sumiram]', imp: 1, cd: 40, cat: 'p' },
  l7_tinido: { t: 'um apito agudo: o susto te deixou com o ouvido tapado', imp: 1, cd: 15, cat: 'p' },
  l7_ressaca: { t: 'saindo do gerador, um zumbido fica no seu ouvido', imp: 0, cd: 14, cat: 'p' }
};

export function instalarAudioLote7(C) {
  const { THREE } = C;
  if (C.legendas) try { Object.assign(C.legendas, LEGENDAS); } catch (e) {}
  const ac = () => C.AC;
  const leg = (k, ...a) => { try { C.som(k, a); } catch (e) {} };
  const teste = () => { try { return !!window.__teste; } catch (e) { return false; } };

  const L = {
    nodes: null, pronto: false, roomPrev: null, capPrev: -1, mapaPrev: null,
    estPrev: null, patrulhaCanto: null, cantoCorteT: 0,
    silPosCaca: 0, blefeCd: 90, blefeAlvo: 120, emboscadaPrev: false,
    heartSub: null, heartPhase: 0, hbPrev: 0,
    cantiga: null, cantigaCd: 0, evpOn: false,
    hesitaT: 0, hesitaSala: null, calmaMudaT: 0,
    tinnitusT: 0, prendiaLongo: 0,
    granizoN: false, granizoT: 0, granizoAte: 0, climaMudo: 0,
    ecoCd: 40, noiteFeito: false, salaAnomala: null, semScore: false,
    liaCd: 0, nomeCd: 0, shhCd: 0, chamadaCd: 0, molaCd: 0, loucaCd: 0, cisternaCd: 0,
    bipT: 0, assobioN: null, orgaoN: null, boteVacuoPrev: false,
    dopS: 1, estiadaFeita: false, estiadaAte: 0, calmaLonga: 0, marcadas: new Set(), fadiga: 0, molhadoAte: 0, extraRest: 0, extraUsos: 0, picoFim: 0, musicaProibidaAte: 0
  };
  // multiplicadores suaves que o motor lê (chuva, ambiência, ruído da Lia, máscara de som, corte de agudos)
  const K = { chuva: 1, amb: 1, ruido: 1, masc: 1, corte: 20000 };
  let Kt = { chuva: 1, amb: 1, ruido: 1, masc: 1, corte: 20000 };
  const suave = (cur, alvo, dt, desce, sobe) => cur + (alvo - cur) * Math.min(1, dt / (alvo < cur ? desce : sobe));
  const pan2 = (bus, p) => { const A = ac(); try { const n = A.createStereoPanner(); n.pan.value = p; n.connect(C.BUS[bus || 'amb']); return n; } catch (e) { return C.BUS[bus || 'amb']; } };

  // -------- PRNG por semente da noite --------
  function rng(str) {
    let h = 2166136261 >>> 0; str = String(str || 'sem');
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function hashId(id) { let h = 0; id = String(id || 'x'); for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return h; }

  // -------- nós contínuos criados uma vez --------
  function montar() {
    const A = ac(); if (!A || L.nodes) return;
    const BUS = C.BUS, N = {};
    // leito tonal da sala ("room tone"): dois dentes de serra graves + ruído de fundo
    N.toneG = A.createGain(); N.toneG.gain.value = 0;
    N.toneLp = A.createBiquadFilter(); N.toneLp.type = 'lowpass'; N.toneLp.frequency.value = 220;
    N.toneO1 = A.createOscillator(); N.toneO1.type = 'sawtooth'; N.toneO1.frequency.value = 58;
    N.toneO2 = A.createOscillator(); N.toneO2.type = 'sawtooth'; N.toneO2.frequency.value = 58.6;
    N.toneO1.connect(N.toneLp); N.toneO2.connect(N.toneLp); N.toneLp.connect(N.toneG); N.toneG.connect(BUS.amb);
    N.toneO1.start(); N.toneO2.start();
    N.toneNz = C.ruido(true); N.toneNzF = A.createBiquadFilter(); N.toneNzF.type = 'bandpass'; N.toneNzF.frequency.value = 500; N.toneNzF.Q.value = .8;
    N.toneNzG = A.createGain(); N.toneNzG.gain.value = 0; N.toneNz.connect(N.toneNzF); N.toneNzF.connect(N.toneNzG); N.toneNzG.connect(BUS.amb); N.toneNz.start();
    // sub-grave fixo por sala (hash do id): sentido mais do que ouvido
    N.subG = A.createGain(); N.subG.gain.value = 0; N.subO = A.createOscillator(); N.subO.type = 'sine'; N.subO.frequency.value = 48; N.subO.connect(N.subG); N.subG.connect(BUS.amb); N.subO.start();
    // pulso de sub preso ao coração (ambiente, separado do corpo)
    N.pulseG = A.createGain(); N.pulseG.gain.value = 0; N.pulseLp = A.createBiquadFilter(); N.pulseLp.type = 'lowpass'; N.pulseLp.frequency.value = 120;
    N.pulseO = A.createOscillator(); N.pulseO.type = 'sine'; N.pulseO.frequency.value = 45; N.pulseO.connect(N.pulseLp); N.pulseLp.connect(N.pulseG); N.pulseG.connect(BUS.amb); N.pulseO.start();
    // tinnitus do silêncio prolongado
    N.tinG = A.createGain(); N.tinG.gain.value = 0; N.tinO = A.createOscillator(); N.tinO.type = 'sine'; N.tinO.frequency.value = 8200; N.tinO.connect(N.tinG); N.tinG.connect(BUS.corpo); N.tinO.start();
    // pressão de subgrave da hesitação
    N.presG = A.createGain(); N.presG.gain.value = 0; N.presO = A.createOscillator(); N.presO.type = 'sine'; N.presO.frequency.value = 34; N.presO.connect(N.presG); N.presG.connect(BUS.amb); N.presO.start();
    // granizo (camada de ruído rítmico no telhado)
    N.hailG = A.createGain(); N.hailG.gain.value = 0; N.hailF = A.createBiquadFilter(); N.hailF.type = 'bandpass'; N.hailF.frequency.value = 5200; N.hailF.Q.value = .7;
    N.hailNz = C.ruido(true); N.hailNz.connect(N.hailF); N.hailF.connect(N.hailG); N.hailG.connect(BUS.amb); N.hailNz.start();
    N.hailLfo = A.createOscillator(); N.hailLfo.type = 'square'; N.hailLfo.frequency.value = 17; N.hailLfoG = A.createGain(); N.hailLfoG.gain.value = .5; N.hailLfo.connect(N.hailLfoG); N.hailLfoG.connect(N.hailG.gain); N.hailLfo.start();
    // nota suspensa da caçada (só resolve quando ele perde a pista)
    N.susG = A.createGain(); N.susG.gain.value = 0; N.susO = A.createOscillator(); N.susO.type = 'sawtooth'; N.susO.frequency.value = 233; const slp = A.createBiquadFilter(); slp.type = 'bandpass'; slp.frequency.value = 1200; slp.Q.value = 2; N.susO.connect(slp); slp.connect(N.susG); N.susG.connect(BUS.amb); N.susO.start();
    // radar: cluster sustentado cuja altura/volume sobem com a proximidade do caçador
    N.radarG = A.createGain(); N.radarG.gain.value = 0; N.radarO = A.createOscillator(); N.radarO.type = 'sine'; N.radarO.frequency.value = 220; N.radarO2 = A.createOscillator(); N.radarO2.type = 'sine'; N.radarO2.frequency.value = 311; N.radarO.connect(N.radarG); N.radarO2.connect(N.radarG); N.radarG.connect(BUS.amb); N.radarO.start(); N.radarO2.start();
    // pedal que sobe meio-tom ao longo do capítulo inteiro
    N.pedalG = A.createGain(); N.pedalG.gain.value = 0; N.pedalO = A.createOscillator(); N.pedalO.type = 'triangle'; N.pedalO.frequency.value = 55; const plp = A.createBiquadFilter(); plp.type = 'lowpass'; plp.frequency.value = 140; N.pedalO.connect(plp); plp.connect(N.pedalG); N.pedalG.connect(BUS.amb); N.pedalO.start();
    // coro de respirações infantis no escuro
    N.coroG = A.createGain(); N.coroG.gain.value = 0; N.coroNz = C.ruido(true); N.coroBp = A.createBiquadFilter(); N.coroBp.type = 'bandpass'; N.coroBp.frequency.value = 900; N.coroBp.Q.value = 1.4; N.coroNz.connect(N.coroBp); N.coroBp.connect(N.coroG); N.coroG.connect(BUS.amb); N.coroNz.start();
    N.coroLfo = A.createOscillator(); N.coroLfo.frequency.value = .33; N.coroLfoG = A.createGain(); N.coroLfoG.gain.value = .6; N.coroLfo.connect(N.coroLfoG); N.coroLfoG.connect(N.coroG.gain); N.coroLfo.start();
    // infra-som (ponto maldito da capela / picos de medo): sentido mais que ouvido
    N.infraG = A.createGain(); N.infraG.gain.value = 0; N.infraO = A.createOscillator(); N.infraO.type = 'sine'; N.infraO.frequency.value = 18.5; N.infraO.connect(N.infraG); N.infraG.connect(BUS.amb); N.infraO.start();
    // pressão (LFO) quando algo invisível divide a sala
    N.divG = A.createGain(); N.divG.gain.value = 0; N.divO = A.createOscillator(); N.divO.type = 'sine'; N.divO.frequency.value = 36; N.divLfo = A.createOscillator(); N.divLfo.frequency.value = .8; N.divLfoG = A.createGain(); N.divLfoG.gain.value = .5; N.divLfo.connect(N.divLfoG); N.divLfoG.connect(N.divG.gain); N.divO.connect(N.divG); N.divG.connect(BUS.amb); N.divO.start(); N.divLfo.start();
    // chiado do escuro total (cresce com a lanterna apagada)
    N.dkG = A.createGain(); N.dkG.gain.value = 0; N.dkBp = A.createBiquadFilter(); N.dkBp.type = 'bandpass'; N.dkBp.frequency.value = 1800; N.dkBp.Q.value = 1; N.dkNz = C.ruido(true); N.dkNz.connect(N.dkBp); N.dkBp.connect(N.dkG); N.dkG.connect(BUS.amb); N.dkNz.start();
    N.dkLfo = A.createOscillator(); N.dkLfo.frequency.value = 2; N.dkLfoG = A.createGain(); N.dkLfoG.gain.value = .003; N.dkLfo.connect(N.dkLfoG); N.dkLfoG.connect(N.dkG.gain); N.dkLfo.start();
    L.nodes = N; L.pronto = true;
  }

  // ponto central da sala atual
  function centro(r) { return r ? { x: (r.x0 + r.x1) / 2, z: (r.z0 + r.z1) / 2 } : null; }

  // -------- perfis de room tone por função da sala --------
  function perfil(r) {
    if (!r || r.fora) return { f: 0, lp: 220, nz: 0, nzf: 500, sub: 0 };
    const t = r.tipo || '';
    const h = hashId(r.id) % 7 - 3; // leve variação por sala
    if (t === 'cozinha' || t === 'despensa') return { f: 72 + h, lp: 200, nz: .006, nzf: 320, sub: .0018 };
    if (t === 'enfermaria') return { f: 100 + h, lp: 340, nz: .004, nzf: 2200, sub: .0012, bip: true };
    if (t === 'biblioteca' || t === 'aula' || t === 'diretoria') return { f: 50 + h, lp: 180, nz: .003, nzf: 600, sub: .0015, relogio: true };
    if (t === 'refeitorio') return { f: 64 + h, lp: 300, nz: .005, nzf: 1400, sub: .0016, louca: true };
    if (t === 'dorm' || t === 'quarto') return { f: 56 + h, lp: 150, nz: .0035, nzf: 420, sub: .002, molas: true };
    if (t === 'maquinas' || t === 'lavanderia') return { f: 44 + h, lp: 160, nz: .007, nzf: 240, sub: .0022 };
    if (t === 'tunel') return { f: 40 + h, lp: 130, nz: .004, nzf: 500, sub: .0024, cisterna: true };
    if (t === 'hall') return { f: 52 + h, lp: 200, nz: .003, nzf: 700, sub: .0015, relogio: true };
    if (/capela|nave/i.test(r.id || '')) return { f: 41, lp: 160, nz: .002, nzf: 300, sub: .002, orgao: true, semDrone: true };
    // sala comum: leito baixo e seco; algumas salas da noite ficam "mortas"
    return { f: 46 + h, lp: 170, nz: .0025, nzf: 500, sub: .0013 };
  }

  // feixe posicionado reutilizável com oclusão (cria sob demanda)
  function fixa(key, pos, bus, wet) {
    try {
      if (!L[key]) { L[key] = C.fonteFixa({ x: pos.x, y: pos.y ?? 1.4, z: pos.z }, bus || 'amb', wet ?? .25); L[key]._on = null; }
      else C.moverFonte(L[key], { x: pos.x, y: pos.y ?? 1.4, z: pos.z });
      return L[key];
    } catch (e) { return null; }
  }

  // -------- um som posicionado curto (atalho) --------
  const fin = n => Number.isFinite(n);
  function pos3(pos, y, bus, wet) { const x = pos && +pos.x, z = pos && +pos.z; if (!fin(x) || !fin(z)) return C.saida(null, wet ?? .3, bus || 'amb'); return C.saida({ x, y: fin(y) ? y : 1.4, z }, wet ?? .3, bus || 'amb'); }

  // -------- recalcula identidade da noite --------
  function recalc(S) {
    const sem = (S && S.semente) || 'SEM';
    if (sem === L.semPrev) return; L.semPrev = sem;
    const r = rng(sem);
    L.estiadaFeita = false; L.estiadaCd = 110 + r() * 150; L.rajadaCd = 70 + r() * 90; L.extraUsos = 0; L.marcadas = new Set();
    L.granizoN = r() < .28; // noite de granizo
    L.noiteFeito = false; L.barulhoNoite = r(); // momento do barulho único
    L.anomalaHash = (r() * 999999) | 0; // qual sala soa "errada" nesta noite
    L.blefeAlvo = 90 + r() * 90;
  }

  // =========================================================
  // TICK
  // =========================================================
  function tick(dt, ctx) {
    const A = ac(); if (!A) return;
    montar();
    const S = C.S, P = C.P, M = C.M, ANA = C.ANA, PROC = C.PROC, W = C.W, N = L.nodes, now = A.currentTime;
    if (!S || !N) return;
    recalc(S);
    Kt = { chuva: 1, amb: 1, ruido: 1, masc: 1, corte: 20000 };
    const { dM = 99, dA = 99, est = null, jogando = false, prende = false, perigo = 0, fora = false, subsolo = false } = ctx || {};
    const estAnt = L.estPrev; // estado do Inspetor no quadro anterior (atualizado só no fim do tick)
    const r = P.room, cr = centro(r), pf = perfil(r);

    // ---- Room tone por sala: crossfade de 0,4s ao cruzar portas ----
    if (r !== L.roomPrev) {
      L.roomPrev = r;
      const tc = .4;
      const marc = r && L.marcadas.has(r.id) ? 1.0595 : 1; // onde algo aconteceu, o tom da sala fica meio tom desafinado pelo resto da noite
      N.toneO1.frequency.setTargetAtTime((pf.f || 48) * marc, now, tc);
      N.toneO2.frequency.setTargetAtTime((pf.f || 48) * 1.012 * marc, now, tc);
      N.toneLp.frequency.setTargetAtTime(pf.lp, now, tc);
      N.toneNzF.frequency.setTargetAtTime(pf.nzf, now, tc);
      N.toneG.gain.setTargetAtTime(pf.f ? .02 : 0, now, tc);
      N.toneNzG.gain.setTargetAtTime(pf.nz, now, tc);
      // sub-grave fixo da sala (hash): salas da lore de 1979 saem desafinadas e um tom acima
      const lore1979 = r && /celeste|porao|cova|castigo|luiz/i.test(r.id || '');
      const anom = r && (hashId(r.id) % 101) === (L.anomalaHash % 101);
      const subF = (pf.sub ? (24 + (hashId(r && r.id) % 20)) : 0) * (lore1979 ? 2 * 1.06 : 1) * (anom ? 1.012 : 1);
      N.subO.frequency.setTargetAtTime(subF || 30, now, tc);
      N.subG.gain.setTargetAtTime(pf.sub ? pf.sub * (lore1979 ? 1.5 : 1) : 0, now, tc);
      L.bipT = now + C.rand(3, 8); L.relogioOn = !!pf.relogio; L.loucaOn = !!pf.louca; L.molaOn = !!pf.molas;
    }

    // ---- Capela come o drone e solta órgão; a nave fica num vácuo antinatural ----
    const naCapela = r && /capela|nave/i.test(r.id || '');
    if (AMBdrone()) {
      if (naCapela) C.AMB.drone.gain.setTargetAtTime(0, now, 1.2); // ausência do leito reconfortante
    }
    if (pf.orgao) {
      if (!N.orgG) { N.orgG = A.createGain(); N.orgG.gain.value = 0; N.orgO = A.createOscillator(); N.orgO.type = 'triangle'; N.orgO.frequency.value = 41.2; const olp = A.createBiquadFilter(); olp.type = 'lowpass'; olp.frequency.value = 260; N.orgO.connect(olp); const oh = A.createOscillator(); oh.type = 'sine'; oh.frequency.value = 82.4; const ohg = A.createGain(); ohg.gain.value = .4; oh.connect(ohg); ohg.connect(olp); olp.connect(N.orgG); N.orgG.connect(C.BUS.amb); N.orgO.start(); oh.start(); }
      N.orgG.gain.setTargetAtTime(S.flags && S.flags.sinoTocou ? 0 : .012, now, 1.5);
      if (now > (L.orgaoCd || 0)) { L.orgaoCd = now + C.rand(26, 46); leg('l7_orgao'); }
    } else if (N.orgG) N.orgG.gain.setTargetAtTime(0, now, 1.2);

    // ---- Assobio do vento nas janelas quebradas (capela / salas expostas) ----
    const janelaQuebrada = r && (r.janelaQuebrada || /capela|nave|copa/i.test(r.id || ''));
    if (janelaQuebrada && fora === false) {
      if (!N.wG) { N.wG = A.createGain(); N.wG.gain.value = 0; N.wBp = A.createBiquadFilter(); N.wBp.type = 'bandpass'; N.wBp.frequency.value = 1400; N.wBp.Q.value = 9; N.wNz = C.ruido(true); N.wNz.connect(N.wBp); N.wBp.connect(N.wG); N.wG.connect(C.BUS.amb); N.wNz.start(); }
      const raj = .5 + .5 * Math.sin(nowSafe() * .33) * Math.sin(nowSafe() * .9);
      N.wBp.frequency.setTargetAtTime(900 + 1500 * raj, now, .4);
      N.wG.gain.setTargetAtTime(.004 + .01 * raj, now, .3);
      if (raj > .9 && now > (L.assobioCd || 0)) { L.assobioCd = now + 24; leg('l7_assobio'); }
    } else if (N.wG) N.wG.gain.setTargetAtTime(0, now, .5);

    // ---- Torneira da cozinha que o Inspetor cala ----
    if ((pf.f && (r.tipo === 'cozinha')) && jogando) {
      const pFonte = { x: cr.x, y: 1, z: cr.z };
      const inspPerto = M.ativo && Math.hypot(M.pos.x - cr.x, M.pos.z - cr.z) < 5;
      L.torneiraT = (L.torneiraT || 0) - dt;
      if (!inspPerto && L.torneiraT <= 0) {
        L.torneiraT = 1.3;
        const g = pos3(pFonte, 1, 'amb', .5); const o = A.createOscillator(); o.frequency.setValueAtTime(1300, now); o.frequency.exponentialRampToValueAtTime(430, now + .08); o.connect(g); C.env(g, now, .002, .05, .12); o.start(now); o.stop(now + .18);
        if (now > (L.torneiraLeg || 0)) { L.torneiraLeg = now + 30; leg('l7_torneira'); }
      }
      if (inspPerto && !L.torneiraMuda) { L.torneiraMuda = true; leg('l7_torneiraCala'); }
      if (!inspPerto) L.torneiraMuda = false;
    } else L.torneiraMuda = false;

    // ---- Relógio de parede que para quando ele entra ----
    if (L.relogioOn && jogando && cr) {
      const inspAqui = M.ativo && C.roomAt && sameRoom(C.roomAt(M.pos.x, M.pos.z), r);
      L.relogioT = (L.relogioT || 0) - dt;
      if (!inspAqui && L.relogioT <= 0) {
        L.relogioT = 1 * (1 + (S.fear / 100) * .9); // com o medo, o tempo estica: o tique desacelera
        const det = 1 - (S.fear / 100) * .12; // e o timbre distorce para baixo
        const g = pos3({ x: cr.x, y: 2.4, z: cr.z }, 2.4, 'amb', .3); C.burst(now, .02, 'highpass', ((L.relogioTick = !L.relogioTick) ? 4200 : 3400) * det, 2, g); C.env(g, now, .001, .05, .03);
        if (now > (L.relogioLeg || 0)) { L.relogioLeg = now + 40; leg('l7_relogio'); }
      }
      if (inspAqui && !L.relogioMudo) { L.relogioMudo = true; leg('l7_relogioCala'); }
      if (!inspAqui) L.relogioMudo = false;
    } else L.relogioMudo = false;

    // ---- Molas de cama nos dormitórios ----
    if (L.molaOn && jogando && cr && !(M.ativo && dM < 14)) {
      L.molaCd -= dt;
      if (L.molaCd <= 0 && !teste()) {
        L.molaCd = C.rand(5, 12);
        const px = cr.x + C.rand(-4, 4), pz = cr.z + C.rand(-4, 4);
        if (Math.hypot(px - P.pos.x, pz - P.pos.z) > 2.5) { const g = pos3({ x: px, y: .5, z: pz }, .5, 'amb', .4); const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(C.rand(140, 200), now); o.frequency.linearRampToValueAtTime(C.rand(70, 100), now + .35); const f = A.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 800; f.Q.value = 10; o.connect(f); f.connect(g); C.env(g, now, .03, .05, .35); o.start(now); o.stop(now + .45); leg('l7_molas'); }
      }
    }

    // ---- Mosca na enfermaria (cala quando entidade entra) ----
    if (r && r.tipo === 'enfermaria' && jogando) {
      if (!N.flyG) { N.flyG = A.createGain(); N.flyG.gain.value = 0; N.flyO = A.createOscillator(); N.flyO.type = 'sawtooth'; N.flyO.frequency.value = 180; N.flyBp = A.createBiquadFilter(); N.flyBp.type = 'bandpass'; N.flyBp.frequency.value = 2200; N.flyBp.Q.value = 6; N.flyO.connect(N.flyBp); N.flyBp.connect(N.flyG); N.flyPan = C.novoPanner(1.5, 1); N.flyG.connect(N.flyPan); N.flyPan.connect(C.BUS.amb); N.flyO.start(); }
      const ent = (M.ativo && sameRoom(C.roomAt(M.pos.x, M.pos.z), r)) || PROC.fase;
      const ang = nowSafe() * 1.3;
      C.posPanner(N.flyPan, { x: P.pos.x + Math.cos(ang) * 2, y: 1.6, z: P.pos.z + Math.sin(ang) * 2 });
      N.flyO.frequency.setTargetAtTime(170 + Math.sin(nowSafe() * 5) * 30, now, .1);
      N.flyG.gain.setTargetAtTime(ent ? 0 : .006, now, ent ? .05 : .3);
      if (!ent && now > (L.moscaLeg || 0)) { L.moscaLeg = now + 20; leg('l7_mosca'); }
    } else if (N.flyG) N.flyG.gain.setTargetAtTime(0, now, .1);

    // ---- Louça e cadeiras do refeitório ----
    if (L.loucaOn && jogando && cr && !(M.ativo && dM < 12)) {
      L.loucaCd -= dt;
      if (L.loucaCd <= 0 && !teste()) {
        L.loucaCd = C.rand(6, 14);
        const px = cr.x + C.rand(-5, 5), pz = cr.z + C.rand(-5, 5);
        if (Math.random() < .5) { for (let i = 0; i < 3; i++) { const g = pos3({ x: px, y: .9, z: pz }, .9, 'amb', .4); C.burst(now + i * .06, .03, 'bandpass', C.rand(2600, 3800), 8, g); C.env(g, now + i * .06, .001, .04, .04); } }
        else C.SOM.rangido(px, .4, pz, .4, 'amb'); // cadeira puxada
        leg('l7_louca');
      }
    }

    // ---- Cisterna: ploc grande e distante nos túneis ----
    if (pf.cisterna && jogando) {
      L.cisternaCd -= dt;
      if (L.cisternaCd <= 0 && !teste()) {
        L.cisternaCd = C.rand(14, 30);
        if (Math.random() < .5) { const a = C.rand(0, 6.28), px = P.pos.x + Math.cos(a) * C.rand(10, 16), pz = P.pos.z + Math.sin(a) * C.rand(10, 16); const g = pos3({ x: px, y: .2, z: pz }, .2, 'amb', .9); const o = A.createOscillator(); o.frequency.setValueAtTime(260, now); o.frequency.exponentialRampToValueAtTime(70, now + .25); o.connect(g); C.env(g, now, .004, .45, .4); o.start(now); o.stop(now + .5); leg('l7_cisterna', { x: px, z: pz }); }
      }
    }

    // ---- Pulso de sub preso ao coração (ambiente) ----
    const cn = C.AUD.coracaoN || 0;
    if (jogando && cn > .12) {
      const bpm = 60 + 95 * cn; L.heartPhase += dt * bpm / 60;
      N.pulseG.gain.setTargetAtTime(0, now, .08);
      if (L.heartPhase >= 1) { L.heartPhase -= 1; const g = N.pulseG; g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(.02 * cn, now + .02); g.gain.exponentialRampToValueAtTime(.0001, now + .22); }
    } else N.pulseG.gain.setTargetAtTime(0, now, .3);

    // ---- Trilha presa ao coração e à distância: a música de caça pulsa junto ----
    // (roda DEPOIS do motor: afina o que já foi setado)
    try {
      if (est === 'caca' && C.AMB.cacaOsc) {
        // intervalo desliza da quinta ao trítono conforme ele encosta
        const prox = C.clamp(1 - dM / 18, 0, 1), tri = prox * prox;
        C.AMB.cacaOsc[1] && C.AMB.cacaOsc[1].detune.setTargetAtTime(700 + tri * 90, now, .4); // 2ª voz: ~quinta -> trítono
      }
      // dissonância que aperta na aproximação (investiga/procura)
      if ((est === 'investiga' || est === 'procura') && C.AMB.violinoO && dM < 22) { C.AMB.violinoO.detune.setTargetAtTime(-C.clamp(1 - dM / 22, 0, 1) * 40, now, .6); }
    } catch (e) {}

    // ---- Semitom a mais por capítulo: o mundo fica mais "errado" ----
    if (S.chapter !== L.capPrev) {
      L.capPrev = S.chapter;
      try { if (C.AMB.cacaOsc) for (const o of C.AMB.cacaOsc) o.detune.value += S.chapter * 6; } catch (e) {}
      // tempestade se aproxima: nada a fazer aqui (SOM.trovao lê S.chapter)
    }

    // ---- Canto do Inspetor na patrulha que para no meio quando ele te ouve ----
    if (jogando && M.ativo) {
      const cantando = est === 'patrulha' && dM < 20 && !PROC.fase;
      if (cantando && !N.cantoG) {
        N.cantoG = A.createGain(); N.cantoG.gain.value = 0; N.cantoPan = C.novoPanner(2, 1.1); N.cantoG.connect(N.cantoPan); N.cantoPan.connect(C.BUS.ent);
        N.cantoO = A.createOscillator(); N.cantoO.type = 'sawtooth'; N.cantoO.frequency.value = 130; const cbp = A.createBiquadFilter(); cbp.type = 'bandpass'; cbp.frequency.value = 700; cbp.Q.value = 5; N.cantoO.connect(cbp); cbp.connect(N.cantoG); N.cantoO.start();
      }
      if (N.cantoG) {
        if (cantando) { C.posPanner(N.cantoPan, { x: M.pos.x, y: 1.6, z: M.pos.z }); N.cantoO.frequency.setTargetAtTime((110 + (Math.sin(nowSafe() * 1.1) > .6 ? 24 : 0) + Math.sin(nowSafe() * 2.3) * 6) * L.dopS, now, .2); N.cantoG.gain.setTargetAtTime(.006 * C.clamp(1 - dM / 20, 0, 1), now, .3); L.cantava = true; }
        else { if (L.cantava && (est === 'investiga' || est === 'procura' || est === 'caca')) { N.cantoG.gain.cancelScheduledValues(now); N.cantoG.gain.setValueAtTime(N.cantoG.gain.value, now); N.cantoG.gain.setValueAtTime(0, now + .02); leg('l7_cantoCorte'); } else N.cantoG.gain.setTargetAtTime(0, now, .4); L.cantava = false; }
      }
    }

    // ---- Vácuo honesto antes do bote: corta chuva/ambiência ----
    const bote = est === 'alerta' || est === 'bote';
    if (bote && jogando && !L.boteVacuoPrev) { leg('l7_vacuoBote'); try { C.SOM.silencio(.7, .06, true); } catch (e) {} }
    L.boteVacuoPrev = bote;

    // ---- Silêncio de emboscada / caçada: o vazio avisa ----
    if (est === 'emboscada' && !L.emboscadaPrev && jogando) { try { C.SOM.silencio(1, .05, true); } catch (e) {} leg('l7_silencioCaca'); }
    L.emboscadaPrev = (est === 'emboscada');

    // ---- Falso seguro: depois que a caçada acaba, o mundo fica mudo demais ----
    if (estAnt === 'caca' && (est === 'procura' || est === 'patrulha' || !est)) { L.silPosCaca = C.rand(12, 20); }
    if (L.silPosCaca > 0) { L.silPosCaca -= dt; if (jogando) try { C.SOM.silencio(.5, .18); } catch (e) {} }

    // ---- Silêncio mentiroso: blefe que não vira nada ----
    if (jogando && perigo < .05 && !PROC.fase && !ANA.ativa) L.blefeCd -= dt; else L.blefeCd = Math.max(L.blefeCd, 30);
    if (L.blefeCd <= 0 && !teste()) { L.blefeCd = L.blefeAlvo; try { C.SOM.silencio(C.rand(2.5, 4), .06, true); } catch (e) {} leg('l7_silencioBlefe'); }

    // ---- Clímax sem trilha: na fuga final a trilha some, só corpo e chuva ----
    const fuga = !!(S.flags && S.flags.sino) && W.mapa === 'cemiterio';
    if (fuga) {
      try { C.AMB.caca && C.AMB.caca.gain.setTargetAtTime(0, now, .8); C.AMB.cordas && C.AMB.cordas.gain.setTargetAtTime(0, now, .8); C.AMB.cluster && C.AMB.cluster.gain.setTargetAtTime(0, now, .8); C.AMB.violino && C.AMB.violino.gain.setTargetAtTime(0, now, .8); } catch (e) {}
      if (!L.semScore) { L.semScore = true; leg('l7_semScore'); }
      // a chuva engrossa no clímax
      Kt.chuva = Math.max(Kt.chuva, fora ? 1.5 : 1.3); // a chuva engrossa no clímax
    } else L.semScore = false;

    // ---- A chuva prende o ar antes da Procissão / badaladas ----
    const presagio = (PROC.fase === 'aviso') || (C.AUD.badalando);
    if (presagio) { Kt.chuva = 0; Kt.amb = Math.min(Kt.amb, .4); if (!L.chuvaParou) { L.chuvaParou = true; leg('l7_chuvaPara'); } }
    else L.chuvaParou = false;

    // ---- Neblina abafa os agudos (clima do lote 6) ----
    try {
      const clima = (window.__L6CLIMA) || (C.L6 && C.L6.clima);
      const neblina = r && r.fora && clima === 'neblina';
      if (neblina && C.AMB.chuvaF) C.AMB.chuvaF.frequency.setTargetAtTime(1400, now, .5);
    } catch (e) {}

    // ---- Granizo numa noite sorteada: janela de stealth ----
    if (L.granizoN && fora && jogando) {
      L.granizoT -= dt;
      if (L.granizoT <= 0 && now > L.granizoAte && !teste()) { L.granizoT = C.rand(60, 120); L.granizoIni = now + 3; L.granizoAte = L.granizoIni + C.rand(18, 26); L.degelo = true; leg('l7_granizoAviso'); setTimeout(() => leg('l7_granizo'), 3000); }
    }
    if (now < (L.granizoIni || 0) && fora) Kt.chuva = Math.max(Kt.chuva, 1.7); // aviso: a chuva fina engrossa de repente
    const granizando = now >= (L.granizoIni || 0) && now < L.granizoAte && fora;
    if (granizando) { Kt.masc *= .33; Kt.amb = Math.min(Kt.amb, .8); } // o martelar no telhado cobre passos (seus e dele)
    if (L.degelo && now > L.granizoAte && L.granizoAte > 0 && jogando) { L.degelo = false; if (fora) { leg('l7_degelo'); try { C.SOM.silencio(2.5, .15); } catch (e) {} L.degeloAte = now + 8; } }
    if (now < (L.degeloAte || 0) && fora && jogando) { L.degeloT = (L.degeloT || 0) - dt; if (L.degeloT <= 0) { L.degeloT = C.rand(.3, .9); const a = C.rand(0, 6.28), px = P.pos.x + Math.cos(a) * C.rand(2, 6), pz = P.pos.z + Math.sin(a) * C.rand(2, 6); const g = pos3({ x: px, y: 2.5, z: pz }, 2.5, 'amb', .5); const o = A.createOscillator(); o.frequency.setValueAtTime(1500, now); o.frequency.exponentialRampToValueAtTime(600, now + .06); o.connect(g); C.env(g, now, .002, .05, .1); o.start(now); o.stop(now + .16); } }
    N.hailG.gain.setTargetAtTime(granizando ? .06 : 0, now, granizando ? .4 : .8);
    N.hailLfo.frequency.setTargetAtTime(granizando ? 19 : 17, now, .2);

    // ---- Tinnitus do silêncio prolongado (anti-camping) ----
    const quieto = jogando && !P.sprinting && Math.hypot(P.vel ? P.vel.x : 0, P.vel ? P.vel.z : 0) < .05 && perigo < .05 && !PROC.fase;
    if (quieto || prende) L.tinnitusT += dt; else L.tinnitusT = Math.max(0, L.tinnitusT - dt * 3);
    const tin = C.OPT && C.OPT.semZumbido ? 0 : C.clamp((L.tinnitusT - 22) / 8, 0, 1) * .01;
    N.tinG.gain.setTargetAtTime(jogando ? tin : 0, now, .4);
    if (tin > .006 && now > (L.tinLeg || 0)) { L.tinLeg = now + 20; leg('l7_tinnitus'); }

    // ---- Pressão de subgrave quando você hesita no mesmo lugar ----
    if (jogando && r === L.hesitaSala && perigo < .1) L.hesitaT += dt; else { L.hesitaSala = r; L.hesitaT = 0; }
    const pres = C.OPT && C.OPT.semZumbido ? 0 : C.clamp((L.hesitaT - 35) / 20, 0, 1) * .012;
    N.presG.gain.setTargetAtTime(jogando ? pres : 0, now, .6);
    if (pres > .008 && now > (L.presLeg || 0)) { L.presLeg = now + 20; leg('l7_pressao'); }

    // ---- Vozes dos mortos ao prender o ar (EVP) ----
    if (prende) L.prendiaLongo += dt; else L.prendiaLongo = 0;
    if (L.prendiaLongo > 1.2 && jogando) {
      if (!L.evpOn) { L.evpOn = true; leg('l7_evp'); }
      L.evpCd = (L.evpCd || 0) - dt;
      if (L.evpCd <= 0) { L.evpCd = C.rand(1.2, 2.2); const a = C.rand(0, 6.28), px = P.pos.x + Math.cos(a) * 1.6, pz = P.pos.z + Math.sin(a) * 1.6; try { const o = C.silaba(now, { x: px, y: 1.5, z: pz }, C.rand(240, 330), C.pick(['a', 'e', 'i', 'o', 'u']), .3, .02, 'voz', .6); o.type = 'triangle'; } catch (e) {} }
    } else L.evpOn = false;

    // ---- A casa sussurra o seu nome de um canto vazio (raríssimo, sem perigo) ----
    L.nomeCd -= dt;
    if (L.nomeCd <= 0 && jogando && perigo < .03 && !PROC.fase && !ANA.ativa && !teste()) {
      L.nomeCd = C.rand(60, 140);
      if (Math.random() < .4) { const fw = new THREE.Vector3(); C.camera.getWorldDirection(fw); fw.y = 0; fw.normalize(); const px = P.pos.x - fw.x * 2 + C.rand(-1, 1), pz = P.pos.z - fw.z * 2 + C.rand(-1, 1); try { C.silaba(now, { x: px, y: 1.5, z: pz }, 300, 'i', .35, .05, 'voz', .8); C.silaba(now + .4, { x: px, y: 1.5, z: pz }, 240, 'a', .4, .05, 'voz', .8); } catch (e) {} leg('l7_nome'); }
    }

    // ---- Cochicho reprovador atrás da parede quando você fica parada demais ----
    L.shhCd -= dt;
    if (L.shhCd <= 0 && jogando && L.hesitaT > 14 && perigo < .1 && !teste()) {
      L.shhCd = C.rand(16, 30);
      const a = C.rand(0, 6.28), px = P.pos.x + Math.cos(a) * 3, pz = P.pos.z + Math.sin(a) * 3;
      try { const g = pos3({ x: px, y: 1.5, z: pz }, 1.5, 'voz', .6); C.burst(now, .5, 'bandpass', 3000, 5, g); C.env(g, now, .08, .03, .5); } catch (e) {} leg('l7_shh');
    }

    // ---- Chamada de 1979 em salas de lore ----
    if (r && /celeste|diretoria|dorm|aula|quarto/i.test(r.id || r.tipo || '') && jogando) {
      L.chamadaCd -= dt;
      if (L.chamadaCd <= 0 && perigo < .05 && !teste()) { L.chamadaCd = C.rand(30, 60); if (Math.random() < .35) { const px = cr.x + C.rand(-3, 3), pz = cr.z + C.rand(-3, 3); try { C.silaba(now, { x: px, y: 1.6, z: pz }, 280, 'a', .3, .03, 'voz', .9); C.silaba(now + .4, { x: px, y: 1.6, z: pz }, 320, 'e', .3, .03, 'voz', .9); } catch (e) {} leg('l7_chamada'); } }
    }

    // ---- Pensamentos involuntários da Lia sob pânico ----
    if (jogando && S.fear > 85 && (prende || (M.ativo && dM < 4 && S.hidden))) {
      L.liaCd -= dt;
      if (L.liaCd <= 0) { L.liaCd = C.rand(6, 10); try { const o = C.silaba(now, null, C.rand(200, 240), C.pick(['a', 'o']), .3, .025, 'corpo', 0); o.frequency.linearRampToValueAtTime(180, now + .3); } catch (e) {} leg('l7_liaPanico'); }
    }

    // ---- Clique da lanterna que responde (eco do fim do corredor) ----
    if (jogando && L.flashPrevState !== undefined && S.flashOn !== L.flashPrevState) {
      L.ecoCd -= 0; // atualizado abaixo
    }
    L.ecoCd -= dt;
    if (jogando && S.flashOn !== L.flashPrevState) {
      L.flashPrevState = S.flashOn;
      const corredor = r && (r.tipo === 'corredor' || (r && Math.max(r.x1 - r.x0, r.z1 - r.z0) > 10));
      if (corredor && L.ecoCd <= 0 && !C.OPT.vFlash && Math.random() < .5 && !teste()) {
        L.ecoCd = C.rand(30, 70);
        const fw = new THREE.Vector3(); C.camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
        const px = P.pos.x + fw.x * 9, pz = P.pos.z + fw.z * 9;
        setTimeout(() => { try { if (!ac()) return; const tt = ac().currentTime; const g = pos3({ x: px, y: 1.4, z: pz }, 1.4, 'ent', .7); C.burst(tt, .05, 'highpass', 2600, 1, g); C.env(g, tt, .001, .18, .04); const g2 = pos3({ x: px, y: 1.4, z: pz }, 1.4, 'ent', .5); C.burst(tt + .04, .03, 'bandpass', 1200, 3, g2); C.env(g2, tt + .04, .001, .08, .03); leg('l7_eco'); } catch (e) {} }, 400);
      }
    }
    if (L.flashPrevState === undefined) L.flashPrevState = S.flashOn;

    // ---- Barulho único e sem explicação, uma vez por noite ----
    if (!L.noiteFeito && jogando && perigo < .05 && !teste()) {
      L.barulhoNoite -= dt * .02;
      if (L.barulhoNoite <= 0) { L.noiteFeito = true; const a = C.rand(0, 6.28), px = P.pos.x + Math.cos(a) * C.rand(14, 20), pz = P.pos.z + Math.sin(a) * C.rand(14, 20); try { if (Math.random() < .5) C.SOM.pancada(px, pz); else { const g = pos3({ x: px, y: 1.4, z: pz }, 1.4, 'ent', .8); const o = C.silaba(now, { x: px, y: 1.6, z: pz }, 300, 'a', .5, .04, 'ent', .8); o.frequency.linearRampToValueAtTime(180, now + .5); } } catch (e) {} leg('l7_noite', { x: px, z: pz }); }
    }

    // ---- Acorde de alívio ao escapar por um fio ----
    if (L.estPrev2 === 'caca' && (est === 'procura' || est === 'patrulha') && dM < 3 && jogando) { alivio(); leg('l7_alivio'); }

    // =================== ONDA 2 ===================
    // movimento do quadro (para "parada e calada")
    if (!L.lastPx && L.lastPx !== 0) { L.lastPx = P.pos.x; L.lastPz = P.pos.z; }
    const mov = Math.hypot(P.pos.x - L.lastPx, P.pos.z - L.lastPz);
    const veloc = dt > 0 ? mov / dt : 0; L.lastPx = P.pos.x; L.lastPz = P.pos.z;
    const parada = jogando && veloc < .3 && !P.sprinting;
    const flashOn = !!S.flashOn, interior = !fora && !subsolo;

    // ---- Pânico te deixa surda: o mundo abaixa com o batimento (surdez no auge) ----
    if (C.BUS.amb) {
      const base = (C.OPT.vAmb ?? 1);
      let duck = 1 - .35 * C.clamp((cn - .5) / .5, 0, 1);
      if (jogando && S.fear > 90 && M.ativo && dM < 2.5 && !prende) duck *= .62; // surdez de pânico
      duck = jogando ? Math.max(.55, duck) : 1;
      C.BUS.amb.gain.setTargetAtTime(base * duck, now, .12); if (C.BUS.ambR) C.BUS.ambR.gain.setTargetAtTime(base * duck, now, .12);
    }

    // ---- Túnel auditivo perto da morte: os agudos fecham com a vida baixa ----
    if (jogando && S.health < 15) C.AUD.abafa && C.AUD.abafa.frequency.setTargetAtTime(1100, now, .2);

    // ---- Drone/leito preso ao fôlego: prender o ar "enche" o mundo de pressão ----
    if (N.toneG) N.toneG.gain.setTargetAtTime((pf.f ? .02 : 0) + (prende ? .02 : 0), now, prende ? .1 : .4);

    // ---- Tonalidade afunda com o medo (degraus em 40/65/85) ----
    const degrau = S.fear > 85 ? -24 : S.fear > 65 ? -14 : S.fear > 40 ? -7 : 0;
    if (N.toneO1) { N.toneO1.detune.setTargetAtTime(degrau, now, 1.2); N.toneO2.detune.setTargetAtTime(degrau, now, 1.2); }

    // ---- Instrumento ferido: as cordas desafinam com a vida baixa ----
    try { if (C.AMB.violinoO && jogando && S.health < 40 && est === 'caca') C.AMB.violinoO.detune.setTargetAtTime(-(40 - S.health) * 1.5, now, .6); } catch (e) {}

    // ---- Lanterna "microfona" o Inspetor: o zumbido estridula ao apontar pra ele ----
    try {
      if (flashOn && M.ativo && dM < 10 && C.AMB.flash) {
        const fw = new THREE.Vector3(); C.camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
        const dx = M.pos.x - P.pos.x, dz = M.pos.z - P.pos.z, l = Math.hypot(dx, dz) || 1;
        if ((dx / l * fw.x + dz / l * fw.z) > .7) { C.AMB.flash.g.gain.setTargetAtTime(.006 * (.6 + Math.random() * .8), now, .02); C.AMB.flash.o.frequency.setTargetAtTime(120 + Math.random() * 180, now, .03); }
      }
    } catch (e) {}

    // ---- Gerador range e desafina quando ele chega perto ----
    try { if (C.AMB.ger && M.ativo) { const near = Math.hypot(M.pos.x - C.AMB.ger.pos.x, M.pos.z - C.AMB.ger.pos.z) < 7; C.AMB.ger.o.detune.setTargetAtTime(near ? C.rand(-80, -30) : 0, now, .3); } } catch (e) {}

    // ---- Ressaca do gerador: ao sair de perto dele, um zumbido fica no ouvido ----
    const noGerador = C.AMB.ger && Math.hypot(P.pos.x - C.AMB.ger.pos.x, P.pos.z - C.AMB.ger.pos.z) < 7;
    if (L.noGeradorPrev && !noGerador && jogando) { try { C.SOM.zumbidoOuvido(.5); } catch (e) {} leg('l7_ressaca'); }
    L.noGeradorPrev = !!noGerador;

    // ---- Persiana solta / porta distante que bate ao vento (falso Inspetor) ----
    if (fora || interior) {
      L.ventoBateCd = (L.ventoBateCd || 0) - dt;
      if (L.ventoBateCd <= 0 && jogando && !(M.ativo && dM < 12) && !teste()) {
        L.ventoBateCd = C.rand(12, 26);
        if (Math.random() < .5) { const a = C.rand(0, 6.28), px = P.pos.x + Math.cos(a) * C.rand(5, 10), pz = P.pos.z + Math.sin(a) * C.rand(5, 10); const g = pos3({ x: px, y: 1.6, z: pz }, 1.6, 'amb', .4); C.burst(now, .08, 'bandpass', 900, 3, g); C.env(g, now, .002, .25, .09); leg('l7_persiana'); }
        else { const a = C.rand(0, 6.28), px = P.pos.x + Math.cos(a) * C.rand(14, 20), pz = P.pos.z + Math.sin(a) * C.rand(14, 20); try { C.SOM.rangido(px, 1.5, pz, .4, 'amb'); } catch (e) {} try { C.SOM.portaLonge({ x: px, z: pz }); } catch (e) {} leg('l7_portaVento', { x: px, z: pz }); }
      }
    }

    // ---- Estalo-gêmeo do passo dele (móveis esfriando), atrás da cabeça ----
    L.estaloGemeoCd = (L.estaloGemeoCd || 20) - dt;
    if (L.estaloGemeoCd <= 0 && jogando && perigo < .08 && !teste()) {
      L.estaloGemeoCd = C.rand(18, 40);
      if (Math.random() < .4) { const fw = new THREE.Vector3(); C.camera.getWorldDirection(fw); fw.y = 0; fw.normalize(); const px = P.pos.x - fw.x * 2.2, pz = P.pos.z - fw.z * 2.2; const g = pos3({ x: px, y: 1.2, z: pz }, 1.2, 'ent', .4); C.burst(now, .04, 'bandpass', 520, 3, g); C.env(g, now, .002, .2, .05); leg('l7_estaloGemeo'); }
    }

    // ---- Pizzicato fantasma na calma (paranoia pura) ----
    L.pizziCd = (L.pizziCd || 25) - dt;
    if (L.pizziCd <= 0 && jogando && est !== 'caca' && perigo < .1 && !teste()) {
      L.pizziCd = C.rand(20, 40);
      if (Math.random() < .5) { const a = C.rand(0, 6.28), px = P.pos.x + Math.cos(a) * 4, pz = P.pos.z + Math.sin(a) * 4; const g = pos3({ x: px, y: 1.4, z: pz }, 1.4, 'amb', .5); const o = A.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(C.rand(160, 320), now); o.connect(g); C.env(g, now, .002, .05, .3); o.start(now); o.stop(now + .35); leg('l7_pizzicato'); }
    }

    // ---- Concussão depois de levar o golpe: ouvido tapado ----
    if (L.hpPrev === undefined) L.hpPrev = S.health;
    if (jogando && S.health < L.hpPrev - 12) { try { C.SOM.zumbidoOuvido(.8); } catch (e) {} leg('l7_concussao'); }
    L.hpPrev = S.health;

    // ---- A Lia cantarola e se entrega quando relaxa parada demais ----
    if (parada && perigo < .04 && !PROC.fase) L.cantarolaT = (L.cantarolaT || 0) + dt; else L.cantarolaT = 0;
    if (L.cantarolaT > 25 && jogando) {
      L.cantarolaT = 0;
      try { for (const [i, f] of [[0, 294], [1, 349], [2, 294]]) { const o = C.silaba(now + i * .4, null, f, i % 2 ? 'a' : 'o', .32, .02, 'corpo', 0); } } catch (e) {}
      if (!teste()) C.emitNoise(P.pos.x, P.pos.z, 1.4);
      leg('l7_cantarola');
    }

    // ---- A Lia murmura o rumo quando fica perdida ----
    if (jogando && L.hesitaT > 40 && perigo < .1) { L.rumoCd = (L.rumoCd || 0) - dt; if (L.rumoCd <= 0) { L.rumoCd = 30; try { C.silaba(now, null, 230, 'e', .35, .02, 'corpo', 0); C.silaba(now + .45, null, 200, 'a', .4, .02, 'corpo', 0); } catch (e) {} leg('l7_rumo'); } }

    // ---- Contar a respiração para se acalmar, prendendo muito tempo ----
    if (L.prendiaLongo > 2.5 && jogando) { L.contaCd = (L.contaCd || 0) - dt; if (L.contaCd <= 0) { L.contaCd = C.rand(2, 3); try { C.silaba(now, null, 200, 'u', .25, .018, 'corpo', 0); } catch (e) {} if (perigo > .3 && !teste()) C.emitNoise(P.pos.x, P.pos.z, .8); leg('l7_conta'); } }

    // ---- A voz que conta as suas mortes (3ª em diante, sala escura e calma) ----
    try {
      const mortes = (S.mortes || (S.stats && S.stats.mortes) || 0);
      if (mortes >= 3 && jogando && !flashOn && interior && perigo < .03) { L.mortesCd = (L.mortesCd || 0) - dt; if (L.mortesCd <= 0 && !teste()) { L.mortesCd = C.rand(30, 60); if (Math.random() < .4) { const a = C.rand(0, 6.28), px = P.pos.x + Math.cos(a) * 3, pz = P.pos.z + Math.sin(a) * 3; C.silaba(now, { x: px, y: 1.4, z: pz }, 300, 'e', .4, .025, 'voz', .7); leg('l7_mortes'); } } }
    } catch (e) {}

    // ---- Assinatura acústica por mapa: um acorde grave abre o novo lugar ----
    if (W.mapa !== L.mapaPrev2) { L.mapaPrev2 = W.mapa; if (jogando && !teste()) { const base = { estrada: 49, terreo: 55, superior: 58.3, tuneis: 41.2, cemiterio: 43.7 }[W.mapa] || 52; for (const [m, a] of [[1, 1], [1.5, .5], [2, .4]]) { const g = C.saida(null, 1, 'mus'); C.osc('triangle', base * m, now, 4, g); g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(.02 * a, now + 1); g.gain.exponentialRampToValueAtTime(.0001, now + 4); } leg('l7_assinatura'); } }

    // ---- O Inspetor engole o som: no instante da escuta real, até o seu corpo abafa ----
    if (est === 'alerta' && estAnt !== 'alerta' && C.BUS.corpo) { const bc = (C.OPT.vSfx ?? 1); C.BUS.corpo.gain.cancelScheduledValues(now); C.BUS.corpo.gain.setValueAtTime(bc, now); C.BUS.corpo.gain.linearRampToValueAtTime(bc * .4, now + .25); C.BUS.corpo.gain.setValueAtTime(bc * .4, now + .5); C.BUS.corpo.gain.linearRampToValueAtTime(bc, now + .9); leg('l7_engole'); }

    // ---- Zumbido ensurdece os passos dele por alguns segundos depois do grito ----
    if (C.BUS.ent) { const be = (C.OPT.vEnt ?? 1); C.BUS.ent.gain.setTargetAtTime(now < (C.AUD.zumbidoAte || 0) ? be * .45 : be, now, .2); }

    // ---- Arfar alheio em salas reverberantes (capela, galeria, túnel) ----
    if (L.prendiaPrev && !prende && jogando) { const rev = subsolo || /capela|nave|galeria/i.test((r && r.id) || ''); if (rev) { setTimeout(() => { try { if (!ac()) return; const tt = ac().currentTime; const g = C.saida(null, .9, 'voz'); const f = C.burst(tt, .6, 'bandpass', 760, 1, g); f.frequency.linearRampToValueAtTime(520, tt + .5); C.env(g, tt, .05, .12, .5); leg('l7_arfarAlheio'); } catch (e) {} }, 1500); } }
    L.prendiaPrev = prende;

    // ---- Respiração que escapa sozinha: fôlego vence a vontade ----
    if (prende && S.stamina < 5 && jogando) { L.escapaCd = (L.escapaCd || 0) - dt; if (L.escapaCd <= 0) { L.escapaCd = 4; try { C.SOM.arfar(); } catch (e) {} if (!teste()) C.emitNoise(P.pos.x, P.pos.z, 1.6, true); } }

    // ---- Nota suspensa da caçada: só resolve quando ele perde a pista ----
    if (N.susG) {
      if (est === 'caca') { if (!L.cacaOn) { L.cacaOn = true; N.susO.detune.setValueAtTime(0, now); } N.susG.gain.setTargetAtTime(.01 * C.clamp(1 - dM / 24, .2, 1), now, .5); }
      else { if (L.cacaOn) { L.cacaOn = false; N.susO.detune.setTargetAtTime(-200, now, 1.5); N.susG.gain.setTargetAtTime(0, now, 2); } }
    }

    // ---- Camada-radar colada à distância do caçador ----
    if (N.radarG) {
      const on = M.ativo && est !== 'caca' && dM < 16 && jogando;
      const prox = on ? C.clamp(1 - dM / 16, 0, 1) : 0;
      N.radarG.gain.setTargetAtTime(prox * .004, now, .4);
      N.radarO.frequency.setTargetAtTime((200 + prox * 120) * L.dopS, now, .4); N.radarO2.frequency.setTargetAtTime((200 + prox * 120) * 1.5 * (1 + prox * .06) * L.dopS, now, .4);
    }

    // ---- Pedal que sobe meio-tom o capítulo inteiro ----
    if (N.pedalG) {
      const prog = C.clamp((S.capT || 0) / 480, 0, 1);
      N.pedalO.frequency.setTargetAtTime(55 * Math.pow(2, prog / 12), now, 2);
      N.pedalG.gain.setTargetAtTime(jogando && !fora ? .008 + .01 * cn : 0, now, 2);
    }

    // ---- A casa respira no escuro: coro de respirações que some com a lanterna ----
    if (N.coroG) { N.coroBp.frequency.setTargetAtTime(700 + Math.sin(nowSafe() * .5) * 300, now, .3); N.coroG.gain.setTargetAtTime(jogando && interior && !flashOn && perigo < .3 ? .01 : 0, now, flashOn ? .2 : .6); }

    // ---- Infra-som: ponto maldito da capela e picos de medo ----
    if (N.infraG) {
      let inf = 0;
      if (naCapela && cr) inf = C.clamp(1 - Math.hypot(P.pos.x - cr.x, P.pos.z - (r.z0)) / 10, 0, 1) * .01;
      if (S.fear > 90) inf = Math.max(inf, .008);
      N.infraG.gain.setTargetAtTime((C.OPT && C.OPT.semZumbido) ? 0 : (jogando ? inf : 0), now, 1);
    }

    // ---- Pressão nos ouvidos quando algo invisível divide a sala escura ----
    if (N.divG) {
      const invisivel = M.ativo && !flashOn && C.roomAt && sameRoom(C.roomAt(M.pos.x, M.pos.z), r) && est !== 'caca';
      N.divG.gain.setTargetAtTime((C.OPT && C.OPT.semZumbido) ? 0 : (invisivel && jogando ? .01 : 0), now, .6);
    }

    // ---- Metrônomo que trava no instante do bote ----
    if (jogando && (est === 'investiga' || est === 'procura' || est === 'alerta')) {
      L.metroT = (L.metroT || 0) - dt;
      if (L.metroT <= 0) { L.metroT = est === 'alerta' ? .25 : C.rand(.4, .95); const g = C.saida(null, 0, 'amb'); C.burst(now, .015, 'bandpass', 2200, 8, g); C.env(g, now, .001, .04, .015); if (est === 'alerta' && !L.metroAvisou) { L.metroAvisou = true; leg('l7_metronomo'); } }
      if (est !== 'alerta') L.metroAvisou = false;
    }

    // ---- Acorde de proximidade por entidade: cercada soa mais dissonante ----
    const ativos = (M.ativo && dM < 16 ? 1 : 0) + (ANA.ativa && dA < 14 ? 1 : 0) + (PROC.fase ? 1 : 0) + ((C.chamado && C.chamado) ? 1 : 0);
    if (ativos >= 2 && jogando) { L.proxCd = (L.proxCd || 0) - dt; if (L.proxCd <= 0) { L.proxCd = 3; const pos = M.ativo ? M.pos : ANA.ativa ? ANA.pos : P.pos; const g = pos3({ x: pos.x, y: 1.6, z: pos.z }, 1.6, 'amb', .6); for (const f of [147, 207.7]) C.osc('sawtooth', f, now, 1.2, g); C.env(g, now, .1, .02, 1); if (!L.proxAvisou) { L.proxAvisou = true; leg('l7_proxEntidade'); } } } else L.proxAvisou = false;

    // ---- Trilha de "quase pego" que se cala ----
    if (S.hidden && prende && M.ativo && dM < 2 && jogando) {
      try { C.AMB.caca && C.AMB.caca.gain.setTargetAtTime(0, now, .3); C.AMB.cordas && C.AMB.cordas.gain.setTargetAtTime(0, now, .3); } catch (e) {}
      if (N.susG) N.susG.gain.setTargetAtTime(.012, now, .2);
      if (!L.quaseAvisou) { L.quaseAvisou = true; leg('l7_quasePego'); }
    } else L.quaseAvisou = false;

    // ---- Alívio que mente: nota suspensa quando ele desiste normalmente ----
    if ((estAnt === 'procura' || estAnt === 'investiga') && est === 'patrulha' && dM < 25 && dM >= 3 && jogando) {
      const g = C.saida(null, .8, 'mus'); C.osc('sine', 233, now, 3, g); C.osc('sine', 246.9, now + .1, 2.5, g); // 2ª menor por cima, nunca fecha
      g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(.014, now + 1); g.gain.exponentialRampToValueAtTime(.0001, now + 3); leg('l7_suspensa');
    }

    // ---- Reza que cerca antes da Procissão ----
    if (PROC.fase === 'aviso' && !L.rezaFeita && jogando) { L.rezaFeita = true; try { C.SOM.sussurros(2); } catch (e) {} try { C.AMB.chuvaF && C.AMB.chuvaF.frequency.setTargetAtTime(700, now, .4); } catch (e) {} leg('l7_reza'); }
    if (!PROC.fase) L.rezaFeita = false;

    // ---- Estalo da Hora do Silêncio: ao se mexer, um aviso só pra você ----
    if (C.AUD.badalando && jogando) { if (mov > .05 && !L.badaladaMexeu) { L.badaladaMexeu = true; const g = C.saida(null, 0, 'corpo'); C.burst(now, .03, 'highpass', 3200, 2, g); C.env(g, now, .001, .12, .03); } } else L.badaladaMexeu = false;

    // ---- Silêncio absoluto numa sala amaldiçoada (raro): surda ao perigo ----
    const anomala = r && (hashId(r.id) % 101) === (L.anomalaHash % 101);
    if (anomala && jogando && !teste()) { L.absolutoCd = (L.absolutoCd || 60); L.absolutoCd -= dt; if (L.absolutoCd <= 0 && perigo < .2) { L.absolutoCd = 9999; try { C.SOM.silencio(4, .02, true); } catch (e) {} if (C.BUS.corpo) { const bc = (C.OPT.vSfx ?? 1); C.BUS.corpo.gain.setTargetAtTime(0, now, .1); setTimeout(() => { try { C.BUS.corpo && C.BUS.corpo.gain.setTargetAtTime(bc, ac().currentTime, .3); } catch (e) {} }, 4000); } leg('l7_silencioAbsoluto'); } }

    // ---- Tempestade cresce ao longo do capítulo final ----
    if (W.mapa === 'cemiterio' && fora && !fuga) { const sobe = C.clamp((S.capT || 0) / 300, 0, 1); Kt.chuva = Math.max(Kt.chuva, 1 + sobe * .5); }

    // =================== ONDA 3 ===================
    const am = C.AMB, noiseR = P.noiseR || 0;

    // ---- A estiada: uma vez por noite (fora do Capítulo II) a chuva para em 2 s; a casa te escuta melhor por 45 s ----
    if (!L.estiadaFeita && jogando && S.chapter !== 2 && perigo < .05 && !PROC.fase && !ANA.ativa && !teste()) {
      L.estiadaCd = (L.estiadaCd == null ? C.rand(110, 260) : L.estiadaCd) - dt;
      if (L.estiadaCd <= 0) { L.estiadaFeita = true; L.estiadaAte = now + 45; leg('l7_estiada'); }
    }
    if (jogando && now < L.estiadaAte) {
      L.estiadaViva = true; Kt.chuva = Math.min(Kt.chuva, .02); Kt.masc *= 1.25; // sem chuva para mascarar, o seu barulho vale mais
      L.gotaT = (L.gotaT || 0) - dt;
      if (L.gotaT <= 0) { L.gotaT = C.rand(.5, 1.5); const a = C.rand(0, 6.28), d = C.rand(2, 8), g = pos3({ x: P.pos.x + Math.cos(a) * d, y: 2.2, z: P.pos.z + Math.sin(a) * d }, 2.2, 'amb', .6); const o = A.createOscillator(); o.frequency.setValueAtTime(C.rand(1400, 2200), now); o.frequency.exponentialRampToValueAtTime(600, now + .07); o.connect(g); C.env(g, now, .002, .07, .12); o.start(now); o.stop(now + .2); }
    } else if (L.estiadaViva) { L.estiadaViva = false; if (jogando) { leg('l7_chuvaVolta'); try { C.SOM.trovao(true); } catch (e) {} } }

    // ---- Rajada de vento: cresce da direita para a esquerda; durante 3 s ela cobre o seu barulho ----
    L.rajadaCd = (L.rajadaCd == null ? C.rand(70, 160) : L.rajadaCd) - dt;
    if (L.rajadaCd <= 0 && jogando && fora && !teste() && perigo < .3) { L.rajadaCd = C.rand(110, 220); L.rajadaIni = now + 2; L.rajadaAte = now + 5; rajada(now); leg('l7_rajada'); }
    if (jogando && now >= (L.rajadaIni || 0) && now < (L.rajadaAte || 0)) Kt.masc *= .5;

    // ---- Passos que sobram: o segundo par e o plof molhado continuam uma vez depois que você para ----
    if (L.ultPasso && now - L.ultPasso > .5) {
      if (L.extraPend) { L.extraPend = false; passoFantasma(now + .05, 1); leg('l7_passoSobrou'); }
      else if (L.seguidor && Math.random() < .2 && jogando && !teste()) { passoFantasma(now + .05, 0); leg('l7_passoSobrou'); }
      L.seguidor = false; L.ultPasso = 0;
    }
    if (now < L.molhadoAte) Kt.ruido *= 1.1; // pisada molhada: o ruído sobe 10% por 40 s

    // ---- Sidechain do perigo: cada passo dele na caçada faz a ambiência ceder por 220 ms ----
    if (now < (L.duckAte || 0)) Kt.amb = Math.min(Kt.amb, .65);

    // ---- Fadiga auditiva: barulho alto demais por 20 s cansa o ouvido; os agudos somem e voltam com agachada ou calma ----
    if (jogando && noiseR >= 12) L.fadiga = Math.min(40, L.fadiga + dt); else L.fadiga = Math.max(0, L.fadiga - dt * (P.crouch ? 4 : 2.5));
    if (L.fadiga > 20) { Kt.corte = Math.min(Kt.corte, 16000 - C.clamp((L.fadiga - 20) / 20, 0, 1) * 12000); if (!L.fadigaAv) { L.fadigaAv = true; leg('l7_fadiga'); } } else if (L.fadiga < 5) L.fadigaAv = false;

    // ---- O começo da caçada de perto deixa um apito no ouvido; a sala onde ela começou fica meio tom desafinada ----
    if (est === 'caca' && estAnt !== 'caca' && jogando) {
      if (r && r.id) L.marcadas.add(r.id);
      if (dM < 8) { try { C.SOM.zumbidoOuvido(.6); } catch (e) {} leg('l7_tinido'); }
    }

    // ---- Geladeira da cozinha: liga, trepida, desliga com um tum; para de vez quando ele entra e volta com tranco ----
    const salaCoz = rr => rr && (rr.tipo === 'cozinha' || rr.tipo === 'despensa');
    const naCoz = salaCoz(r);
    if (naCoz && !N.fridG) { N.fridG = A.createGain(); N.fridG.gain.value = 0; const flp = A.createBiquadFilter(); flp.type = 'lowpass'; flp.frequency.value = 260; N.fridO = A.createOscillator(); N.fridO.type = 'sawtooth'; N.fridO.frequency.value = 60; N.fridO2 = A.createOscillator(); N.fridO2.type = 'square'; N.fridO2.frequency.value = 120; const f2g = A.createGain(); f2g.gain.value = .25; N.fridO.connect(flp); N.fridO2.connect(f2g); f2g.connect(flp); flp.connect(N.fridG); N.fridG.connect(C.BUS.amb); N.fridO.start(); N.fridO2.start(); L.fridOn = true; L.fridT = C.rand(40, 90); }
    if (N.fridG && jogando) {
      const inspCoz = !!(M.ativo && C.roomAt && salaCoz(C.roomAt(M.pos.x, M.pos.z)));
      L.fridT -= dt;
      if (L.fridOn && (inspCoz || L.fridT <= 0)) { L.fridOn = false; L.fridT = inspCoz ? Infinity : C.rand(8, 14); if (naCoz) { const g = C.saida(null, 0, 'amb'); C.osc('sine', 58, now, .35, g); C.env(g, now, .004, .1, .3); leg('l7_geladeira'); } }
      else if (!L.fridOn && !inspCoz) { if (L.fridT === Infinity) L.fridT = 0; if (L.fridT <= 0) { L.fridOn = true; L.fridT = C.rand(40, 90); if (naCoz) { const g = C.saida(null, 0, 'amb'); C.burst(now, .2, 'lowpass', 140, 1, g); C.env(g, now, .01, .08, .18); } } }
      N.fridG.gain.setTargetAtTime(naCoz && L.fridOn ? .016 : 0, now, L.fridOn ? .15 : .03);
      N.fridO.frequency.setTargetAtTime(60 + (L.fridOn ? Math.sin(nowSafe() * 9) * .6 : 0), now, .1);
    }

    // ---- Regras da trilha: sem música até a primeira caçada, lacuna de 25 a 40 s depois de cada pico, Cap. V seco, esconderijo só diegético ----
    const pico = est === 'caca' || est === 'bote' || PROC.fase === 'passando';
    if (pico) L.picoVivo = true; else if (L.picoVivo) { L.picoVivo = false; L.musicaProibidaAte = now + C.rand(25, 40); L.banAtiva = true; }
    if (!S.flags) S.flags = {};
    if (est === 'caca' && !S.flags.l7caca && jogando) { S.flags.l7caca = true; golpeCordas(); leg('l7_golpeCordas'); }
    const cap5 = S.chapter === 5 && !S.flags.sino;
    const mudoMus = jogando && (!S.flags.l7caca || now < L.musicaProibidaAte || cap5 || (!!S.hidden && est !== 'caca'));
    if (mudoMus) { for (const k of ['cordas', 'violino', 'cluster', 'zumbido']) { try { am[k] && am[k].gain.setTargetAtTime(0, now, .3); } catch (e) {} } }
    if (L.banAtiva && now >= L.musicaProibidaAte && jogando && !pico) { L.banAtiva = false; if (!teste()) { const g = C.saida(null, .8, 'mus'); C.osc('triangle', 220, now, 4.2, g); g.gain.setValueAtTime(.0001, now); g.gain.exponentialRampToValueAtTime(.014, now + 1.2); g.gain.exponentialRampToValueAtTime(.0001, now + 4); leg('l7_musicaVolta'); } }

    // ---- Calmaria longa: depois de 60 s sem ameaça a ambiência recua em degraus; qualquer barulho alto devolve tudo com um tum ----
    if (jogando && perigo < .05 && !PROC.fase && !ANA.ativa && noiseR < 8) L.calmaLonga += dt;
    else { if (L.calmaLonga > 70 && jogando) { const g = C.saida(null, 0, 'amb'); C.osc('sine', 52, now, .35, g); C.env(g, now, .005, .12, .3); leg('l7_calmaTum'); } L.calmaLonga = 0; L.calmaAv = false; L.calmaEstalo = false; }
    const degCalma = C.clamp(Math.floor((L.calmaLonga - 60) / 10) + 1, 0, 4);
    if (degCalma > 0) { Kt.amb = Math.min(Kt.amb, 1 - degCalma * .17); if (!L.calmaAv) { L.calmaAv = true; leg('l7_calmaPesa'); } }
    if (degCalma >= 4 && !L.calmaEstalo && !teste()) { L.calmaEstalo = true; try { C.SOM.rangido(P.pos.x + C.rand(-6, 6), .1, P.pos.z + C.rand(-6, 6), .5); } catch (e) {} }

    // ---- A lanterna zumbe mais agudo e trêmulo conforme a pilha acaba ----
    try { if (am.flash && flashOn && !(M.ativo && dM < 10)) { const b = C.clamp((S.battery == null ? 100 : S.battery) / 100, 0, 1); am.flash.o.frequency.setTargetAtTime(110 + (1 - b) * 170 + (b < .25 ? Math.sin(nowSafe() * 37) * 14 : 0), now, .15); } } catch (e) {}

    // ---- Escuro total com a lanterna na mão: um chiado cresce; acender corta tudo num estalo seco ----
    if (jogando && S.inv && S.inv.lanterna && !flashOn && !S.hidden) L.escuroT = (L.escuroT || 0) + dt;
    else { if ((L.escuroT || 0) > 6 && flashOn && jogando) { const g = C.saida(null, 0, 'sfx'); C.burst(now, .03, 'highpass', 4200, 1, g); C.env(g, now, .001, .1, .03); } L.escuroT = 0; L.escuroAv = false; }
    if (N.dkG) { N.dkG.gain.setTargetAtTime(C.clamp((L.escuroT - 6) / 10, 0, 1) * .007, now, flashOn ? .01 : .8); if (L.escuroT > 10 && !L.escuroAv) { L.escuroAv = true; leg('l7_escuroRuido'); } }

    // ---- A sombra da respiração: escondida, às vezes há uma segunda respiração atrasada que continua quando você prende o ar ----
    if (S.hidden && jogando) {
      if (L.hideId !== S.hidden) { L.hideId = S.hidden; L.sombra = Math.random() < .4 && !teste(); L.sombraT = C.rand(3, 5); L.sombraAv = false; const a = C.rand(0, 6.28); L.sombraPos = { x: P.pos.x + Math.cos(a) * 1.7, z: P.pos.z + Math.sin(a) * 1.7 }; }
      if (L.sombra) { L.sombraT -= dt; if (L.sombraT <= 0) { L.sombraT = C.rand(3.3, 4.3); const g = pos3(L.sombraPos, 1.1, 'amb', .5), f = C.burst(now + .4, .8, 'bandpass', 800, 1.2, g); f.frequency.setValueAtTime(800, now + .4); f.frequency.linearRampToValueAtTime(520, now + 1.1); C.env(g, now + .4, .25, .018, .55); if (!L.sombraAv) { L.sombraAv = true; leg('l7_respSombra'); } } }
    } else L.hideId = null;

    // ---- O ar pesa: com a Ana por perto (mesmo fora de vista) o ruído da sala morre; quando ela some volta um pop ----
    if (jogando && ANA.ativa && !ANA.vista && dA < 6) { Kt.amb = Math.min(Kt.amb, .3); if (!L.anaPesoOn) { L.anaPesoOn = true; leg('l7_anaPeso'); } }
    else if (L.anaPesoOn) { L.anaPesoOn = false; if (jogando) { const g = C.saida(null, 0, 'amb'); C.burst(now, .02, 'lowpass', 900, 1, g); C.env(g, now, .001, .04, .02); } }

    // ---- Doppler: o radar e o canto do Inspetor sobem de tom quando ele vem e descem quando ele se afasta (±6%) ----
    const vr = dt > 0 && M.ativo ? (dM - (L.dMPrev == null ? dM : L.dMPrev)) / dt : 0; L.dMPrev = dM;
    L.dopS += (C.clamp(1 - vr * .008, .94, 1.06) - L.dopS) * Math.min(1, dt * 4);

    // ---- suaviza os multiplicadores que o motor lê ----
    K.chuva = suave(K.chuva, Kt.chuva, dt, .15, 1.2);
    K.amb = suave(K.amb, Kt.amb, dt, .05, .5);
    K.ruido = Kt.ruido; K.masc = Kt.masc; K.corte = Kt.corte;

    L.estPrev2 = est;
    L.estPrev = est;
  }

  function AMBdrone() { try { return !!(C.AMB && C.AMB.drone); } catch (e) { return false; } }
  function nowSafe() { try { return C.AC.currentTime; } catch (e) { return 0; } }
  function sameRoom(a, b) { return a && b && a === b; }
  function alivio() {
    const A = ac(); if (!A) return; const t = A.currentTime, falso = Math.random() < .25;
    // acorde maior, quente e com um sino: a única vez que o jogo soa bonito; em 1 de cada 4 a terça desafina para o menor no meio
    for (const [i, f] of [[0, 196], [1, 246.9], [2, 293.7], [3, 784]]) {
      const g = C.saida(null, 1, 'mus'), o = C.osc(i === 3 ? 'triangle' : 'sine', f, t + i * .1, 3.4, g);
      g.gain.setValueAtTime(.0001, t + i * .1); g.gain.exponentialRampToValueAtTime(i === 3 ? .008 : .02, t + i * .1 + .8); g.gain.exponentialRampToValueAtTime(.0001, t + 3.2);
      if (falso && i === 1) { o.frequency.setValueAtTime(f, t + 1.4); o.frequency.exponentialRampToValueAtTime(233, t + 1.9); }
    }
    if (falso) setTimeout(() => leg('l7_alivioFalso'), 1500);
  }
  // rajada de vento: um ronco que atravessa a casa da direita para a esquerda
  function rajada(t) {
    const A = ac(); if (!A) return;
    const pn = pan2('amb', .9), g = A.createGain(); g.connect(pn);
    try { if (pn.pan) { pn.pan.setValueAtTime(.9, t); pn.pan.linearRampToValueAtTime(-.9, t + 4.5); } } catch (e) {}
    const f = C.burst(t, 4.8, 'bandpass', 350, 1.2, g, 0);
    try { f.frequency.setValueAtTime(350, t); f.frequency.exponentialRampToValueAtTime(1000, t + 3); } catch (e) {}
    C.env(g, t, 2.2, .12, 2.5);
  }
  // um passo fraco que não é seu (kind 1 = segundo par, 0 = plof molhado)
  function passoFantasma(t, kind) {
    const g = C.saida(null, kind ? .4 : .3, 'sfx');
    C.burst(t, kind ? .12 : .14, 'lowpass', kind ? 640 : 520, 1, g); C.env(g, t, .006, .09, .12);
  }
  // golpe de cordas: a música entra pela primeira vez no primeiro encontro
  function golpeCordas() {
    const A = ac(); if (!A) return; const t = A.currentTime, g = C.saida(null, .8, 'mus');
    for (const f of [147, 155.6, 220, 233.1, 440]) C.osc('sawtooth', f, t, 1.8, g);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + 1.7);
  }
  // ganchos chamados pelo motor
  function passo(vol, room, agua) {
    const A = ac(); if (!A || !L.nodes || !C.S) return; const t = A.currentTime;
    L.ultPasso = t;
    const umido = C.W.mapa === 'cemiterio' || C.W.mapa === 'tuneis' || !!agua;
    if (umido && vol > .2) { const d = C.rand(.05, .09); const g = C.saida(null, .35, 'sfx'); C.burst(t + d, .14, 'lowpass', 520, 1, g); C.env(g, t + d, .006, .1 * vol + .02, .12); L.seguidor = true; }
    if (agua) L.molhadoAte = t + 40;
    else if (t < L.molhadoAte && !umido && vol > .2) { const g = C.saida(null, .25, 'sfx'); C.burst(t, .12, 'bandpass', 700, 1.5, g); C.env(g, t, .01, .08 * vol + .02, .1); }
    // segundo par de passos, 0,2 s atrasado, em corredor vazio (no máximo duas vezes por noite)
    const M = C.M, PROC = C.PROC;
    if (L.extraRest <= 0 && room && room.tipo === 'corredor' && L.extraUsos < 2 && vol > .3 && !(M.ativo && C.P.pos.distanceTo(M.pos) < 20) && !PROC.fase && Math.random() < .012 && !teste()) { L.extraRest = 8; L.extraUsos++; leg('l7_passosExtra'); }
    if (L.extraRest > 0) { L.extraRest--; passoFantasma(t + .2, 1); L.extraPend = true; }
  }
  function passoMonstro(pos, estado) { const A = ac(); if (A && estado === 'caca') L.duckAte = A.currentTime + .22; }
  function porta(d, open) {
    const A = ac(); if (!A || !C.S || C.mode !== 'jogo' || !d) return;
    const P = C.P, dist = Math.hypot(d.x - P.pos.x, d.z - P.pos.z), t = A.currentTime;
    if (dist < 9 || dist > 45 || t < (L.correnteCd || 0)) return; L.correnteCd = t + 6;
    const g = pos3({ x: d.x, z: d.z }, 1.5, 'amb', .5), f = C.burst(t, 2.4, 'bandpass', open ? 1100 : 800, 14, g, 0);
    try { f.frequency.linearRampToValueAtTime(open ? 1500 : 600, t + 2.2); } catch (e) {}
    C.env(g, t, .5, .012, 1.9);
    const g2 = pos3({ x: d.x, z: d.z }, 1.2, 'amb', .3); C.burst(t, .35, 'lowpass', 160, 1, g2); C.env(g2, t, .01, .05, .3);
    leg('l7_corrente', { x: d.x, z: d.z });
  }
  function trovao(gap, fora, natural) {
    const A = ac(); if (!A || !natural || !C.S) return; const t = A.currentTime + gap;
    setTimeout(() => leg(gap < .45 ? 'l7_trovaoPerto' : gap < 2.5 ? 'l7_trovaoMeio' : 'l7_trovaoLonge'), gap * 1000);
    if (gap < .45) { const g = C.saida(null, .2, 'amb'); C.burst(t - .02, .18, 'highpass', 3500, 1, g); C.env(g, t - .02, .001, .7, .16); setTimeout(() => { try { C.SOM.zumbidoOuvido(.3); } catch (e) {} }, gap * 1000 + 100); }
  }
  return { tick, montar, passo, passoMonstro, porta, trovao, ambMul: () => K.amb, chuvaMul: () => K.chuva, ruidoMul: () => K.ruido, mascara: () => K.masc, corte: () => K.corte };
}
