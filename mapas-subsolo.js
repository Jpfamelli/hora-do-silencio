// MAPAS DO SUBSOLO (túneis alagados e cemitério/capela: Capítulos IV-V). Carregado só quando o jogador se aproxima (ver mapas.js).
import * as SUB from './src/subterraneo.js';
import * as SUBL from './src/subterraneo-lore.js';
import * as SUBP from './src/subterraneo-polimento.js';
import * as SUBS from './src/subterraneo-segredos.js';
import * as SUBS2 from './src/subterraneo-segredos2.js';
import * as SUBM from './src/subterraneo-monstros.js'; // lote 5: comportamentos e perseguições das entidades
import * as SUBM2 from './src/subterraneo-monstros2.js'; // lote 5 (2ª leva): mais comportamentos, perseguições e contra-jogos
import * as SUBR2 from './src/subterraneo-rejogo2.js'; // lote 6 (2ª rodada): maré, cruzes das mortes, covas falsas, ritmo do sino, poço, banco, jardim
import * as SUBR from './src/subterraneo-rejogo.js'; // lote 6: rejogabilidade (modos, desafios, variações por semente, conquistas, recordes, segredos da 2ª jogada)
import * as AUDL7B from './src/subterraneo-audio7b.js'; // lote 7 (2ª leva): eco que mede o espaço, canos que cantam, corvos, cruzes, pá por camada, órgão por túmulo, amanhecer
import * as AUDL7 from './src/subterraneo-audio7.js'; // lote 7: som e atmosfera (ambiência por sala, órgão/coro, goteiras, vozes, silêncio como arma, clima e trovão)
import { arvoreSeca, muro, portao, vulto, janelasFachada, placa, noCaixote, arvores } from './src/mapas-util.js';
import { tecla } from './src/estrada-polimento.js';

