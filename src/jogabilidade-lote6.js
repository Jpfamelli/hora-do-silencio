// JOGABILIDADE, LOTE 6 — REJOGABILIDADE: modos extras, mutadores, desafios por semente,
// a Regra da Noite, recordes próprios, conquistas de modo e segredos que só aparecem na segunda jogada.
// Tudo desligado por padrão (o QA e a campanha normal não mudam). O motor liga JGL6 com poucos ganchos:
//   JGL6.antes(dt)  — antes do movimento (controles trocados, sem corrida, sem prender o ar, passos pesados...)
//   JGL6.update(dt) — por quadro (eco, coração, luz piscante, gasto, caçada, Regra da Noite, itens travados...)
//   JGL6.tempoMul() — Relâmpago (tudo mais rápido)
//   JGL6.bloqueiaEsconderijo(L), JGL6.tecla(e), JGL6.mapa(id), JGL6.novoJogo(S), JGL6.telaMorte()
// Catálogo de mutadores em MUT; a seleção fica em OPT.m6 (lista de ids) e vira S.modo6 ao começar a noite.
const L6_KEY = 'hora-silencio-l6';

// cada mutador é uma mudança real e isolada. "letra" é só um rótulo legível no painel/morte.
const MUT = [
  // --- luz
  { id: 'pilha',    letra: 'P', gr: 'Luz',       nome: 'Pilha Única',        desc: 'A lanterna tem uma carga só: nada de pilhas reservas nem recarga a noite inteira.' },
  { id: 'gasto',    letra: 'G', gr: 'Luz',       nome: 'Luz Faminta',        desc: 'A lanterna come a pilha mais rápido. Cada segundo aceso pesa.' },
  { id: 'fraca',    letra: 'W', gr: 'Luz',       nome: 'Lanterna Fraca',     desc: 'O feixe mal alcança: enxerga-se pouco à frente, bem perto do breu.' },
  { id: 'piscante', letra: 'K', gr: 'Luz',       nome: 'Luz Piscante',       desc: 'Mau contato: a luz falha por instantes de tempos em tempos. Jogue de olho no escuro.' },
  { id: 'curta',    letra: 'B', gr: 'Luz',       nome: 'Lanterna Curta',     desc: 'A lanterna só aguenta uns segundos acesa de cada vez antes de apagar sozinha.' },
  { id: 'semluz',   letra: 'Z', gr: 'Luz',       nome: 'No Escuro',          desc: 'Sem lanterna a noite toda: você joga só pelos relâmpagos e pelo som.' },
  { id: 'luzatrai', letra: 'I', gr: 'Luz',       nome: 'A Luz Chama',        desc: 'Com o Inspetor por perto, andar de lanterna acesa faz barulho — ele estranha a luz.' },
  // --- respiração e medo
  { id: 'folego',   letra: 'F', gr: 'Corpo',     nome: 'Fôlego Curto',       desc: 'Prender o ar acaba bem mais rápido. Escolha com cuidado a hora de segurar a respiração.' },
  { id: 'semar',    letra: 'R', gr: 'Corpo',     nome: 'Sem Prender o Ar',   desc: 'Você não consegue prender a respiração. Sobrevive só com posição e silêncio.' },
  { id: 'coracao',  letra: 'C', gr: 'Corpo',     nome: 'Coração Exposto',    desc: 'Com o medo no alto, o batimento vira um ruído baixo que o Inspetor escuta.' },
  { id: 'medo',     letra: 'M', gr: 'Corpo',     nome: 'Pavor Fácil',        desc: 'O medo sobe mais depressa no escuro, e perto dele vira pânico.' },
  { id: 'panico',   letra: 'Q', gr: 'Corpo',     nome: 'Pânico no Escuro',   desc: 'No breu o terror dispara e você não consegue segurar a respiração: precisa de luz para se acalmar.' },
  { id: 'frio',     letra: '2', gr: 'Corpo',     nome: 'Frio na Espinha',    desc: 'Parada no escuro, você treme de frio e o calafrio faz um barulho baixinho.' },
  { id: 'tremor',   letra: '3', gr: 'Corpo',     nome: 'Mãos Trêmulas',      desc: 'As mãos não param: a câmera treme mais, sobretudo com medo.' },
  { id: 'fragil',   letra: '4', gr: 'Corpo',     nome: 'Corpo Frágil',       desc: 'Você aguenta muito menos dano antes de cair.' },
  { id: 'cansada',  letra: '5', gr: 'Corpo',     nome: 'Fadiga',             desc: 'O fôlego de corrida é curto e se recupera devagar: dá para poucos arranques.' },
  // --- movimento e ruído
  { id: 'eco',      letra: 'E', gr: 'Passos',    nome: 'Eco de Passos',      desc: 'Seus passos deixam um eco: ele volta ao seu último ponto 2 s depois de você parar.' },
  { id: 'rastro',   letra: 'T', gr: 'Passos',    nome: 'Rastro Quente',      desc: 'Você deixa um rastro: o Inspetor fareja a trilha e vai atrás de onde você passou.' },
  { id: 'presenca', letra: '6', gr: 'Passos',    nome: 'Presença Delatora',  desc: 'Mesmo parada, a casa denuncia onde você está com um ruído baixinho de vez em quando.' },
  { id: 'pesados',  letra: 'H', gr: 'Passos',    nome: 'Passos Pesados',     desc: 'Cada passo soa mais alto. Andar devagar e agachar passam a valer ouro.' },
  { id: 'ecocorr',  letra: 'O', gr: 'Passos',    nome: 'Corrida Que Ecoa',   desc: 'Correr ecoa pelo prédio inteiro em qualquer capítulo, não só durante a Hora.' },
  { id: 'relampago',letra: 'L', gr: 'Passos',    nome: 'Relâmpago',          desc: 'A noite inteira roda mais rápido — você, o Inspetor, a Ana. Quase um arcade.' },
  { id: 'pernas',   letra: 'N', gr: 'Passos',    nome: 'Pernas Pesadas',     desc: 'Sem corrida: SHIFT não adianta. Tudo vira leitura de rota e esquiva no passo.' },
  { id: 'semdevagar',letra:'7', gr: 'Passos',    nome: 'Sem Pé Ante Pé',     desc: 'Você não consegue andar devagar (ALT): ou agacha, ou anda no passo normal e barulhento.' },
  { id: 'semagacha',letra: '8', gr: 'Passos',    nome: 'Sem Agachar',        desc: 'Os joelhos não dobram: nada de agachar para abafar o passo.' },
  // --- controles
  { id: 'troca',    letra: 'X', gr: 'Controle',  nome: 'Controles Trocados', desc: 'Esquerda e direita invertidas. Quem decorou o caminho se perde na mão.' },
  { id: 'mira',     letra: 'Y', gr: 'Controle',  nome: 'Mira Espelhada',     desc: 'O mouse vira ao contrário na horizontal. Desorienta de propósito.' },
  { id: 'semq',     letra: '9', gr: 'Controle',  nome: 'Sem Olhar pra Trás', desc: 'Q não funciona: você nunca sabe o que vem atrás sem virar o corpo todo.' },
  { id: 'semespiar',letra: '0', gr: 'Controle',  nome: 'Sem Espiar',         desc: 'Nada de espiar pela fresta (Z/X): escondida, você fica no escuro sem ver nada.' },
  // --- itens
  { id: 'vazias',   letra: 'V', gr: 'Itens',     nome: 'Mãos Vazias',        desc: 'Sem garrafa, sem curativo, sem pilha a noite toda. Furtividade pura.' },
  { id: 'semgar',   letra: 'A', gr: 'Itens',     nome: 'Sem Garrafa',        desc: 'Nada de distrair o Inspetor com barulho: a garrafa some do inventário.' },
  { id: 'semcura',  letra: 'U', gr: 'Itens',     nome: 'Pele Dura',          desc: 'Sem curativo: o que você perde de vida, perdeu. Cada erro cobra caro.' },
  { id: 'umagar',   letra: 'a', gr: 'Itens',     nome: 'Só Uma Garrafa',     desc: 'Você carrega no máximo uma garrafa por vez. Gaste a sua isca com juízo.' },
  { id: 'umcura',   letra: 'u', gr: 'Itens',     nome: 'Só Um Curativo',     desc: 'No máximo um curativo guardado: a próxima ferida precisa esperar.' },
  { id: 'garrafaforte',letra:'g',gr: 'Itens',    nome: 'Garrafa Barulhenta', desc: 'A garrafa estoura muito mais alto — a isca vira risco se cair perto de você.' },
  { id: 'truque',   letra: 't', gr: 'Itens',     nome: 'Truque Velho',       desc: 'O Inspetor cansou das garrafas: ele quase não cai mais no truque do barulho.' },
  // --- esconderijo e inimigo
  { id: 'semesc',   letra: 'S', gr: 'Esconderijo',nome:'Sem Esconderijo',    desc: 'Armários e camas ficam pregados. Só escapa por luz, som e linha de visão.' },
  { id: 'podre',    letra: 'D', gr: 'Esconderijo',nome:'Esconderijo Podre',  desc: 'A cada noite a semente apodrece um esconderijo: ele range alto e te entrega.' },
  { id: 'cacada',   letra: 'J', gr: 'Inimigo',   nome: 'Caçada',             desc: 'A noite já começa com o Inspetor te caçando, sem tempo de preparação.' },
  { id: 'agua',     letra: 'w', gr: 'Inimigo',   nome: 'Água Traiçoeira',    desc: 'Na água o medo sobe e cada movimento espalha barulho pela sala.' }
];
const MUTID = Object.fromEntries(MUT.map(m => [m.id, m]));
const GRUPOS = ['Luz', 'Corpo', 'Passos', 'Controle', 'Itens', 'Esconderijo', 'Inimigo'];

