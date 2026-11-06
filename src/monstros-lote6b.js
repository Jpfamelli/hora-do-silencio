// MONSTROS E IA, lote 6 (2a rodada) — REJOGABILIDADE: a casa troca as regras na segunda jogada.
// Calçado do Inspetor, brincadeiras da Ana, Procissão que muda, Chamado verdadeiro, Inspetor que dorme,
// Mascarado, faro, fúria, contramedidas, esconderijo lacrado, Seguidora, cão, sósia e Nêmesis.
// O motor chama criarMonstrosLote6B(E) uma vez; ganchos curtos em jogo.js:
//   L6B.tick(dt) · novoMapa · aoAtivar · aoEsconder · morte · fimCapitulo · telaMorte · usou
//   anaMove / semAna (Ana) · procIni / procAviso / procAtrasa / procPoupa (Procissão) · chamadoVerdade / chamadoFalso (Chamado) · lacrado
// Campos que o motor lê do Inspetor: M.l6bVelMul e M.l6bOuvMul. Tudo roda dentro de seguro(): nada derruba o quadro.
// Fora do QA (navigator.webdriver) tudo liga; no QA fica quieto, a não ser com window.__L6BON.
import { TXB } from './monstros-lote6b-texto.js';

export function criarMonstrosLote6B(E) {
  const { THREE, W, P, M, ANA, ANA_G, PROC, MON, scene, camera, SX, SFX } = E;
  const S = () => E.S, perf = () => E.perf;
  const { roomAt, distSalas, salasAlcancaveis, pontoEm, centroSala, planejar, linhaLivre, visivel, emitNoise, subPequeno, sub, toast, conquista, iniciarAlerta, abafarMundo } = E;
  const A = E.audio || {};
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const seguro = fn => function (...a) { try { return fn.apply(null, a); } catch (e) { try { if (window.__L6BDEBUG) console.warn('[L6B]', e); } catch (e2) {} } };
  const webdriver = () => { try { return !!navigator.webdriver; } catch (e) { return false; } };
  const on = () => !webdriver() || !!window.__L6BON;
  const _w = new THREE.Vector3();

  // ---------------------------------------------------------------- sementes
  function h01(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return ((h >>> 0) % 100003) / 100003; }
  const sem = () => (S() && S().semente) || 'SEMCOD';
  const chap = () => (S() || {}).chapter || 0;
  const nrnd = k => h01(sem() + '|' + k);                                  // estável pela noite inteira
  const srnd = k => h01(sem() + '|' + W.mapa + '|' + chap() + '|' + k);    // estável por capítulo

  // ---------------------------------------------------------------- memória (a do lote 6 é só lida)
  const KEY = 'hora-silencio-l6b';
  let DB = null, L6DB = {};
  function lerDB() {
    if (DB) return DB;
    try { DB = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { DB = null; }
    if (!DB || typeof DB !== 'object') DB = {};
    DB.furia = typeof DB.furia === 'number' ? DB.furia : 30;
    DB.calc = DB.calc || {}; DB.mortes = DB.mortes || { inspetor: 0, ana: 0, procissao: 0 };
    DB.nem = DB.nem || null; DB.ultCausa = DB.ultCausa || ''; DB.contra = DB.contra || null;
    return DB;
  }
  const salvar = () => { if (!on()) return; try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) {} };
  const lerL6 = () => { try { L6DB = JSON.parse(localStorage.getItem('hora-silencio-l6') || '{}') || {}; } catch (e) { L6DB = {}; } };
  const noites = () => L6DB.noites || 0;
  const rejogo = () => noites() > 1 || (L6DB.venceu || 0) > 0;
  const nomeJogador = () => { try { const n = JSON.parse(localStorage.getItem('hora-silencio-nome') || '""'); return typeof n === 'string' ? n.trim().slice(0, 16) : ''; } catch (e) { return ''; } };

  // ---------------------------------------------------------------- áudio auxiliar
  const tAC = () => (E.AC ? E.AC.currentTime : 0);
  function aqui(pos, y, wet, f) { try { if (!E.AC || !A.saida) return; f(A.saida({ x: pos.x, y, z: pos.z }, wet), tAC()); } catch (e) {} }
  const latir = (pos, forte) => aqui(pos, .5, .4, (g, t) => { A.burst(t, .14, 'bandpass', 760, 2, g); const o = A.osc('sawtooth', 300, t, .15, g); o.frequency.linearRampToValueAtTime(170, t + .13); A.env(g, t, .004, forte ? 1 : .6, .16); });
  const rosnar = pos => aqui(pos, .4, .3, (g, t) => { A.burst(t, .7, 'lowpass', 260, 2, g); A.osc('sawtooth', 62, t, .7, g); A.env(g, t, .12, .5, .6); });
  const ronco = pos => aqui(pos, 1.2, .4, (g, t) => { const o = A.osc('sawtooth', 60, t, 1.5, g); o.frequency.linearRampToValueAtTime(38, t + 1.3); A.burst(t, 1.3, 'bandpass', 220, 1.2, g); A.env(g, t, .55, .5, .9); });
  const fungadaLeve = pos => aqui(pos, 1.4, .1, (g, t) => { A.burst(t, .45, 'bandpass', 1100, 1.2, g); A.env(g, t, .18, .35, .25); });
  const gritoCurto = pos => aqui(pos, 1.2, .5, (g, t) => { A.burst(t, .5, 'bandpass', 1400, 3, g); A.env(g, t, .02, .8, .45); });

  // dano que nunca mata sozinho (cão, Seguidora)
  const dano = seguro(function (n) {
    const s = S(); if (!s || s.dead) return;
    const real = n * ((E.D && E.D().dano) || 1);
    s.health = Math.max(8, s.health - real); s.capDano += real; s.fear = 100; P.shake = Math.max(P.shake, .2);
    const fx = document.getElementById('fx-red');
    if (fx) { fx.style.transition = 'none'; fx.style.opacity = .5; setTimeout(() => { fx.style.transition = 'opacity 1.4s'; fx.style.opacity = 0; }, 80); }
    try { SFX.ofego(); } catch (e) {}
  });

  // =====================================================================
  // 1. O CALÇADO DO INSPETOR (sorteado por noite): muda timbre, distância e silêncio do passo
  // =====================================================================
  const CALC = { bota: 1.55, chinelo: .8, meia: .22, tamanco: 1.05 };
  let calcado = 'bota', calcadoDito = false;
  const sortearCalcado = () => { calcado = ['bota', 'chinelo', 'meia', 'tamanco'][Math.floor(nrnd('calcado') * 4)]; };
  const calcAtivo = () => on() && rejogo();
  const piso = () => { try { return (roomAt(M.pos.x, M.pos.z) || {}).piso; } catch (e) { return ''; } };
  function extraPasso(pos, v) {
    const y = .1;
    if (calcado === 'bota') aqui(pos, y, .3, (g, t) => { A.burst(t, .06, 'lowpass', 260, 1, g, 0); A.osc('square', 2100, t, .012, g); A.env(g, t, .002, .5 * v, .08); });
    else if (calcado === 'chinelo') aqui(pos, y, .2, (g, t) => { A.burst(t, .05, 'bandpass', 1500, 3, g); A.env(g, t, .002, .3 * v, .05); });
    else if (calcado === 'tamanco') aqui(pos, y, .5, (g, t) => { A.burst(t, .03, 'bandpass', 900, 8, g); A.osc('square', 340, t, .025, g); A.env(g, t, .001, .5 * v, .07); });
  }
  (function envolverPasso() {
    const orig = SFX.passoMonstro;
    if (typeof orig !== 'function' || orig.__l6b) return;
    const novo = function (pos, vol, agua) {
      let v = vol;
      try {
        if (pos === M.pos && calcAtivo()) {
          let k = CALC[calcado] || 1; const p = piso();
          if (calcado === 'tamanco') k *= p === 'madeira' ? 1.3 : p === 'tapete' ? .5 : 1;
          if (calcado === 'bota' && p === 'tapete') k *= .7;
          v = (vol == null ? 1 : vol) * k;
          if (!agua) extraPasso(pos, clamp(v, .1, 1.6));
        }
      } catch (e) {}
      return orig.call(this, pos, v, agua);
    };
    novo.__l6b = true; SFX.passoMonstro = novo;
  })();
  const tickCalcado = seguro(function () {
    if (calcadoDito || !calcAtivo() || !M.ativo || M.pos.distanceTo(P.pos) > 16) return;
    calcadoDito = true; lerDB();
    subPequeno('lia', TXB.calcado[calcado]);
    DB.calc[calcado] = 1;
    if (Object.keys(DB.calc).length >= 4) conquista('l6b_calcados');
    salvar();
  });

  // =====================================================================
  // 2. AS BRINCADEIRAS DA ANA: regra sorteada por capítulo, dita por ela
  // =====================================================================
  let anaVar = 'normal', anaAntes = false, anaDisse = false, cantigaDita = false, ausente = false, ausenteDito = false, ausenteVolta = false;
  let anaBaseX = -1, anaUlt = -1;
  const sortearAna = seguro(function () {
    anaDisse = false; cantigaDita = false;
    const r = srnd('ana-jogo');
    if (!(on() && rejogo())) anaVar = 'normal';
    else anaVar = r < .16 ? 'normal' : r < .32 ? 'curta' : r < .48 ? 'longa' : r < .62 ? 'luz' : r < .78 ? (noites() >= 2 ? 'inversa' : 'curta') : r < .9 ? 'perde' : (noites() >= 5 ? 'gemea' : 'perde');
    ausente = on() && rejogo() && srnd('sem-ana') > .88; ausenteDito = false; ausenteVolta = false;
  });
  const fimAna = () => {
    let f = anaVar === 'curta' ? 8 : anaVar === 'longa' ? 12 : 10;
    if (on() && rejogo() && noites() >= 6) f -= 1; // a Ana que cresce conta cada vez menos
    return Math.max(6, f);
  };
  // gancho de updateAna: quem se move? (normal: quando não está vista; inversa: quando você olha)
  const anaMove = function (vista, naVista, iluminada) {
    try { if (anaVar === 'inversa' && on()) return !!(naVista && iluminada); } catch (e) {}
    try { if (anaVar === 'luz' && on()) return !vista && !!S().flashOn; } catch (e) {} // só anda (e conta) com a lanterna acesa; no escuro ela congela
    return !vista;
  };
  const semAna = function () { try { const s = S(); return !!(ausente && on() && s && s.capT < 130); } catch (e) { return false; } };

  // Ana Dupla: a isca (sem sombra, sem passo, conta fora de ordem); a luz a faz virar fumaça e custa a lanterna
  let fake = null, fakeOn = false, fakeLuz = 0, fakeFade = 0, fakeConta = 2;
  function criarFake() {
    if (fake) return fake;
    fake = new THREE.Group();
    for (const c of ANA_G.children) { try { fake.add(c.clone(true)); } catch (e) {} }
    fake.traverse(o => { if (o.isMesh) { o.castShadow = false; try { o.material = o.material.clone(); o.material.transparent = true; } catch (e) {} } });
    fake.visible = false; scene.add(fake);
    return fake;
  }
  function fakeAlpha(a) { fake.traverse(o => { if (o.isMesh && o.material) o.material.opacity = a; }); }
  const tickAnaDupla = seguro(function (dt) {
    if (!(anaVar === 'gemea' && on()) || !ANA.ativa || ANA.script) { if (fake && fake.visible) { fake.visible = false; fakeOn = false; } return; }
    criarFake();
    if (!fakeOn) {
      const r = roomAt(ANA.pos.x, ANA.pos.z); let ok = false;
      for (let i = 0; i < 10 && !ok; i++) { const [x, z] = pontoEm(r, 1); if (Math.hypot(x - P.pos.x, z - P.pos.z) > 4 && Math.hypot(x - ANA.pos.x, z - ANA.pos.z) > 3) { fake.position.set(x, 0, z); ok = true; } }
      if (!ok) return;
      fakeOn = true; fakeFade = 0; fakeLuz = 0; fakeAlpha(.9); fake.visible = true;
    }
    if (fakeFade > 0) { fakeFade -= dt; fakeAlpha(clamp(fakeFade / .6, 0, 1) * .9); fake.position.y += dt * .5; if (fakeFade <= 0) { fake.visible = false; fakeOn = false; ANA.l6bIscaFim = true; } return; }
    if (ANA.l6bIscaFim) return;
    fake.rotation.y = Math.atan2(P.pos.x - fake.position.x, P.pos.z - fake.position.z);
    const d = Math.hypot(P.pos.x - fake.position.x, P.pos.z - fake.position.z);
    const s = S();
    if (s.flashOn && d < 12 && visivel(fake.position, 1, 12)) {
      fakeLuz += dt;
      if (fakeLuz > .45) {
        fakeFade = .6; ANA.falhaT = Math.max(ANA.falhaT || 0, .7); s.battery = Math.max(0, s.battery - 4); try { SFX.clique(); } catch (e) {}
        subPequeno('lia', TXB.anaIscaFumaca); conquista('l6b_isca');
      }
    } else fakeLuz = Math.max(0, fakeLuz - dt);
    fakeConta -= dt;
    if (fakeConta <= 0 && d < 14) { fakeConta = rand(1.6, 2.8); try { SFX.contagem(fake.position, Math.floor(rand(0, 9))); } catch (e) {} } // conta fora de ordem
    if (!ANA.l6bIscaDita && d < 12) { ANA.l6bIscaDita = true; setTimeout(() => subPequeno('lia', TXB.anaIsca), 900); }
  });

  const tickAna = seguro(function (dt) {
    ANA.l6bFim = fimAna();
    ANA.l6bContaMul = (anaVar === 'luz' && on() && !S().flashOn) ? 0 : 1;
    // a Ana que cresce: mais alta a cada noite jogada (soma-se ao que o lote 5 já faz, sem acumular)
    if (on() && rejogo() && ANA_G) {
      const g = 1 + Math.min(.2, Math.max(0, noites() - 1) * .025), sx = ANA_G.scale.x;
      if (Math.abs(sx - anaUlt) > 1e-6) { ANA_G.scale.multiplyScalar(g); anaUlt = ANA_G.scale.x; }
    }
    const nasceu = ANA.ativa && !anaAntes; anaAntes = ANA.ativa;
    if (nasceu) {
      ANA.l6bPerdeu = false; ANA.l6bIscaFim = false; ANA.l6bIscaDita = false; fakeOn = false;
      lerDB();
      if (anaVar !== 'normal' && !anaDisse && on()) { anaDisse = true; setTimeout(() => { if (ANA.ativa) subPequeno('ana', TXB.anaRegra[anaVar]); }, 900); }
      if (ausente && ausenteDito && !ausenteVolta && on()) { ausenteVolta = true; setTimeout(() => subPequeno('ana', TXB.anaAusenteVolta), 600); }
      if (on() && DB.nem === 'ana' && !nemDito.ana) { nemDito.ana = true; setTimeout(() => subPequeno('ana', TXB.nemesis.ana), 1700); }
      if (on() && DB.ultCausa && !cantigaDita && rejogo()) {
        cantigaDita = true; const k = DB.ultCausa; const txt = TXB.cantiga[k] || TXB.cantiga.ana;
        setTimeout(() => { if (ANA.ativa) subPequeno('ana', txt); }, 3600);
      }
    }
    // a noite sem Ana: o silêncio é o susto
    const s = S();
    if (ausente && on() && !ausenteDito && s && s.capT > 45 && !ANA.ativa) { ausenteDito = true; subPequeno('lia', TXB.anaAusente); }
    // a Ana que se enrola na conta (pista sonora: um estalo seco)
    if (anaVar === 'perde' && on() && ANA.ativa && !ANA.l6bPerdeu && ANA.conta >= 4 && ANA.conta <= 7 && Math.random() < dt * .6) {
      ANA.l6bPerdeu = true;
      if (Math.random() < .5) ANA.conta = Math.max(0, ANA.conta - 3); else ANA.conta = Math.min(fimAna() - 1, ANA.conta + 2);
      try { SX.estalo(ANA.pos, .5); } catch (e) {}
      subPequeno('ana', pick(TXB.anaPerde));
    }
    // a Ana invertida: de frente para quem a encara, de costas parada quando não
    if (anaVar === 'inversa' && on() && ANA.ativa && !ANA.vista) ANA.yaw = Math.atan2(P.pos.x - ANA.pos.x, P.pos.z - ANA.pos.z);
    tickAnaDupla(dt);
  });

  // duelo de assombrações: Ana e Inspetor na mesma sala, ela o congela
  let duelFez = false;
  const tickDuelo = seguro(function () {
    if (duelFez || !on() || !rejogo() || !ANA.ativa || ANA.script || !M.ativo || M.pos.distanceTo(ANA.pos) > 3.6) return;
    duelFez = true; M.l5stun = Math.max(M.l5stun || 0, 8); M.path = []; ANA.vida = Math.min(ANA.vida, 3);
    subPequeno('lia', TXB.duelo); setTimeout(() => subPequeno('ana', TXB.duelAna), 700);
  });

  // =====================================================================
  // 3. A PROCISSÃO QUE MUDA: figuras, olhar, regra sussurrada, atraso, volta e a criança que fica
  // =====================================================================
  let procAntes = null, procN = 0, nFig = 9, looker = -1, baixo = -1, terco = -1, tercoMesh = null;
  let regra = null, obeyT = 0, poupou = false, atrasoRest = 0, tortaT = 0, tortaFez = false, olharT = 0, olharDito = false, encarouDito = false, nomeDito = false;
  let atrasoIni = false, voltaPend = false, emVolta = false, ultFim = null, voltaFeita = false, lateTrilha = [], dtAtual = .016;
  let late = null;
  const procOn = () => on() && rejogo();

  function mexerFiguras(ativo) {
    PROC.filhos.forEach((s, i) => {
      if (!ativo) { s.visible = true; s.scale.setScalar(1); if (s.userData.base) { s.position.x = s.userData.base.x; } return; }
      s.visible = i < nFig;
      s.scale.setScalar(i === baixo ? .78 : 1);
      if (i === looker && s.userData.base) s.position.x = s.userData.base.x + (i % 2 ? 1 : -1) * .9; // fora da fila
    });
    if (!tercoMesh) { tercoMesh = new THREE.Mesh(new THREE.TorusGeometry(.06, .012, 6, 12), new THREE.MeshBasicMaterial({ color: 0xcfc6a0 })); tercoMesh.position.set(0, .8, .15); tercoMesh.rotation.x = Math.PI / 2; }
    if (tercoMesh.parent) tercoMesh.parent.remove(tercoMesh);
    if (ativo && PROC.filhos[terco]) PROC.filhos[terco].add(tercoMesh);
  }
  const onAviso = seguro(function () {
    procN++; poupou = false; obeyT = 0; tortaT = 0; tortaFez = false; olharT = 0; olharDito = false; encarouDito = false; nomeDito = false; regra = null; atrasoRest = 0; atrasoIni = false;
    lerDB();
    if (DB.nem === 'procissao' && !nemDito.procissao && on()) { nemDito.procissao = true; setTimeout(() => { if (PROC.fase) subPequeno('crianca', TXB.nemesis.procissao); }, 2400); }
    if (!procOn()) { nFig = 9; looker = baixo = terco = -1; return; }
    nFig = 5 + Math.floor(nrnd('pn' + procN) * 5);           // 5 a 9 figuras
    looker = Math.floor(nrnd('pl' + procN) * nFig);
    baixo = (looker + 1 + Math.floor(nrnd('pb' + procN) * (nFig - 1))) % nFig; if (baixo === looker) baixo = (looker + 1) % nFig;
    terco = (baixo + 2) % nFig;
    const s = S();
    if (s.dif !== 'facil' && nrnd('pr' + procN) < .55) regra = ['ar', 'olhar', 'luz', 'parar'][Math.floor(nrnd('prr' + procN) * 4)];
    if (s.dif !== 'facil' && !emVolta && procN >= 2 && noites() >= 2 && nrnd('pa' + procN) < .24) atrasoRest = 12 + nrnd('pad' + procN) * 8;
    if (regra) setTimeout(() => { if (PROC.fase === 'aviso') subPequeno('crianca', TXB.procRegra[regra] + '...'); }, 1500);
    if (emVolta) setTimeout(() => { if (PROC.fase) subPequeno('lia', TXB.procVolta); }, 1800);
  });
  const procAtrasa = function () {
    try {
      if (!(on() && atrasoRest > 0 && PROC.fase === 'aviso')) return false;
      if (!atrasoIni) { atrasoIni = true; setTimeout(() => subPequeno('lia', TXB.procAtraso), 1800); }
      atrasoRest -= dtAtual; return true;
    } catch (e) {}
    return false;
  };
  const procIni = function (cands) {
    try { if (on() && voltaPend && ultFim && cands && cands.includes(ultFim)) return ultFim; } catch (e) {}
    return null;
  };
  const procAviso = function () {
    try { if (on() && voltaPend) { voltaPend = false; emVolta = true; return -((E.D && E.D().aviso) || 8) * .4; } } catch (e) {}
    return 0;
  };
  const procPoupa = function () { try { return !!(on() && regra && obeyT >= .8 && !E.S.hidden && PROC.fase === 'passando' && (poupou = true)); } catch (e) { return false; } };

  const onPassa = seguro(function () {
    lateTrilha = (PROC.trilha || []).map(v => ({ x: v.x, z: v.z }));
    if (procOn()) mexerFiguras(true);
  });
  const onFim = seguro(function (passou) {
    mexerFiguras(false);
    const s = S(); if (!s) return;
    if (poupou && regra) { conquista('l6b_fila_indiana'); subPequeno('lia', TXB.procPoupou); }
    regra = null; atrasoRest = 0;
    if (emVolta) { emVolta = false; voltaFeita = true; } else voltaFeita = false;
    if (!passou || !procOn() || s.dead) return;
    ultFim = PROC.fim || null;
    if (!voltaFeita && s.dif !== 'facil' && nrnd('pv' + procN) < .32) { s.timers.procissao = 38; voltaPend = true; }
    if (s.dif !== 'facil' && nrnd('pt' + procN) < .38 && lateTrilha.length > 3) { lateIni(); }
  });

  function lateIni() {
    if (!late) {
      let g = null;
      try { g = PROC.retG.clone(true); } catch (e) { g = null; }
      if (!g) { g = new THREE.Group(); const m = new THREE.Mesh(new THREE.CylinderGeometry(.1, .22, .9, 8), new THREE.MeshBasicMaterial({ color: 0x0b0b0c })); m.position.y = .45; g.add(m); }
      g.visible = false; scene.add(g);
      late = { g, idx: 0, t: 0, passoT: 0, parou: false, espera: 0, pune: false, ativo: false };
    }
    late.t = 6; late.ativo = false; late.idx = 0; late.parou = false; late.espera = 0; late.pune = false; late.g.visible = false;
    setTimeout(() => { if (late && late.t > 0) subPequeno('lia', TXB.procAtrasada); }, 3200);
  }
  const tickLate = seguro(function (dt) {
    if (!late) return;
    const s = S();
    if (PROC.fase || !s || s.dead) { late.g.visible = false; late.ativo = false; late.t = 0; return; }
    if (late.t > 0) { late.t -= dt; if (late.t <= 0 && lateTrilha.length) { late.ativo = true; late.g.visible = true; late.g.position.set(lateTrilha[0].x, 0, lateTrilha[0].z); } return; }
    if (!late.ativo) return;
    const alvo = lateTrilha[late.idx];
    if (!alvo) { late.ativo = false; late.g.visible = false; return; }
    const d = Math.hypot(P.pos.x - late.g.position.x, P.pos.z - late.g.position.z);
    if (late.espera > 0) { // para na frente do esconderijo e vira o rosto
      late.espera -= dt; const L = s.hidden;
      if (L) late.g.rotation.y = Math.atan2(L.x - late.g.position.x, L.z - late.g.position.z);
      if (late.espera <= 0 && L && !P.prende) { s.fear = Math.min(100, s.fear + 18); emitNoise(L.x, L.z, 3, true); subPequeno('crianca', TXB.procAtrasadaOlha); }
      return;
    }
    if (s.hidden && !late.parou && Math.hypot(s.hidden.x - late.g.position.x, s.hidden.z - late.g.position.z) < 2.8) { late.parou = true; late.espera = 2.2; return; }
    if (!s.hidden && !late.pune && d < 2.2) { // saiu cedo demais
      late.pune = true; s.fear = Math.min(100, s.fear + 35); P.shake = Math.max(P.shake, .12); emitNoise(P.pos.x, P.pos.z, 6, true); subPequeno('lia', TXB.procAtrasadaPune);
      try { SX.sussurroSilencio({ x: late.g.position.x, z: late.g.position.z }, 1); } catch (e) {}
    }
    const dx = alvo.x - late.g.position.x, dz = alvo.z - late.g.position.z, l = Math.hypot(dx, dz);
    if (l < .5) { late.idx++; return; }
    const st = Math.min(l, 5 * dt); late.g.position.x += dx / l * st; late.g.position.z += dz / l * st; late.g.rotation.y = Math.atan2(dx, dz);
    late.g.position.y = Math.abs(Math.sin(perf() * 14)) * .06;
    late.passoT -= dt; if (late.passoT <= 0 && d < 16) { late.passoT = .35; try { SX.pesDescalcos(late.g.position, false); } catch (e) {} }
  });

  const regraOk = () => {
    const s = S();
    if (regra === 'ar') return !!P.prende;
    if (regra === 'olhar') return P.pitch < -.5;
    if (regra === 'luz') return !s.flashOn;
    if (regra === 'parar') return Math.hypot(P.vx || 0, P.vz || 0) > 1;
    return false;
  };
  const tickProc = seguro(function (dt) {
    dtAtual = dt;
    const f = PROC.fase || null;
    if (f !== procAntes) {
      if (f === 'aviso') onAviso(); else if (f === 'passando') onPassa(); else if (procAntes) onFim(procAntes === 'passando');
      procAntes = f;
    }
    tickLate(dt);
    if (f !== 'passando' || !procOn()) return;
    const s = S(), dP = PROC.pos.distanceTo(P.pos);
    // a regra sussurrada: cumprir à vista salva (o hook procPoupa lê obeyT)
    if (regra) { obeyT = regraOk() ? Math.min(1.5, obeyT + dt) : Math.max(0, obeyT - dt * 2); if (obeyT > .8 && dP < 4) P.shake = Math.max(P.shake, .012); }
    // a figura que olha (fora da fila)
    const fl = PROC.filhos[looker];
    if (fl && fl.visible) {
      fl.getWorldPosition(_w); const dl = _w.distanceTo(P.pos);
      if (dl < 10 && PROC.pausa <= 0) { const a = Math.atan2(P.pos.x - _w.x, P.pos.z - _w.z) - PROC.g.rotation.y; fl.rotation.y += (a - fl.rotation.y) * Math.min(1, dt * 5); }
      if (!olharDito && dl < 9 && !s.hidden && visivel(_w, 1, 10)) { olharDito = true; subPequeno('lia', TXB.procFigura); }
      if (s.hidden && P.prende && dl < 4.8) { tortaT += dt; if (tortaT > 1.4 && !tortaFez) { tortaFez = true; conquista('l6b_fila_torta'); subPequeno('lia', TXB.procFilaTorta); } }
      if (!s.hidden && dl < 9 && visivel(_w, 1, 10)) { olharT += dt; if (olharT > 2.5 && !encarouDito) { encarouDito = true; emitNoise(P.pos.x, P.pos.z, 4, true); s.fear = Math.min(100, s.fear + 12); subPequeno('lia', TXB.procEncarou); } } else olharT = Math.max(0, olharT - dt);
    }
    // a Procissão que carrega o seu nome
    if (!nomeDito && noites() >= 3 && dP < 6) { const n = nomeJogador(); if (n) { nomeDito = true; subPequeno('crianca', TXB.procNome.replace('{nome}', n)); } }
  });

  // =====================================================================
  // 4. O CHAMADO QUE ÀS VEZES É VERDADE (e o chiado do falso)
  // =====================================================================
  let verdade = null;
  const chamadoVerdade = seguro(function (sala, x, z) {
    const s = S(); if (!s || !on() || !rejogo()) return false;
    const n = s.flags.chamados || 1;
    if (nrnd('cv' + n) >= .25) return false;                 // uma em cada quatro vozes é o Davi de verdade
    fungadaLeve({ x, z });                                    // a voz verdadeira respira antes de falar
    setTimeout(() => { try { SFX.chamadoVoz(x, z); } catch (e) {} sub('davi', pick(TXB.chamadoVerdade)); }, 560);
    verdade = { sala, t: 16 };
    return true;
  });
  const chamadoFalso = seguro(function (x, z) {
    const s = S(); if (!s || !on() || !rejogo() || (s.flags.chamados || 0) < 2) return;
    // o falso ecoa só no ouvido esquerdo e vem com chiado
    const fw = new THREE.Vector3(); camera.getWorldDirection(fw);
    const px = P.pos.x + fw.z * 1.2, pz = P.pos.z - fw.x * 1.2;
    aqui({ x: px, z: pz }, 1.5, .5, (g, t) => { A.burst(t + .15, .55, 'highpass', 3200, 1, g); A.env(g, t + .15, .1, .3, .4); });
    if (!s.flags.l6bChiado) { s.flags.l6bChiado = true; setTimeout(() => subPequeno('lia', TXB.chamadoFalso), 2400); }
  });
  const tickVerdade = seguro(function (dt) {
    if (!verdade) return;
    const s = S(); verdade.t -= dt;
    if (P.room === verdade.sala) {
      verdade = null; s.battery = Math.min(100, s.battery + 25); s.fear = Math.max(0, s.fear - 35);
      if (M.ativo) M.recuo = Math.max(M.recuo, 10);
      conquista('l6b_voz_verdade'); subPequeno('lia', TXB.chamadoVerdadeLia); toast('Uma pilha no nicho. A voz era o Davi.');
    } else if (verdade.t <= 0) { verdade = null; subPequeno('lia', TXB.chamadoVerdadePerdeu); }
  });

  // =====================================================================
  // 5. O INSPETOR: dorme, usa máscara, fareja, tem humor de fúria e aprende o seu truque
  // =====================================================================
  let dorme = null, ira = 0, variante = null, varDita = false, mascara = null, luzCd = 0, faroT = 2, faroDito = false;
  let rastro = [], rastroT = 0, rastroTempo = 0;
  const aoAtivar = seguro(function () {
    if (!on() || !rejogo() || chap() !== 1) return;
    const s = S(); if (!s || s.flags.l6bDormiu || nrnd('cochila') < .75) return; // uma noite em quatro
    s.flags.l6bDormiu = true;
    const salas = salasAlcancaveis(M.pos, { semFora: true }).filter(r => !r.seguro && r !== P.room);
    if (!salas.length) return;
    const perto = salas.filter(r => { const d = distSalas(r, P.room); return d >= 1 && d <= 2; });
    const lista = perto.length ? perto : salas, r = lista[Math.floor(nrnd('cochila-sala') * lista.length) % lista.length];
    const [x, z] = pontoEm(r, 1.4);
    M.pos.set(x, 0, z); M.path = []; M.state = 'patrulha'; M.wait = 0;
    dorme = { calm: 0, ronco: 1.2, dicaFez: false, premiado: false };
  });
  const acordar = seguro(function (porRuido) {
    if (!dorme) return; dorme = null;
    M.l5stun = 0; M.l5mudo = 0; ira = 100;
    sub('inspetor', TXB.acorda);
    const d = M.pos.distanceTo(P.pos);
    if (d < 3.5) { P.shake = Math.max(P.shake, .14); S().fear = Math.min(100, S().fear + 40); }
    if (!S().hidden) iniciarAlerta(); else { M.state = 'procura'; M.searchT = 4; }
  });
  const tickDorme = seguro(function (dt) {
    if (!dorme) return;
    const s = S();
    if (!M.ativo || chap() !== 1) { dorme = null; return; }
    M.l5stun = Math.max(M.l5stun || 0, 2); M.l5mudo = Math.max(M.l5mudo || 0, 2);
    if (M.state !== 'patrulha') { M.state = 'patrulha'; } M.path = []; M.acao = null;
    const d = M.pos.distanceTo(P.pos);
    dorme.ronco -= dt; if (dorme.ronco <= 0) { dorme.ronco = 3.4; if (d < 20) ronco(M.pos); }
    if (!dorme.dicaFez && d < 11) { dorme.dicaFez = true; subPequeno('lia', TXB.dorme); }
    if (d < 2.4 && P.crouch && P.noiseR <= .6 && !dorme.premiado) {
      dorme.calm += dt;
      if (dorme.calm > 1.6) { dorme.premiado = true; s.battery = Math.min(100, s.battery + 25); conquista('l6b_sono_leve'); subPequeno('lia', TXB.dormePilha); toast('Você pegou uma pilha do casaco dele.'); }
    }
    const barulho = (d < 7 && P.noiseR > 2.6) || (d < 2.2 && !P.crouch && P.noiseR > 0);
    if (barulho || s.flags.energia || s.capT > 420) acordar(barulho);
  });

  const sortearVariante = seguro(function () {
    variante = null; varDita = false; luzCd = 0; rastro.length = 0; faroDito = false;
    if (!(on() && rejogo()) || chap() < 1) { ajustarMascara(); return; }
    const r = srnd('var-insp');
    if (noites() >= 4 && r < .14) variante = 'mascara'; else if (noites() >= 3 && r < .27) variante = 'faro';
    ajustarMascara();
  });
  function ajustarMascara() {
    if (!mascara) {
      mascara = new THREE.Group();
      const m = new THREE.Mesh(new THREE.BoxGeometry(.19, .3, .03), new THREE.MeshStandardMaterial({ color: 0xe8e2d0, roughness: .5, emissive: 0x2a2820 }));
      const olho = new THREE.MeshBasicMaterial({ color: 0x000000 });
      for (const sx of [-1, 1]) { const o = new THREE.Mesh(new THREE.BoxGeometry(.04, .035, .01), olho); o.position.set(sx * .045, .04, .02); mascara.add(o); }
      mascara.add(m); mascara.position.set(0, .1, .17);
    }
    if (mascara.parent) mascara.parent.remove(mascara);
    if (variante === 'mascara' && MON.cabeca) MON.cabeca.add(mascara);
  }
  const tickVariante = seguro(function (dt) {
    if (!variante || !M.ativo) return;
    const s = S();
    if (!varDita) { varDita = true; subPequeno('lia', variante === 'mascara' ? TXB.mascara : TXB.faro); }
    if (M.state === 'caca') s.flags.l6bCacou = true;
    luzCd = Math.max(0, luzCd - dt);
    if (variante === 'mascara') {
      const d = M.pos.distanceTo(P.pos);
      if (luzCd <= 0 && s.flashOn && !s.hidden && d < 6.5 && !['caca', 'alerta', 'bote', 'agarra', 'fareja', 'vasculha'].includes(M.state) && linhaLivre(M.pos, P.pos)) {
        luzCd = 7; M.ultimo = P.pos.clone(); iniciarAlerta(); if (!s.flags.l6bMascLuz) { s.flags.l6bMascLuz = true; subPequeno('lia', TXB.mascaraLuz); }
      }
    } else if (variante === 'faro') {
      faroT -= dt;
      if (faroT <= 0) {
        faroT = 2.2;
        if (['patrulha', 'procura'].includes(M.state) && M.recuo <= 0 && !s.hidden && !dorme && rastro.length) {
          let alvo = null;
          for (let i = rastro.length - 1; i >= 0; i--) { const idade = rastroTempo - rastro[i].t; if (idade >= 6 && idade <= 24) { alvo = rastro[i]; break; } }
          if (alvo && planejar(M, alvo.x, alvo.z)) { M.state = 'investiga'; M.ultimo = new THREE.Vector3(alvo.x, 0, alvo.z); M.acao = null; if (!faroDito) { faroDito = true; } }
        }
      }
    }
  });
  // o rastro de cheiro (também alimenta o cão e a Seguidora): uma amostra a cada meio segundo
  let trilha = [], trilhaT = 0, trilhaTempo = 0;
  const tickRastro = seguro(function (dt) {
    const s = S(); if (!s || s.dead || E.mode !== 'jogo') return;
    trilhaTempo += dt; rastroTempo = trilhaTempo; trilhaT -= dt;
    if (trilhaT > 0) return;
    trilhaT = .5;
    if (P.naAgua) { if (trilha.length) trilha.push({ x: P.pos.x, z: P.pos.z, t: trilhaTempo, quebra: true }); rastro.length = 0; if (variante === 'faro' && !s.flags.l6bFaroAgua) { s.flags.l6bFaroAgua = true; subPequeno('lia', TXB.faroAgua); conquista('l6b_despistou'); } return; }
    if (s.hidden) return;
    const p = { x: P.pos.x, z: P.pos.z, t: trilhaTempo };
    trilha.push(p); rastro.push(p);
    if (trilha.length > 140) trilha.shift();
    while (rastro.length && trilhaTempo - rastro[0].t > 26) rastro.shift();
  });

  // fúria: sobe quando você joga limpo, desce quando ele te pega
  let furiaDita = false, furiaGrunhiu = false, caAntes = '';
  const tickFuria = seguro(function (dt) {
    lerDB();
    const f = DB.furia / 100;
    ira = Math.max(0, ira - dt);
    if (M.ativo && !furiaDita && on()) { furiaDita = true; if (DB.furia >= 65) subPequeno('lia', TXB.furiaAlta); else if (DB.furia <= 15) subPequeno('lia', TXB.furiaBaixa); }
    if (M.ativo && M.state === 'caca' && caAntes !== 'caca' && DB.furia >= 65 && !furiaGrunhiu && on()) { furiaGrunhiu = true; setTimeout(() => sub('inspetor', pick(TXB.irritado)), 300); }
    caAntes = M.ativo ? M.state : '';
    // contramedida do capítulo (aprendida com o que mais usou no capítulo anterior)
    const c = contraAtual;
    let ouv = 1, vel = 1 + (f - .3) * .3 + (ira > 0 ? .14 : 0);
    if (c === 'correr' && P.sprinting) ouv *= 1.22;
    if (variante === 'mascara') ouv *= .28;
    if (variante === 'faro') ouv *= .35;
    if (dorme) ouv = 0;
    if (!on()) { vel = 1; ouv = 1; }
    M.l6bVelMul = vel; M.l6bOuvMul = ouv;
    if (c === 'ar' && on() && M.state === 'fareja') M.farejaT += dt * .35; // espera o seu fôlego acabar
  });

  // contramedida: o que você mais usou num capítulo vira a defesa dele no seguinte
  let uso = { garrafa: 0, esconder: 0, ar: 0, correr: 0 }, contraAtual = null, contraDita = false;
  const usou = seguro(function (k) { if (k in uso) uso[k]++; });
  const tickUso = seguro(function (dt) {
    const s = S(); if (!s || s.dead) return;
    if (P.prende && s.hidden) uso.ar += dt / 4;
    if (P.sprinting) uso.correr += dt / 6;
    if (contraAtual && !contraDita && M.ativo && on()) { contraDita = true; subPequeno('lia', TXB.contra[contraAtual]); }
  });

  // o tipo de esconderijo repetido três vezes seguidas vira o primeiro que ele confere
  let vigTipo = null, vigCd = 0, vigDito = false;
  const aoEsconder = seguro(function (L) {
    if (!L) return;
    const s = S(); if (!s) return;
    usou('esconder');
    const seq = s.flags.l6bSeq || (s.flags.l6bSeq = []);
    seq.push(L.tipo || 'armario'); if (seq.length > 3) seq.shift();
    if (seq.length === 3 && seq.every(t => t === seq[0])) vigTipo = seq[0];
  });
  const tickVigia = seguro(function (dt) {
    vigCd = Math.max(0, vigCd - dt);
    if (!vigTipo || vigCd > 0 || !on() || !M.ativo || M.state !== 'procura' || M.acao) return;
    const ra = roomAt(M.pos.x, M.pos.z);
    const L = W.lockers.find(l => l.tipo === vigTipo && l !== S().hidden && roomAt(l.x, l.z) === ra && Math.hypot(l.x - M.pos.x, l.z - M.pos.z) < 9 && !(E.nuncaAbre && E.nuncaAbre(l)));
    vigCd = 14; if (!L) return;
    if (planejar(M, L.x + L.face[0] * .95, L.z + L.face[1] * .95)) { M.acao = { tipo: 'bater', L }; if (!vigDito) { vigDito = true; subPequeno('lia', TXB.tipoVigia); } }
  });

  // "você passou aqui antes": ele patrulha a sala que você mais usou nesta noite
  let rotaFalou = false;
  const tickRota = seguro(function () {
    if (rotaFalou || !on() || !M.ativo || M.state !== 'patrulha') return;
    const rt = S().flags.rotas || {}; let melhor = null, n = 3;
    for (const k in rt) if (k.indexOf(W.mapa + ':') === 0 && rt[k] > n) { n = rt[k]; melhor = k.slice(W.mapa.length + 1); }
    if (!melhor) return;
    const r = roomAt(M.pos.x, M.pos.z);
    if (r && r.id === melhor && r !== P.room) { rotaFalou = true; sub('inspetor', TXB.rotaAntes); }
  });

  // =====================================================================
  // 6. ARMÁRIOS LACRADOS: a casa fecha o seu esconderijo mais usado
  // =====================================================================
  let lacres = new Set(), fitas = [], lacreDito = new Set();
  const montarLacres = seguro(function () {
    for (const f of fitas) if (f.parent) f.parent.remove(f);
    fitas = []; lacres = new Set(); lacreDito = new Set();
    if (!(on() && rejogo()) || noites() < 3 || !W.lockers || W.lockers.length < 6) return;
    let best = -1, bn = 0;
    W.lockers.forEach((L, i) => { const n = (L6DB.fav || {})[W.mapa + ':' + i] || 0; if (n > bn && L.tipo !== 'nicho') { bn = n; best = i; } });
    if (best < 0 || bn < 4) return;
    const L = W.lockers[best]; lacres.add(L);
    const g = new THREE.Group(), preto = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: .9 });
    for (const a of [.55, -.55]) { const b = new THREE.Mesh(new THREE.BoxGeometry(.85, .07, .015), preto); b.rotation.z = a; g.add(b); }
    const cad = new THREE.Mesh(new THREE.BoxGeometry(.09, .1, .05), new THREE.MeshStandardMaterial({ color: 0x8a7440, metalness: .6, roughness: .4 })); cad.position.set(0, -.06, .02); g.add(cad);
    g.position.set(L.x + L.face[0] * .38, L.tipo === 'cama' ? .65 : 1.15, L.z + L.face[1] * .38); g.rotation.y = Math.atan2(L.face[0], L.face[1]);
    (W.grupo || scene).add(g); fitas.push(g);
  });
  const lacrado = function (L) {
    try {
      if (!lacres.has(L) || PROC.fase) return false;
      if (!lacreDito.has(L)) { lacreDito.add(L); subPequeno('lia', TXB.lacre); }
      toast(TXB.lacreAviso); return true;
    } catch (e) { return false; }
  };

  // =====================================================================
  // 7. O FALSO INSPETOR (sósia parado) e o eco dos passos que mentem
  // =====================================================================
  let sosia = null, sosiaT = 0, sosiaCd = 45, sosiaOlhar = 0, sosiaVezes = 0, sosiaNoCap = 0, sosiaQuieto = true;
  function modeloSosia() {
    let g = null;
    try { g = MON.g.clone(true); } catch (e) { g = null; }
    if (!g) {
      g = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: .95 });
      const c = new THREE.Mesh(new THREE.CylinderGeometry(.2, .3, 2.6, 8), mat); c.position.y = 1.5; g.add(c);
      const h = new THREE.Mesh(new THREE.SphereGeometry(.2, 10, 8), mat); h.position.y = 3; g.add(h);
    }
    g.traverse(o => { if (o.isMesh) o.castShadow = false; });
    g.visible = false; scene.add(g); return g;
  }
  const esconderSosia = (reaparece) => { if (sosia) sosia.visible = false; sosiaT = 0; sosiaOlhar = 0; };
  const tickSosia = seguro(function (dt) {
    const s = S(); if (!s || !on() || !rejogo()) return;
    if (!sosia || !sosia.visible) {
      sosiaCd -= dt;
      if (sosiaCd > 0 || sosiaNoCap >= 2 || !M.ativo || chap() < 1 || s.hidden || P.room.fora || s.dead) return;
      sosiaCd = rand(45, 85);
      if (Math.random() > .45) return;
      const fw = new THREE.Vector3(); camera.getWorldDirection(fw); fw.y = 0; fw.normalize();
      const dir = fw.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() < .5 ? 1 : -1) * .5);
      for (const dist of [13, 11, 9]) {
        const p = P.pos.clone().addScaledVector(dir, dist), r = roomAt(p.x, p.z);
        if (!r || r.fora || !linhaLivre(P.pos, p, 1.5)) continue;
        if (!sosia) sosia = modeloSosia();
        sosia.position.set(p.x, 0, p.z); sosia.rotation.y = Math.atan2(P.pos.x - p.x, P.pos.z - p.z); sosia.visible = true;
        sosiaT = 14; sosiaOlhar = 0; sosiaQuieto = true; sosiaNoCap++; const n = sosiaVezes++;
        setTimeout(() => subPequeno('lia', TXB.sosia[Math.min(2, n)]), 1200);
        if (['patrulha', 'procura'].includes(M.state) && M.recuo <= 0) { if (planejar(M, P.pos.x, P.pos.z)) { M.state = 'procura'; M.searchT = 6; } } // o de verdade ronda por trás
        break;
      }
      return;
    }
    sosiaT -= dt;
    const d = sosia.position.distanceTo(P.pos);
    sosia.rotation.y = Math.atan2(P.pos.x - sosia.position.x, P.pos.z - sosia.position.z);
    if (visivel(sosia.position, 1.6, 22)) sosiaOlhar += dt; else sosiaOlhar = Math.max(0, sosiaOlhar - dt);
    if (sosiaOlhar > 2.2) { sosiaOlhar = 0; sosiaQuieto = false; emitNoise(P.pos.x, P.pos.z, 5, true); s.fear = Math.min(100, s.fear + 8); subPequeno('lia', TXB.sosiaOlhou); esconderSosia(); return; }
    if (d < 5 || sosiaT <= 0) { if (sosiaQuieto && d < 5) conquista('l6b_sosia'); esconderSosia(); }
  });
  let ecoFez = false, escondidoT = 0, hiddenAntes = false, ecoJanela = 0;
  const tickEco = seguro(function (dt) {
    const s = S(); if (!s || !on() || !rejogo()) return;
    escondidoT = s.hidden ? escondidoT + dt : 0;
    if (!ecoFez && s.hidden && escondidoT > 6 && M.ativo && M.state !== 'caca' && chap() >= 1 && Math.random() < dt * .05) {
      const salas = salasAlcancaveis(P.pos).filter(r => r !== P.room && !r.fora && distSalas(r, P.room) >= 2 && centroSala(r).distanceTo(M.pos) > 8);
      if (salas.length) {
        ecoFez = true; const c = centroSala(pick(salas));
        for (let i = 0; i < 5; i++) setTimeout(() => { try { SFX.passoMonstro({ x: c.x + rand(-1, 1), z: c.z + rand(-1, 1) }, .8); } catch (e) {} }, i * 650);
        setTimeout(() => subPequeno('lia', TXB.eco), 1500); ecoJanela = perf() + 8;
      }
    }
    if (hiddenAntes && !s.hidden && ecoJanela > 0 && perf() < ecoJanela) { ecoJanela = 0; P.shake = Math.max(P.shake, .12); s.fear = Math.min(100, s.fear + 25); try { abafarMundo(.3, 1.6); } catch (e) {} subPequeno('lia', TXB.ecoTonto); } // sem dano, só tontura
    hiddenAntes = !!s.hidden;
  });

  // =====================================================================
  // 8. A SEGUIDORA: repete os seus passos com vinte segundos de atraso
  // =====================================================================
  let seg = null, segCd = 0, prints = [], printT = 0, segDita = false;
  const SEG_ATRASO = 20;
  function amostra(t) { // posição da trilha no instante t (interpolada); null se não houver
    if (trilha.length < 2 || t < trilha[0].t) return null;
    for (let i = trilha.length - 1; i > 0; i--) {
      if (trilha[i - 1].t <= t) {
        const a = trilha[i - 1], b = trilha[i]; if (a.quebra || b.quebra) return { x: b.x, z: b.z, quebra: true };
        const k = clamp((t - a.t) / Math.max(.01, b.t - a.t), 0, 1); return { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k };
      }
    }
    return null;
  }
  function criarSeg() {
    const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: 0x9fb4c4, transparent: true, opacity: .55, depthWrite: false });
    const c = new THREE.Mesh(new THREE.CylinderGeometry(.11, .26, 1.0, 9), mat); c.position.y = .55; g.add(c);
    const h = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), mat); h.position.y = 1.25; g.add(h);
    g.visible = false; scene.add(g); return { g, vida: 0, perto: 99, ativo: false, passoT: 0 };
  }
  function pegada(x, z, yaw) {
    let m = prints.find(p => p.vida <= 0);
    if (!m) { if (prints.length >= 14) return; const mesh = new THREE.Mesh(new THREE.PlaneGeometry(.3, .52), new THREE.MeshBasicMaterial({ color: 0x5aa8d0, transparent: true, opacity: .5, depthWrite: false })); mesh.rotation.x = -Math.PI / 2; scene.add(mesh); m = { mesh, vida: 0 }; prints.push(m); }
    m.vida = 6; m.mesh.position.set(x, .035, z); m.mesh.rotation.z = yaw || 0; m.mesh.visible = true;
  }
  const tickSeguidora = seguro(function (dt) {
    for (const p of prints) if (p.vida > 0) { p.vida -= dt; p.mesh.material.opacity = clamp(p.vida / 6, 0, 1) * .5; if (p.vida <= 0) p.mesh.visible = false; }
    const s = S(); if (!s || !on() || !rejogo()) return;
    segCd = Math.max(0, segCd - dt);
    if (!seg || !seg.ativo) {
      if (segCd > 0 || noites() < 3 || (chap() !== 3 && chap() !== 4) || s.capT < 45 || trilhaTempo - (trilha[0] ? trilha[0].t : trilhaTempo) < SEG_ATRASO + 3 || s.dead || s.hidden) return;
      if (!seg) seg = criarSeg();
      seg.ativo = true; seg.vida = 32; seg.perto = 99; seg.g.visible = true; segDita = false; return;
    }
    seg.vida -= dt;
    const t = trilhaTempo - SEG_ATRASO, p = amostra(t);
    if (!p || p.quebra || seg.vida <= 0) { // perdeu o rastro ou acabou o tempo
      seg.ativo = false; seg.g.visible = false; segCd = 70;
      if (seg.perto > 2.2) { subPequeno('lia', TXB.seguidoraSome); conquista('l6b_despistou'); }
      return;
    }
    const antes = seg.g.position.clone();
    seg.g.position.set(p.x, 0, p.z);
    const d = Math.hypot(P.pos.x - p.x, P.pos.z - p.z); seg.perto = Math.min(seg.perto, d);
    const dx = p.x - antes.x, dz = p.z - antes.z; if (Math.hypot(dx, dz) > .01) seg.g.rotation.y = Math.atan2(dx, dz);
    seg.g.children.forEach(m => { if (m.material) m.material.opacity = .4 + .15 * Math.sin(perf() * 5); });
    seg.passoT -= dt; if (seg.passoT <= 0 && d < 18) { seg.passoT = .45; try { SX.pesDescalcos(seg.g.position, true); } catch (e) {} }
    printT -= dt; if (printT <= 0) { printT = .7; const f = amostra(t + 4); if (f && !f.quebra) pegada(f.x, f.z, Math.atan2(f.x - p.x, f.z - p.z)); } // as pegadas atrasadas brilham no caminho dela
    if (!segDita && d < 14) { segDita = true; subPequeno('lia', TXB.seguidora); }
    if (d < .95 && !s.hidden) {
      dano(14); gritoCurto(seg.g.position); subPequeno('lia', TXB.seguidoraToca);
      seg.ativo = false; seg.g.visible = false; segCd = 70; seg.perto = 0;
    }
  });

  // =====================================================================
  // 9. O CÃO FAREJADOR: ignora o som, segue o rastro; água e porta fechada o perdem
  // =====================================================================
  let cao = null, caoJa = -1;
  function criarCao() {
    const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: 0x241c17, roughness: .9 });
    const box = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); g.add(m); return m; };
    box(.38, .3, .85, 0, .52, 0); box(.2, .22, .26, 0, .66, .52); box(.1, .1, .16, 0, .6, .68);
    for (const [x, z] of [[-.13, .3], [.13, .3], [-.13, -.3], [.13, -.3]]) box(.07, .4, .07, x, .2, z);
    const rabo = box(.05, .05, .3, 0, .62, -.55); rabo.rotation.x = -.5;
    g.visible = false; scene.add(g);
    return { g, st: 'segue', t: 0, cursor: 0, ativo: false, lateT: 0, passoT: 0, rosnou: false };
  }
  const tickCao = seguro(function (dt) {
    const s = S(); if (!s || !on() || !rejogo()) { if (cao && cao.ativo) { cao.ativo = false; cao.g.visible = false; } return; }
    if (!cao || !cao.ativo) {
      if (noites() < 4 || chap() < 2 || chap() > 4 || caoJa === chap() + ':' + W.mapa || s.capT < 70 || srnd('cao') < .45 || s.dead || s.hidden || trilha.length < 30) return;
      if (!cao) cao = criarCao();
      caoJa = chap() + ':' + W.mapa; cao.ativo = true; cao.st = 'segue'; cao.t = 0; cao.rosnou = false; cao.cursor = Math.max(trilha[0].t, trilhaTempo - 14); cao.g.visible = true; cao.lateT = 0;
      const p = amostra(cao.cursor); if (p) cao.g.position.set(p.x, 0, p.z); else { cao.ativo = false; cao.g.visible = false; return; }
      subPequeno('lia', TXB.cao); return;
    }
    const pos = cao.g.position, d = Math.hypot(P.pos.x - pos.x, P.pos.z - pos.z);
    cao.t += dt;
    const sair = () => { cao.ativo = false; cao.g.visible = false; };
    if (cao.st === 'perdeu') { if (cao.t > 4.5) sair(); return; }
    if (cao.st === 'segue') {
      cao.cursor += dt * 1.35;
      const p = amostra(cao.cursor);
      if (!p) { sair(); return; }
      if (p.quebra) { cao.st = 'perdeu'; cao.t = 0; subPequeno('lia', TXB.caoAgua); conquista('l6b_despistou'); return; }
      const antes = pos.clone(); pos.set(p.x, 0, p.z);
      if (Math.hypot(pos.x - antes.x, pos.z - antes.z) > .005) cao.g.rotation.y = Math.atan2(pos.x - antes.x, pos.z - antes.z);
      for (const dr of W.doors) if (!dr.open && Math.hypot(dr.x - pos.x, dr.z - pos.z) < 1.2) { cao.st = 'perdeu'; cao.t = 0; subPequeno('lia', TXB.caoPorta); conquista('l6b_despistou'); return; } // porta fechada atrás de você
      cao.passoT -= dt; if (cao.passoT <= 0 && d < 14) { cao.passoT = .28; try { SX.pesDescalcos(pos, false); } catch (e) {} }
      if (cao.cursor >= trilhaTempo - 3 || d < 5) { cao.st = s.hidden ? 'espia' : 'late'; cao.t = 0; if (cao.st === 'late') { latir(pos, true); subPequeno('lia', TXB.caoLate); } else rosnar(pos); }
      return;
    }
    if (cao.st === 'late') { // late antes do bote: aviso claro de 0,9 s
      cao.g.rotation.y = Math.atan2(P.pos.x - pos.x, P.pos.z - pos.z);
      if (cao.t > .9) cao.st = 'bote';
      return;
    }
    if (cao.st === 'bote') {
      const l = Math.max(.01, d), st = Math.min(l, 6 * dt);
      pos.x += (P.pos.x - pos.x) / l * st; pos.z += (P.pos.z - pos.z) / l * st; cao.g.rotation.y = Math.atan2(P.pos.x - pos.x, P.pos.z - pos.z);
      if (s.hidden) { cao.st = 'espia'; cao.t = 0; return; }
      if (d < 1.0) { dano(15); latir(pos, true); emitNoise(pos.x, pos.z, 8, false); cao.st = 'perdeu'; cao.t = 0; }
      else if (cao.t > 6) sair();
      return;
    }
    if (cao.st === 'espia') { // escondida: ele fareja a porta do esconderijo
      const L = s.hidden; if (!L) { cao.st = 'bote'; cao.t = 0; return; }
      pos.x += (L.x - pos.x) * Math.min(1, dt * 2); pos.z += (L.z - pos.z) * Math.min(1, dt * 2);
      if (cao.t > 3.2 && !cao.rosnou) { cao.rosnou = true; if (!P.prende) { latir(pos, true); emitNoise(L.x, L.z, 9, false); } else rosnar(pos); }
      if (cao.t > 6.5) sair();
    }
  });

  // =====================================================================
  // 10. NÊMESIS: o monstro que mais te matou te reconhece
  // =====================================================================
  const nemDito = { inspetor: false, ana: false, procissao: false };
  const tickNemesis = seguro(function () {
    if (!on() || !M.ativo || nemDito.inspetor || lerDB().nem !== 'inspetor') return;
    if (M.state === 'caca' || M.state === 'alerta') { nemDito.inspetor = true; setTimeout(() => { try { sub('inspetor', TXB.nemesis.inspetor); } catch (e) {} }, 400); }
  });
  const recalcNem = () => {
    let top = null, n = 2;
    for (const k of ['inspetor', 'ana', 'procissao']) if ((DB.mortes[k] || 0) > n) { n = DB.mortes[k]; top = k; }
    DB.nem = top;
  };
  const morte = seguro(function (quem) {
    if (!on()) return;
    lerDB();
    if (quem in DB.mortes) DB.mortes[quem]++;
    const ctx = String((S() && S().causaCtx) || '');
    DB.ultCausa = /agarr/.test(ctx) ? 'agarrao' : /escond/.test(ctx) ? 'escondida' : /bote/.test(ctx) ? 'bote' : /pilha/.test(ctx) ? 'pilha' : quem;
    DB.furia = clamp(DB.furia - 15, 0, 100);
    const s = S(); if (s) { s.flags.l6bSeq = []; }
    vigTipo = null;
    recalcNem(); salvar();
  });
  const telaMorte = seguro(function () {
    if (!on()) return;
    lerDB(); const s = S(); const q = s && s.causa; const n = DB.mortes[q] || 0;
    if (n >= 3 && DB.nem === q && TXB.nemesisMorte[q]) {
      const el = document.getElementById('death-conta');
      if (el) el.textContent = (el.textContent ? el.textContent + ' · ' : '') + TXB.nemesisMorte[q].replace('{n}', n);
    }
  });
  const fimCapitulo = seguro(function () {
    const s = S(); if (!s) return;
    lerDB();
    const limpo = s.capDano === 0;
    if (limpo) {
      DB.furia = clamp(DB.furia + 20, 0, 100);
      if (variante === 'mascara' && !s.flags.l6bCacou && on()) conquista('l6b_mascara');
      if (DB.nem && on()) { conquista('l6b_nemesis'); const velho = DB.nem; DB.mortes[velho] = Math.max(0, (DB.mortes[velho] || 0) - 2); recalcNem(); subPequeno('lia', TXB.nemesisMuda); }
    }
    // a ferramenta mais usada no capítulo vira a contramedida do próximo
    let top = null, v = 1.9;
    for (const k of ['garrafa', 'esconder', 'ar', 'correr']) if (uso[k] > v) { v = uso[k]; top = k; }
    DB.contra = top; uso = { garrafa: 0, esconder: 0, ar: 0, correr: 0 };
    salvar();
  });

  // =====================================================================
  // GANCHOS DO MOTOR
  // =====================================================================
  const novoMapa = seguro(function () {
    lerL6(); lerDB();
    esconderSosia(); sosiaNoCap = 0; sosiaCd = rand(40, 70);
    if (fake) { fake.visible = false; fakeOn = false; }
    if (late) { late.ativo = false; late.g.visible = false; late.t = 0; }
    if (seg) { seg.ativo = false; seg.g.visible = false; }
    if (cao) { cao.ativo = false; cao.g.visible = false; }
    for (const p of prints) { p.vida = 0; p.mesh.visible = false; }
    trilha = []; trilhaTempo = 0; trilhaT = 0; rastro = []; segCd = 40;
    dorme = null; verdade = null; rotaFalou = false; furiaDita = false; furiaGrunhiu = false; vigDito = false; vigTipo = null; vigCd = 20;
    duelFez = false; ecoFez = false; ecoJanela = 0; calcadoDito = false; anaUlt = -1;
    nemDito.inspetor = false; nemDito.ana = false; nemDito.procissao = false;
    procAntes = null; mexerFiguras(false);
    sortearCalcado(); sortearAna(); sortearVariante(); montarLacres();
    // contramedida aprendida no capítulo anterior (capítulo 2 em diante)
    contraAtual = (chap() >= 2 && on()) ? DB.contra : null; contraDita = false;
    if (contraAtual === 'garrafa') M.l6garrafaDur = (M.l6garrafaDur || 1) * .5;
    else if (contraAtual === 'esconder') M.l6procMul = (M.l6procMul || 1) * 1.5;
  });

  const tick = seguro(function (dt) {
    const s = S(); if (!s) return;
    tickFuria(dt);
    tickAna(dt);
    if (!on()) return;
    tickRastro(dt);
    tickCalcado();
    tickProc(dt);
    tickVerdade(dt);
    tickDorme(dt);
    tickVariante(dt);
    tickUso(dt);
    tickVigia(dt);
    tickRota();
    tickDuelo();
    tickSosia(dt);
    tickEco(dt);
    tickSeguidora(dt);
    tickCao(dt);
    tickNemesis();
  });

  return { tick, novoMapa, aoAtivar, aoEsconder, morte, telaMorte, fimCapitulo, usou,
    anaMove, semAna, procIni, procAviso, procAtrasa, procPoupa, chamadoVerdade, chamadoFalso, lacrado,
    estado: () => ({ calcado, anaVar, variante, regra, nFig, dorme: !!dorme, contra: contraAtual, seg: !!(seg && seg.ativo), cao: !!(cao && cao.ativo), sosia: !!(sosia && sosia.visible), late: !!(late && late.ativo), fake: !!(fake && fake.visible), lacres: lacres.size }) };
}
