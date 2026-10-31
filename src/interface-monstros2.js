// INTERFACE — Lote 5 (2ª rodada): leitura do perigo AVANÇADA.
// Segunda leva de ajudas opcionais para LER os monstros sem depender do áudio espacial:
// coração-bússola visual, pulso do prender o ar, anel de fôlego na mira, bússola de brasa do Cap V,
// névoa de fuligem e vapor gelado direcionais, borda de calor/termômetro do estado dele,
// fio de som do estado, setas do som, ícone de estado de leitura, distância pela bengala,
// seta de brisa, pino do último barulho, selo do disfarce na Procissão, bússola por capítulo
// e que mente no clímax, arco na base, novas legendas de comportamento, e três páginas novas
// do caderno de Monstros (apito da Hora do Silêncio, desumanização, mapa de calor da caçada).
// TUDO desligado por padrão, discreto, à prova de erro e sem entregar a posição exata de longe.
// Criado por src/interface.js com os mesmos ganchos de MM. Não muda fluxo de capítulo nem rótulos.
export function criarInterfaceMonstros2(C, U) {
  const $ = s => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const OPT = C.OPT;
  const legenda = (txt, cat) => { try { U.legenda(txt, cat); } catch (e) {} };
  const direcao = pos => { try { return U.direcao(pos); } catch (e) { return { d: 99, a: 0, txt: '' }; } };

  // ---------------------------------------------------------------- OPÇÕES (grupo próprio)
  const PAD5 = {
    coracaoBorda: false, pulsoAr: false, anelFolego: false, brasaBorda: false, nevoaFuligem: false,
    vaporGelado: false, calorEstado: false, termoIntencao: false, droneEstado: false, setaSom: false,
    leituraIco: false, bengalaDist: false, brisaSeta: false, pinoUltimo: false, seloDisfarce: true,
    bussolaCap: false, bussolaMente: false, bussolaArco: false, legComport: false, desumDiario: true, relSilencio: false
  };
  for (const k in PAD5) { if (OPT[k] === undefined) OPT[k] = PAD5[k]; U.PAD[k] = PAD5[k]; }
  const sn = [[false, 'Não'], [true, 'Sim']];
  U.GRUPOS.push(['Leitura do perigo — avançada', [
    { k: 'coracaoBorda', nome: 'Coração-bússola: a borda pulsa no ritmo do coração da Lia (sem som)', tipo: 'sel', ops: sn },
    { k: 'pulsoAr', nome: 'Pulso do prender o ar: a borda marca cada batida no esconderijo', tipo: 'sel', ops: sn },
    { k: 'anelFolego', nome: 'Anel de fôlego ao redor da mira ao prender o ar (ESPAÇO)', tipo: 'sel', ops: sn },
    { k: 'calorEstado', nome: 'Borda de calor do humor dele (azul calmo → vermelho caçando)', tipo: 'sel', ops: sn },
    { k: 'termoIntencao', nome: 'Termômetro de intenção: esquenta quando ele desconfia, esfria quando perde o rastro', tipo: 'sel', ops: sn },
    { k: 'brasaBorda', nome: 'Bússola de brasa: a borda esquenta do lado dele (só no Capítulo V)', tipo: 'sel', ops: sn },
    { k: 'nevoaFuligem', nome: 'Névoa de fuligem apontando de onde ele vem (Capítulos III a V)', tipo: 'sel', ops: sn },
    { k: 'vaporGelado', nome: 'Vapor gelado quando ele está na sala ao lado', tipo: 'sel', ops: sn },
    { k: 'setaSom', nome: 'Seta na borda apontando a respiração dele', tipo: 'sel', ops: sn },
    { k: 'leituraIco', nome: 'Ícone de estado no canto (ouvido / olho riscado / mão / caveira)', tipo: 'sel', ops: sn },
    { k: 'bengalaDist', nome: 'Estimar a distância dele pela bengala (longe / perto / colado)', tipo: 'sel', ops: sn },
    { k: 'brisaSeta', nome: 'Seta de brisa: de que lado sopra o vento (esconde seu cheiro)', tipo: 'sel', ops: sn },
    { k: 'pinoUltimo', nome: 'Pino do último barulho que ele ouviu de você', tipo: 'sel', ops: sn },
    { k: 'bussolaArco', nome: 'Arco na base da tela escurece do lado da ameaça mais próxima', tipo: 'sel', ops: sn },
    { k: 'bussolaCap', nome: 'A bússola muda de leitura por capítulo (água no IV, cova/capela no V)', tipo: 'sel', ops: sn },
    { k: 'bussolaMente', nome: 'No Capítulo V a bússola treme e falha com ele em fúria', tipo: 'sel', ops: sn },
    { k: 'droneEstado', nome: 'Fio de som grave que muda de timbre conforme o humor dele', tipo: 'sel', ops: sn },
    { k: 'legComport', nome: 'Legendas dos novos comportamentos do Inspetor (tateia, decora, encurrala…)', tipo: 'sel', ops: sn },
    { k: 'seloDisfarce', nome: 'Selo do disfarce na Procissão ("disfarçada — mantenha o passo")', tipo: 'sel', ops: sn },
    { k: 'relSilencio', nome: 'Relógio de silêncio: há quanto tempo ninguém te persegue', tipo: 'sel', ops: sn },
    { k: 'desumDiario', nome: 'Mostrar o medidor de desumanização e o mapa de caçada no diário', tipo: 'sel', ops: sn }
  ]]);

  // ---------------------------------------------------------------- refs do HUD (uma vez só)
  const E = {};
  let pronto = false;
  function garantir() {
    if (pronto) return; const base = $('#m-coracao'); if (!base) return; pronto = true;
    for (const [k, q] of [['cor', '#m-coracao'], ['calor', '#m-calor'], ['brasa', '#m-brasa'], ['nevoa', '#m-nevoa'],
      ['vapor', '#m-vapor'], ['folego', '#m-folego'], ['folegoArc', '#m-folego-arc'], ['setasom', '#m-setasom'],
      ['brisa', '#m-brisa'], ['leitura', '#m-leitura'], ['pino', '#m-pino'], ['selo', '#m-selo'], ['bengala', '#m-bengala'], ['arco', '#m-arco'], ['silencio', '#m-silencio']]) E[k] = $(q);
  }

  // ---------------------------------------------------------------- estado quadro a quadro
  let corV = 0, calV = 0, termV = 0, brasaV = 0, nevV = 0, vapV = 0, setaT = 0, legT = 0, pinoT = 0;
  let estAnt = null, caraAnt = 0, furiaDita = false, encurrDito = 0, decorDito = 0, acordouCap = -1, tateiaDito = 0;
  const FOLEGO_C = 157.1; // circunferência do anel (2·π·25)
  const CACA = new Set(['caca', 'bote', 'agarra']);
  const temCaca = M => M && M.ativo && CACA.has(M.state);

  // fio de som grave do estado — AudioContext próprio, minúsculo, só quando ligado e fora do QA
  let AC = null, osc = null, gain = null, filt = null;
  function drone(on, state, d) {
    if (navigator.webdriver) return;
    if (!on) { if (gain) try { gain.gain.value = 0; } catch (e) {} return; }
    try {
      if (!AC) {
        AC = new (window.AudioContext || window.webkitAudioContext)();
        osc = AC.createOscillator(); filt = AC.createBiquadFilter(); gain = AC.createGain();
        osc.type = 'sawtooth'; filt.type = 'lowpass'; filt.frequency.value = 220; gain.gain.value = 0;
        osc.connect(filt); filt.connect(gain); gain.connect(AC.destination); osc.start();
      }
      if (AC.state === 'suspended') AC.resume();
      const caca = state && CACA.has(state), tenso = state === 'investiga' || state === 'alerta' || state === 'procura' || state === 'fareja' || state === 'vasculha';
      osc.frequency.value = caca ? 88 : tenso ? 62 : 44;
      filt.frequency.value = caca ? 900 : tenso ? 420 : 200;
      const vol = clamp(.05 + (caca ? .05 : tenso ? .02 : 0) + Math.max(0, (16 - (d || 16)) / 16) * .04, 0, .14);
      gain.gain.value = vol;
    } catch (e) {}
  }

  function frame(dt, ativo) {
    garantir();
    const S = C.S, P = C.P, M = C.M;
    const jogo = C.mode === 'jogo' && S && !S.dead && !S.fim;
    if (!jogo || C.ui || !ativo) { esconder(); drone(false); return; }
    escondido = false;
    const cap = S.chapter | 0, dif = S.dif;
    const dIns = (M && M.ativo && P.pos) ? M.pos.distanceTo(P.pos) : 999;
    const st = (M && M.ativo) ? M.state : null;
    const drIns = (M && M.ativo && P.pos) ? direcao(M.pos) : null;

    // -------- coração-bússola: borda pulsa no ritmo do coração (acelera com a proximidade)
    let alvoCor = 0;
    if (OPT.coracaoBorda && M && M.ativo && dIns < 11) alvoCor = clamp(1 - dIns / 11, .12, 1);
    corV = lerp(corV, alvoCor, Math.min(1, dt * 6));
    if (E.cor) {
      const bpm = .7 + corV * 1.9 + (P.pulso || 0) / 70;
      const fase = Math.sin(S.tempo * bpm * Math.PI * 2) * .5 + .5;
      const o = corV * (OPT.vFlash ? .34 : .26 + fase * .5);
      E.cor.style.opacity = o.toFixed(3); E.cor.hidden = corV < .02;
    }

    // -------- pulso do prender o ar / anel de fôlego na mira
    if (E.folego) {
      const prendendo = OPT.anelFolego && P.prende && dIns < 7;
      if (prendendo) {
        const frac = clamp((S.ar || 0) / 100, 0, 1);
        E.folegoArc.style.strokeDashoffset = (FOLEGO_C * (1 - frac)).toFixed(1);
        E.folego.classList.toggle('baixo', frac < .25);
        E.folego.style.opacity = '.9'; E.folego.hidden = false;
        if (frac < .22 && !folegoBuzz) { folegoBuzz = true; try { navigator.vibrate && navigator.vibrate(60); } catch (e) {} }
        if (frac >= .3) folegoBuzz = false;
      } else { E.folego.hidden = true; folegoBuzz = false; }
    }
    // pulso do coração no esconderijo (borda) — reaproveita a borda do coração quando prender o ar está ligado
    if (OPT.pulsoAr && E.cor && S.hidden && dIns < 6 && M && M.ativo) {
      const bat = Math.sin(S.tempo * (P.prende ? 1.1 : 2.2) * Math.PI * 2) * .5 + .5;
      const o = (OPT.vFlash ? .3 : .22 + bat * .42) * (P.prende ? .6 : 1);
      E.cor.style.opacity = Math.max(E.cor.style.opacity ? parseFloat(E.cor.style.opacity) : 0, o).toFixed(3); E.cor.hidden = false;
    }

    // -------- borda de calor do humor dele (azul → vermelho), sem direção
    let alvoCal = 0, corCalor = 'rgba(90,120,170,.5)';
    if (OPT.calorEstado && M && M.ativo) {
      alvoCal = temCaca(M) ? 1 : (st === 'procura' || st === 'fareja' || st === 'vasculha') ? .72 : (st === 'investiga' || st === 'alerta') ? .5 : .22;
      const q = temCaca(M) ? [150, 30, 20] : (st === 'procura' || st === 'fareja' || st === 'vasculha') ? [170, 90, 40] : (st === 'investiga' || st === 'alerta') ? [170, 150, 60] : [90, 120, 170];
      corCalor = `rgba(${q[0]},${q[1]},${q[2]},.5)`;
    }
    calV = lerp(calV, alvoCal, Math.min(1, dt * 2.5));
    if (E.calor) { E.calor.style.setProperty('--cc', corCalor); E.calor.style.opacity = (calV * .65).toFixed(3); E.calor.hidden = calV < .03; }

    // -------- termômetro de intenção (laranja ao desconfiar, esfria ao perder) — usa #m-calor só se calorEstado desligado
    if (OPT.termoIntencao && !OPT.calorEstado && E.calor) {
      let alvoT = 0;
      if (M && M.ativo) alvoT = (st === 'investiga' || st === 'alerta' || st === 'procura' || st === 'fareja' || st === 'vasculha') ? .7 : temCaca(M) ? 1 : .08;
      termV = lerp(termV, alvoT, Math.min(1, dt * 2));
      E.calor.style.setProperty('--cc', `rgba(190,100,30,.5)`); E.calor.style.opacity = (termV * .55).toFixed(3); E.calor.hidden = termV < .03;
    }

    // -------- bússola de brasa (Cap V): borda quente do lado dele
    let alvoBr = 0;
    if (OPT.brasaBorda && cap === 5 && M && M.ativo && drIns && dIns < 16) {
      alvoBr = clamp(1 - dIns / 16, .15, 1);
      const r = drIns.a * Math.PI / 180;
      E.brasa.style.setProperty('--bx', (50 - Math.sin(r) * 55) + '%');
      E.brasa.style.setProperty('--by', (50 + Math.cos(r) * 55) + '%');
    }
    brasaV = lerp(brasaV, alvoBr, Math.min(1, dt * 3));
    if (E.brasa) { E.brasa.style.opacity = (brasaV * .8).toFixed(3); E.brasa.classList.toggle('vivo', alvoBr > 0); E.brasa.hidden = brasaV < .02; }

    // -------- névoa de fuligem direcional (Cap III–V)
    let alvoNv = 0;
    if (OPT.nevoaFuligem && cap >= 2 && M && M.ativo && drIns && dIns < 18) {
      alvoNv = clamp(1 - dIns / 18, .12, .9);
      const r = drIns.a * Math.PI / 180;
      E.nevoa.style.setProperty('--nx', (50 - Math.sin(r) * 58) + '%');
      E.nevoa.style.setProperty('--ny', (50 + Math.cos(r) * 58) + '%');
    }
    nevV = lerp(nevV, alvoNv, Math.min(1, dt * 2.5));
    if (E.nevoa) { E.nevoa.style.opacity = (nevV * .85).toFixed(3); E.nevoa.hidden = nevV < .02; }

    // -------- vapor gelado quando ele está na sala ao lado (sem caçar)
    let alvoVp = 0;
    if (OPT.vaporGelado && M && M.ativo && !temCaca(M) && P.pos) {
      try { const rm = C.roomAt(M.pos.x, M.pos.z), rp = P.room; if (rm && rp && rm !== rp && C.salaAdj(rm, rp)) alvoVp = clamp(1 - dIns / 12, .2, .6); } catch (e) {}
    }
    vapV = lerp(vapV, alvoVp, Math.min(1, dt * 2));
    if (E.vapor) { E.vapor.style.setProperty('--vo', (vapV * .34).toFixed(3)); E.vapor.style.opacity = (vapV * .34).toFixed(3); E.vapor.classList.toggle('vivo', alvoVp > 0); E.vapor.hidden = vapV < .02; }

    // -------- seta na borda apontando a respiração dele
    setaT -= dt;
    if (E.setasom) {
      if (OPT.setaSom && M && M.ativo && drIns && dIns < 20 && !S.hidden) {
        E.setasom.style.transform = `rotate(${drIns.a}deg)`;
        E.setasom.style.opacity = clamp(1.1 - dIns / 20, .3, 1).toFixed(2); E.setasom.hidden = false;
      } else E.setasom.hidden = true;
    }

    // -------- ícone de estado de leitura (ouvido / olho riscado / mão / caveira)
    if (E.leitura) {
      if (OPT.leituraIco && M && M.ativo) {
        const ico = temCaca(M) ? ['☠', '#c0392b'] : (st === 'fareja' || st === 'vasculha') ? ['✋', '#c98a2b']
          : (st === 'procura') ? ['⊘', '#c9a75a'] : (st === 'investiga' || st === 'alerta') ? ['☊', '#c9c05a'] : ['◡', '#5d7a3a'];
        const b = E.leitura.querySelector('b'); b.textContent = ico[0]; E.leitura.style.setProperty('--lc', ico[1]); E.leitura.hidden = false;
      } else E.leitura.hidden = true;
    }

    // -------- distância pela bengala (para quem joga sem áudio espacial)
    if (E.bengala) {
      if (OPT.bengalaDist && M && M.ativo && dIns < 22) {
        E.bengala.textContent = '🦯 ' + (dIns < 2.4 ? 'colado' : dIns < 6 ? 'perto' : dIns < 12 ? 'na volta' : 'longe'); E.bengala.hidden = false;
      } else E.bengala.hidden = true;
    }

    // -------- seta de brisa (direção do vento, onde há corrente de ar)
    if (E.brisa) {
      let vento = null;
      try { vento = (P.room && P.room.vento) || (C.ventoSala && C.ventoSala(P.room)) || (S.flags && S.flags.vento); } catch (e) {}
      if (OPT.brisaSeta && vento && (vento.a !== undefined || typeof vento === 'number')) {
        const a = typeof vento === 'number' ? vento : vento.a;
        E.brisa.querySelector('span').style.transform = `rotate(${a}deg)`; E.brisa.hidden = false;
      } else E.brisa.hidden = true;
    }

    // -------- pino do último barulho que ele ouviu de você
    pinoT -= dt;
    if (E.pino) {
      if (OPT.pinoUltimo && M && M.ativo && M.ultimo && P.pos) {
        const dr = direcao(M.ultimo); E.pino.querySelector('i').textContent = dr.txt || 'por perto'; E.pino.hidden = false;
      } else E.pino.hidden = true;
    }

    // -------- selo do disfarce na fila da Procissão
    if (E.selo) {
      const disf = !!(S.flags && (S.flags.disfarcada || S.flags.naFila || (C.PROC && C.PROC.disfarce)));
      if (OPT.seloDisfarce && disf) {
        const foraRitmo = !!(P.sprinting || P.noiseR >= 6 || (S.flags && S.flags.foraPasso));
        E.selo.textContent = foraRitmo ? 'disfarçada — você quebrou o passo!' : 'disfarçada — mantenha o passo';
        E.selo.classList.toggle('fora', foraRitmo); E.selo.hidden = false;
      } else E.selo.hidden = true;
    }

    // fio de som do estado
    drone(OPT.droneEstado && M && M.ativo, st, dIns);

    // -------- novas legendas de comportamento (atmosféricas, para acessibilidade)
    legT -= dt;
    if (OPT.legComport && OPT.legSom !== 'nao' && M && M.ativo) {
      // mudança de estado por SUA causa
      if (st && estAnt && st !== estAnt) {
        if ((st === 'investiga' || st === 'caca') && (estAnt === 'patrulha') && (P.naAgua ? false : P.noiseR > 0) && (M.farejou || M.state === 'fareja' || (M.ultimo && dIns < 10))) {
          const dr = drIns && drIns.txt ? drIns.txt.split(',')[0] : ''; legenda(dr ? `[ele seguiu seu rastro quente — ${dr}]` : '[ele seguiu seu rastro quente]', 'dele');
        }
        if ((st === 'fareja' || st === 'vasculha') && estAnt !== 'fareja' && estAnt !== 'vasculha' && legT <= 0) { legT = 3; legenda('[faro ativo — ele está tateando]', 'dele'); }
        if (st === 'procura' && estAnt === 'caca') legenda('[ele desistiu... ou não]', 'dele');
        if ((st === 'investiga' || st === 'alerta') && estAnt === 'patrulha') legenda('[ele sonda a sala]', 'dele');
      }
      // cabeça travou em você (bote iminente)
      if (st === 'bote' && estAnt !== 'bote') legenda('[a cabeça dele travou em você]', 'dele');
      // vai arrombar a porta
      if (temCaca(M) && caraAnt <= 0 && dIns < 3 && S.hidden) { caraAnt = 4; legenda('[ele vai arrombar]', 'dele'); }
      caraAnt -= dt;
      // decorou este armário / seu caminho (memória do Inspetor)
      if ((M.memoria || (S.flags && S.flags.esconderijoVisto)) && decorDito <= 0 && S.hidden && temCaca(M) && dIns < 5) { decorDito = 20; legenda('[ele decorou este armário]', 'dele'); }
      if (M.preveRota && decorDito <= 0) { decorDito = 20; legenda('[ele decorou o seu caminho]', 'dele'); }
      decorDito -= dt;
      // pastoreio: ele corta sua rota para te empurrar
      if ((M.pastoreio || M.encurrala) && encurrDito <= 0 && temCaca(M)) { encurrDito = 8; legenda('[ele está te encurralando]', 'dele'); }
      encurrDito -= dt;
      // acordou (novo capítulo em que ele fica mais agressivo) e fúria no talo (Cap V)
      if (M.ativo && acordouCap !== cap && M.ativo) { if (acordouCap !== -1 && cap >= 1) legenda('[ele acordou]', 'dele'); acordouCap = cap; }
      if (cap === 5 && (M.furia || temCaca(M)) && !furiaDita && dIns < 8) { furiaDita = true; legenda('[fúria no talo]', 'dele'); }
      if (!(cap === 5)) furiaDita = false;
      // mais transições reais do Inspetor
      if (st !== estAnt) {
        if (st === 'procura' && estAnt === 'investiga') legenda('[ele está te procurando]', 'dele');
        if (st === 'patrulha' && estAnt === 'procura') legenda('[ele voltou a rondar]', 'dele');
        if (st === 'alerta' && estAnt !== 'alerta') legenda('[ele parou para escutar]', 'dele');
        if (st === 'agarra' && estAnt !== 'agarra') legenda('[ele te alcançou!]', 'dele');
        if (st === 'vasculha' && estAnt !== 'vasculha') legenda('[ele está revistando o esconderijo]', 'dele');
      }
      // pausa de memória (reza) do Inspetor, quando o motor expõe
      const rezando = st === 'reza' || M.reza || M.rezando;
      if (rezando && !rezAnt) legenda('[ele parou... está rezando]', 'dele');
      rezAnt = !!rezando;
      // ele imita o seu último barulho numa sala errada (quando o motor marca)
      if ((M.imitando || (S.flags && S.flags.imitou)) && imitaCd <= 0) { imitaCd = 10; legenda('[aquele som não é você — ele imitou]', 'dele'); }
      imitaCd -= dt;
    }
    // legendas das outras entidades (também gated por legComport)
    if (OPT.legComport && OPT.legSom !== 'nao') { legendasEntidades(S, P); cuesSeus(S, P, M, dIns, dt); }
    estAnt = st;

    // relógio de silêncio e contador de "ele te ouviu"
    const algum = !!((M && M.ativo) || (C.ANA && C.ANA.ativa) || (C.PROC && C.PROC.fase) || (C.chamado && C.chamado()));
    if (algum) silencio = 0; else silencio += dt;
    if (st && estAnt2 && st !== estAnt2 && (st === 'investiga' || st === 'caca') && (estAnt2 === 'patrulha' || estAnt2 === 'procura') && P.noiseR > 0) {
      try { S.flags.ouviuN = (S.flags.ouviuN || 0) + 1; } catch (e) {}
    }
    estAnt2 = st;
    // silêncio longo demais: um presságio, uma única vez por trecho (só depois do prólogo)
    if (OPT.legComport && OPT.legSom !== 'nao' && (S.chapter | 0) >= 1 && silencio > 28 && !quietoDito) { quietoDito = true; legenda('[a noite está quieta demais]', 'dele'); }
    if (silencio < 2) quietoDito = false;
    // relógio de silêncio (HUD): só aparece depois que um perigo passou
    if (E.silencio) {
      if (OPT.relSilencio && silencio > 3 && silencio < 999 && jaTevePerigo) { E.silencio.textContent = 'silêncio há ' + Math.floor(silencio) + 's'; E.silencio.hidden = false; }
      else E.silencio.hidden = true;
      if (algum) jaTevePerigo = true;
    }

    // -------- arco na base da tela: escurece do lado da ameaça mais próxima
    let alvoArc = 0, arcX = 50;
    if (OPT.bussolaArco && P.pos) {
      let fonte = null, melhor = 15;
      for (const f of [M && M.ativo ? M.pos : null, C.PROC && C.PROC.fase === 'passando' ? C.PROC.pos : null, C.ANA && C.ANA.ativa ? C.ANA.pos : null]) {
        if (!f) continue; const d = f.distanceTo(P.pos); if (d < melhor) { melhor = d; fonte = f; }
      }
      if (fonte) { alvoArc = clamp(1 - melhor / 15, .12, 1); const r = direcao(fonte).a * Math.PI / 180; arcX = 50 - Math.sin(r) * 55; }
    }
    arcV = lerp(arcV, alvoArc, Math.min(1, dt * 3));
    if (E.arco) { E.arco.style.setProperty('--ax', arcX + '%'); E.arco.style.opacity = (arcV * .8).toFixed(3); E.arco.hidden = arcV < .02; }

    // bússola por capítulo / que mente — ajustes aplicados à bússola do MM via classe no HUD
    aplicarBussolaCap(cap, M);
  }
  let arcV = 0, rezAnt = false, imitaCd = 0, silencio = 0, estAnt2 = null, quietoDito = false, jaTevePerigo = false;
  let anaAnt = false, contaAnt2 = 0, tetoAnt2 = false, procAnt2 = null, chamAnt2 = false;
  let prendeAnt = false, semArAnt = false, aguaAnt = false, coracaoCd = 0, escondeT = 0, corridaDitaCd = 0;

  // sinais SEUS (o que você está entregando), categoria 'eu' — para quem joga sem som
  function cuesSeus(S, P, M, dIns, dt) {
    const mAtivo = M && M.ativo;
    if (P.prende && !prendeAnt) legenda('[você prendeu o ar]', 'eu');
    prendeAnt = !!P.prende;
    if (P.semAr && !semArAnt) legenda('[seu fôlego se esgotou — ele ouviu]', 'eu');
    if (!P.semAr && semArAnt) legenda('[você recuperou o fôlego]', 'eu');
    semArAnt = !!P.semAr;
    coracaoCd -= dt;
    if (mAtivo && !P.prende && (P.pulso || 0) > 75 && dIns < 7 && coracaoCd <= 0) { coracaoCd = 8; legenda('[seu coração está disparado]', 'eu'); }
    if (P.naAgua && !aguaAnt && mAtivo && dIns < 14) legenda('[na água o seu rastro de cheiro some]', 'eu');
    if (!P.naAgua && aguaAnt && mAtivo && dIns < 14) legenda('[você saiu da água — o rastro voltou]', 'eu');
    aguaAnt = !!P.naAgua;
    corridaDitaCd -= dt;
    if (mAtivo && P.sprinting && (P.noiseR || 0) >= 18 && corridaDitaCd <= 0) { corridaDitaCd = 6; legenda('[você correu — isso ecoa longe]', 'eu'); }
    if (S.hidden) { escondeT += dt; if (escondeT > 42 && !escondeDito) { escondeDito = true; legenda('[você está escondida há tempo demais]', 'eu'); } }
    else { escondeT = 0; escondeDito = false; }
  }
  let escondeDito = false;

  // legendas reais das outras entidades (Menina, Procissão, Chamado), à prova de erro
  function legendasEntidades(S, P) {
    const ANA = C.ANA, PROC = C.PROC;
    const anaOn = !!(ANA && ANA.ativa), conta = anaOn ? (ANA.conta || 0) : 0, teto = !!(anaOn && ANA.teto);
    if (anaOn && !anaAnt) legenda('[a Menina Que Conta acordou]', 'dele');
    if (!anaOn && anaAnt) legenda('[a Menina sumiu]', 'dele');
    if (conta >= 5 && contaAnt2 < 5) legenda('[ela chegou à metade da conta]', 'dele');
    if (conta >= 7 && contaAnt2 < 7) legenda('[faltam três para ela aparecer]', 'dele');
    if (anaOn && ANA.pos && P.pos) { const d = ANA.pos.distanceTo(P.pos); if (d < 3 && !tetoAnt2) legenda('[ela está logo atrás]', 'dele'); }
    anaAnt = anaOn; contaAnt2 = conta; tetoAnt2 = teto;
    const pf = PROC ? PROC.fase : null;
    if (pf === 'passando' && procAnt2 !== 'passando') legenda('[a fila está passando — não se mexa]', 'dele');
    if (!pf && procAnt2) legenda('[a fila passou — respire]', 'dele');
    procAnt2 = pf;
    const chamOn = !!(C.chamado && C.chamado());
    if (chamOn && !chamAnt2) legenda('[alguém chama o seu nome — é isca]', 'dele');
    if (!chamOn && chamAnt2) legenda('[o chamado parou]', 'dele');
    chamAnt2 = chamOn;
  }

  let folegoBuzz = false;

  // ajusta a leitura da bússola existente por capítulo e degrada no clímax (atua sobre #m-bussola do MM)
  function aplicarBussolaCap(cap, M) {
    const box = $('#m-bussola'); if (!box) return;
    // leitura por capítulo: tinge a bússola (azul na água do IV, brasa no V)
    box.classList.toggle('l5-cap4', OPT.bussolaCap && cap === 4);
    box.classList.toggle('l5-cap5', OPT.bussolaCap && cap === 5);
    // mente no Cap V: faz as setas tremerem via classe (o CSS do MM anima .caca; aqui só adicionamos jitter de opacidade)
    const mente = OPT.bussolaMente && cap === 5 && M && M.ativo && (M.furia || temCaca(M));
    if (mente !== box.classList.contains('l5-mente')) box.classList.toggle('l5-mente', mente);
    if (mente) { const j = (Math.sin(performance.now() / 70) * .5 + .5); box.style.opacity = (.55 + j * .45).toFixed(2); }
    else if (box.style.opacity && box.style.opacity !== '1') box.style.opacity = '1';
  }

  // ---------------------------------------------------------------- esconder
  let escondido = false;
  function esconder() {
    if (escondido) return; escondido = true; // só ao entrar em não-jogo
    for (const k of ['cor', 'calor', 'brasa', 'nevoa', 'vapor', 'folego', 'setasom', 'brisa', 'leitura', 'pino', 'selo', 'bengala', 'arco', 'silencio']) if (E[k]) E[k].hidden = true;
  }

  // ---------------------------------------------------------------- DIÁRIO — páginas novas
  // decodificador do apito da Hora do Silêncio (preenche conforme você sobrevive a cada toque)
  const APITO = [
    { id: 'curto', sinal: '•', diz: '1 apito curto: PARE onde está.' },
    { id: 'duplo', sinal: '• •', diz: '2 apitos: NÃO respire — ele está contando.' },
    { id: 'longo', sinal: '——', diz: '1 apito longo: todos para a cama; quem anda, ele pega.' },
    { id: 'triplo', sinal: '• • •', diz: '3 apitos: chamada — fique parada até ele terminar.' }
  ];
  const DESUM = ['Funcionário', 'Guarda', 'Vigia', 'Carcereiro', 'Fera', 'Fera'];
  function render(el) {
    // acrescenta ao fim do que o MM já desenhou, sem apagar
    const S = C.S; if (!el) return;
    const ap = (S && S.flags && S.flags.apito) || {};
    let h = '<hr style="border:none;border-top:1px solid rgba(201,167,90,.18);margin:16px 0">';
    h += '<h4 style="color:#c9a75a;margin-bottom:4px">A Hora do Silêncio — o apito</h4>';
    h += '<p style="color:var(--fraco);font-size:13px;margin-bottom:6px">Decodifica-se sozinho conforme você sobrevive a cada toque. Nunca entregue antes de você viver.</p>';
    h += '<div class="apito">';
    for (const a of APITO) h += `<b>${a.sinal}</b><span>${ap[a.id] ? a.diz : '— ainda não ouvido'}</span>`;
    h += '</div>';
    if (OPT.desumDiario) {
      const cap = S ? (S.chapter | 0) : 0;
      h += '<h4 style="color:#c9a75a;margin:14px 0 2px">O Inspetor: homem → fera</h4>';
      h += '<div class="desum">';
      for (let i = 0; i < 5; i++) h += `<i class="${i <= cap ? 'on' : ''}" title="${DESUM[i]}"></i>`;
      h += `</div><p style="color:#d9a092;font-size:13px;margin:2px 0 0">Esta noite ele já é: <b>${DESUM[Math.min(5, cap)]}</b>.</p>`;
      // mapa de calor da caçada: salas onde ele mais caçou nesta noite
      const hc = (S && S.flags && S.flags.cacaHeat) || {};
      const salas = Object.keys(hc).sort((a, b) => hc[b] - hc[a]).slice(0, 6);
      if (salas.length) {
        const max = Math.max.apply(null, salas.map(s => hc[s]));
        h += '<h4 style="color:#c9a75a;margin:14px 0 2px">Onde ele mais caçou</h4><div class="caca-mapa">';
        for (const s of salas) { const q = clamp(hc[s] / max, .2, 1); h += `<span style="border-color:rgba(156,44,34,${(q * .7).toFixed(2)});color:rgba(230,160,146,${(.5 + q * .5).toFixed(2)})">${s}</span>`; }
        h += '</div>';
      }
    }
    const ouviu = (S && S.flags && S.flags.ouviuN) || 0;
    if (ouviu > 0) h += `<p style="color:#d9a092;font-size:13px;margin:12px 0 0">Esta noite ele te ouviu <b>${ouviu}</b> ${ouviu === 1 ? 'vez' : 'vezes'}. Cada passo em falso ensina o ouvido dele.</p>`;
    // glossário das ajudas de leitura (só lembra o que cada pista quer dizer)
    h += '<h4 style="color:#c9a75a;margin:14px 0 2px">Como ler o perigo</h4>';
    h += '<p style="color:var(--fraco);font-size:13px;margin:0">Borda azul: ele está calmo. Borda laranja: desconfiou. Borda vermelha: está caçando. Névoa/brasa na borda: o lado de onde ele vem. Ícone de caveira: ele travou em você. Tudo isso se liga em Opções → Leitura do perigo.</p>';
    const extra = document.createElement('div'); extra.innerHTML = h; el.appendChild(extra);
  }

  // registra no diário: toques do apito e mapa de calor da caçada (passivo, à prova de erro)
  function aprenderPassivo() {
    const S = C.S, M = C.M; if (!S || !S.flags) return;
    S.flags.apito = S.flags.apito || {}; S.flags.cacaHeat = S.flags.cacaHeat || {};
    // apito: lê os sinais da Hora do Silêncio se o motor os expõe
    const sin = S.flags.apitoSinal;
    if (sin && APITO.find(a => a.id === sin)) S.flags.apito[sin] = 1;
    // mapa de calor: conta o tempo que ele passa caçando em cada sala
    if (M && M.ativo && temCaca(M)) {
      try { const r = C.roomAt(M.pos.x, M.pos.z); if (r) { const nome = r.nome || r.id; if (nome) S.flags.cacaHeat[nome] = (S.flags.cacaHeat[nome] || 0) + 1; } } catch (e) {}
    }
  }
  // roda o aprendizado passivo mesmo fora do frame principal (chamado pelo loop)
  const frameOrig = frame;
  function frameWrap(dt, ativo) { try { aprenderPassivo(); } catch (e) {} frameOrig(dt, ativo); }

  return { frame: frameWrap, render, pausa() {}, morte() {}, aplicar() {} };
}
