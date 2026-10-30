// LOTE 6 — REJOGABILIDADE (história e texto): o internato lembra que você já esteve aqui.
// Instalado por src/historia.js com uma linha. Não muda o fluxo dos capítulos nem rótulos de
// interação; só acrescenta texto no momento certo, lido de window.ROTEIRO.lote6 (roteiro.js).
// Tudo é condicionado ao save (finais já vistos, nº de noites), então só aparece na volta.

export function instalarHistoriaL6(c, helpers) {
  const h = helpers || {};
  const R = c.R || {};
  const L = R.lote6 || {};
  const $ = s => document.querySelector(s);
  const S = () => c.S;
  const conqs = h.conqs || (() => { try { return c.lsGet(c.CONQ_KEY, {}); } catch (e) { return {}; } });
  const pick = a => (a && a.length) ? a[Math.random() * a.length | 0] : '';
  const sub = (q, t) => { try { if (t) c.sub(q, t); } catch (e) {} };
  const subP = (q, t) => { try { if (t) (c.subPequeno ? c.subPequeno(q, t) : c.sub(q, t)); } catch (e) {} };
  const toast = t => { try { if (t && c.toast) c.toast(t); } catch (e) {} };
  const conquista = id => { try { c.conquista(id); } catch (e) {} };
  const lsGet = (k, d) => { try { return c.lsGet(k, d); } catch (e) { return d; } };
  const lsSet = (k, v) => { try { c.lsSet(k, v); } catch (e) {} };
  const nomeJogador = h.nomeJogador || (() => '');

  const STATS_KEY = 'hora-silencio-stats';
  const BRINQ_KEY = 'hora-silencio-l6-brinq';   // quantos brinquedos do Davi já juntou (entre noites)
  const RET_KEY = 'hora-silencio-l6-retorno';   // quantas linhas do Diário do Retorno já escreveu
  const RECADO_KEY = 'hora-silencio-l6-recado';  // o que a Lia fez de pior na última noite (vira nota)

  const stats = () => lsGet(STATS_KEY, {}) || {};
  const noites = () => { const st = stats(); const n = (st.partidas | 0) || ((S() && S().flags && S().flags._noite) | 0) || 1; return Math.max(1, n); };
  const nFinais = () => { const q = conqs(); return ['final_comum', 'final_silencio', 'final_verdadeiro'].filter(k => q[k]).length; };
  const jaZerou = () => nFinais() > 0;
  const fezVerdadeiro = () => !!conqs().final_verdadeiro;
  const campanhas = () => { const st = stats(); return (st.concluidas | 0) || 0; };
  const fmtT = s => { s = s | 0; return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const melhorTempo = () => { const st = stats(); return (st.melhorTotal && st.melhorTotal < 1e9) ? st.melhorTotal : 0; };

  // Condição de uma nota de rejogada aparecer (usada por src/historia.js para colocá-la no mapa)
  function notaLiberada(n) {
    if (!n) return false;
    if (n.so === 'verdadeiro') return fezVerdadeiro();
    return jaZerou();
  }
  // Texto dinâmico de algumas notas (o recado da noite passada cita o que você fez).
  // Guarda o molde original para não estragar o {acao} entre noites.
  const _tpl = {};
  function textoNota(n) {
    if (!n) return '';
    if (_tpl[n.id] === undefined) _tpl[n.id] = n.texto || '';
    let t = _tpl[n.id];
    if (n.id === 'n6d') t = t.replace('{acao}', lsGet(RECADO_KEY, 'corri quando devia ter andado'));
    return t;
  }

  // ===== estado por noite =====
  let capAnt = -1, salaAnt = null, setaT = 0, setaFeita = false, recFeito = false, inspCd = 0;
  let marcoFeito = false, prologoFeito = false, reconheceFeito = false, chamadaNomesFeita = false;
  let retornoPendente = null, retornoFeito = false, brinquedoNoite = false;
  let saudacaoFeita = false, aberturaFeita = false, vigiaT = 0, dominioCd = 0, dominioAnt = '';

  function aoComecar(St) {
    capAnt = -1; salaAnt = null; setaT = 14; setaFeita = false; recFeito = false; inspCd = 8;
    marcoFeito = false; prologoFeito = false; reconheceFeito = false; chamadaNomesFeita = false;
    retornoFeito = false; retornoPendente = null; brinquedoNoite = false;
    saudacaoFeita = false; aberturaFeita = false; vigiaT = 30; dominioCd = 0; dominioAnt = '';
    if (jaZerou()) { conquista('segunda_vigilia'); retornoPendente = escreverRetorno(); }
  }

  // Marca o que foi "o pior" desta noite, para virar o recado da próxima (nota n6d)
  function registrarRecado(St) {
    if (!St) return;
    let acao = 'corri quando devia ter andado';
    try {
      const c5 = St.causa;
      if (c5 === 'ana') acao = 'pisquei e deixei a menina chegar';
      else if (c5 === 'procissao') acao = 'fiquei fora da cama quando a fila passou';
      else if ((St.mortes | 0) === 0) acao = 'passei a noite toda sem apanhar — dá pra repetir';
      else if ((St.garrafas | 0) > 2) acao = 'joguei garrafa demais e chamei ele pra mim';
    } catch (e) {}
    lsSet(RECADO_KEY, acao);
  }

  function dist2(a, b) { const dx = a.x - b.x, dz = a.z - b.z; return dx * dx + dz * dz; }
  function distPM() { try { const dx = c.P.pos.x - c.M.pos.x, dz = c.P.pos.z - c.M.pos.z; return Math.sqrt(dx * dx + dz * dz); } catch (e) { return 99; } }

  function tick(dt) {
    const St = S(); if (!St || St.dead) return;
    const d = Number(dt) || 0;
    if (!jaZerou()) return; // tudo do Lote 6 só existe na volta
    const P = c.P, M = c.M, W = c.W;

    // --- boas-vindas da rejogada: a casa reconhece você (uma vez por noite) ---
    if (!reconheceFeito && (St.capT || 0) > 3) {
      reconheceFeito = true;
      if (L.reconhece) { toast(L.reconhece.primeira); setTimeout(() => { const s = S(); if (s && !s.dead) subP('lia', L.reconhece.casa); }, 2600); }
    }
    // --- Diário do Retorno: a nova linha desta noite aparece como pensamento da Lia ---
    if (!retornoFeito && retornoPendente && (St.capT || 0) > 10) {
      retornoFeito = true; const linha = retornoPendente; retornoPendente = null;
      setTimeout(() => { const s = S(); if (s && !s.dead) subP('lia', '(você se ouve pensar, como quem já escreveu isso) ' + linha); }, 1200);
    }

    // --- prólogo: o Davi sabe que você voltou ---
    if (!prologoFeito && W && W.mapa === 'estrada' && (St.capT || 0) > 6 && L.daviVoltou) {
      prologoFeito = true; setTimeout(() => { const s = S(); if (s && !s.dead) sub('davi', pick(L.daviVoltou)); }, 1500);
    }
    // --- prólogo: a saudação muda com o nome digitado e com o número de noites ---
    if (!saudacaoFeita && W && W.mapa === 'estrada' && (St.capT || 0) > 12 && L.saudacaoNome) {
      const nome = (nomeJogador() || '').trim();
      if (nome) { saudacaoFeita = true; subP('lia', L.saudacaoNome.replace('{nome}', nome)); }
    }
    if (!aberturaFeita && W && W.mapa === 'estrada' && (St.capT || 0) > 15 && L.aberturaNoite) {
      const n = noites(); const chave = n >= 20 ? 20 : n >= 9 ? 9 : n >= 5 ? 5 : 0;
      if (chave && !marcoFeito) { aberturaFeita = true; subP('lia', L.aberturaNoite[chave]); }
    }

    // --- marcos de muitas noites: a Lia comenta a volta (prólogo) ---
    if (!marcoFeito && W && W.mapa === 'estrada' && (St.capT || 0) > 2 && L.noiteMarco) {
      const n = noites(); const chave = n >= 25 ? 25 : n >= 13 ? 13 : n >= 9 ? 9 : 0;
      if (chave) { marcoFeito = true; setTimeout(() => { const s = S(); if (s && !s.dead) subP('lia', L.noiteMarco[chave]); }, 4800); }
    }
    // --- envelope da décima terceira noite ---
    if (!marcoFeito && W && W.mapa === 'estrada' && noites() === 13 && L.envelope13 && (St.capT || 0) > 8 && !St.flags._l6env) {
      St.flags._l6env = true; subP('lia', L.envelope13.lia);
      setTimeout(() => { const s = S(); if (s && !s.dead) sub('lia', L.envelope13.texto); }, 3400);
    }

    // --- a chamada de 1979 lê os nomes que você digitou (uma vez, no térreo) ---
    if (!chamadaNomesFeita && W && W.mapa === 'terreo' && (St.capT || 0) > 20 && L.chamadaNomes) {
      const nome = (nomeJogador() || '').trim();
      if (nome && M && M.state === 'patrulha' && distPM() < 15) {
        chamadaNomesFeita = true; sub('inspetor', L.chamadaNomes.linha.replace(/\{nome\}/g, nome));
      }
    }

    // --- entrada de capítulo que você já venceu: a Lia reconhece a repetição ---
    if (St.chapter !== capAnt) {
      const cap = St.chapter; capAnt = cap; setaFeita = false;
      if (L.entradaRejogada && L.entradaRejogada[cap]) {
        setTimeout(() => { const s = S(); if (s && !s.dead && s.chapter === cap) subP('lia', L.entradaRejogada[cap]); }, 3600);
      }
      // provocação do seu recorde escrita a giz, se houver tempo salvo
      if (cap > 0 && L.gizRecorde && melhorTempo()) {
        setTimeout(() => { const s = S(); if (s && !s.dead && s.chapter === cap) toast(pick(L.gizRecorde).replace('{t}', fmtT(melhorTempo()))); }, 6500);
      }
    }

    // --- comentário do Davi por sala (só depois do final verdadeiro) ---
    if (P && P.room && P.room !== salaAnt) {
      salaAnt = P.room;
      if (fezVerdadeiro() && L.comentarioDavi) {
        const id = P.room.id, f = L.comentarioDavi[id], fk = '_l6dv_' + id;
        if (f && !St.flags[fk]) { St.flags[fk] = true; setTimeout(() => { const s = S(); if (s && !s.dead) subP('davi', f); }, 2200); }
      }
    }

    // --- setas de giz do Davi: apontam um segredo que ainda falta (nunca entregam qual) ---
    setaT -= d;
    if (!setaFeita && setaT <= 0 && L.setaSegredo) {
      setaFeita = true;
      // "falta algo" = algum segredo do acervo ainda não achado (heurística: conquistas secretas pendentes)
      const q = conqs(), faltaSegredo = !q.bombeiro || !q.desenho || !q.confissao || !q.escuro;
      if (!c.dicaExterna) toast(faltaSegredo ? pick(L.setaSegredo) : (L.setaNada || ''));
    }

    // --- Segunda Vigília: pensamentos de quem já viveu a noite, pingados fora do prólogo ---
    if (W && W.mapa !== 'estrada' && L.vigia) {
      vigiaT -= d;
      if (vigiaT <= 0 && !St.hidden && (!M || M.state === 'patrulha')) { vigiaT = 45 + Math.random() * 25; subP('lia', pick(L.vigia)); }
    }

    // --- falas de domínio: ao começar uma caçada na volta, a Lia antecipa o perigo que já conhece ---
    dominioCd -= d;
    const estAgora = (M && M.state) || '';
    if (L.dominio && (estAgora === 'caca' || estAgora === 'bote') && dominioAnt !== 'caca' && dominioAnt !== 'bote' && dominioCd <= 0) {
      dominioCd = 35; subP('lia', pick(L.dominio));
    }
    dominioAnt = estAgora;

    // --- o Inspetor te reconhece, se você já o calou com o sino antes ---
    inspCd -= d;
    if (fezVerdadeiro() && inspCd <= 0 && M && (M.state === 'caca' || M.state === 'patrulha') && distPM() < 10 && L.inspetorReconhece) {
      inspCd = 30 + Math.random() * 20; sub('inspetor', pick(L.inspetorReconhece));
    }
  }

  // ===== brinquedo da noite: entregue por src/historia.js ao colocar o mapa =====
  // devolve o texto a mostrar quando o jogador pega o brinquedo (ou null se já juntou os nove)
  function brinquedoDaNoite() {
    if (!jaZerou() || !L.brinquedos) return null;
    let n = lsGet(BRINQ_KEY, 0) | 0;
    if (n >= 9) return null;
    return { idx: n };
  }
  function pegouBrinquedo() {
    let n = lsGet(BRINQ_KEY, 0) | 0; if (n >= 9) return;
    n++; lsSet(BRINQ_KEY, n);
    const falta = 9 - n;
    if (n >= 9) { sub('davi', L.brinquedos.completo); conquista('nove_brinquedos'); }
    else { const nome = L.brinquedos.nomes[(n - 1) % L.brinquedos.nomes.length]; subP('lia', L.brinquedos.pegar.replace('{o}', nome).replace('{f}', falta)); }
  }

  // ===== Diário do Retorno: uma linha por noite rejogada (devolve a linha nova, ou null) =====
  function escreverRetorno() {
    if (!jaZerou() || !L.diarioRetorno) return null;
    let n = lsGet(RET_KEY, 0) | 0; const tot = L.diarioRetorno.linhas.length;
    if (n >= tot) return null;
    const linha = L.diarioRetorno.linhas[n];
    n++; lsSet(RET_KEY, n);
    if (n >= tot) conquista('diario_retorno');
    return linha;
  }
  function linhasRetorno() {
    const n = Math.min(lsGet(RET_KEY, 0) | 0, (L.diarioRetorno && L.diarioRetorno.linhas.length) || 0);
    return (L.diarioRetorno && L.diarioRetorno.linhas.slice(0, n)) || [];
  }

  // ===== Finais que somam =====
  function extrasFinal(tipo) {
    let extra = '';
    const nf = nFinais();
    // guarda, para a próxima noite, o que deu errado nesta (vira o bilhete n6d)
    try { registrarRecado(S()); } catch (e) {}
    // a folha do diário do Davi que reage a ESTE final (completa a história dele aos poucos)
    const D = L.diarioDaviPorFinal || {};
    if (D[tipo]) extra += '\n\n' + (D.intro ? D.intro + ' ' : '') + D[tipo];
    // epílogo-jornal com os seus números reais (quando já viu pelo menos dois finais)
    if (nf >= 2 && L.epilogoJornal) {
      const st = stats(); const n = noites(), mortes = (st.mortes | 0);
      const mt = melhorTempo();
      extra += L.epilogoJornal.cab + '\n' + (mt
        ? L.epilogoJornal.corpo.replace('{n}', n).replace('{mortes}', mortes).replace('{tempo}', fmtT(mt))
        : L.epilogoJornal.semTempo.replace('{n}', n));
    }
    // já viu os três finais: o prenúncio da quarta saída
    if (nf >= 3 && L.finalTres) extra += L.finalTres;
    // final-loop: muitas campanhas concluídas
    if (campanhas() >= 3 && L.finalLoop) extra += L.finalLoop;
    // a última folha do diário do Davi completa quando você já alcançou tudo
    if (tipo === 'verdadeiro' && nf >= 3 && L.diarioDaviPorFinal) extra += '\n\n' + L.diarioDaviPorFinal.completa;
    // resposta do Davi no epílogo verdadeiro: escolhida pelo que você guardou
    if (tipo === 'verdadeiro' && jaZerou() && L.perguntaDavi) {
      const St = S(); let r = L.perguntaDavi.ana;
      if (St && St.notes && St.notes.n13) r = L.perguntaDavi.davi;
      else if (St && St.flags && St.flags.carrinhoAzul) r = L.perguntaDavi.tome;
      extra += r; conquista('resposta_davi');
    }
    return extra;
  }

  // ===== Página extra do diário do Davi por final distinto (texto para a interface) =====
  function folhasDavi() {
    const q = conqs(), out = [], D = L.diarioDaviPorFinal || {};
    if (q.final_comum && D.comum) out.push(D.comum);
    if (q.final_silencio && D.silencio) out.push(D.silencio);
    if (q.final_verdadeiro && D.verdadeiro) out.push(D.verdadeiro);
    if (q.quarta_crianca && D.quarta) out.push(D.quarta);
    return out;
  }

  // ===== Chamado na rejogada: o Davi guia de verdade, ou mente =====
  function chamado(St) {
    if (!jaZerou() || !L.chamadoRejogada) return null;
    if (Math.random() < 0.5) return pick(L.chamadoRejogada.guia);
    const t = pick(L.chamadoRejogada.mente);
    setTimeout(() => { const s = S(); if (s && !s.dead && L.chamadoRejogada.liaDesconfia) subP('lia', L.chamadoRejogada.liaDesconfia); }, 2600);
    return t;
  }

  // ===== Título: subtítulo mais forte para quem rejoga, e a provocação do recorde =====
  function titulo() {
    try {
      const sub2 = $('#t-sub'); if (!sub2) return;
      if (document.body.classList.contains('nove') || document.body.classList.contains('fita-gasta')) return;
      const nf = nFinais();
      let txt = null;
      if (campanhas() >= 3 && L.subtitulos && L.subtitulos.loop) txt = L.subtitulos.loop.replace('{n}', noites());
      else if (conqs().quarta_crianca && L.subtitulos && L.subtitulos.quarta) txt = L.subtitulos.quarta;
      else if (nf >= 3 && L.subtitulos && L.subtitulos.tresFinais) txt = L.subtitulos.tresFinais;
      if (txt) sub2.textContent = txt;
      // provocação do recorde: linha extra discreta
      const mt = melhorTempo();
      if (mt && L.provocaRecorde && jaZerou()) {
        let el = $('#l6-rec');
        if (!el) { el = document.createElement('div'); el.id = 'l6-rec'; el.style.cssText = 'margin-top:.5em;font-size:.72em;opacity:.6;font-style:italic;letter-spacing:.03em'; if (sub2.parentNode) sub2.parentNode.insertBefore(el, sub2.nextSibling); }
        el.textContent = L.provocaRecorde.replace('{t}', fmtT(mt));
      }
    } catch (e) {}
  }

  return { tick, aoComecar, extrasFinal, chamado, titulo, registrarRecado,
    notaLiberada, textoNota, brinquedoDaNoite, pegouBrinquedo, escreverRetorno, linhasRetorno, folhasDavi,
    jaZerou, fezVerdadeiro, nFinais, noites };
}
