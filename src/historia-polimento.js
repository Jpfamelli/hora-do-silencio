// HISTÓRIA — POLIMENTO (Lote 3): a forma como o texto aparece e os segredos de texto da plataforma.
// Créditos que contam o depois (com cena escondida e um segredo depois do último nome), o Chamado
// que aprende o nome digitado no título, nomes que o internato reconhece, combinações do cofre que
// contam história, a bateria de verdade do aparelho, epígrafes da segunda noite, legendas com
// sussurro/grito/chiado e acessibilidade (leitores de tela, menos movimento, texto simples).
// Instalado por src/historia.js. Todo o texto mora em roteiro.js (R.lote3).

import { HINO } from './audio-mundo.js';

const CSS = `
#h3-cred{position:fixed;inset:0;z-index:60;background:#000;overflow:hidden;color:#cfc3a6;cursor:default;touch-action:none;user-select:none}
#h3-cred canvas{position:absolute;inset:0;width:100%;height:100%;opacity:.55;pointer-events:none}
#h3-cred .h3-rolo{position:absolute;left:50%;top:0;width:min(560px,calc(100vw - 32px));transform:translate(-50%,100vh);will-change:transform;text-align:center}
#h3-cred .h3-bl{background-color:#d2c5a4;color:#26304a;margin:0 0 70px;padding:34px 30px 30px;box-shadow:0 20px 60px #000,inset 0 0 50px rgba(90,60,20,.35);background-image:repeating-linear-gradient(transparent 0 29px,rgba(60,80,140,.18) 29px 30px),linear-gradient(#d9ccad,#c8b994);font-family:"IM Fell English",Georgia,serif;font-size:19px;line-height:1.5;transform:rotate(-.6deg)}
#h3-cred .h3-bl:nth-child(even){transform:rotate(.5deg)}
#h3-cred h1{font-family:"IM Fell English SC",Georgia,serif;font-weight:normal;font-size:clamp(26px,6vw,40px);letter-spacing:.12em;color:#2a2119;margin-bottom:10px}
#h3-cred h3{font-family:"Special Elite","Courier New",monospace;font-weight:normal;font-size:14px;letter-spacing:.2em;text-transform:uppercase;color:#5a4a36;margin:0 0 16px}
#h3-cred .rub{font-family:"Special Elite","Courier New",monospace;font-size:13px;color:#6d5d48;font-style:normal;margin:6px 0 14px}
#h3-cred .ds{margin:0 0 14px}
#h3-cred .ds b{display:block;font-family:"Special Elite","Courier New",monospace;font-weight:normal;font-size:15px;color:#2a2119}
#h3-cred .ds span{font-style:italic;color:#26304a}
#h3-cred .nm{font-family:"Special Elite","Courier New",monospace;font-size:16px;margin:2px 0;color:#2a2119}
#h3-cred .nm.risc{color:#8e1b14;text-decoration:line-through;text-decoration-color:#8e1b14;text-decoration-thickness:2px}
#h3-cred .seu{font-family:"IM Fell English",Georgia,serif;font-style:italic;font-size:26px;color:#26304a;position:relative;display:inline-block;margin-top:8px}
#h3-cred .seu::after{content:"";position:absolute;left:-6%;right:-6%;top:55%;height:3px;background:#5a1610;transform:rotate(-4deg) scaleX(0);transform-origin:left;animation:h3risca 1.4s 1.2s ease-in forwards}
@keyframes h3risca{to{transform:rotate(-4deg) scaleX(1)}}
#h3-cred .h3-pos{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(640px,calc(100vw - 32px));text-align:center;opacity:0;transition:opacity 1.6s}
#h3-cred .h3-pos.on{opacity:1}
#h3-cred .h3-pos .rub{color:#857a63}
#h3-cred .h3-pos .fala{font-size:22px;line-height:1.45;margin-top:14px}
#h3-cred .h3-pos .fala .rubrica{font-style:italic;opacity:.62;font-size:.86em}
#h3-cred .h3-pos .lia{margin-top:40px;font-size:15px;color:#9fc3d8;opacity:.0;transition:opacity 3s;letter-spacing:.08em}
#h3-cred .h3-pos .lia.on{opacity:.55}
#h3-cred .h3-pos .pista{margin-top:26px;font-family:"IM Fell English",Georgia,serif;font-style:italic;font-size:20px;color:#c9a75a;opacity:0;transition:opacity 2.5s}
#h3-cred .h3-pos .pista.on{opacity:.9}
#h3-cred .h3-pos .pista em{font-family:"Special Elite","Courier New",monospace;font-style:normal;font-size:13px;color:#857a63;display:block;margin-bottom:6px}
#h3-cred .h3-dica{position:absolute;left:0;right:0;bottom:0;padding:10px 16px 14px;background:linear-gradient(transparent,#000 45%);text-align:center;font-family:"Special Elite","Courier New",monospace;font-size:12px;color:#6d6452;pointer-events:none}
#h3-cred .h3-pular{position:absolute;right:16px;top:16px;min-width:88px;min-height:44px}
#h3-cred.paginas .h3-rolo{top:50%;transform:translate(-50%,-50%)}
#h3-cred.paginas .h3-bl{display:none;margin:0}
#h3-cred.paginas .h3-bl.on{display:block;animation:h3pag .9s ease-out}
@keyframes h3pag{from{opacity:0}}
#sub.h3-suss>span:last-child{font-size:.88em;letter-spacing:.07em;opacity:.86}
#sub.h3-grito>span:last-child{animation:subIn .2s ease-out,h3grito .09s 6 linear;font-weight:bold;letter-spacing:.02em}
@keyframes h3grito{25%{transform:translate(1.5px,-1px)}50%{transform:translate(-1.5px,1px)}75%{transform:translate(1px,1.5px)}}
#sub.h3-radio>span:last-child{animation:subIn .35s ease-out,h3chiado 2.4s steps(1) infinite}
@keyframes h3chiado{0%,100%{opacity:1}8%{opacity:.45}9%{opacity:1}46%{opacity:.7;filter:blur(.6px)}47%{opacity:1;filter:none}71%{opacity:.5}72%{opacity:1}}
#sub.h3-fita>span:last-child{font-family:"Special Elite","Courier New",monospace;font-size:.92em;letter-spacing:.01em}
#sub .h3-nome{text-decoration:underline wavy rgba(192,57,43,.7) 1px;text-underline-offset:4px}
#k-disp.h3-msg,#keypad .disp.h3-msg{font-size:26px;letter-spacing:.18em;color:#c0392b;animation:h3grito .09s 5 linear}
#k-disp.h3-conta,#keypad .disp.h3-conta{color:#e0c27a;text-shadow:0 0 12px rgba(201,167,90,.7)}
.paper .cab{display:block;font-variant:small-caps;letter-spacing:.06em;opacity:.85}
.paper .mao{display:inline-block;transform:rotate(-.4deg)}
.paper s{text-decoration-color:#8e1b14;text-decoration-thickness:2px}
#ending #e-txt{cursor:pointer}
@media (prefers-reduced-motion: reduce){#sub.h3-grito>span:last-child,#sub.h3-radio>span:last-child,#k-disp.h3-msg{animation:none}#h3-cred .h3-bl{transform:none}}
body.h3-simples #sub>span:last-child{animation:none!important;font-family:inherit!important;letter-spacing:normal!important;font-weight:normal!important}
`;