// presets: combos com nome próprio e recorde próprio
const PRESETS = [
  { id: 'hardcore', nome: 'Regras da Casa', desc: 'O jeito raiz: pilha única, sem esconderijo e passos pesados.', mods: ['pilha', 'semesc', 'pesados'] },
  { id: 'limpas',   nome: 'De Mãos Limpas', desc: 'Mãos vazias e uma pilha só. Nada entre você e o silêncio.', mods: ['vazias', 'pilha'] },
  { id: 'cegas',    nome: 'Corrida às Cegas', desc: 'Coração exposto e passos pesados: ele sente cada batida sua.', mods: ['coracao', 'pesados'] },
  { id: 'breu',     nome: 'Noite Cega', desc: 'No escuro, coração exposto e passos pesados: ele te ouve, você não o vê.', mods: ['semluz', 'coracao', 'pesados'] }
];

// a Regra da Noite: 6 regras da casa, sorteadas pela semente. Cumprir dá selo; quebrar atrai o Inspetor.
const REGRAS = [
  { id: 'nao_corra',   txt: 'não corra esta noite' },
  { id: 'luz_pouca',   txt: 'não deixe a lanterna acesa muito tempo' },
  { id: 'sem_garrafa', txt: 'não jogue nenhuma garrafa' },
  { id: 'nao_pare',    txt: 'não fique parada parada tempo demais' },
  { id: 'nao_esconda', txt: 'não se esconda em armário nem cama' },
  { id: 'medo_calmo',  txt: 'não deixe o pavor te dominar' }
];

