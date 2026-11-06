// =====================================================================
// ÁUDIO — LOTE 7 ("Som e atmosfera: a casa respira, a tensão canta, o silêncio mata")
// Camadas de som que dão vida às entidades e ao internato pelo ouvido:
//  - ambiência própria por sala (cada cômodo soa diferente, com cross-fade na porta);
//  - música procedural de tensão que cresce com o perigo, sem piscar;
//  - vozes do Inspetor (deduções, desculpas, regras, isca) e dos corais;
//  - o silêncio usado como arma (ele cala para te achar, finge desistir, a Procissão subtrai o som);
//  - clima e chuva: trovão que encobre os passos, rajadas, relâmpago sonoro.
// Som 100% procedural (sem assets externos). Ligado ao motor por poucas linhas (procure SOMM7 em jogo.js).
// =====================================================================

const LEGENDAS = {
  l7_salaNota: { t: 'o cômodo tem um zumbido próprio, surdo', imp: 0, cd: 20, cat: 'h' },
  l7_tensaoSobe: { t: 'uma corda de tensão cresce no ar', imp: 0, cd: 12, cat: 'p' },
  l7_dread: { t: 'um grave de pavor desce: ele decidiu caçar', imp: 1, cd: 10, cat: 'p' },
  l7_silencioDele: { t: 'ele calou de repente: ele te achou', imp: 1, cd: 6, cat: 'p' },
  l7_fingeIr: { t: 'o som dele some: cuidado, pode ser mentira', imp: 1, cd: 8, cat: 'p' },
  l7_semChaves: { t: 'as chaves dele sumiram: ele caça em silêncio', imp: 1, cd: 12, cat: 'p' },
  l7_odeiaSilencio: { t: 'ele bate em algo de propósito para te assustar', imp: 1, cd: 8, cat: 'p', pos: a => a[0] },
  l7_parouDemais: { t: '"ela parou...": ficar parada demais te entrega', imp: 1, cd: 12, cat: 'p' },
  l7_dedz: { t: 'ele murmura o que deduz de você', imp: 0, cd: 7, cat: 'p', pos: a => a[0] },
  l7_desculpa: { t: 'ele pede desculpa, baixinho, às crianças', imp: 0, cd: 10, cat: 'h', pos: a => a[0] },
  l7_regras: { t: 'ele recita as regras da casa de boca fechada', imp: 0, cd: 9, cat: 'h', pos: a => a[0] },
  l7_citaBarulho: { t: 'ele resmunga sobre o seu último barulho', imp: 0, cd: 7, cat: 'p', pos: a => a[0] },
  l7_memoriaSala: { t: 'ele murmura a lembrança deste cômodo', imp: 0, cd: 10, cat: 'h', pos: a => a[0] },
  l7_iscaLia: { t: 'uma voz tenta soar como você: não vá', imp: 1, cd: 10, cat: 'p', pos: a => a[0] },
  l7_ventriloquo: { t: 'a voz dele veio do lado errado de propósito', imp: 1, cd: 9, cat: 'p', pos: a => a[0] },
  l7_soletra: { t: 'o coro soletra o seu nome, letra por letra', imp: 1, cd: 14, cat: 'p' },
  l7_rezaNome: { t: 'a reza troca um nome pelo seu', imp: 1, cd: 14, cat: 'h' },
  l7_duetoChamado: { t: 'duas vozes chamam o seu nome em harmonia', imp: 1, cd: 12, cat: 'p' },
  l7_trovao: { t: 'um trovão estoura e encobre os seus passos', imp: 1, cd: 10, cat: 'h' },
  l7_relampago: { t: 'o relâmpago estala agudo pela casa', imp: 0, cd: 6, cat: 'h' },
  l7_chuvaForte: { t: 'a chuva arrebenta lá fora numa rajada', imp: 0, cd: 14, cat: 'h' },
  l7_fechadura: { t: 'pela fechadura, a respiração dele vem nítida', imp: 1, cd: 5, cat: 'p', pos: a => a[0], insp: 1 },
  l7_respAcelera: { t: 'o seu fôlego acelera e denuncia você', imp: 1, cd: 8, cat: 'p' },
  l7_unhasParede: { t: 'unhas arranham a parede acompanhando você', imp: 0, cd: 5, cat: 'p', pos: a => a[0] },
  l7_imitaCasa: { t: 'um som da casa soou errado: era ele', imp: 1, cd: 9, cat: 'p', pos: a => a[0] },
  l7_respMadeira: { t: 'a respiração dele atravessa a madeira do armário', imp: 1, cd: 5, cat: 'p', pos: a => a[0] },
  l7_saboreia: { t: 'ele para e escuta o seu coração antes do bote', imp: 1, cd: 8, cat: 'p' },
  l7_ecoEscuta: { t: 'ele bate na parede e escuta o eco voltar', imp: 0, cd: 6, cat: 'p', pos: a => a[0] },
  l7_passoSeco: { t: 'o passo dele chega seco, sem eco: perto', imp: 0, cd: 6, cat: 'p', pos: a => a[0] },
  l7_fareja: { t: 'ele funga o ar seguindo o seu rastro', imp: 0, cd: 6, cat: 'p', pos: a => a[0] },
  l7_bussolaVert: { t: 'o batimento aponta: ele está num andar diferente', imp: 0, cd: 10, cat: 'p' },
  l7_bengalaEscuta: { t: 'a bengala dele bate num ritmo de quem escuta', imp: 0, cd: 6, cat: 'p', pos: a => a[0] },
  l7_passoFalta: { t: 'um passo dele faltou: ele parou para ouvir', imp: 1, cd: 7, cat: 'p' },
  l7_imitaFolego: { t: 'ele devolve o ritmo do seu próprio fôlego', imp: 1, cd: 9, cat: 'p' },
  l7_lanternaApita: { t: 'a lanterna zune mais forte: ele está perto', imp: 0, cd: 5, cat: 'p' },
  l7_leitVaza: { t: 'duas notas atravessam a parede antes dele', imp: 0, cd: 5, cat: 'p', pos: a => a[0] },
  l7_grunhido: { t: 'um grunhido grave vaza das paredes', imp: 0, cd: 6, cat: 'p', pos: a => a[0] },
  l7_doppler: { t: 'as chaves passam voando: ele cruzou correndo', imp: 1, cd: 6, cat: 'p', pos: a => a[0] },
  l7_ecoMente: { t: 'um passo ecoou da parede errada', imp: 1, cd: 10, cat: 'p', pos: a => a[0] },
  l7_canone: { t: 'o Inspetor e a Ana chamam de lados opostos', imp: 1, cd: 12, cat: 'p' },
  l7_anaOlhar: { t: 'a Ana suspira: a sua luz a prendeu', imp: 0, cd: 5, cat: 'h' },
  l7_anaBoca: { t: 'um chiado de criança respira pela boca, perto', imp: 0, cd: 5, cat: 'p', pos: a => a[0] },
  l7_anaNumeroErrado: { t: 'ela sussurra um número fora de ordem', imp: 1, cd: 6, cat: 'p' },
  l7_anaCantarola: { t: 'a Ana cantarola antes de começar a contar', imp: 0, cd: 7, cat: 'h', pos: a => a[0] },
  l7_anaVentriloqua: { t: 'a contagem veio do lado errado dela', imp: 1, cd: 8, cat: 'p' },
  l7_corneta: { t: 'o alto-falante trava ao dizer o seu nome', imp: 1, cd: 14, cat: 'h' },
  l7_procPerto: { t: 'a cada badalada o coro está uma sala mais perto', imp: 1, cd: 6, cat: 'p' },
  l7_procCerca: { t: 'o coro circula o seu esconderijo', imp: 1, cd: 8, cat: 'p' },
  l7_ladainha: { t: 'a ladainha fica clara por um instante: ordem, silêncio', imp: 1, cd: 10, cat: 'h' },
  l7_corrente: { t: 'uma corrente pesada se arrasta a cada passo dele', imp: 0, cd: 6, cat: 'p', pos: a => a[0] },
  l7_tensaoSuja: { t: 'a trilha range mais doente a cada capítulo', imp: 0, cd: 20, cat: 'p' },
  l7_impasse: { t: 'ele congelou na Hora do Silêncio: não faça som', imp: 1, cd: 20, cat: 'p' },
  l7_paredeSilencio: { t: 'uma parede de silêncio rola na sua direção', imp: 1, cd: 12, cat: 'p' },
  l7_buraco: { t: 'qualquer som agora vale ouro para ele', imp: 1, cd: 10, cat: 'p' },
  l7_eleTeOuviu: { t: 'um baque surdo: ele travou em você', imp: 1, cd: 5, cat: 'p' }
};

