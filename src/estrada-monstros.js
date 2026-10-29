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
    } else if (tipo === 'crianca') { g.scale.set(.52, .52, .52); } // do tamanho da Ana
    else if (tipo === 'alto') { g.scale.set(1.15, 1.7, 1.15); } // alto demais, cabeça acima das árvores
    else if (tipo === 'semrosto' && cab) { // rosto apagado: oval claro e liso
      cab.material = new THREE.MeshStandardMaterial({ color: 0xcac0b0, emissive: 0x1a1612, emissiveIntensity: .25, roughness: .8 }); cab.scale.set(.9, 1.3, .7); cab.rotation.z = 0;
      g.userData.olhos.forEach(o => o.visible = false);
    } else if (tipo === 'costas') { if (cab) { cab.rotation.y = Math.PI; } g.userData.costas = true; } // de costas, mas a cabeça olha
    return g;
  };
  const vs = {}; // cache de vultos (uma instância por sistema, para dois sistemas nunca brigarem pelo mesmo mesh)
  const pegar = (tipo, key) => { const k = key || tipo; if (!vs[k]) vs[k] = novo(tipo); return vs[k]; };
  const esconderTodos = () => { for (const k in vs) if (vs[k]) vs[k].visible = false; };
  // tipos possíveis desta noite, embaralhados pela semente
  const paleta = ['molhado', 'semrosto', 'costas', 'crianca', 'alto', 'sombra'];
  const tipoDaNoite = () => paleta[(seed + noite()) % paleta.length];

  // animação comum dos vultos (pescoço torto que tremula; gotas do molhado)
  function animarVulto(g, dt, intens = 1) {
    const cab = cabecaDe(g); if (cab && !g.userData.costas) cab.rotation.z = .4 + Math.sin(A.perf() * 1.6 + (g.id || 0)) * .22 * intens;
    if (g.userData.gotas) for (const d of g.userData.gotas) { d.t += dt * 1.6; if (d.t > 1) { d.t = 0; d.m.position.y = d.y0; } d.m.position.y = d.y0 - d.t * .9; d.m.material.opacity = .6 * (1 - d.t); }
  }
  // olhos que ardem mais forte conforme ele chega perto
  function ramparOlhos(g, d) { const k = Math.max(.4, Math.min(2.6, 2.6 - d * .05)); for (const o of (g.userData.olhos || [])) if (o.visible && o.material) o.material.emissiveIntensity = k; }
  // som de ambiente próprio de cada aparência
  function somDoTipo(tp, pos) {
    if (tp === 'molhado' && U.SX && U.SX.raspar) U.SX.raspar({ x: pos.x, y: 1, z: pos.z }, .8);
    else if (tp === 'crianca') A.SFX.caixinha(pos.x, pos.z);
    else if (tp === 'semrosto') A.SFX.sussurros(1.2);
    else if (tp === 'costas') A.SFX.passoMonstro(pos, .5);
    else if (tp === 'alto') A.SFX.trovao();
    else A.SFX.estalo(pos, .8);
  }

  // ===============================================================
  // 1) O BATEDOR DE 1979 — só anda quando você PARA (contra-jogo invertido)
  //    Janela: depois que o rádio diz que ele morreu (joaquimSumiu), na estrada, antes do portão.
  //    Chegar ao portão encerra. Sem dano (no Pesadelo, um sobressalto).
  // ===============================================================
  const bat = { fase: 0, vulto: null, dist: 46, t: 0, passoT: 0, vistoT: 0, dica: 0, paradoT: 0, lurch: 0, breatheT: 0, contaT: 0, hissT: 0 };
  let lastPos = new THREE.Vector3(), velSuave = 0;
  function tickVel(dt) { // velocidade do jogador, suavizada; teleporte (QA) conta como "andando"
    const d = Math.hypot(P.pos.x - lastPos.x, P.pos.z - lastPos.z); lastPos.copy(P.pos);
    const inst = dt > 0 ? d / dt : 0; velSuave = velSuave * .6 + Math.min(inst, 8) * .4;
  }
  const andando = () => velSuave > .55 || P.bloqueado;
  function iniciarBatedor() {
    bat.fase = 1; bat.t = 0; bat.dist = pes() ? 40 : 46; bat.dica = 0;
    const g = pegar(seed % 2 ? 'semrosto' : 'sombra', 'bat'); bat.vulto = g;
    g.position.set(Math.max(-5, Math.min(5, P.pos.x * .3)), 0, GZ + 6); g.visible = true; olharPara(g);
    S.flags.batedorViu = false; medo(10);
  }
  function tickBatedor(dt) {
    const podeJanela = S.flags.joaquimSumiu && !S.flags.perseguicao && !S.done.abrir_portao && P.room && P.room.id === 'estrada' && P.pos.z < -4 && P.pos.z > GZ + 5;
    if (bat.fase === 0) { if (podeJanela && S.flags.batedorFeito !== true) iniciarBatedor(); return; }
    if (!podeJanela && bat.fase < 5) { if (bat.vulto) bat.vulto.visible = false; if (!S.done.abrir_portao) { bat.fase = 0; } return; }
    const g = bat.vulto; bat.t += dt; animarVulto(g, dt, 1.1);
    const d = dist(g.position), visto = olhando(g.position, .55, 70, 2);
    olharPara(g); ramparOlhos(g, d);
    // apresenta
    if (!S.flags.batedorViu && visto) { S.flags.batedorViu = true; falar('batedor_1'); medo(8); A.SFX.estalo({ x: g.position.x, z: g.position.z }, 1, true); try { const m = JSON.parse(localStorage.getItem('hora-silencio-estrada') || '{}'); m.batedor = true; localStorage.setItem('hora-silencio-estrada', JSON.stringify(m)); } catch (e) {} }
    // contra-jogo: apontar a lanterna nele trava o próximo passo e arranca um chiado (não resolve — você ainda tem que andar)
    const naLuz = S.flashOn && visto && d < 30;
    if (naLuz) { bat.passoT = Math.max(bat.passoT, .5); bat.hissT -= dt; if (bat.hissT <= 0) { bat.hissT = 1.6; A.SFX.estalo({ x: g.position.x, z: g.position.z }, .7, true); } }
    // respiração ofegante quando ele está perto
    if (d < 15) { bat.breatheT -= dt; if (bat.breatheT <= 0) { bat.breatheT = 2.2; if (U.SX && U.SX.respiracao) U.SX.respiracao({ x: g.position.x, y: 1.7, z: g.position.z }); } }
    // sussurro de contagem (o eco de 1979) enquanto ele avança
    if (!andando() && d < 34) { bat.contaT -= dt; if (bat.contaT <= 0) { bat.contaT = 1.4; A.SFX.contagem({ x: g.position.x, z: g.position.z }, Math.max(0, Math.min(9, Math.round(d / 5)))); } }
    const facil = S.dif === 'facil';
    // só avança quando o jogador está parado; congela quando anda
    if (!andando() && !naLuz) {
      bat.paradoT += dt;
      if (bat.paradoT > (facil ? .6 : .35)) { // um passo seco a cada intervalo, acelerando quando perto
        bat.passoT -= dt; if (bat.passoT <= 0) {
          bat.passoT = Math.max(facil ? .5 : .35, .95 - (46 - d) * .012);
          const salto = Math.max(.6, Math.min(2.4, d * .07)) * (facil ? .7 : 1);
          const dx = P.pos.x - g.position.x, dz = P.pos.z - g.position.z, L = Math.hypot(dx, dz) || 1;
          g.position.x += dx / L * salto; g.position.z += dz / L * salto;
          A.SFX.passoMonstro({ x: g.position.x, z: g.position.z }, visto ? .85 : 1.2); if (d < 20) vibrar(.2, .1, 70); // atrás de você, o passo soa mais alto
        }
      }
    } else { bat.paradoT = 0; bat.passoT = Math.min(bat.passoT, .2); }
    // dicas conforme ele encosta
    if (d < 26 && bat.dica < 1) { bat.dica = 1; falar('batedor_anda'); }
    if (d < 11 && bat.dica < 2) { bat.dica = 2; falar('batedor_perto'); medo(14); }
    S.fear = Math.max(S.fear, Math.min(92, 30 + (46 - d) * 1.3));
    // chegou perto demais estando parado: sobressalto e recua (puro clima; Pesadelo tira 15 de vida)
    if (d < 2.2) {
      A.SFX.susto(); A.SFX.estalo({ x: g.position.x, z: g.position.z }, 1.2); relampago(1); P.shake = Math.max(P.shake || 0, .22); medo(45); vibrar(.4, .2, 150);
      if (pes()) { S.health = Math.max(5, S.health - 15); S.capDano += 15; }
      g.position.set(Math.max(-5, Math.min(5, P.pos.x * .3)), 0, GZ + 10); bat.dist = 52; bat.dica = 1;
    }
    // chegar perto do portão encerra
    if (Math.hypot(P.pos.x, P.pos.z - GZ) < 6 && bat.fase < 5) { bat.fase = 5; S.flags.batedorFeito = true; g.visible = false; falar('batedor_fim'); A.SFX.sinoLonge(); }
  }

  // ===============================================================
  // 2) O ACOMPANHANTE PELA BORDA DA MATA — anda no seu passo, vira o rosto quando você para
  //    Janela: primeira perna (spawn -> posto), antes de falar com o velho. Não ataca.
  // ===============================================================
  const aco = { fase: 0, vulto: null, t: 0, passoT: 0, lado: 1, apareceT: 0, viu: 0, corridaT: 0, encaraT: 0 };
  function tickAcompanha(dt) {
    const pode = !S.done.posto && !S.flags.perseguicao && S.inv.lanterna && P.room && P.room.id === 'estrada' && P.pos.z > -4 && P.pos.z < 12 && !bat.fase;
    if (aco.fase === 0) {
      if (!pode) return;
      aco.apareceT += dt; if (aco.apareceT < (noite() > 0 ? 2 : 6)) return; // em noites repetidas ele chega mais cedo
      aco.fase = 1; aco.lado = seed % 2 ? 1 : -1; aco.vulto = pegar('costas', 'aco'); aco.vulto.position.set(aco.lado * 10, 0, P.pos.z - 2); aco.vulto.visible = true; A.SFX.estalo({ x: aco.lado * 11, z: P.pos.z - 2 }, .6); return;
    }
    if (aco.fase === 2) { if (aco.vulto) aco.vulto.visible = false; if (!pode) { aco.fase = 0; aco.apareceT = 0; } return; } // se livrou dele correndo
    if (!pode) { if (aco.vulto) aco.vulto.visible = false; aco.fase = 0; aco.apareceT = 0; return; }
    const g = aco.vulto; animarVulto(g, dt, .7);
    // contra-jogo: correr sem parar o deixa pra trás e ele some (você se livra dele correndo)
    if (P.sprinting && velSuave > 2) aco.corridaT += dt; else aco.corridaT = Math.max(0, aco.corridaT - dt * .5);
    if (aco.corridaT > 1.6) { g.visible = false; aco.fase = 2; A.SFX.passoMonstro({ x: g.position.x, z: g.position.z }, .2); return; }
    // ele imita quando você se agacha (abaixa junto)
    g.scale.y = THREE.MathUtils ? THREE.MathUtils.lerp(g.scale.y, P.crouch ? .62 : 1, Math.min(1, dt * 4)) : (P.crouch ? .62 : 1);
    // mantém o passo: segue o z do jogador com atraso, colado na borda do mato
    const lanterna = S.flashOn && olhando(g.position, .4, 60, 2);
    const alvoZ = P.pos.z - 1.2, alvoX = aco.lado * ((lanterna ? 12.5 : 9.4) + Math.sin(A.perf() * .3) * .6);
    const parado = !andando();
    if (!parado) { g.position.z += (alvoZ - g.position.z) * Math.min(1, dt * 1.6); g.position.x += (alvoX - g.position.x) * Math.min(1, dt * 1.2); g.rotation.y = aco.lado > 0 ? -Math.PI / 2 : Math.PI / 2; aco.passoT -= dt; if (aco.passoT <= 0) { aco.passoT = .6; A.SFX.passoMonstro({ x: g.position.x, z: g.position.z }, .32); } }
    else { olharPara(g); } // você parou: ele vira o rosto pra você, devagar (via olharPara)
    // apontar a lanterna o empurra pra dentro do mato (contra-jogo), e baixa o medo
    if (lanterna) { g.position.x += (alvoX - g.position.x) * Math.min(1, dt * 2.4); S.fear = Math.max(0, S.fear - 6 * dt); }
    const visto = olhando(g.position, .45, 60, 2);
    if (visto && aco.viu < 1) { aco.viu = 1; falar('acompanha_1'); medo(8); }
    if (visto && parado && aco.viu < 2) { aco.viu = 2; falar('acompanha_olhar'); medo(10); A.SFX.sussurros(1); }
    // Pesadelo: encará-lo parado por tempo demais o faz dar um passo pra dentro da estrada
    if (pes() && visto && parado && !lanterna) { aco.encaraT += dt; if (aco.encaraT > 3) { aco.encaraT = 0; g.position.x += -aco.lado * 1.4; A.SFX.estalo({ x: g.position.x, z: g.position.z }, .8, true); medo(10); } } else aco.encaraT = 0;
    if (visto) S.fear = Math.max(S.fear, noite() > 0 ? 40 : 34); // em noites repetidas ele incomoda mais
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
  const ap = { feito: false, vulto: null, t: 0, armado: false, zAlvo: 0 };
  const falaDoTipo = { molhado: 'vulto_molhado', crianca: 'vulto_crianca', semrosto: 'vulto_sem_rosto', costas: 'vulto_costas', alto: 'vulto_alto' };
  function tickAparicao(dt) {
    if (ap.feito || !S.inv.lanterna || !P.room || P.room.id !== 'estrada' || S.flags.perseguicao) return;
    if (!ap.armado) { if (P.pos.z < 6 && P.pos.z > GZ + 18) { ap.armado = true; ap.zAlvo = P.pos.z - 10 - Math.random() * 8; } return; }
    if (!ap.vulto) { const tp = tipoDaNoite(); ap.vulto = pegar(tp, 'ap'); ap.tp = tp; }
    const g = ap.vulto;
    if (!g.visible) { // espera você passar da marca e aparece na beira, fora do centro da visão
      if (P.pos.z > ap.zAlvo) { const lado = Math.random() < .5 ? -1 : 1; g.position.set(lado * (8.5 + Math.random() * 3), 0, P.pos.z - 6 - Math.random() * 6); olharPara(g); if (!olhando(g.position, .5, 50)) { g.visible = true; somDoTipo(ap.tp, { x: g.position.x, z: g.position.z }); } }
      return;
    }
    ap.t += dt; animarVulto(g, dt, 1); olharPara(g); ramparOlhos(g, dist(g.position));
    const visto = olhando(g.position, .4, 50, 2);
    // a aparição de costas gira de repente para te encarar antes de sumir
    if (visto && ap.tp === 'costas' && !ap.virou) { ap.virou = true; const cb = cabecaDe(g); if (cb) cb.rotation.y = 0; g.userData.costas = false; A.SFX.susto(); P.shake = Math.max(P.shake || 0, .12); }
    if (visto || ap.t > 7) {
      g.visible = false; ap.feito = true;
      if (visto) { A.SFX.estalo({ x: g.position.x, z: g.position.z }, .9); medo(12); vibrar(.25, .12, 90); const fk = falaDoTipo[ap.tp]; if (fk) falar(fk); }
    }
  }

  // ===============================================================
  // 5) PERSEGUIÇÃO — momentos a mais (ambiência; NÃO move o vc real do estrada-extra.js)
  //    Lê S.flags.perseguicao. Buzina do carro atrás, sussurros que sobem perto do portão,
  //    um vulto que corta na frente perto do portão, batimento cardíaco.
  // ===============================================================
  const per = { on: false, t: 0, corta: null, cortaFeito: false, buzT: 0, batT: 0, susT: 0, quaseFeito: false, paradoT: 0 };
  function carPos() { return { x: carro.position.x, y: 1, z: carro.position.z }; }
  function tickPerseg(dt) {
    if (!S.flags.perseguicao || S.done.abrir_portao) {
      if (per.on) { per.on = false; if (per.corta) per.corta.visible = false; }
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
  }

  // ===============================================================
  // 6) O VELHO NA ESTRADA — no instante em que o rádio diz que ele morreu em 1979,
  //    a silhueta do Seu Joaquim aparece de pé na estrada e some no clarão seguinte.
  // ===============================================================
  const jr = { antes: false, feito: false, vulto: null, t: 0 };
  function tickJoaquimRevela(dt) {
    if (jr.feito) { if (jr.vulto && jr.vulto.visible) { jr.t += dt; olharPara(jr.vulto); if (jr.t > 2.6) { jr.vulto.visible = false; relampago(1); } } return; }
    if (S.flags.joaquimSumiu && !jr.antes) {
      jr.antes = true; jr.feito = true; jr.t = 0;
      const g = pegar('sombra', 'jr'); jr.vulto = g;
      const zz = Math.min(-8, P.pos.z - 10);
      g.position.set(Math.max(-5, Math.min(5, P.pos.x * .4)), 0, zz); olharPara(g); g.visible = true; relampago(1.1); medo(14);
    }
  }

  // ===============================================================
  // tick principal
  // ===============================================================
  A.W.tick.push(dt => {
    tickFarolVulto(dt);
    if (!jogando()) { if (A.mode !== 'cena') esconderTodos(); return; }
    tickFila(dt); tickVel(dt);
    tickJoaquimRevela(dt); tickBatedor(dt); tickAcompanha(dt); tickAparicao(dt); tickPerseg(dt);
  });

  return { api: { esconderTodos, iniciarBatedor }, util: { tipoDaNoite } };
}
