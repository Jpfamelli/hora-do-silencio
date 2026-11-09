// MAPAS DO INTERNATO (térreo e andar de cima: Capítulos I-III). Carregado só quando o jogador chega aqui (ver mapas.js).
import { extrasTerreo, extrasSuperior, juntar } from './src/internato.js';
import { loreTerreo, loreSuperior } from './src/internato-lore.js';
import { polirTerreo, polirSuperior } from './src/internato-polimento.js';
import { segredosTerreo } from './src/internato-segredos.js';
import { segredosSuperior } from './src/internato-segredos-sup.js';
import { monstrosTerreo, monstrosSuperior } from './src/monstros-internato.js';
import { rejogoTerreo, rejogoSuperior } from './src/internato-rejogo.js'; // lote 6: rejogabilidade (semente, 2ª jogada, recordes)
import { rejogo2Terreo, rejogo2Superior } from './src/internato-rejogo2.js'; // lote 6 (2ª leva): desafios, salas-evento, corredor que se repete, segredos da rejogada
import { somTerreo, somSuperior } from './src/internato-som.js'; // lote 7: som e atmosfera (ambiência por sala, tensão procedural, vozes, clima, silêncio como arma)
import { arvoreSeca, muro, portao, vulto, janelasFachada, placa, noCaixote, arvores } from './src/mapas-util.js';
import { tecla } from './src/estrada-polimento.js';

