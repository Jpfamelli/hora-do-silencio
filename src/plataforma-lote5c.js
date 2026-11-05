// A HORA DO SILÊNCIO — Plataforma e acessibilidade, lote 5 (terceira leva: sentir os monstros).
// Leitura TÁTIL dos monstros (coração-bússola, contagem da Ana, onda da Procissão, tremor do ar,
// zumbido da estátua, "ele te ouviu"), botão de toque para prender o ar no celular, desempenho que
// cede na caçada (resolução/sombra/chuva), muletas visuais opt-in (distância e seta da ameaça),
// cor segura no perigo, cor da aba por capítulo e um link de desafio que leva a intensidade dos monstros.
// Instalado por src/plataforma-lote5.js. Fala com o motor só pelo contexto C e pelos ajudantes U;
// nunca reindenta nem renomeia código alheio.

const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function instalarPlat5c(C, U, P5b) {
  const { O } = U;
  const robo = U.robo || !!window.__teste;
  const emJogo = () => U.emJogoAtivo();
  const cego = () => !!O.modoCego;
  const forcaMon = () => clamp(O.tatilForcaMon == null ? 1 : +O.tatilForcaMon, 0, 1.5);
  // pulso tátil dos monstros: respeita a Vibração geral, a força própria e "só perigo"
  function pulso(forte, fraco, ms) {
    if (!O.vibrar || robo) return;
    const f = forcaMon(); if (f <= 0) return;
    try { U.vibrar(forte * f, fraco * f, ms); } catch (e) {}
  }

  // estilo próprio das muletas visuais e do botão de toque (sem tocar a CSS compartilhada)
  if (!$('#pl5c-estilo')) {
    const st = document.createElement('style'); st.id = 'pl5c-estilo';
    st.textContent = `
      #pl5c-dist{position:fixed;left:50%;top:9%;transform:translateX(-50%);z-index:19;font:600 15px/1.2 system-ui,sans-serif;color:#e9dfc8;text-shadow:0 1px 3px #000;letter-spacing:.02em;pointer-events:none;opacity:0;transition:opacity .25s}
      #pl5c-dist.on{opacity:.9}
      #pl5c-dist b{color:#f2b14e}
      body.pl5c-cor-segura #pl5c-dist b{color:#ffd27a}
      #pl5c-seta{position:fixed;left:50%;top:50%;z-index:19;width:0;height:0;margin:-6px 0 0 -9px;border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:16px solid #e24b3a;filter:drop-shadow(0 0 4px #000);opacity:0;transition:opacity .2s;pointer-events:none}
      #pl5c-seta.on{opacity:.85}
      body.pl5c-cor-segura #pl5c-seta{border-bottom-color:#f2b14e}
      #pl5c-ar{position:fixed;right:5%;bottom:34%;z-index:22;width:84px;height:84px;border-radius:50%;background:rgba(20,16,12,.62);border:2px solid rgba(233,223,200,.5);color:#e9dfc8;font:600 13px/1.1 system-ui,sans-serif;display:none;align-items:center;justify-content:center;text-align:center;padding:8px;user-select:none;-webkit-user-select:none;touch-action:none}
      #pl5c-ar.show{display:flex}
      #pl5c-ar.press{background:rgba(70,40,30,.8);border-color:#f2b14e}
      body.pl5c-cego-vis #pl5c-dist,body.pl5c-cego-vis #pl5c-seta{display:none!important}
    `;
    document.head.appendChild(st);
  }
  if (!$('#pl5c-dist')) { const d = document.createElement('div'); d.id = 'pl5c-dist'; d.setAttribute('aria-hidden', 'true'); document.body.appendChild(d); }
  if (!$('#pl5c-seta')) { const s = document.createElement('div'); s.id = 'pl5c-seta'; s.setAttribute('aria-hidden', 'true'); document.body.appendChild(s); }

  // ===================================================================
  // 1. LEITURA TÁTIL DOS MONSTROS (pulsos no controle/celular, cada entidade com um "sotaque")
  // ===================================================================
  const prev = { state: '', ana: 0, anaAtiva: false, proc: '', semAr: false, estatua: 0, ouviu: 0 };
  let corT = 0, procT = 0, arT = 0, estatuaT = 0;

  function entAtivas() {
    let n = 0;
    if (C.M && C.M.ativo && C.M.state !== 'patrulha') n++;
    if (C.ANA && C.ANA.ativa) n++;
    if (C.PROC && (C.PROC.fase === 'aviso' || C.PROC.fase === 'passando')) n++;
    return n;
  }

  function tatilFrame(dt) {
    if (!O.vibrar || robo || !emJogo()) { prev.state = ''; prev.proc = ''; return; }
    const M = C.M, S = C.S, P = C.P, A = C.ANA, PR = C.PROC;
    if (!S || S.dead || S.fim) return;
    const cam = C.camera ? C.camera.position : (P ? P.pos : null);

    // 1a. CORAÇÃO-BÚSSOLA: na caça, um toque cujo RITMO acelera conforme ele chega perto
    if (O.corTatil && M && M.ativo && cam) {
      const caca = (M.state === 'caca' || M.state === 'bote');
      if (caca) {
        const d = Math.hypot(M.pos.x - cam.x, M.pos.z - cam.z);
        if (d < 9) {
          corT -= dt;
          if (corT <= 0) {
            const prox = clamp(1 - d / 9, 0, 1);
            corT = 1.1 - prox * .82;                 // perto = batimento rápido
            const atras = cam && Math.abs(U.direcao(M.pos.x, M.pos.z)) > Math.PI * .66 ? 1.3 : 1; // colado atrás = batida mais forte
            pulso((.16 + prox * .34) * atras, .06 + prox * .12, 50 + Math.round(prox * 40));
          }
        } else corT = Math.min(corT, .3);
      } else corT = Math.min(corT, .3);
    }

    // 1b. CONTAGEM DA ANA: um tique a cada número; o DEZ é um tranco triplo
    if (O.anaTatil && A) {
      const ativa = !!A.ativa, c = A.conta | 0;
      if (ativa && c > prev.ana && c > 0) {
        if (c >= 10) { pulso(.4, .18, 120); setTimeout(() => pulso(.4, .18, 110), 150); setTimeout(() => pulso(.6, .3, 200), 300); }
        else pulso(.2 + c * .02, .08, 55);
      }
      if (!ativa && prev.anaAtiva) corT = corT; // nada; só limpa abaixo
      prev.ana = ativa ? c : 0; prev.anaAtiva = ativa;
    }

    // 1c. PROCISSÃO: uma onda que cresce no aviso e um baque quando passa
    if (O.procTatil && PR) {
      if (PR.fase === 'aviso') { procT += dt; if (procT % .22 < dt) { const g = clamp(procT / 2.4, .1, 1); pulso(.08 + g * .4, .05 + g * .2, 40 + Math.round(g * 50)); } }
      else procT = 0;
      if (PR.fase === 'passando' && prev.proc !== 'passando') { pulso(.7, .5, 260); }
      prev.proc = PR.fase || '';
    }

    // 1d. PRENDER O AR: um tremor que cresce enquanto o peito queima; alívio ao soltar
    if (O.arTatil && P) {
      if (P.prende) { arT -= dt; const q = clamp(1 - (S.ar == null ? 100 : S.ar) / 60, 0, 1); if (arT <= 0) { arT = .5 - q * .28; pulso(.06 + q * .3, .04 + q * .12, 30 + Math.round(q * 30)); } }
      else { if (prev.semAr === false && P.semAr) pulso(.5, .25, 180); arT = 0; }
      prev.semAr = !!P.semAr;
    }

    // 1e. ESTÁTUA: um zumbido grave e firme enquanto você segura o bote dele; confirma ao sair
    if (O.estatuaTatil && P) {
      const e = P.estatua || 0;
      if (e >= 1) { estatuaT -= dt; if (estatuaT <= 0) { estatuaT = .45; pulso(.05, .22, 60); } }
      else { if (prev.estatua >= 1) pulso(.3, .1, 110); estatuaT = 0; }
      prev.estatua = e;
    }

    // 1f. "ELE TE OUVIU": um toque seco e duplo quando ele passa a investigar/procurar
    if (O.ouviuTatil && M && M.ativo) {
      const s = M.state;
      const ouviu = (s === 'investiga' || s === 'procura');
      const antesCalmo = (prev.state === 'patrulha' || prev.state === 'escuta' || prev.state === 'reza' || prev.state === '');
      if (ouviu && antesCalmo && performance.now() - prev.ouviu > 900) { prev.ouviu = performance.now(); pulso(.32, .14, 55); setTimeout(() => pulso(.26, .1, 45), 120); }
    }
    prev.state = M && M.ativo ? (M.state || '') : '';
  }

  // ===================================================================
  // 2. MULETAS VISUAIS OPT-IN: distância da ameaça e seta na borda (desligadas no Modo Cego)
  // ===================================================================
  function ameaca() {
    const M = C.M, A = C.ANA, PR = C.PROC, cam = C.camera ? C.camera.position : null; if (!cam) return null;
    let melhor = null, dmin = 1e9;
    if (M && M.ativo && (M.state === 'caca' || M.state === 'bote' || M.state === 'procura')) { const d = Math.hypot(M.pos.x - cam.x, M.pos.z - cam.z); if (d < dmin) { dmin = d; melhor = { x: M.pos.x, z: M.pos.z, d, quem: 'o Inspetor' }; } }
    if (A && A.ativa && A.pos) { const d = Math.hypot(A.pos.x - cam.x, A.pos.z - cam.z); if (d < dmin) { dmin = d; melhor = { x: A.pos.x, z: A.pos.z, d, quem: 'a menina' }; } }
    return melhor;
  }
  function muletasFrame() {
    const dEl = $('#pl5c-dist'), sEl = $('#pl5c-seta');
    if (cego() || !emJogo() || robo || (!O.distMon && !O.setaMon)) { if (dEl) dEl.classList.remove('on'); if (sEl) sEl.classList.remove('on'); return; }
    const al = ameaca();
    if (dEl) {
      if (O.distMon && al) { dEl.innerHTML = al.quem + ' · <b>' + al.d.toFixed(1) + ' m</b>'; dEl.classList.add('on'); }
      else dEl.classList.remove('on');
    }
    if (sEl) {
      if (O.setaMon && al) {
        const a = U.direcao(al.x, al.z);           // ângulo relativo à sua frente
        if (Math.abs(a) > Math.PI * .33) {         // só quando está fora da sua frente
          const r = Math.min(innerWidth, innerHeight) * .32;
          const ang = a - Math.PI / 2;             // 0 = direita na tela
          const x = innerWidth / 2 + Math.cos(ang) * r, y = innerHeight / 2 + Math.sin(ang) * r;
          sEl.style.left = x + 'px'; sEl.style.top = y + 'px';
          sEl.style.transform = 'rotate(' + (a * 180 / Math.PI) + 'deg)';
          sEl.classList.add('on');
        } else sEl.classList.remove('on');
      } else sEl.classList.remove('on');
    }
  }

  // ===================================================================
  // 3. DESEMPENHO QUE CEDE NA CAÇADA: resolução (quando a dinâmica está desligada),
  //    sombra da lanterna em cena cheia e chuva — recompõe a qualidade ao acalmar.
  // ===================================================================
  let emCaca = false, emCheia = false, baixou = false;
  function perfFrame() {
    if (robo || !emJogo() || !C.renderer) return;
    const M = C.M;
    const caca = !!(M && M.ativo && (M.state === 'caca' || M.state === 'bote'));
    const cheia = entAtivas() >= 2;

    // 3a. resolução menor só na caça e só se a resolução dinâmica estiver desligada (senão o motor já cuida)
    if (O.resCaca && !O.resDin) {
      if (caca && !baixou) { try { const pr = C.renderer.getPixelRatio ? C.renderer.getPixelRatio() : 1; C.renderer.setPixelRatio(pr * .8); baixou = true; } catch (e) {} }
      else if (!caca && baixou) { try { U.aplicarQual(); } catch (e) {} baixou = false; }
    } else if (baixou) { try { U.aplicarQual(); } catch (e) {} baixou = false; }

    // 3b. sombra da lanterna desligada quando há duas ou mais entidades ativas
    if (O.sombraMon && C.flash) {
      if (cheia && !emCheia) { try { C.flash.castShadow = false; } catch (e) {} emCheia = true; }
      else if (!cheia && emCheia) { try { U.aplicarQual(); } catch (e) {} emCheia = false; }
    } else if (emCheia) { try { U.aplicarQual(); } catch (e) {} emCheia = false; }

    // 3c. chuva reduzida na caça (menos geometria desenhada quando mais importa a performance)
    if (O.chuvaCaca && C.chuvaGeo && C.NCH) {
      if (caca && !emCaca) { try { C.chuvaGeo.setDrawRange(0, Math.floor((C.chuvaGeo.drawRange.count || C.NCH) * .5)); } catch (e) {} emCaca = true; }
      else if (!caca && emCaca) { try { U.aplicarQual(); } catch (e) {} emCaca = false; }
    } else if (emCaca) { try { U.aplicarQual(); } catch (e) {} emCaca = false; }
  }

  // ===================================================================
  // 4. BOTÃO DE TOQUE "PRENDA O AR" (celular): aparece na caça, segura = prende o ar
  // ===================================================================
  if (!$('#pl5c-ar')) { const b = document.createElement('div'); b.id = 'pl5c-ar'; b.textContent = 'prenda o ar'; b.setAttribute('role', 'button'); document.body.appendChild(b); }
  (function ligarBotaoAr() {
    const b = $('#pl5c-ar'); if (!b) return;
    const set = v => { try { C.keys.Space = v; } catch (e) {} b.classList.toggle('press', v); };
    b.addEventListener('pointerdown', e => { e.preventDefault(); set(true); pulso(.18, .08, 30); }, { passive: false }); // confirma o aperto no tato
    const solta = () => set(false);
    b.addEventListener('pointerup', solta); b.addEventListener('pointercancel', solta); b.addEventListener('pointerleave', solta);
  })();
  function botaoArFrame() {
    const b = $('#pl5c-ar'); if (!b) return;
    const mostrar = !!(O.toqueAr && U.toque && emJogo() && C.M && C.M.ativo && (C.M.state === 'caca' || C.M.state === 'bote' || C.M.state === 'procura') && !(C.S && C.S.hidden));
    b.classList.toggle('show', mostrar);
    if (!mostrar && b.classList.contains('press')) { b.classList.remove('press'); try { C.keys.Space = false; } catch (e) {} }
  }

  // ===================================================================
  // 5. COR DA ABA POR CAPÍTULO: a noite escurece a aba/instalado a cada capítulo
  // ===================================================================
  const TEMA = ['#0a0806', '#090705', '#070604', '#060504', '#050403', '#030302'];
  let temaCap = -1;
  function temaFrame() {
    if (!O.temaCap) return;
    const S = C.S; if (!S || !emJogo()) return;
    if (S.chapter !== temaCap) {
      temaCap = S.chapter;
      try { let m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', TEMA[clamp(S.chapter, 0, 5)]); } catch (e) {}
    }
  }

  // ===================================================================
  // 6. COR SEGURA NO PERIGO (daltonismo): âmbar no lugar do vermelho das minhas muletas
  // ===================================================================
  function aplicarCor() { document.body.classList.toggle('pl5c-cor-segura', !!O.corMon); }

  // ===================================================================
  // 7. LINK DE DESAFIO DOS MONSTROS: leva a intensidade (e o Modo Cego) para um amigo
  // ===================================================================
  function linkDesafio() {
    const base = 'https://jpfamelli.github.io/hora-do-silencio/';
    const p = new URLSearchParams();
    if (O.agressMon && O.agressMon !== 'normal') p.set('mon', O.agressMon);
    if (O.modoCego) p.set('cego', '1');
    const q = p.toString();
    return q ? base + '?' + q : base;
  }
  function compartilharDesafio() {
    const url = linkDesafio();
    const nome = O.modoCego ? 'Modo Cego' : (O.agressMon === 'cruel' ? 'intensidade Cruel' : O.agressMon === 'brando' ? 'intensidade Branda' : 'intensidade Normal');
    const texto = 'Te desafio a jogar A Hora do Silêncio no ' + nome + '. Fone, no escuro.';
    (async () => {
      try { if (navigator.share) { await navigator.share({ title: 'Desafio — A Hora do Silêncio', text: texto, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(url); C.toast('Link do desafio copiado. Mesma intensidade de monstros para quem abrir.'); } catch (e) { C.toast('Link: ' + url); }
    })();
  }
  // ler o desafio da URL ao abrir (uma vez; passivo e à prova de erro)
  function lerDesafioURL() {
    if (robo) return;
    try {
      const p = new URLSearchParams(location.search);
      let mudou = false, msg = [];
      const mon = p.get('mon');
      if (mon === 'cruel' || mon === 'brando') { if (O.agressMon !== mon) { O.agressMon = mon; mudou = true; } msg.push(mon === 'cruel' ? 'intensidade Cruel' : 'intensidade Branda'); }
      if (p.get('cego') === '1') { if (!O.modoCego) { O.modoCego = true; mudou = true; try { if (P5b && P5b.teste && P5b.teste.aplicarCego) P5b.teste.aplicarCego(true); } catch (e) {} } msg.push('Modo Cego'); }
      if (mudou) { try { U.salvar(); } catch (e) {} }
      if (msg.length) setTimeout(() => { try { C.toast('Desafio recebido: ' + msg.join(' + ') + '. Dá para mudar em Desempenho.'); } catch (e) {} }, 900);
    } catch (e) {}
  }

  // ===================================================================
  // OPÇÕES: seção própria com demos; o motor liga as caixas pela lista de src/plataforma.js
  // ===================================================================
  function demoCoracao() {
    if (!O.vibrar) { C.toast('Ligue a Vibração primeiro.'); return; }
    C.toast('Coração-bússola: o toque acelera conforme ele chega.');
    let i = 0; const seq = [1, .85, .7, .55, .4, .28, .2];
    const bate = () => { if (i >= seq.length) return; const prox = 1 - seq[i] / 1.1; pulso(.16 + prox * .34, .06 + prox * .12, 60); setTimeout(bate, seq[i] * 520); i++; };
    bate();
  }
  function demoAna() {
    if (!O.vibrar) { C.toast('Ligue a Vibração primeiro.'); return; }
    C.toast('A Ana conta: um tique por número, e o dez é um tranco triplo.');
    for (let c = 1; c <= 9; c++) setTimeout(() => pulso(.2 + c * .02, .08, 55), c * 320);
    setTimeout(() => { pulso(.4, .18, 120); setTimeout(() => pulso(.4, .18, 110), 150); setTimeout(() => pulso(.6, .3, 200), 300); }, 10 * 340);
  }

  function montarOpcoes(wrap) {
    if (!wrap || $('#pl5c-extra')) return;
    const sec = document.createElement('div'); sec.id = 'pl5c-extra';
    sec.innerHTML = '<h3>Sentir os monstros (tátil, desempenho e desafio)</h3>'
      + '<p class="pl-nota">Cada entidade tem um pulso próprio: o Inspetor é um coração que acelera, a Ana conta número a número, a Procissão é uma onda que cresce.</p>'
      + '<div class="op-bts"><button class="btn" id="pl5c-cor">Sentir o coração-bússola</button><button class="btn" id="pl5c-ana">Sentir a contagem da Ana</button></div>'
      + '<p class="pl-nota">Desempenho: na caçada o jogo pode baixar a resolução, a sombra e a chuva sozinho, e recompor ao acalmar.</p>'
      + '<p class="pl-nota">Desafio: mande para um amigo um link que já abre com a mesma intensidade de monstros (e o Modo Cego, se estiver ligado).</p>'
      + '<div class="op-bts"><button class="btn" id="pl5c-desafio">Compartilhar desafio dos monstros</button></div>';
    const alvo = $('#pl5b-extra'); if (alvo) alvo.after(sec); else { const fim = wrap.querySelector(':scope > .op-bts'); if (fim) wrap.insertBefore(sec, fim); else wrap.appendChild(sec); }
    const bc = $('#pl5c-cor'); if (bc) bc.onclick = demoCoracao;
    const ba = $('#pl5c-ana'); if (ba) ba.onclick = demoAna;
    const bd = $('#pl5c-desafio'); if (bd) bd.onclick = compartilharDesafio;
  }

  function opcoes(id) {
    if (!id || id === 'corMon') aplicarCor();
    if (id === 'temaCap' && !O.temaCap) { try { const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', '#050505'); } catch (e) {} temaCap = -1; }
    if (id === 'resCaca' && !O.resCaca && baixou) { try { U.aplicarQual(); } catch (e) {} baixou = false; }
    if (id === 'toqueAr' && !O.toqueAr) { const b = $('#pl5c-ar'); if (b) { b.classList.remove('show', 'press'); try { C.keys.Space = false; } catch (e) {} } }
    if (id === 'corTatil' && O.corTatil) { try { C.toast('Coração-bússola: na caçada, o toque acelera conforme ele chega perto.'); } catch (e) {} }
  }

  // botão de compartilhar o DESAFIO no título (ao lado do "Compartilhar o jogo" do lote 5b)
  function botaoTitulo() {
    if (robo) return;
    const menu = $('#title .menu'); if (!menu || $('#pl5c-share')) return;
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'pl5c-share'; b.textContent = 'Desafiar um amigo';
    menu.appendChild(b); b.onclick = compartilharDesafio;
  }

  // instalação coerente com o que está salvo
  aplicarCor(); botaoTitulo(); lerDesafioURL();

  return {
    montarOpcoes, opcoes,
    depois(dt) { tatilFrame(dt); muletasFrame(); perfFrame(); botaoArFrame(); temaFrame(); },
    mapa() { emCaca = emCheia = false; if (baixou) { try { U.aplicarQual(); } catch (e) {} baixou = false; } temaCap = -1; prev.state = ''; prev.proc = ''; },
    teste: { tatilFrame, muletasFrame, perfFrame, ameaca, linkDesafio, demoCoracao, demoAna }
  };
}
