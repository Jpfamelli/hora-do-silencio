// MAPAS — A Hora do Silêncio v2
// Cada mapa recebe a API do motor (A) e o estado (S) e devolve sua definição:
// { nome, spawns, fora, dentro, energia(), inspetor(), procissao(), ana(), chamado(), entrar(cap), inicioCapitulo(cap), ... }
import { extrasEstrada, memoria, lembrar, SPAWN } from './src/estrada-extra.js';
import { TXT } from './src/estrada-roteiro.js';
import { extrasTerreo, extrasSuperior, juntar } from './src/internato.js';
import * as SUB from './src/subterraneo.js';

// ---------- utilidades compartilhadas entre mapas
function arvores(A, faixas, n = 300) {
  const { THREE, MAT, rand } = A;
  const tronco = new THREE.InstancedMesh(new THREE.CylinderGeometry(.14, .28, 1, 6), MAT.tronco, n);
  const copa = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 7), MAT.arvore, n * 2);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
  let k = 0;
  for (let i = 0; i < n; i++) {
    const f = faixas[i % faixas.length];
    const x = rand(f[0], f[1]), z = rand(f[2], f[3]), h = rand(6, 12);
    m.compose(p.set(x, h / 2, z), q.identity(), s.set(1, h, 1)); tronco.setMatrixAt(i, m);
    for (let j = 0; j < 2; j++) { const r = rand(1.6, 2.8) - j * .5; m.compose(p.set(x, h * .55 + j * 1.8, z), q.identity(), s.set(r, rand(2.6, 3.6), r)); copa.setMatrixAt(k++, m); }
  }
  copa.count = k; tronco.castShadow = copa.castShadow = true;
  A.W.grupo.add(tronco, copa);
}
function arvoreSeca(A, x, z, h = 6) {
  const { cyl, MAT, rand } = A;
  cyl(.18, .34, h, MAT.tronco, x, h / 2, z, 6);
  for (let k = 0; k < 5; k++) { const b = cyl(.04, .1, 2.6, MAT.tronco, x, h * .6 + k * .4, z, 5); b.rotation.z = rand(-1.2, 1.2); b.rotation.x = rand(-.6, .6); }
  A.addCollider(x - .35, x + .35, z - .35, z + .35);
}
function muro(A, x1, z1, x2, z2, h = 2.6, tex = 'pedra') {
  const horiz = z1 === z2, len = horiz ? Math.abs(x2 - x1) : Math.abs(z2 - z1);
  const mat = A.texMat(tex, len / 3, 1);
  const m = horiz ? A.box(len, h, .4, mat, (x1 + x2) / 2, h / 2, z1) : A.box(.4, h, len, mat, x1, h / 2, (z1 + z2) / 2);
  A.W.solid.push(m);
  horiz ? A.addCollider(Math.min(x1, x2), Math.max(x1, x2), z1 - .2, z1 + .2) : A.addCollider(x1 - .2, x1 + .2, Math.min(z1, z2), Math.max(z1, z2));
}
function invisivel(A, x1, z1, x2, z2) { A.addCollider(Math.min(x1, x2) - .15, Math.max(x1, x2) + .15, Math.min(z1, z2) - .15, Math.max(z1, z2) + .15); }
function portao(A, x, z, largura = 4) { // portão de grades duplo (decorativo + colisor)
  const { THREE, MAT, cyl, box } = A;
  const L = new THREE.Group(), R = new THREE.Group(); L.position.set(x - largura / 2, 0, z); R.position.set(x + largura / 2, 0, z); A.W.grupo.add(L, R);
  const n = Math.round(largura / 2 / .23);
  for (let i = 0; i < n; i++) { cyl(.025, .025, 2.9, MAT.ferrugem, .12 + i * .23, 1.45, 0, 6, L); cyl(.025, .025, 2.9, MAT.ferrugem, -.12 - i * .23, 1.45, 0, 6, R); }
  for (const y of [2.6, .4]) { box(largura / 2, .06, .06, MAT.ferrugem, largura / 4, y, 0, L); box(largura / 2, .06, .06, MAT.ferrugem, -largura / 4, y, 0, R); }
  cyl(.3, .3, 3.4, A.texMat('pedra', 1, 1), x - largura / 2 - .3, 1.7, z); cyl(.3, .3, 3.4, A.texMat('pedra', 1, 1), x + largura / 2 + .3, 1.7, z);
  const col = A.addCollider(x - largura / 2, x + largura / 2, z - .2, z + .2);
  const g = { L, R, col, aberto: false, ang: 0, abrir() { g.aberto = true; col.on = false; } };
  A.W.tick.push(dt => { if (g.aberto && g.ang < 1.4) { g.ang = Math.min(1.4, g.ang + dt * 1.2); L.rotation.y = g.ang; R.rotation.y = -g.ang; } });
  return g;
}
function vulto(A) { // silhueta alta para sustos à distância
  const { THREE, box, cyl } = A;
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: 0x060606, roughness: 1 });
  cyl(.2, .35, 1.7, m, 0, 1.7, 0, 8, g); cyl(.05, .04, 1.4, m, -.15, .7, 0, 5, g); cyl(.05, .04, 1.4, m, .15, .7, 0, 5, g);
  const c = new THREE.Mesh(new THREE.SphereGeometry(.15, 10, 8), m); c.scale.set(.8, 1.5, 1); c.position.set(0, 2.85, 0); c.rotation.z = .4; g.add(c);
  for (const s of [-1, 1]) { const b = cyl(.03, .02, 1.8, m, s * .3, 1.7, 0, 5, g); b.rotation.z = s * .08; }
  g.visible = false; A.W.grupo.add(g); return g;
}
function janelasFachada(A, xs, z, y = 1.75, lado = 1) {
  const { box, MAT } = A;
  for (const x of xs) {
    box(1.3, 1.5, .1, MAT.preto, x, y, z + .06 * lado, A.W.grupo, false);
    box(1.5, .1, .22, MAT.madeiraEsc, x, y - .78, z + .1 * lado); box(1.5, .1, .22, MAT.madeiraEsc, x, y + .78, z + .1 * lado);
    box(.07, 1.5, .18, MAT.madeiraEsc, x, y, z + .1 * lado);
  }
}
function placa(A, linhas, x, y, z, w, h, ry = 0, opts) {
  const m = A.plano(w, h, new A.THREE.MeshStandardMaterial({ map: A.textoTex(linhas, opts), roughness: .9 }), x, y, z, ry);
  return m;
}
function noCaixote(A, p) { A.prop(.55, .45, .55, A.MAT.madeiraEsc, p.x, .225, p.z); return { x: p.x, y: .45, z: p.z }; }

