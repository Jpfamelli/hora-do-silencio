// A HORA DO SILÊNCIO — Plataforma e acessibilidade, lote 3.
// Desempenho (luzes reais em número fixo, sombra econômica, matrizes paradas, qualidade Mínima),
// controles (teclas trocáveis, giro pelo teclado, mouse cru, modo arrastar, analógico, giroscópio, gestos),
// modo foto, janela da plateia, gravador de sustos, tecla de emergência, levar o save para outro aparelho,
// tela acesa, botão voltar do celular, som que volta sozinho, perfis prontos.
// Instalado por src/plataforma.js (instalarPlat3). Fala com o motor só pelo contexto C.

const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fake = code => ({ code, preventDefault() {} });

export function instalarPlat3(C, U) {
  const { O, THREE } = { O: U.O, THREE: C.THREE };
  const R = C.R;
  const robo = U.robo || !!window.__teste;
  const ehIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const instalado = !!(window.matchMedia && (matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: standalone)').matches)) || navigator.standalone === true;
  const plateia = location.hash === '#plateia';
  const emJogo = () => U.emJogoAtivo();
  const S = () => C.S;

  // ===================================================================
  // 1. LUZES REAIS EM NÚMERO FIXO
  // Cada lâmpada e vela do mapa vira só "fonte": o brilho continua sendo calculado pelo jogo, mas só as mais
  // próximas (e à frente) emprestam uma das poucas luzes de verdade. Com o número de luzes constante, apagar e
  // acender lâmpadas (Procissão, sustos) não recompila os shaders, e a placa de vídeo fraca respira.
  // ===================================================================
  const POOL_N = { alta: 8, media: 6, baixa: 4, minima: 2 };
  const pool = []; let fontes = [], poolAtivo = false, poolT = 0, poolCorte = 0, rescanT = 0;
  const _v = new THREE.Vector3(), _fw = new THREE.Vector3();
  function poolN() { return Math.max(1, (POOL_N[U.qual()] || 6) - poolCorte); }
  function criarPool() {
    while (pool.length < 8) { const l = new THREE.PointLight(0xffc98a, 0, 8, 1.2); l.userData.pool = true; l.visible = false; C.scene.add(l); pool.push({ l, src: null, k: 0, sai: false }); }
  }
  function coletarFontes() {
    const lista = [];
    for (const L of C.W.lampadas || []) if (L.luz && L.luz.isPointLight) lista.push(L.luz);
    if (C.W.grupo) C.W.grupo.traverse(o => { if (o.isPointLight && o.userData.vela && !lista.includes(o)) lista.push(o); });
    return lista;
  }
  function prepararFonte(f) { if (f.userData._poolF) return; f.userData._poolF = true; f.userData._wp = new THREE.Vector3(); f.getWorldPosition(f.userData._wp); f.visible = false; }
  function poolMapa() {
    criarPool();
    for (const s of pool) { s.src = null; s.k = 0; s.sai = false; s.l.intensity = 0; }
    fontes = coletarFontes();
    poolAtivo = fontes.length > poolN();
    if (!poolAtivo) { for (const s of pool) s.l.visible = false; return; }
    for (const f of fontes) prepararFonte(f);
    poolTamanho(); poolT = 0;
  }
  function poolTamanho() { const n = poolAtivo ? poolN() : 0; pool.forEach((s, i) => { const v = i < n; if (s.l.visible !== v) s.l.visible = v; if (!v) { s.src = null; s.l.intensity = 0; } }); }
  function poolEscolher() {
    const cam = C.camera.position; C.camera.getWorldDirection(_fw);
    const cand = [];
    for (const f of fontes) {
      if (!f.parent) continue;
      if (f.visible) f.visible = false;
      const it = f.intensity; if (!(it > .02)) continue;
      const p = f.userData._wp; f.getWorldPosition(p);
      const dx = p.x - cam.x, dy = p.y - cam.y, dz = p.z - cam.z, d = Math.hypot(dx, dy, dz);
      if (d > (f.distance || 10) + 6) continue;
      const atras = dx * _fw.x + dy * _fw.y + dz * _fw.z < -.5 ? 2.5 : 0; // à frente da câmera pesa mais
      cand.push([d + atras - Math.min(1.5, it * .25), f]);
    }
    cand.sort((a, b) => a[0] - b[0]);
    const n = poolN(), quer = new Set(cand.slice(0, n).map(c => c[1]));
    for (const s of pool) if (s.src) s.sai = !quer.has(s.src);
    const tem = new Set(pool.map(s => s.src));
    for (const f of quer) {
      if (tem.has(f)) continue;
      const livre = pool.find((s, i) => i < n && !s.src); if (!livre) break;
      livre.src = f; livre.k = 0; livre.sai = false;
    }
  }
  function poolFrame(dt) {
    if (!poolAtivo) return;
    rescanT -= dt;
    if (rescanT <= 0) { rescanT = 3; for (const f of coletarFontes()) if (!f.userData._poolF) { prepararFonte(f); fontes.push(f); } fontes = fontes.filter(f => f.parent); }
    poolT -= dt; if (poolT <= 0) { poolT = .25; poolEscolher(); }
    for (const s of pool) {
      if (!s.l.visible) continue;
      const f = s.src;
      if (!f) { if (s.l.intensity) s.l.intensity = 0; continue; }
      // troca suave: a luz que sai some em 0,2 s e a que entra acende em 0,25 s (nada "estala")
      s.k = s.sai ? Math.max(0, s.k - dt / .2) : Math.min(1, s.k + dt / .25);
      s.l.color.copy(f.color); s.l.distance = f.distance; s.l.decay = f.decay;
      s.l.intensity = f.intensity * s.k; s.l.position.copy(f.userData._wp);
      if (s.sai && s.k <= 0) { s.src = null; s.sai = false; s.l.intensity = 0; }
    }
  }

  // ===================================================================
  // 2. SOMBRA DA LANTERNA ECONÔMICA (Média): redesenha em quadros alternados ou quando a câmera gira/anda
  // ===================================================================
  let sombraQ = 0; const sombraQ0 = new THREE.Quaternion(), sombraP0 = new THREE.Vector3();
  function sombraFrame() {
    const fl = C.flash; if (!fl || !fl.shadow) return;
    const q = U.qual();
    if (!fl.castShadow || q === 'alta') { if (fl.shadow.autoUpdate === false) fl.shadow.autoUpdate = true; return; }
    fl.shadow.autoUpdate = false;
    const cam = C.camera, s = C.S;
    if (s && s.hidden && !s.flashOn) return; // escondida e no escuro: nada muda
    sombraQ++;
    if (sombraQ % 2 === 0 || cam.quaternion.angleTo(sombraQ0) > .17 || cam.position.distanceTo(sombraP0) > .35) {
      fl.shadow.needsUpdate = true; sombraQ0.copy(cam.quaternion); sombraP0.copy(cam.position);
    }
  }

  // ===================================================================
  // 3. MATRIZES DO CENÁRIO PARADO: calculadas uma vez só (com vigia: o que se mexer volta a atualizar)
  // ===================================================================
  let parados = [], vigiaI = 0;
  function congelarMapa() {
    for (const p of parados) if (p.o.parent) p.o.matrixAutoUpdate = true;
    parados = [];
    const g = C.W.grupo; if (!g) return;
    const snap = o => ({ o, px: o.position.x, py: o.position.y, pz: o.position.z, qx: o.quaternion.x, qy: o.quaternion.y, qz: o.quaternion.z, qw: o.quaternion.w, sx: o.scale.x, sy: o.scale.y, sz: o.scale.z });
    // o grupo do mapa nunca anda: congelado, os filhos parados nem recalculam a matriz do mundo a cada quadro
    g.updateMatrix(); g.matrixAutoUpdate = false; parados.push(snap(g));
    const portas = new Set(); for (const d of C.W.doors || []) if (d.pivot) d.pivot.traverse(o => portas.add(o));
    for (const o of g.children) {
      if (!o.isMesh || o.children.length || portas.has(o) || o.userData.it || o.isSprite) continue;
      o.updateMatrix(); o.matrixAutoUpdate = false;
      parados.push(snap(o));
    }
  }
  function vigiarParados() {
    const n = parados.length; if (!n) return;
    const passo = Math.max(60, Math.ceil(n / 12)); // todo mundo é conferido em ~12 quadros
    for (let k = 0; k < passo && n; k++) {
      vigiaI = (vigiaI + 1) % parados.length; const p = parados[vigiaI]; if (!p) break;
      const o = p.o, q = o.quaternion;
      if (!o.parent) { parados.splice(vigiaI, 1); continue; }
      if (o.position.x !== p.px || o.position.y !== p.py || o.position.z !== p.pz || q.x !== p.qx || q.y !== p.qy || q.z !== p.qz || q.w !== p.qw || o.scale.x !== p.sx || o.scale.y !== p.sy || o.scale.z !== p.sz) {
        o.matrixAutoUpdate = true; parados.splice(vigiaI, 1);
      }
    }
  }

  // ===================================================================
  // 4. PLACA DE VÍDEO POR SOFTWARE: o navegador está desenhando sem a placa
  // ===================================================================
  let rendNome = '';
  function detectarSoftware() {
    try { const gl = C.renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info'); rendNome = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || ''); } catch (e) {}
    if (robo || !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(rendNome)) return;
    if (O.qual == null || O.qual === 'baixa') { O.qual = 'minima'; U.salvar(); U.aplicarQual(); U.syncOpcoes(); }
    U.aviso('Seu navegador está desenhando sem a placa de vídeo. Ligue a "aceleração de hardware" nas configurações dele e reabra o jogo: fica muito mais liso. Por enquanto, ativei a qualidade Mínima.');
  }

  // ===================================================================
  // 5. TECLAS TROCÁVEIS
  // ===================================================================
  const ACOES = [
    ['frente', 'Andar para frente', 'KeyW'], ['tras', 'Andar para trás', 'KeyS'], ['esq', 'Andar para a esquerda', 'KeyA'], ['dir', 'Andar para a direita', 'KeyD'],
    ['correr', 'Correr', 'ShiftLeft'], ['devagar', 'Andar devagar', 'AltLeft'], ['agachar', 'Agachar', 'KeyC'], ['folego', 'Prender o fôlego', 'Space'],
    ['usar', 'Usar / interagir', 'KeyE'], ['lanterna', 'Lanterna', 'KeyF'], ['pilha', 'Trocar pilha / sacudir', 'KeyR'], ['curativo', 'Curativo', 'KeyH'],
    ['garrafa', 'Garrafa', 'KeyG'], ['atras', 'Olhar para trás', 'KeyQ'], ['espiarE', 'Espiar à esquerda', 'KeyZ'], ['espiarD', 'Espiar à direita', 'KeyX'],
    ['diario', 'Diário', 'Tab'], ['objetivo', 'Objetivo', 'KeyO'], ['responder', 'Responder / virar a folha', 'KeyV'], ['lerVoz', 'Ler a nota em voz alta', 'KeyL'],
    ['autoandar', 'Andar sozinha (liga e desliga)', 'KeyN']
  ];
  const PADRAO_T = Object.fromEntries(ACOES.map(a => [a[0], a[2]]));
  const PROIBIDAS = /^(Escape|KeyP|Enter|NumpadEnter|F\d+|MetaLeft|MetaRight|ContextMenu|ControlLeft|ControlRight)$/;
  const PERFIS_T = {
    padrao: {},
    canhoto: { frente: 'KeyI', tras: 'KeyK', esq: 'KeyJ', dir: 'KeyL', correr: 'ShiftRight', devagar: 'AltRight', agachar: 'KeyM', usar: 'KeyU', lanterna: 'KeyY', pilha: 'Digit8', curativo: 'KeyH', garrafa: 'Digit7', atras: 'KeyN', espiarE: 'Comma', espiarD: 'Period', diario: 'Quote', objetivo: 'KeyO', responder: 'Digit9', lerVoz: 'Digit0', autoandar: 'KeyB' }
  };
  if (!O.teclas || typeof O.teclas !== 'object') O.teclas = {};
  const teclaDe = a => O.teclas[a] || PADRAO_T[a];
  let porCodigo = {}, bloqueadas = {};
  function mapaTeclas() {
    porCodigo = {}; bloqueadas = {};
    for (const [a] of ACOES) { const c = teclaDe(a); if (c !== PADRAO_T[a]) porCodigo[c] = PADRAO_T[a]; }
    // a tecla padrão de uma ação que mudou de lugar fica quieta (a não ser que outra ação use ela)
    for (const [a] of ACOES) { const p = PADRAO_T[a]; if (teclaDe(a) !== p && !porCodigo[p] && !ACOES.some(([b]) => teclaDe(b) === p)) bloqueadas[p] = true; }
    if (O.giroTec) for (const c of ['KeyJ', 'KeyL', 'KeyI', 'KeyK']) if (!porCodigo[c]) bloqueadas[c] = 'giro';
    // as dicas na tela (o "E" do aviso de interação e o ESPAÇO do fôlego) mostram a tecla escolhida
    const b = document.body;
    b.classList.toggle('remap-usar', teclaDe('usar') !== 'KeyE'); b.style.setProperty('--k-usar', '"' + nomeTecla(teclaDe('usar')) + '"');
    b.classList.toggle('remap-folego', teclaDe('folego') !== 'Space'); b.style.setProperty('--k-folego', '"' + nomeTecla(teclaDe('folego')) + '"');
    ajudaTeclado();
  }
  let layout = null;
  try { if (navigator.keyboard && navigator.keyboard.getLayoutMap) navigator.keyboard.getLayoutMap().then(m => { layout = m; mapaTeclas(); listaTeclas(); }).catch(() => {}); } catch (e) {}
  function nomeTecla(c) {
    if (!c) return '?';
    const N = { Space: 'ESPAÇO', ShiftLeft: 'SHIFT', ShiftRight: 'SHIFT dir.', AltLeft: 'ALT', AltRight: 'ALT GR', Tab: 'TAB', Backspace: 'APAGAR', CapsLock: 'CAPS', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Comma: ',', Period: '.', Semicolon: 'Ç', Quote: '~', Slash: ';', Backquote: "'", BracketLeft: '´', BracketRight: '[', Backslash: ']', Minus: '-', Equal: '=', IntlRo: '/', NumLock: 'NUM LOCK' };
    if (layout && layout.get(c)) { const v = layout.get(c); if (v && v.trim()) return v.toUpperCase(); }
    if (N[c]) return N[c];
    if (/^Key[A-Z]$/.test(c)) return c.slice(3);
    if (/^Digit\d$/.test(c)) return c.slice(5);
    if (/^Numpad/.test(c)) return 'NUM ' + c.slice(6);
    return c;
  }
  let capturando = null;
  const pressGiro = {};
  function despachar(tipo, code, rep) { dispatchEvent(new KeyboardEvent(tipo, { code, key: code, repeat: !!rep, bubbles: true, cancelable: true })); }
  function teclaCaptura(e) {
    if (!e.isTrusted) return;
    const tg = e.target; if (tg && (tg.tagName === 'INPUT' && tg.type !== 'checkbox' && tg.type !== 'range' || tg.tagName === 'TEXTAREA')) return;
    // tecla de emergência funciona em qualquer tela
    if (e.type === 'keydown' && e.code === 'F9' && !e.repeat) { e.preventDefault(); e.stopImmediatePropagation(); alternarEmergencia(); return; }
    if (emerg) { e.stopImmediatePropagation(); if (e.code !== 'F5' && e.code !== 'F11' && e.code !== 'F12') e.preventDefault(); return; }
    if (foto) { fotoTecla(e); return; }
    if (capturando && e.type === 'keydown') { e.preventDefault(); e.stopImmediatePropagation(); trocarTecla(capturando, e.code); return; }
    if (e.type === 'keydown' && e.code === 'F8' && clipeLigado()) { e.preventDefault(); salvarClipe(); return; }
    // giro da câmera pelo teclado
    if (bloqueadas[e.code] === 'giro' && (emJogo() || e.type === 'keyup')) { e.stopImmediatePropagation(); e.preventDefault(); pressGiro[e.code] = e.type === 'keydown'; return; }
    // andar sozinha: qualquer tecla de movimento de verdade desliga
    const dest = porCodigo[e.code] || (bloqueadas[e.code] ? null : e.code);
    if (auto && e.type === 'keydown' && ['KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(dest)) pararAuto();
    if (dest === 'KeyN' && e.type === 'keydown' && !e.repeat && emJogo()) { e.stopImmediatePropagation(); alternarAuto(); return; }
    if (porCodigo[e.code]) { e.stopImmediatePropagation(); e.preventDefault(); despachar(e.type, porCodigo[e.code], e.repeat); return; }
    if (bloqueadas[e.code] && (C.mode === 'jogo' || C.mode === 'cena')) { e.stopImmediatePropagation(); if (e.code === 'Tab' || e.code === 'Space') e.preventDefault(); }
  }
  addEventListener('keydown', teclaCaptura, true); addEventListener('keyup', teclaCaptura, true);
  function trocarTecla(acao, code) {
    capturando = null;
    if (code === 'Escape') { listaTeclas(); return; }
    if (PROIBIDAS.test(code)) { listaTeclas(); erroTecla(acao, 'P, ESC, ENTER e as teclas F ficam fixas'); return; }
    const antiga = teclaDe(acao), dono = ACOES.find(([b]) => b !== acao && teclaDe(b) === code);
    O.teclas[acao] = code;
    if (dono) O.teclas[dono[0]] = antiga; // conflito: as duas ações trocam de tecla
    for (const [a] of ACOES) if (O.teclas[a] === PADRAO_T[a]) delete O.teclas[a];
    U.salvar(); mapaTeclas(); listaTeclas();
    if (dono) erroTecla(dono[0], 'trocou com ' + ACOES.find(a => a[0] === acao)[1].toLowerCase());
  }
  function erroTecla(acao, txt) { const li = document.querySelector(`#pl-teclas [data-acao="${acao}"]`); if (!li) return; li.classList.add('conflito'); const em = li.querySelector('em'); if (em) em.textContent = txt; setTimeout(() => { li.classList.remove('conflito'); if (em) em.textContent = ''; }, 2600); }
  function listaTeclas() {
    const box = $('#pl-teclas'); if (!box) return;
    box.innerHTML = ACOES.map(([a, nome]) => `<div class="pl-tecla${O.teclas[a] ? ' mudou' : ''}" data-acao="${a}"><span>${nome} <em></em></span><button class="btn" data-trocar="${a}">${capturando === a ? 'aperte a tecla...' : nomeTecla(teclaDe(a))}</button></div>`).join('');
    box.querySelectorAll('[data-trocar]').forEach(b => b.onclick = () => { capturando = b.dataset.trocar; listaTeclas(); });
  }
  function ajudaTeclado() {
    const el = document.querySelector('#plat-opcoes .op-ajuda'); if (!el) return;
    if (!el.dataset.orig) el.dataset.orig = el.innerHTML;
    if (!Object.keys(O.teclas).length && !O.giroTec) { el.innerHTML = el.dataset.orig; return; }
    const k = a => nomeTecla(teclaDe(a));
    const linha = `Teclado: ${k('frente')}${k('esq')}${k('tras')}${k('dir')} andar · ${k('correr')} correr · ${k('devagar')} devagar · ${k('agachar')} agachar · ${k('usar')} interagir · ${k('lanterna')} lanterna · ${k('pilha')} pilha · ${k('curativo')} curativo · ${k('garrafa')} garrafa · ${k('folego')} prender a respiração · ${k('atras')} olhar atrás · ${k('diario')} diário · ${k('autoandar')} andar sozinha${O.giroTec ? ' · J L I K giram a câmera' : ''} · P ou ESC pausa · F9 emergência`;
    el.innerHTML = linha + '<br>' + el.dataset.orig.split('<br>').slice(1).join('<br>');
  }

  // ===================================================================
  // 6. GIRAR PELO TECLADO, ANDAR SOZINHA, RITMO DO MUNDO
  // ===================================================================
  let giroT = 0;
  function giroFrame(dt) {
    if (!O.giroTec || !emJogo()) { giroT = 0; return; }
    const dx = (pressGiro.KeyL ? 1 : 0) - (pressGiro.KeyJ ? 1 : 0), dy = (pressGiro.KeyK ? 1 : 0) - (pressGiro.KeyI ? 1 : 0);
    if (!dx && !dy) { giroT = 0; return; }
    giroT += dt; const ac = Math.min(1, .35 + giroT / .3 * .65); // acelera suave nos primeiros 0,3 s
    const v = 2.3 * (+O.giroVel || 1) * ac * dt;
    U.olhar(dx * v, dy * v * .7);
  }
  let auto = false, autoVida = 100;
  function alternarAuto() { if (auto) pararAuto(true); else { auto = true; autoVida = C.S ? C.S.health : 100; C.keys.KeyW = true; C.toast('Andando sozinha. O mouse guia; ' + nomeTecla(teclaDe('autoandar')) + ' ou qualquer tecla de andar para.'); marca('#pl-auto', true); } }
  function pararAuto(avisar) { if (!auto) return; auto = false; C.keys.KeyW = false; marca('#pl-auto', false); if (avisar) C.toast('Parou de andar sozinha.'); }
  function autoFrame() {
    if (!auto) return;
    const s = C.S;
    if (!emJogo() || !s || s.hidden || C.ui || s.health < autoVida - 2 || (C.M && C.M.state === 'agarra')) { pararAuto(); return; }
    C.keys.KeyW = true;
  }
  function marca(sel, on) { const el = $(sel); if (el) el.hidden = !on; }

  // ===================================================================
  // 7. MOUSE: cru, sem saltos, e o modo arrastar (quando o navegador não deixa prender o ponteiro)
  // ===================================================================
  addEventListener('mousemove', e => {
    if (foto) { fotoMouse(e); return; }
    if (!e.isTrusted) return;
    // bug conhecido: logo depois de prender o ponteiro chega um salto enorme que vira a câmera 180 graus
    if (document.pointerLockElement && (Math.abs(e.movementX) > 280 || Math.abs(e.movementY) > 280)) { e.stopImmediatePropagation(); return; }
    if (O.arrastar && !U.toque && emJogo() && (e.buttons & 1)) { const k = .0022 * (+C.OPT.sens || 1); U.olhar(e.movementX * k, e.movementY * k); if (C.M && C.M.state === 'agarra') U.puxar(Math.abs(e.movementX) + Math.abs(e.movementY)); }
    mouseX = e.clientX; mouseY = e.clientY;
  }, true);
  let mouseX = -1, mouseY = -1, falhasTrava = 0, ofertou = false;
  function bordaArrastar(dt) {
    if (!O.arrastar || U.toque || !emJogo() || mouseX < 0) return;
    const w = innerWidth, m = w * .05; let d = 0;
    if (mouseX < m) d = -(1 - mouseX / m); else if (mouseX > w - m) d = (mouseX - (w - m)) / m;
    if (d) U.olhar(d * 1.6 * dt, 0); // perto da borda a câmera gira devagar
  }
  document.addEventListener('pointerlockerror', () => {
    if (robo || O.arrastar || U.toque) return;
    falhasTrava++;
    if (falhasTrava >= 2 && !ofertou) { ofertou = true; oferecerArrastar(); }
  });
  function oferecerArrastar() {
    const el = document.createElement('div'); el.id = 'pl-oferta'; el.className = 'pl-cartao';
    el.innerHTML = '<p>O navegador não deixou prender o mouse (comum em computador de escola). Quer jogar segurando o botão e arrastando para olhar?</p><button class="btn" id="pl-of-sim">Usar o modo arrastar</button><button class="btn" id="pl-of-nao">Agora não</button>';
    document.body.appendChild(el);
    $('#pl-of-sim').onclick = () => { O.arrastar = true; U.salvar(); U.syncOpcoes(); el.remove(); C.toast('Modo arrastar: segure o botão esquerdo e arraste para olhar. Encostar na borda da tela também gira.'); };
    $('#pl-of-nao').onclick = () => el.remove();
  }

  // ===================================================================
  // 8. GIROSCÓPIO E SACUDIR O CELULAR
  // ===================================================================
  let giroOuvindo = false, giroSuave = [0, 0], ultSacode = 0, sacodeSeg = null;
  async function pedirMovimento() {
    try { if (window.DeviceMotionEvent && DeviceMotionEvent.requestPermission) { const r = await DeviceMotionEvent.requestPermission(); if (r !== 'granted') return false; } } catch (e) { return false; }
    ouvirMovimento(); return true;
  }
  function ouvirMovimento() {
    if (giroOuvindo || !window.DeviceMotionEvent) return; giroOuvindo = true;
    addEventListener('devicemotion', e => {
      if (!U.toque || !emJogo()) return;
      const dt = Math.min(.05, (e.interval > 1 ? e.interval / 1000 : e.interval) || .016);
      const rr = e.rotationRate;
      if (O.giro && rr) {
        const ang = (screen.orientation && screen.orientation.angle) || window.orientation || 0;
        let yaw, pit;
        if (ang === 90) { yaw = rr.beta; pit = rr.gamma; } else if (ang === 270 || ang === -90) { yaw = -rr.beta; pit = -rr.gamma; } else { yaw = rr.gamma; pit = rr.beta; }
        const dz = 1.2; yaw = Math.abs(yaw) < dz ? 0 : yaw; pit = Math.abs(pit) < dz ? 0 : pit; // zona morta: parado não treme
        giroSuave[0] += (yaw - giroSuave[0]) * .5; giroSuave[1] += (pit - giroSuave[1]) * .5; // filtro passa-baixa
        const k = Math.PI / 180 * dt * (+O.giroSens || 1);
        U.olhar(-giroSuave[0] * k, giroSuave[1] * k);
      }
      const a = e.acceleration;
      if (O.sacudir && a && a.x != null) {
        const m = Math.hypot(a.x, a.y, a.z), agora = performance.now();
        if (m > 18 && agora - ultSacode > 350) {
          ultSacode = agora;
          if (C.M && C.M.state === 'agarra') U.puxar(320);
          else { const s = C.S; if (s && s.inv && s.inv.lanterna && s.inv.pilhas <= 0 && s.battery < 15 && !sacodeSeg) { U.apertarTecla('KeyR'); sacodeSeg = setTimeout(() => { U.soltarTecla('KeyR'); sacodeSeg = null; }, 1150); } }
        }
      }
    });
  }

  // ===================================================================
  // 9. TOQUE: analógico de verdade, gestos, botões que contam o que fazem, tutorial
  // ===================================================================
  let tqZona = null, tapAnt = 0, tapAntX = 0, tapAntY = 0, doisDedos = [];
  function montarToque(el) {
    const topo = $('#tq-topo');
    if (topo && !$('#tq-responder')) { const b = document.createElement('button'); b.id = 'tq-responder'; b.dataset.k = 'KeyV'; b.textContent = 'Responder'; b.hidden = true; topo.prepend(b); ligarBotao(b); }
    if (!$('#tq-esconder')) { const b = document.createElement('button'); b.id = 'tq-esconder'; b.textContent = 'ESCONDER'; b.hidden = true; el.appendChild(b);
      const vai = e => { e.preventDefault(); e.stopPropagation(); U.vibrar(.4, .3, 40); try { C.entrarMaisPerto(); } catch (er) {} };
      b.addEventListener('touchstart', vai, { passive: false }); b.addEventListener('click', vai); }
    if (!$('#tq-tut')) { const t = document.createElement('div'); t.id = 'tq-tut'; t.hidden = true; el.appendChild(t); }
    if (!$('#pl-auto')) { const a = document.createElement('div'); a.id = 'pl-auto'; a.hidden = true; a.textContent = '▸▸'; document.body.appendChild(a); }
    const zO = $('#tq-zona-olhar'); if (!zO || zO.dataset.p3) return; zO.dataset.p3 = 1;
    zO.addEventListener('touchstart', e => {
      const t = e.changedTouches[0], agora = performance.now();
      tqZona = { id: t.identifier, x: t.clientX, y: t.clientY, t: agora, mov: 0 };
      doisDedos = doisDedos.filter(d => agora - d.t < 160); doisDedos.push({ id: t.identifier, t: agora, x: t.clientX, y: t.clientY });
    }, { passive: true });
    addEventListener('touchmove', e => { for (const t of e.changedTouches) { if (tqZona && t.identifier === tqZona.id) tqZona.mov = Math.max(tqZona.mov, Math.hypot(t.clientX - tqZona.x, t.clientY - tqZona.y)); for (const d of doisDedos) if (d.id === t.identifier && Math.hypot(t.clientX - d.x, t.clientY - d.y) > 18) d.longe = true; } }, { passive: true });
    addEventListener('touchend', e => {
      const agora = performance.now();
      // dois dedos encostados juntos na área de olhar: pausa
      if (doisDedos.length >= 2 && doisDedos.every(d => !d.longe && agora - d.t < 400) && [...e.changedTouches].some(t => doisDedos.some(d => d.id === t.identifier)) && emJogo()) { doisDedos = []; tqZona = null; U.vibrar(0, .3, 30); C.abrirPausa(); return; }
      for (const t of e.changedTouches) {
        if (!tqZona || t.identifier !== tqZona.id) continue;
        const z = tqZona; tqZona = null;
        if (agora - z.t > 220 || z.mov > 14 || !emJogo()) continue;
        const cx = innerWidth / 2, cy = innerHeight / 2;
        if (Math.abs(z.x - cx) < innerWidth * .2 && Math.abs(z.y - cy) < innerHeight * .24) { // toque curto no meio: usa o que está na mira
          if (C.M && C.M.state === 'agarra') U.puxar(200); else { U.apertarTecla('KeyE'); setTimeout(() => U.soltarTecla('KeyE'), 90); }
          tapAnt = 0; continue;
        }
        if (agora - tapAnt < 320 && Math.hypot(z.x - tapAntX, z.y - tapAntY) < 60) { // toque duplo: olha para trás
          tapAnt = 0; U.apertarTecla('KeyQ'); setTimeout(() => U.soltarTecla('KeyQ'), 700); continue;
        }
        tapAnt = agora; tapAntX = z.x; tapAntY = z.y;
      }
    }, { passive: true });
  }
  function ligarBotao(bt) {
    const k = bt.dataset.k;
    const ini = e => { e.preventDefault(); e.stopPropagation(); bt.classList.add('on'); U.vibrar(0, .2, 12); U.apertarTecla(k); };
    const fim = e => { e.preventDefault(); bt.classList.remove('on'); U.soltarTecla(k); };
    bt.addEventListener('touchstart', ini, { passive: false }); bt.addEventListener('touchend', fim, { passive: false }); bt.addEventListener('touchcancel', fim, { passive: false });
  }
  function rotuloUsar(txt, s) {
    if (s && s.hidden) return 'Sair';
    const t = (txt || '').toLowerCase();
    if (!t) return 'Usar';
    if (/segure/.test(t)) return 'Segurar';
    if (/esconder|deitar|entrar no|embaixo/.test(t)) return 'Esconder';
    if (/sair/.test(t)) return 'Sair';
    if (/abrir|fechar|porta|gaveta|portão|tampa/.test(t)) return 'Abrir';
    if (/ler|placa|nota|carta|página|bilhete|caderno|livro|quadro|ficha/.test(t)) return 'Ler';
    if (/pegar|pilha|curativo|garrafa|chave|galão|peça|engrenagem|fita/.test(t)) return 'Pegar';
    if (/ouvir|tocar|ligar|girar|apertar|puxar|cavar|bater/.test(t)) return t.match(/ouvir|tocar|ligar|girar|apertar|puxar|cavar|bater/)[0].replace(/^./, c => c.toUpperCase());
    return 'Usar';
  }
  let tutPasso = -1, tutYaw = 0, tutT = 0;
  const TUT = ['arraste aqui para andar', 'arraste aqui para olhar', 'toque em Usar quando ele acender (ou toque no meio da tela)'];
  function tutorial(dt, mostra) {
    const el = $('#tq-tut'); if (!el) return;
    if (O.tqTut || !mostra || robo) { if (!el.hidden) el.hidden = true; return; }
    if (tutPasso < 0) { tutPasso = 0; tutYaw = C.P.yaw; tutT = 0; }
    tutT += dt;
    const st = U.stick;
    if (tutPasso === 0 && st && st.l > .5) { tutPasso = 1; tutYaw = C.P.yaw; tutT = 0; }
    else if (tutPasso === 1 && Math.abs(C.P.yaw - tutYaw) > .4) { tutPasso = 2; tutT = 0; }
    else if (tutPasso === 2 && (C.keys.KeyE || tutT > 9)) { O.tqTut = true; U.salvar(); el.hidden = true; return; }
    el.hidden = false; el.className = 'tut-' + tutPasso; if (el.textContent !== TUT[tutPasso]) el.textContent = TUT[tutPasso];
  }
  function toqueFrame(dt, mostra) {
    tutorial(dt, mostra);
    if (!mostra) return;
    const s = C.S, pr = $('#prompt'), inv = s.inv || {};
    // Usar diz o que vai fazer
    const bu = $('#tq-usar'); if (bu) { const r = rotuloUsar(pr && pr.textContent, s); if (bu.textContent !== r) bu.textContent = r; }
    const resp = $('#tq-responder'); if (resp) { const on = !!C.chamado; if (resp.hidden === on) { resp.hidden = !on; if (on) U.vibrar(.2, .2, 60); } }
    // ESCONDER: caçada e um armário logo ali
    const esc = $('#tq-esconder');
    if (esc) {
      let on = false;
      if (C.M && C.M.ativo && C.M.state === 'caca' && !s.hidden && s.dif !== 'pesadelo') {
        const room = C.P.room;
        for (const L of C.W.lockers) if (Math.hypot(L.x - C.P.pos.x, L.z - C.P.pos.z) < 1.4 && C.roomAt(L.x + L.face[0] * .8, L.z + L.face[1] * .8) === room) { on = true; break; }
      }
      if (esc.hidden === on) esc.hidden = !on;
    }
    // tela limpa: só acende o que serve agora
    const limpo = !!O.tqLimpo; document.body.classList.toggle('tq-limpo', limpo);
    if (limpo) {
      const dM = C.M && C.M.ativo ? Math.hypot(C.M.pos.x - C.P.pos.x, C.M.pos.z - C.P.pos.z) : 99;
      const util = (id, on) => { const b = document.getElementById(id); if (b) b.classList.toggle('util', !!on); };
      util('tq-pilha', inv.lanterna && (s.battery < 30));
      util('tq-curativo', (inv.kits | 0) > 0 && s.health < 70);
      util('tq-garrafa', (inv.garrafas | 0) > 0 && dM < 15);
      util('tq-folego', dM < 8 || s.hidden);
      util('tq-atras', dM < 10 || (C.ANA && C.ANA.ativa));
    }
  }

  // ===================================================================
  // 10. NOTA, COFRE E CONTAGEM NO CELULAR
  // ===================================================================
  function montarNota() {
    const paper = $('#note .paper'); if (!paper || $('#pl-nota-bts')) return;
    const d = document.createElement('div'); d.id = 'pl-nota-bts';
    d.innerHTML = '<button class="btn" id="pl-virar">Virar a folha</button><button class="btn" id="pl-voz">Ler em voz alta</button>';
    paper.appendChild(d);
    const para = e => e.stopPropagation();
    for (const id of ['pl-virar', 'pl-voz']) { const b = $('#' + id); b.addEventListener('touchstart', para, { passive: true }); b.addEventListener('mousedown', para); b.addEventListener('pointerdown', para); }
    $('#pl-virar').addEventListener('click', e => { e.stopPropagation(); C.onKey(fake('KeyV')); verNota(); });
    $('#pl-voz').addEventListener('click', e => { e.stopPropagation(); C.onKey(fake('KeyL')); });
    const nota = $('#note');
    new MutationObserver(verNota).observe(nota, { attributes: true, attributeFilter: ['hidden'] });
  }
  function verNota() {
    const b = $('#pl-virar'); if (!b) return;
    const h = ($('#note h2') && $('#note h2').textContent) || '';
    b.hidden = !(R.regras && R.regras.verso && h.indexOf(R.regras.titulo) === 0 && !/verso/.test(h));
  }
  function montarCofre() {
    const g = $('#k-grid'); if (!g || g.dataset.p3) return; g.dataset.p3 = 1;
    g.addEventListener('pointerdown', e => { if (e.target.tagName === 'BUTTON') U.vibrar(0, .35, e.target.textContent === 'OK' ? 30 : 12); });
  }
  function vibrarContagem() {
    const SOM = C.SOM; if (!SOM || typeof SOM.contagem !== 'function' || SOM.contagem._p3) return;
    const o = SOM.contagem;
    SOM.contagem = (pos, n, ...r) => {
      try { if (O.vibMundo && n > 0) { if (n >= 9) { U.vibrar(.8, .6, 160); setTimeout(() => U.vibrar(.9, .7, 260), 220); } else U.vibrar(.12 + n * .05, .1, 26 + n * 7); } } catch (e) {}
      return o(pos, n, ...r);
    };
    SOM.contagem._p3 = true;
  }

  // ===================================================================
  // 11. TELA ACESA, VOLTAR DO CELULAR, DEITAR O CELULAR, TELA CHEIA AO JOGAR
  // ===================================================================
  let wake = null, wakePedindo = false, wakeT = 0;
  function wakeFrame(dt) {
    wakeT -= dt; if (wakeT > 0 || !('wakeLock' in navigator) || robo) return; wakeT = 1;
    const s = C.S, quer = !document.hidden && ((C.mode === 'jogo' && C.ui !== 'pausa' && C.ui !== 'morte' && s && !s.fim) || C.mode === 'cena');
    if (quer && !wake && !wakePedindo) { wakePedindo = true; navigator.wakeLock.request('screen').then(w => { wake = w; wakePedindo = false; w.addEventListener('release', () => { if (wake === w) wake = null; }); }).catch(() => { wakePedindo = false; wakeT = 10; }); }
    else if (!quer && wake) { const w = wake; wake = null; w.release().catch(() => {}); }
  }
  let historiaPosta = false;
  function voltarCelular() {
    if (historiaPosta || robo || !(U.toque || instalado) || C.mode !== 'jogo') return;
    historiaPosta = true;
    try { history.pushState({ hds: 1 }, ''); } catch (e) { return; }
    addEventListener('popstate', () => {
      if (C.mode === 'jogo' && !foto && !emerg) {
        if (C.ui === 'pausa' && $('#plat-opcoes').hidden) C.fecharPausa();
        else if (emJogo()) C.abrirPausa();
      }
      try { history.pushState({ hds: 1 }, ''); } catch (e) {}
    });
  }
  try { matchMedia('(orientation: portrait)').addEventListener('change', e => { if (e.matches && U.toque && emJogo()) C.abrirPausa(); textoGirar(); }); } catch (e) {}
  function textoGirar() {
    const g = $('#girar'); if (!g) return; const s = C.S;
    const cap = s && R.capitulos[s.chapter] ? R.capitulos[s.chapter].titulo : '';
    g.innerHTML = '<div><p>Deite o celular para continuar.</p>' + (cap && C.mode === 'jogo' ? `<small>${cap}</small>` : '') + '</div>';
  }
  function telaCheiaAoJogar(e) {
    if (robo || U.toque || !O.cheiaJogo || document.fullscreenElement) return;
    try { const p = document.documentElement.requestFullscreen({ navigationUI: 'hide' }); if (p && p.catch) p.catch(() => {}); } catch (er) {}
  }

  // ===================================================================
  // 12. SOM QUE VOLTA SOZINHO (Safari, ligações, alarmes) E FONE QUE SAI
  // ===================================================================
  let silencioTocado = false, somMudoT = 0;
  function destravarSom() {
    const ac = C.AC; if (!ac) return;
    if (!silencioTocado) { silencioTocado = true; try { const b = ac.createBuffer(1, 1, 22050), s = ac.createBufferSource(); s.buffer = b; s.connect(ac.destination); s.start(0); } catch (e) {} }
    if (ac.state !== 'running' && !document.hidden && C.ui !== 'pausa') ac.resume().catch(() => {});
  }
  addEventListener('pointerup', destravarSom, true); addEventListener('touchend', destravarSom, true); addEventListener('keydown', e => { if (e.isTrusted) destravarSom(); }, true);
  function somFrame(dt) {
    const ac = C.AC, el = $('#pl-som'); if (!el) return;
    const mudo = ac && ac.state !== 'running' && !document.hidden && emJogo();
    somMudoT = mudo ? somMudoT + dt : 0;
    const mostra = somMudoT > 1;
    if (el.hidden === mostra) el.hidden = !mostra;
  }
  let foneSaiu = 0;
  try {
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) navigator.mediaDevices.addEventListener('devicechange', () => {
      if (robo || !O.fone || !emJogo() || !C.S || (C.S.capT || 0) < 5 || performance.now() - foneSaiu < 4000) return;
      foneSaiu = performance.now(); C.abrirPausa();
      const p = $('#p-info'); if (p) { const d = document.createElement('div'); d.className = 'pl-fone-aviso'; d.textContent = 'Um fone ou caixa de som mudou. Confira se o som está saindo onde você quer antes de voltar.'; p.appendChild(d); setTimeout(() => d.remove(), 12000); }
    });
  } catch (e) {}

  // ===================================================================
  // 13. TECLA DE EMERGÊNCIA (F9): som cortado, pausa e um trabalho de escola na tela
  // ===================================================================
  let emerg = false, emergT = 0;
  function montarEmergencia() {
    const el = document.createElement('div'); el.id = 'pl-emerg'; el.hidden = true;
    el.innerHTML = `<article><h1>Trabalho de Ciências — <span>O Ciclo da Água</span><i class="gota"></i></h1><p class="aut">Turma 7ºB · Professora Márcia</p>
    <h2>1. Evaporação</h2><p>O calor do Sol aquece a água dos rios, lagos e mares. A água passa do estado líquido para o gasoso e sobe para a atmosfera em forma de vapor.</p>
    <h2>2. Condensação</h2><p>Lá no alto o ar é mais frio. O vapor esfria, vira gotinhas muito pequenas e forma as nuvens.</p>
    <h2>3. Precipitação</h2><p>Quando as gotas ficam pesadas demais, caem como chuva, granizo ou neve.</p>
    <h2>4. Infiltração e escoamento</h2><p>Parte da água entra no solo e abastece os lençóis freáticos. A outra parte escorre de volta para os rios.</p>
    <h2>Conclusão</h2><p>A água da Terra é sempre a mesma: ela só muda de lugar. <span class="sempre">Tudo o que desce um dia volta.</span></p></article>`;
    document.body.appendChild(el);
  }
  let tituloAntes = '';
  function alternarEmergencia() {
    const el = $('#pl-emerg'); if (!el || plateia) return;
    if (!emerg) {
      emerg = true; emergT = 0; window.__emergencia = true;
      if (emJogo()) C.abrirPausa();
      try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {}
      U.volume(0, .02); try { if (C.AC) C.AC.suspend(); } catch (e) {}
      tituloAntes = document.title; document.title = 'Trabalho de Ciências - O Ciclo da Água';
      el.hidden = false; el.classList.remove('sangra');
    } else {
      emerg = false; window.__emergencia = false; el.hidden = true; document.title = tituloAntes;
      try { if (C.AC) C.AC.resume(); } catch (e) {}
      U.volume(C.mode === 'titulo' ? C.OPT.vol : C.OPT.vol * .22, .6); // volta para a pausa, nunca direto para o jogo
    }
  }
  function emergFrame(dt) {
    if (!emerg) return; emergT += dt;
    if (emergT > 30) { const el = $('#pl-emerg'); if (el && !el.classList.contains('sangra')) el.classList.add('sangra'); } // segredo: o trabalho começa a sangrar
  }

  // ===================================================================
  // 14. MODO FOTO
  // ===================================================================
  let foto = null;
  const FILTROS = [
    { id: 'normal', nome: 'Sem filtro', css: '' },
    { id: 'vhs', nome: 'VHS 1994', css: 'contrast(1.15) saturate(.75) hue-rotate(-8deg) brightness(1.05)' },
    { id: 'sepia', nome: 'Sépia 1979', css: 'sepia(.85) contrast(1.1) brightness(.95)' },
    { id: 'pb', nome: 'Preto e branco', css: 'grayscale(1) contrast(1.35)' },
    { id: 'polaroide', nome: 'Polaroide', css: 'sepia(.25) saturate(.8) contrast(.95) brightness(1.08)' }
  ];
  const DEF_RETRATO = { id: 'retrato', nome: 'Retrato de família', desc: 'Tire uma foto em que aparece alguém que não estava lá.', secreta: true, segredo: true, dica: 'Revele as fotos com calma.' };
  if (R.conquistas && !R.conquistas.some(c => c.id === 'retrato')) R.conquistas.push(DEF_RETRATO);
  function podeFoto() { const s = C.S; return C.mode === 'jogo' && C.ui === 'pausa' && s && !s.dead && !(C.M && (C.M.state === 'agarra' || C.M.state === 'caca')); }
  function entrarFoto() {
    if (!podeFoto()) { C.toast('Agora não. Ele está perto demais.'); return; }
    const cam = C.camera;
    foto = { pos: cam.position.clone(), rot: cam.rotation.clone(), fov: cam.fov, filtroCss: C.renderer.domElement.style.filter,
      base: cam.position.clone(), off: new THREE.Vector3(), yaw: C.P.yaw, pitch: C.P.pitch, roll: 0, fovF: cam.fov, filtro: 0, teclas: {}, arr: null };
    $('#pause').hidden = true; document.body.classList.add('modo-foto');
    let el = $('#pl-foto');
    if (!el) {
      el = document.createElement('div'); el.id = 'pl-foto';
      el.innerHTML = `<div class="pf-barra"><button class="btn" id="pf-filtro">Filtro</button><label>Campo de visão <input type="range" id="pf-fov" min="25" max="100" step="1"></label><button class="btn" id="pf-tirar">Fotografar</button><button class="btn" id="pf-sair">Sair</button></div>
      <div class="pf-ajuda">arraste para olhar · WASD move (R/F sobe e desce) · Q/E inclina · roda do mouse aproxima · T troca o filtro · ESPAÇO fotografa · ESC sai</div>
      <div class="pf-nome"></div><div class="pf-rev" hidden><img alt="Foto revelada"><div class="pf-rev-bts"><button class="btn" id="pf-guardar">Guardar</button><button class="btn" id="pf-outra">Tirar outra</button></div></div>`;
      document.body.appendChild(el);
      $('#pf-filtro').onclick = () => trocarFiltro(1);
      $('#pf-fov').oninput = e => { if (foto) foto.fovF = +e.target.value; };
      $('#pf-tirar').onclick = tirarFoto; $('#pf-sair').onclick = sairFoto;
      $('#pf-outra').onclick = () => { $('#pl-foto .pf-rev').hidden = true; };
      el.addEventListener('mousedown', e => { if (foto && e.target === el) foto.arr = { x: e.clientX, y: e.clientY }; });
      el.addEventListener('touchstart', e => { if (foto && e.target === el) { const t = e.touches[0]; foto.arr = { x: t.clientX, y: t.clientY }; } }, { passive: true });
      el.addEventListener('touchmove', e => { if (foto && foto.arr) { const t = e.touches[0]; girarFoto(t.clientX - foto.arr.x, t.clientY - foto.arr.y); foto.arr = { x: t.clientX, y: t.clientY }; } }, { passive: true });
      addEventListener('mouseup', () => { if (foto) foto.arr = null; }); addEventListener('touchend', () => { if (foto) foto.arr = null; });
      el.addEventListener('wheel', e => { if (!foto) return; e.preventDefault(); foto.fovF = clamp(foto.fovF + Math.sign(e.deltaY) * 3, 25, 100); $('#pf-fov').value = foto.fovF; }, { passive: false });
    }
    el.hidden = false; $('#pf-fov').value = Math.round(foto.fovF); $('#pl-foto .pf-rev').hidden = true; trocarFiltro(0);
  }
  function trocarFiltro(d) { if (!foto) return; foto.filtro = (foto.filtro + d + FILTROS.length) % FILTROS.length; const f = FILTROS[foto.filtro]; C.renderer.domElement.style.filter = f.css; const n = $('#pl-foto .pf-nome'); if (n) n.textContent = f.nome; }
  function girarFoto(dx, dy) { foto.yaw -= dx * .004; foto.pitch = clamp(foto.pitch - dy * .004, -1.4, 1.4); }
  function fotoMouse(e) { if (foto && foto.arr && (e.buttons & 1)) { girarFoto(e.clientX - foto.arr.x, e.clientY - foto.arr.y); foto.arr = { x: e.clientX, y: e.clientY }; } }
  function fotoTecla(e) {
    if (e.code === 'F12' || e.code === 'F11') return;
    e.stopImmediatePropagation(); e.preventDefault();
    const down = e.type === 'keydown';
    foto.teclas[e.code] = down;
    if (!down || e.repeat) return;
    if (e.code === 'Escape' || e.code === 'KeyP') sairFoto();
    else if (e.code === 'Space' || e.code === 'Enter') tirarFoto();
    else if (e.code === 'KeyT') trocarFiltro(1);
  }
  const _rc = new THREE.Raycaster(), _dir = new THREE.Vector3();
  function fotoFrame(dt) {
    if (!foto) return;
    const k = foto.teclas, cam = C.camera;
    const fw = (k.KeyW ? 1 : 0) - (k.KeyS ? 1 : 0), st = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0), up = (k.KeyR ? 1 : 0) - (k.KeyF ? 1 : 0);
    const sy = Math.sin(foto.yaw), cy = Math.cos(foto.yaw), v = 1.4 * dt;
    const alvo = foto.off.clone().add(new THREE.Vector3((-sy * fw + cy * st) * v, up * v, (-cy * fw - sy * st) * v));
    if (alvo.length() > 2.5) alvo.setLength(2.5); // a câmera fica perto da Lia
    alvo.y = clamp(alvo.y, -foto.base.y + .15, 1.2);
    // não atravessa parede
    _dir.copy(alvo); const L = _dir.length();
    if (L > .01) { _dir.normalize(); _rc.set(foto.base, _dir); _rc.far = L + .2; const h = _rc.intersectObjects(C.W.solid || [], false)[0]; if (h && h.distance < L + .15) alvo.setLength(Math.max(0, h.distance - .2)); }
    foto.off.copy(alvo);
    foto.roll = clamp(foto.roll + ((k.KeyE ? 1 : 0) - (k.KeyQ ? 1 : 0)) * dt * .8, -.6, .6);
    cam.position.copy(foto.base).add(foto.off);
    cam.rotation.set(foto.pitch, foto.yaw, foto.roll);
    if (Math.abs(cam.fov - foto.fovF) > .01) { cam.fov = foto.fovF; cam.updateProjectionMatrix(); }
  }
  function sairFoto() {
    if (!foto) return;
    const cam = C.camera; cam.position.copy(foto.pos); cam.rotation.copy(foto.rot); cam.fov = foto.fov; cam.updateProjectionMatrix();
    C.renderer.domElement.style.filter = foto.filtroCss || '';
    foto = null; document.body.classList.remove('modo-foto'); const el = $('#pl-foto'); if (el) el.hidden = true;
    if (C.ui === 'pausa') $('#pause').hidden = false;
  }
  function dataFita() { const s = C.S || {}, m = 20 * 60 + 31 + (s.chapter || 0) * 17 + Math.floor((s.capT || 0) / 20); return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; }
  function fantasma(g, W, H, rnd) {
    // uma criança de pé no escuro, que não estava na cena
    const x = W * (rnd() < .5 ? .14 + rnd() * .16 : .7 + rnd() * .16), y = H * .5, h = H * (.34 + rnd() * .1);
    g.save(); g.filter = 'blur(2.5px)'; g.globalAlpha = .38 + rnd() * .12;
    const gr = g.createLinearGradient(x, y - h * .5, x, y + h * .5); gr.addColorStop(0, 'rgba(18,16,14,.95)'); gr.addColorStop(1, 'rgba(8,8,8,0)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y - h * .38, h * .085, h * .1, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(x - h * .12, y - h * .26); g.lineTo(x + h * .12, y - h * .26); g.lineTo(x + h * .17, y + h * .4); g.lineTo(x - h * .17, y + h * .4); g.closePath(); g.fill();
    g.globalAlpha = .55; g.filter = 'blur(1px)'; g.fillStyle = 'rgba(220,215,200,.9)';
    g.beginPath(); g.arc(x - h * .03, y - h * .39, h * .009, 0, 7); g.arc(x + h * .03, y - h * .39, h * .009, 0, 7); g.fill();
    g.restore();
  }
  let ultimaFoto = null;
  function tirarFoto() {
    if (!foto) return;
    const r = C.renderer, cv = r.domElement;
    r.render(C.scene, C.camera);
    const W = cv.width, H = cv.height, f = FILTROS[foto.filtro];
    const pol = f.id === 'polaroide', M = pol ? Math.round(W * .05) : 0, base = pol ? Math.round(W * .16) : 0;
    const out = document.createElement('canvas'); out.width = W + M * 2; out.height = H + M + base + M;
    const g = out.getContext('2d');
    if (pol) { g.fillStyle = '#ece6d8'; g.fillRect(0, 0, out.width, out.height); }
    g.filter = f.css || 'none'; g.drawImage(cv, M, M); g.filter = 'none';
    let seed = Date.now() % 100000; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed & 0xffff) / 65536; };
    O.fotos = (O.fotos | 0) + 1;
    const assombrada = O.fotos >= 3 && (O.fotos % 7 === 3 || rnd() < .12) && C.W.mapa !== 'estrada';
    if (assombrada) { g.save(); g.beginPath(); g.rect(M, M, W, H); g.clip(); g.translate(M, M); fantasma(g, W, H, rnd); g.restore(); }
    if (f.id === 'vhs') {
      g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
      g.font = `${Math.round(H * .045)}px "Special Elite", "Courier New", monospace`; g.fillStyle = 'rgba(235,235,225,.85)'; g.textAlign = 'left';
      g.fillText('PLAY ▸', W * .04, H * .09); g.textAlign = 'right'; g.fillText(dataFita() + '  OUT. 27 1994', W * .96, H * .93);
    } else if (f.id === 'sepia' || f.id === 'pb') {
      for (let i = 0; i < W * H / 900; i++) { g.fillStyle = `rgba(${rnd() < .5 ? '0,0,0' : '255,250,235'},${rnd() * .12})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 2); }
      if (f.id === 'sepia') { g.strokeStyle = 'rgba(255,245,220,.18)'; for (let i = 0; i < 5; i++) { const x = rnd() * W; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (rnd() - .5) * 30, H); g.stroke(); } }
    } else if (pol) {
      g.font = `${Math.round(base * .3)}px "Special Elite", "Courier New", monospace`; g.fillStyle = '#3a3428'; g.textAlign = 'center';
      g.fillText('São Lázaro, ' + (C.S && C.S.chapter === 0 ? 'a estrada' : 'out. 1994'), out.width / 2, H + M + base * .6);
    }
    if (assombrada) { try { C.conquista('retrato'); } catch (e) {} }
    const url = out.toDataURL('image/png'); ultimaFoto = { url, nome: 'hora-do-silencio-foto-' + O.fotos + '.png' }; U.salvar();
    const rev = $('#pl-foto .pf-rev'), img = rev.querySelector('img');
    img.src = url; rev.hidden = false; rev.classList.remove('revela'); void rev.offsetWidth; rev.classList.add('revela'); // revela como filme
    U.vibrar(.3, .2, 40);
    $('#pf-guardar').onclick = () => guardarArquivo(ultimaFoto.url, ultimaFoto.nome, 'image/png');
  }
  async function guardarArquivo(urlOuBlob, nome, tipo) {
    try {
      const blob = urlOuBlob instanceof Blob ? urlOuBlob : await (await fetch(urlOuBlob)).blob();
      const arq = new File([blob], nome, { type: tipo });
      if (U.toque && navigator.canShare && navigator.canShare({ files: [arq] })) { await navigator.share({ files: [arq], title: 'A Hora do Silêncio' }); return; }
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    } catch (e) { if (e && e.name === 'AbortError') return; C.toast('Não deu para guardar o arquivo neste navegador.'); }
  }

  // ===================================================================
  // 15. JANELA DA PLATEIA (BroadcastChannel, sem servidor)
  // ===================================================================
  let canal = null, plateiaT = 0, plateiaViva = 0, susto = 0;
  try { canal = new BroadcastChannel('hds-plateia'); } catch (e) {}
  function salasMsg() { return (C.W.salas || []).map(r => ({ x0: r.x0, x1: r.x1, z0: r.z0, z1: r.z1, fora: !!r.fora, nome: r.nome || '', id: r.id })); }
  if (canal && !plateia) canal.onmessage = ev => {
    const m = ev.data || {};
    if (m.t === 'ola') { plateiaViva = performance.now(); canal.postMessage({ t: 'mapa', salas: salasMsg(), modo: O.plateiaModo || 'atrapalha' }); }
    else if (m.t === 'assustar' && emJogo() && performance.now() - susto > 55000) {
      susto = performance.now(); const P = C.P, a = P.yaw + (Math.random() - .5) * .8; // atrás dela, a uns 3,5 m
      const px = P.pos.x + Math.sin(a) * 3.5, pz = P.pos.z + Math.cos(a) * 3.5;
      const r = Math.random(), SFX = C.SFX;
      if (r < .34) SFX.risada(px, pz); else if (r < .67) SFX.rangido(px, 1.2, pz); else SFX.passoMonstro({ x: px, y: 0, z: pz }, .9);
    } else if (m.t === 'avisar' && emJogo() && performance.now() - susto > 25000) { susto = performance.now(); C.toast('Alguém sussurra no seu ouvido: “atrás de você...”'); }
  };
  function plateiaFrame(dt) {
    if (!canal || plateia || !plateiaViva || performance.now() - plateiaViva > 600000) return;
    plateiaT -= dt; if (plateiaT > 0) return; plateiaT = .2;
    const s = C.S, P = C.P, M = C.M, A = C.ANA, PR = C.PROC;
    canal.postMessage({ t: 'estado', mapa: C.W.mapa, cap: s && R.capitulos[s.chapter] ? R.capitulos[s.chapter].titulo : '', modo: O.plateiaModo || 'atrapalha',
      lia: { x: P.pos.x, z: P.pos.z, yaw: P.yaw, esc: !!(s && s.hidden), morta: !!(s && s.dead) },
      insp: M && M.ativo ? { x: M.pos.x, z: M.pos.z, st: M.state } : null, ana: A && A.ativa ? { x: A.pos.x, z: A.pos.z } : null,
      proc: PR && PR.fase ? { x: PR.pos.x, z: PR.pos.z, f: PR.fase } : null, jogo: C.mode, pausa: C.ui === 'pausa' });
  }
  function abrirPlateia() {
    plateiaViva = performance.now();
    const w = open(location.pathname + '#plateia', 'hds-plateia', 'width=760,height=560');
    if (!w) C.toast('O navegador bloqueou a janela. Permita janelas novas para este site.');
    setTimeout(() => canal && canal.postMessage({ t: 'mapa', salas: salasMsg(), modo: O.plateiaModo || 'atrapalha' }), 1500);
  }
  // a janela da plateia em si
  function montarPlateia() {
    document.body.classList.add('plateia');
    const el = document.createElement('div'); el.id = 'pl-plateia';
    el.innerHTML = `<header><b>A Hora do Silêncio</b> · visão da plateia <span id="pp-cap"></span></header><canvas id="pp-mapa"></canvas>
    <footer><span id="pp-leg"><i class="l"></i> Lia <i class="m"></i> Inspetor (círculo: o que ele ouve) <i class="a"></i> a menina <i class="p"></i> Procissão</span><button class="btn" id="pp-acao">Assustar</button><small id="pp-espera"></small></footer>`;
    document.body.appendChild(el);
    let salas = [], est = null, modo = 'atrapalha', ultimo = 0, rastro = [];
    const cv = $('#pp-mapa'), g = cv.getContext('2d');
    canal.onmessage = ev => { const m = ev.data || {}; if (m.t === 'mapa') { salas = m.salas || []; modo = m.modo; rastro = []; } else if (m.t === 'estado') { est = m; modo = m.modo; if (!salas.length) canal.postMessage({ t: 'ola' }); } };
    canal.postMessage({ t: 'ola' }); setInterval(() => canal.postMessage({ t: 'ola' }), 20000);
    $('#pp-acao').onclick = () => { if (Date.now() - ultimo < 60000) return; ultimo = Date.now(); canal.postMessage({ t: modo === 'ajuda' ? 'avisar' : 'assustar' }); };
    function desenhar() {
      requestAnimationFrame(desenhar);
      const w = cv.clientWidth, h = cv.clientHeight; if (cv.width !== w) cv.width = w; if (cv.height !== h) cv.height = h;
      g.fillStyle = '#060504'; g.fillRect(0, 0, w, h);
      const falta = Math.max(0, 60 - Math.floor((Date.now() - ultimo) / 1000)); $('#pp-espera').textContent = falta ? `de novo em ${falta} s` : '';
      $('#pp-acao').textContent = modo === 'ajuda' ? 'Avisar (atrás dela!)' : 'Assustar'; $('#pp-acao').disabled = !!falta;
      if (!est || !salas.length) { g.fillStyle = '#857a63'; g.font = 'italic 18px Georgia'; g.textAlign = 'center'; g.fillText('esperando a jogadora entrar no internato...', w / 2, h / 2); return; }
      $('#pp-cap').textContent = est.cap ? '· ' + est.cap : '';
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const r of salas) { if (r.fora && salas.length > 3) continue; x0 = Math.min(x0, r.x0); x1 = Math.max(x1, r.x1); z0 = Math.min(z0, r.z0); z1 = Math.max(z1, r.z1); }
      const k = Math.min((w - 40) / (x1 - x0 || 1), (h - 40) / (z1 - z0 || 1)), ox = (w - (x1 - x0) * k) / 2, oz = (h - (z1 - z0) * k) / 2;
      const X = x => ox + (x - x0) * k, Z = z => oz + (z - z0) * k;
      for (const r of salas) { g.fillStyle = r.fora ? 'rgba(40,46,40,.25)' : 'rgba(60,54,44,.35)'; g.strokeStyle = 'rgba(207,195,166,.25)'; g.fillRect(X(r.x0), Z(r.z0), (r.x1 - r.x0) * k, (r.z1 - r.z0) * k); g.strokeRect(X(r.x0), Z(r.z0), (r.x1 - r.x0) * k, (r.z1 - r.z0) * k); }
      const L = est.lia; rastro.push([L.x, L.z]); if (rastro.length > 120) rastro.shift();
      g.strokeStyle = 'rgba(201,167,90,.25)'; g.beginPath(); rastro.forEach(([x, z], i) => i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))); g.stroke();
      if (est.proc) { g.fillStyle = 'rgba(224,150,64,.85)'; g.beginPath(); g.arc(X(est.proc.x), Z(est.proc.z), 9, 0, 7); g.fill(); }
      if (est.ana) { g.fillStyle = 'rgba(170,190,215,.9)'; g.beginPath(); g.arc(X(est.ana.x), Z(est.ana.z), 6, 0, 7); g.fill(); }
      if (est.insp) { const r = (est.insp.st === 'caca' ? 14 : 8) * k; g.strokeStyle = est.insp.st === 'caca' ? 'rgba(192,57,43,.7)' : 'rgba(192,57,43,.3)'; g.beginPath(); g.arc(X(est.insp.x), Z(est.insp.z), r, 0, 7); g.stroke(); g.fillStyle = '#c0392b'; g.beginPath(); g.arc(X(est.insp.x), Z(est.insp.z), 7, 0, 7); g.fill(); }
      const ang = -L.yaw - Math.PI / 2; g.fillStyle = 'rgba(255,230,170,.18)'; g.beginPath(); g.moveTo(X(L.x), Z(L.z)); g.arc(X(L.x), Z(L.z), 60, ang - .45, ang + .45); g.closePath(); g.fill();
      g.fillStyle = L.esc ? '#7d7464' : '#e8dcbc'; g.beginPath(); g.arc(X(L.x), Z(L.z), 6, 0, 7); g.fill();
      if (est.pausa || est.jogo !== 'jogo') { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, w, h); g.fillStyle = '#cfc3a6'; g.font = 'italic 20px Georgia'; g.textAlign = 'center'; g.fillText(L.morta ? 'ela morreu.' : est.pausa ? 'pausado' : '...', w / 2, h / 2); }
    }
    desenhar();
  }

  // ===================================================================
  // 16. GRAVADOR DE SUSTOS (os últimos segundos, sem programa de gravação)
  // ===================================================================
  let grav = null;
  const clipeLigado = () => !!(O.clipe && grav && grav.recs.some(r => r.mr));
  function tipoVideo() { if (!window.MediaRecorder) return null; for (const t of ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']) if (MediaRecorder.isTypeSupported(t)) return t; return null; }
  function gravFrame() {
    const quer = O.clipe && !robo && (C.mode === 'jogo' || C.mode === 'cena');
    if (quer && !grav) iniciarGravador(); else if (!quer && grav && !O.clipe) pararGravador();
    if (!grav) return;
    const agora = performance.now();
    for (const r of grav.recs) if (r.mr && agora - r.ini > 20000 && !r.guardando) reiniciar(r);
  }
  function iniciarGravador() {
    const tipo = tipoVideo(); const cv = C.renderer.domElement;
    if (!tipo || !cv.captureStream) { O.clipe = false; U.salvar(); U.syncOpcoes(); C.toast('Este navegador não grava vídeo. O gravador de sustos foi desligado.'); return; }
    let audio = null; try { if (C.AC && C.master) { audio = C.AC.createMediaStreamDestination(); C.master.connect(audio); } } catch (e) { audio = null; }
    grav = { tipo, audio, recs: [{}, {}] };
    novoRec(grav.recs[0]); setTimeout(() => grav && novoRec(grav.recs[1]), 10000); // dois gravadores intercalados: sempre há 10 a 20 s guardados
  }
  function novoRec(r) {
    try {
      const st = new MediaStream([...C.renderer.domElement.captureStream(30).getVideoTracks(), ...(grav.audio ? grav.audio.stream.getAudioTracks() : [])]);
      r.pedacos = []; r.mr = new MediaRecorder(st, { mimeType: grav.tipo, videoBitsPerSecond: 2500000 }); r.ini = performance.now();
      r.mr.ondataavailable = e => { if (e.data && e.data.size) r.pedacos.push(e.data); };
      r.mr.start(1000);
    } catch (e) { r.mr = null; }
  }
  function reiniciar(r) { const mr = r.mr; r.mr = null; try { mr.onstop = () => novoRec(r); mr.stop(); } catch (e) { novoRec(r); } }
  function pararGravador() { if (!grav) return; for (const r of grav.recs) try { if (r.mr) r.mr.stop(); } catch (e) {} try { if (grav.audio) C.master.disconnect(grav.audio); } catch (e) {} grav = null; }
  function salvarClipe() {
    if (!grav) { C.toast('Ligue o gravador de sustos em Desempenho.'); return; }
    const vivos = grav.recs.filter(r => r.mr).sort((a, b) => a.ini - b.ini), r = vivos[0]; if (!r) return;
    r.guardando = true; const mr = r.mr;
    mr.onstop = () => {
      const blob = new Blob(r.pedacos, { type: grav ? grav.tipo : 'video/webm' }); r.guardando = false;
      const s = C.S || {}, m = 20 * 60 + 31 + (s.chapter || 0) * 17 + Math.floor((s.capT || 0) / 20);
      guardarArquivo(blob, `hora-do-silencio-${Math.floor(m / 60) % 24}h${String(m % 60).padStart(2, '0')}.${/mp4/.test(blob.type) ? 'mp4' : 'webm'}`, blob.type);
      if (grav) novoRec(r);
    };
    try { mr.stop(); } catch (e) {}
    C.toast('Susto guardado.');
  }

  // ===================================================================
  // 17. LEVAR A NOITE PARA OUTRO APARELHO (código de texto, sem servidor) E CÓPIAS DE SEGURANÇA DO SAVE
  // ===================================================================
  const BAK = 'hora-silencio-v3-bak';
  function chavesJogo() { const ks = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('hora-silencio') && k !== BAK) ks.push(k); } return ks.sort(); }
  function fnv(t) { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, '0'); }
  const b64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const deB64 = t => { const s = atob(t.replace(/-/g, '+').replace(/_/g, '/')); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; };
  async function comprimir(u8, mod) { const cs = new (mod ? CompressionStream : DecompressionStream)('deflate'); const st = new Blob([u8]).stream().pipeThrough(cs); return new Uint8Array(await new Response(st).arrayBuffer()); }
  async function gerarCodigo() {
    const dados = {}; for (const k of chavesJogo()) dados[k] = localStorage.getItem(k);
    let u8 = new TextEncoder().encode(JSON.stringify({ v: 1, d: dados })), pre = 'HDS1';
    if (window.CompressionStream) { try { u8 = await comprimir(u8, true); pre = 'HDS1z'; } catch (e) {} }
    const corpo = b64(u8); return pre + '.' + corpo + '.' + fnv(corpo);
  }
  async function lerCodigo(txt) {
    const m = String(txt || '').replace(/\s+/g, '').match(/^(HDS1z?)\.([A-Za-z0-9_-]+)\.([0-9a-f]{8})$/);
    if (!m) throw new Error('Esse código não parece ser de A Hora do Silêncio.');
    if (fnv(m[2]) !== m[3]) throw new Error('O código chegou incompleto (faltou um pedaço ao copiar).');
    let u8 = deB64(m[2]); if (m[1] === 'HDS1z') { if (!window.DecompressionStream) throw new Error('Este navegador é antigo demais para abrir esse código.'); u8 = await comprimir(u8, false); }
    const o = JSON.parse(new TextDecoder().decode(u8)); if (!o || o.v !== 1 || !o.d) throw new Error('Código de uma versão desconhecida.');
    return o.d;
  }
  function resumoSave(d) {
    let t = []; try { const sv = JSON.parse(d[C.SAVE_KEY] || 'null'); if (sv && R.capitulos[sv.chapter]) t.push('noite salva em ' + R.capitulos[sv.chapter].titulo); } catch (e) {}
    try { const cq = JSON.parse(d[C.CONQ_KEY] || 'null'); if (cq) t.push(Object.keys(cq).length + ' conquistas'); } catch (e) {}
    try { const cp = JSON.parse(d[C.CAPS_KEY] || 'null'); if (cp) t.push(Object.keys(cp).length + ' capítulos com rank'); } catch (e) {}
    return t.join(' · ') || Object.keys(d).length + ' registros';
  }
  function montarSalvamento(wrap) {
    const sec = document.createElement('div'); sec.id = 'pl-salvar';
    sec.innerHTML = `<h3>Levar a noite para outro aparelho</h3><p class="pl-nota">Gera um código com o seu progresso, conquistas, acervo e opções. Cole no outro aparelho. Nada passa por servidor.</p>
    <div class="op-bts"><button class="btn" id="ps-copiar">Copiar minha noite</button><button class="btn" id="ps-baixar">Baixar como arquivo</button><button class="btn" id="ps-colar">Colar uma noite</button><button class="btn" id="ps-abrir">Abrir arquivo</button></div>
    <div id="ps-caixa" hidden><textarea id="ps-txt" rows="3" placeholder="cole aqui o código HDS1..." spellcheck="false"></textarea><div id="ps-msg"></div><div class="op-bts"><button class="btn" id="ps-ok">Trazer esta noite</button><button class="btn" id="ps-cancelar">Cancelar</button></div></div>
    <input type="file" id="ps-arq" accept=".txt,text/plain" hidden>`;
    wrap.appendChild(sec);
    const msg = t => { $('#ps-msg').textContent = t; };
    $('#ps-copiar').onclick = async () => { const c = await gerarCodigo(); U.feedback($('#ps-copiar'), await U.copiar(c) ? 'Copiado. Cole no outro aparelho.' : 'Não deu para copiar.'); };
    $('#ps-baixar').onclick = async () => { const c = await gerarCodigo(); guardarArquivo(new Blob([c], { type: 'text/plain' }), 'hora-do-silencio-minha-noite.txt', 'text/plain'); };
    $('#ps-colar').onclick = () => { $('#ps-caixa').hidden = false; $('#ps-txt').value = ''; msg(''); pend = null; $('#ps-txt').focus(); };
    $('#ps-abrir').onclick = () => $('#ps-arq').click();
    $('#ps-arq').onchange = async e => { const f = e.target.files[0]; if (!f) return; $('#ps-caixa').hidden = false; $('#ps-txt').value = (await f.text()).trim(); verificar(); };
    $('#ps-cancelar').onclick = () => { $('#ps-caixa').hidden = true; pend = null; };
    let pend = null;
    const verificar = async () => { try { pend = await lerCodigo($('#ps-txt').value); msg('Código bom: ' + resumoSave(pend) + '. Isso vai substituir o progresso deste aparelho.'); $('#ps-ok').disabled = false; } catch (er) { pend = null; msg(er.message); $('#ps-ok').disabled = true; } };
    $('#ps-txt').addEventListener('input', verificar);
    $('#ps-ok').onclick = () => {
      if (!pend) return;
      try { guardarBak(); for (const k of chavesJogo()) if (!(k in pend)) localStorage.removeItem(k); for (const k in pend) localStorage.setItem(k, pend[k]); } catch (er) { msg('Não coube no armazenamento do navegador.'); return; }
      msg('Pronto. Recarregando o internato...'); setTimeout(() => location.reload(), 900);
    };
  }
  function lerBak() { try { return JSON.parse(localStorage.getItem(BAK)) || []; } catch (e) { return []; } }
  function guardarBak() {
    const atual = localStorage.getItem(C.SAVE_KEY); if (!atual) return;
    try { JSON.parse(atual); } catch (e) { return; }
    const l = lerBak(); if (l[0] === atual) return;
    l.unshift(atual); try { localStorage.setItem(BAK, JSON.stringify(l.slice(0, 3))); } catch (e) {}
  }
  let bakT = 0;
  function bakFrame(dt) { bakT -= dt; if (bakT > 0) return; bakT = 5; guardarBak(); }
  function recuperarSave() {
    const atual = localStorage.getItem(C.SAVE_KEY); if (atual == null) return;
    try { JSON.parse(atual); return; } catch (e) {}
    const l = lerBak(); const bom = l.find(t => { try { JSON.parse(t); return true; } catch (e) { return false; } });
    if (!bom) return;
    try { localStorage.setItem(C.SAVE_KEY, bom); } catch (e) { return; }
    const b = $('#b-cont'); if (b) b.hidden = false;
    U.aviso('O save desta noite tinha se estragado. Recuperamos a sua noite do ponto anterior.');
  }

  // ===================================================================
  // 18. PERFIS PRONTOS
  // ===================================================================
  const PERFIS = {
    escola: { nome: 'Notebook da escola', o: { qual: 'baixa', lim30: true, menuLeve: true, resDin: true, giroTec: true, arrastar: false } },
    fraco: { nome: 'Notebook fraco', o: { qual: 'minima', lim30: true, menuLeve: true, resDin: true } },
    celular: { nome: 'Celular', o: { qual: 'media', tqTam: 'g', tqLimpo: true, sacudir: true, vibrar: true } },
    gravar: { nome: 'Para gravar', o: { fps: false, avisoVisual: false, clipe: true, menuLeve: false } },
    medo: { nome: 'Medo máximo', o: { indic: false, avisoVisual: false, fone: true, bob: true, tremor: 1, tqLimpo: true } }
  };
  const NOMES_OP = { qual: 'qualidade', lim30: 'limite de 30 quadros', menuLeve: 'menus leves', resDin: 'resolução automática', giroTec: 'girar pelo teclado', arrastar: 'modo arrastar', tqTam: 'tamanho dos botões', tqLimpo: 'tela limpa', sacudir: 'sacudir o celular', vibrar: 'vibração', fps: 'contador de quadros', avisoVisual: 'aviso visual', clipe: 'gravador de sustos', indic: 'indicador de perigo', fone: 'som de fone', bob: 'balanço', tremor: 'tremor' };
  let desfazer = null;
  function montarPerfis(wrap) {
    const d = document.createElement('div'); d.id = 'pl-perfis';
    d.innerHTML = '<h3>Perfis prontos</h3><div class="op-bts">' + Object.entries(PERFIS).map(([k, p]) => `<button class="btn" data-perfil="${k}">${p.nome}</button>`).join('') + '</div><div id="pp-mudou"></div>';
    const g = wrap.querySelector(':scope > .op-grade'); wrap.insertBefore(d, g);
    d.querySelectorAll('[data-perfil]').forEach(b => b.onclick = () => aplicarPerfil(b.dataset.perfil));
  }
  function aplicarPerfil(k) {
    const p = PERFIS[k]; desfazer = {}; const mud = [];
    for (const [id, v] of Object.entries(p.o)) { if (O[id] !== v) { desfazer[id] = O[id]; O[id] = v; mud.push(NOMES_OP[id] || id); } }
    U.salvar(); U.aplicarOpcoes(); mapaTeclas();
    const el = $('#pp-mudou'); el.innerHTML = mud.length ? `${p.nome}: mudou ${mud.join(', ')}. <button class="link-mandar" id="pp-desfazer">desfazer</button>` : `${p.nome}: já estava assim.`;
    const bd = $('#pp-desfazer'); if (bd) bd.onclick = () => { Object.assign(O, desfazer); U.salvar(); U.aplicarOpcoes(); mapaTeclas(); el.textContent = 'Desfeito.'; };
  }

  // ===================================================================
  // 19. SINAIS NO TÍTULO: navegador de aplicativo, iPhone, versão nova, pronto para jogar sem internet
  // ===================================================================
  function avisosTitulo() {
    const t = $('#title'); if (!t) return;
    const ua = navigator.userAgent || '';
    if (/FBAN|FBAV|Instagram|WhatsApp|Line\/|TikTok|; wv\)|Snapchat/i.test(ua) && !$('#pl-embutido')) {
      const d = document.createElement('div'); d.id = 'pl-embutido'; d.className = 'pl-cartao';
      d.innerHTML = '<p>Você abriu o jogo dentro de um aplicativo. Aqui não tem tela cheia nem trava de tela deitada, e o som pode falhar.</p><button class="btn" id="pl-emb-copiar">Copiar o link para abrir no navegador</button><button class="btn" id="pl-emb-fechar">Jogar assim mesmo</button>';
      document.body.appendChild(d);
      $('#pl-emb-copiar').onclick = async () => U.feedback($('#pl-emb-copiar'), await U.copiar(location.origin + location.pathname) ? 'Copiado: cole no Chrome ou no Safari.' : location.origin + location.pathname);
      $('#pl-emb-fechar').onclick = () => d.remove();
    }
    if (ehIOS && !instalado && !$('#pl-ios')) {
      const d = document.createElement('div'); d.id = 'pl-ios'; d.innerHTML = 'No iPhone: toque em <b>Compartilhar</b> <span class="pl-ios-ic">⬆</span> e depois em <b>Adicionar à Tela de Início</b> para jogar em tela cheia.';
      t.appendChild(d);
    }
    if (!$('#pl-offline')) { const d = document.createElement('div'); d.id = 'pl-offline'; d.hidden = true; t.appendChild(d); }
  }
  function swMensagens() {
    if (!('serviceWorker' in navigator) || robo || location.protocol === 'file:') return;
    navigator.serviceWorker.addEventListener('message', ev => {
      const m = ev.data || {}, el = $('#pl-offline'); if (!el) return;
      if (m.tipo === 'status' || m.tipo === 'offline-ok') {
        if (m.ok >= m.total) { el.hidden = false; el.className = 'ok'; el.textContent = '▣ guardado para jogar sem internet'; }
        else { el.hidden = false; el.className = 'falta'; el.innerHTML = `faltam ${m.total - m.ok} arquivos para jogar sem internet <button class="link-mandar" id="pl-off-tentar">guardar agora</button>`; $('#pl-off-tentar').onclick = () => { el.textContent = 'guardando...'; navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage({ tipo: 'guardar' }); }; }
      }
    });
    navigator.serviceWorker.ready.then(reg => {
      const pedir = () => { const sw = navigator.serviceWorker.controller || reg.active; if (sw) sw.postMessage({ tipo: 'status' }); };
      setTimeout(pedir, 2500);
      const nova = () => {
        if ($('#pl-nova')) return;
        const d = document.createElement('div'); d.id = 'pl-nova'; d.className = 'pl-bilhete';
        d.innerHTML = '<p>O internato mudou desde a sua última visita.</p><small>A versão nova vale na próxima vez que abrir.</small> <button class="link-mandar" id="pl-nova-ja">abrir agora</button>';
        ($('#title') || document.body).appendChild(d);
        $('#pl-nova-ja').onclick = () => { if (C.mode === 'jogo' && C.S && !C.S.fim) { d.querySelector('small').textContent = 'Termine ou salve a noite antes: no meio do jogo isso perderia o trecho atual.'; return; } if (reg.waiting) reg.waiting.postMessage({ tipo: 'pular' }); setTimeout(() => location.reload(), 300); };
      };
      if (reg.waiting && navigator.serviceWorker.controller) nova();
      reg.addEventListener('updatefound', () => { const w = reg.installing; if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) nova(); }); });
    }).catch(() => {});
  }

  // ===================================================================
  // 20. VIBRAÇÃO VISUAL (iPhone não vibra) E PEQUENOS SINAIS NA TELA
  // ===================================================================
  let pulsoVisT = 0;
  function pulsoVisual(ms, forca) {
    if (!O.vibrar || !U.toque || navigator.vibrate || U.padAtivo) return;
    const b = document.body; b.style.setProperty('--vib', Math.max(1, Math.round(1 + (forca || .5) * 2)) + 'px');
    b.classList.remove('vib'); void b.offsetWidth; b.classList.add('vib'); clearTimeout(pulsoVisT); pulsoVisT = setTimeout(() => b.classList.remove('vib'), Math.min(500, ms + 80));
  }
  function montarSinais() {
    if (!$('#pl-som')) { const b = document.createElement('button'); b.id = 'pl-som'; b.className = 'btn'; b.hidden = true; b.textContent = '♪ toque aqui para voltar o som'; document.body.appendChild(b); b.onclick = () => { try { C.AC.resume(); } catch (e) {} b.hidden = true; somMudoT = 0; }; }
    if (!$('#pl-ritmo')) { const r = document.createElement('div'); r.id = 'pl-ritmo'; r.hidden = true; document.body.appendChild(r); }
    if (!$('#pl-vhs')) { const v = document.createElement('div'); v.id = 'pl-vhs'; v.className = 'fx'; document.body.appendChild(v); }
    if (!$('#pl-auto')) { const a = document.createElement('div'); a.id = 'pl-auto'; a.hidden = true; a.textContent = '▸▸'; document.body.appendChild(a); }
  }
  function sinaisFrame() {
    const r = $('#pl-ritmo'); if (r) { const k = +O.ritmo || 1, on = k < 1 && C.mode === 'jogo' && !!C.S; if (r.hidden === on) r.hidden = !on; if (on) r.textContent = '◷ ' + Math.round(k * 100) + '%'; }
    document.body.classList.toggle('q-minima', U.qual() === 'minima');
  }

  // ===================================================================
  // PAUSA: Fotografar e a plateia
  // ===================================================================
  function montarPausa() {
    const ref = $('#p-opcoes') || $('#p-menu'); if (!ref) return;
    const f = document.createElement('button'); f.className = 'btn'; f.id = 'p-fotografar'; f.textContent = 'Fotografar'; // revisão do lote 3: era 'p-foto', o mesmo id da polaroide da pausa f.onclick = entrarFoto; ref.before(f);
    if (canal) {
      const w = document.createElement('div'); w.id = 'p-plateia'; w.className = 'pl-linha';
      w.innerHTML = '<button class="btn" id="p-plat-abrir">Abrir visão da plateia</button><label>a plateia <select id="p-plat-modo"><option value="atrapalha">atrapalha</option><option value="ajuda">ajuda</option></select></label>';
      ref.before(w);
      $('#p-plat-abrir').onclick = abrirPlateia;
      const s = $('#p-plat-modo'); s.value = O.plateiaModo || 'atrapalha'; s.onchange = () => { O.plateiaModo = s.value; U.salvar(); };
    }
    if (!$('#dt-clipe') && $('#dt-menu')) { const c = document.createElement('button'); c.className = 'btn'; c.id = 'dt-clipe'; c.textContent = 'Salvar o susto'; c.hidden = true; $('#dt-menu').before(c); c.onclick = salvarClipe; }
  }

  // ===================================================================
  // INSTALAÇÃO
  // ===================================================================
  mapaTeclas();
  montarEmergencia(); montarSinais(); montarNota(); montarCofre(); montarPausa(); avisosTitulo(); swMensagens(); textoGirar();
  for (const id of ['#b-novo', '#b-cont']) { const b = $(id); if (b) b.addEventListener('click', telaCheiaAoJogar, true); }
  const amj = $('#am-jogar'); if (amj) amj.addEventListener('click', () => { if (O.giro || O.sacudir) pedirMovimento(); });
  if (!robo) recuperarSave();
  if (O.giro || O.sacudir) ouvirMovimento();
  setTimeout(vibrarContagem, 0);
  if (plateia) { if (canal) montarPlateia(); }
  else detectarSoftware();
  let ultimoAntes = 0;

  return {
    plateia,
    get foto() { return !!foto; },
    get emerg() { return emerg; },
    pulsoVisual, montarToque, rendNome: () => rendNome,
    poolInfo() { return poolAtivo ? `luzes ${pool.filter(s => s.l.visible && s.src).length}/${fontes.length}` : ''; },
    setCorte(n) { poolCorte = n >= 2 ? 2 : 0; poolTamanho(); },
    pular() { return plateia; },
    semTrava() { return !!O.arrastar && !U.toque; },
    travaOpcoes() { return O.mouseCru ? { unadjustedMovement: true } : null; },
    opcoes(id) {
      if (!id || id === 'giroTec') { mapaTeclas(); for (const k in pressGiro) pressGiro[k] = false; }
      if (!id || id === 'qual') poolTamanho();
      if (id === 'giro' || id === 'sacudir') { if (O[id]) pedirMovimento(); }
      if (id === 'arrastar' && O.arrastar) { try { if (document.pointerLockElement) document.exitPointerLock(); } catch (e) {} }
      if (id === 'clipe' && !O.clipe) pararGravador();
      listaTeclas();
    },
    montarOpcoes(wrap) {
      const fim = wrap.querySelector(':scope > .op-bts');
      montarPerfis(wrap);
      const t = document.createElement('div'); t.id = 'pl-teclas-sec';
      t.innerHTML = '<h3>Teclas</h3><p class="pl-nota">Clique numa ação e aperte a tecla nova. Se ela já estiver em uso, as duas trocam de lugar. P, ESC e F9 (emergência) ficam fixas.</p><div class="op-bts"><button class="btn" data-perfilt="padrao">Voltar ao padrão</button><button class="btn" data-perfilt="canhoto">Canhoto (IJKL)</button></div><div id="pl-teclas"></div>';
      wrap.insertBefore(t, fim);
      t.querySelectorAll('[data-perfilt]').forEach(b => b.onclick = () => { O.teclas = { ...PERFIS_T[b.dataset.perfilt] }; if (b.dataset.perfilt === 'canhoto') O.giroTec = false; U.salvar(); mapaTeclas(); listaTeclas(); U.syncOpcoes(); });
      listaTeclas();
      const sv = document.createElement('div'); wrap.insertBefore(sv, fim); montarSalvamento(sv);
    },
    fecharOpcoes() { capturando = null; },
    antes(dt) {
      // ritmo do mundo (acessibilidade) e proteção contra engasgo: um quadro que travou não conta
      const agora = performance.now(), gap = ultimoAntes ? agora - ultimoAntes : 16; ultimoAntes = agora;
      let k = +O.ritmo || 1;
      if (!robo && gap > 250 && C.mode === 'jogo' && !document.hidden) k = 0;
      giroFrame(dt); autoFrame(); bordaArrastar(dt);
      return k;
    },
    toqueFrame,
    depois(dt, ativo) {
      poolFrame(dt); sombraFrame(); vigiarParados(); fotoFrame(dt); emergFrame(dt); wakeFrame(dt); somFrame(dt); plateiaFrame(dt); gravFrame(); bakFrame(dt); sinaisFrame();
      if (C.mode === 'jogo') voltarCelular();
      const dc = $('#dt-clipe'); if (dc) { const on = !!(O.clipe && grav); if (dc.hidden === on) dc.hidden = !on; }
    },
    mapa() { setTimeout(() => { try { poolMapa(); congelarMapa(); } catch (e) { console.warn(e); } }, 120); },
    teste: { pool, get fontes() { return fontes; }, get poolAtivo() { return poolAtivo; }, get parados() { return parados; }, mapaTeclas, teclaDe, trocarTecla, get porCodigo() { return porCodigo; }, gerarCodigo, lerCodigo, alternarEmergencia, entrarFoto, sairFoto, tirarFoto, rotuloUsar, alternarAuto, get auto() { return auto; } }
  };
}
