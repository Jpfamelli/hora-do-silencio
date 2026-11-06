// JOGABILIDADE, LOTE 6 (2ª RODADA) — REJOGABILIDADE: mutadores novos, equipamentos de bolso, cartas entre capítulos
// (pertences, dádivas e contratos), Ascensão, fantasma da melhor corrida, revezamento, arenas e técnicas da veterana.
// Tudo opt-in (painel "Modos") ou ativado só por tecla; o QA e a campanha normal não mudam.
// Ganchos do motor (jogo.js): antes(dt), update(dt), tecla(e), mapa(id), novoJogo(S), telaMorte(), salvarDaMorte(quem),
// portaBarr(porta), e os fatores M.l6bVel / M.l6bOuv lidos pela velocidade e pela audição do Inspetor.
const KEY = 'hora-silencio-l6b';
const STATS_KEY = 'hora-silencio-stats';

// ---------- catálogo de mutadores e equipamentos (opt-in) ----------
const MUT = [
  { id: 'silescuro', gr: 'Ruído', nome: 'Rota de Silêncio', desc: 'No escuro seus passos soam pela metade; com a lanterna acesa, em dobro. Inverte a lógica de segurança.' },
  { id: 'orcamento', gr: 'Ruído', nome: 'Orçamento de Ruído', desc: 'Uma barra de ruído por capítulo: cada passo a gasta e, zerada, o Inspetor sabe onde você está por 10 s. Descansar não recarrega.' },
  { id: 'sapatilha', gr: 'Ruído', nome: 'Sapatilhas de Lã', desc: 'Passos 30% mais baixos em qualquer chão, mas correr cobra o dobro de fôlego.' },
  { id: 'meias', gr: 'Ruído', nome: 'Meias de Lã', desc: 'Passos 35% mais baixos, mas a Lia treme de frio e a lanterna gasta 25% mais pilha.' },
  { id: 'trovao', gr: 'Ruído', nome: 'Cobertura do Trovão', desc: 'Correr logo depois de um trovão soa como andar. O relâmpago avisa a janela.' },
  { id: 'silencioabs', gr: 'Ruído', nome: 'Silêncio Absoluto', desc: 'Desafio: se fizer um barulho de corrida, a fresta vermelha invalida o selo do capítulo. Guarda a noite mais quieta.' },
  { id: 'rangidos', gr: 'Ruído', nome: 'Dobradiças Ruidosas', desc: 'Toda porta que você mexe range alto e chama o Inspetor.' },
  { id: 'batem', gr: 'Ruído', nome: 'Portas Traiçoeiras', desc: 'As portas que você abre fecham sozinhas depois de alguns segundos longe, batendo.' },
  { id: 'manivela', gr: 'Luz', nome: 'Lanterna de Manivela', desc: 'A lanterna nunca gasta pilha, mas só acende enquanto você segura R dando corda, o que faz barulho.' },
  { id: 'fome', gr: 'Itens', nome: 'Fome de Pilha', desc: 'Metade das pilhas que você pega estão gastas e viram pó na mão.' },
  { id: 'doisbolsos', gr: 'Itens', nome: 'Dois Bolsos', desc: 'Só cabem dois consumíveis (pilha, garrafa, curativo) de cada vez no bolso.' },
  { id: 'trouxinha', gr: 'Itens', nome: 'Trouxinha Caída', desc: 'Ao morrer, o que você carregava fica numa trouxinha no ponto da queda. Pegá-la devolve até dois de cada.' },
  { id: 'corredora', gr: 'Jeitos', nome: 'Jeito Corredora', desc: 'Mais fôlego de corrida (+50%), mas correr faz 30% mais barulho.' },
  { id: 'silenciosa', gr: 'Jeitos', nome: 'Jeito Silenciosa', desc: 'Passos 35% mais baixos, mas o fôlego de corrida é bem curto.' },
  { id: 'observadora', gr: 'Jeitos', nome: 'Jeito Observadora', desc: 'A lanterna é 30% mais forte, mas gasta 60% mais pilha.' },
  { id: 'ouvidofino', gr: 'Inimigo', nome: 'Ouvido Fino', desc: 'O Inspetor ouve 25% mais longe a noite inteira.' },
  { id: 'apressado', gr: 'Inimigo', nome: 'Inspetor Apressado', desc: 'O Inspetor anda 15% mais rápido.' },
  { id: 'cicatrizes', gr: 'Corpo', nome: 'Cicatrizes', desc: 'Cada morte deixa uma cicatriz até o fim da noite: mão trêmula, manqueira, olho turvo, fôlego curto ou pilha fraca.' },
  { id: 'escada', gr: 'Corpo', nome: 'Escada do Medo', desc: 'Capítulo sem morrer sobe um degrau (ouvido, velocidade, ruído); cada morte desce um. Termômetro no HUD.' },
  { id: 'relogio', gr: 'Tempo', nome: 'Contagem da Casa', desc: 'A cada 10 minutos reais a casa acorda mais um nível. Aos 45 minutos, caçada permanente.' },
  { id: 'badalada', gr: 'Tempo', nome: 'Contrarrelógio das Badaladas', desc: 'Um sino a cada 6 minutos de capítulo: cada badalada deixa o Inspetor mais rápido e mais atento (até 9).' },
  { id: 'apito', gr: 'Equipamento', nome: 'Apito de Lata [4]', desc: 'Desvia o Inspetor como a garrafa, mas é reutilizável (recarga de 75 s) e alcança menos.' },
  { id: 'guizo', gr: 'Equipamento', nome: 'Barbante com Guizo [5]', desc: 'Segure 5 numa porta por 1,5 s (2 por capítulo): quando alguém passa, o guizo toca e ele olha para lá.' },
  { id: 'cadeira', gr: 'Equipamento', nome: 'Barricar com Cadeira [6]', desc: 'Segure 6 junto de uma porta por 2 s (uma vez por porta): ele precisa arrombar, perde 3 s e faz barulho alto.' },
  { id: 'giz', gr: 'Equipamento', nome: 'Giz da Lia [0]', desc: 'Tecla 0 risca seta, X ou círculo no chão (6 por capítulo). As marcas ficam entre mortes, mas ele apaga as que pisa.' },
  { id: 'isca', gr: 'Equipamento', nome: 'Isca de Bolso [G]', desc: 'Sem garrafa, G arremessa uma moeda: tilinta curto e perto (3 por capítulo).' },
  { id: 'semhud', gr: 'Interface', nome: 'Imersão Total', desc: 'Some todo o HUD, as dicas e os avisos de objetivo. Só a mira e o mundo.' },
  { id: 'semobj', gr: 'Interface', nome: 'Noite sem Bússola', desc: 'O objetivo aparece só no começo do capítulo; depois, "a Lia não lembra".' }
];
const MUTID = Object.fromEntries(MUT.map(m => [m.id, m]));
const GRUPOS = ['Ruído', 'Luz', 'Itens', 'Jeitos', 'Inimigo', 'Corpo', 'Tempo', 'Equipamento', 'Interface'];

// ---------- cartas ----------
const BOONS = {
  meias:    { nome: 'Meias de Lã', ben: 'passos 35% mais baixos', mal: 'a lanterna gasta 25% mais' },
  garrafa:  { nome: 'Garrafa Extra', ben: 'uma garrafa a mais agora', mal: 'o Inspetor ouve 12% mais longe' },
  chaveiro: { nome: 'Chaveiro do Davi', ben: 'na primeira morte do capítulo você cai com 1 de vida e ele recua', mal: 'o chaveiro tilinta se você ficar parada 40 s' },
  rebob:    { nome: 'Fita Rebobinada', ben: 'uma vez, o golpe fatal volta você 20 s no tempo', mal: 'a fita chia: o Inspetor ouve 10% mais longe' },
  cheia:    { nome: 'Pilha Cheia', ben: 'carga total e uma pilha a mais', mal: 'a luz forte chama: com a lanterna acesa ele ouve 10% mais' },
  ferro:    { nome: 'Coração de Ferro', ben: 'o medo sobe 40% mais devagar', mal: 'o fôlego preso acaba 30% mais rápido' },
  leve:     { nome: 'Pé Leve', ben: '50% mais fôlego de corrida', mal: 'os passos soam 20% mais altos' },
  firme:    { nome: 'Mão Firme', ben: 'a câmera quase não treme', mal: 'a vida máxima cai para 85' },
  sorte:    { nome: 'Sorte do Albano', ben: 'a vida se recupera devagar até 70', mal: 'o Inspetor anda 6% mais rápido' }
};
const PERTENCES = {
  cobertor: { nome: 'Cobertor do banco de trás', ben: 'agachada, seus passos quase somem (metade do ruído)' },
  apito:    { nome: 'Apito do Joaquim [4]', ben: 'sopre uma vez por capítulo: o Inspetor vai para o lado' },
  fosforos: { nome: 'Caixa de fósforos', ben: 'com a pilha acabada, F risca um fósforo e dá luz curta (1 por capítulo)' },
  sineta:   { nome: 'Sineta da Celeste [4]', ben: 'toque uma vez por capítulo: a Ana perde 4 s de contagem' }
};
const CONTRATOS = {
  gar:   { nome: 'Nenhuma garrafa', txt: 'não use garrafa neste capítulo' },
  cura:  { nome: 'Sem curativo', txt: 'não use curativo neste capítulo' },
  corre: { nome: 'Sem correr', txt: 'não corra neste capítulo' },
  ar:    { nome: 'Sem prender o ar', txt: 'não prenda a respiração' },
  esc:   { nome: 'Sem esconderijo', txt: 'não entre em armário nem cama' },
  luz:   { nome: 'Lanterna avarenta', txt: 'no máximo 90 s de lanterna acesa' },
  tempo: { nome: 'Sete minutos', txt: 'termine em menos de 7 minutos' },
  bolso: { nome: 'Um item só', txt: 'nunca carregue mais de um consumível' }
};
const ASC = [
  '', 'o Inspetor anda 5% mais rápido', 'ele ouve 8% mais longe', 'a lanterna gasta 20% mais pilha', 'no máximo duas garrafas no bolso',
  'o fôlego de corrida chega só a 85', 'o medo sobe 20% mais depressa', 'o Inspetor anda mais 5% mais rápido', 'a vida máxima cai para 85',
  'ele ouve mais 10% longe', 'correr ecoa pelo prédio em todos os capítulos'
];
const REGRAS_AMIGO = {
  corre:  'não correr',
  luzperto: 'não acender a lanterna com ele a menos de 8 m',
  portaem: 'passar agachada pelas portas',
  parada: 'não ficar parada mais de 10 s',
  cura:   'não usar curativo',
  atras:  'não olhar para trás (Q)'
};
const ARENAS = {
  amanhecer: { nome: 'Amanhecer (0h às 6h)', dur: 720, desc: 'Sobreviva da meia-noite às seis. Cada hora liga uma ameaça nova e o sino das 6h encerra.' },
  semfim: { nome: 'Noite Sem Fim', dur: 99999, desc: 'Badaladas sem parar: a cada badalada a casa troca a ameaça. Entre elas, 15 s para achar pilha ou curativo.' },
  galo: { nome: 'Até o Canto do Galo', dur: 600, desc: 'Dez minutos de sobrevivência. Itens surgem e somem; cada minuto sobe a pressão.' }
};
const CONQ = [
  { id: 'l6b_compasso', nome: 'Fôlego de Ouro', desc: 'Solte o ar na batida do coração 10 vezes seguidas.' },
  { id: 'l6b_sangue', nome: 'Sangue-Frio', desc: 'Chegue a x10 no medidor de sangue-frio.' },
  { id: 'l6b_apagao', nome: 'Apagão Perfeito', desc: 'Apague a lanterna no instante em que ele vira o rosto para você.' },
  { id: 'l6b_olhos', nome: 'Vi com os Ouvidos', desc: 'Deixe o Inspetor passar a menos de 4 m de olhos fechados.' },
  { id: 'l6b_silencio', nome: 'Noite Mais Quieta', desc: 'Termine um capítulo com o Silêncio Absoluto intacto.' },
  { id: 'l6b_dourado', nome: 'Selo Dourado', desc: 'Termine um capítulo antes da terceira badalada no Contrarrelógio.' },
  { id: 'l6b_contrato', nome: 'Palavra Dada', desc: 'Cumpra três contratos de risco.' },
  { id: 'l6b_amanhecer', nome: 'O Sino das Seis', desc: 'Sobreviva ao Amanhecer inteiro.' },
  { id: 'l6b_semfim', nome: 'Décima Badalada', desc: 'Chegue à décima badalada na Noite Sem Fim.' },
  { id: 'l6b_galo', nome: 'Canto do Galo', desc: 'Sobreviva até o canto do galo.' },
  { id: 'l6b_fantasma', nome: 'Mais Rápida que Eu', desc: 'Termine um capítulo antes do seu fantasma.' },
  { id: 'l6b_asc5', nome: 'Ascensão V', desc: 'Termine um capítulo na Ascensão 5 ou mais.' },
  { id: 'l6b_cicatrizes', nome: 'Marcas de Guerra', desc: 'Termine um capítulo com três cicatrizes.' },
  { id: 'l6b_revezamento', nome: 'Dois no Sofá', desc: 'Termine um capítulo no Passa o Controle.' },
  { id: 'l6b_barricada', nome: 'Porta Escorada', desc: 'Faça o Inspetor perder tempo arrombando sua barricada.' },
  { id: 'l6b_guizo', nome: 'Alarme de Lata', desc: 'Ouça o seu guizo tocar quando alguém passa.' }
];

