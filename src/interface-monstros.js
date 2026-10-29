// INTERFACE — Lote 5: leitura do perigo (os monstros).
// Bússola de ameaças por forma e cor, pulso de proximidade, vinheta de presença, borda de faro,
// postura do Inspetor, arco da audição dele, legendas que separam o seu barulho do dele,
// e o bestiário vivo do diário que se preenche conforme você SOBREVIVE a cada comportamento.
// Criado por src/interface.js com os mesmos ganchos de PL/SG. Tudo opcional e discreto;
// as ajudas de acessibilidade ficam desligadas por padrão e nunca entregam a posição exata de longe.
export function criarInterfaceMonstros(C, U) {
  const $ = s => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const OPT = C.OPT, R = C.R;
  const legenda = (txt, cat) => { try { U.legenda(txt, cat); } catch (e) {} };

  // ---------------------------------------------------------------- OPÇÕES (grupo próprio)
  const PAD5 = { bussola: 'nao', bussolaIco: true, bussolaUm: false, pulsoProx: false, vinheta: false, faroBorda: true, posturaUI: false, arcoOuvido: false, legDist: false, legEu: true, ruidoHonesto: false };
  for (const k in PAD5) { if (OPT[k] === undefined) OPT[k] = PAD5[k]; U.PAD[k] = PAD5[k]; }
  U.GRUPOS.push(['Leitura do perigo', [
    { k: 'bussola', nome: 'Bússola de ameaças (setas na borda apontando cada monstro)', tipo: 'sel', ops: [['nao', 'Desligada'], ['facil', 'Só no Fácil'], ['sim', 'Sempre']] },
    { k: 'bussolaIco', nome: 'Forma além da cor na bússola (◆ Inspetor, 9 Ana, † Procissão, ♪ Chamado)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'bussolaUm', nome: 'Bússola mostra só a ameaça mais próxima (menos poluição)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'pulsoProx', nome: 'Pulso vermelho quando ele está bem atrás de você', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'vinheta', nome: 'Vinheta de presença (a borda escurece do lado dele)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'faroBorda', nome: 'Borda de faro quando ele segue o seu rastro', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'posturaUI', nome: 'Postura do Inspetor no canto (calmo / ouvindo / procurando / caçando)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'arcoOuvido', nome: 'Arco da audição dele ao redor da mira', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'legDist', nome: 'Legenda da distância dos passos dele (para quem joga sem som)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'legEu', nome: 'Separar o seu barulho do barulho dele nas legendas', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'ruidoHonesto', nome: 'Anel do seu barulho encolhe atrás de porta/parede (o que chega nele)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] }
  ]]);

  // ---------------------------------------------------------------- DADOS DAS ENTIDADES
  const CORES = { insp: '#c0392b', ana: '#c77d9a', proc: '#c9a75a', cham: '#6c8ba0' };
  const ICOS = { insp: '◆', ana: '9', proc: '†', cham: '♪' };
  const NOMES = { insp: 'O Inspetor', ana: 'A Menina Que Conta', proc: 'A Procissão', cham: 'O Chamado' };

  // Bestiário vivo: tudo o que cada entidade pode fazer, com o contra-jogo. Preenche ao SOBREVIVER, nunca por coleta.
  const BEST = {
    insp: [
      { id: 'ouve', tell: 'Caça pelo som: passos, portas, garrafas.', cj: 'Agache (C) e ande devagar (ALT). Correr o chama.' },
      { id: 'estala', tell: 'Estala a língua para se localizar no escuro.', cj: 'Ouça os estalos: dá para saber de que lado ele está.' },
      { id: 'investiga', tell: 'Vai conferir qualquer barulho que ouve.', cj: 'Uma garrafa (G) o manda para o lado errado.' },
      { id: 'caca', tell: 'Quando te acha, caça sem parar por um tempo.', cj: 'Um armário ou embaixo da cama cortam a caçada.' },
      { id: 'fareja', tell: 'Fuça os esconderijos quando desconfia.', cj: 'Prenda a respiração (ESPAÇO) e reze para ele passar.' },
      { id: 'desiste', tell: 'Se cansa e volta a rondar se você some.', cj: 'Fique quieta e espere os estalos ficarem fracos.' }
    ],
    ana: [
      { id: 'conta', tell: 'Conta até dez e, no fim, aparece atrás de você.', cj: 'Antes do dez, quebre a linha de visão ou a luz.' },
      { id: 'escuro', tell: 'Só anda quando não está olhando para ela com luz.', cj: 'Mantenha a lanterna nela — mas a pilha acaba.' },
      { id: 'porta', tell: 'Não abre portas fechadas.', cj: 'Feche uma porta entre vocês e ganhe fôlego.' },
      { id: 'teto', tell: 'Às vezes espera no teto e se deixa cair.', cj: 'Numa sala escura, olhe para cima antes de dar as costas.' }
    ],
    proc: [
      { id: 'aviso', tell: 'As luzes piscam e o rádio chia antes de passar.', cj: 'Esse é o aviso: procure um esconderijo já.' },
      { id: 'passa', tell: 'Atravessa as salas em fila; tocar nela mata.', cj: 'Dentro de um armário ou cama você fica invisível a ela.' }
    ],
    cham: [
      { id: 'chama', tell: 'Chama o seu nome de uma sala vizinha.', cj: 'Não vá até lá: é isca e atrai o Inspetor.' }
    ]
  };
  function best() { const S = C.S; if (!S) return {}; S.flags.best = S.flags.best || {}; return S.flags.best; }
  const TELL = {};
  for (const ent in BEST) for (const x of BEST[ent]) TELL[ent + ':' + x.id] = x.tell;
  let avisoT = 0;
  function aprender(ent, id, calado) {
    const b = best(); if (!b[ent]) b[ent] = {}; if (b[ent][id]) return;
    b[ent][id] = Math.round((C.S.tempo || 0));
    // avisa de leve que algo novo entrou no caderno — mas nunca durante o perigo, e com folga entre avisos
    if (calado) return;
    const M = C.M, perigo = (M && M.ativo && ['caca', 'bote', 'agarra', 'alerta'].includes(M.state)) || (C.PROC && C.PROC.fase);
    if (perigo || avisoT > 0) return; avisoT = 18;
    try { C.toast('Caderno (aba Monstros): ' + (TELL[ent + ':' + id] || 'um comportamento novo')); } catch (e) {}
  }

  // ---------------------------------------------------------------- BÚSSOLA / ENTIDADES ATIVAS
  const slots = {};
  // refs do HUD guardadas uma vez só (evita document.querySelector a cada quadro — o QA roda em render por software)
  const E = {};
  function garantirSlots() {
    const box = $('#m-bussola'); if (!box || box.dataset.pronto) return;
    for (const id of ['insp', 'ana', 'proc', 'cham']) {
      const seta = document.createElement('div'); seta.className = 'seta'; seta.style.setProperty('--c', CORES[id]); seta.hidden = true;
      const ico = document.createElement('div'); ico.className = 'ico'; ico.style.setProperty('--c', CORES[id]); ico.textContent = ICOS[id]; ico.hidden = true;
      box.appendChild(seta); box.appendChild(ico); slots[id] = { seta, ico };
    }
    box.dataset.pronto = '1';
    E.box = box;
    for (const [k, q] of [['contador', '#m-contador'], ['pulso', '#m-pulso'], ['faro', '#m-faro'], ['narina', '#m-narina'], ['vinheta', '#m-vinheta'], ['postura', '#m-postura'], ['ouvido', '#m-ouvido'], ['olho', '#olho-ana']]) E[k] = $(q);
  }
  function centroSala(sala) { return sala ? { x: (sala.x0 + sala.x1) / 2, z: (sala.z0 + sala.z1) / 2 } : null; }
  function ativas() {
    const out = [], M = C.M, ANA = C.ANA, PROC = C.PROC;
    if (M && M.ativo) out.push({ id: 'insp', pos: M.pos, caca: M.state === 'caca' || M.state === 'bote' || M.state === 'agarra' });
    if (ANA && ANA.ativa) out.push({ id: 'ana', pos: ANA.pos, caca: ANA.conta >= 8 });
    if (PROC && PROC.fase === 'passando' && PROC.pos) out.push({ id: 'proc', pos: PROC.pos, caca: true });
    const ch = C.chamado && C.chamado(); if (ch && ch.sala) { const c = centroSala(ch.sala); if (c) out.push({ id: 'cham', pos: c, caca: false }); }
    return out;
  }
  // coloca o ícone num ponto da borda, sem girar o símbolo (legível de cabeça para cima)
  function porIco(ico, a, op) {
    const r = a * Math.PI / 180, x = Math.sin(r), y = -Math.cos(r);
    ico.style.left = (50 + 43 * x) + '%'; ico.style.top = (50 + 43 * y) + '%'; ico.style.setProperty('--o', op.toFixed(2)); ico.hidden = false;
  }
  function direita(pos) { try { return U.direcao(pos); } catch (e) { return { d: 99, a: 0, txt: '' }; } }

  // ---------------------------------------------------------------- QUADRO A QUADRO
  let pulso = 0, faroV = 0, vinhV = 0, ouvidoV = 0, legEuT = 0, legDistT = 0, duetoVisto = false, estAnt = null;
  let contaAnt = 0, procAnt = null, atrasT = 0, tetoAnt = false, ameacaAnt = false;
  const temCaca = M => M && M.ativo && ['caca', 'bote', 'agarra'].includes(M.state);
  // o quanto do seu som chega de fato a ele: porta/parede e distância atenuam (modelo honesto, igual ao do motor)
  function chegaAoInsp() {
    const S = C.S, P = C.P, M = C.M; if (!S || !M || !M.ativo || !P.pos) return 0;
    const d = M.pos.distanceTo(P.pos); if (d > 22) return 0;
    let att = 1; try { const rm = C.roomAt(M.pos.x, M.pos.z), rp = P.room; if (rm && rp && rm !== rp) att = C.salaAdj(rm, rp) ? .55 : .2; } catch (e) {}
    const ruido = Math.max(P.noiseR, S.hidden && !C.keys.Space && d < 5.5 ? 1.6 : 0);
    return clamp((ruido * att) / Math.max(1.5, d * .5), 0, 1);
  }

  function frame(dt, ativo) {
    garantirSlots();
    if (avisoT > 0) avisoT -= dt;
    const S = C.S, P = C.P, M = C.M;
    const jogo = C.mode === 'jogo' && S && !S.dead && !S.fim;
    if (!jogo || C.ui || !ativo) { esconderTudo(); if (jogo && S) aprenderPassivo(); return; }
    escondido = false;

    aprenderPassivo();

    // as entidades ativas e suas direções, calculadas UMA vez por quadro e reaproveitadas abaixo
    const vivas = ativas();
    for (const v of vivas) { const dr = direita(v.pos); v.d = dr.d; v.a = dr.a; }
    const insp = vivas.find(v => v.id === 'insp');

    // -------- bússola de ameaças
    const bOn = OPT.bussola === 'sim' || (OPT.bussola === 'facil' && S.dif === 'facil');
    if (E.box) E.box.hidden = !bOn;
    const mostradas = !bOn ? [] : (OPT.bussolaUm && vivas.length) ? [vivas.slice().sort((a, b) => a.d - b.d)[0]] : vivas;
    for (const id of ['insp', 'ana', 'proc', 'cham']) {
      const s = slots[id]; if (!s) continue;
      const e = mostradas.find(v => v.id === id);
      if (!e) { s.seta.hidden = true; s.ico.hidden = true; continue; }
      let op = clamp(1.25 - e.d / 24, .22, 1); if (e.caca) op = Math.max(op, .6);
      s.seta.style.transform = `rotate(${e.a}deg)`; s.seta.style.setProperty('--o', op.toFixed(2));
      s.seta.classList.toggle('caca', !!e.caca); s.seta.classList.toggle('atras', Math.abs(e.a) > 140); s.seta.hidden = false;
      if (OPT.bussolaIco) porIco(s.ico, e.a, op); else s.ico.hidden = true;
    }
    // contador de ameaças quando há mais de uma ativa (mesmo sem a bússola)
    if (E.contador) { const n = vivas.length; if (n >= 2) { E.contador.textContent = '⚠ ' + n + ' ameaças'; E.contador.hidden = false; } else E.contador.hidden = true; }

    // -------- olho da Menina pisca em vermelho quando ela está contando
    if (E.olho) E.olho.classList.toggle('ana-conta', !!(C.ANA && C.ANA.ativa && C.ANA.conta >= 1));

    // -------- pulso de proximidade (ele bem atrás, fora do seu campo de visão), no ritmo do coração
    let alvoP = 0;
    if (OPT.pulsoProx && insp) { if (insp.d < 4.2 && Math.abs(insp.a) > 95) alvoP = clamp(1 - insp.d / 4.2, .15, 1); }
    const bpm = alvoP > 0 ? .5 + alvoP * .9 : 0, fase = bpm ? (Math.sin(S.tempo * bpm * Math.PI * 2) * .5 + .5) : 0;
    pulso = lerp(pulso, alvoP, Math.min(1, dt * 8));
    if (E.pulso) { const o = pulso * (OPT.vFlash ? .5 : .35 + fase * .55); E.pulso.style.opacity = o.toFixed(3); E.pulso.hidden = pulso < .02; }

    // -------- borda de faro (ele seguindo o rastro / fuçando)
    const farejando = OPT.faroBorda && M && M.ativo && (M.state === 'fareja' || M.state === 'vasculha');
    faroV = lerp(faroV, farejando ? 1 : 0, Math.min(1, dt * 3));
    if (E.faro) { E.faro.classList.toggle('ativo', farejando); if (!farejando) E.faro.style.opacity = (faroV * .5).toFixed(3); E.faro.hidden = faroV < .02 && !farejando; }
    if (E.narina) {
      const rastro = OPT.faroBorda && P.noiseR > 0 && !S.hidden && M && M.ativo;
      E.narina.hidden = !rastro; if (rastro) E.narina.textContent = P.naAgua ? '▿ rastro sumindo na água' : '▿ rastro';
    }

    // -------- vinheta direcional de presença (desligada no Pesadelo)
    let alvoV = 0;
    if (OPT.vinheta && S.dif !== 'pesadelo' && P.pos) {
      let fonte = null, melhor = 7;
      if (M && M.ativo) { const d = M.pos.distanceTo(P.pos); if (d < melhor) { melhor = d; fonte = M.pos; } }
      if (C.PROC && C.PROC.fase === 'passando' && C.PROC.pos) { const d = C.PROC.pos.distanceTo(P.pos); if (d < melhor) { melhor = d; fonte = C.PROC.pos; } }
      if (fonte && E.vinheta) { alvoV = clamp(1 - melhor / 7, 0, 1); const r = direita(fonte).a * Math.PI / 180; E.vinheta.style.setProperty('--vx', (50 - Math.sin(r) * 60) + '%'); E.vinheta.style.setProperty('--vy', (50 + Math.cos(r) * 60) + '%'); }
    }
    vinhV = lerp(vinhV, alvoV, Math.min(1, dt * 4));
    if (E.vinheta) { E.vinheta.style.opacity = (vinhV * .9).toFixed(3); E.vinheta.hidden = vinhV < .02; }

    // -------- postura do Inspetor
    if (E.postura) {
      if (OPT.posturaUI && M && M.ativo) {
        const st = M.state, info = (st === 'caca' || st === 'bote' || st === 'agarra') ? ['caçando', '#c0392b', '‼']
          : (st === 'procura' || st === 'fareja' || st === 'vasculha') ? ['procurando', '#c98a2b', '◉']
            : (st === 'investiga' || st === 'alerta') ? ['ouvindo', '#c9c05a', '◠'] : ['rondando', '#5d7a3a', '·'];
        E.postura.querySelector('span').textContent = info[2] + ' Inspetor: ' + info[0]; E.postura.style.setProperty('--pc', info[1]); E.postura.hidden = false;
      } else E.postura.hidden = true;
    }

    // -------- arco da audição dele + ícone de ouvido (quanto do seu som chega) — só calcula quando ligado
    if (E.ouvido) {
      if (OPT.arcoOuvido && M && M.ativo) { ouvidoV = lerp(ouvidoV, chegaAoInsp(), Math.min(1, dt * 6)); const i = E.ouvido.querySelector('i'); i.textContent = ouvidoV > .7 ? ' ele te ouve' : '●'; i.style.opacity = Math.max(.3, ouvidoV).toFixed(2); E.ouvido.style.opacity = (.4 + ouvidoV * .6).toFixed(2); E.ouvido.hidden = false; }
      else { ouvidoV = 0; E.ouvido.hidden = true; }
    }

    // -------- legenda da distância dos passos dele (sem som)
    legDistT -= dt;
    if (OPT.legDist && M && M.ativo && legDistT <= 0 && P.pos) {
      const d = M.pos.distanceTo(P.pos); if (d < 20) { legDistT = 2.2; legenda(`[passos dele: ${d < 4 ? 'perto' : d < 9 ? 'médio' : 'longe'}]`, 'dele'); } else legDistT = 1;
    }

    // -------- o seu barulho (separado do dele)
    legEuT -= dt;
    if (OPT.legEu && legEuT <= 0 && OPT.legSom !== 'nao') {
      if (S.hidden && !C.keys.Space && M && M.ativo && M.pos.distanceTo(P.pos) < 5.5) { legEuT = 2.6; legenda('[sua respiração]', 'eu'); }
      else if (!S.hidden && P.noiseR >= 5) { legEuT = 2.2; legenda(P.sprinting ? '[seus passos ecoam]' : '[você faz barulho]', 'eu'); }
    }

    // -------- "ele te ouviu" / perdeu o rastro: a mudança de estado por SUA causa
    const st = M && M.ativo ? M.state : null;
    if (st && estAnt && st !== estAnt && OPT.legSom !== 'nao') {
      if ((st === 'investiga' || st === 'caca') && (estAnt === 'patrulha' || estAnt === 'investiga') && P.noiseR > 0) {
        const dr = direita(M.pos), lado = dr.txt ? dr.txt.split(',')[0] : '';
        legenda(lado ? `[ele te ouviu — ${lado}]` : '[ele te ouviu]', 'dele');
      } else if ((estAnt === 'caca' || estAnt === 'procura' || estAnt === 'fareja') && st === 'patrulha') {
        legenda('[ele perdeu o seu rastro]', 'dele');
      } else if ((st === 'fareja' || st === 'vasculha') && estAnt !== 'fareja' && estAnt !== 'vasculha') {
        legenda('[ele está fuçando os esconderijos]', 'dele');
      }
    }
    estAnt = st;
    // a Menina no teto (para quem joga sem som)
    if (OPT.legSom !== 'nao' && C.ANA && C.ANA.ativa && C.ANA.teto && !tetoAnt) legenda('[ela está no teto]', 'dele');
    tetoAnt = !!(C.ANA && C.ANA.ativa && C.ANA.teto);
    // aviso da Procissão e o "nove" da Ana, para quem joga sem som
    const pf = C.PROC ? C.PROC.fase : null;
    if (OPT.legSom !== 'nao' && pf === 'aviso' && procAnt !== 'aviso') legenda('[a Procissão vem aí — as luzes falham]', 'dele');
    procAnt = pf;
    const conta = C.ANA && C.ANA.ativa ? C.ANA.conta : 0;
    if (OPT.legSom !== 'nao' && conta >= 9 && contaAnt < 9) legenda('[ela chegou a nove]', 'dele');
    contaAnt = conta;
    // ele está logo atrás (serve com ou sem som)
    atrasT -= dt;
    if (OPT.legSom !== 'nao' && insp && atrasT <= 0) {
      if (insp.d < 3 && Math.abs(insp.a) > 120) { atrasT = 5; legenda('[ele está bem atrás de você]', 'dele'); }
    }
    if (C.ANA && C.ANA.ativa && temCaca(M) && S.chapter === 3) { if (!duetoVisto) { duetoVisto = true; if (OPT.legSom !== 'nao') legenda('[as duas te acharam]', 'dele'); } }
    else duetoVisto = false;

    // alívio: quando o perigo todo passa, uma legenda de silêncio (também para quem joga sem som)
    const algum = !!((M && M.ativo) || (C.ANA && C.ANA.ativa) || (C.PROC && C.PROC.fase) || (C.chamado && C.chamado()));
    if (ameacaAnt && !algum && OPT.legSom !== 'nao') legenda('[silêncio — eles sumiram]', 'eu');
    ameacaAnt = algum;

    // última vez que ele foi ouvido (para o diário / sem som)
    if (M && M.ativo && ['investiga', 'procura', 'caca', 'fareja'].includes(M.state)) {
      try { const r = C.roomAt(M.pos.x, M.pos.z); if (r && (r.nome || r.id)) S.flags.ultOuvido = { sala: r.nome || r.id, t: Math.round(S.tempo) }; } catch (e) {}
    }
  }

  // Aprendizado passivo: lê só o estado atual (roda mesmo em pausa/diário)
  function aprenderPassivo() {
    const S = C.S, M = C.M, ANA = C.ANA, PROC = C.PROC; if (!S) return;
    if (M && M.ativo) {
      aprender('insp', 'ouve');
      if (M.clickT > 0 || M.state === 'investiga') aprender('insp', 'estala');
      if (M.state === 'investiga') aprender('insp', 'investiga');
      if (['caca', 'bote', 'agarra'].includes(M.state)) aprender('insp', 'caca');
      if (M.state === 'fareja' || M.state === 'vasculha') aprender('insp', 'fareja');
      if (M.state === 'procura' || M.recuo > 0) aprender('insp', 'desiste');
    }
    if (ANA && ANA.ativa) { aprender('ana', 'escuro'); if (ANA.conta >= 1) aprender('ana', 'conta'); if (ANA.conta >= 3) aprender('ana', 'porta'); if (ANA.teto) aprender('ana', 'teto'); }
    if (PROC && PROC.fase === 'aviso') aprender('proc', 'aviso');
    if (PROC && PROC.fase === 'passando') aprender('proc', 'passa');
    if (C.chamado && C.chamado()) aprender('cham', 'chama');
    if (S.flags) { if (S.flags.avist) aprender('insp', 'ouve', true); if (S.flags.anaVista) aprender('ana', 'escuro', true); if (S.flags.procAviso) aprender('proc', 'aviso', true); if (S.flags.chamado1) aprender('cham', 'chama', true); }
  }

  let escondido = false;
  function esconderTudo() {
    if (escondido) return; escondido = true; // só mexe no DOM na transição para escondido (roda todo quadro em pausa/cena/fim de capítulo)
    for (const id of ['insp', 'ana', 'proc', 'cham']) { const s = slots[id]; if (s) { s.seta.hidden = true; s.ico.hidden = true; } }
    for (const k of ['box', 'pulso', 'vinheta', 'faro', 'narina', 'postura', 'ouvido', 'contador']) { if (E[k]) E[k].hidden = true; }
    if (E.olho) E.olho.classList.remove('ana-conta');
  }

  // ---------------------------------------------------------------- BESTIÁRIO NO DIÁRIO
  function renderMonstros(el) {
    const S = C.S, b = best();
    let h = `<p style="color:var(--fraco);margin-bottom:12px">Caderno de comportamentos. Preenche-se sozinho conforme você sobrevive a cada coisa que eles fazem — nunca por coletar nada.</p>`;
    if (S && S.flags && S.flags.ultOuvido) h += `<p style="color:#d9a092;font-style:italic;margin-bottom:10px">Última vez que o Inspetor foi ouvido: ${S.flags.ultOuvido.sala}.</p>`;
    h += '<div class="best">';
    for (const id of ['insp', 'ana', 'proc', 'cham']) {
      const lista = BEST[id], sab = b[id] || {}, n = lista.filter(x => sab[x.id]).length;
      const descoberto = n > 0 || id === 'insp';
      h += `<div class="ficha"><h4 style="color:${CORES[id]}">${NOMES[id]}</h4><div class="cont">${descoberto ? `${n}/${lista.length} comportamentos` : 'ainda não encontrada'}</div><ul>`;
      for (const x of lista) {
        if (sab[x.id]) { const t = sab[x.id], quando = t > 0 ? ` <span style="opacity:.6">· visto aos ${Math.floor(t / 60)}min</span>` : ''; h += `<li>${x.tell}${quando}<span class="cj">↳ ${x.cj}</span></li>`; }
        else h += `<li class="x">— ${descoberto ? 'algo que você ainda não viu' : '???'}</li>`;
      }
      h += '</ul></div>';
    }
    h += '</div>';
    el.innerHTML = h;
  }
  function novidadeMonstros() { const b = best(); let n = 0; for (const id in BEST) n += Object.keys(b[id] || {}).length; return n; }

  // painel de ameaças ativas na pausa — ajuda a ler cenas de vários monstros de uma vez
  const ESTADO = { patrulha: 'rondando', investiga: 'ouvindo', alerta: 'ouvindo', procura: 'procurando', fareja: 'farejando', vasculha: 'procurando', caca: 'caçando', bote: 'caçando', agarra: 'caçando' };
  function pausa() {
    const el = $('#p-ameacas'); if (!el) return;
    const S = C.S; if (!S || C.mode !== 'jogo') { el.innerHTML = ''; return; }
    const lin = [], cor = ent => `color:${CORES[ent]}`;
    if (C.M && C.M.ativo) lin.push(`<b style="${cor('insp')}">O Inspetor</b> <span>— ${ESTADO[C.M.state] || 'por perto'}</span>`);
    if (C.ANA && C.ANA.ativa) lin.push(`<b style="${cor('ana')}">A Menina</b> <span>— ${C.ANA.conta >= 1 ? 'contando' : 'por perto'}</span>`);
    if (C.PROC && C.PROC.fase) lin.push(`<b style="${cor('proc')}">A Procissão</b> <span>— ${C.PROC.fase === 'aviso' ? 'chegando' : 'passando'}</span>`);
    if (C.chamado && C.chamado()) lin.push(`<b style="${cor('cham')}">O Chamado</b> <span>— te chamando</span>`);
    el.innerHTML = lin.length ? 'Agora com você: ' + lin.join(' · ') : '<span>Ninguém por perto agora. Respire.</span>';
  }
  // na tela de morte, lembra o contra-jogo de quem te pegou
  const QUEM = { inspetor: 'insp', ana: 'ana', procissao: 'proc', chamado: 'cham' };
  function morte(quem) {
    const el = $('#death-best'); if (!el) return;
    const ent = QUEM[quem]; const lista = ent && BEST[ent];
    if (!lista) { el.hidden = true; return; }
    const alvo = ent === 'insp' ? (lista.find(x => x.id === 'caca') || lista[0]) : lista[0];
    el.textContent = `${NOMES[ent]}: ${alvo.cj}`; el.hidden = false;
  }

  return { frame, renderMonstros, novidadeMonstros, pausa, morte, aplicar() {} };
}