// =====================================================================
// TÉRREO DO INTERNATO (Capítulos I e II)
// =====================================================================
function terreo(A, S) {
  const { THREE, MAT, box, cyl, prop, plano, piso, item, interact, ITENS, MK, gatilho, SFX, spot } = A;
  const salas = [
    { id: 'patio', nome: 'Pátio', x0: -14, x1: 14, z0: 0, z1: 16, fora: true, seguro: true },
    { id: 'hall', nome: 'Recepção', x0: -6, x1: 6, z0: -14, z1: 0, tipo: 'hall', piso: 'madeira' },
    { id: 'cw', nome: 'Corredor oeste', x0: -34, x1: -6, z0: -14, z1: -10, tipo: 'corredor', piso: 'ladrilho' },
    { id: 'ce', nome: 'Corredor leste', x0: 6, x1: 34, z0: -14, z1: -10, tipo: 'corredor', piso: 'ladrilho' },
    { id: 'aula', nome: 'Sala de aula', x0: -20, x1: -6, z0: -10, z1: 0, tipo: 'aula', piso: 'madeira' },
    { id: 'biblio', nome: 'Biblioteca', x0: -34, x1: -20, z0: -10, z1: 0, tipo: 'biblioteca', piso: 'madeira' },
    { id: 'refeit', nome: 'Refeitório', x0: -24, x1: -6, z0: -26, z1: -14, tipo: 'refeitorio', piso: 'ladrilho' },
    { id: 'cozinha', nome: 'Cozinha', x0: -34, x1: -24, z0: -26, z1: -14, tipo: 'cozinha', piso: 'ladrilho', parede: 'azulejo' },
    { id: 'despensa', nome: 'Despensa', x0: -34, x1: -24, z0: -34, z1: -26, tipo: 'despensa', piso: 'concreto' },
    { id: 'diret', nome: 'Diretoria', x0: 6, x1: 18, z0: -10, z1: 0, tipo: 'diretoria', piso: 'madeira' },
    { id: 'enferm', nome: 'Enfermaria', x0: 18, x1: 34, z0: -10, z1: 0, tipo: 'enfermaria', piso: 'ladrilho', parede: 'azulejo' },
    { id: 'lavand', nome: 'Lavanderia', x0: 6, x1: 16, z0: -26, z1: -14, tipo: 'lavanderia', piso: 'concreto' },
    { id: 'banh', nome: 'Banheiros', x0: 16, x1: 24, z0: -26, z1: -14, tipo: 'banheiro', piso: 'ladrilho', parede: 'azulejo' },
    { id: 'maq', nome: 'Casa de máquinas', x0: 24, x1: 34, z0: -26, z1: -14, tipo: 'maquinas', piso: 'concreto', parede: 'tijolo' },
    // Lote 3: copa de serviço nos fundos, entre o refeitório e a lavanderia (rota alternativa pela janela quebrada)
    { id: 'copa', nome: 'Copa de serviço', x0: -6, x1: 6, z0: -26, z1: -20, tipo: 'corredor', piso: 'ladrilho', parede: 'azulejo' }
  ];
  const portas = [
    { id: 'main', a: 'hall', b: 'patio', x: 0, z: 0, eixo: 'x', nome: 'porta principal', hold: 3, ruidoHold: 9, holdTexto: 'Forçar a porta principal', aoAbrir: () => { if (!S.done.forcar_porta) { A.objDone('forcar_porta'); S.timers.insp = X.inspAcorda(); } } },
    { id: 'hcw', a: 'hall', b: 'cw', x: -6, z: -12, eixo: 'z' }, { id: 'hce', a: 'hall', b: 'ce', x: 6, z: -12, eixo: 'z' },
    { id: 'aula', a: 'cw', b: 'aula', x: -13, z: -10, eixo: 'x', nome: 'porta da sala de aula' },
    { id: 'biblio', a: 'cw', b: 'biblio', x: -27, z: -10, eixo: 'x', nome: 'porta da biblioteca' },
    { id: 'refeit', a: 'cw', b: 'refeit', x: -15, z: -14, eixo: 'x', nome: 'porta do refeitório' },
    { id: 'cozinha', a: 'cw', b: 'cozinha', x: -29, z: -14, eixo: 'x', nome: 'porta da cozinha' },
    { id: 'rc', a: 'refeit', b: 'cozinha', x: -24, z: -20, eixo: 'z' },
    { id: 'despensa', a: 'cozinha', b: 'despensa', x: -32.8, z: -26, eixo: 'x', nome: 'porta da despensa' }, // fora do balcão da cozinha
    { id: 'diret', a: 'ce', b: 'diret', x: 8, z: -10, eixo: 'x', nome: 'porta da diretoria' }, // fora da estante
    // atalhos de mão única: o trinco fica do lado de dentro
    { id: 'atalhoDir', a: 'hall', b: 'diret', x: 6, z: -5, eixo: 'z', nome: 'porta lateral da diretoria', trava: () => !S.flags.trinco_atalhoDir, msg: 'Trancada pelo outro lado.', aoTentar: () => X.trinco('atalhoDir', 'diret') },
    { id: 'atalhoEnf', a: 'diret', b: 'enferm', x: 18, z: -5, eixo: 'z', nome: 'porta da enfermaria para a diretoria', trava: () => !S.flags.trinco_atalhoEnf, msg: 'Trancada pelo outro lado.', aoTentar: () => X.trinco('atalhoEnf', 'enferm') },
    { id: 'enferm', a: 'ce', b: 'enferm', x: 26, z: -10, eixo: 'x', nome: 'porta da enfermaria' },
    { id: 'lavand', a: 'ce', b: 'lavand', x: 11, z: -14, eixo: 'x', nome: 'porta da lavanderia' },
    { id: 'banh', a: 'ce', b: 'banh', x: 20, z: -14, eixo: 'x', nome: 'porta dos banheiros' },
    { id: 'maq', a: 'ce', b: 'maq', x: 29, z: -14, eixo: 'x', nome: 'porta da casa de máquinas' },
    { id: 'copa', a: 'refeit', b: 'copa', x: -6, z: -23, eixo: 'z', nome: 'porta da copa' },
    // vão da janela quebrada (só corta a parede): não é passagem do Inspetor, sai da lista de ligações logo abaixo
    { id: 'janLav', a: 'copa', b: 'lavand', x: 6, z: -23, eixo: 'z', tipo: 'aberta', largura: 1.3, alto: 1.9 }
  ];
  A.construirSalas(salas, portas);
  { const k = A.W.links.findIndex(l => l.a === 'copa' && l.b === 'lavand'); if (k >= 0) A.W.links.splice(k, 1); }
  const RJ = rejogoTerreo(A, S, {}); const rj = RJ._rj; // lote 6: semente da noite, 2ª jogada, recordes e decoração sorteada
  piso(-60, 60, -60, 60, 'grama', 4, -.01);
  piso(-14, 14, 0, 16, 'terra', 3, .002);
  // pátio fechado
  muro(A, -14, 0, -14, 16); muro(A, 14, 0, 14, 16); muro(A, -14, 16, -2.3, 16); muro(A, 2.3, 16, 14, 16);
  portao(A, 0, 16, 4);
  arvoreSeca(A, -9, 9); arvoreSeca(A, 10, 11, 5);
  box(.08, 2.6, .08, MAT.ferrugem, 5, 1.3, 6); box(.08, 2.6, .08, MAT.ferrugem, 8, 1.3, 6); box(3.1, .08, .08, MAT.ferrugem, 6.5, 2.6, 6);
  const bal = new THREE.Group(); bal.position.set(6.5, 2.6, 6); A.W.grupo.add(bal);
  box(.01, 2.1, .01, MAT.metal, -.35, -1.05, 0, bal); box(.01, 2.1, .01, MAT.metal, .35, -1.05, 0, bal); box(.8, .05, .3, MAT.madeiraEsc, 0, -2.1, 0, bal);
  A.W.tick.push(() => { bal.rotation.x = Math.sin(A.perf() * .8) * .25 * (1 - (bal.userData.parado || 0)); }); // para quando a lanterna bate nele (internato-lore.js)
  // fachada
  janelasFachada(A, [-31, -27, -23, -17, -13, -9, 9, 13, 21, 25, 29, 32], 0, 1.75, 1);
  placa(A, [{ t: 'INTERNATO SÃO LÁZARO', tam: 44, estilo: 'bold' }, { t: 'Ordem · Fé · Silêncio', tam: 26, estilo: 'italic' }], 0, 3.9, .35, 6, 1.5, 0);
  box(4, 4.4, 4, A.texMat('reboco', 1.3, 1.3), 0, 5.4, -3, A.W.grupo, false);
  const tt = new THREE.Mesh(new THREE.ConeGeometry(3.2, 2.4, 4), MAT.telhado); tt.rotation.y = Math.PI / 4; tt.position.set(0, 8.8, -3); A.W.grupo.add(tt);
  const relFachada = plano(2.2, 2.2, new THREE.MeshStandardMaterial({ map: A.TX.relogio, roughness: .8 }), 0, 5.6, -.98);

  // recepção
  prop(5, 1.1, .8, MAT.madeiraEsc, 0, .55, -4); box(5.1, .06, .9, MAT.madeira, 0, 1.13, -4);
  A.W.spots.hall.mesa.push({ x: -1.6, y: 1.16, z: -4 }, { x: 1.4, y: 1.16, z: -4 });
  for (const z of [-2, -3.2]) prop(.5, .9, .5, MAT.madeiraEsc, 5, .45, z);
  const quadro = box(1.4, 1, .08, MAT.madeiraEsc, 3, 1.6, -13.85);
  const visor = box(.4, .12, .03, new THREE.MeshStandardMaterial({ color: 0x000, emissive: 0x30ff60, emissiveIntensity: 0 }), 3, 2.0, -13.8, A.W.grupo, false);
  for (let i = 0; i < 9; i++) box(.02, .02, .06, MAT.bronze, 2.6 + (i % 3) * .4, 1.75 - Math.floor(i / 3) * .25, -13.78, A.W.grupo, false);
  const relHall = plano(.8, .8, new THREE.MeshStandardMaterial({ map: A.TX.relogio }), -3.5, 2.2, -13.88);
  // escada para cima (com grade) — afastada da parede para não fechar a passagem até o corredor oeste
  const EX = -3.1;
  for (let i = 0; i < 8; i++) box(2.6, .2, .45, MAT.madeiraEsc, EX, .1 + i * .3, -9.6 - i * .45);
  A.addCollider(EX - 1.4, EX + 1.4, -13.9, -9.3);
  const grade = new THREE.Group(); grade.position.set(EX, 0, -9.2); A.W.grupo.add(grade);
  for (let i = 0; i < 9; i++) cyl(.02, .02, 2.2, MAT.ferrugem, -1.3 + i * .32, 1.1, 0, 6, grade);
  box(2.7, .06, .06, MAT.ferrugem, 0, 2.15, 0, grade); box(.14, .18, .08, MAT.bronze, .2, 1.1, .05, grade);
  interact(grade, () => S.inv.chaves.escada ? '<b>E</b>Subir para os dormitórios' : S.flags.energia ? 'Uma grade com cadeado. A chave fica no quadro da recepção, ali na parede.' : 'Uma grade com cadeado fecha a escada. A chave fica no quadro da recepção, que só funciona com energia.', () => {
    if (!S.inv.chaves.escada) { SFX.trancado(); A.emitNoise(EX, -9, 3); return; }
    if (S.chapter === 2) A.objDone('subir');
    A.fade(true, () => { A.carregarMapa('superior', 'escada'); A.fade(false); }, 500);
  });
  interact(quadro, () => {
    if (S.inv.chaves.escada) return 'Quadro de chaves (aberto)';
    if (!S.flags.energia) return 'Quadro de chaves com teclado. Sem energia: o gerador fica na casa de máquinas.';
    return X.quadroTravado() || '<b>E</b>Digitar o código do quadro';
  }, () => {
    if (S.inv.chaves.escada || !S.flags.energia || X.quadroTravado()) { SFX.trancado(); return; }
    A.abrirTeclado('QUADRO DE CHAVES', S.quadro.join(''), () => {
      X.acertouQuadro(); S.inv.chaves.escada = 'Chave da escada'; SFX.pegar(); A.objDone('chave_escada'); A.falar('chave_escada');
    }, () => X.erroQuadro());
  });
  // casa de máquinas: gerador e alçapão
  const ger = new THREE.Group(); ger.position.set(31.6, 0, -19); A.W.grupo.add(ger);
  box(1.6, 1.1, 1, MAT.metalVerde, 0, .55, 0, ger); const tq = cyl(.3, .3, 1.2, MAT.ferrugem, 0, 1.25, 0, 10, ger); tq.rotation.z = Math.PI / 2;
  cyl(.05, .05, 1.8, MAT.ferrugem, -.6, 2, 0, 6, ger);
  const led = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 6), new THREE.MeshStandardMaterial({ color: 0x300, emissive: 0xff2010, emissiveIntensity: .9 })); led.position.set(.5, .98, .52); ger.add(led);
  A.addCollider(30.8, 32.4, -19.5, -18.5);
  const fusBox = box(.15, .8, .6, MAT.metal, 33.85, 1.5, -22.5);
  const fusNoQuadro = [0, 1, 2].map(i => { const f = MK.fusivel(); f.position.set(33.75, 1.6 - i * .16, -22.5); f.rotation.y = Math.PI / 2; A.W.grupo.add(f); return f; });
  interact(ger, () => {
    if (S.flags.energia) return 'O gerador ronca. Alto demais.';
    if (!S.inv.galao && S.inv.fusiveis < 3) return 'Gerador sem combustível e sem fusíveis. Combustível: despensa, nos fundos da cozinha. Fusíveis: enfermaria.';
    if (!S.inv.galao) return 'Gerador sem combustível. A cozinha tem uma despensa nos fundos.';
    if (S.inv.fusiveis < 3) return `Faltam fusíveis no quadro da parede (${S.inv.fusiveis}/3). A reserva fica na enfermaria.`;
    return '<b>E</b>Ligar o gerador';
  }, () => {
    if (S.flags.energia || !S.inv.galao || S.inv.fusiveis < 3) return;
    X.ligarGerador(); // luzes em cascata, ele aparece no fim do corredor; o capítulo fecha quando você escapa
  });
  interact(fusBox, () => S.flags.energia ? 'Quadro de fusíveis (ligado)' : S.inv.fusiveis >= 3 ? 'Quadro de fusíveis (pronto: falta ligar o gerador)' : 'Quadro de fusíveis vazio (0/3). Etiqueta: "reserva na enfermaria".', () => {});
  const alcapao = box(1.4, .08, 1.4, MAT.madeiraEsc, 27, .04, -23.5);
  box(.1, .04, .5, MAT.ferrugem, 27.4, .1, -23.5, A.W.grupo, false);
  interact(alcapao, () => {
    if (!S.inv.chaves.porao) return 'Um alçapão com cadeado. Leva para baixo, aos túneis.';
    return '<b>E</b>Descer para o porão';
  }, () => {
    if (!S.inv.chaves.porao) { SFX.trancado(); return; }
    if (S.chapter === 3) A.objDone('chave_porao');
    A.fade(true, () => { A.carregarMapa('tuneis', 'entrada'); A.fade(false); }, 500);
  });

  // diretoria: gravador
  ITENS.gravador('f1', spot('diret', 'mesa', 0));
  // primeira página do diário do Davi fica no caminho obrigatório (ao lado da fita)
  ITENS.nota('p1', spot('diret', 'mesa', 1));
  // notas — o canto de cada lembrança é sorteado pela semente da noite, dentro da MESMA sala (sem backtracking)
  ITENS.nota('n2', spot('hall', 'mesa', rj.i('n2')));
  ITENS.nota('n3', spot('cozinha', 'mesa', 2 + rj.i('n3')));
  ITENS.nota('n4', spot('enferm', 'mesa', 1 + rj.i('n4')));
  ITENS.nota('n5', spot('aula', 'mesa', 3 + rj.i('n5')));
  // itens de missão — a prateleira do galão e a maca dos fusíveis mudam a cada noite (decorar o lugar deixa de resolver)
  const itGalao = item('galao', spot('despensa', 'mesa', rj.i('galao')), MK.galao(), 'Pegar galão de gasolina', () => { S.inv.galao = true; A.objDone('galao'); A.falar('galao'); X.galaoPego(); });
  // uma caixa só, com os três fusíveis (nada de caça a três peças)
  const itFus = item('fusiveis', spot('enferm', 'mesa', rj.i('fus')), MK.fusivel(), 'Pegar a caixa de fusíveis reserva', () => { S.inv.fusiveis = 3; A.progresso(); X.fusiveisPegos(); });
  // recursos (poucos de propósito) — também em pontos sorteados, pra não decorar onde reabastecer
  ITENS.pilha('p1', spot('aula', 'mesa', 6 + rj.i('rp1'))); ITENS.pilha('p2', spot('banh', 'mesa', 1 + rj.i('rp2'))); ITENS.pilha('p3', spot('refeit', 'mesa', 3 + rj.i('rp3')));
  ITENS.kit('k1', spot('enferm', 'prateleira', 1 + rj.i('rk1'))); ITENS.kit('k2', spot('cozinha', 'prateleira', 2 + rj.i('rk2')));
  ITENS.garrafa('g1', spot('refeit', 'mesa', rj.i('rg1'))); ITENS.garrafa('g2', spot('cozinha', 'mesa', rj.i('rg2'))); ITENS.garrafa('g3', spot('banh', 'mesa', 2 + rj.i('rg3')));
  // rabiscos
  plano(4, 4, new THREE.MeshStandardMaterial({ map: A.TX.rabisco, transparent: true }), -6.12, 1.6, -17.6, -Math.PI / 2); // longe da porta da copa
  plano(3, 3, new THREE.MeshStandardMaterial({ map: A.TX.rabisco, transparent: true }), 16, 1.5, -25.85);

  // sustos
  gatilho('portaBate', -34, -6, -14, -10, () => A.sustos.portaBate());
  gatilho('lavanderia', 6, 16, -26, -14, () => { SFX.sussurros(2); A.sustos.lencol(); });
  const X = extrasTerreo(A, S, { relogios: [relFachada, relHall], vulto, placa });
  const Y = loreTerreo(A, S, { balanco: bal }); // Lote 2: lugares que contam a história
  const Z = polirTerreo(A, S, { X, ger, led, visor, quadro, grade, EX, fusNoQuadro, alcapao, bal, itens: [itGalao, itFus] }); // Lote 3: polimento e janela da copa
  const SG = segredosTerreo(A, S, {}); // Lote 4: segredos e salas escondidas
  const M5 = monstrosTerreo(A, S, { vulto, EX }); // Lote 5: comportamentos, perseguições e marcas do Inspetor
  const RJ2 = rejogo2Terreo(A, S, {}); // Lote 6 (2ª leva): desafios e segredos da rejogada
  const S7 = somTerreo(A, S, {}); // Lote 7: som e atmosfera do térreo

  return juntar(juntar(juntar(juntar(juntar(juntar(juntar(juntar({
    nome: 'Térreo do internato',
    ruidoMul: () => Z.ruidoMul(),
    spawns: { inicio: { x: 0, z: 13, yaw: 0 }, escada: { x: EX, z: -7.6, yaw: Math.PI }, porao: { x: 27, z: -21.5, yaw: Math.PI } },
    fora: { hemi: .55, moon: .7, fog: .05 }, dentro: { hemi: .08, moon: .04, fog: .1 },
    energia: () => !!S.flags.energia && !S.flags.sg4_apagao, // a chave geral do Lote 4 apaga o prédio de propósito
    inspetor: () => S.done.forcar_porta && (S.timers.insp === undefined || S.timers.insp <= 0),
    procissao: () => S.flags.energia && S.chapter >= 2,
    ana: () => S.chapter >= 3,
    chamado: () => S.chapter >= 2,
    sync() { fusNoQuadro.forEach(f => f.visible = !!S.flags.energia); led.material.emissive.set(S.flags.energia ? 0x20ff40 : 0xff2010); visor.material.emissiveIntensity = S.flags.energia && !S.inv.chaves.escada ? 1.5 : 0; },
    entrar(cap) {
      if (S.flags.energia) SFX.gerador(true, { x: 31.6, y: 1, z: -19 });
      if (cap === 1 && !S.flags.terreoIntro) { S.flags.terreoIntro = true; setTimeout(() => A.falar('terreo_inicio'), 1500); }
      A.agendarEntidades();
      if (S.chapter >= 2 && S.chapter <= 2 && !S.done.procissao) S.timers.procissao = 25;
      A.W.tick.push(dt => { if (S.timers.insp > 0 && S.done.forcar_porta) { S.timers.insp -= dt; if (S.timers.insp <= 0 && !A.M.ativo) { const [ix, iz] = X.pontoDespertar(); A.ativarInspetor(ix, iz); X.despertou(ix, iz); } } });
    },
    inicioCapitulo(cap) {
      if (cap === 2) {
        setTimeout(() => A.falar('badaladas'), 4000); // as nove badaladas tocam no internato.js, junto com as luzes
        S.timers.procissao = 26;
        if (S.fitas.f1) A.objDone('fita_diretor');
      }
    },
    fitaOuvida(id) { if (id === 'f1' && S.chapter >= 2) A.objDone('fita_diretor'); }
  }, X), Y), Z), SG), M5), RJ), RJ2), S7);
}

