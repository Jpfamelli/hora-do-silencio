// MAPAS — A Hora do Silêncio v2
// Cada mapa recebe a API do motor (A) e o estado (S) e devolve sua definição:
// { nome, spawns, fora, dentro, energia(), inspetor(), procissao(), ana(), chamado(), entrar(cap), inicioCapitulo(cap), ... }

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
  const salas = [
    { id: 'estrada', nome: 'Estrada velha', x0: -7, x1: 7, z0: -72, z1: 82, fora: true, piso: 'asfalto' },
    { id: 'patioPosto', nome: 'Posto Serra', x0: 7, x1: 24, z0: -26, z1: -6, fora: true },
    { id: 'posto', nome: 'Loja do posto', x0: 12, x1: 20, z0: -21, z1: -13, piso: 'ladrilho', parede: 'azulejo', h: 3 }
  ];
  const portas = [{ id: 'posto', a: 'patioPosto', b: 'posto', x: 12, z: -17, eixo: 'z', nome: 'porta da loja' }];
  A.construirSalas(salas, portas);
  piso(-120, 120, -120, 120, 'grama', 4, -.01);
  piso(-4, 4, -72, 82, 'asfalto', 8, .002);
  piso(-7, -4, -72, 82, 'terra', 3, .003); piso(4, 7, -72, 82, 'terra', 3, .003);
  piso(7, 24, -26, -6, 'concreto', 3, .003);
  arvores(A, [[-40, -8, -80, 90], [8, 40, 2, 90], [8, 40, -90, -28], [25, 45, -30, 0]], 380);
  // limites invisíveis (mato fechado)
  invisivel(A, -7, -72, -7, 82); invisivel(A, 7, -72, 7, -26); invisivel(A, 7, -6, 7, 82);
  invisivel(A, 24, -26, 24, -6); invisivel(A, 7, -26, 24, -26); invisivel(A, 7, -6, 24, -6); invisivel(A, -7, 82, 7, 82);
  // muro e portão do internato
  muro(A, -30, -72, -2.3, -72, 3); muro(A, 2.3, -72, 30, -72, 3);
  const gate = portao(A, 0, -72, 4);
  box(.14, .18, .06, MAT.bronze, 0, 1.12, -71.9);
  placa(A, [{ t: 'INTERNATO SÃO LÁZARO', tam: 40, estilo: 'bold' }, { t: 'propriedade particular · proibida a entrada', tam: 22, estilo: 'italic' }], 6, 2.2, -71.75, 3.6, .9, 0);
  // o prédio ao longe
  const prd = A.texMat('reboco', 12, 1.2);
  box(70, 8, 10, prd, 0, 4, -100, A.W.grupo, false);
  box(6, 6, 6, prd, 0, 11, -96, A.W.grupo, false);
  const torre = new THREE.Mesh(new THREE.ConeGeometry(4.6, 3.6, 4), MAT.telhado); torre.rotation.y = Math.PI / 4; torre.position.set(0, 15.8, -96); A.W.grupo.add(torre);
  for (let i = -6; i <= 6; i++) for (const y of [2, 5.5]) box(1.4, 1.6, .1, MAT.preto, i * 5, y, -94.9, A.W.grupo, false);
  const janelaAcesa = box(1.4, 1.6, .1, new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffb060, emissiveIntensity: 0 }), 10, 5.5, -94.85, A.W.grupo, false);
  A.W.tick.push(() => { janelaAcesa.material.emissiveIntensity = Math.random() < .02 ? 0 : (S.done.chave_portao ? .9 : .25); });

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
    S.inv.lanterna = true; S.flashOn = true; S.inv.pilhas += 1; SFX.pegar(); SFX.clique();
    A.objDone('lanterna'); A.falar('pegou_lanterna'); A.toast('Lanterna (F) e uma pilha reserva (R).');
  });
  interact(carro.children[0], () => 'Não vai passar por essa árvore.', () => {});

  // posto
  const cobertura = box(4, .2, 10, MAT.metal, 9.6, 4.2, -17, A.W.grupo, false);
  for (const z of [-21.6, -12.4]) cyl(.12, .12, 4.2, MAT.metal, 9.6, 2.1, z);
  for (const z of [-19, -15]) { prop(.5, 1.5, .4, new THREE.MeshStandardMaterial({ color: 0x7a1a12, roughness: .6 }), 9.6, .75, z); }
  const neon = box(3, .06, .1, new THREE.MeshStandardMaterial({ emissive: 0xd8f0ff, emissiveIntensity: 2 }), 9.6, 4.05, -17, A.W.grupo, false);
  const luzNeon = new THREE.PointLight(0xd8f0ff, 6, 14, 1.4); luzNeon.position.set(9.6, 3.8, -17); A.W.grupo.add(luzNeon);
  A.W.tick.push(() => { const on = Math.random() > .04; luzNeon.intensity = on ? 6 : .2; neon.material.emissiveIntensity = on ? 2 : .1; });
  cyl(.08, .08, 5, MAT.metal, 7.6, 2.5, -7.5); placa(A, [{ t: 'POSTO SERRA', tam: 54, estilo: 'bold' }, { t: 'aberto 24h', tam: 26, estilo: 'italic' }], 7.6, 5.2, -7.5, 2.4, 1.2, Math.PI / 2, { fundo: '#1a2a20', cor: '#c9d8b0' });
  janelasFachada(A, [14.2, 17.8], -13, 1.6, 1);
  // orelhão
  const orelhao = new THREE.Group(); orelhao.position.set(8.4, 0, -8.4); A.W.grupo.add(orelhao);
  cyl(.06, .06, 2, MAT.metal, 0, 1, 0, 6, orelhao);
  const conc = new THREE.Mesh(new THREE.SphereGeometry(.55, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc8a020, roughness: .6, side: THREE.DoubleSide })); conc.position.y = 2.3; conc.rotation.x = Math.PI; conc.scale.y = .9; orelhao.add(conc);
  box(.2, .35, .12, MAT.metal, 0, 1.6, .08, orelhao);
  interact(orelhao, () => S.flags.orelhaoTocou && !S.flags.atendeu ? '<b>E</b>Atender o orelhão' : 'Orelhão.', () => {
    if (!S.flags.orelhaoTocou || S.flags.atendeu) return;
    S.flags.atendeu = true; SFX.clique(); A.sub('davi', '(respiração) ...Lia? Não corre lá dentro. Ele escuta.', true);
  });
  gatilho('orelhao', -7, 7, -14, -2, () => { S.flags.orelhaoTocou = true; SFX.orelhao({ x: 8.4, y: 1.6, z: -8.4 }); });

  // dentro da loja: balcão, prateleiras, o velho
  prop(.6, 1, 5, MAT.madeiraEsc, 16.4, .5, -17);
  box(.7, .05, 5.1, MAT.madeira, 16.4, 1.02, -17);
  A.estante(19.7, -17, 'z', 3, A.W.spots.posto.prateleira, -1);
  A.estante(16, -20.7, 'x', 3.4, A.W.spots.posto.prateleira, 1);
  const lp = A.lampada(16, -17, 3, 7, 0xffd9a0, 3.5); lp.sempre = true;
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
  const sumir = () => { velho.visible = false; A.W.tick.push(() => { cadeira.rotation.x = Math.sin(A.perf() * 2) * .06; }); };
  if (S.flags.joaquimSumiu) sumir();
  interact(velho, () => S.done.posto ? '<b>E</b>Falar com Seu Joaquim' : '<b>E</b>Falar com o velho', () => {
    if (S.done.posto) { A.dialogo([{ quem: 'joaquim', texto: 'A chave tá no prego. Atrás de você. E não corre lá dentro.' }]); return; }
    A.dialogo(A.R.dialogos.joaquim, () => { S.flags.regras = true; A.objDone('posto'); A.lerNota('regras'); A.toast('As regras ficam no diário (TAB).'); });
  });
  interact(radio, () => S.flags.joaquimSumiu ? '<b>E</b>Ouvir o rádio de novo' : 'Um rádio velho, desligado.', () => { if (S.flags.joaquimSumiu) A.tocarFita('f5'); });
  ITENS.nota('n1', { x: 13.6, y: 1.6, z: -13.12 }, true).obj.rotation.y = Math.PI;
  const chave = MK.chave(); chave.rotation.z = Math.PI / 2; chave.rotation.y = Math.PI / 2;
  item('chave_portao', { x: 12.14, y: 1.5, z: -19.4 }, chave, () => S.done.posto ? '<b>E</b>Pegar a chave do portão' : 'Uma chave pendurada num prego.', () => {
    S.inv.chaves.portao = 'Chave do portão'; A.objDone('chave_portao');
    setTimeout(() => { S.flags.joaquimSumiu = true; sumir(); SFX.estatica(1.4, { x: 16.4, y: 1.2, z: -15.4 }); A.falar('joaquim_sumiu'); setTimeout(() => A.tocarFita('f5'), 6500); }, 900);
  }, () => true).pode = () => S.done.posto;
  // a chave só pode ser pega depois da conversa
  const itChave = A.W.items[A.W.items.length - 1].it; const actOrig = itChave.act; itChave.act = () => { if (S.done.posto) actOrig(); else A.toast('Melhor falar com ele primeiro.'); };
  ITENS.pilha('pilha_posto', A.spot('posto', 'prateleira', 1));
  ITENS.garrafa('garrafa_posto', { x: 16.3, y: 1.05, z: -18.8 });
  ITENS.kit('kit_posto', A.spot('posto', 'prateleira', 4));

  // sustos da estrada
  const v = vulto(A);
  gatilho('vulto', -7, 7, -40, -22, () => {
    S.flags.faroisMortos = true; farolOn(false); SFX.estatica(.6);
    v.position.set(-10, 0, -52); v.visible = true; let t = 0;
    A.W.tick.push(dt => { if (!v.visible) return; t += dt; v.position.x = -10 + t * 7; v.rotation.y = Math.PI / 2; if (t > 3) v.visible = false; });
    setTimeout(() => A.falar('vulto_estrada'), 900);
  });
  gatilho('risada', -7, 7, -62, -52, () => SFX.risada(-12, -58));

  interact(gate.L, () => {
    if (!S.inv.chaves.portao) return 'Portão trancado com cadeado.';
    return '<b>E</b>Abrir o cadeado';
  }, () => {
    if (!S.inv.chaves.portao) { SFX.trancado(); return; }
    if (S.done.abrir_portao) return;
    SFX.trancado(); gate.abrir(); A.falar('portao'); A.objDone('abrir_portao');
  });

  // cena de abertura (carro)
  let cenaCarro = null;
  return {
    nome: 'A Estrada Velha',
    spawns: { titulo: { x: 0, z: -48, yaw: 0 }, carro: { x: 1.6, z: 9.6, yaw: 0 }, inicio: { x: -.4, z: 9.2, yaw: 0 } },
    fora: { hemi: .55, moon: .75, fog: .05 }, dentro: { hemi: .12, moon: .05, fog: .08 },
    energia: () => true,
    inicioCapitulo(cap) { if (cap === 1) A.carregarMapa('terreo', 'inicio'); },
    cena: {
      iniciar() { cenaCarro = { z0: 72 }; carro.position.z = 72; farolOn(true); },
      update(t, dt) {
        let z;
        if (t < 23) z = 72 - 2.6 * t;
        else { const k = Math.min(1, (t - 23) / 2); z = (72 - 2.6 * 23) - (72 - 2.6 * 23 - 9.6) * (1 - Math.pow(1 - k, 3)); }
        carro.position.z = z;
        if (t > 21.5 && t < 25) { v.visible = true; v.position.set(-8 + (t - 21.5) * 6, 0, z - 13); v.rotation.y = Math.PI / 2; } else if (t >= 25) v.visible = false;
        if (t > 23 && !cenaCarro.freou) { cenaCarro.freou = true; SFX.freada(); }
        if (t > 26 && !cenaCarro.morreu) { cenaCarro.morreu = true; SFX.motor(false); }
        const tremor = t > 23 && t < 25 ? .03 : .004;
        A.camera.position.set(carro.position.x - .38 + A.rand(-tremor, tremor), 1.15 + Math.sin(t * 9) * .006, carro.position.z - .05);
        A.camera.rotation.set(-.03, Math.sin(t * .4) * .03 + (t > 25 ? Math.sin((t - 25) * .7) * .25 : 0), 0);
      },
      fim() { carro.position.z = 9.6; v.visible = false; A.P.pos.set(-.4, 0, 9.2); A.P.yaw = 0; A.objDone('sair_carro'); }
    }
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
    { id: 'main', a: 'hall', b: 'patio', x: 0, z: 0, eixo: 'x', nome: 'porta principal', hold: 3, ruidoHold: 9, holdTexto: 'Forçar a porta principal', aoAbrir: () => { if (!S.done.forcar_porta) { A.objDone('forcar_porta'); S.timers.insp = 40; } } },
    { id: 'hcw', a: 'hall', b: 'cw', x: -6, z: -12, eixo: 'z' }, { id: 'hce', a: 'hall', b: 'ce', x: 6, z: -12, eixo: 'z' },
    { id: 'aula', a: 'cw', b: 'aula', x: -13, z: -10, eixo: 'x', nome: 'porta da sala de aula' },
    { id: 'biblio', a: 'cw', b: 'biblio', x: -27, z: -10, eixo: 'x', nome: 'porta da biblioteca' },
    { id: 'refeit', a: 'cw', b: 'refeit', x: -15, z: -14, eixo: 'x', nome: 'porta do refeitório' },
    { id: 'cozinha', a: 'cw', b: 'cozinha', x: -29, z: -14, eixo: 'x', nome: 'porta da cozinha' },
    { id: 'rc', a: 'refeit', b: 'cozinha', x: -24, z: -20, eixo: 'z' },
    { id: 'despensa', a: 'cozinha', b: 'despensa', x: -29, z: -26, eixo: 'x', nome: 'porta da despensa' },
    { id: 'diret', a: 'ce', b: 'diret', x: 12, z: -10, eixo: 'x', nome: 'porta da diretoria' },
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
  plano(2.2, 2.2, new THREE.MeshStandardMaterial({ map: A.TX.relogio, roughness: .8 }), 0, 5.6, -.98);

  // recepção
  prop(5, 1.1, .8, MAT.madeiraEsc, 0, .55, -4); box(5.1, .06, .9, MAT.madeira, 0, 1.13, -4);
  A.W.spots.hall.mesa.push({ x: -1.6, y: 1.16, z: -4 }, { x: 1.4, y: 1.16, z: -4 });
  for (const z of [-2, -3.2]) prop(.5, .9, .5, MAT.madeiraEsc, 5, .45, z);
  const quadro = box(1.4, 1, .08, MAT.madeiraEsc, 3, 1.6, -13.85);
  const visor = box(.4, .12, .03, new THREE.MeshStandardMaterial({ color: 0x000, emissive: 0x30ff60, emissiveIntensity: 0 }), 3, 2.0, -13.8, A.W.grupo, false);
  for (let i = 0; i < 9; i++) box(.02, .02, .06, MAT.bronze, 2.6 + (i % 3) * .4, 1.75 - Math.floor(i / 3) * .25, -13.78, A.W.grupo, false);
  plano(.8, .8, new THREE.MeshStandardMaterial({ map: A.TX.relogio }), -3.5, 2.2, -13.88);
  // escada para cima (com grade)
  for (let i = 0; i < 8; i++) box(2.6, .2, .45, MAT.madeiraEsc, -4, .1 + i * .3, -9.6 - i * .45);
  A.addCollider(-5.4, -2.6, -13.9, -9.3);
  const grade = new THREE.Group(); grade.position.set(-4, 0, -9.2); A.W.grupo.add(grade);
  for (let i = 0; i < 9; i++) cyl(.02, .02, 2.2, MAT.ferrugem, -1.3 + i * .32, 1.1, 0, 6, grade);
  box(2.7, .06, .06, MAT.ferrugem, 0, 2.15, 0, grade); box(.14, .18, .08, MAT.bronze, .2, 1.1, .05, grade);
  interact(grade, () => S.inv.chaves.escada ? '<b>E</b>Subir para os dormitórios' : 'Uma grade com cadeado fecha a escada.', () => {
    if (!S.inv.chaves.escada) { SFX.trancado(); A.emitNoise(-4, -9, 3); return; }
    if (S.chapter === 2) A.objDone('subir');
    A.fade(true, () => { A.carregarMapa('superior', 'escada'); A.fade(false); }, 500);
  });
  interact(quadro, () => {
    if (S.inv.chaves.escada) return 'Quadro de chaves (aberto)';
    if (!S.flags.energia) return 'Quadro de chaves com teclado. Sem energia.';
    return '<b>E</b>Digitar o código do quadro';
  }, () => {
    if (S.inv.chaves.escada || !S.flags.energia) { SFX.trancado(); return; }
    A.abrirTeclado('QUADRO DE CHAVES', S.quadro.join(''), () => {
      S.inv.chaves.escada = 'Chave da escada'; SFX.pegar(); A.objDone('chave_escada'); A.falar('chave_escada');
    }, () => A.emitNoise(3, -13, 8));
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
    if (!S.inv.galao) return 'Gerador sem combustível.';
    if (S.inv.fusiveis < 3) return `Faltam fusíveis no quadro da parede (${S.inv.fusiveis}/3).`;
    return '<b>E</b>Ligar o gerador';
  }, () => {
    if (S.flags.energia || !S.inv.galao || S.inv.fusiveis < 3) return;
    S.flags.energia = true; SFX.gerador(true, { x: 31.6, y: 1, z: -19 }); A.emitNoise(31.6, -19, 45); A.conquista('luz');
    let n = 0; const iv = setInterval(() => { A.W.lampadas.forEach(L => { L.luz.intensity = Math.random() < .5 ? L.base : 0; }); if (++n > 10) { clearInterval(iv); A.syncWorld(); } }, 120);
    A.objDone('gerador'); setTimeout(() => A.falar('gerador'), 1200);
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
  item('galao', spot('despensa', 'mesa', 1), MK.galao(), 'Pegar galão de gasolina', () => { S.inv.galao = true; A.objDone('galao'); A.falar('galao'); });
  // uma caixa só, com os três fusíveis (nada de caça a três peças)
  item('fusiveis', spot('enferm', 'mesa', 0), MK.fusivel(), 'Pegar a caixa de fusíveis reserva', () => { S.inv.fusiveis = 3; A.progresso(); });
  // recursos (poucos de propósito)
  ITENS.pilha('p1', spot('aula', 'mesa', 6)); ITENS.pilha('p2', spot('banh', 'mesa', 1)); ITENS.pilha('p3', spot('refeit', 'mesa', 3));
  ITENS.kit('k1', spot('enferm', 'prateleira', 1)); ITENS.kit('k2', spot('cozinha', 'prateleira', 2));
  ITENS.garrafa('g1', spot('refeit', 'mesa', 0)); ITENS.garrafa('g2', spot('cozinha', 'mesa', 0)); ITENS.garrafa('g3', spot('banh', 'mesa', 2));
  // rabiscos
  plano(4, 4, new THREE.MeshStandardMaterial({ map: A.TX.rabisco, transparent: true }), -6.12, 1.6, -22, -Math.PI / 2);
  plano(3, 3, new THREE.MeshStandardMaterial({ map: A.TX.rabisco, transparent: true }), 16, 1.5, -25.85);

  // sustos
  gatilho('portaBate', -34, -6, -14, -10, () => { setTimeout(() => { SFX.pancada(-30, -12); SFX.risada(-32, -20); }, 800); });
  gatilho('lavanderia', 6, 16, -26, -14, () => { SFX.sussurros(2); });

  return {
    nome: 'Térreo do internato',
    spawns: { inicio: { x: 0, z: 13, yaw: 0 }, escada: { x: -4, z: -7.6, yaw: Math.PI }, porao: { x: 27, z: -21.5, yaw: Math.PI } },
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
      A.W.tick.push(dt => { if (S.timers.insp > 0 && S.done.forcar_porta) { S.timers.insp -= dt; if (S.timers.insp <= 0 && !A.M.ativo) { A.ativarInspetor(-29, -20); } } });
    },
    inicioCapitulo(cap) {
      if (cap === 2) {
        SFX.badaladas(9); setTimeout(() => A.falar('badaladas'), 4000);
        S.timers.procissao = 26;
        if (S.fitas.f1) A.objDone('fita_diretor');
      }
    },
    fitaOuvida(id) { if (id === 'f1' && S.chapter >= 2) A.objDone('fita_diretor'); }
  };
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
    P('cel', 'celeste', -3, -53, { nome: 'porta da Irmã Celeste', trava: () => !S.inv.chaves.celeste, msg: 'Trancada. Na placa: "Irmã Celeste".', aoAbrir: () => A.objDone('quarto_celeste') }),
    P('rp', 'roup', 3, -7, { nome: 'porta da rouparia' }), P('dD', 'dormD', 3, -18, { nome: 'porta do dormitório D' }), P('br', 'brinq', 3, -31, { nome: 'porta da sala de brinquedos' }),
    P('dE', 'dormE', 3, -44, { nome: 'porta do dormitório E' }), P('so', 'sotao', 3, -54, { nome: 'porta do depósito' })
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
    if (S.inv.engrenagens < 3) return 'Falta uma engrenagem. A menina escondeu em algum dormitório.';
    return '<b>E</b>Montar e dar corda na caixinha';
  }, () => {
    if (S.done.caixinha || S.inv.engrenagens < 3 || S.chapter < 3) return;
    SFX.caixinha(pc.x, pc.z); S.flags.cavalinho = true; A.objDone('caixinha'); A.falar('caixinha'); A.emitNoise(pc.x, pc.z, 14);
    setTimeout(() => { A.spawnAna(A.SALA('brinq'), true); A.falar('ana_aparece'); }, 4500);
  });
  itCaixa.hold = 2; itCaixa.pode = () => !S.done.caixinha && S.inv.engrenagens >= 3 && S.chapter >= 3;
  // engrenagens
  // uma engrenagem só, no dormitório do fundo: obriga a atravessar o corredor com ela contando
  item('eng0', spot('dormE', 'cama', 2), MK.engrenagem(), 'Pegar a engrenagem da caixinha', () => { S.inv.engrenagens = 3; A.progresso(); SFX.risada(8, -31); }, () => S.chapter >= 3);
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
  interact(poco, () => S.inv.chaves.porao ? '<b>E</b>Descer pelo monta-cargas' : S.chapter < 3 || !S.done.ana ? 'Um monta-cargas antigo. Grade trancada.' : 'Um monta-cargas. A grade tem cadeado. Leva até o porão.', () => {
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
  gatilho('corredorFim', -3, 3, -58, -46, () => { SFX.pancada(8, -54); });

  return {
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
  };
}

// =====================================================================
// TÚNEIS ALAGADOS (Capítulo IV)
// =====================================================================
function tuneis(A, S) {
  const { THREE, MAT, box, cyl, prop, plano, item, interact, ITENS, MK, gatilho, SFX, spot } = A;
  const T = (id, nome, x0, x1, z0, z1, extra = {}) => ({ id, nome, x0, x1, z0, z1, tipo: 'tunel', piso: 'concreto', parede: 'tijolo', h: 2.8, agua: true, ...extra });
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
  // escada de volta
  const escada = new THREE.Group(); escada.position.set(0, 0, -.4); A.W.grupo.add(escada);
  for (let i = 0; i < 7; i++) box(.8, .04, .04, MAT.ferrugem, 0, .3 + i * .38, 0, escada); box(.04, 2.8, .04, MAT.ferrugem, -.4, 1.4, 0, escada); box(.04, 2.8, .04, MAT.ferrugem, .4, 1.4, 0, escada);
  interact(escada, () => '<b>E</b>Subir para a casa de máquinas', () => { A.fade(true, () => { A.carregarMapa('terreo', 'porao'); A.fade(false); }, 500); });
  // válvulas
  const valvs = [{ n: 1, x: -33.85, z: -18, ry: Math.PI / 2 }, { n: 2, x: 33.85, z: -18, ry: -Math.PI / 2 }, { n: 3, x: -4, z: -41.85, ry: 0 }];
  for (const v of valvs) {
    const g = new THREE.Group(); g.position.set(v.x, 1.3, v.z); g.rotation.y = v.ry; A.W.grupo.add(g);
    const roda = new THREE.Mesh(new THREE.TorusGeometry(.3, .04, 6, 16), MAT.ferrugem); roda.position.z = .15; g.add(roda);
    for (let i = 0; i < 3; i++) { const r = box(.6, .03, .03, MAT.ferrugem, 0, 0, .15, g); r.rotation.z = i * Math.PI / 3; }
    cyl(.08, .08, .3, MAT.ferrugem, 0, 0, 0, 8, g).rotation.x = Math.PI / 2;
    placa(A, [{ t: String(v.n), tam: 120, estilo: 'bold' }], 0, .6, .02, .35, .35, 0, { w: 128, h: 128, fundo: '#2a2018', cor: '#c9a75a' }).removeFromParent();
    const pl = A.plano(.35, .35, new THREE.MeshStandardMaterial({ map: A.textoTex([{ t: String(v.n), tam: 110, estilo: 'bold', y: 80 }], { w: 128, h: 128, fundo: '#2a2018', cor: '#c9a75a', manchas: 2 }), emissive: 0x201408, emissiveIntensity: .6 }), 0, .62, .02, 0, g);
    const it = interact(g, () => {
      if (S.flags.aguaBaixa) return `Válvula ${v.n} (aberta)`;
      if (S.valv.includes(v.n)) return `Válvula ${v.n} — já girada`;
      return `<b>E</b>Girar a válvula ${v.n}`;
    }, () => {
      if (S.flags.aguaBaixa || S.valv.includes(v.n)) return;
      S.valv.push(v.n); SFX.valvula({ x: v.x, y: 1.3, z: v.z });
      const certo = S.ordem[S.valv.length - 1] === v.n;
      if (!certo) {
        S.valv = []; SFX.cano({ x: v.x, y: 2, z: v.z }); A.emitNoise(v.x, v.z, 30); A.falar('valvula_errada'); A.toast('Os canos estouram. A água volta a subir.');
      } else if (S.valv.length === 3) {
        S.flags.aguaBaixa = true; A.objDone('valvulas'); A.falar('valvulas_ok'); A.emitNoise(v.x, v.z, 20); SFX.cano(null);
      }
      A.progresso();
    });
    it.hold = 2.5; it.ruido = 8; it.som = 'valvula'; it.pode = () => !S.flags.aguaBaixa && !S.valv.includes(v.n);
  }
  // nível da água
  A.W.tick.push(dt => { const alvo = S.flags.aguaBaixa ? .04 : .42; for (const m of A.W.agua) m.position.y += (alvo - m.position.y) * Math.min(1, dt * .6); });
  // sala do diretor: cofre, gravador, carta
  const cofre = new THREE.Group(); cofre.position.set(7.4, 0, -60); cofre.rotation.y = -Math.PI / 2; A.W.grupo.add(cofre);
  box(.9, 1.1, .8, MAT.metal, 0, .55, 0, cofre);
  const cp = new THREE.Group(); cp.position.set(-.42, .55, .41); cofre.add(cp);
  box(.82, 1, .06, new THREE.MeshStandardMaterial({ color: 0x55585a, metalness: .7, roughness: .4, emissive: 0x101010 }), .41, 0, 0, cp);
  cyl(.08, .08, .05, MAT.bronze, .55, .15, .05, 12, cp).rotation.x = Math.PI / 2;
  A.addCollider(6.95, 7.85, -60.45, -59.55);
  interact(cofre, () => S.flags.cofre ? 'Cofre aberto e vazio.' : A.R.paginas.every(p => S.notes[p.id]) ? '<b>E</b>Usar o cofre' : `<b>E</b>Usar o cofre (números do Davi: ${A.R.paginas.filter(p => S.notes[p.id]).length}/4)`, () => {
    if (S.flags.cofre) return;
    A.abrirTeclado('COFRE DO DIRETOR', S.code.join(''), () => {
      S.flags.cofre = true; S.inv.pa = true; S.inv.chaves.capela = 'Chave da capela'; cp.rotation.y = -1.7;
      SFX.pancada(7, -60); SFX.susto(); A.objDone('cofre'); A.falar('cofre'); A.M.furia = 10;
      setTimeout(() => A.tocarFita('f4'), 5500);
    }, () => A.emitNoise(7, -60, 10));
  });
  ITENS.gravador('f3', spot('secreta', 'mesa', 0));
  ITENS.nota('n10', spot('secreta', 'mesa', 1));
  ITENS.nota('n9', spot('dep', 'mesa', 0));
  // última página do Davi, no túnel que leva à sala do diretor
  ITENS.nota('p4', noCaixote(A, spot('t4', 'chao', 0)));
  // saída
  const esc2 = new THREE.Group(); esc2.position.set(31.6, 0, -36); esc2.rotation.y = -Math.PI / 2; A.W.grupo.add(esc2);
  for (let i = 0; i < 7; i++) box(.8, .04, .04, MAT.ferrugem, 0, .3 + i * .38, 0, esc2); box(.04, 2.8, .04, MAT.ferrugem, -.4, 1.4, 0, esc2); box(.04, 2.8, .04, MAT.ferrugem, .4, 1.4, 0, esc2);
  interact(esc2, () => S.flags.cofre ? '<b>E</b>Subir pela escotilha' : 'Uma escotilha no teto, travada por dentro com uma corrente. A chave deve estar com o diretor.', () => {
    if (!S.flags.cofre) { SFX.trancado(); return; }
    A.objDone('sair_tuneis');
    A.fade(true, () => { A.carregarMapa('cemiterio', 'tuneis'); A.fade(false); }, 500);
  });
  // recursos (em cima de caixotes: a água esconderia)
  ITENS.pilha('p1', spot('dep', 'mesa', 1)); ITENS.pilha('p2', noCaixote(A, spot('v2', 'chao', 1))); ITENS.pilha('p3', noCaixote(A, spot('t5', 'chao', 0)));
  ITENS.kit('k1', spot('dep', 'mesa', 2)); ITENS.kit('k2', noCaixote(A, spot('hub', 'chao', 2)));
  ITENS.garrafa('g1', noCaixote(A, spot('t3', 'chao', 0))); ITENS.garrafa('g2', noCaixote(A, spot('t2', 'chao', 1))); ITENS.garrafa('g3', noCaixote(A, spot('hub', 'chao', 0)));
  gatilho('cisterna', -6, 6, -42, -30, () => { SFX.sussurros(2.5); });

  return {
    nome: 'Túneis de drenagem',
    spawns: { entrada: { x: 0, z: -2.5, yaw: 0 }, inicio: { x: 0, z: -2.5, yaw: 0 } },
    dentro: { hemi: .05, moon: 0, fog: .12 },
    energia: () => !!S.flags.energia,
    inspetor: () => true,
    procissao: () => S.chapter >= 4,
    ana: () => S.chapter >= 4,
    chamado: () => true,
    entrar(cap) {
      if (!S.flags.tunIntro) { S.flags.tunIntro = true; setTimeout(() => A.falar('tuneis_inicio'), 1000); }
      A.agendarEntidades();
    }
  };
}

// =====================================================================
// CEMITÉRIO E CAPELA (Capítulo V — final)
// =====================================================================
function cemiterio(A, S) {
  const { THREE, MAT, box, cyl, prop, plano, piso, item, interact, ITENS, MK, gatilho, SFX, spot, rand } = A;
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
  // capela por fora: torre do sino
  box(5, 5, 5, A.texMat('pedra', 1.6, 1.6), 0, 8.5, -66, A.W.grupo, false);
  const tc = new THREE.Mesh(new THREE.ConeGeometry(3.8, 4, 4), MAT.telhado); tc.rotation.y = Math.PI / 4; tc.position.set(0, 13, -66); A.W.grupo.add(tc);
  box(1.2, 2, .2, MAT.preto, 0, 8.5, -63.4, A.W.grupo, false);
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
  const nomes = A.R.lapides, cel = S.tumPos;
  const lapide = (x, z, l, i) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.PI + rand(-.12, .12); g.rotation.z = rand(-.06, .06); A.W.grupo.add(g);
    const tex = A.textoTex([{ t: '✝', tam: 40, y: 50 }, { t: l.nome, tam: l.nome.length > 14 ? 22 : 28, y: 120 }, { t: l.datas, tam: 22, y: 170 }], { w: 256, h: 256, fundo: '#55534c', cor: '#1a1814', manchas: 5 });
    const pedra = box(.8, 1.05, .16, [MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, MAT.pedraLap, new THREE.MeshStandardMaterial({ map: tex, roughness: .95 }), MAT.pedraLap], 0, .52, 0, g);
    A.addCollider(x - .42, x + .42, z - .12, z + .12); A.W.solid.push(pedra);
    const monte = box(.9, .12, 1.7, A.texMat('terra', .5, .5), 0, .06, -1, g, false);
    return { g, monte };
  };
  const importantes = {};
  let k = 0;
  nomes.forEach((l, i) => {
    const [x, z] = cel[k++]; const L = lapide(x, z, l, i);
    if (l.importante) {
      importantes[l.id] = L;
      const rel = { ana: ['boneca', 'Ana'], tome: ['carrinho', 'Tomé'], davi: ['caderno', 'Davi'] }[l.id];
      const it = interact(L.g, () => {
        if (S.tumulos[l.id]) return `${l.nome} — já cavado`;
        if (!S.inv.pa) return `${l.nome} · ${l.datas}`;
        return `<b>E</b>Cavar o túmulo de ${l.nome}`;
      }, () => {
        if (S.tumulos[l.id] || !S.inv.pa) return;
        S.tumulos[l.id] = true; S.inv.reliquias++; SFX.pegar(); A.falar('tumulo'); A.toast(`Você achou ${rel[0] === 'boneca' ? 'a boneca da Ana' : rel[0] === 'carrinho' ? 'o carrinho do Tomé' : 'o caderno do Davi'}.`);
        L.monte.scale.y = 3; A.progresso();
      });
      it.hold = 4; it.ruido = 12; it.som = 'cavar'; it.pode = () => !!S.inv.pa && !S.tumulos[l.id];
    } else interact(L.g, () => `${l.nome} · ${l.datas}`, () => {});
  });
  // lápide rachada (nota) e recorte na porta da capela
  { const [x, z] = cel[k++]; const L = lapide(x, z, { nome: '— rachada —', datas: '' }); const it = interact(L.g, () => `<b>E</b>Ler a lápide rachada${S.notes.n11 ? ' (lida)' : ''}`, () => A.lerNota('n11')); }
  // covas sem nome: cruzes tortas e pedras gastas no resto do campo
  for (let n = 0; k < cel.length && n < 60; k++, n++) {
    const [x, z] = cel[k], g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rand(-.3, .3); g.rotation.z = rand(-.15, .15); A.W.grupo.add(g);
    if (k % 3 === 0) { box(.1, 1.2, .1, MAT.madeiraEsc, 0, .6, 0, g); box(.6, .1, .1, MAT.madeiraEsc, 0, .9, 0, g); }
    else { const h = rand(.5, .9); A.W.solid.push(box(.6, h, .14, MAT.pedraLap, 0, h / 2, 0, g)); }
    box(.8, .1, 1.5, A.texMat('terra', .5, .5), 0, .05, -.9, g, false);
    A.addCollider(x - .35, x + .35, z - .12, z + .12);
  }
  ITENS.nota('n12', { x: 1.6, y: 1.5, z: -47.75 }, true);
  // capela por dentro
  for (let i = 0; i < 5; i++) for (const x of [-4, 4]) { prop(5, .5, .5, MAT.madeiraEsc, x, .25, -51 - i * 2); box(5, .6, .08, MAT.madeiraEsc, x, .7, -50.75 - i * 2); }
  const altar = prop(3, 1, 1.2, MAT.lencol, 0, .5, -66);
  box(3.1, .05, 1.3, MAT.tecido, 0, 1.02, -66);
  const cruz = new THREE.Group(); cruz.position.set(0, 3.4, -69.8); A.W.grupo.add(cruz);
  box(.15, 2.4, .1, MAT.madeiraEsc, 0, 0, 0, cruz); box(1.3, .15, .1, MAT.madeiraEsc, 0, .55, 0, cruz);
  for (const x of [-1.2, -.6, .6, 1.2]) A.vela(x, 1.05, -66.4);
  const slots = [[-.7, -65.7], [0, -65.6], [.7, -65.7]];
  const noAltar = [MK.carrinho(), MK.boneca(), MK.caderno()].map((m, i) => { m.position.set(slots[i][0], 1.05, slots[i][1]); A.W.grupo.add(m); return m; });
  interact(altar, () => {
    if (S.inv.reliquias > 0) return `<b>E</b>Colocar ${S.inv.reliquias > 1 ? 'os objetos' : 'o objeto'} no altar`;
    if (S.placed >= 3) return 'Os três objetos estão no altar.';
    return `Um altar coberto de cera (${S.placed}/3).`;
  }, () => {
    if (S.inv.reliquias <= 0) return;
    S.placed += S.inv.reliquias; S.inv.reliquias = 0; SFX.pegar(); A.syncWorld(); A.progresso();
  });
  // o sino (dentro da torre, corda desce até o chão)
  const sinoG = new THREE.Group(); sinoG.position.set(4.8, 5.3, -64); A.W.grupo.add(sinoG);
  const sinoP = new THREE.Group(); sinoG.add(sinoP);
  const pts = [.48, .47, .44, .38, .32, .26, .2, .12, 0].map((r, i) => new THREE.Vector2(r, -i * .12));
  const sino = new THREE.Mesh(new THREE.LatheGeometry(pts, 16), MAT.bronze); sino.castShadow = true; sinoP.add(sino);
  box(2.2, .14, .14, MAT.madeiraEsc, 0, .1, 0, sinoG); box(.1, 5.4, .1, MAT.madeiraEsc, -1, -2.6, 0, sinoG); box(.1, 5.4, .1, MAT.madeiraEsc, 1, -2.6, 0, sinoG);
  const corda = box(.03, 4.4, .03, MAT.lencol, 0, -3.1, 0, sinoP, false);
  A.addCollider(3.7, 5.9, -64.15, -63.85);
  const itSino = interact(sinoG, () => {
    if (S.flags.sino) return 'O sino ainda vibra.';
    if (S.placed < 3) return 'O sino. A corda está podre, mas aguenta.';
    return '<b>E</b>Puxar a corda do sino';
  }, () => {
    if (S.flags.sino || S.placed < 3) return;
    S.flags.sino = true; A.objDone('sino'); SFX.sino(1, { x: 4.8, y: 5, z: -64 }); A.falar('sino'); A.P.shake = .2;
    let t = 0; A.W.tick.push(dt => { t += dt; sinoP.rotation.x = Math.sin(t * 3) * .6 * Math.exp(-t * .15); });
    fundos.abrir(); A.setDoor(A.DOOR('cap'), true, true);
    A.desativarInspetor();
    setTimeout(() => { A.ativarInspetor(0, -67, 'caca'); A.M.cool = 2.5; SFX.grito('inspetor'); A.emitNoise(0, -60, 60); }, 3200);
    setTimeout(() => { if (A.S.flags.sino && !A.ANA.ativa) A.spawnAna(A.SALA('cem')); }, 9000);
  });
  itSino.hold = 3; itSino.ruido = 40; itSino.som = 'cavar'; itSino.pode = () => !S.flags.sino && S.placed >= 3;
  gatilho('fuga', -2.2, 2.2, 11.2, 13, () => { if (S.flags.sino) A.escolhaFinal(); }, false);
  gatilho('entrouCapela', -8, 8, -70, -48.5, () => { if (S.chapter === 5 && !S.done.capela) { A.objDone('capela'); A.falar('capela'); } }, false);
  gatilho('vozCemit', -30, 30, -20, -10, () => { SFX.chamadoVoz(-20, -30); });

  return {
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
    sync() { noAltar.forEach((m, i) => m.visible = i < S.placed); for (const [id, L] of Object.entries(importantes)) if (S.tumulos[id]) L.monte.scale.y = 3; },
    entrar(cap) {
      if (!S.flags.cemIntro) { S.flags.cemIntro = true; setTimeout(() => A.falar('cemiterio_inicio'), 1200); }
      if (S.flags.sino) { fundos.abrir(); A.ativarInspetor(0, -66, 'caca'); }
      A.agendarEntidades();
    },
  };
}

export const MAPAS = { estrada, terreo, superior, tuneis, cemiterio };