export function criarJogabilidadeL6(ctx) {
  const { THREE, P, M, PROC, ANA, W, keys, camera, OPT, SFX, flash, D,
    emitNoise, marcarCausa, toast, sub, subPequeno, conquista, lsGet, lsSet, salvarOpt,
    ativarInspetor, salasAlcancaveis, pontoEm, distSalas, roomAt, collide } = ctx;
  const $ = s => document.querySelector(s);
  const S = () => ctx.S;
  const jogando = () => ctx.mode === 'jogo' && !ctx.ui && S() && !S().dead && !S().fim;

  // conquistas de modo (secretas): registradas no roteiro para a fila da progressão achar
  const CONQ = [
    { id: 'l6_noseco',    nome: 'Nó Cego',          desc: 'Termine um capítulo sem usar nenhum esconderijo (modo Sem Esconderijo).', segredo: true },
    { id: 'l6_vazias',    nome: 'De Mãos Vazias',   desc: 'Termine um capítulo de mãos vazias.', segredo: true },
    { id: 'l6_trocada',   nome: 'Mão Trocada',      desc: 'Termine um capítulo com os controles trocados.', segredo: true },
    { id: 'l6_relampago', nome: 'Num Piscar',       desc: 'Termine um capítulo no modo Relâmpago.', segredo: true },
    { id: 'l6_coracao',   nome: 'Coração à Mostra',  desc: 'Termine um capítulo com o Coração Exposto.', segredo: true },
    { id: 'l6_cacada',    nome: 'Sem Trégua',       desc: 'Termine um capítulo com o Inspetor caçando desde o início.', segredo: true },
    { id: 'l6_pilha',     nome: 'À Pilha Contada',  desc: 'Termine um capítulo com uma pilha só.', segredo: true },
    { id: 'l6_regra',     nome: 'Casa em Ordem',    desc: 'Cumpra a Regra da Noite por um capítulo inteiro.', segredo: true },
    { id: 'l6_surpresa',  nome: 'O Que a Noite Mandar', desc: 'Termine um capítulo numa noite do "Me Surpreenda".', segredo: true },
    { id: 'l6_hardcore',  nome: 'Raiz',             desc: 'Termine um capítulo no preset Regras da Casa.', segredo: true },
    { id: 'l6_semluz',    nome: 'No Breu',          desc: 'Termine um capítulo sem usar a lanterna (modo No Escuro).', segredo: true },
    { id: 'l6_fragil',    nome: 'Por Um Fio',       desc: 'Termine um capítulo inteiro de Corpo Frágil.', segredo: true }
  ];
  try { const R = window.ROTEIRO; for (const c of CONQ) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c); } catch (e) {}

  const tem = id => { const s = S(); return !!(s && s.modo6 && s.modo6.includes(id)); };
  const seedNum = () => { try { return parseInt((S().semente || 'ABCDEF'), 36) >>> 0; } catch (e) { return 7; } };

  // ---------- estado por quadro / por noite ----------
  let ecoPos = null, ecoT = 0, rastroT = 0, coracaoT = 0, piscaT = 0, piscaDur = 0, gastoExtra = 0;
  let regraIdx = -1, bannerFeito = -1, capCombo = [], capAnt = -1, cacadaFeita = -1, podreRef = null, podreMapa = '';
  let deslizeT = 0;

  function resetNoite() { ecoPos = null; ecoT = 0; rastroT = 0; coracaoT = 0; piscaT = 2; piscaDur = 0; regraIdx = -1; bannerFeito = -1; capCombo = []; capAnt = -1; cacadaFeita = -1; podreRef = null; podreMapa = ''; deslizeT = 0; }

  // ---------- recordes ----------
  const recordes = () => lsGet(L6_KEY, { melhorCap: {}, melhorTempo: {}, mortes: {}, noites: 0 });
  function assinatura(s) { // nome curto do desafio atual (para separar recordes)
    const ms = (s.modo6 || []); if (!ms.length) return null;
    if (s.preset6) return 'preset:' + s.preset6;
    if (s.surpresa6) return 'surpresa';
    return 'mut:' + ms.slice().sort().join('');
  }
  function salvarRec(fn) { const r = recordes(); fn(r); lsSet(L6_KEY, r); return r; }

  // ---------- código de desafio do Lote 6 ----------
  function codigo(s) {
    s = s || S(); if (!s) return '';
    const letras = (s.modo6 || []).map(id => (MUTID[id] || {}).letra || '').join('');
    return (s.semente || 'SEMCOD') + (letras ? '/' + letras : '');
  }

  // ---------- ganchos do motor ----------
  // aplicado quando a noite começa (logo depois de PG.novoJogo)
  function novoJogo(s) {
    resetNoite();
    const base = (OPT.m6 || []).filter(id => MUTID[id]);
    s.modo6 = [...new Set(base)];
    s.preset6 = OPT.preset6 || null;
    s.surpresa6 = !!OPT.surpresa6; OPT.surpresa6 = false; // some depois de usar
    s.tec6 = { deslize: !!(OPT.tec6 && OPT.tec6.deslize) };
    s.regraNoite = !!OPT.regra6;
    s.economia6 = !!OPT.economia6;
    if (s.modo6.length || s.regraNoite || s.economia6) salvarRec(r => { r.noites = (r.noites || 0) + 1; });
    const r = salvarRec(r => { r.jogos = (r.jogos || 0) + 1; }); s._jogos6 = r.jogos; s._dejavu6 = false;
    // economia da noite pela semente: seca, cheia ou só uma pilha
    if (s.economia6) {
      const e = seedNum() % 3; s.econTipo6 = ['seca', 'cheia', 'pilha'][e];
    }
  }

  // ao carregar cada mapa/capítulo
  function mapa(id) {
    const s = S(); if (!s) return;
    // esconderijo podre: escolhe um pela semente neste mapa
    podreRef = null; podreMapa = id;
    if (tem('podre') && W.lockers && W.lockers.length) {
      podreRef = W.lockers[seedNum() % W.lockers.length] || null;
    }
    // Caçada: já começa sendo caçada (capítulos com Inspetor)
    if (tem('cacada') && s.chapter >= 1 && !M.ativo && W.def && W.def.inspetor && W.def.inspetor()) {
      try {
        const salas = salasAlcancaveis(P.pos, { semFora: !W.def.inspetorFora }).filter(r => r !== P.room && !r.seguro);
        const longe = salas.sort((a, b) => distSalas(b, P.room) - distSalas(a, P.room))[0];
        if (longe) { const [x, z] = pontoEm(longe); ativarInspetor(x, z, 'procura'); M.searchT = 20; M.ultimo = P.pos.clone(); }
      } catch (e) {}
    }
    // economia: ajusta os consumíveis no começo da noite
    if (s.economia6 && id === 'estrada' && !s._econAplic) {
      s._econAplic = true;
      if (s.econTipo6 === 'seca') s.inv.kits = Math.max(0, (s.inv.kits || 0) - 1);
      if (s.econTipo6 === 'cheia') s.inv.garrafas = (s.inv.garrafas || 0) + 1;
    }
  }

  // antes do movimento: mexe nas teclas e nos sinais lidos pelo updatePlayer
  function antes(dt) {
    P.troca6 = 1; P.mira6 = 1; P.ruido6 = 1; P.ecoSempre6 = false; P.garrafa6 = 1;
    if (!jogando()) return;
    if (tem('troca')) P.troca6 = -1;
    if (tem('mira')) P.mira6 = -1;
    if (tem('pesados')) P.ruido6 = 1.7;
    if (tem('garrafaforte')) P.garrafa6 = 1.8;
    if (tem('ecocorr')) P.ecoSempre6 = true;
    if (tem('pernas')) { keys.ShiftLeft = keys.ShiftRight = false; P.correrTrava = false; }
    if (tem('semdevagar')) { keys.AltLeft = keys.AltRight = false; keys.Mouse1 = false; }
    if (tem('semagacha')) { keys.KeyC = false; if (!S().hidden) P.crouch = false; }
    if (tem('semq')) keys.KeyQ = false;
    if (tem('semespiar')) { keys.KeyZ = false; keys.KeyX = false; }
    if (tem('semar')) { keys.Space = false; P.arTrava = false; }
    const s = S();
    if (tem('panico') && P.room && !P.room.fora && !s.flashOn) { keys.Space = false; P.arTrava = false; }
    if (tem('folego') && P.prende) s.ar = Math.max(0, s.ar - 12 * dt); // prender o ar acaba bem mais rápido
  }

  // Relâmpago: tudo mais rápido
  function tempoMul() { return jogando() && tem('relampago') ? 1.2 : 1; }

  // bloqueio / aviso de esconderijo (gancho dentro de entrarEsconderijo)
  function bloqueiaEsconderijo(L) {
    if (!jogando()) return false;
    if (tem('semesc')) { toast('Esta noite os esconderijos estão pregados. Fuja pela luz e pelo silêncio.'); SFX.trancado(); return true; }
    if (tem('podre') && L === podreRef) {
      emitNoise(L.x, L.z, 7, true); marcarCausa('respirou');
      toast('A dobradiça geme alto — este esconderijo está podre e te entrega!');
      try { SFX.rangido(L.x, 1, L.z, .9); } catch (e) {}
    }
    // Regra da Noite: esconder-se quebra a regra
    if (regraAtiva('nao_esconda')) quebrarRegra();
    return false;
  }

  function tecla(e) {
    if (!jogando()) return false;
    const s = S();
    // deslize: agachar correndo escorrega e baixa o perfil (tech opcional, ligada nas Opções de modo)
    if (e.code === 'KeyC' && s.tec6 && s.tec6.deslize && P.sprinting && deslizeT <= 0 && !s.hidden) {
      deslizeT = .5; P.crouch = true;
      try { SFX.passo(.3, (P.room && P.room.piso) || 'grama', !!(P.room && P.room.fora), P.naAgua); } catch (e2) {}
      emitNoise(P.pos.x, P.pos.z, 2.5, true);
      if (!s.flags.dicaDeslize) { s.flags.dicaDeslize = true; toast('Deslize! Agachar correndo escorrega e abaixa a cabeça por um instante.'); }
      return true;
    }
    return false;
  }

  // ---------- Regra da Noite ----------
  function regraAtiva(id) { const s = S(); return !!(s && s.regraNoite && regraIdx >= 0 && REGRAS[regraIdx].id === id && s.regra6ok !== false); }
  function quebrarRegra() {
    const s = S(); if (!s || s.regra6ok === false) return;
    s.regra6ok = false;
    toast('Você quebrou a regra da casa. Agora ele está mais atento a você.');
    // consequência: um ruído que puxa o Inspetor, sem ser instantâneo demais
    try { emitNoise(P.pos.x, P.pos.z, 10, true); marcarCausa('respirou'); } catch (e) {}
  }

  // ---------- por quadro ----------
  function update(dt) {
    if (!jogando()) return;
    const s = S();

    // itens travados pelos mutadores (reforçado todo quadro: também bloqueia o que você pegar no caminho)
    if (tem('vazias')) { s.inv.garrafas = 0; s.inv.kits = 0; s.inv.pilhas = 0; }
    else { if (tem('semgar')) s.inv.garrafas = 0; if (tem('semcura')) s.inv.kits = 0; if (tem('umagar')) s.inv.garrafas = Math.min(s.inv.garrafas, 1); if (tem('umcura')) s.inv.kits = Math.min(s.inv.kits, 1); }
    if (tem('pilha') || tem('vazias') || (s.economia6 && s.econTipo6 === 'pilha')) s.inv.pilhas = 0;

    // No Escuro: sem lanterna a noite toda
    if (tem('semluz')) s.flashOn = false;
    // Lanterna Fraca: o feixe mal alcança
    if (tem('fraca') && s.flashOn && flash) flash.intensity *= .5;
    // Lanterna Curta: apaga sozinha depois de alguns segundos acesa
    if (tem('curta')) { if (s.flashOn) { s._curta6 = (s._curta6 || 0) + dt; if (s._curta6 > 6) { s.flashOn = false; s._curta6 = 0; try { SFX.clique(); } catch (e) {} toast('A lanterna velha apagou sozinha.'); } } else s._curta6 = 0; }
    // Luz Faminta: pilha some mais rápido
    if (tem('gasto') && s.flashOn) s.battery = Math.max(0, s.battery - 0.6 * (D ? D().pilha : 1) * dt);
    // A Luz Chama: andar aceso perto dele faz barulho
    if (tem('luzatrai') && s.flashOn && M.ativo && !s.hidden && P.noiseR > .1) { if ((s._luzT6 = (s._luzT6 || 0) + dt) > 1.2) { s._luzT6 = 0; emitNoise(P.pos.x, P.pos.z, 3.5, true); } }

    // Corpo Frágil: você aguenta bem menos
    if (tem('fragil')) s.health = Math.min(s.health, 45);
    // Fadiga: fôlego de corrida curto
    if (tem('cansada')) s.stamina = Math.min(s.stamina, 55);

    // Pavor Fácil / Pânico no Escuro: o medo sobe sozinho no escuro
    if (tem('medo') || tem('panico')) { const escuro = P.room && !P.room.fora && !s.flashOn; if (escuro) s.fear = Math.min(100, s.fear + (tem('panico') ? 16 : 7) * dt); }
    // Mãos Trêmulas: a câmera treme mais
    if (tem('tremor')) P.shake = Math.max(P.shake, .012 + (s.fear > 60 ? .02 : 0));
    // Frio na Espinha: parada no escuro, o calafrio denuncia
    if (tem('frio')) { const quieta = P.noiseR < .1 && !s.hidden && P.room && !P.room.fora && !s.flashOn; if (quieta && (s._frio6 = (s._frio6 || 0) + dt) > 3.5) { s._frio6 = 0; emitNoise(P.pos.x, P.pos.z, 1.6, true); try { SFX.ofego(); } catch (e) {} } }
    // Água Traiçoeira: medo e barulho na água
    if (tem('agua') && P.naAgua) { s.fear = Math.min(100, s.fear + 6 * dt); if (P.noiseR > .1 && (s._agua6 = (s._agua6 || 0) + dt) > .8) { s._agua6 = 0; emitNoise(P.pos.x, P.pos.z, 5, true); } }
    // Presença Delatora: a casa te denuncia mesmo parada
    if (tem('presenca') && M.ativo && !s.hidden) { if ((s._pres6 = (s._pres6 || 0) + dt) > 4) { s._pres6 = 0; emitNoise(P.pos.x, P.pos.z, 2.2, true); } }
    // Truque Velho: o Inspetor quase não cai mais na garrafa
    if (tem('truque') && M.ativo) M.ignoraGarrafa = Math.max(M.ignoraGarrafa || 0, 2);

    // Coração Exposto: medo alto vira batida audível, pulsada
    if (tem('coracao') && M.ativo) {
      coracaoT -= dt;
      if (s.fear > 55 && coracaoT <= 0 && !s.hidden) {
        coracaoT = s.fear > 85 ? .8 : 1.4;
        emitNoise(P.pos.x, P.pos.z, s.fear > 85 ? 4 : 2.5, true); marcarCausa('respirou');
        try { P.pulso = Math.min(100, (P.pulso || 0) + 8); } catch (e) {}
      }
    }

    // Eco de Passos: ele volta ao seu último ponto 2 s depois de você parar
    if (tem('eco')) {
      const movendo = P.noiseR > .1 && !s.hidden;
      if (movendo) { ecoPos = { x: P.pos.x, z: P.pos.z }; ecoT = 2; }
      else if (ecoPos && ecoT > 0) { ecoT -= dt; if (ecoT <= 0) { emitNoise(ecoPos.x, ecoPos.z, 7, true); marcarCausa('correu'); ecoPos = null; } }
    }

    // Rastro Quente: a cada ~2,5 s em movimento, um farejo no ponto por onde você passou
    if (tem('rastro') && M.ativo && !s.hidden) {
      rastroT -= dt;
      if (P.noiseR > .1 && rastroT <= 0) { rastroT = 2.5; emitNoise(P.pos.x, P.pos.z, 4, true); }
    }

    // Luz Piscante: mau contato, falhas curtas
    if (tem('piscante')) {
      piscaT -= dt;
      if (piscaDur > 0) { piscaDur -= dt; if (s.flashOn && flash) { flash.intensity *= .12; } }
      else if (piscaT <= 0 && s.flashOn) { piscaT = 1.2 + Math.random() * 3.5; piscaDur = .06 + Math.random() * .2; try { SFX.clique(); } catch (e) {} }
    }

    // deslize em andamento: escorrega para a frente baixando o perfil
    if (deslizeT > 0) {
      deslizeT -= dt;
      const v = 3.2 * Math.max(0, deslizeT / .5);
      const nx = P.pos.x - Math.sin(P.yaw) * v * dt, nz = P.pos.z - Math.cos(P.yaw) * v * dt;
      const q = new THREE.Vector3(nx, 0, nz); collide(q, .33); P.pos.copy(q);
    }

    // Regra da Noite: define a regra do capítulo e vigia o cumprimento
    if (s.regraNoite) {
      if (regraIdx < 0 || capAnt !== s.chapter) regraIdx = (seedNum() + s.chapter) % REGRAS.length;
      const reg = REGRAS[regraIdx];
      if (reg.id === 'nao_corra' && P.sprinting && !s.flags.sino) quebrarRegra();
      if (reg.id === 'luz_pouca') { s._regraLuz = (s._regraLuz || 0) + (s.flashOn ? dt : -dt * .5); if (s._regraLuz > 40) quebrarRegra(); s._regraLuz = Math.max(0, s._regraLuz); }
      if (reg.id === 'nao_pare') { s._regraParada = (P.noiseR < .1 && !s.hidden) ? (s._regraParada || 0) + dt : 0; if (s._regraParada > 18) quebrarRegra(); }
      if (reg.id === 'medo_calmo' && s.fear > 92) quebrarRegra();
    }

    // banner dos modos ativos ao entrar no capítulo
    if (capAnt !== s.chapter) {
      // conquistas do capítulo anterior (se estava num modo o capítulo todo)
      premiarCapitulo();
      capAnt = s.chapter; capCombo = (s.modo6 || []).slice();
      s.regra6ok = s.regraNoite ? true : undefined;
      s._regraLuz = 0; s._regraParada = 0;
      if (bannerFeito !== s.chapter) { bannerFeito = s.chapter; setTimeout(() => mostrarBanner(), 1400); }
      // segredo da segunda jogada: a partir da 2ª noite, a Lia tem um lampejo de déjà-vu no prólogo
      if (s.chapter === 0 && (s._jogos6 || 0) > 1 && !s._dejavu6) { s._dejavu6 = true; setTimeout(() => { if (jogando()) subPequeno('lia', 'Eu já estive aqui. Já andei por esta estrada antes...'); }, 5200); }
      // recorde: capítulo mais longe neste desafio
      const a = assinatura(s);
      if (a) salvarRec(r => { r.melhorCap[a] = Math.max(r.melhorCap[a] || 0, s.chapter); });
    }
  }

  function premiarCapitulo() {
    const s = S(); if (!s || capAnt < 0) return;
    const held = id => capCombo.includes(id) && (s.modo6 || []).includes(id);
    if (held('semesc')) conquista('l6_noseco');
    if (held('vazias')) conquista('l6_vazias');
    if (held('troca')) conquista('l6_trocada');
    if (held('relampago')) conquista('l6_relampago');
    if (held('coracao')) conquista('l6_coracao');
    if (held('cacada')) conquista('l6_cacada');
    if (held('pilha')) conquista('l6_pilha');
    if (held('semluz')) conquista('l6_semluz');
    if (held('fragil')) conquista('l6_fragil');
    if (s.preset6 === 'hardcore') conquista('l6_hardcore');
    if (s.surpresa6) conquista('l6_surpresa');
    if (s.regraNoite && s.regra6ok !== false) conquista('l6_regra');
    // recorde de tempo total ao avançar
    const a = assinatura(s);
    if (a) salvarRec(r => { if (!r.melhorTempo[a] || s.tempo < r.melhorTempo[a]) r.melhorTempo[a] = s.tempo; });
  }

  function mostrarBanner() {
    const s = S(); if (!s || !jogando()) return;
    const nomes = (s.modo6 || []).map(id => (MUTID[id] || {}).nome).filter(Boolean);
    if (s.regraNoite && regraIdx >= 0) { subPequeno('lia', `Regra desta noite: ${REGRAS[regraIdx].txt}.`); }
    else if (nomes.length) { subPequeno('lia', `Esta noite: ${nomes.join(', ')}.`); }
    else if (s.economia6) { subPequeno('lia', s.econTipo6 === 'seca' ? 'Noite seca: faltam curativos.' : s.econTipo6 === 'cheia' ? 'Noite cheia: você achou uma garrafa a mais.' : 'Noite de pilha contada.'); }
  }

  // ---------- morte: mostra a semente e deixa refazer a mesma noite ----------
  let mortePronta = false;
  function telaMorte() {
    const s = S(); if (!s) return;
    const el = $('#death'); if (!el) return;
    let box = $('#l6-morte');
    if (!box) {
      box = document.createElement('div'); box.id = 'l6-morte';
      box.style.cssText = 'font-family:"Special Elite";font-size:12px;color:#8a7f66;margin:10px auto 2px;max-width:640px;line-height:1.7';
      const retry = $('#dt-retry'); if (retry && retry.parentNode) retry.parentNode.insertBefore(box, retry); else el.appendChild(box);
    }
    const cod = codigo(s);
    const ativos = (s.modo6 || []).map(id => (MUTID[id] || {}).nome).filter(Boolean);
    box.innerHTML = `semente desta noite: <b style="color:#c9a75a">${cod}</b>` + (ativos.length ? `<br>modos: ${ativos.join(' · ')}` : '') +
      `<br><button class="btn" id="l6-copiar" style="font-size:12px;margin:8px 6px 0">Copiar semente</button>` +
      `<button class="btn" id="l6-refazer" style="font-size:12px;margin:8px 6px 0">Refazer esta noite</button>`;
    $('#l6-copiar').onclick = () => { try { navigator.clipboard.writeText(cod); } catch (e) {} $('#l6-copiar').textContent = 'Copiado!'; };
    $('#l6-refazer').onclick = () => {
      const seed = s.semente, dif = s.dif;
      const menu = $('#dt-menu'); if (menu) menu.click();
      setTimeout(() => { const d = $('#o-desafio'); if (d) d.value = seed; const sel = $('#o-dif'); if (sel) sel.value = dif; const nv = $('#b-novo'); if (nv) nv.click(); }, 60);
    };
  }

  // ---------- painel de Modos no título ----------
  function montarTitulo() {
    const menu = $('#title .menu'); if (!menu || $('#b-modos6')) return;
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'b-modos6'; b.textContent = 'Modos';
    const alvo = $('#b-stats') || $('#b-opc'); menu.insertBefore(b, alvo ? alvo.nextSibling : null);
    // tela do painel
    const scr = document.createElement('div'); scr.id = 'rejog'; scr.className = 'screen painel'; scr.hidden = true;
    scr.innerHTML = '<div class="wrap"><h2>Modos &amp; Desafios</h2><div id="rejog-corpo"></div>' +
      '<div style="text-align:center;margin-top:18px"><button class="btn" id="rejog-voltar">Voltar</button></div></div>';
    document.body.appendChild(scr);
    b.onclick = () => { render(); $('#title').hidden = true; scr.hidden = false; };
    $('#rejog-voltar').onclick = () => { scr.hidden = true; $('#title').hidden = false; };
  }

  function render() {
    OPT.m6 = (OPT.m6 || []).filter(id => MUTID[id]);
    OPT.tec6 = OPT.tec6 || {};
    const rec = recordes();
    const sel = new Set(OPT.m6);
    const chk = (id, nome, desc, on) => `<label class="it" title="${desc}" style="cursor:pointer"><div><b>${nome}</b><br><small>${desc}</small></div><input type="checkbox" data-mut="${id}" ${on ? 'checked' : ''}></label>`;
    let h = '<p class="pn-resumo">Ligue um ou mais desafios e comece uma noite nova. Recordes e conquistas são à parte da campanha normal.</p>';
    h += `<div style="text-align:center;margin:0 0 14px"><button class="btn" id="rejog-surpresa">Me Surpreenda</button> <button class="btn" id="rejog-limpar">Limpar tudo</button></div>`;
    h += '<h3 style="font-family:\'IM Fell English SC\',Georgia,serif;letter-spacing:.08em;margin:6px 0 8px">Presets</h3>';
    for (const p of PRESETS) h += `<div class="it"><div><b>${p.nome}</b><br><small>${p.desc}</small></div><button class="btn" data-preset="${p.id}">Jogar</button></div>`;
    h += '<h3 style="font-family:\'IM Fell English SC\',Georgia,serif;letter-spacing:.08em;margin:14px 0 8px">Regras da noite</h3>';
    h += chk('@regra', 'Regra da Noite', 'A cada semente, uma regra da casa (não corra, não acenda, não se esconda...). Cumprir dá conquista.', !!OPT.regra6).replace('data-mut="@regra"', 'data-flag="regra6"');
    h += chk('@econ', 'Economia da Noite', 'A semente decide: noite seca (sem curativo), noite cheia (garrafa extra) ou pilha contada.', !!OPT.economia6).replace('data-mut="@econ"', 'data-flag="economia6"');
    h += chk('@desl', 'Deslize (agachar correndo)', 'Tech de movimento: agachar correndo escorrega e abaixa o perfil. Vale na campanha normal.', !!OPT.tec6.deslize).replace('data-mut="@desl"', 'data-tec="deslize"');
    for (const g of GRUPOS) {
      h += `<h3 style="font-family:'IM Fell English SC',Georgia,serif;letter-spacing:.08em;margin:14px 0 8px">${g}</h3>`;
      for (const m of MUT) if (m.gr === g) h += chk(m.id, m.nome, m.desc, sel.has(m.id));
    }
    // código legível do desafio montado
    if (OPT.m6.length) { const letras = OPT.m6.map(id => (MUTID[id] || {}).letra).join(''); h += `<p class="pn-resumo" style="margin-top:14px">Desafio montado: <b style="color:#c9a75a">${OPT.m6.length} mutador${OPT.m6.length > 1 ? 'es' : ''}</b> · código <b>${letras}</b></p>`; }
    // recordes e conquistas
    const linhasRec = [];
    for (const k in (rec.melhorCap || {})) linhasRec.push(`${nomeAssinatura(k)}: até o capítulo ${rec.melhorCap[k] + 1}`);
    let nConq = 0; try { const cq = lsGet('hora-silencio-v2-conq', {}); nConq = CONQ.filter(c => cq[c.id]).length; } catch (e) {}
    h += '<h3 style="font-family:\'IM Fell English SC\',Georgia,serif;letter-spacing:.08em;margin:14px 0 8px">Seus recordes</h3>';
    h += `<div class="it"><div><small>${linhasRec.length ? linhasRec.join('<br>') : 'Ainda sem recordes de modo. Comece uma noite com um desafio ligado.'}<br>Noites de desafio jogadas: ${rec.noites || 0} · conquistas de modo: ${nConq}/${CONQ.length}</small></div></div>`;
    $('#rejog-corpo').innerHTML = h;
    $('#rejog-corpo').querySelectorAll('[data-mut]').forEach(cb => cb.onchange = () => {
      const id = cb.dataset.mut; const set = new Set(OPT.m6);
      cb.checked ? set.add(id) : set.delete(id); OPT.m6 = [...set]; salvarOpt();
    });
    $('#rejog-corpo').querySelectorAll('[data-flag]').forEach(cb => cb.onchange = () => { OPT[cb.dataset.flag] = cb.checked ? 1 : 0; salvarOpt(); });
    $('#rejog-corpo').querySelectorAll('[data-tec]').forEach(cb => cb.onchange = () => { OPT.tec6 = OPT.tec6 || {}; OPT.tec6[cb.dataset.tec] = cb.checked ? 1 : 0; salvarOpt(); });
    $('#rejog-corpo').querySelectorAll('[data-preset]').forEach(btn => btn.onclick = () => iniciarPreset(btn.dataset.preset));
    const su = $('#rejog-surpresa'); if (su) su.onclick = meSurpreenda;
    const li = $('#rejog-limpar'); if (li) li.onclick = () => { OPT.m6 = []; OPT.regra6 = 0; OPT.economia6 = 0; OPT.preset6 = null; salvarOpt(); render(); };
  }
  function nomeAssinatura(k) {
    if (k === 'surpresa') return 'Me Surpreenda';
    if (k.startsWith('preset:')) { const p = PRESETS.find(p => p.id === k.slice(7)); return p ? p.nome : 'Preset'; }
    if (k.startsWith('mut:')) { const ids = []; let r = k.slice(4); for (const m of MUT) if (r.includes(m.id)) ids.push(m.nome); return ids.slice(0, 3).join(', ') + (ids.length > 3 ? '…' : ''); }
    return 'Desafio';
  }
  function iniciarPreset(id) {
    const p = PRESETS.find(p => p.id === id); if (!p) return;
    OPT.m6 = p.mods.slice(); OPT.preset6 = id; OPT.regra6 = 0; OPT.economia6 = 0; salvarOpt();
    $('#rejog').hidden = true; $('#title').hidden = false;
    const nv = $('#b-novo'); if (nv) nv.click();
  }
  function meSurpreenda() {
    // combo aleatório coerente: 1 a 3 mutadores que não se anulam
    const pool = MUT.map(m => m.id).filter(id => !['vazias', 'cacada'].includes(id)); // deixa os pesados de fora do sorteio base
    const n = 1 + (Math.random() * 3 | 0), set = new Set();
    while (set.size < n) set.add(pool[Math.random() * pool.length | 0]);
    // conflitos: semgar/semcura já cabem em vazias; não misturar pernas+relampago estranho é ok
    if (set.has('semgar') && set.has('vazias')) set.delete('semgar');
    OPT.m6 = [...set]; OPT.preset6 = null; OPT.surpresa6 = true;
    OPT.regra6 = Math.random() < .4 ? 1 : 0;
    const difs = ['facil', 'normal', 'normal', 'pesadelo']; const sel = $('#o-dif'); if (sel) sel.value = difs[Math.random() * difs.length | 0];
    salvarOpt();
    $('#rejog').hidden = true; $('#title').hidden = false;
    const nv = $('#b-novo'); if (nv) nv.click();
  }

  function ligar() { try { montarTitulo(); } catch (e) { console.warn('JGL6 título', e); } }

  return { ligar, montarTitulo, novoJogo, mapa, antes, update, tempoMul, bloqueiaEsconderijo, tecla, telaMorte, codigo,
    get regraIdx() { return regraIdx; } };
}