// =====================================================================
// ANDAR DE CIMA — DORMITÓRIOS (Capítulo III; desce direto aos túneis pelo monta-cargas)
// =====================================================================
function superior(A, S) {
  const { THREE, MAT, box, cyl, prop, plano, item, interact, ITENS, MK, gatilho, SFX, spot } = A;
  const salas = [
    { id: 'patamar', nome: 'Patamar', x0: -5, x1: 5, z0: -2, z1: 6, tipo: 'hall', piso: 'madeira' },
    { id: 'corr', nome: 'Corredor', x0: -3, x1: 3, z0: -58, z1: -2, tipo: 'corredor', piso: 'madeira' },
    { id: 'dormA', nome: 'Dormitório A', x0: -13, x1: -3, z0: -14, z1: -2, tipo: 'dorm' },
    { id: 'dormB', nome: 'Dormitório B', x0: -13, x1: -3, z0: -26, z1: -14, tipo: 'dorm' },
    { id: 'banhS', nome: 'Banheiro', x0: -13, x1: -3, z0: -36, z1: -26, tipo: 'banheiro', piso: 'ladrilho', parede: 'azulejo' },
    { id: 'dormC', nome: 'Dormitório C', x0: -13, x1: -3, z0: -48, z1: -36, tipo: 'dorm' },
    { id: 'celeste', nome: 'Quarto da Irmã Celeste', x0: -13, x1: -3, z0: -58, z1: -48, tipo: 'quarto' },
    { id: 'roup', nome: 'Rouparia', x0: 3, x1: 13, z0: -12, z1: -2, tipo: 'rouparia' },
    { id: 'dormD', nome: 'Dormitório D', x0: 3, x1: 13, z0: -24, z1: -12, tipo: 'dorm' },
    { id: 'brinq', nome: 'Sala de brinquedos', x0: 3, x1: 15, z0: -38, z1: -24, tipo: 'brinquedos' },
    { id: 'dormE', nome: 'Dormitório E', x0: 3, x1: 13, z0: -50, z1: -38, tipo: 'dorm' },
    { id: 'sotao', nome: 'Depósito', x0: 3, x1: 13, z0: -58, z1: -50, tipo: 'deposito', piso: 'concreto' }
  ];
  const P = (id, b, x, z, extra = {}) => ({ id, a: 'corr', b, x, z, eixo: 'z', nome: 'porta', ...extra });
  const portas = [
    { id: 'pat', a: 'patamar', b: 'corr', x: 0, z: -2, eixo: 'x', tipo: 'aberta', largura: 5.6 },
    P('dA', 'dormA', -3, -8, { nome: 'porta do dormitório A' }), P('dB', 'dormB', -3, -20, { nome: 'porta do dormitório B' }), P('bS', 'banhS', -3, -31, { nome: 'porta do banheiro' }),
    P('dC', 'dormC', -3, -42, { nome: 'porta do dormitório C' }),
    P('cel', 'celeste', -3, -53, { nome: 'porta da Irmã Celeste', trava: () => !S.inv.chaves.celeste, msg: () => S.done.ana ? 'Trancada. A menina deixou alguma coisa no chão da sala de brinquedos.' : 'Trancada. Na placa: "Irmã Celeste".', aoAbrir: () => A.objDone('quarto_celeste') }),
    // a rouparia abre para o patamar (a estante tampava a porta do corredor); D e E abrem entre as camas
    { id: 'rp', a: 'patamar', b: 'roup', x: 4, z: -2, eixo: 'x', nome: 'porta da rouparia' }, P('dD', 'dormD', 3, -19.14, { nome: 'porta do dormitório D' }), P('br', 'brinq', 3, -31, { nome: 'porta da sala de brinquedos' }),
    P('dE', 'dormE', 3, -45.14, { nome: 'porta do dormitório E' }), P('so', 'sotao', 3, -54, { nome: 'porta do depósito' })
  ];
  A.construirSalas(salas, portas);
  const RJ = rejogoSuperior(A, S, {}); const rj = RJ._rj; // lote 6: semente da noite, 2ª jogada, recordes e decoração sorteada
  // escada para baixo
  for (let i = 0; i < 6; i++) box(2.6, .1, .45, MAT.madeiraEsc, 0, .05 - i * .02, 4 + i * .3, A.W.grupo, false);
  const desce = box(3, .05, 2, MAT.preto, 0, .02, 5, A.W.grupo, false);
  A.addCollider(-1.5, 1.5, 5.6, 6);
  interact(desce, () => '<b>E</b>Descer para o térreo', () => { A.fade(true, () => { A.carregarMapa('terreo', 'escada'); A.fade(false); }, 500); });
  // quadros e rabiscos
  for (const z of [-14, -26, -38, -50]) box(.04, .7, .9, MAT.madeiraEsc, 2.88, 1.8, z + 2.5);
  plano(3, 3, new THREE.MeshStandardMaterial({ map: A.TX.rabisco, transparent: true }), -2.88, 1.5, -36, Math.PI / 2);
  // caixinha de música
  const pc = spot('brinq', 'mesa', 0);
  const caixa = new THREE.Group(); caixa.position.set(pc.x, pc.y, pc.z); A.W.grupo.add(caixa);
  box(.3, .16, .22, new THREE.MeshStandardMaterial({ color: 0x5a2a1a, roughness: .5, emissive: 0x200a05, emissiveIntensity: .6 }), 0, .08, 0, caixa);
  const bailarina = cyl(.02, .04, .12, MAT.branco, 0, .22, 0, 6, caixa);
  A.W.tick.push(dt => { if (S.done.caixinha) bailarina.rotation.y += dt * 2; });
  const itCaixa = interact(caixa, () => {
    if (S.done.caixinha) return 'A caixinha gira sozinha.';
    if (S.chapter < 3) return 'Uma caixinha de música sem as engrenagens.';
    if (S.inv.engrenagens < 3) return 'Falta uma engrenagem. Risadinhas vêm do Dormitório E, no fundo do corredor.';
    return '<b>E</b>Montar e dar corda na caixinha';
  }, () => {
    if (S.done.caixinha || S.inv.engrenagens < 3 || S.chapter < 3) return;
    SFX.caixinha(pc.x, pc.z); S.flags.cavalinho = true; A.objDone('caixinha'); A.falar('caixinha'); A.emitNoise(pc.x, pc.z, 14);
    setTimeout(() => { A.spawnAna(A.SALA('brinq'), true); A.falar('ana_aparece'); }, 4500);
  });
  itCaixa.hold = 2; itCaixa.pode = () => !S.done.caixinha && S.inv.engrenagens >= 3 && S.chapter >= 3;
  // engrenagens
  // uma engrenagem só, no dormitório do fundo: obriga a atravessar o corredor com ela contando
  const itEng = item('eng0', spot('dormE', 'cama', 2 + rj.i('eng')), MK.engrenagem(), 'Pegar a engrenagem da caixinha', () => { S.inv.engrenagens = 3; A.progresso(); SFX.risada(8, -31); X.engrenagemPega(); }, () => S.chapter >= 3);
  // chave da Celeste (deixada pela menina)
  const itChC = item('chaveCeleste', spot('brinq', 'chao', 2), MK.chave(), 'Pegar a chave da Irmã Celeste', () => { S.inv.chaves.celeste = 'Chave do quarto da Irmã Celeste'; }, () => !!S.done.ana);
  // quarto da Celeste
  ITENS.gravador('f2', spot('celeste', 'mesa', 0));
  ITENS.nota('n8', spot('celeste', 'prateleira', 0));
  const itChP = item('chavePorao', spot('celeste', 'mesa', 1), MK.chave(), 'Pegar a chave do monta-cargas', () => { S.inv.chaves.porao = 'Chave do monta-cargas (porão)'; A.falar('chave_porao'); }, () => !!S.fitas.f2);
  // diário do Davi: as páginas ficam no caminho da história (p1 no térreo, p2 e p3 aqui, p4 nos túneis)
  ITENS.nota('p2', spot('celeste', 'cama', rj.i('p2'))); ITENS.nota('p3', spot('brinq', 'chao', rj.i('p3')));
  // monta-cargas no depósito: desce direto para os túneis (sem voltar ao térreo)
  const poco = new THREE.Group(); poco.position.set(11.6, 0, -56.2); A.W.grupo.add(poco);
  box(1.6, 2.6, .08, MAT.ferrugem, 0, 1.3, -.8, poco, false); box(.08, 2.6, 1.6, MAT.ferrugem, -.8, 1.3, 0, poco, false); box(.08, 2.6, 1.6, MAT.ferrugem, .8, 1.3, 0, poco, false);
  box(1.5, .06, 1.5, MAT.preto, 0, .03, 0, poco, false);
  for (let i = 0; i < 7; i++) cyl(.015, .015, 2.4, MAT.ferrugem, -.66 + i * .22, 1.3, .8, 5, poco);
  box(.14, .18, .08, MAT.bronze, .3, 1.2, .84, poco);
  A.addCollider(10.8, 12.4, -57.6, -55.4);
  const itPoco = interact(poco, () => S.inv.chaves.porao ? '<b>E</b>Descer pelo monta-cargas' : S.chapter < 3 || !S.done.ana ? 'Um monta-cargas antigo. Grade trancada.' : 'Um monta-cargas. A grade tem cadeado: a chave deve estar no quarto da Irmã Celeste.', () => {
    if (!S.inv.chaves.porao) { SFX.trancado(); A.emitNoise(11.6, -55, 4); return; }
    if (S.chapter === 3) A.objDone('chave_porao');
    SFX.cano({ x: 11.6, y: 1.5, z: -56 }); A.P.shake = .15;
    if (M5 && M5.cenaMontaCargas) M5.cenaMontaCargas(900); // Lote 5: a mão do Inspetor desce com a plataforma
    A.fade(true, () => { A.carregarMapa('tuneis', 'entrada'); A.fade(false); }, 900);
  });
  ITENS.nota('n6', spot('brinq', 'mesa', 1 + rj.i('n6'))); ITENS.nota('n7', spot('roup', 'mesa', rj.i('n7')));
  // recursos — pontos sorteados pela semente, dentro da mesma sala (sem backtracking)
  ITENS.pilha('p1', spot('dormC', 'cama', rj.i('rp1'))); ITENS.pilha('p2', spot('sotao', 'mesa', rj.i('rp2'))); ITENS.pilha('p3', spot('roup', 'prateleira', rj.i('rp3')));
  ITENS.kit('k1', spot('banhS', 'mesa', rj.i('rk1'))); ITENS.kit('k2', spot('dormD', 'cama', 3 + rj.i('rk2')));
  ITENS.garrafa('g1', spot('banhS', 'mesa', 2 + rj.i('rg1'))); ITENS.garrafa('g2', spot('sotao', 'mesa', 2 + rj.i('rg2'))); ITENS.garrafa('g3', spot('dormA', 'cama', 3 + rj.i('rg3')));
  // sustos
  gatilho('brinquedo', 3, 15, -38, -24, () => { if (!S.done.caixinha) SFX.risada(12, -36); });
  gatilho('corredorFim', -3, 3, -58, -46, () => { SFX.pancada(8, -54); A.sustos.espiaQuina(); });
  const X = extrasSuperior(A, S, { vulto });
  X.prepararPoco(itPoco);
  const Y = loreSuperior(A, S, {}); // Lote 2: lugares que contam a história
  const Z = polirSuperior(A, S, { X, caixa, itPoco, desce, itEng, itens: [itEng, itChC, itChP] }); // Lote 3: polimento
  const SG = segredosSuperior(A, S, {}); // Lote 4: segredos e salas escondidas
  const M5 = monstrosSuperior(A, S, { vulto }); // Lote 5: rosto na janela, camas que viram, corredor que desaba, monta-cargas
  const RJ2 = rejogo2Superior(A, S, {}); // Lote 6 (2ª leva): desafios e segredos da rejogada
  const S7 = somSuperior(A, S, {}); // Lote 7: som e atmosfera dos dormitórios

  return juntar(juntar(juntar(juntar(juntar(juntar(juntar(juntar({
    nome: 'Andar dos dormitórios',
    ruidoMul: () => Z.ruidoMul(),
    spawns: { escada: { x: 0, z: 3, yaw: 0 }, inicio: { x: 0, z: 3, yaw: 0 } },
    dentro: { hemi: .07, moon: .03, fog: .1 },
    energia: () => !!S.flags.energia,
    inspetor: () => S.chapter >= 3,
    procissao: () => S.flags.energia && S.chapter >= 3,
    ana: () => S.chapter >= 3 && !!S.done.ana,
    chamado: () => S.chapter >= 3,
    anaSalaScript: 'brinq',
    anaFim() { A.objDone('ana'); A.conquista('ana'); A.falar('ana_foi'); A.syncWorld(); },
    entrar(cap) {
      if (cap === 3 && !S.flags.supIntro) { S.flags.supIntro = true; setTimeout(() => A.falar('superior_inicio'), 1200); }
      A.agendarEntidades();
    },
    inicioCapitulo(cap) {
      if (cap === 3 && !S.flags.supIntro) { S.flags.supIntro = true; A.falar('superior_inicio'); }
    },
    fitaOuvida(id) { if (id === 'f2') { A.objDone('fita_celeste'); A.syncWorld(); } }
  }, X), Y), Z), SG), M5), RJ), RJ2), S7);
}

export const MAPAS_INTERNATO = { terreo, superior };