// =====================================================================
// TÚNEIS ALAGADOS (Capítulo IV)
// =====================================================================
function tuneis(A, S) {
  const { THREE, MAT, box, cyl, prop, plano, item, interact, ITENS, MK, gatilho, SFX, spot } = A;
  const som = SUB.sons(A), O = SUB.ondas(A), B = SUB.bolhas(A), mao = SUB.maoPalida(A), FX = SUBP.efeitos(A);
  SUB.vigiarTelas(A);
  const telaAgua = SUB.tela('fx-submersa', 'background:radial-gradient(ellipse at center,rgba(18,48,36,.5) 5%,rgba(4,16,10,.96) 100%)'); telaAgua.dono = 'tuneis';
  const telaFolego = SUB.tela('fx-folego', 'inset:auto;position:absolute;left:50%;top:62%;width:200px;margin-left:-100px;height:auto;font-family:"Special Elite",monospace;font-size:16px;color:#cfe3d4;text-align:center;text-shadow:0 0 8px #000'); telaFolego.dono = 'tuneis';
  telaFolego.innerHTML = 'Debaixo d\'água — solte C para subir<i style="display:block;margin:8px auto 0;width:180px;height:3px;background:rgba(255,255,255,.12)"><b style="display:block;height:100%;width:100%;background:#cfe3d4"></b></i>';
  const barraFolego = telaFolego.querySelector('b');
  const T = (id, nome, x0, x1, z0, z1, extra = {}) => ({ id, nome, x0, x1, z0, z1, tipo: 'tunel', piso: 'concreto', parede: 'tijolo', h: 2.8, agua: true, semLuz: true, ...extra });
  const salas = [
    T('entrada', 'Entrada do porão', -4, 4, -6, 0),
    T('t1', 'Túnel central', -2, 2, -30, -6),
    T('t2', 'Túnel oeste', -26, -2, -20, -16),
    T('t3', 'Túnel leste', 2, 26, -20, -16),
    T('v1', 'Câmara oeste', -34, -26, -24, -12),
    T('v2', 'Câmara leste', 26, 34, -24, -12),
    T('hub', 'Cisterna', -6, 6, -42, -30, { h: 3.4 }),
    T('t4', 'Túnel norte', -2, 2, -54, -42),
    { id: 'secreta', nome: 'Sala do diretor', x0: -8, x1: 8, z0: -66, z1: -54, tipo: 'diretoria', piso: 'madeira', h: 3 },
    T('t5', 'Galeria leste', 6, 24, -38, -34),
    T('saida', 'Saída', 24, 32, -42, -30),
    T('t6', 'Galeria oeste', -24, -6, -38, -34),
    { id: 'dep', nome: 'Depósito', x0: -32, x1: -24, z0: -42, z1: -30, tipo: 'deposito', piso: 'concreto', parede: 'tijolo', h: 2.8 },
    ...SUBP.salasTuneis(), // lote 3: duto baixo dos ratos entre a câmara oeste e o depósito
    ...SUBS.salasTuneis() // lote 4: cabana de lençóis atrás da grade baixa do túnel norte
  ];
  const ab = (id, a, b, x, z, eixo) => ({ id, a, b, x, z, eixo, tipo: 'aberta', largura: 3.6, alto: 2.6 });
  const portas = [
    ab('e1', 'entrada', 't1', 0, -6, 'x'), ab('12', 't1', 't2', -2, -18, 'z'), ab('13', 't1', 't3', 2, -18, 'z'),
    ab('2v', 't2', 'v1', -26, -18, 'z'), ab('3v', 't3', 'v2', 26, -18, 'z'), ab('1h', 't1', 'hub', 0, -30, 'x'),
    ab('h4', 'hub', 't4', 0, -42, 'x'), ab('h5', 'hub', 't5', 6, -36, 'z'), ab('5s', 't5', 'saida', 24, -36, 'z'), ab('h6', 'hub', 't6', -6, -36, 'z'),
    { id: 'sec', a: 't4', b: 'secreta', x: 0, z: -54, eixo: 'x', nome: 'porta de ferro', trava: () => !S.flags.aguaBaixa, msg: 'Debaixo d\'água. Não abre com esse peso.' },
    { id: 'dep', a: 't6', b: 'dep', x: -24, z: -36, eixo: 'z', nome: 'porta do depósito' },
    ...SUBP.portasTuneis(), ...SUBS.portasTuneis()
  ];
  A.construirSalas(salas, portas); SUBP.soltarDuto(A); SUBS.soltar(A);
  // luz fixa e fraca: entrada, cruzamento, cisterna e galeria leste (antes era sorteio, às vezes tudo escuro)
  for (const [x, z, h, al] of [[0, -3, 2.8, 7], [0, -18, 2.8, 8], [0, -36, 3.4, 9], [15, -36, 2.8, 7]]) A.lampada(x, z, h, al, 0xc8d8a0, 3.4);
  // lâmpadas de emergência em gaiola marcando as válvulas, a porta de ferro e a escotilha
  const emerg = [
    SUB.luzEmergencia(A, -33.82, 2.3, -15.6, Math.PI / 2), SUB.luzEmergencia(A, 33.82, 2.3, -20.4, -Math.PI / 2),
    SUB.luzEmergencia(A, -5.82, 2.7, -40.2, Math.PI / 2), SUB.luzEmergencia(A, 1.82, 2.3, -52.2, -Math.PI / 2),
    SUB.luzEmergencia(A, 28, 2.5, -41.82, 0)
  ];
  // armários enferrujados: dá para fugir da Procissão e do Inspetor também aqui embaixo
  A.armario(1.55, -12, [-1, 0]); A.armario(5.55, -33.5, [-1, 0]); A.armario(15, -34.45, [0, -1]); A.armario(-33.55, -21.5, [1, 0]); A.armario(33.55, -14.5, [-1, 0]);
  // escada de volta
  const escada = new THREE.Group(); escada.position.set(0, 0, -.4); A.W.grupo.add(escada);
  for (let i = 0; i < 7; i++) box(.8, .04, .04, MAT.ferrugem, 0, .3 + i * .38, 0, escada); box(.04, 2.8, .04, MAT.ferrugem, -.4, 1.4, 0, escada); box(.04, 2.8, .04, MAT.ferrugem, .4, 1.4, 0, escada);
  interact(escada, () => '<b>E</b>Subir para a casa de máquinas', () => { A.fade(true, () => { A.carregarMapa('terreo', 'porao'); A.fade(false); }, 500); });

  // ---------- nível da água: cada válvula certa baixa um terço; o erro faz subir de verdade
  let nivel = S.flags.aguaBaixa ? .04 : .42, enchente = 0, erros = 0;
  const alvoNivel = () => S.flags.aguaBaixa ? .04 : Math.min(.7, .42 - S.valv.length * .1 + (enchente > 0 ? .24 : 0));
  for (const m of A.W.agua) m.position.y = nivel;
  // cano estourado: jato de água caindo do teto
  const jato = new THREE.Mesh(new THREE.CylinderGeometry(.04, .09, 2.4, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0x9ab8a8, transparent: true, opacity: .45, depthWrite: false }));
  jato.visible = false; A.W.grupo.add(jato);
  const estouro = { 1: { x: -14, z: -17.4 }, 2: { x: 14, z: -17.4 }, 3: { x: 0, z: -24 } };
  let jatoT = 0;
  // válvulas: segurar E, rangido que cresce, progresso guardado, nota no cano quando certa
  const tons = [130.81, 164.81, 196];
  const valvs = [{ n: 1, x: -33.85, z: -18, ry: Math.PI / 2 }, { n: 2, x: 33.85, z: -18, ry: -Math.PI / 2 }, { n: 3, x: -4, z: -41.85, ry: 0 }];
  const valvIts = [];
  for (const v of valvs) {
    const g = new THREE.Group(); g.position.set(v.x, 1.3, v.z); g.rotation.y = v.ry; A.W.grupo.add(g);
    const giro = new THREE.Group(); giro.position.z = .15; g.add(giro);
    giro.add(new THREE.Mesh(new THREE.TorusGeometry(.3, .04, 6, 16), MAT.ferrugem));
    for (let i = 0; i < 3; i++) { const r = box(.6, .03, .03, MAT.ferrugem, 0, 0, 0, giro); r.rotation.z = i * Math.PI / 3; }
    cyl(.08, .08, .3, MAT.ferrugem, 0, 0, 0, 8, g).rotation.x = Math.PI / 2;
    const placa = A.plano(.35, .35, new THREE.MeshStandardMaterial({ map: A.textoTex([{ t: String(v.n), tam: 110, estilo: 'bold', y: 80 }], { w: 128, h: 128, fundo: '#2a2018', cor: '#c9a75a', manchas: 2 }), emissive: 0x201408, emissiveIntensity: .6 }), 0, .62, .02, 0, g);
    const pos = { x: v.x, y: 1.3, z: v.z };
    const it = interact(g, () => {
      if (S.flags.aguaBaixa) return `Válvula ${v.n} (aberta)`;
      if (S.valv.includes(v.n)) return `Válvula ${v.n} — já girada`;
      const k = Math.min(1, (it.progresso || 0) / it.hold);
      return `<b>E</b>Girar a válvula ${v.n} ${k > .02 ? `(${Math.round(k * 100)}% — range alto)` : '(segure; ela range)'}`;
    }, () => {
      if (S.flags.aguaBaixa || S.valv.includes(v.n)) return;
      it.progresso = 0; SFX.valvula(pos);
      const certo = S.ordem[S.valv.length] === v.n;
      if (!certo) {
        // erro: as certas continuam giradas; o cano estoura no meio do túnel e é LÁ que ele vai primeiro
        erros++; enchente = 25; jatoT = 0;
        const e = estouro[v.n]; jato.position.set(e.x, 1.6, e.z); jato.visible = true;
        som.dissonante(pos); SFX.cano({ x: e.x, y: 2.4, z: e.z }); som.jato({ x: e.x, y: 2.4, z: e.z }, 3); A.emitNoise(e.x, e.z, 18); A.emitNoise(v.x, v.z, 7);
        A.P.shake = .18; A.falar('valvula_errada'); A.toast('Os canos estouram no túnel. A água sobe — e alguém ouviu.');
        if (erros >= 2) setTimeout(() => { if (A.W.mapa === 'tuneis' && !S.flags.aguaBaixa) A.sub('lia', A.codTxt(S.fitas.f2 ? 'Calma. A Irmã Celeste disse a ordem na fita: {v}. Tá no diário.' : 'Tem uma ordem. Alguém deve ter anotado em algum lugar.')); }, 2600);
      } else {
        S.valv.push(v.n); som.nota(tons[S.valv.length - 1], pos); A.emitNoise(v.x, v.z, 6); enchente = 0; jato.visible = false;
        if (S.valv.length < 3) A.toast(`O cano canta. A água desce um pouco (${S.valv.length}/3).`);
        else {
          S.flags.aguaBaixa = true; A.objDone('valvulas'); A.falar('valvulas_ok'); A.emitNoise(v.x, v.z, 16); SFX.cano(null);
          setTimeout(() => { for (const f of tons) som.nota(f, null, .25); }, 400);
          setTimeout(() => { if (A.W.mapa === 'tuneis' && !A.S.dead) A.salvarCheckpoint(); }, 3500);
          setTimeout(() => { if (A.W.mapa === 'tuneis') A.sub('lia', 'Brinquedos. O chão inteiro coberto de brinquedos. Quantas crianças ele trouxe aqui pra baixo?'); }, 7000);
        }
      }
      A.progresso();
    });
    it.hold = 2.5; it.guarda = true; it.som = null; it.pode = () => !S.flags.aguaBaixa && !S.valv.includes(v.n);
    Object.defineProperty(it, 'ruido', { get: () => 3 + 9 * Math.min(1, (it.progresso || 0) / it.hold) });
    valvIts.push({ it, giro, pos, rangT: 0, n: v.n, placa });
  }
  // brinquedos no fundo: só aparecem quando a água baixa
  const brinq = new THREE.Group(); A.W.grupo.add(brinq);
  { const cores = [0x5a2a22, 0x2a3a52, 0x5a5230, 0x3a4a2a, 0x6a6058, 0x4a2a40].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .9 }));
    const areas = [[-1.6, 1.6, -29, -7], [-5.5, 5.5, -41.5, -30.5], [-1.6, 1.6, -53, -43], [-24, -3, -19.6, -16.4], [3, 24, -19.6, -16.4]];
    for (let i = 0; i < 46; i++) {
      const a = areas[i % areas.length], x = A.rand(a[0], a[1]), z = A.rand(a[2], a[3]), mt = cores[i % cores.length], tipo = i % 4;
      let m;
      if (tipo === 0) m = box(.12, .12, .12, mt, x, .06, z, brinq, false);
      else if (tipo === 1) { m = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), mt); m.position.set(x, .09, z); brinq.add(m); }
      else if (tipo === 2) { m = box(.22, .07, .1, mt, x, .05, z, brinq, false); box(.11, .06, .09, mt, x - .02, .11, z, brinq, false); }
      else { m = cyl(.04, .07, .18, mt, x, .05, z, 6, brinq); m.rotation.z = Math.PI / 2; }
      m.rotation.y = A.rand(0, 6);
    }
    brinq.visible = false; }

  // ---------- sala do diretor: cofre, gravador, carta e fotos que mudam
  const cofre = new THREE.Group(); cofre.position.set(7.4, 0, -60); cofre.rotation.y = -Math.PI / 2; A.W.grupo.add(cofre);
  box(.9, 1.1, .8, MAT.metal, 0, .55, 0, cofre);
  const cp = new THREE.Group(); cp.position.set(-.42, .55, .41); cofre.add(cp);
  box(.82, 1, .06, new THREE.MeshStandardMaterial({ color: 0x55585a, metalness: .7, roughness: .4, emissive: 0x101010 }), .41, 0, 0, cp);
  const disco = cyl(.08, .08, .05, MAT.bronze, .55, .15, .05, 12, cp); disco.rotation.x = Math.PI / 2;
  if (S.flags.cofre) cp.rotation.y = -1.7;
  A.addCollider(6.95, 7.85, -60.45, -59.55);
  let fuga = null, f4ok = !!S.fitas.f4;
  const iniciarFugaCofre = (recarga) => { fuga = { t: recarga ? 1.1 : 0, recarga, apagou: false, veio: false }; };
  interact(cofre, () => S.flags.cofre ? 'Cofre aberto e vazio.' : A.R.paginas.every(p => S.notes[p.id]) ? '<b>E</b>Usar o cofre' : `<b>E</b>Usar o cofre (números do Davi: ${A.R.paginas.filter(p => S.notes[p.id]).length}/4)`, () => {
    if (S.flags.cofre) return;
    const achados = A.R.paginas.filter(p => S.notes[p.id]).length;
    A.abrirTeclado(achados >= 4 ? 'COFRE DO DIRETOR' : `COFRE DO DIRETOR · ${achados}/4 números achados`, S.code.join(''), () => {
      S.flags.cofre = true; S.inv.pa = true; S.inv.chaves.capela = 'Chave da capela'; S.inv.garrafas++; // a porta abre devagar (src/subterraneo-polimento.js)
      SFX.pancada(7, -60); A.objDone('cofre');
      A.salvarCheckpoint(); // morrer na fuga volta para logo depois do cofre
      // a gaveta da mesa abre sozinha (src/sustos.js) e só então ele acorda
      A.sustos.cofre(() => { A.falar('cofre'); setTimeout(() => A.toast(SUBP.tecla('No fundo do cofre, uma garrafa de vidro. G para jogar.')), 2500); });
      iniciarFugaCofre(false);
    }, () => A.emitNoise(7, -60, 10));
  });
  ITENS.gravador('f3', spot('secreta', 'mesa', 0));
  ITENS.nota('n10', spot('secreta', 'mesa', 1));
  ITENS.nota('n9', spot('dep', 'mesa', 0));
  // última página do Davi, no túnel que leva à sala do diretor
  ITENS.nota('p4', noCaixote(A, spot('t4', 'chao', 0)));
  // parede de fotos: viram quando você dá as costas
  const fotos = [];
  for (const [i, z] of [-64.4, -62.9, -61.4, -59.9].entries()) {
    box(.04, .78, 1.02, MAT.madeiraEsc, -7.89, 1.75, z, A.W.grupo, false);
    const m = A.plano(.92, .68, new THREE.MeshStandardMaterial({ map: SUB.fotoTex(A, i, 0), roughness: .8 }), -7.86, 1.75, z, Math.PI / 2);
    fotos.push({ m, i, estado: 0 });
  }
  let trocas = 0, olhouParede = false, costasT = 0;
  const trocarFoto = (f, e) => { f.estado = e; f.m.material.map.dispose(); f.m.material.map = SUB.fotoTex(A, f.i, e); f.m.material.needsUpdate = true; };
  // saída: subir segurando E, a escada range e a escotilha bate atrás
  const esc2 = new THREE.Group(); esc2.position.set(31.6, 0, -36); esc2.rotation.y = -Math.PI / 2; A.W.grupo.add(esc2);
  for (let i = 0; i < 7; i++) box(.8, .04, .04, MAT.ferrugem, 0, .3 + i * .38, 0, esc2); box(.04, 2.8, .04, MAT.ferrugem, -.4, 1.4, 0, esc2); box(.04, 2.8, .04, MAT.ferrugem, .4, 1.4, 0, esc2);
  const itEsc = interact(esc2, () => S.flags.cofre ? '<b>E</b>Subir pela escotilha (segure — a escada range)' : 'Uma escotilha no teto, travada por dentro com uma corrente. A chave deve estar com o diretor.', () => {
    if (!S.flags.cofre) { SFX.trancado(); return; }
    SFX.pancada(31.6, -36); A.P.shake = .25; A.objDone('sair_tuneis');
    A.sub('lia', 'Fecha! Fecha! ...Fechou.');
    A.fade(true, () => { A.carregarMapa('cemiterio', 'tuneis'); A.fade(false); }, 500);
  });
  itEsc.hold = 2.2; itEsc.ruido = 7; itEsc.som = 'forcar'; itEsc.pode = () => !!S.flags.cofre;
  // recursos (em cima de caixotes: a água esconderia)
  ITENS.pilha('p1', spot('dep', 'mesa', 1)); ITENS.pilha('p2', noCaixote(A, spot('v2', 'chao', 1))); ITENS.pilha('p3', noCaixote(A, spot('t5', 'chao', 0)));
  ITENS.kit('k1', spot('dep', 'mesa', 2)); ITENS.kit('k2', noCaixote(A, spot('hub', 'chao', 2)));
  ITENS.garrafa('g1', noCaixote(A, spot('t3', 'chao', 0))); ITENS.garrafa('g2', noCaixote(A, spot('t2', 'chao', 1))); ITENS.garrafa('g3', noCaixote(A, spot('hub', 'chao', 0)));
  // susto da cisterna: ele levanta de dentro da água, oito metros à frente
  let emergir = null;
  gatilho('cisterna', -6, 6, -41, -30.5, () => {
    if (!S.flags.tunSussurro) { S.flags.tunSussurro = true; SFX.sussurros(2.5); }
    if (S.chapter !== 4 || S.flags.aguaBaixa || S.flags.tunEmergiu || !A.M.ativo) { if (!S.flags.tunCisterna) { S.flags.tunCisterna = true; A.sustos.cisterna(); } return; } // sem ele por perto: só a respiração debaixo d'água
    const fx = -Math.sin(A.P.yaw), fz = -Math.cos(A.P.yaw);
    const x = Math.max(-5, Math.min(5, A.P.pos.x + fx * 8)), z = Math.max(-41, Math.min(-31, A.P.pos.z + fz * 8));
    if (Math.hypot(x - A.P.pos.x, z - A.P.pos.z) < 4.5) return;
    S.flags.tunEmergiu = true;
    A.M.pos.set(x, 0, z); A.M.path = []; A.M.state = 'investiga'; A.M.searchT = 0; A.M.wait = 2.4; A.M.cool = 3.5; A.M.yaw = Math.atan2(A.P.pos.x - x, A.P.pos.z - z);
    emergir = { t: 0, x, z }; som.escorrer({ x, y: .6, z }); SFX.susto(); A.P.shake = .12; S.fear = Math.min(100, S.fear + 35);
    setTimeout(() => { if (A.W.mapa === 'tuneis') A.sub('lia', 'Ele tava debaixo d\'água. Esperando. Não se mexe... não se mexe.'); }, 2200);
  }, false);

  // ---------- estado da água em volta da Lia
  const sub = { on: false, cd: 0, avisouPassou: false };
  let subK = 0, parT = 0, maoFase = 0, maoVezes = 0, ambT = A.rand(16, 28), ambBolhas = null, lento = 0, passoAcc = 0, monAcc = 0, monY = 0, bolhaT = 0, dicaAgua = false;
  const lastP = new THREE.Vector3().copy(A.P.pos), lastM = new THREE.Vector3();
  const vista = new THREE.Vector3(), alvoV = new THREE.Vector3();
  A.W.tick.push(dt => {
    const P = A.P, M = A.M, t = A.perf(), ligada = !!S.flags.energia;
    // nível da água
    if (enchente > 0) enchente -= dt;
    const alvo = alvoNivel();
    nivel += (alvo - nivel) * Math.min(1, dt * (S.flags.aguaBaixa ? .9 : enchente > 0 ? 1.2 : .6));
    for (const m of A.W.agua) m.position.y = nivel;
    brinq.visible = nivel < .2;
    const alta = !S.flags.aguaBaixa && nivel > .3;
    // jato do cano estourado
    if (jato.visible) { jatoT -= dt; jato.scale.x = jato.scale.z = .8 + Math.random() * .5; if (jatoT <= 0) { jatoT = .35; O.criar(jato.position.x, nivel, jato.position.z, .9, .35, 1); } if (enchente <= 0) jato.visible = false; }
    // luzes de emergência
    for (const L of emerg) { L.on = ligada || !!S.flags.apagao; L.rapido = !!S.flags.apagao; L.base = S.flags.apagao ? 3.4 : 2.4; L.update(t); }
    // válvulas: rangido crescente enquanto segura, progresso escoa devagar quando solta
    for (const V of valvIts) {
      const segurando = t - (V.it.seguradoT ?? -9) < .08;
      if (segurando) { V.giro.rotation.z -= dt * 1.6; V.rangT -= dt; if (V.rangT <= 0) { V.rangT = .5; som.rangido(V.pos, Math.min(1, V.it.progresso / V.it.hold)); } }
      else if (V.it.progresso > 0) V.it.progresso = Math.max(0, V.it.progresso - dt * .35);
    }
    // movimento da Lia neste quadro
    const mov = Math.hypot(P.pos.x - lastP.x, P.pos.z - lastP.z); lastP.copy(P.pos);
    const naAgua = P.naAgua && !S.hidden;
    if (naAgua && !dicaAgua && S.chapter === 4) { dicaAgua = true; setTimeout(() => { if (A.W.mapa === 'tuneis' && !S.flags.aguaBaixa) A.toast(SUBP.tecla('Agachada (C) na água funda, você afunda: ele não te ouve, mas o ar acaba.')); }, 6000); }
    // afundar: agachada na água alta
    if (sub.cd > 0) sub.cd -= dt;
    const quer = naAgua && alta && P.crouch && !P.sprinting && sub.cd <= 0 && !SUBP.naSoleira(P.pos); // na soleira do duto agachar não afunda
    if (quer && S.stamina > 2) {
      if (!sub.on) { sub.on = true; som.bolhas(null, 6, .3); O.criar(P.pos.x, nivel, P.pos.z, 1.4, .4, 1.4); }
      S.stamina = Math.max(0, S.stamina - (mov > .001 ? 28 : P.prende ? 15 : 24) * dt); // parada e prendendo o fôlego, o ar dura mais
      if (S.stamina <= 2) {
        sub.on = false; sub.cd = 2.5; P.crouch = false; som.ofegoAgua(); SFX.ofego(); A.emitNoise(P.pos.x, P.pos.z, 8, true);
        O.criar(P.pos.x, nivel, P.pos.z, 2.2, .5, 1.6); A.toast('Sem ar! Você subiu puxando o fôlego, alto.');
      }
    } else if (sub.on) { sub.on = false; som.bolhas(null, 4, .2); O.criar(P.pos.x, nivel, P.pos.z, 1.2, .35, 1.2); }
    telaAgua.style.opacity = sub.on ? .92 : 0;
    telaFolego.style.opacity = sub.on ? 1 : 0; barraFolego.style.width = S.stamina + '%';
    subK += ((sub.on ? 1 : 0) - subK) * Math.min(1, dt * 7); // afunda e sobe suave, sem pulo de câmera
    if (subK > .01) A.camera.position.y += (nivel - .12 - A.camera.position.y) * subK;
    if (sub.on) {
      A.flash.intensity *= .3; SUBP.falha(A, .12);
      bolhaT -= dt; if (bolhaT <= 0) { bolhaT = mov > .001 ? .35 : .9; B.emitir(P.pos.x, nivel, P.pos.z, mov > .001 ? 3 : 1, .25); }
      if (M.ativo && M.pos.distanceTo(P.pos) < 2.2 && !sub.avisouPassou) { sub.avisouPassou = true; S.fear = Math.min(100, S.fear + 30); A.P.shake = .08; A.toast('Ele está passando por cima de você.'); }
    } else if (!M.ativo || M.pos.distanceTo(P.pos) > 6) sub.avisouPassou = false;
    // ondas nos passos da Lia (do tamanho do barulho)
    if (naAgua && !sub.on && mov > .001) { passoAcc += mov; if (passoAcc > .62) { passoAcc = 0; O.criar(P.pos.x, nivel, P.pos.z, .45 + P.noiseR * .06, .16 + Math.min(.3, P.noiseR * .012), 1.4); } }
    // o Inspetor na água: anda afundado, deixa ondas e bolhas; levanta quando ouve algo
    const dM = M.ativo ? M.pos.distanceTo(P.pos) : 99;
    if (M.ativo) {
      const salaM = A.roomAt(M.pos.x, M.pos.z), aguaM = salaM.agua && alta;
      const movM = Math.hypot(M.pos.x - lastM.x, M.pos.z - lastM.z); lastM.copy(M.pos);
      if (aguaM && movM > .0005 && movM < 2) { monAcc += movM; if (monAcc > 1) { monAcc = 0; O.criar(M.pos.x, nivel, M.pos.z, 1.8, .42, 2.3, 0xb8c8c0); } }
      let alvoY = aguaM && M.state === 'patrulha' && dM > 6 ? -2.1 : 0;
      if (emergir) { emergir.t += dt; const k = Math.min(1, emergir.t / 1.6); monY = -3.2 * (1 - k * k * (3 - 2 * k)); alvoY = monY; if (emergir.t < 1.8) { M.wait = Math.max(M.wait, .3); if (Math.random() < .5) B.emitir(emergir.x, nivel, emergir.z, 2, .7, .07); } else emergir = null; }
      else monY += (alvoY - monY) * Math.min(1, dt * (alvoY < monY ? .8 : 4));
      A.MON.g.position.y += monY;
      if (monY < -1 && aguaM && Math.random() < dt * 5) B.emitir(M.pos.x, nivel, M.pos.z, 2, .3);
      if (monY < -1 && aguaM && Math.random() < dt * .25 && dM < 16) som.respiraAgua({ x: M.pos.x, y: .4, z: M.pos.z }, .25);
      // a lanterna falha com ele perto (interferência)
      if (dM < 8 && !sub.on) SUBP.falha(A, (8 - dM) / 8 * .35, .55);
    } else monY = 0;
    // ficar parada na água sozinha: alguma coisa vem. Com ele perto, a regra 2 manda (nada acontece).
    const sozinha = dM > 12 && !A.ANA.ativa;
    if (naAgua && alta && !sub.on && mov < .001 && sozinha && !fuga) {
      parT += dt;
      const ang = P.yaw + 2.2;
      if (parT > 4 && maoFase === 0) { maoFase = 1; som.respiraAgua({ x: P.pos.x - Math.sin(ang) * 3, y: .3, z: P.pos.z - Math.cos(ang) * 3 }, .3); }
      if (maoFase >= 1 && maoFase < 3 && Math.random() < dt * 6) { const r = Math.max(.9, 3 - (parT - 4) * .55); B.emitir(P.pos.x - Math.sin(ang) * r, nivel, P.pos.z - Math.cos(ang) * r, 1, .2); }
      if (parT > 7 && maoFase === 1) {
        maoFase = 2; const r = 1.3, a2 = P.yaw + .5; mao.mostrar(P.pos.x - Math.sin(a2) * r, nivel, P.pos.z - Math.cos(a2) * r, 1.3);
        som.bolhas({ x: P.pos.x, y: .3, z: P.pos.z }, 8, .35); S.fear = Math.min(100, S.fear + 25);
        if (!S.flags.tunMao) { S.flags.tunMao = true; setTimeout(() => { if (A.W.mapa === 'tuneis') A.sub('lia', 'Tem alguma coisa na água comigo. Não dá pra ficar parada aqui.'); }, 1400); }
      }
      if (parT > 10.5 && maoFase === 2) {
        maoFase = 3; maoVezes++;
        if (S.health > 25) S.health -= 7;
        P.shake = .35; lento = 2; som.ofegoAgua(); A.emitNoise(P.pos.x, P.pos.z, 7, true); O.criar(P.pos.x, nivel, P.pos.z, 2.4, .55, 1.4);
        A.toast('Alguma coisa agarrou seu tornozelo! Anda!');
      }
    } else { if (mov > .001 || !naAgua) { parT = 0; maoFase = 0; } }
    if (lento > 0) lento -= dt;
    // bolhas e respiração aleatórias num ponto onde não tem ninguém
    ambT -= dt;
    if (ambT <= 0) {
      ambT = A.rand(18, 32);
      if (alta && P.room && P.room.agua) { const a = A.rand(0, 6.28), r = A.rand(4, 7); const x = Math.max(P.room.x0 + .5, Math.min(P.room.x1 - .5, P.pos.x + Math.cos(a) * r)), z = Math.max(P.room.z0 + .5, Math.min(P.room.z1 - .5, P.pos.z + Math.sin(a) * r)); ambBolhas = { x, z, t: 3 }; som.respiraAgua({ x, y: .3, z }, .3); }
    }
    if (ambBolhas) { ambBolhas.t -= dt; if (Math.random() < dt * 8) B.emitir(ambBolhas.x, nivel, ambBolhas.z, 1, .3); if (ambBolhas.t <= 0) ambBolhas = null; }
    O.update(dt, nivel); B.update(dt, nivel); mao.update(dt);
    // fuga depois do cofre: apagão, lanterna falha, ele aparece na única saída
    if (fuga) {
      fuga.t += dt;
      if (fuga.t > 1.2 && !fuga.apagou) {
        fuga.apagou = true; S.flags.apagao = true; A.syncLuzes(); SFX.estalo({ x: 0, z: -56 }, 1); fuga.pisca = 2;
        if (!fuga.recarga) S.fear = Math.min(100, S.fear + 30);
      }
      if (fuga.pisca > 0) { fuga.pisca -= dt; SUBP.falha(A, .6, .2); }
      if (fuga.t > 2.6 && !fuga.veio) {
        fuga.veio = true;
        if (!M.ativo) A.ativarInspetor(0, -46.5, 'investiga'); else { M.pos.set(0, 0, -46.5); M.state = 'investiga'; M.path = []; M.wait = 0; }
        M.cool = 1.5; M.searchT = 0; M.furia = 0; M.recuo = 0; A.planejar(M, 6, -60);
        SFX.pancada(0, -54); setTimeout(() => SFX.pancada(0, -50), 700);
        A.toast(SUBP.tecla('Ele está vindo pela única saída. Armário, garrafa (G) ou passar agachada por ele.'));
      }
      if (!f4ok && fuga.t > 6 && (P.room.id === 'saida' || P.room.id === 't5' || fuga.t > 50)) { const ind = document.getElementById('fita-ind'); if (!ind || ind.hidden) { f4ok = true; A.tocarFita('f4'); } }
    }
    // fotos da sala do diretor
    if (P.room && P.room.id === 'secreta' && trocas < 4) {
      A.camera.getWorldDirection(vista); alvoV.set(-7.9, 1.75, -62.1).sub(A.camera.position).normalize();
      const olha = vista.dot(alvoV) > .55;
      if (olha) { olhouParede = true; costasT = 0; }
      else if (olhouParede) { costasT += dt; if (costasT > 1.1) { olhouParede = false; costasT = 0; trocas++;
        if (trocas < 4) { trocarFoto(fotos[trocas - 1], 1); SFX.estalo({ x: -7.9, z: -62 }, .4); }
        else { for (const f of fotos) trocarFoto(f, 2); SFX.estalo({ x: -7.9, z: -62 }, 1); S.fear = Math.min(100, S.fear + 20); setTimeout(() => { if (A.W.mapa === 'tuneis') A.sub('lia', 'As fotos... as crianças tão olhando pra mim. Riscaram os olhos.'); }, 900); } } }
    }
  });

  return AUDL7B.tuneis(A, S, AUDL7.tuneis(A, S, SUBR2.tuneis(A, S, SUBR.tuneis(A, S, SUBM2.tuneis(A, S, SUBM.tuneis(A, S, SUBS2.tuneis(A, S, SUBS.tuneis(A, S, SUBP.tuneis(A, S, SUBL.tuneis(A, S, {
    nome: 'Túneis de drenagem',
    spawns: { entrada: { x: 0, z: -2.5, yaw: 0 }, inicio: { x: 0, z: -2.5, yaw: 0 } },
    dentro: { hemi: .05, moon: 0, fog: .12 },
    energia: () => !!S.flags.energia && !S.flags.apagao,
    inspetor: () => true,
    procissao: () => S.chapter >= 4,
    ana: () => S.chapter >= 4,
    chamado: () => true,
    submersa: () => sub.on,
    ruidoMul: () => sub.on ? .15 : (enchente > 0 && A.P.naAgua) ? 1.3 : 1,
    velMul: () => (sub.on ? .75 : 1) * (enchente > 0 && A.P.naAgua ? .82 : 1) * (lento > 0 ? .5 : 1),
    entrouSala(r) {
      if (r.id === 'secreta' && !S.flags.tunSecreta) { S.flags.tunSecreta = true; A.sub('lia', 'O escritório do diretor. Aqui embaixo, onde ninguém ouvia.'); }
    },
    entrar(cap) {
      if (!S.flags.tunIntro) { S.flags.tunIntro = true; setTimeout(() => A.falar('tuneis_inicio'), 1000); }
      A.agendarEntidades();
      // voltou de uma morte depois do cofre: o apagão e a chegada dele se repetem
      if (S.flags.cofre && !S.done.sair_tuneis) iniciarFugaCofre(true);
    }
  }, { nivel: () => nivel, O, B, som }), // lore do Lote 2: src/subterraneo-lore.js
  { FX, som, O, B, nivel: () => nivel, valvIts, jato, sub, telaFolego, barraFolego, mao, emergir: () => emergir, lento: () => lento, emerg, brinq, cofrePorta: cp, disco, itEsc, esc2 }), // lote 3: src/subterraneo-polimento.js
  { nivel: () => nivel, O, sub, valvIts, jato, FX }), // lote 4: src/subterraneo-segredos.js
  { nivel: () => nivel }), // lote 4 (2ª leva): src/subterraneo-segredos2.js
  { som, O, B, nivel: () => nivel, muretaX: -18, muretaZ: -36 }), // lote 5: src/subterraneo-monstros.js
  { som, O, B, nivel: () => nivel }), // lote 5 (2ª leva): src/subterraneo-monstros2.js
  { valvIts, jato, sub, nivel: () => nivel, som, O, B }), // lote 6: src/subterraneo-rejogo.js
  { som, B, nivel: () => nivel }), // lote 6 (2ª rodada): src/subterraneo-rejogo2.js
  { nivel: () => nivel, valvIts, O, B, som }), // lote 7: src/subterraneo-audio7.js
  { nivel: () => nivel, valvIts }); // lote 7 (2ª leva): src/subterraneo-audio7b.js
}

