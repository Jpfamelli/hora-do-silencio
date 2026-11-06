// INTERFACE — lote 6 (2ª rodada): a Central do rejogo. Uma tela com abas (reaproveita a tela #l6 do módulo do lote 6):
// Hoje (quiz "Hoje eu quero…"), Roda Surpresa, Tarô, Perfil, Segredos e álbum, Acervo de conquistas, Noites e comparador,
// Calendário e arquivo do dia, Placares (códigos de amigos, turma), Mapa e rotas, Perfis e visitante.
// Criado por interface-lote6b.js (criarCentral6B(K)); K traz o armazenamento, o desenho e as utilidades do núcleo.
export function criarCentral6B(K) {
  const { C, U, R, OPT, T, D, salvar, esc, clamp, pick, mmss, hashSemente, sementeDoDia, glifoSvg, copiarTexto, desenharRota, decodificar, DIF_LETRA, perfis, acervo, segredosNotas, achada, mapaDe } = K;
  const $ = s => document.querySelector(s);
  const stats = () => C.lsGet('hora-silencio-stats', {}) || {};
  const conqs = () => C.lsGet('hora-silencio-v2-conq', {}) || {};
  const NOMES_MAPA = { estrada: 'Estrada', terreo: 'Térreo', superior: 'Andar de cima', tuneis: 'Túneis', cemiterio: 'Cemitério' };
  const novaSemente = () => Math.floor(Math.random() * 2176782335 + 1).toString(36).toUpperCase().padStart(6, '0');
  const noitesJogadas = () => stats().partidas || 0;
  const dataBR = t => new Date(t).toLocaleDateString('pt-BR');

  // ---------------------------------------------------------------- jogar um código (semente + dificuldade + mutadores)
  function jogarCodigo(code, dif, menus = []) {
    const go = () => {
      const d = $('#o-desafio'); if (d) d.value = code;
      const ds = $('#o-dif'); if (ds && dif) { ds.value = dif; ds.dispatchEvent(new Event('change')); }
      const l = $('#l6-semente'); if (l) l.value = '';
      const b = $('#b-novo'); if (b) b.click();
    };
    for (const m of menus) { const b = $(m); if (b && !b.closest('[hidden]')) { b.click(); setTimeout(go, 140); return; } }
    if ($('#l6') && !$('#l6').hidden) U.fechar && U.fechar();
    setTimeout(go, 80);
  }

  // ---------------------------------------------------------------- estrutura das abas
  const ABAS = [
    ['hoje', 'Hoje eu quero…'], ['roda', 'Roda Surpresa'], ['taro', 'Tarô'], ['perfil', 'Seu perfil'], ['segredos', 'Segredos e álbum'],
    ['acervo', 'Conquistas'], ['noites', 'Últimas noites'], ['calendario', 'Calendário'], ['placar', 'Placares'], ['mapa', 'Mapa e rotas'], ['perfis', 'Perfis']
  ];
  let aba = 'hoje', anim = null;
  function barra() { return `<div class="l6b-tabs">${ABAS.map(([k, n]) => `<button class="btn ${k === aba ? 'on' : ''}" data-tab="${k}">${esc(n)}</button>`).join('')}</div>`; }
  function render(tab) {
    if (anim) { cancelAnimationFrame(anim); anim = null; }
    aba = tab || aba;
    const fn = VIEWS[aba] || VIEWS.hoje;
    const corpo = U.abrir('Central do rejogo', barra() + '<div id="l6b-aba"></div>', '#title');
    if (!corpo) return;
    corpo.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => render(b.dataset.tab));
    const alvo = corpo.querySelector('#l6b-aba'); alvo.innerHTML = fn.html();
    if (fn.ligar) fn.ligar(alvo);
  }
  const btn = (id, txt, cls = 'btn l6-mini') => `<button class="${cls}" id="${id}">${txt}</button>`;
  const copiarBtn = (b, texto, rotulo) => async () => { b.textContent = (await copiarTexto(texto())) ? 'copiado!' : 'erro'; setTimeout(() => b.textContent = rotulo, 1600); };

  // ================================================================= HOJE EU QUERO
  let quiz = { i: 0, r: [] };
  const PERGUNTAS = T.HOJE;
  function sugestao(r) {
    let mods = '', dif = 'normal', cron = false, sem = novaSemente(), nome = '';
    const [humor, ritmo, plateia] = r;
    if (humor === 'medo') { mods = 'OV'; nome = 'Medo de verdade'; }
    else if (humor === 'calma') { dif = 'facil'; nome = 'Noite calma'; }
    else if (humor === 'misterio') { nome = 'Noite de mistério: leia tudo, abra tudo'; }
    else { mods = 'POA'; nome = 'Desafio de verdade'; }
    if (ritmo === 'rapido') { cron = true; nome += ' · contra o relógio'; } else if (!mods.includes('O')) { mods += 'O'; nome += ' · ouvido afiado, andar devagar'; }
    if (plateia === 'amigos') { sem = sementeDoDia(); nome += ' · a Noite de hoje, igual para os amigos'; }
    return { mods, dif, cron, sem, nome, cod: `${sem}-${DIF_LETRA[dif] || 'N'}${mods}` };
  }
  const VIEWS = {};
  VIEWS.hoje = {
    html() {
      if (quiz.i >= PERGUNTAS.length) {
        const s = sugestao(quiz.r);
        return `<p class="l6-dica">Sua noite sob medida:</p><div class="l6b-card"><b>${esc(s.nome)}</b><br>Código: <b>${esc(s.cod)}</b> ${glifoSvg(s.sem, 18)}${s.cron ? '<br>Cronômetro ligado.' : ''}<br><small>Dica: no jogo, a tecla I troca a lente de rejogo.</small></div>
        <div class="l6-add">${btn('l6b-hj-jogar', 'Jogar agora')}${btn('l6b-hj-cop', 'copiar código')}${btn('l6b-hj-de-novo', 'responder de novo')}</div>`;
      }
      const q = PERGUNTAS[quiz.i];
      return `<div class="l6b-quiz"><p class="l6-dica">Pergunta ${quiz.i + 1} de ${PERGUNTAS.length}. Sem certo nem errado.</p><h3 style="text-align:center;font-family:'IM Fell English SC';font-weight:normal;font-size:24px">${esc(q.p)}</h3><div style="text-align:center">${q.ops.map(([k, n]) => `<button class="btn" data-r="${k}">${esc(n)}</button>`).join('')}</div></div>`;
    },
    ligar(el) {
      el.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { quiz.r.push(b.dataset.r); quiz.i++; render('hoje'); });
      const j = $('#l6b-hj-jogar'); if (j) j.onclick = () => { const s = sugestao(quiz.r); const cr = $('#o-crono'); if (cr) cr.checked = s.cron; jogarCodigo(s.cod, s.dif); };
      const c = $('#l6b-hj-cop'); if (c) c.onclick = copiarBtn(c, () => sugestao(quiz.r).cod, 'copiar código');
      const n = $('#l6b-hj-de-novo'); if (n) n.onclick = () => { quiz = { i: 0, r: [] }; render('hoje'); };
    }
  };

  // ================================================================= RODA SURPRESA
  const BONS = [
    { n: 'Dificuldade Fácil', ef: 'Ele anda mais devagar e ouve menos.', dif: 'facil' },
    { n: 'Dicas da Lia ligadas', ef: 'A Lia murmura quando você trava.', opt: ['dicas', true] },
    { n: 'Anel de barulho sempre', ef: 'Você vê o raio do seu barulho.', opt: ['ruido', 'sim'] },
    { n: 'Cronômetro ligado', ef: 'Os parciais viram a sua régua.', cron: true }
  ];
  const RUINS = [
    { n: 'Lanterna faminta', ef: 'A pilha dura metade.', mod: 'P' }, { n: 'Ouvido afiado', ef: 'Ele escuta 40% mais longe.', mod: 'O' },
    { n: 'Passo apressado', ef: 'Ele anda 12% mais rápido.', mod: 'A' }, { n: 'Sem aviso', ef: 'A Procissão não avisa direito.', mod: 'V' },
    { n: 'Pesadelo', ef: 'Um golpe e acabou.', dif: 'pesadelo' }
  ];
  let roda = { bom: null, ruim: null, giros: 0, girando: false };
  function girar(el) {
    if (roda.girando) return; roda.girando = true; roda.giros++;
    const cb = el.querySelector('#l6b-rc-bom'), cr = el.querySelector('#l6b-rc-ruim');
    const alvoB = pick(BONS), alvoR = pick(RUINS);
    let passos = 0; const total = 26;
    const tick = () => {
      passos++;
      const b = passos >= total ? alvoB : pick(BONS), r = passos >= total - 3 ? alvoR : pick(RUINS);
      cb.firstChild.nodeValue = b.n; cr.firstChild.nodeValue = r.n; cb.classList.add('gira'); cr.classList.add('gira');
      try { C.SFX.clique && C.SFX.clique(); } catch (e) {}
      if (passos < total) { setTimeout(tick, 45 + passos * passos * 0.45); }
      else {
        roda.bom = alvoB; roda.ruim = alvoR; roda.girando = false; cb.classList.remove('gira'); cr.classList.remove('gira');
        cb.querySelector('small').textContent = alvoB.ef; cr.querySelector('small').textContent = alvoR.ef; render('roda');
      }
    };
    tick();
  }
  function codigoRoda() {
    const b = roda.bom, r = roda.ruim; let dif = 'normal', mods = '', cron = false;
    if (b && b.dif) dif = b.dif; if (b && b.cron) cron = true; if (r && r.dif) dif = r.dif; if (r && r.mod) mods += r.mod;
    return { dif, mods, cron };
  }
  VIEWS.roda = {
    html() {
      const g = roda.bom && roda.ruim;
      return `<p class="l6-dica">Gire e aceite: um presente e uma maldição. Você pode girar de novo uma única vez.</p>
      <div class="l6b-roleta"><div class="l6b-rc bom" id="l6b-rc-bom">${esc(roda.bom ? roda.bom.n : '?')}<small>${esc(roda.bom ? roda.bom.ef : 'o bom')}</small></div><div class="l6b-rc ruim" id="l6b-rc-ruim">${esc(roda.ruim ? roda.ruim.n : '?')}<small>${esc(roda.ruim ? roda.ruim.ef : 'o ruim')}</small></div></div>
      <div class="l6-add">${btn('l6b-girar', g ? (roda.giros < 2 ? 'Girar de novo (só mais 1 vez)' : 'sem mais giros') : 'Girar a roda')}${g ? btn('l6b-roda-jogar', 'Jogar esta noite') + btn('l6b-roda-cop', 'copiar o resultado') : ''}</div>`;
    },
    ligar(el) {
      const gi = $('#l6b-girar'); if (gi) { if (roda.giros >= 2) gi.disabled = true; gi.onclick = () => girar(el); }
      const j = $('#l6b-roda-jogar'); if (j) j.onclick = () => { const x = codigoRoda(), d = K.D(); d.pendente.roleta = true; salvar(d); if (roda.bom.opt) { OPT[roda.bom.opt[0]] = roda.bom.opt[1]; C.salvarOpt(); } const cr = $('#o-crono'); if (cr) cr.checked = x.cron; jogarCodigo(`${novaSemente()}-${DIF_LETRA[x.dif] || 'N'}${x.mods}`, x.dif); };
      const c = $('#l6b-roda-cop'); if (c) c.onclick = copiarBtn(c, () => `A Roda Surpresa da Casa deu: ${roda.bom.n} e ${roda.ruim.n}. Aguenta?`, 'copiar o resultado');
    }
  };

  // ================================================================= TARÔ
  let taroMao = null;
  function cartasLiberadas() {
    const d = K.D();
    return T.TARO.filter(c => c.livre || (c.morrer && d.mortesPorQuem[c.morrer] > 0) || (c.mortes10 && (d.mortesTot || 0) >= 10) || (c.final && Object.keys(stats().finais || {}).length > 0));
  }
  function desenharCarta(cv, c, on = true) {
    const g = cv.getContext('2d'), w = cv.width, h = cv.height;
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, on ? '#241c10' : '#0e0c0a'); gr.addColorStop(1, '#0a0705'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = on ? '#c9a75a' : '#3a3228'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12); g.lineWidth = 1; g.strokeRect(14, 14, w - 28, h - 28);
    g.textAlign = 'center'; g.fillStyle = on ? '#e8c76a' : '#4a4235'; g.font = '20px "IM Fell English SC", Georgia, serif'; g.fillText(on ? c.simbolo : '?', w / 2, 44);
    g.strokeStyle = on ? '#c9a75a' : '#3a3228'; g.beginPath(); g.arc(w / 2, h / 2 - 6, 34, 0, 7); g.stroke(); g.beginPath(); g.arc(w / 2, h / 2 - 6, 22, 0, 7); g.stroke();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.beginPath(); g.moveTo(w / 2 + Math.cos(a) * 22, h / 2 - 6 + Math.sin(a) * 22); g.lineTo(w / 2 + Math.cos(a) * 34, h / 2 - 6 + Math.sin(a) * 34); g.stroke(); }
    g.fillStyle = on ? '#cfc3a6' : '#4a4235'; g.font = '15px "IM Fell English SC", Georgia, serif'; g.fillText(on ? c.nome : 'bloqueada', w / 2, h - 34);
    g.textAlign = 'left';
  }
  VIEWS.taro = {
    html() {
      const lib = cartasLiberadas();
      if (!taroMao) { const emb = lib.slice().sort(() => Math.random() - .5); taroMao = emb.slice(0, 3).map(c => c.id); }
      const mao = taroMao.map(id => T.TARO.find(c => c.id === id)).filter(Boolean);
      const bloq = T.TARO.filter(c => !lib.includes(c));
      return `<p class="l6-dica">Três cartas foram viradas para esta noite. Escolha uma: ela liga um modificador. Outras cartas se soltam quando você morre de formas diferentes.</p>
      <div style="text-align:center" id="l6b-mao">${mao.map(c => `<button class="l6b-cartaT" data-c="${c.id}" aria-label="${esc(c.nome)}: ${esc(c.efeito)}"><canvas width="130" height="200"></canvas></button>`).join('')}</div>
      <div id="l6b-taro-res" class="l6b-card" style="text-align:center">Passe o mouse numa carta para ler o efeito.</div>
      <div class="l6-add">${btn('l6b-taro-emb', 'embaralhar')}</div>
      ${bloq.length ? `<h3 class="l6-dica" style="margin-top:14px">Ainda viradas para baixo</h3><div class="l6b-grade">${bloq.map(c => `<div class="l6b-sil"><span>?</span>${esc(c.desbloqueio)}</div>`).join('')}</div>` : ''}`;
    },
    ligar(el) {
      const mao = taroMao.map(id => T.TARO.find(c => c.id === id));
      el.querySelectorAll('.l6b-cartaT').forEach((b, i) => {
        const c = mao[i]; desenharCarta(b.querySelector('canvas'), c);
        const res = $('#l6b-taro-res');
        const mostra = () => { res.innerHTML = `<b>${esc(c.nome)}</b> · ${esc(c.efeito)}`; };
        b.onmouseenter = mostra; b.onfocus = mostra;
        b.onclick = () => {
          const d = K.D(); d.pendente.taro = true; d.taroUsado = d.taroUsado || {}; d.taroUsado[c.id] = (d.taroUsado[c.id] || 0) + 1; salvar(d);
          res.innerHTML = `<b>${esc(c.nome)}</b> · ${esc(c.efeito)}<br><button class="btn l6-mini" id="l6b-taro-jogar">Jogar com esta carta</button>`;
          $('#l6b-taro-jogar').onclick = () => jogarCodigo(`${novaSemente()}-${DIF_LETRA[c.dif] || 'N'}${c.mods || ''}`, c.dif);
        };
      });
      const e = $('#l6b-taro-emb'); if (e) e.onclick = () => { taroMao = null; render('taro'); };
    }
  };

  // ================================================================= PERFIL (estilo acumulado e títulos)
  VIEWS.perfil = {
    html() {
      const d = K.D(), arqs = Object.entries(d.arqs).sort((a, b) => b[1] - a[1]);
      const top = arqs[0] ? T.ARQUETIPOS[arqs[0][0]] : null;
      const hist = arqs.length ? arqs.map(([k, n]) => `${esc(T.ARQUETIPOS[k].nome)} ×${n}`).join(' · ') : 'Termine uma noite para o jogo te conhecer.';
      const titulos = T.TITULOS.map(t => { const g = d.titulosGanhos[t.id], on = d.titulo === t.id; return `<div class="l6b-card"><b>${g ? esc(t.nome) : '???'}</b> ${on ? '<span class="l6b-novo">em uso</span>' : ''}<br><small>${esc(t.desc)}</small>${g && !on ? ` <button class="btn l6-mini" data-t="${t.id}">usar este título</button>` : ''}</div>`; }).join('');
      const ult = d.noites.slice(-5).reverse().map(n => `<div>${dataBR(n.t)} · ${esc((T.ARQUETIPOS[n.arq] || {}).nome || '')} · média ${n.media}</div>`).join('');
      const pc = k => Object.keys(d.mortesPorQuem).length ? Object.entries(d.mortesPorQuem).map(([q, n]) => `${q === 'inspetor' ? 'Inspetor' : q === 'ana' ? 'Menina' : 'Procissão'} ${n}`).join(' · ') : 'ainda nenhuma';
      return `<div class="l6b-card"><b>${top ? esc(top.nome) : 'Sem perfil ainda'}</b><br>${top ? esc(top.frase) : ''}<br><small>${hist}</small></div>
      <div class="l6b-card">Mortes por quem: ${pc()}<br>${ult ? '<small>Últimas noites:</small>' + ult : ''}</div><h3 class="l6-dica">Títulos de jogadora</h3>${titulos}`;
    },
    ligar(el) { el.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { const d = K.D(); d.titulo = b.dataset.t; salvar(d); U.subTitulo && U.subTitulo('Título: ' + T.TITULOS.find(x => x.id === b.dataset.t).nome); render('perfil'); }); }
  };

  // ================================================================= SEGREDOS E ÁLBUM
  function resumoSegredos() {
    const S = C.S, a = acervo(), todos = segredosNotas();
    const porMapa = {}; let semMapa = 0, semMapaAch = 0;
    for (const n of todos) {
      const m = mapaDe(n);
      if (!m) { semMapa++; if (achada(n, S, a)) semMapaAch++; continue; }
      const x = porMapa[m] = porMapa[m] || { t: 0, a: 0 }; x.t++; if (achada(n, S, a)) x.a++;
    }
    const fitas = R.fitas.filter(f => f.secreta), fAch = fitas.filter(f => a[f.id] || (S && S.fitas && S.fitas[f.id])).length;
    const cq = conqs(), cs = R.conquistas.filter(c => c.secreta || c.segredo), cAch = cs.filter(c => cq[c.id]).length;
    return { porMapa, semMapa, semMapaAch, fitas: fitas.length, fAch, cs: cs.length, cAch };
  }
  function iconesGiz(t, a) { return Array.from({ length: t }, (_, i) => `<span class="l6b-seg ${i < a ? 'ok' : ''}">${i < a ? '✦' : '?'}</span>`).join(''); }
  function dicasLiberadas(restantes) {
    const d = K.D(), n = Math.floor(noitesJogadas() / 10), out = [];
    let mudou = false;
    for (let i = 0; i < n; i++) {
      if (!d.dicasVistas[i]) { const pool = restantes.length ? restantes : ['varia']; const mp = pick(pool); d.dicasVistas[i] = { m: mp, t: pick(T.DICA_MAPA[mp] || T.DICA_MAPA.varia) }; mudou = true; }
      out.push(d.dicasVistas[i]);
    }
    if (mudou) salvar(d);
    return out;
  }
  VIEWS.segredos = {
    html() {
      const d = K.D(), r = resumoSegredos(), S = C.S;
      if (d.escondeSeg) return `<p class="l6-dica">Painel de segredos escondido, para quem prefere a surpresa.</p><div class="l6-add">${btn('l6b-seg-mostrar', 'mostrar de novo')}</div>${albumHtml()}`;
      const linhas = Object.keys(NOMES_MAPA).filter(m => r.porMapa[m]).map(m => `<div class="l6b-card"><b>${r.porMapa[m].a} de ${r.porMapa[m].t}</b> no ${esc(NOMES_MAPA[m].toLowerCase())}<div class="l6b-segs">${iconesGiz(r.porMapa[m].t, r.porMapa[m].a)}</div></div>`).join('');
      const outros = r.semMapa ? `<div class="l6b-card"><b>${r.semMapaAch} de ${r.semMapa}</b> papéis sem endereço fixo<div class="l6b-segs">${iconesGiz(r.semMapa, r.semMapaAch)}</div></div>` : '';
      const fit = `<div class="l6b-card"><b>${r.fAch} de ${r.fitas}</b> fitas secretas · <b>${r.cAch} de ${r.cs}</b> conquistas secretas</div>`;
      const restantes = Object.keys(r.porMapa).filter(m => r.porMapa[m].a < r.porMapa[m].t);
      const dicas = dicasLiberadas(restantes);
      const dh = dicas.length ? dicas.map(x => `<div class="l6b-card">${esc(NOMES_MAPA[x.m] || 'Em algum lugar')}: ${esc(x.t)}</div>`).join('') : `<div class="l6b-card"><small>A cada 10 noites jogadas, uma dica vaga sobre um segredo aparece aqui. Você jogou ${noitesJogadas()}.</small></div>`;
      return `<p class="l6-dica">O que a casa ainda guarda: só a conta, nunca o lugar.</p>${linhas}${outros}${fit}<h3 class="l6-dica">Dicas vagas</h3>${dh}<div class="l6-add">${btn('l6b-seg-esconder', 'esconder este painel')}</div>${albumHtml()}`;
    },
    ligar() {
      const e = $('#l6b-seg-esconder'); if (e) e.onclick = () => { const d = K.D(); d.escondeSeg = true; salvar(d); render('segredos'); };
      const m = $('#l6b-seg-mostrar'); if (m) m.onclick = () => { const d = K.D(); d.escondeSeg = false; salvar(d); render('segredos'); };
    }
  };
  function albumHtml() {
    const a = acervo(), S = C.S, fins = stats().finais || {};
    const pastas = [
      ['Finais', Object.keys(R.finais).map(id => [R.finais[id].titulo, !!fins[id], '⚑'])],
      ['Fitas', R.fitas.filter(f => !f.secreta).map(f => [f.titulo, !!(a[f.id]), '◉'])],
      ['Notas', R.notas.filter(n => !n.secreta).map(n => [n.titulo, !!(a[n.id]), '✎'])],
      ['Páginas', R.paginas.filter(n => !n.secreta).map(n => [n.titulo, !!(a[n.id]), '▤'])]
    ];
    const tot = pastas.reduce((x, p) => x + p[1].length, 0), got = pastas.reduce((x, p) => x + p[1].filter(i => i[1]).length, 0);
    return `<h3 class="l6-dica" style="margin-top:18px">Álbum da casa: ${got} de ${tot}</h3>` + pastas.map(([n, itens]) => `<div class="l6b-card"><b>${n}</b> <small>${itens.filter(i => i[1]).length}/${itens.length}</small><div class="l6b-grade" style="margin-top:6px">${itens.map(([nome, on, s]) => `<div class="l6b-sil ${on ? 'on' : ''}"><span>${s}</span>${on ? esc(nome) : '???'}</div>`).join('')}</div></div>`).join('');
  }

  // ================================================================= ACERVO DE CONQUISTAS
  function moldura(x) {
    let p = 0; const d = x.desc || '';
    if (x.secreta || x.segredo) p += 2;
    if (/todos|todas|tudo|100|rank S|sem morrer|sem sofrer|pesadelo|uma vida|verdadeiro|sem nenhum/i.test(d)) p += 2;
    if (/\b(\d{2,})\b/.test(d)) p += 1; if (d.length > 80) p += 1;
    return p >= 5 ? 'sangue' : p >= 3 ? 'ouro' : p >= 2 ? 'prata' : 'bronze';
  }
  const AREAS = { prologo: 'Campanha', est: 'Estrada', l3: 'Polimento', l4: 'Segredos', l5: 'Perigo', l6: 'Rejogo', l6b: 'Rejogo', sg4: 'Segredos' };
  const areaDe = x => { const p = String(x.id).split('_')[0]; return AREAS[p] || (String(x.id).includes('_') ? p.charAt(0).toUpperCase() + p.slice(1) : 'Campanha'); };
  const dicaNivel = (x, n, secreta) => {
    const pal = (x.desc || '').split(/\s+/);
    if (n >= 8 || (secreta && n >= 12)) return x.desc;
    if (n >= 3) return pal.slice(0, Math.max(2, Math.ceil(pal.length * .55))).join(' ') + ' …';
    return `Começa com “${pal[0]}”…`;
  };
  let filtroAcervo = 'todas';
  VIEWS.acervo = {
    html() {
      const cq = conqs(), n = noitesJogadas(), todas = R.conquistas.map(x => ({ x, m: moldura(x), on: !!cq[x.id], sec: !!(x.secreta || x.segredo) }));
      const falta = todas.filter(t => !t.on).length;
      const areas = {}; todas.forEach(t => { const a = areaDe(t.x); const o = areas[a] = areas[a] || { t: 0, f: 0 }; o.t++; if (!t.on) o.f++; });
      const barras = Object.entries(areas).sort((a, b) => b[1].f - a[1].f).map(([a, o]) => `<div class="l6-heat"><span class="cap">${esc(a)}</span><i style="width:${Math.round((o.t - o.f) / o.t * 100)}%;background:linear-gradient(90deg,#6a5420,#c9a75a)"></i><em>${o.f} de ${o.t} faltam</em></div>`).join('');
      const filt = [['todas', 'todas'], ['faltam', 'faltam'], ...T.MOLDURAS.map(m => [m.id, m.nome])];
      const lista = todas.filter(t => filtroAcervo === 'todas' || (filtroAcervo === 'faltam' ? !t.on : t.m === filtroAcervo));
      const secretas = R.conquistas.filter(c => c.secreta || c.segredo);
      const mold = T.MOLDURAS.reduce((o, m) => (o[m.id] = m.cor, o), {});
      return `<p class="l6-dica">${falta} de ${todas.length} faltam · você jogou ${n} ${n === 1 ? 'noite' : 'noites'}: as dicas ficam mais claras com a experiência.</p>${barras}
      <div class="l6-add">${filt.map(([k, nome]) => `<button class="btn l6-mini ${k === filtroAcervo ? 'on' : ''}" data-f="${k}" ${k === filtroAcervo ? 'style="border-color:#c9a75a;color:#e8c76a"' : ''}>${esc(nome)}</button>`).join('')}</div>` +
        lista.map(t => {
          let corpo;
          if (t.on) corpo = `<b>${esc(t.x.nome)}</b><br><small>${esc(t.x.desc)}</small>`;
          else if (t.sec) {
            const idx = secretas.indexOf(t.x), q = T.QUADRINHAS[idx % T.QUADRINHAS.length];
            const l1 = n >= 3 ? esc(q[0]) : '▒▒▒▒▒ ▒▒▒▒▒▒', l2 = n >= 6 ? esc(q[1]) : '▒▒▒▒ ▒▒▒▒▒▒▒';
            corpo = `<b style="filter:blur(3px)">${esc(t.x.nome)}</b><br><i>${l1}<br>${l2}</i><br><small>dica: ${esc(dicaNivel(t.x, n, true))}</small>`;
          } else corpo = `<b>${esc(t.x.nome)}</b><br><small>${esc(dicaNivel(t.x, n, false))}</small>`;
          return `<div class="l6b-card l6b-mold" style="border-color:${mold[t.m]}${t.on ? '' : ';opacity:.78'}"><small style="color:${mold[t.m]};float:right">${t.on ? '✦ ' : ''}${T.MOLDURAS.find(m => m.id === t.m).nome}</small>${corpo}</div>`;
        }).join('');
    },
    ligar(el) { el.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filtroAcervo = b.dataset.f; render('acervo'); }); }
  };

  // ================================================================= ÚLTIMAS NOITES E COMPARADOR
  const clima = sem => { const v = K.prng(K.hashStr(sem + '|clima'))(); return v < .28 ? 'temporal' : v < .55 ? 'garoa' : v < .8 ? 'neblina' : 'seca'; };
  function planoMelhoria(arr) {
    if (arr.length < 4) return 'Jogue pelo menos 4 noites para eu traçar o seu plano de melhoria.';
    const m = arr.slice(-3), p = arr.slice(-6, -3);
    const med = (a, k) => a.reduce((s, x) => s + (x[k] || 0), 0) / Math.max(1, a.length);
    const frases = [];
    for (const [k, nome, menorMelhor] of [['ruido', 'seu ruído médio', true], ['mortes', 'suas mortes por noite', true], ['tempo', 'o tempo da noite', true], ['pulos', 'os seus pulos de susto', true]]) {
      if (!p.length) break; const a = med(p, k), b = med(m, k); if (a < .01) continue; const v = Math.round((b - a) / a * 100); if (Math.abs(v) < 5) continue;
      frases.push(`${nome} ${v < 0 ? 'caiu' : 'subiu'} ${Math.abs(v)}%${(v < 0) === menorMelhor ? ' (bom)' : ' (atenção)'}`);
    }
    return frases.length ? 'Plano: ' + frases.join('; ') + '.' : 'Seu ritmo está estável. Mude uma coisa: tente outro mutador.';
  }
  function graficoLinhas(cv, arr) {
    const g = cv.getContext('2d'), W = cv.width, H = cv.height; g.fillStyle = '#050403'; g.fillRect(0, 0, W, H);
    const series = [['tempo', '#c9a75a', 'tempo'], ['mortes', '#d0584a', 'mortes'], ['ruido', '#3f8ad0', 'ruído'], ['pulos', '#9ad486', 'pulos']];
    g.strokeStyle = '#1c1915'; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(30, 12 + i * (H - 40) / 4); g.lineTo(W - 10, 12 + i * (H - 40) / 4); g.stroke(); }
    series.forEach(([k, cor, nome], si) => {
      const v = arr.map(n => n[k] || 0), mx = Math.max(1, ...v); g.strokeStyle = cor; g.lineWidth = 2; g.beginPath();
      v.forEach((x, i) => { const px = 30 + (arr.length > 1 ? i / (arr.length - 1) : .5) * (W - 50), py = H - 24 - (x / mx) * (H - 44); i ? g.lineTo(px, py) : g.moveTo(px, py); }); g.stroke();
      g.fillStyle = cor; g.font = '11px "Special Elite", monospace'; g.fillText(nome, 34 + si * 70, 12);
    });
    g.fillStyle = '#6d6452'; g.font = '10px "Special Elite", monospace'; g.fillText('cada curva em escala própria · noites mais antigas à esquerda', 34, H - 6);
  }
  const setaCmp = (a, b, menorMelhor = true) => { if (a === b) return '='; const bom = (b < a) === menorMelhor; return `<span class="${bom ? 'bom' : 'ruim'}" style="color:${bom ? '#7fbf6a' : '#d0584a'}">${b < a ? '▼' : '▲'}</span>`; };
  VIEWS.noites = {
    html() {
      const d = K.D(), arr = d.noites.slice(-10);
      if (!arr.length) return '<p class="l6-dica">Nenhuma noite terminada ainda. Termine uma e o gráfico aparece.</p>';
      const linhas = arr.slice().reverse().map((n, i) => {
        const ix = arr.length - 1 - i; const cor = n.media >= 7 ? '#c9a75a' : n.media >= 5 ? '#bdb29a' : '#c0392b';
        return `<div class="l6b-card"><span style="color:${cor}">■</span> <b>${dataBR(n.t)}</b> · ${esc((R.finais[n.final] || {}).titulo || n.final)} · ${mmss(n.tempo)} · ${n.mortes} mortes · ruído ${n.ruido} · ${esc(clima(n.sem || 'SEMCOD'))}${n.dif === 'pesadelo' ? ' · pesadelo' : ''}<br><small>${esc((T.ARQUETIPOS[n.arq] || {}).nome || '')} · média ${n.media} · ${esc(n.sem || '')} ${n.mods && n.mods.length ? '· ' + n.mods.join(', ') : ''}</small> <button class="btn l6-mini" data-rep="${ix}">repetir</button></div>`;
      }).join('');
      const opt = arr.map((n, i) => `<option value="${i}">${dataBR(n.t)} · ${mmss(n.tempo)}</option>`).join('');
      return `<div class="l6b-linhaG"><canvas id="l6b-graf" width="640" height="190"></canvas></div><p class="l6-dica">${esc(planoMelhoria(d.noites))}</p>${linhas}
      <h3 class="l6-dica" style="margin-top:14px">Comparar duas noites</h3><div class="l6-add"><select id="l6b-ca">${opt}</select> contra <select id="l6b-cb">${opt}</select></div><div id="l6b-cmp"></div>`;
    },
    ligar(el) {
      const d = K.D(), arr = d.noites.slice(-10); if (!arr.length) return;
      graficoLinhas($('#l6b-graf'), arr);
      const ca = $('#l6b-ca'), cb = $('#l6b-cb'); ca.value = String(Math.max(0, arr.length - 2)); cb.value = String(arr.length - 1);
      const cmp = () => {
        const a = arr[+ca.value], b = arr[+cb.value]; if (!a || !b) return;
        const lin = (nome, k, f = x => x, menor = true) => `<tr><td>${nome}</td><td>${f(a[k])}</td><td>${f(b[k])}</td><td>${setaCmp(a[k], b[k], menor)}</td></tr>`;
        const capsTab = Object.keys(b.caps || {}).map(i => `<tr><td>${esc(((R.capitulos[i] || {}).titulo || 'cap').split(' — ')[0])}</td><td>${mmss((a.caps || {})[i] || 0)}</td><td>${mmss(b.caps[i])}</td><td>${setaCmp((a.caps || {})[i] || 0, b.caps[i])}</td></tr>`).join('');
        $('#l6b-cmp').innerHTML = `<table class="l6b-ptab"><tr><th></th><th>esquerda</th><th>direita</th><th></th></tr>${lin('Tempo', 'tempo', mmss)}${lin('Mortes', 'mortes')}${lin('Ruído médio', 'ruido')}${lin('Esconderijos usados', 'esconde')}${lin('Pulos', 'pulos')}${lin('Nota do boletim', 'media', x => x, false)}${capsTab}</table>`;
      };
      ca.onchange = cmp; cb.onchange = cmp; cmp();
      el.querySelectorAll('[data-rep]').forEach(b => b.onclick = () => { const n = arr[+b.dataset.rep]; if (n && n.sem) jogarCodigo(`${n.sem}-${DIF_LETRA[n.dif] || 'N'}${(n.mods || []).map(m => ({ pilha: 'P', ouvido: 'O', passos: 'A', aviso: 'V' }[m] || '')).join('')}`, n.dif); });
    }
  };

  // ================================================================= CALENDÁRIO E ARQUIVO DO DIA
  let mesVista = new Date(); mesVista.setDate(1);
  function sequencias(dias) {
    const ks = Object.keys(dias).sort(); let maior = 0, cur = 0, ant = null;
    for (const k of ks) { const t = new Date(k + 'T12:00:00').getTime(); if (ant != null && Math.round((t - ant) / 86400000) === 1) cur++; else cur = 1; maior = Math.max(maior, cur); ant = t; }
    const hoje = new Date(); const hk = K.diaChave(hoje), ontem = K.diaChave(new Date(hoje.getTime() - 86400000));
    let atual = 0; if (dias[hk] || dias[ontem]) { let t = dias[hk] ? hoje : new Date(hoje.getTime() - 86400000); while (dias[K.diaChave(t)]) { atual++; t = new Date(t.getTime() - 86400000); } }
    return { atual, maior };
  }
  VIEWS.calendario = {
    html() {
      const d = K.D(), y = mesVista.getFullYear(), m = mesVista.getMonth(), nome = mesVista.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const prim = new Date(y, m, 1).getDay(), dias = new Date(y, m + 1, 0).getDate(), hk = K.diaChave();
      const sq = sequencias(d.dias);
      let cel = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map(x => `<div class="h">${x}</div>`).join('');
      for (let i = 0; i < prim; i++) cel += '<div style="border:none;background:none"></div>';
      for (let i = 1; i <= dias; i++) {
        const k = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`, r = d.dias[k];
        const cls = r ? (r.diaria && r.final ? 'o' : r.final ? 'v' : 'm') : ''; cel += `<button class="${cls} ${k === hk ? 'hoje' : ''}" data-d="${k}" aria-label="dia ${i}${r ? (r.final ? ', terminou' : ', morreu') : ''}">${i}</button>`;
      }
      return `<p class="l6-dica">Cada noite jogada vira uma marca: verde terminou, vermelho morreu, dourado Noite do Dia concluída.</p>
      <div class="l6-add"><button class="btn l6-mini" id="l6b-mes-a">‹</button><b style="text-transform:capitalize;min-width:170px;text-align:center">${esc(nome)}</b><button class="btn l6-mini" id="l6b-mes-p">›</button></div>
      <div class="l6b-cal">${cel}</div><p class="l6-dica" style="margin-top:10px">Sequência atual: <b>${sq.atual}</b> · maior sequência: <b>${sq.maior}</b></p><div id="l6b-dia" class="l6b-card"><small>Clique num dia para ver a semente e rejogar a noite daquele dia.</small></div>`;
    },
    ligar(el) {
      $('#l6b-mes-a').onclick = () => { mesVista = new Date(mesVista.getFullYear(), mesVista.getMonth() - 1, 1); render('calendario'); };
      $('#l6b-mes-p').onclick = () => { mesVista = new Date(mesVista.getFullYear(), mesVista.getMonth() + 1, 1); render('calendario'); };
      el.querySelectorAll('[data-d]').forEach(b => b.onclick = () => {
        const d = K.D(), k = b.dataset.d, r = d.dias[k], [y, m, dd] = k.split('-').map(Number);
        const sem = sementeDoDia(new Date(Date.UTC(y, m - 1, dd, 12)));
        const futuro = new Date(y, m - 1, dd) > new Date();
        $('#l6b-dia').innerHTML = `<b>${String(dd).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}</b> ${r ? `· ${r.final ? 'terminou em ' + mmss(r.tempo || 0) : 'morreu'} · ${r.mortes} ${r.mortes === 1 ? 'morte' : 'mortes'}${r.diaria ? ' · Noite do Dia' : ''}` : '· sem registro'}<br>Semente do dia: <b>${esc(sem)}</b> ${glifoSvg(sem, 18)}<br>${futuro ? '<small>Esse dia ainda não chegou.</small>' : `<button class="btn l6-mini" id="l6b-dia-jogar">jogar a noite deste dia</button> <button class="btn l6-mini" id="l6b-dia-cop">copiar semente</button>`}`;
        const j = $('#l6b-dia-jogar'); if (j) j.onclick = () => jogarCodigo(`${sem}-N`, 'normal');
        const c = $('#l6b-dia-cop'); if (c) c.onclick = copiarBtn(c, () => sem, 'copiar semente');
      });
    }
  };

  // ================================================================= PLACARES
  VIEWS.placar = {
    html() {
      const d = K.D(), meus = d.noites.slice(-5).reverse();
      const minhas = meus.length ? meus.map(n => `<div>${esc(n.cod)} <button class="l6b-mini2" data-cp="${esc(n.cod)}">copiar</button></div>`).join('') : '<small>Termine uma noite para gerar o seu código.</small>';
      const porSem = {}; d.cods.forEach((c, i) => { const x = decodificar(c); if (x) (porSem[x.sem] = porSem[x.sem] || []).push({ ...x, i }); });
      d.noites.forEach(n => { if (n.sem && n.cod) { const x = decodificar(n.cod); if (x) (porSem[x.sem] = porSem[x.sem] || []).push({ ...x, eu: true, i: -1 }); } });
      const tabelas = Object.keys(porSem).filter(s => porSem[s].some(x => !x.eu)).map(s => {
        const L = porSem[s].sort((a, b) => a.tempo - b.tempo || a.mortes - b.mortes); const meu = L.find(x => x.eu);
        return `<h3 class="l6-dica" style="margin-top:12px">Semente ${esc(s)} ${glifoSvg(s, 16)}</h3><table class="l6b-ptab"><tr><th>#</th><th>quem</th><th>tempo</th><th>mortes</th><th>vs você</th><th></th></tr>${L.map((x, p) => `<tr style="${x.eu ? 'color:#e8c76a' : ''}"><td>${p + 1}</td><td>${x.eu ? 'você' : 'amigo'}</td><td>${mmss(x.tempo)}</td><td>${x.mortes}</td><td>${meu && !x.eu ? (x.tempo < meu.tempo ? '−' : '+') + mmss(Math.abs(x.tempo - meu.tempo)) : ''}</td><td>${x.i >= 0 ? `<button class="l6-x" data-x="${x.i}">×</button>` : ''}</td></tr>`).join('')}</table>`;
      }).join('');
      const tur = perfis.turma();
      const turma = tur.length >= 2 ? turmaHtml(tur) : '<small>Com 2 ou mais perfis no aparelho, o placar da turma aparece aqui (aba Perfis).</small>';
      return `<p class="l6-dica">Cole o código de resultado de um amigo (começa com HS1-). Tudo local, sem servidor.</p>
      <div class="l6-add"><input type="text" id="l6b-cod-in" placeholder="HS1-SEMENTE.TEMPO.MORTES.N-XXX" maxlength="40" spellcheck="false"> ${btn('l6b-cod-add', 'adicionar')}</div>
      <div class="l6b-card"><b>Seus códigos recentes</b><br>${minhas}</div>${tabelas || '<p class="l6-dica">Nenhum código de amigo ainda. Cole um para abrir o placar daquela semente.</p>'}
      <h3 class="l6-dica" style="margin-top:14px">Placar da turma</h3>${turma}`;
    },
    ligar(el) {
      const add = $('#l6b-cod-add'), inp = $('#l6b-cod-in');
      add.onclick = () => { const x = decodificar(inp.value); if (!x) { C.toast && C.toast('Código inválido ou com a conferência errada.'); return; } const d = K.D(); if (!d.cods.includes(x.cod)) d.cods.push(x.cod); while (d.cods.length > 30) d.cods.shift(); salvar(d); render('placar'); };
      el.querySelectorAll('[data-cp]').forEach(b => b.onclick = copiarBtn(b, () => b.dataset.cp, 'copiar'));
      el.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { const d = K.D(); d.cods.splice(+b.dataset.x, 1); salvar(d); render('placar'); });
      const tc = $('#l6b-turma-cop'); if (tc) tc.onclick = copiarBtn(tc, () => perfis.textoTurma(), 'copiar o placar');
    }
  };
  function turmaHtml(t) {
    const melhor = (k, menor = false) => { const v = t.filter(x => x[k] != null); if (!v.length) return null; return v.reduce((a, b) => (menor ? b[k] < a[k] : b[k] > a[k]) ? b : a).id; };
    const lid = { pontos: melhor('pontos'), melhorTempo: melhor('melhorTempo', true), mortes: melhor('mortes', true), conquistas: melhor('conquistas') };
    const coroa = (id, k) => lid[k] === id ? ' <span class="l6b-coroa" title="lidera">♛</span>' : '';
    return `<table class="l6b-ptab"><tr><th>jogador</th><th>pontos</th><th>melhor tempo</th><th>mortes</th><th>conquistas</th></tr>${t.map(p => `<tr><td style="color:${p.cor}">${esc(p.nome)}${p.atual ? ' •' : ''}</td><td>${p.pontos}${coroa(p.id, 'pontos')}</td><td>${p.melhorTempo != null ? mmss(p.melhorTempo) : '—'}${coroa(p.id, 'melhorTempo')}</td><td>${p.mortes}${coroa(p.id, 'mortes')}</td><td>${p.conquistas}${coroa(p.id, 'conquistas')}</td></tr>`).join('')}</table><div class="l6-add" style="margin-top:8px"><button class="btn l6-mini" id="l6b-turma-cop">copiar o placar</button></div>`;
  }

  // ================================================================= MAPA DE MORTES E ROTAS
  let mapaSel = null, capRota = null;
  VIEWS.mapa = {
    html() {
      const d = K.D(), mapas = Object.keys(d.plantas);
      if (!mapas.length) return '<p class="l6-dica">Jogue um capítulo ou morra uma vez: o mapa começa a se desenhar com as suas noites.</p>';
      if (!mapaSel || !d.plantas[mapaSel]) mapaSel = mapas[0];
      const caps = R.capitulos.filter(c => d.melhor[c.id] && d.melhor[c.id].rota && d.melhor[c.id].rota.length > 2 && d.ultima && d.ultima[c.id]);
      if (!capRota && caps[0]) capRota = caps[0].id;
      return `<div class="l6-add">${mapas.map(m => `<button class="btn l6-mini" data-mp="${m}" ${m === mapaSel ? 'style="border-color:#c9a75a;color:#e8c76a"' : ''}>${esc(NOMES_MAPA[m] || m)}</button>`).join('')}</div>
      <div class="l6b-mapa"><canvas id="l6b-mm" width="640" height="380"></canvas></div><div class="l6b-card" id="l6b-mm-info"><small>Clique numa mancha vermelha: aparece quem pegou você ali. Quanto mais forte a mancha, mais vezes você caiu naquele ponto.</small></div>
      <h3 class="l6-dica" style="margin-top:14px">Replay das rotas (1 ponto a cada meio segundo)</h3>
      ${caps.length ? `<div class="l6-add">${caps.map(c => `<button class="btn l6-mini" data-cr="${c.id}" ${c.id === capRota ? 'style="border-color:#c9a75a;color:#e8c76a"' : ''}>${esc(c.titulo.split(' — ')[0])}</button>`).join('')}</div><div class="l6b-mapa"><canvas id="l6b-rp" width="640" height="380"></canvas></div><div class="l6b-mleg" style="justify-content:center"><span style="color:#ece6d6">━ sua rota anterior</span><span style="color:#e8c76a">━ sua melhor</span></div>` : '<p class="l6-dica">Termine um capítulo duas vezes para comparar a sua última rota com a melhor.</p>'}`;
    },
    ligar(el) {
      const d = K.D();
      if (!$('#l6b-mm')) return;
      el.querySelectorAll('[data-mp]').forEach(b => b.onclick = () => { mapaSel = b.dataset.mp; render('mapa'); });
      el.querySelectorAll('[data-cr]').forEach(b => b.onclick = () => { capRota = b.dataset.cr; render('mapa'); });
      // planta com manchas de morte
      const cv = $('#l6b-mm'), g = cv.getContext('2d'), planta = d.plantas[mapaSel], pts = (d.mortesPts[mapaSel] || []);
      const tr = K.transf(cv, K.limites(planta, pts.map(p => [p[0], p[1]])), 8); K.desenharFundo(g, cv, planta, tr);
      g.globalCompositeOperation = 'lighter';
      pts.forEach(p => { const x = tr.sx(p[0]), z = tr.sz(p[1]), gr = g.createRadialGradient(x, z, 0, x, z, 26); gr.addColorStop(0, 'rgba(190,40,30,.55)'); gr.addColorStop(1, 'rgba(190,40,30,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, z, 26, 0, 7); g.fill(); });
      g.globalCompositeOperation = 'source-over';
      cv.onclick = ev => {
        const r = cv.getBoundingClientRect(), mx = (ev.clientX - r.left) * cv.width / r.width, mz = (ev.clientY - r.top) * cv.height / r.height;
        const perto = pts.filter(p => Math.hypot(tr.sx(p[0]) - mx, tr.sz(p[1]) - mz) < 28);
        const info = $('#l6b-mm-info'); if (!perto.length) { info.innerHTML = '<small>Nada aqui. Clique numa mancha.</small>'; return; }
        const quem = {}; perto.forEach(p => quem[p[2]] = (quem[p[2]] || 0) + 1);
        const caps = [...new Set(perto.map(p => (R.capitulos[p[3]] || {}).titulo))];
        info.innerHTML = `<b>${perto.length}</b> ${perto.length === 1 ? 'morte' : 'mortes'} neste ponto: ${Object.entries(quem).map(([q, n]) => `${q === 'inspetor' ? 'Inspetor' : q === 'ana' ? 'a Menina' : 'a Procissão'} ×${n}`).join(', ')}<br><small>${esc(caps.join(' · '))}</small>`;
      };
      // replay
      const rp = $('#l6b-rp'); if (!rp || !capRota) return;
      const melhor = d.melhor[capRota], ult = d.ultima && d.ultima[capRota]; if (!melhor || !ult) return;
      const pl = d.plantas[melhor.mapa] || [], gr = rp.getContext('2d'), tr2 = K.transf(rp, K.limites(pl, melhor.rota.concat(ult.rota)), 8);
      const total = Math.max(melhor.rota.length, ult.rota.length); let i = 0, ultT = 0;
      const passo = ts => {
        if (!$('#l6b-rp')) return;
        if (ts - ultT > 60) { ultT = ts; i = (i + 2) % (total + 20); K.desenharFundo(gr, rp, pl, tr2); K.linha(gr, tr2, melhor.rota.slice(0, i), 'rgba(232,199,106,.9)', 2.4); K.linha(gr, tr2, ult.rota.slice(0, i), 'rgba(236,230,214,.9)', 2.4); const pa = melhor.rota[Math.min(i, melhor.rota.length - 1)], pb = ult.rota[Math.min(i, ult.rota.length - 1)]; gr.fillStyle = '#e8c76a'; gr.beginPath(); gr.arc(tr2.sx(pa[0]), tr2.sz(pa[1]), 4, 0, 7); gr.fill(); gr.fillStyle = '#ece6d6'; gr.beginPath(); gr.arc(tr2.sx(pb[0]), tr2.sz(pb[1]), 4, 0, 7); gr.fill(); }
        anim = requestAnimationFrame(passo);
      };
      anim = requestAnimationFrame(passo);
    }
  };

  // ================================================================= PERFIS
  VIEWS.perfis = {
    html() {
      const lista = perfis.lista(), at = perfis.atual(), visita = perfis.ehVisita(), tur = perfis.turma();
      const cards = lista.length ? lista.map(p => `<div class="l6b-card" style="border-color:${p.cor}"><b style="color:${p.cor}">${esc(p.nome)}</b> ${p.atual ? '<span class="l6b-novo">jogando agora</span>' : ''}${p.volatil ? ' <small>(visita, não grava)</small>' : ''}<br>${p.atual ? '' : `<button class="btn l6-mini" data-tr="${p.id}">trocar para este perfil</button> `}${!p.atual && !p.volatil ? `<button class="btn l6-mini" data-ap="${p.id}">apagar</button>` : ''}</div>`).join('') : `<div class="l6b-card"><b>${esc(at.nome)}</b> <span class="l6b-novo">jogando agora</span><br><small>Seu progresso atual é este perfil. Crie outro para dividir o aparelho com alguém sem apagar nada.</small></div>`;
      return `<p class="l6-dica">Até ${perfis.LIMITE} perfis no mesmo navegador: cada um com o seu save, conquistas, recordes e opções.</p>${cards}
      <div class="l6-add"><input type="text" id="l6b-pf-nome" maxlength="14" placeholder="nome do novo perfil" spellcheck="false"> ${btn('l6b-pf-criar', 'criar perfil')}</div>
      <div class="l6-add">${visita ? btn('l6b-pf-sair', 'sair da visita e voltar ao meu perfil') : btn('l6b-pf-vis', 'Visitante: começar sem gravar nada')}</div>
      <p class="l6-dica">Visitante: uma noite que não grava no save, nos recordes nem nas conquistas. As dicas vêm ligadas e o perfil verdadeiro volta sozinho, mesmo se a aba for fechada.</p>
      ${tur.length >= 2 ? '<h3 class="l6-dica">Placar da turma</h3>' + turmaHtml(tur) : ''}`;
    },
    ligar(el) {
      el.querySelectorAll('[data-tr]').forEach(b => b.onclick = () => perfis.trocar(b.dataset.tr));
      el.querySelectorAll('[data-ap]').forEach(b => b.onclick = () => { if (perfis.apagar(b.dataset.ap)) render('perfis'); });
      const cr = $('#l6b-pf-criar'); if (cr) cr.onclick = () => { const r = perfis.criar($('#l6b-pf-nome').value); if (r.erro) { C.toast && C.toast(r.erro); return; } K.atualizarTituloGancho && K.atualizarTituloGancho(); render('perfis'); };
      const v = $('#l6b-pf-vis'); if (v) v.onclick = () => perfis.visitante();
      const s = $('#l6b-pf-sair'); if (s) s.onclick = () => perfis.sairVisita();
      const tc = $('#l6b-turma-cop'); if (tc) tc.onclick = copiarBtn(tc, () => perfis.textoTurma(), 'copiar o placar');
    }
  };

  return { abrir: render, jogarCodigo, perfis };
}
