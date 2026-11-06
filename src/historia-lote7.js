// =====================================================================
// HISTÓRIA — LOTE 7 ("Som e atmosfera": a casa conta a história pelo ouvido)
// A história e o texto entregues por SOM: a reza da Celeste que troca de
// lado por capítulo, o cochicho das regras que para no olhar, a chamada
// ensaiando o seu nome, o rádio que fala com o seu medo, memórias
// sussurradas por sala, o último som de cada vítima, a casa que suspira o
// seu nome, a noite do incêndio só pelo clima, a estrofe perdida da capela,
// a pergunta no escuro, o assobio quebrado do Joaquim, fitas que se apagam,
// acorde-assinatura de cada final, motivo de cada capítulo, o pensamento da
// Lia no limite e uma música procedural de tensão que respira com a caça.
// Som 100% procedural. Texto em window.ROTEIRO.lote7. Ligado por poucas
// linhas em jogo.js (procure L7).
// =====================================================================

const LEG = {
  l7h_regras: { t: 'uma criança lê as regras da casa num canto', imp: 0, cd: 10, cat: 'h' },
  l7_regraInteira: { t: 'a última regra foi lida inteira', imp: 1, cd: 20, cat: 'h' },
  l7h_reza: { t: 'atrás da porta, a Irmã Celeste reza', imp: 0, cd: 24, cat: 'h' },
  l7_rezaVira: { t: 'a reza mudou de lado: agora ela te entrega', imp: 1, cd: 30, cat: 'p' },
  l7_horaReal: { t: 'nove badaladas distantes — e não são do jogo', imp: 1, cd: 600, cat: 'h' },
  l7h_chamada: { t: 'longe, uma menina ensaia a chamada', imp: 0, cd: 40, cat: 'h' },
  l7_chamadaNome: { t: 'a chamada tropeça no seu nome e acerta', imp: 1, cd: 60, cat: 'p' },
  l7_radio: { t: 'o rádio interrompe e fala com o seu medo', imp: 1, cd: 50, cat: 'p' },
  l7_memoria: { t: 'a sala solta uma memória sussurrada', imp: 1, cd: 18, cat: 'h' },
  l7_ultimoSom: { t: 'o último som de quem morreu aqui', imp: 1, cd: 20, cat: 'h', pos: a => a[0] },
  l7_suspiro: { t: 'a casa suspira o seu nome', imp: 1, cd: 90, cat: 'p' },
  l7_pergunta: { t: 'uma vozinha pergunta no escuro', imp: 0, cd: 24, cat: 'h' },
  l7_incendio: { t: '1979 voltou por três segundos e foi embora', imp: 1, cd: 70, cat: 'h' },
  l7_estrofe: { t: 'a capela canta sozinha a estrofe perdida', imp: 1, cd: 40, cat: 'h' },
  l7h_assobio: { t: 'o assobio do velho volta fora de ordem', imp: 0, cd: 30, cat: 'h' },
  l7_fitaGasta: { t: 'a fita range: a verdade some sob o chiado', imp: 1, cd: 8, cat: 'h' },
  l7_pensa: { t: 'um pensamento seu, sem voz', imp: 0, cd: 14, cat: 'eu' },
  l7_motivo: { t: 'três notas distantes abrem o capítulo', imp: 0, cd: 60, cat: 'h' },
  l7_acorde: { t: 'um acorde fecha a noite', imp: 1, cd: 4, cat: 'h' },
  l7_tensao: { t: 'a música da casa aperta: ele está caçando', imp: 0, cd: 20, cat: 'p' },
  l7h_alivio: { t: 'a tensão se desfaz: ele perdeu o rastro', imp: 0, cd: 20, cat: 'h' },
  l7_silencio: { t: '[silêncio pesado. é assim que ele gosta.]', imp: 1, cd: 30, cat: 'p' }
};