// =====================================================================
// CEMITÉRIO E CAPELA (Capítulo V — final)
// =====================================================================
function cemiterio(A, S) {
  const { THREE, MAT, box, cyl, prop, plano, piso, item, interact, ITENS, MK, gatilho, SFX, spot, rand } = A;
  const som = SUB.sons(A), maoTerra = SUB.maoPalida(A), FX = SUBP.efeitos(A);
  SUBL.antesCemiterio(A, S);
  const salas = [
    { id: 'cem', nome: 'Cemitério das irmãs', x0: -30, x1: 30, z0: -48, z1: 12, fora: true },
    { id: 'capela', nome: 'Capela', x0: -8, x1: 8, z0: -70, z1: -48, piso: 'pedra', parede: 'pedra', h: 6 }
  ];
  const portas = [{ id: 'cap', a: 'cem', b: 'capela', x: 0, z: -48, eixo: 'x', nome: 'porta da capela', largura: 2,
    trava: () => !S.inv.chaves.capela || Object.keys(S.tumulos).length < 3, aoTentar: () => SUBL.tentouCapela(A, S), msg: () => !S.inv.chaves.capela ? 'Trancada.' : 'Ainda não. Faltam as coisas deles.' }];
  A.construirSalas(salas, portas);
  piso(-80, 80, -110, 80, 'grama', 4, -.01);
  piso(-30, 30, -48, 12, 'terra', 4, .002);
  piso(-1.5, 1.5, -48, 12, 'pedra', 2, .004);
  const arv = arvores(A, [[-60, -32, -100, 40], [32, 60, -100, 40], [-30, 30, 14, 50], [-30, -9, -100, -50], [9, 30, -100, -50]], SUBP.baixa() ? 120 : 260);
  muro(A, -30, -48, -30, 12, 2.2); muro(A, 30, -48, 30, 12, 2.2); muro(A, -30, 12, -2.3, 12, 2.2); muro(A, 2.3, 12, 30, 12, 2.2);
  muro(A, -30, -48, -8, -48, 2.2); muro(A, 8, -48, 30, -48, 2.2);
  const fundos = portao(A, 0, 12, 4);
  for (const [x, z, h] of [[-20, -10, 7], [18, -30, 6], [-14, -38, 5], [22, 2, 6], [-24, 4, 5]]) arvoreSeca(A, x, z, h);
  // neblina rasteira que corre entre as covas
  const nev = SUB.neblina(A, -30, 30, -48, 12, .28, .26);
  // capela por fora: torre do sino, com uma luz fraca na janela
  box(5, 5, 5, A.texMat('pedra', 1.6, 1.6), 0, 8.5, -66, A.W.grupo, false);
  const tc = new THREE.Mesh(new THREE.ConeGeometry(3.8, 4, 4), MAT.telhado); tc.rotation.y = Math.PI / 4; tc.position.set(0, 13, -66); A.W.grupo.add(tc);
  box(1.2, 2, .2, MAT.preto, 0, 8.5, -63.4, A.W.grupo, false);
  plano(1.1, 1.9, new THREE.MeshBasicMaterial({ color: 0x3a1a08 }), 0, 8.5, -63.28);
  const vt = vulto(A); vt.scale.setScalar(.55); vt.position.set(0, 7.45, -63.22);
  // mausoléu (saída dos túneis)
  const mau = A.texMat('pedra', 1, 1);
  prop(4, 3.2, 3, mau, 24, 1.6, 9); box(4.4, .4, 3.4, mau, 24, 3.4, 9);
  const esc = box(1, .1, 1, MAT.ferrugem, 24, 0.05, 6.8);
  // lápides
  if (!S.tumPos) {
    const cel = []; for (let z = -40; z <= 4; z += 4) for (let x = -24; x <= 24; x += 4) if (Math.abs(x) > 3 && !(x > 18 && z > 0)) cel.push([x + rand(-.4, .4), z + rand(-.3, .3)]);
    for (let i = cel.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [cel[i], cel[j]] = [cel[j], cel[i]]; }
    S.tumPos = cel;
  }
  const nomes = A.R.lapides, cel = S.tumPos, pedras = [], covas = [];
  const lapide = (x, z, l, i) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.PI + rand(-.12, .12); g.rotation.z = rand(-.06, .06); A.W.grupo.add(g);
    const tex = A.textoTex([{ t: '✝', tam: 40, y: 50 }, { t: l.nome, tam: l.nome.length > 14 ? 22 : 28, y: 120 }, { t: l.datas, tam: 22, y: 170 }, ...(l.frase ? [{ t: l.frase, tam: l.frase.length > 18 ? 15 : 18, y: 212, estilo: 'italic' }] : [])], { w: 256, h: 256, fundo: '#55534c', cor: '#1a1814', manchas: 5 });
    const pedra = box(.8, 1.05, .16, [MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, new THREE.MeshStandardMaterial({ map: tex, roughness: .95 }), MAT.pedraLap], 0, .52, 0, g);
    A.addCollider(x - .42, x + .42, z - .12, z + .12); A.W.solid.push(pedra); pedras.push({ x, z });
    const monte = box(.9, .12, 1.7, A.texMat('terra', .5, .5), 0, .06, -1, g, false);
    return { g, monte };
  };
  const emCima = (g, lx, ly, lz) => { g.updateMatrixWorld(true); return g.localToWorld(new THREE.Vector3(lx, ly, lz)); };
  // o objeto de cada criança, deixado em cima da cova (visível de longe pela vela)
  const objeto = id => {
    const o = new THREE.Group();
    if (id === 'ana') { const fita = new THREE.MeshStandardMaterial({ color: 0x8a1420, emissive: 0x2a0408, emissiveIntensity: .8, roughness: .6 }); for (const s of [-1, 1]) { const l = box(.09, .015, .05, fita, s * .05, .01, 0, o, false); l.rotation.y = s * .5; } box(.03, .02, .03, fita, 0, .012, 0, o, false); const c = box(.015, .01, .14, fita, .02, .006, .07, o, false); c.rotation.y = .3; }
    else if (id === 'tome') { const p = new THREE.Mesh(new THREE.TorusGeometry(.065, .028, 8, 14), new THREE.MeshStandardMaterial({ color: 0x141414, roughness: .8, emissive: 0x0a0a0a })); p.rotation.x = Math.PI / 2; p.position.y = .03; o.add(p); cyl(.03, .03, .05, MAT.ferrugem, 0, .03, 0, 8, o); }
    else { const f = new THREE.Mesh(new THREE.PlaneGeometry(.21, .28), MAT.papel); f.rotation.x = -Math.PI / 2; f.rotation.z = .4; f.position.y = .008; o.add(f); }
    A.W.grupo.add(o); return o;
  };
  const descricao = { ana: 'uma fita de cabelo vermelha', tome: 'um pneu de carrinho', davi: 'uma folha de caderno' };
  const importantes = {}, velasTum = {}, objetos = {}, itsTum = {};
  let k = 0;
  nomes.forEach((l, i) => {
    const [x, z] = cel[k++]; const L = lapide(x, z, l, i);
    if (l.importante) {
      importantes[l.id] = L;
      const pv = emCima(L.g, .3, .12, -.45), po = emCima(L.g, -.12, .125, -1.15);
      velasTum[l.id] = SUB.velaViva(A, pv.x, pv.y, pv.z, 6);
      const ob = objeto(l.id); ob.position.copy(po); ob.rotation.y = rand(0, 6); objetos[l.id] = ob;
      const rel = { ana: ['boneca', 'Ana'], tome: ['carrinho', 'Tomé'], davi: ['caderno', 'Davi'] }[l.id];
      const it = interact(L.g, () => {
        if (S.tumulos[l.id]) return `${l.nome} — já cavado`;
        if (!S.inv.pa) return `${l.nome} · ${l.datas} — uma vela acesa e ${descricao[l.id]}`;
        const kk = Math.min(1, (it.progresso || 0) / it.hold);
        return `<b>E</b>Cavar o túmulo de ${l.nome} ${kk > .02 ? `(${Math.round(kk * 100)}% — a pá faz barulho)` : '(segure; dá para parar e voltar)'}`;
      }, () => {
        if (S.tumulos[l.id] || !S.inv.pa) return;
        S.tumulos[l.id] = true; S.inv.reliquias++; SFX.pegar(); A.falar('tumulo'); A.toast(`Você achou ${rel[0] === 'boneca' ? 'a boneca da Ana' : rel[0] === 'carrinho' ? 'o carrinho do Tomé' : 'o caderno do Davi'}. A vela apagou sozinha.`);
        L.monte.scale.y = 3; velasTum[l.id].acesa = false; ob.visible = false; it.progresso = 0; A.progresso();
        const n = Object.keys(S.tumulos).length;
        if (n === 3) sustoTerceiro();
        setTimeout(() => { if (A.W.mapa === 'cemiterio' && !A.S.dead && !S.flags.sino) A.salvarCheckpoint(); }, 1500);
      });
      it.hold = 4; it.guarda = true; it.som = 'cavar'; it.pode = () => !!S.inv.pa && !S.tumulos[l.id];
      Object.defineProperty(it, 'ruido', { get: () => 6 + 4 * Math.min(1, (it.progresso || 0) / it.hold) });
      itsTum[l.id] = { it, L };
    } else interact(L.g, () => (l.epitafio || l.aoLer ? '<b>E</b>' : '') + `${l.nome} · ${l.datas}`, () => { if (l.epitafio) A.toast(l.epitafio); if (l.aoLer) l.aoLer(); });
  });
  // lápide rachada (nota) e recorte na porta da capela
  { const [x, z] = cel[k++]; const L = lapide(x, z, { nome: '— rachada —', datas: '' }); const it = interact(L.g, () => `<b>E</b>Ler a lápide rachada${S.notes.n11 ? ' (lida)' : ''}`, () => A.lerNota('n11')); }
  // covas sem nome: cruzes tortas e pedras gastas no resto do campo
  for (let n = 0, max = SUBP.baixa() ? 36 : 60; k < cel.length && n < max; k++, n++) {
    const [x, z] = cel[k], g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rand(-.3, .3); g.rotation.z = rand(-.15, .15); A.W.grupo.add(g);
    if (k % 3 === 0) { box(.1, 1.2, .1, MAT.madeiraEsc, 0, .6, 0, g); box(.6, .1, .1, MAT.madeiraEsc, 0, .9, 0, g); }
    else { const h = rand(.5, .9); A.W.solid.push(box(.6, h, .14, MAT.pedraLap, 0, h / 2, 0, g)); }
    const monte = box(.8, .1, 1.5, A.texMat('terra', .5, .5), 0, .05, -.9, g, false);
    A.addCollider(x - .35, x + .35, z - .12, z + .12); pedras.push({ x, z }); covas.push({ g, monte, x, z });
  }
  // no terceiro túmulo, a cova do lado cede e uma mão sai da terra
  let afunda = null;
  function sustoTerceiro() {
    const P = A.P; let melhor = null, md = 1e9;
    for (const c of covas) { const d = Math.hypot(c.x - P.pos.x, c.z - P.pos.z); if (d > 2.2 && d < md) { md = d; melhor = c; } }
    if (!melhor || md > 14) return;
    afunda = { c: melhor, t: 0 };
    const p = emCima(melhor.g, 0, 0, -.9);
    setTimeout(() => { if (A.W.mapa !== 'cemiterio') return; som.terra(p); maoTerra.mostrar(p.x, .05, p.z, 2.2); SFX.susto(); A.P.shake = .12; S.fear = Math.min(100, S.fear + 30); }, 1800);
    setTimeout(() => { if (A.W.mapa === 'cemiterio') A.sub('lia', 'Tem mais alguém enterrado aqui que não quer ficar.'); }, 4200);
  }
  ITENS.nota('n12', { x: 1.6, y: 1.5, z: -47.75 }, true);
  // capela por dentro
  const carv = SUBL.carvao(A); // bancos queimados no incêndio
  for (let i = 0; i < 5; i++) for (const x of [-4, 4]) { prop(5, .5, .5, carv, x, .25, -51 - i * 2); box(5, .6, .08, carv, x, .7, -50.75 - i * 2); }
  const altar = prop(3, 1, 1.2, MAT.lencol, 0, .5, -66);
  box(3.1, .05, 1.3, MAT.tecido, 0, 1.02, -66);
  const cruz = new THREE.Group(); cruz.position.set(0, 3.4, -69.8); A.W.grupo.add(cruz);
  box(.15, 2.4, .1, MAT.madeiraEsc, 0, 0, 0, cruz); box(1.3, .15, .1, MAT.madeiraEsc, 0, .55, 0, cruz);
  const velasAltar = [-1.2, -.6, .6, 1.2].map(x => SUB.velaViva(A, x, 1.05, -66.4, 4.5));
  let chama = 0; const avivar = (f = 2.6) => { chama = f; };
  const slots = [[-.7, -65.7], [0, -65.6], [.7, -65.7]];
  const noAltar = [MK.carrinho(), MK.boneca(), MK.caderno()].map((m, i) => { m.position.set(slots[i][0], 1.05, slots[i][1]); A.W.grupo.add(m); return m; });
  const vozes = [['davi', 'O carrinho do Tomé. Ele nunca largava isso.'], ['ana', 'Minha boneca... você achou.'], ['davi', 'Meu caderno. Tá tudo aí, Lia.']];
  interact(altar, () => {
    if (S.inv.reliquias > 0) return `<b>E</b>Colocar ${S.inv.reliquias > 1 ? 'os objetos' : 'o objeto'} no altar`;
    if (S.placed >= 3) return 'Os três objetos estão no altar.';
    return `Um altar coberto de cera (${S.placed}/3).`;
  }, () => {
    if (S.inv.reliquias <= 0) return;
    const antes = S.placed;
    S.placed += S.inv.reliquias; S.inv.reliquias = 0; SFX.pegar(); A.syncWorld(); A.progresso(); avivar();
    for (let i = antes; i < Math.min(3, S.placed); i++) { const [q, t] = vozes[i]; setTimeout(() => { if (A.W.mapa === 'cemiterio') { A.sub(q, t); SFX.sussurros(1.2); } }, 900 + (i - antes) * 3200); }
    if (S.placed >= 3) setTimeout(() => { if (A.W.mapa === 'cemiterio' && !A.S.dead && !S.flags.sino) A.salvarCheckpoint(); }, 1200); // antes do sino: morrer na fuga volta aqui
  });
  // o sino (dentro da torre, corda desce até o chão)
  const sinoG = new THREE.Group(); sinoG.position.set(4.8, 5.3, -64); A.W.grupo.add(sinoG);
  const sinoP = new THREE.Group(); sinoG.add(sinoP);
  const pts = [.48, .47, .44, .38, .32, .26, .2, .12, 0].map((r, i) => new THREE.Vector2(r, -i * .12));
  const sino = new THREE.Mesh(new THREE.LatheGeometry(pts, 16), MAT.bronze); sino.castShadow = true; sinoP.add(sino);
  box(2.2, .14, .14, MAT.madeiraEsc, 0, .1, 0, sinoG); box(.1, 5.4, .1, MAT.madeiraEsc, -1, -2.6, 0, sinoG); box(.1, 5.4, .1, MAT.madeiraEsc, 1, -2.6, 0, sinoG);
  const corda = box(.03, 4.4, .03, MAT.lencol, 0, -3.1, 0, sinoP, false);
  A.addCollider(3.7, 5.9, -64.15, -63.85);
  // obelisco ao lado do caminho central: na fuga, ele tomba e fecha o atalho
  const obel = new THREE.Group(); obel.position.set(-2.6, 0, -22); A.W.grupo.add(obel);
  const pedraOb = A.texMat('pedra', 1, 2);
  box(.8, .4, .8, pedraOb, 0, .2, 0, obel); box(.5, 4, .5, pedraOb, 0, 2.2, 0, obel); box(.12, .7, .52, MAT.preto, 0, 3.4, 0, obel, false);
  A.addCollider(-3, -2.2, -22.4, -21.6);
  const colOb = A.addCollider(-2.6, 1.8, -22.35, -21.65); colOb.on = false;
  let fuga = null;
  const itSino = interact(sinoG, () => {
    if (S.flags.sino) return 'O sino ainda vibra.';
    if (S.placed < 3) return 'O sino. A corda está podre, mas aguenta.';
    return '<b>E</b>Puxar a corda do sino';
  }, () => {
    if (S.flags.sino || S.placed < 3) return;
    S.flags.sino = true; A.objDone('sino'); SFX.sino(1, { x: 4.8, y: 5, z: -64 }); A.falar('sino'); A.P.shake = .2; A.sustos.sino();
    let t = 0; A.W.tick.push(dt => { t += dt; sinoP.rotation.x = Math.sin(t * 3) * .6 * Math.exp(-t * .15) + (fuga ? Math.sin(t * 2.2) * .15 : 0); });
    fundos.abrir(); A.setDoor(A.DOOR('cap'), true, true); avivar(4);
    A.desativarInspetor();
    fuga = { t: 0, caiu: false, sinoT: 7, rangeT: 4, avisou: false };
    setTimeout(() => { A.ativarInspetor(0, -67, 'caca'); A.M.cool = 2.5; SFX.grito('inspetor'); A.emitNoise(0, -60, 60); }, 3200);
    setTimeout(() => { if (A.S.flags.sino && !A.ANA.ativa) A.spawnAna(A.SALA('cem')); }, 9000);
  });
  itSino.hold = 3; itSino.ruido = 40; itSino.som = 'corda'; itSino.pode = () => !S.flags.sino && S.placed >= 3;
  gatilho('fuga', -2.2, 2.2, 11.2, 13, () => { if (S.flags.sino) A.escolhaFinal(); }, false);
  gatilho('entrouCapela', -8, 8, -70, -48.5, () => {
    if (S.chapter === 5 && !S.done.capela) {
      A.objDone('capela'); A.falar('capela');
      // a porta bate atrás dela e as velas do altar se agitam
      const d = A.DOOR('cap'); if (d && d.open) { A.setDoor(d, false, true); SFX.pancada(0, -48); A.P.shake = .15; }
      avivar(3); S.fear = Math.min(100, S.fear + 20);
    }
  }, false);
  gatilho('vozCemit', -30, 30, -20, -10, () => { A.sustos.chamadoVoz(-20, -30); });
  // ---------- vida do cemitério
  let ultimo = null;
  const vista = new THREE.Vector3(), alvoV = new THREE.Vector3();
  let vultoT = 0;
  A.W.tick.push(dt => {
    const P = A.P, t = A.perf();
    // velas do altar: se agitam e voltam ao normal
    chama = Math.max(0, chama - dt * 1.2);
    for (const v of velasAltar) v.forca = 1 + chama;
    // terra cresce enquanto cava (e fica, se parar)
    for (const [id, { it, L }] of Object.entries(itsTum)) if (!S.tumulos[id]) L.monte.scale.y = 1 + 2 * Math.min(1, (it.progresso || 0) / it.hold);
    // cova que cede
    if (afunda) { afunda.t += dt; const kk = Math.min(1, afunda.t / 1.8); afunda.c.monte.position.y = .05 - kk * .12; afunda.c.g.rotation.x = -kk * .25; if (kk >= 1) afunda = null; }
    maoTerra.update(dt);
    // vulto na janela da torre, uma vez, quando ela olha de longe
    if (S.chapter === 5 && !S.flags.cemVulto && P.room && P.room.id === 'cem' && P.pos.z > -36) {
      A.camera.getWorldDirection(vista); alvoV.set(0, 8.2, -63.2).sub(A.camera.position).normalize();
      if (vista.dot(alvoV) > .96) { S.flags.cemVulto = true; vt.visible = true; vultoT = 1.3; S.fear = Math.min(100, S.fear + 15); SFX.estalo({ x: 0, z: -63 }, .5); }
    }
    if (vultoT > 0) { vultoT -= dt; if (vultoT <= 0) vt.visible = false; }
    // fuga depois do sino
    if (fuga) {
      fuga.t += dt;
      def.fora.fog += (.066 - def.fora.fog) * Math.min(1, dt * .3);
      fuga.sinoT -= dt; if (fuga.sinoT <= 0 && fuga.t < 90) { fuga.sinoT = 7; SFX.sino(.5, { x: 4.8, y: 5, z: -64 }); }
      fuga.rangeT -= dt; if (fuga.rangeT <= 0) { fuga.rangeT = A.rand(3, 6); SFX.rangido(0, 1.5, 12, .7); }
      const bal = Math.sin(t * .9) * .18; fundos.L.rotation.y = 1.4 - .2 - bal; fundos.R.rotation.y = -(1.4 - .2 + bal);
      if (!fuga.caiu && fuga.t > 6 && Math.hypot(P.pos.x + .4, P.pos.z + 22) > 3.5) { fuga.caiu = true; fuga.queda = 0; }
      if (fuga.caiu && fuga.queda < 1) {
        fuga.queda = Math.min(1, fuga.queda + dt * (.35 + fuga.queda * 2.5)); obel.rotation.z = -fuga.queda * Math.PI / 2;
        if (fuga.queda >= 1) { colOb.on = true; SFX.pancada(-.4, -22); som.terra({ x: -.4, z: -22 }); if (Math.hypot(P.pos.x, P.pos.z + 22) < 25) P.shake = .25; A.toast('O obelisco caiu no caminho! Contorne pelas covas.'); }
      }
    }
    // atrás de uma lápide, agachada, o som se perde
    ultimo = null;
    if (!P.sprinting && P.room && P.room.id === 'cem') for (const p of pedras) if (Math.abs(p.x - P.pos.x) < 1.2 && Math.abs(p.z - P.pos.z) < 1.2) { ultimo = p; break; }
  });
  const def = {
    nome: 'Cemitério das irmãs',
    cemiterio: true,
    spawns: { tuneis: { x: 24, z: 6, yaw: 0 }, inicio: { x: 24, z: 6, yaw: 0 } },
    fora: { hemi: 1.05, moon: 1.3, fog: .042 }, dentro: { hemi: .1, moon: .05, fog: .07 },
    energia: () => false,
    inspetor: () => S.chapter >= 5 && !S.flags.sino,
    inspetorFora: true, anaFora: true,
    procissao: () => false,
    ana: () => S.chapter >= 5,
    chamado: () => false,
    ruidoMul: () => ultimo ? .7 : 1,
    sync() {
      noAltar.forEach((m, i) => m.visible = i < S.placed);
      for (const [id, L] of Object.entries(importantes)) if (S.tumulos[id]) { L.monte.scale.y = 3; velasTum[id].acesa = false; objetos[id].visible = false; }
    },
    entrar(cap) {
      if (!S.flags.cemIntro) {
        S.flags.cemIntro = true; setTimeout(() => A.falar('cemiterio_inicio'), 1200);
        setTimeout(() => { if (A.W.mapa === 'cemiterio' && !Object.keys(S.tumulos).length) A.sub('lia', 'Três velas acesas no meio das covas. Alguém sabia que eu vinha.'); }, 6500);
      }
      if (S.flags.sino) { fundos.abrir(); A.ativarInspetor(0, -66, 'caca'); }
      A.agendarEntidades();
    },
  };
  return AUDL7B.cemiterio(A, S, AUDL7.cemiterio(A, S, SUBR2.cemiterio(A, S, SUBR.cemiterio(A, S, SUBM2.cemiterio(A, S, SUBM.cemiterio(A, S, SUBS2.cemiterio(A, S, SUBS.cemiterio(A, S, SUBP.cemiterio(A, S, SUBL.cemiterio(A, S, def, { covas, pedras, importantes, velasTum, velasAltar, avivar, itSino, sinoP, corda, fundos, noAltar, cel, nomes }), // lore do Lote 2
    { FX, som, neblina: nev, velasAltar, velasTum, itsTum, importantes, sinoP, obel, arvoresMesh: [arv.tronco, arv.copa] }), // lote 3: src/subterraneo-polimento.js
    { FX, itsTum, importantes, covas, sinoP, fundos }), // lote 4: src/subterraneo-segredos.js
    { itsTum, importantes, covas, sinoP, fundos }), // lote 4 (2ª leva): src/subterraneo-segredos2.js
    { som, covas, pedras, fundos, velasAltar, avivar, neblina: nev }), // lote 5: src/subterraneo-monstros.js
    { som, covas, pedras, sinoP, avivar }), // lote 5 (2ª leva): src/subterraneo-monstros2.js
    { som, covas, itsTum, importantes, lapide, emCima, objeto, neblina: nev }), // lote 6: src/subterraneo-rejogo.js
    { som, covas, itsTum, importantes, lapide, emCima, itSino, velasAltar, cruz }), // lote 6 (2ª rodada): src/subterraneo-rejogo2.js
    { avivar, sinoP, importantes, covas, velasAltar, som }), // lote 7: src/subterraneo-audio7.js
    { covas, pedras, itsTum, importantes, velasAltar, cel, nomes }); // lote 7 (2ª leva): src/subterraneo-audio7b.js
}

export const MAPAS_SUBSOLO = { tuneis, cemiterio };
