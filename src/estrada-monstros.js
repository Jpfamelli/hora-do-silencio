// PRÓLOGO — monstros da estrada (Lote 5)
// Comportamentos novos do vulto de 1979 (o Seu Joaquim que "morreu em 1979"), aparências mais
// perturbadoras, contra-jogos e momentos de perseguição. Chamado por estrada() em mapas.js DEPOIS de
// segredosEstrada(). Não dá dano no prólogo — é clima e ensino de mecânica. Usa vultos próprios
// (nunca mexe no `v`/`vc` do estrada-extra.js) e lê o estado por S.flags, sem tocar no fluxo da chave.
import { TXT5, mesclarMonstros } from './estrada-monstros-texto.js';
import { vibrar } from './estrada-polimento.js';

export function monstrosEstrada(A, S, c) {
  const { THREE, MAT, box, cyl } = A;
  mesclarMonstros(A.R);
  const grupo = A.W.grupo, P = A.P, cam = A.camera, GZ = c.GZ, BZ = c.BZ, carro = c.carro;
  const U = (c.ex && c.ex.util) || {};
  const vivo = () => A.W.grupo === grupo && A.S === S;
  const jogando = () => vivo() && A.mode === 'jogo';
  const _v = new THREE.Vector3(), _f = new THREE.Vector3();
  const dist = p => Math.hypot(p.x - P.pos.x, p.z - P.pos.z);
  const olhando = (p, cone = .5, alc = 60, y = 1.9) => U.olhando ? U.olhando(p, cone, alc, y) : (() => {
    _v.set(p.x, y, p.z).sub(cam.position); const d = _v.length(); if (d > alc) return false; cam.getWorldDirection(_f); return _f.dot(_v.normalize()) > Math.cos(cone);
  })();
  const olharPara = o => { o.rotation.y = Math.atan2(P.pos.x - o.position.x, P.pos.z - o.position.z); };
  const medo = n => U.medo ? U.medo(n) : (S.fear = Math.min(100, Math.max(S.fear, 0) + n));
  const relampago = (k, tr) => U.relampago && U.relampago(k, tr);
  const falar = k => { if (A.R.falas && A.R.falas[k]) A.falar(k); };
  const noite = () => { let h = 0; try { h = (JSON.parse(localStorage.getItem('hora-silencio-estrada') || '{}').n) || 0; } catch (e) {} return h; };
  // uma semente estável por sessão (varia a aparência da noite sem depender de save)
  const seed = (() => { let s = 0; try { s = (localStorage.getItem('hora-silencio-v2') || '').length + (S.dif === 'pesadelo' ? 7 : S.dif === 'facil' ? 2 : 4); } catch (e) { s = 4; } return s; })();
  const pes = () => S.dif === 'pesadelo';

  // agenda própria (morre com a pausa e com o mapa)
  const fila = [];
  const agenda = (seg, fn) => fila.push({ t: seg, fn });
  const tickFila = dt => { for (let i = fila.length - 1; i >= 0; i--) { const f = fila[i]; f.t -= dt; if (f.t <= 0) { fila.splice(i, 1); if (vivo()) f.fn(); } } };

  // ---------------------------------------------------------------
  // APARÊNCIAS: decorações perturbadoras aplicadas a um vulto base
  // ---------------------------------------------------------------
  const cabecaDe = g => g.children.find(o => o.geometry && o.geometry.type === 'SphereGeometry');
  const novo = (tipo) => {
    const g = c.novoVulto(); g.visible = false; g.userData.tipo = tipo;
    const cab = cabecaDe(g);
    g.userData.olhos = g.children.filter(o => o.material && o.material.emissive && o.material.emissive.getHex && o.material.emissive.getHex() === 0x9a1810);
    if (tipo === 'molhado') { // encharcado: brilho molhado e gotas caindo
      g.traverse(o => { if (o.material && o.material.roughness !== undefined) { o.material = o.material.clone(); o.material.roughness = .2; o.material.color.setHex(0x05060a); } });
      const gotaMat = new THREE.MeshStandardMaterial({ color: 0x223040, transparent: true, opacity: .6, roughness: .1 });
      g.userData.gotas = []; for (let i = 0; i < 5; i++) { const d = cyl(.01, .01, .12, gotaMat, (Math.random() - .5) * .4, 1.8 + Math.random() * .8, .1, 4, g); g.userData.gotas.push({ m: d, y0: d.position.y, t: Math.random() }); }
      if (cab) cab.rotation.z = .9; // a cabeça do afogado pende demais pro lado
    } else if (tipo === 'crianca') { g.scale.set(.52, .52, .52); } // do tamanho da Ana
    else if (tipo === 'alto') { // alto demais, cabeça acima das árvores, com um braço erguido na direção da Lia
      g.scale.set(1.15, 1.7, 1.15);
      const braco = g.children.filter(o => o.geometry && o.geometry.type === 'CylinderGeometry' && o.position.y > 1.4 && Math.abs(o.position.x) > .2);
      if (braco[0]) { braco[0].rotation.z = -1.5; braco[0].position.y += .5; } // um braço esticado pra cima/frente
    } else if (tipo === 'semrosto' && cab) { // rosto apagado: oval claro e liso, com uma costura vertical onde seria a boca
      cab.material = new THREE.MeshStandardMaterial({ color: 0xcac0b0, emissive: 0x1a1612, emissiveIntensity: .25, roughness: .8 }); cab.scale.set(.9, 1.3, .7); cab.rotation.z = 0;
      g.userData.olhos.forEach(o => o.visible = false);
      const fio = new THREE.MeshStandardMaterial({ color: 0x2a0a08, roughness: 1 });
      for (let i = 0; i < 4; i++) box(.012, .02, .02, fio, (i - 1.5) * .018, 2.82 - Math.abs(i - 1.5) * .006, cab.position.z - .11, g, false); // pontos da costura
    } else if (tipo === 'costas') { if (cab) { cab.rotation.y = Math.PI; } g.userData.costas = true; } // de costas, mas a cabeça olha
    else if (tipo === 'sombra') { // pura sombra: material sem brilho, achatado, olhos quase apagados
      g.traverse(o => { if (o.material) { o.material = o.material.clone(); if (o.material.color) o.material.color.setHex(0x010103); o.material.roughness = 1; if (o.material.metalness !== undefined) o.material.metalness = 0; } });
      g.scale.z = .35; // fino como um recorte de papel preto
      g.userData.olhos.forEach(o => { o.material = o.material.clone(); o.material.emissiveIntensity = .3; });
    } else if (tipo === 'quebrado' && cab) { // pescoço quebrado num ângulo impossível
      cab.rotation.z = 1.6; cab.position.x += .18; g.userData.quebrado = true;
    }
    return g;
  };
  const vs = {}; // cache de vultos (uma instância por sistema, para dois sistemas nunca brigarem pelo mesmo mesh)
  const pegar = (tipo, key) => { const k = key || tipo; if (!vs[k]) vs[k] = novo(tipo); return vs[k]; };
  const esconderTodos = () => { for (const k in vs) if (vs[k]) vs[k].visible = false; if (bat.isca) bat.isca.intensity = 0; };
  // tipos possíveis desta noite, embaralhados pela semente
  const paleta = ['molhado', 'semrosto', 'costas', 'crianca', 'alto', 'sombra', 'quebrado'];
  const tipoDaNoite = () => paleta[(seed + noite()) % paleta.length];

  // animação comum dos vultos (pescoço torto que tremula; gotas do molhado)
  function animarVulto(g, dt, intens = 1) {
    const cab = cabecaDe(g);
    // respiração/balanço parado: a cabeça sobe e desce de leve (ninguém fica 100% imóvel — fica errado de propósito)
    if (cab) { if (cab.userData.by === undefined) cab.userData.by = cab.position.y; cab.position.y = cab.userData.by + Math.sin(A.perf() * 2 + (g.id || 0)) * .012; }
    if (cab && !g.userData.costas && !g.userData.quebrado) cab.rotation.z = .4 + Math.sin(A.perf() * 1.6 + (g.id || 0)) * .22 * intens;
    if (g.userData.quebrado && cab) cab.rotation.z = 1.6 + Math.sin(A.perf() * 2.4 + (g.id || 0)) * .08; // a cabeça quebrada balança pendurada
    if (g.userData.gotas) for (const d of g.userData.gotas) { d.t += dt * 1.6; if (d.t > 1) { d.t = 0; d.m.position.y = d.y0; } d.m.position.y = d.y0 - d.t * .9; d.m.material.opacity = .6 * (1 - d.t); }
  }
  // olhos que ardem mais forte conforme ele chega perto e piscam de vez em quando (some e volta)
  function ramparOlhos(g, d) {
    const k = Math.max(.4, Math.min(2.6, 2.6 - d * .05));
    const pisca = (Math.sin(A.perf() * .7 + (g.id || 0)) > .985) ? 0 : 1; // pálpebra rara: os olhos somem por um instante
    for (const o of (g.userData.olhos || [])) if (o.visible && o.material) o.material.emissiveIntensity = k * pisca;
  }
  // som de ambiente próprio de cada aparência
  function somDoTipo(tp, pos) {
    if (tp === 'molhado' && U.SX && U.SX.raspar) U.SX.raspar({ x: pos.x, y: 1, z: pos.z }, .8);
    else if (tp === 'crianca') A.SFX.caixinha(pos.x, pos.z);
    else if (tp === 'semrosto') A.SFX.sussurros(1.2);
    else if (tp === 'costas') A.SFX.passoMonstro(pos, .5);
    else if (tp === 'alto') A.SFX.trovao();
    else if (tp === 'quebrado') { A.SFX.estalo(pos, 1); A.SFX.estalo({ x: pos.x + .2, z: pos.z }, .6, true); } // dois estalos secos: osso
    else if (tp === 'sombra') A.SFX.sussurros(.8);
    else A.SFX.estalo(pos, .8);
  }

  // ===============================================================
  // 1) O BATEDOR DE 1979 — só anda quando você PARA (contra-jogo invertido)
  //    Janela: depois que o rádio diz que ele morreu (joaquimSumiu), na estrada, antes do portão.
  //    Chegar ao portão encerra. Sem dano (no Pesadelo, um sobressalto).
  // ===============================================================
  const bat = { fase: 0, vulto: null, dist: 46, t: 0, passoT: 0, vistoT: 0, dica: 0, paradoT: 0, lurch: 0, breatheT: 0, contaT: 0, hissT: 0, fachoT: 0, dicaFacho: false, semPilha: false, naoVistoT: 0, dicaCostas: false, isca: null, iscaT: 0, iscaFeita: false, iscaRevel: false };
  let lastPos = new THREE.Vector3(), velSuave = 0;
  function tickVel(dt) { // velocidade do jogador, suavizada; teleporte (QA) conta como "andando"
    const d = Math.hypot(P.pos.x - lastPos.x, P.pos.z - lastPos.z); lastPos.copy(P.pos);
    const inst = dt > 0 ? d / dt : 0; velSuave = velSuave * .6 + Math.min(inst, 8) * .4;
  }
  const andando = () => velSuave > .55 || P.bloqueado;
  function iniciarBatedor() {
    bat.fase = 1; bat.t = 0; bat.dist = pes() ? 40 : 46; bat.dica = 0; bat.semPilha = false; bat.dicaFacho = false; bat.iscaFeita = false; bat.iscaRevel = false; bat.contaFim = false;
    const n = noite();
    bat.rapidez = Math.min(.45, n * .06); // a cada noite ele dá o passo um pouco mais cedo
    const tp = (seed + n) % 3 === 0 ? 'quebrado' : seed % 2 ? 'semrosto' : 'sombra';
    const g = pegar(tp, 'bat'); bat.vulto = g;
    if (!g.userData.redEye) { const rl = new THREE.PointLight(0x9a1810, 0, 4, 2); rl.position.set(0, 2.8, 0); g.add(rl); g.userData.redEye = rl; } // os olhos lançam um brilho vermelho fraco no escuro à volta
    const zIni = GZ + 6 + Math.min(14, n * 3); // em noites repetidas ele já começa mais perto
    g.position.set(Math.max(-5, Math.min(5, P.pos.x * .3)), 0, zIni); g.visible = true; olharPara(g);
    if (n > 0 && !bat.dicaDeNovo) { bat.dicaDeNovo = true; falar('batedor_de_novo'); }
    // facho falso do batedor (idea do jogador): uma luzinha fraca no acostamento oposto, igual à da Lia
    if (!bat.isca) { bat.isca = new THREE.PointLight(0xdfe8ff, 0, 10, 2); bat.isca.position.set(0, 1.4, 0); grupo.add(bat.isca); }
    bat.isca.intensity = 0;
    S.flags.batedorViu = false; medo(10);
  }
  function tickBatedor(dt) {
    const podeJanela = S.flags.joaquimSumiu && !S.flags.perseguicao && !S.done.abrir_portao && P.room && P.room.id === 'estrada' && P.pos.z < -4 && P.pos.z > GZ + 5;
    if (bat.fase === 0) { if (podeJanela && S.flags.batedorFeito !== true) iniciarBatedor(); return; }
    if (!podeJanela && bat.fase < 5) { if (bat.vulto) bat.vulto.visible = false; if (bat.isca) bat.isca.intensity = 0; if (!S.done.abrir_portao) { bat.fase = 0; } return; }
    const g = bat.vulto; bat.t += dt; animarVulto(g, dt, 1.1);
    const d = dist(g.position), visto = olhando(g.position, .55, 70, 2);
    olharPara(g); ramparOlhos(g, d);
    if (g.userData.redEye) g.userData.redEye.intensity = S.flashOn ? 0 : Math.max(0, Math.min(1.1, 1.1 - d * .035)); // o brilho vermelho cresce no escuro, some na sua luz
    // o relâmpago o revela mais perto: se um clarão estoura enquanto você não olha pra ele, ele saltou
    const raioAgora = U.raio ? U.raio() : 0;
    if (raioAgora > .4 && !bat.raioFeito && !visto && d > 6) { bat.raioFeito = true; const dx = P.pos.x - g.position.x, dz = P.pos.z - g.position.z, L = Math.hypot(dx, dz) || 1, salto = Math.min(5, d * .3); g.position.x += dx / L * salto; g.position.z += dz / L * salto; A.SFX.passoMonstro({ x: g.position.x, z: g.position.z }, 1.1); }
    if (raioAgora < .1) bat.raioFeito = false;
    // apresenta
    if (!S.flags.batedorViu && visto) { S.flags.batedorViu = true; falar('batedor_1'); medo(8); A.SFX.estalo({ x: g.position.x, z: g.position.z }, 1, true); try { const m = JSON.parse(localStorage.getItem('hora-silencio-estrada') || '{}'); m.batedor = true; localStorage.setItem('hora-silencio-estrada', JSON.stringify(m)); } catch (e) {} }
    // contra-jogo da lanterna (idea do jogador): manter o FACHO nele o trava por mais tempo que só andar,
    // mas gasta a pilha fraca do prólogo — decisão luz-vs-passo que ensina a perseguição do jogo todo.
    const naLuz = S.flashOn && visto && d < 30 && !bat.semPilha;
    if (naLuz) {
      bat.passoT = Math.max(bat.passoT, 1.1); bat.paradoT = 0; bat.fachoT += dt; // trava de verdade enquanto iluminado
      // o facho gasta a pilha fraca (custo real da escolha), mas nunca te deixa no escuro total: piso de 30
      if (S.battery !== undefined && S.battery > 30) S.battery = Math.max(30, S.battery - dt * 7);
      if (S.battery !== undefined && S.battery <= 32 && !bat.semPilha) { bat.semPilha = true; falar('batedor_sem_pilha'); }
      if (!bat.dicaFacho && bat.fachoT > .8) { bat.dicaFacho = true; falar('batedor_facho'); }
      bat.hissT -= dt; if (bat.hissT <= 0) { bat.hissT = 1.6; A.SFX.estalo({ x: g.position.x, z: g.position.z }, .7, true); }
      const cb = cabecaDe(g); if (cb && !g.userData.quebrado) cb.rotation.z = .4 + Math.sin(A.perf() * 7) * .5; // sob a luz a cabeça range de um lado pro outro, rápido
    } else bat.fachoT = Math.max(0, bat.fachoT - dt);
    // o facho falso: aparece uma vez, do lado oposto; se você aponta a SUA luz na isca, ele revela que avançou mais perto
    if (bat.isca && S.flags.batedorViu && !bat.iscaFeita && bat.t > 2.5 && d > 14) {
      bat.iscaFeita = true; const lado = g.position.x <= P.pos.x ? 1 : -1; bat.isca.position.set(P.pos.x + lado * 4.5, 1.4, P.pos.z - 6); bat.isca.intensity = 1.1; falar('batedor_isca'); medo(6);
    }
    if (bat.isca && bat.isca.intensity > 0) {
      bat.isca.intensity = .7 + Math.sin(A.perf() * 2.1) * .4; // tremeluz como lanterna fraca
      if (!bat.iscaRevel && S.flashOn && olhando({ x: bat.isca.position.x, z: bat.isca.position.z }, .4, 30, 1.4)) {
        bat.iscaRevel = true; bat.isca.intensity = 0;
        const avanco = Math.min(8, d * .4); const dx = P.pos.x - g.position.x, dz = P.pos.z - g.position.z, L = Math.hypot(dx, dz) || 1;
        g.position.x += dx / L * avanco; g.position.z += dz / L * avanco; // ele usou a distração pra encostar
        A.SFX.susto(); A.SFX.estalo({ x: g.position.x, z: g.position.z }, 1); P.shake = Math.max(P.shake || 0, .14); relampago(1); falar('batedor_isca_revela'); medo(20); vibrar(.3, .15, 110);
      }
      bat.iscaT += dt; if (bat.iscaT > 6) { bat.isca.intensity = 0; bat.iscaT = 0; }
    }
    // respiração ofegante quando ele está perto
    if (d < 15) { bat.breatheT -= dt; if (bat.breatheT <= 0) { bat.breatheT = 2.2; if (U.SX && U.SX.respiracao) U.SX.respiracao({ x: g.position.x, y: 1.7, z: g.position.z }); } }
    // sussurro de contagem (o eco de 1979) enquanto ele avança
    if (!andando() && d < 34) { bat.contaT -= dt; if (bat.contaT <= 0) { bat.contaT = Math.max(.6, 1.4 - (34 - d) * .025); A.SFX.contagem({ x: g.position.x, z: g.position.z }, Math.max(0, Math.min(9, Math.round(d / 5)))); } } // conta mais rápido quanto mais perto
    // ele chega no "um": contagem termina colada em você (o pior número)
    if (d < 4 && !bat.contaFim) { bat.contaFim = true; A.SFX.contagem({ x: g.position.x, z: g.position.z }, 1); falar('batedor_conta_fim'); medo(18); }
    if (d > 9) bat.contaFim = false;
    // ele cresce quando você NÃO olha: parado e de costas pra ele, ele encosta mesmo sem você perceber
    if (!visto && !andando()) { bat.naoVistoT += dt; if (bat.naoVistoT > .5) { bat.naoVistoT = 0; const dx = P.pos.x - g.position.x, dz = P.pos.z - g.position.z, L = Math.hypot(dx, dz) || 1, passo = Math.min(1.6, d * .06); g.position.x += dx / L * passo; g.position.z += dz / L * passo; A.SFX.passoMonstro({ x: g.position.x, z: g.position.z }, 1.3); if (!bat.dicaCostas && d < 24) { bat.dicaCostas = true; falar('batedor_costas'); } } } else bat.naoVistoT = 0;
    const facil = S.dif === 'facil';
    // só avança quando o jogador está parado; congela quando anda
    if (!andando() && !naLuz) {
      bat.paradoT += dt;
      if (bat.paradoT > (facil ? .6 : .35)) { // um passo seco a cada intervalo, acelerando quando perto
        bat.passoT -= dt; if (bat.passoT <= 0) {
          bat.passoT = Math.max(facil ? .5 : .3, .95 - (46 - d) * .012 - (bat.rapidez || 0));
          if (visto) bat.passoT *= 1.5; // encarar sem luz já o atrasa um pouco; com luz ele trava de vez
          bat.manca = !bat.manca; // ele manca: um passo longo arrastado, outro curto (pé que não obedece)
          const salto = Math.max(.6, Math.min(2.4, d * .07)) * (facil ? .7 : 1) * (bat.manca ? 1.25 : .55);
          const dx = P.pos.x - g.position.x, dz = P.pos.z - g.position.z, L = Math.hypot(dx, dz) || 1;
          g.position.x += dx / L * salto; g.position.z += dz / L * salto;
          A.SFX.passoMonstro({ x: g.position.x, z: g.position.z }, (visto ? .85 : 1.2) * (bat.manca ? 1 : .55)); if (d < 20) vibrar(.2, .1, 70); // atrás de você, o passo soa mais alto
        }
      }
    } else { bat.paradoT = 0; bat.passoT = Math.min(bat.passoT, .2); }
    // Pesadelo: parado e perto, ele dá um bote de dois passos secos uma vez por aproximação
    if (pes() && !andando() && !naLuz && d < 7 && !bat.lungeFeito) { bat.lungeFeito = true; const dx = P.pos.x - g.position.x, dz = P.pos.z - g.position.z, L = Math.hypot(dx, dz) || 1; g.position.x += dx / L * 2.2; g.position.z += dz / L * 2.2; A.SFX.passoMonstro({ x: g.position.x, z: g.position.z }, 1.4); A.SFX.estalo({ x: g.position.x, z: g.position.z }, 1, true); medo(16); vibrar(.3, .15, 120); }
    if (d > 10) bat.lungeFeito = false; // rearma quando ele recua
    // passar correndo raspando nele: um sopro na nuca e um estalo, sem parar o jogo
    if (andando() && d < 3.5 && !bat.sopro) { bat.sopro = true; if (U.SX && U.SX.respiracao) U.SX.respiracao({ x: P.pos.x, y: 1.7, z: P.pos.z }); A.SFX.estalo({ x: g.position.x, z: g.position.z }, .8, true); medo(10); } else if (d > 6) bat.sopro = false;
    // vibração contínua de perto: o controle treme quanto mais ele encosta estando você parado
    if (!andando() && d < 10) vibrar(.03 + (10 - d) / 10 * .06, dt, 30);
    // dicas conforme ele encosta
    if (d < 26 && bat.dica < 1) { bat.dica = 1; falar('batedor_anda'); }
    if (d < 11 && bat.dica < 2) { bat.dica = 2; falar('batedor_perto'); medo(14); }
    S.fear = Math.max(S.fear, Math.min(92, 30 + (46 - d) * 1.3));
    // chegou perto demais estando parado: sobressalto e recua (puro clima; Pesadelo tira 15 de vida)
    if (d < 2.2) {
      A.SFX.susto(); A.SFX.estalo({ x: g.position.x, z: g.position.z }, 1.2); relampago(1); P.shake = Math.max(P.shake || 0, .22); medo(45); vibrar(.4, .2, 150);
      if (pes()) { S.health = Math.max(5, S.health - 15); S.capDano += 15; }
      g.position.set(Math.max(-5, Math.min(5, P.pos.x * .3)), 0, GZ + 10 - Math.min(8, noite() * 2)); bat.dist = 52; bat.dica = 1; // em noites repetidas ele recua menos
    }
    // chegar perto do portão encerra
    if (Math.hypot(P.pos.x, P.pos.z - GZ) < 6 && bat.fase < 5) { bat.fase = 5; S.flags.batedorFeito = true; g.visible = false; if (bat.isca) bat.isca.intensity = 0; falar('batedor_fim'); A.SFX.sinoLonge(); A.SFX.sussurros(1.2); medo(-10); }
    // enquanto o batedor está em cena, o medo nunca desce abaixo de um piso (a estrada não deixa respirar)
    if (bat.fase === 1) S.fear = Math.max(S.fear, 28);
  }

  // ===============================================================
  // 2) O ACOMPANHANTE PELA BORDA DA MATA — anda no seu passo, vira o rosto quando você para
  //    Janela: primeira perna (spawn -> posto), antes de falar com o velho. Não ataca.
  // ===============================================================
  const aco = { fase: 0, vulto: null, t: 0, passoT: 0, lado: 1, apareceT: 0, viu: 0, corridaT: 0, encaraT: 0, pedraT: 3, luzSeguraT: 0 };
  function tickAcompanha(dt) {
    const pode = !S.done.posto && !S.flags.perseguicao && S.inv.lanterna && P.room && P.room.id === 'estrada' && P.pos.z > -4 && P.pos.z < 12 && !bat.fase;
    if (aco.fase === 0) {
      if (!pode) return;
      aco.apareceT += dt; if (aco.apareceT < (noite() > 0 ? 2 : 6)) return; // em noites repetidas ele chega mais cedo
      aco.fase = 1; aco.lado = seed % 2 ? 1 : -1; aco.vulto = pegar('costas', 'aco'); aco.vulto.position.set(aco.lado * 10, 0, P.pos.z - 2); aco.vulto.visible = true; A.SFX.estalo({ x: aco.lado * 11, z: P.pos.z - 2 }, .6); return;
    }
    if (aco.fase === 2) { if (aco.vulto) aco.vulto.visible = false; if (aco.vulto2) aco.vulto2.visible = false; if (!pode) { aco.fase = 0; aco.apareceT = 0; } return; } // se livrou dele correndo
    if (!pode) { if (aco.vulto) aco.vulto.visible = false; if (aco.vulto2) aco.vulto2.visible = false; aco.fase = 0; aco.apareceT = 0; return; }
    const g = aco.vulto; animarVulto(g, dt, .7);
    // noites repetidas: um SEGUNDO vulto espreita do lado oposto por alguns segundos
    if (noite() > 1 && !aco.doisFeito && aco.t > 4) {
      aco.doisFeito = true; const g2 = pegar('quebrado', 'aco2'); aco.vulto2 = g2; g2.position.set(-aco.lado * 11, 0, P.pos.z - 4); g2.rotation.y = aco.lado > 0 ? Math.PI / 2 : -Math.PI / 2; g2.visible = true; aco.dois2T = 0; falar('acompanha_dois'); medo(10); A.SFX.estalo({ x: -aco.lado * 12, z: P.pos.z - 4 }, .6);
    }
    if (aco.vulto2 && aco.vulto2.visible) { aco.dois2T += dt; animarVulto(aco.vulto2, dt, .9); aco.vulto2.position.z += (P.pos.z - 2 - aco.vulto2.position.z) * Math.min(1, dt); if (aco.dois2T > 5) aco.vulto2.visible = false; }
    aco.t += dt;
    // contra-jogo: correr sem parar o deixa pra trás e ele some (você se livra dele correndo)
    if (P.sprinting && velSuave > 2) aco.corridaT += dt; else aco.corridaT = Math.max(0, aco.corridaT - dt * .5);
    if (aco.corridaT > 1.6) { g.visible = false; aco.fase = 2; A.SFX.passoMonstro({ x: g.position.x, z: g.position.z }, .2); return; }
    // ele imita quando você se agacha (abaixa junto)
    g.scale.y = THREE.MathUtils ? THREE.MathUtils.lerp(g.scale.y, P.crouch ? .62 : 1, Math.min(1, dt * 4)) : (P.crouch ? .62 : 1);
    // mantém o passo: segue o z do jogador com atraso, colado na borda do mato
    const lanterna = S.flashOn && olhando(g.position, .4, 60, 2);
    const alvoZ = P.pos.z - 1.2, alvoX = aco.lado * ((lanterna ? 12.5 : 9.4) + Math.sin(A.perf() * .3) * .6);
    const parado = !andando();
    if (!parado) { g.position.z += (alvoZ - g.position.z) * Math.min(1, dt * 1.6); g.position.x += (alvoX - g.position.x) * Math.min(1, dt * 1.2); g.rotation.y = aco.lado > 0 ? -Math.PI / 2 : Math.PI / 2; aco.passoT -= dt; if (aco.passoT <= 0) { aco.passoT = P.sprinting ? .3 : .6; A.SFX.passoMonstro({ x: g.position.x, z: g.position.z }, P.sprinting ? .42 : .32); } }
    else { olharPara(g); } // você parou: ele vira o rosto pra você, devagar (via olharPara)
    // apontar a lanterna o empurra pra dentro do mato (contra-jogo), e baixa o medo
    if (lanterna) { g.position.x += (alvoX - g.position.x) * Math.min(1, dt * 2.4); S.fear = Math.max(0, S.fear - 6 * dt); }
    // contra-jogo extra: segurar o facho nele por alguns segundos o dissolve no mato de vez (desta vez)
    if (lanterna) { aco.luzSeguraT += dt; if (aco.luzSeguraT > 2.5) { g.visible = false; aco.fase = 2; A.SFX.raspar && U.SX && U.SX.raspar && U.SX.raspar({ x: g.position.x, y: 1, z: g.position.z }, .7); medo(-6); return; } } else aco.luzSeguraT = Math.max(0, aco.luzSeguraT - dt);
    // ele atira um graveto/pedra do mato pra te fazer parar (e virar o rosto): o truque dele
    aco.pedraT -= dt; if (aco.pedraT <= 0 && parado) { aco.pedraT = 4 + Math.random() * 4; A.SFX.estalo({ x: aco.lado * 13, z: P.pos.z - 3 + A.rand(-3, 3) }, .5, true); }
    const visto = olhando(g.position, .45, 60, 2);
    if (visto && aco.viu < 1) { aco.viu = 1; falar('acompanha_1'); medo(8); }
    if (visto && parado && aco.viu < 2) { aco.viu = 2; falar('acompanha_olhar'); medo(10); A.SFX.sussurros(1); }
    // Pesadelo: encará-lo parado por tempo demais o faz dar um passo pra dentro da estrada
    if (pes() && visto && parado && !lanterna) { aco.encaraT += dt; if (aco.encaraT > 3) { aco.encaraT = 0; g.position.x += -aco.lado * 1.4; A.SFX.estalo({ x: g.position.x, z: g.position.z }, .8, true); medo(10); } } else aco.encaraT = 0;
    if (visto) S.fear = Math.max(S.fear, noite() > 0 ? 40 : 34); // em noites repetidas ele incomoda mais
  }

  // ===============================================================
  // 2b) OS FARÓIS QUE ACENDEM SOZINHOS (carro abandonado) — idea do jogador
  //    Uma vez, cedo no prólogo e perto do carro, os faróis mortos piscam por um segundo
  //    e revelam a silhueta do batedor morto parada bem à frente, no facho. Depois, escuro.
  // ===============================================================
  const fs = { feito: false, fase: 0, t: 0, vulto: null };
  function tickFaroisSozinhos(dt) {
    if (fs.feito || S.done.posto || S.flags.perseguicao || !P.room || P.room.id !== 'estrada') return;
    if (fs.fase === 0) {
      // espera a Lia estar perto do carro, virada mais ou menos para frente (faróis apontam pro portão)
      if (dist(carro.position) < 7 && P.pos.z < carro.position.z + 1 && Math.random() < dt * .25) {
        fs.fase = 1; fs.t = 0;
        const g = pegar(seed % 2 ? 'sombra' : 'quebrado', 'fsol'); fs.vulto = g;
        g.position.set(carro.position.x + A.rand(-.6, .6), 0, carro.position.z - 11); olharPara(g); g.visible = false;
      }
      return;
    }
    fs.t += dt;
    if (fs.t < .1) { farolOn(true); } // ACENDEM sozinhos
    if (noite() > 0 && fs.t > .4 && fs.t < .7) farolOn(((fs.t * 40) | 0) % 2 === 0); // em noites repetidas os faróis gaguejam, revelando o vulto em stop-motion
    if (fs.t > .12 && fs.t < .18 && fs.vulto) { fs.vulto.visible = true; A.SFX.estalo({ x: fs.vulto.position.x, z: fs.vulto.position.z }, 1, true); }
    if (fs.vulto && fs.vulto.visible) animarVulto(fs.vulto, dt, 1.2);
    if (fs.t > 1 && !fs.off) { fs.off = true; farolOn(false); if (fs.vulto) fs.vulto.visible = false; A.SFX.susto(); if (U.radioSozinho) U.radioSozinho(); medo(24); vibrar(.3, .15, 120); falar('farois_sozinhos'); P.shake = Math.max(P.shake || 0, .14); }
    if (fs.t > 1.4) { fs.feito = true; farolOn(false); }
  }

  // ===============================================================
  // 2c) OLHAR PARA TRÁS PERTO DO CARRO (Q) — ideas do jogador
  //    Olhando para trás, o Seu Joaquim aparece uns metros atrás, imóvel; vira pra frente e volta,
  //    sumiu. E, uma vez por noite, o batedor aparece sentado no banco de trás, rosto virado pra Lia.
  // ===============================================================
  const ret = { vulto: null, mostrando: false, cd: 0, bancoFig: null, bancoFeito: false, bancoMostra: false, armado: false };
  const olhandoTras = () => (P.olhar || 0) > 1.8; // Q segurado vira a câmera pra trás
  function novaBancoFig() { // silhueta sentada no banco de trás, rosto virado pra Lia
    const m = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 1 });
    const g = new THREE.Group();
    box(.42, .55, .28, m, 0, .5, 0, g); // tronco sentado
    const cab = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), m); cab.position.set(0, .92, 0); g.add(cab);
    const olhoMat = new THREE.MeshStandardMaterial({ color: 0x100000, emissive: 0x9a1810, emissiveIntensity: 1 });
    for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(.02, 6, 6), olhoMat); o.position.set(s * .045, .94, -.12); g.add(o); }
    g.userData.olhos = g.children.filter(o => o.material && o.material.emissive);
    g.position.set(carro.position.x - .4, .05, carro.position.z + .45); g.rotation.y = Math.PI; g.visible = false; grupo.add(g);
    return g;
  }
  function fazBancoFig() { if (!ret.bancoFig) ret.bancoFig = novaBancoFig(); return ret.bancoFig; }
  function tickRetrovisor(dt) {
    ret.cd = Math.max(0, ret.cd - dt);
    const perto = dist(carro.position) < 6 && !S.done.posto && !S.flags.perseguicao && P.room && P.room.id === 'estrada';
    // o banco de trás: uma vez por noite, ao olhar pra trás colado no carro, uma silhueta sentada encara a Lia
    if (perto && dist(carro.position) < 3.4 && olhandoTras() && !ret.bancoFeito && noite() >= 0) {
      ret.bancoFeito = true; const g = fazBancoFig(); g.visible = true; ret.bancoMostra = true; ret.bancoT = 0;
      A.SFX.sussurros(1.1); medo(18); falar('banco_tras'); ramparOlhos(g, 2);
    }
    if (ret.bancoMostra) {
      ret.bancoT = (ret.bancoT || 0) + dt; if (ret.bancoFig) ramparOlhos(ret.bancoFig, 2);
      // se você demora olhando, ela bate no vidro de dentro, com a unha
      if (ret.bancoT > 1.2 && !ret.bateu) { ret.bateu = true; A.SFX.estalo({ x: carro.position.x, z: carro.position.z + .3 }, 1, true); falar('banco_bate'); medo(14); vibrar(.25, .12, 90); }
      if (!olhandoTras() || ret.bancoT > 2.2) { ret.bancoMostra = false; if (ret.bancoFig) ret.bancoFig.visible = false; }
    }
    // o vulto atrás do carro no retrovisor: aparece imóvel enquanto você olha; some quando você vira e volta
    if (!perto) { if (ret.vulto && ret.vulto.visible) ret.vulto.visible = false; ret.mostrando = false; return; }
    if (olhandoTras()) {
      if (!ret.mostrando && ret.cd <= 0 && !bat.fase) {
        ret.mostrando = true;
        const g = pegar('sombra', 'retro'); ret.vulto = g;
        ret.vezes = (ret.vezes || 0) + 1; // a cada vez que você olha, ele está um pouco mais perto
        g.position.set(carro.position.x + A.rand(-1, 1), 0, carro.position.z + Math.max(1.5, 6 - ret.vezes * 1.2) + Math.random() * 2); olharPara(g); g.visible = true;
        A.SFX.estalo({ x: g.position.x, z: g.position.z }, .5, true); falar('retro_joaquim'); medo(10 + noite() * 5);
      }
      if (ret.vulto) { olharPara(ret.vulto); ramparOlhos(ret.vulto, dist(ret.vulto.position)); }
    } else {
      if (ret.mostrando) { ret.mostrando = false; if (ret.vulto) ret.vulto.visible = false; ret.cd = 6; falar('retro_sumiu'); } // virou pra frente: sumiu
    }
  }

  // ===============================================================
  // 2d) O CLARÃO NO BANCO DE TRÁS + A PORTA DO MOTORISTA — idea do jogador
  //    Antes de pegar a lanterna, um clarão mostra uma silhueta alta sentada no banco de trás.
  //    Ao abrir o porta-malas (pegar a lanterna), ela sumiu — mas a porta do motorista ficou aberta.
  // ===============================================================
  const porta = (() => { // porta do motorista (lado esquerdo do carro), começa fechada
    const m = new THREE.MeshStandardMaterial({ color: 0x14110e, roughness: .8, metalness: .2 });
    const piv = new THREE.Group(); piv.position.set(-.9, .6, -.6); carro.add(piv); // dobradiça na frente do vão
    box(.08, .62, 1.4, m, 0, .0, .7, piv); box(.06, .42, .9, MAT.vidro, 0, .38, .7, piv);
    piv.rotation.y = 0; return piv;
  })();
  const bf = { feito: false, fase: 0, t: 0, vulto: null, portaAberta: false, portaK: 0 };
  function tickBancoClarao(dt) {
    // anima a porta rumo ao alvo (aberta/fechada)
    bf.portaK += ((bf.portaAberta ? 1 : 0) - bf.portaK) * Math.min(1, dt * 3); porta.rotation.y = -bf.portaK * 1.1;
    if (bf.feito || S.inv.lanterna || S.flags.perseguicao || !P.room || P.room.id !== 'estrada') return;
    if (bf.fase === 0) {
      // perto do carro, olhando o banco de trás (janela traseira), dispara o clarão uma vez
      if (dist(carro.position) < 4 && olhando({ x: carro.position.x, z: carro.position.z + .4 }, .5, 8, 1.2) && Math.random() < dt * .5) {
        bf.fase = 1; bf.t = 0; if (!bf.vulto) { bf.vulto = novaBancoFig(); bf.vulto.scale.set(1.05, 1.7, 1.05); bf.vulto.position.y = .15; } // mais alta que uma pessoa sentada
      }
      return;
    }
    if (bf.fase === 1) {
      bf.t += dt;
      if (bf.t < .18) { if (bf.vulto) { bf.vulto.visible = true; ramparOlhos(bf.vulto, 1.5); } relampago(1.2); carro.position.y = -.04; } // o carro afunda na suspensão com o peso atrás
      else if (bf.t < .5) { if (bf.vulto) bf.vulto.visible = false; carro.position.y = 0; A.SFX.susto(); if (!bf.falou) { bf.falou = true; medo(22); falar('banco_clarao'); vibrar(.3, .15, 110); } }
      else if (bf.t > .9 && !bf.portaAberta) { bf.portaAberta = true; A.SFX.rangido(carro.position.x - .9, 1.1, carro.position.z - .6, .6); falar('porta_abriu'); medo(10); }
      if (bf.t > 2) { bf.fase = 2; bf.feito = true; if (bf.vulto) bf.vulto.visible = false; }
    }
  }

  // ===============================================================
  // 3) O VULTO TREINADO PELOS FARÓIS (abertura) — congela na luz, anda no escuro
  //    Roda só durante a cena (mode==='cena'); ensina a mecânica da Ana sem tutorial.
  // ===============================================================
  const farois = carro.children.filter(o => o.isSpotLight);
  const farolAceso = () => farois.some(l => l.intensity > 1);
  const fv = { vulto: null, t: 0, ensinou: false };
  function tickFarolVulto(dt) {
    if (A.mode !== 'cena') { if (fv.vulto) fv.vulto.visible = false; fv.t = 0; return; }
    if (!fv.vulto) fv.vulto = pegar('farol', 'farol');
    const g = fv.vulto; fv.t += dt;
    if (fv.t < 3) { g.visible = false; return; }
    if (!g.visible) { g.visible = true; g.position.set(-3.5, 0, carro.position.z - 16); g.rotation.y = 0; }
    g.position.z += (carro.position.z - 6 - g.position.z) * .001; // alvo: o capô
    // congela na luz dos faróis; anda (em passos) no escuro
    if (!farolAceso()) { g.position.z += dt * 2.2; const cab = cabecaDe(g); if (cab) cab.rotation.z = .4 + Math.sin(fv.t * 9) * .3; }
    if (!fv.ensinou && fv.t > 18.8) { fv.ensinou = true; agenda(.4, () => falar('farol_vulto')); }
    // some quando a cena acaba de matar os faróis (o jogador vai sair do carro)
    if (fv.t > 21) g.visible = false;
  }

  // ===============================================================
  // 4) APARIÇÕES PERTURBADORAS AVULSAS na estrada (uma por noite, no caminho)
  //    Um vulto do tipo da noite aparece de relance quando você olha para a mata, e some.
  // ===============================================================
  const ap = { feito: false, vulto: null, t: 0, armado: false, zAlvo: 0, saindoT: 0, vezes: 0 };
  const falaDoTipo = { molhado: 'vulto_molhado', crianca: 'vulto_crianca', semrosto: 'vulto_sem_rosto', costas: 'vulto_costas', alto: 'vulto_alto', sombra: 'vulto_sombra', quebrado: 'vulto_quebrado' };
  // distância em que cada aparência surge: o afogado encosta, o gigante fica longe pra caber na copa
  const distTipo = { molhado: 4.5, crianca: 6, semrosto: 7, costas: 7, sombra: 6, quebrado: 5, alto: 13 };
  function encerrarAp() {
    ap.vezes++; const max = noite() > 0 ? 2 : 1;
    if (ap.vezes < max) { ap.armado = false; ap.vulto = null; ap.tp = null; ap.saindoT = 0; ap.virou = false; ap.t = 0; ap.zAlvo = P.pos.z - 14 - Math.random() * 6; } // em noites repetidas, uma segunda aparição mais adiante
    else ap.feito = true;
  }
  function tickAparicao(dt) {
    if (ap.feito || !S.inv.lanterna || !P.room || P.room.id !== 'estrada' || S.flags.perseguicao) return;
    if (!ap.armado) { if (P.pos.z < 6 && P.pos.z > GZ + 18) { ap.armado = true; ap.zAlvo = P.pos.z - 10 - Math.random() * 8; } return; }
    if (!ap.vulto) { const tp = tipoDaNoite(); ap.vulto = pegar(tp, 'ap'); ap.tp = tp; }
    const g = ap.vulto;
    if (!g.visible) { // espera você passar da marca e aparece na beira, fora do centro da visão
      if (P.pos.z > ap.zAlvo) { const lado = Math.random() < .5 ? -1 : 1, base = distTipo[ap.tp] || 7; g.position.set(lado * (7 + Math.random() * 2), 0, P.pos.z - base - Math.random() * 3); olharPara(g); if (!olhando(g.position, .5, 50)) { g.visible = true; somDoTipo(ap.tp, { x: g.position.x, z: g.position.z }); } }
      return;
    }
    ap.t += dt; animarVulto(g, dt, 1); olharPara(g); ramparOlhos(g, dist(g.position));
    const visto = olhando(g.position, .4, 50, 2);
    // a aparição de costas gira de repente para te encarar antes de sumir
    if (visto && ap.tp === 'costas' && !ap.virou) { ap.virou = true; const cb = cabecaDe(g); if (cb) cb.rotation.y = 0; g.userData.costas = false; A.SFX.susto(); P.shake = Math.max(P.shake || 0, .12); }
    // ao ser visto, cada aparência dá o seu floreio antes de sumir (fica mais memorável que só piscar)
    if (visto && !ap.saindoT) {
      ap.saindoT = .0001;
      A.SFX.estalo({ x: g.position.x, z: g.position.z }, .9); medo(12); vibrar(.25, .12, 90); const fk = falaDoTipo[ap.tp]; if (fk) falar(fk);
      if (ap.tp === 'crianca') { A.SFX.risada(g.position.x, g.position.z); A.SFX.caixinha(g.position.x, g.position.z); }
      else if (ap.tp === 'alto') { g.userData.loom = true; A.SFX.trovao(); } // cresce um pouco mais ao ser visto
      else if (ap.tp === 'molhado' && U.SX && U.SX.raspar) U.SX.raspar({ x: g.position.x, y: 1, z: g.position.z }, 1);
      else if (ap.tp === 'semrosto') A.SFX.sussurros(1.4);
    }
    if (ap.saindoT) { ap.saindoT += dt; if (g.userData.loom) g.scale.y = Math.min(2.1, g.scale.y + dt * 1.2); if (ap.saindoT > .35 || ap.t > 7) { if (ap.tp === 'molhado') A.SFX.estalo({ x: g.position.x, z: g.position.z }, .4); /* a gota caindo onde ele estava */ g.visible = false; if (g.userData.loom) { g.scale.set(1.15, 1.7, 1.15); g.userData.loom = false; } encerrarAp(); } }
    else if (ap.t > 7) { g.visible = false; encerrarAp(); }
  }

  // ===============================================================
  // 5) PERSEGUIÇÃO — momentos a mais (ambiência; NÃO move o vc real do estrada-extra.js)
  //    Lê S.flags.perseguicao. Buzina do carro atrás, sussurros que sobem perto do portão,
  //    um vulto que corta na frente perto do portão, batimento cardíaco.
  // ===============================================================
  const per = { on: false, t: 0, corta: null, cortaFeito: false, buzT: 0, batT: 0, susT: 0, quaseFeito: false, paradoT: 0, luzAtrasFeito: false, luzAtrasT: 0, passosT: 0, passosAviso: false, luzAtras: null };
  function carPos() { return { x: carro.position.x, y: 1, z: carro.position.z }; }
  function tickPerseg(dt) {
    if (!S.flags.perseguicao || S.done.abrir_portao) {
      if (per.on) {
        // o portão abriu com ele quase em cima: um último baque e empurrão na saída
        if (S.done.abrir_portao && !per.fimBaque) { per.fimBaque = true; A.SFX.pancada && A.SFX.pancada(0, GZ); A.SFX.estalo({ x: 0, z: GZ }, 1.2); P.shake = Math.max(P.shake || 0, .2); vibrar(.4, .2, 150); }
        per.on = false; if (per.corta) per.corta.visible = false; if (per.luzAtras) per.luzAtras.intensity = 0;
      }
      if (S.done.abrir_portao && per.corta) per.corta.visible = false;
      return;
    }
    if (!per.on) { per.on = true; per.t = 0; per.cortaFeito = false; per.quaseFeito = false; }
    per.t += dt;
    const dPortao = Math.hypot(P.pos.x, P.pos.z - GZ);
    // buzina do carro atrás, chamando ele
    per.buzT -= dt; if (per.buzT <= 0 && dist(carro.position) > 10) { per.buzT = 4 + Math.random() * 3; if (U.SX && U.SX.buzina) U.SX.buzina(carPos(), .5); if (!per.buzAviso) { per.buzAviso = true; agenda(.3, () => falar('perseg_buzina')); } }
    // batimento cardíaco subindo conforme chega perto do portão (sprint do medo)
    per.batT -= dt; if (per.batT <= 0) { per.batT = Math.max(.5, .95 - (60 - Math.min(60, dPortao)) * .006); A.SFX.coracao(Math.min(1, .5 + (60 - Math.min(60, dPortao)) / 70)); }
    // sussurros que aceleram perto do portão
    per.susT -= dt; if (per.susT <= 0 && dPortao < 26) { per.susT = 2.2; A.SFX.sussurros(1); }
    // parar no meio da perseguição é punido: um sussurro extra e o medo sobe (continue andando)
    if (!andando()) { per.paradoT += dt; if (per.paradoT > 1) { per.paradoT = 0; A.SFX.sussurros(1.3); medo(12); } } else per.paradoT = 0;
    // os faróis do carro acendem atrás e varrem a estrada: a sombra da Lia estica e corre sozinha na frente
    if (!per.luzAtrasFeito && per.t > 2 && dPortao > 24 && dist(carro.position) > 12) {
      per.luzAtrasFeito = true; farolOn(true); per.luzAtrasT = 0;
      if (!per.luzAtras) { per.luzAtras = new THREE.PointLight(0xffe7b0, 0, 40, 1.2); grupo.add(per.luzAtras); }
      per.luzAtras.position.set(carro.position.x, 2, carro.position.z - 2); per.luzAtras.intensity = 8;
      falar('perseg_luz_atras'); medo(14); A.SFX.estalo(carPos(), .8);
    }
    if (per.luzAtras && per.luzAtras.intensity > 0) { per.luzAtrasT += dt; per.luzAtras.intensity = 8 * Math.max(0, 1 - per.luzAtrasT / 3); if (per.luzAtrasT > 3) { per.luzAtras.intensity = 0; farolOn(false); } }
    // passos ganhando atrás no cascalho (o medo de ser alcançada): cadência que acelera com o medo
    per.passosT -= dt; if (per.passosT <= 0) { per.passosT = Math.max(.32, .8 - (60 - Math.min(60, dPortao)) * .007); const atras = { x: P.pos.x + A.rand(-1, 1), z: P.pos.z + 2.5 + Math.random() * 1.5 }; A.SFX.passoMonstro(atras, 1); if (!per.passosAviso && per.t > 1) { per.passosAviso = true; falar('perseg_passos'); } }
    // um SEGUNDO vulto corta na frente, entre você e o portão (memorável)
    if (dPortao < 20 && !per.cortaFeito) {
      per.cortaFeito = true; const g = pegar('alto', 'corta'); per.corta = g;
      g.position.set(Math.max(-3.5, Math.min(3.5, P.pos.x)), 0, GZ + 6); g.visible = true; olharPara(g); relampago(1.1);
      agenda(.2, () => falar('perseg_corta')); medo(22);
      agenda(1.6, () => { if (vivo()) g.visible = false; }); // ele se dissolve: o portão continua passável
    }
    if (per.corta && per.corta.visible) { animarVulto(per.corta, dt, 1.4); olharPara(per.corta); }
    // "quase": um sopro perto demais uma vez, perto do portão
    if (dPortao < 9 && !per.quaseFeito) { per.quaseFeito = true; A.SFX.sussurros(1.4); if (U.SX && U.SX.respiracao) U.SX.respiracao({ x: P.pos.x, y: 1.7, z: P.pos.z }); falar('perseg_quase'); vibrar(.4, .2, 120); }
    // a voz chama "Lia" de dois lados, pra te desviar do portão
    per.chamadoT = (per.chamadoT || 0) - dt; if (per.chamadoT <= 0 && dPortao < 40) { per.chamadoT = 3.5 + Math.random() * 2; const lado = Math.random() < .5 ? -1 : 1; if (U.SX && U.SX.voz) U.SX.voz({ x: lado * 9, y: 1.6, z: P.pos.z - 2 }, 2, 230, true); if (!per.chamadoAviso) { per.chamadoAviso = true; agenda(.2, () => falar('perseg_chamado')); } }
    // o portão chacoalha sozinho conforme você chega (a saída te chama e te assusta)
    if (dPortao < 16) { per.gateT = (per.gateT || 0) - dt; if (per.gateT <= 0) { per.gateT = .7 + Math.random() * .6; A.SFX.trancado && A.SFX.trancado(); A.SFX.estalo({ x: 0, z: GZ }, .5); } }
    // olhar para trás na fuga (Q) revela um rosto colado uma vez: puni a curiosidade
    if ((P.olhar || 0) > 1.8 && !per.rostoFeito && per.t > 2) {
      per.rostoFeito = true; const g = pegar('semrosto', 'rosto'); g.scale.set(.6, .6, .6); g.position.set(P.pos.x, 1.1, P.pos.z + 1.3); olharPara(g); g.visible = true; A.SFX.susto(); P.shake = Math.max(P.shake || 0, .2); medo(30); vibrar(.4, .2, 150); falar('perseg_rosto');
      agenda(.5, () => { g.visible = false; g.scale.set(1, 1, 1); });
    }
    // vibração contínua que sobe com a proximidade do portão (coração na mão)
    if (dPortao < 30) vibrar(.05 + (30 - dPortao) / 30 * .12, dt, 40);
  }

  // ===============================================================
  // 6) O VELHO NA ESTRADA — no instante em que o rádio diz que ele morreu em 1979,
  //    a silhueta do Seu Joaquim aparece de pé na estrada e some no clarão seguinte.
  // ===============================================================
  const jr = { antes: false, feito: false, vulto: null, t: 0 };
  function tickJoaquimRevela(dt) {
    if (jr.feito) {
      if (jr.vulto && jr.vulto.visible) {
        jr.t += dt; olharPara(jr.vulto);
        // antes de sumir ele dá um passo pra trás, pro escuro, sem virar as costas
        if (jr.t > 1.4) { const dx = jr.vulto.position.x - P.pos.x, dz = jr.vulto.position.z - P.pos.z, L = Math.hypot(dx, dz) || 1; jr.vulto.position.x += dx / L * dt * 1.6; jr.vulto.position.z += dz / L * dt * 1.6; if (!jr.passo) { jr.passo = true; A.SFX.passoMonstro({ x: jr.vulto.position.x, z: jr.vulto.position.z }, .8); falar('joaquim_anda'); } }
        if (jr.t > 2.6) { jr.vulto.visible = false; relampago(1); }
      }
      return;
    }
    if (S.flags.joaquimSumiu && !jr.antes) {
      jr.antes = true; jr.feito = true; jr.t = 0;
      const g = pegar('sombra', 'jr'); jr.vulto = g;
      const zz = Math.min(-8, P.pos.z - 10);
      g.position.set(Math.max(-5, Math.min(5, P.pos.x * .4)), 0, zz); olharPara(g); g.visible = true; relampago(1.1); medo(14);
    }
  }

  // ===============================================================
  // 6b) O VULTO NA JANELA DA LOJA — depois que o rádio diz que o Seu Joaquim morreu em 1979,
  //     um rosto aparece na janela do posto, no lugar onde ele estava sentado, e some.
  // ===============================================================
  const jan = { feito: false, vulto: null, t: 0 };
  function tickVultoJanela(dt) {
    if (jan.feito || !S.flags.joaquimSumiu || !P.room || (P.room.id !== 'patioPosto' && P.room.id !== 'posto' && P.room.id !== 'estrada')) return;
    const alvo = { x: 16, z: -13.4 };
    if (!jan.vulto) { const g = pegar('semrosto', 'jan'); g.scale.set(.9, .9, .9); g.position.set(alvo.x, -.2, alvo.z); jan.vulto = g; }
    if (!jan.vulto.visible) {
      if (dist(alvo) < 14 && olhando(alvo, .45, 16, 1.6)) { jan.vulto.visible = true; jan.t = 0; olharPara(jan.vulto); A.SFX.sussurros(1); falar('vulto_janela'); medo(16); }
      return;
    }
    jan.t += dt; olharPara(jan.vulto); ramparOlhos(jan.vulto, dist(alvo));
    if (jan.t > 1.6) { jan.vulto.visible = false; jan.feito = true; A.SFX.estalo(alvo, .6, true); }
  }

  // ===============================================================
  // 6c) PASSOS NO PÁTIO DO POSTO — algo anda no cascalho e para quando você para
  //     (ensina de novo "o som te entrega / pare para escutar"), sem dano.
  // ===============================================================
  const pat = { t: 3, aviso: false };
  function tickPassosPatio(dt) {
    if (!S.flags.joaquimSumiu || S.flags.perseguicao || !P.room || P.room.id !== 'patioPosto') { pat.t = 2; return; }
    if (andando()) { pat.t -= dt; if (pat.t <= 0) { pat.t = .55 + Math.random() * .25; A.SFX.passoMonstro({ x: P.pos.x + A.rand(-2, 2), z: P.pos.z + 2 + Math.random() }, .5); } }
    else { pat.t = Math.min(pat.t, .3); if (!pat.aviso) { pat.aviso = true; agenda(.3, () => falar('passos_posto')); } }
  }

  // ===============================================================
  // 7) LEITURA ATMOSFÉRICA DO PERIGO — o escuro "pesa" conforme um vulto se aproxima:
  //    um infra-som que cresce com a proximidade do mais perto, galhos que estalam na mata
  //    quando o batedor anda no escuro e um coração surdo quando o medo está alto.
  // ===============================================================
  const amb = { zum: null, galhoT: 2, batPrev: null };
  function vultoMaisPerto() {
    let m = 99, pos = null;
    for (const k in vs) { const g = vs[k]; if (g && g.visible) { const dd = dist(g.position); if (dd < m) { m = dd; pos = g.position; } } }
    return { d: m, pos };
  }
  function tickAmbiente(dt) {
    const { d, pos } = vultoMaisPerto();
    // infra-som que pulsa junto da presença (fone sente antes do olho)
    const quer = d < 26 && pos;
    if (quer && !amb.zum && U.SX && U.SX.zumbido) amb.zum = U.SX.zumbido({ x: pos.x, y: 1, z: pos.z });
    if (amb.zum) { const alvo = quer ? Math.max(0, .12 * (1 - d / 26)) : 0; try { amb.zum.g.gain.value += (alvo - amb.zum.g.gain.value) * Math.min(1, dt * 2); } catch (e) {} if (!quer && amb.zum.g.gain.value < .002) { amb.zum.parar(); amb.zum = null; } }
    // galhos quebrando na mata enquanto o batedor avança no escuro, perto
    if (bat.fase === 1 && bat.vulto && bat.vulto.visible && !S.flashOn) { amb.galhoT -= dt; if (amb.galhoT <= 0) { amb.galhoT = 1.5 + Math.random() * 2; const lado = Math.random() < .5 ? -1 : 1; A.SFX.estalo({ x: lado * (7 + Math.random() * 4), z: P.pos.z - 3 + A.rand(-4, 4) }, .4, true); } }
    // coração surdo quando o medo transborda (fora da perseguição, que já tem o seu)
    if (!S.flags.perseguicao && S.fear > 72) { amb.corT = (amb.corT || 0) - dt; if (amb.corT <= 0) { amb.corT = 1.1; A.SFX.coracao(Math.min(1, (S.fear - 72) / 28)); } }
    // quando uma presença encosta de verdade (<4 m), a tela treme de leve, pulsando
    if (d < 4 && pos) P.shake = Math.max(P.shake || 0, .04 + (4 - d) * .02);
  }
  const pararAmb = () => { if (amb.zum) { try { amb.zum.parar(); } catch (e) {} amb.zum = null; } };

  // ===============================================================
  // 8) PEGADAS MOLHADAS saindo do carro — nas noites do afogado, uma trilha de pegadas
  //    encharcadas vai do carro pro mato, brilhando um pouco na lanterna. Só clima.
  // ===============================================================
  (function pegadasMolhadas() {
    if (tipoDaNoite() !== 'molhado') return;
    const m = new THREE.MeshStandardMaterial({ color: 0x04070c, roughness: .22, metalness: .1, transparent: true, opacity: .55 });
    let x = carro.position.x - 1, z = carro.position.z - 1, lado = 1;
    for (let i = 0; i < 7; i++) { const p = box(.16, .02, .3, m, x + lado * .18, .016, z, A.W.grupo, false); p.rotation.y = .2; lado = -lado; z -= 1.1 + Math.random() * .4; x -= .15; }
  })();

  // ===============================================================
  // tick principal
  // ===============================================================
  A.W.tick.push(dt => {
    tickFarolVulto(dt);
    if (!jogando()) { if (A.mode !== 'cena') { esconderTodos(); pararAmb(); } return; }
    tickFila(dt); tickVel(dt);
    tickJoaquimRevela(dt); tickBatedor(dt); tickAcompanha(dt); tickAparicao(dt); tickPerseg(dt);
    tickFaroisSozinhos(dt); tickRetrovisor(dt); tickBancoClarao(dt); tickAmbiente(dt);
    tickVultoJanela(dt); tickPassosPatio(dt);
  });

  return { api: { esconderTodos, iniciarBatedor }, util: { tipoDaNoite } };
}
