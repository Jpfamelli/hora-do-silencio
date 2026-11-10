// MAPAS — A Hora do Silêncio v2
// Cada mapa recebe a API do motor (A) e o estado (S) e devolve sua definição:
// { nome, spawns, fora, dentro, energia(), inspetor(), procissao(), ana(), chamado(), entrar(cap), inicioCapitulo(cap), ... }
import { extrasEstrada, memoria, lembrar, SPAWN } from './src/estrada-extra.js';
import { TXT } from './src/estrada-roteiro.js';
import { mundoEstrada } from './src/estrada-mundo.js';
import { polirEstrada, tecla, semFlash } from './src/estrada-polimento.js';
import { segredosEstrada, letrasPlaca } from './src/estrada-segredos.js';
import { monstrosEstrada } from './src/estrada-monstros.js';
import { rejogoEstrada } from './src/estrada-lote6.js';
import { rejogoEstrada2 } from './src/estrada-lote6b.js'; // lote 6 (2ª rodada): mala, rádio, posto que muda e eventos da estrada
import { audioEstrada } from './src/estrada-audio.js';
import { arvores, arvoreSeca, muro, invisivel, portao, vulto, janelasFachada, placa, noCaixote } from './src/mapas-util.js';

// =====================================================================
// PRÓLOGO — A ESTRADA VELHA
// =====================================================================
function estrada(A, S) {
  const { THREE, MAT, box, cyl, prop, plano, piso, item, interact, ITENS, MK, gatilho, SFX } = A;
  const GZ = -60, BZ = GZ - 19; // portão (mais perto do posto que antes) e o prédio, que surge da neblina quando você chega
  const salas = [
    { id: 'estrada', nome: 'Estrada velha', x0: -7, x1: 7, z0: GZ, z1: 82, fora: true, piso: 'asfalto' },
    { id: 'patioPosto', nome: 'Posto Serra', x0: 7, x1: 24, z0: -26, z1: -6, fora: true },
    { id: 'posto', nome: 'Loja do posto', x0: 12, x1: 20, z0: -21, z1: -13, piso: 'ladrilho', parede: 'azulejo', h: 3 },
    { id: 'barranco', nome: 'Barranco', x0: 7.2, x1: 12.6, z0: GZ + .4, z1: -26, fora: true, piso: 'cascalho' } // atalho do Lote 3 (src/estrada-polimento.js)
  ];
  const portas = [{ id: 'posto', a: 'patioPosto', b: 'posto', x: 12, z: -17, eixo: 'z', nome: 'porta da loja' }];
  A.construirSalas(salas, portas);
  piso(-120, 120, -120, 120, 'grama', 4, -.01);
  piso(-4, 4, -72, 82, 'asfalto', 8, .002);
  piso(-7, -4, -72, 82, 'terra', 3, .003); piso(4, 7, -72, 82, 'terra', 3, .003);
  piso(7, 24, -26, -6, 'concreto', 3, .003);
  const arv = arvores(A, [[-40, -8, GZ + 2, 90], [8, 40, 2, 90], [13.6, 40, GZ + 2, -28], [25, 45, -30, 0], [36, 52, -100, GZ], [-52, -36, -100, GZ], [-40, 40, -104, BZ - 7]], 420);
  // limites invisíveis (mato fechado)
  // a cerca entre a estrada e o barranco e a do fundo do pátio têm um trecho caído cada (só agachada; src/estrada-polimento.js)
  invisivel(A, -7, GZ, -7, 82); invisivel(A, 7, GZ, 7, GZ + 1.2); invisivel(A, 7, GZ + 3.6, 7, -26); invisivel(A, 7, -6, 7, 82);
  invisivel(A, 24, -26, 24, -6); invisivel(A, 7, -26, 8.2, -26); invisivel(A, 10.8, -26, 24, -26); invisivel(A, 12.6, GZ, 12.6, -26); invisivel(A, 7, -6, 24, -6); invisivel(A, -7, 82, 7, 82);
  // muro e portão do internato
  muro(A, -30, GZ, -2.3, GZ, 3); muro(A, 2.3, GZ, 30, GZ, 3);
  const gate = portao(A, 0, GZ, 4);
  const cadeado = box(.14, .18, .06, MAT.bronze, 0, 1.12, GZ + .1);
  placa(A, [{ t: letrasPlaca(), tam: 40, estilo: 'bold' }, { t: 'propriedade particular · proibida a entrada', tam: 22, estilo: 'italic' }], 6, 2.2, GZ + .25, 3.6, .9, 0);
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
    A.objDone('lanterna'); A.falar('pegou_lanterna'); A.toast(`Lanterna (${tecla('F')}) e uma pilha reserva (${tecla('R')}).`);
  });
  interact(carro.children[0], () => S.flags.perseguicao ? 'Os faróis acenderam sozinhos. A chave nem está no contato.' : 'O motor morreu. E a árvore fecha a estrada.', () => {});

  // posto
  const cobertura = box(4, .2, 10, MAT.metal, 9.6, 4.2, -17, A.W.grupo, false);
  for (const z of [-21.6, -12.4]) cyl(.12, .12, 4.2, MAT.metal, 9.6, 2.1, z);
  for (const z of [-19, -15]) { prop(.5, 1.5, .4, new THREE.MeshStandardMaterial({ color: 0x7a1a12, roughness: .6 }), 9.6, .75, z); }
  const neon = box(3, .06, .1, new THREE.MeshStandardMaterial({ emissive: 0xd8f0ff, emissiveIntensity: 2 }), 9.6, 4.05, -17, A.W.grupo, false);
  const luzNeon = new THREE.PointLight(0xd8f0ff, 6, 14, 1.4); luzNeon.position.set(9.6, 3.8, -17); A.W.grupo.add(luzNeon);
  A.W.tick.push(dt => { const on = Math.random() > (S.flags.joaquimSumiu ? .3 : .04), li = on ? 6 : .2, ne = on ? 2 : .1; if (semFlash() && dt) { const k = Math.min(1, dt * 3); luzNeon.intensity += (li - luzNeon.intensity) * k; neon.material.emissiveIntensity += (ne - neon.material.emissiveIntensity) * k; } else { luzNeon.intensity = li; neon.material.emissiveIntensity = ne; } }); // reduzir flashes: o neon falha sem piscar
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
  mundoEstrada(A, S, { GZ, carro, ex }); // Lote 2: lugares e lore da estrada, do posto e do portão (src/estrada-mundo.js)
  const sumir = inst => { velho.visible = false; ex.sumir(inst); A.W.tick.push(() => { cadeira.rotation.x = Math.sin(A.perf() * 2) * .06; }); };
  if (S.flags.joaquimSumiu) sumir(true);
  interact(velho, () => S.done.posto ? '<b>E</b>Falar com Seu Joaquim' : '<b>E</b>Falar com o velho', () => {
    if (S.done.posto) { A.dialogo([{ quem: 'joaquim', texto: 'A chave tá no prego. Atrás de você. E não corre lá dentro.' }]); return; }
    const linhas = memoria().joaquim ? TXT.joaquimCurto : A.R.dialogos.joaquim;
    A.dialogo(linhas, () => { lembrar('joaquim'); S.flags.regras = true; A.objDone('posto'); A.lerNota('regras'); A.toast(`As regras ficam no diário (${tecla('TAB')}).`); });
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
  // Lote 3: atalho do barranco, abertura, retorno das ações, acessibilidade e desempenho (src/estrada-polimento.js)
  const pol = polirEstrada(A, S, { GZ, carro, ex, orelhao, chave, cadeado, gate, arvores: arv, novoVulto: () => vulto(A) });
  // Lote 4: segredos do carro, da estrada e do posto (src/estrada-segredos.js); `fora` é lido pelo motor a cada quadro (a névoa engrossa na estrada que dá a volta)
  const fora = { hemi: .55, moon: .75, fog: .055 };
  segredosEstrada(A, S, { GZ, BZ, carro, ex, pol, fora, luzNeon, neon, farolOn, v, novoVulto: () => vulto(A) });
  // Lote 5: monstros do prólogo — o batedor de 1979, o acompanhante da mata, o vulto dos faróis,
  // aparições perturbadoras e os momentos a mais da perseguição (src/estrada-monstros.js)
  if (!(window.__SIMP && window.__SIMP.on())) monstrosEstrada(A, S, { GZ, BZ, carro, farolOn, gate, ex, v, novoVulto: () => vulto(A) });
  // Lote 6: rejogabilidade — variações sorteadas por semente, segredos só da segunda jogada,
  // recordes e selos do prólogo (src/estrada-lote6.js)
  const r6 = rejogoEstrada(A, S, { GZ, BZ, carro, gate, cadeado, chave, orelhao, joaquim, velho, farolOn, ex, pol, fora, novoVulto: () => vulto(A) });
  // Lote 6 (2ª rodada): mala do carro, painel, rádio, posto que muda e eventos sorteados da estrada (src/estrada-lote6b.js)
  rejogoEstrada2(A, S, { GZ, BZ, carro, joaquim, velho, farolOn, ex, fora, r6: r6 && r6.util, novoVulto: () => vulto(A) });
  // Lote 7: som e atmosfera do prólogo — ambiência viva (grilos, sapos, cão, caminhão, grito no vento),
  // chuva na lataria do carro e no zinco do posto, rádio-farol que some com a distância e o silêncio
  // como arma (a natureza cala quando o morto chega). Lê S.flags.climaNoite (src/estrada-audio.js)
  const aud = audioEstrada(A, S, { GZ, BZ, carro, ex, v });

  return {
    nome: 'A Estrada Velha',
    spawns: { titulo: { x: 0, z: GZ + 24, yaw: 0 }, carro: { x: 1.6, z: 9.6, yaw: 0 }, inicio: { x: SPAWN.x, z: SPAWN.z, yaw: SPAWN.yaw } },
    fora, dentro: { hemi: .12, moon: .05, fog: .08 },
    energia: () => !S.flags.luzPostoMorta,
    ruidoMul: () => pol.ruidoMul() * aud.ruidoMul(), // o trovão e o granizo mascaram seus passos (src/estrada-audio.js)
    inicioCapitulo(cap) { if (cap === 1) A.carregarMapa('terreo', 'inicio'); },
    cena: ex.cena
  };
}
function addColliderSafe(A, x0, x1, z0, z1) { A.addCollider(x0, x1, z0, z1); }

// =====================================================================
// CARGA SOB DEMANDA (leveza): só a estrada (prólogo) vem junto com o jogo. O internato (térreo e andar de cima) e o subsolo
// (túneis e cemitério) são módulos à parte, baixados e compilados quando o jogador se aproxima deles (o motor avisa com
// precarregarProximo) ou, no limite, na hora de entrar (com tela de carregando). Quem usa MAPAS[id] continua igual.
// =====================================================================
const REAL = { estrada };
const GRUPO = { terreo: 'internato', superior: 'internato', tuneis: 'subsolo', cemiterio: 'subsolo' };
const pend = {};
export function carregarGrupo(g) {
  if (!pend[g]) {
    pend[g] = (g === 'internato' ? import('./mapas-internato.js').then(m => Object.assign(REAL, m.MAPAS_INTERNATO)) : import('./mapas-subsolo.js').then(m => Object.assign(REAL, m.MAPAS_SUBSOLO)))
      .catch(e => { delete pend[g]; throw e; });
  }
  return pend[g];
}
export const mapaPronto = id => !!REAL[id];
export const garantirMapa = id => REAL[id] ? Promise.resolve() : carregarGrupo(GRUPO[id]);
const adiado = id => (A, S) => { if (!REAL[id]) throw new Error('mapa ' + id + ' ainda não carregado'); return REAL[id](A, S); };
export const MAPAS = { estrada, terreo: adiado('terreo'), superior: adiado('superior'), tuneis: adiado('tuneis'), cemiterio: adiado('cemiterio') };
