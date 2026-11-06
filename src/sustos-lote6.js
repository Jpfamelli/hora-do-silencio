// SUSTOS E EVENTOS — Lote 6: REJOGABILIDADE
// Baralho de sustos com memória de 30 noites, susto que muda depois de decorado, hábitos da jogadora usados
// contra ela, a boneca que anda entre as noites, noites sorteadas (Vazia, Mansa, Cruel, Calmaria Falsa, Queda),
// créditos falsos, 3h07 de verdade, modos extras (frequência de sustos, Sangue Frio, Insone, A Casa Mente),
// conquistas e segredos que só aparecem na segunda jogada. Tudo justo: sem dano real (fora o empurrão leve do
// esconderijo podre), calado no QA (`navigator.webdriver`) e à prova de erro.
// Instalado por src/sustos.js (L6 = instalarSustosL6(E, K)). Ganchos: update, novoMapa, morte, aoEsconder, aoSair,
// aoPasso, fimCap, aoPausar, armarioOcupado, probFalsa, tellProc, ambMul, segurarAmb, chamadoFundo.
import * as THREE from 'three';

const LS_KEY = 'hora-silencio-l6';
const MEM = {}; // por noite (perfil + número da noite): sobrevive a morrer e voltar do checkpoint
const lsGet = () => { try { const v = JSON.parse(localStorage.getItem(LS_KEY)); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } };
const lsSet = v => { try { localStorage.setItem(LS_KEY, JSON.stringify(v)); } catch (e) { /* sem armazenamento: tudo bem */ } };
const lsMuda = fn => { const o = lsGet(); fn(o); lsSet(o); return o; };
const statsGet = () => { try { return JSON.parse(localStorage.getItem('hora-silencio-stats')) || {}; } catch (e) { return {}; } };
const visGet = () => { try { return JSON.parse(localStorage.getItem('hora-silencio-l4vis')) || {}; } catch (e) { return {}; } };
function hash01(str) { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } h ^= h >>> 13; h = Math.imul(h, 2246822507); h ^= h >>> 16; return (h >>> 0) / 4294967296; }

