// MONSTROS E IA, lote 6 — REJOGABILIDADE (A Hora do Silêncio).
// Modos extras, desafios, variações por semente, conquistas, recordes e segredos de segunda jogada.
// Tudo num módulo só: o motor chama criarMonstrosLote6(E) uma vez e usa L6.tick(dt) + ganchos curtos.
// Campos de gancho lidos pelo motor: M.l6velMul, M.l6ouvidoMul, M.l6peso (viés de patrulha), ANA.l6ritmo, ANA.l6inicio.
// Nada aqui pode estourar: cada subsistema roda dentro de um try/catch (seguro()).
import { TX6 } from './monstros-lote6-texto.js';

export function criarMonstrosLote6(E) {
  const { THREE, W, P, M, ANA, PROC, MON, scene, SX, SFX } = E;
  const S = () => E.S, perf = () => E.perf, mode = () => E.mode, ui = () => E.ui;
  const { roomAt, SALA, salaAdj, salasAlcancaveis, distSalas, pontoEm, centroSala, subPequeno, toast, conquista, falaInspetor } = E;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const seguro = fn => function (...a) { try { return fn.apply(null, a); } catch (e) { /* um subsistema nunca derruba o quadro */ } };

  // ---------------------------------------------------------------- semente da noite
  function h01(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return ((h >>> 0) % 100003) / 100003; }
  const sem = () => { const s = S(); return (s && s.semente) || 'SEMCOD'; };
  const chap = () => (S() || {}).chapter || 0;
  // valor 0..1 estável por (semente, mapa, capítulo, chave)
  const srnd = k => h01(sem() + '|' + W.mapa + '|' + chap() + '|' + k);
  const spick = (k, arr) => arr[Math.floor(srnd(k) * arr.length) % arr.length];
  const webdriver = () => { try { return !!navigator.webdriver; } catch (e) { return false; } };

  // ---------------------------------------------------------------- memória entre noites (localStorage)
  const DB_KEY = 'hora-silencio-l6';
  let DB = null, saveCd = 0;
  function carregarDB() {
    if (DB) return DB;
    try { DB = JSON.parse(localStorage.getItem(DB_KEY) || 'null'); } catch (e) { DB = null; }
    if (!DB || typeof DB !== 'object') DB = {};
    DB.noites = DB.noites || 0;
    DB.venceu = DB.venceu || 0;          // quantas vezes chegou ao final verdadeiro (nº da Vigília)
    DB.fav = DB.fav || {};               // mapa:idx -> quantas vezes você se escondeu ali
    DB.favTipo = DB.favTipo || {};       // 'armario'/'cama' -> contagem geral
    DB.rotas = DB.rotas || {};           // mapa:sala -> passagens
    DB.mortePos = DB.mortePos || {};     // mapa -> {x,z} da última morte pelo Inspetor
    DB.vicio = DB.vicio || { garrafa: 0, armario: 0, cama: 0, ar: 0 };
    DB.humores = DB.humores || {};       // humores já lidos
    DB.recordeCola = DB.recordeCola || 0;
    DB.modos = DB.modos || {};           // vigia / cacador / furor / faro
    return DB;
  }
  function salvarDB(agora) { try { if (agora) localStorage.setItem(DB_KEY, JSON.stringify(DB)); else saveCd = Math.min(saveCd || 99, 1.2); } catch (e) {} }

  // =====================================================================
  // HUMOR DO INSPETOR POR NOITE (temperamento sorteado, nunca escrito na tela)
  // =====================================================================
  // vel = multiplicador de velocidade, ouv = de audição, disc = disciplina da procura (fica mais/menos tempo)
  const HUMORES = [
    { id: 'paciente', vel: 0.9, ouv: 1.0, disc: 1.5, afobado: 0, proc: 1.5 },               // abre cada armário, sem pressa
    { id: 'nervoso', vel: 1.05, ouv: 1.18, disc: 0.75, afobado: 1, proc: 0.7 },             // reage a tudo, larga cedo
    { id: 'metodico', vel: 0.97, ouv: 1.0, disc: 1.2, afobado: 0, proc: 1.1 },
    { id: 'surdo', vel: 1.08, ouv: 0.82, disc: 1.0, afobado: 0, proc: 0.9, flanco: 1 },      // ouve mal de um lado
    { id: 'faminto', vel: 1.1, ouv: 0.9, disc: 1.3, afobado: 1, proc: 0.8 },
    { id: 'teimoso', vel: 0.95, ouv: 1.05, disc: 1.8, afobado: 0, proc: 1.3 }               // não larga o osso
  ];
  const estado = { capAplicado: -99, mapaAplicado: '', humor: null, telegrafou: false, discTop: 0 };

  const aplicarHumor = seguro(function () {
    const s = S(); if (!s) return;
    const chave = W.mapa + '#' + chap();
    if (estado.capAplicado === chave) return;
    estado.capAplicado = chave;
    estado.telegrafou = false;
    const h = spick('humor', HUMORES);
    estado.humor = h;
    estado.flancoLado = flancoLado();
    M.l6velMul = h.vel;
    M.l6ouvidoMul = h.ouv;
    M.l6procMul = h.proc || 1;
    // contra-jogo da noite: a distração da garrafa e o esconderijo da Ana mudam de leve
    M.l6garrafaDur = 0.75 + srnd('garr-dur') * 0.9;        // 0.75x..1.65x
    M.l6boteMul = 0.8 + srnd('bote') * 0.5;                // bote mais rápido/lento por noite
    M.l6calor = 0.7 + srnd('calor') * 0.8;                 // sensibilidade ao calor da lanterna
    M.l6embMul = h.disc;                                   // humores disciplinados fingem ir embora mais
    M.l6cacaMul = 0.8 + (h.disc - 1) * 0.5 + srnd('caca') * 0.3; // teimosia da procura (humor + semente)
    if (ANA) ANA.l6teto = 0.1 + srnd('ana-teto') * 0.35;  // 10%..45% de chance de teto
    // registra humor lido (para a conquista "Eu Te Conheço")
    carregarDB();
  });

  // lado do flanco "surdo" sorteado por noite (esquerda/direita do Inspetor)
  const flancoLado = () => (srnd('flanco-lado') > 0.5 ? 1 : -1);

  // a disciplina e a afobação do humor viram comportamento de verdade no cérebro que já existe
  const tickHumorBrain = seguro(function (dt) {
    const h = estado.humor; if (!h || !M.ativo) return;
    // disciplina: paciente/teimoso ficam mais tempo procurando; nervoso larga mais cedo
    if (M.state === 'procura' && M.searchT > 0) {
      const alvo = 5 * h.disc;
      if (h.disc > 1.1 && M.searchT < alvo) M.searchT = Math.min(alvo, M.searchT + dt * 0.5);
      else if (h.disc < 0.9) M.searchT = Math.max(0, M.searchT - dt * 0.4);
    }
    // afobado (nervoso/faminto): esfria o recuo e a espera para voltar à caça mais cedo
    if (h.afobado) { if (M.recuo > 2) M.recuo = Math.max(2, M.recuo - dt * 0.6); M.diretorT = Math.min(M.diretorT, 8); }
    // surdo de um lado: quando você está do lado ruim dele, ele ouve pior
    if (h.flanco) {
      const rel = Math.atan2(P.pos.x - M.pos.x, P.pos.z - M.pos.z) - (M.yaw || 0);
      const lado = Math.sin(rel); // -1..1
      const ruim = (lado * (estado.flancoLado || 1)) > 0.3;
      M.l6ouvidoMul *= (ruim ? 0.6 : 1.1); // multiplica a base da noite (sem acumular entre quadros)
    }
  });

  // MANIA DA NOITE: o Inspetor fixa numa sala (ronda ali com mais frequência) — telegrafada
  const aplicarMania = seguro(function () {
    const salas = (W.salas || []).filter(r => !r.fora && !r.seguro);
    if (!salas.length) { estado.mania = null; return; }
    estado.mania = salas[Math.floor(srnd('mania') * salas.length) % salas.length];
  });

  // telegrafa o humor de leve, uma vez por capítulo, só quando o Inspetor está ativo
  const telegrafarHumor = seguro(function () {
    if (estado.telegrafou || !estado.humor || !M.ativo) return;
    estado.telegrafou = true;
    const txt = TX6.humor[estado.humor.id];
    if (txt) subPequeno('lia', txt);
    DB.humores[estado.humor.id] = true;
    if (Object.keys(DB.humores).length >= HUMORES.length) conquista('l6_humores');
    salvarDB();
  });

  // =====================================================================
  // A CASA APRENDE VOCÊ (memória entre noites alimenta o cérebro que já existe)
  // =====================================================================
  // Só da segunda noite/jogada em diante: semeia S.flags.escUso e S.flags.rotas com o que você fez antes,
  // para o Inspetor já começar a noite "sabendo" seus esconderijos e rotas favoritos.
  const semearAprendizado = seguro(function () {
    const s = S(); if (!s) return;
    carregarDB();
    const segundaJogada = (DB.noites > 1 || DB.venceu > 0);
    if (!segundaJogada) return;
    s.flags = s.flags || {};
    s.flags.escUso = s.flags.escUso || {};
    s.flags.rotas = s.flags.rotas || {};
    // esconderijos favoritos (viés leve: no máximo dá ao Inspetor a pista, nunca garante)
    for (const k in DB.fav) if (k.indexOf(W.mapa + ':') === 0) {
      const n = DB.fav[k]; if (n >= 2) s.flags.escUso[k] = Math.min(3, Math.max(s.flags.escUso[k] || 0, n >= 4 ? 3 : 2));
    }
    // rotas mais usadas
    for (const k in DB.rotas) if (k.indexOf(W.mapa + ':') === 0) {
      s.flags.rotas[k] = Math.max(s.flags.rotas[k] || 0, Math.min(4, DB.rotas[k]));
    }
    estado.aprendeu = segundaJogada;
  });

  // viés de patrulha lido por patrulhar(): as salas onde você mais andou pesam mais (cresce com as noites)
  const montarViesPatrulha = seguro(function () {
    const s = S();
    const peso = {};
    if (s && (DB.noites > 1 || DB.venceu > 0)) for (const k in DB.rotas) if (k.indexOf(W.mapa + ':') === 0) peso[k] = 1 + Math.min(1.2, DB.rotas[k] * 0.08);
    // mania da noite: a sala fixada pesa muito mais na ronda
    if (estado.mania) peso[W.mapa + ':' + estado.mania.id] = Math.max(peso[W.mapa + ':' + estado.mania.id] || 1, 2.2);
    // vigia da lembrança: da segunda jogada em diante ele ronda mais a sala onde te pegou da última vez neste mapa
    const mpv = (DB.mortePos || {})[W.mapa];
    if (mpv && (DB.noites > 1 || DB.venceu > 0)) { try { const r = roomAt(mpv.x, mpv.z); if (r && !r.fora && !r.seguro) peso[W.mapa + ':' + r.id] = Math.max(peso[W.mapa + ':' + r.id] || 1, 1.8); } catch (e) {} }
    M.l6peso = Object.keys(peso).length ? peso : null;
  });

  // =====================================================================
  // GANCHOS DE ESCONDERIJO E MORTE (gravam a memória)
  // =====================================================================
  const aoEsconder = seguro(function (L) {
    if (!L || webdriver()) return;
    carregarDB();
    const idx = W.lockers.indexOf(L), k = W.mapa + ':' + idx;
    DB.fav[k] = (DB.fav[k] || 0) + 1;
    const tipo = L.tipo === 'cama' ? 'cama' : 'armario';
    DB.favTipo[tipo] = (DB.favTipo[tipo] || 0) + 1;
    DB.vicio[tipo] = (DB.vicio[tipo] || 0) + 1;
    // marca os tipos usados no capítulo (para "Nunca No Mesmo Canto")
    const s = S(); if (s) { s.flags = s.flags || {}; const set = s.flags.l6tipos || (s.flags.l6tipos = {}); set[tipo] = (set[tipo] || 0) + 1; }
    salvarDB();
  });
  const aoSair = seguro(function () { /* o tempo "na cola" fecha no tick */ });

  const morte = seguro(function (quem) {
    if (webdriver()) return;
    carregarDB();
    if (quem === 'inspetor') {
      DB.mortePos[W.mapa] = { x: P.pos.x, z: P.pos.z, cap: chap() };
      // chave 12 por teimosia: morrer 3x perto do mesmo ponto na mesma noite deixa um recado
      const s = S(); if (s) {
        s.flags = s.flags || {};
        const mp = s.flags.l6mortePonto;
        if (mp && Math.hypot(mp.x - P.pos.x, mp.z - P.pos.z) < 3) {
          mp.n = (mp.n || 1) + 1;
          if (mp.n >= 3 && !s.flags.l6teimosia) { s.flags.l6teimosia = true; setTimeout(() => { try { toast('Ele deixou algo cair no chão deste canto.'); } catch (e) {} }, 2600); }
        } else s.flags.l6mortePonto = { x: P.pos.x, z: P.pos.z, n: 1 };
      }
      salvarDB(true);
      subirNotoriedade(3);   // ser pega deixa fama: a próxima noite começa mais tensa
      contarMorte(quem);     // na Vigília, ele murmura quantas vezes já te pegou
    }
  });

  // =====================================================================
  // ECO DA ÚLTIMA MORTE (vulto vermelho no ponto onde ele te pegou; some se iluminado)
  // =====================================================================
  let eco = null, ecoFez = false;
  const montarEco = seguro(function () {
    if (eco) { scene.remove(eco); eco = null; }
    ecoFez = false;
    const mp = (DB.mortePos || {})[W.mapa];
    if (!mp || mp.cap !== chap() || webdriver()) return;
    const g = new THREE.Group();
    const corpo = new THREE.Mesh(new THREE.BoxGeometry(.4, 1.7, .3), new THREE.MeshBasicMaterial({ color: 0x5a0808, transparent: true, opacity: .28, depthWrite: false }));
    corpo.position.y = .85; g.add(corpo);
    g.position.set(mp.x, 0, mp.z); g.visible = false; scene.add(eco = g);
    eco.userData = { base: .28 };
  });
  const tickEco = seguro(function (dt) {
    if (!eco) return;
    const mp = (DB.mortePos || {})[W.mapa]; if (!mp) return;
    const dP = Math.hypot(mp.x - P.pos.x, mp.z - P.pos.z);
    const visto = dP < 9 && salaAdj(roomAt(mp.x, mp.z), P.room);
    eco.visible = visto && !eco.userData.sumiu;
    if (!visto) return;
    // a lanterna apaga o eco (e revela que você reconheceu o lugar)
    if (S().flashOn && dP < 5) { eco.userData.sumiu = true; eco.visible = false; if (!ecoFez) { ecoFez = true; subPequeno('lia', TX6.ecoMorte); } }
    else if (!ecoFez && dP < 4) { ecoFez = true; subPequeno('lia', TX6.ecoMorte); }
    eco.children[0].material.opacity = eco.userData.base * (.6 + .4 * Math.sin(perf() * 3));
  });

  // =====================================================================
  // RECORDE: TEMPO NA COLA SEM SER ACHADA
  // =====================================================================
  let colaT = 0, colaMax = 0;
  const tickCola = seguro(function (dt) {
    const s = S(); if (!s || s.dead) return;
    const perto = M.ativo && !s.hidden && ['caca', 'procura', 'investiga'].includes(M.state) && M.pos.distanceTo(P.pos) < 6;
    if (perto) {
      colaT += dt; colaMax = Math.max(colaMax, colaT);
      if (colaT >= 60 && !s.flags.l6danca) { s.flags.l6danca = true; conquista('l6_danca'); }
    } else if (colaT > 0) {
      if (colaT >= 8) fecharCola();
      colaT = 0;
    }
  });
  function fecharCola() {
    carregarDB();
    if (colaMax > DB.recordeCola + 2) {
      DB.recordeCola = colaMax; salvarDB(true);
      const t = colaMax >= 60 ? Math.floor(colaMax / 60) + 'min' + String(Math.floor(colaMax % 60)).padStart(2, '0') : Math.floor(colaMax) + 's';
      toast(TX6.recordeCola.replace('{t}', t));
    }
    colaMax = 0;
  }

  // =====================================================================
  // ELE CANSA DO TRUQUE DA GARRAFA (entre repetições na mesma noite)
  // =====================================================================
  const garrafaCansaco = seguro(function () {
    const s = S(); if (!s) return;
    carregarDB();
    s.flags = s.flags || {};
    s.flags.l6garr = (s.flags.l6garr || 0) + 1;
    DB.vicio.garrafa = (DB.vicio.garrafa || 0) + 1; DB.notoriedade = clamp((DB.notoriedade || 0) + 0.6, 0, 100); salvarDB(); // barulho deixa fama
    // quem abusou da garrafa em noites passadas encontra um Inspetor que cansa mais cedo
    const limite = (DB.vicio.garrafa > 30) ? 2 : (DB.vicio.garrafa > 12) ? 3 : 4;
    if (s.flags.l6garr >= limite) {
      M.ignoraGarrafa = Math.max(M.ignoraGarrafa || 0, 6); // ele só vira a cabeça, não vai mais
      if (!s.flags.l6garrFala) { s.flags.l6garrFala = true; M.falaT = 0; try { falaInspetor(false, 'volta'); } catch (e) {} subPequeno('lia', TX6.sabeVicio); }
    }
  });

  // lembranças de noites passadas, ditas de leve uma vez (só na segunda jogada em diante)
  let lembrou = 0;
  const tickLembrancas = seguro(function () {
    if (!estado.aprendeu || !M.ativo || lembrou > perf() - 1) return;
    const s = S(); if (!s) return;
    if (M.state === 'procura' && !s.flags.l6lembCanto && Math.random() < 0.004) {
      s.flags.l6lembCanto = true; lembrou = perf();
      subPequeno('lia', TX6.sabeCanto[Math.floor(Math.random() * TX6.sabeCanto.length)]);
    } else if (M.state === 'patrulha' && estado.mania && P.room === estado.mania && !s.flags.l6lembRota && Math.random() < 0.004) {
      s.flags.l6lembRota = true; lembrou = perf();
      subPequeno('lia', TX6.sabeRota);
    }
  });

  // =====================================================================
  // VARIAÇÕES DA MENINA QUE CONTA (ritmo, número inicial, teto e número da sorte por semente)
  // =====================================================================
  const aplicarAna = seguro(function () {
    // ritmo: 0.75 (rápida e nervosa) a 1.3 (lenta e manhosa)
    ANA.l6ritmo = 0.75 + srnd('ana-ritmo') * 0.55;
    // às vezes começa adiantada (de 0 a 3) para quebrar a decoreba do timing
    ANA.l6inicio = srnd('ana-inicio') > 0.6 ? Math.floor(srnd('ana-adiant') * 4) : 0;
    // número da sorte: quando a contagem bate nele, ela faz algo diferente (uma vez por noite)
    ANA.l6sorte = 1 + Math.floor(srnd('ana-sorte') * 8); // 1..8
    ANA.l6velMul = 0.85 + srnd('ana-vel') * 0.45;        // passo da Menina 0.85x..1.3x
    if (modoOn('anarapida')) ANA.l6ritmo = Math.min(ANA.l6ritmo, 0.6); // mutador: a Menina conta bem mais rápido
    estado.anaSorteFez = false;
  });
  // a janela de aviso da Procissão varia de leve por noite (nunca menos, só mais: sempre dá tempo de esconder)
  const procJanela = seguro(function () { return srnd('proc-janela') * 1.6; });
  const tickAnaSorte = seguro(function () {
    if (!ANA.ativa || estado.anaSorteFez) return;
    if (ANA.conta === ANA.l6sorte && ANA.conta >= 2) {
      estado.anaSorteFez = true;
      try { if (ANA.pose !== undefined) ANA.pose = Math.floor(srnd('ana-pose') * 6); } catch (e) {}
      subPequeno('ana', 'Esse é o meu número.');
    }
  });

  // =====================================================================
  // EVENTOS RAROS SORTEADOS (blefe, noite surda, caçada relâmpago, presença errante)
  // Só telegrafia/áudio; nunca teleporta nem quebra o fluxo do capítulo.
  // =====================================================================
  const ev = { blefeCd: 0, blefeFez: false, surdaFez: false, relampFez: false, erranteCd: 8, erranteFez: false };
  const temRelampago = () => srnd('relamp') > 0.78;     // ~1 noite em 5
  const temSurda = () => srnd('surda') > 0.8;           // ~1 em 5
  const temErrante = () => srnd('errante') > 0.86;      // ~1 em 8
  const podeBlefe = () => srnd('blefe') > 0.55;

  const tickEventos = seguro(function (dt) {
    const s = S(); if (!s || s.dead || s.flags.sino) return;
    ev.blefeCd = Math.max(0, ev.blefeCd - dt);
    ev.erranteCd = Math.max(0, ev.erranteCd - dt);
    // BLEFE: às vezes ele finge desistir — passos afastando e silêncio, sem porta
    if (podeBlefe() && !ev.blefeFez && ev.blefeCd <= 0 && M.ativo && M.state === 'procura' && M.pos.distanceTo(P.pos) > 6 && chap() >= 1) {
      ev.blefeFez = true; ev.blefeCd = 40;
      const dir = new THREE.Vector3(M.pos.x - P.pos.x, 0, M.pos.z - P.pos.z).normalize();
      try { SX.passosLonge(M.pos, dir); } catch (e) {}
      M.recuo = Math.max(M.recuo, 6); // ele realmente se afasta um pouco, depois volta
      subPequeno('lia', TX6.blefe);
    }
    // CAÇADA RELÂMPAGO: numa noite marcada, uma caçada acaba bem antes
    if (temRelampago() && !ev.relampFez && M.ativo && M.state === 'caca' && M.cacaT > 9 && M.pos.distanceTo(P.pos) > 7) {
      ev.relampFez = true; M.cool = 2.5; M.recuo = Math.max(M.recuo, 8);
      try { M.state = 'procura'; M.searchT = 1.2; } catch (e) {}
      subPequeno('lia', TX6.relampago);
    }
    // PRESENÇA ERRANTE: numa noite marcada, uma porta bate sozinha ao longe (sem dano)
    if (temErrante() && !ev.erranteFez && ev.erranteCd <= 0 && mode() === 'jogo' && !ui()) {
      ev.erranteFez = true; ev.erranteCd = 999;
      const salas = salasAlcancaveis(P.pos).filter(r => r !== P.room && !r.fora);
      if (salas.length) { const c = centroSala(salas[Math.floor(srnd('erri') * salas.length) % salas.length]); try { SX.portaLonge(c.x, c.z); } catch (e) {} }
      subPequeno('lia', TX6.errante);
    }
  });

  // NOITE SURDA: quando o Inspetor fica perto e você faz barulho, raramente ele "não ouve" por um instante
  // e então dá o bote de surpresa. Aplicado como um mergulho curto na audição (via l6ouvidoMul).
  const tickSurda = seguro(function () {
    if (!temSurda()) return;
    const s = S(); if (!s) return;
    const d = M.pos.distanceTo(P.pos);
    if (M.ativo && M.state === 'investiga' && d < 8 && !ev.surdaBaixa && Math.floor(perf()) % 7 === 0) {
      ev.surdaBaixa = perf() + 2.2;
      if (!ev.surdaFez) { ev.surdaFez = true; subPequeno('lia', TX6.surda); }
    }
    if (ev.surdaBaixa) { if (perf() > ev.surdaBaixa) ev.surdaBaixa = 0; else M.l6ouvidoMul *= 0.35; } // mergulho curto na audição, por cima da base
  });

  // =====================================================================
  // MODOS EXTRAS (Novo Jogo +, mutadores) — persistidos, desligados por padrão, nunca no QA
  // Códigos digitados na tela de título: VIGIA, CACADOR, FUROR, FARO, NORMAL.
  // =====================================================================
  let buf = '';
  const ligarModo = seguro(function (k, txt) { carregarDB(); DB.modos = DB.modos || {}; DB.modos[k] = true; salvarDB(true); toast(txt); });
  function capturarCodigo(code) {
    if (mode() !== 'titulo' || webdriver()) return;
    const L = { KeyA: 'a', KeyB: 'b', KeyC: 'c', KeyD: 'd', KeyE: 'e', KeyF: 'f', KeyG: 'g', KeyH: 'h', KeyI: 'i', KeyJ: 'j', KeyK: 'k', KeyL: 'l', KeyM: 'm', KeyN: 'n', KeyO: 'o', KeyP: 'p', KeyQ: 'q', KeyR: 'r', KeyS: 's', KeyT: 't', KeyU: 'u', KeyV: 'v', KeyW: 'w', KeyX: 'x', KeyY: 'y', KeyZ: 'z' }[code];
    if (!L) return;
    buf = (buf + L).slice(-8);
    if (buf.endsWith('vigia')) ligarModo('vigia', TX6.modoVigia);
    else if (buf.endsWith('cacador') || buf.endsWith('caçador')) ligarModo('cacador', TX6.modoCacador);
    else if (buf.endsWith('furor')) ligarModo('furor', TX6.modoFuror);
    else if (buf.endsWith('faro')) ligarModo('faro', TX6.modoFaro);
    else if (buf.endsWith('cedo')) ligarModo('cedo', TX6.modoCedo);
    else if (buf.endsWith('persegue')) ligarModo('persegue', TX6.modoPersegue);
    else if (buf.endsWith('sempausa')) ligarModo('sempausa', TX6.modoSemPausa);
    else if (buf.endsWith('dobro')) ligarModo('dobro', TX6.modoDobro);
    else if (buf.endsWith('apressa')) ligarModo('anarapida', TX6.modoAnaRapida);
    else if (buf.endsWith('pacto')) ligarModo('pacto', TX6.modoPacto);
    else if (buf.endsWith('normal')) { carregarDB(); DB.modos = {}; salvarDB(true); toast(TX6.modoLimpo); }
  }
  try { addEventListener('keydown', e => { try { capturarCodigo(e.code); } catch (err) {} }); } catch (e) {}
  const modoOn = k => { carregarDB(); return !webdriver() && !!(DB.modos && DB.modos[k]); };

  const tickModos = seguro(function (dt) {
    const s = S(); if (!s || s.dead || !M.ativo) return;
    // VIGIA ETERNO: a procura nunca expira (ele só te perde por distância/silêncio)
    if (modoOn('vigia') && M.state === 'procura') M.searchT = Math.max(M.searchT, 4);
    // CAÇADOR IMPLACÁVEL: anda devagar, mas reaproxima a sua direção geral de vez em quando
    if (modoOn('cacador')) {
      M.l6velMul = Math.min(M.l6velMul || 1, 0.78);
      ev.cacaCd = (ev.cacaCd || 0) - dt;
      if (ev.cacaCd <= 0 && M.state !== 'caca' && M.state !== 'bote' && M.state !== 'agarra') { ev.cacaCd = 6; try { M.ultimo = P.pos.clone(); } catch (e) {} }
    }
    // FARO: ouvido ampliado o tempo todo
    if (modoOn('faro')) M.l6ouvidoMul = Math.max(M.l6ouvidoMul || 1, 1.4);
    // NOITE ADIANTADA: o Inspetor já começa a campanha com o vigor de um capítulo mais à frente
    if (modoOn('cedo')) { M.l6velMul = Math.max(M.l6velMul || 1, 1.12); M.l6ouvidoMul = Math.max(M.l6ouvidoMul || 1, 1.12); }
    // PACTO: ele caça mais rápido, ouve melhor e revista mais — o perfil mais duro de todos
    if (modoOn('pacto')) { M.l6velMul = Math.max(M.l6velMul || 1, 1.15); M.l6ouvidoMul = Math.max(M.l6ouvidoMul || 1, 1.3); M.l6procMul = Math.max(M.l6procMul || 1, 1.4); }
  });
  // FUROR: cada capítulo começa com o Inspetor já procurando (aplicado quando ele é ativado)
  const aoAtivar = seguro(function () {
    primeiraAparicao(); // a estreia do Inspetor na sessão é mais longa e assustadora
    if (modoOn('furor') && M.state === 'patrulha') { M.state = 'procura'; M.searchT = 6; }
    // ponto inicial de patrulha sorteado por noite: o primeiro encontro não é decorável
    else if (M.state === 'patrulha') {
      try {
        const salas = salasAlcancaveis(M.pos, { semFora: !W.def.inspetorFora }).filter(r => !r.seguro && r !== P.room);
        if (salas.length) { const r = salas[Math.floor(srnd('patrulha-ini') * salas.length) % salas.length]; const [x, z] = pontoEm(r); planejar(M, x, z); }
      } catch (e) {}
    }
  });

  // voz do Chamado sorteada pela semente da noite (davi / mae / lia)
  const chamadoVoz = seguro(function () {
    const v = srnd('chamado-voz');
    return v < 0.45 ? 'davi' : v < 0.72 ? 'lia' : 'mae';
  });

  // =====================================================================
  // VIGÍLIA (Novo Jogo +): ele te conhece melhor a cada final verdadeiro
  // =====================================================================
  const aplicarVigilia = seguro(function () {
    carregarDB();
    if (!(DB.venceu > 0)) return;
    const n = DB.venceu;
    // a escalada de audição da Vigília entra na base da noite (calcOuvidoNoite), sem acumular por quadro
    const s = S();
    if (s && !s.flags.l6vigAviso && M.ativo && chap() === 0) {
      s.flags.l6vigAviso = true;
      conquista('l6_vigilia');
      toast(TX6.vigilia.replace('{n}', ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][Math.min(7, n - 1)]));
      if (n === 1) subPequeno('lia', TX6.vigiliaPrim);
    }
  });

  // na Vigília ele te conhece: diz o nome digitado no primeiro bote da noite e investiga mais rápido
  let nomeDito = false;
  const nomeJogador = () => { try { const n = JSON.parse(localStorage.getItem('hora-silencio-nome') || '""'); return typeof n === 'string' ? n.trim().slice(0, 16) : ''; } catch (e) { return ''; } };
  const tickVigilia = seguro(function (dt) {
    carregarDB(); if (!(DB.venceu > 0) || !M.ativo) return;
    // investiga mais rápido (perde menos tempo no alerta)
    if (M.state === 'alerta' && M.alertaT > 0) M.alertaT = Math.max(0, M.alertaT - dt * 0.5);
    // sussurra o seu nome quando chega perto
    const nome = nomeJogador();
    if (nome && !nomeDito && M.state === 'caca' && M.pos.distanceTo(P.pos) < 4) { nomeDito = true; subPequeno('inspetor', nome + '...'); }
  });

  // marcado pelo motor quando a jogadora chega ao final verdadeiro
  const registrarVitoria = seguro(function () { carregarDB(); DB.venceu = (DB.venceu || 0) + 1; salvarDB(true); });

  // =====================================================================
  // LENDAS DA NOITE (raras, sorteadas pela semente, telegrafadas) — picos de dificuldade memoráveis
  // manso: noite estranhamente calma; implacavel: quase nunca recua; lua: dois humores somados (com teto)
  // =====================================================================
  const aplicarLenda = seguro(function () {
    estado.lenda = null; estado.humor2 = null; estado.lendaDita = false;
    const r = srnd('lenda');
    if (r > 0.96) { estado.lenda = 'manso'; M.l6velMul = (M.l6velMul || 1) * 0.82; M.l6procMul = (M.l6procMul || 1) * 0.6; M.l6cacaMul = (M.l6cacaMul || 1) * 0.7; M.l6embMul = (M.l6embMul || 1) * 1.6; }
    else if (r > 0.92) { estado.lenda = 'implacavel'; M.l6velMul = Math.min(1.35, (M.l6velMul || 1) * 1.14); M.l6embMul = (M.l6embMul || 1) * 0.3; M.l6cacaMul = (M.l6cacaMul || 1) * 1.3; }
    else if (r > 0.85) { estado.lenda = 'lua'; estado.humor2 = spick('humor2', HUMORES); M.l6velMul = Math.min(1.35, (M.l6velMul || 1) * (0.6 + estado.humor2.vel * 0.4)); }
    // mutador DOBRO: força a lua (dois humores) toda noite
    if (modoOn('dobro') && !estado.lenda) { estado.lenda = 'lua'; estado.humor2 = spick('humor2b', HUMORES); M.l6velMul = Math.min(1.35, (M.l6velMul || 1) * (0.6 + estado.humor2.vel * 0.4)); }
  });
  const telegrafarLenda = seguro(function () {
    if (!estado.lenda || estado.lendaDita || !M.ativo) return;
    estado.lendaDita = true;
    subPequeno('lia', TX6.lenda[estado.lenda]);
    carregarDB(); DB.lendas = DB.lendas || {}; DB.lendas[estado.lenda] = true;
    if (estado.lenda === 'lua') conquista('l6_lua');
    conquista('l6_lenda'); salvarDB();
  });

  // audição-base da noite: humor + lua + Vigília (NG+) + notoriedade. Recalculada a cada noite, aplicada por quadro.
  const calcOuvidoNoite = seguro(function () {
    carregarDB();
    let f = 1;
    if (estado.lenda === 'lua' && estado.humor2) f *= Math.min(1.45, 0.5 + estado.humor2.ouv * 0.5);
    const n = DB.venceu || 0; if (n > 0) f *= 1 + Math.min(0.25, n * 0.06);
    const not = clamp(DB.notoriedade || 0, 0, 100); f *= 1 + not / 100 * 0.18;
    estado.ouvidoNoite = f;
  });

  // =====================================================================
  // MAESTRO (anti-enrolação): ficar parada tempo demais no mesmo cômodo deixa o Inspetor mais atento
  // =====================================================================
  let campT = 0, campSala = null, campAviso = false;
  const tickMaestro = seguro(function (dt) {
    const s = S(); if (!s || s.dead || !M.ativo) { campT = 0; return; }
    if (P.room === campSala && !['caca', 'bote', 'agarra'].includes(M.state)) campT += dt; else { campSala = P.room; campT = 0; }
    if (campT > 20) {
      M.l6ouvidoMul = (M.l6ouvidoMul || 1) * clamp(1 + (campT - 20) / 120, 1, 1.25);
      if (campT > 35 && !campAviso) { campAviso = true; subPequeno('lia', TX6.maestro); }
    }
  });

  // =====================================================================
  // NOTORIEDADE ENTRE NOITES: barulho e mortes deixam fama; a noite seguinte começa com ele mais atento
  // (entra em calcOuvidoNoite; decai um pouco a cada nova campanha)
  // =====================================================================
  const subirNotoriedade = seguro(function (v) { carregarDB(); DB.notoriedade = clamp((DB.notoriedade || 0) + v, 0, 100); salvarDB(); });

  // =====================================================================
  // ELE CONTA SUAS MORTES (só na Vigília / NG+): ao te pegar, murmura um número crescente
  // =====================================================================
  const contarMorte = seguro(function (quem) {
    if (quem !== 'inspetor') return;
    carregarDB(); if (!(DB.venceu > 0)) return;
    const s = S(); if (!s) return;
    s.flags = s.flags || {}; s.flags.l6contaMorte = (s.flags.l6contaMorte || 0) + 1;
    const nums = ['uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez'];
    const n = Math.min(10, s.flags.l6contaMorte);
    setTimeout(() => { try { subPequeno('inspetor', TX6.contaMortes.replace('{n}', nums[n - 1] || n)); } catch (e) {} }, 500);
  });

  // =====================================================================
  // PRIMEIRA APARIÇÃO DA CAMPANHA (por sessão): a estreia do Inspetor é mais longa e assustadora
  // =====================================================================
  const primeiraAparicao = seguro(function () {
    if (estado.primAparFez) return;
    estado.primAparFez = true;
    try { M.wait = Math.max(M.wait || 0, 1.6); } catch (e) {}
    setTimeout(() => { try { if (!webdriver()) subPequeno('lia', TX6.primeira); } catch (e) {} }, 1200);
  });

  // mutadores que mexem na máquina de estados do Inspetor a cada quadro
  const tickModos2 = seguro(function (dt) {
    const s = S(); if (!s || s.dead || !M.ativo) return;
    if (['investiga', 'procura', 'caca'].includes(M.state)) estado.ouviuAlguma = true;
    // PERSEGUIÇÃO ETERNA: depois do primeiro contato do capítulo, ele nunca volta à patrulha calma
    if (modoOn('persegue') && estado.ouviuAlguma && M.state === 'patrulha') { M.state = 'procura'; M.searchT = Math.max(M.searchT || 0, 4); }
    // SEM PAUSAS: ele nunca reza nem para para lembrar — some a janela segura
    if (modoOn('sempausa') && M.state === 'reza') { M.state = 'procura'; M.searchT = Math.max(M.searchT || 0, 3); }
  });

  // =====================================================================
  // CONQUISTA: "Nunca No Mesmo Canto" e "Rota Nova" (verificadas no fim do capítulo)
  // =====================================================================
  const fimCapitulo = seguro(function () {
    const s = S(); if (!s) return;
    const tipos = s.flags.l6tipos || {};
    const usados = Object.keys(tipos).filter(t => tipos[t] > 0);
    // variou: usou esconderijo, mas nunca repetiu o mesmo tipo (no máximo um de cada)
    if (usados.length >= 1 && usados.every(t => tipos[t] === 1) && usados.length === Object.values(tipos).reduce((a, b) => a + b, 0)) conquista('l6_variou');
    // rota nova: zerou o capítulo sem usar o esconderijo que ele vigia (nenhum tipo "favorito" repetido)
    if (!s.flags.l6usouFav) conquista('l6_sem_fav');
  });

  // =====================================================================
  // NOVO MAPA / NOVA NOITE
  // =====================================================================
  const novoMapa = seguro(function () {
    carregarDB();
    // conta a noite uma vez por sessão/campanha (no prólogo)
    const s = S();
    if (s && chap() === 0 && !estado.contouNoite) {
      estado.contouNoite = true; DB.noites = (DB.noites || 0) + 1;
      DB.notoriedade = Math.max(0, (DB.notoriedade || 0) - 6); // a fama esfria um pouco a cada nova campanha
      salvarDB(true);
    }
    estado.capAplicado = -99;
    estado.ouviuAlguma = false; campT = 0; campSala = null; campAviso = false;
    ev.blefeFez = false; ev.relampFez = false; ev.surdaFez = false; ev.erranteFez = false; ev.erranteCd = 10; ev.surdaBaixa = 0;
    colaT = 0; colaMax = 0; nomeDito = false;
    aplicarHumor(); aplicarAna(); aplicarMania();
    aplicarLenda(); calcOuvidoNoite();
    semearAprendizado(); montarViesPatrulha(); montarEco();
    aplicarVigilia();
  });

  // guarda as rotas desta noite para o Inspetor "estudar" nas próximas (idem favoritos)
  const mergeRotas = seguro(function () {
    const s = S(); if (!s || !s.flags || !s.flags.rotas || webdriver()) return;
    carregarDB(); let mudou = false;
    for (const k in s.flags.rotas) { const v = s.flags.rotas[k]; if (v > (DB.rotas[k] || 0)) { DB.rotas[k] = v; mudou = true; } }
    if (mudou) salvarDB();
  });

  // a Procissão entra por um lado sorteado pela semente (reproduzível por noite)
  const procEntrada = seguro(function (cands) {
    if (!cands || !cands.length) return null;
    return cands[Math.floor(srnd('proc-ini') * cands.length) % cands.length];
  });

  // =====================================================================
  // TICK (um por quadro, no bloco do ritmo)
  // =====================================================================
  const tick = seguro(function (dt) {
    const s = S(); if (!s) return;
    aplicarHumor();          // garante os multiplicadores do humor da noite
    // audição-base da noite reposta a cada quadro; os modificadores abaixo aplicam por cima sem acumular
    M.l6ouvidoMul = (estado.humor ? estado.humor.ouv : 1) * (estado.ouvidoNoite || 1);
    telegrafarHumor();
    telegrafarLenda();
    tickHumorBrain(dt);
    tickLembrancas();
    tickAnaSorte();
    tickCola(dt);
    tickEco(dt);
    tickEventos(dt);
    tickSurda(dt);
    tickMaestro(dt);
    tickModos(dt);
    tickModos2(dt);
    tickVigilia(dt);
    aplicarVigilia();
    // noite implacável: ele realmente dá menos trégua — o recuo encolhe aos poucos
    if (estado.lenda === 'implacavel' && M.ativo && M.recuo > 3) M.recuo = Math.max(3, M.recuo - dt * 0.8);
    estado.rotaT = (estado.rotaT || 0) - dt; if (estado.rotaT <= 0) { estado.rotaT = 6; mergeRotas(); }
    if (saveCd > 0) { saveCd -= dt; if (saveCd <= 0) salvarDB(true); }
  });

  return { tick, aoEsconder, aoSair, morte, novoMapa, aoAtivar, fimCapitulo, garrafaCansaco, registrarVitoria, procEntrada, chamadoVoz, procJanela,
    humor: () => (estado.humor || {}).id, modos: () => (carregarDB(), DB.modos) };
}
