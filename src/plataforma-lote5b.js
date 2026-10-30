// A HORA DO SILÊNCIO — Plataforma e acessibilidade, lote 5 (segunda leva: os monstros).
// Perfil de desafio "Modo Cego" (desliga toda a leitura do perigo de uma vez e sobe a agressividade),
// Intensidade dos monstros separada da dificuldade, vibração direcional do caçador (o lado que vibra
// aponta de onde ele vem), realce de "atrás e acima" no fone, e o duelo do sino no toque/controle
// (feedback tátil a cada badalada e no momento de puxar). Instalado por src/plataforma-lote5.js.
// Fala com o motor só pelo contexto C e pelos ajudantes U; nunca reindenta código alheio.

const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function instalarPlat5b(C, U) {
  const { O } = U;
  const robo = U.robo || !!window.__teste;
  const menosMov = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const emJogo = () => U.emJogoAtivo();

  // ===================================================================
  // 1. MODO CEGO — perfil de desafio: desliga TODA a leitura do perigo de uma vez
  //    (bússola, pulsos, postura, faro, névoa, respiração 3D, legendas de estado, indicador,
  //    mira na caça, vibração por entidade) e sobe a agressividade das entidades.
  //    Guarda o que estava ligado para devolver tudo ao desligar. Selo próprio no fim.
  // ===================================================================
  const CHAVES_MINHAS = ['respInsp', 'respEstalos', 'nevoaDir', 'capEstado', 'miraCaca', 'indic', 'indicInsp', 'hapEntidade', 'avisoVisual', 'vibDir', 'legSom'];
  // as ajudas de "Leitura do perigo" vivem no OPT do motor (src/interface-monstros.js)
  const CHAVES_LEITURA = ['bussola', 'pulsoProx', 'vinheta', 'faroBorda', 'posturaUI', 'arcoOuvido', 'legDist'];
  let snapMinhas = null, snapLeitura = null;
  const OPT = () => C.OPT || {};
  function aplicarCego(ligar) {
    if (ligar) {
      if (!snapMinhas) {
        snapMinhas = {}; for (const k of CHAVES_MINHAS) snapMinhas[k] = O[k];
        snapLeitura = {}; const p = OPT(); for (const k of CHAVES_LEITURA) snapLeitura[k] = p[k];
      }
      for (const k of CHAVES_MINHAS) O[k] = (k === 'vibDir') ? O[k] : false; // a vibração direcional é tátil (não é "muleta de HUD"): fica
      O.vibDir = false;
      const p = OPT(); for (const k of CHAVES_LEITURA) if (p[k] !== undefined) p[k] = (k === 'faroBorda') ? false : (typeof p[k] === 'string' ? 'nao' : false);
      document.body.classList.add('pl5-cego');
    } else {
      if (snapMinhas) { for (const k of CHAVES_MINHAS) O[k] = snapMinhas[k]; }
      if (snapLeitura) { const p = OPT(); for (const k of CHAVES_LEITURA) if (snapLeitura[k] !== undefined) p[k] = snapLeitura[k]; }
      snapMinhas = snapLeitura = null;
      document.body.classList.remove('pl5-cego');
    }
    try { U.salvar(); } catch (e) {}
  }
  const cegoLigado = () => !!O.modoCego;
  // selo guardado quando se sobrevive a um capítulo às cegas
  const SELO_KEY = 'hora-silencio-l5-selos';
  function lerSelos() { try { return JSON.parse(localStorage.getItem(SELO_KEY)) || {}; } catch (e) { return {}; } }
  function marcarSelo(id) { try { const s = lerSelos(); if (!s[id]) { s[id] = Date.now(); localStorage.setItem(SELO_KEY, JSON.stringify(s)); } } catch (e) {} }
  let capVisto = -1;
  function seloFrame() {
    if (!cegoLigado() || !emJogo()) return;
    const S = C.S; if (!S) return;
    if (capVisto < 0) capVisto = S.chapter;
    if (S.chapter > capVisto) { capVisto = S.chapter; marcarSelo('cego'); try { C.toast('Você passou de capítulo às cegas. Sem muletas.'); } catch (e) {} }
  }

  // ===================================================================
  // 2. INTENSIDADE DOS MONSTROS (Brando / Normal / Cruel), separada da dificuldade.
  //    Mexe só na agressividade: reação ao som e velocidade/dureza da caça do Inspetor.
  //    Multiplica os fatores que o cérebro do lote 5 escreve (M.l5velMul/M.l5ouvidoMul),
  //    em P5.antes — antes de updateInspetor consumir, sem tocar a vida nem os puzzles.
  // ===================================================================
  function fatorAgress() {
    let a = O.agressMon || 'normal';
    if (cegoLigado() && a === 'normal') a = 'cruel'; // o Modo Cego já sobe a agressividade
    return a === 'cruel' ? { vel: 1.16, ouv: 1.28 } : a === 'brando' ? { vel: .9, ouv: .8 } : null;
  }
  function agressAntes() {
    const f = fatorAgress(); if (!f) return;
    const M = C.M; if (!M || !M.ativo || !emJogo()) return;
    M.l5velMul = (M.l5velMul || 1) * f.vel;
    M.l5ouvidoMul = (M.l5ouvidoMul || 1) * f.ouv;
  }

  // ===================================================================
  // 3. VIBRAÇÃO DIRECIONAL DO CAÇADOR: quando ele cola fora do seu campo de visão,
  //    o padrão de pulsos aponta o lado (1 = esquerda, 2 = direita, 3 = atrás).
  //    Tátil, opcional; pareia com a borda de pulso e respeita intensidade/só-perigo.
  // ===================================================================
  let dirT = 0;
  function pulsar(n, forte, fraco, ms, gap) {
    // no celular, um único padrão nativo sai mais nítido que vários toques encadeados
    if (U.toque && navigator.vibrate) { const p = []; for (let i = 0; i < n; i++) { p.push(ms); if (i < n - 1) p.push(gap); } try { navigator.vibrate(p); return; } catch (e) {} }
    for (let i = 0; i < n; i++) setTimeout(() => { if (O.vibrar && O.vibDir) U.vibrar(forte, fraco, ms); }, i * (ms + gap));
  }
  function vibDirFrame(dt) {
    if (!O.vibDir || !O.vibrar || robo || !emJogo()) return;
    const M = C.M, S = C.S; if (!M || !M.ativo || !S || S.dead || S.hidden) return; // escondida: o perigo é não se mexer, não o lado
    const caca = (M.state === 'caca' || M.state === 'bote');
    if (!caca) { dirT = Math.min(dirT, .3); return; }
    const cam = C.camera.position, d = Math.hypot(M.pos.x - cam.x, M.pos.z - cam.z);
    if (d > 6) { dirT = Math.min(dirT, .3); return; }
    const a = U.direcao(M.pos.x, M.pos.z), g = Math.abs(a);
    if (g < Math.PI * .33) return; // já está à sua frente: o olho resolve
    dirT -= dt; if (dirT > 0) return;
    const alerta = (O.agressMon === 'cruel' || cegoLigado()) ? .7 : 1; // no Cruel/Cego o aviso tátil fica mais nervoso
    dirT = clamp((1.1 - (1 - d / 6) * .5) * alerta, .4, 1.1); // mais perto, mais frequente
    const prox = clamp(1 - d / 6, .2, 1), forte = .3 * prox, fraco = .12 * prox;
    if (g > Math.PI * .72) pulsar(3, forte, fraco, 70, 55); // atrás = três toques
    else if (a > 0) pulsar(2, forte, fraco, 70, 60);        // direita = dois
    else pulsar(1, forte * 1.1, fraco, 110, 0);             // esquerda = um longo
  }
  // ===================================================================
  // 4b. PULSOS DE ACESSIBILIDADE opt-in: pilha acabando e confirmação ao se esconder/sair.
  //     Tátil para quem joga sem olhar o HUD ou sem som. Desligados por padrão.
  // ===================================================================
  let pilhaAviso = 0, escondAnt = false;
  function pulsosAcess(dt) {
    if (robo || !O.vibrar || !emJogo()) return;
    const S = C.S; if (!S) return;
    if (O.hapPilha && S.flashOn && S.battery > 0 && S.battery < 10) {
      pilhaAviso -= dt; if (pilhaAviso <= 0) { pilhaAviso = 2.2; U.vibrar(.12, .35, 40); } // tique fraco e agudo: a pilha pisca
    } else pilhaAviso = 0;
    if (O.hapEsconde) {
      const esc = !!S.hidden;
      if (esc !== escondAnt) { U.vibrar(esc ? .3 : .18, esc ? .12 : .08, esc ? 120 : 70); escondAnt = esc; }
    } else escondAnt = !!S.hidden;
  }

  function demoDirecoes() {
    if (!O.vibrar) { C.toast('Ligue a Vibração primeiro para sentir as direções.'); return; }
    const salvo = O.vibDir; O.vibDir = true;
    C.toast('Esquerda: um toque longo. Direita: dois. Atrás: três.');
    pulsar(1, .34, .12, 120, 0);
    setTimeout(() => pulsar(2, .3, .12, 70, 60), 1200);
    setTimeout(() => pulsar(3, .3, .12, 70, 55), 2600);
    setTimeout(() => { O.vibDir = salvo; }, 4200);
  }

  // ===================================================================
  // 4. DUELO DO SINO no toque e no controle: enquanto você segura para puxar a corda,
  //    cada "badalada" dá um empurrão tátil e, perto do fim, um pulso de "puxa agora".
  //    Lê o progresso do arco de ação (#hold-arc), input-agnóstico (toque/controle/teclado).
  // ===================================================================
  let holdK = 0, sinoBad = -1, sinoAtivo = false;
  function noSino() {
    const S = C.S, W = C.W;
    return !!(S && W && W.mapa === 'cemiterio' && S.placed >= 3 && !(S.flags && S.flags.sino));
  }
  function sinoFrame() {
    if (!O.sinoHaptic || !O.vibrar || robo) { sinoAtivo = false; return; }
    const arc = $('#hold-arc'), el = $('#hold');
    if (!arc || !el || el.hidden) { if (sinoAtivo) { sinoAtivo = false; sinoBad = -1; } return; }
    const off = parseFloat(arc.style.strokeDashoffset || '138.2');
    const k = clamp(1 - off / 138.2, 0, 1);
    const geral = !!O.hapAcao, sino = noSino();
    if (!geral && !sino) { holdK = k; return; }
    if (k < holdK - .2) { sinoBad = -1; } // reiniciou o progresso
    if (!sinoAtivo) { sinoAtivo = true; sinoBad = -1; }
    // badaladas: três empurrões ao longo do aperto; o último é o "puxa agora"
    const BAD = sino ? [.2, .5, .8] : [.33, .66];
    for (let i = 0; i < BAD.length; i++) {
      if (k >= BAD[i] && sinoBad < i) {
        sinoBad = i;
        const ult = i === BAD.length - 1;
        U.vibrar(ult ? .5 : .28, ult ? .2 : .1, ult ? 160 : 90);
        if (sino && ult && O.legSom) U.legenda('sino-puxa', 'puxa — agora', null, 1);
      }
    }
    if (k >= .999 && sinoBad >= 0) { U.vibrar(.6, .3, 240); sinoBad = -2; } // badalada final
    holdK = k;
  }
  function demoSino() {
    if (!O.vibrar) { C.toast('Ligue a Vibração primeiro.'); return; }
    C.toast('O sino: três empurrões e o puxão final.');
    U.vibrar(.28, .1, 90);
    setTimeout(() => U.vibrar(.28, .1, 90), 500);
    setTimeout(() => U.vibrar(.5, .2, 160), 1000);
    setTimeout(() => U.vibrar(.6, .3, 240), 1500);
  }

  // ===================================================================
  // OPÇÕES: botões extras da seção (as caixas/seletores entram pela lista de src/plataforma.js)
  // ===================================================================
  function montarOpcoes(wrap) {
    if (!wrap || $('#pl5b-extra')) return;
    const sec = document.createElement('div'); sec.id = 'pl5b-extra';
    sec.innerHTML = '<h3>Os monstros: desafio e leitura tátil</h3>'
      + '<p class="pl-nota">Modo Cego: desliga toda a leitura do perigo de uma vez e deixa as entidades mais agressivas. Para o terror puro.</p>'
      + '<p class="pl-nota">Vibração direcional: no susto, o lado que vibra aponta de onde ele vem — um toque à esquerda, dois à direita, três atrás.</p>'
      + '<div class="op-bts"><button class="btn" id="pl5b-dir">Sentir as direções</button><button class="btn" id="pl5b-sino">Sentir o sino</button></div>'
      + '<div class="pl-nota" id="pl5b-selo"></div>';
    const alvo = $('#pl5-extra'); if (alvo) alvo.after(sec); else { const fim = wrap.querySelector(':scope > .op-bts'); if (fim) wrap.insertBefore(sec, fim); else wrap.appendChild(sec); }
    $('#pl5b-dir').onclick = demoDirecoes; $('#pl5b-sino').onclick = demoSino;
    atualizarSeloNota();
  }
  function opcoes(id) {
    if (id === 'modoCego' || id == null) { aplicarCego(cegoLigado()); if (id === 'modoCego') { try { C.toast(cegoLigado() ? 'Modo Cego: nenhuma ajuda de leitura, e eles caçam mais forte. Boa sorte.' : 'Modo Cego desligado. As ajudas voltaram como estavam.'); } catch (e) {} atualizarSeloNota(); } }
    if (id === 'agressMon' && (O.agressMon === 'cruel' || O.agressMon === 'brando')) { try { C.toast(O.agressMon === 'cruel' ? 'Intensidade Cruel: eles reagem mais rápido e a caça é mais dura (a dificuldade geral não muda).' : 'Intensidade Branda: as entidades pegam mais leve, sem mexer na vida nem nos puzzles.'); } catch (e) {} }
  }

  // nota no painel de quantos capítulos já venceu às cegas
  function atualizarSeloNota() {
    const el = $('#pl5b-selo'); if (!el) return;
    const s = lerSelos(); el.textContent = s.cego ? 'Você já passou de capítulo no Modo Cego. Selo guardado.' : '';
  }

  // botão de compartilhar o jogo no título (Web Share API, com cópia de reserva)
  function botaoCompartilhar() {
    if (robo) return;
    const menu = $('#title .menu'); if (!menu || $('#pl5b-share')) return;
    const b = document.createElement('button'); b.className = 'btn'; b.id = 'pl5b-share'; b.textContent = 'Compartilhar o jogo';
    menu.appendChild(b);
    const url = 'https://jpfamelli.github.io/hora-do-silencio/';
    const texto = 'A Hora do Silêncio — terror em primeira pessoa no navegador. Jogue de fone, no escuro.';
    b.onclick = async () => {
      try { if (navigator.share) { await navigator.share({ title: 'A Hora do Silêncio', text: texto, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(url); C.toast('Link copiado. Mande para alguém jogar no escuro.'); } catch (e) { C.toast('Link: ' + url); }
    };
  }

  // selo "às cegas" discreto (só aparece com o Modo Cego ligado; nunca entrega perigo)
  if (!$('#pl5b-cego-selo')) { const s = document.createElement('div'); s.id = 'pl5b-cego-selo'; s.textContent = 'às cegas'; document.body.appendChild(s); }

  // estado inicial coerente com o que está salvo
  if (cegoLigado()) aplicarCego(true);
  botaoCompartilhar();

  // uma batida de boas-vindas no controle ao conectar: confirma que a vibração está viva
  addEventListener('gamepadconnected', () => { if (robo || !O.vibrar) return; setTimeout(() => { try { U.vibrar(.4, .15, 160); } catch (e) {} }, 120); });

  return {
    montarOpcoes, opcoes,
    antes(dt) { agressAntes(); },
    depois(dt) { vibDirFrame(dt); sinoFrame(); seloFrame(); pulsosAcess(dt); },
    mapa() { sinoBad = -1; sinoAtivo = false; capVisto = -1; },
    teste: { aplicarCego, fatorAgress, vibDirFrame, sinoFrame, demoDirecoes, lerSelos, get cego() { return cegoLigado(); } }
  };
}