// =====================================================================
// PRÓLOGO — A ESTRADA VELHA
// =====================================================================
function estrada(A, S) {
  const { THREE, MAT, box, cyl, prop, plano, piso, item, interact, ITENS, MK, gatilho, SFX } = A;
  const GZ = -60, BZ = GZ - 19; // portão (mais perto do posto que antes) e o prédio, que surge da neblina quando você chega
  const salas = [
    { id: 'estrada', nome: 'Estrada velha', x0: -7, x1: 7, z0: GZ, z1: 82, fora: true, piso: 'asfalto' },
    { id: 'patioPosto', nome: 'Posto Serra', x0: 7, x1: 24, z0: -26, z1: -6, fora: true },
    { id: 'posto', nome: 'Loja do posto', x0: 12, x1: 20, z0: -21, z1: -13, piso: 'ladrilho', parede: 'azulejo', h: 3 }
  ];
  const portas = [{ id: 'posto', a: 'patioPosto', b: 'posto', x: 12, z: -17, eixo: 'z', nome: 'porta da loja' }];
  A.construirSalas(salas, portas);
  piso(-120, 120, -120, 120, 'grama', 4, -.01);
  piso(-4, 4, -72, 82, 'asfalto', 8, .002);
  piso(-7, -4, -72, 82, 'terra', 3, .003); piso(4, 7, -72, 82, 'terra', 3, .003);
  piso(7, 24, -26, -6, 'concreto', 3, .003);
  arvores(A, [[-40, -8, GZ + 2, 90], [8, 40, 2, 90], [8, 40, GZ + 2, -28], [25, 45, -30, 0], [36, 52, -100, GZ], [-52, -36, -100, GZ], [-40, 40, -104, BZ - 7]], 420);
  // limites invisíveis (mato fechado)
  invisivel(A, -7, GZ, -7, 82); invisivel(A, 7, GZ, 7, -26); invisivel(A, 7, -6, 7, 82);
  invisivel(A, 24, -26, 24, -6); invisivel(A, 7, -26, 24, -26); invisivel(A, 7, -6, 24, -6); invisivel(A, -7, 82, 7, 82);
  // muro e portão do internato
  muro(A, -30, GZ, -2.3, GZ, 3); muro(A, 2.3, GZ, 30, GZ, 3);
  const gate = portao(A, 0, GZ, 4);
  box(.14, .18, .06, MAT.bronze, 0, 1.12, GZ + .1);
  placa(A, [{ t: 'INTERNATO SÃO LÁZARO', tam: 40, estilo: 'bold' }, { t: 'propriedade particular · proibida a entrada', tam: 22, estilo: 'italic' }], 6, 2.2, GZ + .25, 3.6, .9, 0);
  // o prédio, logo atrás do muro
  const prd = A.texMat('reboco', 12, 1.2);
  box(70, 8, 10, prd, 0, 4, BZ, A.W.grupo, false);
  box(6, 6, 6, prd, 0, 11, BZ + 4, A.W.grupo, false);
  const torre = new THREE.Mesh(new THREE.ConeGeometry(4.6, 3.6, 4), MAT.telhado); torre.rotation.y = Math.PI / 4; torre.position.set(0, 15.8, BZ + 4); A.W.grupo.add(torre);
  for (let i = -6; i <= 6; i++) for (const y of [2, 5.5]) box(1.4, 1.6, .1, MAT.preto, i * 5, y, BZ + 5.1, A.W.grupo, false);
  const janelaAcesa = box(1.4, 1.6, .1, new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffb060, emissiveIntensity: 0 }), 10, 5.5, BZ + 5.15, A.W.grupo, false);
  A.W.tick.push(() => { janelaAcesa.material.emissiveIntensity = S.flags.janelaApagou || Math.random() < .02 ? 0 : (S.done.chave_portao ? .9 : .25); });

  // árvore caída bloqueando o carro
  const tr = cyl(.45, .55, 11, MAT.tronco, -1.8, .55, 4); tr.rotation.z = Math.PI / 2; tr.rotation.y = .08;
  for (let i = 0; i < 6; i++) { const b = cyl(.05, .12, 2.4, MAT.tronco, -6 + i * 1.6, 1.1, 4 + A.rand(-.5, .5), 5); b.rotation.z = A.rand(-.8, .8); b.rotation.x = A.rand(-.8, .8); }
  A.addCollider(-7, 3.4, 3.4, 4.6);
  // carro
  const carro = new THREE.Group(); carro.position.set(1.6, 0, 9.6); A.W.grupo.add(carro);
  box(1.8, .7, 4.2, MAT.carro, 0, .6, 0, carro); box(1.6, .6, 2.2, MAT.carro, 0, 1.25, .2, carro);
  box(1.62, .5, .05, MAT.vidro, 0, 1.25, -.92, carro);
  for (const [x, z] of [[-.9, 1.3], [.9, 1.3], [-.9, -1.3], [.9, -1.3]]) { const p = cyl(.33, .33, .22, MAT.pneu, x, .33, z, 12, carro); p.rotation.z = Math.PI / 2; }
  const farolMat = new THREE.MeshStandardMaterial({ emissive: 0xffe0a0, emissiveIntensity: 1.4 });
  box(.32, .12, .05, farolMat, -.6, .72, -2.12, carro); box(.32, .12, .05, farolMat, .6, .72, -2.12, carro);
  const farois = [-.6, .6].map(x => { const l = new THREE.SpotLight(0xffe7b0, 40, 30, .45, .5, 1.2); l.position.set(x, .75, -2.1); l.target.position.set(x * 2, 0, -14); carro.add(l, l.target); return l; });
  const portaMalas = box(1.6, .5, .3, MAT.carro, 0, .95, 2.05, carro);
  A.addCollider(.6, 2.6, 7.4, 11.8);
  const farolOn = on => { farois.forEach(l => l.intensity = on ? 40 : 0); farolMat.emissiveIntensity = on ? 1.4 : 0; };
  farolOn(!S.flags.faroisMortos);
  interact(portaMalas, () => S.inv.lanterna ? 'Porta-malas vazio.' : '<b>E</b>Abrir o porta-malas', () => {
    if (S.inv.lanterna) return;
    S.inv.lanterna = true; S.flashOn = true; S.inv.pilhas += 1; SFX.pegar(); SFX.clique(); SFX.rangido(1.6, .9, 11.7, .6);
    A.objDone('lanterna'); A.falar('pegou_lanterna'); A.toast('Lanterna (F) e uma pilha reserva (R).');
  });
  interact(carro.children[0], () => S.flags.perseguicao ? 'Os faróis acenderam sozinhos. A chave nem está no contato.' : 'O motor morreu. E a árvore fecha a estrada.', () => {});

  // posto
  const cobertura = box(4, .2, 10, MAT.metal, 9.6, 4.2, -17, A.W.grupo, false);
  for (const z of [-21.6, -12.4]) cyl(.12, .12, 4.2, MAT.metal, 9.6, 2.1, z);
  for (const z of [-19, -15]) { prop(.5, 1.5, .4, new THREE.MeshStandardMaterial({ color: 0x7a1a12, roughness: .6 }), 9.6, .75, z); }
  const neon = box(3, .06, .1, new THREE.MeshStandardMaterial({ emissive: 0xd8f0ff, emissiveIntensity: 2 }), 9.6, 4.05, -17, A.W.grupo, false);
  const luzNeon = new THREE.PointLight(0xd8f0ff, 6, 14, 1.4); luzNeon.position.set(9.6, 3.8, -17); A.W.grupo.add(luzNeon);
  A.W.tick.push(() => { const on = Math.random() > (S.flags.joaquimSumiu ? .3 : .04); luzNeon.intensity = on ? 6 : .2; neon.material.emissiveIntensity = on ? 2 : .1; });
  cyl(.08, .08, 5, MAT.metal, 7.6, 2.5, -7.5); placa(A, [{ t: 'POSTO SERRA', tam: 54, estilo: 'bold' }, { t: 'aberto 24h', tam: 26, estilo: 'italic' }], 7.6, 5.2, -7.5, 2.4, 1.2, Math.PI / 2, { fundo: '#1a2a20', cor: '#c9d8b0' });
  janelasFachada(A, [14.2, 17.8], -13, 1.6, 1);
  // orelhão (o toque e a interação ficam em src/estrada-extra.js)
  const orelhao = new THREE.Group(); orelhao.position.set(8.4, 0, -8.4); A.W.grupo.add(orelhao);
  cyl(.06, .06, 2, MAT.metal, 0, 1, 0, 6, orelhao);
  const conc = new THREE.Mesh(new THREE.SphereGeometry(.55, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc8a020, roughness: .6, side: THREE.DoubleSide })); conc.position.y = 2.3; conc.rotation.x = Math.PI; conc.scale.y = .9; orelhao.add(conc);
  box(.2, .35, .12, MAT.metal, 0, 1.6, .08, orelhao);

  // dentro da loja: balcão, prateleiras, o velho
  prop(.6, 1, 5, MAT.madeiraEsc, 16.4, .5, -17);
  box(.7, .05, 5.1, MAT.madeira, 16.4, 1.02, -17);
  A.estante(19.7, -17, 'z', 3, A.W.spots.posto.prateleira, -1);
  A.estante(16, -20.7, 'x', 3.4, A.W.spots.posto.prateleira, 1);
  const lp = A.lampada(16, -17, 3, 7, 0xffd9a0, 3.5);
  const radio = box(.4, .25, .2, MAT.madeiraEsc, 16.4, 1.17, -15.4);
  const joaquim = new THREE.Group(); joaquim.position.set(18.2, 0, -17.2); joaquim.rotation.y = -Math.PI / 2; A.W.grupo.add(joaquim);
  const cadeira = new THREE.Group(); joaquim.add(cadeira);
  box(.5, .06, .5, MAT.madeiraEsc, 0, .48, 0, cadeira); box(.5, .7, .06, MAT.madeiraEsc, 0, .85, -.24, cadeira);
  for (const [x, z] of [[-.22, -.22], [.22, -.22], [-.22, .22], [.22, .22]]) box(.04, .48, .04, MAT.madeiraEsc, x, .24, z, cadeira);
  const velho = new THREE.Group(); joaquim.add(velho);
  const roupa = new THREE.MeshStandardMaterial({ color: 0x3a3428, roughness: 1 }), pele = new THREE.MeshStandardMaterial({ color: 0x8a6e58, roughness: .7 });
  box(.42, .6, .3, roupa, 0, .85, -.05, velho); box(.4, .14, .45, roupa, 0, .55, .12, velho);
  for (const s of [-1, 1]) { box(.13, .45, .13, roupa, s * .11, .28, .32, velho); box(.1, .4, .1, roupa, s * .26, .8, .05, velho); }
  const cab = new THREE.Mesh(new THREE.SphereGeometry(.13, 12, 10), pele); cab.position.set(0, 1.3, 0); velho.add(cab);
  cyl(.24, .24, .03, roupa, 0, 1.42, 0, 14, velho); cyl(.13, .14, .12, roupa, 0, 1.49, 0, 14, velho);
  addColliderSafe(A, 17.8, 18.6, -17.6, -16.8);
  const v = vulto(A);
  const ex = extrasEstrada(A, S, { GZ, carro, farolOn, portaMalas, orelhao, joaquim, velho, lp, janela: janelaAcesa, v, novoVulto: () => vulto(A) });
  const sumir = inst => { velho.visible = false; ex.sumir(inst); A.W.tick.push(() => { cadeira.rotation.x = Math.sin(A.perf() * 2) * .06; }); };
  if (S.flags.joaquimSumiu) sumir(true);
  interact(velho, () => S.done.posto ? '<b>E</b>Falar com Seu Joaquim' : '<b>E</b>Falar com o velho', () => {
    if (S.done.posto) { A.dialogo([{ quem: 'joaquim', texto: 'A chave tá no prego. Atrás de você. E não corre lá dentro.' }]); return; }
    const linhas = memoria().joaquim ? TXT.joaquimCurto : A.R.dialogos.joaquim;
    A.dialogo(linhas, () => { lembrar('joaquim'); S.flags.regras = true; A.objDone('posto'); A.lerNota('regras'); A.toast('As regras ficam no diário (TAB).'); });
  });
  interact(radio, () => S.flags.joaquimSumiu ? '<b>E</b>Ouvir o rádio de novo' : 'Um rádio velho, desligado.', () => { if (S.flags.joaquimSumiu) A.tocarFita('f5'); });
  ITENS.nota('n1', { x: 13.6, y: 1.6, z: -13.12 }, true).obj.rotation.y = Math.PI;
  const chave = MK.chave(); chave.rotation.z = Math.PI / 2; chave.rotation.y = Math.PI / 2;
  item('chave_portao', { x: 12.14, y: 1.5, z: -19.4 }, chave, () => S.done.posto ? '<b>E</b>Pegar a chave do portão' : 'Uma chave pendurada num prego.', () => {
    S.inv.chaves.portao = 'Chave do portão'; A.objDone('chave_portao');
    setTimeout(() => {
      if (A.S !== S || S.flags.joaquimSumiu) return;
      S.flags.joaquimSumiu = true; sumir(); SFX.estatica(1.4, { x: 16.4, y: 1.2, z: -15.4 }); A.falar('joaquim_sumiu');
      setTimeout(() => { if (A.S === S && S.mapa === 'estrada') A.tocarFita('f5'); }, 6500);
      if (A.mode === 'jogo') A.salvarCheckpoint();
    }, 900);
  }, () => true).pode = () => S.done.posto;
  // a chave só pode ser pega depois da conversa
  const itChave = A.W.items[A.W.items.length - 1].it; const actOrig = itChave.act; itChave.act = () => { if (S.done.posto) actOrig(); else A.toast('Melhor falar com ele primeiro.'); };
  ITENS.pilha('pilha_posto', A.spot('posto', 'prateleira', 1));
  ITENS.garrafa('garrafa_posto', { x: 16.3, y: 1.05, z: -18.8 });
  ITENS.kit('kit_posto', A.spot('posto', 'prateleira', 4));

  // sustos da estrada: o vulto (espreita, relâmpago e perseguição) mora em src/estrada-extra.js
  gatilho('risada', -7, 7, GZ + 10, GZ + 18, () => SFX.risada(-12, GZ + 14));

  // cadeado: segure E por 2 s (com o vulto vindo pela estrada)
  const itGate = interact(gate.L, () => {
    if (S.done.abrir_portao) return 'O portão está aberto.';
    if (!S.inv.chaves.portao) return 'Portão trancado com cadeado.';
    return '<b>E</b>Abrir o cadeado';
  }, () => {
    if (!S.inv.chaves.portao) { SFX.trancado(); return; }
    if (S.done.abrir_portao) return;
    SFX.trancado(); gate.abrir(); A.falar('portao'); A.objDone('abrir_portao');
  });
  Object.defineProperty(itGate, 'hold', { get: () => (S.inv.chaves.portao && !S.done.abrir_portao ? 2 : 0) });
  itGate.som = 'trancado';

  return {
    nome: 'A Estrada Velha',
    spawns: { titulo: { x: 0, z: GZ + 24, yaw: 0 }, carro: { x: 1.6, z: 9.6, yaw: 0 }, inicio: { x: SPAWN.x, z: SPAWN.z, yaw: SPAWN.yaw } },
    fora: { hemi: .55, moon: .75, fog: .055 }, dentro: { hemi: .12, moon: .05, fog: .08 },
    energia: () => !S.flags.luzPostoMorta,
    inicioCapitulo(cap) { if (cap === 1) A.carregarMapa('terreo', 'inicio'); },
    cena: ex.cena
  };
}
function addColliderSafe(A, x0, x1, z0, z1) { A.addCollider(x0, x1, z0, z1); }

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
    { id: 'maq', nome: 'Casa de máquinas', x0: 24, x1: 34, z0: -26, z1: -14, tipo: 'maquinas', piso: 'concreto', parede: 'tijolo' }
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
    { id: 'maq', a: 'ce', b: 'maq', x: 29, z: -14, eixo: 'x', nome: 'porta da casa de máquinas' }
  ];
  A.construirSalas(salas, portas);
  piso(-60, 60, -60, 60, 'grama', 4, -.01);
  piso(-14, 14, 0, 16, 'terra', 3, .002);
  // pátio fechado
  muro(A, -14, 0, -14, 16); muro(A, 14, 0, 14, 16); muro(A, -14, 16, -2.3, 16); muro(A, 2.3, 16, 14, 16);
  portao(A, 0, 16, 4);
  arvoreSeca(A, -9, 9); arvoreSeca(A, 10, 11, 5);
  box(.08, 2.6, .08, MAT.ferrugem, 5, 1.3, 6); box(.08, 2.6, .08, MAT.ferrugem, 8, 1.3, 6); box(3.1, .08, .08, MAT.ferrugem, 6.5, 2.6, 6);
  const bal = new THREE.Group(); bal.position.set(6.5, 2.6, 6); A.W.grupo.add(bal);
  box(.01, 2.1, .01, MAT.metal, -.35, -1.05, 0, bal); box(.01, 2.1, .01, MAT.metal, .35, -1.05, 0, bal); box(.8, .05, .3, MAT.madeiraEsc, 0, -2.1, 0, bal);
  A.W.tick.push(() => { bal.rotation.x = Math.sin(A.perf() * .8) * .25; });
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
  interact(grade, () => S.inv.chaves.escada ? '<b>E</b>Subir para os dormitórios' : S.flags.energia ? 'Uma grade com cadeado. A chave fica no quadro da recepção, ali na parede.' : 'Uma grade com cadeado fecha a escada.', () => {
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
    if (!S.inv.galao) return 'Gerador sem combustível. A cozinha tem uma despensa nos fundos.';
    if (S.inv.fusiveis < 3) return `Faltam fusíveis no quadro da parede (${S.inv.fusiveis}/3).`;
    return '<b>E</b>Ligar o gerador';
  }, () => {
    if (S.flags.energia || !S.inv.galao || S.inv.fusiveis < 3) return;
    X.ligarGerador(); // luzes em cascata, ele aparece no fim do corredor; o capítulo fecha quando você escapa
  });
  interact(fusBox, () => S.flags.energia ? 'Quadro de fusíveis' : S.inv.fusiveis >= 3 ? 'Quadro de fusíveis (pronto)' : 'Quadro de fusíveis vazio. Etiqueta: "reserva na enfermaria".', () => {});
  const alcapao = box(1.4, .08, 1.4, MAT.madeiraEsc, 27, .04, -23.5);
  box(.1, .04, .5, MAT.ferrugem, 27.4, .1, -23.5, A.W.grupo, false);
  interact(alcapao, () => {
    if (!S.inv.chaves.porao) return 'Um alçapão com cadeado. Leva para baixo.';
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
  // notas
  ITENS.nota('n2', spot('hall', 'mesa', 0));
  ITENS.nota('n3', spot('cozinha', 'mesa', 2));
  ITENS.nota('n4', spot('enferm', 'mesa', 1));
  ITENS.nota('n5', spot('aula', 'mesa', 3));
  // itens de missão
  item('galao', spot('despensa', 'mesa', 1), MK.galao(), 'Pegar galão de gasolina', () => { S.inv.galao = true; A.objDone('galao'); A.falar('galao'); X.galaoPego(); });
  // uma caixa só, com os três fusíveis (nada de caça a três peças)
  item('fusiveis', spot('enferm', 'mesa', 0), MK.fusivel(), 'Pegar a caixa de fusíveis reserva', () => { S.inv.fusiveis = 3; A.progresso(); X.fusiveisPegos(); });
  // recursos (poucos de propósito)
  ITENS.pilha('p1', spot('aula', 'mesa', 6)); ITENS.pilha('p2', spot('banh', 'mesa', 1)); ITENS.pilha('p3', spot('refeit', 'mesa', 3));
  ITENS.kit('k1', spot('enferm', 'prateleira', 1)); ITENS.kit('k2', spot('cozinha', 'prateleira', 2));
  ITENS.garrafa('g1', spot('refeit', 'mesa', 0)); ITENS.garrafa('g2', spot('cozinha', 'mesa', 0)); ITENS.garrafa('g3', spot('banh', 'mesa', 2));
  // rabiscos
  plano(4, 4, new THREE.MeshStandardMaterial({ map: A.TX.rabisco, transparent: true }), -6.12, 1.6, -22, -Math.PI / 2);
  plano(3, 3, new THREE.MeshStandardMaterial({ map: A.TX.rabisco, transparent: true }), 16, 1.5, -25.85);

  // sustos
  gatilho('portaBate', -34, -6, -14, -10, () => A.sustos.portaBate());
  gatilho('lavanderia', 6, 16, -26, -14, () => { SFX.sussurros(2); A.sustos.lencol(); });
  const X = extrasTerreo(A, S, { relogios: [relFachada, relHall], vulto, placa });

  return juntar({
    nome: 'Térreo do internato',
    spawns: { inicio: { x: 0, z: 13, yaw: 0 }, escada: { x: EX, z: -7.6, yaw: Math.PI }, porao: { x: 27, z: -21.5, yaw: Math.PI } },
    fora: { hemi: .55, moon: .7, fog: .05 }, dentro: { hemi: .08, moon: .04, fog: .1 },
    energia: () => !!S.flags.energia,
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
  }, X);
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
  item('eng0', spot('dormE', 'cama', 2), MK.engrenagem(), 'Pegar a engrenagem da caixinha', () => { S.inv.engrenagens = 3; A.progresso(); SFX.risada(8, -31); X.engrenagemPega(); }, () => S.chapter >= 3);
  // chave da Celeste (deixada pela menina)
  item('chaveCeleste', spot('brinq', 'chao', 2), MK.chave(), 'Pegar a chave da Irmã Celeste', () => { S.inv.chaves.celeste = 'Chave do quarto da Irmã Celeste'; }, () => !!S.done.ana);
  // quarto da Celeste
  ITENS.gravador('f2', spot('celeste', 'mesa', 0));
  ITENS.nota('n8', spot('celeste', 'prateleira', 0));
  item('chavePorao', spot('celeste', 'mesa', 1), MK.chave(), 'Pegar a chave do monta-cargas', () => { S.inv.chaves.porao = 'Chave do monta-cargas (porão)'; A.falar('chave_porao'); }, () => !!S.fitas.f2);
  // diário do Davi: as páginas ficam no caminho da história (p1 no térreo, p2 e p3 aqui, p4 nos túneis)
  ITENS.nota('p2', spot('celeste', 'cama', 0)); ITENS.nota('p3', spot('brinq', 'chao', 0));
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
    A.fade(true, () => { A.carregarMapa('tuneis', 'entrada'); A.fade(false); }, 900);
  });
  ITENS.nota('n6', spot('brinq', 'mesa', 1)); ITENS.nota('n7', spot('roup', 'mesa', 0));
  // recursos
  ITENS.pilha('p1', spot('dormC', 'cama', 0)); ITENS.pilha('p2', spot('sotao', 'mesa', 0)); ITENS.pilha('p3', spot('roup', 'prateleira', 0));
  ITENS.kit('k1', spot('banhS', 'mesa', 0)); ITENS.kit('k2', spot('dormD', 'cama', 3));
  ITENS.garrafa('g1', spot('banhS', 'mesa', 2)); ITENS.garrafa('g2', spot('sotao', 'mesa', 2)); ITENS.garrafa('g3', spot('dormA', 'cama', 3));
  // sustos
  gatilho('brinquedo', 3, 15, -38, -24, () => { if (!S.done.caixinha) SFX.risada(12, -36); });
  gatilho('corredorFim', -3, 3, -58, -46, () => { SFX.pancada(8, -54); A.sustos.espiaQuina(); });
  const X = extrasSuperior(A, S, { vulto });
  X.prepararPoco(itPoco);

  return juntar({
    nome: 'Andar dos dormitórios',
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
  }, X);
}