export function instalarSomMonstros7(C) {
  const { THREE } = C;
  if (C.legendas) Object.assign(C.legendas, LEGENDAS);
  const ac = () => C.AC;
  const leg = (k, ...a) => { try { C.som(k, a); } catch (e) {} };
  const rand = C.rand, clamp = C.clamp, pick = C.pick;
  const lsGet = C.lsGet || (() => '');
  const nomeJogador = () => { try { const n = lsGet('hora-silencio-nome', ''); return (typeof n === 'string' ? n : '').trim().slice(0, 16); } catch (e) { return ''; } };
  const teste = () => { try { return !!window.__teste; } catch (e) { return false; } };

  const L = {
    nodes: null,
    salaNota: null, salaPrev: null, salaNotaCd: 0,
    estPrev: null, capPrev: -1, mapaPrev: null, procFasePrev: null,
    tensaoAlvo: 0, dreadT: 0, sujaCap: -1,
    // silêncio como arma
    silencioDeleAte: 0, silencioAviso: false, fingeIrAte: 0, fingeCd: 0,
    semChavesAte: 0, odeiaT: 0, odeiaCd: 0,
    paradaT: 0, parouAvisou: 0, impasseAte: 0, paredeCd: 0, buracoAte: 0,
    saboreiaAte: 0, eleTeOuviuPrev: false,
    // vozes
    dedzCd: 0, desculpaCd: 0, regrasCd: 0, citaCd: 0, memoriaSala: null,
    iscaCd: 0, ventriloCd: 0, soletraCd: 0, soletraFila: null, soletraT: 0,
    rezaNomeCd: 0, duetoCd: 0, grunhidoCd: 0, canoneCd: 0, corneta: false,
    // clima
    trovaoAte: 0, trovaoCd: 0, chuvaForteAte: 0, chuvaCd: 8, relampCd: 0,
    chuvaBaseCap: 0,
    // inspetor pelo ouvido
    fechaduraCd: 0, respAceleraT: 0, respAceleraCd: 0, unhasX: 0, unhasT: 0,
    imitaCasaCd: 0, respMadeiraCd: 0, ecoEscutaCd: 0, passoSecoCd: 0,
    farejaCd: 0, bussolaCd: 0, bengalaEscutaCd: 0, passoFaltaCd: 0,
    imitaFolegoT: 0, imitaFolegoCd: 0, leitVazaCd: 0, dopplerPrev: null,
    ecoMenteCd: 0, corrente: false, lanternaBatida: 0,
    // ana
    anaVistaPrev: false, anaBocaCd: 0, anaNumPrev: -1, anaNumCd: 0,
    anaCantarolou: false, anaVentriloCd: 0, procPertoBad: 0, procCercaT: 0, ladainhaCd: 0,
    stepPrevPos: null, stepFaltaConta: 0,
    // atmosfera e clima extra
    alivioPrev: null, procPosPrev: null, telhadoCd: 0, ventoUivoCd: 0, gotaEcoCd: 0,
    gemidoCd: 0, madeiraCd: 0, aguaEcoCd: 0, rastroAgua: 0, inspAgua: false,
    anaEcoCd: 0, capacitorCd: 0, cochichoCd: 0, sinoCapelaCd: 0, portaRondaCd: 0,
    arPesadoT: 0, passoEcoCd: 0
  };

  // --- Nós contínuos criados uma vez (ambiência por sala + camadas de tensão)
  function montar() {
    const A = ac(); if (!A || L.nodes) return;
    const BUS = C.BUS, N = {};
    // leito de ambiência por sala: ruído filtrado cujo timbre muda ao trocar de cômodo (ideia: ambiência por sala)
    N.ambFonte = C.ruido(true); N.ambFiltro = A.createBiquadFilter(); N.ambFiltro.type = 'bandpass'; N.ambFiltro.frequency.value = 500; N.ambFiltro.Q.value = .5;
    N.ambG = A.createGain(); N.ambG.gain.value = 0; N.ambFonte.connect(N.ambFiltro); N.ambFiltro.connect(N.ambG); N.ambG.connect(BUS.amb); try { N.ambFonte.start(); } catch (e) {}
    // "nota" ressonante de cada sala (um tom fundamental por cômodo)
    N.notaO = A.createOscillator(); N.notaO.type = 'sine'; N.notaO.frequency.value = 70; N.notaG = A.createGain(); N.notaG.gain.value = 0; N.notaO.connect(N.notaG); N.notaG.connect(BUS.amb); N.notaO.start();
    // pad de tensão procedural: cluster que cresce com o perigo, sem piscar
    N.padG = A.createGain(); N.padG.gain.value = 0; const padF = A.createBiquadFilter(); padF.type = 'lowpass'; padF.frequency.value = 900; padF.Q.value = .6; N.padF = padF; padF.connect(N.padG); N.padG.connect(BUS.mus || BUS.amb);
    N.padOsc = [];
    for (const f of [98, 116.5, 146.8, 174.6]) { const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = rand(-8, 8); o.connect(padF); o.start(); N.padOsc.push(o); }
    // sub-grave de pavor (dread swell): desce quando ele decide caçar e quando o perigo dispara
    N.dreadG = A.createGain(); N.dreadG.gain.value = 0; N.dreadO = A.createOscillator(); N.dreadO.type = 'sine'; N.dreadO.frequency.value = 44; N.dreadO.connect(N.dreadG); N.dreadG.connect(C.master || BUS.sfx); N.dreadO.start();
    // pedal grave que entra quando duas ameaças dividem a sala (leitmotifs entrelaçados)
    N.pedalG = A.createGain(); N.pedalG.gain.value = 0; N.pedalO = A.createOscillator(); N.pedalO.type = 'triangle'; N.pedalO.frequency.value = 55; const pedF = A.createBiquadFilter(); pedF.type = 'lowpass'; pedF.frequency.value = 300; N.pedalO.connect(pedF); pedF.connect(N.pedalG); N.pedalG.connect(BUS.mus || BUS.amb); N.pedalO.start();
    // sino-celeste frio da Ana na trilha / órgão da Procissão
    N.sinoCel = A.createGain(); N.sinoCel.gain.value = 0; N.sinoO = A.createOscillator(); N.sinoO.type = 'sine'; N.sinoO.frequency.value = 1568; N.sinoO.connect(N.sinoCel); N.sinoCel.connect(BUS.amb); N.sinoO.start();
    N.orgaoG = A.createGain(); N.orgaoG.gain.value = 0; const orF = A.createBiquadFilter(); orF.type = 'lowpass'; orF.frequency.value = 500; for (const f of [49, 73.4, 98]) { const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.connect(orF); o.start(); } orF.connect(N.orgaoG); N.orgaoG.connect(BUS.amb);
    // bumbo surdo de coração (música de tensão que bate junto com o batimento)
    N.bumboPronto = true;
    // zumbido da lanterna que bate mais forte quando ele chega perto (microfonia)
    N.lanternaBat = A.createGain(); N.lanternaBat.gain.value = 0; N.lanternaO = A.createOscillator(); N.lanternaO.type = 'sine'; N.lanternaO.frequency.value = 123; const lbg = A.createGain(); lbg.gain.value = .5; N.lanternaLfo = A.createOscillator(); N.lanternaLfo.frequency.value = 4; N.lanternaLfo.connect(lbg); lbg.connect(N.lanternaBat.gain); N.lanternaO.connect(N.lanternaBat); N.lanternaBat.connect(BUS.sfx); N.lanternaO.start(); N.lanternaLfo.start();
    L.nodes = N;
  }

  function pos3(pos, y, bus, wet) { return C.saida({ x: pos.x, y: y ?? 1.6, z: pos.z }, wet ?? .5, bus || 'ent'); }

  // Voz formante (murmúrio do Inspetor), posicionada e abafada por oclusão via saida()
  function murmurar(pos, vogais, f0, vol, bus) {
    const A = ac(); if (!A) return; const t = A.currentTime;
    const base = f0 || 108;
    vogais.split('').forEach((v, i) => { try { C.silaba(t + i * .19, { x: pos.x, y: 1.5, z: pos.z }, base * rand(.95, 1.05), v, .16, (vol ?? .09), bus || 'voz', .45); } catch (e) {} });
  }
  // Voz que joga o som para longe (ventríloquo): fonte posicionada num ponto, não no dono
  function vozLonge(x, z, vogais, f0, vol) { murmurar({ x, z }, vogais, f0, vol || .11); }

  // Letra sussurrada (soletrar o nome): um sopro bandpass por letra
  function letra(pos, agudo) {
    const A = ac(); if (!A) return; const t = A.currentTime, g = pos3(pos, 1.4, 'voz', .5);
    const f = C.burst(t, .32, 'bandpass', agudo ? 2200 : 1500, 3, g); f.frequency.linearRampToValueAtTime(agudo ? 1700 : 1100, t + .3); C.env(g, t, .05, .12, .28);
  }

  // Trovão: estrondo longo e grave, com crack agudo quando é perto
  function trovao(perto) {
    const A = ac(); if (!A) return; const t = A.currentTime;
    const g = C.saida(null, .9, 'amb'); const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(perto ? 2600 : 900, t); lp.frequency.exponentialRampToValueAtTime(90, t + (perto ? 2.4 : 3.6)); lp.connect(g);
    C.burst(t, perto ? 2.6 : 3.8, 'lowpass', perto ? 1800 : 700, .6, lp, 0);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(perto ? .5 : .28, t + (perto ? .05 : .5)); g.gain.exponentialRampToValueAtTime(.0001, t + (perto ? 2.8 : 4));
    const g2 = C.saida(null, .4, 'amb'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(perto ? 55 : 40, t); o.frequency.exponentialRampToValueAtTime(22, t + 1.5); o.connect(g2); C.env(g2, t, .02, perto ? .4 : .22, perto ? 1.8 : 2.6); o.start(t); o.stop(t + 3);
    if (perto) { const gc = C.saida(null, .6, 'amb'); C.burst(t, .12, 'highpass', 3500, .8, gc); C.env(gc, t, .002, .5, .1); }
  }

  function tick(dt, ctx) {
    const A = ac(); if (!A) return;
    montar();
    const N = L.nodes, S = C.S, M = C.M, ANA = C.ANA, PROC = C.PROC, P = C.P, W = C.W, now = A.currentTime;
    if (!S) return;
    const jogando = ctx && ctx.jogando;
    const est = ctx ? ctx.est : (M.ativo ? M.state : null);
    const dM = ctx ? ctx.dM : (M.ativo ? M.pos.distanceTo(P.pos) : 99);
    const dA = ctx ? ctx.dA : (ANA.ativa ? ANA.pos.distanceTo(P.pos) : 99);
    const prende = ctx && ctx.prende;
    const perigo = ctx ? (ctx.perigo || 0) : 0;
    const fora = ctx ? ctx.fora : false, subsolo = ctx ? ctx.subsolo : false;
    const cap = S.chapter || 0;
    const mesmaSala = () => { try { return M.ativo && C.roomAt(M.pos.x, M.pos.z) === P.room; } catch (e) { return false; } };
    const adj = () => { try { return M.ativo && C.salaAdj(C.roomAt(M.pos.x, M.pos.z), P.room); } catch (e) { return false; } };

    // ======================= AMBIÊNCIA POR SALA =======================
    if (N && P.room && P.room !== L.salaPrev) {
      L.salaPrev = P.room; const r = P.room;
      // perfil por tipo de cômodo: timbre e nível do leito de ar
      let freq = 480, q = .6, vol = .0045, nota = 68;
      const id = (r.id || '') + '';
      const h = [...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
      nota = 44 + (h % 24); // cada cômodo tem uma nota fundamental própria
      if (subsolo) { freq = 230; q = .5; vol = .006; }
      else if (fora) { freq = 1800; q = .3; vol = .004; }
      else if (W.mapa === 'cemiterio' || /capela|nave/i.test(id)) { freq = 1300; q = .4; vol = .005; }
      else if (W.mapa === 'superior') { freq = 900; q = .8; vol = .0045; } // vento pela janela quebrada
      else if (/cozinha|despensa|refeit/i.test(id)) { freq = 150; q = 2; vol = .006; } // zumbido elétrico morto
      if (r.agua) { freq = Math.min(freq, 700); vol += .002; } // borbulhar
      const grande = (r.x1 - r.x0) * (r.z1 - r.z0) > 60 || (r.h || 3) > 4.5;
      if (grande) vol *= 1.3; // salas grandes: ar mais presente
      N.ambFiltro.frequency.setTargetAtTime(freq, now, .6);
      N.ambFiltro.Q.setTargetAtTime(q, now, .6);
      N.notaO.frequency.setTargetAtTime(nota, now, .8);
      L.salaNota = { vol, nota };
      if (L.salaNotaCd <= 0 && jogando) { L.salaNotaCd = 25; leg('l7_salaNota'); }
    }
    if (N && L.salaNota) {
      // cross-fade suave: o leito respira com o quão fechado é o ar da sala
      const alvo = jogando ? L.salaNota.vol * (prende ? .3 : 1) : 0;
      N.ambG.gain.setTargetAtTime(alvo, now, .5);
      N.notaG.gain.setTargetAtTime(jogando && !prende ? .0022 : 0, now, .7);
    }
    L.salaNotaCd -= dt;

    // ======================= MÚSICA PROCEDURAL DE TENSÃO =======================
    // pad de tensão com histerese (cresce com o perigo, sem piscar) e silêncio no bote
    if (N) {
      const bote = est === 'alerta' || est === 'bote';
      let alvo = jogando ? clamp(perigo * .9, 0, 1) : 0;
      if (bote) alvo = 0; // o vazio musical avisa o golpe
      if (now < L.fingeIrAte || now < L.silencioDeleAte) alvo = 0; // falsa desistência / silêncio dele
      L.tensaoAlvo = L.tensaoAlvo < alvo ? Math.min(alvo, L.tensaoAlvo + dt * .9) : Math.max(alvo, L.tensaoAlvo - dt * .4);
      // respira com o fôlego: sobe quando a Lia está sem ar
      const esforco = clamp((45 - (S.stamina ?? 100)) / 45, 0, 1);
      const pad = L.tensaoAlvo * (.01 + esforco * .006);
      N.padG.gain.setTargetAtTime(pad, now, .4);
      N.padF.frequency.setTargetAtTime(500 + L.tensaoAlvo * 1600, now, .5);
      if (L.tensaoAlvo > .3 && Math.random() < dt * .25 && !bote) leg('l7_tensaoSobe');
    }
    // dissonância que sobe de meio-tom e trilha mais suja a cada capítulo
    if (N && cap !== L.sujaCap) {
      L.sujaCap = cap;
      const semitom = Math.pow(2, Math.min(5, cap) / 12);
      N.padOsc.forEach((o, i) => o.frequency.setTargetAtTime([98, 116.5, 146.8, 174.6][i] * semitom, now, 2));
      N.padOsc.forEach(o => o.detune.setTargetAtTime(rand(-10, 10) - cap * 3, now, 2)); // mais desafinado = mais doente
      if (cap > 0 && jogando) leg('l7_tensaoSuja');
    }
    // sino-celeste quando a Ana conta perto; órgão quando a Procissão vem
    if (N) {
      N.sinoCel.gain.setTargetAtTime(jogando && ANA.ativa && dA < 11 ? .0016 * clamp(1 - dA / 11, 0, 1) : 0, now, .6);
      N.orgaoG.gain.setTargetAtTime(jogando && PROC.fase ? (PROC.fase === 'passando' ? .006 : .003) : 0, now, .8);
    }
    // pedal grave quando duas ameaças dividem a cena (leitmotifs entrelaçados)
    if (N) {
      let ameacas = 0; if (M.ativo && dM < 20) ameacas++; if (ANA.ativa) ameacas++; if (PROC.fase) ameacas++;
      N.pedalG.gain.setTargetAtTime(jogando && ameacas >= 2 ? .006 : 0, now, 1);
      if (ameacas >= 2) N.pedalO.detune.setTargetAtTime(Math.sin(now * .7) * 20, now, .5);
    }
    // bumbo surdo de coração em sincronia com o batimento quando o perigo é alto
    if (N && jogando && perigo > .65 && est === 'caca') { if (!L._bumboT || now - L._bumboT > .5) { L._bumboT = now; try { const t = now, g = C.saida(null, 0, 'mus'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(50, t); o.frequency.exponentialRampToValueAtTime(30, t + .18); o.connect(g); C.env(g, t, .006, .09 * clamp(perigo, 0, 1), .2); o.start(t); o.stop(t + .3); } catch (e) {} } }
    // dread swell quando ele decide caçar
    if (N && est === 'caca' && L.estPrev !== 'caca' && jogando) {
      L.dreadT = 1; N.dreadG.gain.cancelScheduledValues(now); N.dreadG.gain.setValueAtTime(.0001, now); N.dreadG.gain.linearRampToValueAtTime(.08, now + .1); N.dreadG.gain.exponentialRampToValueAtTime(.0001, now + 1.6);
      N.dreadO.frequency.cancelScheduledValues(now); N.dreadO.frequency.setValueAtTime(60, now); N.dreadO.frequency.exponentialRampToValueAtTime(30, now + 1.5);
      leg('l7_dread');
    }

    // ======================= SILÊNCIO COMO ARMA =======================
    // ele cala de repente ao travar em você (1-1,4s antes do bote)
    if (jogando && M.ativo && (est === 'alerta') && L.estPrev !== 'alerta') {
      L.silencioDeleAte = now + 1.3; L.semChavesAte = Math.max(L.semChavesAte, now + 1.3); M.l7semChaves = true;
      try { C.abafarMundo(.14, 1.1); } catch (e) {}
      leg('l7_silencioDele');
    }
    // falsa desistência: na caça, às vezes tudo dele some ~4s enquanto ele espera parado
    L.fingeCd -= dt;
    if (jogando && est === 'procura' && dM < 12 && L.fingeCd <= 0 && cap >= 2 && Math.random() < dt * .08 && now > L.fingeIrAte) {
      L.fingeIrAte = now + rand(3.5, 4.5); L.fingeCd = 25; L.semChavesAte = Math.max(L.semChavesAte, L.fingeIrAte); M.l7semChaves = true;
      leg('l7_fingeIr');
    }
    // ele larga as chaves e caça em silêncio total nos capítulos finais
    if (jogando && est === 'caca' && cap >= 3 && L.semChavesAte < now && Math.random() < dt * .04) {
      L.semChavesAte = now + rand(4, 7); M.l7semChaves = true; try { P.shake = Math.max(P.shake || 0, .03); } catch (e) {} leg('l7_semChaves');
    }
    // mantém/limpa a mudez das chaves
    M.l7semChaves = L.semChavesAte > now;
    // ele odeia o silêncio: silêncio longo o deixa agitado e ele bate algo de propósito
    L.odeiaCd -= dt;
    if (jogando && M.ativo && (est === 'patrulha' || est === 'procura') && !S.hidden && perigo < .15) L.odeiaT += dt; else L.odeiaT = Math.max(0, L.odeiaT - dt * 2);
    if (L.odeiaT > 14 && L.odeiaCd <= 0 && dM < 20) {
      L.odeiaT = 0; L.odeiaCd = rand(12, 20);
      try { const t = now, p = { x: M.pos.x, y: 1, z: M.pos.z }, g = pos3(p, 1, 'ent', .6); C.burst(t, .5, 'lowpass', 300, 1, g, 0); C.env(g, t, .003, 1.1, .45); } catch (e) {}
      if (!S.hidden && (est === 'patrulha')) { try { M.olhar = new THREE.Vector3(P.pos.x, 0, P.pos.z); M.olharT = 1; } catch (e) {} }
      leg('l7_odeiaSilencio', M.pos);
    }
    // ficar parada e calada demais te entrega: um sussurro "ela parou" e ele muda de rota
    const quieta = jogando && M.ativo && !S.hidden && !P.sprinting && (P.noiseR === 0 || (P.crouch && !keysMove()));
    if (quieta) L.paradaT += dt; else L.paradaT = 0;
    if (L.paradaT > 18 && now - L.parouAvisou > 20 && dM < 26 && !teste()) {
      L.parouAvisou = now; L.paradaT = 0;
      try { const p = { x: P.pos.x + rand(-4, 4), z: P.pos.z + rand(-4, 4) }; C.silaba(now, { x: p.x, y: 1.1, z: p.z }, 300, 'a', .5, .09, 'voz', .5); C.silaba(now + .5, { x: p.x, y: 1.1, z: p.z }, 260, 'o', .4, .07, 'voz', .5); } catch (e) {}
      try { if (est === 'patrulha' || est === 'procura') { M.ultimo = P.pos.clone(); } } catch (e) {}
      leg('l7_parouDemais');
    }
    // o "buraco de som": quando o mundo cala (Hora do Silêncio/escuta), qualquer ruído seu vale mais
    if (jogando && (est === 'escuta' || L.impasseAte > now) && P.noiseR > 0 && !S.hidden) {
      if (now > L.buracoAte) { L.buracoAte = now + 2; leg('l7_buraco'); try { if (!teste()) C.emitNoise(P.pos.x, P.pos.z, (P.noiseR || 1) * 1.8, true); } catch (e) {} }
    }
    // o Inspetor saboreia o seu coração: perto, batimento alto e sem te ver, ele para e escuta antes do bote
    if (jogando && M.ativo && est === 'caca' && dM < 4 && !S.hidden && (S.fear || 0) > 70 && now > L.saboreiaAte && Math.random() < dt * .5) {
      L.saboreiaAte = now + 9;
      try { const t = now, g = pos3(M.pos, 1.6, 'ent', .3); const f = C.burst(t, 1.2, 'bandpass', 500, 1.5, g); f.frequency.linearRampToValueAtTime(1800, t + 1.1); C.env(g, t, .2, .5, .8); } catch (e) {}
      try { C.abafarMundo(.2, .9); } catch (e) {}
      leg('l7_saboreia');
    }
    // aviso puramente sonoro de "ele te ouviu": baque sub-grave quando ele passa a caçar você
    const eleTeOuviu = est === 'caca' && (L.estPrev === 'investiga' || L.estPrev === 'procura' || L.estPrev === 'patrulha');
    if (jogando && eleTeOuviu && !L.eleTeOuviuPrev) { try { const t = now, g = C.saida(null, 0, 'ent'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(34, t + .3); o.connect(g); C.env(g, t, .004, .4, .3); o.start(t); o.stop(t + .4); } catch (e) {} leg('l7_eleTeOuviu'); }
    L.eleTeOuviuPrev = eleTeOuviu;

    // ======================= VOZES DO INSPETOR =======================
    L.dedzCd -= dt; L.desculpaCd -= dt; L.regrasCd -= dt; L.citaCd -= dt;
    if (jogando && M.ativo && dM < 22 && !S.hidden) {
      // deduções na procura ("ela parou...", "respira aí", "tava aqui agora")
      if (est === 'procura' && L.dedzCd <= 0 && Math.random() < dt * .4) {
        L.dedzCd = rand(5, 9);
        const parada = (P.noiseR === 0); const vog = parada ? 'eaa' : P.sprinting ? 'oia' : 'aie';
        murmurar(M.pos, vog, 100 + cap * 4, .08);
        leg('l7_dedz', M.pos);
      }
      // desculpas na patrulha calma dos primeiros capítulos
      else if (est === 'patrulha' && cap <= 2 && L.desculpaCd <= 0 && Math.random() < dt * .18) {
        L.desculpaCd = rand(9, 16); murmurar(M.pos, 'eua', 96, .06); leg('l7_desculpa', M.pos);
      }
      // regras da casa recitadas na ronda ("não corra... não acenda...")
      else if (est === 'patrulha' && L.regrasCd <= 0 && Math.random() < dt * .16) {
        L.regrasCd = rand(10, 18); murmurar(M.pos, 'aooa', 104, .06); leg('l7_regras', M.pos);
      }
      // resmunga citando o seu último barulho, com a direção certa
      if (est === 'investiga' && M.ultimo && L.citaCd <= 0 && Math.random() < dt * .4) {
        L.citaCd = rand(6, 10); murmurar({ x: (M.pos.x + M.ultimo.x) / 2, z: (M.pos.z + M.ultimo.z) / 2 }, 'aui', 102, .08); leg('l7_citaBarulho', M.ultimo);
      }
    }
    // murmura a memória do cômodo ao mudar de sala na ronda
    if (jogando && M.ativo && est === 'patrulha') {
      let mr = null; try { mr = C.roomAt(M.pos.x, M.pos.z); } catch (e) {}
      if (mr && mr !== L.memoriaSala && dM < 18 && Math.random() < .5) { L.memoriaSala = mr; murmurar(M.pos, 'oiea', 98, .055); leg('l7_memoriaSala', M.pos); }
      else if (mr) L.memoriaSala = mr;
    }
    // ventríloquo: ao perder você, às vezes ele joga a própria voz para a sala oposta
    L.ventriloCd -= dt;
    if (jogando && M.ativo && est === 'procura' && L.ventriloCd <= 0 && dM < 20 && Math.random() < dt * .12) {
      L.ventriloCd = rand(10, 16);
      try { const ang = Math.atan2(P.pos.x - M.pos.x, P.pos.z - M.pos.z) + Math.PI, px = M.pos.x + Math.sin(ang) * 7, pz = M.pos.z + Math.cos(ang) * 7; vozLonge(px, pz, 'aie', 100, .12); leg('l7_ventriloquo', { x: px, z: pz }); } catch (e) {}
    }
    // isca: na sala vizinha, uma voz tenta soar como a Lia ("tá tudo bem, pode sair")
    L.iscaCd -= dt;
    if (jogando && M.ativo && est === 'procura' && cap >= 2 && adj() && L.iscaCd <= 0 && Math.random() < dt * .1) {
      L.iscaCd = rand(14, 22); murmurar(M.pos, 'uaoa', 150, .1, 'voz'); leg('l7_iscaLia', M.pos);
    }
    // grunhidos graves vazando das paredes na patrulha (mais desumanos a cada capítulo)
    L.grunhidoCd -= dt;
    if (jogando && M.ativo && !mesmaSala() && adj() && (est === 'patrulha' || est === 'procura') && L.grunhidoCd <= 0 && Math.random() < dt * .25) {
      L.grunhidoCd = rand(5, 9);
      try { const t = now, g = pos3(M.pos, 1.6, 'ent', .5); const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(70 - cap * 4, t); o.frequency.linearRampToValueAtTime(52 - cap * 4, t + .6); const f = A.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500 + cap * 60; o.connect(f); f.connect(g); C.env(g, t, .1, .22, .5); o.start(t); o.stop(t + .8); } catch (e) {}
      leg('l7_grunhido', M.pos);
    }

    // ======================= VOZES: CORAIS E NOMES =======================
    const nome = nomeJogador();
    // o coro soletra o nome digitado durante a Procissão
    L.soletraCd -= dt;
    if (jogando && PROC.fase === 'passando' && nome && nome.toUpperCase() !== 'LIA' && L.soletraCd <= 0 && !L.soletraFila) {
      L.soletraCd = 20; L.soletraFila = nome.toUpperCase().replace(/[^A-ZÀ-Ü]/g, '').split(''); L.soletraT = 0; leg('l7_soletra');
    }
    if (L.soletraFila) { L.soletraT -= dt; if (L.soletraT <= 0) { L.soletraT = .55; const ch = L.soletraFila.shift(); if (!ch) L.soletraFila = null; else letra(PROC.pos || P.pos, 'AEIÁÉÍ'.includes(ch)); } }
    // a reza/radar troca às vezes um nome pelo seu
    L.rezaNomeCd -= dt;
    if (jogando && nome && PROC.fase && L.rezaNomeCd <= 0 && Math.random() < dt * .15) {
      L.rezaNomeCd = rand(16, 26); murmurar(PROC.pos || P.pos, (nome[0] || 'a').toLowerCase().replace(/[^aeiou]/, 'a') + 'ia', 220, .08, 'voz'); leg('l7_rezaNome');
    }
    // dueto do Chamado em terça, de salas opostas (nenhum lado é seguro)
    L.duetoCd -= dt;
    if (jogando && nome && !M.ativo && cap >= 2 && L.duetoCd <= 0 && P.room && Math.random() < dt * .03) {
      L.duetoCd = rand(30, 50);
      try {
        const salas = C.salasAlcancaveis ? [] : []; // guard
        const ang = rand(0, 6.28);
        const aX = P.pos.x + Math.cos(ang) * 8, aZ = P.pos.z + Math.sin(ang) * 8;
        const bX = P.pos.x - Math.cos(ang) * 8, bZ = P.pos.z - Math.sin(ang) * 8;
        const f0 = 330; vozLonge(aX, aZ, 'ia', f0, .1); vozLonge(bX, bZ, 'ia', f0 * 1.26, .1);
      } catch (e) {}
      leg('l7_duetoChamado');
    }
    // cânone a duas vozes: Inspetor e Ana chamam de lados opostos nos capítulos finais
    L.canoneCd -= dt;
    if (jogando && M.ativo && ANA.ativa && cap >= 3 && L.canoneCd <= 0 && Math.random() < dt * .1) {
      L.canoneCd = rand(18, 30); murmurar(M.pos, 'aie', 100, .09, 'voz'); setTimeout(() => { try { if (ac() && ANA.ativa) C.silaba(ac().currentTime, { x: ANA.pos.x, y: 1.2, z: ANA.pos.z }, 420, 'i', .4, .09, 'voz', .5); } catch (e) {} }, 500); leg('l7_canone');
    }

    // ======================= INSPETOR PELO OUVIDO =======================
    // respiração nítida pela fechadura: agachada, mirando/encostada numa porta fechada com ele do outro lado
    L.fechaduraCd -= dt;
    try {
      let ouvindoPorta = false;
      if (jogando && P.crouch && !S.hidden && (P.noiseR === 0) && M.ativo && P.room) {
        for (const l of (W.links || [])) {
          const d = l.door; if (!d || d.open || Math.abs(d.ang || 0) > .12) continue;
          if (Math.hypot(d.x - P.pos.x, d.z - P.pos.z) > 1.8) continue;
          const outro = (l.a === P.room.id) ? l.b : (l.b === P.room.id ? l.a : null); if (outro == null) continue;
          let rm = null; try { rm = C.roomAt(M.pos.x, M.pos.z); } catch (e) {}
          if (rm && rm.id === outro) { ouvindoPorta = true; break; }
        }
      }
      if (ouvindoPorta && dM < 5 && L.fechaduraCd <= 0) {
        L.fechaduraCd = 2.5;
        const t = now, g = C.saida(null, .2, 'ent'); // null = sem posição: nítida, sem oclusão, colada no ouvido
        C.burst(t, .6, 'bandpass', 900, 1.6, g); C.env(g, t, .08, .5, .5);
        const g2 = C.saida(null, 0, 'ent'); const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(70, t); o.connect(g2); C.env(g2, t, .06, .18, .5); o.start(t); o.stop(t + .7);
        leg('l7_fechadura', M.pos);
      }
    } catch (e) {}
    // a respiração dele contamina a sua: perto e sem te ver, o fôlego da Lia acelera e fica audível
    L.respAceleraCd -= dt;
    if (jogando && M.ativo && dM < 4 && !S.hidden && est !== 'caca' && !prende) {
      L.respAceleraT += dt;
      if (L.respAceleraT > 1 && L.respAceleraCd <= 0) { L.respAceleraCd = 3; try { C.burst(now, .5, 'bandpass', 1300, 1, C.saida(null, .1, 'corpo')); } catch (e) {} if (!teste()) { try { C.emitNoise(P.pos.x, P.pos.z, 1.2, true); } catch (e) {} } leg('l7_respAcelera'); }
    } else L.respAceleraT = 0;
    // unhas pela parede acompanhando a sua posição quando ele está na sala vizinha
    L.unhasT -= dt;
    if (jogando && M.ativo && !mesmaSala() && adj() && (est === 'procura' || est === 'investiga') && dM < 9) {
      const movendo = P.noiseR > 0 || P.sprinting || (L.stepPrevPos && L.stepPrevPos.distanceTo(P.pos) > .15);
      if (movendo && L.unhasT <= 0) {
        L.unhasT = .9;
        // a fonte desliza pela parede entre vocês, na altura de x da Lia
        try { const px = P.pos.x, pz = (M.pos.z + P.pos.z) / 2, t = now, g = C.saida({ x: px, y: 1.4, z: pz }, .3, 'ent'); const f = C.burst(t, .7, 'highpass', 2800, 2, g); f.frequency.linearRampToValueAtTime(3600, t + .6); C.env(g, t, .15, .1, .5); } catch (e) {}
        leg('l7_unhasParede', { x: P.pos.x, z: (M.pos.z + P.pos.z) / 2 });
      }
    }
    // ele imita a casa: reproduz um som ambiente (um pingo/trinco) sutilmente errado para te atrair
    L.imitaCasaCd -= dt;
    if (jogando && M.ativo && est === 'procura' && cap >= 2 && L.imitaCasaCd <= 0 && dM < 16 && Math.random() < dt * .1) {
      L.imitaCasaCd = rand(10, 16);
      try { const ang = Math.atan2(P.pos.x - M.pos.x, P.pos.z - M.pos.z), px = M.pos.x - Math.sin(ang) * 4, pz = M.pos.z - Math.cos(ang) * 4, t = now, g = C.saida({ x: px, y: 2, z: pz }, .5, 'amb'); const o = A.createOscillator(); const f0 = rand(700, 1100); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * .4, t + .1); o.connect(g); C.env(g, t, .002, .06, .14); o.start(t); o.stop(t + .2); leg('l7_imitaCasa', { x: px, z: pz }); } catch (e) {}
    }
    // a respiração dele atravessa a madeira do armário, do lado exato em que ele está
    L.respMadeiraCd -= dt;
    if (jogando && S.hidden && S.hidden.tipo !== 'cama' && M.ativo && dM < 2.2 && L.respMadeiraCd <= 0 && !prende) {
      L.respMadeiraCd = rand(3, 4.5);
      try { const t = now, lado = Math.sign(M.pos.x - S.hidden.x) || 1, g = C.saida({ x: S.hidden.x + lado * .4, y: 1.2, z: S.hidden.z }, .1, 'ent'); const f = C.burst(t, .7, 'lowpass', 420, 1.5, g); f.frequency.linearRampToValueAtTime(300, t + .6); C.env(g, t, .1, .4, .55); } catch (e) {}
      leg('l7_respMadeira', M.pos);
    }
    // ele bate na parede e escuta o eco (eco-localização): um toc e uma pausa perigosa
    L.ecoEscutaCd -= dt;
    if (jogando && M.ativo && est === 'procura' && L.ecoEscutaCd <= 0 && dM < 18 && Math.random() < dt * .14) {
      L.ecoEscutaCd = rand(6, 11);
      try { const t = now, g = pos3(M.pos, 1.4, 'ent', .4); C.burst(t, .12, 'lowpass', 500, 1, g, 0); C.env(g, t, .002, .5, .12); const ge = pos3(M.pos, 1.4, 'ent', .6); C.burst(t + .18, .25, 'bandpass', 900, 1, ge); C.env(ge, t + .18, .01, .15, .25); } catch (e) {}
      try { M.olhar = new THREE.Vector3(P.pos.x, 0, P.pos.z); M.olharT = 1.2; } catch (e) {}
      leg('l7_ecoEscuta', M.pos);
    }
    // passo seco, sem reverb, no quarto morto: soa mais perto do que o ouvido espera
    if (jogando && M.ativo && mesmaSala() && P.room && (P.room.acustica === 'morto' || P.room.semEco || (!P.room.acustica && !P.room.fora && (P.room.x1 - P.room.x0) * (P.room.z1 - P.room.z0) < 14)) && dM < 10 && now > (L._secoAte || 0)) {
      L._secoAte = now + 4;
      try { const t = now, g = C.saida(M.pos, 0, 'ent'); const o = A.createOscillator(); o.frequency.setValueAtTime(64, t); o.frequency.exponentialRampToValueAtTime(30, t + .2); o.connect(g); C.env(g, t, .004, .5, .18); o.start(t); o.stop(t + .3); } catch (e) {}
      leg('l7_passoSeco', M.pos);
    }
    // ele funga o ar seguindo o rastro (perto de onde você esteve)
    L.farejaCd -= dt;
    if (jogando && M.ativo && (est === 'procura' || est === 'investiga') && M.ultimo && L.farejaCd <= 0 && Math.random() < dt * .25) {
      L.farejaCd = rand(4, 7);
      try { const t = now, g = pos3(M.pos, 1.8, 'ent', .3); for (const k of [0, .15]) { const f = C.burst(t + k, .12, 'bandpass', 1400, 2, g); f.frequency.linearRampToValueAtTime(2400, t + k + .12); C.env(g, t + k, .02, .18, .1); } } catch (e) {}
      leg('l7_fareja', M.ultimo);
    }
    // coração-bússola com eixo vertical: agudo quando ele está acima, grave quando abaixo
    L.bussolaCd -= dt;
    if (jogando && M.ativo && dM < 16 && L.bussolaCd <= 0) {
      const acima = (W.mapa === 'tuneis') ? false : (W.mapa === 'superior'); const abaixo = W.mapa === 'tuneis';
      if ((acima || abaixo)) {
        L.bussolaCd = 6;
        try { const t = now, g = C.saida(null, 0, 'corpo'); const o = A.createOscillator(); o.frequency.setValueAtTime(acima ? 90 : 36, t); o.frequency.exponentialRampToValueAtTime(acima ? 70 : 24, t + .14); o.connect(g); C.env(g, t, .01, .3, .16); o.start(t); o.stop(t + .25); } catch (e) {}
        leg('l7_bussolaVert');
      }
    }
    // bengala em ritmo de escuta: padrão irregular e espaçado quando ele está no estado de escuta
    L.bengalaEscutaCd -= dt;
    if (jogando && M.ativo && est === 'escuta' && L.bengalaEscutaCd <= 0) {
      L.bengalaEscutaCd = rand(1.2, 2.2);
      try { const t = now; for (const k of [0, .35, .5, 1.1]) { const g = pos3(M.pos, .2, 'ent', .4); C.burst(t + k, .08, 'bandpass', 1400, 4, g); C.env(g, t + k, .002, .28, .07); } } catch (e) {}
      leg('l7_bengalaEscuta', M.pos);
    }
    // o passo que falta: na patrulha ele engole um passo de propósito (o silêncio no lugar do passo)
    L.passoFaltaCd -= dt;
    if (jogando && M.ativo && est === 'patrulha' && dM < 14 && L.passoFaltaCd <= 0 && Math.random() < dt * .08) {
      L.passoFaltaCd = rand(8, 14); try { M.wait = Math.max(M.wait || 0, 1.1); } catch (e) {} leg('l7_passoFalta');
    }
    // ele imita o ritmo do seu fôlego e devolve, zombando (escondida, capítulos finais)
    L.imitaFolegoCd -= dt;
    if (jogando && S.hidden && M.ativo && dM < 2.4 && cap >= 4 && L.imitaFolegoCd <= 0 && Math.random() < dt * .3) {
      L.imitaFolegoCd = rand(6, 10);
      try { const t = now, g = pos3(M.pos, 1.6, 'ent', .2); for (const k of [0, .7]) { const f = C.burst(t + k, .5, 'bandpass', 800, 1.4, g); C.env(g, t + k, .08, .3, .35); } } catch (e) {}
      leg('l7_imitaFolego');
    }
    // a lanterna apita a presença dele: o zumbido ganha um batimento que acelera conforme ele chega
    if (N) {
      const acesa = jogando && S.flashOn && !S.hidden;
      const prox = acesa && M.ativo && dM < 6 ? clamp(1 - dM / 6, 0, 1) : 0;
      N.lanternaBat.gain.setTargetAtTime(prox > 0 ? .002 * prox : 0, now, .15);
      N.lanternaLfo.frequency.setTargetAtTime(3 + prox * 10, now, .2);
      if (prox > .6 && now - L.lanternaBatida > 5) { L.lanternaBatida = now; leg('l7_lanternaApita'); }
    }
    // o leitmotif que vaza antes dele: duas notas da bengala atravessam a parede antes de ele entrar
    L.leitVazaCd -= dt;
    if (jogando && M.ativo && adj() && !mesmaSala() && dM < 10 && (est === 'patrulha' || est === 'investiga' || est === 'procura') && L.leitVazaCd <= 0 && Math.random() < dt * .3) {
      L.leitVazaCd = rand(4, 7);
      try { const t = now, g = pos3(M.pos, 1.2, 'ent', .5); for (const [k, f] of [[0, 196], [.22, 155]]) { const o = A.createOscillator(); o.type = 'triangle'; o.frequency.value = f; const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500; o.connect(lp); lp.connect(g); C.env(g, t + k, .02, .1, .2); o.start(t + k); o.stop(t + k + .3); } } catch (e) {}
      leg('l7_leitVaza', M.pos);
    }
    // doppler nas chaves e passos quando ele cruza correndo na sua frente
    if (jogando && M.ativo && est === 'caca' && dM < 7) {
      if (L.dopplerPrev) {
        const vx = M.pos.x - L.dopplerPrev.x, vz = M.pos.z - L.dopplerPrev.z, vel = Math.hypot(vx, vz) / Math.max(dt, .001);
        const toPx = P.pos.x - M.pos.x, toPz = P.pos.z - M.pos.z, lp = Math.hypot(toPx, toPz) || 1;
        const radial = (vx * toPx + vz * toPz) / lp / Math.max(vel, .001);
        if (vel > 4 && Math.abs(radial) < .4 && now - (L._dopplerT || 0) > 3) { // cruzando lateralmente, rápido
          L._dopplerT = now;
          try { const t = now, g = pos3(M.pos, .8, 'ent', .3); const o = A.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(2600, t); o.frequency.exponentialRampToValueAtTime(1600, t + .3); o.connect(g); C.env(g, t, .01, .12, .3); o.start(t); o.stop(t + .35); } catch (e) {}
          leg('l7_doppler', M.pos);
        }
      }
      L.dopplerPrev = M.pos.clone();
    } else L.dopplerPrev = null;
    // eco de passo que mente a direção, raríssimo e só em salas-eco grandes
    L.ecoMenteCd -= dt;
    if (jogando && M.ativo && mesmaSala() && P.room && ((P.room.x1 - P.room.x0) * (P.room.z1 - P.room.z0) > 70) && est !== 'caca' && L.ecoMenteCd <= 0 && Math.random() < dt * .05) {
      L.ecoMenteCd = rand(20, 35);
      try { const t = now, ang = Math.atan2(M.pos.x - P.pos.x, M.pos.z - P.pos.z) + Math.PI, px = P.pos.x + Math.sin(ang) * 6, pz = P.pos.z + Math.cos(ang) * 6, g = C.saida({ x: px, y: .3, z: pz }, .7, 'ent'); const o = A.createOscillator(); o.frequency.setValueAtTime(64, t); o.frequency.exponentialRampToValueAtTime(30, t + .25); o.connect(g); C.env(g, t, .01, .5, .3); o.start(t); o.stop(t + .4); leg('l7_ecoMente', { x: px, z: pz }); } catch (e) {}
    }
    // arrasto de corrente metálica a cada passo dele a partir do capítulo IV
    if (jogando && M.ativo && cap >= 3 && (est === 'procura' || est === 'caca' || est === 'investiga') && dM < 16) {
      if (L.stepPrevPos && L.stepPrevPos.distanceTo(M.pos) > .5 && now - (L._correnteT || 0) > .4) {
        L._correnteT = now;
        try { const t = now, g = pos3(M.pos, .1, 'ent', .4); for (let i = 0; i < 2; i++) { C.osc('triangle', rand(1500, 2600), t + i * .05, .2, g); } C.env(g, t, .01, .06, .2); } catch (e) {}
        if (now - (L._correnteLeg || 0) > 6) { L._correnteLeg = now; leg('l7_corrente', M.pos); }
      }
    }

    // ======================= ANA PELO OUVIDO =======================
    // feedback do olhar: suspiro de alívio quando a luz a prende, gemido ao perdê-la
    if (jogando && ANA.ativa) {
      const presa = !!(ANA.vista);
      if (presa && !L.anaVistaPrev) { try { const t = now, g = C.saida({ x: ANA.pos.x, y: 1, z: ANA.pos.z }, .3, 'ent'); const f = C.burst(t, .5, 'bandpass', 900, 1.5, g); f.frequency.linearRampToValueAtTime(600, t + .45); C.env(g, t, .06, .12, .4); } catch (e) {} leg('l7_anaOlhar'); }
      else if (!presa && L.anaVistaPrev && dA < 12) { try { const t = now, g = C.saida({ x: ANA.pos.x, y: 1, z: ANA.pos.z }, .3, 'ent'); const o = A.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(420, t); o.frequency.linearRampToValueAtTime(300, t + .4); const bf = A.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 800; o.connect(bf); bf.connect(g); C.env(g, t, .05, .1, .4); o.start(t); o.stop(t + .5); } catch (e) {} }
      L.anaVistaPrev = presa;
    } else L.anaVistaPrev = false;
    // a Ana respira pela boca quando está no cômodo mas ainda invisível
    L.anaBocaCd -= dt;
    if (jogando && ANA.ativa && !ANA.vista && dA < 7 && L.anaBocaCd <= 0 && Math.random() < dt * .4) {
      L.anaBocaCd = rand(3, 5);
      try { const t = now, g = C.saida({ x: ANA.pos.x, y: 1.1, z: ANA.pos.z }, .3, 'ent'); C.burst(t, .4, 'bandpass', 1100, 1.2, g); C.env(g, t, .06, .07, .35); } catch (e) {}
      leg('l7_anaBoca', ANA.pos);
    }
    // número fora de ordem sussurrado por cima da contagem (atmosférico, não muda o relógio dela)
    if (jogando && ANA.ativa && !ANA.vista && typeof ANA.conta === 'number' && ANA.conta !== L.anaNumPrev) {
      L.anaNumPrev = ANA.conta;
      if (cap >= 3 && dA < 9 && L.anaNumCd <= 0 && Math.random() < .25) {
        L.anaNumCd = 4; const errado = (ANA.conta + 2 + (Math.random() * 6 | 0)) % 10;
        try { C.silaba(now + .1, { x: ANA.pos.x, y: 1.2, z: ANA.pos.z }, 440, 'eieo'[errado % 4] || 'e', .3, .06, 'voz', .4); } catch (e) {}
        leg('l7_anaNumeroErrado');
      }
    }
    L.anaNumCd -= dt;
    // a Ana cantarola a melodia antes de começar a contar (vaza de onde ela está)
    if (jogando && ANA.ativa && typeof ANA.conta === 'number') {
      if (ANA.conta === 0 && !L.anaCantarolou && dA < 14) {
        L.anaCantarolou = true;
        try { const t = now; [659, 784, 659, 523].forEach((f, i) => { const g = C.saida({ x: ANA.pos.x, y: 1.2, z: ANA.pos.z }, .4, 'voz'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.value = f / 2; const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; o.connect(bp); bp.connect(g); C.env(g, t + i * .28, .04, .05, .24); o.start(t + i * .28); o.stop(t + i * .28 + .3); }); } catch (e) {}
        leg('l7_anaCantarola', ANA.pos);
      } else if (ANA.conta > 1) L.anaCantarolou = false;
    }
    // ventriloquia da Ana: às vezes a contagem vem de 180° do lado real dela
    L.anaVentriloCd -= dt;
    if (jogando && ANA.ativa && !ANA.vista && dA < 12 && L.anaVentriloCd <= 0 && Math.random() < dt * .08) {
      L.anaVentriloCd = rand(10, 18);
      try { const ang = Math.atan2(ANA.pos.x - P.pos.x, ANA.pos.z - P.pos.z) + Math.PI, px = P.pos.x + Math.sin(ang) * 5, pz = P.pos.z + Math.cos(ang) * 5; C.silaba(now, { x: px, y: 1.2, z: pz }, 420, 'e', .35, .09, 'voz', .5); leg('l7_anaVentriloqua'); } catch (e) {}
    }

    // ======================= PROCISSÃO PELO OUVIDO =======================
    // a cada badalada da Procissão o coro está uma sala mais perto (contagem regressiva espacial)
    if (jogando && PROC.fase) {
      if (PROC.fase !== L.procFasePrev) { L.procFasePrev = PROC.fase; if (PROC.fase === 'aviso') L.procPertoBad = 0; }
      if (PROC.fase === 'passando') {
        // o coro circula o esconderijo (panners orbitando) quando a fila atravessa a sua sala
        if (S.hidden && now - L.procCercaT > .9) {
          L.procCercaT = now;
          try { const ang = now * 1.3, px = (S.hidden.x) + Math.cos(ang) * 2.2, pz = (S.hidden.z) + Math.sin(ang) * 2.2; C.silaba(now, { x: px, y: 1.4, z: pz }, 240, 'o', .5, .06, 'voz', .6); } catch (e) {}
          if (now - (L._cercaLeg || 0) > 8) { L._cercaLeg = now; leg('l7_procCerca'); }
        }
      }
    } else L.procFasePrev = null;
    // ladainha da Procissão que fica inteligível por um instante no ponto de passagem mais próximo
    L.ladainhaCd -= dt;
    if (jogando && PROC.fase === 'passando' && PROC.pos && Math.hypot(PROC.pos.x - P.pos.x, PROC.pos.z - P.pos.z) < 5 && L.ladainhaCd <= 0) {
      L.ladainhaCd = 12;
      murmurar(PROC.pos, 'oeia', 150, .08, 'voz'); // reza por "ordem" e "silêncio"
      leg('l7_ladainha');
    }

    // ======================= CLIMA E CHUVA =======================
    // chuva base mais forte a cada capítulo + rajadas que crescem e somem
    if (N && jogando) {
      const A2 = C.AMB;
      // reforço de chuva em rajadas (soma à chuva do motor sem substituí-la)
      L.chuvaCd -= dt;
      if (L.chuvaCd <= 0 && (fora || W.mapa === 'superior') && Math.random() < .5) {
        L.chuvaCd = rand(10, 20); L.chuvaForteAte = now + rand(2.5, 5);
        if (now - (L._chuvaLeg || 0) > 14) { L._chuvaLeg = now; leg('l7_chuvaForte'); }
      }
    }
    // trovão: eventos periódicos, mais forte com o capítulo; abre uma janela que encobre os passos
    L.trovaoCd -= dt;
    if (jogando && L.trovaoCd <= 0 && !teste()) {
      L.trovaoCd = rand(18, 40) * (cap >= 3 ? .7 : 1);
      const perto = Math.random() < (.2 + cap * .08);
      trovao(perto);
      if (perto) {
        L.trovaoAte = now + 2.2; // janela: durante ~2s os passos da Lia (e os dele) somem para o ouvido do outro
        try { const f = new THREE.Vector3(); } catch (e) {}
        leg('l7_trovao');
      }
    }
    // relâmpago: estalo elétrico agudo quando o motor dispara o clarão
    try {
      if (jogando && C.relampejou && C.relampejou() && L.relampCd <= 0) {
        L.relampCd = 2;
        const t = now, g = C.saida(null, .5, 'amb'); C.burst(t, .18, 'highpass', 4200, .8, g); C.env(g, t, .002, .35, .16);
        const g2 = C.saida(null, .3, 'amb'); const o = A.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(3800, t); o.frequency.exponentialRampToValueAtTime(1200, t + .1); o.connect(g2); C.env(g2, t, .001, .08, .1); o.start(t); o.stop(t + .15);
        leg('l7_relampago');
      }
    } catch (e) {}
    L.relampCd -= dt;

    // ======================= HORA DO SILÊNCIO: IMPASSE =======================
    if (L.impasseAte > now && jogando) {
      // mantém o mundo abafado durante o impasse
      if (Math.random() < dt * .5) { try { C.abafarMundo(.1, .4); } catch (e) {} }
    }

    // ======================= ATMOSFERA E CLIMA EXTRA =======================
    // trovão perto deixa a Lia com o ouvido abafado por um instante também
    if (jogando && now < L.trovaoAte && now - (L._trovaoDuck || 0) > 3) { L._trovaoDuck = now; try { C.abafarMundo(.5, 1); } catch (e) {} }
    // acorde de alívio tênue quando o Inspetor desiste e volta à patrulha
    if (jogando && (L.alivioPrev === 'caca' || L.alivioPrev === 'procura') && est === 'patrulha' && dM < 24) {
      try { const t = now; [220, 277.2, 329.6].forEach((f, i) => { const g = C.saida(null, .8, 'mus'); C.osc('sine', f, t + i * .05, 2, g); C.env(g, t + i * .05, .2, .025, 1.6); }); } catch (e) {}
    }
    L.alivioPrev = est;
    // Doppler no canto da Procissão conforme ela se move
    if (jogando && PROC.fase === 'passando' && PROC.pos) {
      if (L.procPosPrev) {
        const vx = PROC.pos.x - L.procPosPrev.x, vz = PROC.pos.z - L.procPosPrev.z, vel = Math.hypot(vx, vz) / Math.max(dt, .001);
        const toX = P.pos.x - PROC.pos.x, toZ = P.pos.z - PROC.pos.z, lp = Math.hypot(toX, toZ) || 1;
        const radial = (vx * toX + vz * toZ) / lp;
        if (vel > 1 && now - (L._procDop || 0) > 1.3) { L._procDop = now; const sobe = radial > 0; try { const t = now, g = C.saida({ x: PROC.pos.x, y: 1.4, z: PROC.pos.z }, .6, 'voz'); const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(220 * (sobe ? 1.06 : .94), t); o.frequency.linearRampToValueAtTime(220 * (sobe ? 1.12 : .88), t + .5); const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; o.connect(bp); bp.connect(g); C.env(g, t, .08, .06, .5); o.start(t); o.stop(t + .6); } catch (e) {} }
      }
      L.procPosPrev = PROC.pos.clone();
    } else L.procPosPrev = null;
    // chuva no telhado mais forte durante as rajadas, no andar de cima
    L.telhadoCd -= dt;
    if (jogando && W.mapa === 'superior' && now < L.chuvaForteAte && L.telhadoCd <= 0) {
      L.telhadoCd = rand(.4, .9);
      try { const t = now, g = C.saida(null, .3, 'amb'); C.burst(t, .5, 'bandpass', 3800, .6, g); C.env(g, t, .05, .05, .45); } catch (e) {}
    }
    // vento uivando em rajadas longas ao ar livre
    L.ventoUivoCd -= dt;
    if (jogando && fora && L.ventoUivoCd <= 0 && Math.random() < dt * .12) {
      L.ventoUivoCd = rand(8, 16);
      try { const t = now, g = C.saida(null, .4, 'amb'); const f = C.burst(t, 3, 'bandpass', 500, 3, g); f.frequency.setValueAtTime(380, t); f.frequency.linearRampToValueAtTime(900, t + 1.5); f.frequency.linearRampToValueAtTime(420, t + 3); C.env(g, t, .8, .07, 2); } catch (e) {}
    }
    // gotejar com eco denso nos túneis (além da goteira do motor)
    L.gotaEcoCd -= dt;
    if (jogando && subsolo && L.gotaEcoCd <= 0 && Math.random() < dt * .5) {
      L.gotaEcoCd = rand(1.2, 3.2);
      try { const t = now, p = { x: P.pos.x + rand(-7, 7), y: 2.2, z: P.pos.z + rand(-7, 7) }; for (const [k, v] of [[0, 1], [.14, .5], [.3, .22]]) { const g = C.saida(p, .7, 'amb'); const o = A.createOscillator(); const f0 = rand(700, 1100); o.frequency.setValueAtTime(f0, t + k); o.frequency.exponentialRampToValueAtTime(f0 * .35, t + k + .08); o.connect(g); C.env(g, t + k, .002, .045 * v, .12); o.start(t + k); o.stop(t + k + .16); } } catch (e) {}
    }
    // o prédio geme (um grave estrutural) nas calmarias longas
    L.gemidoCd -= dt;
    if (jogando && !fora && perigo < .1 && !PROC.fase && L.gemidoCd <= 0 && Math.random() < dt * .04) {
      L.gemidoCd = rand(20, 40);
      try { const t = now, g = C.saida(null, .5, 'amb'); const o = A.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(48, t); o.frequency.linearRampToValueAtTime(38, t + 2.5); const lpf = A.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 160; o.connect(lpf); lpf.connect(g); C.env(g, t, .6, .05, 2.2); o.start(t); o.stop(t + 3); } catch (e) {}
    }
    // estalos de madeira esfriando à noite (contração térmica), dentro de casa
    L.madeiraCd -= dt;
    if (jogando && !fora && !subsolo && perigo < .2 && L.madeiraCd <= 0 && Math.random() < dt * .08) {
      L.madeiraCd = rand(6, 14);
      try { const t = now, p = { x: P.pos.x + rand(-6, 6), y: .2, z: P.pos.z + rand(-6, 6) }; const g = C.saida(p, .4, 'amb'); C.burst(t, .09, 'bandpass', rand(400, 800), 6, g); C.env(g, t, .002, .18, .08); } catch (e) {}
    }
    // pingos na água que ecoam atrás da Lia depois que ela pisa (túneis)
    L.aguaEcoCd -= dt;
    if (jogando && subsolo && P.naAgua && (P.noiseR > 0 || P.sprinting) && L.aguaEcoCd <= 0) {
      L.aguaEcoCd = rand(.5, 1);
      try { const t = now, p = { x: P.pos.x + rand(-1, 1), y: .1, z: P.pos.z + rand(-1, 1) }; for (const k of [.25, .55]) { const g = C.saida(p, .6, 'amb'); const o = A.createOscillator(); o.frequency.setValueAtTime(rand(800, 1200), t + k); o.frequency.exponentialRampToValueAtTime(420, t + k + .06); o.connect(g); C.env(g, t + k, .002, .04, .1); o.start(t + k); o.stop(t + k + .14); } } catch (e) {}
    }
    // coração-bússola com eco lateral: um segundo batimento panoramizado para o lado dele
    if (jogando && M.ativo && dM < 12 && perigo > .4 && now - (L._bussolaLat || 0) > (60 / (60 + 90 * perigo))) {
      L._bussolaLat = now;
      try { const t = now, ladoX = P.pos.x + Math.sign(M.pos.x - P.pos.x || 1) * 2; const g = C.saida({ x: ladoX, y: 1.5, z: P.pos.z }, 0, 'corpo'); const o = A.createOscillator(); o.frequency.setValueAtTime(50, t); o.frequency.exponentialRampToValueAtTime(32, t + .14); o.connect(g); C.env(g, t, .01, .12 * perigo, .16); o.start(t); o.stop(t + .25); } catch (e) {}
    }
    // a contagem da Ana ganha um eco frio em mapas reverberantes (capela/túneis)
    L.anaEcoCd -= dt;
    if (jogando && ANA.ativa && !ANA.vista && dA < 12 && (subsolo || W.mapa === 'cemiterio') && typeof ANA.conta === 'number' && ANA.conta !== L._anaEcoNum) {
      L._anaEcoNum = ANA.conta;
      if (L.anaEcoCd <= 0) { L.anaEcoCd = .3; try { C.silaba(now + .35, { x: ANA.pos.x, y: 1.2, z: ANA.pos.z }, 420, 'e', .4, .04, 'voz', .9); } catch (e) {} }
    }
    // cauda de "metal morto" nos passos dele a partir do capítulo IV (chaves enferrujadas)
    if (jogando && M.ativo && cap >= 3 && !M.l7semChaves && (est === 'procura' || est === 'caca' || est === 'patrulha') && dM < 16 && L.stepPrevPos && M.pos && L.stepPrevPos.distanceTo(M.pos) > .55 && now - (L._metalMorto || 0) > .5) {
      L._metalMorto = now;
      try { const t = now, g = pos3(M.pos, .6, 'ent', .4); const f = C.burst(t, .25, 'lowpass', 900 - cap * 80, 2, g); C.env(g, t, .004, .05, .22); } catch (e) {}
    }
    // arfar mais fundo e trêmulo da Lia quando o perigo é extremo e sem ar
    if (jogando && perigo > .85 && !prende && (S.stamina ?? 100) < 30 && now - (L._arfar || 0) > 2.5) {
      L._arfar = now;
      try { const t = now, g = C.saida(null, .1, 'corpo'); const f = C.burst(t, .7, 'bandpass', 1200, 1.2, g); f.frequency.linearRampToValueAtTime(1700, t + .5); const tr = A.createOscillator(); tr.frequency.value = 8; const tg = A.createGain(); tg.gain.value = .1; tr.connect(tg); tg.connect(g.gain); tr.start(t); tr.stop(t + .7); C.env(g, t, .06, .22, .6); } catch (e) {}
    }
    // a casa cochicha: vozes coletivas distantes e indistintas numa calmaria longa
    L.cochichoCd -= dt;
    if (jogando && !fora && perigo < .08 && !PROC.fase && !ANA.ativa && L.cochichoCd <= 0 && Math.random() < dt * .03) {
      L.cochichoCd = rand(30, 55);
      try { const t = now, p = { x: P.pos.x + rand(-10, 10), y: 1.4, z: P.pos.z + rand(-10, 10) }; for (let i = 0; i < 4; i++) C.silaba(t + i * .3 + rand(0, .1), p, rand(200, 320), 'aeiou'[Math.random() * 5 | 0], .25, .03, 'voz', .8); } catch (e) {}
    }
    // sino distante da capela que dobra sozinho, raro à noite
    L.sinoCapelaCd -= dt;
    if (jogando && L.sinoCapelaCd <= 0 && Math.random() < dt * .02 && !PROC.fase) {
      L.sinoCapelaCd = rand(40, 80);
      try { const t = now, ang = rand(0, 6.28), p = { x: P.pos.x + Math.cos(ang) * 20, y: 3, z: P.pos.z + Math.sin(ang) * 20 }; const g = C.saida(p, .9, 'amb'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.value = 196; const o2 = A.createOscillator(); o2.type = 'sine'; o2.frequency.value = 196 * 2.7; const g2 = A.createGain(); g2.gain.value = .3; o2.connect(g2); g2.connect(g); o.connect(g); C.env(g, t, .004, .07, 3.5); o.start(t); o2.start(t); o.stop(t + 4); o2.stop(t + 4); } catch (e) {}
    }
    // rangido de porta distante que bate sozinho enquanto ele ronda longe
    L.portaRondaCd -= dt;
    if (jogando && M.ativo && dM > 16 && est === 'patrulha' && L.portaRondaCd <= 0 && Math.random() < dt * .06) {
      L.portaRondaCd = rand(14, 26);
      try { const t = now, g = C.saida(M.pos, .9, 'amb'); const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.connect(g); C.burst(t, .6, 'lowpass', 300, 1, lp, 0); C.env(g, t, .004, .5, .55); } catch (e) {}
    }
    // o ar fica pesado (um sub-grave sobe) no escuro total, sem lanterna
    const escuroTotal = jogando && !S.flashOn && !fora;
    if (escuroTotal) L.arPesadoT += dt; else L.arPesadoT = Math.max(0, L.arPesadoT - dt * 2);
    if (escuroTotal && L.arPesadoT > 3 && now - (L._arPesado || 0) > 6) { L._arPesado = now; try { const t = now, g = C.saida(null, 0, 'amb'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(30, t); o.connect(g); C.env(g, t, 1.5, .05, 2); o.start(t); o.stop(t + 4); } catch (e) {} }
    // reverberação extra na cauda do passo dele conforme a sala é maior/mais longe
    L.passoEcoCd -= dt;
    if (jogando && M.ativo && dM > 8 && (est === 'procura' || est === 'investiga' || est === 'patrulha') && L.passoEcoCd <= 0 && L.stepPrevPos && M.pos && L.stepPrevPos.distanceTo(M.pos) > .5) {
      let grande = false; try { const rm = C.roomAt(M.pos.x, M.pos.z); grande = rm && ((rm.x1 - rm.x0) * (rm.z1 - rm.z0) > 60 || (rm.h || 3) > 4.5); } catch (e) {}
      if (grande) { L.passoEcoCd = rand(.8, 1.4); try { const t = now, g = pos3(M.pos, .3, 'ent', .9); C.burst(t + .12, .35, 'lowpass', 500, 1, g); C.env(g, t + .12, .02, .08, .38); } catch (e) {} }
    }
    // a lanterna fraca solta um chiado agudo de capacitor que ele ouve de leve
    L.capacitorCd -= dt;
    if (jogando && S.flashOn && (S.battery ?? 100) < 18 && L.capacitorCd <= 0) {
      L.capacitorCd = rand(2, 4);
      try { const t = now, g = C.saida(null, 0, 'sfx'); const o = A.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(7200, t); o.connect(g); const n = C.burst(t, .25, 'highpass', 6000, 1, g); C.env(g, t, .05, .01, .2); o.start(t); o.stop(t + .3); } catch (e) {}
      if (!teste() && M.ativo && dM < 6) { try { C.emitNoise(P.pos.x, P.pos.z, 1, true); } catch (e) {} }
    }

    L.estPrev = est;
    L.stepPrevPos = P.pos ? P.pos.clone() : null;
  }

  // teclas de movimento (para detectar "quieta")
  function keysMove() { try { const k = window.__jogo && window.__jogo.keys; if (!k) return false; return !!(k.KeyW || k.KeyA || k.KeyS || k.KeyD || k.ArrowUp || k.ArrowDown || k.ArrowLeft || k.ArrowRight); } catch (e) { return false; } }

  // --- Ganchos chamados pelo motor
  // multiplicador de máscara de som: durante o trovão forte os passos somem para o Inspetor
  function mascara() { try { const A = ac(); if (A && A.currentTime < L.trovaoAte) return .15; } catch (e) {} return 1; }
  // impasse na Hora do Silêncio: se ele está na mesma sala quando as badaladas calam o mundo
  function horaDoSilencio() {
    try {
      const A = ac(); if (!A) return; const M = C.M, P = C.P;
      if (M && M.ativo) { let mr = null, pr = null; try { mr = C.roomAt(M.pos.x, M.pos.z); pr = P.room; } catch (e) {} if (mr && mr === pr) { L.impasseAte = A.currentTime + 6; try { M.l5stun = Math.max(M.l5stun || 0, 4); } catch (e) {} leg('l7_impasse'); } }
    } catch (e) {}
  }
  // a Procissão subtrai o som: uma parede de silêncio que rola na sua direção ao se aproximar
  function paredeSilencio() {
    try { const A = ac(); if (!A) return; L.paredeCd = 1; C.abafarMundo(.05, 1.4); leg('l7_paredeSilencio'); } catch (e) {}
  }

  return { tick, mascara, horaDoSilencio, paredeSilencio, trovao };
}
