// SUSTOS E EVENTOS — Lote 5: MONSTROS
// Comportamentos novos do Inspetor e da Ana, variações por capítulo, aparições mais perturbadoras,
// contra-jogos mais interessantes e momentos de perseguição memoráveis.
// Tudo original (inspiração, não cópia); sem assets externos (modelos clonados, overlays CSS, som procedural).
// Instalado por src/sustos.js (L5 = instalarSustosL5(E, K)); ganchos: update(dt,s), novoMapa(id),
// aoEsconder(L), aoSair(L), aoPasso(), aoRaio(), morte(quem), fareja().
import * as THREE from 'three';

export function instalarSustosL5(E, K) {
  const { R, rand, pick, clamp, lerp, camera, scene, W, P, M, MON, ANA, ANA_G, PROC } = E;
  const S = () => E.S;
  const seguro = K.seguro, depois = K.depois, anima = K.anima, agora = K.agora;
  const { voz, respiracao, passoPos, batida, marcarForte, atras, fwdH, dist2, som, sustoCom, vacuo, apagao, arranhao, rolar } = K;

  const T = {
    dedos_lia: '(prende o ar) Os dedos dele... debaixo da porta.',
    dedos_leg: '[dedos compridos tateiam o chão pela fresta]',
    braco_cama_lia: '(mal respirando) O braço dele. Entrou. Encosta no canto.',
    braco_cama_leg: '[um braço comprido varre o escuro embaixo da cama]',
    parede_lia: '(pensando) Os passos não se afastaram. Ele está do lado do armário.',
    espera_leg: '[silêncio absoluto. nenhum passo se afasta]',
    quase_lia: '(sem ar) A mão dele na porta... não abre, não abre...',
    quase_leg: '[a sombra dos dedos entra pela fresta do armário]',
    saida_lia: 'Os passos sumiram... mas ele não foi embora.',
    saida_leg: '[ele espera parado na única saída]',
    revela_lia: 'Tem... tem alguma coisa saindo do escuro ali na frente.',
    estalo_leg: '[estalo de língua, bem devagar]',
    chamado2_davi: 'Lia...? Lia, vem. Estou aqui.',
    chamado2_leg: '[a mesma voz chama de dois lados ao mesmo tempo]',
    sorriso_leg: '[um rosto sorrindo atrás de você, no vidro]',
    teto_lia: '(olhando pra cima) ...tinha uma sombra no teto. De cabeça pra baixo.',
    teto_leg: '[unhas arranhando a madeira do teto]',
    agarrao_leg: '[mãos na sua cara — e nada]',
    apito_leg: '[um apito rachado responde, muito longe]',
    ana_cama_lia: '(gelada) A Ana. Deitada do outro lado. Estendendo a mão.',
    armario_voz: '(bem do seu lado, contando junto) ...três... quatro...',
    passos_lia: 'Ele para quando eu paro.',
    passos_leg: '[os passos dele imitam o seu compasso]',
    cama_respira_leg: '[o cobertor sobe e desce, como se alguém respirasse]',
    ana_dupla_leg: '[duas meninas contam, uma de cada lado]',
    estica_lia: 'O corredor... ficou comprido. A porta tá fugindo.',
    vela_sopro_lia: 'Não ofega. Se apagar a vela dela, ela te vê.',
    reflexo_frente_leg: '[o reflexo dele está um passo mais perto do que ele]',
    imita_leg: '[o mesmo barulho, agora numa sala distante]',
    morta_lia: '(imóvel, ar preso) Finge que dorme. Finge que dorme.',
    morta_dorme: '(cobrindo você com o lençol) ...dorme.',
    bilhete_leg: '[um bilhete de criança desliza por baixo da porta: "vem"]',
    calmaria_lia: '(desconfiada) Está quieto demais.',
    vidro_mao_leg: '[uma mão marca o vidro embaçado, por dentro]',
    cadeira_leg: '[a cadeira de balanço range sozinha]',
    crianca_corre_leg: '[um vulto pequeno cruza o fundo, rindo]',
    boanoite_insp: 'Boa noite, crianças.',
    boanoite_lia: 'Acabou...? As luzes voltaram.',
    sala_respira_leg: '[as paredes incham e recuam, respirando]',
    impossivel_leg: '[ele está parado onde ninguém deveria caber]',
    pegadas_leg: '[pegadas molhadas surgem atrás de você, sozinhas]',
    diario_lia: '(baixo) A cantiga dele parou. Ele percebeu que eu parei o mundo.',
    reflexo_vira_leg: '[seu reflexo virou a cabeça sozinho]',
    mao_cama_crianca_leg: '[uma mãozinha vem do escuro, ao lado da cama]',
    porta_reabre_leg: '[a porta que você fechou está aberta de novo]',
    sopro_leg: '[um sopro frio na sua nuca]',
    borda_leg: '[uma respiração que não é a sua pulsa na beira da tela]',
    cenario_leg: '[o ar é puxado na direção dele quando ele fareja]',
    vulto_imita_leg: '[o vulto repete o seu último movimento, atrasado]',
    cama_afunda_leg: '[o colchão afunda, como se alguém tivesse deitado]',
    casaco_leg: '[o casaco no cabide inflou devagar, respirando]',
    sapatos_leg: '[nove pares de sapatinhos enfileirados no chão]',
    standoff_leg: '[a maçaneta gira devagar dos dois lados da porta]',
    standoff_lia: '(sussurro) Ele está do outro lado. Esperando eu me mexer.',
    ocupado_rosto_leg: '[o rosto dele já estava dentro do armário]',
    ocupado_rosto_lia: 'ELE ESTAVA AÍ DENTRO. Corre!',
    mao_armario_leg: '[uma mão sai do armário vazio e bate a porta]',
    insp_falso_leg: '[ele não some com a luz. pisque.]',
    maos_cama_tempo_lia: 'Mãos. Vindo do escuro. Não dá pra ficar aqui.',
    manequim_leg: '[um dos manequins não era manequim]',
    ana_lanterna_leg: '[um segundo facho de lanterna, à frente — não é seu]',
    desaba_leg: '[a passagem atrás de você desaba: poeira e estrondo]',
    desaba_lia: 'Não dá pra voltar. Só pra frente.',
    chao_cede_lia: 'O chão! O chão cedeu!',
    corredor_apaga_leg: '[as lâmpadas estouram uma a uma atrás de você]',
    silhueta_lia: 'Essa sou... eu? De costas, com a minha lanterna.',
    silhueta_leg: '[a silhueta vira: é o rosto da venda]',
    caraacara_leg: '[um relâmpago, e o rosto dele preenche o escuro]',
    favorito_leg: '[ele já está no esconderijo que você sempre usa]',
    chamada79_nome: '...Lia Moraes.',
    chamada79_leg: '[a chamada de 1979: a cada nome, uma lápide acende]',
    costas_ana_lia: 'Não vira. Ainda não. Espera o estalo.',
    costas_ana_leg: '[a Ana se aproxima pelas suas costas, rindo baixo]',
    jantar_leg: '[sob o relâmpago, todas as cadeiras estavam ocupadas]',
    cama_davi_lia: 'Tem alguém aqui. Frio. Não dá pra deitar.',
    tropeca_leg: '[uma criança da fila tropeça; a Procissão para]',
    recolhe_insp: '(carregando você) Na cama. Agora.',
    recolhe_leg: '[ele chegou antes. apitou. e recolheu você]',
    castigo_leg: '[a porta do armário do castigo bate três vezes]',
    castigo_resp: '[respiração de menino, lá dentro]',
    lanterna_velha_leg: '[ele segura uma lanterna caída, apontando pro lado errado]',
    teto_vao_leg: '[ele está encarapitado no vão do teto, imóvel]',
    espelhos_ana_leg: '[várias Anas iguais. só uma se mexe quando você não olha]'
  };

  // ------- reduzir movimento / flashes (acessibilidade)
  const menosMov = () => (E.OPT.vCam !== undefined && +E.OPT.vCam === 0) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const semFlash = () => E.OPT.vFlash !== undefined && +E.OPT.vFlash === 1;

  // ------- overlays próprios (ids l5-*, nunca mexem no index.html)
  const css = document.createElement('style');
  css.textContent = `
  .l5{position:fixed;inset:0;pointer-events:none;opacity:0;z-index:40}
  #l5-verm{background:radial-gradient(ellipse 120vw 120vh at 50% 50%,transparent 45%,rgba(90,0,0,.0) 60%);transition:opacity .4s}
  #l5-borda{box-shadow:inset 0 0 28vh 10vh rgba(0,0,0,.7);transition:opacity .25s}
  #l5-sopro{box-shadow:inset 0 0 22vh 6vh rgba(120,150,190,.22);transition:opacity .5s}
  #l5-flash{background:#fff;transition:opacity .22s}
  #l5-estica{backdrop-filter:none;transition:transform 1.1s cubic-bezier(.3,0,.3,1),opacity .6s;transform:scale(1)}
  #l5-maos{opacity:0;transition:opacity .12s}
  #l5-maos i{position:absolute;bottom:-6vh;width:12vw;height:54vh;background:radial-gradient(ellipse 45% 22% at 50% 10%,#b9b2a6,#6f685e 72%,transparent 74%);filter:blur(1px)}
  #l5-maos i:nth-child(1){left:14%;transform:rotate(14deg)}
  #l5-maos i:nth-child(2){right:14%;transform:rotate(-14deg)}
  #l5-boca{opacity:0;transition:opacity .9s}
  #l5-boca i{position:absolute;left:50%;top:50%;width:9vw;height:16vh;transform:translate(-50%,-50%);background:radial-gradient(ellipse 50% 50% at 50% 50%,#000 60%,rgba(0,0,0,.5) 80%,transparent);border-radius:50% 50% 45% 45%}
  `;
  document.head.appendChild(css);
  const mk = (id, html) => { const e = document.createElement('div'); e.id = id; e.className = 'l5'; if (html) e.innerHTML = html; const ref = document.getElementById('fx-locker'); if (ref) ref.before(e); else document.body.appendChild(e); return e; };
  const elVerm = mk('l5-verm'), elBorda = mk('l5-borda'), elSopro = mk('l5-sopro'), elFlash = mk('l5-flash');
  const elMaos = mk('l5-maos', '<i></i><i></i>'), elBoca = mk('l5-boca', '<i></i>');
  const elEstica = mk('l5-estica');
  function flash(ms = 70) { if (semFlash()) return; elFlash.style.transition = 'none'; elFlash.style.opacity = .9; setTimeout(() => { elFlash.style.transition = 'opacity .22s'; elFlash.style.opacity = 0; }, ms); }

  // ------- modelos só visuais (sem IA, sem dano)
  function clone() { const g = MON.g.clone(true); g.visible = false; scene.add(g); return g; }
  // aparência mais perturbadora: os vultos do L5 ganham um par de olhos vermelhos brilhando sob a venda
  function olhosVermelhos(g) { const mat = new THREE.MeshBasicMaterial({ color: 0xff2008 }); for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), mat); o.position.set(s * .12, 3.55, .34); g.add(o); } }
  const VULTO = clone(), TETO = clone(), MANEQ = clone(), FAV = clone();
  [VULTO, TETO, MANEQ, FAV].forEach(olhosVermelhos);
  const ANAX = ANA_G.clone(true); ANAX.visible = false; scene.add(ANAX);
  const ANAY = ANA_G.clone(true); ANAY.visible = false; scene.add(ANAY);
  function maoGrupo() {
    const g = new THREE.Group();
    const pele = new THREE.MeshStandardMaterial({ color: 0xb2aa9c, roughness: .85, emissive: 0x161310, emissiveIntensity: .6 });
    E.cyl(.03, .035, .8, pele, 0, 0, 0, 7, g);
    for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(.018, .22, 3, 6), pele); f.position.set((i - 1.5) * .05, .5, 0); f.rotation.x = .3; g.add(f); }
    g.visible = false; scene.add(g); return g;
  }
  const MAO = maoGrupo();
  const modelos = [VULTO, TETO, MANEQ, FAV, ANAX, ANAY, MAO];
  function esconderTudo() { for (const m of modelos) m.visible = false; }

  // ------- utilidades
  const jogando = () => { const s = S(); return s && !s.dead && P.room && E.mode === 'jogo' && !E.ui; };
  const fear = () => (S() && S().fear) || 0;
  const noite = () => (S() && S().flags && S().flags._noite) || 1;
  function h01(str) { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } h ^= h >>> 13; return ((h >>> 0) % 1000) / 1000; }
  const sementeNoite = (k) => h01(((S() && S().semente) || 'x') + '|' + noite() + '|' + k);
  const aFrente = (m = 3) => { const f = fwdH(); return { x: P.pos.x + f.x * m, y: 0, z: P.pos.z + f.z * m }; };
  const aoLado = (s = 1, m = 1.4) => { const f = fwdH(); return { x: P.pos.x - f.z * s * m, y: 0, z: P.pos.z + f.x * s * m }; };
  const olhaTras = () => { const f = fwdH(); return f.z > .55 && Math.abs(f.x) < .7; };
  function noCampo(pos, alc = 16) { return E.visivel({ x: pos.x, z: pos.z }, 1.3, alc); }
  // quanto o jogador vê o ponto de frente (dot>0.985 = quase no centro da mira)
  function naMira(pos) { const vx = pos.x - camera.position.x, vz = pos.z - camera.position.z, l = Math.hypot(vx, vz) || 1, f = fwdH(); return (f.x * vx + f.z * vz) / l; }

  const D = {
    aluCd: 0, ultAlu: -99, beatCd: 0, breveCd: 0, salaAnt: null, passT: 0, imitaT: 0, pegadasT: 0,
    ocup: null, favSpot: null, usoEscond: {}, diarioAberto: false, standoff: null, raioFase: 0, raioT: 0,
    chao: 0, apagaoFuga: 0, costas: { t: 0, on: false }, maosCamaT: 0, tetoVao: null, bocaT: 0,
    recolheu: false, castigoLocker: null, lanternaVelha: null, deBorda: 0
  };

  // =========================================================== ALUCINAÇÕES AMBIENTE (somem com a luz, sem dano)
  // cada entrada é um susto curto escolhido ao trocar de sala, com orçamento (cooldown) e porta de medo
  function alucPos() { return olhaTras() ? aFrente(rand(6, 9)) : atras(rand(2.2, 3.4)); }
  function revelarModelo(g, pos, { rot = null, dur = 2.2, estalo = false, someLuz = true, aoSumir = null } = {}) {
    g.position.set(pos.x, pos.y || 0, pos.z); if (rot != null) g.rotation.set(0, rot, 0); else g.lookAt(camera.position.x, 0, camera.position.z);
    g.visible = true; marcarForte(); if (estalo) voz(pos, { f0: 180, vogais: [[300, 1200]], dur: .5, vol: .09 });
    let t = 0; anima(g, dt => { t += dt; const perto = someLuz && S().flashOn && naMira(pos) > .96 && noCampo(pos, 12); if (perto || t > dur) { g.visible = false; if (aoSumir) seguro(aoSumir)(); return true; } return false; });
  }
  const ALUC = [
    { id: 'sorriso', min: 55, go: () => { const p = atras(1.2); revelarModelo(ROSTO_por(), { x: p.x, y: 1.4, z: p.z }, { dur: .5, someLuz: false }); E.sub('leg', T.sorriso_leg); flash(50); E.SFX.estatica(.2); } },
    { id: 'anaOlho', min: 35, go: () => { const p = aoLado(pick([-1, 1]), rand(3, 5)); ANAX.position.set(p.x, 0, p.z); ANAX.visible = true; E.sub('leg', '[a Ana parada no limite da sua visão]'); let t = 0; anima(ANAX, dt => { t += dt; if (t > .35) { ANAX.visible = false; return true; } return false; }); } },
    { id: 'estica', min: 50, cond: () => !menosMov() && !P.room.fora, go: () => { E.sub('lia', T.estica_lia); elEstica.style.transition = 'transform 1.1s cubic-bezier(.3,0,.3,1)'; elEstica.style.transform = 'scale(1.5)'; elEstica.style.opacity = 1; E.SFX.zumbidoOuvido && E.SFX.zumbidoOuvido(); depois(1.9, () => { elEstica.style.transform = 'scale(1)'; depois(1.1, () => { elEstica.style.opacity = 0; }); }); } },
    { id: 'salaRespira', min: 45, cond: () => !menosMov() && !P.room.fora, go: () => { E.sub('leg', T.sala_respira_leg); let t = 0; anima({ visible: true }, dt => { t += dt; const k = 1 + Math.sin(t * 2.2) * .04; elEstica.style.transition = 'none'; elEstica.style.transform = 'scale(' + k + ')'; elEstica.style.opacity = .4; if (t > 8) { elEstica.style.transition = 'transform .5s,opacity .5s'; elEstica.style.transform = 'scale(1)'; elEstica.style.opacity = 0; return true; } return false; }); } },
    { id: 'boca', min: 40, cond: () => !P.room.fora, go: () => { E.sub('leg', '[uma mancha de escuro em formato de boca no vão da porta]'); elBoca.style.opacity = 1; respiracao(aFrente(4), 2, true, .4); depois(2.2, () => { if (S() && S().flashOn) E.SFX.estatica(.2); elBoca.style.opacity = 0; }); } },
    { id: 'criancaCorre', min: 25, go: () => { const p = aFrente(rand(9, 13)); CRI().position.set(p.x, 0, p.z); const c = CRI(); c.visible = true; E.SFX.risada(p.x, p.z); E.sub('leg', T.crianca_corre_leg); const dir = pick([-1, 1]); let t = 0; anima(c, dt => { t += dt; c.position.x += dir * dt * 5; if (t > .5) { c.visible = false; return true; } return false; }); } },
    { id: 'eleTeto', min: 60, cond: () => !P.room.fora, go: () => { const p = atras(1.6); TETO.position.set(p.x, 3.1, p.z); TETO.rotation.set(Math.PI, pick([0, Math.PI]), 0); TETO.visible = true; arranhao(p, 1); E.sub('leg', T.teto_leg); depois(.1, () => E.sub('lia', T.teto_lia)); let t = 0; anima(TETO, dt => { t += dt; if (t > 1.2) { TETO.visible = false; TETO.rotation.x = 0; return true; } return false; }); } },
    { id: 'impossivel', min: 50, cond: () => !P.room.fora, go: () => { const p = aoLado(pick([-1, 1]), rand(2, 3.5)); const modo = pick(['parede', 'ponta', 'chao']); VULTO.position.set(p.x, modo === 'chao' ? .3 : modo === 'ponta' ? 2.9 : 1, p.z); VULTO.rotation.set(modo === 'ponta' ? Math.PI : 0, rand(0, 6), 0); VULTO.visible = true; E.sub('leg', T.impossivel_leg); let t = 0; anima(VULTO, dt => { t += dt; const some = S().flashOn && naMira(p) > .97; if (some || t > 1.6) { VULTO.visible = false; VULTO.rotation.set(0, 0, 0); if (some) E.SFX.estalo(p, .7); return true; } return false; }); } },
    { id: 'pegadas', min: 30, cond: () => P.naAgua || P.room.piso === 'terra' || W.mapa === 'tuneis', go: () => { D.pegadasT = 6; E.sub('leg', T.pegadas_leg); } },
    { id: 'reflexoFrente', min: 40, cond: () => temVidro(), go: () => { const p = aFrente(rand(2, 3)); VULTO.position.set(p.x, 0, p.z); VULTO.visible = true; E.sub('leg', T.reflexo_frente_leg); let t = 0; anima(VULTO, dt => { t += dt; if (t > .7) { VULTO.visible = false; return true; } return false; }); } },
    { id: 'vultoImita', min: 45, go: () => { const p = aFrente(rand(8, 12)); VULTO.position.set(p.x, 0, p.z); VULTO.lookAt(camera.position.x, 0, camera.position.z); VULTO.visible = true; E.sub('leg', T.vulto_imita_leg); let t = 0; const y0 = VULTO.position.y; anima(VULTO, dt => { t += dt; VULTO.position.y = y0 + Math.sin(t * 4) * .05; const some = S().flashOn && noCampo(p, 14) && naMira(p) > .95; if (some || t > 2) { VULTO.visible = false; VULTO.position.y = y0; return true; } return false; }); } },
    { id: 'casaco', min: 30, cond: () => !P.room.fora, go: () => { E.sub('leg', T.casaco_leg); } },
    { id: 'cadeira', min: 30, go: () => { E.sub('leg', T.cadeira_leg); const p = aoLado(pick([-1, 1]), 2.5); E.SFX.rangido && E.SFX.rangido(p.x, 1, p.z, .4); } },
    { id: 'camaAfunda', min: 25, cond: () => temCama(), go: () => { E.sub('leg', T.cama_afunda_leg); } },
    { id: 'sapatos', min: 30, cond: () => !P.room.fora && S().chapter >= 1, go: () => { E.sub('leg', T.sapatos_leg); } },
    { id: 'manequim', min: 55, cond: () => podeManequim(), go: () => { const p = aoLado(pick([-1, 1]), rand(2.2, 3)); MANEQ.position.set(p.x, 0, p.z); MANEQ.lookAt(camera.position.x, 0, camera.position.z); MANEQ.visible = true; D.manequim = { p, t: 0 }; E.sub('leg', T.manequim_leg); } },
    { id: 'reflexoNaoImita', min: 40, cond: () => temVidro(), go: () => { E.sub('leg', T.reflexo_vira_leg); flash(40); E.SFX.estatica(.15); } },
    { id: 'reflexoAtraso', min: 35, cond: () => temVidro(), go: () => { E.sub('leg', '[seu reflexo demora meio segundo a te acompanhar]'); } },
    { id: 'maoCrianca', min: 30, cond: () => temCama() || (S().hidden && S().hidden.tipo === 'cama'), go: () => { const p = aoLado(pick([-1, 1]), .8); MAO.position.set(p.x, .25, p.z); MAO.rotation.set(Math.PI / 2, 0, 0); MAO.scale.set(.6, .6, .6); MAO.visible = true; E.sub('leg', T.mao_cama_crianca_leg); let t = 0; anima(MAO, dt => { t += dt; MAO.position.x = lerp(MAO.position.x, P.pos.x, dt * .4); if ((S().flashOn && naMira(p) > .9) || P.prende || t > 3) { MAO.visible = false; MAO.scale.set(1, 1, 1); MAO.rotation.set(0, 0, 0); return true; } return false; }); } },
    { id: 'vidroMao', min: 30, cond: () => temVidro() && M.ativo, go: () => { E.sub('leg', T.vidro_mao_leg); } },
    { id: 'inspFalso', min: 65, cond: () => !P.room.fora, go: () => { const p = aFrente(rand(6, 9)); VULTO.position.set(p.x, 0, p.z); VULTO.lookAt(camera.position.x, 0, camera.position.z); VULTO.visible = true; E.sub('leg', T.insp_falso_leg); let t = 0, piscou = false; anima(VULTO, dt => { t += dt; if (E.keys && E.keys.KeyZ) piscou = true; if (dist2(p, P.pos) < 1.5) piscou = true; if (piscou || t > 5) { VULTO.visible = false; return true; } return false; }); } },
    { id: 'tetoVao', min: 55, cond: () => !P.room.fora, go: () => { const p = aFrente(rand(3, 5)); TETO.position.set(p.x, 3.2, p.z); TETO.rotation.set(0, Math.atan2(camera.position.x - p.x, camera.position.z - p.z), 0); TETO.visible = true; E.sub('leg', T.teto_vao_leg); let t = 0; anima(TETO, dt => { t += dt; if (dist2(p, P.pos) < 3) TETO.position.y = Math.max(0, TETO.position.y - dt * 1.4); if (t > 6) { TETO.visible = false; TETO.position.y = 0; return true; } return false; }); } },
    { id: 'camaRespira', min: 25, cond: () => temCama(), go: () => { E.sub('leg', T.cama_respira_leg); } },
    { id: 'portaRange', min: 25, cond: () => !!K.portaDaSala && !!K.portaDaSala(P.room, dd => dd.col && !dd.open), go: () => { const d = K.portaDaSala(P.room, dd => dd.col && !dd.open && dist2(dd, P.pos) < 6); if (!d) return; E.sub('leg', '[a porta que você fechou range e se abre de novo]'); E.setDoor && E.setDoor(d, true); } },
    { id: 'sombraParede', min: 35, cond: () => !P.room.fora, go: () => { E.sub('leg', '[a sombra dele cruza a parede iluminada, longo e torto]'); arranhao(aoLado(1, 2), .8); } },
    { id: 'risadaMove', min: 30, go: () => { let t = 0; const dir = pick([-1, 1]); E.sub('leg', '[uma risada de criança desliza pela sala]'); anima({ visible: true }, dt => { t += dt; if (Math.random() < dt * 2) { const p = aoLado(dir, rand(2, 5)); E.SFX.risada(p.x, p.z); } if (t > 2.5) return true; return false; }); } },
    { id: 'maoDada', min: 50, cond: () => !S().flashOn, go: () => { E.sub('leg', '[uma mãozinha fria segura a sua no escuro]'); respiracao(aoLado(1, .4), 1.4, false, .3); } },
    { id: 'luzApaga', min: 25, cond: () => W.lampadas.some(L => L.ligada && dist2(L, P.pos) < 6), go: () => { const L = W.lampadas.filter(x => x.ligada && dist2(x, P.pos) < 6)[0]; if (!L) return; L.ligada = false; L.luz.intensity = 0; L.bulbo.material.emissiveIntensity = 0; E.SFX.vidro(L.x, L.z); E.sub('leg', '[a lâmpada estoura quando você passa]'); } },
    { id: 'vultoPorta', min: 40, cond: () => !P.room.fora, go: () => { const p = aFrente(rand(7, 11)); VULTO.position.set(p.x, 0, p.z); VULTO.lookAt(camera.position.x, 0, camera.position.z); VULTO.visible = true; E.sub('leg', '[ele está parado no vão da porta, ao fundo]'); let t = 0; anima(VULTO, dt => { t += dt; if ((S().flashOn && naMira(p) > .97) || t > 2) { VULTO.visible = false; return true; } return false; }); } },
    { id: 'olhoVenda', min: 45, cond: () => !S().flashOn, go: () => { const p = atras(rand(2, 4)); const r = ROSTO_por(); r.position.set(p.x, 1.5, p.z); r.visible = true; E.sub('leg', '[dois olhos vermelhos piscam no escuro atrás de você]'); let t = 0; anima(r, dt => { t += dt; if (t > 1) { r.visible = false; return true; } return false; }); } },
    { id: 'choroParede', min: 30, cond: () => !P.room.fora, go: () => { E.sub('leg', '[um choro de criança vem de dentro da parede]'); voz(aoLado(pick([-1, 1]), 1), { f0: 420, vogais: [[500, 1800]], dur: 1.4, vol: .05 }); } }
  ];
  // modelos auxiliares reaproveitados (rosto e criança) — criados sob demanda
  let _rosto = null; function ROSTO_por() { if (!_rosto) { _rosto = new THREE.Group(); const pele = new THREE.MeshStandardMaterial({ color: 0xd6d0c2, roughness: .8, emissive: 0x2a2620, emissiveIntensity: .6 }); const r = new THREE.Mesh(new THREE.SphereGeometry(.13, 14, 10), pele); r.scale.set(.85, 1.1, .8); _rosto.add(r); for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.028, 8, 6), new THREE.MeshBasicMaterial({ color: 0x080000 })); o.position.set(s * .045, .02, .11); _rosto.add(o); } const b = new THREE.Mesh(new THREE.TorusGeometry(.05, .012, 6, 12, Math.PI), new THREE.MeshBasicMaterial({ color: 0x0a0000 })); b.position.set(0, -.07, .11); _rosto.add(b); _rosto.visible = false; scene.add(_rosto); modelos.push(_rosto); } return _rosto; }
  let _cri = null; function CRI() { if (!_cri) { _cri = new THREE.Group(); E.cyl(.1, .22, .9, E.MAT.sombra, 0, .45, 0, 8, _cri); const c = new THREE.Mesh(new THREE.SphereGeometry(.12, 10, 8), E.MAT.sombra); c.position.y = 1.05; _cri.add(c); _cri.visible = false; scene.add(_cri); modelos.push(_cri); } return _cri; }
  function temVidro() { const r = P.room; return r && (r.id === 'banhS' || r.id === 'banh' || r.id === 'copa' || r.id === 'recep' || /vidro|janela/.test(r.nome || '')); }
  function temCama() { return W.lockers.some(l => l.tipo === 'cama' && dist2(l, P.pos) < 7); }
  function podeManequim() { const r = P.room; return r && !r.fora && (r.id === 'rouparia' || r.id === 'vestiario' || /uniforme|cabide|rouparia/.test(r.nome || '')); }

  function tentarAlucinacao() {
    if (!jogando() || P.room.fora && W.mapa !== 'cemiterio') return;
    if (agora() < D.aluCd || fear() < 30) return;
    const cands = ALUC.filter(a => fear() >= a.min && (!a.cond || a.cond()) && a.id !== D.ultAlu);
    if (!cands.length) return;
    // pondera pela semente da noite para dar "personalidade" a cada noite
    const a = cands[Math.floor(sementeNoite('alu' + (D.salaCont || 0)) * cands.length) % cands.length];
    D.aluCd = agora() + rand(26, 46); D.ultAlu = a.id; seguro(a.go)();
  }

  // =========================================================== PERSEGUIÇÃO E CONTRA-JOGO (esconderijo / medo)
  // dedos sob a porta do armário (quando escondida e o Inspetor caça perto): recuar/prender o ar salva
  function updateEsconderijo(dt) {
    const s = S(), L = s && s.hidden; if (!L) { D.frestaOn = false; elMaos.style.opacity = 0; return; }
    const caca = M.ativo && M.state === 'caca', perto = M.ativo && dist2(M.pos, P.pos) < 3.2;
    // 1) dedos/braço sob o esconderijo
    if (caca && perto && !D.frestaOn && agora() > (D.frestaCd || 0)) {
      D.frestaOn = true; D.frestaT = 0;
      if (L.tipo === 'cama') { E.sub('leg', T.braco_cama_leg); depois(.2, () => E.sub('lia', T.braco_cama_lia)); }
      else { E.sub('leg', T.dedos_leg); depois(.2, () => E.sub('lia', T.dedos_lia)); }
      elMaos.style.opacity = .5; marcarForte(); respiracao(P.pos, 2.4, true, .5);
    }
    if (D.frestaOn) {
      D.frestaT += dt;
      // contra-jogo: prender o ar e NÃO fazer barulho afasta; barulho (noiseR) arromba
      if (P.noiseR > .8) { D.frestaOn = false; elMaos.style.opacity = 0; D.frestaCd = agora() + 10; E.SFX.pancada(P.pos.x, P.pos.z); }
      else if ((P.prende || D.frestaT > 5) && !caca) { D.frestaOn = false; elMaos.style.opacity = 0; D.frestaCd = agora() + 14; }
      else if (D.frestaT > 7) { D.frestaOn = false; elMaos.style.opacity = 0; D.frestaCd = agora() + 14; }
    }
    // estalo de língua colado na fresta quando ele passa rente ao esconderijo
    if (caca && perto && agora() > (D.estaloFrestaCd || 0) && Math.random() < dt * .6) { D.estaloFrestaCd = agora() + 4; E.SFX.estalo(M.pos, .8, true); }
    // 2) ficar tempo demais embaixo da cama: mãos vêm do escuro, força trocar
    if (L.tipo === 'cama') { D.maosCamaT += dt; if (D.maosCamaT > 25 && !D.maosCamaAviso) { D.maosCamaAviso = true; E.sub('lia', T.maos_cama_tempo_lia || 'Mãos vindo do escuro. Não dá pra ficar.'); arranhao(aoLado(1, .6), 1.1); marcarForte(); } }
  }

  // quase-encontro: o Inspetor passa rente ao esconderijo, encosta a mão, respira e segue — dispara ao prender o ar
  function quaseEncontro() {
    const s = S(), L = s && s.hidden; if (!L || M.ativo || agora() < (D.quaseCd || 0)) return;
    if (!P.prende || fear() < 45) return;
    D.quaseCd = agora() + 80; marcarForte(); elMaos.style.opacity = .4;
    E.sub('leg', T.quase_leg); depois(.3, () => E.sub('lia', T.quase_lia));
    const p = atras(1.1); passoPos(p, .6); respiracao(p, 2.8, true, .6);
    depois(2.6, () => { elMaos.style.opacity = 0; E.SFX.passoLonge && E.SFX.passoLonge({ x: p.x, z: p.z }); });
  }

  // encostado na parede ao lado do armário / falsa retirada até a saída (emboscadas honestas)
  function emboscadaSaida() {
    const s = S(); if (M.ativo || agora() < (D.embCd || 0) || fear() < 40) return;
    D.embCd = agora() + 90;
    const tipo = sementeNoite('emb' + (D.salaCont || 0)) > .5 ? 'parede' : 'saida';
    if (tipo === 'parede') { E.sub('leg', T.espera_leg); depois(.4, () => E.sub('lia', T.parede_lia)); }
    else { E.sub('lia', T.saida_lia); depois(.5, () => E.sub('leg', T.saida_leg)); }
    // passos FALSOS que se afastam antes da emboscada (o truque que te faz correr cedo demais)
    for (let i = 0; i < 4; i++) depois(i * .35, () => passoPos(atras(2 + i * 1.5), .5 - i * .08));
    marcarForte();
  }

  // já está no seu esconderijo favorito (pune o hábito)
  function aoEsconder(L) {
    D.maosCamaT = 0; D.maosCamaAviso = false;
    const k = (L.id || L.x + ',' + L.z); D.usoEscond[k] = (D.usoEscond[k] || 0) + 1;
    if (L === D.ocup) { D.ocup = null; E.sub('leg', T.ocupado_rosto_leg); depois(.1, () => E.sub('lia', T.ocupado_rosto_lia)); flash(60); marcarForte(); E.SFX.estalo(P.pos, .8); return; }
    // Ana estende a mão por baixo da cama (cap III); a voz do Davi conta de dentro do armário
    if (L.tipo === 'cama') {
      if (S().chapter >= 3 && sementeNoite('anac' + k) > .6) anaCama(L);
      // a cama que já tem alguém (o Davi, presença fria): a Lia se recusa a deitar, marca inseguro
      else if (sementeNoite('davic' + k) > .8) { E.sub('lia', T.cama_davi_lia); respiracao(P.pos, 2, false, .3); L.sxInseguro = true; marcarForte(); }
    } else if (L.tipo === 'armario') { vozNoArmario(L); maoDoArmario(L); }
  }
  function aoSair(L) {
    D.frestaOn = false; elMaos.style.opacity = 0;
    // falso agarrão ao sair com ele perto: as mãos entram, a tela pisca e some — sem dano
    if (M.ativo && dist2(M.pos, P.pos) < 6 && fear() > 55 && agora() > (D.agarrCd || 0) && Math.random() < .35) falsoAgarrao();
  }

  function falsoAgarrao() {
    D.agarrCd = agora() + 70; marcarForte(); elMaos.style.opacity = 1; elVerm.style.opacity = .7;
    E.SFX.susto && E.SFX.susto(); E.sub('leg', T.agarrao_leg);
    depois(.4, () => { elMaos.style.opacity = 0; elVerm.style.opacity = 0; });
  }

  // =========================================================== PASSOS QUE IMITAM / DIÁRIO / BORDA / SOPRO
  function updateDinamico(dt, s) {
    // passos que imitam o seu compasso durante a procura
    if (M.ativo && M.state === 'procura' && dist2(M.pos, P.pos) < 10) {
      D.imitaT += dt; const andando = P.noiseR > 0 || (P.vel && P.vel > .1);
      if (D.imitaT > 1 && !D.imitaAviso && Math.random() < dt) { D.imitaAviso = true; E.sub('leg', T.passos_leg); depois(1.2, () => E.sub('lia', T.passos_lia)); }
    } else D.imitaT = 0;
    // transições de estado do Inspetor: ele bate 3x na parede chamando quando te perde
    if (M.ativo) {
      if (D.estadoAnt === 'caca' && M.state !== 'caca' && agora() > (D.bateuCd || 0)) { D.bateuCd = agora() + 20; const p = aoLado(pick([-1, 1]), 2); for (let i = 0; i < 3; i++) depois(i * .45, () => E.SFX.pancada(p.x, p.z)); E.sub('leg', '[ele bate na parede, três vezes, chamando você]'); }
      D.estadoAnt = M.state;
    } else D.estadoAnt = null;
    // estalo de língua mais rápido conforme ele se aproxima na caça
    if (M.ativo && M.state === 'caca') { const d = dist2(M.pos, P.pos); D.estaloT = (D.estaloT || 0) - dt; if (D.estaloT <= 0) { D.estaloT = clamp(d / 8, .35, 1.6); E.SFX.estalo(M.pos, clamp(1 - d / 14, .3, 1)); } }
    // respiração dele audível quando colado (<2 m) fora da caça
    if (M.ativo && M.state !== 'caca' && dist2(M.pos, P.pos) < 2 && agora() > (D.respColadoCd || 0)) { D.respColadoCd = agora() + 6; respiracao(M.pos, 2.2, true, .5); }
    // vinheta vermelha quando ele está colado em plena caça
    if (M.ativo && M.state === 'caca' && dist2(M.pos, P.pos) < 2.5) { D.vermCaca = Math.min(.5, (D.vermCaca || 0) + dt); elVerm.style.opacity = D.vermCaca * (.6 + Math.sin(agora() * 8) * .4); } else if (D.vermCaca) { D.vermCaca = Math.max(0, D.vermCaca - dt * 2); elVerm.style.opacity = D.vermCaca; }
    // a cantiga (cantarolar grave) do Inspetor sobe de tom quando ele está perto
    if (M.ativo && agora() > (D.humCd || 0)) { const d = dist2(M.pos, P.pos); if (Number.isFinite(d) && d < 12) { D.humCd = agora() + clamp(d / 6, .9, 2.2); voz(M.pos, { f0: clamp(240 - d * 6, 120, 240), vogais: [[300, 900]], dur: 1, vol: clamp(.08 - d / 220, .02, .08) }); } }
    // pegadas molhadas que te seguem
    if (D.pegadasT > 0) { D.pegadasT -= dt; if (Math.random() < dt * 3) { const p = atras(rand(1, 2.5)); passoPos(p, .22, true); } }
    // borda que respira (medo alto): vinheta pulsa, mais forte do lado da ameaça
    if (fear() > 70 && !menosMov()) { D.deBorda += dt; const base = (fear() - 70) / 30; elBorda.style.opacity = (.12 + Math.sin(D.deBorda * 1.6) * .08) * base; } else elBorda.style.opacity = 0;
    // sopro frio na nuca (raro, corredor "seguro")
    if (jogando() && !M.ativo && fear() > 45 && agora() > (D.soproCd || 0) && Math.random() < dt * .03) { D.soproCd = agora() + 60; elSopro.style.opacity = 1; E.sub('leg', T.sopro_leg); respiracao(atras(.5), 1.4, false, .35); depois(1.4, () => elSopro.style.opacity = 0); }
    // a manequim que vira quando você passa e dá as costas
    if (D.manequim) { const m = D.manequim; m.t += dt; const dot = naMira(m.p), passou = dist2(m.p, P.pos) < 2.6 && dot < .2; if (passou && !m.virou) { m.virou = true; MANEQ.lookAt(camera.position.x, 0, camera.position.z); E.SFX.estalo(m.p, .8); marcarForte(); } if (m.t > 4 || (S().flashOn && dot > .97 && !m.virou)) { MANEQ.visible = false; D.manequim = null; } }
  }

  // o diário como pausa: a cantiga para quando você abre por tempo demais
  function aoPausar() { /* reservado */ }
  function diarioAberto(ab) {
    if (ab && !D.diarioAberto) { D.diarioAbreT = agora(); }
    if (!ab && D.diarioAberto && agora() - D.diarioAbreT > 6 && M.ativo) { E.sub('lia', T.diario_lia); }
    D.diarioAberto = ab;
  }

  // =========================================================== CHUVA / RELÂMPAGO (cemitério) — perseguição por clarão
  function aoRaio() {
    if (!jogando()) return; const s = S();
    // perseguição na chuva: a silhueta congela mais perto a cada relâmpago
    if (W.mapa === 'cemiterio' && M.ativo && !P.room.fora === false) {
      D.raioFase = (D.raioFase || 0) + 1; const n = D.raioFase;
      if (n <= 4) { const d = 20 - n * 4, lado = (n % 2 ? 1 : -1) * rand(2, 5); const p = { x: clamp(P.pos.x + lado, -20, 20), z: P.pos.z - d }; VULTO.position.set(p.x, 0, p.z); VULTO.lookAt(camera.position.x, 0, camera.position.z); VULTO.visible = true; flash(90); if (!E.SFX._chaves) voz(p, { f0: 160, vogais: [[280, 1100]], dur: .4, vol: .07 }); depois(.5, () => { VULTO.visible = false; }); }
    } else if (!M.ativo && fear() > 40 && Math.random() < .5) {
      // relâmpago que aproxima: reposiciona o vulto mais perto quando você não olha
      const p = aFrente(rand(5, 9)); if (naMira(p) < .5) { VULTO.position.set(p.x, 0, p.z); VULTO.lookAt(camera.position.x, 0, camera.position.z); VULTO.visible = true; marcarForte(); depois(.8, () => VULTO.visible = false); }
    }
    // silhueta de criança numa janela, revelada pelo relâmpago (qualquer mapa, raro)
    if (!M.ativo && fear() > 35 && temVidro() && agora() > (D.janelaCd || 0) && Math.random() < .4) { D.janelaCd = agora() + 50; const p = aFrente(rand(3, 5)); CRI().position.set(p.x, 0, p.z); CRI().visible = true; E.sub('leg', '[um relâmpago: uma criança parada na janela]'); depois(.4, () => CRI().visible = false); }
    // cara a cara no escuro: com a lanterna apagada e ele perto, um relâmpago revela o rosto
    if (!S().flashOn && M.ativo && dist2(M.pos, P.pos) < 2.2 && M.state !== 'caca' && agora() > (D.caraCd || 0)) {
      D.caraCd = agora() + 40; const p = atras(1.1); const r = ROSTO_por(); r.position.set(p.x, 1.45, p.z); r.visible = true; flash(110); E.sub('leg', T.caraacara_leg); marcarForte(); let t = 0; anima(r, dt => { t += dt; if (P.noiseR > .6 && !E.ui) { /* mexeu: a caça aperta */ } if (t > 2) { r.visible = false; return true; } return false; }); }
  }

  // =========================================================== BEATS ROTEIRIZADOS POR CAPÍTULO
  function montarCapitulo(id) {
    const s = S(); if (!s) return;
    // reveal lento do primeiro vulto (cap I, antes do primeiro avistamento)
    if (id === 'terreo' && s.chapter === 1) D.revela = { pend: !s.flags.avist };
    // o braço no monta-cargas é disparado por flag do mapa (ver gancho montaCargas)
  }

  // reveal lento: chamado pelo motor no primeiro avistamento, antes do estalo
  function avistamento() {
    if (fear() > 80 || Math.random() > .6) return; // nem sempre, pra não cansar
    const p = aFrente(rand(9, 12)); VULTO.position.set(p.x, 0, p.z); VULTO.rotation.y = Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
    VULTO.scale.set(1, .2, 1); VULTO.visible = true; E.sub('lia', T.revela_lia);
    let t = 0; anima(VULTO, dt => { t += dt; VULTO.scale.y = clamp(t / 1.4, .2, 1); if (t > 1.5) { E.sub('leg', T.estalo_leg); voz(p, { f0: 170, vogais: [[300, 1100]], dur: .5, vol: .09 }); VULTO.visible = false; VULTO.scale.set(1, 1, 1); return true; } return false; });
  }

  // o braço comprido no monta-cargas (fim do cap III): encolher (agachar) no fundo salva
  function montaCargas() {
    if (agora() < (D.mcCd || 0)) return; D.mcCd = agora() + 999;
    const p = { x: P.pos.x, y: 2.6, z: P.pos.z - 1 }; MAO.position.set(p.x, p.y, p.z); MAO.rotation.set(Math.PI * .9, 0, 0); MAO.visible = true;
    E.sub('leg', '[um braço comprido entra pela boca do poço, tateando]'); marcarForte(); voz({ x: p.x, y: p.y, z: p.z }, { f0: 150, vogais: [[280, 900]], dur: .8, vol: .08 });
    let t = 0; anima(MAO, dt => { t += dt; MAO.position.y = 2.6 - Math.sin(t * 2) * .4; const seguro = P.crouch; if (!seguro && dist2(MAO.position, P.pos) < 1.3 && t > 1) { /* só susto */ E.SFX.susto && E.SFX.susto(); elVerm.style.opacity = .6; depois(.4, () => elVerm.style.opacity = 0); } if (t > 5) { MAO.visible = false; MAO.rotation.set(0, 0, 0); return true; } return false; });
  }

  // chamado em estéreo / bilhete por baixo da porta / chamado usa sons do mundo
  function chamadoVariacao() {
    const s = S(); if (!E.chamado || agora() < (D.chamVarCd || 0)) return; D.chamVarCd = agora() + 30;
    const r = sementeNoite('cham' + (D.salaCont || 0));
    const modo = s.chapter >= 4 && r > .75 ? 'bilhete' : r > .5 ? 'estereo' : r > .28 ? 'som' : 'silhueta';
    if (modo === 'estereo') { E.sub('leg', T.chamado2_leg); voz(aoLado(-1, 6), { f0: 320, dur: .8, vol: .1 }); voz(aoLado(1, 6), { f0: 320, dur: .8, vol: .1 }); }
    else if (modo === 'bilhete') { E.sub('leg', T.bilhete_leg); E.SFX.papel && E.SFX.papel(); }
    else if (modo === 'silhueta' && !olhaTras()) { silhuetaChamado(aFrente(rand(5, 7))); }
    else { E.sub('leg', '[uma fita toca sozinha numa sala vizinha]'); E.SFX.chiadoFita && E.SFX.chiadoFita(true); }
  }

  // silhueta idêntica à Lia na sala do Chamado falso
  function silhuetaChamado(pos) {
    const g = VULTO; g.position.set(pos.x, 0, pos.z); g.rotation.y = Math.atan2(camera.position.x - pos.x, camera.position.z - pos.z) + Math.PI; g.visible = true;
    E.sub('lia', T.silhueta_lia); let t = 0, virou = false; anima(g, dt => { t += dt; if (dist2(pos, P.pos) < 3 && !virou) { virou = true; g.rotation.y += Math.PI; const r = ROSTO_por(); r.position.set(pos.x, 1.5, pos.z); r.visible = true; E.sub('leg', T.silhueta_leg); voz(pos, { f0: 170, dur: .5, vol: .09 }); marcarForte(); depois(1.2, () => r.visible = false); } if (t > 4) { g.visible = false; return true; } return false; });
  }

  // =========================================================== FUGA FINAL (cap V) — escuro/estrondos atrás, sem bloquear
  function updateFuga(dt, s) {
    if (W.mapa !== 'cemiterio' || !s.flags.sino) return;
    // lâmpadas estourando em cadeia atrás de você conforme corre
    D.fugaT = (D.fugaT || 0) + dt;
    if (!D.fugaLista) { D.fugaLista = W.lampadas.filter(L => L.ligada).sort((a, b) => dist2(b, P.pos) - dist2(a, P.pos)); D.fugaIdx = 0; }
    if (D.fugaLista && D.fugaIdx < D.fugaLista.length && D.fugaT > (D.fugaProx || 1.1)) {
      // estoura a lâmpada mais próxima atrás de você
      const atrasLista = D.fugaLista.filter(L => L.ligada && naMira(L) < .2);
      const L = atrasLista.sort((a, b) => dist2(a, P.pos) - dist2(b, P.pos))[0];
      if (L) { L.ligada = false; L.luz.intensity = 0; L.bulbo.material.emissiveIntensity = 0; E.SFX.vidro(L.x, L.z); if (E.SX && E.SX.faisca) E.SX.faisca(L.x, L.z); flash(60); E.P.shake = Math.max(P.shake || 0, .02); D.fugaProx = D.fugaT + rand(.7, 1.4); D.fugaIdx++; if (D.fugaIdx === 1) E.sub('leg', T.corredor_apaga_leg); }
    }
    // estrondos de desabamento atrás (visual: tremor + poeira, nunca bloqueia o caminho)
    if (agora() > (D.desabaCd || 0) && Math.random() < dt * .25) { D.desabaCd = agora() + rand(4, 8); E.P.shake = Math.max(P.shake || 0, .06); E.SFX.impacto && E.SFX.impacto(P.pos.x, P.pos.z); E.SFX.tremor && E.SFX.tremor(); if (!D.desabaFalou) { D.desabaFalou = true; E.sub('leg', T.desaba_leg); depois(.6, () => E.sub('lia', T.desaba_lia)); } }
    // apagão curto no meio da fuga (uma vez), correr guiada pelo apito
    if (D.fugaIdx >= 2 && !D.apFugaFez && sementeNoite('apfuga') > .4) { D.apFugaFez = true; apagaoFuga(); }
    // brasa e fuligem sobem atrás na fuga (o incêndio de 1979 que volta)
    if (agora() > (D.brasaCd || 0) && Math.random() < dt * .4) { D.brasaCd = agora() + rand(2, 4); const p = atras(rand(1.5, 3)); if (E.SFX.estatica) E.SFX.estatica(.2, { x: p.x, z: p.z }); if (!D.brasaFalou) { D.brasaFalou = true; E.sub('leg', '[brasa e fuligem sobem atrás de você]'); } }
  }

  // apagão curto na fuga: a lanterna morre e você corre guiada só pelo apito
  function apagaoFuga() {
    if (agora() < (D.apFugaCd || 0)) return; D.apFugaCd = agora() + 999;
    apagao(4, true); E.sub('leg', '[a lanterna morreu. corra pelo apito.]'); voz(atras(6), { f0: 150, dur: 1, vol: .09 });
  }

  // =========================================================== ANA — comportamentos novos
  // Ana dupla (estéreo): uma é falsa e some com a luz
  function anaDupla() {
    if (agora() < (D.anaDuplaCd || 0)) return; D.anaDuplaCd = agora() + 60;
    const le = aoLado(-1, rand(3, 5)), ri = aoLado(1, rand(3, 5)), falsaEsq = Math.random() < .5;
    ANAX.position.set(le.x, 0, le.z); ANAX.visible = true; ANAY.position.set(ri.x, 0, ri.z); ANAY.visible = true;
    E.sub('leg', T.ana_dupla_leg); voz(le, { f0: 360, dur: .7, vol: .09 }); voz(ri, { f0: 360, dur: .7, vol: .09 });
    let t = 0; anima(ANAX, dt => { t += dt; const falsa = falsaEsq ? ANAX : ANAY, pf = falsaEsq ? le : ri; if (S().flashOn && naMira(pf) > .95) { falsa.visible = false; } if (t > 4) { ANAX.visible = false; ANAY.visible = false; return true; } return false; });
  }
  // Ana embaixo da cama (quando escondida na cama)
  function anaCama(L) {
    if (agora() < (D.anaCamaCd || 0)) return; D.anaCamaCd = agora() + 120;
    const p = aoLado(1, 1); ANAX.position.set(p.x, 0, p.z); ANAX.rotation.y = Math.atan2(camera.position.x - p.x, camera.position.z - p.z); ANAX.visible = true;
    E.sub('lia', T.ana_cama_lia); respiracao(p, 2, false, .4); let t = 0; anima(ANAX, dt => { t += dt; if (S().flashOn && naMira(p) > .9 || t > 4) { ANAX.visible = false; return true; } return false; });
  }
  // Ana imita a sua lanterna (facho falso à frente)
  function anaLanterna() {
    if (!S().flashOn || agora() < (D.anaLanternaCd || 0)) return; D.anaLanternaCd = agora() + 90;
    E.sub('leg', T.ana_lanterna_leg); const p = aFrente(rand(5, 8)); // o facho falso é só legenda+som; apontar pra ele revela a Ana atrás
    depois(2, () => { if (olhaTras()) return; const a = atras(rand(2, 3)); ANAX.position.set(a.x, 0, a.z); ANAX.visible = true; E.SFX.risada(a.x, a.z); depois(.6, () => ANAX.visible = false); });
  }
  // voz do Davi de dentro do próprio armário, contando com a sua respiração presa
  function vozNoArmario(L) {
    if (L.tipo !== 'armario' || agora() < (D.vozArmCd || 0) || fear() < 50) return; D.vozArmCd = agora() + 140;
    E.sub('leg', T.armario_voz); voz(P.pos, { f0: 300, vogais: [[400, 2000]], dur: 1, vol: .06 }); marcarForte();
  }

  // =========================================================== PROCISSÃO — contra-jogo do fôlego
  function updateProcissao(dt, s) {
    if (!PROC.fase) { D.procVela = false; return; }
    // as velas da fila apagam quando você ofega fora do esconderijo; a criança mais perto vira pro escuro
    const ofegando = (s.ar || 100) < 40 && !s.hidden;
    if (ofegando && !D.procVela && agora() > (D.procVelaCd || 0)) { D.procVelaCd = agora() + 8; D.procVela = true; E.sub('lia', T.vela_sopro_lia); E.SFX.suspiro && E.SFX.suspiro(); marcarForte(); depois(2, () => D.procVela = false); }
    // uma vela ilumina o SEU rosto pela fresta quando está escondida: prender o ar evita que a fila vire
    if (s.hidden && PROC.fase === 'passando' && agora() > (D.velaRostoCd || 0) && Math.random() < dt * .3) {
      D.velaRostoCd = agora() + 20; if (!P.prende) { E.sub('leg', '[uma vela ergue e ilumina o seu rosto pela fresta]'); flash(60); marcarForte(); } else E.sub('leg', '[a vela passou rente. você prendeu o ar a tempo]');
    }
    // uma criança tropeça e a fila para 2 s; uma delas vira a cabeça para o seu esconderijo
    if (PROC.fase === 'passando' && agora() > (D.tropecaCd || 0) && Math.random() < dt * .15) {
      D.tropecaCd = agora() + 30; E.sub('leg', T.tropeca_leg); E.SFX.suspiroLia && E.SFX.suspiroLia(); if (s.hidden) depois(1, () => { E.sub('leg', '[uma delas virou a cabeça para onde você está]'); marcarForte(); });
    }
    // a última da fila (a freira) para e encara o seu esconderijo por um instante
    if (s.hidden && PROC.fase === 'passando' && agora() > (D.freiraCd || 0) && Math.random() < dt * .1) { D.freiraCd = agora() + 25; E.sub('leg', '[a última da fila parou e encara o seu esconderijo]'); respiracao(atras(2), 2, true, .4); marcarForte(); }
  }

  // dar as costas de propósito para a Ana (cap III): virar de costas a aproxima; girar no estalo a recua
  function updateCostasAna(dt, s) {
    if (!ANA.ativa || s.chapter !== 3) { D.costas.on = false; return; }
    const deCostas = naMira(ANA.g ? ANA.g.position : P.pos) < -.3;
    if (deCostas) { D.costas.t += dt; if (D.costas.t > 3 && !D.costas.on) { D.costas.on = true; E.sub('lia', T.costas_ana_lia); E.sub('leg', T.costas_ana_leg); respiracao(atras(.6), 1.6, false, .4); } }
    else { if (D.costas.on) { D.costas.on = false; E.SFX.risada(P.pos.x, P.pos.z); } D.costas.t = 0; }
  }

  // standoff no batente: você e ele dos dois lados de uma porta entreaberta, a maçaneta gira
  function standoff() {
    if (agora() < (D.standoffCd || 0) || !M.ativo || M.state === 'caca') return;
    const d = K.portaDaSala && K.portaDaSala(P.room, dd => dist2(dd, P.pos) < 3 && dist2(dd, M.pos) < 4);
    if (!d) return; D.standoffCd = agora() + 90; marcarForte();
    E.sub('leg', T.standoff_leg); depois(.4, () => E.sub('lia', T.standoff_lia));
    respiracao({ x: d.x, y: 1.5, z: d.z }, 3, true, .6);
    let t = 0; anima({ visible: true }, dt => { t += dt; if (d.pivot) d.pivot.rotation.y = Math.sin(t * 3) * .04 * (d.ang || 1); if (t > 3) { if (d.pivot) d.pivot.rotation.y = d.ang || 0; return true; } return false; });
  }

  // mão sai do armário vazio e bate a porta — marca o armário como inseguro naquela noite
  function maoDoArmario(L) {
    if (L.tipo !== 'armario' || agora() < (D.maoArmCd || 0) || Math.random() > .18) return; D.maoArmCd = agora() + 120;
    E.sub('leg', T.mao_armario_leg); E.SFX.tocArmario ? E.SFX.tocArmario(L.x, L.z) : E.SFX.armario && E.SFX.armario(L.x, L.z); K.anima && null; marcarForte();
    L.sxInseguro = true; // outros sustos já leem esconderijo inseguro
  }

  // calmaria enganosa: um período seguro e silencioso logo antes de um susto
  function calmaria() {
    if (agora() < (D.calmCd || 0) || !M.ativo || fear() < 50) return; D.calmCd = agora() + 140;
    vacuo(6, .015); E.sub('lia', T.calmaria_lia);
    depois(rand(5, 7), () => { if (!jogando()) return; const p = atras(2.2); passoPos(p, .9); E.SFX.susto && E.SFX.susto(); flash(70); marcarForte(); });
  }

  // fingir de morta na cama: imóvel, com o ar preso, quando ele chega ele te cobre e vai embora (uma vez por capítulo)
  function fingirMorta(dt, s) {
    const L = s.hidden; if (!L || L.tipo !== 'cama') { D.fingiu = false; return; }
    if (M.ativo && M.state === 'caca' && dist2(M.pos, P.pos) < 2.5 && !s.flags['l5_morta' + s.chapter]) {
      D.fingirT = (D.fingirT || 0) + dt;
      if (P.prende && (s.ar || 0) > 0) { E.sub('lia', T.morta_lia); if (D.fingirT > 2.5) { s.flags['l5_morta' + s.chapter] = true; E.sub('inspetor', T.morta_dorme); respiracao(atras(1), 3, true, .5); if (K.vacuo) vacuo(2, .02); depois(2.5, () => { if (M.ativo) { M.wait = Math.max(M.wait || 0, 2); M.state = 'patrulha'; } }); } }
      else D.fingirT = 0;
    } else D.fingirT = 0;
  }

  // o apito que responde de longe (se você furtou o apito do Inspetor — segredo do lote 4)
  function apitoResponde() {
    const s = S(); if (agora() < (D.apitoCd || 0)) return;
    const furtou = s.flags && (s.flags.ms_apito || s.flags.apitoFurtado || s.flags.sx_apito);
    if (!furtou || Math.random() > .25) return; D.apitoCd = agora() + 120;
    E.sub('leg', T.apito_leg); voz(aFrente(30), { f0: 1600, vogais: [[1600, 3200]], dur: .5, vol: .05, sopro: true });
  }

  // ele recolhe você primeiro: raro, no lugar de uma morte da Ana/Procissão (near-miss, sem matar de verdade aqui)
  function talvezRecolhe(quem) {
    const s = S(); if ((quem !== 'ana' && quem !== 'procissao') || D.recolheu || Math.random() > .05) return false;
    D.recolheu = true; E.sub('leg', T.recolhe_leg); depois(.5, () => E.sub('inspetor', T.recolhe_insp));
    return false; // não bloqueia a morte; só a reveste de uma cena (o motor segue)
  }

  // ele segura a sua lanterna antiga ao voltar do checkpoint
  function lanternaVelha() {
    const s = S(); if (!s.mortes || agora() < (D.lvCd || 0) || Math.random() > .12) return; D.lvCd = agora() + 999;
    const p = aFrente(rand(4, 6)); VULTO.position.set(p.x, 0, p.z); VULTO.lookAt(camera.position.x + 10, 0, camera.position.z); VULTO.visible = true;
    E.sub('leg', T.lanterna_velha_leg); let t = 0, virou = false; anima(VULTO, dt => { t += dt; if (dist2(p, P.pos) < 2.5 && !virou) { virou = true; VULTO.lookAt(camera.position.x, 0, camera.position.z); E.SFX.estalo(p, .8); marcarForte(); } if (t > 6 || (virou && t > 2)) { VULTO.visible = false; return true; } return false; });
  }

  // a chamada de 1979 no cemitério: a cada nome, uma lápide "responde"; no fim chamam Lia
  function chamada79() {
    const s = S(); if (W.mapa !== 'cemiterio' || s.flags.l5_chamada79 || agora() < (D.ch79 || 0)) return; D.ch79 = agora() + 999; s.flags.l5_chamada79 = true;
    E.sub('leg', T.chamada79_leg); const nomes = ['Davi', 'Ana', 'Tomé', 'Celeste', 'Joaquim'];
    nomes.forEach((n, i) => depois(1 + i * 1.4, () => { voz(aFrente(8 + i), { f0: 150, vogais: [[300, 1100]], dur: .7, vol: .07 }); notas && notas(aFrente(8), [330], .4, .04); }));
    depois(1 + nomes.length * 1.4, () => { E.sub('inspetor', T.chamada79_nome); flash(70); E.SFX.sino && E.SFX.sino(); marcarForte(); });
  }

  // o chão que cede (cap IV): tranco forte de susto, sem queda real (não quebra o caminho)
  function chaoCede() {
    if (agora() < (D.chaoCd || 0)) return; D.chaoCd = agora() + 999;
    E.P.shake = Math.max(P.shake || 0, .12); E.SFX.tremor && E.SFX.tremor(); E.SFX.impacto && E.SFX.impacto(1.2);
    E.sub('lia', T.chao_cede_lia); flash(50); marcarForte();
  }

  // perseguição vertical (cap IV, noite rara): some num buraco do teto e cai à sua frente, cortando caminho
  function perseguicaoVertical() {
    if (W.mapa !== 'tuneis' || agora() < (D.pvCd || 0) || sementeNoite('pv') < .7) return; D.pvCd = agora() + 999;
    const p = aFrente(rand(4, 6)); VULTO.position.set(p.x, 4, p.z); VULTO.rotation.set(0, Math.atan2(camera.position.x - p.x, camera.position.z - p.z), 0); VULTO.visible = true;
    E.sub('leg', '[ele sumiu no buraco do teto... e caiu na sua frente]'); E.SFX.impacto && E.SFX.impacto(1);
    let t = 0; anima(VULTO, dt => { t += dt; VULTO.position.y = Math.max(0, 4 - t * 10); if (t > 1.2) { VULTO.visible = false; VULTO.position.y = 0; E.SFX.estalo(p, .9); return true; } return false; });
  }

  // o jantar que olha de volta (refeitório): um relâmpago e as cadeiras aparecem ocupadas
  function jantarOlha() {
    if (!/refeit|refeitorio/.test((P.room.id || '') + (P.room.nome || '')) || agora() < (D.jantarCd || 0)) return; D.jantarCd = agora() + 120;
    E.sub('leg', T.jantar_leg); flash(80);
  }

  const notas = K.notas || ((p, fs, g, v) => { try { for (const f of fs) voz(p, { f0: f, dur: .4, vol: v || .04 }); } catch (e) {} });

  // =========================================================== GANCHOS
  let salaAnt = null;
  const update = seguro((dt, s) => {
    // o diário como pausa: a cantiga para quando você o deixa aberto com ele por perto (fora do guard de jogando)
    diarioAberto(E.ui === 'diario');
    if (!jogando()) { elBorda.style.opacity = 0; elSopro.style.opacity = 0; return; }
    if (P.room !== salaAnt) {
      salaAnt = P.room; D.salaCont = (D.salaCont || 0) + 1;
      tentarAlucinacao();
      if (agora() > (D.embGate || 0) && s.hidden) { D.embGate = agora() + 50; }
      chamadoVariacao();
      // o braço no monta-cargas (fim do cap III), ao entrar na sala de descida
      if (W.mapa === 'superior' && s.chapter >= 3 && /sotao|deposito|monta/.test((P.room.id || '') + (P.room.nome || '')) && !s.flags.l5_mc) { s.flags.l5_mc = true; depois(1.2, () => montaCargas()); }
      jantarOlha();
      if (W.mapa === 'tuneis' && s.chapter === 4) perseguicaoVertical();
      if (W.mapa === 'cemiterio' && (s.done.capela || s.flags.cavou3 || fear() > 35) && !s.flags.l5_chamada79) chamada79();
      apitoResponde();
    }
    updateEsconderijo(dt); quaseEncontro(); updateDinamico(dt, s); updateFuga(dt, s);
    updateProcissao(dt, s); updateCostasAna(dt, s); fingirMorta(dt, s);
    // standoff e calmaria quando ele está rondando perto
    if (M.ativo && M.state !== 'caca' && dist2(M.pos, P.pos) < 5) { standoff(); if (Math.random() < dt * .05) calmaria(); }
    // chão que cede: uma vez por noite nos túneis, em plena caça
    if (W.mapa === 'tuneis' && M.ativo && M.state === 'caca' && !s.flags.l5_chao && sementeNoite('chao') > .6) { s.flags.l5_chao = true; chaoCede(); }
    // Ana (cap III): facho falso e a Ana dupla quando ela está ativa
    if (ANA.ativa && s.chapter === 3 && agora() > (D.anaBeatCd || 0)) {
      D.anaBeatCd = agora() + 30;
      if (sementeNoite('anab' + D.salaCont) > .7) anaDupla();
      else if (sementeNoite('anal' + D.salaCont) > .6) anaLanterna();
    }
    // fareja: o cenário é puxado na direção dele (pista honesta) — legenda rara
    if (M.ativo && M.state === 'investiga' && agora() > (D.farejaCd || 0) && Math.random() < dt * .4) { D.farejaCd = agora() + 25; E.sub('leg', T.cenario_leg); }
    // emboscada quando ele desiste perto de você
    if (M.ativo && M.state === 'procura' && dist2(M.pos, P.pos) < 5 && agora() > (D.embGate2 || 0)) { D.embGate2 = agora() + 60; emboscadaSaida(); }
    // falso "boa noite" (raro): tudo se acalma e volta com tudo
    if (!M.ativo && fear() > 55 && agora() > (D.boaCd || 0) && Math.random() < dt * .02) { D.boaCd = agora() + 120; boaNoite(); }
  });

  function boaNoite() {
    E.sub('inspetor', T.boanoite_insp); depois(.6, () => E.sub('lia', T.boanoite_lia)); vacuo(8, .02);
    depois(8, () => { if (!jogando()) return; E.SFX.susto && E.SFX.susto(); flash(80); E.P.shake = Math.max(P.shake || 0, .08); const p = atras(2); passoPos(p, .9); marcarForte(); });
  }

  const novoMapa = seguro(id => {
    esconderTudo(); elMaos.style.opacity = 0; elVerm.style.opacity = 0; elBorda.style.opacity = 0; elSopro.style.opacity = 0; elBoca.style.opacity = 0;
    elEstica.style.transition = 'none'; elEstica.style.transform = 'scale(1)'; elEstica.style.opacity = 0;
    salaAnt = null; D.salaCont = 0; D.aluCd = agora() + 12; D.ultAlu = null; D.frestaOn = false; D.manequim = null; D.maosCamaT = 0; D.maosCamaAviso = false;
    D.fugaLista = null; D.fugaIdx = 0; D.fugaT = 0; D.fugaProx = 1.1; D.desabaFalou = false; D.raioFase = 0; D.pegadasT = 0;
    const s = S(); if (!s) return;
    // sorteia o armário "ocupado" da noite (pune o esconderijo favorito)
    const arm = W.lockers.filter(l => l.tipo === 'armario');
    D.ocup = arm.length && sementeNoite('ocup' + id) > .55 ? arm[Math.floor(sementeNoite('ocupx' + id) * arm.length) % arm.length] : null;
    montarCapitulo(id);
    // ele segura a sua lanterna antiga ao reaparecer num ponto onde você já morreu
    if (s.mortes) depois(rand(2, 4), () => lanternaVelha());
  });

  const aoPasso = seguro(() => {
    // passos que imitam: o eco de um passo que não é seu, raro
    if (M.ativo && M.state === 'procura' && Math.random() < .12) passoPos(atras(rand(2, 4)), .22);
  });

  const morte = seguro(quem => {
    const s = S(); if (!s || !P.room) return;
    // morte específica: trancada no armário do castigo (vista de dentro, três batidas)
    if (quem === 'inspetor' && s.hidden && s.hidden.tipo === 'armario' && /castigo/.test((P.room.nome || '') + (P.room.id || ''))) {
      E.sub('leg', T.castigo_leg); depois(.4, () => E.sub('leg', T.castigo_resp));
      for (let i = 0; i < 3; i++) depois(.5 + i * .5, () => E.SFX.pancada(P.pos.x, P.pos.z));
    }
    // morte pela Procissão: muitas mãos pequenas tomam a tela por um instante
    if (quem === 'procissao') { elMaos.style.opacity = 1; depois(.6, () => elMaos.style.opacity = 0); }
    talvezRecolhe(quem);
  });

  // o braço no monta-cargas e o apagão da fuga são chamados por flags do mapa pelo motor
  const fareja = seguro(() => { if (fear() > 40 && Math.random() < .3) E.sub('leg', T.cenario_leg); });

  return {
    update, novoMapa, aoPasso, aoEsconder: seguro(aoEsconder), aoSair: seguro(aoSair), aoRaio: seguro(aoRaio),
    morte, fareja, avistamento: seguro(avistamento), montaCargas: seguro(montaCargas), apagaoFuga: seguro(apagaoFuga),
    diario: seguro(diarioAberto), anaDupla: seguro(anaDupla), anaCama: seguro(anaCama), anaLanterna: seguro(anaLanterna),
    vozNoArmario: seguro(vozNoArmario), silhuetaChamado: seguro(silhuetaChamado), falsoAgarrao: seguro(falsoAgarrao),
    _D: D, _T: T, _ALUC: ALUC
  };
}