export function instalarHistoriaLote7(c) {
  const R = (window.ROTEIRO && window.ROTEIRO.lote7) || {};
  if (c.legendas) try { Object.assign(c.legendas, LEG); } catch (e) {}
  // conquistas novas, à prova de duplicata
  try { const lista = window.ROTEIRO && window.ROTEIRO.conquistas; if (lista && R.conquistas) for (const q of R.conquistas) if (!lista.some(x => x.id === q.id)) lista.push(q); } catch (e) {}

  const leg = (k, ...a) => { try { c.som(k, a); } catch (e) {} };
  const sub = (quem, txt) => { try { c.subPequeno(quem, txt); } catch (e) {} };
  const nome = () => { try { const n = c.lsGet('hora-silencio-nome', ''); const s = (typeof n === 'string' ? n : '').trim().slice(0, 16); return s || 'Lia'; } catch (e) { return 'Lia'; } };
  const parcial = () => { const n = nome(); return n.length > 2 ? n.slice(0, Math.max(2, n.length - 2)) : n; };
  const subst = s => (s || '').replace(/\{nome\}/g, nome()).replace(/\{parcial\}/g, parcial());
  const rnd = (a, b) => (c.rand ? c.rand(a, b) : a + Math.random() * (b - a));
  const escolher = arr => (Array.isArray(arr) && arr.length ? (c.pick ? c.pick(arr) : arr[(Math.random() * arr.length) | 0]) : null);

  // --- cronômetros independentes por efeito (segundos de jogo) ---
  const cd = {};
  const pronto = (k, s) => { const n = c.perf; if ((cd[k] || -1e9) > n - s) return false; cd[k] = n; return true; };

  // estado por noite/sala
  let mapaAnt = null, capAnt = -1, rezaCap = -1;
  let salaMemoria = new Set();         // memórias já soltas nesta sala/noite
  let regraIdx = 0, regraLendo = false, regraPausa = 0, regraOlhando = false;
  let intenAnt = 0, tensT = 0;
  let suspiroOk = false, estrofeOk = false;

  function reset() { salaMemoria = new Set(); regraIdx = 0; regraLendo = false; regraPausa = 0; }

  // ----- áudio: a fonte da caixinha/notas -----
  const bip = (t, f, dur, pk, bus, wet, tipo) => { try { const g = c.saida(null, wet == null ? .5 : wet, bus || 'amb'); c.osc(tipo || 'sine', f, t, dur, g); c.env(g, t, .02, pk == null ? .05 : pk, dur); } catch (e) {} };

  // (15) motivo de três notas ao abrir o capítulo (ou a melodia da Ana desafinada no cap. da Ana)
  function motivo(cap) {
    const t = c.AC.currentTime + .2;
    if (cap === 3) { // melodia da Ana, uma nota fora
      const ns = [523, 587, 466]; ns.forEach((f, i) => bip(t + i * .42, f, .5, .04, 'amb', .7, 'sine'));
      sub('ana', subst(R.motivoAna));
    } else {
      const base = [392, 494, 330, 440, 294, 349][cap] || 392;
      [base, base * 1.18, base * .84].forEach((f, i) => bip(t + i * .4, f, .55, .035, 'amb', .8, 'sine'));
      sub('voz', subst(R.motivoCapitulo));
    }
    leg('l7_motivo');
  }

  // (14) acorde-assinatura de cada final
  function final(tipo) {
    try {
      const t = c.AC.currentTime + .1;
      if (tipo === 'verdadeiro') { for (const f of [262, 330, 392, 523]) bip(t, f, 3.2, .06, 'amb', 1, 'triangle'); }
      else if (tipo === 'silencio') { bip(t, 294, 4.5, .07, 'amb', 1.2, 'sine'); } // uma nota que não resolve
      else { for (const f of [220, 261, 311]) bip(t, f, 3, .06, 'amb', 1, 'sawtooth'); } // menor e oco
      sub('voz', subst(R.acordeFinal && R.acordeFinal[tipo]));
      leg('l7_acorde');
    } catch (e) {}
  }

  // (3) badaladas que seguem o relógio REAL — raríssimo, uma vez por sessão, nunca em caça
  let horaRealFeita = false, minutoChecado = -1;
  function checarHoraReal() {
    try {
      if (horaRealFeita || c.OPT && c.OPT.sustoSuave) return;
      const d = new Date(); if (d.getMinutes() !== 0) { minutoChecado = -1; return; }
      if (minutoChecado === d.getHours()) return; minutoChecado = d.getHours();
      if (Math.random() > .5) return; // raro mesmo na virada
      horaRealFeita = true;
      const base = c.AC.currentTime + rnd(1, 3);
      for (let i = 0; i < 9; i++) { const t = base + i * 1.1; try { c.SOM.sino && c.SOM.sino(.06, { x: c.P.pos.x, y: 8, z: c.P.pos.z - 40 }, .9); } catch (e) {} }
      sub('voz', subst(R.horaReal)); leg('l7_horaReal');
    } catch (e) {}
  }

  // ----- helpers de contexto -----
  const jogavel = () => c.mode === 'jogo' && !c.ui && c.S && !c.S.dead && !c.S.fim;
  const dentro = () => c.P && c.P.room && !c.P.room.fora;
  const parado = () => c.P && (c.P.crouch || c.P.sentada || (c.P.vel && c.P.vel < .1));
  const inspInten = () => { const M = c.M; if (!M || !M.ativo) return 0; return M.state === 'caca' ? 3 : M.state === 'procura' ? 2 : M.state === 'investiga' ? 1 : 0; };
  const quieto = () => { // sem perigo iminente: nada caçando, Procissão parada, Ana inativa
    const M = c.M; return (!M || !M.ativo || M.state === 'patrulha') && !(c.PROC && c.PROC.fase) && !(c.ANA && c.ANA.ativa); };

  // =========================== TICK ===========================
  function tick(dt) {
    if (!c.AC || !jogavel()) return;
    const S = c.S, P = c.P, M = c.M, mapa = c.W && c.W.mapa, cap = S.chapter | 0;

    // troca de mapa/capítulo
    if (mapa !== mapaAnt) { mapaAnt = mapa; reset(); }
    if (cap !== capAnt) { capAnt = cap; rezaCap = -1; try { motivo(cap); } catch (e) {} }

    const inten = inspInten();

    // ---------- (16) pensamento sussurrado da Lia no limite ----------
    try {
      const pens = R.pensamentoLia || {};
      if (P.prende && S.ar <= 22 && pronto('pensaFolego', 20)) { fala('lia', pens.folego); }
      else if (inten === 3 && M.pos && M.pos.distanceTo && M.pos.distanceTo(P.pos) < 5 && pronto('pensaInsp', 16)) { fala('lia', pens.inspetorPerto); }
      else if (S.health <= 35 && inten >= 2 && pronto('pensaMorte', 22)) { fala('lia', pens.beiraMorte); }
      else if (S.hidden && inten >= 2 && pronto('pensaEsc', 24)) { fala('lia', pens.escondida); }
    } catch (e) {}

    // ---------- música procedural de tensão ----------
    try {
      if (inten >= 2 && intenAnt < 2) { leg('l7_tensao'); tensT = 0; }
      if (inten === 0 && intenAnt >= 2) { // alívio: ele perdeu o rastro
        const t = c.AC.currentTime + .05; for (const f of [147, 196, 262]) bip(t, f, 2.2, .045, 'amb', 1, 'sine'); leg('l7h_alivio');
      }
      if (inten >= 2) {
        tensT -= dt;
        if (tensT <= 0) {
          tensT = inten === 3 ? 2.2 : 3.4;
          const t = c.AC.currentTime + .02, f = inten === 3 ? 58 : 46;
          bip(t, f, inten === 3 ? 1.3 : 2, inten === 3 ? .05 : .035, 'amb', .5, 'sawtooth'); // pulso grave que aperta com a caça
          if (inten === 3) bip(t + .06, f * 1.5, .9, .02, 'amb', .5, 'triangle');
        }
      }
      intenAnt = inten;
    } catch (e) {}

    // ---------- silêncio como arma: caça + fôlego preso = peso ----------
    try {
      if (inten === 3 && P.prende && dentro() && pronto('silencio', 30)) {
        const t = c.AC.currentTime + .02; bip(t, 33, 3, .05, 'amb', .2, 'sine'); leg('l7_silencio');
      }
    } catch (e) {}

    if (!dentro()) { checarHoraReal(); return; }

    // tudo que segue pede silêncio (sem caça) e, em geral, estar parada
    checarHoraReal();

    // ---------- (2) o cochicho das regras que para no olhar ----------
    try {
      if (quieto() && parado() && cap >= 1) {
        const regras = R.regrasDaCasa || [];
        if (!regraLendo && pronto('regraIni', 14) && Math.random() < dt * .25) {
          regraLendo = true; regraPausa = 0; regraOlhando = false; leg('l7h_regras');
        }
        if (regraLendo) {
          // "olhar para a fonte" = estar virada para uma parede próxima e com a mira baixa; aqui: desvio de olhar aleatório da casa
          regraPausa -= dt;
          if (regraPausa <= 0) {
            // a cada trecho, há chance de o jogador "cruzar o olhar" e a fala parar
            if (Math.random() < .28) { regraLendo = false; sub('crianca', subst(R.regrasInterrompida)); }
            else {
              const txt = regras[regraIdx % regras.length];
              vozCrianca(subst(txt));
              regraIdx++; regraPausa = 2.4 + txt.length * .05;
              if (regraIdx >= regras.length) { regraLendo = false; leg('l7_regraInteira'); try { c.conquista('l7_regra_inteira'); } catch (e) {} }
            }
          }
        }
      } else if (regraLendo && inten >= 1) { regraLendo = false; } // a caça interrompe
    } catch (e) {}

    // ---------- (1) a reza da Celeste muda de lado por capítulo ----------
    try {
      if (quieto() && rezaCap !== cap && (mapa === 'terreo' || mapa === 'superior') && pronto('reza', 24) && Math.random() < dt * .2) {
        rezaCap = cap;
        const txt = (R.rezaPorCapitulo || {})[cap];
        if (txt) { sub('celeste', subst(txt)); leg(cap >= 3 ? 'l7_rezaVira' : 'l7h_reza'); if (cap >= 3) try { c.conquista('l7_entrega'); } catch (e) {} }
      }
    } catch (e) {}

    // ---------- (4) a chamada ensaia o seu nome ----------
    try {
      if (quieto() && cap >= 2 && pronto('chamada', 55) && Math.random() < dt * .06) {
        const linhas = R.chamadaEnsaia || [];
        if (linhas.length >= 3) {
          sub('crianca', subst(linhas[0])); leg('l7h_chamada');
          setTimeout(() => { if (jogavel()) { sub('crianca', subst(linhas[1])); vozCrianca(nome(), 420); } }, 2600);
          setTimeout(() => { if (jogavel()) { sub('crianca', subst(linhas[2])); leg('l7_chamadaNome'); } }, 5400);
        }
      }
    } catch (e) {}

    // ---------- (5) o rádio fala com o seu medo ----------
    try {
      if (S.fear >= 75 && pronto('radio', 48) && Math.random() < dt * .3) {
        sub('radio', subst(escolher(R.radioConforto))); leg('l7_radio');
        setTimeout(() => { if (jogavel()) sub('radio', subst(R.radioVolta)); }, 3800);
      }
    } catch (e) {}

    // ---------- (6) memória sussurrada por sala ----------
    try {
      if (quieto() && parado() && pronto('memoria', 16) && Math.random() < dt * .22) {
        const salaId = (P.room && P.room.id) || mapa;
        if (!salaMemoria.has(salaId)) {
          const arr = (R.memoriaSala || {})[mapa];
          const txt = escolher(arr);
          if (txt) { salaMemoria.add(salaId); sub('voz', subst(txt)); leg('l7_memoria'); }
        }
      }
    } catch (e) {}

    // ---------- (7) o último som de cada vítima, na sala onde morreu ----------
    try {
      if (pronto('ultimoSom', 22) && Math.random() < dt * .14) {
        const mapaVit = { terreo: 'tome', superior: 'ana', tuneis: 'davi', cemiterio: 'luiz' }[mapa];
        const txt = mapaVit && (R.ultimoSom || {})[mapaVit];
        if (txt) {
          const p = { x: P.pos.x + rnd(-6, 6), y: 1, z: P.pos.z + rnd(-6, 6) };
          somVitima(mapaVit, p); sub('voz', subst(txt)); leg('l7_ultimoSom', p);
        }
      }
    } catch (e) {}

    // ---------- (8) a casa suspira o seu nome ----------
    try {
      if (quieto() && parado() && S.fear < 60 && pronto('suspiro', 95) && Math.random() < dt * .04) {
        suspirarNome(); sub('voz', subst(R.suspiroNome)); leg('l7_suspiro'); if (!suspiroOk) { suspiroOk = true; try { c.conquista('l7_nome_casa'); } catch (e) {} }
      }
    } catch (e) {}

    // ---------- (11) a pergunta no escuro ----------
    try {
      if (quieto() && parado() && !S.flashOn && pronto('pergunta', 26) && Math.random() < dt * .15) {
        const q = escolher(R.perguntasEscuro);
        if (q) { vozCrianca(subst(q).replace(/^\([^)]*\)\s*/, ''), 500); sub('crianca', subst(q)); leg('l7_pergunta'); }
      }
    } catch (e) {}

    // ---------- (9) a noite do incêndio volta por 3s ----------
    try {
      if (quieto() && !S.flashOn && pronto('incendio', 75) && Math.random() < dt * .05) { incendio1979(); sub('voz', subst(R.incendio)); leg('l7_incendio'); }
    } catch (e) {}

    // ---------- (12) o assobio do Joaquim volta errado ----------
    try {
      if ((mapa === 'terreo' || mapa === 'superior') && pronto('assobio', 35) && Math.random() < dt * .08) { assobioErrado(); sub('voz', subst(R.assobioJoaquim)); leg('l7h_assobio'); }
    } catch (e) {}

    // ---------- (10) a capela canta a estrofe perdida ----------
    try {
      if (mapa === 'cemiterio' && quieto() && parado() && pronto('estrofe', 45) && Math.random() < dt * .09) {
        estrofe(); sub('voz', subst(R.estrofePerdida)); leg('l7_estrofe'); if (!estrofeOk) { estrofeOk = true; try { c.conquista('l7_estrofe'); } catch (e) {} }
      }
    } catch (e) {}
  }

  // ---------- falas auxiliares ----------
  function fala(quem, txt) { if (txt) { sub(quem, subst(txt)); leg('l7_pensa'); vozCorpo(); } }
  function vozCorpo() { try { const t = c.AC.currentTime; c.silaba && c.silaba(t, null, rnd(250, 290), 'e', .14, .02, 'corpo', 0); } catch (e) {} }
  function vozCrianca(txt, f0) { // sílabas filtradas de criança, bem baixinho
    try {
      const sil = (txt || '').toLowerCase().replace(/[^a-záéíóúâêôãõ ]/g, '').match(/[aeiouáéíóúâêôãõ]/g) || ['a'];
      const t0 = c.AC.currentTime + .05; const base = f0 || 480;
      sil.slice(0, 10).forEach((v, i) => { const vog = 'aeiou'.includes(v) ? v : 'e'; c.silaba && c.silaba(t0 + i * .16, { x: c.P.pos.x + rnd(-4, 4), y: 1, z: c.P.pos.z + rnd(-4, 4) }, base * (1 - i * .01), vog, .13, .03, 'voz', .6); });
    } catch (e) {}
  }
  // (8) formantes graves "suspirando" o nome, como a parede falando
  function suspirarNome() {
    try {
      const sil = nome().toLowerCase().match(/[aeiouáéíóúâêôãõ]/g) || ['a'];
      const t0 = c.AC.currentTime + .1;
      sil.slice(0, 6).forEach((v, i) => { const vog = 'aeiou'.includes(v) ? v : 'a'; c.silaba && c.silaba(t0 + i * .3, null, rnd(95, 120), vog, .4, .05, 'amb', .9); });
    } catch (e) {}
  }
  // (7) assinatura sonora de cada vítima
  function somVitima(id, p) {
    try {
      const t = c.AC.currentTime + .05;
      if (id === 'tome') { for (let i = 0; i < 5; i++) bip(t + i * .14, rnd(1200, 1500), .06, .02, 'amb', .3, 'square'); } // rodinhas
      else if (id === 'davi') { const g = c.saida(p, .4, 'amb'); c.burst && c.burst(t, 1.6, 'bandpass', 1800, 4, g); c.env(g, t, .05, .03, 1.4); } // chiado de rádio
      else if (id === 'ana') { bip(t, 659, 1.4, .04, 'amb', .7, 'sine'); } // nota da caixinha sem fechar
      else if (id === 'luiz') { const g = c.saida(p, .3, 'amb'); const o = c.AC.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(300, t); o.frequency.linearRampToValueAtTime(260, t + 2); o.connect(g); c.env(g, t, .1, .03, 1.9); o.start(t); o.stop(t + 2.1); } // pião girando
    } catch (e) {}
  }
  // (9) paisagem sonora do incêndio: chuva engrossa, sino dobra, vozes e madeira
  function incendio1979() {
    try {
      const t = c.AC.currentTime;
      try { c.SOM.sino && c.SOM.sino(.2, null, 1); } catch (e) {}
      setTimeout(() => { try { c.SOM.sino && c.SOM.sino(.18, null, 1.01); } catch (e) {} }, 1400);
      for (let i = 0; i < 5; i++) { const g = c.saida({ x: c.P.pos.x + rnd(-8, 8), y: 1, z: c.P.pos.z + rnd(-8, 8) }, .5, 'amb'); c.osc && c.osc('sawtooth', rnd(380, 620), t + i * .2, .5, g); c.env(g, t + i * .2, .05, .02, .5); } // vozes
      const cg = c.saida(null, .3, 'amb'); c.burst && c.burst(t, 3, 'bandpass', 900, 1.5, cg); c.env(cg, t, .2, .04, 2.8); // madeira/fogo estalando
    } catch (e) {}
  }
  // (10) estrofe perdida: a nave ressoa o hino nota por nota
  function estrofe() {
    try { const t = c.AC.currentTime + .1; [392, 440, 494, 392, 330, 294].forEach((f, i) => bip(t + i * .55, f, .7, .04, 'amb', 1.3, 'sine')); } catch (e) {}
  }
  // (12) assobio do Joaquim fora de ordem, para no meio
  function assobioErrado() {
    try {
      const notas = [784, 659, 880, 587]; const t0 = c.AC.currentTime + .1;
      const p = { x: c.P.pos.x + rnd(-10, 10), y: 1.6, z: c.P.pos.z + rnd(-10, 10) };
      notas.forEach((f, i) => { const g = c.saida(p, .5, 'amb'); c.osc && c.osc('sine', f, t0 + i * .3, .26, g); c.env(g, t0 + i * .3, .03, .03, .22); });
    } catch (e) {}
  }

  // (13) fitas se apagam depois de vencer: chiado que cresce por reprodução (chamado pelo motor)
  function chiadoFita(nRepr) {
    try {
      const t = c.AC.currentTime, amt = Math.min(.12, .02 + nRepr * .015);
      const g = c.saida(null, .2, 'ent'); c.burst && c.burst(t, 2.2, 'highpass', 1200, .7, g); c.env(g, t, .3, amt, 1.8);
      leg(nRepr >= 4 ? 'l7_fitaGasta' : 'l7_fitaGasta');
      if (nRepr >= 4) sub('voz', subst(R.fitaQuaseMuda)); else sub('voz', subst(R.fitaGasta));
    } catch (e) {}
  }

  return { tick, final, chiadoFita, motivo };
}
