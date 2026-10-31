// PRÓLOGO — Lote 6: REJOGABILIDADE da estrada velha. Chamado por estrada() em mapas.js DEPOIS de
// monstrosEstrada(). Nada aqui bloqueia o caminho obrigatório nem muda o fluxo da chave/portão.
//
// Duas famílias de coisa:
//  1) VARIAÇÕES SORTEADAS PELA SEMENTE (valem já na 1ª noite): clima/névoa, lua, tom do carro, cor do
//     neon, o achado do balcão (bilhete/foto/pilha), o ponto do Seu Joaquim morto, um boato no rádio,
//     um desafio opcional da noite e um resumo do que mudou ao chegar no portão.
//  2) SEGREDOS QUE SÓ EXISTEM NA REJOGADA (noite > 1 ou já zerou): o quartinho de infância do Moacir
//     (só depois do final verdadeiro), a sala do zelador com o mapa de giz, o porta-luvas-cofre do
//     carro, o carro de 1979 no acostamento, o último ônibus ao fundo e o aviso do atalho conhecido.
//  Mais recordes de travessia, selos e a contagem de noites do prólogo.
import { TXT6, mesclarL6 } from './estrada-lote6-texto.js';

const MEM6 = 'hora-silencio-estrada6';
const CONQ_KEY = 'hora-silencio-v2-conq';
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const mem6 = () => lsGet(MEM6, {}) || {};
const mem6Set = (o) => { const m = mem6(); Object.assign(m, o); lsSet(MEM6, m); };
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function rejogoEstrada(A, S, c) {
  const { THREE, MAT, box, cyl, plano, prop, interact, item } = A;
  mesclarL6(A.R);
  const grupo = A.W.grupo, P = A.P, cam = A.camera, GZ = c.GZ, BZ = c.BZ, carro = c.carro, fora = c.fora;
  const U = (c.ex && c.ex.util) || {};
  const vivo = () => A.W.grupo === grupo && A.S === S;
  const jogando = () => vivo() && A.mode === 'jogo';
  const _v = new THREE.Vector3(), _f = new THREE.Vector3();
  const dist = (x, z) => Math.hypot(x - P.pos.x, z - P.pos.z);
  const olhando = (p, cone = .5, alc = 60, y = 1.8) => U.olhando ? U.olhando(p, cone, alc, y) : (() => {
    _v.set(p.x, y, p.z).sub(cam.position); const d = _v.length(); if (d > alc) return false; cam.getWorldDirection(_f); return _f.dot(_v.normalize()) > Math.cos(cone);
  })();
  const olharPara = o => { o.rotation.y = Math.atan2(P.pos.x - o.position.x, P.pos.z - o.position.z); };
  const medo = n => U.medo ? U.medo(n) : (S.fear = Math.min(100, Math.max(S.fear, 0) + n));
  const relampago = (k, tr) => U.relampago && U.relampago(k, tr);
  const falar = k => { if (A.R.falas && A.R.falas[k]) A.falar(k); };
  const SX = U.SX || null;

  // agenda própria (morre com a pausa e com o mapa)
  const fila = [];
  const agenda = (seg, fn) => fila.push({ t: seg, fn });
  const tickFila = dt => { for (let i = fila.length - 1; i >= 0; i--) { const f = fila[i]; f.t -= dt; if (f.t <= 0) { fila.splice(i, 1); if (vivo()) f.fn(); } } };

  // ------------------------------------------------------------- estado persistente da noite
  const stats = () => { try { return A.stats ? (A.stats() || {}) : lsGet('hora-silencio-stats', {}) || {}; } catch (e) { return {}; } };
  const noite = () => Math.max(1, S.flags._noite || stats().partidas || 1);
  const finais = () => { const q = lsGet(CONQ_KEY, {}) || {}; return { comum: !!q.final_comum, silencio: !!q.final_silencio, verdadeiro: !!q.final_verdadeiro }; };
  const zerou = () => { const f = finais(); return f.comum || f.silencio || f.verdadeiro; };
  const rejogo = () => noite() > 1 || zerou();           // "a partir da segunda jogada"
  const verdadeiro = () => finais().verdadeiro;           // viu o final verdadeiro ao menos uma vez

  // semente estável desta noite (varia tudo sem depender de save; determinística por noite/dificuldade)
  const seed = (() => {
    let h = 2166136261 >>> 0;
    const base = 'HS6:' + noite() + ':' + (S.dif || 'normal') + ':' + ((lsGet('hora-silencio-v2', null) ? JSON.stringify(lsGet('hora-silencio-v2', {})).length : 0));
    for (let i = 0; i < base.length; i++) { h ^= base.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h;
  })();
  let rngS = seed || 1;
  const rnd = () => { rngS ^= rngS << 13; rngS ^= rngS >>> 17; rngS ^= rngS << 5; rngS >>>= 0; return rngS / 4294967296; };
  const pick = arr => arr[Math.floor(rnd() * arr.length) % arr.length];
  const chance = p => rnd() < p;

  // resumo "o que mudou nesta noite" (mostrado ao chegar no portão)
  const variacoes = [];
  const marcarVar = t => { if (!variacoes.includes(t)) variacoes.push(t); };

  // =================================================================== 1) CLIMA / CÉU SORTEADOS
  // três climas possíveis; muda a névoa, a luz do céu e a lua, e fica gravado como prenúncio da noite.
  const CLIMAS = ['chuva', 'neblina', 'seca'];
  const clima = CLIMAS[seed % 3];
  (function aplicarClima() {
    if (clima === 'chuva') { fora.fog = Math.min(.085, fora.fog + .02); fora.hemi = .46; fora.moon = .5; marcarVar('chuva fina'); }
    else if (clima === 'neblina') { fora.fog = Math.min(.11, fora.fog + .045); fora.hemi = .4; fora.moon = .35; marcarVar('serração densa'); }
    else { fora.fog = Math.max(.03, fora.fog - .012); fora.hemi = .62; fora.moon = .95; marcarVar('noite seca'); }
    S.flags.climaNoite = clima;                    // prenúncio: a noite combina (lido por quem quiser)
    try {
      const m = mem6(); m.clima = clima; m.climas = m.climas || {}; m.climas[clima] = true; lsSet(MEM6, m);
      if (m.climas.chuva && m.climas.neblina && m.climas.seca && !m.meteoro) { m.meteoro = true; lsSet(MEM6, m); agenda(8, () => { A.conquista('est6_clima'); falar('est6_meteoro'); }); }
    } catch (e) {}
  })();
  // leve variação de lua por semente (céu nunca idêntico)
  fora.moon = clamp(fora.moon + (rnd() - .5) * .18, .2, 1.1);

  // =================================================================== 2) TOM DO CARRO E DO NEON
  (function tingir() {
    try {
      if (MAT.carro && MAT.carro.color) { const tons = [0x2a2622, 0x241f28, 0x2c2420, 0x202828]; MAT.carro.color.setHex(tons[seed % tons.length]); }
    } catch (e) {}
  })();

  // =================================================================== 2b) ATMOSFERA DO CLIMA (visual)
  // cada clima deixa um rastro visível no cenário do posto/estrada, sorteado pela semente.
  (function atmosferaClima() {
    if (clima === 'seca') { // vaga-lumes piscando perto do posto
      const N = 22, pp = new Float32Array(N * 3), fv = [];
      for (let i = 0; i < N; i++) { fv.push({ x: 10 + rnd() * 12, y: .6 + rnd() * 1.8, z: -22 + rnd() * 16, a: rnd() * 6.28, w: .6 + rnd() }); pp[i * 3] = fv[i].x; pp[i * 3 + 1] = fv[i].y; pp[i * 3 + 2] = fv[i].z; }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pp, 3));
      const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9adc6a, size: .05, transparent: true, opacity: .85, fog: false })); pts.frustumCulled = false; grupo.add(pts);
      A.W.tick.push(dt => { if (!jogando()) return; for (let i = 0; i < N; i++) { const f = fv[i]; f.a += f.w * dt; pp[i * 3] = f.x + Math.cos(f.a) * .25; pp[i * 3 + 1] = f.y + Math.sin(f.a * 1.3) * .12; } g.attributes.position.needsUpdate = true; pts.material.opacity = .5 + Math.abs(Math.sin(A.perf() * 2)) * .4; });
    } else if (clima === 'neblina') { // faixas de bruma baixa rastejando pela estrada
      const m = new THREE.MeshBasicMaterial({ color: 0xbfc6cc, transparent: true, opacity: .07, depthWrite: false, fog: false });
      for (let i = 0; i < 6; i++) { const pl = plano(10 + rnd() * 8, 5 + rnd() * 4, m, (rnd() - .5) * 6, .5 + rnd() * .6, -4 - i * 10, 0); pl.rotation.x = -Math.PI / 2.1; }
    } else { // chuva: poças escuras que refletem no asfalto
      const m = new THREE.MeshStandardMaterial({ color: 0x05070a, roughness: .08, metalness: .5, transparent: true, opacity: .75 });
      for (let i = 0; i < 7; i++) { const pl = plano(.8 + rnd() * 1.6, .5 + rnd(), m, (rnd() - .5) * 7, .015, 4 - i * 9 - rnd() * 4, 0); pl.rotation.x = -Math.PI / 2; }
    }
  })();

  // =================================================================== 3) O ACHADO DO BALCÃO
  // por semente, um objeto diferente aparece no balcão da loja: bilhete, foto velha ou pilha de reserva.
  const achadoTipo = ['bilhete', 'foto', 'pilha'][(seed >> 2) % 3];
  (function achadoBalcao() {
    const spots = [{ x: 15.4, y: 1.08, z: -16.2 }, { x: 16.8, y: 1.08, z: -18.4 }, { x: 13.9, y: 1.08, z: -15.0 }];
    const pos = spots[(seed >> 5) % spots.length]; // o achado troca de canto do posto pela semente
    let mesh, label, onPick;
    if (achadoTipo === 'bilhete') {
      mesh = box(.12, .005, .09, new THREE.MeshStandardMaterial({ color: 0xd8ccae, roughness: .95 }), 0, 0, 0, new THREE.Group());
      label = 'Pegar o bilhete amassado'; onPick = () => { falar('est6_achado_bilhete'); contarAchado('bilhete'); };
    } else if (achadoTipo === 'foto') {
      const ft = A.canvasTex ? A.canvasTex(64, 48, (g, w, h) => { g.fillStyle = '#c9bfa6'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a5244'; g.fillRect(4, 4, w - 8, h - 8); g.fillStyle = '#b8ae96'; for (let i = 0; i < 3; i++) g.fillRect(12 + i * 14, 20, 8, 20); }) : null;
      mesh = plano ? plano(.1, .075, new THREE.MeshStandardMaterial({ map: ft, roughness: .9 }), 0, 0, 0, 0, new THREE.Group()) : box(.1, .002, .075, MAT.madeira, 0, 0, 0, new THREE.Group());
      mesh.rotation.x = -Math.PI / 2;
      label = 'Pegar a foto velha'; onPick = () => { falar('est6_achado_foto'); contarAchado('foto'); };
    } else {
      mesh = cyl(.014, .014, .05, MAT.metal, 0, 0, 0, 8, new THREE.Group());
      label = 'Pegar a pilha de reserva'; onPick = () => { S.inv.pilhas = (S.inv.pilhas || 0) + 1; A.toast('Pilha de reserva guardada.'); falar('est6_achado_pilha'); contarAchado('pilha'); };
    }
    item('est6_achado', pos, mesh, label, onPick);
    marcarVar('achado no balcão');
  })();
  function contarAchado(tp) {
    const m = mem6(); m.achados = m.achados || {}; m.achados[tp] = true; lsSet(MEM6, m);
    const a = m.achados;
    if (a.bilhete && a.foto && a.pilha) { A.conquista('est6_achados'); agenda(1.2, () => falar('est6_achado_fim')); }
  }

  // =================================================================== 4) O BOATO DA NOITE (rádio)
  // um pensamento com dica velada do clima, uma vez, depois que a Lia sai do carro.
  const boato = { feito: false, t: 0 };
  function tickBoato(dt) {
    if (boato.feito || !S.flags.saiuCarro || !S.inv.lanterna) return;
    boato.t += dt; if (boato.t < 7) return; boato.feito = true;
    const k = clima === 'chuva' ? 'est6_boato_chuva' : clima === 'neblina' ? 'est6_boato_neblina' : 'est6_boato_seca';
    if (U.posRadio) { try { A.SFX.estatica(.5, U.posRadio()); } catch (e) {} }
    falar(k);
  }

  // =================================================================== 5) O SEU JOAQUIM MORTO EM PONTO SORTEADO
  // silhueta passiva (sem dano): fica de pé num de quatro pontos da estrada, só aparece quando você
  // não está olhando, e some no relance seguinte. Troca de lugar a cada semente.
  const PONTOS = [{ x: -4.5, z: 8 }, { x: 4.5, z: -14 }, { x: -4.2, z: -34 }, { x: 4.2, z: GZ + 16 }];
  const pontoMorto = PONTOS[seed % PONTOS.length];
  const morto = { vulto: null, fase: 0, t: 0 };
  const alcanceMorto = clima === 'neblina' ? 10 : clima === 'seca' ? 20 : 16; // na serração ele surge mais perto
  function tickMorto(dt) {
    if (morto.fase >= 3 || !S.inv.lanterna || !P.room || P.room.id !== 'estrada' || S.flags.perseguicao) return;
    if (morto.fase === 0) {
      if (dist(pontoMorto.x, pontoMorto.z) < alcanceMorto && !olhando(pontoMorto, .5, 30)) {
        if (!morto.vulto) { morto.vulto = c.novoVulto(); if (seed & 4) { try { morto.vulto.traverse(o => { if (o.material && o.material.roughness !== undefined) { o.material = o.material.clone(); o.material.roughness = .2; } }); } catch (e) {} } } // por semente, o morto vem encharcado
        morto.vulto.position.set(pontoMorto.x, 0, pontoMorto.z); morto.vulto.visible = true; olharPara(morto.vulto); morto.fase = 1; morto.t = 0;
        if (SX && SX.respiracao) SX.respiracao({ x: pontoMorto.x, y: 1.7, z: pontoMorto.z });
      }
      return;
    }
    const g = morto.vulto; morto.t += dt; olharPara(g);
    // sussurro de contagem (o eco de 1979) enquanto ele está de pé perto
    if (morto.fase === 1 && dist(pontoMorto.x, pontoMorto.z) < 22) { morto.cont = (morto.cont || 0) - dt; if (morto.cont <= 0) { morto.cont = 2.4; try { A.SFX.contagem && A.SFX.contagem({ x: pontoMorto.x, z: pontoMorto.z }, Math.round(dist(pontoMorto.x, pontoMorto.z) / 4) % 10); } catch (e) {} } }
    const visto = olhando(pontoMorto, .42, 40, 2);
    if (morto.fase === 1 && visto) { morto.fase = 2; morto.t = 0; falar(mem6().viuMorto ? 'est6_morto_volta' : 'est6_morto'); medo(16); A.SFX.estalo({ x: pontoMorto.x, z: pontoMorto.z }, .9); mem6Set({ viuMorto: true }); marcarVar('o morto na estrada'); }
    if (morto.fase === 2 && (morto.t > 1.6 || !visto)) { g.visible = false; morto.fase = 3; relampago(.8); }
    if (morto.fase === 1 && morto.t > 12) { g.visible = false; morto.fase = 3; }
  }

  // =================================================================== 5b) PENSAMENTO DA NOITE + PLACAR DO VETERANO
  // uma frase de sabor sorteada pela semente, uma vez; e, na rejogada, o fliperama do posto já marca LIA.
  const nota = { feito: false, t: 0 };
  function tickNota(dt) {
    if (nota.feito || !S.flags.saiuCarro || !S.inv.lanterna) return;
    nota.t += dt; if (nota.t < 12) return; nota.feito = true;
    falar(['est6_noite_a', 'est6_noite_b', 'est6_noite_c'][(seed >> 10) % 3]);
  }
  if (rejogo()) { try { S.flags.placarLia = true; } catch (e) {} marcarVar('o placar do fliperama já marca LIA'); }

  // =================================================================== 6) DESAFIO OPCIONAL DA NOITE
  // sorteado por semente, mostrado como objetivo leve; rende um selo se cumprido na travessia.
  const DESAFIOS = [
    { id: 'quieta', txt: 'Desafio da noite: atravesse a estrada sem acender a lanterna.' },
    { id: 'semBuzina', txt: 'Desafio da noite: chegue ao portão sem buzinar o carro.' },
    { id: 'rapida', txt: 'Desafio da noite: chegue ao portão em menos de 90 s.' }
  ];
  const desafio = DESAFIOS[(seed >> 4) % DESAFIOS.length];
  const des = { mostrado: false, t: 0, luzUsada: false, buzinou: false };
  function tickDesafio(dt) {
    if (!des.mostrado && S.flags.saiuCarro) { des.mostrado = true; agenda(3.5, () => A.toast(desafio.txt)); }
    if (S.inv.lanterna && S.flashOn && P.room && P.room.id === 'estrada') des.luzUsada = true;
    if (S.flags.s4_teto || S.flags.s4_luzTorre || S.flags.s4_onibus) des.buzinou = true; // buzinou (segredos marcam isso)
  }

  // =================================================================== 7) RECORDE DE TRAVESSIA + CONTAGEM
  const travessia = { t0: -1, luzNaEstrada: false, buzinou: false };
  (function abrirNoite() {
    const m = mem6(); m.noites = (m.noites || 0) + 1; lsSet(MEM6, m);
    if (m.noites >= 5) agenda(6, () => { if (!mem6().veterana) { mem6Set({ veterana: true }); A.conquista('est6_veterana'); falar('est6_veterana'); } });
  })();
  function iniciarCrono() { if (travessia.t0 < 0 && S.flags.saiuCarro) travessia.t0 = A.perf(); }
  function fecharTravessia() {
    if (travessia.t0 < 0) return; const seg = A.perf() - travessia.t0;
    const m = mem6(); const rec = m.recorde || 9999;
    // recorde de tempo
    if (seg < rec) { mem6Set({ recorde: Math.round(seg * 10) / 10 }); if (rec < 9999) agenda(.5, () => falar('est6_recorde')); }
    if (seg < 90) A.conquista('est6_speed');
    // desafios opcionais
    if (desafio.id === 'rapida' && seg < 90) selo('rapida');
    if (desafio.id === 'quieta' && !des.luzUsada) { A.conquista('est6_quieta'); agenda(.6, () => falar('est6_quieta')); selo('quieta'); }
    if (desafio.id === 'semBuzina' && !des.buzinou) selo('semBuzina');
    // resumo da noite
    const extra = [];
    if (seg < rec && rec < 9999) extra.push('recorde de travessia');
    const selos = Object.keys((mem6().selos) || {}).length; if (selos) extra.push(selos + (selos > 1 ? ' selos de desafio' : ' selo de desafio'));
    const txt = variacoes.length ? ('Nesta noite: ' + variacoes.slice(0, 4).join(', ') + (extra.length ? ' · ' + extra.join(', ') : '') + '.') : null;
    if (txt) agenda(1.4, () => A.toast(txt));
  }
  function selo(id) {
    const m = mem6(); m.selos = m.selos || {}; if (!m.selos[id]) { m.selos[id] = true; lsSet(MEM6, m); }
    if (m.selos.rapida && m.selos.quieta && m.selos.semBuzina && !m.triade) { m.triade = true; lsSet(MEM6, m); A.conquista('est6_triade'); agenda(.9, () => falar('est6_triade')); }
  }

  // =================================================================== 8) QUARTINHO DO MOACIR + SALA DO ZELADOR
  // porta nova nos fundos do posto. Uma vinheta curta (sem sala andável, sem backtracking):
  //  - depois do FINAL VERDADEIRO: abre com o código do epílogo e mostra o quarto de infância do Moacir.
  //  - na rejogada (sem o verdadeiro ainda): mostra a sala do zelador, com o mapa de giz e um bilhete.
  const CODIGO_EPILOGO = '1979';
  (function portaFundos() {
    if (!rejogo()) return; // só existe na segunda jogada em diante
    const quartinho = verdadeiro();
    const mat = A.texMat ? A.texMat('madeiraEsc', 1, 1) : new THREE.MeshStandardMaterial({ color: 0x241b12, roughness: .9 });
    const porta = box(.9, 2.0, .08, mat, 18, 1.0, -21.36, grupo, false);           // fundo da loja (dentro do pátio)
    box(.12, .16, .05, MAT.bronze, 18.3, 1.0, -21.33, grupo, false);               // maçaneta
    if (quartinho) { // número gravado na madeira
      const nt = A.canvasTex ? A.canvasTex(64, 32, (g, w, h) => { g.fillStyle = '#1a140d'; g.fillRect(0, 0, w, h); g.fillStyle = '#6a5a40'; g.font = 'bold 20px Georgia'; g.textAlign = 'center'; g.fillText('1979', w / 2, 22); }) : null;
      if (nt && plano) plano(.3, .15, new THREE.MeshStandardMaterial({ map: nt, roughness: .9 }), 18, 1.55, -21.34, 0, grupo);
    }
    const st = { aberta: false, falou: false };
    interact(porta, () => {
      if (st.aberta) return quartinho ? 'A porta do quartinho. Já aberta.' : 'A sala do zelador. Já aberta.';
      if (quartinho) return '<b>E</b>Abrir a porta com o código do epílogo';
      return '<b>E</b>Forçar a porta dos fundos';
    }, () => {
      if (st.aberta) return;
      if (!st.falou) { st.falou = true; falar(quartinho ? 'est6_porta_nova' : 'est6_zelador'); }
      if (quartinho) {
        A.abrirTeclado && A.abrirTeclado('PORTA DOS FUNDOS', CODIGO_EPILOGO, () => { abrirFundos(st, true); }, () => falar('est6_porta_errado'));
      } else {
        abrirFundos(st, false);
      }
    });
    marcarVar(quartinho ? 'uma porta nova no posto' : 'a sala do zelador');
  })();
  function abrirFundos(st, quartinho) {
    st.aberta = true; try { A.SFX.trancado(); A.SFX.clique && A.SFX.clique(); } catch (e) {}
    if (quartinho) {
      falar('est6_porta_codigo'); A.conquista('est6_quartinho'); medo(10);
      // vinheta muda: três cartões curtos com os desenhos de infância do Moacir
      agenda(.3, () => A.cartao('O quartinho de um menino. Papel de parede de barquinhos.', 3));
      agenda(3.4, () => A.cartao('Na parede, a giz de cera: uma casa, um sol, três figuras de mãos dadas.', 3.4));
      agenda(7.0, () => A.cartao('Numa delas, escrito torto: MOACIR, 6 ANOS. Ninguém riscou essa.', 3.6));
      mem6Set({ viuQuartinho: true });
    } else {
      A.conquista('est6_zelador'); medo(8);
      agenda(.3, () => A.cartao('Um quartinho de zelador. Lata de giz, uma rede, cheiro de óleo.', 3));
      agenda(3.4, () => falar('est6_zelador_mapa'));
      agenda(4.0, () => A.cartao('No quadro de giz: as rondas do Inspetor, risco por risco, com as horas ao lado.', 3.8));
      mem6Set({ viuZelador: true, mapaGiz: true });
    }
  }

  // =================================================================== 9) PORTA-LUVAS COFRE (rejogada)
  // na segunda jogada, o porta-luvas abre com os quatro números do cofre do Davi: bilhete + lanterna cosmética.
  (function portaLuvasCofre() {
    if (!rejogo()) return;
    const inv = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const hit = box(.3, .16, .1, inv, .6, .9, -.62, carro, false);  // frente do passageiro
    const st = { aberto: false, falou: false };
    const codigo = '1979'; // o ano (calendário do posto e rádio), aprendível dentro do próprio prólogo
    interact(hit, () => st.aberto ? 'O porta-luvas, aberto. A lanterna nova fica guardada.' : '<b>E</b>Abrir o porta-luvas (tem segredo)', () => {
      if (st.aberto) return;
      if (!st.falou) { st.falou = true; falar('est6_portaluvas'); }
      A.abrirTeclado && A.abrirTeclado('PORTA-LUVAS', codigo, () => {
        st.aberto = true; A.SFX.clique && A.SFX.clique(); A.conquista('est6_cofre'); medo(6);
        agenda(.3, () => falar('est6_cofre_mae'));
        S.flags.est6_lanternaCosmetica = true; mem6Set({ cofreMae: true });
      }, () => falar('est6_cofre_errado'));
    }, { on: () => S.flags.saiuCarro });
    marcarVar('o porta-luvas-cofre');
  })();

  // =================================================================== 10) O CARRO DE 1979 NO ACOSTAMENTO (rejogada)
  (function carro1979() {
    if (!rejogo()) return;
    const g = new THREE.Group(); g.position.set(5.9, 0, -38); g.rotation.y = -.5; grupo.add(g);
    const corpo = new THREE.MeshStandardMaterial({ color: 0x1a2420, roughness: .9, metalness: .2 });
    box(1.7, .65, 3.9, corpo, 0, .55, 0, g, false); box(1.5, .55, 2.0, corpo, 0, 1.15, .2, g, false);
    box(1.5, .45, .05, new THREE.MeshStandardMaterial({ color: 0x0a0c0a, roughness: .2 }), 0, 1.2, -.85, g, false);
    for (const [x, z] of [[-.85, 1.2], [.85, 1.2], [-.85, -1.2], [.85, -1.2]]) { const p = cyl(.3, .3, .2, MAT.pneu, x, .3, z, 10, g); p.rotation.z = Math.PI / 2; }
    // capô amassado contra um tronco
    box(.9, .4, .4, corpo, 0, .5, -2.1, g, false); g.children[0].rotation.x = -.04;
    A.addCollider(5.2, 6.6, -39.9, -36.1);
    const hit = box(1.8, 1.2, 4.2, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), 0, .9, 0, g, false);
    const st = { viu: false, olhou: false };
    interact(hit, () => st.olhou ? 'O carro de 1979. Banco de trás com uma fita e um carrinho azul.' : '<b>E</b>Olhar dentro do carro parado', () => {
      if (!st.viu) { st.viu = true; falar('est6_carro79'); }
      else if (!st.olhou) { st.olhou = true; falar('est6_carro79_dentro'); A.conquista('est6_carro79'); medo(12); mem6Set({ viuCarro79: true }); }
    });
    marcarVar('o carro de 1979 na curva');
  })();

  // =================================================================== 11) O ÚLTIMO ÔNIBUS, PASSIVO (rejogada)
  // uma silhueta de ônibus cruza o fundo da estrada uma vez, com janelas acesas e crianças; não para
  // nem bloqueia — puro clima. Som que se aproxima e some. Gatilho passivo (não precisa buzinar).
  const bus = { fase: 0, g: null, z: 0, som: null, t: 0, armado: false };
  function montarBus() {
    const g = new THREE.Group(); g.visible = false; grupo.add(g);
    const latao = new THREE.MeshStandardMaterial({ color: 0x3a3016, roughness: .85 });
    box(2.3, 2.1, 8.6, latao, 0, 1.45, 0, g, false); box(2.2, .3, 8.7, new THREE.MeshStandardMaterial({ color: 0x0a0a08 }), 0, .4, 0, g, false);
    const jOn = new THREE.MeshBasicMaterial({ color: 0xffd488, fog: false }), esc = new THREE.MeshStandardMaterial({ color: 0x080808 });
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const z = -3.2 + i * 1.1; plano(.85, .65, jOn, s * 1.16, 1.9, z, s * Math.PI / 2, g); const cab = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), esc); cab.position.set(s * 1.05, 1.8, z); g.add(cab); }
    plano(2.0, .75, jOn, 0, 1.95, -4.32, Math.PI, g);
    const luz = new THREE.SpotLight(0xffd070, 0, 30, .5, .6, 1.2); luz.position.set(0, 1, -4.4); luz.target.position.set(0, 0, -14); g.add(luz, luz.target); g.userData.luz = luz;
    return g;
  }
  function tickBus(dt) {
    if (!rejogo()) return;
    if (bus.fase === 0) {
      if (!bus.armado && S.flags.saiuCarro && P.room && P.room.id === 'estrada' && P.pos.z < 0) bus.armado = true;
      if (bus.armado && P.pos.z < -20 && !S.flags.perseguicao) { bus.fase = 1; bus.g = montarBus(); bus.lane = [-2.4, -2.8, -3.4][(seed >> 12) % 3]; bus.z = 92; bus.g.position.set(bus.lane, 0, bus.z); bus.g.visible = true; bus.g.userData.luz.intensity = 22; falar('est6_onibus'); medo(14); marcarVar('o último ônibus ao fundo'); }
      return;
    }
    if (bus.fase === 1) {
      bus.z -= dt * 7; bus.g.position.z = bus.z; bus.g.position.x = bus.lane; bus.g.position.y = Math.sin(A.perf() * 8) * .02;
      if (!bus.buzinou && (seed & 8) && Math.abs(bus.z - P.pos.z) < 30) { bus.buzinou = true; try { U.SX && U.SX.buzina && U.SX.buzina({ x: bus.lane, y: 2, z: bus.z }, .6); } catch (e) {} } // por semente, o ônibus solta uma buzina grave ao passar
      if (bus.z < -56) {
        bus.fase = 2; bus.t = 0; bus.g.userData.luz.intensity = 0; relampago(1);
        A.SFX.estatica && A.SFX.estatica(.6, { x: -2.8, y: 1.5, z: bus.z });
        agenda(.15, () => { if (bus.g) bus.g.visible = false; });
        agenda(1.4, () => { falar('est6_onibus_passou'); A.conquista('est6_onibus2'); mem6Set({ viuOnibus: true }); });
      }
    }
  }

  // =================================================================== 12) AVISO DO ATALHO CONHECIDO (rejogada)
  // quem já zerou recebe, uma vez, o lembrete de que o barranco corta caminho até o portão.
  const atalho = { feito: false, t: 0 };
  function tickAtalho(dt) {
    if (atalho.feito || !rejogo() || !S.flags.saiuCarro || !S.inv.chaves.portao) return;
    atalho.t += dt; if (atalho.t < 4) return; atalho.feito = true; falar('est6_atalho');
  }

  // =================================================================== 13) A NOITE QUE LEMBRA DE VOCÊ (rejogada)
  // falas extras ao chegar: a Lia reconhece a estrada; o Seu Joaquim tem uma fala de reencontro.
  const lembrar6 = { lia: false, joaq: false };
  function tickLembra(dt) {
    if (!rejogo()) return;
    if (!lembrar6.lia && S.flags.saiuCarro && P.room && P.room.id === 'estrada' && P.pos.z < 8) { lembrar6.lia = true; agenda(1.5, () => falar(noite() >= 3 ? 'est6_denovo' : 'est6_conhece')); }
  }
  // fala de reencontro do Seu Joaquim (só na rejogada): uma linha extra logo depois da conversa com o velho,
  // antes de ele sumir. Observa S.done.posto sem mexer no diálogo nem no fluxo da chave.
  const reenc = { feito: false };
  function tickReencontro() {
    if (reenc.feito || !rejogo()) return;
    if (S.done.posto && !S.flags.joaquimSumiu) { reenc.feito = true; agenda(1.2, () => falar('est6_joaquim_volta')); }
  }

  // =================================================================== 14) CADEADO x CORRENTE NO PORTÃO
  // por semente, o portão aparece fechado com cadeado (como sempre) OU com uma corrente enrolada nas grades.
  // Puramente visual; a abertura continua pela chave. A corrente cai quando o portão abre.
  const corr = { g: null };
  if (c.gate && (seed & 2)) {
    const g = new THREE.Group(); g.position.set(0, 0, GZ + .12); grupo.add(g); corr.g = g;
    const elo = new THREE.MeshStandardMaterial({ color: 0x3a3a3e, roughness: .7, metalness: .4 });
    for (let i = 0; i < 14; i++) { const t = i / 13; const y = 1.4 + Math.sin(t * 9) * .5, x = -1 + t * 2; const e = cyl(.035, .035, .09, elo, x, y, 0, 6, g); e.rotation.z = Math.PI / 2 + (i % 2 ? .5 : -.5); }
    box(.14, .2, .07, MAT.bronze, 0, .9, 0, g, false); // o mesmo cadeado, agora prendendo a corrente
    marcarVar('o portão acorrentado');
  }
  function tickCorrente() { if (corr.g && S.done.abrir_portao && corr.g.visible) { corr.g.visible = false; try { A.SFX.vidro && A.SFX.vidro(0, GZ); } catch (e) {} } }

  // =================================================================== 15) O PRESSÁGIO DA NOITE (som)
  // um som único, sorteado, logo depois de sair do carro: cães ao longe, um sino, vento forte ou uma buzina.
  const presTipo = ['caes', 'sino', 'vento', 'buzina'][(seed >> 6) % 4];
  const pres = { feito: false, t: 0 };
  function tickPressagio(dt) {
    if (pres.feito || !S.flags.saiuCarro) return;
    pres.t += dt; if (pres.t < 3.5) return; pres.feito = true;
    const far = { x: (seed & 1 ? 1 : -1) * 30, y: 2, z: GZ - 10 };
    const vol = clima === 'seca' ? 1 : .6; // em noite seca os sons viajam mais longe
    try {
      if (presTipo === 'sino') A.SFX.sinoLonge && A.SFX.sinoLonge();
      else if (presTipo === 'buzina' && U.SX && U.SX.buzina) U.SX.buzina({ x: far.x, y: 2, z: 60 }, .7 * vol);
      else if (presTipo === 'vento') A.SFX.estatica && A.SFX.estatica(1.8, far);
      else A.SFX.passoMonstro && A.SFX.passoMonstro(far, .4 * vol); // latido abafado ao longe (reaproveita o grave)
    } catch (e) {}
    marcarVar('o presságio ao longe');
  }

  // =================================================================== 16) PLACAR "MELHOR TRAVESSIA" (perto do portão)
  // uma plaquinha de giz ao lado do muro mostra o recorde de travessia e quantas noites você já desceu a estrada.
  (function placarTravessia() {
    const m = mem6(); const rec = m.recorde, n = m.noites || 1;
    if (!A.canvasTex || !plano) return;
    const tx = A.canvasTex(256, 128, (g, w, h) => {
      g.fillStyle = '#14130f'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#5a5240'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
      g.fillStyle = '#d8ccae'; g.textAlign = 'center'; g.font = 'italic 18px Georgia'; g.fillText('a estrada velha', w / 2, 30);
      g.font = 'bold 20px Georgia'; g.fillText('melhor travessia', w / 2, 62);
      g.font = 'bold 30px Georgia'; g.fillText(rec ? (rec + ' s') : '— — —', w / 2, 94);
      g.font = '16px Georgia'; g.fillText('noite nº ' + n, w / 2, 116);
    });
    const pl = plano(.7, .35, new THREE.MeshStandardMaterial({ map: tx, roughness: .9 }), -2.1, 1.3, GZ + .22, 0);
    pl.userData.leitura = { t: 'Melhor travessia: ' + (rec ? rec + ' s' : 'ainda nenhuma') + ' · noite nº ' + n };
  })();

  // =================================================================== 17) O DESENHO NO POSTO (rejogada)
  // na rejogada, um desenho de criança pregado na parede do posto; o que ele mostra cresce a cada noite.
  (function desenhoNoPosto() {
    if (!rejogo() || !A.canvasTex || !plano) return;
    const n = mem6().noites || 1;
    const tx = A.canvasTex(96, 120, (g, w, h) => {
      g.fillStyle = '#cfc6ac'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#2a4a8a'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(20, 90); g.lineTo(76, 90); g.stroke();                 // chão
      g.strokeStyle = '#8a1a14'; g.strokeRect(30, 50, 36, 40); g.beginPath(); g.moveTo(30, 50); g.lineTo(48, 32); g.lineTo(66, 50); g.stroke(); // casa
      if (n >= 2) { g.fillStyle = '#d8a820'; g.beginPath(); g.arc(78, 20, 9, 0, 6.3); g.fill(); } // sol
      if (n >= 3) { g.strokeStyle = '#2a2a2a'; for (let i = 0; i < 3; i++) { const x = 16 + i * 10; g.beginPath(); g.arc(x, 74, 4, 0, 6.3); g.moveTo(x, 78); g.lineTo(x, 88); g.stroke(); } } // três figuras
      if (n >= 4) { g.fillStyle = '#111'; g.font = '10px Georgia'; g.fillText('nao deixa ela entrar', 10, 108); } // o aviso
    });
    const pl = plano(.3, .38, new THREE.MeshStandardMaterial({ map: tx, roughness: .95 }), 13.6, 1.75, -20.86, 0);
    pl.userData.leitura = { t: 'Um desenho de criança pregado na parede. Uma casa, ' + (n >= 2 ? 'um sol, ' : '') + (n >= 3 ? 'três figuras' : '') + (n >= 4 ? ' e, embaixo, "não deixa ela entrar"' : '') + '.' };
    interact(pl, () => 'Um desenho de criança na parede.', () => { if (!S.flags.est6_desenho) { S.flags.est6_desenho = true; A.SFX.papel && A.SFX.papel(); medo(6); } });
    marcarVar('o desenho na parede');
  })();

  // =================================================================== 18) A VELA ACESA (rejogada)
  // na rejogada, uma vela acesa no canto do muro do portão; quem já desceu a estrada antes deixou ela lá.
  (function velaPortao() {
    if (!rejogo()) return;
    const cera = cyl(.03, .035, .12, new THREE.MeshStandardMaterial({ color: 0xe8e0cc, roughness: .8 }), 2.3, .72, GZ + .25, 8);
    const chama = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffcf80, fog: false })); chama.position.set(2.3, .82, GZ + .25); chama.scale.y = 1.8; grupo.add(chama);
    const luz = new THREE.PointLight(0xffb060, .8, 3, 2); luz.position.set(2.3, .85, GZ + .25); grupo.add(luz);
    A.W.tick.push(dt => { if (!vivo()) return; const f = .8 + Math.sin(A.perf() * 11) * .25 + (Math.random() - .5) * .2; luz.intensity = Math.max(0, f); chama.scale.setScalar(.8 + Math.random() * .4); chama.scale.y *= 1.8; });
    marcarVar('a vela no muro');
  })();

  // =================================================================== 19) LUZ PILOTO DO LETREIRO (semente)
  // uma lampadinha de cor sorteada no poste do letreiro do posto, para o posto nunca ter a mesma cara.
  (function luzPiloto() {
    const cores = [0xff5020, 0x30c0ff, 0xffd040, 0x40ff80];
    const cor = cores[(seed >> 8) % cores.length];
    const bulbo = new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6), new THREE.MeshBasicMaterial({ color: cor })); bulbo.position.set(7.6, 4.3, -7.5); grupo.add(bulbo);
    const luz = new THREE.PointLight(cor, 1.2, 4, 2); luz.position.set(7.6, 4.3, -7.5); grupo.add(luz);
    A.W.tick.push(() => { if (!vivo()) return; const on = Math.random() > .06; luz.intensity = on ? 1.2 : .2; bulbo.material.color.setHex(on ? cor : 0x201810); });
    marcarVar('a luz piloto do letreiro');
  })();

  // =================================================================== 20) PEGADAS PARA O ATALHO (rejogada)
  // na rejogada, uma trilha de pegadas secas aponta da estrada para a cerca caída do barranco: a rota curta.
  (function pegadasAtalho() {
    if (!rejogo() || !A.canvasTex) return;
    const tx = A.canvasTex(48, 96, g => { g.fillStyle = 'rgba(30,22,12,.7)'; g.beginPath(); g.ellipse(24, 60, 12, 28, 0, 0, 6.3); g.fill(); for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse(10 + i * 7, 22, 3.5, 6, 0, 0, 6.3); g.fill(); } });
    const mat = new THREE.MeshStandardMaterial({ map: tx, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
    const ini = [3, -22], fim = [9.5, -25], n = 6, dx = fim[0] - ini[0], dz = fim[1] - ini[1], ang = Math.atan2(dx, dz);
    for (let i = 0; i < n; i++) { const k = i / (n - 1), lado = i % 2 ? 1 : -1; const pl = plano(.26, .5, mat, ini[0] + dx * k + .2 * lado, .015, ini[1] + dz * k, 0); pl.rotation.set(-Math.PI / 2, 0, ang + Math.PI); }
    marcarVar('pegadas para o atalho');
  })();

  // =================================================================== tick principal
  let chegouPortao = false;
  A.W.tick.push(dt => {
    if (!jogando()) return;
    tickFila(dt);
    iniciarCrono();
    tickBoato(dt); tickMorto(dt); tickDesafio(dt); tickBus(dt); tickAtalho(dt); tickLembra(dt); tickReencontro();
    tickCorrente(); tickPressagio(dt); tickNota(dt);
    // chegada ao portão: fecha a travessia uma vez
    if (!chegouPortao && S.flags.saiuCarro && Math.hypot(P.pos.x, P.pos.z - GZ) < 6) { chegouPortao = true; fecharTravessia(); }
  });

  return { util: { seed, clima, noite, rejogo } };
}
