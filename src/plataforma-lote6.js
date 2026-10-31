// A HORA DO SILÊNCIO — Plataforma e acessibilidade, lote 6: REJOGABILIDADE.
// Motivos para voltar: Noite do Dia (semente da data, placar local), Noite Surpresa, Noite da Casa,
// link de semente+pactos (#n=CODIGO) com prévia, favoritas, "De novo, igual", cartão da noite em PNG,
// veredito do desafio, perfil de corrida, controles de toque destro/canhoto, selo de corrida assistida,
// semente fixa/aleatória e uma legenda de cores para daltônicos.
// Instalado por src/plataforma.js (instalarPlat6). Passivo, todo em try/catch, silenciado no QA
// (navigator.webdriver): nunca toca no caminho obrigatório nem no T.tudo().

const $ = s => document.querySelector(s);
const KEY = 'hora-silencio-l6';
// gerador determinístico (mesmo da progressão): semente -> números repetíveis
function rng(seed) { let a = (seed >>> 0) || 1; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hashTxt(s) { let h = 2166136261; for (const ch of s) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; }
function sementeDe(txt) { return ((hashTxt(txt) % 2176782334) + 1).toString(36).toUpperCase().padStart(6, '0'); }

const ADJ = ['Faminta', 'Cega', 'Rouca', 'Fria', 'Quebrada', 'Muda', 'Afogada', 'Rasgada', 'Trancada', 'Oca', 'Rasa', 'Torta', 'Esquecida', 'Riscada', 'Cinzenta', 'Rançosa'];
const NUC = ['Névoa', 'Procissão', 'Cova', 'Vigília', 'Cinza', 'Ferrugem', 'Lâmpada', 'Corrente', 'Capela', 'Cisterna', 'Caderneta', 'Vela', 'Badalada', 'Reza', 'Serração', 'Enxurrada'];
function nomeNoite(sem) { const r = rng(parseInt(sem, 36) || 1); const n = NUC[Math.floor(r() * NUC.length)], a = ADJ[Math.floor(r() * ADJ.length)]; return `Noite da ${n} ${a}`; }

const LET = { pilha: 'P', ouvido: 'O', passos: 'A', aviso: 'V' };
const DIFL = { facil: 'F', normal: 'N', pesadelo: 'P' };
function codigoNoite(sem, dif, mods) { return sem + '-' + (DIFL[dif] || 'N') + (mods || []).map(m => LET[m] || '').join(''); }

export function instalarPlat6(C, U) {
  const { O } = U;
  const robo = U.robo || !!window.__teste || !!navigator.webdriver;
  const copiar = U.copiar || (async () => false);
  const feedback = U.feedback || (() => {});
  let desafioEntrada = null; // resultado do amigo lido do link, para o veredito

  function mem() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function grava(fn) { try { const m = mem(); fn(m); localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} }
  const hoje = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  function sementeDia() { return sementeDe('hora-dia-' + hoje()); }
  function pactosDia() { // 2 a 3 pactos fixos, repetíveis no dia inteiro
    const r = rng(hashTxt('pactos-' + hoje())), todos = ['pilha', 'ouvido', 'passos', 'aviso'];
    for (let i = todos.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [todos[i], todos[j]] = [todos[j], todos[i]]; }
    return todos.slice(0, 2 + (r() < .5 ? 1 : 0));
  }
  const mmss = s => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ':' + ('' + (s % 60)).padStart(2, '0'); };

  // começa exatamente a noite do código (semente-DIFpactos), reusando o fluxo do "Novo jogo"
  function jogarCodigo(cod, marca) {
    const inp = $('#o-desafio'), bn = $('#b-novo'); if (!inp || !bn) return;
    inp.value = cod; const dl = (cod.split('-')[1] || 'N')[0];
    const dif = { F: 'facil', N: 'normal', P: 'pesadelo' }[dl]; if (dif && $('#o-dif')) $('#o-dif').value = dif;
    ultimaMarca = marca || null; fecharPainel();
    ['#ending', '#death', '#fimcap'].forEach(s => { const e = $(s); if (e) e.hidden = true; });
    bn.click();
  }
  let ultimaMarca = null; // 'dia' marca a partida como tentativa da Noite do Dia

  // ===================================================================
  // 1. LER O LINK #n=CODIGO (semente + dificuldade + pactos + opcional resultado do desafiante)
  // ===================================================================
  function lerHash() {
    let h = ''; try { h = decodeURIComponent(location.hash || ''); } catch (e) { h = location.hash || ''; }
    const m = h.match(/n=([0-9A-Za-z]{4,7}(?:-[FNP][POAV]*)?)(?:\|([^|]*)\|(\w+)\|(\w+))?/i);
    if (!m) return;
    const cod = m[1].toUpperCase(), sem = cod.split('-')[0];
    const inp = $('#o-desafio'); if (inp) inp.value = cod;
    const dl = (cod.split('-')[1] || 'N')[0], dif = { F: 'facil', N: 'normal', P: 'pesadelo' }[dl]; if (dif && $('#o-dif')) $('#o-dif').value = dif;
    if (m[3] != null && m[4] != null) desafioEntrada = { nome: (m[2] || 'alguém').slice(0, 20), tempo: parseInt(m[4], 36) || 0, mortes: parseInt(m[3], 36) || 0 };
    prevNoite(sem, m[2]);
  }
  function prevNoite(sem, nome) {
    if (robo || !$('#title')) return;
    let el = $('#l6-prev'); if (!el) { el = document.createElement('div'); el.id = 'l6-prev'; el.setAttribute('aria-live', 'polite'); $('#title').appendChild(el); }
    const quem = desafioEntrada ? esc(desafioEntrada.nome) : (nome ? esc(nome.slice(0, 20)) : null);
    el.innerHTML = `<b>${quem ? quem + ' te desafia para esta noite:' : 'Noite compartilhada:'}</b> «${esc(nomeNoite(sem))}»`
      + (desafioEntrada ? `<br><small>terminou em ${mmss(desafioEntrada.tempo)}, ${desafioEntrada.mortes} ${desafioEntrada.mortes === 1 ? 'morte' : 'mortes'}. Consegue melhor?</small>` : '<br><small>mesma semente, mesmas regras. Aperte Novo jogo.</small>');
  }
  const esc = s => String(s == null ? '' : s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

  // ===================================================================
  // 2. PAINEL "REJOGAR": Noite do Dia, Surpresa, Casa, colar link, favoritas
  // ===================================================================
  function montarPainel() {
    if (robo || $('#l6-painel') || !document.body) return;
    const el = document.createElement('div'); el.id = 'l6-painel'; el.className = 'screen painel'; el.hidden = true;
    el.innerHTML = `<div class="wrap"><h2>Rejogar</h2><div id="l6-corpo"></div>
      <div class="rodape"><button class="btn" id="l6-voltar">Voltar (ESC)</button></div></div>`;
    document.body.appendChild(el);
    $('#l6-voltar').onclick = fecharPainel;
    addEventListener('keydown', e => { if (!el.hidden && (e.key === 'Escape' || e.code === 'Escape')) { e.preventDefault(); fecharPainel(); } }, true);
  }
  function fecharPainel() { const el = $('#l6-painel'); if (el) el.hidden = true; }
  function abrirPainel() {
    montarPainel(); const el = $('#l6-painel'); if (!el) return;
    const dia = sementeDia(), pd = pactosDia(), codDia = codigoNoite(dia, 'normal', pd);
    const m = mem(), rec = (m.dia && m.dia.data === hoje()) ? m.dia : null;
    const favs = (m.favs || []);
    const corpo = $('#l6-corpo');
    corpo.innerHTML = `
      <section class="l6-sec"><h3>Noite do Dia</h3>
        <p class="l6-nome">«${esc(nomeNoite(dia))}»</p>
        <p class="l6-sub">A mesma semente para todo mundo hoje, no Normal, com ${pd.length} pactos fixos: ${pd.map(nomeMod).join(', ')}.</p>
        <p class="l6-placar">${rec ? `tentativas de hoje: <b>${rec.n}</b> · melhor tempo: <b>${rec.best ? mmss(rec.best) : '—'}</b>` : 'você ainda não jogou a noite de hoje.'}</p>
        <div class="op-bts"><button class="btn" id="l6-dia">Jogar a Noite do Dia</button><button class="btn" id="l6-dia-cod">Copiar código</button></div></section>
      <section class="l6-sec"><h3>Noite Surpresa</h3>
        <p class="l6-sub">Sorteia uma semente nova com 1 a 2 pactos e já começa. Para quem não quer escolher.</p>
        <div class="op-bts"><button class="btn" id="l6-surp">Surpreenda-me</button><button class="btn" id="l6-casa">Noite da Casa (bem tensa)</button></div></section>
      <section class="l6-sec"><h3>Noite de um amigo</h3>
        <p class="l6-sub">Cole o link ou o código da noite de alguém (semente + regras):</p>
        <div class="op-bts"><input type="text" id="l6-colar" placeholder="link ou código" spellcheck="false" autocomplete="off"><button class="btn" id="l6-colar-ir">Jogar essa noite</button></div>
        <small id="l6-colar-ok"></small></section>
      <section class="l6-sec"><h3>Favoritas <small>(${favs.length})</small></h3>
        <p class="l6-sub">Guarde uma noite que deu medo de verdade e volte a ela igualzinha.</p>
        <div id="l6-favs">${favs.length ? '' : '<small>nenhuma ainda — favorite pela estrela no fim da noite.</small>'}</div></section>`;
    $('#l6-dia').onclick = () => jogarCodigo(codDia, 'dia');
    $('#l6-dia-cod').onclick = async e => feedback(e.target, await copiar(codDia) ? 'Código copiado.' : codDia);
    $('#l6-surp').onclick = () => jogarCodigo(sorteio(false));
    $('#l6-casa').onclick = () => jogarCodigo(sorteio(true));
    $('#l6-colar-ir').onclick = () => { const v = extrairCodigo($('#l6-colar').value); if (!v) { $('#l6-colar-ok').textContent = 'Não entendi esse código.'; return; } jogarCodigo(v); };
    pintarFavs(favs);
    el.hidden = false;
  }
  function pintarFavs(favs) {
    const box = $('#l6-favs'); if (!box || !favs.length) return;
    box.innerHTML = favs.map((f, i) => `<div class="l6-fav"><span class="l6-fav-n">«${esc(nomeNoite(f.sem))}»</span><code>${esc(f.cod)}</code>
      <button class="btn mini" data-ir="${i}">Jogar</button><button class="btn mini" data-cop="${i}">Copiar</button><button class="btn mini" data-del="${i}">Tirar</button></div>`).join('');
    box.querySelectorAll('[data-ir]').forEach(b => b.onclick = () => jogarCodigo(favs[+b.dataset.ir].cod));
    box.querySelectorAll('[data-cop]').forEach(b => b.onclick = async () => feedback(b, await copiar(linkDe(favs[+b.dataset.cop].cod)) ? 'Link copiado.' : 'Falhou.'));
    box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { grava(mm => { mm.favs = (mm.favs || []).filter((_, k) => k !== +b.dataset.del); }); abrirPainel(); });
  }
  const nomeMod = m => ({ pilha: 'pilha que some rápido', ouvido: 'ele ouve mais', passos: 'ele anda mais rápido', aviso: 'menos aviso' }[m] || m);

  // sorteia uma noite válida; tensa=true empilha mais pactos
  function sorteio(tensa) {
    const sem = (Math.floor(Math.random() * 2176782335) + 1).toString(36).toUpperCase().padStart(6, '0');
    const todos = ['pilha', 'ouvido', 'passos', 'aviso'];
    for (let i = todos.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [todos[i], todos[j]] = [todos[j], todos[i]]; }
    const qtd = tensa ? 3 : 1 + (Math.random() < .5 ? 1 : 0);
    return codigoNoite(sem, 'normal', todos.slice(0, qtd));
  }
  function extrairCodigo(txt) {
    const s = String(txt || '').trim();
    const h = s.match(/n=([0-9A-Za-z]{4,7}(?:-[FNP][POAV]*)?)/i); if (h) return h[1].toUpperCase();
    const c = s.toUpperCase().match(/^([0-9A-Z]{4,7})(-[FNP][POAV]*)?$/); if (c) return c[1] + (c[2] || '');
    return null;
  }
  function linkDe(cod, nome) { const base = location.origin + location.pathname; return base + '#n=' + cod + (nome ? '|' + encodeURIComponent(nome) : ''); }

  // ===================================================================
  // 3. BOTÕES DO TÍTULO
  // ===================================================================
  function botaoTitulo() {
    if (robo || $('#l6-rejogar') || !$('#b-novo')) return;
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'l6-rejogar'; b.textContent = 'Rejogar / Desafios';
    const anc = $('#b-semana') || $('#b-novo'); anc.insertAdjacentElement('afterend', b);
    const m = mem(), rec = (m.dia && m.dia.data === hoje()) ? m.dia : null;
    b.title = 'Noite do Dia, surpresa, favoritas e noites de amigos' + (rec && rec.best ? ' · melhor de hoje ' + mmss(rec.best) : '');
    b.onclick = abrirPainel;
  }

  // ===================================================================
  // 4. GUARDAR A CONFIG DA NOITE QUE COMEÇOU (para "De novo, igual" e para favoritar)
  // ===================================================================
  let noiteAtual = null;
  function capturarNoite() {
    const S = C.S; if (!S || !S.semente || S.semente === 'SEMCOD') { noiteAtual = null; return; }
    noiteAtual = { sem: S.semente, dif: S.dif, mods: (S.mods || []).slice(), cod: codigoNoite(S.semente, S.dif, S.mods || []) };
    if (ultimaMarca === 'dia') { grava(m => { const d = (m.dia && m.dia.data === hoje()) ? m.dia : { data: hoje(), n: 0, best: 0 }; d.n = (d.n || 0) + 1; m.dia = d; }); desafioDiaAtivo = true; }
    else desafioDiaAtivo = false;
    ultimaMarca = null;
  }
  let desafioDiaAtivo = false;

  // ===================================================================
  // 5. SELO DE CORRIDA ASSISTIDA: sinaliza sem bloquear nada
  // ===================================================================
  function assistida() {
    try {
      return !!(O.menosSustos || O.semFlash || (C.OPT && (+C.OPT.avisoCedo || C.OPT.ajudaAuto)) || O.ritmoLento || O.autoEsconde || (C.S && C.S.ajuda > 0) || (C.S && C.S.dif === 'facil'));
    } catch (e) { return false; }
  }

  // ===================================================================
  // 6. FIM DA NOITE: De novo igual · Cartão PNG · link · veredito · favoritar
  // ===================================================================
  function aoFim() {
    if (robo) return; capturarFinal();
    const menu = $('#e-menu'); if (!menu || $('#l6-fim')) return;
    const caixa = document.createElement('div'); caixa.id = 'l6-fim'; caixa.className = 'op-bts';
    caixa.innerHTML = `<button class="btn" id="l6-denovo">De novo, igual</button>
      <button class="btn" id="l6-link">Copiar link da noite</button>
      <button class="btn" id="l6-cartao">Cartão da noite (imagem)</button>
      <button class="btn" id="l6-fav">★ Favoritar</button>`;
    menu.before(caixa);
    ligarFimBotoes();
    vereditoFinal('#ending', '#e-stats');
    if (desafioDiaAtivo) registrarTempoDia();
    seloAssistida('#ending', '#e-stats');
  }
  function capturarFinal() { if (!noiteAtual) capturarNoite(); }
  function ligarFimBotoes() {
    const alvo = () => noiteAtual || (C.S && C.S.semente ? { cod: codigoNoite(C.S.semente, C.S.dif, C.S.mods || []), sem: C.S.semente } : null);
    const d = $('#l6-denovo'); if (d) d.onclick = () => { const a = alvo(); if (a) jogarCodigo(a.cod); };
    const l = $('#l6-link'); if (l) l.onclick = async () => { const a = alvo(); if (!a) return; feedback(l, await compartir(linkDesafio(a)) || 'Link copiado.'); };
    const c = $('#l6-cartao'); if (c) c.onclick = () => baixarCartao();
    const f = $('#l6-fav'); if (f) f.onclick = () => { const a = alvo(); if (!a) return; grava(m => { m.favs = (m.favs || []).filter(x => x.cod !== a.cod); m.favs.unshift({ cod: a.cod, sem: a.sem }); m.favs = m.favs.slice(0, 12); }); f.textContent = '★ Favoritada'; };
  }
  // link que embute também o resultado do jogador (para o veredito do amigo)
  function linkDesafio(a) {
    const S = C.S, nome = (($('#o-nome') && $('#o-nome').value) || '').slice(0, 20);
    const t = Math.round((S && S.tempo) || 0).toString(36), mo = ((S && S.mortes) || 0).toString(36);
    return linkDe(a.cod, nome) + '|' + mo + '|' + t;
  }
  async function compartir(url) {
    if (navigator.share) { try { await navigator.share({ title: 'A Hora do Silêncio', text: 'Joga essa minha noite — mesma semente, mesmas regras:', url }); return 'Compartilhado.'; } catch (e) { if (e && e.name === 'AbortError') return 'Cancelado.'; } }
    return (await copiar(url)) ? 'Link copiado.' : url;
  }
  function vereditoFinal(tela, stats) {
    if (!desafioEntrada) return; const S = C.S; if (!S) return;
    const box = $(stats); if (!box) return;
    const dt = Math.round((S.tempo || 0) - desafioEntrada.tempo), dm = (S.mortes || 0) - desafioEntrada.mortes;
    let txt;
    if (dt < -1) txt = `Você venceu ${esc(desafioEntrada.nome)} por ${mmss(-dt)}.`;
    else if (dt > 1) txt = `Você perdeu para ${esc(desafioEntrada.nome)} por ${mmss(dt)}.`;
    else txt = `Empate no relógio com ${esc(desafioEntrada.nome)}.`;
    if (dm) txt += dm < 0 ? ` E morreu ${-dm} ${-dm === 1 ? 'vez' : 'vezes'} a menos.` : ` Mas morreu ${dm} ${dm === 1 ? 'vez' : 'vezes'} a mais.`;
    const el = document.createElement('div'); el.className = 'l6-veredito'; el.textContent = txt; box.appendChild(el);
  }
  function seloAssistida(tela, stats) {
    if (!assistida()) return; const box = $(stats); if (!box || box.querySelector('.l6-assist')) return;
    const el = document.createElement('div'); el.className = 'l6-assist'; el.textContent = 'corrida assistida (ajudas ligadas) — conta normal, só fica marcado';
    box.appendChild(el);
  }
  function registrarTempoDia() {
    const S = C.S; if (!S) return; const t = Math.round(S.tempo || 0);
    grava(m => { const d = (m.dia && m.dia.data === hoje()) ? m.dia : { data: hoje(), n: 1, best: 0 }; if (!d.best || t < d.best) { d.best = t; d.novo = true; } m.dia = d; });
    const mm = mem().dia; if (mm && mm.novo) { const box = $('#e-stats'); if (box) { const el = document.createElement('div'); el.className = 'l6-recorde'; el.textContent = 'Novo recorde da Noite do Dia: ' + mmss(mm.best); box.appendChild(el); } grava(m => { if (m.dia) m.dia.novo = false; }); }
  }

  // ===================================================================
  // 7. MORTE: De novo, igual (recomeça a noite do zero, mesma semente)
  // ===================================================================
  function aoMorte() {
    if (robo) return; capturarFinal();
    const menu = $('#dt-menu'); if (!menu || $('#l6-morte')) return;
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'l6-morte'; b.textContent = 'Recomeçar a noite do zero';
    b.title = 'Mesma semente, mesmos códigos e ordem — do início do prólogo'; menu.before(b);
    b.onclick = () => { const a = noiteAtual || (C.S && C.S.semente ? { cod: codigoNoite(C.S.semente, C.S.dif, C.S.mods || []) } : null); if (a) jogarCodigo(a.cod); };
  }

  // ===================================================================
  // 8. CARTÃO DA NOITE EM PNG (boletim desenhado em canvas, sem spoiler do final)
  // ===================================================================
  function baixarCartao() {
    try {
      const S = C.S, R = C.R; let caps = {}; try { caps = JSON.parse(localStorage.getItem(C.CAPS_KEY)) || {}; } catch (e) {}
      const W = 720, H = 420, cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
      g.fillStyle = '#0b0b0d'; g.fillRect(0, 0, W, H);
      g.strokeStyle = '#2a2a30'; g.lineWidth = 2; g.strokeRect(10, 10, W - 20, H - 20);
      // etiqueta de cartucho no canto
      g.fillStyle = '#c9a75a'; g.fillRect(W - 210, 30, 180, 56); g.fillStyle = '#0b0b0d'; g.font = 'bold 13px "Courier New",monospace';
      g.fillText('A HORA DO SILÊNCIO', W - 202, 52); g.font = '11px "Courier New",monospace'; g.fillText('fita nº ' + (S && S.semente || '—'), W - 202, 72);
      g.fillStyle = '#e8e2d5'; g.font = '26px Georgia,serif'; g.fillText('Sobrevivi à noite', 40, 64);
      g.font = '15px Georgia,serif'; g.fillStyle = '#9a948a'; g.fillText('«' + nomeNoite(S && S.semente || '1') + '»', 40, 92);
      g.font = '14px "Courier New",monospace'; g.fillStyle = '#cfc8ba';
      const ranks = R.capitulos.map(c => (caps[c.id] && caps[c.id].rank) || '-');
      let y = 140; R.capitulos.forEach((c, i) => { g.fillText((c.titulo.split(' — ')[0]).replace('Prólogo', 'Prólogo'), 44, y); g.fillStyle = '#c9a75a'; g.fillText(ranks[i], 300, y); g.fillStyle = '#cfc8ba'; y += 26; });
      const lore = Object.keys((S && S.notes) || {}).length + Object.keys((S && S.fitas) || {}).length, tot = R.notas.length + R.paginas.length + R.fitas.length;
      g.fillStyle = '#9a948a'; g.font = '14px "Courier New",monospace';
      g.fillText('tempo ' + mmss(S && S.tempo), 400, 140); g.fillText('mortes ' + ((S && S.mortes) || 0), 400, 166); g.fillText('segredos ' + lore + '/' + tot, 400, 192);
      g.fillText('código ' + codigoNoite(S && S.semente || '—', S && S.dif || 'normal', (S && S.mods) || []), 400, 218);
      g.fillStyle = '#6a655c'; g.font = '12px Georgia,serif'; g.fillText('Jogue de fone, no escuro. Consegue melhor?', 40, H - 34);
      const a = document.createElement('a'); a.download = 'hora-do-silencio-noite.png'; a.href = cv.toDataURL('image/png'); a.click();
    } catch (e) {}
  }

  // ===================================================================
  // 9. OPÇÕES EM "DESEMPENHO": perfil de corrida, toque destro/canhoto, semente fixa, legenda de cores
  // ===================================================================
  function montarOpcoes(wrap) {
    if (!wrap || $('#l6-op')) return;
    const d = document.createElement('div'); d.id = 'l6-op'; d.className = 'op-grupo';
    d.innerHTML = `<h3>Rejogabilidade</h3>
      <div class="op-bts"><button class="btn" id="l6-perfil-corrida">Perfil de corrida</button><span class="pl-nota" id="l6-perfil-ok"></span></div>
      <label title="Trava a semente para treinar a MESMA noite várias vezes"><input type="checkbox" id="l6-fixa"> Repetir sempre a última semente no Novo jogo</label>
      <label>Toque: sensibilidade horizontal <input type="range" id="l6-sx" min="0.4" max="2.5" step="0.1"></label>
      <label>Toque: sensibilidade vertical <input type="range" id="l6-sy" min="0.4" max="2.5" step="0.1"></label>
      <div class="op-bts"><button class="btn" id="l6-cores">Legenda de cores (daltônicos)</button></div>`;
    wrap.appendChild(d);
    $('#l6-perfil-corrida').onclick = () => aplicarPerfilCorrida();
    const fx = $('#l6-fixa'); fx.checked = !!O.sementeFixa; fx.onchange = () => { O.sementeFixa = fx.checked; U.salvar(); aplicarSementeFixa(); };
    const sx = $('#l6-sx'); sx.value = O.toqueSX || 1; sx.oninput = () => { O.toqueSX = +sx.value; U.salvar(); };
    const sy = $('#l6-sy'); sy.value = O.toqueSY || 1; sy.oninput = () => { O.toqueSY = +sy.value; U.salvar(); };
    $('#l6-cores').onclick = legendaCores;
  }
  function aplicarPerfilCorrida() {
    try {
      O.pularAbertura = true; O.lim30 = O.lim30; // mantém desempenho do jogador
      if (C.OPT) { C.OPT.crono = true; C.OPT.relogio = 'real'; C.salvarOpt && C.salvarOpt(); }
      const cr = $('#o-crono'); if (cr) { cr.checked = true; cr.dispatchEvent(new Event('change')); }
      const rl = $('#o-relogio'); if (rl) { rl.value = 'real'; rl.dispatchEvent(new Event('change')); }
      O.avisoLento = false; U.salvar();
      const ok = $('#l6-perfil-ok'); if (ok) { ok.textContent = 'cronômetro e relógio real ligados · avisos lentos desligados'; setTimeout(() => ok.textContent = '', 4000); }
    } catch (e) {}
  }
  function aplicarSementeFixa() {
    // no próximo Novo jogo, deixa a última semente no campo de desafio
    if (O.sementeFixa && noiteAtual && $('#o-desafio') && !$('#o-desafio').value) $('#o-desafio').value = noiteAtual.cod;
  }
  function legendaCores() {
    let el = $('#l6-cores-box');
    if (!el) {
      el = document.createElement('div'); el.id = 'l6-cores-box'; el.className = 'screen painel'; el.hidden = true;
      el.innerHTML = `<div class="wrap"><h2>O que cada cor quer dizer</h2>
        <ul class="l6-cores-lista">
          <li><b>vermelho piscando</b> — perigo imediato (luzes da Procissão, dano). Forma: pulsa rápido.</li>
          <li><b>âmbar/dourado fixo</b> — algo importante ou um segredo por perto. Forma: brilho parado.</li>
          <li><b>azul-frio</b> — a Menina / o Chamado. Forma: vem de longe.</li>
          <li><b>verde</b> — você está seguro ou escondido. Forma: estável.</li>
          <li><b>fiação acesa, garrafa marcada, giz do esconderijo</b> — o contorno e o símbolo valem mais que a cor.</li>
        </ul>
        <p class="l6-sub">Dica: em Opções há paleta para daltonismo e alto contraste. As legendas de som (canto) repetem em texto o que a cor avisa.</p>
        <div class="rodape"><button class="btn" id="l6-cores-v">Voltar (ESC)</button></div></div>`;
      document.body.appendChild(el);
      $('#l6-cores-v').onclick = () => el.hidden = true;
      addEventListener('keydown', e => { if (!el.hidden && e.key === 'Escape') { e.preventDefault(); el.hidden = true; } }, true);
    }
    el.hidden = false;
  }

  // sensibilidade por eixo aplicada ao olhar de toque (ganchos expostos para o motor de toque)
  function escalaToque(eixo) { return eixo === 'y' ? (O.toqueSY || 1) : (O.toqueSX || 1); }

  // ===================================================================
  // ESTILO (injetado; não mexe na folha compartilhada)
  // ===================================================================
  function estilo() {
    if ($('#l6-css')) return; const s = document.createElement('style'); s.id = 'l6-css';
    s.textContent = `
    #l6-prev{margin:12px auto;max-width:560px;padding:10px 14px;border:1px solid #3a3a42;border-radius:8px;background:rgba(20,18,16,.6);color:#cfc8ba;font-size:14px;line-height:1.5}
    #l6-prev b{color:#c9a75a}
    #l6-painel .wrap,#l6-cores-box .wrap{max-width:620px}
    .l6-sec{border-top:1px solid #2a2a30;padding:14px 0;margin:0}
    .l6-sec h3{color:#c9a75a;margin:0 0 6px;font-size:16px}
    .l6-nome{color:#e8e2d5;font-family:Georgia,serif;font-size:18px;margin:2px 0}
    .l6-sub{color:#9a948a;font-size:13px;margin:4px 0}
    .l6-placar{color:#cfc8ba;font-size:13px;margin:6px 0}
    .l6-sec .op-bts{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px}
    #l6-colar{flex:1;min-width:160px;background:#141210;border:1px solid #3a3a42;color:#e8e2d5;padding:8px;border-radius:6px}
    .btn.mini{padding:4px 10px;font-size:12px}
    .l6-fav{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:6px 0;border-bottom:1px dashed #2a2a30}
    .l6-fav-n{color:#e8e2d5;font-family:Georgia,serif}.l6-fav code{color:#c9a75a;font-size:12px}
    .l6-veredito{margin-top:10px;color:#c9a75a;font-weight:bold}
    .l6-assist{margin-top:8px;color:#7d8a6a;font-size:12px;opacity:.9}
    .l6-recorde{margin-top:8px;color:#c9a75a;font-weight:bold}
    .l6-cores-lista{text-align:left;max-width:520px;margin:10px auto;line-height:1.7;color:#cfc8ba;font-size:14px}
    .l6-cores-lista b{color:#e8e2d5}
    @media (max-width:700px){.l6-sec .op-bts{flex-direction:column;align-items:stretch}}
    `; document.head.appendChild(s);
  }

  // ===================================================================
  // INSTALAR
  // ===================================================================
  try {
    estilo();
    if (!robo) { lerHash(); botaoTitulo(); aplicarSementeFixa(); }
    addEventListener('hashchange', () => { try { lerHash(); } catch (e) {} });
  } catch (e) {}

  return {
    montarOpcoes,
    aoFim,
    aoMorte,
    escalaToque,
    aoNovaNoite() { try { capturarNoite(); if (O.sementeFixa) aplicarSementeFixa(); } catch (e) {} },
    frame() {},
    mapa() {},
    _teste: { nomeNoite, sementeDia, codigoNoite, extrairCodigo, sorteio, linkDe }
  };
}
