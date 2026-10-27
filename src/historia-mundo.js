// HISTÓRIA — MUNDO (Lote 2): lore espalhada pelo internato, livro de ocorrências que escreve a sua noite,
// nomes riscados nos armários, ecos de 1979, linha do tempo no diário e finais que lembram o que você descobriu.
// Instalado por src/historia.js (instalarMundo) antes dos embrulhos dele; todo o texto mora em roteiro.js.

export function instalarMundo(c, u) {
  const { R, MAPAS, lsGet, lsSet } = c;
  const { falarLinhas, conqs, nomeJogador, esc, pick } = u;
  const $ = s => document.querySelector(s);
  const S = () => c.S;
  const ECOS_KEY = 'hora-silencio-ecos';
  const base = Object.fromEntries([...R.notas, ...R.paginas].map(n => [n.id, n.texto]));
  const joaquimBase = R.dialogos && R.dialogos.joaquim && R.dialogos.joaquim[2] ? R.dialogos.joaquim[2].texto : '';
  const ng = () => { const q = conqs(); return !!(q.final_comum || q.final_silencio || q.final_verdadeiro); };
  const OC = R.ocorrencias || {};
  const nomeLivro = () => nomeJogador() || OC.nomePadrao || 'Lia M.';
  const ui = () => (window.__jogo ? window.__jogo.ui : null);

  // ------------------------------------------------------------------
  // relógio do jogo: cada capítulo começa num minuto da noite de 14/03 e anda com o tempo do capítulo
  // ------------------------------------------------------------------
  const INI = [20 * 60 + 38, 20 * 60 + 47, 21 * 60 + 1, 21 * 60 + 5, 21 * 60 + 31, 21 * 60 + 50];
  const hora = St => { const m = (INI[St.chapter] || INI[0]) + Math.min(12, Math.floor((St.capT || 0) / 60)); return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`; };
  const preps = [[/^(sala|recepção|cozinha|despensa|diretoria|enfermaria|lavanderia|casa|biblioteca|capela|rouparia|estrada|loja|cisterna|galeria|câmara|escada|torre)/i, 'na '], [/^(banheiros)/i, 'nos '], [/^./, 'no ']];
  const lugar = r => {
    const n = (r && r.nome) || ''; if (!n) return 'no escuro';
    const p = preps.find(([re]) => re.test(n))[1]; return p + n[0].toLowerCase() + n.slice(1);
  };
  const preenche = (t, St, r) => String(t).replace('{d}', OC.data || '14/03/1994').replace('{h}', hora(St)).replace('{nome}', nomeLivro()).replace('{lugar}', lugar(r));

  // ------------------------------------------------------------------
  // spots livres: procura um lugar de apoio na sala onde ainda não há nada interativo
  // ------------------------------------------------------------------
  const ocupados = [];
  // spots que outros módulos usam depois (desenho do Davi na diretoria, fita do Tomé na rouparia)
  const RESERVA = { diret: { prateleira: [0] }, roup: { prateleira: [3] } };
  function livre(A, sala, tipo) {
    const sp = A.W.spots && A.W.spots[sala]; if (!sp) return null;
    const tipos = [tipo, 'mesa', 'prateleira', 'chao'].filter((t, i, a) => a.indexOf(t) === i);
    const usados = [...A.W.inter.map(i => i.obj && i.obj.position).filter(Boolean), ...ocupados];
    for (const t of tipos) for (const [i, p] of (sp[t] || []).entries()) {
      const rs = RESERVA[sala] && RESERVA[sala][t]; if (rs && rs.some(r => r % sp[t].length === i)) continue;
      if (usados.every(o => Math.hypot(o.x - p.x, o.z - p.z) > .55)) { ocupados.push(p); return p; }
    }
    return null;
  }

  // ------------------------------------------------------------------
  // textos que mudam com quem joga: margem da segunda noite, livro de ocorrências, fala do Joaquim
  // ------------------------------------------------------------------
  function linhasNoite(St, completo) {
    const L = [], ev = OC.eventos || {};
    if (completo && ev.entrada) L.push(preenche(ev.entrada, St));
    if (completo && St.flags.energia && ev.gerador) L.push(preenche(ev.gerador, St));
    if (completo && St.done.procissao && ev.procissao) L.push(preenche(ev.procissao, St));
    for (const l of (St.flags.ocorr || [])) L.push(l);
    if (St.flags.respondeu && OC.respondeu) L.push(preenche(OC.respondeu, St));
    if (completo && St.done.ana && ev.ana) L.push(preenche(ev.ana, St));
    if (completo && St.flags.cofre && ev.cofre) L.push(preenche(ev.cofre, St));
    if (completo && St.flags.verso && ev.verso) L.push(ev.verso);
    if (!(St.flags.ocorr || []).length && OC.quieta) L.push(preenche(OC.quieta, St));
    return L;
  }
  function textos(St) {
    if (!St) return;
    const margem = ng() && R.margemNG;
    for (const n of [...R.notas, ...R.paginas]) {
      if (n.id === 'n1' || !(n.id in base)) continue;
      let t = base[n.id];
      if (margem && margem[n.id]) t += `\n\n${R.margemRubrica || '(na margem)'}\n${margem[n.id]}`;
      if (n.id === 'n2' && (St.chapter >= 2 || (St.flags.ocorr || []).length)) {
        t += `\n\n${OC.tinta || ''}\n${linhasNoite(St, false).join('\n')}\n${OC.assinatura || ''}`;
      }
      if (n.id === 'n36') t = t.replace('{noite}', [...linhasNoite(St, true), OC.assinatura || '', '', OC.tremida || ''].join('\n'));
      n.texto = t;
    }
    if (joaquimBase) R.dialogos.joaquim[2].texto = joaquimBase + (ng() && R.joaquimNG ? R.joaquimNG : '');
  }

  // ------------------------------------------------------------------
  // mapas: notas novas em spots livres, lápides que lembram o que você leu
  // ------------------------------------------------------------------
  const embrulhar = (id, antes, depois) => {
    const orig = MAPAS[id]; if (!orig) return;
    MAPAS[id] = (A, St) => { if (antes) antes(A, St); const def = orig(A, St); if (depois) depois(A, St, def); return def; };
  };
  const porMapa = {};
  for (const n of R.notas) if (n.onde) (porMapa[n.onde[0]] = porMapa[n.onde[0]] || []).push(n);
  for (const id of ['estrada', 'terreo', 'superior', 'tuneis', 'cemiterio']) {
    embrulhar(id, (A, St) => { ocupados.length = 0; textos(St); if (id === 'cemiterio') lapides(St); }, (A, St) => {
      for (const n of (porMapa[id] || [])) {
        try { const p = livre(A, n.onde[1], n.onde[2]) || n.onde[3]; if (p) A.ITENS.nota(n.id, p); else console.info('[historia] sem lugar para', n.id); } catch (e) { console.info('[historia]', n.id, e && e.message); }
      }
    });
  }
  function lapides(St) {
    const V = R.lapidesVariantes || {}, F = R.armariosFala || {};
    const L = nome => R.lapides.find(l => l.nome && l.nome.startsWith(nome));
    const viu = St.flags.armNomes || [];
    const reconhece = (lp, chave) => {
      if (!lp) return;
      const antes = lp.aoLer, armario = viu.includes(chave), proc = St.flags.procNomes;
      if (!armario && !proc) return;
      lp.aoLer = () => { if (antes) antes(); const k = 'lapRec_' + chave; if (!St.flags[k]) { St.flags[k] = true; setTimeout(() => falarLinhas(armario ? F.lapide : F.procissao), 1600); } };
    };
    reconhece(L('ROSA'), 'ROSA'); reconhece(L('LUIZ'), 'LUIZ'); reconhece(L('MARIA'), 'MARIA'); reconhece(L('JOÃO'), 'JOAO');
    const luiz = L('LUIZ'); if (luiz && St.fitas.f3 && V.luizF3) luiz.epitafio = V.luizF3;
    const alb = R.lapides.find(l => l.id === 'albano'); if (alb && St.notes.n19 && V.albanoRecorte) alb.epitafio = (alb.epitafio || '') + ' ' + V.albanoRecorte;
    const cel = L('IRMÃ CELESTE'); if (cel && (St.notes.n39 || St.notes.n20) && V.celesteVelas) cel.epitafio = V.celesteVelas;
    const joa = R.lapides.find(l => l.id === 'joaquim'); if (joa && St.flags.verso && V.joaquimVerso) joa.epitafio = V.joaquimVerso;
    const s75 = R.lapides.find(l => l.id === 'semnome75'), nome = nomeJogador();
    if (s75 && !nome && viu.includes('BENTO') && V.bento) { Object.assign(s75, V.bento); s75.aoLer = () => c.conquista('o_que_nao_conta'); }
  }

  // ------------------------------------------------------------------
  // tela de morte: a linha do livro de ocorrências, com a hora e o lugar de verdade
  // ------------------------------------------------------------------
  const death = $('#death');
  if (death) new MutationObserver(() => {
    if (death.hidden) return;
    const St = S(); if (!St || !St.dead) return;
    const quem = St.causa, lista = OC.morte && OC.morte[quem]; if (!lista) return;
    const linha = preenche(pick(lista), St, c.P.room);
    const oc = St.flags.ocorr = St.flags.ocorr || []; oc.push(linha); if (oc.length > 6) oc.shift();
    let el = $('#death-livro');
    if (!el) {
      el = document.createElement('p'); el.id = 'death-livro';
      el.style.cssText = 'font-family:Georgia,serif;font-style:italic;color:#a89a7a;font-size:15px;margin:6px auto 2px;max-width:640px;min-height:1.3em;letter-spacing:.02em';
      const fr = $('#death-frase'); if (fr && fr.parentNode) fr.parentNode.insertBefore(el, fr.nextSibling); else death.appendChild(el);
    }
    escreverDevagar(el, linha);
  }).observe(death, { attributes: true, attributeFilter: ['hidden'] });
  function escreverDevagar(el, s) {
    clearInterval(el._esc); el.textContent = ''; let i = 0;
    el._esc = setInterval(() => { i += 1; el.textContent = s.slice(0, i); if (i >= s.length) clearInterval(el._esc); }, 24);
  }

  // ------------------------------------------------------------------
  // diário: linha do tempo que se monta com o que foi lido (aba Notas)
  // ------------------------------------------------------------------
  const pane = $('#d-pane');
  if (pane) new MutationObserver(() => {
    const St = S(); if (!St || !pane.querySelector('.notas') || pane.querySelector('.hm-tempo')) return;
    const LT = R.linhaTempo || [], tem = x => St.notes[x] || St.fitas[x];
    const ecos = (R.ecos || []).filter(e => St.flags['eco' + e.cap]).length;
    if (!LT.some(e => tem(e.pista)) && !ecos) return;
    const box = document.createElement('div'); box.className = 'hm-tempo'; box.style.cssText = 'margin-top:18px';
    box.innerHTML = `<h3>${esc(R.linhaTempoTitulo || 'Linha do tempo')}</h3>` + LT.map(e => tem(e.pista)
      ? `<div style="padding:5px 0;border-bottom:1px solid #2c2720"><b style="font-family:'IM Fell English SC';font-weight:normal;display:inline-block;min-width:96px">${esc(e.ano)}</b> <span style="color:var(--fraco);font-style:italic">${esc(e.texto)}</span></div>`
      : `<div style="padding:5px 0;border-bottom:1px solid #2c2720;opacity:.4"><b style="font-weight:normal;display:inline-block;min-width:96px">????</b> <span>...</span></div>`).join('')
      + (ecos ? `<p style="color:var(--fraco);margin-top:10px;font-style:italic">Ecos de 14 de março de 1979 ouvidos esta noite: ${ecos} de ${(R.ecos || []).length}</p>` : '');
    pane.appendChild(box);
  }).observe(pane, { childList: true });

  // ------------------------------------------------------------------
  // a cada quadro: comentários ao ler, nomes nos armários, nomes na Procissão, ecos de 1979
  // ------------------------------------------------------------------
  let ult = null, lidas = new Set(), fila = [], armAnt = null, armT = 0, procT = 0, procN = 0, procFase = null, salaAnt = null, ecoT = 0, eco = null, livroT = 0;
  // depois de morrer, o checkpoint volta: o que a casa já anotou e o que a Lia já leu nos armários continua valendo
  const LEMBRA = /^(arm|eco[0-9]|procNomes|lapRec_|chamadoMae|ocorr)/;
  function reset(St) {
    if (ult && St !== ult && (St.mortes || 0) > 0 && (St.mortes || 0) >= (ult.mortes || 0)) {
      for (const [k, v] of Object.entries(ult.flags || {})) if (LEMBRA.test(k) && St.flags[k] === undefined) St.flags[k] = Array.isArray(v) ? v.slice() : v;
    }
    ult = St; lidas = new Set(Object.keys(St.notes)); fila = []; armAnt = null; armT = 0; procN = 0; procFase = null; salaAnt = null; eco = null; ecoT = 0;
    textos(St);
  }
  const lidaNota = (St, id) => {
    if (R.aoLer && R.aoLer[id]) fila.push(R.aoLer[id]);
    const PR = R.paginasReage || {};
    if (PR[id]) fila.push(id === 'p4' && St.notes.n13 && PR.p4desenho ? PR.p4desenho : PR[id]);
    if (R.inspetorLonge && R.inspetorLonge[id]) fila.push([{ quem: 'inspetor', texto: R.inspetorLonge[id] }]);
    for (const p of (R.pares || [])) {
      if (!p.ids.includes(id) || !p.ids.every(x => St.notes[x])) continue;
      fila.push([{ quem: p.quem, texto: p.texto }]); if (p.conquista) c.conquista(p.conquista);
    }
    if (id === 'n18') c.conquista('linhagem');
  };

  function tick(dt) {
    const St = S(); if (!St || c.mode !== 'jogo') return;
    if (St !== ult) reset(St);
    const P = c.P, M = c.M, W = c.W, cacando = M.ativo && M.state === 'caca';
    // notas lidas pela primeira vez: a fala vem depois que o papel fecha
    for (const id of Object.keys(St.notes)) if (!lidas.has(id)) { lidas.add(id); lidaNota(St, id); }
    if (fila.length && ui() !== 'nota' && ui() !== 'diario' && !St.dead) falarLinhas(fila.shift());
    livroT -= dt; if (livroT <= 0) { livroT = 1.5; textos(St); }

    // nomes riscados por dentro dos armários (um a cada três armários, sem repetir no mesmo mapa)
    const L = St.hidden;
    if (L !== armAnt) { armAnt = L; armT = 0; }
    if (L && L.tipo === 'armario' && W.lockers) {
      armT += dt;
      const idx = W.lockers.indexOf(L), k = `arm_${W.mapa}_${idx}`;
      if (armT > 1.4 && idx >= 0 && idx % 3 === 1 && !St.flags[k]) {
        St.flags[k] = true;
        const off = { terreo: 0, superior: 4, tuneis: 8, cemiterio: 2 }[W.mapa] || 0, A = R.armarios || [];
        const a = A[(Math.floor(idx / 3) + off) % A.length];
        if (a) {
          c.toast('Riscado por dentro da porta: ' + a.texto);
          if (a.nome) {
            const v = St.flags.armNomes = St.flags.armNomes || [];
            if (!v.includes(a.nome)) { v.push(a.nome); if (v.length >= 5) c.conquista('nomes_armarios'); }
            const F = R.armariosFala || {};
            if (F[a.nome] && !St.flags['armFala_' + a.nome]) { St.flags['armFala_' + a.nome] = true; setTimeout(() => { if (S() === St && St.hidden) falarLinhas(F[a.nome]); }, 1800); }
          }
        }
      }
    }

    // a Procissão sussurra nomes enquanto passa
    const fase = c.PROC.fase;
    if (fase !== procFase) { procFase = fase; procN = 0; procT = 2.5; }
    if (fase === 'passando' && procN < 3) {
      procT -= dt;
      if (procT <= 0) { procT = 3.2; procN++; St.flags.procNomes = true; c.sub('voz', '(na fila, quase sem voz) ' + pick(R.procissaoNomes || ['...silêncio...'])); }
    }

    // ecos de 1979: uma vez por capítulo, num lugar do caminho
    if (P.room !== salaAnt) {
      salaAnt = P.room; eco = null; ecoT = 0;
      const k = P.room && `${W.mapa}:${P.room.id}`;
      const e = (R.ecos || []).find(x => x.sala === k && x.cap === St.chapter);
      if (e && !St.flags['eco' + e.cap]) eco = e;
    }
    if (eco) {
      if (cacando || fase || St.dead) ecoT = 0; else ecoT += dt;
      if (ecoT > 3) {
        const e = eco; eco = null; St.flags['eco' + e.cap] = true;
        try { c.SFX.sussurros(1.6); } catch (er) {}
        falarLinhas(e.linhas);
        const l = lsGet(ECOS_KEY, []); if (!l.includes(e.cap)) { l.push(e.cap); lsSet(ECOS_KEY, l); }
        if (l.length >= (R.ecos || []).length) c.conquista('a_noite');
      }
    }
  }

  // ------------------------------------------------------------------
  // finais: parágrafos que entram pelo que a Lia descobriu, o jornal do dia seguinte e o destino de cada um
  // ------------------------------------------------------------------
  function extrasFinal(tipo, F) {
    const St = S(), n = St.notes, f = St.fitas, out = [];
    if (tipo === 'verdadeiro') {
      if ((n.n14 || n.n22 || n.n15) && F.extraCulpa) out.push(F.extraCulpa);
      if (n.n20 && (n.n8 || f.f2) && F.extraCeleste) out.push(F.extraCeleste);
      if (n.n16 && St.done.ana && F.extraMar) out.push(F.extraMar);
      if (f.f3 && n.n28 && F.extraLuiz) out.push(F.extraLuiz);
      if (n.n31 && F.extraHino) out.push(F.extraHino);
      if (n.n18 && F.extraLinhagem) out.push(F.extraLinhagem);
      if (n.n35 && F.extraBispo) out.push(F.extraBispo);
      if (F.joaquim) {
        const seg = R.notas.filter(x => x.secreta && n[x.id]).length + R.fitas.filter(x => x.secreta && f[x.id]).length;
        out.push(F.joaquim[seg >= 12 ? 2 : seg >= 5 ? 1 : 0]);
      }
      if (f.f3 && n.n21 && F.moacir) out.push(F.moacir);
    } else if (tipo === 'comum') {
      if ((St.flags.respondeu || 0) >= 3 && F.extraInspetora) out.push(F.extraInspetora);
      if (n.n15 && F.extraCarta) out.push(F.extraCarta);
    } else if (tipo === 'silencio') {
      if (St.flags.verso && F.extraRegra) out.push(F.extraRegra);
    }
    const J = R.jornal;
    if (J) {
      const m = [];
      if (f.f7 || n.n34) m.push(J.confissao);
      if (n.n23 && n.n24) m.push(J.gasolina);
      if (n.n28 || n.n18) m.push(J.moacir);
      if (n.n35) m.push(J.bispo);
      out.push(J.titulo + '\n' + (m.length ? m.slice(0, 2) : [J.nada]).join('\n'));
    }
    const E = R.epilogo;
    if (E) {
      const tem = { joaquim: f.f5 || n.n30, celeste: n.n20, moacir: f.f3, albano: f.f7 || n.n19 };
      out.push(E.titulo + '\n' + ['joaquim', 'celeste', 'moacir', 'albano'].map(k => `${E[k][0]} — ${tem[k] ? E[k][1] : E.ninguem}`).join('\n'));
    }
    return out.length ? '\n\n' + out.join('\n\n') : '';
  }

  // Chamado: no Capítulo IV, depois que a Lia descobre a vaga dela, a voz é a da mãe
  function chamadoEspecial(St) {
    if (St.chapter === 4 && (St.notes.n14 || St.notes.n22) && !St.flags.chamadoMae && R.chamadoMae) { St.flags.chamadoMae = true; return R.chamadoMae; }
    return null;
  }
  const culpa = St => !!(St.notes.n14 || St.notes.n22);

  return { tick, extrasFinal, chamadoEspecial, culpa };
}
