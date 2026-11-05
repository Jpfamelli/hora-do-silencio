// INTERFACE — Lote 5 (3ª rodada): ler, aprender e sentir os monstros.
// Painel de bordo opcional (sala dele, tensão, folga, rastro, contra-jogo agora), marcador do último som,
// fio de paciência, cerco da caçada longa, cartões de primeira vez (ensino sem tutorial chato),
// legendas dos comportamentos que faltavam, estágio do Inspetor em todo lugar (pausa, morte, fim de capítulo),
// retratos que pioram, estatísticas da noite e recordes no caderno, descrições e atalhos nas opções.
// Criado por src/interface.js com os mesmos ganchos de MM/MM2. Não muda fluxo de capítulo nem rótulos.
// As ajudas de leitura seguem desligadas por padrão; o Modo Cego (body.pl5-cego) desliga todas.
export function criarInterfaceMonstros3(C, U) {
  const $ = s => document.querySelector(s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const OPT = C.OPT, R = C.R;
  const legenda = (txt, cat) => { try { U.legenda(txt, cat); } catch (e) {} };
  const direcao = pos => { try { return U.direcao(pos); } catch (e) { return { d: 99, a: 0, txt: '' }; } };
  const CACA = new Set(['caca', 'bote', 'agarra']);
  const BUSCA = new Set(['procura', 'fareja', 'vasculha', 'conferir']);
  const OUVE = new Set(['investiga', 'alerta', 'escuta']);
  const cego = () => document.body.classList.contains('pl5-cego');

  // ---------------------------------------------------------------- memória (a noite e o perfil)
  const KEY = 'hora-silencio-l5ui';
  let SAVE = null;
  function perfil() {
    if (!SAVE) { try { SAVE = C.lsGet(KEY, null) || {}; } catch (e) { SAVE = {}; } }
    if (typeof SAVE !== 'object') SAVE = {};
    SAVE.cart = SAVE.cart || {}; SAVE.pegou = SAVE.pegou || {}; SAVE.maior = SAVE.maior || 0; SAVE.esc = SAVE.esc || 0; SAVE.seq = SAVE.seq || 0; SAVE.seqMax = SAVE.seqMax || 0;
    return SAVE;
  }
  function gravar() { try { C.lsSet(KEY, perfil()); } catch (e) {} }
  const DUM = {};
  function noite() { const S = C.S; if (!S || !S.flags) return DUM; S.flags.l5ui = S.flags.l5ui || { c: {} }; S.flags.l5ui.c = S.flags.l5ui.c || {}; return S.flags.l5ui; }
  function dadosCap(cap) { const n = noite(); if (n === DUM) return { cacas: 0, maior: 0, esc: 0, escArm: 0, esconde: 0, ouviu0: 0 }; return n.c[cap] = n.c[cap] || { cacas: 0, maior: 0, esc: 0, escArm: 0, esconde: 0, ouviu0: null }; }

  if (!R.conquistas.some(x => x.id === 'l5ui_ferro')) R.conquistas.push({ id: 'l5ui_ferro', nome: 'Fôlego de ferro', desc: 'Sobreviva a uma caçada de 45 segundos ou mais.' });

  // ---------------------------------------------------------------- estágios do Inspetor (capítulos I a V)
  const ESTAGIOS = [
    { nome: 'Funcionário', frase: 'Ainda parece um homem: fala sozinho, faz a ronda, quase pede desculpas.' },
    { nome: 'Guarda', frase: 'Já não fala, escuta. A venda nos olhos começa a ficar suja.' },
    { nome: 'Vigia', frase: 'Guarda o que você faz: o armário que usou, o caminho que repetiu.' },
    { nome: 'Carcereiro', frase: 'Na água o seu cheiro some, mas o barulho dobra. Ele já nem finge ser gente.' },
    { nome: 'Fera', frase: 'Não sobrou homem nenhum. Ele corre, ele fareja, ele não larga o rastro.' }
  ];
  const estIdx = cap => clamp((cap | 0) - 1, 0, 4);
  const estagio = () => ESTAGIOS[estIdx(C.S ? C.S.chapter : 1)];

  // ---------------------------------------------------------------- opções
  const sn = [[false, 'Não'], [true, 'Sim']];
  const PAD5 = {
    salaDele: false, ruidoNum: false, rastroIdade: false, tensaoBarra: false, recuoFolga: false, procCont: false, anaNum: false,
    contraAgora: false, cacaCrono: false, ultimoBorda: false, barraDesiste: false, rastroFresco: false, legExtra: false,
    cartoes: true, cacaFim: true, cercoCaca: true
  };
  for (const k in PAD5) { if (OPT[k] === undefined) OPT[k] = PAD5[k]; U.PAD[k] = PAD5[k]; }
  U.GRUPOS.push(['Leitura do perigo — painel de bordo', [
    { k: 'salaDele', nome: 'Painel: onde ele está em relação a você (na sua sala, ao lado, longe)', tipo: 'sel', ops: sn },
    { k: 'ruidoNum', nome: 'Painel: até quantos metros o seu barulho chega agora', tipo: 'sel', ops: sn },
    { k: 'rastroIdade', nome: 'Painel: quão quente está o seu rastro de cheiro (quente, morno, frio)', tipo: 'sel', ops: sn },
    { k: 'tensaoBarra', nome: 'Painel: a tensão dele enchendo (cheia, ele recua por um tempo)', tipo: 'sel', ops: sn },
    { k: 'recuoFolga', nome: 'Painel: quantos segundos de folga restam depois que ele recua', tipo: 'sel', ops: sn },
    { k: 'procCont', nome: 'Painel: contagem para a Procissão chegar', tipo: 'sel', ops: sn },
    { k: 'anaNum', nome: 'Painel: o número em que a Menina está contando', tipo: 'sel', ops: sn },
    { k: 'cacaCrono', nome: 'Painel: há quantos segundos ele te caça', tipo: 'sel', ops: sn },
    { k: 'contraAgora', nome: 'Painel: o que fazer agora (o contra-jogo da situação)', tipo: 'sel', ops: sn },
    { k: 'ultimoBorda', nome: 'Marcador na borda apontando o último barulho que ele ouviu (para onde vai)', tipo: 'sel', ops: sn },
    { k: 'rastroFresco', nome: 'Seta na borda apontando o seu rastro mais fresco (por onde NÃO voltar)', tipo: 'sel', ops: sn },
    { k: 'barraDesiste', nome: 'Fio de paciência no alto da tela (enche na caçada, esvazia quando ele procura)', tipo: 'sel', ops: sn },
    { k: 'legExtra', nome: 'Legendas dos comportamentos que faltavam (recuo, silêncio, tropeço, bote errado…)', tipo: 'sel', ops: sn }
  ]]);
  U.GRUPOS.push(['Ensino e perseguição', [
    { k: 'cartoes', nome: 'Cartões da Lia na primeira vez que algo novo acontece (uma vez só)', tipo: 'sel', ops: sn },
    { k: 'cacaFim', nome: 'Avisar quanto tempo você aguentou quando uma caçada acaba', tipo: 'sel', ops: sn },
    { k: 'cercoCaca', nome: 'Cerco: a borda escurece devagar numa caçada longa', tipo: 'sel', ops: sn }
  ]]);
  // o que cada ajuda quer dizer, em uma linha, embaixo da opção
  const DESC = {
    bussola: 'Setas na borda mostram de que lado vem cada monstro, sem dizer a distância exata.',
    bussolaIco: 'Cada monstro tem uma forma própria, para quem não diferencia cores.',
    bussolaUm: 'Mostra só a ameaça mais próxima.',
    pulsoProx: 'A tela pulsa quando ele está colado nas suas costas.',
    vinheta: 'A borda escurece do lado onde ele está.',
    faroBorda: 'Aviso discreto quando ele segue o seu cheiro.',
    posturaUI: 'Um selo no canto resume o que ele está fazendo.',
    arcoOuvido: 'Mostra quanto do seu barulho chega até ele.',
    legDist: 'Legenda dos passos dele: perto, médio ou longe.',
    legEu: 'Separa nas legendas o seu barulho do barulho dele.',
    ruidoHonesto: 'O anel de barulho encolhe atrás de portas e paredes.',
    coracaoBorda: 'A borda pulsa no ritmo do seu coração, mais rápido com ele perto.',
    pulsoAr: 'No esconderijo, cada batida aparece na borda: segure o ar entre elas.',
    anelFolego: 'Um anel na mira mostra o ar que resta ao segurar ESPAÇO.',
    calorEstado: 'Borda azul calma, laranja desconfiada, vermelha caçando.',
    termoIntencao: 'Esquenta quando ele desconfia, esfria quando perde o rastro.',
    brasaBorda: 'Só no Capítulo V: a borda esquenta do lado dele.',
    nevoaFuligem: 'Do Capítulo III em diante: fuligem na borda do lado dele.',
    vaporGelado: 'Um vapor frio na borda quando ele está na sala ao lado.',
    setaSom: 'Uma seta aponta de onde vem a respiração dele.',
    leituraIco: 'Um ícone no canto muda com o estado dele.',
    bengalaDist: 'Estima a distância dele pelo som da bengala.',
    brisaSeta: 'Mostra para onde sopra o vento; o cheiro vai junto.',
    pinoUltimo: 'Diz em texto onde fica o último barulho que ele ouviu.',
    bussolaArco: 'Escurece a base da tela do lado da ameaça mais próxima.',
    bussolaCap: 'A bússola muda de tom por capítulo.',
    bussolaMente: 'No Capítulo V a bússola treme e falha.',
    droneEstado: 'Um fio de som grave muda de timbre com o humor dele.',
    legComport: 'Legendas dos comportamentos do Inspetor (tateia, decora, encurrala…).',
    seloDisfarce: 'Lembra de manter o passo na fila da Procissão.',
    relSilencio: 'Conta há quanto tempo ninguém te persegue.',
    desumDiario: 'Mostra no diário o medidor homem → fera e o mapa da caçada.',
    salaDele: 'Só diz se ele está na sua sala, na sala ao lado ou longe.',
    ruidoNum: 'O alcance do seu barulho em metros, agora.',
    rastroIdade: 'Estimativa honesta de quão fresco está o rastro que você deixou.',
    tensaoBarra: 'Quando a tensão enche, ele recua. Dá para planejar a folga.',
    recuoFolga: 'Segundos de folga que a noite te deu. Aproveite sem correr.',
    procCont: 'Segundos até a fila passar, depois do aviso das luzes.',
    anaNum: 'O número da contagem da Menina, grande e claro.',
    cacaCrono: 'O tempo da caçada em curso.',
    contraAgora: 'Uma frase com o contra-jogo certo para o momento.',
    ultimoBorda: 'Um X na borda aponta para onde ele vai investigar.',
    rastroFresco: 'Uma seta fina para o trecho mais fresco do seu rastro.',
    barraDesiste: 'Um fio no alto: enche enquanto ele caça, esvazia enquanto procura.',
    legExtra: 'Legendas para tudo o que a noite faz com ele: recuo, tropeço, silêncio…',
    cartoes: 'A Lia comenta cada coisa nova uma vez só. Dá para reler no diário.',
    cacaFim: 'Quando uma caçada acaba, diz quanto tempo você aguentou.',
    cercoCaca: 'Quanto mais longa a caçada, mais a borda fecha. Sem piscar.'
  };
  const LEITURA_PADRAO = ['bussola', 'bussolaIco', 'bussolaUm', 'pulsoProx', 'vinheta', 'faroBorda', 'posturaUI', 'arcoOuvido', 'legDist', 'legEu', 'ruidoHonesto'];
  const PRESETS = {
    'Desligar tudo': { bussola: 'nao', pulsoProx: false, vinheta: false, faroBorda: false, posturaUI: false, arcoOuvido: false, legDist: false, ruidoHonesto: false, coracaoBorda: false, pulsoAr: false, anelFolego: false, calorEstado: false, termoIntencao: false, brasaBorda: false, nevoaFuligem: false, vaporGelado: false, setaSom: false, leituraIco: false, bengalaDist: false, brisaSeta: false, pinoUltimo: false, bussolaArco: false, bussolaCap: false, bussolaMente: false, droneEstado: false, legComport: false, relSilencio: false, salaDele: false, ruidoNum: false, rastroIdade: false, tensaoBarra: false, recuoFolga: false, procCont: false, anaNum: false, cacaCrono: false, contraAgora: false, ultimoBorda: false, rastroFresco: false, barraDesiste: false, legExtra: false },
    'Só o essencial': { coracaoBorda: true, pulsoProx: true, legComport: true, anelFolego: true, contraAgora: false, legExtra: false },
    'Sem som': { bussola: 'sim', bussolaIco: true, coracaoBorda: true, setaSom: true, bengalaDist: true, legDist: true, legComport: true, legEu: true, leituraIco: true, salaDele: true, legExtra: true, anelFolego: true, pulsoAr: true },
    'Tudo': { bussola: 'sim', bussolaIco: true, pulsoProx: true, vinheta: true, posturaUI: true, arcoOuvido: true, legDist: true, coracaoBorda: true, pulsoAr: true, anelFolego: true, calorEstado: true, setaSom: true, leituraIco: true, bengalaDist: true, pinoUltimo: true, bussolaArco: true, legComport: true, relSilencio: true, salaDele: true, ruidoNum: true, rastroIdade: true, tensaoBarra: true, recuoFolga: true, procCont: true, anaNum: true, cacaCrono: true, contraAgora: true, ultimoBorda: true, rastroFresco: true, barraDesiste: true, legExtra: true }
  };
  function opcoes(box) {
    try {
      if (!box) return;
      for (const el of box.querySelectorAll('[data-k]')) {
        const d = DESC[el.dataset.k], lab = el.closest('label.op');
        if (d && lab && !lab.querySelector('.op-desc')) { const s = document.createElement('small'); s.className = 'op-desc'; s.textContent = d; lab.appendChild(s); }
      }
      const gr = [...box.querySelectorAll('h3')].filter(h => /^(Leitura do perigo|Ensino e perseguição)/.test(h.textContent));
      for (const h of gr) {
        if (h.dataset.l5n) continue; h.dataset.l5n = '1';
        let n = 0, lig = 0, el = h.nextElementSibling;
        while (el && el.tagName !== 'H3') {
          const s = el.querySelector && el.querySelector('[data-k]');
          if (s) { n++; const v = OPT[s.dataset.k]; if (v === true || (typeof v === 'string' && v !== 'nao' && v !== 'false' && /^(sim|facil)$/.test(v))) lig++; }
          el = el.nextElementSibling;
        }
        const em = document.createElement('em'); em.className = 'op-cont'; em.textContent = ` ${lig} de ${n} ligadas`; h.appendChild(em);
      }
      const h1 = [...box.querySelectorAll('h3')].find(h => /^Leitura do perigo$/.test(h.textContent.replace(/\s*\d+ de \d+ ligadas\s*$/, '').trim()));
      if (h1 && !box.querySelector('.op-leitura-nota')) {
        const p = document.createElement('div'); p.className = 'op-leitura-nota';
        p.innerHTML = '<p>Tudo aqui é opcional e começa desligado. Nada mostra onde ele está de longe: são formas de ler o que você já ouviria. <b>Atalhos:</b></p>';
        for (const nome in PRESETS) {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = nome;
          b.onclick = () => {
            for (const k in PRESETS[nome]) {
              OPT[k] = PRESETS[nome][k];
              const el = box.querySelector(`[data-k="${k}"]`); if (el) el.value = String(PRESETS[nome][k]);
            }
            if (nome === 'Só o essencial') { /* o resto fica como o jogador deixou */ }
            try { C.salvarOpt(); } catch (e) {}
            try { U.aplicar && U.aplicar(); } catch (e) {}
            try { C.toast(`Leitura do perigo: ${nome.toLowerCase()}.`); } catch (e) {}
          };
          p.appendChild(b);
        }
        h1.insertAdjacentElement('afterend', p);
      }
    } catch (e) {}
  }

  // ---------------------------------------------------------------- refs do HUD
  const E = {};
  let pronto = false, escondido = false;
  function garantir() {
    if (pronto) return;
    const col = $('#m3-col'); if (!col) return; pronto = true;
    for (const [k, q] of [['col', '#m3-col'], ['ult', '#m3-ultimo'], ['fio', '#m3-fio'], ['cerco', '#m3-cerco'], ['cart', '#m3-cartao'], ['rast', '#m3-rastro']]) E[k] = $(q);
    if (E.fio) E.fioI = E.fio.querySelector('i');
    if (E.cart) { E.cartT = E.cart.querySelector('b'); E.cartX = E.cart.querySelector('span'); }
    E.l = {};
    for (const k of ['sala', 'ruido', 'rastro', 'tensao', 'folga', 'fila', 'ana', 'caca', 'contra']) {
      const d = document.createElement('div'); d.className = 'lin'; d.dataset.k = k; d.hidden = true; col.appendChild(d); E.l[k] = d;
    }
  }
  const setLin = (k, txt, ok) => {
    const d = E.l && E.l[k]; if (!d) return;
    if (ok) { if (d.textContent !== txt) d.textContent = txt; if (d.hidden) d.hidden = false; } else if (!d.hidden) d.hidden = true;
  };

  // ---------------------------------------------------------------- cartões de primeira vez
  const CARTOES = {
    insp: ['Ele', 'O Inspetor é cego e caça pelo som. Agachada (C) você quase não faz barulho; correr o chama de longe.'],
    estalo: ['Os estalos', 'Ele estala a língua para se localizar. Quanto mais forte o estalo, mais perto ele está. Pare e agache.'],
    fareja: ['Ele fareja', 'Ele fuça os esconderijos. Se estiver dentro de um, segure ESPAÇO e reze para ele passar.'],
    bote: ['O bote', 'Ele te achou e vai dar o bote. Agachada e parada, a mão dele pode passar por cima da sua cabeça.'],
    recuo: ['Ele recuou', 'A noite alterna caçada e folga. Use a folga para avançar, mas sem correr: o barulho ainda conta.'],
    reza: ['Ele parou', 'Às vezes ele para e reza, como se lembrasse de algo. É a sua janela: afaste-se sem correr.'],
    emboscada: ['Atrás da porta', 'Ele espera atrás de uma porta. Escute antes de entrar numa sala escura demais.'],
    ana: ['Ela conta', 'A Menina Que Conta só anda quando você não está vendo. Luz nela e ande de costas.'],
    proc: ['A fila', 'Luz falhando e rádio chiando: a Procissão. Esconda-se agora, em armário ou cama. Dentro, você é invisível a ela.'],
    cham: ['A voz', 'Alguém te chama da sala ao lado. É isca. Ir até lá atrai o Inspetor.'],
    correu: ['Correr', 'Correr faz o barulho ir longe, e ele ouve. Com ele por perto, ande devagar (ALT) ou agachada (C).'],
    ouviu: ['Ele ouviu', 'Quando ele muda de passo é porque ouviu algo. Repare no que você acabou de fazer.'],
    est1: [ESTAGIOS[0].nome, ESTAGIOS[0].frase],
    est2: [ESTAGIOS[1].nome, ESTAGIOS[1].frase],
    est3: [ESTAGIOS[2].nome, ESTAGIOS[2].frase],
    est4: [ESTAGIOS[3].nome, ESTAGIOS[3].frase],
    est5: [ESTAGIOS[4].nome, ESTAGIOS[4].frase]
  };
  const fila = []; let atual = null, atualT = 0, cooldown = 0;
  function pedir(id) { if (!OPT.cartoes || cego()) return; const p = perfil(); if (p.cart[id] || fila.includes(id) || atual === id || !CARTOES[id]) return; fila.push(id); }
  function cartoesFrame(dt, jogo, panico) {
    if (!E.cart) return;
    if (atual) {
      if (!jogo) return;
      atualT -= dt;
      if (atualT <= 0) { E.cart.classList.remove('on'); setTimeout(() => { if (!atual) E.cart.hidden = true; }, 400); atual = null; cooldown = 6; }
      return;
    }
    cooldown -= dt;
    if (!fila.length || !jogo || panico || cooldown > 0) return;
    const id = fila.shift(), c = CARTOES[id], p = perfil();
    p.cart[id] = Math.round(C.S ? C.S.tempo : 0); gravar();
    E.cartT.textContent = (id.startsWith('est') ? 'O Inspetor, esta noite: ' : '') + c[0]; E.cartX.textContent = c[1];
    E.cart.hidden = false; void E.cart.offsetWidth; E.cart.classList.add('on'); atual = id; atualT = clamp(c[1].length * .055 + 3, 5.5, 10) * (OPT.legTempo === 'longo' ? 1.6 : 1);
    try { C.SFX.clique && C.SFX.clique(); } catch (e) {}
  }

  // ---------------------------------------------------------------- caçada: duração, fim, recordes
  let chase = null, cacaAnt = false, capAnt = -1, estAnt = null, recuoAnt = false, socosAnt = 0, mudoAnt = false, stunAnt = false, caidoAnt = false, garrafaAnt = false;
  let ultNoiseT = -99, trilha = [], trilhaT = 0, maxProc = 1, passoAr = 0;
  function fimCaca(morreu) {
    if (!chase) return;
    const dur = chase.t, S = C.S, p = perfil(), cap = dadosCap(S ? S.chapter | 0 : 0);
    if (dur > cap.maior) cap.maior = dur;
    if (dur > p.maior) { p.maior = dur; }
    if (!morreu) {
      cap.esc++; p.esc++; p.seq++; if (p.seq > p.seqMax) p.seqMax = p.seq; if (chase.hid) cap.escArm++;
      if (dur >= 12 && OPT.cacaFim && OPT.legSom !== 'nao') legenda(`[você aguentou ${Math.round(dur)} segundos de caçada]`, 'eu');
      if (dur >= 45) { try { C.conquista('l5ui_ferro'); } catch (e) {} }
    } else p.seq = 0;
    gravar(); chase = null;
  }

  // ---------------------------------------------------------------- contra-jogo da situação
  function contraAgora(S, P, M, st) {
    const PROC = C.PROC, ANA = C.ANA;
    if (PROC && PROC.fase === 'aviso') return 'esconda-se já: armário ou cama';
    if (PROC && PROC.fase === 'passando') return S.hidden ? 'não saia até a fila passar' : 'fora de um esconderijo a fila mata';
    if (S.hidden && st && (CACA.has(st) || BUSCA.has(st) || OUVE.has(st))) return 'ESPAÇO: prenda o ar quando ele chegar perto';
    if (st === 'bote') return 'agache (C) e não se mexa';
    if (st && CACA.has(st)) return 'quebre a linha de visão e esconda-se';
    if (st === 'fareja' || st === 'vasculha') return 'ele fuça os esconderijos: saia de perto ou prenda o ar';
    if (st === 'emboscada') return 'não entre na sala escura correndo';
    if (st === 'reza') return 'é a sua janela: afaste-se sem correr';
    if (st && BUSCA.has(st)) return 'fique quieta e ande agachada para longe';
    if (st && OUVE.has(st)) return 'pare e agache: o barulho já foi';
    if (ANA && ANA.ativa && ANA.conta >= 1) return 'luz nela e ande de costas';
    if (C.chamado && C.chamado()) return 'não vá até a voz: é isca';
    return '';
  }

  // ---------------------------------------------------------------- quadro a quadro
  function frame(dt, ativo) {
    garantir();
    const S = C.S, P = C.P, M = C.M;
    const jogo = C.mode === 'jogo' && S && !S.dead && !S.fim;
    if (S !== Sref) { Sref = S; reiniciar(); }
    if (jogo) { try { passivo(); } catch (e) {} }
    if (!jogo) { esconder(); if (S && S.dead && chase) fimCaca(true); cartoesFrame(dt, false, false); return; }
    const emJogo = !C.ui && ativo;
    const cap = S.chapter | 0, st = (M && M.ativo) ? M.state : null;
    const caca = !!(st && CACA.has(st));
    const dIns = (M && M.ativo && P.pos) ? M.pos.distanceTo(P.pos) : 999;
    const nCego = cego();

    // --- rastreio passivo (roda mesmo com diário/pausa: só lê o estado)
    if (!emJogo) { esconder(); cartoesFrame(dt, false, false); return; }
    escondido = false;
    if (cap !== capAnt) {
      if (capAnt !== -1 && cap >= 1 && cap <= 5) { pedir('est' + cap); if (OPT.legExtra && !nCego && OPT.legSom !== 'nao' && M && M.ativo) legenda(`[o Inspetor, esta noite: ${ESTAGIOS[estIdx(cap)].nome}]`, 'dele'); }
      if (capAnt === -1 && cap >= 1 && cap <= 5) pedir('est' + cap);
      capAnt = cap; const d = dadosCap(cap); if (d.ouviu0 === null || d.ouviu0 === undefined) d.ouviu0 = (S.flags && S.flags.ouviuN) || 0;
    }
    if (caca && !cacaAnt) { chase = { t: 0, hid: false }; dadosCap(cap).cacas++; }
    if (caca && chase) { chase.t += dt; if (S.hidden) chase.hid = true; }
    if (!caca && cacaAnt) fimCaca(false);
    cacaAnt = caca;
    if (S.hidden && !escAnt) dadosCap(cap).esconde++;
    escAnt = !!S.hidden;
    if (P.noiseR >= 3 && !P.naAgua) ultNoiseT = S.tempo;
    trilhaT -= dt;
    if (trilhaT <= 0 && P.pos) { trilhaT = .6; if (P.noiseR >= 3 && !P.naAgua) { trilha.push({ x: P.pos.x, z: P.pos.z, t: S.tempo }); } while (trilha.length && S.tempo - trilha[0].t > 40) trilha.shift(); if (trilha.length > 80) trilha.shift(); }
    if (st === 'procura' && M.searchT > maxProc) maxProc = M.searchT;
    if (st !== 'procura') maxProc = Math.max(1, maxProc * .98);

    // --- cartões de primeira vez
    if (M && M.ativo && cap >= 1) {
      pedir('insp');
      if (st === 'investiga') pedir('estalo');
      if (st === 'fareja' || st === 'vasculha') pedir('fareja');
      if (st === 'bote') pedir('bote');
      if (M.recuo > 0 && cap >= 1 && S.tempo > 20) pedir('recuo');
      if (st === 'reza' || M.rezaT > 0) pedir('reza');
      if (st === 'emboscada') pedir('emboscada');
      if (P.sprinting && dIns < 12) pedir('correu');
      if (S.flags && S.flags.ouviuN > 0) pedir('ouviu');
    }
    if (C.ANA && C.ANA.ativa && C.ANA.conta >= 1) pedir('ana');
    if (C.PROC && C.PROC.fase === 'aviso') pedir('proc');
    if (C.chamado && C.chamado()) pedir('cham');
    const panico = !!(caca && dIns < 14) || (C.PROC && C.PROC.fase === 'passando');
    cartoesFrame(dt, true, panico);

    // --- legendas dos comportamentos que faltavam
    if (OPT.legExtra && !nCego && OPT.legSom !== 'nao' && M && M.ativo) {
      const rec = M.recuo > 0, mudo = (M.l5mudo || 0) > 0, stun = (M.l5stun || 0) > 0, caido = (M.caidoT || 0) > 0, garr = (M.alvoGarrafa || 0) > 0;
      if (rec && !recuoAnt && S.tempo > 20) legenda('[ele recuou — a noite dá uma folga curta]', 'dele');
      if (!rec && recuoAnt) legenda('[a folga acabou — ele voltou a rondar]', 'dele');
      if ((M.socos || 0) > socosAnt) legenda('[ele esmurra a porta]', 'dele');
      if (mudo && !mudoAnt) legenda('[ele ficou calado — não espere os estalos]', 'dele');
      if (stun && !stunAnt) legenda('[ele está atordoado]', 'dele');
      if (caido && !caidoAnt) legenda('[ele tropeçou correndo atrás de você]', 'dele');
      if (garr && !garrafaAnt) legenda('[a garrafa o distraiu]', 'dele');
      if (estAnt !== st) {
        if (st === 'emboscada') legenda('[ele espera atrás da porta]', 'dele');
        if (st === 'conferir') legenda('[ele volta para conferir o lugar do barulho]', 'dele');
        if (st === 'escuta') legenda('[ele prende a respiração para escutar]', 'dele');
        if (estAnt === 'bote' && (st === 'procura' || st === 'patrulha')) legenda('[o bote errou — a mão dele passou]', 'dele');
      }
      recuoAnt = rec; socosAnt = M.socos || 0; mudoAnt = mudo; stunAnt = stun; caidoAnt = caido; garrafaAnt = garr;
    } else { recuoAnt = !!(M && M.ativo && M.recuo > 0); socosAnt = (M && M.socos) || 0; mudoAnt = false; stunAnt = false; caidoAnt = false; garrafaAnt = false; }
    estAnt = st;

    // --- painel de bordo (canto direito)
    const lig = !nCego;
    let alguma = false;
    if (E.l) {
      let sala = '', salaOk = false;
      if (lig && OPT.salaDele && M && M.ativo && P.pos) {
        salaOk = true;
        try { const rm = C.roomAt(M.pos.x, M.pos.z); if (rm && rm === P.room) sala = 'na sua sala'; else if (rm && P.room && C.salaAdj(rm, P.room)) sala = 'na sala ao lado'; else sala = dIns < 24 ? 'a duas salas' : 'longe'; } catch (e) { sala = dIns < 8 ? 'perto' : 'longe'; }
      }
      setLin('sala', '◆ ele: ' + sala, salaOk);
      setLin('ruido', `› seu barulho: ${Math.round(P.noiseR || 0)} m`, lig && !!OPT.ruidoNum);
      let idade = '', idOk = false;
      if (lig && OPT.rastroIdade) { idOk = true; const a = S.tempo - ultNoiseT; idade = S.hidden ? 'rastro: parado' : a < 5 ? 'rastro: quente' : a < 14 ? 'rastro: morno' : a < 40 ? 'rastro: esfriando' : 'rastro: frio'; }
      setLin('rastro', '▿ ' + idade, idOk);
      const ten = (M && M.ativo) ? clamp((M.tensao || 0) / 100, 0, 1) : 0;
      setLin('tensao', '▮ tensão dele ' + '▮'.repeat(Math.round(ten * 8)) + '▯'.repeat(8 - Math.round(ten * 8)), lig && !!OPT.tensaoBarra && M && M.ativo && M.recuo <= 0);
      setLin('folga', `◌ folga: ${Math.ceil((M && M.recuo) || 0)} s`, lig && !!OPT.recuoFolga && M && M.ativo && M.recuo > 0);
      setLin('fila', `† a fila chega em ${Math.ceil((C.PROC && C.PROC.t) || 0)} s`, lig && !!OPT.procCont && C.PROC && C.PROC.fase === 'aviso');
      setLin('ana', `9 ela conta: ${Math.floor((C.ANA && C.ANA.conta) || 0)}`, lig && !!OPT.anaNum && C.ANA && C.ANA.ativa && C.ANA.conta >= 1);
      setLin('caca', `‼ caçada: ${Math.floor(chase ? chase.t : 0)} s`, lig && !!OPT.cacaCrono && !!chase);
      const ct = lig && OPT.contraAgora ? contraAgora(S, P, M, st) : '';
      setLin('contra', '➤ ' + ct, !!ct);
      for (const k in E.l) if (!E.l[k].hidden) { alguma = true; break; }
    }
    if (E.col) { if (E.col.hidden === alguma) E.col.hidden = !alguma; }

    // --- marcador do último barulho (borda) e rastro mais fresco
    if (E.ult) {
      if (lig && OPT.ultimoBorda && M && M.ativo && M.ultimo && P.pos && !caca) {
        const dr = direcao(M.ultimo); E.ult.style.transform = `rotate(${dr.a}deg)`; E.ult.style.opacity = clamp(1.1 - dr.d / 26, .3, .95).toFixed(2); E.ult.hidden = false;
      } else E.ult.hidden = true;
    }
    if (E.rast) {
      let ok = false;
      if (lig && OPT.rastroFresco && P.pos && trilha.length && !S.hidden) {
        let alvo = null;
        for (let i = trilha.length - 1; i >= 0; i--) { const q = trilha[i]; if (Math.hypot(q.x - P.pos.x, q.z - P.pos.z) > 4) { alvo = q; break; } }
        if (alvo) { const dr = direcao(alvo); E.rast.style.transform = `rotate(${dr.a}deg)`; E.rast.style.opacity = clamp(1 - (S.tempo - alvo.t) / 40, .25, .9).toFixed(2); ok = true; }
      }
      E.rast.hidden = !ok;
    }

    // --- fio de paciência
    if (E.fio) {
      let f = -1, cor = '#a83a2e';
      if (lig && OPT.barraDesiste && M && M.ativo) {
        if (caca) { f = clamp((M.cacaT || 0) / 40, 0, 1); cor = '#a83a2e'; }
        else if (st === 'procura') { f = clamp((M.searchT || 0) / maxProc, 0, 1); cor = '#c98a2b'; }
      }
      if (f >= 0) { E.fioI.style.width = (f * 100).toFixed(1) + '%'; E.fioI.style.background = cor; E.fio.hidden = false; } else E.fio.hidden = true;
    }

    // --- cerco da caçada longa
    if (E.cerco) {
      const a = (OPT.cercoCaca && chase && chase.t > 8) ? clamp((chase.t - 8) / 32, 0, 1) : 0;
      cercoV = lerp(cercoV, a, Math.min(1, dt * 1.5));
      if (cercoV < .02) { if (!E.cerco.hidden) E.cerco.hidden = true; } else { E.cerco.style.opacity = (cercoV * .85).toFixed(3); E.cerco.hidden = false; }
    }
  }
  let cercoV = 0, escAnt = false, Sref = null;

  function esconder() {
    if (escondido) return; escondido = true;
    for (const k of ['col', 'ult', 'fio', 'cerco', 'rast']) if (E[k]) E[k].hidden = true;
    if (E.cart && !atual) E.cart.hidden = true;
    cercoV = 0;
  }
  function reiniciar() { chase = null; cacaAnt = false; capAnt = -1; estAnt = null; recuoAnt = false; trilha = []; maxProc = 1; ultNoiseT = -99; escAnt = false; fila.length = 0; }

  // ---------------------------------------------------------------- retratos que pioram (canvas)
  function retrato(cv, quem, est) {
    if (!cv) return; const g = cv.getContext('2d'); if (!g) return;
    const W = cv.width, H = cv.height; g.clearRect(0, 0, W, H);
    const fundo = g.createRadialGradient(W / 2, H * .45, 4, W / 2, H / 2, W * .7); fundo.addColorStop(0, '#2a2018'); fundo.addColorStop(1, '#070504');
    g.fillStyle = fundo; g.fillRect(0, 0, W, H);
    let sd = 7 + est * 13; const rnd = () => { sd = (sd * 9301 + 49297) % 233280; return sd / 233280; };
    if (quem === 'insp') {
      g.fillStyle = '#12100d'; g.beginPath(); g.moveTo(W * .12, H); g.quadraticCurveTo(W * .5, H * .62, W * .88, H); g.fill(); // ombros
      const fera = est >= 4;
      g.fillStyle = est >= 3 ? '#a9a08c' : '#c7bda5'; g.beginPath(); g.ellipse(W / 2, H * .43, W * (.19 + est * .008), H * (.27 + est * .02), 0, 0, Math.PI * 2); g.fill(); // cabeça
      g.fillStyle = `rgba(30,22,14,${.55 + est * .08})`; g.fillRect(W * .29, H * .31, W * .42, H * (.1 + est * .01)); // venda
      g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(W * .29, H * .31); g.lineTo(W * .71, H * .31); g.stroke();
      for (let i = 0; i < est * 3 + 1; i++) { g.fillStyle = `rgba(${90 + est * 12},30,20,${.18 + rnd() * .3})`; g.beginPath(); g.arc(W * (.3 + rnd() * .4), H * (.3 + rnd() * .12), 2 + rnd() * (3 + est), 0, Math.PI * 2); g.fill(); } // manchas na venda
      g.strokeStyle = '#1c1612'; g.lineWidth = 1.2; // costuras
      for (let i = 0; i < est + 1; i++) { const x = W * (.34 + i * .07); g.beginPath(); g.moveTo(x, H * .29); g.lineTo(x + 3, H * .45); g.stroke(); }
      g.fillStyle = '#120c0a'; const bw = W * (.1 + est * .035), bh = fera ? H * .12 : H * (.02 + est * .01); // boca
      g.beginPath(); g.ellipse(W / 2, H * .6, bw, bh, 0, 0, Math.PI * 2); g.fill();
      if (est >= 2) { g.fillStyle = '#d9d0b6'; for (let i = -2; i <= 2; i++) { g.fillRect(W / 2 + i * bw * .38 - 1, H * .6 - bh * .8, 2, bh * (est >= 4 ? 1.5 : .7)); } }
      if (est >= 3) { g.strokeStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.moveTo(W * .5, H * .17); g.lineTo(W * .46, H * .3); g.lineTo(W * .52, H * .38); g.stroke(); } // rachadura
    } else if (quem === 'ana') {
      g.fillStyle = '#12100d'; g.beginPath(); g.moveTo(W * .18, H); g.quadraticCurveTo(W * .5, H * .6, W * .82, H); g.fill();
      g.fillStyle = '#b9ae96'; g.beginPath(); g.ellipse(W / 2, H * .42, W * .17, H * .24, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#0a0806'; g.beginPath(); g.moveTo(W * .3, H * .3); g.quadraticCurveTo(W / 2, H * .1, W * .7, H * .3); g.lineTo(W * .72, H * .62); g.lineTo(W * .66, H * .4); g.lineTo(W * .34, H * .4); g.lineTo(W * .28, H * .62); g.fill();
      g.fillStyle = '#050403'; g.beginPath(); g.ellipse(W * .42, H * .44, 5, 8, 0, 0, Math.PI * 2); g.ellipse(W * .58, H * .44, 5, 8, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#c77d9a'; g.font = `${H * .22}px "Special Elite", monospace`; g.textAlign = 'center'; g.fillText('9', W * .5, H * .93);
    } else if (quem === 'proc') {
      for (let i = 0; i < 5; i++) {
        const x = W * (.12 + i * .19), y = H * (.62 - (i % 2) * .08);
        g.fillStyle = '#0b0907'; g.beginPath(); g.moveTo(x - 9, H); g.lineTo(x - 5, y); g.lineTo(x + 5, y); g.lineTo(x + 9, H); g.fill();
        g.beginPath(); g.arc(x, y - 6, 6, 0, Math.PI * 2); g.fill();
        const r = g.createRadialGradient(x + 8, y + 10, 1, x + 8, y + 10, 16); r.addColorStop(0, 'rgba(255,214,120,.9)'); r.addColorStop(1, 'rgba(255,214,120,0)');
        g.fillStyle = r; g.fillRect(x - 10, y - 8, 40, 40);
      }
    } else {
      g.fillStyle = '#050403'; g.beginPath(); g.ellipse(W / 2, H * .5, W * .14, H * .26, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#6c8ba0'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(W / 2, H * .5, W * .14, H * .26, 0, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#6c8ba0'; g.font = `${H * .1}px "IM Fell English", Georgia, serif`; g.textAlign = 'center'; g.fillText('Lia...', W / 2, H * .94);
    }
  }

  // ---------------------------------------------------------------- tela de morte
  const MORTE_CAP = [
    'Aqui ele ainda hesita: uma porta fechada atrás de você ganha segundos.',
    'Uma porta fechada atrás de você ganha segundos: ele precisa abrir.',
    'Com a fila na casa, esconda-se primeiro e pense depois.',
    'Menina e Inspetor no mesmo andar: a luz nela, o ouvido nele. Não corra com a lanterna nela.',
    'Na água cada passo dobra. Atravesse agachada, só com ele longe.',
    'Ele não larga o rastro. Quebre a linha de visão e só então esconda-se.'
  ];
  const MORTE_OUTROS = {
    ana: 'Ela conta até dez. Ouça a contagem: no nove, vire.',
    procissao: 'A fila não vê quem está dentro de um esconderijo. Chegue antes das luzes falharem de vez.',
    chamado: 'A voz não é ninguém que você conhece. Não vá até ela.'
  };
  const QUEM_ENT = { inspetor: 'insp', ana: 'ana', procissao: 'proc', chamado: 'cham' };
  const QUEM_NOME = { inspetor: 'O Inspetor', ana: 'A Menina Que Conta', procissao: 'A Procissão', chamado: 'O Chamado' };
  function morte(quem) {
    try {
      const S = C.S, p = perfil(); if (!S) return;
      const cap = S.chapter | 0;
      let dur = 0;
      if (chase) { dur = chase.t; fimCaca(true); }
      p.pegou[quem] = (p.pegou[quem] || 0) + 1; p.seq = 0; gravar();
      const L = [];
      const dm = dadosCap(cap); dm.mortes = (dm.mortes || 0) + 1;
      const bA = $('#dt-ajuda'); if (bA) bA.hidden = !(dm.mortes >= 3 && !OPT.legComport && !cego());
      if (quem === 'inspetor') {
        const e = estagio(); L.push(`<b>${e.nome}.</b> ${e.frase}`);
        if (dur >= 4) L.push(`A caçada durou ${Math.round(dur)} segundos.`);
        if (S.flags && S.flags.ultOuvido) L.push(`Ele ouviu você pela última vez em: ${S.flags.ultOuvido.sala}.`);
        L.push(MORTE_CAP[Math.min(5, cap)]);
      } else L.push(MORTE_OUTROS[quem] || '');
      const n = p.pegou[quem];
      L.push(`${QUEM_NOME[quem] || 'Ele'} já te pegou ${n} ${n === 1 ? 'vez' : 'vezes'}.`);
      const el = $('#death-l5'); if (el) { el.innerHTML = L.filter(Boolean).join('<br>'); el.hidden = false; }
      const cv = $('#death-retrato'); if (cv) { retrato(cv, QUEM_ENT[quem] || 'insp', estIdx(cap)); cv.hidden = false; }
    } catch (e) {}
  }

  // ---------------------------------------------------------------- pausa
  function pausa() {
    try {
      const el = $('#p-ameacas'), S = C.S, M = C.M; if (!el || !S || C.mode !== 'jogo') return;
      const p = perfil(), cap = S.chapter | 0, partes = [];
      if (cap >= 1) partes.push(`O Inspetor, esta noite: ${estagio().nome}`);
      const ou = (S.flags && S.flags.ouviuN) || 0; if (ou) partes.push(`ele te ouviu ${ou} ${ou === 1 ? 'vez' : 'vezes'}`);
      if (p.maior >= 5) partes.push(`maior caçada: ${Math.round(p.maior)} s`);
      const agora = (M && M.ativo) ? contraAgora(S, C.P, M, M.state) : '';
      let h = partes.length ? `<br><small class="l5-p">${partes.join(' · ')}</small>` : '';
      if (agora) h += `<br><small class="l5-p">na hora: ${agora}</small>`;
      if (h) el.insertAdjacentHTML('beforeend', h);
    } catch (e) {}
  }

  // ---------------------------------------------------------------- fim de capítulo
  function fimCap(c) {
    try {
      const S = C.S, el = $('#fc-l5'); if (!el || !S) return;
      const cap = S.chapter | 0, d = dadosCap(cap), ou = Math.max(0, (((S.flags && S.flags.ouviuN) || 0) - (d.ouviu0 || 0)));
      const L = [];
      if (cap >= 1) {
        const a = ESTAGIOS[estIdx(cap)], b = ESTAGIOS[estIdx(cap + 1)];
        L.push(`O Inspetor: ${a.nome}${b !== a ? ' → ' + b.nome : ''}`);
        L.push(`Caçadas: ${d.cacas}${d.maior >= 2 ? ` · a maior durou ${Math.round(d.maior)} s` : ''}`);
        L.push(`Escapadas: ${d.esc}${d.escArm ? ` (${d.escArm} escondida)` : ''} · ele te ouviu ${ou} ${ou === 1 ? 'vez' : 'vezes'}`);
        if (d.esconde) L.push(`Esconderijos usados: ${d.esconde}`);
      }
      el.innerHTML = L.map(x => `<div>${x}</div>`).join(''); el.hidden = !L.length;
    } catch (e) {}
  }

  // ---------------------------------------------------------------- diário (aba Monstros) — acrescenta ao fim
  const ESCUTA = [
    ['Parada', 'quase nenhum'], ['Agachada', 'bem curto'], ['Andando', 'médio'], ['Devagar (ALT)', 'curto'],
    ['Correndo', 'longe'], ['Na água', 'o dobro'], ['Porta batendo', 'longe'], ['Garrafa', 'longe — mas ele vai até lá']
  ];
  const NOVOS = [
    ['recua', 'A noite dá folgas: quando a tensão enche, ele recua por um tempo.', 'Use a folga para avançar sem correr.'],
    ['bote', 'Quando te vê, ele dá um bote rápido.', 'Agachada e parada, a mão dele pode passar por cima.'],
    ['porta', 'Esmurra portas até arrombar.', 'Não espere atrás de uma: saia por outra.'],
    ['reza', 'Às vezes ele para e reza, como se lembrasse.', 'É uma janela: afaste-se sem correr.'],
    ['mudo', 'Em alguns momentos ele não estala a língua.', 'Não confie só nos estalos: olhe e escute o chão.'],
    ['tonto', 'Tropeça quando corre atrás de você.', 'Ganhe distância na hora.'],
    ['garrafa', 'Vai até onde uma garrafa quebrou.', 'Jogue longe e vá para o lado oposto.'],
    ['escuta', 'Para completamente para escutar.', 'Fique parada e agachada até ele voltar a andar.'],
    ['embosca', 'Espera atrás de portas.', 'Escute antes de entrar numa sala escura.'],
    ['confere', 'Volta para conferir o lugar de um barulho.', 'Não volte pelo mesmo caminho.']
  ];
  function aprenderNovo(id) { const n = noite(); if (n === DUM) return; n.b3 = n.b3 || {}; if (!n.b3[id]) n.b3[id] = Math.round(C.S.tempo); }
  function passivo() {
    const S = C.S, M = C.M; if (!S || !S.flags || !M || !M.ativo) return;
    const st = M.state;
    if (M.recuo > 0 && S.tempo > 20) aprenderNovo('recua');
    if (st === 'bote') aprenderNovo('bote');
    if ((M.socos || 0) > 0) aprenderNovo('porta');
    if (st === 'reza' || M.rezaT > 0) aprenderNovo('reza');
    if ((M.l5mudo || 0) > 0) aprenderNovo('mudo');
    if ((M.caidoT || 0) > 0) aprenderNovo('tonto');
    if ((M.alvoGarrafa || 0) > 0) aprenderNovo('garrafa');
    if (st === 'escuta') aprenderNovo('escuta');
    if (st === 'emboscada') aprenderNovo('embosca');
    if (st === 'conferir') aprenderNovo('confere');
  }
  const DESMONTE = { insp: 'O Inspetor', ana: 'A Menina Que Conta', proc: 'A Procissão', cham: 'O Chamado' };
  function render(el) {
    try {
      const S = C.S; if (!el || !S) return;
      const p = perfil(), cap = S.chapter | 0, n = noite(), b3 = n.b3 || {};
      // atalhos para as fichas (rolam o próprio caderno)
      const fichas = [...el.querySelectorAll('.best .ficha')];
      const nomes = ['Inspetor', 'Menina', 'Procissão', 'Chamado'];
      fichas.forEach((f, i) => { f.id = 'l5f' + i; const por = i === 0 ? (C.M && C.M.ativo) : i === 1 ? (C.ANA && C.ANA.ativa) : i === 2 ? (C.PROC && C.PROC.fase) : !!(C.chamado && C.chamado()); if (por) f.classList.add('agora'); });
      let tot = 0, vis = 0;
      try { const b = S.flags.best || {}; for (const k in b) vis += Object.keys(b[k]).length; } catch (e) {}
      vis += Object.keys(b3).length; tot = 13 + NOVOS.length;
      let nav = '<div class="l5-nav" role="navigation" aria-label="Fichas do caderno">';
      fichas.forEach((f, i) => { nav += `<button type="button" class="btn" data-f="l5f${i}">${nomes[i] || 'Ficha'}</button>`; });
      nav += '<button type="button" class="btn" data-f="l5-est">Estágios</button><button type="button" class="btn" data-f="l5-noite">Esta noite</button><button type="button" class="btn" data-f="l5-escuta">Como ele ouve</button><button type="button" class="btn" data-f="l5-lia">Anotações</button></div>';
      nav += `<div class="l5-prog" title="${vis} comportamentos vistos"><i style="width:${clamp(vis / tot * 100, 0, 100).toFixed(0)}%"></i></div>`;
      el.insertAdjacentHTML('afterbegin', nav);
      el.querySelectorAll('.l5-nav [data-f]').forEach(b => { b.onclick = () => { const alvo = document.getElementById(b.dataset.f); if (alvo) alvo.scrollIntoView({ block: 'start', behavior: OPT.vFlash ? 'auto' : 'smooth' }); }; });
      let h = '<hr class="l5-hr">';
      // 1. estágios do Inspetor, só até o capítulo atual
      h += '<h4 id="l5-est" class="l5-h">O Inspetor, estágio por estágio</h4><div class="l5-est"><canvas id="l5-retrato" width="120" height="120" aria-label="Retrato do Inspetor neste estágio"></canvas><ol>';
      for (let i = 0; i < 5; i++) h += i <= estIdx(cap) && cap >= 1 ? `<li class="${i === estIdx(cap) ? 'agora' : ''}"><b>${ESTAGIOS[i].nome}</b> ${ESTAGIOS[i].frase}</li>` : '<li class="x">— ainda não chegou lá</li>';
      h += '</ol></div>';
      // 2. a noite em números
      h += '<h4 id="l5-noite" class="l5-h">Esta noite</h4><div class="l5-grade">';
      let cacas = 0, esc = 0, arm = 0, maior = 0, esconde = 0;
      for (const k in n.c) { const d = n.c[k]; cacas += d.cacas; esc += d.esc; arm += d.escArm; esconde += d.esconde; maior = Math.max(maior, d.maior); }
      for (const [r, v] of [['Caçadas', cacas], ['Escapadas', esc], ['Escapou escondida', arm], ['Esconderijos', esconde], ['Maior caçada', maior >= 1 ? Math.round(maior) + ' s' : '—'], ['Ele te ouviu', (S.flags && S.flags.ouviuN) || 0]]) h += `<div><small>${r}</small><b>${v}</b></div>`;
      h += '</div>';
      h += `<p class="l5-fino">Recorde de todas as noites: caçada de ${p.maior >= 1 ? Math.round(p.maior) + ' s' : '—'} · ${p.esc} escapadas · sequência atual ${p.seq}, melhor ${p.seqMax}. A sequência zera quando ele te pega.</p>`;
      // 3. comportamentos novos
      h += '<h4 class="l5-h">Mais coisas que ele faz</h4><ul class="l5-novos">';
      for (const [id, tell, cj] of NOVOS) h += b3[id] ? `<li>${tell}<span class="cj">↳ ${cj}</span></li>` : '<li class="x">— algo que você ainda não viu</li>';
      h += '</ul>';
      // 4. como ele ouve
      h += '<h4 id="l5-escuta" class="l5-h">Como ele ouve</h4><div class="l5-escuta">';
      for (const [a, b] of ESCUTA) h += `<span>${a}</span><em>${b}</em>`;
      h += '</div><p class="l5-fino">Dentro do esconderijo, só a sua respiração conta — e ESPAÇO a segura.</p>';
      // 5. anotações da Lia (cartões já vistos)
      const vistos = Object.keys(p.cart).filter(k => CARTOES[k]);
      h += '<h4 id="l5-lia" class="l5-h">Anotações da Lia</h4>';
      h += vistos.length ? '<ul class="l5-notas">' + vistos.map(k => `<li><b>${CARTOES[k][0]}.</b> ${CARTOES[k][1]}</li>`).join('') + '</ul>' : '<p class="l5-fino">Ela anota aqui cada coisa nova que aprende, uma vez só.</p>';
      const extra = document.createElement('div'); extra.innerHTML = h; el.appendChild(extra);
      const cv = $('#l5-retrato'); if (cv) retrato(cv, 'insp', estIdx(cap));
    } catch (e) {}
  }

  // botão da tela de morte: depois de três mortes no mesmo capítulo, oferece as leituras essenciais (um clique)
  const bAjuda = $('#dt-ajuda');
  if (bAjuda) bAjuda.onclick = () => {
    for (const k in PRESETS['Só o essencial']) OPT[k] = PRESETS['Só o essencial'][k];
    OPT.legExtra = true; OPT.cartoes = true;
    try { C.salvarOpt(); } catch (e) {}
    bAjuda.hidden = true; try { C.toast('Ligado: coração na borda, pulso quando ele está atrás, anel de fôlego e legendas de comportamento. Dá para mudar em Opções.'); } catch (e) {}
  };
  const nomeEstagio = cap => ESTAGIOS[estIdx(cap)].nome;
  return { frame, morte, pausa, fimCap, render, opcoes, passivo, reiniciar, retrato, estagio, nomeEstagio, aplicar() {} };
}
