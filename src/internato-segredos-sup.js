// INTERNATO — SEGREDOS DO ANDAR DE CIMA (Lote 4). Chamado por superior() em mapas.js depois do polimento.
// Estrelas no teto, o Dormitório F que só abre de costas, o forro, a calha de roupa suja, o quartinho gradeado,
// o andar zero do monta-cargas, a caixa de luzes do diretor e a boneca que aponta o que falta achar.
// As salas escondidas ficam fora da planta e só entram em W.salas enquanto a Lia está dentro (ver salaOculta).
import { base, SG4_S, medalha, montar, nomeJogador } from './internato-segredos.js';

export function segredosSuperior(A, S, ctx = {}) {
  const U = base(A, S, 'internato-segredos-sup'), { THREE } = U, { MAT, box, cyl, plano } = A;
  const ganchos = { sync: [], entrar: [] };
  const ALVOS = {}; // onde fica cada segredo do andar (a boneca do Dormitório D aponta para o mais perto que falta)
  medalha(A, S, U);
  const dentro = (r, x, z) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;

  // ---------------- 1. ESTRELAS NO TETO DO DORMITÓRIO B: carregam com a lanterna e, no escuro, apontam um armário
  {
    const X0 = -10.6, X1 = -4.8, Z0 = -23.6, Z1 = -16.4, W = X1 - X0, D = Z1 - Z0;
    const estrela = (g, x, y, r) => { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); };
    const te = U.tela(256, 320, (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(210,255,200,1)';
      for (let i = 0; i < 46; i++) estrela(g, 12 + Math.random() * (w - 24), 12 + Math.random() * (h - 24), 2.5 + Math.random() * 3);
      // a seta (feita de estrelas) aponta para o canto do armário, e um armário desenhado com estrelinhas
      for (let i = 0; i < 9; i++) estrela(g, 60 + i * 15, 120 + i * 17, 5.5);
      for (const [x, y] of [[188, 254], [200, 262], [176, 266], [192, 238], [168, 250]]) estrela(g, x, y, 6);
      g.strokeStyle = 'rgba(210,255,200,1)'; g.lineWidth = 3; g.strokeRect(214, 268, 26, 44); g.beginPath(); g.moveTo(227, 270); g.lineTo(227, 310); g.stroke();
      for (let i = 0; i < 5; i++) estrela(g, 218 + (i % 2) * 18, 272 + i * 9, 3);
    });
    const mE = new THREE.MeshBasicMaterial({ map: te, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xb8ffb0 });
    const teto = plano(W, D, mE, (X0 + X1) / 2, 3.17, (Z0 + Z1) / 2, 0); teto.rotation.x = Math.PI / 2;
    let carga = 0, avisou = false, viu = !!S.flags.sg4_estrelasViu;
    const topo = U.caixaInvisivel(.7, .22, .7, -3.48, 2.16, -25.2);
    A.interact(topo, () => S.flags.sg4_estrelas ? 'Em cima do armário, só a fita crepe que segurava o bilhete.' : viu ? '<b>E</b>Tatear em cima do armário que as estrelas apontam' : '', () => {
      if (S.flags.sg4_estrelas || !viu) return;
      S.flags.sg4_estrelas = true; S.inv.pilhas++; A.SFX.pegar(); U.SOM.pano({ x: -3.5, y: 2.1, z: -25.2 }, .05);
      U.achou('estrelas', 'Em cima do armário: uma pilha e um bilhete do Davi'); A.lerNota('sg4_estrelas');
    });
    ALVOS.estrelas = [-3.5, -25.2];
    U.tick(dt => {
      const aqui = U.sala() === 'dormB';
      if (aqui && S.flashOn && U.dirY() > .5) { carga = Math.min(1, carga + dt / 5); if (carga >= 1 && !avisou) { avisou = true; U.leg('as estrelinhas do teto guardaram a luz da lanterna', false); } }
      else if (!S.flashOn) carga = Math.max(0, carga - dt / 20);
      const alvo = S.flashOn ? .1 + carga * .12 : carga * .95;
      mE.opacity += (alvo - mE.opacity) * Math.min(1, dt * 3);
      if (!viu && aqui && !S.flashOn && carga > .55 && U.dirY() > .35) {
        viu = true; S.flags.sg4_estrelasViu = true; A.conquista('l4_ceu');
        A.sub('lia', '(sussurro) Estrelas de colar... uma seta. E um armário. Ele fez um mapa no teto.');
      }
    });
  }

  // ---------------- 2. O DORMITÓRIO F: uma porta de giz que só abre para quem chega de costas
  {
    const GX = -2.885, GZ = -50.6;
    const F = U.salaOculta('dormF', 'Dormitório F', 18, 22.5, -47, -41, 3.2, { luzCor: 0xffb870 });
    let usado = !!S.flags.sg4_F, emF = false, avisoT = 0, abrindo = false;
    const desenharPorta = (g, w, h) => {
      g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(230,230,215,.85)'; g.fillStyle = 'rgba(230,230,215,.85)'; g.lineWidth = 4; g.lineCap = 'round';
      if (!usado) {
        g.beginPath(); g.moveTo(14, h - 6); g.lineTo(12, 40); g.quadraticCurveTo(w / 2, 6, w - 12, 40); g.lineTo(w - 14, h - 6); g.stroke();
        g.beginPath(); g.arc(w - 30, h * .55, 6, 0, 7); g.fill();
        g.font = 'bold 44px Georgia'; g.textAlign = 'center'; g.fillText('F', w / 2, 110);
        g.font = '15px "Comic Sans MS", Georgia'; g.fillText('NÃO OLHA', w / 2, 170); g.fillText('PRA ELA', w / 2, 190);
      } else {
        g.font = 'bold 44px Georgia'; g.textAlign = 'center'; g.fillText('F', w / 2, 110); g.lineWidth = 6; g.beginPath(); g.moveTo(30, 70); g.lineTo(w - 30, 120); g.stroke();
        g.font = '22px "Comic Sans MS", Georgia'; g.fillText('Nº 0', w / 2, 170);
      }
    };
    const tp = U.tela(128, 256, desenharPorta);
    const giz = plano(1.0, 2.05, new THREE.MeshBasicMaterial({ map: tp, transparent: true, depthWrite: false, opacity: .8 }), GX, 1.05, GZ, Math.PI / 2);
    A.interact(giz, () => usado ? 'Um "F" riscado a giz e, embaixo, "Nº 0". A parede é só parede.' : 'Uma porta desenhada a giz na parede. Letra de criança: "NÃO OLHA PRA ELA". Quem chega olhando, só vê giz.', () => {});
    ALVOS.dormF = [GX, GZ];
    // mobília do dormitório que não existe: uma cama só, arrumada, com o seu nome
    const cx = 20.25, cz = -45.6;
    const nome = (nomeJogador() || 'Lia Moraes').toUpperCase();
    box(2, .12, .95, MAT.ferrugem, cx, .42, cz); box(1.9, .14, .9, MAT.colchao, cx, .55, cz); box(1.3, .04, .92, MAT.lencol, cx + .3, .64, cz);
    box(.06, .95, .95, MAT.ferrugem, cx - 1, .47, cz);
    for (const [dx, dz] of [[-.95, -.43], [.95, -.43], [-.95, .43], [.95, .43]]) box(.05, .42, .05, MAT.ferrugem, cx + dx, .21, cz + dz, A.W.grupo, false);
    const tTrav = U.tela(128, 64, (g, w, h) => { g.fillStyle = '#e8e0cc'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,30,40,.9)'; g.font = 'italic bold 16px Georgia'; g.textAlign = 'center'; g.fillText(nome.slice(0, 14), w / 2, 30); g.font = 'italic 13px Georgia'; g.fillText('— 1979 —', w / 2, 50); });
    const trav = box(.45, .12, .7, new THREE.MeshStandardMaterial({ map: tTrav, roughness: 1, emissive: 0x2a2418, emissiveIntensity: .5 }), cx - .65, .69, cz);
    box(.35, .06, .3, new THREE.MeshStandardMaterial({ color: 0x2a3a5a, roughness: 1 }), cx + .7, .69, cz); // uniforme dobrado
    A.addCollider(cx - 1.03, cx + 1.03, cz - .5, cz + .5);
    const tPl = U.tela(128, 40, (g, w, h) => { g.fillStyle = '#b89a50'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a1a08'; g.font = 'bold 14px Georgia'; g.textAlign = 'center'; g.fillText(nome.slice(0, 16), w / 2, 26); });
    plano(.36, .11, new THREE.MeshStandardMaterial({ map: tPl, metalness: .5, roughness: .4 }), cx - 1.035, .82, cz, -Math.PI / 2);
    // castiçal aceso na mesinha (só a chama: a luz quente vem da sala)
    box(.4, .5, .4, MAT.madeiraEsc, 22.0, .25, -46.5); cyl(.03, .03, .22, MAT.vela, 22.0, .61, -46.5, 8);
    const chama = new THREE.Mesh(new THREE.SphereGeometry(.018, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffc060 })); chama.scale.y = 2.3; chama.position.set(22.0, .76, -46.5); A.W.grupo.add(chama);
    const itCama = A.interact(trav, () => S.flags.sg4_Fdormiu ? 'A cama com o seu nome. Ainda quente.' : '<b>E</b>Deitar na cama com o seu nome', () => {
      if (S.flags.sg4_Fdormiu) return;
      S.flags.sg4_Fdormiu = true; U.escurecer(6500, 1); U.SOM.pano({ x: cx, y: .7, z: cz }, .05, .8);
      U.depois(1, () => A.sub('davi', '(no sonho, bem perto) Lia. Acorda. Vamos brincar antes do sino.'));
      U.depois(3.5, () => A.sub('davi', '(no sonho) Eu guardei a sua cama. Todo mundo disse que você não ia vir.'));
      U.depois(6.4, () => { S.health = 100; S.fear = 0; A.toast('Você acordou com a vida cheia.'); A.sub('lia', '...eu dormi. Aqui dentro. Eu dormi.'); A.conquista('l4_vaga'); U.achou('dormF', 'Você dormiu na vaga que era sua'); });
    });
    itCama.hold = 2; itCama.pode = () => !S.flags.sg4_Fdormiu;
    const pilhaF = A.MK.pilha(); pilhaF.position.set(cx - .55, .76, cz + .3); A.W.grupo.add(pilhaF);
    pilhaF.visible = !S.flags.sg4_Fpilha;
    A.interact(pilhaF, () => '<b>E</b>Pegar a pilha embaixo do travesseiro', () => { if (S.flags.sg4_Fpilha) return; S.flags.sg4_Fpilha = true; pilhaF.visible = false; S.inv.pilhas++; A.SFX.pegar(); }, { on: () => pilhaF.visible });
    // a porta de saída (do lado de dentro ela é de madeira)
    const saida = box(1.2, 2.2, .06, MAT.porta, cx, 1.1, -41.13);
    A.interact(saida, () => '<b>E</b>Sair do Dormitório F', () => {
      emF = false; F.sair(); usado = true; S.flags.sg4_F = true; tp.redesenhar(desenharPorta);
      U.SOM.rangido({ x: GX, y: 1, z: GZ }, .06, .8);
      U.atravessar(-1.7, GZ, -Math.PI / 2, () => { U.leg('a porta de giz vira parede atrás de você'); U.depois(1.2, () => A.sub('lia', '(sussurro) Sumiu. Como se nunca tivesse tido porta.')); });
    });
    const entrarF = () => { emF = true; F.entrar(); F.luz.intensity = 1.5; };
    U.tick(dt => {
      chama.scale.y = 2.3 + Math.sin(A.perf() * 7) * .3;
      const px = A.P.pos.x, pz = A.P.pos.z;
      if (dentro(F.r, px, pz)) { if (!emF) entrarF(); return; }
      if (usado || abrindo || S.chapter < 3 || S.hidden) return;
      const d = U.dist(GX + .5, GZ);
      if (d > 1.6) return;
      const j = U.J(), k = j ? j.keys : {};
      const deFrente = U.olhando(GX, 1.2, GZ, .3, 3);
      if (deFrente) { avisoT += dt; if (avisoT > 2 && !S.flags.sg4_Faviso) { S.flags.sg4_Faviso = true; A.sub('lia', '(sussurro) "Não olha pra ela." ...as crianças entravam de costas?'); } return; }
      // só de costas e de propósito: segurando Q (olhar para trás). Andar para trás (S) não teleporta por acidente.
      if (d < 1.3 && (k.KeyQ || (A.P.olhar || 0) > .55) && Math.hypot(A.P.vx || 0, A.P.vz || 0) < 1.2) {
        if (U.ameaca()) return;
        abrindo = true; U.SOM.rangido({ x: GX, y: 1, z: GZ }, .07, .9, 200); U.leg('uma maçaneta range atrás de você'); U.medo(10);
        U.depois(.9, () => U.atravessar(cx, -42, 0, () => { abrindo = false; entrarF(); U.leg('silêncio; nem a chuva'); A.sub('lia', '(bem baixinho) Um dormitório... arrumado. Como se fosse ontem. Uma cama só.'); }, 900));
      }
    });
  }

  // ---------------- 3. A LOUSA DA SALA DE BRINQUEDOS responde ao jogo da velha lá de baixo
  {
    const nome = (nomeJogador() || 'LIA').toUpperCase();
    const tl = U.tela(256, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(225,225,210,.85)'; g.textAlign = 'center'; g.font = '30px "Comic Sans MS", Georgia'; g.fillText(nome.slice(0, 12), w / 2, 46); g.font = '22px "Comic Sans MS", Georgia'; g.fillText('DAVI. VOCÊ DEMOROU.', w / 2, 96); });
    const resp = plano(1.4, .7, new THREE.MeshBasicMaterial({ map: tl, transparent: true, depthWrite: false }), 7.6, 2.05, -24.11, Math.PI);
    resp.visible = !!S.flags.sg4_velhaJogou;
    resp.userData.leitura = { t: `Escrito a giz, em duas letras diferentes: "${nome}" e, embaixo, "DAVI. VOCÊ DEMOROU."` };
    U.tick(() => { if (resp.visible && !S.flags.sg4_lousaViu && U.sala() === 'brinq' && U.olhando(7.6, 2.05, -24.11, .85, 9)) { S.flags.sg4_lousaViu = true; A.sub('lia', '(sussurro) Ele respondeu. Do jogo da velha lá de baixo até aqui em cima.'); } });
  }

  // ---------------- 4. A BOLINHA DE GUDE e a tábua solta do corredor (álbum de figurinhas do clube)
  {
    const BX = .9, Z0 = -22.5, ZF = -29.7, TZ = -30.35;
    const bola = new THREE.Mesh(new THREE.SphereGeometry(.024, 10, 8), new THREE.MeshStandardMaterial({ color: 0x3060c0, roughness: .05, metalness: .2, emissive: 0x102050, emissiveIntensity: .9, transparent: true, opacity: .9 }));
    bola.position.set(BX, .024, S.flags.sg4_gudeRolou ? ZF : Z0); bola.visible = !!S.flags.sg4_gudeRolou && !S.flags.sg4_gude; A.W.grupo.add(bola);
    const tab = plano(.24, 1.1, new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: .9 }), BX, .006, TZ, 0); tab.rotation.x = -Math.PI / 2;
    let rolando = false, somT = 0;
    A.interact(tab, () => S.flags.sg4_gude ? 'A tábua solta. O vão embaixo está vazio.' : A.P.crouch ? '<b>E</b>Soltar a tábua onde a bolinha parou' : 'Uma tábua do assoalho mais escura que as outras.', () => {
      if (S.flags.sg4_gude) return;
      if (!A.P.crouch) { A.toast('Agache para soltar a tábua.'); return; }
      S.flags.sg4_gude = true; tab.position.y = .04; tab.rotation.x = -1.3; bola.visible = false; U.SOM.rangido({ x: BX, y: .1, z: TZ }, .05, .4, 300); A.emitNoise(BX, TZ, 3, true);
      U.achou('gude', 'Embaixo da tábua, o álbum de figurinhas do clube'); A.lerNota('sg4_gude');
    });
    ALVOS.gude = [BX, TZ];
    U.tick(dt => {
      if (!rolando && !S.flags.sg4_gudeRolou && S.chapter >= 3 && U.sala() === 'corr' && A.P.pos.z < -19 && A.P.pos.z > -26) { rolando = true; S.flags.sg4_gudeRolou = true; bola.visible = true; bola.position.z = Z0; U.leg('uma bolinha de gude rola sozinha pelo corredor'); }
      if (!rolando) return;
      bola.position.z -= dt * 1.5; bola.rotation.x -= dt * 60;
      somT -= dt; if (somT <= 0) { somT = .16; U.SOM.vidro({ x: BX, y: .05, z: bola.position.z }, .02); }
      if (bola.position.z <= ZF) { bola.position.z = ZF; rolando = false; U.SOM.vidro({ x: BX, y: .05, z: ZF }, .05); U.leg('a bolinha para diante de uma tábua'); }
    });
  }

  // ---------------- 5. AS DESCARGAS DO BANHEIRO: puxar uma faz todas responderem
  {
    const CX = -10.7, CZ = -35.82;
    cyl(.006, .006, .7, MAT.metal, CX, 2.25, CZ, 4);
    const pux = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), new THREE.MeshStandardMaterial({ color: 0xd8d0c0, roughness: .4, emissive: 0x2a2620, emissiveIntensity: .5 })); pux.position.set(CX, 1.88, CZ); A.W.grupo.add(pux);
    box(.5, .3, .2, MAT.branco, CX, 2.6, CZ - .02, A.W.grupo, false);
    A.interact(pux, () => S.flags.sg4_descarga ? 'A corrente da descarga. Melhor não.' : '<b>E</b>Puxar a corrente da descarga', () => {
      if (S.flags.sg4_descarga) return;
      S.flags.sg4_descarga = true; U.SOM.agua({ x: CX, y: .5, z: CZ }, .2, 1.8); A.emitNoise(CX, CZ, 6, true); U.leg('uma descarga');
      const xs = [-12.1, -9.3, -7.9, -6.5];
      U.depois(9, () => {
        xs.forEach((x, i) => U.depois(i * .9, () => U.SOM.agua({ x, y: .5, z: -35.3 }, .26, 1.6, 800 + i * 60)));
        U.depois(.2, () => U.leg('todas as descargas respondem, em fila'));
        U.depois(xs.length * .9, () => { A.emitNoise(-6.5, -33, 22, true); U.medo(12); A.sub('lia', 'Pra que eu fui mexer.'); A.conquista('l4_descarga'); U.achou('descargas', 'As descargas do andar responderam todas'); });
      });
    });
    ALVOS.descargas = [CX, CZ];
  }

  // ---------------- 6. O FORRO DO DORMITÓRIO C: o esconderijo dos três, onde adulto não sobe
  {
    const AX = -8, AZ = -42;
    const Fo = U.salaOculta('forro', 'Forro', 18, 22, -38.5, -34.5, 1.35, { luzCor: 0xffa860 });
    box(1.0, .04, .8, MAT.madeiraEsc, AX, 3.17, AZ, A.W.grupo, false);
    const tD = U.tela(64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(230,230,215,.9)'; g.lineWidth = 5; g.beginPath(); g.moveTo(20, 12); g.lineTo(20, 52); g.quadraticCurveTo(54, 50, 50, 32); g.quadraticCurveTo(48, 12, 20, 12); g.stroke(); });
    const mD = new THREE.MeshBasicMaterial({ map: tD, transparent: true, opacity: 0, depthWrite: false });
    const marca = plano(.3, .3, mD, AX, 3.145, AZ, 0); marca.rotation.x = Math.PI / 2;
    const escada = new THREE.Group(); escada.position.set(AX, 0, AZ + .2); escada.visible = false; A.W.grupo.add(escada);
    for (const s of [-1, 1]) box(.04, 3.1, .04, MAT.madeira, s * .22, 1.55, 0, escada, false);
    for (let i = 0; i < 8; i++) box(.44, .03, .04, MAT.madeira, 0, .35 + i * .37, 0, escada, false);
    let dT = 0, viuD = !!S.flags.sg4_forroD, emFo = false;
    const alc = U.caixaInvisivel(1, .3, .8, AX, 2.95, AZ);
    A.interact(alc, () => S.flags.sg4_forroUsado ? 'O alçapão do teto emperrou lá em cima.' : viuD ? '<b>E</b>Puxar a escadinha do alçapão' : '', () => {
      if (S.flags.sg4_forroUsado || !viuD || emFo) return;
      if (U.ameaca()) { A.toast('Agora não. Ele ia ouvir a escada.'); return; }
      escada.visible = true; U.SOM.rangido({ x: AX, y: 2.8, z: AZ }, .06, .9, 260); A.emitNoise(AX, AZ, 4, true);
      U.atravessar(20, -35.3, 0, () => { emFo = true; Fo.entrar(); Fo.luz.intensity = .9; A.P.crouch = true; U.leg('telhas e chuva bem em cima da cabeça'); A.sub('lia', '(sussurro) A cabana deles. Aqui ele não sobe.'); }, 900);
    });
    ALVOS.forro = [AX, AZ];
    // dentro do forro: a cabaninha de lençol, o placar e a lata de biscoito
    for (const [x, z, ry] of [[19.2, -37.4, .3], [20.6, -37.8, -.2]]) { const l = box(1.2, .9, .03, MAT.lencol, x, .45, z, A.W.grupo, false); l.rotation.y = ry; l.rotation.x = .25; }
    const tPl = U.tela(256, 96, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(230,230,215,.85)'; g.font = '20px "Comic Sans MS", Georgia'; g.fillText('DAVI 12', 10, 30); g.fillText('TOMÉ 9', 10, 58); g.fillText('ANA 30 (roubou)', 10, 86); g.font = 'bold 26px Georgia'; g.fillText('PROIBIDO ADULTO', 110, 46); });
    const placar = plano(1.1, .42, new THREE.MeshBasicMaterial({ map: tPl, transparent: true, depthWrite: false }), 21.89, .7, -36.4, -Math.PI / 2);
    placar.userData.leitura = { t: 'Riscado a giz: "DAVI 12 · TOMÉ 9 · ANA 30 (roubou)". E, maior: "PROIBIDO ADULTO".' };
    const lata = cyl(.12, .12, .14, new THREE.MeshStandardMaterial({ color: 0x8a2a20, metalness: .5, roughness: .4, emissive: 0x200806, emissiveIntensity: .7 }), 19.6, .07, -36.6, 12);
    A.interact(lata, () => S.flags.sg4_forro ? 'A lata de biscoito do clube. Vazia.' : '<b>E</b>Abrir a lata de biscoito do clube', () => {
      if (S.flags.sg4_forro) return;
      S.flags.sg4_forro = true; S.inv.pilhas++; S.inv.kits++; A.SFX.pegar(); U.SOM.tique({ x: 19.6, y: .1, z: -36.6 }, .08);
      A.conquista('l4_forro'); U.achou('forro', 'A lata do clube: uma pilha e um curativo'); A.lerNota('sg4_forro');
    });
    const buraco = plano(.8, .7, new THREE.MeshBasicMaterial({ color: 0x050403 }), 20, .012, -34.95, 0); buraco.rotation.x = -Math.PI / 2;
    const desce = U.caixaInvisivel(.8, .3, .7, 20, .15, -34.95);
    A.interact(desce, () => '<b>E</b>Descer a escadinha (ela range)', () => {
      emFo = false; Fo.sair(); S.flags.sg4_forroUsado = true;
      U.atravessar(AX, AZ + .9, Math.PI, () => {
        U.SOM.rangido({ x: AX, y: 2, z: AZ }, .12, 1.3, 180); A.emitNoise(AX, AZ, 14, true); U.leg('a escadinha range alto');
        U.depois(.6, () => { escada.visible = false; U.SOM.baque({ x: AX, y: 3, z: AZ }, .25); });
        U.depois(1.2, () => A.sub('lia', 'Ele ouviu. Vai vir conferir. Sai daqui.'));
      }, 800);
    });
    void buraco;
    U.tick(dt => {
      if (dentro(Fo.r, A.P.pos.x, A.P.pos.z)) { if (!emFo) { emFo = true; Fo.entrar(); Fo.luz.intensity = .9; } A.P.crouch = true; return; }
      if (viuD || U.sala() !== 'dormC') return;
      const mira = S.flashOn && U.dirY() > .55 && U.olhando(AX, 3.15, AZ, .93, 4.5);
      dT = mira ? dT + dt : Math.max(0, dT - dt);
      mD.opacity = Math.min(1, dT / 2) * .9;
      if (dT >= 2) { viuD = true; S.flags.sg4_forroD = true; A.sub('lia', '(sussurro) Um "D" no alçapão do teto. De Davi.'); }
    });
    if (viuD) mD.opacity = .9;
  }

  // ---------------- 7. A CALHA DE ROUPA SUJA (rouparia → depósito): só cabe agachada e com a lanterna apagada
  {
    const PX = 5.6, PZ = -11.9;
    const port = box(.62, .5, .04, MAT.metal, PX, .55, PZ);
    box(.1, .03, .03, MAT.bronze, PX + .2, .55, PZ + .03, A.W.grupo, false);
    const tl = U.tela(128, 32, (g, w, h) => { g.fillStyle = '#3a3a34'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8cba8'; g.font = 'bold 13px Georgia'; g.textAlign = 'center'; g.fillText('ROUPA SUJA', w / 2, 21); });
    plano(.3, .075, new THREE.MeshBasicMaterial({ map: tl }), PX, .88, PZ + .025, 0);
    // o monte de lençóis lá embaixo, no depósito
    for (let i = 0; i < 4; i++) { const l = box(.9 - i * .1, .1, .8 - i * .08, MAT.lencol, 8.6 + (Math.random() - .5) * .2, .05 + i * .09, -52.3 + (Math.random() - .5) * .2, A.W.grupo, false); l.rotation.y = Math.random(); }
    A.interact(port, () => {
      if (S.flags.sg4_calha) return 'A portinhola da calha emperrou depois que você desceu.';
      if (!A.P.crouch) return 'A portinhola da calha de roupa suja. Só cabe agachada.';
      if (S.flashOn) return 'Com a lanterna acesa na mão você não cabe. Apague a lanterna.';
      return '<b>E</b>Entrar na calha de roupa suja';
    }, () => {
      if (S.flags.sg4_calha || !A.P.crouch || S.flashOn) return;
      S.flags.sg4_calha = true; U.SOM.rangido({ x: PX, y: .5, z: PZ }, .05, .4, 330);
      U.SOM.pano({ x: PX, y: .3, z: PZ }, .08, 1.8); U.leg('escorregando no escuro, pano raspando nas paredes da calha'); U.escurecer(2400, 1);
      U.atravessar(8.6, -51.4, 0, () => {
        A.P.crouch = true; U.SOM.baque({ x: 8.6, y: .3, z: -52.3 }, .12); U.SOM.pano({ x: 8.6, y: .3, z: -52.3 }, .06);
        A.toast('Você caiu num monte de lençóis, no depósito.'); U.depois(1, () => A.sub('lia', '(sussurro) Ninguém procura numa calha de roupa.'));
        U.achou('calha', 'A calha de roupa suja desce direto ao depósito');
      }, 1600);
    });
    ALVOS.calha = [PX, PZ];
  }

  // ---------------- 8. O QUARTINHO GRADEADO DO PATAMAR e o interruptor sem placa
  {
    const IX = -4.92, IY = 1.3, IZ = 2.85;
    box(.04, .12, .08, MAT.branco, IX, IY, IZ, A.W.grupo, false);
    const tecla = box(.03, .05, .03, MAT.preto, IX + .02, IY, IZ, A.W.grupo, false);
    const bulbo = new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6), new THREE.MeshStandardMaterial({ color: 0x332e25, emissive: 0xffc070, emissiveIntensity: 0 })); bulbo.position.set(-6.6, 2.6, 2.0); A.W.grupo.add(bulbo);
    box(.01, .5, .01, MAT.preto, -6.6, 2.95, 2.0, A.W.grupo, false);
    const luz = new THREE.PointLight(0xffc98a, 0, 5.5, 1.3); luz.position.set(-6.6, 2.5, 2.0); A.W.grupo.add(luz);
    const fig = (ctx.vulto ? ctx.vulto(A) : new THREE.Group()); fig.scale.setScalar(.66); fig.visible = false;
    const POS = [[-7.55, 3.15], [-6.0, 2.1]];
    let n = S.flags.sg4_celaN || 0, ligada = false, morta = n >= 3;
    const pos = k => { const [x, z] = POS[k]; fig.position.set(x, 0, z); fig.rotation.y = Math.atan2(-8 - x, 3.5 - z); };
    A.interact(tecla, () => morta ? 'O interruptor não faz mais nada. Ainda bem.' : `<b>E</b>${ligada ? 'Desligar' : 'Apertar'} o interruptor sem placa`, () => {
      if (morta) return;
      U.SOM.clique({ x: IX, y: IY, z: IZ }, .12);
      if (!S.flags.energia) { A.toast('Nada acontece. Sem energia.'); return; }
      ligada = !ligada; tecla.rotation.z = ligada ? .4 : 0;
      if (!ligada) { luz.intensity = 0; bulbo.material.emissiveIntensity = 0; fig.visible = false; return; }
      n++; S.flags.sg4_celaN = n; luz.intensity = 1.6; bulbo.material.emissiveIntensity = 2;
      if (n === 1) { pos(0); fig.visible = true; U.leg('uma lâmpada acende atrás da grade'); U.depois(.8, () => A.sub('lia', '(bem baixinho) ...tem alguém lá dentro. De pé. Virada pro canto.')); U.medo(10); U.achou('cela', 'O interruptor acende o quartinho gradeado'); }
      else if (n === 2) { pos(1); fig.visible = true; U.medo(15); U.depois(.7, () => A.sub('lia', '(sussurro) Ela chegou mais perto. Eu não vou ligar de novo. Não vou.')); }
      else {
        fig.visible = false; morta = true; U.medo(25); U.tremor(.08);
        U.depois(.7, () => { A.sub('voz', '(atrás de você, no seu ouvido) Eu disse pra não ligar de novo.'); U.leg('um sussurro bem atrás da sua nuca'); });
        U.depois(1.6, () => { luz.intensity = 0; bulbo.material.emissiveIntensity = 0; ligada = false; U.SOM.vidro({ x: -6.6, y: 2.6, z: 2 }, .1); U.leg('a lâmpada do quartinho estoura'); });
      }
    });
    ALVOS.cela = [IX, IZ];
    U.tick(() => {
      if (n === 2 && !morta && !S.flags.sg4_celaConq && ['corr', 'roup'].includes(U.sala())) { S.flags.sg4_celaConq = true; A.conquista('l4_cela'); A.sub('lia', '(sussurro) Parei na segunda. Tem coisa que não é pra ver três vezes.'); }
    });
    ganchos.sync.push(() => { if (!S.flags.energia && ligada) { ligada = false; luz.intensity = 0; bulbo.material.emissiveIntensity = 0; fig.visible = false; } });
  }

  // ---------------- 9. O ANDAR ZERO: o botão raspado do monta-cargas para numa copa de 1979
  {
    const KX = 12.885, KY = 1.35, KZ = -53.4;
    let raspado = !!S.flags.sg4_zeroRaspado, armado = !!S.flags.sg4_zeroArmado, emCopa = false, copaT = 0, virou = false;
    const desenhar = (g, w, h) => {
      g.fillStyle = '#7a6430'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3a2a10'; g.lineWidth = 4; g.strokeRect(3, 3, w - 6, h - 6);
      g.fillStyle = '#d8cba8'; g.font = 'bold 18px Georgia'; g.textAlign = 'center';
      const bot = (y, txt, apertado) => { g.fillStyle = apertado ? '#3a1a08' : '#1a1208'; g.beginPath(); g.arc(w / 2, y, 16, 0, 7); g.fill(); g.fillStyle = '#d8cba8'; g.fillText(txt, w / 2, y + 6); };
      bot(36, '1'); bot(84, 'T');
      if (raspado) bot(132, '0', armado); else { g.fillStyle = '#5a4a24'; g.beginPath(); g.ellipse(w / 2, 132, 22, 18, .3, 0, 7); g.fill(); }
    };
    const tk = U.tela(64, 160, desenhar);
    const painel = plano(.2, .5, new THREE.MeshStandardMaterial({ map: tk, metalness: .5, roughness: .45, emissive: 0x1a1408, emissiveIntensity: .5 }), KX, KY, KZ, -Math.PI / 2);
    const itK = A.interact(painel, () => armado ? 'O botão "0" está afundado. O monta-cargas vai parar no caminho.' : raspado ? '<b>E</b>Apertar o botão "0" do monta-cargas' : '<b>E</b>Raspar a tinta do botão sem número', () => {
      if (armado) return;
      if (!raspado) { raspado = true; S.flags.sg4_zeroRaspado = true; tk.redesenhar(desenhar); U.leg('tinta velha raspando'); A.toast('Embaixo da tinta: um botão "0".'); return; }
      armado = true; S.flags.sg4_zeroArmado = true; tk.redesenhar(desenhar); U.SOM.clunk({ x: KX, y: KY, z: KZ }, .25); U.leg('o botão afunda e fica preso');
      A.sub('lia', '(sussurro) "Pro andar de antes." Que andar de antes?');
    });
    U.tick(() => { itK.hold = raspado ? 0 : 2.5; itK.ruido = raspado ? 0 : 2; });
    itK.pode = () => !raspado;
    ALVOS.andar0 = [KX, KZ];
    // a copa de 1979: luz quente, mesa posta, crianças jantando de costas e a Irmã servindo
    const C = U.salaOculta('copa79', 'Copa — 1979', 18, 24.5, -30, -23, 3.0, { piso: 'ladrilho', parede: 'azulejo', luzCor: 0xffc070 });
    box(3.4, .08, 1.1, MAT.madeira, 21.25, .76, -27); for (const [dx, dz] of [[-1.6, -.5], [1.6, -.5], [-1.6, .5], [1.6, .5]]) box(.06, .76, .06, MAT.madeiraEsc, 21.25 + dx, .38, -27 + dz, A.W.grupo, false);
    A.addCollider(19.5, 23, -27.6, -26.4);
    const mSil = new THREE.MeshStandardMaterial({ color: 0x0c0a08, roughness: 1, transparent: true, opacity: .82 });
    const kids = [];
    for (let i = 0; i < 6; i++) {
      const lado = i < 3 ? -1 : 1, x = 20.05 + (i % 3) * 1.2, z = -27 + lado * .78;
      const k = new THREE.Group(); k.position.set(x, 0, z); k.rotation.y = lado < 0 ? 0 : Math.PI; A.W.grupo.add(k);
      cyl(.15, .17, .55, mSil, 0, .78, 0, 8, k); const cab = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), mSil); cab.position.y = 1.18; k.add(cab);
      box(.36, .45, .36, MAT.madeiraEsc, 0, .22, lado < 0 ? -.05 : .05, k, false);
      kids.push({ k, cab, base: k.rotation.y });
      const prato = cyl(.12, .12, .015, MAT.branco, x, .81, -27 + lado * .32, 12); void prato;
    }
    const irma = ctx.vulto ? ctx.vulto(A) : new THREE.Group(); irma.scale.setScalar(.6); irma.position.set(23.8, 0, -29.4); irma.rotation.y = Math.PI; irma.visible = true;
    const tG = U.tela(64, 32, (g, w, h) => { g.fillStyle = '#efe8d8'; g.fillRect(0, 0, w, h); g.fillStyle = '#8a1a2a'; g.font = 'italic bold 16px Georgia'; g.textAlign = 'center'; g.fillText('LIA', w / 2, 22); });
    const guard = box(.22, .02, .16, new THREE.MeshStandardMaterial({ map: tG, roughness: 1, emissive: 0x2a2418, emissiveIntensity: .6 }), 21.25, .81, -26.62);
    A.interact(guard, () => S.flags.sg4_andar0 ? 'O guardanapo "LIA". O dente você guardou.' : '<b>E</b>Desdobrar o guardanapo bordado "LIA"', () => {
      if (S.flags.sg4_andar0) return;
      S.flags.sg4_andar0 = true; U.SOM.pano({ x: 21.25, y: .8, z: -26.6 }, .04); A.conquista('l4_andar0'); U.achou('andar0', 'Na copa de 1979, o seu lugar estava posto'); A.lerNota('sg4_andar0');
    });
    const gradeC = box(1.5, 2.3, .05, MAT.ferrugem, 21.25, 1.15, -23.13);
    let origAct = null, termina = null;
    A.interact(gradeC, () => '<b>E</b>Voltar para a caixa do monta-cargas', () => termina && termina());
    const sairCopa = () => { if (!emCopa) return; emCopa = false; C.sair(); if (origAct) origAct.call(ctx.itPoco); };
    termina = sairCopa;
    if (ctx.itPoco) {
      origAct = ctx.itPoco.act;
      ctx.itPoco.act = function (...args) {
        if (armado && !S.flags.sg4_andar0Feito && S.inv.chaves.porao && !emCopa) {
          S.flags.sg4_andar0Feito = true; U.SOM.rangido({ x: 11.6, y: 1.5, z: -56 }, .1, 2, 140); U.tremor(.15);
          A.fade(true, () => {
            A.P.pos.set(21.25, 0, -24.0); A.P.yaw = 0; emCopa = true; copaT = 25; virou = false; C.entrar(); C.luz.intensity = 1.8;
            for (const kk of kids) { kk.k.rotation.y = kk.base; kk.cab.rotation.y = 0; }
            A.fade(false); U.leg('o monta-cargas para entre os andares; um rádio toca baixinho');
            U.depois(1.2, () => A.sub('lia', '(bem baixinho) A copa... em 1979. Ninguém se vira. Não acende a lanterna. Não acende.'));
          }, 900);
          return;
        }
        return origAct.apply(this, args);
      };
    }
    let radioT = 0;
    U.tick(dt => {
      if (!emCopa) { if (dentro(C.r, A.P.pos.x, A.P.pos.z) && !S.flags.sg4_andar0Feito) { /* sem caminho normal até aqui */ } return; }
      copaT -= dt; radioT -= dt;
      if (radioT <= 0) { radioT = 3.2; U.SOM.cantiga({ x: 23, y: 1.5, z: -24 }, .02); if (Math.random() < .5) U.SOM.tique({ x: 21.25, y: .8, z: -27 }, .03); }
      if (S.flashOn && !virou) {
        virou = true; U.medo(30); U.tremor(.12); U.leg('todas as cabeças viram pra você ao mesmo tempo');
        for (const kk of kids) kk.k.rotation.y = Math.atan2(A.P.pos.x - kk.k.position.x, A.P.pos.z - kk.k.position.z);
        U.depois(.8, () => { C.luz.intensity = 0; A.sub('voz', '(todas as vozes juntas) Volta pra cama.'); });
        U.depois(2.2, sairCopa);
        return;
      }
      if (copaT <= 0) { C.luz.intensity = 0; U.leg('a luz cai; a caixa treme e continua descendo'); U.depois(.5, sairCopa); copaT = 99; }
    });
    // se o jogo foi salvo lá dentro, a grade de volta continua funcionando
    U.tick(() => { if (!emCopa && dentro(C.r, A.P.pos.x, A.P.pos.z)) { emCopa = true; copaT = 6; C.entrar(); C.luz.intensity = 1.8; } });
  }

  // ---------------- 10. A CAIXA DE LUZES DO DIRETOR (sala de brinquedos): "para educar a memória"
  {
    const BX = 14.86, BY = 1.3, BZ = -33.5;
    const caixa = box(.1, .6, .8, MAT.madeiraEsc, BX, BY, BZ);
    const tp = U.tela(256, 48, (g, w, h) => { g.fillStyle = '#b89a50'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a1a08'; g.font = 'bold 15px Georgia'; g.textAlign = 'center'; g.fillText('PARA EDUCAR A MEMÓRIA — A.', w / 2, 30); });
    plano(.62, .11, new THREE.MeshStandardMaterial({ map: tp, metalness: .5, roughness: .4 }), BX - .055, BY + .36, BZ, -Math.PI / 2);
    const COR = [[0xff3020, 'vermelha', 330], [0x30ff60, 'verde', 392], [0x3080ff, 'azul', 494], [0xffd030, 'amarela', 587]];
    const luzes = COR.map(([c, nome, f], i) => {
      const m = new THREE.MeshStandardMaterial({ color: 0x222018, emissive: c, emissiveIntensity: .12, roughness: .3 });
      const b = new THREE.Mesh(new THREE.SphereGeometry(.065, 10, 8), m); b.position.set(BX - .06, BY + (i < 2 ? .13 : -.13), BZ + (i % 2 ? .17 : -.17)); A.W.grupo.add(b);
      return { b, m, nome, f, t: 0 };
    });
    let estado = S.flags.sg4_luzes ? 'feito' : 'parado', seq = [], tam = 3, idx = 0;
    const acender = (i, seg = .4) => { luzes[i].t = seg; U.SOM.tom({ x: BX, y: BY, z: BZ }, 'triangle', luzes[i].f, luzes[i].f * .995, seg, .06); };
    const mostrar = () => { estado = 'mostrando'; for (let i = 0; i < tam; i++) U.depois(.5 + i * .62, () => acender(seq[i])); U.depois(.5 + tam * .62, () => { estado = 'esperando'; idx = 0; }); };
    const nova = () => { seq = Array.from({ length: 5 }, () => Math.floor(Math.random() * 4)); tam = 3; };
    A.interact(caixa, () => estado === 'feito' ? 'A caixa de luzes do diretor. O fundo falso está aberto.' : estado === 'parado' ? '<b>E</b>Ligar a caixa de luzes do diretor' : estado === 'esperando' ? 'Repita a sequência apertando as luzes.' : '', () => {
      if (estado !== 'parado') return;
      nova(); U.SOM.clunk({ x: BX, y: BY, z: BZ }, .15); mostrar();
      if (!S.flags.sg4_luzesDica) { S.flags.sg4_luzesDica = true; A.toast('Repita a ordem das luzes. Errar toca uma campainha.'); }
    });
    luzes.forEach((L, i) => A.interact(L.b, () => estado === 'esperando' ? `<b>E</b>Apertar a luz ${L.nome}` : '', () => {
      if (estado !== 'esperando') return;
      acender(i, .25); A.emitNoise(BX, BZ, 1.5, true);
      if (seq[idx] !== i) {
        estado = 'parado'; U.depois(.3, () => { U.SOM.campainha({ x: BX, y: BY, z: BZ }, .16, 1.8); U.leg('uma campainha alta dispara na caixa'); A.emitNoise(BX, BZ, 20, true); });
        U.depois(1.2, () => A.sub('lia', 'Errei. E ele ouviu isso.')); U.medo(12); return;
      }
      idx++;
      if (idx >= tam) {
        if (tam >= 5) {
          estado = 'feito'; S.flags.sg4_luzes = true; caixa.position.x -= .05;
          U.depois(.6, () => { U.SOM.clunk({ x: BX, y: BY - .2, z: BZ }, .2); S.inv.pilhas++; A.SFX.pegar(); A.conquista('l4_luzes'); U.achou('luzes', 'A caixa de luzes abriu o fundo falso'); A.lerNota('sg4_luzes'); });
          return;
        }
        estado = 'mostrando'; tam++; U.depois(.9, mostrar);
      }
    }));
    U.tick(dt => { for (const L of luzes) { if (L.t > 0) L.t -= dt; L.m.emissiveIntensity = L.t > 0 ? 2.6 : estado === 'feito' ? .05 : .12; } });
    ALVOS.luzes = [BX, BZ];
  }

  // ---------------- 11. AS BONECAS DO DORMITÓRIO D: uma vira para onde ainda tem segredo
  {
    A.prop(.5, .35, 1.6, MAT.madeiraEsc, 12.45, .175, -15.2);
    const PORTA = [3, -19.14];
    const bon = [-15.75, -15.2, -14.65].map(z => { const b = A.MK.boneca(); b.position.set(12.45, .35, z); b.rotation.y = Math.atan2(PORTA[0] - 12.45, PORTA[1] - z); A.W.grupo.add(b); return b; });
    const esp = bon[1];
    let virada = false, vistaVirada = false;
    const alvoFalta = () => {
      let melhor = null, dm = 1e9;
      for (const id of SG4_S) { if (id === 'bonecas' || U.tem(id) || !ALVOS[id]) continue; const [x, z] = ALVOS[id], d = Math.hypot(x - esp.position.x, z - esp.position.z); if (d < dm) { dm = d; melhor = [x, z]; } }
      return melhor;
    };
    A.interact(esp, () => virada ? '<b>E</b>Virar a boneca de volta para a porta' : 'Três bonecas de porcelana sentadas no banco, viradas para a porta.', () => {
      if (!virada) return;
      virada = false; vistaVirada = false; esp.rotation.y = Math.atan2(PORTA[0] - esp.position.x, PORTA[1] - esp.position.z); U.SOM.tique(esp.position, .07, true);
      if (U.achou('bonecas', 'A boneca do meio aponta para o que falta achar')) U.depois(.8, () => A.sub('lia', '(sussurro) Ela olha pra onde ainda tem coisa escondida.'));
    });
    let cd = 2;
    U.tick(dt => {
      if (U.dist(12.45, -15.2) > 14) return;
      const vendo = U.olhando(esp.position.x, .6, esp.position.z, .8, 12);
      const alvo = alvoFalta();
      if (!alvo) { // não sobrou nada: as três olham para a Lia quando ela não está vendo
        if (!vendo) for (const b of bon) b.rotation.y = Math.atan2(A.P.pos.x - b.position.x, A.P.pos.z - b.position.z);
        return;
      }
      if (!vendo && !virada) { cd -= dt; if (cd <= 0) { cd = 3; virada = true; esp.rotation.y = Math.atan2(alvo[0] - esp.position.x, alvo[1] - esp.position.z); } }
      if (vendo && virada && !vistaVirada && U.dist(12.45, -15.2) < 7) { vistaVirada = true; U.SOM.tique(esp.position, .05, true); U.leg('um estalo de porcelana'); if (!S.flags.sg4_bonecaFala) { S.flags.sg4_bonecaFala = true; A.sub('lia', '(bem baixinho) Aquela boneca... estava virada pra porta.'); } }
    });
  }

  return montar(ganchos);
}