const hash = str => { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const rng = a => () => ((a = (Math.imul(a, 1664525) + 1013904223) >>> 0) / 4294967296);
const sorteia = (ids, n, seed) => { const r = rng(seed), l = ids.slice(); for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; } return l.slice(0, n); };
const mmss = t => { t = Math.max(0, Math.round(t)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };

export function criarJogabilidadeL6B(ctx) {
  const { THREE, scene, P, M, ANA, PROC, W, keys, OPT, SFX, flash, emitNoise, toast, subPequeno, conquista, lsGet, lsSet, salvarOpt,
    ativarInspetor, setDoor, spawnAna, iniciarProcissao, carregarMapa, pularCena, voltarMenu, syncWorld, salasAlcancaveis, pontoEm, interact } = ctx;
  const $ = s => document.querySelector(s);
  const S = () => ctx.S;
  const web = !!navigator.webdriver && !window.__L6B_FORCE; // as técnicas passivas não rodam no QA automático
  const jogando = () => ctx.mode === 'jogo' && !ctx.ui && S() && !S().dead && !S().fim;
  const tem = id => { const s = S(); return !!(s && s.m6b && s.m6b.includes(id)); };
  const rec = () => lsGet(KEY, { arena: {}, quieta: {}, melhorCap: {}, selos: 0, contratos: 0, noites: 0, pts: 0, ascMax: 0 });
  const grava = fn => { const r = rec(); fn(r); lsSet(KEY, r); return r; };
  const algumFinal = () => { try { return Object.keys((lsGet(STATS_KEY, {}) || {}).finais || {}).length > 0; } catch (e) { return false; } };
  const seedNum = () => { try { return hash(S().semente || 'ABCDEF'); } catch (e) { return 7; } };

  try { const R = window.ROTEIRO; for (const c of CONQ) if (!R.conquistas.some(x => x.id === c.id)) R.conquistas.push({ ...c, segredo: true }); } catch (e) {}

  // ---------- memória da noite (sobrevive às mortes, ao contrário do S restaurado do checkpoint) ----------
  const NT = {};
  function nt() {
    const s = S(); if (!s) return null;
    const id = s.id6b || (s.id6b = Math.random().toString(36).slice(2, 8));
    return NT[id] || (NT[id] = { cic: [], esc: 0, giz: [], gizCap: {}, boons: [], pert: null, carta: {}, mortesCap: {}, falhou: {}, perdas: null, hist: [], usado: {}, pts: 0, contratosOk: 0, guizoCap: {}, moedaCap: {}, pertUso: {},
      rev: { atual: 0, mortes: [0, 0], caps: [0, 0], tempo: [0, 0] }, rebob: false, chaveiroCap: {}, amigo: {} });
  }
  const bn = id => { const n = nt(); return !!(n && n.boons.includes(id)); };
  const pert = id => { const n = nt(); return !!(n && n.pert === id); };

  // ---------- HUD próprio ----------
  const estilo = document.createElement('style');
  estilo.textContent = `
#l6b-hud{position:fixed;left:14px;bottom:132px;z-index:5;font:12px/1.55 "Special Elite",monospace;color:#c9bfa3;text-shadow:0 1px 3px #000;pointer-events:none;max-width:320px}
.l6b-l{opacity:.88}.l6b-l.r{color:#d86a5a}.l6b-l.o{color:#c9a75a}.l6b-l.v{color:#7fb98a}
#l6b-olhos{position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:6;transition:opacity .18s}
#l6b-seta{position:fixed;left:50%;top:50%;width:0;height:0;z-index:7;pointer-events:none;opacity:0;transition:opacity .15s}
#l6b-seta span{position:absolute;left:-14px;top:-150px;font-size:26px;color:#9fb4d6;text-shadow:0 0 8px #345}
#l6b-fresta{position:fixed;inset:0;pointer-events:none;z-index:6;box-shadow:inset 0 0 90px 28px rgba(190,30,20,.0);transition:box-shadow .15s}
#l6b-fresta.on{box-shadow:inset 0 0 90px 28px rgba(190,30,20,.75)}
#l6b-olho-turvo{position:fixed;inset:0;pointer-events:none;z-index:4;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 38%,rgba(0,0,0,.62) 100%);opacity:0}
#l6b-cartas,#l6b-rev,#l6b-arena-fim{position:fixed;z-index:20;left:50%;transform:translateX(-50%);background:rgba(8,6,5,.9);border:1px solid #5a4a2a;color:#d8cdb0;font:14px/1.5 "Special Elite",monospace;padding:14px 20px;max-width:min(760px,92vw);text-align:center}
#l6b-cartas{top:9%}#l6b-rev{top:30%;font-size:18px;padding:30px 40px}#l6b-arena-fim{top:24%;padding:26px 34px}
#l6b-cartas b,#l6b-arena-fim b{color:#c9a75a}#l6b-cartas .c{display:inline-block;vertical-align:top;width:210px;margin:6px;padding:8px;border:1px solid #3d3322;text-align:left;font-size:12px}
#l6b-cartas .c i{color:#d86a5a;font-style:normal}
body.l6b-semhud #hud>*:not(#cross):not(#l6b-hud),body.l6b-semhud #legsom,body.l6b-semhud #cron{display:none!important}
body.l6b-semobj #obj-list,body.l6b-semobj #guia{visibility:hidden}
body.l6b-arena #obj{display:none!important}
#l6b-painel h3{font-family:'IM Fell English SC',Georgia,serif;letter-spacing:.08em;margin:14px 0 8px}`;
  document.head.appendChild(estilo);
  const el = (id, pai) => { let e = document.getElementById(id); if (!e) { e = document.createElement('div'); e.id = id; (pai || document.body).appendChild(e); } return e; };
  const linhas = {};
  function linha(id, txt, cls) {
    if (txt == null) { if (linhas[id]) { linhas[id].remove(); delete linhas[id]; } return; }
    let e = linhas[id];
    if (!e) { const h = el('l6b-hud', $('#hud') || document.body); e = linhas[id] = document.createElement('div'); h.appendChild(e); }
    if (e._t !== txt || e._c !== cls) { e.innerHTML = txt; e._t = txt; e._c = cls; e.className = 'l6b-l ' + (cls || ''); }
  }

  // ---------- estado por quadro ----------
  let capAnt = -1, lastCapT = 0, prevFear = null, prevSt = null, prevPilhas = 0, prevGar = 0, prevKits = 0, pickPilhas = 0;
  let orc = 100, orcExp = 0, orcCd = 0, silOk = true, silSeg = 0, silFlash = 0, manT = 0, holdG = 0, holdC = 0;
  let trovT = -99, guizos = [], cadeiras = [], gizMesh = [], trouxa = null, apitoCd = 0, quietoT = 0, chaveiroT = 0, histT = 0;
  let olhosT = 0, olhosPeso = 0, olhosBloq = 0, olhosPerto = false, compasso = { prendia: false, streak: 0 }, apag = { flashAnt: false, cd: 0, ate: 0 };
  let sf = 0, sfMax = 0, mStateAnt = '', cartas = null, ctrLuz = 0, ctrBolsoOk = true, regraT = {}, regraParada = 0, curativosAnt = 0, bannerT = 0;
  let badaladaAnt = 0, relNivelAnt = 0, relCacaT = 0, luzCdOuv = 0;
  let rec_ = { pts: [], t: 0, mortes: 0 }, fant = { mesh: null, amigo: null, j: 0, delta: null }, perfL = 0;
  let ultUpd = 0, revBlk = false, arena = null, revOv = false, itensArena = [], gizTexCache = {};

  const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const bloqueadoXZ = (x, z) => W.colliders.some(c => c.on && x > c.minX - .05 && x < c.maxX + .05 && z > c.minZ - .05 && z < c.maxZ + .05);
  function pontoAdiante(d) {
    const fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw); let lx = P.pos.x, lz = P.pos.z;
    for (let k = .6; k <= d; k += .4) { const x = P.pos.x + fx * k, z = P.pos.z + fz * k; if (bloqueadoXZ(x, z)) break; lx = x; lz = z; }
    return { x: lx, z: lz };
  }
  const portaPerto = max => { let b = null, bd = max; for (const d of W.doors) { const k = Math.hypot(d.x - P.pos.x, d.z - P.pos.z); if (k < bd) { bd = k; b = d; } } return b; };
  const tinta = (cor, a = 1) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: a, depthWrite: false });

  // ---------- recordes / conquistas ----------
  const fatorMut = () => { const s = S(); return 1 + .15 * ((s && s.m6b) ? s.m6b.length : 0) + .1 * ((s && s.asc6b) | 0); };

  // ---------- novo jogo ----------
  function novoJogo(s) {
    s.id6b = Math.random().toString(36).slice(2, 8); delete NT[s.id6b];
    s.m6b = [...new Set((OPT.m6b || []).filter(id => MUTID[id]))];
    s.asc6b = algumFinal() || window.__L6B_FORCE ? Math.max(0, Math.min(10, OPT.asc6b | 0)) : 0;
    s.cartas6b = { ...(OPT.cartas6b || {}) };
    s.arena6b = OPT.arena6b || null; OPT.arena6b = null;
    s.amigo6b = (OPT.amigo6b || []).filter(id => REGRAS_AMIGO[id]).slice(0, 3);
    s.rev6b = OPT.rev6b && OPT.rev6b.on ? { a: OPT.rev6b.a || 'Jogador 1', b: OPT.rev6b.b || 'Jogador 2' } : null;
    s.tec6b = { olhos: 1, compasso: 1, apagao: 1, sangue: 1, ...(OPT.tec6b || {}) };
    capAnt = -1; orc = 100; silOk = true; guizos = []; cadeiras = []; gizMesh = []; trouxa = null; sf = 0; sfMax = 0; cartas = null; arena = null; revOv = false; apitoCd = 0;
    compasso = { prendia: false, streak: 0 }; rec_ = { pts: [], t: 0, mortes: 0 }; fant.j = 0; olhosPeso = 0; olhosBloq = 0; badaladaAnt = 0; relNivelAnt = 0;
    if (s.m6b.length || s.asc6b || s.arena6b || s.rev6b || s.cartas6b.boon || s.cartas6b.ctr || s.cartas6b.pert) grava(r => { r.noites = (r.noites || 0) + 1; });
    if (s.rev6b) { const n = nt(); n.rev.atual = 0; }
    document.body.classList.toggle('l6b-arena', !!s.arena6b);
    for (const id of Object.keys(linhas)) linha(id, null);
  }

  // ---------- por mapa ----------
  function mapa(id) {
    const s = S(); if (!s) return;
    guizos = guizos.filter(g => g.mapa === id); cadeiras = []; gizMesh = []; trouxa = null; itensArena = [];
    const n = nt(); if (!n) return;
    document.body.classList.toggle('l6b-semhud', !!(s.m6b && s.m6b.includes('semhud')));
    document.body.classList.toggle('l6b-arena', !!s.arena6b);
    try {
      // giz: as marcas voltam depois da morte, na mesma noite
      if (tem('giz') && W.grupo) for (const g of n.giz) if (g.mapa === id) pintaGiz(g);
      // trouxinha caída
      if (tem('trouxinha') && n.perdas && n.perdas.mapa === id && n.perdas.cap === s.chapter) criaTrouxa(n.perdas);
      // guizos desta sala continuam
      for (const g of guizos) pendura(g);
      // barricadas se perdem ao trocar de mapa (as portas voltam ao normal)
      // fantasma
      fantasma(id);
    } catch (e) { console.warn('L6B mapa', e); }
    if (s.arena6b && id === 'estrada') { setTimeout(() => { try { if (ctx.mode === 'cena') pularCena(); } catch (e) {} }, 400); }
  }

  // ---------- antes do movimento: fator de ruído ----------
  function antes(dt) {
    const s = S(); if (!s || !jogando()) return;
    let f = 1;
    if (tem('silescuro')) { const esc = P.room && !P.room.fora && !s.flashOn; f *= esc ? .5 : (s.flashOn ? 2 : 1); }
    if (tem('sapatilha')) f *= .7;
    if (tem('meias') || bn('meias')) f *= .65;
    if (tem('silenciosa')) f *= .65;
    if (tem('corredora') && P.sprinting) f *= 1.3;
    if (bn('leve')) f *= 1.2;
    if (pert('cobertor') && P.crouch) f *= .5;
    if (tem('trovao') && P.sprinting) { try { if (ctx.trovao()) trovT = ctx.perf; } catch (e) {} if (ctx.perf - trovT < 2.2) f *= 6.5 / 20; }
    const n = nt();
    if (n && tem('escada')) f *= 1 + .05 * n.esc;
    if (n && tem('cicatrizes') && n.cic.includes('manca')) f *= 1.25;
    P.ruido6 = (P.ruido6 || 1) * f;
    if ((s.asc6b | 0) >= 10) P.ecoSempre6 = true;
  }

  // ---------- por quadro ----------
  function update(dt) {
    M.l6bVel = 1; M.l6bOuv = 1;
    const s = S(); if (!s || !jogando()) { documentoOlhos(false); return; }
    const n = nt(); perfL = ctx.perf;
    const asc = s.asc6b | 0;

    // troca de capítulo: fecha o anterior (contrato, pontos, escada, fantasma) e abre o novo (cartas, banners)
    if (capAnt !== s.chapter) {
      if (capAnt >= 0 && s.chapter > capAnt && ctx.perf - ultUpd < 20) fecharCap(capAnt, s, n);
      capAnt = s.chapter; iniciarCap(s, n);
    }
    lastCapT = s.capT; ultUpd = ctx.perf;

    // fatores do Inspetor
    let vel = 1, ouv = 1;
    if (asc >= 1) vel *= 1.05; if (asc >= 7) vel *= 1.05; if (asc >= 2) ouv *= 1.08; if (asc >= 9) ouv *= 1.1;
    if (tem('apressado')) vel *= 1.15; if (tem('ouvidofino')) ouv *= 1.25;
    if (tem('escada')) { vel *= 1 + .04 * n.esc; ouv *= 1 + .06 * n.esc; }
    if (bn('garrafa')) ouv *= 1.12; if (bn('rebob')) ouv *= 1.1; if (bn('cheia') && s.flashOn) ouv *= 1.1; if (bn('sorte')) vel *= 1.06;
    if (tem('relogio')) { const nv = Math.floor(s.tempo / 600); vel *= 1 + .06 * nv; ouv *= 1 + .08 * nv; if (nv !== relNivelAnt) { relNivelAnt = nv; if (nv > 0) { toast(`A casa acordou mais um pouco. Nível ${nv}.`); try { SFX.sino(.35); } catch (e) {} } } }
    if (tem('badalada')) { const b = Math.min(9, Math.floor(s.capT / 360)); vel *= 1 + .1 * b; ouv *= 1 + .1 * b; if (b !== badaladaAnt) { badaladaAnt = b; if (b > 0) { toast(`Badalada ${b}. Ele está mais atento.`); try { SFX.sino(.55); } catch (e) {} } } }
    if (apag.ate > ctx.perf) ouv *= .4;
    if (arena) { vel *= arena.vel; ouv *= arena.ouv; }
    M.l6bVel = vel; M.l6bOuv = ouv;

    // lanterna / pilha
    let extra = 0;
    if (s.flashOn) { if (tem('meias') || bn('meias')) extra += .06; if (tem('observadora')) extra += .14; if ((asc >= 3)) extra += .05; if (n.cic.includes('pilha')) extra += .03; }
    if (extra) s.battery = Math.max(0, s.battery - extra * dt);
    if (tem('observadora') && s.flashOn && flash) flash.intensity *= 1.3;
    if (tem('manivela')) {
      const q = !!keys.KeyR && s.inv.lanterna; s.flashOn = q; s.battery = 100; s.inv.pilhas = 0;
      if (q) { manT -= dt; if (manT <= 0) { manT = .55; emitNoise(P.pos.x, P.pos.z, 3.2, true); try { SFX.clique(); } catch (e) {} } }
      linha('man', q ? 'manivela: girando' : 'segure R para dar corda', q ? 'o' : '');
    }
    if (bn('cheia') && !n.usado.cheia) { n.usado.cheia = 1; s.battery = 100; s.inv.pilhas++; }
    if (bn('garrafa') && !n.usado.garrafa) { n.usado.garrafa = 1; s.inv.garrafas++; }

    // fôlego, medo, vida
    if (prevSt != null && s.stamina < prevSt) {
      const gasto = prevSt - s.stamina;
      if (tem('corredora') || bn('leve')) s.stamina = Math.min(100, s.stamina + gasto * .33);
      if (tem('sapatilha')) s.stamina = Math.max(0, s.stamina - gasto);
    }
    if (tem('silenciosa')) s.stamina = Math.min(s.stamina, 60);
    if (asc >= 5) s.stamina = Math.min(s.stamina, 85);
    if (n.cic.includes('folego')) s.stamina = Math.min(s.stamina, 100 - 12 * n.cic.filter(c => c === 'folego').length);
    if (prevFear != null && s.fear > prevFear) {
      let k = 1; if (bn('ferro')) k *= .6; if (asc >= 6) k *= 1.2; if (olhosT > 0) k *= .4; if (tem('escada')) k *= 1 + .03 * n.esc;
      if (k !== 1) s.fear = Math.min(100, prevFear + (s.fear - prevFear) * k);
    }
    if (bn('ferro') && P.prende) s.ar = Math.max(0, s.ar - 4 * dt);
    if (bn('firme')) { P.shake = Math.min(P.shake, .004); s.health = Math.min(s.health, 85); }
    if (asc >= 8) s.health = Math.min(s.health, 85);
    if (bn('sorte') && s.health < 70) s.health = Math.min(70, s.health + dt / 12);
    if (n.cic.includes('mao')) P.shake = Math.max(P.shake, .012);
    if (tem('cicatrizes')) { const turvo = $('#l6b-olho-turvo') || el('l6b-olho-turvo'); turvo.style.opacity = n.cic.includes('olho') ? .85 : 0; }
    prevFear = s.fear; prevSt = s.stamina;
    if (asc >= 4) s.inv.garrafas = Math.min(s.inv.garrafas, 2);

    // itens
    if (tem('fome')) {
      if (s.inv.pilhas > prevPilhas) { pickPilhas += s.inv.pilhas - prevPilhas; if (pickPilhas % 2 === 0) { s.inv.pilhas--; toast('Essa pilha estava gasta: virou pó na sua mão.'); } }
    }
    prevPilhas = s.inv.pilhas;
    if (tem('doisbolsos')) {
      let tot = s.inv.pilhas + s.inv.garrafas + s.inv.kits, guard = 0;
      while (tot > 2 && guard++ < 9) {
        const k = ['pilhas', 'garrafas', 'kits'].reduce((a, b) => s.inv[b] > s.inv[a] ? b : a); s.inv[k]--; tot--;
        if (!s._bolso6b) { s._bolso6b = true; toast('O bolso só aguenta dois itens. O resto ficou para trás.'); }
      }
    }

    // portas
    if (tem('rangidos') || tem('batem')) for (const d of W.doors) {
      const perto = dist(d, P.pos) < 3.6;
      if (tem('rangidos') && d._o6b !== undefined && d._o6b !== d.open && perto) emitNoise(d.x, d.z, 8, true);
      d._o6b = d.open;
      if (tem('batem')) { if (d.open && !d.arrombada) { if (!d._ab6b) d._ab6b = perfL; else if (perfL - d._ab6b > 6 && dist(d, P.pos) > 3.3) { d._ab6b = 0; setDoor(d, false); toast('Uma porta bateu lá atrás.'); } } else d._ab6b = 0; }
    }

    // orçamento de ruído
    if (tem('orcamento')) {
      if (P.noiseR > 0) orc = Math.max(0, orc - dt * P.noiseR * .35);
      orcCd -= dt;
      if (orc <= 0 && orcCd <= 0 && P.noiseR > 0) { orcExp = 10; orcCd = 28; toast('O orçamento de ruído acabou: ele sabe onde você está.'); }
      if (orcExp > 0) { orcExp -= dt; if ((s._orcT = (s._orcT || 0) - dt) <= 0) { s._orcT = .8; emitNoise(P.pos.x, P.pos.z, 14, true); } }
      linha('orc', `ruído restante ${Math.round(orc)}%` + (orcExp > 0 ? ' · exposta' : ''), orc < 25 ? 'r' : '');
    }
    // silêncio absoluto
    if (tem('silencioabs')) {
      if (P.noiseR >= 10 && silOk) { silOk = false; silFlash = 1; toast('Barulho demais: o selo de silêncio deste capítulo caiu.'); }
      if (P.noiseR > 5) silSeg += dt;
      if (silFlash > 0) { silFlash -= dt; $('#l6b-fresta') || el('l6b-fresta'); $('#l6b-fresta').classList.add('on'); } else if ($('#l6b-fresta')) $('#l6b-fresta').classList.remove('on');
      linha('sil', silOk ? 'silêncio absoluto: intacto' : 'silêncio absoluto: quebrado', silOk ? 'v' : 'r');
    }

    // modos de interface
    if (tem('semobj')) {
      const ligado = s.capT > 16;
      document.body.classList.toggle('l6b-semobj', ligado);
      linha('obj', ligado ? 'a Lia não lembra o que fazer…' : null, 'o');
    } else document.body.classList.remove('l6b-semobj');

    // escada / relógio / badalada no HUD
    if (tem('escada')) linha('esc', 'degrau ' + '▮'.repeat(n.esc) + '▯'.repeat(Math.max(0, 8 - n.esc)), n.esc >= 5 ? 'r' : '');
    if (tem('relogio')) { const t = s.tempo, caca = t >= 2700; linha('rel', `a casa acorda: nível ${Math.floor(t / 600)} · ${mmss(t)}${caca ? ' · caçada' : ''}`, caca ? 'r' : ''); if (caca && M.ativo) { relCacaT -= dt; if (relCacaT <= 0) { relCacaT = 8; emitNoise(P.pos.x, P.pos.z, 40, true); } } }
    if (tem('badalada')) linha('bad', `próxima badalada em ${mmss(360 - (s.capT % 360))} · ${badaladaAnt}/9`, badaladaAnt >= 3 ? 'r' : '');
    if (tem('cicatrizes') && n.cic.length) linha('cic', 'cicatrizes: ' + n.cic.length, 'r'); else linha('cic', null);

    equipamentos(s, n, dt);
    tecnicas(s, n, dt);
    contratosEregras(s, n, dt);
    fantasmaTick(s, n, dt);
    revTick(s, n, dt);
    cartasTick(s, n, dt);
    if (s.arena6b) arenaTick(s, n, dt);
    historia(s, n, dt);
  }

  // ---------- início / fim de capítulo ----------
  function iniciarCap(s, n) {
    orc = 100; silOk = true; silSeg = 0; badaladaAnt = 0; ctrLuz = 0; ctrBolsoOk = true; regraParada = 0; regraT = {}; rec_ = { pts: [], t: 0, mortes: n.mortesCap[s.chapter] || 0 };
    curativosAnt = s.inv.kits; prevGar = s.inv.garrafas; fant.j = 0; apitoCd = 0;
    if (OPT.fant6b && !web) { fant.alvo = (lsGet(KEY + '-fant', {})[s.chapter]) || null; fant.amigoD = (lsGet(KEY + '-fant-amigo', {})[s.chapter]) || null; } else { fant.alvo = fant.amigoD = null; }
    document.body.classList.remove('l6b-semobj');
    const best = rec().melhorCap[s.chapter];
    if (best && !s.arena6b) setTimeout(() => { if (jogando() && s.capT < 12) linha('best', `seu melhor neste capítulo: ${mmss(best)}`, 'o'); setTimeout(() => linha('best', null), 6000); }, 1200);
    if (s.arena6b) return;
    if (!n.carta[s.chapter]) ofertar(s, n);
  }
  function fecharCap(old, s, n) {
    const tempo = lastCapT, morreu = !!n.mortesCap[old];
    // contrato do capítulo
    const c = n.carta[old] && n.carta[old].ctr;
    let ok = false;
    if (c) {
      ok = !n.falhou[old] && (c !== 'tempo' || tempo <= 420) && (c !== 'luz' || ctrLuz <= 90) && (c !== 'bolso' || ctrBolsoOk);
      if (ok) { n.contratosOk++; grava(r => { r.selos = (r.selos || 0) + 1; r.contratos = (r.contratos || 0) + 1; }); toast(`Contrato cumprido: ${CONTRATOS[c].nome}. Selo novo e multiplicador ×1,25.`); if (rec().contratos >= 3) conquista('l6b_contrato'); }
      else toast(`Contrato quebrado: ${CONTRATOS[c].nome}. Sem selo desta vez.`);
    }
    // regras do amigo
    let amigoMsg = '';
    if (s.amigo6b && s.amigo6b.length) { const q = Object.values(n.amigo).reduce((a, b) => a + b, 0); amigoMsg = q ? ` Carimbo: quebrou a regra do amigo (${q}×).` : ' Todas as regras do amigo foram cumpridas.'; n.amigo = {}; }
    // pontos de rejogo
    const mult = fatorMut() * (ok ? 1.25 : 1) * (s.amigo6b && s.amigo6b.length && !amigoMsg.includes('quebrou') ? 1.1 : 1);
    const pts = Math.round(1000 * mult * (1 + sf / 200)); n.pts += pts;
    grava(r => { r.pts = Math.max(r.pts || 0, n.pts); });
    if (mult > 1.01 || n.pts) setTimeout(() => toast(`+${pts} pontos de rejogo (×${mult.toFixed(2).replace('.', ',')}).${amigoMsg}`), 1500);
    // escada, recordes, conquistas
    if (tem('escada') && !morreu) n.esc = Math.min(8, n.esc + 1);
    if (!morreu) grava(r => { if (!r.melhorCap[old] || tempo < r.melhorCap[old]) r.melhorCap[old] = Math.round(tempo); });
    if (tem('silencioabs')) { if (silOk) conquista('l6b_silencio'); grava(r => { r.quieta[old] = Math.min(r.quieta[old] == null ? 9999 : r.quieta[old], Math.round(silSeg)); }); }
    if (tem('badalada') && tempo < 1080) { conquista('l6b_dourado'); toast('Selo dourado: antes da terceira badalada.'); }
    if ((s.asc6b | 0) >= 5) conquista('l6b_asc5');
    if (tem('cicatrizes') && n.cic.length >= 3) conquista('l6b_cicatrizes');
    if (s.rev6b) conquista('l6b_revezamento');
    // fantasma: só vale corrida limpa
    salvarFantasma(old, tempo, morreu);
    if (s.rev6b) { n.rev.caps[n.rev.atual]++; trocarJogador(`${nomeAtual(s, n)} fechou o capítulo. Passe o teclado.`, s, n); }
  }

  // ---------- cartas (pertence, dádivas, contratos) ----------
  function ofertar(s, n) {
    const cap = s.chapter, c = s.cartas6b || {}, seed = seedNum() + cap * 131;
    const reg = n.carta[cap] = { ofB: [], ofC: [], boon: null, ctr: null, pert: null };
    if (cap === 0 && c.pert) reg.ofB = sorteia(Object.keys(PERTENCES), 3, seed), reg.tipo = 'pert';
    else if (cap > 0 && c.boon) reg.ofB = sorteia(Object.keys(BOONS).filter(id => !n.boons.includes(id)), 3, seed), reg.tipo = 'boon';
    if (c.ctr) reg.ofC = sorteia(Object.keys(CONTRATOS), 3, seed + 77);
    if (!reg.ofB.length && !reg.ofC.length) return;
    cartas = { cap, t: 22 };
    desenhaCartas(reg);
  }
  function desenhaCartas(reg) {
    const box = el('l6b-cartas'); box.hidden = false;
    let h = '';
    if (reg && reg.ofB.length && !reg.boon && !(reg.pert)) {
      h += `<div><b>${reg.tipo === 'pert' ? 'Leve um pertence do banco de trás' : 'Dádivas da Hora'}</b> · aperte 1, 2 ou 3</div>`;
      reg.ofB.forEach((id, i) => { const d = reg.tipo === 'pert' ? PERTENCES[id] : BOONS[id]; h += `<div class="c"><b>${i + 1} · ${d.nome}</b><br>${d.ben}${d.mal ? `<br><i>custo: ${d.mal}</i>` : ''}</div>`; });
    }
    if (reg && reg.ofC.length && !reg.ctr) {
      h += `<div style="margin-top:6px"><b>Contratos de risco</b> · aperte 7, 8 ou 9 (ou ignore: recusar é grátis)</div>`;
      reg.ofC.forEach((id, i) => { h += `<div class="c"><b>${i + 7} · ${CONTRATOS[id].nome}</b><br>${CONTRATOS[id].txt}<br><i>vale ×1,25 e um selo</i></div>`; });
    }
    box.innerHTML = h; box.style.display = h ? '' : 'none';
  }
  function escolher(tipo, i, s, n) {
    const reg = n.carta[s.chapter]; if (!reg) return false;
    if (tipo === 'b' && reg.ofB[i] && !reg.boon && !reg.pert) {
      const id = reg.ofB[i];
      if (reg.tipo === 'pert') { reg.pert = id; n.pert = id; toast(`Você leva: ${PERTENCES[id].nome}.`); } else { reg.boon = id; n.boons.push(id); toast(`Dádiva: ${BOONS[id].nome}. Custo: ${BOONS[id].mal}.`); }
    } else if (tipo === 'c' && reg.ofC[i] && !reg.ctr) {
      reg.ctr = reg.ofC[i]; toast(`Contrato aceito: ${CONTRATOS[reg.ctr].txt}.`);
    } else return false;
    desenhaCartas(reg);
    if ((!reg.ofB.length || reg.boon || reg.pert) && (!reg.ofC.length || reg.ctr)) fechaCartas();
    return true;
  }
  function fechaCartas() { cartas = null; const b = $('#l6b-cartas'); if (b) { b.style.display = 'none'; } }
  function cartasTick(s, n, dt) {
    const reg = n.carta[s.chapter];
    if (cartas && cartas.cap === s.chapter) {
      cartas.t -= dt;
      if (cartas.t <= 0) { // sem resposta: a noite escolhe a primeira dádiva; contrato fica recusado
        if (reg && reg.ofB.length && !reg.boon && !reg.pert) escolher('b', 0, s, n);
        if (reg) { reg.ofC = reg.ctr ? reg.ofC : []; }
        fechaCartas();
      }
    }
    const lst = n.boons.map(id => BOONS[id].nome).concat(n.pert ? [PERTENCES[n.pert].nome] : []);
    const ct = reg && reg.ctr;
    if (lst.length || ct) linha('cartas', (lst.length ? 'cartas: ' + lst.join(' · ') : '') + (ct ? `<br>contrato: ${CONTRATOS[ct].nome} ${n.falhou[s.chapter] ? '✗' : '…'}` : ''), n.falhou[s.chapter] ? 'r' : 'o'); else linha('cartas', null);
    // chaveiro: tilinta parada
    if (bn('chaveiro')) { if (P.noiseR < .1 && !s.hidden) { chaveiroT += dt; if (chaveiroT > 40) { chaveiroT = 0; emitNoise(P.pos.x, P.pos.z, 3, true); toast('[o chaveiro do Davi tilintou]'); try { SFX.vidro(P.pos.x, P.pos.z); } catch (e) {} } } else chaveiroT = 0; }
  }
  // quando a vida zera: chaveiro e fita rebobinada seguram o golpe
  function salvarDaMorte(quem) {
    const s = S(); if (!s || s.arena6b && false) return 0; const n = nt(); if (!n) return 0;
    if (bn('chaveiro') && !n.chaveiroCap[s.chapter]) {
      n.chaveiroCap[s.chapter] = 1; toast('O Davi segurou a sua mão. Você cai com 1 de vida.'); subPequeno('lia', 'O Davi segurou minha mão.');
      M.recuo = Math.max(M.recuo || 0, 6); return 1;
    }
    if (bn('rebob') && !n.rebob) {
      n.rebob = true; const alvo = ctx.perf - 20; let h = n.hist[0];
      for (const x of n.hist) if (x.t <= alvo) h = x;
      if (h && h.mapa === W.mapa) { P.pos.set(h.x, 0, h.z); } toast('A fita chiou e voltou. Você está 20 segundos atrás.');
      const f = $('#fx-black'); if (f) { f.style.transition = 'none'; f.style.opacity = .85; setTimeout(() => { f.style.transition = 'opacity 1s'; f.style.opacity = 0; }, 120); }
      M.recuo = Math.max(M.recuo || 0, 8); return 35;
    }
    return 0;
  }

  // ---------- contratos e regras do amigo ----------
  function contratosEregras(s, n, dt) {
    const reg = n.carta[s.chapter], c = reg && reg.ctr, cap = s.chapter;
    const falha = () => { if (!n.falhou[cap]) { n.falhou[cap] = 1; toast(`Contrato quebrado: ${CONTRATOS[c].nome}.`); } };
    if (s.flashOn) ctrLuz += dt;
    if (c) {
      if (c === 'gar' && s.inv.garrafas < prevGar) falha();
      if (c === 'cura' && s.inv.kits < curativosAnt) falha();
      if (c === 'corre' && P.sprinting) falha();
      if (c === 'ar' && P.prende) falha();
      if (c === 'esc' && s.hidden) falha();
      if (c === 'luz' && ctrLuz > 90) falha();
      if (c === 'tempo' && s.capT > 420) falha();
      if (c === 'bolso' && s.inv.pilhas + s.inv.garrafas + s.inv.kits > 1) { ctrBolsoOk = false; falha(); }
    }
    // regras do amigo
    const quebra = id => { if (!s.amigo6b || !s.amigo6b.includes(id)) return; n.amigo[id] = (n.amigo[id] || 0) + 1; if (!regraT[id]) { regraT[id] = 1; toast(`Regra do amigo quebrada: ${REGRAS_AMIGO[id]}.`); } };
    if (s.amigo6b && s.amigo6b.length) {
      if (P.sprinting) quebra('corre');
      if (s.flashOn && M.ativo && dist(M.pos, P.pos) < 8) quebra('luzperto');
      if (s.inv.kits < curativosAnt) quebra('cura');
      if (keys.KeyQ) quebra('atras');
      if (P.noiseR < .1 && !s.hidden) { regraParada += dt; if (regraParada > 10) { regraParada = 0; quebra('parada'); } } else regraParada = 0;
      if (!P.crouch && P.noiseR > 0) for (const d of W.doors) if (dist(d, P.pos) < .8 && !d._am6b) { d._am6b = 1; quebra('portaem'); } else if (dist(d, P.pos) > 1.6) d._am6b = 0;
      linha('amigo', 'regras do amigo: ' + s.amigo6b.map(id => REGRAS_AMIGO[id] + (n.amigo[id] ? ' ✗' : '')).join(' · '), 'o');
    }
    prevGar = s.inv.garrafas; curativosAnt = s.inv.kits;
  }

  // ---------- equipamentos [4] [5] [6] [0] G ----------
  function equipamentos(s, n, dt) {
    apitoCd = Math.max(0, apitoCd - dt);
    const partes = [];
    if (tem('apito')) partes.push(`[4] apito ${apitoCd > 0 ? Math.ceil(apitoCd) + 's' : 'pronto'}`);
    if (tem('guizo')) partes.push(`[5] guizo ×${2 - (n.guizoCap[s.chapter] || 0)}`);
    if (tem('cadeira')) partes.push('[6] cadeira');
    if (tem('giz')) partes.push(`[0] giz ×${6 - (n.gizCap[s.chapter] || 0)}`);
    if (tem('isca')) partes.push(`[G] moeda ×${3 - (n.moedaCap[s.chapter] || 0)}`);
    if (pert('apito') || pert('sineta')) partes.push(`[4] ${pert('apito') ? 'apito' : 'sineta'} ${n.pertUso[s.chapter] ? '(usado)' : ''}`);
    linha('tools', partes.length ? partes.join(' · ') : null);
    // segurar 5: guizo
    if (tem('guizo') && keys.Digit5 && !s.hidden) {
      if (holdG >= 0) { holdG += dt; linha('hg', `pendurando o guizo… ${Math.min(100, Math.round(holdG / 1.5 * 100))}%`, 'o'); if (holdG >= 1.5) { holdG = -1; penduraGuizo(s, n); linha('hg', null); } }
    } else { if (!keys.Digit5) holdG = 0; linha('hg', null); }
    // segurar 6: cadeira
    if (tem('cadeira') && keys.Digit6 && !s.hidden) {
      if (holdC >= 0) { holdC += dt; linha('hc', `escorando a porta… ${Math.min(100, Math.round(holdC / 2 * 100))}%`, 'o'); if (holdC >= 2) { holdC = -1; barricar(s, n); linha('hc', null); } }
    } else { if (!keys.Digit6) holdC = 0; linha('hc', null); }
    // guizos tocando
    for (let i = guizos.length - 1; i >= 0; i--) {
      const g = guizos[i]; if (g.mapa !== W.mapa) continue;
      const quem = (M.ativo && dist(M.pos, g) < 1.4) ? M : (ANA.ativa && dist(ANA.pos, g) < 1.4) ? ANA : null;
      if (quem) {
        try { SFX.vidro(g.x, g.z); } catch (e) {}
        toast(dist(g, P.pos) < 25 ? '[o guizo tocou — alguém passou por ali]' : '[um tilintar ao longe]');
        if (quem === M) { M.olhar = new THREE.Vector3(g.x, 0, g.z); M.olharT = 1.6; }
        if (g.mesh && g.mesh.parent) g.mesh.parent.remove(g.mesh); guizos.splice(i, 1); conquista('l6b_guizo');
      }
    }
    // cadeiras: o jogador pode puxar de volta abrindo a porta
    for (const c of cadeiras) if (c.d.barr6b && c.d.open) { c.d.barr6b = false; if (c.mesh.parent) c.mesh.parent.remove(c.mesh); toast('Você puxa a cadeira de volta.'); emitNoise(c.d.x, c.d.z, 3, true); }
    // marcas de giz: ele apaga as que pisa
    for (let i = gizMesh.length - 1; i >= 0; i--) {
      const g = gizMesh[i]; if (M.ativo && dist(M.pos, g.dado) < 1.1) {
        try { SFX.clique(); } catch (e) {} toast('[o giz estalou sob o pé dele]');
        if (g.mesh.parent) g.mesh.parent.remove(g.mesh); gizMesh.splice(i, 1); const k = n.giz.indexOf(g.dado); if (k >= 0) n.giz.splice(k, 1);
      }
    }
  }
  function penduraGuizo(s, n) {
    if ((n.guizoCap[s.chapter] || 0) >= 2) { toast('Você já usou os dois guizos deste capítulo.'); return; }
    const d = portaPerto(3.2); if (!d) { toast('Chegue perto de uma porta para pendurar o guizo.'); return; }
    n.guizoCap[s.chapter] = (n.guizoCap[s.chapter] || 0) + 1;
    const g = { x: d.x, z: d.z, mapa: W.mapa }; guizos.push(g); pendura(g);
    emitNoise(P.pos.x, P.pos.z, 1.5, true); toast('Guizo pendurado na porta.');
  }
  function pendura(g) {
    if (!W.grupo) return;
    const m = new THREE.Group();
    const sino = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), new THREE.MeshBasicMaterial({ color: 0xd8b24a })); sino.position.y = 1.7;
    const fio = new THREE.Mesh(new THREE.CylinderGeometry(.004, .004, .35, 4), new THREE.MeshBasicMaterial({ color: 0xcfc6a8 })); fio.position.y = 1.88;
    m.add(sino, fio); m.position.set(g.x, 0, g.z); W.grupo.add(m); g.mesh = m;
  }
  function barricar(s, n) {
    const d = portaPerto(2.4); if (!d) { toast('Chegue perto de uma porta para escorá-la.'); return; }
    const k = W.mapa + ':' + (d.id || d.x + ',' + d.z); n.usado.cad = n.usado.cad || {};
    if (n.usado.cad[k]) { toast('Essa porta já teve a sua cadeira.'); return; }
    if (d.trava && d.trava()) { toast('Está trancada: não precisa.'); return; }
    n.usado.cad[k] = 1; setDoor(d, false, true); d.barr6b = true; d._barrT0 = 0;
    const m = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: 0x6b4a2a });
    const as = new THREE.Mesh(new THREE.BoxGeometry(.4, .05, .4), mat); as.position.y = .45;
    const en = new THREE.Mesh(new THREE.BoxGeometry(.4, .5, .05), mat); en.position.set(0, .75, d.eixo === 'x' ? -.2 : -.2);
    m.add(as, en); m.position.set(d.x + (d.eixo === 'x' ? 0 : .45), 0, d.z + (d.eixo === 'x' ? .45 : 0)); m.rotation.y = d.eixo === 'x' ? 0 : Math.PI / 2; W.grupo.add(m);
    cadeiras.push({ d, mesh: m });
    emitNoise(d.x, d.z, 9, true); try { SFX.pancada(d.x, d.z); } catch (e) {}
    toast('Cadeira escorada na porta. Foi barulhento.');
  }
  // chamado pelo motor quando o Inspetor tenta abrir uma porta barricada; devolve true para segurar a porta
  function portaBarr(dr) {
    if (!dr || !dr.barr6b) return false;
    if (!dr._barrT0) dr._barrT0 = ctx.perf;
    M.wait = Math.max(M.wait || 0, .6); try { SFX.pancada(dr.x, dr.z); } catch (e) {}
    if (ctx.perf - dr._barrT0 >= 3) {
      dr.barr6b = false; dr._barrT0 = 0; dr.arrombada = true; setDoor(dr, true, true); emitNoise(dr.x, dr.z, 16);
      const c = cadeiras.find(x => x.d === dr); if (c && c.mesh.parent) c.mesh.parent.remove(c.mesh);
      toast('A cadeira estalou: ele arrombou a porta.'); conquista('l6b_barricada');
    }
    return true;
  }
  function tecla(e) {
    const s = S(); if (!s || !jogando()) return false;
    const n = nt(); if (!n) return false;
    if (revOv) return true;
    if (cartas) {
      const m = /^Digit([123789])$/.exec(e.code);
      if (m) { const d = +m[1]; if (escolher(d <= 3 ? 'b' : 'c', d <= 3 ? d - 1 : d - 7, s, n)) return true; }
    }
    if (e.code === 'Digit4') {
      if (tem('apito') && apitoCd <= 0) { apitoCd = 75; const p = pontoAdiante(9); emitNoise(p.x, p.z, 9, false, true); toast('Você sopra o apito de lata.'); try { SFX.clique(); } catch (er) {} return true; }
      if (tem('apito')) { toast('O apito ainda está esfriando.'); return true; }
      if ((pert('apito') || pert('sineta')) && !n.pertUso[s.chapter]) {
        n.pertUso[s.chapter] = 1;
        if (pert('apito')) { const p = pontoAdiante(10); emitNoise(p.x, p.z, 12, false, true); toast('O apito do Joaquim soa lá na frente.'); }
        else { ANA.contaT = Math.max(ANA.contaT || 0, 4); const p = pontoAdiante(6); emitNoise(p.x, p.z, 3, false, true); toast('A sineta tocou: a Ana perde o compasso por 4 s.'); }
        return true;
      }
    }
    if (e.code === 'Digit0' && tem('giz')) { giz(s, n); return true; }
    if (e.code === 'KeyG' && tem('isca') && !s.hidden && s.inv.garrafas <= 0) {
      if ((n.moedaCap[s.chapter] || 0) >= 3) { toast('Sem moedas neste capítulo.'); return true; }
      n.moedaCap[s.chapter] = (n.moedaCap[s.chapter] || 0) + 1; const p = pontoAdiante(8);
      emitNoise(p.x, p.z, 6, false, true); try { SFX.vidro(p.x, p.z); } catch (er) {} toast('Uma moeda tilintou ao longe.'); return true;
    }
    if (e.code === 'KeyR' && tem('manivela')) return true;
    if (e.code === 'KeyF' && tem('manivela')) { toast('A lanterna de manivela só acende com R segurado.'); return true; }
    if (e.code === 'KeyF' && pert('fosforos') && !n.pertUso[s.chapter] && s.inv.lanterna && s.battery <= 0 && s.inv.pilhas <= 0) {
      n.pertUso[s.chapter] = 1; s.battery = 3; s.flashOn = true; toast('Você risca um fósforo: a luz dura pouco.'); return true;
    }
    return false;
  }
  function giz(s, n) {
    if ((n.gizCap[s.chapter] || 0) >= 6) { toast('O giz acabou neste capítulo.'); return; }
    const p = pontoAdiante(1.4), tipo = (n.giz.length) % 3;
    const dado = { x: p.x, z: p.z, mapa: W.mapa, tipo }; n.giz.push(dado); n.gizCap[s.chapter] = (n.gizCap[s.chapter] || 0) + 1;
    pintaGiz(dado); emitNoise(p.x, p.z, 1.2, true); try { SFX.clique(); } catch (e) {}
  }
  function pintaGiz(dado) {
    if (!W.grupo) return;
    let tex = gizTexCache[dado.tipo];
    if (!tex) {
      const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.strokeStyle = '#efeadb'; g.lineWidth = 6; g.lineCap = 'round';
      g.beginPath(); if (dado.tipo === 0) { g.moveTo(14, 50); g.lineTo(50, 14); g.moveTo(50, 14); g.lineTo(26, 14); g.moveTo(50, 14); g.lineTo(50, 38); } else if (dado.tipo === 1) { g.moveTo(14, 14); g.lineTo(50, 50); g.moveTo(50, 14); g.lineTo(14, 50); } else g.arc(32, 32, 20, 0, 7);
      g.stroke(); tex = gizTexCache[dado.tipo] = new THREE.CanvasTexture(c);
    }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.4, .4), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: .8, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(dado.x, .035, dado.z); W.grupo.add(m); gizMesh.push({ mesh: m, dado });
  }

  // ---------- trouxinha ----------
  function criaTrouxa(p) {
    if (!W.grupo || trouxa) return;
    const m = new THREE.Group(), saco = new THREE.Mesh(new THREE.BoxGeometry(.32, .2, .26), new THREE.MeshBasicMaterial({ color: 0x5a4630 })); saco.position.y = .1;
    const x = new THREE.Mesh(new THREE.PlaneGeometry(.18, .18), tinta(0xefeadb, .8)); x.rotation.x = -Math.PI / 2; x.position.y = .205;
    m.add(saco, x); m.position.set(p.x, 0, p.z); W.grupo.add(m);
    const it = interact(m, () => '<b>E</b>Pegar a trouxinha que você deixou cair', () => {
      const s = S(); const n = nt(); if (!n.perdas) return;
      s.inv.pilhas += Math.min(2, n.perdas.pilhas); s.inv.garrafas += Math.min(2, n.perdas.garrafas); s.inv.kits += Math.min(2, n.perdas.kits);
      n.perdas = null; m.visible = false; try { SFX.pegar(); } catch (e) {} toast('Você recupera a trouxinha: o que carregava voltou.'); try { ctx.renderInvMini(); } catch (e) {}
    });
    trouxa = { m, it };
  }

  // ---------- técnicas da veterana ----------
  function tecnicas(s, n, dt) {
    const T = (web ? {} : s.tec6b || {});
    // histórico para a Fita Rebobinada
    histT -= dt; if (histT <= 0) { histT = .5; n.hist.push({ t: ctx.perf, x: P.pos.x, z: P.pos.z, mapa: W.mapa }); while (n.hist.length && n.hist[0].t < ctx.perf - 26) n.hist.shift(); }
    // Fechar os olhos (segurar M)
    olhosBloq = Math.max(0, olhosBloq - dt);
    const querFechar = !!keys.KeyM && T.olhos && olhosBloq <= 0;
    if (querFechar) {
      olhosT += dt; olhosPeso += dt;
      if (olhosPeso > 3 && (s._olhosC = (s._olhosC || 0) - dt) <= 0) { s._olhosC = 1.2; emitNoise(P.pos.x, P.pos.z, 3, true); try { SFX.pulso(1); } catch (e) {} }
      if (olhosT > 5) { olhosT = 0; olhosBloq = 6; olhosPeso = 0; try { SFX.ofego(); } catch (e) {} emitNoise(P.pos.x, P.pos.z, 6, true); toast('Os olhos ardem: você precisou abrir.'); }
      if (M.ativo && dist(M.pos, P.pos) < 4) olhosPerto = true;
    } else { if (olhosT > 0 && olhosPerto && M.ativo && dist(M.pos, P.pos) < 9) conquista('l6b_olhos'); olhosT = 0; olhosPerto = false; olhosPeso = Math.max(0, olhosPeso - dt * .6); }
    documentoOlhos(querFechar && olhosT > 0);
    if (querFechar && M.ativo && dist(M.pos, P.pos) < 22) {
      const dx = M.pos.x - P.pos.x, dz = M.pos.z - P.pos.z, fx = -Math.sin(P.yaw), fz = -Math.cos(P.yaw), rx = Math.cos(P.yaw), rz = -Math.sin(P.yaw);
      const ang = Math.atan2(rx * dx + rz * dz, fx * dx + fz * dz), sel = el('l6b-seta'); if (!sel.firstChild) sel.innerHTML = '<span>▲</span>';
      sel.style.transform = `rotate(${ang}rad)`; sel.style.opacity = Math.max(.25, 1 - dist(M.pos, P.pos) / 22);
    } else { const sel = $('#l6b-seta'); if (sel) sel.style.opacity = 0; }

    // Coração no compasso
    if (T.compasso) {
      const ciclo = (ctx.perf % .9) / .9, pico = ciclo < .13;
      if (P.prende) { compasso.prendia = true; linha('comp', pico ? '♥ ♥ ♥' : '♥', pico ? 'o' : ''); }
      else {
        if (compasso.prendia) {
          if (pico) { compasso.streak++; s.ar = Math.min(100, s.ar + 12); toast('Fôlego de ouro'); if (compasso.streak >= 10) conquista('l6b_compasso'); }
          else { compasso.streak = 0; emitNoise(P.pos.x, P.pos.z, 3.2, true); try { SFX.ofego(); } catch (e) {} }
        }
        compasso.prendia = false; linha('comp', null);
      }
    }
    // Apagão perfeito
    if (T.apagao) {
      apag.cd -= dt;
      if (apag.flashAnt && !s.flashOn && apag.cd <= 0 && M.ativo && !s.hidden && dist(M.pos, P.pos) < 10 && ((M.olharT || 0) > 0 || ['alerta', 'investiga', 'bote'].includes(M.state))) {
        apag.cd = 8; apag.ate = ctx.perf + 2; subPequeno('lia', 'Apaguei na hora certa.'); try { SFX.alivio(); } catch (e) {} conquista('l6b_apagao');
      }
      apag.flashAnt = s.flashOn;
    }
    // Sangue-frio
    if (T.sangue && M.ativo) {
      const d = dist(M.pos, P.pos);
      if (['caca', 'bote', 'agarra', 'alerta'].includes(M.state) && M.state !== mStateAnt) sf = 0;
      if (!s.hidden && d < 7 && !['caca', 'bote', 'agarra'].includes(M.state) && P.noiseR <= 3) sf = Math.min(100, sf + dt * 6);
      mStateAnt = M.state; sfMax = Math.max(sfMax, sf);
      if (sf >= 90) conquista('l6b_sangue');
      linha('sf', sf > 4 ? `sangue-frio ×${1 + Math.floor(sf / 10)}` : null, sf > 60 ? 'o' : 'v');
    } else if (!T.sangue) linha('sf', null);
  }
  function documentoOlhos(on) {
    const o = $('#l6b-olhos') || (on ? el('l6b-olhos') : null); if (o) o.style.opacity = on ? .97 : 0;
    if (!on) { const sel = $('#l6b-seta'); if (sel) sel.style.opacity = 0; }
  }

  // ---------- fantasma da melhor corrida ----------
  const mapaIdx = id => ['estrada', 'terreo', 'superior', 'tuneis', 'cemiterio'].indexOf(id);
  function fantasmaTick(s, n, dt) {
    if (s.arena6b) return;
    rec_.t -= dt;
    if (rec_.t <= 0 && s.capT < 2400) { rec_.t = .2; if (rec_.pts.length < 3000) rec_.pts.push([Math.round(P.pos.x * 10), Math.round(P.pos.z * 10), mapaIdx(W.mapa)]); }
    if (!OPT.fant6b || web) { linha('fd', null); if (fant.mesh) fant.mesh.visible = false; if (fant.amigo) fant.amigo.visible = false; return; }
    const alvo = fant.alvo, amigo = fant.amigoD;
    ponta(alvo, 'mesh', 0x6fa8ff, s);
    ponta(amigo, 'amigo', 0xff6f6f, s);
    if (alvo) {
      const i = Math.floor(s.capT / .2), pts = alvo.pts; let j = Math.max(fant.j, 0), melhor = 1e9, bj = j;
      for (let k = j; k < Math.min(pts.length, j + 160); k++) { const q = pts[k]; if (q[2] !== mapaIdx(W.mapa)) continue; const dd = Math.hypot(q[0] / 10 - P.pos.x, q[1] / 10 - P.pos.z); if (dd < melhor) { melhor = dd; bj = k; } }
      if (melhor < 3.5) fant.j = bj;
      const delta = s.capT - fant.j * .2; fant.delta = delta;
      linha('fd', `fantasma ${delta >= 0 ? '+' : '−'}${Math.abs(delta).toFixed(0)} s`, delta > 0 ? 'r' : 'v');
    } else linha('fd', null);
  }
  function ponta(dado, campo, cor, s) {
    if (!dado) { if (fant[campo]) fant[campo].visible = false; return; }
    if (!fant[campo]) {
      const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: .26, depthWrite: false });
      const corpo = new THREE.Mesh(new THREE.CylinderGeometry(.2, .24, 1.2, 8), mat); corpo.position.y = .7; const cab = new THREE.Mesh(new THREE.SphereGeometry(.17, 8, 6), mat); cab.position.y = 1.45;
      g.add(corpo, cab); scene.add(g); fant[campo] = g;
    }
    const i = s.capT / .2, a = dado.pts[Math.floor(i)], b = dado.pts[Math.min(dado.pts.length - 1, Math.floor(i) + 1)];
    if (!a || a[2] !== mapaIdx(W.mapa)) { fant[campo].visible = false; return; }
    const k = i - Math.floor(i); fant[campo].visible = true;
    fant[campo].position.set((a[0] + ((b[0] - a[0]) * k)) / 10, 0, (a[1] + ((b[1] - a[1]) * k)) / 10);
  }
  function fantasma(id) { if (fant.mesh && fant.mesh.parent !== scene) scene.add(fant.mesh); }
  function salvarFantasma(cap, tempo, morreu) {
    if (morreu || rec_.pts.length < 20 || tempo < 20) return;
    const todos = lsGet(KEY + '-fant', {}), ant = todos[cap];
    if (ant && ant.t <= tempo) return;
    if (ant && OPT.fant6b) conquista('l6b_fantasma');
    todos[cap] = { t: Math.round(tempo), pts: rec_.pts.slice(0, 3000) }; lsSet(KEY + '-fant', todos);
  }
  const exportaFantasma = cap => { const d = (lsGet(KEY + '-fant', {}))[cap]; return d ? btoa(JSON.stringify({ c: cap, t: d.t, p: d.pts })) : ''; };
  function importaFantasma(txt) {
    try { const o = JSON.parse(atob(txt.trim())); if (!o || !Array.isArray(o.p)) return false; const t = lsGet(KEY + '-fant-amigo', {}); t[o.c | 0] = { t: o.t | 0, pts: o.p.slice(0, 3000) }; lsSet(KEY + '-fant-amigo', t); return true; } catch (e) { return false; }
  }

  // ---------- revezamento (passa o controle) ----------
  function nomeAtual(s, n) { return n.rev.atual === 0 ? s.rev6b.a : s.rev6b.b; }
  function trocarJogador(msg, s, n, morte) {
    n.rev.atual = 1 - n.rev.atual; revOv = true; if (!morte) { P.bloqueado = true; revBlk = true; }
    const b = el('l6b-rev'); b.hidden = false; b.style.display = '';
    b.innerHTML = `${msg}<br><br><b style="font-size:26px;color:#c9a75a">Agora é a vez de ${nomeAtual(s, n)}</b><br><br><small>aperte ENTER para continuar</small><br><br><small>${placarRev(s, n)}</small>`;
  }
  function fecharRev() { revOv = false; if (revBlk) { P.bloqueado = false; revBlk = false; } const b = $('#l6b-rev'); if (b) b.style.display = 'none'; }
  function placarRev(s, n) {
    const r = n.rev, nomes = [s.rev6b.a, s.rev6b.b];
    return nomes.map((nm, i) => `${nm}: ${r.mortes[i]} morte${r.mortes[i] === 1 ? '' : 's'} · ${r.caps[i]} capítulo${r.caps[i] === 1 ? '' : 's'} · ${mmss(r.tempo[i])}`).join('<br>');
  }
  function revTick(s, n, dt) { if (!s.rev6b) return; n.rev.tempo[n.rev.atual] += dt; linha('rev', 'jogando: ' + nomeAtual(s, n), 'o'); }

  // ---------- arenas ----------
  function iniciarArena(s, n) {
    const tipo = s.arena6b, A = ARENAS[tipo];
    s.chapter = 2; s.flags.energia = true; s.inv.lanterna = true; s.inv.pilhas = Math.max(s.inv.pilhas, 2); s.inv.garrafas = Math.max(s.inv.garrafas, 2); s.inv.kits = Math.max(s.inv.kits, 1); s.battery = 100;
    carregarMapa('terreo', 'escada', { salvar: false });
    { let longe = null, ld = -1; for (const r of salasAlcancaveis(P.pos, { semFora: true }).filter(r => !r.seguro)) { const [x, z] = pontoEm(r), d = Math.hypot(x - P.pos.x, z - P.pos.z); if (d > ld) { ld = d; longe = [x, z]; } } if (longe) ativarInspetor(longe[0], longe[1]); else ativarInspetor(-20, -12); }
    arena = { tipo, t0: ctx.perf, t: 0, vel: 1, ouv: 1, onda: 0, ondaT: 0, folga: 0, itemT: 20, evT: 20, ana: 0, proc: 0, apagao: 0, hora: -1 };
    capAnt = s.chapter; document.body.classList.add('l6b-arena'); toast(A.nome + '. Sem objetivos: só sobreviver.');
    try { ctx.renderObj(); } catch (e) {}
  }
  function soltaItem() {
    const s = S(); const salas = salasAlcancaveis(P.pos, { semFora: true }).filter(r => r !== P.room); if (!salas.length) return;
    const r = salas[Math.floor(Math.random() * salas.length)], [x, z] = pontoEm(r);
    const tipos = [['pilha', 0xd8b24a, 'pilha'], ['kit', 0xb03a2e, 'curativo'], ['garrafa', 0x4a7a5a, 'garrafa']], [t, cor, nome] = tipos[Math.floor(Math.random() * 3)];
    const m = new THREE.Mesh(new THREE.BoxGeometry(.18, .18, .18), new THREE.MeshBasicMaterial({ color: cor })); m.position.set(x, .5, z); W.grupo.add(m);
    const it = interact(m, () => `<b>E</b>Pegar ${nome}`, () => { const S_ = S_get(); if (t === 'pilha') S_.inv.pilhas++; else if (t === 'kit') S_.inv.kits++; else S_.inv.garrafas++; m.visible = false; try { SFX.pegar(); ctx.renderInvMini(); } catch (e) {} });
    itensArena.push({ m, it, ate: ctx.perf + 30 }); toast('Algo caiu em outra sala do térreo.');
  }
  const S_get = () => ctx.S;
  function ameaca(qual, s) {
    if (qual === 'ana') { try { if (!ANA.ativa) spawnAna(); } catch (e) {} }
    else if (qual === 'proc') { try { iniciarProcissao(); } catch (e) {} }
    else if (qual === 'cacada') { emitNoise(P.pos.x, P.pos.z, 40, true); }
  }
  function arenaTick(s, n, dt) {
    if (!arena) { arena = { pend: true }; setTimeout(() => { try { iniciarArena(S(), nt()); } catch (e) { console.warn('L6B arena', e); arena = null; } }, 30); return; }
    if (arena.pend) return;
    const A = ARENAS[arena.tipo]; arena.t = ctx.perf - arena.t0;
    for (let i = itensArena.length - 1; i >= 0; i--) { const it = itensArena[i]; if (!it.m.visible || ctx.perf > it.ate) { it.m.visible = false; if (it.m.parent) it.m.parent.remove(it.m); const k = W.inter.indexOf(it.it); if (k >= 0) W.inter.splice(k, 1); itensArena.splice(i, 1); } }
    if (arena.tipo === 'amanhecer') {
      const h = Math.min(6, Math.floor(arena.t / 120)), hh = String(h).padStart(2, '0'), mm = String(Math.floor((arena.t % 120) / 2)).padStart(2, '0');
      linha('arena', `${hh}:${mm} — até as 06:00`, 'o');
      if (h !== arena.hora) {
        arena.hora = h; if (h > 0 && h < 6) { try { SFX.sino(.45); } catch (e) {} }
        if (h === 1) { arena.ouv = 1.25; toast('1h: ele ouve melhor.'); }
        if (h === 2) { toast('2h: a Ana apareceu.'); ameaca('ana', s); }
        if (h === 3) { toast('3h: a Procissão.'); ameaca('proc', s); }
        if (h === 4) { toast('4h: apagão geral.'); s.flags.energia = false; try { syncWorld(); } catch (e) {} arena.apagao = 30; }
        if (h === 5) { arena.vel = 1.1; toast('5h: caçada sem pausa.'); }
      }
      if (arena.apagao > 0) { arena.apagao -= dt; if (arena.apagao <= 0) { s.flags.energia = true; try { syncWorld(); } catch (e) {} } }
      if (h === 2 || h === 3) { arena.evT -= dt; if (arena.evT <= 0) { arena.evT = 70; ameaca(h === 2 ? 'ana' : 'proc', s); } }
      if (h >= 5) { arena.evT -= dt; if (arena.evT <= 0) { arena.evT = 10; ameaca('cacada', s); } }
      if (arena.t >= A.dur) arenaFim(true, `Seis horas. O sino tocou e você ainda estava viva.`);
    } else if (arena.tipo === 'semfim') {
      arena.ondaT -= dt;
      if (arena.ondaT <= 0) {
        arena.onda++; arena.ondaT = 45; const o = arena.onda, k = o % 6;
        try { SFX.sino(.6); } catch (e) {}
        arena.ouv = 1 + .05 * o; arena.vel = 1 + .03 * o;
        toast(`Badalada ${o}.`);
        if (k === 1) toast('Ele está mais atento.'); if (k === 2) ameaca('ana', s); if (k === 3) ameaca('proc', s); if (k === 4) arena.vel += .08; if (k === 5) { ameaca('ana', s); ameaca('cacada', s); }
        if (k === 0) { ameaca('proc', s); ameaca('cacada', s); }
        if (o >= 10) conquista('l6b_semfim');
        soltaItem();
        grava(r => { r.arena.semfim = Math.max(r.arena.semfim || 0, o); });
      }
      linha('arena', `badalada ${arena.onda} · próxima em ${Math.ceil(arena.ondaT)} s`, 'o');
    } else {
      const min = Math.floor(arena.t / 60); arena.vel = 1 + .03 * min; arena.ouv = 1 + .05 * min;
      arena.itemT -= dt; if (arena.itemT <= 0) { arena.itemT = 90; soltaItem(); }
      arena.evT -= dt; if (arena.evT <= 0) { arena.evT = 100; const q = ['ana', 'proc', 'cacada'][arena.ana++ % 3]; ameaca(q, s); }
      linha('arena', `pressão ${min + 1} · galo em ${mmss(A.dur - arena.t)}`, 'o');
      if (arena.t >= A.dur) arenaFim(true, 'O galo cantou lá fora. A noite acabou.');
    }
  }
  function arenaFim(venceu, msg) {
    const s = S(); if (!s || !arena) return; const tipo = arena.tipo, t = Math.round(arena.t), onda = arena.onda;
    const A = ARENAS[tipo];
    grava(r => { r.arena[tipo] = Math.max(r.arena[tipo] || 0, tipo === 'semfim' ? onda : t); });
    if (venceu) { if (tipo === 'amanhecer') conquista('l6b_amanhecer'); if (tipo === 'galo') conquista('l6b_galo'); s.fim = true; try { document.exitPointerLock(); } catch (e) {} }
    const b = el('l6b-arena-fim'); b.style.display = '';
    const rr = rec().arena[tipo];
    b.innerHTML = `<b>${A.nome}</b><br>${msg}<br><br>` + (tipo === 'semfim' ? `Badaladas: ${onda} · recorde ${rr}` : `Tempo: ${mmss(t)} · recorde ${mmss(rr)}`) +
      `<br><br><button class="btn" id="l6b-de-novo">De novo</button> <button class="btn" id="l6b-menu">Menu</button>`;
    $('#l6b-de-novo').onclick = () => { b.style.display = 'none'; limparArena(); voltarMenu(); OPT.arena6b = tipo; setTimeout(() => { const nv = $('#b-novo'); if (nv) nv.click(); }, 80); };
    $('#l6b-menu').onclick = () => { b.style.display = 'none'; limparArena(); voltarMenu(); };
  }
  function limparArena() { arena = null; itensArena = []; document.body.classList.remove('l6b-arena'); linha('arena', null); const s = S(); if (s) s.arena6b = null; }

  // ---------- história curta de cada rodada: Hall, avisos, ritmo ----------
  function historia(s, n, dt) {
    bannerT -= dt;
    if (bannerT <= 0 && s.capT > 2 && s.capT < 4 && !s._ban6b) {
      s._ban6b = true; bannerT = 99;
      const nomes = (s.m6b || []).map(id => MUTID[id].nome);
      if (nomes.length) setTimeout(() => { if (jogando()) subPequeno('lia', `Também vale: ${nomes.slice(0, 4).join(', ')}${nomes.length > 4 ? '…' : ''}.`); }, 3500);
      if ((s.asc6b | 0) > 0) setTimeout(() => { if (jogando()) toast(`Ascensão ${s.asc6b}: ${ASC[s.asc6b]}.`); }, 6500);
    }
  }

  // ---------- tela de morte ----------
  let ultMorteCont = -1;
  function telaMorte() {
    const s = S(); if (!s) return; const n = nt(); if (!n) return;
    if (ultMorteCont !== s.mortes) {
      ultMorteCont = s.mortes;
      n.mortesCap[s.chapter] = (n.mortesCap[s.chapter] || 0) + 1;
      sf = 0;
      if (tem('escada')) n.esc = Math.max(0, n.esc - 1);
      if (tem('cicatrizes')) { const tipos = ['mao', 'manca', 'olho', 'folego', 'pilha']; n.cic.push(tipos[(n.cic.length + seedNum()) % tipos.length]); }
      if (tem('trouxinha')) n.perdas = { mapa: W.mapa, cap: s.chapter, x: P.pos.x, z: P.pos.z, pilhas: s.inv.pilhas, garrafas: s.inv.garrafas, kits: s.inv.kits };
      if (s.rev6b) n.rev.mortes[n.rev.atual]++;
    }
    const dt = $('#death'); if (!dt) return;
    let box = $('#l6b-morte');
    if (!box) { box = document.createElement('div'); box.id = 'l6b-morte'; box.style.cssText = 'font-family:"Special Elite";font-size:12px;color:#8a7f66;margin:8px auto;max-width:640px;line-height:1.7'; const rt = $('#dt-retry'); if (rt && rt.parentNode) rt.parentNode.insertBefore(box, rt); else dt.appendChild(box); }
    const linhas_ = [];
    const best = rec().melhorCap[s.chapter];
    if (!s.arena6b) linhas_.push(`Capítulo: ${mmss(s.capT)}` + (best ? ` · seu melhor: ${mmss(best)} (faltam ${mmss(Math.max(0, best - s.capT))} para igualar)` : ' · ainda sem tempo limpo para comparar') + ' · ENTER reinicia');
    if (tem('cicatrizes') && n.cic.length) linhas_.push('Cicatrizes: ' + n.cic.map(c => ({ mao: 'mão trêmula', manca: 'manqueira', olho: 'olho turvo', folego: 'fôlego curto', pilha: 'pilha fraca' }[c])).join(', '));
    if (tem('escada')) linhas_.push(`Escada do Medo: degrau ${n.esc}`);
    if (tem('trouxinha') && n.perdas) linhas_.push('Sua trouxinha ficou no ponto da queda.');
    if (s.rev6b) linhas_.push(placarRev(s, n).replace(/<br>/g, ' | '));
    if (s.amigo6b && s.amigo6b.length) { const q = Object.values(n.amigo).reduce((a, b) => a + b, 0); linhas_.push(q ? `Carimbo: quebrou a regra do amigo (${q}×)` : 'Regras do amigo intactas até aqui.'); }
    box.innerHTML = linhas_.join('<br>');
    if (s.rev6b) { trocarJogador(`${nomeAtual(s, n)} caiu.`, s, n, true); const b = $('#l6b-rev'); if (b) b.style.zIndex = 30; }
    if (s.arena6b && arena) {
      const rt = $('#dt-retry'); if (rt) rt.hidden = true; revOv = false;
      const b = $('#l6b-rev'); if (b) b.style.display = 'none';
      arenaFim(false, 'Ele te encontrou antes do fim.');
      const arenaB = $('#l6b-arena-fim'); if (arenaB) arenaB.style.zIndex = 30;
    } else { const rt = $('#dt-retry'); if (rt) rt.hidden = false; }
  }

  // ---------- painel (anexado ao painel Modos do Lote 6) ----------
  function painel() {
    const corpo = $('#rejog-corpo'); if (!corpo || corpo.querySelector('#l6b-painel')) return;
    const r = rec(), sel = new Set(OPT.m6b || []); OPT.cartas6b = OPT.cartas6b || {}; OPT.tec6b = OPT.tec6b || {}; OPT.amigo6b = OPT.amigo6b || []; OPT.rev6b = OPT.rev6b || {};
    const lib = algumFinal();
    const chk = (nome, desc, on, attr) => `<label class="it" title="${desc}" style="cursor:pointer"><div><b>${nome}</b><br><small>${desc}</small></div><input type="checkbox" ${attr} ${on ? 'checked' : ''}></label>`;
    let h = '<div id="l6b-painel"><h3>Segunda rodada — mutadores novos</h3><p class="pn-resumo">Equipamentos, jeitos da Lia, relógios e restrições. Valem na campanha normal e entram nos recordes.</p>';
    h += '<div style="text-align:center;margin:0 0 10px"><button class="btn" id="l6b-surpresa">Me Surpreenda II</button> <button class="btn" id="l6b-limpar">Limpar II</button></div>';
    for (const g of GRUPOS) { h += `<h3>${g}</h3>`; for (const m of MUT) if (m.gr === g) h += chk(m.nome, m.desc, sel.has(m.id), `data-m6b="${m.id}"`); }
    h += '<h3>Cartas entre capítulos</h3>';
    h += chk('Pertence da Lia (prólogo)', 'Antes de sair do carro, leve um de três pertences sorteados pela semente.', !!OPT.cartas6b.pert, 'data-carta="pert"');
    h += chk('Dádivas da Hora', 'A cada capítulo, três cartas com bênção e custo; a escolha vale até o fim da noite.', !!OPT.cartas6b.boon, 'data-carta="boon"');
    h += chk('Contratos de risco', 'Três contratos por capítulo; cumprir dá selo e multiplicador. Recusar é grátis.', !!OPT.cartas6b.ctr, 'data-carta="ctr"');
    h += `<h3>Ascensão</h3><div class="it"><div><b>Nível de Ascensão (0 a 10)</b><br><small>${lib ? 'Cada nível soma uma regra: ' + ASC.slice(1, 4).join('; ') + '…' : 'Libera depois do primeiro final.'}</small></div><select id="l6b-asc" ${lib ? '' : 'disabled'}>${Array.from({ length: 11 }, (_, i) => `<option value="${i}" ${(OPT.asc6b | 0) === i ? 'selected' : ''}>${i}</option>`).join('')}</select></div>`;
    h += '<h3>Fantasma e revezamento</h3>';
    h += chk('Correr contra mim', 'Uma silhueta azul repete a sua melhor corrida de cada capítulo, com a diferença de tempo no HUD.', !!OPT.fant6b, 'data-flag="fant6b"');
    h += `<div class="it"><div><b>Fantasma de um amigo</b><br><small>Copie o seu fantasma do capítulo e cole o do amigo (aparece em vermelho).</small></div><div><button class="btn" id="l6b-exp">Copiar cap. 1</button><br><input id="l6b-imp" placeholder="colar código" style="width:120px"><button class="btn" id="l6b-impb">Importar</button></div></div>`;
    h += chk('Passa o controle (2 jogadores)', 'A cada morte ou fim de capítulo, tela preta com o nome do próximo. Placar da dupla.', !!OPT.rev6b.on, 'data-rev="on"');
    h += `<div class="it"><div><small>Nomes</small></div><div><input id="l6b-na" value="${OPT.rev6b.a || 'Jogador 1'}" style="width:100px"> <input id="l6b-nb" value="${OPT.rev6b.b || 'Jogador 2'}" style="width:100px"></div></div>`;
    h += '<h3>Regras do Amigo (até 3)</h3>';
    for (const id in REGRAS_AMIGO) h += chk(REGRAS_AMIGO[id][0].toUpperCase() + REGRAS_AMIGO[id].slice(1), 'Quem assiste escolhe; o jogo vigia e carimba quem quebrar.', OPT.amigo6b.includes(id), `data-amigo="${id}"`);
    h += '<h3>Técnicas da veterana</h3>';
    for (const [id, nome, desc] of [['olhos', 'Fechar os olhos [M]', 'Segure M: tela preta, setas do Inspetor, medo sobe devagar. Passou de 3 s o coração denuncia; passou de 5 s os olhos ardem.'], ['compasso', 'Coração no compasso', 'Solte o ar na batida do pico e ganhe um fôlego de ouro.'], ['apagao', 'Apagão perfeito', 'Apague a lanterna quando ele vira o rosto e ele perde o rastro por 2 s.'], ['sangue', 'Sangue-frio', 'Medidor que sobe ao passar perto dele em silêncio e zera quando é ouvida.']]) h += chk(nome, desc, OPT.tec6b[id] !== 0, `data-tec="${id}"`);
    h += '<h3>Arenas</h3>';
    for (const id in ARENAS) h += `<div class="it"><div><b>${ARENAS[id].nome}</b><br><small>${ARENAS[id].desc} Recorde: ${id === 'semfim' ? (r.arena[id] || 0) + ' badaladas' : mmss(r.arena[id] || 0)}</small></div><button class="btn" data-arena="${id}">Jogar</button></div>`;
    const qs = Object.entries(r.quieta || {}).map(([c, v]) => `cap. ${+c + 1}: ${v} s`).join(' · ');
    h += `<h3>Recordes II</h3><div class="it"><div><small>Pontos de rejogo (melhor noite): ${r.pts || 0}<br>Selos de contrato: ${r.selos || 0}<br>Noites com regras novas: ${r.noites || 0}${qs ? '<br>Noite mais quieta: ' + qs : ''}</small></div></div></div>`;
    const w = document.createElement('div'); w.innerHTML = h; corpo.appendChild(w.firstChild);
    const q = corpo.querySelector('#l6b-painel');
    q.querySelectorAll('[data-m6b]').forEach(cb => cb.onchange = () => { const set = new Set(OPT.m6b || []); cb.checked ? set.add(cb.dataset.m6b) : set.delete(cb.dataset.m6b); OPT.m6b = [...set]; salvarOpt(); });
    q.querySelectorAll('[data-carta]').forEach(cb => cb.onchange = () => { OPT.cartas6b[cb.dataset.carta] = cb.checked ? 1 : 0; salvarOpt(); });
    q.querySelectorAll('[data-flag]').forEach(cb => cb.onchange = () => { OPT[cb.dataset.flag] = cb.checked ? 1 : 0; salvarOpt(); });
    q.querySelectorAll('[data-rev]').forEach(cb => cb.onchange = () => { OPT.rev6b.on = cb.checked ? 1 : 0; salvarOpt(); });
    q.querySelectorAll('[data-tec]').forEach(cb => cb.onchange = () => { OPT.tec6b[cb.dataset.tec] = cb.checked ? 1 : 0; salvarOpt(); });
    q.querySelectorAll('[data-amigo]').forEach(cb => cb.onchange = () => { const set = new Set(OPT.amigo6b); if (cb.checked) { if (set.size >= 3) { cb.checked = false; return; } set.add(cb.dataset.amigo); } else set.delete(cb.dataset.amigo); OPT.amigo6b = [...set]; salvarOpt(); });
    const nm = () => { OPT.rev6b.a = $('#l6b-na').value.slice(0, 14) || 'Jogador 1'; OPT.rev6b.b = $('#l6b-nb').value.slice(0, 14) || 'Jogador 2'; salvarOpt(); };
    $('#l6b-na').onchange = nm; $('#l6b-nb').onchange = nm;
    const as = $('#l6b-asc'); if (as) as.onchange = () => { OPT.asc6b = +as.value; salvarOpt(); };
    $('#l6b-limpar').onclick = () => { OPT.m6b = []; OPT.cartas6b = {}; OPT.amigo6b = []; OPT.asc6b = 0; OPT.fant6b = 0; OPT.rev6b = {}; salvarOpt(); corpo.querySelector('#l6b-painel').remove(); painel(); };
    $('#l6b-surpresa').onclick = () => { const ids = MUT.map(m => m.id).filter(i => !['semhud', 'relogio'].includes(i)), nn = 1 + (Math.random() * 3 | 0), set = new Set(); while (set.size < nn) set.add(ids[Math.random() * ids.length | 0]); OPT.m6b = [...set]; OPT.m6 = []; salvarOpt(); $('#rejog').hidden = true; $('#title').hidden = false; const nv = $('#b-novo'); if (nv) nv.click(); };
    $('#l6b-exp').onclick = () => { const c = exportaFantasma(0) || exportaFantasma(1); try { navigator.clipboard.writeText(c); } catch (e) {} $('#l6b-exp').textContent = c ? 'Copiado!' : 'Sem corrida ainda'; };
    $('#l6b-impb').onclick = () => { $('#l6b-impb').textContent = importaFantasma($('#l6b-imp').value) ? 'Importado!' : 'Código inválido'; };
    q.querySelectorAll('[data-arena]').forEach(b => b.onclick = () => { OPT.arena6b = b.dataset.arena; $('#rejog').hidden = true; $('#title').hidden = false; const nv = $('#b-novo'); if (nv) nv.click(); });
  }
  function ligar() {
    try {
      const corpo = $('#rejog-corpo'); if (!corpo) return;
      addEventListener('keydown', e => { if (revOv && e.code === 'Enter') { e.stopImmediatePropagation(); e.preventDefault(); fecharRev(); } }, true);
      new MutationObserver(() => { try { painel(); } catch (e) { console.warn('L6B painel', e); } }).observe(corpo, { childList: true });
    } catch (e) { console.warn('L6B ligar', e); }
  }

  try { window.__l6b = { nt, OPT, guizos: () => guizos, cadeiras: () => cadeiras, gizMesh: () => gizMesh, cartas: () => cartas, arena: () => arena, rec, salvar: q => salvarDaMorte(q), fant, sf: () => sf, olhos: () => olhosT, telaMorte, arenaFim, portaBarr, itens: () => itensArena }; } catch (e) {} // gancho de teste
  const seguro = f => (...a) => { try { return f(...a); } catch (e) { console.warn('L6B', e); return undefined; } };
  return { ligar, novoJogo: seguro(novoJogo), mapa: seguro(mapa), antes: seguro(antes), update: seguro(update), tecla: seguro(tecla),
    telaMorte: seguro(telaMorte), salvarDaMorte: (q) => { try { return salvarDaMorte(q); } catch (e) { return 0; } }, portaBarr: dr => { try { return portaBarr(dr); } catch (e) { return false; } },
    get arena() { return !!(S() && S().arena6b); } };
}
