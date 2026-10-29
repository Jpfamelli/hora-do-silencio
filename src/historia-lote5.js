// LOTE 5 — MONSTROS (história e texto): como o Inspetor e as outras entidades aparecem,
// lembram das suas mortes e perseguem. Instalado por src/historia.js com uma linha.
// Não muda o fluxo dos capítulos nem rótulos de interação; só acrescenta texto no momento certo.
// Todo o conteúdo mora em window.ROTEIRO.lote5 (roteiro.js).

export function instalarHistoriaL5(c, helpers) {
  const h = helpers || {};
  const R = c.R || {};
  const L = R.lote5 || {};
  const $ = s => document.querySelector(s);
  const S = () => c.S;
  const conqs = h.conqs || (() => { try { return c.lsGet(c.CONQ_KEY, {}); } catch (e) { return {}; } });
  const pick = a => (a && a.length) ? a[Math.random() * a.length | 0] : '';
  const sub = (q, t) => { try { if (t) c.sub(q, t); } catch (e) {} };
  const subP = (q, t) => { try { if (t) (c.subPequeno ? c.subPequeno(q, t) : c.sub(q, t)); } catch (e) {} };
  const conquista = id => { try { c.conquista(id); } catch (e) {} };
  const lsGet = (k, d) => { try { return c.lsGet(k, d); } catch (e) { return d; } };
  const lsSet = (k, v) => { try { c.lsSet(k, v); } catch (e) {} };

  const FICHA_KEY = 'hora-silencio-ficha';
  let fichaN = lsGet(FICHA_KEY, 0) | 0;

  // ===== Tela de morte: ficha do Inspetor (uma linha por morte) + lousa de giz das quedas =====
  let elFicha = null, elLousa = null;
  const tally = { inspetor: 0, ana: 0, procissao: 0 };
  function montarMorte() {
    const d = $('#death'); if (!d || elFicha) return;
    const base = 'max-width:30em;margin:.9em auto 0;font-size:.8em;line-height:1.5;text-align:center;';
    elLousa = document.createElement('div');
    elLousa.id = 'l5-lousa';
    elLousa.style.cssText = base + 'color:#c8bfa6;font-family:Georgia,serif;white-space:pre-line;opacity:.78;';
    elFicha = document.createElement('div');
    elFicha.id = 'l5-ficha';
    elFicha.style.cssText = base + 'color:#9a8f7c;font-style:italic;opacity:0;transition:opacity 1.1s ease .9s;';
    const stats = $('#dt-stats');
    if (stats && stats.parentNode) { stats.parentNode.insertBefore(elLousa, stats); stats.parentNode.insertBefore(elFicha, stats); }
    else { d.appendChild(elLousa); d.appendChild(elFicha); }
  }
  function aoMorrer(quem) {
    montarMorte();
    if (tally[quem] != null) tally[quem]++;
    const St = S(), total = (St ? St.mortes : 0) || 0;
    // Lousa: conta por tipo, com frase que endurece quando você insiste
    if (elLousa && L.lousa) {
      const linhas = [];
      const base = total >= 6 ? (L.lousa.muito || '') : (L.lousa.conta || '');
      if (base) linhas.push(base.replace('{n}', total));
      const tp = L.lousa.tipos || {};
      for (const k of ['inspetor', 'ana', 'procissao']) if (tally[k] > 0 && tp[k]) linhas.push(tp[k].replace('|', '|'.repeat(Math.min(tally[k], 6))).replace('/', '/'.repeat(Math.min(tally[k], 6))).replace('+', '+'.repeat(Math.min(tally[k], 6))));
      elLousa.textContent = linhas.join('\n');
    }
    // Ficha: revela a próxima linha
    const lin = L.ficha && L.ficha.linhas;
    if (elFicha && lin && lin.length) {
      if (fichaN < lin.length) {
        elFicha.textContent = (L.ficha.titulo || '') + '  ·  ' + lin[fichaN];
        fichaN++; lsSet(FICHA_KEY, fichaN);
        if (fichaN >= lin.length) conquista('ficha_moacir');
      } else {
        elFicha.textContent = L.ficha.completa || '';
      }
      elFicha.style.opacity = '0'; void elFicha.offsetWidth; elFicha.style.opacity = '.85';
    }
    mortesSessao++;
  }
  // observa a tela de morte ficar visível (sem editar o motor)
  (function observarMorte() {
    const d = $('#death');
    if (!d) { setTimeout(observarMorte, 400); return; }
    let viz = !d.hidden;
    try {
      const mo = new MutationObserver(() => {
        const agora = !d.hidden;
        if (agora && !viz) { const St = S(); aoMorrer(St && tally[St.causa] != null ? St.causa : 'inspetor'); }
        viz = agora;
      });
      mo.observe(d, { attributes: true, attributeFilter: ['hidden'] });
    } catch (e) {}
  })();

  // ===== Estado da noite acompanhado quadro a quadro =====
  let mortesSessao = 0;
  let capAnt = -1, tCap = 0, bilheteFeito = false, dicaSinoFeita = false;
  let cacaT = 0, cacaFalaT = 0, cacaHid = false, cacaDano = 0, cacaMarcada = false, longaDica = false, cacaDist = 99, estAnt = '';
  let anaViva = false, procViva = false, crachaFeito = false, primeiroCacaFeito = false;
  let pertoT = 0, rezaT = 0, imitaCd = 20, imitaRestam = 2;
  let anaQuaseFeito = false, procPassaT = 0, chamaT = 18, contaCamasFeito = false, primeiroEscondeFeito = false;
  // Chamado silencioso (ignorar + ficar imóvel)
  let chArm = false, chT = 0, chPos = null, chCap = 0;

  function aoComecar() {
    mortesSessao = 0; capAnt = -1; tCap = 0; bilheteFeito = false; dicaSinoFeita = false;
    cacaT = 0; cacaMarcada = false; longaDica = false; anaViva = false; procViva = false; crachaFeito = false;
    primeiroCacaFeito = false; pertoT = 0; rezaT = 0; imitaCd = 20; imitaRestam = 2; estAnt = ''; cacaDist = 99;
    anaQuaseFeito = false; procPassaT = 0; chamaT = 18; contaCamasFeito = false; primeiroEscondeFeito = false;
    chArm = false; chT = 0; chPos = null;
  }
  function distPM() { try { const dx = c.P.pos.x - c.M.pos.x, dz = c.P.pos.z - c.M.pos.z; return Math.sqrt(dx * dx + dz * dz); } catch (e) { return 99; } }
  function vozChamado() { // chamado tocou: arma a janela do silêncio premiado
    const St = S(); if (!St) return;
    if (!chArm) { chArm = true; chT = 0; chCap = St.chapter; try { chPos = c.P.pos.clone(); } catch (e) { chPos = null; } }
  }
  function respondeu() { chArm = false; chT = 0; } // respondeu em voz alta: perdeu o prêmio

  function dist2(a, b) { const dx = a.x - b.x, dz = a.z - b.z; return dx * dx + dz * dz; }

  function tick(dt) {
    const St = S(); if (!St || St.dead) { if (St && St.dead) cacaT = 0; return; }
    const d = Number(dt) || 0;

    // --- começo de capítulo: ele lembra das suas mortes ---
    if (St.chapter !== capAnt) {
      const subiu = capAnt >= 0 && St.chapter > capAnt;
      capAnt = St.chapter; tCap = 0; cacaMarcada = false; crachaFeito = false;
      // atmosfera de monstro ao entrar no capítulo
      if (L.entradaCap && L.entradaCap[St.chapter]) { const f = L.entradaCap[St.chapter]; setTimeout(() => { const s = S(); if (s && !s.dead && s.chapter === St.chapter) subP('lia', f); }, 2500); }
      if (subiu && mortesSessao > 0 && L.lembra) {
        const idx = Math.min(mortesSessao, L.lembra.length - 1);
        let fala = L.lembra[idx] || '';
        if (mortesSessao > L.lembra.length - 1 && L.lembraTeto && Math.random() < .5) fala = L.lembraTeto;
        if (fala) setTimeout(() => { const s = S(); if (s && !s.dead && s.chapter === St.chapter) sub('inspetor', fala); }, 4200);
      }
      // bilhete do sino, no caminho dos túneis (cap 4)
      if (St.chapter === 4 && !bilheteFeito && L.bilheteSino) {
        bilheteFeito = true;
        setTimeout(() => { const s = S(); if (!s || s.dead) return; subP('lia', L.bilheteSino.lia); setTimeout(() => { const s2 = S(); if (s2 && !s2.dead) sub('davi', L.bilheteSino.davi); }, 3200); }, 7000);
      }
      // dica do sino ao chegar no cemitério (cap 5)
      if (St.chapter === 5 && !dicaSinoFeita && L.dicaSino) { dicaSinoFeita = true; setTimeout(() => { if (c.toast) c.toast(L.dicaSino); }, 6000); }
    }
    tCap += d;

    // --- Ana e Procissão: variações por capítulo ---
    try {
      const av = !!(c.ANA && c.ANA.ativa);
      if (av && !anaViva) {
        if (L.anaPorCap && L.anaPorCap[St.chapter]) { const f = L.anaPorCap[St.chapter]; setTimeout(() => { if (!S().dead) sub('ana', f); }, 1500); }
        else if (L.anaPrimeira) subP('lia', L.anaPrimeira);
      }
      anaViva = av;
      if (!av) anaQuaseFeito = false;
      else if (!anaQuaseFeito && c.ANA && (c.ANA.conta || 0) >= 8 && L.anaQuase) { anaQuaseFeito = true; subP('lia', L.anaQuase); }
      const pv = !!(c.PROC && c.PROC.fase);
      if (pv && !procViva) {
        if (L.procPorCap && L.procPorCap[St.chapter]) subP('lia', L.procPorCap[St.chapter]);
        else if (L.procPrimeira) subP('lia', L.procPrimeira);
      }
      procPassaT -= d;
      if (pv && St.hidden && procPassaT <= 0 && L.procPassa) { procPassaT = 7; subP('lia', L.procPassa); }
      procViva = pv;
    } catch (e) {}

    // --- nome sob o crachá: de perto, enquanto ele reza, a Lia lê o nome arranhado ---
    if (!crachaFeito && L.cracha && c.M && c.M.state === 'reza') {
      try {
        const dx = c.P.pos.x - c.M.pos.x, dz = c.P.pos.z - c.M.pos.z;
        if (dx * dx + dz * dz < 6.25 && c.S.flashOn) { crachaFeito = true; subP('lia', L.cracha); }
      } catch (e) {}
    }

    // --- o homem de verdade nas pausas de memória; a voz que imita o irmão; a ronda que chama os mortos ---
    rezaT -= d; imitaCd -= d; chamaT -= d;
    const estNow = (c.M && c.M.state) || '';
    if (estNow === 'reza' && rezaT <= 0 && distPM() < 5 && L.reza) { rezaT = 9 + Math.random() * 6; sub('inspetor', pick(L.reza)); }
    if (estNow === 'patrulha' && chamaT <= 0 && distPM() < 14 && L.chamaCriancas) { chamaT = 16 + Math.random() * 10; sub('inspetor', pick(L.chamaCriancas)); }
    if (estNow === 'patrulha' && !contaCamasFeito && St.chapter === 3 && distPM() < 14 && L.contaCamas && tCap > 12) { contaCamasFeito = true; sub('inspetor', L.contaCamas); }
    if (estNow === 'patrulha' && imitaCd <= 0 && imitaRestam > 0 && L.imitaDavi) {
      const dd = distPM();
      if (dd < 10 && dd > 3 && Math.random() < d * .08) {
        imitaCd = 40; imitaRestam--;
        sub('davi', L.imitaDavi);
        setTimeout(() => { const s = S(); if (s && !s.dead && L.imitaDaviLia) subP('lia', L.imitaDaviLia); }, 2800);
      }
    }

    // --- perseguição memorável: caçada longa, aparência perturbadora, fôlego comprido ---
    const estado = (c.M && c.M.state) || '';
    const caçando = estado === 'caca' || estado === 'bote' || estado === 'agarra';
    if (caçando) {
      if (cacaT === 0) {
        cacaDano = St.capDano || 0; cacaHid = false; cacaDist = 99;
        if (!primeiroCacaFeito && L.primeiroCaca) { primeiroCacaFeito = true; subP('lia', pick(L.primeiroCaca)); }
      }
      cacaT += d; cacaFalaT -= d;
      if (St.hidden) { cacaHid = true; if (!primeiroEscondeFeito && L.primeiroEsconde) { primeiroEscondeFeito = true; subP('lia', L.primeiroEsconde); } }
      const dd = distPM(); if (dd < cacaDist) cacaDist = dd;
      // ele colado na fresta do seu esconderijo
      pertoT -= d;
      if (St.hidden && dd < 3 && pertoT <= 0 && L.pertoEscondida) { pertoT = 6 + Math.random() * 4; sub('inspetor', pick(L.pertoEscondida)); }
      if (cacaT > 10 && cacaFalaT <= 0) {
        cacaFalaT = 7 + Math.random() * 4;
        const cruel = St.dif === 'pesadelo' && L.pesadeloCaca && Math.random() < .5;
        if (cruel) sub('inspetor', pick(L.pesadeloCaca));
        else if (Math.random() < .5) sub('inspetor', pick(L.cacaLonga));
        else subP('lia', pick(L.aparencia));
        if (cacaT > 16 && !longaDica && L.dicaPerseguido) { longaDica = true; if (c.toast) c.toast(L.dicaPerseguido); }
      }
    } else {
      if (estAnt === 'caca' || estAnt === 'bote' || estAnt === 'agarra') {
        // ele acabou de te perder
        if (cacaDist < 2.4 && !St.hidden && L.quaseFio) subP('lia', L.quaseFio); // passou raspando
        else if (cacaT > 2 && L.rondaVolta && Math.random() < .6) sub('inspetor', pick(L.rondaVolta));
      }
      if (cacaT > 16 && !St.hidden) { // sobreviveu a uma caçada longa sem se esconder
        subP('lia', L.sobreviveuCaca);
        if (!cacaHid && (St.capDano || 0) <= cacaDano) conquista('perseguicao');
      }
      cacaT = 0;
    }
    estAnt = estado;

    // --- Chamado: silêncio premiado (ignorar + ficar imóvel) ---
    if (chArm) {
      chT += d;
      let moveu = false;
      try { if (chPos && c.P && c.P.pos) moveu = dist2(c.P.pos, chPos) > 2.25; } catch (e) {}
      if (St.chapter !== chCap || St.flags.respondeu) { chArm = false; }
      else if (moveu) { chArm = false; }
      else if (chT >= 8) {
        chArm = false;
        sub('davi', L.chamadoChora);
        const dica = (L.chamadoDavi && L.chamadoDavi[St.chapter]) || L.chamadoDaviGen;
        setTimeout(() => { const s = S(); if (s && !s.dead) sub('davi', dica); }, 3000);
        conquista('surda_imovel');
      } else if (chT > 22) { chArm = false; }
    }
  }

  // ===== Finais: silhueta do chapéu e epílogos secretos do Moacir =====
  function extrasFinal(tipo) {
    const St = S(); if (!St) return '';
    let extra = '';
    if (tipo === 'comum' || tipo === 'silencio') {
      if (L.chapeu) { extra += '\n\n' + L.chapeu; conquista('chapeu'); }
      if (tipo === 'comum' && L.comumCoda) extra += L.comumCoda;
      if (tipo === 'silencio' && L.silencioCoda) extra += L.silencioCoda;
    } else if (tipo === 'verdadeiro') {
      const cq = conqs();
      const gestos = (St.flags.ms_pulso ? 1 : 0) + (St.flags.ms_bolso ? 1 : 0) + (cq.ms4_nome ? 1 : 0);
      if (gestos >= 2 && L.epilogoMenino) extra += L.epilogoMenino;
      // a mercê: furtou o apito, chamou pelo nome e tocou o sino (que é o próprio final verdadeiro)
      if (St.flags.ms_apito && cq.ms4_nome && L.epilogoMerce) { extra += L.epilogoMerce; conquista('boa_noite'); }
    }
    return extra;
  }

  return { tick, aoComecar, vozChamado, respondeu, extrasFinal };
}
