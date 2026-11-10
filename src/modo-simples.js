// MODO SIMPLES (padrão ligado). Depois dos lotes 1-7 o jogo ficou com avisos, legendas, vozes e eventos demais
// ao mesmo tempo: o jogador não sabia quem fazia barulho, o Inspetor falava antes de existir e o objetivo se perdia.
// Este módulo é só o "porteiro": decide o que pode aparecer/tocar. Não escreve estado do jogo e é à prova de erro.
// Quem chama: jogo.js (sub, proxSub, toast, loop, VOZ), src/interface.js (legendas de som). Opção: OPT.simples.
export function criarSimples(C) {
  const { OPT } = C;
  if (OPT.simples === undefined) OPT.simples = true;
  // telas de entrada: o "Antes de entrar" já avisa de flashes; o teste de fones e a calibragem ficam no botão Som
  if (OPT.avisoVisto === undefined) OPT.avisoVisto = true;
  if (OPT.l7Calib === undefined) OPT.l7Calib = true;
  const on = () => OPT.simples !== false;
  const cap = () => { try { const S = C.S(); return S ? S.chapter : 0; } catch (e) { return 0; } };

  // ---- o que some da tela no modo simples (continua valendo no jogo, só não aparece por cima)
  const st = document.createElement('style');
  st.textContent = `
  body.simples #conq, body.simples #placa-sala, body.simples #ml-leg, body.simples #l5-leg, body.simples #l5b-leg, body.simples #ms-leg,
  body.simples #l7-climaleg, body.simples #l7i-camuf, body.simples [id^="l7h-"], body.simples [id^="l6b-tel"], body.simples #pl-dica,
  body.simples #l7i-anel, body.simples .l7i-leg { display: none !important; }
  body.simples #sg-selo { display: none !important; } /* a estrela grande no canto da tela */
  body.simples #legsom { max-width: min(560px, 86vw); }
  /* fim de capítulo e morte: sem cartas, telemetria, imagens para copiar e painéis de rejogo */
  body.simples #fimcap [id^="l7"], body.simples #fimcap [id^="l6"], body.simples #fimcap [id^="l5"], body.simples #fimcap [id^="s7p"], body.simples #fimcap #fc-l5,
  body.simples #death [id^="l7"], body.simples #death [id^="l6"], body.simples #death [id^="l5"], body.simples #death-l5, body.simples #death-retrato { display: none !important; }
  /* tela de título: só o menu e o que importa para continuar */
  body.simples #title #rot-ver, body.simples #title #t-memoria, body.simples #title #s7p-fones-oferta, body.simples #title #p3-pct,
  body.simples #title #l6-meta, body.simples #title #l6b-linha, body.simples #title #sg-oculto, body.simples #title #l6b-chip,
  body.simples #title #l3-insonia, body.simples #title #b-semana, body.simples #title #l6-rejogar, body.simples #title #b-calsom,
  body.simples #title #b-l6-modos, body.simples #title #b-l6-recordes, body.simples #title #b-l6-noites, body.simples #title #b-l6-placar,
  body.simples #title #b-l6-mortes, body.simples #title #b-s7p-sons, body.simples #title #b-l6b, body.simples #title #b-l7-fone,
  body.simples #title #b-stats, body.simples #title #b-rejogo, body.simples #title #b-l7, body.simples #title #b-l4,
  body.simples #title #b-l5-best, body.simples #title #b-l5-rejogo, body.simples #title #b-l5b-modos, body.simples #title #b-l5b-noites,
  body.simples #title #b-modos6, body.simples #title #l6-repetir, body.simples #title #pl5b-share, body.simples #title #pl5c-share,
  body.simples #title #pl5-instalar, body.simples #title #t-mandar { display: none !important; }
  `;
  document.head.appendChild(st);
  const marca = () => { document.body.classList.toggle('simples', on()); try { const f = document.getElementById('faro'); if (f && (C.mode() !== 'jogo' || C.ui())) f.hidden = true; } catch (e) {} };
  marca(); setInterval(marca, 500);

  // ---- legendas de som: só perigo de verdade, uma por vez, e só quando existe perigo (capítulo 1 em diante)
  function legNao(def, dr) {
    if (!on() || OPT.legSom === 'todos') return false;
    if (cap() < 1) return true;
    const perigo = def && (def.cat === 'p' || def.cat === 'dele');
    if (!perigo) return true;
    if (dr && dr.d > 16) return true;
    return false;
  }
  const maxLeg = () => (on() && OPT.legSom !== 'todos' ? 1 : 3);

  // ---- falas: o Inspetor não fala no prólogo; frases soltas (que não vêm do roteiro) têm intervalo
  let ultSolta = -1e9;
  function subNao(quem, texto, prioridade) {
    if (!on()) return false;
    if (quem === 'inspetor' && cap() === 0) return true;
    if (prioridade) return false;
    // comentário solto vindo de módulo extra (src/*): não aparece. O que conta a história vem do roteiro, do diálogo, da fita ou do motor.
    try { if (String(new Error().stack || '').split(/\r?\n/).some(l => !/modo-simples/.test(l) && /[/]src[/]/.test(l))) return true; } catch (e) {}
    const agora = performance.now();
    if (agora - ultSolta < 9000) return true;
    ultSolta = agora; return false;
  }
  // falar(chave): só as falas do roteiro base; as falas soltas dos módulos extras (comentários da Lia a cada poucos segundos) ficam de fora
  const chaveNao = chave => on() && window.__FALAS_BASE && !window.__FALAS_BASE.has(chave);
  const falaNao = f => on() && f && f.quem === 'inspetor' && cap() === 0;
  // voz dublada: só para o que o roteiro manda (falar/diálogo/fitas) ou para aviso prioritário
  function vozOk(f) {
    if (!on()) return true;
    if (!f) return false;
    if (f.quem === 'inspetor' && cap() === 0) return false;
    return !!(f._f || f._d || f.prioridade || f.quem === 'radio');
  }

  // ---- avisos na parte de cima (toast): sem desafios, clima, regras da noite; um de cada vez
  const RUIM = /Tarefa do dia|noite veio|temporal|garoa|neblina|chuva esconde|Noite d[oa]|Desafio|Esta noite|Dial:|regras ficam|Conquista|Selo|Recorde|Calor da|Dádiva|Trato|Tarefa|Ascens|Semente|Clima|boletim|Hall d|Modo |meta|Mutador|Carta|Relíquia|Amuleto/i;
  const BOM = /pegou|achou|encontrou|usou|guardou|trancad|sem energia|pilha|lanterna|chave|salvo|checkpoint|portão|gerador|fusível|galão|engrenagem|válvula|diário|fita/i;
  let ultToast = -1e9;
  function toastNao(t) {
    if (!on()) return false;
    const txt = String(t || '');
    if (/Tarefa do dia|Dádiva|Desafio da noite|Conquista/i.test(txt)) return true;
    if (RUIM.test(txt) && !BOM.test(txt)) return true;
    try { if (!BOM.test(txt) && String(new Error().stack || '').split(/\r?\n/).some(l => !/modo-simples/.test(l) && /[/]src[/]/.test(l))) return true; } catch (e) {} // aviso solto de módulo extra
    const agora = performance.now();
    if (!BOM.test(txt) && agora - ultToast < 6000) return true;
    ultToast = agora; return false;
  }

  // ---- sistemas extras (rejogabilidade, segredos de som): só do capítulo I em diante, e alguns nunca no modo simples
  const mundoExtra = () => !on() || cap() >= 1;        // monstros/áudio de monstro: só depois que existe monstro
  const rejogoExtra = () => !on();                      // humores, rádio da sua morte, segredos de som: desligados no modo simples
  const sustosOk = () => !on() || cap() >= 1;

  // ---- MARCADOR DO OBJETIVO: um ◆ com a distância no lugar de onde fazer o objetivo atual (ou uma seta na borda da tela)
  // Mapa objetivo -> rótulo(s) da interação, na ordem em que aparecem (o primeiro que ainda existe vira o marcador).
  const ALVOS = {
    lanterna: [/porta-malas/], posto: [/Falar com o velho/], chave_portao: [/Pegar a chave do portão/], abrir_portao: [/cadeado/],
    forcar_porta: [/Forçar a porta/], galao: [/galão/i], fusiveis: [/caixa de fusíveis/i], gerador: [/Ligar o gerador/],
    fita_diretor: [/Fita 1/], chave_escada: [/quadro de chaves/i], subir: [/Subir para os dormitórios/],
    engrenagens: [/engrenagem/i], caixinha: [/caixinha/i], quarto_celeste: [/chave da Irmã/i, /porta da Irmã/i],
    fita_celeste: [/Fita 2/], chave_porao: [/chave do monta-cargas/i, /Descer pelo monta-cargas/i],
    valvulas: [/Girar a válvula/], cofre: [/cofre/i], sair_tuneis: [/escotilha/i],
    tumulos: [/Cavar o túmulo/], capela: [/porta da capela/i], altar: [/altar/i], sino: [/corda do sino/i]
  };
  let faroEl = null, faroTxt = null, faroSeta = null;
  const tmp = C.THREE ? new C.THREE.Vector3() : null;
  const limpaTag = s => String(s || '').replace(/<[^>]+>/g, '');
  function faroCria() {
    faroEl = document.createElement('div'); faroEl.id = 'faro'; faroEl.hidden = true; faroEl.setAttribute('aria-hidden', 'true');
    faroEl.innerHTML = '<i id="faro-d">◆</i><b id="faro-t"></b>';
    document.body.appendChild(faroEl);
    const css = document.createElement('style');
    css.textContent = `#faro{position:fixed;left:0;top:0;z-index:6;pointer-events:none;text-align:center;font-family:"IM Fell English SC",Georgia,serif;color:#f1d58a;text-shadow:0 0 8px #000,0 0 3px #000;transform:translate(-50%,-50%);transition:opacity .25s}
    #faro i{display:block;font-style:normal;font-size:26px;line-height:1;animation:faroPulsa 1.4s ease-in-out infinite}
    #faro b{display:block;font-weight:400;font-size:13px;letter-spacing:.08em;opacity:.9;margin-top:2px}
    #faro.borda i{font-size:22px}
    @keyframes faroPulsa{0%,100%{opacity:.55;transform:scale(.9)}50%{opacity:1;transform:scale(1.12)}}
    @media (prefers-reduced-motion: reduce){#faro i{animation:none;opacity:.9}}`;
    document.head.appendChild(css);
    faroTxt = faroEl.querySelector('#faro-t'); faroSeta = faroEl.querySelector('#faro-d');
  }
  function faro() {
    try {
      if (!tmp) return;
      if (!faroEl) faroCria();
      const S = C.S(), W = C.W, cam = C.camera, P = C.P();
      const ver = on() && S && C.mode() === 'jogo' && !C.ui() && !S.hidden && !S.flags.guiaOff && !S.dead && OPT.marcador !== false;
      if (!ver) { API.dbg = "ver:" + [on(), !!S, C.mode(), C.ui(), !!S.hidden, !!S.flags.guiaOff, S.dead].join(); faroEl.hidden = true; return; }
      const cap = S.chapter, lista = (C.R.capitulos[cap] || { objetivos: [] }).objetivos;
      const atual = lista.find(o => !S.done[o.id]);
      const regs = atual && ALVOS[atual.id];
      if (!regs) { API.dbg = "sem regs " + (atual && atual.id); faroEl.hidden = true; return; }
      let alvo = null, dMin = 1e9;
      for (const rx of regs) {
        for (const it of W.inter) {
          if (!it.obj || !it.obj.visible || !it.on()) continue;
          if (!rx.test(limpaTag(it.label()))) continue;
          it.obj.getWorldPosition(tmp);
          const d = Math.hypot(tmp.x - P.pos.x, tmp.z - P.pos.z);
          if (d < dMin) { dMin = d; alvo = { x: tmp.x, y: tmp.y, z: tmp.z }; }
        }
        if (alvo) break; // a primeira etapa que ainda existe
      }
      if (!alvo) { API.dbg = "sem alvo " + atual.id; faroEl.hidden = true; return; }
      if (dMin < 1.6) { API.dbg = "perto"; faroEl.hidden = true; return; } // já está do lado: o rótulo de interação assume
      tmp.set(alvo.x, alvo.y + .25, alvo.z).project(cam);
      const w = innerWidth, h = innerHeight; let x = (tmp.x * .5 + .5) * w, y = (-tmp.y * .5 + .5) * h;
      const atras = tmp.z > 1; let borda = false;
      if (atras) { x = w - x; y = h * .86; borda = true; }
      const m = 54;
      if (x < m || x > w - m || y < m || y > h - m) { borda = true; x = Math.max(m, Math.min(w - m, x)); y = Math.max(m, Math.min(h - m, y)); }
      faroEl.classList.toggle('borda', borda);
      faroSeta.textContent = borda ? (atras ? '◆' : x <= m + 1 ? '◀' : x >= w - m - 1 ? '▶' : y <= m + 1 ? '▲' : '▼') : '◆';
      faroTxt.textContent = Math.round(dMin) + ' m';
      faroEl.style.left = Math.round(x) + 'px'; faroEl.style.top = Math.round(y) + 'px'; faroEl.hidden = false;
    } catch (e) { console.warn('[faro]', e); if (faroEl) faroEl.hidden = true; }
  }

  // ---- OPÇÕES COMPACTAS: duas telas (Opções e Desempenho) tinham ~260 itens. No modo simples ficam só os essenciais;
  // um botão "Mostrar todas as opções" devolve o resto. Os itens escondidos continuam valendo com o valor que tinham.
  const ESSENCIAIS = {
    k: ['simples', 'vol', 'sens', 'brilho', 'vFlash', 'leg'],
    op: ['qual', 'lim30', 'arrastar', 'fone', 'tqTam', 'tqCanhoto', 'giro']
  };
  function opcoesCompactas(box, attr) {
    try {
      if (!box) return;
      const toque = (window.matchMedia && matchMedia('(pointer:coarse)').matches) || navigator.maxTouchPoints > 0;
      const ess = (ESSENCIAIS[attr] || []).filter(k => toque || !/^(tqTam|tqCanhoto|giro)$/.test(k)); // controles de toque só aparecem em aparelho de toque
      const filhos = [...box.children];
      const marca = el => { el.classList.add('sp-extra'); };
      for (const c of filhos) c.classList.remove('sp-extra');
      let h3 = null, h3Tem = false;
      const fechaH3 = () => { if (h3 && !h3Tem) marca(h3); };
      for (const c of filhos) {
        if (c.tagName === 'H3') { fechaH3(); h3 = c; h3Tem = false; continue; }
        const inp = c.matches && c.matches('[data-' + attr + ']') ? c : (c.querySelector ? c.querySelector('[data-' + attr + ']') : null);
        const k = inp && inp.dataset[attr];
        if (k && ess.includes(k)) { h3Tem = true; continue; }
        marca(c);
      }
      fechaH3();
      let btn = box.parentElement && box.parentElement.querySelector('.sp-todas');
      if (!btn) {
        btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn sp-todas';
        box.insertAdjacentElement('afterend', btn);
        btn.onclick = () => { const t = !box.classList.contains('sp-tudo'); box.classList.toggle('sp-tudo', t); if (box.parentElement) box.parentElement.classList.toggle('sp-tudo', t); btn.textContent = t ? 'Mostrar só o essencial' : 'Mostrar todas as opções'; };
      }
      box.classList.add('sp-box'); if (box.parentElement) box.parentElement.classList.add('sp-pai'); btn.hidden = !on();
      btn.textContent = box.classList.contains('sp-tudo') ? 'Mostrar só o essencial' : 'Mostrar todas as opções';
    } catch (e) { console.warn('[simples:opcoes]', e); }
  }
  const stOp = document.createElement('style');
  stOp.textContent = `body.simples .sp-box:not(.sp-tudo) .sp-extra { display: none !important; }
  body.simples #opcoes input[type="search"], body.simples #opcoes input[type="text"] { display: none !important; }
  /* pausa: só os botões e o resumo; os ajustes ficam em Opções */
  body.simples #pause > *:not(h2):not(button.btn):not(#p-info) { display: none !important; }
  body.simples .sp-todas { margin: 14px auto 4px; display: block; opacity: .85; }
  body:not(.simples) .sp-todas { display: none !important; }
  body.simples #opcoes #op-brilho, body.simples #opcoes .op-ajuda { }
  body.simples #plat-opcoes .op-ajuda, body.simples #plat-opcoes #pop-calibrar { display: none !important; }
  /* Desempenho: além da grade, saem perfis, teclas, passaporte, tátil, calibragem, acessibilidade extra e rejogo (voltam em "Mostrar todas") */
  body.simples #plat-opcoes .sp-pai:not(.sp-tudo) > *:not(h2):not(.sp-box):not(.sp-todas):not(.op-bts) { display: none !important; }
  body.simples #plat-opcoes .sp-pai:not(.sp-tudo) .op-bts > *:not(#pop-voltar) { display: none !important; }
  body.simples #opcoes .sp-pai:not(.sp-tudo) #op-brilho, body.simples #opcoes .sp-pai:not(.sp-tudo) #op-padrao { display: none !important; }`;
  document.head.appendChild(stOp);

  const API = { on, faro, opcoesCompactas, chaveNao, legNao, maxLeg, subNao, falaNao, vozOk, toastNao, mundoExtra, rejogoExtra, sustosOk };
  window.__SIMP = API;
  return API;
}
