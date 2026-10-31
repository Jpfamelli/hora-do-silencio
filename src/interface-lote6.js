// INTERFACE — lote 6: rejogabilidade. Semente livre, repetir a mesma noite, central de modos e desafios,
// recordes por capítulo, placar de amigos por código, cartela de emojis compartilhável, histórico de noites,
// mapa de mortes por capítulo, próxima meta e resumo de rejogo no título.
// Criado por src/interface.js (criarInterfaceLote6(C, U)); os ganchos são chamados por lá, sempre em try/catch.
export function criarInterfaceLote6(C, U) {
  const $ = s => document.querySelector(s);
  const R = C.R, OPT = C.OPT;
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mmss = s => `${Math.floor(s / 60)}min ${String(Math.floor(s % 60)).padStart(2, '0')}s`;
  const relc = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const relp = s => `${relc(s)}.${String(Math.floor(s * 100 % 100)).padStart(2, '0')}`;
  const lsGet = C.lsGet, lsSet = C.lsSet;
  const CAPS = C.CAPS_KEY, SAVE = C.SAVE_KEY, CONQ = 'hora-silencio-v2-conq', STATS = 'hora-silencio-stats';
  const NOITES_K = 'hora-silencio-l6-noites', MORTES_K = 'hora-silencio-l6-mortes', LAST_K = 'hora-silencio-l6-ultima', AMIGOS_K = 'hora-silencio-l6-amigos';
  const DIF_LETRA = { facil: 'F', normal: 'N', pesadelo: 'P' };
  const MOD_LETRA = { pilha: 'P', ouvido: 'O', passos: 'A', aviso: 'V' };
  const caps = () => R.capitulos;
  const curto = c => c.titulo.split(' — ')[0].replace('Prólogo', 'Prólogo');
  const conqs = () => lsGet(CONQ, {});
  const stats = () => lsGet(STATS, {});
  const regs = () => lsGet(CAPS, {});

  // ---------------------------------------------------------------- opções novas
  const PAD6 = { cronPrec: false, metaTitulo: true, fantasmaPB: false };
  for (const k in PAD6) { if (OPT[k] === undefined) OPT[k] = PAD6[k]; U.PAD[k] = PAD6[k]; }
  let grInterface = U.GRUPOS.find(g => g[0] === 'Interface');
  if (grInterface) grInterface[1].push(
    { k: 'cronPrec', nome: 'Cronômetro de precisão (centésimos, para gravar)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] },
    { k: 'metaTitulo', nome: 'Mostrar a próxima meta no título', tipo: 'sel', ops: [[true, 'Sim'], [false, 'Não']] },
    { k: 'fantasmaPB', nome: 'Comparar cada objetivo com o seu recorde (verde/vermelho)', tipo: 'sel', ops: [[false, 'Não'], [true, 'Sim']] }
  );

  // ---------------------------------------------------------------- semente livre
  // transforma qualquer palavra/frase num código de 6 caracteres válido (0-9A-Z)
  function hashSemente(txt) {
    const s = String(txt || '').trim().toUpperCase();
    if (!s) return '';
    // se já é um código puro de 4 a 7 caracteres, usa como está
    if (/^[0-9A-Z]{4,7}$/.test(s)) return s;
    let h = 2166136261 >>> 0;
    for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
    return (((h % 2176782334) + 1) >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
  }
  function novaSementeAleatoria() { return Math.floor(Math.random() * 2176782335 + 1).toString(36).toUpperCase().padStart(6, '0'); }
  // semente do dia: mesma para todo mundo no mesmo dia
  function sementeDoDia() {
    const d = new Date(), base = d.getUTCFullYear() * 384 + d.getUTCMonth() * 32 + d.getUTCDate();
    return hashSemente('DIA' + base);
  }
  // escreve a semente no campo de desafio que o motor já lê ao começar
  function aplicarSemente(sem, dif) {
    const inp = $('#o-desafio'); if (!inp) return;
    inp.value = dif ? `${sem}-${DIF_LETRA[dif] || 'N'}` : sem;
    const ds = $('#o-dif'); if (dif && ds) { ds.value = dif; ds.dispatchEvent(new Event('change')); }
    atualizarTitulo();
  }

  // ---------------------------------------------------------------- título: campo de semente, dado, meta
  function montarTitulo() {
    const ex = $('#t-extras'); if (!ex || $('#l6-semente')) return;
    const lab = document.createElement('label');
    lab.title = 'Digite QUALQUER palavra (PIZZA, ESCOLA, o nome de um amigo) e todo mundo que digitar a mesma joga a MESMA noite.';
    lab.innerHTML = 'Semente <input type="text" id="l6-semente" maxlength="18" placeholder="uma palavra" spellcheck="false" autocomplete="off" style="width:120px">';
    const dado = document.createElement('button'); dado.type = 'button'; dado.id = 'l6-dado'; dado.className = 'l6-mini'; dado.textContent = '⚄'; dado.title = 'Sortear uma semente nova';
    const cop = document.createElement('button'); cop.type = 'button'; cop.id = 'l6-copsem'; cop.className = 'l6-mini'; cop.textContent = 'copiar'; cop.title = 'Copiar o código desta noite para mandar a um amigo';
    lab.appendChild(dado); lab.appendChild(cop);
    ex.appendChild(lab);
    const inp = lab.querySelector('#l6-semente');
    inp.addEventListener('input', () => { const d = $('#o-desafio'); if (d) d.value = hashSemente(inp.value); atualizarTitulo(); });
    dado.onclick = () => { inp.value = novaSementeAleatoria(); const d = $('#o-desafio'); if (d) d.value = inp.value; atualizarTitulo(); };
    cop.onclick = async () => { const d = $('#o-desafio'); const v = (d && d.value) || hashSemente(inp.value) || sementeDoDia(); cop.textContent = (await copiar(v)) ? 'copiado!' : v; setTimeout(() => cop.textContent = 'copiar', 1800); };

    // botão da semente do dia, dentro do grupo de extras
    const hoje = document.createElement('button'); hoje.type = 'button'; hoje.id = 'l6-hoje'; hoje.className = 'l6-mini'; hoje.textContent = 'Noite de hoje';
    hoje.title = 'A mesma noite para todo mundo hoje. Compare o tempo com os amigos.';
    hoje.onclick = () => { inp.value = sementeDoDia(); const d = $('#o-desafio'); if (d) d.value = inp.value; atualizarTitulo(); C.toast && C.toast('Semente de hoje: ' + inp.value + '. Todo mundo que jogar hoje pega a mesma noite.'); };
    lab.appendChild(hoje);
    inp.addEventListener('focus', () => { U.subTitulo && U.subTitulo('Uma palavra qualquer vira uma noite. Mande a mesma a um amigo.'); });
    const hint = document.createElement('div'); hint.id = 'l6-sem-hoje'; hint.textContent = 'semente de hoje: ' + sementeDoDia(); lab.after(hint);

    // botão "repetir a última noite" e linha da próxima meta/rejogo
    const menu = $('#title .menu');
    if (menu && !$('#l6-repetir')) {
      const b = document.createElement('button'); b.className = 'btn'; b.id = 'l6-repetir'; b.textContent = 'Repetir a última noite';
      b.onclick = () => repetir(lsGet(LAST_K, null));
      menu.appendChild(b);
    }
    const sub = $('#t-memoria');
    if (sub && !$('#l6-meta')) {
      const m = document.createElement('div'); m.id = 'l6-meta'; m.className = 'l6-meta'; sub.after(m);
    }
    atualizarTitulo();
  }

  let metaIdx = 0, metaT = 0;
  function proximasMetas() {
    const c = conqs();
    return (R.conquistas || []).filter(x => !c[x.id]).map(x => {
      if (x.secreta || x.segredo) return x.dica ? 'Um segredo guardado: ' + x.dica : null;
      return x.nome + ' — ' + x.desc;
    }).filter(Boolean);
  }
  function resumoRejogo() {
    const s = stats(), nf = Object.keys(s.finais || {}).length, totF = (R.finais ? Object.keys(R.finais).length : 5);
    const c = conqs(), feitas = (R.conquistas || []).filter(x => c[x.id]).length, totC = (R.conquistas || []).length;
    const partes = [];
    if (totF - nf > 0) partes.push(`${totF - nf} ${totF - nf === 1 ? 'final que você ainda não viu' : 'finais que você ainda não viu'}`);
    if (totC - feitas > 0) partes.push(`${totC - feitas} conquistas a destravar`);
    return partes.join(' · ');
  }
  function atualizarMeta() {
    const el = $('#l6-meta'); if (!el) return;
    if (!OPT.metaTitulo) { el.textContent = ''; return; }
    const metas = proximasMetas();
    if (!metas.length) { el.textContent = resumoRejogo() || ''; return; }
    el.innerHTML = `<span class="rot">próxima meta</span> ${esc(metas[metaIdx % metas.length])}`;
  }

  function atualizarTitulo() {
    const inp = $('#l6-semente'), d = $('#o-desafio');
    // reflete no campo de semente o código escrito à mão (só quando o jogador não está digitando)
    if (inp && document.activeElement !== inp && d && d.value && /^[0-9A-Z]{4,7}$/.test(d.value.trim().toUpperCase()) && inp.value !== d.value) inp.placeholder = d.value;
    atualizarMeta();
  }

  // ---------------------------------------------------------------- repetir a mesma noite
  function repetir(cfg) {
    if (!cfg || !cfg.sem) { C.toast && C.toast('Nenhuma noite para repetir ainda. Jogue uma e o jogo guarda a semente.'); return; }
    const inp = $('#l6-semente'); if (inp) inp.value = cfg.sem;
    const d = $('#o-desafio'); if (d) d.value = `${cfg.sem}-${DIF_LETRA[cfg.dif] || 'N'}${(cfg.mods || []).map(m => MOD_LETRA[m] || '').join('')}`;
    const ds = $('#o-dif'); if (ds && cfg.dif) { ds.value = cfg.dif; ds.dispatchEvent(new Event('change')); }
    const uv = $('#o-umavida'); if (uv) uv.checked = !!cfg.umaVida;
    C.toast && C.toast('Mesma noite: semente ' + cfg.sem + '.');
    const b = $('#b-novo'); if (b) b.click();
  }
  // "De novo, igual" nas telas de morte e final: volta ao menu e recomeça a MESMA noite
  function deNovoViaMenu(botaoMenu) {
    const cfg = lsGet(LAST_K, null); if (!cfg) return;
    const bm = $(botaoMenu); if (bm) bm.click();
    setTimeout(() => repetir(cfg), 90);
  }

  // ---------------------------------------------------------------- tela genérica #l6
  let voltaDe = '#title';
  function abrir(titulo, html, de) {
    voltaDe = de || '#title';
    const scr = $('#l6'); if (!scr) return;
    $('#l6-tit').textContent = titulo;
    $('#l6-corpo').innerHTML = html;
    $(voltaDe) && ($(voltaDe).hidden = true);
    scr.hidden = false;
    U.focar && U.focar('#l6');
    return $('#l6-corpo');
  }
  function fechar() { const scr = $('#l6'); if (!scr) return; scr.hidden = true; $(voltaDe) && ($(voltaDe).hidden = false); U.focar && U.focar(voltaDe); }

  // ---------------------------------------------------------------- RECORDES
  function viewRecordes() {
    const r = regs(), s = stats();
    let total = 0, temTotal = true;
    let linhas = caps().map(c => {
      const reg = r[c.id] || {};
      if (reg.tempo) total += reg.tempo; else temTotal = false;
      const rk = reg.rank || '—';
      const sp = reg.splits || {};
      const objs = (c.objetivos || []).filter(o => sp[o.id] != null);
      const splitH = objs.length ? `<div class="l6-splits">${objs.map(o => `<span>${esc((o.texto || o.id).replace(/\s*\(\{n\}\/\d\)/, '').slice(0, 26))}: <b>${relp(sp[o.id])}</b></span>`).join('')}</div>` : '';
      return `<div class="l6-rec"><div class="l6-rec-h"><b>${esc(curto(c))}</b><span class="rk rk-${rk}">${rk}</span></div>`
        + `<div class="l6-rec-t">${reg.tempo ? 'melhor tempo ' + mmss(reg.tempo) : 'ainda sem recorde'}${reg.mortes != null ? ' · menos mortes ' + reg.mortes : ''}</div>${splitH}</div>`;
    }).join('');
    const perfeita = (s.capsS || 0);
    const noites = lsGet(NOITES_K, []).filter(n => n.final);
    const gelo = noites.length ? Math.min(...noites.map(n => n.mortes)) : null;
    const nf = Object.keys(s.finais || {}).length, totF = (R.finais ? Object.keys(R.finais).length : 5);
    const topo = `<div class="l6-topo">Melhor tempo somado: <b>${temTotal ? mmss(total) : '— (termine cada capítulo uma vez)'}</b>`
      + ` · capítulos com rank S: <b>${perfeita}</b> · finais vistos: <b>${nf}/${totF}</b>`
      + (gelo != null ? ` · coração de gelo (menos mortes numa noite): <b>${gelo}</b>` : '')
      + ` · partidas: <b>${s.partidas || 0}</b> · noites concluídas: <b>${s.concluidas || 0}</b></div>`;
    abrir('Caderno de Recordes', topo + linhas + `<div class="l6-foot"><button class="btn" id="l6-rec-cop">Copiar os recordes</button></div>`, '#title');
    const cp = $('#l6-rec-cop'); if (cp) cp.onclick = async () => {
      const t = 'A HORA DO SILÊNCIO — meus recordes\n' + caps().map(c => { const reg = r[c.id] || {}; return `${curto(c)}: ${reg.rank || '-'}${reg.tempo ? ' em ' + mmss(reg.tempo) : ''}`; }).join('\n');
      cp.textContent = (await copiar(t)) ? 'Copiado!' : 'Não deu'; setTimeout(() => cp.textContent = 'Copiar os recordes', 1800);
    };
  }

  // ---------------------------------------------------------------- MODOS E DESAFIOS
  const MODOS = [
    { n: 'Uma Vida', d: 'Morrer encerra a noite. Sem segunda chance.', como: 'Marque "Uma Vida" no título antes de começar (precisa ter visto um final).', lib: () => !$('#l-umavida') || !$('#l-umavida').hidden },
    { n: 'Contra o relógio', d: 'Cronômetro com parciais por objetivo para caçar o próprio tempo.', como: 'Marque "Cronômetro" no título, ou ligue "Cronômetro de precisão" nas Opções.', lib: () => true },
    { n: 'Noite da Semana', d: 'A mesma semente para todo mundo até domingo. Bata o seu tempo.', como: 'Botão "Noite da Semana" no título.', lib: () => !!$('#b-semana') },
    { n: 'Semente livre', d: 'Uma palavra qualquer vira uma noite determinística que dá para trocar como figurinha.', como: 'Digite uma palavra no campo "Semente".', lib: () => true },
    { n: 'Desafio de um amigo', d: 'Jogue exatamente a noite que um amigo mandou.', como: 'Cole o código no campo "Desafio".', lib: () => true },
    { n: 'Ouvido do Inspetor', d: 'A tela escurece e você se guia quase só pelo som.', como: 'Destrava jogando; aparece nas Opções depois de um final.', lib: () => !!(OPT.ouvido !== undefined) },
    { n: 'Modo Velório', d: 'As cores foram enterradas. O internato em preto e branco.', como: 'Digite VELORIO no título.', lib: () => !!OPT.velorioLib },
    { n: 'Regras da casa', d: 'Mutadores que mudam o jogo e sobem o seu rank: lanterna fraca, ouvido afiado, passos rápidos, sem aviso.', como: 'Monte no baralho abaixo e copie o código.', lib: () => true }
  ];
  const MUTS = [
    { id: 'pilha', nome: 'Lanterna faminta', efeito: 'A pilha dura metade. Troque mais (R).' },
    { id: 'ouvido', nome: 'Ouvido afiado', efeito: 'O Inspetor escuta 40% mais longe.' },
    { id: 'passos', nome: 'Passo apressado', efeito: 'Ele anda 12% mais rápido.' },
    { id: 'aviso', nome: 'Sem aviso', efeito: 'A Procissão não dá o aviso completo.' }
  ];
  let baralho = {};
  function codigoMontado() {
    const sem = hashSemente(($('#l6-semente') && $('#l6-semente').value) || '') || (($('#o-desafio') && $('#o-desafio').value || '').trim().toUpperCase().match(/^[0-9A-Z]{4,7}/) || [novaSementeAleatoria()])[0];
    const dif = ($('#o-dif') && $('#o-dif').value) || 'normal';
    const mods = MUTS.filter(m => baralho[m.id]).map(m => MOD_LETRA[m.id]).join('');
    return `${sem}-${DIF_LETRA[dif] || 'N'}${mods}`;
  }
  function melhorModo(n) {
    const r = regs(), s = stats();
    if (n === 'Contra o relógio') { let t = 0, ok = true; caps().forEach(c => { if (r[c.id] && r[c.id].tempo) t += r[c.id].tempo; else ok = false; }); return ok ? 'melhor tempo somado ' + mmss(t) : null; }
    if (n === 'Uma Vida') return (s.concluidas || 0) ? 'noites concluídas ' + s.concluidas : null;
    if (n === 'Regras da casa') { const nf = Object.keys(s.finais || {}).length; return nf ? 'finais vistos ' + nf : null; }
    return null;
  }
  function trofeusHtml() {
    const s = stats(), r = regs(), c = conqs();
    const todosS = caps().every(x => (r[x.id] || {}).rank === 'S');
    const marcos = [
      ['10 noites', (s.partidas || 0) >= 10],
      ['3 finais', Object.keys(s.finais || {}).length >= 3],
      ['S em tudo', todosS],
      ['sem morrer uma noite', lsGet(NOITES_K, []).some(n => n.final && n.mortes === 0)],
      ['todos os finais', Object.keys(s.finais || {}).length >= (R.finais ? Object.keys(R.finais).length : 5)]
    ];
    return `<div class="l6-baralho"><h3>Estante de troféus</h3><div class="l6-trofeus">${marcos.map(([t, on]) => `<span class="l6-trofeu ${on ? 'on' : ''}">${on ? '✦ ' : ''}${esc(t)}</span>`).join('')}</div></div>`;
  }
  function viewModos() {
    const hoje = `<div class="l6-add"><button class="btn l6-mini" id="l6-hoje-jogar">Jogar a Noite de hoje</button><button class="btn l6-mini" id="l6-hoje-cop">Copiar a semente de hoje</button></div>`;
    const cards = MODOS.map(m => {
      const livre = (() => { try { return m.lib(); } catch (e) { return true; } })();
      const best = melhorModo(m.n);
      return `<div class="l6-modo ${livre ? '' : 'trava'}"><b>${esc(m.n)}</b> ${livre ? '' : '<em class="l6-cadeado">travado</em>'}<p>${esc(m.d)}</p><small>${esc(m.como)}</small>${best ? `<small class="l6-best">✦ ${esc(best)}</small>` : ''}</div>`;
    }).join('');
    const baralhoH = `<div class="l6-baralho"><h3>Baralho de regras</h3><div class="l6-cartas">`
      + MUTS.map(m => `<label class="l6-carta ${baralho[m.id] ? 'on' : ''}" data-m="${m.id}"><b>${esc(m.nome)}</b><span>${esc(m.efeito)}</span></label>`).join('')
      + `</div><div class="l6-cod">Código montado: <b id="l6-cod-v">${codigoMontado()}</b> <button class="btn l6-mini" id="l6-cod-cop">copiar</button> <button class="btn l6-mini" id="l6-cod-jogar">jogar esta noite</button></div></div>`;
    abrir('Modos e desafios', `<p class="l6-dica">Tudo o que muda a noite num lugar só. Risque a lista.</p>${hoje}${cards}${baralhoH}${trofeusHtml()}`, '#title');
    $('#l6-corpo').querySelectorAll('.l6-carta').forEach(el => el.onclick = () => {
      baralho[el.dataset.m] = !baralho[el.dataset.m]; el.classList.toggle('on', !!baralho[el.dataset.m]);
      const v = $('#l6-cod-v'); if (v) v.textContent = codigoMontado();
    });
    const cop = $('#l6-cod-cop'); if (cop) cop.onclick = async () => { cop.textContent = (await copiar(codigoMontado())) ? 'copiado!' : 'erro'; setTimeout(() => cop.textContent = 'copiar', 1600); };
    const jg = $('#l6-cod-jogar'); if (jg) jg.onclick = () => { const d = $('#o-desafio'); if (d) d.value = codigoMontado(); const b = $('#b-novo'); fechar(); if (b) b.click(); };
    const hj = $('#l6-hoje-jogar'); if (hj) hj.onclick = () => { const d = $('#o-desafio'); if (d) d.value = sementeDoDia(); const b = $('#b-novo'); fechar(); if (b) b.click(); };
    const hc = $('#l6-hoje-cop'); if (hc) hc.onclick = async () => { hc.textContent = (await copiar(sementeDoDia())) ? 'copiado!' : 'erro'; setTimeout(() => hc.textContent = 'Copiar a semente de hoje', 1600); };
  }

  // ---------------------------------------------------------------- PLACAR DE AMIGOS (códigos de resultado)
  function decodResultado(cod) {
    const m = String(cod || '').trim().toUpperCase().match(/^([SABC]{1,8})-([0-9A-Z]{1,4})-([0-9A-Z]{1,6})$/);
    if (!m) return null;
    const mortes = parseInt(m[2], 36), tempo = parseInt(m[3], 36);
    if (!isFinite(mortes) || !isFinite(tempo)) return null;
    const pont = m[1].split('').reduce((a, r) => a + ({ S: 4, A: 3, B: 2, C: 1 }[r] || 0), 0);
    return { ranks: m[1], mortes, tempo, pont };
  }
  function meuResultado() {
    const r = regs(), s = stats();
    const rk = caps().map(c => { const x = (r[c.id] && r[c.id].rank) || ''; return /[SABC]/.test(x) ? x : null; });
    if (rk.some(x => x == null)) return null;
    const tempo = caps().reduce((a, c) => a + ((r[c.id] && r[c.id].tempo) || 0), 0);
    return { ranks: rk.join(''), mortes: s.mortes || 0, tempo: Math.round(tempo), eu: true, pont: rk.reduce((a, x) => a + ({ S: 4, A: 3, B: 2, C: 1 }[x] || 0), 0) };
  }
  function viewPlacar() {
    const amigos = lsGet(AMIGOS_K, []);
    const entrar = `<div class="l6-add"><input type="text" id="l6-amigo" placeholder="código de resultado de um amigo" maxlength="22" spellcheck="false"> <button class="btn l6-mini" id="l6-amigo-add">adicionar</button></div><p class="l6-dica">Cole até 5 códigos (o botão "Copiar resultado" no fim da noite gera o seu).</p>`;
    const linhas = [];
    const meu = meuResultado(); if (meu) linhas.push({ nome: 'Você', ...meu });
    amigos.forEach((a, i) => { const d = decodResultado(a.cod); if (d) linhas.push({ nome: a.nome || 'amigo ' + (i + 1), ...d, i }); });
    linhas.sort((a, b) => (b.pont - a.pont) || (a.tempo - b.tempo));
    const meuT = meu ? meu.tempo : null;
    const diff = l => { if (meuT == null || l.eu) return ''; const d = l.tempo - meuT; return `<span class="${d < 0 ? 'bom' : 'ruim'}">${d < 0 ? '−' : '+'}${Math.abs(Math.round(d / 60))} min</span>`; };
    const tabela = linhas.length ? `<table class="l6-tab"><tr><th></th><th>quem</th><th>capítulos</th><th>mortes</th><th>tempo</th><th>vs você</th><th></th></tr>`
      + linhas.map((l, p) => `<tr class="${l.eu ? 'eu' : ''}"><td>${p + 1}º</td><td>${esc(l.nome)}</td><td class="rks">${l.ranks.split('').join(' ')}</td><td>${l.mortes}</td><td>${Math.round(l.tempo / 60)} min</td><td>${diff(l)}</td>${l.i != null ? `<td><button class="l6-x" data-i="${l.i}">×</button></td>` : '<td></td>'}</tr>`).join('') + `</table>`
      : '<p class="l6-dica">Nenhum código ainda.</p>';
    abrir('Placar da Casa', entrar + tabela, '#title');
    const add = $('#l6-amigo-add'), inp = $('#l6-amigo');
    if (add) add.onclick = () => {
      const v = (inp && inp.value || '').trim().toUpperCase();
      if (!decodResultado(v)) { C.toast && C.toast('Esse não parece um código de resultado válido.'); return; }
      const arr = lsGet(AMIGOS_K, []); if (arr.length >= 5) arr.shift();
      arr.push({ cod: v, nome: '' }); lsSet(AMIGOS_K, arr); viewPlacar();
    };
    $('#l6-corpo').querySelectorAll('.l6-x').forEach(b => b.onclick = () => { const arr = lsGet(AMIGOS_K, []); arr.splice(+b.dataset.i, 1); lsSet(AMIGOS_K, arr); viewPlacar(); });
  }

  // ---------------------------------------------------------------- HISTÓRICO DE NOITES
  function logNoite(final) {
    try {
      const S = C.S; if (!S) return;
      const arr = lsGet(NOITES_K, []);
      arr.push({ t: Date.now(), cap: S.chapter, final: final || null, tempo: Math.round(S.tempo || 0), mortes: S.mortes || 0, sem: S.semente || '', dif: S.dif || 'normal', mods: (S.mods || []).slice(), uv: !!(S.modo && S.modo.umaVida) });
      while (arr.length > 20) arr.shift();
      lsSet(NOITES_K, arr);
    } catch (e) {}
  }
  function viewNoites() {
    const bruto = lsGet(NOITES_K, []), len = bruto.length, s = stats();
    const arr = bruto.map((n, i) => ({ ...n, num: (s.partidas || len) - (len - 1 - i) })).slice().reverse();
    const dt = t => { const d = new Date(t); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
    const prim = bruto.length ? bruto[0] : null, melhor = bruto.filter(n => n.final).sort((a, b) => a.tempo - b.tempo)[0];
    let topo = '';
    if (prim) topo += `<div class="l6-topo">Noites jogadas no total: <b>${s.partidas || len}</b> · registradas aqui: <b>${len}</b> · primeira registrada: <b>${dt(prim.t)}</b>${melhor ? ` — melhor noite concluída: <b>${mmss(melhor.tempo)}</b>` : ''}</div>`;
    const linhas = arr.length ? arr.map(n => {
      const marca = n.final ? '⚑' : '†';
      const cap = (caps()[n.cap] && curto(caps()[n.cap])) || ('Cap. ' + n.cap);
      return `<div class="l6-noite"><span class="m">${marca}</span><b>noite nº ${n.num} — ${esc(n.final ? ('final: ' + (R.finais && R.finais[n.final] && R.finais[n.final].titulo || n.final)) : 'parou em ' + cap)}</b>`
        + `<small>${dt(n.t)} · ${mmss(n.tempo)} · ${n.mortes} ${n.mortes === 1 ? 'morte' : 'mortes'} · ${(C.DIFS[n.dif] || {}).nome || n.dif}${n.sem ? ' · ' + esc(n.sem) : ''}</small>`
        + (n.sem ? `<button class="btn l6-mini l6-rep" data-sem="${esc(n.sem)}" data-dif="${esc(n.dif)}" data-mods="${esc((n.mods || []).join(','))}" data-uv="${n.uv ? 1 : 0}">repetir esta noite</button><button class="btn l6-mini l6-copsem2" data-sem="${esc(n.sem)}">copiar semente</button>` : '') + `</div>`;
    }).join('') : '<p class="l6-dica">Ainda não há noites registradas. Jogue uma.</p>';
    abrir('Hall das Noites', topo + linhas, '#title');
    $('#l6-corpo').querySelectorAll('.l6-rep').forEach(b => b.onclick = () => repetir({ sem: b.dataset.sem, dif: b.dataset.dif, mods: (b.dataset.mods || '').split(',').filter(Boolean), umaVida: b.dataset.uv === '1' }));
    $('#l6-corpo').querySelectorAll('.l6-copsem2').forEach(b => b.onclick = async () => { b.textContent = (await copiar(b.dataset.sem)) ? 'copiado!' : 'erro'; setTimeout(() => b.textContent = 'copiar semente', 1600); });
  }

  // ---------------------------------------------------------------- MAPA DE MORTES
  function logMorte() {
    try {
      const S = C.S; if (!S) return;
      const m = lsGet(MORTES_K, {}); const k = 'c' + S.chapter; m[k] = (m[k] || 0) + 1; m._tot = (m._tot || 0) + 1; lsSet(MORTES_K, m);
    } catch (e) {}
  }
  function viewMortes() {
    const m = lsGet(MORTES_K, {}), tot = m._tot || 0;
    const max = Math.max(1, ...caps().map(c => m['c' + caps().indexOf(c)] || 0));
    const linhas = caps().map((c, i) => {
      const n = m['c' + i] || 0, pct = Math.round(n / max * 100);
      return `<div class="l6-heat"><span class="cap">${esc(curto(c))}</span><i style="width:${pct}%"></i><em>${n}</em></div>`;
    }).join('');
    const pior = caps().map((c, i) => [c, m['c' + i] || 0]).sort((a, b) => b[1] - a[1])[0];
    const nota = tot ? `Você já morreu <b>${tot}</b> ${tot === 1 ? 'vez' : 'vezes'}${pior && pior[1] ? `. O corredor que mais te pega: <b>${esc(curto(pior[0]))}</b>.` : '.'}` : 'Nenhuma morte registrada ainda. Que inveja.';
    abrir('Onde você mais cai', `<p class="l6-dica">${nota}</p>${linhas}<div class="l6-foot"><button class="btn" id="l6-heat-zerar">Zerar o mapa</button></div>`, '#title');
    const z = $('#l6-heat-zerar'); if (z) z.onclick = () => { lsSet(MORTES_K, {}); viewMortes(); };
  }

  // ---------------------------------------------------------------- ESPÓLIO: cartela de emojis na tela final
  const SIMB_RANK = { S: '✦', A: '◈', B: '◉', C: '◌' };
  function cartelaEmoji() {
    const r = regs(), S = C.S;
    const linha = caps().map(c => {
      const rk = (S && S.ranks && S.ranks[c.id]) || (r[c.id] && r[c.id].rank) || '';
      return SIMB_RANK[rk] || '·';
    }).join(' ');
    const mortes = (S && S.mortes) || 0, tempo = Math.round((S && S.tempo) || 0);
    const fin = (R.finais && finalAtual && R.finais[finalAtual] && R.finais[finalAtual].titulo) || null;
    const sem = (S && S.semente) || '';
    return `A HORA DO SILÊNCIO\n${linha}\n${fin ? 'final: ' + fin + '\n' : ''}${mortes} ${mortes === 1 ? 'morte' : 'mortes'} · ${mmss(tempo)}${sem ? '\nsemente ' + sem : ''}`;
  }
  function montarFinal() {
    const menu = $('#e-menu'); if (!menu || $('#l6-cartela')) return;
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'l6-cartela'; b.textContent = 'Copiar cartela';
    b.onclick = async () => { b.textContent = (await copiar(cartelaEmoji())) ? 'Cartela copiada!' : 'Não deu'; setTimeout(() => b.textContent = 'Copiar cartela', 2000); };
    const dn = document.createElement('button'); dn.className = 'btn'; dn.id = 'l6-denovo'; dn.textContent = 'Jogar esta noite de novo';
    dn.onclick = () => deNovoViaMenu('#e-menu');
    menu.before(b, dn);
    // mostra a cartela na própria tela
    const stats = $('#e-stats');
    if (stats && !$('#l6-cartela-pre')) { const pre = document.createElement('pre'); pre.id = 'l6-cartela-pre'; pre.className = 'l6-cartela-pre'; pre.textContent = cartelaEmoji().split('\n').slice(1, 2).join(''); stats.after(pre); }
  }
  function telaFinal() { try { montarFinal(); const pre = $('#l6-cartela-pre'); if (pre) pre.textContent = cartelaEmoji().split('\n')[1]; logNoite(($('#e-tit') && $('#e-tit').getAttribute('data-id')) || finalAtual); } catch (e) {} }

  // ---------------------------------------------------------------- tela de morte: "De novo, igual"
  function montarMorte() {
    const menu = $('#dt-menu'); if (!menu || $('#l6-morte-denovo')) return;
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'l6-morte-denovo'; b.textContent = 'De novo, a mesma noite do zero';
    b.onclick = () => deNovoViaMenu('#dt-menu');
    menu.before(b);
  }

  // ---------------------------------------------------------------- utilidades
  async function copiar(t) {
    try { await navigator.clipboard.writeText(t); return true; } catch (e) {}
    try { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); const ok = document.execCommand('copy'); a.remove(); return ok; } catch (e) { return false; }
  }

  // ---------------------------------------------------------------- splits ao vivo contra o PB (fantasma)
  // chamado quando um objetivo é concluído (via interface.js)
  let runSplits = { cap: -1, t: {} };
  function splitPB(id, ant, t) {
    try {
      const S = C.S;
      // guarda os tempos desta corrida por objetivo (para o resumo de fim de capítulo)
      if (S) { if (runSplits.cap !== S.chapter) runSplits = { cap: S.chapter, t: {} }; if (t != null) runSplits.t[id] = { t, ant }; }
      // aviso de recorde batido na hora (independente da opção do fantasma)
      if (ant != null && t != null && t < ant) {
        const fl = $('#l6-record-flash'); if (fl) { fl.textContent = 'recorde!'; fl.classList.remove('on'); void fl.offsetWidth; fl.classList.add('on'); }
      }
      if (!OPT.fantasmaPB || ant == null || t == null) return;
      const df = t - ant, el = $('#l6-ghost'); if (!el) return;
      el.textContent = `${df < 0 ? '▼ −' : '▲ +'}${relp(Math.abs(df))}`;
      el.className = df < 0 ? 'bom' : 'ruim'; el.hidden = false; ghostT = 2.2;
    } catch (e) {}
  }

  // ---------------------------------------------------------------- loop
  let ghostT = 0, finalAtual = null;
  function frame(dt, ativo) {
    // cronômetro de precisão: centésimos no HUD, fonte estável (só mexe no DOM quando muda)
    const prec = !!OPT.cronPrec && !!OPT.cron;
    if (prec !== lastPrec) { document.body.classList.toggle('l6-cron-prec', prec); lastPrec = prec; }
    if (ghostT > 0) { ghostT -= dt; if (ghostT <= 0) { const el = $('#l6-ghost'); if (el) el.hidden = true; } }
    if (C.mode === 'titulo') { metaT += dt; if (metaT > 7) { metaT = 0; metaIdx++; atualizarMeta(); } return; }
    // cartão da pausa: semente, dificuldade, mods e modo ativos
    if (C.ui === 'pausa') preencherPausa(); else pausaChave = null;
    // guarda a configuração da noite atual para "repetir" (chave leve, sem JSON por quadro)
    const S = C.S;
    if (ativo && S && S.semente && C.mode === 'jogo') {
      const chave = S.semente + '|' + (S.dif || '') + '|' + (S.mods || []).join(',') + '|' + (S.modo && S.modo.umaVida ? '1' : '');
      if (chave !== lastJSON) { lastJSON = chave; lsSet(LAST_K, { sem: S.semente, dif: S.dif, mods: (S.mods || []).slice(), umaVida: !!(S.modo && S.modo.umaVida) }); }
    }
  }
  let lastJSON = '', pausaChave = null, lastPrec = false;

  const MOD_NOME = { pilha: 'Lanterna faminta', ouvido: 'Ouvido afiado', passos: 'Passo apressado', aviso: 'Sem aviso' };
  function preencherPausa() {
    const el = $('#l6-pausa'), S = C.S; if (!el || !S) return;
    const chave = (S.semente || '') + '|' + (S.dif || '') + '|' + (S.mods || []).join(',') + '|' + (S.modo && S.modo.umaVida ? 'uv' : '');
    if (chave === pausaChave) return; pausaChave = chave;
    const cartas = (S.mods || []).map(m => `<span class="carta">${esc(MOD_NOME[m] || m)}</span>`).join('');
    const modo = S.modo && S.modo.umaVida ? '<span class="carta">Uma Vida</span>' : '';
    const cod = S.semente ? `${S.semente}-${DIF_LETRA[S.dif] || 'N'}${(S.mods || []).map(m => MOD_LETRA[m] || '').join('')}` : '';
    el.innerHTML = `noite de hoje: <b>${esc(cod || '—')}</b>` + (cartas || modo ? `<br>${modo}${cartas}` : '');
  }

  function morte(quem) {
    try {
      logMorte(); montarMorte(); logNoite(null);
      const S = C.S, el = $('#l6-morte-best');
      if (el && S) { const reg = regs()[caps()[S.chapter].id] || {}; el.innerHTML = reg.tempo ? `seu melhor neste capítulo: <b>${reg.rank || '—'}</b> em ${mmss(reg.tempo)}` : ''; }
    } catch (e) {}
  }

  // resumo de parciais no fim do capítulo: quanto durou cada objetivo e onde você perdeu tempo
  function fimCap(c, rk, ant) {
    try {
      const el = $('#l6-fc-splits'); if (!el) return;
      el.innerHTML = '';
      const ts = runSplits && runSplits.t ? runSplits.t : {};
      const ids = Object.keys(ts); if (!ids.length) return;
      // ordena pelos tempos acumulados e calcula a duração de cada trecho
      ids.sort((a, b) => ts[a].t - ts[b].t);
      let prev = 0; const trechos = ids.map(id => { const dur = ts[id].t - prev; prev = ts[id].t; const o = (c.objetivos || []).find(x => x.id === id); const nome = o ? (o.texto || id).replace(/\s*\(\{n\}\/\d\)/, '') : id; return { nome, dur, df: ts[id].ant != null ? ts[id].t - ts[id].ant : null }; });
      const pior = trechos.reduce((m, x, i) => x.dur > trechos[m].dur ? i : m, 0);
      el.innerHTML = 'parciais desta corrida:<br>' + trechos.map((x, i) => `<span class="${i === pior ? 'pior' : (x.df != null ? (x.df < 0 ? 'bom' : 'ruim') : '')}">${esc(x.nome.slice(0, 22))}: ${relp(x.dur)}${x.df != null ? (x.df < 0 ? ' ▼' : ' ▲') : ''}${i === pior ? ' — aqui você mais demorou' : ''}</span>`).join('<br>');
      runSplits = { cap: -1, t: {} };
    } catch (e) {}
  }

  // o motor avisa qual final foi (via telaFinal), mas guardamos também por conveniência
  function registrarFinal(t) { finalAtual = t; }

  // ---------------------------------------------------------------- teclas
  function tecla(e) {
    const scr = $('#l6');
    if (scr && !scr.hidden) {
      if (e.code === 'Escape' || e.code === 'Backspace') { fechar(); return true; }
      return false;
    }
    return false;
  }

  // ---------------------------------------------------------------- ligação dos botões do título
  function ligarBotoes() {
    const bm = $('#b-l6-modos'); if (bm) bm.onclick = viewModos;
    const br = $('#b-l6-recordes'); if (br) br.onclick = viewRecordes;
    const bp = $('#b-l6-placar'); if (bp) bp.onclick = viewPlacar;
    const bn = $('#b-l6-noites'); if (bn) bn.onclick = viewNoites;
    const bh = $('#b-l6-mortes'); if (bh) bh.onclick = viewMortes;
    const vb = $('#l6-voltar'); if (vb) vb.onclick = fechar;
  }

  montarTitulo();
  ligarBotoes();
  return { atualizarTitulo, tecla, frame, morte, telaFinal, fimCap, registrarFinal, splitPB, abrir, fechar };
}