// =====================================================================
// TÚNEIS ALAGADOS (Capítulo IV)
// =====================================================================
function tuneis(A, S) {
  const { THREE, MAT, box, cyl, prop, plano, item, interact, ITENS, MK, gatilho, SFX, spot } = A;
  const som = SUB.sons(A), O = SUB.ondas(A), B = SUB.bolhas(A), mao = SUB.maoPalida(A);
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
    { id: 'dep', nome: 'Depósito', x0: -32, x1: -24, z0: -42, z1: -30, tipo: 'deposito', piso: 'concreto', parede: 'tijolo', h: 2.8 }
  ];
  const ab = (id, a, b, x, z, eixo) => ({ id, a, b, x, z, eixo, tipo: 'aberta', largura: 3.6, alto: 2.6 });
  const portas = [
    ab('e1', 'entrada', 't1', 0, -6, 'x'), ab('12', 't1', 't2', -2, -18, 'z'), ab('13', 't1', 't3', 2, -18, 'z'),
    ab('2v', 't2', 'v1', -26, -18, 'z'), ab('3v', 't3', 'v2', 26, -18, 'z'), ab('1h', 't1', 'hub', 0, -30, 'x'),
    ab('h4', 'hub', 't4', 0, -42, 'x'), ab('h5', 'hub', 't5', 6, -36, 'z'), ab('5s', 't5', 'saida', 24, -36, 'z'), ab('h6', 'hub', 't6', -6, -36, 'z'),
    { id: 'sec', a: 't4', b: 'secreta', x: 0, z: -54, eixo: 'x', nome: 'porta de ferro', trava: () => !S.flags.aguaBaixa, msg: 'Debaixo d\'água. Não abre com esse peso.' },
    { id: 'dep', a: 't6', b: 'dep', x: -24, z: -36, eixo: 'z', nome: 'porta do depósito' }
  ];
  A.construirSalas(salas, portas);
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
    A.plano(.35, .35, new THREE.MeshStandardMaterial({ map: A.textoTex([{ t: String(v.n), tam: 110, estilo: 'bold', y: 80 }], { w: 128, h: 128, fundo: '#2a2018', cor: '#c9a75a', manchas: 2 }), emissive: 0x201408, emissiveIntensity: .6 }), 0, .62, .02, 0, g);
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
        if (erros === 2) setTimeout(() => { if (A.W.mapa === 'tuneis' && !S.flags.aguaBaixa) A.sub('lia', A.codTxt(S.fitas.f2 ? 'Calma. A Irmã Celeste disse a ordem na fita: {v}. Tá no diário.' : 'Tem uma ordem. Alguém deve ter anotado em algum lugar.')); }, 2600);
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
    valvIts.push({ it, giro, pos, rangT: 0 });
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
  cyl(.08, .08, .05, MAT.bronze, .55, .15, .05, 12, cp).rotation.x = Math.PI / 2;
  if (S.flags.cofre) cp.rotation.y = -1.7;
  A.addCollider(6.95, 7.85, -60.45, -59.55);
  let fuga = null, f4ok = !!S.fitas.f4;
  const iniciarFugaCofre = (recarga) => { fuga = { t: recarga ? 1.1 : 0, recarga, apagou: false, veio: false }; };
  interact(cofre, () => S.flags.cofre ? 'Cofre aberto e vazio.' : A.R.paginas.every(p => S.notes[p.id]) ? '<b>E</b>Usar o cofre' : `<b>E</b>Usar o cofre (números do Davi: ${A.R.paginas.filter(p => S.notes[p.id]).length}/4)`, () => {
    if (S.flags.cofre) return;
    A.abrirTeclado('COFRE DO DIRETOR', S.code.join(''), () => {
      S.flags.cofre = true; S.inv.pa = true; S.inv.chaves.capela = 'Chave da capela'; S.inv.garrafas++; cp.rotation.y = -1.7;
      SFX.pancada(7, -60); A.objDone('cofre');
      A.salvarCheckpoint(); // morrer na fuga volta para logo depois do cofre
      // a gaveta da mesa abre sozinha (src/sustos.js) e só então ele acorda
      A.sustos.cofre(() => { A.falar('cofre'); setTimeout(() => A.toast('No fundo do cofre, uma garrafa de vidro. G para jogar.'), 2500); });
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
  let parT = 0, maoFase = 0, maoVezes = 0, ambT = A.rand(16, 28), ambBolhas = null, lento = 0, passoAcc = 0, monAcc = 0, monY = 0, bolhaT = 0, dicaAgua = false;
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
    if (naAgua && !dicaAgua && S.chapter === 4) { dicaAgua = true; setTimeout(() => { if (A.W.mapa === 'tuneis' && !S.flags.aguaBaixa) A.toast('Agachada (C) na água funda, você afunda: ele não te ouve, mas o ar acaba.'); }, 6000); }
    // afundar: agachada na água alta
    if (sub.cd > 0) sub.cd -= dt;
    const quer = naAgua && alta && P.crouch && !P.sprinting && sub.cd <= 0;
    if (quer && S.stamina > 2) {
      if (!sub.on) { sub.on = true; som.bolhas(null, 6, .3); O.criar(P.pos.x, nivel, P.pos.z, 1.4, .4, 1.4); }
      S.stamina = Math.max(0, S.stamina - (mov > .001 ? 28 : 24) * dt);
      if (S.stamina <= 2) {
        sub.on = false; sub.cd = 2.5; P.crouch = false; som.ofegoAgua(); SFX.ofego(); A.emitNoise(P.pos.x, P.pos.z, 8, true);
        O.criar(P.pos.x, nivel, P.pos.z, 2.2, .5, 1.6); A.toast('Sem ar! Você subiu puxando o fôlego, alto.');
      }
    } else if (sub.on) { sub.on = false; som.bolhas(null, 4, .2); O.criar(P.pos.x, nivel, P.pos.z, 1.2, .35, 1.2); }
    telaAgua.style.opacity = sub.on ? .92 : 0;
    telaFolego.style.opacity = sub.on ? 1 : 0; barraFolego.style.width = S.stamina + '%';
    if (sub.on) {
      A.camera.position.y = nivel - .12;
      A.flash.intensity *= Math.random() < .12 ? 0 : .3;
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
      if (dM < 8 && !sub.on && Math.random() < (8 - dM) / 8 * .35) A.flash.intensity = 0;
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
      if (fuga.pisca > 0) { fuga.pisca -= dt; if (Math.random() < .6) A.flash.intensity = 0; }
      if (fuga.t > 2.6 && !fuga.veio) {
        fuga.veio = true;
        if (!M.ativo) A.ativarInspetor(0, -46.5, 'investiga'); else { M.pos.set(0, 0, -46.5); M.state = 'investiga'; M.path = []; M.wait = 0; }
        M.cool = 1.5; M.searchT = 0; M.furia = 0; M.recuo = 0; A.planejar(M, 6, -60);
        SFX.pancada(0, -54); setTimeout(() => SFX.pancada(0, -50), 700);
        A.toast('Ele está vindo pela única saída. Armário, garrafa (G) ou passar agachada por ele.');
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

  return {
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
  };
}

// =====================================================================
// CEMITÉRIO E CAPELA (Capítulo V — final)
// =====================================================================
function cemiterio(A, S) {
  const { THREE, MAT, box, cyl, prop, plano, piso, item, interact, ITENS, MK, gatilho, SFX, spot, rand } = A;
  const som = SUB.sons(A), maoTerra = SUB.maoPalida(A);
  const salas = [
    { id: 'cem', nome: 'Cemitério das irmãs', x0: -30, x1: 30, z0: -48, z1: 12, fora: true },
    { id: 'capela', nome: 'Capela', x0: -8, x1: 8, z0: -70, z1: -48, piso: 'pedra', parede: 'pedra', h: 6 }
  ];
  const portas = [{ id: 'cap', a: 'cem', b: 'capela', x: 0, z: -48, eixo: 'x', nome: 'porta da capela', largura: 2,
    trava: () => !S.inv.chaves.capela || Object.keys(S.tumulos).length < 3, msg: () => !S.inv.chaves.capela ? 'Trancada.' : 'Ainda não. Faltam as coisas deles.' }];
  A.construirSalas(salas, portas);
  piso(-80, 80, -110, 80, 'grama', 4, -.01);
  piso(-30, 30, -48, 12, 'terra', 4, .002);
  piso(-1.5, 1.5, -48, 12, 'pedra', 2, .004);
  arvores(A, [[-60, -32, -100, 40], [32, 60, -100, 40], [-30, 30, 14, 50], [-30, -9, -100, -50], [9, 30, -100, -50]], 260);
  muro(A, -30, -48, -30, 12, 2.2); muro(A, 30, -48, 30, 12, 2.2); muro(A, -30, 12, -2.3, 12, 2.2); muro(A, 2.3, 12, 30, 12, 2.2);
  muro(A, -30, -48, -8, -48, 2.2); muro(A, 8, -48, 30, -48, 2.2);
  const fundos = portao(A, 0, 12, 4);
  for (const [x, z, h] of [[-20, -10, 7], [18, -30, 6], [-14, -38, 5], [22, 2, 6], [-24, 4, 5]]) arvoreSeca(A, x, z, h);
  // neblina rasteira que corre entre as covas
  SUB.neblina(A, -30, 30, -48, 12, .28, .26);
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
  for (let n = 0; k < cel.length && n < 60; k++, n++) {
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
  for (let i = 0; i < 5; i++) for (const x of [-4, 4]) { prop(5, .5, .5, MAT.madeiraEsc, x, .25, -51 - i * 2); box(5, .6, .08, MAT.madeiraEsc, x, .7, -50.75 - i * 2); }
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
  return def;
}

export const MAPAS = { estrada, terreo, superior, tuneis, cemiterio };