export function instalarPolimento(c, u) {
  const { R, lsGet, lsSet } = c;
  const { esc, nomeJogador, conqs, fmtFala, fmtNota } = u;
  const L = R.lote3 || {};
  const $ = s => document.querySelector(s);
  const S = () => c.S;
  const teste = () => !!window.__teste;
  const OPT = () => { const o = lsGet('hora-silencio-opt', {}); return o && typeof o === 'object' ? o : {}; };
  const menosMov = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const pick = a => a[Math.random() * a.length | 0];
  // nome sem acento e em maiúsculas, para reconhecer "Tomé", "tome", "TOMÉ"
  const norm = s => String(s || '').normalize('NFD').replace(/\p{M}/gu, '').toUpperCase().trim();
  const nomeBonito = () => nomeJogador().toLowerCase().replace(/(^|[\s-])(\S)/g, (m, a, b) => a + b.toUpperCase());
  const comNome = t => String(t || '').replace(/\{nome\}/g, nomeBonito() || 'Lia');
  const sub = (f, prio) => { if (f) c.sub(f.quem, comNome(f.texto), prio); };

  if (!document.getElementById('h3-css')) { const st = document.createElement('style'); st.id = 'h3-css'; st.textContent = CSS; document.head.appendChild(st); }

  // ------------------------------------------------------------------
  // Acessibilidade: o texto que aparece sozinho é anunciado por leitores de tela
  // ------------------------------------------------------------------
  for (const [sel, papel] of [['#sub', 'status'], ['#toast', 'status'], ['#chapter', 'status'], ['#cartao', 'status'], ['#e-txt', 'region']]) {
    const el = $(sel); if (!el) continue;
    if (!el.hasAttribute('role')) el.setAttribute('role', papel);
    if (!el.hasAttribute('aria-live')) el.setAttribute('aria-live', sel === '#e-txt' ? 'off' : 'polite');
  }
  const eTxt = $('#e-txt'); if (eTxt && !eTxt.hasAttribute('aria-label')) eTxt.setAttribute('aria-label', 'Texto do final');

  // ------------------------------------------------------------------
  // Legendas: sussurro, grito, rádio com chiado, fita datilografada, o seu nome sublinhado
  // ------------------------------------------------------------------
  const elSub = $('#sub');
  const MAIUSC = /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{4,}/;
  function estilizarSub() {
    const simples = !!OPT().textoSimples; document.body.classList.toggle('h3-simples', simples);
    elSub.classList.remove('h3-suss', 'h3-grito', 'h3-radio', 'h3-fita');
    if (simples || !elSub.lastElementChild) return;
    const fala = elSub.lastElementChild.textContent || '', quem = (elSub.firstElementChild && elSub.firstElementChild.textContent || '').trim();
    if (/^\((sussurr|bem baix|baixinho|cochich|quase sem voz|baixo\))/i.test(fala)) elSub.classList.add('h3-suss');
    else if (fala.includes('!') && MAIUSC.test(fala)) elSub.classList.add('h3-grito');
    if (R.personagens.radio && quem === R.personagens.radio.nome) elSub.classList.add('h3-radio');
    else if (/^\(na fita/i.test(fala)) elSub.classList.add('h3-fita');
    const nome = nomeBonito();
    if (nome && nome.length >= 2 && fala.includes(nome) && !elSub.querySelector('.h3-nome')) {
      // só nos nós de texto (nunca dentro de uma tag)
      const tw = document.createTreeWalker(elSub.lastElementChild, NodeFilter.SHOW_TEXT), nos = [];
      while (tw.nextNode()) nos.push(tw.currentNode);
      for (const no of nos) {
        const partes = no.nodeValue.split(nome); if (partes.length < 2) continue;
        const frag = document.createDocumentFragment();
        partes.forEach((p, i) => { if (i) { const s = document.createElement('span'); s.className = 'h3-nome'; s.textContent = nome; frag.appendChild(s); } if (p) frag.appendChild(document.createTextNode(p)); });
        no.parentNode.replaceChild(frag, no);
      }
    }
  }
  if (elSub) new MutationObserver(estilizarSub).observe(elSub, { childList: true });

  // ------------------------------------------------------------------
  // Final: tocar/clicar no texto (ou E) mostra todos os parágrafos de uma vez
  // ------------------------------------------------------------------
  function revelarTudo() { const el = $('#e-txt'); if (!el) return; el.querySelectorAll('.par').forEach(p => { p.style.animationDelay = '0s'; }); }
  if (eTxt) eTxt.addEventListener('click', revelarTudo);
  addEventListener('keydown', e => { const en = $('#ending'); if (e.code === 'KeyE' && en && !en.hidden && !cred) revelarTudo(); });

  // ------------------------------------------------------------------
  // Bateria de verdade: abaixo de 10% e fora da tomada, a Lia comenta e a pilha do jogo dura mais
  // ------------------------------------------------------------------
  let bat = null, pilhaGentil = false, pilhaDita = false;
  try { if (navigator.getBattery) navigator.getBattery().then(b => { bat = b; }).catch(() => {}); } catch (e) {}
  const bateriaFraca = () => !!(bat && !bat.charging && bat.level < .1);

  // ------------------------------------------------------------------
  // Fala com voz de verdade (speechSynthesis), lenta e grave; some ao pausar ou morrer
  // ------------------------------------------------------------------
  let falando = false;
  try { if (window.speechSynthesis) speechSynthesis.getVoices(); } catch (e) {} // as vozes carregam devagar: pede cedo
  function falarVoz(txt, perto) {
    if (teste() || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    const o = OPT(), vol = (o.vol ?? 1) * (o.vVoz ?? 1); if (!(vol > 0)) return;
    try {
      const vs = speechSynthesis.getVoices(), v = vs.find(x => /^pt[-_]BR/i.test(x.lang)) || vs.find(x => /^pt/i.test(x.lang));
      const ut = new SpeechSynthesisUtterance(txt); if (v) ut.voice = v; ut.lang = 'pt-BR'; ut.rate = .6; ut.pitch = .3; ut.volume = Math.min(1, vol * (perto ? .8 : .22));
      ut.onend = ut.onerror = () => { falando = false; };
      speechSynthesis.cancel(); speechSynthesis.speak(ut); falando = true;
    } catch (e) { falando = false; }
  }

  // ------------------------------------------------------------------
  // O Chamado diz o seu nome (uma vez por capítulo; uma vez por noite, bem perto)
  // ------------------------------------------------------------------
  let nomeEspera = null; // { t, resp } — se você não for, a Lia comenta e vem a conquista
  function chamadoNome(St) {
    const nome = nomeBonito(); if (!nome || !L.chamadoNome || teste()) return null;
    if (norm(nome) === 'LIA') return null; // o seu nome já é o dela
    const k = 'h3nome' + St.chapter; if (St.flags[k]) return null; St.flags[k] = true;
    const perto = !St.flags.h3perto && (St.chapter >= 4 || Math.random() < .35);
    if (perto) { St.flags.h3perto = true; St.fear = Math.max(St.fear || 0, 75); try { c.SFX.sussurros(1.2); } catch (e) {} }
    const texto = comNome(perto ? L.chamadoPerto : pick(L.chamadoNome));
    falarVoz(nome + '...', perto);
    nomeEspera = { t: 0, resp: St.flags.respondeu || 0 };
    return { quem: 'voz', texto };
  }

  // ------------------------------------------------------------------
  // Nomes que o internato reconhece (abertura no carro; Ana; tela de morte)
  // ------------------------------------------------------------------
  const XARAS = ['ANA', 'MOACIR', 'DAVI', 'LIA', 'TOME', 'ALBANO', 'CELESTE', 'JOAQUIM'];
  function aoComecar(St) {
    aplicarNoite(St); ult = St; // o cartão do prólogo já sai com a epígrafe da noite certa
    const nome = nomeJogador(); if (!nome || !L.nomes) return;
    const n = norm(nome), f = L.nomes[n] || L.nomes.outro; if (!f) return;
    if (XARAS.includes(n)) { St.flags.h3xara = n; c.conquista('xara'); }
    if (!R.abertura) return;
    const linha = { t: 24.4, quem: f.quem, texto: comNome(f.texto) };
    R.abertura.push(linha); R.abertura.sort((a, b) => a.t - b.t);
    setTimeout(() => { const i = R.abertura.indexOf(linha); if (i >= 0) R.abertura.splice(i, 1); }, 0); // a cena copia a lista na hora
  }
  const telaMorte = $('#death');
  if (telaMorte) new MutationObserver(() => {
    if (telaMorte.hidden) return; const St = S(); if (!St) return;
    const n = norm(nomeJogador());
    if (St.causa === 'ana' && n === 'ANA' && L.anaMorte) $('#dt-tit').textContent = L.anaMorte;
    else if (St.causa === 'inspetor' && n && n !== 'LIA' && L.inspetorNome && Math.random() < .3) $('#death-frase').textContent = comNome(L.inspetorNome);
  }).observe(telaMorte, { attributes: true, attributeFilter: ['hidden'] });

  // ------------------------------------------------------------------
  // Segunda noite e Pesadelo: epígrafes e ganchos que lembram de você
  // ------------------------------------------------------------------
  const base = R.capitulos.map(cp => ({ ep: cp.epigrafe, g: cp.gancho }));
  function aplicarNoite(St) {
    const cq = conqs(), ng = (St.flags._noite || 0) >= 2 || cq.final_comum || cq.final_silencio || cq.final_verdadeiro;
    R.capitulos.forEach((cp, i) => {
      cp.epigrafe = (ng && L.epigrafeNG && L.epigrafeNG[cp.id]) || base[i].ep;
      cp.gancho = (St.dif === 'pesadelo' && L.ganchoPesadelo && L.ganchoPesadelo[cp.id]) || base[i].g;
    });
  }

  // ------------------------------------------------------------------
  // Teclados: combinações que contam história (nada disso abre nada)
  // ------------------------------------------------------------------
  function mostrarDisp(txt, cls, ms = 1800) {
    setTimeout(() => {
      const d = $('#k-disp'); if (!d || $('#keypad').hidden) return;
      const volta = d.textContent; if (txt) d.textContent = txt; d.classList.add(cls);
      setTimeout(() => { d.classList.remove(cls); if (txt && d.textContent === txt) d.textContent = volta; }, ms);
    }, 0);
  }
  function apagarLuzes() {
    const fx = $('#fx-black'); if (!fx) return;
    const ant = fx.style.opacity; fx.style.opacity = .93; try { c.SFX.clique(); } catch (e) {}
    setTimeout(() => { if (fx.style.opacity === '0.93') fx.style.opacity = ant || 0; try { c.SFX.clique(); } catch (e) {} }, 2000);
    setTimeout(() => sub(L.codigos && L.codigos.apagou), 2200);
  }
  function codigo(cofre, dig, marca) {
    const K = L.codigos || {};
    if (cofre && dig === String(new Date().getFullYear())) { marca('agora'); mostrarDisp(K.tardeDisp, 'h3-msg', 2200); sub(K.tarde); c.conquista('tarde_demais'); return true; }
    const tab = cofre ? { '1994': K.c1994, '1931': K.c1931, '2104': K.c2104 } : { '023': K.q023, '037': K.q037 };
    if (tab[dig]) { marca(dig); mostrarDisp('', 'h3-conta'); sub(tab[dig]); if (dig === '2104') try { c.SFX.sussurros(1); } catch (e) {} return true; }
    return false;
  }

  // ------------------------------------------------------------------
  // Fitas ouvidas (painel do título): cor de quem fala, rubricas e as secretas contadas
  // ------------------------------------------------------------------
  function painelFitas(l) {
    const sec = R.fitas.filter(f => f.secreta && l.includes(f.id)).length;
    const tit = `Fitas ouvidas ${l.length}/${R.fitas.length}` + (sec && L.fitasSecretas ? ` · ${L.fitasSecretas.replace('{n}', sec)}` : '');
    const html = R.fitas.map(f => l.includes(f.id)
      ? `<div class="it"><div><b>▶ ${esc(f.titulo)}</b><br><small>${f.linhas.map(x => { const p = R.personagens[x.quem] || {}; return `<span style="color:${p.cor || 'inherit'}">${esc(p.nome || '')}</span>: ${fmtFala(x.texto.replace(/\{[a-z0-9]+\}/g, '…'))}`; }).join('<br>')}</small></div></div>`
      : `<div class="it x"><div><b>???</b><br><small>${f.secreta ? 'Uma fita que não quer ser achada.' : 'Ainda não ouvida.'}</small></div></div>`).join('');
    return { tit, html };
  }

  // ------------------------------------------------------------------
  // Título: datas especiais, o nome anotado, botão dos créditos, telefone e rádio-relógio
  // ------------------------------------------------------------------
  function subDaData() {
    const d = new Date(), h = d.getHours(), D = L.datas || {};
    if (d.getDate() === 2 && d.getMonth() === 10 && D.finados) return { t: D.finados, forte: true };
    if (d.getDay() === 5 && d.getDate() === 13 && D.sexta13) return { t: D.sexta13, forte: true };
    if (h >= 0 && h < 4 && D.madrugada) return { t: D.madrugada, forte: false };
    return null;
  }
  let subTO = 0;
  function subTemp(t, ms = 6000) {
    const s = $('#t-sub'); if (!s || !t) return; const o = s.textContent; s.textContent = t; s.classList.add('segredo');
    clearTimeout(subTO); subTO = setTimeout(() => { if (s.textContent === t) { s.textContent = o; s.classList.remove('segredo'); } }, ms);
  }
  const algumFinal = () => { const cq = conqs(); return !!(cq.final_comum || cq.final_silencio || cq.final_verdadeiro); };
  function titulo() {
    const s = $('#t-sub'), dd = subDaData();
    if (s && dd && new Date().getHours() !== 21 && (dd.forte || s.textContent === R.subtitulo)) s.textContent = dd.t;
    // créditos de novo, a partir do primeiro final
    let b = $('#b-creditos'); const bf = $('#b-fitas');
    if (!b && bf && L.creditos) { b = document.createElement('button'); b.className = 'btn'; b.id = 'b-creditos'; b.textContent = L.creditos.botao; bf.insertAdjacentElement('afterend', b); b.onclick = () => creditos(lsGet('h3-ultfinal', 'comum'), false); }
    if (b) b.hidden = !algumFinal();
    // depois dos créditos: o telefone da recepção toca três vezes e para
    if (lsGet('h3-telefone', false) && c.AC && !teste()) {
      lsSet('h3-telefone', false);
      setTimeout(() => { if (c.mode !== 'titulo') return; try { c.SFX.orelhao(null); } catch (e) {} subTemp(L.creditos && L.creditos.telefone, 8500); }, 2600);
    }
  }
  // na noite seguinte (a próxima vez que o jogo abre), o rádio-relógio marca 21:04 por alguns segundos
  let relogioAte = 0;
  if (lsGet('h3-2104', false)) { lsSet('h3-2104', false); relogioAte = performance.now() + 15000; setTimeout(() => subTemp(L.creditos && L.creditos.relogio, 7000), 1200); }
  const relTimer = setInterval(() => {
    if (!relogioAte) return; if (performance.now() > relogioAte) { relogioAte = 0; clearInterval(relTimer); return; }
    const el = $('#radiorel'); if (!el || c.mode !== 'titulo') return;
    const h = el.querySelector('.h'), m = el.querySelector('.m'); if (h && m) { h.textContent = '21'; m.textContent = '04'; el.classList.add('parado'); }
  }, 120);
  // o nome digitado é "anotado" quando o campo perde o foco
  const inp = $('#o-nome');
  if (inp) inp.addEventListener('change', () => { const n = nomeBonito(); if (n && L.nomeTitulo) subTemp(comNome(L.nomeTitulo), 4500); });

  // ------------------------------------------------------------------
  // Quadro a quadro (só com o jogo correndo)
  // ------------------------------------------------------------------
  let ult = null, flashAnt = false, batAnt = null;
  function tick(dt) {
    const St = S(); if (!St) return;
    if (St !== ult) { ult = St; aplicarNoite(St); flashAnt = !!St.flashOn; batAnt = St.battery; nomeEspera = null; }
    // bateria do aparelho
    if (St.flashOn && !flashAnt && !pilhaDita && bateriaFraca() && L.bateria) { pilhaDita = true; pilhaGentil = true; setTimeout(() => sub(L.bateria), 500); c.conquista('pilha_lia'); }
    flashAnt = !!St.flashOn;
    if (pilhaGentil && St.flashOn && batAnt != null && St.battery < batAnt && batAnt - St.battery < 3) St.battery += (batAnt - St.battery) * .2;
    batAnt = St.battery;
    // Ana: quem tem o nome dela faz a contagem parar no nove (uma vez por noite)
    const A = c.ANA;
    if (A && A.ativa && A.conta === 9 && !St.flags.h3anaNove && norm(nomeJogador()) === 'ANA' && L.anaNove) { St.flags.h3anaNove = true; A.conta = 3; sub(L.anaNove, true); }
    // quem tem o nome de alguém daqui ouve dessa pessoa, uma vez por noite, no lugar certo
    const NJ = L.nomeJogo, nj = NJ && NJ[norm(nomeJogador())];
    if (nj && !St.flags.h3nomeJogo && !St.dead) {
      const n = norm(nomeJogador()), P = c.P, W = c.W, sala = P && P.room && P.room.id;
      const hora = (n === 'MOACIR' && St.flags.avist) || (n === 'DAVI' && St.done.capela) || (n === 'TOME' && St.hidden && St.chapter >= 2) || (n === 'CELESTE' && W && W.mapa === 'superior' && sala === 'celeste');
      if (hora) { St.flags.h3nomeJogo = true; setTimeout(() => { if (S() === St && !St.dead) sub(nj); }, 2500); }
    }
    // o chamado do seu nome: se você não for, a Lia estranha
    if (nomeEspera) {
      nomeEspera.t += dt;
      if ((St.flags.respondeu || 0) > nomeEspera.resp) nomeEspera = null;
      else if (nomeEspera.t > 16) { nomeEspera = null; if (!St.dead) { sub(L.ignorouNome); c.conquista('seu_nome'); } }
    }
    if (falando && (St.dead || c.ui === 'pausa')) { try { speechSynthesis.cancel(); } catch (e) {} falando = false; }
  }

  // ------------------------------------------------------------------
  // CRÉDITOS — páginas do caderno da Lia, sobre a chuva, com o hino ao contrário
  // ------------------------------------------------------------------
  let cred = null;
  function hinoAoContrario() {
    const AC = c.AC; if (!AC || teste()) return null;
    const o = OPT(), vol = (o.vol ?? 1) * (o.vAmb ?? 1) * .07; if (!(vol > 0)) return null;
    const out = AC.createGain(); out.gain.value = vol; out.connect(AC.destination);
    const notas = HINO.slice().reverse(), beat = 60 / 34; let parar = false, to = 0;
    const nota = (f, t0, dur) => {
      for (const [k, tipo, a] of [[1, 'triangle', 1], [2, 'sine', .3], [.5, 'sine', .25]]) {
        const os = AC.createOscillator(), g = AC.createGain(); os.type = tipo; os.frequency.value = f * k; os.detune.value = -28 + Math.random() * 10;
        g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(a, t0 + .015); g.gain.exponentialRampToValueAtTime(.0008, t0 + Math.max(.9, dur * 1.3));
        os.connect(g); g.connect(out); os.start(t0); os.stop(t0 + Math.max(.9, dur * 1.3) + .05);
      }
    };
    const volta = () => {
      if (parar) return; let t = AC.currentTime + .3;
      for (const [f, d] of notas) { nota(f, t, d * beat); t += d * beat; }
      to = setTimeout(volta, (t - AC.currentTime + beat * 2) * 1000);
    };
    volta();
    return () => { parar = true; clearTimeout(to); try { out.gain.setTargetAtTime(0, AC.currentTime, .4); setTimeout(() => { try { out.disconnect(); } catch (e) {} }, 2500); } catch (e) {} };
  }
  function chuva(cv) {
    const g = cv.getContext('2d'); let w = 0, h = 0;
    const ajustar = () => { w = cv.width = Math.max(160, innerWidth / 2 | 0); h = cv.height = Math.max(120, innerHeight / 2 | 0); };
    ajustar();
    const gotas = Array.from({ length: 70 }, () => ({ x: Math.random() * w, y: Math.random() * h, v: 140 + Math.random() * 160, l: 6 + Math.random() * 10 }));
    const pinta = dt => {
      g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(160,170,190,.35)'; g.lineWidth = 1; g.beginPath();
      for (const p of gotas) { p.y += p.v * dt; p.x -= p.v * dt * .12; if (p.y > h) { p.y = -p.l; p.x = Math.random() * w * 1.1; } g.moveTo(p.x, p.y); g.lineTo(p.x + p.l * .12, p.y - p.l); }
      g.stroke();
    };
    pinta(0);
    return { pinta, ajustar };
  }
  function montar(tipo) {
    const T = L.creditos, cq = conqs(), nome = nomeBonito();
    const ds = (T.destinos[tipo] || T.destinos.comum).map(([n, d]) => `<p class="ds"><b>${esc(n)}</b><span>${esc(d)}</span></p>`).join('');
    const ints = T.internos.map(n => `<p class="nm${T.riscados.includes(n) ? ' risc' : ''}">${esc(n)}</p>`).join('');
    const ant = (T.antes[tipo] || T.antes.comum).map(([n, d]) => `<p class="ds"><b>${esc(n)}</b><span>${esc(d)}</span></p>`).join('');
    const mem = T.memoria.map(([n, d]) => `<p class="ds"><b>${esc(n)}</b><span>${esc(d)}</span></p>`).join('');
    const tudo = cq.final_comum && cq.final_silencio && cq.final_verdadeiro && cq.quarta_crianca;
    const seu = tudo && nome ? `<p class="rub">${esc(T.seuNomeRubrica)}</p><span class="seu">${esc(nome)}</span>` : '';
    return [
      `<h1>${esc(T.titulo)}</h1><p class="rub">${esc(T.rubrica)}</p>`,
      `<h3>${esc(T.destinosTitulo)}</h3>${ds}`,
      `<h3>${esc(T.internosTitulo)}</h3>${ints}<p class="rub">${esc(T.internosRubrica)}</p>`,
      `<h3>${esc(T.antesTitulo)}</h3>${ant}`,
      `<h3>${esc(T.memoriaTitulo)}</h3>${mem}`,
      `${T.feito.map(t => `<p>${esc(t)}</p>`).join('')}<p class="rub">${esc(T.fim)}</p>${seu}`
    ].map(h => `<div class="h3-bl">${h}</div>`).join('');
  }
  function creditos(tipo, auto) {
    if (cred || !L.creditos || (auto && teste())) return;
    const T = L.creditos; tipo = R.finais[tipo] ? tipo : 'comum';
    const ov = document.createElement('div'); ov.id = 'h3-cred'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Créditos');
    const pag = menosMov(); if (pag) ov.classList.add('paginas');
    ov.innerHTML = `<canvas aria-hidden="true"></canvas><div class="h3-rolo" aria-live="polite">${montar(tipo)}</div><div class="h3-pos"></div><button class="btn h3-pular">${esc(T.botaoPular)}</button><div class="h3-dica">${esc(T.pular)}</div>`;
    document.body.appendChild(ov);
    const rolo = ov.querySelector('.h3-rolo'), pos = ov.querySelector('.h3-pos'), dica = ov.querySelector('.h3-dica');
    const ch = pag ? null : chuva(ov.querySelector('canvas'));
    const pararHino = hinoAoContrario();
    cred = { tipo, y: innerHeight, rapido: false, fase: 'rolo', raf: 0, tos: [], viuFim: false, pagI: 0, pagT: 0, ultT: performance.now(), chT: 0 };
    const blocos = [...rolo.querySelectorAll('.h3-bl')]; if (pag) blocos[0].classList.add('on');
    const fechar = () => {
      if (!cred) return; const C = cred; cred = null;
      cancelAnimationFrame(C.raf); C.tos.forEach(clearTimeout); if (pararHino) pararHino();
      removeEventListener('keydown', tecla, true); removeEventListener('keyup', solta, true); clearInterval(C.vigia);
      ov.remove();
      if (C.viuFim) { lsSet('h3-telefone', true); lsSet('h3-2104', true); }
    };
    const depois = (ms, fn) => cred.tos.push(setTimeout(() => { if (cred) fn(); }, ms));
    const posCreditos = () => {
      cred.fase = 'pos'; cred.viuFim = true; c.conquista('creditos_fim');
      rolo.hidden = true; dica.textContent = '';
      const f = T.pos[tipo] || T.pos.comum, p = R.personagens[f.quem] || {};
      depois(1200, () => {
        try { c.SFX.fitaClique(); c.SFX.estatica(.6); } catch (e) {}
        pos.innerHTML = `<p class="rub">${esc(T.posRubrica)}</p><p class="fala" style="color:${p.cor || '#cfc3a6'}">${fmtFala(f.texto)}</p><p class="lia">${esc(T.espera)}</p><p class="pista"></p>`;
        pos.classList.add('on');
      });
      // quem espera 20 s no escuro depois da fita ouve chamarem a Lia, e ganha uma pista à mão
      depois(1200 + 9000 + 20000, () => {
        try { c.SFX.sussurros(.8); } catch (e) {}
        pos.querySelector('.lia').classList.add('on');
        depois(3200, () => {
          const cq = conqs(), P = T.pistas, t = !cq.final_verdadeiro ? P.verdadeiro : !cq.quarta_crianca ? P.quarta : P.tudo;
          const el = pos.querySelector('.pista'); el.innerHTML = fmtNota(t); el.classList.add('on');
          c.conquista('ultimo_nome'); dica.textContent = T.voltar;
        });
      });
      depois(1200 + 6000, () => { if (!dica.textContent) dica.textContent = T.voltar; });
    };
    const passo = agora => {
      if (!cred) return;
      const dt = Math.min(.25, (agora - cred.ultT) / 1000); cred.ultT = agora;
      cred.chT += dt; if (ch && cred.chT >= 1 / 30) { ch.pinta(cred.chT); cred.chT = 0; }
      if (cred.fase === 'rolo') {
        if (pag) {
          cred.pagT += dt * (cred.rapido ? 4 : 1);
          if (cred.pagT > 7) { cred.pagT = 0; blocos[cred.pagI].classList.remove('on'); cred.pagI++; if (cred.pagI >= blocos.length) posCreditos(); else blocos[cred.pagI].classList.add('on'); }
        } else {
          cred.y -= dt * 46 * (cred.rapido ? 5 : 1);
          rolo.style.transform = `translate(-50%,${cred.y.toFixed(1)}px)`;
          if (cred.y < -rolo.offsetHeight - 40) posCreditos();
        }
      }
      cred.raf = requestAnimationFrame(passo);
    };
    const tecla = e => {
      if (!cred) return; e.stopImmediatePropagation(); e.preventDefault();
      if (e.code === 'Space') cred.rapido = true;
      else if (['Escape', 'Enter', 'KeyE', 'NumpadEnter', 'Backspace'].includes(e.code)) fechar();
      else if (cred.fase === 'pos' && dica.textContent === T.voltar) fechar();
    };
    const solta = e => { if (cred && e.code === 'Space') { cred.rapido = false; e.stopImmediatePropagation(); } };
    addEventListener('keydown', tecla, true); addEventListener('keyup', solta, true);
    ov.querySelector('.h3-pular').onclick = e => { e.stopPropagation(); fechar(); };
    ov.addEventListener('pointerdown', e => { if (!cred || e.target.closest('.h3-pular')) return; if (cred.fase === 'pos') { if (dica.textContent === T.voltar) fechar(); return; } cred.rapido = true; });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) ov.addEventListener(ev, () => { if (cred) cred.rapido = false; });
    addEventListener('resize', () => { if (ch && cred) ch.ajustar(); });
    // voltar ao menu (ou a tela final sumir) fecha os créditos
    cred.doTitulo = c.mode === 'titulo';
    cred.vigia = setInterval(() => { const en = $('#ending'); if (cred && !cred.doTitulo && en && en.hidden) fechar(); }, 500);
    cred.raf = requestAnimationFrame(passo);
    window.__h3cred = { fechar, estado: () => cred && { fase: cred.fase, y: cred.y }, irPara: y => { if (cred) { cred.y = y; cred.pagI = Math.min(cred.pagI, blocos.length - 1); } } }; // para o kit de teste
  }

  // ------------------------------------------------------------------
  // Tela final: botão Créditos e créditos automáticos depois do texto (e do epílogo)
  // ------------------------------------------------------------------
  let vigiaFinal = 0;
  function aoFinal(tipo) {
    lsSet('h3-ultfinal', tipo);
    clearInterval(vigiaFinal); let visto = 0, viuEpi = false, auto = false;
    vigiaFinal = setInterval(() => {
      const en = $('#ending'); if (!en) return clearInterval(vigiaFinal);
      if (en.hidden) { if (visto) clearInterval(vigiaFinal); return; }
      if (!visto) {
        visto = performance.now();
        let b = $('#e-creditos');
        if (!b && L.creditos) { b = document.createElement('button'); b.className = 'btn'; b.id = 'e-creditos'; b.textContent = L.creditos.botao; const m = $('#e-menu'); if (m) m.insertAdjacentElement('beforebegin', b); }
        if (b) b.onclick = () => creditos(tipo, false);
      }
      if (auto || cred) return;
      const pars = $('#e-txt') ? $('#e-txt').querySelectorAll('.par').length : 4, passou = performance.now() - visto;
      const epi = !!$('#pgm-epilogo'); if (epi) viuEpi = true;
      if (tipo === 'verdadeiro') { if ((viuEpi && !epi) || (!viuEpi && passou > pars * 1400 + 22000)) { auto = true; setTimeout(() => creditos(tipo, true), 1500); } }
      else if (passou > pars * 1400 + 8000) { auto = true; creditos(tipo, true); }
    }, 500);
  }
  function faltaFinais() {
    const cq = conqs(), F = L.faltaFinal || {}, falta = ['comum', 'silencio', 'verdadeiro'].filter(k => !cq['final_' + k]).map(k => F[k]).filter(Boolean);
    return falta.length && falta.length < 3 ? (L.faltaRotulo || '') + falta.join(' · ') : '';
  }

  window.__hist3 = { creditos, codigo, chamadoNome, norm, aplicarNoite };
  return { tick, chamadoNome, aoComecar, codigo, apagarLuzes, painelFitas, titulo, aoFinal, faltaFinais, cofre1979: () => L.codigos && L.codigos.cofre1979, revelarTudo, creditos, aberto: () => !!cred };
}
