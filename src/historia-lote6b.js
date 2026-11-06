// LOTE 6 (2ª rodada) — HISTÓRIA E TEXTO: a casa guarda o que você fez, o que você leu e o que você escreveu.
// Instalado por src/historia.js com poucas linhas. Texto em src/historia-lote6b-texto.js (R.lote6b).
// Regras: tudo passivo e à prova de erro; nada muda o fluxo dos capítulos nem os rótulos de interação;
// as telas interativas (recado, acusação, campos do título) não existem no QA (navigator.webdriver).
import './historia-lote6b-texto.js';

export function instalarHistoriaL6b(c, helpers) {
  const h = helpers || {};
  const R = c.R || window.ROTEIRO;
  const L = R.lote6b || {};
  const L6 = h.L6 || {};
  const $ = s => document.querySelector(s);
  const S = () => c.S;
  const QA = !!(navigator && navigator.webdriver);
  // leituras do localStorage são caras (por quadro, dobram o custo do jogo): ficam em cache curto
  const resets = [];
  const memoT = (fn, ms) => { let t = -1e9, v; const f = () => { const n = performance.now(); if (n - t > (ms || 1000)) { v = fn(); t = n; } return v; }; resets.push(() => { t = -1e9; }); return f; };
  const conqs = memoT(h.conqs || (() => { try { return c.lsGet(c.CONQ_KEY, {}) || {}; } catch (e) { return {}; } }));
  const nomeJogador = h.nomeJogador || (() => '');
  const lsGet = (k, d) => { try { const v = c.lsGet(k, d); return v === undefined || v === null ? d : v; } catch (e) { return d; } };
  const lsSet = (k, v) => { try { c.lsSet(k, v); } catch (e) {} };
  const conquista = id => { try { c.conquista(id); } catch (e) {} };
  const sub = (q, t) => { try { if (t) c.sub(q, t); } catch (e) {} };
  const toast = t => { try { if (t && c.toast) c.toast(t); } catch (e) {} };
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const pick = a => (a && a.length) ? a[Math.random() * a.length | 0] : '';
  const fmtT = s => { s = s | 0; return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

  const KEY = 'hora-silencio-l6b';            // memória desta rodada (tudo num objeto só)
  const AMIGOS_KEY = 'hora-silencio-l6b-amigos';
  const STATS_KEY = 'hora-silencio-stats';
  let memC = null, memT0 = -1e9;
  const mem = () => { const n = performance.now(); if (!memC || n - memT0 > 1500) { const m = lsGet(KEY, {}); memC = (m && typeof m === 'object') ? m : {}; memT0 = n; } return memC; };
  const salvar = m => { memC = m; memT0 = performance.now(); lsSet(KEY, m); };
  const mudar = fn => { const m = mem(); fn(m); salvar(m); return m; };

  const stats = memoT(() => lsGet(STATS_KEY, {}) || {});
  const noites = memoT(() => (L6.noites ? L6.noites() : Math.max(1, (stats().partidas | 0) || 1)));
  const jaZerou = memoT(() => (L6.jaZerou ? L6.jaZerou() : false));
  const fezVerdadeiro = () => !!conqs().final_verdadeiro;
  const nFinais = () => ['final_comum', 'final_silencio', 'final_verdadeiro'].filter(k => conqs()[k]).length;
  const rejogo = () => noites() > 1;                 // a partir da segunda noite jogada
  const volta = () => rejogo() || jaZerou();

  // ===== semente da noite (guardada no estado, sobrevive a morrer e a continuar) =====
  function seed(St) {
    St = St || S(); if (!St || !St.flags) return 1;
    if (!St.flags._l6bs) St.flags._l6bs = ((Math.random() * 4294967295) >>> 0) || 1;
    return St.flags._l6bs >>> 0;
  }
  const CULPADOS = ['albano', 'celeste', 'joaquim'];
  const culpado = St => CULPADOS[(seed(St) >>> 3) % 3];

  // ===== estado da noite (na memória do módulo: não volta com o checkpoint) =====
  let seedRef = 0, stRef = null, feito = new Set(), mortesCap = {}, tcap = {}, pend3 = null, t3 = 0;
  let fila = [], filaT = 0, lia_t = 0, acc = { hid: 0, noise: 0, t: 0 }, ultSala = null, bilTxt = null;
  let regraVista = false, notaT = 0, cartaMoacirCap = -1, pendMae = null;
  const um = k => { if (feito.has(k)) return false; feito.add(k); return true; };
  const quando = (ms, fn) => {
    const St = S();
    setTimeout(() => { const s = S(); if (s && s === St && !s.dead && c.mode === 'jogo') { try { fn(s); } catch (e) {} } }, ms);
  };
  const dur = t => Math.max(2800, String(t).length * 65) + 700;
  // toca uma lista de falas {quem, texto} uma depois da outra, sem uma atropelar a outra
  function tocar(linhas, ini = 0) {
    let t = ini;
    for (const l of linhas) { const q = l.quem, x = l.texto; quando(t, () => sub(q, x)); t += dur(x); }
    return t;
  }

  function novaNoite(St) {
    seedRef = seed(St); feito = new Set(); mortesCap = {}; tcap = {}; pend3 = null; t3 = 0; fila = []; filaT = 0;
    lia_t = 50 + Math.random() * 40; acc = { hid: 0, noise: 0, t: 0 }; ultSala = null; bilTxt = null;
    regraVista = false; notaT = 0; cartaMoacirCap = -1; pendMae = null; planos = null;
    construirFila(); ausenciaPend = [];
  }

  // ====================================================================================
  // 1. NOTAS, FITAS, PÁGINAS, REGRAS E LÁPIDES QUE MUDAM POR NOITE
  // ====================================================================================
  let planos = null;
  const achar = id => R.notas.find(n => n.id === id) || R.paginas.find(n => n.id === id);
  const lerLidas = () => { const m = mem(); return Array.isArray(m.lidas) ? m.lidas : []; };
  const hash = s => { let x = 2166136261; for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; };

  function falsa(St) {
    if (!rejogo()) return null;
    const M = L.mentiras || []; if (!M.length) return null;
    return M[(seed(St) >>> 9) % M.length];
  }
  function construirPlanos(St) {
    const P = {}; const add = (id, suf) => { if (!P[id]) P[id] = { suf: '', f: null }; if (suf) P[id].suf += suf; };
    const cul = culpado(St), depois = fezVerdadeiro(), N = L.notasDepois || {};
    if (rejogo()) for (const id of ['n2', 'n8', 'n10', 'p4']) { const t = L.pistas[id][cul]; if (t) add(id, t.startsWith('\n') ? t : '\n\n' + t); }
    if (depois) {
      for (const id of ['n2', 'n3', 'n4', 'n8', 'n10']) if (N[id]) add(id, '\n\n' + N.carimbo + '\n' + N[id]);
    }
    if (rejogo()) {
      const lidas = lerLidas(), sd = seed(St);
      for (const id of lidas) {
        const n = R.notas.find(x => x.id === id); if (!n || n.onde6 || n.secreta) continue;
        if ((hash(id) ^ sd) % 3 !== 0) continue; // nem toda nota que você releu ganha anotação
        add(id, '\n\n' + L.lapis[(hash(id + 'x') ^ sd) % L.lapis.length]);
      }
    }
    const f = falsa(St); if (f) { if (!P[f.id]) P[f.id] = { suf: '', f: null }; P[f.id].f = f; }
    return P;
  }
  function limparNota(n) {
    const a = n._l6b; if (!a) return;
    if (a.suf) { const i = n.texto.lastIndexOf(a.suf); if (i >= 0) n.texto = n.texto.slice(0, i) + n.texto.slice(i + a.suf.length); }
    if (a.para && n.texto.includes(a.para)) n.texto = n.texto.replace(a.para, a.de);
    n._l6b = null;
  }
  function garantirNotas(St) {
    if (!planos) planos = construirPlanos(St);
    const ids = new Set([...Object.keys(planos), ...[...R.notas, ...R.paginas].filter(n => n._l6b).map(n => n.id)]);
    for (const id of ids) {
      const n = achar(id); if (!n) continue; const p = planos[id];
      if (!p) { limparNota(n); continue; }
      const a = n._l6b;
      if (a && a.sig === (p.suf + '|' + (p.f ? p.f.para : '')) && (!p.suf || n.texto.includes(p.suf)) && (!p.f || n.texto.includes(p.f.para))) continue;
      limparNota(n);
      n._l6b = { suf: p.suf, de: null, para: null, sig: p.suf + '|' + (p.f ? p.f.para : '') };
      if (p.f && n.texto.includes(p.f.de)) { n.texto = n.texto.replace(p.f.de, p.f.para); n._l6b.de = p.f.de; n._l6b.para = p.f.para; }
      if (p.suf && !n.texto.includes(p.suf)) n.texto += p.suf;
    }
    // fitas: uma linha a mais que aponta para o culpado da noite (marcada, para sair sem mexer nas dos outros)
    for (const [fid, tab, quem] of [['f1', L.fitaF1, 'diretor'], ['f2', L.fitaF2, 'celeste']]) {
      const f = R.fitas.find(x => x.id === fid); if (!f || !f.linhas) continue;
      const minha = f.linhas.find(l => l._l6b), quer = (rejogo() && tab) ? tab[culpado(St)] : null;
      if (minha && minha.texto === quer) continue;
      if (minha) f.linhas = f.linhas.filter(l => !l._l6b);
      if (quer) f.linhas.push({ quem, texto: quer, _l6b: true });
    }
  }
  function garantirRegras(St) {
    const T = L.regras || []; if (!T.length || !R.regras) return;
    if (R.regras._l6bBase === undefined) R.regras._l6bBase = R.regras.texto;
    const base = R.regras._l6bBase;
    // tira a nossa cola do verso antes de recolar
    if (R.regras._l6bSuf && R.regras.verso && R.regras.verso.endsWith(R.regras._l6bSuf)) R.regras.verso = R.regras.verso.slice(0, R.regras.verso.length - R.regras._l6bSuf.length);
    R.regras._l6bSuf = '';
    if (!rejogo()) { R.regras.texto = base; return; }
    const r = T[(seed(St) >>> 11) % T.length];
    if (base.includes(r.achar)) {
      R.regras.texto = base.replace(r.achar, '~' + r.achar + '~ (a caneta) ' + r.nova);
      const suf = (L.regraVersoRotulo || '').replace('{original}', r.achar);
      R.regras.verso = (R.regras.verso || '') + suf; R.regras._l6bSuf = suf;
    } else R.regras.texto = base;
  }
  function garantirLapides(St) {
    if (!rejogo() || !R.lapides) return;
    const cul = culpado(St), suf = (L.lapide || {})[cul]; if (!suf) return;
    const alvo = cul === 'albano' ? R.lapides.find(l => l.id === 'albano') : R.lapides.find(l => l.nome === 'IRMÃ CELESTE');
    if (alvo && alvo.epitafio && !alvo.epitafio.includes(suf)) alvo.epitafio += suf;
  }

  // depois do tick do historia-mundo (que reescreve as notas a cada 1,5 s): refaz as nossas por cima, no mesmo quadro
  function posTick() {
    const St = S(); if (!St || St.dead) return;
    try { if (seedRef === seed(St)) { garantirNotas(St); garantirRegras(St); } } catch (e) {}
  }

  // chamados pelo embrulho de mapas (src/historia.js)
  function aoMontarMapa(id) {
    const St = S(); if (!St) return;
    try { if (seedRef !== seed(St)) novaNoite(St); garantirNotas(St); garantirRegras(St); if (id === 'cemiterio') garantirLapides(St); } catch (e) { console.info('[l6b]', e && e.message); }
  }
  // nota nova liberada por condição própria (quatro versões / recado seu)
  function notaLiberada(n) {
    if (!n) return false;
    if (n.l6b === 'quatroVersoes') { const m = mem(); return CULPADOS.every(k => m.vers && m.vers[k]); }
    if (n.l6b === 'bilhete') return !!bilheteDaNoite();
    return true;
  }
  function textoNota(n) {
    if (!n) return '';
    if (n.l6b === 'quatroVersoes') return n.texto;
    if (n.l6b === 'bilhete') { const b = bilheteDaNoite(); if (!b) return n.texto; return L.bilhete.nota.texto.replace('{t}', '“' + b.t + '”').replace('{rodape}', b.k ? L.bilhete.rodapeMexido : ''); }
    return '';
  }

  // ====================================================================================
  // 2. O RECADO PARA A PRÓXIMA LIA (até 40 letras, que a casa vai corrompendo)
  // ====================================================================================
  const limpar = v => String(v || '').replace(/[<>&"`\\]/g, '').replace(/https?:\S*|www\.\S*|@\S*/gi, '').replace(/\s+/g, ' ').trim().slice(0, 40);
  function corromper(t, k) {
    if (!k) return t;
    const ws = t.split(' '), T = L.bilhete.trocas || {};
    const core = w => { const m = w.match(/^([^\p{L}]*)(.*?)([^\p{L}]*)$/u); return m ? [m[1], m[2], m[3]] : ['', w, '']; };
    const idx = ws.map((_, i) => i).sort((a, b) => {
      const ta = T[core(ws[a])[1].toLowerCase()] ? 0 : 1, tb = T[core(ws[b])[1].toLowerCase()] ? 0 : 1;
      return ta - tb || (hash(a + t) - hash(b + t));
    });
    const n = Math.min(k, ws.length);
    for (let i = 0; i < n; i++) {
      const j = idx[i], [p, w, s] = core(ws[j]); const troca = T[w.toLowerCase()] || 'ele';
      const cap = w && w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase();
      ws[j] = p + (cap ? troca[0].toUpperCase() + troca.slice(1) : troca) + s;
    }
    return ws.join(' ');
  }
  function bilheteDaNoite() {
    const m = mem(); if (!m.bil || !m.bil.t) return null;
    if (bilTxt && bilTxt.base === m.bil.t) return bilTxt;
    if (m.bil.noite && m.bil.noite === seedRef) return null;
    const k = Math.max(0, m.bil.n | 0);
    bilTxt = { base: m.bil.t, t: corromper(m.bil.t, k), k }; return bilTxt;
  }
  function guardarBilhete(txt) {
    const t = limpar(txt); if (t.length < 2) return false;
    mudar(m => { m.bil = { t, n: 0, noite: seedRef }; });
    bilTxt = null; return true;
  }
  function blocoBilhete(id) {
    const T = L.bilhete; const box = document.createElement('div'); box.id = id;
    box.style.cssText = 'margin:18px auto 6px;max-width:560px;font-size:14px;opacity:.9';
    const dl = 'l6b-dl-' + id;
    box.innerHTML = `<div style="font-style:italic;color:var(--fraco);margin-bottom:6px">${esc(T.campo)}</div>` +
      `<input type="text" maxlength="40" list="${dl}" placeholder="${esc(T.placeholder)}" autocomplete="off" spellcheck="false" style="font-family:'Special Elite',monospace;font-size:15px;width:min(100%,340px);padding:4px 8px;background:#0006;color:inherit;border:1px solid #fff3">` +
      `<datalist id="${dl}">${T.sugestoes.map(s => `<option value="${esc(s)}">`).join('')}</datalist> ` +
      `<button class="btn" type="button" style="font-size:15px;padding:4px 10px">${esc(T.botao)}</button><div class="l6b-ok" style="min-height:1.4em;font-size:13px;color:var(--fraco)"></div>`;
    const inp = box.querySelector('input'), bt = box.querySelector('button'), ok = box.querySelector('.l6b-ok');
    inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); bt.click(); } });
    inp.addEventListener('keyup', e => e.stopPropagation());
    bt.onclick = () => { if (guardarBilhete(inp.value)) { ok.textContent = T.ok; inp.value = ''; } };
    return box;
  }

  // ====================================================================================
  // 3. AMIGOS: nomes que a casa vai chamar
  // ====================================================================================
  const amigos = () => String(lsGet(AMIGOS_KEY, '') || '').split(/[,;]/).map(s => s.replace(/[<>&"]/g, '').trim().slice(0, 12)).filter(Boolean).slice(0, 5);
  const listaAmigos = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1];
  function injetarTitulo() {
    if (QA) return;
    const nome = $('#o-nome'); if (!nome || $('#l6b-amigos')) return;
    const lab = nome.closest('label') || nome.parentElement; if (!lab || !lab.parentNode) return;
    const T = L.amigos, T2 = L.bilhete;
    const wrap = document.createElement('div'); wrap.id = 'l6b-titulo'; wrap.style.cssText = 'margin-top:6px;display:flex;flex-direction:column;gap:4px;align-items:center';
    wrap.innerHTML = `<label title="Opcional. Fica salvo só neste navegador.">${esc(T.rotulo)} <input type="text" id="l6b-amigos" class="nome" maxlength="64" placeholder="${esc(T.placeholder)}" autocomplete="off" spellcheck="false" style="width:230px"></label>` +
      `<label title="Opcional. Fica salvo só neste navegador.">${esc(T2.campo.replace(' (até 40 letras)', ''))} <input type="text" id="l6b-bil-t" class="nome" maxlength="40" placeholder="${esc(T2.placeholder)}" autocomplete="off" spellcheck="false" style="width:230px"></label>`;
    lab.parentNode.insertBefore(wrap, lab.nextSibling);
    const a = $('#l6b-amigos'), b = $('#l6b-bil-t');
    a.value = String(lsGet(AMIGOS_KEY, '') || '');
    a.addEventListener('input', () => lsSet(AMIGOS_KEY, a.value.replace(/[<>&"]/g, '').slice(0, 64)));
    const m = mem(); if (m.bil && m.bil.t) b.value = m.bil.t;
    b.addEventListener('input', () => { const t = limpar(b.value); if (t.length >= 2) { mudar(mm => { if (!mm.bil || mm.bil.t !== t) mm.bil = { t, n: 0 }; }); bilTxt = null; } });
    for (const el of [a, b]) { el.addEventListener('keydown', e => e.stopPropagation()); el.addEventListener('keyup', e => e.stopPropagation()); }
  }

  // ====================================================================================
  // 4. O PRÓLOGO: uma fila de pequenas coisas que a casa te diz na volta
  // ====================================================================================
  function ausencias(prev, agora) {
    if (!prev) return [];
    const ms = agora - prev, min = ms / 60000, dias = Math.floor(ms / 86400000), out = [];
    if (min >= 0 && min < 10) out.push(['minutos']);
    else if (ms >= 18 * 3600e3 && ms < 40 * 3600e3) out.push(['quente']);
    if (dias >= 3 && dias < 7) out.push(['poeira']);
    if (dias >= 2 && dias < 7) out.push(['demorou', dias]);
    if (dias >= 7 && dias < 60) out.push(['semana', dias]);
    if (dias >= 60) out.push(['meses', dias]);
    return out;
  }
  function estiloDavi(m) { return m.estilo && L.daviEstilo ? L.daviEstilo[m.estilo] : ''; }
  function construirFila() {
    const m = mem(), q = [], A = L.ausencia || {}, agora = Date.now();
    const add = (id, linhas, ao) => q.push({ id, linhas, ao });
    // quanto tempo você ficou fora (o carimbo anterior foi lido em aoComecar)
    for (const [k, n] of (ausenciaPend || [])) if (A[k]) add('aus_' + k, [{ quem: k === 'poeira' || k === 'quente' || k === 'semana' ? 'lia' : 'davi', texto: A[k].replace('{n}', n) }]);
    // o seu recado, na letra do Davi, corrompido a cada noite
    { const b = bilheteDaNoite(); if (b) {
      const linhas = [{ quem: 'davi', texto: L.bilhete.carro.replace('{t}', b.t) }];
      if (b.k === 1) linhas.push({ quem: 'lia', texto: L.bilhete.liaMexido });
      if (b.k >= 2) { linhas.push({ quem: 'lia', texto: L.bilhete.liaMexido2 }); linhas.push({ quem: 'davi', texto: L.bilhete.daviMexido }); }
      add('bil', linhas, () => { mudar(mm => { if (mm.bil) mm.bil.n = Math.min(99, (mm.bil.n | 0) + 1); if (b.k >= 3) { /* três trocas */ } }); if (b.k >= 3) conquista('ninguem_escreveu'); });
    } }
    if (volta() && rejogo()) {
      // Serra FM em sete boletins, um por noite
      const ep = m.radio | 0;
      if (ep < 7) add('radio', [{ quem: 'radio', texto: L.radio.rotulo.replace('{n}', ep + 1) + ' ' + L.radio.boletins[ep] }], () => {
        mudar(mm => { mm.radio = (mm.radio | 0) + 1; if ((mm.radio | 0) >= 7) { mm.radio7 = true; } });
        if (ep === 6) conquista('radio_sete');
      });
      // o Davi sabe a data de hoje
      const d = new Date(), D = L.daviData;
      add('data', [{ quem: 'davi', texto: D.fala.replace('{dia}', D.dias[d.getDay()]).replace('{d}', d.getDate()).replace('{mes}', D.meses[d.getMonth()]).replace('{extra}', D.extra[d.getDay()]) }]);
      // o Davi comenta o seu jeito de jogar na noite anterior
      const ed = estiloDavi(m); if (ed) add('estilo', [{ quem: 'davi', texto: ed }]);
    }
    // calendário de papel do painel do carro
    { const dia = new Date().getDate(), cal = L.calendario || [];
      if (volta() && cal[dia - 1] && (m.calDia !== new Date().toDateString())) {
        const linhas = [{ quem: 'lia', texto: L.calendarioRotulo.replace('{d}', dia) + ' ' + cal[dia - 1] }];
        add('cal', linhas, () => mudar(mm => {
          mm.calDia = new Date().toDateString(); const s = new Set(mm.cal || []); s.add(dia); mm.cal = [...s];
          if (s.size >= 31 && !mm.calFim) { mm.calFim = true; setTimeout(() => { sub('lia', L.calendarioFim); conquista('calendario_cheio'); }, 6500); }
        }));
      } }
    // cartas da mãe da Lia, uma por final visto
    { const cq = conqs(), M2 = L.cartasMae || {}, lidas = m.mae || [];
      const falta = ['comum', 'silencio', 'verdadeiro'].find(k => cq['final_' + k] && !lidas.includes(k));
      if (falta) {
        const linhas = [{ quem: 'mae', texto: M2[falta] }];
        const todas = ['comum', 'silencio', 'verdadeiro'].every(k => k === falta || lidas.includes(k)) && ['comum', 'silencio', 'verdadeiro'].every(k => cq['final_' + k]);
        if (todas) linhas.push({ quem: 'mae', texto: M2.quarta });
        add('mae', linhas, () => { mudar(mm => { mm.mae = [...new Set([...(mm.mae || []), falta])]; }); if (todas) conquista('quatro_paginas_mae'); });
      } }
    // a fita da Lia pequena, na terceira noite
    if ((stats().partidas | 0) >= 3 && !m.liaPeq) add('liapeq', L.liaPequena.map(t => ({ quem: 'lia', texto: t })), () => { mudar(mm => { mm.liaPeq = true; }); conquista('lia_pequena'); });
    // marcos de noite longa
    { const n = noites(), M3 = L.marcos || {}, vistos = m.marcos || [];
      const k = n >= 100 ? 100 : n >= 50 ? 50 : n >= 30 ? 30 : 0;
      if (k && !vistos.includes(k) && k !== 50) add('marco' + k, [{ quem: 'lia', texto: M3[k] }], () => mudar(mm => { mm.marcos = [...new Set([...(mm.marcos || []), k])]; })); }
    fila = q;
  }
  let ausenciaPend = [];

  // ====================================================================================
  // 5. TICK
  // ====================================================================================
  function tick(dt) {
    const St = S(); if (!St || St.dead || c.mode !== 'jogo') return;
    const d = Number(dt) || 0, P = c.P, M = c.M, W = c.W, mapa = W && W.mapa;
    if (St !== stRef) { stRef = St; }
    if (seedRef !== seed(St)) novaNoite(St);
    const cap = St.chapter | 0, capT = St.capT || 0;
    acc.t += d; if (St.hidden) acc.hid += d; try { acc.noise += (P.noiseR || 0) * d; } catch (e) {}

    // textos de nota, fita e página: garantidos de tempos em tempos (outros módulos também reescrevem)
    notaT -= d;
    if (notaT <= 0) { notaT = 1.5; acompanhar(St); }

    // ---- prólogo: a fila de pequenas coisas da volta (começa depois do que já existe)
    if (mapa === 'estrada' && fila.length && capT > 22 && capT >= filaT) {
      const it = fila.shift(); let fim = 0;
      try { if (it.ao) it.ao(); } catch (e) {}
      fim = tocar(it.linhas, 0);
      filaT = capT + fim / 1000 + 4;
      if (fila.length > 5) fila.length = 5;
    }

    if (!volta()) return;

    // ---- a Lia anterior morreu aqui: testemunhos na parede
    if (P && P.room && P.room !== ultSala) {
      ultSala = P.room; entrouSala(St, mapa, P.room, cap);
    }
    // ---- três versões do incêndio, uma por noite (o eco de um dos três, no térreo)
    if (rejogo() && mapa === 'terreo' && cap >= 1 && capT > 60 && !St.hidden && (!M || M.state !== 'caca') && um('versao')) versaoDaNoite(St);

    // ---- o Inspetor cansado, na cinquentésima noite
    if (mapa === 'terreo' && capT > 6 && noites() >= 50 && noites() < 100 && um('m50')) {
      const m = mem(); if (!(m.marcos || []).includes(50)) { mudar(mm => { mm.marcos = [...new Set([...(mm.marcos || []), 50])]; }); quando(2500, () => sub('inspetor', L.marcos[50])); }
    }
    // ---- cartas do Moacir, uma por capítulo (depois do final verdadeiro)
    if (fezVerdadeiro() && cap >= 1 && cap <= 5 && capT > 7 && cartaMoacirCap !== cap) {
      cartaMoacirCap = cap;
      const C = L.cartasMoacir, i = cap - 1;
      if (C && C.textos[i] && um('carta' + cap)) {
        quando(4200, () => { sub('moacir', C.rotulo.replace('{n}', cap)); quando(dur(C.rotulo) + 400, () => sub('moacir', C.textos[i])); });
        const m = mem(); const s = new Set(m.cartas || []); s.add(cap); mudar(mm => { mm.cartas = [...s]; });
        if (s.size >= 5) conquista('o_enfermeiro');
      }
    }
    // ---- recepção: cartão do livro de visitantes (um por noite concluída)
    if (mapa === 'terreo' && P && P.room && P.room.id === 'hall' && capT > 8 && um('visit')) {
      const conc = Math.min(12, (stats().concluidas | 0)), V = L.visitantes;
      if (conc >= 1 && V) {
        const m = mem(); let i;
        if ((m.visN | 0) !== conc) { i = conc - 1; mudar(mm => { mm.visN = conc; }); } else i = Math.random() * conc | 0;
        const [nome, ano, fr] = V.cartoes[i];
        quando(2800, () => sub('lia', V.rotulo.replace('{nome}', nome).replace('{ano}', ano) + fr));
      }
    }
    // ---- a chamada de 1979 inclui os nomes dos seus amigos
    if (mapa === 'terreo' && capT > 30 && M && M.state === 'patrulha' && um('chamAm')) {
      const am = amigos();
      if (am.length) { try { const dx = P.pos.x - M.pos.x, dz = P.pos.z - M.pos.z; if (Math.hypot(dx, dz) < 16) sub('inspetor', L.amigos.chamada.replace('{nomes}', listaAmigos(am))); else feito.delete('chamAm'); } catch (e) {} }
    }
    // ---- o tom da Lia muda com os finais que você viu
    lia_t -= d;
    if (lia_t <= 0 && mapa !== 'estrada') {
      lia_t = 85 + Math.random() * 60;
      const nf = nFinais();
      if (nf >= 1 && !St.hidden && (!M || M.state === 'patrulha' || !M.ativo)) sub('lia', pick(L.tomLia[Math.min(3, nf)]));
    }
    // ---- as regras do papel foram mexidas: a Lia percebe quando você as relê
    if (!regraVista && rejogo() && c.ui === 'nota') {
      try {
        const h2 = $('#note h2');
        if (h2 && R.regras && h2.textContent.indexOf(R.regras.titulo) === 0) {
          regraVista = true; const r = (L.regras || [])[(seed(St) >>> 11) % (L.regras || [1]).length];
          if (r) { quando(1500, () => sub('lia', r.lia)); conquista('letra_outra_mao'); }
        }
      } catch (e) {}
    }
    // ---- 3 mortes no mesmo capítulo: o papel dobrado no bolso (entregue logo depois do recomeço)
    if (pend3 && capT > 1.2) {
      const p = pend3; pend3 = null; entregarTresMortes(St, p);
    }
    // ---- o recado seu, relido no mundo
    if (St.notes && St.notes.n6i) { const b = bilheteDaNoite(); if (b && b.k >= 3 && um('ninguem')) conquista('ninguem_escreveu'); }
  }

  // relíquias do Inspetor e notas lidas, guardadas entre noites
  function acompanhar(St) {
    if (!St || !St.flags) return;
    const m = mem(); let mud = false;
    const rel = m.rel || {};
    if (St.flags.ms_apito && !rel.apito) { rel.apito = 1; mud = true; }
    if (St.flags.sl_cracha && !rel.cracha) { rel.cracha = 1; mud = true; }
    if (St.flags.sl_lampApagada && !rel.lamp) { rel.lamp = 1; mud = true; }
    const lidas = new Set(m.lidas || []);
    for (const k of Object.keys(St.notes || {})) if (/^n\d+$/.test(k) && St.notes[k] && !lidas.has(k)) { lidas.add(k); mud = true; }
    if (mud) { m.rel = rel; m.lidas = [...lidas].slice(-60); salvar(m); }
  }

  // ====================================================================================
  // 6. MORTES: testemunhos, papel dobrado, recado
  // ====================================================================================
  const kindDe = q => (q === 'ana' ? 'ana' : q === 'procissao' ? 'procissao' : 'inspetor');
  function aoMorte(quem) {
    const St = S(); if (!St) return;
    try {
      const P = c.P, W = c.W, cap = St.chapter | 0, sala = P && P.room;
      const rec = { m: W && W.mapa, r: sala && sala.id, n: sala && sala.nome, c: cap, k: kindDe(quem), s: seedRef, min: Math.max(1, Math.round((St.tempo || 0) / 60)) };
      const mm = mem(); const lista = Array.isArray(mm.mortes) ? mm.mortes : [];
      if (rec.r && !lista.some(x => x.m === rec.m && x.r === rec.r && x.k === rec.k)) { lista.push(rec); mm.mortes = lista.slice(-24); salvar(mm); }
      mortesCap[cap] = (mortesCap[cap] | 0) + 1;
      if (mortesCap[cap] >= 3 && !feito.has('t3_' + cap)) { feito.add('t3_' + cap); pend3 = { cap, k: rec.k, sala: rec.n || 'esta sala' }; }
      if (!QA) setTimeout(() => { try { const r = $('#dt-retry'); if (!r) return; let b = $('#l6b-bil-m'); if (!b) { r.parentNode.insertBefore(blocoBilhete('l6b-bil-m'), r); return; } const i = b.querySelector('input'); if (i) i.value = ''; const o = b.querySelector('.l6b-ok'); if (o) o.textContent = ''; } catch (e) {} }, 30);
    } catch (e) {}
  }
  function entregarTresMortes(St, p) {
    const T = L.trêsMortes; if (!T) return;
    const verdade = (((seed(St) >>> (p.cap + 5)) % 3) !== 0);
    const sala = String(p.sala || 'esta sala').toLowerCase();
    const frase = (verdade ? T[p.k] : T.falso[p.k]).replace('{sala}', sala);
    quando(1400, () => {
      sub('lia', T.papel + ' ' + frase);
      quando(dur(frase) + 900, () => sub('lia', verdade ? T.liaVerdade : T.liaFalsa));
    });
  }
  function entrouSala(St, mapa, sala, cap) {
    const m = mem(); const rec = (m.mortes || []).filter(x => x.m === mapa && x.r === sala.id && x.s !== seedRef).pop();
    if (!rec || (tcap[cap] | 0) >= 2 || !um('tm_' + mapa + sala.id)) return;
    tcap[cap] = (tcap[cap] | 0) + 1;
    const T = L.testemunho, linhas = T[rec.k] || T.geral;
    const txt = (Math.random() < 0.35 ? pick(T.geral) : pick(linhas)).replace('{min}', rec.min);
    quando(1300, () => {
      sub('lia', txt);
      if (rec.min) quando(dur(txt) + 200, () => sub('lia', T.hora.replace('{min}', rec.min)));
      const mm = mem(); mm.testem = (mm.testem | 0) + 1; salvar(mm);
      if (mm.testem >= 5) conquista('letra_tremida');
    });
  }

  // ====================================================================================
  // 7. AS TRÊS VERSÕES DO INCÊNDIO
  // ====================================================================================
  function versaoDaNoite(St) {
    const m = mem(), vers = m.vers || {};
    const faltam = CULPADOS.filter(k => !vers[k]);
    const quem = faltam.length ? faltam[(noites()) % faltam.length] : CULPADOS[(noites()) % 3];
    const V = L.versoes[quem]; if (!V) return;
    const pers = quem === 'albano' ? 'diretor' : quem;
    quando(2500, () => {
      const linhas = V.map(t => ({ quem: pers, texto: t }));
      const fim = tocar(linhas, 0);
      mudar(mm => { mm.vers = mm.vers || {}; mm.vers[quem] = 1; });
      const mm = mem(), n = CULPADOS.filter(k => mm.vers && mm.vers[k]).length;
      if (n === 2) quando(fim + 1200, () => sub('davi', L.versaoDavi));
      if (n === 3) quando(fim + 1200, () => { toast(L.versaoToast); });
    });
  }

  // ====================================================================================
  // 8. FINAIS ALTERNATIVOS NO PORTÃO
  // ====================================================================================
  const reliquiasTodas = () => { const r = mem().rel || {}; return !!(r.apito && r.cracha && r.lamp); };
  function altDisponiveis() {
    const St = S(); if (!St || !St.flags) return [];
    const out = [], f = St.flags, cq = conqs();
    const todos = nFinais() >= 3;
    if (f.ms_apito && f.ms_ombro != null && f.sl_cracha) out.push('comNome');
    if (todos && f.ms_apito) out.push('substituta');
    if ((f.respondeu | 0) >= 3 && St.done && St.done.ana) out.push('quartaFila');
    if (todos && reliquiasTodas()) out.push('horaCompartilhada');
    return out;
  }
  const temAlt = () => { try { return altDisponiveis().length > 0; } catch (e) { return false; } };
  function finalAlt() {
    const St = S(); const k = St && St.flags && St.flags.l6bAlt; if (!k) return null;
    const F = L.finais[k]; if (!F) return null;
    return { id: k, titulo: F.titulo, texto: F.texto };
  }
  let esIrOrig = null;
  function irFinal(base) {
    const es = $('#escolha'); if (es) es.hidden = true;
    const J = window.__jogo;
    if (J && J.finalizar) J.finalizar(base);
    else { const b = $(base === 'verdadeiro' ? '#es-voltar' : '#es-ir'); if (b) b.click(); }
  }
  function montarEscolha() {
    const es = $('#escolha'); if (!es || es.hidden) return;
    for (const b of es.querySelectorAll('[id^="l6b-es-"]')) b.remove();
    const St = S(); if (!St) return;
    let atitudesOk = true; try { atitudesOk = h.atitudesOk ? h.atitudesOk() : true; } catch (e) {}
    const ir = $('#es-ir'), voltar = $('#es-voltar'); if (!ir || !voltar) return;
    if (esIrOrig === null) esIrOrig = ir.onclick;
    const alts = altDisponiveis();
    if (!atitudesOk) {
      // chegou aqui só por causa de uma saída da volta: o "voltar pelo Davi" não é dela
      voltar.hidden = true; ir.onclick = () => irFinal('comum');
    } else { voltar.hidden = false; if (esIrOrig) ir.onclick = esIrOrig; }
    let ancora = voltar.hidden ? ir : voltar;
    for (const k of alts) {
      const F = L.finais[k]; const b = document.createElement('button'); b.className = 'btn'; b.id = 'l6b-es-' + k; b.textContent = F.botao;
      b.onclick = () => { St.flags.l6bAlt = k; irFinal(F.base); };
      ancora.insertAdjacentElement('afterend', b); ancora = b;
    }
  }
  function observarEscolha() {
    const es = $('#escolha'); if (!es || es._l6b) return; es._l6b = true;
    new MutationObserver(() => { if (!es.hidden) { try { montarEscolha(); } catch (e) { console.info('[l6b]', e && e.message); } } }).observe(es, { attributes: true, attributeFilter: ['hidden'] });
  }

  // ====================================================================================
  // 9. FINAL: epílogos por estilo, culpado, amigos, mentira, acusação, créditos
  // ====================================================================================
  function arquetipo(St) {
    const lore = Object.keys(St.notes || {}).length + Object.keys(St.fitas || {}).length;
    if ((St.mortes | 0) >= 10) return 'sobrevivente';
    if ((St.correu | 0) >= 150 || (St.tempo || 0) < 45 * 60) return 'corredora';
    if (lore >= 22) return 'exploradora';
    if (acc.hid >= 180) return 'escondida';
    return (St.mortes | 0) <= 2 ? 'furtiva' : 'escondida';
  }
  function extrasFinal(tipo) {
    const St = S(); if (!St) return '';
    const out = [];
    try {
      if (noites() > 1) {
        const cul = culpado(St); if (L.finalCulpa[cul]) out.push(L.finalCulpa[cul]);
        const f = falsa(St);
        if (f) { const n = achar(f.id); out.push(L.mentiraFim.replace('{titulo}', n ? n.titulo : f.id).replace('{falso}', f.para).replace('{certo}', f.certo) + (St.notes && St.notes[f.id] ? '' : L.mentiraNaoLeu)); }
      }
      const m = mem();
      if (tipo === 'verdadeiro' && m.radio7) out.push(L.radio.final);
      const arq = arquetipo(St), E = L.estilo;
      if (E[arq]) { out.push(E[arq].join(' ')); if (m.arq === arq) out.push(E.repetiu); }
      const seg = St.tempo || 0, ceu = seg < 25 * 60 ? 0 : seg < 50 * 60 ? 1 : 2;
      out.push(E.ceu[ceu] + ' ' + E.giz.replace('{t}', fmtT(seg)));
      const am = amigos(); if (am.length) out.push(L.amigos.jornal.replace('{nomes}', listaAmigos(am)));
      // guarda para a próxima noite o jeito de jogar (e o estilo do Davi)
      mudar(mm => { mm.arq = arq; mm.estilo = seg < 30 * 60 ? 'apressada' : (acc.t > 30 && acc.noise / acc.t > 8) ? 'destruidora' : 'discreta'; });
    } catch (e) { console.info('[l6b]', e && e.message); }
    return out.length ? '\n\n' + out.join('\n\n') : '';
  }
  function aoFinal(tipo) {
    const St = S(); if (!St) return;
    try {
      const k = St.flags && St.flags.l6bAlt;
      if (k) {
        const id = { comNome: 'final_comnome', substituta: 'final_substituta', quartaFila: 'final_quartafila', horaCompartilhada: 'final_horacomp' }[k];
        if (id) conquista(id);
        mudar(m => { m.alt = k; });
      }
      // a acusação e o recado, só no ecrã de verdade (não no QA)
      if (!QA) iniciarAcusacao(tipo, St);
    } catch (e) {}
  }
  let vigiaAc = 0;
  function iniciarAcusacao(tipo, St) {
    clearInterval(vigiaAc); let t0 = 0;
    vigiaAc = setInterval(() => {
      const en = $('#ending'); if (!en) return clearInterval(vigiaAc);
      if (en.hidden) { if (t0) clearInterval(vigiaAc); return; }
      if (!t0) t0 = performance.now();
      const pars = $('#e-txt') ? $('#e-txt').querySelectorAll('.par').length : 4;
      if (performance.now() - t0 < pars * 1400 + 2200) return;
      clearInterval(vigiaAc);
      try { montarAcusacao(St); } catch (e) { console.info('[l6b]', e && e.message); }
    }, 600);
  }
  function montarAcusacao(St) {
    const en = $('#ending'); if (!en) return;
    for (const x of en.querySelectorAll('#l6b-acusa,#l6b-bil-e')) x.remove();
    const alvo = $('#e-stats') || $('#e-menu'); if (!alvo) return;
    const T = L.acusa, cul = culpado(St);
    if (noites() > 1) {
      const lidas = ['n2', 'n8', 'n10', 'p4', 'f1', 'f2'].filter(id => (St.notes && St.notes[id]) || (St.fitas && St.fitas[id]));
      const nomes = lidas.map(id => { const n = achar(id) || R.fitas.find(x => x.id === id); return n ? n.titulo.replace(/^Fita \d — /, '') : id; });
      const box = document.createElement('div'); box.id = 'l6b-acusa'; box.style.cssText = 'margin:20px auto;max-width:620px;font-size:15px';
      box.innerHTML = `<div style="font-family:'IM Fell English SC',Georgia,serif;font-size:22px;letter-spacing:.1em;margin-bottom:6px">${esc(T.titulo)}</div>` +
        `<div style="font-style:italic;color:var(--fraco);margin-bottom:8px">${esc(T.intro)}</div>` +
        `<div style="font-size:13px;color:var(--fraco);margin-bottom:10px">${esc(T.pistas)} ${nomes.length ? esc(nomes.join(' · ')) : esc(T.nenhuma)}</div>` +
        `<div class="l6b-bts">${CULPADOS.map(k => `<button class="btn" type="button" data-k="${k}">${esc(L.culpados[k].nome[0].toUpperCase() + L.culpados[k].nome.slice(1))}</button>`).join(' ')}</div><div class="l6b-res" style="margin-top:10px;white-space:pre-line;min-height:2em"></div>`;
      alvo.parentNode.insertBefore(box, alvo);
      box.querySelectorAll('button').forEach(b => b.onclick = () => {
        const k = b.dataset.k; box.querySelectorAll('button').forEach(x => x.disabled = true);
        const res = box.querySelector('.l6b-res');
        const nm = L.culpados[k];
        if (k === cul) {
          res.textContent = T.certo.lia + ' ' + T.certo[cul];
          conquista('detetive');
          const m = mudar(mm => { mm.acertos = [...new Set([...(mm.acertos || []), cul])]; });
          if (CULPADOS.every(x => (m.acertos || []).includes(x)) && !m.tresNomes) { mudar(mm => { mm.tresNomes = true; }); conquista('tres_nomes'); res.textContent += '\n\n' + T.secreto; }
        } else {
          res.textContent = T.errado.map(t => t.replace(/\{nome\}/g, nm.curto).replace('{art}', nm.art)).join('\n');
        }
      });
    }
    const bl = blocoBilhete('l6b-bil-e'); alvo.parentNode.insertBefore(bl, alvo);
  }

  // ====================================================================================
  // 10. DEPOIS DOS CRÉDITOS
  // ====================================================================================
  let posVigia = 0;
  function vigiarCreditos() {
    if (QA) return;
    clearInterval(posVigia);
    posVigia = setInterval(() => {
      const pos = document.querySelector('#h3-cred .h3-pos.on');
      if (!pos || pos._l6b) return;
      pos._l6b = true;
      setTimeout(() => {
        try {
          if (!document.body.contains(pos)) return;
          const T = L.posCreditos, m = mem(), vistas = new Set(m.pos || []);
          let txt, oitava = false;
          const falta = T.cenas.map((_, i) => i).filter(i => !vistas.has(i));
          if (falta.length) { const i = pick(falta); vistas.add(i); txt = T.cenas[i].replace('{hoje}', new Date().toLocaleDateString('pt-BR')); }
          else { txt = T.oitava; oitava = true; }
          mudar(mm => { mm.pos = [...vistas]; });
          const p = document.createElement('p'); p.className = 'rub'; p.style.cssText = 'margin-top:28px;opacity:0;transition:opacity 2.5s;font-style:italic';
          p.textContent = T.rubrica + ' ' + txt; pos.appendChild(p);
          requestAnimationFrame(() => { p.style.opacity = '.85'; });
          if (oitava || vistas.size >= 7) conquista('depois_creditos');
        } catch (e) {}
      }, 14000);
    }, 1200);
  }

  // ====================================================================================
  // 11. TÍTULO, CHAMADO E COMEÇO DA NOITE
  // ====================================================================================
  function titulo() {
    try {
      injetarTitulo();
      const m = mem(), s = $('#t-sub');
      if (m.alt && L.subtitulosAlt[m.alt] && s && !document.body.classList.contains('nove') && !document.body.classList.contains('fita-gasta')) s.textContent = L.subtitulosAlt[m.alt];
    } catch (e) {}
  }
  function chamado() {
    const am = amigos(); if (!am.length || Math.random() > 0.3) return null;
    return pick(L.amigos.chamado).replace(/\{nome\}/g, pick(am));
  }
  function aoComecar(St) {
    try {
      resets.forEach(r => r()); memC = null; seed(St);
      const m = mem(), agora = Date.now();
      ausenciaPend = ausencias(m.ult, agora);
      m.ult = agora; salvar(m);
      novaNoite(St); stRef = St;
    } catch (e) { console.info('[l6b]', e && e.message); }
  }

  // ===== inicialização =====
  try { observarEscolha(); vigiarCreditos(); } catch (e) {}

  const api = { tick, posTick, aoComecar, aoMorte, aoFinal, extrasFinal, titulo, chamado, aoMontarMapa, notaLiberada, textoNota,
    finalAlt, temAlt, altDisponiveis, culpado, seed, rejogo, corromper, guardarBilhete, amigos, noites,
    _dbg: () => ({ planos, seedRef, rej: rejogo(), n: noites(), ver: fezVerdadeiro() }) };
  window.__hist6b = api; // para o kit de teste
  return api;
}