export function instalarSustosL6(E, K) {
  const { R, rand, clamp, lerp, camera, scene, W, P, M, ANA, PROC } = E;
  const S = () => E.S;
  const seguro = K.seguro;
  const T = Object.assign({
    colecao: 'Sustos novos nesta noite: {novos} · vistos até agora: {n} de {t}.',
    cadeira: '[uma cadeira gira sozinha, no escuro]',
    acena: '[alguém acena, lá no fundo]',
    teto: '[passos no teto... pararam quando você parou]',
    soletra_leg: '[a lâmpada pisca um nome]',
    soletra_lia: '(soletrando) L... I... A...',
    goteira: '[a goteira virou um sussurro]',
    respira_corr: '[o corredor respira]',
    falsa_porta: '[uma porta nova... que não estava ali]',
    movido: 'Isso não estava aqui ontem.',
    sumiu: 'Isso estava aqui ontem. Juro que estava.',
    coringa_leg: '[isso aconteceu mesmo?]',
    alto_leg: '[algo alto demais, parado, olhando de longe]',
    onze_leg: '[... onze.]',
    onze_lia: 'Foram onze. Isso nunca aconteceu.',
    pegadas_ng: '[pegadas molhadas, atrás de você]',
    reencena_leg: '[do jeitinho que ele te pegou da última vez]',
    lapide_leg: 'o nome de quem te pegou, a giz',
    fantasma_lia: '(a sua própria voz, baixinho) Eu já estive aqui. Era pra fazer o que mesmo?',
    falsa_vitoria: '[a luz apaga... alguém respira perto]',
    assinatura_cedo: '[um estalo, um vulto rápido... algo está marcado pra essa noite]',
    veterano_leg: '[o susto que você já conhece... não veio]',
    mansa_lia: '(sussurro) A casa está calma demais. Tem algo errado.',
    mansa_diario: 'A Noite Mansa: quase nenhum susto. Só o silêncio.',
    vazia_lia: '(sussurro) Não tem ninguém. Por que eu sinto que tem?',
    vazia_replay: 'Replay da noite: ele ficou parado a 3 m de você em {n} momentos. Você não viu.',
    queda_leg: '[toda a luz do prédio morreu de uma vez]',
    podre_tell: '[arranhões no verso da porta... alguém já usou esse esconderijo]',
    podre_mao: '[uma mão te empurra pra fora]',
    queimado_tell: '(giz na porta) aqui foi a sua última vez',
    recorde_leg: '(bem baixo) ...ele viu você correr.',
    recompensa_leg: '[uma vela se acende sozinha no caminho]',
    sangue_frio: 'Modo Sangue Frio: sem avisos antes dos sustos.',
    sangue_frio_off: 'Sangue Frio desligado: os avisos voltaram.',
    insone: 'Modo Insone: a casa não te deixa em paz.',
    mente: 'Modo A Casa Mente: nem todo susto é de verdade.',
    freq: 'Frequência de sustos: {p}%.',
    pulou: '(colado na sua nuca) Você pula bonito.',
    sombra_parede: '[uma sombra desliza pela parede]',
    vela_leg: '[uma vela se acende sozinha]',
    nome_parede_leg: '[um nome aparece na parede]',
    respiro_porta: '[alguém respira do outro lado da porta]',
    risos: '[risadinhas de criança, se afastando]',
    passos_param: '[passos atrás de você... pararam quando você virou]',
    silencio_leg: '[todo o som do mundo sumiu]',
    silencio_fim: '[uma porta bateu, bem atrás de você]',
    trilha_leg: '[alguém refaz o seu caminho, oito segundos atrás]',
    coro_leg: '[um coro de crianças canta baixinho, lá longe]',
    ninguem_leg: '[alguém esperou por você aqui... durante vinte noites]',
    aviso_vazio_leg: '[tudo avisa que vem um susto... e não vem]',
    corpo_leg: '[o contorno de giz onde você caiu. A lanterna ainda pisca]',
    habito_q: 'Eu sempre faço isso.',
    habito_lanterna: 'Parece que sabem do meu jeito.',
    habito_arm: '(baixinho) Só eu me escondo aqui... e eles sabem.',
    habito_run: '[o chão te entregou]',
    armocup_toast: 'Tem alguém no armário.',
    armocup_davi: 'Davi, mudo, te estende uma pilha e aponta a saída.',
    armocup_olhos: '[dois olhos vermelhos, no escuro do armário]',
    armocup_mao: '[uma mão pequena empurra a porta de volta]',
    armocup_de_novo: 'Ocupado.',
    fechou_leg: '(sussurro) não olha.',
    creditos_leg: '[isso não era o fim]',
    creditos_lia: 'Não era o fim. Ele ainda está aqui.',
    hora307_radio: 'três e sete.',
    hora307_toast: 'Hora Marcada: 03:07. O internato parou o relógio.',
    hora3_toast: 'Três da manhã. O sino lá longe sabe que você está acordada.',
    demorou: 'Você demorou.',
    despausa_leg: '[algo mudou enquanto você não olhava]',
    porta_bate: '[uma porta já visitada bateu atrás de você]',
    boneca_leg: '[a boneca de pano... está mais perto]',
    boneca_banco: '[a boneca de pano está no banco do passageiro, virada para você]',
    calmaria_leg: '[dois ao mesmo tempo]',
    cruel_leg: '[ele não vai te dar tempo]',
    pilha_mao: 'Davi (mudo) deixou uma pilha.',
    chamado_fundo: {
      inspetor: 'Lia... o homem alto já te pegou. Eu vi. Ele vai de novo.',
      ana: 'Lia... a menina que conta já te achou. Um... dois...',
      procissao: 'Lia... as irmãs passaram por cima de você. Lembra?',
      '': 'Lia...? Sou eu. Vem cá.'
    }
  }, R.sustos6 || {});

  // ---------------- conquistas novas (segredos de rejogabilidade)
  for (const c of [
    { id: 'l6_sem_repetir', nome: 'Sem Repetir', desc: 'Veja três sustos diferentes do baralho da casa.', secreta: true },
    { id: 'l6_colecionadora', nome: 'Colecionadora de Sustos', desc: 'Veja todos os sustos do baralho da casa.', secreta: true },
    { id: 'l6_mais_uma', nome: 'Mais Uma', desc: 'Ouça o sino bater onze vezes, numa noite marcada.', secreta: true },
    { id: 'l6_alto', nome: 'O Alto', desc: 'Veja a figura alta demais que só observa, de longe.', secreta: true },
    { id: 'l6_coringa', nome: 'Fora do Roteiro', desc: 'Pegue uma entidade agindo fora do roteiro dela.', secreta: true },
    { id: 'l6_sangue_frio', nome: 'Sangue Frio', desc: 'Termine um capítulo com os avisos de susto desligados.', secreta: true },
    { id: 'l6_desconfiada6', nome: 'Nada é Seguro', desc: 'Sobreviva ao esconderijo podre da noite.', secreta: true },
    { id: 'l6_reencena', nome: 'O Seu Susto', desc: 'Veja a casa reencenar a sua última morte.', secreta: true },
    { id: 'l6_veterana', nome: 'Veterana', desc: 'Chegue à sua quinta noite no São Lázaro.', secreta: true },
    { id: 'l6_insone', nome: 'Insone', desc: 'Termine um capítulo no Modo Insone.', secreta: true },
    { id: 'l6_mansa', nome: 'Noite Mansa', desc: 'Jogue numa noite calma demais, quase sem sustos.', secreta: true },
    { id: 'l6_pulona', nome: 'Pula Bonito', desc: 'Pule de susto quatro vezes numa mesma noite.', secreta: true },
    { id: 'l6_ele_estava_la', nome: 'Ele Estava Lá', desc: 'Passe pela Noite Vazia e descubra quantas vezes ele ficou a 3 m de você.', secreta: true },
    { id: 'l6_hora_marcada', nome: 'Hora Marcada', desc: 'Esteja no jogo às 03:07 do relógio de verdade.', secreta: true },
    { id: 'l6_habito', nome: 'Piloto Automático', desc: 'Veja a casa quebrar de propósito um hábito seu.', secreta: true },
    { id: 'l6_falso_fim', nome: 'Isso Não Era o Fim', desc: 'Caia nos créditos falsos.', secreta: true },
    { id: 'l6_boneca', nome: 'A Boneca Chegou', desc: 'Veja a boneca de pano no banco do passageiro, na sétima noite.', secreta: true },
    { id: 'l6_cruel', nome: 'Três em Fila', desc: 'Sobreviva à Madrugada Cruel.', secreta: true },
    { id: 'l6_silencio', nome: 'Silêncio Total', desc: 'Ouça o mundo inteiro calar.', secreta: true },
    { id: 'l6_trilha', nome: 'Seus Próprios Passos', desc: 'Veja o vulto refazer o seu caminho.', secreta: true }
  ]) if (R.conquistas && !R.conquistas.some(x => x.id === c.id)) R.conquistas.push(c);

  // ---------------- utilidades
  const teste = () => !window.__l6real && (!!window.__teste || (typeof navigator !== 'undefined' && navigator.webdriver)); // __l6real: só para eu testar os eventos de verdade
  const jogando = () => E.mode === 'jogo' && !!S() && !S().dead && !S().fim && !E.ui;
  const dM = () => (M.ativo ? K.dist2(M.pos, P.pos) : 99);
  const ameaca = () => (M.ativo && (M.state === 'caca' || M.state === 'agarra' || M.state === 'bote' || dM() < 13)) || !!PROC.fase || !!ANA.ativa;
  const pesadelo = () => !!S() && (S().dif === 'pesadelo' || !!(S().modo && S().modo.umaVida));
  const noite = () => (S() && S().flags && S().flags._noite) || statsGet().partidas || 1;
  const finais = () => statsGet().concluidas || 0;
  const perfilId = () => { let p = lsGet().perfil; if (!p) { p = Math.random().toString(36).slice(2, 8); lsMuda(o => { o.perfil = p; }); } return p; };
  const chaveNoite = () => `${perfilId()}|${noite()}`;
  const mem = () => (MEM[chaveNoite()] = MEM[chaveNoite()] || {});
  const sorte = tag => hash01(chaveNoite() + '|' + tag);
  const leg = t => E.sub('', t);
  const agora = () => K.agora();
  const conquista = id => { try { if (E.conquista && !teste()) E.conquista(id); } catch (e) { /* conquista é bônus */ } };
  const FORCA = new Set(); // depuração: __sustos._L6.forcar('cadeira')
  const V = new THREE.Vector3();
  const sala = () => P.room;
  function olhando(p, cos = .9) { const f = K.fwdH(), dx = p.x - P.pos.x, dz = p.z - P.pos.z, l = Math.hypot(dx, dz) || 1; return (f.x * dx + f.z * dz) / l > cos; }
  function noChao(g, x, z) { V.set(x, 0, z); E.collide(V, .25); g.position.set(V.x, 0, V.z); }
  function viraPara(g, alvo, costas = false) { g.rotation.set(0, Math.atan2(alvo.x - g.position.x, alvo.z - g.position.z) + (costas ? Math.PI : 0), 0); }
  const dentro = (r, x, z, m = .6) => ({ x: clamp(x, r.x0 + m, r.x1 - m), z: clamp(z, r.z0 + m, r.z1 - m) });
  const sussurro = (pos, dur = .7, vol = .13) => K.voz(pos, { sopro: true, vogais: [[500, 1900], [700, 1700], [350, 2300]], dur, vol, wet: .1 });
  const lampadas = (raio = 99) => W.lampadas.filter(L => L.ligada && !L.estourada && Math.hypot(L.x - P.pos.x, L.z - P.pos.z) < raio);
  function apagarTodas() { for (const L of W.lampadas) if (L.ligada && !L.estourada) { L.ligada = false; L.luz.intensity = 0; L.bulbo.material.emissiveIntensity = 0; } }
  function acenderDeNovo() { if (!PROC.fase) E.syncLuzes(); }

  // ---------------- modelos próprios (não dividem a sombra de outros módulos)
  const MODELOS = [];
  function clonarSombra() {
    const g = E.MON.g.clone(true); g.visible = false; scene.add(g);
    g.userData.cabeca = g.children.find(c => c.isGroup && Math.abs(c.position.y - 3.62) < .02);
    MODELOS.push(g); return g;
  }
  function fazCrianca() {
    const g = new THREE.Group();
    E.cyl(.1, .22, .9, E.MAT.sombra, 0, .45, 0, 8, g);
    const c = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), E.MAT.sombra); c.position.y = 1.05; g.add(c);
    g.visible = false; scene.add(g); MODELOS.push(g); return g;
  }
  function fazBoneca() { // boneca de pano: cabeça clara, vestido escuro, braços abertos
    const g = new THREE.Group();
    const pano = new THREE.MeshStandardMaterial({ color: 0xb9ab8e, roughness: 1 }), veste = new THREE.MeshStandardMaterial({ color: 0x3a2a30, roughness: 1 });
    E.cyl(.07, .13, .3, veste, 0, .15, 0, 8, g);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.085, 10, 8), pano); cab.position.y = .38; g.add(cab);
    for (const s of [-1, 1]) { E.box(.2, .04, .04, pano, s * .15, .26, 0, g, false); const o = new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 6), new THREE.MeshBasicMaterial({ color: 0x000000 })); o.position.set(s * .03, .4, .075); g.add(o); }
    g.visible = false; scene.add(g); MODELOS.push(g); return g;
  }
  function fazMao() {
    const g = new THREE.Group(), pele = new THREE.MeshStandardMaterial({ color: 0xb8b0a2, roughness: .8, emissive: 0x1a1814, emissiveIntensity: .7 });
    E.box(.09, .025, .3, pele, 0, 0, .15, g, false);
    for (let i = 0; i < 4; i++) E.box(.014, .014, .16, pele, (i - 1.5) * .022, 0, .38, g, false);
    g.visible = false; scene.add(g); MODELOS.push(g); return g;
  }
  const SOMB = clonarSombra(), SOMB2 = clonarSombra(), KID = fazCrianca(), BONECA = fazBoneca(), MAO = fazMao();
  function esconderModelos() { for (const g of MODELOS) { g.visible = false; g.scale.setScalar(1); g.rotation.set(0, 0, 0); } }

  // ---------------- camada de tela própria (créditos falsos, giz na janela, tela que "fecha")
  function tela(id, css, html = '') {
    let el = document.getElementById(id);
    if (!el) { el = document.createElement('div'); el.id = id; document.body.appendChild(el); }
    el.style.cssText = 'position:fixed;inset:0;z-index:9500;pointer-events:none;display:flex;align-items:center;justify-content:center;' + css;
    el.innerHTML = html; el.hidden = false; return el;
  }
  function tiraTela(id) { const el = document.getElementById(id); if (el) el.remove(); }

  // ---------------- memória entre noites: modos e frequência de sustos
  const modos = () => { const o = lsGet(); return o.modos || {}; };
  function setModo(k, v) { lsMuda(o => { o.modos = o.modos || {}; o.modos[k] = v; }); }
  const sangueFrio = () => !!modos().sangueFrio;
  const insone = () => !!modos().insone;
  const casaMente = () => !!modos().mente;
  const freq = () => { const f = modos().freq; return typeof f === 'number' ? clamp(f, 0, 200) / 100 : 1; };
  let avisoSalvo = null;
  function aplicarModos() {
    try {
      if (sangueFrio()) { if (avisoSalvo === null) avisoSalvo = E.OPT.avisoSusto; E.OPT.avisoSusto = false; }
      else if (avisoSalvo !== null) { E.OPT.avisoSusto = avisoSalvo; avisoSalvo = null; }
    } catch (e) { /* opção ausente: tudo bem */ }
  }

  // =====================================================================  BARALHO DE SUSTOS COM MEMÓRIA DE 30 NOITES
  const DECK = [
    { id: 'cadeira', nome: 'A cadeira que gira sozinha', ok: () => salaInterna() && !ameaca(), fn: evCadeira },
    { id: 'acena', nome: 'O vulto que acena do fundo', ok: () => corredorLongo() && !M.ativo, fn: evAcena },
    { id: 'teto', nome: 'Os passos no teto', ok: () => W.mapa !== 'estrada' && !P.room.fora && !ameaca(), fn: evTeto },
    { id: 'soletra', nome: 'A lâmpada que soletra um nome', ok: () => lampPerto() && !ameaca(), fn: evSoletra },
    { id: 'goteira', nome: 'A goteira que virou sussurro', ok: () => !P.room.fora && !ameaca(), fn: evGoteira },
    { id: 'respira_corr', nome: 'O corredor que respira', ok: () => corredorLongo() && !ameaca(), fn: evRespiraCorr },
    { id: 'falsa_porta', nome: 'A porta que não estava ali', ok: () => corredorLongo() && !M.ativo && noite() >= 2, fn: evFalsaPorta },
    { id: 'coringa', nome: 'Uma entidade fora do roteiro', ok: () => !ameaca() && noite() >= 3, fn: evCoringa },
    { id: 'alto', nome: 'A figura alta demais', ok: () => corredorLongo() && noite() >= 4 && !M.ativo, fn: evAlto },
    { id: 'movido', nome: 'Um objeto fora do lugar', ok: () => salaInterna() && noite() >= 2 && !ameaca(), fn: evMovido },
    { id: 'boneca_chao', nome: 'A boneca que agora olha a porta', ok: () => salaInterna() && noite() >= 2 && !ameaca(), fn: evBonecaChao },
    { id: 'lenda', nome: 'O vulto lendário de quem viu três finais', ok: () => corredorLongo() && finais() >= 3 && !M.ativo, fn: evLenda },
    { id: 'sombra_parede', nome: 'Uma sombra desliza pela parede', ok: () => salaInterna() && !ameaca(), fn: evSombraParede },
    { id: 'vela', nome: 'Uma vela que acende sozinha', ok: () => lampPerto() && !ameaca(), fn: evVela },
    { id: 'crianca_corre', nome: 'Uma criança que corre e some', ok: () => corredorLongo() && noite() >= 3 && !M.ativo, fn: evCriancaCorre },
    { id: 'nome_parede', nome: 'Um nome rabiscado na parede', ok: () => salaInterna() && !ameaca(), fn: evNomeParede },
    { id: 'respiro_porta', nome: 'Respiração atrás de uma porta', ok: () => !!portaFechadaPerto() && !ameaca(), fn: evRespiroPorta },
    { id: 'risos', nome: 'Risadinhas que se afastam', ok: () => !ameaca(), fn: evRisos },
    { id: 'passos_param', nome: 'Passos atrás que param quando você vira', ok: () => !P.room.fora && !ameaca(), fn: evPassosParam },
    { id: 'silencio_total', nome: 'O Silêncio Total', ok: () => !ameaca() && noite() >= 2 && !P.room.fora, fn: evSilencioTotal },
    { id: 'vulto_trilha', nome: 'O vulto que refaz o seu caminho', ok: () => !ameaca() && noite() >= 2 && trilha.length > 40, fn: evVultoTrilha },
    { id: 'coro', nome: 'O coro de crianças', ok: () => !ameaca() && !P.room.fora, fn: evCoro },
    { id: 'aviso_vazio', nome: 'Todos os avisos, nenhum susto', ok: () => !ameaca() && noite() >= 2 && lampPerto(), fn: evAvisoVazio },
    { id: 'ninguem', nome: 'O susto que ninguém viu ainda', ok: () => salaInterna() && noite() >= 20 && !ameaca(), fn: evNinguem }
  ];
  const portaFechadaPerto = () => (K.portaDaSala ? K.portaDaSala(P.room, d => !d.open && Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 7)[0] : null);
  const salaInterna = () => P.room && !P.room.fora && P.room.tipo !== 'corredor';
  const corredorLongo = () => P.room && P.room.tipo === 'corredor' && Math.max(P.room.x1 - P.room.x0, P.room.z1 - P.room.z0) > 10;
  const lampPerto = () => W.lampadas.some(L => L.ligada && !L.estourada && Math.hypot(L.x - P.pos.x, L.z - P.pos.z) < 8);

  // peso: o que você nunca viu pesa muito; o que saiu nas últimas 10 noites quase não sai
  function pesoDoSusto(id, o, hojeN) {
    const vistos = o.vistos || {}; let atras = 0;
    for (const h of (o.hist || [])) if (h.n < hojeN && h.ids.includes(id)) atras = Math.max(atras, h.n);
    const faz = atras ? hojeN - atras : 0;
    if (id === 'ninguem') return 8;
    if (!vistos[id]) return 4;
    if (faz > 0 && faz <= 10) return .05;
    return 1;
  }
  function escolherEventosDaNoite() {
    const m = mem(); if (m.deckEscolhido) return; m.deckEscolhido = true;
    // hábitos da noite anterior viram perfil de hoje
    lsMuda(o => { if (o.habUlt && o.habUlt.n < noite()) { o.habAnt = o.habUlt; o.habUlt = null; } });
    const o = lsGet(), n = noite();
    const elegivel = DECK.filter(d => d.id !== 'ninguem' || n >= 20);
    const chave = elegivel.map(d => ({ id: d.id, k: Math.pow(Math.max(1e-9, sorte('deck' + d.id)), 1 / pesoDoSusto(d.id, o, n)) })).sort((a, b) => b.k - a.k).map(x => x.id);
    let qtd = (sorte('deckN') < .35 ? 2 : 1) * freq();
    qtd = Math.floor(qtd) + (sorte('deckF') < qtd - Math.floor(qtd) ? 1 : 0);
    if (noiteMansa() || noiteVazia()) qtd = 0;
    m.eventos = chave.slice(0, Math.min(5, qtd));
    m.reserva = chave.slice(Math.min(5, qtd), 14); // para a Madrugada Cruel e a Calmaria Falsa
  }
  function registrarVisto(id) {
    const m = mem(); let novo = false;
    lsMuda(o => {
      o.vistos = o.vistos || {}; if (!o.vistos[id]) novo = true; o.vistos[id] = (o.vistos[id] || 0) + 1;
      o.hist = (o.hist || []).filter(h => h.n > noite() - 30);
      let h = o.hist.find(x => x.n === noite()); if (!h) { h = { n: noite(), ids: [] }; o.hist.push(h); }
      if (!h.ids.includes(id)) h.ids.push(id);
    });
    if (novo) m.novos = (m.novos || 0) + 1;
    const o = lsGet(), n = Object.keys(o.vistos).length;
    if (n >= 3) conquista('l6_sem_repetir');
    if (n >= DECK.length) conquista('l6_colecionadora');
    return novo;
  }
  // um susto de roteiro visto de novo troca de forma: vem dobrado, vem só o aviso, ou vem atrasado
  function dispararEvento(d, forcado) {
    const m = mem(); m['ev_' + d.id] = true;
    const vezes = (lsGet().vistos || {})[d.id] || 0;
    const novo = registrarVisto(d.id);
    m.proxEv = agora() + rand(55, 85);
    K.depois(9, () => { try { if (jogando() && novo) E.toast(T.colecao.replace('{novos}', m.novos || 1).replace('{n}', Object.keys(lsGet().vistos || {}).length).replace('{t}', DECK.length)); } catch (e) { /* aviso é bônus */ } });
    if (vezes >= 1 && !forcado) {
      const r = sorte('sub' + d.id + vezes);
      if (r < .33) { seguro(d.fn)(); K.depois(rand(6, 9), () => { if (jogando() && !ameaca()) seguro(d.fn)(); }); return; } // dobrado
      if (r < .66) { leg(T.veterano_leg); E.SFX.estalo({ x: P.pos.x, z: P.pos.z }, .35); E.SFX.estatica(.5); return; } // só o aviso
      E.SFX.estalo(K.atras(2), .4); K.depois(rand(1.2, 2.6), () => { if (jogando() && !ameaca()) seguro(d.fn)(); }); return; // atrasado
    }
    seguro(d.fn)();
  }
  function dispararEventosDaNoite() {
    const m = mem(); if (!m.eventos || !jogando() || teste() || agora() < (m.proxEv || 0) || freq() <= 0) return;
    for (const id of m.eventos) {
      if (m['ev_' + id]) continue;
      const d = DECK.find(x => x.id === id); if (!d) continue;
      if (!(FORCA.has(id) || seguro(d.ok)())) continue;
      dispararEvento(d, FORCA.has(id)); break; // um por vez; o outro espera a próxima oportunidade
    }
  }

  // --- handlers dos eventos (todos sem dano) ---
  function evCadeira() {
    const r = P.room, p = dentro(r, P.pos.x + (sorte('cadX') < .5 ? 2.6 : -2.6), P.pos.z + (sorte('cadZ') < .5 ? 2.6 : -2.6));
    const g = new THREE.Group(); g.position.set(p.x, 0, p.z); W.grupo.add(g);
    E.cyl(.14, .14, .03, E.MAT.madeiraEsc, 0, .46, 0, 10, g);
    for (const [dx, dz] of [[.1, .1], [-.1, -.1], [.1, -.1], [-.1, .1]]) E.cyl(.02, .02, .46, E.MAT.madeira, dx, .23, dz, 6, g);
    E.box(.26, .3, .03, E.MAT.madeiraEsc, 0, .62, -.12, g, false);
    let t = 0, disse = false;
    K.anima(g, dt => {
      t += dt; const d = Math.hypot(P.pos.x - p.x, P.pos.z - p.z);
      if (olhando(p, .72) && d > 1.6) { g.rotation.y += dt * 2.2; if (!disse) { disse = true; leg(T.cadeira); E.SFX.rangido(p.x, .5, p.z, .25); } }
      if (d < 1.4 || t > 16 || !jogando()) { W.grupo.remove(g); return true; }
    });
  }
  function evAcena() {
    const p = K.fundoCorredor(P.room, 10); if (!p) return;
    const g = SOMB; g.scale.setScalar(1); g.position.set(p.x, 0, p.z); viraPara(g, P.pos); g.visible = true;
    let t = 0; leg(T.acena);
    K.anima(g, dt => {
      t += dt; if (g.userData.cabeca) g.userData.cabeca.rotation.z = Math.sin(t * 3) * .25; g.rotation.z = Math.sin(t * 4) * .06;
      if ((S().flashOn && t > 1.2 && E.visivel({ x: p.x, z: p.z }, 2.4, 18)) || t > 7 || !jogando()) { g.visible = false; g.rotation.z = 0; E.SFX.estatica(.12); return true; }
    });
  }
  function evTeto() {
    leg(T.teto); let t = 0, passoT = 0;
    K.anima({ isGroup: true }, dt => {
      t += dt; passoT -= dt;
      if (passoT <= 0 && movendo) { passoT = .55; K.passoPos({ x: P.pos.x + rand(-1, 1), y: 4.4, z: P.pos.z + rand(-1, 1) }, .7); }
      if (t > 22 || !jogando() || P.room.fora) return true;
    });
  }
  function evSoletra() {
    const L = lampadas(8).sort((a, b) => Math.hypot(a.x - P.pos.x, a.z - P.pos.z) - Math.hypot(b.x - P.pos.x, b.z - P.pos.z))[0]; if (!L) return;
    leg(T.soletra_leg); const padrao = [1, 0, 1, 1, 0, 1]; let i = 0;
    const passo = () => {
      if (i >= padrao.length || !jogando()) { if (!L.estourada && !PROC.fase) { L.ligada = true; L.luz.intensity = L.base; L.bulbo.material.emissiveIntensity = 2; } if (jogando()) E.sub('lia', T.soletra_lia); return; }
      if (!L.estourada) { L.ligada = !!padrao[i]; L.luz.intensity = padrao[i] ? L.base : 0; L.bulbo.material.emissiveIntensity = padrao[i] ? 2 : 0; }
      E.SFX.estalo({ x: L.x, z: L.z }, .2); i++; K.depois(.4, passo);
    };
    passo();
  }
  function evGoteira() {
    const p = { x: P.pos.x + rand(-3, 3), y: 2.4, z: P.pos.z + rand(-3, 3) };
    let i = 0; const pingo = () => { if (i >= 5 || !jogando()) { if (jogando()) { sussurro({ x: p.x, y: 1.2, z: p.z }, .6, .1); leg(T.goteira); } return; } E.SFX.estalo({ x: p.x, z: p.z }, .18); i++; K.depois(.7 - i * .08, pingo); };
    pingo();
  }
  function evRespiraCorr() {
    leg(T.respira_corr); let t = 0;
    K.anima({ isGroup: true }, dt => { t += dt; if (Math.floor(t) !== Math.floor(t - dt)) K.respiracao({ x: P.pos.x, y: 1.5, z: P.pos.z }, 1.4, true, .18); if (t > 10 || !jogando() || ameaca()) return true; });
  }
  function evFalsaPorta() {
    const r = P.room, f = K.fwdH(), ax = Math.abs(f.x) > Math.abs(f.z) ? 'x' : 'z';
    const wall = ax === 'x' ? (f.x > 0 ? r.x1 - .06 : r.x0 + .06) : (f.z > 0 ? r.z1 - .06 : r.z0 + .06);
    const c = dentro(r, P.pos.x + f.x * 6, P.pos.z + f.z * 6, .8), x = ax === 'x' ? wall : c.x, z = ax === 'x' ? c.z : wall;
    const mat = new THREE.MeshStandardMaterial({ color: 0x120e0a, roughness: 1, emissive: 0x060402, emissiveIntensity: .3, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const porta = E.plano(1.0, 2.1, mat, x, 1.05, z, ax === 'x' ? Math.PI / 2 : 0); leg(T.falsa_porta); let t = 0;
    K.anima(porta, dt => {
      t += dt; const d = Math.hypot(P.pos.x - x, P.pos.z - z); mat.opacity = t < 1 ? t * .9 : d < 2.5 ? Math.max(0, mat.opacity - dt * 3) : .9;
      if ((d < 2.2 && t > 1) || t > 20 || !jogando()) { W.grupo.remove(porta); E.SFX.estatica(.1); return true; }
    });
  }
  function evCoringa() { // a Ana conta até dez duas vezes, OU a Procissão ecoa ao contrário (só som)
    leg(T.coringa_leg); const p = K.atras(3);
    if (sorte('coringaTipo') < .5) { for (let i = 0; i < 10; i++) K.depois(i * .5, () => E.SFX.contagem(p, i)); K.depois(5.4, () => { for (let i = 0; i < 10; i++) K.depois(i * .5, () => E.SFX.contagem(p, i)); }); }
    else { for (let i = 9; i >= 0; i--) K.depois((9 - i) * .4, () => E.SFX.contagem(p, i)); E.SFX.estatica(1.2, p); }
    conquista('l6_coringa');
  }
  function figuraAlta(escala, fimLeg) {
    const p = K.fundoCorredor(P.room, 12); if (!p) return;
    const g = SOMB; g.scale.set(1.15 * escala, 1.9 * escala, 1.15 * escala); g.position.set(p.x, 0, p.z); viraPara(g, P.pos); g.visible = true;
    leg(T.alto_leg); let t = 0; E.SFX.estatica(.08);
    K.anima(g, dt => { t += dt; if ((S().flashOn && t > 1.5) || t > 9 || !jogando()) { g.visible = false; g.scale.setScalar(1); K.respiracao({ x: p.x, y: 3, z: p.z }, 1.2, true, .12); conquista('l6_alto'); return true; } });
  }
  function evAlto() { figuraAlta(1); }
  function evLenda() { figuraAlta(1.1); }
  function evMovido() { // uma banqueta no meio da sala, fora do lugar; a Lia repara
    const r = P.room, p = dentro(r, P.pos.x + (sorte('movX') < .5 ? 2 : -2), P.pos.z + (sorte('movZ') < .5 ? 2 : -2));
    const g = new THREE.Group(); g.position.set(p.x, 0, p.z); W.grupo.add(g);
    E.box(.22, .02, .22, E.MAT.madeiraEsc, 0, .4, 0, g); E.box(.2, .26, .02, E.MAT.madeiraEsc, 0, .54, -.1, g, false);
    E.cyl(.015, .015, .4, E.MAT.madeira, .08, .2, .08, 6, g); E.cyl(.015, .015, .4, E.MAT.madeira, -.08, .2, -.08, 6, g);
    g.rotation.y = sorte('movR') * 6.28; E.SFX.rangido(p.x, .3, p.z, .2);
    K.depois(1.2, () => { if (jogando()) E.sub('lia', sorte('movSumiu') < .4 ? T.sumiu : T.movido); });
    let t = 0; K.anima(g, dt => { t += dt; if (t > 18 || !jogando() || Math.hypot(P.pos.x - p.x, P.pos.z - p.z) < 1) { W.grupo.remove(g); return true; } });
  }
  function evBonecaChao() { // uma boneca de costas no chão; quando você olha, está virada para a porta
    const r = P.room, p = dentro(r, P.pos.x + 1.6, P.pos.z + 1.2, .5), g = BONECA;
    g.scale.setScalar(1.3); noChao(g, p.x, p.z); viraPara(g, P.pos, true); g.visible = true;
    let t = 0, virou = false;
    K.anima(g, dt => {
      t += dt;
      if (!virou && t > .8 && olhando(p, .5)) { virou = true; viraPara(g, { x: P.pos.x, z: P.pos.z - 10 }); E.SFX.arrastar(); }
      if (t > 10 || !jogando() || Math.hypot(P.pos.x - p.x, P.pos.z - p.z) < 1.2) { g.visible = false; g.scale.setScalar(1); return true; }
    });
  }
  function evSombraParede() {
    const r = P.room, g = SOMB2; g.scale.set(.6, 1.3, .6);
    const x0 = r.x0 + .4, x1 = r.x1 - .4, z = sorte('sombZ') < .5 ? r.z0 + .4 : r.z1 - .4;
    g.position.set(x0, 0, z); viraPara(g, { x: x1, z }); g.visible = true; leg(T.sombra_parede); let t = 0;
    K.anima(g, dt => { t += dt; g.position.x = lerp(x0, x1, Math.min(1, t / 3)); if (t > 3 || !jogando()) { g.visible = false; g.scale.setScalar(1); E.SFX.estatica(.08); return true; } });
  }
  function evVela() {
    const L = lampadas(8).sort((a, b) => Math.hypot(a.x - P.pos.x, a.z - P.pos.z) - Math.hypot(b.x - P.pos.x, b.z - P.pos.z))[0]; if (!L) return;
    leg(T.vela_leg); L.luz.color.setHex(0xffb060); L.luz.intensity = L.base * 1.2;
    K.depois(5, () => { L.luz.color.setHex(0xffffff); E.SFX.estalo({ x: L.x, z: L.z }, .2); });
  }
  function evCriancaCorre() {
    const r = P.room, ax = (r.x1 - r.x0) > (r.z1 - r.z0) ? 'x' : 'z', f = K.fwdH();
    const cm = ax === 'x' ? clamp(P.pos.x + f.x * 7, r.x0 + .5, r.x1 - .5) : (r.x0 + r.x1) / 2;
    const cz = ax === 'x' ? (r.z0 + r.z1) / 2 : clamp(P.pos.z + f.z * 7, r.z0 + .5, r.z1 - .5);
    const de = ax === 'x' ? { x: cm, z: r.z0 + .4 } : { x: r.x0 + .4, z: cz }, para = ax === 'x' ? { x: cm, z: r.z1 - .4 } : { x: r.x1 - .4, z: cz };
    K.andarModelo(KID, de, para, 3.2, { descalco: true, passo: .14 }); E.SFX.estatica(.08);
  }
  function evNomeParede() {
    const nomes = ['LIA', 'DAVI', 'TOMÉ', 'ANA', 'LUIZ'], nome = nomes[Math.floor(sorte('nomeP') * nomes.length)];
    const r = P.room, f = K.fwdH(), ax = Math.abs(f.x) > Math.abs(f.z) ? 'x' : 'z';
    const c = dentro(r, P.pos.x + f.x * 3, P.pos.z + f.z * 3);
    const x = ax === 'x' ? (f.x > 0 ? r.x1 - .06 : r.x0 + .06) : c.x, z = ax === 'x' ? c.z : (f.z > 0 ? r.z1 - .06 : r.z0 + .06);
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 96; const g = cv.getContext('2d'); g.fillStyle = 'rgba(232,228,214,.9)'; g.font = 'bold 40px Georgia'; g.textAlign = 'center'; g.fillText(nome, 128, 64);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const pl = E.plano(.9, .34, mat, x, 1.5, z, ax === 'x' ? Math.PI / 2 : 0);
    pl.userData.leitura = { t: nome + ' (rabiscado na parede, de letra tremida)', parede: true }; leg(T.nome_parede_leg); let t = 0;
    K.anima(pl, dt => { t += dt; mat.opacity = t < 1 ? t * .85 : t < 8 ? .85 : Math.max(0, .85 - (t - 8)); if (t > 9 || !jogando()) { W.grupo.remove(pl); tex.dispose(); mat.dispose(); return true; } });
  }
  function evRespiroPorta() {
    const d = portaFechadaPerto(); if (!d) return; leg(T.respiro_porta);
    const f = K.fwdH(); K.respiracao({ x: d.x + f.x * .3, y: 1.4, z: d.z + f.z * .3 }, 3, false, .4); E.SFX.rangido(d.x, 1, d.z, .15);
  }
  function evRisos() {
    leg(T.risos); const a = K.atras(2); let i = 0; const r = () => { if (i >= 3 || !jogando()) return; E.SFX.risada(a.x + rand(-2, 2) - i, a.z + rand(-2, 2)); i++; K.depois(.7, r); }; r();
  }
  function evPassosParam() {
    leg(T.passos_param); let t = 0, passoT = 0; const yaw0 = P.yaw;
    K.anima({ isGroup: true }, dt => {
      t += dt; passoT -= dt; const virou = Math.abs(Math.atan2(Math.sin((P.yaw || 0) - yaw0), Math.cos((P.yaw || 0) - yaw0))) > 1.0 || (P.olhar || 0) > 1;
      if (passoT <= 0 && !virou && movendo) { passoT = .55; const a = K.atras(1.5 + Math.sin(t) * .3); K.passoPos({ x: a.x, y: .08, z: a.z }, .45, true); }
      if (t > 16 || !jogando() || P.room.fora) return true;
    });
  }
  // todo som do mundo cai a zero; o HUD some; depois uma batida única vem de trás. Dura mais quando você está calma.
  function evSilencioTotal() {
    const s = S(), dur = 4 + (s.fear < 20 ? 2 : 0), hud = document.getElementById('hud');
    leg(T.silencio_leg); K.vacuo(dur, 0); if (hud) hud.style.visibility = 'hidden';
    K.depois(dur, () => {
      if (hud) hud.style.visibility = '';
      if (!jogando()) return;
      const a = K.atras(2.5); E.SFX.portaBate(); E.SFX.pancada(a.x, a.z); K.marcarForte(); P.shake = Math.max(P.shake || 0, .1); leg(T.silencio_fim); conquista('l6_silencio');
    });
  }
  // uma silhueta caminha pelo caminho que você fez 8 s atrás, parando onde você parou; a luz a desfaz
  function evVultoTrilha() {
    const g = SOMB; g.scale.setScalar(1); g.visible = false; leg(T.trilha_leg); let t = 0, vista = 0;
    K.anima(g, dt => {
      t += dt; const alvoT = agora() - 8; let p = null;
      for (let i = trilha.length - 1; i >= 0; i--) if (trilha[i].t <= alvoT) { p = trilha[i]; break; }
      if (!p) return t > 30;
      noChao(g, p.x, p.z); g.rotation.y = p.yaw; g.visible = Math.hypot(P.pos.x - p.x, P.pos.z - p.z) > 2.5 && P.room && !P.room.fora === !E.roomAt(p.x, p.z).fora;
      if (g.visible && S().flashOn && olhando(p, .93)) vista += dt; else vista = Math.max(0, vista - dt);
      if (vista > .8 || t > 28 || !jogando()) { g.visible = false; E.SFX.estatica(.12); conquista('l6_trilha'); return true; }
    });
  }
  function evCoro() { // um coro de crianças canta baixinho num rádio longe
    leg(T.coro_leg); const p = K.atras(7);
    [[261, 0], [329, .15], [392, .3]].forEach(([f0, atraso]) => K.depois(atraso, () => K.voz(p, { f0, vogais: [[400, 2200], [600, 1700], [400, 2200], [330, 2400]], dur: 3, vol: .06, wet: .8, cai: .96 })));
    K.notas(p, [523, 494, 440, 392], .7, .04);
  }
  // luz pisca, o rádio chia, passos se aproximam... e nada. O susto de verdade vem depois, longe do aviso.
  function evAvisoVazio() {
    leg(T.aviso_vazio_leg); E.SFX.estatica(3);
    const ls = lampadas(14); ls.forEach((L, i) => K.depois(i * .15, () => { if (L.estourada) return; L.ligada = false; L.luz.intensity = 0; L.bulbo.material.emissiveIntensity = 0; K.depois(.2 + (i % 3) * .1, () => { if (!L.estourada && !PROC.fase) { L.ligada = true; L.luz.intensity = L.base; L.bulbo.material.emissiveIntensity = 2; } }); }));
    for (let i = 0; i < 6; i++) K.depois(1 + i * .6, () => { const a = K.atras(6 - i); K.passoPos(a, .4 + i * .05); });
    K.depois(5.5, () => { if (jogando()) E.syncLuzes(); K.D.proxAmb = Math.min(K.D.proxAmb, agora() + 25); }); // o de verdade vem logo depois, longe
  }
  function evNinguem() { // só depois de 20 noites: alguém esperava sentado num canto
    const r = P.room, p = dentro(r, (r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2 + (sorte('ninguemZ') < .5 ? 2 : -2)), g = SOMB;
    g.scale.set(.95, .72, .95); noChao(g, p.x, p.z); g.rotation.y = Math.atan2(r.x1 - p.x, 0); g.visible = true; leg(T.ninguem_leg); let t = 0, vista = 0;
    K.anima(g, dt => { t += dt; if (S().flashOn && olhando(p, .9) && E.visivel({ x: p.x, z: p.z }, 1, 14)) vista += dt; if (vista > 1.6 || t > 14 || !jogando()) { g.visible = false; g.scale.setScalar(1); E.SFX.estatica(.2); return true; } });
  }

  // =====================================================================  TRILHA, HÁBITOS E O QUE A JOGADORA FAZ
  const trilha = []; // {x,z,yaw,t}: posições dos últimos ~20 s
  let trilhaT = 0, movendo = false, lastPX = null, lastPZ = null, pitch0 = 0, pulosNoite = 0, qAnt = false;
  function registrarPassos(dt) {
    trilhaT -= dt; if (trilhaT > 0) return; trilhaT = .25;
    trilha.push({ x: P.pos.x, z: P.pos.z, yaw: P.yaw || 0, t: agora() });
    while (trilha.length && trilha[0].t < agora() - 22) trilha.shift();
  }
  const chaveArm = L => `${W.mapa}:${Math.round(L.x)}:${Math.round(L.z)}`;
  function habitoDominante() {
    const h = lsGet().habAnt; if (!h || noite() < 2) return null;
    const tot = Math.max(60, h.tot || 0), arm = Object.entries(h.arm || {}).sort((a, b) => b[1] - a[1])[0];
    const pont = { q: (h.q || 0) / 6, correr: ((h.run || 0) / tot) / .22, lanterna: ((h.flash || 0) / tot) / .65, armario: arm ? arm[1] / 3 : 0 };
    const ordem = Object.entries(pont).sort((a, b) => b[1] - a[1]); return ordem[0][1] >= 1 ? { tipo: ordem[0][0], arm: arm && arm[0] } : null;
  }
  function salvarHabitos() {
    const m = mem(); if (teste()) return;
    lsMuda(o => { o.habUlt = { n: noite(), q: m.qRise || 0, run: m.runT || 0, flash: m.flashT || 0, tot: m.totT || 0, arm: m.armN || {} }; });
  }
  function lerHabitos(dt, s) {
    const m = mem(); m.totT = (m.totT || 0) + dt; if (s.flashOn) m.flashT = (m.flashT || 0) + dt; if (P.sprinting) { m.runT = (m.runT || 0) + dt; if (P.room.tipo === 'corredor') m.runCorr = (m.runCorr || 0) + dt; }
    m.salvaT = (m.salvaT || 0) + dt; if (m.salvaT > 25) { m.salvaT = 0; salvarHabitos(); }
    const q = !!(E.keys && E.keys.KeyQ);
    if (q && !qAnt && !s.hidden) { m.qRise = (m.qRise || 0) + 1; habitoQ(m); }
    qAnt = q;
  }
  // olhar para trás com Q três vezes: na próxima, algo está lá no fundo
  function habitoQ(m) {
    const dom = habitoDominante(), limite = dom && dom.tipo === 'q' ? 2 : 3;
    if (teste() || noite() < 2 || m.qQuebrouCap || m.qRise < limite + 1 || ameaca() || !salaInterna() && !corredorLongo()) return;
    m.qQuebrouCap = true;
    K.depois(.55, () => {
      if (!jogando() || ameaca()) return;
      const r = P.room, a = K.atras(7), p = dentro(r, a.x, a.z, .8), g = SOMB; g.scale.setScalar(1); noChao(g, p.x, p.z); viraPara(g, P.pos); g.visible = true; E.SFX.estatica(.1);
      let t = 0; K.anima(g, dt => { t += dt; if (t > 1.5 || !jogando()) { g.visible = false; return true; } });
      K.depois(1.8, () => E.sub('lia', T.habito_q)); conquista('l6_habito');
    });
  }
  // correr sempre pelo mesmo corredor: o chão estala alto, na frente
  function habitoCorrer(m) {
    const dom = habitoDominante(); if (teste() || noite() < 2 || m.runQuebrou || ameaca()) return;
    if ((m.runCorr || 0) < (dom && dom.tipo === 'correr' ? 4 : 8)) return;
    m.runQuebrou = true; const f = K.fwdH(), p = { x: P.pos.x + f.x * 4, y: .05, z: P.pos.z + f.z * 4 };
    E.SFX.tabua(p, 1.2, 'madeira'); E.emitNoise(p.x, p.z, 4); leg(T.habito_run); conquista('l6_habito');
  }
  // lanterna sempre acesa: a luz morre por um instante, com um estalo antes
  function habitoLanterna(m, s) {
    const dom = habitoDominante(); if (teste() || noite() < 2 || m.lantQuebrouCap || ameaca() || !s.flashOn || (m.capT || 0) < 80) return;
    if (!(dom && dom.tipo === 'lanterna') && (m.flashT || 0) / Math.max(60, m.totT || 1) < .8) return;
    m.lantQuebrouCap = true; E.SFX.clique(); leg('[a luz estala]');
    K.depois(.9, () => { if (!jogando()) return; K.apagao(1.5, false); K.respiracao(K.atras(1.5), 1.5, false, .25); K.depois(2, () => E.sub('lia', T.habito_lanterna)); conquista('l6_habito'); });
  }
  // armário que você sempre usa: um dedo pela fresta
  function habitoArmario(L, m) {
    if (teste() || noite() < 2 || m.dedoFeito || L.tipo !== 'armario') return;
    const k = chaveArm(L), dom = habitoDominante(), n = (m.armN || {})[k] || 0;
    if (!(n >= 3 || (dom && dom.tipo === 'armario' && dom.arm === k && n >= 1))) return;
    m.dedoFeito = true;
    K.depois(rand(2, 4), () => {
      if (S().hidden !== L || ameaca()) return;
      const g = MAO; g.position.set(L.x + L.face[0] * .3, 1.45, L.z + L.face[1] * .3); g.rotation.set(0, Math.atan2(-L.face[0], -L.face[1]), 0); g.visible = true;
      K.arranhao({ x: g.position.x, y: 1.4, z: g.position.z }, 1.2); K.depois(1.6, () => { g.visible = false; }); K.depois(2.2, () => E.sub('lia', T.habito_arm)); conquista('l6_habito');
    });
  }
  // o armário que você mais usa pode estar ocupado numa noite sorteada (o Davi mudo, uma mão, dois olhos)
  function armarioOcupadoL6(L) {
    const m = mem(), s = S();
    if (L.l6Ocupado) { E.SFX.trancado(); E.toast(T.armocup_de_novo); return true; }
    if (teste() || noite() < 2 || m.armOcupFeito || L.tipo !== 'armario' || sorte('armOcup') > .34 || ameaca() || freq() <= 0) return false;
    const arm = lsGet().armTot || {}, k = chaveArm(L), top = Object.entries(arm).filter(([kk]) => kk.startsWith(W.mapa + ':')).sort((a, b) => b[1] - a[1])[0];
    if (!top || top[0] !== k || top[1] < 2) return false;
    m.armOcupFeito = true; L.l6Ocupado = true;
    const tipo = Math.floor(sorte('armTipo') * 3); // 0 Davi, 1 mão, 2 olhos
    E.SFX.trancado(); E.toast(T.armocup_toast);
    const p = { x: L.x, y: 1.4, z: L.z };
    if (tipo === 0) { K.depois(.5, () => { E.sub('davi', '...'); E.toast(T.armocup_davi); s.inv.pilhas = (s.inv.pilhas || 0) + 1; E.SFX.pegar(); }); }
    else if (tipo === 1) { K.depois(.4, () => { MAO.position.set(L.x + L.face[0] * .35, 1.2, L.z + L.face[1] * .35); MAO.rotation.set(0, Math.atan2(L.face[0], L.face[1]), 0); MAO.visible = true; K.arranhao(p, .9); E.toast(T.armocup_mao); K.depois(1.4, () => { MAO.visible = false; }); }); }
    else { K.depois(.4, () => { leg(T.armocup_olhos); K.respiracao(p, 1.5, false, .4); }); }
    E.emitNoise(L.x, L.z, 5); // o barulho chama o Inspetor para perto: procure outro lugar
    return true;
  }

  // =====================================================================  PEQUENOS HÁBITOS DO MUNDO
  // porta já visitada que bate quando você olha para trás
  function portaBateAtras(m) {
    if (teste() || noite() < 2 || ameaca() || m.portaBateu || sorte('portaAtras' + S().chapter) > .35) return;
    const d = K.portaDaSala(P.room, x => x.open && Math.hypot(x.x - P.pos.x, x.z - P.pos.z) > 3 && Math.hypot(x.x - P.pos.x, x.z - P.pos.z) < 12)[0]; if (!d) return;
    m.portaBateu = true; K.depois(.35, () => { if (jogando() && d.open) { K.bater(d); leg(T.porta_bate); } });
  }

  // =====================================================================  FALSA VITÓRIA (2ª jogada)
  let doneN = 0;
  function falsaVitoria() {
    const s = S(), n = Object.keys(s.done || {}).length;
    if (doneN === 0) { doneN = n; return; }
    if (n > doneN) {
      doneN = n; const m = mem();
      if (noite() >= 2 && !m.falsaVit && !ameaca() && sorte('falsaVit' + n) < .5 && !teste() && freq() > 0) {
        m.falsaVit = true; leg(T.falsa_vitoria); K.vacuo(2.4, .03); apagarTodas(); K.respiracao(K.atras(1), 2, true, .5);
        K.depois(2.2, () => { acenderDeNovo(); E.SFX.estalo({ x: P.pos.x, z: P.pos.z }, .4); });
      }
    }
  }
  // encarar uma porta fechada por uns 6 s forma uma cara de criança por um piscar
  let encaraT = 0;
  function curiosidade(dt) {
    const m = mem(); if (m.curio || ameaca() || teste()) { encaraT = 0; return; }
    const d = portaFechadaPerto(); const dd = d ? Math.hypot(d.x - P.pos.x, d.z - P.pos.z) : 0;
    if (d && dd > 2 && olhando(d, .985)) encaraT += dt; else encaraT = 0;
    if (encaraT > 6) {
      m.curio = true; encaraT = 0; const dx = d.x - P.pos.x, dz = d.z - P.pos.z, l = Math.hypot(dx, dz) || 1; const g = KID;
      noChao(g, P.pos.x + dx / l * 1.8, P.pos.z + dz / l * 1.8); viraPara(g, P.pos); g.visible = true; E.SFX.estatica(.12); let t = 0; K.anima(g, d2 => { t += d2; if (t > .35) { g.visible = false; return true; } });
    }
  }

  // =====================================================================  A CASA LEMBRA DA SUA MORTE
  const mortesAqui = () => (visGet().mortes || []).filter(x => x.mapa === W.mapa && x.x != null);
  const NOME_Q = { inspetor: 'O HOMEM ALTO', ana: 'A MENINA QUE CONTA', procissao: 'A PROCISSÃO' };
  function texturaGiz(w, h, desenha) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d'); desenha(g, w, h); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; return tex; }
  function lapideMorte() {
    const m = mem(); if (m.lapide || noite() < 2 || teste()) return;
    const db = mortesAqui(); if (!db.length) return;
    const d = db[db.length - 1]; if (Math.hypot(P.pos.x - d.x, P.pos.z - d.z) > 6) return; m.lapide = true;
    const nome = NOME_Q[d.q || 'inspetor'] || 'ELE';
    const tex = texturaGiz(256, 96, (g, w) => { g.fillStyle = 'rgba(232,228,214,.85)'; g.font = 'bold 22px Georgia'; g.textAlign = 'center'; g.fillText(nome, w / 2, 56); });
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false });
    const marca = E.plano(1.1, .4, mat, d.x, .03, d.z, 0); marca.rotation.order = 'YXZ'; marca.rotation.x = -Math.PI / 2; marca.rotation.y = Math.atan2(P.pos.x - d.x, P.pos.z - d.z);
    marca.userData.leitura = { t: nome + ' (escrito a giz, onde você caiu da última vez)', parede: false };
    let t = 0; K.anima(marca, dt => { t += dt; mat.opacity = t < 1 ? t * .8 : t < 7 ? .8 : Math.max(0, .8 - (t - 7)); if (t > 8) { W.grupo.remove(marca); tex.dispose(); mat.dispose(); return true; } }); leg(T.lapide_leg);
  }
  // contorno de giz com a lanterna caída; a lanterna pisca e uma respiração fraca sai do contorno; chegar a 1 m apaga tudo
  function corpoDeGiz() {
    const m = mem(); if (m.corpo || noite() < 2 || teste() || ameaca()) return;
    const db = mortesAqui(); if (!db.length) return;
    const d = db[db.length - 1]; if (Math.hypot(P.pos.x - d.x, P.pos.z - d.z) > 9) return; m.corpo = true;
    const tex = texturaGiz(128, 256, (g, w, h) => { g.strokeStyle = 'rgba(235,232,220,.9)'; g.lineWidth = 4; g.beginPath(); g.arc(w / 2, 40, 22, 0, 7); g.moveTo(w / 2, 62); g.lineTo(w / 2, 170); g.moveTo(w / 2 - 44, 90); g.lineTo(w / 2 + 44, 120); g.moveTo(w / 2, 170); g.lineTo(w / 2 - 22, 240); g.moveTo(w / 2, 170); g.lineTo(w / 2 + 24, 236); g.stroke(); g.fillStyle = 'rgba(255,230,160,.9)'; g.fillRect(w / 2 + 28, 130, 12, 34); });
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: .0, depthWrite: false });
    const corpo = E.plano(.9, 1.8, mat, d.x, .035, d.z, 0); corpo.rotation.order = 'YXZ'; corpo.rotation.x = -Math.PI / 2; corpo.rotation.y = Math.atan2(P.pos.x - d.x, P.pos.z - d.z);
    corpo.userData.leitura = { t: 'O contorno de giz de uma menina. A lanterna caída ainda tem um fio de luz.', parede: false };
    leg(T.corpo_leg); let t = 0, resp = 0;
    K.anima(corpo, dt => {
      t += dt; const dist = Math.hypot(P.pos.x - d.x, P.pos.z - d.z); mat.opacity = Math.min(.85, t * .6) * (Math.sin(t * 9) > -.3 ? 1 : .35);
      resp -= dt; if (dist < 4 && resp <= 0) { resp = 3; K.respiracao({ x: d.x, y: .3, z: d.z }, 1.4, false, .12); }
      if (dist < 1 || t > 45 || !jogando()) { W.grupo.remove(corpo); tex.dispose(); mat.dispose(); if (dist < 1) E.SFX.estatica(.15); return true; }
    });
  }
  function reencenarMorte() {
    const m = mem(); if (m.reencena || noite() < 2 || ameaca() || teste() || freq() <= 0) return;
    if (sorte('reencena' + S().chapter) > .22 && !FORCA.has('reencena')) return;
    const db = mortesAqui(); if (!db.length) return;
    const d = db[db.length - 1]; if (Math.hypot(P.pos.x - d.x, P.pos.z - d.z) > 9) return;
    m.reencena = true; const g = SOMB; g.scale.setScalar(1); noChao(g, d.x, d.z); viraPara(g, P.pos); g.visible = true; leg(T.reencena_leg); K.marcarForte();
    let t = 0; K.respiracao({ x: d.x, y: 1.5, z: d.z }, 1.5, d.q !== 'ana', .4);
    K.anima(g, dt => { t += dt; if (g.userData.cabeca) g.userData.cabeca.rotation.z = Math.min(.9, t * .6); if ((S().flashOn && t > 1.4) || t > 5 || !jogando()) { g.visible = false; if (g.userData.cabeca) g.userData.cabeca.rotation.z = 0; E.SFX.estatica(.14); conquista('l6_reencena'); return true; } });
  }
  function ajudaFantasma() {
    const m = mem(); if (m.ajuda || noite() < 2 || ameaca() || teste() || P.room.fora) return;
    if (!mortesAqui().some(d => Math.hypot(d.x - P.pos.x, d.z - P.pos.z) < 3.5)) return; m.ajuda = true;
    K.depois(1, () => { if (jogando()) E.sub('lia', T.fantasma_lia); });
  }
  function pegadasNG(dt) {
    if (finais() < 1 || P.room.fora || teste()) return;
    const m = mem(); m.pegT = (m.pegT || 0) - dt;
    if (m.pegT <= 0 && !ameaca() && movendo && Math.random() < .5) {
      m.pegT = rand(9, 16); const a = K.atras(1.6); K.passoPos({ x: a.x, y: .05, z: a.z }, .4, true);
      if (!m.pegLeg && Math.random() < .5) { m.pegLeg = true; leg(T.pegadas_ng); }
    }
  }

  // =====================================================================  ESCONDERIJO PODRE DA NOITE (itinerante)
  function marcarPodres() {
    const m = mem(); m.podres = m.podres || {}; if (m.podres[W.mapa] || teste()) return;
    const pod = m.podres[W.mapa] = {};
    const arm = W.lockers.filter(L => L.tipo === 'armario' && L !== K.D.armOcup), cam = W.lockers.filter(L => L.tipo === 'cama');
    pod.arm = arm.length ? arm[Math.floor(sorte('podreArm' + W.mapa) * arm.length)] : null;
    pod.cama = cam.length ? cam[Math.floor(sorte('podreCama' + W.mapa) * cam.length)] : null;
    if (pod.arm) { // tell justo: arranhões no verso da porta, legíveis sem tela cheia
      const L = pod.arm, tex = texturaGiz(128, 160, (g, w, h) => { g.strokeStyle = 'rgba(210,205,190,.65)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(20 + i * 11, 18 + (i % 3) * 8); g.lineTo(26 + i * 11, 130 - (i % 4) * 10); g.stroke(); } });
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: .55, depthWrite: false, side: THREE.DoubleSide });
      const marca = E.plano(.4, .5, mat, L.x + L.face[0] * .33, 1.45, L.z + L.face[1] * .33, Math.atan2(L.face[0], L.face[1]));
      marca.userData.leitura = { t: 'Arranhões no verso da porta, por dentro. Alguém já se escondeu aqui... e não aguentou.', parede: false };
    }
  }
  function updatePodre(dt, L) {
    const m = mem(), pod = (m.podres || {})[W.mapa]; if (!pod || !L || teste()) { m.podreT = 0; return; }
    if (L === pod.arm || L === pod.cama) {
      m.podreT = (m.podreT || 0) + dt;
      if (!m.podreAvisou && m.podreT > 1) { m.podreAvisou = true; if (L === pod.arm) leg(T.podre_tell); E.SFX.rangido(L.x, 1, L.z, .25); }
      if (m.podreT > 14 && !m.podreExpulsou && !ameaca()) {
        m.podreExpulsou = true; leg(T.podre_mao); K.respiracao({ x: L.x, y: 1.3, z: L.z }, 1, false, .5);
        const comDano = sorte('podreDano' + W.mapa) < .6; // "troca o que era real": algumas noites só assustam
        K.depois(.4, () => { try { E.sairEsconderijo(); } catch (e) { /* já saiu */ } if (comDano) S().health = Math.max(1, S().health - 8); S().fear = Math.min(100, S().fear + 18); P.shake = Math.max(P.shake || 0, .08); E.emitNoise(L.x, L.z, 3); E.SFX.pancada(L.x, L.z); conquista('l6_desconfiada6'); });
      }
    } else m.podreT = 0;
  }
  function updateQueimado(L) {
    const m = mem(); if (!L || L.tipo !== 'armario' || m.queimadoFeito || noite() < 2 || teste()) return;
    const foiAqui = mortesAqui().some(d => d.esc === 'armario' && Math.hypot(d.x - L.x, d.z - L.z) < 2);
    if (!foiAqui) return; m.queimadoFeito = true;
    K.depois(.6, () => leg(T.queimado_tell));
    K.depois(rand(4, 7), () => { if (S().hidden === L && !ameaca()) { const p = { x: L.x + L.face[0] * .3, y: 1.3, z: L.z + L.face[1] * .3 }; for (let i = 0; i < 3; i++) K.depois(i * .4, () => K.batida(p, .4)); K.depois(1.4, () => sussurro(p, .5, .11)); } });
  }

  // =====================================================================  SUSTO-ASSINATURA DA NOITE
  function assinaturaCedo() {
    const m = mem(); if (m.assinaCedo || ameaca() || teste() || freq() <= 0) return;
    if (sorte('assina' + S().chapter) > .4 * Math.min(1.5, freq()) && !FORCA.has('assina')) { m.assinaDesativada = true; return; }
    m.assinaCedo = true; const a = K.atras(5);
    const semVulto = noite() >= 3 && sorte('assinaTempo') < .5; // da 3ª noite em diante o prenúncio às vezes vem só no som
    K.depois(1, () => { leg(T.assinatura_cedo); E.SFX.estalo(a, .4); if (semVulto) return; const g = KID; noChao(g, a.x, a.z); viraPara(g, P.pos); g.visible = true; let t = 0; K.anima(g, dt => { t += dt; if (t > .25) { g.visible = false; return true; } }); });
  }
  function assinaturaFim() {
    const m = mem(); if (m.assinaDesativada || m.assinaPagou || !m.assinaCedo) return; m.assinaPagou = true;
    const fingir = casaMente() || (noite() >= 3 && sorte('assinaFinge') < .4); // pegadinha do veterano
    K.vacuo(.8); K.marcarForte();
    K.depois(.8, () => {
      if (fingir) { leg(T.veterano_leg); E.SFX.estatica(.2); return; }
      const a = K.atras(.8); E.SFX.susto(); K.respiracao(a, 1.2, true, .6); P.shake = Math.max(P.shake || 0, .08);
    });
  }

  // =====================================================================  NOITES SORTEADAS: Vazia, Mansa, Queda, Cruel, Calmaria Falsa
  const noiteMansa = () => !!mem().mansa;
  const noiteVazia = () => !!mem().vazia;
  function estadoDaNoite() {
    const m = mem(); if (m.estadoFeito || teste()) return; m.estadoFeito = true;
    const r = sorte('estadoNoite'), n = noite();
    if (n >= 3 && r < 1 / 20) { m.vazia = true; m.vaziaN = 0; m.vaziaProx = 40; K.depois(8, () => { if (jogando()) E.sub('lia', T.vazia_lia); }); }
    else if (n >= 2 && r < 1 / 20 + 1 / 12) { m.mansa = true; K.depois(6, () => { if (jogando()) { E.sub('lia', T.mansa_lia); E.toast(T.mansa_diario); conquista('l6_mansa'); } }); }
    else if (r < 1 / 20 + 1 / 12 + 1 / 10) m.quedaPend = true;
    else if (n >= 2 && r < 1 / 20 + 1 / 12 + 1 / 10 + 1 / 10) { m.cruelCap = 1 + Math.floor(sorte('cruelCap') * 4); } // Madrugada Cruel
    else if (n >= 3 && r < 1 / 20 + 1 / 12 + 1 / 10 + 1 / 10 + 1 / 14) { m.calmCap = 1 + Math.floor(sorte('calmCap') * 4); } // Calmaria Falsa
  }
  // Noite Vazia: nada de sustos de cenário; ele só fica parado a 3 m, no escuro, e você não vê (12 momentos)
  function updateVazia(dt) {
    const m = mem(); if (!m.vazia || !jogando() || (m.vaziaN || 0) >= 12) return;
    m.vaziaProx -= dt; if (m.vaziaProx > 0 || ameaca() || P.room.fora) return;
    m.vaziaProx = rand(55, 85); m.vaziaN++;
    const f = K.fwdH(), p = dentro(P.room, P.pos.x - f.x * 3, P.pos.z - f.z * 3, .6), g = SOMB;
    g.scale.setScalar(1); noChao(g, p.x, p.z); viraPara(g, P.pos); g.visible = true; let t = 0;
    K.anima(g, d => { t += d; if (t > 1.1 || olhando(p, .6) && t > .3 || !jogando()) { g.visible = false; return true; } });
  }
  function updateQueda(dt) {
    const m = mem(); if (!m.quedaPend || !jogando()) return;
    m.quedaT = (m.quedaT || 0) + dt;
    if (m.quedaT > 120 && !ameaca() && S().flags.energia && freq() > 0) {
      m.quedaPend = false; leg(T.queda_leg); apagarTodas(); E.SFX.estatica(.4); K.vacuo(3, .04);
      K.depois(20, () => { acenderDeNovo(); E.SFX.estalo({ x: P.pos.x, z: P.pos.z }, .4); });
    }
  }
  // Madrugada Cruel: três sustos encadeados em 20 s, seguidos de uma calmaria longa e falsa; a Lia não avisa
  function updateCruel(dt) {
    const m = mem(); if (!m.cruelCap || m.cruelCap !== S().chapter + 0 || m.cruelFeita || !jogando() || teste() || freq() <= 0) return;
    m.cruelT = (m.cruelT || 0) + dt; if (m.cruelT < 40 || ameaca()) return;
    m.cruelFeita = true; leg(T.cruel_leg); let feitos = 0;
    const lista = (m.reserva || DECK.map(d => d.id)).concat(DECK.map(d => d.id));
    const tenta = () => {
      if (!jogando() || feitos >= 3) { if (feitos >= 3) { K.D.proxAmb = agora() + 150; m.proxEv = agora() + 150; K.depois(25, () => conquista('l6_cruel')); } return; }
      const d = lista.map(id => DECK.find(x => x.id === id)).find(x => x && !m['ev_' + x.id] && seguro(x.ok)());
      if (d) { m['ev_' + d.id] = true; registrarVisto(d.id); seguro(d.fn)(); feitos++; }
      K.depois(feitos >= 3 ? 0 : 6.5, tenta);
    };
    tenta();
  }
  // Calmaria Falsa: um capítulo passa cinco minutos sem evento; no fim a conta vem, dois juntos
  function updateCalmaria(dt) {
    const m = mem(); if (!m.calmCap || m.calmCap !== S().chapter || m.calmFeita || !jogando() || teste()) return;
    m.calmT = (m.calmT || 0) + dt;
    if (m.calmT < 300) { m.proxEv = Math.max(m.proxEv || 0, agora() + 5); return; }
    if (ameaca()) return;
    m.calmFeita = true; leg(T.calmaria_leg); let n = 0;
    for (const d of DECK.filter(x => !m['ev_' + x.id]).sort(() => sorte('calm' + Math.random()) - .5)) { if (n >= 2) break; if (seguro(d.ok)()) { m['ev_' + d.id] = true; registrarVisto(d.id); seguro(d.fn)(); n++; } }
  }
  function onzeBadaladas() {
    const m = mem(); if (m.onze || noite() < 3 || W.mapa !== 'terreo' || S().chapter !== 2 || !S().flags.sx_badaladas) return;
    m.onze = true; if (sorte('onze') > 1 / 8 && !FORCA.has('onze')) return;
    m.onzeOk = true; K.depois(3, () => { E.SFX.sino(1.1); P.shake = Math.max(P.shake || 0, .16); leg(T.onze_leg); K.depois(1.6, () => E.sub('lia', T.onze_lia)); conquista('l6_mais_uma'); });
  }
  function anaOnze() {
    const m = mem(); if (!m.onzeOk || m.anaOnze || W.mapa !== 'terreo' || ameaca() || !salaInterna()) return; m.anaOnze = true;
    if (sorte('anaOnze') > .5) return;
    const p = K.atras(3); for (let i = 0; i < 11; i++) K.depois(i * .5, () => E.SFX.contagem(p, i)); K.depois(5.8, () => sussurro({ x: p.x, y: 1.3, z: p.z }, .6, .12));
  }

  // =====================================================================  O CHAMADO USA A SUA PIOR CAUSA DE MORTE
  function chamadoFundo() {
    if (noite() < 3) return null;
    const causas = statsGet().causas || {}; let pior = '', max = 0;
    for (const k of ['inspetor', 'ana', 'procissao']) if ((causas[k] || 0) > max) { max = causas[k]; pior = k; }
    if (!pior || sorte('chamFundo') > .5) return null;
    return T.chamado_fundo[pior] || null;
  }

  // =====================================================================  RECORDE ASSOMBRADO / RECOMPENSA / PULOS
  let recompensaPend = false;
  function recordeAssombrado() {
    const s = S(), m = mem(); if (!s || teste()) return;
    if ((m.mortesCap || 0) > 0 || (s.capDano || 0) >= 40) return;
    K.depois(1.2, () => { const a = K.atras(2); sussurro({ x: a.x, y: 1.4, z: a.z }, .5, .09); leg(T.recorde_leg); E.SFX.estalo(a, .5); });
    recompensaPend = true;
  }
  function recompensaBonita() {
    const L = lampadas(30).sort((a, b) => Math.hypot(a.x - P.pos.x, a.z - P.pos.z) - Math.hypot(b.x - P.pos.x, b.z - P.pos.z))[0]; if (!L) return;
    leg(T.recompensa_leg); L.luz.color.setHex(0xffb060); L.luz.intensity = L.base * 1.4; K.depois(4, () => { L.luz.color.setHex(0xffffff); });
  }
  function detectarPulo() {
    if (teste()) return;
    const reagiu = Math.abs((P.pitch || 0) - pitch0) > .18 || Math.abs(P.shake || 0) > .06; pitch0 = P.pitch || 0;
    if (agora() - K.D.ultimoForte < .5 && reagiu) {
      const m = mem(); if (m._puloT && agora() - m._puloT < 2) return; m._puloT = agora(); pulosNoite++;
      lsMuda(o => { o.pulos = (o.pulos || 0) + 1; });
      if (pulosNoite === 4 && !m.puloFala) { m.puloFala = true; const a = K.atras(.6); sussurro({ x: a.x, y: 1.5, z: a.z }, .6, .1); E.sub('voz', T.pulou); conquista('l6_pulona'); }
    }
  }

  // =====================================================================  A BONECA QUE ANDA ENTRE AS NOITES
  // Avança um pouco a cada noite jogada (o contador é o das partidas): sala de brinquedos, corredor, recepção, banco do carro.
  function posBoneca() {
    const n = clamp(noite(), 1, 7), mapa = W.mapa;
    if (n <= 3 && mapa === 'superior') { const r = salaPorId('brinq'); if (!r) return null; const k = (n - 1) / 3; return { x: lerp(r.x1 - 1.2, r.x0 + 1.2, k), z: lerp(r.z0 + 1.4, (r.z0 + r.z1) / 2, k), m: 'brinq' }; }
    if (n <= 5 && mapa === 'superior') { const r = salaPorId('corr'); return r ? { x: 1.9, z: lerp(-26, -8, (n - 3) / 2), m: 'corr' } : null; }
    if (n === 6 && mapa === 'terreo') return { x: 3.5, z: -9, m: 'hall' };
    if (n >= 7 && mapa === 'estrada') { const sp = W.def && W.def.spawns && W.def.spawns.carro; if (!sp) return null; const yaw = sp.yaw || 0; return { x: sp.x + Math.cos(yaw) * .8, z: sp.z - Math.sin(yaw) * .8, m: 'carro', banco: true }; }
    return null;
  }
    const salaPorId = id => W.salas.find(r => r.id === id) || null;
  function bonecaEntreNoites() {
    BONECA.visible = false; if (teste() && !window.__l6boneca) return;
    const p = posBoneca(); if (!p) return;
    const g = BONECA; g.scale.setScalar(p.banco ? 1.9 : 1.5); if (p.banco) g.position.set(p.x, .55, p.z); else noChao(g, p.x, p.z); g.visible = true;
    if (p.banco) { const m = mem(); if (!m.bancoLeg) { m.bancoLeg = true; leg(T.boneca_banco); } conquista('l6_boneca'); } else if ((mem().bonecaVista = (mem().bonecaVista || 0) + 1) === 1) K.depois(2, () => { if (jogando() && olhando(p, .6)) leg(T.boneca_leg); });
    K.anima(g, dt => { if (!g.visible || E.mode !== 'jogo') { g.visible = false; return true; } if (!olhando(g.position, .55)) viraPara(g, P.pos); return false; });
  }

  // =====================================================================  RELÓGIO DE VERDADE (03:07) E A CASA QUE SENTIU FALTA
  function relogio307(dt) {
    const m = mem(); m.relT = (m.relT || 0) - dt; if (m.relT > 0 || teste() || !jogando()) return; m.relT = 2;
    const d = new Date(), hoje = d.toDateString();
    if (d.getHours() === 3 && d.getMinutes() < 10 && lsGet().dia3 !== hoje) {
      lsMuda(o => { o.dia3 = hoje; }); K.depois(2, () => E.SFX.sinoLonge()); E.toast(T.hora3_toast);
    }
    if (d.getHours() === 3 && d.getMinutes() === 7 && lsGet().dia307 !== hoje) {
      lsMuda(o => { o.dia307 = hoje; }); apagarTodas(); E.SFX.estatica(3); K.depois(.6, () => E.sub('davi', T.hora307_radio));
      const f = K.fwdH(), p = dentro(P.room, P.pos.x + f.x * 7, P.pos.z + f.z * 7, .8), g = SOMB; g.scale.setScalar(1); noChao(g, p.x, p.z); viraPara(g, P.pos); g.visible = true;
      K.depois(3, () => { g.visible = false; acenderDeNovo(); E.toast(T.hora307_toast); conquista('l6_hora_marcada'); });
    }
  }
  function casaSentiuFalta() {
    const m = mem(); if (m.faltaFeito || teste()) return; m.faltaFeito = true;
    const ult = lsGet().ultimoJogo, agoraMs = Date.now();
    lsMuda(o => { o.ultimoJogo = agoraMs; });
    if (!ult || agoraMs - ult < 7 * 864e5 || noite() < 2) return;
    K.depois(4, () => {
      const el = tela('l6-giz', 'background:rgba(0,0,0,.25);opacity:0;transition:opacity 1.6s', `<div style="font:italic 700 8vmin Georgia,serif;color:rgba(235,232,220,.82);letter-spacing:.1em;transform:rotate(-4deg);text-shadow:0 0 12px rgba(255,255,255,.25)">${T.demorou}</div>`);
      requestAnimationFrame(() => { el.style.opacity = 1; }); E.SFX.estatica(1.5);
      setTimeout(() => { el.style.opacity = 0; setTimeout(() => tiraTela('l6-giz'), 1800); }, 5500);
    });
  }

  // =====================================================================  TELAS QUE ENGANAM: créditos falsos e "o jogo fechou"
  function creditosFalsos() {
    const m = mem(); if (teste() || noite() < 3 || m.credFeito || (m.mortesCap || 0) > 0 || sorte('creditos' + S().chapter) > .1 || freq() <= 0) return;
    if (lsGet().credN >= 2) return; // não vira hábito
    m.credFeito = true; lsMuda(o => { o.credN = (o.credN || 0) + 1; });
    const el = tela('l6-cred', 'background:#000;flex-direction:column;opacity:0;transition:opacity .8s;color:#d8d2c0;font:700 14vmin Georgia,serif', '<div>FIM</div><div style="font:italic 400 3vmin Georgia,serif;opacity:.7;margin-top:2vmin">direção: ninguém · roteiro: o que restou</div>');
    requestAnimationFrame(() => { el.style.opacity = 1; });
    K.notas({ x: P.pos.x, y: 1.4, z: P.pos.z }, [392, 440, 392, 330, 294, 330, 262], .6, .06);
    setTimeout(() => { K.vacuo(.7, 0); el.style.transition = 'none'; el.style.transform = 'translateX(1.5vw) skewX(-4deg)'; E.SFX.estatica(.4); }, 4300);
    setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = 0; setTimeout(() => tiraTela('l6-cred'), 400); leg(T.creditos_leg); E.sub('lia', T.creditos_lia); conquista('l6_falso_fim'); const a = K.atras(3); for (let i = 0; i < 4; i++) K.depois(i * .5, () => E.SFX.contagem(a, i)); }, 5000);
  }
  // a tela vai a preto como se o jogo tivesse travado; "não olha"; algo agora está atrás dela
  function jogoFechou() {
    const m = mem(); if (teste() || noite() < 3 || m.fechouFeito || ameaca() || !jogando() || sorte('fechou' + S().chapter) > .08 || (m.capT || 0) < 120 || freq() <= 0) return;
    m.fechouFeito = true; const el = tela('l6-preto', 'background:#000;opacity:1'); K.vacuo(2.4, 0); K.depois(.8, () => sussurro({ x: P.pos.x, y: 1.5, z: P.pos.z }, .8, .12));
    K.depois(.9, () => leg(T.fechou_leg));
    setTimeout(() => {
      tiraTela('l6-preto'); if (!jogando()) return; const a = K.atras(4), p = dentro(P.room, a.x, a.z, .7), g = SOMB; g.scale.setScalar(1); noChao(g, p.x, p.z); viraPara(g, P.pos); g.visible = true; E.SFX.estalo(p, .5);
      let t = 0; K.anima(g, dt => { t += dt; if (t > 2 || !jogando()) { g.visible = false; return true; } });
    }, 2000);
  }
  // voltou da pausa depois de mais de 60 s: alguma coisa mudou na cena
  let pausouEm = 0;
  function aoDespausar() {
    const dur = (performance.now() - pausouEm) / 1000; pausouEm = 0; const m = mem();
    if (teste() || dur < 60 || ameaca() || m.despausou || (E.OPT && E.OPT.pausaAuto) || freq() <= 0) return; m.despausou = true;
    const d = K.portaDaSala(P.room, x => !x.open && Math.hypot(x.x - P.pos.x, x.z - P.pos.z) < 9)[0];
    K.depois(1.2, () => {
      if (!jogando()) return;
      if (d) { K.abrirDevagar(d, undefined, 2.2); leg(T.despausa_leg); }
      else { const p = dentro(P.room, P.pos.x + 4, P.pos.z + 4, .7), g = SOMB; g.scale.setScalar(1); noChao(g, p.x, p.z); viraPara(g, P.pos); g.visible = true; leg(T.despausa_leg); let t = 0; K.anima(g, dt => { t += dt; if (t > 6 || (S().flashOn && olhando(p, .93) && t > 1)) { g.visible = false; return true; } }); }
    });
  }

  // =====================================================================  INTERFACE DOS MODOS (opções de Desempenho)
  let uiTent = 0;
  function montarOpcoes() {
    if (document.getElementById('l6-opc')) return true;
    const wrap = document.querySelector('#plat-opcoes .wrap') || document.getElementById('plat-opcoes'); if (!wrap) return false;
    const fs = document.createElement('fieldset'); fs.id = 'l6-opc';
    const f = Math.round(freq() * 100);
    fs.innerHTML = '<legend>Rejogo e desafios (sustos)</legend>' +
      `<label>Frequência de sustos <select data-l6="freq">${[[0, 'Noite Crua (0%): só os monstros reais'], [50, 'Branda (50%)'], [100, 'Normal (100%)'], [150, 'Cruel (150%)'], [200, 'Sem trégua (200%)']].map(([v, t]) => `<option value="${v}"${v === f ? ' selected' : ''}>${t}</option>`).join('')}</select></label>` +
      `<label><input type="checkbox" data-l6="sangueFrio"> Sangue Frio: sem avisos antes dos sustos</label>` +
      `<label><input type="checkbox" data-l6="insone"> Insone: a casa não te deixa em paz</label>` +
      `<label><input type="checkbox" data-l6="mente"> A Casa Mente: nem todo susto é de verdade</label>` +
      '<small>Valem a partir da próxima noite. Ficam guardados entre as partidas.</small>';
    wrap.appendChild(fs);
    fs.querySelectorAll('[data-l6]').forEach(el => {
      const k = el.dataset.l6;
      if (el.type === 'checkbox') { el.checked = !!modos()[k]; el.onchange = () => API.modo(k, el.checked); }
      else el.onchange = () => { API.modo('freq', +el.value); };
    });
    return true;
  }
  function tentarUI() { if (uiTent++ > 60) return; try { if (!montarOpcoes()) setTimeout(tentarUI, 1500); } catch (e) { setTimeout(tentarUI, 1500); } }
  setTimeout(tentarUI, 800);

  // =====================================================================  GANCHOS DE CICLO
  const API = {};
  let ultCap = -1;
  API.novoMapa = seguro(id => {
    esconderModelos(); tiraTela('l6-preto'); const hud = document.getElementById('hud'); if (hud) hud.style.visibility = '';
    const s = S(); if (!s) return; aplicarModos(); estadoDaNoite(); escolherEventosDaNoite();
    const m = mem(); lastPX = null; trilha.length = 0;
    marcarPodres(); casaSentiuFalta();
    K.depois(1.5, () => seguro(bonecaEntreNoites)());
    if (recompensaPend) { recompensaPend = false; K.depois(rand(12, 20), () => { if (jogando() && !ameaca()) recompensaBonita(); }); }
    if (insone()) K.D.proxAmb = agora() + 20;
    if (id !== 'estrada' && !m.mapaVisto) m.mapaVisto = {}; if (m.mapaVisto) m.mapaVisto[id] = true;
  });
  API.aoEsconder = seguro(L => {
    updateQueimado(L); const m = mem(), k = chaveArm(L);
    m.armN = m.armN || {}; m.armN[k] = (m.armN[k] || 0) + 1;
    lsMuda(o => { o.armTot = o.armTot || {}; o.armTot[k] = (o.armTot[k] || 0) + 1; });
    habitoArmario(L, m);
  });
  API.aoSair = seguro(() => {});
  API.aoPasso = seguro(() => {});
  API.morte = seguro(() => { const m = mem(); m.mortesCap = (m.mortesCap || 0) + 1; salvarHabitos(); esconderModelos(); tiraTela('l6-preto'); tiraTela('l6-cred'); const hud = document.getElementById('hud'); if (hud) hud.style.visibility = ''; });
  API.fimCap = seguro(() => {
    const m = mem(); assinaturaFim(); recordeAssombrado(); salvarHabitos();
    if (sangueFrio()) conquista('l6_sangue_frio'); if (insone()) conquista('l6_insone');
    if (m.vaziaN > 0) { K.depois(4, () => { E.toast(T.vazia_replay.replace('{n}', m.vaziaN)); if (m.vaziaN >= 6) conquista('l6_ele_estava_la'); }); }
    K.depois(1.5, creditosFalsos);
  });
  API.aoPausar = seguro(() => { pausouEm = performance.now(); });
  API.update = seguro((dt, s) => {
    if (!s || s.dead || !P.room) return;
    if (pausouEm) aoDespausar();
    if (lastPX !== null) movendo = Math.hypot(P.pos.x - lastPX, P.pos.z - lastPZ) > .02; lastPX = P.pos.x; lastPZ = P.pos.z;
    if (noite() >= 5) conquista('l6_veterana');
    const m = mem();
    if (!m.deckEscolhido) { estadoDaNoite(); escolherEventosDaNoite(); marcarPodres(); } // a noite pode começar depois do primeiro mapa
    if (s.chapter !== ultCap) { ultCap = s.chapter; m.assinaCedo = false; m.assinaDesativada = false; m.assinaPagou = false; m.qQuebrouCap = false; m.lantQuebrouCap = false; m.runCorr = 0; m.runQuebrou = false; m.mortesCap = 0; m.capT = 0; m.portaBateu = false; m.credFeito = false; m.fechouFeito = false; K.depois(3, () => assinaturaCedo()); }
    if (!jogando()) return;
    m.capT = (m.capT || 0) + dt;
    registrarPassos(dt); lerHabitos(dt, s);
    if (noiteMansa() || noiteVazia()) K.D.proxAmb = Math.max(K.D.proxAmb, agora() + 30);
    dispararEventosDaNoite();
    reencenarMorte(); ajudaFantasma(); onzeBadaladas(); anaOnze(); lapideMorte(); corpoDeGiz();
    falsaVitoria(); curiosidade(dt); habitoCorrer(m); habitoLanterna(m, s); jogoFechou(); relogio307(dt);
    if (E.keys && E.keys.KeyQ && !m.qLado) { m.qLado = true; portaBateAtras(m); } if (!(E.keys && E.keys.KeyQ)) m.qLado = false;
    pegadasNG(dt); updateQueda(dt); updateVazia(dt); updateCruel(dt); updateCalmaria(dt); detectarPulo();
    if (s.hidden) updatePodre(dt, s.hidden); else m.podreT = 0;
  });

  // -------- ganchos lidos por src/sustos.js
  API.chamadoFundo = chamadoFundo;
  API.armarioOcupado = seguro(L => armarioOcupadoL6(L));
  API.probFalsa = () => { if (pesadelo()) return 0; const n = noite(); return n >= 2 ? .2 * Math.min(1.5, freq()) : .3; };
  API.tellProc = seguro(() => { if (noite() >= 2 && !pesadelo() && !teste()) K.vacuo(.25, 0); }); // um quarto de segundo de silêncio total: só o aviso de verdade tem
  API.ambMul = () => (freq() <= 0 ? 1e6 : (noiteMansa() || noiteVazia() ? 3 : 1) / freq()) * (insone() ? .6 : 1);
  API.segurarAmb = () => freq() <= 0 || noiteVazia() || (mem().calmCap === S().chapter && !mem().calmFeita);
  API.recompensa = seguro(() => recompensaBonita());
  // modos (desafios): expostos para a tela de opções e para depuração
  API.modo = seguro((k, v) => {
    setModo(k, v); aplicarModos();
    E.toast(k === 'sangueFrio' ? (v ? T.sangue_frio : T.sangue_frio_off) : k === 'insone' ? T.insone : k === 'freq' ? T.freq.replace('{p}', v) : T.mente);
  });
  API.sangueFrio = v => API.modo('sangueFrio', v !== false);
  API.insone = v => API.modo('insone', v !== false);
  API.mente = v => API.modo('mente', v !== false);
  API.freq = p => API.modo('freq', p);
  API.forcar = id => { FORCA.add(id); const d = DECK.find(x => x.id === id); if (d && jogando()) dispararEvento(d, true); };
  API._modelos = { BONECA, SOMB, SOMB2, KID, MAO }; API._modos = modos; API._mem = mem; API._deck = DECK; API._lsGet = lsGet; API._habito = habitoDominante;
  return API;
}
